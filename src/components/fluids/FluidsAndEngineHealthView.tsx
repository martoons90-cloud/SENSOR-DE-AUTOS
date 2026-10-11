import React, { useState } from 'react';
import {
  Droplet,
  Thermometer,
  Zap,
  Disc,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Car,
  Clock,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { FluidLevel, OBDTelemetry, VehicleProfile } from '../../types/vehicle';

interface FluidsAndEngineHealthViewProps {
  fluids: FluidLevel[];
  telemetry: OBDTelemetry;
  vehicle: VehicleProfile;
  onUpdateFluid: (fluidId: string, newLevel: number) => void;
  onBookService: (serviceName: string) => void;
}

export const FluidsAndEngineHealthView: React.FC<FluidsAndEngineHealthViewProps> = ({
  fluids,
  telemetry,
  vehicle,
  onUpdateFluid,
  onBookService
}) => {
  const [selectedFluid, setSelectedFluid] = useState<FluidLevel | null>(fluids[0] || null);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);

  // Engine health dynamic notifications
  const engineNotifications = [
    {
      id: 'en-temp',
      title: telemetry.coolantTemp > 105
        ? '¡Alerta Crítica de Temperatura!'
        : telemetry.coolantTemp < 70
        ? 'Fase de Calentamiento del Motor'
        : 'Temperatura de Operación Ideal',
      type: telemetry.coolantTemp > 105 ? 'critical' : telemetry.coolantTemp < 70 ? 'warning' : 'ok',
      message: telemetry.coolantTemp > 105
        ? 'El refrigerante supera los 105°C. Detener el vehículo para evitar daños en la junta de tapa de cilindros.'
        : telemetry.coolantTemp < 70
        ? 'El motor no ha alcanzado los 85°C óptimos. Evita aceleraciones bruscas para proteger los metales de fricción.'
        : `El circuito termostático mantiene el motor estable en ${telemetry.coolantTemp.toFixed(0)}°C.`
    },
    {
      id: 'en-battery',
      title: telemetry.batteryVoltage >= 13.6
        ? 'Alternador Cargando Correctamente'
        : 'Tensión del Sistema Eléctrico Baja',
      type: telemetry.batteryVoltage >= 13.6 ? 'ok' : 'warning',
      message: telemetry.batteryVoltage >= 13.6
        ? `Voltaje en bornes: ${telemetry.batteryVoltage.toFixed(1)}V en marcha. El regulador opera en parámetros óptimos.`
        : `Voltaje detectado: ${telemetry.batteryVoltage.toFixed(1)}V. Posible desgaste de carbones del alternador o correa floja.`
    },
    {
      id: 'en-trim',
      title: Math.abs(telemetry.shortTermFuelTrim) > 15
        ? 'Ajuste de Combustible Forzado (+15%)'
        : 'Mezcla Aire/Combustible Equilibrada',
      type: Math.abs(telemetry.shortTermFuelTrim) > 15 ? 'warning' : 'ok',
      message: Math.abs(telemetry.shortTermFuelTrim) > 15
        ? 'La sonda de oxígeno detecta discrepancia en los gases y la computadora está compensando inyección.'
        : 'El sensor de oxígeno y el caudalímetro trabajan en sincronía perfecta (relación 14.7:1).'
    }
  ];

  const handleSaveLevel = (fluidId: string) => {
    if (editingLevel !== null) {
      onUpdateFluid(fluidId, editingLevel);
      setEditingLevel(null);
    }
  };

  const getServiceIntervalText = (category: string) => {
    switch (category) {
      case 'motor':
        return 'Cada 10.000 km o 12 meses';
      case 'frenos':
        return 'Cada 20.000 km o 24 meses';
      case 'refrigeracion':
        return 'Cada 40.000 km o 3 años';
      case 'transmision':
        return 'Cada 60.000 a 80.000 km';
      case 'lavaparabrisas':
        return 'Por consumo (rellenar según necesidad)';
      default:
        return 'Cada 10.000 km o 12 meses';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Niveles de Fluidos & Monitoreo del Motor
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Control preventivo de lubricantes, fluidos hidráulicos, refrigeración y estado eléctrico en {vehicle.brand} {vehicle.model}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-slate-300">
              Odómetro: <strong className="text-white">{vehicle.currentMileage.toLocaleString()} km</strong>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-slate-300">
              Aceite: <strong className="text-cyan-400">{vehicle.oilSpec.split(' ')[0]}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Live Status Notifications Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {engineNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              notif.type === 'critical'
                ? 'bg-red-950/40 border-red-800/80 text-red-200'
                : notif.type === 'warning'
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {notif.type === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${notif.type === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                )}
                <h4 className="text-xs font-bold text-white tracking-tight">
                  {notif.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {notif.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Fluid Levels Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Fluid Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Fluidos Principales del Vehículo
            </span>
            <span className="text-xs text-slate-500">
              Toca un fluido para ver especificación y actualizar nivel
            </span>
          </div>

          <div className="space-y-3">
            {fluids.map((fluid) => {
              const isSelected = selectedFluid?.id === fluid.id;
              const isLow = fluid.currentLevelPercent < 40;
              const isMedium = fluid.currentLevelPercent >= 40 && fluid.currentLevelPercent < 70;

              return (
                <div
                  key={fluid.id}
                  onClick={() => {
                    setSelectedFluid(fluid);
                    setEditingLevel(fluid.currentLevelPercent);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          fluid.category === 'motor'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : fluid.category === 'refrigeracion'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : fluid.category === 'frenos'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {fluid.category === 'frenos' ? (
                          <Disc className="w-5 h-5" />
                        ) : fluid.category === 'refrigeracion' ? (
                          <Thermometer className="w-5 h-5" />
                        ) : (
                          <Droplet className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {fluid.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {fluid.spec}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold font-mono text-white">
                        {fluid.currentLevelPercent}%
                      </span>
                      <span
                        className={`block text-[10px] font-bold uppercase tracking-wider ${
                          isLow ? 'text-red-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {isLow ? 'Nivel Bajo' : isMedium ? 'Atención' : 'Óptimo'}
                      </span>
                    </div>
                  </div>

                  {/* Level Progress bar */}
                  <div className="w-full h-2 bg-slate-950 rounded-full mt-3 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isLow
                          ? 'bg-red-500'
                          : isMedium
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                      }`}
                      style={{ width: `${fluid.currentLevelPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Última revisión: {fluid.lastCheckedDate}</span>
                    <span>Próximo recambio: a los {fluid.nextChangeMileage.toLocaleString()} km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Spec & Action Drawer (5 cols) */}
        <div className="lg:col-span-5">
          {selectedFluid ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Ficha Técnica de Fluido
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {selectedFluid.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-cyan-400">
                    {editingLevel !== null ? editingLevel : selectedFluid.currentLevelPercent}%
                  </span>
                </div>
              </div>

              {/* Slider to adjust / log new level */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>
                    {selectedFluid.category === 'motor'
                      ? 'Actualizar Vida Útil Estimada:'
                      : 'Actualizar Nivel Medido en Depósito:'}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {editingLevel !== null ? editingLevel : selectedFluid.currentLevelPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingLevel !== null ? editingLevel : selectedFluid.currentLevelPercent}
                  onChange={(e) => setEditingLevel(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  {selectedFluid.category === 'motor' ? (
                    <>
                      <span>0% (Agotado / Cambiar)</span>
                      <span>50%</span>
                      <span>100% (Aceite Nuevo)</span>
                    </>
                  ) : (
                    <>
                      <span>0% (Vacío / Mín)</span>
                      <span>50%</span>
                      <span>100% (Lleno Máx)</span>
                    </>
                  )}
                </div>

                {selectedFluid.category === 'motor' && (
                  <p className="text-[10px] text-slate-400 pt-1 leading-relaxed border-t border-slate-900">
                    💡 <strong>Vida útil:</strong> Mide la degradación química del aceite según los km recorridos. El nivel físico se mide en la varilla del motor (debe estar entre las marcas MÍN y MÁX).
                  </p>
                )}

                {editingLevel !== null && editingLevel !== selectedFluid.currentLevelPercent && (
                  <button
                    onClick={() => handleSaveLevel(selectedFluid.id)}
                    className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Guardar Nuevo Nivel Registrado
                  </button>
                )}
              </div>

              {/* Specs & Guidance */}
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Especificación de Fábrica Homologada
                  </span>
                  <span className="font-mono font-semibold text-white">
                    {selectedFluid.spec}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {selectedFluid.notes}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Info className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs text-white">
                      Plan de Mantenimiento ({vehicle.brand} {vehicle.model})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">
                        Próximo cambio programado:
                      </span>
                      <span className="text-cyan-400 font-mono font-bold text-xs block mt-0.5">
                        A los {selectedFluid.nextChangeMileage.toLocaleString()} km
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        (Faltan {Math.max(0, selectedFluid.nextChangeMileage - vehicle.currentMileage).toLocaleString()} km)
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">
                        Frecuencia oficial de fábrica:
                      </span>
                      <span className="text-emerald-400 font-bold text-xs block mt-0.5">
                        {getServiceIntervalText(selectedFluid.category)}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        (Lo que ocurra primero)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book service action */}
              <div className="pt-2">
                <button
                  onClick={() => onBookService(`Mantenimiento / Recambio de ${selectedFluid.name}`)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cotizar Cambio en Lubricentro Cercano</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              Seleccioná un fluido para ver su ficha técnica
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
