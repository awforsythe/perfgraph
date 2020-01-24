#pragma once

#include "CoreMinimal.h"

struct PERFGRAPH_API FPerfgraphFrameStats
{
	float FrameTime;          // Total frame time in milliseconds, from stat unit
	float GameThreadTime;     // Total game thread (CPU) time in milliseconds, from stat unit
	float RenderThreadTime;   // Total render thread (CPU) time in milliseconds, from stat unit
	float GPUFrameTime;       // Total GPU time in milliseconds, from stat unit

	float GPUMemory;          // Total used GPU memory in megabytes: sum of all memory stats in STATGROUP_RHI

	float NumTrianglesDrawn;  // Inclusive average of STATGROUP_RHI:STAT_RHITriangles
	float NumDrawCalls;       // Inclusive average of STATGROUP_RHI:STAT_RHIDrawPrimitiveCalls
	float NumMeshDrawCalls;   // Inclusive average of STATGROUP_SceneRendering:STAT_MeshDrawCalls

	inline FPerfgraphFrameStats()
		: FrameTime(0.0f)
		, GameThreadTime(0.0f)
		, RenderThreadTime(0.0f)
		, GPUFrameTime(0.0f)
		, GPUMemory(0.0f)
		, NumTrianglesDrawn(0.0f)
		, NumDrawCalls(0.0f)
		, NumMeshDrawCalls(0.0f)
	{
	}

	TSharedPtr<class FJsonObject> ToJsonFrame(int32 Number, const FString& Description) const;
};
