# Dashboard de Produção - KPIs para Indústria de Plástico

## 📊 Resumo das Melhorias Implementadas

Este documento descreve as melhorias implementadas no Dashboard de Produção do sistema MES, com KPIs específicos e relevantes para empresas da indústria de plástico (injeção de termoplásticos).

---

## 🎯 KPIs Implementados

### **1. Indicadores Principais**

#### 📈 OEE (Overall Equipment Effectiveness)
- **Cálculo Real**: Disponibilidade × Performance × Qualidade
- **Detalhamento**: Mostra os 3 componentes do OEE
- **Fórmula**:
  - **Disponibilidade** = (Tempo Planejado - Paradas Não Planejadas) / Tempo Planejado × 100
  - **Performance** = Eficiência de Ciclo (Ciclo Teórico / Ciclo Real) × 100
  - **Qualidade** = (Peças Boas / Total Produzido) × 100

#### 🏭 Total Produzido
- Quantidade total de peças produzidas
- **Novo**: Peso estimado em kg (base: 50g por peça)
- Ajustável conforme necessidade da empresa

#### ✅ Taxa de Qualidade
- Percentual de peças boas vs rejeitadas
- Quantidade de peças rejeitadas exibida

#### 🔧 Injetoras Ativas
- Número de injetoras em operação
- Quantidade de ordens em andamento

---

### **2. Eficiência de Processo**

#### ⚙️ Eficiência de Ciclo
- **Descrição**: Compara o ciclo de produção real vs teórico
- **Cálculo**: (Ciclo Teórico / Ciclo Real) × 100
- **Importância**: Mede se a produção está dentro do tempo esperado
- **Meta Ideal**: ≥ 95%

#### 🔲 Utilização de Cavidades
- **Descrição**: Percentual de cavidades ativas vs totais disponíveis
- **Cálculo**: (Cavidades Ativas / Cavidades Totais) × 100
- **Exibição**: X/Y cavidades (ativas/totais)
- **Importância**: Indica se há cavidades desativadas que reduzem produtividade
- **Meta Ideal**: ≥ 90%

#### 🔧 Tempo Médio de Setup
- **Descrição**: Tempo médio para configurar moldes
- **Unidade**: Minutos
- **Quantidade**: Número de setups realizados
- **Importância**: Mede eficiência na troca de ferramentas
- **Meta**: Reduzir tempo de setup (SMED - Single Minute Exchange of Die)

#### ⚠️ Total de Defeitos
- Quantidade total de defeitos registrados
- Percentual em relação ao total produzido
- Link visual para o gráfico "Top 5 Defeitos"

---

### **3. Análise de Paradas**

#### 📊 Distribuição de Paradas (Gráfico Pizza)
- **Paradas Produtivas**: Setup, troca de molde, ajustes
- **Paradas Improdutivas**: Quebras, falta de material, manutenção corretiva
- **Paradas Planejadas**: Manutenção preventiva, refeições
- **Tempo Detalhado**: Formatado em horas e minutos

**Importância**: Identifica onde estão as maiores perdas de tempo

---

### **4. Análise de Defeitos**

#### 🔍 Top 5 Defeitos (Gráfico Pizza)
- Exibe os 5 tipos de defeitos mais frequentes
- Quantidade de peças por tipo de defeito
- Cores distintas para fácil identificação
- **Sem dados**: Mensagem informativa quando não há defeitos

**Importância**: Análise de Pareto para ações corretivas focadas

---

### **5. Estatísticas Detalhadas**

#### 📦 Cards Informativos:

1. **Total de Ordens**
   - Quantidade de ordens de produção no período

2. **Total de Paradas**
   - Número de paradas registradas
   - Tempo total de paradas formatado

3. **Cavidades Totais**
   - Ativas / Totais
   - Percentual de utilização

4. **Peso Total Estimado**
   - Peso em kg baseado na produção
   - Base de cálculo configurável (padrão: 50g/peça)

---

## 🎨 Design e Experiência do Usuário

### **Cards Gradientes**
- Cards principais com gradientes coloridos para destaque visual
- Cores diferenciadas por tipo de informação
- Responsivo para mobile e desktop

### **Organização em Seções**
- **Indicadores Principais**: KPIs críticos com destaque
- **Eficiência de Processo**: Métricas operacionais
- **Análises e Gráficos**: Visualizações detalhadas

### **Atualização Automática**
- Switch para ativar/desativar atualização automática
- Intervalo configurável (padrão: 30 segundos)
- Indicador de última atualização

---

## 🔧 Implementação Técnica

### **Backend** (`dashboardController.ts`)

#### Novos Cálculos Implementados:

1. **Eficiência de Ciclo**:
```typescript
const realCyclePerPiece = timeElapsed / totalPieces;
const efficiency = (theoreticalCycle / realCyclePerPiece) * 100;
```

2. **Utilização de Cavidades**:
```typescript
const cavityUtilization = (totalActiveCavities / totalPossibleCavities) * 100;
```

3. **Tempo Médio de Setup**:
```typescript
const avgSetupTime = setupDowntimes.reduce((sum, dt) => sum + dt.duration, 0) / setupDowntimes.length;
```

4. **Paradas por Tipo**:
```typescript
const downtimesByType = await prisma.downtime.groupBy({
  by: ['type'],
  _sum: { duration: true },
  _count: true,
});
```

5. **Top 5 Defeitos**:
```typescript
const defectsByType = await prisma.productionDefect.groupBy({
  by: ['defectId'],
  _sum: { quantity: true },
  orderBy: { _sum: { quantity: 'desc' } },
  take: 5,
});
```

### **Frontend** (`Dashboard.tsx`)

#### Componentes Adicionados:

1. **Cards Gradientes** para indicadores principais
2. **Gráfico de Distribuição de Paradas** (Doughnut Chart)
3. **Gráfico de Top 5 Defeitos** (Doughnut Chart)
4. **Cards de Estatísticas Detalhadas**
5. **Seções organizadas** com títulos e ícones

### **Tipos** (`types/index.ts`)

Interface `DashboardKPIs` expandida com todos os novos campos.

---

## 📈 Benefícios para Gestão

### **1. Visão Holística**
- Todos os indicadores críticos em uma única tela
- Dados atualizados em tempo real

### **2. Tomada de Decisão**
- Identificação rápida de problemas
- Análise de tendências
- Priorização de ações corretivas

### **3. Específico para Injeção de Plásticos**
- KPIs relevantes para o setor
- Terminologia adequada (moldes, cavidades, ciclos)
- Métricas de setup e eficiência de processo

### **4. Análise de Pareto**
- Top 5 defeitos permite foco nos problemas mais críticos
- 80/20: resolver 20% dos defeitos elimina 80% dos problemas

### **5. OEE Real**
- Cálculo preciso baseado em dados reais
- Componentes detalhados para diagnóstico
- Meta de classe mundial: OEE ≥ 85%

---

## 🎯 Metas Recomendadas (Indústria de Plástico)

| KPI | Meta | Classe Mundial |
|-----|------|----------------|
| OEE | 75-80% | ≥ 85% |
| Disponibilidade | 85-90% | ≥ 90% |
| Performance | 90-95% | ≥ 95% |
| Qualidade | 95-98% | ≥ 99% |
| Eficiência de Ciclo | 90-95% | ≥ 95% |
| Utilização de Cavidades | 85-90% | ≥ 95% |
| Tempo de Setup | < 10 min | < 5 min |

---

## 🚀 Próximos Passos Recomendados

### **Fase 2 - Análises Avançadas**:
1. **Gráfico de Tendência de OEE** ao longo do tempo
2. **Análise de Performance por Injetora**
3. **Comparativo de Turnos** (manhã, tarde, noite)
4. **Gráfico de Pareto de Paradas** (80/20)
5. **Consumo Real de Matéria-Prima** (integração com pesagem)

### **Fase 3 - Alertas e Notificações**:
1. Alerta quando OEE < 70%
2. Notificação de defeito recorrente
3. Aviso de setup prolongado
4. Alerta de baixa eficiência de ciclo

### **Fase 4 - Inteligência Artificial**:
1. Predição de falhas em moldes
2. Otimização automática de ciclos
3. Análise preditiva de defeitos
4. Recomendações de setup

---

## 📝 Como Usar

### **Acesso**:
1. Faça login no sistema
2. Clique em **"Dashboard"** no menu lateral
3. Visualize os KPIs em tempo real

### **Configurações**:
- **Atualização Automática**: Ative/desative conforme necessidade
- **Intervalo**: Configure de 5 a 300 segundos
- **Período**: Use filtros de data (futuro)

### **Interpretação**:

#### 🟢 **Verde (Bom)**:
- OEE ≥ 75%
- Qualidade ≥ 95%
- Eficiência de Ciclo ≥ 90%

#### 🟡 **Amarelo (Atenção)**:
- OEE 60-75%
- Qualidade 90-95%
- Eficiência de Ciclo 80-90%

#### 🔴 **Vermelho (Crítico)**:
- OEE < 60%
- Qualidade < 90%
- Eficiência de Ciclo < 80%

---

## 🔄 Integração com Outros Módulos

### **Dados de Entrada**:
- **Ordens de Produção**: Status, quantidades, datas
- **Moldes**: Cavidades totais, cavidades ativas, ciclo teórico
- **Apontamentos**: Produção, refugos, tempos
- **Paradas**: Tipo, duração, motivo
- **Defeitos**: Tipo, quantidade

### **Dados de Saída**:
- KPIs calculados em tempo real
- Gráficos e visualizações
- Base para relatórios gerenciais

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o Dashboard:
- Consulte: `DASHBOARD_PRODUCAO.md`
- Arquitetura: `ARCHITECTURE.md`
- API: `API_DOCUMENTATION.md`

---

**Versão**: 2.0.0  
**Data de Atualização**: Outubro 2025  
**Autor**: Equipe MES Development  
**Status**: ✅ Implementado e Testado

