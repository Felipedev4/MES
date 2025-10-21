/**
 * Schemas de validação para Autenticação
 */

import * as yup from 'yup';

export const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().required('Email é obrigatório').email('Email inválido'),
    password: yup.string().required('Senha é obrigatória').min(6, 'Senha deve ter no mínimo 6 caracteres'),
  }),
});

export const registerSchema = yup.object({
  body: yup.object({
    email: yup.string().required('Email é obrigatório').email('Email inválido'),
    password: yup.string().required('Senha é obrigatória').min(6, 'Senha deve ter no mínimo 6 caracteres'),
    name: yup.string().required('Nome é obrigatório').min(3).max(200),
    role: yup.string().oneOf(['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']).default('OPERATOR'),
  }),
});


