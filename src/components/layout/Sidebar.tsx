import React from 'react';
import {
  LayoutDashboard,
  Wrench,
  Package,
  Receipt,
  WalletCards,
  CalendarClock,
  SlidersHorizontal,
  ShieldCheck,
  Fuel,
  History
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  openOtCount?: number;
  lowStockCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  openOtCount = 4,
  lowStockCount = 4
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Panel General',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'ver-auto',
      name: 'Historial Auto (ELM327)',
      icon: History,
      badge: 'Bitácora',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
    },
    {
      id: 'trabajos',
      name: 'Órdenes de Trabajo',
      icon: Wrench,
      badge: openOtCount > 0 ? `${openOtCount} activas` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
    },
    {
      id: 'stock',
      name: 'Stock y Lubricantes',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} reposición` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      id: 'ventas',
      name: 'Ventas y Mostrador',
      icon: Receipt,
      badge: null
    },
    {
      id: 'cobranzas',
      name: 'Cobranzas y Ctas. Ctes.',
      icon: WalletCards,
      badge: '4 cuentas',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'turnos',
      name: 'Turnos y Agenda',
      icon: CalendarClock,
      badge: '3 hoy',
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    },
    {
      id: 'config',
      name: 'Configuración Taller',
      icon: SlidersHorizontal,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 h-screen flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
            <Fuel className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white tracking-tight">LUBRICENTRO</span>
              <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">ERP & Gestión de Taller</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Módulos Operativos
        </div>
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && !isActive && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operator profile footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 font-bold text-xs">
            ET
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-white truncate">Encargado General</p>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-300 truncate">Taller & Fosa Central</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
