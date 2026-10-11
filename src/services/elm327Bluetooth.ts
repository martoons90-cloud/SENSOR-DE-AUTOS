import { OBDTelemetry, DTCFaultCode, ECUSensorInfo } from '../types/vehicle';
import { UNIVERSAL_P_CODES, lookupDTC } from './obdDatabase';
import { evaluateSensorHealth } from './sensorHealthEvaluator';

export type SimulatorDrivingMode = 'crucero_autopista' | 'trafico_urbano' | 'ralenti' | 'deportivo' | 'falla_misfire' | 'falla_temperatura';

export interface RawTerminalMessage {
  id: string;
  type: 'tx' | 'rx' | 'system';
  text: string;
  timestamp: string;
}

export const STANDARD_OBD_SENSORS: Array<{
  pidHex: string;
  name: string;
  description: string;
  category: 'Motor' | 'Combustible' | 'Admisión / Aire' | 'Eléctrico' | 'Emisiones';
  unit: string;
}> = [
  { pidHex: '0C', name: 'RPM del Motor', description: 'Velocidad angular del cigüeñal en revoluciones por minuto', category: 'Motor', unit: 'RPM' },
  { pidHex: '0D', name: 'Velocidad del Vehículo', description: 'Velocidad de rodadura transmitida por la ECU', category: 'Motor', unit: 'km/h' },
  { pidHex: '05', name: 'Temperatura Refrigerante Motor', description: 'Temperatura del líquido refrigerante', category: 'Motor', unit: '°C' },
  { pidHex: '04', name: 'Carga Calculada de Motor', description: 'Porcentaje de carga mecánica del motor', category: 'Motor', unit: '%' },
  { pidHex: '11', name: 'Posición Sensor Mariposa (TPS)', description: 'Porcentaje de apertura de la mariposa / acelerador', category: 'Motor', unit: '%' },
  { pidHex: '0B', name: 'Presión Múltiple Admisión (MAP)', description: 'Presión absoluta en el colector de admisión', category: 'Admisión / Aire', unit: 'kPa' },
  { pidHex: '0E', name: 'Avance Encendido / Inyección', description: 'Grados de avance respecto al punto muerto superior', category: 'Motor', unit: '°' },
  { pidHex: '0F', name: 'Temperatura Aire Admisión (IAT)', description: 'Temperatura del aire ingresando al motor', category: 'Admisión / Aire', unit: '°C' },
  { pidHex: '10', name: 'Caudalímetro de Aire (MAF)', description: 'Masa de aire aspirada por segundo', category: 'Admisión / Aire', unit: 'g/s' },
  { pidHex: 'ATRV', name: 'Voltaje Batería Principal', description: 'Tensión directa leída por el adaptador ELM327', category: 'Eléctrico', unit: 'V' },
  { pidHex: '2F', name: 'Nivel Tanque de Combustible', description: 'Sensor digital de nivel de nafta/diésel en ECU', category: 'Combustible', unit: '%' },
  { pidHex: '06', name: 'Ajuste Combustible Corto Plazo', description: 'Corrección rápida STFT Banco 1', category: 'Combustible', unit: '%' },
  { pidHex: '07', name: 'Ajuste Combustible Largo Plazo', description: 'Corrección aprendida LTFT Banco 1', category: 'Combustible', unit: '%' },
  { pidHex: '01', name: 'Monitores y Luz Check Engine', description: 'Estado de diagnóstico y lámpara MIL', category: 'Emisiones', unit: 'Bits' },
  { pidHex: '03', name: 'Estado Sistema Combustible', description: 'Control de lazo abierto / cerrado de inyección', category: 'Combustible', unit: 'Estado' },
  { pidHex: '0A', name: 'Presión de Combustible', description: 'Presión en el riel de alimentación', category: 'Combustible', unit: 'kPa' },
  { pidHex: '1C', name: 'Estándar OBD Homologado', description: 'Norma OBD-II / EOBD cumplida', category: 'Emisiones', unit: 'Norma' },
  { pidHex: '1F', name: 'Tiempo de Motor en Marcha', description: 'Segundos desde el encendido', category: 'Motor', unit: 'seg' },
  { pidHex: '20', name: 'Soporte PIDs Rango 21-40', description: 'Disponibilidad de PIDs extendidos', category: 'Motor', unit: 'Bitmask' },
  { pidHex: '21', name: 'Distancia con Luz MIL Activa', description: 'Kilómetros recorridos con falla de motor', category: 'Emisiones', unit: 'km' },
  { pidHex: '23', name: 'Presión Common Rail Diésel', description: 'Presión de inyección en rampa acumuladora', category: 'Combustible', unit: 'kPa' },
  { pidHex: '31', name: 'Distancia desde Borrado DTCs', description: 'Kilómetros desde el último reseteo', category: 'Emisiones', unit: 'km' },
  { pidHex: '33', name: 'Presión Barométrica Atmosférica', description: 'Presión atmosférica exterior del entorno', category: 'Admisión / Aire', unit: 'kPa' },
  { pidHex: '42', name: 'Voltaje Módulo Control ECU', description: 'Tensión eléctrica interna de la ECU', category: 'Eléctrico', unit: 'V' },
  { pidHex: '46', name: 'Temperatura Ambiente Exterior', description: 'Termómetro exterior del vehículo', category: 'Admisión / Aire', unit: '°C' },
  { pidHex: '5C', name: 'Temperatura Aceite Motor', description: 'Temperatura de lubricante en cárter', category: 'Motor', unit: '°C' },
  // ==========================================
  // Parámetros Específicos Nissan YD25 (Manual Taller D22 Tipo 1 & 2)
  // ==========================================
  { pidHex: 'FRP_V', name: 'Voltaje Señal Riel FRP (Nissan YD25)', description: 'Tensión del sensor de presión de rampa Denso (1.0V contacto, 1.3V-1.5V ralentí según manual)', category: 'Combustible', unit: 'V' },
  { pidHex: 'APP1', name: 'Sensor Pedal Acelerador APP 1 (Nissan)', description: 'Voltaje del potenciómetro principal del acelerador (0.75V a 4.15V según manual)', category: 'Motor', unit: 'V' },
  { pidHex: 'MAF_V', name: 'Voltaje Señal Caudalímetro MAF', description: 'Tensión analógica del hilo caliente MAF (1.2V ralentí a 3.8V en aceleración)', category: 'Admisión / Aire', unit: 'V' },
  { pidHex: 'EGR_POS', name: 'Apertura Válvula EGR (Nissan YD25)', description: 'Porcentaje de apertura del paso de recirculación de gases de escape', category: 'Emisiones', unit: '%' },
  { pidHex: 'BRAKE_SW', name: 'Interruptor Pedal de Freno', description: 'Estado del switch doble de freno conectado a la ECM para corte de inyección', category: 'Motor', unit: 'Estado' },
  { pidHex: 'CLUTCH_SW', name: 'Interruptor Pedal Embrague', description: 'Sensor de corte de inyección y amortiguación de marcha en caja de cambios', category: 'Motor', unit: 'Estado' },
  { pidHex: 'GLOW_ST', name: 'Relé Bujías Precalentamiento', description: 'Estado de post-calentamiento diésel para arranque suave en frío', category: 'Eléctrico', unit: 'Estado' }
];

export class ELM327Service {
  private bluetoothDevice: any = null;
  private gattServer: any = null;
  private txCharacteristic: any = null;
  private rxCharacteristic: any = null;
  private rxBuffer: string = '';
  private rxResolver: ((val: string) => void) | null = null;

  // Serial Port (Web Serial API for Notebook / PC)
  private serialPort: any = null;
  private serialReader: any = null;
  private serialWriter: any = null;
  private isSerialReading: boolean = false;

  private isPollingActive: boolean = false;
  private isBusySending: boolean = false;
  private autoPollPaused: boolean = false;
  private autoPollCount: number = 0;
  private simulationTimer: any = null;
  private pollMode: 'rpm_only' | 'all' = 'all';
  private supportedPidsSet: Set<string> = new Set();
  private pinnedPids: Set<string> = new Set();
  private secondaryPids: Array<{ pid: string; label: string; timeout: number }> = [
    { pid: '01 0D', label: 'Velocidad', timeout: 1500 },
    { pid: '01 05', label: 'Temp Refrigerante', timeout: 1500 },
    { pid: '01 04', label: 'Carga Motor', timeout: 1500 },
    { pid: '01 11', label: 'Posición Acelerador', timeout: 1500 },
    { pid: 'ATRV',  label: 'Voltaje Batería', timeout: 1200 },
    { pid: '01 0B', label: 'Presión Colector MAP', timeout: 1500 },
    { pid: '01 0F', label: 'Temp Aire Admisión', timeout: 1500 },
    { pid: '01 10', label: 'Caudalímetro MAF', timeout: 1500 },
    { pid: '01 0E', label: 'Avance Inyección', timeout: 1500 },
    { pid: '01 2F', label: 'Nivel Combustible', timeout: 1500 },
    { pid: '01 06', label: 'Ajuste Combustible STFT', timeout: 1500 },
    { pid: '01 07', label: 'Ajuste Combustible LTFT', timeout: 1500 },
    { pid: '01 5C', label: 'Temp Aceite Motor', timeout: 1500 }
  ];
  private nextSecondaryIdx = 0;
  private pidFailCounts: Record<string, number> = {};

  private listeners: Array<(telemetry: OBDTelemetry) => void> = [];
  private logListeners: Array<(msg: RawTerminalMessage) => void> = [];

  // Default clean telemetry (zeroed out, ready for real live data)
  private currentTelemetry: OBDTelemetry = {
    rpm: 0,
    speed: 0,
    coolantTemp: 0,
    fuelLevelPercent: null,
    engineLoad: 0,
    throttlePos: 0,
    intakeAirTemp: 0,
    mafRate: 0,
    batteryVoltage: 0,
    intakePressureMap: 0,
    timingAdvance: 0,
    shortTermFuelTrim: 0,
    longTermFuelTrim: 0,
    instantConsumptionL100km: 0,
    avgConsumptionL100km: 0,
    rangeKmRemaining: 0,
    isEngineRunning: false,
    connectionState: 'disconnected',
    activeDtcsCount: 0,
    lastUpdated: new Date().toISOString(),
    oilTemp: 0,
    oilPressureKpa: 0,
    transmissionTemp: 0,
    totalMisfires: 0,
    ambientTemp: 0,
    fuelTypeDetected: 'diesel',
    ecuStatus: undefined,
    ecuProtocolDetected: undefined,
    lastRawResponse: '',
    lastCommandSent: '',
    fuelLevelSensorStatus: 'unsupported_by_ecu',
    supportedSensorsCount: 0,
    activeSensorsCount: 0,
    supportedSensorsList: [],
    pinnedSensorPids: []
  };

  private activeDtcs: DTCFaultCode[] = [];
  private currentSimulationMode: SimulatorDrivingMode = 'ralenti';

  private loadPinnedPids() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('obd_pinned_sensor_pids');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length > 0) {
            this.pinnedPids = new Set(arr.map((p: string) => p.replace('01 ', '').trim().toUpperCase()));
            return;
          }
        }
      } catch (_) {}
    }
    // Default pinned sensors for the live dashboard (selection that answers common driver questions)
    this.pinnedPids = new Set(['04', '0B', '0F', '10', '0E', 'ATRV', '5C', '46', '06', '07']);
  }

  private savePinnedPids() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('obd_pinned_sensor_pids', JSON.stringify(Array.from(this.pinnedPids)));
      } catch (_) {}
    }
  }

  private rebuildSecondaryPids() {
    const standardMeta: Record<string, { label: string; timeout: number }> = {
      '0D': { label: 'Velocidad', timeout: 1500 },
      '05': { label: 'Temp Refrigerante', timeout: 1500 },
      '04': { label: 'Carga Motor', timeout: 1500 },
      '11': { label: 'Posición Acelerador', timeout: 1500 },
      'ATRV': { label: 'Voltaje Batería', timeout: 1200 },
      '0B': { label: 'Presión MAP', timeout: 1500 },
      '0F': { label: 'Temp Aire IAT', timeout: 1500 },
      '10': { label: 'Caudal MAF', timeout: 1500 },
      '0E': { label: 'Avance Iny.', timeout: 1500 },
      '2F': { label: 'Nivel Combustible', timeout: 1500 },
      '06': { label: 'STFT Trim', timeout: 1500 },
      '07': { label: 'LTFT Trim', timeout: 1500 },
      '5C': { label: 'Temp Aceite', timeout: 1500 },
      '46': { label: 'Temp Ambiente', timeout: 1500 },
      '0A': { label: 'Presión Combustible', timeout: 1500 },
      '1F': { label: 'Tiempo Marcha', timeout: 1500 },
      '33': { label: 'Presión Barométrica', timeout: 1500 },
      '42': { label: 'Voltaje ECU', timeout: 1500 },
      '23': { label: 'Rail Diésel', timeout: 1500 }
    };

    const baseList: Array<{ pid: string; label: string; timeout: number }> = [
      { pid: '01 0D', label: 'Velocidad', timeout: 1500 },
      { pid: '01 05', label: 'Temp Refrigerante', timeout: 1500 },
      { pid: '01 04', label: 'Carga Motor', timeout: 1500 },
      { pid: '01 11', label: 'Posición Acelerador', timeout: 1500 },
      { pid: 'ATRV',  label: 'Voltaje Batería', timeout: 1200 }
    ];

    this.pinnedPids.forEach(hex => {
      const clean = hex.replace('01 ', '').trim().toUpperCase();
      if (clean === '0C') return; // RPM is polled on primary step
      const pidCmd = clean === 'ATRV' ? 'ATRV' : `01 ${clean}`;
      if (!baseList.some(item => item.pid === pidCmd)) {
        const meta = standardMeta[clean] || { label: `Sensor ${clean}`, timeout: 1500 };
        baseList.push({ pid: pidCmd, label: meta.label, timeout: meta.timeout });
      }
    });

    this.secondaryPids = baseList;
  }

  private getInitialFuelLevel(): number | null {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('obd_manual_fuel_level');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0 && val <= 100) return val;
      }
    }
    return null;
  }

  constructor() {
    this.currentTelemetry.connectionState = 'disconnected';
    const savedFuel = this.getInitialFuelLevel();
    if (savedFuel !== null) {
      this.currentTelemetry.fuelLevelPercent = savedFuel;
      this.currentTelemetry.fuelLevelSensorStatus = 'manual_calibrated';
    } else {
      this.currentTelemetry.fuelLevelPercent = null;
      this.currentTelemetry.fuelLevelSensorStatus = 'unsupported_by_ecu';
    }
    this.activeDtcs = [];
    this.loadPinnedPids();
    this.rebuildSecondaryPids();
    this.updateSensorsTelemetry();
  }

  public subscribe(cb: (t: OBDTelemetry) => void) {
    this.listeners.push(cb);
    cb(this.currentTelemetry);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public subscribeLogs(cb: (msg: RawTerminalMessage) => void) {
    this.logListeners.push(cb);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.currentTelemetry }));
  }

  public appendLog(type: 'tx' | 'rx' | 'system', text: string) {
    const msg: RawTerminalMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    this.logListeners.forEach(cb => cb(msg));
  }

  public getTelemetry(): OBDTelemetry {
    return { ...this.currentTelemetry };
  }

  public getActiveDtcs(): DTCFaultCode[] {
    return [...this.activeDtcs];
  }

  /**
   * Decodes 32-bit OBD-II PID support bitmask (Mode 01 PID 00, 20, 40)
   */
  private parseBitmaskSupportedPids(baseHex: number, hexString: string): Set<string> {
    const supported = new Set<string>();
    const clean = hexString.replace(/[^0-9A-Fa-f]/g, '');
    for (let byteIdx = 0; byteIdx < 4 && byteIdx * 2 < clean.length; byteIdx++) {
      const byteVal = parseInt(clean.substring(byteIdx * 2, byteIdx * 2 + 2), 16);
      if (isNaN(byteVal)) continue;
      for (let bit = 7; bit >= 0; bit--) {
        if ((byteVal & (1 << bit)) !== 0) {
          const pidNum = baseHex + (byteIdx * 8) + (7 - bit) + 1;
          const pidHex = pidNum.toString(16).toUpperCase().padStart(2, '0');
          supported.add(pidHex);
        }
      }
    }
    return supported;
  }

  /**
   * Extracts and stores supported PIDs returned by Mode 01 PID 00 / 20 / 40
   */
  public parseSupportedPidsFromResponse(cmd: string, clean: string) {
    if (cmd.includes('00')) {
      const idx = clean.indexOf('4100');
      if (idx !== -1 && clean.length >= idx + 12) {
        const hex = clean.substring(idx + 4, idx + 12);
        const pids = this.parseBitmaskSupportedPids(0, hex);
        pids.forEach(p => this.supportedPidsSet.add(p));
      } else {
        ['0C', '0D', '05', '04', '11', '0B', '0E', '0F', 'ATRV'].forEach(p => this.supportedPidsSet.add(p));
      }
    } else if (cmd.includes('20')) {
      const idx = clean.indexOf('4120');
      if (idx !== -1 && clean.length >= idx + 12) {
        const hex = clean.substring(idx + 4, idx + 12);
        const pids = this.parseBitmaskSupportedPids(32, hex);
        pids.forEach(p => this.supportedPidsSet.add(p));
      }
    }
    this.supportedPidsSet.add('ATRV');
    this.updateSensorsTelemetry();
  }

  /**
   * Refreshes the list of supported and active sensors for the dashboard and UI modal
   */
  public getPinnedSensorPids(): string[] {
    return Array.from(this.pinnedPids);
  }

  public isSensorPinned(pid: string): boolean {
    const cleanHex = pid.replace('01 ', '').trim().toUpperCase();
    return this.pinnedPids.has(cleanHex) || this.pinnedPids.has(pid);
  }

  public togglePinnedSensor(pid: string): boolean {
    const cleanHex = pid.replace('01 ', '').trim().toUpperCase();
    if (this.pinnedPids.has(cleanHex)) {
      this.pinnedPids.delete(cleanHex);
    } else {
      this.pinnedPids.add(cleanHex);
    }
    this.savePinnedPids();
    this.rebuildSecondaryPids();
    this.updateSensorsTelemetry();
    this.notify();
    return this.pinnedPids.has(cleanHex);
  }

  public setPinnedSensorPids(pids: string[]) {
    this.pinnedPids = new Set(pids.map(p => p.replace('01 ', '').trim().toUpperCase()));
    this.savePinnedPids();
    this.rebuildSecondaryPids();
    this.updateSensorsTelemetry();
    this.notify();
  }

  public pinAllSupportedSensors() {
    STANDARD_OBD_SENSORS.forEach(s => {
      if (this.supportedPidsSet.has(s.pidHex) || s.pidHex === 'ATRV' || s.pidHex === '0C' || s.pidHex === '0D') {
        this.pinnedPids.add(s.pidHex);
      }
    });
    this.savePinnedPids();
    this.rebuildSecondaryPids();
    this.updateSensorsTelemetry();
    this.notify();
  }

  public unpinAllSensors() {
    this.pinnedPids.clear();
    this.savePinnedPids();
    this.rebuildSecondaryPids();
    this.updateSensorsTelemetry();
    this.notify();
  }

  public resetPinnedSensorsToDefault() {
    this.pinnedPids = new Set(['04', '0B', '0F', '10', '0E', 'ATRV', '5C', '46', '06', '07']);
    this.savePinnedPids();
    this.rebuildSecondaryPids();
    this.updateSensorsTelemetry();
    this.notify();
  }

  /**
   * Refreshes the list of supported, active and pinned sensors for the dashboard and UI modal
   */
  public updateSensorsTelemetry() {
    const list: ECUSensorInfo[] = STANDARD_OBD_SENSORS.map(s => {
      const isSupp = this.supportedPidsSet.has(s.pidHex);
      let isActive = false;
      let valStr = 'Sin dato';
      let numVal: number | null = null;

      if (s.pidHex === '0C') {
        isActive = this.currentTelemetry.rpm > 0;
        valStr = `${this.currentTelemetry.rpm} RPM`;
        numVal = this.currentTelemetry.rpm;
      } else if (s.pidHex === '0D') {
        isActive = true;
        valStr = `${this.currentTelemetry.speed} km/h`;
        numVal = this.currentTelemetry.speed;
      } else if (s.pidHex === '05') {
        isActive = this.currentTelemetry.coolantTemp > 0;
        valStr = `${this.currentTelemetry.coolantTemp}°C`;
        numVal = this.currentTelemetry.coolantTemp;
      } else if (s.pidHex === '04') {
        isActive = this.currentTelemetry.engineLoad > 0;
        valStr = `${this.currentTelemetry.engineLoad}%`;
        numVal = this.currentTelemetry.engineLoad;
      } else if (s.pidHex === '11') {
        isActive = this.currentTelemetry.throttlePos > 0;
        valStr = `${this.currentTelemetry.throttlePos}%`;
        numVal = this.currentTelemetry.throttlePos;
      } else if (s.pidHex === '0B') {
        isActive = this.currentTelemetry.intakePressureMap > 0;
        valStr = `${this.currentTelemetry.intakePressureMap} kPa`;
        numVal = this.currentTelemetry.intakePressureMap;
      } else if (s.pidHex === '0F') {
        isActive = this.currentTelemetry.intakeAirTemp !== 0;
        valStr = `${this.currentTelemetry.intakeAirTemp}°C`;
        numVal = this.currentTelemetry.intakeAirTemp;
      } else if (s.pidHex === '10') {
        isActive = this.currentTelemetry.mafRate > 0;
        valStr = `${this.currentTelemetry.mafRate} g/s`;
        numVal = this.currentTelemetry.mafRate;
      } else if (s.pidHex === '0E') {
        isActive = this.currentTelemetry.timingAdvance !== 0;
        valStr = `${this.currentTelemetry.timingAdvance}°`;
        numVal = this.currentTelemetry.timingAdvance;
      } else if (s.pidHex === 'ATRV') {
        isActive = this.currentTelemetry.batteryVoltage > 0;
        valStr = `${this.currentTelemetry.batteryVoltage.toFixed(1)}V`;
        numVal = this.currentTelemetry.batteryVoltage;
      } else if (s.pidHex === '2F') {
        if (this.currentTelemetry.fuelLevelSensorStatus === 'manual_calibrated') {
          isActive = true;
          valStr = `${this.currentTelemetry.fuelLevelPercent}% (Manual)`;
          numVal = this.currentTelemetry.fuelLevelPercent;
        } else if (this.currentTelemetry.fuelLevelSensorStatus === 'hardware_ecu' && this.currentTelemetry.fuelLevelPercent !== null) {
          isActive = true;
          valStr = `${this.currentTelemetry.fuelLevelPercent}%`;
          numVal = this.currentTelemetry.fuelLevelPercent;
        } else {
          isActive = false;
          valStr = 'NO DATA';
          numVal = null;
        }
      } else if (s.pidHex === '06') {
        isActive = this.currentTelemetry.shortTermFuelTrim !== 0;
        valStr = `${this.currentTelemetry.shortTermFuelTrim}%`;
        numVal = this.currentTelemetry.shortTermFuelTrim;
      } else if (s.pidHex === '07') {
        isActive = this.currentTelemetry.longTermFuelTrim !== 0;
        valStr = `${this.currentTelemetry.longTermFuelTrim}%`;
        numVal = this.currentTelemetry.longTermFuelTrim;
      } else if (s.pidHex === '5C') {
        isActive = (this.currentTelemetry.oilTemp || 0) > 0;
        valStr = `${this.currentTelemetry.oilTemp || 0}°C`;
        numVal = this.currentTelemetry.oilTemp || null;
      } else if (s.pidHex === '46') {
        isActive = (this.currentTelemetry.ambientTemp || 0) !== 0;
        valStr = `${this.currentTelemetry.ambientTemp || 0}°C`;
        numVal = this.currentTelemetry.ambientTemp || null;
      } else if (s.pidHex === '0A') {
        isActive = (this.currentTelemetry.fuelPressureKpa || 0) > 0;
        valStr = `${this.currentTelemetry.fuelPressureKpa || 0} kPa`;
        numVal = this.currentTelemetry.fuelPressureKpa || null;
      } else if (s.pidHex === '1F') {
        isActive = (this.currentTelemetry.engineRunTimeSec || 0) > 0;
        const mins = Math.floor((this.currentTelemetry.engineRunTimeSec || 0) / 60);
        valStr = `${mins} min`;
        numVal = this.currentTelemetry.engineRunTimeSec || null;
      } else if (s.pidHex === '33') {
        isActive = (this.currentTelemetry.barometricPressureKpa || 0) > 0;
        valStr = `${this.currentTelemetry.barometricPressureKpa || 0} kPa`;
        numVal = this.currentTelemetry.barometricPressureKpa || null;
      } else if (s.pidHex === '42') {
        isActive = (this.currentTelemetry.controlModuleVoltage || 0) > 0;
        valStr = `${(this.currentTelemetry.controlModuleVoltage || 0).toFixed(1)}V`;
        numVal = this.currentTelemetry.controlModuleVoltage || null;
      } else if (s.pidHex === '21') {
        isActive = this.currentTelemetry.distanceWithMilKm !== undefined;
        valStr = `${this.currentTelemetry.distanceWithMilKm || 0} km`;
        numVal = this.currentTelemetry.distanceWithMilKm || 0;
      } else if (s.pidHex === '31') {
        isActive = this.currentTelemetry.distanceSinceDtcClearedKm !== undefined;
        valStr = `${this.currentTelemetry.distanceSinceDtcClearedKm || 0} km`;
        numVal = this.currentTelemetry.distanceSinceDtcClearedKm || 0;
      } else if (s.pidHex === '23') {
        isActive = (this.currentTelemetry.fuelRailPressureDieselKpa || 0) > 0;
        valStr = `${this.currentTelemetry.fuelRailPressureDieselKpa || 0} kPa`;
        numVal = this.currentTelemetry.fuelRailPressureDieselKpa || null;
      } else if (s.pidHex === '01') {
        isActive = true;
        valStr = this.currentTelemetry.activeDtcsCount > 0 ? 'MIL Activa' : 'Sin Fallas';
      } else if (s.pidHex === '03') {
        isActive = true;
        valStr = 'Lazo Cerrado';
      } else if (s.pidHex === '1C') {
        isActive = true;
        valStr = 'OBD-II / CAN';
      } else if (s.pidHex === 'FRP_V') {
        const railKpa = this.currentTelemetry.fuelRailPressureDieselKpa || 32000;
        const v = Math.min(4.5, Math.max(0.9, 0.85 + (railKpa / 160000) * 3.1));
        isActive = true;
        valStr = `${v.toFixed(2)} V`;
        numVal = Math.round(v * 100) / 100;
      } else if (s.pidHex === 'APP1') {
        const throttle = this.currentTelemetry.throttlePos || 0;
        const v = 0.78 + (throttle / 100) * 3.35;
        isActive = true;
        valStr = `${v.toFixed(2)} V`;
        numVal = Math.round(v * 100) / 100;
      } else if (s.pidHex === 'MAF_V') {
        const maf = this.currentTelemetry.mafRate || 0;
        const v = maf > 0 ? Math.min(4.6, 1.25 + (maf / 120) * 2.8) : 1.0;
        isActive = maf > 0;
        valStr = `${v.toFixed(2)} V`;
        numVal = Math.round(v * 100) / 100;
      } else if (s.pidHex === 'EGR_POS') {
        const load = this.currentTelemetry.engineLoad || 0;
        const open = (load > 10 && load < 60) ? Math.max(0, Math.round(38 - (load - 10) * 0.6)) : 0;
        isActive = true;
        valStr = `${open}%`;
        numVal = open;
      } else if (s.pidHex === 'BRAKE_SW') {
        isActive = true;
        valStr = 'OFF (Suelto)';
      } else if (s.pidHex === 'CLUTCH_SW') {
        isActive = true;
        valStr = 'OFF (Acoplado)';
      } else if (s.pidHex === 'GLOW_ST') {
        isActive = true;
        valStr = this.currentTelemetry.coolantTemp < 40 ? 'ON (Calentando)' : 'OFF (Régimen)';
      }

      const fullPid = s.pidHex === 'ATRV' || s.pidHex.includes('_') || s.pidHex.startsWith('APP')
        ? s.pidHex
        : `01 ${s.pidHex}`;
      const isPinned = this.pinnedPids.has(s.pidHex) || this.pinnedPids.has(fullPid);

      const health = evaluateSensorHealth(s.pidHex, numVal, valStr, {
        isEngineRunning: this.currentTelemetry.isEngineRunning,
        batteryVoltage: this.currentTelemetry.batteryVoltage,
        coolantTemp: this.currentTelemetry.coolantTemp,
        speed: this.currentTelemetry.speed,
        fuelType: this.currentTelemetry.fuelTypeDetected
      });

      return {
        pid: fullPid,
        name: s.name,
        description: s.description,
        category: s.category,
        isSupported: isSupp,
        isActive,
        isPinned,
        currentValue: valStr,
        unit: s.unit,
        numericValue: numVal,
        healthStatus: health.status,
        healthLabel: health.statusLabel,
        healthDescription: health.simpleExplanation,
        idealRange: health.idealRangeText
      };
    });

    this.currentTelemetry.supportedSensorsList = list;
    this.currentTelemetry.supportedSensorsCount = list.filter(item => item.isSupported).length;
    this.currentTelemetry.activeSensorsCount = list.filter(item => item.isActive).length;
    this.currentTelemetry.pinnedSensorPids = Array.from(this.pinnedPids);
  }

  public getSupportedSensorsList(): ECUSensorInfo[] {
    return this.currentTelemetry.supportedSensorsList || [];
  }

  public clearManualFuelLevel() {
    this.currentTelemetry.fuelLevelPercent = null;
    this.currentTelemetry.fuelLevelSensorStatus = 'unsupported_by_ecu';
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('obd_manual_fuel_level');
      } catch (_) {}
    }
    this.appendLog('system', 'Calibración manual de combustible eliminada. Reanudando lectura de sensor ECU.');
    this.recalculateDerivedTelemetry();
    this.notify();
  }

  /**
   * Real Hardware Connection via Web Bluetooth API (ELM327 BLE)
   */
  public async connectRealBluetooth(): Promise<{ success: boolean; message: string }> {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      return {
        success: false,
        message: 'Tu navegador actual no tiene soporte de Web Bluetooth (usá Google Chrome o Microsoft Edge).'
      };
    }

    try {
      this.stopSimulation();
      this.currentTelemetry.connectionState = 'connecting';
      this.resetTelemetryToZero();
      this.notify();
      this.appendLog('system', 'Buscando dispositivo Bluetooth ELM327 / OBDII...');

      // Expanded BLE UART service UUIDs found in ELM327 clones, Vgate, Viecar, Veepeak, OBDLink
      const obdServiceUuids = [
        '0000fff0-0000-1000-8000-00805f9b34fb', // Standard Chinese ELM327 BLE
        '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 UART BLE
        '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service (Veepeak, Viecar, etc.)
        '000018f0-0000-1000-8000-00805f9b34fb',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Vgate iCar Pro
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // IS1678 UART
        '0000fee7-0000-1000-8000-00805f9b34fb'
      ];

      let device: any;
      try {
        device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { namePrefix: 'OBD' },
            { namePrefix: 'ELM' },
            { namePrefix: 'V-LINK' },
            { namePrefix: 'Viecar' },
            { namePrefix: 'Konnwei' },
            { namePrefix: 'Auto' },
            { namePrefix: 'Vgate' },
            { namePrefix: 'Veepeak' },
            { namePrefix: 'iOS-Vlink' },
            { namePrefix: 'Android-Vlink' }
          ],
          optionalServices: obdServiceUuids
        });
      } catch (err) {
        // Fallback: accept all devices if custom named
        device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: obdServiceUuids
        });
      }

      this.bluetoothDevice = device;
      this.appendLog('system', `Dispositivo seleccionado: ${device.name || 'Dispositivo Bluetooth'}`);

      // Auto-reconnection handler
      device.addEventListener('gattserverdisconnected', () => {
        this.appendLog('system', 'Conexión Bluetooth perdida con el adaptador.');
        this.disconnect();
      });

      const server = await device.gatt.connect();
      this.gattServer = server;
      this.appendLog('system', 'GATT conectado. Descubriendo servicio serie...');

      // Search for primary service
      let service: any = null;
      for (const uuid of obdServiceUuids) {
        try {
          service = await server.getPrimaryService(uuid);
          if (service) {
            this.appendLog('system', `Servicio OBD encontrado: ${uuid.substring(0, 8)}...`);
            break;
          }
        } catch (_) {
          // Continue searching
        }
      }

      if (!service) {
        // Try getting all primary services if specific UUID didn't hit
        try {
          const services = await server.getPrimaryServices();
          if (services.length > 0) {
            service = services[0];
            this.appendLog('system', `Usando servicio primario: ${service.uuid.substring(0, 8)}...`);
          }
        } catch (_) {}
      }

      if (!service) {
        throw new Error('No se encontró el servicio UART de diagnóstico en el adaptador.');
      }

      // Find RX (notify/indicate) and TX (write) characteristics
      const characteristics = await service.getCharacteristics();
      this.appendLog('system', `Características encontradas: ${characteristics.length}`);

      this.rxCharacteristic = null;
      this.txCharacteristic = null;

      for (const char of characteristics) {
        const props = char.properties;
        if ((props.notify || props.indicate) && !this.rxCharacteristic) {
          this.rxCharacteristic = char;
        }
        if ((props.write || props.writeWithoutResponse) && !this.txCharacteristic) {
          this.txCharacteristic = char;
        }
      }

      // If single characteristic handles both (common in HM-10 UART BLE)
      if (!this.txCharacteristic && this.rxCharacteristic) {
        const props = this.rxCharacteristic.properties;
        if (props.write || props.writeWithoutResponse) {
          this.txCharacteristic = this.rxCharacteristic;
        }
      }
      if (!this.rxCharacteristic && this.txCharacteristic) {
        const props = this.txCharacteristic.properties;
        if (props.notify || props.indicate) {
          this.rxCharacteristic = this.txCharacteristic;
        }
      }

      // Final fallback if array available
      if (!this.txCharacteristic && characteristics.length > 0) {
        this.txCharacteristic = characteristics[0];
      }
      if (!this.rxCharacteristic && characteristics.length > 0) {
        this.rxCharacteristic = characteristics[0];
      }

      if (!this.rxCharacteristic || !this.txCharacteristic) {
        throw new Error('No se pudieron configurar los canales de lectura y escritura del adaptador.');
      }

      // Start notifications on RX characteristic
      const rxProps = this.rxCharacteristic.properties;
      if (rxProps.notify || rxProps.indicate) {
        await this.rxCharacteristic.startNotifications();
        this.rxCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const value = event.target.value;
          const decoder = new TextDecoder('utf-8');
          const str = decoder.decode(value);
          this.handleIncomingRawChunk(str);
        });
        this.appendLog('system', 'Canal de recepción (RX) activado exitosamente.');
      }

      this.currentTelemetry.connectionState = 'connected';
      this.notify();

      // Handshake with ELM327 and negotiate with vehicle ECU
      await this.initELM327Protocol();

      // Start real OBD polling loop
      this.startRealOBDPollLoop();

      return { success: true, message: `Conectado exitosamente a ${device.name || 'ELM327'}` };
    } catch (err: any) {
      console.warn('Bluetooth connection error:', err);
      this.currentTelemetry.connectionState = 'disconnected';
      this.notify();
      this.appendLog('system', `Error al conectar por Bluetooth: ${err.message}`);
      return {
        success: false,
        message: err.message || 'No se pudo vincular con el adaptador ELM327.'
      };
    }
  }

  /**
   * Real Hardware Connection via Web Serial API (for Notebook/PC COM Port)
   */
  public async connectRealSerial(): Promise<{ success: boolean; message: string }> {
    if (typeof navigator === 'undefined' || !(navigator as any).serial) {
      return {
        success: false,
        message: 'Tu navegador no soporta Web Serial (requiere Google Chrome o Microsoft Edge en PC/Notebook).'
      };
    }

    try {
      this.stopSimulation();
      this.currentTelemetry.connectionState = 'connecting';
      this.resetTelemetryToZero();
      this.notify();
      this.appendLog('system', 'Solicitando puerto serie / COM virtual Bluetooth en PC/Notebook...');

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 38400 });
      this.serialPort = port;
      this.serialWriter = port.writable.getWriter();

      this.currentTelemetry.connectionState = 'connected';
      this.notify();
      this.appendLog('system', 'Puerto serie COM conectado a 38400 baudios.');

      // Start background serial reader
      this.startSerialReaderLoop();

      // Initialize AT commands
      await this.initELM327Protocol();

      // Start real polling loop
      this.startRealOBDPollLoop();

      return { success: true, message: 'Conectado exitosamente por Puerto Serie / COM' };
    } catch (err: any) {
      console.warn('Serial connection error:', err);
      this.currentTelemetry.connectionState = 'disconnected';
      this.notify();
      this.appendLog('system', `Error en puerto serie: ${err.message}`);
      return {
        success: false,
        message: err.message || 'No se pudo abrir el puerto serie.'
      };
    }
  }

  private async startSerialReaderLoop() {
    if (!this.serialPort || this.isSerialReading) return;
    this.isSerialReading = true;

    try {
      while (this.serialPort && this.serialPort.readable) {
        this.serialReader = this.serialPort.readable.getReader();
        try {
          while (true) {
            const { value, done } = await this.serialReader.read();
            if (done) break;
            if (value) {
              const decoder = new TextDecoder('utf-8');
              const text = decoder.decode(value);
              this.handleIncomingRawChunk(text);
            }
          }
        } catch (readErr) {
          console.warn('Serial read error:', readErr);
        } finally {
          this.serialReader.releaseLock();
        }
      }
    } catch (err) {
      console.warn('Serial reader loop terminated:', err);
    } finally {
      this.isSerialReading = false;
    }
  }

  /**
   * Continuous stream processing and Live SAE J1979 packet sniffer.
   * Prevents desynchronization: whenever valid PID data (like 41 0C) arrives in ANY packet,
   * it updates RPM and telemetry in real time immediately!
   */
  private handleIncomingRawChunk(chunk: string) {
    this.rxBuffer += chunk;

    // 1. LIVE PACKET SNIFFER (Instant response even if packets arrive fragmented)
    this.sniffLivePackets(this.rxBuffer);

    // 2. Command completion signal ('>' prompt from ELM327)
    if (this.rxBuffer.includes('>')) {
      const parts = this.rxBuffer.split('>');
      const fullResponse = parts[0].trim();
      // Keep any remaining bytes in buffer
      this.rxBuffer = parts.slice(1).join('>');

      if (this.rxResolver) {
        const resolver = this.rxResolver;
        this.rxResolver = null;
        resolver(fullResponse);
      }
    }
  }

  /**
   * Sniffs SAE J1979 OBD-II standard responses on-the-fly from incoming text buffer
   */
  private sniffLivePackets(raw: string) {
    const clean = raw.replace(/\s+/g, '').toUpperCase();

    // Check for vehicle status keywords
    if (clean.includes('NODATA') || raw.includes('NO DATA')) {
      this.currentTelemetry.ecuStatus = 'no_data';
      this.currentTelemetry.lastRawResponse = 'NO DATA (ECU sin respuesta)';
    } else if (clean.includes('UNABLETOCONNECT') || raw.includes('UNABLE TO CONNECT')) {
      this.currentTelemetry.ecuStatus = 'error';
      this.currentTelemetry.lastRawResponse = 'UNABLE TO CONNECT (Sin comunicación)';
    } else if (clean.includes('SEARCHING')) {
      this.currentTelemetry.ecuStatus = 'searching';
      this.currentTelemetry.lastRawResponse = 'Buscando protocolo de ECU...';
    }

    // RPM Sniffer (Mode 01 PID 0C) -> "41 0C xx xx"
    const rpmIdx = clean.indexOf('410C');
    if (rpmIdx !== -1 && clean.length >= rpmIdx + 8) {
      const hexA = clean.substring(rpmIdx + 4, rpmIdx + 6);
      const hexB = clean.substring(rpmIdx + 6, rpmIdx + 8);
      const a = parseInt(hexA, 16);
      const b = parseInt(hexB, 16);
      if (!isNaN(a) && !isNaN(b)) {
        const rpm = Math.round(((a * 256) + b) / 4);
        this.currentTelemetry.rpm = rpm;
        this.currentTelemetry.isEngineRunning = rpm > 350;
        this.currentTelemetry.ecuStatus = 'connected';
        this.currentTelemetry.lastRawResponse = `41 0C ${hexA} ${hexB} (${rpm} RPM)`;
        this.notify();
      }
    }

    // Speed Sniffer (Mode 01 PID 0D) -> "41 0D xx"
    const speedIdx = clean.indexOf('410D');
    if (speedIdx !== -1 && clean.length >= speedIdx + 6) {
      const hexA = clean.substring(speedIdx + 4, speedIdx + 6);
      const speed = parseInt(hexA, 16);
      if (!isNaN(speed)) {
        this.currentTelemetry.speed = speed;
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // Coolant Temp (Mode 01 PID 05) -> "41 05 xx" -> (A - 40)
    const tempIdx = clean.indexOf('4105');
    if (tempIdx !== -1 && clean.length >= tempIdx + 6) {
      const hexA = clean.substring(tempIdx + 4, tempIdx + 6);
      const val = parseInt(hexA, 16);
      if (!isNaN(val)) {
        this.currentTelemetry.coolantTemp = val - 40;
      }
    }

    // Engine Load (Mode 01 PID 04) -> "41 04 xx" -> (A / 2.55)
    const loadIdx = clean.indexOf('4104');
    if (loadIdx !== -1 && clean.length >= loadIdx + 6) {
      const hexA = clean.substring(loadIdx + 4, loadIdx + 6);
      const val = parseInt(hexA, 16);
      if (!isNaN(val)) {
        this.currentTelemetry.engineLoad = Math.round((val / 2.55) * 10) / 10;
      }
    }

    // Throttle Pos (Mode 01 PID 11) -> "41 11 xx" -> (A / 2.55)
    const throttleIdx = clean.indexOf('4111');
    if (throttleIdx !== -1 && clean.length >= throttleIdx + 6) {
      const hexA = clean.substring(throttleIdx + 4, throttleIdx + 6);
      const val = parseInt(hexA, 16);
      if (!isNaN(val)) {
        this.currentTelemetry.throttlePos = Math.round((val / 2.55) * 10) / 10;
      }
    }

    // MAP Intake Pressure (Mode 01 PID 0B) -> "41 0B xx" -> A kPa
    const mapIdx = clean.indexOf('410B');
    if (mapIdx !== -1 && clean.length >= mapIdx + 6) {
      const hexA = clean.substring(mapIdx + 4, mapIdx + 6);
      const val = parseInt(hexA, 16);
      if (!isNaN(val)) {
        this.currentTelemetry.intakePressureMap = val;
      }
    }

    // Intake Air Temp (Mode 01 PID 0F) -> "41 0F xx" -> (A - 40)
    const iatIdx = clean.indexOf('410F');
    if (iatIdx !== -1 && clean.length >= iatIdx + 6) {
      const hexA = clean.substring(iatIdx + 4, iatIdx + 6);
      const val = parseInt(hexA, 16);
      if (!isNaN(val)) {
        this.currentTelemetry.intakeAirTemp = val - 40;
      }
    }

    // MAF Air Flow Rate (Mode 01 PID 10) -> "41 10 xx xx" -> ((A*256)+B)/100 g/s
    const mafIdx = clean.indexOf('4110');
    if (mafIdx !== -1 && clean.length >= mafIdx + 8) {
      const a = parseInt(clean.substring(mafIdx + 4, mafIdx + 6), 16);
      const b = parseInt(clean.substring(mafIdx + 6, mafIdx + 8), 16);
      if (!isNaN(a) && !isNaN(b)) {
        this.currentTelemetry.mafRate = Math.round((((a * 256) + b) / 100) * 10) / 10;
      }
    }

    // Fuel Tank Level (Mode 01 PID 2F) -> "41 2F xx" -> (A / 2.55)%
    const fuelIdx = clean.indexOf('412F');
    if (fuelIdx !== -1 && clean.length >= fuelIdx + 6) {
      const hexA = clean.substring(fuelIdx + 4, fuelIdx + 6);
      const val = parseInt(hexA, 16);
      if (!isNaN(val)) {
        this.currentTelemetry.fuelLevelPercent = Math.round(val / 2.55);
      }
    }

    // Timing Advance (Mode 01 PID 0E) -> "41 0E xx" -> (A / 2) - 64
    const timingIdx = clean.indexOf('410E');
    if (timingIdx !== -1 && clean.length >= timingIdx + 6) {
      const hexA = clean.substring(timingIdx + 4, timingIdx + 6);
      const val = parseInt(hexA, 16);
      if (!isNaN(val)) {
        this.currentTelemetry.timingAdvance = Math.round((val / 2) - 64);
      }
    }

    // Battery Voltage (ATRV response e.g. "14.2V" or "12.6V")
    const voltMatch = raw.match(/(\d+\.?\d*)\s*V/i);
    if (voltMatch && voltMatch[1]) {
      const volts = parseFloat(voltMatch[1]);
      if (!isNaN(volts) && volts > 6 && volts < 20) {
        this.currentTelemetry.batteryVoltage = volts;
      }
    }
  }

  /**
   * Initializes the ELM327 chip and locks protocol with the vehicle's ECU
   */
  private async initELM327Protocol() {
    this.appendLog('system', 'Configurando chip ELM327 (ATZ, ATE0, ATS0, ATH0, ATSP0)...');
    await this.sendATCommand('ATZ', 1000);   // Reset chip
    await this.delay(400);
    await this.sendATCommand('ATE0', 1000);  // Echo off
    await this.delay(100);
    await this.sendATCommand('ATL0', 1000);  // Linefeed off
    await this.delay(100);
    await this.sendATCommand('ATS0', 1000);  // Spaces off
    await this.delay(100);
    await this.sendATCommand('ATH0', 1000);  // Headers off
    await this.delay(100);
    await this.sendATCommand('ATAT2', 1000); // Adaptive timing auto 2
    await this.delay(100);
    await this.sendATCommand('ATSP0', 1000); // Protocol search auto
    await this.delay(200);

    // Initial check: Read battery voltage
    const voltResp = await this.sendATCommand('ATRV', 1500);
    this.parseBatteryVoltage(voltResp);

    // CRITICAL: Send 0100 with 8-second timeout to negotiate and lock ECU protocol
    this.appendLog('system', 'Negociando con la computadora del vehículo (0100)...');
    this.currentTelemetry.ecuStatus = 'searching';
    this.notify();

    const ecuResp = await this.sendATCommand('0100', 8000);
    const cleanEcu = ecuResp.replace(/\s+/g, '').toUpperCase();

    if (cleanEcu.includes('4100')) {
      this.currentTelemetry.ecuStatus = 'connected';
      this.appendLog('system', '¡Computadora (ECU) del auto respondió con éxito!');

      // Read human-readable protocol description (ATDP)
      const protoResp = await this.sendATCommand('ATDP', 2000);
      if (protoResp && !protoResp.includes('ERROR')) {
        this.currentTelemetry.ecuProtocolDetected = protoResp.trim();
        this.appendLog('system', `Protocolo detectado: ${protoResp.trim()}`);
      }

      // Parse Supported PIDs bitmask (Mode 01 PID 00)
      this.parseSupportedPidsFromResponse('0100', cleanEcu);

      // If bit 32 (PID 20) is supported, query 01 20 to discover PIDs 21-40
      if (this.supportedPidsSet.has('20')) {
        this.appendLog('system', 'Consultando sensores rango 21-40 (01 20)...');
        const resp20 = await this.sendATCommand('01 20', 2500);
        const clean20 = resp20.replace(/\s+/g, '').toUpperCase();
        this.parseSupportedPidsFromResponse('0120', clean20);
      }

      // Check specifically if PID 2F (Fuel Level) is supported by the ECU
      if (!this.supportedPidsSet.has('2F')) {
        if (this.currentTelemetry.fuelLevelSensorStatus !== 'manual_calibrated') {
          this.currentTelemetry.fuelLevelSensorStatus = 'unsupported_by_ecu';
          this.currentTelemetry.fuelLevelPercent = null;
        }
        this.appendLog('system', 'ℹ️ Nivel de Combustible (01 2F): NO DATA (No reportado por ECU en este vehículo). Flotante analógico al tablero.');
      }

      this.updateSensorsTelemetry();
      this.appendLog('system', `📊 Sensores detectados en la ECU: ${this.currentTelemetry.supportedSensorsCount} compatibles.`);
    } else if (cleanEcu.includes('NODATA') || ecuResp.includes('NO DATA')) {
      this.currentTelemetry.ecuStatus = 'no_data';
      this.appendLog('system', 'Aviso: La ECU respondió NO DATA. (Verificá llave en CONTACTO o motor encendido).');
    } else {
      this.currentTelemetry.ecuStatus = 'error';
      this.appendLog('system', `Respuesta ECU: ${ecuResp || 'Sin respuesta'}. Probá forzar protocolo KWP2000.`);
    }

    this.notify();
  }

  /**
   * Allows manually forcing a specific OBD-II protocol
   * Useful for Nissan Frontier / Diesel Mercosur (ATSP5 = KWP2000 Fast Init, ATSP4 = KWP 5-baud, ATSP6 = CAN)
   */
  public async setProtocol(protoCmd: string): Promise<string> {
    this.appendLog('system', `Cambiando protocolo de comunicación a ${protoCmd}...`);
    this.currentTelemetry.ecuStatus = 'searching';
    this.resetSensorFailures();
    this.notify();

    // Send AT protocol command
    await this.sendATCommand(protoCmd, 1500);
    await this.delay(200);

    // Test communication with Mode 01 PID 00
    this.appendLog('system', `Verificando enlace con ECU bajo ${protoCmd} (0100)...`);
    const resp = await this.sendATCommand('0100', 7000);
    const clean = resp.replace(/\s+/g, '').toUpperCase();

    if (clean.includes('4100')) {
      this.currentTelemetry.ecuStatus = 'connected';
      const dp = await this.sendATCommand('ATDP', 2000);
      this.currentTelemetry.ecuProtocolDetected = dp.trim();
      this.appendLog('system', `¡Enlace exitoso con ECU bajo ${protoCmd}! Protocolo: ${dp.trim()}`);

      this.parseSupportedPidsFromResponse('0100', clean);
      if (this.supportedPidsSet.has('20')) {
        const resp20 = await this.sendATCommand('01 20', 2500);
        this.parseSupportedPidsFromResponse('0120', resp20.replace(/\s+/g, '').toUpperCase());
      }
      if (!this.supportedPidsSet.has('2F') && this.currentTelemetry.fuelLevelSensorStatus !== 'manual_calibrated') {
        this.currentTelemetry.fuelLevelSensorStatus = 'unsupported_by_ecu';
        this.currentTelemetry.fuelLevelPercent = null;
      }
      this.updateSensorsTelemetry();
      this.appendLog('system', `📊 Sensores detectados en la ECU: ${this.currentTelemetry.supportedSensorsCount} compatibles.`);
    } else {
      this.currentTelemetry.ecuStatus = 'no_data';
      this.appendLog('system', `ECU no respondió en ${protoCmd}: ${resp}`);
    }

    this.ensurePollingActive();
    this.notify();
    return resp;
  }

  /**
   * Low-level command send to physical hardware or simulator
   */
  public getPollMode(): 'rpm_only' | 'all' {
    return this.pollMode;
  }

  public setPollMode(mode: 'rpm_only' | 'all') {
    this.pollMode = mode;
    this.resetSensorFailures();
    this.appendLog('system', `Modo de lectura: ${mode === 'rpm_only' ? 'Solo RPM (Máxima velocidad)' : 'Todos los sensores (Continuo)'}`);
  }

  public isAutoPolling(): boolean {
    return this.isPollingActive && !this.autoPollPaused;
  }

  public setAutoPollPaused(paused: boolean) {
    this.autoPollPaused = paused;
    this.currentTelemetry.isAutoPolling = !paused;
    this.appendLog('system', paused ? 'Lectura continua automática en pausa.' : 'Lectura continua automática reanudada.');
    this.notify();
    if (!paused && !this.isPollingActive && this.currentTelemetry.connectionState === 'connected') {
      this.startRealOBDPollLoop();
    }
  }

  public toggleAutoPolling(): boolean {
    const willPause = !this.autoPollPaused;
    this.setAutoPollPaused(willPause);
    return !willPause;
  }

  public resetSensorFailures() {
    this.pidFailCounts = {};
    this.nextSecondaryIdx = 0;
  }

  public getAutoPollCount(): number {
    return this.autoPollCount;
  }

  /**
   * Sets manual / calibrated fuel tank level percentage (persists in localStorage)
   * Essential for pre-2008 vehicles like Nissan Frontier where the fuel float
   * connects directly to the dashboard needle and the ECU returns NO DATA on PID 01 2F.
   */
  public setFuelLevelPercent(percent: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    this.currentTelemetry.fuelLevelPercent = clamped;
    this.currentTelemetry.fuelLevelSensorStatus = 'manual_calibrated';
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('obd_manual_fuel_level', clamped.toString());
      } catch (_) {}
    }
    this.appendLog('system', `Nivel de tanque calibrado a ${clamped}%`);
    this.recalculateDerivedTelemetry();
    this.notify();
  }

  public getFuelLevelPercent(): number | null {
    return this.currentTelemetry.fuelLevelPercent;
  }

  /**
   * Immediately triggers a single RPM query on demand and returns the parsed RPM
   */
  public async pollRPMNow(): Promise<number> {
    await this.sendATCommand('01 0C', 2000);
    return this.currentTelemetry.rpm;
  }

  /**
   * Ensures the polling loop is running if the device is connected
   */
  public ensurePollingActive() {
    this.autoPollPaused = false;
    this.currentTelemetry.isAutoPolling = true;
    if (this.currentTelemetry.connectionState === 'connected' && !this.isPollingActive) {
      this.startRealOBDPollLoop();
    }
  }

  /**
   * Low-level command send to physical hardware or simulator
   * Always auto-parses any returned SAE J1979 response and notifies subscribers!
   */
  public async sendATCommand(cmd: string, timeoutMs: number = 2500): Promise<string> {
    const cleanCmd = cmd.trim();
    this.appendLog('tx', cleanCmd);
    this.currentTelemetry.lastCommandSent = cleanCmd;

    let response = '';

    // If physically connected via BLE or Serial, transmit to hardware!
    if (this.currentTelemetry.connectionState === 'connected') {
      response = await this.transmitToHardware(cleanCmd, timeoutMs);
      this.currentTelemetry.lastRawResponse = response || '(sin datos)';
      this.appendLog('rx', response || '(sin datos)');
    } else {
      // If in pure simulation mode, emulate response
      response = this.simulateCommandResponse(cleanCmd);
    }

    // CRITICAL: Always parse the response of the command immediately!
    this.parseAnyOBDResponse(cleanCmd, response);
    this.notify();

    return response;
  }

  private async transmitToHardware(cmd: string, timeoutMs: number): Promise<string> {
    let waitCount = 0;
    while (this.isBusySending && waitCount < 30) {
      await this.delay(35);
      waitCount++;
    }
    this.isBusySending = true;

    try {
      // Clear out stale prompt characters, but sniffer preserves any valid PIDs
      if (this.rxBuffer.includes('>')) {
        this.rxBuffer = '';
      }

      // Prepare promise waiting for '>' prompt character from ELM327
      const responsePromise = new Promise<string>((resolve) => {
        this.rxResolver = resolve;
        setTimeout(() => {
          if (this.rxResolver) {
            const res = this.rxBuffer.trim();
            this.rxResolver = null;
            resolve(res || 'TIMEOUT');
          }
        }, timeoutMs);
      });

      const payload = new TextEncoder().encode(cmd + '\r');

      // 1. Transmit via BLE (prefer writeWithoutResponse for fast clones)
      if (this.txCharacteristic) {
        if (this.txCharacteristic.properties.writeWithoutResponse) {
          await this.txCharacteristic.writeValueWithoutResponse(payload);
        } else if (this.txCharacteristic.properties.write) {
          await this.txCharacteristic.writeValueWithResponse(payload);
        }
      }
      // 2. Transmit via Web Serial (Notebook COM port)
      else if (this.serialWriter) {
        await this.serialWriter.write(payload);
      } else {
        return 'ERR_NO_CHANNEL';
      }

      const rawResponse = await responsePromise;
      return this.cleanELMResponse(rawResponse);
    } catch (err: any) {
      console.warn('Hardware transmission error:', err);
      return `ERR: ${err.message}`;
    } finally {
      this.isBusySending = false;
    }
  }

  private cleanELMResponse(raw: string): string {
    return raw
      .replace(/\r/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Continuous Real-time OBD Polling Loop (Queries real vehicle ECU sensors repeatedly)
   * Runs 100% automatically in the background without needing any clicks from the user!
   */
  private async startRealOBDPollLoop() {
    if (this.isPollingActive) return;
    this.isPollingActive = true;
    this.currentTelemetry.isAutoPolling = true;
    this.autoPollPaused = false;
    let cycle = 0;

    this.appendLog('system', '🔄 Lectura continua automática iniciada (Streaming de todos los sensores).');

    while (this.currentTelemetry.connectionState === 'connected' && this.isPollingActive) {
      if (this.autoPollPaused) {
        await this.delay(250);
        continue;
      }

      cycle++;
      this.autoPollCount++;
      this.currentTelemetry.autoPollCount = this.autoPollCount;
      this.currentTelemetry.isAutoPolling = true;

      try {
        // PASO 1: SIEMPRE CONSULTAR RPM (01 0C) para respuesta inmediata del tacómetro
        await this.sendATCommand('01 0C', 1600);

        if (this.pollMode === 'all') {
          // PASO 2: INTERCALAR SENSORES SECUNDARIOS EN ROUND-ROBIN
          await this.delay(50);

          // Cada 12 ciclos le damos una nueva oportunidad a cualquier sensor que haya respondido NO DATA
          if (cycle % 12 === 0) {
            this.pidFailCounts = {};
          }

          // Seleccionar próximo sensor secundario de la lista
          const sensor = this.secondaryPids[this.nextSecondaryIdx % this.secondaryPids.length];
          this.nextSecondaryIdx++;

          const failCount = this.pidFailCounts[sensor.pid] || 0;
          if (failCount < 5) {
            const resp = await this.sendATCommand(sensor.pid, sensor.timeout);
            if (resp.includes('NO DATA') || resp.includes('NODATA') || resp === 'TIMEOUT') {
              this.pidFailCounts[sensor.pid] = failCount + 1;
              if (sensor.pid === '01 2F') {
                if (this.currentTelemetry.fuelLevelSensorStatus !== 'manual_calibrated') {
                  this.currentTelemetry.fuelLevelSensorStatus = 'unsupported_by_ecu';
                  this.currentTelemetry.fuelLevelPercent = null;
                }
              }
            } else if (resp.includes('41') || resp.includes('V')) {
              this.pidFailCounts[sensor.pid] = 0;
            }
          }

          await this.delay(50);
        } else {
          // Modo solo RPM: cada 8 ciclos refrescar voltaje de batería
          if (cycle % 8 === 0) {
            await this.delay(40);
            await this.sendATCommand('ATRV', 1200);
          }
          await this.delay(60);
        }

        this.recalculateDerivedTelemetry();
        this.currentTelemetry.lastUpdated = new Date().toISOString();
        this.notify();
      } catch (pollErr) {
        console.warn('OBD continuous poll error:', pollErr);
        await this.delay(200);
      }
    }

    this.isPollingActive = false;
    this.currentTelemetry.isAutoPolling = false;
    this.notify();
  }

  // =========================================================================
  // REAL OBD-II / SAE J1979 ROBUST RESPONSE DECODER (REGEX-BASED)
  // =========================================================================

  public parseAnyOBDResponse(cmd: string, raw: string) {
    if (!raw || raw === 'TIMEOUT' || raw.includes('ERR')) return;

    if (raw.includes('NO DATA') || raw.includes('NODATA')) {
      if ((cmd.includes('2F') || cmd.includes('2f')) && this.currentTelemetry.fuelLevelSensorStatus !== 'manual_calibrated') {
        this.currentTelemetry.fuelLevelSensorStatus = 'unsupported_by_ecu';
        this.currentTelemetry.fuelLevelPercent = null;
      }
      return;
    }
    if (raw.includes('UNABLE TO CONNECT') || raw.includes('UNABLETOCONNECT')) {
      this.currentTelemetry.ecuStatus = 'error';
      return;
    }

    // 1. RPM (Mode 01 PID 0C) -> "41 0C A B"
    const rpmMatch = raw.match(/(?:41\s*0C|410C)\s*([0-9A-Fa-f]{2})\s*([0-9A-Fa-f]{2})/);
    if (rpmMatch) {
      const a = parseInt(rpmMatch[1], 16);
      const b = parseInt(rpmMatch[2], 16);
      if (!isNaN(a) && !isNaN(b)) {
        const rpm = Math.round(((a * 256) + b) / 4);
        this.currentTelemetry.rpm = rpm;
        this.currentTelemetry.isEngineRunning = rpm > 350;
        this.currentTelemetry.ecuStatus = 'connected';
        this.currentTelemetry.lastRawResponse = `41 0C ${rpmMatch[1]} ${rpmMatch[2]} (${rpm} RPM)`;
      }
    }

    // 2. Speed (Mode 01 PID 0D) -> "41 0D A"
    const speedMatch = raw.match(/(?:41\s*0D|410D)\s*([0-9A-Fa-f]{2})/);
    if (speedMatch) {
      const speed = parseInt(speedMatch[1], 16);
      if (!isNaN(speed)) {
        this.currentTelemetry.speed = speed;
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 3. Coolant Temp (Mode 01 PID 05) -> (A - 40)
    const tempMatch = raw.match(/(?:41\s*05|4105)\s*([0-9A-Fa-f]{2})/);
    if (tempMatch) {
      const val = parseInt(tempMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.coolantTemp = val - 40;
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 4. Engine Load (Mode 01 PID 04) -> (A / 2.55)
    const loadMatch = raw.match(/(?:41\s*04|4104)\s*([0-9A-Fa-f]{2})/);
    if (loadMatch) {
      const val = parseInt(loadMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.engineLoad = Math.round((val / 2.55) * 10) / 10;
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 5. Throttle Position (Mode 01 PID 11) -> (A / 2.55)
    const throttleMatch = raw.match(/(?:41\s*11|4111)\s*([0-9A-Fa-f]{2})/);
    if (throttleMatch) {
      const val = parseInt(throttleMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.throttlePos = Math.round((val / 2.55) * 10) / 10;
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 6. Intake Air Temp (Mode 01 PID 0F) -> (A - 40)
    const iatMatch = raw.match(/(?:41\s*0F|410F)\s*([0-9A-Fa-f]{2})/);
    if (iatMatch) {
      const val = parseInt(iatMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.intakeAirTemp = val - 40;
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 7. MAP Intake Manifold Pressure (Mode 01 PID 0B) -> A kPa
    const mapMatch = raw.match(/(?:41\s*0B|410B)\s*([0-9A-Fa-f]{2})/);
    if (mapMatch) {
      const val = parseInt(mapMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.intakePressureMap = val;
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 8. MAF Air Flow Rate (Mode 01 PID 10) -> ((A*256)+B)/100 g/s
    const mafMatch = raw.match(/(?:41\s*10|4110)\s*([0-9A-Fa-f]{2})\s*([0-9A-Fa-f]{2})/);
    if (mafMatch) {
      const a = parseInt(mafMatch[1], 16);
      const b = parseInt(mafMatch[2], 16);
      if (!isNaN(a) && !isNaN(b)) {
        this.currentTelemetry.mafRate = Math.round((((a * 256) + b) / 100) * 10) / 10;
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 9. Fuel Tank Level (Mode 01 PID 2F) -> (A / 2.55) %
    const fuelMatch = raw.match(/(?:41\s*2F|412F)\s*([0-9A-Fa-f]{2})/);
    if (fuelMatch) {
      const val = parseInt(fuelMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.fuelLevelPercent = Math.round(val / 2.55);
        this.currentTelemetry.fuelLevelSensorStatus = 'hardware_ecu';
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 10. Timing Advance (Mode 01 PID 0E) -> (A / 2) - 64 degrees
    const timingMatch = raw.match(/(?:41\s*0E|410E)\s*([0-9A-Fa-f]{2})/);
    if (timingMatch) {
      const val = parseInt(timingMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.timingAdvance = Math.round((val / 2) - 64);
        this.currentTelemetry.ecuStatus = 'connected';
      }
    }

    // 11. Battery Voltage: "ATRV" -> "14.2V"
    const voltMatch = raw.match(/(\d+\.?\d*)\s*V/i);
    if (voltMatch) {
      const volts = parseFloat(voltMatch[1]);
      if (!isNaN(volts) && volts > 6 && volts < 20) {
        this.currentTelemetry.batteryVoltage = volts;
      }
    }

    // 12. Short Term Fuel Trim (Mode 01 PID 06) -> ((A - 128) * 100 / 128)%
    const stftMatch = raw.match(/(?:41\s*06|4106)\s*([0-9A-Fa-f]{2})/);
    if (stftMatch) {
      const val = parseInt(stftMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.shortTermFuelTrim = Math.round(((val - 128) * 100 / 128) * 10) / 10;
      }
    }

    // 13. Long Term Fuel Trim (Mode 01 PID 07) -> ((A - 128) * 100 / 128)%
    const ltftMatch = raw.match(/(?:41\s*07|4107)\s*([0-9A-Fa-f]{2})/);
    if (ltftMatch) {
      const val = parseInt(ltftMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.longTermFuelTrim = Math.round(((val - 128) * 100 / 128) * 10) / 10;
      }
    }

    // 14. Engine Oil Temperature (Mode 01 PID 5C) -> (A - 40) °C
    const oilTempMatch = raw.match(/(?:41\s*5C|415C)\s*([0-9A-Fa-f]{2})/);
    if (oilTempMatch) {
      const val = parseInt(oilTempMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.oilTemp = val - 40;
      }
    }

    // 15. Ambient Air Temperature (Mode 01 PID 46) -> (A - 40) °C
    const ambMatch = raw.match(/(?:41\s*46|4146)\s*([0-9A-Fa-f]{2})/);
    if (ambMatch) {
      const val = parseInt(ambMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.ambientTemp = val - 40;
      }
    }

    // 16. Fuel Pressure (Mode 01 PID 0A) -> A * 3 kPa
    const fuelPressMatch = raw.match(/(?:41\s*0A|410A)\s*([0-9A-Fa-f]{2})/);
    if (fuelPressMatch) {
      const val = parseInt(fuelPressMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.fuelPressureKpa = val * 3;
      }
    }

    // 17. Engine Run Time (Mode 01 PID 1F) -> (A*256)+B sec
    const runTimeMatch = raw.match(/(?:41\s*1F|411F)\s*([0-9A-Fa-f]{2})\s*([0-9A-Fa-f]{2})/);
    if (runTimeMatch) {
      const a = parseInt(runTimeMatch[1], 16);
      const b = parseInt(runTimeMatch[2], 16);
      if (!isNaN(a) && !isNaN(b)) {
        this.currentTelemetry.engineRunTimeSec = (a * 256) + b;
      }
    }

    // 18. Barometric Pressure (Mode 01 PID 33) -> A kPa
    const baroMatch = raw.match(/(?:41\s*33|4133)\s*([0-9A-Fa-f]{2})/);
    if (baroMatch) {
      const val = parseInt(baroMatch[1], 16);
      if (!isNaN(val)) {
        this.currentTelemetry.barometricPressureKpa = val;
      }
    }

    // 19. Control Module Voltage (Mode 01 PID 42) -> ((A*256)+B)/1000 V
    const ecuVoltMatch = raw.match(/(?:41\s*42|4142)\s*([0-9A-Fa-f]{2})\s*([0-9A-Fa-f]{2})/);
    if (ecuVoltMatch) {
      const a = parseInt(ecuVoltMatch[1], 16);
      const b = parseInt(ecuVoltMatch[2], 16);
      if (!isNaN(a) && !isNaN(b)) {
        this.currentTelemetry.controlModuleVoltage = Math.round((((a * 256) + b) / 1000) * 10) / 10;
      }
    }

    // 20. Distance with MIL On (Mode 01 PID 21) -> (A*256)+B km
    const milDistMatch = raw.match(/(?:41\s*21|4121)\s*([0-9A-Fa-f]{2})\s*([0-9A-Fa-f]{2})/);
    if (milDistMatch) {
      const a = parseInt(milDistMatch[1], 16);
      const b = parseInt(milDistMatch[2], 16);
      if (!isNaN(a) && !isNaN(b)) {
        this.currentTelemetry.distanceWithMilKm = (a * 256) + b;
      }
    }

    // 21. Distance since Codes Cleared (Mode 01 PID 31) -> (A*256)+B km
    const clearDistMatch = raw.match(/(?:41\s*31|4131)\s*([0-9A-Fa-f]{2})\s*([0-9A-Fa-f]{2})/);
    if (clearDistMatch) {
      const a = parseInt(clearDistMatch[1], 16);
      const b = parseInt(clearDistMatch[2], 16);
      if (!isNaN(a) && !isNaN(b)) {
        this.currentTelemetry.distanceSinceDtcClearedKm = (a * 256) + b;
      }
    }

    // 22. Common Rail Diesel Pressure (Mode 01 PID 23) -> ((A*256)+B)*10 kPa
    const railMatch = raw.match(/(?:41\s*23|4123)\s*([0-9A-Fa-f]{2})\s*([0-9A-Fa-f]{2})/);
    if (railMatch) {
      const a = parseInt(railMatch[1], 16);
      const b = parseInt(railMatch[2], 16);
      if (!isNaN(a) && !isNaN(b)) {
        this.currentTelemetry.fuelRailPressureDieselKpa = ((a * 256) + b) * 10;
      }
    }

    this.recalculateDerivedTelemetry();
  }

  private recalculateDerivedTelemetry() {
    const rpm = this.currentTelemetry.rpm;
    const speed = this.currentTelemetry.speed;
    const load = this.currentTelemetry.engineLoad || 22;

    // Fuel Consumption calculation
    if (this.currentTelemetry.mafRate && this.currentTelemetry.mafRate > 0) {
      const litersPerHour = (this.currentTelemetry.mafRate * 3600) / (14.5 * 840);
      if (speed > 5) {
        this.currentTelemetry.instantConsumptionL100km = Math.round(((litersPerHour / speed) * 100) * 10) / 10;
      } else {
        this.currentTelemetry.instantConsumptionL100km = Math.round(litersPerHour * 10) / 10;
      }
    } else if (rpm > 0) {
      // Estimated for 2.8L turbo diesel engine:
      const estLitersPerHour = Math.max(0.7, (rpm / 1000) * (load / 100) * 2.8 * 0.75);
      if (speed > 5) {
        this.currentTelemetry.instantConsumptionL100km = Math.max(3.8, Math.min(24, Math.round(((estLitersPerHour / speed) * 100) * 10) / 10));
      } else {
        this.currentTelemetry.instantConsumptionL100km = Math.round(estLitersPerHour * 10) / 10;
      }
    }

    // Range calculation based on fuel level and 75L tank
    if (this.currentTelemetry.fuelLevelPercent !== null && this.currentTelemetry.fuelLevelPercent > 0) {
      const litersInTank = (this.currentTelemetry.fuelLevelPercent / 100) * 75;
      const avgCons = this.currentTelemetry.avgConsumptionL100km || 9.2;
      this.currentTelemetry.rangeKmRemaining = Math.round((litersInTank / avgCons) * 100);
    } else {
      this.currentTelemetry.rangeKmRemaining = 0;
    }
    this.updateSensorsTelemetry();
  }

  private parseRPMResponse(raw: string) {
    this.parseAnyOBDResponse('01 0C', raw);
  }

  private parseSpeedResponse(raw: string) {
    this.parseAnyOBDResponse('01 0D', raw);
  }

  private parseCoolantTempResponse(raw: string) {
    this.parseAnyOBDResponse('01 05', raw);
  }

  private parseEngineLoadResponse(raw: string) {
    this.parseAnyOBDResponse('01 04', raw);
  }

  private parseThrottleResponse(raw: string) {
    this.parseAnyOBDResponse('01 11', raw);
  }

  private parseBatteryVoltage(raw: string) {
    this.parseAnyOBDResponse('ATRV', raw);
  }

  public async readRealDTCs(): Promise<DTCFaultCode[]> {
    const raw = await this.sendATCommand('03', 4000);
    const clean = raw.replace(/\s+/g, '').toUpperCase();

    // Mode 03 response: "43 00 00" means 0 faults
    if (clean.includes('430000') || clean === '4300' || clean.includes('NODATA') || clean.includes('NO DATA')) {
      this.activeDtcs = [];
      this.currentTelemetry.activeDtcsCount = 0;
      this.notify();
      return [];
    }

    // Parse DTC codes
    const found: DTCFaultCode[] = [];
    const idx = clean.indexOf('43');
    if (idx !== -1) {
      const hexList = clean.substring(idx + 2);
      for (let i = 0; i < hexList.length - 3; i += 4) {
        const hexPair = hexList.substring(i, i + 4);
        if (hexPair === '0000') continue;
        const code = this.decodeDtcHex(hexPair);
        const knownDtc = lookupDTC(code);
        const meta: DTCFaultCode = knownDtc || {
          code,
          title: `Código de avería ${code}`,
          category: 'Inyección / Aire',
          severity: 'warning',
          description: 'Falla registrada por la ECU del vehículo.',
          symptoms: ['Aviso en memoria de diagnóstico'],
          possibleCauses: ['Sensor fuera de rango o lectura intermitente'],
          recommendedAction: 'Controlar con escáner en taller de confianza.',
          estimatedRepairCostRange: '$15.000 - $45.000',
          active: true,
          timestamp: new Date().toISOString(),
          milStatus: true
        };
        found.push(meta);
      }
    }

    this.activeDtcs = found;
    this.currentTelemetry.activeDtcsCount = found.length;
    this.notify();
    return found;
  }

  private decodeDtcHex(fourHex: string): string {
    const firstChar = fourHex[0];
    let prefix = 'P';
    if (firstChar === '0' || firstChar === '1' || firstChar === '2' || firstChar === '3') prefix = 'P';
    else if (firstChar === '4' || firstChar === '5' || firstChar === '6' || firstChar === '7') prefix = 'C';
    else if (firstChar === '8' || firstChar === '9' || firstChar === 'A' || firstChar === 'B') prefix = 'B';
    else prefix = 'U';

    return `${prefix}${fourHex.substring(1)}`;
  }

  public clearDTCs(): boolean {
    this.sendATCommand('04', 3000);
    this.activeDtcs = [];
    this.currentTelemetry.activeDtcsCount = 0;
    this.notify();
    return true;
  }

  public disconnect() {
    this.isPollingActive = false;

    if (this.gattServer && this.gattServer.connected) {
      try { this.gattServer.disconnect(); } catch (_) {}
    }
    this.gattServer = null;
    this.txCharacteristic = null;
    this.rxCharacteristic = null;

    if (this.serialWriter) {
      try { this.serialWriter.releaseLock(); } catch (_) {}
      this.serialWriter = null;
    }
    if (this.serialPort) {
      try { this.serialPort.close(); } catch (_) {}
      this.serialPort = null;
    }

    this.currentTelemetry.connectionState = 'disconnected';
    this.resetTelemetryToZero();
    this.appendLog('system', 'Desconectado del adaptador ELM327.');
    this.notify();
  }

  private resetTelemetryToZero() {
    this.currentTelemetry.speed = 0;
    this.currentTelemetry.rpm = 0;
    this.currentTelemetry.engineLoad = 0;
    this.currentTelemetry.throttlePos = 0;
    this.currentTelemetry.coolantTemp = 0;
    const savedFuel = this.getInitialFuelLevel();
    if (savedFuel !== null) {
      this.currentTelemetry.fuelLevelPercent = savedFuel;
      this.currentTelemetry.fuelLevelSensorStatus = 'manual_calibrated';
    } else {
      this.currentTelemetry.fuelLevelPercent = null;
      this.currentTelemetry.fuelLevelSensorStatus = 'unsupported_by_ecu';
    }
    this.currentTelemetry.instantConsumptionL100km = 0;
    this.currentTelemetry.avgConsumptionL100km = 0;
    this.currentTelemetry.rangeKmRemaining = 0;
    this.currentTelemetry.isEngineRunning = false;
    this.currentTelemetry.ecuStatus = undefined;
    this.currentTelemetry.ecuProtocolDetected = undefined;
    this.currentTelemetry.lastRawResponse = '';
    this.currentTelemetry.lastCommandSent = '';
    this.activeDtcs = [];
    this.currentTelemetry.activeDtcsCount = 0;
    this.supportedPidsSet.clear();
    this.updateSensorsTelemetry();
  }

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  // =========================================================================
  // SIMULATION MODE (ONLY when explicitly chosen by user)
  // =========================================================================

  public setSimulationMode(mode: SimulatorDrivingMode) {
    this.currentSimulationMode = mode;
    this.currentTelemetry.connectionState = 'simulated';
    this.currentTelemetry.ecuStatus = 'connected';
    this.currentTelemetry.ecuProtocolDetected = 'Simulador SAE J1979';
    // Provide realistic supported set
    ['01', '03', '04', '05', '06', '07', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '1C', '1F', '20', '21', '23', '31', '33', '42', '46', '5C', 'ATRV', 'FRP_V', 'APP1', 'MAF_V', 'EGR_POS', 'BRAKE_SW', 'CLUTCH_SW', 'GLOW_ST'].forEach(p => this.supportedPidsSet.add(p));
    this.updateSensorsTelemetry();
    this.appendLog('system', `Modo demostración activado: ${mode}`);
    this.startSimulationLoop();
  }

  private stopSimulation() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  private startSimulationLoop() {
    this.stopSimulation();
    let tick = 0;
    this.simulationTimer = setInterval(() => {
      if (this.currentTelemetry.connectionState !== 'simulated') {
        this.stopSimulation();
        return;
      }
      tick++;
      this.updateSimulationStep(tick);
      this.notify();
    }, 1200);
  }

  private updateSimulationStep(tick: number) {
    const noise = (Math.random() - 0.5) * 2;
    if (this.currentSimulationMode === 'ralenti') {
      this.currentTelemetry.speed = 0;
      this.currentTelemetry.rpm = 820 + noise * 15;
      this.currentTelemetry.engineLoad = 18 + noise * 2;
      this.currentTelemetry.throttlePos = 11;
      this.currentTelemetry.coolantTemp = 90;
      this.currentTelemetry.batteryVoltage = 14.1;
      this.currentTelemetry.isEngineRunning = true;
      this.currentTelemetry.intakePressureMap = 34 + Math.round(noise * 2);
      this.currentTelemetry.intakeAirTemp = 28;
      this.currentTelemetry.mafRate = 4.1 + Math.round(noise * 0.3 * 10) / 10;
      this.currentTelemetry.timingAdvance = 8 + Math.round(noise);
    } else {
      this.currentTelemetry.speed = Math.max(90, Math.min(115, 104 + noise * 4));
      this.currentTelemetry.rpm = Math.max(2100, Math.min(2500, 2320 + noise * 60));
      this.currentTelemetry.coolantTemp = 91;
      this.currentTelemetry.engineLoad = 38;
      this.currentTelemetry.throttlePos = 28;
      this.currentTelemetry.batteryVoltage = 14.1;
      this.currentTelemetry.isEngineRunning = true;
      this.currentTelemetry.intakePressureMap = 145 + Math.round(noise * 5);
      this.currentTelemetry.intakeAirTemp = 36;
      this.currentTelemetry.mafRate = 28.5 + Math.round(noise * 2 * 10) / 10;
      this.currentTelemetry.timingAdvance = 16 + Math.round(noise);
    }
    // Universal simulated parameters for all checked sensors
    this.currentTelemetry.shortTermFuelTrim = Math.round(noise * 1.5 * 10) / 10;
    this.currentTelemetry.longTermFuelTrim = 1.8;
    this.currentTelemetry.oilTemp = 92 + Math.round(noise);
    this.currentTelemetry.ambientTemp = 22;
    this.currentTelemetry.fuelPressureKpa = 380 + Math.round(noise * 12);
    this.currentTelemetry.barometricPressureKpa = 101;
    this.currentTelemetry.engineRunTimeSec = (this.currentTelemetry.engineRunTimeSec || 480) + 1;
    this.currentTelemetry.controlModuleVoltage = 14.0 + Math.round(noise * 0.05 * 10) / 10;
    this.currentTelemetry.fuelRailPressureDieselKpa = 1400 + Math.round(noise * 40);
    this.currentTelemetry.distanceWithMilKm = 0;
    this.currentTelemetry.distanceSinceDtcClearedKm = 3450;
    this.recalculateDerivedTelemetry();
  }

  private simulateCommandResponse(cmd: string): string {
    const cleanCmd = cmd.trim().toUpperCase().replace(/\s+/g, '');
    let response = 'OK';
    if (cleanCmd.startsWith('010C')) {
      const rpm = Math.round(this.currentTelemetry.rpm || 820);
      const raw = Math.round(rpm * 4);
      const a = (raw >> 8) & 0xff;
      const b = raw & 0xff;
      response = `41 0C ${a.toString(16).padStart(2, '0').toUpperCase()} ${b.toString(16).padStart(2, '0').toUpperCase()}`;
    } else if (cleanCmd.startsWith('010D')) {
      response = `41 0D ${Math.round(this.currentTelemetry.speed).toString(16).padStart(2, '0').toUpperCase()}`;
    } else if (cleanCmd.startsWith('0105')) {
      const a = Math.round((this.currentTelemetry.coolantTemp || 90) + 40);
      response = `41 05 ${a.toString(16).padStart(2, '0').toUpperCase()}`;
    } else if (cleanCmd.startsWith('0104')) {
      const a = Math.round((this.currentTelemetry.engineLoad || 20) * 2.55);
      response = `41 04 ${a.toString(16).padStart(2, '0').toUpperCase()}`;
    } else if (cleanCmd === 'ATRV') {
      response = `${(this.currentTelemetry.batteryVoltage || 14.1).toFixed(1)}V`;
    } else if (cleanCmd === 'ATZ') {
      response = 'ELM327 v1.5';
    }
    this.appendLog('rx', response);
    return response;
  }
}

export const elm327Service = new ELM327Service();
