/**
 * Validadores para configuração do CLP
 */

import { body, param } from 'express-validator';

/**
 * Validação para criação de configuração do CLP
 */
export const createPlcConfigValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  
  body('host')
    .trim()
    .notEmpty()
    .withMessage('Host/IP é obrigatório')
    .matches(/^(\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9.-]+$/)
    .withMessage('Host/IP inválido'),
  
  body('port')
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage('Porta deve ser entre 1 e 65535'),
  
  body('unitId')
    .optional()
    .isInt({ min: 0, max: 255 })
    .withMessage('Unit ID deve ser entre 0 e 255'),
  
  body('timeout')
    .optional()
    .isInt({ min: 100, max: 60000 })
    .withMessage('Timeout deve ser entre 100ms e 60000ms'),
  
  body('pollingInterval')
    .optional()
    .isInt({ min: 100, max: 60000 })
    .withMessage('Intervalo de polling deve ser entre 100ms e 60000ms'),
  
  body('reconnectInterval')
    .optional()
    .isInt({ min: 1000, max: 300000 })
    .withMessage('Intervalo de reconexão deve ser entre 1000ms e 300000ms'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active deve ser booleano'),
];

/**
 * Validação para atualização de configuração do CLP
 */
export const updatePlcConfigValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  
  body('host')
    .optional()
    .trim()
    .matches(/^(\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9.-]+$/)
    .withMessage('Host/IP inválido'),
  
  body('port')
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage('Porta deve ser entre 1 e 65535'),
  
  body('unitId')
    .optional()
    .isInt({ min: 0, max: 255 })
    .withMessage('Unit ID deve ser entre 0 e 255'),
  
  body('timeout')
    .optional()
    .isInt({ min: 100, max: 60000 })
    .withMessage('Timeout deve ser entre 100ms e 60000ms'),
  
  body('pollingInterval')
    .optional()
    .isInt({ min: 100, max: 60000 })
    .withMessage('Intervalo de polling deve ser entre 100ms e 60000ms'),
  
  body('reconnectInterval')
    .optional()
    .isInt({ min: 1000, max: 300000 })
    .withMessage('Intervalo de reconexão deve ser entre 1000ms e 300000ms'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active deve ser booleano'),
];

/**
 * Validação para criação de registro do CLP
 */
export const createPlcRegisterValidator = [
  body('plcConfigId')
    .isInt({ min: 1 })
    .withMessage('ID da configuração do CLP é obrigatório'),
  
  body('registerName')
    .trim()
    .notEmpty()
    .withMessage('Nome do registro é obrigatório')
    .matches(/^[A-Z]\d+$/)
    .withMessage('Nome do registro deve estar no formato D33, M100, etc'),
  
  body('registerAddress')
    .isInt({ min: 0, max: 65535 })
    .withMessage('Endereço do registro deve ser entre 0 e 65535'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Descrição deve ter no máximo 255 caracteres'),
  
  body('dataType')
    .optional()
    .isIn(['INT16', 'INT32', 'UINT16', 'UINT32', 'FLOAT', 'BOOL'])
    .withMessage('Tipo de dado inválido'),
  
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled deve ser booleano'),
];

/**
 * Validação para atualização de registro do CLP
 */
export const updatePlcRegisterValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
  
  body('registerName')
    .optional()
    .trim()
    .matches(/^[A-Z]\d+$/)
    .withMessage('Nome do registro deve estar no formato D33, M100, etc'),
  
  body('registerAddress')
    .optional()
    .isInt({ min: 0, max: 65535 })
    .withMessage('Endereço do registro deve ser entre 0 e 65535'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Descrição deve ter no máximo 255 caracteres'),
  
  body('dataType')
    .optional()
    .isIn(['INT16', 'INT32', 'UINT16', 'UINT32', 'FLOAT', 'BOOL'])
    .withMessage('Tipo de dado inválido'),
  
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled deve ser booleano'),
];

/**
 * Validação para ID
 */
export const idValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
];


