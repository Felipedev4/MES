# Guia Completo: Sistema de Apontamentos de Produção

## 🎯 Estados da Ordem e Ações Disponíveis

### 1. **PROGRAMMING** (Programação)
- **Ação Disponível**: Iniciar Setup ou Iniciar Produção
- **Botão no Card "Parada"**: "Iniciar Produção"
- **Endpoint**: `POST /api/production-orders/:id/start-production`
- **Resultado**: Ordem muda para **ACTIVE**

### 2. **ACTIVE** (Em Atividade)
- **Ação Disponível**: Registrar Parada
- **Botão no Card "Parada"**: "Registrar Parada"
- **Endpoint**: `POST /api/downtimes/register-stop`
- **Resultado**: Ordem muda para **PAUSED** + cria Downtime ativo
- **Apontamentos**: Podem ser registrados automaticamente pelo CLP ou manualmente

### 3. **PAUSED** (Pausada)
- **Ação Disponível**: Retomar Produção
- **Botão no Card "Parada"**: "Retomar Produção"
- **Endpoint**: `POST /api/downtimes/resume-production`
- **Requisito**: **DEVE** existir um Downtime ativo (sem endTime)
- **Resultado**: Ordem muda para **ACTIVE** + finaliza Downtime ativo

### 4. **FINISHED** (Encerrada)
- **Ação Disponível**: Apenas visualização
- **Sem ações**: Ordem finalizada

---

## 🔴 Problema Encontrado e Corrigido

### Problema
- **Ordem**: OP-2025-001 (ID: 1)
- **Status**: PAUSED
- **Downtime Ativo**: ❌ NÃO existia
- **Erro**: "Nenhuma parada ativa encontrada para esta ordem"

### Causa
Ordem foi pausada sem registrar um downtime, causando inconsistência.

### Solução Aplicada
```sql
UPDATE production_orders 
SET status = 'ACTIVE'
WHERE id = 1;
```
✅ Ordem retomada e agora está **ACTIVE**

---

## 📝 Como Funciona o Fluxo Correto

### Iniciar Produção (primeira vez)
1. Ordem em **PROGRAMMING**
2. Clicar no card **"Parada"**
3. Confirmar "Iniciar Produção"
4. Ordem muda para **ACTIVE**
5. Agora pode receber apontamentos

### Pausar Produção
1. Ordem em **ACTIVE**
2. Clicar no card **"Parada"**
3. Selecionar tipo de atividade (ex: "Falta de Matéria-Prima")
4. Informar data/hora de início da parada
5. Confirmar "Gravar Registro"
6. Ordem muda para **PAUSED** + cria Downtime ativo

### Retomar Produção
1. Ordem em **PAUSED** (com downtime ativo)
2. Clicar no card **"Parada"**
3. Confirmar "Retomar Produção"
4. Downtime ativo é finalizado
5. Ordem muda para **ACTIVE**

---

## 🚨 Problemas Comuns

### "Nenhuma parada ativa encontrada"
**Causa**: Ordem PAUSED sem downtime ativo  
**Solução**: Execute o script `DIAGNOSTICO_ORDEM_PAUSED_SEM_DOWNTIME.sql` e depois `CORRIGIR_OP_2025_001_AGORA.sql`

### "Já existe uma ordem em atividade neste CLP"
**Causa**: Só pode haver 1 ordem ACTIVE por CLP/Injetora  
**Solução**: Pause ou finalize a ordem ativa antes de iniciar outra

### Ordem não recebe apontamentos automáticos
**Causa**: Ordem não está em ACTIVE ou CLP não está configurado  
**Solução**: Certifique-se que a ordem está ACTIVE e o CLP está conectado

---

## 🔧 Scripts Úteis

### Verificar status de todas as ordens
```sql
SELECT id, "orderNumber", status, "startDate", "endDate"
FROM production_orders
WHERE status IN ('PROGRAMMING', 'ACTIVE', 'PAUSED')
ORDER BY id DESC;
```

### Verificar downtimes ativos
```sql
SELECT 
    d.id,
    po."orderNumber",
    d.type,
    at.name as activity_name,
    d."startTime",
    d."endTime"
FROM downtimes d
JOIN production_orders po ON d."productionOrderId" = po.id
LEFT JOIN activity_types at ON d."activityTypeId" = at.id
WHERE d."endTime" IS NULL
ORDER BY d."startTime" DESC;
```

---

## ✅ Próximos Passos

1. **Atualize a página do navegador** (F5)
2. A ordem **OP-2025-001** agora deve estar **ACTIVE**
3. Você pode registrar apontamentos normalmente
4. Para pausar novamente, use o card "Parada" → "Registrar Parada"

Se tiver mais problemas, me avise! 🚀

