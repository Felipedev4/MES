# Campos Invertidos - Configuração Final

## ✅ Configuração Aplicada

### Mapeamento de Campos

```
quantity (banco) → Coluna "Peças" (frontend) = Valor do contador D33
clpCounterValue (banco) → Coluna "Tempo" (frontend) = Cavidades ativas
```

---

## 📊 O que Você Verá Agora

### Próximos Apontamentos

| Data/Hora | **Tempo** | Perda | Tipo | **Peças** |
|-----------|-----------|-------|------|-----------|
| ... | **2** | 0 | Automático | **<valor_D33>** |

**Exemplo com valores reais:**
- Coluna "Peças": 3500, 3700, 3900 (valores do contador D33)
- Coluna "Tempo": 2 (cavidades ativas do molde)

---

## 🔍 Lógica Implementada

### Quando um ciclo completa:

```typescript
D33 muda de 3500 para 3700
moldCavities = 2 (cavidades ativas)

Registra:
  quantity = 3700          → Coluna "Peças"
  clpCounterValue = 2      → Coluna "Tempo"
```

---

## 📋 Estrutura no Banco

### Tabela `production_appointments`

```sql
INSERT INTO production_appointments (
  quantity,           -- Valor do D33 (ex: 3700)
  clpCounterValue,    -- Cavidades ativas (ex: 2)
  automatic,
  timestamp
) VALUES (
  3700,
  2,
  true,
  NOW()
);
```

---

## 🎯 Logs do Data-Collector

```
🔄 Ciclo completo detectado!
⏱️  D33: 3700 (Δ 200)
🎯 Criando apontamento: OP OP-2025-004
📦 Peças (coluna): 3700 | Tempo (coluna): 2
✅ Apontamento registrado com sucesso!
```

---

## ⚠️ Observações Importantes

### Incremento de Produção
Com essa configuração:
- O campo `quantity` no banco = valor do D33
- A `producedQuantity` da ordem será incrementada pelo valor do D33

**Exemplo:**
```
Ciclo 1: D33 = 3500 → producedQuantity += 3500
Ciclo 2: D33 = 3700 → producedQuantity += 3700
Total produzido = 7200 (!)
```

⚠️ **ATENÇÃO**: Isso provavelmente **NÃO** está correto para contabilização de produção real!

### Configuração Típica vs Atual

**Configuração Típica (Recomendada):**
```
Coluna "Peças" = Quantidade produzida (ex: 2 cavidades)
Coluna "Tempo" = Tempo de ciclo (ex: 3.5s)
Total produzido += 2 por ciclo
```

**Configuração Atual (Invertida):**
```
Coluna "Peças" = Valor do D33 (ex: 3700)
Coluna "Tempo" = Cavidades (ex: 2)
Total produzido += 3700 por ciclo (!)
```

---

## 🔧 Se Precisar Reverter

Para voltar à configuração normal:

1. Edite `data-collector/src/services/PlcConnection.ts`
2. Troque de volta:
```typescript
recordProduction(
  orderId,
  moldCavities,    // quantity = cavidades
  undefined,
  counterValue     // clpCounterValue = D33
)
```
3. Recompile: `npm run build`
4. Reinicie o data-collector

---

## ✅ Status Atual

- [x] Campos invertidos no código
- [x] Data-collector compilado
- [x] Data-collector iniciado
- [ ] Aguardando próximo ciclo para confirmar

---

## 📺 Data-Collector Rodando

Uma nova janela PowerShell foi aberta.

**Aguarde o próximo ciclo do PLC para ver:**
- Coluna "Peças" com valor alto (D33)
- Coluna "Tempo" com valor 2 (cavidades)

---

**Data/Hora**: 22/10/2025 - 15:05
**Status**: ✅ Pronto

