param([switch]$InstallBrowser)

. (Join-Path $PSScriptRoot 'common.ps1')
$previousPhpBinary = $env:PHP_BINARY
Push-Location (Join-Path $projectRoot 'frontend')
try {
    $env:PHP_BINARY = $php
    $playwright = Join-Path (Get-Location) 'node_modules\.bin\playwright.cmd'
    if (-not (Test-Path -LiteralPath $playwright)) {
        throw 'Faltan dependencias. Ejecuta ./scripts/install.ps1 desde la raíz.'
    }
    if ($InstallBrowser) {
        Invoke-Checked $playwright @('install', 'chromium')
    }
    Invoke-Checked 'npm.cmd' @('run', 'e2e')
} finally {
    $env:PHP_BINARY = $previousPhpBinary
    Pop-Location
}
