@echo off
setlocal

:run
node_modules\.bin\jasmine spec\bottles-spec.js
endlocal
