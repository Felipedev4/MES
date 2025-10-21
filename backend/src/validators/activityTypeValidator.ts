import * as yup from 'yup';

/**
 * Schema de validação para criação de tipo de atividade
 */
export const createActivityTypeSchema = yup.object().shape({
  body: yup.object().shape({
    code: yup.string().required('Código é obrigatório').max(50),
    name: yup.string().required('Nome é obrigatório').max(200),
    description: yup.string().max(500).nullable(),
    color: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor deve ser um código hexadecimal válido (ex: #FF5733)').nullable(),
    active: yup.boolean().default(true),
  }),
});

/**
 * Schema de validação para atualização de tipo de atividade
 */
export const updateActivityTypeSchema = yup.object().shape({
  body: yup.object().shape({
    code: yup.string().max(50),
    name: yup.string().max(200),
    description: yup.string().max(500).nullable(),
    color: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor deve ser um código hexadecimal válido (ex: #FF5733)').nullable(),
    active: yup.boolean(),
  }),
});

