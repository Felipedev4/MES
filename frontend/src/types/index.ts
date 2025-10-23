/**
 * Tipos TypeScript compartilhados
 */

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'DIRECTOR' | 'MANAGER' | 'SUPERVISOR' | 'LEADER' | 'OPERATOR';
  mustChangePassword?: boolean;
  employeeCode?: string;
  phone?: string;
  department?: string;
  active?: boolean;
}

export interface Company {
  id: number;
  code: string;
  name: string;
  tradeName?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
  isDefault?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  token?: string | null;
  user: User;
  companies: Company[];
  requiresCompanySelection: boolean;
}

export interface Color {
  id: number;
  code: string;
  name: string;
  hexCode?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  description?: string;
  unit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  itemColors?: { color: Color }[];
  colors?: Color[];
}

export interface Mold {
  id: number;
  code: string;
  name: string;
  description?: string;
  cavities: number;
  activeCavities?: number;
  cycleTime?: number;
  active: boolean;
  maintenanceDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ProductionStatus is defined in utils/productionStatus.ts
import type { ProductionStatus } from '../utils/productionStatus';

export interface ProductionOrder {
  id: number;
  orderNumber: string;
  itemId: number;
  colorId?: number;
  moldId?: number;
  plcConfigId?: number;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  status: ProductionStatus;
  priority: number;
  startDate?: string;
  endDate?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  item?: Item;
  color?: Color;
  mold?: Mold;
  plcConfig?: PlcConfig;
}

export type DowntimeType = 'PRODUCTIVE' | 'UNPRODUCTIVE' | 'PLANNED';

export interface Downtime {
  id: number;
  productionOrderId?: number;
  type: DowntimeType;
  reason: string;
  description?: string;
  responsibleId?: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  productionOrder?: ProductionOrder;
  responsible?: User;
}

export interface ProductionAppointment {
  id: number;
  productionOrderId: number;
  userId: number;
  quantity: number;
  rejectedQuantity: number;
  timestamp: string;
  startTime?: string;
  endTime?: string;
  durationSeconds?: number;
  automatic: boolean;
  clpCounterValue?: number;
  notes?: string;
  user?: User;
}

export interface DashboardKPIs {
  // KPIs Básicos
  totalOrders: number;
  ordersInProgress: number;
  totalProduced: number;
  totalRejected: number;
  qualityRate: number;
  totalDowntime: number;
  totalDowntimeFormatted: string;
  downtimeCount: number;
  
  // OEE
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  
  // KPIs Específicos para Plástico
  cycleEfficiency: number;
  cavityUtilization: number;
  avgSetupTimeMinutes: number;
  avgSetupTimeFormatted: string;
  setupCount: number;
  
  // Paradas por Tipo
  productiveDowntime: number;
  unproductiveDowntime: number;
  plannedDowntime: number;
  productiveDowntimeFormatted: string;
  unproductiveDowntimeFormatted: string;
  plannedDowntimeFormatted: string;
  
  // Defeitos
  topDefects: Array<{ defectName: string; quantity: number }>;
  totalDefects: number;
  
  // Produção
  activeInjectors: number;
  estimatedWeightKg: number;
  totalPlanned: number;
  piecesPerHour: number;
  productionHours: number;
  
  // Cavidades
  totalActiveCavities: number;
  totalPossibleCavities: number;
}

export interface ProductionByPeriod {
  period: string;
  produced: number;
  rejected: number;
  approved: number;
  appointmentCount: number;
}

export interface PlcStatus {
  connected: boolean;
  lastValue: number;
  timestamp: string;
}

export interface PlcRegister {
  id: number;
  plcConfigId: number;
  registerName: string;
  registerAddress: number;
  description?: string;
  dataType: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlcConfig {
  id: number;
  name: string;
  host: string;
  port: number;
  unitId: number;
  timeout: number;
  pollingInterval: number;
  reconnectInterval: number;
  timeDivisor: number;
  sectorId?: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  sector?: {
    id: number;
    code: string;
    name: string;
  };
  registers?: PlcRegister[];
}

export type DefectSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Defect {
  id: number;
  code: string;
  name: string;
  description?: string;
  severity: DefectSeverity;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionDefect {
  id: number;
  productionOrderId: number;
  defectId: number;
  quantity: number;
  timestamp: string;
  notes?: string;
  createdAt: string;
  defect?: Defect;
  productionOrder?: ProductionOrder;
}

export interface EmailConfig {
  id: number;
  companyId: number;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceAlert {
  id: number;
  companyId: number;
  moldId?: number;
  emailConfigId: number;
  recipientEmails: string;
  daysBeforeMaintenance: number;
  active: boolean;
  lastCheck?: string;
  createdAt: string;
  updatedAt: string;
  mold?: Mold;
  emailConfig?: EmailConfig;
}

export interface EmailLog {
  id: number;
  emailConfigId: number;
  moldId?: number;
  recipients: string;
  subject: string;
  body: string;
  success: boolean;
  error?: string;
  sentAt: string;
  emailConfig?: {
    name: string;
  };
  mold?: {
    code: string;
    description?: string;
  };
}
