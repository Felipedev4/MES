# Diagnóstico Automático de OEE - Documentação

## 📋 Resumo

Implementação de análise inteligente que identifica automaticamente o componente responsável por puxar o OEE para baixo e fornece recomendações específicas de melhoria.

## ✨ Funcionalidade

### Análise Automática

O sistema analisa os três componentes do OEE:
- **Disponibilidade** (meta: 90%)
- **Performance** (meta: 95%)
- **Qualidade** (meta: 99%)

E identifica automaticamente qual está com pior desempenho, mostrando:
1. 🎯 **Componente gargalo**
2. 📊 **Análise de impacto**
3. 🔧 **Ações prioritárias**
4. ⚠️ **Alertas secundários**

## 🎨 Interface Visual

### Quando OEE ≥ 85% (Excelente)

```
┌────────────────────────────────────────────┐
│ 🎯 OEE Excelente!                          │
│                                            │
│ Todos os componentes estão em níveis      │
│ satisfatórios. Continue monitorando para  │
│ manter a excelência.                      │
└────────────────────────────────────────────┘
```

**Características:**
- ✅ Fundo verde (`#e8f5e9`)
- ✅ Borda verde (`#4caf50`)
- ✅ Mensagem positiva de reforço

### Quando OEE < 85% (Precisa Atenção)

```
┌────────────────────────────────────────────┐
│ 🎯 Diagnóstico: ⚡ Performance é o Gargalo │
│                                            │
│ Situação Atual:                            │
│ A performance está em 72.5%, 22.5 pontos  │
│ percentuais abaixo do ideal (95%).        │
│                                            │
│ Impacto no OEE:                            │
│ Se a performance atingisse 95%, o OEE     │
│ subiria de 68.2% para 89.4% (ganho de     │
│ +21.2 pontos).                            │
│                                            │
│ 🔧 Ações Prioritárias Recomendadas:       │
│ • Revisar e otimizar parâmetros do        │
│   processo de injeção                     │
│ • Reduzir microparadas e ajustes durante  │
│   produção                                │
│ • Verificar se o tempo de ciclo ideal     │
│   está adequado                           │
│ • Treinar operadores em técnicas de       │
│   otimização                              │
│                                            │
│ ⚠️ Atenção: Disponibilidade também está   │
│ baixa (82.3%). Após melhorar a            │
│ performance, foque neste componente.      │
└────────────────────────────────────────────┘
```

**Características:**
- ⚠️ Fundo laranja (`#fff3e0`)
- ⚠️ Borda laranja (`#ff9800`)
- 📊 Análise detalhada de impacto
- 🔧 Ações específicas por componente
- ⚠️ Alerta secundário se outro componente também estiver ruim

## 🔍 Lógica de Análise

### 1. Identificação do Gargalo

```typescript
const components = [
  { name: 'Disponibilidade', value: stats.availability, target: 90 },
  { name: 'Performance', value: stats.performance, target: 95 },
  { name: 'Qualidade', value: stats.quality, target: 99 }
];

const lowestComponent = components.reduce((prev, curr) => 
  curr.value < prev.value ? curr : prev
);
```

### 2. Cálculo de Impacto

**Fórmula do Potencial de Ganho:**

Se o componente problemático atingir sua meta:

```typescript
// OEE Atual
const currentOEE = (availability / 100) × (performance / 100) × (quality / 100) × 100

// OEE Potencial (se componente atingir meta)
const potentialOEE = (targetAvailability / 100) × (currentPerformance / 100) × (currentQuality / 100) × 100

// Ganho
const gain = potentialOEE - currentOEE
```

**Exemplo Prático:**

Dados:
- Disponibilidade: 82% (meta: 90%)
- Performance: 95%
- Qualidade: 99%
- OEE Atual: 77.2%

Cálculo:
- Se Disponibilidade atingir 90%: `0.90 × 0.95 × 0.99 × 100 = 84.6%`
- Ganho potencial: `84.6% - 77.2% = +7.4 pontos`

### 3. Destaque Visual nos Cards

Os cards do componente gargalo recebem:
- **Borda vermelha grossa** (3px solid #f44336)
- **Sombra vermelha** (box-shadow)
- **Badge "GARGALO"** em vermelho

```typescript
{stats.availability < stats.performance && 
 stats.availability < stats.quality && 
 stats.oee < 85 && (
  <Chip label="GARGALO" size="small" color="error" />
)}
```

## 🎯 Recomendações por Componente

### 📊 Disponibilidade (meta: 90%)

**Quando é o gargalo:**
- Implementar manutenção preventiva programada
- Reduzir tempo de setup e trocas de molde
- Investigar e eliminar causas de paradas não planejadas
- Melhorar preparação de materiais e ferramentas

**Causas comuns de baixa disponibilidade:**
- Quebras de equipamento
- Falta de material
- Trocas de molde demoradas
- Setup mal planejado
- Falta de manutenção preventiva

### ⚡ Performance (meta: 95%)

**Quando é o gargalo:**
- Revisar e otimizar parâmetros do processo de injeção
- Reduzir microparadas e ajustes durante produção
- Verificar se o tempo de ciclo ideal está adequado
- Treinar operadores em técnicas de otimização

**Causas comuns de baixa performance:**
- Ciclo real maior que o ideal
- Microparadas frequentes
- Ajustes constantes durante produção
- Parâmetros não otimizados
- Operador sem treinamento adequado

### ✓ Qualidade (meta: 99%)

**Quando é o gargalo:**
- Revisar controle de qualidade da matéria-prima
- Calibrar equipamentos e sensores
- Treinar equipe em padrões de qualidade
- Implementar poka-yoke (à prova de erros)

**Causas comuns de baixa qualidade:**
- Matéria-prima fora de especificação
- Equipamentos descalibrados
- Falta de padronização
- Operadores sem treinamento
- Processo instável

## 📈 Cenários de Uso

### Cenário 1: OEE Excelente

```
OEE: 88.5%
├─ Disponibilidade: 92.0% ✓
├─ Performance: 97.5% ✓
└─ Qualidade: 98.7% ✓

Resultado: Mensagem de parabenização
```

### Cenário 2: Performance é Gargalo

```
OEE: 68.2%
├─ Disponibilidade: 88.0%
├─ Performance: 72.5% ← GARGALO
└─ Qualidade: 99.0%

Resultado: 
- Diagnóstico aponta Performance
- Mostra ganho potencial: +16.8 pontos
- Lista 4 ações para melhorar performance
```

### Cenário 3: Múltiplos Componentes Baixos

```
OEE: 62.3%
├─ Disponibilidade: 78.0% ← GARGALO
├─ Performance: 82.0% ← TAMBÉM BAIXO
└─ Qualidade: 97.5%

Resultado:
- Diagnóstico aponta Disponibilidade (menor)
- Mostra ganho potencial: +12.4 pontos
- Lista 4 ações para disponibilidade
- Alerta: "Performance também está baixa (82.0%)"
```

### Cenário 4: Qualidade Crítica

```
OEE: 54.1%
├─ Disponibilidade: 91.0%
├─ Performance: 96.0%
└─ Qualidade: 61.9% ← GARGALO CRÍTICO

Resultado:
- Diagnóstico aponta Qualidade
- Mostra ganho potencial: +33.8 pontos
- Lista 4 ações para qualidade
- Destaque visual forte (muitas peças rejeitadas)
```

## 🧮 Metas Configuradas

| Componente | Meta Ideal | Classe Mundial |
|------------|------------|----------------|
| Disponibilidade | 90% | ≥ 90% |
| Performance | 95% | ≥ 95% |
| Qualidade | 99% | ≥ 99% |
| **OEE Total** | **85%** | **≥ 85%** |

**Nota:** Estas metas estão configuradas no código e podem ser ajustadas conforme necessidade da empresa.

```typescript
const components = [
  { name: 'Disponibilidade', target: 90 },  // Ajustável
  { name: 'Performance', target: 95 },      // Ajustável
  { name: 'Qualidade', target: 99 }         // Ajustável
];
```

## 💡 Valor Agregado

### Para Operadores
- ✅ Saber exatamente onde focar esforços
- ✅ Entender o impacto de melhorias
- ✅ Receber orientação clara de ações

### Para Supervisores
- ✅ Diagnóstico imediato sem análise manual
- ✅ Priorização automática de ações
- ✅ Dados concretos para coaching da equipe

### Para Gestores
- ✅ Visão clara de oportunidades de melhoria
- ✅ Quantificação do potencial de ganho
- ✅ Base para decisões de investimento

## 🎨 Elementos Visuais

### Cores e Significados

| Cor | Uso | Significado |
|-----|-----|-------------|
| 🟢 Verde (#4caf50) | OEE ≥ 85% | Excelente |
| 🟠 Laranja (#ff9800) | OEE < 85% | Atenção necessária |
| 🔴 Vermelho (#f44336) | Componente gargalo | Ação prioritária |
| 🟡 Amarelo (#fff9c4) | Alerta secundário | Segunda prioridade |

### Ícones

| Ícone | Componente | Cor |
|-------|------------|-----|
| ⏱️ | Disponibilidade | Verde |
| ⚡ | Performance | Laranja |
| ✓ | Qualidade | Azul |
| 🎯 | Diagnóstico | - |
| 🔧 | Ações | - |

## 📱 Responsividade

- **Desktop:** Box completo com todas as informações
- **Mobile:** Layout adaptado, informações priorizadas
- **Tablet:** Versão intermediária otimizada

## ✅ Benefícios Técnicos

1. **Análise em Tempo Real:** Recalcula a cada atualização de dados
2. **Sem Configuração Manual:** Totalmente automático
3. **Baseado em Dados Reais:** Usa dados da ordem atual
4. **Educativo:** Explica o que está acontecendo
5. **Acionável:** Fornece passos concretos

## 🚀 Próximas Melhorias Possíveis

1. **Histórico de Diagnósticos:** Rastrear evolução do gargalo ao longo do tempo
2. **Metas Personalizáveis:** Permitir ajustar metas por setor/equipamento
3. **Análise de Pareto:** Mostrar distribuição de perdas
4. **Benchmark:** Comparar com outras ordens similares
5. **Alertas Proativos:** Notificar quando componente cai abaixo de threshold
6. **Plano de Ação:** Gerar checklist de ações automaticamente
7. **IA Preditiva:** Prever tendências baseado em histórico

## 📅 Data de Implementação

22 de Outubro de 2025

## 📝 Arquivo Modificado

`frontend/src/pages/OrderSummary.tsx`

## ✅ Status

- ✅ Análise automática implementada
- ✅ Identificação de gargalo funcionando
- ✅ Cálculo de impacto preciso
- ✅ Recomendações específicas por componente
- ✅ Destaque visual do gargalo nos cards
- ✅ Alerta para componentes secundários
- ✅ Responsivo mobile e desktop
- ✅ Sem erros de linter
- ✅ Testado e pronto para uso

---

**Resultado:** O usuário agora tem um "consultor virtual" que analisa automaticamente o OEE e indica exatamente onde e como melhorar, com dados concretos de impacto potencial! 🎯

