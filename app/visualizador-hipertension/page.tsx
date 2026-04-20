'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Hipertension.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type SeccionPrincipal = 'presion' | 'mecanismo' | 'organos' | 'factores';

interface NavItem {
  id: SeccionPrincipal;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: NavItem[] = [
  { id: 'presion', titulo: 'Presión arterial', icono: '🩺', subtitulo: 'Valores, etapas y clasificación ESC/ESH 2018' },
  { id: 'mecanismo', titulo: 'Daño arterial', icono: '🔬', subtitulo: 'Cómo la presión alta destruye las arterias' },
  { id: 'organos', titulo: 'Órganos diana', icono: '🎯', subtitulo: 'Dónde impacta la HTA sostenida' },
  { id: 'factores', titulo: 'Factores de riesgo', icono: '⚠️', subtitulo: 'Qué sube y qué baja la presión' },
];

// ─────────────────────────────────────────────
// Sección 1: Presión arterial y etapas
// ─────────────────────────────────────────────

interface Etapa {
  nombre: string;
  sistolica: string;
  diastolica: string;
  color: string;
  colorFondo: string;
  riesgo: string;
  descripcion: string;
}

const ETAPAS: Etapa[] = [
  {
    nombre: 'Óptima',
    sistolica: '< 120',
    diastolica: '< 80',
    color: '#27AE60',
    colorFondo: '#EAFAF1',
    riesgo: 'Mínimo',
    descripcion: 'Las arterias trabajan en condiciones ideales. El corazón no necesita hacer un esfuerzo extra para empujar la sangre.',
  },
  {
    nombre: 'Normal',
    sistolica: '120–129',
    diastolica: '80–84',
    color: '#2ECC71',
    colorFondo: '#F0FBF4',
    riesgo: 'Bajo',
    descripcion: 'Presión dentro del rango saludable. No requiere intervención médica, pero conviene mantener hábitos saludables.',
  },
  {
    nombre: 'Normal-alta',
    sistolica: '130–139',
    diastolica: '85–89',
    color: '#F39C12',
    colorFondo: '#FEF9EC',
    riesgo: 'Moderado-bajo',
    descripcion: 'También llamada "prehipertensión". No es HTA clínica, pero indica que el sistema cardiovascular trabaja con más tensión de la óptima.',
  },
  {
    nombre: 'HTA grado 1',
    sistolica: '140–159',
    diastolica: '90–99',
    color: '#E67E22',
    colorFondo: '#FDF2E9',
    riesgo: 'Moderado',
    descripcion: 'Hipertensión leve. El daño arterial progresa de forma silente. Los médicos valoran el riesgo global antes de decidir si tratar farmacológicamente.',
  },
  {
    nombre: 'HTA grado 2',
    sistolica: '160–179',
    diastolica: '100–109',
    color: '#E74C3C',
    colorFondo: '#FDEDEC',
    riesgo: 'Alto',
    descripcion: 'Hipertensión moderada. Riesgo cardiovascular significativamente elevado. El tratamiento farmacológico es habitual en este rango.',
  },
  {
    nombre: 'HTA grado 3',
    sistolica: '≥ 180',
    diastolica: '≥ 110',
    color: '#922B21',
    colorFondo: '#F9EBEA',
    riesgo: 'Muy alto',
    descripcion: 'Hipertensión grave. Riesgo inmediato de crisis hipertensiva, ictus o infarto. Requiere atención médica urgente.',
  },
  {
    nombre: 'HTA sistólica aislada',
    sistolica: '≥ 140',
    diastolica: '< 90',
    color: '#D35400',
    colorFondo: '#FDFAF0',
    riesgo: 'Alto (mayores)',
    descripcion: 'Frecuente en personas mayores. Las arterias envejecidas pierden elasticidad: la sistólica sube pero la diastólica se mantiene. Es un marcador importante de rigidez arterial.',
  },
];

function SeccionPresion() {
  const [etapaActiva, setEtapaActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La presión arterial tiene <strong>dos números</strong>: el de arriba (sistólica) y el de abajo
          (diastólica). Juntos describen cómo trabaja el corazón y en qué estado están las arterias.
        </p>
      </div>

      {/* Explicación visual sistólica / diastólica */}
      <div className={styles.explicacionDual}>
        <div className={styles.explicacionCard}>
          <div className={styles.explicacionNumero} style={{ color: '#E74C3C' }}>120</div>
          <h3 className={styles.explicacionTitulo}>Sistólica</h3>
          <p className={styles.explicacionDesc}>
            Presión <strong>máxima</strong> cuando el corazón se contrae y expulsa sangre hacia las arterias.
            Como cuando abres el grifo a tope.
          </p>
        </div>
        <div className={styles.explicacionSeparador} aria-hidden="true">
          <span className={styles.explicacionBarra}>/</span>
        </div>
        <div className={styles.explicacionCard}>
          <div className={styles.explicacionNumero} style={{ color: '#2E86AB' }}>80</div>
          <h3 className={styles.explicacionTitulo}>Diastólica</h3>
          <p className={styles.explicacionDesc}>
            Presión <strong>mínima</strong> cuando el corazón descansa entre latidos.
            Como la presión residual en la tubería cuando el grifo está cerrado.
          </p>
        </div>
      </div>

      <div className={styles.metaforaTuberia}>
        <span aria-hidden="true">🚰</span>
        <p>
          <strong>Metáfora de la tubería:</strong> imagina las arterias como tuberías. La presión sistólica es la presión cuando el bombín activa el agua. La diastólica es la presión que queda en la tubería mientras espera. Con el tiempo, la presión constante debilita y endurece las paredes.
        </p>
      </div>

      {/* Tabla de etapas */}
      <h3 className={styles.subSeccionTitulo}>Clasificación ESC/ESH 2018</h3>
      <p className={styles.subSeccionDesc}>
        Selecciona una etapa para ver qué significa. Los valores se expresan en mmHg (milímetros de mercurio).
      </p>

      <div className={styles.etapasGrid}>
        {ETAPAS.map((e, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.etapaBtn} ${etapaActiva === i ? styles.etapaActiva : ''}`}
            style={{
              borderColor: e.color,
              backgroundColor: etapaActiva === i ? e.color : e.colorFondo,
              color: etapaActiva === i ? 'white' : 'inherit',
            }}
            onClick={() => setEtapaActiva(etapaActiva === i ? null : i)}
            aria-pressed={etapaActiva === i}
          >
            <span className={styles.etapaNombre}>{e.nombre}</span>
            <span className={styles.etapaValores}>
              {e.sistolica} / {e.diastolica}
            </span>
            <span
              className={styles.etapaRiesgo}
              style={{ color: etapaActiva === i ? 'rgba(255,255,255,0.85)' : e.color }}
            >
              Riesgo: {e.riesgo}
            </span>
          </button>
        ))}
      </div>

      {/* Detalle de la etapa seleccionada */}
      {etapaActiva !== null && (
        <div
          className={styles.etapaDetalle}
          style={{ borderLeftColor: ETAPAS[etapaActiva].color }}
          role="region"
          aria-live="polite"
        >
          <h4 className={styles.etapaDetalleTitulo} style={{ color: ETAPAS[etapaActiva].color }}>
            {ETAPAS[etapaActiva].nombre} — {ETAPAS[etapaActiva].sistolica} / {ETAPAS[etapaActiva].diastolica} mmHg
          </h4>
          <p className={styles.etapaDetalleDesc}>{ETAPAS[etapaActiva].descripcion}</p>
          <div className={styles.etapaDetalleNota}>
            <span aria-hidden="true">ℹ️</span>
            <span>Esta información es educativa. El diagnóstico de hipertensión requiere varias mediciones en consulta médica, no una sola lectura.</span>
          </div>
        </div>
      )}

      <div className={styles.warningBox}>
        <strong>🔇 El asesino silencioso:</strong> la HTA rara vez da síntomas hasta que el daño ya está hecho.
        La cefalea solo aparece en crisis hipertensivas graves. La única forma de detectarla es medir la presión
        regularmente. <strong>El 46% de los hipertensos en España no saben que lo son.</strong>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Mecanismo de daño arterial
// ─────────────────────────────────────────────

interface FaseDano {
  id: number;
  titulo: string;
  icono: string;
  color: string;
  pasos: { subtitulo: string; texto: string }[];
}

const FASES_DANO: FaseDano[] = [
  {
    id: 1,
    titulo: 'Tensión mecánica en la pared arterial',
    icono: '💥',
    color: '#E74C3C',
    pasos: [
      {
        subtitulo: 'Estrés de cizalla (shear stress)',
        texto: 'La presión elevada genera fuerzas de rozamiento sobre el endotelio (la capa interna de la arteria). Este "estrés de cizalla" deforma y daña las células endoteliales.',
      },
      {
        subtitulo: 'Activación endotelial',
        texto: 'Las células dañadas se activan: expresan moléculas de adhesión en su superficie que atraen células inflamatorias (monocitos, neutrófilos) desde la sangre.',
      },
      {
        subtitulo: 'Pérdida de función anticoagulante',
        texto: 'El endotelio sano produce óxido nítrico (vasodilatador) y anticoagulantes naturales. El endotelio dañado produce menos, favoreciendo la vasoconstricción y la trombosis.',
      },
    ],
  },
  {
    id: 2,
    titulo: 'Remodelado arterial',
    icono: '🏗️',
    color: '#E67E22',
    pasos: [
      {
        subtitulo: 'Hipertrofia de la capa muscular',
        texto: 'La pared arterial se engrosa para adaptarse a la presión constante: la capa muscular (media) prolifera. Las arterias quedan con paredes más gruesas y canales más estrechos.',
      },
      {
        subtitulo: 'Arteriosclerosis (pérdida de elasticidad)',
        texto: 'Las fibras elásticas de la pared se fragmentan y son reemplazadas por colágeno rígido. Las arterias se vuelven tubos rígidos que no pueden amortiguar la presión de cada latido.',
      },
      {
        subtitulo: 'Círculo vicioso en arteriolas',
        texto: 'En las arterias pequeñas (arteriolas), el engrosamiento estrecha la luz. Canales más estrechos → más resistencia → el corazón bombea con más fuerza → más presión → más daño.',
      },
    ],
  },
  {
    id: 3,
    titulo: 'Inflamación y aterosclerosis',
    icono: '🔥',
    color: '#922B21',
    pasos: [
      {
        subtitulo: 'Entrada de LDL oxidado',
        texto: 'El endotelio dañado pierde su función de barrera selectiva. El LDL ("colesterol malo") penetra en la íntima (capa interna de la pared) y se oxida por la inflamación local.',
      },
      {
        subtitulo: 'Células espumosas (foam cells)',
        texto: 'Los macrófagos (células del sistema inmune) fagocitan el LDL oxidado pero no pueden eliminarlo. Se llenan de lípidos y se convierten en "células espumosas" atrapadas en la pared.',
      },
      {
        subtitulo: 'Formación de la placa aterosclerótica',
        texto: 'Las células espumosas, calcio y tejido fibroso forman una placa que reduce la luz de la arteria. Si la placa se rompe, forma un coágulo que puede bloquear el flujo → infarto o ictus.',
      },
    ],
  },
];

function SeccionMecanismo() {
  const [faseActiva, setFaseActiva] = useState(0);
  const fase = FASES_DANO[faseActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La presión arterial elevada no solo "cansa" el corazón — <strong>daña físicamente las paredes de
          las arterias</strong> a través de tres mecanismos encadenados que se refuerzan mutuamente.
        </p>
      </div>

      {/* Selector de fases */}
      <div className={styles.fasesSelector}>
        {FASES_DANO.map((f, i) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.faseBtn} ${faseActiva === i ? styles.faseActiva : ''}`}
            style={{
              borderColor: f.color,
              ...(faseActiva === i ? { backgroundColor: f.color, color: 'white' } : {}),
            }}
            onClick={() => setFaseActiva(i)}
            aria-pressed={faseActiva === i}
          >
            <span className={styles.faseFase}>Fase {f.id}</span>
            <span aria-hidden="true">{f.icono}</span>
            <span className={styles.faseTituloCorto}>{f.titulo.split('(')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Detalle de la fase */}
      <div className={styles.faseDetalle} style={{ borderLeftColor: fase.color }}>
        <h3 className={styles.faseDetalleTitulo} style={{ color: fase.color }}>
          <span aria-hidden="true">{fase.icono}</span> {fase.titulo}
        </h3>
        <div className={styles.fasePasos}>
          {fase.pasos.map((p, i) => (
            <div key={i} className={styles.fasePaso}>
              <div
                className={styles.fasePasoNum}
                style={{ backgroundColor: fase.color }}
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <div className={styles.fasePasoContenido}>
                <h4 className={styles.fasePasoSubtitulo}>{p.subtitulo}</h4>
                <p className={styles.fasePasoTexto}>{p.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Estos tres mecanismos forman un <strong>ciclo que se retroalimenta</strong>: más presión → más daño
          endotelial → arterias más rígidas → más resistencia → más presión. Por eso la HTA no controlada
          progresa incluso si no hay síntomas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Órganos diana
// ─────────────────────────────────────────────

interface OrganoDiana {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  dano: string[];
  dato: string;
}

const ORGANOS: OrganoDiana[] = [
  {
    id: 'corazon',
    nombre: 'Corazón',
    icono: '🫀',
    color: '#E74C3C',
    dano: [
      'El corazón bombea contra más resistencia → la pared del ventrículo izquierdo se engrosa (hipertrofia ventricular izquierda).',
      'La hipertrofia deteriora la capacidad de relajación del corazón → puede derivar en insuficiencia cardíaca con fracción de eyección preservada.',
      'La presión elevada favorece la fibrilación auricular al dilatar las aurículas y alterar su conducción eléctrica.',
    ],
    dato: 'La HTA es la causa más frecuente de insuficiencia cardíaca en España, por delante de la cardiopatía isquémica.',
  },
  {
    id: 'cerebro',
    nombre: 'Cerebro',
    icono: '🧠',
    color: '#9B59B6',
    dano: [
      'Las arteriolas cerebrales pequeñas se dañan y obstruyen → microinfartos silentes (lagunas) acumulados → deterioro cognitivo vascular.',
      'Las arterias cerebrales medianas y grandes desarrollan placas ateroscleróticas → riesgo de ictus isquémico por trombosis o embolia.',
      'Los aneurismas pequeños (de Charcot-Bouchard) se forman en arteriolas cerebrales dañadas → pueden romperse → ictus hemorrágico.',
    ],
    dato: 'El 70% de los ictus isquémicos tienen la hipertensión como factor de riesgo principal.',
  },
  {
    id: 'rinon',
    nombre: 'Riñón',
    icono: '🫘',
    color: '#E67E22',
    dano: [
      'Las arteriolas aferentes (las que llevan sangre al glomérulo) se endurecen → el filtrado glomerular disminuye → nefropatía hipertensiva.',
      'Los glomérulos dañados dejan pasar proteínas a la orina (microalbuminuria) → señal temprana de daño renal.',
      'Los riñones dañados retienen más sodio y agua → más volumen sanguíneo → más presión → más daño renal: círculo vicioso.',
    ],
    dato: 'La HTA es la segunda causa de enfermedad renal crónica en España, tras la diabetes mellitus.',
  },
  {
    id: 'ojos',
    nombre: 'Ojos',
    icono: '👁️',
    color: '#2E86AB',
    dano: [
      'Las arteriolas de la retina se estrechan y endurecen → retinopatía hipertensiva (grados I-IV según la clasificación de Keith-Wagener).',
      'En grados avanzados: hemorragias retinianas, exudados y edema de papila que deterioran la visión.',
      'Las arteriolas retinianas son visibles directamente mediante el fondo de ojo → permiten evaluar el estado de las arteriolas de todo el cuerpo.',
    ],
    dato: 'El fondo de ojo es la única forma no invasiva de ver directamente el estado de las arteriolas de un paciente vivo.',
  },
  {
    id: 'arterias',
    nombre: 'Arterias grandes',
    icono: '🩸',
    color: '#C0392B',
    dano: [
      'La aorta y las arterias ilíacas pierden elasticidad y sus paredes se dilatan progresivamente bajo la presión mantenida.',
      'La dilatación crónica puede evolucionar a aneurisma aórtico — una "bola" en la pared que puede romperse con consecuencias letales.',
      'La rigidez aórtica eleva la presión del pulso (diferencia sistólica-diastólica) → indicador independiente de riesgo cardiovascular.',
    ],
    dato: 'El 80% de los aneurismas de aorta abdominal tienen la hipertensión como factor contribuyente principal.',
  },
];

function SeccionOrganos() {
  const [organoActivo, setOrganoActivo] = useState<string | null>(null);
  const organo = ORGANOS.find(o => o.id === organoActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La hipertensión sostenida daña de forma progresiva y silente cinco órganos que los cardiólogos
          denominan <strong>"órganos diana"</strong>. Selecciona uno para ver el mecanismo específico.
        </p>
      </div>

      {/* Tarjetas de órganos */}
      <div className={styles.organosGrid}>
        {ORGANOS.map(o => (
          <button
            key={o.id}
            type="button"
            className={`${styles.organoBtn} ${organoActivo === o.id ? styles.organoActivo : ''}`}
            style={{
              borderColor: o.color,
              backgroundColor: organoActivo === o.id ? o.color : undefined,
              color: organoActivo === o.id ? 'white' : undefined,
            }}
            onClick={() => setOrganoActivo(organoActivo === o.id ? null : o.id)}
            aria-pressed={organoActivo === o.id}
          >
            <span className={styles.organoIcono} aria-hidden="true">{o.icono}</span>
            <span className={styles.organoNombre}>{o.nombre}</span>
          </button>
        ))}
      </div>

      {/* Detalle del órgano */}
      {organo && (
        <div
          className={styles.organoDetalle}
          style={{ borderLeftColor: organo.color }}
          role="region"
          aria-live="polite"
        >
          <h3 className={styles.organoDetalleTitulo} style={{ color: organo.color }}>
            <span aria-hidden="true">{organo.icono}</span> {organo.nombre}
          </h3>
          <ul className={styles.organoDanoList}>
            {organo.dano.map((d, i) => (
              <li key={i} className={styles.organoDanoItem}>{d}</li>
            ))}
          </ul>
          <div className={styles.organoDato} style={{ borderColor: organo.color }}>
            <span className={styles.organoDatoLabel}>Dato</span>
            <p className={styles.organoDatoTexto}>{organo.dato}</p>
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          El daño en los órganos diana es <strong>acumulativo y mayoritariamente irreversible</strong>.
          Sin embargo, controlar la presión frena la progresión y reduce el riesgo de eventos agudos
          (ictus, infarto, insuficiencia renal) incluso si el daño ya ha comenzado.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Factores de riesgo
// ─────────────────────────────────────────────

interface Factor {
  icono: string;
  titulo: string;
  explicacion: string;
}

const FACTORES_MODIFICABLES: Factor[] = [
  {
    icono: '🧂',
    titulo: 'Exceso de sal',
    explicacion: 'El sodio retiene agua en el organismo → aumenta el volumen sanguíneo → sube la presión. Objetivo: menos de 5 g/día (una cucharadita). El 75% del sodio proviene de alimentos procesados, no del salero.',
  },
  {
    icono: '🍺',
    titulo: 'Alcohol',
    explicacion: 'El alcohol produce vasoconstricción directa y activa el sistema renina-angiotensina-aldosterona, que retiene sodio. El efecto es dosis-dependiente y crónico.',
  },
  {
    icono: '🚬',
    titulo: 'Tabaco',
    explicacion: 'La nicotina produce vasoconstricción aguda que sube la presión 10-20 mmHg durante 30 minutos. El daño crónico endotelial acumula riesgo cardiovascular independientemente de la presión.',
  },
  {
    icono: '⚖️',
    titulo: 'Obesidad abdominal',
    explicacion: 'El tejido adiposo visceral produce angiotensina II (vasoconstrictora) y leptina (activa el sistema nervioso simpático). Los riñones retienen más sodio. Perder 5 kg puede bajar 4-5 mmHg.',
  },
  {
    icono: '😴',
    titulo: 'Apnea del sueño',
    explicacion: 'La hipoxia nocturna repetida activa el sistema nervioso simpático y la inflamación sistémica. La HTA resistente al tratamiento tiene apnea del sueño no diagnosticada en hasta el 80% de los casos.',
  },
  {
    icono: '😰',
    titulo: 'Estrés crónico',
    explicacion: 'Las catecolaminas (adrenalina, noradrenalina) elevan el gasto cardíaco y producen vasoconstricción. El estrés crónico mantiene estos niveles elevados, produciendo una hipertensión sostenida.',
  },
];

const FACTORES_NO_MODIFICABLES: Factor[] = [
  {
    icono: '📅',
    titulo: 'Edad',
    explicacion: 'La rigidez arterial aumenta de forma natural con los años. La presión sistólica sube progresivamente desde los 40-50 años incluso en personas sanas.',
  },
  {
    icono: '🧬',
    titulo: 'Herencia genética',
    explicacion: 'Aproximadamente el 50% de la variabilidad en la presión arterial tiene base genética. Si ambos progenitores son hipertensos, el riesgo de desarrollarla es del 60-70%.',
  },
  {
    icono: '⚧️',
    titulo: 'Sexo biológico',
    explicacion: 'Los hombres tienen mayor riesgo de HTA antes de los 55 años. Las mujeres tienen cierta protección por los estrógenos hasta la menopausia, tras la cual el riesgo se iguala y supera al masculino.',
  },
  {
    icono: '🌍',
    titulo: 'Origen étnico',
    explicacion: 'Las personas de origen afrodescendiente tienen mayor prevalencia de HTA, edad de debut más temprana y mayor riesgo de daño renal. Se han identificado variantes genéticas relacionadas con el manejo del sodio.',
  },
];

function SeccionFactores() {
  const [tabActiva, setTabActiva] = useState<'modificables' | 'no-modificables'>('modificables');

  const factores = tabActiva === 'modificables' ? FACTORES_MODIFICABLES : FACTORES_NO_MODIFICABLES;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Algunos factores que elevan la presión <strong>se pueden cambiar</strong> con hábitos o
          tratamiento. Otros son constitutivos y definen el riesgo de base.
        </p>
      </div>

      {/* Selector de tabs */}
      <div className={styles.factoresTabs} role="tablist">
        <button
          type="button"
          role="tab"
          className={`${styles.factoresTab} ${tabActiva === 'modificables' ? styles.factoresTabActiva : ''}`}
          onClick={() => setTabActiva('modificables')}
          aria-selected={tabActiva === 'modificables'}
        >
          ✏️ Modificables
        </button>
        <button
          type="button"
          role="tab"
          className={`${styles.factoresTab} ${tabActiva === 'no-modificables' ? styles.factoresTabActiva : ''}`}
          onClick={() => setTabActiva('no-modificables')}
          aria-selected={tabActiva === 'no-modificables'}
        >
          🔒 No modificables
        </button>
      </div>

      {/* Lista de factores */}
      <div className={styles.factoresGrid} role="tabpanel">
        {factores.map((f, i) => (
          <div key={i} className={styles.factorCard}>
            <div className={styles.factorHeader}>
              <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
              <h4 className={styles.factorTitulo}>{f.titulo}</h4>
            </div>
            <p className={styles.factorExplicacion}>{f.explicacion}</p>
          </div>
        ))}
      </div>

      {tabActiva === 'modificables' && (
        <div className={styles.insight}>
          <p>
            Controlar los factores modificables puede reducir la presión sistólica entre <strong>4 y 11 mmHg
            cada uno</strong>. El efecto combinado de varios cambios de estilo de vida puede ser comparable
            al de un fármaco antihipertensivo. Pero esto no sustituye la consulta médica.
          </p>
        </div>
      )}

      {tabActiva === 'no-modificables' && (
        <div className={styles.insight}>
          <p>
            Los factores no modificables definen el <strong>riesgo de base</strong> de cada persona. Conocerlos
            ayuda a entender por qué algunas personas desarrollan HTA incluso con hábitos saludables, y
            por qué el cribado regular es especialmente importante si existen antecedentes familiares.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHipertensionPage() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionPrincipal>('presion');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'presion': return <SeccionPresion />;
      case 'mecanismo': return <SeccionMecanismo />;
      case 'organos': return <SeccionOrganos />;
      case 'factores': return <SeccionFactores />;
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
          <h1 className={styles.title}>Hipertensión — Qué le Ocurre al Cuerpo</h1>
          <p className={styles.subtitle}>Mecanismo arterial, etapas y daño en órganos diana</p>
        </header>

        <LegalNotice />

        {/* Navegación principal */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador de hipertensión">
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

        {/* Cabecera de sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}
          </p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre la hipertensión arterial"
          subtitle="Preguntas frecuentes y mecanismos en detalle"
          defaultOpen={false}
        >
          <h3>¿Por qué la hipertensión no duele?</h3>
          <p>
            Las arterias no tienen receptores del dolor (nociceptores). El daño vascular es silente porque
            ocurre a nivel microscópico durante años. Los síntomas (cefalea, visión borrosa, mareo) solo
            aparecen en crisis hipertensivas muy agudas o cuando el daño en órganos diana ya es avanzado.
            Este es el principal problema: la mayoría de hipertensos se sienten perfectamente bien.
          </p>

          <h3>¿El café sube la tensión?</h3>
          <p>
            La cafeína produce una subida aguda de presión de 3-14 mmHg durante 1-3 horas en personas que
            no la consumen habitualmente. Sin embargo, los consumidores crónicos de café desarrollan tolerancia
            y el efecto es mínimo. Los estudios epidemiológicos no muestran asociación entre consumo moderado
            de café (2-3 tazas/día) e hipertensión crónica. De hecho, el café contiene antioxidantes con
            efectos potencialmente protectores.
          </p>

          <h3>¿Se puede curar la hipertensión?</h3>
          <p>
            En la mayoría de casos, la HTA es <strong>crónica pero controlable</strong>, no curable. Un
            porcentaje pequeño (5-10%) tiene HTA secundaria (causada por una enfermedad tratable, como
            hiperaldosteronismo o estenosis de la arteria renal); en esos casos, tratar la causa puede
            resolver la hipertensión. En el resto (HTA esencial), el objetivo es mantener cifras normales
            con fármacos, hábitos o ambos.
          </p>

          <h3>¿La tensión varía durante el día?</h3>
          <p>
            Sí, de forma fisiológica. La presión sigue un ritmo circadiano: es más baja durante el sueño
            (descenso nocturno normal del 10-20%, llamado <em>dipping</em>), sube bruscamente al despertar
            (pico matutino), y fluctúa con el estrés, el ejercicio y las comidas. El patrón <em>non-dipper</em>
            (sin descenso nocturno) se asocia a mayor daño en órganos diana, por eso la monitorización
            ambulatoria de 24 horas (MAPA) es más informativa que una sola medición en consulta.
          </p>

          <h3>¿Por qué los mayores tienen la sistólica alta pero la diastólica normal?</h3>
          <p>
            Es la <strong>hipertensión sistólica aislada</strong>, el patrón más frecuente en personas mayores
            de 60 años. Con la edad, las grandes arterias (aorta) pierden elasticidad y se vuelven rígidas.
            Una arteria rígida no puede expandirse para amortiguar el pulso de cada latido: la presión sistólica
            sube mucho, mientras la diastólica permanece normal o incluso baja. La presión del pulso elevada
            (diferencia sistólica-diastólica {'>'} 60 mmHg) es en sí misma un marcador de riesgo cardiovascular.
          </p>

          <h3>Tabla de clasificación y riesgo cardiovascular</h3>
          <table className={styles.tablaEducativa}>
            <thead>
              <tr>
                <th>Etapa</th>
                <th>Sistólica (mmHg)</th>
                <th>Diastólica (mmHg)</th>
                <th>Riesgo CV</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Óptima</td><td>{'< 120'}</td><td>{'< 80'}</td><td>Mínimo</td></tr>
              <tr><td>Normal</td><td>120–129</td><td>80–84</td><td>Bajo</td></tr>
              <tr><td>Normal-alta</td><td>130–139</td><td>85–89</td><td>Moderado-bajo</td></tr>
              <tr><td>HTA grado 1</td><td>140–159</td><td>90–99</td><td>Moderado</td></tr>
              <tr><td>HTA grado 2</td><td>160–179</td><td>100–109</td><td>Alto</td></tr>
              <tr><td>HTA grado 3</td><td>≥ 180</td><td>≥ 110</td><td>Muy alto</td></tr>
              <tr><td>HTA sistólica aislada</td><td>≥ 140</td><td>{'< 90'}</td><td>Alto (mayores)</td></tr>
            </tbody>
          </table>

          <h3>Cronología del daño arterial (5 mecanismos)</h3>
          <ol className={styles.listaEducativa}>
            <li><strong>Estrés de cizalla:</strong> la presión elevada deforma y daña el endotelio, que pierde su función protectora.</li>
            <li><strong>Activación inflamatoria:</strong> el endotelio dañado recluta leucocitos y produce mediadores inflamatorios.</li>
            <li><strong>Remodelado estructural:</strong> la pared arterial se engrosa y rigidiza (hipertrofia muscular, fibrosis).</li>
            <li><strong>Aterosclerosis:</strong> el LDL oxidado se acumula en la pared, formando placas que estrechan la luz.</li>
            <li><strong>Eventos agudos:</strong> una placa rota o una arteriola que cede → infarto, ictus o aneurisma roto.</li>
          </ol>

          <div className={styles.warningBox}>
            <strong>Nota educativa:</strong> este visualizador simplifica mecanismos complejos con fines divulgativos.
            No constituye consejo médico. El diagnóstico y tratamiento de la hipertensión requiere evaluación
            por un profesional sanitario. Los datos presentados se basan en las guías ESC/ESH 2018 y el
            consenso científico vigente en 2025.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-hipertension')} />
        <ShareCard appName="visualizador-hipertension" />
        <Footer appName="visualizador-hipertension" />
      </div>
    </>
  );
}
