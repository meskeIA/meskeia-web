'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Fotosintesis.module.css';
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

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'proceso' | 'luminosa' | 'calvin' | 'escala';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'proceso', titulo: 'El Proceso', icono: '🌿', subtitulo: 'De la luz solar a la glucosa' },
  { id: 'luminosa', titulo: 'Fase Luminosa', icono: '☀️', subtitulo: 'Energía del sol a ATP y NADPH' },
  { id: 'calvin', titulo: 'Ciclo de Calvin', icono: '🔄', subtitulo: 'CO₂ se convierte en glucosa' },
  { id: 'escala', titulo: 'Escala y Datos', icono: '🌍', subtitulo: 'Cifras que impresionan' },
];

// ─────────────────────────────────────────────
// Datos
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
    id: 'luz',
    icono: '☀️',
    nombre: 'Luz solar',
    formula: 'Fotones',
    colorClass: 'molLuz',
    descripcion: 'La energía electromagnética del sol es capturada por la clorofila en los cloroplastos. Solo se usa la luz roja (~680 nm) y azul (~430 nm).',
    dato: 'Un fotón tarda 8 minutos y 20 segundos en llegar del Sol a una hoja.',
  },
  {
    id: 'co2',
    icono: '💨',
    nombre: 'Dióxido de carbono',
    formula: '6CO₂',
    colorClass: 'molCO2',
    descripcion: 'El CO₂ entra por los estomas, pequeños poros en el envés de las hojas. La planta lo usa como fuente de carbono para construir glucosa.',
    dato: 'El aire contiene solo un 0,04% de CO₂, pero las plantas lo capturan con gran eficiencia.',
  },
  {
    id: 'agua',
    icono: '💧',
    nombre: 'Agua',
    formula: '6H₂O',
    colorClass: 'molAgua',
    descripcion: 'El agua sube desde las raíces por el xilema hasta las hojas. En la fotólisis se rompe para liberar oxígeno, electrones e iones H⁺.',
    dato: 'Un árbol grande puede absorber más de 200 litros de agua al día.',
  },
];

const COMPONENTES_SALIDA: Componente[] = [
  {
    id: 'glucosa',
    icono: '🍬',
    nombre: 'Glucosa',
    formula: 'C₆H₁₂O₆',
    colorClass: 'molGlucosa',
    descripcion: 'La molécula de azúcar de 6 carbonos es el producto final. La planta la usa como combustible (respiración celular) o la convierte en almidón y celulosa.',
    dato: 'Un árbol adulto puede producir ~50 kg de glucosa al día en condiciones óptimas.',
  },
  {
    id: 'o2',
    icono: '🫧',
    nombre: 'Oxígeno',
    formula: '6O₂',
    colorClass: 'molO2',
    descripcion: 'El oxígeno es un subproducto de la fotólisis del agua. Sale por los estomas y es esencial para la respiración de casi todos los seres vivos.',
    dato: 'Un árbol adulto produce unos 100 kg de O₂ al año — suficiente para 2 personas.',
  },
];

interface PasoLuminoso {
  icono: string;
  titulo: string;
  descripcion: string;
  detalle: string;
  colorClass: string;
}

const PASOS_LUMINOSA: PasoLuminoso[] = [
  {
    icono: '💡',
    titulo: '1. Captación de luz',
    descripcion: 'Los fotones golpean la clorofila en el fotosistema II (PSII). La clorofila absorbe luz roja y azul, reflejando la verde (por eso las hojas son verdes).',
    detalle: 'La clorofila a absorbe a 680 nm (PSII) y 700 nm (PSI). Existen clorofilas a, b y pigmentos accesorios como carotenoides.',
    colorClass: 'pasoLuz',
  },
  {
    icono: '⚡',
    titulo: '2. Excitación de electrones',
    descripcion: 'La energía del fotón excita un electrón de la clorofila, que salta a un nivel energético superior y es capturado por un aceptor de electrones.',
    detalle: 'El electrón pasa del estado fundamental al excitado. Si no es capturado rápidamente, vuelve a caer emitiendo fluorescencia.',
    colorClass: 'pasoElectron',
  },
  {
    icono: '💧',
    titulo: '3. Fotólisis del agua',
    descripcion: 'Para reponer el electrón perdido, el PSII rompe moléculas de agua: H₂O → ½O₂ + 2H⁺ + 2e⁻. Aquí se libera el oxígeno que respiras.',
    detalle: 'Este proceso requiere un clúster de manganeso (Mn₄CaO₅) llamado "centro de evolución de oxígeno". Es la única fuente biológica de O₂.',
    colorClass: 'pasoAgua',
  },
  {
    icono: '🔗',
    titulo: '4. Cadena de transporte',
    descripcion: 'Los electrones viajan por una cadena de proteínas (plastoquinona → citocromo b6f → plastocianina → PSI). En cada paso liberan energía que bombea H⁺.',
    detalle: 'El gradiente de H⁺ generado a través de la membrana tilacoidal es la fuerza que impulsa la síntesis de ATP.',
    colorClass: 'pasoCadena',
  },
  {
    icono: '🔋',
    titulo: '5. Producción de ATP',
    descripcion: 'La ATP sintasa usa el gradiente de H⁺ como una turbina molecular: los protones fluyen a través de ella y la energía genera ATP a partir de ADP + Pi.',
    detalle: 'La ATP sintasa gira literalmente como un motor rotatorio a ~100 revoluciones por segundo, produciendo ~3 ATP por vuelta.',
    colorClass: 'pasoATP',
  },
  {
    icono: '🧪',
    titulo: '6. Producción de NADPH',
    descripcion: 'En el PSI, los electrones reciben un segundo impulso de luz y se combinan con NADP⁺ + H⁺ para formar NADPH, el poder reductor para el ciclo de Calvin.',
    detalle: 'NADPH es la "moneda de poder reductor": dona electrones e hidrógenos para reducir el CO₂ a glucosa.',
    colorClass: 'pasoNADPH',
  },
];

interface FaseCalvin {
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  detalle: string;
  colorClass: string;
}

const FASES_CALVIN: FaseCalvin[] = [
  {
    icono: '🎯',
    titulo: 'Fijación',
    subtitulo: 'CO₂ + RuBP → 2×3-PGA',
    descripcion: 'La enzima RuBisCO fija el CO₂ atmosférico uniéndolo a una molécula de 5 carbonos (RuBP). El resultado se rompe en dos moléculas de 3 carbonos (3-PGA).',
    detalle: 'RuBisCO es la enzima más abundante del planeta: ~700 millones de toneladas. Es relativamente lenta (~3 reacciones/segundo vs miles en otras enzimas).',
    colorClass: 'faseFijacion',
  },
  {
    icono: '⬇️',
    titulo: 'Reducción',
    subtitulo: '3-PGA + ATP + NADPH → G3P',
    descripcion: 'Las moléculas de 3-PGA se reducen usando ATP y NADPH (de la fase luminosa) para formar G3P (gliceraldehído-3-fosfato), un azúcar de 3 carbonos.',
    detalle: 'Por cada 3 CO₂ fijados se producen 6 G3P, pero solo 1 sale del ciclo. Los otros 5 se reciclan para regenerar RuBP.',
    colorClass: 'faseReduccion',
  },
  {
    icono: '♻️',
    titulo: 'Regeneración',
    subtitulo: '5 G3P + ATP → 3 RuBP',
    descripcion: 'Los 5 G3P restantes se reorganizan usando ATP adicional para regenerar 3 moléculas de RuBP, cerrando el ciclo y permitiendo que continúe.',
    detalle: 'Se necesitan 3 vueltas completas del ciclo (fijando 3 CO₂) para producir 1 molécula neta de G3P. Para 1 glucosa: 6 vueltas.',
    colorClass: 'faseRegeneracion',
  },
];

interface DatoEscala {
  icono: string;
  cifra: string;
  etiqueta: string;
  detalle: string;
}

const DATOS_ESCALA: DatoEscala[] = [
  { icono: '🌳', cifra: '~100 kg', etiqueta: 'O₂ producido por un árbol adulto al año', detalle: 'Suficiente para que respiren 2 personas durante todo un año. Un bosque maduro es un pulmón planetario.' },
  { icono: '🌍', cifra: '300.000 Mt', etiqueta: 'Toneladas de O₂ generadas al año por fotosíntesis', detalle: 'La fotosíntesis es la única fuente significativa de O₂ atmosférico. Sin ella, el oxígeno desaparecería en unos miles de años.' },
  { icono: '🍃', cifra: '500.000', etiqueta: 'Cloroplastos por mm² de hoja', detalle: 'Cada cloroplasto contiene cientos de tilacoides apilados en grana. Una sola hoja tiene millones de "fábricas" de fotosíntesis.' },
  { icono: '🌊', cifra: '50-80%', etiqueta: 'Del O₂ atmosférico viene del fitoplancton', detalle: 'Las cianobacterias y algas marinas producen más oxígeno que todos los bosques juntos. El océano es el verdadero pulmón del planeta.' },
  { icono: '⏱️', cifra: '8 min vs fs', etiqueta: 'Fotón: 8 min del Sol a la hoja, reacción en femtosegundos', detalle: 'Un fotón recorre 150 millones de km en 8 minutos y 20 segundos. La excitación del electrón ocurre en femtosegundos (10⁻¹⁵ s).' },
  { icono: '🧮', cifra: '~2,5 kg', etiqueta: 'De CO₂ se necesitan para 1 kg de glucosa', detalle: 'La ecuación estequiométrica: 6×44 g de CO₂ → 180 g de glucosa. Relación: 264 g CO₂ por 180 g glucosa ≈ 1,47 kg/kg (más pérdidas).' },
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
        <p>La fotosíntesis transforma <strong>energía luminosa</strong> en energía química. Es el proceso que alimenta casi toda la vida en la Tierra.</p>
      </div>

      {/* Ecuación general */}
      <div className={styles.ecuacionCard}>
        <h3 className={styles.ecuacionTitulo}>Ecuación general</h3>
        <div className={styles.ecuacion}>
          <span className={`${styles.ecuacionMol} ${styles.molCO2}`}>6CO₂</span>
          <span className={styles.ecuacionOp}>+</span>
          <span className={`${styles.ecuacionMol} ${styles.molAgua}`}>6H₂O</span>
          <span className={styles.ecuacionOp}>+</span>
          <span className={`${styles.ecuacionMol} ${styles.molLuz}`}>luz</span>
          <span className={styles.ecuacionFlecha} aria-hidden="true">→</span>
          <span className={`${styles.ecuacionMol} ${styles.molGlucosa}`}>C₆H₁₂O₆</span>
          <span className={styles.ecuacionOp}>+</span>
          <span className={`${styles.ecuacionMol} ${styles.molO2}`}>6O₂</span>
        </div>
      </div>

      {/* Diagrama de hoja */}
      <div className={styles.hojaContainer}>
        <h3 className={styles.hojaTitulo}>La hoja: fábrica de vida</h3>
        <div className={styles.hojaDiagrama}>
          {/* Entradas */}
          <div className={styles.hojaEntradas}>
            <span className={styles.hojaGrupoLabel}>Entran</span>
            {COMPONENTES_ENTRADA.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.hojaMolecula} ${styles[c.colorClass]} ${componenteActivo === c.id ? styles.hojaMolActiva : ''}`}
                onClick={() => setComponenteActivo(componenteActivo === c.id ? null : c.id)}
                aria-pressed={componenteActivo === c.id}
                aria-label={`${c.nombre}: ${c.formula}`}
              >
                <span className={styles.hojaMolIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.hojaMolNombre}>{c.nombre}</span>
                <span className={styles.hojaMolFormula}>{c.formula}</span>
              </button>
            ))}
          </div>

          {/* Hoja central */}
          <div className={styles.hojaCentral}>
            <div className={styles.hojaFlechaEntrada} aria-hidden="true">→</div>
            <div className={styles.hojaIcono} aria-hidden="true">🍃</div>
            <div className={styles.hojaLabel}>Fotosíntesis</div>
            <div className={styles.hojaFlechaSalida} aria-hidden="true">→</div>
          </div>

          {/* Salidas */}
          <div className={styles.hojaSalidas}>
            <span className={styles.hojaGrupoLabel}>Salen</span>
            {COMPONENTES_SALIDA.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.hojaMolecula} ${styles[c.colorClass]} ${componenteActivo === c.id ? styles.hojaMolActiva : ''}`}
                onClick={() => setComponenteActivo(componenteActivo === c.id ? null : c.id)}
                aria-pressed={componenteActivo === c.id}
                aria-label={`${c.nombre}: ${c.formula}`}
              >
                <span className={styles.hojaMolIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.hojaMolNombre}>{c.nombre}</span>
                <span className={styles.hojaMolFormula}>{c.formula}</span>
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
        <p className={styles.instruccion}>Pulsa en cualquier molécula para ver su papel en la fotosíntesis</p>
      )}

      <div className={styles.insight}>
        <p>
          La fotosíntesis es la base de <strong>casi toda la vida en la Tierra</strong>. Sin ella,
          no habría oxígeno para respirar ni alimentos para comer. Todo comienza con un fotón de luz solar.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Fase Luminosa
// ─────────────────────────────────────────────

function SeccionLuminosa() {
  const [pasoActivo, setPasoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Ocurre en los <strong>tilacoides</strong> del cloroplasto. La energía de la luz se convierte en ATP y NADPH, la &quot;moneda energética&quot; de la célula.</p>
      </div>

      {/* Diagrama del cloroplasto */}
      <div className={styles.cloroplastoCard}>
        <h3 className={styles.cloroplastoTitulo}>Dentro del cloroplasto</h3>
        <div className={styles.cloroplastoDiagrama}>
          <div className={styles.cloroplastoOuter}>
            <div className={styles.cloroplastoLabel}>Membrana externa</div>
            <div className={styles.cloroplastoInner}>
              <div className={styles.estromaLabel}>Estroma</div>
              <div className={styles.tilacoidesStack}>
                <div className={styles.tilacoide}><span className={styles.tilacoideTxt}>Tilacoide</span></div>
                <div className={styles.tilacoide}><span className={styles.tilacoideTxt}>Tilacoide</span></div>
                <div className={styles.tilacoide}><span className={styles.tilacoideTxt}>Tilacoide</span></div>
              </div>
              <div className={styles.tilacoidesInfo}>
                <span className={styles.tilacoidesInfoIcono} aria-hidden="true">☀️</span>
                <span>Fase luminosa → aquí dentro</span>
              </div>
              <div className={styles.estromaInfo}>
                <span className={styles.estromaInfoIcono} aria-hidden="true">🔄</span>
                <span>Ciclo de Calvin → en el estroma</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flujo de energía paso a paso */}
      <h3 className={styles.subSeccionTitulo}>Flujo de energía paso a paso</h3>
      <div className={styles.pasosContainer}>
        {PASOS_LUMINOSA.map((p, i) => (
          <div key={i} className={styles.pasoWrapper}>
            <button
              type="button"
              className={`${styles.pasoCard} ${styles[p.colorClass]} ${pasoActivo === i ? styles.pasoActivo : ''}`}
              onClick={() => setPasoActivo(pasoActivo === i ? null : i)}
              aria-expanded={pasoActivo === i}
            >
              <div className={styles.pasoHeader}>
                <span className={styles.pasoIcono} aria-hidden="true">{p.icono}</span>
                <span className={styles.pasoTitulo}>{p.titulo}</span>
              </div>
              <p className={styles.pasoDesc}>{p.descripcion}</p>
              {pasoActivo === i && (
                <div className={styles.pasoDetalle}>
                  {p.detalle}
                </div>
              )}
            </button>
            {i < PASOS_LUMINOSA.length - 1 && (
              <div className={styles.pasoFlecha} aria-hidden="true">
                <div className={styles.flechaAnimada}>↓</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen de productos */}
      <div className={styles.productosCard}>
        <h3 className={styles.productosTitulo}>Productos de la fase luminosa</h3>
        <div className={styles.productosGrid}>
          <div className={styles.productoItem}>
            <span className={styles.productoItemIcono} aria-hidden="true">🔋</span>
            <span className={styles.productoItemNombre}>ATP</span>
            <span className={styles.productoItemDesc}>Energía química</span>
          </div>
          <div className={styles.productoItemFlecha} aria-hidden="true">+</div>
          <div className={styles.productoItem}>
            <span className={styles.productoItemIcono} aria-hidden="true">🧪</span>
            <span className={styles.productoItemNombre}>NADPH</span>
            <span className={styles.productoItemDesc}>Poder reductor</span>
          </div>
          <div className={styles.productoItemFlecha} aria-hidden="true">+</div>
          <div className={styles.productoItem}>
            <span className={styles.productoItemIcono} aria-hidden="true">🫧</span>
            <span className={styles.productoItemNombre}>O₂</span>
            <span className={styles.productoItemDesc}>Subproducto vital</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El O₂ que respiras <strong>viene de romper moléculas de agua</strong>, no del CO₂.
          La fotólisis del agua fue el gran invento evolutivo que transformó la atmósfera terrestre hace 2.400 millones de años.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Ciclo de Calvin
// ─────────────────────────────────────────────

function SeccionCalvin() {
  const [faseActiva, setFaseActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Ocurre en el <strong>estroma</strong> del cloroplasto. Usa el ATP y NADPH de la fase luminosa para convertir CO₂ en glucosa.</p>
      </div>

      {/* Diagrama circular del ciclo */}
      <div className={styles.cicloCard}>
        <h3 className={styles.cicloTitulo}>El ciclo en 3 fases</h3>
        <div className={styles.cicloContainer}>
          <div className={styles.cicloCirculo}>
            {FASES_CALVIN.map((f, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.cicloFase} ${styles[f.colorClass]} ${faseActiva === i ? styles.cicloFaseActiva : ''}`}
                onClick={() => setFaseActiva(faseActiva === i ? null : i)}
                aria-pressed={faseActiva === i}
                aria-label={`Fase ${i + 1}: ${f.titulo}`}
                style={{ '--fase-index': i } as React.CSSProperties}
              >
                <span className={styles.cicloFaseIcono} aria-hidden="true">{f.icono}</span>
                <span className={styles.cicloFaseNombre}>{f.titulo}</span>
              </button>
            ))}
            <div className={styles.cicloCentro}>
              <span className={styles.cicloCentroIcono} aria-hidden="true">🔄</span>
              <span className={styles.cicloCentroTexto}>Ciclo de Calvin</span>
            </div>
            <div className={styles.cicloFlechas} aria-hidden="true">
              <div className={styles.cicloFlechaArc}>↻</div>
            </div>
          </div>

          {/* Entradas y salidas del ciclo */}
          <div className={styles.cicloIO}>
            <div className={styles.cicloEntrada}>
              <span className={styles.cicloIOLabel}>Entra:</span>
              <span className={`${styles.cicloIOItem} ${styles.molCO2}`}>CO₂</span>
              <span className={`${styles.cicloIOItem} ${styles.molATP}`}>ATP</span>
              <span className={`${styles.cicloIOItem} ${styles.molNADPH}`}>NADPH</span>
            </div>
            <div className={styles.cicloSalida}>
              <span className={styles.cicloIOLabel}>Sale:</span>
              <span className={`${styles.cicloIOItem} ${styles.molGlucosa}`}>G3P → Glucosa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle de fase seleccionada */}
      {faseActiva !== null && (
        <div className={styles.faseDetalle}>
          <div className={styles.faseDetalleHeader}>
            <span aria-hidden="true" className={styles.faseDetalleIcono}>{FASES_CALVIN[faseActiva].icono}</span>
            <div>
              <h3 className={styles.faseDetalleTitulo}>{FASES_CALVIN[faseActiva].titulo}</h3>
              <span className={styles.faseDetalleSubtitulo}>{FASES_CALVIN[faseActiva].subtitulo}</span>
            </div>
          </div>
          <p className={styles.faseDetalleDesc}>{FASES_CALVIN[faseActiva].descripcion}</p>
          <div className={styles.faseDetalleDato}>
            {FASES_CALVIN[faseActiva].detalle}
          </div>
        </div>
      )}

      {faseActiva === null && (
        <p className={styles.instruccion}>Pulsa en cada fase del ciclo para ver los detalles</p>
      )}

      {/* Conteo visual: 3 vueltas = 1 glucosa */}
      <div className={styles.vueltasCard}>
        <h3 className={styles.vueltasTitulo}>¿Cuántas vueltas para una glucosa?</h3>
        <div className={styles.vueltasVisual}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className={styles.vueltaItem}>
              <span className={styles.vueltaIcono} aria-hidden="true">🔄</span>
              <span className={styles.vueltaNum}>Vuelta {n}</span>
              <span className={styles.vueltaCO2}>+1 CO₂</span>
            </div>
          ))}
        </div>
        <div className={styles.vueltasResultado}>
          <span className={styles.vueltasIgual} aria-hidden="true">=</span>
          <span className={styles.vueltasGlucosa}>
            <span aria-hidden="true">🍬</span> 1 molécula de glucosa (C₆H₁₂O₆)
          </span>
        </div>
        <p className={styles.vueltasNota}>
          Cada vuelta fija 1 CO₂ y produce 1 G3P neto. Se necesitan 6 vueltas (6 CO₂) para ensamblar 1 glucosa de 6 carbonos.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>RuBisCO es la enzima más abundante del planeta</strong> — unas 700 millones de toneladas.
          A pesar de su importancia, es lenta: solo fija 3 moléculas de CO₂ por segundo (otras enzimas procesan miles).
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Escala y Datos
// ─────────────────────────────────────────────

function SeccionEscala() {
  const [datoActivo, setDatoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La fotosíntesis opera a una escala difícil de imaginar. Estos datos ayudan a <strong>dimensionar su impacto</strong>.</p>
      </div>

      {/* Grid de datos */}
      <div className={styles.datosGrid}>
        {DATOS_ESCALA.map((d, i) => (
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

      {/* Árboles por persona */}
      <div className={styles.arbolesCard}>
        <h3 className={styles.arbolesTitulo}>¿Cuántos árboles necesitas?</h3>
        <div className={styles.arbolesVisual}>
          <div className={styles.arbolesIconos} aria-hidden="true">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <span key={n} className={styles.arbolIcono}>🌳</span>
            ))}
          </div>
          <div className={styles.arbolesTexto}>
            <span className={styles.arbolesCifra}>7-8 árboles</span>
            <span className={styles.arbolesDesc}>absorben el CO₂ que genera 1 persona al año (~{formatNumber(4400, 0)} kg CO₂)</span>
          </div>
        </div>
        <p className={styles.arbolesNota}>
          Una persona emite unas {formatNumber(4.4, 1)} toneladas de CO₂ al año (media española).
          Cada árbol adulto absorbe ~{formatNumber(22, 0)} kg de CO₂ al año y libera ~{formatNumber(100, 0)} kg de O₂.
        </p>
      </div>

      {/* Comparativa eficiencia */}
      <div className={styles.comparativaCard}>
        <h3 className={styles.comparativaTitulo}>Fotosíntesis vs Panel solar</h3>
        <div className={styles.comparativaGrid}>
          <div className={styles.comparativaCol}>
            <span className={styles.comparativaColTitulo}><span aria-hidden="true">🍃</span> Fotosíntesis</span>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Eficiencia</span>
              <span className={styles.comparativaValor}>1-2%</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Se repara sola</span>
              <span className={styles.comparativaValor}>Sí</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Se reproduce</span>
              <span className={styles.comparativaValor}>Sí</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Produce O₂</span>
              <span className={styles.comparativaValor}>Sí</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Antigüedad</span>
              <span className={styles.comparativaValor}>3.500 M años</span>
            </div>
          </div>
          <div className={styles.comparativaCol}>
            <span className={styles.comparativaColTitulo}><span aria-hidden="true">⚡</span> Panel solar</span>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Eficiencia</span>
              <span className={styles.comparativaValor} style={{ color: '#27ae60' }}>~20%</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Se repara solo</span>
              <span className={styles.comparativaValor}>No</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Se reproduce</span>
              <span className={styles.comparativaValor}>No</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Produce O₂</span>
              <span className={styles.comparativaValor}>No</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Antigüedad</span>
              <span className={styles.comparativaValor}>~70 años</span>
            </div>
          </div>
        </div>
        <p className={styles.comparativaNota}>
          El panel solar es ~10× más eficiente convirtiendo luz en energía, pero la fotosíntesis
          se autorrepara, se reproduce, captura CO₂ y produce O₂. La naturaleza lleva 3.500 millones de años de ventaja.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          El <strong>fitoplancton produce entre el 50% y el 80% del oxígeno atmosférico</strong>.
          Los bosques son importantes, pero el verdadero pulmón del planeta está en el océano.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFotosintesisPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('proceso');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'proceso': return <SeccionProceso />;
      case 'luminosa': return <SeccionLuminosa />;
      case 'calvin': return <SeccionCalvin />;
      case 'escala': return <SeccionEscala />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>La Fotosíntesis</h1>
          <p className={styles.subtitle}>De la luz solar a la vida: el proceso que sostiene el planeta</p>
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
          title="Más sobre la fotosíntesis"
          subtitle="Conceptos clave de biología vegetal"
          defaultOpen={false}
        >
          <h3>¿Qué es la fotosíntesis?</h3>
          <p>
            La fotosíntesis es el proceso bioquímico por el cual los organismos fotosintéticos (plantas,
            algas y cianobacterias) convierten la energía luminosa del sol en energía química almacenada
            en moléculas orgánicas como la glucosa. Es la base de casi todas las cadenas tróficas del planeta.
          </p>

          <h3>¿Dónde ocurre?</h3>
          <p>
            En los <strong>cloroplastos</strong>, orgánulos presentes en las células vegetales y algas.
            Dentro del cloroplasto hay dos compartimentos clave: los tilacoides (membranas apiladas donde
            ocurre la fase luminosa) y el estroma (líquido donde ocurre el ciclo de Calvin).
          </p>

          <h3>¿Por qué las hojas son verdes?</h3>
          <p>
            La clorofila absorbe principalmente luz roja (~680 nm) y azul (~430 nm), pero refleja
            la luz verde (~550 nm), que es la que percibimos. En otoño, al degradarse la clorofila,
            aparecen los pigmentos amarillos y naranjas (carotenoides) que estaban enmascarados.
          </p>

          <h3>Fotosíntesis C3, C4 y CAM</h3>
          <p>
            Existen tres variantes principales. Las plantas C3 (trigo, arroz) usan solo el ciclo de Calvin.
            Las C4 (maíz, caña de azúcar) tienen un paso previo que concentra CO₂ y evita la fotorrespiración.
            Las CAM (cactus, piña) abren los estomas de noche para ahorrar agua. Cada estrategia es una
            adaptación a diferentes climas y disponibilidad de agua.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador presenta una visión simplificada de la fotosíntesis con fines
            educativos. Los datos de escala son aproximaciones basadas en fuentes científicas generales (NASA,
            estudios de ecología global). La bioquímica real es considerablemente más compleja.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-fotosintesis')} />
        <ShareCard appName="visualizador-fotosintesis" />
        <Footer appName="visualizador-fotosintesis" />
    </div>
  );
}
