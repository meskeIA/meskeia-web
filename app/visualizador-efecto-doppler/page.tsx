'use client';
// @disclaimer: exempt
import { useState, useEffect, useRef } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './EfectoDoppler.module.css';

type Tab = 'efecto' | 'slider' | 'aplicaciones' | 'cosmos';

const V_SONIDO = 343; // m/s
const F_FUENTE = 440; // Hz (La4)
const C_LUZ = 299792; // km/s

function calcularFrecuencia(vFuente: number, acercandose: boolean): number {
  if (acercandose) {
    if (vFuente >= V_SONIDO) return Infinity;
    return F_FUENTE * V_SONIDO / (V_SONIDO - vFuente);
  }
  return F_FUENTE * V_SONIDO / (V_SONIDO + vFuente);
}

function velocidadRecesion(z: number): number {
  return C_LUZ * ((z + 1) ** 2 - 1) / ((z + 1) ** 2 + 1);
}

function distanciaAnosLuz(z: number): number {
  // Aproximación: d ≈ z * c / H0 (válida para z << 1)
  // Para z mayores usamos factor relativista simple
  const H0 = 70; // km/s/Mpc
  const MPC_EN_KM = 3.086e19;
  const ANO_LUZ_EN_KM = 9.461e12;
  const MPC_EN_ANOS_LUZ = MPC_EN_KM / ANO_LUZ_EN_KM;
  const vRec = velocidadRecesion(z);
  const distMpc = vRec / H0;
  return Math.round(distMpc * MPC_EN_ANOS_LUZ / 1e9); // miles de millones de años luz
}

// SVG animado del efecto Doppler
function DopplerSVG(): React.ReactNode {
  const [frame, setFrame] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFrame(f => (f + 1) % 60);
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const svgW = 420;
  const svgH = 200;
  // Fuente se mueve de izquierda a derecha, posición oscila entre 30% y 70%
  const progress = frame / 60;
  const sourceX = svgW * (0.3 + 0.4 * progress);
  const sourceY = svgH / 2;

  // Ondas emitidas en posiciones pasadas
  const waves: React.ReactNode[] = [];
  const numWaves = 6;
  for (let i = 0; i < numWaves; i++) {
    // Cada onda fue emitida cuando la fuente estaba más a la izquierda
    const waveAge = (i + 1) / numWaves; // 0 = reciente, 1 = antigua
    const emitProgress = Math.max(0, progress - waveAge * 0.5);
    const emitX = svgW * (0.3 + 0.4 * emitProgress);
    // Radio crece con el tiempo desde la emisión
    const radius = waveAge * 70;
    const opacity = (1 - waveAge) * 0.8;
    waves.push(
      <circle
        key={i}
        cx={emitX}
        cy={sourceY}
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={1.5}
        opacity={opacity}
      />
    );
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className={styles.dopplerSvg} aria-label="Animación del efecto Doppler">
      {/* Fondo */}
      <rect width={svgW} height={svgH} fill="none" />
      {/* Ondas */}
      {waves}
      {/* Fuente */}
      <circle cx={sourceX} cy={sourceY} r={14} fill="var(--primary)" opacity={0.15} />
      <text x={sourceX} y={sourceY + 5} textAnchor="middle" fontSize={18}>🚑</text>
      {/* Observadores */}
      <text x={18} y={sourceY + 5} textAnchor="middle" fontSize={16}>👂</text>
      <text x={8} y={sourceY + 22} textAnchor="middle" fontSize={9} fill="var(--secondary)">Tono bajo</text>
      <text x={svgW - 18} y={sourceY + 5} textAnchor="middle" fontSize={16}>👂</text>
      <text x={svgW - 18} y={sourceY + 22} textAnchor="middle" fontSize={9} fill="var(--primary)">Tono alto</text>
      {/* Etiquetas */}
      <text x={30} y={20} fontSize={9} fill="var(--text-secondary)" textAnchor="middle">Observador B</text>
      <text x={30} y={30} fontSize={9} fill="var(--text-secondary)" textAnchor="middle">(oye grave)</text>
      <text x={svgW - 30} y={20} fontSize={9} fill="var(--text-secondary)" textAnchor="middle">Observador A</text>
      <text x={svgW - 30} y={30} fontSize={9} fill="var(--text-secondary)" textAnchor="middle">(oye agudo)</text>
      {/* Leyenda de compresión */}
      <text x={sourceX + 50} y={svgH - 10} fontSize={8} fill="var(--primary)">Ondas comprimidas →</text>
      <text x={sourceX - 100} y={svgH - 10} fontSize={8} fill="var(--secondary)">← Ondas estiradas</text>
    </svg>
  );
}

// SVG del espectro de hidrógeno con redshift
function EspetroBarra({ z }: { z: number }): React.ReactNode {
  // Líneas de absorción del hidrógeno en nm (serie Balmer visible)
  const lineasBase = [410, 434, 486, 656]; // Hδ, Hγ, Hβ, Hα
  const lineasDesplazadas = lineasBase.map(l => l * (1 + z));

  const toX = (nm: number) => {
    // Mapear 380-780nm a 0-400px
    return Math.max(0, Math.min(400, (nm - 380) / (780 - 380) * 400));
  };

  const nmToRgb = (nm: number): string => {
    if (nm < 380 || nm > 780) return '#888';
    if (nm < 450) return `hsl(${270 + (nm - 380) / 70 * 30},100%,50%)`;
    if (nm < 495) return `hsl(${240 - (nm - 450) / 45 * 60},100%,50%)`;
    if (nm < 570) return `hsl(${180 - (nm - 495) / 75 * 60},100%,50%)`;
    if (nm < 625) return `hsl(${120 - (nm - 570) / 55 * 60},100%,50%)`;
    return `hsl(${60 - (nm - 625) / 155 * 60},100%,40%)`;
  };

  return (
    <svg viewBox="0 0 420 80" className={styles.espectroBarra} aria-label="Espectro de absorción del hidrógeno">
      {/* Gradiente espectro */}
      <defs>
        <linearGradient id="specGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#8B00FF" />
          <stop offset="15%" stopColor="#0000FF" />
          <stop offset="30%" stopColor="#00BFFF" />
          <stop offset="45%" stopColor="#00FF00" />
          <stop offset="60%" stopColor="#FFFF00" />
          <stop offset="75%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FF0000" />
        </linearGradient>
      </defs>
      <rect x={10} y={10} width={400} height={40} fill="url(#specGrad)" rx={4} />
      {/* Líneas de absorción originales (gris) */}
      {lineasBase.map((nm, i) => (
        <rect key={`orig-${i}`} x={10 + toX(nm)} y={10} width={2} height={40} fill="#1A1A1A" opacity={0.4} />
      ))}
      {/* Líneas desplazadas (más a la derecha = rojo) */}
      {lineasDesplazadas.map((nm, i) => (
        <rect key={`desp-${i}`} x={10 + toX(nm)} y={10} width={2.5} height={40} fill="#000" opacity={0.9} />
      ))}
      {/* Etiquetas */}
      <text x={10} y={70} fontSize={9} fill="var(--text-secondary)">380nm (UV)</text>
      <text x={370} y={70} fontSize={9} fill="var(--text-secondary)">780nm (IR)</text>
      <text x={210} y={70} fontSize={9} fill="var(--text-secondary)" textAnchor="middle">
        z = {z.toFixed(2)} → λ desplazada {(z * 100).toFixed(0)}% al rojo
      </text>
    </svg>
  );
}

export default function VisualizadorEfectoDoppler(): React.ReactNode {
  const [tab, setTab] = useState<Tab>('efecto');
  const [velocidadFuente, setVelocidadFuente] = useState(30);
  const [redshift, setRedshift] = useState(0.1);

  const mach = velocidadFuente / V_SONIDO;
  const freqAcer = calcularFrecuencia(velocidadFuente, true);
  const freqAlej = calcularFrecuencia(velocidadFuente, false);
  const varAcer = freqAcer === Infinity ? Infinity : ((freqAcer - F_FUENTE) / F_FUENTE * 100);
  const varAlej = ((freqAlej - F_FUENTE) / F_FUENTE * 100);

  const vRecesion = velocidadRecesion(redshift);
  const dist = distanciaAnosLuz(redshift);

  const relacionadas = getRelatedApps('visualizador-efecto-doppler');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Efecto Doppler</h1>
        <p>Por qué la sirena suena aguda al acercarse y grave al alejarse — y cómo esto mide la velocidad de las galaxias</p>
      </header>

      <LegalNotice />

      <nav className={styles.tabs} role="tablist" aria-label="Secciones del efecto Doppler">
        {(['efecto', 'slider', 'aplicaciones', 'cosmos'] as Tab[]).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
          >
            {t === 'efecto' && <><span aria-hidden="true">🌊</span> El efecto</>}
            {t === 'slider' && <><span aria-hidden="true">🎚️</span> Interactivo</>}
            {t === 'aplicaciones' && <><span aria-hidden="true">📡</span> Aplicaciones</>}
            {t === 'cosmos' && <><span aria-hidden="true">🌌</span> Cosmos</>}
          </button>
        ))}
      </nav>

      <div className={styles.content} role="tabpanel">

        {/* TAB 1: El efecto */}
        {tab === 'efecto' && (
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>¿Qué es el efecto Doppler?</h2>
            <p className={styles.intro}>
              Cuando una fuente de sonido se mueve, <strong>comprime las ondas que emite hacia delante</strong> (frecuencia mayor → tono agudo)
              y las <strong>estira hacia atrás</strong> (frecuencia menor → tono grave). La fuente sigue emitiendo a la misma frecuencia —
              es la posición relativa lo que cambia la percepción.
            </p>

            <div className={styles.svgWrapper}>
              <DopplerSVG />
            </div>

            <div className={styles.formulaBox}>
              <h3 className={styles.formulaTitulo}>Fórmula del efecto Doppler</h3>
              <div className={styles.formulaDisplay} aria-label="Fórmula del efecto Doppler">
                <span className={styles.fObs}>f<sub>obs</sub></span>
                <span className={styles.igual}> = f<sub>fuente</sub> ×</span>
                <span className={styles.fraccion}>
                  <span className={styles.num}>v<sub>sonido</sub> ± v<sub>observador</sub></span>
                  <span className={styles.den}>v<sub>sonido</sub> ∓ v<sub>fuente</sub></span>
                </span>
              </div>
              <div className={styles.formulaTerminos}>
                <div className={styles.termino}><strong>f<sub>obs</sub></strong> — frecuencia que percibe el observador</div>
                <div className={styles.termino}><strong>f<sub>fuente</sub></strong> — frecuencia que emite la fuente</div>
                <div className={styles.termino}><strong>v<sub>sonido</sub></strong> — velocidad del sonido en el medio (343 m/s en aire a 20°C)</div>
                <div className={styles.termino}><strong>v<sub>observador</sub></strong> — velocidad del observador (+ si se acerca)</div>
                <div className={styles.termino}><strong>v<sub>fuente</sub></strong> — velocidad de la fuente (− si se acerca al observador)</div>
              </div>
            </div>

            <div className={styles.ejemploBox}>
              <h3 className={styles.ejemploTitulo}>Ejemplo: ambulancia a 440 Hz (La musical)</h3>
              <div className={styles.ejemploGrid}>
                <div className={`${styles.ejemploCard} ${styles.ejemploAcercando}`}>
                  <div className={styles.ejemploIcon} aria-hidden="true">🚑 →</div>
                  <div className={styles.ejemploLabel}>Acercándose a 30 m/s</div>
                  <div className={styles.ejemploValor}>482 Hz</div>
                  <div className={styles.ejemploSub}>+9,5% más agudo</div>
                  <div className={styles.ejemploCalculo}>440 × 343 / (343 − 30)</div>
                </div>
                <div className={`${styles.ejemploCard} ${styles.ejemploFuente}`}>
                  <div className={styles.ejemploIcon} aria-hidden="true">🚑</div>
                  <div className={styles.ejemploLabel}>En reposo</div>
                  <div className={styles.ejemploValor}>440 Hz</div>
                  <div className={styles.ejemploSub}>Sin efecto</div>
                  <div className={styles.ejemploCalculo}>frecuencia real</div>
                </div>
                <div className={`${styles.ejemploCard} ${styles.ejemploAlejando}`}>
                  <div className={styles.ejemploIcon} aria-hidden="true">← 🚑</div>
                  <div className={styles.ejemploLabel}>Alejándose a 30 m/s</div>
                  <div className={styles.ejemploValor}>403 Hz</div>
                  <div className={styles.ejemploSub}>−8,4% más grave</div>
                  <div className={styles.ejemploCalculo}>440 × 343 / (343 + 30)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Slider interactivo */}
        {tab === 'slider' && (
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Calcula la frecuencia observada</h2>
            <p className={styles.intro}>
              Fuente emitiendo a <strong>440 Hz</strong> (nota La4) en aire a 20°C. Ajusta su velocidad:
            </p>

            <div className={styles.sliderSection}>
              <div className={styles.sliderHeader}>
                <label htmlFor="sliderVel" className={styles.sliderLabel}>
                  Velocidad de la fuente: <strong>{velocidadFuente} m/s</strong>
                  <span className={styles.sliderKmh}>({Math.round(velocidadFuente * 3.6)} km/h)</span>
                </label>
                <span className={`${styles.machBadge} ${mach > 0.9 ? styles.machPeligro : mach > 0.5 ? styles.machMedio : styles.machNormal}`}>
                  Mach {mach.toFixed(3)}
                </span>
              </div>
              <input
                id="sliderVel"
                type="range"
                min={0}
                max={340}
                value={velocidadFuente}
                onChange={e => setVelocidadFuente(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Velocidad de la fuente en metros por segundo"
              />
              <div className={styles.sliderMarks}>
                <span>0 m/s</span>
                <span>28 m/s (100 km/h)</span>
                <span>200 m/s</span>
                <span>343 m/s</span>
              </div>
              <div className={styles.casosRapidos}>
                {[
                  { label: 'Reposo', v: 0 },
                  { label: 'Coche (100 km/h)', v: 28 },
                  { label: 'Avión subsónico', v: 200 },
                  { label: 'Límite sónico', v: 342 },
                ].map(c => (
                  <button
                    key={c.v}
                    type="button"
                    aria-pressed={velocidadFuente === c.v}
                    onClick={() => setVelocidadFuente(c.v)}
                    className={`${styles.casoBtn} ${velocidadFuente === c.v ? styles.casoBtnActive : ''}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {mach >= 1 ? (
              <div className={styles.alertSonica} role="alert" aria-live="polite">
                <span className={styles.alertIcon} aria-hidden="true">💥</span>
                <div>
                  <strong>¡Barrera del sonido superada! (Mach {mach.toFixed(2)})</strong>
                  <p>La fuente supera la velocidad del sonido. El observador de delante no recibe ninguna onda — solo el boom sónico al pasar.</p>
                </div>
              </div>
            ) : mach > 0.9 ? (
              <div className={styles.alertSubsonica} role="alert" aria-live="polite">
                <span className={styles.alertIcon} aria-hidden="true">⚠️</span>
                <div>
                  <strong>Aproximándose al muro del sonido (Mach {mach.toFixed(2)})</strong>
                  <p>La frecuencia observada se dispara. A Mach 1 llega a infinito teóricamente.</p>
                </div>
              </div>
            ) : null}

            <div className={styles.frecuenciaDisplay}>
              <div className={`${styles.freqCard} ${styles.freqAcer}`}>
                <div className={styles.freqLabel} aria-label="Frecuencia observada acercándose">Acercándose</div>
                <div className={styles.freqValor}>
                  {freqAcer === Infinity ? '∞' : `${freqAcer.toFixed(1)} Hz`}
                </div>
                <div className={styles.freqVar}>
                  {freqAcer === Infinity ? 'Boom sónico' : `${varAcer > 0 ? '+' : ''}${varAcer.toFixed(1)}%`}
                </div>
                <div className={styles.freqFormula}>440 × 343 / (343 − {velocidadFuente})</div>
              </div>
              <div className={`${styles.freqCard} ${styles.freqBase}`}>
                <div className={styles.freqLabel}>Fuente</div>
                <div className={styles.freqValor}>440 Hz</div>
                <div className={styles.freqVar}>Referencia</div>
                <div className={styles.freqFormula}>La4 musical</div>
              </div>
              <div className={`${styles.freqCard} ${styles.freqAlej}`}>
                <div className={styles.freqLabel} aria-label="Frecuencia observada alejándose">Alejándose</div>
                <div className={styles.freqValor}>{freqAlej.toFixed(1)} Hz</div>
                <div className={styles.freqVar}>{varAlej.toFixed(1)}%</div>
                <div className={styles.freqFormula}>440 × 343 / (343 + {velocidadFuente})</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Aplicaciones */}
        {tab === 'aplicaciones' && (
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Doppler en el mundo real</h2>
            <p className={styles.intro}>
              El efecto Doppler no es solo curiosidad — es la base de tecnologías que usamos cada día.
            </p>
            <div className={styles.appCards}>
              <div className={styles.appCard}>
                <div className={styles.appEmoji} aria-hidden="true">🚓</div>
                <h3 className={styles.appTitle}>Radar de velocidad policial</h3>
                <p className={styles.appDesc}>
                  Emite microondas a <strong>24,1 GHz</strong> (longitud de onda ~12 mm). Las ondas rebotan en el vehículo
                  en movimiento y regresan con una frecuencia ligeramente diferente. La diferencia
                  <strong> Δf = 2 × v<sub>coche</sub> / λ</strong> permite calcular la velocidad del coche al instante.
                  A 120 km/h, la diferencia es de unos 2.156 Hz — imperceptible al oído, pero medible electrónicamente.
                </p>
                <div className={styles.appDato}>
                  Dato: un coche a 120 km/h produce un Doppler de 2.156 Hz sobre los 24,1 GHz emitidos.
                </div>
              </div>

              <div className={styles.appCard}>
                <div className={styles.appEmoji} aria-hidden="true">🏥</div>
                <h3 className={styles.appTitle}>Ecografía Doppler</h3>
                <p className={styles.appDesc}>
                  Ultrasonidos de <strong>2 a 15 MHz</strong> se reflejan en los glóbulos rojos en movimiento.
                  El desplazamiento Doppler de la frecuencia del eco revela la <strong>velocidad y dirección del flujo sanguíneo</strong>.
                  En modo color, el flujo que se acerca al transductor aparece en rojo y el que se aleja en azul.
                  Clave para diagnosticar estenosis carotídeas, trombos venosos y monitorizar el corazón fetal.
                </p>
                <div className={styles.appDato}>
                  Dato: la sangre en la aorta a 1 m/s produce un Doppler de ~1.300 Hz sobre 2 MHz de ultrasonido.
                </div>
              </div>

              <div className={styles.appCard}>
                <div className={styles.appEmoji} aria-hidden="true">🌪️</div>
                <h3 className={styles.appTitle}>Radar meteorológico Doppler</h3>
                <p className={styles.appDesc}>
                  Los radares de precipitación como los NEXRAD americanos o Doppler-C de AEMET miden el
                  Doppler de las gotas de lluvia. Esto revela el <strong>viento interior de las tormentas</strong>:
                  rotación, microburst, flujo. La <em>vortex signature</em> (mesociclón) delata un tornado
                  en desarrollo hasta 30 minutos antes de tocar tierra.
                </p>
                <div className={styles.appDato}>
                  Dato: vientos mayores de 50 m/s en rotación indican tornado con alta probabilidad.
                </div>
              </div>

              <div className={styles.appCard}>
                <div className={styles.appEmoji} aria-hidden="true">🌊</div>
                <h3 className={styles.appTitle}>SONAR activo</h3>
                <p className={styles.appDesc}>
                  En el agua, el sonido viaja a <strong>1.500 m/s</strong> (vs 343 m/s en aire). Los sonares activos
                  emiten pulsos ultrasónicos y miden el Doppler del eco para determinar velocidad y dirección de
                  submarinos, bancos de peces o el fondo oceánico. El ADC (Acoustic Doppler Current Profiler)
                  mide corrientes marinas a múltiples profundidades simultáneamente.
                </p>
                <div className={styles.appDato}>
                  Dato: los ADCPs miden corrientes de 0,001 m/s a profundidades de hasta 1.000 m.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Cosmos */}
        {tab === 'cosmos' && (
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Doppler cósmico: el universo en expansión</h2>
            <p className={styles.intro}>
              El efecto Doppler se aplica también a la <strong>luz</strong> (ondas electromagnéticas). Las galaxias
              que se alejan emiten luz con longitudes de onda más largas — desplazadas hacia el rojo (<em>redshift</em>).
            </p>

            <div className={styles.cosmosGrid}>
              <div className={styles.cosmosCard}>
                <div className={styles.cosmosIcon} aria-hidden="true">🔴</div>
                <h3>Redshift</h3>
                <p>Galaxia alejándose → luz desplazada al rojo (λ mayor, frecuencia menor). La mayoría del universo observable.</p>
              </div>
              <div className={styles.cosmosCard}>
                <div className={styles.cosmosIcon} aria-hidden="true">🔵</div>
                <h3>Blueshift</h3>
                <p>Galaxia acercándose → luz desplazada al azul (λ menor, frecuencia mayor). Rarísimo — solo Andrómeda en nuestro grupo local.</p>
              </div>
              <div className={styles.cosmosCard}>
                <div className={styles.cosmosIcon} aria-hidden="true">📏</div>
                <h3>Ley de Hubble (1929)</h3>
                <p>Las galaxias se alejan más rápido cuanto más lejos están. Prueba directa de la expansión del universo. <strong>H₀ ≈ 70 km/s/Mpc</strong>.</p>
              </div>
            </div>

            <div className={styles.redshiftSection}>
              <div className={styles.sliderHeader}>
                <label htmlFor="sliderRedshift" className={styles.sliderLabel}>
                  Redshift (z): <strong>{redshift.toFixed(2)}</strong>
                </label>
              </div>
              <input
                id="sliderRedshift"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={redshift}
                onChange={e => setRedshift(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Parámetro redshift z de 0 a 2"
              />
              <div className={styles.sliderMarks}>
                <span>z=0 (aquí)</span>
                <span>z=0.5 (6 Gly)</span>
                <span>z=1</span>
                <span>z=2</span>
              </div>

              <div className={styles.redshiftDisplay}>
                <div className={styles.redshiftCard}>
                  <div className={styles.redshiftLabel}>Velocidad de recesión</div>
                  <div className={styles.redshiftValor}>{vRecesion.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} km/s</div>
                  <div className={styles.redshiftSub}>{(vRecesion / C_LUZ * 100).toFixed(1)}% de la velocidad de la luz</div>
                </div>
                <div className={styles.redshiftCard}>
                  <div className={styles.redshiftLabel}>Distancia estimada</div>
                  <div className={styles.redshiftValor}>{dist.toFixed(1)} Gly</div>
                  <div className={styles.redshiftSub}>miles de millones de años luz</div>
                </div>
                <div className={styles.redshiftCard}>
                  <div className={styles.redshiftLabel}>Desplazamiento λ</div>
                  <div className={styles.redshiftValor}>+{(redshift * 100).toFixed(0)}%</div>
                  <div className={styles.redshiftSub}>longitud de onda aumentada</div>
                </div>
              </div>

              <h3 className={styles.espectroTitulo}>Espectro de absorción del hidrógeno</h3>
              <p className={styles.espectroDesc}>
                Las líneas negras muestran la posición de las líneas de absorción de Balmer (Hα, Hβ, Hγ, Hδ).
                Con z = {redshift.toFixed(2)}, todas se desplazan {(redshift * 100).toFixed(0)}% hacia el rojo.
              </p>
              <EspetroBarra z={redshift} />

              <div className={styles.formulaBox}>
                <h3 className={styles.formulaTitulo}>Fórmula del redshift</h3>
                <div className={styles.redshiftFormula}>
                  <div>z = (λ<sub>obs</sub> − λ<sub>emitida</sub>) / λ<sub>emitida</sub></div>
                  <div className={styles.redshiftFormulaVel}>
                    v/c = [(z+1)² − 1] / [(z+1)² + 1] <span className={styles.relativista}>(fórmula relativista)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Sección educativa colapsable */}
      <details className={styles.educacional}>
        <summary className={styles.educacionalSummary}>
          <span aria-hidden="true">📚</span> Más sobre el efecto Doppler
        </summary>
        <div className={styles.educacionalContenido}>
          <h3>Historia</h3>
          <p>
            El efecto fue descrito por el físico austriaco <strong>Christian Doppler</strong> en 1842 en su artículo
            «Sobre la luz coloreada de las estrellas dobles». La primera verificación experimental con sonido la
            realizó Buys Ballot en 1845 usando músicos tocando en un tren en movimiento.
          </p>
          <h3>El boom sónico</h3>
          <p>
            Cuando una fuente supera la velocidad del sonido (Mach 1), las ondas se acumulan en un frente de onda
            cónico llamado <em>cono de Mach</em>. El observador oye primero el silencio (las ondas aún no han llegado)
            y luego el impacto de todas las ondas acumuladas simultáneamente. En aviones supersónicos este
            fenómeno se llama <em>bang sónico</em> y puede romper ventanas.
          </p>
          <h3>Doppler y GPS</h3>
          <p>
            Los satélites GPS se mueven a ~14.000 km/h. El efecto Doppler sobre la señal de radio del satélite
            es significativo y debe compensarse — junto con la relatividad especial y general — para que el GPS
            sea preciso al metro. Sin estas correcciones, el error acumulado sería de varios kilómetros al día.
          </p>
          <div className={styles.warningBox} aria-hidden="true" />
        </div>
      </details>

      <RelatedApps apps={relacionadas} />
      <ShareCard appName="visualizador-efecto-doppler" />
      <Footer appName="visualizador-efecto-doppler" />
    </div>
  );
}
