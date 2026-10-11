import { DTCFaultCode } from '../types/vehicle';
import { MASTER_UNIVERSAL_P_CODES } from './obdFullCatalog';
import { EXTENDED_OBDEX_CODES } from './obdExtendedCatalog';
import { lookupManufacturerDTC } from './manufacturerDtcDatabase';

/**
 * Catálogo maestro expandido de códigos de falla OBD-II estándar SAE J2012 / ISO 15031-6 y dataset OBDex (CC0).
 * Incluye códigos universales de Motor (P0, P2), Frenos/Chasis (C0), Redes CAN (U0) y Carrocería (B0).
 */
export const UNIVERSAL_P_CODES: Record<string, Omit<DTCFaultCode, 'active' | 'timestamp'>> = {
  ...MASTER_UNIVERSAL_P_CODES,
  ...EXTENDED_OBDEX_CODES,
  // ==========================================
  // P0000 - P0099: Control de Combustible y Aire / Medición Auxiliar
  // ==========================================
  P0010: {
    code: 'P0010',
    title: 'Actuador de posición de árbol de levas (VVT/Camshaft) - Circuito Banco 1',
    category: 'Combustión / Encendido',
    severity: 'warning',
    milStatus: true,
    description: 'La computadora detectó circuito abierto o falla eléctrica en el solenoide que varía el tiempo de apertura de válvulas (VVT).',
    symptoms: ['Pérdida de potencia en altas RPM', 'Ralentí áspero', 'Consumo ligeramente elevado'],
    possibleCauses: ['Solenoide VVT sucio con sarro de aceite', 'Nivel bajo o aceite degradado', 'Cableado cortado'],
    recommendedAction: 'Limpiar o sustituir la válvula solenoide VVT y realizar cambio de aceite y filtro.',
    estimatedRepairCostRange: '$25.000 - $65.000 ARS'
  },
  P0011: {
    code: 'P0011',
    title: 'Posición del árbol de levas Banco 1: Tiempo excesivamente avanzado',
    category: 'Combustión / Encendido',
    severity: 'warning',
    milStatus: true,
    description: 'El árbol de levas de admisión está más adelantado de lo que la ECU ordenó, indicando atascamiento mecánico o falta de presión de aceite hidráulico.',
    symptoms: ['Cascabeleo del motor', 'Dificultad de arranque en caliente', 'Falta de empuje'],
    possibleCauses: ['Galería de aceite tapada hacia el engranaje variador', 'Aceite con viscosidad incorrecta', 'Engranaje desfasador trabado'],
    recommendedAction: 'Revisar presión de aceite en culata, limpiar solenoide y verificar puesta a punto.',
    estimatedRepairCostRange: '$30.000 - $90.000 ARS'
  },
  P0012: {
    code: 'P0012',
    title: 'Posición del árbol de levas Banco 1: Tiempo excesivamente retrasado',
    category: 'Combustión / Encendido',
    severity: 'warning',
    milStatus: true,
    description: 'El árbol de levas está retrasado respecto a la posición objetivo. El variador no responde con suficiente agilidad.',
    symptoms: ['Pérdida de pique al acelerar', 'Ralentí inestable'],
    possibleCauses: ['Presión de aceite insuficiente', 'Válvula solenoide trabada abierta', 'Tensor de cadena flojo'],
    recommendedAction: 'Comprobar nivel de aceite, limpiar tamiz del solenoide VVT.',
    estimatedRepairCostRange: '$28.000 - $80.000 ARS'
  },
  P0016: {
    code: 'P0016',
    title: 'Correlación de posición Cigüeñal - Árbol de levas (CKP / CMP Banco 1 Sensor A)',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'La ECU detectó desincronización física entre el giro del cigüeñal y el árbol de levas. Peligro inminente de salto de correa o cadena.',
    symptoms: ['El motor gira pero le cuesta arrancar', 'Falta grave de potencia', 'Sonido metálico en la distribución'],
    possibleCauses: ['Correa o cadena de distribución estirada o saltada de punto', 'Tensor hidráulico vencido', 'Chavetero de polea dañado'],
    recommendedAction: 'Urgente: no exigir el motor. Enviar a taller en grúa para verificar puesta a punto de distribución.',
    estimatedRepairCostRange: '$45.000 - $140.000 ARS'
  },
  P0030: {
    code: 'P0030',
    title: 'Circuito de control del calefactor del Sensor de Oxígeno (Banco 1 Sensor 1)',
    category: 'Emisiones / Catalizador',
    severity: 'warning',
    milStatus: true,
    description: 'La resistencia interna que calienta la sonda lambda previa al catalizador para que funcione rápido en frío está quemada o desconectada.',
    symptoms: ['Luz Check Engine encendida', 'Consumo alto durante los primeros 10 minutos de marcha'],
    possibleCauses: ['Resistencia calefactora quemada dentro de la sonda', 'Fusible quemado', 'Ficha sulfatada'],
    recommendedAction: 'Medir resistencia en pines calefactores con tester (debe dar 4 a 15 ohms). Reemplazar sonda lambda si está abierta.',
    estimatedRepairCostRange: '$35.000 - $75.000 ARS'
  },

  // ==========================================
  // P0100 - P0199: Combustible y Medición de Aire
  // ==========================================
  P0100: {
    code: 'P0100',
    title: 'Falla en circuito de flujo de masa de aire (MAF)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'El sensor MAF que mide la cantidad de aire que ingresa al motor no envía señal coherente a la ECU.',
    symptoms: ['El motor se detiene al frenar', 'Humo negro', 'Modo de emergencia'],
    possibleCauses: ['Conector suelto', 'Caudalímetro roto', 'Fuga de aire entre sensor y mariposa'],
    recommendedAction: 'Verificar cableado y limpiar filamento del sensor con limpiador dieléctrico.',
    estimatedRepairCostRange: '$10.000 - $50.000 ARS'
  },
  P0101: {
    code: 'P0101',
    title: 'Rendimiento / Rango fuera de tolerancia del sensor de flujo de aire (MAF)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'La lectura del MAF no concuerda con las RPM y la apertura de mariposa calculada por la computadora.',
    symptoms: ['Aceleración ahogada', 'Tirones en marchas intermedias'],
    possibleCauses: ['Filtro de aire muy sucio', 'Manguera de admisión cuarteada', 'Filamento con polvillo'],
    recommendedAction: 'Cambiar filtro de aire y limpiar el sensor de flujo de masa de aire.',
    estimatedRepairCostRange: '$12.000 - $40.000 ARS'
  },
  P0102: {
    code: 'P0102',
    title: 'Señal baja en circuito del sensor de masa de aire (MAF)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'El sensor MAF entrega un voltaje menor al esperado por la ECU.',
    symptoms: ['Aceleración perezosa', 'Tirones en marchas bajas', 'El motor se apaga imprevistamente en semáforos'],
    possibleCauses: ['Filamento caliente del MAF sucio', 'Desconexión del sensor', 'Conducto de admisión roto después del sensor'],
    recommendedAction: 'Limpiar con spray limpiador de caudalímetros sin tocar el filamento.',
    estimatedRepairCostRange: '$8.000 - $45.000 ARS'
  },
  P0106: {
    code: 'P0106',
    title: 'Rango / Rendimiento del sensor de presión absoluta del múltiple (MAP)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'El sensor MAP detecta presiones incompatibles con la carga del motor.',
    symptoms: ['Ralentí oscilante', 'Consumo alto de nafta', 'Dificultad de respuesta al acelerar'],
    possibleCauses: ['Fuga de vacío en mangueras de admisión', 'Sensor MAP aceitado', 'Válvula EGR atascada'],
    recommendedAction: 'Revisar sellos de admisión y limpiar sensor MAP.',
    estimatedRepairCostRange: '$15.000 - $48.000 ARS'
  },
  P0110: {
    code: 'P0110',
    title: 'Falla en circuito del sensor de temperatura de aire de admisión (IAT)',
    category: 'Inyección / Aire',
    severity: 'advisory',
    milStatus: true,
    description: 'El sensor que mide el calor del aire que entra al motor no envía señal válida.',
    symptoms: ['Mayor consumo en frío', 'Check Engine encendido'],
    possibleCauses: ['Termistor roto', 'Cable desconectado'],
    recommendedAction: 'Chequear ficha y reemplazar termistor IAT.',
    estimatedRepairCostRange: '$10.000 - $28.000 ARS'
  },
  P0115: {
    code: 'P0115',
    title: 'Falla en circuito del sensor de temperatura de refrigerante (ECT)',
    category: 'Refrigeración / Sensor',
    severity: 'warning',
    milStatus: true,
    description: 'El sensor que mide la temperatura del agua del motor envía voltajes erráticos o nulos a la computadora central.',
    symptoms: [
      'Electroventilador encendido permanentemente a máxima velocidad por seguridad',
      'Dificultad de arranque en frío o en caliente',
      'Aguja de temperatura en el tablero no se mueve o salta erráticamente'
    ],
    possibleCauses: [
      'Sensor ECT averiado por sarro o antigüedad',
      'Falso contacto o cables cortados en la ficha del sensor',
      'Nivel de refrigerante tan bajo que el sensor queda en seco'
    ],
    recommendedAction: 'Inspeccionar cableado de la ficha del termostato y reemplazar el bulbo/sensor de temperatura.',
    estimatedRepairCostRange: '$15.000 - $35.000 ARS'
  },
  P0118: {
    code: 'P0118',
    title: 'Circuito de temperatura de refrigerante (ECT): Entrada alta / Circuito abierto',
    category: 'Refrigeración / Sensor',
    severity: 'warning',
    milStatus: true,
    description: 'La ECU lee voltaje máximo en el sensor ECT, lo que interpreta como frío extremo (-40°C).',
    symptoms: ['Inyección excesiva de nafta', 'Humo negro', 'Arranque pesado'],
    possibleCauses: ['Sensor desconectado', 'Cable cortado', 'Bulbo quemado'],
    recommendedAction: 'Reconectar o cambiar bulbo de temperatura de agua.',
    estimatedRepairCostRange: '$14.000 - $32.000 ARS'
  },
  P0120: {
    code: 'P0120',
    title: 'Falla en circuito del sensor de posición de pedal/mariposa (TPS Sensor A)',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'La ECU no puede leer con precisión cuánto estás pisando el acelerador.',
    symptoms: ['El auto no acelera o acelera a los saltos', 'Modo de emergencia (Limp Home)'],
    possibleCauses: ['Pistas potenciómetro desgastadas en el cuerpo mariposa', 'Ficha sucia'],
    recommendedAction: 'Limpiar cuerpo mariposa y revisar cableado del TPS.',
    estimatedRepairCostRange: '$20.000 - $70.000 ARS'
  },
  P0128: {
    code: 'P0128',
    title: 'Temperatura de refrigerante insuficiente para control en bucle cerrado (Termostato)',
    category: 'Refrigeración / Sensor',
    severity: 'advisory',
    milStatus: true,
    description: 'El motor tarda demasiado tiempo en alcanzar la temperatura normal de trabajo (85°C - 95°C), usualmente porque el termostato se trabó en posición abierta.',
    symptoms: [
      'La calefacción calienta poco o nada en invierno',
      'En autopista la aguja de temperatura baja bruscamente',
      'Consumo de combustible aumentado entre 10% y 15%'
    ],
    possibleCauses: [
      'Válvula termostática trabada en posición abierta',
      'Refrigerante de mala calidad o uso de agua de canilla',
      'Sensor de temperatura descalibrado'
    ],
    recommendedAction: 'Cambiar la caja de termostato y renovar el líquido refrigerante con proporción 50/50 orgánica.',
    estimatedRepairCostRange: '$28.000 - $70.000 ARS'
  },
  P0130: {
    code: 'P0130',
    title: 'Falla en circuito del sensor de oxígeno (Banco 1 Sensor 1)',
    category: 'Emisiones / Catalizador',
    severity: 'warning',
    milStatus: true,
    description: 'La primera sonda lambda no oscila normalmente entre mezcla rica (0.8V) y pobre (0.2V).',
    symptoms: ['Aumento notable en consumo de nafta', 'Marcha despareja'],
    possibleCauses: ['Sonda envejecida contaminada con carbón', 'Fuga de escape previa'],
    recommendedAction: 'Cambiar sonda lambda delantera.',
    estimatedRepairCostRange: '$38.000 - $80.000 ARS'
  },
  P0135: {
    code: 'P0135',
    title: 'Falla en calentador del sensor de oxígeno (Banco 1 Sensor 1)',
    category: 'Emisiones / Catalizador',
    severity: 'advisory',
    milStatus: true,
    description: 'La resistencia calefactora de la primera sonda lambda no alcanza temperatura de trabajo.',
    symptoms: ['Check Engine encendido'],
    possibleCauses: ['Fusible de calentador quemado', 'Resistencia interna cortada'],
    recommendedAction: 'Reemplazar sonda de oxígeno 1.',
    estimatedRepairCostRange: '$35.000 - $75.000 ARS'
  },
  P0171: {
    code: 'P0171',
    title: 'Sistema de combustible demasiado pobre (Banco 1)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'La mezcla tiene demasiado aire y muy poco combustible en relación a la proporción ideal (14.7:1). La ECU llegó al límite máximo de compensación (+25% Trim).',
    symptoms: [
      'Ralentí inestable o motor que se apaga al frenar en esquinas',
      'Falta de reacción inmediata al pisar el acelerador ("queda ahogado")',
      'Leve cascabeleo o detonación en aceleración con carga'
    ],
    possibleCauses: [
      'Fuga de vacío en mangueras del múltiple o junta de admisión',
      'Sensor de flujo de masa de aire (MAF) sucio con polvo o aceite',
      'Bomba de nafta con presión baja o filtro de combustible tapado',
      'Válvula PCV trabada abierta'
    ],
    recommendedAction: 'Limpiar sensor MAF con aerosol específico y revisar mangueras de vacío con humo detector de fugas.',
    estimatedRepairCostRange: '$12.000 - $60.000 ARS'
  },
  P0172: {
    code: 'P0172',
    title: 'Sistema de combustible demasiado rico (Banco 1)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'Hay exceso de combustible y falta de aire en la combustión. La computadora redujo el tiempo de inyección al mínimo pero la mezcla sigue saturada.',
    symptoms: [
      'Humo negro o grisáceo visible por el caño de escape',
      'Olor fuerte a nafta en el garaje o cerca del auto',
      'Bujías con hollín negro carbónico y consumo disparado'
    ],
    possibleCauses: [
      'Filtro de aire de motor completamente tapado de tierra',
      'Inyector que queda goteando cuando está cerrado',
      'Sensor de temperatura del motor (ECT) indicando falsamente frío continuo',
      'Regulador de presión de combustible averiado'
    ],
    recommendedAction: 'Verificar filtro de aire y chequear si el sensor de temperatura envía datos coherentes a la ECU.',
    estimatedRepairCostRange: '$15.000 - $55.000 ARS'
  },

  // ==========================================
  // P0300 - P0399: Fallas de Encendido (Misfire)
  // ==========================================
  P0300: {
    code: 'P0300',
    title: 'Falla de encendido en cilindros aleatorios o múltiples (Misfire)',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'La computadora (ECU) detectó que varios cilindros no están realizando la combustión correctamente, provocando pérdida de potencia, vibraciones y combustible sin quemar hacia el escape.',
    symptoms: [
      'Temblores o tirones notables al acelerar o en ralentí',
      'Luz de Check Engine parpadeando (alerta máxima de daño a catalizador)',
      'Olor a nafta/gasolina sin quemar en el escape',
      'Aumento repentino del consumo de combustible'
    ],
    possibleCauses: [
      'Bujías con desgaste excesivo o electrodo quemado',
      'Bobinas de ignición en corto o con fuga de chispa',
      'Cables de bujía sulfatados o cortados',
      'Inyectores de combustible tapados o goteando',
      'Entrada falsa de aire (fuga de vacío en el múltiple de admisión)'
    ],
    recommendedAction: 'No acelerar a fondo ni realizar viajes largos. Reemplazar bujías y verificar estado de las bobinas de ignición en un taller.',
    estimatedRepairCostRange: '$25.000 - $65.000 ARS'
  },
  P0301: {
    code: 'P0301',
    title: 'Falla de encendido detectada en Cilindro 1',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'El cilindro número 1 tiene una falla intermitente o constante en la combustión.',
    symptoms: ['Pérdida de fuerza en subidas', 'Sonido desparejo del motor ("en 3 cilindros")', 'Check Engine encendido'],
    possibleCauses: ['Bujía #1 en mal estado', 'Bobina individual #1 quemada', 'Inyector #1 obstruido', 'Compresión baja en cilindro 1'],
    recommendedAction: 'Probar intercambiando la bobina del cilindro 1 con el 2 para comprobar si la falla se traslada.',
    estimatedRepairCostRange: '$18.000 - $45.000 ARS'
  },
  P0302: {
    code: 'P0302',
    title: 'Falla de encendido detectada en Cilindro 2',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'El cilindro número 2 presenta combustión incompleta o nula.',
    symptoms: ['Vibración en la palanca de cambios', 'Consumo elevado', 'Dificultad de respuesta al acelerar'],
    possibleCauses: ['Bujía desgastada', 'Bobina defectuosa', 'Conector flojo de inyector'],
    recommendedAction: 'Inspeccionar bujía y cable/bobina del cilindro 2.',
    estimatedRepairCostRange: '$18.000 - $45.000 ARS'
  },
  P0303: {
    code: 'P0303',
    title: 'Falla de encendido detectada en Cilindro 3',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'Falla de chispa o combustible específica en el cilindro 3.',
    symptoms: ['Motor tembloroso', 'Tirones al exigir acelerador'],
    possibleCauses: ['Bujía 3 desgastada', 'Bobina 3 quemada', 'Inyector 3 trabado'],
    recommendedAction: 'Revisar bujía y bobina del cilindro 3.',
    estimatedRepairCostRange: '$18.000 - $45.000 ARS'
  },
  P0304: {
    code: 'P0304',
    title: 'Falla de encendido detectada en Cilindro 4',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'Falla de chispa o inyección en el cilindro 4.',
    symptoms: ['Pérdida de potencia en subidas', 'Olor a nafta en el escape'],
    possibleCauses: ['Bujía 4 con carbón', 'Cable de bujía cortado', 'Inyector sucio'],
    recommendedAction: 'Inspeccionar bujía y cable del cilindro 4.',
    estimatedRepairCostRange: '$18.000 - $45.000 ARS'
  },
  P0325: {
    code: 'P0325',
    title: 'Falla en circuito del sensor de detonación / pistoneo (Knock Sensor Banco 1)',
    category: 'Combustión / Encendido',
    severity: 'warning',
    milStatus: true,
    description: 'La ECU no recibe la señal acústica del bloque motor para atrasar la chispa cuando ocurre pistoneo.',
    symptoms: ['Pérdida de pique en aceleración fuerte', 'Leve cascabeleo', 'Consumo alto'],
    possibleCauses: ['Sensor de pistoneo quebrado', 'Tornillo de anclaje flojo', 'Ficha sulfatada'],
    recommendedAction: 'Apretar el sensor con su torque exacto o reemplazarlo.',
    estimatedRepairCostRange: '$22.000 - $55.000 ARS'
  },
  P0335: {
    code: 'P0335',
    title: 'Falla en circuito del sensor de posición del cigüeñal (CKP)',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'El sensor principal que le dice a la ECU a qué velocidad y en qué ángulo gira el motor dejó de enviar pulsos.',
    symptoms: ['El motor se apaga repentinamente y no arranca más', 'Arranque pesado'],
    possibleCauses: ['Sensor magnético CKP dañado por calor', 'Rueda fónica sucia o golpeada', 'Cableado cortado'],
    recommendedAction: 'Reemplazar sensor CKP (cigüeñal).',
    estimatedRepairCostRange: '$25.000 - $65.000 ARS'
  },
  P0340: {
    code: 'P0340',
    title: 'Mal funcionamiento en circuito del sensor de posición del árbol de levas (CMP Banco 1)',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'La computadora pierde la sincronía entre el giro del cigüeñal y la apertura de las válvulas por falla de lectura del sensor CMP.',
    symptoms: [
      'Arranque muy largo (el motor gira varios segundos antes de prender)',
      'Paradas repentinas del motor en marcha',
      'Limitación de revoluciones a 3000 RPM (modo emergencia limp-mode)'
    ],
    possibleCauses: [
      'Sensor CMP en corto o degradado por calor',
      'Correa o cadena de distribución estirada o fuera de punto',
      'Acumulación de viruta metálica en la punta magnética del sensor'
    ],
    recommendedAction: 'Urgente: verificar sensor y comprobar la tensión y puesta a punto de la distribución para evitar rotura de válvulas.',
    estimatedRepairCostRange: '$30.000 - $90.000 ARS'
  },

  // ==========================================
  // P0400 - P0499: Control de Emisiones Auxiliares
  // ==========================================
  P0401: {
    code: 'P0401',
    title: 'Flujo insuficiente detectado en recirculación de gases de escape (Válvula EGR)',
    category: 'Emisiones / Catalizador',
    severity: 'advisory',
    milStatus: true,
    description: 'Los conductos que recirculan gases quemados hacia la admisión están tapados de carbón y hollín.',
    symptoms: ['Cascabeleo a velocidad constante', 'Aumento de emisiones NOx en VTV'],
    possibleCauses: ['Válvula EGR atascada de hollín', 'Conductos obstruidos', 'Sensor de presión EGR tapado'],
    recommendedAction: 'Desarmar y limpiar la válvula EGR y conductos con descarbonizante.',
    estimatedRepairCostRange: '$18.000 - $45.000 ARS'
  },
  P0420: {
    code: 'P0420',
    title: 'Eficiencia del sistema catalizador por debajo del umbral (Banco 1)',
    category: 'Emisiones / Catalizador',
    severity: 'warning',
    milStatus: true,
    description: 'El convertidor catalítico no está reduciendo los gases contaminantes al nivel requerido según la lectura comparada de las sondas de oxígeno antes y después del catalizador.',
    symptoms: [
      'Luz Check Engine encendida fija',
      'Ligero aumento de emisiones en la prueba de VTV/RTO',
      'En casos severos, olor a azufre/huevo podrido del escape',
      'Pérdida leve de agilidad en altas RPM si el catalizador está tapado'
    ],
    possibleCauses: [
      'Catalizador envejecido o contaminado por aceite/anticongelante',
      'Sensor de oxígeno secundario (post-catalizador) defectuoso o lento',
      'Fuga de gases de escape antes del catalizador',
      'Mezcla rica prolongada por fallas previas de encendido'
    ],
    recommendedAction: 'Comprobar con escáner la gráfica de voltaje de la segunda sonda lambda antes de cambiar el catalizador completo.',
    estimatedRepairCostRange: '$40.000 (sensor) - $220.000 ARS (catalizador nuevo)'
  },
  P0440: {
    code: 'P0440',
    title: 'Mal funcionamiento general del sistema de control de emisiones por evaporación (EVAP)',
    category: 'Emisiones / Catalizador',
    severity: 'advisory',
    milStatus: true,
    description: 'El circuito que retiene los vapores de gasolina del tanque tiene una falla de purga o sellado.',
    symptoms: ['Olor a combustible alrededor del coche', 'Check Engine encendido'],
    possibleCauses: ['Tapa del tanque floja', 'Válvula solenoide de purga trabada', 'Cánister saturado'],
    recommendedAction: 'Revisar hermeticidad de la tapa de combustible y probar la válvula de purga de cánister.',
    estimatedRepairCostRange: '$8.000 - $35.000 ARS'
  },
  P0442: {
    code: 'P0442',
    title: 'Fuga pequeña detectada en sistema de control de emisiones evaporativas (EVAP)',
    category: 'Emisiones / Catalizador',
    severity: 'advisory',
    milStatus: true,
    description: 'Se detecta una micro-pérdida de presión en el circuito que recupera los vapores de nafta del tanque hacia el motor.',
    symptoms: ['Olor tenue a combustible cerca de la tapa del tanque', 'Luz Check Engine encendida sin síntomas de manejo'],
    possibleCauses: [
      'Tapa de carga de combustible mal ajustada o con junta de goma reseca',
      'Manguera pequeña del cánister cuarteada',
      'Válvula de purga EVAP no cierra al 100%'
    ],
    recommendedAction: 'Apretar la tapa de combustible hasta escuchar 3 clicks y limpiar la boca de llenado.',
    estimatedRepairCostRange: '$5.000 - $25.000 ARS'
  },
  P0455: {
    code: 'P0455',
    title: 'Fuga grande / masiva detectada en sistema de emisiones EVAP',
    category: 'Emisiones / Catalizador',
    severity: 'warning',
    milStatus: true,
    description: 'Se detecta pérdida total de presión en el tanque de combustible.',
    symptoms: ['Olor muy fuerte a nafta', 'Check Engine encendido'],
    possibleCauses: ['Tapa de nafta sin colocar o rota', 'Manguera de desahogo de combustible desconectada'],
    recommendedAction: 'Verificar inmediatamente la tapa de llenado de combustible y mangueras del tanque.',
    estimatedRepairCostRange: '$5.000 - $20.000 ARS'
  },

  // ==========================================
  // P0500 - P0599: Control de Velocidad del Vehículo y Ralentí
  // ==========================================
  P0500: {
    code: 'P0500',
    title: 'Falla en el sensor de velocidad del vehículo (VSS)',
    category: 'Transmisión / Eléctrico',
    severity: 'warning',
    milStatus: true,
    description: 'La ECU no recibe la señal de velocidad de rodamiento o la compara con los sensores ABS de rueda y discrepa.',
    symptoms: [
      'Velocímetro en el tablero deja de marcar o salta a cero',
      'Dirección asistida eléctrica (EPS) se vuelve demasiado liviana o dura',
      'Caja automática realiza cambios bruscos'
    ],
    possibleCauses: ['Sensor de velocidad en caja de cambios sucio o dañado', 'Fusible fundido', 'Falso contacto en cableado'],
    recommendedAction: 'Revisar ficha del sensor VSS sobre la corona del diferencial o sensores de rueda.',
    estimatedRepairCostRange: '$22.000 - $55.000 ARS'
  },
  P0505: {
    code: 'P0505',
    title: 'Falla en sistema de control de ralentí (Válvula IAC / Paso a Paso)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'La computadora no logra estabilizar las RPM cuando el coche está detenido en punto muerto.',
    symptoms: ['El motor se apaga al frenar en esquinas', 'Ralentí muy acelerado (1500+ RPM) o muy bajo'],
    possibleCauses: ['Válvula paso a paso sucia de carbón', 'Cuerpo mariposa tapado de hollín', 'Entrada de aire pirata'],
    recommendedAction: 'Limpiar a fondo el cuerpo mariposa y la válvula IAC con limpiador de carburador.',
    estimatedRepairCostRange: '$12.000 - $35.000 ARS'
  },
  P0507: {
    code: 'P0507',
    title: 'Revoluciones de ralentí más altas de lo esperado',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'El motor queda regulando a más RPM de las calibradas (por ejemplo a 1200 RPM en lugar de 850 RPM).',
    symptoms: ['Motor acelerado sin pisar el pedal', 'Gasto de combustible innecesario en paradas'],
    possibleCauses: ['Chupada de aire por junta de admisión', 'Mariposa motorizada trabada por carbón', 'Válvula PCV rota'],
    recommendedAction: 'Revisar posibles chupadas de aire con aerosol detector de fugas en juntas de admisión.',
    estimatedRepairCostRange: '$10.000 - $30.000 ARS'
  },
  P0562: {
    code: 'P0562',
    title: 'Voltaje del sistema eléctrico bajo (<10.5V)',
    category: 'Transmisión / Eléctrico',
    severity: 'warning',
    milStatus: true,
    description: 'El voltaje general del vehículo cayó por debajo de los valores mínimos requeridos para la correcta operación de los módulos electrónicos.',
    symptoms: [
      'Luces titilan o bajan de intensidad en ralentí',
      'Testigos múltiples encienden en el tablero (ABS, Airbag, Check Engine)',
      'Arranque pesado a la mañana'
    ],
    possibleCauses: [
      'Batería con celdas degradadas al final de su vida útil',
      'Alternador con regulador de voltaje o carbones gastados',
      'Correa poli-V del alternador floja o reseca'
    ],
    recommendedAction: 'Medir voltaje con multímetro: debe marcar >12.4V apagado y entre 13.8V y 14.4V con motor en marcha.',
    estimatedRepairCostRange: '$35.000 (batería) - $80.000 ARS (alternador)'
  },
  P0563: {
    code: 'P0563',
    title: 'Voltaje del sistema eléctrico excesivamente alto (>15.5V)',
    category: 'Transmisión / Eléctrico',
    severity: 'critical',
    milStatus: true,
    description: 'El alternador está sobrecargando la red eléctrica. Peligro de quemar computadoras, focos y fundir la batería.',
    symptoms: ['Luces excesivamente brillantes', 'Olor a ácido de batería caliente', 'Testigos de tablero titilando'],
    possibleCauses: ['Regulador de voltaje del alternador en corto', 'Masa de batería floja'],
    recommendedAction: 'Urgente: no circular para no quemar la ECU. Cambiar regulador de voltaje del alternador.',
    estimatedRepairCostRange: '$30.000 - $70.000 ARS'
  },

  // ==========================================
  // P0600 - P0699: Computadora Central (ECU) y Red
  // ==========================================
  P0600: {
    code: 'P0600',
    title: 'Falla en enlace de comunicación serie de la ECU',
    category: 'Transmisión / Eléctrico',
    severity: 'critical',
    milStatus: true,
    description: 'La computadora principal tiene problemas de bus de comunicación interna o con otros módulos.',
    symptoms: ['El motor no enciende o entra en modo seguro', 'Testigos parpadeantes'],
    possibleCauses: ['Masa de chasis sulfatada', 'Bajo voltaje de batería durante el arranque', 'Humedad en conectores de ECU'],
    recommendedAction: 'Limpiar bornes y masas de chasis; verificar conexiones de centralita.',
    estimatedRepairCostRange: '$20.000 - $75.000 ARS'
  },
  P0606: {
    code: 'P0606',
    title: 'Falla en procesador interno de la computadora de motor (PCM / ECU)',
    category: 'Transmisión / Eléctrico',
    severity: 'critical',
    milStatus: true,
    description: 'El microprocesador de la centralita detectó un error en sus comprobaciones de memoria o reloj interno.',
    symptoms: ['Fallas erráticas', 'Apagadas intempestivas'],
    possibleCauses: ['Pico de tensión del alternador', 'Módulo ECU dañado por calor o vibración'],
    recommendedAction: 'Revisar regulador de alternador y enviar centralita a banco de prueba.',
    estimatedRepairCostRange: '$40.000 - $120.000 ARS'
  },

  // ==========================================
  // P0700 - P0799: Transmisión y Caja Automática
  // ==========================================
  P0700: {
    code: 'P0700',
    title: 'Sistema de control de transmisión solicita encendido de luz MIL',
    category: 'Transmisión / Eléctrico',
    severity: 'warning',
    milStatus: true,
    description: 'La computadora de la caja automática (TCM) detectó un código de falla y le pide a la ECU del motor que encienda el Check Engine.',
    symptoms: ['Caja de cambios queda trabada en 3ra marcha (modo de emergencia)', 'Patinamiento al pasar cambios'],
    possibleCauses: ['Nivel de aceite ATF bajo o quemado', 'Solenoide de cambio averiado', 'Sensor de velocidad de turbina defectuoso'],
    recommendedAction: 'Escanear el módulo específico de caja automática (TCM) para leer el código secundario exacto.',
    estimatedRepairCostRange: '$25.000 - $95.000 ARS'
  },
  P0720: {
    code: 'P0720',
    title: 'Falla en circuito del sensor de velocidad de salida de transmisión (OSS)',
    category: 'Transmisión / Eléctrico',
    severity: 'warning',
    milStatus: true,
    description: 'La caja no puede calcular la velocidad de salida hacia las ruedas motrices.',
    symptoms: ['Golpes secos al meter reversa o directa', 'No sube a 4ta o 5ta marcha'],
    possibleCauses: ['Sensor OSS sucio de viruta', 'Cableado dañado por roce con el escape'],
    recommendedAction: 'Limpiar punta imantada del sensor o cambiar sensor de velocidad de salida.',
    estimatedRepairCostRange: '$25.000 - $60.000 ARS'
  },
  P0741: {
    code: 'P0741',
    title: 'Rendimiento o atascamiento del embrague del convertidor de par (TCC)',
    category: 'Transmisión / Eléctrico',
    severity: 'warning',
    milStatus: true,
    description: 'El embrague de bloqueo (Lock-up) del convertidor de par de la caja automática no acopla mecánicamente a velocidad crucero.',
    symptoms: ['RPM más altas de lo normal en autopista', 'Sobrecalentamiento del fluido de transmisión', 'Mayor consumo en ruta'],
    possibleCauses: ['Solenoide TCC trabado', 'Fluido ATF degradado con lodo', 'Desgaste del disco lock-up'],
    recommendedAction: 'Renovar fluido ATF y filtro de caja; verificar solenoide PWM de acople.',
    estimatedRepairCostRange: '$45.000 - $160.000 ARS'
  },

  // Códigos adicionales universales frecuentes
  P0014: {
    code: 'P0014',
    title: 'Posición de árbol de levas escape Banco 1: Tiempo excesivamente avanzado',
    category: 'Combustión / Encendido',
    severity: 'warning',
    milStatus: true,
    description: 'El árbol de levas de escape no vuelve a su posición de reposo con rapidez.',
    symptoms: ['Cascabeleo', 'Ralentí áspero', 'Consumo alto'],
    possibleCauses: ['Solenoide VVT de escape sucio', 'Poco nivel de aceite', 'Mala puesta a punto'],
    recommendedAction: 'Limpiar o sustituir solenoide VVT y renovar aceite.',
    estimatedRepairCostRange: '$25.000 - $65.000 ARS'
  },
  P0087: {
    code: 'P0087',
    title: 'Presión de riel / rampa de combustible excesivamente baja',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'La bomba de nafta o inyección directa no logra generar la presión necesaria en la rampa de inyección.',
    symptoms: ['Cortes de aceleración', 'Arranque prolongado', 'El motor se apaga bajo carga'],
    possibleCauses: ['Filtro de combustible tapado', 'Bomba de combustible baja presión fatigada', 'Regulador averiado'],
    recommendedAction: 'Reemplazar filtro de nafta y medir presión en rampa con manómetro.',
    estimatedRepairCostRange: '$30.000 - $95.000 ARS'
  },
  P0107: {
    code: 'P0107',
    title: 'Entrada baja en circuito del sensor de presión absoluta del múltiple (MAP)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'El sensor MAP envía un voltaje inferior a 0.2V de forma continua a la ECU.',
    symptoms: ['Aceleración pesada', 'Falta de respuesta', 'Humo negro'],
    possibleCauses: ['Sensor desconectado', 'Cable a masa cortado', 'Sensor quemado'],
    recommendedAction: 'Comprobar 5V de alimentación y masa del sensor MAP.',
    estimatedRepairCostRange: '$15.000 - $40.000 ARS'
  },
  P0108: {
    code: 'P0108',
    title: 'Entrada alta en circuito del sensor de presión absoluta del múltiple (MAP)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'El sensor MAP envía voltaje máximo constante (>4.8V), indicando falsamente carga máxima.',
    symptoms: ['Consumo disparado de nafta', 'Ralentí alto y desparejo'],
    possibleCauses: ['Fuga masiva de vacío en manguera de admisión', 'Sensor MAP cortocircuitado'],
    recommendedAction: 'Revisar manguera de vacío del MAP y cambiar sensor si persiste.',
    estimatedRepairCostRange: '$15.000 - $45.000 ARS'
  },
  P0121: {
    code: 'P0121',
    title: 'Rango / Rendimiento del sensor de posición del pedal o mariposa (TPS)',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'La posición del pedal no coincide con la apertura leída en el cuerpo mariposa.',
    symptoms: ['Pedal insensible', 'Modo de emergencia (auto no pasa de 2000 RPM)'],
    possibleCauses: ['Cuerpo mariposa electrónico sucio con hollín', 'Pista del potenciómetro gastada'],
    recommendedAction: 'Limpiar mariposa con aerosol descarbonizante y realizar reaprendizaje de ralentí.',
    estimatedRepairCostRange: '$18.000 - $60.000 ARS'
  },
  P0136: {
    code: 'P0136',
    title: 'Falla en circuito de la sonda de oxígeno (Banco 1 Sensor 2 - Post Catalizador)',
    category: 'Emisiones / Catalizador',
    severity: 'advisory',
    milStatus: true,
    description: 'La sonda posterior al catalizador no envía señal de voltaje válida a la ECU.',
    symptoms: ['Check Engine encendido sin alteración de marcha'],
    possibleCauses: ['Cable de sonda rozando el caño de escape', 'Sonda 2 dañada por temperatura'],
    recommendedAction: 'Inspeccionar cableado debajo del chasis y sustituir sonda de oxígeno trasera.',
    estimatedRepairCostRange: '$35.000 - $70.000 ARS'
  },
  P0201: {
    code: 'P0201',
    title: 'Falla en circuito del inyector de combustible - Cilindro 1',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'Circuito eléctrico abierto o en corto en la bobina del inyector del cilindro 1.',
    symptoms: ['Motor funcionando en 3 cilindros', 'Tirones fuertes', 'Falta total de potencia'],
    possibleCauses: ['Ficha de inyector rota o con pines sulfatados', 'Bobina interna de inyector cortada'],
    recommendedAction: 'Medir resistencia del inyector (debe dar entre 12 y 16 ohms) y verificar pulso.',
    estimatedRepairCostRange: '$20.000 - $65.000 ARS'
  },
  P0202: {
    code: 'P0202',
    title: 'Falla en circuito del inyector de combustible - Cilindro 2',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'Circuito eléctrico abierto o en corto en la bobina del inyector del cilindro 2.',
    symptoms: ['Marcha en 3 cilindros', 'Consumo anormal', 'Vibración excesiva'],
    possibleCauses: ['Inyector defectuoso', 'Cableado cortado'],
    recommendedAction: 'Chequear conectores y reemplazar inyector de cilindro 2.',
    estimatedRepairCostRange: '$20.000 - $65.000 ARS'
  },
  P0203: {
    code: 'P0203',
    title: 'Falla en circuito del inyector de combustible - Cilindro 3',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'Circuito eléctrico abierto o en corto en la bobina del inyector del cilindro 3.',
    symptoms: ['Pérdida drástica de fuerza', 'Vibraciones'],
    possibleCauses: ['Bobina de inyector abierta', 'Falso contacto'],
    recommendedAction: 'Reemplazar inyector de nafta cilindro 3.',
    estimatedRepairCostRange: '$20.000 - $65.000 ARS'
  },
  P0204: {
    code: 'P0204',
    title: 'Falla en circuito del inyector de combustible - Cilindro 4',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'Circuito eléctrico abierto o en corto en la bobina del inyector del cilindro 4.',
    symptoms: ['Motor tembloroso', 'Tironeo bajo carga'],
    possibleCauses: ['Inyector quemado', 'Ficha suelta'],
    recommendedAction: 'Reemplazar inyector de nafta cilindro 4.',
    estimatedRepairCostRange: '$20.000 - $65.000 ARS'
  },
  P0299: {
    code: 'P0299',
    title: 'Presión de sobrealimentación de turbocompresor baja (Underboost)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'El turbo no entrega la presión soplada requerida por la computadora de motor.',
    symptoms: ['El auto se siente pesado ("sin turbo")', 'Silbido anormal al acelerar'],
    possibleCauses: ['Manguera de intercooler fisurada o suelta', 'Válvula wastegate trabada', 'Válvula de alivio rota'],
    recommendedAction: 'Inspeccionar mangueras de presión del turbo e intercooler en busca de rajaduras.',
    estimatedRepairCostRange: '$25.000 - $110.000 ARS'
  },
  P0351: {
    code: 'P0351',
    title: 'Falla en circuito primario / secundario de Bobina de Encendido A',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'La ECU no registra el pico de voltaje inductivo al desconectar la bobina del cilindro 1.',
    symptoms: ['Motor en 3 cilindros', 'Falta total de chispa en cilindro 1', 'Olor a nafta cruda'],
    possibleCauses: ['Bobina de encendido quemada', 'Módulo de potencia o transistor de ECU defectuoso'],
    recommendedAction: 'Cambiar bobina de encendido individual y bujía asociada.',
    estimatedRepairCostRange: '$25.000 - $70.000 ARS'
  },
  P0352: {
    code: 'P0352',
    title: 'Falla en circuito primario / secundario de Bobina de Encendido B',
    category: 'Combustión / Encendido',
    severity: 'critical',
    milStatus: true,
    description: 'Falla eléctrica en el circuito de disparo de la bobina de encendido del cilindro 2.',
    symptoms: ['Tirones severos', 'Explosiones por el escape'],
    possibleCauses: ['Bobina de ignición en corto', 'Cableado dañado'],
    recommendedAction: 'Reemplazar bobina de cilindro 2.',
    estimatedRepairCostRange: '$25.000 - $70.000 ARS'
  },
  P0443: {
    code: 'P0443',
    title: 'Falla en circuito de válvula de control de purga del sistema EVAP',
    category: 'Emisiones / Catalizador',
    severity: 'advisory',
    milStatus: true,
    description: 'La solenoide que habilita la aspiración de los vapores del cánister está abierta o en corto.',
    symptoms: ['Ralentí inestable tras cargar nafta', 'Check Engine encendido'],
    possibleCauses: ['Válvula solenoide de purga trabada', 'Ficha sulfatada'],
    recommendedAction: 'Revisar y cambiar electroválvula de purga de cánister.',
    estimatedRepairCostRange: '$18.000 - $45.000 ARS'
  },
  P0520: {
    code: 'P0520',
    title: 'Falla en circuito del sensor / interruptor de presión de aceite de motor',
    category: 'Transmisión / Eléctrico',
    severity: 'critical',
    milStatus: true,
    description: 'La computadora no recibe confirmación de presión de aceite hidráulico segura.',
    symptoms: ['Testigo aceitera en tablero', 'Mensaje de advertencia de presión de aceite'],
    possibleCauses: ['Bulbo de presión de aceite roto o con fuga de aceite', 'Nivel de aceite crítico'],
    recommendedAction: 'Verificar nivel de aceite inmediatamente y cambiar el bulbo de presión.',
    estimatedRepairCostRange: '$12.000 - $35.000 ARS'
  },
  P0705: {
    code: 'P0705',
    title: 'Falla en circuito del sensor de rango de transmisión (Interruptor PRNDL)',
    category: 'Transmisión / Eléctrico',
    severity: 'warning',
    milStatus: true,
    description: 'La caja automática no sabe en qué posición física está la palanca selectora (P, R, N o D).',
    symptoms: ['El auto no arranca en Parking', 'Luces de marcha atrás no encienden', 'Caja en modo seguro'],
    possibleCauses: ['Sensor de rango / selector suelto o sulfatado', 'Varillaje desregulado'],
    recommendedAction: 'Regular selector de cambios o cambiar switch inhibidor de arranque.',
    estimatedRepairCostRange: '$28.000 - $75.000 ARS'
  }
};

/**
 * Retorna todos los códigos universales catalogados, ordenados por código.
 * Combina las entradas enriquecidas con la lista completa estandarizada SAE J2012.
 */
export function getAllUniversalCodes(): DTCFaultCode[] {
  const map: Record<string, DTCFaultCode> = {};

  // 1. Cargar primero todos los códigos enriquecidos en detalle
  for (const entry of Object.values(UNIVERSAL_P_CODES)) {
    map[entry.code] = {
      ...entry,
      active: false,
      timestamp: new Date().toISOString()
    };
  }

  // 2. Lista completa de códigos universales oficiales SAE J2012 / ISO 15031-6
  const standardUniversalCodeList: string[] = [
    // P0001 - P0099
    'P0005', 'P0006', 'P0007', 'P0008', 'P0009', 'P0015', 'P0018', 'P0019', 'P0020', 'P0021', 'P0022',
    'P0023', 'P0024', 'P0025', 'P0026', 'P0027', 'P0028', 'P0029', 'P0032', 'P0033', 'P0034', 'P0035',
    'P0037', 'P0038', 'P0039', 'P0040', 'P0041', 'P0042', 'P0043', 'P0044', 'P0050', 'P0051', 'P0052',
    'P0056', 'P0057', 'P0058', 'P0069', 'P0070', 'P0071', 'P0072', 'P0073', 'P0075', 'P0076', 'P0077',
    'P0078', 'P0079', 'P0080', 'P0089', 'P0090', 'P0091', 'P0092', 'P0095', 'P0096', 'P0097', 'P0098',

    // P0100 - P0199
    'P0103', 'P0104', 'P0105', 'P0109', 'P0111', 'P0112', 'P0113', 'P0114', 'P0116', 'P0117', 'P0119',
    'P0124', 'P0125', 'P0126', 'P0127', 'P0137', 'P0139', 'P0140', 'P0142', 'P0143', 'P0144', 'P0145',
    'P0146', 'P0147', 'P0150', 'P0151', 'P0152', 'P0153', 'P0154', 'P0155', 'P0156', 'P0157', 'P0158',
    'P0159', 'P0160', 'P0161', 'P0170', 'P0173', 'P0180', 'P0181', 'P0182', 'P0183', 'P0190', 'P0192',
    'P0194', 'P0195', 'P0196', 'P0197', 'P0198',

    // P0200 - P0299
    'P0205', 'P0206', 'P0207', 'P0208', 'P0209', 'P0210', 'P0211', 'P0212', 'P0213', 'P0214', 'P0215',
    'P0216', 'P0217', 'P0218', 'P0220', 'P0221', 'P0222', 'P0223', 'P0224', 'P0225', 'P0226', 'P0227',
    'P0228', 'P0229', 'P0231', 'P0232', 'P0233', 'P0235', 'P0237', 'P0238', 'P0239', 'P0240', 'P0243',
    'P0244', 'P0245', 'P0246', 'P0251', 'P0252', 'P0253', 'P0254',

    // P0300 - P0399
    'P0305', 'P0306', 'P0307', 'P0308', 'P0309', 'P0310', 'P0311', 'P0312', 'P0313', 'P0314', 'P0315',
    'P0316', 'P0320', 'P0321', 'P0322', 'P0323', 'P0326', 'P0327', 'P0328', 'P0330', 'P0331', 'P0332',
    'P0333', 'P0337', 'P0338', 'P0339', 'P0342', 'P0343', 'P0344', 'P0345', 'P0346', 'P0347', 'P0348',
    'P0349', 'P0350', 'P0355', 'P0356', 'P0357', 'P0358', 'P0380', 'P0381', 'P0382',

    // P0400 - P0499
    'P0403', 'P0404', 'P0405', 'P0406', 'P0407', 'P0408', 'P0409', 'P0410', 'P0411', 'P0412', 'P0413',
    'P0414', 'P0415', 'P0421', 'P0422', 'P0423', 'P0424', 'P0431', 'P0432', 'P0433', 'P0434', 'P0444',
    'P0445', 'P0446', 'P0447', 'P0448', 'P0449', 'P0450', 'P0451', 'P0452', 'P0453', 'P0454', 'P0457',
    'P0460', 'P0461', 'P0462', 'P0463', 'P0470', 'P0471', 'P0472', 'P0473', 'P0481', 'P0482', 'P0483',
    'P0484', 'P0485', 'P0491', 'P0492',

    // P0500 - P0599
    'P0502', 'P0503', 'P0508', 'P0509', 'P0510', 'P0512', 'P0513', 'P0515', 'P0516', 'P0517', 'P0522',
    'P0523', 'P0524', 'P0530', 'P0531', 'P0533', 'P0540', 'P0541', 'P0542', 'P0544', 'P0545', 'P0546',
    'P0550', 'P0551', 'P0552', 'P0553', 'P0561', 'P0564', 'P0565', 'P0566', 'P0567', 'P0568', 'P0569',
    'P0570', 'P0572', 'P0573', 'P0574', 'P0597', 'P0598', 'P0599',

    // P0600 - P0699
    'P0602', 'P0603', 'P0604', 'P0605', 'P0607', 'P0608', 'P0609', 'P0610', 'P0615', 'P0616', 'P0617',
    'P0620', 'P0621', 'P0622', 'P0625', 'P0626', 'P0627', 'P0628', 'P0629', 'P0630', 'P0634', 'P0635',
    'P0639', 'P0641', 'P0642', 'P0643', 'P0651', 'P0652', 'P0653',

    // P0700 - P0799
    'P0701', 'P0702', 'P0703', 'P0704', 'P0706', 'P0707', 'P0708', 'P0709', 'P0711', 'P0712', 'P0713',
    'P0714', 'P0716', 'P0717', 'P0721', 'P0722', 'P0723', 'P0724', 'P0725', 'P0726', 'P0727', 'P0728',
    'P0735', 'P0736', 'P0742', 'P0743', 'P0744', 'P0745', 'P0746', 'P0747', 'P0748', 'P0749', 'P0751',
    'P0752', 'P0753', 'P0754', 'P0756', 'P0757', 'P0758', 'P0759', 'P0760', 'P0761', 'P0762', 'P0763',
    'P0764', 'P0765', 'P0766', 'P0767', 'P0768', 'P0769', 'P0770', 'P0771', 'P0772', 'P0773', 'P0774',
    'P0775', 'P0776', 'P0777', 'P0778', 'P0779', 'P0780', 'P0781', 'P0782', 'P0783', 'P0784', 'P0785',
    'P0790', 'P0791', 'P0792', 'P0793', 'P0794', 'P0795',

    // P0800 - P0899
    'P0801', 'P0802', 'P0803', 'P0804', 'P0806', 'P0807', 'P0808', 'P0810', 'P0812', 'P0815', 'P0816',
    'P0820', 'P0821', 'P0822', 'P0830', 'P0831', 'P0832', 'P0833', 'P0840', 'P0842', 'P0843', 'P0845',
    'P0850', 'P0851', 'P0852', 'P0856'
  ];

  for (const code of standardUniversalCodeList) {
    if (!map[code]) {
      const decoded = lookupDTC(code);
      if (decoded) {
        map[code] = {
          ...decoded,
          active: false,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  return Object.values(map).sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Motor decodificador SAE J2012 e ISO 15031-6:
 * Es capaz de decodificar CUALQUIER código de los más de 1.000 códigos universales
 * estandarizados por norma internacional según su jerarquía de dígitos:
 * - 1er carácter: 'P' (Powertrain / Motor y Transmisión)
 * - 2do carácter: '0' (Universal SAE) o '1'/'2'/'3' (Específico de fabricante / SAE extendido)
 * - 3er carácter: Subsistema exacto del vehículo (Combustible, Encendido, Emisiones, etc.)
 * - 4to y 5to carácter: Componente o circuito individual dentro del subsistema.
 */
export function lookupDTC(code: string, vehicleBrand?: string): DTCFaultCode | null {
  const cleanCode = code.trim().toUpperCase();

  // 1. Si el código es específico de fabricante o el usuario tiene una marca activa en su Garage,
  // consulta primero el descifrador de la marca (ej. Ford, VW, Chevrolet, Fiat, Renault, etc.)
  const manufacturerMatch = lookupManufacturerDTC(cleanCode, vehicleBrand);
  if (manufacturerMatch) {
    return {
      ...manufacturerMatch,
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  // 2. Si existe en la base universal SAE con detalle profundo, lo devuelve
  const exactMatch = UNIVERSAL_P_CODES[cleanCode];
  if (exactMatch) {
    return {
      ...exactMatch,
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  // 2. Decodificador normativo SAE J2012 para cualquiera de los más de 1.000 códigos universales 'P'
  if (/^P[0-3][0-9A-Fa-f]{3}$/.test(cleanCode)) {
    const isUniversal = cleanCode[1] === '0' || cleanCode[1] === '2';
    const subsystemDigit = cleanCode[2].toUpperCase();

    let category: DTCFaultCode['category'] = 'Combustión / Encendido';
    let subsystemName = 'Sistema de Propulsión';
    let defaultSymptoms: string[] = ['Testigo Check Engine (MIL) activado en tablero'];
    let defaultCauses: string[] = ['Sensor o actuador fuera de rango eléctrico', 'Falso contacto en ficha o mazo de cables'];
    let defaultAction = 'Escanear parámetros en vivo (Live Data) con escáner ELM327 y contrastar con manual de taller.';
    let repairCost = '$20.000 - $65.000 ARS';
    let severity: DTCFaultCode['severity'] = 'warning';

    switch (subsystemDigit) {
      case '0':
        category = 'Inyección / Aire';
        subsystemName = 'Medición de Combustible, Admisión de Aire y Sistema de Control de Emisiones Auxiliares';
        defaultSymptoms = ['Consumo desmedido de combustible', 'Ralentí inestable o vibraciones', 'Pérdida de pique'];
        defaultCauses = ['Caudalímetro (MAF) o sensor MAP sucio', 'Filtro de aire tapado', 'Inyector con goteo o regulador de presión con fuga'];
        defaultAction = 'Verificar caudal de aire en admisión, estado del filtro y fugas de vacío.';
        break;

      case '1':
        category = 'Inyección / Aire';
        subsystemName = 'Dosificación de Combustible y Medición de Aire (Inyectores, MAP, MAF, TPS)';
        defaultSymptoms = ['Aceleración con titubeos o ahogos', 'Humo negro o blanco en el escape', 'El motor se apaga al frenar'];
        defaultCauses = ['Inyector sucio o en corto', 'Sensor de temperatura de refrigerante (ECT) descalibrado', 'Bomba de nafta con baja presión'];
        defaultAction = 'Medir presión de riel de inyección y revisar compensación de combustible (STFT/LTFT).';
        break;

      case '2':
        category = 'Inyección / Aire';
        subsystemName = 'Circuito de Inyección y Dosificación de Combustible';
        defaultSymptoms = ['Dificultad de arranque matutino', 'Olor fuerte a nafta sin quemar', 'Ralentí disparado'];
        defaultCauses = ['Inyector trabado abierto o cerrado', 'Fuga en el regulador de presión de combustible', 'Filtro de nafta tapado'];
        defaultAction = 'Limpiar inyectores en batea por ultrasonido y medir caudales en probeta.';
        break;

      case '3':
        category = 'Combustión / Encendido';
        subsystemName = 'Sistema de Encendido, Bobinas, Bujías y Detección de Detonación (Misfire)';
        severity = 'critical';
        defaultSymptoms = ['Tirones severos al acelerar', 'Pérdida notoria de potencia (motor "en 3 cilindros")', 'Check Engine parpadeante'];
        defaultCauses = ['Bujías con electrodo desgastado', 'Bobina de ignición con fuga de chispa a masa', 'Sensor de cigüeñal (CKP) o árbol de levas (CMP) defectuoso'];
        defaultAction = 'Inspeccionar bujías y probar bobinas con osciloscopio o chispero automotriz.';
        repairCost = '$22.000 - $70.000 ARS';
        break;

      case '4':
        category = 'Emisiones / Catalizador';
        subsystemName = 'Control de Emisiones Auxiliares (Catalizador, Cánister EVAP, EGR, Inyección de Aire Secundario)';
        severity = 'advisory';
        defaultSymptoms = ['Luz Check Engine encendida sin falla perceptible de manejo', 'Rechazo en inspección vehicular técnica (VTV)', 'Olor a nafta cerca del tanque'];
        defaultCauses = ['Convertidor catalítico degradado', 'Tapa del tanque mal enroscada', 'Válvula de purga EVAP atascada'];
        defaultAction = 'Revisar hermeticidad del tanque de combustible y lecturas de sonda lambda posterior al catalizador.';
        repairCost = '$15.000 - $80.000 ARS';
        break;

      case '5':
        category = 'Transmisión / Eléctrico';
        subsystemName = 'Control de Velocidad del Vehículo, Ralentí y Entradas Auxiliares (VSS, IAC, Batería)';
        defaultSymptoms = ['Velocímetro que cae a cero en marcha', 'El motor se acelera solo o se apaga al embragar', 'Dirección asistida más dura'];
        defaultCauses = ['Sensor de velocidad en caja de cambios (VSS)', 'Válvula de ralentí (IAC) carbonizada', 'Voltaje de alternador fuera de rango'];
        defaultAction = 'Limpiar cuerpo mariposa / válvula paso a paso y controlar voltaje con voltímetro.';
        break;

      case '6':
        category = 'Transmisión / Eléctrico';
        subsystemName = 'Módulos de Control Internos de la Computadora (ECU/PCM) y Salidas Auxiliares';
        severity = 'critical';
        defaultSymptoms = ['Paradas imprevistas del motor', 'Testigos de tablero parpadeando en cascada', 'Falla de activación de relés principales'];
        defaultCauses = ['Caída de tensión severa en arranque', 'Falso contacto en masas de chasis', 'Falla en memoria ROM/RAM de la ECU'];
        defaultAction = 'Revisar masa principal de motor y chasis; comprobar que el alternador no genere picos de más de 14.8V.';
        repairCost = '$30.000 - $110.000 ARS';
        break;

      case '7':
      case '8':
      case '9':
        category = 'Transmisión / Eléctrico';
        subsystemName = 'Transmisión Automática, Convertidor de Par y Sensores de Caja';
        defaultSymptoms = ['Cambios de marcha bruscos con tirones', 'La caja no pasa de 3ra marcha (modo limp)', 'Patinamiento al salir'];
        defaultCauses = ['Fluido ATF quemado o bajo nivel', 'Solenoide de cambio trabado por viruta', 'Sensor de velocidad de entrada/salida de caja'];
        defaultAction = 'Comprobar nivel y color de aceite de caja; escanear el módulo de transmisión TCM.';
        repairCost = '$35.000 - $130.000 ARS';
        break;
    }

    const typeDesc = isUniversal
      ? 'Código universal SAE/ISO estandarizado (aplica a todas las marcas)'
      : 'Código extendido controlado por el fabricante del vehículo';

    return {
      code: cleanCode,
      title: `Falla en ${subsystemName} (${cleanCode})`,
      category,
      severity,
      milStatus: true,
      description: `Código detectado por la norma universal OBD-II (SAE J2012) perteneciente al subsistema: ${subsystemName}. ${typeDesc}. Indica que la computadora detectó lecturas anómalas o fuera de tolerancia durante al menos dos ciclos consecutivos de manejo.`,
      symptoms: defaultSymptoms,
      possibleCauses: defaultCauses,
      recommendedAction: defaultAction,
      estimatedRepairCostRange: repairCost,
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  // 3. Decodificador para códigos de Chasis (C: Frenos, ABS, ESP, Dirección asistida)
  if (/^C[0-3][0-9A-Fa-f]{3}$/.test(cleanCode)) {
    const isUniversal = cleanCode[1] === '0';
    return {
      code: cleanCode,
      title: `Falla de Chasis / Sistema de Frenos ABS (${cleanCode})`,
      category: 'Frenos / Chasis (ABS)',
      severity: 'warning',
      milStatus: true,
      description: `Código OBD-II ${isUniversal ? 'universal SAE' : 'específico del fabricante'} correspondiente al sistema de chasis, control de estabilidad ESP, antibloqueo de frenos ABS o dirección asistida.`,
      symptoms: [
        'Testigo de advertencia de ABS, control de estabilidad (ESP) o frenos encendido en el tablero',
        'Asistencia antibloqueo inhabilitada preventivamente por seguridad',
        'Comportamiento modificado de la dirección o asistencia hidráulica/eléctrica'
      ],
      possibleCauses: [
        'Sensor de velocidad de giro de rueda sucio con grasa o ferodo de pastilla',
        'Nivel de líquido de frenos bajo en el depósito o flotante descalibrado',
        'Falso contacto en la ficha eléctrica del módulo hidráulico de frenos'
      ],
      recommendedAction: 'Comprobar nivel de líquido de frenos en depósito, estado de pastillas y cables de sensores de rueda.',
      estimatedRepairCostRange: '$18.000 - $65.000 ARS',
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  // 4. Decodificador para códigos de Red CAN-Bus y Comunicación (U)
  if (/^U[0-3][0-9A-Fa-f]{3}$/.test(cleanCode)) {
    const isUniversal = cleanCode[1] === '0';
    return {
      code: cleanCode,
      title: `Falla de Comunicación en Red CAN-Bus (${cleanCode})`,
      category: 'Red de Comunicación CAN',
      severity: 'critical',
      milStatus: true,
      description: `Código OBD-II ${isUniversal ? 'universal SAE' : 'específico de marca'} indicando pérdida de paquetes de datos o falta de respuesta entre módulos electrónicos del vehículo a través del bus CAN.`,
      symptoms: [
        'Múltiples testigos del cuadro de instrumentos encendidos en cascada',
        'Agujas de velocímetro, tacómetro o temperatura congeladas o caídas a cero',
        'Dificultad de arranque o comunicación intermitente con el escáner'
      ],
      possibleCauses: [
        'Caída severa de tensión de la batería en el arranque (batería agotada)',
        'Falso contacto o sulfatación en las masas de chasis y motor',
        'Cables de par trenzado CAN-High / CAN-Low con circuito abierto o en corto'
      ],
      recommendedAction: 'Medir voltaje de batería en reposo y arranque. Verificar integridad de fusibles de confort y red.',
      estimatedRepairCostRange: '$20.000 - $85.000 ARS',
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  // 5. Decodificador para códigos de Carrocería y Seguridad Pasiva (B)
  if (/^B[0-3][0-9A-Fa-f]{3}$/.test(cleanCode)) {
    const isUniversal = cleanCode[1] === '0';
    return {
      code: cleanCode,
      title: `Falla de Módulo de Carrocería / Seguridad (${cleanCode})`,
      category: 'Carrocería / Seguridad',
      severity: 'critical',
      milStatus: true,
      description: `Código OBD-II ${isUniversal ? 'universal SAE' : 'específico del fabricante'} correspondiente al módulo de carrocería (BCM), airbags, pretensores pirotécnicos o climatización.`,
      symptoms: [
        'Testigo de Airbag o confort activado en el instrumental',
        'Sistema de retención suplementaria en modo de prevención',
        'Falla de accionamiento de elementos de confort interior'
      ],
      possibleCauses: [
        'Ficha de airbag bajo el asiento del conductor o pasajero movida o floja',
        'Cinta espiral de volante (clockspring) cortada por giros de dirección',
        'Fusible del módulo de habitáculo'
      ],
      recommendedAction: 'Revisar conectores amarillos de seguridad con la batería desconectada por precaución.',
      estimatedRepairCostRange: '$15.000 - $60.000 ARS',
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  // 6. Decodificador para códigos propietarios Renault Clip (DFxxx)
  if (/^DF[0-9]{3}$/i.test(cleanCode)) {
    const dfMap: Record<string, { title: string; desc: string; cat: DTCFaultCode['category'] }> = {
      DF025: {
        title: 'Renault DF025: Unión Diagnóstico Caja de Precalentamiento',
        desc: 'Falla típica en motores Renault 1.5 dCi (Kangoo, Sandero, Duster). Indica bujías incandescentes quemadas o relé de precalentamiento defectuoso.',
        cat: 'Combustión / Encendido'
      },
      DF053: {
        title: 'Renault DF053: Función de Regulación de Presión de Riel',
        desc: 'La presión en la rampa común de inyección Delphi o Bosch se encuentra fuera de consigna.',
        cat: 'Inyección / Aire'
      },
      DF001: {
        title: 'Renault DF001: Calculador de Inyección / Tensión de Alimentación',
        desc: 'Falla interna en la computadora de inyección de motor o caída abrupta de voltaje en batería.',
        cat: 'Transmisión / Eléctrico'
      }
    };

    const known = dfMap[cleanCode];
    return {
      code: cleanCode,
      title: known ? known.title : `Renault Clip: Código de Falla Propietario (${cleanCode})`,
      category: known ? known.cat : 'Inyección / Aire',
      severity: 'warning',
      milStatus: true,
      description: known
        ? known.desc
        : `Código de diagnóstico propietario de Renault (formato Renault Clip). Corresponde al calculador de inyección o habitáculo.`,
      symptoms: ['Testigo de Service o Espiral encendido en el cuadro', 'Modo degradado de potencia'],
      possibleCauses: ['Falla eléctrica en actuador de inyección Renault', 'Bujía de precalentamiento o sensor de presión'],
      recommendedAction: 'Escanear con protocolo específico Renault o revisar continuidad de arnés de inyección.',
      estimatedRepairCostRange: '$25.000 - $70.000 ARS',
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  // 7. Decodificador para códigos VAG decimales de 5 dígitos (01314, 00532, etc.)
  if (/^[0-9]{5}$/.test(cleanCode)) {
    const vagMap: Record<string, { title: string; desc: string; cat: DTCFaultCode['category'] }> = {
      '01314': {
        title: 'VAG 01314: Unidad de Control del Motor (ECM) - Sin Comunicación',
        desc: 'Muy común en VW Gol, Suran, Bora y Vento. Los módulos de ABS, Airbag o Confort no logran comunicarse con la computadora del motor por el bus CAN.',
        cat: 'Red de Comunicación CAN'
      },
      '00532': {
        title: 'VAG 00532: Tensión de Alimentación B+ - Señal Demasiado Baja',
        desc: 'Caída de voltaje por debajo de 9V en el borne de alimentación principal de la unidad de mando.',
        cat: 'Transmisión / Eléctrico'
      }
    };

    const known = vagMap[cleanCode];
    return {
      code: cleanCode,
      title: known ? known.title : `Volkswagen / Audi (VAG): Código Decimal (${cleanCode})`,
      category: known ? known.cat : 'Transmisión / Eléctrico',
      severity: 'warning',
      milStatus: true,
      description: known
        ? known.desc
        : `Código de formato nativo decimal del grupo VAG (Volkswagen, Audi, SEAT) leído por protocolo KWP1281 / KWP2000.`,
      symptoms: ['Testigo encendido en cuadro', 'Falla de comunicación esporádica'],
      possibleCauses: ['Batería con bajo voltaje', 'Falso contacto en fichas de módulo'],
      recommendedAction: 'Revisar bornes de batería y fusibles principales de motor.',
      estimatedRepairCostRange: '$20.000 - $65.000 ARS',
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  // 8. Código con prefijo automotriz (P, C, B, U) de 5 caracteres no estándar
  if (/^[PCBU][0-9A-Za-z]{4}$/i.test(cleanCode)) {
    const prefix = cleanCode[0].toUpperCase();
    const sysNames: Record<string, string> = {
      P: 'Tren Motriz (Motor y Transmisión)',
      C: 'Chasis (Frenos ABS, Control de Estabilidad, Dirección)',
      B: 'Carrocería (Habitáculo, Airbags, Climatización)',
      U: 'Red de Comunicación y Buses de Datos (CAN / LIN)'
    };
    return {
      code: cleanCode,
      title: `Código Específico del Fabricante (${cleanCode})`,
      category: prefix === 'P' ? 'Combustión / Encendido' : prefix === 'C' ? 'Frenos / Chasis (ABS)' : prefix === 'B' ? 'Carrocería / Seguridad' : 'Red de Comunicación CAN',
      severity: 'warning',
      milStatus: true,
      description: `Código alfanumérico automotriz correspondiente al subsistema de ${sysNames[prefix] || 'Electrónica'}. Pertenece a una sub-familia propietaria del fabricante del vehículo.`,
      symptoms: ['Alerta o testigo visual en el cuadro de instrumentos', 'Parámetro fuera de rango operativo'],
      possibleCauses: ['Sensor o módulo con respuesta fuera de tolerancia', 'Falso contacto en cableado'],
      recommendedAction: 'Consultar el manual técnico de fábrica para el modelo exacto o verificar telemetría en vivo.',
      estimatedRepairCostRange: '$25.000 - $80.000 ARS',
      active: true,
      timestamp: new Date().toISOString()
    };
  }

  return null;
}
