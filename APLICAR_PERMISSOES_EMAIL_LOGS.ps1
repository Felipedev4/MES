# Script para aplicar permissões da Central de E-mails
# Execute este script no PowerShell

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "APLICAR PERMISSÕES - CENTRAL DE E-MAILS" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o PostgreSQL está instalado
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ ERRO: PostgreSQL (psql) não encontrado no PATH" -ForegroundColor Red
    Write-Host "   Instale o PostgreSQL ou adicione ao PATH do sistema" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ PostgreSQL encontrado" -ForegroundColor Green
Write-Host ""

# Configurações do banco de dados
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "mes_db"
$DB_USER = "postgres"

Write-Host "Aplicando permissões no banco de dados:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
Write-Host "  Porta: $DB_PORT" -ForegroundColor Gray
Write-Host "  Banco: $DB_NAME" -ForegroundColor Gray
Write-Host "  Usuário: $DB_USER" -ForegroundColor Gray
Write-Host ""

# Executar o script SQL
Write-Host "Executando script SQL..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  ATENÇÃO: Você será solicitado a digitar a senha do PostgreSQL" -ForegroundColor Yellow
Write-Host ""

try {
    # Executar o script (psql pedirá a senha interativamente)
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "init_email_logs_permissions.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ PERMISSÕES APLICADAS COM SUCESSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximos passos:" -ForegroundColor Cyan
        Write-Host "  1. Faça logout e login novamente no sistema" -ForegroundColor White
        Write-Host "  2. Limpe o cache do navegador (Ctrl+F5)" -ForegroundColor White
        Write-Host "  3. Verifique o menu Administração > Central de E-mails" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ ERRO ao aplicar permissões" -ForegroundColor Red
        Write-Host "   Código de saída: $LASTEXITCODE" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 Dica: Verifique se a senha do PostgreSQL está correta" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERRO: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

