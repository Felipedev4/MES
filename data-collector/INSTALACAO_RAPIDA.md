# ⚡ Instalação Rápida no Raspberry Pi

## 📦 Instalação Automática (Recomendado)

### Opção 1: Download direto e instalação

```bash
# Baixar o script de instalação
wget https://raw.githubusercontent.com/Felipedev4/MES/main/data-collector/install-raspberry.sh

# Tornar executável
chmod +x install-raspberry.sh

# Executar
./install-raspberry.sh
```

### Opção 2: Clonar repositório primeiro

```bash
# Criar diretório
sudo mkdir -p /opt/mes
sudo chown $USER:$USER /opt/mes
cd /opt/mes

# Clonar repositório
git clone https://github.com/Felipedev4/MES.git
cd MES/data-collector

# Executar instalação
chmod +x install-raspberry.sh
./install-raspberry.sh
```

---

## 🎯 O que o script faz?

✅ Atualiza o sistema  
✅ Instala Node.js v20 LTS  
✅ Instala Git  
✅ Instala PM2  
✅ Clona o repositório  
✅ Instala dependências  
✅ Configura arquivo .env (com suas credenciais)  
✅ Gera Prisma Client  
✅ Testa conexão com banco  
✅ Cria configuração PM2  

---

## 📝 Informações necessárias

Tenha em mãos:

- **IP do servidor PostgreSQL**: Ex: `192.168.1.100`
- **Porta PostgreSQL**: Padrão `5432`
- **Nome do banco**: Ex: `mes_db`
- **Usuário do banco**: Ex: `postgres`
- **Senha do banco**
- **Porta Health Check**: Padrão `3002`

---

## 🚀 Após a instalação

### 1. Compilar o projeto

```bash
cd /opt/mes/MES/data-collector
npm run build
```

### 2. Testar manualmente

```bash
npm start
```

**Deve aparecer:**
```
[info]: ✅ Conectado ao banco de dados PostgreSQL
[info]: 🔌 PlcPoolManager: Iniciando...
[info]: 📊 ProductionMonitor: Iniciado
[info]: 🏥 Health Check server rodando na porta 3002
```

**Parar:** `Ctrl + C`

### 3. Iniciar com PM2 (produção)

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Seguir instruções exibidas
```

### 4. Verificar status

```bash
# Ver logs em tempo real
pm2 logs mes-data-collector

# Ver status
pm2 status

# Testar health check
curl http://localhost:3002/health
```

---

## 🔧 Comandos Úteis

```bash
# Ver logs
pm2 logs mes-data-collector

# Reiniciar
pm2 restart mes-data-collector

# Parar
pm2 stop mes-data-collector

# Status
pm2 status

# Monitoramento
pm2 monit
```

---

## 📖 Documentação Completa

Para instalação manual passo a passo, consulte:
- **INSTALACAO_RASPBERRY_PI.md** - Guia completo detalhado

---

## ⚠️ Troubleshooting Rápido

### Erro de conexão com banco

```bash
# Testar conectividade
ping IP_DO_SERVIDOR
telnet IP_DO_SERVIDOR 5432

# Editar configuração se necessário
nano .env
```

### Erro ao conectar CLP

```bash
# Testar conectividade
ping IP_DO_CLP
telnet IP_DO_CLP 502
```

### Ver logs detalhados

```bash
pm2 logs mes-data-collector --lines 100
```

---

## 📞 Suporte

Documentação completa: `INSTALACAO_RASPBERRY_PI.md`

---

**🎉 Pronto! Data Collector instalado e funcionando!**

