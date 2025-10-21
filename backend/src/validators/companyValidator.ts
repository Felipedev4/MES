import * as yup from 'yup';

/**
 * Schema de validação para criação de empresa
 */
export const createCompanySchema = yup.object().shape({
  body: yup.object().shape({
    code: yup.string().required('Código é obrigatório').max(50),
    name: yup.string().required('Nome é obrigatório').max(200),
    tradeName: yup.string().max(200).nullable(),
    cnpj: yup.string().length(14, 'CNPJ deve ter 14 caracteres').nullable(),
    address: yup.string().max(500).nullable(),
    phone: yup.string().max(20).nullable(),
    email: yup.string().email('Email inválido').max(100).nullable(),
    active: yup.boolean().default(true),
  }),
});

/**
 * Schema de validação para atualização de empresa
 */
export const updateCompanySchema = yup.object().shape({
  body: yup.object().shape({
    code: yup.string().max(50),
    name: yup.string().max(200),
    tradeName: yup.string().max(200).nullable(),
    cnpj: yup.string().length(14, 'CNPJ deve ter 14 caracteres').nullable(),
    address: yup.string().max(500).nullable(),
    phone: yup.string().max(20).nullable(),
    email: yup.string().email('Email inválido').max(100).nullable(),
    active: yup.boolean(),
  }),
});

