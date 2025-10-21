/**
 * Schemas de validação para Molde
 */

import * as yup from 'yup';

export const createMoldSchema = yup.object({
  body: yup.object({
    code: yup.string().required('Código é obrigatório').min(1).max(50),
    name: yup.string().required('Nome é obrigatório').min(1).max(200),
    description: yup.string().nullable().max(500),
    cavities: yup.number().required().positive().integer().min(1),
    cycleTime: yup.number().nullable().positive(),
    active: yup.boolean().default(true),
    maintenanceDate: yup.date().nullable(),
  }),
});

export const updateMoldSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
  body: yup.object({
    code: yup.string().min(1).max(50),
    name: yup.string().min(1).max(200),
    description: yup.string().nullable().max(500),
    cavities: yup.number().positive().integer().min(1),
    cycleTime: yup.number().nullable().positive(),
    active: yup.boolean(),
    maintenanceDate: yup.date().nullable(),
  }),
});

export const getMoldSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
});

export const deleteMoldSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
});


