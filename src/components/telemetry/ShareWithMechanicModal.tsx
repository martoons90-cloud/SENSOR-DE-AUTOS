import React, { useState } from 'react';
import { X, QrCode, KeyRound, Copy, Check, Car, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { VehicleProfile } from '../../types/vehicle';
import { telemetrySharingService } from '../../services/telemetrySharingService';

interface ShareWithMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleProfile;
  onGoToWorkshopErp?: () => void;
}

export const ShareWithMechanicModal: React.FC<ShareWithMechanicModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onGoToWorkshopErp
}) => {
  const [code, setCode] = useState<string>(() => telemetrySharingService.getActiveCode());
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateNew = () => {
    const newCode = telemetrySharingService.generateCodeForVehicle(vehicle, 'Cliente en Taller');
    setCode(newCode);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Vincular Historial con Taller</h2>
              <p className="text-xs text-slate-400">Bitácora de comportamiento y testigos ELM327</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          {/* Vehicle summary badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-full border border-slate-800 text-xs">
            <Car className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">{vehicle.brand} {vehicle.model}</span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-cyan-400 font-bold">{vehicle.plate}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            Entregale este código a tu mecánico o lubricentro para que pueda consultar
            cómo se comportó tu auto en el último tiempo: <strong className="text-white">evolución del consumo, caídas de batería, cuándo salieron los testigos</strong> y alertas registradas por el ELM327.
          </p>

          {/* Big Code Display */}
          <div className="bg-slate-950 border-2 border-dashed border-cyan-500/40 rounded-2xl p-5 shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">
              Código de Historial para el Taller
            </span>
            <div className="text-4xl font-black font-mono tracking-widest text-cyan-400 select-all my-1">
              {code}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Bitácora lista para consulta</span>
            </div>
          </div>

          {/* Buttons to copy and regenerate */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>

            <button
              onClick={handleGenerateNew}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-800 transition-colors"
              title="Generar otro código"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Nuevo</span>
            </button>
          </div>

          {/* Direct link to test in ERP */}
          {onGoToWorkshopErp && (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  onClose();
                  onGoToWorkshopErp();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                <span>Probar este código en el ERP del Taller</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
