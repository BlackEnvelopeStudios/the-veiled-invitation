$ErrorActionPreference = 'Stop'
$directory = $PSScriptRoot
$url = 'http://127.0.0.1:4387'
try {
    Invoke-WebRequest -Uri $url -TimeoutSec 2 | Out-Null
} catch {
    $node = (Get-Command node -ErrorAction Stop).Source
    Start-Process -FilePath $node -ArgumentList ('"' + (Join-Path $directory 'server.mjs') + '"') -WorkingDirectory $directory -WindowStyle Hidden
    Start-Sleep -Seconds 2
}
Start-Process $url
