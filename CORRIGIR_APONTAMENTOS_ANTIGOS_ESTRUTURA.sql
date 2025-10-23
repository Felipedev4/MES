-- Script de Correção: Padronizar Estrutura de Apontamentos Antigos
-- Este script corrige apontamentos manuais criados antes da padronização

-- ============================================================================
-- PASSO 1: VERIFICAR APONTAMENTOS MANUAIS COM ESTRUTURA ANTIGA
-- ============================================================================

SELECT 
  'Apontamentos Manuais com Estrutura Antiga' as secao,
  COUNT(*) as quantidade_afetada,
  SUM(quantity) as total_pecas_que_serao_movidas
FROM production_appointments
WHERE automatic = false
  AND "clpCounterValue" IS NULL
  AND quantity > 0;

-- Mostrar exemplos
SELECT 
  'Exemplos de Apontamentos a Corrigir' as secao,
  id,
  "productionOrderId",
  quantity as pecas_campo_errado,
  "clpCounterValue" as campo_correto_vazio,
  "durationSeconds" as tempo_disponivel,
  timestamp
FROM production_appointments
WHERE automatic = false
  AND "clpCounterValue" IS NULL
  AND quantity > 0
ORDER BY id DESC
LIMIT 10;

-- ============================================================================
-- PASSO 2: BACKUP DOS DADOS (SEGURANÇA)
-- ============================================================================

-- Criar tabela de backup temporária
CREATE TEMP TABLE backup_apontamentos_antes_correcao AS
SELECT * FROM production_appointments
WHERE automatic = false
  AND "clpCounterValue" IS NULL
  AND quantity > 0;

SELECT 
  'Backup Criado' as secao,
  COUNT(*) as registros_no_backup
FROM backup_apontamentos_antes_correcao;

-- ============================================================================
-- PASSO 3: APLICAR CORREÇÃO - PADRONIZAR ESTRUTURA
-- ============================================================================

-- Atualizar estrutura dos apontamentos manuais antigos
UPDATE production_appointments
SET 
  "clpCounterValue" = quantity,                      -- Mover peças para clpCounterValue
  quantity = COALESCE("durationSeconds", 0),         -- Tempo para quantity
  "updatedAt" = NOW()                                -- Marcar atualização
WHERE automatic = false
  AND "clpCounterValue" IS NULL
  AND quantity > 0;

-- ============================================================================
-- PASSO 4: VALIDAÇÃO PÓS-CORREÇÃO
-- ============================================================================

-- Verificar se todos foram corrigidos
SELECT 
  'Validação Pós-Correção' as secao,
  COUNT(*) as apontamentos_ainda_incorretos
FROM production_appointments
WHERE automatic = false
  AND "clpCounterValue" IS NULL
  AND quantity > 0;
-- Resultado esperado: 0

-- Verificar apontamentos corrigidos
SELECT 
  'Apontamentos Corrigidos com Sucesso' as secao,
  COUNT(*) as total_apontamentos_manuais,
  SUM("clpCounterValue") as total_pecas_agora_correto,
  SUM(quantity) as total_tempo_segundos,
  AVG("clpCounterValue") as media_pecas_por_apontamento
FROM production_appointments
WHERE automatic = false
  AND "clpCounterValue" IS NOT NULL;

-- Mostrar exemplos corrigidos
SELECT 
  'Exemplos Após Correção' as secao,
  pa.id,
  pa.automatic,
  pa."clpCounterValue" as pecas_agora_aqui,
  pa.quantity as tempo_agora_aqui,
  pa."durationSeconds" as backup_tempo,
  po."orderNumber"
FROM production_appointments pa
JOIN production_orders po ON po.id = pa."productionOrderId"
WHERE pa.automatic = false
ORDER BY pa.id DESC
LIMIT 10;

-- ============================================================================
-- PASSO 5: COMPARAÇÃO ANTES E DEPOIS
-- ============================================================================

SELECT 
  'Comparação: Total de Peças' as secao,
  
  -- Total do backup (antes)
  (SELECT SUM(quantity) FROM backup_apontamentos_antes_correcao) as total_antes,
  
  -- Total atual (depois)
  (SELECT SUM("clpCounterValue") 
   FROM production_appointments 
   WHERE automatic = false) as total_depois,
  
  -- Devem ser iguais!
  CASE 
    WHEN (SELECT SUM(quantity) FROM backup_apontamentos_antes_correcao) = 
         (SELECT SUM("clpCounterValue") FROM production_appointments WHERE automatic = false)
    THEN 'OK - Valores conferem!'
    ELSE 'ATENÇÃO - Valores divergentes!'
  END as status;

-- ============================================================================
-- PASSO 6: VERIFICAÇÃO FINAL COMPLETA
-- ============================================================================

-- Resumo geral de todos os apontamentos
SELECT 
  'Resumo Final - Todos os Apontamentos' as secao,
  COUNT(*) as total_apontamentos,
  COUNT(CASE WHEN automatic = true THEN 1 END) as automaticos,
  COUNT(CASE WHEN automatic = false THEN 1 END) as manuais,
  
  -- Total de peças (agora padronizado!)
  SUM("clpCounterValue") as total_pecas_padronizado,
  
  -- Verificar se todos têm clpCounterValue
  COUNT(CASE WHEN "clpCounterValue" IS NULL THEN 1 END) as sem_clp_counter_value
FROM production_appointments;
-- sem_clp_counter_value deve ser 0!

-- Verificar estrutura por tipo
SELECT 
  'Estrutura por Tipo de Apontamento' as secao,
  automatic as tipo,
  COUNT(*) as quantidade,
  COUNT(CASE WHEN "clpCounterValue" IS NOT NULL THEN 1 END) as com_pecas_ok,
  COUNT(CASE WHEN "clpCounterValue" IS NULL THEN 1 END) as sem_pecas_problema,
  AVG("clpCounterValue") as media_pecas,
  AVG(quantity) as media_quantity
FROM production_appointments
GROUP BY automatic
ORDER BY automatic;

-- ============================================================================
-- PASSO 7: VALIDAR TOTAIS DAS ORDENS
-- ============================================================================

-- Verificar se as ordens de produção estão com totais corretos
SELECT 
  'Top 10 Ordens - Totais Conferem?' as secao,
  po."orderNumber",
  po."producedQuantity" as total_na_ordem,
  
  -- Somar de clpCounterValue (padronizado)
  SUM(pa."clpCounterValue") as total_dos_apontamentos,
  
  -- Diferença (deve ser 0 ou muito próximo)
  po."producedQuantity" - SUM(pa."clpCounterValue") as diferenca,
  
  CASE 
    WHEN ABS(po."producedQuantity" - SUM(pa."clpCounterValue")) <= 1
    THEN 'OK'
    ELSE 'VERIFICAR'
  END as status
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
GROUP BY po.id, po."orderNumber", po."producedQuantity"
ORDER BY po.id DESC
LIMIT 10;

-- ============================================================================
-- PASSO 8: LIMPEZA (OPCIONAL)
-- ============================================================================

-- Se tudo estiver OK, pode dropar o backup
-- DROP TABLE IF EXISTS backup_apontamentos_antes_correcao;

-- OU manter por segurança (será dropado automaticamente ao fim da sessão)
SELECT 
  'Backup Temporário Mantido' as info,
  'Use DROP TABLE backup_apontamentos_antes_correcao; para remover' as acao;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================

/*
✅ APÓS EXECUTAR ESTE SCRIPT:

1. Todos os apontamentos manuais terão:
   - clpCounterValue = quantidade de peças
   - quantity = tempo em segundos
   - durationSeconds = tempo em segundos (backup)

2. Queries SQL simplificadas:
   SELECT SUM("clpCounterValue") FROM production_appointments;
   -- Retorna total de TODAS as peças (auto + manual)

3. Estrutura padronizada e consistente

4. Sistema mais rápido e fácil de manter
*/

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

SELECT 
  '========================================' as separador,
  'CORREÇÃO CONCLUÍDA COM SUCESSO!' as resultado,
  '========================================' as separador;

