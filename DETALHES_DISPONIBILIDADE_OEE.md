# Detalhes Expandidos de Disponibilidade - Modal OEE

## 📋 Resumo

Implementação de detalhamento completo da disponibilidade no modal de OEE, mostrando tempos, paradas e breakdown detalhado para análise profunda de perdas de disponibilidade.

## ✨ Funcionalidade

### O que foi Adicionado

Dentro do card de **Disponibilidade** no modal de OEE, após a seção de explicações, foi adicionada uma seção expandida com:

1. **📊 Resumo de Tempos** (3 cards)
2. **📈 Distribuição de Paradas por Tipo** (barras de progresso)
3. **📋 Top 5 Principais Paradas** (lista detalhada)

## 🎨 Interface Visual

### 1. Resumo de Tempos (3 Cards)

```
┌──────────────────────────────────────────────────────────┐
│  ⏰ Tempo Total      ▶️ Tempo Produtivo    ⏸️ Tempo Paradas │
│     24.5h              22.8h (93.1%)        1.7h (6.9%)   │
└──────────────────────────────────────────────────────────┘
```

#### Card 1: Tempo Total
- **Ícone:** ⏰ AccessTime (cinza)
- **Cor de Fundo:** Cinza claro (`#f5f5f5`)
- **Dados:** Tempo desde início da ordem até agora
- **Formato:** Horas com 1 casa decimal

#### Card 2: Tempo Produtivo  
- **Ícone:** ▶️ PlayCircleOutline (verde)
- **Cor de Fundo:** Verde claro (`#e8f5e9`)
- **Dados:** Tempo total - Tempo de paradas
- **Formato:** Horas + Percentual

#### Card 3: Tempo de Paradas
- **Ícone:** ⏸️ PauseCircleOutline (vermelho)
- **Cor de Fundo:** Vermelho claro (`#ffebee`)
- **Dados:** Soma de todas as paradas registradas
- **Formato:** Horas + Percentual

### 2. Distribuição de Paradas por Tipo

Mostra barras de progresso coloridas para cada tipo:

```
Distribuição de Paradas:

⚠️ Improdutivas           1.2h ████████████████░░░░ 70%
🔧 Produtivas (Setup)     0.3h ████░░░░░░░░░░░░░░░░ 18%
⏰ Planejadas (Manutenção) 0.2h ███░░░░░░░░░░░░░░░░░ 12%
```

**Tipos de Parada:**

| Tipo | Ícone | Cor | Descrição |
|------|-------|-----|-----------|
| **UNPRODUCTIVE** | ⚠️ Warning | Vermelho | Quebras, falta de material, problemas |
| **PRODUCTIVE** | 🔧 Build | Azul | Setup, troca de molde, ajustes |
| **PLANNED** | ⏰ AccessTime | Laranja | Manutenção preventiva, limpeza |

**Cálculo:**
- Cada barra mostra o percentual em relação ao tempo total de paradas
- Exemplo: Se paradas improdutivas = 1.2h e total de paradas = 1.7h, então 70.6%

### 3. Top 5 Principais Paradas

Lista com scroll mostrando as 5 paradas mais longas:

```
┌──────────────────────────────────────────────────┐
│ Falta de Material                    [45 min] ⚠️ │
│ 22/10/2025 14:32                                 │
├──────────────────────────────────────────────────┤
│ Setup de Molde                        [18 min] 🔧│
│ 22/10/2025 08:15                                 │
├──────────────────────────────────────────────────┤
│ Manutenção Preventiva                 [12 min] ⏰│
│ 22/10/2025 10:00                                 │
└──────────────────────────────────────────────────┘
```

**Informações Exibidas:**
- **Motivo** da parada (reason)
- **Data/Hora** de início
- **Duração** em minutos
- **Badge colorido** por tipo

**Ordenação:** Maior duração primeiro

## 💻 Implementação Técnica

### 1. Carregamento de Dados

#### Estado Adicionado
```typescript
const [downtimes, setDowntimes] = useState<Downtime[]>([]);
```

#### Interface Downtime
```typescript
interface Downtime {
  id: number;
  type: 'PRODUCTIVE' | 'UNPRODUCTIVE' | 'PLANNED';
  reason: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number; // em segundos
  activityType?: {
    name: string;
    type: string;
    color?: string;
  };
}
```

#### Carregamento via API
```typescript
const downtimesResponse = await api.get(`/downtimes?productionOrderId=${id}`);
setDowntimes(downtimesResponse.data);
```

### 2. Cálculos de Tempo

#### Tempo Total
```typescript
const now = new Date();
const startDate = orderData?.startDate ? new Date(orderData.startDate) : null;
const totalTimeMs = startDate ? now.getTime() - startDate.getTime() : 0;
const totalTimeHours = totalTimeMs / (1000 * 60 * 60);
```

#### Tempo de Paradas
```typescript
const totalDowntimeSeconds = downtimes.reduce((sum, dt) => {
  if (dt.duration) return sum + dt.duration;
  if (dt.endTime) {
    const start = new Date(dt.startTime);
    const end = new Date(dt.endTime);
    return sum + (end.getTime() - start.getTime()) / 1000;
  }
  return sum;
}, 0);
const totalDowntimeHours = totalDowntimeSeconds / 3600;
```

#### Tempo Produtivo
```typescript
const productiveTimeHours = totalTimeHours - totalDowntimeHours;
```

### 3. Agrupamento por Tipo

```typescript
const downtimesByType = {
  PRODUCTIVE: 0,
  UNPRODUCTIVE: 0,
  PLANNED: 0
};

downtimes.forEach(dt => {
  const duration = dt.duration || 
    (dt.endTime ? (new Date(dt.endTime).getTime() - new Date(dt.startTime).getTime()) / 1000 : 0);
  downtimesByType[dt.type] += duration / 3600; // converter para horas
});
```

### 4. Ordenação das Principais Paradas

```typescript
downtimes
  .map(dt => ({
    ...dt,
    durationCalc: dt.duration || 
      (dt.endTime ? (new Date(dt.endTime).getTime() - new Date(dt.startTime).getTime()) / 1000 : 0)
  }))
  .sort((a, b) => b.durationCalc - a.durationCalc)
  .slice(0, 5)
```

## 📊 Casos de Uso

### Caso 1: Identificar Gargalo de Disponibilidade

**Situação:** OEE baixo (68%) devido a disponibilidade ruim (75%)

**Como usar:**
1. Abrir modal de OEE
2. Ver que Disponibilidade é o gargalo
3. Expandir seção de detalhes
4. Verificar que 70% das paradas são improdutivas
5. Identificar nas "Principais Paradas" que "Falta de Material" ocorreu 3 vezes

**Ação:** Melhorar gestão de estoque de matéria-prima

### Caso 2: Avaliar Setup Time

**Situação:** Muitas trocas de molde no período

**Como usar:**
1. Ver detalhamento de disponibilidade
2. Verificar que paradas produtivas (setup) = 4.5h (40% do total)
3. Ver na lista que cada setup levou 1h em média

**Ação:** Implementar SMED (Single-Minute Exchange of Die) para reduzir tempo de setup

### Caso 3: Validar Manutenção Preventiva

**Situação:** Verificar se manutenções estão dentro do planejado

**Como usar:**
1. Ver paradas planejadas = 2h (15% do total)
2. Confirmar que estão dentro do esperado
3. Verificar se não há paradas improdutivas por quebras

**Resultado:** Manutenção preventiva está funcionando, poucas quebras

## 🎯 Insights que a Ferramenta Fornece

### Visão de Tempo Real
- ✅ Quanto tempo a ordem está rodando
- ✅ Quanto tempo foi produtivo vs parado
- ✅ Percentual de utilização do tempo

### Classificação de Perdas
- ✅ Separação clara entre paradas evitáveis (improdutivas) vs necessárias (setup/manutenção)
- ✅ Priorização de quais paradas atacar primeiro

### Identificação de Padrões
- ✅ Paradas recorrentes (mesmo motivo aparece múltiplas vezes)
- ✅ Paradas longas vs curtas
- ✅ Horários de maior ocorrência

## 📈 Correlação com OEE

### Impacto na Disponibilidade

**Fórmula Simplificada:**
```
Disponibilidade (%) = (Tempo Produtivo / Tempo Total) × 100
```

**Exemplo:**
- Tempo Total: 24h
- Tempo de Paradas: 4h
- Tempo Produtivo: 20h
- **Disponibilidade: 83.3%**

**Se reduzir paradas improdutivas de 3h para 1h:**
- Tempo Produtivo: 22h
- **Nova Disponibilidade: 91.7%**
- **Ganho: +8.4 pontos percentuais**

### Impacto no OEE

Assumindo Performance = 95% e Qualidade = 99%:

**Antes:**
```
OEE = 83.3% × 95% × 99% = 78.3%
```

**Depois:**
```
OEE = 91.7% × 95% × 99% = 86.2%
```

**Ganho no OEE: +7.9 pontos!**

## 🔍 Detalhes de Implementação

### Responsividade

**Desktop:**
- Cards lado a lado (3 colunas)
- Lista de paradas com scroll vertical

**Mobile:**
- Cards empilhados (1 por linha)
- Lista otimizada para toque
- Fonte menor mas legível

### Performance

**Otimizações:**
- Cálculos feitos apenas quando modal está aberto
- Agrupamento e ordenação eficientes
- Limite de 5 paradas na lista (top 5)

### Tratamento de Casos Especiais

**Ordem sem data de início:**
- Mostra 0h para tempo total
- Esconde percentuais (evita divisão por zero)

**Sem paradas registradas:**
- Mostra mensagem positiva: "✅ Nenhuma parada registrada até o momento!"
- Cards de resumo mostram 100% produtivo

**Paradas em andamento (sem endTime):**
- Não são incluídas no cálculo de duração
- Evita inflar tempo de paradas

## 📱 Experiência do Usuário

### Fluxo de Interação

1. **Usuário clica** no card de OEE
2. **Modal abre** com diagnóstico automático
3. **Rola até** o card de Disponibilidade
4. **Vê imediatamente** se é o gargalo (badge "GARGALO")
5. **Expande detalhes** (já visível, não precisa clicar)
6. **Analisa:**
   - Quanto tempo foi perdido
   - Onde foram as maiores perdas
   - Qual tipo de parada predomina
7. **Toma ação** baseada nos dados

### Feedback Visual

| Elemento | Cor | Significado |
|----------|-----|-------------|
| Tempo Produtivo | Verde | Bom, desejável |
| Tempo de Paradas | Vermelho | Perdas, reduzir |
| Paradas Improdutivas | Vermelho | Prioritário atacar |
| Paradas Produtivas | Azul | Otimizar (SMED) |
| Paradas Planejadas | Laranja | Manter, é esperado |

## ⚙️ Configurações e Extensões

### Dados Necessários no Backend

**Endpoint:** `GET /downtimes?productionOrderId={id}`

**Response:**
```json
[
  {
    "id": 123,
    "type": "UNPRODUCTIVE",
    "reason": "Falta de Material",
    "description": "Polipropileno não entregue",
    "startTime": "2025-10-22T14:32:00Z",
    "endTime": "2025-10-22T15:17:00Z",
    "duration": 2700,
    "activityType": {
      "name": "Falta de Material",
      "type": "UNPRODUCTIVE",
      "color": "#f44336"
    }
  }
]
```

### Melhorias Futuras Possíveis

1. **Filtro por Período:** Mostrar paradas apenas do último turno/dia
2. **Gráfico de Timeline:** Linha do tempo visual das paradas
3. **Comparação:** Comparar com outras ordens similares
4. **Metas:** Definir meta de disponibilidade e mostrar gap
5. **Alertas:** Destacar se paradas improdutivas > X%
6. **Export:** Exportar lista de paradas para Excel
7. **Drill-down:** Clicar numa parada para ver mais detalhes
8. **Sugestões:** IA sugerir ações baseado em padrões

## ✅ Benefícios

### Para Operadores
- ✅ Entender onde o tempo está sendo perdido
- ✅ Ver impacto real de cada parada
- ✅ Sentir urgência em evitar paradas desnecessárias

### Para Supervisores
- ✅ Identificar padrões de paradas
- ✅ Priorizar qual problema resolver primeiro
- ✅ Ter dados concretos para reuniões

### Para Gestores
- ✅ Quantificar perdas em horas e $
- ✅ Avaliar ROI de melhorias
- ✅ Benchmark entre equipamentos/turnos

## 📅 Data de Implementação

22 de Outubro de 2025

## 📝 Arquivos Modificados

- `frontend/src/pages/OrderSummary.tsx`

## ✅ Status

- ✅ Interface Downtime criada
- ✅ Estado de downtimes adicionado
- ✅ Carregamento via API implementado
- ✅ Cálculos de tempo funcionando
- ✅ Agrupamento por tipo implementado
- ✅ Top 5 paradas ordenadas
- ✅ UI responsiva
- ✅ Cores e ícones adequados
- ✅ Sem erros de linter
- ✅ Pronto para uso em produção

---

**Resultado:** Agora o modal de OEE não apenas mostra QUANTO a disponibilidade está baixa, mas também mostra EXATAMENTE ONDE e POR QUÊ o tempo está sendo perdido! 🎯📊

