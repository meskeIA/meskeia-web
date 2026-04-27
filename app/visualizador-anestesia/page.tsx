'use client';

import { useState } from 'react';
import styles from './VisualizadorAnestesia.module.css';
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

type TipoAnestesia = 'local' | 'regional' | 'general';

interface DatoTipoAnestesia {
  id: TipoAnestesia;
  icono: string;
  titulo: string;
  mecanismo: string;
  farmacos: string[];
  duracion: string;
  usos: string[];
  ventaja: string;
  colorAccent: string;
}

interface PasoMolecular {
  numero: number;
  titulo: string;
  descripcion: string;
  colorAccent: string;
}

interface TeoríaConsciencia {
  titulo: string;
  descripcion: string;
  autor: string;
}

interface MonitorIntraoperatorio {
  icono: string;
  nombre: string;
  descripcion: string;
  valorRef: string;
  colorAccent: string;
}

interface ComponenteGeneral {
  numero: number;
  icono: string;
  titulo: string;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos: Tipos de anestesia
// ─────────────────────────────────────────────

const TIPOS_ANESTESIA: DatoTipoAnestesia[] = [
  {
    id: 'local',
    icono: '💉',
    titulo: 'Anestesia Local',
    mecanismo:
      'Bloqueo de canales de sodio voltaje-dependientes en la membrana del nervio. Sin Na⁺ entrando → no se genera potencial de acción → el nervio no transmite la señal de dolor. El paciente permanece totalmente consciente.',
    farmacos: ['Lidocaína', 'Bupivacaína', 'Mepivacaína'],
    duracion: '1-4 horas según el fármaco',
    usos: ['Dentista (empaste, extracción)', 'Sutura de herida', 'Extracción de lunar', 'Biopsia de piel'],
    ventaja:
      'El paciente permanece consciente y colaborador. Sin afectación del sistema nervioso central. El área de acción es muy pequeña y localizada.',
    colorAccent: '#2E86AB',
  },
  {
    id: 'regional',
    icono: '🔵',
    titulo: 'Anestesia Regional',
    mecanismo:
      'Mismo principio que la local (bloqueo de canales Na⁺) pero aplicado a un nervio mayor o plexo nervioso → bloquea una región entera del cuerpo. El paciente puede estar consciente o con sedación leve. Epidural: inyección en espacio epidural de la columna → bloquea raíces nerviosas lumbares/sacras. Raquídea: inyección en el líquido cefalorraquídeo → efecto más rápido y profundo.',
    farmacos: ['Bupivacaína (epidural)', 'Ropivacaína', 'Levobupivacaína', 'Clorprocaína'],
    duracion: '2-6 horas (epidural puede prolongarse con catéter)',
    usos: ['Partos (epidural)', 'Cirugía de piernas', 'Cirugía de brazo (bloqueo plexo braquial)', 'Hernia inguinal'],
    ventaja:
      'Permite operar zonas amplias sin anestesia general. El paciente puede estar despierto y participar (ej. parto).',
    colorAccent: '#48A9A6',
  },
  {
    id: 'general',
    icono: '😴',
    titulo: 'Anestesia General',
    mecanismo:
      'Depresión del sistema nervioso central actuando sobre múltiples receptores: potenciación de GABA-A (hipnosis), bloqueo de NMDA (analgesia), inhibición de canales de Ca²⁺ y Na⁺, bloqueo de receptores nicotínicos (relajación muscular). Requiere ventilación mecánica al paralizarse el diafragma.',
    farmacos: ['Propofol (inducción)', 'Sevoflurano/Desflurano (mantenimiento)', 'Fentanilo (analgesia)', 'Rocuronio (relajación)', 'Midazolam (amnesia)'],
    duracion: 'Variable: desde 30 min hasta varias horas',
    usos: ['Cirugía abdominal mayor', 'Cirugía torácica', 'Neurocirugía', 'Cirugía pediátrica', 'Trasplantes'],
    ventaja:
      'Permite realizar cualquier intervención sin sufrimiento del paciente. Control total de la vía aérea con ventilación mecánica.',
    colorAccent: '#7FB3D3',
  },
];

// ─────────────────────────────────────────────
// Datos: 5 componentes de la anestesia general
// ─────────────────────────────────────────────

const COMPONENTES_GENERAL: ComponenteGeneral[] = [
  {
    numero: 1,
    icono: '😴',
    titulo: 'Hipnosis',
    descripcion: 'Pérdida de consciencia. Producida principalmente por propofol (inducción) y gases inhalados (mantenimiento).',
  },
  {
    numero: 2,
    icono: '💊',
    titulo: 'Analgesia',
    descripcion: 'Supresión de la percepción del dolor. Opioides como fentanilo o remifentanilo actúan sobre receptores µ centrales.',
  },
  {
    numero: 3,
    icono: '💪',
    titulo: 'Relajación muscular',
    descripcion: 'Parálisis muscular completa mediante bloqueantes neuromusculares (rocuronio, vecuronio). Permite al cirujano operar sin movimientos involuntarios.',
  },
  {
    numero: 4,
    icono: '🧠',
    titulo: 'Amnesia',
    descripcion: 'El paciente no recuerda nada de la cirugía. Las benzodiazepinas (midazolam) y los gases inhalados contribuyen a bloquear la formación de memoria.',
  },
  {
    numero: 5,
    icono: '🛑',
    titulo: 'Supresión de reflejos',
    descripcion: 'Bloqueo de la respuesta vegetativa al corte (taquicardia, hipertensión). Los opioides y la profundidad anestésica adecuada evitan estas reacciones.',
  },
];

// ─────────────────────────────────────────────
// Datos: Pasos moleculares
// ─────────────────────────────────────────────

const PASOS_MOLECULARES: PasoMolecular[] = [
  {
    numero: 1,
    titulo: 'Inducción (Propofol IV)',
    descripcion:
      'Propofol potencia el receptor GABA-A (el principal "freno" del cerebro) → hiperpolarización generalizada de neuronas → pérdida de consciencia en ~30 segundos. La EEG muestra cómo las ondas cerebrales pasan de actividad rápida (beta) a ondas lentas (delta). La "inyección blanca" —apodo del propofol— produce una sedación limpia y rápida.',
    colorAccent: '#2E86AB',
  },
  {
    numero: 2,
    titulo: 'Mantenimiento (Gases inhalados)',
    descripcion:
      'Sevoflurano o desflurano mantienen la inconsciencia actuando sobre múltiples receptores: GABA-A, NMDA, canales de K⁺ y Na⁺. Opioides (fentanilo) aportan analgesia profunda. El anestesiólogo titula la concentración de gas exhalado para mantener al paciente en el rango adecuado.',
    colorAccent: '#48A9A6',
  },
  {
    numero: 3,
    titulo: 'Relajación muscular',
    descripcion:
      'Bloqueantes neuromusculares (rocuronio, vecuronio) bloquean receptores nicotínicos en la placa motora → el diafragma se paraliza → el paciente necesita ventilación mecánica. Sin este paso la cirugía abdominal sería imposible (los músculos resistirían la incisión).',
    colorAccent: '#7FB3D3',
  },
  {
    numero: 4,
    titulo: 'Recuperación',
    descripcion:
      'Se retiran gradualmente los agentes anestésicos. El anestesiólogo revierte los bloqueantes musculares con sugammadex (para rocuronio) o neostigmina. El propofol tiene semivida de eliminación corta (~5-10 min) → despertar limpio. El paciente pasa a la Unidad de Recuperación Post-Anestésica (URPA).',
    colorAccent: '#2E86AB',
  },
];

// ─────────────────────────────────────────────
// Datos: Teorías de la consciencia
// ─────────────────────────────────────────────

const TEORIAS_CONSCIENCIA: TeoríaConsciencia[] = [
  {
    titulo: 'Teoría de la desconexión cortical',
    descripcion:
      'Los anestésicos rompen la comunicación entre áreas del córtex que normalmente cooperan para generar consciencia. La consciencia emerge de la integración de información entre regiones cerebrales: si la comunicación se interrumpe, la consciencia desaparece aunque cada área siga activa.',
    autor: 'Tononi — Teoría de la Información Integrada (IIT)',
  },
  {
    titulo: 'Teoría del tálamo',
    descripcion:
      'El tálamo actúa como "relé" central de la consciencia. Los anestésicos lo desactivan selectivamente, cortando el flujo de señales sensoriales hacia el córtex. Sin esa entrada talámica, la corteza pierde el "sustrato" necesario para generar experiencia consciente.',
    autor: 'Alkire, Hudetz, Tononi — modelo talamo-cortical',
  },
  {
    titulo: 'Teoría de las redes de conectividad',
    descripcion:
      'Los anestésicos no "apagan" el cerebro (la actividad continúa), sino que alteran los patrones de comunicación entre regiones → disrupción de la integración de información. La consciencia depende de la topología de las redes, no solo de su actividad individual.',
    autor: 'Lee, Mashour — conectividad funcional bajo anestesia',
  },
];

// ─────────────────────────────────────────────
// Datos: Monitores intraoperatorios
// ─────────────────────────────────────────────

const MONITORES: MonitorIntraoperatorio[] = [
  {
    icono: '🧠',
    nombre: 'BIS (Índice Biespectral)',
    descripcion:
      'Electroencefalograma procesado que cuantifica la profundidad anestésica. Detecta el riesgo de consciencia intraoperatoria.',
    valorRef: '40-60 = anestesia adecuada',
    colorAccent: '#2E86AB',
  },
  {
    icono: '🫀',
    nombre: 'ECG continuo',
    descripcion:
      'Monitorización cardíaca en tiempo real. Los anestésicos pueden afectar la conducción eléctrica del corazón (alargamiento del QT, arritmias).',
    valorRef: 'Ritmo sinusal normal',
    colorAccent: '#E85D5D',
  },
  {
    icono: '🌬️',
    nombre: 'Capnografía (EtCO₂)',
    descripcion:
      'Mide el CO₂ al final de cada espiración. Confirma colocación correcta del tubo endotraqueal y adecuada ventilación. Indicador precoz de parada circulatoria.',
    valorRef: '35-45 mmHg',
    colorAccent: '#48A9A6',
  },
  {
    icono: '🩸',
    nombre: 'SpO₂ (Pulsioximetría)',
    descripcion:
      'Saturación de oxígeno en sangre arterial medida de forma no invasiva. Alarma inmediata si el paciente sufre hipoxia.',
    valorRef: '>95% (ideal >99%)',
    colorAccent: '#F5A623',
  },
];

// ─────────────────────────────────────────────
// Bloque 1: Tipos de anestesia — selector
// ─────────────────────────────────────────────

function BloqueTiposAnestesia() {
  const [tipoActivo, setTipoActivo] = useState<TipoAnestesia>('local');
  const datos = TIPOS_ANESTESIA.find(t => t.id === tipoActivo) ?? TIPOS_ANESTESIA[0];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Los 3 Tipos de Anestesia</h2>
      <p className={styles.sectionDesc}>
        Mismo objetivo, mecanismos muy distintos. Selecciona un tipo para explorar cómo actúa.
      </p>

      <nav className={styles.tiposNav} role="tablist" aria-label="Tipos de anestesia">
        {TIPOS_ANESTESIA.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tipoActivo === t.id}
            className={`${styles.tipoBtn} ${tipoActivo === t.id ? styles.tipoBtnActivo : ''}`}
            onClick={() => setTipoActivo(t.id)}
            style={tipoActivo === t.id ? { borderColor: t.colorAccent, color: t.colorAccent } : {}}
          >
            <span aria-hidden="true">{t.icono}</span>
            {t.titulo}
          </button>
        ))}
      </nav>

      <div
        className={styles.tipoPanel}
        role="tabpanel"
        aria-label={`Información sobre ${datos.titulo}`}
      >
        <div className={styles.tipoPanelGrid}>
          <div className={styles.tipoPanelCol}>
            <div className={styles.tipoPanelBloque}>
              <h3 className={styles.tipoPanelSubtitulo} style={{ color: datos.colorAccent }}>
                Mecanismo de acción
              </h3>
              <p className={styles.tipoPanelTexto}>{datos.mecanismo}</p>
            </div>
            <div className={styles.tipoPanelBloque}>
              <h3 className={styles.tipoPanelSubtitulo} style={{ color: datos.colorAccent }}>
                Fármacos principales
              </h3>
              <ul className={styles.tipoPanelLista}>
                {datos.farmacos.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.tipoPanelCol}>
            <div className={styles.tipoPanelBloque}>
              <h3 className={styles.tipoPanelSubtitulo} style={{ color: datos.colorAccent }}>
                Duración
              </h3>
              <p className={styles.tipoPanelTexto}>{datos.duracion}</p>
            </div>
            <div className={styles.tipoPanelBloque}>
              <h3 className={styles.tipoPanelSubtitulo} style={{ color: datos.colorAccent }}>
                Usos típicos
              </h3>
              <ul className={styles.tipoPanelLista}>
                {datos.usos.map(u => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
            <div className={styles.insightBox} style={{ borderLeftColor: datos.colorAccent }}>
              <strong>Ventaja clave:</strong> {datos.ventaja}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 2: Los 5 componentes de la AG
// ─────────────────────────────────────────────

function BloqueComponentesGeneral() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Los 5 Componentes de la Anestesia General
      </h2>
      <p className={styles.sectionDesc}>
        La anestesia general no es un solo efecto: son cinco estados fisiológicos que el anestesiólogo debe conseguir y mantener de forma simultánea durante toda la intervención.
      </p>
      <div className={styles.componentesGrid}>
        {COMPONENTES_GENERAL.map(c => (
          <div key={c.numero} className={styles.componenteCard}>
            <div className={styles.componenteNumero}>{c.numero}</div>
            <div className={styles.componenteIcono} aria-hidden="true">{c.icono}</div>
            <h3 className={styles.componenteTitulo}>{c.titulo}</h3>
            <p className={styles.componenteDesc}>{c.descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 3: Mecanismo molecular — 4 pasos
// ─────────────────────────────────────────────

function BloqueMecanismoMolecular() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Mecanismo Molecular: De la Inducción a la Recuperación
      </h2>
      <p className={styles.sectionDesc}>
        Cuatro fases que transforman un paciente consciente en uno anestesiado y de vuelta.
        Cada paso tiene un fármaco, un receptor y un efecto fisiológico específico.
      </p>
      <div className={styles.pasosGrid}>
        {PASOS_MOLECULARES.map(paso => (
          <div
            key={paso.numero}
            className={styles.pasoCard}
            style={{ borderTopColor: paso.colorAccent }}
          >
            <div
              className={styles.pasoNumero}
              style={{ backgroundColor: paso.colorAccent }}
            >
              {paso.numero}
            </div>
            <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
            <p className={styles.pasoDesc}>{paso.descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 4: El enigma de la consciencia
// ─────────────────────────────────────────────

function BloqueEnigmaConsciencia() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>El Enigma de la Consciencia</h2>
      <p className={styles.sectionDesc}>
        170 años de uso clínico (desde el éter en Boston en 1846), miles de millones de procedimientos,
        y aún no tenemos una respuesta definitiva a la pregunta más básica.
      </p>

      <div className={styles.insightBox}>
        <p>
          <strong>El misterio:</strong> Después de 170 años de uso (primer anestésico: éter,{' '}
          <strong>1846, Massachusetts General Hospital</strong>), no sabemos exactamente por qué
          la anestesia general genera pérdida de consciencia. Sabemos los receptores que afecta,
          pero el mecanismo que &ldquo;apaga&rdquo; la consciencia sigue siendo uno de los grandes
          misterios de la neurociencia moderna.
        </p>
      </div>

      <div className={styles.teoriaGrid}>
        {TEORIAS_CONSCIENCIA.map(t => (
          <div key={t.titulo} className={styles.teoriaCard}>
            <h3 className={styles.teoriaTitulo}>{t.titulo}</h3>
            <p className={styles.teoriaDesc}>{t.descripcion}</p>
            <p className={styles.teoriaAutor}>{t.autor}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Bloque 5: Monitorización intraoperatoria
// ─────────────────────────────────────────────

function BloqueMonitorizacion() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Monitorización Durante la Cirugía</h2>
      <p className={styles.sectionDesc}>
        Cuatro parámetros que el anestesiólogo vigila de forma continua. Un cambio brusco en cualquiera
        puede indicar un problema que requiere acción inmediata.
      </p>
      <div className={styles.monitoresGrid}>
        {MONITORES.map(m => (
          <div
            key={m.nombre}
            className={styles.monitorCard}
            style={{ borderTopColor: m.colorAccent }}
          >
            <div
              className={styles.monitorIcono}
              aria-hidden="true"
              style={{ color: m.colorAccent }}
            >
              {m.icono}
            </div>
            <h3 className={styles.monitorNombre}>{m.nombre}</h3>
            <p className={styles.monitorDesc}>{m.descripcion}</p>
            <div
              className={styles.monitorValor}
              style={{ backgroundColor: `${m.colorAccent}18`, color: m.colorAccent }}
            >
              {m.valorRef}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insightBox} style={{ marginTop: '1.5rem' }}>
        <p>
          <strong>Consciencia intraoperatoria:</strong> el paciente &ldquo;despierta&rdquo; durante
          la cirugía pero no puede moverse (está paralizado por los relajantes musculares). Ocurre
          en aproximadamente <strong>1-2 de cada 1.000 cirugías</strong>. Es rara pero posible,
          de ahí la importancia crítica del monitor BIS.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAnestesiaPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>FARMACOLOGÍA</span>
          <h1 className={styles.heroTitle}>
            Anestesia: Cómo se Apaga (y Enciende) la Consciencia
          </h1>
          <p className={styles.heroSubtitle}>
            Local, regional y general: tres mecanismos, un objetivo
          </p>
          <p className={styles.heroDesc}>
            La anestesia local bloquea canales de sodio en nervios periféricos. La general deprime el
            sistema nervioso central actuando sobre receptores GABA-A y NMDA. Y aún hoy no sabemos
            exactamente por qué funciona.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" />

      <BloqueTiposAnestesia />
      <BloqueComponentesGeneral />
      <BloqueMecanismoMolecular />
      <BloqueEnigmaConsciencia />
      <BloqueMonitorizacion />

      <EducationalSection
        title="Más sobre la historia y ciencia de la anestesia"
        subtitle="170 años del mayor avance en cirugía: de la cirugía sin dolor al misterio de la consciencia"
        defaultOpen={false}
      >
        <h3>Antes de la anestesia: la velocidad como virtud</h3>
        <p>
          Antes de 1846, la única forma de soportar una cirugía era la velocidad del cirujano.
          Robert Liston, el cirujano más famoso de Londres en la primera mitad del siglo XIX,
          era capaz de realizar una amputación de pierna en menos de 30 segundos. Los pacientes
          eran sujetados físicamente por ayudantes. La tasa de mortalidad no venía de la cirugía
          en sí, sino de la infección posterior (antes de Pasteur y el antiséptico). La experiencia
          quirúrgica era simplemente un terror inimaginable.
        </p>
        <p>
          El 16 de octubre de 1846, el dentista William Morton administró éter sulfúrico a un paciente
          en el Massachusetts General Hospital mientras el cirujano John Collins Warren extirpaba un tumor
          del cuello. Cuando el paciente despertó sin dolor, Warren declaró:{' '}
          <em>&ldquo;Caballeros, esto no es un engaño&rdquo;</em>. Esa fecha se conoce como{' '}
          <strong>Ether Day</strong>.
        </p>

        <h3>El xenón: el anestésico perfecto que nadie usa</h3>
        <p>
          El xenón tiene propiedades anestésicas excepcionales: rápida inducción y recuperación,
          sin metabolismo hepático, mínimos efectos cardiovasculares, y es el único anestésico
          inhalado que no es un gas de efecto invernadero. El problema es su precio: el xenón cuesta
          aproximadamente <strong>20-30 veces más que el sevoflurano</strong> y debe capturarse del
          aire (está presente en tan solo 0,09 ppm). Hay sistemas de recuperación y reutilización
          del xenón exhalado, pero aún no son económicamente competitivos para uso rutinario.
        </p>

        <h3>Memoria implícita bajo anestesia</h3>
        <p>
          Estudios con hipnosis anestésica han demostrado algo perturbador: aunque el paciente no
          tiene ningún recuerdo consciente (<strong>amnesia explícita</strong> completa), puede haber
          aprendizaje implícito. En algunos experimentos, pacientes que escucharon frases durante la
          cirugía mostraron comportamientos relacionados con esas frases al despertar, sin poder
          recordar haberlas oído. La memoria implícita (procedural, emocional) puede sobrevivir
          a la pérdida de la memoria explícita.
        </p>

        <h3>La paradoja del propofol</h3>
        <p>
          El propofol es el fármaco de inducción anestésica más usado del mundo y uno de los más
          seguros en contexto médico. Es también el fármaco que causó la muerte de Michael Jackson
          en 2009, cuando su médico personal Conrad Murray lo administró fuera de contexto quirúrgico,
          sin equipamiento de monitorización, para tratar el insomnio del artista.
        </p>
        <p>
          La diferencia no está en el fármaco sino en el contexto: en un quirófano, el propofol va
          acompañado de monitorización continua (SpO₂, ECG, capnografía), ventilación mecánica disponible
          y un anestesiólogo entrenado. Sin ese entorno, la mínima sobredosis puede causar apnea
          (cese de la respiración) sin que nadie pueda revertirla.
        </p>

        <div className={styles.warningBox}>
          <strong>Aviso educativo:</strong> Este visualizador explica mecanismos farmacológicos con
          fines educativos. La anestesia siempre se administra y controla por especialistas médicos
          cualificados en entornos con equipamiento de monitorización completo. Los datos y
          porcentajes son orientativos; la variación individual en la respuesta a los anestésicos
          es significativa.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-anestesia')} />
      <ShareCard appName="visualizador-anestesia" />
      <Footer appName="visualizador-anestesia" />
    </div>
  );
}
