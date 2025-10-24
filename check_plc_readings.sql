-- Verificar últimas leituras de todos os registros
SELECT 
    r.id as register_id,
    r."registerName",
    r."registerAddress",
    r.enabled,
    r."registerPurpose",
    pd.value as last_value,
    pd.timestamp as last_reading,
    pd.connected,
    pd."errorMessage"
FROM plc_registers r
LEFT JOIN LATERAL (
    SELECT * FROM plc_data 
    WHERE "plcRegisterId" = r.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) pd ON true
WHERE r."plcConfigId" = (SELECT id FROM plc_configs LIMIT 1)
ORDER BY r."registerAddress";

