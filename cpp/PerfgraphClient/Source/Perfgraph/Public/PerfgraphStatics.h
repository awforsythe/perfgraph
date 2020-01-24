#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"

#include "Engine/LatentActionManager.h"

#include "PerfgraphStatics.generated.h"

UCLASS()
class PERFGRAPH_API UPerfgraphStatics : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintPure, Category="Perfgraph", meta=(WorldContext="WorldContextObject"))
	static bool IsPerfgraphSession();

	UFUNCTION(BlueprintCallable, Category="Perfgraph", meta=(WorldContext="WorldContextObject", Latent, LatentInfo="LatentInfo"))
	static void BeginPerfgraphCapture(UObject* WorldContextObject, FLatentActionInfo LatentInfo);

	UFUNCTION(BlueprintCallable, Category="Perfgraph", meta=(WorldContext="WorldContextObject"))
	static void CapturePerfgraphFrame(UObject* WorldContextObject, int32 Number, const FString& Description);

	UFUNCTION(BlueprintCallable, Category="Perfgraph", meta=(WorldContext="WorldContextObject"))
	static void EndPerfgraphCapture(UObject* WorldContextObject);

private:
	static void ParseRHI(const struct FActiveStatGroupInfo& GroupInfo, struct FPerfgraphFrameStats& OutStats);
	static void ParseSceneRendering(const struct FActiveStatGroupInfo& GroupInfo, struct FPerfgraphFrameStats& OutStats);
};
