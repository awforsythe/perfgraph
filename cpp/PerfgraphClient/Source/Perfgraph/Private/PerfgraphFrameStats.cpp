#include "PerfgraphFrameStats.h"

#include "JsonObject.h"

TSharedPtr<FJsonObject> FPerfgraphFrameStats::ToJsonFrame(int32 Number, const FString& Description) const
{
	TSharedPtr<FJsonObject> Root = MakeShareable(new FJsonObject());
	Root->SetNumberField(TEXT("number"), Number);
	if (!Description.IsEmpty())
	{
		Root->SetStringField(TEXT("description"), Description);
	}
	Root->SetNumberField(TEXT("frame_time"), FrameTime);
	Root->SetNumberField(TEXT("game_thread_time"), GameThreadTime);
	Root->SetNumberField(TEXT("render_thread_time"), RenderThreadTime);
	Root->SetNumberField(TEXT("gpu_frame_time"), GPUFrameTime);
	Root->SetNumberField(TEXT("gpu_memory"), GPUMemory);
	Root->SetNumberField(TEXT("num_triangles_drawn"), NumTrianglesDrawn);
	Root->SetNumberField(TEXT("num_draw_calls"), NumDrawCalls);
	Root->SetNumberField(TEXT("num_mesh_draw_calls"), NumMeshDrawCalls);
	return Root;
}
