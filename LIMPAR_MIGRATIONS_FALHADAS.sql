-- Limpar registro de migration falhada
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251023_update_production_status_enum' 
AND finished_at IS NULL;

-- Verificar migrations restantes
SELECT migration_name, finished_at, success 
FROM "_prisma_migrations" 
ORDER BY started_at DESC 
LIMIT 5;

