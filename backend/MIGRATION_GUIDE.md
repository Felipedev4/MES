# Guia de Migration - Configuração Dinâmica do CLP

## Passos para Aplicar as Mudanças

### 1. Criar e Aplicar a Migration

No diretório `backend`, execute:

```bash
npx prisma migrate dev --name add_plc_config
```

Este comando irá:
- Criar a migration com as novas tabelas (`plc_configs` e `plc_registers`)
- Aplicar as mudanças no banco de dados
- Regenerar o Prisma Client

### 2. Popular Dados Iniciais (Opcional)

Execute o seed para criar uma configuração de CLP padrão:

```bash
npx prisma db seed
```

Isso criará:
- Configuração de CLP padrão com base nas variáveis de ambiente
- 3 registros de exemplo (D33, D34, D35)

### 3. Reiniciar o Servidor

O servidor deve reiniciar automaticamente (nodemon) ou reinicie manualmente:

```bash
npm run dev
```

## O que foi Implementado

### ✅ Backend Completo

1. **Schema do Prisma** (`prisma/schema.prisma`)
   - Modelo `PlcConfig`: Configurações de conexão do CLP
   - Modelo `PlcRegister`: Registros individuais para monitoramento

2. **Controller** (`controllers/plcConfigController.ts`)
   - CRUD de configurações de CLP
   - CRUD de registros
   - Ativação/desativação de configurações
   - Teste de conexão

3. **Validators** (`validators/plcConfigValidator.ts`)
   - Validação de dados de configuração
   - Validação de registros
   - Validação de IPs, portas, endereços

4. **Rotas** (`routes/plcConfigRoutes.ts`)
   - `/api/plc-config` - CRUD de configurações
   - `/api/plc-config/active` - Configuração ativa
   - `/api/plc-config/:id/activate` - Ativar configuração
   - `/api/plc-config/test-connection` - Testar conexão
   - `/api/plc-config/registers` - CRUD de registros

5. **Serviço Modbus Refatorado** (`services/modbusService.ts`)
   - Carrega configurações do banco de dados
   - Suporta múltiplos registros
   - Polling configurável por CLP
   - Fallback para variáveis de ambiente

6. **Seed Atualizado** (`prisma/seed.ts`)
   - Cria configuração de CLP de exemplo
   - Cria 3 registros (D33, D34, D35)

### 📚 Documentação Atualizada

- `API_DOCUMENTATION.md` - Endpoints detalhados
- `README.md` - Guia de configuração via frontend
- `INSTALL.md` - Instruções de instalação

## Funcionalidades Disponíveis

### Via API

1. **Criar Configuração de CLP**
   ```bash
   POST /api/plc-config
   {
     "name": "CLP 1",
     "host": "192.168.1.100",
     "port": 502,
     "pollingInterval": 1000
   }
   ```

2. **Adicionar Registro**
   ```bash
   POST /api/plc-config/registers
   {
     "plcConfigId": 1,
     "registerName": "D33",
     "registerAddress": 33,
     "description": "Contador de produção"
   }
   ```

3. **Ativar Configuração**
   ```bash
   POST /api/plc-config/1/activate
   ```

4. **Testar Conexão**
   ```bash
   POST /api/plc-config/test-connection
   {
     "host": "192.168.1.100",
     "port": 502
   }
   ```

### Comportamento do Sistema

1. **Inicialização**
   - Sistema busca configuração ativa no banco
   - Se não encontrar, usa variáveis de ambiente
   - Conecta automaticamente ao CLP configurado

2. **Polling**
   - Lê todos os registros habilitados
   - Intervalo configurável por CLP
   - Emite eventos quando valores mudam

3. **Múltiplos Registros**
   - Suporta D33, D34, D35, etc
   - Cada registro pode ser habilitado/desabilitado
   - Tipos de dados: INT16, INT32, FLOAT, BOOL

4. **Reconexão**
   - Tentativas automáticas de reconexão
   - Intervalo configurável
   - Mantém última configuração ativa

## Próximos Passos (Frontend)

Para completar a funcionalidade, você precisará criar no frontend:

1. **Página de Configuração de CLP**
   - Listagem de configurações
   - Formulário de criação/edição
   - Gerenciamento de registros
   - Botão de teste de conexão
   - Ativação de configuração

2. **Componentes Necessários**
   - `PlcConfigList.tsx` - Lista de configurações
   - `PlcConfigForm.tsx` - Formulário de CLP
   - `PlcRegisterList.tsx` - Lista de registros
   - `PlcRegisterForm.tsx` - Formulário de registro
   - `PlcConnectionTest.tsx` - Teste de conexão

3. **Serviço API**
   - `plcConfigService.ts` - Chamadas à API

## Testando

### 1. Testar Conexão
```bash
curl -X POST http://localhost:3001/api/plc-config/test-connection \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "192.168.1.100",
    "port": 502,
    "unitId": 1,
    "timeout": 5000
  }'
```

### 2. Listar Configurações
```bash
curl http://localhost:3001/api/plc-config \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. Criar Nova Configuração
```bash
curl -X POST http://localhost:3001/api/plc-config \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CLP Produção",
    "host": "192.168.1.100",
    "port": 502,
    "unitId": 1,
    "pollingInterval": 1000
  }'
```

## Troubleshooting

### Erro ao aplicar migration
Se houver erro ao criar a migration, verifique:
- PostgreSQL está rodando
- Credenciais do banco estão corretas no `.env`
- Não há conexões ativas bloqueando o banco

### CLP não conecta
- Verifique se existe uma configuração ativa no banco
- Teste a conexão antes de salvar
- Verifique se o IP/porta estão corretos
- Confirme que o CLP está acessível na rede

### Servidor não inicia
- Verifique se a migration foi aplicada
- Execute `npx prisma generate` para regenerar o client
- Verifique logs de erro no console


