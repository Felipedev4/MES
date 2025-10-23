# Vínculo entre Colaboradores e Empresas - Versão Profissional

## 📋 Descrição

Sistema profissional e completo para gerenciar vínculos entre colaboradores (usuários) e empresas, permitindo que um colaborador tenha acesso a múltiplas empresas com interface moderna, intuitiva e rica em funcionalidades.

## ✨ Funcionalidades Implementadas

### 🎨 Interface Profissional

#### 📊 Dashboard de Estatísticas
Cards informativos no topo da página com métricas em tempo real:
- **Total de Colaboradores**: Número total de usuários no sistema
- **Com Empresas Vinculadas**: Quantidade de colaboradores que já possuem vínculo
- **Sem Empresas**: Colaboradores que ainda não foram vinculados (requerem atenção)
- **Múltiplas Empresas**: Usuários com acesso a mais de uma empresa

Cada card possui:
- Ícone colorido específico
- Número grande e destacado
- Descrição clara
- Cores semânticas (primário, sucesso, alerta, info)

#### 🔍 Sistema de Busca e Filtros Avançados
- **Busca em Tempo Real**: 
  - Campo de busca com ícone de lupa
  - Pesquisa por nome, email ou código do colaborador
  - Botão "X" para limpar a busca rapidamente
  - Feedback instantâneo nos resultados

- **Filtros Inteligentes**:
  - Switch "Sem Empresas": Exibe apenas colaboradores não vinculados
  - Switch "Múltiplas Empresas": Mostra apenas usuários multi-empresa
  - Combinação de filtros permitida
  - Contadores atualizados dinamicamente

- **Contador de Resultados**:
  - Exibe "X de Y colaboradores"
  - Atualiza conforme filtros aplicados

#### 📋 Tabela Aprimorada e Moderna
Colunas organizadas:
1. **#**: ID do colaborador
2. **Colaborador**: 
   - Avatar circular com inicial do nome
   - Nome completo em negrito
   - Email em fonte menor
3. **Código**: Código do funcionário
4. **Cargo**: Chip colorido (Admin=vermelho, Manager=amarelo, outros=cinza)
5. **Empresas Vinculadas**:
   - Chips das empresas com cores
   - Estrela para empresa padrão
   - Botão X para remover vínculo
   - Tooltip com informações
6. **Ações**: Botão "+" para adicionar empresa

Recursos visuais:
- Hover effect nas linhas
- Avatares com cores de fundo
- Chips com ações inline
- Tooltips informativos
- Estado vazio com mensagem amigável
- Mensagem quando não há resultados nos filtros

#### 💬 Dialog de Vínculo Melhorado
- **Cabeçalho**: Ícone + título descritivo
- **Informações do Colaborador**: Alert azul com nome e email
- **Seleção de Empresa**: 
  - Dropdown com nome e código da empresa
  - Lista filtrada (exclui empresas já vinculadas)
  - Alerta quando não há empresas disponíveis
- **Opção de Empresa Padrão**: 
  - Switch para definir como padrão
  - Alerta informativo quando ativado
- **Botões de Ação**:
  - Cancelar (secundário)
  - Vincular (primário, com loading state)
  - Ícones nos botões
  - Estados desabilitados quando necessário

#### 🎨 Design System Consistente
- **Cores Semânticas**:
  - Primário (azul): Empresa padrão
  - Sucesso (verde): Colaboradores com empresas
  - Alerta (laranja): Colaboradores sem empresas
  - Info (azul claro): Múltiplas empresas
  - Erro (vermelho): Cargo Admin

- **Tipografia**:
  - Títulos em negrito
  - Subtítulos em cinza
  - Números grandes para métricas
  - Texto secundário menor

- **Espaçamento**:
  - Padding consistente nos cards
  - Margens entre seções
  - Grid system do Material-UI

- **Iconografia**:
  - Person para colaboradores
  - Business para empresas
  - Star (preenchida/vazia) para padrão
  - Add para adicionar
  - Delete para remover
  - Search para buscar

### Backend

#### Rotas API (`/api/companies`)

1. **`GET /api/companies/user/:userId`**
   - Lista todas as empresas vinculadas a um usuário
   - Retorna: Array de UserCompany com informações completas da empresa
   - Estrutura: `{ id, userId, companyId, isDefault, company: {...} }`

2. **`POST /api/companies/link-user`**
   - Vincula um usuário a uma empresa
   - Body: `{ userId, companyId, isDefault }`
   - Automaticamente define como padrão se for a primeira empresa
   - Validação de duplicidade

3. **`DELETE /api/companies/unlink-user/:userId/:companyId`**
   - Remove vínculo entre usuário e empresa
   - Parâmetros: userId e companyId na URL
   - Confirmação necessária no frontend

4. **`POST /api/companies/set-default`**
   - Define uma empresa como padrão para o usuário
   - Body: `{ userId, companyId }`
   - Remove automaticamente o flag de padrão das outras empresas

## 🗂️ Estrutura de Dados

### UserCompany (Tabela `user_companies`)
```typescript
{
  id: number;
  userId: number;
  companyId: number;
  isDefault: boolean;
  company: Company; // Relação com tabela companies
}
```

## 🎯 Como Usar

### 1. Acessar a Página
- **Menu lateral**: "Colaboradores e Empresas" (ícone GroupWork)
- **URL**: `/user-companies`

### 2. Visualizar Dashboard
- **4 Cards no Topo**: Estatísticas gerais do sistema
- **Cores Diferentes**: Cada métrica tem sua cor
- **Atualização Automática**: Ao adicionar/remover vínculos

### 3. Buscar e Filtrar Colaboradores

**Busca:**
1. Digite no campo "Buscar por nome, email ou código..."
2. Resultados filtrados instantaneamente
3. Clique no "X" para limpar a busca

**Filtros:**
1. Ative "Sem Empresas" para ver quem precisa ser vinculado
2. Ative "Múltiplas Empresas" para gestão multi-empresa
3. Combine filtros conforme necessário
4. Veja o contador atualizado ("X de Y colaboradores")

### 4. Adicionar Vínculo de Empresa

1. Localize o colaborador (use busca se necessário)
2. Clique no ícone **"+"** verde na coluna "Ações"
3. **No Dialog**:
   - Veja informações do colaborador selecionado (alert azul)
   - Selecione uma empresa no dropdown
   - (Opcional) Ative "Definir como empresa padrão"
   - Clique em **"Vincular"**
4. Aguarde confirmação (notificação verde)
5. Tabela atualiza automaticamente

### 5. Remover Vínculo

1. Localize o chip da empresa na coluna "Empresas Vinculadas"
2. Clique no ícone **"X"** no chip
3. Confirme a remoção no popup
4. Vínculo é removido imediatamente

### 6. Definir Empresa Padrão

**Método 1 - Na Tabela:**
1. Clique na **estrela vazia** (☆) no chip da empresa
2. Estrela fica **preenchida** (★)
3. Chip muda para cor azul (primária)
4. Empresa é definida como padrão

**Método 2 - Ao Adicionar:**
1. Ao vincular nova empresa
2. Ative o switch "Definir como empresa padrão"
3. Empresa já é criada como padrão

**Comportamento:**
- Apenas uma empresa pode ser padrão
- Ao definir nova padrão, a anterior perde o status
- Empresa padrão é auto-selecionada no login

## 🎨 Interface Visual

### Layout da Página
```
┌──────────────────────────────────────────────────────────────────┐
│  Gestão de Colaboradores e Empresas                              │
│  Gerencie os vínculos entre colaboradores e empresas do sistema  │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │  👤 50  │  │  ✅ 42  │  │  ⚠️  8  │  │  📊 12  │             │
│  │  Total  │  │ C/ Empr │  │ S/ Empr │  │ Múltip. │             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
├──────────────────────────────────────────────────────────────────┤
│  🔍 Buscar... [x]      ☐ Sem Empresas  ☐ Múltiplas Empresas     │
├──────────────────────────────────────────────────────────────────┤
│  # │ Colaborador       │ Código │ Cargo │ Empresas   │ Ações    │
│  ──┼───────────────────┼────────┼───────┼────────────┼──────    │
│  1 │ 👤 João Silva     │ E001   │ ADMIN │ ⭐ Emp A   │   +      │
│    │   joao@email.com  │        │       │ ☆ Emp B[X] │          │
│  2 │ 👤 Maria Santos   │ E002   │ USER  │ ⭐ Emp A   │   +      │
│    │   maria@email.com │        │       │            │          │
└──────────────────────────────────────────────────────────────────┘
                                      Exibindo 2 de 50 colaboradores
```

### Legenda de Elementos
- 👤 **Avatar Circular**: Inicial do nome do colaborador
- ⭐ **Estrela Preenchida**: Empresa padrão (chip azul)
- ☆ **Estrela Vazia**: Clique para definir como padrão
- ❌ **X no Chip**: Remover vínculo da empresa
- ➕ **Botão +**: Adicionar novo vínculo
- 🔍 **Lupa**: Campo de busca
- [X] **Botão X**: Limpar busca
- ☐ **Switch**: Filtros on/off

### Cores dos Chips de Cargo
- 🔴 **Vermelho**: ADMIN
- 🟡 **Amarelo**: MANAGER
- ⚫ **Cinza**: SUPERVISOR, OPERATOR

### Estados da Interface
- **Loading**: Spinner centralizado ao carregar dados
- **Vazio**: Mensagem amigável quando não há dados
- **Sem Resultados**: "Nenhum colaborador encontrado com os filtros"
- **Erro**: Alert vermelho com botão fechar

## 🔄 Fluxo de Login Multi-Empresa

1. **Login Inicial**
   - Usuário fornece email e senha
   - Sistema verifica empresas vinculadas

2. **Cenário A: Múltiplas Empresas**
   - Redirecionamento para `/select-company`
   - Usuário visualiza lista de empresas
   - Empresa padrão pré-selecionada
   - Seleção e confirmação
   - Novo token JWT com `companyId`
   - Redirecionamento para `/dashboard`

3. **Cenário B: Empresa Única**
   - Login direto, sem seleção
   - Token JWT já com `companyId`
   - Acesso imediato ao sistema

4. **Cenário C: Sem Empresas**
   - Usuário sem acesso a nenhuma empresa
   - Mensagem de erro ou tela informativa
   - Contatar administrador

## 🔐 Permissões e Segurança

- **Visualização**: Todos usuários autenticados podem ver
- **Gestão de Vínculos**: Recomendado apenas para ADMIN
- **Validação no Backend**: Todas operações validadas
- **Confirmações**: Remoções requerem confirmação
- **Feedback**: Notificações para todas ações

## 📝 Validações Implementadas

### Adicionar Vínculo
- ✅ Usuário deve existir no sistema
- ✅ Empresa deve existir e estar ativa
- ✅ Vínculo não pode ser duplicado
- ✅ Primeira empresa é automaticamente padrão
- ✅ Empresa já vinculada não aparece na lista

### Remover Vínculo
- ✅ Confirmação obrigatória via popup
- ✅ Vínculo deve existir
- ✅ Feedback visual imediato

### Definir Padrão
- ✅ Apenas uma empresa pode ser padrão por usuário
- ✅ Remove automaticamente flag das outras
- ✅ Atualização visual instantânea (estrela + cor)

## 🚀 Recursos Técnicos

### Performance
- **Carregamento Paralelo**: Usuários e empresas em Promise.all
- **Memoização**: useMemo para filtros e estatísticas
- **Renderização Otimizada**: Apenas re-renderiza quando necessário

### Responsividade
- **Grid System**: Material-UI Grid para layout adaptativo
- **Breakpoints**: xs, sm, md para diferentes telas
- **Cards Empilháveis**: Em telas menores, cards empilham verticalmente

### UX/UI
- **Feedback Imediato**: Notificações para todas ações
- **Loading States**: Spinners durante operações
- **Disabled States**: Botões desabilitados quando apropriado
- **Tooltips**: Ajuda contextual em hover
- **Confirmações**: Para ações destrutivas

## 📊 Dados de Teste

Para testar o sistema multi-empresa, execute:

```sql
-- Execute o script SETUP_MULTI_EMPRESA_TESTE.sql
-- Cria 2 empresas de teste e vincula ao usuário admin
```

## 🐛 Troubleshooting

### Problema: Não mostra empresas disponíveis no dialog
**Causa**: Colaborador já vinculado a todas as empresas
**Solução**: Criar mais empresas ou remover vínculos existentes

### Problema: Estatísticas não atualizam
**Causa**: Cache de dados
**Solução**: Recarregar a página (F5) ou aguardar próximo carregamento

### Problema: Erro ao definir padrão
**Causa**: Problema de comunicação com backend
**Solução**: Verificar console do navegador e logs do backend

### Problema: Busca não funciona
**Causa**: Dados não carregados
**Solução**: Verificar se há erro no carregamento inicial

## 📁 Arquivos Criados/Modificados

### Frontend
- ✅ `frontend/src/pages/UserCompanies.tsx` (NOVO - Versão Profissional)
- ✅ `frontend/src/App.tsx` (adicionada rota)
- ✅ `frontend/src/components/Layout/MenuItems.tsx` (adicionado item de menu)

### Backend
- ✅ `backend/src/routes/companyRoutes.ts` (rota getUserCompanies)
- ✅ `backend/src/controllers/companyController.ts` (controller getUserCompanies)

### Documentação
- ✅ `VINCULO_COLABORADORES_EMPRESAS.md` (este arquivo)

## 🎯 Melhorias Futuras Sugeridas

### Curto Prazo
1. ✨ Paginação da tabela (para muitos colaboradores)
2. ✨ Ordenação por colunas (nome, código, quantidade de empresas)
3. ✨ Filtro por cargo (dropdown)
4. ✨ Ação em lote (vincular múltiplos usuários a uma empresa)

### Médio Prazo
1. 📊 Exportação para Excel/PDF
2. 📥 Importação em massa via CSV
3. 📜 Histórico de alterações de vínculos
4. 🔔 Notificações quando vínculo é alterado

### Longo Prazo
1. 🌐 Permissões específicas por empresa
2. 📅 Vínculos com data de validade
3. 👥 Grupos de empresas
4. 📊 Dashboard analytics de acessos por empresa

---

## 📌 Resumo

**Status**: ✅ Completo e Funcional  
**Versão**: 2.0 Profissional  
**Data**: 22/10/2024  
**Desenvolvedor**: Sistema MES  

**Principais Diferenciais:**
- Interface moderna e profissional
- Dashboard com estatísticas em tempo real
- Sistema de busca e filtros avançados
- UX otimizada com feedback visual
- Design system consistente
- Performance otimizada
- Código limpo e manutenível

**Tecnologias:**
- React 18+
- Material-UI 5+
- TypeScript
- React Hooks (useState, useEffect, useMemo)
- Notistack (notificações)
- Axios (API calls)
