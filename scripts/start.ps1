. (Join-Path $PSScriptRoot 'common.ps1')
$runtime = Join-Path $projectRoot '.runtime'
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
$statePath = Join-Path $runtime 'servers.json'
if (Test-Path $statePath) {
    $servers = Get-Content $statePath -Raw | ConvertFrom-Json
    foreach ($server in $servers) {
        $running = Get-Process -Id $server.id -ErrorAction SilentlyContinue
        if ($running -and $running.StartTime.ToUniversalTime().ToString('o') -eq $server.startedAt) {
            throw 'Ya hay servidores iniciados por este proyecto. Ejecuta ./scripts/stop.ps1 antes de reiniciarlos.'
        }
    }
}
foreach ($port in @(8000, 4200)) {
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
        throw "El puerto $port está ocupado. No se ha detenido ningún proceso ajeno."
    }
}
Push-Location (Join-Path $projectRoot 'backend')
try { Invoke-Checked $php @('bin/console', 'doctrine:migrations:migrate', '--no-interaction') } finally { Pop-Location }
$backendProcess = Start-Process -FilePath $php -ArgumentList @('-S', '127.0.0.1:8000', '-t', 'public', 'public/index.php') -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtime 'backend.out.log') -RedirectStandardError (Join-Path $runtime 'backend.err.log') -PassThru
$node = (Get-Command node).Source
$angularCli = '"' + (Join-Path $projectRoot 'frontend\node_modules\@angular\cli\bin\ng.js') + '"'
try {
    $frontendProcess = Start-Process -FilePath $node -ArgumentList @($angularCli, 'serve', '--host', '127.0.0.1', '--port', '4200', '--proxy-config', 'proxy.conf.json') -WorkingDirectory (Join-Path $projectRoot 'frontend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtime 'frontend.out.log') -RedirectStandardError (Join-Path $runtime 'frontend.err.log') -PassThru
} catch { Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue; throw }
@($backendProcess, $frontendProcess) | ForEach-Object { @{id = $_.Id; startedAt = $_.StartTime.ToUniversalTime().ToString('o')} } | ConvertTo-Json | Set-Content $statePath -Encoding utf8
Write-Output 'Interfaz: http://127.0.0.1:4200 (puede tardar unos segundos en compilar)'
Write-Output 'API: http://127.0.0.1:8000/api/tasks'
Write-Output 'Logs: .runtime/. Para detener: ./scripts/stop.ps1'
