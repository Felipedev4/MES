@echo off
chcp 65001 >nul
title REINICIAR BACKEND - Sistema de E-mail
color 0E

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          REINICIAR BACKEND - Com Sistema de E-mail             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/5] Parando todos os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo       ✓ Processos finalizados
echo.

echo [2/5] Indo para diretório backend...
cd /d C:\Empresas\Desenvolvimento\MES\backend
echo       ✓ Diretório: %CD%
echo.

echo [3/5] Sincronizando banco de dados...
call npx prisma db push --skip-generate
echo.

echo [4/5] Regenerando Prisma Client com NOVOS MODELOS...
echo       (email_configs, maintenance_alerts, email_logs)
call npx prisma generate
echo.

echo [5/5] Iniciando servidor...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    BACKEND INICIANDO...                        ║
echo ║                                                                ║
echo ║  Aguarde os logs. Deve aparecer:                              ║
echo ║  ✅ Database connected successfully                            ║
echo ║  ⏰ Scheduler de alertas de manutenção iniciado                ║
echo ║  🚀 Servidor rodando na porta 3001                             ║
echo ║                                                                ║
echo ║  Se aparecer ERRO, copie e me envie!                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

call npm run dev

pause

