import React from 'react';
import { Bluetooth, Car, ChevronDown, KeyRound, Wrench } from 'lucide-react';
import { OBDTelemetry, VehicleProfile } from '../../types/vehicle';

interface NavbarProps {
  telemetry: OBDTelemetry;
  vehicle: VehicleProfile;
  onConnectBluetooth: () => void;
  activeDtcsCount: number;
  onGoToLiveView?: () => void;
  onOpenGarageModal?: () => void;
  onOpenShareModal?: () => void;
  onGoToErp?: () => void;
  onGoToLanding?: () => void;
  onGoToConnection?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  telemetry,
  vehicle,
  onConnectBluetooth,
  activeDtcsCount,
  onGoToLiveView,
  onOpenGarageModal,
  onOpenShareModal,
  onGoToErp,
  onGoToLanding,
  onGoToConnection
}) => {
  const isConnected = telemetry.connectionState === 'connected';
  const isSimulated = telemetry.connectionState === 'simulated';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Active Vehicle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onGoToLiveView}
            className="text-left group cursor-pointer shrink-0"
            title="Ir a Vista en Vivo"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                AutoScan
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">
                PRO
              </span>
            </div>
          </button>

          {/* Active Vehicle Button with Garage Opener */}
          <button
            onClick={onOpenGarageModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-600/60 transition-all cursor-pointer min-w-0 text-left group"
            title="Abrir Garaje Argentino y cambiar de vehículo"
          >
            <Car className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="min-w-0 flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-200 group-hover:text-white truncate max-w-[130px] sm:max-w-[200px]">
                {vehicle.brand} {vehicle.model}
              </span>
              <span className="text-slate-600 hidden xs:inline">·</span>
              <span className="font-mono text-cyan-400 text-[10px] hidden xs:inline font-bold">
                {vehicle.plate}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 shrink-0 ml-0.5" />
          </button>
        </div>

        {/* Right Status / Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Diagnostic Alert Flag (if any) */}
          {activeDtcsCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-[11px] font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{activeDtcsCount} {activeDtcsCount === 1 ? 'falla' : 'fallas'}</span>
            </div>
          )}

          {/* Generate Code for Mechanic Button */}
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/20 transition-all cursor-pointer"
              title="Generar código para vincular con taller o lubricentro"
            >
              <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Código Taller</span>
            </button>
          )}

          {/* Bluetooth OBD Connection Button */}
          <button
            onClick={onGoToConnection || onConnectBluetooth}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
              isConnected
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900/90 shadow-emerald-950/50'
                : isSimulated
                ? 'bg-slate-900 border-cyan-800/60 text-cyan-300 hover:bg-slate-800'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isConnected ? 'Conectado al escáner ELM327 Bluetooth' : 'Conectar escáner ELM327'}
          >
            <Bluetooth className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">
              {isConnected ? 'Escáner Conectado' : isSimulated ? 'Datos OBD' : 'Conectar'}
            </span>
          </button>

          {/* Go to Landing page button */}
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Volver a la Web Principal"
            >
              <span>Web</span>
            </button>
          )}

          {/* Go to ERP button */}
          {onGoToErp && (
            <button
              onClick={onGoToErp}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 transition-colors"
              title="Ir al ERP del Taller"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">ERP Taller</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


