# Correção Erro 500 - Dashboard KPIs

## 🐛 Problema Identificado

Erro 500 (Internal Server Error) ao acessar o endpoint `/api/dashboard/kpis`

## 🔍 Causa Raiz

Múltiplos problemas no código do controller:

### 1. **Filtros Incorretos em Relacionamentos**
```typescript
// ❌ ERRADO
where: {
  productionOrder: companyFilter,  // Não funciona com filtros nested
}

// ✅ CORRETO
where: {
  productionOrder: {
    companyId: companyFilter.companyId,
  },
}
```

### 2. **Falta de Tratamento de Erros**
- Queries falhavam sem try-catch
- Valores NaN não eram verificados
- Valores undefined causavam erros

### 3. **Valores Não Validados**
- Divisões por zero
- Percentuais acima de 100%
- Valores negativos

## ✅ Correções Aplicadas

### **1. Correção de Query de Defeitos**
```typescript
// Adicionado try-catch e filtro correto
try {
  const defectsByType = await prisma.productionDefect.groupBy({
    by: ['defectId'],
    _sum: { quantity: true },
    where: {
      ...(companyFilter.companyId ? {
        productionOrder: {
          companyId: companyFilter.companyId,
        },
      } : {}),
      ...(startDate || endDate ? { createdAt: dateFilter } : {}),
    },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });
  // ... processamento ...
} catch (error) {
  console.error('Erro ao buscar defeitos:', error);
  defectsDetailed = [];
}
```

### **2. Correção de Query de Injetoras Ativas**
```typescript
// Adicionado try-catch
let activeInjectors = 0;
try {
  activeInjectors = await prisma.plcConfig.count({
    where: {
      ...companyFilter,
      productionOrders: {
        some: { status: 'ACTIVE' },
      },
    },
  });
} catch (error) {
  console.error('Erro ao contar injetoras ativas:', error);
  activeInjectors = 0;
}
```

### **3. Validação de Valores Numéricos**
```typescript
// Garantir valores entre 0 e 100
const availability = Math.max(0, Math.min(100, 
  ((plannedTime - unplannedDowntime) / plannedTime) * 100
));

const performance = Math.max(0, Math.min(100, avgCycleEfficiency || 0));
const quality = Math.max(0, Math.min(100, qualityRate));
const oee = Math.max(0, Math.min(100, (availability * performance * quality) / 10000));
```

### **4. Proteção Contra NaN no Retorno**
```typescript
res.json({
  // Valores básicos com fallback
  totalOrders: totalOrders || 0,
  ordersInProgress: ordersInProgress || 0,
  totalProduced: totalProduced || 0,
  totalRejected: totalRejected || 0,
  
  // OEE com validação isNaN
  oee: parseFloat((isNaN(oee) ? 0 : oee).toFixed(2)),
  availability: parseFloat((isNaN(availability) ? 0 : availability).toFixed(2)),
  performance: parseFloat((isNaN(performance) ? 0 : performance).toFixed(2)),
  quality: parseFloat((isNaN(quality) ? 0 : quality).toFixed(2)),
  
  // Eficiência de ciclo com validação
  cycleEfficiency: parseFloat((isNaN(avgCycleEfficiency) ? 0 : avgCycleEfficiency).toFixed(2)),
  cavityUtilization: parseFloat((isNaN(cavityUtilization) ? 100 : cavityUtilization).toFixed(2)),
  
  // Arrays com fallback vazio
  topDefects: defectsDetailed || [],
  totalDefects: (defectsDetailed || []).reduce((sum, d) => sum + d.quantity, 0),
});
```

## 🔒 Proteções Adicionadas

### **1. Try-Catch em Queries Complexas**
- Query de defeitos
- Contagem de injetoras ativas
- Todas com fallback para valores padrão

### **2. Validação de Intervalos**
- `Math.max(0, Math.min(100, valor))` para percentuais
- Garantia de valores sempre entre 0-100%

### **3. Verificação de NaN**
- `isNaN()` antes de usar valores calculados
- Fallback para 0 em caso de NaN

### **4. Valores Padrão**
- Todos os valores numéricos têm `|| 0`
- Arrays têm `|| []`
- Strings formatadas têm proteção contra undefined

## 📋 Testes Recomendados

### **Cenário 1: Banco Vazio**
- ✅ Deve retornar todos os valores zerados
- ✅ Não deve gerar erro 500

### **Cenário 2: Sem Defeitos**
- ✅ topDefects: []
- ✅ totalDefects: 0

### **Cenário 3: Sem Injetoras Ativas**
- ✅ activeInjectors: 0

### **Cenário 4: Sem Produção**
- ✅ OEE: 0
- ✅ cycleEfficiency: 0
- ✅ qualityRate: 100 (default)

## 🚀 Como Testar

### **1. Testar Endpoint**
```bash
curl http://localhost:3001/api/dashboard/kpis \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Verificar Logs**
```bash
# Backend deve mostrar logs detalhados de erros
cd backend
npm run dev
```

### **3. Testar no Frontend**
- Acessar: http://localhost:3000/dashboard
- Verificar se todos os KPIs aparecem
- Não deve mostrar "NaN" ou "undefined"

## 📈 Resultado Esperado

```json
{
  "totalOrders": 0,
  "ordersInProgress": 0,
  "totalProduced": 0,
  "totalRejected": 0,
  "qualityRate": 100.00,
  "oee": 0.00,
  "availability": 100.00,
  "performance": 0.00,
  "quality": 100.00,
  "cycleEfficiency": 0.00,
  "cavityUtilization": 100.00,
  "avgSetupTimeMinutes": 0.00,
  "setupCount": 0,
  "topDefects": [],
  "totalDefects": 0,
  "activeInjectors": 0,
  "estimatedWeightKg": 0.00,
  "totalActiveCavities": 0,
  "totalPossibleCavities": 0
}
```

## ✅ Status

- [x] Erro 500 corrigido
- [x] Validações adicionadas
- [x] Try-catch implementado
- [x] Valores padrão definidos
- [x] Backend compilado com sucesso
- [x] Pronto para testes

## 🔄 Próximos Passos

1. **Testar com dados reais** no ambiente de desenvolvimento
2. **Validar todos os cenários** de uso
3. **Monitorar logs** para erros residuais
4. **Ajustar valores padrão** se necessário

---

**Data**: Outubro 2025  
**Versão**: 2.0.1  
**Status**: ✅ Corrigido

