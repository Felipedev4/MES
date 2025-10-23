# 🔍 Diagnóstico de Erro ao Enviar E-mail

## 📋 Passo a Passo para Identificar o Erro

### 1️⃣ **Verificar o Histórico de Envios** (MAIS RÁPIDO)

1. Acesse: **Alertas de Manutenção** → Aba **"Histórico de Envios"**
2. Procure o envio que falhou (ícone ❌ vermelho)
3. Clique no chip **"Ver erro"** na coluna "Erro"
4. **Copie a mensagem de erro completa**

---

### 2️⃣ **Verificar Logs do Backend**

No terminal onde o backend está rodando, procure por:

```
❌ Erro ao enviar e-mail: [MENSAGEM DE ERRO]
```

**Copie a mensagem de erro completa que aparece aqui!**

---

## 🔴 Erros Mais Comuns e Soluções

### ❌ Erro: "Invalid login" ou "Authentication failed"

**Causa:** Usuário ou senha incorretos

**Solução:**

#### Para Gmail:
```
IMPORTANTE: Gmail requer "Senha de App"!

1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Gere uma senha para "Mail"
5. Use essa senha de 16 caracteres no sistema

Configuração Gmail:
Host: smtp.gmail.com
Porta: 587
Secure: FALSE (desmarcar)
Usuário: seu-email@gmail.com
Senha: xxxx xxxx xxxx xxxx (Senha de App)
```

#### Para Outlook/Office365:
```
Host: smtp.office365.com
Porta: 587
Secure: FALSE (desmarcar)
Usuário: seu-email@outlook.com
Senha: sua-senha-normal
```

---

### ❌ Erro: "Connection timeout" ou "ETIMEDOUT"

**Causa:** Firewall bloqueando ou configuração incorreta

**Solução:**

1. **Verifique o Host:**
   - Gmail: `smtp.gmail.com`
   - Outlook: `smtp.office365.com`
   - Hotmail: `smtp.live.com`

2. **Verifique a Porta:**
   - Porta 587 → Secure deve ser **FALSE**
   - Porta 465 → Secure deve ser **TRUE**

3. **Firewall:**
   - Windows Defender pode estar bloqueando
   - Verifique se sua rede permite conexões SMTP

---

### ❌ Erro: "self signed certificate" ou "unable to verify"

**Causa:** Problema com certificado SSL

**Solução:**
✅ Já configurado automaticamente no sistema!
- O código aceita certificados auto-assinados
- Se o erro persistir, use porta 587 com Secure=FALSE

---

### ❌ Erro: "Greeting never received" ou "ECONNRESET"

**Causa:** Servidor SMTP não responde ou porta incorreta

**Solução:**

1. **Teste a conexão manualmente:**
```powershell
Test-NetConnection -ComputerName smtp.gmail.com -Port 587
```

2. **Verifique se não está usando VPN** que bloqueie SMTP

3. **Tente trocar a porta:**
   - Se estava usando 465, troque para 587
   - Se estava usando 587, troque para 465 (e ajuste Secure)

---

### ❌ Erro: "Missing credentials" ou "No recipients defined"

**Causa:** Campo de e-mail vazio ou inválido

**Solução:**

1. Verifique o **E-mail Config:**
   - Campos "Usuário" e "Senha" preenchidos
   - Campo "De (E-mail)" preenchido

2. Verifique o **Alerta de Manutenção:**
   - Campo "E-mails Destinatários" preenchido
   - E-mails separados por vírgula se houver mais de um

---

### ❌ Erro: "554 Message rejected" ou "550 Mailbox not found"

**Causa:** E-mail de destino inválido ou bloqueado

**Solução:**

1. Verifique se o e-mail de destino está correto
2. Verifique se o domínio do remetente não está em lista negra
3. Tente enviar para outro e-mail primeiro (para testar)

---

## 🧪 Teste Manual de Configuração

### Testar Passo a Passo:

1. **Configure um E-mail Config de Teste:**
   ```
   Nome: Teste Gmail
   Host: smtp.gmail.com
   Porta: 587
   Secure: NÃO (desmarcar)
   Usuário: seu-email@gmail.com
   Senha: [Senha de App de 16 dígitos]
   De (Nome): Sistema MES
   De (E-mail): seu-email@gmail.com
   ```

2. **Crie um Alerta de Teste:**
   ```
   Configuração SMTP: Teste Gmail
   Molde: Qualquer um
   Dias antes: 7
   Destinatários: seu-proprio-email@gmail.com
   ```

3. **Envie Manualmente:**
   - Clique em "Enviar Agora" no alerta
   - Aguarde 5-10 segundos

4. **Verifique o Resultado:**
   - Vá em "Histórico de Envios"
   - Se ❌ vermelho → veja o erro
   - Se ✅ verde → verifique seu e-mail (e spam!)

---

## 📊 Checklist de Verificação

Antes de reportar o erro, verifique:

- [ ] Porta está correta para o tipo de secure
  - Porta 587 → Secure = FALSE
  - Porta 465 → Secure = TRUE
  
- [ ] Gmail: está usando Senha de App?
  - [ ] Verificação em 2 etapas ativada
  - [ ] Senha de App gerada
  
- [ ] Campos obrigatórios preenchidos
  - [ ] Host, Porta, Usuário, Senha
  - [ ] De (Nome) e De (E-mail)
  - [ ] Destinatários no alerta
  
- [ ] Testou com outro provedor?
  - [ ] Se Gmail falhou, tentou Outlook?
  
- [ ] Verificou firewall/antivírus?
  - [ ] Windows Defender
  - [ ] Antivírus de terceiros

---

## 🛠️ Configurações Testadas que FUNCIONAM

### ✅ Gmail (Mais Confiável)
```yaml
Host: smtp.gmail.com
Porta: 587
Secure: false
Usuário: seu-email@gmail.com
Senha: [Senha de App - 16 dígitos]
De (E-mail): seu-email@gmail.com
```

### ✅ Outlook/Hotmail
```yaml
Host: smtp.office365.com   # ou smtp.live.com para hotmail
Porta: 587
Secure: false
Usuário: seu-email@outlook.com
Senha: sua-senha-normal
De (E-mail): seu-email@outlook.com
```

---

## 💡 Dicas Importantes

1. **E-mail "De" deve ser o mesmo do "Usuário"**
   - ❌ Usuário: teste@gmail.com / De: outro@gmail.com
   - ✅ Usuário: teste@gmail.com / De: teste@gmail.com

2. **Sempre use porta 587 para começar**
   - É a mais compatível
   - Secure deve estar DESMARCADO

3. **Gmail é mais confiável que outros**
   - Se tiver Gmail, use ele para testar primeiro

4. **Verifique SPAM**
   - Mesmo com ✅ verde, e-mail pode ir para spam

5. **Teste com seu próprio e-mail primeiro**
   - Assim você pode verificar se está recebendo

---

## 🆘 Se Nada Funcionar

Se tentou tudo acima e ainda não funciona:

1. **Copie o erro EXATO** do "Histórico de Envios"
2. **Copie sua configuração** (sem a senha!)
3. **Me envie essas informações:**
   ```
   Erro: [copie aqui]
   Provedor: Gmail/Outlook/Outro
   Host: [...]
   Porta: [...]
   Secure: Sim/Não
   ```

---

## 📞 Comandos Úteis para Diagnóstico

### Testar conexão com o servidor SMTP:
```powershell
# Gmail
Test-NetConnection -ComputerName smtp.gmail.com -Port 587

# Outlook
Test-NetConnection -ComputerName smtp.office365.com -Port 587
```

### Ver processos do backend:
```powershell
Get-Process -Name "node" | Select-Object Id, ProcessName, StartTime
```

### Ver logs em tempo real:
```powershell
# O terminal do backend já mostra os logs
# Procure por: ❌ Erro ao enviar e-mail: ...
```

---

## ✅ Próximos Passos

1. **Siga o checklist acima**
2. **Anote o erro exato**
3. **Tente as soluções sugeridas**
4. **Se não resolver, me envie:**
   - O erro completo
   - Sua configuração (host, porta, secure)
   - Provedor de e-mail que está usando

---

**Atualizado:** 23/10/2025  
**Versão:** 2.0

