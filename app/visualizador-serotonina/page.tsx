'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './VisualizadorSerotonina.module.css';
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
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type FuncionId = 'animo' | 'sueno' | 'apetito' | 'intestino';
type SinapsisEstado = 'sin' | 'con';

interface PasoSintesis {
  numero: number;
  nombre: string;
  enzima: string;
  descripcion: string;
  color: string;
}

interface FuncionData {
  id: FuncionId;
  icono: string;
  nombre: string;
  contenido: string;
}

interface FaqData {
  pregunta: string;
  respuesta: string;
}

// ─────────────────────────────────────────────
// Datos: Distribución serotonina
// ─────────────────────────────────────────────

const PASOS_SINTESIS: PasoSintesis[] = [
  {
    numero: 1,
    nombre: 'Triptófano',
    enzima: 'Aminoácido esencial (dieta)',
    descripcion: 'Obtenido de huevos, nueces, plátano y lácteos. Compite con otros aminoácidos para cruzar la barrera hematoencefálica mediante transportadores.',
    color: '#7FB3D3',
  },
  {
    numero: 2,
    nombre: '5-HTP',
    enzima: 'Triptófano hidroxilasa (TPH)',
    descripcion: 'La enzima TPH convierte el triptófano en 5-hidroxitriptófano. Requiere hierro y oxígeno. TPH1 actúa en el intestino, TPH2 en el cerebro.',
    color: '#48A9A6',
  },
  {
    numero: 3,
    nombre: 'Serotonina (5-HT)',
    enzima: 'DOPA descarboxilasa + vitamina B6',
    descripcion: 'La DOPA descarboxilasa con vitamina B6 como cofactor convierte el 5-HTP en serotonina. Se almacena en vesículas sinápticas lista para ser liberada.',
    color: '#2E86AB',
  },
  {
    numero: 4,
    nombre: 'Melatonina (en pineal)',
    enzima: 'AANAT + HIOMT (en oscuridad)',
    descripcion: 'En la glándula pineal, con oscuridad, la serotonina se convierte en melatonina. Esto explica el vínculo bioquímico entre el sueño y la serotonina.',
    color: '#1A5276',
  },
];

const FUNCIONES_DATA: FuncionData[] = [
  {
    id: 'animo',
    icono: '🧠',
    nombre: 'Estado de ánimo',
    contenido: 'Las neuronas del núcleo del rafe proyectan serotonina a prácticamente todo el córtex, sistema límbico y ganglios basales. No "causa" felicidad directamente, sino que modula la respuesta emocional: reduce la reactividad al estrés y aumenta la tolerancia a la frustración. Por eso los SSRI no generan euforia sino estabilidad emocional. La distinción es crucial: la serotonina no es la "molécula de la felicidad", es la "molécula de la estabilidad".',
  },
  {
    id: 'sueno',
    icono: '😴',
    nombre: 'Sueño',
    contenido: 'La serotonina promueve el sueño NREM (no-REM). Es además el precursor directo de la melatonina en la glándula pineal. Paradoja conocida: los SSRI aumentan la disponibilidad de serotonina pero al principio pueden empeorar la calidad del sueño. Esto ocurre porque activan receptores 5-HT2A que suprimen el sueño REM. Con el tiempo, la adaptación de los receptores normaliza el patrón de sueño.',
  },
  {
    id: 'apetito',
    icono: '🍽️',
    nombre: 'Apetito y saciedad',
    contenido: 'La serotonina hipotalámica señaliza saciedad. Los receptores 5-HT2C son los principales reguladores de la ingesta calórica. Cuando se activan, reducen el apetito y aumentan el gasto energético. Históricamente, fármacos como la fenfluramina o la sibutramina actuaban sobre el sistema serotoninérgico para reducir peso. Los efectos secundarios cardiovasculares llevaron a la retirada de varios de ellos.',
  },
  {
    id: 'intestino',
    icono: '🫄',
    nombre: 'Motilidad intestinal',
    contenido: 'En el intestino, la serotonina (fabricada en células enterocromafines) coordina las contracciones peristálticas que mueven el contenido intestinal. Cuando el intestino detecta irritantes —comida en mal estado, infección bacteriana, tóxicos— libera serotonina masivamente. Esto activa receptores 5-HT3 en el nervio vago, provocando náuseas y diarrea como mecanismo de expulsión rápida. Los antagonistas 5-HT3 como el ondansetrón bloquean este reflejo y se usan en quimioterapia.',
  },
];

const FAQS_DATA: FaqData[] = [
  {
    pregunta: '¿Los SSRI dan felicidad artificial?',
    respuesta: 'No. Los SSRI restauran un tono serotoninérgico disminuido, no crean euforia. La persona recupera su rango emocional normal, pero no experimenta placer artificial. Quien responde bien a un SSRI describe que "las cosas que antes le importaban vuelven a importarle".',
  },
  {
    pregunta: '¿Los SSRI crean dependencia?',
    respuesta: 'No en el sentido clásico (no hay tolerancia ni búsqueda compulsiva). Sin embargo, la retirada brusca puede causar síndrome de discontinuación: mareos, parestesias, irritabilidad, síntomas similares a la gripe. Por eso siempre se retiran gradualmente bajo supervisión médica.',
  },
  {
    pregunta: '¿El triptófano de la dieta aumenta la serotonina cerebral?',
    respuesta: 'En teoría sí, pero el efecto es modesto. El triptófano compite con otros aminoácidos de cadena ramificada para entrar al cerebro, por lo que solo una fracción pequeña llega. Además, la síntesis de serotonina está regulada primariamente por el disparo neuronal, no solo por la disponibilidad del precursor.',
  },
];

// ─────────────────────────────────────────────
// Bloque 1: Distribución en el cuerpo
// ─────────────────────────────────────────────

function BloqueDistribucion() {
  const datosGrafico = {
    labels: ['Intestino (células enterocromafines)', 'Plaquetas sanguíneas', 'Cerebro (núcleo del rafe)'],
    datasets: [
      {
        data: [90, 8, 2],
        backgroundColor: ['#2E86AB', '#48A9A6', '#7FB3D3'],
        borderColor: ['#FAFAFA', '#FAFAFA', '#FAFAFA'],
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) =>
            ` ${ctx.label}: ${ctx.parsed}%`,
        } as never,
      },
    },
  };

  const leyendaItems = [
    { porcentaje: '90%', lugar: 'Intestino', detalle: 'Células enterocromafines de la mucosa. Regula motilidad y secreción intestinal.', color: '#2E86AB' },
    { porcentaje: '8%', lugar: 'Plaquetas sanguíneas', detalle: 'Las plaquetas no fabrican serotonina; la transportan. Papel en hemostasis y vasoconstricción.', color: '#48A9A6' },
    { porcentaje: '2%', lugar: 'Cerebro', detalle: 'Neuronas del núcleo del rafe del troncoencéfalo. El único 2% que afecta al estado de ánimo.', color: '#7FB3D3' },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>El Gran Mito: ¿Dónde Está Realmente la Serotonina?</h2>
      <p className={styles.sectionDesc}>
        Cuando pensamos en serotonina pensamos en el cerebro. Pero la distribución real es radicalmente distinta.
      </p>

      <div className={styles.distribucionLayout}>
        <div className={styles.distribucionChart}>
          <Doughnut data={datosGrafico} options={opcionesGrafico} />
          <div className={styles.distribucionCentro}>
            <span className={styles.distribucionCentroNum}>90%</span>
            <span className={styles.distribucionCentroLabel}>intestino</span>
          </div>
        </div>

        <div className={styles.distribucionLeyenda}>
          {leyendaItems.map((item) => (
            <div key={item.lugar} className={styles.leyendaItem}>
              <div className={styles.leyendaColor} style={{ backgroundColor: item.color }} aria-hidden="true" />
              <div className={styles.leyendaTexto}>
                <span className={styles.leyendaPct} style={{ color: item.color }}>{item.porcentaje}</span>
                <span className={styles.leyendaLugar}>{item.lugar}</span>
                <span className={styles.leyendaDetalle}>{item.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insightBox}>
        <p>
          <strong>La barrera hematoencefálica impide que la serotonina intestinal entre al cerebro.</strong> El intestino y el
          cerebro tienen sistemas serotoninérgicos completamente separados. Lo que comes puede afectar al intestino,
          pero el cerebro fabrica su propia serotonina de manera independiente.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 2: Síntesis paso a paso
// ─────────────────────────────────────────────

function BloqueSintesis() {
  const [pasoActivo, setPasoActivo] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Síntesis Paso a Paso: Del Triptófano a la Serotonina</h2>
      <p className={styles.sectionDesc}>
        La serotonina no se fabrica de la nada. Sigue una cadena enzimática de 3 pasos (o 4, si termina en melatonina).
        Haz clic en cada paso para ver el detalle.
      </p>

      <div className={styles.sintesisGrid}>
        {PASOS_SINTESIS.map((paso) => (
          <button
            key={paso.numero}
            type="button"
            className={`${styles.sintesisPaso} ${pasoActivo === paso.numero ? styles.sintesisPasoActivo : ''}`}
            style={{ '--paso-color': paso.color } as React.CSSProperties}
            onClick={() => setPasoActivo(pasoActivo === paso.numero ? null : paso.numero)}
            aria-expanded={pasoActivo === paso.numero}
          >
            <div className={styles.sintesisNumero} style={{ backgroundColor: paso.color }} aria-hidden="true">
              {paso.numero}
            </div>
            <div className={styles.sintesisContenido}>
              <span className={styles.sintesisNombre}>{paso.nombre}</span>
              <span className={styles.sintesisEnzima}>{paso.enzima}</span>
              {pasoActivo === paso.numero && (
                <p className={styles.sintesisDesc}>{paso.descripcion}</p>
              )}
            </div>
            <span className={styles.sintesisChevron} aria-hidden="true">
              {pasoActivo === paso.numero ? '▲' : '▼'}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.sintesisFlujo} aria-label="Flujo de síntesis: Dieta → Triptófano → 5-HTP → Serotonina → Melatonina (en oscuridad)">
        <span className={styles.flujoItem} style={{ background: '#7FB3D3' }}>Dieta</span>
        <span className={styles.flujoFlecha} aria-hidden="true">→</span>
        <span className={styles.flujoItem} style={{ background: '#7FB3D3' }}>Triptófano</span>
        <span className={styles.flujoFlecha} aria-hidden="true">→</span>
        <span className={styles.flujoItem} style={{ background: '#48A9A6' }}>5-HTP</span>
        <span className={styles.flujoFlecha} aria-hidden="true">→</span>
        <span className={styles.flujoItem} style={{ background: '#2E86AB' }}>Serotonina</span>
        <span className={styles.flujoFlecha} aria-hidden="true">→</span>
        <span className={styles.flujoItem} style={{ background: '#1A5276' }}>Melatonina <span aria-hidden="true">🌙</span></span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 3: Las 4 funciones principales
// ─────────────────────────────────────────────

function BloqueFunciones() {
  const [funcionActiva, setFuncionActiva] = useState<FuncionId>('animo');
  const panelRef = useRef<HTMLDivElement>(null);

  const funcion = FUNCIONES_DATA.find(f => f.id === funcionActiva) ?? FUNCIONES_DATA[0];

  const handleClick = (id: FuncionId) => {
    setFuncionActiva(id);
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Las 4 Funciones Principales de la Serotonina</h2>
      <p className={styles.sectionDesc}>
        La serotonina actúa en sistemas muy distintos del cuerpo. Selecciona cada función para ver el mecanismo.
      </p>

      <div className={styles.funcionesNav} role="tablist" aria-label="Funciones de la serotonina">
        {FUNCIONES_DATA.map(f => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={funcionActiva === f.id}
            className={`${styles.funcionBtn} ${funcionActiva === f.id ? styles.funcionBtnActivo : ''}`}
            onClick={() => handleClick(f.id)}
          >
            <span aria-hidden="true">{f.icono}</span>
            <span>{f.nombre}</span>
          </button>
        ))}
      </div>

      <div
        ref={panelRef}
        className={styles.funcionPanel}
        role="tabpanel"
        aria-label={`Función: ${funcion.nombre}`}
      >
        <div className={styles.funcionPanelHeader}>
          <span aria-hidden="true">{funcion.icono}</span>
          <strong>{funcion.nombre}</strong>
        </div>
        <p className={styles.funcionPanelTexto}>{funcion.contenido}</p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 4: SSRI — diagrama de sinapsis
// ─────────────────────────────────────────────

function BloqueSSRI() {
  const [estado, setEstado] = useState<SinapsisEstado>('sin');

  const contenidoSin = (
    <div className={styles.sinapsisContenido}>
      <div className={styles.sinapsisNeurona} aria-label="Neurona presináptica">
        <div className={styles.sinapsisNeuronaTitulo}>Neurona presináptica</div>
        <div className={styles.sinapsisMolecula} style={{ background: '#2E86AB' }}>5-HT liberada</div>
        <div className={styles.sinapsisFlujoDown} aria-hidden="true">↓</div>
      </div>
      <div className={styles.sinapsisHendidura} aria-label="Hendidura sináptica">
        <div className={styles.sinapsisHendiduraTxt}>Hendidura sináptica</div>
        <div className={styles.sinapsisMoleculaFlotante} style={{ background: '#48A9A6' }}>5-HT</div>
        <div className={styles.sinapsisSert}>SERT recapta →</div>
      </div>
      <div className={styles.sinapsisNeurona} aria-label="Neurona postsináptica">
        <div className={styles.sinapsisNeuronaTitulo}>Neurona postsináptica</div>
        <div className={styles.sinapsisReceptor} style={{ borderColor: '#2E86AB' }}>Receptor 5-HT activado (brevemente)</div>
      </div>
      <p className={styles.sinapsisDesc}>
        La serotonina se une a los receptores postsinápticos. El transportador SERT la recapta rápidamente de vuelta
        a la neurona presináptica, terminando la señal.
      </p>
    </div>
  );

  const contenidoCon = (
    <div className={styles.sinapsisContenido}>
      <div className={styles.sinapsisNeurona} aria-label="Neurona presináptica con SSRI">
        <div className={styles.sinapsisNeuronaTitulo}>Neurona presináptica</div>
        <div className={styles.sinapsisMolecula} style={{ background: '#2E86AB' }}>5-HT liberada</div>
        <div className={styles.sinapsisFlujoDown} aria-hidden="true">↓</div>
      </div>
      <div className={styles.sinapsisHendidura} aria-label="Hendidura sináptica con SSRI">
        <div className={styles.sinapsisHendiduraTxt}>Hendidura sináptica</div>
        <div className={styles.sinapsisMoleculaFlotanteAcum}>
          <span style={{ background: '#48A9A6' }} className={styles.sinapsisMolPeq}>5-HT</span>
          <span style={{ background: '#48A9A6' }} className={styles.sinapsisMolPeq}>5-HT</span>
          <span style={{ background: '#48A9A6' }} className={styles.sinapsisMolPeq}>5-HT</span>
        </div>
        <div className={styles.ssriTag} aria-label="SSRI bloquea SERT">SSRI bloquea SERT 🚫</div>
      </div>
      <div className={styles.sinapsisNeurona} aria-label="Neurona postsináptica con SSRI">
        <div className={styles.sinapsisNeuronaTitulo}>Neurona postsináptica</div>
        <div className={styles.sinapsisReceptor} style={{ borderColor: '#48A9A6', background: 'rgba(72,169,166,0.12)' }}>
          Receptor 5-HT activado de forma prolongada <span aria-hidden="true">✓</span>
        </div>
      </div>
      <p className={styles.sinapsisDesc}>
        El SSRI bloquea el transportador SERT → la serotonina permanece más tiempo en la sinapsis →
        mayor activación de receptores postsinápticos. <strong>¿Por qué tardan 2-4 semanas?</strong> Al principio,
        el autorreceptor 5-HT1A de la neurona presináptica frena la liberación como compensación.
        Con el tiempo, ese autorreceptor se desensibiliza → aumenta la liberación neta de serotonina.
      </p>
    </div>
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>SSRI: Cómo Funcionan Realmente</h2>
      <p className={styles.sectionDesc}>
        Los antidepresivos SSRI (inhibidores selectivos de la recaptación de serotonina) actúan sobre el transportador SERT.
        Compara los dos estados de la sinapsis.
      </p>

      <div className={styles.sinapsisTabs} role="tablist" aria-label="Estados de la sinapsis">
        <button
          type="button"
          role="tab"
          aria-selected={estado === 'sin'}
          className={`${styles.sinapsisTab} ${estado === 'sin' ? styles.sinapsisTabActivo : ''}`}
          onClick={() => setEstado('sin')}
        >
          Sin SSRI
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={estado === 'con'}
          className={`${styles.sinapsisTab} ${estado === 'con' ? styles.sinapsisTabActivo : ''}`}
          onClick={() => setEstado('con')}
        >
          Con SSRI
        </button>
      </div>

      <div className={styles.sinapsisDiagram} role="tabpanel">
        {estado === 'sin' ? contenidoSin : contenidoCon}
      </div>

      <div className={styles.faqGrid}>
        {FAQS_DATA.map((faq, i) => (
          <div key={i} className={styles.faqCard}>
            <p className={styles.faqPregunta}>{faq.pregunta}</p>
            <p className={styles.faqRespuesta}>{faq.respuesta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSerotoninaPagina() {
  useEffect(() => {
    // Asegurar que ChartJS está registrado en cliente
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>NEUROCIENCIA</span>
          <h1 className={styles.heroTitle}>Serotonina: Mucho Más que la Hormona de la Felicidad</h1>
          <p className={styles.heroSubtitle}>El 90% está en el intestino, no en el cerebro</p>
          <p className={styles.heroDesc}>
            La serotonina regula el estado de ánimo, el sueño, el apetito y la motilidad intestinal.
            Pero el mayor mito es que sea &ldquo;la molécula de la felicidad&rdquo;: su papel real es más complejo y fascinante.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" />

      <BloqueDistribucion />
      <BloqueSintesis />
      <BloqueFunciones />
      <BloqueSSRI />

      <EducationalSection
        title="Profundiza en la neurociencia de la serotonina"
        subtitle="Receptores, eje intestino-cerebro y farmacología serotoninérgica"
      >
        <h3>Las 7 familias de receptores 5-HT: ionotrópicos vs metabotrópicos</h3>
        <p>
          Existen 7 familias de receptores serotoninérgicos (5-HT1 a 5-HT7). La mayoría son metabotrópicos (acoplados a proteína G),
          lo que significa que actúan de manera lenta e indirecta modificando la concentración de segundos mensajeros (AMPc, IP3).
          La excepción es el <strong>receptor 5-HT3</strong>, que es ionotrópico: abre directamente un canal de cationes y genera una
          respuesta eléctrica rápida. Esta heterogeneidad explica por qué la misma molécula puede tener efectos tan distintos
          según el tipo de receptor que active: ansiedad (5-HT1A), alucinaciones (5-HT2A), náuseas (5-HT3), migraña (5-HT1B/D).
        </p>

        <h3>El eje intestino-cerebro: el nervio vago como autopista bidireccional</h3>
        <p>
          El nervio vago transporta información en ambas direcciones entre el intestino y el cerebro.
          Aproximadamente el 80-90% de las fibras del vago son <em>aferentes</em> (de intestino a cerebro),
          lo que significa que el intestino envía más señales al cerebro que al revés.
          La serotonina intestinal activa terminaciones del nervio vago, que transmiten señales de saciedad, malestar o bienestar al troncoencéfalo.
          Esta comunicación forma parte del llamado <strong>eje intestino-cerebro-microbiota</strong>:
          las bacterias intestinales pueden influir en el estado de ánimo en parte a través de la modulación de la serotonina intestinal.
        </p>

        <h3>Síndrome serotoninérgico: demasiada serotonina</h3>
        <p>
          Cuando hay exceso de actividad serotoninérgica (generalmente por combinación de fármacos), puede producirse el
          síndrome serotoninérgico. La tríada clásica es: <strong>alteración del estado mental</strong> (agitación, confusión),
          <strong>hiperactividad autonómica</strong> (taquicardia, sudoración, fiebre) y <strong>anormalidades neuromusculares</strong> (clonus, temblor, hiperreflexia).
          Es raro pero potencialmente grave. Ocurre con frecuencia al combinar SSRI con tramadol, IMAO, triptanos o ciertos antibióticos (linezolid).
          El tratamiento es retirar los fármacos causantes y, en casos graves, usar ciproheptadina (antagonista 5-HT2A).
        </p>

        <h3>Psilocibina y LSD: agonistas del receptor 5-HT2A</h3>
        <p>
          Los alucinógenos clásicos (psilocibina, LSD, mescalina) son agonistas parciales del receptor 5-HT2A en la corteza prefrontal.
          La activación masiva de 5-HT2A en la capa V de la corteza genera una cascada de señalización intracelular que produce
          la disrupción de las redes por defecto (default mode network) y la hiperconectividad entre regiones cerebrales normalmente
          aisladas. Esto se percibe como alucinaciones visuales, sinestesia y experiencias de disolución del ego.
          Paradójicamente, esta misma acción sobre 5-HT2A está siendo investigada para el tratamiento de la depresión resistente,
          el TEPT y las adicciones.
        </p>

        <div className={styles.warningBox}>
          <strong>Aviso educativo:</strong> Este visualizador explica mecanismos neurobiológicos con fines educativos.
          El tratamiento de cualquier condición relacionada con la serotonina (depresión, ansiedad, trastornos del sueño)
          requiere evaluación y seguimiento por un profesional médico. Los datos presentados son aproximaciones didácticas.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-serotonina')} />
      <ShareCard appName="visualizador-serotonina" />
      <Footer appName="visualizador-serotonina" />
    </div>
  );
}
