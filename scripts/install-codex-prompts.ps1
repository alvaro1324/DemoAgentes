[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $repositoryRoot '.codex/prompts/orquestador.md'
$codexDirectory = if ([string]::IsNullOrWhiteSpace($env:CODEX_HOME)) {
    Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex'
} else {
    $env:CODEX_HOME
}
$promptsDirectory = Join-Path $codexDirectory 'prompts'
$destinationPath = Join-Path $promptsDirectory 'orquestador.md'

if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "No existe el fichero de instrucciones: $sourcePath"
}

if (Test-Path -LiteralPath $destinationPath) {
    if ((Get-FileHash -LiteralPath $sourcePath).Hash -eq
        (Get-FileHash -LiteralPath $destinationPath).Hash) {
        Write-Output "El comando ya esta actualizado: $destinationPath"
        return
    }
    $backupPath = "$destinationPath.$([Guid]::NewGuid().ToString('N')).bak"
    Copy-Item -LiteralPath $destinationPath -Destination $backupPath
    Write-Output "Copia anterior conservada: $backupPath"
}

New-Item -ItemType Directory -Path $promptsDirectory -Force | Out-Null
Copy-Item -LiteralPath $sourcePath -Destination $destinationPath
Write-Output "Comando instalado: $destinationPath"
Write-Output 'Abre una nueva sesion o recarga la extension y usa /prompts:orquestador <encargo>.'
