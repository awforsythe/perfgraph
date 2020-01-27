# perfgraph

**perfgraph** is a profiling tool for Unreal Engine projects.

*Profiling* is a key process in any real-time-rendered project. As you make changes to your game, it's critical that you remain aware of how those changes affect performance. That means frequently testing, measuring, and comparing in-game performance metrics. **perfgraph** supports that process by eliminating as much manual labor as possible, with the goal of making it easier and more accessible to profile changes.

**perfgraph**  is split into two parts: a **server** application and a **client** plugin for Unreal.

### Running the perfgraph server

- Ensure that NodeJS is installed: https://nodejs.org/
- Clone or download this repository
- Run `npm install` to download dependencies
- Run `npm run start` to start the server
- Once running, browse to: http://localhost:4300

Profiling data is stored locally in a SQLite database file called `perfgraph.db`. If you experience problems aftering updating perfgraph, or if you just want to clear all data and start fresh, you can simply delete `perfgraph.db` while the server is not running.

### Integrating the UE4 perfgraph client

- Copy `cpp/PerfgraphClient` into your build as a plugin, e.g. `YourProject/Plugins/PerfgraphClient`
- Enable the plugin in your project (via the Editor, or by adding `{"Name": "PerfgraphClient", "Enabled": true}` to the `"Plugins"` list in your .uproject file)
- Build your project to compile the `Perfgraph` module
- Run the editor: you should now have access to `Perfgraph` functions in the Blueprint Editor
- Add perfgraph hooks: after your game starts up, branch on **`IsPerfgraphSession`**, and if true, call **`BeginPerfgraphCapture`**, then run your profile sequence, and wrap up with **`EndPerfgraphCapture`**
- A typical profile sequence would involve playing back a LevelSequence that cuts between various cameras around the level, with an event track calling **`CapturePerfgraphFrame`** at each of those points
- A captured frame must have a unique number that identifies its chronological position in the sequence, and it can optionally have a human-readable description
- You'd typically want to have your game automatically exit after calling **`EndPerfgraphCapture`**

### Running a perfgraph-enabled profiling session

- Ensure that perfgraph server is running on your machine
- Launch your Unreal project with the `-PerfgraphSession` flag to indicate that it should run the profile sequence you configured previously
- If the perfgraph server is running on a different machine than the game, you can pass a URL as well, e.g. `-PerfgraphServerUrl=http://192.168.0.1:4300`
- You can also add a description to identify what's changed in the build you're testing, e.g. `-PerfgraphDescription="more trees"`
- On Windows, you'd package your game and run `MyProject.exe -PerfgraphSession`, or else run `UE4Editor.exe <path-to-uproject> -game -PerfgraphSession` with editor binaries. To launch on Android, you can run `perfgraph_adb` from the command-line after opening a command prompt in the same directory where you start perfgraph server. (See `perfgraph_adb.bat` for more details).
