# 📋 Atualização: Permissões Ordenadas e Alertas de Manutenção

## ✅ Alterações Implementadas

### 1. **Frontend - Ordenação Alfabética A-Z**

**Arquivo**: `frontend/src/pages/Permissions.tsx`

#### O que foi feito:
- Adicionada ordenação alfabética (A-Z) dos recursos na tela de permissões
- A ordenação é baseada no **label** (nome em português) e não na chave técnica
- Utiliza `localeCompare` para ordenação correta em português (com acentuação)

#### Código implementado:
```typescript
// Ordenar recursos por ordem alfabética (A-Z) baseado no label
const resources = Object.keys(resourceLabels).sort((a, b) => {
  const labelA = resourceLabels[a].toLowerCase();
  const labelB = resourceLabels[b].toLowerCase();
  return labelA.localeCompare(labelB);
});
```

#### Resultado visual:
A tela agora mostra os recursos ordenados assim:
1. Alertas de Manutenção
2. Apontamento Manual
3. Colaboradores
4. Colaboradores e Empresas
5. Configuração CLP
6. Configuração de E-mail
7. Dashboard
8. Defeitos
9. Empresas
10. Injetoras
11. Itens/Produtos
12. Moldes
13. Ordens de Produção
14. Paradas
15. Permissões
16. Relatórios
17. Setores
18. Tipos de Atividade
19. Tipos de Referência

---

### 2. **Backend - Recursos Adicionados às Permissões Padrão**

**Arquivo**: `backend/src/controllers/rolePermissionController.ts`

#### Recursos adicionados:
- ✅ `maintenance_alerts` - Alertas de Manutenção
- ✅ `email_config` - Configuração de E-mail
- ✅ `user_companies` - Colaboradores e Empresas
- ✅ `permissions` - Permissões
- ✅ `manual_posting` - Apontamento Manual

#### Array completo de recursos (ordenado A-Z):
```typescript
const resources = [
  'activity_types',      // Tipos de Atividade
  'companies',           // Empresas
  'dashboard',           // Dashboard
  'defects',             // Defeitos
  'downtimes',           // Paradas
  'email_config',        // Configuração de E-mail (NOVO)
  'injectors',           // Injetoras
  'items',               // Itens/Produtos
  'maintenance_alerts',  // Alertas de Manutenção (NOVO)
  'manual_posting',      // Apontamento Manual (NOVO)
  'molds',               // Moldes
  'permissions',         // Permissões (NOVO)
  'plc_config',          // Configuração CLP
  'production',          // Produção
  'production_orders',   // Ordens de Produção
  'production_posting',  // Apontamento de Produção
  'reference_types',     // Tipos de Referência
  'reports',             // Relatórios
  'sectors',             // Setores
  'user_companies',      // Colaboradores e Empresas (NOVO)
  'users',               // Colaboradores
];
```

---

### 3. **Permissões Padrão por Perfil**

#### 🔴 **ADMIN** - Acesso Total
- ✅ **Todos os recursos**: Visualizar, Criar, Editar, Excluir

#### 🟠 **DIRECTOR** (Diretoria) - Visualização Total
- ✅ **Todos os recursos**: Visualizar
- ✅ **Maioria dos recursos**: Criar e Editar
- ❌ **Restrições**: Não pode gerenciar usuários nem configurar CLP
- ❌ **Não pode excluir nada**

#### 🔵 **MANAGER** (Gerente) - Gestão Operacional
- ✅ **Todos os recursos**: Visualizar
- ✅ **Operacionais**: Criar e Editar (ordens, moldes, itens, etc.)
- ✅ **Pode excluir**: Paradas, Apontamentos
- ❌ **Restrições**: Usuários, Empresas, Permissões, CLP

#### 🟢 **SUPERVISOR** - Supervisão Operacional
- ✅ **Visualizar**: Dashboard, Ordens, Moldes, Itens, Alertas, etc.
- ✅ **Criar**: Ordens, Apontamentos, Paradas, Defeitos
- ✅ **Editar**: Ordens, Apontamentos, Paradas, Itens, Moldes
- ✅ **Excluir**: Paradas, Apontamentos
- ❌ **Restrições**: Usuários, Permissões, Configurações de Sistema

#### 🟡 **LEADER** (Líder) - Chão de Fábrica
- ✅ **Visualizar**: Dashboard, Produção, Ordens, Moldes, Itens
- ✅ **Criar**: Apontamentos, Paradas, Defeitos
- ✅ **Editar**: Apontamentos, Paradas, Ordens
- ❌ **Não pode excluir nada**
- ❌ **Restrições**: Usuários, Configurações, Alertas

#### 🔵 **OPERATOR** (Operador) - Operações Básicas
- ✅ **Visualizar**: Dashboard, Injetoras, Produção
- ✅ **Criar**: Apontamentos (Manual e Automático)
- ❌ **Não pode editar nem excluir**
- ❌ **Acesso limitado** apenas ao essencial para produção

---

## 📊 Comparação: Antes vs Depois

### Antes
- ❌ Lista de recursos desordenada (ordem de declaração)
- ❌ Faltavam recursos nas permissões padrão:
  - `maintenance_alerts`
  - `email_config`
  - `user_companies`
  - `permissions`
  - `manual_posting`
- ❌ Difícil encontrar recursos específicos na lista
- ❌ Permissões incompletas para novos recursos

### Depois
- ✅ Lista ordenada alfabeticamente (A-Z)
- ✅ Todos os recursos incluídos nas permissões
- ✅ Fácil localização de qualquer recurso
- ✅ Permissões completas e consistentes
- ✅ Hierarquia clara entre perfis
- ✅ Alertas de Manutenção configurados corretamente

---

## 🚀 Como Aplicar as Alterações

### 1. **Reinicializar Permissões Padrão**

Para aplicar as novas permissões no banco de dados:

1. Acesse a tela de **Permissões** no sistema
2. Clique no botão **"Restaurar Padrão"**
3. Confirme a ação
4. As permissões serão recriadas com os novos recursos

**OU** via API:
```bash
POST http://localhost:3001/api/permissions/initialize
```

### 2. **Verificar Ordenação**

1. Acesse **Permissões** no menu
2. Selecione qualquer perfil (ADMIN, MANAGER, etc.)
3. Verifique que a lista está ordenada alfabeticamente
4. Confirme que "Alertas de Manutenção" aparece no topo

---

## 📝 Recursos por Categoria (no Menu Lateral)

### 🏭 Operacional
- Apontamento Manual (`manual_posting`)
- Injetoras (`injectors`)
- Ordens de Produção (`production_orders`)
- Paradas (`downtimes`)

### 📁 Cadastros
- Defeitos (`defects`)
- Empresas (`companies`)
- Itens/Produtos (`items`)
- Moldes (`molds`)
- Setores (`sectors`)
- Tipos de Atividade (`activity_types`)
- Tipos de Referência (`reference_types`)

### ⚙️ Administração
- Alertas de Manutenção (`maintenance_alerts`) **✨ NOVO**
- Colaboradores (`users`)
- Colaboradores e Empresas (`user_companies`)
- Configuração CLP (`plc_config`)
- Configuração de E-mail (`email_config`) **✨ NOVO**
- Permissões (`permissions`)

### 📊 Sistema
- Dashboard (`dashboard`)
- Produção (`production`)
- Relatórios (`reports`)

---

## 🎯 Benefícios

1. **Melhor UX**: Usuários encontram recursos mais rapidamente
2. **Consistência**: Todos os recursos têm permissões definidas
3. **Segurança**: Hierarquia clara de acessos por perfil
4. **Manutenibilidade**: Código organizado e documentado
5. **Completude**: Nenhum recurso fica sem permissões

---

## 🔧 Detalhes Técnicos

### Ordenação com `localeCompare`
```typescript
// Respeita acentuação e caracteres especiais do português
labelA.localeCompare(labelB)
```

### Permissões Hierárquicas
```
ADMIN > DIRECTOR > MANAGER > SUPERVISOR > LEADER > OPERATOR
  ↓         ↓          ↓           ↓          ↓         ↓
Total   Consulta   Gestão      Supervisão   Chão    Básico
```

### Recursos Sensíveis
- `users` - Apenas ADMIN
- `permissions` - Apenas ADMIN
- `plc_config` - Apenas ADMIN
- `email_config` - ADMIN e MANAGER
- `maintenance_alerts` - ADMIN, MANAGER e SUPERVISOR

---

## ✅ Checklist de Verificação

- [x] Frontend: Recursos ordenados A-Z
- [x] Backend: Todos os recursos incluídos
- [x] Backend: Permissões por perfil configuradas
- [x] Backend: SUPERVISOR adicionado às permissões
- [x] Documentação criada
- [x] Sem erros de linter
- [ ] Testar tela de permissões no navegador
- [ ] Restaurar permissões padrão no sistema
- [ ] Verificar acesso aos Alertas de Manutenção

---

**Data de Implementação**: 23 de Outubro de 2024  
**Versão**: 1.1.0  
**Desenvolvido para**: MES - Sistema de Execução de Manufatura

