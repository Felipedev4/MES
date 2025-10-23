# Instalação de Dependências do Sistema de E-mail

## 📦 Pacotes Necessários

Execute no terminal do backend:

```bash
cd backend
npm install nodemailer @types/nodemailer node-cron @types/node-cron
npx prisma generate
```

## 📝 Detalhes dos Pacotes

### 1. **nodemailer** (^6.9.7)
- Biblioteca para envio de e-mails via SMTP
- Suporte a Gmail, Outlook, SMTP customizado
- Autenticação TLS/SSL
- Templates HTML

### 2. **@types/nodemailer** (^6.4.14)
- Tipos TypeScript para Nodemailer
- Autocompletar e validação de tipos
- Melhor experiência de desenvolvimento

### 3. **node-cron** (^3.0.3)
- Agendamento de tarefas (cron jobs)
- Execução periódica de funções
- Sintaxe cron padrão Unix

### 4. **@types/node-cron** (^3.0.11)
- Tipos TypeScript para node-cron
- Validação de sintaxe cron
- Autocompletar

---

## ⚡ Comandos Rápidos

### Windows PowerShell
```powershell
cd C:\Empresas\Desenvolvimento\MES\backend
npm install nodemailer @types/nodemailer node-cron @types/node-cron
npx prisma generate
```

### Linux/Mac
```bash
cd /path/to/MES/backend
npm install nodemailer @types/nodemailer node-cron @types/node-cron
npx prisma generate
```

---

## ✅ Verificação

Após instalação, verificar no `package.json`:

```json
{
  "dependencies": {
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.7",
    // ... outras dependências
  },
  "devDependencies": {
    "@types/node-cron": "^3.0.11",
    "@types/nodemailer": "^6.4.14",
    // ... outras dependências de dev
  }
}
```

---

## 🔄 Regenerar Prisma Client

Sempre que o schema.prisma é alterado:

```bash
npx prisma generate
```

Isso cria os tipos TypeScript baseados no schema.

---

## 🧪 Testar Instalação

Criar arquivo de teste `backend/test-email.ts`:

```typescript
import nodemailer from 'nodemailer';
import cron from 'node-cron';

console.log('✅ Nodemailer importado com sucesso');
console.log('✅ Node-cron importado com sucesso');

// Testar agendamento
const task = cron.schedule('* * * * *', () => {
  console.log('Scheduler funcionando!');
});

task.stop();
console.log('✅ Scheduler testado com sucesso');
```

Executar:
```bash
npx ts-node test-email.ts
```

---

## 📊 Tamanho dos Pacotes

| Pacote | Tamanho | Descrição |
|--------|---------|-----------|
| nodemailer | ~350 KB | Core + dependências |
| node-cron | ~25 KB | Leve e eficiente |
| @types/* | Minimal | Apenas tipos TS |

**Total adicional:** ~375 KB

---

## 🔍 Troubleshooting

### Erro: "Module not found"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro ao gerar Prisma
```bash
# Verificar schema.prisma
npx prisma validate

# Forçar regeneração
npx prisma generate --force
```

### Erro de permissão (Linux/Mac)
```bash
sudo npm install nodemailer @types/nodemailer node-cron @types/node-cron
```

---

**Status**: ⏳ **AGUARDANDO INSTALAÇÃO**

