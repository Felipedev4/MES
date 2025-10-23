# Script para Reiniciar o Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REINICIAR BACKEND MES" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos Node do backend
Write-Host "Parando Backend..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*backend*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Navegar para o diretório
Set-Location "C:\Empresas\Desenvolvimento\MES\backend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BACKEND INICIANDO..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Iniciar Backend
npm run dev

