'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorHidrogeno.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ---- Datos universo ----
const DISTRIBUCION_UNIVERSO = [
  { elemento: 'Hidrógeno (H)', porcentaje: 75, color: '#2E86AB' },
  { elemento: 'Helio (He)', porcentaje: 23, color: '#48A9A6' },
  { elemento: 'Resto elementos', porcentaje: 2, color: '#7FB3D3' },
];

// ---- Datos fusión nuclear ----
interface PasoFusion {
  paso: number;
  titulo: string;
  reaccion: string;
  detalle: string;
  velocidad: string;
}

const PASOS_FUSION: PasoFusion[] = [
  {
    paso: 1,
    titulo: 'Colisión protón-protón',
    reaccion: 'H + H → ²H (deuterio) + e⁺ + ν',
    detalle:
      'Dos protones se fusionan formando deuterio, un positrón y un neutrino. Es la reacción más lenta de la cadena: un protón tarda en promedio ~10⁹ años antes de reaccionar. Es lo que hace al sol tan estable.',
    velocidad: 'Muy lenta (~10⁹ años por par)',
  },
  {
    paso: 2,
    titulo: 'Deuterio + protón → Helio-3',
    reaccion: '²H + H → ³He + γ',
    detalle:
      'El deuterio capta un protón adicional y forma helio-3, liberando un fotón gamma de alta energía. Esta reacción es muy rápida comparada con el paso 1 (segundos a días).',
    velocidad: 'Rápida (segundos a días)',
  },
  {
    paso: 3,
    titulo: 'Helio-3 + Helio-3 → Helio-4',
    reaccion: '³He + ³He → ⁴He + 2H',
    detalle:
      'Dos núcleos de helio-3 se fusionan para producir helio-4 estable y liberar 2 protones de vuelta al ciclo. Resultado neto: 4 protones → 1 helio-4 + 26,7 MeV de energía.',
    velocidad: 'Moderada',
  },
];

// ---- Datos colores del hidrógeno ----
interface ColorH2 {
  color: string;
  nombre: string;
  emoji: string;
  proceso: string;
  co2: string;
  coste: string;
  sostenible: boolean;
  destacado?: boolean;
}

const COLORES_H2: ColorH2[] = [
  {
    color: '#9CA3AF',
    nombre: 'Gris',
    emoji: '🩶',
    proceso: 'Reformado de gas natural (CH₄ + H₂O → H₂ + CO₂)',
    co2: '~10 kg CO₂/kg H₂',
    coste: '1-2 €/kg',
    sostenible: false,
  },
  {
    color: '#3B82F6',
    nombre: 'Azul',
    emoji: '🔵',
    proceso: 'Reformado de gas natural + captura y almacenamiento de CO₂ (CCS)',
    co2: '~2-4 kg CO₂/kg H₂',
    coste: '2-3 €/kg',
    sostenible: false,
  },
  {
    color: '#22C55E',
    nombre: 'Verde',
    emoji: '🟢',
    proceso: 'Electrólisis del agua con electricidad renovable (2H₂O → 2H₂ + O₂)',
    co2: '~0 kg CO₂/kg H₂',
    coste: '3-8 €/kg',
    sostenible: true,
    destacado: true,
  },
  {
    color: '#F59E0B',
    nombre: 'Amarillo',
    emoji: '🟡',
    proceso: 'Electrólisis con electricidad nuclear',
    co2: '~0 kg CO₂/kg H₂ (sin CCS)',
    coste: '3-5 €/kg',
    sostenible: true,
  },
  {
    color: '#1F2937',
    nombre: 'Negro',
    emoji: '⚫',
    proceso: 'Gasificación del carbón (sin CCS)',
    co2: '~20 kg CO₂/kg H₂',
    coste: '0,5-1,5 €/kg',
    sostenible: false,
  },
];

// ---- Datos densidad energética ----
const DENSIDAD_MASICA = {
  labels: ['H₂ hidrógeno', 'Metano natural', 'Gasolina', 'Madera seca', 'Batería Li-ion'],
  datos: [33.3, 15.4, 12.9, 4.4, 0.25],
  colores: ['#2E86AB', '#48A9A6', '#F97316', '#8B5CF6', '#EF4444'],
};

const DENSIDAD_VOLUMETRICA = {
  labels: ['Gasolina', 'H₂ líquido (-253°C)', 'Batería Li-ion', 'H₂ gas (700 bar)'],
  datos: [9.0, 2.4, 0.7, 1.4],
  colores: ['#F97316', '#2E86AB', '#EF4444', '#7FB3D3'],
};

const chartMasicaData = {
  labels: DENSIDAD_MASICA.labels,
  datasets: [
    {
      label: 'kWh/kg',
      data: DENSIDAD_MASICA.datos,
      backgroundColor: DENSIDAD_MASICA.colores,
      borderRadius: 4,
    },
  ],
};

const chartVolumData = {
  labels: DENSIDAD_VOLUMETRICA.labels,
  datasets: [
    {
      label: 'kWh/L',
      data: DENSIDAD_VOLUMETRICA.datos,
      backgroundColor: DENSIDAD_VOLUMETRICA.colores,
      borderRadius: 4,
    },
  ],
};

const chartMasicaOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) =>
          ` ${(ctx.parsed.x ?? 0).toFixed(1)} kWh/kg`,
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Densidad energética másica (kWh/kg)' },
      beginAtZero: true,
    },
  },
};

const chartVolumOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) =>
          ` ${(ctx.parsed.x ?? 0).toFixed(1)} kWh/L`,
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Densidad energética volumétrica (kWh/L)' },
      beginAtZero: true,
    },
  },
};

// ---- Componente pila de combustible SVG ----
function PilaCombustibleSVG() {
  return (
    <svg
      viewBox="0 0 420 220"
      width="100%"
      aria-label="Diagrama de una pila de combustible tipo PEM"
      className={styles.fuelCellSvg}
      role="img"
    >
      {/* Ánodo */}
      <rect x="10" y="20" width="100" height="180" rx="8" fill="#2E86AB" opacity="0.15" stroke="#2E86AB" strokeWidth="2" />
      <text x="60" y="46" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#2E86AB">ÁNODO</text>
      <text x="60" y="64" textAnchor="middle" fontSize="10" fill="#2E86AB">(−)</text>
      <text x="60" y="100" textAnchor="middle" fontSize="11" fill="currentColor">H₂ → 2H⁺</text>
      <text x="60" y="118" textAnchor="middle" fontSize="11" fill="currentColor">+ 2e⁻</text>
      <text x="60" y="145" textAnchor="middle" fontSize="10" fill="#666" className={styles.svgMuted}>Hidrógeno</text>
      <text x="60" y="160" textAnchor="middle" fontSize="10" fill="#666" className={styles.svgMuted}>entra aquí</text>

      {/* Membrana PEM */}
      <rect x="120" y="20" width="60" height="180" rx="0" fill="#F59E0B" opacity="0.25" stroke="#F59E0B" strokeWidth="2" />
      <text x="150" y="46" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#B45309">MEMBRANA</text>
      <text x="150" y="62" textAnchor="middle" fontSize="9" fill="#B45309">PEM</text>
      <text x="150" y="100" textAnchor="middle" fontSize="10" fill="#92400E">H⁺ →</text>
      <text x="150" y="118" textAnchor="middle" fontSize="9" fill="#92400E">pasan</text>
      <text x="150" y="134" textAnchor="middle" fontSize="9" fill="#92400E">protones</text>
      <text x="150" y="155" textAnchor="middle" fontSize="9" fill="#B45309">bloquea e⁻</text>

      {/* Cátodo */}
      <rect x="190" y="20" width="100" height="180" rx="8" fill="#48A9A6" opacity="0.15" stroke="#48A9A6" strokeWidth="2" />
      <text x="240" y="46" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#48A9A6">CÁTODO</text>
      <text x="240" y="64" textAnchor="middle" fontSize="10" fill="#48A9A6">(+)</text>
      <text x="240" y="95" textAnchor="middle" fontSize="10" fill="currentColor">½O₂ + 2H⁺</text>
      <text x="240" y="113" textAnchor="middle" fontSize="10" fill="currentColor">+ 2e⁻ →</text>
      <text x="240" y="131" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#22C55E">H₂O</text>
      <text x="240" y="155" textAnchor="middle" fontSize="10" fill="#666" className={styles.svgMuted}>Oxígeno</text>
      <text x="240" y="170" textAnchor="middle" fontSize="10" fill="#666" className={styles.svgMuted}>entra aquí</text>

      {/* Circuito externo — e⁻ */}
      <path d="M 60 20 Q 60 10 150 10 Q 240 10 240 20" stroke="#EF4444" fill="none" strokeWidth="2.5" strokeDasharray="6,3" />
      {/* Motor */}
      <circle cx="150" cy="10" r="8" fill="white" stroke="#EF4444" strokeWidth="2" />
      <text x="150" y="14" textAnchor="middle" fontSize="8" fill="#EF4444" fontWeight="bold">M</text>
      <text x="150" y="0" textAnchor="middle" fontSize="9" fill="#EF4444">⚡ e⁻</text>

      {/* Flechas H⁺ en membrana */}
      <line x1="125" y1="110" x2="170" y2="110" stroke="#B45309" strokeWidth="1.5" markerEnd="url(#arrowH)" />
      <defs>
        <marker id="arrowH" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#B45309" />
        </marker>
      </defs>

      {/* Leyenda lateral */}
      <rect x="310" y="20" width="100" height="180" rx="8" fill="none" stroke="#E5E7EB" strokeWidth="1" />
      <text x="360" y="42" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor">Resumen</text>
      <text x="360" y="60" textAnchor="middle" fontSize="9" fill="#2E86AB">H₂ (comb.)</text>
      <text x="360" y="75" textAnchor="middle" fontSize="9" fill="#48A9A6">O₂ (aire)</text>
      <text x="360" y="95" textAnchor="middle" fontSize="10" fill="currentColor">Salida:</text>
      <text x="360" y="112" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#22C55E">H₂O</text>
      <text x="360" y="132" textAnchor="middle" fontSize="9" fill="currentColor">Eficiencia:</text>
      <text x="360" y="148" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">60-65%</text>
      <text x="360" y="162" textAnchor="middle" fontSize="9" fill="#666" className={styles.svgMuted}>vs 30-40%</text>
      <text x="360" y="175" textAnchor="middle" fontSize="9" fill="#666" className={styles.svgMuted}>motor comb.</text>
    </svg>
  );
}

// ---- Componente principal ----
export default function VisualizadorHidrogeno() {
  const [pasoFusion, setPasoFusion] = useState(0);
  const [graficoDensidad, setGraficoDensidad] = useState<'masica' | 'volumetrica'>('masica');

  const paso = PASOS_FUSION[pasoFusion];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🌟</div>
        <h1>El Hidrógeno: Del Big Bang a la Pila de Combustible</h1>
        <p>
          El elemento más abundante del universo que alimenta las estrellas y podría
          descarbonizar la economía
        </p>
      </header>

      <LegalNotice />

      {/* SECCIÓN 1 — El hidrógeno en el universo */}
      <section className={styles.section}>
        <h2>El Hidrógeno en el Universo</h2>
        <p className={styles.sectionIntro}>
          El hidrógeno es el elemento más abundante: constituye el 75% de la materia visible
          del universo en masa y el 90% de todos los átomos. Sin embargo, en la Tierra casi no
          existe en forma libre (H₂) porque es demasiado ligero y escapa de la atmósfera.
        </p>

        <div className={styles.universalDist}>
          {DISTRIBUCION_UNIVERSO.map((item) => (
            <div key={item.elemento} className={styles.distRow}>
              <span className={styles.distLabel}>{item.elemento}</span>
              <div className={styles.distBarWrapper}>
                <div
                  className={styles.distBar}
                  style={{ width: `${item.porcentaje}%`, backgroundColor: item.color }}
                  role="progressbar"
                  aria-valuenow={item.porcentaje}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.elemento}: ${item.porcentaje}%`}
                />
              </div>
              <span className={styles.distPct}>{item.porcentaje}%</span>
            </div>
          ))}
        </div>

        <div className={styles.atomoInfo}>
          <div className={styles.atomoCard}>
            <span className={styles.atomoIcono} aria-hidden="true">⚛️</span>
            <h3>El átomo más simple</h3>
            <ul>
              <li>1 protón + 1 electrón</li>
              <li>Radio atómico: 53 pm</li>
              <li>Masa: 1,008 u</li>
              <li>Número atómico: 1</li>
            </ul>
          </div>
          <div className={styles.atomoCard}>
            <span className={styles.atomoIcono} aria-hidden="true">☀️</span>
            <h3>El sol y el hidrógeno</h3>
            <ul>
              <li>Cada segundo: 600 Mt de H → He</li>
              <li>1.000 kg H → 993 kg He + 7 kg energía</li>
              <li>E=mc²: masa convertida en energía</li>
              <li>Temperatura núcleo: ~15 millones K</li>
            </ul>
          </div>
          <div className={styles.atomoCard}>
            <span className={styles.atomoIcono} aria-hidden="true">🌍</span>
            <h3>H₂ en la Tierra</h3>
            <ul>
              <li>Casi todo el H está unido: H₂O, CH₄</li>
              <li>H₂ libre en atmósfera: ~0,00005%</li>
              <li>Escapa al espacio por ser muy ligero</li>
              <li>Hay que fabricarlo: electrólisis o reformado</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2 — Fusión nuclear */}
      <section className={styles.section}>
        <h2>La Fusión Nuclear: Por Qué Brilla el Sol</h2>
        <p className={styles.sectionIntro}>
          El sol genera energía mediante la cadena protón-protón (cadena pp), fusionando
          hidrógeno en helio. ITER (Francia) intenta replicarlo en la Tierra para 2035-2040.
        </p>

        <div className={styles.fusionSteps}>
          {PASOS_FUSION.map((p, i) => (
            <button
              key={p.paso}
              className={`${styles.fusionStepBtn} ${i === pasoFusion ? styles.fusionStepActivo : ''}`}
              onClick={() => setPasoFusion(i)}
              aria-pressed={i === pasoFusion}
              aria-label={`Paso ${p.paso}: ${p.titulo}`}
            >
              <span className={styles.fusionStepNum}>{p.paso}</span>
              <span className={styles.fusionStepNombre}>{p.titulo}</span>
            </button>
          ))}
        </div>

        <div className={styles.fusionDetalle}>
          <div className={styles.fusionReaccion}>
            <code>{paso.reaccion}</code>
          </div>
          <p className={styles.fusionDescripcion}>{paso.detalle}</p>
          <div className={styles.fusionVelocidad}>
            <span aria-hidden="true">⏱️</span> {paso.velocidad}
          </div>
        </div>

        <div className={styles.fusionResumen}>
          <div className={styles.fusionDato}>
            <strong>Energía liberada</strong>
            <span>26,7 MeV / reacción completa</span>
          </div>
          <div className={styles.fusionDato}>
            <strong>Temperatura necesaria</strong>
            <span>~15 millones K (núcleo solar)</span>
          </div>
          <div className={styles.fusionDato}>
            <strong>ITER (en la Tierra)</strong>
            <span>D + T → He-4 + neutrón + 17,6 MeV</span>
          </div>
          <div className={styles.fusionDato}>
            <strong>ETA ITER</strong>
            <span>2035-2040 (primer plasma comercial)</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3 — Pila de combustible */}
      <section className={styles.section}>
        <h2>La Pila de Combustible: H₂ + O₂ = Electricidad + Agua</h2>
        <p className={styles.sectionIntro}>
          Una pila de combustible tipo PEM (Proton Exchange Membrane) convierte hidrógeno
          directamente en electricidad. El único residuo es agua pura.
        </p>

        <div className={styles.fuelCellDiagram}>
          <PilaCombustibleSVG />
        </div>

        <div className={styles.fuelCellApps}>
          <h3>Aplicaciones actuales</h3>
          <div className={styles.appsGrid}>
            <div className={styles.appItem}>
              <span aria-hidden="true">🚗</span>
              <strong>Toyota Mirai</strong>
              <span>FCEV con 650 km de autonomía, repostaje en 5 min</span>
            </div>
            <div className={styles.appItem}>
              <span aria-hidden="true">🚂</span>
              <strong>Alstom Coradia iLint</strong>
              <span>Tren de hidrógeno en servicio en Alemania</span>
            </div>
            <div className={styles.appItem}>
              <span aria-hidden="true">🚢</span>
              <strong>Buques marinos</strong>
              <span>Proyectos para descarbonizar el transporte marítimo</span>
            </div>
            <div className={styles.appItem}>
              <span aria-hidden="true">🏭</span>
              <strong>Generadores estacionarios</strong>
              <span>Centros de datos, hospitales, respaldo de red</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4 — Los colores del hidrógeno */}
      <section className={styles.section}>
        <h2>Los Colores del Hidrógeno</h2>
        <p className={styles.sectionIntro}>
          El 95% del hidrógeno actual se produce de forma contaminante (gris/negro). El
          hidrógeno verde es el único sostenible, pero todavía más caro.
        </p>

        <div className={styles.coloresGrid}>
          {COLORES_H2.map((c) => (
            <div
              key={c.nombre}
              className={`${styles.colorCard} ${c.destacado ? styles.colorCardDestacado : ''}`}
              style={{ borderColor: c.color }}
            >
              <div className={styles.colorHeader} style={{ backgroundColor: c.color + '22' }}>
                <span className={styles.colorEmoji} aria-hidden="true">{c.emoji}</span>
                <strong className={styles.colorNombre} style={{ color: c.color }}>
                  Hidrógeno {c.nombre}
                </strong>
                {c.destacado && (
                  <span className={styles.colorBadge}>El único sostenible</span>
                )}
              </div>
              <div className={styles.colorBody}>
                <p className={styles.colorProceso}>{c.proceso}</p>
                <div className={styles.colorMetrica}>
                  <span>CO₂:</span>
                  <strong style={{ color: c.sostenible ? '#22C55E' : '#EF4444' }}>
                    {c.co2}
                  </strong>
                </div>
                <div className={styles.colorMetrica}>
                  <span>Coste aprox.:</span>
                  <strong>{c.coste}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 5 — Densidad energética */}
      <section className={styles.section}>
        <h2>Densidad Energética Comparativa</h2>
        <p className={styles.sectionIntro}>
          El hidrógeno tiene la mayor densidad energética másica de todos los combustibles,
          pero su densidad volumétrica es el gran reto: ocupa mucho espacio aunque pese poco.
        </p>

        <div className={styles.densidadToggle}>
          <button
            className={`${styles.toggleBtn} ${graficoDensidad === 'masica' ? styles.toggleActivo : ''}`}
            onClick={() => setGraficoDensidad('masica')}
            aria-pressed={graficoDensidad === 'masica'}
          >
            Por masa (kWh/kg)
          </button>
          <button
            className={`${styles.toggleBtn} ${graficoDensidad === 'volumetrica' ? styles.toggleActivo : ''}`}
            onClick={() => setGraficoDensidad('volumetrica')}
            aria-pressed={graficoDensidad === 'volumetrica'}
          >
            Por volumen (kWh/L)
          </button>
        </div>

        {graficoDensidad === 'masica' ? (
          <>
            <div className={styles.densityChart}>
              <Bar data={chartMasicaData} options={chartMasicaOptions} />
            </div>
            <p className={styles.densidadNota}>
              El H₂ tiene 33,3 kWh/kg — más del doble que la gasolina y 130 veces más que una batería de litio.
              Es el combustible con mayor densidad energética másica conocido.
            </p>
          </>
        ) : (
          <>
            <div className={styles.densityChart}>
              <Bar data={chartVolumData} options={chartVolumOptions} />
            </div>
            <p className={styles.densidadNota}>
              La paradoja del H₂: aunque pesa poco, ocupa mucho espacio. La gasolina tiene
              6 veces más energía por litro que el H₂ comprimido a 700 bares. Almacenarlo
              es el mayor desafío tecnológico del sector.
            </p>
          </>
        )}

        <div className={styles.warningBox} role="note">
          <strong>La paradoja del hidrógeno:</strong> Por masa es imbatible (33,3 kWh/kg).
          Por volumen, pierde frente a la gasolina (9,0 vs 1,4 kWh/L a 700 bar).
          Por eso los coches de hidrógeno necesitan tanques a muy alta presión.
        </div>
      </section>

      <EducationalSection
        title="Más sobre el Hidrógeno"
        subtitle="El vector energético del futuro y sus retos"
      >
        <h3>Los tres usos industriales actuales del hidrógeno</h3>
        <p>
          Hoy el hidrógeno se usa casi exclusivamente como materia prima industrial, no como
          combustible energético:
        </p>
        <ul>
          <li>
            <strong>Síntesis de amoníaco (Haber-Bosch)</strong>: El proceso más importante.
            El 55% del H₂ mundial va a producir NH₃ para fertilizantes. Sin él, la mitad
            de la población mundial no podría alimentarse.
          </li>
          <li>
            <strong>Refinado de petróleo</strong>: Se usa para eliminar el azufre de los
            combustibles (hidrodesulfuración) y para craquear fracciones pesadas.
          </li>
          <li>
            <strong>Producción de metanol</strong>: Base para plásticos, disolventes y
            combustibles sintéticos. También CO₂ + H₂ → metanol (combustible e-fuel).
          </li>
        </ul>

        <h3>El reto del almacenamiento</h3>
        <p>
          Almacenar hidrógeno de forma eficiente es el principal obstáculo tecnológico:
        </p>
        <ul>
          <li>
            <strong>Compresión a 700 bar</strong>: Los coches de H₂ usan tanques de fibra de
            carbono a 700 atmósferas. Requieren compresores potentes y la densidad volumétrica
            sigue siendo baja (1,4 kWh/L).
          </li>
          <li>
            <strong>Licuefacción criogénica (-253°C)</strong>: El H₂ líquido tiene más
            densidad (2,4 kWh/L) pero mantenerlo requiere energía continua y solo 20 K
            sobre el cero absoluto.
          </li>
          <li>
            <strong>Hidruros metálicos</strong>: Algunos metales absorben H₂ en su estructura
            cristalina. Mayor seguridad pero peso elevado y temperatura de carga/descarga.
          </li>
        </ul>

        <h3>¿Por qué el H₂ puede ser peligroso?</h3>
        <p>
          El hidrógeno exige precauciones específicas:
        </p>
        <ul>
          <li>
            <strong>Rango de inflamabilidad amplio</strong>: 4-75% en aire (frente al 1-8%
            de la gasolina). Es decir, incluso concentraciones pequeñas pueden inflamarse.
          </li>
          <li>
            <strong>Detonación posible</strong>: A diferencias de la gasolina, el H₂ puede
            pasar directamente de deflagración a detonación en espacios confinados.
          </li>
          <li>
            <strong>Embrittlement de metales</strong>: El H₂ penetra en la estructura de
            algunos metales haciéndolos frágiles (fragilización por hidrógeno). Requiere
            materiales especiales (aceros de alta aleación, composites).
          </li>
          <li>
            <strong>Llama invisible</strong>: La llama del hidrógeno es transparente
            (no luminosa), lo que dificulta su detección visual.
          </li>
        </ul>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-hidrogeno')} />
      <ShareCard appName="visualizador-hidrogeno" />
      <Footer appName="visualizador-hidrogeno" />
    </div>
  );
}
