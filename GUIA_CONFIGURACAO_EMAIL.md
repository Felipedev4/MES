# 📧 Guia de Configuração de E-mail

## Por que os e-mails não estão sendo recebidos?

Se você configurou os alertas mas os e-mails não estão chegando, siga este checklist:

---

## ✅ Checklist de Verificação

### 1. **Verificar Configuração SMTP**

Acesse: **Configurações → E-mail Config** e verifique:

- ✅ **Host**: Endereço do servidor SMTP (ex: `smtp.gmail.com`, `smtp.office365.com`)
- ✅ **Porta**: 
  - **465** para SSL (secure = true)
  - **587** para TLS/STARTTLS (secure = false)
  - **25** para sem criptografia (não recomendado)
- ✅ **Nome de Usuário**: E-mail completo (ex: `seu-email@gmail.com`)
- ✅ **Senha**: 
  - **Gmail**: Use "Senha de App" (não sua senha normal)
  - **Outlook/Office365**: Senha normal ou senha de app
- ✅ **Secure**: 
  - `true` para porta 465
  - `false` para porta 587

---

### 2. **Configurações por Provedor**

#### 📮 **Gmail**

```
Host: smtp.gmail.com
Porta: 587
Secure: false (TLS)
Usuário: seu-email@gmail.com
Senha: **** (Senha de App - veja abaixo)
```

**⚠️ IMPORTANTE**: Gmail requer **Senha de App**:
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Gere uma senha para "Mail" ou "Outro"
5. Use essa senha de 16 caracteres no sistema

---

#### 📮 **Outlook / Office 365**

```
Host: smtp.office365.com
Porta: 587
Secure: false (TLS)
Usuário: seu-email@outlook.com
Senha: sua-senha-normal
```

---

#### 📮 **Hotmail**

```
Host: smtp.live.com
Porta: 587
Secure: false (TLS)
Usuário: seu-email@hotmail.com
Senha: sua-senha-normal
```

---

#### 📮 **Outros Provedores**

Pesquise "SMTP settings" + nome do seu provedor

---

### 3. **Testar Envio**

1. Vá em **Alertas de Manutenção**
2. Clique em **"Enviar Agora"** em um alerta configurado
3. Verifique os **Logs de E-mail** na aba **"Histórico de Envios"**
4. Se houver erro, clique no ícone de erro para ver detalhes

---

### 4. **Erros Comuns**

| Erro | Solução |
|------|---------|
| **"Invalid login"** | Usuário ou senha incorretos. Gmail: use Senha de App |
| **"Connection timeout"** | Verifique host e porta. Firewall pode estar bloqueando |
| **"Self signed certificate"** | Normal em desenvolvimento. Produção: use certificado válido |
| **"535 Authentication failed"** | Senha incorreta ou conta bloqueada |
| **"554 Message rejected"** | E-mail pode estar em lista de spam. Verifique reputação do domínio |

---

### 5. **Verificar Pasta de Spam**

Os e-mails podem estar indo para **Spam/Lixo Eletrônico**:

- ✅ Verifique a pasta de spam do destinatário
- ✅ Marque como "Não é spam"
- ✅ Adicione o remetente aos contatos confiáveis

---

### 6. **Verificar Logs no Backend**

No terminal do backend, procure por mensagens como:

```
✅ E-mail enviado com sucesso: [assunto] para [destinatário]
❌ Erro ao enviar e-mail: [mensagem de erro]
```

Se aparecer ✅ mas o e-mail não chegou → **verificar spam**
Se aparecer ❌ → **verificar configuração SMTP**

---

## 🧪 Função de Teste Implementada

### Testar Configuração de E-mail

Para ter certeza que a configuração está correta:

1. Configure o **E-mail Config** corretamente
2. Crie um **Alerta de Manutenção** com seu e-mail
3. Clique em **"Enviar Agora"**
4. Verifique o **Histórico de Envios**

---

## 🗑️ Botão "Limpar Histórico" (NOVO!)

Agora você pode limpar o histórico de e-mails enviados:

1. Vá para aba **"Histórico de Envios"**
2. Clique em **"Limpar Histórico"**
3. Confirme a ação
4. Todos os logs serão deletados (filtrado por empresa)

⚠️ **Atenção**: Esta ação é irreversível!

---

## 📊 Verificar Status dos Envios

Na aba **"Histórico de Envios"**:

- ✅ **Ícone verde** = E-mail enviado com sucesso
- ❌ **Ícone vermelho** = Falha no envio (clique para ver o erro)

---

## 🔧 Dicas Adicionais

### Desenvolvimento (localhost)
- Use porta **587** (TLS) ao invés de 465 (SSL)
- Desabilite verificação de certificado (já configurado)

### Produção
- Use **SSL (porta 465)** se possível
- Configure **SPF e DKIM** no domínio para evitar spam
- Use e-mail corporativo com boa reputação

---

## 📞 Suporte

Se após seguir todos os passos os e-mails ainda não chegarem:

1. **Capture o erro exato** do Histórico de Envios
2. **Verifique os logs do backend** no terminal
3. **Teste a configuração SMTP** com outra ferramenta (ex: Thunderbird)
4. **Contate o administrador** do servidor de e-mail

---

## ✨ Recursos Implementados

- ✅ Sistema de envio de e-mails com Nodemailer
- ✅ Criptografia de senhas de e-mail
- ✅ Logs detalhados de envios (sucesso e erro)
- ✅ **Botão "Limpar Histórico"** (NOVO!)
- ✅ Envio manual de alertas
- ✅ Scheduler automático diário (8:00 AM)
- ✅ Verificação de duplicatas (24h)
- ✅ Debug mode em desenvolvimento
- ✅ Suporte a TLS/SSL

---

Última atualização: 23/10/2025

