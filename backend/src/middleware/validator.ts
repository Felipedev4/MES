/**
 * Middleware de validação usando Yup
 */

import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

/**
 * Middleware genérico de validação
 */
export function validateRequest(schema: yup.AnyObjectSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params,
        },
        {
          abortEarly: false, // Retorna todos os erros, não apenas o primeiro
        }
      );
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          error: 'Erro de validação',
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}


