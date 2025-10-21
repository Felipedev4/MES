#!/bin/bash

# ============================================
# Script de Instalação do MES Data Collector
# Para Raspberry Pi 5 (ou 4, 3)
# ============================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  MES Data Collector - Instalação${NC}"
echo -e "${CYAN}  Raspberry Pi 5${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Verificar se está rodando no Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Aviso: Este script foi projetado para Raspberry Pi${NC}"
    read -p "Deseja continuar mesmo assim? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# ============================================
# PASSO 1: Atualizar sistema
# ============================================
echo -e "${YELLOW}[1/9] Atualizando sistema...${NC}"
sudo apt update
sudo apt upgrade -y
echo -e "${GREEN}✅ Sistema atualizado${NC}"
echo ""

# ============================================
# PASSO 2: Instalar Node.js
# ============================================
echo -e "${YELLOW}[2/9] Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js já instalado: $NODE_VERSION${NC}"
else
    echo "Instalando Node.js v20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js instalado: $(node -v)${NC}"
fi
echo ""

# ============================================
# PASSO 3: Instalar Git
# ============================================
echo -e "${YELLOW}[3/9] Verificando Git...${NC}"
if command -v git &> /dev/null; then
    echo -e "${GREEN}✅ Git já instalado: $(git --version)${NC}"
else
    echo "Instalando Git..."
    sudo apt install -y git
    echo -e "${GREEN}✅ Git instalado${NC}"
fi
echo ""

# ============================================
# PASSO 4: Instalar PM2
# ============================================
echo -e "${YELLOW}[4/9] Verificando PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 já instalado: $(pm2 -v)${NC}"
else
    echo "Instalando PM2..."
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 instalado${NC}"
fi
echo ""

# ============================================
# PASSO 5: Criar diretório da aplicação
# ============================================
echo -e "${YELLOW}[5/9] Configurando diretório da aplicação...${NC}"
APP_DIR="/opt/mes"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
echo -e "${GREEN}✅ Diretório criado: $APP_DIR${NC}"
echo ""

# ============================================
# PASSO 6: Clonar repositório (se não existir)
# ============================================
echo -e "${YELLOW}[6/9] Clonando repositório...${NC}"
if [ -d "$APP_DIR/MES" ]; then
    echo -e "${YELLOW}⚠️  Repositório já existe. Atualizando...${NC}"
    cd $APP_DIR/MES
    git pull origin main || echo -e "${YELLOW}Não foi possível atualizar via git pull${NC}"
else
    cd $APP_DIR
    git clone https://github.com/Felipedev4/MES.git
    echo -e "${GREEN}✅ Repositório clonado${NC}"
fi
echo ""

# ============================================
# PASSO 7: Instalar dependências
# ============================================
echo -e "${YELLOW}[7/9] Instalando dependências...${NC}"
cd $APP_DIR/MES/data-collector
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# ============================================
# PASSO 8: Configurar arquivo .env
# ============================================
echo -e "${YELLOW}[8/9] Configurando arquivo .env...${NC}"
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env já existe${NC}"
    read -p "Deseja recriar? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo -e "${YELLOW}Backup criado: .env.backup${NC}"
    else
        echo -e "${CYAN}Mantendo .env existente${NC}"
        echo ""
        echo -e "${YELLOW}[9/9] Pulando configuração...${NC}"
        echo ""
        echo -e "${GREEN}============================================${NC}"
        echo -e "${GREEN}  Instalação Concluída!${NC}"
        echo -e "${GREEN}============================================${NC}"
        echo ""
        echo -e "${CYAN}Próximos passos:${NC}"
        echo "1. Editar configuração: nano .env"
        echo "2. Compilar: npm run build"
        echo "3. Testar: npm start"
        echo "4. Configurar PM2: pm2 start ecosystem.config.js"
        echo ""
        exit 0
    fi
fi

echo ""
echo -e "${CYAN}Por favor, forneça as informações de configuração:${NC}"
echo ""

# Coletar informações do usuário
read -p "IP do servidor PostgreSQL: " DB_HOST
read -p "Porta do PostgreSQL [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "Nome do banco de dados [mes_db]: " DB_NAME
DB_NAME=${DB_NAME:-mes_db}
read -p "Usuário do banco: " DB_USER
read -sp "Senha do banco: " DB_PASS
echo ""
read -p "Porta do Health Check [3002]: " HEALTH_PORT
HEALTH_PORT=${HEALTH_PORT:-3002}

# Criar arquivo .env
cat > .env << EOF
# ===================================
# DATABASE CONNECTION
# ===================================
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# ===================================
# DATA COLLECTOR SETTINGS
# ===================================
POLL_INTERVAL=5000
HEALTH_CHECK_PORT=${HEALTH_PORT}

# ===================================
# LOGGING
# ===================================
LOG_LEVEL=info

# ===================================
# NODE ENVIRONMENT
# ===================================
NODE_ENV=production
EOF

echo -e "${GREEN}✅ Arquivo .env criado${NC}"
echo ""

# Copiar schema do backend se existir
if [ -f "../backend/prisma/schema.prisma" ]; then
    echo "Copiando schema.prisma do backend..."
    mkdir -p prisma
    cp ../backend/prisma/schema.prisma prisma/schema.prisma
    echo -e "${GREEN}✅ Schema copiado${NC}"
fi

# Gerar Prisma Client
echo ""
echo "Gerando Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client gerado${NC}"

# Testar conexão com banco
echo ""
echo "Testando conexão com banco de dados..."
if npx prisma db pull 2>&1 | grep -q "successfully"; then
    echo -e "${GREEN}✅ Conexão com banco OK${NC}"
else
    echo -e "${YELLOW}⚠️  Não foi possível conectar ao banco${NC}"
    echo "Verifique as configurações no arquivo .env"
fi

echo ""

# ============================================
# PASSO 9: Criar configuração PM2
# ============================================
echo -e "${YELLOW}[9/9] Criando configuração PM2...${NC}"

# Criar diretório de logs
sudo mkdir -p /var/log/mes-data-collector
sudo chown $USER:$USER /var/log/mes-data-collector

# Criar ecosystem.config.js se não existir
if [ ! -f "ecosystem.config.js" ]; then
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mes-data-collector',
    script: 'dist/index.js',
    cwd: '/opt/mes/MES/data-collector',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/mes-data-collector/error.log',
    out_file: '/var/log/mes-data-collector/out.log',
    log_file: '/var/log/mes-data-collector/combined.log',
    time: true
  }]
};
EOF
    echo -e "${GREEN}✅ Arquivo ecosystem.config.js criado${NC}"
else
    echo -e "${CYAN}Arquivo ecosystem.config.js já existe${NC}"
fi

echo ""

# ============================================
# Finalização
# ============================================
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Instalação Concluída com Sucesso!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${CYAN}Próximos passos:${NC}"
echo ""
echo -e "${YELLOW}1. Compilar o projeto:${NC}"
echo "   cd $APP_DIR/MES/data-collector"
echo "   npm run build"
echo ""
echo -e "${YELLOW}2. Testar manualmente:${NC}"
echo "   npm start"
echo "   (Ctrl+C para parar)"
echo ""
echo -e "${YELLOW}3. Iniciar com PM2:${NC}"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo -e "${YELLOW}4. Verificar logs:${NC}"
echo "   pm2 logs mes-data-collector"
echo ""
echo -e "${YELLOW}5. Testar Health Check:${NC}"
echo "   curl http://localhost:${HEALTH_PORT}/health"
echo ""
echo -e "${CYAN}Documentação completa:${NC}"
echo "   cat $APP_DIR/MES/INSTALACAO_RASPBERRY_PI.md"
echo ""
echo -e "${GREEN}Tudo pronto! 🎉${NC}"
echo ""

