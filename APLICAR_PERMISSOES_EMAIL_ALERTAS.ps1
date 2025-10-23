# =============================================
# APLICAR PERMISSÕES DE E-MAIL E ALERTAS
# =============================================

Write-Host "`n=== APLICAR PERMISSÕES NO BANCO ===" -ForegroundColor Cyan

$env:PGPASSWORD = "Mestresol_2025"

Write-Host "`nAplicando permissões..." -ForegroundColor Yellow

$result = psql -U postgres -d mes_db -f "ADICIONAR_PERMISSOES_EMAIL_ALERTAS.sql" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Permissões aplicadas com sucesso!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Erro ao aplicar permissões:" -ForegroundColor Red
    Write-Host $result
    Write-Host "`n💡 Tente executar manualmente:" -ForegroundColor Yellow
    Write-Host "psql -U postgres -d mes_db -f ADICIONAR_PERMISSOES_EMAIL_ALERTAS.sql`n" -ForegroundColor White
}

