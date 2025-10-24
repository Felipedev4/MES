# 🔐 Configuração HTTPS para o Sistema MES

**Data de Implementação**: 24/10/2025  
**Versão**: 1.0

---

## 📋 **Índice**

1. [Visão Geral](#visão-geral)
2. [Desenvolvimento Local](#desenvolvimento-local)
3. [Produção](#produção)
4. [Configuração](#configuração)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 **Visão Geral**

O sistema MES agora suporta **HTTPS** para comunicação segura entre frontend e backend.

### **Portas Padrão**
- **HTTP**: 3001
- **HTTPS**: 3443
- **WebSocket (WS)**: 3001
- **WebSocket Secure (WSS)**: 3443

---

## 💻 **Desenvolvimento Local**

### **1. Gerar Certificados SSL Auto-Assinados**

```bash
cd backend
npm run generate-ssl
```

Isso cria:
- `backend/ssl/cert.pem` - Certificado SSL
- `backend/ssl/key.pem` - Chave privada

**Características**:
- ✅ Válido por 365 dias
- ✅ Para localhost, 127.0.0.1, ::1
- ⚠️ Auto-assinado (navegador mostrará aviso)

---

### **2. Configurar Variáveis de Ambiente**

Edite `backend/.env`:

```env
# Habilitar HTTPS
ENABLE_HTTPS=true

# Porta HTTPS (opcional, padrão 3443)
HTTPS_PORT=3443

# Porta HTTP (ainda ativa para compatibilidade)
PORT=3001
```

---

### **3. Iniciar o Servidor**

```bash
# Backend
cd backend
npm run dev

# Você verá:
🚀 ========================================
   Servidor MES iniciado com sucesso!
   Ambiente: development
   HTTP: http://localhost:3001
   HTTPS: https://localhost:3443 🔐
   WebSocket: http://localhost:3001
   WebSocket (Secure): wss://localhost:3443
========================================
🔐 Servidor HTTPS ativo na porta 3443
```

---

### **4. Aceitar Certificado Auto-Assinado no Navegador**

Ao acessar `https://localhost:3443`:

**Chrome/Edge**:
1. Clicar em "Avançado"
2. Clicar em "Prosseguir para localhost (não seguro)"

**Firefox**:
1. Clicar em "Avançado"
2. Clicar em "Aceitar o risco e continuar"

⚠️ **Isso é NORMAL para certificados auto-assinados em desenvolvimento!**

---

### **5. Configurar Frontend**

Edite `frontend/.env` (ou `frontend/.env.local`):

```env
# Usar HTTPS
REACT_APP_API_URL=https://localhost:3443
```

Ou para manter HTTP:

```env
# Usar HTTP (padrão)
REACT_APP_API_URL=http://localhost:3001
```

---

## 🚀 **Produção**

### **⚠️ NÃO USE CERTIFICADOS AUTO-ASSINADOS EM PRODUÇÃO!**

Para produção, use certificados válidos de uma CA confiável:

---

### **Opção 1: Let's Encrypt (Gratuito e Recomendado)**

**Pré-requisitos**:
- Domínio próprio (ex: `mes.suaempresa.com`)
- Servidor com IP público
- Porta 80 e 443 abertas

**Passos**:

1. **Instalar Certbot**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

2. **Gerar Certificado**:
```bash
sudo certbot certonly --standalone -d mes.suaempresa.com
```

3. **Certificados gerados em**:
```
/etc/letsencrypt/live/mes.suaempresa.com/fullchain.pem  (cert.pem)
/etc/letsencrypt/live/mes.suaempresa.com/privkey.pem    (key.pem)
```

4. **Copiar para o projeto**:
```bash
sudo cp /etc/letsencrypt/live/mes.suaempresa.com/fullchain.pem backend/ssl/cert.pem
sudo cp /etc/letsencrypt/live/mes.suaempresa.com/privkey.pem backend/ssl/key.pem
sudo chown $USER:$USER backend/ssl/*.pem
```

5. **Renovação Automática** (Let's Encrypt expira em 90 dias):
```bash
# Adicionar ao cron (renova a cada 2 meses)
sudo crontab -e

# Adicionar linha:
0 0 1 */2 * certbot renew && cp /etc/letsencrypt/live/mes.suaempresa.com/*.pem /caminho/para/backend/ssl/
```

---

### **Opção 2: Certificado Comercial**

Se você comprou um certificado SSL (DigiCert, Comodo, etc):

1. Receba `certificate.crt` e `private.key` do provedor
2. Copie para:
   - `backend/ssl/cert.pem` ← certificate.crt
   - `backend/ssl/key.pem` ← private.key

---

### **Opção 3: Usar Nginx como Reverse Proxy (Recomendado para Produção)**

```nginx
# /etc/nginx/sites-available/mes

server {
    listen 80;
    server_name mes.suaempresa.com;
    
    # Redirecionar HTTP -> HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mes.suaempresa.com;

    ssl_certificate /etc/letsencrypt/live/mes.suaempresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mes.suaempresa.com/privkey.pem;

    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy para backend Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/mes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Vantagens**:
- ✅ Melhor performance
- ✅ Gerenciamento centralizado de SSL
- ✅ Load balancing
- ✅ Cache
- ✅ Compressão Gzip

---

## ⚙️ **Configuração**

### **Variáveis de Ambiente** (`backend/.env`)

```env
# Habilitar/Desabilitar HTTPS
ENABLE_HTTPS=true          # true = HTTPS ligado, false = apenas HTTP

# Portas
PORT=3001                  # Porta HTTP
HTTPS_PORT=3443            # Porta HTTPS (ou 443 se tiver permissões root)

# Produção: usar 443
# HTTPS_PORT=443
```

---

### **Estrutura de Arquivos**

```
backend/
├── ssl/
│   ├── cert.pem          ← Certificado SSL
│   ├── key.pem           ← Chave privada
│   └── .gitignore        ← Ignora *.pem do git
├── generate-ssl.js       ← Script para gerar certificados dev
├── src/
│   └── server.ts         ← Servidor com suporte HTTPS
└── .env                  ← Configurações
```

---

## 🐛 **Troubleshooting**

### **Problema: "Certificados SSL não encontrados"**

**Sintoma**:
```
⚠️  Certificados SSL não encontrados. HTTPS desabilitado.
   Execute: npm run generate-ssl
```

**Solução**:
```bash
cd backend
npm run generate-ssl
```

---

### **Problema: "EACCES: permission denied" (Porta 443)**

**Sintoma**:
```
Error: listen EACCES: permission denied 0.0.0.0:443
```

**Causa**: Portas < 1024 requerem permissões de root no Linux/Mac.

**Soluções**:

**Opção 1** (Desenvolvimento): Usar porta >= 1024
```env
HTTPS_PORT=3443
```

**Opção 2** (Produção): Dar permissão ao Node.js
```bash
sudo setcap 'cap_net_bind_service=+ep' $(which node)
```

**Opção 3** (Recomendado): Usar Nginx como reverse proxy na porta 443

---

### **Problema: "Mixed Content" no Frontend**

**Sintoma**: Frontend HTTPS, mas API HTTP

**Solução**: Ambos devem usar o mesmo protocolo
```env
# Frontend
REACT_APP_API_URL=https://localhost:3443

# Backend
ENABLE_HTTPS=true
```

---

### **Problema: WebSocket não conecta (WSS)**

**Sintoma**: `WebSocket connection to 'wss://...' failed`

**Solução**:
1. Certificar que HTTPS está habilitado no backend
2. Socket.IO usa automaticamente WSS quando backend é HTTPS
3. Verificar URL do Socket.IO no frontend

---

### **Problema: Certificado Expirado**

**Sintoma**: `ERR_CERT_DATE_INVALID`

**Solução**:
```bash
# Regenerar certificado de desenvolvimento
cd backend
rm ssl/*.pem
npm run generate-ssl

# Ou renovar Let's Encrypt
sudo certbot renew
```

---

## 📊 **Verificação**

### **Testar HTTPS**

```bash
# Testar conexão HTTPS
curl -k https://localhost:3443/api/health

# -k: ignora erro de certificado auto-assinado
```

### **Verificar Certificado**

```bash
# Ver detalhes do certificado
openssl x509 -in backend/ssl/cert.pem -text -noout
```

---

## ✅ **Checklist de Produção**

- [ ] Certificado válido de CA confiável (não auto-assinado)
- [ ] Porta HTTPS 443 (padrão) ou reverse proxy
- [ ] Redirecionamento HTTP → HTTPS
- [ ] Renovação automática de certificados (Let's Encrypt)
- [ ] Firewall configurado (portas 80, 443 abertas)
- [ ] `ENABLE_HTTPS=true` no .env
- [ ] Frontend configurado para HTTPS
- [ ] WebSocket (WSS) testado
- [ ] Backup dos certificados
- [ ] Monitoramento de expiração

---

## 📚 **Referências**

- **Let's Encrypt**: https://letsencrypt.org/
- **Certbot**: https://certbot.eff.org/
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/
- **Mozilla SSL Config Generator**: https://ssl-config.mozilla.org/

---

## 🎓 **Comandos Rápidos**

```bash
# Gerar certificados de desenvolvimento
npm run generate-ssl

# Iniciar com HTTPS
ENABLE_HTTPS=true npm run dev

# Verificar certificado
openssl x509 -in ssl/cert.pem -text -noout

# Testar HTTPS
curl -k https://localhost:3443/api/health
```

---

**Status**: 🟢 **IMPLEMENTADO E FUNCIONAL**  
**Ambiente**: Desenvolvimento ✅ | Produção (Documentado) ✅

