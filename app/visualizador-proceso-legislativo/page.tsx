'use client';

import { useState } from 'react';
import styles from './VisualizadorProcesoLegislativo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'propuesta' | 'congreso' | 'senado' | 'publicacion';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'propuesta', titulo: 'La propuesta', icono: '💡', subtitulo: '¿Quién puede proponer una ley?' },
  { id: 'congreso', titulo: 'El Congreso', icono: '🏛️', subtitulo: 'Debate, enmiendas y votación' },
  { id: 'senado', titulo: 'El Senado', icono: '📜', subtitulo: 'Segunda lectura y posible veto' },
  { id: 'publicacion', titulo: 'Publicación', icono: '📰', subtitulo: 'Del BOE a tu día a día' },
];

// ─────────────────────────────────────────────
// Sección 1: La propuesta
// ─────────────────────────────────────────────

function SeccionPropuesta() {
  const origenes = [
    {
      icono: '🏛️',
      nombre: 'Gobierno',
      tipo: 'Proyecto de ley',
      descripcion: 'El Consejo de Ministros aprueba un proyecto y lo envía al Congreso. Es la vía más común: ~70% de las leyes aprobadas nacen aquí.',
      dato: 'Tiene prioridad en la tramitación parlamentaria.',
      color: 'var(--primary)',
    },
    {
      icono: '👥',
      nombre: 'Congreso de los Diputados',
      tipo: 'Proposición de ley',
      descripcion: 'Un grupo parlamentario (o 15 diputados) presenta una proposición. Primero se vota si se admite a trámite (toma en consideración) y luego se debate.',
      dato: 'Solo ~15% de las proposiciones llegan a ser ley.',
      color: 'var(--secondary)',
    },
    {
      icono: '📜',
      nombre: 'Senado',
      tipo: 'Proposición de ley',
      descripcion: 'El Senado también puede proponer leyes. Se tramitan primero allí y luego pasan al Congreso para su aprobación definitiva.',
      dato: 'Vía poco frecuente — el Senado actúa más como cámara de revisión.',
      color: '#8B5CF6',
    },
    {
      icono: '🗺️',
      nombre: 'Parlamentos autonómicos',
      tipo: 'Proposición de ley',
      descripcion: 'Las asambleas de las Comunidades Autónomas pueden solicitar al Gobierno que adopte un proyecto de ley o enviar una proposición directamente al Congreso.',
      dato: 'Máximo 3 representantes de la CCAA pueden defenderla en el Congreso.',
      color: '#F59E0B',
    },
    {
      icono: '✊',
      nombre: 'Ciudadanos',
      tipo: 'Iniciativa Legislativa Popular (ILP)',
      descripcion: 'Los ciudadanos pueden proponer una ley reuniendo al menos 500.000 firmas verificadas. No puede tratar sobre fiscalidad, asuntos internacionales, ni indultos.',
      dato: formatNumber(500000, 0) + ' firmas necesarias — solo ~5 ILP han prosperado desde 1984.',
      color: '#EF4444',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>En España, una ley puede nacer de <strong>5 orígenes diferentes</strong>. No solo el Gobierno propone leyes — aunque es quien más lo hace.</p>
      </div>

      <div className={styles.origenesGrid}>
        {origenes.map((o, i) => (
          <div key={i} className={styles.origenCard}>
            <div className={styles.origenHeader}>
              <span className={styles.origenIcono} aria-hidden="true">{o.icono}</span>
              <div>
                <span className={styles.origenNombre}>{o.nombre}</span>
                <span className={styles.origenTipo} style={{ color: o.color }}>{o.tipo}</span>
              </div>
            </div>
            <p className={styles.origenDesc}>{o.descripcion}</p>
            <p className={styles.origenDato}>{o.dato}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>La realidad:</strong> aunque existen 5 vías, la inmensa mayoría de leyes nacen del Gobierno.
          Las Iniciativas Legislativas Populares son las más difíciles — pero cuando prosperan, tienen un impacto
          enorme porque representan la voz directa de la ciudadanía.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: El Congreso
// ─────────────────────────────────────────────

function SeccionCongreso() {
  const pasos = [
    {
      num: 1,
      titulo: 'Presentación y calificación',
      icono: '📋',
      duracion: '1-2 semanas',
      descripcion: 'La Mesa del Congreso recibe el texto, lo califica y lo envía a la comisión correspondiente. Se publica en el Boletín Oficial de las Cortes.',
    },
    {
      num: 2,
      titulo: 'Plazo de enmiendas',
      icono: '✏️',
      duracion: '15 días (prorrogable)',
      descripcion: 'Los grupos parlamentarios presentan enmiendas: a la totalidad (rechazo completo o texto alternativo) o parciales (cambios artículo por artículo).',
    },
    {
      num: 3,
      titulo: 'Ponencia',
      icono: '🔍',
      duracion: '1-3 meses',
      descripcion: 'Un grupo reducido de diputados (la ponencia) estudia el texto y las enmiendas. Elabora un informe con las enmiendas aceptadas. Es el trabajo técnico más intenso.',
    },
    {
      num: 4,
      titulo: 'Debate en Comisión',
      icono: '🗣️',
      duracion: '1-4 semanas',
      descripcion: 'La comisión parlamentaria debate el informe de la ponencia. Se votan las enmiendas una a una. El texto resultante se llama dictamen.',
    },
    {
      num: 5,
      titulo: 'Debate en Pleno',
      icono: '🏛️',
      duracion: '1-2 días',
      descripcion: 'Los 350 diputados debaten y votan el texto. Se necesita mayoría simple para aprobar (más síes que noes entre los presentes). Es el momento más visible del proceso.',
    },
    {
      num: 6,
      titulo: 'Aprobación',
      icono: '✅',
      duracion: 'Inmediato',
      descripcion: 'Si el Pleno aprueba el texto, se envía al Senado para su segunda lectura. Si lo rechaza, el proyecto muere — salvo que se negocie una versión nueva.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El Congreso de los Diputados es la <strong>cámara principal</strong>. Aquí se debate, se enmienda y se vota. El proceso dura entre <strong>3 y 8 meses</strong> de media.</p>
      </div>

      <div className={styles.flujoVertical}>
        {pasos.map((p, i) => (
          <div key={p.num} className={styles.pasoItem}>
            <div className={styles.pasoLinea}>
              <div className={styles.pasoCirculo}>
                <span>{p.num}</span>
              </div>
              {i < pasos.length - 1 && <div className={styles.pasoConector} aria-hidden="true" />}
            </div>
            <div className={styles.pasoContenido}>
              <div className={styles.pasoHeader}>
                <span className={styles.pasoIcono} aria-hidden="true">{p.icono}</span>
                <h3 className={styles.pasoTitulo}>{p.titulo}</h3>
                <span className={styles.pasoDuracion}>{p.duracion}</span>
              </div>
              <p className={styles.pasoDesc}>{p.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoIcono} aria-hidden="true">⏱️</span>
        <div>
          <span className={styles.datoLabel}>Tiempo medio en el Congreso</span>
          <span className={styles.datoValor}>3 - 8 meses</span>
          <span className={styles.datoNota}>Las leyes urgentes pueden tramitarse en semanas. Las polémicas pueden estancarse años.</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>El verdadero trabajo se hace en comisión</strong>, no en el Pleno. Los debates del Pleno
          que salen en televisión son la parte más visible, pero las negociaciones reales — dónde va una coma,
          qué excepción se añade — ocurren en la ponencia y la comisión, lejos de las cámaras.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: El Senado
// ─────────────────────────────────────────────

function SeccionSenado() {
  const caminos = [
    {
      icono: '✅',
      titulo: 'Aprueba sin cambios',
      probabilidad: '~60%',
      descripcion: 'El Senado aprueba el texto tal como llegó del Congreso. El proyecto pasa directamente a sanción real.',
      siguiente: 'Sanción y publicación',
      color: 'var(--verde)',
    },
    {
      icono: '✏️',
      titulo: 'Introduce enmiendas',
      probabilidad: '~35%',
      descripcion: 'El Senado modifica algunos artículos. El texto vuelve al Congreso, que vota las enmiendas del Senado por mayoría simple.',
      siguiente: 'Vuelta al Congreso',
      color: 'var(--primary)',
    },
    {
      icono: '🚫',
      titulo: 'Veta el texto',
      probabilidad: '~5% (muy raro)',
      descripcion: 'El Senado rechaza el texto completo por mayoría absoluta. El Congreso puede levantar el veto con mayoría absoluta (176 votos) inmediatamente, o por mayoría simple pasados 2 meses.',
      siguiente: 'El Congreso decide',
      color: 'var(--rojo)',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El Senado tiene <strong>2 meses</strong> (20 días naturales si es urgente) para revisar el texto aprobado por el Congreso. Puede tomar <strong>3 caminos</strong>.</p>
      </div>

      {/* Flujo visual: Congreso → Senado → 3 caminos */}
      <div className={styles.flujoSenado}>
        <div className={styles.flujoOrigenSenado}>
          <span className={styles.flujoOrigenIcono} aria-hidden="true">🏛️</span>
          <span className={styles.flujoOrigenLabel}>Del Congreso</span>
        </div>
        <div className={styles.flujoFlechaVertical} aria-hidden="true">▼</div>
        <div className={styles.senadoBloque}>
          <span className={styles.senadoBloqueIcono} aria-hidden="true">📜</span>
          <span className={styles.senadoBloqueTexto}>SENADO</span>
          <span className={styles.senadoBloquePlazo}>2 meses</span>
        </div>
        <div className={styles.flujoFlechaVertical} aria-hidden="true">▼</div>
      </div>

      <div className={styles.caminosGrid}>
        {caminos.map((c, i) => (
          <div key={i} className={styles.caminoCard} style={{ borderTopColor: c.color }}>
            <div className={styles.caminoHeader}>
              <span className={styles.caminoIcono} aria-hidden="true">{c.icono}</span>
              <div>
                <span className={styles.caminoTitulo}>{c.titulo}</span>
                <span className={styles.caminoProb}>{c.probabilidad}</span>
              </div>
            </div>
            <p className={styles.caminoDesc}>{c.descripcion}</p>
            <div className={styles.caminoSiguiente}>
              <span aria-hidden="true">→</span> {c.siguiente}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>
          <strong>¿El Senado puede bloquear una ley?</strong> En la práctica, no. El Congreso siempre
          tiene la última palabra. Incluso si el Senado veta una ley, el Congreso puede levantar el veto.
          Por eso se dice que España tiene un <strong>bicameralismo imperfecto</strong> — las dos cámaras
          no tienen el mismo poder.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          El Senado fue diseñado como cámara de <strong>representación territorial</strong>, pero en la
          práctica actúa más como cámara de segunda lectura. Muchos expertos consideran que necesita una
          reforma profunda para cumplir su función original.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Publicación
// ─────────────────────────────────────────────

function SeccionPublicacion() {
  const etapas = [
    {
      icono: '👑',
      titulo: 'Sanción Real',
      duracion: '15 días',
      descripcion: 'El Rey sanciona la ley (la firma). Es un acto formal obligatorio — el Rey no puede negarse. Refrenda el presidente del Gobierno.',
    },
    {
      icono: '📣',
      titulo: 'Promulgación',
      duracion: 'Mismo acto',
      descripcion: 'El Rey ordena la publicación de la ley y manda a todos los ciudadanos y autoridades que la cumplan y la hagan cumplir.',
    },
    {
      icono: '📰',
      titulo: 'Publicación en el BOE',
      duracion: '1-5 días',
      descripcion: 'La ley se publica en el Boletín Oficial del Estado (BOE). A partir de aquí existe oficialmente y el plazo de vacatio legis empieza a contar.',
    },
    {
      icono: '⏳',
      titulo: 'Vacatio legis',
      duracion: '20 días (por defecto)',
      descripcion: 'Periodo entre la publicación y la entrada en vigor. Permite que ciudadanos, empresas y administraciones se adapten. Algunas leyes fijan plazos diferentes (3, 6 o 12 meses).',
    },
    {
      icono: '⚖️',
      titulo: 'Entrada en vigor',
      duracion: '—',
      descripcion: 'La ley es de obligado cumplimiento para todos. Desde este momento se pueden aplicar sanciones por incumplimiento. "La ignorancia de la ley no exime de su cumplimiento" (art. 6.1 CC).',
    },
  ];

  const tiemposReales = [
    { fase: 'Propuesta → Congreso', min: '3 meses', max: '12 meses', barra: 40 },
    { fase: 'Congreso → Senado', min: '3 meses', max: '8 meses', barra: 35 },
    { fase: 'Senado', min: '15 días', max: '2 meses', barra: 12 },
    { fase: 'Sanción + BOE', min: '2 días', max: '15 días', barra: 5 },
    { fase: 'Vacatio legis', min: '20 días', max: '12 meses', barra: 8 },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Aprobada por las Cortes, la ley aún no está en vigor. Quedan los <strong>últimos pasos formales</strong> antes de que te afecte en tu día a día.</p>
      </div>

      <div className={styles.flujoVertical}>
        {etapas.map((e, i) => (
          <div key={i} className={styles.pasoItem}>
            <div className={styles.pasoLinea}>
              <div className={styles.pasoCirculo}>
                <span>{i + 1}</span>
              </div>
              {i < etapas.length - 1 && <div className={styles.pasoConector} aria-hidden="true" />}
            </div>
            <div className={styles.pasoContenido}>
              <div className={styles.pasoHeader}>
                <span className={styles.pasoIcono} aria-hidden="true">{e.icono}</span>
                <h3 className={styles.pasoTitulo}>{e.titulo}</h3>
                <span className={styles.pasoDuracion}>{e.duracion}</span>
              </div>
              <p className={styles.pasoDesc}>{e.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className={styles.seccionSubtituloH3}>Tiempos reales: de la idea a la ley</h3>
      <div className={styles.tiemposGrid}>
        {tiemposReales.map((t, i) => (
          <div key={i} className={styles.tiempoItem}>
            <span className={styles.tiempoFase}>{t.fase}</span>
            <div className={styles.tiempoBarra}>
              <div className={styles.tiempoRelleno} style={{ width: `${t.barra}%` }} />
            </div>
            <span className={styles.tiempoRango}>{t.min} — {t.max}</span>
          </div>
        ))}
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoIcono} aria-hidden="true">📊</span>
        <div>
          <span className={styles.datoLabel}>Tiempo total medio</span>
          <span className={styles.datoValor}>8 - 18 meses</span>
          <span className={styles.datoNota}>Desde que se presenta la propuesta hasta que la ley entra en vigor. Las leyes urgentes pueden reducirlo a 2-3 meses.</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>¿Por qué tarda tanto?</strong> Hacer una ley no es como aprobar un examen — es un proceso
          deliberado de negociación entre partidos, revisión técnica y garantías democráticas. La lentitud
          no es un defecto: es el precio de que todas las voces sean escuchadas antes de crear una norma
          que afectará a 48 millones de personas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorProcesoLegislativoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('propuesta');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'propuesta': return <SeccionPropuesta />;
      case 'congreso': return <SeccionCongreso />;
      case 'senado': return <SeccionSenado />;
      case 'publicacion': return <SeccionPublicacion />;
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
          <h1 className={styles.title}>El Viaje de una Ley</h1>
          <p className={styles.subtitle}>Cómo nace, se debate y se aprueba una ley en España</p>
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
          title="Lo que no te cuentan del proceso legislativo"
          subtitle="Curiosidades y matices que importan"
          defaultOpen={false}
        >
          <h3>Decretos-ley: la &quot;vía rápida&quot; del Gobierno</h3>
          <p>
            En caso de &quot;extraordinaria y urgente necesidad&quot;, el Gobierno puede aprobar
            un Decreto-ley sin pasar por el Parlamento. Entra en vigor inmediatamente, pero el
            Congreso debe convalidarlo en 30 días. Si no lo hace, se deroga. Se usó masivamente
            durante la pandemia de COVID-19.
          </p>

          <h3>¿Cuántas leyes se aprueban al año?</h3>
          <p>
            Entre 30 y 60 leyes ordinarias por legislatura, más los Decretos-ley. En la XIV
            legislatura (2020-2023) se aprobaron más de 80 Decretos-ley — un récord histórico
            motivado por la pandemia y la crisis energética.
          </p>

          <h3>Leyes orgánicas vs. leyes ordinarias</h3>
          <p>
            Las leyes orgánicas regulan derechos fundamentales, el régimen electoral y los
            Estatutos de Autonomía. Requieren mayoría absoluta (176 votos) en el Congreso, no
            solo mayoría simple. Son más difíciles de aprobar y de modificar.
          </p>

          <h3>El papel del Tribunal Constitucional</h3>
          <p>
            Después de publicarse una ley, el TC puede declararla inconstitucional si contradice
            la Constitución. Pueden recurrir: el presidente, 50 diputados, 50 senadores, el
            Defensor del Pueblo o los gobiernos y parlamentos autonómicos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador es una simplificación educativa del proceso
            legislativo español. El procedimiento real incluye especialidades (leyes orgánicas,
            de presupuestos, procedimientos de lectura única, etc.) no cubiertas aquí.
            Fuentes: Constitución Española (Título III) y Reglamentos del Congreso y del Senado.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-proceso-legislativo')} />
        <ShareCard appName="visualizador-proceso-legislativo" />
        <Footer appName="visualizador-proceso-legislativo" />
      </div>
    </>
  );
}
