import { DTCFaultCode } from '../types/vehicle';

export interface ManufacturerDTCEntry extends Omit<DTCFaultCode, 'active' | 'timestamp'> {
  brand: 'Ford' | 'Volkswagen' | 'Chevrolet' | 'Fiat' | 'Renault' | 'Peugeot' | 'Citroën' | 'Toyota' | 'Nissan' | 'Universal';
}

/**
 * Catálogo especializado de códigos específicos de fabricante (Manufacturer-Specific P1xxx, U1xxx, etc.)
 * enfocado en las plataformas vehiculares más masivas de Argentina y Mercosur.
 */
export const MANUFACTURER_DTC_CATALOG: Record<string, Record<string, ManufacturerDTCEntry>> = {
  Ford: {
    P1000: {
      code: 'P1000',
      brand: 'Ford',
      title: 'Ford: Ciclo de Conducción de Monitores OBD-II No Completado',
      category: 'Emisiones / Catalizador',
      severity: 'advisory',
      milStatus: false,
      description: 'El módulo PCM de Ford no ha completado el ciclo completo de autodiagnóstico de todos los monitores de emisiones (catalizador, sonda lambda, EVAP) tras un borrado de fallas o desconexión de batería.',
      symptoms: ['No hay fallas perceptibles en el manejo', 'Luz Check Engine apagada', 'Rechazo en inspección vehicular (VTV) por monitores incompletos'],
      possibleCauses: ['Se borraron los códigos DTC recientemente', 'La batería fue desconectada o se agotó', 'No se ha realizado el ciclo de manejo urbano y de ruta requerido'],
      recommendedAction: 'Realizar un ciclo de manejo mixto de 50-80 km (incluyendo tramo de velocidad constante a 80-100 km/h y desaceleración sin frenar) para que la PCM auto-calibre los monitores.',
      estimatedRepairCostRange: '$0 ARS (Se soluciona conduciendo)'
    },
    P1131: {
      code: 'P1131',
      brand: 'Ford',
      title: 'Ford: Sensor de Oxígeno Banco 1 Sensor 1 - Falta de Conmutación (Mezcla Pobre)',
      category: 'Inyección / Aire',
      severity: 'warning',
      milStatus: true,
      description: 'La PCM de Ford detectó que la señal de la sonda lambda previa no oscila normalmente y se queda clavada en voltaje bajo, indicando mezcla permanentemente pobre.',
      symptoms: ['Pérdida de potencia en aceleración', 'Consumo irregular', 'Ralentí áspero'],
      possibleCauses: ['Chupada de aire por manguera de vacío o junta de admisión', 'Baja presión en riel de combustible', 'Sonda lambda agotada o contaminada'],
      recommendedAction: 'Verificar con máquina de humo fugas de vacío en admisión; medir presión de bomba de nafta y verificar tensión de la sonda lambda en vivo.',
      estimatedRepairCostRange: '$35.000 - $85.000 ARS'
    },
    P1151: {
      code: 'P1151',
      brand: 'Ford',
      title: 'Ford: Sensor de Oxígeno Banco 2 Sensor 1 - Falta de Conmutación (Mezcla Pobre)',
      category: 'Inyección / Aire',
      severity: 'warning',
      milStatus: true,
      description: 'En motores en V o con doble múltiple de escape de Ford, el sensor upstream del Banco 2 indica mezcla pobre sin alternancia de ciclo cerrado.',
      symptoms: ['Leve pérdida de rendimiento', 'Emisiones elevadas'],
      possibleCauses: ['Entrada de aire no medida en múltiple de admisión', 'Inyector obstruido en Banco 2', 'Sensor de O2 defectuoso'],
      recommendedAction: 'Controlar juntas del múltiple de admisión e inyectores del Banco 2.',
      estimatedRepairCostRange: '$35.000 - $90.000 ARS'
    },
    P1233: {
      code: 'P1233',
      brand: 'Ford',
      title: 'Ford: Módulo FPDM de Bomba de Nafta Fuera de Línea / Sin Señal',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'La PCM no recibe la señal de monitoreo del Módulo de Control de Bomba de Combustible (FPDM - Fuel Pump Driver Module). En muchos Ford el motor se detiene o no arranca.',
      symptoms: ['El motor gira pero no arranca por falta total de nafta', 'Parada repentina del motor en marcha'],
      possibleCauses: ['Ficha o masa del módulo FPDM sulfatada/suelta', 'Interruptor inercial de corte de combustible activado', 'Módulo FPDM quemado'],
      recommendedAction: 'Revisar botón de corte inercial de combustible; inspeccionar ficha y alimentación de 12V del módulo FPDM (debajo del asiento trasero o baúl).',
      estimatedRepairCostRange: '$40.000 - $120.000 ARS'
    },
    P1450: {
      code: 'P1450',
      brand: 'Ford',
      title: 'Ford: Incapaz de Purgar Vacío del Tanque de Combustible (Válvula EVAP Trabada)',
      category: 'Emisiones / Catalizador',
      severity: 'warning',
      milStatus: true,
      description: 'Falla muy común y característica en Ford Focus MK3, Fiesta Kinetic y EcoSport. La válvula de purga del cánister (EVAP) queda atascada mecánicamente abierta, succionando continuamente vapores y generando una depresión excesiva en el tanque de combustible.',
      symptoms: [
        'Dificultad evidente de arranque inmediatamente después de cargar nafta en la estación de servicio',
        'Ruido de chasquido o colapso metálico/plástico proveniente del tanque de nafta al apagar el motor',
        'Ralentí oscilante o vibraciones a bajas revoluciones'
      ],
      possibleCauses: [
        'Electroválvula de purga de cánister en el vano motor atascada en posición abierta',
        'Sensor de presión del tanque de combustible (FTP) dañado'
      ],
      recommendedAction: 'Reemplazar la electroválvula de purga del cánister (ubicada sobre el múltiple de admisión). Verificar que el tanque no haya sufrido deformación por vacío.',
      estimatedRepairCostRange: '$45.000 - $95.000 ARS'
    },
    P1632: {
      code: 'P1632',
      brand: 'Ford',
      title: 'Ford: Sistema de Carga Inteligente (Smart Charge) - Falla de Sensor / Alternador',
      category: 'Transmisión / Eléctrico',
      severity: 'warning',
      milStatus: true,
      description: 'El sistema Smart Charge de Ford modula el voltaje del alternador (13.2V a 15.0V) según la temperatura de batería. Este código indica interrupción de la comunicación LIN/PWM entre la PCM y el regulador de voltaje.',
      symptoms: ['Testigo de batería encendido en el tablero intermitentemente', 'Luces delanteras que parpadean levemente'],
      possibleCauses: ['Cable azul o rojo de señal Smart Charge cortado en la ficha del alternador', 'Regulador de alternador genérico colocado sin soporte para PCM Ford', 'Batería de tipo incorrecto (debe ser EFB/Plata-Calcio)'],
      recommendedAction: 'Verificar la ficha de 3 pines del alternador (cableado susceptible a cortarse por vibración). Asegurar regulador original compatible con PCM.',
      estimatedRepairCostRange: '$30.000 - $95.000 ARS'
    },
    P2832: {
      code: 'P2832',
      brand: 'Ford',
      title: 'Ford: Horquilla de Cambio "A" de Transmisión Powershift DPS6 - Rango / Rendimiento',
      category: 'Transmisión / Eléctrico',
      severity: 'critical',
      milStatus: true,
      description: 'Código específico de la transmisión automática Powershift DPS6 de Ford (Focus MK3 / Fiesta Kinetic / EcoSport). El actuador o la horquilla A (marchas impares 1, 3, 5 y reversa) presenta resistencia mecánica o atascamiento.',
      symptoms: ['Mensaje "Transmisión averiada" en el display', 'El auto se queda sin tracción o no engrana 1ra ni reversa', 'Tirones severos al salir de parado'],
      possibleCauses: ['Horquilla de embrague A oxidada o con rulemán de empuje engranado por entrada de agua/polvo', 'Actuador electromecánico A defectuoso', 'Módulo TCM con fallas de soldadura interna'],
      recommendedAction: 'Realizar prueba de actuadores con escáner; si los motores intercambiados responden, desmontar caja para reemplazar kit de horquillas y embrague doble LUK.',
      estimatedRepairCostRange: '$180.000 - $450.000 ARS'
    },
    P2837: {
      code: 'P2837',
      brand: 'Ford',
      title: 'Ford: Horquilla de Cambio "B" de Transmisión Powershift DPS6 - Rango / Rendimiento',
      category: 'Transmisión / Eléctrico',
      severity: 'critical',
      milStatus: true,
      description: 'Falla en el mecanismo de la horquilla B (marchas pares 2, 4 y 6) en caja Powershift de Ford.',
      symptoms: ['No entran los cambios pares (el auto salta de 1ra a 3ra)', 'Alarma de transmisión caliente'],
      possibleCauses: ['Horquilla B trabada', 'Motor actuador B defectuoso'],
      recommendedAction: 'Inspeccionar motor de accionamiento B en la carcasa de caja y reprogramar puntos de acoplamiento.',
      estimatedRepairCostRange: '$180.000 - $450.000 ARS'
    },
    U1900: {
      code: 'U1900',
      brand: 'Ford',
      title: 'Ford: Falla de Comunicación en Bus CAN (Red de Alta Velocidad HS-CAN)',
      category: 'Red de Comunicación CAN',
      severity: 'critical',
      milStatus: true,
      description: 'Uno de los códigos más célebres de Ford (Focus MK2 y MK3). Se produce por microfisuras en las soldaduras de la ficha del cuadro de instrumentos (Cluster IC), lo que interrumpe la comunicación entre la PCM y el inmovilizador.',
      symptoms: [
        'El auto gira pero no arranca y parpadea el testigo de inmovilizador/candado',
        'Golpear suavemente la visera del tablero a veces hace que arranque',
        'Múltiples leyendas de advertencia en el display (Falla motor, freno, etc.)'
      ],
      possibleCauses: [
        'Pines del conector del cuadro de instrumentos con soldadura fría agrietada por vibraciones',
        'Batería con bajo voltaje durante el arranque',
        'Resistencia terminal de red CAN fuera de los 60 ohms'
      ],
      recommendedAction: 'Extraer el cuadro de instrumentos y repasar con estaño de precisión los pines del conector principal de la placa electrónica (solución definitiva y económica).',
      estimatedRepairCostRange: '$40.000 - $90.000 ARS'
    }
  },

  Volkswagen: {
    P1176: {
      code: 'P1176',
      brand: 'Volkswagen',
      title: 'VW / Audi: Corrección Lambda Detrás de Catalizador (Límite Alcanzado)',
      category: 'Emisiones / Catalizador',
      severity: 'warning',
      milStatus: true,
      description: 'La ECU Bosch/Marelli de Volkswagen detectó que la señal de la sonda de oxígeno posterior al catalizador alcanzó el límite superior de ajuste de mezcla.',
      symptoms: ['Check Engine encendido', 'Sin falla evidente de marcha'],
      possibleCauses: ['Catalizador desgastado', 'Fuga de escape en la unión del flexible', 'Sonda posterior envejecida'],
      recommendedAction: 'Revisar estanqueidad del caño de escape y estado del catalizador.',
      estimatedRepairCostRange: '$35.000 - $80.000 ARS'
    },
    P1297: {
      code: 'P1297',
      brand: 'Volkswagen',
      title: 'VW / Audi: Caída de Presión en Conexión Turbocompresor - Válvula Mariposa',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'Código clásico de motores turbo VAG (1.8T 20V de Bora/Golf/Audi y 2.0 TSI de Vento). La ECU detecta discrepancia entre la presión solicitada por el sensor MAP y la medida antes de la mariposa.',
      symptoms: ['Pérdida de potencia al acelerar a fondo', 'Silbido de aire en vano motor', 'Modo de emergencia (Limp Mode)'],
      possibleCauses: ['Manguera de intercooler fisurada o desacoplada', 'Válvula diverter (alivio de turbo) con membrana rota', 'Válvula de venteo de cárter PCV fisurada'],
      recommendedAction: 'Inspeccionar mangueras de presurización de turbo y cambiar válvula diverter por versión reforzada.',
      estimatedRepairCostRange: '$30.000 - $95.000 ARS'
    },
    P1557: {
      code: 'P1557',
      brand: 'Volkswagen',
      title: 'VW / Audi: Presión de Sobrealimentación de Turbo - Límite Positivo Sobrepasado',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'Falla muy común en motores VW TDI (Bora, Vento, Amarok). El turbo genera más presión de la calculada (Overboost), haciendo que la ECU corte inyección para proteger la turbina.',
      symptoms: ['El auto se queda repentinamente sin potencia al superar las 2.500 RPM en 3ra o 4ta marcha', 'Apagar y volver a encender el motor restaura la potencia temporalmente'],
      possibleCauses: ['Geometría variable del turbo atascada con hollín', 'Electroválvula N75 de control de vacío defectuosa', 'Mangueritas de vacío cuarteadas'],
      recommendedAction: 'Reemplazar mangueras de vacío, comprobar válvula N75 y descarbonizar álabes de geometría variable.',
      estimatedRepairCostRange: '$40.000 - $160.000 ARS'
    },
    P1602: {
      code: 'P1602',
      brand: 'Volkswagen',
      title: 'VW / Audi: Tensión de Alimentación Borne 30 - Voltaje Demasiado Bajo',
      category: 'Transmisión / Eléctrico',
      severity: 'advisory',
      milStatus: false,
      description: 'El borne 30 (positivo directo de batería) sufrió una caída momentánea por debajo del umbral mínimo de operación de la ECU.',
      symptoms: ['Testigo de batería o dirección asistida encendido al arrancar', 'Reloj del tablero reseteado a 00:00'],
      possibleCauses: ['Batería desconectada recientemente', 'Batería con celdas degradadas al dar arranque matutino', 'Borne positivo o negativo flojo o sulfatado'],
      recommendedAction: 'Limpiar bornes, apretar tuercas y medir prueba de carga de batería en taller.',
      estimatedRepairCostRange: '$0 - $40.000 ARS'
    },
    P1857: {
      code: 'P1857',
      brand: 'Volkswagen',
      title: 'VW: Señal de Carga Errónea de la ECU Motor hacia Módulo de Frenos ABS',
      category: 'Frenos / Chasis (ABS)',
      severity: 'warning',
      milStatus: true,
      description: 'Muy frecuente en Gol Trend, Voyage, Suran y Fox. El módulo ABS enciende la luz de ABS/ESP no por una falla en los frenos, sino porque la ECU de motor le reporta valores erráticos de carga.',
      symptoms: ['Luz de ABS y control de tracción encendidas en el tablero', 'Ralentí levemente inestable'],
      possibleCauses: ['Cuerpo de mariposa motorizado sucio con carbonilla', 'Chupada de aire en junta de admisión', 'Sensor MAP descalibrado'],
      recommendedAction: 'Limpiar a fondo el cuerpo de aceleración y realizar calibración / ajuste básico de mariposa con el escáner.',
      estimatedRepairCostRange: '$20.000 - $55.000 ARS'
    }
  },

  Chevrolet: {
    P1682: {
      code: 'P1682',
      brand: 'Chevrolet',
      title: 'Chevrolet / GM: Interruptor de Encendido 1-2 - Discrepancia de Circuito',
      category: 'Transmisión / Eléctrico',
      severity: 'critical',
      milStatus: true,
      description: 'Muy habitual en Chevrolet Cruze, Tracker, Onix y Sonic. La computadora ECM detecta diferencia de voltaje mayor a 2V entre los dos circuitos principales del relé de ignición / arranque.',
      symptoms: ['El auto no da arranque en ocasiones (gira y no enciende o corte total)', 'Luces de tablero parpadean al girar la llave'],
      possibleCauses: ['Relé principal KR75 (Run/Crank) en fusiblera del vano motor con contactos flameados', 'Fusible de 15A con falso contacto', 'Conector de fusiblera bajo capó flojo'],
      recommendedAction: 'Intercambiar o reemplazar el relé KR75 en la fusiblera del motor y limpiar pines de la fusiblera.',
      estimatedRepairCostRange: '$18.000 - $45.000 ARS'
    },
    P1396: {
      code: 'P1396',
      brand: 'Chevrolet',
      title: 'Chevrolet: Variación del Sensor de Cigüeñal (CKP) No Aprendida',
      category: 'Combustión / Encendido',
      severity: 'warning',
      milStatus: true,
      description: 'Clásico en Chevrolet Corsa, Classic, Agile y Celta tras cambiar el sensor de cigüeñal, la correa de distribución o la polea de accesorios con rueda fónica.',
      symptoms: ['Luz Check Engine encendida fija sin falla perceptible de marcha'],
      possibleCauses: ['Falta de procedimiento de adaptación / aprendizaje de rueda fónica en la ECM tras mantenimiento'],
      recommendedAction: 'Realizar el procedimiento de "Aprendizaje de Variación de Cigüeñal" (Crankshaft Variation Relearn) con escáner OBD-II acelerando a 4.000 RPM con motor a temperatura de régimen.',
      estimatedRepairCostRange: '$15.000 - $35.000 ARS'
    },
    P1133: {
      code: 'P1133',
      brand: 'Chevrolet',
      title: 'Chevrolet: Sensor de Oxígeno Banco 1 Sensor 1 - Conmutación Insuficiente',
      category: 'Inyección / Aire',
      severity: 'warning',
      milStatus: true,
      description: 'La ECU GM exige un número mínimo de transiciones rico/pobre durante un lapso de tiempo. El sensor no oscila con la velocidad suficiente.',
      symptoms: ['Aumento del consumo de nafta', 'Leve tironeo a velocidad crucero'],
      possibleCauses: ['Sonda de oxígeno agotada por kilometraje', 'Contaminación con aditivos o nafta adulterada'],
      recommendedAction: 'Reemplazar sonda de oxígeno delantera.',
      estimatedRepairCostRange: '$40.000 - $95.000 ARS'
    }
  },

  Fiat: {
    P1325: {
      code: 'P1325',
      brand: 'Fiat',
      title: 'Fiat: Sincronismo de Posición de Cigüeñal y Rueda Fónica',
      category: 'Combustión / Encendido',
      severity: 'warning',
      milStatus: true,
      description: 'Común en motores Fiat Fire 1.4 y Firefly 1.3 (Cronos, Argo, Palio, Uno). La ECU Marelli requiere el autoaprendizaje de la rueda fónica tras el reemplazo de la correa de distribución o del sensor CKP.',
      symptoms: ['Check Engine parpadeante o fijo', 'Corte prematuro de RPM en aceleración'],
      possibleCauses: ['Cambio reciente de correa dentada o polea de cigüeñal', 'Separación (entrehierro) incorrecta del sensor inductivo'],
      recommendedAction: 'Efectuar el procedimiento de autoaprendizaje de rueda fónica: con motor a 90°C dar tres aceleradas a fondo hasta 5.000 RPM y soltar pedal.',
      estimatedRepairCostRange: '$12.000 - $30.000 ARS'
    },
    P1687: {
      code: 'P1687',
      brand: 'Fiat',
      title: 'Fiat: Mariposa Motorizada - Falla de Adaptación o Comunicación',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'Falla de control del cuerpo de mariposa electrónico en sistemas Marelli IAW 4AF / 7GF.',
      symptoms: ['El auto queda moderando en 1.200 RPM fijas y no responde al acelerador (Modo Recovery)'],
      possibleCauses: ['Carbonilla acumulada en la garganta de la mariposa', 'Pista del potenciómetro TPS gastada', 'Caída de voltaje en batería'],
      recommendedAction: 'Limpiar cuerpo de mariposa con solvente dieléctrico y realizar reseteo de parámetros autoadaptativos.',
      estimatedRepairCostRange: '$22.000 - $65.000 ARS'
    }
  },

  Renault: {
    P1525: {
      code: 'P1525',
      brand: 'Renault',
      title: 'Renault: Señales Multiplexadas Incoherentes para Regulador / Limitador de Velocidad',
      category: 'Inyección / Aire',
      severity: 'warning',
      milStatus: true,
      description: 'Falla muy frecuente en Renault Sandero, Duster, Logan y Kangoo II. No es una falla del control de crucero; cuando la inyección detecta CUALQUIER anomalía leve de motor, desactiva por seguridad el regulador de velocidad y genera este código en la UCH.',
      symptoms: ['Mensaje "Revisar regulador de velocidad" en el display', 'Control crucero no activa'],
      possibleCauses: ['Falla primaria en inyección (mariposa sucia, bujía con desgaste, interruptor de pedal de freno/embrague)'],
      recommendedAction: 'Buscar el código DTC primario asociado en la computadora de motor (PCM) y revisar switch de pedal de freno/embrague.',
      estimatedRepairCostRange: '$20.000 - $55.000 ARS'
    }
  },

  Peugeot: {
    P1336: {
      code: 'P1336',
      brand: 'Peugeot',
      title: 'Peugeot / PSA: Falla de Combustión No Determinada en Cilindros (Misfire Genérico)',
      category: 'Combustión / Encendido',
      severity: 'critical',
      milStatus: true,
      description: 'Clásico en motorizaciones Peugeot 208, 206, 207, 308 y Partner (motores TU4, TU5JP4 1.6 16V, EC5 y 1.2 PureTech). La ECU detecta desaceleración en el cigüeñal pero no logra aislar en qué cilindro exacto ocurre.',
      symptoms: ['Tirones notables al acelerar', 'El motor vibra en ralentí', 'Luz de Check Engine parpadea'],
      possibleCauses: ['Módulo de bobina monobloque con fuga interna de chispa', 'Bujías empastadas o gastadas', 'Inyector con caudal desbalanceado'],
      recommendedAction: 'Reemplazar las 4 bujías y probar la regleta de bobinas de encendido con probador de chispa.',
      estimatedRepairCostRange: '$35.000 - $110.000 ARS'
    },
    P1337: {
      code: 'P1337',
      brand: 'Peugeot',
      title: 'Peugeot / PSA: Falla de Combustión en Cilindro 1',
      category: 'Combustión / Encendido',
      severity: 'critical',
      milStatus: true,
      description: 'Falla de encendido localizada en el cilindro 1 (en motores PSA franceses el Cilindro 1 es el del lado del volante motor / caja de cambios).',
      symptoms: ['Pérdida de potencia', 'Consumo alto', 'Marcha en 3 cilindros'],
      possibleCauses: ['Bobina de cilindro 1 defectuosa', 'Bujía fisurada', 'Inyector 1 trabado'],
      recommendedAction: 'Controlar bujía e inyector del cilindro 1 (lado caja).',
      estimatedRepairCostRange: '$30.000 - $85.000 ARS'
    }
  },

  Toyota: {
    P1604: {
      code: 'P1604',
      brand: 'Toyota',
      title: 'Toyota: Anomalía de Capacidad de Arranque (Startability Malfunction)',
      category: 'Combustión / Encendido',
      severity: 'warning',
      milStatus: true,
      description: 'Común en Toyota Hilux, Corolla, Etios y Yaris. La ECU registra este código cuando el motor tardó más tiempo de lo normal en encender o se apagó inmediatamente tras dar arranque.',
      symptoms: ['El motor necesitó varios segundos de arranque para encender', 'No hay falla una vez que está en marcha'],
      possibleCauses: ['Batería con bajo voltaje durante el frío matutino', 'Filtro de combustible sucio', 'Combustible de mala calidad'],
      recommendedAction: 'Verificar estado de batería, terminales y reemplazar filtro de nafta/gasoil.',
      estimatedRepairCostRange: '$20.000 - $60.000 ARS'
    }
  },

  Nissan: {
    P0089: {
      code: 'P0089',
      brand: 'Nissan',
      title: 'Nissan NP300 / Frontier YD25: Válvula Reguladora de Succión SCV - Rendimiento de Bomba Common Rail',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'Falla característica del motor Nissan YD25DDTi (bomba Denso HP3). La ECM detecta que la válvula SCV (Suction Control Valve) no modula correctamente el caudal de gasoil hacia la rampa común.',
      symptoms: ['Tironeo a 2000 RPM o en aceleración', 'Pérdida súbita de potencia (modo de emergencia Limp Mode)', 'Ralentí oscilante o motor que se apaga al embragar'],
      possibleCauses: ['Válvula SCV desgastada o trabada por microimpurezas de gasoil', 'Filtro de gasoil tapado con sedimentos', 'Fuga de presión interna en la bomba de alta presión'],
      recommendedAction: 'Reemplazar la válvula SCV (Denso 294009-0120 o versión extendida), purgar circuito, cambiar filtro de gasoil y resetear valores aprendidos de bomba en ECM.',
      estimatedRepairCostRange: '$120.000 - $220.000 ARS'
    },
    P1272: {
      code: 'P1272',
      brand: 'Nissan',
      title: 'Nissan YD25: Válvula Limitadora de Presión de Rampa Abierta / Fuga en Riel Común',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'En el motor YD25 Tipo 2, la válvula mecánica o eléctrica de alivio al final de la rampa común se abrió para proteger el sistema ante un pico de presión superior a 1800 bar, o quedó trabada perdiendo gasoil al retorno.',
      symptoms: ['Motor entra en protección y no pasa de 2500 RPM', 'Humo negro y pérdida notable de fuerza', 'El motor se para bajo máxima aceleración en ruta'],
      possibleCauses: ['Válvula limitadora de rampa vencida', 'Picos de presión generados por la válvula SCV atascada', 'Retorno de inyectores excesivo'],
      recommendedAction: 'Controlar caudal de retorno de la válvula de alivio de rampa; inspeccionar válvula SCV y sensor de presión FRP.',
      estimatedRepairCostRange: '$90.000 - $190.000 ARS'
    },
    P0190: {
      code: 'P0190',
      brand: 'Nissan',
      title: 'Nissan NP300: Sensor de Presión de Rampa Común FRP - Falla en Circuito',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'La ECM no recibe señal coherente del sensor FRP (Fuel Rail Pressure Sensor) ubicado en el centro de la rampa de inyección del motor YD25.',
      symptoms: ['Arranque prolongado', 'El motor se detiene o no arranca por seguridad de inyección', 'Testigo Check Engine fijo'],
      possibleCauses: ['Ficha del sensor FRP sulfatada o con falso contacto', 'Cableado cortado', 'Sensor piezoeléctrico de rampa dañado'],
      recommendedAction: 'Comprobar tensión de 5V de referencia en ficha de sensor FRP, masa y señal (debe marcar aprox. 1.0V en contacto y 1.3V - 1.5V en ralentí caliente).',
      estimatedRepairCostRange: '$85.000 - $170.000 ARS'
    },
    P0192: {
      code: 'P0192',
      brand: 'Nissan',
      title: 'Nissan YD25: Sensor de Presión de Rampa FRP - Tensión de Señal Baja (<0.4V)',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'El sensor de presión de riel envía menos de 0.4V a la ECM, indicando circuito a masa o caída total de presión en rampa.',
      symptoms: ['El motor no enciende o se apaga inmediatamente', 'Modo de emergencia'],
      possibleCauses: ['Cable de señal en cortocircuito a masa', 'Falta alimentación de 5V al sensor', 'Bomba sin suministro de combustible'],
      recommendedAction: 'Medir alimentación y mazo de cables entre el sensor FRP y el conector de la ECM.',
      estimatedRepairCostRange: '$40.000 - $110.000 ARS'
    },
    P0193: {
      code: 'P0193',
      brand: 'Nissan',
      title: 'Nissan YD25: Sensor de Presión de Rampa FRP - Tensión de Señal Alta (>4.8V)',
      category: 'Inyección / Aire',
      severity: 'critical',
      milStatus: true,
      description: 'El sensor envía voltaje máximo (>4.8V) a la ECM, indicando circuito abierto en el cable de masa del sensor.',
      symptoms: ['Luz Check Engine encendida', 'Marcha ruidosa tipo cascabeleo diésel por presión máxima preventiva'],
      possibleCauses: ['Ficha desconectada o cable de masa cortado', 'Falla interna del sensor FRP'],
      recommendedAction: 'Asegurar conexión firme de la ficha y masa del sensor en la culata.',
      estimatedRepairCostRange: '$35.000 - $90.000 ARS'
    },
    P0335: {
      code: 'P0335',
      brand: 'Nissan',
      title: 'Nissan NP300 / Frontier: Sensor de Posición de Cigüeñal (CKP / POS Sensor)',
      category: 'Combustión / Encendido',
      severity: 'critical',
      milStatus: true,
      description: 'Falla en el sensor CKP ubicado en la carcasa de la caja de cambios / campana del volante motor de la YD25.',
      symptoms: ['El motor gira pero no arranca', 'Detención brusca del motor en caliente', 'El tacómetro cae a 0 RPM mientras el auto aún se mueve'],
      possibleCauses: ['Sensor CKP magnético con virutas metálicas en la punta', 'Falla térmica del sensor CKP', 'Corona dentada del volante dañada'],
      recommendedAction: 'Extraer sensor CKP, limpiar su punta, verificar resistencia interna (aprox. 850 - 1200 ohms) o reemplazar.',
      estimatedRepairCostRange: '$45.000 - $95.000 ARS'
    },
    P0340: {
      code: 'P0340',
      brand: 'Nissan',
      title: 'Nissan NP300 / Frontier: Sensor de Posición de Árbol de Levas (CMP / PHASE Sensor)',
      category: 'Combustión / Encendido',
      severity: 'critical',
      milStatus: true,
      description: 'La ECM no detecta la fase de cilindros desde el sensor CMP ubicado en la parte superior trasera de la culata (tapa de válvulas).',
      symptoms: ['Arranque muy largo (la ECM debe sincronizar solo con CKP)', 'Pérdida de sincronismo'],
      possibleCauses: ['Sensor CMP tipo Hall defectuoso', 'Cadena de distribución estirada o fuera de punto', 'Ficha sucia'],
      recommendedAction: 'Verificar sensor CMP y estado de los patines y tensión de la cadena de distribución superior.',
      estimatedRepairCostRange: '$50.000 - $110.000 ARS'
    },
    P0100: {
      code: 'P0100',
      brand: 'Nissan',
      title: 'Nissan YD25: Caudalímetro de Masa de Aire MAF - Circuito Anómalo',
      category: 'Inyección / Aire',
      severity: 'warning',
      milStatus: true,
      description: 'La señal del sensor MAF instalado en la salida del filtro de aire está fuera del rango calibrado en la ECM de Nissan.',
      symptoms: ['Humo negro al pisar el acelerador', 'Falta de aceleración', 'Consumo elevado de diésel'],
      possibleCauses: ['Sensor MAF con polvo o aceite adherido al filamento', 'Filtro de aire roto o muy tapado', 'Entrada de aire no medida en manguera de turbo'],
      recommendedAction: 'Limpiar filamento del MAF con spray dieléctrico para caudalímetros (sin tocar con los dedos) y colocar filtro de aire nuevo.',
      estimatedRepairCostRange: '$20.000 - $75.000 ARS'
    },
    P1622: {
      code: 'P1622',
      brand: 'Nissan',
      title: 'Nissan YD25: Código de Calibración / Compensación de Inyectores Denso No Programado',
      category: 'Inyección / Aire',
      severity: 'warning',
      milStatus: true,
      description: 'Se reemplazaron inyectores Common Rail pero no se grabaron los códigos QR alfanuméricos de compensación de caudal en la memoria EEPROM de la ECM.',
      symptoms: ['Motor ruidoso, ralentí con vibración despareja', 'Humo blanco o consumo desbalanceado entre cilindros'],
      possibleCauses: ['Cambio de inyector sin aprendizaje por escáner', 'Reemplazo de ECU sin clonar códigos de inyectores'],
      recommendedAction: 'Ingresar con escáner avanzado o Consult y programar el código QR de 30 caracteres grabado en la cabeza de cada inyector según su cilindro.',
      estimatedRepairCostRange: '$30.000 - $60.000 ARS'
    },
    P0380: {
      code: 'P0380',
      brand: 'Nissan',
      title: 'Nissan NP300: Circuito de Bujías de Precalentamiento / Relé Glow Plug',
      category: 'Combustión / Encendido',
      severity: 'warning',
      milStatus: true,
      description: 'Falla en el relé de precalentamiento o una o más bujías incandescentes quemadas en el motor YD25.',
      symptoms: ['Dificultad para arrancar en mañanas frías', 'Humo blanco/grisáceo los primeros 10 segundos tras arrancar'],
      possibleCauses: ['Una o dos bujías de precalentamiento con filamento cortado', 'Relé de calentadores quemado o fusible de 60A/80A abierto'],
      recommendedAction: 'Medir continuidad y resistencia de las 4 bujías incandescentes con multímetro (deben tener ~0.6 - 1.2 ohms) y reemplazar las quemadas.',
      estimatedRepairCostRange: '$35.000 - $85.000 ARS'
    },
    P0400: {
      code: 'P0400',
      brand: 'Nissan',
      title: 'Nissan YD25: Sistema de Recirculación de Gases de Escape (Válvula EGR)',
      category: 'Emisiones / Catalizador',
      severity: 'warning',
      milStatus: true,
      description: 'El flujo de gas de recirculación EGR es insuficiente o excesivo respecto a lo calculado por la ECM.',
      symptoms: ['Pérdida de reacción en baja', 'Humo negro', 'Acumulación de carbonilla en admisión'],
      possibleCauses: ['Válvula EGR trabada por carbón y hollín', 'Conducto de EGR tapado en la culata', 'Sensor de posición de EGR defectuoso'],
      recommendedAction: 'Desmontar y descarbonizar la válvula EGR y colector de admisión con solvente desengrasante.',
      estimatedRepairCostRange: '$40.000 - $90.000 ARS'
    }
  }
};

/**
 * Busca un código en los descifradores especializados de fabricantes.
 * Si se especifica una marca, la prioriza; de lo contrario busca en todas las marcas.
 */
export function lookupManufacturerDTC(
  code: string,
  preferredBrand?: string
): ManufacturerDTCEntry | null {
  const cleanCode = code.trim().toUpperCase();

  // 1. Si el usuario tiene una marca activa en el garage (ej. Ford, Volkswagen, Chevrolet)
  if (preferredBrand) {
    const brandKey = Object.keys(MANUFACTURER_DTC_CATALOG).find(
      b => b.toLowerCase() === preferredBrand.toLowerCase()
    );
    if (brandKey && MANUFACTURER_DTC_CATALOG[brandKey][cleanCode]) {
      return MANUFACTURER_DTC_CATALOG[brandKey][cleanCode];
    }
  }

  // 2. Si no se encontró en la marca preferida o no se especificó marca,
  // buscar en todos los descifradores de marcas disponibles
  for (const brand of Object.keys(MANUFACTURER_DTC_CATALOG)) {
    if (MANUFACTURER_DTC_CATALOG[brand][cleanCode]) {
      return MANUFACTURER_DTC_CATALOG[brand][cleanCode];
    }
  }

  return null;
}
