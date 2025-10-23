-- Script de Correção: Ordens PAUSED sem Downtime Ativo
-- ATENÇÃO: Execute o DIAGNOSTICO primeiro para identificar as ordens com problema

-- OPÇÃO 1: Mudar ordem PAUSED para ACTIVE (retomar sem registrar parada)
-- Use esta opção se a ordem deveria estar ativa
-- SUBSTITUA X pelo ID da ordem

-- UPDATE production_orders 
-- SET status = 'ACTIVE' 
-- WHERE id = X AND status = 'PAUSED';

-- OPÇÃO 2: Criar um downtime ativo para a ordem PAUSED
-- Use esta opção se realmente houve uma parada mas não foi registrada
-- SUBSTITUA:
--   X = ID da ordem de produção
--   Y = ID do tipo de atividade (ex: 1 para "Parada Não Programada")
--   'YYYY-MM-DD HH:MI:SS' = data/hora do início da parada

-- INSERT INTO downtimes (
--     "productionOrderId",
--     "activityTypeId",
--     type,
--     reason,
--     "startTime",
--     "createdAt",
--     "updatedAt"
-- ) VALUES (
--     X,
--     Y,
--     'STOP',
--     'Parada registrada manualmente para correção',
--     '2025-10-23 12:00:00',
--     NOW(),
--     NOW()
-- );

-- OPÇÃO 3: Listar tipos de atividade disponíveis para usar na OPÇÃO 2
SELECT 
    id,
    code,
    name,
    type,
    description
FROM activity_types
WHERE active = true
ORDER BY type, name;

-- EXEMPLO PRÁTICO (DESCOMENTE E AJUSTE):
-- Se a ordem ID 1 está PAUSED mas não tem downtime, você pode:

-- 1. Ver os tipos de atividade:
-- SELECT id, name, type FROM activity_types WHERE active = true;

-- 2. Criar downtime para a ordem:
-- INSERT INTO downtimes (
--     "productionOrderId",
--     "activityTypeId",
--     type,
--     "startTime"
-- ) VALUES (
--     1,  -- ID da ordem
--     1,  -- ID do tipo de atividade (ajuste conforme necessário)
--     'STOP',
--     NOW() - INTERVAL '1 hour'  -- Iniciou 1 hora atrás
-- );

-- 3. Ou apenas retomar a produção:
-- UPDATE production_orders SET status = 'ACTIVE' WHERE id = 1;

