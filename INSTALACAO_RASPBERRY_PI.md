# 🍓 Instalação do Data Collector no Raspberry Pi 5

## 📋 Pré-requisitos

### Hardware
- **Raspberry Pi 5** (ou Pi 4, Pi 3)
- **Cartão microSD** (mínimo 16GB, recomendado 32GB)
- **Fonte de alimentação** oficial
- **Conexão Ethernet** (recomendado para estabilidade) ou WiFi
- **Acesso à rede** onde os CLPs estão conectados

### Software no seu PC
- Raspberry Pi Imager: https://www.raspberrypi.com/software/

---

## 🔧 PASSO 1: Preparar o Raspberry Pi

### 1.1 Instalar Raspberry Pi OS

1. **Baixe e instale o Raspberry Pi Imager** no seu PC
2. **Conecte o cartão microSD** ao PC
3. **Abra o Raspberry Pi Imager**
4. **Escolha as opções:**
   - **OS**: Raspberry Pi OS Lite (64-bit) - *recomendado, sem interface gráfica*
   - **Storage**: Selecione seu cartão microSD
5. **Configure (clique no ícone de engrenagem):**
   - ✅ Ativar SSH
   - ✅ Definir usuário e senha (ex: `pi` / sua senha)
   - ✅ Configurar WiFi (se não usar Ethernet)
   - ✅ Configurar fuso horário
6. **Grave a imagem** no cartão microSD
7. **Insira o cartão** no Raspberry Pi e ligue

### 1.2 Conectar ao Raspberry Pi

```bash
# Do seu PC, conecte via SSH
ssh pi@raspberrypi.local
# Ou use o IP direto
ssh pi@192.168.1.XXX
```

---

## 📦 PASSO 2: Instalar Dependências

### 2.1 Atualizar o Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.2 Instalar Node.js (v20 LTS)

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
```

### 2.3 Instalar Git

```bash
sudo apt install -y git
```

### 2.4 Instalar PM2 (Gerenciador de Processos)

```bash
sudo npm install -g pm2
```

---

## 🚀 PASSO 3: Clonar e Configurar o Projeto

### 3.1 Criar diretório e clonar

```bash
# Criar diretório para aplicação
sudo mkdir -p /opt/mes
sudo chown pi:pi /opt/mes
cd /opt/mes

# Clonar repositório do GitHub
git clone https://github.com/Felipedev4/MES.git
cd MES/data-collector
```

### 3.2 Instalar dependências

```bash
npm install
```

### 3.3 Instalar Prisma CLI

```bash
npm install -g prisma
```

---

## ⚙️ PASSO 4: Configurar Variáveis de Ambiente

### 4.1 Criar arquivo .env

```bash
nano .env
```

### 4.2 Configurar variáveis (cole e ajuste):

```env
# ===================================
# DATABASE CONNECTION
# ===================================
DATABASE_URL="postgresql://usuario:senha@IP_DO_SERVIDOR:5432/mes_db?schema=public"

# Exemplo:
# DATABASE_URL="postgresql://postgres:suasenha@192.168.1.100:5432/mes_db?schema=public"

# ===================================
# DATA COLLECTOR SETTINGS
# ===================================
# Intervalo de verificação de configurações (ms)
POLL_INTERVAL=5000

# Porta do servidor de health check
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
```

**Salvar**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 4.3 Configurar conexão com o banco de dados

⚠️ **IMPORTANTE**: Certifique-se de que:
1. O PostgreSQL no servidor aceita conexões remotas
2. O IP do Raspberry Pi está liberado no firewall
3. O usuário PostgreSQL tem permissões corretas

---

## 🗄️ PASSO 5: Configurar Prisma

### 5.1 Copiar schema do backend

```bash
# Copiar schema.prisma do backend
cp ../backend/prisma/schema.prisma prisma/schema.prisma
```

### 5.2 Gerar Prisma Client

```bash
npx prisma generate
```

### 5.3 Testar conexão com banco

```bash
npx prisma db pull
```

Se conectar com sucesso, você está pronto!

---

## 🏃 PASSO 6: Executar o Data Collector

### 6.1 Testar manualmente primeiro

```bash
# Compilar TypeScript
npm run build

# Executar
npm start
```

**Você deve ver:**
```
2025-10-21 10:00:00 [info]: ✅ Conectado ao banco de dados PostgreSQL
2025-10-21 10:00:00 [info]: 🔌 PlcPoolManager: Iniciando com 0 PLCs ativos
2025-10-21 10:00:01 [info]: 📊 ProductionMonitor: Iniciado
2025-10-21 10:00:01 [info]: 🏥 Health Check server rodando na porta 3002
```

**Testar Health Check:**
```bash
curl http://localhost:3002/health
```

**Parar o serviço:** `Ctrl + C`

---

## 🔄 PASSO 7: Configurar como Serviço (PM2)

### 7.1 Criar arquivo de configuração PM2

```bash
cd /opt/mes/MES/data-collector
nano ecosystem.config.js
```

### 7.2 Cole a configuração:

```javascript
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
```

**Salvar**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 7.3 Criar diretório de logs

```bash
sudo mkdir -p /var/log/mes-data-collector
sudo chown pi:pi /var/log/mes-data-collector
```

### 7.4 Iniciar com PM2

```bash
# Compilar código
npm run build

# Iniciar serviço
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs mes-data-collector

# Parar logs: Ctrl + C
```

### 7.5 Configurar PM2 para iniciar no boot

```bash
# Salvar configuração atual
pm2 save

# Configurar startup
pm2 startup

# Execute o comando que o PM2 mostrar (será algo como):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
```

---

## 📊 PASSO 8: Monitoramento e Manutenção

### Comandos PM2 Úteis

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs mes-data-collector

# Ver logs de erro apenas
pm2 logs mes-data-collector --err

# Reiniciar
pm2 restart mes-data-collector

# Parar
pm2 stop mes-data-collector

# Remover do PM2
pm2 delete mes-data-collector

# Ver informações detalhadas
pm2 info mes-data-collector

# Monitoramento em tempo real
pm2 monit
```

### Health Check

```bash
# Verificar saúde do serviço
curl http://localhost:3002/health

# Ou de outro computador na rede
curl http://IP_DO_RASPBERRY:3002/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T13:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "plcs": {
    "total": 2,
    "connected": 2,
    "disconnected": 0
  }
}
```

---

## 🔍 PASSO 9: Verificar Funcionamento

### 9.1 No Backend, cadastrar um PLC

1. Acesse o frontend: `http://IP_BACKEND:3000`
2. Login com suas credenciais
3. Vá em **"Configuração de CLP"**
4. Clique em **"+ Novo CLP"**
5. Preencha:
   - **Nome**: CLP Injetora 01
   - **Host**: 192.168.1.15 (IP do seu CLP)
   - **Porta**: 502
   - **Unit ID**: 1
   - **Status**: Ativo ✅
6. **Adicione registros** para monitorar:
   - Registro D33 (contador de peças)
   - Registro D34 (temperatura)
   - etc.
7. Salve

### 9.2 Verificar logs no Raspberry Pi

```bash
pm2 logs mes-data-collector
```

**Você deve ver:**
```
[info]: 🔌 PLC "CLP Injetora 01" (192.168.1.15:502) conectado!
[info]: 📊 Monitorando 2 registros
[info]: 📊 D33: 0 → 100 (+100)
```

---

## 🔧 Troubleshooting

### Problema: Não conecta ao banco de dados

```bash
# Verificar se a string de conexão está correta
cat .env | grep DATABASE_URL

# Testar conectividade com o servidor
ping IP_DO_SERVIDOR

# Verificar se a porta 5432 está acessível
telnet IP_DO_SERVIDOR 5432
# Ou
nc -zv IP_DO_SERVIDOR 5432
```

**Solução:**
- Verificar firewall no servidor PostgreSQL
- Editar `postgresql.conf`: `listen_addresses = '*'`
- Editar `pg_hba.conf`: adicionar linha com IP do Raspberry Pi

### Problema: Não conecta aos CLPs

```bash
# Testar conectividade com CLP
ping IP_DO_CLP

# Testar porta Modbus
telnet IP_DO_CLP 502
```

**Solução:**
- Verificar se o CLP está ligado e na rede
- Verificar se o Modbus TCP está habilitado no CLP
- Verificar se não há firewall bloqueando

### Problema: Serviço não inicia

```bash
# Ver logs detalhados
pm2 logs mes-data-collector --lines 100

# Reiniciar
pm2 restart mes-data-collector

# Se necessário, deletar e recriar
pm2 delete mes-data-collector
pm2 start ecosystem.config.js
```

---

## 📝 Atualização do Sistema

### Atualizar código do GitHub

```bash
cd /opt/mes/MES/data-collector

# Parar serviço
pm2 stop mes-data-collector

# Atualizar código
git pull origin main

# Instalar novas dependências
npm install

# Recompilar
npm run build

# Reiniciar
pm2 start mes-data-collector
```

---

## 🔐 Segurança

### Recomendações

1. **Mudar senha padrão do Raspberry Pi**
   ```bash
   passwd
   ```

2. **Configurar firewall**
   ```bash
   sudo apt install ufw
   sudo ufw allow ssh
   sudo ufw allow 3002/tcp  # Health check
   sudo ufw enable
   ```

3. **Manter sistema atualizado**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Backup da configuração**
   ```bash
   # Fazer backup do .env
   cp .env .env.backup
   ```

---

## 📞 Suporte

### Logs importantes

```bash
# Logs da aplicação
pm2 logs mes-data-collector

# Logs do sistema
sudo journalctl -u pm2-pi -f
```

### Arquivos de configuração

- **Aplicação**: `/opt/mes/MES/data-collector`
- **Configuração**: `/opt/mes/MES/data-collector/.env`
- **Logs**: `/var/log/mes-data-collector/`

---

## ✅ Checklist Final

- [ ] Raspberry Pi OS instalado e atualizado
- [ ] Node.js v20 instalado
- [ ] Repositório clonado do GitHub
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Prisma Client gerado
- [ ] Conexão com banco testada
- [ ] Aplicação compila sem erros
- [ ] PM2 configurado e rodando
- [ ] PM2 configurado para iniciar no boot
- [ ] Health check responde corretamente
- [ ] CLPs sendo monitorados (ver logs)
- [ ] Dados sendo inseridos no banco

---

**🎉 Parabéns! Seu Data Collector está rodando no Raspberry Pi!**

O sistema agora está coletando dados dos CLPs automaticamente e enviando para o banco de dados PostgreSQL.

