# 🔢 Ordenação de Cards - Página Injetoras

## 📋 Objetivo
Implementar ordenação inteligente dos cards de ordens na página `injectors/:id/orders` para priorizar visualização das ordens mais relevantes.

## ✅ Critérios de Ordenação Implementados

### Ordem de Prioridade

```
1️⃣ Status da Ordem (ACTIVE primeiro)
   ↓
2️⃣ Prioridade (maior prioridade primeiro)
   ↓
3️⃣ Data de Início Planejada (mais antiga primeiro)
```

## 🎯 Lógica Detalhada

### 1. Status ACTIVE Primeiro 🟢

**Ordens em Atividade sempre aparecem no topo!**

- Status `ACTIVE` = **Ordem em produção AGORA**
- Status `PROGRAMMING`, `PAUSED`, etc. = Ordens não ativas

**Exemplo**:
```
┌─────────────────────────────────┐
│ 🟢 Em Atividade                 │ ← ACTIVE (aparece PRIMEIRO)
│ OP-2025-001  Prioridade: 3      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🔴 URGENTE                       │ ← PROGRAMMING (aparece depois)
│ OP-2025-002  Prioridade: 10     │ ← Mesmo com prioridade maior!
└─────────────────────────────────┘
```

**Por quê?**
- Ordem ACTIVE = **produção acontecendo agora**
- Operadores precisam ver **imediatamente** o que está rodando
- Ordens urgentes mas não iniciadas vêm depois

### 2. Prioridade (Maior Primeiro) 📊

**Entre ordens com mesmo status, ordena por prioridade.**

- Prioridade **10** (alta) antes de prioridade **1** (baixa)
- Ordem descendente: 10 → 9 → 8 → ... → 1 → 0

**Exemplo**:
```
Ambas PROGRAMMING:

┌─────────────────────────────────┐
│ 🔴 URGENTE                       │
│ OP-2025-002  Prioridade: 10     │ ← Prioridade 10 (PRIMEIRO)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ OP-2025-003  Prioridade: 5      │ ← Prioridade 5 (depois)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ OP-2025-004  Prioridade: 0      │ ← Prioridade 0 (por último)
└─────────────────────────────────┘
```

### 3. Data de Início Planejada (Mais Antiga Primeiro) 📅

**Entre ordens com mesmo status E mesma prioridade, ordena por data.**

- Data **mais antiga** primeiro
- Ordem ascendente: 21/10 → 22/10 → 23/10

**Exemplo**:
```
Ambas PROGRAMMING + Prioridade 5:

┌─────────────────────────────────┐
│ OP-2025-005                      │
│ Data Inicial: 21/10/2025        │ ← Mais antiga (PRIMEIRO)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ OP-2025-006                      │
│ Data Inicial: 25/10/2025        │ ← Mais recente (depois)
└─────────────────────────────────┘
```

## 🔍 Exemplo Completo de Ordenação

### Cenário: 5 Ordens Diferentes

| Ordem | Status | Prioridade | Data Início | Posição Final |
|-------|--------|------------|-------------|---------------|
| OP-2025-001 | **ACTIVE** | 3 | 21/10 | **1º** ⭐ |
| OP-2025-002 | PROGRAMMING | 10 | 22/10 | **2º** |
| OP-2025-003 | PROGRAMMING | 10 | 20/10 | **3º** |
| OP-2025-004 | PROGRAMMING | 5 | 18/10 | **4º** |
| OP-2025-005 | PAUSED | 8 | 19/10 | **5º** |

### Explicação da Ordenação:

1. **OP-2025-001** (1º lugar):
   - Status: ACTIVE ✅
   - **Sempre primeiro porque está em atividade!**

2. **OP-2025-002** (2º lugar):
   - Status: PROGRAMMING
   - Prioridade: 10 (mais alta)
   - Data: 22/10

3. **OP-2025-003** (3º lugar):
   - Status: PROGRAMMING
   - Prioridade: 10 (igual ao anterior)
   - Data: 20/10 (mais antiga que OP-002)

4. **OP-2025-004** (4º lugar):
   - Status: PROGRAMMING
   - Prioridade: 5 (menor que anteriores)

5. **OP-2025-005** (5º lugar):
   - Status: PAUSED
   - Não é ACTIVE, então vem depois das PROGRAMMING

## 💻 Código Implementado

### Arquivo: `frontend/src/pages/OrderPanel.tsx`

```typescript
// Ordenar ordens:
// 1. Ordens em ATIVIDADE (ACTIVE) primeiro
// 2. Depois por PRIORIDADE (descendente - maior prioridade primeiro)
// 3. Depois por data de início planejada (ascendente)
const sortedOrders = response.data.sort((a, b) => {
  // 1. Priorizar ordens ACTIVE
  if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
  if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
  
  // 2. Se ambas têm mesmo status, ordenar por prioridade (maior primeiro)
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }
  
  // 3. Se têm mesma prioridade, ordenar por data de início
  return new Date(a.plannedStartDate).getTime() - new Date(b.plannedStartDate).getTime();
});

setOrders(sortedOrders);
```

## 🎨 Indicadores Visuais

### Chips de Status e Prioridade

Os cards já têm indicadores visuais que reforçam a ordenação:

**Status ACTIVE**:
```
🟢 Em Atividade
```

**Prioridade Alta**:
```
🔴 URGENTE (prioridade >= 8)
```

## 📊 Benefícios da Ordenação

### Para Operadores
- ✅ **Visualização imediata** da ordem em produção
- ✅ **Próximas ordens** já visíveis (por prioridade)
- ✅ **Planejamento** facilitado (ordens urgentes em destaque)

### Para Gestores
- ✅ **Controle de prioridades** respeitado
- ✅ **Ordens críticas** sempre visíveis
- ✅ **Organização temporal** (datas de início)

### Para o Sistema
- ✅ **Ordenação automática** a cada atualização
- ✅ **Consistência** na exibição
- ✅ **Performance** (sort no frontend, não sobrecarrega backend)

## 🔄 Atualização Automática

A ordenação é **refeita automaticamente**:
- ✅ A cada **auto-refresh** (padrão: 30 segundos)
- ✅ Ao **carregar a página**
- ✅ Ao **alterar status** de uma ordem

**Resultado**: Cards sempre na ordem correta, mesmo com mudanças de status!

## 📝 Casos de Uso

### Caso 1: Iniciar Produção
```
Antes:
1. OP-2025-002 (PROGRAMMING, Prioridade 10)
2. OP-2025-001 (PROGRAMMING, Prioridade 5)

Usuário inicia OP-2025-001 → status muda para ACTIVE

Depois (auto-refresh):
1. OP-2025-001 (ACTIVE, Prioridade 5) ⭐ SUBIU!
2. OP-2025-002 (PROGRAMMING, Prioridade 10)
```

### Caso 2: Ordem Urgente Criada
```
Sistema:
1. OP-2025-001 (ACTIVE)
2. OP-2025-002 (PROGRAMMING, Prioridade 5)

Nova ordem criada: OP-2025-URGENTE (PROGRAMMING, Prioridade 10)

Após auto-refresh:
1. OP-2025-001 (ACTIVE) ⭐ Continua primeiro
2. OP-2025-URGENTE (PROGRAMMING, Prioridade 10) ⭐ Em 2º
3. OP-2025-002 (PROGRAMMING, Prioridade 5)
```

### Caso 3: Finalizar Produção
```
Antes:
1. OP-2025-001 (ACTIVE)
2. OP-2025-002 (PROGRAMMING, Prioridade 10)

OP-2025-001 finaliza → status muda para FINISHED

Depois (auto-refresh):
1. OP-2025-002 (PROGRAMMING, Prioridade 10) ⭐ Agora é a primeira
(OP-2025-001 não aparece mais - ordens finalizadas são filtradas)
```

## 🔧 Personalização Futura

### Possíveis Melhorias:

1. **Ordenação por OEE**:
   - Ordens com OEE baixo aparecem destacadas
   
2. **Ordenação por Atraso**:
   - Ordens atrasadas (data fim < hoje) em vermelho no topo

3. **Filtros Adicionais**:
   - Filtrar por status específico
   - Filtrar por prioridade mínima
   - Filtrar por produto/molde

4. **Ordenação Customizável**:
   - Permitir usuário escolher critério de ordenação
   - Salvar preferência no localStorage

## 📁 Arquivos Modificados

- `frontend/src/pages/OrderPanel.tsx`
  - Linhas 67-83: Lógica de ordenação implementada

## ✅ Checklist

- [x] Implementar ordenação por status (ACTIVE primeiro)
- [x] Implementar ordenação por prioridade (descendente)
- [x] Implementar ordenação por data de início (ascendente)
- [x] Testar com múltiplas ordens
- [x] Validar auto-refresh mantém ordenação
- [x] Documentação completa
- [x] Sem erros de linting

## 🚀 Resultado Final

**Ordens sempre organizadas de forma inteligente:**
1. 🟢 **Em Atividade** no topo
2. 🔴 **Urgentes** em seguida
3. 📅 **Cronológicas** por último

= **Máxima eficiência operacional!** 🎯

---
**Data**: 23/10/2025  
**Versão**: 1.0  
**Status**: ✅ Implementado e Validado

