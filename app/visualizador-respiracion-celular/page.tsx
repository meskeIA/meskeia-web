'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './RespiracionCelular.module.css';
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

type Seccion = 'proceso' | 'fases' | 'mitocondria' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'proceso', titulo: 'El Proceso', icono: '⚡', subtitulo: 'De la glucosa a la energía' },
  { id: 'fases', titulo: 'Las 3 Fases', icono: '🔬', subtitulo: 'Glucólisis, Krebs y cadena de electrones' },
  { id: 'mitocondria', titulo: 'La Mitocondria', icono: '🏭', subtitulo: 'La central energética de la célula' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '🧠', subtitulo: 'Cifras que sorprenden' },
];

// ─────────────────────────────────────────────
// Datos — Sección 1: Proceso General
// ─────────────────────────────────────────────

interface Componente {
  id: string;
  icono: string;
  nombre: string;
  formula: string;
  colorClass: string;
  descripcion: string;
  dato: string;
}

const COMPONENTES_ENTRADA: Componente[] = [
  {
    id: 'glucosa',
    icono: '🍬',
    nombre: 'Glucosa',
    formula: 'C₆H₁₂O₆',
    colorClass: 'molGlucosa',
    descripcion: 'La glucosa es un azúcar de 6 carbonos que contiene energía química almacenada en sus enlaces. Proviene de la digestión de los alimentos o, en plantas, de la fotosíntesis.',
    dato: 'Una sola molécula de glucosa puede generar hasta 38 moléculas de ATP.',
  },
  {
    id: 'o2',
    icono: '🫧',
    nombre: 'Oxígeno',
    formula: '6O₂',
    colorClass: 'molO2',
    descripcion: 'El oxígeno molecular llega a las células a través de la respiración pulmonar y la sangre. Es el aceptor final de electrones en la cadena de transporte.',
    dato: 'Sin O₂, la célula solo obtiene 2 ATP por glucosa en vez de 38: es la diferencia entre caminar y correr un sprint.',
  },
];

const COMPONENTES_SALIDA: Componente[] = [
  {
    id: 'co2',
    icono: '💨',
    nombre: 'Dióxido de carbono',
    formula: '6CO₂',
    colorClass: 'molCO2',
    descripcion: 'El CO₂ es un producto de desecho de la descarboxilación de moléculas orgánicas. Se transporta por la sangre hasta los pulmones y se exhala.',
    dato: 'Exhalas unos 200 mL de CO₂ por minuto en reposo — casi 300 litros al día.',
  },
  {
    id: 'agua',
    icono: '💧',
    nombre: 'Agua',
    formula: '6H₂O',
    colorClass: 'molAgua',
    descripcion: 'El agua metabólica se produce cuando el oxígeno acepta los electrones y los iones H⁺ al final de la cadena de transporte. Es agua que fabrica tu propio cuerpo.',
    dato: 'Un camello obtiene gran parte de su agua del metabolismo de la grasa de su joroba, no de beber.',
  },
  {
    id: 'atp',
    icono: '🔋',
    nombre: 'ATP',
    formula: '36-38 ATP',
    colorClass: 'molATP',
    descripcion: 'El adenosín trifosfato es la moneda energética universal de la célula. Al romperse el enlace del tercer fosfato, libera energía para todo: moverse, pensar, repararse.',
    dato: 'Produces unos 65 kg de ATP al día, pero lo reciclas tan rápido que solo tienes ~50 g en cada momento.',
  },
];

// ─────────────────────────────────────────────
// Datos — Sección 2: Las 3 Fases
// ─────────────────────────────────────────────

interface FaseInfo {
  id: string;
  icono: string;
  nombre: string;
  lugar: string;
  reaccion: string;
  descripcion: string;
  detalle: string;
  atp: number;
  atpLabel: string;
}

const FASES: FaseInfo[] = [
  {
    id: 'glucolisis',
    icono: '✂️',
    nombre: 'Glucólisis',
    lugar: 'Citoplasma',
    reaccion: '1 glucosa (6C) → 2 piruvato (3C) + 2 ATP + 2 NADH',
    descripcion: 'La glucosa de 6 carbonos se rompe en dos moléculas de piruvato de 3 carbonos. Es la vía metabólica más antigua: existía antes de que hubiera oxígeno en la atmósfera.',
    detalle: 'No necesita oxígeno (anaeróbica). Se invierte 2 ATP y se producen 4 ATP → ganancia neta: 2 ATP. También se generan 2 NADH que llevarán electrones a la cadena de transporte.',
    atp: 2,
    atpLabel: 'ATP neto',
  },
  {
    id: 'krebs',
    icono: '🔄',
    nombre: 'Ciclo de Krebs',
    lugar: 'Matriz mitocondrial',
    reaccion: 'Piruvato → Acetil-CoA → ciclo → CO₂ + NADH + FADH₂ + 2 ATP',
    descripcion: 'El piruvato pierde un carbono (CO₂) y se convierte en Acetil-CoA, que entra en un ciclo de 8 reacciones. Cada vuelta extrae energía y la almacena en NADH y FADH₂.',
    detalle: 'Se dan 2 vueltas por cada glucosa (una por cada piruvato). En total: 6 NADH + 2 FADH₂ + 2 ATP + 4 CO₂. El ciclo fue descubierto por Hans Krebs en 1937 (Nobel 1953).',
    atp: 2,
    atpLabel: 'ATP (GTP)',
  },
  {
    id: 'cadena',
    icono: '⛓️',
    nombre: 'Cadena de transporte',
    lugar: 'Membrana interna mitocondria',
    reaccion: 'NADH + FADH₂ → electrones → bombeo H⁺ → ATP sintasa → 32-34 ATP',
    descripcion: 'Los electrones de NADH y FADH₂ pasan por una serie de complejos proteicos que bombean H⁺ al espacio intermembrana. El gradiente impulsa la ATP sintasa como una turbina.',
    detalle: 'Aquí se consume el O₂ (aceptor final de electrones) y se produce el H₂O. La ATP sintasa gira literalmente como un motor a ~100 revoluciones/segundo. Genera el 90% de todo el ATP.',
    atp: 34,
    atpLabel: 'ATP (máximo)',
  },
];

// Pasos del ciclo de Krebs para diagrama circular
interface PasoKrebs {
  icono: string;
  nombre: string;
  detalle: string;
}

const PASOS_KREBS: PasoKrebs[] = [
  { icono: '🔗', nombre: 'Acetil-CoA', detalle: 'El piruvato pierde CO₂ y se une a CoA' },
  { icono: '🍋', nombre: 'Citrato', detalle: 'Acetil-CoA + oxalacetato → citrato (6C)' },
  { icono: '⬇️', nombre: 'Isocitrato', detalle: 'Reorganización molecular' },
  { icono: '💨', nombre: 'α-cetoglutarato', detalle: 'Se libera CO₂ + NADH' },
  { icono: '⚡', nombre: 'Succinil-CoA', detalle: 'Se libera CO₂ + NADH + GTP' },
  { icono: '♻️', nombre: 'Oxalacetato', detalle: 'Se regenera → cierra el ciclo + NADH + FADH₂' },
];

// Proteínas de la cadena de transporte
interface ProteinaCadena {
  icono: string;
  nombre: string;
  descripcion: string;
}

const PROTEINAS_CADENA: ProteinaCadena[] = [
  { icono: '🟦', nombre: 'Complejo I', descripcion: 'NADH → bombea H⁺' },
  { icono: '🟧', nombre: 'Complejo II', descripcion: 'FADH₂ → bombea H⁺' },
  { icono: '🟪', nombre: 'Complejo III', descripcion: 'Citocromo bc₁' },
  { icono: '🟩', nombre: 'Complejo IV', descripcion: 'O₂ → H₂O' },
  { icono: '⚙️', nombre: 'ATP sintasa', descripcion: 'H⁺ → ATP (turbina)' },
];

// ─────────────────────────────────────────────
// Datos — Sección 3: Mitocondria
// ─────────────────────────────────────────────

interface ParteMitocondria {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  dato: string;
}

const PARTES_MITOCONDRIA: ParteMitocondria[] = [
  {
    id: 'externa',
    icono: '🔵',
    nombre: 'Membrana externa',
    descripcion: 'Lisa y bastante permeable. Contiene porinas que permiten el paso de moléculas pequeñas y iones. Separa la mitocondria del citoplasma.',
    dato: 'Las porinas son canales proteicos que dejan pasar moléculas de hasta 5.000 daltons de peso.',
  },
  {
    id: 'interna',
    icono: '🟣',
    nombre: 'Membrana interna',
    descripcion: 'Muy plegada formando crestas para maximizar superficie. Aquí se encuentran los complejos de la cadena de transporte de electrones y la ATP sintasa. Es casi impermeable a iones.',
    dato: 'Las crestas pueden aumentar la superficie hasta 5 veces. Más crestas = más ATP. Las células del corazón tienen mitocondrias con crestas densísimas.',
  },
  {
    id: 'matriz',
    icono: '🟢',
    nombre: 'Matriz mitocondrial',
    descripcion: 'El líquido interior donde ocurre el ciclo de Krebs. Contiene enzimas, ADN mitocondrial circular, ribosomas propios y piruvato deshidrogenasa.',
    dato: 'La mitocondria tiene su propio ADN (ADNmt): 37 genes, herencia exclusivamente materna. Tu ADN mitocondrial viene solo de tu madre.',
  },
  {
    id: 'intermembrana',
    icono: '🟡',
    nombre: 'Espacio intermembrana',
    descripcion: 'Entre las dos membranas. Aquí se acumulan los iones H⁺ bombeados por la cadena de transporte, creando un gradiente electroquímico que impulsa la ATP sintasa.',
    dato: 'La diferencia de pH entre la matriz y el espacio intermembrana es de ~1,4 unidades: suficiente para generar la fuerza protón-motriz que produce ATP.',
  },
];

// ─────────────────────────────────────────────
// Datos — Sección 4: Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  cifra: string;
  etiqueta: string;
  detalle: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '⚡', cifra: '~65 kg', etiqueta: 'ATP producido al día', detalle: 'Tu cuerpo produce unos 65 kg de ATP diarios, pero lo recicla tan rápido que solo almacenas ~50 g en cada instante. Cada molécula de ATP se recicla unas 500-750 veces al día.' },
  { icono: '🫁', cifra: '~20.000', etiqueta: 'Respiraciones al día', detalle: 'Cada respiración trae O₂ a tus células para este proceso. En reposo, consumes unos 250 mL de O₂ por minuto. Haciendo ejercicio intenso, hasta 3 litros por minuto.' },
  { icono: '🔥', cifra: '2 vs 38', etiqueta: 'ATP sin vs con oxígeno', detalle: 'Sin oxígeno (fermentación) → solo 2 ATP por glucosa. Con oxígeno → hasta 38 ATP. Por eso te cansas corriendo un sprint: los músculos agotan el O₂ y pasan a fermentación.' },
  { icono: '🧬', cifra: '1.000-5.000', etiqueta: 'Mitocondrias por célula', detalle: 'Las células musculares y del corazón tienen más (hasta 5.000). Las neuronas también son ricas en mitocondrias. Los glóbulos rojos, curiosamente, no tienen ninguna.' },
  { icono: '🍺', cifra: '2 tipos', etiqueta: 'Fermentación alternativa', detalle: 'Sin O₂ hay dos opciones: fermentación láctica (músculos → ácido láctico → agujetas) y fermentación alcohólica (levaduras → etanol + CO₂ → cerveza, pan, vino).' },
  { icono: '💪', cifra: 'Ácido láctico', etiqueta: 'Se acumula sin O₂', detalle: 'Cuando corres un sprint, tus músculos cambian a fermentación y acumulan ácido láctico. La sensación de "quemazón" muscular viene de esa acidificación temporal.' },
  { icono: '🌡️', cifra: '~60%', etiqueta: 'De la energía es calor', detalle: 'Solo el ~40% de la energía de la glucosa se convierte en ATP. El resto se libera como calor. Por eso tu temperatura corporal es 37°C: eres una máquina térmica con patas.' },
];

// ─────────────────────────────────────────────
// Sección 1: El Proceso General
// ─────────────────────────────────────────────

function SeccionProceso() {
  const [componenteActivo, setComponenteActivo] = useState<string | null>(null);

  const componenteSeleccionado = [...COMPONENTES_ENTRADA, ...COMPONENTES_SALIDA].find(c => c.id === componenteActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La respiración celular transforma la <strong>energía química de la glucosa</strong> en ATP, la moneda energética que usan todas tus células. Es el proceso inverso a la fotosíntesis.</p>
      </div>

      {/* Ecuación general */}
      <div className={styles.ecuacionCard}>
        <h3 className={styles.ecuacionTitulo}>Ecuación general</h3>
        <div className={styles.ecuacion}>
          <span className={`${styles.ecuacionMol} ${styles.molGlucosa}`}>C₆H₁₂O₆</span>
          <span className={styles.ecuacionOp}>+</span>
          <span className={`${styles.ecuacionMol} ${styles.molO2}`}>6O₂</span>
          <span className={styles.ecuacionFlecha} aria-hidden="true">→</span>
          <span className={`${styles.ecuacionMol} ${styles.molCO2}`}>6CO₂</span>
          <span className={styles.ecuacionOp}>+</span>
          <span className={`${styles.ecuacionMol} ${styles.molAgua}`}>6H₂O</span>
          <span className={styles.ecuacionOp}>+</span>
          <span className={`${styles.ecuacionMol} ${styles.molATP}`}>36-38 ATP</span>
        </div>
      </div>

      {/* Diagrama general */}
      <div className={styles.diagramaContainer}>
        <h3 className={styles.diagramaTitulo}>Glucosa entra, energía sale</h3>
        <div className={styles.diagramaFlujo}>
          {/* Entradas */}
          <div className={styles.diagramaEntradas}>
            <span className={styles.diagramaGrupoLabel}>Entran</span>
            {COMPONENTES_ENTRADA.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.diagramaMolecula} ${styles[c.colorClass]} ${componenteActivo === c.id ? styles.diagramaMolActiva : ''}`}
                onClick={() => setComponenteActivo(componenteActivo === c.id ? null : c.id)}
                aria-pressed={componenteActivo === c.id}
                aria-label={`${c.nombre}: ${c.formula}`}
              >
                <span className={styles.diagramaMolIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.diagramaMolNombre}>{c.nombre}</span>
                <span className={styles.diagramaMolFormula}>{c.formula}</span>
              </button>
            ))}
          </div>

          {/* Flecha entrada */}
          <div className={styles.diagramaCentral}>
            <div className={styles.diagramaFlecha} aria-hidden="true">→</div>
          </div>

          {/* Mitocondria central */}
          <div className={styles.diagramaCentral}>
            <div className={styles.diagramaIcono} aria-hidden="true">🏭</div>
            <div className={styles.diagramaLabel}>Mitocondria</div>
          </div>

          {/* Flecha salida */}
          <div className={styles.diagramaCentral}>
            <div className={styles.diagramaFlecha} aria-hidden="true">→</div>
          </div>

          {/* Salidas */}
          <div className={styles.diagramaSalidas}>
            <span className={styles.diagramaGrupoLabel}>Salen</span>
            {COMPONENTES_SALIDA.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.diagramaMolecula} ${styles[c.colorClass]} ${componenteActivo === c.id ? styles.diagramaMolActiva : ''}`}
                onClick={() => setComponenteActivo(componenteActivo === c.id ? null : c.id)}
                aria-pressed={componenteActivo === c.id}
                aria-label={`${c.nombre}: ${c.formula}`}
              >
                <span className={styles.diagramaMolIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.diagramaMolNombre}>{c.nombre}</span>
                <span className={styles.diagramaMolFormula}>{c.formula}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detalle del componente seleccionado */}
      {componenteSeleccionado && (
        <div className={styles.componenteDetalle}>
          <div className={styles.componenteHeader}>
            <span aria-hidden="true" className={styles.componenteDetalleIcono}>{componenteSeleccionado.icono}</span>
            <h3 className={styles.componenteDetalleTitulo}>{componenteSeleccionado.nombre} ({componenteSeleccionado.formula})</h3>
          </div>
          <p className={styles.componenteDetalleDesc}>{componenteSeleccionado.descripcion}</p>
          <div className={styles.componenteDato}>
            <strong>Dato:</strong> {componenteSeleccionado.dato}
          </div>
        </div>
      )}

      {!componenteActivo && (
        <p className={styles.instruccion}>Pulsa en cualquier molécula para ver su papel en la respiración celular</p>
      )}

      {/* Comparativa con fotosíntesis */}
      <div className={styles.comparativaCard}>
        <h3 className={styles.comparativaTitulo}>Respiración celular vs Fotosíntesis</h3>
        <div className={styles.comparativaGrid}>
          <div className={styles.comparativaCol}>
            <span className={styles.comparativaColTitulo}><span aria-hidden="true">⚡</span> Respiración celular</span>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Consume</span>
              <span className={styles.comparativaValor}>Glucosa + O₂</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Produce</span>
              <span className={styles.comparativaValor}>CO₂ + H₂O + ATP</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Dónde</span>
              <span className={styles.comparativaValor}>Mitocondria</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Quién</span>
              <span className={styles.comparativaValor}>Todos los seres vivos</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Energía</span>
              <span className={styles.comparativaValor}>Libera (catabólico)</span>
            </div>
          </div>
          <div className={styles.comparativaCol}>
            <span className={styles.comparativaColTitulo}><span aria-hidden="true">🌿</span> Fotosíntesis</span>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Consume</span>
              <span className={styles.comparativaValor}>CO₂ + H₂O + luz</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Produce</span>
              <span className={styles.comparativaValor}>Glucosa + O₂</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Dónde</span>
              <span className={styles.comparativaValor}>Cloroplasto</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Quién</span>
              <span className={styles.comparativaValor}>Plantas, algas</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Energía</span>
              <span className={styles.comparativaValor}>Almacena (anabólico)</span>
            </div>
          </div>
        </div>
        <p className={styles.comparativaNota}>
          Son procesos inversos con la misma ecuación en direcciones opuestas. Las plantas hacen ambos: fotosíntesis de día y respiración celular siempre.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          La respiración celular es el <strong>espejo de la fotosíntesis</strong>: la misma ecuación química, pero al revés.
          Lo que la fotosíntesis construye con luz solar, la respiración celular lo desmonta para extraer energía.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Las 3 Fases
// ─────────────────────────────────────────────

function SeccionFases() {
  const [faseActiva, setFaseActiva] = useState<string>('glucolisis');
  const [pasoKrebsActivo, setPasoKrebsActivo] = useState<number | null>(null);

  const faseSeleccionada = FASES.find(f => f.id === faseActiva);

  // Posiciones del ciclo de Krebs (6 posiciones en círculo)
  const posicionesKrebs = [
    { top: '0%', left: '50%', transform: 'translateX(-50%)' },
    { top: '20%', right: '0%' },
    { bottom: '20%', right: '0%' },
    { bottom: '0%', left: '50%', transform: 'translateX(-50%)' },
    { bottom: '20%', left: '0%' },
    { top: '20%', left: '0%' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La respiración celular tiene <strong>3 fases secuenciales</strong>. La primera ocurre fuera de la mitocondria; las otras dos, dentro.</p>
      </div>

      {/* Selector de fase */}
      <nav className={styles.fasesNav} aria-label="Fases de la respiración celular">
        {FASES.map(f => (
          <button
            key={f.id}
            type="button"
            className={`${styles.faseBtn} ${faseActiva === f.id ? styles.faseBtnActivo : ''}`}
            onClick={() => { setFaseActiva(f.id); setPasoKrebsActivo(null); }}
            aria-pressed={faseActiva === f.id}
          >
            <span className={styles.faseBtnIcono} aria-hidden="true">{f.icono}</span>
            <span className={styles.faseBtnNombre}>{f.nombre}</span>
            <span className={styles.faseBtnLugar}>{f.lugar}</span>
          </button>
        ))}
      </nav>

      {/* Detalle de fase seleccionada */}
      {faseSeleccionada && (
        <div className={styles.faseDetalle}>
          <div className={styles.faseDetalleHeader}>
            <span aria-hidden="true" className={styles.faseDetalleIcono}>{faseSeleccionada.icono}</span>
            <div>
              <h3 className={styles.faseDetalleTitulo}>{faseSeleccionada.nombre}</h3>
              <span className={styles.faseDetalleLugar}>📍 {faseSeleccionada.lugar}</span>
            </div>
          </div>
          <div className={styles.faseDetalleReaccion}>{faseSeleccionada.reaccion}</div>
          <p className={styles.faseDetalleDesc}>{faseSeleccionada.descripcion}</p>
          <div className={styles.faseDetalleDato}>{faseSeleccionada.detalle}</div>
        </div>
      )}

      {/* Diagrama visual por fase */}
      {faseActiva === 'glucolisis' && (
        <div className={styles.faseDiagrama}>
          <h4 className={styles.faseDiagramaTitulo}>La glucosa se parte en dos</h4>
          <div className={styles.faseDiagramaVisual}>
            <div className={styles.faseDiagramaItem}>
              <span className={styles.faseDiagramaItemIcono} aria-hidden="true">🍬</span>
              <span className={styles.faseDiagramaItemLabel}>Glucosa</span>
              <span className={styles.faseDiagramaItemSub}>6 carbonos</span>
            </div>
            <span className={styles.faseDiagramaFlecha} aria-hidden="true">→</span>
            <div className={styles.faseDiagramaItem}>
              <span className={styles.faseDiagramaItemIcono} aria-hidden="true">✂️</span>
              <span className={styles.faseDiagramaItemLabel}>Se rompe</span>
              <span className={styles.faseDiagramaItemSub}>−2 ATP invertidos</span>
            </div>
            <span className={styles.faseDiagramaFlecha} aria-hidden="true">→</span>
            <div className={styles.faseDiagramaItem}>
              <span className={styles.faseDiagramaItemIcono} aria-hidden="true">🔸</span>
              <span className={styles.faseDiagramaItemLabel}>Piruvato</span>
              <span className={styles.faseDiagramaItemSub}>3C</span>
            </div>
            <span className={styles.faseDiagramaFlecha} aria-hidden="true">+</span>
            <div className={styles.faseDiagramaItem}>
              <span className={styles.faseDiagramaItemIcono} aria-hidden="true">🔸</span>
              <span className={styles.faseDiagramaItemLabel}>Piruvato</span>
              <span className={styles.faseDiagramaItemSub}>3C</span>
            </div>
            <span className={styles.faseDiagramaFlecha} aria-hidden="true">+</span>
            <div className={styles.faseDiagramaItem}>
              <span className={styles.faseDiagramaItemIcono} aria-hidden="true">🔋</span>
              <span className={styles.faseDiagramaItemLabel}>4 ATP</span>
              <span className={styles.faseDiagramaItemSub}>neto: 2</span>
            </div>
          </div>
        </div>
      )}

      {faseActiva === 'krebs' && (
        <div className={styles.cicloCard}>
          <h4 className={styles.cicloTitulo}>Ciclo de Krebs (2 vueltas por glucosa)</h4>
          <div className={styles.cicloCirculo}>
            {PASOS_KREBS.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.cicloPaso} ${pasoKrebsActivo === i ? styles.cicloPasoActivo : ''}`}
                onClick={() => setPasoKrebsActivo(pasoKrebsActivo === i ? null : i)}
                aria-pressed={pasoKrebsActivo === i}
                aria-label={`Paso ${i + 1}: ${p.nombre}`}
                style={posicionesKrebs[i] as React.CSSProperties}
              >
                <span className={styles.cicloPasoIcono} aria-hidden="true">{p.icono}</span>
                <span className={styles.cicloPasoNombre}>{p.nombre}</span>
              </button>
            ))}
            <div className={styles.cicloCentro}>
              <span className={styles.cicloCentroIcono} aria-hidden="true">🔄</span>
              <span className={styles.cicloCentroTexto}>Ciclo de<br />Krebs</span>
            </div>
            <div className={styles.cicloFlechas} aria-hidden="true">
              <div className={styles.cicloFlechaArc}>↻</div>
            </div>
          </div>
          {pasoKrebsActivo !== null && (
            <div className={styles.componenteDetalle}>
              <div className={styles.componenteHeader}>
                <span aria-hidden="true" className={styles.componenteDetalleIcono}>{PASOS_KREBS[pasoKrebsActivo].icono}</span>
                <h4 className={styles.componenteDetalleTitulo}>{PASOS_KREBS[pasoKrebsActivo].nombre}</h4>
              </div>
              <p className={styles.componenteDetalleDesc}>{PASOS_KREBS[pasoKrebsActivo].detalle}</p>
            </div>
          )}
          {pasoKrebsActivo === null && (
            <p className={styles.instruccion}>Pulsa en cada paso del ciclo para ver los detalles</p>
          )}
        </div>
      )}

      {faseActiva === 'cadena' && (
        <div className={styles.cadenaCard}>
          <h4 className={styles.cadenaTitulo}>Cadena de transporte de electrones</h4>
          <div className={styles.cadenaMembrana}>
            <div className={styles.cadenaMembranaLabel}>Membrana interna mitocondrial</div>
            <div className={styles.cadenaFlujo}>
              {PROTEINAS_CADENA.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div className={styles.cadenaProteina}>
                    <span className={styles.cadenaProteinaIcono} aria-hidden="true">{p.icono}</span>
                    <span className={styles.cadenaProteinaNombre}>{p.nombre}</span>
                    <span className={styles.cadenaProteinaDesc}>{p.descripcion}</span>
                  </div>
                  {i < PROTEINAS_CADENA.length - 1 && (
                    <span className={styles.cadenaFlechaHorizontal} aria-hidden="true">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className={styles.cadenaEspacioLabel}>Los H⁺ bombeados fluyen de vuelta por la ATP sintasa generando ATP</p>
          </div>
        </div>
      )}

      {/* Conteo ATP total */}
      <div className={styles.conteoATP}>
        <h3 className={styles.conteoTitulo}>Balance energético: ATP por glucosa</h3>
        <div className={styles.conteoGrid}>
          {FASES.map(f => (
            <div key={f.id} className={styles.conteoItem}>
              <span className={styles.conteoItemIcono} aria-hidden="true">{f.icono}</span>
              <span className={styles.conteoItemFase}>{f.nombre}</span>
              <span className={styles.conteoItemATP}>{f.atp}</span>
              <span className={styles.conteoItemLabel}>{f.atpLabel}</span>
            </div>
          ))}
        </div>
        <div className={styles.conteoTotal}>
          <span className={styles.conteoTotalCifra}>= 36-38 ATP</span>
          <span className={styles.conteoTotalLabel}>por cada molécula de glucosa (teórico máximo)</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El <strong>90% del ATP</strong> se produce en la cadena de transporte de electrones.
          La glucólisis y el ciclo de Krebs son &quot;preparación&quot;: generan los NADH y FADH₂ que alimentan la cadena.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: La Mitocondria
// ─────────────────────────────────────────────

function SeccionMitocondria() {
  const [parteActiva, setParteActiva] = useState<string | null>(null);

  const parteSeleccionada = PARTES_MITOCONDRIA.find(p => p.id === parteActiva);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La mitocondria es la <strong>central energética de la célula</strong>. Su estructura de doble membrana es clave para producir ATP.</p>
      </div>

      {/* Diagrama de la mitocondria */}
      <div className={styles.mitocondriaContainer}>
        <h3 className={styles.mitocondriaTitulo}>Anatomía de la mitocondria</h3>
        <div className={styles.mitocondriaDiagrama}>
          <div className={styles.mitocondriaOuter}>
            <div className={styles.mitocondriaOuterLabel}>Membrana externa (lisa)</div>
            <div className={styles.mitocondriaInner}>
              <div className={styles.mitocondriaInnerLabel}>Membrana interna (plegada)</div>
              <div className={styles.mitocondriaCrestas}>
                <div className={styles.mitocondriaCresta}><span className={styles.mitocondriaCrestaTxt}>Cresta — Cadena de transporte</span></div>
                <div className={styles.mitocondriaCresta}><span className={styles.mitocondriaCrestaTxt}>Cresta — ATP sintasa</span></div>
                <div className={styles.mitocondriaCresta}><span className={styles.mitocondriaCrestaTxt}>Cresta — Complejos I-IV</span></div>
              </div>
              <div className={styles.mitocondriaMatrizInfo}>
                <span className={styles.mitocondriaMatrizInfoIcono} aria-hidden="true">🔄</span>
                <span>Matriz: Ciclo de Krebs + ADN mitocondrial</span>
              </div>
            </div>
            <div className={styles.mitocondriaEspacioInfo}>
              <span className={styles.mitocondriaMatrizInfoIcono} aria-hidden="true">🟡</span>
              <span>Espacio intermembrana: acumula H⁺</span>
            </div>
          </div>
        </div>

        {/* Partes clickables */}
        <div className={styles.mitocondriaPartes}>
          {PARTES_MITOCONDRIA.map(p => (
            <button
              key={p.id}
              type="button"
              className={`${styles.mitocondriaParte} ${parteActiva === p.id ? styles.mitocondriaParteActiva : ''}`}
              onClick={() => setParteActiva(parteActiva === p.id ? null : p.id)}
              aria-pressed={parteActiva === p.id}
              aria-label={p.nombre}
            >
              <span className={styles.mitocondriaParteIcono} aria-hidden="true">{p.icono}</span>
              <span className={styles.mitocondriaParteNombre}>{p.nombre}</span>
            </button>
          ))}
        </div>

        {/* Detalle de parte */}
        {parteSeleccionada && (
          <div className={styles.mitocondriaDetalle}>
            <div className={styles.mitocondriaDetalleHeader}>
              <span aria-hidden="true" className={styles.mitocondriaDetalleIcono}>{parteSeleccionada.icono}</span>
              <h3 className={styles.mitocondriaDetalleTitulo}>{parteSeleccionada.nombre}</h3>
            </div>
            <p className={styles.mitocondriaDetalleDesc}>{parteSeleccionada.descripcion}</p>
            <div className={styles.mitocondriaDetalleDato}>
              <strong>Dato:</strong> {parteSeleccionada.dato}
            </div>
          </div>
        )}

        {!parteActiva && (
          <p className={styles.instruccion}>Pulsa en cada parte de la mitocondria para explorarla</p>
        )}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Las mitocondrias fueron bacterias libres hace 2.000 millones de años.</strong> Una célula primitiva
          las engulló y establecieron una simbiosis: la bacteria proporcionaba energía eficiente y la célula le daba
          protección y alimento. Esto se llama <em>endosimbiosis</em> — y por eso conservan su propio ADN.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Las mitocondrias tienen su propio ADN</strong> — circular, como el de las bacterias. Se hereda
          exclusivamente por vía materna: tu ADN mitocondrial es idéntico al de tu madre, tu abuela materna
          y así sucesivamente. Los científicos lo usan para rastrear linajes maternos hasta la &quot;Eva mitocondrial&quot;
          (hace ~200.000 años en África).
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  const [datoActivo, setDatoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La respiración celular es un proceso invisible pero <strong>espectacular en números</strong>. Estas cifras dan perspectiva.</p>
      </div>

      {/* Grid de datos */}
      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.datoCard} ${datoActivo === i ? styles.datoCardActivo : ''}`}
            onClick={() => setDatoActivo(datoActivo === i ? null : i)}
            aria-expanded={datoActivo === i}
          >
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <span className={styles.datoCifra}>{d.cifra}</span>
            <span className={styles.datoEtiqueta}>{d.etiqueta}</span>
            {datoActivo === i && (
              <span className={styles.datoDetalle}>{d.detalle}</span>
            )}
          </button>
        ))}
      </div>

      {/* Comparativa final: fotosíntesis vs respiración */}
      <div className={styles.tablaComparativa}>
        <h3 className={styles.tablaTitulo}>Fotosíntesis vs Respiración celular</h3>
        <div className={styles.tablaGrid}>
          <div className={`${styles.tablaHeader} ${styles.tablaCeldaLabel}`}>Aspecto</div>
          <div className={styles.tablaHeader}><span aria-hidden="true">🌿</span> Fotosíntesis</div>
          <div className={styles.tablaHeader}><span aria-hidden="true">⚡</span> Respiración</div>

          <div className={`${styles.tablaCelda} ${styles.tablaCeldaLabel}`}>Reactivos</div>
          <div className={styles.tablaCelda}>CO₂ + H₂O + luz</div>
          <div className={styles.tablaCelda}>C₆H₁₂O₆ + O₂</div>

          <div className={`${styles.tablaCelda} ${styles.tablaCeldaLabel}`}>Productos</div>
          <div className={styles.tablaCelda}>C₆H₁₂O₆ + O₂</div>
          <div className={styles.tablaCelda}>CO₂ + H₂O + ATP</div>

          <div className={`${styles.tablaCelda} ${styles.tablaCeldaLabel}`}>Orgánulo</div>
          <div className={styles.tablaCelda}>Cloroplasto</div>
          <div className={styles.tablaCelda}>Mitocondria</div>

          <div className={`${styles.tablaCelda} ${styles.tablaCeldaLabel}`}>Energía</div>
          <div className={styles.tablaCelda}>Se almacena</div>
          <div className={styles.tablaCelda}>Se libera</div>

          <div className={`${styles.tablaCelda} ${styles.tablaCeldaLabel}`}>Cuándo</div>
          <div className={styles.tablaCelda}>Con luz</div>
          <div className={styles.tablaCelda}>Siempre (24h)</div>

          <div className={`${styles.tablaCelda} ${styles.tablaCeldaLabel}`}>Organismos</div>
          <div className={styles.tablaCelda}>Plantas, algas</div>
          <div className={styles.tablaCelda}>Todos los eucariotas</div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Ambos procesos forman un <strong>ciclo perfecto</strong>: lo que uno produce, el otro lo consume.
          Las plantas hacen ambos: fotosíntesis de día para fabricar glucosa, y respiración celular siempre
          para obtener energía. Los animales solo hacemos respiración — dependemos de las plantas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorRespiracionCelularPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('proceso');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'proceso': return <SeccionProceso />;
      case 'fases': return <SeccionFases />;
      case 'mitocondria': return <SeccionMitocondria />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>La Respiración Celular</h1>
          <p className={styles.subtitle}>La central energética de tus células: de la glucosa al ATP</p>
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
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre la respiración celular"
          subtitle="Conceptos clave de bioquímica y metabolismo"
          defaultOpen={false}
        >
          <h3>¿Qué es la respiración celular?</h3>
          <p>
            La respiración celular es el conjunto de reacciones bioquímicas por las cuales las células
            descomponen moléculas orgánicas (principalmente glucosa) para obtener energía en forma de ATP.
            Es un proceso aeróbico (requiere oxígeno) que ocurre en la mitocondria de todas las células
            eucariotas, desde levaduras hasta neuronas humanas.
          </p>

          <h3>¿Qué pasa sin oxígeno?</h3>
          <p>
            Sin oxígeno, las células recurren a la <strong>fermentación</strong>: solo realizan la glucólisis
            (2 ATP) y regeneran NAD⁺ sin cadena de transporte. En los músculos humanos se produce fermentación
            láctica (ácido láctico). En las levaduras, fermentación alcohólica (etanol + CO₂), base de la
            cerveza, el vino y el pan.
          </p>

          <h3>¿Por qué la mitocondria tiene doble membrana?</h3>
          <p>
            Según la teoría endosimbiótica de Lynn Margulis, las mitocondrias derivan de bacterias aeróbicas
            que fueron engullidas por células primitivas hace ~2.000 millones de años. La membrana externa
            corresponde a la vacuola de la célula huésped; la interna, a la membrana original de la bacteria.
            Esta doble membrana es esencial para crear el gradiente de H⁺ que impulsa la síntesis de ATP.
          </p>

          <h3>ATP: la moneda energética universal</h3>
          <p>
            El ATP (adenosín trifosfato) es la molécula que todas las células usan para transferir energía.
            Cuando se rompe el enlace del tercer grupo fosfato (ATP → ADP + Pi), se liberan ~7,3 kcal/mol
            que la célula usa para contracción muscular, transporte de iones, síntesis de proteínas y
            prácticamente todas las funciones celulares.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador presenta una visión simplificada de la respiración celular
            con fines educativos. Los rendimientos de ATP son teóricos máximos (el rendimiento real es algo
            menor debido a fugas de protones y costes de transporte). La bioquímica real incluye pasos
            intermedios adicionales y regulación enzimática compleja.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-respiracion-celular')} />
        <ShareCard appName="visualizador-respiracion-celular" />
        <Footer appName="visualizador-respiracion-celular" />
    </div>
  );
}
