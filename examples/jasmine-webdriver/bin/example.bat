@echo off
setlocal

:run
node_modules\.bin\jasmine-node --verbose spec\google-spec.js
endlocal