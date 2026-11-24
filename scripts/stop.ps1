$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $projectRoot '.runtime\servers.json'
if (-not (Test-Path $statePath)) { Write-Output 'No hay servidores registrados.'; return }
foreach ($server in (Get-Content $statePath -Raw | ConvertFrom-Json)) {
    $running = Get-Process -Id $server.id -ErrorAction SilentlyContinue
    if ($running -and $running.StartTime.ToUniversalTime().ToString('o') -eq $server.startedAt) {
        Stop-Process -Id $server.id
    }
}
Remove-Item -LiteralPath $statePath
Write-Output 'Servidores del proyecto detenidos.'
