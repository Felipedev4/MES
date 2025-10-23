# 🔐 Corrigir Senha do PostgreSQL

## Problema Atual

```
❌ Authentication failed against database server at `localhost`
```

A senha do PostgreSQL no arquivo `.env` está incorreta.

## ✅ Soluções Rápidas

### Opção 1: Testar Senhas Comuns

Tente conectar com cada uma dessas senhas:

```powershell
# Teste 1: Senha vazia
psql -U postgres -d mes_db

# Teste 2: Senha "postgres"  
$env:PGPASSWORD="postgres"; psql -U postgres -d mes_db

# Teste 3: Senha "admin"
$env:PGPASSWORD="admin"; psql -U postgres -d mes_db

# Teste 4: Senha "root"
$env:PGPASSWORD="root"; psql -U postgres -d mes_db

# Teste 5: Senha "123456"
$env:PGPASSWORD="123456"; psql -U postgres -d mes_db
```

**Se alguma funcionar**, anote a senha e pule para **"Atualizar .env"** abaixo.

---

### Opção 2: Resetar Senha do PostgreSQL (Recomendado)

#### Passo 1: Encontrar arquivo pg_hba.conf

```powershell
# Procurar arquivo de configuração
Get-ChildItem -Path "C:\Program Files\PostgreSQL" -Recurse -Filter "pg_hba.conf" -ErrorAction SilentlyContinue
```

Ou geralmente está em:
```
C:\Program Files\PostgreSQL\18\data\pg_hba.conf
```

#### Passo 2: Editar pg_hba.conf (como Administrador)

```powershell
# Abrir como administrador
notepad "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
```

**Encontre estas linhas:**
```conf
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
```

**Mude temporariamente para:**
```conf
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
```

**Salve o arquivo.**

#### Passo 3: Reiniciar PostgreSQL

```powershell
# Parar serviço
Stop-Service postgresql-x64-18

# Aguardar 3 segundos
Start-Sleep -Seconds 3

# Iniciar serviço
Start-Service postgresql-x64-18

# Verificar status
Get-Service postgresql-x64-18
```

#### Passo 4: Conectar SEM senha e resetar

```powershell
# Conectar (não pedirá senha agora)
psql -U postgres

# Dentro do psql, executar:
# ALTER USER postgres PASSWORD 'nova_senha_aqui';
# \q
```

Exemplo:
```sql
ALTER USER postgres PASSWORD 'postgres123';
\q
```

#### Passo 5: Reverter pg_hba.conf

```powershell
notepad "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
```

**Volte para:**
```conf
host    all             all             127.0.0.1/32            scram-sha-256
```

**Salve e reinicie novamente:**
```powershell
Restart-Service postgresql-x64-18
```

#### Passo 6: Testar nova senha

```powershell
$env:PGPASSWORD="postgres123"; psql -U postgres -d mes_db
```

Se conectar: ✅ Senha correta!

---

### Opção 3: Usar pgAdmin para Descobrir/Resetar Senha

Se você tem **pgAdmin** instalado:

1. Abrir pgAdmin
2. Tentar conectar ao servidor local
3. Se conectar, já sabe a senha!
4. Se não, use pgAdmin para resetar a senha do usuário postgres

---

## 📝 Atualizar .env com Senha Correta

Depois de descobrir a senha correta, edite o arquivo:

```powershell
notepad backend\.env
```

**Modifique a linha DATABASE_URL:**

```env
DATABASE_URL="postgresql://postgres:SENHA_CORRETA_AQUI@localhost:5432/mes_db?schema=public"
```

**Exemplos:**
```env
# Se a senha for "postgres123"
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mes_db?schema=public"

# Se a senha for vazia
DATABASE_URL="postgresql://postgres:@localhost:5432/mes_db?schema=public"

# Se a senha for "admin"
DATABASE_URL="postgresql://postgres:admin@localhost:5432/mes_db?schema=public"
```

**Salve o arquivo.**

---

## 🧪 Testar Conexão

### Teste 1: Via psql

```powershell
# Substitua SENHA pela senha correta
$env:PGPASSWORD="SENHA"; psql -U postgres -d mes_db

# Se entrar no prompt psql=> significa que funcionou!
# Digite \q para sair
```

### Teste 2: Via Prisma Studio

```powershell
cd backend
npm run prisma:studio
```

Se abrir o navegador com Prisma Studio = ✅ Conexão OK!

### Teste 3: Iniciar Backend

```powershell
cd backend
npm run dev
```

**Aguarde ver:**
```
✅ Database connected successfully
🚀 Servidor MES iniciado com sucesso!
```

---

## 🚀 Depois de Corrigir

1. ✅ Backend iniciará sem erros
2. ✅ Data collector poderá conectar
3. ✅ Timeout não acontecerá mais

**Reinicie o backend:**
```powershell
cd backend
npm run dev
```

---

## 🆘 Se Nada Funcionar

### Criar novo usuário PostgreSQL

```powershell
psql -U postgres

# No psql:
CREATE USER mesuser WITH PASSWORD 'mes123456';
CREATE DATABASE mes_db OWNER mesuser;
GRANT ALL PRIVILEGES ON DATABASE mes_db TO mesuser;
\q
```

**Atualizar .env:**
```env
DATABASE_URL="postgresql://mesuser:mes123456@localhost:5432/mes_db?schema=public"
```

**Rodar migrations:**
```powershell
cd backend
npx prisma migrate deploy
npm run seed
```

---

## 📋 Checklist

- [ ] Descobri a senha do PostgreSQL
- [ ] Atualizei `backend/.env` com senha correta
- [ ] Testei conexão com `psql`
- [ ] Testei com `npm run prisma:studio`
- [ ] Backend inicia sem erro de autenticação
- [ ] Vi mensagem "✅ Database connected successfully"

---

Criado em: 22/10/2024
Problema: Autenticação PostgreSQL
Status: Aguardando senha correta

