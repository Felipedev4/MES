# ============================================
# Script para Iniciar Data Collector
# ============================================

Write-Host "🚀 Iniciando MES Data Collector..." -ForegroundColor Cyan
Write-Host ""

# Verificar se já está rodando
$running = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*data-collector*"}

if ($running) {
    Write-Host "⚠️  Data Collector já está rodando!" -ForegroundColor Yellow
    Write-Host ""
    $resposta = Read-Host "Deseja reiniciar? (S/N)"
    
    if ($resposta -eq "S" -or $resposta -eq "s") {
        Write-Host "🔄 Parando processo atual..." -ForegroundColor Yellow
        $running | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Host "   ✅ Processo parado" -ForegroundColor Green
    } else {
        Write-Host "👍 Ok, mantendo processo atual" -ForegroundColor Cyan
        exit
    }
}

# Ir para o diretório do data-collector
Set-Location "C:\Empresas\Desenvolvimento\MES\data-collector"

Write-Host "📦 Compilando código..." -ForegroundColor Yellow
npm run build | Out-Null
Write-Host "   ✅ Compilado com sucesso" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Iniciando Data Collector..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Empresas\Desenvolvimento\MES\data-collector; npm run dev"

Write-Host ""
Write-Host "✅ Data Collector iniciado em nova janela!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Monitore os logs na janela aberta:" -ForegroundColor Cyan
Write-Host "   - Deve mostrar: 'Produzido: 2 peças (cavidades ativas)'" -ForegroundColor White
Write-Host "   - Não deve mais mostrar: 'quantity=<tempo>'" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

