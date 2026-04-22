'use client';
// @disclaimer: exempt — educativo puro, sin consejo médico ni diagnóstico
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from './VisualizadorTestosterona.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard, EducationalSection } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ── Tipos ──────────────────────────────────────────────────────────────────

type Genero = 'hombre' | 'mujer';

interface SistemaCard {
  icono: string;
  titulo: string;
  descripcion: string;
}

interface ModuladorCard {
  icono: string;
  factor: string;
  efecto: '↑' | '↓' | '⚖️';
  descripcion: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────

const ETIQUETAS_VIDA = [
  'Fetal\n(sem. 8-16)',
  'Nacimiento',
  'Infancia\n(2-8 a)',
  'Pubertad\ntemprana',
  'Pubertad\nplena',
  'Adulto\njoven (20-25)',
  'Adulto\n30',
  'Adulto\n40',
  'Adulto\n50',
  'Adulto\n60',
  'Adulto\n70',
  'Adulto\n80+',
];

const VALORES_VIDA = [60, 30, 10, 30, 80, 100, 95, 85, 72, 58, 45, 35];

const SISTEMAS: SistemaCard[] = [
  {
    icono: '💪',
    titulo: 'Músculo',
    descripcion:
      'La testosterona activa la síntesis proteica muscular vía receptores androgénicos en miocitos y estimula la secreción de IGF-1. Es el principal determinante de la diferencia de masa muscular entre sexos biológicos.',
  },
  {
    icono: '🦴',
    titulo: 'Hueso',
    descripcion:
      'Estimula los osteoblastos y frena la resorción ósea. El déficit prolongado aumenta el riesgo de osteoporosis también en hombres.',
  },
  {
    icono: '❤️',
    titulo: 'Sistema cardiovascular',
    descripcion:
      'Tiene efectos complejos: puede aumentar la producción de hematíes (por eso la eritropoyesis es mayor en hombres). A niveles fisiológicos, parece tener efecto vasodilatador.',
  },
  {
    icono: '🧠',
    titulo: 'Cognición y humor',
    descripcion:
      'Influye en la motivación, la concentración y el humor. La deficiencia se asocia a mayor irritabilidad y niebla cognitiva (mecanismo aún en investigación).',
  },
  {
    icono: '🔬',
    titulo: 'Libido',
    descripcion:
      'Es el principal modulador de la libido en ambos sexos. Los receptores androgénicos en el sistema límbico median este efecto.',
  },
  {
    icono: '🩺',
    titulo: 'Metabolismo',
    descripcion:
      'Favorece la distribución de grasa visceral vs subcutánea. Niveles bajos se asocian a mayor acumulación abdominal.',
  },
  {
    icono: '🩸',
    titulo: 'Hematopoyesis',
    descripcion:
      'Estimula la producción de eritropoyetina renal, aumentando la masa de glóbulos rojos. Razón de la diferencia en hemoglobina entre hombres y mujeres.',
  },
  {
    icono: '🌙',
    titulo: 'Sueño',
    descripcion:
      'La mayor parte de la producción diaria de testosterona ocurre durante el sueño profundo (fase N3). El sueño insuficiente reduce significativamente la producción.',
  },
];

const MODULADORES: ModuladorCard[] = [
  {
    icono: '😴',
    factor: 'Sueño de calidad',
    efecto: '↑',
    descripcion: 'El sueño profundo es el principal estímulo de producción diaria.',
  },
  {
    icono: '🏋️',
    factor: 'Ejercicio de fuerza',
    efecto: '↑',
    descripcion: 'Estímulo agudo y adaptación crónica documentados.',
  },
  {
    icono: '⚖️',
    factor: 'Peso corporal saludable',
    efecto: '↑',
    descripcion: 'El exceso de grasa convierte testosterona en estrógenos vía aromatasa.',
  },
  {
    icono: '🌿',
    factor: 'Zinc en la dieta',
    efecto: '↑',
    descripcion: 'Cofactor necesario para la síntesis de testosterona.',
  },
  {
    icono: '☀️',
    factor: 'Vitamina D',
    efecto: '↑',
    descripcion: 'Correlación positiva documentada con niveles de testosterona.',
  },
  {
    icono: '😰',
    factor: 'Estrés crónico',
    efecto: '↓',
    descripcion: 'El cortisol elevado inhibe el eje HPG (hipotálamo-hipófisis-gónadas).',
  },
  {
    icono: '🍺',
    factor: 'Alcohol en exceso',
    efecto: '↓',
    descripcion: 'Inhibe la producción en las células de Leydig.',
  },
  {
    icono: '🚬',
    factor: 'Tabaco',
    efecto: '⚖️',
    descripcion:
      'Efecto complejo: puede elevar a corto plazo, pero daña tejido testicular a largo plazo.',
  },
  {
    icono: '📱',
    factor: 'Privación de sueño',
    efecto: '↓',
    descripcion: 'Reducción documentada del 10-15 % con una semana de sueño insuficiente.',
  },
  {
    icono: '🏃',
    factor: 'Sobreentrenamiento',
    efecto: '↓',
    descripcion:
      'El ejercicio excesivo sin recuperación eleva cortisol y suprime testosterona.',
  },
];

// ── Componente ─────────────────────────────────────────────────────────────

export default function VisualizadorTestosterona() {
  const [genero, setGenero] = useState<Genero>('hombre');
  const [sistemaExpandido, setSistemaExpandido] = useState<number | null>(null);

  const toggleSistema = (idx: number) => {
    setSistemaExpandido(prev => (prev === idx ? null : idx));
  };

  const chartData = {
    labels: ETIQUETAS_VIDA,
    datasets: [
      {
        label: 'Nivel relativo de testosterona (escala 0-100)',
        data: VALORES_VIDA,
        borderColor: '#2E86AB',
        backgroundColor: 'rgba(46, 134, 171, 0.12)',
        pointBackgroundColor: '#2E86AB',
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => {
            const val = ctx.parsed.y;
            const etiquetas: Record<number, string> = {
              60: 'Pico fetal: diferenciación sexual',
              100: 'Pico vital: 20-25 años',
              30: 'Pubertad: desarrollo de características secundarias',
            };
            return etiquetas[val] ?? `Nivel relativo: ${val}/100`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 110,
        title: {
          display: true,
          text: 'Nivel relativo (0-100)',
          color: '#666666',
        },
        ticks: { color: '#666666' },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        ticks: {
          color: '#666666',
          maxRotation: 45,
          font: { size: 10 },
        },
        grid: { display: false },
      },
    },
  } as never;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1>Testosterona: La Hormona del Rendimiento</h1>
        <p>Cómo se produce, para qué sirve y qué la influye — en hombres y en mujeres</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <DisclaimerCard variant="medical" severity="low" collapsible={true} />

        {/* Bloque 1 — ¿Quién produce testosterona? */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>¿Quién Produce Testosterona?</h2>
          <p className={styles.subtituloSeccion}>
            La testosterona no es una hormona exclusivamente masculina. Todos los organismos la producen, aunque en cantidades muy distintas.
          </p>

          {/* Toggle */}
          <div className={styles.toggleGenero} role="group" aria-label="Seleccionar sexo biológico">
            <button
              className={`${styles.btnGenero} ${genero === 'hombre' ? styles.btnGeneroActivo : ''}`}
              onClick={() => setGenero('hombre')}
              aria-pressed={genero === 'hombre'}
            >
              Hombre
            </button>
            <button
              className={`${styles.btnGenero} ${genero === 'mujer' ? styles.btnGeneroActivo : ''}`}
              onClick={() => setGenero('mujer')}
              aria-pressed={genero === 'mujer'}
            >
              Mujer
            </button>
          </div>

          {/* Panel hombre */}
          {genero === 'hombre' && (
            <div className={styles.panelGenero} role="region" aria-label="Producción en hombres">
              <div className={styles.panelIcono} aria-hidden="true">♂️</div>
              <div className={styles.panelInfo}>
                <div className={styles.panelFila}>
                  <strong>Origen principal:</strong>
                  <span>~95 % en los testículos (células de Leydig) + ~5 % en glándulas suprarrenales</span>
                </div>
                <div className={styles.panelFila}>
                  <strong>Producción diaria orientativa:</strong>
                  <span>5-7 mg/día (valor educativo, variabilidad individual elevada)</span>
                </div>
                <div className={styles.panelFila}>
                  <strong>Regulación:</strong>
                  <span>Hipotálamo (GnRH) → Hipófisis (LH) → Testículos → Testosterona → Feedback negativo</span>
                </div>
              </div>
            </div>
          )}

          {/* Panel mujer */}
          {genero === 'mujer' && (
            <div className={styles.panelGenero} role="region" aria-label="Producción en mujeres">
              <div className={styles.panelIcono} aria-hidden="true">♀️</div>
              <div className={styles.panelInfo}>
                <div className={styles.panelFila}>
                  <strong>Origen:</strong>
                  <span>Ovarios (~25 %) + glándulas suprarrenales (~25 %) + conversión periférica de andrógenos (~50 %)</span>
                </div>
                <div className={styles.panelFila}>
                  <strong>Nivel relativo:</strong>
                  <span>~10-15 veces menor que en hombres, pero fisiológicamente esencial</span>
                </div>
                <div className={styles.panelFila}>
                  <strong>Roles en mujeres:</strong>
                  <span>Libido, masa muscular, densidad ósea, energía y estado de ánimo</span>
                </div>
              </div>
            </div>
          )}

          {/* Diagrama eje HPG */}
          <h3 className={styles.tituloEje}>Eje HPG (Hipotálamo-Hipófisis-Gónadas)</h3>
          <div className={styles.ejeHPG} role="img" aria-label="Diagrama del eje hipotálamo-hipófisis-gónadas">
            <div className={`${styles.nivelEje} ${styles.nivelHipotalamo}`}>
              <span className={styles.nivelIcono} aria-hidden="true">🧠</span>
              <strong>Hipotálamo</strong>
              <span className={styles.nivelDesc}>Libera GnRH (hormona liberadora de gonadotropinas)</span>
            </div>
            <div className={styles.flechaEje} aria-hidden="true">↓</div>
            <div className={`${styles.nivelEje} ${styles.nivelHipofisis}`}>
              <span className={styles.nivelIcono} aria-hidden="true">🎯</span>
              <strong>Hipófisis</strong>
              <span className={styles.nivelDesc}>Libera LH y FSH (gonadotropinas)</span>
            </div>
            <div className={styles.flechaEje} aria-hidden="true">↓</div>
            <div className={`${styles.nivelEje} ${styles.nivelGonadas}`}>
              <span className={styles.nivelIcono} aria-hidden="true">⚗️</span>
              <strong>Gónadas</strong>
              <span className={styles.nivelDesc}>Producen testosterona (y estradiol)</span>
            </div>
            <div className={styles.feedbackTag} aria-label="Feedback negativo: la testosterona frena al hipotálamo y la hipófisis">
              ↺ Feedback negativo: la testosterona frena al hipotálamo y la hipófisis
            </div>
          </div>
        </section>

        {/* Bloque 2 — Testosterona a lo largo de la vida */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Testosterona a lo Largo de la Vida</h2>
          <p className={styles.subtituloSeccion}>
            Evolución ilustrativa de los niveles de testosterona masculina desde la etapa fetal hasta la vejez (escala normalizada 0-100).
          </p>
          <div className={styles.chartContainer}>
            <Line data={chartData} options={chartOptions} />
          </div>
          <p className={styles.notaGrafico}>
            Curva ilustrativa. Los valores individuales varían enormemente — el gráfico muestra la tendencia media poblacional, no valores diagnósticos. El declive a partir de los 30 es gradual: ~1-2 % anual.
          </p>
        </section>

        {/* Bloque 3 — Efectos en el cuerpo */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Efectos de la Testosterona en el Cuerpo</h2>
          <p className={styles.subtituloSeccion}>
            Pulsa cada sistema para ver el mecanismo fisiológico implicado.
          </p>
          <div className={styles.gridSistemas}>
            {SISTEMAS.map((s, idx) => (
              <button
                key={idx}
                className={`${styles.sistemaCard} ${sistemaExpandido === idx ? styles.sistemaCardActivo : ''}`}
                onClick={() => toggleSistema(idx)}
                aria-expanded={sistemaExpandido === idx}
              >
                <span className={styles.sistemaIcono} aria-hidden="true">{s.icono}</span>
                <span className={styles.sistemaTitulo}>{s.titulo}</span>
                {sistemaExpandido === idx && (
                  <p className={styles.sistemaDesc}>{s.descripcion}</p>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Bloque 4 — Factores moduladores */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Factores que Influyen en los Niveles</h2>
          <p className={styles.subtituloSeccion}>
            Factores fisiológicos con evidencia en investigación. <span className={styles.badge} style={{ background: '#e8f5e9', color: '#2e7d32' }}>↑</span> favorece la producción &nbsp;
            <span className={styles.badge} style={{ background: '#ffebee', color: '#c62828' }}>↓</span> la reduce &nbsp;
            <span className={styles.badge} style={{ background: '#fff8e1', color: '#e65100' }}>⚖️</span> efecto complejo
          </p>
          <div className={styles.gridModuladores}>
            {MODULADORES.map((m, idx) => (
              <div key={idx} className={styles.moduladorCard}>
                <span className={styles.moduladorIcono} aria-hidden="true">{m.icono}</span>
                <div className={styles.moduladorCuerpo}>
                  <span className={styles.moduladorFactor}>{m.factor}</span>
                  <span
                    className={`${styles.badge} ${
                      m.efecto === '↑'
                        ? styles.badgeUp
                        : m.efecto === '↓'
                        ? styles.badgeDown
                        : styles.badgeMix
                    }`}
                    aria-label={
                      m.efecto === '↑'
                        ? 'Favorece la producción'
                        : m.efecto === '↓'
                        ? 'Reduce la producción'
                        : 'Efecto complejo'
                    }
                  >
                    {m.efecto}
                  </span>
                  <p className={styles.moduladorDesc}>{m.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.notaModuladores}>
            Estos son factores fisiológicos con evidencia en investigación. El impacto varía enormemente entre personas. Ninguno de estos factores sustituye la valoración médica individual.
          </p>
        </section>

        {/* Educacional */}
        <EducationalSection
          title="Profundiza en la testosterona"
          subtitle="Fisiología, eje hormonal y mitos habituales"
        >
          <div className={styles.educacional}>
            <h3>¿Qué diferencia la testosterona de otros andrógenos (DHT, DHEA)?</h3>
            <p>
              La testosterona es el andrógeno más abundante, pero no actúa sola. La <strong>DHT</strong> (dihidrotestosterona) se produce a partir de la testosterona por acción de la enzima 5α-reductasa y es más potente en tejidos como la próstata o el folículo piloso. La <strong>DHEA</strong> (dehidroepiandrosterona) es un precursor producido en las suprarrenales que puede convertirse en testosterona o estrógenos según el tejido.
            </p>

            <h3>El papel de la SHBG: testosterona total vs libre</h3>
            <p>
              La mayor parte de la testosterona circula unida a proteínas transportadoras, especialmente la SHBG (globulina fijadora de hormonas sexuales). Solo la <strong>testosterona libre</strong> (~2 %) puede entrar en las células y ejercer efecto biológico. Por eso, un valor de testosterona total en una analítica no cuenta toda la historia: la SHBG modula cuánta está disponible. Esta distinción es relevante clínicamente y debe interpretarla un médico.
            </p>

            <h3>Testosterona y comportamiento agresivo: lo que dice la ciencia</h3>
            <p>
              La relación entre testosterona y agresividad es mucho más compleja que el mito popular. La investigación indica que la testosterona está más relacionada con la <em>búsqueda de estatus social</em> que con la agresión en sí. En contextos cooperativos, puede incluso favorecer comportamientos prosociales. La causalidad directa "más testosterona = más agresividad" no está respaldada por la evidencia científica actual.
            </p>

            <h3>La aromatasa: cómo la testosterona se convierte en estrógeno</h3>
            <p>
              La enzima <strong>aromatasa</strong> convierte testosterona en estradiol (un estrógeno). Este proceso ocurre principalmente en el tejido adiposo, el hígado y el cerebro. En hombres, un cierto nivel de estrógenos es fisiológicamente necesario (para la salud ósea, la libido y la función cognitiva). Cuando el tejido adiposo aumenta, la actividad de la aromatasa puede aumentar, reduciendo la testosterona disponible.
            </p>

            <h3>Ciclo circadiano de la testosterona</h3>
            <p>
              La testosterona sigue un <strong>ritmo circadiano</strong>: sus niveles son más altos por la mañana temprano (entre las 6 y las 10 h) y disminuyen a lo largo del día. Este patrón es la razón por la que las analíticas hormonales se realizan habitualmente en ayunas por la mañana: los valores son más representativos y comparables entre extracciones.
            </p>

            <div className={styles.warningBox} role="note">
              <strong>Nota educativa:</strong> Esta app explica la fisiología de la testosterona con fines educativos. Los niveles hormonales son muy individuales y su interpretación corresponde al médico.
            </div>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-testosterona')} />
        <ShareCard appName="visualizador-testosterona" />
      </main>

      <Footer appName="visualizador-testosterona" />
    </div>
  );
}
