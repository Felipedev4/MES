/**
 * Schemas de validação para Item
 */

import * as yup from 'yup';

export const createItemSchema = yup.object({
  body: yup.object({
    code: yup.string().required('Código é obrigatório').min(1).max(50),
    name: yup.string().required('Nome é obrigatório').min(1).max(200),
    description: yup.string().nullable().max(500),
    unit: yup.string().required('Unidade é obrigatória').max(20),
    active: yup.boolean().default(true),
  }),
});

export const updateItemSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
  body: yup.object({
    code: yup.string().min(1).max(50),
    name: yup.string().min(1).max(200),
    description: yup.string().nullable().max(500),
    unit: yup.string().max(20),
    active: yup.boolean(),
  }),
});

export const getItemSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
});

export const deleteItemSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
});


