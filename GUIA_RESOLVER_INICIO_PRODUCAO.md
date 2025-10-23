# Guia: Resolver Problema ao Iniciar Apontamento de Produção

## 📋 Possíveis Causas

### 1. **Setup Ativo Não Finalizado**
- **Problema**: Existe um setup ativo que não foi finalizado
- **Solução**: Finalizar o setup antes de iniciar a produção
- **Como verificar**: Execute o script `DIAGNOSTICO_INICIO_PRODUCAO.sql` (seção 5)

### 2. **Já Existe Ordem ACTIVE no Mesmo CLP**
- **Problema**: Já existe outra ordem em atividade no mesmo CLP/Injetora
- **Solução**: Pausar ou finalizar a ordem ativa antes de iniciar outra
- **Como verificar**: Execute o script `DIAGNOSTICO_INICIO_PRODUCAO.sql` (seção 2)

### 3. **Ordem Sem CLP Vinculado**
- **Problema**: A ordem não tem um CLP vinculado e existe outra ordem ativa
- **Solução**: Vincular um CLP à ordem ou finalizar a ordem ativa existente
- **Como verificar**: Execute o script `DIAGNOSTICO_INICIO_PRODUCAO.sql` (seção 3)

### 4. **Erro de Permissões**
- **Problema**: O usuário não tem permissão para iniciar produção
- **Solução**: Verificar se o usuário tem role: ADMIN, MANAGER, SUPERVISOR ou OPERATOR
- **Como verificar**: Verifique no menu Usuários as permissões do colaborador

### 5. **Backend Não Está Rodando ou Rota Não Carregada**
- **Problema**: O endpoint `/production-orders/:id/start-production` não está disponível
- **Solução**: Reiniciar o backend
- **Como verificar**: Abra o console do navegador (F12) e veja o erro exato

## 🔧 Passos para Resolver

### Passo 1: Verificar Console do Navegador
1. Abra o navegador (Chrome/Edge)
2. Pressione F12 para abrir DevTools
3. Vá na aba "Console"
4. Tente iniciar a produção novamente
5. **Copie o erro exato que aparece**

### Passo 2: Verificar Banco de Dados
Execute o script de diagnóstico:
```powershell
psql -U postgres -d mes_development -f DIAGNOSTICO_INICIO_PRODUCAO.sql
```

### Passo 3: Verificar Logs do Backend
Verifique se há erros no console onde o backend está rodando.

### Passo 4: Soluções Específicas

#### Se o erro for "Setup ativo encontrado"
```sql
-- Finalizar setup manualmente (substitua X pelo ID do setup)
UPDATE downtimes 
SET "endTime" = NOW(), 
    duration = EXTRACT(EPOCH FROM (NOW() - "startTime"))::INTEGER
WHERE id = X AND type = 'SETUP' AND "endTime" IS NULL;
```

#### Se o erro for "Já existe ordem ativa"
```sql
-- Ver qual ordem está ativa
SELECT id, "orderNumber", status, "plcConfigId" 
FROM production_orders 
WHERE status = 'ACTIVE';

-- Pausar ordem ativa (substitua X pelo ID da ordem)
UPDATE production_orders SET status = 'PAUSED' WHERE id = X;
```

#### Se o erro for 404 ou endpoint não encontrado
```powershell
# Reiniciar backend
cd backend
npm run dev
```

## 📞 Me Informe

Para eu poder ajudar melhor, me informe:
1. **Qual o erro exato** que aparece no console do navegador (F12)?
2. **Qual o número da ordem** que você está tentando iniciar?
3. **Qual o status atual** da ordem (PROGRAMMING, PAUSED, etc)?
4. **Tem setup ativo** na ordem?

Com essas informações, posso identificar e resolver o problema específico! 🚀

