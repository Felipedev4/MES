# 📧 Configuração Gmail - Passo a Passo COMPLETO

## 🎯 Problema Atual:
```
❌ Error: self-signed certificate in certificate chain
```

**Causa:** Você está usando **Secure MARCADO** ou **porta 465**. Gmail requer configuração específica!

---

## ✅ SOLUÇÃO: Configuração Correta para Gmail

### **Passo 1: Gerar Senha de App no Gmail** ⚠️ OBRIGATÓRIO!

Gmail **NÃO aceita** senha normal! Você PRECISA de uma "Senha de App":

1. **Acesse:** https://myaccount.google.com/security

2. **Na seção "Como fazer login no Google":**
   - Procure por **"Verificação em duas etapas"**
   - Se não estiver ativada → **Ative agora**

3. **Depois de ativar a verificação em duas etapas:**
   - Volte para https://myaccount.google.com/security
   - Procure por **"Senhas de app"** (pode estar em "Verificação em duas etapas")
   - Clique em **"Senhas de app"**

4. **Gerar a senha:**
   - **Selecionar app:** E-mail
   - **Selecionar dispositivo:** Outro (personalizado)
   - **Nome:** Digite "Sistema MES"
   - Clique em **"Gerar"**

5. **COPIE a senha:**
   - Aparecerá uma senha de 16 dígitos (exemplo: `abcd efgh ijkl mnop`)
   - **COPIE essa senha SEM os espaços** → `abcdefghijklmnop`
   - ⚠️ **Guarde essa senha**, você não conseguirá vê-la novamente!

---

### **Passo 2: Configurar no Sistema MES**

No sistema, vá em **Configurações → E-mail Config** e preencha:

```
┌─────────────────────────────────────────────┐
│ CONFIGURAÇÃO GMAIL (EXATA)                  │
├─────────────────────────────────────────────┤
│                                             │
│ Nome: Gmail MES                             │
│                                             │
│ ===== DADOS DO SERVIDOR =====              │
│                                             │
│ Host: smtp.gmail.com                        │
│      └─ EXATAMENTE isso, sem espaços       │
│                                             │
│ Porta: 587                                  │
│       └─ NÃO use 465! Deve ser 587         │
│                                             │
│ Secure: [ ] DESMARCAR                       │
│        └─ A caixinha NÃO pode estar marcada│
│                                             │
│ ===== DADOS DE LOGIN =====                 │
│                                             │
│ Usuário: seu-email@gmail.com                │
│         └─ Seu e-mail completo             │
│                                             │
│ Senha: abcdefghijklmnop                     │
│       └─ A SENHA DE APP de 16 caracteres!  │
│          NÃO é sua senha normal do Gmail!  │
│                                             │
│ ===== DADOS DO REMETENTE =====             │
│                                             │
│ De (Nome): Sistema MES                      │
│           └─ Nome que aparecerá no e-mail  │
│                                             │
│ De (E-mail): seu-email@gmail.com            │
│             └─ MESMO e-mail do campo       │
│                "Usuário" acima              │
│                                             │
│ Ativo: [✓] MARCAR                          │
│                                             │
└─────────────────────────────────────────────┘
```

---

### **Passo 3: Salvar e Testar**

1. Clique em **"Salvar"**
2. Clique em **"Testar Configuração"** (ícone de teste na lista)
3. Se aparecer **"Teste concluído com sucesso!"** → ✅ PRONTO!
4. Se aparecer erro → veja o checklist abaixo

---

## ✅ CHECKLIST (Marque cada item)

Verifique TODOS estes pontos:

- [ ] **Verificação em duas etapas** está ATIVADA no Gmail
- [ ] Gerou a **Senha de App** (16 caracteres)
- [ ] **Host** é exatamente: `smtp.gmail.com`
- [ ] **Porta** é: `587` (NÃO 465!)
- [ ] **Secure** está **DESMARCADO** ❌
- [ ] **Usuário** é seu e-mail completo: `seu@gmail.com`
- [ ] **Senha** é a **Senha de App**, NÃO sua senha normal
- [ ] **De (E-mail)** é o MESMO e-mail do campo "Usuário"

---

## 🔥 ERROS COMUNS

### ❌ "self-signed certificate in certificate chain"
**Causa:** Você marcou "Secure" ou está usando porta 465
**Solução:** 
- Use porta **587**
- **DESMARQUE** Secure

### ❌ "Invalid login" ou "Authentication failed"
**Causa:** Senha incorreta ou senha normal ao invés de Senha de App
**Solução:**
- Gere uma **nova Senha de App**
- Cole ela SEM espaços
- Verifique se a verificação em 2 etapas está ativa

### ❌ "Connection timeout" ou "ETIMEDOUT"
**Causa:** Firewall bloqueando ou rede restritiva
**Solução:**
- Desative temporariamente o antivírus/firewall
- Se estiver em rede corporativa, peça liberação da porta 587

---

## 🧪 TESTE RÁPIDO

Depois de configurar corretamente:

1. Vá em **Alertas de Manutenção**
2. Crie um alerta de teste:
   ```
   Configuração SMTP: Gmail MES
   Molde: Qualquer um
   Dias antes: 7
   Destinatários: SEU-PROPRIO-EMAIL@gmail.com
   ```
3. Clique em **"Enviar Agora"**
4. Vá na aba **"Histórico de Envios"**
5. Se aparecer ✅ verde → **SUCESSO!**
6. Se aparecer ❌ vermelho → clique no erro e me diga qual é

---

## 📱 Como Gerar Senha de App no Celular

Se preferir fazer pelo celular:

1. Abra o app **Gmail**
2. Toque no seu **perfil** (canto superior direito)
3. Toque em **"Gerenciar sua Conta do Google"**
4. Vá em **"Segurança"**
5. Role até **"Verificação em duas etapas"** → Ative
6. Volte e toque em **"Senhas de app"**
7. Gere uma senha para "E-mail" em "Outro dispositivo"
8. Copie a senha de 16 caracteres

---

## 🎥 Tutorial Visual

Se ainda tiver dúvida, pesquise no YouTube:
- "Como gerar senha de app Gmail 2024"
- "Gmail app password for SMTP"

---

## ⚡ RESUMO ULTRA-RÁPIDO

```yaml
Host: smtp.gmail.com
Porta: 587
Secure: false (DESMARCADO)
Usuário: seu@gmail.com
Senha: [Senha de App de 16 caracteres]
De: seu@gmail.com
```

**IMPORTANTE:** 
- ✅ Porta 587 + Secure DESMARCADO
- ✅ Senha de App (não senha normal)
- ✅ Verificação em 2 etapas ativa

---

## 💬 Ainda com Erro?

Se seguiu TODOS os passos e ainda dá erro:

1. **Copie o erro EXATO** do "Histórico de Envios"
2. **Me diga:**
   - Porta que está usando: ____
   - Secure está marcado? ____
   - Gerou a Senha de App? ____
   - Verificação em 2 etapas está ativa? ____

---

**Atualizado:** 23/10/2025  
**Status:** Erro de certificado corrigido ✅

