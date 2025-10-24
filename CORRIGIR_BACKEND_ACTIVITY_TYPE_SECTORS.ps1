# Script para corrigir backend - ActivityTypeSector

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "CORRIGINDO BACKEND - ACTIVITY TYPE SECTORS" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Parar backend
Write-Host "1. Parando backend..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Stop-Process -Name "node" -Force
    Start-Sleep -Seconds 3
    Write-Host "   Backend parado!" -ForegroundColor Green
} else {
    Write-Host "   Backend nao esta rodando" -ForegroundColor Gray
}

# Passo 2: Aplicar migration
Write-Host ""
Write-Host "2. Aplicando migration..." -ForegroundColor Yellow

$env:PGPASSWORD = "As09kl00__"
$sqlFile = "backend\prisma\migrations\20251024_add_activity_type_sectors\migration.sql"

psql -U postgres -d mes_db -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Migration aplicada!" -ForegroundColor Green
} else {
    Write-Host "   Erro na migration (pode ja estar aplicada)" -ForegroundColor Yellow
}

# Passo 3: Limpar Prisma Client
Write-Host ""
Write-Host "3. Limpando Prisma Client antigo..." -ForegroundColor Yellow

$prismaPath = "backend\node_modules\.prisma"
if (Test-Path $prismaPath) {
    Remove-Item $prismaPath -Recurse -Force
    Write-Host "   Pasta .prisma removida!" -ForegroundColor Green
}

# Passo 4: Gerar novo Prisma Client
Write-Host ""
Write-Host "4. Gerando novo Prisma Client..." -ForegroundColor Yellow
cd backend
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Prisma Client gerado!" -ForegroundColor Green
} else {
    Write-Host "   Erro ao gerar Prisma Client" -ForegroundColor Red
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

