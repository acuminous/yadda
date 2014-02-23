@echo off
setlocal

:run
node_modules\.bin\nodeunit test.js
endlocal