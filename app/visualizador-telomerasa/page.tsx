'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorTelomerasa.module.css';
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
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ----- Tipos -----
interface PasoData {
  titulo: string;
  descripcion: string;
  subtipo: 'normal' | 'acortado' | 'serie' | 'reparado';
}

interface CelulaTipo {
  nombre: string;
  nivel: number; // 1-5
  descripcion: string;
  esCancer: boolean;
}

// ----- Datos bloque 1 -----
const PASOS: PasoData[] = [
  {
    titulo: 'Los cromosomas tienen tapas protectoras',
    descripcion:
      'Los telómeros son secuencias repetitivas de ADN (TTAGGG en humanos) que protegen los extremos de los cromosomas, como las puntas plásticas de un cordón de zapato.',
    subtipo: 'normal',
  },
  {
    titulo: 'La ADN polimerasa no puede copiar el extremo final',
    descripcion:
      'En cada división celular, el cromosoma hijo pierde ~50-200 pares de bases de telómero. Es el "problema del extremo de la replicación".',
    subtipo: 'acortado',
  },
  {
    titulo: 'Acortamiento acumulado: el límite de Hayflick',
    descripcion:
      'Leonard Hayflick describió este límite en 1961. Una célula humana normal no puede dividirse indefinidamente: tras ~50-70 divisiones los telómeros críticos provocan senescencia o apoptosis.',
    subtipo: 'serie',
  },
  {
    titulo: 'La solución: telomerasa',
    descripcion:
      'La telomerasa es una enzima que lleva su propio ARN molde (AAUCCC) y lo usa para añadir repeticiones TTAGGG al extremo del cromosoma. Es una retrotranscriptasa: usa ARN como molde para sintetizar ADN.',
    subtipo: 'reparado',
  },
];

// ----- Datos bloque 2 -----
const CELULAS: CelulaTipo[] = [
  {
    nombre: 'Células embrionarias (stem)',
    nivel: 5,
    descripcion: 'Necesitan dividirse indefinidamente para el desarrollo',
    esCancer: false,
  },
  {
    nombre: 'Células germinales (óvulos/esperma)',
    nivel: 4,
    descripcion: 'Deben transmitir telómeros intactos a la descendencia',
    esCancer: false,
  },
  {
    nombre: 'Células madre adultas',
    nivel: 3,
    descripcion: 'Renuevan tejidos continuamente',
    esCancer: false,
  },
  {
    nombre: 'Linfocitos activados',
    nivel: 2,
    descripcion: 'Deben proliferar durante respuesta inmune',
    esCancer: false,
  },
  {
    nombre: 'Células somáticas adultas',
    nivel: 1,
    descripcion: 'No se dividen indefinidamente (músculo, piel)',
    esCancer: false,
  },
  {
    nombre: 'Células cancerosas',
    nivel: 5,
    descripcion: '~90% de tumores malignos — han "reactivado" la telomerasa',
    esCancer: true,
  },
];

// ----- Datos bloque 3 -----
const EDADES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
const LONGITUD = [95, 88, 80, 72, 63, 54, 45, 37, 30, 24];

const chartData = {
  labels: EDADES.map((e) => `${e} años`),
  datasets: [
    {
      label: 'Longitud telomérica media (relativa)',
      data: LONGITUD,
      borderColor: '#2E86AB',
      backgroundColor: 'rgba(46,134,171,0.12)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: LONGITUD.map((v) =>
        v <= 25 ? '#ef4444' : v <= 50 ? '#f97316' : '#2E86AB'
      ),
      pointRadius: 6,
    },
    {
      label: 'Umbral de senescencia',
      data: EDADES.map(() => 25),
      borderColor: '#ef4444',
      borderDash: [6, 4] as never,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: {
      display: true,
      text: 'Longitud telomérica a lo largo de la vida (valores ilustrativos)',
    },
    tooltip: {
      callbacks: {
        afterLabel: (context: { dataIndex: number }) => {
          const v = LONGITUD[context.dataIndex];
          if (v <= 25) return 'Zona de senescencia';
          if (v <= 50) return 'Acortamiento significativo';
          return 'Telómeros funcionales';
        },
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      title: { display: true, text: 'Longitud relativa (%)' },
    },
    x: {
      title: { display: true, text: 'Edad' },
    },
  },
} as never;

// ---- Componente SVG cromosoma ----
function SvgCromosoma({
  subtipo,
}: {
  subtipo: 'normal' | 'acortado' | 'serie' | 'reparado';
}) {
  if (subtipo === 'normal') {
    return (
      <svg
        viewBox="0 0 200 80"
        width="200"
        height="80"
        aria-label="Cromosoma con telómeros en extremos"
        className={styles.svgCromosoma}
      >
        {/* Telomero izquierdo */}
        <rect x="0" y="25" width="35" height="30" rx="6" fill="#2E86AB" />
        {/* Cuerpo */}
        <rect x="33" y="30" width="134" height="20" rx="3" fill="#48A9A6" />
        {/* Telomero derecho */}
        <rect x="165" y="25" width="35" height="30" rx="6" fill="#2E86AB" />
        <text x="100" y="72" textAnchor="middle" fontSize="10" fill="currentColor">
          TTAGGG — cuerpo cromosómico — TTAGGG
        </text>
      </svg>
    );
  }

  if (subtipo === 'acortado') {
    return (
      <svg
        viewBox="0 0 200 120"
        width="200"
        height="120"
        aria-label="Cromosoma original vs cromosoma copia acortada"
        className={styles.svgCromosoma}
      >
        {/* Original */}
        <text x="4" y="14" fontSize="9" fill="currentColor">
          Original
        </text>
        <rect x="0" y="18" width="30" height="24" rx="5" fill="#2E86AB" />
        <rect x="28" y="23" width="144" height="14" rx="3" fill="#48A9A6" />
        <rect x="170" y="18" width="30" height="24" rx="5" fill="#2E86AB" />

        {/* Copia acortada */}
        <text x="4" y="66" fontSize="9" fill="currentColor">
          Copia (división)
        </text>
        <rect x="18" y="70" width="16" height="24" rx="5" fill="#7FB3D3" />
        <rect x="32" y="75" width="130" height="14" rx="3" fill="#48A9A6" />
        <rect x="160" y="70" width="22" height="24" rx="5" fill="#7FB3D3" />

        {/* Hueco */}
        <rect x="0" y="70" width="20" height="24" rx="3" fill="#fee2e2" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" />
        <text x="10" y="86" textAnchor="middle" fontSize="8" fill="#ef4444">
          ✗
        </text>
        <text x="100" y="112" textAnchor="middle" fontSize="9" fill="#ef4444">
          ↑ extremo no copiado (-50–200 pb)
        </text>
      </svg>
    );
  }

  if (subtipo === 'serie') {
    // Serie de cromosomas cada vez más cortos
    const alturas = [30, 24, 18, 12, 6];
    const colores = ['#2E86AB', '#48A9A6', '#7FB3D3', '#f97316', '#ef4444'];
    return (
      <svg
        viewBox="0 0 200 80"
        width="200"
        height="80"
        aria-label="Cromosomas acortándose con cada división"
        className={styles.svgCromosoma}
      >
        {alturas.map((h, i) => {
          const x = 5 + i * 38;
          const y = 40 - h / 2;
          return (
            <g key={i}>
              <rect x={x} y={y} width={30} height={h} rx="4" fill={colores[i]} />
              {i === 4 && (
                <text x={x + 15} y={y + h + 12} textAnchor="middle" fontSize="9" fill="#ef4444">
                  ⛔
                </text>
              )}
            </g>
          );
        })}
        <text x="100" y="75" textAnchor="middle" fontSize="9" fill="currentColor">
          Divisiones sucesivas →
        </text>
      </svg>
    );
  }

  // reparado
  return (
    <svg
      viewBox="0 0 220 90"
      width="220"
      height="90"
      aria-label="Telomerasa añadiendo bloques al cromosoma acortado"
      className={styles.svgCromosoma}
    >
      {/* Cromosoma base acortado */}
      <rect x="40" y="30" width="16" height="28" rx="4" fill="#7FB3D3" />
      <rect x="54" y="35" width="100" height="18" rx="3" fill="#48A9A6" />
      <rect x="152" y="30" width="22" height="28" rx="4" fill="#7FB3D3" />

      {/* Bloques añadidos por telomerasa */}
      <rect x="174" y="30" width="12" height="28" rx="3" fill="#2E86AB" opacity="0.7" />
      <rect x="186" y="30" width="12" height="28" rx="3" fill="#2E86AB" opacity="0.85" />
      <rect x="198" y="30" width="12" height="28" rx="3" fill="#2E86AB" />

      {/* Flecha telomerasa */}
      <path d="M 20 44 Q 30 20 40 44" stroke="#48A9A6" fill="none" strokeWidth="2" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#48A9A6" />
        </marker>
      </defs>

      <text x="14" y="70" fontSize="8" fill="#48A9A6">
        Telomerasa
      </text>
      <text x="100" y="82" textAnchor="middle" fontSize="9" fill="#2E86AB">
        ← añade TTAGGG al extremo →
      </text>
    </svg>
  );
}

// ---- Componente barra actividad ----
function BarraActividad({ nivel, esCancer }: { nivel: number; esCancer: boolean }) {
  return (
    <div className={styles.barraActividad} aria-label={`Nivel de actividad telomerasa: ${nivel} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`${styles.bloqueBarra} ${i <= nivel ? (esCancer ? styles.bloqueRojo : styles.bloqueAzul) : styles.bloqueVacio}`}
        />
      ))}
    </div>
  );
}

// ---- Página principal ----
export default function VisualizadorTelomerasa() {
  const [pasoActual, setPasoActual] = useState(0);
  const paso = PASOS[pasoActual];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Telomerasa</h1>
        <p>La enzima del envejecimiento y la inmortalidad celular</p>
      </header>

      <LegalNotice />

      {/* BLOQUE 1 — Animación pasos */}
      <section className={styles.section}>
        <h2>El Problema del Extremo: Por Qué los Cromosomas se Acortan</h2>

        <div className={styles.pasoContainer}>
          <div className={styles.pasoHeader}>
            <span className={styles.pasoNumero}>Paso {pasoActual + 1} / {PASOS.length}</span>
            <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
          </div>

          <div className={styles.cromosomaContainer}>
            <SvgCromosoma subtipo={paso.subtipo} />
          </div>

          <p className={styles.pasoDescripcion}>{paso.descripcion}</p>

          <div className={styles.stepControls}>
            <button
              className={styles.btnPaso}
              onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
              disabled={pasoActual === 0}
              aria-label="Paso anterior"
            >
              ← Anterior
            </button>

            <div className={styles.pasoDots} aria-label="Indicador de pasos">
              {PASOS.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === pasoActual ? styles.dotActivo : ''}`}
                  onClick={() => setPasoActual(i)}
                  aria-label={`Ir al paso ${i + 1}`}
                  aria-current={i === pasoActual ? 'step' : undefined}
                />
              ))}
            </div>

            <button
              className={styles.btnPaso}
              onClick={() => setPasoActual((p) => Math.min(PASOS.length - 1, p + 1))}
              disabled={pasoActual === PASOS.length - 1}
              aria-label="Paso siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      {/* BLOQUE 2 — Grid tipos celulares */}
      <section className={styles.section}>
        <h2>Telomerasa en el Cuerpo: Quién la Tiene</h2>
        <div className={styles.gridCelulas}>
          {CELULAS.map((celula) => (
            <div
              key={celula.nombre}
              className={`${styles.tarjetaCelula} ${celula.esCancer ? styles.tarjetaCancer : ''}`}
            >
              <div className={styles.nombreCelula}>{celula.nombre}</div>
              <BarraActividad nivel={celula.nivel} esCancer={celula.esCancer} />
              <div className={styles.nivelLabel}>
                {celula.esCancer ? '⚠️ ' : ''}
                {celula.nivel === 5
                  ? 'Muy alta'
                  : celula.nivel === 4
                  ? 'Alta'
                  : celula.nivel === 3
                  ? 'Moderada'
                  : celula.nivel === 2
                  ? 'Baja-moderada'
                  : 'Muy baja / inactiva'}
              </div>
              <p className={styles.descCelula}>{celula.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOQUE 3 — Gráfico envejecimiento */}
      <section className={styles.section}>
        <h2>Telómeros y Envejecimiento</h2>

        <div className={styles.leyendaZonas}>
          <span className={styles.zonaVerde}>■ Funcionales (50-100)</span>
          <span className={styles.zonaAnaranjada}>■ Acortamiento significativo (25-50)</span>
          <span className={styles.zonaRoja}>■ Zona de senescencia (&lt;25)</span>
        </div>

        <div className={styles.chartContainer}>
          <Line data={chartData} options={chartOptions} />
        </div>

        <p className={styles.notaChart} aria-live="polite">
          Datos ilustrativos de tendencia poblacional. La longitud telomérica varía enormemente
          entre individuos y entre tipos celulares.
        </p>
      </section>

      {/* BLOQUE 4 — Doble cara: normal vs cáncer */}
      <section className={styles.section}>
        <h2>Telomerasa y Cáncer: La Doble Cara</h2>
        <p className={styles.subtituloBloque}>
          La telomerasa es simultáneamente &ldquo;la enzima del envejecimiento&rdquo; y &ldquo;la enzima de la inmortalidad cancerosa&rdquo;.
        </p>

        <div className={styles.columnasDual}>
          {/* Columna izquierda: sin telomerasa */}
          <div className={styles.columnaAzul}>
            <div className={styles.colHeader}>
              <span className={styles.colIcono} aria-hidden="true">🔵</span>
              <h3>Sin telomerasa activa</h3>
              <span className={styles.colEtiqueta}>Células normales</span>
            </div>
            <ul className={styles.colLista}>
              <li>Las células normales tienen telomerasa silenciada</li>
              <li>Los telómeros se acortan con cada división</li>
              <li>Tras ~50-70 divisiones → senescencia o apoptosis</li>
              <li className={styles.itemDestacado}>Esto es un mecanismo PROTECTOR anti-tumoral</li>
            </ul>
            <div className={styles.analogia}>
              <strong>Analogía:</strong> &ldquo;El contador de divisiones que impide que las células crezcan sin control&rdquo;
            </div>
          </div>

          {/* Columna derecha: con telomerasa reactivada */}
          <div className={styles.columnaRoja}>
            <div className={styles.colHeader}>
              <span className={styles.colIcono} aria-hidden="true">🔴</span>
              <h3>Con telomerasa reactivada</h3>
              <span className={styles.colEtiqueta}>Células cancerosas</span>
            </div>
            <ul className={styles.colLista}>
              <li>~90% de los tumores malignos tienen telomerasa activa</li>
              <li>Los telómeros no se acortan → divisiones ilimitadas</li>
              <li>Contribuye a la &ldquo;inmortalidad&rdquo; de las células tumorales</li>
              <li className={styles.itemDestacado}>
                Las células HeLa (Henrietta Lacks, 1951) llevan 70+ años dividiéndose en laboratorio
              </li>
            </ul>
            <div className={styles.analogia}>
              <strong>Investigación:</strong> &ldquo;Inhibir la telomerasa en tumores podría restaurar el límite de divisiones&rdquo;
            </div>
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          <strong>Nota educativa:</strong> Esta es una simplificación del mecanismo. El cáncer
          implica múltiples alteraciones moleculares — la telomerasa es una pieza importante pero
          no la única.
        </div>
      </section>

      <EducationalSection
        title="Profundiza en la telomerasa y los telómeros"
        subtitle="Envejecimiento celular, cáncer y Nobel 2009"
      >
        <h3>Premio Nobel de Fisiología o Medicina 2009</h3>
        <p>
          Elizabeth Blackburn, Carol Greider y Jack Szostak recibieron el Nobel 2009 por descubrir
          cómo los telómeros y la enzima telomerasa protegen los cromosomas. Blackburn identificó
          la secuencia TTAGGG en el cilio <em>Tetrahymena</em>; Greider descubrió la telomerasa
          en 1984 (siendo estudiante de doctorado); Szostak demostró que los telómeros protegen
          los cromosomas de la degradación.
        </p>

        <h3>El ARN de la telomerasa (TERC): una enzima con su propio molde</h3>
        <p>
          La telomerasa es única: lleva incorporada una molécula de ARN (componente TERC) que
          actúa como molde para sintetizar las repeticiones TTAGGG. La subunidad catalítica
          (TERT) es la retrotranscriptasa que copia ese ARN en ADN. Es un ejemplo de ARN
          funcional esencial para la célula.
        </p>

        <h3>Síndromes de envejecimiento acelerado</h3>
        <p>
          El síndrome de Werner y la progeria de Hutchinson-Gilford son enfermedades raras que
          causan envejecimiento prematuro. Aunque sus mecanismos moleculares difieren (Werner
          afecta una helicasa de ADN; la progeria afecta la lamina nuclear), ambas se asocian
          con mayor disfunción telomérica. Estudiarlas aporta pistas sobre el envejecimiento normal.
        </p>

        <h3>Telómeros en ratones vs humanos</h3>
        <p>
          Los ratones tienen telómeros 5-10 veces más largos que los humanos, pero viven mucho
          menos. Esto muestra que la longitud telomérica absoluta no determina la longevidad de
          la especie: importan la tasa de acortamiento, la actividad de la telomerasa en cada
          tejido y otros mecanismos de protección del genoma.
        </p>

        <h3>¿Se puede medir la &ldquo;edad telomérica&rdquo;?</h3>
        <p>
          Existen técnicas para medir la longitud telomérica (Q-FISH, qPCR relativa, Southern
          blot). Algunos servicios comerciales ofrecen un &ldquo;test de edad biológica&rdquo;
          basado en telómeros. Sin embargo, la variabilidad entre tejidos, entre células del mismo
          tejido y entre individuos es enorme, lo que limita su utilidad clínica. La mayoría de
          sociedades científicas no los recomienda como biomarcador de envejecimiento individual.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>Evidencia actual:</strong> La relación telómeros-envejecimiento es compleja y
          sigue siendo un área muy activa de investigación. Los test comerciales de &ldquo;edad
          telomérica&rdquo; tienen utilidad clínica muy limitada según la evidencia actual.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-telomerasa')} />
      <ShareCard appName="visualizador-telomerasa" />
      <Footer appName="visualizador-telomerasa" />
    </div>
  );
}
