# 🚨 CORREÇÃO DE DUPLICATAS - GUIA RÁPIDO

## ✅ O QUE FOI IMPLEMENTADO

### 1. Código de Prevenção (Backend)
- ✅ **`dataCollectorController.ts`** - Bloqueia duplicatas automáticas do CLP
- ✅ **`productionService.ts`** - Avisa sobre duplicatas manuais
- ✅ **Backend reiniciado** - Mudanças ativas agora

### 2. Scripts Criados
- ✅ **`LIMPAR_DUPLICATAS_APONTAMENTOS.sql`** - Remove duplicatas existentes
- ✅ **`APLICAR_INDICES_DUPLICATAS.ps1`** - Cria índices no banco
- ✅ **`PREVENCAO_DUPLICATAS_IMPLEMENTADA.md`** - Documentação completa

---

## 🎯 COMO APLICAR A SOLUÇÃO (3 PASSOS)

### PASSO 1: Aplicar Índices no Banco de Dados ⚡

**Opção A - Usando PowerShell (RECOMENDADO):**
```powershell
.\APLICAR_INDICES_DUPLICATAS.ps1
```

**Opção B - Manualmente via psql:**
```bash
psql -U postgres -d mes_production -c "CREATE INDEX IF NOT EXISTS idx_appointment_dedup_auto ON production_appointments (productionOrderId, automatic, timestamp, clpCounterValue) WHERE automatic = true AND clpCounterValue IS NOT NULL;"

psql -U postgres -d mes_production -c "CREATE INDEX IF NOT EXISTS idx_appointment_recent ON production_appointments (productionOrderId, timestamp DESC, automatic);"
```

---

### PASSO 2: Limpar Duplicatas Existentes 🧹

**⚠️ IMPORTANTE:** Faça backup do banco antes!

**Conectar ao banco:**
```bash
psql -U postgres -d mes_production
```

**Verificar quantas duplicatas existem:**
```sql
-- Copie e cole este trecho no psql
WITH duplicates AS (
  SELECT 
    pa1.id as original_id,
    pa2.id as duplicate_id,
    pa1.quantity
  FROM production_appointments pa1
  INNER JOIN production_appointments pa2 ON 
    pa1."productionOrderId" = pa2."productionOrderId"
    AND pa1.automatic = true
    AND pa2.automatic = true
    AND pa1.id < pa2.id
    AND ABS(EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp))) < 10
    AND pa1.quantity = pa2.quantity
)
SELECT 
  COUNT(*) as "Total de Duplicatas",
  SUM(quantity) as "Peças Contadas em Duplicidade"
FROM duplicates;
```

**Executar limpeza completa:**
```bash
# Sair do psql (se estiver dentro)
\q

# Executar script completo
psql -U postgres -d mes_production -f LIMPAR_DUPLICATAS_APONTAMENTOS.sql
```

O script irá:
1. Identificar todas as duplicatas
2. Mostrar estatísticas
3. Corrigir as quantidades nas ordens
4. Remover os registros duplicados
5. Verificar que foi limpo

---

### PASSO 3: Verificar se Está Funcionando ✅

**Monitorar logs do backend:**
```powershell
# O backend já está rodando, veja o terminal
# Procure por mensagens como:

✅ Apontamento automático criado: OP OP-001 +3 peças
⚠️  DUPLICATA DETECTADA E BLOQUEADA: OP OP-001, Quantidade: 3
```

**Testar manualmente:**
```bash
# Enviar o mesmo apontamento duas vezes rapidamente
# (ajuste a API key e productionOrderId conforme necessário)

curl -X POST http://localhost:3001/api/data-collector/production-appointment ^
  -H "X-API-Key: data-collector-api-key-change-this" ^
  -H "Content-Type: application/json" ^
  -d "{\"productionOrderId\": 1, \"quantity\": 3, \"clpCounterValue\": 100}"

# Repetir imediatamente (deve ser bloqueado)
curl -X POST http://localhost:3001/api/data-collector/production-appointment ^
  -H "X-API-Key: data-collector-api-key-change-this" ^
  -H "Content-Type: application/json" ^
  -d "{\"productionOrderId\": 1, \"quantity\": 3, \"clpCounterValue\": 100}"
```

**Resultado esperado:**
- 1ª requisição: `201 Created` ✅
- 2ª requisição: `200 OK` com `isDuplicate: true` ⚠️ (bloqueada)

---

## 📊 COMO FUNCIONA A PREVENÇÃO

### Apontamentos Automáticos (do CLP):
Um registro é considerado duplicata se **TODOS** estes critérios são verdadeiros:
1. ✅ Mesma ordem de produção
2. ✅ Ambos são automáticos
3. ✅ Diferença de timestamp < 10 segundos
4. ✅ Mesmo contador CLP (se disponível)
5. ✅ Mesma quantidade

**Ação:** ❌ **BLOQUEADO** - Retorna o registro existente

### Apontamentos Manuais:
Um registro gera **aviso** se:
1. ✅ Mesma ordem + usuário + quantidade
2. ✅ Diferença < 5 segundos

**Ação:** ⚠️ **PERMITIDO** (mas loga aviso)

---

## 🔍 VERIFICAÇÃO RÁPIDA

**Ver se ainda há duplicatas no banco:**
```sql
-- Conectar: psql -U postgres -d mes_production

SELECT COUNT(*) as "Duplicatas Restantes"
FROM (
  SELECT pa1.id
  FROM production_appointments pa1
  INNER JOIN production_appointments pa2 ON 
    pa1."productionOrderId" = pa2."productionOrderId"
    AND pa1.automatic = true
    AND pa2.automatic = true
    AND pa1.id < pa2.id
    AND ABS(EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp))) < 10
    AND pa1.quantity = pa2.quantity
) AS dups;
```

**Resultado esperado:** `0` (zero duplicatas)

---

## 🚀 CHECKLIST DE VERIFICAÇÃO

- [ ] Backend reiniciado ✅ (já feito automaticamente)
- [ ] Índices aplicados no banco (execute `APLICAR_INDICES_DUPLICATAS.ps1`)
- [ ] Duplicatas limpas (execute `LIMPAR_DUPLICATAS_APONTAMENTOS.sql`)
- [ ] Testado manualmente (envie apontamentos duplicados)
- [ ] Logs monitorados (veja mensagens de bloqueio)
- [ ] Verificação final (query de duplicatas retorna 0)

---

## 📞 SE DUPLICATAS CONTINUAREM

1. **Verifique os logs:**
   - Backend deve mostrar `⚠️ DUPLICATA DETECTADA E BLOQUEADA`
   - Se não mostrar, o Data Collector pode estar enviando de forma assíncrona

2. **Verifique o Data Collector:**
   - Pode estar com retry configurado
   - Pode ter timeout causando reenvio
   - Verifique logs do data-collector

3. **Investigação avançada:**
   ```sql
   -- Ver últimos apontamentos e identificar padrão
   SELECT 
     id,
     "productionOrderId",
     quantity,
     timestamp,
     "clpCounterValue",
     automatic,
     EXTRACT(EPOCH FROM (timestamp - LAG(timestamp) OVER (PARTITION BY "productionOrderId" ORDER BY timestamp))) as "Segundos desde anterior"
   FROM production_appointments
   WHERE automatic = true
   ORDER BY timestamp DESC
   LIMIT 50;
   ```

---

## 📄 ARQUIVOS RELACIONADOS

- **`backend/src/controllers/dataCollectorController.ts`** - Código de bloqueio
- **`backend/src/services/productionService.ts`** - Aviso para manuais
- **`LIMPAR_DUPLICATAS_APONTAMENTOS.sql`** - Script de limpeza
- **`APLICAR_INDICES_DUPLICATAS.ps1`** - Script de índices
- **`PREVENCAO_DUPLICATAS_IMPLEMENTADA.md`** - Documentação completa

---

**Status:** ✅ Backend reiniciado com código de prevenção ativo  
**Próximo Passo:** Executar `APLICAR_INDICES_DUPLICATAS.ps1` e depois `LIMPAR_DUPLICATAS_APONTAMENTOS.sql`

