'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './VisualizadorIbuprofeno.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface PasoMecanismo {
  numero: number;
  titulo: string;
  descripcion: string;
  icono: string;
}

interface EfectoCOX {
  funcion: string;
  consecuencia: string;
}

interface DatoCOX {
  tipo: string;
  subtitulo: string;
  descripcion: string;
  efectos: EfectoCOX[];
  color: string;
}

interface SituacionUso {
  icono: string;
  titulo: string;
  eficacia: string;
  mecanismo: string;
  nota: string;
}

interface RiesgoAdverso {
  organo: string;
  icono: string;
  mecanismo: string;
  sintomas: string[];
  factoresRiesgo: string[];
  solucion: string;
}

interface DatoCoxib {
  farmaco: string;
  cox1: number;
  cox2: number;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PASOS_MECANISMO: PasoMecanismo[] = [
  {
    numero: 1,
    titulo: 'Daño o infección',
    descripcion:
      'Las células dañadas liberan ácido araquidónico de sus membranas gracias a la acción de la fosfolipasa A2. Este ácido graso es el sustrato de partida de toda la cascada inflamatoria.',
    icono: '🔴',
  },
  {
    numero: 2,
    titulo: 'COX entra en acción',
    descripcion:
      'COX-1 (constitutiva, siempre presente) y COX-2 (inducida por inflamación) transforman el ácido araquidónico en prostaglandinas (PGE2, PGI2) y tromboxano A2 (TXA2).',
    icono: '⚙️',
  },
  {
    numero: 3,
    titulo: 'Las prostaglandinas actúan',
    descripcion:
      'PGE2 sensibiliza los nociceptores al dolor, actúa en el hipotálamo elevando la temperatura corporal y provoca vasodilatación y edema en la zona inflamada.',
    icono: '🌡️',
  },
  {
    numero: 4,
    titulo: 'El ibuprofeno actúa',
    descripcion:
      'Se une reversiblemente al sitio activo de COX-1 y COX-2, bloqueando la conversión del ácido araquidónico. Sin prostaglandinas: menos dolor, menos fiebre, menos inflamación.',
    icono: '💊',
  },
];

const DATOS_COX: DatoCOX[] = [
  {
    tipo: 'COX-1',
    subtitulo: 'Constitutiva — siempre presente',
    descripcion:
      'Está activa en múltiples tejidos en condiciones normales. Cumple funciones de mantenimiento (housekeeping) esenciales. Inhibirla es el precio que pagamos.',
    efectos: [
      {
        funcion: 'Estómago: produce PGE2 que estimula el moco protector de la mucosa gástrica',
        consecuencia: 'Sin PGE2 → mucosa desprotegida → gastritis, úlcera',
      },
      {
        funcion: 'Plaquetas: produce TXA2 que activa la agregación plaquetaria',
        consecuencia: 'Sin TXA2 → menor coagulación (reversible)',
      },
      {
        funcion: 'Riñón: produce prostaglandinas que mantienen el flujo sanguíneo renal',
        consecuencia: 'Sin ellas → vasoconstricción renal → riesgo de daño renal',
      },
    ],
    color: '#2E86AB',
  },
  {
    tipo: 'COX-2',
    subtitulo: 'Inducible — aparece con inflamación',
    descripcion:
      'Se sobreexpresa en tejidos inflamados. Es la diana terapéutica buscada. Su inhibición produce el efecto antiinflamatorio, pero también tiene funciones cardiovasculares.',
    efectos: [
      {
        funcion: 'Tejidos inflamados: produce PGE2 y PGI2 proinflamatorias',
        consecuencia: 'Inhibir COX-2 ES el efecto terapéutico buscado ✓',
      },
      {
        funcion: 'Endotelio vascular: produce PGI2 que es antitrombótica (protege el corazón)',
        consecuencia: 'Inhibición de COX-2 sola → riesgo cardiovascular (problema de los coxibs)',
      },
    ],
    color: '#48A9A6',
  },
];

const SITUACIONES_USO: SituacionUso[] = [
  {
    icono: '💪',
    titulo: 'Dolor muscular / agujetas',
    eficacia: 'Alta',
    mecanismo:
      'La inflamación muscular post-ejercicio implica PGE2 elevada. El ibuprofeno la reduce, disminuyendo dolor e hinchazón.',
    nota:
      'Controversia: inhibe parte de la adaptación muscular al ejercicio en uso crónico.',
  },
  {
    icono: '🦷',
    titulo: 'Dolor dental',
    eficacia: 'Muy alta',
    mecanismo:
      'Abscesos e inflamación periapical con PGE2 local muy elevada. Especialmente eficaz frente al paracetamol, que solo actúa centralmente.',
    nota: 'Primera elección para dolor dental agudo con componente inflamatorio.',
  },
  {
    icono: '🔴',
    titulo: 'Dismenorrea (dolor menstrual)',
    eficacia: 'Muy alta',
    mecanismo:
      'El endometrio libera prostaglandinas en exceso provocando contracciones uterinas dolorosas. El ibuprofeno bloquea la PGE2 uterina.',
    nota: 'Eficacia muy superior al paracetamol en esta indicación específica.',
  },
  {
    icono: '🦴',
    titulo: 'Artritis y articulaciones',
    eficacia: 'Alta',
    mecanismo:
      'Inflamación articular crónica con prostaglandinas sinoviales responsables del dolor e hinchazón. Ibuprofeno reduce ambos.',
    nota: 'Uso a corto plazo recomendado por riesgo GI/renal con uso prolongado.',
  },
  {
    icono: '🤕',
    titulo: 'Golpes y contusiones',
    eficacia: 'Alta',
    mecanismo:
      'La inflamación post-traumática incluye PGE2 y edema. Eficaz tanto en forma tópica como sistémica.',
    nota: 'Más eficaz que el paracetamol para el proceso inflamatorio post-traumático.',
  },
];

const RIESGOS_ADVERSOS: RiesgoAdverso[] = [
  {
    organo: 'Estómago',
    icono: '🫄',
    mecanismo:
      'Inhibición de COX-1 → menos PGE2 gástrica → mucosa desprotegida. El ibuprofeno también daña la mucosa por contacto directo.',
    sintomas: ['Ardor y dispepsia', 'Gastritis', 'Úlcera gástrica o duodenal', 'Sangrado digestivo'],
    factoresRiesgo: [
      'Edad > 65 años',
      'Úlcera previa',
      'Corticoides concomitantes',
      'Infección por H. pylori',
    ],
    solucion:
      'Tomarlo siempre con alimentos. Añadir omeprazol u otro IBP en uso prolongado o personas de riesgo.',
  },
  {
    organo: 'Riñón',
    icono: '🫘',
    mecanismo:
      'Las prostaglandinas renales (PGE2, PGI2) dilatan las arteriolas aferentes del glomérulo. Sin ellas → vasoconstricción → reducción del filtrado glomerular.',
    sintomas: ['Reducción del filtrado glomerular', 'Retención de sodio y agua', 'Edema', 'Insuficiencia renal aguda (casos graves)'],
    factoresRiesgo: [
      'Deshidratación (verano, diarrea, fiebre alta)',
      'Personas mayores',
      'Insuficiencia cardíaca',
      'Enfermedad renal crónica previa',
    ],
    solucion:
      'En personas sanas bien hidratadas el riñón tolera bien el ibuprofeno a dosis terapéuticas y duración corta. Beber suficiente agua.',
  },
  {
    organo: 'Corazón',
    icono: '❤️',
    mecanismo:
      'Inhibición de COX-2 → menos PGI2 vascular (antitrombótica) → mayor tendencia a trombosis. A diferencia de la aspirina, el ibuprofeno no es antiagregante.',
    sintomas: ['Mayor tendencia trombótica con uso prolongado', 'Riesgo de hipertensión arterial', 'Retención de líquidos'],
    factoresRiesgo: [
      'Uso prolongado o dosis altas',
      'Antecedentes cardiovasculares',
      'Post-infarto de miocardio',
      'Insuficiencia cardíaca',
    ],
    solucion:
      'Riesgo bajo en personas sanas con uso corto. Evitar en post-infarto, insuficiencia cardíaca o hipertensión no controlada.',
  },
];

const DATOS_COXIBS: DatoCoxib[] = [
  {
    farmaco: 'Ibuprofeno',
    cox1: 50,
    cox2: 50,
    descripcion: 'No selectivo — inhibe ambas COX por igual',
  },
  {
    farmaco: 'Celecoxib',
    cox1: 5,
    cox2: 90,
    descripcion: 'Selectivo COX-2 — aprobado, en uso hoy',
  },
  {
    farmaco: 'Rofecoxib (Vioxx)',
    cox1: 2,
    cox2: 97,
    descripcion: 'Altamente selectivo COX-2 — RETIRADO 2004',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorIbuprofeno() {
  const [situacionSeleccionada, setSituacionSeleccionada] = useState<number | null>(null);
  const [riesgoExpandido, setRiesgoExpandido] = useState<number | null>(null);
  const [coxExpandida, setCoxExpandida] = useState<number | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);

  const relatedApps = getRelatedApps('visualizador-ibuprofeno');

  // Chart.js: Gráfico de barras horizontales COX-1 vs COX-2
  useEffect(() => {
    let chartInstance: { destroy: () => void } | null = null;

    const initChart = async () => {
      if (!chartRef.current) return;

      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      // Destruir instancia previa si existe
      if (chartInstanceRef.current) {
        (chartInstanceRef.current as { destroy: () => void }).destroy();
      }

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#B0B0B0' : '#666666';
      const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

      chartInstance = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: DATOS_COXIBS.map((d) => d.farmaco),
          datasets: [
            {
              label: 'Inhibición COX-1 (%)',
              data: DATOS_COXIBS.map((d) => d.cox1),
              backgroundColor: 'rgba(46,134,171,0.75)',
              borderColor: '#2E86AB',
              borderWidth: 2,
              borderRadius: 6,
            },
            {
              label: 'Inhibición COX-2 (%)',
              data: DATOS_COXIBS.map((d) => d.cox2),
              backgroundColor: 'rgba(72,169,166,0.75)',
              borderColor: '#48A9A6',
              borderWidth: 2,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: {
              labels: { color: textColor, font: { size: 13 } },
            },
            tooltip: {
              callbacks: {
                label: (ctx: { dataset: { label?: string }; parsed: { x: number } }) =>
                  ` ${ctx.dataset.label}: ${ctx.parsed.x}%`,
              },
            },
          },
          scales: {
            x: {
              min: 0,
              max: 100,
              ticks: { color: textColor, callback: (v: number | string) => `${v}%` },
              grid: { color: gridColor },
            },
            y: {
              ticks: { color: textColor, font: { size: 12 } },
              grid: { color: gridColor },
            },
          },
        } as never,
      });

      chartInstanceRef.current = chartInstance;
    };

    initChart();

    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>FARMACOLOGÍA</span>
          <h1 className={styles.heroTitle}>Ibuprofeno: El Antiinflamatorio que Inhibe las COX</h1>
          <p className={styles.heroSubtitle}>
            El único de los tres analgésicos comunes que ataca la inflamación en el tejido
          </p>
          <p className={styles.heroDesc}>
            El ibuprofeno inhibe reversiblemente COX-1 y COX-2 en los tejidos periféricos, bloqueando la
            síntesis de prostaglandinas inflamatorias. Es el más eficaz para dolores con componente
            inflamatorio, pero el más exigente con estómago y riñón.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="low" collapsible={true} />

      {/* ── SECCIÓN 1: El mecanismo COX ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>El Mecanismo COX — Cómo Bloquea la Inflamación</h2>
        <p className={styles.sectionDesc}>
          Cuatro pasos secuenciales desde el daño tisular hasta la acción del fármaco
        </p>

        <div className={styles.mecanismoPasos}>
          {PASOS_MECANISMO.map((paso, i) => (
            <div key={paso.numero} className={styles.pasoWrapper}>
              <div className={styles.paso}>
                <div className={styles.pasoNumero}>{paso.numero}</div>
                <div className={styles.pasoIcono}>{paso.icono}</div>
                <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
                <p className={styles.pasoDescripcion}>{paso.descripcion}</p>
              </div>
              {i < PASOS_MECANISMO.length - 1 && (
                <div className={styles.pasoConector}>▼</div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.insightBox}>
          <span className={styles.insightIcono}>💡</span>
          <div>
            <strong>Diferencia clave con la aspirina:</strong> La aspirina acetila permanentemente la COX
            (bloqueo irreversible). El ibuprofeno se une de forma reversible — cuando el fármaco se
            elimina, la COX recupera su actividad. Por eso el ibuprofeno no sirve para prevención
            cardiovascular a largo plazo.
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 2: COX-1 vs COX-2 ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>COX-1 vs COX-2 — El Talón de Aquiles del Ibuprofeno</h2>
          <p className={styles.sectionDesc}>
            Por qué bloquear ambas enzimas consigue el efecto terapéutico pero paga un precio
          </p>

          <div className={styles.coxGrid}>
            {DATOS_COX.map((cox, idx) => (
              <div
                key={cox.tipo}
                className={`${styles.coxCard} ${coxExpandida === idx ? styles.coxCardExpandida : ''}`}
                style={{ borderTopColor: cox.color }}
              >
                <button
                  className={styles.coxCardHeader}
                  onClick={() => setCoxExpandida(coxExpandida === idx ? null : idx)}
                  aria-expanded={coxExpandida === idx}
                >
                  <div>
                    <span className={styles.coxTipo} style={{ color: cox.color }}>
                      {cox.tipo}
                    </span>
                    <span className={styles.coxSubtitulo}>{cox.subtitulo}</span>
                  </div>
                  <span className={styles.coxToggle} aria-hidden="true">
                    {coxExpandida === idx ? '▲' : '▼'}
                  </span>
                </button>
                <p className={styles.coxDescripcion}>{cox.descripcion}</p>
                {coxExpandida === idx && (
                  <div className={styles.coxEfectos}>
                    {cox.efectos.map((ef, j) => (
                      <div key={j} className={styles.coxEfecto}>
                        <p className={styles.coxEfectoFuncion}>{ef.funcion}</p>
                        <p className={styles.coxEfectoConsecuencia}>→ {ef.consecuencia}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.insightBox}>
            <span className={styles.insightIcono}>⚖️</span>
            <div>
              Por eso el ibuprofeno bloquea ambas: consigue el efecto antiinflamatorio (COX-2) pero
              paga el precio gástrico y renal (COX-1). Los coxibs intentaron solucionar esto solo
              inhibiendo COX-2 — pero crearon un problema cardiovascular diferente.
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 3: Dónde funciona mejor ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dónde Funciona Mejor — 5 Situaciones con Eficacia Antiinflamatoria</h2>
        <p className={styles.sectionDesc}>
          Pulsa cada tarjeta para ver el mecanismo detallado
        </p>

        <div className={styles.situacionGrid}>
          {SITUACIONES_USO.map((s, idx) => (
            <button
              key={idx}
              className={`${styles.situacionCard} ${situacionSeleccionada === idx ? styles.situacionCardActiva : ''}`}
              onClick={() => setSituacionSeleccionada(situacionSeleccionada === idx ? null : idx)}
              aria-expanded={situacionSeleccionada === idx}
            >
              <span className={styles.situacionIcono} aria-hidden="true">{s.icono}</span>
              <h3 className={styles.situacionTitulo}>{s.titulo}</h3>
              <span className={styles.situacionEficacia}>Eficacia: {s.eficacia}</span>
              {situacionSeleccionada === idx && (
                <div className={styles.situacionDetalle}>
                  <p className={styles.situacionMecanismo}>{s.mecanismo}</p>
                  <p className={styles.situacionNota}>
                    <strong>Nota:</strong> {s.nota}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN 4: Efectos adversos ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Efectos Adversos — Los Tres Sistemas en Riesgo</h2>
          <p className={styles.sectionDesc}>
            El precio de inhibir COX-1 en tejidos que la necesitan. Pulsa cada tarjeta para expandir.
          </p>

          <div className={styles.riesgoGrid}>
            {RIESGOS_ADVERSOS.map((r, idx) => (
              <div key={idx} className={styles.riesgoCard}>
                <button
                  className={styles.riesgoCardHeader}
                  onClick={() => setRiesgoExpandido(riesgoExpandido === idx ? null : idx)}
                  aria-expanded={riesgoExpandido === idx}
                >
                  <span className={styles.riesgoIcono} aria-hidden="true">{r.icono}</span>
                  <span className={styles.riesgoOrgano}>{r.organo}</span>
                  <span className={styles.riesgoToggle} aria-hidden="true">
                    {riesgoExpandido === idx ? '▲' : '▼'}
                  </span>
                </button>
                <p className={styles.riesgoMecanismo}>{r.mecanismo}</p>
                {riesgoExpandido === idx && (
                  <div className={styles.riesgoCardBody}>
                    <div className={styles.riesgoSubseccion}>
                      <h4 className={styles.riesgoSubtitulo}>Síntomas / Manifestaciones</h4>
                      <ul className={styles.riesgoLista}>
                        {r.sintomas.map((s, j) => (
                          <li key={j}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.riesgoSubseccion}>
                      <h4 className={styles.riesgoSubtitulo}>Factores de riesgo</h4>
                      <ul className={styles.riesgoLista}>
                        {r.factoresRiesgo.map((f, j) => (
                          <li key={j}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.riesgoSolucion}>
                      <strong>¿Qué hacer?</strong> {r.solucion}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 5: Los coxibs ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Los Coxibs — Cuando Intentaron Solucionar el Problema Gástrico</h2>
        <p className={styles.sectionDesc}>
          Comparativa de selectividad COX-1/COX-2 entre ibuprofeno, celecoxib y el retirado Vioxx
        </p>

        <div className={styles.coxibsChart}>
          <canvas ref={chartRef} aria-label="Gráfico de selectividad COX de antiinflamatorios" role="img" />
        </div>

        <div className={styles.coxibsLeyenda}>
          {DATOS_COXIBS.map((d) => (
            <div key={d.farmaco} className={styles.coxibsItem}>
              <span className={styles.coxibsNombre}>{d.farmaco}</span>
              <span className={styles.coxibsDescripcion}>{d.descripcion}</span>
            </div>
          ))}
        </div>

        <div className={styles.insightBox}>
          <span className={styles.insightIcono}>🏥</span>
          <div>
            <strong>El caso Vioxx:</strong> Los inhibidores selectivos de COX-2 (coxibs) se desarrollaron
            en los 90s para evitar el daño gástrico. Funcionaron: menos úlceras. Pero en 2004, Merck
            retiró el Vioxx del mercado mundial: los ensayos mostraron que duplicaba el riesgo de infarto
            de miocardio. La razón: al bloquear solo COX-2, eliminaban la PGI2 antitrombótica sin
            compensar con la inhibición de TXA2 de COX-1. Un caso paradigmático de cómo comprender a
            medias el mecanismo genera consecuencias inesperadas.
          </div>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Profundiza en la farmacología del ibuprofeno"
        subtitle="Historia, selectividad COX y los límites de los antiinflamatorios"
      >
        <div className={styles.eduContenido}>
          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>📖 La historia del ibuprofeno</h3>
            <p>
              Stuart Adams trabajaba en Boots UK en los años 60. Un lunes llegó con resaca y se tomó uno
              de sus nuevos compuestos experimentales (ibuprofen). Funcionó mejor que la aspirina. Lo
              patentaron en 1961, fue aprobado en el Reino Unido en 1969 y en Estados Unidos en 1974.
              Hoy es uno de los medicamentos más consumidos del mundo.
            </p>
          </div>

          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>🔬 Ibuprofeno racémico vs enantiómero S</h3>
            <p>
              El ibuprofeno comercial es una mezcla racémica de dos enantiómeros (R y S). Solo el
              enantiómero S(+) es farmacológicamente activo e inhibe las COX. El cuerpo convierte
              parcialmente el R en S mediante una isomerasa hepática. El dexibuprofeno, que solo contiene
              el enantiómero S activo, requiere la mitad de la dosis convencional para el mismo efecto.
            </p>
          </div>

          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>🤰 Ibuprofeno y embarazo</h3>
            <p>
              En el primer trimestre, algunos estudios asocian el uso de ibuprofeno con mayor riesgo de
              aborto espontáneo. En el tercer trimestre está contraindicado: puede cerrar prematuramente
              el ductus arterioso fetal, un vaso necesario para la circulación fetal. El segundo
              trimestre es el período menos problemático, aunque se recomienda evitar salvo necesidad
              médica justificada.
            </p>
          </div>

          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>💊 Interacción ibuprofeno + aspirina baja dosis</h3>
            <p>
              El ibuprofeno puede competir con la aspirina por el sitio de unión en COX-1 de las
              plaquetas. Si el ibuprofeno ocupa ese sitio antes que la aspirina, reduce el efecto
              antiagregante plaquetario de la aspirina a dosis bajas (100 mg). Importante en pacientes
              con enfermedad cardiovascular que toman aspirina como prevención. La solución práctica:
              tomar la aspirina al menos 30 minutos antes del ibuprofeno, o preferir otro analgésico.
            </p>
          </div>

          <div className={styles.warningBox}>
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <p>
              Este visualizador explica mecanismos farmacológicos con fines educativos. Consulta a tu
              médico o farmacéutico antes de tomar ibuprofeno si tienes problemas gástricos, renales,
              cardiovasculares o si estás embarazada.
            </p>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-ibuprofeno" />
      <Footer appName="visualizador-ibuprofeno" />
    </div>
  );
}
