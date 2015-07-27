@echo off
setlocal

:run
node_modules/protroctor/.bin/webdriver-manager update
node_modules/protroctor/.bin/webdriver-manager start
endlocal