$ErrorActionPreference = 'Stop'
if (-not (Test-Path (Join-Path $PSScriptRoot '..\.tools\php\php.exe'))) {
    & (Join-Path $PSScriptRoot 'setup-tools.ps1')
}
. (Join-Path $PSScriptRoot 'common.ps1')
$env:Path = (Split-Path $php) + ';' + $env:Path
Push-Location (Join-Path $projectRoot 'backend')
try {
    Invoke-Checked $php @((Join-Path $projectRoot '.tools\composer.phar'), 'install', '--no-interaction', '--prefer-dist')
    Invoke-Checked $php @('bin/console', 'doctrine:migrations:migrate', '--no-interaction')
} finally { Pop-Location }
Push-Location (Join-Path $projectRoot 'frontend')
try { Invoke-Checked 'npm.cmd' @('ci', '--no-fund') } finally { Pop-Location }
