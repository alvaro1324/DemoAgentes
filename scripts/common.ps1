$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$localPhp = Join-Path $projectRoot '.tools\php\php.exe'
if (Test-Path -LiteralPath $localPhp) { $php = $localPhp }
elseif (Get-Command php -ErrorAction SilentlyContinue) { $php = (Get-Command php).Source }
else { throw 'PHP no disponible. Ejecuta ./scripts/setup-tools.ps1 o instala PHP 8.4.' }

function Invoke-Checked {
    param([string]$Executable, [string[]]$Arguments)
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Falló $Executable (código $LASTEXITCODE)." }
}
