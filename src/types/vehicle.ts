export interface VehicleProfile {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  fuelType: 'nafta' | 'diesel' | 'gnc' | 'hibrido';
  currentMileage: number;
  tankCapacityLiters: number;
  engineDisplacement: string;
  oilSpec: string;
  tirePressurePsiFront: number;
  tirePressurePsiRear: number;
  vin?: string;
  engine?: string;
  oilViscosity?: string;
  oilCapacityLiters?: number;
  coolantType?: string;
  wheelPsdFrontBar?: number;
  wheelPsdRearBar?: number;
  // Campos complementarios del parque automotor argentino
  generation?: string;
  timingType?: 'correa' | 'cadena';
  timingIntervalKm?: number;
  gncCompatible?: boolean;
  obdProtocol?: string;
  typicalWeakPoints?: string[];
  maintenanceTips?: string;
}

export interface ArgentineVehicleModel {
  id: string;
  brand: string;
  model: string;
  generation: string;
  years: string;
  bodyType: 'Hatchback' | 'Sedán' | 'Pick-up' | 'SUV' | 'Utilitario' | 'Monovolumen';
  engineDisplacement: string;
  engineCode?: string;
  fuelType: 'nafta' | 'diesel' | 'gnc' | 'hibrido';
  powerHp: number;
  tankCapacityLiters: number;
  oilSpec: string;
  oilViscosity: string;
  oilCapacityLiters: number;
  tirePressurePsiFront: number;
  tirePressurePsiRear: number;
  timingType: 'correa' | 'cadena';
  timingIntervalKm: number;
  gncCompatible: boolean;
  gncTubeRecommended?: string; // ej. 60L (14m³) bajo chasis o baúl
  obdProtocol: string;
  ecuSystem: string;
  typicalWeakPoints: string[];
  maintenanceTips: string;
  sparkPlugSpec?: string;
  popularRanking?: number; // Ranking de popularidad en Argentina (1 = más común)
}

export interface FreezeFrameSnapshot {
  triggerDtc: string;
  rpm: number;
  speed: number;
  coolantTemp: number;
  engineLoad: number;
  fuelPressureKpa?: number;
  calculatedTimestamp: string;
}

export interface ECUSensorInfo {
  pid: string;
  name: string;
  description: string;
  category: 'Motor' | 'Combustible' | 'Admisión / Aire' | 'Eléctrico' | 'Emisiones';
  isSupported: boolean;
  isActive: boolean;
  isPinned?: boolean; // Si el usuario marcó el check para mostrarlo en el tablero en vivo
  currentValue?: string;
  unit?: string;
  numericValue?: number | null;
  healthStatus?: 'optimal' | 'good' | 'warning' | 'danger' | 'unknown';
  healthLabel?: string;
  healthDescription?: string;
  idealRange?: string;
}

export interface OBDTelemetry {
  rpm: number;
  speed: number;
  coolantTemp: number; // Celsius
  fuelLevelPercent: number | null;
  engineLoad: number; // %
  throttlePos: number; // %
  intakeAirTemp: number; // Celsius
  mafRate: number; // g/s
  batteryVoltage: number; // Volts
  intakePressureMap: number; // kPa
  timingAdvance: number; // degrees
  shortTermFuelTrim: number; // %
  longTermFuelTrim: number; // %
  instantConsumptionL100km: number;
  avgConsumptionL100km: number;
  rangeKmRemaining: number;
  isEngineRunning: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'simulated';
  activeDtcsCount: number;
  lastUpdated: string;
  // Parámetros extendidos Modo 22 (UDS / Ford / VAG) y Modo 02 (Freeze Frame)
  oilTemp?: number; // °C (PID 5C / Ford 221310)
  oilPressureKpa?: number; // kPa (Ford 2211C6 / UDS)
  transmissionTemp?: number; // °C (Ford 221E1C / UDS)
  totalMisfires?: number; // Conteo de fallas de encendido (Ford 221616)
  ambientTemp?: number; // °C (PID 46 / Ford 22F446)
  fuelPressureKpa?: number; // kPa (PID 0A)
  barometricPressureKpa?: number; // kPa (PID 33)
  engineRunTimeSec?: number; // seg (PID 1F)
  controlModuleVoltage?: number; // V (PID 42)
  distanceWithMilKm?: number; // km (PID 21)
  distanceSinceDtcClearedKm?: number; // km (PID 31)
  fuelRailPressureDieselKpa?: number; // kPa (PID 23)
  freezeFrame?: FreezeFrameSnapshot;
  fuelTypeDetected?: 'nafta' | 'diesel' | 'gnc' | 'hibrido';
  // Estado específico del enlace con la computadora (ECU) del vehículo
  ecuStatus?: 'searching' | 'connected' | 'no_data' | 'error' | 'unsupported_protocol';
  ecuProtocolDetected?: string;
  lastRawResponse?: string;
  lastCommandSent?: string;
  isAutoPolling?: boolean;
  autoPollCount?: number;
  fuelLevelSensorStatus?: 'hardware_ecu' | 'unsupported_by_ecu' | 'manual_calibrated';
  // Sensores compatibles detectados en la ECU conectada
  supportedSensorsCount?: number;
  activeSensorsCount?: number;
  supportedSensorsList?: ECUSensorInfo[];
  pinnedSensorPids?: string[]; // PIDs seleccionados por el usuario para ver en vivo
}

export type DtcSeverity = 'critical' | 'warning' | 'advisory';

export interface DTCFaultCode {
  code: string;
  title: string;
  category:
    | 'Combustión / Encendido'
    | 'Emisiones / Catalizador'
    | 'Inyección / Aire'
    | 'Refrigeración / Sensor'
    | 'Transmisión / Eléctrico'
    | 'Frenos / Chasis (ABS)'
    | 'Red de Comunicación CAN'
    | 'Carrocería / Seguridad';
  severity: DtcSeverity;
  description: string;
  symptoms: string[];
  possibleCauses: string[];
  recommendedAction: string;
  estimatedRepairCostRange: string;
  active: boolean;
  timestamp: string;
  milStatus: boolean; // Malfunction Indicator Lamp (Check Engine Light)
}

export interface FluidLevel {
  id: string;
  name: string;
  category: 'motor' | 'frenos' | 'refrigeracion' | 'lavaparabrisas' | 'transmision';
  currentLevelPercent: number;
  status: 'optimal' | 'warning' | 'critical';
  spec: string;
  lastCheckedDate: string;
  nextChangeMileage: number;
  notes: string;
}

export interface EcoTip {
  id: string;
  title: string;
  category: 'Ralentí' | 'Aceleración' | 'Neumáticos' | 'Velocidad' | 'Mantenimiento';
  potentialMonthlySaving: number;
  impact: 'alto' | 'medio' | 'moderado';
  explanation: string;
  action: string;
  detectedInDriving: boolean;
}

export interface EcoSavingReport {
  currentMonthAvgL100km: number;
  previousMonthAvgL100km: number;
  monthlyDistanceKm: number;
  fuelPricePerLiter: number;
  totalSpentCurrentMonth: number;
  totalSpentPreviousMonth: number;
  totalPotentialSavings: number;
  tips: EcoTip[];
}

export interface WorkshopService {
  name: string;
  price: number;
  estimatedDurationMinutes: number;
  includes: string;
}

export interface Workshop {
  id: string;
  name: string;
  type: 'lubricentro' | 'mecanica_integral' | 'frenos_suspension' | 'inyeccion_electronica';
  rating: number;
  reviewsCount: number;
  address: string;
  city: string;
  distanceKm: number;
  phone: string;
  openHours: string;
  certifiedOBD: boolean;
  services: WorkshopService[];
}

export interface ServiceAppointment {
  id: string;
  workshopId: string;
  workshopName: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  estimatedCost: number;
  vehiclePlate: string;
  vehicleModel: string;
  clientName: string;
  clientPhone: string;
  notes: string;
  status: 'confirmado' | 'pendiente' | 'completado' | 'cancelado';
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  mileage: number;
  serviceType: string;
  workshopName: string;
  cost: number;
  partsReplaced: string[];
  invoiceNumber?: string;
  nextDueMileage: number;
  nextDueDate: string;
  notes: string;
}

export interface MaintenanceAlert {
  id: string;
  title: string;
  type: 'aceite' | 'frenos' | 'distribucion' | 'filtros' | 'vtv' | 'bateria';
  status: 'ok' | 'proximo' | 'vencido';
  currentKm: number;
  dueKm: number;
  dueDate: string;
  kmRemaining: number;
  daysRemaining: number;
  description: string;
}
