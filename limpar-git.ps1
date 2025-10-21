# Script para Limpar Repositório Git e Remover Arquivos Grandes
# Projeto: MES - Manufacturing Execution System

Write-Host "🧹 Limpando Repositório Git do Projeto MES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
try {
    git --version | Out-Null
    Write-Host "✅ Git encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não instalado!" -ForegroundColor Red
    Write-Host "Por favor, instale Git primeiro: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# Verificar se estamos em um repositório Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Não é um repositório Git!" -ForegroundColor Red
    Write-Host "Execute este script dentro da pasta MES" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "📋 Verificando status atual..." -ForegroundColor Yellow
$status = git status --short
Write-Host ""

# Criar .gitignore correto
Write-Host "📝 Criando .gitignore completo..." -ForegroundColor Yellow
$gitignoreContent = @"
# ============================================
# DEPENDENCIES - NÃO ENVIAR PARA O GITHUB!
# ============================================
**/node_modules/
node_modules/
package-lock.json
yarn.lock

# ============================================
# ENVIRONMENT VARIABLES - CONTÉM SENHAS!
# ============================================
.env
.env.local
.env.*.local
.env.production
.env.development

# ============================================
# BUILD OUTPUTS - ARQUIVOS COMPILADOS
# ============================================
dist/
build/
*.tsbuildinfo
.next/
out/

# ============================================
# LOGS - PODEM FICAR MUITO GRANDES
# ============================================
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# ============================================
# OS FILES
# ============================================
.DS_Store
Thumbs.db
desktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk

# ============================================
# IDE
# ============================================
.vscode/
.idea/
*.swp
*.swo
*~
.vs/

# ============================================
# PRISMA
# ============================================
.prisma/
*.db
*.db-journal

# ============================================
# TEMPORARY FILES
# ============================================
*.tmp
*.temp
.cache/
.eslintcache
.stylelintcache

# ============================================
# DATABASE FILES - NÃO ENVIAR DADOS!
# ============================================
*.sqlite
*.sqlite3
*.db

# ============================================
# COVERAGE
# ============================================
coverage/
.nyc_output/

# ============================================
# OUTROS
# ============================================
.turbo/
.vercel/
.terraform/
"@

$gitignoreContent | Out-File -FilePath .gitignore -Encoding UTF8 -Force
Write-Host "✅ .gitignore criado!" -ForegroundColor Green
Write-Host ""

# Remover tudo do staging
Write-Host "🔄 Removendo todos os arquivos do staging..." -ForegroundColor Yellow
git reset
Write-Host "✅ Staging limpo!" -ForegroundColor Green
Write-Host ""

# Limpar cache do Git
Write-Host "🧹 Limpando cache do Git..." -ForegroundColor Yellow
git rm -r --cached . 2>$null
Write-Host "✅ Cache limpo!" -ForegroundColor Green
Write-Host ""

# Adicionar apenas arquivos necessários
Write-Host "📦 Adicionando apenas arquivos necessários..." -ForegroundColor Yellow
git add .gitignore
git add README.md
git add *.md

# Backend
git add backend/package.json
git add backend/tsconfig.json
git add backend/prisma/
git add backend/src/

# Frontend
git add frontend/package.json
git add frontend/tsconfig.json
git add frontend/public/
git add frontend/src/

# Data Collector
git add data-collector/package.json
git add data-collector/tsconfig.json
git add data-collector/README.md
git add data-collector/src/
git add data-collector/*.service

# Arquivos de configuração na raiz
git add *.ps1
git add .gitignore

Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green
Write-Host ""

# Mostrar o que será commitado
Write-Host "📊 Arquivos que serão enviados ao GitHub:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
git status --short
Write-Host ""

# Contar arquivos
$fileCount = (git diff --cached --name-only | Measure-Object).Count
Write-Host "📈 Total de arquivos: $fileCount" -ForegroundColor Green
Write-Host ""

# Verificar tamanho
Write-Host "📏 Verificando tamanhos dos arquivos..." -ForegroundColor Yellow
$largeFiles = git diff --cached --name-only | ForEach-Object {
    if (Test-Path $_) {
        $size = (Get-Item $_).Length
        if ($size -gt 10MB) {
            [PSCustomObject]@{
                File = $_
                Size = "{0:N2} MB" -f ($size / 1MB)
            }
        }
    }
}

if ($largeFiles) {
    Write-Host ""
    Write-Host "⚠️  ARQUIVOS GRANDES DETECTADOS:" -ForegroundColor Yellow
    $largeFiles | Format-Table -AutoSize
    Write-Host ""
    Write-Host "⚠️  Estes arquivos NÃO devem ir para o GitHub!" -ForegroundColor Red
    Write-Host "Se você vê node_modules ou arquivos .env, PARE e adicione ao .gitignore!" -ForegroundColor Red
    Write-Host ""
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        Write-Host "❌ Operação cancelada" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ Nenhum arquivo grande detectado!" -ForegroundColor Green
}

Write-Host ""

# Perguntar se deseja fazer commit
Write-Host "🤔 Deseja fazer commit destes arquivos?" -ForegroundColor Cyan
$doCommit = Read-Host "Digite 's' para confirmar"

if ($doCommit -eq "s" -or $doCommit -eq "S") {
    Write-Host ""
    Write-Host "💾 Criando commit..." -ForegroundColor Yellow
    
    git commit -m "feat: initial commit - MES system - Backend API with Express + Prisma + TypeScript - Frontend React with Material-UI - Data Collector service for Raspberry Pi - Modbus TCP integration - Real-time dashboard with WebSocket - Complete documentation - Removed node_modules and build files"

    Write-Host "✅ Commit criado!" -ForegroundColor Green
    Write-Host ""
    
    # Perguntar sobre push
    Write-Host "🚀 Deseja fazer push para o GitHub agora?" -ForegroundColor Cyan
    Write-Host "   Repositório: https://github.com/Felipedev4/MES" -ForegroundColor White
    $doPush = Read-Host "Digite 's' para confirmar"
    
    if ($doPush -eq "s" -or $doPush -eq "S") {
        Write-Host ""
        Write-Host "📤 Fazendo push..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  Quando solicitado:" -ForegroundColor Yellow
        Write-Host "   Username: Felipedev4" -ForegroundColor White
        Write-Host "   Password: [COLE SEU TOKEN DO GITHUB]" -ForegroundColor White
        Write-Host ""
        
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "==========================================" -ForegroundColor Cyan
            Write-Host "🎉 Sucesso! Código enviado para o GitHub!" -ForegroundColor Green
            Write-Host "==========================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "✅ Acesse: https://github.com/Felipedev4/MES" -ForegroundColor Green
            Write-Host ""
            
            # Abrir GitHub
            $openGitHub = Read-Host "Deseja abrir o repositório no navegador? (s/n)"
            if ($openGitHub -eq "s" -or $openGitHub -eq "S") {
                Start-Process "https://github.com/Felipedev4/MES"
            }
        } else {
            Write-Host ""
            Write-Host "❌ Erro ao fazer push!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Possíveis causas:" -ForegroundColor Yellow
            Write-Host "1. Token inválido ou expirado" -ForegroundColor White
            Write-Host "2. Sem permissão no repositório" -ForegroundColor White
            Write-Host "3. Arquivos muito grandes (>100MB)" -ForegroundColor White
            Write-Host ""
            Write-Host "Tente novamente com:" -ForegroundColor Yellow
            Write-Host "   git push -u origin main" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ Commit cancelado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Status final:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "Pressione Enter para sair..." -ForegroundColor Cyan
Read-Host

