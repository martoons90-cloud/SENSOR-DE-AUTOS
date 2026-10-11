/**
 * Sensor Health & Plain-Language Evaluator
 * 
 * Diseñado específicamente para que cualquier persona (incluso sin conocimientos
 * de mecánica o automóviles) entienda al instante si la lectura de un sensor
 * está BIEN, en ATENCIÓN, o en PELIGRO, con colores claros y explicaciones cotidianas.
 */

export type SensorHealthStatus = 'optimal' | 'good' | 'warning' | 'danger' | 'unknown';

export interface SensorEvaluation {
  status: SensorHealthStatus;
  statusLabel: string;          // Ej: "🟢 Normal / Óptimo", "🟡 Motor Frío", "🔴 ¡Recalentamiento!"
  badgeColorClass: string;      // Clases Tailwind de fondo, borde y texto para badge
  textColorClass: string;       // Color del texto de la métrica
  simpleExplanation: string;    // Frase en lenguaje claro para quien no sabe nada de autos
  idealRangeText: string;       // Rango de referencia recomendado (ej: "Ideal: 80°C - 95°C")
  percentInRange?: number;      // 0 a 100 para dibujar barra indicadora
  isWarningOrDanger: boolean;
}

export interface SensorEvalContext {
  isEngineRunning?: boolean;
  batteryVoltage?: number;
  coolantTemp?: number;
  speed?: number;
  fuelType?: 'nafta' | 'diesel' | 'gnc' | 'hibrido';
}

/**
 * Evalúa el estado de salud y genera una explicación en lenguaje humano
 * para cualquier sensor OBD-II o de fabricante.
 */
export function evaluateSensorHealth(
  pid: string,
  numericValue: number | null | undefined,
  currentValueStr?: string,
  context?: SensorEvalContext
): SensorEvaluation {
  const cleanPid = pid.replace(/^01\s*/i, '').trim().toUpperCase();
  const val = numericValue !== undefined && numericValue !== null ? numericValue : extractNumber(currentValueStr);
  const isEngineOn = context?.isEngineRunning ?? (val !== null && val > 0 && cleanPid === '0C');

  // Si no hay dato o el valor es nulo
  if (val === null || currentValueStr === 'NO DATA' || currentValueStr === 'Sin dato') {
    if (cleanPid === '2F') {
      return {
        status: 'unknown',
        statusLabel: 'Sin Señal en ECU',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'La computadora del auto no lee el flotante digitalmente (va directo al reloj de aguja del tablero).',
        idealRangeText: 'Referencia: Ver aguja en tablero',
        isWarningOrDanger: false
      };
    }

    return {
      status: 'unknown',
      statusLabel: 'Sin Datos',
      badgeColorClass: 'bg-slate-900 text-slate-400 border-slate-800',
      textColorClass: 'text-slate-400',
      simpleExplanation: 'Esperando respuesta del sensor desde la computadora del vehículo.',
      idealRangeText: 'Esperando señal',
      isWarningOrDanger: false
    };
  }

  // =========================================================================
  // 1. REFRIGERANTE / AGUA DEL MOTOR (PID 05)
  // =========================================================================
  if (cleanPid === '05' || cleanPid.includes('COOLANT')) {
    if (val < 60) {
      return {
        status: 'warning',
        statusLabel: 'Motor Frío',
        badgeColorClass: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
        textColorClass: 'text-blue-400',
        simpleExplanation: 'El motor todavía está frío. Es normal al arrancar; manejá con suavidad hasta que llegue a ~85°C.',
        idealRangeText: 'Ideal: 82°C a 95°C',
        percentInRange: Math.min(100, Math.max(10, (val / 90) * 100)),
        isWarningOrDanger: false
      };
    } else if (val < 80) {
      return {
        status: 'good',
        statusLabel: 'Calentando',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'Subiendo hacia la temperatura de régimen. Ya podés circular normalmente.',
        idealRangeText: 'Ideal: 82°C a 95°C',
        percentInRange: Math.min(100, (val / 95) * 100),
        isWarningOrDanger: false
      };
    } else if (val <= 97) {
      return {
        status: 'optimal',
        statusLabel: 'Temperatura Óptima',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Perfecto. El motor está en su temperatura ideal de trabajo. No hay riesgo de recalentamiento.',
        idealRangeText: 'Ideal: 82°C a 95°C',
        percentInRange: 85,
        isWarningOrDanger: false
      };
    } else if (val <= 104) {
      return {
        status: 'warning',
        statusLabel: 'Algo Caliente',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'Más caliente de lo normal (típico en embotellamientos o subidas). El electroventilador debe encender.',
        idealRangeText: 'Límite seguro: <98°C',
        percentInRange: 92,
        isWarningOrDanger: true
      };
    } else {
      return {
        status: 'danger',
        statusLabel: '¡Recalentando!',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: '¡Peligro! Temperatura crítica (>104°C). Detener la marcha para evitar soplar la junta del motor.',
        idealRangeText: 'Máximo permitido: 100°C',
        percentInRange: 100,
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 2. TEMPERATURA DE ACEITE MOTOR (PID 5C)
  // =========================================================================
  if (cleanPid === '5C' || cleanPid.includes('OIL_TEMP')) {
    if (val < 65) {
      return {
        status: 'warning',
        statusLabel: 'Aceite Frío',
        badgeColorClass: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
        textColorClass: 'text-blue-400',
        simpleExplanation: 'El aceite aún está frío y espeso. Evitá acelerar fuerte hasta que supere los 80°C.',
        idealRangeText: 'Ideal: 85°C a 105°C',
        percentInRange: Math.min(100, (val / 95) * 100),
        isWarningOrDanger: false
      };
    } else if (val < 85) {
      return {
        status: 'good',
        statusLabel: 'Templando',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'El lubricante ya fluye bien protegiendo cojinetes y partes móviles del motor.',
        idealRangeText: 'Ideal: 85°C a 105°C',
        percentInRange: 70,
        isWarningOrDanger: false
      };
    } else if (val <= 108) {
      return {
        status: 'optimal',
        statusLabel: 'Temperatura Óptima',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Excelente. Temperatura perfecta para que el aceite lubrique con máxima protección.',
        idealRangeText: 'Ideal: 85°C a 105°C',
        percentInRange: 85,
        isWarningOrDanger: false
      };
    } else if (val <= 118) {
      return {
        status: 'warning',
        statusLabel: 'Aceite Exigido',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'Temperatura elevada (común en cargas pesadas o ruta rápida). Controlá que no siga subiendo.',
        idealRangeText: 'Límite normal: <110°C',
        percentInRange: 94,
        isWarningOrDanger: true
      };
    } else {
      return {
        status: 'danger',
        statusLabel: '¡Aceite Muy Caliente!',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: '¡Peligro! El aceite supera los 118°C y se degrada rápidamente, perdiendo lubricación.',
        idealRangeText: 'Máximo recomendado: 110°C',
        percentInRange: 100,
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 3. PRESIÓN DE ACEITE (oilPressureKpa / Ford / UDS)
  // =========================================================================
  if (cleanPid.includes('OIL_PRESS') || cleanPid === '2211C6') {
    if (val < 140) {
      return {
        status: 'danger',
        statusLabel: '¡Presión Crítica Baja!',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: '¡Peligro urgente! Falta presión de aceite. Riesgo inmediato de fundir el motor. Detener ya.',
        idealRangeText: 'Mínimo seguro: >160 kPa',
        percentInRange: 15,
        isWarningOrDanger: true
      };
    } else if (val < 220) {
      return {
        status: 'good',
        statusLabel: 'Normal en Ralentí',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Presión adecuada con el motor regulando en reposo.',
        idealRangeText: 'Ralentí: 160-250 kPa',
        percentInRange: 50,
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'optimal',
        statusLabel: 'Presión Óptima',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Bomba de aceite trabajando con fuerza. Lubricación impecable en todo el motor.',
        idealRangeText: 'Marcha: 250 a 500 kPa',
        percentInRange: 80,
        isWarningOrDanger: false
      };
    }
  }

  // =========================================================================
  // 4. BATERÍA / VOLTAJE (ATRV / PID 42 / Voltaje Batería)
  // =========================================================================
  if (cleanPid === 'ATRV' || cleanPid === '42' || cleanPid.includes('VOLT') || cleanPid.includes('BATT')) {
    if (val < 11.7) {
      return {
        status: 'danger',
        statusLabel: 'Batería Descargada',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: 'Tensión muy baja (<11.7V). La batería tiene poca carga y puede fallar el arranque.',
        idealRangeText: 'Parado: 12.2V - 12.6V',
        percentInRange: 15,
        isWarningOrDanger: true
      };
    } else if (val < 12.7) {
      return {
        status: 'good',
        statusLabel: 'Batería en Reposo',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'Carga normal de la batería con el motor apagado o en contacto.',
        idealRangeText: 'Parado: 12.2V a 12.6V',
        percentInRange: 60,
        isWarningOrDanger: false
      };
    } else if (val <= 14.8) {
      return {
        status: 'optimal',
        statusLabel: 'Alternador Cargando OK',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Excelente. El alternador está cargando la batería y alimentando las luces sin problemas.',
        idealRangeText: 'En marcha: 13.5V a 14.7V',
        percentInRange: 85,
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'danger',
        statusLabel: '¡Sobrecarga Eléctrica!',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: '¡Peligro! Voltaje excesivo (>14.8V). Regulador averiado, puede quemar focos y electrónica.',
        idealRangeText: 'Máximo seguro: 14.8V',
        percentInRange: 100,
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 5. PRESIÓN COMMON RAIL DIÉSEL (PID 23 / FRP_V)
  // =========================================================================
  if (cleanPid === '23' || cleanPid === 'FRP_V' || cleanPid.includes('RAIL')) {
    // Si viene en Voltios (FRP_V de Nissan YD25):
    if (cleanPid === 'FRP_V' || (currentValueStr && currentValueStr.includes('V'))) {
      if (val < 0.8) {
        return {
          status: 'danger',
          statusLabel: 'Sensor Sin Señal',
          badgeColorClass: 'bg-red-950 text-red-300 border-red-600',
          textColorClass: 'text-red-400',
          simpleExplanation: 'Voltaje por debajo de tolerancia de fábrica (0.8V). Posible sensor desenchufado.',
          idealRangeText: 'Manual Nissan: 1.0V a 3.8V',
          isWarningOrDanger: true
        };
      } else if (val <= 1.6) {
        return {
          status: 'optimal',
          statusLabel: 'Presión Ralentí Normal',
          badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
          textColorClass: 'text-emerald-400',
          simpleExplanation: 'Sensor de rampa Denso en valor oficial para ralentí (1.3V a 1.5V según manual de taller).',
          idealRangeText: 'Ralentí: ~1.4V (~350 bar)',
          isWarningOrDanger: false
        };
      } else {
        return {
          status: 'optimal',
          statusLabel: 'Presión en Carga Óptima',
          badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
          textColorClass: 'text-emerald-400',
          simpleExplanation: 'Inyección a plena presión para acelerar con fuerza y sin humo negro.',
          idealRangeText: 'Aceleración: 2.0V a 3.8V',
          isWarningOrDanger: false
        };
      }
    }

    // Viene en kPa o bar (PID 23):
    const bar = val > 1000 ? Math.round(val / 100) : val; // convertir kPa a bar si está en cientos de miles
    if (bar < 180) {
      return {
        status: 'danger',
        statusLabel: 'Baja Presión de Rampa',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: 'Falta presión en la rampa de inyectores. Puede causar tirones o apagado del motor.',
        idealRangeText: 'Ralentí: 280 a 400 bar',
        percentInRange: 15,
        isWarningOrDanger: true
      };
    } else if (bar <= 450) {
      return {
        status: 'optimal',
        statusLabel: 'Normal en Ralentí',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Presión perfecta de diésel con el motor regulando en baja (~300 a 400 bar).',
        idealRangeText: 'Ralentí: 280 a 400 bar',
        percentInRange: 40,
        isWarningOrDanger: false
      };
    } else if (bar <= 1700) {
      return {
        status: 'optimal',
        statusLabel: 'Potencia Óptima',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Presión alta y uniforme para pulverizar el gasoil finamente y con máxima potencia.',
        idealRangeText: 'En marcha: 500 a 1.600 bar',
        percentInRange: 80,
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'danger',
        statusLabel: 'Sobrepresión Peligrosa',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: 'Presión excesiva en el riel (>1.700 bar). Riesgo de rotura de toberas o mangueras.',
        idealRangeText: 'Máximo de fábrica: 1.650 bar',
        percentInRange: 100,
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 6. PRESIÓN MÚLTIPLE ADMISIÓN (MAP, PID 0B)
  // =========================================================================
  if (cleanPid === '0B' || cleanPid.includes('MAP')) {
    if (val < 65) {
      return {
        status: 'good',
        statusLabel: 'Buen Vacío (Retención)',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'Vacío normal con acelerador cerrado en desaceleración.',
        idealRangeText: 'Retención: 25 a 65 kPa',
        isWarningOrDanger: false
      };
    } else if (val <= 110) {
      return {
        status: 'optimal',
        statusLabel: 'Normal Atmosférico',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Presión atmosférica estándar (~100 kPa). Entrada de aire limpia y sin restricciones.',
        idealRangeText: 'Ralentí/reposo: ~100 kPa',
        isWarningOrDanger: false
      };
    } else if (val <= 230) {
      return {
        status: 'optimal',
        statusLabel: 'Turbo Inflando Bien',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'El turbo está soplando aire comprimido con fuerza para entregar máxima potencia.',
        idealRangeText: 'Con turbo: 120 a 220 kPa',
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'warning',
        statusLabel: 'Soplado Máximo',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'Presión muy alta de sobrealimentación. Al límite del mapa de inyección.',
        idealRangeText: 'Límite seguro: <240 kPa',
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 7. CAUDALÍMETRO DE AIRE (MAF, PID 10 / MAF_V)
  // =========================================================================
  if (cleanPid === '10' || cleanPid === 'MAF_V' || cleanPid.includes('MAF')) {
    if (cleanPid === 'MAF_V' || (currentValueStr && currentValueStr.includes('V'))) {
      if (val < 1.0) {
        return {
          status: 'warning',
          statusLabel: 'Señal Débil',
          badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          textColorClass: 'text-amber-400',
          simpleExplanation: 'Tensión baja del caudalímetro. Puede indicar sensor sucio.',
          idealRangeText: 'Normal: 1.2V a 3.8V',
          isWarningOrDanger: false
        };
      }
      return {
        status: 'optimal',
        statusLabel: 'Lectura MAF Sana',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'El hilo caliente del caudalímetro responde dentro del rango oficial de fábrica.',
        idealRangeText: 'Ralentí: ~1.3V | Carga: >2.2V',
        isWarningOrDanger: false
      };
    }

    if (val < 3 && isEngineOn) {
      return {
        status: 'warning',
        statusLabel: 'Poco Flujo de Aire',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'Flujo muy bajo con motor encendido. Revisá el filtro de aire o limpieza del sensor.',
        idealRangeText: 'Ralentí: 8 a 18 g/s',
        isWarningOrDanger: true
      };
    } else if (val <= 20) {
      return {
        status: 'optimal',
        statusLabel: 'Flujo Normal en Ralentí',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'El motor respira la cantidad exacta de aire para no emitir humo negro.',
        idealRangeText: 'Ralentí: 8 a 18 g/s',
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'optimal',
        statusLabel: 'Excelente Aspiración',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Caudal de aire abundante acorde a la aceleración.',
        idealRangeText: 'Acelerando: 25 a 140 g/s',
        isWarningOrDanger: false
      };
    }
  }

  // =========================================================================
  // 8. CARGA CALCULADA DE MOTOR (PID 04)
  // =========================================================================
  if (cleanPid === '04' || cleanPid.includes('LOAD')) {
    if (val < 35) {
      return {
        status: 'optimal',
        statusLabel: 'Marcha Liviana',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'El motor trabaja descansado, con mínimo desgaste y bajo consumo.',
        idealRangeText: 'Descanso: 15% a 35%',
        percentInRange: val,
        isWarningOrDanger: false
      };
    } else if (val <= 75) {
      return {
        status: 'good',
        statusLabel: 'Carga Moderada',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'Fuerza normal requerida para circular en calles o ruta.',
        idealRangeText: 'Uso normal: 35% a 75%',
        percentInRange: val,
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'warning',
        statusLabel: 'Exigencia Fuerte',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'El motor está haciendo mucha fuerza (subiendo pendiente o camión muy cargado).',
        idealRangeText: 'Esfuerzo alto: >80%',
        percentInRange: val,
        isWarningOrDanger: false
      };
    }
  }

  // =========================================================================
  // 9. NIVEL DE COMBUSTIBLE (PID 2F)
  // =========================================================================
  if (cleanPid === '2F' || cleanPid.includes('FUEL_LEVEL')) {
    if (val < 15) {
      return {
        status: 'danger',
        statusLabel: '¡Reserva Crítica!',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: 'Queda menos del 15%. Cargar combustible cuanto antes para no aspirar sedimentos del fondo.',
        idealRangeText: 'Mínimo seguro: >20%',
        percentInRange: val,
        isWarningOrDanger: true
      };
    } else if (val < 30) {
      return {
        status: 'warning',
        statusLabel: 'Nivel Bajo',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'Menos de un cuarto de tanque. Planificá una parada para repostar pronto.',
        idealRangeText: 'Recomendado: >30%',
        percentInRange: val,
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'optimal',
        statusLabel: 'Combustible Suficiente',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Buen nivel en el tanque para completar la jornada laboral sin sobresaltos.',
        idealRangeText: 'Rango óptimo: 30% a 100%',
        percentInRange: val,
        isWarningOrDanger: false
      };
    }
  }

  // =========================================================================
  // 10. AJUSTES DE COMBUSTIBLE (STFT 06 / LTFT 07)
  // =========================================================================
  if (cleanPid === '06' || cleanPid === '07' || cleanPid.includes('TRIM')) {
    const absVal = Math.abs(val);
    if (absVal <= 7) {
      return {
        status: 'optimal',
        statusLabel: 'Mezcla Perfecta',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'La inyección dosifica combustible con exactitud matemática (desvío menor a 7%).',
        idealRangeText: 'Ideal: entre -7% y +7%',
        percentInRange: 50,
        isWarningOrDanger: false
      };
    } else if (absVal <= 14) {
      return {
        status: 'good',
        statusLabel: 'Corrección Aceptable',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'Compensación normal de la computadora ante cambios de clima o nafta.',
        idealRangeText: 'Tolerancia: ±12%',
        percentInRange: 65,
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'warning',
        statusLabel: val > 0 ? 'Mezcla Pobre (Compensando)' : 'Mezcla Rica',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: val > 0 
          ? 'La computadora agrega nafta extra porque entra demasiado aire (posible chupada de aire).'
          : 'La computadora quita combustible porque sobra nafta (posible inyector goteando).',
        idealRangeText: 'Límite normal: ±15%',
        percentInRange: 90,
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 11. TEMPERATURA AIRE ADMISIÓN (IAT, PID 0F)
  // =========================================================================
  if (cleanPid === '0F' || cleanPid.includes('INTAKE_TEMP')) {
    if (val <= 45) {
      return {
        status: 'optimal',
        statusLabel: 'Aire Fresco Óptimo',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'El aire entra fresco al motor, lo que da máxima potencia y rendimiento térmico.',
        idealRangeText: 'Ideal: 15°C a 45°C',
        isWarningOrDanger: false
      };
    } else if (val <= 65) {
      return {
        status: 'good',
        statusLabel: 'Normal en Tránsito',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'Temperatura habitual cuando se circula despacio o con calor de asfalto.',
        idealRangeText: 'Normal: <60°C',
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'warning',
        statusLabel: 'Aire Caliente',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'Aire muy caliente bajo el capó. Puede quitarle algo de pique al motor.',
        idealRangeText: 'Límite aconsejado: <65°C',
        isWarningOrDanger: false
      };
    }
  }

  // =========================================================================
  // 12. FALLAS DE ENCENDIDO (MISFIRES / TOTALMISFIRES)
  // =========================================================================
  if (cleanPid.includes('MISFIRE') || cleanPid === '221616') {
    if (val === 0) {
      return {
        status: 'optimal',
        statusLabel: '0 Fallas (Perfecto)',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Todos los cilindros quemanParejo sin cortes de chispa ni de inyección.',
        idealRangeText: 'Ideal: 0 fallas',
        isWarningOrDanger: false
      };
    } else if (val <= 5) {
      return {
        status: 'warning',
        statusLabel: 'Fallas Aisladas',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'Se registraron algunos cortes de combustión esporádicos. Conviene revisar bujías o toberas.',
        idealRangeText: 'Normal: 0 fallas',
        isWarningOrDanger: true
      };
    } else {
      return {
        status: 'danger',
        statusLabel: '¡Falla de Encendido Grave!',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: 'Un cilindro no está quemando bien. El motor tiembla y pierde fuerza.',
        idealRangeText: 'Máximo tolerado: 0',
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 13. TEMPERATURA TRANSMISIÓN / CAJA DE CAMBIOS
  // =========================================================================
  if (cleanPid.includes('TRANS') || cleanPid === '221E1C') {
    if (val <= 95) {
      return {
        status: 'optimal',
        statusLabel: 'Caja Óptima',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Aceite de transmisión a temperatura perfecta para engranajes y embragues.',
        idealRangeText: 'Normal: 65°C a 95°C',
        isWarningOrDanger: false
      };
    } else if (val <= 110) {
      return {
        status: 'warning',
        statusLabel: 'Caja Exigida',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: 'Caja caliente por esfuerzo continuo o remolque pesado.',
        idealRangeText: 'Límite seguro: <100°C',
        isWarningOrDanger: true
      };
    } else {
      return {
        status: 'danger',
        statusLabel: '¡Sobrecalentamiento Caja!',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: '¡Peligro! Temperatura muy alta en la caja. Puede quemar el fluido de transmisión.',
        idealRangeText: 'Máximo seguro: 105°C',
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 14. POSICIÓN ACELERADOR / MARIPOSA (PID 11 / APP1)
  // =========================================================================
  if (cleanPid === '11' || cleanPid.startsWith('APP') || cleanPid.includes('THROTTLE')) {
    if (val < 5) {
      return {
        status: 'optimal',
        statusLabel: 'Reposo / Sin Pisar',
        badgeColorClass: 'bg-slate-900 text-slate-300 border-slate-700',
        textColorClass: 'text-slate-300',
        simpleExplanation: 'Pedal suelto, motor regulando sin acelerar.',
        idealRangeText: 'Reposo: 0% a 5%',
        isWarningOrDanger: false
      };
    } else if (val <= 50) {
      return {
        status: 'optimal',
        statusLabel: 'Aceleración Suave',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Presión normal del pedal para avanzar con fluidez y bajo consumo.',
        idealRangeText: 'Crucero: 10% a 40%',
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'good',
        statusLabel: 'Acelerando Fuerte',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'Acelerador bien apretado pidiendo toda la fuerza del motor.',
        idealRangeText: 'A fondo: >80%',
        isWarningOrDanger: false
      };
    }
  }

  // =========================================================================
  // 15. RPM DEL MOTOR (PID 0C)
  // =========================================================================
  if (cleanPid === '0C' || cleanPid.includes('RPM')) {
    if (val === 0) {
      return {
        status: 'unknown',
        statusLabel: 'Motor Detenido',
        badgeColorClass: 'bg-slate-900 text-slate-400 border-slate-800',
        textColorClass: 'text-slate-400',
        simpleExplanation: 'El motor está apagado o en contacto.',
        idealRangeText: 'Parado: 0 RPM',
        isWarningOrDanger: false
      };
    } else if (val <= 950) {
      return {
        status: 'optimal',
        statusLabel: 'Ralentí Parejo',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'El motor regula suavemente sin vibraciones ni tironeos.',
        idealRangeText: 'Ralentí: 650 a 900 RPM',
        isWarningOrDanger: false
      };
    } else if (val <= 2800) {
      return {
        status: 'optimal',
        statusLabel: 'Régimen Ideal',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Zona óptima de torque, marcha descansada y máxima vida útil.',
        idealRangeText: 'Económico: 1.400 a 2.500 RPM',
        isWarningOrDanger: false
      };
    } else if (val <= 3800) {
      return {
        status: 'good',
        statusLabel: 'Revoluciones Altas',
        badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        textColorClass: 'text-cyan-300',
        simpleExplanation: 'Marcha rápida o sobrepaso de vehículos. Consumo más alto.',
        idealRangeText: 'Veloz: 2.800 a 3.500 RPM',
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'danger',
        statusLabel: '¡Zona Roja / Peligro!',
        badgeColorClass: 'bg-red-950 text-red-200 border-red-600 animate-pulse',
        textColorClass: 'text-red-400',
        simpleExplanation: '¡Demasiadas revoluciones! Pasá a un cambio más alto para no forzar las bielas.',
        idealRangeText: 'Máximo aconsejado: <3.800 RPM',
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 16. DISTANCIA CON LUZ CHECK ENGINE (PID 21)
  // =========================================================================
  if (cleanPid === '21') {
    if (val === 0) {
      return {
        status: 'optimal',
        statusLabel: 'Sin Fallas Acumuladas',
        badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        textColorClass: 'text-emerald-400',
        simpleExplanation: 'Excelente. No se ha circulado ningún kilómetro con averías de motor.',
        idealRangeText: 'Objetivo: 0 km',
        isWarningOrDanger: false
      };
    } else {
      return {
        status: 'warning',
        statusLabel: 'Circuló con Falla',
        badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
        textColorClass: 'text-amber-400',
        simpleExplanation: `El vehículo anduvo ${val} km con la luz de motor prendida. Conviene escanear la causa.`,
        idealRangeText: 'Recomendación: Escanear DTC',
        isWarningOrDanger: true
      };
    }
  }

  // =========================================================================
  // 17. AVANCE DE INYECCIÓN / ENCENDIDO (PID 0E)
  // =========================================================================
  if (cleanPid === '0E') {
    return {
      status: 'optimal',
      statusLabel: 'Avance Normal',
      badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
      textColorClass: 'text-emerald-400',
      simpleExplanation: 'La computadora adelanta la chispa/inyección con precisión para que la combustión sea limpia.',
      idealRangeText: 'Régimen: 5° a 25°',
      isWarningOrDanger: false
    };
  }

  // =========================================================================
  // 18. PRESIÓN BAROMÉTRICA (PID 33)
  // =========================================================================
  if (cleanPid === '33') {
    return {
      status: 'optimal',
      statusLabel: val >= 95 ? 'Nivel del Mar' : 'Zona de Altura',
      badgeColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      textColorClass: 'text-cyan-300',
      simpleExplanation: val >= 95 
        ? 'Presión normal del ambiente en llanura (~101 kPa).' 
        : 'Presión reducida por altitud geográfica (serranía o montaña).',
      idealRangeText: 'Referencia clima: ~100 kPa',
      isWarningOrDanger: false
    };
  }

  // =========================================================================
  // 19. APERTURA EGR (EGR_POS)
  // =========================================================================
  if (cleanPid === 'EGR_POS') {
    return {
      status: 'optimal',
      statusLabel: val === 0 ? 'EGR Cerrada (Potencia)' : 'EGR Abierta (Ecológica)',
      badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
      textColorClass: 'text-emerald-400',
      simpleExplanation: val === 0
        ? 'Válvula cerrada para dar máxima fuerza y aire limpio al motor.'
        : 'Recirculando gases de escape para reducir contaminación sin afectar la marcha.',
      idealRangeText: 'Modo automático por ECU',
      isWarningOrDanger: false
    };
  }

  // =========================================================================
  // 20. FALLBACK GENÉRICO AMIGABLE
  // =========================================================================
  return {
    status: 'good',
    statusLabel: 'En Rango Normal',
    badgeColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    textColorClass: 'text-emerald-400',
    simpleExplanation: 'El sensor transmite valores estables y dentro de los parámetros de funcionamiento.',
    idealRangeText: 'Parámetro en línea',
    isWarningOrDanger: false
  };
}

/**
 * Extrae el primer número de una cadena como "92°C", "14.2V", "290 kPa"
 */
function extractNumber(str?: string): number | null {
  if (!str) return null;
  const match = str.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return isNaN(n) ? null : n;
}
