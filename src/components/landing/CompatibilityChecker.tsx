import React, { useState } from 'react';
import { CheckCircle2, MinusCircle, Search, HelpCircle, Check, AlertCircle } from 'lucide-react';

interface CarBrandOption {
  brand: string;
  models: {
    name: string;
    years: string;
    features: {
      available: string[];
      unavailable: string[];
    };
    protocolNote?: string;
  }[];
}

const POPULAR_CARS: CarBrandOption[] = [
  {
    brand: 'Volkswagen',
    models: [
      {
        name: 'Gol Trend / Voyage',
        years: '2009 - 2023',
        features: {
          available: [
            'Diagnóstico completo de fallas OBD2 (luces y advertencias)',
            'Temperatura de refrigerante del motor',
            'Régimen de revoluciones (RPM) y velocidad',
            'Carga del motor y esfuerzo en pendientes',
            'Voltaje de batería en reposo y carga del alternador',
            'Correcciones de combustible (STFT/LTFT)',
            'Detección de viajes cortos y temperatura en frío'
          ],
          unavailable: [
            'Temperatura de aceite en cárter (no reportada por ECU en esta gama)',
            'Presión individual de neumáticos (TPMS directo no equipado)'
          ]
        },
        protocolNote: 'Protocolo ISO 15765-4 (CAN 500k). Compatibilidad 100% nativa con adaptadores estándar.'
      },
      {
        name: 'Golf / Vento / Bora',
        years: '2008 - 2022',
        features: {
          available: [
            'Diagnóstico completo de fallas OBD2 y testigos',
            'Temperatura de refrigerante del motor',
            'Temperatura de aceite de motor (Modo extendido)',
            'Régimen de RPM, velocidad real y carga del motor',
            'Presión de turbo/múltiple (MAP) y masa de aire (MAF)',
            'Voltaje y monitoreo de batería',
            'Consumo instantáneo y promedio estimado'
          ],
          unavailable: [
            'Presión de neumáticos (sistema indirecto por sensor ABS)'
          ]
        },
        protocolNote: 'Protocolo CAN bus de alta velocidad. Soporta lectura avanzada de parámetros extendidos.'
      },
      {
        name: 'Amarok',
        years: '2010 - 2024',
        features: {
          available: [
            'Diagnóstico OBD2 motor y emisiones',
            'Temperatura de refrigerante y aceite',
            'Presión de riel de combustible común (Common Rail)',
            'Ciclos de regeneración de filtro DPF',
            'Voltaje y salud de batería en arranques pesados'
          ],
          unavailable: [
            'Nivel de AdBlue en tablero anterior a 2018'
          ]
        }
      }
    ]
  },
  {
    brand: 'Toyota',
    models: [
      {
        name: 'Hilux / SW4',
        years: '2006 - 2024',
        features: {
          available: [
            'Diagnóstico de códigos de motor y testigos',
            'Temperatura de refrigerante',
            'Presión de inyección diésel / riel común',
            'RPM, velocidad y carga del motor',
            'Voltaje de batería y caída en frío',
            'Registro de viajes y consumo medio'
          ],
          unavailable: [
            'Temperatura de aceite en motor 1KD/2KD (pre-2016)',
            'Monitoreo de ángulo de dirección'
          ]
        }
      },
      {
        name: 'Corolla / Yaris',
        years: '2008 - 2024',
        features: {
          available: [
            'Diagnóstico OBD2 estándar',
            'Temperatura de motor',
            'Voltaje de batería de 12V',
            'Carga del motor y posición de acelerador',
            'Consumo promedio y distancias de viaje',
            'En modelos Híbridos: estado de batería auxiliar 12V'
          ],
          unavailable: [
            'Temperatura de celda de batería híbrida HV (requiere software de fábrica)',
            'Presión de aceite analógica'
          ]
        }
      },
      {
        name: 'Etios',
        years: '2013 - 2023',
        features: {
          available: [
            'Diagnóstico de fallas y testigos',
            'Temperatura de refrigerante (muy útil al no tener aguja en tablero)',
            'RPM y velocidad',
            'Voltaje de batería',
            'Carga de motor y hábitos de viaje'
          ],
          unavailable: [
            'Temperatura de aceite',
            'Sensor de presión de neumáticos'
          ]
        }
      }
    ]
  },
  {
    brand: 'Ford',
    models: [
      {
        name: 'Fiesta / Ka / Ecosport (Sigma / Dragon)',
        years: '2009 - 2022',
        features: {
          available: [
            'Diagnóstico motor OBD2',
            'Temperatura de refrigerante de alta resolución',
            'Monitoreo de batería y alternador inteligente (Smart Charge)',
            'Carga de motor y avance de encendido',
            'Consumo estimado y análisis de trayectos cortos'
          ],
          unavailable: [
            'Temperatura de caja automática Powershift en tableros estándar',
            'Presión analógica de aceite'
          ]
        }
      },
      {
        name: 'Ranger',
        years: '2012 - 2024',
        features: {
          available: [
            'Diagnóstico OBD2 completo',
            'Temperatura de refrigerante',
            'Presión de turbo e inyección',
            'Tensión de batería en frío',
            'Detección de viajes sin temperatura'
          ],
          unavailable: [
            'Nivel de desgaste de pastillas de freno'
          ]
        }
      }
    ]
  },
  {
    brand: 'Chevrolet',
    models: [
      {
        name: 'Onix / Prisma / Spin',
        years: '2013 - 2024',
        features: {
          available: [
            'Diagnóstico de códigos de falla',
            'Temperatura de motor y refrigerante',
            'Carga de motor y régimen de RPM',
            'Voltaje de batería y estado de carga',
            'Registro de viajes y hábitos de manejo'
          ],
          unavailable: [
            'Temperatura de aceite en motores 1.4 8V SPE/4'
          ]
        }
      },
      {
        name: 'Cruze',
        years: '2011 - 2023',
        features: {
          available: [
            'Diagnóstico OBD2 motor y turbo',
            'Temperatura de refrigerante',
            'Presión del múltiple de admisión (Boost)',
            'Voltaje de batería y alternador',
            'Consumo y trayectos'
          ],
          unavailable: [
            'Presión de neumáticos (disponible solo en pantalla del auto)'
          ]
        }
      }
    ]
  },
  {
    brand: 'Peugeot / Citroën',
    models: [
      {
        name: '208 / 2008 / C3 / C4 Cactus',
        years: '2013 - 2024',
        features: {
          available: [
            'Diagnóstico de fallas OBD2',
            'Temperatura de refrigerante',
            'Voltaje de batería',
            'Régimen de RPM, velocidad y carga',
            'Alertas de viajes cortos y consumo'
          ],
          unavailable: [
            'Nivel de líquido antipolución FAP/Eolys (requiere DiagBox)'
          ]
        }
      }
    ]
  },
  {
    brand: 'Renault',
    models: [
      {
        name: 'Sandero / Stepway / Logan / Duster',
        years: '2008 - 2024',
        features: {
          available: [
            'Diagnóstico motor y emisiones',
            'Temperatura de refrigerante',
            'Carga de motor y posición de acelerador',
            'Voltaje de batería',
            'Hábitos de viaje y consumo estimado'
          ],
          unavailable: [
            'Temperatura de aceite en motores K7M/K4M/SCe'
          ]
        }
      }
    ]
  },
  {
    brand: 'Fiat',
    models: [
      {
        name: 'Cronos / Argo / Toro',
        years: '2016 - 2024',
        features: {
          available: [
            'Diagnóstico OBD2 de motor',
            'Temperatura de motor',
            'Voltaje de batería en reposo y carga',
            'Carga de motor y revoluciones',
            'Consumo y registro de viajes cortos'
          ],
          unavailable: [
            'Sistemas de confort y airbag (no permitidos por el estándar OBD2 general)'
          ]
        }
      }
    ]
  },
  {
    brand: 'Nissan',
    models: [
      {
        name: 'Frontier 2.8 TDI (MWM Sprint Electronic)',
        years: '2005 - 2008',
        features: {
          available: [
            'Diagnóstico de fallas en versiones Electronic (Bosch EDC16)',
            'Temperatura de refrigerante del motor',
            'Régimen de revoluciones (RPM) y velocidad',
            'Presión de riel de inyección Common Rail',
            'Voltaje de batería en reposo y carga de alternador',
            'Detección de temperatura en frío y viajes cortos'
          ],
          unavailable: [
            'Incompatible si tiene bomba mecánica (las versiones previas con bomba mecánica no tienen ECU de motor)',
            'Temperatura de aceite en cárter',
            'Consumo promedio en display'
          ]
        },
        protocolNote: 'Usa protocolo KWP2000 / K-Line (ISO 14230). Requiere adaptador ELM327 versión 1.5 que soporte línea K (pin 7).'
      },
      {
        name: 'Frontier / Navara 2.5 dCi (YD25 / D22 - D40)',
        years: '2006 - 2015',
        features: {
          available: [
            'Diagnóstico completo de fallas OBD2 y testigos',
            'Temperatura de refrigerante',
            'Presión del riel de combustible y turbo',
            'Régimen de RPM y velocidad real',
            'Voltaje de batería y caída en arranque',
            'Consumo estimado y registro de viajes'
          ],
          unavailable: [
            'Temperatura de aceite de motor',
            'En algunos modelos asiáticos pre-2008 utiliza protocolo propietario Nissan Consult-II'
          ]
        },
        protocolNote: 'Conector OBD2 de 16 pines bajo la columna de dirección a la izquierda.'
      },
      {
        name: 'Frontier 2.3 dCi (NP300)',
        years: '2016 - 2024',
        features: {
          available: [
            'Diagnóstico OBD2 motor y emisiones completo',
            'Temperatura de motor y refrigerante',
            'Ciclos y saturación de filtro DPF',
            'Carga del motor, acelerador y revoluciones',
            'Voltaje de batería y alternador inteligente',
            'Hábitos de viaje y trayectos cortos'
          ],
          unavailable: [
            'Nivel de AdBlue en tablero anterior a 2019'
          ]
        }
      }
    ]
  }
];

export const CompatibilityChecker: React.FC = () => {
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(0);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);
  const [checked, setChecked] = useState<boolean>(true);

  const currentBrand = POPULAR_CARS[selectedBrandIndex];
  const currentModel = currentBrand.models[selectedModelIndex] || currentBrand.models[0];

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedBrandIndex(idx);
    setSelectedModelIndex(0);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModelIndex(parseInt(e.target.value, 10));
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          ¿Funciona con mi auto?
        </h3>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Casi todos los vehículos nafteros fabricados a partir de 2008 y diésel desde 2012 cuentan con puerto de diagnóstico compatible.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Marca</label>
          <select
            value={selectedBrandIndex}
            onChange={handleBrandChange}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {POPULAR_CARS.map((b, i) => (
              <option key={b.brand} value={i}>{b.brand}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Modelo</label>
          <select
            value={selectedModelIndex}
            onChange={handleModelChange}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {currentBrand.models.map((m, i) => (
              <option key={m.name} value={i}>{m.name} ({m.years})</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setChecked(true)}
            className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Comprobar compatibilidad</span>
          </button>
        </div>
      </div>

      {/* Result Display */}
      {checked && currentModel && (
        <div className="p-5 sm:p-6 bg-slate-950 border border-slate-800 rounded-2xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="text-base font-bold text-white">
                  {currentBrand.brand} {currentModel.name}
                </h4>
                <span className="text-xs text-slate-400">({currentModel.years})</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-1">
                ✓ Compatible con la aplicación mediante adaptador OBD2 estándar
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 w-fit">
              Puerto OBD2 bajo el volante
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Available Parameters */}
            <div>
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block mb-2 text-slate-200">
                Información disponible en este modelo:
              </span>
              <ul className="space-y-2">
                {currentModel.features.available.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unavailable / Clarification Parameters */}
            <div>
              <span className="font-bold uppercase tracking-wider text-[11px] block mb-2 text-slate-400">
                Parámetros no disponibles en este vehículo:
              </span>
              <ul className="space-y-2 mb-4">
                {currentModel.features.unavailable.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-400">
                    <MinusCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300 block mb-0.5">Honestidad técnica ante todo:</strong>
                Nunca prometemos datos que la computadora de tu modelo específico no entregue por el estándar internacional. La app se adapta automáticamente a lo que tu auto reporte.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
