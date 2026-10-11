import React, { useState } from 'react';
import {
  History,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  DollarSign,
  Car,
  ChevronDown,
  Wrench,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { MaintenanceRecord, MaintenanceAlert, VehicleProfile } from '../../types/vehicle';

interface MaintenanceHistoryViewProps {
  records: MaintenanceRecord[];
  alerts: MaintenanceAlert[];
  vehicle: VehicleProfile;
  onAddRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onBookServiceForAlert?: (title: string) => void;
}

export const MaintenanceHistoryView: React.FC<MaintenanceHistoryViewProps> = ({
  records,
  alerts,
  vehicle,
  onAddRecord,
  onBookServiceForAlert
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('todos');

  // New record form state
  const [formDate, setFormDate] = useState('2026-09-26');
  const [formMileage, setFormMileage] = useState(vehicle.currentMileage);
  const [formServiceType, setFormServiceType] = useState('Service de Aceite y Filtros');
  const [formWorkshop, setFormWorkshop] = useState('Lubricentro & Box Shell Helix Express');
  const [formCost, setFormCost] = useState(52000);
  const [formParts, setFormParts] = useState('Aceite Sintético 5W-40 (4L), Filtro Aceite, Filtro Aire');
  const [formInvoice, setFormInvoice] = useState('');
  const [formNotes, setFormNotes] = useState('Revisión general en orden.');

  const totalCost = records.reduce((acc, r) => acc + r.cost, 0);
  const avgCost = records.length > 0 ? Math.round(totalCost / records.length) : 0;

  const handleSubmitNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const partsArray = formParts.split(',').map(s => s.trim()).filter(Boolean);

    onAddRecord({
      date: formDate,
      mileage: Number(formMileage),
      serviceType: formServiceType,
      workshopName: formWorkshop,
      cost: Number(formCost),
      partsReplaced: partsArray,
      invoiceNumber: formInvoice || undefined,
      nextDueMileage: Number(formMileage) + 10000,
      nextDueDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      notes: formNotes
    });

    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Historial de Mantenimiento & Alertas de Vencimiento
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro digital certificado de intervenciones mecánicas para {vehicle.brand} {vehicle.model} ({vehicle.plate})
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-cyan-950/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showAddForm ? 'Cerrar Formulario' : 'Registrar Nuevo Mantenimiento'}</span>
        </button>
      </div>

      {/* Smart Expiration Alerts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Alertas Inteligentes de Vencimiento
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Calculado por odómetro ({vehicle.currentMileage.toLocaleString()} km) y antigüedad
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {alerts.map((alert) => {
            const isDue = alert.status === 'vencido' || alert.kmRemaining <= 0;
            const isSoon = alert.status === 'proximo' || (alert.kmRemaining > 0 && alert.kmRemaining <= 2000);

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDue
                    ? 'bg-red-950/30 border-red-800/80 text-red-200'
                    : isSoon
                    ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {alert.title}
                    </h4>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        isDue
                          ? 'bg-red-500 text-slate-950'
                          : isSoon
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {isDue ? 'Vencido' : isSoon ? 'Próximo' : 'Al Día'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">
                      {alert.kmRemaining <= 0
                        ? `Vencido hace ${Math.abs(alert.kmRemaining)} km`
                        : `En ${alert.kmRemaining.toLocaleString()} km`}
                    </span>
                    <span className="text-slate-500 font-mono">
                      Vence: {alert.dueDate}
                    </span>
                  </div>

                  {onBookServiceForAlert && isSoon && (
                    <button
                      onClick={() => onBookServiceForAlert(alert.title)}
                      className="w-full mt-2 py-1.5 text-[11px] font-semibold text-cyan-300 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-cyan-800/50 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Agendar Service Ahora</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Inversión Total en Mantenimiento:</span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
            ${totalCost.toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] text-slate-500">Histórico completo</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Costo Promedio por Intervención:</span>
          <span className="text-lg font-bold font-mono text-slate-200 mt-1 block">
            ${avgCost.toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] text-slate-500">En {records.length} servicios</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Kilometraje Actual Registrado:</span>
          <span className="text-lg font-bold font-mono text-cyan-400 mt-1 block">
            {vehicle.currentMileage.toLocaleString()} km
          </span>
          <span className="text-[10px] text-slate-500">Último chequeo OBD-II</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Estado de Garantía / VTV:</span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
            Vigente
          </span>
          <span className="text-[10px] text-slate-500">Vence Noviembre 2026</span>
        </div>
      </div>

      {/* FORM TO ADD NEW MAINTENANCE RECORD */}
      {showAddForm && (
        <form onSubmit={handleSubmitNewRecord} className="bg-slate-900 border border-cyan-800/60 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Cargar Nueva Intervención o Service
            </h3>
            <span className="text-xs text-slate-400">
              Se recalculará automáticamente la próxima alerta
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Fecha del servicio:</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Kilometraje al momento:</label>
              <input
                type="number"
                value={formMileage}
                onChange={(e) => setFormMileage(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Costo Total ($ ARS):</label>
              <input
                type="number"
                value={formCost}
                onChange={(e) => setFormCost(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Tipo de Servicio:</label>
              <input
                type="text"
                value={formServiceType}
                onChange={(e) => setFormServiceType(e.target.value)}
                placeholder="Ej: Cambio de Aceite 5W40 + Filtros, Pastillas de Freno..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Lubricentro / Taller Mecánico:</label>
              <input
                type="text"
                value={formWorkshop}
                onChange={(e) => setFormWorkshop(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Repuestos cambiados (separados por coma):</label>
            <input
              type="text"
              value={formParts}
              onChange={(e) => setFormParts(e.target.value)}
              placeholder="Ej: Aceite Sintético 5W-40, Filtro Mann W712/52, Bujías Bosch..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">N° de Factura / Comprobante (opcional):</label>
              <input
                type="text"
                value={formInvoice}
                onChange={(e) => setFormInvoice(e.target.value)}
                placeholder="Ej: FAC-B-0004-00019200"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Notas del mecánico:</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Ej: Pastillas delanteras con 70% de vida útil..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl cursor-pointer shadow-lg shadow-cyan-950"
            >
              Guardar en Historial
            </button>
          </div>
        </form>
      )}

      {/* Chronological Service Records Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-sm font-bold text-white">
            Registro Histórico de Servicios ({records.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Último service: {records[0]?.date || 'N/A'}
          </span>
        </div>

        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {record.mileage.toLocaleString()} km
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {record.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {record.serviceType}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Realizado en: <strong className="text-slate-200">{record.workshopName}</strong>
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-lg font-extrabold font-mono text-emerald-400">
                    ${record.cost.toLocaleString('es-AR')}
                  </span>
                  {record.invoiceNumber && (
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Factura: {record.invoiceNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Parts replaced */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Repuestos y Fluidos Reemplazados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {record.partsReplaced.map((part, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 rounded-lg"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mechanic notes & next due milestone */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 gap-2">
                <span className="italic">
                  "{record.notes}"
                </span>
                <div className="font-mono text-[11px] text-cyan-400 shrink-0">
                  Próximo service: <strong>{record.nextDueMileage.toLocaleString()} km</strong> (o {record.nextDueDate})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
