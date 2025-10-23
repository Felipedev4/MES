# 🚀 Guia Rápido - Fluxo Injetoras

## Acesso Rápido

### 🔧 Nível 1: Injetoras
```
Menu: Injetoras
URL: /injectors
```

### 📋 Nível 2: Painel Ordem
```
URL: /injectors/{plcId}/orders
Exemplo: /injectors/1/orders
```

### 📊 Nível 3: Dashboard Produção
```
URL: /production-dashboard/{orderId}
Exemplo: /production-dashboard/6
```

---

## 🔄 Fluxo de Uso

### Passo 1: Acessar Injetoras
1. Login no sistema
2. Menu lateral → **"Injetoras"**
3. Visualize todos os CLPs cadastrados

### Passo 2: Selecionar Injetora
1. Click no card da injetora desejada
2. Exemplo: "03-HAITIAN/ANO 2015"
3. Abre lista de ordens vinculadas

### Passo 3: Selecionar Ordem
1. Veja as ordens com status coloridos:
   - 🔴 **URGENTE** - Em atividade
   - 🟡 **Em Atividade** - Produzindo
   - ⚪ **Programação** - Planejada
2. Click no card da ordem
3. Abre dashboard detalhado

### Passo 4: Dashboard da Ordem
1. Visualize número da ordem e produto
2. Acesse os 5 cards de controle:
   - 🔧 Setup
   - 🔄 Ciclo
   - ⚠️ Perda
   - ⏸️ Parada
   - 📊 Resumo

### Navegar de Volta
- Use o **breadcrumb** no topo
- Click em "Injetoras" ou "Painel Ordem"

---

## 📱 Layouts

### Desktop
- Injetoras: 4 cards por linha
- Ordens: 2 cards por linha
- Dashboard: 3 cards por linha

### Mobile
- Todos: 1 card por linha (empilhado)

---

## 🎯 Atalhos

| Tecla | Ação |
|-------|------|
| Menu → Injetoras | Ir para lista de CLPs |
| Click no Card | Próximo nível |
| Breadcrumb | Voltar |

---

## 🎨 Status e Cores

### Injetoras
- Azul: CLP ativo

### Painel Ordem
- 🔴 Vermelho: URGENTE
- 🟡 Amarelo: Em Atividade
- ⚪ Cinza: Programação

### Dashboard
- 🟢 Verde: Operando / OK
- 🟠 Laranja: Atenção
- 🔴 Vermelho: Parado

---

## 💡 Dicas

1. **Sem CLPs?**
   - Configure em "Configuração CLP"

2. **Sem Ordens?**
   - Crie em "Ordens de Produção"

3. **Dados em tempo real?**
   - Use "Apontamento Produção"

4. **Erro ao carregar?**
   - Verifique se backend está rodando
   - Confirme se CLP/Ordem existe

---

## 🔧 Troubleshooting

### CLP não aparece
```
✓ Verificar se está ativo (active: true)
✓ Recarregar página (F5)
✓ Ver "Configuração CLP"
```

### Ordem não carrega
```
✓ Verificar se ordem existe
✓ Confirmar ID na URL
✓ Ver console do navegador (F12)
```

---

## 📚 Mais Informações

- **Documentação Completa**: `FLUXO_NAVEGACAO_INJETORAS.md`
- **Dashboard Produção**: `DASHBOARD_PRODUCAO.md`
- **API**: `API_DOCUMENTATION.md`

---

**Criado**: Outubro 2025  
**Versão**: 1.0

