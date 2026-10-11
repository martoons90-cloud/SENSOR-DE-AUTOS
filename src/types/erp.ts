export type ServiceCategory = 'lubricentro' | 'mecanica' | 'frenos' | 'diagnostico' | 'integral';
export type JobStatus = 'ingresado' | 'en_proceso' | 'esperando_repuestos' | 'finalizado' | 'entregado';
export type ProductCategory = 'aceites_motor' | 'aceites_transmision' | 'filtros' | 'aditivos_fluidos' | 'pastillas_frenos' | 'baterias';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito' | 'cuenta_corriente';

export interface WorkOrder {
  id: string; // OT-1042
  vehiclePlate: string; // AF 492 KZ
  vehicleModel: string; // Toyota Hilux 2.8 TDI
  vehicleYear: number;
  currentKm: number;
  customerName: string;
  customerPhone: string;
  customerType: 'particular' | 'flota_empresa';
  serviceCategory: ServiceCategory;
  serviceDetails: string;
  mechanic: string;
  bay: string; // Fosa 1, Elevador 2, etc.
  status: JobStatus;
  date: string;
  estimatedCost: number;
  laborCost: number;
  partsUsed: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  nextServiceKm: number;
  nextServiceDate: string;
  diagnosticDtc?: string[]; // Códigos OBD2 si fueron detectados
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  unit: 'litros' | 'unidades' | 'bidon_4l' | 'bidon_1l';
  stock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  location: string;
}

export interface SaleItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string; // VTA-4029
  date: string;
  time: string;
  customerName: string;
  customerPlate?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: 'cobrado' | 'pendiente_cuenta_corriente';
  type: 'mostrador' | 'servicio_taller';
  relatedOtId?: string;
}

export interface PendingInvoice {
  invoiceId: string;
  date: string;
  dueDate: string;
  concept: string;
  amount: number;
  paidAmount: number;
  isOverdue: boolean;
}

export interface CustomerAccount {
  id: string;
  customerName: string;
  cuitOrDni: string;
  phone: string;
  companyOrFleet?: string;
  totalDebt: number;
  creditLimit: number;
  lastPaymentDate: string;
  pendingInvoices: PendingInvoice[];
}

export interface ServiceBay {
  id: string;
  name: string;
  type: 'fosa' | 'elevador' | 'bahia_obd';
  isOccupied: boolean;
  currentOtId?: string;
  currentVehicle?: string;
  currentService?: string;
  mechanic?: string;
  progressPercent?: number;
}

export interface WorkshopAppointment {
  id: string;
  timeSlot: string;
  date: string;
  customerName: string;
  phone: string;
  vehicle: string;
  plate: string;
  serviceRequested: string;
  status: 'confirmado' | 'en_espera' | 'completado' | 'cancelado';
  bayAssigned?: string;
}
