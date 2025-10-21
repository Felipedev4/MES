# Guia de Início Rápido - Sistema MES

## ⚡ Início em 5 Minutos

Este guia irá te colocar rodando rapidamente o Sistema MES.

### Pré-requisitos

✅ Node.js 18+ instalado  
✅ PostgreSQL 14+ instalado e rodando  
✅ Git instalado  

### Passo 1: Configurar Banco de Dados (2 min)

Abra o terminal do PostgreSQL (psql) e execute:

```sql
CREATE DATABASE mes_db;
```

### Passo 2: Configurar Backend (2 min)

```bash
# Navegar para pasta do backend
cd C:\Empresas\Desenvolvimento\MES\backend

# Instalar dependências
npm install

# Criar arquivo .env
echo DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/mes_db" > .env
echo JWT_SECRET="MES_SECRET_2025" >> .env
echo PORT=3001 >> .env

# Executar migrations e seed
npx prisma migrate dev
npx prisma db seed

# Iniciar servidor
npm run dev
```

**✅ Backend rodando em http://localhost:3001**

### Passo 3: Configurar Frontend (1 min)

Abra um **novo terminal**:

```bash
# Navegar para pasta do frontend
cd C:\Empresas\Desenvolvimento\MES\frontend

# Instalar dependências
npm install

# Criar arquivo .env
echo REACT_APP_API_URL=http://localhost:3001 > .env
echo REACT_APP_WS_URL=http://localhost:3001 >> .env

# Iniciar aplicação
npm start
```

**✅ Frontend abrirá automaticamente em http://localhost:3000**

### Passo 4: Fazer Login

Use as credenciais padrão:

- **Email:** `admin@mes.com`
- **Senha:** `admin123`

### 🎉 Pronto!

Você já pode:
- ✅ Ver o Dashboard com KPIs
- ✅ Cadastrar Itens, Moldes e Ordens
- ✅ Registrar Paradas
- ✅ Fazer Apontamentos Manuais

## 📋 Próximos Passos

1. **Explorar Cadastros:** Vá em Itens, Moldes e crie registros de teste
2. **Criar Ordem de Produção:** Navegue para "Ordens de Produção" e crie uma ordem
3. **Testar Apontamento:** Vá em "Produção" e faça um apontamento manual
4. **Ver Dashboard:** Observe os gráficos sendo atualizados

## 🔌 Configurar CLP (Opcional)

Se você tiver um CLP DVP-12SE:

1. Edite o arquivo `backend/.env`:
```env
MODBUS_HOST=192.168.1.100  # IP do seu CLP
MODBUS_PORT=502
MODBUS_UNIT_ID=1
MODBUS_REGISTER_D33=33
```

2. Reinicie o backend
3. Vá em "Produção" e veja o status da conexão

## 📚 Documentação Completa

- **Instalação Detalhada:** [INSTALL.md](INSTALL.md)
- **Arquitetura:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **API:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Swagger:** http://localhost:3001/api-docs

## ❓ Problemas Comuns

### Backend não inicia
- Verifique se PostgreSQL está rodando
- Confirme a senha no arquivo `.env`
- Execute `npx prisma db push`

### Frontend não conecta
- Verifique se backend está rodando
- Confirme o URL no `.env` do frontend

### Sem permissão
- Use conta admin@mes.com para todas as funcionalidades

## 🆘 Suporte

Consulte a documentação completa ou os logs do console para mais detalhes.


