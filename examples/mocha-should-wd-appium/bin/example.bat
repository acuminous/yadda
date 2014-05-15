@echo off
setlocal

:check_chromedriver
where chromedriver > nul 2>&1
if not errorlevel 1 goto run
echo Could not find chromedriver
exit /b 1

:run
node_modules\.bin\mocha --reporter spec --timeout 20000 test.js
endlocal