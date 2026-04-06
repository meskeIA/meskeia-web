'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorDesarrolloFarmaco.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'busqueda' | 'ensayos' | 'aprobacion' | 'despues';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'busqueda', titulo: 'La búsqueda', icono: '🔬', subtitulo: 'De 10.000 compuestos a 5 candidatos' },
  { id: 'ensayos', titulo: 'Ensayos clínicos', icono: '🏥', subtitulo: 'Fases I, II y III en humanos' },
  { id: 'aprobacion', titulo: 'Aprobación', icono: '✅', subtitulo: 'De la agencia reguladora al mercado' },
  { id: 'despues', titulo: 'Después', icono: '📋', subtitulo: 'Vigilancia, genéricos y precios' },
];

// ─────────────────────────────────────────────
// Sección 1: La búsqueda
// ─────────────────────────────────────────────

function SeccionBusqueda() {
  const embudo = [
    {
      etapa: 'Compuestos candidatos',
      cantidad: 10000,
      pctAncho: 100,
      color: '#2E86AB',
      icono: '🧪',
      descripcion: 'Los investigadores identifican una diana terapéutica (una proteína, un gen) e inventan miles de moléculas que podrían interactuar con ella. Robots de cribado automático prueban millones de combinaciones.',
    },
    {
      etapa: 'Pruebas in vitro',
      cantidad: 250,
      pctAncho: 55,
      color: '#3A94B8',
      icono: '🔬',
      descripcion: 'Los compuestos más prometedores se prueban en células cultivadas en laboratorio. Se evalúa si realmente afectan a la diana terapéutica sin destruir células sanas.',
    },
    {
      etapa: 'Pruebas en animales',
      cantidad: 5,
      pctAncho: 25,
      color: '#48A9A6',
      icono: '🐁',
      descripcion: 'Los supervivientes se prueban en animales de laboratorio (ratones, ratas). Se estudia la toxicidad, dosis segura, cómo se absorbe y elimina del cuerpo (farmacocinética).',
    },
    {
      etapa: 'Candidatos a ensayo clínico',
      cantidad: 1,
      pctAncho: 12,
      color: '#27ae60',
      icono: '💊',
      descripcion: 'Solo los compuestos que demuestran seguridad y eficacia preclínica pasan a ensayos en humanos. Esta fase dura 3-6 años y cuesta cientos de millones de euros.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Todo medicamento empieza con una pregunta: <strong>&laquo;¿Qué molécula podría combatir esta enfermedad?&raquo;</strong> La respuesta requiere probar miles de candidatos y descartar el 99,99%.</p>
      </div>

      {/* Embudo visual */}
      <div className={styles.embudoContainer}>
        {embudo.map((e, i) => (
          <div key={i} className={styles.embudoEtapa}>
            <div className={styles.embudoBarraWrap}>
              <div
                className={styles.embudoBarra}
                style={{ width: `${e.pctAncho}%`, background: e.color }}
              >
                <span className={styles.embudoCantidad}>
                  {formatNumber(e.cantidad, 0)}
                </span>
              </div>
            </div>
            <div className={styles.embudoInfo}>
              <div className={styles.embudoTituloRow}>
                <span className={styles.embudoIcono} aria-hidden="true">{e.icono}</span>
                <span className={styles.embudoNombre}>{e.etapa}</span>
              </div>
              <p className={styles.embudoDesc}>{e.descripcion}</p>
            </div>
          </div>
        ))}

        {/* Flechas entre etapas */}
        <div className={styles.embudoResumen}>
          <span className={styles.embudoResumenNumero}>{formatNumber(10000, 0)}</span>
          <span className={styles.embudoResumenFlecha} aria-hidden="true">→</span>
          <span className={styles.embudoResumenNumero}>250</span>
          <span className={styles.embudoResumenFlecha} aria-hidden="true">→</span>
          <span className={styles.embudoResumenNumero}>5</span>
          <span className={styles.embudoResumenFlecha} aria-hidden="true">→</span>
          <span className={styles.embudoResumenDestacado}>1</span>
        </div>
      </div>

      <div className={styles.tiempoCard}>
        <span className={styles.tiempoIcono} aria-hidden="true">⏱️</span>
        <div>
          <span className={styles.tiempoLabel}>Duración de la fase de descubrimiento</span>
          <span className={styles.tiempoValor}>3 – 6 años</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El desarrollo farmacéutico es un proceso de <strong>descarte masivo</strong>. La inmensa mayoría
          de los compuestos fallan porque son tóxicos, no funcionan en organismos vivos o tienen
          efectos secundarios inaceptables. Solo el <strong>0,01%</strong> de los candidatos iniciales
          llega a la farmacia.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Ensayos clínicos
// ─────────────────────────────────────────────

function SeccionEnsayos() {
  const [faseActiva, setFaseActiva] = useState<number | null>(null);

  const fases = [
    {
      nombre: 'Fase I',
      icono: '👤',
      participantes: '20 – 100 voluntarios sanos',
      duracion: '~1 año',
      objetivo: 'Seguridad',
      tasaExito: '70%',
      coste: '~50 M€',
      color: '#2E86AB',
      descripcion: 'Primera vez que se prueba en humanos. Se empieza con dosis muy bajas y se aumenta gradualmente. El objetivo principal es comprobar que el fármaco no es peligroso, no demostrar que funciona.',
      detalle: 'Los voluntarios suelen ser personas sanas (excepto en oncología, donde se prueba en pacientes). Se monitorizan constantemente: análisis de sangre, electrocardiogramas, efectos adversos. Se identifica la dosis máxima tolerada.',
    },
    {
      nombre: 'Fase II',
      icono: '👥',
      participantes: '100 – 500 pacientes',
      duracion: '~2 años',
      objetivo: 'Eficacia',
      tasaExito: '33%',
      coste: '~100 M€',
      color: '#48A9A6',
      descripcion: 'Se prueba por primera vez en pacientes con la enfermedad. ¿El fármaco realmente funciona? Es la fase con mayor tasa de fracaso: dos de cada tres candidatos no la superan.',
      detalle: 'Se compara con placebo o con el tratamiento estándar. Se ajusta la dosis óptima. Los pacientes se asignan aleatoriamente a grupos (aleatorización). A menudo ni paciente ni médico saben quién recibe el fármaco real (doble ciego).',
    },
    {
      nombre: 'Fase III',
      icono: '🏥',
      participantes: '1.000 – 5.000 pacientes',
      duracion: '~3 años',
      objetivo: 'Confirmación a gran escala',
      tasaExito: '58%',
      coste: '~250 M€',
      color: '#27ae60',
      descripcion: 'Ensayos multicéntricos en hospitales de varios países. Confirman eficacia y detectan efectos secundarios raros que no aparecieron en grupos más pequeños.',
      detalle: 'Es la fase más cara y larga. Los datos de Fase III son los que revisan las agencias reguladoras (EMA, FDA) para decidir si aprueban el medicamento. Un solo efecto adverso grave puede paralizar todo el proceso.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los ensayos clínicos son la prueba definitiva: <strong>¿funciona en humanos y es seguro?</strong> Se dividen en 3 fases, cada una más grande, más larga y más cara que la anterior.</p>
      </div>

      {/* Timeline horizontal de fases */}
      <div className={styles.fasesTimeline}>
        <div className={styles.fasesLinea} />
        {fases.map((f, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.faseNodo} ${faseActiva === i ? styles.faseNodoActivo : ''}`}
            onClick={() => setFaseActiva(faseActiva === i ? null : i)}
            aria-expanded={faseActiva === i}
            style={{ borderColor: f.color }}
          >
            <span className={styles.faseNodoIcono} aria-hidden="true">{f.icono}</span>
            <span className={styles.faseNodoNombre}>{f.nombre}</span>
            <span className={styles.faseNodoDuracion}>{f.duracion}</span>
          </button>
        ))}
      </div>

      {/* Detalle de fase seleccionada */}
      {faseActiva !== null && (
        <div className={styles.faseDetalleCard}>
          <div className={styles.faseDetalleHeader}>
            <h3 className={styles.faseDetalleTitulo}>
              <span aria-hidden="true">{fases[faseActiva].icono}</span>{' '}
              {fases[faseActiva].nombre}: {fases[faseActiva].objetivo}
            </h3>
          </div>

          <div className={styles.faseStatsGrid}>
            <div className={styles.faseStat}>
              <span className={styles.faseStatLabel}>Participantes</span>
              <span className={styles.faseStatValor}>{fases[faseActiva].participantes}</span>
            </div>
            <div className={styles.faseStat}>
              <span className={styles.faseStatLabel}>Duración</span>
              <span className={styles.faseStatValor}>{fases[faseActiva].duracion}</span>
            </div>
            <div className={styles.faseStat}>
              <span className={styles.faseStatLabel}>Tasa de éxito</span>
              <span className={styles.faseStatValor}>{fases[faseActiva].tasaExito}</span>
            </div>
            <div className={styles.faseStat}>
              <span className={styles.faseStatLabel}>Coste medio</span>
              <span className={styles.faseStatValor}>{fases[faseActiva].coste}</span>
            </div>
          </div>

          <p className={styles.faseDetalleDesc}>{fases[faseActiva].descripcion}</p>
          <p className={styles.faseDetalleExtra}>{fases[faseActiva].detalle}</p>
        </div>
      )}

      {faseActiva === null && (
        <p className={styles.faseInstruccion}>Pulsa en una fase para ver los detalles</p>
      )}

      {/* Barra de supervivencia */}
      <div className={styles.supervivenciaCard}>
        <h3 className={styles.supervivenciaTitulo}>Tasa de supervivencia acumulada</h3>
        <p className={styles.supervivenciaSubtitulo}>De cada 100 fármacos que entran en Fase I...</p>
        <div className={styles.supervivenciaBarra}>
          <div className={styles.supervivenciaSegmento} style={{ width: '70%', background: '#2E86AB' }}>
            <span>70 pasan Fase I</span>
          </div>
        </div>
        <div className={styles.supervivenciaBarra}>
          <div className={styles.supervivenciaSegmento} style={{ width: '23%', background: '#48A9A6' }}>
            <span>23 pasan Fase II</span>
          </div>
        </div>
        <div className={styles.supervivenciaBarra}>
          <div className={styles.supervivenciaSegmento} style={{ width: '13%', background: '#27ae60' }}>
            <span>13 se aprueban</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La Fase II es el mayor cuello de botella: <strong>dos tercios de los candidatos fracasan</strong> porque
          el fármaco no demuestra eficacia suficiente en pacientes reales. Un fármaco que funciona en un tubo de
          ensayo no siempre funciona en un ser humano.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Aprobación y mercado
// ─────────────────────────────────────────────

function SeccionAprobacion() {
  const etapas = [
    {
      icono: '📄',
      nombre: 'Solicitud de aprobación',
      duracion: 'Meses',
      descripcion: 'El laboratorio prepara un dossier de decenas de miles de páginas con todos los datos de los ensayos clínicos, estudios de toxicidad, protocolo de fabricación y propuesta de prospecto.',
    },
    {
      icono: '🔍',
      nombre: 'Revisión regulatoria',
      duracion: '1 – 2 años',
      descripcion: 'La EMA (Europa) o la FDA (EE.UU.) revisa cada dato: eficacia, seguridad, calidad de fabricación, relación beneficio-riesgo. Puede pedir estudios adicionales.',
    },
    {
      icono: '🏭',
      nombre: 'Fabricación a escala',
      duracion: '6 – 12 meses',
      descripcion: 'Producir millones de dosis con la misma calidad que en el laboratorio es un reto enorme. Se construyen o adaptan fábricas, se validan los procesos y se asegura la cadena de suministro.',
    },
    {
      icono: '📢',
      nombre: 'Lanzamiento al mercado',
      duracion: 'Variable',
      descripcion: 'Formación de médicos, campañas de información, distribución a farmacias y hospitales. En España, el medicamento debe negociar su precio con el SNS antes de venderse.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Superar los ensayos clínicos no significa que el medicamento esté en tu farmacia. Queda un camino de <strong>aprobación regulatoria, fabricación y negociación de precio</strong> que puede añadir 1-3 años más.</p>
      </div>

      {/* Timeline horizontal */}
      <div className={styles.aprobacionTimeline}>
        {etapas.map((e, i) => (
          <div key={i} className={styles.aprobacionEtapa}>
            <div className={styles.aprobacionDot}>
              <span aria-hidden="true">{e.icono}</span>
            </div>
            <div className={styles.aprobacionContenido}>
              <h3 className={styles.aprobacionNombre}>{e.nombre}</h3>
              <span className={styles.aprobacionDuracion}>{e.duracion}</span>
              <p className={styles.aprobacionDesc}>{e.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen total */}
      <div className={styles.resumenTotal}>
        <h3 className={styles.resumenTotalTitulo}>El viaje completo</h3>
        <div className={styles.resumenTotalGrid}>
          <div className={styles.resumenTotalItem}>
            <span className={styles.resumenTotalIcono} aria-hidden="true">⏱️</span>
            <span className={styles.resumenTotalLabel}>Tiempo total</span>
            <span className={styles.resumenTotalValor}>10 – 15 años</span>
          </div>
          <div className={styles.resumenTotalItem}>
            <span className={styles.resumenTotalIcono} aria-hidden="true">💰</span>
            <span className={styles.resumenTotalLabel}>Coste total</span>
            <span className={styles.resumenTotalValor}>{formatCurrency(1000000000)} – {formatCurrency(2500000000)}</span>
          </div>
          <div className={styles.resumenTotalItem}>
            <span className={styles.resumenTotalIcono} aria-hidden="true">📉</span>
            <span className={styles.resumenTotalLabel}>Probabilidad de éxito</span>
            <span className={styles.resumenTotalValor}>~0,01%</span>
          </div>
        </div>

        {/* Barra temporal */}
        <div className={styles.barraTemporalContainer}>
          <div className={styles.barraTemporal}>
            <div className={styles.barraSegmento} style={{ width: '35%', background: '#2E86AB' }}>
              <span className={styles.barraSegmentoTexto}>Búsqueda</span>
              <span className={styles.barraSegmentoAnios}>3-6 años</span>
            </div>
            <div className={styles.barraSegmento} style={{ width: '45%', background: '#48A9A6' }}>
              <span className={styles.barraSegmentoTexto}>Ensayos</span>
              <span className={styles.barraSegmentoAnios}>6-8 años</span>
            </div>
            <div className={styles.barraSegmento} style={{ width: '20%', background: '#27ae60' }}>
              <span className={styles.barraSegmentoTexto}>Aprobación</span>
              <span className={styles.barraSegmentoAnios}>1-2 años</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El tiempo de aprobación puede acelerarse en emergencias sanitarias (como el COVID-19), pero el estándar
          habitual exige una revisión meticulosa. La talidomida (1960), que causó malformaciones en miles de bebés,
          demostró por qué <strong>la regulación estricta salva vidas</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Después de la aprobación
// ─────────────────────────────────────────────

function SeccionDespues() {
  const temas = [
    {
      icono: '👁️',
      titulo: 'Fase IV: Farmacovigilancia',
      descripcion: 'Una vez aprobado, el fármaco se sigue vigilando en millones de pacientes. Efectos secundarios raros (1 de cada 10.000 personas) solo aparecen con uso masivo.',
      detalles: [
        'Los médicos y pacientes pueden reportar efectos adversos',
        'Las agencias pueden retirar un fármaco si aparecen riesgos graves',
        'Se pueden añadir nuevas indicaciones o contraindicaciones',
        'Ejemplo: Vioxx (rofecoxib) fue retirado en 2004 tras detectar riesgo cardiovascular',
      ],
    },
    {
      icono: '💊',
      titulo: 'Genéricos: cuando expira la patente',
      descripcion: 'La patente dura ~20 años desde el registro (pero 8-12 años se gastan en desarrollo). Cuando expira, otros laboratorios pueden fabricar copias exactas a precio mucho menor.',
      detalles: [
        'Los genéricos tienen la misma eficacia y seguridad que el original',
        'El precio cae un 80-90% al entrar genéricos al mercado',
        'En España, la prescripción por principio activo favorece los genéricos',
        'La "exclusividad de datos" protege 8-10 años adicionales en la UE',
      ],
    },
    {
      icono: '🇪🇸',
      titulo: 'Precios en España (SNS)',
      descripcion: 'En España, los medicamentos financiados por el SNS tienen el precio negociado por la Comisión Interministerial de Precios. El paciente paga un copago según su renta.',
      detalles: [
        'El SNS negocia descuentos de hasta el 40% sobre el precio de laboratorio',
        'Copago: del 0% (rentas mínimas) al 60% (rentas altas)',
        'Los jubilados pagan un máximo de 8-18 €/mes según renta',
        'Los medicamentos hospitalarios los paga íntegramente el SNS',
      ],
    },
    {
      icono: '🤔',
      titulo: '¿Por qué son tan caros los medicamentos?',
      descripcion: 'El precio no cubre solo fabricar la pastilla (céntimos), sino los 10-15 años de investigación, los miles de compuestos que fracasaron y el riesgo asumido.',
      detalles: [
        `Coste medio de desarrollo: ${formatCurrency(1500000000)} – ${formatCurrency(2500000000)}`,
        'Por cada fármaco aprobado, el laboratorio invirtió en decenas que fracasaron',
        'La patente (20 años) es el incentivo para asumir ese riesgo',
        'Sin patentes, no habría inversión; sin genéricos, no habría acceso universal',
      ],
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La aprobación no es el final. El medicamento entra en una fase de <strong>vigilancia continua, competencia de genéricos y negociación de precios</strong> que dura décadas.</p>
      </div>

      <div className={styles.temasGrid}>
        {temas.map((t, i) => (
          <div key={i} className={styles.temaCard}>
            <div className={styles.temaHeader}>
              <span className={styles.temaIcono} aria-hidden="true">{t.icono}</span>
              <h3 className={styles.temaTitulo}>{t.titulo}</h3>
            </div>
            <p className={styles.temaDesc}>{t.descripcion}</p>
            <ul className={styles.temaLista}>
              {t.detalles.map((d, j) => (
                <li key={j}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Timeline de patente */}
      <div className={styles.patenteTimeline}>
        <h3 className={styles.patenteTitulo}>Vida de una patente farmacéutica</h3>
        <div className={styles.patenteBarra}>
          <div className={styles.patenteSegmento} style={{ width: '50%', background: '#e74c3c' }}>
            <span className={styles.patenteTexto}>Desarrollo (sin ingresos)</span>
          </div>
          <div className={styles.patenteSegmento} style={{ width: '50%', background: '#27ae60' }}>
            <span className={styles.patenteTexto}>Comercialización (con patente)</span>
          </div>
        </div>
        <div className={styles.patenteEtiquetas}>
          <span>Registro patente (año 0)</span>
          <span>Aprobación (~año 10)</span>
          <span>Expiración (~año 20)</span>
        </div>
        <p className={styles.patenteNota}>
          La patente se registra al inicio de la investigación, no cuando se aprueba el fármaco.
          Esto significa que de los 20 años de patente, solo 8-10 generan ingresos.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          El sistema farmacéutico es imperfecto: los medicamentos son caros, el acceso es desigual y la industria
          prioriza enfermedades rentables. Pero también ha producido antibióticos, vacunas y terapias que han salvado
          millones de vidas. El debate no es si funciona, sino <strong>cómo mejorarlo sin perder los incentivos para investigar</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorDesarrolloFarmacoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('busqueda');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'busqueda': return <SeccionBusqueda />;
      case 'ensayos': return <SeccionEnsayos />;
      case 'aprobacion': return <SeccionAprobacion />;
      case 'despues': return <SeccionDespues />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo se Descubre un Medicamento</h1>
          <p className={styles.subtitle}>Del laboratorio a la farmacia — 10-15 años, miles de millones de euros y mucha ciencia</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Lo que no te cuentan sobre los medicamentos"
          subtitle="Conceptos clave para entender la industria farmacéutica"
          defaultOpen={false}
        >
          <h3>¿Qué es un ensayo doble ciego?</h3>
          <p>
            En un ensayo <strong>doble ciego</strong>, ni el paciente ni el médico saben quién recibe el
            fármaco real y quién recibe el placebo. Esto elimina el sesgo: si el médico sabe quién
            tiene el fármaco, puede inconscientemente evaluar mejor a ese paciente. Es el estándar de
            oro de la investigación clínica.
          </p>

          <h3>¿Por qué fracasan tantos fármacos?</h3>
          <p>
            El cuerpo humano es mucho más complejo que una placa de Petri o un ratón. Un fármaco que
            elimina células cancerosas en el laboratorio puede no llegar al tumor en un paciente, o
            causar efectos secundarios inaceptables. La biología no se deja predecir fácilmente.
          </p>

          <h3>¿Qué son los medicamentos huérfanos?</h3>
          <p>
            Las enfermedades raras (menos de 5 de cada 10.000 personas) no son rentables para las
            farmacéuticas. Por eso existen incentivos especiales: exclusividad de mercado, reducción
            de tasas regulatorias y ayudas públicas. Aun así, muchas enfermedades raras siguen sin
            tratamiento.
          </p>

          <h3>¿Se puede acelerar el proceso?</h3>
          <p>
            Sí, en emergencias. Durante el COVID-19, las agencias usaron &laquo;aprobación de emergencia&raquo;
            para las vacunas. No se saltaron fases: se ejecutaron en paralelo y se revisaron los datos
            en tiempo real. El resultado: vacunas seguras en 11 meses en lugar de 10 años. Pero esto
            solo es posible con financiación ilimitada y una pandemia que justifique el riesgo.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica el proceso de desarrollo farmacéutico con
            fines educativos. Los costes, plazos y tasas de éxito son medias aproximadas que varían
            enormemente según el tipo de fármaco, la enfermedad y la región. No constituye asesoramiento
            médico ni farmacéutico.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-desarrollo-farmaco')} />
        <ShareCard appName="visualizador-desarrollo-farmaco" />
        <Footer appName="visualizador-desarrollo-farmaco" />
      </div>
    </>
  );
}
