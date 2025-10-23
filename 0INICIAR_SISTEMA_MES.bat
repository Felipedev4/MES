@echo off
chcp 65001 >nul
title Sistema MES - Inicialização
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                     SISTEMA MES - INICIALIZAÇÃO                        ║
echo ║              Manufacturing Execution System v1.0                       ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo [%time%] Iniciando Sistema MES...
echo.

REM ============================================================================
REM ETAPA 1: Parar processos anteriores
REM ============================================================================
echo [1/6] 🛑 Parando processos Node.js anteriores...
echo.

REM Parar processos nas portas específicas
powershell -Command "$ports = @(3000, 3001, 3002); foreach ($port in $ports) { try { $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess; if ($proc) { Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue; Write-Host '   ✓ Porta' $port 'liberada' } } catch {} }"

echo.
echo [%time%] ✓ Processos anteriores finalizados
timeout /t 2 /nobreak >nul

REM ============================================================================
REM ETAPA 2: Verificar dependências
REM ============================================================================
echo.
echo [2/6] 🔍 Verificando instalação do Node.js...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js antes de continuar:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    ✓ Node.js instalado: %NODE_VERSION%
echo.

REM ============================================================================
REM ETAPA 3: Iniciar Backend (Porta 3001)
REM ============================================================================
echo.
echo [3/6] 🚀 Iniciando Backend (Porta 3001)...
echo.

REM Verificar se a pasta backend existe
if not exist "backend" (
    echo ❌ ERRO: Pasta 'backend' não encontrada!
    pause
    exit /b 1
)

REM Iniciar backend em nova janela
start "MES - Backend (3001)" powershell -NoExit -Command "cd '%~dp0backend'; Write-Host ''; Write-Host '╔════════════════════════════════════════════════╗' -ForegroundColor Cyan; Write-Host '║         MES BACKEND - Porta 3001               ║' -ForegroundColor Cyan; Write-Host '╚════════════════════════════════════════════════╝' -ForegroundColor Cyan; Write-Host ''; npm run dev"

echo    ✓ Backend iniciado em nova janela
timeout /t 3 /nobreak >nul

REM ============================================================================
REM ETAPA 4: Iniciar Data Collector (Porta 3002)
REM ============================================================================
echo.
echo [4/6] 📡 Iniciando Data Collector (Porta 3002)...
echo.

REM Verificar se a pasta data-collector existe
if not exist "data-collector" (
    echo ❌ ERRO: Pasta 'data-collector' não encontrada!
    pause
    exit /b 1
)

REM Iniciar data-collector em nova janela
start "MES - Data Collector (3002)" powershell -NoExit -Command "cd '%~dp0data-collector'; Write-Host ''; Write-Host '╔════════════════════════════════════════════════╗' -ForegroundColor Green; Write-Host '║      MES DATA COLLECTOR - Porta 3002           ║' -ForegroundColor Green; Write-Host '╚════════════════════════════════════════════════╝' -ForegroundColor Green; Write-Host ''; npm start"

echo    ✓ Data Collector iniciado em nova janela
timeout /t 3 /nobreak >nul

REM ============================================================================
REM ETAPA 5: Iniciar Frontend (Porta 3000)
REM ============================================================================
echo.
echo [5/6] 🌐 Iniciando Frontend (Porta 3000)...
echo.

REM Verificar se a pasta frontend existe
if not exist "frontend" (
    echo ⚠️  AVISO: Pasta 'frontend' não encontrada!
    echo    O frontend não será iniciado.
) else (
    REM Iniciar frontend em nova janela
    start "MES - Frontend (3000)" powershell -NoExit -Command "cd '%~dp0frontend'; Write-Host ''; Write-Host '╔════════════════════════════════════════════════╗' -ForegroundColor Magenta; Write-Host '║       MES FRONTEND - Porta 3000                ║' -ForegroundColor Magenta; Write-Host '╚════════════════════════════════════════════════╝' -ForegroundColor Magenta; Write-Host ''; npm start"
    
    echo    ✓ Frontend iniciado em nova janela
)

timeout /t 2 /nobreak >nul

REM ============================================================================
REM ETAPA 6: Verificar status dos serviços
REM ============================================================================
echo.
echo [6/6] ✅ Verificando status dos serviços...
echo.
echo    Aguardando inicialização dos serviços...
timeout /t 10 /nobreak >nul

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                    STATUS DOS SERVIÇOS                                 ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

powershell -Command "$services = @{3001='Backend';3002='Data Collector';3000='Frontend'}; $services.GetEnumerator() | ForEach-Object { $port = $_.Key; $name = $_.Value; $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if ($conn) { Write-Host '   ✓' $name '(Porta' $port'): ' -NoNewline -ForegroundColor Green; Write-Host 'ONLINE' -ForegroundColor Green } else { Write-Host '   ✗' $name '(Porta' $port'): ' -NoNewline -ForegroundColor Red; Write-Host 'OFFLINE' -ForegroundColor Red } }"

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                      SISTEMA INICIADO!                                 ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo 📌 URLs de Acesso:
echo    • Frontend:        http://localhost:3000
echo    • Backend API:     http://localhost:3001
echo    • Data Collector:  http://localhost:3002
echo.
echo 📊 Endpoints Úteis:
echo    • Backend Health:  http://localhost:3001/api/health
echo    • API Docs:        http://localhost:3001/api-docs
echo    • Collector Health: http://localhost:3002/health
echo.
echo 💡 Dicas:
echo    • Cada serviço está rodando em sua própria janela
echo    • Para parar todos os serviços, use PARAR_SISTEMA_MES.bat
echo    • Logs em tempo real estão visíveis em cada janela
echo.
echo [%time%] ✓ Sistema MES inicializado com sucesso!
echo.
echo Pressione qualquer tecla para abrir o Frontend no navegador...
pause >nul

REM Abrir o frontend no navegador padrão
start http://localhost:3000

echo.
echo ✓ Navegador aberto. Boa produção!
echo.
timeout /t 3 /nobreak >nul
exit /b 0

