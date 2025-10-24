# Script para aplicar relacao entre ActivityType e Sector

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "APLICANDO SETORES RESPONSAVEIS" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracoes do banco
$env:PGPASSWORD = "As09kl00__"
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "mes_db"
$dbUser = "postgres"

# Caminho do arquivo SQL
$sqlFile = "backend\prisma\migrations\20251024_add_activity_type_sectors\migration.sql"

Write-Host "Configuracoes:" -ForegroundColor Yellow
Write-Host "   Host: $dbHost" -ForegroundColor White
Write-Host "   Porta: $dbPort" -ForegroundColor White
Write-Host "   Banco: $dbName" -ForegroundColor White
Write-Host ""

# Verificar se o arquivo SQL existe
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
    Write-Host "Tabela criada:" -ForegroundColor Cyan
    Write-Host "   - activity_type_sectors" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Erro ao executar migration" -ForegroundColor Red
    exit 1
}

# Parar backend
Write-Host "Parando backend..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Stop-Process -Name "node" -Force
    Start-Sleep -Seconds 2
    Write-Host "Backend parado!" -ForegroundColor Green
}

# Gerar Prisma Client
Write-Host ""
Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow
cd backend
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client gerado!" -ForegroundColor Green
} else {
    Write-Host "Erro ao gerar Prisma Client" -ForegroundColor Red
    cd ..
    exit 1
}

cd ..

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "SUCESSO! Iniciando backend..." -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

cd backend
npm run dev

