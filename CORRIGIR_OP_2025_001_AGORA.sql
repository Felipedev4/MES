-- Correção Imediata: Ordem OP-2025-001 está PAUSED sem downtime ativo
-- Solução: Mudar status para ACTIVE para permitir retomada

-- Antes da correção: verificar status atual
SELECT id, "orderNumber", status, "startDate" 
FROM production_orders 
WHERE id = 1;

-- Aplicar correção: mudar de PAUSED para ACTIVE
UPDATE production_orders 
SET status = 'ACTIVE'
WHERE id = 1 AND status = 'PAUSED';

-- Verificar após correção
SELECT id, "orderNumber", status, "startDate" 
FROM production_orders 
WHERE id = 1;

-- Mensagem de confirmação
SELECT 'Ordem OP-2025-001 retomada com sucesso! Status mudado para ACTIVE.' as resultado;

