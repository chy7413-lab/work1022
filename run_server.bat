@echo off
chcp 65001 > nul
echo ========================================================
echo  2027 국방예산 인포그래픽 대시보드 로컬 서버 시작
echo ========================================================
echo 브라우저에서 아래 주소로 접속하거나 index.html을 직접 더블클릭하세요.
echo http://localhost:8080
echo.
echo 서버를 종료하려면 이 창을 닫거나 Ctrl+C를 누르세요.
echo ========================================================

powershell -NoProfile -ExecutionPolicy Bypass -Command "& { $port = 8080; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add(\"http://localhost:$port/\"); $listener.Start(); Write-Host \"Server running at http://localhost:$port/\"; Start-Process \"http://localhost:$port/\"; while($listener.IsListening) { $ctx = $listener.GetContext(); $req = $ctx.Request; $res = $ctx.Response; $urlPath = $req.Url.LocalPath.TrimStart('/'); if([string]::IsNullOrEmpty($urlPath)) { $urlPath = 'index.html' }; $filePath = Join-Path (Get-Location) $urlPath; if(Test-Path $filePath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($filePath); $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); $mime = switch($ext) { '.html' {'text/html; charset=utf-8'} '.css' {'text/css; charset=utf-8'} '.js' {'application/javascript; charset=utf-8'} '.json' {'application/json; charset=utf-8'} '.png' {'image/png'} '.xlsx' {'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'} '.csv' {'text/csv; charset=utf-8'} default {'application/octet-stream'} }; $res.ContentType = $mime; $res.ContentLength64 = $bytes.Length; $res.OutputStream.Write($bytes, 0, $bytes.Length) } else { $res.StatusCode = 404 }; $res.Close() } }"
pause
