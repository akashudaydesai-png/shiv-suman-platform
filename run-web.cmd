@echo off
setlocal
cd /d "%~dp0"
if not exist "logs" mkdir "logs"
echo Starting web at %date% %time% > "logs\web.out.log"
"C:\Program Files\nodejs\npm.cmd" run dev --workspace @shiv-suman/web -- --hostname 127.0.0.1 --port 3000 >> "logs\web.out.log" 2> "logs\web.err.log"
endlocal
