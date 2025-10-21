# Script para Limpar e Enviar para GitHub
# Autor: Sistema MES
# Data: 2025-10-21

# Atualizar PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  LIMPEZA E ENVIO PARA GITHUB - MES SYSTEM     " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Git
try {
    $gitVersion = git --version
    Write-Host "Git detectado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Erro: Git nao encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "Etapa 1: Criando/Atualizando .gitignore..." -ForegroundColor Yellow

$gitignoreContent = @"
# Dependencies
node_modules/
*/node_modules/
backend/node_modules/
frontend/node_modules/
data-collector/node_modules/

# Build outputs
dist/
build/
*.log
*.tsbuildinfo

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

# Package locks (opcional, comente se quiser versionar)
# package-lock.json
# */package-lock.json
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
Write-Host "  .gitignore criado/atualizado!" -ForegroundColor Green

Write-Host ""
Write-Host "Etapa 2: Inicializando repositorio Git..." -ForegroundColor Yellow

# Verificar se ja e um repo
if (Test-Path ".git") {
    Write-Host "  Repositorio Git ja existe" -ForegroundColor Green
} else {
    git init
    Write-Host "  Repositorio Git inicializado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Etapa 3: Removendo cache do Git..." -ForegroundColor Yellow
git rm -r --cached . 2>$null | Out-Null
Write-Host "  Cache limpo!" -ForegroundColor Green

Write-Host ""
Write-Host "Etapa 4: Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .
Write-Host "  Arquivos adicionados!" -ForegroundColor Green

Write-Host ""
Write-Host "Etapa 5: Verificando status..." -ForegroundColor Yellow
Write-Host ""
git status --short

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "DESEJA CONTINUAR COM O COMMIT? (s/n)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
$continuar = Read-Host

if ($continuar -ne "s" -and $continuar -ne "S") {
    Write-Host ""
    Write-Host "Operacao cancelada pelo usuario" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 0
}

Write-Host ""
Write-Host "Etapa 6: Criando commit..." -ForegroundColor Yellow
git commit -m "chore: initial commit - MES system with backend, frontend and data-collector"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit criado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "  Erro ao criar commit" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "DESEJA FAZER PUSH PARA O GITHUB? (s/n)" -ForegroundColor Yellow
Write-Host "Repositorio: https://github.com/Felipedev4/MES" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
$doPush = Read-Host

if ($doPush -eq "s" -or $doPush -eq "S") {
    Write-Host ""
    Write-Host "Etapa 7: Configurando remote..." -ForegroundColor Yellow
    
    git branch -M main
    git remote remove origin 2>$null | Out-Null
    git remote add origin https://github.com/Felipedev4/MES.git
    
    Write-Host "  Remote configurado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Etapa 8: Fazendo push..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ATENCAO:" -ForegroundColor Yellow
    Write-Host "  Usuario: Felipedev4" -ForegroundColor White
    Write-Host "  Senha: [USE SEU TOKEN PESSOAL DO GITHUB]" -ForegroundColor White
    Write-Host ""
    Write-Host "Como obter token:" -ForegroundColor Cyan
    Write-Host "  1. Acesse: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host "  2. Clique em 'Generate new token (classic)'" -ForegroundColor Gray
    Write-Host "  3. Marque 'repo' e gere o token" -ForegroundColor Gray
    Write-Host "  4. Copie e cole quando solicitado abaixo" -ForegroundColor Gray
    Write-Host ""
    
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "      SUCESSO! PROJETO ENVIADO PARA GITHUB     " -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Repositorio: https://github.com/Felipedev4/MES" -ForegroundColor Cyan
        Write-Host ""
        
        $abrirGitHub = Read-Host "Abrir repositorio no navegador? (s/n)"
        if ($abrirGitHub -eq "s" -or $abrirGitHub -eq "S") {
            Start-Process "https://github.com/Felipedev4/MES"
        }
    } else {
        Write-Host ""
        Write-Host "Erro ao fazer push" -ForegroundColor Red
        Write-Host "Verifique suas credenciais e tente novamente" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Push cancelado. Voce pode fazer manualmente depois com:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Script concluido!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para sair"

