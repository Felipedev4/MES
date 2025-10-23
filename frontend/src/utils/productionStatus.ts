/**
 * Utilitários para Status de Ordem de Produção
 */

export type ProductionStatus = 
  | 'PROGRAMMING'  // Programação
  | 'ACTIVE'       // Em Atividade
  | 'PAUSED'       // Pausada
  | 'FINISHED'     // Encerrada
  | 'CANCELLED';   // Cancelada

export interface ProductionStatusConfig {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  description: string;
  icon: string;
  canTransitionTo: ProductionStatus[];
}

/**
 * Configuração de todos os status de ordem de produção
 */
export const PRODUCTION_STATUS_CONFIG: Record<ProductionStatus, ProductionStatusConfig> = {
  PROGRAMMING: {
    label: 'Programação',
    color: 'default',
    description: 'Ordem em fase de programação',
    icon: '📋',
    canTransitionTo: ['ACTIVE', 'CANCELLED'],
  },
  ACTIVE: {
    label: 'Em Atividade',
    color: 'success',
    description: 'Ordem em execução (somente uma por vez)',
    icon: '▶️',
    canTransitionTo: ['PAUSED', 'FINISHED', 'CANCELLED'],
  },
  PAUSED: {
    label: 'Pausada',
    color: 'warning',
    description: 'Ordem pausada temporariamente',
    icon: '⏸️',
    canTransitionTo: ['ACTIVE', 'CANCELLED'],
  },
  FINISHED: {
    label: 'Encerrada',
    color: 'info',
    description: 'Ordem finalizada com sucesso',
    icon: '✅',
    canTransitionTo: [],
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'error',
    description: 'Ordem cancelada',
    icon: '❌',
    canTransitionTo: [],
  },
};

/**
 * Retorna o label traduzido do status
 */
export function getStatusLabel(status: ProductionStatus): string {
  return PRODUCTION_STATUS_CONFIG[status]?.label || status;
}

/**
 * Retorna a cor do status para componentes Material-UI
 */
export function getStatusColor(status: ProductionStatus): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' {
  return PRODUCTION_STATUS_CONFIG[status]?.color || 'default';
}

/**
 * Retorna a descrição do status
 */
export function getStatusDescription(status: ProductionStatus): string {
  return PRODUCTION_STATUS_CONFIG[status]?.description || '';
}

/**
 * Retorna o ícone do status
 */
export function getStatusIcon(status: ProductionStatus): string {
  return PRODUCTION_STATUS_CONFIG[status]?.icon || '📄';
}

/**
 * Verifica se uma transição de status é válida
 */
export function canTransitionTo(fromStatus: ProductionStatus, toStatus: ProductionStatus): boolean {
  const config = PRODUCTION_STATUS_CONFIG[fromStatus];
  return config?.canTransitionTo.includes(toStatus) || false;
}

/**
 * Retorna os status disponíveis para transição
 */
export function getAvailableTransitions(currentStatus: ProductionStatus): ProductionStatus[] {
  return PRODUCTION_STATUS_CONFIG[currentStatus]?.canTransitionTo || [];
}

/**
 * Lista de todos os status disponíveis (para filtros, dropdowns, etc)
 */
export const ALL_PRODUCTION_STATUSES: ProductionStatus[] = [
  'PROGRAMMING',
  'ACTIVE',
  'PAUSED',
  'FINISHED',
  'CANCELLED',
];

/**
 * Opções para componentes Select
 */
export const PRODUCTION_STATUS_OPTIONS = ALL_PRODUCTION_STATUSES.map(status => ({
  value: status,
  label: getStatusLabel(status),
  icon: getStatusIcon(status),
  description: getStatusDescription(status),
}));

/**
 * Status que indicam que a ordem está "ativa" (pode receber apontamentos)
 */
export const ACTIVE_STATUSES: ProductionStatus[] = ['ACTIVE'];

/**
 * Status finais (não podem mais ser alterados)
 */
export const FINAL_STATUSES: ProductionStatus[] = ['FINISHED', 'CANCELLED'];

/**
 * Verifica se o status é final (não pode mais ser alterado)
 */
export function isFinalStatus(status: ProductionStatus): boolean {
  return FINAL_STATUSES.includes(status);
}

/**
 * Verifica se o status permite apontamentos de produção
 */
export function canReceiveAppointments(status: ProductionStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

