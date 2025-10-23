import * as yup from 'yup';

/**
 * Schema de validação para criação de defeito de produção
 */
export const createProductionDefectSchema = yup.object().shape({
  body: yup.object().shape({
    productionOrderId: yup.number().required('ID da ordem de produção é obrigatório').integer().positive(),
    defectId: yup.number().required('ID do defeito é obrigatório').integer().positive(),
    quantity: yup.number().required('Quantidade é obrigatória').integer().positive('Quantidade deve ser maior que zero'),
    notes: yup.string().max(500).nullable(),
  }),
});

/**
 * Schema de validação para atualização de defeito de produção
 */
export const updateProductionDefectSchema = yup.object().shape({
  body: yup.object().shape({
    defectId: yup.number().integer().positive().optional(),
    quantity: yup.number().integer().positive('Quantidade deve ser maior que zero').optional(),
    notes: yup.string().max(500).nullable().optional(),
  }),
});

