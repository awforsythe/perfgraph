@echo off
rem This example batch script shows how to launch an installed Unreal project
rem on Android with command-line args. It assumes that you have adb installed
rem and accessible in your PATH, and that you only have one Android device
rem connected.
rem
rem The following environment variables can be set for configuration:
rem
rem - PERFGRAPH_UPROJECT_NAME
rem - PERFGRAPH_PACKAGE_NAME
rem - PERFGRAPH_SERVER_URL
rem
rem If not using environment variables, set your Unreal project and package
rem name here, and override the server URL if running perfgraph remotely.
rem
set DEFAULT_UPROJECT_NAME=
set DEFAULT_PACKAGE_NAME=
set DEFAULT_SERVER_URL=http://%COMPUTERNAME%:4300
rem
rem Code past this point shouldn't need to be modified, but be my guest.

rem Read environment variables, falling back on hardcoded values
if "%PERFGRAPH_UPROJECT_NAME%"=="" (set UPROJECT_NAME=%DEFAULT_UPROJECT_NAME%) else (set UPROJECT_NAME=%PERFGRAPH_UPROJECT_NAME%)
if "%PERFGRAPH_PACKAGE_NAME%"=="" (set PACKAGE_NAME=%DEFAULT_PACKAGE_NAME%) else (set PACKAGE_NAME=%PERFGRAPH_PACKAGE_NAME%)
if "%PERFGRAPH_SERVER_URL%"=="" (set SERVER_URL=%DEFAULT_SERVER_URL%) else (set SERVER_URL=%PERFGRAPH_SERVER_URL%)
if "%UPROJECT_NAME%"=="" goto no_uproject_name
if "%PACKAGE_NAME%"=="" goto no_package_name
if "%SERVER_URL%"=="" goto no_server_url

rem On Android, Unreal will read launch args from UE4CommandLine.txt.
set UE4COMMANDLINE_PATH=/storage/emulated/0/UE4Game/%UPROJECT_NAME%/UE4CommandLine.txt
set UPROJECT_RELPATH=../../../%UPROJECT_NAME%/%UPROJECT_NAME%.uproject
set UNREAL_ARGS=-PerfgraphSession -PerfgraphServerUrl=%SERVER_URL%

rem Treat any trailing args as a description to use for the new session.
if "%1"=="" goto no_description
set UNREAL_ARGS=%UNREAL_ARGS% -PerfgraphDescription="%*"
:no_description

rem We could adb shell echo piped into a file, but the necessity of escaping
rem double-quotes through multiple levels of shell indirection becomes a
rem serious occupational hazard at that point, so we'll just write to a temp
rem file locally, then use adb push to copy it to the device, then delete it.
echo %UPROJECT_RELPATH% %UNREAL_ARGS% > perfgraphCommandLine.txt
adb shell mkdir -p /storage/emulated/0/UE4Game/%UPROJECT_NAME%
adb push perfgraphCommandLine.txt %UE4COMMANDLINE_PATH%
del perfgraphCommandLine.txt

rem Show the user what we're doing, then start the main UE4 activity via adb.
echo.
echo START: %PACKAGE_NAME%/com.epicgames.ue4.GameActivity
echo ARGS: %UPROJECT_NAME%.uproject %UNREAL_ARGS%
echo.
adb shell am start -n %PACKAGE_NAME%/com.epicgames.ue4.GameActivity
exit /b %ERRORLEVEL%

:no_uproject_name
echo ERROR: Unreal project name not set. Try:
echo ^> set PERFGRAPH_UPROJECT_NAME=MyProject
echo ...or edit DEFAULT_UPROJECT_NAME in this .bat file.
exit /b 1

:no_package_name
echo ERROR: Android package name not set. Try:
echo ^> set PERFGRAPH_PACKAGE_NAME=com.mycompany.myproject
echo ...or edit DEFAULT_PACKAGE_NAME in this .bat file.
exit /b 1

:no_server_url
echo ERROR: perfgraph server URL not set. Try:
echo ^> set PERFGRAPH_SERVER_URL=http://192.168.0.1:4300
echo ...or edit DEFAULT_SERVER_URL in this .bat file.
exit /b 1
