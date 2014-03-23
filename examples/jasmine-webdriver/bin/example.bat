@echo off
setlocal

:run
node_modules\.bin\jasmine-node --verbose spec\bottles-spec.js
endlocal