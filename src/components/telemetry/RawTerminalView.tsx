import React, { useState, useEffect } from 'react';
import { Terminal, Send, RefreshCw, Trash2, ShieldAlert, Cpu, Radio, Play, Pause, Info, Download } from 'lucide-react';
import { elm327Service, RawTerminalMessage, SensorTestCircuitReport, StandardPidDiscoveryReport } from '../../services/elm327Bluetooth';
import { exportSensorTestCircuit, exportStandardPidDiscovery, exportTelemetrySession } from '../../services/telemetryExportService';

export const RawTerminalView: React.FC = () => {
  const [logs, setLogs] = useState<RawTerminalMessage[]>([]);
  const [customCommand, setCustomCommand] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAutoPolling, setIsAutoPolling] = useState(elm327Service.isAutoPolling());
  const [historyCount, setHistoryCount] = useState(elm327Service.getTelemetryHistory().length);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [isRunningCircuit, setIsRunningCircuit] = useState(false);
  const [circuitProgress, setCircuitProgress] = useState<string | null>(null);
  const [lastCircuitReport, setLastCircuitReport] = useState<SensorTestCircuitReport | null>(null);
  const [isDiscoveringPids, setIsDiscoveringPids] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState<string | null>(null);
  const [lastDiscoveryReport, setLastDiscoveryReport] = useState<StandardPidDiscoveryReport | null>(null);

  useEffect(() => {
    const unsubLogs = elm327Service.subscribeLogs((msg) => {
      setLogs(prev => [msg, ...prev].slice(0, 100));
    });
    const unsubTel = elm327Service.subscribe((t) => {
      setIsAutoPolling(!!t.isAutoPolling);
      setHistoryCount(elm327Service.getTelemetryHistory().length);
    });
    return () => {
      unsubLogs();
      unsubTel();
    };
  }, []);

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommand.trim()) return;
    setIsSending(true);
    try {
      await elm327Service.sendATCommand(customCommand);
      setCustomCommand('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleExportHistory = async () => {
    const report = elm327Service.getDiagnosticExport();
    if (report.samples.length === 0) {
      setExportMessage('Todavía no hay lecturas para exportar. Conectá la camioneta y circulá unos minutos.');
      return;
    }
    setIsExporting(true);
    setExportMessage(null);
    try {
      const result = await exportTelemetrySession(report);
      setExportMessage(result.shared
        ? `Historial listo: ${report.samples.length} lecturas. Elegí WhatsApp, Drive o Archivos para enviarlo.`
        : `Archivo descargado: ${result.filename}`);
    } catch (error: any) {
      setExportMessage(`No se pudo exportar: ${error?.message || 'error desconocido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearDiagnosticHistory = () => {
    elm327Service.clearDiagnosticHistory();
    setLogs([]);
    setHistoryCount(0);
    setExportMessage('Historial de diagnóstico eliminado.');
  };

  const handleRunSensorCircuit = async () => {
    setIsRunningCircuit(true);
    setLastCircuitReport(null);
    setCircuitProgress('Preparando prueba de 10 sensores × 2 vueltas...');
    try {
      const report = await elm327Service.runSensorTestCircuit(2, (completed, total, label) => {
        setCircuitProgress(`Leyendo ${label} (${completed}/${total})...`);
      });
      setLastCircuitReport(report);
      setCircuitProgress(`Prueba terminada: ${report.readings.length} respuestas reales registradas.`);
    } catch (error: any) {
      setCircuitProgress(`No se pudo iniciar la prueba: ${error?.message || 'error desconocido'}`);
    } finally {
      setIsRunningCircuit(false);
    }
  };

  const handleExportCircuit = async () => {
    if (!lastCircuitReport) return;
    setIsExporting(true);
    try {
      const result = await exportSensorTestCircuit(lastCircuitReport);
      setCircuitProgress(result.shared
        ? 'Resultado listo. Elegí Archivos, WhatsApp o Drive para guardarlo o enviarlo.'
        : `Resultado descargado: ${result.filename}`);
    } catch (error: any) {
      setCircuitProgress(`No se pudo descargar el resultado: ${error?.message || 'error desconocido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDiscoverStandardPids = async () => {
    setIsDiscoveringPids(true);
    setLastDiscoveryReport(null);
    setDiscoveryProgress('Leyendo la lista de capacidades que declara la ECU...');
    try {
      const report = await elm327Service.runStandardPidDiscovery((completed, total, label) => {
        setDiscoveryProgress(`Probando ${label} (${completed}/${total})...`);
      });
      setLastDiscoveryReport(report);
      const withData = report.readings.filter((reading) => reading.result === 'datos').length;
      setDiscoveryProgress(`Inventario terminado: ${withData}/${report.readings.length} PIDs devolvieron datos. Incluye temperatura de aceite (01 5C).`);
    } catch (error: any) {
      setDiscoveryProgress(`No se pudo iniciar el inventario: ${error?.message || 'error desconocido'}`);
    } finally {
      setIsDiscoveringPids(false);
    }
  };

  const handleExportPidDiscovery = async () => {
    if (!lastDiscoveryReport) return;
    setIsExporting(true);
    try {
      const result = await exportStandardPidDiscovery(lastDiscoveryReport);
      setDiscoveryProgress(result.shared
        ? 'Inventario listo. Elegí Archivos, WhatsApp o Drive para guardarlo o enviarlo.'
        : `Inventario descargado: ${result.filename}`);
    } catch (error: any) {
      setDiscoveryProgress(`No se pudo descargar el inventario: ${error?.message || 'error desconocido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleAutoPoll = () => {
    const nextState = elm327Service.toggleAutoPolling();
    setIsAutoPolling(nextState);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Consola de Diagnóstico en Crudo (Raw PIDs & AT)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Terminal OBD-II & Trama ELM327
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Visualizá exactamente los bytes de transmisión (TX) y recepción (RX) intercambiados con la ECU de tu Nissan Frontier.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleAutoPoll}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAutoPolling
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-emerald-500 shadow-md'
            }`}
            title={isAutoPolling ? 'Pausar lecturas automáticas en segundo plano' : 'Reanudar lectura automática'}
          >
            {isAutoPolling ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pausar Auto-Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Reanudar Auto-Stream</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportHistory}
            disabled={isExporting || historyCount === 0}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
            title="Genera un archivo con todas las lecturas y tramas ELM327 para compartir"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Preparando...' : `Exportar (${historyCount})`}</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar pantalla</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-bold text-white">Bitácora de viaje y diagnóstico</p>
          <p className="text-slate-400 mt-0.5">Se guarda en el teléfono una muestra por segundo: velocidad, RPM, MAP, MAF, carga, acelerador y tramas ELM327.</p>
          {exportMessage && <p className="text-cyan-300 mt-1.5">{exportMessage}</p>}
        </div>
        <button
          onClick={handleClearDiagnosticHistory}
          className="px-3 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-semibold shrink-0"
        >
          Borrar historial
        </button>
      </div>

      {/* Auto-Polling Clarification Notice */}
      <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-2xl p-3.5 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-cyan-200/90 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-300">
              ¿Tenés que hacer clic constantemente? ¡NO!
            </span>
            <span className={`px-2 py-0.2 rounded-full font-mono text-[10px] font-bold ${
              isAutoPolling
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-amber-950 text-amber-300 border border-amber-700'
            }`}>
              {isAutoPolling ? 'AUTO-LECTURA ACTIVA' : 'PAUSADA'}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed">
            La app ya interroga a la computadora del auto automáticamente en bucle continuo y actualiza todos los datos en el panel <strong>En Vivo</strong> (RPM, Velocidad, Temperatura, Carga, Acelerador, etc.).
            Los botones rápidos de abajo son <em>atajos de prueba</em> opcionales por si querés inspeccionar una respuesta en crudo específica.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-cyan-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-bold text-white">Prueba completa de sensores</p>
          <p className="text-xs text-slate-400 mt-1">
            Consulta RPM, velocidad, temperatura, carga, acelerador, MAP, MAF, IAT, avance y voltaje; repite la vuelta dos veces y registra cada respuesta real.
          </p>
          {circuitProgress && <p className="text-xs text-cyan-300 mt-2 font-medium">{circuitProgress}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunSensorCircuit}
            disabled={isRunningCircuit}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningCircuit ? 'animate-spin' : ''}`} />
            <span>{isRunningCircuit ? 'Probando...' : 'Probar 10 sensores × 2'}</span>
          </button>
          {lastCircuitReport && (
            <button
              onClick={handleExportCircuit}
              disabled={isExporting}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>Descargar resultado</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-violet-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-bold text-white">Inventario completo de sensores de la ECU</p>
          <p className="text-xs text-slate-400 mt-1">
            Lee los mapas estándar 0100, 0120, 0140… y prueba cada PID que la ECU declara. También verifica datos importantes aunque no estén anunciados, como temperatura de aceite (01 5C), presión barométrica y presión de riel.
          </p>
          {discoveryProgress && <p className="text-xs text-violet-300 mt-2 font-medium">{discoveryProgress}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDiscoverStandardPids}
            disabled={isDiscoveringPids || isRunningCircuit}
            className="px-3.5 py-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiscoveringPids ? 'animate-spin' : ''}`} />
            <span>{isDiscoveringPids ? 'Explorando...' : 'Explorar todos'}</span>
          </button>
          {lastDiscoveryReport && (
            <button
              onClick={handleExportPidDiscovery}
              disabled={isExporting}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-violet-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>Descargar inventario</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Command Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Comandos Rápidos OBD-II / AT (Prueba Manual):
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '010C (RPM)', cmd: '01 0C' },
            { label: '0100 (Enlazar ECU)', cmd: '01 00' },
            { label: 'ATDP (Ver Protocolo)', cmd: 'ATDP' },
            { label: 'ATSP5 (Nissan KWP Fast)', cmd: 'ATSP5' },
            { label: 'ATSP4 (Nissan KWP 5-baud)', cmd: 'ATSP4' },
            { label: 'ATSP6 (CAN 11/500)', cmd: 'ATSP6' },
            { label: 'ATSP0 (Auto Protocolo)', cmd: 'ATSP0' },
            { label: '010D (Velocidad)', cmd: '01 0D' },
            { label: '0105 (Temp Agua)', cmd: '01 05' },
            { label: '0104 (Carga Motor)', cmd: '01 04' },
            { label: '010B (MAP)', cmd: '01 0B' },
            { label: '0110 (MAF)', cmd: '01 10' },
            { label: '0111 (Acelerador)', cmd: '01 11' },
            { label: '012F (Nivel Tanque)', cmd: '01 2F' },
            { label: '03 (Leer Fallas DTC)', cmd: '03' },
            { label: 'ATRV (Voltaje Batería)', cmd: 'ATRV' },
            { label: 'ATZ (Reset ELM)', cmd: 'ATZ' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={async () => {
                await elm327Service.sendATCommand(item.cmd);
              }}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-xl text-xs font-mono font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Command Input */}
      <form onSubmit={handleSendCommand} className="flex gap-2">
        <input
          type="text"
          value={customCommand}
          onChange={(e) => setCustomCommand(e.target.value)}
          placeholder="Escribir comando AT o PID en hexadecimal (ej: 01 00, AT SP 0)..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={isSending || !customCommand.trim()}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Enviar</span>
        </button>
      </form>

      {/* Terminal Output Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 font-mono text-xs shadow-2xl min-h-[360px] max-h-[500px] overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
            <Terminal className="w-8 h-8 text-slate-700" />
            <p>No hay tramas en crudo registradas todavía.</p>
            <p className="text-[11px] text-slate-600">Conectá el adaptador y ejecutá un comando rápido para ver la respuesta (RX) de la ECU.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="p-2 rounded-xl bg-slate-900/60 border border-slate-850 flex items-start gap-3">
              <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">{log.timestamp}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                log.type === 'tx'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : log.type === 'rx'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {log.type.toUpperCase()}
              </span>
              <span className={`break-all ${
                log.type === 'tx' ? 'text-cyan-200' : log.type === 'rx' ? 'text-emerald-200 font-bold' : 'text-slate-300'
              }`}>
                {log.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
