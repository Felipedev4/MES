# Guia Rápido - Sistema de Colaboradores e Permissões

## ⚡ Instalação Rápida

### 1. Backend - Aplicar Migration

```bash
cd backend

# Gerar o Prisma Client com as novas mudanças
npx prisma generate

# Aplicar a migration
npx prisma migrate deploy

# OU criar uma nova migration
npx prisma migrate dev --name add_user_fields_and_permissions
```

### 2. Inicializar Permissões Padrão

Opção 1 - Via Frontend:
1. Acesse `http://localhost:3000/permissions`
2. Clique em "Restaurar Padrão"

Opção 2 - Via API diretamente:
```bash
curl -X POST http://localhost:3001/api/permissions/initialize
```

Opção 3 - Via Postman/Insomnia:
```
POST http://localhost:3001/api/permissions/initialize
```

### 3. Criar/Atualizar Usuário Admin

Se você já tem um usuário, atualize-o para ADMIN:

```bash
# Via Prisma Studio
cd backend
npx prisma studio

# Na interface web:
# 1. Abra a tabela "users"
# 2. Edite o usuário desejado
# 3. Altere "role" para "ADMIN"
# 4. Salve
```

Ou crie um novo via API:
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@mes.com",
    "password": "admin123",
    "role": "ADMIN",
    "active": true,
    "mustChangePassword": true
  }'
```

## 📋 Checklist de Verificação

- [ ] Backend iniciado sem erros
- [ ] Migration aplicada com sucesso
- [ ] Permissões padrão inicializadas
- [ ] Usuário ADMIN criado
- [ ] Login funcionando
- [ ] Página `/users` acessível
- [ ] Página `/permissions` acessível
- [ ] Menu atualizado com novos itens

## 🔧 Comandos Úteis

### Ver status das migrations
```bash
cd backend
npx prisma migrate status
```

### Resetar banco (CUIDADO - apaga tudo!)
```bash
cd backend
npx prisma migrate reset
```

### Ver schema do banco
```bash
cd backend
npx prisma studio
```

### Rebuild do frontend
```bash
cd frontend
npm run build
```

## 🐛 Solução de Problemas Comuns

### Erro: "Column does not exist"
**Causa**: Migration não foi aplicada
**Solução**:
```bash
cd backend
npx prisma migrate deploy
```

### Erro: "Role DIRECTOR does not exist"
**Causa**: Enum não foi atualizado no banco
**Solução**:
```bash
cd backend
npx prisma migrate reset  # CUIDADO: apaga dados
npx prisma migrate deploy
```

### Erro: "Cannot find module 'UserController'"
**Causa**: TypeScript não compilou os novos arquivos
**Solução**:
```bash
cd backend
npm run build
npm run dev
```

### Página /users retorna 404
**Causa**: Rotas não foram registradas
**Solução**: Verifique se `server.ts` foi atualizado corretamente

### Frontend não mostra novas páginas
**Causa**: Cache do navegador ou compilação
**Solução**:
```bash
cd frontend
rm -rf node_modules/.cache
npm start
```
Ou limpe o cache do navegador (Ctrl+Shift+R)

## 📊 Testar o Sistema

### 1. Teste de Login
```bash
POST /api/auth/login
{
  "email": "admin@mes.com",
  "password": "admin123"
}
```

### 2. Teste de Criação de Usuário
```bash
POST /api/users
{
  "name": "João Operador",
  "email": "joao@mes.com",
  "password": "joao123",
  "role": "OPERATOR",
  "employeeCode": "OPR001",
  "department": "Produção"
}
```

### 3. Teste de Permissões
```bash
GET /api/permissions/role/OPERATOR
```

### 4. Teste de Reset de Senha
```bash
POST /api/users/1/reset-password
{
  "newPassword": "novaSenha123",
  "mustChangePassword": true
}
```

## 🎯 Ordem Recomendada de Testes

1. ✅ Aplicar migration
2. ✅ Inicializar permissões
3. ✅ Criar usuário ADMIN
4. ✅ Fazer login
5. ✅ Acessar `/users`
6. ✅ Criar um usuário OPERATOR
7. ✅ Acessar `/permissions`
8. ✅ Verificar permissões do OPERATOR
9. ✅ Fazer logout
10. ✅ Login com usuário OPERATOR
11. ✅ Verificar acesso restrito

## 📱 Teste Mobile

1. Obtenha o IP da sua máquina:
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

2. Atualize o `.env` do frontend:
```env
REACT_APP_API_URL=http://SEU_IP:3001/api
```

3. Acesse do celular:
```
http://SEU_IP:3000
```

## 🚀 Deploy em Produção

### Backend
```bash
cd backend
npm run build
npm run start
```

### Frontend
```bash
cd frontend
npm run build
# Sirva a pasta build/ com nginx ou similar
```

### Variáveis de Ambiente Importantes
```env
# Backend
DATABASE_URL=postgresql://user:password@host:5432/mes_db
JWT_SECRET=seu_secret_super_seguro
NODE_ENV=production

# Frontend
REACT_APP_API_URL=https://api.seudominio.com/api
```

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do backend
2. Verifique o console do navegador
3. Teste as APIs diretamente (Postman/Insomnia)
4. Verifique se todas as migrations foram aplicadas
5. Verifique se as dependências estão instaladas

---

**Boa sorte!** 🎉

