# Script de Teste: Endpoint Resume Production
# Testa se o endpoint /api/downtimes/resume-production está disponível

Write-Host "🔍 Testando endpoint /api/downtimes/resume-production..." -ForegroundColor Cyan

# Teste 1: Endpoint sem autenticação (deve retornar 401, não 404)
Write-Host "`n📝 Teste 1: Requisição sem token (esperado: 401 Unauthorized, não 404)" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/downtimes/resume-production" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"productionOrderId": 1}' `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status Code: $statusCode" -ForegroundColor $(if ($statusCode -eq 404) { "Red" } elseif ($statusCode -eq 401) { "Green" } else { "Yellow" })
    
    if ($statusCode -eq 404) {
        Write-Host "❌ ERRO: Endpoint não encontrado (404) - Rota não está carregada!" -ForegroundColor Red
    } elseif ($statusCode -eq 401) {
        Write-Host "✅ SUCESSO: Endpoint existe mas requer autenticação (401) - Isso está correto!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Status inesperado: $statusCode" -ForegroundColor Yellow
    }
}

# Teste 2: Verificar se o backend está rodando
Write-Host "`n📝 Teste 2: Verificar processos Node.js" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✅ Backend está rodando" -ForegroundColor Green
    $nodeProcesses | Select-Object Id, ProcessName, StartTime | Format-Table
} else {
    Write-Host "❌ Backend NÃO está rodando!" -ForegroundColor Red
}

# Teste 3: Verificar porta 3001
Write-Host "`n📝 Teste 3: Verificar porta 3001" -ForegroundColor Yellow
$port3001 = netstat -ano | findstr ":3001" | findstr "LISTENING"
if ($port3001) {
    Write-Host "✅ Porta 3001 está em LISTENING" -ForegroundColor Green
    Write-Host $port3001 -ForegroundColor White
} else {
    Write-Host "❌ Porta 3001 NÃO está em LISTENING!" -ForegroundColor Red
}

Write-Host "`n✨ Teste concluído!" -ForegroundColor Cyan

