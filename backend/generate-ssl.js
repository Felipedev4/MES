/**
 * Script para gerar certificados SSL auto-assinados para desenvolvimento
 * Usa Node.js puro - funciona em Windows, Linux e Mac
 */

const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

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
  // Atributos do certificado
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'BR' },
    { shortName: 'ST', value: 'SP' },
    { name: 'localityName', value: 'São Paulo' },
    { name: 'organizationName', value: 'MES System' },
    { shortName: 'OU', value: 'Development' }
  ];

  // Opções do certificado
  const options = {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 2, // DNS
            value: 'localhost'
          },
          {
            type: 2, // DNS
            value: '*.localhost'
          },
          {
            type: 7, // IP
            ip: '127.0.0.1'
          },
          {
            type: 7, // IP
            ip: '::1'
          }
        ]
      }
    ]
  };

  // Gerar certificado
  const pems = selfsigned.generate(attrs, options);

  // Salvar certificado e chave privada
  fs.writeFileSync(certPath, pems.cert);
  fs.writeFileSync(keyPath, pems.private);

  console.log('✅ Certificados SSL gerados com sucesso!\n');
  console.log('📄 Certificado: backend/ssl/cert.pem');
  console.log('🔑 Chave privada: backend/ssl/key.pem');
  console.log('📅 Validade: 365 dias');
  console.log('🌐 Domínios: localhost, *.localhost, 127.0.0.1, ::1\n');
  console.log('⚠️  ATENÇÃO:');
  console.log('   - Estes são certificados AUTO-ASSINADOS para DESENVOLVIMENTO');
  console.log('   - Navegadores mostrarão aviso de segurança (é normal)');
  console.log('   - Clique em "Avançado" e "Prosseguir mesmo assim" no navegador');
  console.log('   - Para PRODUÇÃO, use certificados válidos:');
  console.log('     * Let\'s Encrypt (gratuito): https://letsencrypt.org/');
  console.log('     * Certbot: https://certbot.eff.org/\n');

} catch (error) {
  console.error('❌ Erro ao gerar certificados SSL:');
  console.error(error.message);
  process.exit(1);
}

