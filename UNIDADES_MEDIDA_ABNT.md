# 📏 Unidades de Medida Conforme ABNT

**Normas Aplicadas**: ABNT NBR 5891 e ABNT NBR ISO 80000-1  
**Data de Implementação**: 24/10/2025

---

## 📖 **Normas ABNT para Unidades de Medida**

### ✅ **Regras Gerais**

1. **Símbolos NÃO levam ponto**
   - ✅ Correto: `10 kg`, `5 m`, `20 L`
   - ❌ Errado: `10 kg.`, `5 m.`, `20 L.`

2. **Símbolos NÃO são pluralizados**
   - ✅ Correto: `1 kg`, `10 kg`, `100 kg`
   - ❌ Errado: `10 kgs`, `100 kgs`

3. **Espaço obrigatório entre número e unidade**
   - ✅ Correto: `10 kg`, `25 °C`, `100 km/h`
   - ❌ Errado: `10kg`, `25°C`, `100km/h`

4. **Símbolos em minúscula, exceto derivados de nomes próprios**
   - ✅ Minúscula: `m` (metro), `kg` (quilograma), `s` (segundo)
   - ✅ Maiúscula: `L` (litro), `Pa` (pascal), `N` (newton), `W` (watt)
   - ℹ️ Exceção: `L` é maiúsculo para evitar confusão com número `1`

5. **Prefixos do SI (Sistema Internacional)**
   - k = quilo (10³) → `km`, `kg`, `kPa`
   - m = mili (10⁻³) → `mm`, `mg`, `mL`
   - M = mega (10⁶) → `MPa`, `MW`
   - G = giga (10⁹) → `GPa`, `GW`

---

## 📦 **Unidades Implementadas no Sistema**

### 🔢 **Contagem**
| Símbolo | Nome | Uso |
|---------|------|-----|
| `un` | unidade | Itens genéricos |
| `pç` | peça | Componentes, produtos |
| `cx` | caixa | Embalagens |
| `par` | par | Pares (sapatos, luvas) |
| `dz` | dúzia | Conjuntos de 12 |
| `jg` | jogo | Conjuntos (ferramentas, utensílios) |

**Exemplos**:
- `100 un` (cem unidades)
- `500 pç` (quinhentas peças)
- `10 cx` (dez caixas)

---

### ⚖️ **Massa**
| Símbolo | Nome | Conversão |
|---------|------|-----------|
| `t` | tonelada | 1 t = 1000 kg |
| `kg` | quilograma | 1 kg = 1000 g |
| `g` | grama | 1 g = 1000 mg |
| `mg` | miligrama | 1 mg = 0,001 g |

**Exemplos**:
- `2,5 t` (duas toneladas e meia)
- `10 kg` (dez quilogramas)
- `500 g` (quinhentos gramas)

---

### 📏 **Comprimento**
| Símbolo | Nome | Conversão |
|---------|------|-----------|
| `km` | quilômetro | 1 km = 1000 m |
| `m` | metro | 1 m = 100 cm |
| `cm` | centímetro | 1 cm = 10 mm |
| `mm` | milímetro | 1 mm = 0,1 cm |

**Exemplos**:
- `15 km` (quinze quilômetros)
- `2,5 m` (dois metros e meio)
- `150 cm` (cento e cinquenta centímetros)

---

### 📐 **Área**
| Símbolo | Nome | Conversão |
|---------|------|-----------|
| `m²` | metro quadrado | 1 m² = 10000 cm² |
| `cm²` | centímetro quadrado | 1 cm² = 100 mm² |

**Exemplos**:
- `25 m²` (vinte e cinco metros quadrados)
- `500 cm²` (quinhentos centímetros quadrados)

---

### 🧊 **Volume**
| Símbolo | Nome | Conversão |
|---------|------|-----------|
| `m³` | metro cúbico | 1 m³ = 1000 L |
| `L` | litro | 1 L = 1000 mL |
| `mL` | mililitro | 1 mL = 0,001 L |

**Exemplos**:
- `2,5 m³` (dois metros cúbicos e meio)
- `10 L` (dez litros)
- `250 mL` (duzentos e cinquenta mililitros)

⚠️ **Importante**: `L` é **maiúsculo** conforme ABNT!

---

### ⏱️ **Tempo**
| Símbolo | Nome | Conversão |
|---------|------|-----------|
| `h` | hora | 1 h = 60 min |
| `min` | minuto | 1 min = 60 s |
| `s` | segundo | 1 s = 1000 ms |
| `ms` | milissegundo | 1 ms = 0,001 s |

**Exemplos**:
- `2 h 30 min` (duas horas e trinta minutos)
- `45 min` (quarenta e cinco minutos)
- `120 s` (cento e vinte segundos)
- `15,5 s` (quinze segundos e meio)

⚠️ **Importante**: Usar `min` (não `m`), `s` (não `seg`), `h` (não `hr`)

---

## 💻 **Implementação no Código**

### Arquivo: `frontend/src/pages/Items.tsx`
```typescript
// Unidades de medida conforme ABNT NBR 5891 e NBR ISO 80000-1
const UNIT_OPTIONS = [
  // Unidades de contagem
  { value: 'un', label: 'Unidade (un)' },
  { value: 'pç', label: 'Peça (pç)' },
  // ... (28 unidades disponíveis)
];
```

### Arquivo: `frontend/src/utils/units.ts`
Funções utilitárias para formatação:
- `formatTime(seconds)` → `"2 h 30 min"`
- `formatCycleTime(seconds)` → `"15,5 s"`
- `formatMass(value, unit)` → `"10 kg"`
- `formatQuantity(value, unit)` → `"100 un"`

---

## 📊 **Exemplos de Uso no Sistema**

### ✅ **Correto** (conforme ABNT):
```
Quantidade planejada: 1000 pç
Peso total: 25,5 kg
Tempo de ciclo: 15,5 s
Temperatura: 180 °C
Volume: 2,5 L
Velocidade: 50 m/min
```

### ❌ **Incorreto** (NÃO seguem ABNT):
```
Quantidade planejada: 1000 peças  ❌ (usar "pç")
Peso total: 25,5 KG  ❌ (usar "kg" minúsculo)
Tempo de ciclo: 15,5 segs  ❌ (usar "s" sem plural)
Temperatura: 180°C  ❌ (falta espaço)
Volume: 2,5 l  ❌ (usar "L" maiúsculo)
Velocidade: 50 mpm  ❌ (usar "m/min")
```

---

## 🔄 **Conversões Automáticas**

O sistema fornece funções para conversão automática:

```typescript
// Tempo
formatTime(3665) → "1 h 1 min 5 s"
formatCycleTime(15.5) → "15,5 s"

// Massa
formatMass(1500, 'g') → "1 500 g"  // Separador de milhar pt-BR
formatMass(1.5, 'kg') → "1,5 kg"   // Vírgula decimal pt-BR

// Quantidade
formatQuantity(1000, 'pç') → "1 000 pç"
formatQuantityExtensive(10, 'kg') → "10 quilogramas"
```

---

## 📚 **Referências**

### Normas ABNT Aplicadas:
1. **ABNT NBR 5891:2014** - Regras de arredondamento e de representação numérica
2. **ABNT NBR ISO 80000-1:2013** - Grandezas e unidades — Parte 1: Generalidades

### Principais Pontos das Normas:

**NBR 5891**:
- Define separador decimal (vírgula no Brasil)
- Define separador de milhares (espaço)
- Regras de arredondamento

**NBR ISO 80000-1**:
- Símbolos de unidades do Sistema Internacional (SI)
- Regras de escrita de símbolos
- Prefixos multiplicadores
- Unidades derivadas

---

## ✅ **Checklist de Conformidade**

Para garantir conformidade ABNT:

- [x] Símbolos sem ponto final
- [x] Símbolos sem plural
- [x] Espaço entre número e unidade
- [x] Minúsculas (exceto nomes próprios)
- [x] `L` maiúsculo para litro
- [x] `min` para minuto (não `m`)
- [x] Vírgula para decimal (pt-BR)
- [x] Espaço para separador de milhares
- [x] Símbolos padronizados (s, min, h, kg, m, L)
- [x] Unidades derivadas com barra (m/s, km/h)

---

## 🎯 **Benefícios da Padronização**

1. ✅ **Conformidade Legal** - Atende normas brasileiras
2. ✅ **Clareza** - Comunicação técnica precisa
3. ✅ **Profissionalismo** - Padrão industrial reconhecido
4. ✅ **Interoperabilidade** - Compatível com outros sistemas
5. ✅ **Auditoria** - Facilita certificações ISO/ABNT
6. ✅ **Documentação** - Relatórios técnicos padronizados

---

## 🔧 **Manutenção**

### Adicionar Nova Unidade:

1. **Frontend** (`Items.tsx`):
```typescript
{ value: 'nova', label: 'Nome Completo (símbolo)' }
```

2. **Utilidades** (`units.ts`):
```typescript
UNIT_LABELS['nova'] = 'nome singular';
UNIT_LABELS_PLURAL['nova'] = 'nome plural';
```

3. **Validar conformidade ABNT**:
   - Símbolo oficial?
   - Minúscula (exceto nome próprio)?
   - Sem ponto, sem plural?

---

## 📞 **Suporte Técnico**

Para dúvidas sobre unidades de medida:
- Consultar: ABNT NBR 5891 e NBR ISO 80000-1
- Verificar: INMETRO (Instituto Nacional de Metrologia)
- Site: https://www.gov.br/inmetro

---

**Status**: 🟢 **IMPLEMENTADO E ATIVO**  
**Última Atualização**: 24/10/2025  
**Desenvolvedor**: Felipe

