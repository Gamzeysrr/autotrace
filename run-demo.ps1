$ErrorActionPreference = 'Stop'
$port = 4177
$url = "http://127.0.0.1:$port/"
$root = $PSScriptRoot

function Test-AutoTracePort {
    try {
        $response = Invoke-RestMethod -Uri "$($url)api/health" -TimeoutSec 1
        return ($response.ok -eq $true -and $response.mode -eq 'local-demo' -and $response.chainRequired -eq $true)
    } catch {
        return $false
    }
}

if (-not (Test-AutoTracePort)) {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) {
        Write-Host 'Node.js bulunamadı. Node.js 22 veya üzeri kurup tekrar deneyin.' -ForegroundColor Red
        Read-Host 'Kapatmak için Enter'
        exit 1
    }
    Start-Process -FilePath $node.Source -ArgumentList '--use-system-ca server.js' -WorkingDirectory $root -WindowStyle Hidden
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 300
        if (Test-AutoTracePort) { $ready = $true; break }
    }
    if (-not $ready) {
        Write-Host 'AutoTrace demo sunucusu başlatılamadı. Node.js kurulumunu ve 4173 portunu kontrol edin.' -ForegroundColor Red
        Read-Host 'Kapatmak için Enter'
        exit 1
    }
}
Start-Process $url
