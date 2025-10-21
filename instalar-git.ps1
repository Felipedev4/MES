# Script para Instalar Git no Windows
# Autor: Sistema MES
# Data: 2025-10-21

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "       INSTALACAO DO GIT FOR WINDOWS            " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# URL do instalador Git
$gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.47.0.windows.2/Git-2.47.0.2-64-bit.exe"
$installerPath = "$env:TEMP\GitInstaller.exe"

Write-Host "Baixando Git for Windows..." -ForegroundColor Yellow
Write-Host "URL: $gitUrl" -ForegroundColor Gray
Write-Host ""

try {
    # Baixar instalador
    Invoke-WebRequest -Uri $gitUrl -OutFile $installerPath -UseBasicParsing
    
    Write-Host "Download concluido!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Iniciando instalacao..." -ForegroundColor Yellow
    Write-Host "Aguarde, isso pode levar alguns minutos..." -ForegroundColor Gray
    Write-Host ""
    
    # Executar instalador silenciosamente
    $process = Start-Process -FilePath $installerPath -ArgumentList "/VERYSILENT /NORESTART /SP-" -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "Git instalado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANTE:" -ForegroundColor Yellow
        Write-Host "1. FECHE este terminal/PowerShell" -ForegroundColor White
        Write-Host "2. ABRA um novo terminal/PowerShell" -ForegroundColor White
        Write-Host "3. Execute novamente o script de limpeza" -ForegroundColor White
        Write-Host ""
        
        # Limpar instalador
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "Erro ao instalar Git. Codigo de saida: $($process.ExitCode)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Tente instalar manualmente:" -ForegroundColor Yellow
        Write-Host "https://git-scm.com/download/win" -ForegroundColor White
    }
    
} catch {
    Write-Host "Erro durante o processo:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale manualmente o Git:" -ForegroundColor Yellow
    Write-Host "https://git-scm.com/download/win" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Read-Host "Pressione Enter para sair"

