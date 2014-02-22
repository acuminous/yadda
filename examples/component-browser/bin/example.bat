@echo off
setlocal

:check_choice
where choice > nul 2>&1
if not errorlevel 1 goto check_taskkill
echo Could not find choice
exit /b 1

:check_taskkill
where taskkill > nul 2>&1
if not errorlevel 1 goto run
echo Could not find taskkill
exit /b 1

:run
start node_modules\.bin\http-server
choice /t 1 /d y > nul
start http://localhost:8080
choice /t 1 /d y > nul

endlocal