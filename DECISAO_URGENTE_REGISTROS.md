# ⚠️ DECISÃO URGENTE - Qual Registro É o Contador de Peças?

## 📊 Situação Atual no Banco:

```
Registro | Endereço | Descrição              | Propósito           | Habilitado
---------|----------|------------------------|---------------------|------------
D33      | 33       | Tempo de Ciclo (ms)    | CYCLE_TIME          | ✅ SIM
D34      | 34       | Contador de rejeitos   | OTHER               | ❌ NÃO
D35      | 35       | Status da máquina      | OTHER               | ❌ NÃO
D40      | 40       | Velocidade da linha    | PRODUCTION_COUNTER  | ❌ NÃO
```

## ⚠️ PROBLEMA IDENTIFICADO:

**Apenas D33 está HABILITADO**, mas está configurado como CYCLE_TIME!

## 🤔 QUAL É O CORRETO?

### Opção A: D33 é REALMENTE tempo de ciclo
- **D40** deveria ser o contador de peças
- Mas D40 está DESABILITADO e descrito como "Velocidade"
- **AÇÃO:** Habilitar D40 e corrigir descrição

### Opção B: D33 é NA VERDADE o contador de peças
- A descrição está errada
- D33 deveria ser PRODUCTION_COUNTER
- **AÇÃO:** Corrigir propósito de D33

---

## 🔍 COMO DESCOBRIR?

### Ver os dados reais do PLC:

```sql
-- Ver últimos valores lidos
SELECT 
  "registerName",
  value,
  timestamp
FROM plc_data
WHERE "registerAddress" IN (33, 40)
ORDER BY timestamp DESC
LIMIT 20;
```

### Análise:
- **Se D33 incrementa gradualmente** (100, 105, 110...) → É CONTADOR
- **Se D33 varia aleatoriamente** (20100, 20050, 19900...) → É TEMPO
- **Se D40 incrementa gradualmente** → É CONTADOR  
- **Se D40 varia pouco** → É VELOCIDADE ou TEMPO

---

## 🎯 SOLUÇÕES RÁPIDAS:

### ✅ SOLUÇÃO 1: D33 é contador (mais provável baseado nos dados)

```sql
-- D33 = Contador de Peças
UPDATE plc_registers
SET description = 'Contador de Peças Produzidas',
    register_purpose = 'PRODUCTION_COUNTER'
WHERE "registerName" = 'D33';

-- D40 = Velocidade (desabilitado)
-- Já está correto como está
```

### ✅ SOLUÇÃO 2: D40 é contador

```sql
-- D40 = Contador de Peças  
UPDATE plc_registers
SET description = 'Contador de Peças Produzidas',
    register_purpose = 'PRODUCTION_COUNTER',
    enabled = true  -- ← HABILITAR!
WHERE "registerName" = 'D40';

-- D33 = Tempo de Ciclo
-- Já está correto
```

---

## 📊 BASEADO NA SUA INTERFACE:

Na imagem que você mostrou:
- **Produção: 168 peças**
- **Ciclo Padrão: 20 s**  
- **Ciclo Coletado: 20.000 s** ← ERRADO! (20 mil segundos)

Isso indica que:
- ✅ **D33 provavelmente É o contador** (valor 168)
- ❌ **D33 estava sendo tratado como tempo** (daí 20.000s)

**Conclusão:** Use **SOLUÇÃO 1**!

---

## ⚡ EXECUTAR AGORA:

```powershell
$env:PGPASSWORD="As09kl00__"

# Verificar valores atuais primeiro
psql -U postgres -d mes_db -c 'SELECT "registerName", "registerAddress", value, timestamp FROM plc_data WHERE "registerAddress" IN (33, 40) ORDER BY timestamp DESC LIMIT 10;'

# SE D33 tiver valores como 164, 168, 172... É CONTADOR!
# Executar SOLUÇÃO 1:
psql -U postgres -d mes_db -c 'UPDATE plc_registers SET description = ''Contador de Peças Produzidas'', register_purpose = ''PRODUCTION_COUNTER'' WHERE \"registerName\" = ''D33'';'

# Verificar
psql -U postgres -d mes_db -c 'SELECT \"registerName\", description, register_purpose, enabled FROM plc_registers ORDER BY \"registerAddress\";'
```

---

## 🎯 DEPOIS DE CORRIGIR:

**NÃO precisa reiniciar backend!**  
O Prisma vai buscar os valores corretos automaticamente.

**Apenas recarregue a página web:** Ctrl + F5

---

Qual solução devo aplicar? (baseado nos seus dados, recomendo SOLUÇÃO 1)

