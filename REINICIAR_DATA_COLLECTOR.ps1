# Script para Reiniciar o Data Collector

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REINICIAR DATA COLLECTOR" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos Node do data-collector
Write-Host "Parando Data Collector..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*data-collector*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Navegar para o diretório
Set-Location "C:\Empresas\Desenvolvimento\MES\data-collector"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DATA COLLECTOR INICIANDO..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Iniciar Data Collector
npm start

