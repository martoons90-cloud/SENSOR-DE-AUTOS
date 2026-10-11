import React, { useState } from 'react';
import {
  Car,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BatteryCharging,
  Thermometer,
  Clock,
  Wrench,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Fuel,
  Info,
  History,
  Gauge,
  Zap,
  Printer
} from 'lucide-react';
import { telemetrySharingService } from '../../services/telemetrySharingService';
import { VehicleDiagnosticHistoryReport } from '../../types/vehicleTelemetryHistory';
import { WorkOrder } from '../../types/erp';

interface VehicleLiveTelemetryViewProps {
  onCreateWorkOrderFromVehicle: (order: WorkOrder) => void;
  onNavigateToApp: () => void;
}

export const VehicleLiveTelemetryView: React.FC<VehicleLiveTelemetryViewProps> = ({
  onCreateWorkOrderFromVehicle,
  onNavigateToApp
}) => {
  const [inputCode, setInputCode] = useState<string>('AUT-7492');
  const [report, setReport] = useState<VehicleDiagnosticHistoryReport | null>(() =>
    telemetrySharingService.getReport('AUT-7492')
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConnect = (codeToConnect: string = inputCode) => {
    const cleanCode = codeToConnect.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Por favor ingrese un código válido');
      return;
    }

    const found = telemetrySharingService.getReport(cleanCode);
    if (!found) {
      setErrorMsg(`No se encontró registro para el código "${cleanCode}". Verifique que el cliente haya generado el código desde su App.`);
      return;
    }

    setErrorMsg(null);
    setReport(found);
    setInputCode(cleanCode);
  };

  const handleCreateOtFromHistory = () => {
    if (!report) return;

    const faultsSummary = report.testigosTimeline.map(t => `${t.dtcCode} (${t.testigoName})`).join(', ');
    const serviceDetails = `Diagnóstico por Historial ELM327 (${report.code}): ` +
      (report.testigosTimeline.length > 0
        ? `Testigos registrados: [${faultsSummary}]. `
        : 'Sin testigos encendidos. ') +
      (report.consumption.percentIncrease > 10
        ? `Sobreconsumo detectado: +${report.consumption.percentIncrease}%. `
        : '') +
      (report.battery.status !== 'optimo'
        ? `Batería en estado de atención (caída a ${report.battery.coldCrankingVoltageDrop}V en arranque). `
        : '') +
      `Revisión general y service preventivo.`;

    const newOrder: WorkOrder = {
      id: `OT-${Math.floor(1060 + Math.random() * 400)}`,
      vehiclePlate: report.vehicle.plate,
      vehicleModel: `${report.vehicle.brand} ${report.vehicle.model}`,
      vehicleYear: report.vehicle.year,
      currentKm: report.vehicle.currentMileage,
      customerName: report.clientName,
      customerPhone: report.clientPhone,
      customerType: 'particular',
      serviceCategory: report.testigosTimeline.length > 0 ? 'diagnostico' : 'lubricentro',
      serviceDetails,
      mechanic: 'Martín Gómez',
      bay: 'Elevador 1 - Mecánica General',
      status: 'ingresado',
      date: new Date().toISOString().split('T')[0],
      estimatedCost: report.testigosTimeline.length > 0 ? 165000 : 92000,
      laborCost: 45000,
      partsUsed: [
        { name: `Aceite ${report.vehicle.oilViscosity || report.vehicle.oilSpec}`, quantity: report.vehicle.oilCapacityLiters || 4.0, unitPrice: 14500 },
        { name: 'Juego de Bujías & Filtros', quantity: 1, unitPrice: 42000 }
      ],
      nextServiceKm: report.vehicle.currentMileage + 10000,
      nextServiceDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
      diagnosticDtc: report.testigosTimeline.map(t => t.dtcCode),
      notes: `Bitácora extraída por código ELM327 ${report.code}. Monitoreado por ${report.recordingPeriodDays} días.`
    };

    onCreateWorkOrderFromVehicle(newOrder);
    alert(`¡Orden de Trabajo ${newOrder.id} generada con el historial de ${report.vehicle.plate}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Code Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Historial de Comportamiento del Vehículo (ELM327)
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Bitácora de Uso
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingresá el código generado por la app del cliente para consultar el historial de consumo, caída de batería, cuándo se encendieron los testigos y alertas registradas.
              </p>
            </div>
          </div>

          {/* Code input form */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Ej: AUT-7492"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold tracking-widest text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 uppercase placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-600"
              />
            </div>
            <button
              onClick={() => handleConnect()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all whitespace-nowrap"
            >
              Consultar Historial
            </button>
          </div>
        </div>

        {/* Quick test badges */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 font-medium">Códigos de prueba con historial real:</span>
          {[
            { code: 'AUT-7492', label: 'Gol Trend (Con fallas, suba de consumo y baja batería)' },
            { code: 'HLX-2021', label: 'Toyota Hilux (Flota comercial en óptimo estado)' }
          ].map(c => (
            <button
              key={c.code}
              onClick={() => handleConnect(c.code)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors ${
                report?.code === c.code
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              title={c.label}
            >
              {c.code}
            </button>
          ))}
          <span className="text-slate-600">·</span>
          <button
            onClick={onNavigateToApp}
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Ver App del cliente</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Vehicle Identity & Recording Period Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Car className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {report.vehicle.brand} {report.vehicle.model}
                    </h3>
                    <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-bold text-cyan-400 text-xs">
                      {report.vehicle.plate}
                    </span>
                    <span className="text-xs text-slate-400">Año {report.vehicle.year}</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Motor: <strong className="text-slate-200">{report.vehicle.engine || report.vehicle.engineDisplacement}</strong> · KM Actual: <strong className="text-white font-mono">{report.vehicle.currentMileage.toLocaleString('es-AR')} km</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>Cliente: <strong className="text-white">{report.clientName}</strong> ({report.clientPhone})</span>
                    <span>·</span>
                    <span className="text-cyan-400 font-medium">
                      ⏱ Período Monitoreado: últimos {report.recordingPeriodDays} días ({report.totalKmMonitored.toLocaleString('es-AR')} km grabados)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Imprimir Ficha</span>
                </button>

                <button
                  onClick={handleCreateOtFromHistory}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Wrench className="w-4 h-4 stroke-[2.5]" />
                  <span>Crear OT desde este Historial</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1. SECCIÓN: HISTORIAL DE TESTIGOS EN EL TABLERO (CUÁNDO SALIÓ, QUÉ FUE Y EN QUÉ CONDICIONES) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Registro Histórico de Testigos en Tablero y Códigos de Falla
                </h4>
                <p className="text-[11px] text-slate-400">
                  Cuándo se encendió el testigo en el tablero, a qué kilometraje y condiciones de marcha (Freeze Frame)
                </p>
              </div>
            </div>

            {report.testigosTimeline.length > 0 ? (
              <div className="space-y-3">
                {report.testigosTimeline.map(testigo => (
                  <div
                    key={testigo.id}
                    className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-sm px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {testigo.dtcCode}
                        </span>
                        <span className="font-bold text-white text-xs">{testigo.testigoName}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          testigo.status === 'activo'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {testigo.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>📅 {testigo.timestamp} hs</span>
                        <span>·</span>
                        <span>📍 A los {testigo.mileageAtEvent.toLocaleString('es-AR')} km</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {testigo.description}
                    </p>

                    {/* Freeze Frame conditions when the light turned ON */}
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                        Condiciones del motor en el momento exacto en que se disparó el testigo (Freeze Frame):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Régimen motor:</span>
                          <span className="font-bold text-cyan-400">{testigo.freezeFrame.rpm} RPM</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Velocidad:</span>
                          <span className="font-bold text-white">{testigo.freezeFrame.speedKmH} km/h</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Temperatura motor:</span>
                          <span className={`font-bold ${testigo.freezeFrame.coolantTempC < 75 ? 'text-blue-400' : 'text-emerald-400'}`}>
                            {testigo.freezeFrame.coolantTempC}°C
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Carga de motor:</span>
                          <span className="font-bold text-amber-400">{testigo.freezeFrame.engineLoadPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center flex items-center justify-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Sin testigos de falla encendidos durante los últimos {report.recordingPeriodDays} días de uso.
                </span>
              </div>
            )}
          </div>

          {/* 2. DUAL GRID: COMPORTAMIENTO DE CONSUMO & SALUD DE BATERÍA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COMPORTAMIENTO DE CONSUMO */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Comportamiento del Consumo
                  </h4>
                </div>
                {report.consumption.percentIncrease > 10 ? (
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    +{report.consumption.percentIncrease}% sobreconsumo
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Consumo normal estable
                  </span>
                )}
              </div>

              {/* Comparison KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Consumo Normal Habitual:</span>
                  <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                    {report.consumption.baselineL100km} L/100km
                  </span>
                  <span className="text-[10px] text-slate-400">Parámetro histórico</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Consumo Último Tiempo:</span>
                  <span className={`text-xl font-bold font-mono mt-0.5 block ${
                    report.consumption.percentIncrease > 10 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {report.consumption.recentAvgL100km} L/100km
                  </span>
                  <span className="text-[10px] text-slate-400">Promedio últimos 15 días</span>
                </div>
              </div>

              {/* Evolution History Timeline */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">Evolución en los últimos trayectos registrados:</span>
                <div className="space-y-1.5">
                  {report.consumption.recentHistory.map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono"
                    >
                      <span className="text-slate-400 text-[11px]">{pt.date} ({pt.distanceRecordedKm} km)</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          pt.trend === 'critico' ? 'text-red-400' : pt.trend === 'aumento' ? 'text-amber-400' : 'text-white'
                        }`}>
                          {pt.avgLitersPer100km} L/100km
                        </span>
                        {pt.notes && (
                          <span className="text-[10px] text-slate-500 hidden sm:inline">· {pt.notes}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis note for the mechanic */}
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-xs text-slate-300">
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block mb-0.5">
                  Diagnóstico Mecánico Sugerido:
                </span>
                <p className="text-[11px] leading-relaxed">{report.consumption.mechanicDiagnosis}</p>
              </div>
            </div>

            {/* SALUD Y CAÍDA DE BATERÍA */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Salud y Caída de Tensión de la Batería
                  </h4>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  report.battery.status === 'atencion'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {report.battery.status === 'atencion' ? '⚠️ Advertencia Desgaste' : '✓ Estado Óptimo'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">En Reposo:</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{report.battery.currentRestVoltage}V</span>
                  <span className="text-[9px] text-slate-400">Sin contacto</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">En Marcha:</span>
                  <span className="text-base font-bold text-emerald-400 mt-0.5 block">{report.battery.runningVoltage}V</span>
                  <span className="text-[9px] text-slate-400">Alternador OK</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Caída Arranque:</span>
                  <span className={`text-base font-bold mt-0.5 block ${
                    report.battery.coldCrankingVoltageDrop < 10.5 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {report.battery.coldCrankingVoltageDrop}V
                  </span>
                  <span className="text-[9px] text-slate-400">Arranque en frío</span>
                </div>
              </div>

              {/* Battery score bar */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Vida útil estimada de batería:</span>
                  <span className="font-mono font-bold text-white">{report.battery.batteryHealthScorePercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      report.battery.batteryHealthScorePercent > 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${report.battery.batteryHealthScorePercent}%` }}
                  />
                </div>
              </div>

              {/* Battery alerts history */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">Eventos de caída de tensión registrados:</span>
                {report.battery.alertsHistory.length > 0 ? (
                  <div className="space-y-1.5">
                    {report.battery.alertsHistory.map((alt, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs flex items-start gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-[10px] text-amber-400/90 block">{alt.date}</span>
                          <p className="text-[11px] text-slate-300">{alt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 p-2 bg-slate-950 rounded-lg">
                    Sin caídas de tensión anormales registradas durante el encendido.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. SECCIÓN: ALERTAS GENERALES REGISTRADAS POR EL ELM327 DURANTE LA CONDUCCIÓN */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white tracking-tight mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Bitácora de Alertas Registradas por el ELM327 mientras el cliente manejaba</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.elm327RegisteredAlerts.map(alt => (
                <div
                  key={alt.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">{alt.date}</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                      alt.severity === 'alta'
                        ? 'bg-red-500/20 text-red-400'
                        : alt.severity === 'media'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alt.severity}
                    </span>
                  </div>
                  <h5 className="font-bold text-white">{alt.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-snug">{alt.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Ningún historial cargado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Ingresá el código proporcionado por la App del cliente (por ejemplo: <strong className="text-cyan-400 font-mono">AUT-7492</strong>) para visualizar su historial de consumo, batería y testigos.
          </p>
          <button
            onClick={() => handleConnect('AUT-7492')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Cargar Historial de Prueba (AUT-7492)
          </button>
        </div>
      )}
    </div>
  );
};
