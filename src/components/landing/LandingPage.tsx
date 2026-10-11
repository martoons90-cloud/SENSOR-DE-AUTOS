import React, { useState } from 'react';
import {
  Car,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Clock,
  Fuel,
  Thermometer,
  Zap,
  Activity,
  History,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Search,
  Sparkles,
  Smartphone,
  Check,
  AlertCircle,
  Eye,
  KeyRound,
  ShieldAlert,
  Wrench,
  HelpCircle,
  Share2
} from 'lucide-react';
import { PhoneAppMockup } from './PhoneAppMockup';
import { CompatibilityChecker } from './CompatibilityChecker';

interface LandingPageProps {
  onOpenMobileApp: () => void;
  onOpenWorkshopErp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenMobileApp,
  onOpenWorkshopErp
}) => {
  const [activeAlertTab, setActiveAlertTab] = useState<'normal' | 'revisar' | 'atencion' | 'importante'>('revisar');
  const [showMechanicDetails, setShowMechanicDetails] = useState<boolean>(false);
  const [sharedCode, setSharedCode] = useState<string>('AUT-7492');
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sharedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVBAR
      ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">AutoSense</span>
              <span className="text-[11px] text-slate-400 block -mt-1 hidden sm:block">
                Tu auto tiene mucho más para contarte
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
            <button onClick={() => scrollToSection('diferencia')} className="hover:text-white transition-colors">
              La diferencia
            </button>
            <button onClick={() => scrollToSection('habitos')} className="hover:text-white transition-colors">
              Hábitos y viajes
            </button>
            <button onClick={() => scrollToSection('historial')} className="hover:text-white transition-colors">
              Historial
            </button>
            <button onClick={() => scrollToSection('como-funciona')} className="hover:text-white transition-colors">
              Cómo funciona
            </button>
            <button onClick={() => scrollToSection('compatibilidad')} className="hover:text-white transition-colors">
              Compatibilidad
            </button>
            <button onClick={() => scrollToSection('auto-usado')} className="hover:text-white transition-colors">
              Auto usado
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenWorkshopErp}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors hidden lg:inline-block"
            >
              Acceso Taller / ERP
            </button>
            <button
              onClick={onOpenMobileApp}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Probar App</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
          Explicación en 5 segundos. Mockup grande del celular como protagonista.
      ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle background ambient glow (not neon AI slop, just soft atmospheric depth) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-cyan-400 font-semibold">Nosotros te ayudamos a entenderlo</span>
                <span aria-hidden="true">·</span>
                <span>Sin tecnicismos</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                Tu auto tiene mucho más para contarte.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Entendé qué le pasa, cómo lo estás usando y qué conviene revisar antes de que un pequeño aviso se convierta en un problema costoso.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onOpenMobileApp}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold rounded-2xl text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Empezar con mi auto</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => scrollToSection('como-funciona')}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Ver cómo funciona</span>
                </button>
              </div>

              {/* 3 Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Entendé qué le pasa</span>
                  <p className="text-xs text-slate-400 leading-snug">Fallas y señales explicadas en palabras cotidianas.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Descubrí cómo lo usás</span>
                  <p className="text-xs text-slate-400 leading-snug">Viajes cortos, consumo real y temperatura de motor.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Construí su historia</span>
                  <p className="text-xs text-slate-400 leading-snug">Historial clínico y mantenimientos en un solo lugar.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Phone Mockup as Protagonist */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                {/* Floating highlight tag on desktop */}
                <div className="hidden sm:flex absolute -left-6 top-16 z-30 p-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-xl items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="text-left text-xs">
                    <span className="font-bold text-white block">Todo en orden hoy</span>
                    <span className="text-[10px] text-slate-400">91 °C · Batería 13,9 V</span>
                  </div>
                </div>

                <div className="hidden sm:flex absolute -right-6 bottom-24 z-30 p-3 bg-amber-950/90 backdrop-blur border border-amber-500/30 rounded-2xl shadow-xl items-center gap-3 max-w-[210px]">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left text-xs">
                    <span className="font-bold text-white block">Aviso útil</span>
                    <span className="text-[10px] text-slate-300">Muchos viajes cortos esta semana</span>
                  </div>
                </div>

                <PhoneAppMockup interactive={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TU AUTO YA SABE TODO ESTO
      ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Información que ya existe en tu vehículo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tu auto sabe más de lo que imaginás.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Los vehículos modernos monitorean decenas de variables cada segundo mientras manejás.
              Nosotros simplemente conectamos esos datos y los convertimos en explicaciones claras para que puedas cuidar tu auto sin ser experto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Fuel,
                title: 'Combustible y Consumo',
                desc: 'Nivel exacto restante, autonomía estimada y si tu forma de manejar en los últimos trayectos gastó más de lo habitual.'
              },
              {
                icon: Thermometer,
                title: 'Temperatura del Motor',
                desc: 'Si el motor alcanzó su temperatura óptima de trabajo o si circulaste frío, lo cual desgasta el aceite antes de tiempo.'
              },
              {
                icon: Zap,
                title: 'Salud de la Batería',
                desc: 'Voltaje en reposo y cómo responde en el momento del arranque, avisándote semanas antes de que te deje sin encendido.'
              },
              {
                icon: Activity,
                title: 'Esfuerzo del Motor',
                desc: 'Qué tan exigido trabaja tu vehículo en subidas, autopista o tráfico pesado, evaluando la carga mecánica real.'
              },
              {
                icon: ShieldAlert,
                title: 'Avisos y Señales Tempranas',
                desc: 'Traducción humana de cualquier irregularidad que la computadora detecte, mucho antes de que se prenda la luz de advertencia.'
              },
              {
                icon: Clock,
                title: 'Viajes y Hábitos de Uso',
                desc: 'Duración, distancia recorrida, tiempos en ralentí y el impacto que tienen tus trayectos diarios en la mecánica.'
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">{card.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            * La disponibilidad exacta de determinados datos y parámetros depende del modelo, año y equipamiento de fábrica de cada vehículo.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. LA DIFERENCIA FUNDAMENTAL (COMPARATIVA SCANNER VS APP)
          Sección clave: No mostramos simplemente datos. Los convertimos en información útil.
      ────────────────────────────────────────────────────────────── */}
      <section id="diferencia" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              La diferencia fundamental
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              No necesitás entender de mecánica.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              No mostramos simplemente datos crudos. Los convertimos en información útil, comprensible y orientada a la tranquilidad.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Lado Izquierdo: Lo que ve un scanner (frío, intimidante) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Lo que ve un scanner tradicional
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    Códigos Crudos
                  </span>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs space-y-2.5 text-slate-300">
                  <div className="text-amber-400 font-bold text-sm">DTC: P0128</div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">ECT (Coolant):</span>
                    <span className="text-white">71 °C</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">RPM:</span>
                    <span className="text-white">2.150 RPM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">LOAD_PCT:</span>
                    <span className="text-white">42%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">SHRTFT1:</span>
                    <span className="text-white">-3.2%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850 text-xs text-slate-400 italic">
                “¿Qué significa esto para una persona común que solo quiere usar su auto y saber si puede salir a la ruta seguro?”
              </div>
            </div>

            {/* Lado Derecho: Lo que entendés con nuestra app (humano, tranquilizador, claro) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 shadow-xl shadow-cyan-500/5 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Lo que entendés con nuestra aplicación
                  </span>
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Explicación Clara
                  </span>
                </div>

                <div className="mt-6 p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white">
                      Tu motor está tardando demasiado en alcanzar su temperatura normal.
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    “Detectamos este comportamiento durante varios de tus últimos viajes. Si continúa, conviene controlar el termostato del sistema de refrigeración.”
                  </p>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                    ¿Qué conviene hacer?
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    No es una emergencia inmediata. Podés circular con normalidad, pero programá una revisión preventiva antes de tu próximo viaje largo para cuidar el consumo y el motor.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold pt-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tranquilidad, prevención y decisiones inteligentes.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CONOCÉ CÓMO USÁS TU AUTO (DASHBOARD DE HÁBITOS)
      ────────────────────────────────────────────────────────────── */}
      <section id="habitos" className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Uso Cotidiano
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              No todo problema empieza con una luz en el tablero.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              La aplicación no solamente sirve cuando el auto falla. Sirve todos los días para entender tus hábitos y prevenir desgastes innecesarios.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Resumen de Conducción
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Últimos 30 días de uso</h3>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-bold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 w-fit">
                47 viajes analizados
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Recorrido total</span>
                <span className="text-xl font-bold font-mono text-white">1.284 km</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Uso urbano y autopista</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Consumo promedio</span>
                <span className="text-xl font-bold font-mono text-emerald-400">8,2 L/100km</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Parámetro normal</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Viajes cortos</span>
                <span className="text-xl font-bold font-mono text-amber-400">64%</span>
                <span className="text-[10px] text-amber-400/90 block mt-0.5">Menos de 15 minutos</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Duración media</span>
                <span className="text-xl font-bold font-mono text-white">18 min</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Por trayecto</span>
              </div>
            </div>

            {/* Detección Preventiva Destacada */}
            <div className="p-5 rounded-2xl bg-amber-950/25 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Detección de hábitos: Muchos viajes cortos</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  “En el 64% de tus viajes el motor no permaneció suficiente tiempo en su temperatura normal de funcionamiento. La condensación en el escape y la humedad en el aceite se acumulan cuando el motor no toma temperatura de régimen.”
                </p>
                <span className="text-cyan-450 font-medium block pt-1">
                  💡 Consejo: Un trayecto de 30 minutos por autopista el fin de semana ayuda a evaporar residuos y prolongar la vida útil del motor.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. HISTORIAL DEL AUTO (HISTORIAL CLÍNICO & COMPARTIR)
      ────────────────────────────────────────────────────────────── */}
      <section id="historial" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Historial Clínico del Vehículo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              La historia de tu auto, en un solo lugar.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Un registro digital ordenado de todo lo que le pasó a tu vehículo: servicios, alertas preventivas, normalizaciones y próximos vencimientos.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {/* Timeline */}
            <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
              {[
                {
                  km: '124.320 km',
                  title: 'Cambio de aceite y filtros',
                  desc: 'Aceite sintético 5W-40 + filtros de aceite y aire. Sin anomalías detectadas en ECU.',
                  tag: 'Mantenimiento',
                  color: 'bg-emerald-400'
                },
                {
                  km: '127.840 km',
                  title: 'Primer aviso de batería',
                  desc: 'Caída de tensión al arranque en frío (10,4 V). Alerta preventiva registrada en la app.',
                  tag: 'Aviso preventivo',
                  color: 'bg-amber-400'
                },
                {
                  km: '128.110 km',
                  title: 'Falla momentánea detectada',
                  desc: 'Señal intermitente en sensor de temperatura al arrancar con clima helado.',
                  tag: 'Diagnóstico',
                  color: 'bg-orange-400'
                },
                {
                  km: '128.450 km',
                  title: 'Falla dejó de aparecer',
                  desc: 'Lecturas estabilizadas durante 340 km continuos. Normalización confirmada.',
                  tag: 'Normalizado',
                  color: 'bg-cyan-400'
                },
                {
                  km: '131.000 km',
                  title: 'Próximo mantenimiento programado',
                  desc: 'Control de pastillas de freno, rotación de neumáticos y chequeo de fluidos.',
                  tag: 'Futuro',
                  color: 'bg-slate-600'
                }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className={`w-3.5 h-3.5 rounded-full ${item.color} absolute -left-[31px] sm:-left-[39px] top-1.5 border-4 border-slate-950 shadow-sm`} />
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 group-hover:border-slate-700 transition-colors text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{item.km}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.tag}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-slate-300 mt-1 leading-relaxed text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Compartir con el mecánico */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Compartir historial con mi mecánico</span>
                </h4>
                <p className="text-xs text-slate-400 max-w-md">
                  Generá un código de 6 caracteres para que tu taller consulte la bitácora de comportamiento antes de tocar un tornillo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm bg-slate-950 px-3 py-2 rounded-xl border border-cyan-500/40 text-cyan-400 select-all">
                  {sharedCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  {codeCopied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. ALERTAS QUE SE ENTIENDEN
      ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Comunicación Serena y Precisa
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Cuando algo pasa, te explicamos qué significa.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Un semáforo comprensible para que sepas si es algo para revisar en el próximo service o si requiere atención más pronta.
            </p>
          </div>

          {/* 4 Levels Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'normal', label: '🟢 Normal', desc: 'Todo en orden' },
              { id: 'revisar', label: '🟡 Revisar', desc: 'Comportamiento atípico' },
              { id: 'atencion', label: '🟠 Atención', desc: 'Control en próximos días' },
              { id: 'importante', label: '🔴 Importante', desc: 'Atención requerida' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveAlertTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeAlertTab === tab.id
                    ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Case study: In place of P0302 */}
          <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-850">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Detectamos fallos de combustión en uno de los cilindros.
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 w-fit">
                Nivel: 🟡 Revisar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block">
                  ¿Qué significa?
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Una de las bujías o cables de encendido no produjo la chispa en el tiempo exacto en el cilindro 2 durante una aceleración.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block">
                  ¿Qué podrías notar?
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Una ligera vibración al regular detenido en un semáforo o una breve pérdida de pique al acelerar en segunda marcha.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1 sm:col-span-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block">
                  ¿Qué conviene hacer?
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Podés continuar manejando hasta tu destino sin peligro. Es recomendable coordinar una revisión de bujías o bobinas en tu lubricentro o taller de confianza en los próximos 200 km.
                </p>
              </div>
            </div>

            {/* Datos para el mecánico (en segundo plano, prolijo) */}
            <div className="pt-2 border-t border-slate-850">
              <button
                onClick={() => setShowMechanicDetails(!showMechanicDetails)}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors font-medium"
              >
                <span>{showMechanicDetails ? 'Ocultar código técnico' : 'Ver código técnico para mostrarle a tu mecánico'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showMechanicDetails ? 'rotate-90' : ''}`} />
              </button>

              {showMechanicDetails && (
                <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 animate-in fade-in duration-150">
                  <div className="text-amber-400 font-bold">Código OBD2: P0302 (Cylinder 2 Misfire Detected)</div>
                  <div className="text-slate-400 text-[10px]">
                    Freeze Frame: 2.140 RPM · Velocidad: 58 km/h · Carga motor: 54% · Temp: 89 °C
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. AHORRO Y HÁBITOS
      ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Eficiencia Real
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Manejar mejor también puede significar gastar menos.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Recomendaciones basadas en datos reales de tus propios viajes, no consejos genéricos de internet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-3xl font-black font-mono text-cyan-400 block">42 min</span>
              <h4 className="text-sm font-bold text-white">Acumulados en ralentí innecesario</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dejar el auto en marcha esperando a alguien consume hasta 1 litro de nafta por hora sin moverte. Apagar el motor en esperas largas ahorra combustible.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-3xl font-black font-mono text-amber-400 block">11 viajes</span>
              <h4 className="text-sm font-bold text-white">De menos de 5 minutos</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                En los primeros 5 minutos el motor trabaja en frío y gasta hasta un 40% más de combustible para calentarse. Agrupar diligencias reduce el gasto drásticamente.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-3xl font-black font-mono text-emerald-400 block">-$18.500</span>
              <h4 className="text-sm font-bold text-white">Ahorro mensual proyectado</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ajustando la presión de neumáticos y evitando aceleradas bruscas en frío podés ahorrar hasta un tanque de combustible cada tres meses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. CÓMO FUNCIONA (4 PASOS SENCILLOS)
      ────────────────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Simplicidad Total
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Conectalo. Abrí la app. Listo.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Sin cables engorrosos ni instalaciones invasivas. Todo se configura en menos de dos minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                step: '01',
                title: 'Conectá',
                desc: 'Enchufás un pequeño adaptador compatible al puerto de tu auto (ubicado cómodamente bajo el volante).'
              },
              {
                step: '02',
                title: 'Vinculá',
                desc: 'Abrís la aplicación en tu celular y se enlaza automáticamente por Bluetooth en segundos.'
              },
              {
                step: '03',
                title: 'Manejá',
                desc: 'La app recibe en segundo plano la información disponible de tu auto mientras realizás tu vida cotidiana.'
              },
              {
                step: '04',
                title: 'Entendé',
                desc: 'Convertimos esos datos en explicaciones claras, alertas preventivas y hábitos de uso.'
              }
            ].map((step, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 relative">
                <span className="text-3xl font-black font-mono text-cyan-500/30 block">
                  {step.step}
                </span>
                <h4 className="text-base font-bold text-white">{step.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. COMPATIBILIDAD INTERACTIVA
      ────────────────────────────────────────────────────────────── */}
      <section id="compatibilidad" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <CompatibilityChecker />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. HARDWARE (EL ADAPTADOR OBD2)
      ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
              <KeyRound className="w-12 h-12 stroke-[1.5]" />
            </div>

            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Dispositivo Universal
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Un pequeño dispositivo. Mucha información.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                El conector OBD2 es un puerto universal que tienen todos los autos modernos por normativa internacional.
                Un adaptador compatible mide apenas 5 centímetros, no consume batería cuando el motor se apaga y te permite leer lo que tu vehículo ya está midiendo.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Compatible con adaptadores Bluetooth estándar</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sin cables ni modificaciones al auto</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          12. CASO DE USO: AUTO USADO
      ────────────────────────────────────────────────────────────── */}
      <section id="auto-usado" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Caso Práctico
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ¿Estás por comprar un auto usado?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Llevar el adaptador en el bolsillo te permite enchufarlo durante la prueba de manejo y consultar información valiosa antes de señar o tomar una decisión.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <h5 className="font-bold text-white">¿Borraron fallas recién?</h5>
                <p className="text-slate-300 leading-relaxed">
                  Podés ver los kilómetros transcurridos desde el último borrado de memoria para saber si borraron una luz de Check Engine antes de mostrártelo.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <h5 className="font-bold text-white">Salud real de batería</h5>
                <p className="text-slate-300 leading-relaxed">
                  Comprobás si el alternador carga bien y cuánta tensión cae al momento del arranque en frío.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <h5 className="font-bold text-white">Temperatura en marcha</h5>
                <p className="text-slate-300 leading-relaxed">
                  Verificás que el electroventilador prenda en su temperatura justa y que el termostato no esté trabado.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-400 text-center sm:text-left">
              * Una excelente herramienta de apoyo y tranquilidad previa, sin reemplazar una inspección mecánica integral en taller.
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          13. FINAL CTA
      ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Tu auto tiene mucho más para contarte.
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Empezá hoy a entender qué le pasa, cómo lo estás usando y cuidá su valor día a día.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenMobileApp}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-base shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              <span>Abrir Simulador de la App</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={onOpenWorkshopErp}
              className="px-6 py-4 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-2xl text-sm font-semibold transition-colors"
            >
              <span>Ver Sistema para Talleres / ERP</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          14. FOOTER
      ────────────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-slate-900 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
              <Car className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-slate-300">AutoSense</span>
            <span>·</span>
            <span>Conocer, entender y cuidar tu auto.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenMobileApp} className="hover:text-slate-300 transition-colors">
              App Móvil
            </button>
            <button onClick={onOpenWorkshopErp} className="hover:text-slate-300 transition-colors">
              Módulo Taller
            </button>
            <span>·</span>
            <span>© {new Date().getFullYear()} AutoSense. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
