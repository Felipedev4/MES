# 🚀 Guia Rápido - Novas Páginas

## Acesso Rápido

### 📊 Dashboard de Produção
```
Menu: Dashboard Produção
URL: /production-dashboard
```

### 📝 Apontamento de Produção  
```
Menu: Apontamento Produção
URL: /production-posting
```

---

## 📊 Dashboard de Produção

### O que é?
Painel visual para monitoramento de ordens em produção.

### Como usar?
1. Acesse pelo menu lateral: **"Dashboard Produção"**
2. Visualize o número da ordem e referência do produto
3. Clique nos cards para acessar funcionalidades:
   - 🔧 **Setup**: Configure a ordem
   - 🔄 **Ciclo**: Monitore ciclos
   - ⚠️ **Perda**: Registre perdas
   - ⏸️ **Parada**: Controle paradas
   - 📊 **Resumo**: Veja métricas

### Status Visuais
- ✅ **Verde**: Setup finalizado / Em operação
- ⚠️ **Amarelo**: Em setup / Atenção
- ❌ **Vermelho**: Parado / Erro

---

## 📝 Apontamento de Produção

### O que é?
Interface para registro de produção via CLP (automático) ou manual.

### Modo Automático 🤖

1. **Verifique as conexões:**
   - ✅ CLP: Deve estar "Conectado" e "Online"
   - ✅ WebSocket: Deve estar "Conectado"

2. **Configure:**
   - Selecione uma ordem no dropdown
   - O sistema registrará automaticamente via CLP

3. **Monitore:**
   - Veja o contador atualizando em tempo real
   - Número grande mostra peças produzidas

### Modo Manual ✍️

1. **Quando usar:**
   - CLP desconectado
   - Correção de dados
   - Registro retroativo

2. **Como registrar:**
   - Selecione a ordem de produção
   - Digite quantidade produzida
   - Digite quantidade rejeitada (se houver)
   - Clique em "Registrar Apontamento"

3. **Validações:**
   - Ordem é obrigatória
   - Pelo menos uma quantidade deve ser > 0

---

## 🎨 Legenda de Cores

### Dashboard de Produção
- 🔵 **Azul**: Setup / Configuração
- 🔷 **Ciano**: Ciclo / Processo
- 🟠 **Laranja**: Perda / Atenção
- 🟢 **Verde**: Operação / OK
- 🟢 **Verde Claro**: Resumo / Info

### Apontamento de Produção
- 🟢 **Borda Verde**: CLP conectado
- 🔴 **Borda Vermelha**: CLP desconectado
- 🔵 **Fundo Azul**: Apontamento automático
- 🟠 **Fundo Laranja**: Apontamento manual

---

## ⚡ Atalhos e Dicas

### Dashboard de Produção
- Use o breadcrumb para navegar rapidamente
- Cards são clicáveis - explore!
- Responsivo: funciona em mobile

### Apontamento de Produção
- Mantenha o WebSocket conectado
- Verifique status do CLP frequentemente
- Use modo manual como backup
- Contador em tempo real mostra produção

---

## 🔧 Troubleshooting Rápido

### CLP não conecta
```
1. Verificar "Configuração CLP" no menu
2. Conferir IP e porta
3. Testar conexão de rede
```

### WebSocket desconectado
```
1. Recarregar página (F5)
2. Verificar se backend está rodando
3. Conferir URL do WebSocket
```

### Contador não atualiza
```
1. Verificar se ordem está selecionada
2. Confirmar CLP e WebSocket conectados
3. Ver logs do navegador (F12)
```

---

## 📱 Mobile

Ambas as páginas são **100% responsivas**:
- Dashboard: Cards se reorganizam
- Apontamento: Colunas viram linhas

---

## 🎯 Próximos Passos

Após dominar estas páginas, explore:
1. Integração com CLP real
2. Relatórios de produção
3. Gráficos de desempenho
4. Histórico de apontamentos

---

## 📚 Mais Informações

- **Dashboard**: Ver `DASHBOARD_PRODUCAO.md`
- **Apontamento**: Ver `APONTAMENTO_PRODUCAO.md`
- **Resumo Completo**: Ver `RESUMO_NOVAS_PAGINAS.md`

---

**Criado**: Outubro 2025  
**Versão**: 1.0

