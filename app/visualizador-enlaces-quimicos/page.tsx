'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './EnlacesQuimicos.module.css';
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

type Seccion = 'tipos' | 'decision' | 'propiedades' | 'vida';
type TipoEnlace = 'ionico' | 'covalente' | 'metalico';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'tipos', titulo: 'Los 3 Tipos', icono: '⚛️' },
  { id: 'decision', titulo: '¿Qué lo Decide?', icono: '⚖️' },
  { id: 'propiedades', titulo: 'Propiedades', icono: '📊' },
  { id: 'vida', titulo: 'En tu Vida', icono: '🏠' },
];

// ─────────────────────────────────────────────
// Datos de enlaces
// ─────────────────────────────────────────────

interface EnlaceInfo {
  id: TipoEnlace;
  nombre: string;
  icono: string;
  ejemplo: string;
  formula: string;
  resumen: string;
  mecanismo: string;
  atomos: string;
  propiedadClave: string;
  colorA: string;
  colorB: string;
}

const ENLACES: EnlaceInfo[] = [
  {
    id: 'ionico',
    nombre: 'Iónico',
    icono: '🧂',
    ejemplo: 'NaCl (sal)',
    formula: 'Na⁺ + Cl⁻',
    resumen: 'Un átomo CEDE electrones a otro',
    mecanismo: 'El sodio (metal) cede 1 electrón al cloro (no metal). Se forman iones: Na⁺ (catión) y Cl⁻ (anión). La atracción electrostática entre cargas opuestas los une formando un cristal con alternancia +/−.',
    atomos: 'Metal + No metal (diferencia de electronegatividad alta)',
    propiedadClave: 'Cristales duros pero frágiles. Conducen electricidad al disolverse en agua.',
    colorA: '#FF6B35',
    colorB: '#4ECDC4',
  },
  {
    id: 'covalente',
    nombre: 'Covalente',
    icono: '💧',
    ejemplo: 'H₂O (agua)',
    formula: 'H−O−H',
    resumen: 'Átomos COMPARTEN electrones',
    mecanismo: 'Dos átomos no metálicos comparten pares de electrones. Pueden compartir 1 par (enlace simple, como H₂), 2 pares (doble, como O₂) o 3 pares (triple, como N₂). Los electrones compartidos orbitan entre ambos núcleos.',
    atomos: 'No metal + No metal (electronegatividades similares)',
    propiedadClave: 'Forman moléculas discretas. Puntos de fusión generalmente bajos. Los polares se disuelven en agua.',
    colorA: '#E63946',
    colorB: '#E63946',
  },
  {
    id: 'metalico',
    nombre: 'Metálico',
    icono: '🔩',
    ejemplo: 'Fe (hierro)',
    formula: 'Fe⁰ + e⁻ libres',
    resumen: 'Electrones libres en un "mar"',
    mecanismo: 'Los átomos metálicos liberan sus electrones de valencia, que forman un "mar de electrones" compartido. Los cationes quedan fijos en una red cristalina, rodeados de electrones que se mueven libremente entre ellos.',
    atomos: 'Metal + Metal (o metal puro)',
    propiedadClave: 'Conducen electricidad y calor siempre. Son maleables y dúctiles. Tienen brillo metálico.',
    colorA: '#6C757D',
    colorB: '#6C757D',
  },
];

// ─────────────────────────────────────────────
// Datos de electronegatividad
// ─────────────────────────────────────────────

interface EjemploElectronegatividad {
  elementoA: string;
  enA: number;
  elementoB: string;
  enB: number;
  diferencia: number;
  tipo: string;
  descripcion: string;
}

const EJEMPLOS_EN: EjemploElectronegatividad[] = [
  { elementoA: 'Na', enA: 0.9, elementoB: 'Cl', enB: 3.0, diferencia: 2.1, tipo: 'Iónico', descripcion: 'Diferencia grande → el electrón se transfiere completamente' },
  { elementoA: 'H', enA: 2.1, elementoB: 'O', enB: 3.5, diferencia: 1.4, tipo: 'Covalente polar', descripcion: 'Diferencia media → se comparten pero desigualmente (δ+/δ−)' },
  { elementoA: 'O', enA: 3.5, elementoB: 'O', enB: 3.5, diferencia: 0, tipo: 'Covalente apolar', descripcion: 'Sin diferencia → se comparten por igual' },
  { elementoA: 'Fe', enA: 1.8, elementoB: 'Fe', enB: 1.8, diferencia: 0, tipo: 'Metálico', descripcion: 'Metal + metal → electrones libres compartidos por toda la red' },
];

// ─────────────────────────────────────────────
// Datos de propiedades
// ─────────────────────────────────────────────

interface Propiedad {
  nombre: string;
  icono: string;
  ionico: string;
  covalente: string;
  metalico: string;
  explicacion: string;
}

const PROPIEDADES: Propiedad[] = [
  {
    nombre: 'Estado sólido',
    icono: '🧊',
    ionico: 'Cristal rígido',
    covalente: 'Molécula (gas/líq/sól)',
    metalico: 'Red metálica',
    explicacion: 'Los iónicos forman redes cristalinas ordenadas. Los covalentes forman moléculas individuales (por eso muchos son gases o líquidos). Los metálicos forman redes de cationes con electrones libres.',
  },
  {
    nombre: 'Punto de fusión',
    icono: '🌡️',
    ionico: 'Alto (801°C NaCl)',
    covalente: 'Bajo (0°C H₂O)',
    metalico: 'Variable (1.538°C Fe)',
    explicacion: 'Los enlaces iónicos y metálicos son fuertes en todas direcciones → necesitan mucha energía para romperse. Los covalentes forman moléculas que se separan fácilmente entre sí.',
  },
  {
    nombre: 'Conduce electricidad',
    icono: '⚡',
    ionico: 'En disolución/fundido',
    covalente: 'No (generalmente)',
    metalico: 'Sí (siempre)',
    explicacion: 'Conducir requiere cargas que se muevan. En metales los electrones son libres. En iónicos, los iones solo se mueven al disolver o fundir. En covalentes no hay cargas libres.',
  },
  {
    nombre: 'Soluble en agua',
    icono: '💧',
    ionico: 'Sí (muchos)',
    covalente: 'Polar sí, apolar no',
    metalico: 'No',
    explicacion: 'El agua (polar) disuelve bien sustancias iónicas y covalentes polares ("lo similar disuelve lo similar"). Las sustancias apolares se disuelven en aceite o disolventes orgánicos.',
  },
  {
    nombre: 'Dureza',
    icono: '💎',
    ionico: 'Duro pero frágil',
    covalente: 'Blando',
    metalico: 'Duro y maleable',
    explicacion: 'Los iónicos son duros pero si aplicas fuerza, iones del mismo signo quedan juntos y se repelen → se rompe. Los metales son maleables porque los electrones libres permiten que las capas se deslicen.',
  },
];

// ─────────────────────────────────────────────
// Ejemplos cotidianos
// ─────────────────────────────────────────────

interface EjemploCotidiano {
  icono: string;
  nombre: string;
  formula: string;
  tipo: string;
  porQue: string;
}

const EJEMPLOS_VIDA: EjemploCotidiano[] = [
  { icono: '🧂', nombre: 'Sal de mesa', formula: 'NaCl', tipo: 'Iónico', porQue: 'Por eso se disuelve en agua y conduce al disolverse. Sus cristales cúbicos son resultado de la alternancia Na⁺/Cl⁻.' },
  { icono: '💧', nombre: 'Agua', formula: 'H₂O', tipo: 'Covalente polar', porQue: 'Por eso es el "disolvente universal": sus moléculas polares rodean y separan iones y otras moléculas polares.' },
  { icono: '🔩', nombre: 'Hierro / acero', formula: 'Fe', tipo: 'Metálico', porQue: 'Por eso conduce electricidad, calor y se puede forjar. Los electrones libres permiten deformar sin romper.' },
  { icono: '💎', nombre: 'Diamante', formula: 'C', tipo: 'Covalente (red 3D)', porQue: 'Cada carbono enlazado covalentemente a otros 4 en todas direcciones. Resultado: el material natural más duro.' },
  { icono: '🧊', nombre: 'Hielo', formula: 'H₂O', tipo: 'Covalente + puentes H', porQue: 'Los puentes de hidrógeno crean una estructura abierta → el hielo es MENOS denso que el agua líquida → flota.' },
  { icono: '🫧', nombre: 'CO₂', formula: 'CO₂', tipo: 'Covalente apolar', porQue: 'Aunque los enlaces C=O son polares, la molécula lineal los cancela → apolar → es gas a temperatura ambiente.' },
];

const DATOS_CURIOSOS = [
  'El diamante y el grafito son AMBOS carbono puro — solo cambia cómo se enlazan los átomos.',
  'Los metales brillan porque los electrones libres absorben luz y la reemiten en todas las frecuencias visibles.',
  'Sin puentes de hidrógeno, el agua herviría a −80 °C. La vida en la Tierra sería imposible.',
];

// ─────────────────────────────────────────────
// Componentes de animación
// ─────────────────────────────────────────────

function AnimacionIonico() {
  return (
    <div className={styles.animacionContainer}>
      <div className={styles.animacionEnlace}>
        <div className={`${styles.atomo} ${styles.atomoNa}`}>
          <span className={styles.atomoLabel}>Na</span>
          <div className={`${styles.electron} ${styles.electronTransferir}`} />
        </div>
        <div className={styles.flechaTransferencia} aria-hidden="true">→</div>
        <div className={`${styles.atomo} ${styles.atomoCl}`}>
          <span className={styles.atomoLabel}>Cl</span>
          <div className={`${styles.electron} ${styles.electronRecibido}`} />
        </div>
      </div>
      <div className={styles.animacionDetalle}>
        <span className={styles.carga}>Na⁺</span>
        <span className={styles.atraccion}>⟷ atracción</span>
        <span className={styles.carga}>Cl⁻</span>
      </div>
    </div>
  );
}

function AnimacionCovalente() {
  return (
    <div className={styles.animacionContainer}>
      <div className={styles.animacionEnlace}>
        <div className={`${styles.atomo} ${styles.atomoH}`}>
          <span className={styles.atomoLabel}>H</span>
        </div>
        <div className={styles.zonaCompartida}>
          <div className={`${styles.electron} ${styles.electronCompartido1}`} />
          <div className={`${styles.electron} ${styles.electronCompartido2}`} />
        </div>
        <div className={`${styles.atomo} ${styles.atomoO}`}>
          <span className={styles.atomoLabel}>O</span>
        </div>
      </div>
      <div className={styles.animacionDetalle}>
        <span className={styles.carga}>δ+</span>
        <span className={styles.atraccion}>compartido</span>
        <span className={styles.carga}>δ−</span>
      </div>
    </div>
  );
}

function AnimacionMetalico() {
  return (
    <div className={styles.animacionContainer}>
      <div className={styles.animacionEnlace}>
        <div className={styles.redMetalica}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${styles.atomo} ${styles.atomoMetal}`}>
              <span className={styles.atomoLabel}>Fe⁺</span>
            </div>
          ))}
          {[0, 1, 2].map((i) => (
            <div key={`e-${i}`} className={`${styles.electron} ${styles.electronLibre} ${styles[`electronLibre${i + 1}` as keyof typeof styles]}`} />
          ))}
        </div>
      </div>
      <div className={styles.animacionDetalle}>
        <span className={styles.atraccion}>mar de electrones</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEnlacesQuimicosPage() {
  const [seccion, setSeccion] = useState<Seccion>('tipos');
  const [enlaceSeleccionado, setEnlaceSeleccionado] = useState<TipoEnlace>('ionico');
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<number | null>(null);

  const enlaceActual = ENLACES.find((e) => e.id === enlaceSeleccionado)!;

  const renderAnimacion = (tipo: TipoEnlace) => {
    switch (tipo) {
      case 'ionico': return <AnimacionIonico />;
      case 'covalente': return <AnimacionCovalente />;
      case 'metalico': return <AnimacionMetalico />;
    }
  };

  // ── Sección 1: Los 3 Tipos ──
  const renderTipos = () => (
    <div className={styles.seccionContenido}>
      <div className={styles.enlaceCards}>
        {ENLACES.map((enlace) => (
          <button
            key={enlace.id}
            type="button"
            className={`${styles.enlaceCard} ${enlaceSeleccionado === enlace.id ? styles.enlaceCardActiva : ''}`}
            onClick={() => setEnlaceSeleccionado(enlace.id)}
            aria-pressed={enlaceSeleccionado === enlace.id}
          >
            <span className={styles.enlaceIcono} aria-hidden="true">{enlace.icono}</span>
            <strong className={styles.enlaceNombre}>{enlace.nombre}</strong>
            <span className={styles.enlaceEjemplo}>{enlace.ejemplo}</span>
          </button>
        ))}
      </div>

      {renderAnimacion(enlaceSeleccionado)}

      <div className={styles.panelDetalle}>
        <h3 className={styles.panelTitulo}>
          <span aria-hidden="true">{enlaceActual.icono}</span> Enlace {enlaceActual.nombre}
          <span className={styles.panelFormula}>{enlaceActual.formula}</span>
        </h3>
        <p className={styles.panelResumen}>{enlaceActual.resumen}</p>

        <div className={styles.panelInfo}>
          <div className={styles.panelInfoBloque}>
            <span className={styles.panelInfoLabel}>¿Qué pasa con los electrones?</span>
            <p>{enlaceActual.mecanismo}</p>
          </div>
          <div className={styles.panelInfoBloque}>
            <span className={styles.panelInfoLabel}>Átomos involucrados</span>
            <p>{enlaceActual.atomos}</p>
          </div>
          <div className={styles.panelInfoBloque}>
            <span className={styles.panelInfoLabel}>Propiedad clave</span>
            <p>{enlaceActual.propiedadClave}</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <span aria-hidden="true">💡</span> Todo se reduce a una pregunta: ¿los electrones se transfieren, se comparten o se liberan?
      </div>
    </div>
  );

  // ── Sección 2: ¿Qué Decide el Tipo? ──
  const renderDecision = () => (
    <div className={styles.seccionContenido}>
      <h3 className={styles.seccionTitulo}>La electronegatividad: la &quot;avaricia&quot; por los electrones</h3>
      <p className={styles.seccionDesc}>
        La electronegatividad mide cuánto atrae un átomo a los electrones compartidos.
        La <strong>diferencia</strong> entre dos átomos determina el tipo de enlace.
      </p>

      <div className={styles.escalaEN}>
        <div className={styles.escalaBarraContainer}>
          <div className={styles.escalaBarra}>
            <div className={`${styles.escalaZona} ${styles.escalaApolar}`}>
              <span>Apolar</span>
              <span className={styles.escalaValor}>0 – 0,4</span>
            </div>
            <div className={`${styles.escalaZona} ${styles.escalaPolar}`}>
              <span>Polar</span>
              <span className={styles.escalaValor}>0,4 – 1,7</span>
            </div>
            <div className={`${styles.escalaZona} ${styles.escalaIonico}`}>
              <span>Iónico</span>
              <span className={styles.escalaValor}>&gt; 1,7</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.ejemplosEN}>
        {EJEMPLOS_EN.map((ej, i) => (
          <div key={i} className={styles.ejemploEN}>
            <div className={styles.ejemploENHeader}>
              <span className={styles.ejemploENAtomo}>{ej.elementoA} ({ej.enA.toFixed(1).replace('.', ',')})</span>
              <span className={styles.ejemploENVs}>+</span>
              <span className={styles.ejemploENAtomo}>{ej.elementoB} ({ej.enB.toFixed(1).replace('.', ',')})</span>
              <span className={styles.ejemploENDiff}>Δ = {ej.diferencia.toFixed(1).replace('.', ',')}</span>
            </div>
            <div className={styles.ejemploENTipo}>{ej.tipo}</div>
            <p className={styles.ejemploENDesc}>{ej.descripcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.polarVsApolar}>
        <h4>¿Polar vs apolar? Importa mucho</h4>
        <div className={styles.polarGrid}>
          <div className={styles.polarCard}>
            <span className={styles.polarIcono}>💧</span>
            <strong>Polar (H₂O)</strong>
            <p>Cargas parciales δ+/δ− → se disuelve en agua</p>
          </div>
          <div className={styles.polarCard}>
            <span className={styles.polarIcono}>🫧</span>
            <strong>Apolar (O₂)</strong>
            <p>Sin cargas parciales → se disuelve en aceite</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <span aria-hidden="true">💡</span> La electronegatividad es la &quot;avaricia&quot; de un átomo por los electrones. Cuanta más diferencia, más desigual el reparto.
      </div>
    </div>
  );

  // ── Sección 3: Propiedades ──
  const renderPropiedades = () => (
    <div className={styles.seccionContenido}>
      <h3 className={styles.seccionTitulo}>Comparativa de propiedades</h3>
      <p className={styles.seccionDesc}>
        El tipo de enlace determina las propiedades macroscópicas. Haz clic en cada fila para entender por qué.
      </p>

      <div className={styles.tablaContainer}>
        <table className={styles.tablaPropiedades}>
          <thead>
            <tr>
              <th>Propiedad</th>
              <th><span aria-hidden="true">🧂</span> Iónico</th>
              <th><span aria-hidden="true">💧</span> Covalente</th>
              <th><span aria-hidden="true">🔩</span> Metálico</th>
            </tr>
          </thead>
          <tbody>
            {PROPIEDADES.map((prop, i) => (
              <tr
                key={i}
                className={`${styles.filaPropiedad} ${propiedadSeleccionada === i ? styles.filaPropiedadActiva : ''}`}
                onClick={() => setPropiedadSeleccionada(propiedadSeleccionada === i ? null : i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPropiedadSeleccionada(propiedadSeleccionada === i ? null : i); } }}
                aria-expanded={propiedadSeleccionada === i}
              >
                <td><span aria-hidden="true">{prop.icono}</span> {prop.nombre}</td>
                <td>{prop.ionico}</td>
                <td>{prop.covalente}</td>
                <td>{prop.metalico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {propiedadSeleccionada !== null && (
        <div className={styles.explicacionPropiedad} role="alert" aria-live="polite">
          <span className={styles.explicacionIcono} aria-hidden="true">{PROPIEDADES[propiedadSeleccionada].icono}</span>
          <div>
            <strong>{PROPIEDADES[propiedadSeleccionada].nombre}</strong>
            <p>{PROPIEDADES[propiedadSeleccionada].explicacion}</p>
          </div>
        </div>
      )}
    </div>
  );

  // ── Sección 4: Enlaces en tu Vida ──
  const renderVida = () => (
    <div className={styles.seccionContenido}>
      <h3 className={styles.seccionTitulo}>Ejemplos cotidianos</h3>

      <div className={styles.vidaGrid}>
        {EJEMPLOS_VIDA.map((ej, i) => (
          <div key={i} className={styles.vidaCard}>
            <div className={styles.vidaHeader}>
              <span className={styles.vidaIcono} aria-hidden="true">{ej.icono}</span>
              <div>
                <strong>{ej.nombre}</strong>
                <span className={styles.vidaFormula}>{ej.formula}</span>
              </div>
            </div>
            <span className={styles.vidaTipo}>{ej.tipo}</span>
            <p className={styles.vidaDesc}>{ej.porQue}</p>
          </div>
        ))}
      </div>

      <div className={styles.curiosidades}>
        <h4><span aria-hidden="true">🤔</span> Datos curiosos</h4>
        <ul>
          {DATOS_CURIOSOS.map((dato, i) => (
            <li key={i}>{dato}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderSeccion = () => {
    switch (seccion) {
      case 'tipos': return renderTipos();
      case 'decision': return renderDecision();
      case 'propiedades': return renderPropiedades();
      case 'vida': return renderVida();
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">⚛️</span> Enlaces Químicos</h1>
          <p className={styles.subtitle}>Cómo se unen los átomos para formar todo lo que te rodea</p>
        </header>

        <LegalNotice />

        <nav className={styles.nav} aria-label="Secciones del explicador">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navBtnActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span aria-hidden="true">{s.icono}</span> {s.titulo}
            </button>
          ))}
        </nav>

        <main className={styles.mainContent}>
          {renderSeccion()}
        </main>

        <EducationalSection
          title="📚 Profundiza en enlaces químicos"
          subtitle="Conceptos avanzados y contexto científico"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué existen los enlaces?</h2>
            <p>
              Los átomos buscan la configuración electrónica más estable (regla del octeto): 8 electrones
              en su capa de valencia, como los gases nobles. Para conseguirlo, pueden ceder, captar o
              compartir electrones con otros átomos. Esa es la razón fundamental de los enlaces.
            </p>

            <h2>Enlace covalente: simple, doble y triple</h2>
            <p>
              La diferencia está en cuántos pares de electrones se comparten. El H₂ comparte 1 par
              (enlace simple, 1 línea: H—H). El O₂ comparte 2 pares (doble enlace: O=O). El N₂
              comparte 3 pares (triple enlace: N≡N). Cuantos más pares compartidos, más fuerte y
              más corto es el enlace.
            </p>

            <h2>Los puentes de hidrógeno</h2>
            <p>
              No son enlaces químicos propiamente dichos, sino fuerzas intermoleculares. Ocurren cuando
              un hidrógeno unido a O, N o F interactúa con otro átomo electronegativo cercano. Son débiles
              individualmente pero cruciales en conjunto: explican por qué el agua es líquida, por qué el
              hielo flota y por qué el ADN tiene forma de doble hélice.
            </p>

            <div className={styles.warningBox}>
              <strong><span aria-hidden="true">⚠️</span> Nota educativa</strong>
              <p>
                Este explicador presenta un modelo simplificado. La realidad cuántica es más compleja:
                los electrones no orbitan como planetas sino que forman nubes de probabilidad (orbitales).
                La frontera entre iónico y covalente no es nítida, sino un espectro continuo determinado
                por la diferencia de electronegatividad.
              </p>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-enlaces-quimicos')} />
        <ShareCard appName="visualizador-enlaces-quimicos" />
        <Footer appName="visualizador-enlaces-quimicos" />
    </div>
  );
}
