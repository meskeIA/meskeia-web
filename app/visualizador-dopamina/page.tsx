'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorDopamina.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

interface PasoCircuito {
  id: number;
  titulo: string;
  descripcion: string;
  dato?: string;
}

const PASOS_CIRCUITO: PasoCircuito[] = [
  {
    id: 1,
    titulo: 'El deseo',
    descripcion:
      'Cuando anticipas algo que podría ser bueno (comida, conexión social, logro), el Área Tegmental Ventral (ATV) se activa y empieza a liberar dopamina hacia el Núcleo Accumbens.',
    dato: 'El ATV se localiza en el tronco cerebral y es el origen principal del sistema de recompensa.',
  },
  {
    id: 2,
    titulo: 'La anticipación, no el placer',
    descripcion:
      'La dopamina no es la molécula del placer — es la del DESEO y la ANTICIPACIÓN. Los estudios muestran que la dopamina sube más antes de la recompensa que durante ella.',
    dato: 'La dopamina sube al anticipar, baja al recibir la recompensa esperada, y cae bajo la línea base si la recompensa no llega.',
  },
  {
    id: 3,
    titulo: 'La señal de error de predicción',
    descripcion:
      'El cerebro aprende comparando lo que esperaba con lo que ocurrió. Si la recompensa es mayor de lo esperado, hay un spike de dopamina. Si es igual, la dopamina permanece estable. Si es menor, la dopamina cae — sensación de frustración.',
    dato: 'Este mecanismo, llamado "error de predicción de recompensa", es la base del aprendizaje por refuerzo en el cerebro.',
  },
  {
    id: 4,
    titulo: 'El bucle habitual',
    descripcion:
      'Con repetición, la señal que predice la recompensa (el olor del café, la notificación del móvil) empieza a disparar dopamina por sí sola — antes de recibir nada.',
    dato: 'El circuito completo: Señal → Anticipación (dopamina) → Acción → Recompensa → Refuerzo del circuito.',
  },
];

interface ContextoDopamina {
  icono: string;
  titulo: string;
  descripcion: string;
}

const CONTEXTOS: ContextoDopamina[] = [
  {
    icono: '📱',
    titulo: 'Redes sociales',
    descripcion:
      'Las notificaciones son recompensas variables (a veces hay likes, a veces no). La variabilidad es más potente que la recompensa fija. El scroll infinito está diseñado para mantener el ciclo de anticipación activo.',
  },
  {
    icono: '🎮',
    titulo: 'Videojuegos',
    descripcion:
      'Los sistemas de logros, niveles y recompensas aleatorias (loot boxes) están optimizados para el circuito dopaminérgico. El progreso visible es especialmente efectivo.',
  },
  {
    icono: '🏋️',
    titulo: 'Ejercicio',
    descripcion:
      'El ejercicio aeróbico eleva la dopamina basal y aumenta la densidad de receptores D2. Efecto duradero, no puntual.',
  },
  {
    icono: '🍕',
    titulo: 'Comida',
    descripcion:
      'Los alimentos muy palatables (grasa+azúcar+sal) producen picos de dopamina. La variedad también importa: la monotonía reduce el efecto dopaminérgico.',
  },
  {
    icono: '🎯',
    titulo: 'Metas y logros',
    descripcion:
      'Completar una tarea genera un pico de dopamina. Las listas de tareas aprovechan este mecanismo. Dividir metas grandes en pequeñas maximiza el efecto.',
  },
  {
    icono: '🎵',
    titulo: 'Música',
    descripcion:
      'Los "escalofríos musicales" (chills) coinciden con picos de dopamina. La anticipación de un pasaje favorito ya activa el circuito antes de que suene.',
  },
  {
    icono: '☕',
    titulo: 'Cafeína',
    descripcion:
      'La cafeína no produce dopamina directamente, pero bloquea la adenosina (que inhibe la dopamina), amplificando el efecto dopaminérgico de forma indirecta.',
  },
  {
    icono: '💊',
    titulo: 'Sustancias adictivas',
    descripcion:
      'Las drogas como la cocaína o las anfetaminas producen aumentos de dopamina 5-10× mayores que las recompensas naturales. El circuito aprende que nada natural puede competir — base del mecanismo de adicción.',
  },
];

interface ModuladorDopamina {
  icono: string;
  titulo: string;
  efecto: '↑' | '↓' | '⚖️';
  descripcion: string;
}

const MODULADORES: ModuladorDopamina[] = [
  {
    icono: '🏃',
    titulo: 'Ejercicio aeróbico regular',
    efecto: '↑',
    descripcion: 'Aumenta receptores D2 y dopamina basal con práctica regular.',
  },
  {
    icono: '😴',
    titulo: 'Sueño adecuado',
    efecto: '↑',
    descripcion: 'La privación de sueño reduce receptores D2 y sensibilidad al sistema.',
  },
  {
    icono: '☀️',
    titulo: 'Luz solar',
    efecto: '↑',
    descripcion: 'La luz aumenta la síntesis de dopamina a través de la vitamina D.',
  },
  {
    icono: '🧘',
    titulo: 'Meditación',
    efecto: '↑',
    descripcion: 'Aumenta la actividad dopaminérgica en el córtex prefrontal.',
  },
  {
    icono: '🎯',
    titulo: 'Metas pequeñas alcanzables',
    efecto: '↑',
    descripcion: 'Cada logro activa el circuito de recompensa de forma sostenida.',
  },
  {
    icono: '📱',
    titulo: 'Sobreestimulación digital',
    efecto: '↓',
    descripcion: 'Puede reducir la sensibilidad de los receptores — fenómeno de tolerancia.',
  },
  {
    icono: '🍬',
    titulo: 'Azúcar en exceso',
    efecto: '⚖️',
    descripcion: 'Pico de dopamina seguido de desensibilización con el consumo crónico.',
  },
  {
    icono: '🍺',
    titulo: 'Alcohol en exceso',
    efecto: '↓',
    descripcion: 'Reduce dopamina basal y densidad de receptores con consumo crónico.',
  },
  {
    icono: '🥩',
    titulo: 'Proteína alimentaria',
    efecto: '↑',
    descripcion: 'La tirosina es precursora de dopamina — necesaria pero no suficiente por sí sola.',
  },
  {
    icono: '🤝',
    titulo: 'Conexiones sociales positivas',
    efecto: '↑',
    descripcion: 'El contacto social activa el circuito mesolímbico de forma natural.',
  },
];

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function DiagramaPaso1() {
  return (
    <div className={styles.diagramaPaso1}>
      <div className={styles.cajaCerebral}>
        <span className={styles.cajaLabel}>Área Tegmental Ventral</span>
        <span className={styles.cajaSubLabel}>(ATV — tronco cerebral)</span>
      </div>
      <div className={styles.flechaCircuito} aria-hidden="true">
        <span className={styles.flechaLinea}></span>
        <span className={styles.flechaPunta}>▶</span>
        <span className={styles.flechaEtiqueta}>Dopamina</span>
      </div>
      <div className={`${styles.cajaCerebral} ${styles.cajaDestino}`}>
        <span className={styles.cajaLabel}>Núcleo Accumbens</span>
        <span className={styles.cajaSubLabel}>(sistema límbico)</span>
      </div>
    </div>
  );
}

function GraficaAnticipacion() {
  // SVG simple: anticipación sube, recompensa baja, sin recompensa cae bajo 0
  return (
    <div className={styles.svgAnticipacionWrapper}>
      <svg
        className={styles.svgAnticipacion}
        viewBox="0 0 400 200"
        aria-label="Gráfico de dopamina durante anticipación y recompensa"
        role="img"
      >
        {/* Ejes */}
        <line x1="40" y1="160" x2="380" y2="160" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <line x1="40" y1="20" x2="40" y2="170" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />

        {/* Línea base */}
        <line x1="40" y1="120" x2="380" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
        <text x="2" y="124" fontSize="9" fill="currentColor" opacity="0.5">Base</text>

        {/* Escenario 1: Recompensa esperada */}
        <polyline
          points="50,120 100,120 140,50 180,80 210,120 250,120"
          fill="none"
          stroke="#48A9A6"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text x="55" y="115" fontSize="8" fill="#48A9A6">Anticipación</text>
        <text x="155" y="45" fontSize="8" fill="#48A9A6">↑ pico</text>
        <text x="185" y="75" fontSize="8" fill="#48A9A6">↓ recompensa</text>

        {/* Escenario 2: Sin recompensa */}
        <polyline
          points="260,120 290,120 310,50 330,150 380,150"
          fill="none"
          stroke="#E07070"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text x="315" y="145" fontSize="8" fill="#E07070">↓ frustración</text>

        {/* Leyenda */}
        <rect x="260" y="18" width="12" height="3" fill="#48A9A6" />
        <text x="275" y="22" fontSize="8" fill="currentColor">Recompensa esperada</text>
        <rect x="260" y="30" width="12" height="3" fill="#E07070" />
        <text x="275" y="34" fontSize="8" fill="currentColor">Sin recompensa</text>

        {/* Etiquetas eje X */}
        <text x="130" y="175" fontSize="8" fill="currentColor" opacity="0.6" textAnchor="middle">Anticipar</text>
        <text x="210" y="175" fontSize="8" fill="currentColor" opacity="0.6" textAnchor="middle">Recibir</text>
        <text x="320" y="175" fontSize="8" fill="currentColor" opacity="0.6" textAnchor="middle">No llega</text>
      </svg>
    </div>
  );
}

function ErrorPrediccion() {
  const casos = [
    {
      etiqueta: 'Mayor de lo esperado',
      flecha: '↑',
      color: '#48A9A6',
      descripcion: 'Spike de dopamina → "aprende a querer más"',
    },
    {
      etiqueta: 'Igual a lo esperado',
      flecha: '→',
      color: '#2E86AB',
      descripcion: 'Dopamina estable → conducta reforzada sin cambio',
    },
    {
      etiqueta: 'Menor de lo esperado',
      flecha: '↓',
      color: '#E07070',
      descripcion: 'Caída de dopamina → sensación de frustración',
    },
  ];

  return (
    <div className={styles.errorPrediccionGrid}>
      {casos.map((caso) => (
        <div key={caso.etiqueta} className={styles.errorCaso}>
          <span className={styles.errorFlecha} style={{ color: caso.color }}>
            {caso.flecha}
          </span>
          <strong className={styles.errorEtiqueta}>{caso.etiqueta}</strong>
          <p className={styles.errorDescripcion}>{caso.descripcion}</p>
        </div>
      ))}
    </div>
  );
}

function BucleHabitual() {
  const pasos = ['Señal', 'Anticipación\n(dopamina)', 'Acción', 'Recompensa', 'Refuerzo\ndel circuito'];

  return (
    <div className={styles.bucleContainer}>
      {pasos.map((paso, i) => (
        <div key={paso} className={styles.bucleItem}>
          <div className={styles.bucleNodo}>{paso}</div>
          {i < pasos.length - 1 && (
            <span className={styles.bucleFlecha} aria-hidden="true">▶</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorDopamina() {
  const [pasoActual, setPasoActual] = useState(0);

  const paso = PASOS_CIRCUITO[pasoActual];
  const relacionadas = getRelatedApps('visualizador-dopamina');

  function irAnterior() {
    setPasoActual((prev) => Math.max(0, prev - 1));
  }

  function irSiguiente() {
    setPasoActual((prev) => Math.min(PASOS_CIRCUITO.length - 1, prev + 1));
  }

  function renderContenidoPaso(id: number) {
    if (id === 1) return <DiagramaPaso1 />;
    if (id === 2) return <GraficaAnticipacion />;
    if (id === 3) return <ErrorPrediccion />;
    if (id === 4) return <BucleHabitual />;
    return null;
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Dopamina</h1>
        <p>El sistema de recompensa del cerebro: motivación, deseo y aprendizaje</p>
      </header>

      <LegalNotice />

      {/* ── BLOQUE 1: El Circuito de Recompensa ── */}
      <section className={styles.section} aria-labelledby="titulo-circuito">
        <h2 id="titulo-circuito" className={styles.sectionTitle}>
          El Circuito de Recompensa: Cómo Funciona
        </h2>
        <p className={styles.sectionIntro}>
          El sistema dopaminérgico mesolímbico es uno de los circuitos más estudiados del cerebro.
          Navega por los 4 pasos del proceso:
        </p>

        <div className={styles.circuitoContainer}>
          {/* Indicadores de paso */}
          <div className={styles.stepIndicator} role="tablist" aria-label="Pasos del circuito de recompensa">
            {PASOS_CIRCUITO.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={i === pasoActual}
                aria-label={`Paso ${p.id}: ${p.titulo}`}
                className={`${styles.indicadorPunto} ${i === pasoActual ? styles.indicadorActivo : ''}`}
                onClick={() => setPasoActual(i)}
              />
            ))}
          </div>

          {/* Contenido del paso */}
          <div className={styles.pasoContenido}>
            <div className={styles.pasoHeader}>
              <span className={styles.pasoNumero}>Paso {paso.id} / {PASOS_CIRCUITO.length}</span>
              <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
            </div>

            <p className={styles.pasoDescripcion}>{paso.descripcion}</p>

            <div className={styles.pasoVisualizacion}>
              {renderContenidoPaso(paso.id)}
            </div>

            {paso.dato && (
              <p className={styles.pasoDato}>
                <span aria-hidden="true">💡</span> {paso.dato}
              </p>
            )}
          </div>

          {/* Controles */}
          <div className={styles.stepControls}>
            <button
              className={styles.btnControl}
              onClick={irAnterior}
              disabled={pasoActual === 0}
              aria-label="Paso anterior"
            >
              ← Anterior
            </button>
            <span className={styles.stepCounterText}>{pasoActual + 1} de {PASOS_CIRCUITO.length}</span>
            <button
              className={styles.btnControl}
              onClick={irSiguiente}
              disabled={pasoActual === PASOS_CIRCUITO.length - 1}
              aria-label="Paso siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      {/* ── BLOQUE 2: 8 Contextos ── */}
      <section className={styles.section} aria-labelledby="titulo-contextos">
        <h2 id="titulo-contextos" className={styles.sectionTitle}>
          Dopamina en tu Vida: 8 Contextos
        </h2>
        <p className={styles.sectionIntro}>
          El sistema dopaminérgico no es exclusivo de las adicciones — está activo en casi todo lo que haces.
        </p>

        <div className={styles.gridContextos}>
          {CONTEXTOS.map((ctx) => (
            <div key={ctx.titulo} className={styles.contextCard}>
              <span className={styles.contextIcono} aria-hidden="true">{ctx.icono}</span>
              <h3 className={styles.contextTitulo}>{ctx.titulo}</h3>
              <p className={styles.contextDescripcion}>{ctx.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOQUE 3: Parkinson ── */}
      <section className={styles.section} aria-labelledby="titulo-parkinson">
        <h2 id="titulo-parkinson" className={styles.sectionTitle}>
          Cuando la Dopamina Falla: El Mecanismo del Parkinson
        </h2>
        <p className={styles.sectionIntro}>
          El Parkinson es la segunda enfermedad neurodegenerativa más frecuente del mundo. Su mecanismo
          central es la pérdida de neuronas productoras de dopamina en la sustancia negra.
        </p>

        <div className={styles.parkinssonComparativa}>
          {/* Normal */}
          <div className={styles.parkinsonPanel}>
            <h3 className={styles.parkinsonPanelTitulo}>
              <span className={styles.parkinsonBadgeNormal}>Normal</span>
            </h3>
            <div className={styles.neuronasContainer}>
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className={styles.neuronaNormal} aria-hidden="true" />
              ))}
            </div>
            <p className={styles.parkinsonDescripcion}>
              <strong>Sustancia Negra (SN):</strong> Las neuronas dopaminérgicas envían dopamina
              al estriado, permitiendo el control fluido del movimiento.
            </p>
            <div className={styles.parkinsonFlecha}>
              <span>SN → Estriado (dopamina fluida)</span>
              <span className={styles.flechaFuerte}>→→→</span>
            </div>
          </div>

          {/* Parkinson */}
          <div className={`${styles.parkinsonPanel} ${styles.parkinsonPanelAfectado}`}>
            <h3 className={styles.parkinsonPanelTitulo}>
              <span className={styles.parkinsonBadgeAfectado}>Parkinson</span>
            </h3>
            <div className={styles.neuronasContainer}>
              {Array.from({ length: 20 }).map((_, i) => (
                <span
                  key={i}
                  className={i < 4 ? styles.neuronaNormal : styles.neuronaLost}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className={styles.parkinsonDescripcion}>
              <strong>Sustancia Negra:</strong> Pérdida progresiva de más del 70-80% de las
              neuronas dopaminérgicas antes de que aparezcan síntomas motores visibles.
            </p>
            <div className={styles.parkinsonFlecha}>
              <span>SN → Estriado (señal débil)</span>
              <span className={styles.flechaDebil}>→</span>
            </div>
          </div>
        </div>

        <div className={styles.parkinsonNota}>
          <p>
            La <strong>levodopa</strong> (tratamiento farmacológico principal) actúa como precursor
            de la dopamina que el cerebro ya no puede producir suficientemente. La investigación
            actual trabaja en neuroprotección y nuevas vías terapéuticas.
          </p>
          <p className={styles.parkinsonCierre}>
            Esta sección es puramente informativa sobre el mecanismo fisiológico. El diagnóstico
            y tratamiento del Parkinson son responsabilidad exclusiva de especialistas médicos.
          </p>
        </div>
      </section>

      {/* ── BLOQUE 4: Moduladores Naturales ── */}
      <section className={styles.section} aria-labelledby="titulo-moduladores">
        <h2 id="titulo-moduladores" className={styles.sectionTitle}>
          Moduladores Naturales del Sistema Dopaminérgico
        </h2>
        <p className={styles.sectionIntro}>
          No es "cómo aumentar tu dopamina" — es qué factores influyen fisiológicamente en el sistema.
        </p>

        <div className={styles.gridModuladores}>
          {MODULADORES.map((mod) => (
            <div key={mod.titulo} className={styles.moduladorCard}>
              <div className={styles.moduladorHeader}>
                <span className={styles.moduladorIcono} aria-hidden="true">{mod.icono}</span>
                <span
                  className={`${styles.moduladorBadge} ${
                    mod.efecto === '↑'
                      ? styles.badgeArriba
                      : mod.efecto === '↓'
                      ? styles.badgeAbajo
                      : styles.badgeComplejo
                  }`}
                  aria-label={
                    mod.efecto === '↑'
                      ? 'activa el sistema'
                      : mod.efecto === '↓'
                      ? 'reduce el sistema'
                      : 'efecto complejo'
                  }
                >
                  {mod.efecto}
                </span>
              </div>
              <h3 className={styles.moduladorTitulo}>{mod.titulo}</h3>
              <p className={styles.moduladorDescripcion}>{mod.descripcion}</p>
            </div>
          ))}
        </div>

        <div className={styles.warningBox} role="note">
          <strong>Nota científica:</strong> Estos son efectos fisiológicos documentados en investigación.
          El sistema dopaminérgico es enormemente complejo — el contexto, la frecuencia y el estado
          individual importan. "Más dopamina = mejor" es una simplificación errónea.
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection title="Dopamina: Más Allá del Titular" subtitle="Neurociencia de la dopamina: vías, receptores y mitos más comunes">
        <h3>¿Neurotransmisor o hormona? Es ambas</h3>
        <p>
          La dopamina actúa como <strong>neurotransmisor</strong> cuando es liberada en sinapsis entre
          neuronas del cerebro. Pero también funciona como <strong>hormona</strong> cuando se libera
          desde la médula suprarrenal al torrente sanguíneo, donde regula funciones sistémicas como la
          presión arterial. La distinción depende de dónde actúa, no de la molécula en sí.
        </p>

        <h3>Las 4 vías dopaminérgicas del cerebro</h3>
        <ul>
          <li>
            <strong>Mesolímbica:</strong> ATV → Núcleo Accumbens. El circuito de recompensa que
            controla la motivación, el placer anticipatorio y las conductas adictivas.
          </li>
          <li>
            <strong>Mesocortical:</strong> ATV → Córtex Prefrontal. Regula funciones ejecutivas:
            atención, planificación, memoria de trabajo. Implicada en el TDAH y la esquizofrenia.
          </li>
          <li>
            <strong>Nigroestriada:</strong> Sustancia Negra → Estriado. Control del movimiento
            voluntario. Su degeneración causa el Parkinson.
          </li>
          <li>
            <strong>Tuberoinfundibular:</strong> Hipotálamo → Pituitaria. Regula la prolactina.
            Algunos antipsicóticos bloquean esta vía, causando efectos secundarios hormonales.
          </li>
        </ul>

        <h3>Dopamina y esquizofrenia: la hipótesis dopaminérgica</h3>
        <p>
          La hipótesis clásica postula que la esquizofrenia implica <em>hiperactividad</em> del sistema
          dopaminérgico mesolímbico (síntomas positivos: alucinaciones, delirios) e <em>hipoactividad</em>
          del mesocortical (síntomas negativos: apatía, dificultades cognitivas). Esta teoría explica
          por qué los antipsicóticos — que bloquean receptores D2 — son eficaces para los síntomas
          positivos pero tienen menos impacto en los negativos. La realidad neurobiológica es mucho más
          compleja, con implicación de glutamato, serotonina y otros sistemas.
        </p>

        <h3>Dopamina vs. Serotonina: no son lo mismo</h3>
        <p>
          Una confusión habitual en divulgación popular: dopamina y serotonina no son intercambiables.
          La dopamina está asociada principalmente a <strong>motivación, deseo y anticipación</strong>.
          La serotonina está asociada a <strong>bienestar, satisfacción y regulación del estado de ánimo</strong>.
          Un desequilibrio en serotonina está más relacionado con la depresión (los ISRS actúan aquí),
          mientras que la dopamina está más implicada en la anhedonia, el TDAH y las adicciones.
        </p>

        <h3>TDAH y dopamina: qué dice la ciencia</h3>
        <p>
          El TDAH está asociado a una menor eficiencia del sistema dopaminérgico en el córtex prefrontal,
          especialmente en la vía mesocortical. Los estimulantes (metilfenidato, anfetaminas) aumentan la
          disponibilidad de dopamina y norepinefrina en el espacio sináptico, mejorando la regulación de
          la atención y el control ejecutivo. Esto explica la aparente paradoja de que estimulantes
          "calmen" a personas con TDAH: no es sedación, es normalización del sistema.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>La dopamina en perspectiva:</strong> La dopamina es una molécula fascinante pero mucho
          más compleja de lo que los titulares sugieren. "Más dopamina = mejor" es una simplificación
          errónea. El contexto, los receptores y el circuito completo determinan el efecto. El mismo
          sistema que hace posible la motivación y el aprendizaje es el que subyace a las adicciones.
        </div>
      </EducationalSection>

      <RelatedApps apps={relacionadas} />
      <ShareCard appName="visualizador-dopamina" />
      <Footer appName="visualizador-dopamina" />
    </div>
  );
}
