## Running the perfgraph server

- Ensure that NodeJS is installed: https://nodejs.org/
- Clone or download this repository
- Run `npm install` to download dependencies
- Run `npm run start` to start the server
- Once running, browse to: http://localhost:4300

Profiling data is stored locally in a SQLite database file called `perfgraph.db`. If you experience problems aftering updating perfgraph, or if you just want to clear all data and start fresh, you can simply delete `perfgraph.db` while the server is not running.

## Integrating the UE4 perfgraph client

- Copy `cpp/PerfgraphClient` into your build as a plugin, e.g. `YourProject/Plugins/PerfgraphClient`
- Enable the plugin in your project (via the UI, or by adding `{"Name": "PerfgraphClient", "Enabled": true}` to the `"Plugins"` list in your .uproject file)
- Build your project to commpile the Perfgraph module
- Run the editor: you should now have access to Perfgraph functions in the Blueprint Editor
- Add perfgraph hooks: after your game starts up, branch on **IsPerfgraphSession**, and if true, call **BeginPerfgraphCapture**, then run your profile sequence, and wrap up with **EndPerfgraphCapture**
- A typical profile sequence would involve playing back a LevelSequence that cuts between various cameras around the level, with an event track calling **CapturePerfgraphFrame** at each of those points
- A captured frame must have a unique number that identifies its chronological position in the sequence, and it can optionally have a human-readable description
- You'd typically want to have your game automatically exit after calling **EndPerfgraphCapture**

Once the server is running and the client plugin is integrated with your Unreal project, run your game with the `-PerfgraphSession` command-line argument to start profiling. You can also use `-PerfgraphDescription` to provide some context for the session, along with `-PerfgraphServerUrl` to specify the address. For example, if you're profiling an Android build that has a reduced number of lights, and you have the perfgraph server running on your workstation, launch the game on Android with `-PerfgraphSession -PerfgraphDescription="fewer lights" -PerfgraphServerUrl=http://<your-ip-address>:4300`.
