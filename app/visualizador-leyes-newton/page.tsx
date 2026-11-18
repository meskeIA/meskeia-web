'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './LeyesNewton.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';

// ─────────────────────────────────────────────
// Datos: ejemplos de inercia
// ─────────────────────────────────────────────

interface EjemploInercia {
  id: string;
  icono: string;
  nombre: string;
  detalle: string;
}

const EJEMPLOS_INERCIA: EjemploInercia[] = [
  {
    id: 'cinturon',
    icono: '🚗',
    nombre: 'Cinturón de seguridad',
    detalle: 'Cuando el coche frena bruscamente, tu cuerpo quiere seguir moviéndose hacia adelante (inercia). El cinturón aplica la fuerza de frenado a tu cuerpo de forma controlada. Sin él, tu inercia te lanzaría contra el salpicadero.',
  },
  {
    id: 'mantel',
    icono: '🍽️',
    nombre: 'Truco del mantel',
    detalle: 'Si tiras del mantel rápidamente, los platos permanecen en su sitio. Su inercia les hace "resistirse" al cambio. La clave es la velocidad: si tiras lento, la fricción arrastra los platos; si tiras rápido, la fricción no tiene tiempo de actuar.',
  },
  {
    id: 'autobus',
    icono: '🚌',
    nombre: 'Pasajero en autobús',
    detalle: 'Cuando el autobús frena, los pasajeros de pie se tambalean hacia adelante. Cuando arranca, hacia atrás. Tu cuerpo quiere mantener su estado de movimiento (o reposo), y el cambio brusco del vehículo te "deja atrás".',
  },
];

// ─────────────────────────────────────────────
// Datos: ejemplos de F=ma
// ─────────────────────────────────────────────

interface EjemploFma {
  objeto: string;
  masa: string;
  fuerza: string;
  aceleracion: string;
}

const EJEMPLOS_FMA: EjemploFma[] = [
  { objeto: 'Carrito vacío (10 kg)', masa: '10', fuerza: '50 N', aceleracion: '5,0 m/s²' },
  { objeto: 'Carrito lleno (50 kg)', masa: '50', fuerza: '50 N', aceleracion: '1,0 m/s²' },
  { objeto: 'Pelota fútbol (0,4 kg)', masa: '0,4', fuerza: '200 N', aceleracion: '500 m/s²' },
  { objeto: 'Bola bowling (7 kg)', masa: '7', fuerza: '200 N', aceleracion: '28,6 m/s²' },
];

// ─────────────────────────────────────────────
// Datos: ejemplos acción-reacción
// ─────────────────────────────────────────────

interface EjemploAR {
  id: string;
  icono: string;
  nombre: string;
  accion: string;
  reaccion: string;
  iconoIzq: string;
  iconoDer: string;
  labelIzq: string;
  labelDer: string;
}

const EJEMPLOS_AR: EjemploAR[] = [
  {
    id: 'cohete',
    icono: '🚀',
    nombre: 'Cohete espacial',
    accion: 'El motor expulsa gases a gran velocidad hacia abajo',
    reaccion: 'Los gases empujan el cohete hacia arriba con igual fuerza',
    iconoIzq: '🔥',
    iconoDer: '🚀',
    labelIzq: 'Gases ↓',
    labelDer: 'Cohete ↑',
  },
  {
    id: 'nadar',
    icono: '🏊',
    nombre: 'Nadar',
    accion: 'Tus manos empujan el agua hacia atrás',
    reaccion: 'El agua empuja tu cuerpo hacia adelante',
    iconoIzq: '🌊',
    iconoDer: '🏊',
    labelIzq: 'Agua ←',
    labelDer: 'Nadador →',
  },
  {
    id: 'caminar',
    icono: '🚶',
    nombre: 'Caminar',
    accion: 'Tu pie empuja el suelo hacia atrás',
    reaccion: 'El suelo empuja tu cuerpo hacia adelante',
    iconoIzq: '🦶',
    iconoDer: '🚶',
    labelIzq: 'Pie → suelo',
    labelDer: 'Suelo → tú',
  },
  {
    id: 'globo',
    icono: '🎈',
    nombre: 'Globo suelto',
    accion: 'El aire sale del globo en una dirección',
    reaccion: 'El globo vuela en dirección contraria',
    iconoIzq: '💨',
    iconoDer: '🎈',
    labelIzq: 'Aire ←',
    labelDer: 'Globo →',
  },
];

// ─────────────────────────────────────────────
// Datos curiosos
// ─────────────────────────────────────────────

interface DatoCurioso {
  icono: string;
  texto: string;
  valor?: string;
}

const DATOS_CURIOSOS: DatoCurioso[] = [
  { icono: '🍎', texto: 'La manzana probablemente NO le cayó en la cabeza a Newton' },
  { icono: '📖', texto: 'Principia Mathematica publicado en', valor: '1687' },
  { icono: '🌍', texto: 'Aceleración gravedad en Tierra:', valor: '9,8 m/s²' },
  { icono: '🚀', texto: 'Velocidad de escape terrestre:', valor: '11,2 km/s' },
  // Nombres de unidad con minúscula aunque vengan de un científico: RD 2032/2009, anexo, cap. III,
  // apartado 1.6 (BOE-A-2010-927). Hasta el 18/11/2026, «1 Newton» y «en Newtons» (hallazgo 5104)
  { icono: '⚖️', texto: '1 newton = fuerza para acelerar 1 kg a', valor: '1 m/s²' },
  { icono: '🏋️', texto: 'Tu peso (70 kg) en newtons:', valor: '~686 N' },
];

// ─────────────────────────────────────────────
// Simulación de la 1.ª ley
// ─────────────────────────────────────────────

/**
 * Las dos cajas salen con la MISMA velocidad: la del hielo la conserva (movimiento uniforme, sale
 * de la pista y seguiría) y la del asfalto frena con deceleración constante hasta pararse al 45 %
 * de la pista. Hasta el 18/11/2026 las dos iban con `transition: left 2s ease-out` (las dos frenaban,
 * con distinta velocidad inicial) y el segundo clic no reiniciaba la animación (hallazgos 5098 y 5099).
 */
const INERCIA_X0 = 10;          // px desde el borde izquierdo de la pista
const INERCIA_CRUCE_S = 2.5;    // segundos que tardaría la caja del hielo en cruzar la pista
const INERCIA_PARADA = 0.45;    // fracción de la pista en la que se para la del asfalto
const INERCIA_CAJA = 40;        // ancho de la caja, px

/** Posición (px) de cada caja a los t segundos del empujón, para una pista de `ancho` px. */
function posicionesInercia(t: number, ancho: number): { hielo: number; asfalto: number; fin: boolean } {
  const v0 = ancho / INERCIA_CRUCE_S;
  const dParada = INERCIA_PARADA * ancho;
  const a = (v0 * v0) / (2 * dParada);
  const tParada = v0 / a;
  const tc = Math.min(t, tParada);
  const hielo = INERCIA_X0 + v0 * t;
  const asfalto = INERCIA_X0 + v0 * tc - 0.5 * a * tc * tc;
  // Termina cuando la del asfalto se ha parado y la del hielo ha salido de la pista
  return { hielo, asfalto, fin: t >= tParada && hielo > ancho + INERCIA_CAJA };
}

// ─────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────

const TABS = [
  { id: 0, icono: '🛑', nombre: '1.ª Ley: Inercia' },
  { id: 1, icono: '⚡', nombre: '2.ª Ley: F = ma' },
  { id: 2, icono: '🔄', nombre: '3.ª Ley: Acción-Reacción' },
  { id: 3, icono: '📊', nombre: 'Newton en Números' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorLeyesNewtonPage() {
  const [tabActiva, setTabActiva] = useState(0);

  // Inercia: simulación (posiciones escritas en el DOM en cada fotograma, sin re-render)
  const [inerciaEjemplo, setInerciaEjemplo] = useState<string | null>(null);
  const pistaHieloRef = useRef<HTMLDivElement>(null);
  const cajaHieloRef = useRef<HTMLDivElement>(null);
  const cajaAsfaltoRef = useRef<HTMLDivElement>(null);
  const fotogramaRef = useRef<number | null>(null);

  // F=ma: sliders
  const [masa, setMasa] = useState(10);
  const [fuerza, setFuerza] = useState(100);

  // Acción-reacción: ejemplo seleccionado
  const [arEjemplo, setArEjemplo] = useState<string>(EJEMPLOS_AR[0].id);
  const [arAnimando, setArAnimando] = useState(false);

  const aceleracion = fuerza / masa;
  // La flecha rotulada «F = … N» mide la FUERZA: 200 px para el máximo del deslizador (1000 N), con
  // un mínimo de 4 px para que se vea. Hasta el 18/11/2026 medía 2·a px (hallazgo 5100)
  const vectorWidth = Math.max((fuerza / 1000) * 200, 4);

  const pararInercia = useCallback(() => {
    if (fotogramaRef.current !== null) cancelAnimationFrame(fotogramaRef.current);
    fotogramaRef.current = null;
  }, []);

  useEffect(() => pararInercia, [pararInercia]);

  const handleSimularInercia = useCallback(() => {
    pararInercia();
    const pista = pistaHieloRef.current;
    const hielo = cajaHieloRef.current;
    const asfalto = cajaAsfaltoRef.current;
    if (!pista || !hielo || !asfalto) return;
    const ancho = pista.clientWidth;
    const pintar = (p: { hielo: number; asfalto: number }) => {
      hielo.style.left = `${p.hielo}px`;
      asfalto.style.left = `${p.asfalto}px`;
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Sin animación: la del asfalto, donde se para; la del hielo, en el borde derecho
      const fin = posicionesInercia(Infinity, ancho);
      pintar({ hielo: ancho - INERCIA_CAJA - INERCIA_X0, asfalto: fin.asfalto });
      return;
    }
    pintar({ hielo: INERCIA_X0, asfalto: INERCIA_X0 });
    let t0: number | null = null;
    const paso = (ahora: number) => {
      // Si se cambió de pestaña, las cajas ya no están en la página
      if (!hielo.isConnected) {
        fotogramaRef.current = null;
        return;
      }
      if (t0 === null) t0 = ahora;
      const p = posicionesInercia((ahora - t0) / 1000, ancho);
      pintar(p);
      fotogramaRef.current = p.fin ? null : requestAnimationFrame(paso);
    };
    fotogramaRef.current = requestAnimationFrame(paso);
  }, [pararInercia]);

  // Pestañas con el patrón de la APG: flechas, Inicio y Fin (hallazgo 5107, 18/11/2026)
  const teclaPestana = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, actual: number) => {
    const n = TABS.length;
    let destino: number | null = null;
    if (e.key === 'ArrowRight') destino = (actual + 1) % n;
    else if (e.key === 'ArrowLeft') destino = (actual - 1 + n) % n;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = n - 1;
    if (destino === null) return;
    e.preventDefault();
    setTabActiva(destino);
    document.getElementById(`tab-newton-${destino}`)?.focus();
  }, []);

  const handleAnimarAR = useCallback(() => {
    setArAnimando(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setArAnimando(true);
        setTimeout(() => setArAnimando(false), 1200);
      });
    });
  }, []);

  const arActivo = EJEMPLOS_AR.find(e => e.id === arEjemplo)!;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <p className={styles.heroTag} aria-hidden="true">Mecánica Clásica</p>
          <h1 className={styles.title}>Las 3 Leyes de Newton</h1>
          <p className={styles.subtitle}>
            Inercia, F = m &times; a y acción-reacción: las leyes que describen el movimiento de los objetos cotidianos, explicadas con simulaciones interactivas.
          </p>
        </header>

        <LegalNotice />

        {/* Navegación por tabs */}
        <div className={styles.tabNav} role="tablist" aria-label="Secciones de las leyes de Newton">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`tab-newton-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={tabActiva === tab.id}
              // Solo se monta el panel activo: las demás pestañas no apuntan a un id inexistente
              aria-controls={tabActiva === tab.id ? `panel-newton-${tab.id}` : undefined}
              tabIndex={tabActiva === tab.id ? 0 : -1}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
              onKeyDown={e => teclaPestana(e, tab.id)}
            >
              <span className={styles.tabIcono} aria-hidden="true">{tab.icono}</span>
              <span className={styles.tabNombre}>{tab.nombre}</span>
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* TAB 0: Primera Ley - Inercia           */}
        {/* ═══════════════════════════════════════ */}
        {tabActiva === 0 && (
          <div className={styles.seccion} id="panel-newton-0" role="tabpanel" aria-labelledby="tab-newton-0">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🛑</span> Primera Ley: Inercia
            </h2>
            <p className={styles.seccionEnunciado}>
              &laquo;Un objeto en reposo permanece en reposo, y un objeto en movimiento
              permanece en movimiento rectilíneo uniforme, a menos que una fuerza externa
              actúe sobre él.&raquo;
            </p>

            {/* Simulación: con fricción vs sin fricción */}
            <div className={styles.simulacionWrapper}>
              <span className={styles.simulacionLabel}>Sin fricción (hielo)</span>
              <div className={styles.simulacionPista} ref={pistaHieloRef}>
                <div
                  ref={cajaHieloRef}
                  className={styles.simulacionObjeto}
                  style={{ left: `${INERCIA_X0}px`, background: '#2E86AB' }}
                  aria-hidden="true"
                >
                  📦
                </div>
              </div>
              <p className={styles.simulacionEtiqueta}>Sigue a velocidad constante: sale de la pista y seguiría indefinidamente</p>
            </div>

            <div className={styles.simulacionWrapper}>
              <span className={styles.simulacionLabel}>Con fricción (asfalto)</span>
              <div className={styles.simulacionPista}>
                <div
                  ref={cajaAsfaltoRef}
                  className={styles.simulacionObjeto}
                  style={{ left: `${INERCIA_X0}px`, background: '#e67e22' }}
                  aria-hidden="true"
                >
                  📦
                </div>
              </div>
              <p className={styles.simulacionEtiqueta}>Sale con la misma velocidad y la fricción la frena hasta pararla</p>
            </div>

            <button
              type="button"
              className={styles.btnSimular}
              onClick={handleSimularInercia}
              aria-label="Iniciar simulación de inercia"
            >
              <span aria-hidden="true">▶</span> Simular empujón
            </button>

            {/* Ejemplos clickables */}
            <h3 className={styles.simulacionLabel} style={{ marginTop: '1.5rem' }}>Ejemplos cotidianos</h3>
            <div className={styles.ejemplosGrid}>
              {EJEMPLOS_INERCIA.map(ej => (
                <button
                  key={ej.id}
                  type="button"
                  className={`${styles.ejemploCard} ${inerciaEjemplo === ej.id ? styles.ejemploCardActivo : ''}`}
                  onClick={() => setInerciaEjemplo(prev => prev === ej.id ? null : ej.id)}
                  aria-expanded={inerciaEjemplo === ej.id}
                >
                  <span className={styles.ejemploIcono} aria-hidden="true">{ej.icono}</span>
                  <span className={styles.ejemploNombre}>{ej.nombre}</span>
                </button>
              ))}
            </div>

            {inerciaEjemplo && (
              <div className={styles.ejemploDetalle}>
                {EJEMPLOS_INERCIA.find(e => e.id === inerciaEjemplo)?.detalle}
              </div>
            )}

            <div className={styles.insight}>
              <p>
                <strong>Dato:</strong> Newton no inventó estas leyes, las descubrió observando la naturaleza.
                La primera ley reformula la idea que Galileo ya había intuido medio siglo antes.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 1: Segunda Ley - F = m × a          */}
        {/* ═══════════════════════════════════════ */}
        {tabActiva === 1 && (
          <div className={styles.seccion} id="panel-newton-1" role="tabpanel" aria-labelledby="tab-newton-1">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">⚡</span> Segunda Ley: F = m &times; a
            </h2>
            <p className={styles.seccionEnunciado}>
              &laquo;La aceleración de un objeto es directamente proporcional a la fuerza neta
              que actúa sobre él e inversamente proporcional a su masa.&raquo;
            </p>

            {/* Sliders interactivos */}
            <div className={styles.slidersPanel}>
              <div className={styles.sliderGroup}>
                <label htmlFor="masa" className={styles.sliderLabel}>
                  <span>Masa (m)</span>
                  <span className={styles.sliderValue}>{formatNumber(masa, 0)} kg</span>
                </label>
                <input
                  id="masa"
                  type="range"
                  min={1}
                  max={100}
                  value={masa}
                  onChange={e => setMasa(Number(e.target.value))}
                  className={styles.slider}
                  aria-label={`Masa: ${masa} ${masa === 1 ? 'kilogramo' : 'kilogramos'}`}
                />
              </div>
              <div className={styles.sliderGroup}>
                <label htmlFor="fuerza" className={styles.sliderLabel}>
                  <span>Fuerza (F)</span>
                  <span className={styles.sliderValue}>{formatNumber(fuerza, 0)} N</span>
                </label>
                <input
                  id="fuerza"
                  type="range"
                  min={1}
                  max={1000}
                  value={fuerza}
                  onChange={e => setFuerza(Number(e.target.value))}
                  className={styles.slider}
                  aria-label={`Fuerza: ${fuerza} ${fuerza === 1 ? 'newton' : 'newtons'}`}
                />
              </div>
            </div>

            {/* Resultado */}
            <div className={styles.resultadoFma}>
              <div className={styles.formulaGrande}>
                F = m &times; a &nbsp;&rarr;&nbsp; a = F / m
              </div>
              {/* Región viva: quien mueve un deslizador con lector de pantalla oye la aceleración.
                  Hasta el 18/11/2026 solo oía la masa o la fuerza (hallazgo 5106) */}
              <div role="status" aria-live="polite" aria-atomic="true">
                <span className="sr-only">Aceleración: </span>
                <span className={styles.resultadoValor}>
                  {formatNumber(aceleracion, 2)}
                </span>
                <span className={styles.resultadoUnidad}>m/s²</span>
              </div>
            </div>

            {/* Vector visual */}
            <div className={styles.vectorVisual}>
              <span className={styles.vectorEtiquetaDer}>
                F = {formatNumber(fuerza, 0)} N
              </span>
              <div
                className={`${styles.vectorFlecha} ${styles.vectorFlechaDer}`}
                style={{ width: `${vectorWidth}px` }}
                aria-hidden="true"
              />
              <div className={styles.vectorObjeto} aria-hidden="true">📦</div>
            </div>

            {/* Tabla comparativa */}
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Objeto</th>
                  <th>Masa</th>
                  <th>Fuerza</th>
                  <th>Aceleración</th>
                </tr>
              </thead>
              <tbody>
                {EJEMPLOS_FMA.map((ej, i) => (
                  <tr key={i}>
                    <td>{ej.objeto}</td>
                    <td>{ej.masa} kg</td>
                    <td>{ej.fuerza}</td>
                    <td>{ej.aceleracion}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.insight}>
              <p>
                <strong>Clave:</strong> Si duplicas la masa, necesitas duplicar la fuerza para obtener
                la misma aceleración. Por eso una pelota de fútbol vuela más lejos que una bola de bowling
                con la misma patada.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 2: Tercera Ley - Acción y Reacción  */}
        {/* ═══════════════════════════════════════ */}
        {tabActiva === 2 && (
          <div className={styles.seccion} id="panel-newton-2" role="tabpanel" aria-labelledby="tab-newton-2">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🔄</span> Tercera Ley: Acción y Reacción
            </h2>
            <p className={styles.seccionEnunciado}>
              &laquo;Toda acción tiene una reacción igual y opuesta. Las fuerzas siempre
              aparecen en pares, pero actúan sobre objetos diferentes.&raquo;
            </p>

            {/* Ejemplos clickables */}
            <div className={styles.arEjemplosGrid}>
              {EJEMPLOS_AR.map(ej => (
                <button
                  key={ej.id}
                  type="button"
                  className={`${styles.arCard} ${arEjemplo === ej.id ? styles.arCardActivo : ''}`}
                  onClick={() => { setArEjemplo(ej.id); setArAnimando(false); }}
                  aria-pressed={arEjemplo === ej.id}
                >
                  <span className={styles.arIcono} aria-hidden="true">{ej.icono}</span>
                  <span className={styles.arNombre}>{ej.nombre}</span>
                  <span className={styles.arDesc}>{ej.accion}</span>
                </button>
              ))}
            </div>

            {/* Animación del ejemplo seleccionado */}
            <div className={styles.arAnimacion}>
              <div
                className={styles.arBloqueIzq}
                style={{ transform: arAnimando ? 'translateX(-30px)' : 'translateX(0)' }}
              >
                <span aria-hidden="true">{arActivo.iconoIzq}</span>
                <span className={styles.arBloqueLabel}>{arActivo.labelIzq}</span>
              </div>
              {/* La acción es la fuerza sobre el cuerpo de la izquierda (gases, agua, suelo, aire), que
                  se va a la izquierda al animar; la reacción, sobre el de la derecha. Hasta el
                  18/11/2026 las flechas estaban al revés (hallazgo 5102) */}
              <div className={styles.arFlechas}>
                <span className={styles.arFlechaAccion} aria-hidden="true">← acción</span>
                <span className={styles.arFlechaReaccion} aria-hidden="true">→ reacción</span>
              </div>
              <div
                className={styles.arBloqueDer}
                style={{ transform: arAnimando ? 'translateX(30px)' : 'translateX(0)' }}
              >
                <span aria-hidden="true">{arActivo.iconoDer}</span>
                <span className={styles.arBloqueLabel}>{arActivo.labelDer}</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.btnSimular}
              onClick={handleAnimarAR}
              aria-label="Animar acción y reacción"
            >
              <span aria-hidden="true">▶</span> Animar
            </button>

            <div className={styles.ejemploDetalle} style={{ marginTop: '1rem' }}>
              <strong>Acción:</strong> {arActivo.accion}
              <br />
              <strong>Reacción:</strong> {arActivo.reaccion}
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Clave:</strong> Las fuerzas <em>siempre</em> vienen en pares, pero actúan sobre objetos
                diferentes. El cohete empuja los gases y los gases empujan al cohete — cada fuerza actúa
                sobre un objeto distinto, por eso no se anulan.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 3: Newton en Números                */}
        {/* ═══════════════════════════════════════ */}
        {tabActiva === 3 && (
          <div className={styles.seccion} id="panel-newton-3" role="tabpanel" aria-labelledby="tab-newton-3">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">📊</span> Newton en Números
            </h2>

            {/* Grid de datos curiosos */}
            <div className={styles.datosGrid}>
              {DATOS_CURIOSOS.map((d, i) => (
                <div key={i} className={styles.datoCard}>
                  <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
                  <span className={styles.datoTexto}>
                    {d.texto}
                    {d.valor && (
                      <>
                        {' '}<span className={styles.datoValor}>{d.valor}</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <h3 className={styles.simulacionLabel}>Evolución de la mecánica</h3>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <span className={styles.timelineAnio}>1632</span>
                <span className={styles.timelineNombre}>Galileo</span>
                <span className={styles.timelineDesc}>Diálogo sobre los dos máximos sistemas del mundo</span>
              </div>
              <span className={styles.timelineFlecha} aria-hidden="true">→</span>
              <div className={styles.timelineItem}>
                <span className={styles.timelineAnio}>1687</span>
                <span className={styles.timelineNombre}>Newton</span>
                <span className={styles.timelineDesc}>Principia Mathematica: las 3 leyes del movimiento</span>
              </div>
              <span className={styles.timelineFlecha} aria-hidden="true">→</span>
              <div className={styles.timelineItem}>
                <span className={styles.timelineAnio}>1905</span>
                <span className={styles.timelineNombre}>Einstein</span>
                <span className={styles.timelineDesc}>Relatividad especial: E = mc² y límites de Newton</span>
              </div>
            </div>

            {/* Comparativa Newton vs Einstein */}
            <h3 className={styles.simulacionLabel}>Newton vs Einstein</h3>
            <div className={styles.comparativa}>
              <div className={styles.comparativaCard}>
                <span className={styles.comparativaIcono} aria-hidden="true">🍎</span>
                <span className={styles.comparativaTitulo}>Newton (mecánica clásica)</span>
                <ul className={styles.comparativaLista}>
                  <li>Velocidades mucho menores que la luz</li>
                  <li>Objetos cotidianos y terrestres</li>
                  <li>Gravedad como fuerza a distancia</li>
                  <li>Espacio y tiempo absolutos</li>
                  <li>Precisión suficiente para ingeniería</li>
                </ul>
              </div>
              <div className={styles.comparativaCard}>
                <span className={styles.comparativaIcono} aria-hidden="true">🌌</span>
                <span className={styles.comparativaTitulo}>Einstein (relatividad)</span>
                <ul className={styles.comparativaLista}>
                  <li>Velocidades cercanas a la luz</li>
                  <li>Masas enormes y escalas cósmicas (relatividad general)</li>
                  <li>Gravedad como curvatura del espacio-tiempo</li>
                  <li>Espacio y tiempo relativos al observador</li>
                  <li>Necesario para GPS, partículas y cosmología</li>
                </ul>
              </div>
            </div>
            <p className={styles.simulacionEtiqueta}>
              La escala atómica y subatómica no es terreno de Einstein: ahí rige la mecánica cuántica.
            </p>

            <div className={styles.insight}>
              <p>
                <strong>Dato:</strong> durante la Gran Plaga de Londres (1665-1666), con la Universidad de
                Cambridge cerrada, Newton avanzó el cálculo infinitesimal, la óptica y sus primeras ideas sobre la
                gravitación y el movimiento. Las tres leyes, tal como se enseñan, las enunció después: en De motu
                (1684) y en los Principia (1687).
              </p>
            </div>
          </div>
        )}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="Profundiza en las leyes de Newton"
          subtitle="Mecánica clásica, formulación matemática y aplicaciones"
          defaultOpen={false}
        >
          <h3>La Primera Ley y sus matices</h3>
          <p>
            La primera ley parece obvia, pero fue revolucionaria. Aristóteles creía que los objetos necesitaban
            una fuerza continua para moverse. Galileo demostró lo contrario con planos inclinados: si
            eliminas la fricción, un objeto se mueve indefinidamente. Newton formalizó esto como ley.
            La primera ley define los <strong>sistemas de referencia inerciales</strong>: aquellos en los que
            un objeto libre de fuerzas no acelera. La superficie terrestre es un sistema inercial
            &ldquo;aproximado&rdquo; (la rotación de la Tierra introduce pequeñas fuerzas ficticias como la
            fuerza de Coriolis).
          </p>

          <h3>F = ma: más profundo de lo que parece</h3>
          <p>
            La formulación original de Newton no era F = ma, sino F = dp/dt (fuerza = variación del momento
            lineal en el tiempo). El momento lineal p = m &times; v. Cuando la masa es constante,
            dp/dt = m &times; dv/dt = m &times; a — y recuperamos F = ma. La formulación con momento es la
            que se generaliza (también a la relatividad), pero ojo con aplicarla a un cuerpo que gana o pierde
            masa: F = dp/dt vale para un sistema cerrado, como el cohete junto con los gases que expulsa. Para
            el cohete por separado se usa la ecuación del cohete (Meshchersky), m &times; dv/dt = F<sub>ext</sub> + u<sub>rel</sub>
            &times; dm/dt, que lleva a la de Tsiolkovski: Δv = u &times; ln(m<sub>0</sub>/m). Un cohete de
            1000 kg que expulsa 100 kg a 2000 m/s gana unos 211 m/s; aplicar d(mv)/dt = 0 al cohete solo daría,
            mal, que no se mueve.
          </p>

          <h3>Tercera Ley y los pares de fuerzas</h3>
          <p>
            El error más común es pensar que acción y reacción se anulan. No se anulan porque actúan sobre
            objetos <strong>diferentes</strong>. Cuando empujas una pared, la pared te empuja a ti con la
            misma fuerza: por eso sientes resistencia. Si estuvieras en una superficie sin fricción (patines
            sobre hielo), empujar la pared te enviaría hacia atrás — la reacción de la pared te acelera a ti.
            La tercera ley es fundamental para entender la propulsión a chorro, los cohetes y todo sistema
            donde se expulsa masa para ganar velocidad.
          </p>

          <h3>Limitaciones de las leyes de Newton</h3>
          <p>
            Las leyes de Newton funcionan perfectamente para objetos cotidianos a velocidades normales. Pero
            fallan en tres regímenes: a velocidades cercanas a la luz (necesitas relatividad especial),
            con masas enormes como estrellas y galaxias (necesitas relatividad general), y a escalas
            subatómicas (necesitas mecánica cuántica). Para todo lo demás — ingeniería, arquitectura,
            deportes, conducción — Newton es más que suficiente.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> Los valores numéricos (constantes, aceleraciones) corresponden a
            condiciones estándar. Las simulaciones son simplificaciones pedagógicas que ilustran los
            principios sin incluir todos los factores reales (resistencia del aire, deformaciones, etc.).
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="visualizador-leyes-newton" />
        <Footer appName="visualizador-leyes-newton" />
    </div>
  );
}
