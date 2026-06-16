'use client';

import { useState } from 'react';
import styles from './VisualizadorAdrenalina.module.css';
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

interface HitoTimeline {
  tiempo: string;
  titulo: string;
  descripcion: string;
}

interface ReceptorSubtipo {
  nombre: string;
  efectos: string;
  detalle: string;
}

interface ReceptorTipo {
  tipo: string;
  color: string;
  subtipos: ReceptorSubtipo[];
}

interface TarjetaMedicamento {
  icono: string;
  titulo: string;
  contexto: string;
  mecanismo: string;
}

// ─────────────────────────────────────────────
// Datos: Timeline lucha-o-huida
// ─────────────────────────────────────────────

const HITOS_TIMELINE: HitoTimeline[] = [
  {
    tiempo: '0 s',
    titulo: 'Amígdala detecta la amenaza',
    descripcion: 'La amígdala cerebral procesa la señal de peligro y activa el hipotálamo antes de que la corteza haya "decidido" nada.',
  },
  {
    tiempo: '0,1 s',
    titulo: 'Hipotálamo activa el SNS',
    descripcion: 'El hipotálamo envía señal descendente por la médula espinal activando el sistema nervioso simpático.',
  },
  {
    tiempo: '0,5 s',
    titulo: 'Fibras simpáticas a órganos',
    descripcion: 'Las fibras nerviosas esplánicas llegan directamente al corazón, pulmones, vasos y a la médula adrenal.',
  },
  {
    tiempo: '1 s',
    titulo: 'Médula adrenal libera adrenalina',
    descripcion: 'La médula suprarrenal libera adrenalina (80 %) y noradrenalina (20 %) directamente al torrente sanguíneo.',
  },
  {
    tiempo: '2 s',
    titulo: 'Efectos cardiovasculares y sensoriales',
    descripcion: 'Frecuencia cardíaca aumenta (β1) · Broncodilatación (β2) · Pupilas dilatadas (α1).',
  },
  {
    tiempo: '3 s',
    titulo: 'Movilización de energía',
    descripcion: 'Hígado libera glucosa (glucogenólisis) · Músculos reciben más sangre · Piel palidece (vasoconstricción α1).',
  },
  {
    tiempo: '5 s',
    titulo: 'Supresión de sistemas no esenciales',
    descripcion: 'Digestión, sistema inmune y reproducción quedan en segundo plano: no son prioritarios ante la amenaza inmediata.',
  },
  {
    tiempo: '30 s',
    titulo: 'Eje HPA en paralelo',
    descripcion: 'El hipotálamo activa el eje HPA → ACTH → cortisol desde la corteza adrenal. Efecto más lento pero más duradero.',
  },
];

// ─────────────────────────────────────────────
// Datos: Receptores adrenérgicos
// ─────────────────────────────────────────────

const RECEPTORES: ReceptorTipo[] = [
  {
    tipo: 'Receptores α (alfa)',
    color: '#C0392B',
    subtipos: [
      {
        nombre: 'α1',
        efectos: 'Vasoconstricción periférica (piel, vísceras), midriasis, contracción músculo liso',
        detalle: 'Responsables del palidecimiento cutáneo y aumento de la presión arterial durante el estrés agudo.',
      },
      {
        nombre: 'α2',
        efectos: 'Autorreceptores presinápticos que frenan la liberación de noradrenalina, hipotensores centrales',
        detalle: 'Actúan como freno negativo del sistema simpático. Fármacos como la clonidina actúan sobre α2 para reducir la presión arterial.',
      },
    ],
  },
  {
    tipo: 'Receptores β (beta)',
    color: '#2E86AB',
    subtipos: [
      {
        nombre: 'β1',
        efectos: 'Corazón → aumento de frecuencia (cronotropismo) y fuerza (inotropismo) cardíaca',
        detalle: 'Los betabloqueantes (atenolol, metoprolol) bloquean β1 → reducen la frecuencia y fuerza cardíaca → usados en hipertensión, angina y taquiarritmias.',
      },
      {
        nombre: 'β2',
        efectos: 'Broncodilatación (pulmones), vasodilatación muscular, glucogenólisis hepática',
        detalle: 'Los broncodilatadores (salbutamol) son agonistas β2. También explica por qué los músculos reciben más sangre y glucosa durante el estrés.',
      },
      {
        nombre: 'β3',
        efectos: 'Tejido adiposo → lipolisis (quema de grasa)',
        detalle: 'Activa la lipolisis en adipocitos blancos y la termogénesis en grasa parda. Diana farmacológica en investigación para obesidad.',
      },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: Usos médicos
// ─────────────────────────────────────────────

const USOS_MEDICOS: TarjetaMedicamento[] = [
  {
    icono: '🚨',
    titulo: 'Anafilaxia',
    contexto:
      'La reacción alérgica más grave: histamina masiva → vasodilatación extrema + broncoespasmo + edema → shock. Sin adrenalina puede ser mortal en minutos.',
    mecanismo:
      'Adrenalina IM (EpiPen 0,3 mg) contrarresta simultáneamente: α1 (vasoconstricción, restaura presión), β2 (broncodilatación), β1 (soporte cardíaco). Es el único tratamiento eficaz de primera línea.',
  },
  {
    icono: '🫀',
    titulo: 'Parada cardíaca',
    contexto:
      'En fibrilación ventricular o asistolia refractaria, la desfibrilación sola puede no ser suficiente para restaurar el ritmo.',
    mecanismo:
      'Adrenalina IV/IO (1 mg cada 3-5 min) mejora la perfusión coronaria durante las compresiones torácicas → aumenta la probabilidad de que la desfibrilación sea efectiva. Protocolo ACLS/SVA estándar.',
  },
  {
    icono: '😷',
    titulo: 'Crup y angioedema laríngeo',
    contexto:
      'El edema de la vía aérea superior causa estridor y dificultad respiratoria aguda, especialmente en niños con crup viral.',
    mecanismo:
      'Adrenalina nebulizada (racémica o L-epinefrina) actúa localmente sobre receptores α de la mucosa laríngea → vasoconstricción local → reduce el edema → mejora el estridor en minutos.',
  },
];

// ─────────────────────────────────────────────
// Datos: Niveles de adrenalina
// ─────────────────────────────────────────────

const LABELS_SITUACIONES = ['Reposo basal', 'Ejercicio intenso', 'Estrés agudo (susto)', 'Estrés crónico (persistente)'];
const DATOS_NIVELES = [50, 400, 600, 200];
const COLORES_BARRAS = [
  'rgba(72, 169, 166, 0.8)',
  'rgba(46, 134, 171, 0.8)',
  'rgba(192, 57, 43, 0.85)',
  'rgba(230, 126, 34, 0.8)',
];

// ─────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────

function BloqueDobleIdentidad() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>La doble identidad — neurotransmisor y hormona</h2>
      <p className={styles.sectionDesc}>
        La misma molécula química actúa de dos formas distintas según dónde se produzca.
      </p>
      <div className={styles.dobleIdentidadGrid}>
        <div className={styles.identidadCard} style={{ borderTop: '4px solid #7D3C98' }}>
          <div className={styles.identidadCardHeader}>
            <span className={styles.identidadIcono} aria-hidden="true">🧠</span>
            <h3 className={styles.identidadTitulo}>Como NEUROTRANSMISOR</h3>
            <span className={styles.identidadSubtitulo}>(en el cerebro)</span>
          </div>
          <p className={styles.identidadNombre}><strong>Nombre técnico:</strong> Noradrenalina / norepinefrina (NE)</p>
          <ul className={styles.identidadLista}>
            <li>Producida en el <strong>locus coeruleus</strong> (tronco encefálico) → proyecciones a corteza, amígdala, hipocampo</li>
            <li>Atención y alerta (arousal cognitivo)</li>
            <li>Consolidación de <strong>memorias emocionales</strong></li>
            <li>Modulación del ciclo sueño-vigilia</li>
            <li>Respuesta al estrés psicológico</li>
          </ul>
          <div className={styles.identidadFarmacos}>
            <span className={styles.identidadFarmacosLabel}>Fármacos relacionados:</span>
            <span>Antidepresivos ISRSN (venlafaxina), IRTNE, atomoxetina (TDAH)</span>
          </div>
        </div>

        <div className={styles.identidadCard} style={{ borderTop: '4px solid #2E86AB' }}>
          <div className={styles.identidadCardHeader}>
            <span className={styles.identidadIcono} aria-hidden="true">💉</span>
            <h3 className={styles.identidadTitulo}>Como HORMONA</h3>
            <span className={styles.identidadSubtitulo}>(en la sangre)</span>
          </div>
          <p className={styles.identidadNombre}><strong>Nombre:</strong> Epinefrina / adrenalina</p>
          <ul className={styles.identidadLista}>
            <li>Producida por la <strong>médula suprarrenal</strong> (glándula adrenal, encima del riñón)</li>
            <li>Liberada directamente a la sangre en segundos</li>
            <li>Controlada por el SNS vía fibras nerviosas esplánicas</li>
            <li>Actúa en todo el organismo: corazón, pulmones, músculos, hígado, vasos</li>
          </ul>
          <div className={styles.identidadFarmacos}>
            <span className={styles.identidadFarmacosLabel}>Uso clínico:</span>
            <span>EpiPen (anafilaxia), RCP (parada cardíaca), adrenalina nebulizada (crup)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BloqueTimeline() {
  const [hitoActivo, setHitoActivo] = useState<number>(0);
  const hito = HITOS_TIMELINE[hitoActivo];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>La cascada lucha-o-huida — timeline</h2>
      <p className={styles.sectionDesc}>
        Desde la percepción de la amenaza hasta la movilización completa del organismo. Pulsa cada punto para ver el detalle.
      </p>

      {/* Timeline horizontal */}
      <div className={styles.timelineWrapper} role="tablist" aria-label="Fases de la cascada adrenérgica">
        <div className={styles.timelineTrack} aria-hidden="true" />
        {HITOS_TIMELINE.map((h, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={hitoActivo === i}
            aria-label={`${h.tiempo}: ${h.titulo}`}
            className={`${styles.timelineHito} ${hitoActivo === i ? styles.timelineHitoActivo : ''}`}
            onClick={() => setHitoActivo(i)}
          >
            <span className={styles.timelineTiempo}>{h.tiempo}</span>
            <span className={styles.timelinePunto} aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* Detalle del hito seleccionado */}
      <div className={styles.timelineDetalle} role="tabpanel">
        <p className={styles.timelineDetalletiempo}>{hito.tiempo}</p>
        <h3 className={styles.timelineDetalleTitulo}>{hito.titulo}</h3>
        <p className={styles.timelineDetalleDesc}>{hito.descripcion}</p>
      </div>

      <div className={styles.insightBox}>
        <strong>Dato clave:</strong> La amígdala puede activar la respuesta de estrés antes de que la corteza prefrontal haya &ldquo;decidido&rdquo; conscientemente que hay un peligro. Esto es una ventaja evolutiva: actuar antes de analizar.
      </div>
    </section>
  );
}

function BloqueReceptores() {
  const [subtipoActivo, setSubtipoActivo] = useState<string | null>(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Los receptores adrenérgicos — α y β</h2>
      <p className={styles.sectionDesc}>
        La adrenalina actúa a través de distintos receptores con efectos muy diferentes. Pulsa cada subtipo para ver el detalle.
      </p>

      <div className={styles.receptoresGrid}>
        {RECEPTORES.map((receptor) => (
          <div key={receptor.tipo} className={styles.receptorTipo}>
            <h3 className={styles.receptorTipoTitulo} style={{ color: receptor.color }}>
              {receptor.tipo}
            </h3>
            <div className={styles.receptorSubtipos}>
              {receptor.subtipos.map((sub) => (
                <div key={sub.nombre}>
                  <button
                    type="button"
                    className={`${styles.receptorSubtipo} ${subtipoActivo === sub.nombre ? styles.receptorSubtipoActivo : ''}`}
                    style={subtipoActivo === sub.nombre ? { borderColor: receptor.color, backgroundColor: receptor.color + '12' } : {}}
                    onClick={() => setSubtipoActivo(subtipoActivo === sub.nombre ? null : sub.nombre)}
                    aria-expanded={subtipoActivo === sub.nombre}
                  >
                    <span className={styles.receptorNombre}>{sub.nombre}</span>
                    <span className={styles.receptorEfectos}>{sub.efectos}</span>
                  </button>
                  {subtipoActivo === sub.nombre && (
                    <div className={styles.receptorDetalle}>
                      {sub.detalle}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insightBox}>
        <strong>Pánico escénico y betabloqueantes:</strong> Los betabloqueantes (atenolol, metoprolol) bloquean los receptores β1 cardíacos → reducen la frecuencia y fuerza del corazón → usados en hipertensión, angina, taquiarritmias y también para el pánico escénico (bloquean los síntomas físicos de la adrenalina sin afectar al rendimiento mental).
      </div>
    </section>
  );
}

function BloqueMedicamentos() {
  const [tarjetaActiva, setTarjetaActiva] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>La adrenalina como medicamento — casos donde salva vidas</h2>
      <p className={styles.sectionDesc}>
        La misma molécula que activa el estrés es también un fármaco crítico en emergencias. Pulsa cada caso para ver el mecanismo.
      </p>

      <div className={styles.medicamentoGrid}>
        {USOS_MEDICOS.map((tarjeta, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.medicamentoCard} ${tarjetaActiva === i ? styles.medicamentoCardActiva : ''}`}
            onClick={() => setTarjetaActiva(tarjetaActiva === i ? null : i)}
            aria-expanded={tarjetaActiva === i}
          >
            <span className={styles.medicamentoIcono} aria-hidden="true">{tarjeta.icono}</span>
            <h3 className={styles.medicamentoTitulo}>{tarjeta.titulo}</h3>
            <p className={styles.medicamentoContexto}>{tarjeta.contexto}</p>
            {tarjetaActiva === i && (
              <div className={styles.medicamentoMecanismo}>
                <strong>Mecanismo:</strong> {tarjeta.mecanismo}
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function BloqueEstres() {
  const datosGrafico = {
    labels: LABELS_SITUACIONES,
    datasets: [
      {
        label: 'Nivel de adrenalina (pg/mL)',
        data: DATOS_NIVELES,
        backgroundColor: COLORES_BARRAS,
        borderColor: COLORES_BARRAS.map((c) => c.replace('0.8', '1').replace('0.85', '1')),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y} pg/mL (referencia orientativa)`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'pg/mL (referencia)' },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        grid: { display: false },
      },
    },
  } as never;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Estrés agudo vs crónico — la misma molécula, efectos opuestos</h2>
      <p className={styles.sectionDesc}>
        Los niveles de adrenalina varían enormemente según la situación. El estrés crónico mantiene niveles moderados pero persistentes, con consecuencias muy distintas al estrés agudo puntual.
      </p>

      <div className={styles.nivelChart}>
        <Bar data={datosGrafico} options={opcionesGrafico} />
      </div>

      <div className={styles.comparativaEstres}>
        <div className={styles.comparativaCol}>
          <h3 className={styles.comparativaTitulo} style={{ color: '#2E86AB' }}><span aria-hidden="true">⚡</span> Estrés agudo (adaptativo)</h3>
          <ul className={styles.comparativaLista}>
            <li>Mejora el rendimiento cognitivo a corto plazo</li>
            <li>Moviliza energía de forma eficiente</li>
            <li>Consolida memorias emocionales importantes</li>
            <li>Activa el sistema inmune brevemente</li>
            <li>Se resuelve cuando desaparece la amenaza</li>
          </ul>
        </div>
        <div className={styles.comparativaCol}>
          <h3 className={styles.comparativaTitulo} style={{ color: '#C0392B' }}><span aria-hidden="true">🔥</span> Estrés crónico (dañino)</h3>
          <ul className={styles.comparativaLista}>
            <li>Hipertensión arterial sostenida</li>
            <li>Inmunosupresión a largo plazo</li>
            <li>Deterioro cognitivo y problemas de memoria</li>
            <li>Riesgo cardiovascular aumentado</li>
            <li>Desequilibrio del eje HPA y cortisol elevado</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAdrenalina() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>NEUROCIENCIA</span>
          <h1 className={styles.heroTitle}>Adrenalina: La Hormona de la Supervivencia</h1>
          <p className={styles.heroSubtitle}>Neurotransmisor en el cerebro, hormona en la sangre</p>
          <p className={styles.heroDesc}>
            La adrenalina (epinefrina) prepara el cuerpo para actuar en segundos ante una amenaza: corazón más rápido,
            músculos con más glucosa, pupilas dilatadas. La misma molécula salva vidas en anafilaxia y paraliza en el
            estrés crónico.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" />

      <BloqueDobleIdentidad />
      <BloqueTimeline />
      <BloqueReceptores />
      <BloqueMedicamentos />
      <BloqueEstres />

      <EducationalSection
        title="Profundiza en la fisiología adrenérgica"
        subtitle="Eje simpático-adrenal, receptores y estrés crónico"
      >
        <p>
          <strong>Adrenalina vs noradrenalina:</strong> Aunque son moléculas casi idénticas, sus efectos difieren porque tienen distinta afinidad por los receptores. La adrenalina tiene mayor efecto β (corazón y bronquios), mientras que la noradrenalina tiene mayor efecto α (vasoconstricción periférica). Por eso en la parada cardíaca se usa adrenalina (necesitamos soporte cardíaco y coronario) y no noradrenalina.
        </p>
        <p>
          <strong>La memoria del estrés:</strong> ¿Por qué recordamos mejor los eventos con carga emocional? La noradrenalina liberada en la amígdala durante el estrés activa los receptores β adrenérgicos en el hipocampo y la amígdala, potenciando la consolidación de la memoria. Es un mecanismo adaptativo: recordar mejor las situaciones de peligro aumenta la supervivencia. El mismo mecanismo explica por qué los traumas se fijan con tanta intensidad.
        </p>
        <p>
          <strong>¿Por qué no se puede tomar por vía oral?</strong> La adrenalina es una catecolamina que se degrada rápidamente en el tracto digestivo por la acción de las enzimas MAO (monoaminooxidasa) y COMT (catecol-O-metiltransferasa), y también sufre un importante efecto de primer paso hepático. Por eso los EpiPen son de uso intramuscular — la vía IM garantiza absorción rápida y directa a la sangre sin pasar por el sistema digestivo.
        </p>
        <p>
          <strong>Noradrenalina y equilibrio postural:</strong> El locus coeruleus, principal fuente cerebral de noradrenalina, tiene proyecciones al cerebelo y al tronco encefálico que modulan el tono muscular postural y la coordinación. Alteraciones en este sistema están relacionadas con trastornos del equilibrio en enfermedades neurodegenerativas como el Parkinson.
        </p>
        <div className={styles.warningBox}>
          <strong>Nota educativa:</strong> Este visualizador explica mecanismos fisiológicos con fines educativos. El estrés crónico o cualquier condición relacionada con el sistema adrenérgico requiere evaluación médica por un profesional de la salud.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-adrenalina')} />
      <ShareCard appName="visualizador-adrenalina" />
      <Footer appName="visualizador-adrenalina" />
    </div>
  );
}
