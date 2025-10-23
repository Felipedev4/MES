/**
 * Validadores para Cores
 */

import { body, param } from 'express-validator';

export const createColorValidator = [
  body('code')
    .trim()
    .notEmpty().withMessage('Código é obrigatório')
    .isLength({ max: 50 }).withMessage('Código deve ter no máximo 50 caracteres')
    .matches(/^[A-Z0-9_-]+$/).withMessage('Código deve conter apenas letras maiúsculas, números, _ e -'),
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('hexCode')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('hexCode deve estar no formato #RRGGBB'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('active')
    .optional()
    .isBoolean().withMessage('active deve ser verdadeiro ou falso'),
];

export const updateColorValidator = [
  param('id').isInt().withMessage('ID inválido'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Código deve ter no máximo 50 caracteres')
    .matches(/^[A-Z0-9_-]+$/).withMessage('Código deve conter apenas letras maiúsculas, números, _ e -'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('hexCode')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('hexCode deve estar no formato #RRGGBB'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('active')
    .optional()
    .isBoolean().withMessage('active deve ser verdadeiro ou falso'),
];

export const idValidator = [
  param('id').isInt().withMessage('ID inválido'),
];

export const updateItemColorsValidator = [
  param('itemId').isInt().withMessage('ID do item inválido'),
  body('colorIds')
    .isArray().withMessage('colorIds deve ser um array')
    .custom((value) => {
      if (!value.every((id: any) => Number.isInteger(id) && id > 0)) {
        throw new Error('Todos os IDs de cor devem ser números inteiros positivos');
      }
      return true;
    }),
];

