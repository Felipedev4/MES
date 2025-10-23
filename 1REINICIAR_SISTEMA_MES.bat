@echo off
chcp 65001 >nul
title Sistema MES - Reinicialização
color 0E

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                   SISTEMA MES - REINICIALIZAÇÃO                        ║
echo ║              Manufacturing Execution System v1.0                       ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo [%time%] Reiniciando Sistema MES...
echo.
echo Este processo irá:
echo   1. Parar todos os serviços em execução
echo   2. Aguardar 3 segundos
echo   3. Iniciar todos os serviços novamente
echo.
echo Pressione Ctrl+C para cancelar ou qualquer tecla para continuar...
pause >nul

echo.
echo ════════════════════════════════════════════════════════════════════════
echo FASE 1: PARANDO SERVIÇOS
echo ════════════════════════════════════════════════════════════════════════
echo.

REM Parar todos os processos Node.js
powershell -Command "Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2"

echo ✓ Serviços parados
timeout /t 3 /nobreak >nul

echo.
echo ════════════════════════════════════════════════════════════════════════
echo FASE 2: INICIANDO SERVIÇOS
echo ════════════════════════════════════════════════════════════════════════
echo.

REM Chamar o script de inicialização
call "%~dp0INICIAR_SISTEMA_MES.bat"

exit /b 0

