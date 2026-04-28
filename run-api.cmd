@echo off
setlocal
cd /d "%~dp0"
if not exist "logs" mkdir "logs"
echo Starting API at %date% %time% > "logs\api.out.log"
"C:\Program Files\nodejs\npm.cmd" run dev --workspace @shiv-suman/api >> "logs\api.out.log" 2> "logs\api.err.log"
endlocal
