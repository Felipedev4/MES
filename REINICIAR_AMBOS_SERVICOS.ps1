# Script para Reiniciar Backend e Data Collector

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REINICIAR TODOS OS SERVIÇOS" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Parar tudo
Write-Host "1. Parando todos os serviços Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

Write-Host "✓ Serviços parados" -ForegroundColor Green
Write-Host ""

# 2. Iniciar Backend
Write-Host "2. Iniciando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '🚀 BACKEND MES' -ForegroundColor Green; cd 'C:\Empresas\Desenvolvimento\MES\backend'; npm run dev"
)

Start-Sleep -Seconds 10
Write-Host "✓ Backend iniciado (porta 3001)" -ForegroundColor Green
Write-Host ""

# 3. Testar Backend
Write-Host "3. Testando Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
    Write-Host "✓ Backend respondendo: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend não respondeu, mas continuando..." -ForegroundColor Yellow
}
Write-Host ""

# 4. Iniciar Data Collector
Write-Host "4. Iniciando Data Collector..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '📡 DATA COLLECTOR' -ForegroundColor Green; cd 'C:\Empresas\Desenvolvimento\MES\data-collector'; npm start"
)

Start-Sleep -Seconds 5
Write-Host "✓ Data Collector iniciado (porta 3002)" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVIÇOS INICIADOS COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:         http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "Data Collector:  http://localhost:3002/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifique as janelas do PowerShell para logs em tempo real" -ForegroundColor Yellow
Write-Host ""

# Pausar para ver resultado
Read-Host -Prompt "Pressione Enter para fechar"

