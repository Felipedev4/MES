import * as yup from 'yup';

/**
 * Schema de validação para criação de setor
 */
export const createSectorSchema = yup.object().shape({
  body: yup.object().shape({
    companyId: yup.number().required('ID da empresa é obrigatório').positive().integer(),
    code: yup.string().required('Código é obrigatório').max(50),
    name: yup.string().required('Nome é obrigatório').max(200),
    description: yup.string().max(500).nullable(),
    email: yup.string().email('E-mail inválido').max(255).nullable(),
    sendEmailOnAlert: yup.boolean().default(false),
    active: yup.boolean().default(true),
  }),
});

/**
 * Schema de validação para atualização de setor
 */
export const updateSectorSchema = yup.object().shape({
  body: yup.object().shape({
    companyId: yup.number().positive().integer(),
    code: yup.string().max(50),
    name: yup.string().max(200),
    description: yup.string().max(500).nullable(),
    email: yup.string().email('E-mail inválido').max(255).nullable(),
    sendEmailOnAlert: yup.boolean(),
    active: yup.boolean(),
  }),
});

