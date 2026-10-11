import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Gauge,
  Thermometer,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  BatteryCharging,
  Car,
  Wrench,
  RefreshCw,
  Play,
  Pause,
  Radio,
  X,
  Info,
  Sliders,
  CheckSquare,
  Square,
  Plus,
  Layers,
  RotateCcw,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { OBDTelemetry, VehicleProfile } from '../../types/vehicle';
import { GaugeDial } from './GaugeDial';
import { elm327Service, SimulatorDrivingMode } from '../../services/elm327Bluetooth';
import { evaluateSensorHealth } from '../../services/sensorHealthEvaluator';

interface DashboardViewProps {
  telemetry: OBDTelemetry;
  vehicle: VehicleProfile;
  onNavigateToDTC: () => void;
  onNavigateToEco: () => void;
  onOpenGarage?: () => void;
  onNavigateToTerminal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  telemetry,
  vehicle,
  onNavigateToDTC,
  onNavigateToEco,
  onOpenGarage,
  onNavigateToTerminal
}) => {
  const [activeMode, setActiveMode] = useState<SimulatorDrivingMode>('crucero_autopista');
  const [isChangingProtocol, setIsChangingProtocol] = useState(false);
  const [protocolMessage, setProtocolMessage] = useState<string | null>(null);
  const [isReadingRpm, setIsReadingRpm] = useState(false);
  const [pollMode, setPollMode] = useState<'rpm_only' | 'all'>(elm327Service.getPollMode());

  // Fuel level calibration states
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [fuelSliderVal, setFuelSliderVal] = useState<number>(telemetry.fuelLevelPercent ?? 50);
  const [isTestingPid2F, setIsTestingPid2F] = useState(false);
  const [pid2FResult, setPid2FResult] = useState<string | null>(null);

  // ECU Sensors Modal states
  const [isSensorsModalOpen, setIsSensorsModalOpen] = useState(false);
  const [sensorCategoryFilter, setSensorCategoryFilter] = useState<string>('todos');

  useEffect(() => {
    if (!isFuelModalOpen && telemetry.fuelLevelPercent !== null && telemetry.fuelLevelPercent !== undefined) {
      setFuelSliderVal(telemetry.fuelLevelPercent);
    }
  }, [telemetry.fuelLevelPercent, isFuelModalOpen]);

  const handleSetQuickFuel = (percent: number) => {
    setFuelSliderVal(percent);
    elm327Service.setFuelLevelPercent(percent);
  };

  const handleResetToEcuFuel = () => {
    elm327Service.clearManualFuelLevel();
    setFuelSliderVal(50);
  };

  const handleTestPid2F = async () => {
    setIsTestingPid2F(true);
    setPid2FResult('Enviando PID 01 2F a la ECU...');
    try {
      const resp = await elm327Service.sendATCommand('01 2F', 2500);
      setPid2FResult(`Respuesta de la ECU: ${resp || '(sin datos)'}`);
    } catch (e: any) {
      setPid2FResult(`Error: ${e.message}`);
    } finally {
      setIsTestingPid2F(false);
    }
  };

  // Ensure polling is active when navigating to this view and trigger an initial read
  useEffect(() => {
    elm327Service.ensurePollingActive();
    if (telemetry.connectionState === 'connected') {
      elm327Service.pollRPMNow().catch(() => {});
    }
  }, [telemetry.connectionState]);

  const handleManualReadRpm = async () => {
    setIsReadingRpm(true);
    try {
      await elm327Service.pollRPMNow();
    } finally {
      setIsReadingRpm(false);
    }
  };

  const handleTogglePollMode = (mode: 'rpm_only' | 'all') => {
    setPollMode(mode);
    elm327Service.setPollMode(mode);
  };

  const handleForceProtocol = async (cmd: string, label: string) => {
    setIsChangingProtocol(true);
    setProtocolMessage(`Probando ${label}...`);
    try {
      const resp = await elm327Service.setProtocol(cmd);
      setProtocolMessage(`Respuesta: ${resp || 'Comando enviado'}`);
    } catch (e: any) {
      setProtocolMessage(`Error: ${e.message}`);
    } finally {
      setIsChangingProtocol(false);
    }
  };

  const handleSelectMode = (mode: SimulatorDrivingMode) => {
    setActiveMode(mode);
    elm327Service.setSimulationMode(mode);
  };

  const modes: Array<{ id: SimulatorDrivingMode; label: string; icon: string }> = [
    { id: 'crucero_autopista', label: 'Ruta (105 km/h)', icon: '🛣️' },
    { id: 'trafico_urbano', label: 'Ciudad / Semáforo', icon: '🚦' },
    { id: 'ralenti', label: 'Detenido en Marcha', icon: '🅿️' },
    { id: 'deportivo', label: 'Aceleración Rápida', icon: '⚡' },
    { id: 'falla_misfire', label: 'Probar Falla P0300', icon: '⚠️' },
    { id: 'falla_temperatura', label: 'Probar Calentamiento', icon: '🌡️' }
  ];

  // Derive active gear estimate based on RPM and Speed for realism
  const calculateGear = (speed: number, rpm: number): string => {
    if (speed < 2) return 'N';
    const ratio = speed / (rpm || 1);
    if (ratio < 0.015) return '1ª';
    if (ratio < 0.026) return '2ª';
    if (ratio < 0.038) return '3ª';
    if (ratio < 0.048) return '4ª';
    return '5ª';
  };

  const currentGear = calculateGear(telemetry.speed, telemetry.rpm);
  const isHighTemp = telemetry.coolantTemp > 102;
  const isColdTemp = telemetry.coolantTemp < 75;
  const isLowFuel = telemetry.fuelLevelPercent !== null && telemetry.fuelLevelSensorStatus !== 'unsupported_by_ecu' && telemetry.fuelLevelPercent < 15;
  const isBatteryOk = telemetry.batteryVoltage >= 13.5 && telemetry.batteryVoltage <= 14.8;

  return (
    <div className="space-y-3.5 max-w-2xl mx-auto">
      {/* 1. Compact Header Bar: Live Indicator & Status Pill */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">EN VIVO</span>
              <span className="text-[10px] text-slate-400 truncate">
                · {vehicle.brand} {vehicle.model}
              </span>
            </div>
          </div>
        </div>

        {/* Right buttons: ECU Sensors Count & Engine Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsSensorsModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/60 text-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Ver cuántos sensores lee la computadora de este vehículo"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Sensores: <strong className="text-white font-mono">{telemetry.supportedSensorsCount || 16}</strong>
              <span className="text-[10px] text-emerald-400 ml-1 font-mono hidden sm:inline">({telemetry.activeSensorsCount || 6} en vivo)</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>

          {/* Quick Alert or Engine Status */}
          {telemetry.activeDtcsCount > 0 ? (
            <button
              onClick={onNavigateToDTC}
              className="shrink-0 px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{telemetry.activeDtcsCount} {telemetry.activeDtcsCount === 1 ? 'Falla' : 'Fallas'}</span>
              <ChevronRight className="w-3 h-3 text-amber-400/80" />
            </button>
          ) : (
            <div className="shrink-0 px-2.5 py-1 text-[11px] font-medium bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Sistema OK</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Instrument Cluster (Balanced Twin Dials + Center Telemetry) */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800/90 rounded-2xl p-3.5 sm:p-5 relative overflow-hidden shadow-xl">
        {/* Subtle cluster ambient glow */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tell-Tale Status Strip across top of the cluster */}
        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800/80 text-[11px] font-semibold">
          <div
            onClick={onNavigateToDTC}
            className={`flex items-center gap-1 cursor-pointer transition-colors ${
              telemetry.activeDtcsCount > 0 ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-600'
            }`}
            title="Luz Check Engine"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>CHECK</span>
          </div>

          <div
            className={`flex items-center gap-1 ${
              isHighTemp ? 'text-red-400 font-bold animate-pulse' : isColdTemp ? 'text-blue-400' : 'text-emerald-400'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span className="font-mono">{telemetry.coolantTemp.toFixed(0)}°C</span>
          </div>

          <div
            className={`flex items-center gap-1 ${
              telemetry.fuelLevelPercent === null || telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu'
                ? 'text-amber-400'
                : isLowFuel
                ? 'text-red-400 font-bold animate-pulse'
                : 'text-slate-300'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">
              {telemetry.fuelLevelPercent === null || telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu'
                ? 'NO DATA'
                : `${telemetry.fuelLevelPercent.toFixed(0)}%`}
            </span>
          </div>

          <div
            className={`flex items-center gap-1 ${
              isBatteryOk ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="font-mono">{telemetry.batteryVoltage.toFixed(1)}V</span>
          </div>
        </div>

        {/* Compact Twin Dials + Center Data in One Mobile Row */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 py-1">
          {/* Left: Balanced Speedometer */}
          <div className="flex-1 flex justify-center">
            <GaugeDial
              value={telemetry.speed}
              min={0}
              max={220}
              label="Velocidad"
              unit="km/h"
              size={120}
              color="#06b6d4"
              decimals={0}
              labelPosition="top"
            />
          </div>

          {/* Center: Gear & Instant Consumption / Range */}
          <div className="w-20 sm:w-26 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-950/90 border border-slate-800 text-center shrink-0 shadow-inner">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Marcha
            </span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono leading-none my-1">
              {currentGear}
            </div>

            <div className="w-full pt-1.5 mt-1 border-t border-slate-800/80 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 leading-tight">Consumo</span>
              <span className="text-[11px] sm:text-xs font-bold font-mono text-white leading-tight">
                {telemetry.speed > 5
                  ? `${telemetry.instantConsumptionL100km.toFixed(1)} L/100`
                  : `${telemetry.instantConsumptionL100km.toFixed(1)} L/h`}
              </span>
            </div>

            <div className="w-full pt-1 mt-1 border-t border-slate-800/80 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 leading-tight">Autonomía</span>
              <span className="text-[11px] sm:text-xs font-bold font-mono text-emerald-400 leading-tight">
                ~{telemetry.rangeKmRemaining} km
              </span>
            </div>
          </div>

          {/* Right: Balanced Tachometer (RPM) with Redline */}
          <div className="flex-1 flex justify-center">
            <GaugeDial
              value={telemetry.rpm}
              min={0}
              max={7000}
              label="RPM Motor"
              unit="RPM"
              size={120}
              color={telemetry.rpm > 5500 ? '#ef4444' : '#38bdf8'}
              decimals={0}
              labelPosition="top"
              zones={[
                { from: 0, to: 5500, color: '#06b6d4' },
                { from: 5500, to: 7000, color: '#ef4444' }
              ]}
            />
          </div>
        </div>

        {/* Instant RPM Action & Live Stream Bar */}
        <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualReadRpm}
              disabled={isReadingRpm}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              title="Solicitar lectura inmediata de RPM a la ECU"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReadingRpm ? 'animate-spin' : ''}`} />
              <span>{isReadingRpm ? 'Leyendo...' : '⚡ Leer RPM Ahora'}</span>
            </button>

            {telemetry.connectionState === 'connected' && (
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[10px]">
                <button
                  onClick={() => handleTogglePollMode('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    pollMode === 'all'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Lee todos los sensores (velocidad, agua, acelerador, carga, batería, MAP) en tiempo real"
                >
                  🟢 Todos los Sensores
                </button>
                <button
                  onClick={() => handleTogglePollMode('rpm_only')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    pollMode === 'rpm_only'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Enfoca todo el ancho de banda exclusivamente en las RPM"
                >
                  ⚡ Solo RPM
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5 ml-auto">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">ECU:</span>
            <strong className="text-white font-bold">{telemetry.rpm} RPM</strong>
            {telemetry.lastRawResponse && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({telemetry.lastRawResponse})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Essential Vitals Grid (4 Uniform Compact Cards - All visible at a glance) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Card 1: Coolant / Motor Temp */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              Agua Motor
            </span>
            <span
              className={`text-sm font-black font-mono ${
                isHighTemp ? 'text-red-400 animate-pulse' : isColdTemp ? 'text-blue-400' : 'text-white'
              }`}
            >
              {telemetry.coolantTemp.toFixed(0)}°C
            </span>
          </div>

          {/* Clean status bar */}
          <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isHighTemp ? 'bg-red-500' : isColdTemp ? 'bg-blue-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(8, ((telemetry.coolantTemp - 40) / 80) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>Frío</span>
            <span className={isHighTemp ? 'text-red-400 font-bold' : isColdTemp ? 'text-blue-300 font-medium' : 'text-emerald-400 font-semibold'}>
              {isHighTemp ? '🔴 ¡Recalentando!' : isColdTemp ? '🟡 Calentando (<80°)' : '🟢 Óptima (No calienta)'}
            </span>
            <span>120°C</span>
          </div>
        </div>

        {/* Card 2: Fuel Level */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {vehicle.fuelType === 'diesel' ? 'Tanque Diésel' : vehicle.fuelType === 'gnc' ? 'Tanque GNC / Nafta' : 'Tanque Combustible'}
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              {telemetry.fuelLevelPercent === null || telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu' ? (
                <span className="text-xs font-black font-mono text-amber-400 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded shadow-sm">
                  NO DATA
                </span>
              ) : (
                <span
                  className={`text-sm font-black font-mono ${
                    isLowFuel ? 'text-red-400 animate-pulse' : 'text-white'
                  }`}
                >
                  {telemetry.fuelLevelPercent.toFixed(0)}%
                  {telemetry.fuelLevelSensorStatus === 'manual_calibrated' && (
                    <span className="text-[9px] text-cyan-300 font-sans ml-1 font-semibold">(Manual)</span>
                  )}
                </span>
              )}
              <button
                onClick={() => setIsFuelModalOpen(true)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-[10px] text-cyan-300 font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Ajustar o calibrar nivel de tanque"
              >
                {telemetry.fuelLevelPercent === null || telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu' ? 'Ingresar %' : 'Ajustar'}
              </button>
            </div>
          </div>

          {/* Clean status bar */}
          <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
            {telemetry.fuelLevelPercent === null || telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu' ? (
              <div className="h-full bg-slate-800/80 w-full" />
            ) : (
              <div
                className={`h-full transition-all duration-300 ${
                  isLowFuel ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, telemetry.fuelLevelPercent))}%` }}
              />
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            {telemetry.fuelLevelPercent === null || telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu' ? (
              <>
                <span className="text-amber-400/90 font-mono">Sin lectura ECU</span>
                <span className="text-slate-500 font-mono">~Sin dato km</span>
                <button
                  onClick={() => setIsFuelModalOpen(true)}
                  className="text-cyan-400 hover:underline cursor-pointer text-[10px] font-semibold"
                >
                  + Calibrar
                </button>
              </>
            ) : (
              <>
                <span className={isLowFuel ? 'text-red-400 font-bold' : ''}>
                  {Math.round(((telemetry.fuelLevelPercent || 0) / 100) * (vehicle.tankCapacityLiters || 75))}L / {vehicle.tankCapacityLiters || 75}L
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  ~{telemetry.rangeKmRemaining} km
                </span>
                <button
                  onClick={() => setIsFuelModalOpen(true)}
                  className="text-cyan-400 hover:underline cursor-pointer text-[10px]"
                >
                  Ajustar
                </button>
              </>
            )}
          </div>

          {/* Badge when ECU reports no fuel PID (classic pre-2008 / Nissan 2006) */}
          {(telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu' || telemetry.fuelLevelPercent === null) ? (
            <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-amber-300/90">
              <span className="truncate flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                ECU: Flotante directo a aguja (PID 012F NO DATA)
              </span>
              <button
                onClick={() => setIsFuelModalOpen(true)}
                className="underline font-bold text-amber-300 shrink-0 ml-1 cursor-pointer"
              >
                Setear aguja
              </button>
            </div>
          ) : telemetry.fuelLevelSensorStatus === 'manual_calibrated' ? (
            <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-cyan-300/90">
              <span className="truncate">Nivel ingresado manualmente</span>
              <button
                onClick={handleResetToEcuFuel}
                className="underline text-slate-400 hover:text-cyan-300 shrink-0 ml-1 cursor-pointer"
                title="Volver a intentar leer sensor original de la ECU"
              >
                Reintentar ECU
              </button>
            </div>
          ) : null}
        </div>

        {/* Card 3: Throttle Position */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Acelerador
            </span>
            <span className="text-sm font-black font-mono text-white">
              {telemetry.throttlePos.toFixed(0)}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-400 transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(5, telemetry.throttlePos))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Reposo</span>
            <span>
              {telemetry.throttlePos > 60 ? 'Fuerte' : telemetry.throttlePos > 20 ? 'Medio' : 'Suave'}
            </span>
            <span>A fondo</span>
          </div>
        </div>

        {/* Card 4: Battery & Alternator */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-yellow-400" />
              Batería / Carga
            </span>
            <span className="text-sm font-black font-mono text-white">
              {telemetry.batteryVoltage.toFixed(1)}V
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isBatteryOk ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(15, ((telemetry.batteryVoltage - 10) / 5) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>11.5V</span>
            <span className={`font-semibold ${
              telemetry.batteryVoltage < 11.8 
                ? 'text-red-400 font-bold' 
                : telemetry.batteryVoltage > 14.8 
                ? 'text-red-400 font-bold' 
                : telemetry.batteryVoltage >= 13.5 
                ? 'text-emerald-400' 
                : 'text-cyan-300'
            }`}>
              {telemetry.batteryVoltage < 11.8 
                ? '🔴 Batería Baja (<11.8V)' 
                : telemetry.batteryVoltage > 14.8 
                ? '🔴 ¡Sobrecarga (>14.8V)!' 
                : telemetry.batteryVoltage >= 13.5 
                ? '🟢 Cargando OK (Alternador)' 
                : '🟢 Batería OK (Reposo)'}
            </span>
            <span>14.8V</span>
          </div>
        </div>
      </div>

      {/* 4. Dynamic Live Sensors Grid: Monitored based on user's check selections */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-0.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span>Sensores Monitoreados en Vivo</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/80">
                  {((telemetry.supportedSensorsList || []).filter(s => s.isPinned)).length} MARCADOS
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSensorsModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Marcar o desmarcar sensores con check para mostrar en vivo"
            >
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Elegir Sensores (Check)</span>
            </button>
          </div>
        </div>

        {((telemetry.supportedSensorsList || []).filter(s => s.isPinned)).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {(telemetry.supportedSensorsList || [])
              .filter(s => s.isPinned)
              .map(sensor => {
                const isFuel = sensor.pid.includes('2F');
                const health = evaluateSensorHealth(
                  sensor.pid,
                  sensor.numericValue,
                  sensor.currentValue,
                  {
                    isEngineRunning: telemetry.isEngineRunning,
                    batteryVoltage: telemetry.batteryVoltage,
                    coolantTemp: telemetry.coolantTemp,
                    speed: telemetry.speed,
                    fuelType: vehicle.fuelType
                  }
                );

                const isDanger = health.status === 'danger';
                const isWarning = health.status === 'warning';
                const isOptimal = health.status === 'optimal' || health.status === 'good';

                return (
                  <div
                    key={sensor.pid}
                    className={`bg-slate-900/95 rounded-xl p-3 flex flex-col justify-between transition-all group relative overflow-hidden border ${
                      isDanger
                        ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.22)] bg-gradient-to-b from-red-950/25 to-slate-900/95'
                        : isWarning
                        ? 'border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.18)] bg-gradient-to-b from-amber-950/20 to-slate-900/95'
                        : 'border-slate-800/90 hover:border-cyan-500/50'
                    }`}
                  >
                    {/* Header: PID, Categoría y Botón desmarcar */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[9px] font-bold text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {sensor.pid}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {sensor.category}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-100 block truncate mt-1" title={sensor.name}>
                          {sensor.name}
                        </span>
                      </div>

                      {/* Botón rápido para quitar del tablero */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          elm327Service.togglePinnedSensor(sensor.pid);
                        }}
                        className="p-1 -mr-1 -mt-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                        title="Quitar este sensor del tablero"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Métrica + Semáforo en Lenguaje Claro */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
                        <span className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                          isDanger ? 'text-red-400 animate-pulse' : isWarning ? 'text-amber-300' : 'text-white'
                        }`}>
                          {sensor.currentValue}
                        </span>

                        {/* Estado: Semáforo directo para quien no sabe nada de autos */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 ${health.badgeColorClass}`}>
                          {isDanger ? (
                            <AlertTriangle className="w-3 h-3 text-red-300 animate-bounce shrink-0" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-3 h-3 text-amber-300 shrink-0" />
                          ) : isOptimal ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          )}
                          <span>{health.statusLabel}</span>
                        </span>
                      </div>

                      {/* Explicación amigable para cualquier persona */}
                      <p className={`text-[11px] leading-snug ${
                        isDanger ? 'text-red-300 font-semibold' : isWarning ? 'text-amber-200/90' : 'text-slate-300'
                      }`}>
                        {health.simpleExplanation}
                      </p>

                      {/* Rango de referencia ideal y estado de enlace */}
                      <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400">
                        <span className="truncate text-slate-400 font-mono" title={health.idealRangeText}>
                          {health.idealRangeText}
                        </span>
                        {sensor.isActive ? (
                          <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            En vivo
                          </span>
                        ) : isFuel ? (
                          <span className="text-[9px] font-bold font-mono text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1 rounded">
                            NO DATA
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500">
                            {sensor.isSupported ? 'Disponible' : 'Sin señal'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800/80 border-dashed rounded-xl p-4 text-center space-y-2">
            <SlidersHorizontal className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-300 font-semibold">
              No tenés sensores marcados para mostrar en vivo
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Podés presionar en el check de cualquier sensor de la ECU para monitorearlo en tiempo real en este tablero.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => elm327Service.resetPinnedSensorsToDefault()}
                className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-colors cursor-pointer"
              >
                Marcar Recomendados
              </button>
              <button
                onClick={() => setIsSensorsModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Abrir Selector de Sensores
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4.5 Extended UDS Sensors (Mode 22 / Manufacturer Telemetry from Ford & VAG) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-white">Telemetría Avanzada (Modo 22 UDS / Fabricante)</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
            {vehicle.brand} / CAN UDS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Oil Pressure */}
          {(() => {
            const pressVal = telemetry.oilPressureKpa || 290;
            const h = evaluateSensorHealth('OIL_PRESS', pressVal);
            return (
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                h.status === 'danger' ? 'bg-red-950/30 border-red-500/70' : 'bg-slate-950/80 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Presión Aceite</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${h.badgeColorClass}`}>
                    {h.statusLabel}
                  </span>
                </div>
                <div className="my-1">
                  <span className="text-sm sm:text-base font-black font-mono text-cyan-300">
                    {pressVal} <span className="text-[10px] text-slate-400 font-sans">kPa</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                    (~{(pressVal / 100).toFixed(1)} bar)
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 line-clamp-1" title={h.simpleExplanation}>
                  {h.simpleExplanation}
                </span>
              </div>
            );
          })()}

          {/* Oil Temp */}
          {(() => {
            const oilVal = telemetry.oilTemp || 92;
            const h = evaluateSensorHealth('5C', oilVal);
            return (
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                h.status === 'danger' ? 'bg-red-950/30 border-red-500/70' : h.status === 'warning' ? 'bg-amber-950/30 border-amber-500/60' : 'bg-slate-950/80 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Temp. Aceite</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${h.badgeColorClass}`}>
                    {h.statusLabel}
                  </span>
                </div>
                <div className="my-1">
                  <span className={`text-sm sm:text-base font-black font-mono ${h.textColorClass}`}>
                    {oilVal}°C
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 line-clamp-1" title={h.simpleExplanation}>
                  {h.simpleExplanation}
                </span>
              </div>
            );
          })()}

          {/* Transmission Temp */}
          {(() => {
            const transVal = telemetry.transmissionTemp || 83;
            const h = evaluateSensorHealth('TRANS', transVal);
            return (
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                h.status === 'danger' ? 'bg-red-950/30 border-red-500/70' : 'bg-slate-950/80 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Fluido Caja</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${h.badgeColorClass}`}>
                    {h.statusLabel}
                  </span>
                </div>
                <div className="my-1">
                  <span className="text-sm sm:text-base font-black font-mono text-purple-300">
                    {transVal}°C
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 line-clamp-1" title={h.simpleExplanation}>
                  {h.simpleExplanation}
                </span>
              </div>
            );
          })()}

          {/* Total Misfires */}
          {(() => {
            const misfireVal = telemetry.totalMisfires || 0;
            const h = evaluateSensorHealth('MISFIRE', misfireVal);
            return (
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                h.status === 'danger' ? 'bg-red-950/30 border-red-500/70 animate-pulse' : 'bg-slate-950/80 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Fallas Encendido</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${h.badgeColorClass}`}>
                    {h.statusLabel}
                  </span>
                </div>
                <div className="my-1">
                  <span className={`text-sm sm:text-base font-black font-mono ${h.textColorClass}`}>
                    {misfireVal}
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 line-clamp-1" title={h.simpleExplanation}>
                  {h.simpleExplanation}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 5. Real Hardware Status & ECU Diagnostic Panel */}
      {telemetry.connectionState === 'connected' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-lg">
          {/* Header Row: Connection and ECU State */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${
                telemetry.ecuStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : telemetry.ecuStatus === 'searching'
                  ? 'bg-cyan-400 animate-ping'
                  : 'bg-amber-400 animate-bounce'
              }`} />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Adaptador ELM327 Enlazado</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    telemetry.ecuStatus === 'connected'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : telemetry.ecuStatus === 'searching'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {telemetry.ecuStatus === 'connected'
                      ? 'ECU RESPONDIENDO'
                      : telemetry.ecuStatus === 'searching'
                      ? 'NEGOCIANDO BUS'
                      : 'ESPERANDO ECU (NO DATA)'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Protocolo: <strong className="text-cyan-300 font-mono">{telemetry.ecuProtocolDetected || 'Búsqueda automática (ATSP0)'}</strong>
                </span>
              </div>
            </div>

            {onNavigateToTerminal && (
              <button
                onClick={onNavigateToTerminal}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-mono font-semibold border border-slate-700 flex items-center gap-1.5 shrink-0 transition-colors"
                title="Ver intercambio de bytes exacto en tiempo real"
              >
                <span>Consola Raw PIDs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 5.05 Detected ECU Sensors Status Bar */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">Sensores Detectados en la ECU</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                    {telemetry.supportedSensorsCount || 16} COMPATIBLES
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    {telemetry.activeSensorsCount || 6} EN VIVO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  La ECU respondió el bitmask de compatibilidad estándar (PIDs 00/20). {(telemetry.fuelLevelSensorStatus === 'unsupported_by_ecu' || telemetry.fuelLevelPercent === null) ? 'Tanque de nafta: No transmitido por ECU (analógico).' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSensorsModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <span>Ver {telemetry.supportedSensorsCount || 16} Sensores</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5.1 Continuous Auto-Polling Status & Control Bar */}
          <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${telemetry.isAutoPolling ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Radio className={`w-4 h-4 ${telemetry.isAutoPolling ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Lectura Continua Automática
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      telemetry.isAutoPolling
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                    }`}>
                      {telemetry.isAutoPolling ? '100% ACTIVA (EN VIVO)' : 'PAUSADA'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {telemetry.isAutoPolling
                      ? 'No tenés que hacer ningún clic: la app consulta la ECU en bucle permanente sin tocar la pantalla.'
                      : 'La lectura automática está pausada. Tocá "Reanudar" para que vuelva a leer solo.'}
                  </p>
                </div>
              </div>

              {/* Pause / Resume Button */}
              <button
                onClick={() => elm327Service.toggleAutoPolling()}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  telemetry.isAutoPolling
                    ? 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30'
                }`}
                title={telemetry.isAutoPolling ? 'Pausar lectura automática' : 'Reanudar lectura automática continua'}
              >
                {telemetry.isAutoPolling ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Reanudar Auto-Lectura</span>
                  </>
                )}
              </button>
            </div>

            {/* Mode Selector & Packet Counter */}
            <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mr-1">Modo:</span>
                <button
                  onClick={() => handleTogglePollMode('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    pollMode === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  📡 Todos los sensores (RPM, Vel, Temp, Carga...)
                </button>
                <button
                  onClick={() => handleTogglePollMode('rpm_only')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    pollMode === 'rpm_only'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  ⚡ Solo RPM (Frecuencia Máxima)
                </button>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-400">
                  Lecturas: <strong className="text-emerald-400">{telemetry.autoPollCount || 0}</strong>
                </span>
                {telemetry.rpm > 0 && (
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                    {telemetry.rpm} RPM
                  </span>
                )}
              </div>
            </div>

            {/* Micro Raw Stream Display */}
            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-850 font-mono text-[11px] flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Trama:</span>
                <span className="text-cyan-400 font-bold">{telemetry.lastCommandSent ? `TX: ${telemetry.lastCommandSent}` : 'TX: 01 0C'}</span>
                <span className="text-slate-600">→</span>
                <span className={telemetry.lastRawResponse?.includes('41') ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {telemetry.lastRawResponse ? `RX: ${telemetry.lastRawResponse}` : 'Aguardando respuesta...'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Diagnostic Note for Nissan / Diesel 2006 */}
          {telemetry.ecuStatus !== 'connected' && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-300">
                    ¿Acelerás y las RPM no se mueven? Verificá esto:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90">
                    <li>
                      <strong>Llave en CONTACTO:</strong> La llave debe estar en la segunda posición (con todos los testigos del tablero prendidos) o con el motor encendido. En posición radio (ACC) la ECU está apagada.
                    </li>
                    <li>
                      <strong>Protocolo para Nissan Diésel 2006:</strong> Las camionetas Nissan Frontier / Mercosur con inyección electrónica suelen usar <strong>KWP2000 Fast Init</strong> o <strong>KWP 5-baud</strong> en lugar de CAN.
                    </li>
                    <li>
                      <strong>Si tiene Bomba Mecánica (MWM 2.8 tradicional):</strong> La inyección es 100% mecánica sin ECU de motor; en ese caso el puerto OBD2 no transmite RPM.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Protocol Quick Switch Buttons */}
              <div className="pt-1 border-t border-amber-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1.5">
                  Probar protocolos con 1 toque:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { cmd: 'ATSP5', label: '🚚 Nissan KWP2000 Fast (ATSP5)' },
                    { cmd: 'ATSP4', label: '🚚 Nissan KWP 5-baud (ATSP4)' },
                    { cmd: 'ATSP3', label: '🚗 ISO 9141-2 (ATSP3)' },
                    { cmd: 'ATSP6', label: '🏎️ CAN 11/500k (ATSP6)' },
                    { cmd: 'ATSP0', label: '⚡ Auto (ATSP0)' }
                  ].map((proto) => (
                    <button
                      key={proto.cmd}
                      disabled={isChangingProtocol}
                      onClick={() => handleForceProtocol(proto.cmd, proto.label)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-[11px] font-mono font-medium text-amber-200 hover:text-white border border-amber-700/60 transition-colors cursor-pointer"
                    >
                      {proto.label}
                    </button>
                  ))}
                </div>
                {protocolMessage && (
                  <p className="text-[10px] text-cyan-300 font-mono mt-1.5 animate-pulse">
                    {protocolMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-white">Modo Demostración (Sin Auto)</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Tocá para simular situaciones
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {modes.map((m) => {
              const isSelected = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMode(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Active Vehicle Profile & Argentine Garage Quick Access */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>{vehicle.brand} {vehicle.model}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {vehicle.plate}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {vehicle.engineDisplacement} · {vehicle.year}
              </p>
            </div>
          </div>

          {onOpenGarage && (
            <button
              onClick={onOpenGarage}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            >
              <span>Cambiar auto</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick parameters grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/40">
            <span className="text-[10px] text-slate-500 block">Aceite Homologado</span>
            <span className="text-slate-200 font-semibold truncate block" title={vehicle.oilSpec}>
              {vehicle.oilSpec.split('/')[0]}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/40">
            <span className="text-[10px] text-slate-500 block">Distribución</span>
            <span className="text-slate-200 font-semibold truncate block">
              {vehicle.timingType === 'cadena' ? '⚡ Cadena' : '⚙️ Correa dentada'}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/40">
            <span className="text-[10px] text-slate-500 block">Presión Frío</span>
            <span className="text-slate-200 font-semibold">
              {vehicle.tirePressurePsiFront}/{vehicle.tirePressurePsiRear} PSI
            </span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/40">
            <span className="text-[10px] text-slate-500 block">
              {vehicle.fuelType === 'diesel' ? 'Tanque Diésel' : 'Capacidad Tanque'}
            </span>
            <span className="text-slate-200 font-semibold">
              {vehicle.tankCapacityLiters} Litros
            </span>
          </div>
        </div>

        {/* Typical Workshop Note */}
        {vehicle.typicalWeakPoints && vehicle.typicalWeakPoints.length > 0 && (
          <div className="bg-slate-950/70 p-2 rounded-lg border border-amber-900/30 flex items-start gap-1.5 text-[11px] text-amber-200/90">
            <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold text-amber-300">Tip de taller argentino: </span>
              <span>{vehicle.typicalWeakPoints[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Fuel Level Calibration Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative text-slate-100">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Calibración de Tanque de Combustible
                  </h3>
                  <span className="text-xs text-slate-400">
                    {vehicle.brand} {vehicle.model} ({vehicle.tankCapacityLiters || 75} Litros)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsFuelModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation card for 2006 vehicles */}
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-700/50 space-y-1.5 text-xs text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Info className="w-4 h-4 shrink-0 text-amber-400" />
                <span>¿Por qué la ECU no lo lee automáticamente?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                En modelos <strong>2006</strong> (como la Nissan Frontier), el sensor flotante del tanque está conectado por cable analógico <strong>directamente a la aguja del tablero</strong> y nunca pasa por la computadora del motor (ECU). Por eso el escáner devuelve <code>NO DATA</code> en el PID <code>01 2F</code>.
              </p>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                Seleccioná acá la posición aproximada de tu aguja para que la app calcule tu <strong>autonomía restante en km</strong> y el consumo exacto:
              </p>
            </div>

            {/* Current Level Gauge Display */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Nivel Seleccionado
                </span>
                <span className="text-2xl font-black font-mono text-cyan-400">
                  {fuelSliderVal}%
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  (~{Math.round((fuelSliderVal / 100) * (vehicle.tankCapacityLiters || 75))} L de {vehicle.tankCapacityLiters || 75}L)
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Autonomía estimada
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  ~{Math.round((((fuelSliderVal / 100) * (vehicle.tankCapacityLiters || 75)) / (telemetry.avgConsumptionL100km || 9.2)) * 100)} km
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>0% (Vacío)</span>
                <span className="text-cyan-400 font-mono font-bold">{fuelSliderVal}%</span>
                <span>100% (Lleno)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fuelSliderVal}
                onChange={(e) => handleSetQuickFuel(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Quick 1-Tap Buttons */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Ajuste rápido con 1 toque:
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-xs font-mono font-semibold">
                {[
                  { label: 'Reserva', pct: 15 },
                  { label: '1/4', pct: 25 },
                  { label: '1/2', pct: 50 },
                  { label: '3/4', pct: 75 },
                  { label: 'Lleno', pct: 100 }
                ].map((preset) => (
                  <button
                    key={preset.pct}
                    onClick={() => handleSetQuickFuel(preset.pct)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                      fuelSliderVal === preset.pct
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold shadow-md'
                        : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs">{preset.label}</span>
                    <span className="text-[10px] text-slate-400">{preset.pct}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Test 01 2F Button */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={handleTestPid2F}
                disabled={isTestingPid2F || telemetry.connectionState !== 'connected'}
                className="text-[11px] text-slate-400 hover:text-cyan-300 underline disabled:opacity-40 cursor-pointer"
              >
                {isTestingPid2F ? 'Consultando...' : '🔍 Probar consulta real a la ECU (PID 01 2F)'}
              </button>

              <button
                onClick={() => setIsFuelModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg cursor-pointer"
              >
                Listo / Guardar
              </button>
            </div>

            {pid2FResult && (
              <p className="text-[11px] font-mono p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                {pid2FResult}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 7. ECU Detected Sensors List Modal */}
      {isSensorsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Sensores Detectados en la ECU</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                      {telemetry.supportedSensorsCount || 16} COMPATIBLES
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {vehicle.brand} {vehicle.model} · Protocolo: <strong className="text-cyan-300 font-mono">{telemetry.ecuProtocolDetected || 'OBD-II Estándar'}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSensorsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Pill Bar & Batch Controls */}
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-slate-400">Compatibles:</span>
                  <strong className="text-white font-mono">{telemetry.supportedSensorsCount || 16}</strong>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300">En Vivo:</span>
                  <strong className="text-emerald-200 font-mono">{telemetry.activeSensorsCount || 6}</strong>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-700/60">
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-300">En Tablero:</span>
                  <strong className="text-cyan-100 font-mono">
                    {((telemetry.supportedSensorsList || []).filter(s => s.isPinned)).length}
                  </strong>
                </div>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
                <button
                  type="button"
                  onClick={() => elm327Service.pinAllSupportedSensors()}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Marcar todos los sensores compatibles para verlos en el tablero"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Marcar Todos</span>
                </button>
                <button
                  type="button"
                  onClick={() => elm327Service.unpinAllSensors()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Desmarcar todos los sensores"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
                <button
                  type="button"
                  onClick={() => elm327Service.resetPinnedSensorsToDefault()}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Restablecer selección recomendada"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Recomendados</span>
                </button>
              </div>
            </div>

            {/* Technical Information Banner */}
            <div className="p-3 mx-4 my-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200/90 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">¿Cómo verlos en el tablero en vivo?</strong> Hacé clic en el botón <strong>"Mostrar en Tablero (Check)"</strong> de cualquier sensor para que aparezca fijado en la grilla principal de tu tablero en tiempo real.
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'fijados', label: `★ En Tablero (${(telemetry.supportedSensorsList || []).filter(s => s.isPinned).length})` },
                { id: 'Motor', label: 'Motor' },
                { id: 'Combustible', label: 'Combustible' },
                { id: 'Admisión / Aire', label: 'Admisión' },
                { id: 'Eléctrico', label: 'Eléctrico' },
                { id: 'Emisiones', label: 'Emisiones' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSensorCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    sensorCategoryFilter === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scrollable Sensors List */}
            <div className="p-4 pt-1 overflow-y-auto space-y-2 flex-1 max-h-[50vh]">
              {(telemetry.supportedSensorsList || []).filter(s => {
                if (sensorCategoryFilter === 'todos') return true;
                if (sensorCategoryFilter === 'fijados') return s.isPinned;
                return s.category === sensorCategoryFilter;
              }).map(sensor => {
                const isFuel = sensor.pid.includes('2F');
                const health = evaluateSensorHealth(
                  sensor.pid,
                  sensor.numericValue,
                  sensor.currentValue,
                  {
                    isEngineRunning: telemetry.isEngineRunning,
                    batteryVoltage: telemetry.batteryVoltage,
                    coolantTemp: telemetry.coolantTemp,
                    speed: telemetry.speed,
                    fuelType: vehicle.fuelType
                  }
                );

                return (
                  <div
                    key={sensor.pid}
                    className={`p-3 rounded-xl border transition-all ${
                      sensor.isPinned
                        ? 'border-cyan-500/70 bg-slate-950/95 shadow-[0_0_12px_rgba(6,182,212,0.12)]'
                        : health.status === 'danger'
                        ? 'bg-red-950/20 border-red-700/60'
                        : health.status === 'warning'
                        ? 'bg-amber-950/20 border-amber-700/60'
                        : sensor.isActive
                        ? 'bg-emerald-950/20 border-emerald-700/50'
                        : isFuel
                        ? 'bg-amber-950/20 border-amber-700/50'
                        : sensor.isSupported
                        ? 'bg-slate-950/70 border-slate-800'
                        : 'bg-slate-950/30 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {sensor.pid}
                          </span>
                          <span className="text-xs font-bold text-white">{sensor.name}</span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900">
                            {sensor.category}
                          </span>
                          {sensor.isPinned && (
                            <span className="text-[10px] text-cyan-300 font-semibold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-cyan-400" />
                              Fijado en Tablero
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {sensor.description}
                        </p>

                        {/* Diagnóstico en lenguaje para quien no sabe nada de autos */}
                        {sensor.isActive && (
                          <div className={`mt-2 p-2 rounded-lg text-[11px] leading-snug border flex items-start gap-1.5 ${
                            health.status === 'danger'
                              ? 'bg-red-950/40 border-red-700/60 text-red-200'
                              : health.status === 'warning'
                              ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                              : 'bg-emerald-950/30 border-emerald-700/50 text-emerald-200'
                          }`}>
                            <span className="shrink-0 font-bold">Estado:</span>
                            <div className="flex-1">
                              <span>{health.simpleExplanation}</span>
                              <span className="block text-[10px] opacity-80 font-mono mt-0.5">
                                {health.idealRangeText}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status / Value Badge */}
                      <div className="text-right shrink-0">
                        {sensor.isActive ? (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black font-mono text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              {sensor.currentValue}
                            </span>
                            <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded border flex items-center gap-1 ${health.badgeColorClass}`}>
                              {health.statusLabel}
                            </span>
                          </div>
                        ) : isFuel ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-bold font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-600">
                              NO DATA
                            </span>
                            <span className="text-[9px] text-amber-400 mt-0.5">Sin señal ECU</span>
                          </div>
                        ) : sensor.isSupported ? (
                          <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                            Compatible
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            No compatible
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Action Row: Pin Checkbox & Fuel Calibration Button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => elm327Service.togglePinnedSensor(sensor.pid)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          sensor.isPinned
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                        }`}
                        title={sensor.isPinned ? 'Desmarcar check para quitar del tablero' : 'Presionar check para mostrar en el tablero en vivo'}
                      >
                        {sensor.isPinned ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span>{sensor.isPinned ? 'Mostrando en Tablero (Check ✓)' : 'Mostrar en Tablero (Check)'}</span>
                      </button>

                      {isFuel && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-amber-300/80 hidden sm:inline">
                            Reloj de aguja directo (sin bus digital)
                          </span>
                          <button
                            onClick={() => {
                              setIsSensorsModalOpen(false);
                              setIsFuelModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold border border-amber-500/40 text-[10px] shrink-0 cursor-pointer"
                          >
                            Calibrar Nivel Manual
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {((telemetry.supportedSensorsList || []).filter(s => s.isPinned)).length} de {telemetry.supportedSensorsCount || 16} sensores marcados para el tablero
              </span>
              <button
                onClick={() => setIsSensorsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Ver en Tablero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
