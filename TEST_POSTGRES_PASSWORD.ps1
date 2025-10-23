# Script para Testar Senhas do PostgreSQL
Write-Host ""
Write-Host "🔐 TESTANDO SENHAS DO POSTGRESQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$senhas = @("", "postgres", "admin", "root", "123456", "postgres123", "admin123")
$senhaCorreta = $null

foreach ($senha in $senhas) {
    if ($senha -eq "") {
        Write-Host "Testando: senha vazia..." -ForegroundColor Yellow
        $displaySenha = "(vazia)"
    } else {
        Write-Host "Testando: $senha..." -ForegroundColor Yellow
        $displaySenha = $senha
    }
    
    $env:PGPASSWORD = $senha
    
    # Tentar conectar
    $result = psql -U postgres -d postgres -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   SUCESSO! Senha correta: $displaySenha" -ForegroundColor Green
        $senhaCorreta = $senha
        break
    } else {
        Write-Host "   Falhou" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($senhaCorreta -ne $null) {
    Write-Host "OK SENHA ENCONTRADA!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Senha do PostgreSQL: " -NoNewline
    if ($senhaCorreta -eq "") {
        Write-Host "(vazia)" -ForegroundColor Yellow
        $connectionString = "postgresql://postgres:@localhost:5432/mes_db?schema=public"
    } else {
        Write-Host "$senhaCorreta" -ForegroundColor Yellow
        $connectionString = "postgresql://postgres:$senhaCorreta@localhost:5432/mes_db?schema=public"
    }
    
    Write-Host ""
    Write-Host "DATABASE_URL a usar:" -ForegroundColor White
    Write-Host $connectionString -ForegroundColor Gray
    Write-Host ""
    Write-Host "Atualizando backend/.env..." -ForegroundColor Yellow
    
    # Ler arquivo .env
    $envContent = Get-Content "backend\.env" -Raw
    
    # Substituir linha DATABASE_URL
    $envContent = $envContent -replace 'DATABASE_URL="postgresql://[^"]*"', "DATABASE_URL=`"$connectionString`""
    
    # Salvar arquivo
    Set-Content -Path "backend\.env" -Value $envContent -NoNewline
    
    Write-Host "OK backend/.env atualizado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo passo:" -ForegroundColor White
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "NENHUMA SENHA FUNCIONOU" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opcoes:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Consultar FIX_POSTGRES_PASSWORD.md para resetar senha" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Tentar conectar manualmente:" -ForegroundColor White
    Write-Host "   psql -U postgres" -ForegroundColor Gray
    Write-Host "   (Digite a senha quando pedida)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Verificar se PostgreSQL esta rodando:" -ForegroundColor White
    Write-Host "   Get-Service postgresql-x64-18" -ForegroundColor Gray
    Write-Host ""
}

