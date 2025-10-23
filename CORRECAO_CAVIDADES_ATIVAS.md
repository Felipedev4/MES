# Correção - Exibir Cavidades Ativas ao invés de Totais

## 🎯 Problema Identificado

O sistema estava mostrando as **cavidades totais** do molde ao invés das **cavidades ativas** (funcionais) em todas as telas.

**Exemplo:**
- Molde com **4 cavidades totais**
- Apenas **2 cavidades ativas** (funcionais)
- Sistema mostrava **4** ❌
- Deveria mostrar **2** ✅

---

## ✅ Correções Aplicadas

### 1. **OrderSummary.tsx** (Resumo da Ordem)

#### Interface `OrderData`
Adicionado campo `activeCavities`:
```typescript
mold: {
  name: string;
  cavities: number;
  activeCavities?: number; // ✅ NOVO
  cycleTime?: number;
}
```

#### Exibição das Cavidades
Atualizado para priorizar cavidades ativas:
```typescript
// ANTES
{orderData?.mold?.cavities || 0}

// DEPOIS
{orderData?.mold?.activeCavities || orderData?.mold?.cavities || 0}
```

**Lógica:**
1. Mostra `activeCavities` se disponível
2. Se não houver `activeCavities`, usa `cavities` (compatibilidade)
3. Se não houver nenhum, mostra `0`

---

### 2. **ProductionDashboard.tsx** (Dashboard de Produção)

#### Dialog de Setup - Inicialização
Atualizado para carregar cavidades ativas:
```typescript
// ANTES
if (orderData?.mold?.cavities) {
  setCavities(orderData.mold.cavities.toString());
}

// DEPOIS
if (orderData?.mold?.activeCavities || orderData?.mold?.cavities) {
  const cavitiesToShow = orderData.mold.activeCavities || orderData.mold.cavities;
  setCavities(cavitiesToShow.toString());
}
```

#### Campo de Exibição
Atualizado label e valor:
```typescript
// ANTES
label="Cavidade Molde"
value={orderData?.mold?.cavities}

// DEPOIS
label="Cavidades Ativas"
value={orderData?.mold?.activeCavities || orderData?.mold?.cavities}
```

---

## 🔄 Como Funciona Agora

### Fluxo Completo

1. **Cadastro de Molde**:
   - Total de cavidades: 4
   - Cavidades ativas: 2
   
2. **Backend - Data Collector** (`dataCollectorController.ts`):
   - Retorna `moldCavities: activeCavities || cavities`
   - Exemplo: retorna **2** (ativas)

3. **Frontend - Exibição**:
   - **OrderSummary**: Mostra **2** cavidades
   - **ProductionDashboard**: Mostra **2** cavidades ativas
   
4. **Apontamento de Produção**:
   - Usa as **2 cavidades ativas** nos cálculos
   - Produção calculada corretamente

---

## 📊 Resultado Esperado

### Antes ❌
```
OP-2025-004
Cavidades: 4
Tampa Plástica 100mm
Molde Tampa 4 Cavidades
```

### Depois ✅
```
OP-2025-004
Cavidades: 2          ← Cavidades ativas
Tampa Plástica 100mm
Molde Tampa 4 Cavidades  ← Nome do molde (não muda)
```

---

## 🧪 Como Testar

### 1. Atualizar o Navegador
Pressione **Ctrl+Shift+R** para fazer hard refresh

### 2. Verificar Resumo da Ordem
- Acesse `/order-summary/[id]`
- Verifique se o campo "Cavidades" mostra o valor correto
- Deve mostrar **cavidades ativas** (2) e não totais (4)

### 3. Verificar Dashboard de Produção
- Acesse `/production-dashboard/[id]`
- Clique no card "Configuração Setup"
- Campo "Cavidades Ativas" deve mostrar **2**

### 4. Verificar Apontamento
- Data Collector deve usar **2 cavidades** nos cálculos
- Console do backend deve mostrar: `moldCavities=2`

---

## 💡 Compatibilidade

✅ **Moldes antigos** (sem `activeCavities`):
- Sistema usa `cavities` automaticamente
- Funciona normalmente

✅ **Moldes novos** (com `activeCavities`):
- Sistema prioriza `activeCavities`
- Cálculos corretos

---

## 📝 Arquivos Modificados

- `frontend/src/pages/OrderSummary.tsx`
- `frontend/src/pages/ProductionDashboard.tsx`
- `backend/src/controllers/dataCollectorController.ts` (já estava correto)

---

## ⚡ Aplicação

Execute hard refresh no navegador:
- **Ctrl+Shift+R** (Windows/Linux)
- **Cmd+Shift+R** (Mac)

Não é necessário reiniciar os serviços, apenas atualizar o navegador!

---

**Correção aplicada em: 22/10/2025 - 23:10**

