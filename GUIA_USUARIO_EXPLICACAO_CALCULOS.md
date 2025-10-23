# 📘 Guia do Usuário: Entendendo os Cálculos da Ordem de Produção

## 🎯 O Que É?

Agora você pode entender exatamente **como chegamos nos valores** exibidos na tela de resumo da ordem de produção, especialmente:
- **Peças por Hora**
- **Horas de Produção**
- **Ciclo Médio**

---

## 🚀 Como Acessar

### Passo 1: Abra uma Ordem de Produção
Navegue até **Resumo da Ordem** (Order Summary) de qualquer ordem de produção ativa.

### Passo 2: Localize o Card "Peças por Hora"
No topo da tela, você verá um card destacado em azul claro com o título **"Peças por Hora"**.

### Passo 3: Clique no Ícone de Informação
Ao lado do título "Peças por Hora", há um pequeno ícone **ℹ️**. Clique nele!

### Passo 4: Explore o Modal
Uma janela se abrirá mostrando todo o cálculo passo a passo com **seus dados reais**.

---

## 📊 O Que Você Vai Ver

### 🎯 Resumo do Cálculo

Logo no topo, você verá o cálculo principal em destaque:

```
657 peças ÷ 0.07 horas = 9,386 peças/hora
```

Isso mostra claramente:
- Quantas peças foram produzidas
- Em quanto tempo (em horas)
- Qual a taxa de produção (peças/hora)

---

### 📊 Passo a Passo Detalhado

O modal explica **4 etapas** de como chegamos nesses valores:

#### **Passo 1️⃣: Somar Todos os Tempos Coletados**

Mostra:
- Quantos apontamentos (ciclos) foram registrados
- A soma total dos tempos coletados do PLC

**Exemplo:**
```
• Total de apontamentos: 219
• Soma total dos tempos: 2.520 unidades
```

---

#### **Passo 2️⃣: Converter para Segundos**

Explica o **timeDivisor** - um número que converte as unidades do PLC em segundos:

- **timeDivisor = 10** → Décimos de segundo (51 unidades = 5,1 segundos)
- **timeDivisor = 100** → Centésimos de segundo
- **timeDivisor = 1000** → Milissegundos

**Exemplo:**
```
• Total em unidades: 2.520
• Divisor configurado: 10
• Total em segundos: 252 segundos
```

---

#### **Passo 3️⃣: Converter para Horas** ⭐ **AQUI APARECE O 0.07!**

Esta é a etapa que gera o valor de horas:

**Fórmula:** `Total em segundos ÷ 3600 = Horas`

**Exemplo:**
```
• Total em segundos: 252
• Total em horas: 0.07 horas
• Equivalente a: 0:04:00 (4 minutos)
```

---

#### **Passo 4️⃣: Calcular Produtividade**

Finalmente, divide as peças produzidas pelo tempo em horas:

**Fórmula:** `Peças Produzidas ÷ Tempo (horas) = Peças por Hora`

**Exemplo:**
```
• Peças produzidas: 657
• Tempo de produção: 0.07 horas
• Produtividade: 9,386 peças/hora 🎯
```

---

## ⏱️ Análise Automática do Ciclo

No final do modal, há uma seção que analisa automaticamente o **ciclo médio** da sua produção:

### Interpretação dos Resultados:

| Ciclo Médio | Significado | Ação |
|-------------|-------------|------|
| **< 5 segundos** | ⚠️ Muito rápido! | Verificar se timeDivisor está correto |
| **5-15 segundos** | ⚡ Rápido | Normal para peças pequenas |
| **15-40 segundos** | ✅ Normal | Faixa esperada para injeção |
| **> 40 segundos** | 🐌 Lento | Normal para peças grandes |

---

## 💡 Informações Importantes

O modal também mostra pontos importantes:

✅ O tempo é coletado **automaticamente** do PLC a cada ciclo  
✅ O **timeDivisor** é configurado no cadastro do CLP  
✅ Apenas tempo de **produção ativa** é contabilizado (sem paradas)  
✅ A produtividade reflete a **taxa média real**

---

## 🔍 Casos de Uso

### **Caso 1: Entender Por Que o Valor Parece Errado**

Se você acha que "0.07 horas" está errado, o modal vai mostrar:
1. De onde esse número vem
2. Quantos apontamentos foram usados
3. Qual o timeDivisor configurado
4. Se o ciclo médio está normal

**Solução Comum:** Se o ciclo médio for muito rápido (< 5s), o **timeDivisor** provavelmente está incorreto e precisa ser ajustado no cadastro do CLP.

---

### **Caso 2: Validar os Dados de Produção**

Use o modal para verificar se:
- O número de apontamentos está correto
- O tempo total faz sentido
- A produtividade calculada é realista

---

### **Caso 3: Explicar para Gestão/Supervisão**

O modal serve como documentação visual para:
- Mostrar transparência nos cálculos
- Explicar de onde vêm os números
- Justificar metas de produção

---

## 🐛 Problemas Comuns e Soluções

### **Problema 1: "O ciclo está muito rápido (< 5 segundos)"**

**Causa:** O timeDivisor provavelmente está incorreto.

**Solução:**
1. Verifique no cadastro do CLP qual é o timeDivisor atual
2. Se o PLC envia em milissegundos, use timeDivisor = 1000
3. Se envia em décimos de segundo, use timeDivisor = 10

---

### **Problema 2: "A produtividade está muito baixa"**

**Causa:** Tempo muito alto em relação às peças produzidas.

**Solução:**
1. Verifique se há paradas não registradas
2. Confira se o timeDivisor está correto
3. Analise o ciclo médio para ver se está dentro do esperado

---

### **Problema 3: "Os valores não fazem sentido"**

**Causa:** Dados inconsistentes ou configuração errada.

**Solução:**
1. Abra o modal de explicação
2. Verifique cada passo do cálculo
3. Anote qual etapa tem valores estranhos
4. Reporte ao suporte técnico com essas informações

---

## 📱 Dicas de Navegação

### **No Desktop:**
- Modal abre em janela centralizada
- Fácil de ler e navegar
- Use scroll se necessário

### **No Mobile:**
- Modal abre em tela cheia
- Otimizado para toque
- Scroll suave entre seções

---

## 🎓 Entendendo os Termos Técnicos

| Termo | O Que Significa |
|-------|-----------------|
| **quantity** | Campo que armazena o tempo de cada ciclo (do PLC) |
| **timeDivisor** | Número que converte unidades do PLC em segundos |
| **D33** | Registrador do PLC que armazena o tempo do ciclo |
| **Apontamento** | Cada registro de ciclo de produção |
| **Ciclo** | Tempo que leva para produzir um conjunto de peças |

---

## ✅ Resumo Rápido

1. 🔍 **Encontre** o ícone ℹ️ ao lado de "Peças por Hora"
2. 👆 **Clique** no ícone
3. 📊 **Veja** os 4 passos do cálculo
4. 📌 **Confira** seus dados reais em cada etapa
5. ⏱️ **Analise** se o ciclo médio está normal
6. ❌ **Feche** o modal quando terminar

---

## 🆘 Precisa de Ajuda?

Se ainda tiver dúvidas:

1. **Releia este guia** com atenção
2. **Abra o modal** e compare com seus dados
3. **Tire um print** do modal para análise
4. **Consulte** o supervisor ou suporte técnico

---

## 📞 Suporte

Em caso de problemas ou dúvidas:
- Tire um print do modal mostrando os dados
- Anote qual passo está com valores estranhos
- Entre em contato com o suporte técnico

---

**Lembre-se:** Este modal é uma ferramenta de **transparência e educação**. Use-o sempre que tiver dúvidas sobre os valores exibidos!

🎯 **Objetivo:** Dar total visibilidade de como os dados são calculados, aumentando a confiança no sistema.

