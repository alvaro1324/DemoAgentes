$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$toolsPath = Join-Path $projectRoot '.tools'
$phpPath = Join-Path $toolsPath 'php'
New-Item -ItemType Directory -Force -Path $toolsPath | Out-Null
if (-not (Test-Path (Join-Path $phpPath 'php.exe'))) {
    $releases = Invoke-RestMethod 'https://windows.php.net/downloads/releases/releases.json'
    $release = $releases.'8.4'.'nts-vs17-x64'.zip
    $archive = Join-Path $toolsPath 'php.zip'
    Invoke-WebRequest -UseBasicParsing ('https://windows.php.net/downloads/releases/' + $release.path) -OutFile $archive
    if ((Get-FileHash $archive -Algorithm SHA256).Hash -ne $release.sha256) { throw 'El checksum de PHP no coincide.' }
    Expand-Archive -LiteralPath $archive -DestinationPath $phpPath -Force
}
$extensionPath = (Join-Path $phpPath 'ext').Replace('\', '/')
$settings = @"
extension_dir="$extensionPath"
extension=curl
extension=mbstring
extension=openssl
extension=pdo_sqlite
extension=sqlite3
extension=zip
date.timezone=UTC
memory_limit=512M
"@
[IO.File]::WriteAllText((Join-Path $phpPath 'php.ini'), $settings)
$composerPath = Join-Path $toolsPath 'composer.phar'
if (-not (Test-Path $composerPath)) {
    $composerDownload = Join-Path $toolsPath 'composer.phar.download'
    Invoke-WebRequest -UseBasicParsing 'https://getcomposer.org/download/latest-stable/composer.phar' -OutFile $composerDownload
    $expected = (Invoke-WebRequest -UseBasicParsing 'https://getcomposer.org/download/latest-stable/composer.phar.sha256sum').Content.Split(' ')[0].Trim()
    if ((Get-FileHash $composerDownload -Algorithm SHA256).Hash -ne $expected) { throw 'El checksum de Composer no coincide.' }
    Move-Item -LiteralPath $composerDownload -Destination $composerPath
}
& (Join-Path $phpPath 'php.exe') --version
& (Join-Path $phpPath 'php.exe') $composerPath --version
if ($LASTEXITCODE -ne 0) { throw 'No se pudo ejecutar Composer.' }
