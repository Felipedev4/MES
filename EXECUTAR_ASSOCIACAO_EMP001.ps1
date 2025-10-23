# ================================================================================================
# 🚀 Script PowerShell: Executar Associação à Empresa EMP-001
# ================================================================================================

Write-Host "🔍 Verificando configurações do banco de dados..." -ForegroundColor Cyan

# Ler configuração do .env do backend
$envFile = "backend\.env"

if (Test-Path $envFile) {
    Write-Host "✅ Arquivo .env encontrado!" -ForegroundColor Green
    
    # Ler DATABASE_URL
    $databaseUrl = Get-Content $envFile | Where-Object { $_ -match "^DATABASE_URL=" } | ForEach-Object { $_ -replace "DATABASE_URL=", "" }
    
    if ($databaseUrl) {
        Write-Host "✅ DATABASE_URL encontrada!" -ForegroundColor Green
        
        # Extrair informações da connection string
        # Formato: postgresql://user:password@localhost:5432/database
        if ($databaseUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
            $dbUser = $matches[1]
            $dbPassword = $matches[2]
            $dbHost = $matches[3]
            $dbPort = $matches[4]
            $dbName = $matches[5]
            
            Write-Host ""
            Write-Host "📊 Configurações do Banco:" -ForegroundColor Yellow
            Write-Host "  Host: $dbHost" -ForegroundColor White
            Write-Host "  Port: $dbPort" -ForegroundColor White
            Write-Host "  Database: $dbName" -ForegroundColor White
            Write-Host "  User: $dbUser" -ForegroundColor White
            Write-Host ""
            
            # Executar script SQL
            Write-Host "🚀 Executando script de associação..." -ForegroundColor Cyan
            Write-Host ""
            
            # Definir variável de ambiente para senha
            $env:PGPASSWORD = $dbPassword
            
            # Executar via psql
            try {
                psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "ASSOCIAR_DADOS_EMPRESA_001.sql"
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host ""
                    Write-Host "✅ Script executado com sucesso!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
                    Write-Host "  1. Faça logout no sistema frontend" -ForegroundColor White
                    Write-Host "  2. Faça login novamente" -ForegroundColor White
                    Write-Host "  3. Selecione EMP-001 → Deve ver todos os dados" -ForegroundColor White
                    Write-Host "  4. Selecione EMP-002 → NÃO deve ver nenhum dado" -ForegroundColor White
                    Write-Host ""
                } else {
                    Write-Host "❌ Erro ao executar script!" -ForegroundColor Red
                    Write-Host "Código de erro: $LASTEXITCODE" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Erro ao executar psql!" -ForegroundColor Red
                Write-Host "Certifique-se de que o PostgreSQL está instalado e no PATH" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "💡 Alternativa: Execute o script manualmente:" -ForegroundColor Cyan
                Write-Host "  1. Abra PgAdmin ou DBeaver" -ForegroundColor White
                Write-Host "  2. Conecte ao banco de dados" -ForegroundColor White
                Write-Host "  3. Abra o arquivo: ASSOCIAR_DADOS_EMPRESA_001.sql" -ForegroundColor White
                Write-Host "  4. Execute todas as queries" -ForegroundColor White
                Write-Host ""
            }
            
            # Limpar variável de senha
            Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
            
        } else {
            Write-Host "❌ Formato de DATABASE_URL inválido!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ DATABASE_URL não encontrada no arquivo .env!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Arquivo .env não encontrado em backend/" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray

# ================================================================================================
# ALTERNATIVA: Usar Prisma Studio
# ================================================================================================

Write-Host ""
Write-Host "💡 ALTERNATIVA - Usar Prisma Studio:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se o psql não estiver disponível, você pode:" -ForegroundColor Yellow
Write-Host "  1. Abrir Prisma Studio:" -ForegroundColor White
Write-Host "     cd backend" -ForegroundColor Gray
Write-Host "     npx prisma studio" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Ou use PgAdmin/DBeaver e execute:" -ForegroundColor White
Write-Host "     ASSOCIAR_DADOS_EMPRESA_001.sql" -ForegroundColor Gray
Write-Host ""

