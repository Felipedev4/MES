# 🚫 Solução: Arquivos Grandes no GitHub

## ❌ Problema

Ao tentar fazer `git push`, você recebeu um erro como:

```
remote: error: File backend/node_modules/... is 150.23 MB; this exceeds GitHub's file size limit of 100 MB
```

---

## 🎯 Causa

Você adicionou **arquivos que NÃO devem ir para o GitHub**, como:
- `node_modules/` (centenas de MB de dependências)
- Arquivos `.env` (contém senhas)
- Builds compilados
- Arquivos de log

---

## ✅ Solução Rápida

### **Execute este script:**

```powershell
.\limpar-git.ps1
```

**O script vai:**
1. ✅ Criar `.gitignore` correto
2. ✅ Remover arquivos grandes do staging
3. ✅ Adicionar apenas arquivos necessários
4. ✅ Verificar tamanhos
5. ✅ Fazer commit e push limpo

---

## 📋 Quais Arquivos São Necessários?

### ✅ **SIM - Enviar para o GitHub:**

```
MES/
├── README.md                     ✅ Documentação
├── *.md                          ✅ Todos os arquivos .md
├── .gitignore                    ✅ Configuração do Git
├── setup-github.ps1              ✅ Scripts úteis
├── limpar-git.ps1                ✅ Scripts úteis
│
├── backend/
│   ├── package.json              ✅ Lista de dependências
│   ├── tsconfig.json             ✅ Config TypeScript
│   ├── prisma/
│   │   ├── schema.prisma         ✅ Schema do banco
│   │   ├── migrations/           ✅ Migrações do banco
│   │   └── seed.ts               ✅ Dados iniciais
│   └── src/                      ✅ Código-fonte
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── server.ts
│
├── frontend/
│   ├── package.json              ✅ Lista de dependências
│   ├── tsconfig.json             ✅ Config TypeScript
│   ├── public/                   ✅ Arquivos públicos
│   │   └── index.html
│   └── src/                      ✅ Código-fonte
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       ├── services/
│       ├── types/
│       ├── App.tsx
│       └── index.tsx
│
└── data-collector/
    ├── package.json              ✅ Lista de dependências
    ├── tsconfig.json             ✅ Config TypeScript
    ├── README.md                 ✅ Documentação
    ├── *.service                 ✅ Arquivos de serviço
    └── src/                      ✅ Código-fonte
        ├── config/
        ├── services/
        ├── utils/
        └── index.ts
```

**Total esperado:** ~300-500 arquivos | ~5-10 MB

---

### ❌ **NÃO - Jamais enviar:**

```
❌ node_modules/                  # 100-500 MB - dependências instaladas
❌ .env                            # SENHAS E SEGREDOS!
❌ .env.local                      # SENHAS E SEGREDOS!
❌ dist/                           # Build compilado
❌ build/                          # Build compilado
❌ *.log                           # Arquivos de log
❌ *.db                            # Banco de dados local
❌ .vscode/                        # Configurações do editor
❌ .idea/                          # Configurações do editor
❌ coverage/                       # Relatórios de testes
```

---

## 🔧 Solução Manual (Passo a Passo)

### **1. Limpar o Staging:**

```powershell
# Voltar todos os arquivos
git reset

# Limpar cache
git rm -r --cached .
```

### **2. Verificar .gitignore:**

Certifique-se de que `.gitignore` contém:

```gitignore
# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
*.tsbuildinfo

# Logs
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Prisma
.prisma/

# Database
*.db
*.sqlite
```

### **3. Adicionar Apenas Arquivos Necessários:**

```powershell
# Adicionar arquivos específicos
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
git add data-collector/src/
```

### **4. Verificar o que Será Enviado:**

```powershell
# Ver lista de arquivos
git status

# Ver tamanhos (procure por arquivos >10MB)
git diff --cached --name-only | ForEach-Object {
    if (Test-Path $_) {
        $size = (Get-Item $_).Length / 1MB
        if ($size -gt 1) {
            "{0:N2} MB - $_" -f $size
        }
    }
}
```

Se aparecer **node_modules** ou arquivos grandes, **PARE** e adicione ao `.gitignore`!

### **5. Fazer Commit:**

```powershell
git commit -m "feat: initial commit - MES system (clean)"
```

### **6. Fazer Push:**

```powershell
git push -u origin main
```

---

## 🆘 Se Já Fez Push com Arquivos Grandes

### **Opção 1: Force Push (Repositório Vazio)**

Se o repositório está vazio ou você é o único usando:

```powershell
# Limpar histórico
git reset --soft HEAD~1

# Limpar staging
git reset

# Seguir passos acima (adicionar apenas necessários)
git add ...

# Novo commit
git commit -m "feat: initial commit - MES system (clean)"

# Force push
git push -f origin main
```

### **Opção 2: BFG Repo-Cleaner (Repositório com Histórico)**

Se o repositório já tem outros commits:

```powershell
# Baixar BFG: https://rtyley.github.io/bfg-repo-cleaner/

# Fazer backup
git clone --mirror https://github.com/Felipedev4/MES.git mes-backup

# Limpar arquivos grandes
java -jar bfg.jar --delete-folders node_modules --no-blob-protection mes-backup

# Limpar histórico
cd mes-backup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push
git push
```

---

## 📊 Checklist Antes do Push

- [ ] `.gitignore` criado e correto
- [ ] `node_modules/` NÃO está no staging
- [ ] `.env` NÃO está no staging
- [ ] Apenas código-fonte (`*.ts`, `*.tsx`, `*.json`) está incluído
- [ ] Total de arquivos < 1000
- [ ] Tamanho total < 50 MB
- [ ] Nenhum arquivo individual > 10 MB
- [ ] Verificado com `git status`

---

## 🎯 Comandos Úteis

### **Ver Arquivos no Staging:**
```powershell
git status --short
```

### **Ver Tamanho dos Arquivos:**
```powershell
git ls-files | ForEach-Object {
    if (Test-Path $_) {
        $size = (Get-Item $_).Length / 1MB
        [PSCustomObject]@{
            Size = "{0:N2} MB" -f $size
            File = $_
        }
    }
} | Where-Object { [double]($_.Size -replace ' MB','') -gt 1 } | Sort-Object -Property @{Expression={[double]($_.Size -replace ' MB','')}; Descending=$true} | Format-Table -AutoSize
```

### **Remover Arquivo Específico do Staging:**
```powershell
git reset HEAD caminho/para/arquivo
```

### **Remover Todos do Staging:**
```powershell
git reset
```

---

## 💡 Por Que node_modules Não Vai?

`node_modules/` contém **todas as dependências** instaladas pelo `npm install`.

**Problemas:**
- 📦 Tamanho enorme (100-500 MB)
- 🐌 Push/Pull muito lento
- 💾 Gasta espaço no GitHub
- 🔄 Pode ser recriado com `npm install`

**Como outras pessoas instalam?**

1. Clone o repositório:
   ```bash
   git clone https://github.com/Felipedev4/MES.git
   ```

2. Instale as dependências:
   ```bash
   cd MES/backend
   npm install

   cd ../frontend
   npm install

   cd ../data-collector
   npm install
   ```

O `package.json` lista todas as dependências, então `npm install` baixa tudo automaticamente!

---

## ✅ Tamanho Esperado

| Componente | Tamanho no GitHub |
|------------|-------------------|
| Backend (src/) | ~1-2 MB |
| Frontend (src/) | ~1-2 MB |
| Data Collector (src/) | ~500 KB |
| Documentação (*.md) | ~500 KB |
| Config files | ~100 KB |
| **TOTAL** | **~5-10 MB** |

Se você vê **100+ MB**, algo está errado!

---

## 🚀 Resultado Final

Depois de limpar:

```
$ git push
Enumerating objects: 156, done.
Counting objects: 100% (156/156), done.
Delta compression using up to 8 threads
Compressing objects: 100% (142/142), done.
Writing objects: 100% (156/156), 2.45 MiB | 1.23 MiB/s, done.
Total 156 (delta 28), reused 0 (delta 0), pack-reused 0
To https://github.com/Felipedev4/MES.git
 * [new branch]      main -> main
```

✅ **~2-5 MB total** - Perfeito!

---

**Execute:** `.\limpar-git.ps1` para corrigir automaticamente! 🎉

