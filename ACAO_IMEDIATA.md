# ⚡ AÇÃO IMEDIATA - Corrigir Registros PLC

## 🎯 Problema Identificado

Seu sistema mostra:
- ❌ Contador CLP: **"-"** (vazio)
- ❌ Ciclo Coletado: **20.000 s** (20 mil segundos - ERRADO!)
- ❌ Apontamentos criados com dados incorretos

**Causa:** D33 (tempo) está sendo tratado como contador de peças.

---

## ✅ Solução em 3 Passos (5 minutos)

### 1️⃣ Executar Script SQL

```powershell
# Abrir psql
$env:PGPASSWORD="As09kl00__"
psql -U postgres -d mes_db

# Dentro do psql, colar este comando:
```

```sql
-- Adicionar coluna
ALTER TABLE plc_registers 
ADD COLUMN IF NOT EXISTS register_purpose VARCHAR(50);

-- D33 = Tempo de Ciclo (NÃO cria apontamento)
UPDATE plc_registers
SET register_purpose = 'CYCLE_TIME',
    description = 'Tempo de Ciclo (ms)'
WHERE register_name = 'D33' OR register_address = 33;

-- D40 = Contador de Peças (CRIA apontamento)
UPDATE plc_registers
SET register_purpose = 'PRODUCTION_COUNTER',
    description = 'Contador de Peças Produzidas'
WHERE register_name = 'D40' OR register_address = 40;

-- Verificar
SELECT register_name, register_address, description, register_purpose, enabled
FROM plc_registers
ORDER BY register_address;
```

**Sair do psql:**
```sql
\q
```

---

### 2️⃣ Regenerar Prisma e Recompilar

```powershell
# PARAR o backend primeiro (Ctrl+C)

cd C:\Empresas\Desenvolvimento\MES\backend

# Gerar cliente Prisma
npx prisma generate

# Recompilar
npm run build
```

---

### 3️⃣ Reiniciar Serviços

```powershell
# Terminal 1: Backend
cd C:\Empresas\Desenvolvimento\MES\backend
npm run dev

# Terminal 2: Data Collector
cd C:\Empresas\Desenvolvimento\MES\data-collector
npm start
```

---

## 🧪 Testar

1. **Acionar o sensor/CLP** para incrementar contador
2. **Verificar logs do Data Collector:**

```log
✅ CORRETO:
📊 D33: 20000 → 20100 (+100)
⏱️  D33 (Tempo de Ciclo): 20100ms  ← Apenas log, não cria apontamento

📊 D40: 164 → 168 (+4)
🎯 Criando apontamento automático: OP OP-2025-002 +4 peças
📊 Contador CLP D40: 168 peças  ← Valor salvo!
✅ Apontamento registrado com sucesso!
```

3. **Ver no banco:**

```sql
SELECT 
  pa.id,
  pa.quantity,
  pa.clp_counter_value,  -- ← Deve ter valor agora!
  pa.automatic,
  pa.timestamp,
  po.order_number
FROM production_appointments pa
JOIN production_orders po ON pa.production_order_id = po.id
ORDER BY pa.timestamp DESC
LIMIT 5;
```

4. **Ver na interface:**
   - Acessar: Resumo da Ordem
   - **Contador CLP**: deve mostrar **168** (ou outro valor)
   - **Ciclo Coletado**: deve mostrar tempo razoável (20s, não 20.000s)

---

## 📋 Checklist Rápido

- [ ] Script SQL executado
- [ ] D33 configurado como `CYCLE_TIME`
- [ ] D40 configurado como `PRODUCTION_COUNTER`
- [ ] `npx prisma generate` executado
- [ ] Backend recompilado
- [ ] Backend reiniciado
- [ ] Data Collector reiniciado
- [ ] Teste com sensor realizado
- [ ] Contador CLP aparece com valor correto

---

## 🔍 Se o Contador ainda estiver vazio

**Verifique qual registro é o contador de peças:**

```sql
-- Ver todos os registros
SELECT * FROM plc_registers WHERE enabled = true;

-- Se o contador for D50 (por exemplo):
UPDATE plc_registers
SET register_purpose = 'PRODUCTION_COUNTER'
WHERE register_name = 'D50';

-- Desabilitar D40 se não for o contador:
UPDATE plc_registers
SET enabled = false
WHERE register_name = 'D40' AND register_purpose != 'PRODUCTION_COUNTER';
```

---

## 🆘 Ajuda Rápida

**Se encontrar erro de permissão no Prisma:**
1. Parar o backend (Ctrl+C)
2. Aguardar 5 segundos
3. Rodar `npx prisma generate` novamente

**Se os apontamentos continuarem errados:**
1. Deletar apontamentos de teste:
```sql
DELETE FROM production_appointments WHERE automatic = true AND quantity < 10;
```
2. Reiniciar data-collector
3. Testar novamente

---

**Documentação Completa:** `CONFIGURACAO_REGISTROS_PLC_PROFISSIONAL.md`

**Tempo estimado:** 5 minutos ⏱️

