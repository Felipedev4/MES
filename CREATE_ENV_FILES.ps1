# ========================================
# Script para Criar Arquivos .env
# ========================================

Write-Host ""
Write-Host "🔧 CRIANDO ARQUIVOS .env" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar .env do Backend
Write-Host "📝 Criando backend/.env..." -ForegroundColor Yellow

$backendEnv = @"
# ===================================
# DATABASE
# ===================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mes_db?schema=public"

# ===================================
# SERVER
# ===================================
PORT=3001
NODE_ENV=development

# ===================================
# FRONTEND
# ===================================
# Use * para permitir qualquer origem (útil para mobile)
FRONTEND_URL=*

# ===================================
# JWT
# ===================================
JWT_SECRET=mes-jwt-secret-change-in-production-2024
JWT_EXPIRES_IN=24h

# ===================================
# DATA COLLECTOR
# ===================================
# Usar Data Collector externo (Raspberry Pi)?
# true = Desabilita Modbus interno, usa apenas APIs
# false = Backend conecta diretamente ao CLP (padrão)
USE_EXTERNAL_DATA_COLLECTOR=true

# API Key para autenticação do Data Collector
# Esta chave deve ser a mesma no data-collector
DATA_COLLECTOR_API_KEY=mes-data-collector-secret-key-2024

# ===================================
# MODBUS (Configuração padrão de fallback)
# ===================================
# Host e porta do CLP (se não configurado via banco)
PLC_HOST=192.168.1.15
PLC_PORT=502
PLC_UNIT_ID=1
PLC_REGISTER=33
PLC_POLL_INTERVAL=2000
PLC_RECONNECT_INTERVAL=10000

# ===================================
# LOGGING
# ===================================
LOG_LEVEL=info
"@

Set-Content -Path "backend\.env" -Value $backendEnv
Write-Host "   OK backend/.env criado" -ForegroundColor Green

# Criar .env do Data Collector
Write-Host "Criando data-collector/.env..." -ForegroundColor Yellow

$dataCollectorEnv = @"
# ===================================
# BACKEND API CONNECTION
# ===================================
# URL do backend MES
BACKEND_API_URL=http://localhost:3001

# API Key para autenticação
# (deve ser a mesma configurada no backend)
API_KEY=mes-data-collector-secret-key-2024

# ===================================
# DATA COLLECTOR SETTINGS
# ===================================
# Intervalo para verificar novas configurações no backend (ms)
CONFIG_POLL_INTERVAL=30000

# ===================================
# HEALTH CHECK SERVER
# ===================================
# Porta do servidor de health check local
HEALTH_CHECK_PORT=3002

# ===================================
# LOGGING
# ===================================
LOG_LEVEL=info
# Opções: error, warn, info, debug

# ===================================
# NODE ENVIRONMENT
# ===================================
NODE_ENV=production
"@

$dcPath = "data-collector\.env"
Set-Content -Path $dcPath -Value $dataCollectorEnv
Write-Host "   OK data-collector/.env criado" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OK Arquivos .env criados com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifique se a senha do PostgreSQL esta correta em backend/.env" -ForegroundColor White
Write-Host "   DATABASE_URL contem: postgres:postgres@localhost:5432" -ForegroundColor Gray
Write-Host ""
Write-Host "2. As API Keys devem ser IGUAIS em ambos arquivos:" -ForegroundColor White
Write-Host "   Backend: DATA_COLLECTOR_API_KEY" -ForegroundColor Gray
Write-Host "   Data Collector: API_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Execute o script RESTART_SERVICES.ps1 para reiniciar" -ForegroundColor White
Write-Host ""

