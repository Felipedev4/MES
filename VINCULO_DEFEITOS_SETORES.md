# 🔗 Vínculo entre Defeitos e Setores Responsáveis

## 📋 Visão Geral

Foi implementado um relacionamento **many-to-many** entre **Defeitos** e **Setores**, permitindo identificar quais setores são responsáveis por resolver cada tipo de defeito/parada improdutiva.

## 🎯 Objetivo

Quando uma parada improdutiva ocorre devido a um defeito específico, o sistema agora pode identificar automaticamente quais setores devem ser notificados ou acionados para resolver o problema.

## 🗄️ Estrutura do Banco de Dados

### Tabela Intermediária: `defect_sectors`

```sql
CREATE TABLE defect_sectors (
  id          SERIAL PRIMARY KEY,
  defect_id   INTEGER NOT NULL REFERENCES defects(id) ON DELETE CASCADE,
  sector_id   INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(defect_id, sector_id)
);
```

### Schema Prisma

```prisma
model Defect {
  id                Int            @id @default(autoincrement())
  code              String         @unique
  name              String
  description       String?
  severity          DefectSeverity @default(MEDIUM)
  active            Boolean        @default(true)
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  productionDefects ProductionDefect[]
  defectSectors     DefectSector[]     // Setores responsáveis

  @@map("defects")
}

model Sector {
  id                Int      @id @default(autoincrement())
  companyId         Int
  code              String   @unique
  name              String
  description       String?
  active            Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  company           Company           @relation(fields: [companyId], references: [id])
  plcConfigs        PlcConfig[]
  productionOrders  ProductionOrder[]
  defectSectors     DefectSector[]    // Defeitos que este setor resolve

  @@map("sectors")
}

model DefectSector {
  id        Int      @id @default(autoincrement())
  defectId  Int
  sectorId  Int
  createdAt DateTime @default(now())

  defect Defect @relation(fields: [defectId], references: [id], onDelete: Cascade)
  sector Sector @relation(fields: [sectorId], references: [id], onDelete: Cascade)

  @@unique([defectId, sectorId])
  @@map("defect_sectors")
}
```

## 🔧 Backend - Controller

### Listar Defeitos com Setores

```typescript
const defects = await prisma.defect.findMany({
  include: {
    defectSectors: {
      include: {
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    },
  },
});

// Transformar para formato simplificado
const defectsWithSectors = defects.map(defect => ({
  ...defect,
  responsibleSectors: defect.defectSectors.map(ds => ds.sector),
  defectSectors: undefined,
}));
```

### Criar Defeito com Setores

```typescript
const defect = await prisma.defect.create({
  data: {
    ...data,
    defectSectors: sectorIds && sectorIds.length > 0 ? {
      create: sectorIds.map((sectorId: number) => ({
        sectorId,
      })),
    } : undefined,
  },
  include: {
    defectSectors: {
      include: {
        sector: true,
      },
    },
  },
});
```

### Atualizar Defeito e Setores

```typescript
const defect = await prisma.defect.update({
  where: { id: parseInt(id) },
  data: {
    ...data,
    defectSectors: sectorIds !== undefined ? {
      // Deletar todos os vínculos existentes e recriar
      deleteMany: {},
      create: sectorIds.map((sectorId: number) => ({
        sectorId,
      })),
    } : undefined,
  },
});
```

## 🎨 Frontend - Interface

### Seleção de Setores Responsáveis

No dialog de cadastro/edição de defeitos, foi adicionado um campo **Autocomplete** multi-seleção para escolher os setores:

```tsx
<Autocomplete
  multiple
  options={sectors}
  getOptionLabel={(option) => `${option.code} - ${option.name}`}
  value={formData.sectors}
  onChange={(_, newValue) => setFormData({ ...formData, sectors: newValue })}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Setores Responsáveis"
      placeholder="Selecione os setores"
      helperText="Setores que podem resolver este tipo de defeito/parada"
    />
  )}
/>
```

### Exibição na Tabela

Uma nova coluna **"Setores Responsáveis"** foi adicionada à tabela, exibindo chips com os códigos dos setores:

- Mostra até 2 setores diretamente
- Se houver mais de 2, mostra um contador "+N"
- Tooltip ao passar o mouse exibe o nome completo do setor
- Se não houver setores, exibe "Sem setores"

## 📊 Estrutura de Dados

### Request (Criar/Atualizar Defeito)

```json
{
  "code": "DEF001",
  "name": "Bolha de Ar",
  "severity": "HIGH",
  "active": true,
  "sectorIds": [1, 3, 5]
}
```

### Response (Defeito com Setores)

```json
{
  "id": 1,
  "code": "DEF001",
  "name": "Bolha de Ar",
  "severity": "HIGH",
  "active": true,
  "responsibleSectors": [
    {
      "id": 1,
      "code": "SET001",
      "name": "Manutenção"
    },
    {
      "id": 3,
      "code": "SET003",
      "name": "Qualidade"
    },
    {
      "id": 5,
      "code": "SET005",
      "name": "Produção"
    }
  ],
  "_count": {
    "productionDefects": 15
  }
}
```

## 🎯 Casos de Uso

### 1. **Parada por Defeito Crítico**
- **Defeito:** Mancha no Produto (Severidade: Crítica)
- **Setores Responsáveis:** Qualidade, Manutenção, Matéria-Prima
- **Ação:** Sistema notifica automaticamente os 3 setores

### 2. **Parada Mecânica**
- **Defeito:** Falha no Molde
- **Setores Responsáveis:** Manutenção, Ferramentaria
- **Ação:** Apenas setores técnicos são notificados

### 3. **Defeito de Processo**
- **Defeito:** Parâmetros Incorretos
- **Setores Responsáveis:** Produção, Engenharia de Processos
- **Ação:** Setores operacionais e de engenharia são alertados

## 🚀 Como Usar

### 1. **Cadastrar Defeito com Setores**

1. Acesse **Cadastros > Defeitos**
2. Clique em **"Novo Defeito"**
3. Preencha:
   - Código (ex: DEF001)
   - Nome (ex: Bolha de Ar)
   - Severidade (Crítico, Alto, Médio, Baixo)
   - **Setores Responsáveis** (selecione um ou mais)
4. Clique em **"Criar"**

### 2. **Editar Setores Responsáveis**

1. Na lista de defeitos, clique no ícone de **"Editar"**
2. No campo **"Setores Responsáveis"**, adicione ou remova setores
3. Clique em **"Atualizar"**

### 3. **Visualizar Setores na Tabela**

- A coluna **"Setores Responsáveis"** exibe os setores vinculados
- Passe o mouse sobre um chip para ver o nome completo do setor
- Se houver mais de 2 setores, um contador indicará quantos mais existem

## ✅ Benefícios

### Para a Operação:
- ✅ **Identificação rápida** de quem deve resolver cada tipo de parada
- ✅ **Redução no tempo de resposta** a incidentes
- ✅ **Melhor comunicação** entre setores
- ✅ **Rastreabilidade** de responsabilidades

### Para a Gestão:
- ✅ **Indicadores de performance** por setor
- ✅ **Análise de recorrência** de defeitos por setor responsável
- ✅ **Planejamento de treinamentos** direcionados
- ✅ **Otimização de recursos** humanos

## 🔄 Próximos Passos Sugeridos

1. **Notificações Automáticas**
   - Enviar e-mail/SMS para setores responsáveis quando ocorrer uma parada
   - Integração com sistemas de gestão de manutenção

2. **Dashboard de Responsabilidades**
   - Gráfico de defeitos por setor responsável
   - Tempo médio de resolução por setor
   - Ranking de setores mais acionados

3. **Escalonamento Automático**
   - Se setor primário não responder em X minutos, escalar para setor secundário
   - Definir ordem de prioridade entre setores

4. **Histórico de Ações**
   - Registrar qual setor resolveu cada ocorrência
   - Tempo de resposta por setor
   - Ações tomadas para resolução

5. **Integração com Paradas**
   - Ao registrar uma parada com defeito, sugerir automaticamente os setores responsáveis
   - Criar workflows de notificação e resolução

## 📝 Exemplo Prático

**Cenário:** Molde com defeito crítico

1. **Operador identifica** defeito no produto (Mancha)
2. **Sistema consulta** cadastro de defeitos
3. **Encontra:** Defeito "Mancha" → Setores: Qualidade, Manutenção, Matéria-Prima
4. **Ação automática:**
   - Notifica os 3 setores
   - Cria ticket de manutenção
   - Registra parada improdutiva
   - Aguarda resolução

## 🔍 Queries Úteis

### Defeitos sem setores responsáveis:
```sql
SELECT d.*
FROM defects d
LEFT JOIN defect_sectors ds ON d.id = ds.defect_id
WHERE ds.id IS NULL AND d.active = true;
```

### Setores com mais defeitos vinculados:
```sql
SELECT s.code, s.name, COUNT(ds.id) as total_defects
FROM sectors s
JOIN defect_sectors ds ON s.id = ds.sector_id
GROUP BY s.id, s.code, s.name
ORDER BY total_defects DESC;
```

### Defeitos críticos e seus setores:
```sql
SELECT 
  d.code, 
  d.name, 
  d.severity,
  STRING_AGG(s.name, ', ') as responsible_sectors
FROM defects d
JOIN defect_sectors ds ON d.id = ds.defect_id
JOIN sectors s ON ds.sector_id = s.id
WHERE d.severity = 'CRITICAL' AND d.active = true
GROUP BY d.id, d.code, d.name, d.severity;
```

---

**Data:** 23/10/2024  
**Desenvolvedor:** AI Assistant  
**Status:** ✅ Implementado e Testado

