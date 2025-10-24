/**
 * Utilitários para verificação de permissões
 */

// Mapeamento de permissões por role
// Baseado nas permissões configuradas no banco de dados
export const ROLE_PERMISSIONS = {
  ADMIN: {
    dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    users: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    permissions: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    injectors: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    items: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    molds: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    production_orders: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    manual_posting: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    downtimes: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    plc_config: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    companies: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    user_companies: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    sectors: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    activity_types: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    defects: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    reference_types: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    email_config: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    maintenance_alerts: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    email_logs: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    reports: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    shifts: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  },
  DIRECTOR: {
    dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    users: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    permissions: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    injectors: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    items: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    molds: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    production_orders: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    manual_posting: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    downtimes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    plc_config: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    companies: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    user_companies: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    sectors: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    activity_types: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    defects: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    reference_types: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    email_config: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    maintenance_alerts: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    email_logs: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    reports: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    shifts: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  },
  MANAGER: {
    dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    users: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    permissions: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    injectors: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    items: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    molds: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    production_orders: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    manual_posting: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    downtimes: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    plc_config: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    companies: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    user_companies: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    sectors: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    activity_types: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    defects: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    reference_types: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    email_config: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    maintenance_alerts: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    email_logs: { canView: true, canCreate: false, canEdit: true, canDelete: false },
    reports: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    shifts: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  },
  SUPERVISOR: {
    dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    users: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    permissions: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    injectors: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    items: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    molds: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    production_orders: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    manual_posting: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    downtimes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    plc_config: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    companies: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    user_companies: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    sectors: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    activity_types: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    defects: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    reference_types: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    email_config: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    maintenance_alerts: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    email_logs: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    reports: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    shifts: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  LEADER: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    users: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    permissions: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    injectors: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    items: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    molds: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    production_orders: { canView: true, canCreate: false, canEdit: true, canDelete: false },
    manual_posting: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    downtimes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    plc_config: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    companies: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    user_companies: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    sectors: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    activity_types: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    defects: { canView: true, canCreate: true, canEdit: false, canDelete: false },
    reference_types: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    email_config: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    maintenance_alerts: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    email_logs: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    reports: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    shifts: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  OPERATOR: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    users: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    permissions: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    injectors: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    items: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    molds: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    production_orders: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    manual_posting: { canView: true, canCreate: true, canEdit: false, canDelete: false },
    downtimes: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    plc_config: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    companies: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    user_companies: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    sectors: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    activity_types: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    defects: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    reference_types: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    email_config: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    maintenance_alerts: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    email_logs: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    reports: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    shifts: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  },
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;
export type Resource = keyof typeof ROLE_PERMISSIONS.ADMIN;
export type Permission = 'canView' | 'canCreate' | 'canEdit' | 'canDelete';

/**
 * Verifica se um usuário tem uma permissão específica para um recurso
 */
export function hasPermission(
  role: string,
  resource: string,
  permission: Permission = 'canView'
): boolean {
  const userRole = role as Role;
  const resourceKey = resource as Resource;

  if (!ROLE_PERMISSIONS[userRole]) {
    console.warn(`Role desconhecido: ${role}`);
    return false;
  }

  if (!ROLE_PERMISSIONS[userRole][resourceKey]) {
    console.warn(`Recurso desconhecido: ${resource} para role ${role}`);
    return false;
  }

  return ROLE_PERMISSIONS[userRole][resourceKey][permission];
}

/**
 * Verifica se o usuário pode visualizar um recurso
 */
export function canView(role: string, resource: string): boolean {
  return hasPermission(role, resource, 'canView');
}

/**
 * Verifica se o usuário pode criar em um recurso
 */
export function canCreate(role: string, resource: string): boolean {
  return hasPermission(role, resource, 'canCreate');
}

/**
 * Verifica se o usuário pode editar um recurso
 */
export function canEdit(role: string, resource: string): boolean {
  return hasPermission(role, resource, 'canEdit');
}

/**
 * Verifica se o usuário pode deletar em um recurso
 */
export function canDelete(role: string, resource: string): boolean {
  return hasPermission(role, resource, 'canDelete');
}

