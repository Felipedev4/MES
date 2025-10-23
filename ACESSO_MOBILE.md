# 📱 Acesso Móvel - Guia de Configuração

## 🎯 Problema Resolvido
A aplicação não estava logando de dispositivos móveis devido a restrições de CORS.

---

## ✅ Solução Implementada

### **1. Backend - CORS Permissivo**

Modificado `backend/src/server.ts` para aceitar requisições de qualquer origem quando `FRONTEND_URL=*`:

```typescript
// Configuração de CORS para permitir acesso de dispositivos móveis
const corsOptions = process.env.FRONTEND_URL === '*' 
  ? { 
      origin: true, // Permite qualquer origem
      credentials: true,
    }
  : {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    };

app.use(cors(corsOptions));
```

### **2. Arquivos de Configuração**

#### **backend/.env**
```env
# URL do Frontend (para CORS)
# * permite acesso de qualquer origem
FRONTEND_URL=*
```

#### **frontend/.env.development**
```env
# Use o IP da sua máquina para acesso móvel
REACT_APP_API_URL=http://192.168.2.105:3001
```

---

## 🔧 Como Configurar para Acesso Móvel

### **Passo 1: Descobrir o IP da Máquina**

**Windows:**
```bash
ipconfig
```

**Linux/Mac:**
```bash
ifconfig
```

Procure pelo IP da rede WiFi ou Ethernet (ex: `192.168.x.x`).

No seu caso, os IPs disponíveis são:
- **WiFi:** `192.168.2.105` ← Use este se o celular está na mesma WiFi
- **Ethernet 1:** `192.168.1.10`
- **Ethernet 2:** `10.81.234.17`

### **Passo 2: Configurar Backend**

Edite `backend/.env`:
```env
FRONTEND_URL=*
```

### **Passo 3: Configurar Frontend**

Edite `frontend/.env.development`:
```env
# Substitua pelo IP da sua máquina
REACT_APP_API_URL=http://192.168.2.105:3001
```

### **Passo 4: Reiniciar Servidores**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

### **Passo 5: Acessar do Celular**

No navegador do celular, acesse:
```
http://192.168.2.105:3000
```

⚠️ **Importante:** O celular precisa estar na **mesma rede WiFi** que a máquina!

---

## 🧪 Testar a Conexão

### **Do Desktop:**
```bash
# No navegador:
http://localhost:3000
```

### **Do Celular:**
```bash
# No navegador:
http://192.168.2.105:3000
```

### **Testar API:**
```bash
# No celular, acesse:
http://192.168.2.105:3001/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T...",
  "service": "MES API",
  "version": "1.0.0"
}
```

---

## 🔒 Segurança em Produção

⚠️ **ATENÇÃO:** `FRONTEND_URL=*` permite acesso de **qualquer origem**.

### **Em Produção, use:**

```env
# backend/.env (produção)
FRONTEND_URL=https://seu-dominio.com
```

Ou especifique múltiplas origens no código:
```typescript
const allowedOrigins = [
  'https://seu-dominio.com',
  'https://app.seu-dominio.com',
  'http://192.168.1.100:3000', // IP fixo da rede local
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## 🐛 Troubleshooting

### **1. "Network Error" no celular**

**Causa:** Firewall bloqueando a porta 3001 ou 3000.

**Solução (Windows):**
```bash
# Permitir portas 3000 e 3001 no firewall
netsh advfirewall firewall add rule name="React Dev Server" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="MES API Server" dir=in action=allow protocol=TCP localport=3001
```

### **2. "CORS Error" ainda aparece**

**Causa:** `.env` não foi carregado ou servidor não foi reiniciado.

**Solução:**
1. Verifique se `.env` existe em `backend/`
2. Reinicie o backend: `Ctrl+C` e `npm run dev`
3. Limpe o cache do navegador no celular

### **3. "Cannot connect to localhost"**

**Causa:** Celular tentando acessar `localhost` dele mesmo.

**Solução:**
- Desktop: `http://localhost:3000` ✅
- Celular: `http://192.168.2.105:3000` ✅
- Celular: `http://localhost:3000` ❌ (errado!)

### **4. "ERR_CONNECTION_REFUSED"**

**Causa:** Celular não está na mesma rede ou IP mudou.

**Solução:**
1. Confirme que celular e PC estão na mesma WiFi
2. Verifique o IP novamente com `ipconfig`
3. Atualize `frontend/.env.development` se o IP mudou

---

## 📊 Resumo das Configurações

| Item | Desenvolvimento (Desktop) | Desenvolvimento (Móvel) |
|------|---------------------------|-------------------------|
| **Backend CORS** | `FRONTEND_URL=*` | `FRONTEND_URL=*` |
| **Frontend API** | `http://localhost:3001` | `http://192.168.2.105:3001` |
| **Acesso Desktop** | `http://localhost:3000` | `http://localhost:3000` |
| **Acesso Móvel** | N/A | `http://192.168.2.105:3000` |

---

## 🎉 Resultado Final

✅ Desktop pode acessar via `localhost`  
✅ Celular pode acessar via IP da rede  
✅ Login funciona em ambos os dispositivos  
✅ WebSocket funciona em ambos  
✅ CORS configurado corretamente  

---

**Data**: Outubro 2025  
**Status**: ✅ **IMPLEMENTADO**  
**Testado**: Desktop e Mobile  
**Rede**: WiFi 192.168.2.x

