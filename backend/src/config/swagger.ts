/**
 * Configuração do Swagger para documentação da API
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MES API - Manufacturing Execution System',
      version: '1.0.0',
      description: 'API RESTful para Sistema de Execução de Manufatura com integração de CLP via Modbus',
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@empresa.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://api.mes.empresa.com',
        description: 'Servidor de Produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Caminho para os arquivos com anotações
};

export const swaggerSpec = swaggerJsdoc(options);


