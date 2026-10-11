import { DTCFaultCode, VehicleProfile } from './vehicle';

export interface TestigoEvent {
  id: string;
  dtcCode: string;
  testigoIcon: 'check_engine' | 'temperatura' | 'bateria' | 'aceite' | 'abs';
  testigoName: string;
  timestamp: string; // ej: "2026-10-02 18:24"
  mileageAtEvent: number;
  description: string;
  freezeFrame: {
    rpm: number;
    speedKmH: number;
    coolantTempC: number;
    engineLoadPercent: number;
  };
  status: 'activo' | 'intermitente' | 'historico';
}

export interface ConsumptionHistoryPoint {
  date: string;
  avgLitersPer100km: number;
  trend: 'normal' | 'aumento' | 'critico';
  distanceRecordedKm: number;
  notes?: string;
}

export interface BatteryHealthHistory {
  currentRestVoltage: number; // Volts en reposo
  runningVoltage: number; // Volts con alternador cargando
  coldCrankingVoltageDrop: number; // Caída al arrancar (ej 10.4V)
  batteryHealthScorePercent: number; // 0 a 100
  status: 'optimo' | 'atencion' | 'reemplazo_sugerido';
  alertsHistory: Array<{
    date: string;
    description: string;
    voltageRecorded: number;
  }>;
}

export interface ThermalBehaviorHistory {
  avgOperatingTempC: number;
  maxPeakRecordedC: number;
  peakDate: string;
  peakSituation: string; // ej: "Subida autopista con aire acondicionado"
  fanCyclesNormal: boolean;
  status: 'normal' | 'alerta_temperatura';
}

export interface VehicleDiagnosticHistoryReport {
  code: string;
  vehicle: VehicleProfile;
  clientName: string;
  clientPhone: string;
  recordingPeriodDays: number;
  totalKmMonitored: number;
  generatedDate: string;
  
  // 1. Historial de Testigos y Códigos
  testigosTimeline: TestigoEvent[];
  
  // 2. Comportamiento de Consumo
  consumption: {
    baselineL100km: number;
    recentAvgL100km: number;
    percentIncrease: number; // ej: +24%
    recentHistory: ConsumptionHistoryPoint[];
    mechanicDiagnosis: string;
  };

  // 3. Salud y Caída de Batería
  battery: BatteryHealthHistory;

  // 4. Comportamiento Térmico
  thermal: ThermalBehaviorHistory;

  // 5. Alertas registradas por el ELM327
  elm327RegisteredAlerts: Array<{
    id: string;
    date: string;
    severity: 'alta' | 'media' | 'baja';
    title: string;
    detail: string;
  }>;
}
