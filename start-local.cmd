@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"
if not exist "%ROOT%logs" mkdir "%ROOT%logs"

echo Starting Shiv Suman local servers...
echo.
echo API will run on http://127.0.0.1:4000
echo Web will run on http://127.0.0.1:3000
echo.
echo Keep both command windows open while testing.
echo.

start "Shiv Suman API" /D "%ROOT%" cmd /c "%ROOT%run-api.cmd"
timeout /t 5 /nobreak >nul
start "Shiv Suman Web" /D "%ROOT%" cmd /c "%ROOT%run-web.cmd"

echo Started. Open http://127.0.0.1:3000/login after the web window says ready.
endlocal
