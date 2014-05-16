@echo off
setlocal

:check_appium
where appium > nul 2>&1
if not errorlevel 1 goto run
echo Could not find appium
exit /b 1

:run
node_modules\.bin\mocha --reporter spec --timeout 0 test.js
endlocal
