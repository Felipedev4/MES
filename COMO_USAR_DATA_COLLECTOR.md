# 🎯 Como Usar o Data Collector - Guia Prático

## 📌 Situação Atual

**Agora mesmo:**
- ✅ Backend está rodando e fazendo polling do CLP
- ✅ Data Collector está criado mas não está rodando

**Objetivo:**
- Separar a coleta de dados para o Raspberry Pi
- Backend apenas serve a API
- Data Collector faz polling dos CLPs

---

## 🚀 Opção 1: Testar Localmente (Windows)

### **1. Instalar Dependências**

```powershell
cd data-collector
npm install
```

### **2. Criar arquivo .env**

```powershell
# Criar .env
$envContent = @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mes_db"
LOG_LEVEL=info
HEALTH_CHECK_PORT=3002
"@
$envContent | Out-File -FilePath .env -Encoding UTF8
```

### **3. Copiar schema do Prisma**

```powershell
# Copiar schema.prisma do backend
Copy-Item ..\backend\prisma\schema.prisma .\prisma\
```

### **4. Gerar Prisma Client**

```powershell
npx prisma generate
```

### **5. Iniciar Data Collector**

```powershell
npm run dev
```

### **6. Desabilitar Modbus no Backend**

Edite `backend\src\server.ts`:

```typescript
// ANTES (linha ~170):
await modbusService.initialize();

// DEPOIS:
// await modbusService.initialize();  // DESABILITADO - usando Data Collector
console.log('ℹ️ Modbus desabilitado - usando Data Collector');
```

Reinicie o backend (Ctrl+C e `npm run dev` novamente).

### **7. Verificar**

```powershell
# Terminal 1: Backend na porta 3001
cd backend
npm run dev

# Terminal 2: Data Collector na porta 3002
cd data-collector
npm run dev

# Terminal 3: Testar health check
curl http://localhost:3002/health
```

---

## 🍓 Opção 2: Configurar no Raspberry Pi 5

### **1. No Raspberry Pi: Preparar Ambiente**

```bash
# SSH no Raspberry Pi
ssh pi@192.168.1.X

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Git
sudo apt install -y git

# Verificar
node --version  # Deve ser v18.x ou superior
npm --version
```

### **2. Clonar Projeto**

```bash
cd ~
git clone https://github.com/seu-usuario/MES.git
cd MES/data-collector
```

### **3. Criar .env**

```bash
nano .env
```

Conteúdo:

```env
# IP DO SERVIDOR onde o PostgreSQL está rodando!
DATABASE_URL="postgresql://postgres:senha@192.168.1.10:5432/mes_db"
LOG_LEVEL=info
HEALTH_CHECK_PORT=3002
```

Salve com `Ctrl+X`, depois `Y`, depois `Enter`.

### **4. Instalar Dependências**

```bash
npm install
```

### **5. Copiar Schema do Prisma**

```bash
# Se você clonou do Git, o schema já está lá
# Caso contrário:
cp ../backend/prisma/schema.prisma ./prisma/
```

### **6. Gerar Prisma Client**

```bash
npx prisma generate
```

### **7. Testar**

```bash
npm run dev
```

**Saída esperada:**
```
[info]: 🚀 Iniciando MES Data Collector...
[info]: ✅ Conectado ao banco de dados PostgreSQL
[info]: 🔌 PlcPoolManager: Carregando configurações ativas...
[info]: ✅ CLP 'CLP Principal' adicionado ao pool
[info]: 🔌 Conectando ao CLP...
[info]: 🏥 Health check rodando em http://0.0.0.0:3002
```

### **8. Configurar para Iniciar Automaticamente (PM2)**

```bash
# Instalar PM2
sudo npm install -g pm2

# Iniciar com PM2
pm2 start npm --name "mes-data-collector" -- run dev

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
# Copie e execute o comando que aparecer

# Ver logs
pm2 logs mes-data-collector

# Ver status
pm2 status
```

---

## 📊 Verificações

### **✅ Backend funcionando:**
```powershell
curl http://localhost:3001/api/plc-config
# Deve retornar lista de PLCs (com erro 401 de autenticação - normal)
```

### **✅ Data Collector funcionando:**
```powershell
curl http://localhost:3002/health
# Deve retornar JSON com status "healthy"
```

### **✅ Dados sendo coletados:**
```sql
-- No banco de dados PostgreSQL
SELECT * FROM plc_data ORDER BY timestamp DESC LIMIT 10;
-- Deve mostrar dados recentes
```

### **✅ Dashboard atualizando:**
```
1. Abra http://localhost:3000
2. Faça login
3. Acesse Dashboard
4. Deve ver dados em tempo real
```

---

## 🔧 Comandos Úteis

### **Windows (Desenvolvimento):**

```powershell
# Iniciar Data Collector
cd data-collector
npm run dev

# Parar: Ctrl+C

# Ver logs: aparecem no terminal

# Compilar para produção
npm run build

# Rodar versão compilada
npm start
```

### **Raspberry Pi (Produção com PM2):**

```bash
# Iniciar
pm2 start mes-data-collector

# Parar
pm2 stop mes-data-collector

# Reiniciar
pm2 restart mes-data-collector

# Ver logs
pm2 logs mes-data-collector

# Ver logs em tempo real
pm2 logs mes-data-collector --lines 100

# Status de todos os serviços
pm2 status

# Monitoramento interativo
pm2 monit
```

---

## 🐛 Solução de Problemas

### **Erro: "Cannot find module '@prisma/client'"**

```powershell
cd data-collector
npx prisma generate
```

### **Erro: "The table 'plc_configs' does not exist"**

```powershell
# No backend (não no data-collector!)
cd backend
npx prisma db push

# Depois regerar no data-collector
cd ../data-collector
npx prisma generate
```

### **Erro: "ECONNREFUSED" ao conectar no banco**

1. Verifique se o PostgreSQL está rodando:
   ```powershell
   # Windows
   Get-Service *postgre*
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verifique o IP no `.env`:
   - Para local (Windows): `localhost` ou `127.0.0.1`
   - Para Raspberry Pi: IP do servidor (ex: `192.168.1.10`)

3. Verifique se a porta está aberta:
   ```powershell
   # Windows
   Test-NetConnection -ComputerName localhost -Port 5432
   
   # Linux
   nc -zv localhost 5432
   ```

### **Erro: "CLP não conectou"**

Normal se você não tem um CLP físico! Para testar sem CLP:

1. Use um simulador Modbus
2. Configure um CLP virtual
3. Os logs vão mostrar tentativas de reconexão (esperado)

---

## 📁 Estrutura de Arquivos

```
data-collector/
├── package.json          # Dependências e scripts
├── tsconfig.json         # Config TypeScript
├── .env                  # Variáveis de ambiente (criar)
├── prisma/
│   └── schema.prisma     # Schema do banco (copiar do backend)
└── src/
    ├── index.ts          # Entry point
    ├── config/
    │   └── database.ts   # Config Prisma
    ├── services/
    │   ├── PlcConnection.ts       # Conexão individual
    │   ├── PlcPoolManager.ts      # Pool de conexões
    │   ├── ProductionMonitor.ts   # Monitor de produção
    │   └── HealthCheck.ts         # Health check HTTP
    └── utils/
        └── logger.ts      # Logger Winston
```

---

## 📚 Documentação Relacionada

| Documento | Descrição |
|-----------|-----------|
| `INICIO_RAPIDO_DATA_COLLECTOR.md` | Guia de início rápido |
| `GUIA_DATA_COLLECTOR.md` | Guia completo e detalhado |
| `ARCHITECTURE_PROPOSAL.md` | Arquitetura do sistema |
| `DEPLOYMENT_GUIDE.md` | Guia de deployment |
| `README_SEPARACAO_CAPTACAO.md` | Visão geral da solução |

---

## ✅ Checklist Final

- [ ] Data Collector instalado e rodando
- [ ] Modbus desabilitado no backend
- [ ] Backend servindo apenas API (porta 3001)
- [ ] Data Collector fazendo polling (porta 3002 health check)
- [ ] Dados chegando no banco de dados
- [ ] Dashboard atualizando em tempo real
- [ ] PM2 configurado (Raspberry Pi)
- [ ] Auto-start configurado (Raspberry Pi)

---

**🎉 Pronto! O Data Collector está separado e funcionando!**

O sistema agora está escalável - você pode ter um Raspberry Pi para cada setor/CLP!

