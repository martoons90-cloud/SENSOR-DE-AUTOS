import React, { useState } from 'react';
import { X, Wrench, Car, User, Calendar, DollarSign, Plus, Trash2 } from 'lucide-react';
import { WorkOrder, ServiceCategory } from '../../types/erp';

interface NewWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: WorkOrder) => void;
}

export const NewWorkOrderModal: React.FC<NewWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2021');
  const [currentKm, setCurrentKm] = useState('65000');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerType, setCustomerType] = useState<'particular' | 'flota_empresa'>('particular');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('lubricentro');
  const [serviceDetails, setServiceDetails] = useState('');
  const [mechanic, setMechanic] = useState('Martín Gómez');
  const [bay, setBay] = useState('Fosa 1 - Lubricentro Rápido');
  const [laborCost, setLaborCost] = useState('35000');
  const [parts, setParts] = useState<Array<{ name: string; quantity: number; unitPrice: number }>>([
    { name: 'Aceite Sintético 5W-30 (Litros)', quantity: 4.5, unitPrice: 14500 },
    { name: 'Filtro de Aceite', quantity: 1, unitPrice: 12000 }
  ]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAddPart = () => {
    setParts([...parts, { name: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  const partsTotal = parts.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.unitPrice) || 0), 0);
  const totalEstimated = partsTotal + (Number(laborCost) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate || !vehicleModel || !customerName) {
      alert('Por favor complete Patente, Modelo de vehículo y Nombre del cliente');
      return;
    }

    const newOrder: WorkOrder = {
      id: `OT-${Math.floor(1050 + Math.random() * 900)}`,
      vehiclePlate: vehiclePlate.toUpperCase().trim(),
      vehicleModel: vehicleModel.trim(),
      vehicleYear: Number(vehicleYear) || 2022,
      currentKm: Number(currentKm) || 0,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerType,
      serviceCategory,
      serviceDetails: serviceDetails || `${serviceCategory.toUpperCase()} - Servicio programado`,
      mechanic,
      bay,
      status: 'ingresado',
      date: new Date().toISOString().split('T')[0],
      estimatedCost: totalEstimated,
      laborCost: Number(laborCost) || 0,
      partsUsed: parts.filter(p => p.name.trim().length > 0),
      nextServiceKm: (Number(currentKm) || 0) + 10000,
      nextServiceDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
      notes
    };

    onSave(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nueva Orden de Trabajo (OT)</h2>
              <p className="text-xs text-slate-400">Ingreso a Fosa o Elevador de Lubricentro / Taller</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Section: Vehículo */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
              <Car className="w-4 h-4" />
              <span>Datos del Vehículo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Patente / Dominio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: AF 492 KZ"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Marca y Modelo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Toyota Hilux 2.8 TDI"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Kilometraje Actual</label>
                <input
                  type="number"
                  value={currentKm}
                  onChange={(e) => setCurrentKm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Cliente */}
          <div className="border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Datos del Cliente</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nombre / Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez / Transportes SRL"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+54 9 11 ..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tipo de Cliente</label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="particular">Particular</option>
                  <option value="flota_empresa">Flota / Empresa (Cta Cte)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Servicio y Asignación */}
          <div className="border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Servicio & Bahía de Trabajo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Categoría</label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="lubricentro">Lubricentro (Aceite y Filtros)</option>
                  <option value="mecanica">Mecánica General</option>
                  <option value="frenos">Frenos y Suspensión</option>
                  <option value="diagnostico">Diagnóstico Electrónico OBD2</option>
                  <option value="integral">Service Integral Programado</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Fosa / Elevador Asignado</label>
                <select
                  value={bay}
                  onChange={(e) => setBay(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="Fosa 1 - Lubricentro Rápido">Fosa 1 - Lubricentro Rápido</option>
                  <option value="Fosa 2 - Pesados y Utilitarios">Fosa 2 - Pesados y Utilitarios</option>
                  <option value="Elevador 1 - Mecánica General">Elevador 1 - Mecánica General</option>
                  <option value="Elevador 2 - Suspensión y Tren">Elevador 2 - Suspensión y Tren</option>
                  <option value="Bahía 3 - Diagnóstico OBD2">Bahía 3 - Diagnóstico OBD2</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mecánico Asignado</label>
                <select
                  value={mechanic}
                  onChange={(e) => setMechanic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="Martín Gómez">Martín Gómez (Especialista Lubricantes)</option>
                  <option value="Gonzalo Rossi">Gonzalo Rossi (Fosas y Mantenimiento)</option>
                  <option value="Esteban Paredes">Esteban Paredes (Mecánica y Diagnóstico)</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-400 mb-1">Detalle del Trabajo Requerido</label>
              <textarea
                rows={2}
                placeholder="Ej: Cambio de aceite 5W-30 (7.5L), 4 filtros, revisión de líquido de freno y pastillas delanteras..."
                value={serviceDetails}
                onChange={(e) => setServiceDetails(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Repuestos e Importes */}
          <div className="border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                <DollarSign className="w-4 h-4" />
                <span>Repuestos, Lubricantes y Mano de Obra</span>
              </div>
              <button
                type="button"
                onClick={handleAddPart}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Ítem
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {parts.map((part, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                  <input
                    type="text"
                    placeholder="Descripción repuesto o lubricante"
                    value={part.name}
                    onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                    className="flex-1 bg-transparent text-white px-2 py-1 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 w-24">
                    <span className="text-slate-500 text-[10px]">Cant:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={part.quantity}
                      onChange={(e) => handlePartChange(index, 'quantity', Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-white font-mono text-right"
                    />
                  </div>
                  <div className="flex items-center gap-1 w-32">
                    <span className="text-slate-500 text-[10px]">$</span>
                    <input
                      type="number"
                      value={part.unitPrice}
                      onChange={(e) => handlePartChange(index, 'unitPrice', Number(e.target.value))}
                      className="w-24 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-white font-mono text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePart(index)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Mano de Obra ($):</span>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-right focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 mr-2">Presupuesto Estimado Total:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  ${totalEstimated.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            Generar Orden de Trabajo
          </button>
        </div>
      </div>
    </div>
  );
};
