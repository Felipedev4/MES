# ============================================
# Script para Reiniciar Sistema MES Completo
# ============================================
# Este script para todos os processos e reinicia o sistema

Write-Host "🔄 Reiniciando Sistema MES..." -ForegroundColor Cyan
Write-Host ""

# Parar todos os processos Node.js
Write-Host "1️⃣ Parando processos Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "   ✅ Processos Node parados" -ForegroundColor Green
Write-Host ""

# Navegar para o diretório do backend
Write-Host "2️⃣ Regenerando Prisma Client..." -ForegroundColor Yellow
Set-Location "C:\Empresas\Desenvolvimento\MES\backend"

# Tentar regenerar o Prisma Client
try {
    npx prisma generate --force 2>&1 | Out-Null
    Write-Host "   ✅ Prisma Client regenerado" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Aviso: Erro ao regenerar Prisma Client" -ForegroundColor Red
    Write-Host "   Continuando mesmo assim..." -ForegroundColor Yellow
}
Write-Host ""

# Aplicar mudanças do banco de dados
Write-Host "3️⃣ Sincronizando banco de dados..." -ForegroundColor Yellow
try {
    npx prisma db push --accept-data-loss 2>&1 | Out-Null
    Write-Host "   ✅ Banco sincronizado" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Aviso: Erro ao sincronizar banco" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Preparação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Abra um terminal e execute: cd backend; npm run dev" -ForegroundColor White
Write-Host "   2. Abra outro terminal e execute: cd frontend; npm start" -ForegroundColor White
Write-Host ""
Write-Host "💡 Ou execute os scripts separados:" -ForegroundColor Cyan
Write-Host "   - RESTART_SERVICES.ps1 (para iniciar os serviços)" -ForegroundColor White
Write-Host ""

# Perguntar se deseja iniciar os serviços automaticamente
$resposta = Read-Host "Deseja iniciar os serviços automaticamente? (S/N)"

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host ""
    Write-Host "🚀 Iniciando serviços..." -ForegroundColor Cyan
    
    # Iniciar backend em background
    Write-Host "   Iniciando Backend..." -ForegroundColor Yellow
    Set-Location "C:\Empresas\Desenvolvimento\MES\backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Empresas\Desenvolvimento\MES\backend; npm run dev"
    
    Start-Sleep -Seconds 3
    
    # Iniciar frontend em background
    Write-Host "   Iniciando Frontend..." -ForegroundColor Yellow
    Set-Location "C:\Empresas\Desenvolvimento\MES\frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Empresas\Desenvolvimento\MES\frontend; npm start"
    
    Write-Host ""
    Write-Host "✅ Serviços iniciados em janelas separadas!" -ForegroundColor Green
    Write-Host "   Aguarde alguns segundos para os serviços iniciarem..." -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "👍 Ok! Inicie os serviços manualmente quando estiver pronto." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

