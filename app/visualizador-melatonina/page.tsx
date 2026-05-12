'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorMelatonina.module.css';
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type EscenarioLuz = 'solar' | 'artificial' | 'oscuridad';

interface EscenarioLuzData {
  id: EscenarioLuz;
  icono: string;
  titulo: string;
  mecanismo: string;
  nivel: number;
  dato: string;
  colorBarra: string;
}

interface TarjetaJetLag {
  icono: string;
  titulo: string;
  descripcion: string;
  detalle: string;
}

// ─────────────────────────────────────────────
// Datos: Curva circadiana doble
// ─────────────────────────────────────────────

const HORAS_DIA = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];

const DATOS_MELATONINA = [60, 80, 95, 100, 95, 80, 55, 20, 5, 3, 2, 2, 2, 2, 2, 3, 5, 10, 20, 35, 55, 70, 75, 65];

const DATOS_CORTISOL = [15, 10, 8, 10, 20, 50, 80, 100, 90, 75, 60, 50, 45, 40, 38, 42, 45, 40, 35, 30, 25, 22, 18, 15];

// ─────────────────────────────────────────────
// Datos: Escenarios de luz
// ─────────────────────────────────────────────

const ESCENARIOS_LUZ: EscenarioLuzData[] = [
  {
    id: 'solar',
    icono: '☀️',
    titulo: 'Luz solar (día)',
    mecanismo: 'La luz entra por la retina → células ganglionares retinianas (ipRGC) detectan la longitud de onda azul (~480 nm) → señal viaja al núcleo supraquiasmático (NSQ, el "reloj central") → NSQ inhibe la glándula pineal → supresión de melatonina.',
    nivel: 5,
    dato: 'La luz solar activa las mismas células retinianas (ipRGC) que responden a la longitud de onda azul. La supresión de melatonina es completa durante el día.',
    colorBarra: '#F5A623',
  },
  {
    id: 'artificial',
    icono: '📱',
    titulo: 'Luz artificial nocturna (pantallas, LED)',
    mecanismo: 'La luz azul de pantallas (450-490 nm) activa las mismas células ipRGC → el NSQ interpreta que "aún es de día" → supresión parcial de melatonina de 1-3 horas. La producción se retrasa aunque el cuerpo esté preparado para dormir.',
    nivel: 30,
    dato: 'Una tablet a máximo brillo suprime la melatonina ~50% durante 2 horas. Incluso brillo moderado retrasa el inicio de la secreción 30-90 minutos.',
    colorBarra: '#E67E22',
  },
  {
    id: 'oscuridad',
    icono: '🌙',
    titulo: 'Oscuridad total',
    mecanismo: 'Sin luz, el NSQ permite la síntesis de melatonina en la glándula pineal. La serotonina se convierte en N-acetilserotonina y luego en melatonina. La enzima clave es la AANAT (arilalquilamina N-acetiltransferasa), cuya actividad se dispara en la oscuridad.',
    nivel: 100,
    dato: 'La producción de melatonina comienza ~2 horas después del inicio de la oscuridad y alcanza su pico máximo entre las 2:00 y las 4:00 AM en adultos con horarios regulares.',
    colorBarra: '#4A4E8A',
  },
];

// ─────────────────────────────────────────────
// Datos: Melatonina por edad
// ─────────────────────────────────────────────

const LABELS_EDAD = ['Bebés\n0-3m', 'Niños\n3-10a', 'Adolescentes\n12-17a', 'Adultos\n20-40a', 'Maduros\n60+', 'Ancianos\n80+'];
const DATOS_EDAD = [5, 125, 100, 80, 40, 20];

// ─────────────────────────────────────────────
// Datos: Melatonina por estación
// ─────────────────────────────────────────────

const LABELS_ESTACION = ['Invierno\n(noche ~14h)', 'Primavera/Otoño\n(noche ~12h)', 'Verano\n(noche ~9h)'];
const DATOS_ESTACION = [9, 7, 5];

// ─────────────────────────────────────────────
// Datos: Jet lag
// ─────────────────────────────────────────────

const TARJETAS_JETLAG: TarjetaJetLag[] = [
  {
    icono: '🛫',
    titulo: 'Vuelo hacia el Este (Madrid → Tokio, +8h)',
    descripcion: 'Tu reloj interno sigue en hora española. El cuerpo libera melatonina a las 3:00 AM hora japonesa (que equivale a las 11:00 PM española).',
    detalle: 'Debes dormir cuando tu cuerpo aún está activo y viceversa. Es el jet lag más difícil de superar. Adaptación estimada: ~1 día por hora de diferencia de huso horario.',
  },
  {
    icono: '🛬',
    titulo: 'Vuelo hacia el Oeste (Madrid → Nueva York, -6h)',
    descripcion: 'Generalmente más fácil: extiendes el día. La melatonina llega tarde para el nuevo horario local.',
    detalle: 'El cuerpo tarda menos en ajustarse (3-5 días) porque alargar el día es más natural fisiológicamente que acortarlo. El NSQ se adapta mejor a ciclos ligeramente más largos.',
  },
  {
    icono: '🌙',
    titulo: 'Trabajo nocturno',
    descripcion: 'La melatonina sube por la noche aunque estés trabajando bajo luz artificial. El cuerpo recibe señales contradictorias.',
    detalle: 'La oscuridad indica "dormir", pero estás activo. El NSQ tiene dificultades para ajustar el reloj completamente. Con el tiempo, los trabajadores nocturnos no suprimen del todo la melatonina y tampoco la producen a pleno rendimiento durante el día.',
  },
  {
    icono: '📱',
    titulo: 'Pantallas antes de dormir',
    descripcion: 'Retrasa el inicio de la producción de melatonina 30-90 minutos. El sueño se inicia más tarde aunque la hora de levantarse sea fija.',
    detalle: 'El sueño total se reduce sin que la persona lo perciba claramente. La "deuda de sueño" acumulada tiene efectos cognitivos y metabólicos documentados, incluso cuando la sensación subjetiva de cansancio no es aparente.',
  },
];

// ─────────────────────────────────────────────
// Bloque 1: Curva Circadiana
// ─────────────────────────────────────────────

function BloqueCircadiano() {
  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#666', font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            `${ctx.dataset.label ?? ''}: ${ctx.parsed.y ?? 0}%`,
        } as never,
      },
    },
    scales: {
      x: {
        ticks: { color: '#888', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        min: 0,
        max: 105,
        ticks: {
          color: '#888',
          font: { size: 11 },
          callback: (v: number | string) => `${v}%`,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  const datosGrafico = {
    labels: HORAS_DIA,
    datasets: [
      {
        label: 'Melatonina',
        data: DATOS_MELATONINA,
        borderColor: '#4A4E8A',
        backgroundColor: 'rgba(74,78,138,0.10)',
        borderWidth: 2.5,
        pointRadius: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Cortisol',
        data: DATOS_CORTISOL,
        borderColor: '#F5A623',
        backgroundColor: 'rgba(245,166,35,0.08)',
        borderWidth: 2.5,
        pointRadius: 2,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>La Curva Circadiana: Melatonina vs Cortisol</h2>
      <p className={styles.sectionDesc}>
        El contraste visual más impactante: melatonina y cortisol son hormonas &ldquo;opuestas&rdquo; en el ciclo de 24 horas.
        Son el yin y yang del ritmo circadiano.
      </p>
      <div className={styles.chartContainer}>
        <Line data={datosGrafico} options={opcionesGrafico} />
      </div>
      <div className={styles.franjaLeyenda}>
        <span className={styles.franjaNoche}>🌙 Noche (20:00–8:00): melatonina dominante</span>
        <span className={styles.franjaDia}>☀️ Día (8:00–20:00): cortisol dominante</span>
      </div>
      <div className={styles.insightBox}>
        <p>
          La melatonina empieza a subir <strong>~2 horas antes</strong> de la hora habitual de dormir.
          El cortisol alcanza su pico <strong>~30 minutos después de despertar</strong> (cortisol awakening response).
          Son el yin y yang del ritmo circadiano: cuando uno sube, el otro baja.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 2: Simulador de luz
// ─────────────────────────────────────────────

function BloqueLuz() {
  const [escenario, setEscenario] = useState<EscenarioLuz>('oscuridad');
  const datos = ESCENARIOS_LUZ.find(e => e.id === escenario) ?? ESCENARIOS_LUZ[2];
  const [nivelVisible, setNivelVisible] = useState(datos.nivel);

  useEffect(() => {
    const target = ESCENARIOS_LUZ.find(e => e.id === escenario)?.nivel ?? 100;
    setNivelVisible(target);
  }, [escenario]);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Cómo la Luz Controla la Melatonina</h2>
      <p className={styles.sectionDesc}>
        Selecciona un tipo de luz para ver cómo afecta a la producción de melatonina y el mecanismo fisiológico detrás.
      </p>

      <div className={styles.simuladorLuz}>
        {ESCENARIOS_LUZ.map(e => (
          <button
            key={e.id}
            type="button"
            className={`${styles.escenarioBtn} ${escenario === e.id ? styles.escenarioBtnActivo : ''}`}
            onClick={() => setEscenario(e.id)}
            aria-pressed={escenario === e.id}
          >
            <span className={styles.iconoEscenario} aria-hidden="true">{e.icono}</span>
            <span>{e.titulo}</span>
          </button>
        ))}
      </div>

      {datos && (
        <div className={styles.escenarioDetalle}>
          <div className={styles.barraMetaWrapper}>
            <div className={styles.barraMetaLabel}>Nivel de melatonina</div>
            <div className={styles.barraMetaTrack}>
              <div
                className={styles.barraMetaFill}
                style={{
                  height: `${nivelVisible}%`,
                  backgroundColor: datos.colorBarra,
                }}
                role="progressbar"
                aria-valuenow={nivelVisible}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Nivel de melatonina: ${nivelVisible}%`}
              />
            </div>
            <div className={styles.barraMetaValor} style={{ color: datos.colorBarra }}>
              {nivelVisible}%
            </div>
          </div>

          <div className={styles.escenarioInfo}>
            <div className={styles.escenarioMecanismo}>
              <strong>Mecanismo:</strong> {datos.mecanismo}
            </div>
            <div className={styles.escenarioDato}>
              <span aria-hidden="true">🔬</span> {datos.dato}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 3: Edad y estaciones
// ─────────────────────────────────────────────

function BloqueEdadEstaciones() {
  const opcionesEdad = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => `${ctx.parsed.y ?? 0} pg/mL (relativo)`,
        } as never,
      },
    },
    scales: {
      x: {
        ticks: { color: '#888', font: { size: 10 } },
        grid: { display: false },
      },
      y: {
        min: 0,
        ticks: { color: '#888', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: {
          display: true,
          text: 'pg/mL (aprox.)',
          color: '#888',
          font: { size: 11 },
        },
      },
    },
  };

  const datosEdad = {
    labels: ['Bebés\n0-3m', 'Niños\n3-10a', 'Adolescentes\n12-17a', 'Adultos\n20-40a', 'Maduros\n60+', 'Ancianos\n80+'],
    datasets: [
      {
        label: 'Melatonina nocturna',
        data: DATOS_EDAD,
        backgroundColor: DATOS_EDAD.map((v, i) => {
          const colors = ['#B0B8E0', '#4A4E8A', '#6B72C4', '#7A80D0', '#A0A6D8', '#C8CCE8'];
          return colors[i] ?? '#4A4E8A';
        }),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const opcionesEstacion = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => `${ctx.parsed.y ?? 0} horas activa`,
        } as never,
      },
    },
    scales: {
      x: {
        ticks: { color: '#888', font: { size: 10 } },
        grid: { display: false },
      },
      y: {
        min: 0,
        max: 12,
        ticks: { color: '#888', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: {
          display: true,
          text: 'Horas activa',
          color: '#888',
          font: { size: 11 },
        },
      },
    },
  };

  const datosEstacion = {
    labels: LABELS_ESTACION,
    datasets: [
      {
        label: 'Horas de melatonina activa',
        data: DATOS_ESTACION,
        backgroundColor: ['#2E4A7A', '#48A9A6', '#F5A623'],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Melatonina a lo Largo de la Vida y las Estaciones</h2>
      <p className={styles.sectionDesc}>
        La producción de melatonina cambia drásticamente con la edad y varía según la duración de la noche en cada estación.
      </p>

      <div className={styles.dobleChart}>
        <div className={styles.subChart}>
          <h3 className={styles.subChartTitle}>Por edad (pico nocturno relativo)</h3>
          <div className={styles.chartContainer}>
            <Bar data={datosEdad} options={opcionesEdad} />
          </div>
          <p className={styles.subChartNota}>
            La caída de melatonina con la edad contribuye a los cambios en el patrón de sueño en personas mayores.
          </p>
        </div>

        <div className={styles.subChart}>
          <h3 className={styles.subChartTitle}>Por estación (horas activa)</h3>
          <div className={styles.chartContainer}>
            <Bar data={datosEstacion} options={opcionesEstacion} />
          </div>
          <p className={styles.subChartNota}>
            Este patrón estacional puede influir en el estado de ánimo y el apetito, especialmente en latitudes altas (trastorno afectivo estacional).
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 4: Jet lag
// ─────────────────────────────────────────────

function BloqueJetLag() {
  const [expandida, setExpandida] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Jet Lag y Melatonina: El Mecanismo</h2>
      <p className={styles.sectionDesc}>
        Cuatro escenarios que desincronización el reloj interno y cómo la melatonina responde en cada uno.
      </p>
      <div className={styles.jetLagGrid}>
        {TARJETAS_JETLAG.map((t, i) => (
          <div key={i} className={styles.tarjetaJetLag}>
            <button
              type="button"
              className={styles.tarjetaJetLagBtn}
              onClick={() => setExpandida(expandida === i ? null : i)}
              aria-expanded={expandida === i}
            >
              <span className={styles.jetLagIcono} aria-hidden="true">{t.icono}</span>
              <span className={styles.jetLagTitulo}>{t.titulo}</span>
              <span className={styles.jetLagChevron} aria-hidden="true">{expandida === i ? '▲' : '▼'}</span>
            </button>
            <p className={styles.jetLagDesc}>{t.descripcion}</p>
            {expandida === i && (
              <p className={styles.jetLagDetalle}>{t.detalle}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMelatoninaPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Fisiología del sueño</span>
          <h1 className={styles.heroTitle}>Melatonina</h1>
          <p className={styles.heroSubtitle}>La hormona que regula tu reloj interno</p>
          <p className={styles.heroDesc}>
            Curva circadiana opuesta al cortisol, el efecto de la luz azul, patrones estacionales,
            jet lag y lo que dice la ciencia sobre los suplementos.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
      />

      <BloqueCircadiano />
      <BloqueLuz />
      <BloqueEdadEstaciones />
      <BloqueJetLag />

      <EducationalSection
        title="Profundiza en la melatonina"
        subtitle="Ritmo circadiano, glándula pineal y ciencia del sueño"
        defaultOpen={false}
      >
        <h3>La glándula pineal: &ldquo;el tercer ojo&rdquo; de Descartes</h3>
        <p>
          El filósofo René Descartes creía que la glándula pineal era la &ldquo;sede del alma&rdquo; y el punto de encuentro entre mente y cuerpo.
          Aunque esa hipótesis quedó descartada, la glándula pineal sí tiene un papel único: es el único órgano del cerebro que <strong>no tiene par simétrico</strong>
          y produce melatonina en respuesta directa a la oscuridad. Pesa apenas 0,1 gramos pero coordina el ritmo circadiano de todo el organismo.
        </p>

        <h3>De serotonina a melatonina: la cadena química</h3>
        <p>
          La melatonina no aparece de la nada. Su síntesis sigue una cadena de 4 pasos:
        </p>
        <ol>
          <li><strong>Triptófano</strong> (aminoácido de los alimentos) → transportado al cerebro</li>
          <li><strong>Triptófano → Serotonina</strong> (en presencia de luz diurna, vitamina B6 y hierro)</li>
          <li><strong>Serotonina → N-acetilserotonina</strong> (enzima AANAT, activada en la oscuridad)</li>
          <li><strong>N-acetilserotonina → Melatonina</strong> (enzima HIOMT en la pineal)</li>
        </ol>
        <p>
          El triptófano de la dieta es precursor remoto de la melatonina, pero su impacto real sobre el sueño en
          personas sanas con dieta normal es modesto: compite con otros aminoácidos por la barrera hematoencefálica
          y los estudios no muestran un efecto clínicamente relevante. La luz nocturna, en cambio, sí interrumpe
          claramente la cadena en el paso 3.
        </p>

        <h3>Melatonina y antioxidación: un rol menos conocido</h3>
        <p>
          Estudios in vitro muestran que la melatonina tiene capacidad antioxidante y, por su pequeño tamaño y
          solubilidad, puede acceder a compartimentos celulares como la mitocondria. La traducción de esto a
          efectos clínicos en humanos —incluida la suplementación con fines &ldquo;antiaging&rdquo;— no está
          establecida y los ensayos clínicos disponibles son limitados.
        </p>

        <h3>¿Qué dice la ciencia sobre los suplementos de melatonina?</h3>
        <p>
          La evidencia científica es más matizada de lo que sugiere su popularidad:
        </p>
        <ul>
          <li><strong>Jet lag:</strong> evidencia sólida. Tomar dosis bajas (0,5-1 mg) en el momento adecuado reduce el tiempo de adaptación al nuevo huso horario.</li>
          <li><strong>Insomnio circadiano:</strong> evidencia moderada. Útil para personas con retraso de fase (cronotipos muy nocturnos).</li>
          <li><strong>Insomnio general en adultos mayores:</strong> evidencia moderada. La producción endógena disminuye con la edad y la suplementación puede compensarlo.</li>
          <li><strong>Calidad del sueño en adultos sanos:</strong> evidencia débil. No hay consenso claro sobre su eficacia.</li>
          <li><strong>Dosis:</strong> los estudios que muestran eficacia usan dosis bajas (0,1-1 mg), no las de 5-10 mg típicas en muchos suplementos comerciales.</li>
        </ul>
        <p>
          <strong>Nota editorial:</strong> la decisión de usar suplementos es una cuestión médica individual que depende de la causa del problema de sueño, otros medicamentos y condiciones de salud. Esta app describe la fisiología, no prescribe intervenciones.
        </p>

        <h3>Cronotipos: matutinos vs vespertinos — ¿tiene base hormonal?</h3>
        <p>
          Los cronotipos (ser &ldquo;de mañana&rdquo; o &ldquo;de noche&rdquo;) tienen base genética y hormonal parcial.
          Las personas con cronotipo vespertino tienen el inicio de la secreción de melatonina naturalmente retrasado 1-3 horas respecto a los matutinos.
          Esto se llama <strong>Delayed Sleep Phase Disorder (DSPD)</strong> en su forma extrema.
          La adolescencia amplifica el retraso de fase: los cambios hormonales de la pubertad retrasan el reloj circadiano,
          lo que explica por qué los adolescentes son naturalmente más nocturnos y por qué las clases tempranas afectan más a este grupo.
        </p>

        <div className={styles.warningBox}>
          <strong>Aviso educativo:</strong> Esta app describe la fisiología de la melatonina con fines educativos.
          El uso de suplementos o la gestión de trastornos del sueño debe consultarse con un profesional de la salud.
          Los datos de niveles hormonales son aproximados y orientativos; la variación individual es muy amplia.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-melatonina')} />
      <ShareCard appName="visualizador-melatonina" />
      <Footer appName="visualizador-melatonina" />
    </div>
  );
}
