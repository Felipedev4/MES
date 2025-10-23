# Script para aplicar campos de e-mail e notificacoes em Tipos de Atividade
# Executar como Administrador no PowerShell

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "APLICANDO CAMPOS DE E-MAIL E NOTIFICACOES" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracoes do banco de dados
$env:PGPASSWORD = "As09kl00__"
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "mes_db"
$dbUser = "postgres"

# Caminho do arquivo SQL
$sqlFile = "backend\prisma\migrations\20251024_add_email_notifications_to_activity_types\migration.sql"

Write-Host "Configuracoes:" -ForegroundColor Yellow
Write-Host "   Host: $dbHost" -ForegroundColor White
Write-Host "   Porta: $dbPort" -ForegroundColor White
Write-Host "   Banco: $dbName" -ForegroundColor White
Write-Host "   Usuario: $dbUser" -ForegroundColor White
Write-Host ""

# Verifica se o arquivo SQL existe
if (-not (Test-Path $sqlFile)) {
    Write-Host "Arquivo SQL nao encontrado: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Arquivo SQL encontrado: $sqlFile" -ForegroundColor Green
Write-Host ""

# Executar o SQL
Write-Host "Executando migration..." -ForegroundColor Yellow

psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migration aplicada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Campos adicionados:" -ForegroundColor Cyan
    Write-Host "   - sector_email" -ForegroundColor White
    Write-Host "   - email_notifications_enabled" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Erro ao executar migration" -ForegroundColor Red
    exit 1
}

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Reinicie o backend para atualizar o Prisma Client" -ForegroundColor White
Write-Host "2. Acesse o frontend e teste os novos campos" -ForegroundColor White
Write-Host ""
