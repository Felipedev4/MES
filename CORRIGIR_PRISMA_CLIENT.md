# Corrigir Prisma Client - Informações de Molde

## Problema
As informações de molde não estão aparecendo porque o Prisma Client precisa ser regenerado após as mudanças no schema.

## ✅ Já Feito
- Banco de dados foi atualizado com sucesso
- Campo `activeCavities` foi adicionado à tabela `molds`

## 🔧 Solução Rápida

### Opção 1: Fechar TUDO e Reiniciar (Recomendado)

1. **Feche TODOS os terminais/prompts abertos**
2. **Feche o VS Code ou Cursor** (isso garante que nenhum processo Node está rodando)
3. **Reabra o VS Code/Cursor**
4. **Abra um novo terminal e execute:**

```bash
# Entre no diretório do backend
cd C:\Empresas\Desenvolvimento\MES\backend

# Regenere o Prisma Client
npx prisma generate

# Inicie o backend
npm run dev
```

5. **Em outro terminal, inicie o frontend:**

```bash
cd C:\Empresas\Desenvolvimento\MES\frontend
npm start
```

### Opção 2: Forçar Parada de Processos

Se a Opção 1 não funcionar, execute no PowerShell como **Administrador**:

```powershell
# Parar TODOS os processos Node
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Ir para o backend
cd C:\Empresas\Desenvolvimento\MES\backend

# Regenerar Prisma Client
npx prisma generate

# Iniciar backend
npm run dev
```

## 📋 Verificação

Após reiniciar, verifique:

1. **Página de Moldes** (`/molds`):
   - ✅ Deve mostrar coluna "Cav. Ativas"
   - ✅ Deve permitir editar o campo "Cavidades Ativas"

2. **Dashboard de Produção**:
   - ✅ Informações do molde devem aparecer
   - ✅ Campo "Cavidade Molde" deve mostrar o valor

3. **Resumo da Ordem**:
   - ✅ Informações de cavidades devem aparecer

## 🐛 Se ainda não funcionar

Execute no terminal do backend:

```bash
# Ver o status do banco
npx prisma db pull

# Forçar regeneração
npx prisma generate --force
```

## ℹ️ Por que isso acontece?

O Prisma Client precisa ser regenerado sempre que o schema muda. O erro `EPERM: operation not permitted` acontece quando:
- Algum processo Node está usando o arquivo
- VS Code/Cursor tem o terminal integrado rodando
- Algum serviço está travando o arquivo .dll do Prisma

**Solução**: Fechar tudo e reiniciar do zero.

