/**
 * Schemas de validação para Ordem de Produção
 */

import * as yup from 'yup';

export const createProductionOrderSchema = yup.object({
  body: yup.object({
    orderNumber: yup.string().required('Número da ordem é obrigatório').min(1).max(50),
    itemId: yup.number().required('Item é obrigatório').positive().integer(),
    moldId: yup.number().nullable().positive().integer(),
    plannedQuantity: yup.number().required('Quantidade planejada é obrigatória').positive().integer(),
    priority: yup.number().integer().min(0).default(0),
    plannedStartDate: yup.date().required('Data de início planejada é obrigatória'),
    plannedEndDate: yup.date().required('Data de fim planejada é obrigatória')
      .min(yup.ref('plannedStartDate'), 'Data de fim deve ser posterior à data de início'),
    notes: yup.string().nullable().max(1000),
  }),
});

export const updateProductionOrderSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
  body: yup.object({
    orderNumber: yup.string().min(1).max(50),
    itemId: yup.number().positive().integer(),
    moldId: yup.number().nullable().positive().integer(),
    plannedQuantity: yup.number().positive().integer(),
    producedQuantity: yup.number().integer().min(0),
    rejectedQuantity: yup.number().integer().min(0),
    status: yup.string().oneOf(['PROGRAMMING', 'ACTIVE', 'PAUSED', 'FINISHED', 'CANCELLED']),
    priority: yup.number().integer().min(0),
    plannedStartDate: yup.date(),
    plannedEndDate: yup.date(),
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable(),
    notes: yup.string().nullable().max(1000),
  }),
});

export const getProductionOrderSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
});

export const deleteProductionOrderSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
});

export const updateStatusSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
  body: yup.object({
    status: yup.string().required().oneOf(['PROGRAMMING', 'ACTIVE', 'PAUSED', 'FINISHED', 'CANCELLED']),
  }),
});


