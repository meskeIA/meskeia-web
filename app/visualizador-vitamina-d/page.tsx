'use client';

import { useState } from 'react';
import styles from './VisualizadorVitaminaD.module.css';
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
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface PasoSintesis {
  id: number;
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  color: string;
}

interface TejidoVDR {
  icono: string;
  nombre: string;
  funcion: string;
}

interface NivelVitaminaD {
  etiqueta: string;
  rango: string;
  color: string;
  valor: number;
}

// ─────────────────────────────────────────────
// Datos: Flujo de síntesis (5 pasos)
// ─────────────────────────────────────────────

const PASOS_SINTESIS: PasoSintesis[] = [
  {
    id: 1,
    icono: '☀️',
    titulo: 'UVB → Piel',
    subtitulo: '7-dehidrocolesterol → previtamina D3',
    descripcion:
      'Los rayos UVB (280–315 nm) penetran la epidermis y actúan sobre el 7-dehidrocolesterol (un derivado del colesterol presente en la piel). La reacción fotoquímica abre el anillo B del esteroide y genera previtamina D3. Este paso solo ocurre con radiación UVB directa — el cristal de ventana bloquea completamente los UVB.',
    color: '#F5A623',
  },
  {
    id: 2,
    icono: '🌡️',
    titulo: 'Calor corporal',
    subtitulo: 'Previtamina D3 → vitamina D3 (colecalciferol)',
    descripcion:
      'La previtamina D3 es inestable y, gracias al calor corporal (37 °C), se isomeriza espontáneamente a vitamina D3 (colecalciferol) en la piel en 1–3 días. La vitamina D3 pasa al torrente sanguíneo unida a la proteína DBP (vitamin D binding protein).',
    color: '#E67E22',
  },
  {
    id: 3,
    icono: '🫀',
    titulo: 'Hígado: 25-OH',
    subtitulo: '→ calcidiol (25-hidroxivitamina D)',
    descripcion:
      'En el hígado, la enzima CYP2R1 (25-hidroxilasa) añade un grupo hidroxilo en la posición 25 del anillo. El resultado es el calcidiol (25-hidroxivitamina D), la forma de transporte y almacenamiento en sangre. Es el marcador que miden los análisis: niveles normales 30–50 ng/mL (75–125 nmol/L). Su vida media es de 2–3 semanas.',
    color: '#2E86AB',
  },
  {
    id: 4,
    icono: '🫘',
    titulo: 'Riñón: 1,25-OH',
    subtitulo: '→ calcitriol (forma activa)',
    descripcion:
      'El riñón convierte el calcidiol en calcitriol (1,25-dihidroxivitamina D) mediante la enzima CYP27B1 (1-alfa-hidroxilasa). Este paso está regulado por la PTH (hormona paratiroidea), el calcio y el fósforo sérico. El calcitriol es 1.000 veces más potente que el calcidiol. Esta conversión también ocurre localmente en células inmunes y otros tejidos.',
    color: '#48A9A6',
  },
  {
    id: 5,
    icono: '🧬',
    titulo: 'VDR → Núcleo',
    subtitulo: 'Receptor → expresión génica',
    descripcion:
      'El calcitriol entra en las células y se une al receptor VDR (vitamin D receptor), presente en el núcleo de más de 37 tipos de tejido. El complejo calcitriol-VDR se une al ADN en regiones llamadas VDRE (vitamin D response elements) y regula la expresión de más de 200 genes. Este mecanismo de acción — unión a receptor nuclear y regulación génica — es idéntico al de las hormonas esteroides como el cortisol o los estrógenos.',
    color: '#7FB3D3',
  },
];

// ─────────────────────────────────────────────
// Datos: Tejidos con receptor VDR
// ─────────────────────────────────────────────

const TEJIDOS_VDR: TejidoVDR[] = [
  {
    icono: '🦴',
    nombre: 'Hueso',
    funcion:
      'Regula la absorción intestinal de calcio y fósforo, esenciales para la mineralización ósea. La deficiencia causa raquitismo en niños y osteomalacia en adultos.',
  },
  {
    icono: '🛡️',
    nombre: 'Sistema inmune',
    funcion:
      'Activa células T y macrófagos, modula la respuesta inflamatoria y reduce el riesgo de autoinmunidad. Déficit asociado a mayor incidencia de enfermedades autoinmunes.',
  },
  {
    icono: '💪',
    nombre: 'Músculo',
    funcion:
      'Regula la contracción muscular y la fuerza. La deficiencia severa causa debilidad muscular proximal (dificultad para subir escaleras, levantarse de una silla).',
  },
  {
    icono: '🧠',
    nombre: 'Cerebro',
    funcion:
      'Participa en la síntesis de serotonina y dopamina. Estudios epidemiológicos asocian déficit con mayor riesgo de depresión y deterioro cognitivo, aunque la causalidad no está establecida.',
  },
  {
    icono: '🫁',
    nombre: 'Intestino',
    funcion:
      'Función clásica y mejor documentada: el calcitriol induce la síntesis de calbindina (proteína transportadora de calcio) en el intestino delgado, aumentando la absorción de calcio hasta un 40%.',
  },
  {
    icono: '❤️',
    nombre: 'Corazón',
    funcion:
      'Regula la presión arterial al suprimir la renina (enzima del sistema renina-angiotensina). Déficit asociado a hipertensión y mayor riesgo cardiovascular en estudios observacionales.',
  },
];

// ─────────────────────────────────────────────
// Datos: Niveles en sangre
// ─────────────────────────────────────────────

const NIVELES: NivelVitaminaD[] = [
  { etiqueta: 'Deficiencia severa', rango: '< 10 ng/mL', color: '#C0392B', valor: 10 },
  { etiqueta: 'Deficiencia', rango: '10–20 ng/mL', color: '#E74C3C', valor: 20 },
  { etiqueta: 'Insuficiencia', rango: '20–30 ng/mL', color: '#F39C12', valor: 30 },
  { etiqueta: 'Suficiencia', rango: '30–50 ng/mL', color: '#27AE60', valor: 50 },
  { etiqueta: 'Óptimo', rango: '40–60 ng/mL', color: '#1E8449', valor: 60 },
  { etiqueta: 'Toxicidad posible', rango: '> 100 ng/mL', color: '#922B21', valor: 100 },
];

// ─────────────────────────────────────────────
// Bloque 1: Flujo de síntesis
// ─────────────────────────────────────────────

function BloqueSintesis() {
  const [pasoActivo, setPasoActivo] = useState<number | null>(null);

  const paso = pasoActivo !== null ? PASOS_SINTESIS.find(p => p.id === pasoActivo) ?? null : null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Síntesis de Vitamina D: 5 Pasos</h2>
      <p className={styles.sectionDesc}>
        Desde los rayos UVB hasta la expresión génica. Haz clic en cada paso para ver el mecanismo detallado.
      </p>
      <div className={styles.synthFlow}>
        {PASOS_SINTESIS.map((p, i) => (
          <div key={p.id} className={styles.synthFlowItem}>
            <button
              type="button"
              className={`${styles.synthStep} ${pasoActivo === p.id ? styles.synthStepActive : ''}`}
              onClick={() => setPasoActivo(pasoActivo === p.id ? null : p.id)}
              aria-pressed={pasoActivo === p.id}
              style={pasoActivo === p.id ? { borderColor: p.color } : {}}
            >
              <span className={styles.synthStepIcono} aria-hidden="true">{p.icono}</span>
              <span className={styles.synthStepNum}>Paso {p.id}</span>
              <span className={styles.synthStepTitulo}>{p.titulo}</span>
              <span className={styles.synthStepSubtitulo}>{p.subtitulo}</span>
            </button>
            {i < PASOS_SINTESIS.length - 1 && (
              <span className={styles.synthArrow} aria-hidden="true">→</span>
            )}
          </div>
        ))}
      </div>

      {paso && (
        <div
          className={styles.synthDetalle}
          style={{ borderLeftColor: paso.color }}
          role="region"
          aria-label={`Detalle paso ${paso.id}`}
        >
          <div className={styles.synthDetalleHeader}>
            <span aria-hidden="true">{paso.icono}</span>
            <strong>{paso.titulo}</strong>
            <em>{paso.subtitulo}</em>
          </div>
          <p>{paso.descripcion}</p>
        </div>
      )}

      {pasoActivo === null && (
        <p className={styles.synthHint}>
          <span aria-hidden="true">👆</span> Selecciona un paso para ver el mecanismo detallado
        </p>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 2: Tejidos con VDR
// ─────────────────────────────────────────────

function BloqueTejidos() {
  const [tejidoActivo, setTejidoActivo] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Receptor VDR: Presente en 37 Tejidos</h2>
      <p className={styles.sectionDesc}>
        La vitamina D actúa como hormona porque su receptor (VDR) está en casi todos los tejidos del cuerpo.
        Haz clic en cada tarjeta para ver la función específica.
      </p>
      <div className={styles.tissueGrid}>
        {TEJIDOS_VDR.map((t, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.tissueCard} ${tejidoActivo === i ? styles.tissueCardActive : ''}`}
            onClick={() => setTejidoActivo(tejidoActivo === i ? null : i)}
            aria-pressed={tejidoActivo === i}
          >
            <span className={styles.tissueIcono} aria-hidden="true">{t.icono}</span>
            <span className={styles.tissueNombre}>{t.nombre}</span>
            {tejidoActivo === i && (
              <span className={styles.tissueFuncion}>{t.funcion}</span>
            )}
          </button>
        ))}
      </div>
      {tejidoActivo === null && (
        <p className={styles.synthHint}>
          <span aria-hidden="true">👆</span> Haz clic en un tejido para ver su función
        </p>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 3: Gráfico de niveles
// ─────────────────────────────────────────────

function BloqueNiveles() {
  const datosGrafico = {
    labels: NIVELES.map(n => n.etiqueta),
    datasets: [
      {
        label: 'ng/mL (referencia)',
        data: NIVELES.map(n => n.valor),
        backgroundColor: NIVELES.map(n => n.color),
        borderRadius: 6,
        borderSkipped: false as never,
      },
    ],
  };

  const opcionesGrafico = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { x: number | null } }) =>
            `${ctx.parsed.x ?? 0} ng/mL`,
        } as never,
      },
    },
    scales: {
      x: {
        ticks: { color: '#888', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: {
          display: true,
          text: 'ng/mL (25-OH vitamina D en sangre)',
          color: '#888',
          font: { size: 11 },
        },
      },
      y: {
        ticks: { color: '#555', font: { size: 12 } },
        grid: { display: false },
      },
    },
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Niveles de Vitamina D en Sangre</h2>
      <p className={styles.sectionDesc}>
        El marcador utilizado en análisis es el calcidiol (25-OH vitamina D). Los valores de referencia
        varían ligeramente según la sociedad científica, pero existe consenso en los rangos principales.
      </p>

      <div className={styles.levelChart}>
        <Bar data={datosGrafico} options={opcionesGrafico} />
      </div>

      <div className={styles.levelLegend}>
        {NIVELES.map((n, i) => (
          <div key={i} className={styles.levelItem}>
            <span className={styles.levelDot} style={{ backgroundColor: n.color }} aria-hidden="true" />
            <span className={styles.levelLabel}>{n.etiqueta}</span>
            <span className={styles.levelRange}>{n.rango}</span>
          </div>
        ))}
      </div>

      <div className={styles.insightBox}>
        <p>
          La zona &ldquo;óptima&rdquo; (40–60 ng/mL) es debatida: algunas guías consideran suficiente 30 ng/mL, mientras
          que investigadores como Holick defienden 40–60 ng/mL. La toxicidad es rara por exposición solar
          (la piel degrada el exceso), pero sí puede ocurrir con suplementación excesiva prolongada.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 4: Paradoja española
// ─────────────────────────────────────────────

function BloqueParadoja() {
  const causas = [
    { icono: '🧴', causa: 'Protección solar (FPS)', detalle: 'Un FPS 30 reduce la síntesis de vitamina D un 95-99%. Aunque el SPF protege del cáncer de piel, elimina casi completamente la producción de vitamina D.' },
    { icono: '👔', causa: 'Ropa de cobertura', detalle: 'En invierno, pocas zonas de piel quedan expuestas al sol. La síntesis requiere mínimo brazos y piernas al descubierto.' },
    { icono: '🏢', causa: 'Trabajo en interiores', detalle: 'La mayoría de españoles trabajan en oficinas. El cristal bloquea completamente los rayos UVB necesarios para la síntesis.' },
    { icono: '🧑', causa: 'Pigmentación cutánea', detalle: 'La melanina actúa como filtro solar natural. Personas con piel más oscura necesitan 3-5 veces más exposición para producir la misma cantidad de vitamina D.' },
    { icono: '🌐', causa: 'Latitud y estacionalidad', detalle: 'En Madrid (40°N), de octubre a marzo el ángulo solar es demasiado bajo para que los UVB alcancen la superficie terrestre. En Galicia o Asturias esto se extiende hasta abril.' },
  ];

  const alimentos = [
    { nombre: 'Salmón', cantidad: '447 IU / 100 g', icono: '🐟' },
    { nombre: 'Sardinas (en lata)', cantidad: '272 IU / 100 g', icono: '🐠' },
    { nombre: 'Yema de huevo', cantidad: '37 IU / unidad', icono: '🥚' },
    { nombre: 'Leche enriquecida', cantidad: '100 IU / 250 mL', icono: '🥛' },
    { nombre: 'Setas (luz UV)', cantidad: '200–400 IU / 100 g', icono: '🍄' },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>La Paradoja Española del Sol</h2>
      <p className={styles.sectionDesc}>
        España tiene más horas de sol que el norte de Europa, pero el 40–80% de la población española
        presenta insuficiencia o deficiencia de vitamina D en invierno. ¿Por qué?
      </p>

      <div className={styles.paradoxSection}>
        <div className={styles.paradoxStat}>
          <div className={styles.statBox}>
            <span className={styles.statNum}>2.800</span>
            <span className={styles.statLabel}>horas de sol / año en España</span>
          </div>
          <div className={styles.paradoxVs} aria-hidden="true">VS</div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>40–80%</span>
            <span className={styles.statLabel}>de españoles con déficit en invierno</span>
          </div>
        </div>

        <h3 className={styles.subsectionTitle}>Causas de la paradoja</h3>
        <div className={styles.causasGrid}>
          {causas.map((c, i) => (
            <div key={i} className={styles.causaCard}>
              <span className={styles.causaIcono} aria-hidden="true">{c.icono}</span>
              <div>
                <strong className={styles.causaTitulo}>{c.causa}</strong>
                <p className={styles.causaDetalle}>{c.detalle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.exposureBox}>
          <h3 className={styles.subsectionTitle}>
            <span aria-hidden="true">⏱️</span> Tiempo de exposición solar necesario
          </h3>
          <p>
            Para sintetizar vitamina D eficazmente: <strong>15–30 minutos</strong> al mediodía solar (12:00–15:00 h),
            con <strong>brazos y piernas al descubierto</strong>, sin protector solar, en verano en latitud española.
            La piel produce entonces unas 10.000–25.000 IU en una sesión. En invierno, aunque se haga lo mismo,
            la producción cae a prácticamente cero.
          </p>
        </div>

        <h3 className={styles.subsectionTitle}>Fuentes alimentarias (datos orientativos)</h3>
        <div className={styles.alimentosGrid}>
          {alimentos.map((a, i) => (
            <div key={i} className={styles.alimentoCard}>
              <span className={styles.alimentoIcono} aria-hidden="true">{a.icono}</span>
              <span className={styles.alimentoNombre}>{a.nombre}</span>
              <span className={styles.alimentoCantidad}>{a.cantidad}</span>
            </div>
          ))}
        </div>
        <p className={styles.alimentosNota}>
          La dieta sola raramente cubre las necesidades (400–800 IU/día recomendadas). La principal fuente debe ser la exposición solar.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorVitaminaDPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Endocrinología educativa</span>
          <h1 className={styles.heroTitle}>
            <span aria-hidden="true">☀️</span> Vitamina D
          </h1>
          <p className={styles.heroSubtitle}>La Vitamina que Actúa como Hormona</p>
          <p className={styles.heroDesc}>
            Síntesis solar, receptores en 37 tejidos y la paradoja de la deficiencia en España
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="low"
        collapsible={true}
      />

      <BloqueSintesis />
      <BloqueTejidos />
      <BloqueNiveles />
      <BloqueParadoja />

      <EducationalSection
        title="Profundiza en la vitamina D"
        subtitle="Hormona esteroide, regulación y ciencia del calcitriol"
        defaultOpen={false}
      >
        <h3>Por qué la vitamina D es técnicamente una hormona esteroide</h3>
        <p>
          La vitamina D cumple todos los criterios de una hormona esteroide:
          se sintetiza a partir del colesterol, circula en sangre unida a una proteína transportadora (DBP),
          entra en las células y se une a un receptor nuclear (VDR) que regula directamente la expresión génica.
          El término &ldquo;vitamina&rdquo; es un error histórico — se descubrió en el contexto del raquitismo antes
          de entender su mecanismo de acción. A diferencia de las vitaminas clásicas (que actúan como cofactores enzimáticos),
          la vitamina D actúa como una hormona con efectos pleiotrópicos en todo el organismo.
        </p>

        <h3>Vitamina D2 vs D3: diferencias clave</h3>
        <p>
          Existen dos formas principales:
        </p>
        <ul>
          <li>
            <strong>D3 (colecalciferol)</strong>: producida en la piel humana y presente en alimentos animales (pescado azul, yema de huevo).
            Es la forma que sintetiza el cuerpo por exposición solar.
          </li>
          <li>
            <strong>D2 (ergocalciferol)</strong>: producida por plantas, hongos y levaduras al exponerse a luz UV.
            Menos potente que la D3 para elevar los niveles séricos de calcidiol.
          </li>
        </ul>
        <p>
          Los suplementos modernos utilizan mayoritariamente D3, ya que estudios comparativos muestran que eleva
          el calcidiol sérico de manera más eficiente y sostenida que la D2.
        </p>

        <h3>El papel de la PTH (hormona paratiroidea)</h3>
        <p>
          El calcio sérico y la vitamina D están regulados en un circuito de retroalimentación negativa:
        </p>
        <ol>
          <li>Cuando el calcio sérico cae, las glándulas paratiroides secretan PTH (hormona paratiroidea).</li>
          <li>La PTH estimula en el riñón la enzima CYP27B1 → más conversión de calcidiol a calcitriol.</li>
          <li>El calcitriol aumenta la absorción intestinal de calcio y la resorción ósea.</li>
          <li>El calcio sérico sube → PTH disminuye → se frena la producción de calcitriol.</li>
        </ol>
        <p>
          La deficiencia crónica de vitamina D lleva a hiperparatiroidismo secundario: la PTH sube permanentemente para compensar,
          acelerando la pérdida de masa ósea.
        </p>

        <h3>Factores que reducen la síntesis cutánea</h3>
        <ul>
          <li><strong>Latitud &gt; 35°N:</strong> En invierno, el ángulo solar es tan bajo que los UVB son filtrados por la atmósfera antes de llegar al suelo. Madrid está a 40°N — de octubre a marzo, la síntesis es prácticamente nula.</li>
          <li><strong>Hora del día:</strong> Solo el sol de mediodía solar (cuando los rayos UVB son más perpendiculares) permite síntesis eficiente. Antes de las 10h y después de las 15h, los UVB se filtran.</li>
          <li><strong>Nubosidad y polución:</strong> Las nubes reducen la radiación UVB un 50–90%. La contaminación atmosférica también filtra los UVB.</li>
          <li><strong>Envejecimiento cutáneo:</strong> La piel de personas mayores tiene menos 7-dehidrocolesterol disponible. Una persona de 70 años produce un 75% menos de vitamina D que una de 20 años con la misma exposición.</li>
          <li><strong>Obesidad:</strong> La vitamina D es liposoluble y se acumula en el tejido adiposo, reduciendo la biodisponibilidad en sangre. Personas con mayor masa grasa necesitan más exposición o suplementación para alcanzar niveles óptimos.</li>
        </ul>

        <div className={styles.warningBox}>
          <strong>Aviso educativo:</strong> Esta app describe la fisiología de la vitamina D con fines educativos.
          Los valores de referencia son orientativos; la interpretación de análisis y la decisión de suplementar
          corresponde a un profesional sanitario. Los niveles óptimos y las recomendaciones de suplementación
          varían según guías clínicas, condición de salud individual y otros factores.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-vitamina-d')} />
      <ShareCard appName="visualizador-vitamina-d" />
      <Footer appName="visualizador-vitamina-d" />
    </div>
  );
}
