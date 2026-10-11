import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Search,
  Trash2,
  RefreshCw,
  Wrench,
  ShieldAlert,
  Info,
  ChevronRight,
  Flame,
  Gauge,
  X,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Cpu
} from 'lucide-react';
import { DTCFaultCode, OBDTelemetry, VehicleProfile } from '../../types/vehicle';
import { lookupDTC } from '../../services/obdDatabase';
import { elm327Service } from '../../services/elm327Bluetooth';
import { DtcDictionarySection } from './DtcDictionarySection';
import { ObdPidsCatalogSection } from './ObdPidsCatalogSection';

interface DtcScannerViewProps {
  activeDtcs: DTCFaultCode[];
  telemetry: OBDTelemetry;
  vehicle?: VehicleProfile;
  onBookAppointmentForDtc: (dtc: DTCFaultCode) => void;
  onDtcsCleared: () => void;
}

export const DtcScannerView: React.FC<DtcScannerViewProps> = ({
  activeDtcs,
  telemetry,
  vehicle,
  onBookAppointmentForDtc,
  onDtcsCleared
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedDtc, setSearchedDtc] = useState<DTCFaultCode | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedDtcDetail, setSelectedDtcDetail] = useState<DTCFaultCode | null>(
    activeDtcs.length > 0 ? activeDtcs[0] : null
  );
  // Dedicated mobile full-screen detail view modal
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  // Sub-tab: scanner view, universal codes dictionary or telemetry PIDs catalog
  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'diccionario' | 'pids'>('scanner');

  const handleOpenDetail = (dtc: DTCFaultCode) => {
    setSelectedDtcDetail(dtc);
    setIsMobileDetailOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDetailOpen(false);
        setShowClearConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1800);
  };

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    const result = lookupDTC(searchQuery.trim(), vehicle?.brand);
    setSearchedDtc(result);
    if (result) {
      handleOpenDetail(result);
    }
  };

  const handleClearAllDTCs = () => {
    elm327Service.clearDTCs();
    setShowClearConfirm(false);
    setSelectedDtcDetail(null);
    setIsMobileDetailOpen(false);
    onDtcsCleared();
  };

  const popularQuickCodes = [
    'P0300', 'P0171', 'P0420', 'P0115', 'P1450', 'P1000',
    'P1297', 'P1557', 'P1682', 'P1325', 'P1336', 'U1900'
  ];

  // Helper component to render the full detail card content
  const renderDetailContent = (dtc: DTCFaultCode, isModal = false) => (
    <div className="space-y-4">
      {/* Header with Code and Severity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-400">
              {dtc.code}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                dtc.severity === 'critical'
                  ? 'bg-red-950/90 text-red-300 border border-red-800'
                  : dtc.severity === 'warning'
                  ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                  : 'bg-blue-950/90 text-blue-300 border border-blue-800'
              }`}
            >
              {dtc.severity === 'critical'
                ? 'Severidad: Crítico'
                : dtc.severity === 'warning'
                ? 'Severidad: Alerta'
                : 'Severidad: Preventivo'}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {dtc.title}
          </h3>
          <span className="text-xs text-slate-400">
            Categoría: {dtc.category} · Sistema de Inyección & Motor
          </span>
        </div>

        <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 sm:text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Costo aproximado de arreglo
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {dtc.estimatedRepairCostRange}
          </span>
        </div>
      </div>

      {/* Plain Language Explanation */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          ¿Qué significa esta falla en palabras simples?
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800/90">
          {dtc.description}
        </p>
      </div>

      {/* Symptoms */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          Síntomas que podés notar al manejar
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {dtc.symptoms.map((symptom, idx) => (
            <li
              key={idx}
              className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl text-slate-200 flex items-start gap-2"
            >
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span>{symptom}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Possible Causes */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          Causas más comunes
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          {dtc.possibleCauses.map((cause, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono font-bold shrink-0">1.{idx + 1}</span>
              <span>{cause}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Action */}
      <div className="bg-gradient-to-r from-cyan-950/50 via-slate-950 to-slate-950 border border-cyan-800/70 rounded-xl p-3.5 space-y-2.5">
        <div>
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            ¿Qué deberías hacer ahora?
          </h4>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">
            {dtc.recommendedAction}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-cyan-900/40 gap-2.5">
          <span className="text-[11px] text-slate-400">
            Podés pedir turno o presupuesto para solucionar el código {dtc.code}.
          </span>
          <button
            onClick={() => {
              if (isModal) setIsMobileDetailOpen(false);
              onBookAppointmentForDtc(dtc);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-cyan-950"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Pedir Turno para {dtc.code}</span>
          </button>
        </div>
      </div>

      {/* Official Freeze Frame (Modo 02 SAE J1979) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-xl p-3.5 border border-indigo-900/60 text-xs text-slate-300 space-y-2 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white text-xs">
              Cuadro Congelado Oficial (Modo 02 Freeze Frame)
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60">
            SAE J1979 / ISO 15031
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Condiciones exactas en los cilindros y sensores en el milisegundo en que la computadora encendió la luz de avería:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-sans block">Régimen Motor</span>
            <span className="font-bold text-cyan-300">{telemetry.freezeFrame?.rpm || Math.round(telemetry.rpm)} RPM</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-sans block">Velocidad</span>
            <span className="font-bold text-cyan-300">{telemetry.freezeFrame?.speed || Math.round(telemetry.speed)} km/h</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-sans block">Temp. Refrigerante</span>
            <span className="font-bold text-amber-300">{telemetry.freezeFrame?.coolantTemp || Math.round(telemetry.coolantTemp)}°C</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-sans block">Carga de Esfuerzo</span>
            <span className="font-bold text-purple-300">{telemetry.freezeFrame?.engineLoad || Math.round(telemetry.engineLoad)}%</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800/80 flex items-center justify-between">
          <span>DTC causante: {telemetry.freezeFrame?.triggerDtc || dtc.code}</span>
          <span>Snapshot guardado en ROM de ECU</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Diagnóstico de Fallas (Luz Check Engine)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tocá cualquier código detectado para ver su explicación en lenguaje simple, síntomas y costo de arreglo.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {activeDtcs.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Apagar Luz Check</span>
            </button>
          )}

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Escaneando...' : 'Re-Escanear'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher: Scanner vs. Enciclopedia Códigos vs. PIDs Telemetría */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl shadow-inner">
        <button
          onClick={() => setActiveSubTab('scanner')}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
            activeSubTab === 'scanner'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="truncate">Fallas del Auto</span>
          {activeDtcs.length > 0 ? (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'scanner'
                ? 'bg-slate-950 text-red-400'
                : 'bg-red-950 text-red-300 border border-red-800'
            }`}>
              {activeDtcs.length}
            </span>
          ) : (
            <span className="text-[10px] text-emerald-400 font-medium">✓ OK</span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('diccionario')}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
            activeSubTab === 'diccionario'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate">Enciclopedia (P, C, B, U)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pids')}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
            activeSubTab === 'pids'
              ? 'bg-indigo-500 text-slate-950 shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 shrink-0" />
          <span className="truncate">Fórmulas y PIDs</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
            activeSubTab === 'pids'
              ? 'bg-slate-950 text-indigo-300'
              : 'bg-slate-800 text-indigo-300'
          }`}>
            Modo 01/09
          </span>
        </button>
      </div>

      {/* VIEW 1: DICCIONARIO Y ENCICLOPEDIA OBD-II (P, C, B, U) */}
      {activeSubTab === 'diccionario' && (
        <DtcDictionarySection onSelectDtc={handleOpenDetail} />
      )}

      {/* VIEW 2: CATÁLOGO DE PIDS DE TELEMETRÍA Y FÓRMULAS */}
      {activeSubTab === 'pids' && (
        <ObdPidsCatalogSection />
      )}

      {/* VIEW 3: ESCÁNER Y FALLAS ACTIVAS DEL VEHÍCULO */}
      {activeSubTab === 'scanner' && (
        <>
          {/* Scanning status banner */}
          {isScanning && (
            <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Consultando memoria de averías en la computadora del motor...</span>
              </div>
            </div>
          )}

          {/* Main Grid: Active DTCs List + Details View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Active DTCs list (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Fallas Activas ({activeDtcs.length})
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeDtcs.length > 0 ? (
                      <span className="text-amber-400 font-semibold">Testigo Encendido</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Sin Fallas</span>
                    )}
                  </span>
                </div>

                {activeDtcs.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">¡Sin fallas detectadas!</h4>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                        No se registran averías en encendido, inyección ni sensores.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeDtcs.map((dtc) => {
                      const isSelected = selectedDtcDetail?.code === dtc.code;
                      return (
                        <div
                          key={dtc.code}
                          onClick={() => handleOpenDetail(dtc)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/20'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                                  dtc.severity === 'critical'
                                    ? 'bg-red-950 text-red-400 border border-red-800/80'
                                    : dtc.severity === 'warning'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                                    : 'bg-blue-950 text-blue-300 border border-blue-800/80'
                                }`}
                              >
                                {dtc.code}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate max-w-[130px] sm:max-w-[180px]">
                                {dtc.category}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                dtc.severity === 'critical'
                                  ? 'text-red-400'
                                  : dtc.severity === 'warning'
                                  ? 'text-amber-400'
                                  : 'text-blue-400'
                              }`}
                            >
                              {dtc.severity === 'critical'
                                ? 'Crítico'
                                : dtc.severity === 'warning'
                                ? 'Alerta'
                                : 'Preventivo'}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                            {dtc.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {dtc.description}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                            <span className="text-slate-400 font-mono text-[10px]">
                              Arreglo aprox: <strong className="text-emerald-400">{dtc.estimatedRepairCostRange}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(dtc);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Ver detalle</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Code Lookup Tool */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Buscador Rápido de Códigos P
                  </h3>
                  <button
                    onClick={() => setActiveSubTab('diccionario')}
                    className="text-[10px] font-semibold text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900 px-2 py-0.5 rounded-full border border-cyan-800 transition-colors cursor-pointer"
                  >
                    Abrir Diccionario →
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Ingresá cualquier código para ver la falla explicada en español:
                </p>
                <form onSubmit={handleSearchCode} className="flex gap-2 mb-2.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ej: P0420, P0300, P0171..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 font-mono uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Buscar
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-500">Comunes:</span>
                  {popularQuickCodes.slice(0, 8).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setSearchQuery(code);
                        const res = lookupDTC(code, vehicle?.brand);
                        setSearchedDtc(res);
                        if (res) handleOpenDetail(res);
                      }}
                      className="px-2 py-0.5 text-[11px] font-mono bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 hover:text-white rounded transition-colors cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {searchedDtc && (
                  <div className="mt-3 p-3 bg-slate-950 border border-cyan-800/60 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400">{searchedDtc.code}</span>
                      <span className="text-[10px] text-slate-400">{searchedDtc.category}</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{searchedDtc.title}</h5>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(searchedDtc)}
                      className="w-full mt-1.5 py-1.5 text-xs text-center font-bold bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition-colors cursor-pointer"
                    >
                      Ver solución completa y síntomas →
                    </button>
                  </div>
                )}

                {hasSearched && !searchedDtc && searchQuery.trim().length > 0 && (
                  <div className="mt-3 p-3 bg-amber-950/40 border border-amber-800/70 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span className="text-xs font-bold">Código no reconocido</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      El texto <strong className="text-amber-200 font-mono">"{searchQuery.toUpperCase()}"</strong> no coincide con la norma OBD-II ni formatos de fábrica.
                    </p>
                    <div className="bg-slate-950/80 p-2 rounded-lg text-[10px] text-slate-400 space-y-1 border border-slate-800">
                      <p className="font-semibold text-slate-300">Formatos automotrices válidos:</p>
                      <ul className="list-disc list-inside space-y-0.5 font-mono text-[10px] text-cyan-300">
                        <li>P0xxx / P1xxx (Motor y Transmisión)</li>
                        <li>C0xxx / C1xxx (Chasis y Frenos ABS)</li>
                        <li>B0xxx / B1xxx (Carrocería y Airbags)</li>
                        <li>U0xxx / U1xxx (Red CAN de comunicación)</li>
                        <li>DFxxx (Renault) o 01314 (VAG / Volkswagen)</li>
                      </ul>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveSubTab('diccionario')}
                  className="w-full mt-3 py-2 px-3 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/60 text-cyan-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Explorar Diccionario Completo (+1.000 Códigos) →</span>
                </button>
              </div>
            </div>

            {/* Right Column: In-depth Plain Spanish Breakdown (Visible on Desktop) */}
            <div className="hidden lg:block lg:col-span-7">
              {selectedDtcDetail ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  {renderDetailContent(selectedDtcDetail, false)}
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                  <ShieldAlert className="w-10 h-10 mx-auto text-slate-600" />
                  <h3 className="text-sm font-semibold text-white">Seleccioná una falla para ver el diagnóstico</h3>
                  <p className="text-xs max-w-sm mx-auto">
                    Hacé clic en cualquiera de los códigos detectados a la izquierda para ver su detalle en pantalla completa.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* UNIVERSAL FULL DETAIL MODAL (Desktop dialog modal / Mobile full-screen) */}
      {isMobileDetailOpen && selectedDtcDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileDetailOpen(false);
          }}
        >
          <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-slate-950 sm:bg-slate-900 border-0 sm:border sm:border-slate-800 sm:rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Top Sticky Header */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
              <button
                onClick={() => setIsMobileDetailOpen(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 py-1.5 px-3 rounded-lg bg-cyan-950/60 border border-cyan-800/80 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{activeSubTab === 'diccionario' ? 'Volver al catálogo' : 'Volver a fallas'}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/60">
                  {selectedDtcDetail.code}
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-300 font-semibold max-w-[260px] truncate">
                  {selectedDtcDetail.title}
                </span>
              </div>

              <button
                onClick={() => setIsMobileDetailOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer transition-colors"
                title="Cerrar detalle (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Detail Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              {renderDetailContent(selectedDtcDetail, true)}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="sticky bottom-0 z-10 bg-slate-900/95 border-t border-slate-800 p-3 sm:px-6 flex gap-2.5">
              <button
                onClick={() => {
                  setIsMobileDetailOpen(false);
                  onBookAppointmentForDtc(selectedDtcDetail);
                }}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Pedir Turno en Taller para {selectedDtcDetail.code}</span>
              </button>
              <button
                onClick={() => setIsMobileDetailOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Clear DTCs */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                ¿Apagar la luz Check Engine y borrar fallas?
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción le ordenará a la computadora del auto apagar el testigo del tablero y borrar los registros almacenados.
              <br /><br />
              <strong>Atención:</strong> Si el problema mecánico no fue reparado, la computadora volverá a encender la luz al cabo de unos kilómetros.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAllDTCs}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors cursor-pointer"
              >
                Apagar Luz y Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
