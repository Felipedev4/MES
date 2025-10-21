# MES Data Collector Service

Serviço independente para coleta de dados de CLPs via Modbus TCP.

## Descrição

O Data Collector é um serviço Node.js que roda no Raspberry Pi 5 e é responsável por:

- Conectar-se a múltiplos CLPs via Modbus TCP
- Fazer polling periódico dos registros configurados
- Armazenar dados brutos na tabela `plc_data`
- Monitorar ordens de produção ativas
- Criar apontamentos automáticos quando detectar mudanças nos registros

## Arquitetura

```
┌─────────────────────────────────────────┐
│     Data Collector Service              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      PlcPoolManager               │ │
│  │  (gerencia múltiplos CLPs)        │ │
│  └─────────┬────────────────┬────────┘ │
│            │                │           │
│  ┌─────────▼───────┐ ┌─────▼────────┐ │
│  │  PlcConnection  │ │ PlcConnection│ │
│  │   (CLP 1)       │ │   (CLP 2)    │ │
│  └─────────┬───────┘ └──────┬───────┘ │
│            │                 │          │
│  ┌─────────▼─────────────────▼───────┐ │
│  │     ProductionMonitor             │ │
│  │  (cria apontamentos automáticos)  │ │
│  └───────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │
           ┌──────▼──────┐
           │ PostgreSQL  │
           └─────────────┘
```

## Instalação

### Pré-requisitos

- Node.js 18+ LTS
- npm ou yarn
- Acesso ao banco de dados PostgreSQL
- Rede com acesso aos CLPs

### Passos

1. Clone o repositório:
```bash
git clone <repo-url>
cd data-collector
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
nano .env
```

4. Configure o Prisma:
```bash
npx prisma generate
```

## Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mes_db"

# Server
PORT=3001
NODE_ENV=production

# Configurações
CONFIG_RELOAD_INTERVAL=30000  # Recarregar configs a cada 30s
ENABLE_HEALTH_CHECK=true

# Logs
LOG_LEVEL=info
```

### Configuração de CLPs

As configurações de CLPs são gerenciadas via banco de dados através da tabela `plc_configs`.

Você pode criar configurações através da API do backend principal ou diretamente no banco:

```sql
INSERT INTO plc_configs (name, host, port, unit_id, polling_interval, sector_id, active)
VALUES ('CLP Linha 1', '192.168.1.10', 502, 1, 1000, 1, true);

INSERT INTO plc_registers (plc_config_id, register_name, register_address, description, enabled)
VALUES 
  (1, 'D33', 33, 'Contador de produção', true),
  (1, 'D34', 34, 'Contador de refugo', true);
```

## Uso

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

### Com Docker (opcional)

```bash
docker build -t mes-data-collector .
docker run -d --name data-collector mes-data-collector
```

## Health Check

O serviço expõe endpoints de health check:

```bash
# Status detalhado
curl http://localhost:3001/health

# Status resumido
curl http://localhost:3001/status
```

Exemplo de resposta:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": {
    "connected": true
  },
  "plcs": {
    "total": 2,
    "connected": 2,
    "disconnected": 0,
    "details": [
      {
        "id": 1,
        "name": "CLP Linha 1",
        "host": "192.168.1.10",
        "port": 502,
        "connected": true,
        "lastRead": "2024-01-15T10:29:58.000Z",
        "errorCount": 0,
        "registersCount": 2
      }
    ]
  },
  "memory": {
    "used": 45,
    "total": 128,
    "unit": "MB"
  }
}
```

## Deploy no Raspberry Pi

### 1. Instalação Inicial

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clonar repositório
sudo mkdir -p /opt/mes
sudo chown pi:pi /opt/mes
git clone <repo-url> /opt/mes/data-collector
cd /opt/mes/data-collector

# Instalar dependências
npm install --production
npm run build
```

### 2. Configurar como Serviço Systemd

Criar arquivo `/etc/systemd/system/mes-data-collector.service`:

```ini
[Unit]
Description=MES Data Collector Service
After=network.target postgresql.service

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/mes/data-collector
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/mes/data-collector/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Ativar e iniciar o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mes-data-collector
sudo systemctl start mes-data-collector
```

### 3. Gerenciar Serviço

```bash
# Ver status
sudo systemctl status mes-data-collector

# Ver logs
sudo journalctl -u mes-data-collector -f

# Reiniciar
sudo systemctl restart mes-data-collector

# Parar
sudo systemctl stop mes-data-collector
```

## Logs

Os logs são gerenciados pelo Winston e podem ser visualizados de várias formas:

```bash
# Logs do systemd
sudo journalctl -u mes-data-collector -f

# Logs em arquivo (produção)
tail -f logs/combined.log
tail -f logs/error.log
```

## Troubleshooting

### CLP não conecta

1. Verificar se o IP e porta estão corretos
2. Testar conectividade: `ping <ip-do-clp>`
3. Verificar firewall
4. Conferir logs do serviço

### Banco de dados não conecta

1. Verificar DATABASE_URL
2. Testar conexão: `psql "postgresql://..."`
3. Verificar se PostgreSQL está rodando
4. Conferir permissões de rede

### Serviço não inicia

1. Verificar logs: `sudo journalctl -u mes-data-collector -n 50`
2. Testar manualmente: `node dist/index.js`
3. Verificar permissões de arquivos
4. Conferir variáveis de ambiente

### Apontamentos não são criados

1. Verificar se há ordens IN_PROGRESS
2. Verificar se setor está configurado corretamente
3. Conferir logs de mudança de valores
4. Verificar se incremento é positivo

## Monitoramento

### Prometheus (opcional)

Você pode adicionar métricas Prometheus:

```bash
npm install prom-client
```

### Grafana (opcional)

Criar dashboard com:
- Taxa de leitura de registros
- Conexões ativas
- Erros por CLP
- Apontamentos criados

## Desenvolvimento

### Estrutura de Código

```
src/
├── config/
│   └── database.ts       # Configuração Prisma
├── services/
│   ├── PlcConnection.ts  # Conexão individual com CLP
│   ├── PlcPoolManager.ts # Gerenciador de pool
│   ├── ProductionMonitor.ts # Monitor de produção
│   └── HealthCheck.ts    # Health check
├── utils/
│   └── logger.ts         # Sistema de logs
└── index.ts              # Entry point
```

### Testes

```bash
npm test
```

## Licença

MIT

