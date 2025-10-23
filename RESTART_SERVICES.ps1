# ========================================
# Script para Reiniciar Backend e Data Collector
# ========================================

Write-Host ""
Write-Host "🔄 REINICIANDO SERVIÇOS MES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Encontrar e parar processos Node.js rodando na porta 3001 (Backend)
Write-Host "🛑 Parando backend (porta 3001)..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backend) {
    $backendPid = $backend[0].OwningProcess
    Write-Host "   Encontrado processo: PID $backendPid" -ForegroundColor Gray
    Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Backend parado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend não estava rodando" -ForegroundColor Gray
}

# Encontrar e parar processos Node.js rodando na porta 3002 (Data Collector)
Write-Host "🛑 Parando data-collector (porta 3002)..." -ForegroundColor Yellow
$datacollector = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($datacollector) {
    $dcPid = $datacollector[0].OwningProcess
    Write-Host "   Encontrado processo: PID $dcPid" -ForegroundColor Gray
    Stop-Process -Id $dcPid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Data Collector parado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Data Collector não estava rodando" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Verificar se backend tem arquivo .env configurado:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   notepad .env" -ForegroundColor Gray
Write-Host ""
Write-Host "   Deve conter (mínimo):" -ForegroundColor Yellow
Write-Host '   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mes_db"' -ForegroundColor Gray
Write-Host '   DATA_COLLECTOR_API_KEY=sua-chave-secreta-aqui' -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Verificar se data-collector tem arquivo .env configurado:" -ForegroundColor White
Write-Host "   cd data-collector" -ForegroundColor Gray
Write-Host "   notepad .env" -ForegroundColor Gray
Write-Host ""
Write-Host "   Deve conter (mínimo):" -ForegroundColor Yellow
Write-Host '   BACKEND_API_URL=http://localhost:3001' -ForegroundColor Gray
Write-Host '   API_KEY=sua-chave-secreta-aqui  # MESMA chave do backend!' -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Iniciar o Backend:" -ForegroundColor White
Write-Host "   cd C:\Empresas\Desenvolvimento\MES\backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  Em outro terminal, iniciar o Data Collector:" -ForegroundColor White
Write-Host "   cd C:\Empresas\Desenvolvimento\MES\data-collector" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚡ Script concluído!" -ForegroundColor Green
Write-Host ""

