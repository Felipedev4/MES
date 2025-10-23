# ✅ CORREÇÃO: Quantidade Faltante Descontando Perdas

## 🐛 PROBLEMA

A **Quantidade Faltante** não estava descontando as peças perdidas/rejeitadas.

**Cálculo incorreto:**
```
Qtd. Faltante = Qtd. Total - Qtd. Produzida
```

**Exemplo com dados reais:**
- Qtd. Total: 15.000
- Qtd. Produzida: 8
- Qtd. Perda: 5
- **Resultado incorreto:** 15.000 - 8 = **14.992** ❌

---

## ✅ SOLUÇÃO IMPLEMENTADA

**Cálculo correto:**
```
Qtd. Faltante = Qtd. Total - Qtd. Produzida - Qtd. Perda
```

**Com os mesmos dados:**
- Qtd. Total: 15.000
- Qtd. Produzida: 8
- Qtd. Perda: 5
- **Resultado correto:** 15.000 - 8 - 5 = **14.987** ✅

---

## 📝 CÓDIGO ALTERADO

**Arquivo:** `frontend/src/pages/OrderSummary.tsx`

**Linha 148:**

```typescript
// ❌ ANTES
const remaining = order.plannedQuantity - totalProduced;

// ✅ DEPOIS
const remaining = order.plannedQuantity - totalProduced - totalRejected;
```

---

## 🎯 LÓGICA CORRETA

A quantidade faltante representa **quantas peças ainda faltam produzir**, considerando:

1. **Total Planejado:** 15.000 peças
2. **Já Produzidas:** 8 peças (boas)
3. **Perdidas/Rejeitadas:** 5 peças (refugo)
4. **Ainda Faltam:** 15.000 - 8 - 5 = **14.987 peças**

**Por quê?**
- As 5 peças perdidas **não servem** para completar a ordem
- Precisam ser produzidas **mais 14.987 peças boas** para atingir o total
- Ou seja: das 15.000 planejadas, já foram "consumidas" 13 peças (8 boas + 5 perdas)

---

## 📊 EXEMPLO VISUAL

```
┌────────────────────────────────────────┐
│ ORDEM DE PRODUÇÃO: 15.000 peças       │
├────────────────────────────────────────┤
│ ✅ Produzidas (boas):      8           │
│ ❌ Perdidas (refugo):      5           │
│ ⏳ Faltando produzir:  14.987          │
├────────────────────────────────────────┤
│ Total contabilizado: 8 + 5 = 13       │
│ Restante: 15.000 - 13 = 14.987        │
└────────────────────────────────────────┘
```

---

## ✅ TESTE

**Valores de teste:**

| Qtd. Total | Qtd. Produzida | Qtd. Perda | Qtd. Faltante |
|-----------|----------------|------------|---------------|
| 15.000    | 8              | 5          | **14.987**    |
| 10.000    | 100            | 10         | **9.890**     |
| 5.000     | 2.500          | 100        | **2.400**     |
| 1.000     | 1.000          | 0          | **0**         |
| 1.000     | 900            | 50         | **50**        |

---

## 🚀 COMO VERIFICAR

1. **Acesse** o Resumo da Ordem
2. **Observe** a seção "Produção"
3. **Verifique** que:
   ```
   Qtd. Faltante = Qtd. Total - Qtd. Produzida - Qtd. Perda
   ```

**Com os dados da imagem:**
- Qtd. Total: 15.000
- Produzidas: 8 (centro do gráfico)
- Perdas: 5
- **Faltante deve ser:** 14.987 ✅

---

**Data:** 22/10/2025  
**Arquivo:** `frontend/src/pages/OrderSummary.tsx`  
**Status:** ✅ Corrigido

