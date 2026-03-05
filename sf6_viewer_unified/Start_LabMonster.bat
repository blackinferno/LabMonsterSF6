@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%launcher\Start_LabMonster.ps1" %*
if errorlevel 1 (
  echo.
  echo Launcher failed. Opening index.html directly...
  start "" "%SCRIPT_DIR%index.html"
)

endlocal
