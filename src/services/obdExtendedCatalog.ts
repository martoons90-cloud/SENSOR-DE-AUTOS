import { DTCFaultCode } from '../types/vehicle';

export type DTCExtendedEntry = Omit<DTCFaultCode, 'active' | 'timestamp'>;

/**
 * Catálogo extendido OBD-II procedente de OBDex (CC0):
 * Incluye Códigos C (Frenos, ABS, Líquido de Freno), U (Redes CAN-Bus), B (Carrocería / Airbags) y P2 (Powertrain Moderno).
 */
export const EXTENDED_OBDEX_CODES: Record<string, DTCExtendedEntry> = {
  // ==========================================
  // C0xxx: SISTEMA DE CHASIS, FRENOS, ABS Y ESP
  // ==========================================
  C0049: {
    code: 'C0049',
    title: 'Nivel bajo de líquido de frenos / Circuito del depósito',
    category: 'Frenos / Chasis (ABS)',
    severity: 'critical',
    milStatus: true,
    description: 'El sensor de nivel del depósito de líquido de frenos detectó que el fluido descendió por debajo del límite de seguridad mínimo, o el interruptor del flotante está dañado.',
    symptoms: [
      'Testigo de advertencia de frenos ( ! ) o BRAKE encendido en color rojo',
      'Desactivación preventiva del sistema de control de estabilidad ESP y ABS',
      'Pedal de freno con recorrido más largo o sensación esponjosa en caso de fuga'
    ],
    possibleCauses: [
      'Desgaste pronunciado de pastillas de freno (los pistones quedan afuera y baja el nivel)',
      'Fuga hidráulica en mangueras flexibles de freno, bombines de rueda o cáliper',
      'Pérdida en el bombín o bombín auxiliar de embrague hidráulico (comparte depósito)',
      'Flotante o sensor de nivel trabado en el fondo del depósito'
    ],
    recommendedAction: 'Detener el vehículo y comprobar el nivel en el depósito. Si hay fuga, no conducir. Si las pastillas están gastadas, cambiarlas antes de rellenar.',
    estimatedRepairCostRange: '$18.000 - $65.000 ARS'
  },
  C0031: {
    code: 'C0031',
    title: 'Sensor de velocidad de rueda delantera izquierda - Circuito / Rango',
    category: 'Frenos / Chasis (ABS)',
    severity: 'warning',
    milStatus: true,
    description: 'El sensor inductivo o hall de la rueda delantera izquierda no envía pulsos de velocidad coherentes al módulo ABS.',
    symptoms: [
      'Testigo ABS encendido en el tablero',
      'Control de tracción y estabilidad (ESP/TCS) inoperativo',
      'Activación pulsante errática del pedal de freno a baja velocidad'
    ],
    possibleCauses: [
      'Suciedad o viruta de ferodo adherida al sensor magnético',
      'Cable del sensor mordido o cortado por el movimiento de la rueda',
      'Corona dentada o pista magnética del rodamiento de masa dañada'
    ],
    recommendedAction: 'Limpiar la punta del sensor y medir continuidad del cableado. Reemplazar sensor de rueda si está en circuito abierto.',
    estimatedRepairCostRange: '$22.000 - $55.000 ARS'
  },
  C0034: {
    code: 'C0034',
    title: 'Sensor de velocidad de rueda delantera derecha - Circuito / Rango',
    category: 'Frenos / Chasis (ABS)',
    severity: 'warning',
    milStatus: true,
    description: 'Falla eléctrica o inconsistencia de señal en el sensor de velocidad ABS de la rueda delantera derecha.',
    symptoms: ['Testigo de ABS y ESP activados', 'Desactivación del asistente de arranque en pendientes'],
    possibleCauses: ['Sensor de rueda desconectado o en corto', 'Cable cortado', 'Rodamiento instalado al revés sin pista magnética'],
    recommendedAction: 'Escanear velocidad de cada rueda en vivo con el ELM327 y reemplazar sensor dañado.',
    estimatedRepairCostRange: '$22.000 - $55.000 ARS'
  },
  C0037: {
    code: 'C0037',
    title: 'Sensor de velocidad de rueda trasera izquierda - Circuito / Rango',
    category: 'Frenos / Chasis (ABS)',
    severity: 'warning',
    milStatus: true,
    description: 'Señal ausente o errática en el sensor ABS de la rueda trasera izquierda.',
    symptoms: ['Testigo ABS encendido', 'Freno convencional operativo pero sin antibloqueo'],
    possibleCauses: ['Sensor sucio con lodo o grasa', 'Ficha sulfatada por agua de ruta', 'Cable dañado'],
    recommendedAction: 'Inspeccionar cableado en el puente trasero y limpiar conector.',
    estimatedRepairCostRange: '$20.000 - $50.000 ARS'
  },
  C0040: {
    code: 'C0040',
    title: 'Sensor de velocidad de rueda trasera derecha - Circuito / Rango',
    category: 'Frenos / Chasis (ABS)',
    severity: 'warning',
    milStatus: true,
    description: 'Lectura fuera de tolerancia en el sensor de rueda trasera derecha del módulo antibloqueo.',
    symptoms: ['Testigos ABS y derrape encendidos en el tablero'],
    possibleCauses: ['Falla interna del captor magnético', 'Maza de rueda con holgura'],
    recommendedAction: 'Comprobar juego en rodamiento de maza y sustituir sensor.',
    estimatedRepairCostRange: '$20.000 - $50.000 ARS'
  },
  C0051: {
    code: 'C0051',
    title: 'Sensor de posición del ángulo de la dirección (SAS)',
    category: 'Frenos / Chasis (ABS)',
    severity: 'warning',
    milStatus: true,
    description: 'El sensor de ángulo de volante (SAS) descalibrado no informa con exactitud hacia dónde apunta la dirección al módulo ESP.',
    symptoms: ['Luz de ESP/Control de estabilidad encendida fija', 'Dirección asistida eléctrica con asistencia reducida'],
    possibleCauses: ['Alineación del tren delantero realizada sin calibrar el sensor', 'Desconexión de batería prolongada', 'Sensor SAS defectuoso en columna'],
    recommendedAction: 'Efectuar calibración y puesta a cero del ángulo de dirección con escáner de diagnóstico.',
    estimatedRepairCostRange: '$15.000 - $45.000 ARS'
  },
  C0242: {
    code: 'C0242',
    title: 'Módulo PCM solicitó reducción de torque por ESP/ABS',
    category: 'Frenos / Chasis (ABS)',
    severity: 'advisory',
    milStatus: false,
    description: 'El módulo de control de estabilidad solicitó a la computadora de motor cortar aceleración para recuperar tracción.',
    symptoms: ['Corte momentáneo de potencia en curvas resbaladizas', 'Parpadeo de luz de tracción'],
    possibleCauses: ['Pérdida momentánea de adherencia en calzada húmeda', 'Patadón de acelerador en barro o ripio'],
    recommendedAction: 'Comportamiento normal del sistema de seguridad activa; borrar código de historial.',
    estimatedRepairCostRange: '$0 ARS (Intervención de seguridad normal)'
  },
  C0561: {
    code: 'C0561',
    title: 'Datos de control del sistema de estabilidad / tracción deshabilitados',
    category: 'Frenos / Chasis (ABS)',
    severity: 'warning',
    milStatus: true,
    description: 'El módulo ABS/ESP deshabilitó el control de tracción porque la ECU del motor tiene una falla activa de inyección o encendido.',
    symptoms: ['Testigo de motor Check Engine y testigo de ESP encendidos al mismo tiempo', 'Pérdida de tracción'],
    possibleCauses: ['Falla previa en motor (ej. misfire P0300 o sensor MAF P0101)', 'Falta de comunicación de par motor'],
    recommendedAction: 'Corregir primero la falla del motor (códigos P); el sistema ESP volverá a funcionar solo.',
    estimatedRepairCostRange: 'Depende de la falla de motor asociada'
  },

  // ==========================================
  // U0xxx: REDES CAN-BUS Y COMUNICACIÓN ENTRE MÓDULOS
  // ==========================================
  U0100: {
    code: 'U0100',
    title: 'Pérdida de comunicación con el Módulo de Control de Motor (ECM/PCM)',
    category: 'Red de Comunicación CAN',
    severity: 'critical',
    milStatus: true,
    description: 'Otras computadoras del vehículo (tablero, ABS, caja de cambios) dejaron de recibir los mensajes de red del controlador principal del motor.',
    symptoms: [
      'El motor no arranca o se detiene de golpe en marcha',
      'Múltiples testigos del tablero encendidos simultáneamente',
      'El velocímetro y cuentavueltas caen a cero',
      'El escáner no logra conectar con la ECU del motor'
    ],
    possibleCauses: [
      'Falta de alimentación positiva (+12V) o masa principal en la ficha de la ECU',
      'Relé principal de inyección (Main Relay) o fusible quemado',
      'Cables de la red CAN Bus (CAN-High o CAN-Low) cortados o en cortocircuito',
      'Falla interna o daño por agua en la computadora de motor'
    ],
    recommendedAction: 'Comprobar fusibles de gestión de motor y relé principal. Medir resistencia de 60 ohms entre pines 6 y 14 de la ficha OBD-II.',
    estimatedRepairCostRange: '$25.000 - $120.000 ARS'
  },
  U0101: {
    code: 'U0101',
    title: 'Pérdida de comunicación con el Módulo de Control de Transmisión (TCM)',
    category: 'Red de Comunicación CAN',
    severity: 'critical',
    milStatus: true,
    description: 'La computadora de la caja de cambios automática no responde en el bus de datos CAN.',
    symptoms: [
      'Caja trabada en 3ra marcha (modo de emergencia de transmisión)',
      'Indicador de marcha (P-R-N-D) parpadea o desaparece del tablero',
      'Golpe fuerte al colocar reversa o Drive'
    ],
    possibleCauses: ['Ficha de la caja con aceite o agua', 'Fusible del módulo TCM quemado', 'Falso contacto en mazo de cables'],
    recommendedAction: 'Revisar la ficha eléctrica que ingresa a la caja automática y el fusible del TCM.',
    estimatedRepairCostRange: '$25.000 - $90.000 ARS'
  },
  U0121: {
    code: 'U0121',
    title: 'Pérdida de comunicación con el Módulo del Sistema de Frenos ABS',
    category: 'Red de Comunicación CAN',
    severity: 'warning',
    milStatus: true,
    description: 'La ECU de motor y el tablero no reciben datos del módulo hidráulico del ABS.',
    symptoms: [
      'Luces de ABS, Freno de Mano y ESP encendidas fijas',
      'El velocímetro no marca velocidad (si toma la señal del ABS)'
    ],
    possibleCauses: ['Fusible maxi de 40A o 50A del módulo ABS cortado', 'Masa del cuerpo de bomba ABS floja', 'Falla electrónica en la placa del ABS'],
    recommendedAction: 'Medir voltajes de alimentación directa de batería en la ficha del ABS.',
    estimatedRepairCostRange: '$20.000 - $75.000 ARS'
  },
  U0140: {
    code: 'U0140',
    title: 'Pérdida de comunicación con la Computadora de Carrocería (BCM)',
    category: 'Red de Comunicación CAN',
    severity: 'warning',
    milStatus: true,
    description: 'Falta de paquetes de datos del módulo de confort y carrocería que gestiona luces, llaves y seguros.',
    symptoms: ['Levantavidrios o cierre centralizado inoperativo', 'Luces de habitáculo no responden', 'Alarma disparada'],
    possibleCauses: ['Fusible general de BCM', 'Entrada de humedad por desagües del parabrisas tapados', 'Ficha del módulo de habitáculo descalzada'],
    recommendedAction: 'Controlar que no haya filtración de agua sobre la fusilera interior BCM.',
    estimatedRepairCostRange: '$18.000 - $60.000 ARS'
  },
  U0155: {
    code: 'U0155',
    title: 'Pérdida de comunicación con el Cuadro de Instrumentos / Tablero (IPC)',
    category: 'Red de Comunicación CAN',
    severity: 'warning',
    milStatus: true,
    description: 'El tablero de instrumentos no se comunica con los demás módulos del auto a través del CAN-Bus.',
    symptoms: ['Agujas de velocidad y RPM congeladas', 'Pantalla central del tablero apagada o titilando'],
    possibleCauses: ['Ficha trasera del instrumental floja', 'Soldadura agrietada en la placa del tablero', 'Batería con voltaje muy bajo'],
    recommendedAction: 'Desmontar instrumental y verificar soldaduras de los pines de conexión CAN.',
    estimatedRepairCostRange: '$20.000 - $65.000 ARS'
  },
  U0401: {
    code: 'U0401',
    title: 'Datos inválidos recibidos del Módulo de Control de Motor (ECM/PCM)',
    category: 'Red de Comunicación CAN',
    severity: 'advisory',
    milStatus: false,
    description: 'El módulo ABS o la caja de cambios recibieron datos con formato erróneo desde el motor.',
    symptoms: ['Comportamiento tosco en el paso de cambios'],
    possibleCauses: ['Interferencias electromagnéticas por bujías sin resistencia antiparasitaria', 'Ruido en la red CAN'],
    recommendedAction: 'Controlar estado de bujías y masas de motor.',
    estimatedRepairCostRange: '$12.000 - $35.000 ARS'
  },

  // ==========================================
  // B0xxx: CARROCERÍA, AIRBAGS Y SEGURIDAD
  // ==========================================
  B0001: {
    code: 'B0001',
    title: 'Circuito del detonador del Airbag Frontal del Conductor',
    category: 'Carrocería / Seguridad',
    severity: 'critical',
    milStatus: true,
    description: 'La computadora de airbag detectó resistencia eléctrica fuera de tolerancia (abierto o en corto) en el airbag del volante.',
    symptoms: ['Testigo de Airbag (hombre con globo) encendido fijo en el tablero', 'El airbag no se desplegará en caso de colisión'],
    possibleCauses: [
      'Cinta o espiral de volante (Clockspring) cortada por giros de dirección',
      'Ficha amarilla debajo de la columna de volante desconectada',
      'Detonador del airbag dañado'
    ],
    recommendedAction: 'Revisar la cinta espiral del volante con desconexión previa de la batería (esperar 10 min por seguridad).',
    estimatedRepairCostRange: '$25.000 - $70.000 ARS'
  },
  B0010: {
    code: 'B0010',
    title: 'Circuito del detonador del Airbag Frontal del Acompañante',
    category: 'Carrocería / Seguridad',
    severity: 'critical',
    milStatus: true,
    description: 'Falla en el circuito pirotécnico del airbag del pasajero en el torpedo o guantera.',
    symptoms: ['Luz de advertencia de airbag encendida en el instrumental'],
    possibleCauses: ['Ficha amarilla detrás de guantera floja', 'Resistencia interna del airbag alterada'],
    recommendedAction: 'Inspeccionar cableado de airbag de acompañante y comprobar conector de seguridad.',
    estimatedRepairCostRange: '$22.000 - $65.000 ARS'
  },
  B0020: {
    code: 'B0020',
    title: 'Circuito del Airbag Lateral Izquierdo / Cortina',
    category: 'Carrocería / Seguridad',
    severity: 'critical',
    milStatus: true,
    description: 'Resistencia eléctrica alta o baja en el airbag lateral del asiento del conductor.',
    symptoms: ['Luz de airbag encendida al mover o reclinar la butaca del conductor'],
    possibleCauses: ['Ficha debajo del asiento del conductor pateada o tironeada por objetos', 'Cableado rozado con el riel'],
    recommendedAction: 'Asegurar con precinto la ficha amarilla ubicada debajo de la butaca del conductor.',
    estimatedRepairCostRange: '$10.000 - $30.000 ARS'
  },
  B0080: {
    code: 'B0080',
    title: 'Sensor de impacto frontal (Crash Sensor) - Falla de circuito',
    category: 'Carrocería / Seguridad',
    severity: 'critical',
    milStatus: true,
    description: 'El sensor de desaceleración frontal montado en el travesaño del paragolpes delantero no responde.',
    symptoms: ['Testigo de Airbag encendido', 'Sistema de retención suplementaria en modo inhabilitado'],
    possibleCauses: ['Golpe en el frente del auto o estacionamiento', 'Humedad o corrosión en el conector frontal', 'Sensor partido'],
    recommendedAction: 'Inspeccionar el sensor de impacto ubicado detrás de la parrilla delantera.',
    estimatedRepairCostRange: '$28.000 - $65.000 ARS'
  },

  // ==========================================
  // P2xxx: MOTORES MODERNOS, TURBO, DPF Y SENSORES
  // ==========================================
  P2002: {
    code: 'P2002',
    title: 'Eficiencia del Filtro de Partículas Diésel (DPF) por debajo del umbral',
    category: 'Emisiones / Catalizador',
    severity: 'critical',
    milStatus: true,
    description: 'El sensor de presión diferencial del DPF detectó saturación excesiva de hollín o rotura interna del monolito cerámico.',
    symptoms: [
      'Pérdida drástica de potencia (modo de emergencia de motor)',
      'Humo blanco o grisáceo por regeneraciones fallidas',
      'Testigo de espiral o filtro DPF parpadeando'
    ],
    possibleCauses: [
      'Trayectos cortos urbanos que no permiten regenerar a más de 600°C',
      'Sensor de presión diferencial de gases tapado con hollín',
      'Uso de gasoil común en lugar de diésel Grado 3 (bajo azufre)'
    ],
    recommendedAction: 'Hacer viaje de 25 minutos en autopista en 4ta marcha a 2.500 RPM o regeneración forzada con escáner.',
    estimatedRepairCostRange: '$35.000 - $150.000 ARS'
  },
  P2187: {
    code: 'P2187',
    title: 'Sistema de combustible demasiado pobre en ralentí (Banco 1)',
    category: 'Inyección / Aire',
    severity: 'warning',
    milStatus: true,
    description: 'La relación estequiométrica en ralentí tiene exceso de aire o falta de nafta; la ECU agotó su compensación positiva.',
    symptoms: ['Ralentí inestable o que sube y baja', 'El motor se sacude en semáforos', 'Check Engine encendido'],
    possibleCauses: ['Fuga de vacío en mangueras del múltiple', 'Válvula PCV de ventilación de cárter rota', 'Retén de bancada con entrada de aire'],
    recommendedAction: 'Realizar prueba de humo (Smoke Test) en la admisión para hallar la fuga de vacío.',
    estimatedRepairCostRange: '$18.000 - $55.000 ARS'
  },
  P2293: {
    code: 'P2293',
    title: 'Rendimiento mecánico del regulador de presión de combustible (Bomba de alta presión HPFP)',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'En motores de inyección directa (TSI, TFSI, EcoBoost, GDI), la bomba mecánica de alta no alcanza los 150 a 200 bares requeridos.',
    symptoms: ['Cortes de inyección y tironeo violento a más de 3.500 RPM', 'Falta total de aceleración en sobrepasos'],
    possibleCauses: ['Válvula solenoide de la bomba de alta atascada', 'Empujador/vaso del árbol de levas gastado', 'Filtro de baja presión sucio'],
    recommendedAction: 'Revisar vaso empujador del árbol de levas y medir presión de rampa con escáner en tiempo real.',
    estimatedRepairCostRange: '$45.000 - $130.000 ARS'
  },
  P250E: {
    code: 'P250E',
    title: 'Circuito del Sensor de Nivel de Aceite de Motor - Intermitente / Errático',
    category: 'Refrigeración / Sensor',
    severity: 'warning',
    milStatus: false,
    description: 'La computadora no recibe lectura estable del sensor térmico/capacitivo instalado en el cárter.',
    symptoms: ['Aviso de revisar nivel de aceite en la pantalla del tablero con nivel correcto en varilla'],
    possibleCauses: ['Ficha del sensor en el fondo del cárter sulfatada o con aceite', 'Sensor de nivel en cárter degradado'],
    recommendedAction: 'Limpiar conector inferior del cárter y verificar continuidad.',
    estimatedRepairCostRange: '$15.000 - $48.000 ARS'
  },
  P250F: {
    code: 'P250F',
    title: 'Nivel de Aceite de Motor Demasiado Bajo (Engine Oil Level Too Low)',
    category: 'Refrigeración / Sensor',
    severity: 'critical',
    milStatus: true,
    description: 'El sensor de nivel electrónico del cárter midió que el volumen de lubricante está por debajo del límite seguro.',
    symptoms: [
      'Alerta sonora y mensaje "Nivel de aceite bajo - Agregue 1L" en pantalla del tablero',
      'Testigo de aceitera amarilla en el cuadro de instrumentos',
      'Riesgo de que la bomba chupe aire en curvas'
    ],
    possibleCauses: ['Consumo de aceite por guías de válvula o aros', 'Fuga por retén de cigüeñal o junta de cárter', 'Filtro flojo'],
    recommendedAction: 'Detener el motor en superficie plana, medir con varilla y reponer aceite de la viscosidad adecuada de inmediato.',
    estimatedRepairCostRange: '$12.000 - $35.000 ARS'
  },
  P2563: {
    code: 'P2563',
    title: 'Sensor de posición de control de sobrealimentación del Turbocompresor (VGT)',
    category: 'Inyección / Aire',
    severity: 'critical',
    milStatus: true,
    description: 'El sensor de posición del actuador electrónico o geometría variable del turbo informa descalibración respecto a la presión pedida.',
    symptoms: ['Falta notable de reacción del turbo (turbo lag excesivo)', 'Silbido anormal', 'Modo de emergencia'],
    possibleCauses: ['Álaves de geometría variable con carbonilla trabada', 'Vástago del pulmón de vacío doblado', 'Actuador electrónico desgastado'],
    recommendedAction: 'Comprobar movimiento manual del vástago de la geometría variable y limpiar carbonilla del caracol de escape.',
    estimatedRepairCostRange: '$35.000 - $110.000 ARS'
  }
};
