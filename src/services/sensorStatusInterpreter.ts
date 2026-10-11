import { OBDTelemetry } from '../types/vehicle';

export type SensorTone = 'optimal' | 'good' | 'warning' | 'critical' | 'cold' | 'info';

export interface SensorInterpretation {
  statusText: string;          // Ej: "Perfecto", "Motor Frío", "Cargando Bien", "🚨 ¡Peligro Calor!"
  statusTone: SensorTone;      // optimal, good, warning, critical, cold, info
  simpleExplanation: string;   // Explicación en lenguaje 100% humano para alguien sin conocimientos de mecánica
  normalRange: string;         // Rango de referencia para que el usuario entienda qué es lo normal
  badgeColor: string;          // Clases Tailwind para badges y pills
  dotColor: string;            // Clases Tailwind para puntos indicadores
  borderColor: string;         // Clases Tailwind para bordes
}

/**
 * Traduce cualquier lectura técnica de OBD-II o de la computadora Nissan/Universal
 * a un diagnóstico claro en lenguaje cotidiano para que cualquiera entienda si está bien o mal.
 */
export function interpretSensorValue(
  pid: string,
  currentValueStr: string | undefined,
  numericVal: number | null | undefined,
  telemetry: OBDTelemetry
): SensorInterpretation {
  const cleanPid = pid.replace('01 ', '').trim().toUpperCase();

  // 1. REFRIGERANTE MOTOR / TEMPERATURA AGUA (PID 05)
  if (cleanPid === '05' || pid.toLowerCase().includes('refrigerante') || pid.toLowerCase().includes('agua')) {
    const temp = numericVal ?? telemetry.coolantTemp ?? 0;
    if (temp <= 0) {
      return {
        statusText: 'Sin lectura de sensor',
        statusTone: 'info',
        simpleExplanation: 'Esperando señal del termistor de la culata del motor.',
        normalRange: '82°C – 98°C',
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
        dotColor: 'bg-slate-400',
        borderColor: 'border-slate-800'
      };
    }
    if (temp < 60) {
      return {
        statusText: '❄️ Motor Frío (Manejá suave)',
        statusTone: 'cold',
        simpleExplanation: 'El motor recién arranca. No lo pises fuerte hasta que tome temperatura.',
        normalRange: '82°C – 98°C (Ideal 90°C)',
        badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
        dotColor: 'bg-blue-400',
        borderColor: 'border-blue-800/60'
      };
    }
    if (temp < 80) {
      return {
        statusText: '⏳ Entrando en calor',
        statusTone: 'info',
        simpleExplanation: 'El agua está calentando de forma normal para llegar a su punto óptimo.',
        normalRange: '82°C – 98°C',
        badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        dotColor: 'bg-cyan-400',
        borderColor: 'border-cyan-800/60'
      };
    }
    if (temp <= 98) {
      return {
        statusText: '✅ Perfecto (Temperatura Óptima)',
        statusTone: 'optimal',
        simpleExplanation: 'El motor está en su temperatura ideal de trabajo. Máxima potencia y mínimo desgaste.',
        normalRange: '82°C – 98°C (Ideal ~90°C)',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400 animate-pulse',
        borderColor: 'border-emerald-700/60'
      };
    }
    if (temp <= 104) {
      return {
        statusText: '⚠️ Temperatura alta (Observar)',
        statusTone: 'warning',
        simpleExplanation: 'El electroventilador debería estar soplando a fondo. Evitá exigirlo.',
        normalRange: '82°C – 98°C',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        dotColor: 'bg-amber-400 animate-pulse',
        borderColor: 'border-amber-700/60'
      };
    }
    return {
      statusText: '🚨 ¡PELIGRO SOBRECALENTAMIENTO!',
      statusTone: 'critical',
      simpleExplanation: 'Peligro inminente de quemar la junta de tapa. Detené la marcha pronto.',
      normalRange: '82°C – 98°C',
      badgeColor: 'bg-red-950/90 text-red-200 border-red-600 animate-pulse',
      dotColor: 'bg-red-500',
      borderColor: 'border-red-600'
    };
  }

  // 2. TEMPERATURA DE ACEITE MOTOR (PID 5C)
  if (cleanPid === '5C' || pid.toLowerCase().includes('aceite')) {
    const temp = numericVal ?? telemetry.oilTemp ?? 0;
    if (temp <= 0) {
      return {
        statusText: 'En espera',
        statusTone: 'info',
        simpleExplanation: 'El sensor de cárter se activa luego de unos minutos de marcha.',
        normalRange: '85°C – 105°C',
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
        dotColor: 'bg-slate-400',
        borderColor: 'border-slate-800'
      };
    }
    if (temp < 70) {
      return {
        statusText: '❄️ Aceite Frío',
        statusTone: 'cold',
        simpleExplanation: 'El lubricante aún está espeso. Conducí suave para no forzar la bomba.',
        normalRange: '85°C – 105°C',
        badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
        dotColor: 'bg-blue-400',
        borderColor: 'border-blue-800/60'
      };
    }
    if (temp <= 105) {
      return {
        statusText: '✅ Perfecto (Lubricación Ideal)',
        statusTone: 'optimal',
        simpleExplanation: 'El aceite tiene la viscosidad exacta para crear la película que protege metales y turbo.',
        normalRange: '85°C – 105°C',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }
    if (temp <= 118) {
      return {
        statusText: '⚠️ Aceite Exigido',
        statusTone: 'warning',
        simpleExplanation: 'Normal en subidas prolongadas o con remolque pesado. Bajá un cambio para aliviarlo.',
        normalRange: '85°C – 105°C',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        dotColor: 'bg-amber-400',
        borderColor: 'border-amber-700/60'
      };
    }
    return {
      statusText: '🚨 ¡PELIGRO ACEITE HIRVIENDO!',
      statusTone: 'critical',
      simpleExplanation: 'El aceite se degrada rápidamente por exceso de calor. Reducí la velocidad ya.',
      normalRange: '85°C – 105°C',
      badgeColor: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
      dotColor: 'bg-red-500',
      borderColor: 'border-red-600'
    };
  }

  // 3. VOLTAJE DE BATERÍA Y ALTERNADOR (ATRV o PID 42)
  if (cleanPid === 'ATRV' || cleanPid === '42' || pid.toLowerCase().includes('voltaje') || pid.toLowerCase().includes('bater')) {
    const volts = numericVal ?? telemetry.batteryVoltage ?? 0;
    const isRunning = (telemetry.rpm > 350) || telemetry.isEngineRunning;

    if (isRunning) {
      if (volts >= 13.6 && volts <= 14.6) {
        return {
          statusText: '✅ Carga Óptima (Alternador 10 puntos)',
          statusTone: 'optimal',
          simpleExplanation: 'El alternador está recargando la batería y alimentando todos los circuitos perfectamente.',
          normalRange: '13.8V – 14.4V en marcha',
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
          dotColor: 'bg-emerald-400',
          borderColor: 'border-emerald-700/60'
        };
      }
      if (volts >= 13.0 && volts < 13.6) {
        return {
          statusText: '⚠️ Carga Justa',
          statusTone: 'warning',
          simpleExplanation: 'Carga un poco baja; puede haber muchas luces y aire prendidos a la vez o correa floja.',
          normalRange: '13.8V – 14.4V en marcha',
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          dotColor: 'bg-amber-400',
          borderColor: 'border-amber-700/60'
        };
      }
      if (volts < 13.0) {
        return {
          statusText: '🚨 ¡ALTERNADOR NO CARGA!',
          statusTone: 'critical',
          simpleExplanation: 'El alternador falló o se cortó la correa. Se está consumiendo la batería y el auto se puede parar.',
          normalRange: '13.8V – 14.4V en marcha',
          badgeColor: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
          dotColor: 'bg-red-500',
          borderColor: 'border-red-600'
        };
      }
      return {
        statusText: '🚨 ¡SOBRECARGA ELÉCTRICA!',
        statusTone: 'critical',
        simpleExplanation: 'El regulador del alternador está mandando exceso de voltaje. Peligro de quemar lámparas y compu.',
        normalRange: '13.8V – 14.4V',
        badgeColor: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        dotColor: 'bg-red-500',
        borderColor: 'border-red-600'
      };
    } else {
      // Motor apagado en contacto
      if (volts >= 12.4) {
        return {
          statusText: '✅ Batería 100% Sana',
          statusTone: 'optimal',
          simpleExplanation: 'Tiene carga completa para arrancar al primer toque de llave.',
          normalRange: '12.4V – 12.8V apagado',
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
          dotColor: 'bg-emerald-400',
          borderColor: 'border-emerald-700/60'
        };
      }
      if (volts >= 11.9) {
        return {
          statusText: '⚠️ Batería a media carga',
          statusTone: 'warning',
          simpleExplanation: 'Tiene poca reserva. En mañanas muy frías le puede costar arrancar.',
          normalRange: '12.4V – 12.8V',
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          dotColor: 'bg-amber-400',
          borderColor: 'border-amber-700/60'
        };
      }
      return {
        statusText: '🚨 Batería Agotada',
        statusTone: 'critical',
        simpleExplanation: 'Está descargada o al final de su vida útil. Puede requerir auxilio o cambio.',
        normalRange: '> 12.4V',
        badgeColor: 'bg-red-950 text-red-200 border-red-600',
        dotColor: 'bg-red-500',
        borderColor: 'border-red-600'
      };
    }
  }

  // 4. PRESIÓN DE RAMPA COMMON RAIL DIÉSEL (PID 23 / FRP_V)
  if (cleanPid === '23' || cleanPid === 'FRP_V' || pid.toLowerCase().includes('rail') || pid.toLowerCase().includes('rampa')) {
    const kpa = numericVal ?? telemetry.fuelRailPressureDieselKpa ?? 0;
    const bar = Math.round(kpa / 100);
    const isIdling = (telemetry.speed <= 5) && (telemetry.rpm > 350 && telemetry.rpm < 1100);

    if (cleanPid === 'FRP_V') {
      return {
        statusText: '✅ Señal Eléctrica Sana',
        statusTone: 'optimal',
        simpleExplanation: 'El sensor de presión de la rampa Denso tiene contacto firme y sin ruidos eléctricos.',
        normalRange: '1.2V – 1.5V ralentí (hasta 4.0V a fondo)',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }

    if (isIdling) {
      if (bar >= 260 && bar <= 450) {
        return {
          statusText: '✅ Presión Normal en Ralentí',
          statusTone: 'optimal',
          simpleExplanation: 'La bomba Denso y la válvula SCV mantienen la rampa perfectamente cargada sin tirones.',
          normalRange: '300 – 400 bar (~30.000 kPa)',
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
          dotColor: 'bg-emerald-400',
          borderColor: 'border-emerald-700/60'
        };
      }
      if (bar < 250) {
        return {
          statusText: '⚠️ Presión de Riel Baja',
          statusTone: 'warning',
          simpleExplanation: 'Filtro de gasoil sucio o válvula SCV con fugas. El motor puede cabecear al moderar.',
          normalRange: '300 – 400 bar en ralentí',
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          dotColor: 'bg-amber-400',
          borderColor: 'border-amber-700/60'
        };
      }
    }

    // En aceleración o marcha general
    if (bar >= 450) {
      return {
        statusText: '✅ Presión con Fuerza de Empuje',
        statusTone: 'optimal',
        simpleExplanation: 'Inyección a altísima presión que atomiza el gasoil sin dejar humo negro.',
        normalRange: 'Hasta 1.600 bar a fondo',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }

    return {
      statusText: '✅ Inyección Activa',
      statusTone: 'good',
      simpleExplanation: 'El sistema Common Rail alimenta los inyectores dentro del rango estándar.',
      normalRange: '300 a 1.600 bar',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      dotColor: 'bg-cyan-400',
      borderColor: 'border-cyan-800/60'
    };
  }

  // 5. CAUDALÍMETRO DE AIRE MAF (PID 10 / MAF_V)
  if (cleanPid === '10' || cleanPid === 'MAF_V' || pid.toLowerCase().includes('maf') || pid.toLowerCase().includes('caudal')) {
    const rate = numericVal ?? telemetry.mafRate ?? 0;
    const isIdling = (telemetry.speed <= 5) && (telemetry.rpm > 350 && telemetry.rpm < 1100);

    if (cleanPid === 'MAF_V') {
      return {
        statusText: '✅ Filamento Limpio',
        statusTone: 'optimal',
        simpleExplanation: 'El sensor de hilo caliente lee el paso de aire sin película de mugre ni aceite.',
        normalRange: '1.2V a 1.5V en ralentí',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }

    if (isIdling && rate > 0) {
      return {
        statusText: '✅ Respirando Limpio',
        statusTone: 'optimal',
        simpleExplanation: 'El motor aspira aire limpio sin restricción. El filtro de aire está permeable y sano.',
        normalRange: '3 – 8 g/s en ralentí',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }

    if (rate > 15) {
      return {
        statusText: '✅ Aspiración Potente',
        statusTone: 'optimal',
        simpleExplanation: 'Ingreso generoso de aire para mezclar con el gasoil al acelerar.',
        normalRange: '20 – 120 g/s en aceleración',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }

    return {
      statusText: '✅ Flujo Normal',
      statusTone: 'good',
      simpleExplanation: 'Medición de masa de aire estable.',
      normalRange: '3 a 120 g/s',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      dotColor: 'bg-cyan-400',
      borderColor: 'border-cyan-800/60'
    };
  }

  // 6. PRESIÓN MÚLTIPLE DE ADMISIÓN MAP / TURBO (PID 0B)
  if (cleanPid === '0B' || pid.toLowerCase().includes('map') || pid.toLowerCase().includes('presión múltiple') || pid.toLowerCase().includes('admisión')) {
    const kpa = numericVal ?? telemetry.intakePressureMap ?? 101;
    if (kpa >= 95 && kpa <= 106) {
      return {
        statusText: '✅ Reposo (Presión Ambiental)',
        statusTone: 'optimal',
        simpleExplanation: 'Presión natural del aire exterior cuando el turbo aún no empuja (sin sobrepresión).',
        normalRange: '98 – 103 kPa en ralentí',
        badgeColor: 'bg-slate-900 text-cyan-300 border-slate-700',
        dotColor: 'bg-cyan-400',
        borderColor: 'border-slate-800'
      };
    }
    if (kpa > 106 && kpa <= 220) {
      return {
        statusText: '✅ Turbo Soplando con Fuerza',
        statusTone: 'optimal',
        simpleExplanation: 'El turbo está presurizando el aire para darle empuje y fuerza a la camioneta.',
        normalRange: 'Hasta 210 kPa en plena carga',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400 animate-pulse',
        borderColor: 'border-emerald-700/60'
      };
    }
    if (kpa > 220) {
      return {
        statusText: '⚠️ Sobresoplo de Turbo',
        statusTone: 'warning',
        simpleExplanation: 'Presión muy alta. La válvula de alivio o geometría variable puede estar trabada.',
        normalRange: 'Hasta 210 kPa',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        dotColor: 'bg-amber-400',
        borderColor: 'border-amber-700/60'
      };
    }
    return {
      statusText: '✅ Vacío Normal',
      statusTone: 'good',
      simpleExplanation: 'Succión normal en el conducto de admisión.',
      normalRange: '30 a 100 kPa',
      badgeColor: 'bg-slate-900 text-slate-300 border-slate-700',
      dotColor: 'bg-slate-400',
      borderColor: 'border-slate-800'
    };
  }

  // 7. CARGA MOTOR CALCULADA (PID 04)
  if (cleanPid === '04' || pid.toLowerCase().includes('carga')) {
    const load = numericVal ?? telemetry.engineLoad ?? 0;
    if (load <= 28) {
      return {
        statusText: '✅ Motor Descansado (Esfuerzo Mínimo)',
        statusTone: 'optimal',
        simpleExplanation: 'El motor va liviano y relajado, consumiendo lo mínimo de combustible.',
        normalRange: '15% – 30% en llano o moderando',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }
    if (load <= 65) {
      return {
        statusText: '✅ Esfuerzo Normal',
        statusTone: 'good',
        simpleExplanation: 'Ritmo crucero de marcha habitual en calle o ruta.',
        normalRange: '25% – 60% crucero',
        badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        dotColor: 'bg-cyan-400',
        borderColor: 'border-cyan-800/60'
      };
    }
    if (load <= 85) {
      return {
        statusText: 'ℹ️ Exigencia Media',
        statusTone: 'info',
        simpleExplanation: 'Acelerando para sobrepasar o subiendo una loma suave. Todo en orden.',
        normalRange: 'Transitorio al acelerar',
        badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-700/60',
        dotColor: 'bg-amber-400',
        borderColor: 'border-amber-700/60'
      };
    }
    return {
      statusText: '⚡ Máxima Potencia (Acelerador a Fondo)',
      statusTone: 'warning',
      simpleExplanation: 'El motor está entregando todo su torque disponible. Normal en sobrepasos o subidas bravas.',
      normalRange: 'Transitorio',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-600',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-700/60'
    };
  }

  // 8. TEMPERATURA AIRE ADMISIÓN IAT (PID 0F)
  if (cleanPid === '0F' || pid.toLowerCase().includes('aire admisión') || pid.toLowerCase().includes('iat')) {
    const temp = numericVal ?? telemetry.intakeAirTemp ?? 0;
    if (temp <= 45) {
      return {
        statusText: '✅ Aire Fresco y Rico en Oxígeno',
        statusTone: 'optimal',
        simpleExplanation: 'El aire entra fresco; ayuda a que el combustible se queme mejor y el auto rinda más.',
        normalRange: '15°C – 45°C',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }
    if (temp <= 60) {
      return {
        statusText: 'ℹ️ Aire Templado',
        statusTone: 'info',
        simpleExplanation: 'Temperatura esperable en días calurosos o tráfico lento de ciudad.',
        normalRange: 'Hasta 55°C',
        badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        dotColor: 'bg-cyan-400',
        borderColor: 'border-cyan-800/60'
      };
    }
    return {
      statusText: '⚠️ Aire Muy Caliente',
      statusTone: 'warning',
      simpleExplanation: 'El intercooler recibe poco aire fresco. El motor pierde un poquito de fuerza.',
      normalRange: 'Menos de 60°C',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-700/60'
    };
  }

  // 9. TANQUE DE COMBUSTIBLE (PID 2F)
  if (cleanPid === '2F' || pid.toLowerCase().includes('tanque') || pid.toLowerCase().includes('combustible')) {
    if (telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu' || telemetry.fuelLevelPercent === null) {
      return {
        statusText: 'ℹ️ Mirá la Aguja del Tablero',
        statusTone: 'info',
        simpleExplanation: 'En tu Nissan, el flotante va conectado directo a la aguja y no a la compu. Podés ingresar el % a mano.',
        normalRange: 'Lectura en aguja física',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        dotColor: 'bg-amber-400',
        borderColor: 'border-amber-700/60'
      };
    }
    const pct = telemetry.fuelLevelPercent;
    if (pct >= 25) {
      return {
        statusText: '✅ Nivel Seguro',
        statusTone: 'optimal',
        simpleExplanation: 'Tenés combustible de sobra para circular con tranquilidad.',
        normalRange: '> 20% seguro',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }
    if (pct >= 12) {
      return {
        statusText: '⚠️ Cerca de la Reserva',
        statusTone: 'warning',
        simpleExplanation: 'Queda poco combustible. Conviene cargar en la próxima estación de servicio.',
        normalRange: '> 20%',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        dotColor: 'bg-amber-400',
        borderColor: 'border-amber-700/60'
      };
    }
    return {
      statusText: '🚨 ¡EN RESERVA!',
      statusTone: 'critical',
      simpleExplanation: 'Cargá combustible pronto. Andar casi vacíos recalienta la bomba y chupa suciedad.',
      normalRange: '> 20%',
      badgeColor: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
      dotColor: 'bg-red-500',
      borderColor: 'border-red-600'
    };
  }

  // 10. PRESIÓN BAROMÉTRICA (PID 33)
  if (cleanPid === '33' || pid.toLowerCase().includes('barom')) {
    const kpa = numericVal ?? telemetry.barometricPressureKpa ?? 101;
    if (kpa >= 96) {
      return {
        statusText: '✅ Nivel del Mar / Llano',
        statusTone: 'optimal',
        simpleExplanation: 'Presión atmosférica normal; aire con 100% de oxígeno para máxima combustión.',
        normalRange: '98 – 103 kPa',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }
    return {
      statusText: '⛰️ Zona de Altura / Montaña',
      statusTone: 'info',
      simpleExplanation: 'Estás en altura (menos oxígeno en el aire). La computadora ajusta la inyección para no ahogarse.',
      normalRange: 'Varía según altitud',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      dotColor: 'bg-cyan-400',
      borderColor: 'border-cyan-800/60'
    };
  }

  // 11. POSICIÓN DE ACELERADOR (PID 11 o APP1)
  if (cleanPid === '11' || cleanPid === 'APP1' || pid.toLowerCase().includes('mariposa') || pid.toLowerCase().includes('acelerador')) {
    const pos = numericVal ?? telemetry.throttlePos ?? 0;
    if (pos <= 5) {
      return {
        statusText: '✅ Reposo (Sin pisar)',
        statusTone: 'good',
        simpleExplanation: 'Pie levantado del pedal; el motor modera en ralentí gastando lo mínimo.',
        normalRange: '0% a 100%',
        badgeColor: 'bg-slate-900 text-slate-300 border-slate-700',
        dotColor: 'bg-slate-400',
        borderColor: 'border-slate-800'
      };
    }
    return {
      statusText: '✅ Acelerando',
      statusTone: 'optimal',
      simpleExplanation: 'Señal de pedal transmitida con precisión a la compu.',
      normalRange: '0% a 100%',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      dotColor: 'bg-cyan-400',
      borderColor: 'border-cyan-800/60'
    };
  }

  // 12. AJUSTES DE COMBUSTIBLE STFT / LTFT (PID 06 / 07)
  if (cleanPid === '06' || cleanPid === '07' || pid.toLowerCase().includes('trim') || pid.toLowerCase().includes('ajuste combustible')) {
    const val = numericVal ?? 0;
    if (Math.abs(val) <= 6) {
      return {
        statusText: '✅ Mezcla Impecable',
        statusTone: 'optimal',
        simpleExplanation: 'La computadora inyecta la cuota exacta de combustible sin desperdiciar nada.',
        normalRange: '-5% a +5%',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-700/60'
      };
    }
    if (Math.abs(val) <= 12) {
      return {
        statusText: '✅ Compensación Normal',
        statusTone: 'good',
        simpleExplanation: 'Correcciones menores por temperatura o calidad del combustible cargado.',
        normalRange: '-10% a +10%',
        badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        dotColor: 'bg-cyan-400',
        borderColor: 'border-cyan-800/60'
      };
    }
    return {
      statusText: '⚠️ Compensando en exceso',
      statusTone: 'warning',
      simpleExplanation: 'La computadora está corrigiendo de más; revisar filtro de aire o inyectores.',
      normalRange: '-10% a +10%',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-700/60'
    };
  }

  // 13. SEÑALES ADICIONALES (EGR, Freno, Embrague, Calentadores)
  if (cleanPid === 'EGR_POS') {
    return {
      statusText: '✅ Recirculación Limpia',
      statusTone: 'optimal',
      simpleExplanation: 'La válvula ecológica abre y cierra suavemente para reducir gases contaminantes.',
      normalRange: '0% a 50%',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      dotColor: 'bg-emerald-400',
      borderColor: 'border-emerald-700/60'
    };
  }

  if (cleanPid === 'BRAKE_SW' || cleanPid === 'CLUTCH_SW') {
    return {
      statusText: '✅ Sensores de Pedal OK',
      statusTone: 'optimal',
      simpleExplanation: 'Los interruptores de seguridad de pedales avisan a la compu para cortar inyección si frenás.',
      normalRange: 'ON / OFF',
      badgeColor: 'bg-slate-900 text-slate-300 border-slate-700',
      dotColor: 'bg-emerald-400',
      borderColor: 'border-slate-800'
    };
  }

  if (cleanPid === 'GLOW_ST') {
    return {
      statusText: '✅ Calentadores Diésel OK',
      statusTone: 'optimal',
      simpleExplanation: 'El circuito de precalentamiento asegura arranque sin humos en las mañanas frías.',
      normalRange: 'ON en frío / OFF en régimen',
      badgeColor: 'bg-slate-900 text-amber-300 border-slate-700',
      dotColor: 'bg-amber-400',
      borderColor: 'border-slate-800'
    };
  }

  if (cleanPid === '1F') {
    return {
      statusText: '⏱️ Motor Encendido',
      statusTone: 'info',
      simpleExplanation: 'Tiempo transcurrido en el viaje actual desde que se encendió el motor.',
      normalRange: 'Tiempo de viaje continuo',
      badgeColor: 'bg-slate-900 text-cyan-300 border-slate-700',
      dotColor: 'bg-cyan-400',
      borderColor: 'border-slate-800'
    };
  }

  // DEFAULT / UNIVERSAL
  return {
    statusText: '✅ Parámetro Normal',
    statusTone: 'good',
    simpleExplanation: 'El valor reportado por la computadora se encuentra dentro de los límites de fábrica.',
    normalRange: 'Estándar fabricante',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    dotColor: 'bg-emerald-400',
    borderColor: 'border-emerald-800/60'
  };
}
