/**
 * Controller de Itens
 */

import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest, getCompanyFilter } from '../middleware/companyFilter';

/**
 * Lista todos os itens
 */
export async function listItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { active } = req.query;
    
    const where: any = {
      ...getCompanyFilter(req, false), // Filtra por empresa do usuário
    };
    
    if (active !== undefined) {
      where.active = active === 'true';
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        itemColors: {
          include: {
            color: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transformar dados para incluir array de cores
    const itemsWithColors = items.map(item => ({
      ...item,
      colors: item.itemColors.map(ic => ic.color),
      itemColors: undefined, // Remover para limpar resposta
    }));

    res.json(itemsWithColors);
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ error: 'Erro ao listar itens' });
  }
}

/**
 * Busca item por ID
 */
export async function getItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const item = await prisma.item.findFirst({
      where: { 
        id: parseInt(id),
        ...getCompanyFilter(req, false), // Filtra por empresa do usuário
      },
      include: {
        productionOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        itemColors: {
          include: {
            color: true,
          },
        },
      },
    });

    if (!item) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    // Transformar dados para incluir array de cores
    const itemWithColors = {
      ...item,
      colors: item.itemColors?.map(ic => ic.color) || [],
      itemColors: undefined, // Remover para limpar resposta
    };

    res.json(itemWithColors);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
}

/**
 * Cria novo item
 */
export async function createItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId; // Empresa do usuário autenticado
    const { code, name, description, unit, active = true } = req.body;

    // Verificar se código já existe
    const existingItem = await prisma.item.findUnique({
      where: { code },
    });

    if (existingItem) {
      res.status(400).json({ error: 'Código de item já existe' });
      return;
    }

    const item = await prisma.item.create({
      data: {
        code,
        name,
        description,
        unit,
        active,
        companyId, // Vincula à empresa do usuário
      },
    });

    console.log(`✅ Item criado: ${item.code} - ${item.name} | Empresa: ${companyId}`);
    res.status(201).json(item);
  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ error: 'Erro ao criar item' });
  }
}

/**
 * Atualiza item
 */
export async function updateItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { code, name, description, unit, active } = req.body;

    // Verificar se item existe
    const existingItem = await prisma.item.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingItem) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    // Se mudando código, verificar se não existe outro com mesmo código
    if (code && code !== existingItem.code) {
      const codeExists = await prisma.item.findUnique({
        where: { code },
      });

      if (codeExists) {
        res.status(400).json({ error: 'Código de item já existe' });
        return;
      }
    }

    // Preparar dados para atualização (apenas campos permitidos)
    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (unit !== undefined) updateData.unit = unit;
    if (active !== undefined) updateData.active = active;

    const item = await prisma.item.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(item);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
}

/**
 * Deleta item
 */
export async function deleteItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar se item existe
    const existingItem = await prisma.item.findUnique({
      where: { id: parseInt(id) },
      include: { productionOrders: true },
    });

    if (!existingItem) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    // Verificar se item tem ordens de produção
    if (existingItem.productionOrders.length > 0) {
      res.status(400).json({ 
        error: 'Não é possível excluir item com ordens de produção vinculadas. Desative o item ao invés de excluir.' 
      });
      return;
    }

    await prisma.item.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    res.status(500).json({ error: 'Erro ao deletar item' });
  }
}


