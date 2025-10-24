-- Verificar se TODOS os registros estão sendo salvos no banco
SELECT 
    r."registerName",
    r."registerAddress",
    r.enabled,
    COUNT(pd.id) as total_leituras,
    MAX(pd.timestamp) as ultima_leitura,
    MAX(pd.value) as ultimo_valor
FROM plc_registers r
LEFT JOIN plc_data pd ON pd."plcRegisterId" = r.id
WHERE r."plcConfigId" = (SELECT id FROM plc_configs LIMIT 1)
GROUP BY r.id, r."registerName", r."registerAddress", r.enabled
ORDER BY r."registerAddress";

