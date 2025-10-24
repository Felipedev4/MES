/**
 * Script para gerar certificados SSL auto-assinados para desenvolvimento
 * Para produção, use certificados válidos de uma CA confiável (Let's Encrypt, etc)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, 'ssl');

// Criar diretório SSL se não existir
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log('✅ Diretório SSL criado');
}

const certPath = path.join(certDir, 'cert.pem');
const keyPath = path.join(certDir, 'key.pem');

// Verificar se certificados já existem
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('⚠️  Certificados SSL já existem em backend/ssl/');
  console.log('   Se deseja gerar novos, delete os arquivos existentes.');
  process.exit(0);
}

console.log('🔐 Gerando certificados SSL auto-assinados...\n');

try {
  // Gerar certificado auto-assinado usando OpenSSL
  const command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=BR/ST=SP/L=SaoPaulo/O=MES/CN=localhost"`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ Certificados SSL gerados com sucesso!');
  console.log('📄 Certificado: backend/ssl/cert.pem');
  console.log('🔑 Chave privada: backend/ssl/key.pem');
  console.log('\n⚠️  ATENÇÃO:');
  console.log('   - Estes são certificados AUTO-ASSINADOS para DESENVOLVIMENTO');
  console.log('   - Navegadores mostrarão aviso de segurança (é normal)');
  console.log('   - Para PRODUÇÃO, use certificados válidos de uma CA confiável');
  console.log('   - Recomendado: Let\'s Encrypt (gratuito) via Certbot\n');
  
} catch (error) {
  console.error('❌ Erro ao gerar certificados SSL:');
  console.error('   Certifique-se de ter o OpenSSL instalado no sistema.');
  console.error('   Windows: https://slproweb.com/products/Win32OpenSSL.html');
  console.error('   Linux/Mac: sudo apt-get install openssl (ou yum/brew)\n');
  console.error(error.message);
  process.exit(1);
}

