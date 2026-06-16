'use client';

import { useState, useEffect } from 'react';
import styles from './VisualizadorInsulinaGlucosa.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type PerfilGlucosa = 'equilibrada' | 'pronunciada' | 'plana';
type PasoAnimacion = 0 | 1 | 2;

interface DatosIG {
  alimento: string;
  ig: number;
  categoria: 'bajo' | 'medio' | 'alto';
}

// ─────────────────────────────────────────────
// Datos de glucosa
// ─────────────────────────────────────────────

const HORAS_DIA = [
  '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
  '22:00', '23:00', '24:00',
];

const DATOS_PERFILES: Record<PerfilGlucosa, number[]> = {
  equilibrada: [85, 88, 130, 115, 95, 90, 88, 145, 130, 110, 95, 90, 88, 135, 120, 100, 90],
  pronunciada: [95, 98, 175, 165, 145, 125, 110, 195, 180, 160, 135, 115, 105, 180, 165, 145, 120],
  plana: [85, 86, 105, 100, 95, 90, 88, 115, 108, 100, 92, 88, 87, 110, 105, 97, 88],
};

const COLORES_PERFIL: Record<PerfilGlucosa, { border: string; bg: string }> = {
  equilibrada: { border: '#2E86AB', bg: 'rgba(46,134,171,0.15)' },
  pronunciada: { border: '#E07B39', bg: 'rgba(224,123,57,0.15)' },
  plana: { border: '#48A9A6', bg: 'rgba(72,169,166,0.15)' },
};

const INFO_PERFILES: Record<PerfilGlucosa, { etiqueta: string; descripcion: string }> = {
  equilibrada: {
    etiqueta: 'Perfil A — Respuesta equilibrada',
    descripcion: 'Picos moderados tras las comidas con retorno relativamente rápido a valores basales.',
  },
  pronunciada: {
    etiqueta: 'Perfil B — Picos pronunciados',
    descripcion: 'Subidas más altas y recuperación más lenta. Refleja una respuesta glucémica más intensa.',
  },
  plana: {
    etiqueta: 'Perfil C — Línea muy plana',
    descripcion: 'Glucosa casi constante a lo largo del día, con variaciones mínimas tras las comidas.',
  },
};

// ─────────────────────────────────────────────
// Datos de índice glucémico
// ─────────────────────────────────────────────

const ALIMENTOS_IG: DatosIG[] = [
  { alimento: 'Lentejas', ig: 32, categoria: 'bajo' },
  { alimento: 'Manzana', ig: 36, categoria: 'bajo' },
  { alimento: 'Yogur natural', ig: 36, categoria: 'bajo' },
  { alimento: 'Pasta integral al dente', ig: 42, categoria: 'bajo' },
  { alimento: 'Arroz integral', ig: 55, categoria: 'medio' },
  { alimento: 'Plátano maduro', ig: 58, categoria: 'medio' },
  { alimento: 'Pan integral', ig: 65, categoria: 'medio' },
  { alimento: 'Arroz blanco', ig: 73, categoria: 'alto' },
  { alimento: 'Sandía', ig: 72, categoria: 'alto' },
  { alimento: 'Pan blanco', ig: 75, categoria: 'alto' },
  { alimento: 'Corn flakes', ig: 81, categoria: 'alto' },
  { alimento: 'Baguette', ig: 95, categoria: 'alto' },
];

// ─────────────────────────────────────────────
// Pasos de la animación celular
// ─────────────────────────────────────────────

const PASOS_ANIMACION: { titulo: string; texto: string }[] = [
  {
    titulo: 'Glucosa en sangre',
    texto: 'Después de comer, la glucosa pasa al torrente sanguíneo. Los niveles de glucosa en sangre suben.',
  },
  {
    titulo: 'El páncreas libera insulina',
    texto: 'El páncreas detecta la subida y libera insulina — la "llave" que abre las células a la glucosa.',
  },
  {
    titulo: 'La insulina abre la puerta',
    texto: 'La insulina se une a receptores en la célula, permitiendo que la glucosa entre y sea utilizada como energía o almacenada.',
  },
];

// ─────────────────────────────────────────────
// Componente SVG por paso
// ─────────────────────────────────────────────

function SvgPaso({ paso }: { paso: PasoAnimacion }) {
  if (paso === 0) {
    return (
      <svg viewBox="0 0 300 140" className={styles.svgCelula} aria-label="Glucosa en el torrente sanguíneo">
        {/* Vaso sanguíneo */}
        <rect x="10" y="50" width="280" height="60" rx="30" fill="#FFEAEA" stroke="#E07B39" strokeWidth="2" />
        <text x="150" y="38" textAnchor="middle" fontSize="11" fill="#666">Torrente sanguíneo</text>
        {/* Círculos glucosa */}
        {[40, 80, 120, 160, 200, 240].map((cx, i) => (
          <circle key={i} cx={cx} cy="80" r="12" fill="#2E86AB" opacity="0.85" />
        ))}
        <text x="150" y="125" textAnchor="middle" fontSize="10" fill="#666">Glucosa (círculos azules)</text>
      </svg>
    );
  }

  if (paso === 1) {
    return (
      <svg viewBox="0 0 300 160" className={styles.svgCelula} aria-label="Páncreas liberando insulina">
        {/* Vaso sanguíneo */}
        <rect x="10" y="70" width="280" height="50" rx="25" fill="#FFEAEA" stroke="#E07B39" strokeWidth="2" />
        {/* Glucosa */}
        {[40, 100, 160, 220].map((cx, i) => (
          <circle key={i} cx={cx} cy="95" r="10" fill="#2E86AB" opacity="0.8" />
        ))}
        {/* Páncreas */}
        <ellipse cx="150" cy="22" rx="50" ry="16" fill="#48A9A6" opacity="0.9" />
        <text x="150" y="26" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Páncreas</text>
        {/* Flecha */}
        <line x1="150" y1="38" x2="150" y2="62" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4,2" />
        <polygon points="145,60 155,60 150,70" fill="#F59E0B" />
        {/* Insulina */}
        <circle cx="150" cy="52" r="9" fill="#F59E0B" opacity="0.95" />
        <text x="150" y="56" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">I</text>
        <text x="150" y="148" textAnchor="middle" fontSize="10" fill="#666">Insulina (círculo dorado) viajando al torrente</text>
      </svg>
    );
  }

  // paso === 2
  return (
    <svg viewBox="0 0 300 160" className={styles.svgCelula} aria-label="Insulina abriendo la puerta de la célula">
      {/* Vaso sanguíneo */}
      <rect x="10" y="20" width="120" height="45" rx="22" fill="#FFEAEA" stroke="#E07B39" strokeWidth="2" />
      {/* Glucosa entrando */}
      {[30, 65, 100].map((cx, i) => (
        <circle key={i} cx={cx} cy="43" r="9" fill="#2E86AB" opacity="0.8" />
      ))}
      {/* Flecha hacia célula */}
      <line x1="130" y1="43" x2="158" y2="43" stroke="#2E86AB" strokeWidth="2" />
      <polygon points="155,38 165,43 155,48" fill="#2E86AB" />
      {/* Célula */}
      <rect x="165" y="15" width="110" height="110" rx="12" fill="#E8F5E9" stroke="#48A9A6" strokeWidth="2.5" />
      <text x="220" y="11" textAnchor="middle" fontSize="10" fill="#666">Célula</text>
      {/* Puerta abierta */}
      <rect x="160" y="30" width="12" height="40" rx="2" fill="#48A9A6" opacity="0.7" transform="rotate(-60 160 50)" />
      {/* Receptor + insulina */}
      <circle cx="166" cy="43" r="8" fill="#F59E0B" opacity="0.9" />
      <text x="166" y="47" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">I</text>
      {/* Glucosa dentro */}
      {[195, 225, 255].map((cx, i) => (
        <circle key={i} cx={cx} cy="70" r="9" fill="#2E86AB" opacity="0.7" />
      ))}
      <text x="150" y="148" textAnchor="middle" fontSize="10" fill="#666">La glucosa entra en la célula</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorInsulinaGlucosa() {
  const [perfilActivo, setPerfilActivo] = useState<PerfilGlucosa>('equilibrada');
  const [pasoActual, setPasoActual] = useState<PasoAnimacion>(0);
  const [filtroCatIG, setFiltroCatIG] = useState<'todos' | 'bajo' | 'medio' | 'alto'>('todos');
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const relatedApps = getRelatedApps('visualizador-insulina-glucosa');

  // Datos del gráfico
  const datosGrafico = {
    labels: HORAS_DIA,
    datasets: [
      {
        label: INFO_PERFILES[perfilActivo].etiqueta,
        data: DATOS_PERFILES[perfilActivo],
        borderColor: COLORES_PERFIL[perfilActivo].border,
        backgroundColor: COLORES_PERFIL[perfilActivo].bg,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      // Banda referencia ayunas — fondo verde suave
      {
        label: 'Referencia en ayunas (70-100 mg/dL)',
        data: HORAS_DIA.map(() => 100),
        borderColor: 'rgba(72,200,100,0.5)',
        backgroundColor: 'rgba(72,200,100,0.1)',
        borderDash: [6, 3],
        fill: {
          target: { value: 70 },
          above: 'rgba(72,200,100,0.08)',
          below: 'transparent',
        },
        pointRadius: 0,
        tension: 0,
      } as unknown as import('chart.js').ChartDataset<'line'>,
    ],
  };

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'line'>) =>
            `${ctx.dataset.label}: ${ctx.parsed.y} mg/dL`,
        },
      },
    },
    scales: {
      y: {
        min: 60,
        max: 220,
        title: { display: true, text: 'Glucosa (mg/dL)', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        title: { display: true, text: 'Hora del día', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  // Alimentos filtrados
  const alimentosMostrados = filtroCatIG === 'todos'
    ? ALIMENTOS_IG
    : ALIMENTOS_IG.filter(a => a.categoria === filtroCatIG);

  const etiquetaCat: Record<string, string> = {
    bajo: 'IG Bajo (< 55)',
    medio: 'IG Medio (55-70)',
    alto: 'IG Alto (> 70)',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🩸</span>
        <h1>Insulina y Glucosa</h1>
        <p>Cómo regula tu cuerpo el azúcar en sangre — fisiología explicada visualmente</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
      />

      {/* ── BLOQUE 1: Curva de glucosa ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">📈</span> La curva de glucosa a lo largo del día
        </h2>
        <p className={styles.sectionDesc}>
          Ejemplo ilustrativo de cómo varía la glucosa en sangre según diferentes perfiles metabólicos.
          Los datos son ficticios y tienen únicamente fines educativos.
        </p>

        <div className={styles.selectorPerfil} role="group" aria-label="Seleccionar perfil de glucosa">
          {(Object.keys(DATOS_PERFILES) as PerfilGlucosa[]).map(perfil => (
            <button
              key={perfil}
              type="button"
              className={`${styles.btnPerfil} ${perfilActivo === perfil ? styles.btnPerfilActivo : ''}`}
              onClick={() => setPerfilActivo(perfil)}
              aria-pressed={perfilActivo === perfil}
            >
              {INFO_PERFILES[perfil].etiqueta.split('—')[0].trim()}
            </button>
          ))}
        </div>

        <p className={styles.perfilDesc}>{INFO_PERFILES[perfilActivo].descripcion}</p>

        <div className={styles.marcadoresComidas} aria-hidden="true">
          <span>🍳 Desayuno 8:30</span>
          <span>🥗 Almuerzo 14:00</span>
          <span>🍽️ Cena 20:30</span>
        </div>

        <div className={styles.chartContainer}>
          {montado && <Line data={datosGrafico} options={opcionesGrafico} />}
        </div>

        <p className={styles.notaGrafico} role="note">
          Datos ilustrativos. Los valores reales varían enormemente entre personas y contextos.
        </p>
      </section>

      {/* ── BLOQUE 2: Animación celular ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">🔬</span> Cómo actúa la insulina en las células
        </h2>
        <p className={styles.sectionDesc}>
          Mecanismo simplificado en 3 pasos. Usa los botones para avanzar o retroceder.
        </p>

        <div className={styles.animacionCelular}>
          <div className={styles.stepIndicatorContainer} aria-label={`Paso ${pasoActual + 1} de 3`}>
            {PASOS_ANIMACION.map((_, i) => (
              <div
                key={i}
                className={`${styles.stepDot} ${pasoActual === i ? styles.stepDotActivo : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>

          <h3 className={styles.stepTitulo}>{PASOS_ANIMACION[pasoActual].titulo}</h3>

          <SvgPaso paso={pasoActual} />

          <p className={styles.stepTexto}>{PASOS_ANIMACION[pasoActual].texto}</p>

          <div className={styles.stepBotones}>
            <button
              type="button"
              className={styles.btnNav}
              onClick={() => setPasoActual(p => (Math.max(0, p - 1) as PasoAnimacion))}
              disabled={pasoActual === 0}
              aria-label="Paso anterior"
            >
              ← Anterior
            </button>
            <span className={styles.stepCounter}>{pasoActual + 1} / {PASOS_ANIMACION.length}</span>
            <button
              type="button"
              className={styles.btnNav}
              onClick={() => setPasoActual(p => (Math.min(2, p + 1) as PasoAnimacion))}
              disabled={pasoActual === 2}
              aria-label="Siguiente paso"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      {/* ── BLOQUE 3: Índice glucémico ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">🥦</span> Índice glucémico: ¿qué es?
        </h2>
        <p className={styles.sectionDesc}>
          El IG mide la velocidad a la que un alimento eleva la glucosa, comparado con glucosa pura (IG&nbsp;=&nbsp;100).
          Un IG bajo no significa que el alimento sea siempre mejor — la cantidad también importa (carga glucémica).
        </p>

        <div className={styles.filtroIG} role="group" aria-label="Filtrar por categoría de IG">
          {(['todos', 'bajo', 'medio', 'alto'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              className={`${styles.btnFiltroIG} ${filtroCatIG === cat ? styles.btnFiltroIGActivo : ''} ${styles[`btnFiltro_${cat}`]}`}
              onClick={() => setFiltroCatIG(cat)}
              aria-pressed={filtroCatIG === cat}
            >
              {cat === 'todos' ? 'Todos' : etiquetaCat[cat]}
            </button>
          ))}
        </div>

        <div className={styles.tablaIG} role="table" aria-label="Índice glucémico de alimentos">
          <div className={styles.tablaIGHeader} role="row">
            <span role="columnheader">Alimento</span>
            <span role="columnheader">IG</span>
            <span role="columnheader">Nivel</span>
          </div>
          {alimentosMostrados.map(item => (
            <div key={item.alimento} className={styles.tablaIGFila} role="row">
              <span className={styles.nombreAlimento} role="cell">{item.alimento}</span>
              <span className={styles.valorIG} role="cell">{item.ig}</span>
              <div className={styles.barraIGWrapper} role="cell" aria-label={`IG ${item.ig}`}>
                <div
                  className={`${styles.barraIG} ${styles[`barraIG_${item.categoria}`]}`}
                  style={{ width: `${item.ig}%` }}
                  role="presentation"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOQUE 4: Resistencia a la insulina ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">🔑</span> Resistencia a la insulina: el mecanismo
        </h2>
        <p className={styles.sectionDesc}>
          Comparativa del mecanismo fisiológico entre sensibilidad normal y resistencia insulínica.
        </p>

        <div className={styles.comparativaResistencia}>
          <div className={styles.columnaComparativa}>
            <div className={styles.columnaHeader + ' ' + styles.columnaHeaderOk}>
              <span aria-hidden="true">✅</span>
              <h3>Sensibilidad normal</h3>
            </div>
            <ul className={styles.listaComparativa}>
              <li>La insulina (llave) encaja perfectamente en el receptor (cerradura)</li>
              <li>La célula abre la puerta con poca insulina</li>
              <li>La glucosa entra rápidamente en la célula</li>
              <li>El páncreas necesita producir poca insulina para mantener el equilibrio</li>
            </ul>
          </div>

          <div className={styles.columnaComparativa}>
            <div className={styles.columnaHeader + ' ' + styles.columnaHeaderAlert}>
              <span aria-hidden="true">⚠️</span>
              <h3>Resistencia insulínica (mecanismo)</h3>
            </div>
            <ul className={styles.listaComparativa}>
              <li>El receptor responde mal a la insulina</li>
              <li>La célula necesita más insulina para abrir la puerta</li>
              <li>El páncreas trabaja más para compensar</li>
              <li>Con el tiempo, puede agotarse la capacidad productora del páncreas</li>
            </ul>
          </div>
        </div>

        <p className={styles.textoResistencia}>
          La resistencia a la insulina es un mecanismo fisiológico que puede evolucionar de formas muy distintas
          según cada persona. Su estudio y seguimiento corresponde siempre a profesionales de la salud.
        </p>
      </section>

      {/* ── CONTENIDO EDUCATIVO ── */}
      <EducationalSection title="¿Quieres entender más? Conceptos clave de fisiología" subtitle="Insulina, glucosa y metabolismo del azúcar">
        <div className={styles.educContent}>
          <h3>¿Qué es la glucosa y por qué la necesitamos?</h3>
          <p>
            La glucosa es el combustible principal de las células del cuerpo, especialmente del cerebro y los
            músculos. Proviene de la digestión de carbohidratos (pan, arroz, fruta…) y circula por la sangre
            para llegar a todos los tejidos. Sin glucosa, el cerebro no puede funcionar con normalidad.
          </p>

          <h3>Insulina vs glucagón: el sistema de doble regulación</h3>
          <p>
            El páncreas produce dos hormonas con efectos opuestos:
          </p>
          <ul>
            <li><strong>Insulina</strong>: se libera cuando la glucosa sube. Indica a las células que absorban glucosa (bajando el nivel en sangre).</li>
            <li><strong>Glucagón</strong>: se libera cuando la glucosa baja (ayuno, ejercicio intenso). Indica al hígado que libere glucosa almacenada (glucógeno) al torrente sanguíneo.</li>
          </ul>
          <p>
            Este sistema de doble control mantiene la glucosa en un rango estrecho durante todo el día.
          </p>

          <h3>Diferencia fisiológica entre diabetes tipo 1 y tipo 2</h3>
          <p>
            A nivel de mecanismo (no de diagnóstico clínico):
          </p>
          <ul>
            <li><strong>Tipo 1</strong>: el sistema inmune destruye las células beta del páncreas, que son las productoras de insulina. El organismo no puede fabricar insulina por sí mismo.</li>
            <li><strong>Tipo 2</strong>: el páncreas produce insulina, pero las células desarrollan resistencia a su señal. Con el tiempo, el páncreas puede agotarse y producir cada vez menos.</li>
          </ul>
          <p>
            Ambas condiciones son complejas y requieren seguimiento médico especializado.
          </p>

          <h3>¿Qué es la hemoglobina glicosilada (HbA1c)?</h3>
          <p>
            La hemoglobina A1c es una proteína de los glóbulos rojos que se combina con la glucosa. Cuanta más
            glucosa hay en la sangre durante un período prolongado, más hemoglobina se glicosilará. Por eso,
            medir la HbA1c proporciona una "fotografía" del nivel medio de glucosa durante los últimos 2-3 meses,
            independientemente de las fluctuaciones diarias.
          </p>

          <h3>El papel del hígado en la regulación de la glucosa</h3>
          <p>
            El hígado actúa como "banco de glucosa" del cuerpo:
          </p>
          <ul>
            <li>Cuando hay exceso de glucosa (tras las comidas), el hígado la almacena en forma de glucógeno.</li>
            <li>Cuando la glucosa baja (ayuno, entre comidas), el hígado libera glucógeno de vuelta al torrente sanguíneo.</li>
            <li>En situaciones extremas, el hígado puede fabricar glucosa nueva a partir de aminoácidos (gluconeogénesis).</li>
          </ul>

          <div className={styles.warningBox} role="note">
            <strong>Nota importante</strong>: Esta app explica mecanismos fisiológicos con fines educativos.
            No ofrece diagnósticos ni recomendaciones médicas. Consulta siempre con tu médico sobre tu salud.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-insulina-glucosa" />
      <Footer appName="visualizador-insulina-glucosa" />
    </div>
  );
}
