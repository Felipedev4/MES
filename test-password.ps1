# Script para Testar Senhas do PostgreSQL
Write-Host ""
Write-Host "Testando senhas do PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

$senhas = @("", "postgres", "admin", "root", "123456", "postgres123", "admin123")
$senhaCorreta = $null

foreach ($senha in $senhas) {
    if ($senha -eq "") {
        Write-Host "Testando senha vazia..." -ForegroundColor Yellow
        $displaySenha = "VAZIA"
    } else {
        Write-Host "Testando senha: $senha..." -ForegroundColor Yellow
        $displaySenha = $senha
    }
    
    $env:PGPASSWORD = $senha
    
    # Tentar conectar
    $output = psql -U postgres -d postgres -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "FUNCIONOU! Senha correta: $displaySenha" -ForegroundColor Green
        $senhaCorreta = $senha
        break
    } else {
        Write-Host "Falhou" -ForegroundColor Red
    }
}

Write-Host ""

if ($null -ne $senhaCorreta) {
    Write-Host "SENHA ENCONTRADA!" -ForegroundColor Green
    Write-Host ""
    
    if ($senhaCorreta -eq "") {
        Write-Host "A senha e VAZIA" -ForegroundColor Yellow
        $connStr = "postgresql://postgres:@localhost:5432/mes_db?schema=public"
    } else {
        Write-Host "A senha e: $senhaCorreta" -ForegroundColor Yellow
        $connStr = "postgresql://postgres:$senhaCorreta@localhost:5432/mes_db?schema=public"
    }
    
    Write-Host ""
    Write-Host "Atualizando backend/.env..." -ForegroundColor Yellow
    
    # Ler e atualizar .env
    $envPath = "backend\.env"
    $envLines = Get-Content $envPath
    $newLines = @()
    
    foreach ($line in $envLines) {
        if ($line -like "DATABASE_URL=*") {
            $newLines += "DATABASE_URL=`"$connStr`""
        } else {
            $newLines += $line
        }
    }
    
    Set-Content -Path $envPath -Value $newLines
    
    Write-Host "Arquivo .env atualizado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo passo: cd backend e npm run dev" -ForegroundColor White
    
} else {
    Write-Host "NENHUMA SENHA FUNCIONOU" -ForegroundColor Red
    Write-Host ""
    Write-Host "Leia o arquivo FIX_POSTGRES_PASSWORD.md para resetar a senha" -ForegroundColor Yellow
}

