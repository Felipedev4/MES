import * as yup from 'yup';

/**
 * Schema de validação para criação de defeito
 */
export const createDefectSchema = yup.object().shape({
  body: yup.object().shape({
    code: yup.string().required('Código é obrigatório').max(50),
    name: yup.string().required('Nome é obrigatório').max(200),
    description: yup.string().max(500).nullable(),
    severity: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 'Severidade inválida').default('MEDIUM'),
    active: yup.boolean().default(true),
  }),
});

/**
 * Schema de validação para atualização de defeito
 */
export const updateDefectSchema = yup.object().shape({
  body: yup.object().shape({
    code: yup.string().max(50),
    name: yup.string().max(200),
    description: yup.string().max(500).nullable(),
    severity: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 'Severidade inválida'),
    active: yup.boolean(),
  }),
});

