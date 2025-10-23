# 📊 Explicação: Cálculo de Peças por Hora

## 🎯 Objetivo
Calcular a **taxa média de produção** em peças por hora, indicando a velocidade real de produção do sistema.

---

## 📍 Onde é Calculado

### 1. Dashboard Principal (`/dashboard`)
- **Arquivo**: `backend/src/controllers/dashboardController.ts`
- **Escopo**: Todas as ordens de produção (filtradas por empresa)
- **Linha**: 272-305

### 2. Resumo da Ordem (`/order-summary/:id`)
- **Arquivo**: `frontend/src/pages/OrderSummary.tsx`
- **Escopo**: Uma ordem de produção específica
- **Linha**: 344-347

---

## 🔢 Fórmula Base

```
Peças por Hora = Total de Peças Produzidas ÷ Tempo Total (em horas)
```

---

## 📘 Método 1: Dashboard Principal (Backend)

### 🔍 Lógica do Cálculo

```typescript
// 1. Buscar o PRIMEIRO apontamento (mais antigo)
const firstAppointment = await prisma.productionAppointment.findFirst({
  where: { productionOrder: companyFilter },
  orderBy: { timestamp: 'asc' }, // ⬆️ Do mais antigo para o mais recente
});

// 2. Buscar o ÚLTIMO apontamento (mais recente)
const lastAppointment = await prisma.productionAppointment.findFirst({
  where: { productionOrder: companyFilter },
  orderBy: { timestamp: 'desc' }, // ⬇️ Do mais recente para o mais antigo
});

// 3. Calcular a diferença de tempo em HORAS
const startTime = moment(firstAppointment.timestamp);
const endTime = moment(lastAppointment.timestamp);
const totalHours = endTime.diff(startTime, 'hours', true); // true = decimal

// 4. Calcular Peças por Hora
if (totalHours > 0) {
  piecesPerHour = Math.round(totalProduced / totalHours);
}
```

### 📝 Exemplo Prático (Dashboard)

**Dados de Entrada:**
- **Primeiro apontamento**: 23/10/2024 às 08:00:00
- **Último apontamento**: 23/10/2024 às 16:30:00
- **Total produzido**: 850 peças

**Cálculo:**
```
Tempo decorrido = 16:30 - 08:00 = 8.5 horas

Peças por Hora = 850 ÷ 8.5 = 100 peças/hora
```

**Resultado:** `100` peças por hora

---

## 📗 Método 2: Resumo da Ordem (Frontend)

### 🔍 Lógica do Cálculo

```typescript
// 1. Calcular o tempo total em SEGUNDOS
const totalTimeUnits = appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0);
const timeDivisor = order.plcConfig?.timeDivisor || 10; // Padrão: 10
const totalSeconds = totalTimeUnits / timeDivisor;

// 2. Contar o total de peças produzidas
const totalProduced = appointments.reduce((sum, apt) => sum + (apt.clpCounterValue || 0), 0);

// 3. Calcular Peças por Hora
const productivity = totalSeconds > 0 
  ? (totalProduced / totalSeconds) * 3600 
  : 0;
```

### 🔧 O que é `timeDivisor`?

O `timeDivisor` é um **parâmetro de configuração do PLC** que define como converter as unidades de tempo coletadas do CLP em segundos.

**Exemplos:**
- `timeDivisor = 10` → cada unidade coletada = 0,1 segundo (100 ms)
- `timeDivisor = 100` → cada unidade coletada = 0,01 segundo (10 ms)
- `timeDivisor = 1` → cada unidade coletada = 1 segundo

### 📝 Exemplo Prático (Resumo da Ordem)

**Dados de Entrada:**
- **Apontamento 1**: `quantity = 150` (tempo), `clpCounterValue = 4` (peças)
- **Apontamento 2**: `quantity = 145` (tempo), `clpCounterValue = 4` (peças)
- **Apontamento 3**: `quantity = 155` (tempo), `clpCounterValue = 4` (peças)
- **timeDivisor**: 10

**Cálculo Passo a Passo:**

```
1. Tempo Total em Unidades:
   150 + 145 + 155 = 450 unidades

2. Converter para Segundos:
   450 ÷ 10 = 45 segundos

3. Total de Peças:
   4 + 4 + 4 = 12 peças

4. Peças por Segundo:
   12 ÷ 45 = 0,2667 peças/segundo

5. Converter para Peças por Hora:
   0,2667 × 3600 = 960 peças/hora
```

**Resultado:** `960` peças por hora

---

## 🆚 Comparação entre os Métodos

| Aspecto | Dashboard (Backend) | Resumo da Ordem (Frontend) |
|---------|---------------------|----------------------------|
| **Base de Tempo** | Timestamps reais dos apontamentos | Soma dos tempos de ciclo coletados |
| **Escopo** | Todas as ordens (por empresa) | Uma ordem específica |
| **Precisão** | Tempo "clock" (incluindo intervalos entre apontamentos) | Tempo "produtivo" (soma dos ciclos) |
| **Vantagem** | Fácil de entender, tempo real | Mais preciso para análise de ciclo |
| **Desvantagem** | Inclui pausas entre apontamentos | Depende da configuração do timeDivisor |

---

## 🎯 Qual é Mais Preciso?

### Dashboard (Tempo Real - "Clock Time")
✅ **Melhor para:**
- Análise de produtividade geral do dia/período
- Comparação entre turnos
- Relatórios gerenciais

❌ **Limitação:**
- Inclui pequenos intervalos entre apontamentos
- Pode ser afetado por pausas não registradas

### Resumo da Ordem (Tempo de Ciclo - "Cycle Time")
✅ **Melhor para:**
- Análise técnica de performance da máquina
- Otimização de processo
- Comparação com tempo de ciclo teórico

❌ **Limitação:**
- Requer configuração correta do timeDivisor
- Não reflete pausas ou setup time

---

## 🧮 Fórmulas Resumidas

### Dashboard (Backend)
```
Peças/Hora = Total de Peças ÷ [(Último Timestamp - Primeiro Timestamp) em horas]
```

### Resumo da Ordem (Frontend)
```
Peças/Hora = (Total de Peças ÷ Total de Segundos) × 3600
Onde: Total de Segundos = Soma(quantity) ÷ timeDivisor
```

---

## 📊 Exemplo Comparativo Real

### Cenário: Produção de Tampa Plástica

**Dados:**
- Produção iniciada: 08:00:00
- Produção finalizada: 16:00:00
- Total produzido: 800 peças
- 10 apontamentos automáticos registrados
- Tempo total de ciclo coletado: 28.800 unidades
- timeDivisor: 10

### Dashboard (Clock Time)
```
Tempo decorrido = 16:00 - 08:00 = 8 horas
Peças/Hora = 800 ÷ 8 = 100 peças/hora
```

### Resumo da Ordem (Cycle Time)
```
Tempo produtivo = 28.800 ÷ 10 = 2.880 segundos = 0,8 horas
Peças/Hora = 800 ÷ 0,8 = 1.000 peças/hora
```

### Por que a diferença?
- **Dashboard**: Considera as 8 horas corridas (inclui setup, trocas, pausas)
- **Resumo da Ordem**: Considera apenas o tempo efetivo de ciclo (0,8 horas de produção pura)

---

## 💡 Quando Usar Cada Valor?

### Use o Dashboard (100 peças/hora) para:
- Planejamento de turnos e capacidade
- Cálculo de mão-de-obra necessária
- Relatórios para gerência
- Análise de utilização do tempo

### Use o Resumo da Ordem (1.000 peças/hora) para:
- Análise de performance da máquina
- Comparação com especificações técnicas
- Otimização de processos
- Troubleshooting de eficiência

---

## 🔍 Como Verificar o Cálculo?

### No Dashboard:
1. Acesse: `http://localhost:3000/dashboard`
2. Veja o valor no gráfico "Produção por Período"
3. Campo "Peças por Hora" (centralizado, fundo cinza)

### No Resumo da Ordem:
1. Acesse: `http://localhost:3000/order-summary/:orderId`
2. Veja o valor no card "Produção" (lado esquerdo)
3. Campo "Peças por Hora" (centralizado, fundo cinza)

### Verificação Manual:
```sql
-- Ver primeiro e último apontamento
SELECT 
  MIN(timestamp) as primeiro,
  MAX(timestamp) as ultimo,
  COUNT(*) as total_apontamentos,
  SUM("clpCounterValue") as total_pecas
FROM production_appointments
WHERE "productionOrderId" = :orderId;

-- Calcular manualmente
-- Diferença de tempo em horas × Total de peças = Peças/Hora
```

---

## 🚨 Casos Especiais

### Caso 1: Apenas 1 Apontamento
```typescript
if (firstAppointment && lastAppointment) {
  const totalHours = endTime.diff(startTime, 'hours', true);
  if (totalHours > 0) { // Se for 0, não divide
    piecesPerHour = Math.round(totalProduced / totalHours);
  } else {
    piecesPerHour = 0; // Evita divisão por zero
  }
}
```
**Resultado:** `0` (não é possível calcular taxa com 1 ponto)

### Caso 2: Sem Apontamentos
```typescript
piecesPerHour = 0;
```
**Resultado:** `0`

### Caso 3: Produção Muito Rápida (< 1 hora)
```typescript
// Exemplo: 50 peças em 30 minutos (0.5 horas)
piecesPerHour = Math.round(50 / 0.5) = 100 peças/hora
```
**Resultado:** Funciona normalmente, calcula a taxa horária projetada

---

## 📈 Impacto do timeDivisor

| timeDivisor | 1 unidade = | Exemplo: 100 unidades = |
|-------------|-------------|-------------------------|
| 1           | 1 segundo   | 100 segundos           |
| 10          | 0,1 segundo | 10 segundos            |
| 100         | 0,01 segundo| 1 segundo              |
| 1000        | 0,001 segundo| 0,1 segundo           |

**Configuração comum para injetoras plásticas:** `timeDivisor = 10`

---

## ✅ Checklist de Validação

- [ ] O valor de "Peças por Hora" está sendo exibido?
- [ ] O valor é maior que 0 quando há produção?
- [ ] O tooltip aparece ao passar o mouse?
- [ ] O valor está formatado com separador de milhares?
- [ ] O cálculo faz sentido para o volume produzido?
- [ ] O timeDivisor está configurado corretamente no PLC?

---

## 📚 Referências Técnicas

### Arquivos Relacionados:
- `backend/src/controllers/dashboardController.ts` (linhas 272-305)
- `frontend/src/pages/OrderSummary.tsx` (linhas 344-347)
- `frontend/src/pages/Dashboard.tsx` (linha 466)
- `frontend/src/types/index.ts` (linha 164)

### Tabelas do Banco de Dados:
- `production_appointments`: Armazena os apontamentos com timestamps e quantidades
- `plc_configs`: Armazena o timeDivisor para cada PLC

---

**Documento criado em:** 23/10/2024  
**Última atualização:** 23/10/2024  
**Versão:** 1.0

