'use client';
// @disclaimer: exempt
import { useState, useRef, useEffect } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LogarithmicScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';
import styles from './VisualizadorSilicio.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type TipoBanda = 'conductor' | 'semiconductor' | 'aislante';
type TipoDopado = 'N' | 'P';

const datosMoore = [
  { anio: '1971 Intel 4004', real: 2300, moore: 2300 },
  { anio: '1978 Intel 8086', real: 29000, moore: 17000 },
  { anio: '1989 Intel 486', real: 1200000, moore: 500000 },
  { anio: '2000 Pentium 4', real: 42000000, moore: 30000000 },
  { anio: '2006 Core 2 Duo', real: 291000000, moore: 350000000 },
  { anio: '2012 Ivy Bridge', real: 1400000000, moore: 2000000000 },
  { anio: '2017 Apple A11', real: 4300000000, moore: 6000000000 },
  { anio: '2020 Apple M1', real: 16000000000, moore: 12000000000 },
  { anio: '2023 Apple M3', real: 25000000000, moore: 18000000000 },
  { anio: '2024 Apple M4', real: 28000000000, moore: 22000000000 },
];

const pasosFabricacion = [
  {
    num: 1,
    titulo: 'Purificación del Silicio',
    desc: 'Arena (SiO₂) → reducción química → Si puro al 99,9999999 % ("nine nines")',
    icono: '🏖️',
  },
  {
    num: 2,
    titulo: 'Lingote Czochralski',
    desc: 'Si fundido a 1.414 °C, se extrae lentamente un monocristal girado hasta 2 m de longitud',
    icono: '🧲',
  },
  {
    num: 3,
    titulo: 'Corte en Obleas (Wafers)',
    desc: 'Disco de 300 mm de diámetro, 775 μm de grosor. Superficie pulida a nivel atómico',
    icono: '⬜',
  },
  {
    num: 4,
    titulo: 'Litografía EUV',
    desc: 'Luz ultravioleta extrema (13,5 nm) proyecta el patrón del circuito. ~100 capas por chip',
    icono: '💡',
  },
  {
    num: 5,
    titulo: 'Grabado (Etching)',
    desc: 'Plasma elimina el Si no protegido por la fotorresina. Zanjas de solo nanómetros',
    icono: '⚗️',
  },
  {
    num: 6,
    titulo: 'Dopado Iónico',
    desc: 'Implantación de iones de P (tipo N) y B (tipo P) en zonas exactas del cristal',
    icono: '⚛️',
  },
  {
    num: 7,
    titulo: 'Interconexiones y Corte',
    desc: 'Capas de Cu para cables nanométricos → test eléctrico → corte en chips individuales',
    icono: '🔪',
  },
];

export default function VisualizadorSilicio() {
  const [bandaActiva, setBandaActiva] = useState<TipoBanda>('semiconductor');
  const [dopado, setDopado] = useState<TipoDopado>('N');
  const [voltaje, setVoltaje] = useState<number>(0);
  const [pasoActivo, setPasoActivo] = useState<number | null>(null);
  const chartRef = useRef(null);

  const infosBanda: Record<TipoBanda, { titulo: string; material: string; gap: string; conduce: string; color: string; desc: string }> = {
    conductor: {
      titulo: 'Conductor',
      material: 'Cobre (Cu)',
      gap: '0 eV — bandas solapadas',
      conduce: 'Siempre, a cualquier temperatura',
      color: '#E8A117',
      desc: 'La banda de valencia y la de conducción se solapan. Los electrones circulan libremente sin necesitar energía extra.',
    },
    semiconductor: {
      titulo: 'Semiconductor',
      material: 'Silicio (Si)',
      gap: '~1,1 eV — pequeña barrera',
      conduce: 'Parcialmente (se puede controlar)',
      color: '#2E86AB',
      desc: 'La banda prohibida es estrecha. A temperatura ambiente algunos electrones saltan. Con dopado o luz se controla la conductividad.',
    },
    aislante: {
      titulo: 'Aislante',
      material: 'Dióxido de Silicio (SiO₂)',
      gap: '>5 eV — gran barrera',
      conduce: 'No conduce (ningún electrón puede saltar)',
      color: '#888888',
      desc: 'La banda prohibida es tan ancha que a temperatura ordinaria ningún electrón tiene energía suficiente para saltar a la banda de conducción.',
    },
  };

  const bandaInfo = infosBanda[bandaActiva];

  const chartData = {
    labels: datosMoore.map((d) => d.anio),
    datasets: [
      {
        label: 'Transistores reales',
        data: datosMoore.map((d) => d.real),
        borderColor: '#2E86AB',
        backgroundColor: 'rgba(46,134,171,0.15)',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
      },
      {
        label: 'Ley de Moore teórica',
        data: datosMoore.map((d) => d.moore),
        borderColor: '#48A9A6',
        backgroundColor: 'rgba(72,169,166,0.1)',
        borderDash: [6, 3],
        pointRadius: 3,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const val = ctx.parsed.y ?? 0;
            return `${ctx.dataset.label}: ${val.toLocaleString('es-ES')} transistores`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'logarithmic' as const,
        title: { display: true, text: 'Transistores por chip (escala log)' },
        ticks: {
          callback: (value: number | string) => {
            const n = Number(value);
            if (n >= 1e9) return `${(n / 1e9).toFixed(0)} mil M`;
            if (n >= 1e6) return `${(n / 1e6).toFixed(0)} M`;
            if (n >= 1e3) return `${(n / 1e3).toFixed(0)} K`;
            return String(n);
          },
        },
      },
      x: {
        ticks: { maxRotation: 45, font: { size: 10 } },
      },
    },
  };

  // Determinar estado de la unión P-N según voltaje
  const estadoPolarizacion =
    voltaje > 0.6 ? 'directa' : voltaje < -0.1 ? 'inversa' : 'neutro';

  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcon} aria-hidden="true">💻</span>
          <h1 className={styles.heroTitle}>El Silicio: De la Arena al Chip</h1>
          <p className={styles.heroSubtitle}>
            Cómo un semiconductor dopado con átomos de fósforo y boro hace posible toda la computación moderna
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* SECCIÓN 1: Bandas de Energía */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">⚡</span> Conductor, Semiconductor y Aislante
        </h2>
        <p className={styles.seccionDesc}>
          Todo material se clasifica por la <strong>brecha de energía</strong> (band gap) entre sus electrones ligados y libres. El silicio tiene el gap ideal para controlarse.
        </p>

        <div className={styles.bandasSelector}>
          {(['conductor', 'semiconductor', 'aislante'] as TipoBanda[]).map((tipo) => (
            <button
              key={tipo}
              className={`${styles.bandaBtn} ${bandaActiva === tipo ? styles.bandaBtnActivo : ''}`}
              onClick={() => setBandaActiva(tipo)}
              aria-pressed={bandaActiva === tipo}
            >
              {infosBanda[tipo].titulo}
              <span className={styles.bandaMaterial}>{infosBanda[tipo].material}</span>
            </button>
          ))}
        </div>

        <div className={styles.bandasGrid}>
          <div className={styles.bandaDiagram} style={{ '--color-banda': bandaInfo.color } as React.CSSProperties}>
            {/* Banda de conducción */}
            <div className={styles.bandaConduccion}>
              <span className={styles.bandaLabel}>Banda de conducción</span>
              {bandaActiva === 'conductor' && (
                <div className={styles.electronesLibres} aria-label="Electrones libres">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={styles.electronPunt} aria-hidden="true">●</span>
                  ))}
                </div>
              )}
            </div>

            {/* Banda prohibida (band gap) */}
            <div
              className={styles.bandaProhibida}
              style={{
                height: bandaActiva === 'conductor' ? '4px' : bandaActiva === 'semiconductor' ? '48px' : '96px',
              }}
            >
              {bandaActiva !== 'conductor' && (
                <span className={styles.gapLabel}>{bandaInfo.gap}</span>
              )}
            </div>

            {/* Banda de valencia */}
            <div className={styles.bandaValencia}>
              <span className={styles.bandaLabel}>Banda de valencia</span>
              <div className={styles.electronesValencia} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={styles.electronPunt}>●</span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.bandaInfo}>
            <h3 className={styles.bandaInfoTitulo} style={{ color: bandaInfo.color }}>
              {bandaInfo.titulo}: {bandaInfo.material}
            </h3>
            <p className={styles.bandaInfoDesc}>{bandaInfo.desc}</p>
            <dl className={styles.bandaDatalist}>
              <dt>Band gap:</dt>
              <dd>{bandaInfo.gap}</dd>
              <dt>¿Conduce?:</dt>
              <dd>{bandaInfo.conduce}</dd>
            </dl>
            {bandaActiva === 'semiconductor' && (
              <div className={styles.warningBox}>
                <strong>¿Por qué el silicio es ideal?</strong> Su band gap de 1,1 eV permite controlarlo con temperatura, luz y, sobre todo, con <em>dopado</em>: añadir átomos impuros en concentraciones de 1 por millón.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Dopado N y P */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">⚛️</span> El Dopado: Tipo N y Tipo P
        </h2>
        <p className={styles.seccionDesc}>
          El dopado consiste en introducir átomos impuros en la red cristalina de silicio para aumentar su conductividad de forma controlada.
        </p>

        <div className={styles.dopingSelector}>
          <button
            className={`${styles.dopingBtn} ${dopado === 'N' ? styles.dopingBtnN : ''}`}
            onClick={() => setDopado('N')}
            aria-pressed={dopado === 'N'}
          >
            Tipo N (Fósforo)
          </button>
          <button
            className={`${styles.dopingBtn} ${dopado === 'P' ? styles.dopingBtnP : ''}`}
            onClick={() => setDopado('P')}
            aria-pressed={dopado === 'P'}
          >
            Tipo P (Boro)
          </button>
        </div>

        <div className={styles.dopingContent}>
          <div className={styles.cristalGrid} aria-label={`Red cristalina con dopado tipo ${dopado}`}>
            {/* Átomo dopante en el centro, Si alrededor */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const esCentro = i === 4;
              return (
                <div
                  key={i}
                  className={`${styles.atomoCell} ${esCentro ? (dopado === 'N' ? styles.atomoN : styles.atomoP) : styles.atomoSi}`}
                  title={esCentro ? (dopado === 'N' ? 'Fósforo (P): 5 e- de valencia' : 'Boro (B): 3 e- de valencia') : 'Silicio (Si): 4 e- de valencia'}
                >
                  <span className={styles.atomoSimbolo}>{esCentro ? (dopado === 'N' ? 'P' : 'B') : 'Si'}</span>
                  <span className={styles.atomoElectrones}>{esCentro ? (dopado === 'N' ? '5e⁻' : '3e⁻') : '4e⁻'}</span>
                </div>
              );
            })}
            {/* Electrón libre o hueco */}
            {dopado === 'N' && (
              <div className={styles.electronLibreFloat} aria-label="Electrón libre extra">
                <span className={styles.electronLibreIcon}>e⁻</span>
                <span className={styles.electronLibreLabel}>Electrón libre</span>
              </div>
            )}
            {dopado === 'P' && (
              <div className={styles.huecoFloat} aria-label="Hueco positivo">
                <span className={styles.huecoIcon}>○</span>
                <span className={styles.huecoLabel}>Hueco (+)</span>
              </div>
            )}
          </div>

          <div className={styles.dopingInfo}>
            {dopado === 'N' ? (
              <>
                <h3 className={styles.dopingTitulo} style={{ color: '#2E86AB' }}>Semiconductor Tipo N</h3>
                <p>El <strong>fósforo (P)</strong> tiene 5 electrones de valencia. En la red de silicio solo necesita 4 para los enlaces covalentes con los vecinos. El <strong>quinto electrón queda libre</strong> y puede moverse por el cristal.</p>
                <ul className={styles.dopingLista}>
                  <li>Portador mayoritario: <strong>electrón (carga negativa)</strong></li>
                  <li>El fósforo actúa como <em>donante</em> (donor)</li>
                  <li>Concentración típica: 1 átomo de P por cada 10⁶–10⁷ átomos de Si</li>
                  <li>Aplicaciones: cátodo de diodos, emisor de transistores NPN</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className={styles.dopingTitulo} style={{ color: '#E55A5A' }}>Semiconductor Tipo P</h3>
                <p>El <strong>boro (B)</strong> tiene solo 3 electrones de valencia. En la red necesitaría 4 para completar todos los enlaces. La <strong>posición vacía</strong> se llama "hueco" y actúa como portador de carga positiva.</p>
                <ul className={styles.dopingLista}>
                  <li>Portador mayoritario: <strong>hueco (carga positiva)</strong></li>
                  <li>El boro actúa como <em>aceptor</em> (acceptor)</li>
                  <li>El hueco "se mueve" cuando un e⁻ vecino salta para llenarlo</li>
                  <li>Aplicaciones: ánodo de diodos, base de transistores NPN</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: Unión P-N */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">🔄</span> La Unión P-N: Diodo y Transistor
        </h2>
        <p className={styles.seccionDesc}>
          Cuando se unen una región N y una P se forma la <strong>unión P-N</strong>: la base de todo dispositivo semiconductor moderno.
        </p>

        <div className={styles.diodoWrapper}>
          <div className={styles.diodoVisual}>
            <div className={`${styles.zonaP} ${estadoPolarizacion === 'directa' ? styles.zonaActiva : ''}`}>
              <span className={styles.zonaTitulo}>Zona P (B)</span>
              <div className={styles.huecosMini} aria-hidden="true">○ ○ ○</div>
            </div>
            <div className={`${styles.depletionZone} ${estadoPolarizacion === 'inversa' ? styles.depletionGrande : estadoPolarizacion === 'directa' ? styles.depletionPequena : ''}`}>
              <span className={styles.depletionLabel}>Zona de agotamiento</span>
            </div>
            <div className={`${styles.zonaN} ${estadoPolarizacion === 'directa' ? styles.zonaActiva : ''}`}>
              <span className={styles.zonaTitulo}>Zona N (P)</span>
              <div className={styles.electronsMini} aria-hidden="true">● ● ●</div>
            </div>
          </div>

          {estadoPolarizacion === 'directa' && (
            <div className={styles.corrienteIndicador} role="alert" aria-live="polite">
              ⚡ Corriente fluyendo — Polarización directa
            </div>
          )}
          {estadoPolarizacion === 'inversa' && (
            <div className={styles.bloqueadoIndicador} role="alert" aria-live="polite">
              🚫 Sin corriente — Polarización inversa (bloqueado)
            </div>
          )}
          {estadoPolarizacion === 'neutro' && (
            <div className={styles.neutroIndicador}>
              ⚖️ En equilibrio — sin voltaje aplicado
            </div>
          )}

          <div className={styles.sliderWrapper}>
            <label htmlFor="sliderVoltaje" className={styles.sliderLabel}>
              Voltaje aplicado: <strong>{voltaje.toFixed(1)} V</strong>
            </label>
            <input
              id="sliderVoltaje"
              type="range"
              min={-2}
              max={2}
              step={0.1}
              value={voltaje}
              onChange={(e) => setVoltaje(parseFloat(e.target.value))}
              className={styles.sliderVoltaje}
              aria-label="Control de voltaje del diodo"
            />
            <div className={styles.sliderTicks}>
              <span>−2 V</span>
              <span>0 V</span>
              <span>+2 V</span>
            </div>
          </div>

          <div className={styles.transistorInfo}>
            <h3 className={styles.transistorTitulo}>Del Diodo al Transistor MOSFET</h3>
            <div className={styles.transistorGrid}>
              <div className={styles.transistorCard}>
                <h4>Transistor Bipolar (NPN)</h4>
                <p>Dos uniones P-N: emisor→base→colector. Una pequeña corriente en la base controla una gran corriente de colector. Base = amplificador analógico.</p>
              </div>
              <div className={styles.transistorCard}>
                <h4>Transistor MOSFET</h4>
                <p>Un voltaje en la <em>puerta</em> (gate) crea un canal conductor entre fuente y drenador. Sin corriente de entrada, solo voltaje. Interruptor on/off a GHz. La base de todos los chips modernos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: De la Arena al Chip */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">🏭</span> De la Arena al Chip: 7 Pasos
        </h2>
        <p className={styles.seccionDesc}>
          Fabricar un microprocesador moderno requiere uno de los procesos industriales más complejos de la historia humana. TSMC fabrica en nodos de 2 nm (2025).
        </p>

        <div className={styles.procesoGrid}>
          {pasosFabricacion.map((paso) => (
            <div
              key={paso.num}
              className={`${styles.procesoStep} ${pasoActivo === paso.num ? styles.procesoStepActivo : ''}`}
              onClick={() => setPasoActivo(pasoActivo === paso.num ? null : paso.num)}
              role="button"
              tabIndex={0}
              aria-expanded={pasoActivo === paso.num}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setPasoActivo(pasoActivo === paso.num ? null : paso.num);
                }
              }}
            >
              <div className={styles.pasoHeader}>
                <span className={styles.pasoNum}>{paso.num}</span>
                <span className={styles.pasoIcono} aria-hidden="true">{paso.icono}</span>
                <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
              </div>
              {pasoActivo === paso.num && (
                <p className={styles.pasoDesc}>{paso.desc}</p>
              )}
            </div>
          ))}
        </div>

        <div className={styles.datoDestacado}>
          <strong>Dato clave</strong>: Un chip moderno requiere más de 100 capas de litografía superpuestas con precisión de ±1 nm. La energía necesaria para fabricar un chip de alta gama equivale a la que consume un hogar durante 1 año.
        </div>
      </section>

      {/* SECCIÓN 5: Ley de Moore */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">📈</span> La Ley de Moore: Auge y Límites
        </h2>
        <p className={styles.seccionDesc}>
          En 1965, Gordon Moore predijo que el número de transistores por chip se duplicaría cada ~2 años. Funcionó durante 50 años. Ahora topamos con muros físicos.
        </p>

        <div className={styles.moorChart} ref={chartRef}>
          <Line data={chartData} options={chartOptions} aria-label="Gráfico de la Ley de Moore: transistores por chip en escala logarítmica" />
        </div>

        <div className={styles.murosGrid}>
          <div className={`${styles.muroCuantico} ${styles.muroCard}`}>
            <h3>🔥 Muro del Calor</h3>
            <p>Más transistores → más calor por cm². Enfriamiento imposible con la arquitectura clásica. Solución: chips <em>multinúcleo</em> y menor voltaje.</p>
          </div>
          <div className={`${styles.muroMemoria} ${styles.muroCard}`}>
            <h3>🧠 Muro de la Memoria</h3>
            <p>CPU cientos de veces más rápida que la RAM. El cuello de botella no es el procesador sino el bus de datos. Solución: caché L1/L2/L3 en el propio chip.</p>
          </div>
          <div className={`${styles.muroCuanticoFis} ${styles.muroCard}`}>
            <h3>⚛️ Muro Cuántico</h3>
            <p>A 1–2 nm los electrones hacen <em>efecto túnel</em>: atraviesan barreras que deberían ser opacas. Fugas de corriente incontrolables. Límite absoluto ≈ 0,5 nm (2 átomos de Si).</p>
          </div>
        </div>

        <div className={styles.datoDestacado}>
          <strong>Más allá del Si</strong>: GaAs (alta frecuencia, GHz), GaN (alta potencia, coches eléctricos), grafeno (sin band gap nativo, pendiente), transistores de nanotubos de carbono (laboratorio, 2024).
        </div>
      </section>

      <EducationalSection
        title="Más sobre el Silicio"
        subtitle="El semiconductor que cambió la civilización"
      >
        <h3>¿Por qué el silicio y no el germanio?</h3>
        <p>El <strong>germanio (Ge)</strong> fue el primer semiconductor usado en transistores (1947, Bell Labs). Sin embargo, el silicio lo desbancó por tres razones fundamentales:</p>
        <ol>
          <li><strong>Abundancia</strong>: El Si es el segundo elemento más abundante en la corteza terrestre (27,7 %). El Ge es raro y caro.</li>
          <li><strong>Dióxido estable (SiO₂)</strong>: El Si se oxida espontáneamente formando SiO₂, un aislante excelente y estable que permite fabricar la capa de gate del MOSFET. El GeO₂ es soluble en agua y mucho menos útil.</li>
          <li><strong>Band gap correcto</strong>: 1,1 eV permite operar a temperatura ambiente sin exceso de portadores térmicos. El Ge (0,67 eV) se "abre" demasiado con el calor.</li>
        </ol>

        <h3>Por qué Silicon Valley se llama así</h3>
        <p>En 1956, William Shockley (coinventor del transistor) fundó Shockley Semiconductor en Mountain View, California, cerca de Stanford. Sus empleados abandonaron la empresa (los "<em>eight traitors</em>") para fundar Fairchild Semiconductor. De Fairchild nacieron Intel, AMD y docenas más. El periodista Don Hoefler acuñó el término "Silicon Valley" en 1971 al ver la densidad de empresas de chips en esa zona.</p>

        <h3>La arquitectura post-Moore</h3>
        <p>Dado que escalar transistores individuales se vuelve imposible, la industria explora nuevas estrategias:</p>
        <ul>
          <li><strong>Chiplets</strong>: varios chips pequeños interconectados en un único encapsulado (AMD Ryzen, Apple M4)</li>
          <li><strong>Computación 3D</strong>: apilar chips verticalmente (High Bandwidth Memory, SRAM 3D)</li>
          <li><strong>Computación neuromórfica</strong>: chips que imitan neuronas para eficiencia energética</li>
          <li><strong>Computación cuántica</strong>: qubits superconductores para ciertos problemas. No sustituyen los chips clásicos; los complementan.</li>
        </ul>

        <h3>El impacto económico</h3>
        <p>La industria de semiconductores supera los <strong>600.000 millones de dólares anuales</strong> (2024). La dependencia de pocas fábricas (TSMC en Taiwán, Samsung en Corea del Sur) crea tensiones geopolíticas: la Unión Europea con la <em>Chips Act</em> y Estados Unidos con la <em>CHIPS and Science Act</em> destinan cientos de miles de millones para crear capacidad propia de fabricación.</p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-silicio')} />
      <ShareCard appName="visualizador-silicio" />
      <Footer appName="visualizador-silicio" />
    </div>
  );
}
