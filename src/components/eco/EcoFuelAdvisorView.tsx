import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Fuel,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Percent,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { EcoSavingReport, VehicleProfile } from '../../types/vehicle';

interface EcoFuelAdvisorViewProps {
  report: EcoSavingReport;
  vehicle: VehicleProfile;
  onUpdateFuelPrice?: (price: number) => void;
}

export const EcoFuelAdvisorView: React.FC<EcoFuelAdvisorViewProps> = ({
  report,
  vehicle
}) => {
  const [fuelPrice, setFuelPrice] = useState(report.fuelPricePerLiter);
  const [monthlyKm, setMonthlyKm] = useState(report.monthlyDistanceKm);

  // Recalculate values dynamically if user tweaks price or distance
  const currentTotalCost = Math.round((monthlyKm * report.currentMonthAvgL100km / 100) * fuelPrice);
  const previousTotalCost = Math.round((monthlyKm * report.previousMonthAvgL100km / 100) * fuelPrice);
  const differenceCost = currentTotalCost - previousTotalCost;

  // Potential savings scaled to user's fuel price
  const scaledTips = report.tips.map((tip) => {
    const scaleFactor = fuelPrice / 1140;
    return {
      ...tip,
      adjustedSaving: Math.round(tip.potentialMonthlySaving * scaleFactor)
    };
  });

  const totalPossibleSaving = scaledTips.reduce((acc, t) => acc + t.adjustedSaving, 0);
  const annualProjectedSaving = totalPossibleSaving * 12;

  return (
    <div className="space-y-6">
      {/* Top Banner - Hero Claim */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Diagnóstico de Eficiencia Mensual
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {vehicle.brand} {vehicle.model}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              El mes pasado gastaste menos combustible
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              En el mes anterior tu consumo promedio fue de{' '}
              <strong className="text-emerald-400 font-mono">{report.previousMonthAvgL100km.toFixed(1)} L/100km</strong>,
              mientras que este mes subió a{' '}
              <strong className="text-amber-400 font-mono">{report.currentMonthAvgL100km.toFixed(1)} L/100km</strong> (+1.2 L/100km de diferencia).
            </p>
          </div>

          {/* Big Savings Highlight Card */}
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 text-right shrink-0 lg:min-w-[260px] shadow-lg">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Podrías haberte ahorrado aprox.
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              ${totalPossibleSaving.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-400">ARS/mes</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hasta ${annualProjectedSaving.toLocaleString('es-AR')} al año</span>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption Comparison Cards & Interactive Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Previous Month Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase font-semibold tracking-wider">Mes Pasado (Agosto)</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">Más Eficiente</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {report.previousMonthAvgL100km.toFixed(1)} <span className="text-xs font-normal text-slate-400">L/100km</span>
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 flex justify-between">
            <span>Gasto mensual:</span>
            <strong className="text-slate-200 font-mono">${previousTotalCost.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        {/* Current Month Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase font-semibold tracking-wider">Mes Actual (Septiembre)</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">+15.8% consumo</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300">
            {report.currentMonthAvgL100km.toFixed(1)} <span className="text-xs font-normal text-slate-400">L/100km</span>
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 flex justify-between">
            <span>Gasto mensual:</span>
            <strong className="text-slate-200 font-mono">${currentTotalCost.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        {/* Difference Extra Spent Card */}
        <div className="bg-slate-900/80 border border-amber-800/50 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase font-semibold tracking-wider">Diferencia Gastada</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">Sobrecosto</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">
            +${differenceCost.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-400">ARS</span>
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 flex justify-between">
            <span>Litros excedentes:</span>
            <strong className="text-slate-200 font-mono">+{((monthlyKm * 1.2) / 100).toFixed(0)} Litros</strong>
          </div>
        </div>
      </div>

      {/* Fuel Price & Distance Configurator */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Calibrá los valores según tu estación de servicio y uso habitual:</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Precio Litro:</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
              <span className="text-xs text-slate-500 mr-1">$</span>
              <input
                type="number"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(Math.max(100, Number(e.target.value)))}
                className="w-16 bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 ml-1">ARS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Km al mes:</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
              <input
                type="number"
                value={monthlyKm}
                onChange={(e) => setMonthlyKm(Math.max(100, Number(e.target.value)))}
                className="w-16 bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 ml-1">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Actionable Savings Tips Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Cosas concretas que podés hacer para mejorar la eficiencia y recuperar este dinero:
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Basado en telemetría de sensores ELM327
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scaledTips.map((tip, idx) => (
            <div
              key={tip.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold w-6 h-6 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {tip.title}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded shrink-0">
                    +${tip.adjustedSaving.toLocaleString('es-AR')} /mes
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                  {tip.explanation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  Acción recomendada:
                </span>
                <p className="text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                  {tip.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eco Score & Habits Summary */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Resumen de Hábitos de Conducción Registrados por OBD-II
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Tiempo en Ralentí:</span>
            <span className="text-base font-bold font-mono text-amber-400 mt-1 block">3.2 horas</span>
            <span className="text-[10px] text-slate-500">Equivale a 2.8L quemados sin avanzar</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Aceleraciones Bruscas:</span>
            <span className="text-base font-bold font-mono text-amber-400 mt-1 block">42 eventos</span>
            <span className="text-[10px] text-slate-500">TPS &gt; 70% en marchas cortas</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Presión Neumáticos:</span>
            <span className="text-base font-bold font-mono text-amber-400 mt-1 block">29 PSI (Baja)</span>
            <span className="text-[10px] text-slate-500">Recomendado: 32 PSI adelante</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Puntuación Eco:</span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">76 / 100</span>
            <span className="text-[10px] text-slate-500">Nivel Moderado con potencial</span>
          </div>
        </div>
      </div>
    </div>
  );
};
