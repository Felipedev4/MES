# ============================================================
# Script PowerShell - Aplicar Correção producedQuantity
# ============================================================
# Este script corrige o campo producedQuantity de todas as
# ordens de produção no banco de dados
# ============================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CORREÇÃO: Campo producedQuantity" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configurações do PostgreSQL
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "mes_plasticos"
$DB_USER = "postgres"

# Solicitar senha
Write-Host "Digite a senha do PostgreSQL:" -ForegroundColor Yellow
$DB_PASSWORD = Read-Host -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
)

# Definir variável de ambiente para senha
$env:PGPASSWORD = $DB_PASSWORD_PLAIN

Write-Host "`n📊 ETAPA 1: Verificando divergências..." -ForegroundColor Yellow

# Query de verificação
$CHECK_QUERY = @"
SELECT 
    COUNT(*) as total_ordens,
    COUNT(CASE WHEN po.\"producedQuantity\" != COALESCE((
        SELECT SUM(\"clpCounterValue\") 
        FROM production_appointments 
        WHERE \"productionOrderId\" = po.id
    ), 0) THEN 1 END) as ordens_com_divergencia
FROM production_orders po;
"@

try {
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $CHECK_QUERY
    Write-Host "✅ Verificação concluída:" -ForegroundColor Green
    Write-Host $result
} catch {
    Write-Host "❌ Erro ao verificar banco de dados!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Deseja ver os detalhes das divergências? (S/N):" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    $DETAIL_QUERY = @"
    SELECT 
        po.\"orderNumber\" AS ordem,
        po.\"producedQuantity\" AS atual,
        COALESCE(SUM(pa.\"clpCounterValue\"), 0) AS correto,
        po.\"producedQuantity\" - COALESCE(SUM(pa.\"clpCounterValue\"), 0) AS diferenca
    FROM production_orders po
    LEFT JOIN production_appointments pa ON pa.\"productionOrderId\" = po.id
    GROUP BY po.id, po.\"orderNumber\", po.\"producedQuantity\"
    HAVING po.\"producedQuantity\" != COALESCE(SUM(pa.\"clpCounterValue\"), 0)
    ORDER BY po.\"orderNumber\";
"@
    
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $DETAIL_QUERY
}

Write-Host "`n⚠️  ATENÇÃO: Você está prestes a CORRIGIR o campo producedQuantity" -ForegroundColor Red
Write-Host "Esta operação irá SOBRESCREVER os valores atuais!" -ForegroundColor Red
Write-Host "`nDeseja criar um BACKUP antes? (S/N - Recomendado):" -ForegroundColor Yellow
$backup_response = Read-Host

if ($backup_response -eq "S" -or $backup_response -eq "s") {
    Write-Host "`n💾 Criando backup..." -ForegroundColor Yellow
    
    $BACKUP_QUERY = @"
    DROP TABLE IF EXISTS production_orders_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss');
    CREATE TABLE production_orders_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss') AS 
    SELECT * FROM production_orders;
"@
    
    try {
        & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $BACKUP_QUERY
        Write-Host "✅ Backup criado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao criar backup!" -ForegroundColor Red
        Write-Host "Deseja continuar mesmo assim? (S/N):" -ForegroundColor Yellow
        $continue = Read-Host
        if ($continue -ne "S" -and $continue -ne "s") {
            Write-Host "Operação cancelada." -ForegroundColor Yellow
            exit 0
        }
    }
}

Write-Host "`n🔧 Deseja APLICAR a correção agora? (S/N):" -ForegroundColor Yellow
$apply_response = Read-Host

if ($apply_response -ne "S" -and $apply_response -ne "s") {
    Write-Host "`n⚠️  Correção CANCELADA pelo usuário." -ForegroundColor Yellow
    Write-Host "Nenhuma alteração foi feita no banco de dados." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🔄 Aplicando correção..." -ForegroundColor Yellow

# Query de correção
$UPDATE_QUERY = @"
UPDATE production_orders po
SET \"producedQuantity\" = COALESCE((
    SELECT SUM(\"clpCounterValue\")
    FROM production_appointments
    WHERE \"productionOrderId\" = po.id
    AND \"clpCounterValue\" IS NOT NULL
), 0),
\"updatedAt\" = NOW()
WHERE EXISTS (
    SELECT 1 
    FROM production_appointments pa
    WHERE pa.\"productionOrderId\" = po.id
);
"@

try {
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $UPDATE_QUERY
    Write-Host "✅ Correção aplicada com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao aplicar correção!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 Verificando resultado..." -ForegroundColor Yellow

# Verificação específica da OP-2025-001
$VERIFY_QUERY = @"
SELECT 
    \"orderNumber\" as ordem,
    \"producedQuantity\" as produzido,
    (SELECT SUM(\"clpCounterValue\") FROM production_appointments 
     WHERE \"productionOrderId\" = production_orders.id) as soma_contador,
    CASE 
        WHEN \"producedQuantity\" = (SELECT SUM(\"clpCounterValue\") FROM production_appointments 
                                     WHERE \"productionOrderId\" = production_orders.id)
        THEN '✅ OK'
        ELSE '❌ DIVERGE'
    END as status
FROM production_orders
WHERE \"orderNumber\" = 'OP-2025-001';
"@

& psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $VERIFY_QUERY

Write-Host "`n📊 Deseja ver estatísticas gerais? (S/N):" -ForegroundColor Yellow
$stats_response = Read-Host

if ($stats_response -eq "S" -or $stats_response -eq "s") {
    $STATS_QUERY = @"
    SELECT 
        COUNT(*) AS total_ordens,
        COUNT(CASE WHEN \"producedQuantity\" > 0 THEN 1 END) AS com_producao,
        COUNT(CASE WHEN \"producedQuantity\" = COALESCE((
            SELECT SUM(\"clpCounterValue\") 
            FROM production_appointments 
            WHERE \"productionOrderId\" = production_orders.id
        ), 0) THEN 1 END) AS corretas,
        COUNT(CASE WHEN \"producedQuantity\" != COALESCE((
            SELECT SUM(\"clpCounterValue\") 
            FROM production_appointments 
            WHERE \"productionOrderId\" = production_orders.id
        ), 0) THEN 1 END) AS ainda_divergentes
    FROM production_orders;
"@
    
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $STATS_QUERY
}

# Limpar senha da memória
$env:PGPASSWORD = $null

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ CORREÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nPróximos passos:" -ForegroundColor Yellow
Write-Host "1. Reiniciar o backend (.\REINICIAR_BACKEND.ps1)" -ForegroundColor White
Write-Host "2. Abrir http://localhost:3000/injectors/1/orders" -ForegroundColor White
Write-Host "3. Verificar se os valores estão corretos" -ForegroundColor White
Write-Host "`nDocumentação completa em: CORRECAO_CRITICA_PRODUCED_QUANTITY.md`n" -ForegroundColor Cyan

