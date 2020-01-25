#include "PerfgraphStatics.h"

#include "Engine/World.h"
#include "Engine/LocalPlayer.h"
#include "Engine/GameViewportClient.h"
#include "GameFramework/PlayerController.h"
#include "Stats/StatsData.h"
#include "LatentActions.h"

#include "Log.h"
#include "Perfgraph.h"
#include "PerfgraphFrameStats.h"

bool UPerfgraphStatics::IsPerfgraphSession()
{
	return FPerfgraph::Get().IsPerfgraphSession();
}

void UPerfgraphStatics::BeginPerfgraphCapture(UObject* WorldContextObject, FLatentActionInfo LatentInfo)
{
	class FAwaitSessionStartedAction : public FPendingLatentAction
	{
	public:
		float TimeElapsed;
		FName ExecutionFunction;
		int32 OutputLink;
		FWeakObjectPtr CallbackTarget;
		bool bDelegateFired;

		FAwaitSessionStartedAction(const FLatentActionInfo& InLatentInfo)
			: TimeElapsed(0.0f)
			, ExecutionFunction(InLatentInfo.ExecutionFunction)
			, OutputLink(InLatentInfo.Linkage)
			, CallbackTarget(InLatentInfo.CallbackTarget)
			, bDelegateFired(false)
		{
		}

		void OnSessionStarted(bool bSuccessful)
		{
			if (!bSuccessful)
			{
				UE_LOG(LogPerfgraph, Error, TEXT("Failed to start session: captured profiling data will not be recorded in perfgraph"));
			}
			bDelegateFired = true;
		}

		virtual void UpdateOperation(FLatentResponse& Response) override
		{
			TimeElapsed += Response.ElapsedTime();
			Response.FinishAndTriggerIf(bDelegateFired, ExecutionFunction, OutputLink, CallbackTarget);
		}

#if WITH_EDITOR
		virtual FString GetDescription() const override
		{
			return FString::Printf(TEXT("Waiting for perfgraph session to start (%0.3f seconds elapsed)..."), TimeElapsed);
		}
#endif
	};

	UWorld* World = WorldContextObject ? WorldContextObject->GetWorld() : nullptr;
	if (World)
	{
		FLatentActionManager& LatentActionManager = World->GetLatentActionManager();
		if (LatentActionManager.FindExistingAction<FAwaitSessionStartedAction>(LatentInfo.CallbackTarget, LatentInfo.UUID) == nullptr)
		{
			FAwaitSessionStartedAction* Action = new FAwaitSessionStartedAction(LatentInfo);
			LatentActionManager.AddNewAction(LatentInfo.CallbackTarget, LatentInfo.UUID, Action);
			FPerfgraph::Get().StartSession(FPerfgraph::FOnSessionStarted::CreateRaw(Action, &FAwaitSessionStartedAction::OnSessionStarted));

			if (APlayerController* Controller = World->GetFirstPlayerController())
			{
				Controller->ConsoleCommand(TEXT("stat none"), false);
				Controller->ConsoleCommand(TEXT("stat raw"), false);
				Controller->ConsoleCommand(TEXT("stat rhi -nodisplay"), false);
				Controller->ConsoleCommand(TEXT("stat scenerendering -nodisplay"), false);
			}
		}
	}
}

void UPerfgraphStatics::CapturePerfgraphFrame(UObject* WorldContextObject, int32 Number, const FString& Description)
{
	FPerfgraphFrameStats Stats;

	UWorld* World = WorldContextObject ? WorldContextObject->GetWorld() : nullptr;
	APlayerController* Controller = World ? World->GetFirstPlayerController() : nullptr;
	ULocalPlayer* LocalPlayer = Controller ? Controller->GetLocalPlayer() : nullptr;
	if (LocalPlayer && LocalPlayer->ViewportClient)
	{
		FStatUnitData* StatUnitData = LocalPlayer->ViewportClient->GetStatUnitData();
		if (StatUnitData)
		{
#if !UE_BUILD_SHIPPING
			const int32 SampleCount = 60;
			static_assert(SampleCount > 0, "stat unit sample count must be positive");
			static_assert(SampleCount <= FStatUnitData::NumberOfSamples, "stat unit sample count must not exceed FStatUnitData::NumberOfSamples");

			float FrameTimeSum = 0.0f;
			float GameThreadTimeSum = 0.0f;
			float RenderThreadTimeSum = 0.0f;
			float GPUFrameTimeSum = 0.0f;
			for (int32 LogicalIndex = StatUnitData->CurrentIndex - SampleCount; LogicalIndex < StatUnitData->CurrentIndex; LogicalIndex++)
			{
				const int32 ActualIndex = LogicalIndex < 0 ? (LogicalIndex + SampleCount) : LogicalIndex;
				FrameTimeSum += StatUnitData->FrameTimes[ActualIndex];
				GameThreadTimeSum += StatUnitData->GameThreadTimes[ActualIndex];
				RenderThreadTimeSum += StatUnitData->RenderThreadTimes[ActualIndex];
				GPUFrameTimeSum += StatUnitData->GPUFrameTimes[ActualIndex];

			}

			Stats.FrameTime = FrameTimeSum / SampleCount;
			Stats.GameThreadTime = GameThreadTimeSum / SampleCount;
			Stats.RenderThreadTime = RenderThreadTimeSum / SampleCount;
			Stats.GPUFrameTime = GPUFrameTimeSum / SampleCount;
#else
			Stats.FrameTime = StatUnitData->FrameTime;
			Stats.GameThreadTime = StatUnitData->GameThreadTime;
			Stats.RenderThreadTime = StatUnitData->RenderThreadTime;
			Stats.GPUFrameTime = StatUnitData->GPUFrameTime;
#endif
		}
	}

#if STATS
	if (FGameThreadStatsData* StatsData = FLatestGameThreadStatsData::Get().Latest)
	{
		const int32 NumGroups = FMath::Min(StatsData->GroupNames.Num(), StatsData->ActiveStatGroups.Num());
		for (int32 GroupIndex = 0; GroupIndex < NumGroups; GroupIndex++)
		{
			const FName& GroupName = StatsData->GroupNames[GroupIndex];
			const FActiveStatGroupInfo& GroupInfo = StatsData->ActiveStatGroups[GroupIndex];

			if (GroupName == TEXT("STATGROUP_RHI"))
			{
				ParseRHI(GroupInfo, Stats);
			}
			else if (GroupName == TEXT("STATGROUP_SceneRendering"))
			{
				ParseSceneRendering(GroupInfo, Stats);
			}
		}
	}
#endif

	FPerfgraph::Get().CaptureFrame(Number, Description, Stats);
}

void UPerfgraphStatics::EndPerfgraphCapture(UObject* WorldContextObject)
{
	UWorld* World = WorldContextObject ? WorldContextObject->GetWorld() : nullptr;
	if (World)
	{
		if (APlayerController* Controller = World->GetFirstPlayerController())
		{
			Controller->ConsoleCommand(TEXT("stat none"), false);
		}
	}
}

void UPerfgraphStatics::ParseRHI(const FActiveStatGroupInfo& GroupInfo, FPerfgraphFrameStats& OutStats)
{
#if STATS
	for (const FComplexStatMessage& Stat : GroupInfo.MemoryAggregate)
	{
		OutStats.GPUMemory += static_cast<float>(Stat.GetValue_double(EComplexStatField::IncMax) / (1024.0 * 1024.0));
	}

	for (const FComplexStatMessage& Stat : GroupInfo.CountersAggregate)
	{
		const FName StatName = Stat.NameAndInfo.GetShortName();
		if (StatName == TEXT("STAT_RHITriangles"))
		{
			OutStats.NumTrianglesDrawn = Stat.GetValue_double(EComplexStatField::IncAve);
		}
		else if (StatName == TEXT("STAT_RHIDrawPrimitiveCalls"))
		{
			OutStats.NumDrawCalls = Stat.GetValue_double(EComplexStatField::IncAve);
		}
	}
#endif
}

void UPerfgraphStatics::ParseSceneRendering(const FActiveStatGroupInfo& GroupInfo, FPerfgraphFrameStats& OutStats)
{
#if STATS
	for (const FComplexStatMessage& Stat : GroupInfo.CountersAggregate)
	{
		if (Stat.NameAndInfo.GetShortName() == TEXT("STAT_MeshDrawCalls"))
		{
			OutStats.NumMeshDrawCalls = Stat.GetValue_double(EComplexStatField::IncAve);
			break;
		}
	}
#endif
}
