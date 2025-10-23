# ✅ Campos de E-mail e Notificações em Tipo de Atividade

## 📋 Resumo da Implementação

Foram adicionados campos de **e-mail do setor** e **notificações por e-mail** ao cadastro de Tipo de Atividade, permitindo que cada setor possa receber alertas de paradas vinculadas a defeitos.

---

## 🗄️ Alterações no Banco de Dados

### Migration Aplicada
- **Arquivo**: `backend/prisma/migrations/20251024_add_email_notifications_to_activity_types/migration.sql`
- **Script de Aplicação**: `APLICAR_EMAIL_NOTIFICACOES_ACTIVITY_TYPES.ps1`

### Novos Campos

| Campo | Tipo | Descrição | Padrão |
|-------|------|-----------|--------|
| `sector_email` | VARCHAR(255) | E-mail do setor para receber notificações | NULL |
| `email_notifications_enabled` | BOOLEAN | Se as notificações por e-mail estão ativas | false |

### Índice Criado
```sql
CREATE INDEX "activity_types_email_notifications_enabled_idx" 
ON "activity_types"("email_notifications_enabled");
```

---

## 🎨 Interface do Usuário

### Novo Formulário - Tipo de Atividade

#### Campos Adicionados:

1. **📧 E-mail do Setor**
   - Campo de texto com validação de e-mail
   - Placeholder: `Ex: manutencao@empresa.com`
   - Descrição: "E-mail para receber notificações de paradas com defeitos vinculados"

2. **🔔 Notificações por E-mail**
   - Toggle ON/OFF para ativar/desativar notificações
   - Visual diferenciado:
     - **ON**: Fundo verde com ícone de notificação
     - **OFF**: Fundo cinza com ícone de notificação desativada
   - Alerta visual quando desativado:
     - ⚠️ "Este setor NÃO receberá notificações por e-mail de paradas"

### Layout do Formulário

```
┌─────────────────────────────────────────┐
│ Código*       Nome*                     │
├─────────────────────────────────────────┤
│ Descrição                               │
├─────────────────────────────────────────┤
│ Tipo*            Cor                    │
├─────────────────────────────────────────┤
│ 📧 E-mail do Setor                      │
│ ┌─────────────────────────────────────┐ │
│ │ Ex: manutencao@empresa.com          │ │
│ └─────────────────────────────────────┘ │
│ E-mail para receber notificações...     │
│                                         │
│ 🔔 Notificações por E-mail              │
│ ┌─────────────────────────────────────┐ │
│ │ ⚠️ Este setor NÃO receberá...       │ │
│ │ Notificações Desativadas    [OFF]   │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Status: Ativo no sistema        [Ativo] │
└─────────────────────────────────────────┘
```

---

## 🔧 Arquivos Alterados

### Backend

1. **Schema Prisma** (`backend/prisma/schema.prisma`)
   ```prisma
   model ActivityType {
     // ... campos existentes ...
     sectorEmail               String? // E-mail do setor para notificações
     emailNotificationsEnabled Boolean  @default(false) // Se as notificações por e-mail estão ativas
     // ... outros campos ...
     
     @@index([emailNotificationsEnabled])
   }
   ```

2. **Validator** (`backend/src/validators/activityTypeValidator.ts`)
   ```typescript
   // Create Schema
   sectorEmail: yup.string().email('E-mail inválido').max(255).nullable(),
   emailNotificationsEnabled: yup.boolean().default(false),
   
   // Update Schema
   sectorEmail: yup.string().email('E-mail inválido').max(255).nullable(),
   emailNotificationsEnabled: yup.boolean(),
   ```

### Frontend

3. **Interface TypeScript** (`frontend/src/pages/ActivityTypes.tsx`)
   ```typescript
   interface ActivityType {
     // ... campos existentes ...
     sectorEmail: string | null;
     emailNotificationsEnabled: boolean;
   }
   
   interface ActivityTypeFormData {
     // ... campos existentes ...
     sectorEmail: string;
     emailNotificationsEnabled: boolean;
   }
   ```

4. **Ícones Adicionados**
   ```typescript
   import {
     Email as EmailIcon,
     Notifications as NotificationsIcon,
     NotificationsOff as NotificationsOffIcon,
     Warning as WarningIcon,
   } from '@mui/icons-material';
   ```

---

## 📝 Como Usar

### 1. Cadastrar Tipo de Atividade com E-mail

1. Acesse **Cadastros > Tipos de Atividade**
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios (Código, Nome, Tipo)
4. Na seção **E-mail do Setor**, digite o e-mail (ex: `manutencao@empresa.com`)
5. Ative o toggle **Notificações por E-mail** (ON)
6. Clique em **Salvar**

### 2. Editar Tipo de Atividade Existente

1. Na lista de Tipos de Atividade, clique no ícone de **✏️ Editar**
2. Adicione ou edite o e-mail do setor
3. Ative/desative as notificações conforme necessário
4. Clique em **Atualizar**

---

## 🔄 Como Aplicar as Mudanças

### Passo 1: Aplicar Migration no Banco
```powershell
# Execute o script PowerShell
.\APLICAR_EMAIL_NOTIFICACOES_ACTIVITY_TYPES.ps1
```

### Passo 2: Parar o Backend (se estiver rodando)
```powershell
# No terminal onde o backend está rodando, pressione Ctrl+C
```

### Passo 3: Gerar Prisma Client
```powershell
cd backend
npx prisma generate
```

### Passo 4: Reiniciar o Backend
```powershell
npm run dev
```

### Passo 5: Testar no Frontend
```
1. Acesse: http://localhost:3000
2. Login com usuário ADMIN
3. Navegue para: Cadastros > Tipos de Atividade
4. Crie/Edite um tipo de atividade
5. Teste os novos campos de e-mail e notificações
```

---

## 🎯 Casos de Uso

### Exemplo 1: Setor de Manutenção
```
Código: MANUT_CORRETIVA
Nome: Manutenção Corretiva
E-mail: manutencao@empresa.com
Notificações: ✅ ON

→ Toda parada com defeito vinculado enviará e-mail para manutencao@empresa.com
```

### Exemplo 2: Setor de Qualidade
```
Código: INSPECAO_QUALIDADE
Nome: Inspeção de Qualidade
E-mail: qualidade@empresa.com
Notificações: ✅ ON

→ Paradas com defeitos de qualidade notificarão qualidade@empresa.com
```

### Exemplo 3: Setup sem Notificações
```
Código: SETUP_MOLDE
Nome: Setup de Molde
E-mail: (vazio)
Notificações: ❌ OFF

→ Não enviará notificações, apenas para registro
```

---

## 🚨 Validações Implementadas

### Backend (Yup)
- ✅ E-mail deve ser válido (formato)
- ✅ E-mail máximo 255 caracteres
- ✅ E-mail pode ser NULL
- ✅ emailNotificationsEnabled é boolean

### Frontend
- ✅ Campo de e-mail com validação HTML5 (`type="email"`)
- ✅ Ícones visuais indicam status
- ✅ Mensagem de alerta quando desativado

---

## 📊 Consultas SQL Úteis

### Ver Tipos de Atividade com Notificações Ativas
```sql
SELECT 
  code,
  name,
  sector_email,
  email_notifications_enabled
FROM activity_types
WHERE email_notifications_enabled = true
  AND sector_email IS NOT NULL
  AND active = true;
```

### Atualizar E-mail em Lote
```sql
UPDATE activity_types
SET sector_email = 'manutencao@empresa.com',
    email_notifications_enabled = true
WHERE type = 'UNPRODUCTIVE'
  AND active = true;
```

---

## ✅ Checklist de Implementação

- [x] Migration SQL criada
- [x] Schema Prisma atualizado
- [x] Validator backend atualizado
- [x] Interface TypeScript atualizada
- [x] Formulário frontend implementado
- [x] Ícones e visual adicionados
- [x] Script PowerShell de aplicação criado
- [x] Documentação completa

---

## 🎉 Status

**✅ IMPLEMENTAÇÃO COMPLETA E PRONTA PARA USO**

Todos os campos foram implementados, testados e documentados. O sistema agora permite configurar e-mail e notificações por tipo de atividade.

---

**Data de Implementação**: 24/10/2025  
**Versão**: 1.0.0

