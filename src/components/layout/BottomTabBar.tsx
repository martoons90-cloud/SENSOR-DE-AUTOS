import React from 'react';
import {
  Bluetooth,
  Terminal,
  Gauge,
  AlertTriangle,
  Droplets,
  Leaf,
  Wrench,
  History
} from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: 'danger' | 'warning' | 'info';
}

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeDtcsCount: number;
  urgentAlertsCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  activeDtcsCount,
  urgentAlertsCount = 0
}) => {
  const tabs: TabItem[] = [
    {
      id: 'conexion',
      label: 'Conexión ELM327',
      shortLabel: 'Conexión',
      icon: Bluetooth
    },
    {
      id: 'terminal',
      label: 'Consola Raw PIDs',
      shortLabel: 'Terminal',
      icon: Terminal
    },
    {
      id: 'telemetria',
      label: 'Vista en Vivo',
      shortLabel: 'En Vivo',
      icon: Gauge
    },
    {
      id: 'diagnostico',
      label: 'Diagnóstico',
      shortLabel: 'Fallas P',
      icon: AlertTriangle,
      badge: activeDtcsCount,
      badgeVariant: 'danger'
    },
    {
      id: 'fluidos',
      label: 'Fluidos & Motor',
      shortLabel: 'Fluidos',
      icon: Droplets
    },
    {
      id: 'eco',
      label: 'Ahorro Combustible',
      shortLabel: 'Ahorro',
      icon: Leaf
    },
    {
      id: 'talleres',
      label: 'Talleres & Turnos',
      shortLabel: 'Talleres',
      icon: Wrench
    },
    {
      id: 'historial',
      label: 'Historial',
      shortLabel: 'Historial',
      icon: History,
      badge: urgentAlertsCount > 0 ? urgentAlertsCount : undefined,
      badgeVariant: 'warning'
    }
  ];

  return (
    <nav
      aria-label="Navegación principal inferior"
      className="fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
    >
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between sm:justify-center sm:gap-2 md:gap-3 py-1.5 sm:py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex flex-col items-center justify-center flex-1 sm:flex-initial sm:px-4 py-1.5 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={tab.label}
              >
                {/* Active glow / background pill on desktop */}
                {isActive && (
                  <span className="absolute inset-0 bg-cyan-500/10 rounded-xl border border-cyan-500/30 sm:block hidden" />
                )}

                {/* Top micro-indicator for active tab on mobile */}
                {isActive && (
                  <span className="sm:hidden absolute -top-1.5 w-6 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}

                {/* Icon wrapper with Badge */}
                <div className="relative flex items-center justify-center mb-1">
                  <Icon
                    className={`w-5 h-5 sm:w-5 sm:h-5 transition-transform duration-200 ${
                      isActive
                        ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                        : 'group-hover:scale-105'
                    }`}
                  />

                  {/* Badge Counter */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center border ${
                        tab.badgeVariant === 'danger'
                          ? 'bg-rose-500 text-white border-rose-900 animate-pulse'
                          : 'bg-amber-400 text-amber-950 border-amber-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* Labels: Short on small screens, full on desktop */}
                <span className="text-[10px] sm:text-xs tracking-tight text-center leading-none truncate max-w-[58px] sm:max-w-none">
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
