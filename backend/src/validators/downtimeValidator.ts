/**
 * Schemas de validação para Paradas (Downtime)
 */

import * as yup from 'yup';

export const createDowntimeSchema = yup.object({
  body: yup.object({
    productionOrderId: yup.number().nullable().positive().integer(),
    type: yup.string().required('Tipo é obrigatório').oneOf(['PRODUCTIVE', 'UNPRODUCTIVE', 'PLANNED']),
    reason: yup.string().required('Motivo é obrigatório').min(1).max(200),
    description: yup.string().nullable().max(1000),
    responsibleId: yup.number().nullable().positive().integer(),
    startTime: yup.date().required('Data/hora de início é obrigatória'),
    endTime: yup.date().nullable()
      .when('startTime', (startTime, schema) => 
        startTime ? schema.min(startTime, 'Data/hora de fim deve ser posterior ao início') : schema
      ),
  }),
});

export const updateDowntimeSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
  body: yup.object({
    productionOrderId: yup.number().nullable().positive().integer(),
    type: yup.string().oneOf(['PRODUCTIVE', 'UNPRODUCTIVE', 'PLANNED']),
    reason: yup.string().min(1).max(200),
    description: yup.string().nullable().max(1000),
    responsibleId: yup.number().nullable().positive().integer(),
    startTime: yup.date(),
    endTime: yup.date().nullable(),
  }),
});

export const getDowntimeSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
});

export const deleteDowntimeSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
});

export const endDowntimeSchema = yup.object({
  params: yup.object({
    id: yup.number().required().positive().integer(),
  }),
  body: yup.object({
    endTime: yup.date().required('Data/hora de fim é obrigatória'),
  }),
});


