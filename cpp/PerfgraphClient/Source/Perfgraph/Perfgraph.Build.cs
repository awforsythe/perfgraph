using UnrealBuildTool;

public class Perfgraph : ModuleRules
{
	public Perfgraph(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		bEnforceIWYU = true;

		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "Http", "Json", "JsonUtilities" });
	}
}
