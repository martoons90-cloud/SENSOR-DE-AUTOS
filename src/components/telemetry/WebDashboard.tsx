import React, { useState, useMemo } from 'react';
import { WebLayout } from '../layout/WebLayout';
import { DashboardCard } from '../layout/DashboardCard';
import {
  Wrench,
  Package,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  ChevronRight,
  TrendingUp,
  Receipt,
  Search,
  Plus,
  ArrowUpRight,
  Fuel,
  Cpu,
  Layers,
  Phone,
  Calendar,
  CreditCard,
  WalletCards,
  FileText,
  Smartphone,
  Info,
  Radio,
  History
} from 'lucide-react';
import {
  WorkOrder,
  Product,
  Sale,
  CustomerAccount,
  ServiceBay,
  WorkshopAppointment,
  JobStatus,
  ProductCategory
} from '../../types/erp';
import {
  INITIAL_WORK_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_CUSTOMER_ACCOUNTS,
  INITIAL_BAYS,
  INITIAL_APPOINTMENTS
} from '../../services/mockErpData';
import { NewWorkOrderModal } from '../erp/NewWorkOrderModal';
import { NewSaleModal } from '../erp/NewSaleModal';
import { RecordPaymentModal } from '../erp/RecordPaymentModal';
import { AdjustStockModal } from '../erp/AdjustStockModal';
import { VehicleLiveTelemetryView } from '../erp/VehicleLiveTelemetryView';

export const WebDashboard: React.FC<{
  onNavigateToApp: () => void;
  onNavigateToLanding?: () => void;
}> = ({ onNavigateToApp, onNavigateToLanding }) => {
  // Navigation & View State
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Domain Entities State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [accounts, setAccounts] = useState<CustomerAccount[]>(INITIAL_CUSTOMER_ACCOUNTS);
  const [bays, setBays] = useState<ServiceBay[]>(INITIAL_BAYS);
  const [appointments, setAppointments] = useState<WorkshopAppointment[]>(INITIAL_APPOINTMENTS);

  // Modals State
  const [isNewOtModalOpen, setIsNewOtModalOpen] = useState(false);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedAccountForPayment, setSelectedAccountForPayment] = useState<string | undefined>();
  const [selectedProductForStock, setSelectedProductForStock] = useState<string | undefined>();
  const [selectedOtDetail, setSelectedOtDetail] = useState<WorkOrder | null>(null);

  // Filters
  const [otStatusFilter, setOtStatusFilter] = useState<string>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [tableDensity, setTableDensity] = useState<'compact' | 'comfortable'>('compact');

  // Computed KPIs
  const activeOtsCount = workOrders.filter(o => o.status !== 'entregado').length;
  const inProgressOtsCount = workOrders.filter(o => o.status === 'en_proceso').length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalReceivables = accounts.reduce((sum, a) => sum + a.totalDebt, 0);
  const todaySalesTotal = sales
    .filter(s => s.date === '2026-10-04')
    .reduce((sum, s) => sum + s.total, 0);

  // Handlers for interactive actions
  const handleCreateWorkOrder = (newOrder: WorkOrder) => {
    setWorkOrders(prev => [newOrder, ...prev]);
    // If bay assigned, update bay status
    setBays(prev =>
      prev.map(b =>
        b.name === newOrder.bay
          ? {
              ...b,
              isOccupied: true,
              currentOtId: newOrder.id,
              currentVehicle: `${newOrder.vehicleModel} (${newOrder.vehiclePlate})`,
              currentService: newOrder.serviceDetails,
              mechanic: newOrder.mechanic,
              progressPercent: 20
            }
          : b
      )
    );
  };

  const handleCreateSale = (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);
    // Subtract stock if applicable
    newSale.items.forEach(item => {
      if (item.productId) {
        setProducts(prev =>
          prev.map(p =>
            p.id === item.productId
              ? { ...p, stock: Math.max(0, p.stock - item.quantity) }
              : p
          )
        );
      }
    });
  };

  const handleRecordPayment = (
    accountId: string,
    amount: number,
    paymentMethod: any,
    notes: string
  ) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === accountId) {
          const newDebt = Math.max(0, acc.totalDebt - amount);
          return {
            ...acc,
            totalDebt: newDebt,
            lastPaymentDate: new Date().toISOString().split('T')[0]
          };
        }
        return acc;
      })
    );
  };

  const handleAddStock = (productId: string, quantityToAdd: number, newCostPrice?: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stock: p.stock + quantityToAdd,
            costPrice: newCostPrice || p.costPrice
          };
        }
        return p;
      })
    );
  };

  const handleUpdateOtStatus = (otId: string, newStatus: JobStatus) => {
    setWorkOrders(prev =>
      prev.map(ot => {
        if (ot.id === otId) {
          return { ...ot, status: newStatus };
        }
        return ot;
      })
    );
    if (selectedOtDetail && selectedOtDetail.id === otId) {
      setSelectedOtDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'ingresado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-400" /> Ingresado
          </span>
        );
      case 'en_proceso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> En Fosa / Proceso
          </span>
        );
      case 'esperando_repuestos':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Espera Repuestos
          </span>
        );
      case 'finalizado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Terminado / Listo
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
            ✓ Entregado
          </span>
        );
    }
  };

  // Filtered lists
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(ot => {
      const matchesSearch =
        searchQuery === '' ||
        ot.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ot.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ot.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ot.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = otStatusFilter === 'all' || ot.status === otStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workOrders, searchQuery, otStatusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, productCategoryFilter]);

  return (
    <WebLayout
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      onNavigateToApp={onNavigateToApp}
      onNavigateToLanding={onNavigateToLanding}
      onOpenNewOtModal={() => setIsNewOtModalOpen(true)}
      onOpenNewSaleModal={() => setIsNewSaleModalOpen(true)}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      openOtCount={activeOtsCount}
      lowStockCount={lowStockProducts.length}
    >
      {/* ========================================================================= */}
      {/* VISTA 1: DASHBOARD GENERAL (PANEL PRINCIPAL)                             */}
      {/* ========================================================================= */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Fosas & Elevadores */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Trabajos en Taller / Fosas
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white font-mono">{activeOtsCount}</span>
                  <span className="text-xs text-cyan-400 font-medium font-mono">
                    ({inProgressOtsCount} en ejecución)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Capacidad fosas/elevadores: 4/5 ocupados
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 2: Stock Crítico */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Stock Crítico / Reposición
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-amber-400 font-mono">
                    {lowStockProducts.length}
                  </span>
                  <span className="text-xs text-slate-400">ítems bajo mínimo</span>
                </div>
                <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
                  Tambor Motul 5W30 (28L rest.)
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedProductForStock(lowStockProducts[0]?.id);
                  setIsStockModalOpen(true);
                }}
                className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-colors"
                title="Cargar ingreso de stock"
              >
                <Package className="w-5 h-5" />
              </button>
            </div>

            {/* KPI 3: Facturación del Día */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Ventas / Facturado Hoy
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-emerald-400 font-mono">
                    ${todaySalesTotal.toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mostrador: $53.5k · Servicios: $270k
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 4: Cobranzas y Deudas Cta Cte */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Cobranzas Pendientes
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white font-mono">
                    ${totalReceivables.toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-[11px] text-red-400 mt-1 font-medium">
                  3 facturas con plazo vencido
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedAccountForPayment(accounts[0]?.id);
                  setIsPaymentModalOpen(true);
                }}
                className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors"
                title="Registrar cobranza"
              >
                <WalletCards className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Section: Bahías de Trabajo / Fosas en Tiempo Real */}
          <DashboardCard
            title="Monitoreo de Bahías de Trabajo en Tiempo Real"
            subtitle="Estado operativo de fosas de lubricación rápida, elevadores hidráulicos y bahía de diagnóstico OBD2"
            action={
              <button
                onClick={onNavigateToApp}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-cyan-400 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Vincular ELM327 Bluetooth</span>
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {bays.map(bay => (
                <div
                  key={bay.id}
                  className={`rounded-xl p-3.5 border transition-all ${
                    bay.isOccupied
                      ? 'bg-slate-950/80 border-cyan-500/30 shadow-sm'
                      : 'bg-slate-950/40 border-dashed border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white truncate">{bay.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        bay.isOccupied
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {bay.isOccupied ? 'OCUPADA' : 'DISPONIBLE'}
                    </span>
                  </div>

                  {bay.isOccupied ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[11px] text-cyan-400 font-semibold font-mono block truncate">
                          {bay.currentOtId}
                        </span>
                        <p className="text-white font-medium truncate">{bay.currentVehicle}</p>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                        {bay.currentService}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Mecánico:</span>
                        <span className="text-slate-300 font-medium truncate">{bay.mechanic}</span>
                      </div>

                      {bay.progressPercent !== undefined && (
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Avance del service:</span>
                            <span className="font-mono text-cyan-400 font-bold">{bay.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${bay.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-28 flex flex-col items-center justify-center text-center p-2">
                      <p className="text-xs text-slate-400 mb-2">Puesto libre para asignación</p>
                      <button
                        onClick={() => setIsNewOtModalOpen(true)}
                        className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                      >
                        + Asignar Vehículo
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Dual Column: Active Work Orders (Left) and Stock Alerts + Fast Actions (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Work Orders Table */}
            <div className="lg:col-span-2">
              <DashboardCard
                title="Órdenes de Trabajo en Curso"
                subtitle="Vehículos actualmente en taller con estado de servicio y próximo mantenimiento"
                action={
                  <button
                    onClick={() => setActiveSection('trabajos')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                  >
                    Ver todas las OTs <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                }
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                      <tr>
                        <th className="py-2 px-3 whitespace-nowrap w-36">OT / Patente</th>
                        <th className="py-2 px-3 whitespace-nowrap min-w-[200px]">Vehículo & Cliente</th>
                        <th className="py-2 px-3 whitespace-nowrap min-w-[220px]">Servicio / Puesto</th>
                        <th className="py-2 px-3 whitespace-nowrap w-28">Estado</th>
                        <th className="py-2 px-3 text-right whitespace-nowrap w-24">Presupuesto</th>
                        <th className="py-2 px-3 text-center whitespace-nowrap w-20">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-slate-300 font-normal">
                      {workOrders.slice(0, 5).map(ot => (
                        <tr
                          key={ot.id}
                          className="hover:bg-slate-850/50 transition-colors cursor-pointer group"
                          onClick={() => setSelectedOtDetail(ot)}
                        >
                          <td className="py-1.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-cyan-400 font-bold text-xs">{ot.id}</span>
                              <span className="font-mono text-[10px] bg-slate-950 px-1 py-0.2 rounded border border-slate-800 text-slate-200">
                                {ot.vehiclePlate}
                              </span>
                            </div>
                          </td>
                          <td className="py-1.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 max-w-[220px]">
                              <span className="font-semibold text-white text-xs truncate" title={ot.vehicleModel}>
                                {ot.vehicleModel}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate shrink-0">
                                · {ot.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="py-1.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 max-w-[240px]">
                              <span className="text-slate-300 text-xs truncate" title={ot.serviceDetails}>
                                {ot.serviceDetails}
                              </span>
                              <span className="text-[10px] text-cyan-400 font-medium shrink-0">
                                📍 {ot.bay.split('-')[0].trim()}
                              </span>
                            </div>
                          </td>
                          <td className="py-1.5 px-3 whitespace-nowrap">
                            {getStatusBadge(ot.status)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap text-xs">
                            ${ot.estimatedCost.toLocaleString('es-AR')}
                          </td>
                          <td className="py-1.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {ot.status === 'ingresado' && (
                              <button
                                onClick={() => handleUpdateOtStatus(ot.id, 'en_proceso')}
                                className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] rounded transition-all"
                              >
                                Iniciar
                              </button>
                            )}
                            {ot.status === 'en_proceso' && (
                              <button
                                onClick={() => handleUpdateOtStatus(ot.id, 'finalizado')}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded transition-all"
                              >
                                Finalizar
                              </button>
                            )}
                            {ot.status === 'finalizado' && (
                              <button
                                onClick={() => handleUpdateOtStatus(ot.id, 'entregado')}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-[10px] rounded transition-all"
                              >
                                Entregar
                              </button>
                            )}
                            {(ot.status === 'esperando_repuestos' || ot.status === 'entregado') && (
                              <span className="text-[10px] text-slate-400 hover:text-white">Ficha</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </div>


            {/* Right 1 Col: Critical Stock Alerts & Recent Sales */}
            <div className="space-y-6">
              {/* Critical Stock List */}
              <DashboardCard
                title="Alertas de Reposición"
                subtitle="Lubricantes y repuestos por debajo del punto de pedido"
                action={
                  <button
                    onClick={() => {
                      setSelectedProductForStock(lowStockProducts[0]?.id);
                      setIsStockModalOpen(true);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                  >
                    + Cargar Ingreso
                  </button>
                }
              >
                <div className="space-y-3">
                  {lowStockProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{prod.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>{prod.brand}</span>
                          <span>·</span>
                          <span>📍 {prod.location}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-amber-400 font-mono block">
                          {prod.stock} / {prod.minStock} {prod.unit}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedProductForStock(prod.id);
                            setIsStockModalOpen(true);
                          }}
                          className="mt-1 text-[10px] text-cyan-400 hover:underline font-medium"
                        >
                          Reponer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              {/* Quick Actions / Shortcuts */}
              <DashboardCard title="Operaciones Rápidas de Taller">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setIsNewOtModalOpen(true)}
                    className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white block">Nueva OT</span>
                    <span className="text-[11px] text-slate-400">Ingreso a fosa</span>
                  </button>

                  <button
                    onClick={() => setIsNewSaleModalOpen(true)}
                    className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white block">Venta Mostrador</span>
                    <span className="text-[11px] text-slate-400">Ticket directo</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAccountForPayment(accounts[0]?.id);
                      setIsPaymentModalOpen(true);
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                      <WalletCards className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white block">Cobranza Cta Cte</span>
                    <span className="text-[11px] text-slate-400">Recibo a cliente</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('ver-auto')}
                    className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-2 group-hover:scale-105 transition-transform">
                      <History className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white block">Historial del Auto</span>
                    <span className="text-[11px] text-slate-400">Bitácora ELM327</span>
                  </button>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA: VER AUTO Y TELEMETRÍA EN VIVO (ELM327)                             */}
      {/* ========================================================================= */}
      {activeSection === 'ver-auto' && (
        <VehicleLiveTelemetryView
          onCreateWorkOrderFromVehicle={(newOrder) => {
            handleCreateWorkOrder(newOrder);
            setActiveSection('trabajos');
          }}
          onNavigateToApp={onNavigateToApp}
        />
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: GESTIÓN DE ÓRDENES DE TRABAJO (TRABAJOS)                          */}
      {/* ========================================================================= */}
      {activeSection === 'trabajos' && (
        <div className="space-y-4">
          {/* Top Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'Todas', count: workOrders.length },
                { id: 'en_proceso', label: 'En Fosa / Proceso', count: workOrders.filter(o => o.status === 'en_proceso').length },
                { id: 'esperando_repuestos', label: 'Espera Repuestos', count: workOrders.filter(o => o.status === 'esperando_repuestos').length },
                { id: 'finalizado', label: 'Finalizadas', count: workOrders.filter(o => o.status === 'finalizado').length },
                { id: 'entregado', label: 'Entregadas', count: workOrders.filter(o => o.status === 'entregado').length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setOtStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    otStatusFilter === tab.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label} <span className="opacity-70 font-mono">({tab.count})</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Density Toggle */}
              <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800 items-center">
                <button
                  onClick={() => setTableDensity('compact')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    tableDensity === 'compact'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista compacta (alta densidad, menor altura)"
                >
                  Alta Densidad
                </button>
                <button
                  onClick={() => setTableDensity('comfortable')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    tableDensity === 'comfortable'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista cómoda con más espaciado"
                >
                  Cómoda
                </button>
              </div>

              <button
                onClick={() => setIsNewOtModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Nueva OT</span>
              </button>
            </div>
          </div>

          {/* Work Orders List (Ultra Compact) */}
          <DashboardCard noPadding>
            <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 sticky top-0 z-10 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                  <tr>
                    <th className="py-2 px-3 whitespace-nowrap w-32">OT / Patente</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[220px]">Vehículo & Cliente</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[240px]">Trabajo Solicitado</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[170px]">Mecánico & Puesto</th>
                    <th className="py-2 px-3 whitespace-nowrap w-28">Estado</th>
                    <th className="py-2 px-3 text-right whitespace-nowrap w-24">Total ($)</th>
                    <th className="py-2 px-3 text-center whitespace-nowrap w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {filteredWorkOrders.map(ot => {
                    const rowPad = tableDensity === 'compact' ? 'py-1.5 px-3' : 'py-3 px-3.5';
                    return (
                      <tr
                        key={ot.id}
                        className="hover:bg-slate-850/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedOtDetail(ot)}
                      >
                        {/* OT & Patente */}
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-cyan-400 text-xs">{ot.id}</span>
                            <span className="font-mono bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800 font-bold text-white text-[10px]">
                              {ot.vehiclePlate}
                            </span>
                          </div>
                        </td>

                        {/* Vehículo & Cliente (Single Line) */}
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <div className="flex items-center gap-1.5 max-w-[240px]">
                            <span className="font-bold text-white text-xs truncate" title={ot.vehicleModel}>
                              {ot.vehicleModel}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate shrink-0">
                              · {ot.customerName}
                            </span>
                          </div>
                        </td>

                        {/* Trabajo Solicitado (Single Line) */}
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <div className="text-slate-300 text-xs truncate max-w-[280px]" title={ot.serviceDetails}>
                            {ot.serviceDetails}
                          </div>
                        </td>

                        {/* Mecánico & Puesto */}
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-medium text-xs truncate max-w-[100px]">{ot.mechanic.split(' ')[0]}</span>
                            <span className="text-[10px] text-cyan-400/90 font-medium shrink-0">📍 {ot.bay.split('-')[0].trim()}</span>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className={`${rowPad} whitespace-nowrap`}>
                          {getStatusBadge(ot.status)}
                        </td>

                        {/* Total */}
                        <td className={`${rowPad} text-right font-mono font-bold text-emerald-400 whitespace-nowrap text-xs`}>
                          ${ot.estimatedCost.toLocaleString('es-AR')}
                        </td>

                        {/* Acciones */}
                        <td className={`${rowPad} text-center whitespace-nowrap`} onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedOtDetail(ot)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded transition-colors whitespace-nowrap"
                            >
                              Ficha
                            </button>
                            {ot.status !== 'entregado' && (
                              <select
                                value={ot.status}
                                onChange={(e) => handleUpdateOtStatus(ot.id, e.target.value as any)}
                                className="bg-slate-950 border border-slate-800 text-[10px] text-cyan-400 rounded px-1 py-0.5 focus:outline-none"
                              >
                                <option value="ingresado">Ingresado</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="esperando_repuestos">Espera Rep.</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="entregado">Entregado</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: STOCK & LUBRICANTES (INVENTARIO)                                */}
      {/* ========================================================================= */}
      {activeSection === 'stock' && (
        <div className="space-y-4">
          {/* Header Stats & Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block">Valor Total de Inventario</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">
                $1.840.000
              </span>
              <span className="text-[10px] text-slate-400">Valuado a precio de costo</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block">Tambores y Litros en Fosa</span>
              <span className="text-xl font-bold text-cyan-400 font-mono mt-1 block">
                170 Litros
              </span>
              <span className="text-[10px] text-slate-400">YPF Elaion (142L) · Motul (28L)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block">Filtros en Estantería</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">
                23 unidades
              </span>
              <span className="text-[10px] text-slate-400">Mann Filter, Wega, Fram</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs block">Productos Críticos</span>
                <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
                  {lowStockProducts.length} ítems
                </span>
                <span className="text-[10px] text-amber-400">Requieren reposición inmediata</span>
              </div>
              <button
                onClick={() => {
                  setSelectedProductForStock(products[0]?.id);
                  setIsStockModalOpen(true);
                }}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Reponer
              </button>
            </div>
          </div>

          {/* Category Filter & Density Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'aceites_motor', label: 'Aceites Motor' },
                { id: 'filtros', label: 'Filtros' },
                { id: 'aditivos_fluidos', label: 'Fluidos y Aditivos' },
                { id: 'pastillas_frenos', label: 'Frenos' },
                { id: 'baterias', label: 'Baterías' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setProductCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    productCategoryFilter === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Density Toggle */}
              <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800 items-center">
                <button
                  onClick={() => setTableDensity('compact')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    tableDensity === 'compact'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista compacta (alta densidad, menor altura)"
                >
                  Alta Densidad
                </button>
                <button
                  onClick={() => setTableDensity('comfortable')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    tableDensity === 'comfortable'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista cómoda con más espaciado"
                >
                  Cómoda
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedProductForStock(products[0]?.id);
                  setIsStockModalOpen(true);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ingreso Mercadería</span>
              </button>
            </div>
          </div>

          {/* Products Table (Ultra Compact & High Density) */}
          <DashboardCard noPadding>
            <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 sticky top-0 z-10 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                  <tr>
                    <th className="py-2 px-3 whitespace-nowrap w-36">SKU</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[280px]">Producto & Marca</th>
                    <th className="py-2 px-3 whitespace-nowrap w-28">Categoría</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[190px]">Stock Actual / Mínimo</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[180px]">Ubicación</th>
                    <th className="py-2 px-3 text-right whitespace-nowrap w-24">Costo ($)</th>
                    <th className="py-2 px-3 text-right whitespace-nowrap w-24">Venta ($)</th>
                    <th className="py-2 px-3 text-right whitespace-nowrap w-20">Margen</th>
                    <th className="py-2 px-3 text-center whitespace-nowrap w-20">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredProducts.map(prod => {
                    const isLow = prod.stock <= prod.minStock;
                    const margin = Math.round(((prod.salePrice - prod.costPrice) / prod.costPrice) * 100);
                    const rowPad = tableDensity === 'compact' ? 'py-1.5 px-3' : 'py-3 px-3.5';

                    return (
                      <tr
                        key={prod.id}
                        className={`hover:bg-slate-850/60 transition-colors ${
                          isLow ? 'bg-amber-500/[0.02]' : ''
                        }`}
                      >
                        {/* SKU */}
                        <td className={`${rowPad} font-mono text-[11px] text-slate-400 whitespace-nowrap`}>
                          {prod.sku}
                        </td>

                        {/* Producto & Marca (Strict Single-Line with Truncate) */}
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <div className="flex items-center gap-2 max-w-[340px]">
                            <span
                              className="font-bold text-white text-xs truncate"
                              title={prod.name}
                            >
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-semibold px-1 py-0.2 bg-cyan-950/60 rounded border border-cyan-800/40 shrink-0">
                              {prod.brand}
                            </span>
                          </div>
                        </td>

                        {/* Categoría */}
                        <td className={`${rowPad} uppercase text-[10px] font-semibold text-slate-400 whitespace-nowrap`}>
                          {prod.category.replace('_', ' ')}
                        </td>

                        {/* Stock Actual vs Mínimo */}
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <div className="flex items-center gap-2 font-mono">
                            <span
                              className={`font-bold text-xs ${
                                isLow ? 'text-amber-400 font-extrabold' : 'text-slate-100'
                              }`}
                            >
                              {prod.stock} {prod.unit}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              / mín {prod.minStock}
                            </span>
                            {isLow && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-extrabold border border-amber-500/30">
                                REPONER
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Ubicación (Single line, strictly constrained) */}
                        <td className={`${rowPad} text-slate-300 text-[11px] whitespace-nowrap max-w-[200px] truncate`} title={prod.location}>
                          📍 {prod.location}
                        </td>

                        {/* Costo */}
                        <td className={`${rowPad} text-right font-mono text-slate-400 text-xs whitespace-nowrap`}>
                          ${prod.costPrice.toLocaleString('es-AR')}
                        </td>

                        {/* Venta */}
                        <td className={`${rowPad} text-right font-mono font-bold text-emerald-400 text-xs whitespace-nowrap`}>
                          ${prod.salePrice.toLocaleString('es-AR')}
                        </td>

                        {/* Margen */}
                        <td className={`${rowPad} text-right font-mono text-cyan-400 font-bold text-xs whitespace-nowrap`}>
                          +{margin}%
                        </td>

                        {/* Acción */}
                        <td className={`${rowPad} text-center whitespace-nowrap`}>
                          <button
                            onClick={() => {
                              setSelectedProductForStock(prod.id);
                              setIsStockModalOpen(true);
                            }}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-medium transition-colors whitespace-nowrap"
                          >
                            + Reponer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 4: VENTAS Y FACTURACIÓN (MOSTRADOR Y TALLER)                       */}
      {/* ========================================================================= */}
      {activeSection === 'ventas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Facturación Acumulada</span>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-2xl font-bold text-emerald-400 font-mono">
                  ${sales.reduce((sum, s) => sum + s.total, 0).toLocaleString('es-AR')}
                </span>
                <span className="text-xs text-slate-400">Total {sales.length} comprobantes registrados</span>
              </div>
            </div>

            <button
              onClick={() => setIsNewSaleModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar Venta de Mostrador</span>
            </button>
          </div>

          <DashboardCard noPadding>
            <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 sticky top-0 z-10 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                  <tr>
                    <th className="py-2 px-3 whitespace-nowrap w-28">Comprobante</th>
                    <th className="py-2 px-3 whitespace-nowrap w-28">Fecha & Hora</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[180px]">Cliente / Patente</th>
                    <th className="py-2 px-3 whitespace-nowrap w-24">Tipo</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[260px]">Detalle de Ítems</th>
                    <th className="py-2 px-3 whitespace-nowrap w-28">Medio de Pago</th>
                    <th className="py-2 px-3 whitespace-nowrap w-24">Estado</th>
                    <th className="py-2 px-3 text-right whitespace-nowrap w-24">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {sales.map(sale => {
                    const rowPad = tableDensity === 'compact' ? 'py-1.5 px-3' : 'py-3 px-3.5';
                    return (
                      <tr key={sale.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className={`${rowPad} font-mono font-bold text-white whitespace-nowrap`}>
                          {sale.id}
                        </td>
                        <td className={`${rowPad} whitespace-nowrap font-mono text-slate-400 text-[11px]`}>
                          {sale.date} · {sale.time}
                        </td>
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <div className="flex items-center gap-1.5 max-w-[200px]">
                            <span className="font-semibold text-white text-xs truncate" title={sale.customerName}>
                              {sale.customerName}
                            </span>
                            {sale.customerPlate && (
                              <span className="text-[10px] font-mono bg-slate-950 px-1 py-0.2 rounded text-cyan-400 border border-slate-800 shrink-0">
                                {sale.customerPlate}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              sale.type === 'servicio_taller'
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {sale.type === 'servicio_taller' ? 'Servicio Taller' : 'Mostrador'}
                          </span>
                        </td>
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <p className="text-slate-300 text-xs truncate max-w-sm" title={sale.items.map(it => `${it.quantity}x ${it.description}`).join(' · ')}>
                            {sale.items.map(it => `${it.quantity}x ${it.description}`).join(' · ')}
                          </p>
                        </td>
                        <td className={`${rowPad} capitalize text-slate-300 whitespace-nowrap text-xs`}>
                          {sale.paymentMethod.replace('_', ' ')}
                        </td>
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              sale.status === 'cobrado'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {sale.status === 'cobrado' ? 'Cobrado' : 'Pendiente Cta'}
                          </span>
                        </td>
                        <td className={`${rowPad} text-right font-mono font-bold text-emerald-400 text-xs whitespace-nowrap`}>
                          ${sale.total.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 5: COBRANZAS Y CUENTAS CORRIENTES                                  */}
      {/* ========================================================================= */}
      {activeSection === 'cobranzas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block font-medium">Deuda Total de Clientes</span>
              <span className="text-2xl font-bold text-red-400 font-mono mt-1 block">
                ${totalReceivables.toLocaleString('es-AR')}
              </span>
              <span className="text-[10px] text-slate-400">Flotas de transportes y remises</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block font-medium">Facturas Fuera de Término</span>
              <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
                3 comprobantes
              </span>
              <span className="text-[10px] text-amber-400">Total vencido: $350.000</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs block font-medium">Límite Global de Crédito</span>
                <span className="text-2xl font-bold text-white font-mono mt-1 block">
                  $2.700.000
                </span>
                <span className="text-[10px] text-slate-400">Crédito operativo otorgado</span>
              </div>
              <button
                onClick={() => {
                  setSelectedAccountForPayment(accounts[0]?.id);
                  setIsPaymentModalOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Cobrar / Recibo</span>
              </button>
            </div>
          </div>

          {/* Accounts Table (Ultra Compact) */}
          <DashboardCard
            title="Listado de Clientes con Cuenta Corriente"
            subtitle="Control de saldos deudores, facturas pendientes e imputación de pagos"
            noPadding
          >
            <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 sticky top-0 z-10 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                  <tr>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[200px]">Cliente / Razón Social</th>
                    <th className="py-2 px-3 whitespace-nowrap w-28">CUIT / DNI</th>
                    <th className="py-2 px-3 whitespace-nowrap min-w-[160px]">Flota / Rubro</th>
                    <th className="py-2 px-3 whitespace-nowrap w-28">Teléfono</th>
                    <th className="py-2 px-3 text-right whitespace-nowrap w-24">Límite Crédito</th>
                    <th className="py-2 px-3 text-right whitespace-nowrap w-28">Saldo Deudor ($)</th>
                    <th className="py-2 px-3 whitespace-nowrap w-24">Último Pago</th>
                    <th className="py-2 px-3 text-center whitespace-nowrap w-24">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {accounts.map(acc => {
                    const hasOverdue = acc.pendingInvoices.some(i => i.isOverdue);
                    const rowPad = tableDensity === 'compact' ? 'py-1.5 px-3' : 'py-3 px-3.5';
                    return (
                      <tr key={acc.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className={`${rowPad} whitespace-nowrap`}>
                          <div className="flex items-center gap-1.5 max-w-[220px]">
                            <span className="font-bold text-white text-xs truncate" title={acc.customerName}>
                              {acc.customerName}
                            </span>
                            {hasOverdue && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 shrink-0">
                                MORA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`${rowPad} font-mono text-slate-400 whitespace-nowrap text-[11px]`}>{acc.cuitOrDni}</td>
                        <td className={`${rowPad} text-slate-300 whitespace-nowrap truncate max-w-[180px]`} title={acc.companyOrFleet}>{acc.companyOrFleet || 'Particular'}</td>
                        <td className={`${rowPad} text-slate-400 whitespace-nowrap text-[11px]`}>{acc.phone}</td>
                        <td className={`${rowPad} text-right font-mono text-slate-400 whitespace-nowrap text-xs`}>
                          ${acc.creditLimit.toLocaleString('es-AR')}
                        </td>
                        <td className={`${rowPad} text-right font-mono font-bold text-red-400 text-xs whitespace-nowrap`}>
                          ${acc.totalDebt.toLocaleString('es-AR')}
                        </td>
                        <td className={`${rowPad} font-mono text-slate-400 text-[11px] whitespace-nowrap`}>
                          {acc.lastPaymentDate}
                        </td>
                        <td className={`${rowPad} text-center whitespace-nowrap`}>
                          <button
                            onClick={() => {
                              setSelectedAccountForPayment(acc.id);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-[10px] transition-colors whitespace-nowrap"
                          >
                            Cobrar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 6: AGENDA Y TURNOS PROGRAMADOS                                     */}
      {/* ========================================================================= */}
      {activeSection === 'turnos' && (
        <div className="space-y-4">
          <DashboardCard
            title="Agenda de Turnos del Día"
            subtitle="Reservas para cambio de aceite, filtros y chequeos mecánicos programados"
            action={
              <button
                onClick={() => alert('Para agendar nuevo turno, cree una Orden de Trabajo con fecha programada.')}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo Turno
              </button>
            }
            noPadding
          >
            <div className="divide-y divide-slate-800">
              {appointments.map(app => (
                <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono">
                      <span className="text-base font-bold text-cyan-400 block">{app.timeSlot}</span>
                      <span className="text-[10px] text-slate-400">{app.date}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{app.customerName}</span>
                        <span className="font-mono text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-bold">
                          {app.plate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{app.vehicle} · {app.serviceRequested}</p>
                      <span className="text-[11px] text-cyan-400/80 font-medium">📍 Asignado: {app.bayAssigned}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        handleCreateWorkOrder({
                          id: `OT-${Math.floor(1060 + Math.random() * 400)}`,
                          vehiclePlate: app.plate,
                          vehicleModel: app.vehicle,
                          vehicleYear: 2021,
                          currentKm: 50000,
                          customerName: app.customerName,
                          customerPhone: app.phone,
                          customerType: 'particular',
                          serviceCategory: 'lubricentro',
                          serviceDetails: app.serviceRequested,
                          mechanic: 'Martín Gómez',
                          bay: app.bayAssigned || 'Fosa 1 - Lubricentro Rápido',
                          status: 'en_proceso',
                          date: app.date,
                          estimatedCost: 95000,
                          laborCost: 25000,
                          partsUsed: [],
                          nextServiceKm: 60000,
                          nextServiceDate: '2027-04-04'
                        });
                        alert(`Turno de ${app.customerName} ingresado a Fosa como Orden de Trabajo activa.`);
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Ingresar a Fosa Ahora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 7: CONFIGURACIÓN DE TALLER & TARIFAS                               */}
      {/* ========================================================================= */}
      {activeSection === 'config' && (
        <div className="space-y-6 max-w-4xl">
          <DashboardCard title="Datos de la Empresa / Taller">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  defaultValue="Lubricentro & Taller Mecánico Central"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">CUIT / Identificación Tributaria</label>
                <input
                  type="text"
                  defaultValue="30-71994821-2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Dirección del Taller</label>
                <input
                  type="text"
                  defaultValue="Av. San Martín 4520, Zona Industrial"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Teléfono Guardia / WhatsApp Clientes</label>
                <input
                  type="text"
                  defaultValue="+54 9 11 5821-9900"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Tarifas de Mano de Obra y Servicios Base">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Service Lubricentro Básico</span>
                <input
                  type="number"
                  defaultValue="22000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-mono font-bold text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Cambio de aceite + hasta 2 filtros</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Diagnóstico OBD2 / Escáner</span>
                <input
                  type="number"
                  defaultValue="48000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-cyan-400 font-mono font-bold text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Lectura con ELM327 y borrado DTC</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Mano de Obra Mecánica General</span>
                <input
                  type="number"
                  defaultValue="38000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono font-bold text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Por hora estándar de elevador</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETALLE DE ORDEN DE TRABAJO (FICHA TÉCNICA)                         */}
      {/* ========================================================================= */}
      {selectedOtDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white font-mono">{selectedOtDetail.id}</h2>
                    <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-bold text-cyan-400 text-xs">
                      {selectedOtDetail.vehiclePlate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedOtDetail.vehicleModel} ({selectedOtDetail.vehicleYear})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOtDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Cliente</span>
                  <span className="font-semibold text-white truncate block">{selectedOtDetail.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Kilometraje</span>
                  <span className="font-mono font-bold text-white">{selectedOtDetail.currentKm.toLocaleString('es-AR')} km</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Puesto / Bahía</span>
                  <span className="text-cyan-400 font-medium truncate block">{selectedOtDetail.bay}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Mecánico</span>
                  <span className="text-slate-200 truncate block">{selectedOtDetail.mechanic}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Descripción del Trabajo:</span>
                <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 leading-relaxed">
                  {selectedOtDetail.serviceDetails}
                </p>
              </div>

              {selectedOtDetail.diagnosticDtc && selectedOtDetail.diagnosticDtc.length > 0 && (
                <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider block">
                      Códigos de Falla OBD2 Detectados:
                    </span>
                    <div className="flex gap-2 mt-1">
                      {selectedOtDetail.diagnosticDtc.map(dtc => (
                        <span key={dtc} className="font-mono text-xs bg-cyan-900/60 text-cyan-200 px-2 py-0.5 rounded font-bold border border-cyan-500/40">
                          {dtc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOtDetail(null);
                      onNavigateToApp();
                    }}
                    className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 transition-colors"
                  >
                    Abrir Escáner ELM327
                  </button>
                </div>
              )}

              {/* Parts Used Table */}
              <div>
                <span className="text-slate-400 font-semibold block mb-2">Lubricantes y Repuestos Asignados:</span>
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Ítem / Repuesto</th>
                        <th className="py-2 px-3 text-right">Cant.</th>
                        <th className="py-2 px-3 text-right">P. Unitario</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {selectedOtDetail.partsUsed.map((p, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">{p.name}</td>
                          <td className="py-2 px-3 text-right font-mono">{p.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono">${p.unitPrice.toLocaleString('es-AR')}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-white">
                            ${(p.quantity * p.unitPrice).toLocaleString('es-AR')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-950/60 font-semibold">
                        <td colSpan={3} className="py-2 px-3 text-slate-400">Mano de Obra de Taller:</td>
                        <td className="py-2 px-3 text-right font-mono text-white">
                          ${selectedOtDetail.laborCost.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total & Next Service */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[11px] block">Próximo Service Programado:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {selectedOtDetail.nextServiceKm.toLocaleString('es-AR')} km · {selectedOtDetail.nextServiceDate}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] block">Total Facturado / Presupuesto:</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ${selectedOtDetail.estimatedCost.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Cambiar Estado:</span>
                <select
                  value={selectedOtDetail.status}
                  onChange={(e) => handleUpdateOtStatus(selectedOtDetail.id, e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="ingresado">Ingresado</option>
                  <option value="en_proceso">En Proceso / Fosa</option>
                  <option value="esperando_repuestos">Espera de Repuestos</option>
                  <option value="finalizado">Finalizado / Listo</option>
                  <option value="entregado">Entregado al Cliente</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOtDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <NewWorkOrderModal
        isOpen={isNewOtModalOpen}
        onClose={() => setIsNewOtModalOpen(false)}
        onSave={handleCreateWorkOrder}
      />

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        products={products}
        onSaveSale={handleCreateSale}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        accounts={accounts}
        onRecordPayment={handleRecordPayment}
        preselectedAccountId={selectedAccountForPayment}
      />

      <AdjustStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        products={products}
        onAddStock={handleAddStock}
        preselectedProductId={selectedProductForStock}
      />
    </WebLayout>
  );
};
