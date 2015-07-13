@echo off
setlocal

:run
node_modules\.bin\jasmine --verbose spec\bottles-spec.js
endlocal