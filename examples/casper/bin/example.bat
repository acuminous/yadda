@echo off
setlocal

:check_python
where python > nul 2>&1
if not errorlevel 1 goto check_phantomjs
echo Could not find python
exit /b 1

:check_phantomjs
where phantomjs > nul 2>&1
if not errorlevel 1 goto check_casperjs
echo Could not find phantomjs
exit /b 1

:check_casperjs
where casperjs > nul 2>&1
if not errorlevel 1 goto run
echo Could not find casperjs
exit /b 1

:run
casperjs test test.js
endlocal