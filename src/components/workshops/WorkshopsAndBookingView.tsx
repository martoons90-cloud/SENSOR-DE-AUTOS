import React, { useState } from 'react';
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Wrench,
  Calendar,
  CheckCircle2,
  DollarSign,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  Car,
  AlertCircle,
  Tag
} from 'lucide-react';
import { Workshop, ServiceAppointment, VehicleProfile, DTCFaultCode } from '../../types/vehicle';

interface WorkshopsAndBookingViewProps {
  workshops: Workshop[];
  appointments: ServiceAppointment[];
  vehicle: VehicleProfile;
  initialServiceFilter?: string;
  initialDtc?: DTCFaultCode | null;
  onBookAppointment: (appointment: Omit<ServiceAppointment, 'id' | 'createdAt'>) => void;
  onCancelAppointment: (id: string) => void;
}

export const WorkshopsAndBookingView: React.FC<WorkshopsAndBookingViewProps> = ({
  workshops,
  appointments,
  vehicle,
  initialServiceFilter = '',
  initialDtc,
  onBookAppointment,
  onCancelAppointment
}) => {
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'directorio' | 'comparativa' | 'turnos'>('directorio');

  // Booking modal state
  const [bookingWorkshop, setBookingWorkshop] = useState<Workshop | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState<string>(
    initialDtc ? `Diagnóstico y Reparación de Código ${initialDtc.code}` : ''
  );
  const [selectedServiceCost, setSelectedServiceCost] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-29');
  const [selectedTime, setSelectedTime] = useState<string>('10:30');
  const [clientName, setClientName] = useState('Martín');
  const [clientPhone, setClientPhone] = useState('11 5566-7788');
  const [bookingNotes, setBookingNotes] = useState(
    initialDtc ? `Revisión por falla OBD-II: ${initialDtc.code} - ${initialDtc.title}` : ''
  );
  const [bookingConfirmedSuccess, setBookingConfirmedSuccess] = useState<string | null>(null);

  // Common services for the comparison table
  const benchmarkServices = [
    'Cambio de Aceite Sintético 5W40 + 3 Filtros',
    'Cambio Básico de Aceite y Filtro de Aceite',
    'Cambio de Pastillas de Freno Delanteras',
    'Escaneo OBD-II Computarizado y Borrado de Fallas'
  ];

  const filteredWorkshops = workshops.filter((w) => {
    const matchesType = selectedType === 'todos' || w.type === selectedType;
    const matchesQuery =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.services.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  });

  const handleOpenBooking = (workshop: Workshop, serviceName?: string, serviceCost?: number) => {
    setBookingWorkshop(workshop);
    if (serviceName) {
      setSelectedServiceName(serviceName);
      setSelectedServiceCost(serviceCost || 0);
    } else {
      setSelectedServiceName(workshop.services[0]?.name || '');
      setSelectedServiceCost(workshop.services[0]?.price || 0);
    }
    setBookingConfirmedSuccess(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingWorkshop) return;

    onBookAppointment({
      workshopId: bookingWorkshop.id,
      workshopName: bookingWorkshop.name,
      serviceName: selectedServiceName,
      date: selectedDate,
      timeSlot: selectedTime,
      estimatedCost: selectedServiceCost,
      vehiclePlate: vehicle.plate,
      vehicleModel: `${vehicle.brand} ${vehicle.model}`,
      clientName,
      clientPhone,
      notes: bookingNotes,
      status: 'confirmado'
    });

    setBookingConfirmedSuccess(`¡Turno confirmado con éxito en ${bookingWorkshop.name}!`);
    setTimeout(() => {
      setBookingWorkshop(null);
      setActiveTab('turnos');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Lubricentros & Mecánicas Cercanas
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparativa de presupuestos por servicio en tiempo real y reserva de turnos para {vehicle.brand} {vehicle.model}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('directorio')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'directorio'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Directorio ({filteredWorkshops.length})
          </button>
          <button
            onClick={() => setActiveTab('comparativa')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'comparativa'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Comparador de Precios
          </button>
          <button
            onClick={() => setActiveTab('turnos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'turnos'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Mis Turnos</span>
            {appointments.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-cyan-500 text-slate-950 rounded-full">
                {appointments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: DIRECTORIO DE TALLERES */}
      {activeTab === 'directorio' && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por lubricentro, taller mecánico, servicio o calle..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'lubricentro', label: 'Lubricentros' },
                { id: 'mecanica_integral', label: 'Mecánica Integral' },
                { id: 'frenos_suspension', label: 'Frenos & Tren Delantero' },
                { id: 'inyeccion_electronica', label: 'Inyección & Scanner' }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedType(category.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedType === category.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workshop Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWorkshops.map((w) => (
              <div
                key={w.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {w.name}
                        </h3>
                        {w.certifiedOBD && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                            OBD-II Certificado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="flex items-center text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                          {w.rating}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span>({w.reviewsCount} opiniones)</span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center text-cyan-400 font-mono">
                          <MapPin className="w-3 h-3 mr-0.5" />
                          a {w.distanceKm} km
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                      {w.type === 'lubricentro'
                        ? 'Lubricentro'
                        : w.type === 'mecanica_integral'
                        ? 'Mecánica General'
                        : w.type === 'frenos_suspension'
                        ? 'Frenos'
                        : 'Inyección'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 mt-3">
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{w.address}, {w.city}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{w.openHours}</span>
                    </p>
                  </div>

                  {/* Top Popular Services from this workshop */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Presupuestos de Servicios Destacados:
                    </span>
                    <div className="space-y-1.5">
                      {w.services.slice(0, 3).map((service, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => handleOpenBooking(w, service.name, service.price)}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-cyan-800 transition-colors cursor-pointer group"
                        >
                          <div className="truncate mr-2">
                            <span className="text-slate-200 group-hover:text-cyan-300 font-medium">
                              {service.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {service.includes}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-emerald-400">
                              ${service.price.toLocaleString('es-AR')}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              ~{service.estimatedDurationMinutes} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleOpenBooking(w)}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-cyan-950"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Turno en {w.name.split(' ')[0]}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COMPARATIVA DE PRESUPUESTOS POR SERVICIO */}
      {activeTab === 'comparativa' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">
              Comparador de Precios por Tipo de Servicio
            </h3>
            <p className="text-xs text-slate-400">
              Evaluación transparente de tarifas entre lubricentros y talleres para el vehículo {vehicle.brand} {vehicle.model}
            </p>
          </div>

          <div className="space-y-6">
            {benchmarkServices.map((serviceTitle) => {
              // Find all workshops offering this service
              const offers = workshops
                .map((ws) => {
                  const s = ws.services.find(svc => svc.name === serviceTitle);
                  return s ? { workshop: ws, service: s } : null;
                })
                .filter(Boolean) as Array<{ workshop: Workshop; service: any }>;

              if (offers.length === 0) return null;

              // Sort by price ascending
              offers.sort((a, b) => a.service.price - b.service.price);
              const lowestPrice = offers[0].service.price;

              return (
                <div key={serviceTitle} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                    <div>
                      <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                        Servicio Comparado
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {serviceTitle}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-400">
                      Mejor precio detectado: <strong className="text-emerald-400 font-mono">${lowestPrice.toLocaleString('es-AR')}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {offers.map((offer, idx) => {
                      const isCheapest = offer.service.price === lowestPrice;
                      return (
                        <div
                          key={offer.workshop.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between ${
                            isCheapest
                              ? 'bg-emerald-950/30 border-emerald-500/50'
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <h5 className="text-xs font-bold text-white line-clamp-1">
                                {offer.workshop.name}
                              </h5>
                              {isCheapest && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-emerald-500 text-slate-950 rounded">
                                  Más Económico
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                              <span className="flex items-center text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 mr-1" />
                                {offer.workshop.rating}
                              </span>
                              <span>·</span>
                              <span>{offer.workshop.distanceKm} km</span>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                              {offer.service.includes}
                            </p>
                          </div>

                          <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-base font-extrabold font-mono text-white">
                              ${offer.service.price.toLocaleString('es-AR')}
                            </span>
                            <button
                              onClick={() => handleOpenBooking(offer.workshop, offer.service.name, offer.service.price)}
                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Agendar Turno
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MIS TURNOS AGENDADOS */}
      {activeTab === 'turnos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Historial de Turnos y Citas en Taller
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {appointments.length} reservas registradas
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-white">No tenés turnos programados</h4>
              <p className="text-xs max-w-sm mx-auto">
                Selecciona un lubricentro o taller mecánico del directorio para reservar fecha y hora con presupuesto fijado.
              </p>
              <button
                onClick={() => setActiveTab('directorio')}
                className="px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-xl"
              >
                Explorar Talleres Disponibles
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        {apt.id.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          apt.status === 'confirmado'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {apt.serviceName}
                    </h4>

                    <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-cyan-300 font-semibold">{apt.workshopName}</span>
                      <span className="text-slate-600">·</span>
                      <span className="flex items-center gap-1 font-mono text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {apt.date} a las {apt.timeSlot} hs
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Car className="w-3.5 h-3.5" />
                        {apt.vehicleModel} ({apt.vehiclePlate})
                      </span>
                    </div>

                    {apt.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        Nota: "{apt.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Presupuesto pactado</span>
                      <span className="text-base font-extrabold font-mono text-emerald-400">
                        ${apt.estimatedCost.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <button
                      onClick={() => onCancelAppointment(apt.id)}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar Turno
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingWorkshop && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  Sistema de Turnos Integrado
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Agendar Turno en {bookingWorkshop.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {bookingWorkshop.address} · {bookingWorkshop.phone}
                </p>
              </div>
              <button
                onClick={() => setBookingWorkshop(null)}
                className="text-slate-500 hover:text-white text-lg font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingConfirmedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">{bookingConfirmedSuccess}</h4>
                <p className="text-xs text-slate-300">
                  Te hemos asignado el turno y congelado el presupuesto. Recordá asistir 5 minutos antes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                {/* Service Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">
                    Servicio a realizar:
                  </label>
                  <select
                    value={selectedServiceName}
                    onChange={(e) => {
                      setSelectedServiceName(e.target.value);
                      const svc = bookingWorkshop.services.find(s => s.name === e.target.value);
                      if (svc) setSelectedServiceCost(svc.price);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {bookingWorkshop.services.map((svc, idx) => (
                      <option key={idx} value={svc.name}>
                        {svc.name} — ${svc.price.toLocaleString('es-AR')}
                      </option>
                    ))}
                    {initialDtc && (
                      <option value={`Diagnóstico y Reparación de Código ${initialDtc.code}`}>
                        Diagnóstico por Código {initialDtc.code} ({initialDtc.title})
                      </option>
                    )}
                  </select>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">
                      Fecha del turno:
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min="2026-09-28"
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">
                      Horario disponible:
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="08:30">08:30 hs</option>
                      <option value="09:30">09:30 hs</option>
                      <option value="10:30">10:30 hs</option>
                      <option value="12:00">12:00 hs</option>
                      <option value="14:30">14:30 hs</option>
                      <option value="16:00">16:00 hs</option>
                      <option value="17:30">17:30 hs</option>
                    </select>
                  </div>
                </div>

                {/* Client info & vehicle auto-fill */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">
                      Nombre del Titular:
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">
                      Teléfono WhatsApp:
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Vehicle summary badge */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vehículo asignado:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {vehicle.brand} {vehicle.model} ({vehicle.plate})
                  </span>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">
                    Observaciones o síntomas detectados:
                  </label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Ej: Siento un tirón al acelerar en 2da o quiero cambiar filtro de habitáculo..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Price summary & CTA */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Costo estimado:</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      ${selectedServiceCost.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingWorkshop(null)}
                      className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors cursor-pointer shadow-lg shadow-cyan-950"
                    >
                      Confirmar Turno
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
