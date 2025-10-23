-- Script de Validação dos KPIs após Ajustes de Apontamentos Manuais
-- Execute este script para verificar se os cálculos estão corretos

-- ============================================================================
-- 1. VERIFICAÇÃO GERAL - Resumo de Todos os Apontamentos
-- ============================================================================

SELECT 
  'Resumo Geral de Apontamentos' as secao,
  COUNT(*) as total_apontamentos,
  COUNT(CASE WHEN automatic = true THEN 1 END) as apontamentos_automaticos,
  COUNT(CASE WHEN automatic = false THEN 1 END) as apontamentos_manuais,
  
  -- Total de peças (lógica correta)
  SUM(CASE 
    WHEN automatic = true THEN "clpCounterValue" 
    ELSE quantity 
  END) as total_pecas_produzidas,
  
  -- Total de tempo manual
  SUM(CASE WHEN automatic = false THEN "durationSeconds" ELSE 0 END) as tempo_total_manual_segundos,
  
  -- Média de tempo por apontamento manual
  AVG(CASE WHEN automatic = false THEN "durationSeconds" END) as media_tempo_manual
FROM production_appointments;

-- ============================================================================
-- 2. COMPARAÇÃO - Método Antigo vs Novo
-- ============================================================================

SELECT 
  'Comparação de Métodos' as secao,
  
  -- MÉTODO ANTIGO (errado - só clpCounterValue)
  SUM("clpCounterValue") as pecas_metodo_antigo,
  
  -- MÉTODO NOVO (correto - automático + manual)
  SUM(CASE 
    WHEN automatic = true THEN "clpCounterValue" 
    ELSE quantity 
  END) as pecas_metodo_novo,
  
  -- Diferença
  SUM(CASE 
    WHEN automatic = true THEN "clpCounterValue" 
    ELSE quantity 
  END) - SUM("clpCounterValue") as diferenca_pecas
FROM production_appointments;

-- ============================================================================
-- 3. APONTAMENTOS MANUAIS - Detalhamento
-- ============================================================================

SELECT 
  'Detalhamento Apontamentos Manuais' as secao,
  COUNT(*) as quantidade_apontamentos_manuais,
  SUM(quantity) as total_pecas_manuais,
  SUM("durationSeconds") as total_segundos,
  ROUND(SUM("durationSeconds")::numeric / 3600, 2) as total_horas,
  AVG(quantity) as media_pecas_por_apontamento,
  AVG("durationSeconds") as media_segundos_por_apontamento
FROM production_appointments
WHERE automatic = false;

-- ============================================================================
-- 4. APONTAMENTOS AUTOMÁTICOS - Detalhamento
-- ============================================================================

SELECT 
  'Detalhamento Apontamentos Automáticos' as secao,
  COUNT(*) as quantidade_apontamentos_automaticos,
  SUM("clpCounterValue") as total_pecas_automaticas,
  AVG("clpCounterValue") as media_pecas_por_apontamento,
  -- quantity é tempo de ciclo nos automáticos
  AVG(quantity) as media_tempo_ciclo_unidades
FROM production_appointments
WHERE automatic = true;

-- ============================================================================
-- 5. DEFEITOS/PERDAS - Validação
-- ============================================================================

SELECT 
  'Validação de Defeitos' as secao,
  COUNT(*) as total_registros_defeitos,
  SUM(quantity) as total_pecas_rejeitadas,
  COUNT(DISTINCT "productionOrderId") as ordens_com_defeitos
FROM production_defects;

-- ============================================================================
-- 6. POR ORDEM DE PRODUÇÃO - Top 5 Ordens
-- ============================================================================

SELECT 
  'Top 5 Ordens com Mais Produção' as secao,
  po."orderNumber",
  po."plannedQuantity" as planejado,
  po."producedQuantity" as produzido_ordem,
  
  -- Cálculo correto de peças dos apontamentos
  SUM(CASE 
    WHEN pa.automatic = true THEN pa."clpCounterValue" 
    ELSE pa.quantity 
  END) as pecas_apontamentos,
  
  -- Apontamentos manuais
  COUNT(CASE WHEN pa.automatic = false THEN 1 END) as apontamentos_manuais,
  
  -- Tempo total manual
  SUM(CASE WHEN pa.automatic = false THEN pa."durationSeconds" ELSE 0 END) as tempo_manual_seg,
  
  -- Defeitos
  COALESCE(SUM(pd.quantity), 0) as pecas_rejeitadas
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
LEFT JOIN production_defects pd ON pd."productionOrderId" = po.id
GROUP BY po.id, po."orderNumber", po."plannedQuantity", po."producedQuantity"
ORDER BY pecas_apontamentos DESC NULLS LAST
LIMIT 5;

-- ============================================================================
-- 7. APONTAMENTOS COM TEMPO MANUAL - Últimos 10
-- ============================================================================

SELECT 
  'Últimos 10 Apontamentos Manuais' as secao,
  pa.id,
  po."orderNumber",
  pa.quantity as pecas,
  pa."durationSeconds" as segundos,
  CONCAT(
    FLOOR(pa."durationSeconds" / 3600), 'h ',
    FLOOR((pa."durationSeconds" % 3600) / 60), 'm ',
    (pa."durationSeconds" % 60), 's'
  ) as tempo_formatado,
  pa.timestamp
FROM production_appointments pa
JOIN production_orders po ON po.id = pa."productionOrderId"
WHERE pa.automatic = false
  AND pa."durationSeconds" IS NOT NULL
ORDER BY pa.timestamp DESC
LIMIT 10;

-- ============================================================================
-- 8. VALIDAÇÃO DE DADOS - Inconsistências
-- ============================================================================

-- Apontamentos manuais sem tempo (durationSeconds NULL)
SELECT 
  'Apontamentos Manuais SEM Tempo' as alerta,
  COUNT(*) as quantidade,
  SUM(quantity) as pecas_afetadas
FROM production_appointments
WHERE automatic = false
  AND ("durationSeconds" IS NULL OR "durationSeconds" = 0);

-- Apontamentos automáticos sem clpCounterValue
SELECT 
  'Apontamentos Automáticos SEM clpCounterValue' as alerta,
  COUNT(*) as quantidade
FROM production_appointments
WHERE automatic = true
  AND ("clpCounterValue" IS NULL OR "clpCounterValue" = 0);

-- ============================================================================
-- 9. KPI FINAL - Simulação Dashboard
-- ============================================================================

SELECT 
  'KPI Dashboard Principal' as secao,
  
  -- Total de peças produzidas (método correto)
  SUM(CASE 
    WHEN pa.automatic = true THEN pa."clpCounterValue" 
    ELSE pa.quantity 
  END) as total_produzido,
  
  -- Total de defeitos
  COALESCE((SELECT SUM(quantity) FROM production_defects), 0) as total_rejeitado,
  
  -- Taxa de qualidade
  ROUND(
    (
      SUM(CASE 
        WHEN pa.automatic = true THEN pa."clpCounterValue" 
        ELSE pa.quantity 
      END) - COALESCE((SELECT SUM(quantity) FROM production_defects), 0)
    ) * 100.0 / 
    NULLIF(SUM(CASE 
      WHEN pa.automatic = true THEN pa."clpCounterValue" 
      ELSE pa.quantity 
    END), 0),
    2
  ) as taxa_qualidade_pct,
  
  -- Totais de apontamentos
  COUNT(*) as total_apontamentos,
  COUNT(CASE WHEN pa.automatic = false THEN 1 END) as apontamentos_manuais,
  COUNT(CASE WHEN pa.automatic = true THEN 1 END) as apontamentos_automaticos,
  
  -- Tempo total manual
  SUM(CASE WHEN pa.automatic = false THEN pa."durationSeconds" ELSE 0 END) as tempo_manual_segundos
FROM production_appointments pa;

-- ============================================================================
-- 10. RESUMO POR ITEM - Top 5 Itens Mais Produzidos
-- ============================================================================

SELECT 
  'Top 5 Itens Mais Produzidos' as secao,
  i.code as codigo_item,
  i.name as nome_item,
  
  -- Total de peças (método correto)
  SUM(CASE 
    WHEN pa.automatic = true THEN pa."clpCounterValue" 
    ELSE pa.quantity 
  END) as total_produzido,
  
  -- Defeitos
  COALESCE(SUM(pd.quantity), 0) as total_rejeitado,
  
  -- Taxa de qualidade
  ROUND(
    (
      SUM(CASE 
        WHEN pa.automatic = true THEN pa."clpCounterValue" 
        ELSE pa.quantity 
      END) - COALESCE(SUM(pd.quantity), 0)
    ) * 100.0 / 
    NULLIF(SUM(CASE 
      WHEN pa.automatic = true THEN pa."clpCounterValue" 
      ELSE pa.quantity 
    END), 0),
    2
  ) as taxa_qualidade_pct
FROM items i
JOIN production_orders po ON po."itemId" = i.id
JOIN production_appointments pa ON pa."productionOrderId" = po.id
LEFT JOIN production_defects pd ON pd."productionOrderId" = po.id
GROUP BY i.id, i.code, i.name
ORDER BY total_produzido DESC
LIMIT 5;

-- ============================================================================
-- FIM DO SCRIPT DE VALIDAÇÃO
-- ============================================================================

