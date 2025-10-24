import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Listar todos os turnos
 */
export const getAllShifts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;
    
    const whereClause: any = {};
    if (companyId) {
      whereClause.companyId = parseInt(companyId as string);
    }
    
    const shifts = await prisma.shift.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { companyId: 'asc' },
        { startTime: 'asc' },
      ],
    });
    
    res.json(shifts);
  } catch (error) {
    console.error('Erro ao buscar turnos:', error);
    res.status(500).json({ error: 'Erro ao buscar turnos' });
  }
};

/**
 * Buscar turno por ID
 */
export const getShiftById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const shift = await prisma.shift.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    
    if (!shift) {
      return res.status(404).json({ error: 'Turno não encontrado' });
    }
    
    res.json(shift);
  } catch (error) {
    console.error('Erro ao buscar turno:', error);
    res.status(500).json({ error: 'Erro ao buscar turno' });
  }
};

/**
 * Criar novo turno
 */
export const createShift = async (req: Request, res: Response) => {
  try {
    const { companyId, name, code, startTime, endTime, description, active } = req.body;
    
    // Verificar se já existe um turno com o mesmo código para a mesma empresa
    const existingShift = await prisma.shift.findFirst({
      where: {
        companyId: parseInt(companyId),
        code: code,
      },
    });
    
    if (existingShift) {
      return res.status(400).json({ error: 'Já existe um turno com este código para esta empresa' });
    }
    
    const shift = await prisma.shift.create({
      data: {
        companyId: parseInt(companyId),
        name,
        code,
        startTime,
        endTime,
        description,
        active: active !== undefined ? active : true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    
    res.status(201).json(shift);
  } catch (error) {
    console.error('Erro ao criar turno:', error);
    res.status(500).json({ error: 'Erro ao criar turno' });
  }
};

/**
 * Atualizar turno
 */
export const updateShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, startTime, endTime, description, active } = req.body;
    
    // Verificar se o turno existe
    const existingShift = await prisma.shift.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingShift) {
      return res.status(404).json({ error: 'Turno não encontrado' });
    }
    
    // Se estiver mudando o código, verificar se não conflita
    if (code && code !== existingShift.code) {
      const conflictShift = await prisma.shift.findFirst({
        where: {
          companyId: existingShift.companyId,
          code: code,
          id: { not: parseInt(id) },
        },
      });
      
      if (conflictShift) {
        return res.status(400).json({ error: 'Já existe um turno com este código para esta empresa' });
      }
    }
    
    const shift = await prisma.shift.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        startTime,
        endTime,
        description,
        active,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    
    res.json(shift);
  } catch (error) {
    console.error('Erro ao atualizar turno:', error);
    res.status(500).json({ error: 'Erro ao atualizar turno' });
  }
};

/**
 * Deletar turno
 */
export const deleteShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o turno existe
    const existingShift = await prisma.shift.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingShift) {
      return res.status(404).json({ error: 'Turno não encontrado' });
    }
    
    await prisma.shift.delete({
      where: { id: parseInt(id) },
    });
    
    res.json({ message: 'Turno deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar turno:', error);
    res.status(500).json({ error: 'Erro ao deletar turno' });
  }
};

/**
 * Determinar turno baseado na hora
 */
export const getShiftByTime = async (req: Request, res: Response) => {
  try {
    const { companyId, time } = req.query;
    
    if (!companyId || !time) {
      return res.status(400).json({ error: 'companyId e time são obrigatórios' });
    }
    
    const shifts = await prisma.shift.findMany({
      where: {
        companyId: parseInt(companyId as string),
        active: true,
      },
    });
    
    // Encontrar o turno que contém o horário informado
    const timeStr = time as string; // Formato "HH:mm"
    
    const currentShift = shifts.find(shift => {
      // Lógica para turnos que cruzam a meia-noite (ex: 22:00-06:00)
      if (shift.startTime > shift.endTime) {
        return timeStr >= shift.startTime || timeStr < shift.endTime;
      } else {
        return timeStr >= shift.startTime && timeStr < shift.endTime;
      }
    });
    
    if (currentShift) {
      res.json(currentShift);
    } else {
      res.status(404).json({ error: 'Nenhum turno encontrado para este horário' });
    }
  } catch (error) {
    console.error('Erro ao buscar turno por horário:', error);
    res.status(500).json({ error: 'Erro ao buscar turno por horário' });
  }
};

