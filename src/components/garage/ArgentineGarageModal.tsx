import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Car,
  CheckCircle2,
  Sparkles,
  Zap,
  Gauge,
  Fuel,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Wrench,
  Flame,
  Info,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { ArgentineVehicleModel, VehicleProfile, FluidLevel, MaintenanceAlert } from '../../types/vehicle';
import {
  ARGENTINE_VEHICLES_DATABASE,
  createVehicleProfileFromArgentineModel,
  searchArgentineVehicles
} from '../../services/argentineVehiclesDatabase';

interface ArgentineGarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVehicle: VehicleProfile;
  onSelectVehicle: (
    newVehicle: VehicleProfile,
    updatedFluids?: FluidLevel[],
    updatedAlerts?: MaintenanceAlert[]
  ) => void;
}

export const ArgentineGarageModal: React.FC<ArgentineGarageModalProps> = ({
  isOpen,
  onClose,
  currentVehicle,
  onSelectVehicle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedFuel, setSelectedFuel] = useState('all');
  const [selectedBody, setSelectedBody] = useState('all');

  // Customization drawer/state for selected model
  const [modelToCustomize, setModelToCustomize] = useState<ArgentineVehicleModel | null>(null);
  const [customPlate, setCustomPlate] = useState('');
  const [customMileage, setCustomMileage] = useState<number>(45000);
  const [customYear, setCustomYear] = useState<number>(2021);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Extract unique brands for filter bar
  const brands = useMemo(() => {
    const list = Array.from(new Set(ARGENTINE_VEHICLES_DATABASE.map(c => c.brand)));
    return ['all', ...list];
  }, []);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return searchArgentineVehicles(searchQuery, selectedBrand, selectedFuel, selectedBody);
  }, [searchQuery, selectedBrand, selectedFuel, selectedBody]);

  if (!isOpen) return null;

  const handleStartCustomizing = (model: ArgentineVehicleModel) => {
    setModelToCustomize(model);
    setCustomPlate(currentVehicle.plate || 'AF 342 XP');
    setCustomMileage(currentVehicle.currentMileage || 46000);
    const yearParsed = model.years.includes('Presente')
      ? 2022
      : parseInt(model.years.split('-')[1]?.trim() || '2018', 10);
    setCustomYear(yearParsed);
  };

  const handleConfirmSelection = (model: ArgentineVehicleModel) => {
    const newProfile = createVehicleProfileFromArgentineModel(
      model,
      customPlate,
      customMileage,
      customYear
    );

    // Adapt fluids to new vehicle specs
    const adaptedFluids: FluidLevel[] = [
      {
        id: 'f-oil',
        name: 'Aceite de Motor (Vida útil)',
        category: 'motor',
        currentLevelPercent: 82,
        status: 'optimal',
        spec: model.oilSpec,
        lastCheckedDate: new Date().toISOString().split('T')[0],
        nextChangeMileage: (customMileage || 45000) + 10000,
        notes: `Viscosidad recomendada: ${model.oilViscosity}. Capacidad: ${model.oilCapacityLiters} Litros.`
      },
      {
        id: 'f-coolant',
        name: 'Líquido Refrigerante / Anticongelante',
        category: 'refrigeracion',
        currentLevelPercent: 90,
        status: 'optimal',
        spec: model.brand === 'Volkswagen' ? 'G12+ / G13 Rosa Orgánico al 50%' : model.brand === 'Fiat' ? 'Paraflu UP Rojo Orgánico' : 'Orgánico Larga Duración al 50%',
        lastCheckedDate: new Date().toISOString().split('T')[0],
        nextChangeMileage: (customMileage || 45000) + 40000,
        notes: 'Punto de ebullición presurizado a 130°C. Sin sarro ni sedimentos.'
      },
      {
        id: 'f-brake',
        name: 'Líquido de Frenos',
        category: 'frenos',
        currentLevelPercent: 85,
        status: 'optimal',
        spec: 'DOT 4 Sintético Alta Temperatura',
        lastCheckedDate: new Date().toISOString().split('T')[0],
        nextChangeMileage: (customMileage || 45000) + 20000,
        notes: 'Humedad controlada por debajo del 1.5%.'
      },
      {
        id: 'f-washer',
        name: 'Líquido Limpiaparabrisas',
        category: 'lavaparabrisas',
        currentLevelPercent: 65,
        status: 'optimal',
        spec: 'Con desengrasante y protector de escobillas',
        lastCheckedDate: new Date().toISOString().split('T')[0],
        nextChangeMileage: (customMileage || 45000) + 5000,
        notes: 'Nivel óptimo en depósito.'
      }
    ];

    // Adapt maintenance alerts based on model timing type (correa vs cadena)
    const adaptedAlerts: MaintenanceAlert[] = [
      {
        id: 'alt-oil',
        title: 'Próximo Service de Aceite y Filtros',
        type: 'aceite',
        status: 'ok',
        currentKm: customMileage,
        dueKm: customMileage + 10000,
        dueDate: '2027-04-15',
        kmRemaining: 10000,
        daysRemaining: 195,
        description: `Especificación requerida: ${model.oilSpec}. Intervalo cada 10.000 km o 1 año.`
      },
      {
        id: 'alt-timing',
        title: model.timingType === 'correa' ? 'Correa de Distribución (Preventivo)' : 'Cadena de Distribución (Inspección)',
        type: 'distribucion',
        status: 'ok',
        currentKm: customMileage,
        dueKm: model.timingType === 'correa' ? model.timingIntervalKm : customMileage + 80000,
        dueDate: '2027-11-20',
        kmRemaining: model.timingType === 'correa' ? Math.max(1000, model.timingIntervalKm - (customMileage % model.timingIntervalKm)) : 80000,
        daysRemaining: 410,
        description: model.timingType === 'correa'
          ? `Motor con correa dentada. Reemplazo preventivo cada ${model.timingIntervalKm.toLocaleString('es-AR')} km con kit tensor y bomba de agua.`
          : 'Motor con cadena de distribución de por vida. Revisar tensión hidráulica y patines cada 100.000 km.'
      },
      {
        id: 'alt-tires',
        title: 'Calibración de Neumáticos',
        type: 'filtros',
        status: 'ok',
        currentKm: customMileage,
        dueKm: customMileage + 2500,
        dueDate: '2026-10-30',
        kmRemaining: 2500,
        daysRemaining: 30,
        description: `Presión recomendada de fábrica: ${model.tirePressurePsiFront} PSI adelante / ${model.tirePressurePsiRear} PSI atrás en frío.`
      }
    ];

    // If GNC compatible, add GNC review alert
    if (model.gncCompatible) {
      adaptedAlerts.push({
        id: 'alt-gnc',
        title: 'Renovación Oblea de GNC Enargas',
        type: 'vtv',
        status: 'ok',
        currentKm: customMileage,
        dueKm: customMileage + 15000,
        dueDate: '2027-05-10',
        kmRemaining: 15000,
        daysRemaining: 220,
        description: 'Vencimiento anual reglamentario de oblea de GNC y verificación de válvulas de seguridad.'
      });
    }

    onSelectVehicle(newProfile, adaptedFluids, adaptedAlerts);
    setModelToCustomize(null);
    setShowSuccessToast(`${model.brand} ${model.model} activado como tu vehículo`);
    setTimeout(() => {
      setShowSuccessToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Garaje del Parque Automotor Argentino
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  <MapPin className="w-2.5 h-2.5" /> Argentina
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Elegí cualquier auto que circula en Argentina para calibrar telemetría, aceite, neumáticos y fallas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Cerrar garaje"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{showSuccessToast}</span>
          </div>
        )}

        {/* Current Vehicle Banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 text-xs">
            <span className="text-slate-400">Auto actual activo:</span>
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              {currentVehicle.brand} {currentVehicle.model} ({currentVehicle.year})
            </span>
            <span className="font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
              {currentVehicle.plate}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {ARGENTINE_VEHICLES_DATABASE.length} modelos cargados con fichas de taller
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/60 space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo, motor (ej. Cronos, Gol, Hilux, 1.6 MSI, THP, Firefly, GNC, V6)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Brand Select */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {brand === 'all' ? 'Todas las Marcas' : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel & Body Subfilters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 text-[11px] font-medium">Combustible:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'nafta', label: 'Nafta' },
                { id: 'diesel', label: 'Diésel' },
                { id: 'gnc', label: 'GNC (Mercosur)' },
                { id: 'hibrido', label: 'Híbrido' }
              ].map(fuel => (
                <button
                  key={fuel.id}
                  onClick={() => setSelectedFuel(fuel.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedFuel === fuel.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fuel.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 text-[11px] font-medium">Tipo:</span>
              {['all', 'Hatchback', 'Sedán', 'Pick-up', 'SUV', 'Utilitario'].map(body => (
                <button
                  key={body}
                  onClick={() => setSelectedBody(body)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedBody === body
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {body === 'all' ? 'Cualquiera' : body}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Models Grid & Customization Panel */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* Customization Drawer (if a car is clicked) */}
          {modelToCustomize && (
            <div className="p-4 bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-600/60 rounded-2xl shadow-xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-900/60 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-black text-lg">
                    {modelToCustomize.brand.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {modelToCustomize.brand} {modelToCustomize.model}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/70 text-cyan-300 border border-cyan-700/60">
                        {modelToCustomize.years}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      {modelToCustomize.engineDisplacement} · {modelToCustomize.powerHp} CV · {modelToCustomize.bodyType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModelToCustomize(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Custom Inputs: Patente & Kilometraje */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Patente (Mercosur o anterior)
                  </label>
                  <input
                    type="text"
                    value={customPlate}
                    onChange={(e) => setCustomPlate(e.target.value.toUpperCase())}
                    placeholder="ej. AF 342 XP"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Kilometraje Actual
                  </label>
                  <input
                    type="number"
                    value={customMileage}
                    onChange={(e) => setCustomMileage(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Año del Vehículo
                  </label>
                  <input
                    type="number"
                    value={customYear}
                    onChange={(e) => setCustomYear(parseInt(e.target.value, 10) || 2021)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Quick specs pill */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Distribución</span>
                  <span className="font-semibold text-slate-200">
                    {modelToCustomize.timingType === 'cadena' ? '⚡ Cadena de por vida' : `⚙️ Correa c/ ${modelToCustomize.timingIntervalKm.toLocaleString('es-AR')} km`}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Aceite Recomendado</span>
                  <span className="font-semibold text-slate-200 truncate block" title={modelToCustomize.oilSpec}>
                    {modelToCustomize.oilViscosity}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Presión Cubiertas</span>
                  <span className="font-semibold text-slate-200">
                    {modelToCustomize.tirePressurePsiFront}/{modelToCustomize.tirePressurePsiRear} PSI
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Compatibilidad GNC</span>
                  <span className={`font-semibold ${modelToCustomize.gncCompatible ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {modelToCustomize.gncCompatible ? '✓ Sí, compatible' : 'No recomendado'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setModelToCustomize(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConfirmSelection(modelToCustomize)}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Activar este auto en AutoScan
                </button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Mostrando {filteredVehicles.length} vehículos del parque argentino</span>
            {filteredVehicles.length === 0 && (
              <span className="text-amber-400">No se encontraron modelos con los filtros seleccionados</span>
            )}
          </div>

          {/* Vehicles Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredVehicles.map(car => {
              const isCurrent = currentVehicle.brand === car.brand && currentVehicle.model.toLowerCase().includes(car.model.toLowerCase().slice(0, 10));

              return (
                <div
                  key={car.id}
                  className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                    isCurrent
                      ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-white">
                            {car.brand} {car.model}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-300 border border-cyan-700">
                              ACTUAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {car.generation} · <span className="text-slate-300 font-medium">{car.years}</span>
                        </p>
                      </div>

                      {/* Fuel Tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        car.fuelType === 'diesel'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : car.fuelType === 'hibrido'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {car.fuelType === 'diesel' ? '⛽ Diésel' : car.fuelType === 'hibrido' ? '🔋 Híbrido' : '⛽ Nafta'}
                      </span>
                    </div>

                    {/* Engine & Power Spec */}
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-medium truncate">{car.engineDisplacement}</span>
                      </div>
                      <span className="font-bold text-cyan-400 shrink-0">{car.powerHp} CV</span>
                    </div>

                    {/* Oil & Timing Specs */}
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                      <div className="text-slate-400">
                        <span className="text-slate-500 block text-[10px]">Aceite oficial:</span>
                        <span className="text-slate-200 font-medium truncate block" title={car.oilSpec}>
                          {car.oilViscosity} ({car.oilCapacityLiters}L)
                        </span>
                      </div>
                      <div className="text-slate-400">
                        <span className="text-slate-500 block text-[10px]">Distribución:</span>
                        <span className="text-slate-200 font-medium">
                          {car.timingType === 'cadena' ? '⚡ Cadena' : `⚙️ Correa ${car.timingIntervalKm / 1000}k km`}
                        </span>
                      </div>
                    </div>

                    {/* GNC badge if applicable */}
                    {car.gncCompatible && (
                      <div className="mt-2 text-[10px] text-emerald-300 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                        <Flame className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="truncate">GNC compatible: {car.gncTubeRecommended || '5ta generación'}</span>
                      </div>
                    )}

                    {/* Weak points preview */}
                    <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/40 p-1.5 rounded border border-slate-800/50">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 mb-0.5">
                        <Wrench className="w-3 h-3" />
                        <span>Punto crítico en taller argentino:</span>
                      </div>
                      <p className="text-[10px] text-slate-300 line-clamp-1 italic">
                        "{car.typicalWeakPoints[0]}"
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {car.obdProtocol.split('(')[0].trim()}
                    </span>
                    <button
                      onClick={() => handleStartCustomizing(car)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                      }`}
                    >
                      <span>{isCurrent ? 'Recalibrar datos' : 'Seleccionar auto'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Los datos provienen de manuales oficiales de fábrica de terminales argentinas (ADEFA).</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
