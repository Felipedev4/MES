/**
 * Controller de Moldes
 */

import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest, getCompanyFilter } from '../middleware/companyFilter';

/**
 * Lista todos os moldes
 */
export async function listMolds(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { active } = req.query;
    
    const where: any = {
      ...getCompanyFilter(req, false), // Filtra por empresa do usuário
    };
    
    if (active !== undefined) {
      where.active = active === 'true';
    }

    const molds = await prisma.mold.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(molds);
  } catch (error) {
    console.error('Erro ao listar moldes:', error);
    res.status(500).json({ error: 'Erro ao listar moldes' });
  }
}

/**
 * Busca molde por ID
 */
export async function getMold(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const mold = await prisma.mold.findUnique({
      where: { id: parseInt(id) },
      include: {
        productionOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!mold) {
      res.status(404).json({ error: 'Molde não encontrado' });
      return;
    }

    res.json(mold);
  } catch (error) {
    console.error('Erro ao buscar molde:', error);
    res.status(500).json({ error: 'Erro ao buscar molde' });
  }
}

/**
 * Cria novo molde
 */
export async function createMold(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId; // Empresa do usuário autenticado
    const { code, name, description, cavities, activeCavities, cycleTime, active = true, maintenanceDate } = req.body;

    // Verificar se código já existe
    const existingMold = await prisma.mold.findUnique({
      where: { code },
    });

    if (existingMold) {
      res.status(400).json({ error: 'Código de molde já existe' });
      return;
    }

    const mold = await prisma.mold.create({
      data: {
        code,
        name,
        description,
        cavities,
        activeCavities: activeCavities !== undefined ? activeCavities : cavities, // Se não informar, usa o total de cavidades
        cycleTime,
        active,
        maintenanceDate,
        companyId, // Vincula à empresa do usuário
      },
    });

    console.log(`✅ Molde criado: ${mold.code} - ${mold.name} | Empresa: ${companyId}`);
    res.status(201).json(mold);
  } catch (error) {
    console.error('Erro ao criar molde:', error);
    res.status(500).json({ error: 'Erro ao criar molde' });
  }
}

/**
 * Atualiza molde
 */
export async function updateMold(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    // Remover companyId do data para evitar alteração
    delete data.companyId;

    const existingMold = await prisma.mold.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingMold) {
      res.status(404).json({ error: 'Molde não encontrado' });
      return;
    }

    if (data.code && data.code !== existingMold.code) {
      const codeExists = await prisma.mold.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        res.status(400).json({ error: 'Código de molde já existe' });
        return;
      }
    }

    const mold = await prisma.mold.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(mold);
  } catch (error) {
    console.error('Erro ao atualizar molde:', error);
    res.status(500).json({ error: 'Erro ao atualizar molde' });
  }
}

/**
 * Deleta molde
 */
export async function deleteMold(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existingMold = await prisma.mold.findUnique({
      where: { id: parseInt(id) },
      include: { productionOrders: true },
    });

    if (!existingMold) {
      res.status(404).json({ error: 'Molde não encontrado' });
      return;
    }

    if (existingMold.productionOrders.length > 0) {
      res.status(400).json({ 
        error: 'Não é possível excluir molde com ordens de produção vinculadas. Desative o molde ao invés de excluir.' 
      });
      return;
    }

    await prisma.mold.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar molde:', error);
    res.status(500).json({ error: 'Erro ao deletar molde' });
  }
}


