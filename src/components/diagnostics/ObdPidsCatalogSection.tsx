import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Search,
  CheckCircle2,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  Zap,
  Gauge,
  Activity,
  Layers
} from 'lucide-react';
import { OBD_PIDS_CATALOG, OBDPidDefinition } from '../../services/obdPidsDatabase';

export const ObdPidsCatalogSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPid, setSelectedPid] = useState<OBDPidDefinition | null>(OBD_PIDS_CATALOG[0]);

  const categories = [
    { id: 'all', label: `Todos (${OBD_PIDS_CATALOG.length})` },
    { id: 'Motor', label: 'Motor y RPM' },
    { id: 'Aire / Admisión', label: 'Admisión y MAP/MAF' },
    { id: 'Combustible', label: 'Combustible y Mezcla' },
    { id: 'Cuadro Congelado', label: 'Modo 02 · Freeze Frame' },
    { id: 'Transmisión', label: 'Caja y Transmisión' },
    { id: 'UDS Fabricante', label: 'Modo 22 · UDS (Ford / VAG)' },
    { id: 'Eléctrico', label: 'Voltaje y Batería' },
    { id: 'Emisiones', label: 'Emisiones y MIL' },
    { id: 'Identificación', label: 'Modo 09 · VIN y ECU' }
  ];

  const filteredPids = useMemo(() => {
    let result = OBD_PIDS_CATALOG;

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        p =>
          p.pid.toLowerCase().includes(q) ||
          p.command.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.formula.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q)
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Catálogo de PIDs de Telemetría en Vivo (OBD-II)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full">
                  Dataset OBDex (CC0)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fórmulas matemáticas oficiales (SAE J1979 / ISO 15031-5) para decodificar los sensores en tiempo real vía ELM327.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar & Categories */}
        <div className="mt-3.5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por comando (ej. 01 0C, 01 04, 09 02), sensor (RPM, MAF, VIN, presión) o fórmula..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
            {categories.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: PID List & Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: PIDs List */}
        <div className="lg:col-span-5 space-y-2 max-h-[580px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Mostrando {filteredPids.length} parámetros</span>
            <span>Toca un PID para ver su fórmula</span>
          </div>

          {filteredPids.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400">
              <Cpu className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-semibold">No se encontraron PIDs con ese criterio</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-[11px] text-indigo-400 hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            filteredPids.map(p => {
              const isSelected = selectedPid?.command === p.command;
              return (
                <div
                  key={p.command}
                  onClick={() => setSelectedPid(p)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-950 text-indigo-300 border border-indigo-800/60 rounded-md">
                        {p.command}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 py-0.5 bg-slate-800 rounded">
                        {p.unit}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{p.category}</span>
                  </div>

                  <p className="text-xs font-bold text-white mt-1.5 leading-snug">{p.name}</p>
                  <p className="text-[11px] font-mono text-cyan-400/90 mt-1 truncate">
                    Fórmula: {p.formula}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed PID card */}
        <div className="lg:col-span-7">
          {selectedPid ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-black px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded-lg">
                      {selectedPid.command}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 font-semibold rounded-md">
                      Modo {selectedPid.mode} · PID {selectedPid.pid}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-indigo-900/40 text-indigo-300 font-semibold rounded-md border border-indigo-800/40">
                      {selectedPid.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white">{selectedPid.name}</h2>
                  <p className="text-xs text-slate-400 font-medium italic">{selectedPid.nameEn}</p>
                </div>
              </div>

              {/* Formula & Math Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Fórmula matemática de decodificación
                  </span>
                  <span className="text-[11px] text-slate-400">Bytes requeridos: {selectedPid.bytes}</span>
                </div>
                <div className="font-mono text-sm font-bold text-cyan-300 bg-slate-900/90 border border-cyan-900/40 px-3 py-2 rounded-lg">
                  {selectedPid.formula}
                </div>
                <p className="text-[11px] text-slate-400">
                  <span className="text-white font-semibold">A</span> representa el primer byte de respuesta en hexadecimal y <span className="text-white font-semibold">B</span> el segundo byte cuando el sensor entrega 16 bits de resolución.
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium block mb-1">Unidad de Medida</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedPid.unit}</span>
                </div>
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium block mb-1">Rango del Estándar</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {selectedPid.rangeMin} a {selectedPid.rangeMax}
                  </span>
                </div>
              </div>

              {/* Typical Normal Values */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Valores Normales en Funcionamiento:
                </div>
                <p className="text-xs text-emerald-200/90 font-medium">
                  {selectedPid.typicalNormal}
                </p>
              </div>

              {/* Practical Description */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  ¿Para qué sirve y cómo interpretarlo?
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPid.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              Selecciona un PID de la lista para ver su especificación técnica completa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
