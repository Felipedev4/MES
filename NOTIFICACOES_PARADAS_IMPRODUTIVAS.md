# 🛑 Notificações de Paradas Improdutivas

## 📋 Visão Geral

Sistema automatizado de notificação por e-mail para **paradas improdutivas**, que envia alertas imediatos aos setores responsáveis por resolver defeitos específicos. Este sistema integra-se perfeitamente com o cadastro de defeitos, setores responsáveis e a Central de E-mails.

---

## ✨ Funcionalidades Principais

### 1. **Envio Automático de E-mails**
- **Trigger**: Quando uma parada improdutiva é registrada com um defeito associado
- **Destinatários**: Setores configurados como responsáveis por resolver o defeito
- **Critérios de Envio**:
  - Tipo de parada: `UNPRODUCTIVE` (improdutiva)
  - Defeito vinculado à parada
  - Setor responsável com e-mail configurado
  - Flag `sendEmailOnAlert` ativada no setor

### 2. **Template de E-mail Profissional**
- **Design Responsivo**: HTML com estilos inline para compatibilidade
- **Informações Detalhadas**:
  - Severidade do defeito (com cores: Baixa, Média, Alta, Crítica)
  - Informações da parada (motivo, descrição, data/hora de início)
  - Informações da ordem de produção (número, item, molde, setor)
  - Setores responsáveis notificados
  - Ações recomendadas

### 3. **Integração com Central de E-mails**
- Todos os e-mails enviados são registrados automaticamente
- Visíveis na Central de E-mails com tipo `downtime_notification`
- Busca e filtros específicos para notificações de paradas

### 4. **Logging e Auditoria**
- Cada e-mail enviado é registrado no banco de dados
- Incluí status de sucesso/falha
- Vinculado à parada específica (`downtimeId`)
- Rastreável por empresa, defeito e setores

---

## 🔧 Implementação Técnica

### Backend

#### 1. **Schema do Banco de Dados** (`backend/prisma/schema.prisma`)

**Alterações no modelo `EmailLog`**:
```prisma
model EmailLog {
  id            Int      @id @default(autoincrement())
  emailConfigId Int
  recipients    String
  subject       String
  body          String
  moldId        Int?     // Para alertas de manutenção
  downtimeId    Int?     // ✨ NOVO: Para notificações de parada
  emailType     String?  // ✨ NOVO: 'maintenance_alert', 'downtime_notification', 'other'
  success       Boolean
  error         String?
  sentAt        DateTime @default(now())

  @@index([downtimeId])
  @@index([emailType])
}
```

**Relações Existentes** (já estavam no schema):
- `Downtime` tem `defectId` → vincula a um `Defect`
- `Defect` tem `defectSectors` → lista de setores responsáveis
- `Sector` tem `email` e `sendEmailOnAlert` → configuração de notificações

#### 2. **Serviço de E-mail** (`backend/src/services/emailService.ts`)

**Função Principal: `sendDowntimeNotification`**
```typescript
export async function sendDowntimeNotification(
  downtimeId: number,
  productionOrderId: number,
  defectId: number
): Promise<{ success: boolean; error?: string; sentTo?: string[] }>
```

**Fluxo de Execução**:
1. Busca informações da parada
2. Busca ordem de produção (com item, molde, setor, empresa)
3. Busca defeito e setores responsáveis
4. Filtra setores com `sendEmailOnAlert = true` e `email != null`
5. Busca configuração de e-mail da empresa
6. Gera HTML do e-mail usando template
7. Envia e-mail para todos os setores
8. Registra log no banco (`EmailLog`)

**Template HTML: `getDowntimeNotificationTemplate`**
- Gradientes e cores baseadas na severidade do defeito
- Seções estruturadas (alerta, setores, parada, OP, ações)
- Box destacado com setores responsáveis
- Lista de ações recomendadas
- Footer com informações do sistema

#### 3. **Controller de Downtimes** (`backend/src/controllers/downtimeController.ts`)

**Modificação em `createDowntime`**:
```typescript
// ⚡ NOTIFICAR SETORES RESPONSÁVEIS (assíncrono, não bloqueia resposta)
if (defectId && productionOrderId && type === 'UNPRODUCTIVE') {
  sendDowntimeNotification(downtime.id, productionOrderId, defectId)
    .then((result) => {
      if (result.success) {
        console.log(`✅ Notificação enviada para: ${result.sentTo?.join(', ')}`);
      }
    })
    .catch((error) => {
      console.error('❌ Erro ao enviar notificações:', error);
    });
}
```

**Novo Endpoint: `getDowntimeEmailLogs`**
- Rota: `GET /api/downtimes/email-logs`
- Busca logs de e-mails do tipo `downtime_notification`
- Filtra por empresa do usuário logado
- Inclui informações enriquecidas (downtime, OP, defeito, setores)

#### 4. **Rotas** (`backend/src/routes/downtimeRoutes.ts`)
```typescript
router.get('/email-logs', getDowntimeEmailLogs);
```

---

### Frontend

#### 1. **Central de E-mails** (`frontend/src/pages/EmailCenter.tsx`)

**Interface Atualizada**:
```typescript
interface EmailLog {
  // ... campos existentes
  downtimeId?: number;
  downtimeReason?: string;
  productionOrderNumber?: string;
  defectName?: string;
  sectorNames?: string;
}
```

**Função `loadEmails` Atualizada**:
```typescript
const [maintenanceLogsRes, downtimeLogsRes] = await Promise.all([
  api.get('/maintenance-alerts/email-logs?limit=200'),
  api.get('/downtimes/email-logs?limit=200'), // ✨ NOVO
]);

const allEmails: EmailLog[] = [
  ...maintenanceLogsRes.data.map(...),
  ...downtimeLogsRes.data.map((log: any) => ({
    ...log,
    emailType: 'downtime_notification' as const,
    // ... mapear campos extras
  })),
];
```

**Busca Expandida**:
Agora busca também por:
- Número da ordem de produção
- Nome do defeito
- (além de assunto, destinatários, código do molde)

**Dialog de Detalhes Expandido**:
Exibe informações adicionais específicas de paradas:
- Ordem de Produção
- Defeito
- Motivo da Parada
- Setores Notificados

---

## 🎯 Fluxo de Uso

### Pré-requisitos

1. **Configuração de E-mail**:
   - Ter uma configuração SMTP ativa na empresa
   - Configuração visível em **Administração > Configuração de E-mail**

2. **Cadastro de Defeitos**:
   - Defeitos cadastrados em **Cadastros > Defeitos**
   - Defeitos vinculados a setores responsáveis

3. **Cadastro de Setores**:
   - Setores cadastrados em **Cadastros > Setores**
   - Campos preenchidos:
     - `email`: E-mail do setor (obrigatório para receber notificações)
     - `sendEmailOnAlert`: **Ativado** (checkbox marcado)

### Fluxo Completo

```
1. Operador registra parada improdutiva
   └─> Tela: Paradas (Downtimes)
   └─> Preenche: Tipo = "Improdutiva", Defeito, Motivo, etc.

2. Sistema detecta parada improdutiva com defeito
   └─> Controller: createDowntime

3. Sistema busca setores responsáveis pelo defeito
   └─> DefectSector → Sector (com sendEmailOnAlert = true)

4. Sistema envia e-mails para setores
   └─> Service: sendDowntimeNotification
   └─> SMTP → E-mails enviados

5. Sistema registra logs de e-mail
   └─> EmailLog (downtimeId, emailType = 'downtime_notification')

6. Gestor visualiza na Central de E-mails
   └─> Administração → Central de E-mails
   └─> Filtro: "Notificações de Parada"
```

---

## 📊 Exemplo Prático

### Cenário: Quebra de Molde

**1. Cadastro Inicial**:
```
Defeito: MOLDE-QUEBRADO
├─ Nome: "Quebra de Molde"
├─ Severidade: CRITICAL
└─ Setores Responsáveis:
    ├─ Manutenção (email: manutencao@empresa.com, sendEmailOnAlert: ✓)
    └─ Ferramentaria (email: ferramentaria@empresa.com, sendEmailOnAlert: ✓)
```

**2. Ordem de Produção Ativa**:
```
OP: OP-2025-001
├─ Item: Copo Plástico 500ml
├─ Molde: MOLDE-COPO-001
└─ Empresa: Plásticos ABC
```

**3. Parada Registrada**:
```
Tipo: UNPRODUCTIVE (Improdutiva)
Defeito: MOLDE-QUEBRADO
Motivo: "Quebra na cavidade 3"
Descrição: "Trinca detectada durante injeção"
```

**4. E-mails Enviados Automaticamente**:
```
Para: manutencao@empresa.com, ferramentaria@empresa.com
Assunto: 🛑 ALERTA: Parada Improdutiva - Quebra de Molde - OP OP-2025-001

[HTML profissional com todas as informações]
```

**5. Log Registrado**:
```
EmailLog:
├─ emailType: "downtime_notification"
├─ downtimeId: 123
├─ recipients: "manutencao@empresa.com, ferramentaria@empresa.com"
├─ success: true
└─ sentAt: 2025-10-23 14:30:00
```

**6. Visível na Central**:
```
Central de E-mails:
├─ Tipo: Notificação de Parada
├─ Status: Enviado ✅
├─ Destinatários: 2
├─ OP: OP-2025-001
├─ Defeito: Quebra de Molde
└─ Setores: Manutenção, Ferramentaria
```

---

## 🎨 Design do E-mail

### Estrutura Visual

```
┌─────────────────────────────────────┐
│   🛑 Alerta de Parada Improdutiva   │ ← Header (Gradiente Vermelho)
├─────────────────────────────────────┤
│ [Severidade: CRÍTICA]               │ ← Badge colorido
│ Parada Improdutiva Detectada        │
│ Iniciada em: 23/10/2025 14:30       │
├─────────────────────────────────────┤
│ 👥 Setor(es) Responsável(is)        │ ← Box azul destacado
│ Manutenção, Ferramentaria           │
├─────────────────────────────────────┤
│ 📋 Informações da Parada            │
│ ├─ Motivo: Quebra na cavidade 3    │
│ ├─ Descrição: Trinca detectada...  │
│ └─ Defeito: Quebra de Molde        │
├─────────────────────────────────────┤
│ 🏭 Informações da OP                │
│ ├─ Número: OP-2025-001             │
│ ├─ Item: Copo Plástico 500ml       │
│ ├─ Molde: MOLDE-COPO-001           │
│ └─ Setor: Injeção                  │
├─────────────────────────────────────┤
│ ⚡ Ações Recomendadas               │ ← Box amarelo
│ • Dirija-se ao local IMEDIATAMENTE │
│ • Avalie e identifique causa raiz  │
│ • Implemente ações corretivas      │
│ • Registre no sistema              │
│ • Comunique o responsável          │
├─────────────────────────────────────┤
│ 💡 Dica: Acesse o Sistema MES...   │ ← Box azul claro
└─────────────────────────────────────┘
```

### Cores por Severidade

| Severidade | Cor       | Hex       | Uso                    |
|------------|-----------|-----------|------------------------|
| LOW        | Verde     | `#4caf50` | Border, Badge          |
| MEDIUM     | Laranja   | `#ff9800` | Border, Badge          |
| HIGH       | Vermelho  | `#f44336` | Border, Badge          |
| CRITICAL   | Roxo      | `#9c27b0` | Border, Badge          |

---

## 🔐 Segurança e Permissões

### Envio de E-mails
- **Automático**: Não requer permissão especial
- **Trigger**: Sistema (ao criar parada improdutiva)
- **Configuração**: Apenas ADMIN pode configurar setores e e-mails

### Visualização de Logs
- **Central de E-mails**: Requer permissão `email_logs`
- **Filtro por Empresa**: Automático (baseado na empresa selecionada)
- **Dados Sensíveis**: Nenhum dado sensível exposto

### Configuração de Setores
- **Vincular Defeitos**: Requer permissão `defects` (edit)
- **Configurar E-mail do Setor**: Requer permissão `sectors` (edit)
- **Ativar `sendEmailOnAlert`**: Requer permissão `sectors` (edit)

---

## 📈 Monitoramento e Diagnóstico

### Como Verificar se Está Funcionando

1. **Teste o Cadastro**:
   - Ir em **Cadastros > Setores**
   - Verificar se o setor tem:
     - ✅ E-mail preenchido
     - ✅ `Enviar e-mail em alertas` marcado

2. **Teste o Vínculo**:
   - Ir em **Cadastros > Defeitos**
   - Abrir um defeito
   - Verificar se há setores responsáveis vinculados

3. **Registre uma Parada de Teste**:
   - Ir em **Operacional > Paradas**
   - Criar nova parada:
     - Tipo: **Improdutiva**
     - Defeito: (selecionar um com setores vinculados)
     - Ordem de Produção: (uma ativa)

4. **Verifique o Console do Backend**:
   ```
   📧 Processando notificações de parada para defeito ID: 5
   📧 Iniciando envio de notificação de parada ID: 123
   ✅ Notificação de parada enviada para 2 setor(es): manutencao@empresa.com, ferramentaria@empresa.com
   ```

5. **Verifique a Central de E-mails**:
   - Ir em **Administração > Central de E-mails**
   - Filtrar por tipo: **Notificações de Parada**
   - Verificar status: **Enviado** ✅

### Troubleshooting

#### ❌ E-mail não foi enviado

**Possíveis Causas**:

1. **Nenhuma configuração SMTP**:
   - Verificar **Administração > Configuração de E-mail**
   - Deve haver pelo menos 1 configuração **ativa** para a empresa

2. **Setor sem e-mail**:
   - Verificar **Cadastros > Setores**
   - Campo `email` deve estar preenchido

3. **Flag `sendEmailOnAlert` desativada**:
   - Verificar **Cadastros > Setores**
   - Checkbox `Enviar e-mail em alertas` deve estar marcado

4. **Defeito sem setores responsáveis**:
   - Verificar **Cadastros > Defeitos**
   - Abrir o defeito e verificar seção "Setores Responsáveis"

5. **Parada não é improdutiva**:
   - E-mails são enviados **apenas** para paradas do tipo `UNPRODUCTIVE`

6. **Parada sem defeito vinculado**:
   - Ao registrar a parada, o campo `Defeito` deve ser preenchido

#### ⚠️ E-mail enviado mas não recebido

**Verificar**:
1. **Caixa de Spam** do destinatário
2. **Console do Backend** para erros SMTP
3. **Central de E-mails**:
   - Se status é **Falha** ❌
   - Clicar em "Ver detalhes" para ver o erro

4. **Configuração SMTP**:
   - Testar configuração em **Administração > Configuração de E-mail**
   - Clicar em "Testar Configuração"

#### 🔍 Logs do Backend

**Console**:
```bash
# Sucesso
📧 Processando notificações de parada para defeito ID: 5
✅ Notificação de parada enviada para 2 setor(es): ...

# Sem setores configurados
⚠️ Nenhum setor configurado para receber e-mails sobre o defeito DEF-001

# Sem configuração SMTP
⚠️ Nenhuma configuração de e-mail ativa encontrada para a empresa

# Erro ao enviar
❌ Erro ao enviar notificações de parada: [mensagem de erro]
```

---

## 📊 Estatísticas e Relatórios

### Central de E-mails - Métricas

A Central de E-mails mostra estatísticas consolidadas:

```
┌─────────────────────────────────────────┐
│ Total de E-mails: 150                   │ ← Todos os tipos
├─────────────────────────────────────────┤
│ Enviados com Sucesso: 142 (95%)        │ ← Taxa de sucesso
├─────────────────────────────────────────┤
│ Falhas no Envio: 8                      │ ← Precisam atenção
├─────────────────────────────────────────┤
│ Últimas 24h: 23                         │ ← Atividade recente
└─────────────────────────────────────────┘
```

### Filtros Disponíveis

1. **Por Tipo**:
   - Alertas de Manutenção
   - **Notificações de Parada** ← Novo
   - Outros

2. **Por Status**:
   - Sucesso
   - Falha

3. **Por Busca**:
   - Assunto
   - Destinatário
   - Molde
   - **Ordem de Produção** ← Novo
   - **Defeito** ← Novo

---

## 🚀 Expansões Futuras

### Possíveis Melhorias

1. **Escalação de Alertas**:
   - Reenviar e-mail se parada não for resolvida em X minutos
   - Escalar para gerência após Y minutos

2. **Notificações por SMS/WhatsApp**:
   - Integração com APIs de mensageria
   - Alertas críticos por múltiplos canais

3. **Dashboard de Paradas**:
   - Tempo médio de resposta por setor
   - Taxa de resolução
   - Ranking de setores mais/menos responsivos

4. **Confirmação de Leitura**:
   - Link único para confirmar recebimento
   - Tracking de visualização

5. **Notificações Push**:
   - Para aplicativo mobile
   - Notificações web (Push API)

6. **Anexos Automáticos**:
   - Fotos da parada (se disponíveis)
   - Histórico de paradas similares
   - Procedimentos operacionais

7. **Multilíngue**:
   - Templates em múltiplos idiomas
   - Baseado na configuração do usuário/setor

---

## 🎓 Boas Práticas

### Para Administradores

1. **Configure E-mails de Setores**:
   - Use e-mails de grupo (ex: `manutencao@empresa.com`)
   - Evite e-mails pessoais (pessoas podem sair da empresa)

2. **Vincule Defeitos Corretamente**:
   - Cada defeito deve ter pelo menos 1 setor responsável
   - Defina setores baseado em competência técnica

3. **Teste Regularmente**:
   - Faça testes mensais de envio
   - Verifique se setores estão recebendo

4. **Monitore a Central**:
   - Verifique taxa de falhas semanalmente
   - Investigue falhas imediatamente

### Para Operadores

1. **Sempre Vincule Defeitos**:
   - Ao registrar parada improdutiva, selecione o defeito correto
   - Isso garante que os setores certos sejam notificados

2. **Seja Descritivo**:
   - Preencha o campo `Descrição` com detalhes
   - Informações claras ajudam na resolução

3. **Registre no Momento**:
   - Não espere para registrar a parada
   - Quanto antes, mais rápido os setores são notificados

### Para Setores Responsáveis

1. **Monitore o E-mail**:
   - Configure notificações no cliente de e-mail
   - Responda rapidamente aos alertas

2. **Use o Link do Sistema**:
   - Acesse o MES para mais detalhes
   - Registre ações tomadas no sistema

3. **Comunique Feedback**:
   - Informe se defeitos estão sendo classificados incorretamente
   - Sugira melhorias no processo

---

## 📝 Changelog

### v1.0 - 23/10/2025
- ✨ Implementação inicial do sistema de notificações
- ✨ Template HTML profissional para e-mails
- ✨ Integração com Central de E-mails
- ✨ Endpoint para buscar logs de notificações de paradas
- ✨ Filtros e busca expandidos na Central
- 📚 Documentação completa

---

## 📞 Suporte

### Para Problemas Técnicos

1. **Verifique a documentação** (este arquivo)
2. **Consulte a seção Troubleshooting**
3. **Verifique logs do backend** (console ou arquivo de log)
4. **Teste configuração SMTP** (botão "Testar" na tela de configuração)
5. **Entre em contato com o administrador do sistema**

### Para Configurações

1. **Cadastro de setores**: Administrador ou Gerente
2. **Vínculo de defeitos**: Administrador ou Gerente
3. **Configuração SMTP**: Apenas Administrador

---

**Documentação criada em**: 23/10/2025  
**Versão**: 1.0  
**Autor**: Sistema MES - Equipe de Desenvolvimento  
**Última atualização**: 23/10/2025

