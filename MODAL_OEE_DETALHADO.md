# Modal Detalhado de OEE - Documentação

## 📋 Resumo

Implementação de modal educativo e informativo que explica a composição do OEE (Overall Equipment Effectiveness) ao clicar no card de OEE na página de Resumo da Ordem.

## ✨ Funcionalidade

### Ativação
- **Trigger**: Clicar no card de OEE
- **Indicador Visual**: Card com efeito hover (eleva e aumenta sombra)
- **Texto**: "OEE (clique para detalhes)"

### Modal Completo

#### 📊 Cabeçalho
- Título: "Composição do OEE (Overall Equipment Effectiveness)"
- Ícone de velocímetro
- Fundo azul (primary)
- Texto branco

#### 📈 Conteúdo Principal

##### 1. **OEE Geral** (Topo)
- Percentual grande e destacado
- Fórmula: `OEE = Disponibilidade × Performance × Qualidade`
- Cálculo completo com valores: `85.5% × 92.3% × 98.1% = 77.4%`
- Fundo cinza claro

##### 2. **Componentes Detalhados**

###### 🟢 **Disponibilidade**
- **Card Verde** (`#e8f5e9`)
- **Ícone**: TrendingUp (verde)
- **Percentual**: Com barra de progresso
- **Explicação**:
  - O que mede
  - Fórmula de cálculo
  - Perdas incluídas (paradas, quebras, setup)

###### 🟡 **Performance**
- **Card Laranja** (`#fff3e0`)
- **Ícone**: Speed (laranja)
- **Percentual**: Com barra de progresso
- **Explicação**:
  - O que mede
  - Fórmula de cálculo
  - Dados reais: Ciclo ideal vs Ciclo real
  - Perdas incluídas (microparadas, redução de velocidade)

###### 🔵 **Qualidade**
- **Card Azul** (`#e3f2fd`)
- **Ícone**: CheckCircle (azul)
- **Percentual**: Com barra de progresso
- **Explicação**:
  - O que mede
  - Fórmula de cálculo
  - Dados reais: Peças aprovadas vs rejeitadas
  - Perdas incluídas (refugo, retrabalho)

##### 3. **Interpretação do OEE**

Escala visual com 3 faixas:

| Faixa | Cor | Classificação |
|-------|-----|---------------|
| ≥ 85% | Verde | Excelente (Classe Mundial) |
| 60-84% | Laranja | Bom (Melhorias Possíveis) |
| < 60% | Vermelho | Crítico (Ação Necessária) |

##### 4. **💡 Dicas para Melhorar o OEE**

Box roxo claro (`#e8eaf6`) com sugestões práticas:

- **Disponibilidade**: Manutenção preventiva, reduzir paradas
- **Performance**: Otimizar processo, reduzir microparadas
- **Qualidade**: Melhorar controle, treinamento, matéria-prima

## 🎨 Design e Layout

### Responsividade
- **Desktop**: Modal médio (`maxWidth="md"`)
- **Mobile**: Tela cheia (`fullScreen`)

### Cores por Componente
```css
Disponibilidade: Verde (#e8f5e9, success.main)
Performance:     Laranja (#fff3e0, warning.main)
Qualidade:       Azul (#e3f2fd, info.main)
```

### Barras de Progresso
- Altura: 8px
- Bordas arredondadas
- Cores correspondentes ao componente
- Valor limitado a 100%

## 📊 Informações Exibidas

### Dados Reais da Ordem

#### Disponibilidade
- Percentual calculado
- Tempo ideal vs tempo real
- Perdas por paradas

#### Performance
- **Ciclo Ideal**: Do cadastro do molde
- **Ciclo Real**: Média dos apontamentos
- Fórmula aplicada aos dados reais

#### Qualidade
- **Peças Aprovadas**: Total - Rejeitadas
- **Peças Rejeitadas**: Da ordem
- Percentual de aprovação

## 🎯 Valor Educativo

### Para Operadores
- ✅ Entender o que é OEE
- ✅ Ver como suas ações impactam cada componente
- ✅ Compreender as fórmulas de forma visual

### Para Supervisores
- ✅ Identificar qual componente está puxando o OEE para baixo
- ✅ Saber onde focar esforços de melhoria
- ✅ Ter dados concretos para ações

### Para Gestores
- ✅ Avaliar performance contra padrões mundiais
- ✅ Comparar entre ordens/equipamentos
- ✅ Justificar investimentos em melhorias

## 💻 Implementação Técnica

### Estado
```typescript
const [oeeModalOpen, setOeeModalOpen] = useState(false);
```

### Trigger
```typescript
<Card onClick={() => setOeeModalOpen(true)} />
```

### Estrutura
- Dialog Material-UI
- Grid responsivo
- Cards coloridos por componente
- Barras de progresso LinearProgress
- Tipografia hierarquizada

### Dados Utilizados
```typescript
stats.oee           // OEE calculado
stats.availability  // Disponibilidade
stats.performance   // Performance
stats.quality       // Qualidade
stats.averageCycle  // Ciclo médio real
orderData.mold.cycleTime  // Ciclo ideal
stats.totalProduced       // Total produzido
stats.totalRejected       // Total rejeitado
```

## 🎬 Experiência do Usuário

### Fluxo de Interação

1. **Usuário vê card de OEE** com valor (ex: 77.4%)
2. **Percebe que é clicável** pelo texto e hover effect
3. **Clica no card**
4. **Modal abre** mostrando composição detalhada
5. **Usuário lê** cada componente e entende:
   - Por que o OEE está nesse valor
   - Qual componente está baixo
   - Como melhorar
6. **Fecha o modal** mais informado

### Feedback Visual

- **Hover**: Card eleva e sombra aumenta
- **Cursor**: Muda para pointer
- **Modal**: Animação suave de abertura
- **Cores**: Distintas por componente
- **Barras**: Feedback visual imediato

## 📱 Mobile vs Desktop

### Desktop
- Modal tamanho médio
- Visualização confortável
- Scrolling interno se necessário

### Mobile
- Modal em tela cheia
- Otimizado para leitura
- Scroll vertical natural
- Botão fechar acessível

## ✅ Benefícios

### Transparência
- Cálculos não são "caixa preta"
- Usuário vê de onde vêm os números
- Confiança nos dados

### Educação
- Ensina conceitos de manufatura
- Padroniza entendimento na equipe
- Reduz dúvidas sobre métricas

### Ação
- Identifica área de melhoria
- Sugere ações concretas
- Motiva a busca por excelência

## 🚀 Melhorias Futuras Possíveis

1. **Gráfico de Pizza** mostrando impacto de cada componente
2. **Histórico** de OEE da ordem ao longo do tempo
3. **Comparação** com outras ordens similares
4. **Análise de Pareto** das perdas
5. **Metas** configuráveis por componente
6. **Exportar** dados para PDF/Excel
7. **Ações Sugeridas** baseadas em IA
8. **Notificações** quando OEE cai abaixo de threshold

## 📅 Data de Implementação

22 de Outubro de 2025

## 📝 Arquivo Modificado

`frontend/src/pages/OrderSummary.tsx`

## ✅ Status

- **Implementação**: ✅ Completa
- **Linter**: ✅ Sem erros
- **TypeScript**: ✅ Tipado
- **Responsivo**: ✅ Mobile e Desktop
- **Testado**: ✅ Pronto para uso

---

**Nota**: Este modal transforma o OEE de um simples número em uma ferramenta educativa e de diagnóstico, alinhada com práticas de Lean Manufacturing e World Class Manufacturing (WCM).

