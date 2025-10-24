# 🔍 DEBUG: Email de Parada Não Enviado

## Passo 1: Verificar Logs do Backend

### Abrir Console do Backend
1. Vá até a janela onde o backend está rodando
2. Procure por mensagens relacionadas à parada que você acabou de criar

### Logs Esperados (Sucesso)
```bash
📧 Processando notificações de parada para atividade ID: 5
📧 Iniciando envio de notificação de parada (atividade) ID: 123
✅ Notificação de parada enviada com sucesso para: manutencao@empresa.com
```

### Logs de Problemas Comuns

#### ⚠️ Problema 1: Nenhum Setor Vinculado
```bash
📧 Processando notificações de parada para atividade ID: 5
⚠️ Nenhum setor configurado para receber e-mails sobre a atividade ATI001
⚠️ Notificação de parada não enviada: Nenhum setor configurado
```
**Solução:** Vincular setores à atividade (ver Passo 2)

#### ⚠️ Problema 2: Setores Sem Email Configurado
```bash
📧 Iniciando envio de notificação de parada (atividade) ID: 123
⚠️ Nenhum setor configurado para receber e-mails sobre a atividade ATI001
```
**Solução:** Configurar email nos setores (ver Passo 3)

#### ⚠️ Problema 3: Sem Configuração de Email na Empresa
```bash
📧 Iniciando envio de notificação de parada (atividade) ID: 123
⚠️ Nenhuma configuração de e-mail ativa encontrada para a empresa
```
**Solução:** Configurar email da empresa (ver Passo 4)

#### ❌ Problema 4: Erro ao Enviar Email
```bash
❌ Erro ao enviar e-mail: connect ECONNREFUSED smtp.gmail.com:587
❌ Falha ao enviar notificação de parada: connect ECONNREFUSED
```
**Solução:** Verificar configuração SMTP (ver Passo 5)

---

## Passo 2: Verificar Setores Vinculados à Atividade

### No Sistema
1. Acesse: **Cadastros > Tipos de Atividade**
2. Localize a atividade que você usou na parada
3. Clique em **✏️ Editar**
4. Vá até a seção **"Setores Responsáveis pela Resolução"**

### ✅ Verificar:
- [ ] Há pelo menos 1 setor selecionado?
- [ ] Os setores aparecem como chips azuis?

### ❌ Se Não Houver Setores:
1. Clique no campo de busca
2. Digite o nome do setor (ex: "Manutenção")
3. Selecione o setor
4. Clique em **"Atualizar"**
5. Teste novamente registrando uma parada

---

## Passo 3: Verificar Configuração de Email dos Setores

### No Sistema
1. Acesse: **Cadastros > Setores**
2. Para cada setor vinculado à atividade, verifique:

### ✅ Checklist por Setor:
- [ ] **Status**: Ativo (verde)
- [ ] **Enviar Email em Alertas**: ✓ (marcado)
- [ ] **E-mail**: Preenchido (ex: `manutencao@empresa.com`)

### ❌ Se Algum Item Estiver Incorreto:
1. Clique em **✏️ Editar** no setor
2. Ajuste os campos:
   - Marque **"Enviar Email em Alertas"**
   - Preencha o campo **"E-mail"**
   - Certifique-se que está **Ativo**
3. Clique em **"Atualizar"**
4. Teste novamente

---

## Passo 4: Verificar Configuração de Email da Empresa

### No Sistema
1. Acesse: **Configurações > Central de E-mails**
2. Verifique se há pelo menos 1 configuração

### ✅ Checklist da Configuração:
- [ ] Existe configuração cadastrada?
- [ ] Status está **Ativo** (verde)?
- [ ] Campos preenchidos:
  - [ ] Host SMTP (ex: `smtp.gmail.com`)
  - [ ] Porta (ex: `587`)
  - [ ] Usuário (ex: `sistema@empresa.com`)
  - [ ] Senha (preenchida)

### ❌ Se Não Houver Configuração Ativa:
1. Clique em **+ Nova Configuração** (ou edite existente)
2. Preencha todos os campos obrigatórios
3. **IMPORTANTE**: Clique em **"Testar Conexão"** antes de salvar
4. Se o teste passar, clique em **"Salvar"**
5. Certifique-se que está **Ativo**

---

## Passo 5: Testar Envio de Email Manual

### No Sistema
1. Acesse: **Configurações > Central de E-mails**
2. Clique em **⚙️ Ações** da configuração ativa
3. Clique em **"Testar Envio"**

### ✅ Se o Teste Passar:
- O email chegou? → Configuração está OK
- Continue para Passo 6

### ❌ Se o Teste Falhar:
Verifique os erros comuns:

#### Erro: `ECONNREFUSED`
**Problema:** Servidor SMTP não acessível
**Solução:**
- Verifique host e porta
- Verifique firewall/antivírus
- Tente usar `smtp.gmail.com` porta `587`

#### Erro: `Invalid login`
**Problema:** Usuário ou senha incorretos
**Solução:**
- Verifique credenciais
- Para Gmail: Use "Senha de App" (não a senha normal)
- Acesse: https://myaccount.google.com/apppasswords

#### Erro: `Certificate error`
**Problema:** Certificado SSL inválido
**Solução:**
- Para desenvolvimento, isso é normal
- O código já ignora certificados inválidos

---

## Passo 6: Verificar no Banco de Dados

### Consulta SQL - Verificar Setores Vinculados
```sql
SELECT 
  at.code AS atividade_codigo,
  at.name AS atividade_nome,
  s.code AS setor_codigo,
  s.name AS setor_nome,
  s.email AS setor_email,
  s.active AS setor_ativo,
  s."sendEmailOnAlert" AS email_ativo
FROM activity_types at
INNER JOIN activity_type_sectors ats ON at.id = ats."activityTypeId"
INNER JOIN sectors s ON ats."sectorId" = s.id
WHERE at.code = 'SEU_CODIGO_ATIVIDADE'  -- Substitua pelo código da atividade
ORDER BY s.name;
```

### ✅ Resultado Esperado:
```
atividade_codigo | atividade_nome        | setor_codigo | setor_nome    | setor_email            | setor_ativo | email_ativo
-----------------|-----------------------|--------------|---------------|------------------------|-------------|-------------
MANUT_CORR       | Manutenção Corretiva  | MAN          | Manutenção    | manutencao@empresa.com | true        | true
MANUT_CORR       | Manutenção Corretiva  | FER          | Ferramentaria | ferram@empresa.com     | true        | true
```

### ❌ Se Não Retornar Nada:
- Atividade não tem setores vinculados
- Volte para Passo 2

### ❌ Se `setor_email` Estiver Vazio:
- Setor não tem email configurado
- Volte para Passo 3

### ❌ Se `email_ativo` for `false`:
- Setor não está configurado para receber emails
- Volte para Passo 3

---

## Passo 7: Verificar Logs na Central de Emails

### No Sistema
1. Acesse: **Central de E-mails**
2. Procure pelo email da parada que você registrou
3. Verifique a coluna **Status**

### ✅ Se Aparecer na Lista:
- **Status: Sucesso** → Email foi enviado! Verifique caixa de entrada
- **Status: Falha** → Clique para ver o erro detalhado

### ❌ Se NÃO Aparecer na Lista:
Significa que a função nem tentou enviar o email.
**Motivos possíveis:**
1. Nenhum setor vinculado à atividade (Passo 2)
2. Setores sem email configurado (Passo 3)
3. Sem configuração de email ativa (Passo 4)

---

## Passo 8: Reiniciar Backend (Se Necessário)

### Se Você Acabou de Fazer Alterações:
1. Pare o backend (Ctrl+C na janela do terminal)
2. Inicie novamente:
   ```bash
   cd backend
   npm run dev
   ```
3. Aguarde mensagem: **"Server running on port 3000"**
4. Registre uma nova parada para testar

---

## 🔧 Script de Diagnóstico Rápido (SQL)

Execute no banco de dados para diagnóstico completo:

```sql
-- 1. Verificar atividade e seus setores
SELECT 
  'ATIVIDADE' AS tipo,
  at.id,
  at.code,
  at.name,
  at.type,
  COUNT(ats.id) AS qtd_setores_vinculados
FROM activity_types at
LEFT JOIN activity_type_sectors ats ON at.id = ats."activityTypeId"
WHERE at.code = 'SEU_CODIGO_ATIVIDADE'  -- Substitua
GROUP BY at.id, at.code, at.name, at.type;

-- 2. Verificar setores e suas configurações
SELECT 
  'SETOR' AS tipo,
  s.id,
  s.code,
  s.name,
  s.email,
  s.active AS ativo,
  s."sendEmailOnAlert" AS envia_email
FROM sectors s
INNER JOIN activity_type_sectors ats ON s.id = ats."sectorId"
INNER JOIN activity_types at ON ats."activityTypeId" = at.id
WHERE at.code = 'SEU_CODIGO_ATIVIDADE';  -- Substitua

-- 3. Verificar configuração de email da empresa
SELECT 
  'CONFIG_EMAIL' AS tipo,
  ec.id,
  ec.name,
  ec.host,
  ec.port,
  ec.username AS usuario,
  ec.active AS ativo,
  c.name AS empresa_nome
FROM email_configs ec
INNER JOIN companies c ON ec."companyId" = c.id
WHERE ec.active = true
ORDER BY ec."createdAt" DESC
LIMIT 1;

-- 4. Verificar últimas paradas registradas
SELECT 
  'PARADAS' AS tipo,
  d.id,
  d.reason AS motivo,
  d."startTime" AS inicio,
  at.code AS atividade_codigo,
  at.name AS atividade_nome,
  po."orderNumber" AS ordem
FROM downtimes d
INNER JOIN activity_types at ON d."activityTypeId" = at.id
INNER JOIN production_orders po ON d."productionOrderId" = po.id
ORDER BY d."startTime" DESC
LIMIT 5;

-- 5. Verificar logs de email recentes
SELECT 
  'LOGS_EMAIL' AS tipo,
  el.id,
  el.recipients AS destinatarios,
  el.subject AS assunto,
  el.success AS sucesso,
  el.error AS erro,
  el."sentAt" AS enviado_em
FROM email_logs el
WHERE el."emailType" = 'downtime_notification'
ORDER BY el."sentAt" DESC
LIMIT 10;
```

---

## ✅ Solução Mais Comum

**90% dos casos**: Setores não estão vinculados à atividade OU não têm email configurado.

### Solução Rápida:
1. **Cadastros > Setores** → Edite cada setor:
   - ✅ Ativo
   - ✅ Enviar Email em Alertas
   - ✅ Email preenchido

2. **Cadastros > Tipos de Atividade** → Edite a atividade:
   - ✅ Adicione os setores responsáveis

3. **Registre nova parada** para testar

---

## 📞 Se Ainda Não Funcionar

1. Copie os logs do console do backend
2. Copie o resultado das consultas SQL acima
3. Verifique se há erros no console do navegador (F12)
4. Entre em contato com suporte técnico

---

**Última Atualização**: 24/10/2025

