# Script PowerShell para aplicar índices de prevenção de duplicatas
# Execute este script para criar os índices no banco de dados

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APLICAR ÍNDICES - PREVENÇÃO DUPLICATAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ler credenciais do .env
$envFile = Get-Content ".\.env" -ErrorAction SilentlyContinue
if ($envFile) {
    foreach ($line in $envFile) {
        if ($line -match "^DATABASE_URL=(.+)$") {
            $databaseUrl = $matches[1]
            Write-Host "✓ DATABASE_URL encontrada no .env" -ForegroundColor Green
        }
    }
} else {
    Write-Host "⚠ Arquivo .env não encontrado, usando valores padrão" -ForegroundColor Yellow
}

# Extrair informações da connection string
if ($databaseUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    # Valores padrão
    $dbUser = "postgres"
    $dbPassword = "postgres"
    $dbHost = "localhost"
    $dbPort = "5432"
    $dbName = "mes_production"
}

Write-Host ""
Write-Host "Configuração do Banco de Dados:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray
Write-Host ""

# SQL para criar índices
$sqlScript = @"
-- Índice composto para apontamentos automáticos (CLP)
CREATE INDEX IF NOT EXISTS idx_appointment_dedup_auto 
ON production_appointments (productionOrderId, automatic, timestamp, clpCounterValue)
WHERE automatic = true AND clpCounterValue IS NOT NULL;

-- Índice para busca rápida de apontamentos recentes
CREATE INDEX IF NOT EXISTS idx_appointment_recent 
ON production_appointments (productionOrderId, timestamp DESC, automatic);

-- Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'production_appointments'
AND indexname IN ('idx_appointment_dedup_auto', 'idx_appointment_recent');
"@

# Salvar SQL em arquivo temporário
$tempSqlFile = "temp_indices.sql"
$sqlScript | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "Aplicando índices no banco de dados..." -ForegroundColor Cyan

# Definir a senha como variável de ambiente temporária
$env:PGPASSWORD = $dbPassword

# Executar SQL usando psql
try {
    $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $tempSqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ÍNDICES APLICADOS COM SUCESSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Resultado:" -ForegroundColor Yellow
        Write-Host $result
    } else {
        Write-Host ""
        Write-Host "❌ ERRO ao aplicar índices!" -ForegroundColor Red
        Write-Host $result
        Write-Host ""
        Write-Host "Tente executar manualmente:" -ForegroundColor Yellow
        Write-Host "  psql -U $dbUser -d $dbName -f $tempSqlFile" -ForegroundColor Gray
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERRO ao executar psql!" -ForegroundColor Red
    Write-Host "Verifique se o PostgreSQL está instalado e o psql está no PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou execute manualmente:" -ForegroundColor Yellow
    Write-Host "  psql -U $dbUser -d $dbName -f $tempSqlFile" -ForegroundColor Gray
}

# Limpar senha da variável de ambiente
$env:PGPASSWORD = $null

# Remover arquivo temporário
Remove-Item $tempSqlFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pausar para ver resultado
Read-Host -Prompt "Pressione Enter para continuar"

