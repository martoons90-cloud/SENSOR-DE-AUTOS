import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Info,
  Flame,
  Wrench,
  AlertTriangle,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { DTCFaultCode } from '../../types/vehicle';
import { getAllUniversalCodes, lookupDTC } from '../../services/obdDatabase';

interface DtcDictionarySectionProps {
  onSelectDtc: (dtc: DTCFaultCode) => void;
}

export const DtcDictionarySection: React.FC<DtcDictionarySectionProps> = ({
  onSelectDtc
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showObdGuide, setShowObdGuide] = useState(false);

  // All curated universal codes
  const allCodes = useMemo(() => getAllUniversalCodes(), []);

  const subsystems = [
    { id: 'all', label: `Fichas Frecuentes (${allCodes.length})` },
    { id: 'C0', label: 'C0 · Frenos y ABS' },
    { id: 'U0', label: 'U0 · Redes CAN-Bus' },
    { id: 'B0', label: 'B0 · Carrocería y Airbag' },
    { id: 'P2', label: 'P2 · Motor Moderno y DPF' },
    { id: 'P00', label: 'P00 · VVT y Distribución' },
    { id: 'P01', label: 'P01 · Aire y Sensores' },
    { id: 'P02', label: 'P02 · Inyectores y Bomba' },
    { id: 'P03', label: 'P03 · Encendido y Bujías' },
    { id: 'P04', label: 'P04 · Catalizador y EVAP' },
    { id: 'P05', label: 'P05 · Ralentí y Alternador' },
    { id: 'P06', label: 'P06 · Computadora ECU' },
    { id: 'P07', label: 'P07 · Caja Automática' },
    { id: 'P08', label: 'P08 · Embrague y Sensores' }
  ];

  // Filtered list based on search and category
  const filteredCodes = useMemo(() => {
    let result = allCodes;

    // Filter by subsystem prefix
    if (selectedSubsystem !== 'all') {
      result = result.filter(c => c.code.startsWith(selectedSubsystem));
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      result = result.filter(c => c.severity === selectedSeverity);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        c =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.symptoms.some(s => s.toLowerCase().includes(q)) ||
          c.possibleCauses.some(cau => cau.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allCodes, selectedSubsystem, selectedSeverity, searchQuery]);

  // If user searched for a specific code that wasn't found in the curated list,
  // we check if the SAE J2012 universal decoder can generate it dynamically from the 9,000+ codes universe!
  const dynamicallyDecodedCode = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return null;
    if (allCodes.some(c => c.code.toUpperCase() === q)) return null;
    if (/^[PCBU][0-9A-Za-z]{4}$/i.test(q) || /^DF[0-9]{3}$/i.test(q) || /^[0-9]{5}$/.test(q)) {
      return lookupDTC(q);
    }
    return null;
  }, [searchQuery, allCodes]);

  return (
    <div className="space-y-4">
      {/* Dictionary Top Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Enciclopedia OBD-II: Códigos P, C, B y U
                </h3>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  SAE J2012 · OBDex
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                540 fichas detalladas con síntomas y costos en $ ARS · Motor algorítmico con soporte para los +9.000 códigos SAE J2012 y fabricantes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowObdGuide(!showObdGuide)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showObdGuide ? 'Ocultar Guía' : '¿Cómo se lee un código P?'}</span>
          </button>
        </div>

        {/* Interactive Guide: Anatomy of a P code */}
        {showObdGuide && (
          <div className="mt-3 p-3.5 bg-slate-950/80 border border-cyan-800/60 rounded-xl space-y-3 text-xs animate-fadeIn">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Estructura universal de un código de falla (Ejemplo: P0300)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-lg font-black text-cyan-400 block">P</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">
                  <strong>Powertrain</strong>
                  <br />Motor o transmisión
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-lg font-black text-emerald-400 block">0</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">
                  <strong>Universal SAE</strong>
                  <br />Válido para cualquier marca
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-lg font-black text-amber-400 block">3</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">
                  <strong>Subsistema</strong>
                  <br />3 = Encendido y Bujías
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-lg font-black text-purple-400 block">00</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">
                  <strong>Falla puntual</strong>
                  <br />00 = Misfire múltiple
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Gracias a esta norma universal obligatoria desde 2010, un código como <strong>P0300</strong> significa exactamente lo mismo en un Ford, Chevrolet, Volkswagen, Toyota, Renault, Fiat o Peugeot.
            </p>
          </div>
        )}

        {/* Live Search and Quick Filter Row */}
        <div className="mt-3.5 flex flex-col sm:flex-row gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código (ej. P0300) o síntoma (bujías, humo, nafta, tironeo, agua)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Severity selector */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedSeverity === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedSeverity('critical')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedSeverity === 'critical'
                  ? 'bg-red-950 border border-red-700 text-red-300'
                  : 'bg-slate-950 text-slate-400 hover:text-red-300 border border-slate-800'
              }`}
            >
              Críticos
            </button>
            <button
              onClick={() => setSelectedSeverity('warning')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedSeverity === 'warning'
                  ? 'bg-amber-950 border border-amber-700 text-amber-300'
                  : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
              }`}
            >
              Alertas
            </button>
          </div>
        </div>

        {/* Subsystem category filter chips (Horizontal swipeable for mobile) */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {subsystems.map((sub) => {
            const isSelected = selectedSubsystem === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubsystem(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Decoder Fallback Card if user searched any code from P0000 to P0999 */}
      {dynamicallyDecodedCode && (
        <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-600 rounded-2xl p-4 shadow-xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">
                Código decodificado por la norma internacional SAE J2012:
              </span>
            </div>
            <span className="font-mono text-sm font-black text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {dynamicallyDecodedCode.code}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">
            {dynamicallyDecodedCode.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {dynamicallyDecodedCode.description}
          </p>
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onSelectDtc(dynamicallyDecodedCode)}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Ver ficha técnica completa de {dynamicallyDecodedCode.code}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Results Count & Status */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>
          Mostrando <strong>{filteredCodes.length}</strong> códigos encontrados
          {selectedSubsystem !== 'all' && ` en ${selectedSubsystem}xx`}
        </span>
        <span className="text-[11px] text-cyan-400 font-mono">
          Tocá cualquier código para ver síntomas y solución
        </span>
      </div>

      {/* Codes Grid */}
      {filteredCodes.length === 0 && !dynamicallyDecodedCode ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-xs font-bold text-white">No se encontraron códigos con ese término</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Probá buscar por número de código (ej. P0300) o palabras clave como "oxígeno", "bujía", "falla", "temperatura".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredCodes.map((dtc) => (
            <div
              key={dtc.code}
              onClick={() => onSelectDtc(dtc)}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/70 hover:bg-slate-800/80 rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-cyan-400 group-hover:text-cyan-300">
                      {dtc.code}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {dtc.category}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      dtc.severity === 'critical'
                        ? 'bg-red-950/80 text-red-300 border border-red-900'
                        : dtc.severity === 'warning'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-900'
                        : 'bg-blue-950/80 text-blue-300 border border-blue-900'
                    }`}
                  >
                    {dtc.severity === 'critical'
                      ? 'Crítico'
                      : dtc.severity === 'warning'
                      ? 'Alerta'
                      : 'Preventivo'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-200 transition-colors">
                  {dtc.title}
                </h4>

                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {dtc.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-slate-400 font-mono">
                  Reparación: <strong className="text-emerald-400">{dtc.estimatedRepairCostRange.split(' ')[0]}</strong>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDtc(dtc);
                  }}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  <span>Ver detalle</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
