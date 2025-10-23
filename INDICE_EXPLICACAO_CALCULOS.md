# 📚 Índice: Documentação sobre Cálculos e Explicações

## 🎯 Visão Geral

Este índice reúne toda a documentação relacionada a **como os dados são calculados** no sistema MES, especialmente na tela Order Summary.

---

## 📖 Documentos Disponíveis

### 1. 🔍 **EXPLICACAO_0_07_HORAS_OP001.md**
**Descrição:** Análise detalhada técnica de como chegou especificamente no valor de 0.07 horas na OP-2025-001.

**Conteúdo:**
- Dados reais da ordem OP-2025-001
- Cálculo passo a passo com exemplos
- Análise de problemas potenciais
- Queries SQL para diagnóstico
- Fórmulas matemáticas detalhadas

**Quando usar:** Para entender um caso específico ou diagnosticar problemas.

**Leia se:** Você quer entender tecnicamente de onde vem um valor específico.

---

### 2. ⚡ **RESUMO_0_07_HORAS.md**
**Descrição:** Versão resumida e rápida da explicação do cálculo de horas.

**Conteúdo:**
- Fórmula simplificada
- Exemplo com dados reais
- Identificação de problemas
- Ação imediata (SQL)

**Quando usar:** Quando precisa de uma resposta rápida.

**Leia se:** Você quer entender rapidamente sem detalhes técnicos.

---

### 3. 📊 **CALCULAR_0_07_HORAS.sql**
**Descrição:** Script SQL para executar e ver exatamente de onde vêm os valores.

**Conteúdo:**
- Query para soma dos quantity
- Query do timeDivisor
- Cálculo completo reproduzindo frontend
- Análise automática do ciclo
- Últimos 10 apontamentos

**Quando usar:** Para diagnóstico técnico direto no banco de dados.

**Execute:**
```bash
psql -U postgres -d mes_production -f CALCULAR_0_07_HORAS.sql
```

---

### 4. 🔧 **CONFIGURACAO_TIME_DIVISOR.md**
**Descrição:** Guia completo sobre o parâmetro timeDivisor.

**Conteúdo:**
- O que é timeDivisor
- Como funciona
- Opções de configuração (10, 100, 1000)
- Onde é usado no código
- Como alterar

**Quando usar:** Para entender ou configurar o timeDivisor.

**Leia se:** Você precisa ajustar a configuração do CLP.

---

### 5. 📈 **CALCULO_PECAS_POR_HORA_EXPLICACAO.md**
**Descrição:** Explicação detalhada de como é calculado as Peças por Hora.

**Conteúdo:**
- Fórmula base
- Método do Dashboard (backend)
- Método do Order Summary (frontend)
- Exemplos práticos
- Diferenças entre os métodos

**Quando usar:** Para entender diferenças entre dashboard e order summary.

**Leia se:** Você quer entender os diferentes cálculos de produtividade.

---

### 6. 📊 **CALCULO_PECAS_POR_HORA_DETALHADO.md**
**Descrição:** Versão mais técnica e detalhada do cálculo de peças por hora.

**Conteúdo:**
- Análise aprofundada
- Casos de uso específicos
- Exemplos com múltiplas ordens
- Considerações técnicas

**Quando usar:** Para análises técnicas avançadas.

**Leia se:** Você é desenvolvedor ou precisa entender em nível de código.

---

### 7. ✅ **EXPLICACAO_CALCULOS_IMPLEMENTADA.md** ⭐ **NOVO**
**Descrição:** Documentação da implementação do modal explicativo na interface.

**Conteúdo:**
- O que foi implementado
- Onde está no código
- Como funciona
- Características visuais
- Benefícios para o usuário
- Status da implementação

**Quando usar:** Para desenvolvedores que querem entender a implementação.

**Leia se:** Você precisa modificar ou manter o código do modal.

---

### 8. 📘 **GUIA_USUARIO_EXPLICACAO_CALCULOS.md** ⭐ **NOVO**
**Descrição:** Guia completo para o usuário final sobre como usar o modal explicativo.

**Conteúdo:**
- Como acessar o modal
- O que cada seção significa
- Interpretação dos resultados
- Casos de uso práticos
- Resolução de problemas comuns
- Dicas de navegação

**Quando usar:** Para treinar usuários ou tirar dúvidas de uso.

**Leia se:** Você é usuário final e quer entender os cálculos.

---

## 🗺️ Mapa de Navegação Rápida

### Por Perfil:

#### 👤 **Usuário Final**
1. Comece com: `GUIA_USUARIO_EXPLICACAO_CALCULOS.md`
2. Se tiver dúvidas técnicas: `RESUMO_0_07_HORAS.md`
3. Para casos específicos: `EXPLICACAO_0_07_HORAS_OP001.md`

#### 👨‍💻 **Desenvolvedor**
1. Entenda a implementação: `EXPLICACAO_CALCULOS_IMPLEMENTADA.md`
2. Veja o código: `frontend/src/pages/OrderSummary.tsx` (linhas 2108-2424)
3. Entenda o cálculo: `CALCULO_PECAS_POR_HORA_DETALHADO.md`
4. Configure: `CONFIGURACAO_TIME_DIVISOR.md`

#### 🔧 **Suporte Técnico**
1. Diagnóstico rápido: Execute `CALCULAR_0_07_HORAS.sql`
2. Entenda o problema: `EXPLICACAO_0_07_HORAS_OP001.md`
3. Configure: `CONFIGURACAO_TIME_DIVISOR.md`
4. Explique ao usuário: `GUIA_USUARIO_EXPLICACAO_CALCULOS.md`

#### 👔 **Gestor/Supervisor**
1. Visão geral: `RESUMO_0_07_HORAS.md`
2. Entenda para explicar: `GUIA_USUARIO_EXPLICACAO_CALCULOS.md`
3. Análise técnica: `CALCULO_PECAS_POR_HORA_EXPLICACAO.md`

---

## 🎯 Por Objetivo:

### **Quero entender de onde vem um valor específico**
→ `EXPLICACAO_0_07_HORAS_OP001.md`

### **Quero uma explicação rápida**
→ `RESUMO_0_07_HORAS.md`

### **Quero diagnosticar um problema**
→ Execute: `CALCULAR_0_07_HORAS.sql`

### **Quero configurar o timeDivisor**
→ `CONFIGURACAO_TIME_DIVISOR.md`

### **Quero usar o modal na interface**
→ `GUIA_USUARIO_EXPLICACAO_CALCULOS.md`

### **Quero modificar o código**
→ `EXPLICACAO_CALCULOS_IMPLEMENTADA.md`

### **Quero entender diferenças de cálculo**
→ `CALCULO_PECAS_POR_HORA_EXPLICACAO.md`

---

## 📁 Estrutura de Arquivos

```
MES/
├── EXPLICACAO_0_07_HORAS_OP001.md         # Análise detalhada técnica
├── RESUMO_0_07_HORAS.md                    # Resumo rápido
├── CALCULAR_0_07_HORAS.sql                 # Script de diagnóstico
├── CONFIGURACAO_TIME_DIVISOR.md            # Guia de configuração
├── CALCULO_PECAS_POR_HORA_EXPLICACAO.md   # Explicação geral
├── CALCULO_PECAS_POR_HORA_DETALHADO.md    # Análise aprofundada
├── EXPLICACAO_CALCULOS_IMPLEMENTADA.md     # Doc da implementação ⭐
├── GUIA_USUARIO_EXPLICACAO_CALCULOS.md     # Guia do usuário ⭐
└── INDICE_EXPLICACAO_CALCULOS.md           # Este arquivo 📍
```

---

## 🆕 O Que Há de Novo?

### **Implementação do Modal Explicativo** (23/10/2024)

**O que mudou:**
- ✅ Adicionado ícone ℹ️ ao lado de "Peças por Hora"
- ✅ Modal interativo com 4 passos do cálculo
- ✅ Dados reais do usuário exibidos em cada etapa
- ✅ Análise automática do ciclo médio
- ✅ Design responsivo (desktop/tablet/mobile)

**Onde está:**
- Arquivo: `frontend/src/pages/OrderSummary.tsx`
- Linhas: 2108-2424 (modal completo)
- Ícone: Linhas 659-669

**Como usar:**
1. Abra qualquer Order Summary
2. Clique no ícone ℹ️ ao lado de "Peças por Hora"
3. Explore o modal com explicações passo a passo

---

## 🔗 Links Relacionados

### Arquivos de Backend
- `backend/src/controllers/dashboardController.ts` - Cálculo no dashboard
- `backend/src/services/dataCollector.ts` - Coleta de dados do PLC

### Arquivos de Frontend
- `frontend/src/pages/OrderSummary.tsx` - Tela principal e modal explicativo
- `frontend/src/pages/Dashboard.tsx` - Dashboard principal

### Scripts SQL
- `CALCULAR_0_07_HORAS.sql` - Diagnóstico completo
- `VERIFICAR_APONTAMENTOS_PERDIDOS.sql` - Verificar inconsistências

---

## 💡 Dicas

1. **Para usuários:** Comece pelo guia do usuário
2. **Para desenvolvedores:** Leia a documentação de implementação
3. **Para diagnóstico:** Execute o SQL primeiro
4. **Para configuração:** Use o guia do timeDivisor
5. **Para entender:** Leia a explicação detalhada

---

## 📊 Fluxo de Aprendizado Recomendado

```
┌─────────────────────────┐
│   Usuário Iniciante     │
│   GUIA_USUARIO_...md    │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│   Entendeu o Básico?    │
│   RESUMO_0_07_...md     │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│   Quer Mais Detalhes?   │
│   EXPLICACAO_0_07_...md │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│   Tem Problema Técnico? │
│   CALCULAR_0_07_...sql  │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│   Precisa Configurar?   │
│   CONFIGURACAO_TIME...md│
└─────────────────────────┘
```

---

## ✅ Checklist de Leitura

Use esta checklist para garantir que leu toda documentação necessária:

### Para Usuários:
- [ ] Li o guia do usuário
- [ ] Testei o modal na interface
- [ ] Entendi os 4 passos do cálculo
- [ ] Sei interpretar o ciclo médio

### Para Desenvolvedores:
- [ ] Li a documentação de implementação
- [ ] Revisei o código do modal
- [ ] Entendi o cálculo backend vs frontend
- [ ] Sei configurar o timeDivisor

### Para Suporte:
- [ ] Executei o SQL de diagnóstico
- [ ] Entendi os problemas comuns
- [ ] Sei explicar para usuários
- [ ] Conheço todas as configurações

---

## 🆘 Perguntas Frequentes

### **1. Onde encontro a explicação mais rápida?**
→ `RESUMO_0_07_HORAS.md`

### **2. Como uso o modal na tela?**
→ `GUIA_USUARIO_EXPLICACAO_CALCULOS.md`

### **3. O ciclo está muito rápido, o que fazer?**
→ `CONFIGURACAO_TIME_DIVISOR.md` + Execute `CALCULAR_0_07_HORAS.sql`

### **4. Onde está o código do modal?**
→ `frontend/src/pages/OrderSummary.tsx` linhas 2108-2424

### **5. Como treinar novos usuários?**
→ Use `GUIA_USUARIO_EXPLICACAO_CALCULOS.md` como material

---

## 📞 Suporte

Se não encontrou o que procurava:
1. Verifique se leu o documento correto para seu perfil
2. Use o mapa de navegação acima
3. Consulte o fluxo de aprendizado
4. Entre em contato com o suporte técnico

---

**Última atualização:** 23/10/2024  
**Versão:** 1.0  
**Status:** ✅ Completo e Atualizado

