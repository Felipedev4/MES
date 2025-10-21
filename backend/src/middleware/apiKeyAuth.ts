import { Request, Response, NextFunction } from 'express';

export interface ApiKeyRequest extends Request {
  apiKeyValid?: boolean;
}

/**
 * Middleware para validar API Key do Data Collector
 */
export function validateApiKey(req: ApiKeyRequest, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;
  const expectedApiKey = process.env.DATA_COLLECTOR_API_KEY;

  if (!expectedApiKey) {
    console.error('❌ DATA_COLLECTOR_API_KEY não configurada no backend');
    res.status(500).json({ error: 'API Key não configurada no servidor' });
    return;
  }

  if (!apiKey) {
    res.status(401).json({ error: 'API Key não fornecida' });
    return;
  }

  if (apiKey !== expectedApiKey) {
    res.status(403).json({ error: 'API Key inválida' });
    return;
  }

  req.apiKeyValid = true;
  next();
}

