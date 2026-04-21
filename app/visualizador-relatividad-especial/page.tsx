'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorRelatividadEspecial.module.css';
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
// Constantes físicas y cálculos relativistas
// ─────────────────────────────────────────────

const C_MS = 299_792_458; // velocidad de la luz en m/s
const MC2_JOULES_PER_KG = C_MS * C_MS; // 8.987e16 J/kg

function calcularGamma(vPorcentaje: number): number {
  const v = Math.min(vPorcentaje / 100, 0.9999);
  return 1 / Math.sqrt(Math.max(1 - v * v, 1e-8));
}

function formatearGamma(gamma: number): string {
  if (gamma >= 1000) return gamma.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  if (gamma >= 100) return gamma.toLocaleString('es-ES', { maximumFractionDigits: 1 });
  return gamma.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularEnergiaJoules(masaKg: number): number {
  return masaKg * MC2_JOULES_PER_KG;
}

function formatearEnergia(joules: number): string {
  if (joules >= 1e21) return `${(joules / 1e21).toLocaleString('es-ES', { maximumFractionDigits: 1 })} × 10²¹ J`;
  if (joules >= 1e18) return `${(joules / 1e18).toLocaleString('es-ES', { maximumFractionDigits: 1 })} × 10¹⁸ J`;
  if (joules >= 1e15) return `${(joules / 1e15).toLocaleString('es-ES', { maximumFractionDigits: 1 })} × 10¹⁵ J`;
  if (joules >= 1e12) return `${(joules / 1e12).toLocaleString('es-ES', { maximumFractionDigits: 1 })} × 10¹² J`;
  return `${(joules / 1e9).toLocaleString('es-ES', { maximumFractionDigits: 1 })} × 10⁹ J`;
}

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type MasaOpcion = '1g' | '1kg' | '1t';

interface MasaConfig {
  label: string;
  masaKg: number;
  descripcion: string;
}

const MASAS: Record<MasaOpcion, MasaConfig> = {
  '1g': { label: '1 gramo', masaKg: 0.001, descripcion: 'Un terrón de azúcar' },
  '1kg': { label: '1 kilogramo', masaKg: 1, descripcion: 'Una botella de agua' },
  '1t': { label: '1 tonelada', masaKg: 1000, descripcion: 'Un coche pequeño' },
};

// Equivalencias para 1g
const EQUIVALENCIAS_1G = {
  bombas: 43, // bombas de Hiroshima equivalentes a 1g de materia aniquilada
  diasElectricidad: 7_700_000, // días de electricidad de España con 1g
};

// ─────────────────────────────────────────────
// Sección 1: Dilatación del tiempo
// ─────────────────────────────────────────────

function SeccionDilatacion(): React.ReactNode {
  const [velocidad, setVelocidad] = useState<number>(50);

  const gamma = calcularGamma(velocidad);
  const aniosTierra = 10;
  const aniosNave = +(aniosTierra / gamma).toFixed(2);
  const escalaContraida = Math.max(100 / gamma, 2);

  // Colores dinámicos según velocidad
  const intensidad = Math.min(velocidad / 99.9, 1);
  const colorFactor = Math.floor(intensidad * 100);

  function getEjemplo(): string {
    if (velocidad < 10) return 'A esta velocidad los efectos relativistas son prácticamente imperceptibles.';
    if (velocidad < 50) return 'Los efectos son medibles pero pequeños. Se necesitan instrumentos muy precisos para detectarlos.';
    if (velocidad < 80) return 'Los efectos ya son significativos. El tiempo en la nave transcurre notablemente más despacio.';
    if (velocidad < 95) return 'Los efectos son dramáticos. La nave experimenta menos de la mitad del tiempo que la Tierra.';
    if (velocidad < 99.5) return '¡Efectos extremos! La relatividad transforma completamente la experiencia del tiempo.';
    return '¡Al límite de la velocidad de la luz! El tiempo casi se detiene en la nave.';
  }

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <span className={styles.seccionIcono} aria-hidden="true">⏱️</span>
        <div>
          <h2 className={styles.seccionTitulo}>Dilatación del tiempo</h2>
          <p className={styles.seccionSubtitulo}>A mayor velocidad, el tiempo transcurre más despacio</p>
        </div>
      </div>

      <div className={styles.sliderContainer}>
        <label htmlFor="slider-velocidad-dilatacion" className={styles.sliderLabel}>
          Velocidad de la nave: <strong>{velocidad}% de c</strong>
        </label>
        <input
          id="slider-velocidad-dilatacion"
          type="range"
          min={0}
          max={99.9}
          step={0.1}
          value={velocidad}
          onChange={(e) => setVelocidad(parseFloat(e.target.value))}
          className={styles.slider}
          style={{ '--intensity': `${colorFactor}%` } as React.CSSProperties}
          aria-label={`Velocidad de la nave: ${velocidad}% de la velocidad de la luz`}
        />
        <div className={styles.sliderMarks}>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>99,9%</span>
        </div>
      </div>

      <div className={styles.resultadosGrid}>
        <div className={styles.resultadoCard}>
          <div className={styles.resultadoIcono} aria-hidden="true">γ</div>
          <div className={styles.resultadoValor}>{formatearGamma(gamma)}</div>
          <div className={styles.resultadoLabel}>Factor gamma (γ)</div>
          <div className={styles.resultadoDesc}>Cuánto se dilata el tiempo</div>
        </div>
        <div className={styles.resultadoCard}>
          <div className={styles.resultadoIcono} aria-hidden="true">🌍</div>
          <div className={styles.resultadoValor}>{aniosTierra} años</div>
          <div className={styles.resultadoLabel}>Tiempo en la Tierra</div>
          <div className={styles.resultadoDesc}>Para el observador en reposo</div>
        </div>
        <div className={`${styles.resultadoCard} ${styles.resultadoDestacado}`}>
          <div className={styles.resultadoIcono} aria-hidden="true">🚀</div>
          <div className={styles.resultadoValor}>{aniosNave.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} años</div>
          <div className={styles.resultadoLabel}>Tiempo en la nave</div>
          <div className={styles.resultadoDesc}>Para el viajero</div>
        </div>
      </div>

      <div className={styles.ejemploConcretoBox}>
        <p className={styles.ejemploConcretoTexto}>
          Viajando a <strong>{velocidad}% de c</strong> durante{' '}
          <strong>{aniosTierra} años terrestres</strong>, en la nave pasan solo{' '}
          <strong>{aniosNave.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} años</strong>.
        </p>
      </div>

      {/* Barra visual de velocidad */}
      <div className={styles.barraVelocidadContainer}>
        <div className={styles.barraVelocidadLabel}>
          <span>🚀 Nave espacial</span>
          <span>{velocidad}% c</span>
        </div>
        <div className={styles.barraVelocidadTrack} aria-hidden="true">
          <div
            className={styles.barraVelocidadFill}
            style={{ width: `${velocidad / 99.9 * 100}%` }}
          />
        </div>
        <div className={styles.barraVelocidadEscala} style={{ width: `${escalaContraida}%`, maxWidth: '100%' }} aria-hidden="true">
          <div className={styles.barraVelocidadEscalaInner} />
        </div>
      </div>

      <div className={styles.warningBox}>
        <strong>¿Por qué ocurre?</strong> Einstein postuló que la velocidad de la luz es constante para todos los observadores.
        Para que esto sea posible, el tiempo mismo debe ser diferente según el estado de movimiento: el espacio-tiempo se curva.
        {' '}{getEjemplo()}
      </div>

      <div className={styles.referenciaVelocidades}>
        <h3 className={styles.referenciaTitle}>Ejemplos rápidos</h3>
        <div className={styles.referenciaGrid}>
          {[
            { v: 10, label: '10% c' },
            { v: 50, label: '50% c' },
            { v: 90, label: '90% c' },
            { v: 99, label: '99% c' },
            { v: 99.9, label: '99,9% c' },
          ].map(({ v, label }) => {
            const g = calcularGamma(v);
            const tNave = (10 / g).toFixed(2);
            return (
              <button
                key={v}
                className={styles.referenciaBtn}
                onClick={() => setVelocidad(v)}
                aria-label={`Ver ejemplo a ${label}`}
              >
                <span className={styles.referenciaBtnVel}>{label}</span>
                <span className={styles.referenciaBtnGamma}>γ = {formatearGamma(g)}</span>
                <span className={styles.referenciaBtnTiempo}>{tNave} años en nave</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Contracción de longitud
// ─────────────────────────────────────────────

function SeccionContraccion(): React.ReactNode {
  const [velocidad, setVelocidad] = useState<number>(50);

  const gamma = calcularGamma(velocidad);
  const longitudReposo = 100; // metros
  const longitudContraida = +(longitudReposo / gamma).toFixed(2);
  const scaleX = Math.max(longitudContraida / longitudReposo, 0.02);

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <span className={styles.seccionIcono} aria-hidden="true">📏</span>
        <div>
          <h2 className={styles.seccionTitulo}>Contracción de longitud</h2>
          <p className={styles.seccionSubtitulo}>Los objetos en movimiento se acortan en la dirección del viaje</p>
        </div>
      </div>

      <div className={styles.sliderContainer}>
        <label htmlFor="slider-velocidad-contraccion" className={styles.sliderLabel}>
          Velocidad de la nave: <strong>{velocidad}% de c</strong>
        </label>
        <input
          id="slider-velocidad-contraccion"
          type="range"
          min={0}
          max={99.9}
          step={0.1}
          value={velocidad}
          onChange={(e) => setVelocidad(parseFloat(e.target.value))}
          className={styles.slider}
          aria-label={`Velocidad: ${velocidad}% de la velocidad de la luz`}
        />
        <div className={styles.sliderMarks}>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>99,9%</span>
        </div>
      </div>

      {/* Visualización CSS de la nave */}
      <div className={styles.naveContainer} aria-hidden="true">
        <div className={styles.naveWrapper}>
          <div className={styles.naveLabel}>Nave en reposo (100 m)</div>
          <div className={styles.naveReposo}>
            <div className={styles.naveCuerpo} />
          </div>
          <div className={styles.naveLabel}>
            Nave a {velocidad}% c — vista desde Tierra ({longitudContraida} m)
          </div>
          <div className={styles.naveMovimiento}>
            <div
              className={styles.naveCuerpo}
              style={{ transform: `scaleX(${scaleX})`, transformOrigin: 'left center' }}
            />
          </div>
        </div>
      </div>

      <div className={styles.resultadosGrid}>
        <div className={styles.resultadoCard}>
          <div className={styles.resultadoIcono} aria-hidden="true">📐</div>
          <div className={styles.resultadoValor}>100 m</div>
          <div className={styles.resultadoLabel}>Longitud en reposo (L₀)</div>
          <div className={styles.resultadoDesc}>Medida a bordo de la nave</div>
        </div>
        <div className={styles.resultadoCard}>
          <div className={styles.resultadoIcono} aria-hidden="true">γ</div>
          <div className={styles.resultadoValor}>{formatearGamma(gamma)}</div>
          <div className={styles.resultadoLabel}>Factor gamma (γ)</div>
          <div className={styles.resultadoDesc}>Factor de contracción</div>
        </div>
        <div className={`${styles.resultadoCard} ${styles.resultadoDestacado}`}>
          <div className={styles.resultadoIcono} aria-hidden="true">🔭</div>
          <div className={styles.resultadoValor}>{longitudContraida.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m</div>
          <div className={styles.resultadoLabel}>Longitud observada (L)</div>
          <div className={styles.resultadoDesc}>Medida desde Tierra</div>
        </div>
      </div>

      <div className={styles.ejemploConcretoBox}>
        <p className={styles.ejemploConcretoTexto}>
          Una nave de <strong>100 metros</strong> en reposo mide solo{' '}
          <strong>{longitudContraida.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} metros</strong> para un observador en Tierra
          cuando viaja a <strong>{velocidad}% de c</strong>.
        </p>
        <p className={styles.ejemploConcretoNota}>
          Fórmula: L = L₀ / γ — El objeto no se &quot;aplasta&quot;, es el espacio-tiempo lo que hace que parezca más corto.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 3: E = mc²
// ─────────────────────────────────────────────

function SeccionEnergia(): React.ReactNode {
  const [masaSeleccionada, setMasaSeleccionada] = useState<MasaOpcion>('1g');

  const config = MASAS[masaSeleccionada];
  const energiaJoules = calcularEnergiaJoules(config.masaKg);

  // Equivalencias escaladas desde 1g
  const factor = config.masaKg / 0.001;
  const bombasEquivalentes = Math.round(EQUIVALENCIAS_1G.bombas * factor);
  const diasElectricidad = Math.round(EQUIVALENCIAS_1G.diasElectricidad * factor);

  // Energía química vs nuclear vs relativista para referencia
  const comparativas = [
    {
      tipo: 'Quemar gasolina',
      icono: '⛽',
      energia: (config.masaKg * 46e6).toExponential(1),
      descripcion: '46 MJ/kg (combustión)',
      color: '#E67E22',
    },
    {
      tipo: 'Fisión nuclear',
      icono: '☢️',
      energia: (config.masaKg * 8.2e13).toExponential(1),
      descripcion: '82 TJ/kg (uranio-235)',
      color: '#E74C3C',
    },
    {
      tipo: 'E = mc²',
      icono: '✨',
      energia: formatearEnergia(energiaJoules),
      descripcion: 'Aniquilación total materia-antimateria',
      color: '#2E86AB',
    },
  ];

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <span className={styles.seccionIcono} aria-hidden="true">⚡</span>
        <div>
          <h2 className={styles.seccionTitulo}>E = mc² — Equivalencia masa-energía</h2>
          <p className={styles.seccionSubtitulo}>La masa en reposo contiene una energía enorme</p>
        </div>
      </div>

      <div className={styles.masaBotonesContainer}>
        <p className={styles.masaBotonesLabel}>Elige la muestra de materia:</p>
        <div className={styles.masaBotones}>
          {(Object.keys(MASAS) as MasaOpcion[]).map((key) => (
            <button
              key={key}
              className={`${styles.masaBtn} ${masaSeleccionada === key ? styles.masaBtnActivo : ''}`}
              onClick={() => setMasaSeleccionada(key)}
              aria-pressed={masaSeleccionada === key}
            >
              <span className={styles.masaBtnLabel}>{MASAS[key].label}</span>
              <span className={styles.masaBtnDesc}>{MASAS[key].descripcion}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.energiaResultado}>
        <div className={styles.energiaFormula} aria-label="Fórmula E igual a m por c al cuadrado">
          <span className={styles.energiaFormulaE}>E</span>
          <span className={styles.energiaFormulaIgual}>=</span>
          <span className={styles.energiaFormulaM}>m</span>
          <span className={styles.energiaFormulaC}>c²</span>
        </div>
        <div className={styles.energiaValor}>{formatearEnergia(energiaJoules)}</div>
        <div className={styles.energiaSubvalor}>
          Energía contenida en {config.label} de materia
        </div>
      </div>

      <div className={styles.equivalenciasGrid}>
        <div className={styles.equivalenciaCard}>
          <span className={styles.equivalenciaIcono} aria-hidden="true">💣</span>
          <div className={styles.equivalenciaValor}>
            {bombasEquivalentes.toLocaleString('es-ES')}
          </div>
          <div className={styles.equivalenciaLabel}>
            bombas de Hiroshima equivalentes
          </div>
        </div>
        <div className={styles.equivalenciaCard}>
          <span className={styles.equivalenciaIcono} aria-hidden="true">🏙️</span>
          <div className={styles.equivalenciaValor}>
            {diasElectricidad.toLocaleString('es-ES')}
          </div>
          <div className={styles.equivalenciaLabel}>
            días de electricidad de toda España
          </div>
        </div>
      </div>

      <div className={styles.comparativaEnergias}>
        <h3 className={styles.comparativaTitulo}>Comparativa de fuentes de energía para {config.label}</h3>
        <div className={styles.comparativaLista}>
          {comparativas.map((item) => (
            <div key={item.tipo} className={styles.comparativaItem}>
              <span className={styles.comparativaIcono} aria-hidden="true">{item.icono}</span>
              <div className={styles.comparativaInfo}>
                <div className={styles.comparativaTipo}>{item.tipo}</div>
                <div className={styles.comparativaDesc}>{item.descripcion}</div>
              </div>
              <div
                className={styles.comparativaEnergia}
                style={{ color: item.color }}
              >
                {item.energia}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.warningBox}>
        <strong>¿Por qué es tan enorme?</strong> La velocidad de la luz (c ≈ 300.000 km/s) es un número
        gigantesco, y al elevarlo al cuadrado se multiplica astronómicamente. Incluso una masa minúscula contiene
        una energía inimaginable. Las centrales nucleares solo aprovechan una fracción ínfima de la masa del combustible
        — la conversión total materia-energía aún no es técnicamente posible.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Paradoja de los gemelos
// ─────────────────────────────────────────────

interface PasoGemelos {
  titulo: string;
  descripcion: string;
  edadA: number;
  edadB: number;
  icono: string;
  detalle: string;
}

const PASOS_GEMELOS: PasoGemelos[] = [
  {
    titulo: 'Punto de partida',
    descripcion: 'Los gemelos tienen 30 años. Gemelo A se queda en la Tierra. Gemelo B parte en una nave a 90% de c.',
    edadA: 30,
    edadB: 30,
    icono: '🚀',
    detalle:
      'A 90% de la velocidad de la luz, el factor gamma es γ ≈ 2,29. El tiempo en la nave transcurrirá a la mitad de velocidad que en la Tierra.',
  },
  {
    titulo: 'En camino a Alfa Centauri',
    descripcion: 'La nave viaja a Alfa Centauri (4,37 años-luz). Desde la Tierra pasan ~4,85 años. En la nave pasan ~2,12 años.',
    edadA: 34.85,
    edadB: 32.12,
    icono: '⭐',
    detalle:
      'El gemelo B envía señales de vuelta a la Tierra, pero cuando las recibe, A ya ha envejecido más. La dilatación temporal es real y medible.',
  },
  {
    titulo: 'Giro en Alfa Centauri',
    descripcion: 'La nave frena, da la vuelta y acelera de vuelta. ¡Aquí está la clave de la paradoja! La aceleración rompe la simetría.',
    edadA: 34.85,
    edadB: 32.12,
    icono: '🔄',
    detalle:
      'La relatividad especial es simétrica: cada observador puede decir que el otro se mueve. Pero solo B experimenta la aceleración real del giro. Eso rompe la equivalencia.',
  },
  {
    titulo: 'Regreso a la Tierra',
    descripcion: 'La nave regresa igualmente a 90%c. Desde la Tierra pasan otros ~4,85 años. En la nave, ~2,12 años más.',
    edadA: 39.7,
    edadB: 34.24,
    icono: '🌍',
    detalle:
      'El gemelo B experimenta el mismo fenómeno en el regreso: tiempo propio más lento. Al llegar, la diferencia acumulada es neta y permanente.',
  },
  {
    titulo: '¡Reencuentro!',
    descripcion: 'Los gemelos se vuelven a ver. A tiene casi 40 años. B tiene 34. Se han separado ~5,5 años de diferencia biológica.',
    edadA: 39.7,
    edadB: 34.24,
    icono: '🤝',
    detalle:
      'La paradoja se resuelve: NO es simétrica. B aceleró (cambió de sistema de referencia inercial), A no. La relatividad especial predice esto exactamente. ¡Es real! Los relojes atómicos en aviones lo confirman.',
  },
];

function SeccionGemelos(): React.ReactNode {
  const [paso, setPaso] = useState<number>(0);

  const pasoActual = PASOS_GEMELOS[paso];
  const diferencia = +(pasoActual.edadA - pasoActual.edadB).toFixed(2);

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <span className={styles.seccionIcono} aria-hidden="true">👬</span>
        <div>
          <h2 className={styles.seccionTitulo}>Paradoja de los gemelos</h2>
          <p className={styles.seccionSubtitulo}>¿Por qué los gemelos envejecen diferente? No es simétrico</p>
        </div>
      </div>

      {/* Indicador de pasos */}
      <div className={styles.pasosIndicador} role="tablist" aria-label="Pasos de la paradoja de los gemelos">
        {PASOS_GEMELOS.map((p, i) => (
          <button
            key={i}
            className={`${styles.pasoIndicadorBtn} ${i === paso ? styles.pasoIndicadorActivo : ''} ${i < paso ? styles.pasoIndicadorCompletado : ''}`}
            onClick={() => setPaso(i)}
            role="tab"
            aria-selected={i === paso}
            aria-label={`Paso ${i + 1}: ${p.titulo}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Contenido del paso */}
      <div className={styles.pasoContenido}>
        <div className={styles.pasoHeader}>
          <span className={styles.pasoIcono} aria-hidden="true">{pasoActual.icono}</span>
          <h3 className={styles.pasoTitulo}>{pasoActual.titulo}</h3>
        </div>
        <p className={styles.pasoDescripcion}>{pasoActual.descripcion}</p>

        {/* Edades comparadas */}
        <div className={styles.edadesGrid}>
          <div className={styles.edadCard}>
            <div className={styles.edadIcono} aria-hidden="true">🌍</div>
            <div className={styles.edadNombre}>Gemelo A (Tierra)</div>
            <div className={styles.edadValor}>{pasoActual.edadA.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} años</div>
          </div>
          <div className={styles.edadVs} aria-hidden="true">VS</div>
          <div className={`${styles.edadCard} ${styles.edadDestacada}`}>
            <div className={styles.edadIcono} aria-hidden="true">🚀</div>
            <div className={styles.edadNombre}>Gemelo B (Nave)</div>
            <div className={styles.edadValor}>{pasoActual.edadB.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} años</div>
          </div>
        </div>

        {diferencia > 0.01 && (
          <div className={styles.diferenciaBox}>
            <strong>Diferencia de edad: {diferencia.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} años</strong>
            {' '}— El gemelo A envejece más rápido.
          </div>
        )}

        <div className={styles.pasoDetalle}>{pasoActual.detalle}</div>
      </div>

      {/* Botones de navegación */}
      <div className={styles.pasoNavegacion}>
        <button
          className={styles.pasoNavBtn}
          onClick={() => setPaso((p) => Math.max(0, p - 1))}
          disabled={paso === 0}
          aria-label="Paso anterior"
        >
          ← Anterior
        </button>
        <span className={styles.pasoCounter} aria-live="polite">
          {paso + 1} / {PASOS_GEMELOS.length}
        </span>
        <button
          className={styles.pasoNavBtn}
          onClick={() => setPaso((p) => Math.min(PASOS_GEMELOS.length - 1, p + 1))}
          disabled={paso === PASOS_GEMELOS.length - 1}
          aria-label="Paso siguiente"
        >
          Siguiente →
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorRelatividadEspecial() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcono} aria-hidden="true">🌌</span>
          <h1 className={styles.heroTitulo}>Relatividad Especial</h1>
          <p className={styles.heroSubtitulo}>
            Dilatación del tiempo · Contracción de longitud · E=mc² · Paradoja de los gemelos
          </p>
          <p className={styles.heroDesc}>
            La teoría que Einstein publicó en 1905 y que cambió para siempre nuestra comprensión del espacio,
            el tiempo y la energía. Sin fórmulas complejas — solo visualizaciones y sliders.
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <SeccionDilatacion />
        <SeccionContraccion />
        <SeccionEnergia />
        <SeccionGemelos />
      </main>

      <EducationalSection
        title="Los Fundamentos de la Relatividad Especial"
        subtitle="Los dos postulados de Einstein que cambiaron nuestra comprensión del espacio y el tiempo"
      >
        <div className={styles.educacional}>
          <h3>Los dos postulados de Einstein (1905)</h3>
          <p>
            En su artículo <em>&quot;Sobre la electrodinámica de los cuerpos en movimiento&quot;</em>, Einstein
            estableció dos postulados radicales:
          </p>
          <ol>
            <li>
              <strong>Principio de relatividad:</strong> Las leyes de la física son las mismas en todos
              los sistemas de referencia inerciales (en movimiento uniforme).
            </li>
            <li>
              <strong>Constancia de la velocidad de la luz:</strong> La velocidad de la luz en el vacío (c ≈
              299.792.458 m/s) es la misma para todos los observadores, independientemente del movimiento de
              la fuente o del observador.
            </li>
          </ol>

          <h3>Consecuencias principales</h3>
          <ul>
            <li>
              <strong>Dilatación temporal:</strong> Un reloj en movimiento avanza más despacio que uno en reposo.
              Se ha verificado experimentalmente con relojes atómicos en aviones y satélites GPS (el GPS necesita
              corregir este efecto para dar ubicaciones precisas).
            </li>
            <li>
              <strong>Contracción de longitud:</strong> Un objeto en movimiento parece más corto en la dirección
              del movimiento para un observador en reposo.
            </li>
            <li>
              <strong>Equivalencia masa-energía (E=mc²):</strong> La masa y la energía son formas equivalentes
              de la misma magnitud física. Una pequeña cantidad de masa se puede convertir en una cantidad enorme
              de energía.
            </li>
            <li>
              <strong>Simultaneidad relativa:</strong> Dos eventos simultáneos para un observador pueden no
              serlo para otro en movimiento relativo.
            </li>
          </ul>

          <h3>¿Es verificable?</h3>
          <p>
            Sí. La relatividad especial es una de las teorías más verificadas de la física. Evidencias directas:
            GPS (corrección de 7 μs/día de dilatación temporal), aceleradores de partículas (las partículas
            viven más tiempo cuanto más rápido van), muones cósmicos (llegan a la superficie terrestre cuando
            no deberían si no fuera por la dilatación temporal).
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-relatividad-especial')} />
      <ShareCard appName="visualizador-relatividad-especial" />
      <Footer appName="visualizador-relatividad-especial" />
    </div>
  );
}
