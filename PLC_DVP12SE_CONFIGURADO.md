# 🖥️ PLC DVP12-SE Configurado

**Data:** 23 de Outubro de 2025  
**Status:** ✅ **CONFIGURADO E ATIVO**

---

## 📊 Configuração do PLC

| Parâmetro | Valor |
|-----------|-------|
| **Nome** | CLP Principal - DVP-12SE |
| **Fabricante** | Delta Electronics |
| **Modelo** | DVP12-SE |
| **IP** | 192.168.1.100 |
| **Porta** | 502 (Modbus TCP) |
| **Unit ID** | 1 |
| **Timeout** | 5000 ms |
| **Polling Interval** | 1000 ms (1 segundo) |
| **Reconnect Interval** | 10000 ms (10 segundos) |
| **Time Divisor** | 1 (valores em segundos) |
| **Setor** | Injeção - Linha 1 |
| **Status** | ✅ Ativo |

---

## 📝 Registros Configurados (4)

| Registro | Endereço | Descrição | Propósito | Status |
|----------|----------|-----------|-----------|--------|
| **D33** | 33 | Contador de Produção - Peças produzidas | `PRODUCTION_COUNTER` | ✅ Habilitado |
| **D34** | 34 | Contador de Rejeitos - Peças rejeitadas | `OTHER` | ✅ Habilitado |
| **D35** | 35 | Status da Máquina (0=parada, 1=rodando) | `OTHER` | ✅ Habilitado |
| **D40** | 40 | Velocidade da Linha / Tempo de Ciclo | `CYCLE_TIME` | ✅ Habilitado |

---

## 🎯 Propósito dos Registros

### D33 - Contador de Produção ⭐
- **Tipo:** `PRODUCTION_COUNTER`
- **Função:** Registro principal que cria apontamentos automáticos
- **Comportamento:** Quando o valor aumenta, o sistema cria um apontamento de produção
- **Uso:** Contagem total de peças produzidas desde o início da ordem

### D34 - Contador de Rejeitos
- **Tipo:** `OTHER`
- **Função:** Registro de rejeitos/perdas
- **Comportamento:** Monitoramento apenas, não cria apontamentos automáticos
- **Uso:** Contagem de peças rejeitadas para cálculo de qualidade

### D35 - Status da Máquina
- **Tipo:** `OTHER`
- **Função:** Indica se a máquina está operando
- **Valores:** 
  - `0` = Máquina parada
  - `1` = Máquina rodando
- **Uso:** Monitoramento de disponibilidade

### D40 - Tempo de Ciclo
- **Tipo:** `CYCLE_TIME`
- **Função:** Tempo de ciclo da máquina
- **Unidade:** Segundos (time_divisor = 1)
- **Uso:** Cálculo de performance e OEE

---

## 🔄 Como Funciona

### Apontamento Automático

Quando o **D33** (Contador de Produção) aumenta:

```
Valor anterior: 1000 peças
Valor atual: 1050 peças
Diferença: 50 peças

→ Sistema cria apontamento automático de 50 peças
→ Atualiza producedQuantity da ordem ativa
→ Registra timestamp do apontamento
→ Marca como automatic = true
```

### Monitoramento em Tempo Real

O **Data Collector** monitora todos os registros a cada **1 segundo**:

1. Conecta ao PLC via Modbus TCP
2. Lê os registros D33, D34, D35, D40
3. Compara com valores anteriores
4. Se D33 aumentou → cria apontamento
5. Se D35 mudou → atualiza status da máquina
6. Armazena histórico em `plc_data`

---

## 🔧 Configurar IP do PLC

Se o IP do seu PLC for diferente de `192.168.1.100`, atualize:

```sql
UPDATE plc_configs 
SET host = 'SEU_IP_AQUI'
WHERE name = 'CLP Principal - DVP-12SE';
```

Exemplo:
```sql
-- Se o IP for 192.168.1.15
UPDATE plc_configs 
SET host = '192.168.1.15'
WHERE name = 'CLP Principal - DVP-12SE';
```

---

## 🎯 Vincular Ordem de Produção

Para vincular uma ordem ao PLC:

```sql
UPDATE production_orders
SET "plcConfigId" = 1
WHERE "orderNumber" = 'SUA_ORDEM_AQUI';
```

Ou ao criar uma nova ordem:

```sql
INSERT INTO production_orders (
  "orderNumber", "itemId", "moldId", "plcConfigId", "companyId", "sectorId",
  "plannedQuantity", status, priority,
  "plannedStartDate", "plannedEndDate",
  "createdAt", "updatedAt"
)
VALUES (
  'OP-2025-001',
  1,  -- ID do item
  1,  -- ID do molde
  1,  -- ← PLC DVP12-SE
  1,  -- Plásticos Industriais
  1,  -- Setor Injeção
  10000,
  'ACTIVE',
  10,
  NOW(),
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW()
);
```

---

## 🔄 Reiniciar Data Collector

Após configurar o PLC, **reinicie o Data Collector** para aplicar as mudanças:

### Windows (PowerShell):
```powershell
# Parar Data Collector
Get-Process | Where-Object {$_.ProcessName -eq "node"} | 
  Where-Object {(Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -match 'data-collector'} | 
  Stop-Process -Force

# Iniciar Data Collector
cd C:\Empresas\Desenvolvimento\MES\data-collector
npm start
```

### Ou use o script de reinicialização:
```batch
cd C:\Empresas\Desenvolvimento\MES
REINICIAR_SISTEMA_MES.bat
```

---

## ✅ Verificar Conexão

Após reiniciar, verifique os logs do Data Collector:

```
✅ [API] Servidor iniciado na porta 3002
📡 [MODBUS] Iniciando conexões com PLCs...
🔌 Conectando ao CLP CLP Principal - DVP-12SE em 192.168.1.100:502...
✅ Conectado ao PLC "CLP Principal - DVP-12SE"
📊 [MODBUS] Lendo registros do PLC CLP Principal - DVP-12SE
   • D33: 0
   • D34: 0
   • D35: 0
   • D40: 0
```

Se não conectar, verifique:
- ✅ PLC está ligado
- ✅ IP está correto
- ✅ Firewall não está bloqueando porta 502
- ✅ PLC está na mesma rede

---

## 🧪 Testar Apontamento

Para testar se os apontamentos estão funcionando:

1. **Crie uma ordem ACTIVE vinculada ao PLC**
2. **Simule mudança no D33** (via interface do PLC ou software)
3. **Aguarde 1-2 segundos**
4. **Verifique os apontamentos**:

```sql
SELECT 
  pa.id,
  pa.quantity,
  pa.timestamp,
  pa.automatic,
  pa."clpCounterValue",
  po."orderNumber"
FROM production_appointments pa
INNER JOIN production_orders po ON pa."productionOrderId" = po.id
WHERE pa.automatic = true
ORDER BY pa.timestamp DESC
LIMIT 10;
```

---

## 📊 Monitorar PLC via API

### Health Check do Data Collector:
```
GET http://localhost:3002/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T...",
  "plcs": {
    "total": 1,
    "connected": 1,
    "disconnected": 0,
    "connections": [
      {
        "name": "CLP Principal - DVP-12SE",
        "host": "192.168.1.100",
        "connected": true,
        "lastValue": 1050
      }
    ]
  }
}
```

---

## 📁 Arquivos Relacionados

- **`INSERIR_PLC_DVP12SE.sql`** - Script de configuração (reutilizável)
- **`DADOS_TESTE_EMPRESA_PLASTICOS.md`** - Dados cadastrais de teste
- **`CREDENCIAIS_ACESSO.md`** - Credenciais do sistema

---

## 🔧 Solução de Problemas

### Problema: "Não consegue conectar ao PLC"

**Solução:**
```bash
# Testar ping
ping 192.168.1.100

# Testar porta Modbus
Test-NetConnection -ComputerName 192.168.1.100 -Port 502
```

### Problema: "Apontamentos não estão sendo criados"

**Verificações:**
1. Ordem está com status `ACTIVE`?
2. Ordem está vinculada ao PLC (`plcConfigId = 1`)?
3. Registro D33 está habilitado?
4. D33 está como `PRODUCTION_COUNTER`?
5. Valor do D33 está aumentando?

### Problema: "Valores do PLC sempre 0"

**Causas possíveis:**
- PLC desligado
- Endereço de registro incorreto
- Tipo de dados incompatível
- PLC não está respondendo Modbus

---

## ✅ Status Final

| Item | Status |
|------|--------|
| PLC Configurado | ✅ |
| Registros Criados | ✅ (4 registros) |
| IP Configurado | ✅ (192.168.1.100) |
| Propósitos Definidos | ✅ |
| Pronto para Uso | ✅ |

---

**🎉 PLC DVP12-SE configurado e pronto para produção!**

**Próximo passo:** Criar uma ordem de produção ACTIVE vinculada ao PLC e testar os apontamentos automáticos.

---

**Data de Configuração:** 23 de Outubro de 2025  
**Script Utilizado:** `INSERIR_PLC_DVP12SE.sql`  
**Versão do Sistema:** 1.0.0

