# 📱 MÉTRICAS VERTICAIS NO MOBILE

## ✅ MUDANÇA APLICADA

As **métricas de produção e tempo** agora aparecem **verticalmente** no mobile (uma embaixo da outra).

---

## 📐 LAYOUT MOBILE (iPhone)

### **SEÇÃO: PRODUÇÃO**

```
┌─────────────────────────────────┐
│ Produção                        │
│                                 │
│        ╭─────────╮              │
│       │  14      │              │ ← Gráfico 130px
│        ╰─────────╯              │
│                                 │
├─────────────────────────────────┤
│ Total                           │ ← 100% largura
│ 200000                          │
├─────────────────────────────────┤
│ Perda                           │ ← Logo abaixo!
│ 4281                            │
├─────────────────────────────────┤
│ Faltante                        │ ← Logo abaixo!
│ -31825                          │
└─────────────────────────────────┘
```

### **SEÇÃO: PRODUÇÃO DIÁRIA**

```
┌─────────────────────────────────┐
│ Produção Diária                 │
│                                 │
│ ▓▓▓                             │
│ ▓▓▓ ▓▓                          │ ← Gráfico 120px
│ ─────────                       │
│ 9/26 9/27 ...                   │
│                                 │
├─────────────────────────────────┤
│ Padrão                          │ ← 100% largura
│ 0s                              │
├─────────────────────────────────┤
│ Coletado                        │ ← Logo abaixo!
│ 0s                              │
├─────────────────────────────────┤
│ Total                           │ ← Logo abaixo!
│ 00:00:00                        │
└─────────────────────────────────┘
```

---

## 💻 CÓDIGO APLICADO

### **Métricas de Produção:**

```tsx
<Grid container spacing={{ xs: 0.25, sm: 1.5, md: 2 }}>
  <Grid item xs={12} sm={4}>  {/* xs={12} = 100% vertical */}
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption">Total</Typography>
      <Typography variant="h6">200000</Typography>
    </Box>
  </Grid>
  
  <Grid item xs={12} sm={4}>  {/* xs={12} = 100% vertical */}
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption">Perda</Typography>
      <Typography variant="h6" color="error.main">4281</Typography>
    </Box>
  </Grid>
  
  <Grid item xs={12} sm={4}>  {/* xs={12} = 100% vertical */}
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption">Faltante</Typography>
      <Typography variant="h6">-31825</Typography>
    </Box>
  </Grid>
</Grid>
```

### **Métricas de Tempo:**

```tsx
<Grid container spacing={{ xs: 0.25, sm: 1.5, md: 2 }}>
  <Grid item xs={12} sm={4}>  {/* xs={12} = 100% vertical */}
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption">Padrão</Typography>
      <Typography variant="h6">0s</Typography>
    </Box>
  </Grid>
  
  <Grid item xs={12} sm={4}>  {/* xs={12} = 100% vertical */}
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption">Coletado</Typography>
      <Typography variant="h6">0s</Typography>
    </Box>
  </Grid>
  
  <Grid item xs={12} sm={4}>  {/* xs={12} = 100% vertical */}
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption">Total</Typography>
      <Typography variant="h6">00:00:00</Typography>
    </Box>
  </Grid>
</Grid>
```

---

## 📱 COMPARAÇÃO LAYOUTS

### **MOBILE (xs: 0-599px) - VERTICAL**

```
┌─────────────────┐
│ Total           │
│ 200000          │ ← 100% largura
├─────────────────┤
│ Perda           │
│ 4281            │ ← 100% largura
├─────────────────┤
│ Faltante        │
│ -31825          │ ← 100% largura
└─────────────────┘
```

### **TABLET (sm: 600-899px) - HORIZONTAL**

```
┌──────┬──────┬──────────┐
│Total │Perda │ Faltante │
│200000│4281  │ -31825   │ ← 33% cada
└──────┴──────┴──────────┘
```

### **DESKTOP (md: 900px+) - HORIZONTAL**

```
┌──────┬──────┬──────────┐
│Total │Perda │ Faltante │
│200000│4281  │ -31825   │ ← 33% cada
└──────┴──────┴──────────┘
```

---

## 🎯 ESTRUTURA COMPLETA MOBILE

```
┌─────────────────────────────────┐ iPhone 15 Pro (393px)
│                                 │
│ ← Resumo da Ordem               │ ~18px
│                                 │
├─────────────────────────────────┤
│ Ordem                           │
│ OP-2025-002                     │
│ Cavidades                       │ ~76px
│ 2                               │
│ Item                            │
│ Tampa Plástica 100mm            │
│ Molde                           │
│ Molde Base 2 Cavidades          │
├─────────────────────────────────┤
│ Produção                        │
│     ╭─────────╮                 │
│    │  14      │                 │ ~170px
│     ╰─────────╯                 │
│ Total    | 200000               │
│ Perda    | 4281                 │
│ Faltante | -31825               │
├─────────────────────────────────┤
│ Produção Diária                 │
│ ▓▓▓                             │
│ ▓▓▓ ▓▓                          │ ~160px
│ ─────────                       │
│ Padrão   | 0s                   │
│ Coletado | 0s                   │
│ Total    | 00:00:00             │
├─────────────────────────────────┤
│ Detalhes Apontamento            │
│ [← scroll horizontal →]         │ ~120px
└─────────────────────────────────┘
Total: ~544px (cabe em 852px) ✅
```

---

## ✅ VANTAGENS

### **1. Melhor Legibilidade**
- ✅ Mais espaço para cada métrica
- ✅ Números grandes mais visíveis
- ✅ Labels claros

### **2. Hierarquia Visual**
- ✅ Sequência lógica: Total → Perda → Faltante
- ✅ Fácil de escanear verticalmente
- ✅ Menos confusão visual

### **3. Menos Apinhado**
- ✅ Não precisa comprimir 3 colunas
- ✅ Espaço confortável
- ✅ Touch-friendly

### **4. Consistência**
- ✅ Mesmo padrão das informações básicas
- ✅ Layout previsível
- ✅ Melhor UX mobile

---

## 📊 CÁLCULO DE ALTURA

### **Métricas de Produção (3 itens):**
```
Label "Total":     6px (0.6rem × 1.1)
Valor "200000":    9px (0.8rem × 1.1)
Spacing:           2px
──────────────────────
Label "Perda":     6px
Valor "4281":      9px
Spacing:           2px
──────────────────────
Label "Faltante":  6px
Valor "-31825":    9px
══════════════════════
TOTAL:            ~49px
```

### **Antes (3 colunas lado a lado):**
```
Altura: ~15px (1 linha)
Problema: Números comprimidos
```

### **Depois (vertical):**
```
Altura: ~49px (3 linhas)
Vantagem: Números legíveis
Diferença: +34px (vale a pena!)
```

---

## 🎨 ESPAÇAMENTOS

### **Mobile:**
```tsx
spacing={{ xs: 0.25 }}  // 2px entre itens
py: { xs: 0.25 }        // 2px padding vertical
mt: { xs: 0.1 }         // 0.8px margem top
```

### **Tablet/Desktop:**
```tsx
spacing={{ sm: 1.5, md: 2 }}  // 12-16px entre itens
py: { sm: 0 }                 // Sem padding extra
mt: { sm: 0.5 }               // 4px margem top
```

---

## 🚀 PARA TESTAR

```powershell
cd frontend
npm run build
```

**No iPhone:**
1. Recarregue a página
2. Verifique seção **Produção**:
   - Total (200000)
   - Perda (4281) ← abaixo
   - Faltante (-31825) ← abaixo
3. Verifique seção **Produção Diária**:
   - Padrão (0s)
   - Coletado (0s) ← abaixo
   - Total (00:00:00) ← abaixo

---

## ✅ CHECKLIST

- [x] Mobile: Métricas verticais (xs={12})
- [x] Tablet: Métricas horizontais (sm={4})
- [x] Desktop: Métricas horizontais (md={4})
- [x] Total → Perda → Faltante (ordem lógica)
- [x] Padrão → Coletado → Total (ordem lógica)
- [x] Espaçamento consistente
- [x] Cores preservadas (Perda = vermelho, Faltante = laranja/verde)
- [x] Centralizado
- [x] Legível

---

**Data:** 22/10/2025  
**Layout:** ✅ **MÉTRICAS VERTICAIS NO MOBILE**  
**Ordem:** Total → Perda → Faltante | Padrão → Coletado → Total

