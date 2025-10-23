# 🎨 **IMPLEMENTAÇÃO - COR E DATA/HORA NA ORDEM DE PRODUÇÃO**

## 📋 **Requisitos:**

1. ✅ **Seleção de Cor** ao criar/editar ordem de produção
2. ✅ **Data E Hora** nos campos de data planejada

---

## 🗄️ **Backend - Schema Atualizado:**

### **ProductionOrder:**
```prisma
model ProductionOrder {
  // ... campos existentes
  colorId          Int? // ✅ NOVO: Cor do item para esta ordem
  // ... outros campos
  
  color            Color? @relation(fields: [colorId], references: [id]) // ✅ NOVO
}
```

### **Color:**
```prisma
model Color {
  // ... campos existentes
  productionOrders ProductionOrder[] // ✅ NOVO: Ordens de produção com esta cor
}
```

---

## ✅ **Banco de Dados Atualizado:**

```sql
ALTER TABLE production_orders 
ADD COLUMN "colorId" INTEGER REFERENCES colors(id);
```

**Status:** ✅ Aplicado com `npx prisma db push`

---

## 📝 **Frontend - Modificações Necessárias:**

### **1. Tipos (types/index.ts):**
```typescript
export interface ProductionOrder {
  // ... campos existentes
  colorId?: number;  // ✅ ADICIONADO
  // ... outros campos
  color?: Color;     // ✅ ADICIONADO
}
```

### **2. Página ProductionOrders.tsx:**

#### **Adicionar:**
1. ✅ **State para cores disponíveis**
2. ✅ **State para cores do item selecionado**
3. ✅ **Carregar cores do item ao selecionar item**
4. ✅ **Autocomplete de cores** no dialog
5. ✅ **DateTimePicker** para datas planejadas

---

## 🎯 **Mudanças no Dialog de Criar/Editar:**

### **Campo de Item:**
```typescript
// Ao selecionar item, carregar cores disponíveis
onChange={(_, newValue) => {
  setValue('itemId', newValue?.id);
  if (newValue) {
    loadItemColors(newValue.id);
  }
}}
```

### **NOVO Campo de Cor:**
```typescript
<Autocomplete
  options={itemColors}
  getOptionLabel={(option) => option.name}
  value={selectedColor}
  onChange={(_, newValue) => setValue('colorId', newValue?.id)}
  renderOption={(props, option) => (
    <li {...props}>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: option.hexCode || '#ccc',
          }}
        />
        {option.name}
      </Box>
    </li>
  )}
  renderInput={(params) => (
    <TextField {...params} label="Cor do Item" />
  )}
/>
```

### **Campos de Data com Hora:**
```typescript
// ANTES: Data apenas
<TextField
  type="date"
  label="Data Inicial Planejada"
/>

// DEPOIS: Data e Hora
<TextField
  type="datetime-local"
  label="Data e Hora Inicial Planejada"
/>
```

---

## 🔄 **Fluxo de Criação de Ordem:**

1. Usuário seleciona **Item**
2. Sistema carrega **cores disponíveis** para aquele item
3. Usuário seleciona **Cor** (opcional)
4. Usuário define **Data e Hora Inicial**
5. Usuário define **Data e Hora Final**
6. Sistema salva ordem com `colorId`

---

## 📊 **Backend - Controller Atualizado:**

### **productionOrderController.ts:**
```typescript
export async function createProductionOrder(req, res) {
  const { 
    itemId, 
    colorId,    // ✅ NOVO
    moldId,
    plannedStartDate,  // Agora aceita ISO string com hora
    plannedEndDate,    // Agora aceita ISO string com hora
    // ... outros campos
  } = req.body;
  
  const order = await prisma.productionOrder.create({
    data: {
      itemId,
      colorId,  // ✅ NOVO
      // ... outros campos
    },
    include: {
      item: true,
      color: true,  // ✅ NOVO: incluir cor na resposta
      // ... outros includes
    },
  });
}
```

---

## 🎨 **Visual da Cor na Tabela:**

### **Coluna de Cor:**
```typescript
<TableCell>
  {order.color ? (
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          bgcolor: order.color.hexCode || '#ccc',
          border: '2px solid #fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
      <Typography variant="body2">
        {order.color.name}
      </Typography>
    </Box>
  ) : (
    <Typography variant="body2" color="text.secondary">
      -
    </Typography>
  )}
</TableCell>
```

---

## 📅 **Formato de Data/Hora:**

### **Input:**
```html
<input type="datetime-local" />
<!-- Formato: 2025-10-23T14:30 -->
```

### **Backend:**
```typescript
// Converter string para Date
const plannedStartDate = new Date(req.body.plannedStartDate);
// Ex: "2025-10-23T14:30" → Date object
```

### **Display:**
```typescript
// Formatação para exibição
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Resultado: "23/10/2025 14:30"
```

---

## ✅ **Checklist de Implementação:**

### **Backend:**
- [x] Schema atualizado (colorId em ProductionOrder)
- [x] Migration aplicada
- [x] Prisma Client regenerado
- [x] Backend reiniciado
- [ ] Controller atualizado (include color)
- [ ] Validação de cor pertence ao item

### **Frontend:**
- [x] Tipo ProductionOrder atualizado
- [ ] State para cores do item
- [ ] Carregar cores ao selecionar item
- [ ] Autocomplete de cor
- [ ] DateTimePicker para datas
- [ ] Exibir cor na tabela
- [ ] Formatação de data/hora

---

## 🚀 **Próximos Passos:**

1. ✅ Modificar ProductionOrders.tsx
2. ✅ Atualizar backend controller
3. ✅ Testar criação de ordem com cor
4. ✅ Testar data/hora
5. ✅ Validar que cor pertence ao item

---

**Status:** 🟡 Em Implementação  
**Banco de Dados:** ✅ Atualizado  
**Backend:** 🟡 Parcial  
**Frontend:** 🟡 Pendente

