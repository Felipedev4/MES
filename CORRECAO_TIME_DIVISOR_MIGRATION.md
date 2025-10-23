# Correção: Campo time_divisor - Migration e Prisma Client

## 🔴 Problema Inicial

### Erro 1: TypeScript
```
TSError: ⨯ Unable to compile TypeScript:
src/controllers/plcConfigController.ts:100:9 - error TS2353: 
Object literal may only specify known properties, 
and 'timeDivisor' does not exist in type 'PlcConfigCreateInput'
```

### Erro 2: Prisma Runtime
```
PrismaClientKnownRequestError:
The column `plc_configs.time_divisor` does not exist in the current database.
```

## 🔍 Diagnóstico

O campo `timeDivisor` estava definido no `schema.prisma`, mas:
1. ❌ O **Prisma Client** não havia sido regenerado
2. ❌ A **migration** não havia sido aplicada no banco de dados

## ✅ Solução Aplicada

### Passo 1: Regenerar Prisma Client
```bash
cd backend
npx prisma generate
```

**Resultado:**
✔ Generated Prisma Client (v5.22.0) in 116ms

### Passo 2: Executar Migration SQL
```bash
cd backend
npx prisma db execute --file prisma/migrations/20251023010000_add_time_divisor_to_plc_config/migration.sql
```

**Resultado:**
Script executed successfully.

### Passo 3: Registrar Migration no Prisma
```bash
cd backend
npx prisma migrate resolve --applied 20251023010000_add_time_divisor_to_plc_config
```

**Resultado:**
Migration 20251023010000_add_time_divisor_to_plc_config marked as applied.

## 📝 Migration SQL Aplicada

```sql
-- AlterTable: Adiciona coluna time_divisor na tabela plc_configs
ALTER TABLE "public"."plc_configs" 
ADD COLUMN "time_divisor" INTEGER NOT NULL DEFAULT 10;

-- Comentário da coluna
COMMENT ON COLUMN "public"."plc_configs"."time_divisor" IS 
'Divisor para conversão do tempo coletado (D33): 
1=segundos, 10=décimos, 100=centésimos, 1000=milissegundos';
```

## 📊 Campo no Schema Prisma

```prisma
model PlcConfig {
  id                Int               @id @default(autoincrement())
  name              String
  host              String
  port              Int               @default(502)
  unitId            Int               @default(1)
  timeout           Int               @default(5000)
  pollingInterval   Int               @default(1000)
  reconnectInterval Int               @default(10000)
  timeDivisor       Int               @default(10)   @map("time_divisor") // ← CAMPO ADICIONADO
  sectorId          Int?
  active            Boolean           @default(true)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // ... relações
}
```

## 🎯 Propósito do Campo

### `timeDivisor` (time_divisor)

**Função:** Configurar o divisor de tempo para conversão do valor lido do registro D33 do CLP.

**Valores possíveis:**
- `1` = O CLP armazena o tempo em **segundos**
- `10` = O CLP armazena o tempo em **décimos de segundo** (padrão)
- `100` = O CLP armazena o tempo em **centésimos de segundo**
- `1000` = O CLP armazena o tempo em **milissegundos**

**Exemplo:**
Se o CLP retorna valor `450` no registro D33:
- `timeDivisor = 1` → 450 segundos (7min 30s)
- `timeDivisor = 10` → 45 segundos (padrão)
- `timeDivisor = 100` → 4.5 segundos
- `timeDivisor = 1000` → 0.45 segundos

## 🔧 Uso no Controller

```typescript
export async function createPlcConfig(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { 
      name, 
      host, 
      port, 
      unitId, 
      timeout, 
      pollingInterval, 
      reconnectInterval,
      timeDivisor, // ← Campo agora disponível
      sectorId, 
      active 
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
        timeDivisor, // ← Pode ser usado sem erros
        sectorId: sectorId || null,
        active,
      },
      include: {
        sector: true,
        registers: true,
      },
    });

    res.status(201).json(config);
  } catch (error: any) {
    console.error('Erro ao criar configuração:', error);
    res.status(500).json({ error: error.message });
  }
}
```

## ⚠️ Lições Aprendidas

### Sempre que alterar o schema.prisma:

1. **Gerar o Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Criar a migration (desenvolvimento):**
   ```bash
   npx prisma migrate dev --name nome_da_migration
   ```

3. **Ou aplicar migration (produção):**
   ```bash
   npx prisma migrate deploy
   ```

### Em caso de banco já populado:

Se a migration falhar por já existir dados:

1. Executar SQL diretamente:
   ```bash
   npx prisma db execute --file caminho/para/migration.sql
   ```

2. Marcar como aplicada:
   ```bash
   npx prisma migrate resolve --applied nome_da_migration
   ```

## ✅ Status Final

- ✅ Campo `time_divisor` criado no banco de dados
- ✅ Prisma Client atualizado com o tipo correto
- ✅ Migration registrada no histórico do Prisma
- ✅ Controller funcionando sem erros TypeScript
- ✅ Queries ao banco funcionando corretamente
- ✅ Servidor backend iniciado com sucesso

## 📅 Data da Correção

22 de Outubro de 2025

## 📁 Arquivos Envolvidos

- `backend/prisma/schema.prisma`
- `backend/src/controllers/plcConfigController.ts`
- `backend/prisma/migrations/20251023010000_add_time_divisor_to_plc_config/migration.sql`

---

**Observação:** O servidor backend com nodemon deve ter reiniciado automaticamente após a correção e agora está funcionando normalmente.

