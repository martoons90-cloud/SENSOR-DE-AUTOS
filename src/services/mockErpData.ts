import {
  WorkOrder,
  Product,
  Sale,
  CustomerAccount,
  ServiceBay,
  WorkshopAppointment
} from '../types/erp';

export const INITIAL_BAYS: ServiceBay[] = [
  {
    id: 'bay-1',
    name: 'Fosa 1 - Lubricentro Rápido',
    type: 'fosa',
    isOccupied: true,
    currentOtId: 'OT-1048',
    currentVehicle: 'Toyota Hilux 2.8 TDI (AF 492 KZ)',
    currentService: 'Cambio de Aceite Sintético 5W-30 + 4 Filtros + Engrase',
    mechanic: 'Martín Gómez',
    progressPercent: 75
  },
  {
    id: 'bay-2',
    name: 'Fosa 2 - Pesados y Utilitarios',
    type: 'fosa',
    isOccupied: true,
    currentOtId: 'OT-1049',
    currentVehicle: 'Renault Kangoo 1.6 SCe (AE 812 LM)',
    currentService: 'Cambio de Aceite 10W-40 + Filtro de Habitáculo',
    mechanic: 'Gonzalo Rossi',
    progressPercent: 40
  },
  {
    id: 'bay-3',
    name: 'Elevador 1 - Mecánica General',
    type: 'elevador',
    isOccupied: true,
    currentOtId: 'OT-1045',
    currentVehicle: 'Volkswagen Amarok V6 (AD 930 OP)',
    currentService: 'Discos y Pastillas de Freno delanteras + Purga Líquido DOT4',
    mechanic: 'Esteban Paredes',
    progressPercent: 30
  },
  {
    id: 'bay-4',
    name: 'Elevador 2 - Suspensión y Tren Delantero',
    type: 'elevador',
    isOccupied: false
  },
  {
    id: 'bay-5',
    name: 'Bahía 3 - Diagnóstico OBD2 y Electrónica',
    type: 'bahia_obd',
    isOccupied: true,
    currentOtId: 'OT-1047',
    currentVehicle: 'Peugeot 208 1.6 VTi (AF 120 TY)',
    currentService: 'Escaneo OBD2 ELM327 (DTC P0300 Fallo encendido cilindros)',
    mechanic: 'Esteban Paredes',
    progressPercent: 90
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'OT-1048',
    vehiclePlate: 'AF 492 KZ',
    vehicleModel: 'Toyota Hilux 2.8 TDI 4x4',
    vehicleYear: 2021,
    currentKm: 78500,
    customerName: 'Transportes del Sur SRL',
    customerPhone: '+54 9 11 4820-9911',
    customerType: 'flota_empresa',
    serviceCategory: 'lubricentro',
    serviceDetails: 'Service Mayor 80.000km: Aceite Sintético Motul 8100 5W-30 (7.5L), Filtro de Aceite Mann, Filtro de Aire, Filtro de Combustible, y engrase de crucetas cardán.',
    mechanic: 'Martín Gómez',
    bay: 'Fosa 1 - Lubricentro Rápido',
    status: 'en_proceso',
    date: '2026-10-04',
    estimatedCost: 198500,
    laborCost: 45000,
    partsUsed: [
      { name: 'Motul 8100 X-Clean 5W-30 (Litros a granel)', quantity: 7.5, unitPrice: 15800 },
      { name: 'Filtro Aceite Mann W712/83', quantity: 1, unitPrice: 16500 },
      { name: 'Filtro Aire Mann C25114', quantity: 1, unitPrice: 22000 },
      { name: 'Filtro Combustible WK820/1', quantity: 1, unitPrice: 28500 }
    ],
    nextServiceKm: 88500,
    nextServiceDate: '2027-04-04',
    notes: 'Flota comercial - Facturar con OC-882 a cuenta corriente 30 días.'
  },
  {
    id: 'OT-1049',
    vehiclePlate: 'AE 812 LM',
    vehicleModel: 'Renault Kangoo II 1.6 SCe Express',
    vehicleYear: 2020,
    currentKm: 94200,
    customerName: 'Remises Alvear Express',
    customerPhone: '+54 9 11 3912-4400',
    customerType: 'flota_empresa',
    serviceCategory: 'lubricentro',
    serviceDetails: 'Cambio de Aceite Elaion F30 10W-40 (4.5L), Filtro de Aceite Wega y Filtro de Habitáculo antibacteriano.',
    mechanic: 'Gonzalo Rossi',
    bay: 'Fosa 2 - Pesados y Utilitarios',
    status: 'en_proceso',
    date: '2026-10-04',
    estimatedCost: 112000,
    laborCost: 28000,
    partsUsed: [
      { name: 'Elaion F30 10W-40 (Surtidor Fosa)', quantity: 4.5, unitPrice: 12200 },
      { name: 'Filtro Aceite Wega WO-205', quantity: 1, unitPrice: 14500 },
      { name: 'Filtro Polen / Habitáculo AKX-35123', quantity: 1, unitPrice: 14600 }
    ],
    nextServiceKm: 104200,
    nextServiceDate: '2027-01-15'
  },
  {
    id: 'OT-1045',
    vehiclePlate: 'AD 930 OP',
    vehicleModel: 'Volkswagen Amarok V6 3.0 TDI',
    vehicleYear: 2019,
    currentKm: 132000,
    customerName: 'Roberto Silveira',
    customerPhone: '+54 9 11 5501-8822',
    customerType: 'particular',
    serviceCategory: 'frenos',
    serviceDetails: 'Reemplazo de discos delanteros ventilados + Juego pastillas de freno cerámicas Fras-le + Purga de circuito con líquido Bosch DOT4.',
    mechanic: 'Esteban Paredes',
    bay: 'Elevador 1 - Mecánica General',
    status: 'esperando_repuestos',
    date: '2026-10-03',
    estimatedCost: 345000,
    laborCost: 95000,
    partsUsed: [
      { name: 'Discos de Freno Delanteros Amarok V6 (Par)', quantity: 1, unitPrice: 165000 },
      { name: 'Pastillas de Freno Fras-le Cerámica', quantity: 1, unitPrice: 72000 },
      { name: 'Líquido de Frenos Bosch DOT4 1L', quantity: 2, unitPrice: 6500 }
    ],
    nextServiceKm: 152000,
    nextServiceDate: '2027-10-03',
    notes: 'Proveedor Corven entrega discos a las 14:30 hs.'
  },
  {
    id: 'OT-1047',
    vehiclePlate: 'AF 120 TY',
    vehicleModel: 'Peugeot 208 1.6 VTi Feline',
    vehicleYear: 2022,
    currentKm: 42100,
    customerName: 'Mariana Lopardo',
    customerPhone: '+54 9 11 6310-7744',
    customerType: 'particular',
    serviceCategory: 'diagnostico',
    serviceDetails: 'Diagnóstico OBD2 por luz Check Engine parpadeante en tablero. Escaneo ELM327 detectó DTC P0300 y P0302 (Fallo de combustión cilindro 2). Se revisaron y cambiaron 4 bujías NGK Laser Iridium.',
    mechanic: 'Esteban Paredes',
    bay: 'Bahía 3 - Diagnóstico OBD2',
    status: 'finalizado',
    date: '2026-10-04',
    estimatedCost: 158000,
    laborCost: 48000,
    partsUsed: [
      { name: 'Bujías NGK Laser Iridium LFR6AIX-11 (Juego x4)', quantity: 1, unitPrice: 85000 },
      { name: 'Limpia Inyectores Liqui Moly Injection Reiniger', quantity: 1, unitPrice: 25000 }
    ],
    nextServiceKm: 52100,
    nextServiceDate: '2027-04-04',
    diagnosticDtc: ['P0300', 'P0302'],
    notes: 'Check Engine borrado exitosamente tras prueba de ruta. Lista para entrega.'
  },
  {
    id: 'OT-1044',
    vehiclePlate: 'AE 551 JK',
    vehicleModel: 'Fiat Cronos 1.3 GSE Drive',
    vehicleYear: 2021,
    currentKm: 61400,
    customerName: 'Leandro Medina',
    customerPhone: '+54 9 11 2289-4110',
    customerType: 'particular',
    serviceCategory: 'lubricentro',
    serviceDetails: 'Cambio de Aceite Sintético Selenia K Pure Energy 5W-30 (3.2L) + Filtro de Aceite y Filtro de Aire.',
    mechanic: 'Gonzalo Rossi',
    bay: 'Fosa 1 - Lubricentro Rápido',
    status: 'entregado',
    date: '2026-10-03',
    estimatedCost: 89000,
    laborCost: 22000,
    partsUsed: [
      { name: 'Aceite Petronas Selenia 5W-30 (Bidón 4L)', quantity: 1, unitPrice: 48000 },
      { name: 'Filtro Aceite Mann W610', quantity: 1, unitPrice: 9500 },
      { name: 'Filtro Aire Wega FAP-2849', quantity: 1, unitPrice: 9500 }
    ],
    nextServiceKm: 71400,
    nextServiceDate: '2027-04-03'
  },
  {
    id: 'OT-1046',
    vehiclePlate: 'AC 719 LL',
    vehicleModel: 'Ford Ranger 3.2 TDCi Limited',
    vehicleYear: 2018,
    currentKm: 148000,
    customerName: 'Agroservicios Pampeanos',
    customerPhone: '+54 9 11 4019-1123',
    customerType: 'flota_empresa',
    serviceCategory: 'mecanica',
    serviceDetails: 'Cambio de correa poli-V, tensor automático y reemplazo de fluido de dirección hidráulica + líquido refrigerante Glacelf.',
    mechanic: 'Martín Gómez',
    bay: 'Elevador 2 - Mecánica General',
    status: 'ingresado',
    date: '2026-10-04',
    estimatedCost: 260000,
    laborCost: 75000,
    partsUsed: [
      { name: 'Correa Poli-V Gates 6PK2195', quantity: 1, unitPrice: 42000 },
      { name: 'Tensor de Correa Automático INA', quantity: 1, unitPrice: 88000 },
      { name: 'Refrigerante Glacelf Auto Supra Total 5L', quantity: 1, unitPrice: 32000 },
      { name: 'Agua Desmineralizada Bidón 5L', quantity: 1, unitPrice: 3000 },
      { name: 'Líquido Hidráulico ATF Dexron III 1L', quantity: 2, unitPrice: 10000 }
    ],
    nextServiceKm: 158000,
    nextServiceDate: '2027-04-04'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'ACE-MOT-5W30-205L',
    name: 'Motul 8100 X-Clean 5W-30 (Tambor 205L)',
    brand: 'Motul',
    category: 'aceites_motor',
    unit: 'litros',
    stock: 28, // Crítico!
    minStock: 60,
    costPrice: 9800,
    salePrice: 15800,
    location: 'Batería de Tambores Fosa 1'
  },
  {
    id: 'prod-2',
    sku: 'ACE-ELA-F30-10W40-205L',
    name: 'YPF Elaion F30 10W-40 Semisintético (Tambor 205L)',
    brand: 'YPF Elaion',
    category: 'aceites_motor',
    unit: 'litros',
    stock: 142,
    minStock: 50,
    costPrice: 7200,
    salePrice: 12200,
    location: 'Batería de Tambores Fosa 2'
  },
  {
    id: 'prod-3',
    sku: 'ACE-CAS-5W40-4L',
    name: 'Castrol Edge 5W-40 Sintético (Bidón 4 Litros)',
    brand: 'Castrol',
    category: 'aceites_motor',
    unit: 'bidon_4l',
    stock: 4, // Crítico!
    minStock: 12,
    costPrice: 42000,
    salePrice: 68000,
    location: 'Estantería A1 - Lubricantes Premium'
  },
  {
    id: 'prod-4',
    sku: 'ACE-PET-SEL-5W30-4L',
    name: 'Petronas Selenia K Pure Energy 5W-30 (Bidón 4L)',
    brand: 'Petronas Selenia',
    category: 'aceites_motor',
    unit: 'bidon_4l',
    stock: 9,
    minStock: 8,
    costPrice: 31000,
    salePrice: 48000,
    location: 'Estantería A2 - Motores Fiat/Firefly'
  },
  {
    id: 'prod-5',
    sku: 'FIL-MAN-W712',
    name: 'Filtro de Aceite Mann Filter W 712/83 (Hilux / Amarok)',
    brand: 'Mann Filter',
    category: 'filtros',
    unit: 'unidades',
    stock: 3, // Crítico!
    minStock: 15,
    costPrice: 9500,
    salePrice: 16500,
    location: 'Estantería F1 - Filtros Aceite'
  },
  {
    id: 'prod-6',
    sku: 'FIL-MAN-C25114',
    name: 'Filtro de Aire Mann Filter C 25 114 (Hilux 2.8)',
    brand: 'Mann Filter',
    category: 'filtros',
    unit: 'unidades',
    stock: 2, // Crítico!
    minStock: 10,
    costPrice: 13000,
    salePrice: 22000,
    location: 'Estantería F2 - Filtros Aire'
  },
  {
    id: 'prod-7',
    sku: 'FIL-WEG-WO205',
    name: 'Filtro de Aceite Wega WO-205 (Renault / Peugeot)',
    brand: 'Wega',
    category: 'filtros',
    unit: 'unidades',
    stock: 18,
    minStock: 10,
    costPrice: 8200,
    salePrice: 14500,
    location: 'Estantería F1 - Filtros Aceite'
  },
  {
    id: 'prod-8',
    sku: 'LIQ-GLAC-SUPRA-5L',
    name: 'Refrigerante Total Glacelf Auto Supra Orgánico 5L',
    brand: 'TotalEnergies',
    category: 'aditivos_fluidos',
    unit: 'bidon_4l',
    stock: 14,
    minStock: 8,
    costPrice: 18500,
    salePrice: 32000,
    location: 'Estantería C1 - Líquidos y Fluidos'
  },
  {
    id: 'prod-9',
    sku: 'LIQ-BOSCH-DOT4-1L',
    name: 'Líquido de Frenos Bosch DOT 4 (Botella 1 Litro)',
    brand: 'Bosch',
    category: 'aditivos_fluidos',
    unit: 'bidon_1l',
    stock: 22,
    minStock: 10,
    costPrice: 3800,
    salePrice: 6500,
    location: 'Estantería C2 - Frenos'
  },
  {
    id: 'prod-10',
    sku: 'PAS-FRA-AMAROK',
    name: 'Pastillas de Freno Fras-le PD/1449 (Amarok / Ranger)',
    brand: 'Fras-le',
    category: 'pastillas_frenos',
    unit: 'unidades',
    stock: 5,
    minStock: 6,
    costPrice: 42000,
    salePrice: 72000,
    location: 'Armario Freno Delantero'
  },
  {
    id: 'prod-11',
    sku: 'BAT-MOU-12X75',
    name: 'Batería Moura 12V 75Ah Reforzada (M24KD)',
    brand: 'Moura',
    category: 'baterias',
    unit: 'unidades',
    stock: 6,
    minStock: 4,
    costPrice: 125000,
    salePrice: 195000,
    location: 'Sector Baterías con Carga'
  },
  {
    id: 'prod-12',
    sku: 'ADT-LIQ-INJ-300ML',
    name: 'Aditivo Limpia Inyectores Liqui Moly Injection 300ml',
    brand: 'Liqui Moly',
    category: 'aditivos_fluidos',
    unit: 'bidon_1l',
    stock: 19,
    minStock: 8,
    costPrice: 14000,
    salePrice: 25000,
    location: 'Mostrador Exhibidor Aditivos'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'VTA-4029',
    date: '2026-10-04',
    time: '11:15',
    customerName: 'Mariana Lopardo',
    customerPlate: 'AF 120 TY',
    items: [
      { description: 'Diagnóstico OBD2 + Escaneo Computarizado', quantity: 1, unitPrice: 48000, subtotal: 48000 },
      { description: 'Bujías NGK Laser Iridium x4', quantity: 1, unitPrice: 85000, subtotal: 85000 },
      { description: 'Limpia Inyectores Liqui Moly 300ml', quantity: 1, unitPrice: 25000, subtotal: 25000 }
    ],
    total: 158000,
    paymentMethod: 'tarjeta_credito',
    status: 'cobrado',
    type: 'servicio_taller',
    relatedOtId: 'OT-1047'
  },
  {
    id: 'VTA-4028',
    date: '2026-10-04',
    time: '10:40',
    customerName: 'Cliente de Mostrador (Pablo V.)',
    items: [
      { description: 'Líquido Refrigerante Glacelf Orgánico 5L', quantity: 1, unitPrice: 32000, subtotal: 32000 },
      { description: 'Agua Desmineralizada 5L', quantity: 1, unitPrice: 3000, subtotal: 3000 },
      { description: 'Aditivo Liqui Moly Limpia Radiadores', quantity: 1, unitPrice: 18500, subtotal: 18500 }
    ],
    total: 53500,
    paymentMethod: 'transferencia',
    status: 'cobrado',
    type: 'mostrador'
  },
  {
    id: 'VTA-4027',
    date: '2026-10-04',
    time: '09:10',
    customerName: 'Remises Alvear Express',
    customerPlate: 'AE 812 LM',
    items: [
      { description: 'Service Aceite Elaion 10W40 (4.5L) + 2 Filtros', quantity: 1, unitPrice: 112000, subtotal: 112000 }
    ],
    total: 112000,
    paymentMethod: 'cuenta_corriente',
    status: 'pendiente_cuenta_corriente',
    type: 'servicio_taller',
    relatedOtId: 'OT-1049'
  },
  {
    id: 'VTA-4026',
    date: '2026-10-03',
    time: '17:30',
    customerName: 'Leandro Medina',
    customerPlate: 'AE 551 JK',
    items: [
      { description: 'Service Cronos 1.3: Selenia 5W-30 + Filtros', quantity: 1, unitPrice: 89000, subtotal: 89000 }
    ],
    total: 89000,
    paymentMethod: 'efectivo',
    status: 'cobrado',
    type: 'servicio_taller',
    relatedOtId: 'OT-1044'
  },
  {
    id: 'VTA-4025',
    date: '2026-10-03',
    time: '16:05',
    customerName: 'Juan Carlos Benítez',
    items: [
      { description: 'Batería Moura 12V 75Ah M24KD (Instalación sin cargo)', quantity: 1, unitPrice: 195000, subtotal: 195000 }
    ],
    total: 195000,
    paymentMethod: 'tarjeta_debito',
    status: 'cobrado',
    type: 'mostrador'
  }
];

export const INITIAL_CUSTOMER_ACCOUNTS: CustomerAccount[] = [
  {
    id: 'cta-1',
    customerName: 'Transportes del Sur SRL',
    cuitOrDni: '30-71458922-4',
    phone: '+54 9 11 4820-9911',
    companyOrFleet: 'Flota 8 Camionetas y Furgones',
    totalDebt: 348500,
    creditLimit: 800000,
    lastPaymentDate: '2026-09-24',
    pendingInvoices: [
      {
        invoiceId: 'FAC-B-8910',
        date: '2026-09-12',
        dueDate: '2026-10-02',
        concept: 'Service 60.000km Ford Ranger (AA 109 ZZ)',
        amount: 150000,
        paidAmount: 0,
        isOverdue: true
      },
      {
        invoiceId: 'FAC-B-8955',
        date: '2026-10-04',
        dueDate: '2026-10-24',
        concept: 'Service 80.000km Toyota Hilux (AF 492 KZ)',
        amount: 198500,
        paidAmount: 0,
        isOverdue: false
      }
    ]
  },
  {
    id: 'cta-2',
    customerName: 'Remises Alvear Express',
    cuitOrDni: '30-68991203-8',
    phone: '+54 9 11 3912-4400',
    companyOrFleet: 'Flota 14 Vehículos Urbanos',
    totalDebt: 247000,
    creditLimit: 500000,
    lastPaymentDate: '2026-09-28',
    pendingInvoices: [
      {
        invoiceId: 'FAC-B-8890',
        date: '2026-09-08',
        dueDate: '2026-09-28',
        concept: 'Cambio de 4 cubiertas + Alineación y balanceo',
        amount: 135000,
        paidAmount: 0,
        isOverdue: true
      },
      {
        invoiceId: 'FAC-B-8954',
        date: '2026-10-04',
        dueDate: '2026-10-18',
        concept: 'Service Kangoo 1.6 (AE 812 LM)',
        amount: 112000,
        paidAmount: 0,
        isOverdue: false
      }
    ]
  },
  {
    id: 'cta-3',
    customerName: 'Agroservicios Pampeanos',
    cuitOrDni: '33-70891234-9',
    phone: '+54 9 11 4019-1123',
    companyOrFleet: 'Flota Maquinaria y Pickups',
    totalDebt: 260000,
    creditLimit: 1200000,
    lastPaymentDate: '2026-09-15',
    pendingInvoices: [
      {
        invoiceId: 'FAC-A-2104',
        date: '2026-10-04',
        dueDate: '2026-10-25',
        concept: 'Mantenimiento preventivo correas Ranger 3.2',
        amount: 260000,
        paidAmount: 0,
        isOverdue: false
      }
    ]
  },
  {
    id: 'cta-4',
    customerName: 'Particular - Dr. Marcelo Quintana',
    cuitOrDni: '20-24890123-5',
    phone: '+54 9 11 5599-2311',
    companyOrFleet: 'BMW Serie 3 & Hilux',
    totalDebt: 65000,
    creditLimit: 200000,
    lastPaymentDate: '2026-09-30',
    pendingInvoices: [
      {
        invoiceId: 'FAC-B-8930',
        date: '2026-09-20',
        dueDate: '2026-10-01',
        concept: 'Saldo pendiente pastillas de freno cerámicas',
        amount: 65000,
        paidAmount: 0,
        isOverdue: true
      }
    ]
  }
];

export const INITIAL_APPOINTMENTS: WorkshopAppointment[] = [
  {
    id: 'TRN-101',
    timeSlot: '14:00',
    date: '2026-10-04',
    customerName: 'Federico Balbi',
    phone: '+54 9 11 5012-3344',
    vehicle: 'Volkswagen Golf 1.4 TSI',
    plate: 'AB 890 LK',
    serviceRequested: 'Cambio de Aceite Castrol 5W-40 + Filtro de Aire',
    status: 'confirmado',
    bayAssigned: 'Fosa 1 - Lubricentro Rápido'
  },
  {
    id: 'TRN-102',
    timeSlot: '15:30',
    date: '2026-10-04',
    customerName: 'Estudio Jurídico D’Alessandro',
    phone: '+54 9 11 4455-8899',
    vehicle: 'Toyota Corolla 1.8 CVT',
    plate: 'AE 210 QW',
    serviceRequested: 'Service de 50.000 km + Rotación de Neumáticos',
    status: 'en_espera',
    bayAssigned: 'Elevador 2'
  },
  {
    id: 'TRN-103',
    timeSlot: '17:00',
    date: '2026-10-04',
    customerName: 'Guillermo Paz',
    phone: '+54 9 11 6788-1122',
    vehicle: 'Chevrolet Cruze 1.4 Turbo',
    plate: 'AD 405 NM',
    serviceRequested: 'Diagnóstico OBD2 por testigo de Tracción / Motor',
    status: 'confirmado',
    bayAssigned: 'Bahía 3 - Diagnóstico OBD2'
  }
];
