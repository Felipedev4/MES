# Teste: Seleção de Empresa e Token JWT

## 🔍 Problema Identificado

O `companyId` não está sendo incluído no token JWT após a seleção da empresa, resultando em:
- ❌ Dados de registros com `companyId = NULL` sendo exibidos
- ❌ Nome da empresa não aparece no canto superior direito
- ❌ Dashboard mostra dados incorretos

## 📋 Teste Passo a Passo

### **1. Fazer Logout Completo**
1. Clique no ícone do usuário (canto superior direito)
2. Clique em **Logout**
3. Aguarde ser redirecionado para a tela de login

### **2. Fazer Login Novamente**
1. Entre com suas credenciais:
   - Email: seu email
   - Senha: sua senha
2. **IMPORTANTE**: Se aparecer a tela de seleção de empresa, **selecione "EMPRESA TESTE"**
3. Clique em confirmar/avançar

### **3. Verificar Logs do Backend**

Após selecionar a empresa, os logs devem mostrar:

```
🏢 Seleção de empresa - Usuário: 1, Empresa: 2
🔑 [SELECT-COMPANY] Payload do token: {"userId":1,"role":"ADMIN","companyId":2}
🔑 [SELECT-COMPANY] Token gerado: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Empresa selecionada - Usuário: admin, Empresa: EMPRESA TESTE
```

**ME ENVIE ESSES LOGS!**

### **4. Verificar no Navegador**

#### **4.1. Verificar nome da empresa no header**
- O nome "EMPRESA TESTE" deve aparecer no canto superior direito em um chip roxo/rosa
- Se não aparecer ou estiver vazio, há um problema

#### **4.2. Verificar Token no LocalStorage**
1. Pressione **F12** (DevTools)
2. Vá em **Application** → **Local Storage** → `http://localhost:3000`
3. Procure por `@MES:token`
4. Copie o valor completo
5. Cole em: https://jwt.io/
6. **ME ENVIE O CONTEÚDO DECODIFICADO** (parte Payload)

Deve aparecer:
```json
{
  "userId": 1,
  "role": "ADMIN",
  "companyId": 2,  // ← DEVE TER ESTE CAMPO!
  "iat": ...,
  "exp": ...
}
```

#### **4.3. Verificar dados da empresa no LocalStorage**
1. Ainda em **Application** → **Local Storage**
2. Procure por `@MES:company`
3. **ME ENVIE O CONTEÚDO**

Deve ser algo como:
```json
{
  "id": 2,
  "code": "EMP002",
  "name": "EMPRESA TESTE",
  "tradeName": "..."
}
```

### **5. Acessar o Dashboard**
1. Clique em **Dashboard** no menu lateral
2. Verifique os dados exibidos
3. **TIRE UM PRINT E ME ENVIE**

### **6. Verificar Logs do Dashboard**

Quando você acessar o Dashboard, os logs devem mostrar:

```
🔍 [DASHBOARD KPIs] User: { userId: 1, role: 'ADMIN', companyId: 2 }
🔍 [DASHBOARD KPIs] CompanyFilter: { companyId: 2 }
```

**Se aparecer `companyId: undefined` ou `companyId: null`, o problema persiste!**

## 🔄 Teste Alternativo: Trocar de Empresa

Se já estiver logado:

1. Clique no ícone do usuário (canto superior direito)
2. Clique em **"Trocar Empresa"** (ou similar)
3. Selecione "EMPRESA TESTE"
4. Confirme
5. Repita os passos 3, 4, 5 e 6 acima

## 🐛 Se o Problema Persistir

Se após esses testes o `companyId` ainda estiver `undefined`:

### **Verificar no Banco de Dados:**

Conecte no PostgreSQL e execute:

```sql
-- 1. Verificar empresas cadastradas
SELECT id, code, name FROM companies ORDER BY id;

-- 2. Verificar vínculo do usuário com empresas
SELECT uc.*, c.name as company_name, u.email as user_email
FROM user_companies uc
JOIN companies c ON c.id = uc."companyId"
JOIN users u ON u.id = uc."userId"
WHERE u.id = 1;  -- Seu userId

-- 3. Verificar empresa selecionada do usuário
SELECT id, email, name, "selectedCompanyId" 
FROM users 
WHERE id = 1;  -- Seu userId

-- 4. Verificar ordens de produção por empresa
SELECT "companyId", COUNT(*) as total_ordens
FROM production_orders
GROUP BY "companyId"
ORDER BY "companyId";

-- 5. Verificar se há ordens sem empresa
SELECT COUNT(*) as ordens_sem_empresa
FROM production_orders
WHERE "companyId" IS NULL;
```

**ME ENVIE OS RESULTADOS DESSAS QUERIES!**

## 📊 Resultado Esperado

### **Empresa TESTE (tem dados)**:
- OEE: ~28%
- Total Produzido: Valor > 0
- Utilização Cavidades: 75%
- Tempo Setup: Valor > 0
- Total Defeitos: 120

### **Empresa Exemplo LTDA (sem dados)**:
- OEE: 0%
- Total Produzido: 0
- Utilização Cavidades: 100% (padrão)
- Tempo Setup: 0 min
- Total Defeitos: 0

## 🎯 O que Preciso de Você

Por favor, me envie:

1. ✅ **Logs do backend** ao selecionar a empresa (console do VS Code)
2. ✅ **Token JWT decodificado** (de jwt.io)
3. ✅ **Conteúdo do @MES:company** (do LocalStorage)
4. ✅ **Print do Dashboard** com os dados
5. ✅ **Logs do backend** ao acessar o Dashboard
6. ✅ **Resultados das queries SQL** (se possível)

Com essas informações, posso identificar exatamente onde está o problema! 🔍

---

**Backend rodando**: ✅ Com logs de debug  
**Aguardando**: Seus testes e feedback

