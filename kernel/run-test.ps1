param([Parameter(Mandatory=$true)][string]$ElfPath, [string[]]$ExtraArgs)

$runnerDir = Split-Path -Parent $PSScriptRoot | Join-Path -ChildPath "runner"
$runnerTarget = Join-Path $runnerDir "target"
$runnerExe = Join-Path $runnerDir "target" "debug" "runner.exe"

# Build runner for host if not already built
if (-not (Test-Path $runnerExe)) {
    Push-Location $runnerDir
    cargo build 2>&1 | Out-Null
    Pop-Location
}

& $runnerExe $ElfPath $ExtraArgs
exit $LASTEXITCODE
