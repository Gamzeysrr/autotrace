$ErrorActionPreference = 'Stop'
$port = 4173
$url = "http://127.0.0.1:$port/"
$root = $PSScriptRoot

function Test-AutoTracePort {
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $client.Connect('127.0.0.1', $port)
        return $true
    } catch {
        return $false
    } finally {
        $client.Dispose()
    }
}

if (-not (Test-AutoTracePort)) {
    $python = Get-Command python -ErrorAction SilentlyContinue
    if (-not $python) { $python = Get-Command py -ErrorAction SilentlyContinue }
    if (-not $python) {
        Write-Host 'Python bulunamadı. Python 3 kurup tekrar deneyin.' -ForegroundColor Red
        Read-Host 'Kapatmak için Enter'
        exit 1
    }
    $arguments = "-m http.server $port --bind 127.0.0.1 --directory `"$root`""
    Start-Process -FilePath $python.Source -ArgumentList $arguments -WindowStyle Hidden
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 300
        if (Test-AutoTracePort) { $ready = $true; break }
    }
    if (-not $ready) {
        Write-Host 'Yerel demo sunucusu başlatılamadı. Python kurulumunu ve 4173 portunu kontrol edin.' -ForegroundColor Red
        Read-Host 'Kapatmak için Enter'
        exit 1
    }
}
Start-Process $url
