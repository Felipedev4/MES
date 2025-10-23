@echo off
chcp 65001 >nul
title Sistema MES - Parada
color 0C

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                      SISTEMA MES - PARADA                              ║
echo ║              Manufacturing Execution System v1.0                       ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo [%time%] Parando Sistema MES...
echo.

REM ============================================================================
REM ETAPA 1: Listar processos ativos
REM ============================================================================
echo [1/3] 🔍 Verificando processos Node.js ativos...
echo.

powershell -Command "$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue; if ($nodeProcesses) { Write-Host '   Processos encontrados:' $nodeProcesses.Count; $nodeProcesses | ForEach-Object { try { $cmdLine = (Get-CimInstance Win32_Process -Filter \"ProcessId = $($_.Id)\").CommandLine; if ($cmdLine -match 'backend|data-collector|frontend|react-scripts') { Write-Host '   • PID' $_.Id ':' $cmdLine.Substring(0, [Math]::Min(60, $cmdLine.Length)) '...' } } catch {} } } else { Write-Host '   ✓ Nenhum processo Node.js encontrado' -ForegroundColor Green }"

echo.

REM ============================================================================
REM ETAPA 2: Parar processos por porta
REM ============================================================================
echo [2/3] 🛑 Liberando portas do sistema...
echo.

powershell -Command "$ports = @{3000='Frontend';3001='Backend';3002='Data Collector'}; $stopped = 0; $ports.GetEnumerator() | ForEach-Object { $port = $_.Key; $name = $_.Value; try { $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($conn) { $proc = $conn | Select-Object -ExpandProperty OwningProcess -Unique; $proc | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; Write-Host '   ✓' $name '(Porta' $port'): Parado' -ForegroundColor Yellow; $stopped++ } } catch {} }; if ($stopped -eq 0) { Write-Host '   ℹ Nenhum serviço estava rodando' -ForegroundColor Cyan }"

timeout /t 2 /nobreak >nul

REM ============================================================================
REM ETAPA 3: Parar todos os processos Node.js restantes
REM ============================================================================
echo.
echo [3/3] 🧹 Limpando processos Node.js restantes...
echo.

powershell -Command "$processes = Get-Process -Name node -ErrorAction SilentlyContinue; if ($processes) { $count = $processes.Count; Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Write-Host '   ✓' $count 'processo(s) Node.js encerrado(s)' -ForegroundColor Yellow } else { Write-Host '   ✓ Nenhum processo Node.js restante' -ForegroundColor Green }"

timeout /t 1 /nobreak >nul

REM ============================================================================
REM VERIFICAÇÃO FINAL
REM ============================================================================
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                    VERIFICAÇÃO FINAL                                   ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

powershell -Command "$services = @{3001='Backend';3002='Data Collector';3000='Frontend'}; $running = 0; $services.GetEnumerator() | ForEach-Object { $port = $_.Key; $name = $_.Value; $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if ($conn) { Write-Host '   ✗' $name '(Porta' $port'): ' -NoNewline -ForegroundColor Red; Write-Host 'AINDA RODANDO' -ForegroundColor Red; $running++ } else { Write-Host '   ✓' $name '(Porta' $port'): ' -NoNewline -ForegroundColor Green; Write-Host 'PARADO' -ForegroundColor Green } }; echo ''; if ($running -gt 0) { Write-Host '⚠️  AVISO: Alguns serviços ainda estão rodando!' -ForegroundColor Red; Write-Host 'Tente executar este script novamente.' -ForegroundColor Yellow } else { Write-Host '✅ Todos os serviços foram parados com sucesso!' -ForegroundColor Green }"

echo.
echo [%time%] ✓ Sistema MES parado
echo.
echo 💡 Para reiniciar o sistema, execute: INICIAR_SISTEMA_MES.bat
echo.
pause
exit /b 0

