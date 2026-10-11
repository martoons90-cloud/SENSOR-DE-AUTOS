import {
  VehicleProfile,
  FluidLevel,
  EcoSavingReport,
  Workshop,
  ServiceAppointment,
  MaintenanceRecord,
  MaintenanceAlert
} from '../types/vehicle';

export const INITIAL_VEHICLE: VehicleProfile = {
  id: 'veh-nissan-np300',
  brand: 'Nissan',
  model: 'Frontier NP300 2.5 dCi',
  year: 2013,
  plate: 'AA 742 KZ',
  fuelType: 'diesel',
  currentMileage: 124500,
  tankCapacityLiters: 75,
  engineDisplacement: '2.5L 16V Turbo Diesel Intercooler (133 CV)',
  oilSpec: '10W-40 / 15W-40 Diésel (ACEA B4 / API CI-4)',
  tirePressurePsiFront: 32,
  tirePressurePsiRear: 36
};

export const INITIAL_FLUIDS: FluidLevel[] = [
  {
    id: 'f-oil',
    name: 'Aceite de Motor (Vida útil)',
    category: 'motor',
    currentLevelPercent: 78,
    status: 'optimal',
    spec: '5W-40 Sintético VW 502.00 / API SN',
    lastCheckedDate: '2026-08-14',
    nextChangeMileage: 52000,
    notes: 'Color ámbar limpio, viscosidad adecuada. Próximo cambio en 5.720 km.'
  },
  {
    id: 'f-coolant',
    name: 'Líquido Refrigerante / Anticongelante',
    category: 'refrigeracion',
    currentLevelPercent: 92,
    status: 'optimal',
    spec: 'G12+ Rosa Orgánico al 50%',
    lastCheckedDate: '2026-09-10',
    nextChangeMileage: 70000,
    notes: 'Punto de ebullición protegido a 135°C presurizado. Sin trazas de óxido ni aceite.'
  },
  {
    id: 'f-brake',
    name: 'Líquido de Frenos',
    category: 'frenos',
    currentLevelPercent: 62,
    status: 'warning',
    spec: 'DOT 4 Sintético',
    lastCheckedDate: '2026-06-20',
    nextChangeMileage: 48000,
    notes: 'Humedad medida en 2.6%. Se recomienda purgado y renovación en el próximo service.'
  },
  {
    id: 'f-washer',
    name: 'Líquido Limpiaparabrisas',
    category: 'lavaparabrisas',
    currentLevelPercent: 35,
    status: 'warning',
    spec: 'Con desengrasante y anticongelante',
    lastCheckedDate: '2026-09-22',
    nextChangeMileage: 46500,
    notes: 'Nivel bajo en depósito. Rellenar 1.5 litros.'
  },
  {
    id: 'f-trans',
    name: 'Fluido de Caja de Cambios (Manual)',
    category: 'transmision',
    currentLevelPercent: 95,
    status: 'optimal',
    spec: '75W-80 GL-4 Sintético',
    lastCheckedDate: '2026-01-10',
    nextChangeMileage: 80000,
    notes: 'Nivel óptimo hasta el tapón de nivel. Sin fugas en retenes de semieje.'
  }
];

export const INITIAL_ECO_REPORT: EcoSavingReport = {
  currentMonthAvgL100km: 8.8,
  previousMonthAvgL100km: 7.6, // El mes pasado gastó menos!
  monthlyDistanceKm: 1450,
  fuelPricePerLiter: 1140, // ARS por litro
  totalSpentCurrentMonth: 145464, // (1450 * 8.8 / 100) * 1140
  totalSpentPreviousMonth: 125628, // (1450 * 7.6 / 100) * 1140
  totalPotentialSavings: 27950, // Suma de lo que podría haberse ahorrado
  tips: [
    {
      id: 'eco-1',
      title: 'Reducir el tiempo en ralentí innecesario',
      category: 'Ralentí',
      potentialMonthlySaving: 6840,
      impact: 'alto',
      explanation: 'El mes pasado acumulaste 3.2 horas con el motor encendido mientras estabas detenido (esperas en doble fila o portón). Un motor 1.6 gasta aprox. 0.9L/hora en ralentí sin avanzar ni un metro.',
      action: 'Si vas a esperar detenido más de 45 segundos, apagá el motor. Con eso recuperás hasta $6.840 mensuales.',
      detectedInDriving: true
    },
    {
      id: 'eco-2',
      title: 'Moderar aceleraciones bruscas en marchas 1ra y 2da',
      category: 'Aceleración',
      potentialMonthlySaving: 11400,
      impact: 'alto',
      explanation: 'El sensor de mariposa (TPS) detectó 42 aperturas mayores al 70% al salir de semáforos con el motor a menos de 45°C. Esto genera enriquecimiento forzado de combustible.',
      action: 'Pasá de 1ra a 2da antes de las 2.200 RPM en frío y acelerá de manera progresiva. Ahorro estimado: $11.400.',
      detectedInDriving: true
    },
    {
      id: 'eco-3',
      title: 'Ajustar presión de neumáticos (-3 PSI detectado)',
      category: 'Neumáticos',
      potentialMonthlySaving: 5130,
      impact: 'medio',
      explanation: 'Tus neumáticos delanteros están en 29 PSI en lugar de las 32 PSI recomendadas por fábrica. La mayor resistencia a la rodadura incrementa el consumo un 3.5%.',
      action: 'Calibrá tus 4 neumáticos en la próxima carga de combustible a 32 PSI adelante y 30 PSI atrás.',
      detectedInDriving: true
    },
    {
      id: 'eco-4',
      title: 'Crucero óptimo en autopista (110 km/h vs 130 km/h)',
      category: 'Velocidad',
      potentialMonthlySaving: 4580,
      impact: 'medio',
      explanation: 'A 130 km/h la resistencia aerodinámica del vehículo es un 35% mayor que a 110 km/h. En tu tramo habitual de autopista gastaste 1.4 litros extra cada 100 km.',
      action: 'Mantené una velocidad constante de 105 - 110 km/h con marchas largas (5ta marcha).',
      detectedInDriving: false
    }
  ]
};

export const INITIAL_WORKSHOPS: Workshop[] = [
  {
    id: 'ws-1',
    name: 'Lubricentro & Box Shell Helix Express',
    type: 'lubricentro',
    rating: 4.9,
    reviewsCount: 142,
    address: 'Av. Juan B. Justo 3450',
    city: 'CABA',
    distanceKm: 1.4,
    phone: '+54 11 4589-2231',
    openHours: 'Lun a Sáb: 08:00 - 19:30',
    certifiedOBD: true,
    services: [
      {
        name: 'Cambio de Aceite Sintético 5W40 + 3 Filtros',
        price: 52000,
        estimatedDurationMinutes: 45,
        includes: 'Aceite 100% sintético x 4L, filtro de aceite Mann, filtro de aire y filtro de habitáculo + chequeo de 20 puntos'
      },
      {
        name: 'Cambio Básico de Aceite y Filtro de Aceite',
        price: 36000,
        estimatedDurationMinutes: 30,
        includes: 'Aceite sintético homologado + filtro de aceite blindado + arandela de carter'
      },
      {
        name: 'Purgado y Reemplazo de Líquido de Frenos DOT 4',
        price: 24000,
        estimatedDurationMinutes: 40,
        includes: '1L Líquido Bosch DOT 4 + purgado en las 4 ruedas por vacío'
      },
      {
        name: 'Escaneo OBD-II Computarizado y Borrado de Fallas',
        price: 15000,
        estimatedDurationMinutes: 20,
        includes: 'Lectura completa de códigos P, U, B, C con reporte impreso y borrado de MIL'
      }
    ]
  },
  {
    id: 'ws-2',
    name: 'Taller Mecánico Integral Bosch Car Service',
    type: 'mecanica_integral',
    rating: 4.8,
    reviewsCount: 218,
    address: 'Av. Warnes 1120',
    city: 'CABA',
    distanceKm: 2.1,
    phone: '+54 11 4855-6677',
    openHours: 'Lun a Vie: 08:30 - 18:30',
    certifiedOBD: true,
    services: [
      {
        name: 'Diagnóstico Electrónico & Reparación de Inyección',
        price: 28000,
        estimatedDurationMinutes: 60,
        includes: 'Prueba de sondas lambda, limpieza de inyectores por ultrasonido y calibración de cuerpo mariposa'
      },
      {
        name: 'Cambio de Pastillas de Freno Delanteras',
        price: 44000,
        estimatedDurationMinutes: 50,
        includes: 'Pastillas cerámicas de baja emisión de polvo + rectificado leve de discos + engrase de mordazas'
      },
      {
        name: 'Cambio de Aceite Sintético 5W40 + 3 Filtros',
        price: 56000,
        estimatedDurationMinutes: 45,
        includes: 'Aceite Motul / Bosch sintético + filtros originales + reseteo de intervalo de service'
      },
      {
        name: 'Kit de Distribución + Bomba de Agua',
        price: 145000,
        estimatedDurationMinutes: 180,
        includes: 'Correa Gates/Dayco + tensor automático + bomba de agua Dolz + 2L refrigerante G12+'
      }
    ]
  },
  {
    id: 'ws-3',
    name: 'Lubricentro YPF Boxes Belgrano',
    type: 'lubricentro',
    rating: 4.7,
    reviewsCount: 95,
    address: 'Av. Cabildo 4210',
    city: 'CABA',
    distanceKm: 3.8,
    phone: '+54 11 4701-9988',
    openHours: 'Lun a Dom: 07:30 - 20:00',
    certifiedOBD: true,
    services: [
      {
        name: 'Cambio de Aceite Sintético 5W40 + 3 Filtros',
        price: 49500,
        estimatedDurationMinutes: 40,
        includes: 'Aceite Elaion F50 5W-40 + filtros Fram + revisión de tren delantero y luces sin cargo'
      },
      {
        name: 'Cambio Básico de Aceite y Filtro de Aceite',
        price: 34000,
        estimatedDurationMinutes: 25,
        includes: 'Aceite Elaion + filtro de aceite + sellador de tapón'
      },
      {
        name: 'Renovación de Refrigerante Circuito Completo',
        price: 26000,
        estimatedDurationMinutes: 35,
        includes: 'Lavado de circuito con agua destilada + 5L mezcla refrigerante concentrado Koube'
      }
    ]
  },
  {
    id: 'ws-4',
    name: 'Neumáticos & Mecánica Rápida FastPoint',
    type: 'frenos_suspension',
    rating: 4.6,
    reviewsCount: 84,
    address: 'Av. Córdoba 5620',
    city: 'CABA',
    distanceKm: 2.7,
    phone: '+54 11 4772-1144',
    openHours: 'Lun a Sáb: 08:00 - 19:00',
    certifiedOBD: false,
    services: [
      {
        name: 'Alineación 3D Computarizada + Balanceo 4 Ruedas',
        price: 32000,
        estimatedDurationMinutes: 45,
        includes: 'Alineación láser de ejes delantero y trasero + 4 balanceos dinámicos de plomo ecológico'
      },
      {
        name: 'Cambio de Pastillas de Freno Delanteras',
        price: 39000,
        estimatedDurationMinutes: 40,
        includes: 'Pastillas Fras-le / Raybestos + purgado de líquido de frenos'
      },
      {
        name: 'Rotación, Balanceo y Calibración con Nitrógeno',
        price: 22000,
        estimatedDurationMinutes: 30,
        includes: 'Rotación en cruz recomendada para tracción delantera + calibración exacta'
      }
    ]
  },
  {
    id: 'ws-5',
    name: 'Inyección & Scanner Lab Pro',
    type: 'inyeccion_electronica',
    rating: 4.9,
    reviewsCount: 165,
    address: 'Álvarez Thomas 2150',
    city: 'CABA',
    distanceKm: 4.2,
    phone: '+54 11 4553-7890',
    openHours: 'Lun a Vie: 09:00 - 18:00',
    certifiedOBD: true,
    services: [
      {
        name: 'Diagnóstico Electrónico & Reparación de Inyección',
        price: 25000,
        estimatedDurationMinutes: 50,
        includes: 'Osciloscopio automotriz en sensores de encendido, análisis de gases y test de actuadores'
      },
      {
        name: 'Escaneo OBD-II Computarizado y Borrado de Fallas',
        price: 12000,
        estimatedDurationMinutes: 20,
        includes: 'Diagnóstico en profundidad de centralitas motor, ABS y airbags con borrado de fallas'
      },
      {
        name: 'Cambio de Bobinas y Bujías Iridium',
        price: 68000,
        estimatedDurationMinutes: 45,
        includes: '4 bujías NGK Iridium + chequeo de bobinas + calibración de luz de electrodo'
      }
    ]
  }
];

export const INITIAL_MAINTENANCE_HISTORY: MaintenanceRecord[] = [
  {
    id: 'mr-1',
    date: '2026-03-12',
    mileage: 40500,
    serviceType: 'Service Mayor: Aceite, 4 Filtros y Bujías',
    workshopName: 'Lubricentro & Box Shell Helix Express',
    cost: 58500,
    partsReplaced: [
      'Aceite Shell Helix Ultra 5W-40 x 4L',
      'Filtro de Aceite Mann W712/52',
      'Filtro de Aire C29015',
      'Filtro de Combustible WK58/3',
      '4 Bujías Bosch Super Plus'
    ],
    invoiceNumber: 'FAC-B-0004-00018942',
    nextDueMileage: 50500,
    nextDueDate: '2027-03-12',
    notes: 'Vehículo en excelente estado. Se revisaron frenos (70% de vida útil en pastillas).'
  },
  {
    id: 'mr-2',
    date: '2025-10-05',
    mileage: 35200,
    serviceType: 'Alineación, Balanceo y Rotación de Cubiertas',
    workshopName: 'Neumáticos & Mecánica Rápida FastPoint',
    cost: 26000,
    partsReplaced: ['Contrapesos de balanceo', 'Válvulas nuevas de inflado'],
    invoiceNumber: 'FAC-B-0002-00008431',
    nextDueMileage: 45200,
    nextDueDate: '2026-10-05',
    notes: 'Presión calibrada en 32 PSI. Desgaste parejo en las 4 cubiertas.'
  },
  {
    id: 'mr-3',
    date: '2025-05-18',
    mileage: 30100,
    serviceType: 'Service Básico de Aceite y Filtro + Chequeo General',
    workshopName: 'Lubricentro YPF Boxes Belgrano',
    cost: 32000,
    partsReplaced: ['Aceite Elaion F50 5W-40 x 4L', 'Filtro de Aceite'],
    invoiceNumber: 'FAC-B-0008-00045210',
    nextDueMileage: 40100,
    nextDueDate: '2026-05-18',
    notes: 'Cambio de arandela de tapón de carter. Niveles de refrigerante correctos.'
  }
];

export const INITIAL_ALERTS: MaintenanceAlert[] = [
  {
    id: 'alt-oil',
    title: 'Próximo Service de Aceite y Filtros',
    type: 'aceite',
    status: 'ok',
    currentKm: 46280,
    dueKm: 50500,
    dueDate: '2027-03-12',
    kmRemaining: 4220,
    daysRemaining: 168,
    description: 'Te restan 4.220 km o aprox. 5 meses para el cambio periódico programado.'
  },
  {
    id: 'alt-brake-fluid',
    title: 'Vencimiento de Líquido de Frenos',
    type: 'frenos',
    status: 'proximo',
    currentKm: 46280,
    dueKm: 48000,
    dueDate: '2026-11-15',
    kmRemaining: 1720,
    daysRemaining: 50,
    description: 'El líquido de frenos higroscópico tiene más de 18 meses. Programar purgado.'
  },
  {
    id: 'alt-rotation',
    title: 'Rotación y Alineación de Neumáticos',
    type: 'filtros',
    status: 'proximo',
    currentKm: 46280,
    dueKm: 45200,
    dueDate: '2026-10-05',
    kmRemaining: -1080,
    daysRemaining: 9,
    description: 'Han pasado 11.080 km desde la última rotación. Conviene rotar cubiertas para evitar desgaste desparejo.'
  },
  {
    id: 'alt-timing',
    title: 'Correa de Distribución (Preventivo)',
    type: 'distribucion',
    status: 'ok',
    currentKm: 46280,
    dueKm: 60000,
    dueDate: '2027-08-01',
    kmRemaining: 13720,
    daysRemaining: 309,
    description: 'Inspección visual programada para los 50.000 km y cambio preventivo a los 60.000 km.'
  }
];

export const INITIAL_APPOINTMENTS: ServiceAppointment[] = [
  {
    id: 'trn-77821',
    workshopId: 'ws-1',
    workshopName: 'Lubricentro & Box Shell Helix Express',
    serviceName: 'Escaneo OBD-II Computarizado y Borrado de Fallas',
    date: '2026-09-29',
    timeSlot: '10:30',
    estimatedCost: 15000,
    vehiclePlate: 'AF 342 XP',
    vehicleModel: 'Volkswagen Gol Trend 1.6',
    clientName: 'Martín',
    clientPhone: '11 5566-7788',
    notes: 'Revisión por código P0300 detectado en el escáner portátil.',
    status: 'confirmado',
    createdAt: '2026-09-26T14:20:00Z'
  }
];
