'use client';
// @disclaimer: exempt
import { useState, useCallback } from 'react';
import styles from './VisualizadorMecanicaCuantica.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EstadoGato = 'superposicion' | 'vivo' | 'muerto';

interface EjemploIncertidumbre {
  nombre: string;
  icono: string;
  descripcion: string;
  nivelCertezaPosicion: number;
}

// ─── Datos ────────────────────────────────────────────────────────────────────

const EJEMPLOS_INCERTIDUMBRE: EjemploIncertidumbre[] = [
  {
    nombre: 'Electrón en átomo',
    icono: '⚛️',
    descripcion:
      'El electrón tiene momento bien definido (nivel de energía fijo), pero su posición es completamente difusa: existe como una nube de probabilidad alrededor del núcleo.',
    nivelCertezaPosicion: 5,
  },
  {
    nombre: 'Partícula de polvo',
    icono: '🌫️',
    descripcion:
      'Una partícula de polvo de 1 µm tiene incertidumbre en velocidad de apenas 10⁻¹⁷ m/s, completamente inapreciable. A esta escala la mecánica clásica es suficiente.',
    nivelCertezaPosicion: 70,
  },
  {
    nombre: 'Pelota de tenis',
    icono: '🎾',
    descripcion:
      'La incertidumbre cuántica en posición de una pelota de tenis es 10⁻³⁴ m, mucho menor que el núcleo de un átomo. La física cuántica no tiene efecto observable.',
    nivelCertezaPosicion: 95,
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function VisualizadorMecanicaCuantica() {
  // Sección 1: Dualidad onda-partícula
  const [observando, setObservando] = useState<boolean>(false);

  // Sección 2: Principio de incertidumbre
  const [certezaPosicion, setCertezaPosicion] = useState<number>(50);
  const certezaMomento = 100 - certezaPosicion;

  // Sección 3: Gato de Schrödinger
  const [estadoGato, setEstadoGato] = useState<EstadoGato>('superposicion');
  const [abriendo, setAbriendo] = useState<boolean>(false);

  // Sección 4: Efecto túnel
  const [alturaBarrera, setAlturaBarrera] = useState<number>(50);

  // Ejemplo seleccionado en incertidumbre
  const [ejemploSeleccionado, setEjemploSeleccionado] = useState<number>(0);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleObservar = useCallback(() => {
    setObservando((prev) => !prev);
  }, []);

  const handleAbrirCaja = useCallback(() => {
    if (estadoGato !== 'superposicion' || abriendo) return;
    setAbriendo(true);
    setTimeout(() => {
      const resultado: EstadoGato = Math.random() < 0.5 ? 'vivo' : 'muerto';
      setEstadoGato(resultado);
      setAbriendo(false);
    }, 800);
  }, [estadoGato, abriendo]);

  const handleReiniciarGato = useCallback(() => {
    setEstadoGato('superposicion');
  }, []);

  const handleCertezaPosicion = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCertezaPosicion(Number(e.target.value));
      setEjemploSeleccionado(-1);
    },
    []
  );

  const handleEjemplo = useCallback((idx: number) => {
    setEjemploSeleccionado(idx);
    setCertezaPosicion(EJEMPLOS_INCERTIDUMBRE[idx].nivelCertezaPosicion);
  }, []);

  // ── Cálculos visuales ────────────────────────────────────────────────────────

  // Elipse en el espacio de fases: semieje X proporcional a incertidumbre en posición
  const semiejeX = 20 + (certezaMomento / 100) * 80;
  const semiejeY = 20 + (certezaPosicion / 100) * 80;

  // Probabilidad de efecto túnel (inversamente proporcional a la barrera)
  const probTunel = Math.max(2, Math.round(100 - alturaBarrera * 0.95));

  // Texto descriptivo de la barrera
  const descripcionBarrera =
    alturaBarrera < 30
      ? 'Barrera baja — efecto túnel frecuente'
      : alturaBarrera < 70
      ? 'Barrera media — efecto túnel ocasional'
      : 'Barrera alta — efecto túnel muy improbable';

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge} aria-hidden="true">
            ⚛️
          </span>
          <h1 className={styles.heroTitle}>Mecánica Cuántica</h1>
          <p className={styles.heroSubtitle}>
            Dualidad onda-partícula · Principio de incertidumbre · Superposición · Efecto túnel
          </p>
          <p className={styles.heroDesc}>
            Los fenómenos más extraños del universo, explicados con animaciones interactivas. Sin
            ecuaciones, con intuición.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* ── Sección 1: Dualidad onda-partícula ── */}
      <section className={styles.section} aria-labelledby="sec1-titulo">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon} aria-hidden="true">
            〰️
          </span>
          <div>
            <h2 id="sec1-titulo" className={styles.sectionTitle}>
              Dualidad onda-partícula
            </h2>
            <p className={styles.sectionSubtitle}>
              Los electrones son onda y partícula al mismo tiempo — dependiendo de si los observamos
            </p>
          </div>
        </div>

        <div className={styles.dualidadWrapper}>
          {/* Panel de animación */}
          <div className={styles.dualidadVisualizacion}>
            <div className={styles.dualidadPantalla} aria-label="Animación de dualidad onda-partícula">
              {/* Electrón como onda */}
              <div
                className={`${styles.electronOnda} ${observando ? styles.ondaColapsada : styles.ondaExpandida}`}
                aria-hidden="true"
              />
              {/* Electrón como punto */}
              <div
                className={`${styles.electronPunto} ${observando ? styles.puntoVisible : styles.puntoOculto}`}
                aria-hidden="true"
              />
              {/* Etiqueta de estado */}
              <div className={styles.estadoLabel} role="status" aria-live="polite">
                {observando ? (
                  <><span aria-hidden="true">🔬</span>{' '}Partícula localizada</>
                ) : (
                  <><span aria-hidden="true">〰️</span>{' '}Función de onda</>
                )}
              </div>
            </div>

            <button
              type="button"
              className={`${styles.btnPrimario} ${observando ? styles.btnObservando : ''}`}
              onClick={handleObservar}
              aria-pressed={observando}
            >
              <span aria-hidden="true">{observando ? '🔭' : '🔬'}</span>{' '}
              {observando ? 'Dejar de observar' : 'Observar el electrón'}
            </button>
          </div>

          {/* Experimento doble rendija */}
          <div className={styles.dobleRendija}>
            <h3 className={styles.subSeccionTitulo}>Experimento de doble rendija</h3>
            <div className={styles.rendijaDiagrama} aria-label="Diagrama del experimento de doble rendija">
              {/* Pantalla de impactos */}
              <div className={styles.rendijaImpactos}>
                {!observando ? (
                  /* Patrón de interferencia (franjas) */
                  <>
                    <div className={styles.franjaBrillante} style={{ top: '5%' }} aria-hidden="true" />
                    <div className={styles.franjaOscura} style={{ top: '15%' }} aria-hidden="true" />
                    <div className={styles.franjaBrillante} style={{ top: '25%' }} aria-hidden="true" />
                    <div className={styles.franjaOscura} style={{ top: '35%' }} aria-hidden="true" />
                    <div className={styles.franjaBrillante} style={{ top: '45%' }} aria-hidden="true" />
                    <div className={styles.franjaOscura} style={{ top: '55%' }} aria-hidden="true" />
                    <div className={styles.franjaBrillante} style={{ top: '65%' }} aria-hidden="true" />
                    <div className={styles.franjaOscura} style={{ top: '75%' }} aria-hidden="true" />
                    <div className={styles.franjaBrillante} style={{ top: '85%' }} aria-hidden="true" />
                  </>
                ) : (
                  /* Dos bandas clásicas */
                  <>
                    <div className={styles.bandaClasica} style={{ top: '15%' }} aria-hidden="true" />
                    <div className={styles.bandaClasica} style={{ top: '65%' }} aria-hidden="true" />
                  </>
                )}
              </div>
            </div>
            <p className={styles.rendijaEtiqueta} role="status" aria-live="polite">
              {observando
                ? 'Con observación → dos bandas (comportamiento de partícula)'
                : 'Sin observación → patrón de interferencia (comportamiento de onda)'}
            </p>
          </div>
        </div>

        <div className={styles.explicacion}>
          <h3 className={styles.explicacionTitulo}>¿Qué significa realmente «medir»?</h3>
          <p className={styles.explicacionTexto}>
            «Observar» no requiere un humano mirando: cualquier{' '}
            <strong>interacción con el entorno</strong> (un fotón, otro electrón, un detector)
            colapsa la función de onda. El mundo cuántico es frágil ante cualquier perturbación. Por
            eso los ordenadores cuánticos deben operar a temperaturas cercanas al cero absoluto:
            para aislar los qubits del entorno y preservar la superposición.
          </p>
        </div>
      </section>

      {/* ── Sección 2: Principio de incertidumbre ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="sec2-titulo">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon} aria-hidden="true">
            📐
          </span>
          <div>
            <h2 id="sec2-titulo" className={styles.sectionTitle}>
              Principio de incertidumbre de Heisenberg
            </h2>
            <p className={styles.sectionSubtitle}>
              Cuanto más conoces la posición de una partícula, menos puedes saber su velocidad, y
              viceversa
            </p>
          </div>
        </div>

        <div className={styles.incertidumbreWrapper}>
          {/* Controles de sliders */}
          <div className={styles.incertidumbreControles}>
            <div className={styles.sliderGrupo}>
              <label htmlFor="slider-posicion" className={styles.sliderLabel}>
                Certeza en posición (Δx)
              </label>
              <input
                id="slider-posicion"
                type="range"
                min={0}
                max={100}
                value={certezaPosicion}
                onChange={handleCertezaPosicion}
                className={styles.slider}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={certezaPosicion}
                aria-label={`Certeza en posición: ${certezaPosicion}%`}
              />
              <div className={styles.sliderValores}>
                <span className={styles.sliderValorBajo}>Difusa</span>
                <span className={styles.sliderValorActual}>{certezaPosicion}%</span>
                <span className={styles.sliderValorAlto}>Precisa</span>
              </div>
            </div>

            <div className={styles.incertidumbreFlecha} aria-hidden="true">
              ↕
            </div>

            <div className={styles.sliderGrupo}>
              <label className={styles.sliderLabel}>Certeza en momento (Δp)</label>
              <div className={styles.sliderBarraInversa}>
                <div
                  className={styles.sliderBarraRelleno}
                  style={{ width: `${certezaMomento}%` }}
                  role="progressbar"
                  aria-valuenow={certezaMomento}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Certeza en momento: ${certezaMomento}%`}
                />
              </div>
              <div className={styles.sliderValores}>
                <span className={styles.sliderValorBajo}>Difusa</span>
                <span className={styles.sliderValorActual}>{certezaMomento}%</span>
                <span className={styles.sliderValorAlto}>Precisa</span>
              </div>
            </div>

            <div className={styles.relacionFormula} aria-label="Principio de Heisenberg">
              Δx · Δp ≥ ℏ/2
            </div>
          </div>

          {/* Elipse en espacio de fases */}
          <div className={styles.espacioFases} aria-label="Visualización del espacio de fases">
            <svg
              viewBox="0 0 200 200"
              className={styles.espacioFasesSvg}
              aria-hidden="true"
              focusable="false"
            >
              {/* Ejes */}
              <line x1="10" y1="100" x2="190" y2="100" stroke="var(--text-muted)" strokeWidth="1" />
              <line x1="100" y1="10" x2="100" y2="190" stroke="var(--text-muted)" strokeWidth="1" />
              <text x="185" y="95" fontSize="10" fill="var(--text-muted)">
                x
              </text>
              <text x="105" y="18" fontSize="10" fill="var(--text-muted)">
                p
              </text>
              {/* Elipse */}
              <ellipse
                cx="100"
                cy="100"
                rx={semiejeX * 0.8}
                ry={semiejeY * 0.8}
                fill="rgba(46,134,171,0.15)"
                stroke="var(--primary)"
                strokeWidth="2"
              />
            </svg>
            <p className={styles.espacioFasesEtiqueta}>
              Región de incertidumbre en el espacio de fases
            </p>
          </div>
        </div>

        {/* Ejemplos ilustrativos */}
        <div className={styles.ejemplosWrapper}>
          <h3 className={styles.subSeccionTitulo}>Ejemplos intuitivos</h3>
          <div className={styles.ejemplosGrid}>
            {EJEMPLOS_INCERTIDUMBRE.map((ej, idx) => (
              <button
                key={ej.nombre}
                type="button"
                className={`${styles.ejemploCard} ${ejemploSeleccionado === idx ? styles.ejemploActivo : ''}`}
                onClick={() => handleEjemplo(idx)}
                aria-pressed={ejemploSeleccionado === idx}
              >
                <span className={styles.ejemploIcono} aria-hidden="true">
                  {ej.icono}
                </span>
                <span className={styles.ejemploNombre}>{ej.nombre}</span>
              </button>
            ))}
          </div>
          {ejemploSeleccionado >= 0 && (
            <div className={styles.ejemploDetalle} role="region" aria-live="polite">
              <p className={styles.ejemploTexto}>
                {EJEMPLOS_INCERTIDUMBRE[ejemploSeleccionado].descripcion}
              </p>
            </div>
          )}
        </div>

        <div className={styles.explicacion}>
          <h3 className={styles.explicacionTitulo}>No es un límite del instrumento</h3>
          <p className={styles.explicacionTexto}>
            El principio de Heisenberg <strong>no dice</strong> que nuestros microscopios sean
            imperfectos. Dice que la naturaleza misma es así: una partícula <em>no tiene</em>{' '}
            simultáneamente posición y velocidad perfectamente definidas. Si conocieras la posición
            exacta de un electrón, su velocidad sería absolutamente indeterminada — no como
            ignorancia nuestra, sino como realidad física.
          </p>
        </div>
      </section>

      {/* ── Sección 3: Gato de Schrödinger ── */}
      <section className={styles.section} aria-labelledby="sec3-titulo">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon} aria-hidden="true">
            🐱
          </span>
          <div>
            <h2 id="sec3-titulo" className={styles.sectionTitle}>
              Superposición y el gato de Schrödinger
            </h2>
            <p className={styles.sectionSubtitle}>
              Un sistema cuántico puede estar en múltiples estados a la vez hasta que lo medimos
            </p>
          </div>
        </div>

        <div className={styles.gatoWrapper}>
          {/* Caja */}
          <div className={styles.gatoVisualizacion}>
            <div
              className={`${styles.cajaCuantica} ${estadoGato === 'superposicion' ? styles.cajaFascinante : ''}`}
              aria-label={
                estadoGato === 'superposicion'
                  ? 'Caja cerrada: el gato está en superposición (vivo y muerto simultáneamente)'
                  : estadoGato === 'vivo'
                  ? 'Caja abierta: el gato está vivo'
                  : 'Caja abierta: el gato está muerto'
              }
            >
              {estadoGato === 'superposicion' && (
                <div className={styles.superposicionContenido} aria-hidden="true">
                  <span className={styles.gatoSuperposicion}>🐱</span>
                  <span className={styles.gatoSuperposicionFantasma}>👻</span>
                  <div className={styles.superposicionLabel}>Vivo + Muerto</div>
                </div>
              )}
              {estadoGato === 'vivo' && (
                <div className={styles.gatoResultado} aria-hidden="true">
                  <span className={styles.gatoEmoji}>🐱</span>
                  <div className={styles.gatoResultadoLabel} style={{ color: '#4CAF50' }}>
                    ¡Vivo!
                  </div>
                </div>
              )}
              {estadoGato === 'muerto' && (
                <div className={styles.gatoResultado} aria-hidden="true">
                  <span className={styles.gatoEmoji}>💀</span>
                  <div className={styles.gatoResultadoLabel} style={{ color: '#f44336' }}>
                    Muerto
                  </div>
                </div>
              )}
              {abriendo && (
                <div className={styles.abriendo} aria-label="Abriendo la caja..." aria-live="polite">
                  ⟳
                </div>
              )}
            </div>

            <div className={styles.gatoBotones}>
              {estadoGato === 'superposicion' && (
                <button
                  type="button"
                  className={styles.btnPrimario}
                  onClick={handleAbrirCaja}
                  disabled={abriendo}
                  aria-busy={abriendo}
                >
                  <span aria-hidden="true">{abriendo ? '⟳' : '📦'}</span>{' '}
                  {abriendo ? 'Abriendo...' : 'Abrir la caja'}
                </button>
              )}
              {estadoGato !== 'superposicion' && (
                <button type="button" className={styles.btnSecundario} onClick={handleReiniciarGato}>
                  <span aria-hidden="true">🔄</span>{' '}
                  Cerrar y reiniciar
                </button>
              )}
            </div>

            <p className={styles.gatoEstadoTexto} role="status" aria-live="polite">
              {estadoGato === 'superposicion' &&
                'Estado actual: superposición cuántica (50% vivo + 50% muerto)'}
              {estadoGato === 'vivo' && 'Colapso de función de onda → resultado: vivo'}
              {estadoGato === 'muerto' && 'Colapso de función de onda → resultado: muerto'}
            </p>
          </div>

          {/* Explicación */}
          <div className={styles.gatoExplicacion}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitulo}>¿Por qué lo inventó Schrödinger?</h3>
              <p className={styles.infoCardTexto}>
                En 1935, Erwin Schrödinger propuso este experimento para{' '}
                <strong>ridiculizar la interpretación de Copenhague</strong>. Si las partículas están
                en superposición hasta que se miden, y si encadenamos el estado de un átomo radiactivo
                (que sí está en superposición) a un mecanismo que mata al gato, ¿también el gato
                debería estar en superposición?
              </p>
              <p className={styles.infoCardTexto}>
                La respuesta moderna es que la <em>decoherencia</em> — la interacción del sistema con
                el entorno macroscópico — destruye la superposición instantáneamente a escalas
                ordinarias. El gato nunca estuvo realmente en superposición.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitulo}>Conexión con computación cuántica</h3>
              <p className={styles.infoCardTexto}>
                Un <strong>qubit</strong> puede estar en superposición de 0 y 1 simultáneamente —
                exactamente como el gato en la caja. Un ordenador cuántico con 300 qubits en
                superposición puede explorar 2³⁰⁰ estados al mismo tiempo, más que el número de
                átomos en el universo observable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 4: Efecto túnel ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="sec4-titulo">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon} aria-hidden="true">
            🚧
          </span>
          <div>
            <h2 id="sec4-titulo" className={styles.sectionTitle}>
              Efecto túnel cuántico
            </h2>
            <p className={styles.sectionSubtitle}>
              Las partículas pueden atravesar barreras que clásicamente serían infranqueables
            </p>
          </div>
        </div>

        <div className={styles.tunelWrapper}>
          {/* Visualización comparativa */}
          <div className={styles.tunelComparacion}>
            {/* Caso clásico */}
            <div className={styles.tunelCaso}>
              <h3 className={styles.tunelCasoTitulo}>Física clásica</h3>
              <div
                className={styles.tunelAnimacion}
                aria-label="En física clásica la partícula siempre rebota contra la barrera"
              >
                <div className={styles.tunelBarrera} style={{ height: `${alturaBarrera}%` }} aria-hidden="true" />
                <div className={styles.particulaClasica} aria-hidden="true" />
                <div className={styles.tunelRebote} aria-hidden="true">↩</div>
              </div>
              <p className={styles.tunelDesc}>La partícula siempre rebota. Sin excepciones.</p>
            </div>

            {/* Caso cuántico */}
            <div className={styles.tunelCaso}>
              <h3 className={styles.tunelCasoTitulo}>Mecánica cuántica</h3>
              <div
                className={styles.tunelAnimacion}
                aria-label={`En mecánica cuántica la partícula tiene ${probTunel}% de probabilidad de atravesar la barrera`}
              >
                <div className={styles.tunelBarrera} style={{ height: `${alturaBarrera}%` }} aria-hidden="true" />
                <div className={styles.particulaCuantica} aria-hidden="true" />
                <div
                  className={styles.tunelProbabilidad}
                  style={{ opacity: probTunel / 100 }}
                  aria-hidden="true"
                >
                  ✓
                </div>
              </div>
              <p className={styles.tunelDesc}>
                Probabilidad de atravesar: <strong>{probTunel}%</strong>
              </p>
            </div>
          </div>

          {/* Slider de barrera */}
          <div className={styles.tunelControl}>
            <label htmlFor="slider-barrera" className={styles.sliderLabel}>
              Altura de la barrera de energía
            </label>
            <input
              id="slider-barrera"
              type="range"
              min={5}
              max={95}
              value={alturaBarrera}
              onChange={(e) => setAlturaBarrera(Number(e.target.value))}
              className={styles.slider}
              aria-valuemin={5}
              aria-valuemax={95}
              aria-valuenow={alturaBarrera}
              aria-label={`Altura de barrera: ${alturaBarrera}%`}
            />
            <p className={styles.tunelDescBarrera} role="status" aria-live="polite">
              {descripcionBarrera}
            </p>
          </div>

          {/* Aplicaciones reales */}
          <div className={styles.aplicacionesGrid}>
            <h3 className={styles.subSeccionTitulo}>Aplicaciones reales del efecto túnel</h3>
            <div className={styles.aplicacionesCards}>
              <div className={styles.aplicacionCard}>
                <span className={styles.aplicacionIcono} aria-hidden="true">
                  💻
                </span>
                <h4 className={styles.aplicacionTitulo}>Transistores modernos</h4>
                <p className={styles.aplicacionTexto}>
                  A escala nanométrica (7 nm, 5 nm, 3 nm), los electrones pueden escapar por efecto
                  túnel. Es uno de los límites físicos fundamentales de la miniaturización de chips.
                </p>
              </div>
              <div className={styles.aplicacionCard}>
                <span className={styles.aplicacionIcono} aria-hidden="true">
                  🔬
                </span>
                <h4 className={styles.aplicacionTitulo}>Microscopio de efecto túnel (STM)</h4>
                <p className={styles.aplicacionTexto}>
                  Una punta metálica se acerca a la superficie a 1 nm de distancia. La corriente
                  eléctrica que fluye por efecto túnel permite obtener imágenes de átomos
                  individuales. Premio Nobel de Física 1986.
                </p>
              </div>
              <div className={styles.aplicacionCard}>
                <span className={styles.aplicacionIcono} aria-hidden="true">
                  ☀️
                </span>
                <h4 className={styles.aplicacionTitulo}>Fusión nuclear en el Sol</h4>
                <p className={styles.aplicacionTexto}>
                  Los protones del núcleo solar no tienen suficiente energía clásica para vencer la
                  repulsión electromagnética. El Sol brilla gracias al efecto túnel que permite la
                  fusión a temperaturas menores de las necesarias clásicamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Los Fundamentos de la Mecánica Cuántica"
        subtitle="Por qué el mundo subatómico no funciona como la física que vemos a escala humana"
      >
        <div>
          <h3>¿Qué es la mecánica cuántica?</h3>
          <p>
            La mecánica cuántica es la teoría física que describe el comportamiento de la materia y
            la energía a escalas muy pequeñas: átomos, electrones, fotones y otras partículas
            subatómicas. Es la teoría más precisa y mejor verificada de la historia de la ciencia —
            y también la más contraintuitiva.
          </p>
          <p>
            Surgió a principios del siglo XX cuando los físicos descubrieron que las ecuaciones de
            Newton fallaban a escala microscópica. Planck, Einstein, Bohr, Heisenberg, Schrödinger,
            Dirac y Born son los nombres asociados a la revolución cuántica entre 1900 y 1930.
          </p>
          <h3>Las cuatro ideas centrales de este visualizador</h3>
          <ul>
            <li>
              <strong>Dualidad onda-partícula</strong>: toda partícula tiene propiedades de onda y
              de partícula. Cuál de las dos observamos depende del tipo de experimento.
            </li>
            <li>
              <strong>Principio de incertidumbre</strong>: hay pares de propiedades (como posición y
              momento) que no pueden conocerse simultáneamente con precisión arbitraria. No es
              ignorancia — es la naturaleza.
            </li>
            <li>
              <strong>Superposición</strong>: un sistema cuántico puede existir en múltiples estados
              a la vez hasta que interactúa con el entorno (medición o decoherencia).
            </li>
            <li>
              <strong>Efecto túnel</strong>: las partículas tienen una probabilidad no nula de
              atravesar barreras de energía que clásicamente serían infranqueables, gracias a la
              naturaleza ondulatoria de su función de onda.
            </li>
          </ul>
          <h3>¿Por qué no vemos estos efectos en la vida cotidiana?</h3>
          <p>
            A escala macroscópica, los efectos cuánticos son imperceptibles por dos razones: la{' '}
            <em>decoherencia</em> (el entorno destruye rápidamente las superposiciones y la
            interferencia) y el <em>principio de correspondencia</em> (en el límite de muchas
            partículas o energías grandes, la mecánica cuántica se reduce a la mecánica clásica de
            Newton). Una pelota no se comporta como onda porque su longitud de onda de Broglie es
            10³⁰ veces más pequeña que un protón.
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-mecanica-cuantica')} />
      <ShareCard appName="visualizador-mecanica-cuantica" />
      <Footer appName="visualizador-mecanica-cuantica" />
    </div>
  );
}
