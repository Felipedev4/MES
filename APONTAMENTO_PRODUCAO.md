# Apontamento de Produção

## Descrição

A página de **Apontamento de Produção** é uma interface completa para registro de dados de produção, oferecendo tanto apontamento automático via CLP (Controlador Lógico Programável) quanto apontamento manual. Esta página é essencial para o controle de produção em tempo real e integração com sistemas de automação industrial.

## Características Principais

### 🤖 Apontamento Automático via CLP
- Conexão em tempo real com CLP DVP-12SE
- Leitura automática de registros
- Contador de peças em tempo real
- Vinculação de ordem de produção ao CLP

### ✍️ Apontamento Manual
- Interface para registro manual de produção
- Útil para correções e ajustes
- Registro de quantidades produzidas e rejeitadas

### 📡 Monitoramento de Conectividade
- Status do CLP em tempo real
- Status da conexão WebSocket
- Indicadores visuais de conexão

## Componentes da Interface

### 1. Status do CLP DVP-12SE

```typescript
interface PlcStatus {
  connected: boolean;      // Conectado/Desconectado
  register: string;        // Registro (ex: D33)
  status: 'Online' | 'Offline';
  currentCount: number;    // Contador atual de peças
}
```

**Elementos Visuais:**
- 🔌 Ícone do CLP
- Badge de status (Verde: Conectado / Vermelho: Desconectado)
- Display grande mostrando status (Online/Offline)
- Contador de peças em destaque

### 2. Indicador WebSocket

**Características:**
- Ícone de WiFi/Conexão
- Chip de status colorido
- Verde: Conectado
- Vermelho: Desconectado
- Notificações quando o status muda

### 3. Apontamento Automático via CLP

**Funcionalidade:**
- Seletor de ordem de produção
- Desabilitado se CLP ou WebSocket estiverem desconectados
- Background azul para destaque
- Integração automática com dados do CLP

**Fluxo:**
1. Usuário seleciona uma ordem de produção
2. Sistema vincula a ordem ao CLP
3. CLP começa a enviar dados automaticamente
4. Contador atualiza em tempo real

### 4. Apontamento Manual

**Campos:**
- Ordem de Produção (dropdown)
- Quantidade Produzida (número)
- Quantidade Rejeitada (número)
- Botão "Registrar Apontamento"

**Validações:**
- Ordem deve ser selecionada
- Pelo menos uma quantidade (produzida ou rejeitada) deve ser maior que zero

**Uso Recomendado:**
- Quando o CLP estiver desconectado
- Para correções de dados
- Registro de produção retroativa

## Layout Responsivo

### Desktop (md+)
```
┌─────────────────────┬─────────────────────┐
│  Status do CLP      │  Apontamento        │
│  DVP-12SE           │  Manual             │
├─────────────────────┤                     │
│  WebSocket Status   │                     │
├─────────────────────┤                     │
│  Apontamento        │                     │
│  Automático         │                     │
└─────────────────────┴─────────────────────┘
```

### Mobile (xs)
```
┌─────────────────────┐
│  Status do CLP      │
│  DVP-12SE           │
├─────────────────────┤
│  WebSocket Status   │
├─────────────────────┤
│  Apontamento        │
│  Automático         │
├─────────────────────┤
│  Apontamento        │
│  Manual             │
└─────────────────────┘
```

## Integração com Backend

### API Endpoints

#### Carregar Ordens Ativas
```javascript
GET /api/production-orders?status=ACTIVE
Response: ProductionOrder[]
```

#### Registrar Apontamento Manual
```javascript
POST /api/production
Body: {
  productionOrderId: number;
  producedQuantity: number;
  rejectedQuantity: number;
}
```

### WebSocket Events

#### Eventos Ouvidos

```javascript
// Conexão estabelecida
socket.on('connect', () => {
  console.log('WebSocket conectado');
});

// Conexão perdida
socket.on('disconnect', () => {
  console.log('WebSocket desconectado');
});

// Dados do PLC recebidos
socket.on('plc:data', (data) => {
  // data.count = contador atual
  // Atualiza o display em tempo real
});

// Status do PLC mudou
socket.on('plc:status', (data) => {
  // data.connected = true/false
  // data.status = 'Online'/'Offline'
});
```

#### Eventos Emitidos

```javascript
// Vincular ordem ao apontamento automático
socket.emit('production:order:bind', {
  orderId: selectedAutoOrder,
  register: 'D33'
});

// Desvincular ordem
socket.emit('production:order:unbind');
```

## Exemplos de Uso

### Cenário 1: Apontamento Automático

```typescript
// 1. Usuário seleciona ordem no dropdown
setSelectedAutoOrder(6);

// 2. Sistema envia evento via WebSocket
socket.emit('production:order:bind', {
  orderId: 6,
  register: 'D33'
});

// 3. CLP começa a enviar dados
socket.on('plc:data', (data) => {
  setPlcStatus(prev => ({
    ...prev,
    currentCount: data.count, // Ex: 150 peças
  }));
});

// 4. Sistema atualiza banco automaticamente a cada incremento
```

### Cenário 2: Apontamento Manual

```typescript
// 1. Usuário preenche formulário
setManualPosting({
  orderId: '6',
  producedQuantity: 100,
  rejectedQuantity: 5,
});

// 2. Clica em "Registrar Apontamento"
handleManualSubmit();

// 3. Sistema valida e envia para API
await api.post('/production', {
  productionOrderId: 6,
  producedQuantity: 100,
  rejectedQuantity: 5,
});

// 4. Mostra notificação de sucesso
enqueueSnackbar('Apontamento realizado com sucesso!', { 
  variant: 'success' 
});
```

### Cenário 3: Perda de Conexão

```typescript
// 1. WebSocket desconecta
socket.on('disconnect', () => {
  setWebSocketConnected(false);
  enqueueSnackbar('WebSocket desconectado', { 
    variant: 'warning' 
  });
});

// 2. Campo de apontamento automático é desabilitado
<TextField
  disabled={!plcStatus.connected || !webSocketConnected}
  // ...
/>

// 3. Usuário é direcionado para apontamento manual
```

## Configuração do CLP

### Modelo Suportado
- **DVP-12SE** (Delta Electronics)
- Outros modelos Modbus compatíveis

### Registros
- **D33**: Registro padrão para contador de peças
- Configurável via `PlcConfig` no backend

### Protocolo
- **Modbus TCP/IP** ou **Modbus RTU**
- Comunicação via porta serial ou ethernet

## Cores e Estilos

### Status do CLP
```css
/* Conectado */
border: 2px solid #4caf50 (verde)
background: success.light

/* Desconectado */
border: 2px solid #f44336 (vermelho)
background: error.light
```

### Apontamento Automático
```css
background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)
border: 2px solid #2196f3 (azul)
```

### Apontamento Manual
```css
background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)
border: 2px solid #ff9800 (laranja)
```

## Notificações

### Tipos de Mensagens

| Evento | Tipo | Mensagem |
|--------|------|----------|
| WebSocket Conectado | Success | "WebSocket conectado" |
| WebSocket Desconectado | Warning | "WebSocket desconectado" |
| Apontamento Registrado | Success | "Apontamento realizado com sucesso!" |
| Erro ao Registrar | Error | "Erro ao registrar produção" |
| Ordem não Selecionada | Warning | "Selecione uma ordem de produção" |
| Quantidade Zerada | Warning | "Informe a quantidade produzida ou rejeitada" |

## Segurança e Validações

### Frontend
- ✅ Validação de campos obrigatórios
- ✅ Validação de números positivos
- ✅ Desabilitar campos quando sem conexão
- ✅ Prevenir múltiplos submits

### Backend (Esperado)
- Validar permissões do usuário
- Verificar se ordem existe e está ativa
- Validar quantidades (não negativas)
- Registrar timestamp da operação
- Registrar usuário que fez o apontamento

## Próximos Passos

### Melhorias Planejadas

1. **Histórico de Apontamentos**
   - Tabela com últimos apontamentos
   - Filtros por data, ordem, usuário
   - Exportação para Excel

2. **Gráficos em Tempo Real**
   - Gráfico de velocidade de produção
   - Indicador de eficiência (OEE)
   - Comparativo produzido vs. planejado

3. **Alertas Inteligentes**
   - Aviso quando CLP desconectar
   - Alerta de baixa velocidade
   - Notificação de meta atingida

4. **Multi-CLP**
   - Suporte a múltiplos CLPs
   - Dashboard de todos os CLPs
   - Alternância rápida entre máquinas

5. **Modo Offline**
   - Cache local de apontamentos
   - Sincronização automática quando conectar
   - Indicador visual de dados pendentes

## Troubleshooting

### Problema: CLP não conecta

**Soluções:**
1. Verificar configuração em "Configuração CLP"
2. Testar conexão de rede
3. Validar endereço IP e porta
4. Conferir registro configurado (D33)

### Problema: WebSocket desconectado

**Soluções:**
1. Verificar se backend está rodando
2. Confirmar URL do WebSocket
3. Verificar firewall
4. Tentar recarregar a página

### Problema: Contador não atualiza

**Soluções:**
1. Verificar se ordem está vinculada
2. Confirmar que CLP está conectado
3. Testar leitura do registro no CLP
4. Verificar logs do backend

### Problema: Apontamento manual não salva

**Soluções:**
1. Verificar se ordem está ativa
2. Confirmar que quantidades são válidas
3. Verificar permissões do usuário
4. Verificar logs de erro na API

## Estrutura de Arquivos

```
frontend/src/
├── pages/
│   └── ProductionPosting.tsx     # Página principal
├── contexts/
│   └── SocketContext.tsx         # Contexto WebSocket
├── services/
│   └── api.ts                    # Cliente API
└── types/
    └── index.ts                  # Types TypeScript
```

## Tecnologias Utilizadas

- **React** 18+ com TypeScript
- **Material-UI** v5
- **Socket.io Client** para WebSocket
- **React Hook Form** (potencial uso futuro)
- **Notistack** para notificações

## Acesso

### Via Menu
1. Login no sistema
2. Menu lateral → **"Apontamento Produção"**

### Via URL
```
http://localhost:3000/production-posting
```

---

**Versão**: 1.0.0  
**Data de Criação**: Outubro 2025  
**Última Atualização**: Outubro 2025  
**Autor**: Equipe MES Development

