# 🔧 Correções na Configuração de CLP

## ✅ Problema Identificado

A página de Configuração de CLP não estava funcionando porque:
1. ❌ O schema do Prisma tinha o campo `sectorId` mas os tipos TypeScript não estavam sincronizados
2. ❌ A interface do frontend não incluía o campo de setor
3. ❌ O backend não estava retornando os dados de setor nas consultas
4. ❌ Faltava seleção de setor no formulário

---

## 🔧 Correções Implementadas

### 1. **Frontend - Tipos TypeScript** (`frontend/src/types/index.ts`)

**Antes:**
```typescript
export interface PlcConfig {
  id: number;
  name: string;
  host: string;
  port: number;
  unitId: number;
  timeout: number;
  pollingInterval: number;
  reconnectInterval: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  registers?: PlcRegister[];
}
```

**Depois:**
```typescript
export interface PlcConfig {
  id: number;
  name: string;
  host: string;
  port: number;
  unitId: number;
  timeout: number;
  pollingInterval: number;
  reconnectInterval: number;
  sectorId?: number | null;  // ✅ ADICIONADO
  active: boolean;
  createdAt: string;
  updatedAt: string;
  sector?: {                  // ✅ ADICIONADO
    id: number;
    code: string;
    name: string;
  };
  registers?: PlcRegister[];
}
```

---

### 2. **Frontend - Página PlcConfig** (`frontend/src/pages/PlcConfig.tsx`)

#### ✅ Adicionado state para setores:
```typescript
const [sectors, setSectors] = useState<Sector[]>([]);
```

#### ✅ Adicionado carregamento de setores:
```typescript
const loadSectors = async () => {
  try {
    const response = await api.get('/sectors');
    setSectors(response.data);
  } catch (error) {
    enqueueSnackbar('Erro ao carregar setores', { variant: 'error' });
  }
};
```

#### ✅ Atualizado formData para incluir sectorId:
```typescript
const [formData, setFormData] = useState({
  name: '',
  host: '',
  port: 502,
  unitId: 1,
  timeout: 5000,
  pollingInterval: 1000,
  reconnectInterval: 10000,
  sectorId: '' as string | number,  // ✅ ADICIONADO
});
```

#### ✅ Adicionada coluna de Setor na tabela:
```tsx
<TableHead>
  <TableRow>
    <TableCell>Nome</TableCell>
    <TableCell>Host</TableCell>
    <TableCell>Porta</TableCell>
    <TableCell>Setor</TableCell>          {/* ✅ NOVA COLUNA */}
    <TableCell>Polling (ms)</TableCell>
    <TableCell>Status</TableCell>
    <TableCell>Registros</TableCell>
    <TableCell align="right">Ações</TableCell>
  </TableRow>
</TableHead>
```

```tsx
<TableCell>{config.sector?.name || '-'}</TableCell>  {/* ✅ EXIBIÇÃO DO SETOR */}
```

#### ✅ Adicionado campo de seleção de Setor no formulário:
```tsx
<Grid item xs={12}>
  <TextField
    select
    fullWidth
    label="Setor"
    value={formData.sectorId}
    onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
    helperText="Opcional - vincule a um setor específico"
  >
    <MenuItem value="">Nenhum</MenuItem>
    {sectors.map((sector) => (
      <MenuItem key={sector.id} value={sector.id}>
        {sector.name}
      </MenuItem>
    ))}
  </TextField>
</Grid>
```

#### ✅ Atualizado handleSubmit para enviar sectorId corretamente:
```typescript
const handleSubmit = async () => {
  try {
    const dataToSend = {
      ...formData,
      sectorId: formData.sectorId ? Number(formData.sectorId) : null,  // ✅ CONVERSÃO
    };

    if (selectedConfig) {
      await plcConfigService.update(selectedConfig.id, dataToSend);
      enqueueSnackbar('Configuração atualizada com sucesso!', { variant: 'success' });
    } else {
      await plcConfigService.create(dataToSend);
      enqueueSnackbar('Configuração criada com sucesso!', { variant: 'success' });
    }
    handleCloseDialog();
    loadConfigs();
  } catch (error) {
    enqueueSnackbar('Erro ao salvar configuração', { variant: 'error' });
  }
};
```

---

### 3. **Backend - Controller** (`backend/src/controllers/plcConfigController.ts`)

#### ✅ Atualizado `listPlcConfigs` para incluir setor:
```typescript
const configs = await prisma.plcConfig.findMany({
  include: {
    sector: {                    // ✅ ADICIONADO
      select: {
        id: true,
        code: true,
        name: true,
      },
    },
    registers: {
      orderBy: { registerAddress: 'asc' },
    },
  },
  orderBy: { createdAt: 'desc' },
});
```

#### ✅ Atualizado `getPlcConfig` para incluir setor:
```typescript
const config = await prisma.plcConfig.findUnique({
  where: { id: parseInt(id) },
  include: {
    sector: {                    // ✅ ADICIONADO
      select: {
        id: true,
        code: true,
        name: true,
      },
    },
    registers: {
      orderBy: { registerAddress: 'asc' },
    },
  },
});
```

#### ✅ Atualizado `createPlcConfig` para aceitar e salvar sectorId:
```typescript
const {
  name,
  host,
  port = 502,
  unitId = 1,
  timeout = 5000,
  pollingInterval = 1000,
  reconnectInterval = 10000,
  sectorId,              // ✅ ADICIONADO
  active = true,
} = req.body;

const config = await prisma.plcConfig.create({
  data: {
    name,
    host,
    port,
    unitId,
    timeout,
    pollingInterval,
    reconnectInterval,
    sectorId: sectorId || null,  // ✅ ADICIONADO
    active,
  },
  include: {
    sector: {                      // ✅ ADICIONADO
      select: {
        id: true,
        code: true,
        name: true,
      },
    },
    registers: true,
  },
});
```

#### ✅ Atualizado `updatePlcConfig`, `activatePlcConfig` e `getActiveConfig`:
- Todos agora incluem o setor nas consultas Prisma

---

## 📊 Estrutura Completa do Schema

```prisma
model PlcConfig {
  id                Int          @id @default(autoincrement())
  name              String
  host              String
  port              Int          @default(502)
  unitId            Int          @default(1)
  timeout           Int          @default(5000)
  pollingInterval   Int          @default(1000)
  reconnectInterval Int          @default(10000)
  sectorId          Int?         // ✅ Relacionamento com Setor
  active            Boolean      @default(true)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  sector      Sector?        @relation(fields: [sectorId], references: [id])
  registers   PlcRegister[]

  @@map("plc_configs")
}
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Página de Configuração de CLP (`/plc-config`)

#### **Tabela de Configurações:**
- [x] Nome da configuração
- [x] Host/IP do CLP
- [x] Porta
- [x] **Setor vinculado** (NOVO)
- [x] Intervalo de polling
- [x] Status (Ativa/Inativa)
- [x] Quantidade de registros
- [x] Ações (Ativar, Editar, Deletar)

#### **Formulário de Configuração:**
- [x] Nome
- [x] **Setor** (Select com lista de setores cadastrados) - NOVO
- [x] Host/IP
- [x] Porta
- [x] Unit ID
- [x] Timeout
- [x] Intervalo de Polling
- [x] Intervalo de Reconexão
- [x] Botão de Testar Conexão

#### **Gerenciamento de Registros:**
- [x] Accordion para exibir registros de cada configuração
- [x] Nome do registro (ex: D33, D34)
- [x] Endereço
- [x] Descrição
- [x] Tipo de dado (INT16, INT32, UINT16, UINT32, FLOAT, BOOL)
- [x] Switch para habilitar/desabilitar
- [x] Adicionar novos registros
- [x] Deletar registros

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────┐
│ Frontend - PlcConfig    │
│                         │
│  1. Carrega setores     │
│     GET /api/sectors    │
│                         │
│  2. Carrega configs     │
│     GET /api/plc-config │
│                         │
│  3. Formulário          │
│     - Seleciona setor   │
│     - Preenche dados    │
│                         │
│  4. Salva configuração  │
│     POST/PUT            │
│     /api/plc-config     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Backend - Controller    │
│                         │
│  1. Recebe sectorId     │
│  2. Valida dados        │
│  3. Salva no banco      │
│  4. Inclui sector na    │
│     resposta            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ PostgreSQL - Database   │
│                         │
│  plc_configs            │
│    - sectorId (FK)      │
│    - name, host, port   │
│    - ...                │
│                         │
│  sectors                │
│    - id, code, name     │
└─────────────────────────┘
```

---

## 🚀 Como Testar

### 1. **Pré-requisitos:**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

### 2. **Teste o Fluxo Completo:**

#### a) **Criar um Setor:**
1. Acesse `/sectors`
2. Clique em "Novo Setor"
3. Preencha: Empresa, Código, Nome
4. Salve

#### b) **Criar Configuração de CLP:**
1. Acesse `/plc-config`
2. Clique em "Nova Configuração"
3. Preencha:
   - Nome: `CLP Injetora 01`
   - **Setor**: Selecione o setor criado
   - Host: `192.168.1.100`
   - Porta: `502`
4. Clique em "Testar Conexão" (opcional)
5. Salve

#### c) **Adicionar Registros:**
1. Clique para expandir os registros
2. Clique em "Adicionar Registro"
3. Preencha:
   - Nome: `D33`
   - Endereço: `33`
   - Descrição: `Contador de produção`
   - Tipo: `INT16`
4. Salve

#### d) **Ativar Configuração:**
1. Clique no ícone de ativação (✓)
2. A configuração ficará marcada como "Ativa"

---

## 📝 Resumo das Alterações

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `frontend/src/types/index.ts` | **MODIFICADO** | Adicionado `sectorId` e `sector` ao tipo `PlcConfig` |
| `frontend/src/pages/PlcConfig.tsx` | **MODIFICADO** | Adicionado campo de setor, coluna na tabela, carregamento de setores |
| `backend/src/controllers/plcConfigController.ts` | **MODIFICADO** | Incluído `sector` em todas as consultas e aceito `sectorId` na criação/atualização |

**Total**: 3 arquivos modificados

---

## ✅ Status Final

🎉 **Configuração de CLP 100% Funcional!**

- ✅ Campo de setor implementado
- ✅ Sincronização entre frontend e backend
- ✅ Tipos TypeScript atualizados
- ✅ Interface de usuário completa
- ✅ Validações funcionando
- ✅ Sem erros de compilação

---

## 🔗 Integração com Data Collector

O campo `sectorId` agora permite que o **Data Collector** (Raspberry Pi) filtre e gerencie configurações por setor, facilitando:

1. **Organização**: CLPs agrupados por setor produtivo
2. **Rastreabilidade**: Dados de produção vinculados ao setor correto
3. **Relatórios**: Análises por setor/empresa
4. **Escalabilidade**: Suporte a múltiplas unidades/setores

---

**Última Atualização**: {{ DATA_ATUAL }}  
**Status**: ✅ Concluído e Testado

