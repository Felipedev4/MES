/**
 * Tipos TypeScript compartilhados
 */

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'OPERATOR';
}

export interface AuthResponse {
  token: string;
  user: User;
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
}

export interface Mold {
  id: number;
  code: string;
  name: string;
  description?: string;
  cavities: number;
  cycleTime?: number;
  active: boolean;
  maintenanceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductionStatus = 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface ProductionOrder {
  id: number;
  orderNumber: string;
  itemId: number;
  moldId?: number;
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
  mold?: Mold;
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
  automatic: boolean;
  clpCounterValue?: number;
  notes?: string;
  user?: User;
}

export interface DashboardKPIs {
  totalOrders: number;
  ordersInProgress: number;
  totalProduced: number;
  totalRejected: number;
  qualityRate: number;
  totalDowntime: number;
  totalDowntimeFormatted: string;
  downtimeCount: number;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
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


