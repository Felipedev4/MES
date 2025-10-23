# 📧 Sistema de Notificação Automática de Paradas para Setores

## 📋 Visão Geral

Sistema completo de notificação automática por e-mail para setores responsáveis quando ocorrem paradas (downtimes) com defeitos vinculados.

---

## ✨ Funcionalidades Implementadas

### 1. **🏢 Campos Novos no Cadastro de Setores**

#### **Campo: E-mail do Setor**
- Tipo: Text (email)
- Obrigatório: Não
- Exemplo: `manutencao@empresa.com`
- Uso: Receber notificações automáticas de paradas

#### **Campo: Enviar E-mail em Alertas**
- Tipo: Boolean (flag/checkbox)
- Padrão: `false` (desativado)
- Uso: Ativar/desativar notificações para este setor

**Visual no Dialog:**
```
┌──────────────────────────────────────────────┐
│ 🔔 Notificações por E-mail                   │
│                                               │
│ ✅ Este setor receberá e-mails automáticos   │
│    quando houver paradas com defeitos        │
│    vinculados a ele                          │
│                                               │
│ Notificações Ativadas           [ON] 🔔      │
│                                               │
│ ⚠️ Configure um e-mail para receber          │
│    as notificações                           │
└──────────────────────────────────────────────┘
```

---

### 2. **🔗 Vínculo Defeito em Paradas (Downtimes)**

**Novo Campo no Modelo `Downtime`:**
```prisma
model Downtime {
  ...
  defectId   Int?     // Defeito associado à parada
  defect     Defect?  @relation(...)
  ...
}
```

**Uso:**
- Ao registrar uma parada, pode-se vincular um defeito específico
- Se o defeito tiver setores responsáveis, eles serão notificados automaticamente

---

### 3. **📧 Serviço de Notificação Automática**

**Arquivo:** `backend/src/services/downtimeNotificationService.ts`

**Fluxo de Notificação:**
```
1. Parada criada com defeito vinculado
         ↓
2. Buscar setores responsáveis pelo defeito
         ↓
3. Filtrar setores com:
   - email configurado
   - sendEmailOnAlert = true
         ↓
4. Buscar configuração de e-mail da empresa
         ↓
5. Enviar e-mail para cada setor
         ↓
6. Registrar log de envio
```

**Exemplo de E-mail Enviado:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️ ALERTA DE PARADA IMPRODUTIVA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 AÇÃO NECESSÁRIA
Uma parada foi registrada com um defeito 
vinculado ao seu setor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Informações da Parada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Defeito: Mancha no Produto
Severidade: 🔴 Crítico
Motivo: Problema de refrigeração do molde
Descrição: Manchas escuras na peça
Data/Hora: 23/10/2024 14:30
Ordem de Produção: OP-2024-001
Injetora: INJ-001

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 Setores Notificados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• QLD - Qualidade
• MNT - Manutenção
• FER - Ferramentaria

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Próximos Passos:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Avaliar a situação imediatamente
2. Identificar a causa raiz do problema
3. Implementar ações corretivas
4. Registrar as ações tomadas no sistema
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `sectors` (Atualizada)

```sql
ALTER TABLE sectors 
ADD COLUMN email VARCHAR(255),
ADD COLUMN "sendEmailOnAlert" BOOLEAN DEFAULT false;
```

**Campos Novos:**
- `email`: E-mail do setor
- `sendEmailOnAlert`: Flag para ativar notificações

### Tabela `downtimes` (Atualizada)

```sql
ALTER TABLE downtimes 
ADD COLUMN "defectId" INTEGER REFERENCES defects(id);
```

**Campo Novo:**
- `defectId`: Defeito associado à parada

---

## 🔧 Como Configurar

### Passo 1: Configurar Setores

1. Acesse **Cadastros > Setores**
2. Edite ou crie um setor
3. Preencha o **E-mail do Setor**
4. Ative o toggle **Enviar E-mail em Alertas**
5. Salve

**Exemplo:**
```
Código: MNT
Nome: Manutenção
E-mail: manutencao@empresa.com
Notificações: ✅ ON
```

### Passo 2: Vincular Defeitos aos Setores

1. Acesse **Cadastros > Defeitos**
2. Edite um defeito
3. Selecione os **Setores Responsáveis**
4. Salve

**Exemplo:**
```
Defeito: Mancha no Produto
Setores: [QLD] [MNT] [FER]
```

### Passo 3: Registrar Parada com Defeito

1. Registre uma parada (Downtime)
2. Informe o campo **defectId** no JSON/body
3. Sistema enviará e-mails automaticamente

**Request Example:**
```json
POST /api/downtimes
{
  "productionOrderId": 1,
  "type": "UNPRODUCTIVE",
  "reason": "Problema de refrigeração",
  "description": "Manchas escuras na peça",
  "defectId": 3,
  "startTime": "2024-10-23T14:30:00Z"
}
```

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────┐
│ 1. OPERADOR REGISTRA PARADA                │
│    - Informa defeito associado              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 2. BACKEND VALIDA E SALVA PARADA           │
│    - Valida defectId                        │
│    - Cria registro de downtime              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 3. BUSCA SETORES RESPONSÁVEIS              │
│    - Query: defeito → defect_sectors        │
│    - Filtra: email configurado + flag ON    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 4. BUSCA CONFIGURAÇÃO DE E-MAIL            │
│    - Query: emailConfig da empresa          │
│    - Valida se está ativa                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 5. ENVIA E-MAILS (Assíncrono)             │
│    - Um e-mail por setor                    │
│    - Template HTML formatado                │
│    - Logs de sucesso/erro                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 6. SETORES RECEBEM NOTIFICAÇÃO            │
│    - E-mail na caixa de entrada             │
│    - Ação imediata para resolver            │
└─────────────────────────────────────────────┘
```

---

## 🎯 Casos de Uso

### Caso 1: Parada Crítica de Qualidade

**Cenário:**
- Defeito: "Mancha no Produto" (Crítico)
- Setores: Qualidade, Manutenção, Ferramentaria
- Todos com notificação ativada

**Resultado:**
- ✅ 3 e-mails enviados simultaneamente
- ✅ Equipes notificadas em tempo real
- ✅ Ação rápida para resolver o problema

---

### Caso 2: Parada Mecânica

**Cenário:**
- Defeito: "Falha Hidráulica" (Alto)
- Setores: Manutenção (ON), Utilidades (ON), Qualidade (OFF)

**Resultado:**
- ✅ 2 e-mails enviados (MNT e UTI)
- ⚠️ Qualidade não recebe (flag OFF)

---

### Caso 3: Parada Sem Defeito

**Cenário:**
- Parada registrada sem `defectId`

**Resultado:**
- ℹ️ Nenhuma notificação enviada
- ℹ️ Log: "Parada sem defeito vinculado"

---

## 🔐 Validações e Segurança

### Validações Implementadas:

1. **Defeito Existe:**
   - Valida se `defectId` é válido antes de criar parada

2. **E-mail Configurado:**
   - Apenas setores com e-mail recebem notificações

3. **Flag Ativada:**
   - Respeita a preferência `sendEmailOnAlert`

4. **Config de E-mail Ativa:**
   - Verifica se empresa tem configuração de e-mail

5. **Envio Assíncrono:**
   - Não bloqueia resposta da API
   - Erros de e-mail não impedem criação da parada

---

## 📝 Logs e Monitoramento

### Logs do Backend:

```bash
# Parada criada com sucesso
✅ Parada criada: ID 123

# Notificação iniciada
📧 Notificações de parada iniciadas para defeito: Mancha no Produto

# Setores filtrados
ℹ️  3 setor(es) configurado(s) para receber e-mails

# E-mails enviados
✅ E-mail enviado para o setor: Qualidade (qualidade@empresa.com)
✅ E-mail enviado para o setor: Manutenção (manutencao@empresa.com)
✅ E-mail enviado para o setor: Ferramentaria (ferramentaria@empresa.com)

# Resumo
📧 Notificações de parada processadas: 3 e-mail(s)
```

### Logs de Erro:

```bash
# Setor sem e-mail
⚠️ Setor MNT não tem e-mail configurado

# Config de e-mail não encontrada
⚠️  Configuração de e-mail não encontrada para a empresa

# Erro ao enviar
❌ Erro ao enviar e-mail para Qualidade: Connection timeout
```

---

## 🧪 Como Testar

### Teste 1: Configuração de Setor

```bash
# 1. Criar/Editar setor
PUT /api/sectors/1
{
  "code": "MNT",
  "name": "Manutenção",
  "email": "manutencao@empresa.com",
  "sendEmailOnAlert": true,
  "active": true
}

# Esperado: ✅ Setor salvo com sucesso
```

### Teste 2: Vincular Defeito ao Setor

```bash
# 1. Editar defeito
PUT /api/defects/3
{
  "code": "DEF-003",
  "name": "Mancha no Produto",
  "severity": "CRITICAL",
  "sectorIds": [1, 2, 3]  # MNT, QLD, FER
}

# Esperado: ✅ Defeito vinculado a 3 setores
```

### Teste 3: Criar Parada com Defeito

```bash
# 1. Criar parada
POST /api/downtimes
{
  "productionOrderId": 1,
  "type": "UNPRODUCTIVE",
  "reason": "Problema de refrigeração",
  "description": "Manchas escuras na peça",
  "defectId": 3,
  "startTime": "2024-10-23T14:30:00Z"
}

# Esperado:
# ✅ Parada criada
# 📧 3 e-mails enviados
# 📧 Logs no backend
```

### Teste 4: Verificar E-mails

```bash
# Verificar inbox dos setores:
# 1. manutencao@empresa.com
# 2. qualidade@empresa.com
# 3. ferramentaria@empresa.com

# Esperado: E-mail com formato HTML bonito
```

---

## 🔄 Manutenção e Troubleshooting

### Problema: E-mails não estão sendo enviados

**Checklist:**
- [ ] Setor tem e-mail configurado?
- [ ] Flag `sendEmailOnAlert` está ativada?
- [ ] Empresa tem configuração de e-mail ativa?
- [ ] Defeito está vinculado ao setor?
- [ ] Parada foi criada com `defectId`?

**Verificar Logs:**
```bash
tail -f backend/logs/app.log | grep "📧"
```

---

### Problema: Setor não recebe e-mail

**Possíveis Causas:**
1. E-mail incorreto no cadastro
2. Flag `sendEmailOnAlert` = false
3. Defeito não vinculado ao setor
4. Servidor SMTP com problema

**Solução:**
```sql
-- Verificar configuração do setor
SELECT id, code, name, email, "sendEmailOnAlert" 
FROM sectors 
WHERE id = 1;

-- Verificar vinculo defeito-setor
SELECT ds.*, d.name as defect_name, s.name as sector_name
FROM defect_sectors ds
JOIN defects d ON ds."defectId" = d.id
JOIN sectors s ON ds."sectorId" = s.id
WHERE ds."sectorId" = 1;
```

---

## 📈 Métricas e Indicadores

### Queries Úteis:

**1. Setores com notificação ativada:**
```sql
SELECT code, name, email
FROM sectors
WHERE "sendEmailOnAlert" = true 
  AND email IS NOT NULL
  AND active = true;
```

**2. Defeitos mais notificados:**
```sql
SELECT 
  d.code,
  d.name,
  d.severity,
  COUNT(dt.id) as paradas_count
FROM defects d
JOIN downtimes dt ON d.id = dt."defectId"
GROUP BY d.id, d.code, d.name, d.severity
ORDER BY paradas_count DESC
LIMIT 10;
```

**3. Setores mais acionados:**
```sql
SELECT 
  s.code,
  s.name,
  COUNT(DISTINCT dt.id) as paradas_atendidas
FROM sectors s
JOIN defect_sectors ds ON s.id = ds."sectorId"
JOIN defects d ON ds."defectId" = d.id
JOIN downtimes dt ON d.id = dt."defectId"
WHERE s."sendEmailOnAlert" = true
GROUP BY s.id, s.code, s.name
ORDER BY paradas_atendidas DESC;
```

---

## ✅ Checklist de Implementação

- [x] Schema Prisma atualizado
- [x] Migrations aplicadas
- [x] Serviço de notificação criado
- [x] Controller de downtimes atualizado
- [x] Frontend de setores atualizado
- [x] Validações implementadas
- [x] Logs adicionados
- [x] Envio assíncrono configurado
- [x] Template HTML de e-mail criado
- [x] Documentação completa

---

## 🚀 Próximos Passos Sugeridos

1. **Dashboard de Notificações:**
   - Gráfico de e-mails enviados por setor
   - Taxa de resposta/resolução
   - Tempo médio de ação

2. **Histórico de Notificações:**
   - Tabela com log de todos os e-mails enviados
   - Status de entrega
   - Horário de envio e leitura

3. **Notificações por SMS/WhatsApp:**
   - Integrar com Twilio/WhatsApp Business
   - Para alertas críticos

4. **Escalação Automática:**
   - Se não houver resposta em X minutos
   - Notificar supervisores/gerentes

5. **Templates Personalizáveis:**
   - Permitir empresa customizar template de e-mail
   - Incluir logo e cores da marca

6. **Priorização:**
   - Defeitos críticos com assunto diferente
   - Ícones e cores por severidade

---

**Data:** 23/10/2024  
**Desenvolvedor:** AI Assistant  
**Status:** ✅ Implementado e Documentado  
**Versão:** 1.0

