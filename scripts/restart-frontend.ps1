param(
    [string]$BindHost = "127.0.0.1",
    [int]$Port = 3009,
    [int]$TimeoutSeconds = 45
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $projectRoot "frontend"
$url = "http://${BindHost}:${Port}/"
$logDirectory = Join-Path ([System.IO.Path]::GetTempPath()) "vezha-digital"
$stdoutLog = Join-Path $logDirectory "frontend-${Port}.out.log"
$stderrLog = Join-Path $logDirectory "frontend-${Port}.err.log"

function Get-FrontendListener {
    @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Stop-ExistingFrontend {
    $listeners = Get-FrontendListener

    foreach ($listener in $listeners) {
        $ownerPid = [int]$listener.OwningProcess
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerPid" -ErrorAction SilentlyContinue

        if ($null -eq $process) {
            continue
        }

        $commandLine = [string]$process.CommandLine
        $isNode = $process.Name -match "^node(?:\.exe)?$"
        $isNuxt = $commandLine -match "nuxt|nuxi|vezha\.digital"

        if (-not ($isNode -or $isNuxt)) {
            throw "Port $Port is used by an unrelated process: $($process.Name) (PID $ownerPid)."
        }

        Stop-Process -Id $ownerPid -Force
    }

    $deadline = [DateTime]::UtcNow.AddSeconds(8)
    while ((Get-FrontendListener).Count -gt 0 -and [DateTime]::UtcNow -lt $deadline) {
        Start-Sleep -Milliseconds 100
    }

    if ((Get-FrontendListener).Count -gt 0) {
        throw "Port $Port did not become available."
    }
}

function Show-StartupLogs {
    foreach ($log in @($stdoutLog, $stderrLog)) {
        if (Test-Path -LiteralPath $log) {
            Write-Host "`n--- $log ---"
            Get-Content -LiteralPath $log -Tail 35
        }
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $frontendRoot "package.json"))) {
    throw "Frontend package.json was not found at $frontendRoot."
}

Stop-ExistingFrontend

New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
Remove-Item -LiteralPath $stdoutLog, $stderrLog -Force -ErrorAction SilentlyContinue

$null = Get-Command npm.cmd -ErrorAction Stop
$serverCommand = "npm.cmd run dev -- --host $BindHost --port $Port 1>`"$stdoutLog`" 2>`"$stderrLog`""
$launcher = Start-Process `
    -FilePath $env:ComSpec `
    -ArgumentList @("/d", "/s", "/c", $serverCommand) `
    -WorkingDirectory $frontendRoot `
    -WindowStyle Hidden `
    -PassThru

$ready = $false
$deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)

while ([DateTime]::UtcNow -lt $deadline) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
            $ready = $true
            break
        }
    }
    catch {
        Start-Sleep -Milliseconds 250
    }
}

if (-not $ready) {
    if (-not $launcher.HasExited) {
        Stop-Process -Id $launcher.Id -Force -ErrorAction SilentlyContinue
    }

    Show-StartupLogs
    throw "Frontend did not become ready at $url within $TimeoutSeconds seconds."
}

$listener = Get-FrontendListener | Select-Object -First 1
$listenerPid = if ($null -ne $listener) { [int]$listener.OwningProcess } else { $launcher.Id }

Write-Output "Frontend ready: $url (PID $listenerPid)"
