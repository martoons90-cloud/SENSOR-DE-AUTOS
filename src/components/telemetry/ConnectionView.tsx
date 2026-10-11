import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Car,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Zap,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Info,
  Sliders,
  Terminal,
  Activity,
  Check,
  HelpCircle
} from 'lucide-react';
import { OBDTelemetry, VehicleProfile } from '../../types/vehicle';
import { elm327Service, RawTerminalMessage } from '../../services/elm327Bluetooth';

interface ConnectionViewProps {
  telemetry: OBDTelemetry;
  vehicle: VehicleProfile;
  onConnectBluetooth: () => Promise<void>;
  onGoToMainDashboard: () => void;
  onOpenGarageModal: () => void;
}

export const ConnectionView: React.FC<ConnectionViewProps> = ({
  telemetry,
  vehicle,
  onConnectBluetooth,
  onGoToMainDashboard,
  onOpenGarageModal
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<RawTerminalMessage[]>([]);

  const isConnected = telemetry.connectionState === 'connected';
  const isSimulated = telemetry.connectionState === 'simulated';

  useEffect(() => {
    const unsub = elm327Service.subscribeLogs((log) => {
      setTerminalLogs(prev => [log, ...prev].slice(0, 30));
    });
    return () => unsub();
  }, []);

  const handleConnectClick = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await elm327Service.connectRealBluetooth();
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar por Bluetooth.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectSerialClick = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await elm327Service.connectRealSerial();
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar por puerto serie.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    elm327Service.disconnect();
    setErrorMessage(null);
  };

  const handleStartSimulatedMode = () => {
    elm327Service.setSimulationMode('crucero_autopista');
    onGoToMainDashboard();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Welcome & Vehicle Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Car className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Vehículo a conectar
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{vehicle.brand} {vehicle.model}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                  {vehicle.plate}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenGarageModal}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors flex items-center gap-1.5 shrink-0"
            title="Cambiar de auto"
          >
            <span>Cambiar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>Motor: <strong className="text-slate-200">{vehicle.engine || vehicle.engineDisplacement}</strong></span>
          <span>·</span>
          <span>Protocolo: <strong className="text-cyan-400 font-mono">ISO 15765-4 CAN / OBD2</strong></span>
        </div>
      </div>

      {/* Main Connection Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        {/* Animated Connection Pulse Visual */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
            isConnected
              ? 'bg-emerald-500/20 scale-125 animate-pulse'
              : isConnecting
              ? 'bg-cyan-500/25 scale-125 animate-ping'
              : 'bg-slate-800/80'
          }`} />

          <div className={`relative z-10 w-20 h-20 rounded-full border flex items-center justify-center transition-all ${
            isConnected
              ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20'
              : isConnecting
              ? 'bg-cyan-950 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950 border-slate-700 text-slate-400'
          }`}>
            <Bluetooth className={`w-9 h-9 ${isConnecting ? 'animate-bounce' : ''}`} />
          </div>
        </div>

        {/* State Information */}
        <div className="space-y-1.5">
          {isConnected ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Escáner ELM327 Enlazado</span>
              </div>
              <h3 className="text-xl font-bold text-white pt-1">
                ¡Conexión establecida con la ECU!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Tu auto está transmitiendo datos de motor, temperatura, batería y diagnóstico en tiempo real.
              </p>
            </>
          ) : isConnecting ? (
            <>
              <h3 className="text-xl font-bold text-white">
                Buscando tu escáner Bluetooth...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Asegurate de que el ELM327 esté enchufado y la llave del auto en posición de contacto.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white">
                Conectá tu auto con la aplicación
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Enchufá el adaptador ELM327 en el puerto OBD2 de tu auto y enlazalo por Bluetooth para comenzar.
              </p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {isConnected ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onGoToMainDashboard}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Ingresar a Mi Auto (Ver Datos)</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={handleDisconnect}
                className="w-full sm:w-auto px-4 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-2xl text-xs font-semibold transition-colors"
              >
                Desconectar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleConnectClick}
                  disabled={isConnecting}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Bluetooth className="w-5 h-5 stroke-[2.5]" />
                  <span>{isConnecting ? 'Buscando dispositivos...' : 'Conectar por Bluetooth (ELM327)'}</span>
                </button>

                <button
                  onClick={handleConnectSerialClick}
                  disabled={isConnecting}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  title="Para Notebooks / PCs con Bluetooth emparejado en Windows o adaptador USB"
                >
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Puerto COM / Notebook</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  onClick={handleStartSimulatedMode}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium underline underline-offset-4"
                >
                  <span>Explorar app con datos de prueba (Sin auto)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-left text-xs text-amber-200 flex items-start gap-2.5 mt-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Aviso de conexión:</span>
                <p className="leading-relaxed">{errorMessage}</p>
                <p className="text-slate-400 text-[11px] pt-1">
                  💡 Tip: En Android, verificá tener el Bluetooth activado en los ajustes de tu celular y seleccioná el dispositivo llamado "OBDII".
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3 Step Instruction Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 text-center sm:text-left">
          Pasos sencillos antes de conectar
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h5 className="font-bold text-white">Enchufá el adaptador</h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Ubicá la ficha OBD2 debajo del volante (a la izquierda) y enchufá el ELM327. Prenderá su luz roja testigo.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h5 className="font-bold text-white">Llave en contacto</h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Girá la llave hasta que se prendan las luces del tablero. La computadora necesita corriente para responder.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h5 className="font-bold text-white">Vinculá y manejá</h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Tocá el botón "Conectar por Bluetooth". Si te pide PIN, suele ser <strong>1234</strong> o <strong>0000</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Terminal Logs Accordion */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900 overflow-hidden">
        <button
          onClick={() => setShowTerminal(!showTerminal)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Consola técnica de comunicación OBD2 (Opcional)</span>
          </span>
          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showTerminal ? 'rotate-90' : ''}`} />
        </button>

        {showTerminal && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
            {terminalLogs.length === 0 ? (
              <span className="text-slate-500">Esperando comunicación con el adaptador...</span>
            ) : (
              terminalLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-600 text-[10px]">{log.timestamp}</span>
                  <span className={`font-bold ${
                    log.type === 'tx' ? 'text-cyan-400' : log.type === 'rx' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    [{log.type.toUpperCase()}]
                  </span>
                  <span className="text-slate-300 break-all">{log.text}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
