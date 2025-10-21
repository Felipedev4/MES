# Script para Configurar GitHub e Fazer Push Inicial
# Projeto: MES - Manufacturing Execution System
# Autor: Felipe
# Repositório: https://github.com/Felipedev4/MES

Write-Host "🚀 Configurando GitHub para o Projeto MES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
Write-Host "📋 Verificando se Git está instalado..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "1. Baixe Git em: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Instale com as opções padrão" -ForegroundColor White
    Write-Host "3. Feche e abra um NOVO terminal PowerShell" -ForegroundColor White
    Write-Host "4. Execute este script novamente" -ForegroundColor White
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# Configurar usuário Git
Write-Host "👤 Configurando usuário Git..." -ForegroundColor Yellow
$userName = Read-Host "Digite seu nome (ex: Felipe)"
$userEmail = Read-Host "Digite seu email (use o mesmo do GitHub)"

git config --global user.name "$userName"
git config --global user.email "$userEmail"
git config --global init.defaultBranch main

Write-Host "✅ Usuário configurado!" -ForegroundColor Green
Write-Host ""

# Informar sobre o Token
Write-Host "🔐 Informação sobre Token de Acesso" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Você precisará de um Token do GitHub!" -ForegroundColor Red
Write-Host ""
Write-Host "Como criar o Token:" -ForegroundColor White
Write-Host "1. Acesse: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "2. Clique em 'Generate new token (classic)'" -ForegroundColor White
Write-Host "3. Note: 'MES Project Token'" -ForegroundColor White
Write-Host "4. Selecione scopes: repo e workflow" -ForegroundColor White
Write-Host "5. Clique em 'Generate token'" -ForegroundColor White
Write-Host "6. COPIE o token (você não verá novamente!)" -ForegroundColor Yellow
Write-Host ""
$hasToken = Read-Host "Você já criou o token? (s/n)"

if ($hasToken -ne "s" -and $hasToken -ne "S") {
    Write-Host ""
    Write-Host "⚠️  Por favor, crie o token primeiro!" -ForegroundColor Yellow
    Write-Host "Abrindo página do GitHub..." -ForegroundColor Cyan
    Start-Process "https://github.com/settings/tokens"
    Write-Host ""
    Write-Host "Após criar o token, execute este script novamente." -ForegroundColor White
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 0
}

Write-Host ""

# Criar .gitignore
Write-Host "📝 Criando .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.tsbuildinfo

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Prisma
.prisma/

# Temporary files
*.tmp
*.temp
.cache/

# Database
*.db
*.sqlite
*.sqlite3

# PowerShell scripts temp
*.ps1.tmp
"@

$gitignoreContent | Out-File -FilePath .gitignore -Encoding UTF8 -Force
Write-Host "✅ .gitignore criado!" -ForegroundColor Green
Write-Host ""

# Criar README.md
Write-Host "📄 Criando README.md..." -ForegroundColor Yellow
$readmeContent = @"
# 🏭 MES - Manufacturing Execution System

Sistema de Execução de Manufatura com coleta de dados de CLPs via Modbus TCP.

## 🚀 Tecnologias

- **Backend:** Node.js + Express + TypeScript + Prisma
- **Frontend:** React + TypeScript + Material-UI
- **Data Collector:** Node.js + jsmodbus (Raspberry Pi 5)
- **Banco de Dados:** PostgreSQL
- **Protocolo:** Modbus TCP

## 📚 Documentação

- [Início Rápido](QUICKSTART.md)
- [Guia de Instalação](INSTALL.md)
- [Arquitetura](ARCHITECTURE.md)
- [API Documentação](API_DOCUMENTATION.md)
- [Data Collector](GUIA_DATA_COLLECTOR.md)
- [Configurar GitHub](CONFIGURAR_GITHUB.md)

## ⚡ Quick Start

\`\`\`bash
# Backend
cd backend
npm install
npx prisma migrate deploy
npm run dev

# Frontend
cd frontend
npm install
npm start

# Data Collector (Raspberry Pi)
cd data-collector
npm install
npx prisma generate
npm run dev
\`\`\`

## 📊 Features

- ✅ Cadastro de Empresas, Setores, Itens, Moldes
- ✅ Gerenciamento de Ordens de Produção
- ✅ Apontamentos de Produção
- ✅ Controle de Paradas (Downtimes)
- ✅ Configuração de CLPs via interface web
- ✅ Coleta automática de dados via Modbus TCP
- ✅ Dashboard em tempo real com WebSocket
- ✅ Cadastro de Defeitos e Tipos de Atividade
- ✅ Rastreabilidade completa

## 🔧 Estrutura

\`\`\`
MES/
├── backend/          # API REST + WebSocket
├── frontend/         # React App
├── data-collector/   # Serviço de coleta (Raspberry Pi)
└── docs/            # Documentação
\`\`\`

## 📄 Licença

MIT

## 👤 Autor

Felipe - [@Felipedev4](https://github.com/Felipedev4)
"@

$readmeContent | Out-File -FilePath README.md -Encoding UTF8 -Force
Write-Host "✅ README.md criado!" -ForegroundColor Green
Write-Host ""

# Inicializar Git
Write-Host "🔧 Inicializando repositório Git..." -ForegroundColor Yellow
git init
Write-Host "✅ Repositório inicializado!" -ForegroundColor Green
Write-Host ""

# Adicionar remote
Write-Host "🔗 Adicionando remote do GitHub..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/Felipedev4/MES.git"
try {
    git remote add origin $remoteUrl
    Write-Host "✅ Remote adicionado: $remoteUrl" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Remote já existe, atualizando..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
    Write-Host "✅ Remote atualizado!" -ForegroundColor Green
}
Write-Host ""

# Adicionar arquivos
Write-Host "📦 Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .
$filesCount = (git diff --cached --name-only | Measure-Object).Count
Write-Host "✅ $filesCount arquivos adicionados!" -ForegroundColor Green
Write-Host ""

# Primeiro commit
Write-Host "💾 Criando primeiro commit..." -ForegroundColor Yellow
git commit -m "feat: initial commit - MES system with backend, frontend and data-collector

- Complete backend API with Express + Prisma
- React frontend with Material-UI
- Data Collector service for Raspberry Pi
- Modbus TCP integration
- Real-time dashboard with WebSocket
- Complete documentation"

Write-Host "✅ Commit criado!" -ForegroundColor Green
Write-Host ""

# Renomear branch
Write-Host "🌿 Configurando branch main..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch main configurada!" -ForegroundColor Green
Write-Host ""

# Push para GitHub
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ATENÇÃO: Você será solicitado a inserir:" -ForegroundColor Red
Write-Host "   Username: Felipedev4" -ForegroundColor White
Write-Host "   Password: COLE SEU TOKEN (não a senha!)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione Enter para continuar..." -ForegroundColor Cyan
Read-Host

git push -u origin main

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Configuração Concluída!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Repositório configurado e enviado para:" -ForegroundColor Green
Write-Host "   https://github.com/Felipedev4/MES" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Acesse: https://github.com/Felipedev4/MES" -ForegroundColor White
Write-Host "   2. Adicione descrição e topics no repositório" -ForegroundColor White
Write-Host "   3. Configure branch protection (Settings > Branches)" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação criada:" -ForegroundColor Yellow
Write-Host "   - CONFIGURAR_GITHUB.md - Guia completo" -ForegroundColor White
Write-Host "   - README.md - Documentação do projeto" -ForegroundColor White
Write-Host ""

# Abrir GitHub no navegador
$openGitHub = Read-Host "Deseja abrir o repositório no navegador? (s/n)"
if ($openGitHub -eq "s" -or $openGitHub -eq "S") {
    Start-Process "https://github.com/Felipedev4/MES"
}

Write-Host ""
Write-Host "Pressione Enter para sair..." -ForegroundColor Cyan
Read-Host

