@echo off
set "ELF=%~1"
set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%..\runner"
call cargo build
if %ERRORLEVEL% neq 0 (
    echo ERROR: cargo build failed >&2
    popd
    exit /b 1
)
for /F "delims=" %%i in ('cd') do set "RUNNER_DIR=%%i"
popd

REM Workspace target dir is at the root level
set "ROOT_DIR=%SCRIPT_DIR%.."
set "RUNNER_EXE=%ROOT_DIR%\target\debug\runner.exe"
if not exist "%RUNNER_EXE%" (
    echo ERROR: runner.exe not found at "%RUNNER_EXE%" >&2
    exit /b 1
)

"%RUNNER_EXE%" "%ELF%"
exit /b %ERRORLEVEL%
