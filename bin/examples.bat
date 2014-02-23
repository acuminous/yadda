@echo off
setlocal

:run
call npm link
pushd examples
for /d %%D in (*.*) do echo Running %%D example & pushd %%D & call npm --loglevel error install & call npm test & popd
popd

endlocal
