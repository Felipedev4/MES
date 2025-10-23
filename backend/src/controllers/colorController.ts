/**
 * Controller de Cores
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

/**
 * Listar todas as cores
 */
export async function listColors(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const colors = await prisma.color.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(colors);
  } catch (error: any) {
    console.error('Erro ao listar cores:', error);
    res.status(500).json({ error: 'Erro ao listar cores' });
  }
}

/**
 * Buscar uma cor por ID
 */
export async function getColor(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const color = await prisma.color.findUnique({
      where: { id: parseInt(id) },
      include: {
        itemColors: {
          include: {
            item: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!color) {
      res.status(404).json({ error: 'Cor não encontrada' });
      return;
    }

    res.json(color);
  } catch (error: any) {
    console.error('Erro ao buscar cor:', error);
    res.status(500).json({ error: 'Erro ao buscar cor' });
  }
}

/**
 * Criar nova cor
 */
export async function createColor(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, name, hexCode, description, active } = req.body;

    // Verificar se código já existe
    const existingColor = await prisma.color.findUnique({
      where: { code },
    });

    if (existingColor) {
      res.status(400).json({ error: 'Código de cor já existe' });
      return;
    }

    const color = await prisma.color.create({
      data: {
        code,
        name,
        hexCode,
        description,
        active: active !== undefined ? active : true,
      },
    });

    res.status(201).json(color);
  } catch (error: any) {
    console.error('Erro ao criar cor:', error);
    res.status(500).json({ error: 'Erro ao criar cor' });
  }
}

/**
 * Atualizar cor
 */
export async function updateColor(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { code, name, hexCode, description, active } = req.body;

    // Verificar se cor existe
    const existingColor = await prisma.color.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingColor) {
      res.status(404).json({ error: 'Cor não encontrada' });
      return;
    }

    // Se mudou o código, verificar se novo código já existe
    if (code && code !== existingColor.code) {
      const codeExists = await prisma.color.findUnique({
        where: { code },
      });

      if (codeExists) {
        res.status(400).json({ error: 'Código de cor já existe' });
        return;
      }
    }

    const color = await prisma.color.update({
      where: { id: parseInt(id) },
      data: {
        code,
        name,
        hexCode,
        description,
        active,
      },
    });

    res.json(color);
  } catch (error: any) {
    console.error('Erro ao atualizar cor:', error);
    res.status(500).json({ error: 'Erro ao atualizar cor' });
  }
}

/**
 * Deletar cor
 */
export async function deleteColor(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar se cor existe
    const color = await prisma.color.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { itemColors: true },
        },
      },
    });

    if (!color) {
      res.status(404).json({ error: 'Cor não encontrada' });
      return;
    }

    // Verificar se cor está em uso
    if (color._count.itemColors > 0) {
      res.status(400).json({ 
        error: 'Cor não pode ser deletada',
        details: `Esta cor está vinculada a ${color._count.itemColors} item(ns)`,
      });
      return;
    }

    await prisma.color.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar cor:', error);
    res.status(500).json({ error: 'Erro ao deletar cor' });
  }
}

/**
 * Listar cores de um item
 */
export async function getItemColors(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { itemId } = req.params;

    const itemColors = await prisma.itemColor.findMany({
      where: { itemId: parseInt(itemId) },
      include: {
        color: true,
      },
      orderBy: {
        color: {
          name: 'asc',
        },
      },
    });

    const colors = itemColors.map(ic => ic.color);

    res.json(colors);
  } catch (error: any) {
    console.error('Erro ao listar cores do item:', error);
    res.status(500).json({ error: 'Erro ao listar cores do item' });
  }
}

/**
 * Atualizar cores de um item (substitui todas)
 */
export async function updateItemColors(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { itemId } = req.params;
    const { colorIds } = req.body;

    // Validar array de IDs
    if (!Array.isArray(colorIds)) {
      res.status(400).json({ error: 'colorIds deve ser um array' });
      return;
    }

    // Verificar se item existe
    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    // Verificar se todas as cores existem
    if (colorIds.length > 0) {
      const colors = await prisma.color.findMany({
        where: {
          id: { in: colorIds.map(id => parseInt(id)) },
        },
      });

      if (colors.length !== colorIds.length) {
        res.status(400).json({ error: 'Uma ou mais cores não foram encontradas' });
        return;
      }
    }

    // Transaction: deletar todas as cores atuais e inserir as novas
    await prisma.$transaction(async (tx) => {
      // Deletar vínculos existentes
      await tx.itemColor.deleteMany({
        where: { itemId: parseInt(itemId) },
      });

      // Criar novos vínculos
      if (colorIds.length > 0) {
        await tx.itemColor.createMany({
          data: colorIds.map(colorId => ({
            itemId: parseInt(itemId),
            colorId: parseInt(colorId),
          })),
        });
      }
    });

    // Buscar cores atualizadas
    const updatedItemColors = await prisma.itemColor.findMany({
      where: { itemId: parseInt(itemId) },
      include: {
        color: true,
      },
      orderBy: {
        color: {
          name: 'asc',
        },
      },
    });

    const colors = updatedItemColors.map(ic => ic.color);

    res.json(colors);
  } catch (error: any) {
    console.error('Erro ao atualizar cores do item:', error);
    res.status(500).json({ error: 'Erro ao atualizar cores do item' });
  }
}

/**
 * Adicionar cor a um item
 */
export async function addColorToItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { itemId, colorId } = req.params;

    // Verificar se vínculo já existe
    const existing = await prisma.itemColor.findFirst({
      where: {
        itemId: parseInt(itemId),
        colorId: parseInt(colorId),
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Cor já vinculada a este item' });
      return;
    }

    await prisma.itemColor.create({
      data: {
        itemId: parseInt(itemId),
        colorId: parseInt(colorId),
      },
    });

    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('Erro ao adicionar cor ao item:', error);
    res.status(500).json({ error: 'Erro ao adicionar cor ao item' });
  }
}

/**
 * Remover cor de um item
 */
export async function removeColorFromItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { itemId, colorId } = req.params;

    const itemColor = await prisma.itemColor.findFirst({
      where: {
        itemId: parseInt(itemId),
        colorId: parseInt(colorId),
      },
    });

    if (!itemColor) {
      res.status(404).json({ error: 'Vínculo não encontrado' });
      return;
    }

    await prisma.itemColor.delete({
      where: { id: itemColor.id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao remover cor do item:', error);
    res.status(500).json({ error: 'Erro ao remover cor do item' });
  }
}
