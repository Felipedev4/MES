# Script para Limpar Arquivos Grandes do Repositorio Git
# Autor: Sistema MES
# Data: 2025-10-21

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    LIMPEZA DE ARQUIVOS GRANDES - GIT MES      " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git esta instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Erro: Git nao instalado!" -ForegroundColor Red
    Write-Host "Instale Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se e um repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "Erro: Nao e um repositorio Git!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "Passo 1: Verificando .gitignore..." -ForegroundColor Yellow
Write-Host ""

# Verificar se .gitignore existe
if (-not (Test-Path ".gitignore")) {
    Write-Host "Criando .gitignore..." -ForegroundColor Yellow
    
    $gitignoreContent = @"
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*.log

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Prisma
*.db
*.db-journal

# Temp
tmp/
temp/
"@
    
    Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
    Write-Host "Arquivo .gitignore criado!" -ForegroundColor Green
} else {
    Write-Host "Arquivo .gitignore ja existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "Passo 2: Limpando cache do Git..." -ForegroundColor Yellow
git rm -r --cached . 2>$null
Write-Host "Cache limpo!" -ForegroundColor Green

Write-Host ""
Write-Host "Passo 3: Adicionando arquivos novamente..." -ForegroundColor Yellow
git add .
Write-Host "Arquivos adicionados!" -ForegroundColor Green

Write-Host ""
Write-Host "Passo 4: Verificando status..." -ForegroundColor Yellow
Write-Host ""
git status --short

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Deseja fazer commit destes arquivos? (s/n)" -ForegroundColor Yellow
$doCommit = Read-Host

if ($doCommit -eq "s" -or $doCommit -eq "S") {
    Write-Host ""
    Write-Host "Criando commit..." -ForegroundColor Yellow
    
    git commit -m "chore: remove large files and add .gitignore"
    
    Write-Host ""
    Write-Host "Commit criado com sucesso!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Deseja fazer push para GitHub? (s/n)" -ForegroundColor Yellow
    $doPush = Read-Host
    
    if ($doPush -eq "s" -or $doPush -eq "S") {
        Write-Host ""
        Write-Host "Fazendo push..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Usuario: Felipedev4" -ForegroundColor White
        Write-Host "Senha: [USE SEU TOKEN DO GITHUB]" -ForegroundColor White
        Write-Host ""
        
        git branch -M main
        git remote remove origin 2>$null
        git remote add origin https://github.com/Felipedev4/MES.git
        git push -u origin main
        
        Write-Host ""
        Write-Host "Push concluido!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Abrir GitHub no navegador? (s/n)" -ForegroundColor Yellow
        $openBrowser = Read-Host
        
        if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
            Start-Process "https://github.com/Felipedev4/MES"
        }
    }
} else {
    Write-Host ""
    Write-Host "Operacao cancelada" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Script concluido!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para sair"

