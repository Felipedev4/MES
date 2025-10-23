# 🔑 Solução: CompanyId Não Está no Token JWT

## 🎯 Problema Identificado

O token JWT não contém o campo `companyId`, causando erro nos filtros do Dashboard.

**Token Atual (Incorreto):**
```json
{
  "userId": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1760983879,
  "exp": 1761588679
  // ❌ SEM companyId!
}
```

**Token Esperado (Correto):**
```json
{
  "userId": 1,
  "username": "admin",
  "role": "admin",
  "companyId": 2,  // ✅ COM companyId!
  "iat": 1760983879,
  "exp": 1761588679
}
```

## 📋 Causa

O usuário fez login mas **não selecionou uma empresa** na tela de seleção, ou está usando um token antigo do localStorage.

O sistema funciona assim:
1. **Login inicial** → Token SEM `companyId` (se tiver múltiplas empresas)
2. **Seleção de empresa** → Token NOVO COM `companyId`
3. **Dashboard** → Usa o `companyId` do token para filtrar dados

## ✅ Solução: Passo a Passo

### 1️⃣ Fazer Logout

No sistema, clique em **Sair/Logout** para limpar o token atual.

### 2️⃣ Fazer Login Novamente

```
Email: admin@admin.com
Senha: (sua senha)
```

### 3️⃣ Selecionar a Empresa

Na tela de **"Selecione a Empresa"**, escolha:
- ✅ **EMPRESA TESTE** (EMP001) - tem dados de ordens, moldes e apontamentos
- ❌ **Empresa Exemplo LTDA** (EMP000) - não tem dados

### 4️⃣ Verificar o Novo Token

Após selecionar a empresa:

1. Abra o **DevTools** (F12)
2. Vá para **Application** → **Local Storage** → `http://192.168.2.105:3000`
3. Copie o valor de `@MES:token`
4. Cole em https://jwt.io
5. ✅ Confirme que o payload agora contém `"companyId": 2`

### 5️⃣ Acessar o Dashboard

Agora, ao acessar o Dashboard, você verá:
- ✅ Todos os KPIs com valores corretos da **EMPRESA TESTE**
- ✅ Gráficos filtrados pela empresa selecionada
- ✅ Logs do backend mostrando:
  ```
  🔍 [DASHBOARD KPIs] User: { userId: 1, role: 'ADMIN', companyId: 2 }
  🔍 [DASHBOARD KPIs] CompanyFilter: { companyId: 2 }
  ```

## 🔧 Código Relevante

### Backend: `authController.ts` (linha 223-289)

```typescript
export async function selectCompany(req: Request, res: Response): Promise<void> {
  const { userId, companyId } = req.body;

  // Verificar acesso
  const userCompany = await prisma.userCompany.findUnique({
    where: {
      userId_companyId: { userId, companyId },
    },
    include: { company: true, user: true },
  });

  if (!userCompany) {
    res.status(400).json({ error: 'Usuário não tem acesso a esta empresa' });
    return;
  }

  // Gerar token com companyId ✅
  const tokenPayload = {
    userId: userCompany.user.id,
    role: userCompany.user.role,
    companyId: companyId,  // ✅ AQUI!
  };
  
  const token = generateToken(tokenPayload);

  res.json({
    token,
    user: { ...userCompany.user, selectedCompanyId: companyId },
    company: userCompany.company,
  });
}
```

### Frontend: `SelectCompany.tsx` (linha 52-73)

```typescript
const handleSelectCompany = async () => {
  const response = await api.post('/auth/select-company', {
    userId: user.id,
    companyId: selectedCompanyId,
  });

  // Salvar novo token com companyId ✅
  localStorage.setItem('@MES:token', response.data.token);
  localStorage.setItem('@MES:user', JSON.stringify(response.data.user));
  localStorage.setItem('@MES:company', JSON.stringify(response.data.company));

  navigate('/dashboard');
};
```

## 📊 Resultado Esperado

Após fazer login e selecionar **EMPRESA TESTE**:

### Logs do Backend:
```
🔍 [DASHBOARD KPIs] User: { userId: 1, role: 'ADMIN', companyId: 2 }
🔍 [DASHBOARD KPIs] CompanyFilter: { companyId: 2 }
```

### Dashboard:
- **Ordens Totais**: ~60 (apenas da EMPRESA TESTE)
- **Utilização de Cavidades**: ~85%
- **Total de Defeitos**: ~500
- **Componentes de OEE**: valores reais
- **Top 5 Defeitos**: gráfico com dados

### Ao trocar para **Empresa Exemplo LTDA**:
- **Todos os KPIs**: 0 (zerados)
- **Gráficos**: vazios
- **Logs**: `companyId: 1` (não tem dados)

## 🎯 Próximos Passos

1. ✅ Fazer logout/login e selecionar **EMPRESA TESTE**
2. ✅ Verificar que o token tem `companyId`
3. ✅ Confirmar que o Dashboard mostra dados corretos
4. ✅ Testar trocar de empresa e ver KPIs zerados para empresa sem dados

---

**Criado em:** 23/10/2025  
**Status:** ✅ Pronto para testar

