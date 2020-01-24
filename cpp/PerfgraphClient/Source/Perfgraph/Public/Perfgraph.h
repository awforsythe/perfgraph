#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleInterface.h"

class FPerfgraph : public IModuleInterface
{
public:
	DECLARE_DELEGATE_OneParam(FOnSessionStarted, bool);

	static inline FPerfgraph& Get()
	{
		return FModuleManager::LoadModuleChecked<FPerfgraph>("Perfgraph");
	}

	static inline bool IsAvailable()
	{
		return FModuleManager::Get().IsModuleLoaded("Perfgraph");
	}

	virtual void StartupModule() override;

	bool PERFGRAPH_API IsPerfgraphSession() const;

	void PERFGRAPH_API StartSession(const FOnSessionStarted& SessionStartedDelegate);
	void PERFGRAPH_API CaptureFrame(int32 Number, const FString& Description, const struct FPerfgraphFrameStats& Stats);
};
