# ✅ Checklist Rápido: Corrigir Token sem CompanyId

## 🚀 Execute AGORA (2 minutos)

### ☑️ 1. Fazer Logout
- Acesse o sistema: http://192.168.2.105:3000
- Clique em **Sair/Logout**

### ☑️ 2. Fazer Login
- Email: `admin@admin.com`
- Senha: (sua senha)

### ☑️ 3. Selecionar Empresa
Na tela de seleção, escolha:
- ✅ **EMPRESA TESTE** (EMP001)

Clique em **Continuar**

### ☑️ 4. Verificar Token (DevTools)

1. Pressione `F12` (DevTools)
2. Vá para: **Application** → **Local Storage** → `http://192.168.2.105:3000`
3. Clique em `@MES:token`
4. Copie o valor
5. Cole em https://jwt.io

**✅ Verifique que o payload AGORA tem:**
```json
{
  "userId": 1,
  "role": "admin",
  "companyId": 2,  // ✅ Deve estar presente!
  ...
}
```

### ☑️ 5. Acessar Dashboard

- Vá para: http://192.168.2.105:3000/dashboard
- ✅ Verifique que os KPIs mostram valores reais (não zerados)

### ☑️ 6. Verificar Logs do Backend

No terminal do backend, você deve ver:
```
🔍 [DASHBOARD KPIs] User: { userId: 1, role: 'ADMIN', companyId: 2 }
🔍 [DASHBOARD KPIs] CompanyFilter: { companyId: 2 }
```

## 🎯 Resultado Esperado

✅ **Dashboard da EMPRESA TESTE deve mostrar:**
- Ordens Totais: ~60
- Ordens Ativas: ~1
- Produção Total: ~1500 peças
- Utilização de Cavidades: ~85%
- Total de Defeitos: ~500
- Componentes de OEE: valores reais
- Gráficos: com dados

## ❌ Se ainda não funcionar

Execute no terminal (dentro de `backend/`):
```bash
npm run dev
```

E repita os passos 1-6.

---

**Tempo estimado:** 2-3 minutos  
**Dificuldade:** Fácil

