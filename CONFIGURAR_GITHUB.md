# 🔧 Configurar GitHub para o Projeto MES

## 📋 Repositório
**URL:** https://github.com/Felipedev4/MES

---

## 📥 Passo 1: Instalar Git

### **Windows:**

1. **Baixar Git:**
   - Acesse: https://git-scm.com/download/win
   - Baixe a versão mais recente (64-bit Git for Windows Setup)

2. **Instalar:**
   - Execute o instalador
   - Use as opções padrão (Next, Next, Next...)
   - **IMPORTANTE:** Na tela "Adjusting your PATH environment", selecione **"Git from the command line and also from 3rd-party software"**

3. **Verificar Instalação:**
   ```powershell
   # Feche e abra um NOVO terminal PowerShell
   git --version
   # Deve mostrar: git version 2.x.x
   ```

---

## ⚙️ Passo 2: Configurar Git

```powershell
# Configurar seu nome (substitua pelo seu nome)
git config --global user.name "Felipe"

# Configurar seu email (use o mesmo email do GitHub)
git config --global user.email "seu-email@exemplo.com"

# Configurar branch padrão como main
git config --global init.defaultBranch main

# Verificar configuração
git config --list
```

---

## 🔐 Passo 3: Criar Token de Acesso (GitHub)

Como o GitHub não aceita mais senha, você precisa criar um **Personal Access Token**.

### **3.1. Acessar GitHub:**
1. Acesse: https://github.com/settings/tokens
2. Ou: GitHub.com > Settings > Developer settings > Personal access tokens > Tokens (classic)

### **3.2. Gerar Token:**
1. Clique em **"Generate new token"** > **"Generate new token (classic)"**
2. **Note**: `MES Project Token`
3. **Expiration**: `No expiration` (ou escolha um período)
4. **Select scopes** (marque):
   - ✅ `repo` (todos os sub-itens)
   - ✅ `workflow`
5. Clique em **"Generate token"**
6. **⚠️ IMPORTANTE:** Copie o token e salve em local seguro! Você não verá ele novamente.

**Exemplo de token:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 📤 Passo 4: Criar .gitignore

```powershell
cd C:\Empresas\Desenvolvimento\MES

# Criar arquivo .gitignore
@"
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
"@ | Out-File -FilePath .gitignore -Encoding UTF8
```

---

## 🚀 Passo 5: Inicializar Repositório e Fazer Push

```powershell
# 1. Inicializar Git
git init

# 2. Adicionar remote do GitHub
git remote add origin https://github.com/Felipedev4/MES.git

# 3. Criar arquivo README.md
@"
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
"@ | Out-File -FilePath README.md -Encoding UTF8

# 4. Adicionar todos os arquivos
git add .

# 5. Verificar o que será commitado
git status

# 6. Fazer o primeiro commit
git commit -m "feat: initial commit - MES system with backend, frontend and data-collector"

# 7. Renomear branch para main (se necessário)
git branch -M main

# 8. Fazer push para o GitHub
# VOCÊ SERÁ SOLICITADO A INSERIR:
# - Username: Felipedev4
# - Password: COLE O TOKEN QUE VOCÊ CRIOU (não a senha!)
git push -u origin main
```

**⚠️ IMPORTANTE:** Quando pedir **password**, cole o **Token** (não sua senha do GitHub)!

---

## 🔑 Passo 6: Salvar Credenciais (Opcional)

Para não precisar digitar o token toda vez:

```powershell
# Salvar credenciais permanentemente
git config --global credential.helper wincred

# Ou salvar por 1 hora
git config --global credential.helper 'cache --timeout=3600'
```

---

## 📝 Comandos Úteis

### **Verificar Status:**
```powershell
git status
```

### **Adicionar Arquivos:**
```powershell
# Adicionar todos
git add .

# Adicionar arquivo específico
git add arquivo.txt
```

### **Fazer Commit:**
```powershell
git commit -m "descrição da mudança"
```

### **Enviar para GitHub:**
```powershell
git push
```

### **Atualizar do GitHub:**
```powershell
git pull
```

### **Ver Histórico:**
```powershell
git log --oneline --graph --all
```

### **Criar Branch:**
```powershell
# Criar e mudar para nova branch
git checkout -b feature/nova-funcionalidade

# Fazer push da nova branch
git push -u origin feature/nova-funcionalidade
```

### **Voltar para Main:**
```powershell
git checkout main
```

---

## 🌿 Estrutura de Branches Recomendada

```
main                    # Produção (estável)
  └── develop           # Desenvolvimento
       ├── feature/xyz  # Novas funcionalidades
       ├── bugfix/abc   # Correções de bugs
       └── hotfix/123   # Correções urgentes
```

### **Criar Estrutura:**
```powershell
# Criar branch develop
git checkout -b develop
git push -u origin develop

# Voltar para main
git checkout main
```

---

## 📦 Passo 7: Criar Releases (Opcional)

### **Via GitHub Web:**
1. Acesse: https://github.com/Felipedev4/MES/releases
2. Clique em **"Create a new release"**
3. **Tag version:** `v1.0.0`
4. **Release title:** `v1.0.0 - Initial Release`
5. **Describe this release:**
   ```markdown
   ## 🎉 First Release
   
   ### Features
   - ✅ Backend API REST completo
   - ✅ Frontend React com Material-UI
   - ✅ Data Collector para Raspberry Pi
   - ✅ Integração Modbus TCP
   - ✅ Dashboard em tempo real
   
   ### Documentation
   - Complete setup guides
   - API documentation
   - Architecture diagrams
   ```
6. Clique em **"Publish release"**

---

## 🔒 Segurança

### **Arquivos que NÃO devem ir para o GitHub:**

✅ Já configurados no `.gitignore`:
- `.env` (variáveis de ambiente)
- `node_modules/` (dependências)
- Arquivos de log
- Builds

### **Se você acidentalmente commitou .env:**

```powershell
# Remover .env do histórico
git rm --cached .env

# Adicionar .env ao .gitignore (se não estiver)
echo ".env" >> .gitignore

# Commit
git add .gitignore
git commit -m "chore: remove .env from repository"
git push
```

---

## 📊 GitHub Actions (CI/CD - Futuro)

Crie o arquivo `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Backend Dependencies
      working-directory: ./backend
      run: npm install
    
    - name: Install Frontend Dependencies
      working-directory: ./frontend
      run: npm install
    
    - name: Build Backend
      working-directory: ./backend
      run: npm run build
    
    - name: Build Frontend
      working-directory: ./frontend
      run: npm run build
```

---

## 🐛 Troubleshooting

### **Erro: "fatal: not a git repository"**
```powershell
git init
```

### **Erro: "Permission denied (publickey)"**
Use HTTPS em vez de SSH ou configure SSH keys.

### **Erro: "failed to push some refs"**
```powershell
# Forçar push (cuidado!)
git push -f origin main

# Ou puxar mudanças primeiro
git pull origin main --allow-unrelated-histories
git push
```

### **Erro: "Username for 'https://github.com':"**
- Username: `Felipedev4`
- Password: **COLE O TOKEN** (não a senha!)

### **Esqueceu o Token?**
Crie um novo em: https://github.com/settings/tokens

---

## ✅ Checklist

- [ ] Git instalado (`git --version`)
- [ ] Git configurado (nome e email)
- [ ] Token criado no GitHub
- [ ] `.gitignore` criado
- [ ] Repositório inicializado (`git init`)
- [ ] Remote adicionado (`git remote add origin`)
- [ ] README.md criado
- [ ] Primeiro commit (`git commit`)
- [ ] Push para GitHub (`git push -u origin main`)
- [ ] Verificar no GitHub: https://github.com/Felipedev4/MES

---

## 🎯 Próximos Passos

1. ✅ Fazer push inicial (seguir este guia)
2. ✅ Adicionar descrição no GitHub
3. ✅ Adicionar topics: `mes`, `modbus`, `manufacturing`, `typescript`, `react`
4. ✅ Proteger branch `main` (Settings > Branches > Add rule)
5. ✅ Configurar GitHub Actions (CI/CD)
6. ✅ Adicionar badge no README
7. ✅ Documentar APIs com Swagger

---

## 📚 Links Úteis

- **Documentação Git:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Markdown Guide:** https://www.markdownguide.org/
- **Conventional Commits:** https://www.conventionalcommits.org/

---

**Autor:** Felipe  
**Repositório:** https://github.com/Felipedev4/MES  
**Data:** Outubro 2025

