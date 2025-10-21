/**
 * Controller de Itens
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Lista todos os itens
 */
export async function listItems(req: Request, res: Response): Promise<void> {
  try {
    const { active } = req.query;
    
    const where = active !== undefined ? { active: active === 'true' } : {};

    const items = await prisma.item.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(items);
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ error: 'Erro ao listar itens' });
  }
}

/**
 * Busca item por ID
 */
export async function getItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) },
      include: {
        productionOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    res.json(item);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
}

/**
 * Cria novo item
 */
export async function createItem(req: Request, res: Response): Promise<void> {
  try {
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
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ error: 'Erro ao criar item' });
  }
}

/**
 * Atualiza item
 */
export async function updateItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    // Verificar se item existe
    const existingItem = await prisma.item.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingItem) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    // Se mudando código, verificar se não existe outro com mesmo código
    if (data.code && data.code !== existingItem.code) {
      const codeExists = await prisma.item.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        res.status(400).json({ error: 'Código de item já existe' });
        return;
      }
    }

    const item = await prisma.item.update({
      where: { id: parseInt(id) },
      data,
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
export async function deleteItem(req: Request, res: Response): Promise<void> {
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


