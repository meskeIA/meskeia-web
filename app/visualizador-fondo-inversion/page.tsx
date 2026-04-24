'use client';
// @disclaimer: exempt
import { useState, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './FondoInversion.module.css';

type TabId = 'anatomia' | 'activos-vs-indice' | 'comisiones' | 'diversificacion';

interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'anatomia', label: 'Cómo funciona por dentro', icon: '🔬' },
  { id: 'activos-vs-indice', label: 'Activa vs Índice', icon: '⚔️' },
  { id: 'comisiones', label: 'Las comisiones que erosionan', icon: '📉' },
  { id: 'diversificacion', label: 'Diversificación real', icon: '🌐' },
];

interface SpivaData {
  periodo: string;
  porcentaje: number;
  label: string;
}

const SPIVA_DATA: SpivaData[] = [
  { periodo: '1 año', porcentaje: 60, label: '~60% no baten al índice' },
  { periodo: '5 años', porcentaje: 75, label: '~75% no baten al índice' },
  { periodo: '10 años', porcentaje: 85, label: '~85% no baten al índice' },
  { periodo: '20 años', porcentaje: 90, label: '>90% no baten al índice' },
];

interface ComisionScenario {
  nombre: string;
  ter: number;
  tipo: 'sin' | 'barato' | 'normal' | 'activo-barato' | 'activo-tipico' | 'activo-caro';
}

const COMISION_SCENARIOS: ComisionScenario[] = [
  { nombre: 'Sin comisión (teórico)', ter: 0, tipo: 'sin' },
  { nombre: 'ETF indexado barato', ter: 0.2, tipo: 'barato' },
  { nombre: 'Fondo indexado normal', ter: 0.5, tipo: 'normal' },
  { nombre: 'Fondo activo barato', ter: 1.0, tipo: 'activo-barato' },
  { nombre: 'Fondo activo típico', ter: 1.5, tipo: 'activo-tipico' },
  { nombre: 'Fondo activo caro', ter: 2.0, tipo: 'activo-caro' },
];

function calcularResultado(capital: number, rentabilidadBruta: number, ter: number, anios: number): number {
  const rentabilidadNeta = (rentabilidadBruta - ter) / 100;
  return capital * Math.pow(1 + rentabilidadNeta, anios);
}

function formatEur(valor: number): string {
  return valor.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

export default function VisualizadorFondoInversion() {
  const [tabActivo, setTabActivo] = useState<TabId>('anatomia');
  const [sliderTer, setSliderTer] = useState<number>(1.0);
  const [sliderAnios, setSliderAnios] = useState<number>(20);

  const capitalInicial = 10000;
  const rentabilidadBruta = 7;

  const resultadoSlider = calcularResultado(capitalInicial, rentabilidadBruta, sliderTer, sliderAnios);
  const resultadoReferencia = calcularResultado(capitalInicial, rentabilidadBruta, 0.2, sliderAnios);
  const costeComisiones = resultadoReferencia - resultadoSlider;

  const handleTabClick = useCallback((id: TabId) => {
    setTabActivo(id);
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Fondo de Inversión: Por Dentro</h1>
        <p>
          Anatomía, gestión activa vs indexada, el coste real de las comisiones y qué significa
          diversificar de verdad. Educativo — sin recomendaciones de fondos concretos.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabs} role="tablist" aria-label="Secciones del visualizador">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActivo === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`${styles.tab} ${tabActivo === tab.id ? styles.tabActive : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* TAB 1: Anatomía */}
        {tabActivo === 'anatomia' && (
          <section
            id="panel-anatomia"
            role="tabpanel"
            aria-labelledby="tab-anatomia"
            className={styles.content}
          >
            <h2>Anatomía de un fondo de inversión</h2>

            <div className={styles.navBox}>
              <h3>El NAV: el precio de una participación</h3>
              <p>
                El <strong>NAV (Net Asset Value / Valor Liquidativo)</strong> es el precio de una
                participación del fondo. Se calcula cada día al cierre del mercado:
              </p>
              <div className={styles.formula}>
                <span className={styles.formulaText}>
                  NAV = (Activos totales − Pasivos) / Número de participaciones en circulación
                </span>
              </div>
              <p>
                Cuando el mercado sube, el valor de los activos del fondo sube → el NAV sube → tu
                participación vale más. Cuando el mercado cae, lo contrario.
              </p>
            </div>

            <h3>Flujo del dinero</h3>
            <div className={styles.flujoGrid}>
              <div className={styles.flujoStep}>
                <span className={styles.flujoNum}>1</span>
                <div>
                  <strong>Tú pones dinero</strong>
                  <p>Compras participaciones al NAV del día</p>
                </div>
              </div>
              <div className={styles.flujoArrow} aria-hidden="true">→</div>
              <div className={styles.flujoStep}>
                <span className={styles.flujoNum}>2</span>
                <div>
                  <strong>La gestora invierte</strong>
                  <p>Compra activos según su estrategia</p>
                </div>
              </div>
              <div className={styles.flujoArrow} aria-hidden="true">→</div>
              <div className={styles.flujoStep}>
                <span className={styles.flujoNum}>3</span>
                <div>
                  <strong>NAV diario</strong>
                  <p>Se recalcula al cierre de cada sesión</p>
                </div>
              </div>
              <div className={styles.flujoArrow} aria-hidden="true">→</div>
              <div className={styles.flujoStep}>
                <span className={styles.flujoNum}>4</span>
                <div>
                  <strong>Al reembolsar</strong>
                  <p>Recibes NAV actual × participaciones tuyas</p>
                </div>
              </div>
            </div>

            <h3>Los actores</h3>
            <div className={styles.anatomiaGrid}>
              {[
                {
                  actor: 'Gestora',
                  icono: '🏢',
                  desc: 'Empresa que decide en qué invertir (ej: Bestinver, Vanguard, BlackRock). Cobra la comisión de gestión.',
                },
                {
                  actor: 'Gestor de cartera',
                  icono: '👤',
                  desc: 'La persona que toma las decisiones de inversión concretas. En fondos indexados, el proceso es mecánico.',
                },
                {
                  actor: 'Depositario',
                  icono: '🏦',
                  desc: 'Banco que custodia los valores. Separa el patrimonio del fondo del de la gestora: si la gestora quiebra, tu dinero está protegido.',
                },
                {
                  actor: 'CNMV',
                  icono: '⚖️',
                  desc: 'Comisión Nacional del Mercado de Valores. Supervisora española que regula y vigila los fondos.',
                },
              ].map(({ actor, icono, desc }) => (
                <div key={actor} className={styles.actorCard}>
                  <div className={styles.actorIcono} aria-hidden="true">{icono}</div>
                  <h4>{actor}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>

            <h3>Tipos de fondos por activo</h3>
            <div className={styles.tiposGrid}>
              {[
                { tipo: 'Renta variable', icono: '📈', desc: 'Acciones de empresas. Mayor riesgo y potencial de rentabilidad.' },
                { tipo: 'Renta fija', icono: '📋', desc: 'Bonos y deuda. Menor riesgo, rentabilidad más predecible.' },
                { tipo: 'Mixto', icono: '⚖️', desc: 'Combina RV y RF en distintas proporciones.' },
                { tipo: 'Monetario', icono: '💵', desc: 'Instrumentos de muy corto plazo. Riesgo mínimo, rentabilidad mínima.' },
                { tipo: 'Inmobiliario', icono: '🏘️', desc: 'Invierte en activos inmobiliarios o REITs.' },
                { tipo: 'Alternativo', icono: '🎲', desc: 'Materias primas, hedge funds, private equity. Alta complejidad.' },
              ].map(({ tipo, icono, desc }) => (
                <div key={tipo} className={styles.tipoCard}>
                  <span aria-hidden="true">{icono}</span>
                  <strong>{tipo}</strong>
                  <p>{desc}</p>
                </div>
              ))}
            </div>

            <h3>Tipos de gestión</h3>
            <div className={styles.gestionGrid}>
              <div className={styles.tipoActivo}>
                <h4>Gestión Activa</h4>
                <p>
                  El gestor selecciona activos intentando batir al mercado mediante{' '}
                  <em>stock picking</em> (elegir las mejores acciones) y <em>market timing</em>{' '}
                  (entrar y salir en el momento adecuado). Más cara. Resultados históricamente
                  decepcionantes (ver Tab 2).
                </p>
              </div>
              <div className={styles.tipoPasivo}>
                <h4>Gestión Pasiva / Indexada</h4>
                <p>
                  Replica mecánicamente un índice (MSCI World, S&amp;P 500, IBEX 35). Sin stock
                  picking. Sin market timing. TER muy bajo. Históricamente bate a la mayoría de
                  fondos activos a largo plazo.
                </p>
              </div>
              <div className={styles.tipoFactor}>
                <h4>Factor Investing (Smart Beta)</h4>
                <p>
                  Punto intermedio: replica índices pero con filtros cuantitativos (value, momentum,
                  quality, low volatility). Más barato que gestión activa, más sofisticado que índice
                  puro.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: Activa vs Índice */}
        {tabActivo === 'activos-vs-indice' && (
          <section
            id="panel-activos-vs-indice"
            role="tabpanel"
            aria-labelledby="tab-activos-vs-indice"
            className={styles.content}
          >
            <h2>La guerra: gestión activa vs índice</h2>

            <div className={styles.spivaSection}>
              <h3>El estudio SPIVA — la evidencia más citada</h3>
              <p>
                S&amp;P Global publica anualmente el estudio SPIVA (S&amp;P Indices Versus Active),
                que compara el rendimiento de fondos activos frente a su índice de referencia.
              </p>
              <div className={styles.spivaChart} role="img" aria-label="Porcentaje de fondos activos que no baten al índice según horizonte">
                {SPIVA_DATA.map(({ periodo, porcentaje, label }) => (
                  <div key={periodo} className={styles.spivaRow}>
                    <span className={styles.spivaPeriodo}>{periodo}</span>
                    <div className={styles.spivaBarWrapper}>
                      <div
                        className={styles.spivaBar}
                        style={{ width: `${porcentaje}%` }}
                        aria-label={label}
                      />
                    </div>
                    <span className={styles.spivaLabel}>{label}</span>
                  </div>
                ))}
              </div>
              <p className={styles.spivaFuente}>Fuente: S&amp;P SPIVA Global Scorecard (promedio histórico)</p>
            </div>

            <h3>¿Por qué es tan difícil batir al mercado?</h3>
            <div className={styles.razonesGrid}>
              {[
                {
                  num: '1',
                  titulo: 'Hipótesis de mercados eficientes (Fama)',
                  desc: 'Los precios ya incorporan toda la información disponible. Para tener ventaja sistemática necesitas información o análisis que el mercado no tiene. En mercados líquidos y transparentes, esto es extraordinariamente difícil.',
                },
                {
                  num: '2',
                  titulo: 'Costes de transacción',
                  desc: 'Cada operación tiene coste (comisión + spread bid/ask). Un fondo activo opera mucho más que un indexado. Estos costes se acumulan y reducen el rendimiento neto.',
                },
                {
                  num: '3',
                  titulo: 'Costes de gestión (TER)',
                  desc: 'El fondo activo ya parte con una desventaja de 1-2% anual frente al índice. Tiene que batir al mercado por ese margen solo para empatar. En 10-20 años, ese 1-2% anual representa decenas de miles de euros.',
                },
                {
                  num: '4',
                  titulo: 'Selección adversa',
                  desc: 'Para que el gestor compre una acción "barata", alguien tiene que vendérsela "barata". Ese alguien también es un profesional con acceso a la misma información. La ventaja media es cero antes de costes.',
                },
              ].map(({ num, titulo, desc }) => (
                <div key={num} className={styles.razonCard}>
                  <span className={styles.razonNum} aria-hidden="true">{num}</span>
                  <div>
                    <h4>{titulo}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.buffettBox}>
              <h3>La apuesta de Buffett (2007–2017)</h3>
              <p>
                En 2007, Warren Buffett apostó <strong>1 millón de dólares</strong> a que ningún
                hedge fund batiría al S&amp;P 500 en 10 años. El contrincante elegido fue{' '}
                <strong>Protégé Partners</strong> con 5 hedge funds de fondos.
              </p>
              <div className={styles.buffettResultados}>
                <div className={styles.buffettItem}>
                  <span className={styles.buffettIcono} aria-hidden="true">📈</span>
                  <strong>S&amp;P 500</strong>
                  <span className={styles.buffettGanador}>+125,8%</span>
                </div>
                <div className={styles.buffettItem}>
                  <span className={styles.buffettIcono} aria-hidden="true">🏆</span>
                  <strong>Mejor hedge fund</strong>
                  <span>+87,7%</span>
                </div>
                <div className={styles.buffettItem}>
                  <span className={styles.buffettIcono} aria-hidden="true">📉</span>
                  <strong>Peor hedge fund</strong>
                  <span>+2,9%</span>
                </div>
              </div>
              <p className={styles.buffettNota}>
                Buffett ganó la apuesta. Donó el millón a la ONG Girls Inc.
              </p>
            </div>

            <div className={styles.warningBox}>
              <h3>¿Cuándo SÍ tiene sentido la gestión activa?</h3>
              <ul>
                <li>
                  <strong>Mercados emergentes e ilíquidos</strong>: menor eficiencia informacional,
                  más oportunidades reales de arbitraje.
                </li>
                <li>
                  <strong>Activos alternativos</strong>: private equity, venture capital. Mercados
                  opacos donde la red de contactos y el análisis profundo tienen valor.
                </li>
                <li>
                  <strong>Ventaja informacional real</strong>: insider trading (ilegal) o análisis
                  muy especializado de nicho. Extremadamente raro para el inversor medio.
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* TAB 3: Comisiones */}
        {tabActivo === 'comisiones' && (
          <section
            id="panel-comisiones"
            role="tabpanel"
            aria-labelledby="tab-comisiones"
            className={styles.content}
          >
            <h2>Las comisiones que erosionan tu capital</h2>

            <h3>Tipos de comisiones</h3>
            <div className={styles.comisionTiposGrid}>
              {[
                {
                  nombre: 'TER (Total Expense Ratio)',
                  desc: 'Gestión + depositario + otros gastos. Se descuenta automáticamente del NAV — no lo ves en tu extracto, pero reduce tu rendimiento cada día.',
                  ejemplo: 'Fondos activos españoles: 1,3–2,5% · ETFs indexados: 0,03–0,5%',
                },
                {
                  nombre: 'Comisión de suscripción',
                  desc: 'Se cobra al entrar en el fondo. Ya es rara en España en fondos tradicionales, pero existe en algunos fondos garantizados y alternativos.',
                  ejemplo: '0–3% del capital invertido',
                },
                {
                  nombre: 'Comisión de reembolso',
                  desc: 'Al salir antes de cierto plazo. Frecuente en fondos garantizados como mecanismo para desincentivar salidas anticipadas.',
                  ejemplo: '0–5% según el fondo y el plazo',
                },
                {
                  nombre: 'Comisión de éxito',
                  desc: 'Porcentaje de las ganancias. Parece justo — el gestor cobra si gana. El problema: si el fondo pierde, no te devuelven nada, pero cuando sube, el gestor se lleva su parte.',
                  ejemplo: 'Suele ser 10–20% de las ganancias sobre el "high water mark"',
                },
              ].map(({ nombre, desc, ejemplo }) => (
                <div key={nombre} className={styles.comisionTipoCard}>
                  <h4>{nombre}</h4>
                  <p>{desc}</p>
                  <span className={styles.comisionEjemplo}>{ejemplo}</span>
                </div>
              ))}
            </div>

            <h3>El efecto devastador del tiempo: 10.000 € durante 30 años al 7% bruto</h3>
            <div className={styles.comisionesTableWrapper}>
              <table className={styles.comisionesTable}>
                <thead>
                  <tr>
                    <th scope="col">Escenario</th>
                    <th scope="col">TER</th>
                    <th scope="col">Resultado final</th>
                    <th scope="col">Coste de comisiones</th>
                  </tr>
                </thead>
                <tbody>
                  {COMISION_SCENARIOS.map(({ nombre, ter, tipo }) => {
                    const resultado = calcularResultado(10000, 7, ter, 30);
                    const referencia = calcularResultado(10000, 7, 0, 30);
                    const coste = referencia - resultado;
                    const isWarning = tipo === 'activo-caro' || tipo === 'activo-tipico';
                    const isBest = tipo === 'sin';
                    return (
                      <tr
                        key={nombre}
                        className={isWarning ? styles.warningRow : isBest ? styles.bestRow : ''}
                      >
                        <td>{nombre}</td>
                        <td>{ter === 0 ? '0%' : `${ter.toFixed(2)}%`}</td>
                        <td><strong>{formatEur(resultado)}</strong></td>
                        <td>{ter === 0 ? '—' : formatEur(coste)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.tablaNota}>
              Estos ejemplos usan rentabilidad constante del 7% para ilustrar el efecto de las
              comisiones. La rentabilidad real varía y puede ser negativa.
            </p>

            <h3>Prueba interactiva: ajusta tu escenario</h3>
            <div className={styles.sliderSection}>
              <div className={styles.sliderGroup}>
                <label htmlFor="slider-ter" className={styles.sliderLabel}>
                  TER anual: <strong>{sliderTer.toFixed(2)}%</strong>
                </label>
                <input
                  id="slider-ter"
                  type="range"
                  min={0}
                  max={2.5}
                  step={0.05}
                  value={sliderTer}
                  onChange={(e) => setSliderTer(parseFloat(e.target.value))}
                  className={styles.slider}
                  aria-label={`TER anual: ${sliderTer.toFixed(2)}%`}
                />
                <div className={styles.sliderTicks}>
                  <span>0%</span>
                  <span>0,5%</span>
                  <span>1%</span>
                  <span>1,5%</span>
                  <span>2%</span>
                  <span>2,5%</span>
                </div>
              </div>

              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>
                  Horizonte temporal: <strong>{sliderAnios} años</strong>
                </label>
                <div className={styles.aniosButtons} role="group" aria-label="Seleccionar horizonte temporal">
                  {[10, 20, 30].map((a) => (
                    <button
                      key={a}
                      onClick={() => setSliderAnios(a)}
                      className={`${styles.anioBtn} ${sliderAnios === a ? styles.anioBtnActive : ''}`}
                      aria-pressed={sliderAnios === a}
                    >
                      {a} años
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.resultGrid} role="region" aria-live="polite" aria-label="Resultados del escenario">
                <div className={styles.resultCard}>
                  <span className={styles.resultIcono} aria-hidden="true">📈</span>
                  <span className={styles.resultLabel}>Tu resultado</span>
                  <span className={styles.resultValor}>{formatEur(resultadoSlider)}</span>
                  <span className={styles.resultSub}>10.000 € al {sliderTer.toFixed(2)}% TER</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultIcono} aria-hidden="true">📊</span>
                  <span className={styles.resultLabel}>Referencia ETF barato (0,20% TER)</span>
                  <span className={styles.resultValor}>{formatEur(resultadoReferencia)}</span>
                  <span className={styles.resultSub}>Misma inversión, menos comisiones</span>
                </div>
                <div className={`${styles.resultCard} ${costeComisiones > 0 ? styles.resultCardWarning : styles.resultCardPositivo}`}>
                  <span className={styles.resultIcono} aria-hidden="true">{costeComisiones > 0 ? '💸' : '✅'}</span>
                  <span className={styles.resultLabel}>
                    {costeComisiones > 0 ? 'Coste extra vs ETF barato' : 'Ahorro vs ETF barato'}
                  </span>
                  <span className={styles.resultValor}>{formatEur(Math.abs(costeComisiones))}</span>
                  <span className={styles.resultSub}>En {sliderAnios} años de diferencia de TER</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: Diversificación */}
        {tabActivo === 'diversificacion' && (
          <section
            id="panel-diversificacion"
            role="tabpanel"
            aria-labelledby="tab-diversificacion"
            className={styles.content}
          >
            <h2>Diversificación real: más allá del mito</h2>

            <div className={styles.diversGrid}>
              <div className={styles.ilusionCard}>
                <h3>
                  <span aria-hidden="true">❌</span> La ilusión de diversificación
                </h3>
                <ul>
                  <li>
                    <strong>10 fondos de RV europea</strong> → Correlación {'>'}0,9 en crisis. No es
                    diversificación, es lo mismo 10 veces.
                  </li>
                  <li>
                    <strong>20 acciones tecnológicas EEUU</strong> → Si cae el sector tech, caen
                    todas.
                  </li>
                  <li>
                    <strong>Fondo «global» con 70% en EEUU</strong> → Concentración geográfica
                    elevada, aunque el nombre diga «global».
                  </li>
                </ul>
              </div>
              <div className={styles.realCard}>
                <h3>
                  <span aria-hidden="true">✅</span> Diversificación real
                </h3>
                <p>Activos que NO se mueven igual en crisis:</p>
                <ul>
                  <li>
                    <strong>Clases de activos:</strong> RV + renta fija + inmobiliario + materias
                    primas + liquidez
                  </li>
                  <li>
                    <strong>Geografías:</strong> desarrollados (EEUU / Europa / Japón) + emergentes
                    (Asia, LatAm)
                  </li>
                  <li>
                    <strong>Divisas:</strong> no todo en euros (pero el riesgo divisa es a doble
                    filo)
                  </li>
                  <li>
                    <strong>Factores:</strong> value, growth, small cap, momentum — correlación baja
                    entre sí en el largo plazo
                  </li>
                </ul>
              </div>
            </div>

            <h3>El problema de la correlación en crisis</h3>
            <div className={styles.correlacionGrid}>
              {[
                {
                  icono: '😌',
                  titulo: 'En tiempos normales',
                  desc: 'Activos distintos tienen correlaciones bajas o incluso negativas. La diversificación funciona bien.',
                  tipo: 'normal',
                },
                {
                  icono: '🚨',
                  titulo: 'En crisis severas (2008, COVID marzo 2020)',
                  desc: 'Casi todos los activos caen juntos. "Flight to quality": los inversores venden todo para tener liquidez. La correlación se dispara hacia 1.',
                  tipo: 'crisis',
                },
                {
                  icono: '🛡️',
                  titulo: 'Lo que SÍ resiste en crisis',
                  desc: 'Bonos soberanos de alta calidad (alemanes, US Treasuries) tienden a subir cuando la RV cae. El oro es parcialmente anticíclico pero impredecible.',
                  tipo: 'refugio',
                },
              ].map(({ icono, titulo, desc, tipo }) => (
                <div key={tipo} className={`${styles.correlacionCard} ${styles[`correlacion-${tipo}`]}`}>
                  <span className={styles.correlacionIcono} aria-hidden="true">{icono}</span>
                  <h4>{titulo}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.markowitzBox}>
              <h3>La frontera eficiente de Markowitz</h3>
              <p>
                El Nobel Harry Markowitz demostró que combinar activos con correlación baja produce
                carteras <strong>más eficientes</strong>: mayor rentabilidad esperada por unidad de
                riesgo.
              </p>
              <p>
                Ejemplo contraintuitivo: una cartera <strong>80% RV + 20% RF</strong> puede tener
                una rentabilidad esperada similar a una cartera 100% RV pero con menor
                volatilidad — porque cuando la RV cae, la RF amortigua.
              </p>
              <div className={styles.markowitzVisual} role="img" aria-label="Curva de frontera eficiente: combinaciones óptimas de riesgo y rentabilidad">
                <svg viewBox="0 0 300 180" className={styles.markowitzSvg} aria-hidden="true">
                  <defs>
                    <linearGradient id="curvaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--secondary)" />
                      <stop offset="100%" stopColor="var(--primary)" />
                    </linearGradient>
                  </defs>
                  {/* Ejes */}
                  <line x1="30" y1="150" x2="280" y2="150" stroke="var(--text-secondary)" strokeWidth="1.5" />
                  <line x1="30" y1="10" x2="30" y2="150" stroke="var(--text-secondary)" strokeWidth="1.5" />
                  {/* Etiquetas */}
                  <text x="155" y="170" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">Riesgo (volatilidad)</text>
                  <text x="10" y="80" textAnchor="middle" fontSize="11" fill="var(--text-secondary)" transform="rotate(-90, 10, 80)">Rentabilidad</text>
                  {/* Curva eficiente */}
                  <path
                    d="M 60,130 Q 100,70 160,45 T 270,25"
                    fill="none"
                    stroke="url(#curvaGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Puntos de referencia */}
                  <circle cx="80" cy="115" r="5" fill="var(--secondary)" />
                  <text x="90" y="112" fontSize="9" fill="var(--text-secondary)">100% RF</text>
                  <circle cx="180" cy="40" r="5" fill="var(--primary)" />
                  <text x="190" y="38" fontSize="9" fill="var(--text-secondary)">100% RV</text>
                  <circle cx="130" cy="55" r="5" fill="#48A9A6" />
                  <text x="140" y="52" fontSize="9" fill="var(--text-secondary)">80/20 óptimo</text>
                </svg>
              </div>
            </div>

            <div className={styles.warningBox}>
              <h3>Regla práctica: antes de invertir en fondos</h3>
              <ul>
                <li>
                  <strong>Fondo de emergencia primero:</strong> 3–6 meses de gastos en cuentas
                  líquidas. Sin esto, cualquier inversión a largo plazo puede forzarte a reembolsar
                  en mal momento.
                </li>
                <li>
                  <strong>Deudas caras primero:</strong> Si tienes deuda a más del 5% anual,
                  amortizarla es rentabilidad garantizada sin riesgo.
                </li>
                <li>
                  <strong>Horizonte temporal:</strong> La RV solo es adecuada si puedes mantener la
                  inversión al menos 5–10 años sin necesitar el dinero.
                </li>
              </ul>
            </div>
          </section>
        )}
      </main>

      <EducationalSection title="Conceptos clave de fondos de inversión" subtitle="ETFs, fiscalidad en España y la letra pequeña de los fondos garantizados">
        <div>
          <h3>¿Qué es un ETF y en qué se diferencia de un fondo?</h3>
          <p>
            Un <strong>ETF (Exchange Traded Fund)</strong> es un fondo indexado que cotiza en bolsa
            como si fuera una acción. Puedes comprarlo y venderlo en cualquier momento del día al
            precio de mercado (no al NAV de cierre del día como los fondos tradicionales).
          </p>
          <p>
            Las diferencias prácticas: Los ETFs suelen tener TER más bajos (0,03–0,20%). Los fondos
            tradicionales permiten traspaso entre fondos sin tributar en España (ventaja fiscal
            importante). Los ETFs no tienen esta ventaja fiscal, pero son más accesibles y más
            baratos.
          </p>

          <h3>La fiscalidad ventajosa de los fondos en España</h3>
          <p>
            En España, el traspaso entre fondos de inversión <strong>no tributa</strong>. Puedes
            mover tu dinero de un fondo a otro sin pagar impuestos hasta el momento del reembolso
            final. Esto permite optimizar la cartera a lo largo del tiempo sin coste fiscal.
          </p>
          <p>
            Al reembolsar, la ganancia tributa como renta del ahorro: 19% hasta 6.000 €, 21% de
            6.001 a 50.000 €, 23% de 50.001 a 200.000 €, 27% a partir de 200.000 €.
          </p>

          <h3>La letra pequeña de los fondos garantizados</h3>
          <p>
            Un fondo garantizado promete preservar el capital (y a veces una rentabilidad mínima) si
            se mantiene hasta el vencimiento. La trampa: el plazo suele ser 3–5 años, con comisiones
            de reembolso altísimas si sales antes. La rentabilidad garantizada suele ser modesta (a
            veces 0% en términos reales una vez descontada la inflación). Y la garantía la da la
            entidad comercializadora, no el Estado — si quiebra, el riesgo existe.
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-fondo-inversion')} />
      <ShareCard appName="visualizador-fondo-inversion" />
      <Footer appName="visualizador-fondo-inversion" />
    </div>
  );
}
