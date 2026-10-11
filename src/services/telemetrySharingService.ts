import { VehicleProfile } from '../types/vehicle';
import { VehicleDiagnosticHistoryReport } from '../types/vehicleTelemetryHistory';

class TelemetrySharingService {
  private activeCode: string = 'AUT-7492';
  private reports: Map<string, VehicleDiagnosticHistoryReport> = new Map();

  constructor() {
    this.initPreconfiguredReports();
  }

  private initPreconfiguredReports() {
    // 1. Volkswagen Gol Trend 1.6 MSI (Client with recent faults, consumption spike & battery drop)
    this.reports.set('AUT-7492', {
      code: 'AUT-7492',
      vehicle: {
        id: 'arg-veh-1',
        brand: 'Volkswagen',
        model: 'Gol Trend 1.6 MSI',
        year: 2021,
        plate: 'AF 342 LK',
        engineDisplacement: '1.6 8V MSI 101CV',
        oilSpec: '5W-40 Sintético (Norma VW 502.00)',
        tankCapacityLiters: 55,
        tirePressurePsiFront: 30,
        tirePressurePsiRear: 30,
        engine: '1.6 8V MSI 101CV (EA111)',
        vin: '8AWZZZ5UZMT098214',
        currentMileage: 48920,
        fuelType: 'nafta',
        oilViscosity: '5W-40 Sintético (Norma VW 502.00)',
        oilCapacityLiters: 4.0,
        coolantType: 'G12 / G13 Orgánico Rosa',
        wheelPsdFrontBar: 2.1,
        wheelPsdRearBar: 2.1
      },
      clientName: 'Alejandro Morales',
      clientPhone: '+54 9 11 5420-1188',
      recordingPeriodDays: 30,
      totalKmMonitored: 1450,
      generatedDate: '2026-10-04 09:15',

      // Testigos y Falla Registrados por el ELM327
      testigosTimeline: [
        {
          id: 'testigo-1',
          dtcCode: 'P0300',
          testigoIcon: 'check_engine',
          testigoName: 'Check Engine (MIL)',
          timestamp: '2026-10-01 18:24',
          mileageAtEvent: 48810,
          description: 'Fallo de encendido detectado en cilindro 3 (Misfire). Testigo comenzó a parpadear y quedó fijo.',
          freezeFrame: {
            rpm: 2350,
            speedKmH: 64,
            coolantTempC: 94,
            engineLoadPercent: 68
          },
          status: 'activo'
        },
        {
          id: 'testigo-2',
          dtcCode: 'P0128',
          testigoIcon: 'temperatura',
          testigoName: 'Alerta Temperatura / Termostato',
          timestamp: '2026-09-25 09:12',
          mileageAtEvent: 48340,
          description: 'Termostato de refrigerante por debajo de la temperatura de regulación. Motor funcionando frío en ruta.',
          freezeFrame: {
            rpm: 1820,
            speedKmH: 82,
            coolantTempC: 71,
            engineLoadPercent: 42
          },
          status: 'intermitente'
        }
      ],

      // Comportamiento de Consumo
      consumption: {
        baselineL100km: 8.2,
        recentAvgL100km: 10.5,
        percentIncrease: 28,
        mechanicDiagnosis: 'El aumento de consumo anormal (+28%) coincide con los misfires del cilindro 3 detectados el 01/10. Se sugiere revisar bujías de encendido, bobina y cables.',
        recentHistory: [
          { date: '10/09', avgLitersPer100km: 8.1, trend: 'normal', distanceRecordedKm: 280, notes: 'Uso mixto normal' },
          { date: '18/09', avgLitersPer100km: 8.3, trend: 'normal', distanceRecordedKm: 340, notes: 'Ciudad y autopista' },
          { date: '26/09', avgLitersPer100km: 9.6, trend: 'aumento', distanceRecordedKm: 410, notes: 'Comienzo de tironeos leves' },
          { date: '02/10', avgLitersPer100km: 10.5, trend: 'critico', distanceRecordedKm: 420, notes: 'Check Engine encendido permanente' }
        ]
      },

      // Monitoreo de Batería y Arranque
      battery: {
        currentRestVoltage: 12.1,
        runningVoltage: 13.9,
        coldCrankingVoltageDrop: 10.3,
        batteryHealthScorePercent: 68,
        status: 'atencion',
        alertsHistory: [
          {
            date: '2026-10-02 07:15',
            description: 'Caída de tensión al arranque en frío: 10.3V (aviso de pérdida de amperaje)',
            voltageRecorded: 10.3
          },
          {
            date: '2026-09-28 08:00',
            description: 'Tensión en reposo tras 24hs parada: 12.05V (batería al 50% de carga residual)',
            voltageRecorded: 12.05
          }
        ]
      },

      // Comportamiento Térmico
      thermal: {
        avgOperatingTempC: 88,
        maxPeakRecordedC: 98,
        peakDate: '2026-09-27 15:40',
        peakSituation: 'Embotellamiento en Av. General Paz con 28°C de temperatura exterior',
        fanCyclesNormal: true,
        status: 'normal'
      },

      // Alertas registradas
      elm327RegisteredAlerts: [
        {
          id: 'alt-1',
          date: '01/10/2026 18:24',
          severity: 'alta',
          title: 'Encendido de Testigo Check Engine',
          detail: 'Código P0300 detectado a 64 km/h en aceleración media.'
        },
        {
          id: 'alt-2',
          date: '28/09/2026 08:00',
          severity: 'media',
          title: 'Batería con Caída en Arranque',
          detail: 'Tensión descendió a 10.3V durante el giro del burro de arranque.'
        },
        {
          id: 'alt-3',
          date: '25/09/2026 09:12',
          severity: 'baja',
          title: 'Motor frío en velocidad de autopista',
          detail: 'Temperatura de refrigerante no superó los 71°C en 25 minutos de marcha.'
        }
      ]
    });

    // 2. Toyota Hilux 2.8 TDI (Fleet client, good health, upcoming maintenance)
    this.reports.set('HLX-2021', {
      code: 'HLX-2021',
      vehicle: {
        id: 'arg-veh-hilux',
        brand: 'Toyota',
        model: 'Hilux 2.8 TDI 4x4',
        year: 2021,
        plate: 'AF 492 KZ',
        engineDisplacement: '2.8 D-4D 204CV',
        oilSpec: '5W-30 Sintético DPF (ACEA C2)',
        tankCapacityLiters: 80,
        tirePressurePsiFront: 33,
        tirePressurePsiRear: 36,
        engine: '2.8 D-4D 204CV Turbo Diesel',
        vin: '8AJBA3CD4M0129841',
        currentMileage: 78500,
        fuelType: 'diesel',
        oilViscosity: '5W-30 Sintético DPF (ACEA C2)',
        oilCapacityLiters: 7.5,
        coolantType: 'Toyota Super Long Life Pink',
        wheelPsdFrontBar: 2.3,
        wheelPsdRearBar: 2.5
      },
      clientName: 'Transportes del Sur SRL',
      clientPhone: '+54 9 11 4820-9911',
      recordingPeriodDays: 45,
      totalKmMonitored: 3800,
      generatedDate: '2026-10-04 08:30',

      testigosTimeline: [],

      consumption: {
        baselineL100km: 9.3,
        recentAvgL100km: 9.5,
        percentIncrease: 2,
        mechanicDiagnosis: 'Consumo dentro de parámetros estándar para carga de ruta y autopista. Sin indicios de anomalías en inyección.',
        recentHistory: [
          { date: '01/09', avgLitersPer100km: 9.2, trend: 'normal', distanceRecordedKm: 850, notes: 'Ruta 3 con carga media' },
          { date: '15/09', avgLitersPer100km: 9.4, trend: 'normal', distanceRecordedKm: 1100, notes: 'Viaje a Cañuelas' },
          { date: '01/10', avgLitersPer100km: 9.5, trend: 'normal', distanceRecordedKm: 980, notes: 'Reparto urbano' }
        ]
      },

      battery: {
        currentRestVoltage: 12.6,
        runningVoltage: 14.2,
        coldCrankingVoltageDrop: 11.4,
        batteryHealthScorePercent: 92,
        status: 'optimo',
        alertsHistory: []
      },

      thermal: {
        avgOperatingTempC: 86,
        maxPeakRecordedC: 92,
        peakDate: '2026-09-18 13:10',
        peakSituation: 'Subida de autopista con 1.500 kg de carga',
        fanCyclesNormal: true,
        status: 'normal'
      },

      elm327RegisteredAlerts: [
        {
          id: 'hlx-alt-1',
          date: '28/09/2026',
          severity: 'baja',
          title: 'Regeneración DPF completada',
          detail: 'Ciclo de limpieza de filtro de partículas diésel concluido con éxito.'
        }
      ]
    });
  }

  public getActiveCode(): string {
    return this.activeCode;
  }

  public getReport(code: string): VehicleDiagnosticHistoryReport | null {
    const cleanCode = code.trim().toUpperCase();
    return this.reports.get(cleanCode) || null;
  }

  public generateCodeForVehicle(vehicle: VehicleProfile, clientName: string = 'Cliente en Taller'): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `AUT-${randomDigits}`;

    // Create a personalized behavioral history report for this vehicle
    const newReport: VehicleDiagnosticHistoryReport = {
      code: newCode,
      vehicle,
      clientName,
      clientPhone: '+54 9 11 ...',
      recordingPeriodDays: 30,
      totalKmMonitored: 1280,
      generatedDate: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      testigosTimeline: [
        {
          id: `tst-${Date.now()}`,
          dtcCode: 'P0300',
          testigoIcon: 'check_engine',
          testigoName: 'Check Engine',
          timestamp: '2026-10-01 18:24',
          mileageAtEvent: vehicle.currentMileage - 110,
          description: 'Falla de encendido detectada por la ECU en cilindro 3.',
          freezeFrame: {
            rpm: 2350,
            speedKmH: 64,
            coolantTempC: 94,
            engineLoadPercent: 68
          },
          status: 'activo'
        }
      ],
      consumption: {
        baselineL100km: 8.2,
        recentAvgL100km: 10.4,
        percentIncrease: 26,
        mechanicDiagnosis: 'El consumo promedio aumentó un 26% en las últimas dos semanas coincidiendo con la falla de encendido.',
        recentHistory: [
          { date: '15/09', avgLitersPer100km: 8.2, trend: 'normal', distanceRecordedKm: 320 },
          { date: '25/09', avgLitersPer100km: 9.5, trend: 'aumento', distanceRecordedKm: 420 },
          { date: '02/10', avgLitersPer100km: 10.4, trend: 'critico', distanceRecordedKm: 380 }
        ]
      },
      battery: {
        currentRestVoltage: 12.1,
        runningVoltage: 13.9,
        coldCrankingVoltageDrop: 10.4,
        batteryHealthScorePercent: 70,
        status: 'atencion',
        alertsHistory: [
          {
            date: '2026-10-02',
            description: 'Caída de arranque a 10.4V por la mañana',
            voltageRecorded: 10.4
          }
        ]
      },
      thermal: {
        avgOperatingTempC: 88,
        maxPeakRecordedC: 96,
        peakDate: '2026-09-28',
        peakSituation: 'Tráfico urbano lento',
        fanCyclesNormal: true,
        status: 'normal'
      },
      elm327RegisteredAlerts: [
        {
          id: 'alt-gen-1',
          date: '01/10/2026 18:24',
          severity: 'alta',
          title: 'Testigo Check Engine Encendido',
          detail: 'Código P0300 registrado durante aceleración.'
        },
        {
          id: 'alt-gen-2',
          date: '28/09/2026',
          severity: 'media',
          title: 'Aviso de arranque en frío',
          detail: 'Tensión de arranque descendió a 10.4V.'
        }
      ]
    };

    this.reports.set(newCode, newReport);
    this.activeCode = newCode;
    return newCode;
  }
}

export const telemetrySharingService = new TelemetrySharingService();
