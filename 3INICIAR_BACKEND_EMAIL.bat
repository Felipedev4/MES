@echo off
chcp 65001 >nul
title BACKEND MES - Sistema de E-mail
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║            INICIAR BACKEND - Sistema de E-mail                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/4] Parando processos anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Indo para diretório backend...
cd /d C:\Empresas\Desenvolvimento\MES\backend

echo [3/4] Regenerando Prisma Client...
call npx prisma generate

echo [4/4] Iniciando servidor...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    BACKEND INICIANDO...                        ║
echo ║                                                                ║
echo ║  Aguarde os logs abaixo. Se aparecer:                         ║
echo ║  ✅ Database connected successfully                            ║
echo ║  🚀 Servidor rodando na porta 3001                             ║
echo ║                                                                ║
echo ║  Está FUNCIONANDO!                                            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.

call npm run dev

pause

