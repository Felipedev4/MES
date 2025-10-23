# 🔧 CONFIGURAÇÃO: TIME_DIVISOR - Divisor do Tempo Coletado

## 📍 LOCALIZAÇÃO DO PARÂMETRO

**Arquivo:** `frontend/src/pages/OrderSummary.tsx`  
**Linhas:** 16-20

```typescript
// 🔧 CONFIGURAÇÃO: Divisor para conversão do tempo coletado (D33)
// - Se D33 vem em DÉCIMOS de segundo: usar 10 (ex: 51 = 5,1s)
// - Se D33 vem em CENTÉSIMOS de segundo: usar 100 (ex: 510 = 5,1s)
// - Se D33 vem em MILISSEGUNDOS: usar 1000 (ex: 5100 = 5,1s)
const TIME_DIVISOR = 10; // D33 em décimos de segundo
```

---

## 🎯 COMO FUNCIONA

O `TIME_DIVISOR` é usado para converter o valor do **campo `quantity`** (D33) em **segundos**.

### **Valor Atual:** `TIME_DIVISOR = 10`

Significa que o D33 vem em **décimos de segundo**:
- `quantity = 51` → `51 / 10` = **5,1 segundos**
- `quantity = 850` → `850 / 10` = **85,0 segundos**
- `quantity = 1100` → `1100 / 10` = **110,0 segundos**

---

## 🔄 OPÇÕES DE CONFIGURAÇÃO

### **1. D33 em DÉCIMOS de segundo** ✅ (ATUAL)
```typescript
const TIME_DIVISOR = 10;
```
- D33 = 51 → 5,1s
- D33 = 100 → 10,0s

### **2. D33 em CENTÉSIMOS de segundo**
```typescript
const TIME_DIVISOR = 100;
```
- D33 = 510 → 5,1s
- D33 = 1000 → 10,0s

### **3. D33 em MILISSEGUNDOS**
```typescript
const TIME_DIVISOR = 1000;
```
- D33 = 5100 → 5,1s
- D33 = 10000 → 10,0s

### **4. D33 já em SEGUNDOS**
```typescript
const TIME_DIVISOR = 1;
```
- D33 = 5.1 → 5,1s
- D33 = 10.0 → 10,0s

---

## 📊 ONDE O TIME_DIVISOR É USADO

O parâmetro é usado em **3 locais** no arquivo:

### **1. Cálculo do Tempo Total** (Linha ~155)
```typescript
const totalTimeUnits = appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0);
const totalSeconds = totalTimeUnits / TIME_DIVISOR; // ← AQUI
```

### **2. Exibição do "Ciclo Coletado (total)"** (Linha ~433)
```typescript
{((appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0)) / TIME_DIVISOR).toLocaleString('pt-BR', ...)}
   // ← AQUI
```

### **3. Tabela "Tempo Coletado (s)"** (Linha ~487)
```typescript
<td style={{ padding: '12px', textAlign: 'right' }}>
  {((apt.quantity || 0) / TIME_DIVISOR).toFixed(1)} // ← AQUI
</td>
```

---

## ✏️ COMO ALTERAR

### **Passo 1:** Abrir o arquivo
```
frontend/src/pages/OrderSummary.tsx
```

### **Passo 2:** Localizar a linha 20
```typescript
const TIME_DIVISOR = 10; // D33 em décimos de segundo
```

### **Passo 3:** Alterar o valor conforme necessário
```typescript
// Exemplo: Mudar para milissegundos
const TIME_DIVISOR = 1000; // D33 em milissegundos
```

### **Passo 4:** Salvar e recompilar o frontend
```bash
cd frontend
npm run build
```

---

## 🧪 TESTE DE CONVERSÃO

Com **`TIME_DIVISOR = 10`** (décimos de segundo):

| quantity (D33) | Cálculo | Resultado |
|----------------|---------|-----------|
| 51 | 51 / 10 | 5,1 s |
| 70 | 70 / 10 | 7,0 s |
| 850 | 850 / 10 | 85,0 s |
| 1100 | 1100 / 10 | 110,0 s |
| 200 | 200 / 10 | 20,0 s |

Com **`TIME_DIVISOR = 1000`** (milissegundos):

| quantity (D33) | Cálculo | Resultado |
|----------------|---------|-----------|
| 5100 | 5100 / 1000 | 5,1 s |
| 7000 | 7000 / 1000 | 7,0 s |
| 85000 | 85000 / 1000 | 85,0 s |
| 110000 | 110000 / 1000 | 110,0 s |
| 20000 | 20000 / 1000 | 20,0 s |

---

## 🎯 VERIFICAÇÃO VISUAL

Depois de alterar o `TIME_DIVISOR`, verifique:

1. **Tabela "Detalhes Apontamento"** - Coluna "Tempo Coletado (s)"
   - Os valores devem fazer sentido (ex: 5,1s, 85,0s)
   
2. **"Ciclo Coletado (total)"**
   - Deve ser a soma de todos os tempos em segundos
   
3. **"Tempo Total de Injeção"**
   - Deve mostrar o tempo no formato HH:MM:SS

---

## ⚠️ IMPORTANTE

- **Altere apenas este parâmetro** se mudar a unidade de tempo do D33
- **Não altere** o cálculo da quantidade produzida (clpCounterValue)
- **Teste** após qualquer alteração

---

## 📋 RESUMO

| Item | Valor Atual | Como Alterar |
|------|-------------|--------------|
| **Arquivo** | `frontend/src/pages/OrderSummary.tsx` | Editar com editor de código |
| **Linha** | 20 | Procurar por `const TIME_DIVISOR` |
| **Valor Atual** | `10` (décimos) | Mudar para 1, 100, ou 1000 |
| **Uso** | Converter D33 para segundos | Automático após alterar |

---

**Data:** 22/10/2025  
**Status:** ✅ Configurável  
**Localização:** `frontend/src/pages/OrderSummary.tsx:20`

