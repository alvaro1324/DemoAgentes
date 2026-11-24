param(
    [switch]$SkipE2E,
    [switch]$InstallBrowser
)

$ErrorActionPreference = 'Stop'
Write-Output 'Comprobando backend...'
& (Join-Path $PSScriptRoot 'test-backend.ps1')
Write-Output 'Comprobando frontend...'
& (Join-Path $PSScriptRoot 'test-frontend.ps1')
if (-not $SkipE2E) {
    Write-Output 'Comprobando el recorrido completo en navegador...'
    & (Join-Path $PSScriptRoot 'test-e2e.ps1') -InstallBrowser:$InstallBrowser
}
Write-Output 'Todas las comprobaciones solicitadas han terminado correctamente.'
