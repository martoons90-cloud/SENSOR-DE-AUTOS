import React from 'react';
import { Search, Bell, Smartphone, Plus, ShoppingCart, Wrench } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onNavigateToApp: () => void;
  onNavigateToLanding?: () => void;
  onOpenNewOtModal: () => void;
  onOpenNewSaleModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigateToApp,
  onNavigateToLanding,
  onOpenNewOtModal,
  onOpenNewSaleModal,
  searchQuery,
  onSearchChange,
}) => {
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return { title: 'Panel de Control', subtitle: 'Resumen operativo, ocupación de fosas y flujo financiero' };
      case 'ver-auto':
        return { title: 'Historial del Auto · ELM327', subtitle: 'Bitácora de comportamiento: consumo, batería, testigos y alertas' };
      case 'trabajos':
        return { title: 'Órdenes de Trabajo (OT)', subtitle: 'Gestión de servicios en fosas, elevadores y entregas' };
      case 'stock':
        return { title: 'Stock y Lubricantes', subtitle: 'Control de aceites a granel, bidones, filtros y repuestos' };
      case 'ventas':
        return { title: 'Ventas y Facturación', subtitle: 'Tickets de mostrador y liquidación de servicios de taller' };
      case 'cobranzas':
        return { title: 'Cobranzas y Cuentas Corrientes', subtitle: 'Seguimiento de deudas de flotas, recibos y saldos' };
      case 'turnos':
        return { title: 'Agenda de Turnos', subtitle: 'Citas programadas para cambio de fluidos y services' };
      case 'config':
        return { title: 'Configuración de Taller', subtitle: 'Parámetros del lubricentro, mecánicos y tarifas' };
      default:
        return { title: 'Taller & Lubricentro', subtitle: 'Sistema de Gestión Integral' };
    }
  };

  const { title, subtitle } = getSectionTitle();

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Title & Context */}
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-white tracking-tight leading-none">{title}</h1>
        <p className="text-[11px] text-slate-300 mt-1 hidden sm:block">{subtitle}</p>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por patente, cliente, código de filtro, OT..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {onNavigateToLanding && (
          <button
            onClick={onNavigateToLanding}
            title="Ir a la página web comercial de la aplicación"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-all"
          >
            <span>Web Comercial</span>
          </button>
        )}

        {/* OBD2 App Link */}
        <button
          onClick={onNavigateToApp}
          title="Acceder a la herramienta de diagnóstico y lectura Bluetooth ELM327"
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg text-xs font-semibold shadow-sm transition-all group"
        >
          <Smartphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>App OBD2</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Quick Sale Button */}
        <button
          onClick={onOpenNewSaleModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-all"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
          <span>Venta Rápida</span>
        </button>

        {/* New Work Order Primary Action */}
        <button
          onClick={onOpenNewOtModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nueva OT</span>
        </button>
      </div>
    </header>
  );
};
