@echo off
echo Parando processos Node.js existentes...
taskkill /F /IM node.exe /T 2>nul

echo.
echo Aguardando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo Iniciando Backend...
cd backend
start "MES Backend" cmd /k "npm run dev"

echo.
echo Backend iniciando... Aguarde 10 segundos.
timeout /t 10 /nobreak

echo.
echo Testando conexao...
curl http://localhost:3001/api/auth

pause

