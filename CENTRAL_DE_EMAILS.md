# 📧 Central de E-mails

## 📋 Visão Geral

A **Central de E-mails** é uma nova funcionalidade do sistema MES que consolida todos os e-mails enviados pelo sistema em uma única interface centralizada. Isso permite monitorar, auditar e diagnosticar facilmente todas as comunicações por e-mail do sistema.

---

## ✨ Principais Funcionalidades

### 1. **Visualização Consolidada**
- **Todos os e-mails em um só lugar**: Alertas de manutenção, notificações de paradas e outros tipos de e-mail
- **Histórico completo**: Acesso a todos os e-mails enviados pelo sistema
- **Ordenação cronológica**: E-mails mais recentes aparecem primeiro

### 2. **Estatísticas em Tempo Real**
Quatro cards de métricas principais:
- 📊 **Total de E-mails**: Quantidade total enviada pelo sistema
- ✅ **Enviados com Sucesso**: E-mails entregues com sucesso (com percentual)
- ❌ **Falhas no Envio**: E-mails que falharam e precisam atenção
- 🕐 **Últimas 24h**: E-mails enviados nas últimas 24 horas

### 3. **Sistema de Busca e Filtros**
- **Busca textual**: Buscar por:
  - Assunto do e-mail
  - Destinatários
  - Código do molde (quando aplicável)
- **Filtros por Status**:
  - Todos Status
  - Sucesso
  - Falha
- **Filtros por Tipo**:
  - Todos os Tipos
  - Alertas de Manutenção
  - Notificações de Parada
  - Outros

### 4. **Visualização Detalhada**
Cada e-mail exibe:
- 📅 **Data e Hora**: Quando foi enviado
- 🏷️ **Tipo**: Categoria do e-mail (com ícone e cor específica)
- 📝 **Assunto**: Título do e-mail
- 👥 **Destinatários**: Lista de e-mails (com indicador de quantidade se múltiplos)
- ✓/✗ **Status**: Indicador visual de sucesso ou falha
- 👁️ **Ação**: Botão para ver detalhes completos

### 5. **Dialog de Detalhes**
Ao clicar em "Ver Detalhes", é exibido:
- **Status do envio**: Alert visual (sucesso ou falha com mensagem de erro)
- **Tipo de e-mail**: Chip colorido identificando a categoria
- **Assunto**: Título completo
- **Destinatários**: Lista completa em chips
- **Conteúdo**: HTML renderizado do corpo do e-mail
- **Informações Adicionais**: Dados contextuais (ex: código do molde)

---

## 🎨 Design Profissional

### Cards de Estatísticas
- **Gradientes visuais**: Cada card tem cor específica por tipo de métrica
- **Ícones descritivos**: Representação visual clara
- **Efeito hover**: Animação ao passar o mouse
- **Responsivo**: Adaptação para diferentes tamanhos de tela

### Tabela de E-mails
- **Cabeçalho fixo**: Permanece visível ao rolar
- **Linhas alternadas**: Melhor legibilidade
- **Efeito hover**: Destaque da linha ao passar o mouse
- **Chips coloridos**: Identificação visual rápida de status e tipos
- **Tooltips**: Informações adicionais ao passar o mouse
- **Truncamento inteligente**: Textos longos cortados com reticências

### Cores e Estados
- 🟢 **Verde (Success)**: E-mails enviados com sucesso
- 🔴 **Vermelho (Error)**: Falhas no envio
- 🟠 **Laranja (Warning)**: Alertas de manutenção
- 🔴 **Vermelho (Error)**: Notificações de parada
- 🔵 **Azul (Info)**: Outros tipos de e-mail

---

## 🔧 Implementação Técnica

### Frontend

#### Arquivo: `frontend/src/pages/EmailCenter.tsx`

**Componentes utilizados:**
- Material-UI (MUI) components
- React Hooks (`useState`, `useEffect`, `useMemo`)
- `notistack` para notificações
- `moment` para formatação de datas

**Principais funções:**
```typescript
loadEmails(): Promise<void>
// Carrega e-mails de diferentes fontes (maintenance alerts, etc.)

handleViewEmail(email: EmailLog): void
// Abre dialog com detalhes completos do e-mail

getEmailTypeLabel(type?: string): string
// Retorna label amigável do tipo de e-mail

getEmailTypeColor(type?: string): string
// Retorna cor MUI do tipo de e-mail

getEmailTypeIcon(type?: string): React.ReactNode
// Retorna ícone do tipo de e-mail
```

**Interface principal:**
```typescript
interface EmailLog {
  id: number;
  emailConfigId?: number;
  recipients: string;
  subject: string;
  body: string;
  success: boolean;
  error?: string;
  sentAt: string;
  emailType?: 'maintenance_alert' | 'downtime_notification' | 'other';
  moldId?: number;
  moldCode?: string;
  sectorNames?: string;
}
```

### Roteamento

#### Arquivo: `frontend/src/App.tsx`
```typescript
import EmailCenter from './pages/EmailCenter';
// ...
<Route path="/email-center" element={<EmailCenter />} />
```

### Menu Lateral

#### Arquivo: `frontend/src/components/Layout/MenuItems.tsx`
Adicionado na seção **Administração**:
```typescript
{
  text: 'Central de E-mails',
  icon: <EmailIcon />,
  path: '/email-center',
  resource: 'email_logs'
}
```

### Permissões

#### Backend: `backend/src/controllers/rolePermissionController.ts`
Adicionado recurso `'email_logs'` à lista de resources:
```typescript
const resources = [
  // ...
  'email_logs',
  // ...
];
```

#### Frontend: `frontend/src/pages/Permissions.tsx`
Adicionado label:
```typescript
const resourceLabels: Record<string, string> = {
  // ...
  email_logs: 'Central de E-mails',
  // ...
};
```

---

## 🔐 Controle de Acesso

A Central de E-mails está protegida pelo sistema de permissões baseado em roles:

- **ADMIN**: Acesso total (visualizar, criar, editar, deletar)
- **DIRECTOR**: Acesso total (igual ao ADMIN)
- **MANAGER**: Pode visualizar e editar
- **SUPERVISOR**: Pode visualizar
- **LEADER**: Pode visualizar
- **OPERATOR**: Sem acesso por padrão

> **Nota**: As permissões podem ser ajustadas na tela de **Permissões** do sistema.

---

## 📊 Fontes de E-mail

Atualmente, a Central de E-mails integra:

### 1. **Alertas de Manutenção** 🔧
- **Endpoint**: `/api/maintenance-alerts/email-logs?limit=200`
- **Tipo**: `maintenance_alert`
- **Contexto**: E-mails enviados quando um molde atinge o limite de manutenção

### 2. **Notificações de Parada** (Futuro) ⚠️
- **Endpoint**: A ser implementado
- **Tipo**: `downtime_notification`
- **Contexto**: E-mails enviados aos setores responsáveis quando uma parada improdutiva ocorre

### 3. **Outros** 📩
- **Tipo**: `other`
- **Contexto**: Qualquer outro tipo de e-mail do sistema

---

## 🚀 Como Usar

### 1. **Acessar a Central de E-mails**
   - No menu lateral, clique em **Administração** > **Central de E-mails**
   - Ou navegue diretamente para `/email-center`

### 2. **Visualizar Estatísticas**
   - Os 4 cards no topo mostram métricas atualizadas
   - Hover sobre os cards para efeito visual

### 3. **Buscar E-mails**
   - Digite no campo de busca: assunto, destinatário ou código do molde
   - A tabela filtra automaticamente em tempo real

### 4. **Filtrar por Status**
   - Use o dropdown "Todos Status" para filtrar:
     - **Sucesso**: Apenas e-mails enviados com sucesso
     - **Falha**: Apenas e-mails que falharam

### 5. **Filtrar por Tipo**
   - Use o dropdown "Todos os Tipos" para filtrar:
     - **Alertas de Manutenção**
     - **Notificações de Parada**
     - **Outros**

### 6. **Ver Detalhes**
   - Clique no ícone 👁️ na coluna "Ações"
   - Um dialog abrirá com todas as informações do e-mail
   - Veja o conteúdo HTML renderizado

### 7. **Atualizar Dados**
   - Clique no botão "Atualizar" para recarregar a lista

---

## 🎯 Casos de Uso

### 1. **Auditoria de E-mails**
**Cenário**: A gerência quer verificar se os alertas de manutenção estão sendo enviados corretamente.
- Acesse a Central de E-mails
- Filtre por "Alertas de Manutenção"
- Verifique os últimos envios e suas datas

### 2. **Diagnóstico de Falhas**
**Cenário**: Um setor não está recebendo notificações de parada.
- Acesse a Central de E-mails
- Filtre por "Falha"
- Clique em "Ver Detalhes" para ver o erro específico
- Use a informação para corrigir a configuração SMTP

### 3. **Verificação de Destinatários**
**Cenário**: Confirmar quais e-mails foram enviados para um molde específico.
- Busque pelo código do molde (ex: "MOLDE-001")
- Veja todos os e-mails relacionados
- Verifique os destinatários e datas

### 4. **Monitoramento em Tempo Real**
**Cenário**: Acompanhar e-mails enviados nas últimas 24 horas.
- Verifique o card "Últimas 24h"
- Role a tabela para ver os envios mais recentes

---

## 🔄 Expansão Futura

A Central de E-mails foi projetada para ser extensível. Para adicionar novos tipos:

### 1. **Criar o Endpoint no Backend**
```typescript
// Exemplo: Notificações de parada
router.get('/downtimes/email-logs', authenticateToken, getDowntimeEmailLogs);
```

### 2. **Adicionar ao Frontend**
```typescript
// Em loadEmails()
const [maintenanceLogsRes, downtimeLogsRes] = await Promise.all([
  api.get('/maintenance-alerts/email-logs?limit=200'),
  api.get('/downtimes/email-logs?limit=200'), // Novo
]);

const allEmails: EmailLog[] = [
  ...maintenanceLogsRes.data.map((log: any) => ({
    ...log,
    emailType: 'maintenance_alert' as const,
  })),
  ...downtimeLogsRes.data.map((log: any) => ({
    ...log,
    emailType: 'downtime_notification' as const, // Novo
  })),
];
```

### 3. **Adicionar Tipo ao Switch**
```typescript
// Em getEmailTypeLabel, getEmailTypeColor e getEmailTypeIcon
case 'downtime_notification':
  return 'Notificação de Parada';
```

---

## 📈 Benefícios

### Para a Operação
- ✅ **Visibilidade**: Saber exatamente quais e-mails foram enviados
- ✅ **Confiabilidade**: Identificar e corrigir falhas rapidamente
- ✅ **Rastreabilidade**: Histórico completo para auditorias

### Para a Manutenção
- 🔧 **Confirmação**: Verificar se alertas de manutenção chegaram ao destino
- 🔧 **Diagnóstico**: Identificar problemas de configuração SMTP

### Para a Gestão
- 📊 **Métricas**: Quantificar comunicações do sistema
- 📊 **Análise**: Entender padrões de envio
- 📊 **Compliance**: Documentar comunicações para auditorias

---

## 🐛 Troubleshooting

### E-mails não aparecem na Central
**Solução:**
1. Verifique se o endpoint está retornando dados
2. Abra o console do navegador (F12) para ver erros
3. Verifique permissões do usuário para `email_logs`

### Estatísticas incorretas
**Solução:**
1. Clique no botão "Atualizar"
2. Limpe o cache do navegador (Ctrl+F5)
3. Verifique se há filtros ativos

### Dialog não abre
**Solução:**
1. Recarregue a página
2. Verifique erros no console
3. Teste em outro navegador

### Busca não funciona
**Solução:**
1. Verifique se digitou corretamente
2. Limpe os filtros de status e tipo
3. Recarregue a página

---

## 📝 Notas Técnicas

- **Performance**: Limite de 200 e-mails por fonte para evitar sobrecarga
- **Cache**: Dados não são cacheados, sempre busca do servidor
- **Refresh**: Não há auto-refresh, usuário deve clicar em "Atualizar"
- **Paginação**: Ainda não implementada (futura melhoria)
- **Exportação**: Ainda não implementada (futura melhoria)

---

## 🎓 Boas Práticas

1. **Monitore regularmente**: Verifique a Central diariamente
2. **Investigue falhas imediatamente**: E-mails falhados podem indicar problemas maiores
3. **Configure permissões adequadas**: Nem todos precisam ver todos os e-mails
4. **Use filtros**: Facilita encontrar informações específicas
5. **Documente padrões**: Se perceber padrões de falha, documente para referência futura

---

## 📞 Suporte

Para problemas ou dúvidas sobre a Central de E-mails:
1. Consulte esta documentação
2. Verifique a seção de Troubleshooting
3. Consulte os logs do servidor para erros de backend
4. Entre em contato com o administrador do sistema

---

**Documentação criada em**: 23/10/2025  
**Versão**: 1.0  
**Autor**: Sistema MES - Equipe de Desenvolvimento

