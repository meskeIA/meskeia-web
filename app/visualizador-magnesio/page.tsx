'use client';

import { useState } from 'react';
import styles from './VisualizadorMagnesio.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { PolarArea, Bar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

interface CategoriaReaccion {
  id: string;
  nombre: string;
  valor: number;
  descripcion: string;
  ejemplo: string;
  color: string;
}

const CATEGORIAS_REACCIONES: CategoriaReaccion[] = [
  {
    id: 'atp',
    nombre: 'Síntesis de ATP',
    valor: 95,
    descripcion:
      'El Mg2+ es imprescindible para que el ATP funcione. La forma biológicamente activa no es ATP libre, sino el complejo Mg-ATP. Las ATPasas, quinasas y la ATP sintasa mitocondrial requieren Mg como cofactor.',
    ejemplo: 'Toda contracción muscular, síntesis de proteínas y transporte activo consume Mg-ATP.',
    color: 'rgba(46, 134, 171, 0.8)',
  },
  {
    id: 'adn',
    nombre: 'Síntesis de ADN/ARN',
    valor: 75,
    descripcion:
      'Las ADN y ARN polimerasas necesitan Mg2+ para catalizar la adición de nucleótidos. El Mg estabiliza los sustratos y los intermediarios de reacción.',
    ejemplo: 'Sin Mg suficiente, la replicación y reparación del ADN se ralentiza — implicaciones en envejecimiento celular.',
    color: 'rgba(72, 169, 166, 0.8)',
  },
  {
    id: 'proteinas',
    nombre: 'Síntesis de proteínas',
    valor: 65,
    descripcion:
      'Los ribosomas requieren Mg2+ para mantener su estructura cuaternaria estable. El Mg "ensambla" las subunidades ribosomales 30S y 50S (procariotas) / 40S y 60S (eucariotas).',
    ejemplo: 'Un déficit de Mg puede ralentizar la traducción de proteínas, afectando la regeneración muscular y la síntesis de enzimas.',
    color: 'rgba(127, 179, 211, 0.8)',
  },
  {
    id: 'señalizacion',
    nombre: 'Señalización celular',
    valor: 60,
    descripcion:
      'El Mg2+ actúa como segundo mensajero y modula adenilato ciclasa, fosfolipasa C y proteín quinasas. Regula la sensibilidad del receptor a la insulina.',
    ejemplo: 'La resistencia a la insulina se asocia con déficit intracelular de Mg — mecanismo de diabetes tipo 2.',
    color: 'rgba(46, 134, 171, 0.6)',
  },
  {
    id: 'muscular',
    nombre: 'Función muscular',
    valor: 80,
    descripcion:
      'El Mg2+ compite con el Ca2+ en los canales y en los sitios de unión de la troponina, regulando la contracción. Activa la bomba Ca-ATPasa que extrae Ca del citoplasma para la relajación.',
    ejemplo: 'Los calambres nocturnos, el bruxismo y las fasciculaciones son síntomas clásicos de déficit de Mg.',
    color: 'rgba(72, 169, 166, 0.6)',
  },
  {
    id: 'osea',
    nombre: 'Homeostasis ósea',
    valor: 55,
    descripcion:
      'El 60-65% del Mg corporal está en los huesos, incorporado en la matriz de hidroxiapatita. El Mg modula la actividad de osteoblastos y osteoclastos, e influye en el metabolismo de vitamina D y PTH.',
    ejemplo: 'Déficit crónico de Mg → mayor fragilidad ósea, independientemente del calcio y la vitamina D.',
    color: 'rgba(127, 179, 211, 0.6)',
  },
];

type EstadoMuscular = 'reposo' | 'contraccion' | 'relajacion' | 'deficit';

interface EstadoMuscularInfo {
  id: EstadoMuscular;
  titulo: string;
  descripcion: string;
  detalle: string;
  colorFondo: string;
}

const ESTADOS_MUSCULARES: EstadoMuscularInfo[] = [
  {
    id: 'reposo',
    titulo: 'Estado de reposo',
    descripcion: 'El Mg2+ bloquea los canales de Ca2+ en la membrana muscular',
    detalle:
      'En condiciones basales, el Mg2+ actúa como bloqueador de canales de calcio voltaje-dependientes. Esto mantiene el Ca2+ intracelular bajo (~0,1 μM) y el músculo en estado relajado. La bomba SERCA (Ca-ATPasa del retículo sarcoplásmico) también necesita Mg-ATP para funcionar.',
    colorFondo: '#2E86AB22',
  },
  {
    id: 'contraccion',
    titulo: 'Contracción muscular',
    descripcion: 'Señal nerviosa → Ca2+ entra masivamente → actina-miosina se acoplan',
    detalle:
      'Ante una señal del nervio motor, el Ca2+ se libera del retículo sarcoplásmico y entra por canales de membrana. El Ca2+ se une a la troponina C, desplaza la tropomiosina y expone los sitios de unión de la actina para la miosina. El ciclo de puentes cruzados (usando Mg-ATP) genera la contracción.',
    colorFondo: '#FF6B3522',
  },
  {
    id: 'relajacion',
    titulo: 'Relajación (con Mg suficiente)',
    descripcion: 'Ca2+ bombeado al retículo sarcoplásmico, Mg2+ vuelve a bloquear canales',
    detalle:
      'La bomba SERCA (activa con Mg-ATP) extrae el Ca2+ de vuelta al retículo sarcoplásmico. Los intercambiadores Na+/Ca2+ de la membrana ayudan. El Mg2+ vuelve a bloquear los canales. El músculo se relaja completa y suavemente. Este proceso activo requiere energía (Mg-ATP).',
    colorFondo: '#48A9A622',
  },
  {
    id: 'deficit',
    titulo: 'Sin suficiente Mg (déficit)',
    descripcion: 'Ca2+ entra sin control suficiente → espasmos, calambres, fasciculaciones',
    detalle:
      'Con déficit de Mg: los canales de Ca2+ no se bloquean correctamente → el Ca2+ entra más fácilmente y en mayor cantidad. La bomba SERCA funciona peor (necesita Mg-ATP). El Ca2+ intracelular permanece elevado → hiperexcitabilidad muscular → calambres nocturnos, bruxismo, síndrome de piernas inquietas, fasciculaciones (twitching) del párpado.',
    colorFondo: '#FF335522',
  },
];

interface SintomaDeficiencia {
  sistema: string;
  icono: string;
  sintomas: string[];
}

const SINTOMAS_DEFICIENCIA: SintomaDeficiencia[] = [
  {
    sistema: 'Sistema muscular',
    icono: '💪',
    sintomas: [
      'Calambres nocturnos en piernas y pies',
      'Bruxismo (apretar dientes al dormir)',
      'Fasciculaciones (twitching) del párpado',
      'Síndrome de piernas inquietas',
      'Rigidez muscular generalizada',
    ],
  },
  {
    sistema: 'Sistema nervioso',
    icono: '🧠',
    sintomas: [
      'Ansiedad e irritabilidad',
      'Insomnio o sueño poco reparador',
      'Migraña y cefaleas tensionales',
      'Hormigueos y parestesias',
      'Dificultad para concentrarse',
    ],
  },
  {
    sistema: 'Sistema cardiovascular',
    icono: '❤️',
    sintomas: [
      'Palpitaciones y arritmias',
      'Hipertensión arterial',
      'Espasmo de arterias coronarias',
      'Mayor riesgo de aterosclerosis',
    ],
  },
  {
    sistema: 'Metabolismo',
    icono: '⚡',
    sintomas: [
      'Fatiga crónica inexplicable',
      'Resistencia a la insulina',
      'Mayor riesgo de diabetes tipo 2',
      'Pérdida de apetito',
      'Náuseas en déficit moderado',
    ],
  },
];

interface FuenteAlimentaria {
  alimento: string;
  mg_por_100g: number;
  emoji: string;
}

const FUENTES_ALIMENTARIAS: FuenteAlimentaria[] = [
  { alimento: 'Semillas de calabaza', mg_por_100g: 592, emoji: '🎃' },
  { alimento: 'Almendras', mg_por_100g: 270, emoji: '🥜' },
  { alimento: 'Chocolate negro 70%', mg_por_100g: 228, emoji: '🍫' },
  { alimento: 'Espinacas cocidas', mg_por_100g: 157, emoji: '🥬' },
  { alimento: 'Garbanzos cocidos', mg_por_100g: 115, emoji: '🫘' },
  { alimento: 'Arroz integral cocido', mg_por_100g: 84, emoji: '🍚' },
  { alimento: 'Plátano', mg_por_100g: 27, emoji: '🍌' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMagnesio() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [estadoMuscular, setEstadoMuscular] = useState<EstadoMuscular>('reposo');
  const [sistemaAbierto, setSistemaAbierto] = useState<string | null>(null);

  const categoriaActual = CATEGORIAS_REACCIONES.find((c) => c.id === categoriaSeleccionada);
  const estadoActual = ESTADOS_MUSCULARES.find((e) => e.id === estadoMuscular)!;

  // Datos Polar Area — 300 reacciones
  const polarData = {
    labels: CATEGORIAS_REACCIONES.map((c) => c.nombre),
    datasets: [
      {
        data: CATEGORIAS_REACCIONES.map((c) => c.valor),
        backgroundColor: CATEGORIAS_REACCIONES.map((c) => c.color),
        borderColor: CATEGORIAS_REACCIONES.map((c) => c.color.replace('0.8', '1').replace('0.6', '1')),
        borderWidth: 2,
      },
    ],
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) =>
            ` ${ctx.label}: ${ctx.parsed} reacciones aprox.`,
        },
      },
    },
    onClick: (_: unknown, elements: { index: number }[]) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        const id = CATEGORIAS_REACCIONES[idx].id;
        setCategoriaSeleccionada((prev) => (prev === id ? null : id));
      }
    },
  } as never;

  // Datos Bar — fuentes alimentarias
  const barData = {
    labels: FUENTES_ALIMENTARIAS.map((f) => `${f.emoji} ${f.alimento}`),
    datasets: [
      {
        label: 'Magnesio (mg/100g)',
        data: FUENTES_ALIMENTARIAS.map((f) => f.mg_por_100g),
        backgroundColor: FUENTES_ALIMENTARIAS.map((_, i) =>
          i === 0 ? 'rgba(46, 134, 171, 0.9)' : 'rgba(72, 169, 166, 0.7)'
        ),
        borderColor: FUENTES_ALIMENTARIAS.map((_, i) =>
          i === 0 ? 'rgba(46, 134, 171, 1)' : 'rgba(72, 169, 166, 1)'
        ),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { x: number | null } }) =>
            ` ${ctx.parsed.x ?? 0} mg / 100 g`,
          afterLabel: (_ctx: unknown) => '  IDR adulto: 310–420 mg/día',
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { color: '#666' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#444', font: { size: 13 } },
      },
    },
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>⚡</div>
        <h1>El Magnesio</h1>
        <p>
          300 reacciones enzimáticas, cofactor del ATP, regulador del canal NMDA y protagonista
          oculto de calambres, migraña y ansiedad
        </p>
      </header>

      <LegalNotice />

      {/* ── Sección 1: Las 300 reacciones ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Las ~300 reacciones enzimáticas del Mg</h2>
        <p className={styles.sectionSubtitle}>
          El magnesio es cofactor de más de 300 enzimas humanas. Haz clic en cada categoría para
          saber por qué es tan imprescindible.
        </p>

        <div className={styles.reactionsWheel}>
          <div className={styles.polarChartWrap}>
            <PolarArea data={polarData} options={polarOptions} />
            <p className={styles.chartHint}>Haz clic en un sector para ver detalles</p>
          </div>

          <div className={styles.categoryLegend}>
            {CATEGORIAS_REACCIONES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.categoryBtn} ${categoriaSeleccionada === cat.id ? styles.categoryBtnActive : ''}`}
                onClick={() => setCategoriaSeleccionada((prev) => (prev === cat.id ? null : cat.id))}
                style={{ borderLeftColor: cat.color }}
                aria-pressed={categoriaSeleccionada === cat.id}
              >
                <span className={styles.categoryName}>{cat.nombre}</span>
                <span className={styles.categoryValue}>{cat.valor} rxns</span>
              </button>
            ))}
          </div>
        </div>

        {categoriaActual && (
          <div className={styles.categoryDetail} role="region" aria-live="polite">
            <h3>{categoriaActual.nombre}</h3>
            <p>{categoriaActual.descripcion}</p>
            <div className={styles.warningBox}>
              <strong>Ejemplo clave:</strong> {categoriaActual.ejemplo}
            </div>
          </div>
        )}
      </section>

      {/* ── Sección 2: Equilibrio Ca/Mg en el músculo ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <h2 className={styles.sectionTitle}>El equilibrio Ca²⁺ / Mg²⁺ en el músculo</h2>
        <p className={styles.sectionSubtitle}>
          El calcio activa la contracción; el magnesio la controla y permite la relajación. Sin
          suficiente Mg, el músculo no puede relajarse correctamente.
        </p>

        <div className={styles.muscleEquilibrium}>
          <div className={styles.muscleStateSelector} role="tablist" aria-label="Estado muscular">
            {ESTADOS_MUSCULARES.map((estado) => (
              <button
                key={estado.id}
                role="tab"
                aria-selected={estadoMuscular === estado.id}
                className={`${styles.muscleStateBtn} ${estadoMuscular === estado.id ? styles.muscleStateBtnActive : ''}`}
                onClick={() => setEstadoMuscular(estado.id)}
              >
                {estado.titulo}
              </button>
            ))}
          </div>

          <div
            className={styles.muscleState}
            style={{ backgroundColor: estadoActual.colorFondo }}
            role="tabpanel"
          >
            <div className={styles.muscleStateVisual}>
              {estadoMuscular === 'reposo' && (
                <div className={styles.muscleVisualReposo}>
                  <span className={styles.ionMg}>Mg²⁺</span>
                  <span className={styles.canalBlockado}>⊘ Canal Ca²⁺</span>
                  <span className={styles.ionCa} style={{ opacity: 0.3 }}>Ca²⁺ bajo</span>
                </div>
              )}
              {estadoMuscular === 'contraccion' && (
                <div className={styles.muscleVisualContraccion}>
                  <span className={styles.ionCa} style={{ color: '#FF6B35' }}>Ca²⁺ ↑↑↑</span>
                  <span className={styles.actinaMiosina}>Actina ⟺ Miosina</span>
                  <span className={styles.tensionLabel}>TENSIÓN</span>
                </div>
              )}
              {estadoMuscular === 'relajacion' && (
                <div className={styles.muscleVisualRelajacion}>
                  <span className={styles.ionMg}>Mg²⁺ activo</span>
                  <span className={styles.sercaLabel}>SERCA bombea Ca²⁺ fuera</span>
                  <span className={styles.relajacionLabel}>RELAJACIÓN ✓</span>
                </div>
              )}
              {estadoMuscular === 'deficit' && (
                <div className={styles.muscleVisualDeficit}>
                  <span className={styles.deficitLabel}>⚠ Mg²⁺ insuficiente</span>
                  <span className={styles.ionCa} style={{ color: '#FF3355' }}>Ca²⁺ sin control</span>
                  <span className={styles.espasmoLabel}>ESPASMO / CALAMBRE</span>
                </div>
              )}
            </div>
            <h3 className={styles.muscleStateTitle}>{estadoActual.titulo}</h3>
            <p className={styles.muscleStateDesc}>{estadoActual.descripcion}</p>
            <p className={styles.muscleStateDetail}>{estadoActual.detalle}</p>
          </div>
        </div>
      </section>

      {/* ── Sección 3: Receptor NMDA ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>El Mg²⁺ como modulador del receptor NMDA</h2>
        <p className={styles.sectionSubtitle}>
          El magnesio actúa como "tapón" de voltaje en el canal NMDA — el mismo mecanismo que
          explotan la ketamina y el memantina para sus efectos neurológicos.
        </p>

        <div className={styles.nmdaSection}>
          <div className={styles.nmdaDiagram}>
            <div className={styles.nmdaReceptor}>
              <div className={styles.nmdaLabel}>Receptor NMDA</div>
              <div className={styles.nmdaChannel}>
                <div className={styles.nmdaMgBlock}>
                  <span>Mg²⁺</span>
                  <span className={styles.nmdaBlockText}>bloqueando canal</span>
                </div>
              </div>
              <div className={styles.nmdaGlutamate}>Glutamato + Glicina → necesarios pero no suficientes</div>
            </div>

            <div className={styles.nmdaArrow}>→</div>

            <div className={styles.nmdaActivado}>
              <div className={styles.nmdaLabel}>Con despolarización</div>
              <div className={styles.nmdaChannelOpen}>
                <span className={styles.nmdaMgSale}>Mg²⁺ sale</span>
                <span className={styles.ionCa} style={{ color: '#2E86AB' }}>Ca²⁺ entra</span>
              </div>
              <div className={styles.nmdaPlasticidad}>Plasticidad sináptica (LTP)</div>
            </div>
          </div>

          <div className={styles.nmdaImplicaciones}>
            <h3>¿Por qué importa?</h3>
            <div className={styles.nmdaCard}>
              <span className={styles.nmdaCardIcon}>😰</span>
              <div>
                <strong>Ansiedad y estrés</strong>
                <p>El déficit de Mg reduce el bloqueo del NMDA → hiperexcitabilidad neuronal → mayor reactividad al estrés.</p>
              </div>
            </div>
            <div className={styles.nmdaCard}>
              <span className={styles.nmdaCardIcon}>🤯</span>
              <div>
                <strong>Migraña</strong>
                <p>El Mg intracelular es bajo en pacientes con migraña. El NMDA participa en la propagación cortical de la migraña.</p>
              </div>
            </div>
            <div className={styles.nmdaCard}>
              <span className={styles.nmdaCardIcon}>💊</span>
              <div>
                <strong>Ketamina y memantina</strong>
                <p>Ambos fármacos actúan bloqueando el canal NMDA en el mismo sitio que el Mg2+ — validando el mecanismo.</p>
              </div>
            </div>
            <div className={styles.nmdaCard}>
              <span className={styles.nmdaCardIcon}>🧠</span>
              <div>
                <strong>Plasticidad neuronal</strong>
                <p>El NMDA es esencial para la memoria y el aprendizaje. La modulación por Mg regula cuándo se activa la plasticidad.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 4: La deficiencia silenciosa ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <h2 className={styles.sectionTitle}>La deficiencia silenciosa</h2>
        <p className={styles.sectionSubtitle}>
          El 60-65% del Mg corporal está en los huesos. El suero sanguíneo contiene solo el 1% →
          los análisis de sangre son poco sensibles y la deficiencia pasa desapercibida durante años.
        </p>

        <div className={styles.deficiencyBanner}>
          <span className={styles.deficiencyPercent}>1%</span>
          <span className={styles.deficiencyText}>
            del Mg corporal está en sangre. El cuerpo roba Mg del hueso para mantener los niveles
            séricos normales → el análisis de sangre puede ser "normal" con déficit real.
          </span>
        </div>

        <div className={styles.deficiencySection}>
          {SINTOMAS_DEFICIENCIA.map((sistema) => (
            <div key={sistema.sistema} className={styles.symptomCard}>
              <button
                className={styles.symptomCardHeader}
                onClick={() =>
                  setSistemaAbierto((prev) => (prev === sistema.sistema ? null : sistema.sistema))
                }
                aria-expanded={sistemaAbierto === sistema.sistema}
              >
                <span className={styles.symptomIcon}>{sistema.icono}</span>
                <span className={styles.symptomSistema}>{sistema.sistema}</span>
                <span className={styles.symptomToggle}>
                  {sistemaAbierto === sistema.sistema ? '▲' : '▼'}
                </span>
              </button>
              {sistemaAbierto === sistema.sistema && (
                <ul className={styles.symptomList} role="list">
                  {sistema.sintomas.map((s) => (
                    <li key={s} className={styles.symptomItem}>
                      <span aria-hidden="true">•</span> {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className={styles.causasDeplecion}>
          <h3>Causas frecuentes de depleción</h3>
          <div className={styles.causasGrid}>
            {[
              { icono: '💊', causa: 'Diuréticos tiazídicos y de asa', detalle: 'Aumentan la excreción renal de Mg' },
              { icono: '🍺', causa: 'Alcohol crónico', detalle: 'Reduce absorción y aumenta excreción renal' },
              { icono: '😤', causa: 'Estrés crónico', detalle: 'El cortisol aumenta la excreción renal de Mg' },
              { icono: '💊', causa: 'Inhibidores de bomba de protones', detalle: 'Reducen absorción intestinal de Mg' },
              { icono: '🍬', causa: 'Dieta occidental procesada', detalle: 'Pobre en vegetales de hoja verde, legumbres y frutos secos' },
              { icono: '🩺', causa: 'Diabetes no controlada', detalle: 'La glucosuria arrastra Mg por la orina' },
            ].map(({ icono, causa, detalle }) => (
              <div key={causa} className={styles.causaCard}>
                <span className={styles.causaIcon}>{icono}</span>
                <strong className={styles.causaNombre}>{causa}</strong>
                <span className={styles.causaDetalle}>{detalle}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sección 5: Fuentes alimentarias ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Fuentes alimentarias de magnesio</h2>
        <p className={styles.sectionSubtitle}>
          IDR: 310 mg/día (mujeres adultas) — 420 mg/día (hombres adultos). Las semillas de
          calabaza lideran con diferencia.
        </p>

        <div className={styles.sourcesChart}>
          <Bar data={barData} options={barOptions} />
        </div>

        <div className={styles.idrReferencia}>
          <span className={styles.idrLine} style={{ width: '52.2%' }} />
          <span className={styles.idrText}>← 310 mg (mujeres) / 420 mg (hombres) →</span>
        </div>

        <p className={styles.waterNote}>
          🚰 El agua mineral puede aportar entre 1 y 120 mg/L de Mg (varía mucho según la fuente).
          Las aguas "duras" son una fuente significativa y frecuentemente ignorada.
        </p>
      </section>

      {/* Disclaimer */}
      <div className={styles.section}>
        <DisclaimerCard variant="medical" severity="high" />
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Por qué la deficiencia es tan común y tan ignorada"
        subtitle="La bioquímica del magnesio explica por qué la medicina convencional lo infradiagnostica"
      >
        <h3>El problema del análisis de sangre</h3>
        <p>
          El magnesio sérico solo representa el 1% del magnesio corporal total. El cuerpo tiene
          mecanismos homeostáticos muy eficaces para mantener el Mg sérico estable (0,75–0,95 mmol/L)
          incluso cuando las reservas intracelulares y óseas están agotadas. En la práctica, el
          suero puede ser "normal" mientras el músculo cardíaco, el sistema nervioso y el tejido
          muscular esquelético sufren déficit funcional.
        </p>
        <p>
          Una prueba más fiable sería el Mg eritrocitario (en glóbulos rojos) o el Mg intracelular
          en leucocitos, pero son pruebas caras y poco disponibles en la medicina ordinaria.
        </p>

        <h3>Formas de suplemento: no todas son iguales</h3>
        <ul>
          <li>
            <strong>Glicinato / bisglicinato de Mg</strong>: Mejor tolerado gastrointestinalmente,
            buena absorción, no produce efecto laxante. Ideal para déficits importantes.
          </li>
          <li>
            <strong>Citrato de Mg</strong>: Buena absorción (~30%), algo laxante a dosis altas.
            Económico y ampliamente disponible.
          </li>
          <li>
            <strong>Malato de Mg</strong>: Bien tolerado, el ácido málico puede ayudar con la
            producción de energía (ciclo de Krebs).
          </li>
          <li>
            <strong>Óxido de Mg</strong>: Absorción muy baja (~4%), principalmente actúa como
            laxante osmótico. No útil para déficit.
          </li>
          <li>
            <strong>Cloruro de Mg (transdérmico)</strong>: Popularizado para baños o aceites,
            pero la evidencia de absorción transdérmica es limitada y controvertida.
          </li>
          <li>
            <strong>L-treonato de Mg</strong>: Diseñado para cruzar la barrera hematoencefálica.
            Prometedor en estudios de función cognitiva, pero más caro y con menos evidencia clínica.
          </li>
        </ul>

        <h3>Interacciones farmacológicas relevantes</h3>
        <ul>
          <li>
            <strong>Diuréticos tiazídicos y de asa</strong>: Hidrocolrotiazida, furosemida →
            aumentan la excreción renal de Mg. Uso prolongado → déficit clínicamente significativo.
          </li>
          <li>
            <strong>Inhibidores de la bomba de protones (IBP)</strong>: Omeprazol, pantoprazol →
            reducen la absorción intestinal. La FDA emitió una alerta en 2011 por hipomagnesemia
            con IBP a largo plazo (más de 1 año).
          </li>
          <li>
            <strong>Aminoglucósidos</strong>: Gentamicina → nefrotóxicos, aumentan excreción renal.
          </li>
          <li>
            <strong>Vitamina D y Mg</strong>: El Mg es cofactor de la hidroxilasa que convierte
            vitamina D a su forma activa. Un déficit de Mg puede hacer ineficaz la suplementación
            con vitamina D.
          </li>
        </ul>

        <h3>Magnesio y sueño</h3>
        <p>
          El Mg regula el GABA-A (aumentando la actividad inhibitoria) y modula el receptor NMDA
          (reduciendo la excitabilidad). Esto explica su efecto relajante y la asociación entre
          déficit de Mg e insomnio. También regula la melatonina: el Mg es cofactor de la
          N-acetiltransferasa, enzima clave en la síntesis de melatonina.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-magnesio')} />
      <ShareCard appName="visualizador-magnesio" />
      <Footer appName="visualizador-magnesio" />
    </div>
  );
}
