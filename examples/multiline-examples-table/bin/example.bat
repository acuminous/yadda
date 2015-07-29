@echo off
setlocal

:run
node_modules\.bin\mocha --reporter spec test.js
endlocal