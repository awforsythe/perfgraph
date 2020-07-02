#include "Perfgraph.h"
#include "Modules/ModuleManager.h"

#include "Misc/CommandLine.h"
#include "Http.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

#include "Log.h"
#include "PerfgraphFrameStats.h"

namespace
{
	static bool bPerfgraphSession = false; //!< Indicates that this process was launched for the purpose of running an automated profiling session, via -PerfgraphSession
	static FString PerfgraphDescription; //!< An optional string passed at launch to describe the session, e.g. -PerfgraphDescription="reduced texture resolution"
	static FString PerfgraphServerUrl; //<! URL where perfgraph server is running: can be specified at launch, e.g. -PerfgraphServerUrl=http://127.0.0.1:4300

	static int32 CurrentSessionId = 0; //!< ID of the perfgraph session that we're currently capturing frames for
}

void FPerfgraph::StartupModule()
{
	if (FParse::Param(FCommandLine::Get(), TEXT("PerfgraphSession")))
	{
		bPerfgraphSession = true;
		UE_LOG(LogPerfgraph, Log, TEXT("Running with 'PerfgraphSession' flag; this process will be treated as an automated profiling session"));
	}

	if (FParse::Value(FCommandLine::Get(), TEXT("PerfgraphDescription="), PerfgraphDescription) && !PerfgraphDescription.IsEmpty())
	{
		UE_LOG(LogPerfgraph, Log, TEXT("Parsed 'PerfgraphDescription' from launch args: '%s'"), *PerfgraphDescription);
	}

	if (FParse::Value(FCommandLine::Get(), TEXT("PerfgraphServerUrl="), PerfgraphServerUrl) && !PerfgraphServerUrl.IsEmpty())
	{
		UE_LOG(LogPerfgraph, Log, TEXT("Parsed 'PerfgraphServerUrl' from command-line: %s"), *PerfgraphServerUrl);
	}
	else
	{
		PerfgraphServerUrl = TEXT("http://127.0.0.1:4300");
		UE_LOG(LogPerfgraph, Log, TEXT("'PerfgraphServerUrl' not specified at command-line, using default: %s"), *PerfgraphServerUrl);
	}
}

bool FPerfgraph::IsPerfgraphSession() const
{
	return bPerfgraphSession;
}

void FPerfgraph::StartSession(const FOnSessionStarted& SessionStartedDelegate)
{
	// Construct a delegate that'll handle the HTTP response by attempting to parse a JSON object and forwarding to our higher-level delegate
	FHttpRequestCompleteDelegate HttpDelegate;
	HttpDelegate.BindLambda([=](FHttpRequestPtr Req, FHttpResponsePtr Response, bool bConnectedSuccessfully)
	{
		// Get the details of the original request for diagnostics
		check(Req.IsValid());
		const FString& RequestVerb = Req->GetVerb();
		const FString& RequestUrl = Req->GetURL();

		// Fail if the request timed out or the connection was refused
		if (!bConnectedSuccessfully)
		{
			UE_LOG(LogPerfgraph, Warning, TEXT("Unable to complete HTTP %s %s: failed to establish connection"), *RequestVerb, *RequestUrl);
			SessionStartedDelegate.ExecuteIfBound(false);
			return;
		}

		// Try to parse a JSON object from the response: this may be a payload, or it could be error details
		TSharedPtr<FJsonObject> JsonRoot;
		if (Response->GetHeader(TEXT("Content-Type")).StartsWith(TEXT("application/json")))
		{
			UE_LOG(LogPerfgraph, Log, TEXT("content type is json"));
			const FString ResponseStr = Response->GetContentAsString();
			TSharedRef<TJsonReader<>> JsonReader = TJsonReaderFactory<>::Create(ResponseStr);
			FJsonSerializer::Deserialize(JsonReader, JsonRoot);
		}
		else
		{
			UE_LOG(LogPerfgraph, Log, TEXT("not json"));
		}

		// We expect status code 201 to indicate that our new session has been created
		const int32 ResponseCode = Response->GetResponseCode();
		if (ResponseCode != 201)
		{
			FString ErrorMessage;
			if (JsonRoot.IsValid() && JsonRoot->TryGetStringField(TEXT("message"), ErrorMessage))
			{
				UE_LOG(LogPerfgraph, Warning, TEXT("Unable to complete HTTP %s %s: got response %d: %s"), *RequestVerb, *RequestUrl, ResponseCode, *ErrorMessage);
			}
			else
			{
				UE_LOG(LogPerfgraph, Warning, TEXT("Unable to complete HTTP %s %s: got response %d"), *RequestVerb, *RequestUrl, ResponseCode);
			}
			SessionStartedDelegate.ExecuteIfBound(false);
			return;
		}

		// The response must contain a JSON object with an 'id' field identifying our new session
		int32 CreatedSessionId = 0;
		if (!JsonRoot.IsValid() || !JsonRoot->TryGetNumberField(TEXT("id"), CreatedSessionId) || CreatedSessionId <= 0)
		{
			UE_LOG(LogPerfgraph, Warning, TEXT("Failed to create session via HTTP %s %s: response did not specify new session ID"), *RequestVerb, *RequestUrl);
			SessionStartedDelegate.ExecuteIfBound(false);
			return;
		}

		CurrentSessionId = CreatedSessionId;
		UE_LOG(LogPerfgraph, Log, TEXT("Created a new perfgraph session with ID %d"), CurrentSessionId);
		SessionStartedDelegate.ExecuteIfBound(true);
	});

	// If this isn't the first time StartSession has been called for this process, log a warning and clear the old session ID
	UE_LOG(LogPerfgraph, Log, TEXT("Issuing HTTP request to create a new perfgraph session..."));
	if (CurrentSessionId > 0)
	{
		UE_LOG(LogPerfgraph, Warning, TEXT("Previous session ID %d is now forgotten"), CurrentSessionId);
		CurrentSessionId = 0;
	}

	// Prepare and send a POST request to /api/process
	TSharedRef<IHttpRequest> Req = FHttpModule::Get().CreateRequest();
	Req->OnProcessRequestComplete() = HttpDelegate;
	Req->SetURL(PerfgraphServerUrl + FString(TEXT("/api/session")));
	Req->SetVerb(TEXT("POST"));
	if (!PerfgraphDescription.IsEmpty())
	{
		TSharedPtr<FJsonObject> JsonParams = MakeShareable(new FJsonObject());
		JsonParams->SetStringField(TEXT("description"), PerfgraphDescription);

		FString JsonString;
		TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&JsonString);
		if (FJsonSerializer::Serialize(JsonParams.ToSharedRef(), Writer))
		{
			Req->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
			Req->SetContentAsString(JsonString);
		}
	}
	Req->ProcessRequest();
}

void FPerfgraph::CaptureFrame(int32 Number, const FString& Description, const struct FPerfgraphFrameStats& Stats)
{
	// Captured frames must be associated with a perfgraph session: StartSession needs to be called (and its delegate fired) before CaptureFrame is called
	if (CurrentSessionId <= 0)
	{
		UE_LOG(LogPerfgraph, Warning, TEXT("Unable to POST a new frame: session ID has not been initialized"));
		return;
	}

	// Creating a frame is mostly fire-and-forget; we just want check the response and log any errors for visibility
	FHttpRequestCompleteDelegate HttpDelegate;
	HttpDelegate.BindLambda([=](FHttpRequestPtr Req, FHttpResponsePtr Response, bool bConnectedSuccessfully)
	{
		if (!bConnectedSuccessfully)
		{
			UE_LOG(LogPerfgraph, Warning, TEXT("Unable to capture perfgraph frame for session %d: failed to establish connection"), CurrentSessionId);
			return;
		}

		TSharedPtr<FJsonObject> JsonRoot;
		if (Response->GetHeader(TEXT("Content-Type")) == TEXT("application/json"))
		{
			const FString ResponseStr = Response->GetContentAsString();
			TSharedRef<TJsonReader<>> JsonReader = TJsonReaderFactory<>::Create(ResponseStr);
			FJsonSerializer::Deserialize(JsonReader, JsonRoot);
		}

		const int32 ResponseCode = Response->GetResponseCode();
		if (ResponseCode != 201)
		{
			FString ErrorMessage;
			if (JsonRoot.IsValid() && JsonRoot->TryGetStringField(TEXT("message"), ErrorMessage))
			{
				UE_LOG(LogPerfgraph, Warning, TEXT("Unable to capture perfgraph frame for session %d: got response %d: %s"), CurrentSessionId, ResponseCode, *ErrorMessage);
			}
			else
			{
				UE_LOG(LogPerfgraph, Warning, TEXT("Unable to capture perfgraph frame for session %d: got response %d"), CurrentSessionId, ResponseCode);
			}
		}
	});

	// Prepare and send a POST request to /api/process/:id/frame
	UE_LOG(LogPerfgraph, Log, TEXT("Issuing HTTP request to capture stats for session %d, frame number %d: frame %0.2fms / game %0.2fms / render %0.2fms / gpu %0.2fms / gpumem %.0fmb / tris %0.f / draws %0.f / meshdraws %0.f "),
		CurrentSessionId, Number,
		Stats.FrameTime, Stats.GameThreadTime, Stats.RenderThreadTime, Stats.GPUFrameTime, Stats.GPUMemory,
		Stats.NumTrianglesDrawn, Stats.NumDrawCalls, Stats.NumMeshDrawCalls);

	TSharedRef<IHttpRequest> Req = FHttpModule::Get().CreateRequest();
	Req->OnProcessRequestComplete() = HttpDelegate;
	Req->SetURL(FString::Printf(TEXT("%s/api/session/%d/frame"), *PerfgraphServerUrl, CurrentSessionId));
	Req->SetVerb(TEXT("POST"));

	TSharedPtr<FJsonObject> JsonParams = Stats.ToJsonFrame(Number, Description);
	FString JsonString;
	TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&JsonString);
	FJsonSerializer::Serialize(JsonParams.ToSharedRef(), Writer);
	Req->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
	Req->SetContentAsString(JsonString);
	Req->ProcessRequest();
}

IMPLEMENT_GAME_MODULE(FPerfgraph, Perfgraph);
