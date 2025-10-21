# Guia de Deploy - Sistema MES com Data Collector

## 🎯 Objetivo

Este guia detalha o processo completo de deploy da nova arquitetura do Sistema MES, que separa a captação de dados do CLP em um serviço independente rodando no Raspberry Pi 5.

## 📋 Pré-requisitos

### Servidor Principal (Backend + Frontend)
- [ ] PostgreSQL 13+
- [ ] Node.js 18+ LTS
- [ ] npm 8+
- [ ] Acesso ao repositório Git

### Raspberry Pi 5 (Data Collector)
- [ ] Raspberry Pi OS (64-bit)
- [ ] Node.js 18+ LTS
- [ ] Acesso à rede dos CLPs
- [ ] Acesso ao banco de dados PostgreSQL

### Rede
- [ ] CLPs acessíveis via rede
- [ ] Raspberry Pi com acesso ao banco de dados
- [ ] Firewall configurado

## 🗂️ Estrutura de Diretórios

```
/opt/mes/
├── backend/              # API Backend
├── frontend/build/       # Frontend (build)
└── data-collector/       # Data Collector (Raspberry Pi)
```

## 📝 Passo 1: Migração do Banco de Dados

### Opção A: Script SQL Manual (Recomendado para produção)

```bash
# Fazer backup do banco
pg_dump -U postgres mes_db > mes_db_backup_$(date +%Y%m%d_%H%M%S).sql

# Executar script de migração
psql -U postgres -d mes_db -f backend/MIGRATION_SCRIPT.sql

# Verificar tabelas criadas
psql -U postgres -d mes_db -c "\dt"
```

### Opção B: Prisma Migrate

```bash
cd backend

# Criar migration
npx prisma migrate dev --name add_new_entities

# Aplicar em produção
npx prisma migrate deploy
```

### Verificação

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'sectors', 'activity_types', 'defects', 'reference_types', 'production_defects');
```

## 🔧 Passo 2: Deploy do Backend

```bash
# 1. Navegar para o diretório do backend
cd /opt/mes/backend

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências
npm install

# 4. Gerar Prisma Client
npx prisma generate

# 5. Build (se necessário)
npm run build

# 6. Reiniciar serviço
pm2 restart mes-backend
# OU
systemctl restart mes-backend
```

### Verificação do Backend

```bash
# Testar health check
curl http://localhost:3001/health

# Testar novo endpoint
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/companies

# Ver logs
pm2 logs mes-backend
# OU
journalctl -u mes-backend -f
```

## 🖥️ Passo 3: Deploy do Frontend

```bash
# 1. Navegar para o diretório do frontend
cd /opt/mes/frontend

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências
npm install

# 4. Build para produção
npm run build

# 5. Copiar build para servidor web (se necessário)
sudo cp -r build/* /var/www/html/mes/

# OU servir com serve
pm2 restart mes-frontend
```

### Verificação do Frontend

- Acessar: `http://seu-servidor:3000`
- Verificar login
- Testar novas páginas:
  - Empresas: `/companies`
  - Setores: `/sectors`
  - Tipos de Atividade: `/activity-types`
  - Defeitos: `/defects`
  - Tipos de Referência: `/reference-types`

## 🥧 Passo 4: Deploy do Data Collector no Raspberry Pi

### 4.1 Preparação do Raspberry Pi

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve ser v20.x.x
npm --version   # Deve ser v10.x.x
```

### 4.2 Instalação do Data Collector

```bash
# Criar diretório
sudo mkdir -p /opt/mes
sudo chown pi:pi /opt/mes

# Clonar repositório
cd /opt/mes
git clone <seu-repositorio> .

# Navegar para data-collector
cd data-collector

# Instalar dependências
npm install

# Configurar Prisma
cp ../backend/prisma/schema.prisma ./node_modules/@prisma/client/
npx prisma generate
```

### 4.3 Configuração

```bash
# Copiar e editar .env
cp .env.example .env
nano .env
```

**.env:**
```env
DATABASE_URL="postgresql://mes_user:senha@servidor-db:5432/mes_db"
PORT=3001
NODE_ENV=production
CONFIG_RELOAD_INTERVAL=30000
ENABLE_HEALTH_CHECK=true
LOG_LEVEL=info
```

### 4.4 Build

```bash
npm run build
```

### 4.5 Configurar como Serviço Systemd

```bash
# Copiar arquivo de serviço
sudo cp mes-data-collector.service /etc/systemd/system/

# Editar caminhos (se necessário)
sudo nano /etc/systemd/system/mes-data-collector.service

# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar serviço
sudo systemctl enable mes-data-collector

# Iniciar serviço
sudo systemctl start mes-data-collector

# Verificar status
sudo systemctl status mes-data-collector
```

### 4.6 Verificação do Data Collector

```bash
# Ver logs em tempo real
sudo journalctl -u mes-data-collector -f

# Health check
curl http://localhost:3001/health

# Status resumido
curl http://localhost:3001/status
```

Resposta esperada:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "database": {
    "connected": true
  },
  "plcs": {
    "total": 2,
    "connected": 2,
    "disconnected": 0
  }
}
```

## 🔌 Passo 5: Configuração de CLPs

### Opção A: Via SQL

```sql
-- 1. Criar empresa e setor (se não existir)
INSERT INTO companies (code, name, active) 
VALUES ('EMP001', 'Minha Empresa', true);

INSERT INTO sectors (company_id, code, name, active) 
VALUES (1, 'INJ', 'Injeção', true);

-- 2. Criar configuração de CLP
INSERT INTO plc_configs (name, host, port, unit_id, polling_interval, sector_id, active)
VALUES ('CLP Linha 1', '192.168.1.10', 502, 1, 1000, 1, true);

-- 3. Adicionar registros
INSERT INTO plc_registers (plc_config_id, register_name, register_address, description, enabled)
VALUES 
    (1, 'D33', 33, 'Contador de produção', true),
    (1, 'D34', 34, 'Contador de refugo', true);
```

### Opção B: Via API Frontend

1. Acessar: `/plc-config`
2. Clicar em "Novo CLP"
3. Preencher:
   - Nome: "CLP Linha 1"
   - IP: "192.168.1.10"
   - Porta: 502
   - Setor: Selecionar
4. Adicionar registros
5. Salvar

### Verificação

```bash
# Ver logs do Data Collector
sudo journalctl -u mes-data-collector -f

# Deve aparecer:
# "Configurações alteradas, recarregando..."
# "Conectando ao CLP 'CLP Linha 1'..."
# "Conectado ao CLP com sucesso"
```

## 🧪 Passo 6: Testes de Integração

### 6.1 Testar Leitura de Registros

```bash
# Verificar se está lendo valores
sudo journalctl -u mes-data-collector -n 100 | grep "inicializado"

# Exemplo de saída:
# D33 inicializado com valor: 0
# D34 inicializado com valor: 0
```

### 6.2 Testar Apontamento Automático

1. Criar ordem de produção (via frontend):
   - `/production-orders`
   - Status: IN_PROGRESS

2. Alterar valor no CLP (D33):
   - De 0 para 10

3. Verificar logs:
```bash
sudo journalctl -u mes-data-collector -f
```

Deve aparecer:
```
D33: 0 → 10 (+10)
Apontamento criado - OP: OP001, Qtd: 10, Total: 10
```

4. Verificar no frontend:
   - Dashboard deve mostrar produção atualizada
   - Ordem de produção deve ter 10 peças produzidas

### 6.3 Testar Reconexão Automática

```bash
# Desconectar CLP (fisicamente ou via rede)
# Aguardar logs:
# "Conexão com CLP fechada"
# "Tentando reconectar em 10s..."

# Reconectar CLP
# Aguardar logs:
# "Tentando reconectar ao CLP..."
# "Conectado ao CLP com sucesso"
```

## 📊 Passo 7: Monitoramento

### 7.1 Criar Script de Monitoramento

```bash
#!/bin/bash
# /opt/mes/scripts/monitor.sh

echo "=== Status do Sistema MES ==="
echo ""

echo "Backend:"
systemctl status mes-backend --no-pager | grep Active
echo ""

echo "Data Collector:"
systemctl status mes-data-collector --no-pager | grep Active
echo ""

echo "Database:"
psql -U postgres -d mes_db -c "SELECT COUNT(*) FROM plc_data WHERE timestamp > NOW() - INTERVAL '5 minutes';" -t | xargs echo "Leituras nos últimos 5 min:"
echo ""

echo "Health Check - Backend:"
curl -s http://localhost:3001/health | jq '.status'
echo ""

echo "Health Check - Data Collector:"
curl -s http://localhost:3001/health | jq '.plcs'
```

```bash
chmod +x /opt/mes/scripts/monitor.sh
```

### 7.2 Configurar Cron para Alertas

```bash
crontab -e
```

```cron
# Verificar serviços a cada 5 minutos
*/5 * * * * /opt/mes/scripts/monitor.sh >> /var/log/mes-monitor.log 2>&1
```

## 🔒 Passo 8: Segurança

### 8.1 Firewall (Raspberry Pi)

```bash
# Permitir apenas conexões necessárias
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 3001/tcp    # Health check (apenas LAN)
sudo ufw allow from 192.168.1.0/24 to any port 3001  # Restringir por subnet
sudo ufw enable
```

### 8.2 Permissões do Banco

```sql
-- Criar usuário específico para Data Collector
CREATE USER data_collector WITH PASSWORD 'senha_forte';

-- Dar apenas permissões necessárias
GRANT SELECT ON plc_configs, plc_registers, production_orders, users TO data_collector;
GRANT INSERT ON plc_data, production_appointments TO data_collector;
GRANT UPDATE ON production_orders TO data_collector;
```

Atualizar .env do Data Collector:
```env
DATABASE_URL="postgresql://data_collector:senha_forte@servidor:5432/mes_db"
```

## 🚨 Troubleshooting

### Problema: Data Collector não conecta ao banco

```bash
# Testar conexão
psql "postgresql://data_collector:senha@servidor:5432/mes_db"

# Verificar firewall
sudo ufw status

# Verificar logs
sudo journalctl -u mes-data-collector -n 50
```

### Problema: CLP não conecta

```bash
# Testar ping
ping 192.168.1.10

# Testar porta Modbus
nc -zv 192.168.1.10 502

# Verificar configuração no banco
psql -U postgres mes_db -c "SELECT * FROM plc_configs WHERE active = true;"
```

### Problema: Apontamentos não são criados

```bash
# Verificar se há ordem ativa
psql -U postgres mes_db -c "SELECT * FROM production_orders WHERE status = 'IN_PROGRESS';"

# Verificar logs de mudança de valor
sudo journalctl -u mes-data-collector | grep "valueChanged"

# Verificar se setor está configurado
psql -U postgres mes_db -c "SELECT po.*, s.name as sector_name FROM production_orders po LEFT JOIN sectors s ON po.sector_id = s.id WHERE po.status = 'IN_PROGRESS';"
```

## ✅ Checklist Final

- [ ] Banco de dados migrado
- [ ] Backend atualizado e funcionando
- [ ] Frontend atualizado e acessível
- [ ] Data Collector instalado no Raspberry Pi
- [ ] Data Collector rodando como serviço
- [ ] CLPs configurados no banco
- [ ] Data Collector conectado aos CLPs
- [ ] Leitura de registros funcionando
- [ ] Apontamentos automáticos funcionando
- [ ] Monitoramento configurado
- [ ] Backups configurados
- [ ] Documentação atualizada
- [ ] Equipe treinada

## 📚 Referências

- [ARCHITECTURE_PROPOSAL.md](ARCHITECTURE_PROPOSAL.md) - Arquitetura detalhada
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Resumo da implementação
- [data-collector/README.md](data-collector/README.md) - Documentação do Data Collector
- [backend/MIGRATION_SCRIPT.sql](backend/MIGRATION_SCRIPT.sql) - Script de migração

---

**Última atualização:** 21/10/2025  
**Versão:** 1.0

