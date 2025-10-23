# 🎨 Plano de Melhorias - Páginas Administrativas

## 📊 Status Atual

### ✅ Páginas Já Melhoradas (8)
1. Companies (Empresas)
2. Sectors (Setores)
3. Downtimes (Paradas)
4. Defects (Defeitos)
5. Molds (Moldes)
6. Items (Itens/Produtos)
7. ActivityTypes (Tipos de Atividade)
8. ReferenceTypes (Tipos de Referência)

### ⏳ Páginas a Melhorar (6 Administrativas)
1. **Users** (Colaboradores) - PRIORIDADE ALTA
2. **Permissions** (Permissões) - PRIORIDADE ALTA
3. **UserCompanies** (Colaboradores e Empresas) - PRIORIDADE MÉDIA
4. **EmailConfig** (Configuração de E-mail) - PRIORIDADE MÉDIA
5. **PlcConfig** (Configuração CLP) - PRIORIDADE MÉDIA
6. **MaintenanceAlerts** (Alertas de Manutenção) - PRIORIDADE MÉDIA

---

## 🎯 Padrão de Design a Aplicar

### 1. **Cards de Estatísticas** (4 cards no topo)
```tsx
<Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard 
      title="Card 1"
      value={stats.value1}
      subtitle="Descrição"
      icon={<IconComponent />}
      color={theme.palette.color.main}
    />
  </Grid>
  // ... mais 3 cards
</Grid>
```

### 2. **Barra de Busca e Filtros**
```tsx
<Paper sx={{ p: 2, mb: 2 }}>
  <Stack direction="row" spacing={2}>
    <TextField /* Busca com ícone */ />
    <TextField /* Filtro 1 */ />
    <TextField /* Filtro 2 */ />
    <Button /* Novo Item */ />
  </Stack>
</Paper>
```

### 3. **Tabela Profissional**
- Sticky header
- Hover effects
- Chips coloridos
- Tooltips informativos
- Empty state personalizado

### 4. **Dialog Redesenhado**
- Header com ícone
- Grid layout organizado
- Input adornments
- Feedback visual
- Validações claras

---

## 📋 Detalhamento por Página

### 1. Users (Colaboradores)

**Cards de Estatísticas:**
- Total de Colaboradores
- Ativos
- Por Role Principal (Admin/Manager/Operator)
- Precisam Trocar Senha

**Filtros:**
- Busca: Nome, E-mail, Código
- Role: Todos, Admin, Manager, etc.
- Status: Todos, Ativos, Inativos

**Tabela:**
- Colunas: Código, Nome, E-mail, Role, Departamento, Status, Ações
- Chips coloridos por Role
- Badge para "Trocar Senha"

**Dialog:**
- Dados Básicos: Nome, E-mail, Código
- Contato: Telefone, Departamento
- Acesso: Role, Senha, Trocar Senha
- Status: Ativo/Inativo

---

### 2. Permissions (Permissões)

**Cards de Estatísticas:**
- Total de Resources
- Resources Completos (todas permissions)
- Resources Parciais
- Resources Sem Acesso

**Filtros:**
- Busca: Nome do Resource
- Role: Selecionar role específica
- Tipo: Todos, Com View, Com Create, etc.

**Tabela:**
- Matrix view: Resource x Permissions
- Checkboxes coloridos
- Indicadores visuais de acesso

**Features:**
- Toggle rápido de permissões
- Cópia de permissões entre roles
- Visualização por role

---

### 3. UserCompanies (Colaboradores e Empresas)

**Cards de Estatísticas:**
- Total de Vínculos
- Colaboradores com Múltiplas Empresas
- Empresas com Mais Colaboradores
- Vínculos Ativos

**Filtros:**
- Busca: Colaborador ou Empresa
- Empresa: Filtrar por empresa específica
- Status: Ativos/Inativos

**Tabela:**
- Colunas: Colaborador, Empresa, Data Vínculo, Status, Ações
- Agrupamento por colaborador
- Indicador de empresa padrão

---

### 4. EmailConfig (Configuração de E-mail)

**Cards de Estatísticas:**
- Total de Configurações
- Configurações Ativas
- E-mails Enviados (hoje)
- Taxa de Sucesso

**Filtros:**
- Busca: Nome da config
- Empresa: Filtrar por empresa
- Status: Ativas/Inativas

**Tabela:**
- Colunas: Nome, Empresa, Host, Porta, Status, Ações
- Botão "Testar" para cada config
- Indicador de última utilização

**Dialog:**
- Dados SMTP: Host, Porta, Secure
- Credenciais: Username, Password
- Remetente: From Email, From Name
- Teste: Botão para enviar e-mail teste

---

### 5. PlcConfig (Configuração CLP)

**Cards de Estatísticas:**
- Total de CLPs
- CLPs Ativos
- CLPs Online/Offline
- Total de Registers

**Filtros:**
- Busca: Nome do CLP
- Setor: Filtrar por setor
- Status: Ativos/Inativos/Online/Offline

**Tabela:**
- Colunas: Nome, Host:Porta, Setor, Registers, Status, Ações
- Indicador de conexão (online/offline)
- Link para gerenciar registers

**Dialog:**
- Conexão: Nome, Host, Porta, Unit ID
- Timings: Timeout, Polling, Reconnect
- Setor: Vincular a setor
- Registers: Tabela de registers inline

---

### 6. MaintenanceAlerts (Alertas de Manutenção)

**Cards de Estatísticas:**
- Total de Alertas
- Alertas Ativos
- Alertas Próximos (7 dias)
- E-mails Enviados (mês)

**Filtros:**
- Busca: Molde
- Status: Ativos/Inativos
- Urgência: Próximos 7, 15, 30 dias

**Tabela:**
- Colunas: Molde, Data Manutenção, Dias até Alerta, Última Checagem, Status, Ações
- Indicador de urgência (cores)
- Badge de "Alerta Iminente"

**Features:**
- Botão "Verificar Agora"
- Botão "Enviar Teste"
- Histórico de envios

---

## 🎨 Componentes Reutilizáveis

### StatsCard
```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  icon: React.ReactNode;
  color: string;
}
```

### SearchBar
```tsx
<TextField
  placeholder="Buscar..."
  size="small"
  InputProps={{
    startAdornment: <SearchIcon />
  }}
/>
```

### FilterSelect
```tsx
<TextField
  select
  size="small"
  InputProps={{
    startAdornment: <FilterIcon />
  }}
/>
```

---

## 📈 Melhorias de UX

### Feedback Visual
- ✅ Success: Verde
- ⚠️ Warning: Amarelo
- ❌ Error: Vermelho
- ℹ️ Info: Azul

### Loading States
- Skeleton loaders
- Spinners
- Progress bars

### Empty States
- Mensagens amigáveis
- Ilustrações
- Call-to-action

### Tooltips
- Em ícones
- Em badges
- Em status

---

## 🚀 Ordem de Implementação

### Fase 1 (Prioridade Alta) - 2 páginas
1. **Users** - Página mais acessada
2. **Permissions** - Configuração crítica

### Fase 2 (Prioridade Média) - 2 páginas
3. **EmailConfig** - Funcionalidade importante
4. **MaintenanceAlerts** - Feature recente

### Fase 3 (Prioridade Baixa) - 2 páginas
5. **UserCompanies** - Página de apoio
6. **PlcConfig** - Configuração técnica

---

## ✅ Checklist por Página

Para cada página, verificar:
- [ ] 4 Cards de estatísticas implementados
- [ ] Barra de busca funcional
- [ ] 2+ filtros funcionais
- [ ] Tabela com hover effects
- [ ] Chips coloridos onde aplicável
- [ ] Dialog redesenhado
- [ ] Input adornments
- [ ] Feedback visual em tempo real
- [ ] Empty state personalizado
- [ ] Tooltips informativos
- [ ] Responsividade mobile
- [ ] Sem erros de linter

---

## 📊 Estimativa de Tempo

- Users: ~30min
- Permissions: ~40min (mais complexa)
- UserCompanies: ~25min
- EmailConfig: ~30min
- PlcConfig: ~35min (registers inline)
- MaintenanceAlerts: ~30min

**Total Estimado:** ~3 horas de desenvolvimento

---

## 🎯 Objetivo Final

Ter todas as páginas administrativas com:
- ✨ Visual moderno e profissional
- 📊 Informações claras e acessíveis
- 🎨 Consistência de design
- 🚀 Performance otimizada
- 📱 100% Responsivo

**Status:** 📋 Planejamento Concluído - Pronto para Implementação

