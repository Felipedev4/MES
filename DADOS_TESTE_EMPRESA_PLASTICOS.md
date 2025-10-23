# 🏭 Dados de Teste - Empresa de Plásticos

**Data:** 23 de Outubro de 2025  
**Status:** ✅ **IMPLEMENTADO COM SUCESSO**

---

## 📊 Resumo dos Dados Inseridos

| Tipo | Quantidade |
|------|------------|
| 🏢 Empresas | 1 |
| 🏭 Setores | 3 |
| 🎨 Cores | 7 |
| 📁 Tipos de Referência | 4 |
| 🔧 Moldes | 8 |
| 📦 Produtos | 8 |
| 🌈 Cores por Produto | 17 |
| 🎯 Tipos de Atividade | 14 |
| ⚠️ Defeitos | 12 |
| 🖥️ Injetoras/PLCs | 3 |
| 📝 Registros PLC | 15 |

---

## 🏢 Empresa

### Plásticos Industriais LTDA

| Campo | Valor |
|-------|-------|
| **Código** | PLASTICO01 |
| **Nome** | Plásticos Industriais LTDA |
| **Nome Fantasia** | Plasti-Indústria |
| **CNPJ** | 12.345.678/0001-90 |
| **Endereço** | Rua da Indústria, 1000 - Distrito Industrial |
| **Telefone** | (11) 3456-7890 |
| **Email** | contato@plasticoindustrial.com.br |

---

## 🏭 Setores (3)

| Código | Nome | Descrição |
|--------|------|-----------|
| INJ-001 | Injeção - Linha 1 | Linha de injeção de peças pequenas e médias |
| INJ-002 | Injeção - Linha 2 | Linha de injeção de peças grandes |
| SOPRO-01 | Sopro - Linha 1 | Linha de sopro de embalagens |

---

## 🎨 Cores (7)

| Código | Nome | Hex | Descrição |
|--------|------|-----|-----------|
| TRANSP | Transparente | #FFFFFF | PP/PS transparente cristal |
| BRANCO | Branco | #FFFFFF | PP branco leitoso |
| PRETO | Preto | #000000 | PP preto |
| AZUL | Azul | #0066CC | PP azul royal |
| VERMELHO | Vermelho | #CC0000 | PP vermelho |
| AMARELO | Amarelo | #FFCC00 | PP amarelo |
| VERDE | Verde | #00CC00 | PP verde |

---

## 📁 Tipos de Referência (4)

| Código | Nome | Descrição |
|--------|------|-----------|
| EMBALAGEM | Embalagens | Produtos para embalagem de alimentos |
| UTILIDADE | Utilidades Domésticas | Produtos de uso doméstico |
| INDUSTRIAL | Uso Industrial | Componentes industriais |
| DESCARTAVEL | Descartáveis | Produtos descartáveis |

---

## 🔧 Moldes (8)

### Linha 1 - Peças Pequenas

| Código | Nome | Cavidades | Cavidades Ativas | Ciclo (s) |
|--------|------|-----------|------------------|-----------|
| MOL-101 | Tampa Rosqueável 38mm | 16 | 16 | 6.5 |
| MOL-102 | Copo 200ml Descartável | 32 | 32 | 4.8 |
| MOL-103 | Colher Descartável | 64 | 64 | 3.2 |
| MOL-104 | Tampa Pote 500ml | 12 | 12 | 8.5 |

### Linha 2 - Peças Grandes

| Código | Nome | Cavidades | Cavidades Ativas | Ciclo (s) |
|--------|------|-----------|------------------|-----------|
| MOL-201 | Balde 10L | 2 | 2 | 38.0 |
| MOL-202 | Pote Sorvete 2L | 4 | 4 | 22.0 |
| MOL-203 | Caixa Organizadora 15L | 1 | 1 | 55.0 |
| MOL-204 | Bacia 8L | 2 | 2 | 32.0 |

---

## 📦 Produtos (8)

| Código | Nome | Categoria | Cores Disponíveis |
|--------|------|-----------|-------------------|
| PROD-001 | Tampa Rosqueável 38mm Branca | Embalagem | Branca, Azul, Vermelha |
| PROD-002 | Copo 200ml Transparente | Descartável | Transparente |
| PROD-003 | Tampa Pote 500ml Transparente | Embalagem | Transparente, Branca |
| PROD-004 | Pote Sorvete 2L Branco | Embalagem | Branco, Amarelo |
| PROD-005 | Colher Descartável Branca | Descartável | Branca, Preta |
| PROD-006 | Balde 10L Azul | Utilidade Doméstica | Azul, Verde, Vermelho |
| PROD-007 | Caixa Organizadora 15L Transparente | Utilidade Doméstica | Transparente |
| PROD-008 | Bacia 8L Vermelha | Utilidade Doméstica | Vermelha, Azul, Verde |

---

## 🎯 Tipos de Atividade/Paradas (14)

### Paradas Produtivas (4)

| Código | Nome | Cor |
|--------|------|-----|
| SETUP | Setup de Máquina | #2196F3 (Azul) |
| TROCA_MOLDE | Troca de Molde | #03A9F4 (Azul claro) |
| AJUSTE_PROCESSO | Ajuste de Processo | #FF9800 (Laranja) |
| TROCA_MATERIA | Troca de Matéria-Prima | #00BCD4 (Ciano) |

### Paradas Planejadas (4)

| Código | Nome | Cor |
|--------|------|-----|
| MANUT_PREV | Manutenção Preventiva | #4CAF50 (Verde) |
| LIMPEZA_MOLDE | Limpeza de Molde | #8BC34A (Verde claro) |
| ALMOCO | Intervalo Almoço | #CDDC39 (Lima) |
| REUNIAO | Reunião/Treinamento | #9E9E9E (Cinza) |

### Paradas Improdutivas (6)

| Código | Nome | Cor |
|--------|------|-----|
| FALTA_MP | Falta de Matéria-Prima | #F44336 (Vermelho) |
| QUEBRA_EQUIP | Quebra de Equipamento | #FF5722 (Vermelho escuro) |
| QUEBRA_MOLDE | Quebra de Molde | #E91E63 (Rosa) |
| FALTA_ENERGIA | Falta de Energia | #9C27B0 (Roxo) |
| FALTA_OPERADOR | Falta de Operador | #673AB7 (Roxo escuro) |
| RETRABALHO | Retrabalho | #FF6F00 (Laranja escuro) |

---

## ⚠️ Defeitos (12)

### Críticos (3)

| Código | Nome |
|--------|------|
| DEF-001 | Peça Incompleta |
| DEF-002 | Trinca/Rachadura |
| DEF-003 | Fora de Dimensão |

### Altos (3)

| Código | Nome |
|--------|------|
| DEF-004 | Bolha de Ar |
| DEF-005 | Empenamento |
| DEF-006 | Queimado |

### Médios (4)

| Código | Nome |
|--------|------|
| DEF-007 | Rebarba |
| DEF-008 | Mancha/Risco |
| DEF-009 | Cor Irregular |
| DEF-010 | Marca de Ejetor |

### Baixos (2)

| Código | Nome |
|--------|------|
| DEF-011 | Porosidade |
| DEF-012 | Brilho Irregular |

---

## 🖥️ Injetoras/PLCs (3)

| Nome | IP | Porta | Setor | Registros |
|------|-----|-------|-------|-----------|
| Injetora 1 - Haitian MA900 | 192.168.1.10 | 502 | Injeção - Linha 1 | 5 |
| Injetora 2 - Haitian MA1200 | 192.168.1.11 | 502 | Injeção - Linha 1 | 5 |
| Injetora 3 - Haitian MA3500 | 192.168.1.20 | 502 | Injeção - Linha 2 | 5 |

### Registros PLC (por injetora)

| Registro | Endereço | Descrição | Propósito |
|----------|----------|-----------|-----------|
| D33 | 33 | Tempo de Ciclo (décimos de segundo) | CYCLE_TIME |
| D40 | 40 | Contador de Peças Produzidas | PRODUCTION_COUNTER |
| D34 | 34 | Temperatura Zona 1 (°C) | TEMPERATURE |
| D35 | 35 | Pressão de Injeção (bar) | PRESSURE |
| D50 | 50 | Status Máquina (0=parada, 1=rodando) | OTHER |

---

## 🔐 Acesso ao Sistema

### Credenciais

- **URL:** http://localhost:3000
- **Email:** admin@mes.com
- **Senha:** admin123
- **Role:** ADMIN
- **Empresa:** Plásticos Industriais LTDA

---

## 📝 Como Usar

### 1. Criar Ordem de Produção

```sql
INSERT INTO production_orders (
  "orderNumber", "itemId", "moldId", "plcConfigId", "companyId", "sectorId",
  "plannedQuantity", status, priority,
  "plannedStartDate", "plannedEndDate",
  "createdAt", "updatedAt"
)
VALUES (
  'OP-2025-001',
  1,  -- Tampa 38mm
  1,  -- MOL-101
  1,  -- Injetora 1
  1,  -- Plásticos Industriais
  1,  -- Injeção - Linha 1
  10000,  -- 10.000 peças
  'PROGRAMMING',
  10,
  NOW(),
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW()
);
```

### 2. Modificar IPs dos PLCs

Se você tiver PLCs reais, atualize os IPs:

```sql
UPDATE plc_configs 
SET host = '192.168.X.X'
WHERE id = 1;  -- Injetora 1
```

### 3. Limpar e Reinserir Dados

Para limpar e reinserir todos os dados de teste:

```bash
$env:PGPASSWORD='As09kl00__'
psql -U postgres -d mes_db -f LIMPAR_E_INSERIR_DADOS_TESTE.sql
```

---

## 🚀 Próximos Passos

1. ✅ Banco de dados limpo e populado
2. ⏭️ Criar ordens de produção conforme necessário
3. ⏭️ Configurar IPs dos PLCs reais
4. ⏭️ Testar apontamentos de produção
5. ⏭️ Configurar paradas e defeitos

---

## 📚 Arquivos Relacionados

- **`LIMPAR_E_INSERIR_DADOS_TESTE.sql`** - Script completo (reutilizável)
- **`CREDENCIAIS_ACESSO.md`** - Guia de credenciais e acesso
- **`GUIA_SCRIPTS_INICIALIZACAO.md`** - Scripts de inicialização do sistema

---

## ✅ Status do Sistema

| Componente | Status |
|------------|--------|
| Banco de Dados | ✅ Limpo e Populado |
| Dados Cadastrais | ✅ Completos |
| PLCs Configurados | ✅ 3 Injetoras |
| Usuário Admin | ✅ Ativo |
| Backend | ✅ Rodando (3001) |
| Data Collector | ✅ Rodando (3002) |
| Frontend | ✅ Rodando (3000) |

---

**🎉 Sistema pronto para criar ordens de produção e iniciar testes!**

**Data de Criação:** 23 de Outubro de 2025  
**Script Utilizado:** `LIMPAR_E_INSERIR_DADOS_TESTE.sql`  
**Versão:** 1.0.0

