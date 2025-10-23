# Melhorias nos Cards de Ordens - Página Injetoras

## 📋 Objetivo
Ajustar as informações dos cards de ordens de produção na rota `injectors/:id/orders` para exibir dados compatíveis com o resumo da ordem e adicionar informações pertinentes ao MES de empresa de plásticos.

## ✅ Implementações

### 1. Correção de Dados Incompatíveis

#### Antes:
- **Apontamento**: Exibia `producedQuantity` (quantidade produzida) de forma incorreta

#### Depois:
- **Produzido**: Exibe corretamente a quantidade já produzida com formatação numérica
- **Rejeitado**: Nova informação adicionada para controle de qualidade

### 2. Informações Específicas para Indústria de Plásticos

Adicionadas seções específicas para MES de plásticos:

#### **Molde (Seção Destacada)**
- Nome do molde utilizado na produção
- Número de cavidades ativas (ou total se não houver cavidades ativas definidas)
- Exibição condicional (só aparece se houver molde associado)

### 3. Estrutura Completa dos Cards

```
┌─────────────────────────────────────────┐
│ ████████████░░░░░░░░░░░░░░░             │ ← Barra de Progresso (11%)
├─────────────────────────────────────────┤
│  🔴 URGENTE  🟢 Em Atividade   11% ✓    │ ← Chips de Status + %
├─────────────────────────────────────────┤
│  Ordem: OP-2025-004    Quantidade: 15000│ ← Cabeçalho
├─────────────────────────────────────────┤
│  Data Inicial: 22/10/2025               │
│  Produzido: 1.610 ✅                    │
│                                          │
│  Data Final: 05/11/2025                 │
│  Rejeitado: 0                           │
├─────────────────────────────────────────┤
│  Molde: Tampa Plástica 100mm            │ ← Seção específica
│  Cavidades: 4                           │    para plásticos
├─────────────────────────────────────────┤
│  Referência do Produto:                 │
│  Tampa Plástica 100mm                   │ ← Rodapé
└─────────────────────────────────────────┘
```

## 📊 Informações Exibidas

### Barra de Progresso Visual (Novo!) 🎯
- **Barra colorida** no topo mostra percentual de conclusão visualmente
- **Cores dinâmicas**:
  - 🔵 **Azul**: 0% - 79% (início/em progresso)
  - 🟠 **Laranja**: 80% - 99% (quase completo)
  - 🟢 **Verde**: 100%+ (concluído)
- **Percentual numérico** ao lado dos chips de status (ex: "11% concluído")
- **Fórmula**: `(producedQuantity / plannedQuantity) × 100`

### Linha 1
- **Data Inicial**: Data planejada de início da produção
- **Produzido**: Quantidade já produzida (em verde, destaque positivo)

### Linha 2
- **Data Final**: Data planejada de conclusão
- **Rejeitado**: Quantidade rejeitada (em vermelho se houver rejeição, cinza se zero)

### Seção Molde (Específica para Plásticos)
- **Molde**: Nome completo do molde
- **Cavidades**: Número de cavidades ativas (prioriza `activeCavities`, usa `cavities` como fallback)

### Rodapé
- **Referência do Produto**: Nome completo do item/produto

## 🎨 Melhorias Visuais

1. **Cores Semânticas**:
   - Verde para quantidade produzida (sucesso)
   - Vermelho para quantidade rejeitada quando > 0 (alerta)
   - Cinza para quantidade rejeitada quando = 0 (neutro)
   - Azul para número de cavidades (destaque primário)

2. **Formatação**:
   - Números formatados em pt-BR (ex: 1.610 ao invés de 1610)
   - Truncamento de texto longo com ellipsis
   - Espaçamento consistente entre seções

3. **Hierarquia Visual**:
   - Separadores (`borderTop`) entre seções
   - Fundo cinza claro no rodapé para destacar o produto
   - Labels em fonte menor e cinza, valores em fonte maior e negrito

## 💡 Benefícios

### Para Operadores
- Visualização rápida do status de produção
- Identificação imediata de rejeições
- Informações críticas do molde sempre visíveis

### Para Gestores
- Dados compatíveis com o resumo detalhado da ordem
- Métricas de qualidade (rejeitado) facilmente acessíveis
- Informações técnicas (molde, cavidades) para tomada de decisão

### Para o MES
- Dados específicos da indústria de plásticos
- Rastreabilidade completa (molde + produto)
- Controle de qualidade integrado

## 📁 Arquivo Modificado

- `frontend/src/pages/OrderPanel.tsx`
  - Refatoração completa do CardContent (linhas 294-423)
  - Adição de seção condicional para molde
  - Ajuste de labels e formatação de dados

## ✅ Validação Visual da Quantidade Produzida

### Como Verificar se os Dados Estão Corretos

A **barra de progresso** facilita a validação rápida:

1. **Verificação Rápida**: 
   - Se produzido = 1.610 e planejado = 15.000
   - Progresso = 1.610 ÷ 15.000 = **10,7%** ≈ **11%**
   - Barra deve mostrar ~11% preenchida em azul

2. **Cores Indicam Estágio**:
   ```
   Azul (0-79%):   Produção inicial/em andamento
   Laranja (80-99%): Próximo da conclusão
   Verde (100%):   Ordem completa
   ```

3. **Exemplo de Validação**:
   ```
   Planejado: 15.000
   Produzido:  1.610
   Cálculo:   (1.610 / 15.000) × 100 = 10,73%
   Exibido:   11% ✓ (arredondado)
   ```

### Compatibilidade com OrderSummary

✅ **100% Compatível** - Ambas as páginas usam:
- Mesmo campo: `order.producedQuantity`
- Mesma fonte: `GET /production-orders/:id`
- Mesmo cálculo: `(producedQuantity / plannedQuantity) × 100`
- Mesma atualização: Auto-refresh a cada 30s

## ✨ Próximas Melhorias Sugeridas

1. ✅ ~~**Adicionar Badge de Progresso**~~ (Implementado!)
2. **Indicador de Ciclo**: Exibir tempo de ciclo do molde
3. **Status de Manutenção**: Alertar se o molde está próximo da data de manutenção
4. **Taxa de Rejeição Visual**: Badge colorido quando rejeição > 5%
5. **Última Atualização**: Timestamp da última coleta de dados

---
**Data**: 23/10/2025  
**Versão**: 1.0  
**Status**: ✅ Implementado e Testado

