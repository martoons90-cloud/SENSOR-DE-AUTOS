import React, { useState } from 'react';
import {
  Car,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Clock,
  Fuel,
  Thermometer,
  Zap,
  Activity,
  History,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  Info
} from 'lucide-react';

interface PhoneAppMockupProps {
  interactive?: boolean;
  className?: string;
  defaultTab?: 'inicio' | 'auto' | 'viajes' | 'estado' | 'historial';
}

export const PhoneAppMockup: React.FC<PhoneAppMockupProps> = ({
  interactive = true,
  className = '',
  defaultTab = 'inicio'
}) => {
  const [activeTab, setActiveTab] = useState<'inicio' | 'auto' | 'viajes' | 'estado' | 'historial'>(defaultTab);
  const [showTechnicalData, setShowTechnicalData] = useState<boolean>(false);

  return (
    <div className={`relative mx-auto w-full max-w-[340px] sm:max-w-[360px] aspect-[9/19] rounded-[44px] bg-slate-900 border-[7px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-slate-100 select-none ${className}`}>
      {/* Phone Notch / Dynamic Island */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-30 flex items-center justify-between px-3">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80" />
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
      </div>

      {/* Status Bar */}
      <div className="pt-3 px-6 pb-1 flex justify-between items-center text-[11px] text-slate-400 font-medium z-20">
        <span>09:41</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-cyan-400 font-mono">OBD OK</span>
          <div className="w-4 h-2 rounded-sm border border-slate-500 relative">
            <div className="absolute inset-0.5 bg-emerald-400 rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Screen Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-16 space-y-3.5 scrollbar-none text-left">
        {/* HEADER: Mi Auto */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Mi Auto
            </span>
            <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Volkswagen Gol Trend</span>
            </h4>
          </div>
          <div className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-[10px] font-mono text-cyan-300">
            AF 342 LK
          </div>
        </div>

        {/* TAB 1: INICIO (HOME PROPUESTA) */}
        {activeTab === 'inicio' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* ESTADO GENERAL: Todo Bien */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-slate-300">Estado general</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Todo bien</span>
                </div>
              </div>

              {/* 4 Core Indicators */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span>Motor</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="font-bold text-white block">Normal</span>
                  <span className="text-[10px] text-emerald-400/90">Sin avisos</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span>Temperatura</span>
                    <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="font-bold text-white block">91 °C</span>
                  <span className="text-[10px] text-slate-400">Régimen óptimo</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span>Batería</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="font-bold text-white block">13,9 V</span>
                  <span className="text-[10px] text-emerald-400/90">Alternador cargando</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span>Combustible</span>
                    <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="font-bold text-white block">62%</span>
                  <span className="text-[10px] text-slate-400">~380 km restantes</span>
                </div>
              </div>
            </div>

            {/* ALGO QUE NOTAMOS (Detección preventiva humana) */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Algo que notamos
                </span>
              </div>
              <h5 className="text-xs font-bold text-white leading-snug">
                Estás realizando muchos viajes cortos.
              </h5>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                En el 64% de tus recorridos el motor no permaneció suficiente tiempo en su temperatura normal. Salir a autopista el fin de semana ayuda a limpiar la condensación.
              </p>
            </div>

            {/* ÚLTIMO VIAJE REGISTRADO */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[10px] mb-1">
                <span>Último viaje registrado</span>
                <span>Hoy · 08:30 hs</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">12,4 km en 22 min</span>
                <span className="font-mono text-cyan-400 text-xs font-bold">7,8 L/100 km</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MI AUTO */}
        {activeTab === 'auto' && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Ficha del Auto</span>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Kilometraje total:</span>
                <span className="font-mono font-bold text-white">48.920 km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Aceite recomendado:</span>
                <span className="font-medium text-slate-200">5W-40 Sintético VW 502</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Presión recomendada:</span>
                <span className="font-medium text-slate-200">30 PSI (2.1 bar)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Próximo service:</span>
                <span className="font-bold text-cyan-400">en 1.080 km</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Consejo del Fabricante</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                El motor EA111 1.6 8V utiliza correa de distribución. Su reemplazo programado es a los 60.000 km o 4 años.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: VIAJES */}
        {activeTab === 'viajes' && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Últimos 30 días</span>
                <span className="text-cyan-450 font-bold text-[11px]">47 viajes</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-sans">Recorrido:</span>
                  <span className="text-sm font-bold text-white">1.284 km</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-sans">Consumo:</span>
                  <span className="text-sm font-bold text-emerald-400">8,2 L/100km</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Trayectos Recientes</span>
              {[
                { time: 'Ayer 18:40', desc: 'Regreso del trabajo', km: '14,2 km', min: '28 min', l100: '8,4 L' },
                { time: 'Ayer 08:15', desc: 'Ida al trabajo', km: '13,8 km', min: '25 min', l100: '7,9 L' },
                { time: '02/10 12:10', desc: 'Viaje corto al súper', km: '2,1 km', min: '6 min', l100: '10,2 L (frío)' }
              ].map((v, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block text-[11px]">{v.desc}</span>
                    <span className="text-[10px] text-slate-400">{v.time} · {v.km} ({v.min})</span>
                  </div>
                  <span className="font-mono text-cyan-400 text-xs font-bold">{v.l100}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ESTADO */}
        {activeTab === 'estado' && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Todos los sistemas en regla</span>
              </div>
              <p className="text-[11px] text-slate-300">
                La ECU no reporta fallas en memoria. La luz Check Engine se encuentra apagada.
              </p>
            </div>

            {/* Toggle technical view */}
            <div className="pt-1">
              <button
                onClick={() => setShowTechnicalData(!showTechnicalData)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{showTechnicalData ? 'Ocultar PIDs técnicos' : 'Ver datos técnicos avanzados (PIDs)'}</span>
                </span>
                <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${showTechnicalData ? 'rotate-90' : ''}`} />
              </button>

              {showTechnicalData && (
                <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-1 text-slate-400">
                  <div className="flex justify-between"><span>PID 0C (RPM):</span> <span className="text-white">820 RPM</span></div>
                  <div className="flex justify-between"><span>PID 05 (ECT):</span> <span className="text-white">91 °C</span></div>
                  <div className="flex justify-between"><span>PID 04 (LOAD):</span> <span className="text-white">19.2%</span></div>
                  <div className="flex justify-between"><span>PID 0F (IAT):</span> <span className="text-white">24 °C</span></div>
                  <div className="flex justify-between"><span>PID 07 (STFT1):</span> <span className="text-emerald-400">+1.2%</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Historial Clínico</span>
              <span className="text-[10px] text-cyan-400 font-medium">Compartible</span>
            </div>

            <div className="space-y-2 border-l-2 border-slate-800 ml-2 pl-3">
              <div className="relative">
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -left-[17px] top-1" />
                <span className="text-[10px] text-slate-400 font-mono">48.000 km · 15/08</span>
                <p className="font-bold text-white text-[11px]">Service Oficial de Aceite y Filtros</p>
                <span className="text-[10px] text-slate-400">Realizado en Lubricentro Castro</span>
              </div>

              <div className="relative">
                <span className="w-2 h-2 rounded-full bg-cyan-400 absolute -left-[17px] top-1" />
                <span className="text-[10px] text-slate-400 font-mono">45.200 km · 10/05</span>
                <p className="font-bold text-white text-[11px]">Rotación y Alineación de Neumáticos</p>
              </div>

              <div className="relative">
                <span className="w-2 h-2 rounded-full bg-slate-600 absolute -left-[17px] top-1" />
                <span className="text-[10px] text-slate-400 font-mono">40.000 km · 12/01</span>
                <p className="font-bold text-white text-[11px]">Batería nueva colocada (Moura 12V 65Ah)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation of the Mobile App */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur border-t border-slate-800/80 px-2 py-2 flex justify-around items-center text-[10px] z-30">
        {[
          { id: 'inicio', label: 'Inicio', icon: Activity },
          { id: 'auto', label: 'Mi Auto', icon: Car },
          { id: 'viajes', label: 'Viajes', icon: Clock },
          { id: 'estado', label: 'Estado', icon: ShieldCheck },
          { id: 'historial', label: 'Historial', icon: History }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => interactive && setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
