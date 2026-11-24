$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..\frontend')
try {
    foreach ($command in @('format:check', 'test', 'build')) {
        & npm.cmd run $command
        if ($LASTEXITCODE -ne 0) { throw "Falló npm run $command." }
    }
} finally { Pop-Location }
