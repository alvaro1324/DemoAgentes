. (Join-Path $PSScriptRoot 'common.ps1')
Push-Location (Join-Path $projectRoot 'backend')
try {
    Invoke-Checked $php @('bin/console', 'lint:yaml', 'config')
    Invoke-Checked $php @('bin/console', 'lint:container')
    Invoke-Checked $php @('vendor/phpstan/phpstan/phpstan', 'analyse', '--no-progress')
    Invoke-Checked $php @('vendor/phpunit/phpunit/phpunit')
} finally { Pop-Location }
