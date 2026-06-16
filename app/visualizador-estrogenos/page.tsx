'use client';
import { useState, useEffect } from 'react';
import styles from './VisualizadorEstrogenos.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard, EducationalSection } from '@/components';
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
  Filler
);

// ── Tipos ──────────────────────────────────────────────────────────────────

interface TipoEstrogeno {
  id: 'E2' | 'E1' | 'E3';
  nombre: string;
  nombreCompleto: string;
  badge: string;
  descripcion: string;
  produccion: string;
  rolPrincipal: string;
  nota: string;
  color: string;
}

interface SistemaAfectado {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  detalle: string;
}

interface EtapaMenopausia {
  numero: number;
  titulo: string;
  rango: string;
  descripcion: string;
  color: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────

const TIPOS_ESTROGENOS: TipoEstrogeno[] = [
  {
    id: 'E2',
    nombre: 'Estradiol',
    nombreCompleto: 'Estradiol (E2)',
    badge: 'E2',
    descripcion: 'El más potente y el principal durante los años reproductivos.',
    produccion: 'Ovarios (folículos y cuerpo lúteo)',
    rolPrincipal: 'Ciclo menstrual, fertilidad, densidad ósea, salud cardiovascular',
    nota: 'La más activa de las tres durante la vida fértil',
    color: '#D4829A',
  },
  {
    id: 'E1',
    nombre: 'Estrona',
    nombreCompleto: 'Estrona (E1)',
    badge: 'E1',
    descripcion: 'Principal estrógeno después de la menopausia.',
    produccion: 'Tejido adiposo (conversión de andrógenos vía aromatasa)',
    rolPrincipal: 'Estrógeno predominante tras la menopausia',
    nota: 'La que predomina cuando los ovarios reducen su actividad',
    color: '#48A9A6',
  },
  {
    id: 'E3',
    nombre: 'Estriol',
    nombreCompleto: 'Estriol (E3)',
    badge: 'E3',
    descripcion: 'Solo significativo durante el embarazo.',
    produccion: 'Placenta (a partir de precursores fetales)',
    rolPrincipal: 'Alcanza niveles muy altos en el embarazo, el más débil de los tres',
    nota: 'La hormona del embarazo — casi ausente fuera de él',
    color: '#7FB3D3',
  },
];

const SISTEMAS_AFECTADOS: SistemaAfectado[] = [
  {
    id: 'hueso',
    icono: '🦴',
    titulo: 'Hueso',
    descripcion: 'Los estrógenos inhiben los osteoclastos, las células que degradan el hueso.',
    detalle: 'La caída de estrógenos en la menopausia acelera la pérdida ósea: es el principal mecanismo de la osteoporosis postmenopáusica.',
  },
  {
    id: 'cardiovascular',
    icono: '❤️',
    titulo: 'Sistema cardiovascular',
    descripcion: 'El E2 tiene efecto vasoprotector y favorece la producción de óxido nítrico.',
    detalle: 'Reduce la oxidación del LDL. Explica la menor incidencia de enfermedad cardiovascular en mujeres premenopáusicas.',
  },
  {
    id: 'cerebro',
    icono: '🧠',
    titulo: 'Cerebro',
    descripcion: 'Los estrógenos modulan la síntesis de serotonina y dopamina.',
    detalle: 'Influyen en la memoria verbal y la velocidad de procesamiento. Receptores de estrógenos están presentes en el hipocampo y la amígdala.',
  },
  {
    id: 'metabolismo',
    icono: '🩺',
    titulo: 'Metabolismo',
    descripcion: 'Favorece la distribución periférica de grasa (caderas, muslos) en lugar de la visceral.',
    detalle: 'El cambio de distribución grasa en la menopausia tiene base estrogénica.',
  },
  {
    id: 'piel',
    icono: '💧',
    titulo: 'Piel',
    descripcion: 'Estimula la producción de colágeno y la hidratación de la piel.',
    detalle: 'La pérdida de estrógenos acelera la reducción de grosor y elasticidad cutánea.',
  },
  {
    id: 'ojos',
    icono: '👁️',
    titulo: 'Ojos',
    descripcion: 'Los estrógenos influyen en la producción de lágrima.',
    detalle: 'El ojo seco es más prevalente en mujeres, especialmente tras la menopausia.',
  },
  {
    id: 'boca',
    icono: '🦷',
    titulo: 'Boca',
    descripcion: 'Los receptores de estrógenos están presentes en las encías.',
    detalle: 'Los cambios hormonales del ciclo pueden influir en la sensibilidad gingival.',
  },
];

const ETAPAS_MENOPAUSIA: EtapaMenopausia[] = [
  {
    numero: 1,
    titulo: 'Perimenopausia',
    rango: '40-51 años aprox.',
    descripcion: 'Los ciclos se vuelven irregulares. Los niveles de E2 fluctúan. Los ovarios reducen progresivamente su producción. Duración variable: 4-10 años.',
    color: '#D4829A',
  },
  {
    numero: 2,
    titulo: 'Menopausia',
    rango: 'Momento concreto',
    descripcion: 'Definida clínicamente como 12 meses sin menstruación. Promedio en España: ~51 años. No es una enfermedad — es una transición fisiológica.',
    color: '#2E86AB',
  },
  {
    numero: 3,
    titulo: 'Postmenopausia temprana',
    rango: '1-5 años',
    descripcion: 'Caída pronunciada de E2. La estrona (producida en tejido adiposo) se convierte en el estrógeno predominante.',
    color: '#48A9A6',
  },
  {
    numero: 4,
    titulo: 'Postmenopausia establecida',
    rango: '>5 años',
    descripcion: 'Niveles bajos estables. El cuerpo se adapta. Mayor énfasis en salud ósea y cardiovascular.',
    color: '#7FB3D3',
  },
];

// Datos del ciclo (normalizados 0-100)
const DIAS_CICLO = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
const DATOS_E2 = [20,18,22,28,35,45,58,72,88,95,100,98,75,40,35,38,42,50,60,65,62,55,45,38,30,25,20,18];
const DATOS_PROGESTERONA = [5,5,5,5,5,5,5,5,5,5,5,5,5,5,15,25,45,60,75,82,80,72,60,45,30,18,8,5];

// ── Componente Principal ────────────────────────────────────────────────────

export default function VisualizadorEstrogenos() {
  const [sistemasExpandidos, setSistemasExpandidos] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggleSistema = (id: string) => {
    setSistemasExpandidos(prev => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) {
        siguiente.delete(id);
      } else {
        siguiente.add(id);
      }
      return siguiente;
    });
  };

  const colorTexto = isDark ? '#E5E5E5' : '#1A1A1A';
  const colorRejilla = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const datosGrafico = {
    labels: DIAS_CICLO.map(d => `Día ${d}`),
    datasets: [
      {
        label: 'Estradiol (E2)',
        data: DATOS_E2,
        borderColor: '#D4829A',
        backgroundColor: 'rgba(212, 130, 154, 0.15)',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Progesterona',
        data: DATOS_PROGESTERONA,
        borderColor: '#48A9A6',
        backgroundColor: 'rgba(72, 169, 166, 0.15)',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colorTexto,
          font: { size: 13 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label: string }; parsed: { y: number } }) =>
            `${ctx.dataset.label}: ${ctx.parsed.y} (escala relativa)`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: colorTexto,
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 14,
        },
        grid: { color: colorRejilla },
      },
      y: {
        ticks: { color: colorTexto },
        grid: { color: colorRejilla },
        title: {
          display: true,
          text: 'Nivel relativo (0-100)',
          color: colorTexto,
          font: { size: 12 },
        },
        min: 0,
        max: 110,
      },
    },
  };

  const relatedApps = getRelatedApps('visualizador-estrogenos');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroBadge}>Visualizador Educativo</div>
        <h1>Estrógenos</h1>
        <p>Las hormonas del ciclo, el hueso y la salud — tres moléculas, mil funciones</p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" />

      {/* ── Bloque 1: Los Tres Estrógenos ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Los Tres Estrógenos</h2>
        <p className={styles.sectionSubtitle}>
          &ldquo;Estrógenos&rdquo; no es una sola hormona — son una familia de tres moléculas con propiedades distintas.
        </p>

        <div className={styles.gridTresEstrogenos}>
          {TIPOS_ESTROGENOS.map(tipo => (
            <div key={tipo.id} className={styles.tarjetaEstrogeno}>
              <div
                className={`${styles.badgeEstrogeno} ${
                  tipo.id === 'E2' ? styles.badgeE2 :
                  tipo.id === 'E1' ? styles.badgeE1 :
                  styles.badgeE3
                }`}
              >
                {tipo.badge}
              </div>
              <h3>{tipo.nombreCompleto}</h3>
              <p className={styles.tarjetaDescripcion}>{tipo.descripcion}</p>
              <div className={styles.tarjetaDato}>
                <span className={styles.tarjetaEtiqueta}>Producción</span>
                <span>{tipo.produccion}</span>
              </div>
              <div className={styles.tarjetaDato}>
                <span className={styles.tarjetaEtiqueta}>Rol principal</span>
                <span>{tipo.rolPrincipal}</span>
              </div>
              <div className={styles.tarjetaNota} style={{ borderLeftColor: tipo.color }}>
                <em>{tipo.nota}</em>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bloque 2: Ciclo Menstrual ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>El Ciclo Menstrual y los Estrógenos</h2>
        <p className={styles.sectionSubtitle}>
          Evolución del estradiol (E2) y la progesterona a lo largo de un ciclo de 28 días.
        </p>

        <div className={styles.leyendaCiclo}>
          <span className={styles.leyendaFase} style={{ background: 'rgba(212,130,154,0.25)', borderColor: '#D4829A' }}>
            Menstruación (días 1-5)
          </span>
          <span className={styles.leyendaFase} style={{ background: 'rgba(100,200,130,0.2)', borderColor: '#4CAF50' }}>
            Fase folicular (días 6-13)
          </span>
          <span className={styles.leyendaFase} style={{ background: 'rgba(255,200,50,0.2)', borderColor: '#FFC107' }}>
            Ovulación (día 14)
          </span>
          <span className={styles.leyendaFase} style={{ background: 'rgba(127,179,211,0.25)', borderColor: '#7FB3D3' }}>
            Fase lútea (días 15-28)
          </span>
        </div>

        <div className={styles.chartContainer}>
          <Line data={datosGrafico} options={opcionesGrafico as never} />
        </div>

        <div className={styles.anotacionesCiclo}>
          <div className={styles.anotacion}>
            <span className={styles.anotacionDot} style={{ background: '#D4829A' }}></span>
            <span>Pico de E2 preovulatorio — señal que desencadena la ovulación</span>
          </div>
          <div className={styles.anotacion}>
            <span className={styles.anotacionDot} style={{ background: '#48A9A6' }}></span>
            <span>Progesterona domina la fase lútea — prepara el endometrio</span>
          </div>
        </div>

        <p className={styles.notaCiclo}>
          <strong>Nota:</strong> Ciclo ilustrativo de 28 días. Los ciclos reales varían ampliamente entre personas.
        </p>
      </section>

      {/* ── Bloque 3: Estrógenos en el Cuerpo ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Estrógenos en el Cuerpo: Más Allá del Ciclo</h2>
        <p className={styles.sectionSubtitle}>
          Los estrógenos actúan en casi todos los sistemas del organismo. Toca cada tarjeta para ver el mecanismo.
        </p>

        <div className={styles.gridSistemas}>
          {SISTEMAS_AFECTADOS.map(sistema => (
            <button
              key={sistema.id}
              type="button"
              className={`${styles.tarjetaSistema} ${sistemasExpandidos.has(sistema.id) ? styles.tarjetaSistemaActiva : ''}`}
              onClick={() => toggleSistema(sistema.id)}
              aria-expanded={sistemasExpandidos.has(sistema.id)}
              aria-label={`Ver detalle: ${sistema.titulo}`}
            >
              <div className={styles.tarjetaSistemaHeader}>
                <span className={styles.tarjetaSistemaIcono} aria-hidden="true">{sistema.icono}</span>
                <span className={styles.tarjetaSistemaTitulo}>{sistema.titulo}</span>
                <span className={styles.tarjetaSistemaChevron} aria-hidden="true">
                  {sistemasExpandidos.has(sistema.id) ? '▲' : '▼'}
                </span>
              </div>
              <p className={styles.tarjetaSistemaDesc}>{sistema.descripcion}</p>
              {sistemasExpandidos.has(sistema.id) && (
                <div className={styles.tarjetaSistemaDetalle}>
                  <p>{sistema.detalle}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className={styles.tarjetaSorpresa}>
          <div className={styles.tarjetaSorpresaIcono} aria-hidden="true">💡</div>
          <div>
            <h3 className={styles.tarjetaSorpresaTitulo}>Dato sorprendente: estrógenos en los hombres</h3>
            <p>
              Los hombres también producen estrógenos — principalmente por conversión de testosterona
              vía la enzima <strong>aromatasa</strong> en el tejido adiposo. Son necesarios para la
              salud ósea, la función sexual y el metabolismo masculino.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bloque 4: Menopausia ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>La Menopausia: Una Transición Fisiológica</h2>
        <p className={styles.sectionSubtitle}>
          Cuatro etapas del proceso que marca el fin de la vida reproductiva.
        </p>

        <div className={styles.timelineMenopausia}>
          {ETAPAS_MENOPAUSIA.map(etapa => (
            <div key={etapa.numero} className={styles.etapaMenopausia}>
              <div className={styles.etapaNumero} style={{ background: etapa.color }}>
                {etapa.numero}
              </div>
              <div className={styles.etapaContenido}>
                <h3 className={styles.etapaTitulo}>{etapa.titulo}</h3>
                <span className={styles.etapaRango}>{etapa.rango}</span>
                <p className={styles.etapaDescripcion}>{etapa.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.notaEducativa}>
          <span className={styles.notaEducativaIcono} aria-hidden="true">ℹ️</span>
          <p>
            <strong>Nota educativa:</strong> La menopausia es una etapa vital normal, no una patología.
            La experiencia varía enormemente de una persona a otra. Su acompañamiento médico permite
            adaptar el seguimiento a cada caso individual.
          </p>
        </div>
      </section>

      {/* ── Sección Educativa ── */}
      <EducationalSection
        title="Profundiza en los estrógenos"
        subtitle="Tipos, ciclo, menopausia y mitos"
      >
        <div className={styles.educationalContent}>
          <div className={styles.educationalBlock}>
            <h3>¿Qué es la aromatasa y por qué importa?</h3>
            <p>
              La aromatasa es una enzima (CYP19A1) que convierte andrógenos (como la testosterona)
              en estrógenos. Está presente en ovarios, tejido adiposo, hígado, cerebro y músculo.
              En mujeres postmenopáusicas y en hombres, el tejido adiposo es la principal fuente
              de estrógenos precisamente gracias a esta enzima. Un exceso de tejido adiposo puede
              elevar los niveles de estrona.
            </p>
          </div>

          <div className={styles.educationalBlock}>
            <h3>FSH y LH: las hormonas que controlan los estrógenos</h3>
            <p>
              La FSH (hormona foliculoestimulante) y la LH (hormona luteinizante), producidas
              por la hipófisis, regulan la producción ovárica de estrógenos. La FSH estimula
              el crecimiento folicular y, con él, la producción de E2. El pico de LH a mitad
              de ciclo desencadena la ovulación. En la menopausia, los niveles de FSH aumentan
              notablemente porque los ovarios responden menos.
            </p>
          </div>

          <div className={styles.educationalBlock}>
            <h3>Fitoestrógenos: qué son y qué dice la ciencia</h3>
            <p>
              Los fitoestrógenos son compuestos de origen vegetal (isoflavonas en soja, lignanos
              en linaza) que pueden unirse a los receptores de estrógenos con menor potencia que
              el E2. La investigación sobre sus efectos es heterogénea: algunos estudios muestran
              beneficios leves en síntomas menopáusicos, otros no encuentran diferencias
              significativas respecto al placebo. No existe evidencia sólida para recomendaciones
              clínicas generalizadas.
            </p>
          </div>

          <div className={styles.educationalBlock}>
            <h3>Estrógenos ambientales (disruptores endocrinos): mecanismo educativo</h3>
            <p>
              Algunos compuestos sintéticos — bisfenol A (BPA), ciertos pesticidas, ftalatos —
              tienen estructura química que les permite unirse a receptores de estrógenos, actuando
              como agonistas o antagonistas. Se denominan xenoestrógenos. La investigación estudia
              su efecto acumulativo en la exposición crónica de baja dosis, aunque los mecanismos
              y umbrales de riesgo siguen siendo objeto de investigación activa.
            </p>
          </div>

          <div className={styles.educationalBlock}>
            <h3>¿Por qué el ciclo afecta al humor? La base hormonal</h3>
            <p>
              El E2 modula la disponibilidad de serotonina (incrementa la densidad de receptores
              5-HT2A y la actividad de la enzima que sintetiza serotonina), dopamina y
              noradrenalina. La caída de E2 al final del ciclo puede reducir temporalmente
              la neurotransmisión serotoninérgica. Esto tiene base fisiológica, aunque la
              magnitud del efecto varía enormemente entre individuos.
            </p>
          </div>

          <div className={styles.warningBox} role="note">
            <strong>Uso educativo:</strong> Esta app explica la fisiología de los estrógenos con fines
            educativos. Cualquier duda sobre el ciclo menstrual, la menopausia o la salud hormonal
            debe abordarse con un profesional médico.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-estrogenos" />
      <Footer appName="visualizador-estrogenos" />
    </div>
  );
}
