'use client';

import { useState } from 'react';
import styles from './SimuladorPlacasSolares.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

/* ─── DATOS TÉCNICOS ─── */

interface ZonaSolar {
  id: string;
  nombre: string;
  irradiacion: number; // kWh/m²/año
  provincias: string;
}

const ZONAS_SOLARES: ZonaSolar[] = [
  { id: 'norte', nombre: 'Zona Norte', irradiacion: 1300, provincias: 'Galicia, Asturias, Cantabria, País Vasco' },
  { id: 'centro-norte', nombre: 'Zona Centro-Norte', irradiacion: 1500, provincias: 'Castilla y León, Navarra, La Rioja, Aragón' },
  { id: 'centro', nombre: 'Zona Centro', irradiacion: 1700, provincias: 'Madrid, Castilla-La Mancha, Extremadura' },
  { id: 'mediterranea', nombre: 'Zona Mediterránea', irradiacion: 1650, provincias: 'Cataluña, Valencia, Murcia, Baleares' },
  { id: 'sur', nombre: 'Zona Sur', irradiacion: 1850, provincias: 'Andalucía, Canarias' },
];

interface Orientacion {
  id: string;
  nombre: string;
  factor: number;
  descripcion: string;
}

const ORIENTACIONES: Orientacion[] = [
  { id: 'sur', nombre: 'Sur', factor: 1.0, descripcion: 'Orientación óptima' },
  { id: 'sureste-suroeste', nombre: 'Sureste / Suroeste', factor: 0.95, descripcion: 'Muy buena orientación' },
  { id: 'este-oeste', nombre: 'Este / Oeste', factor: 0.80, descripcion: 'Orientación aceptable' },
  { id: 'norte', nombre: 'Norte', factor: 0.55, descripcion: 'No recomendada' },
];

const POTENCIAS_RAPIDAS = [3, 5, 8, 10]; // kWp

// Constantes técnicas
const PRECIO_ELECTRICIDAD_DEFECTO = 0.18;    // €/kWh
const COMPENSACION_EXCEDENTES = 0.05;        // €/kWh
const COSTE_INSTALACION_KWP = 1500;          // €/kWp (referencia media)
const CO2_FACTOR = 0.12;                     // kg CO2/kWh (mix eléctrico España 2024)
const RATIO_AUTOCONSUMO_SIN_BATERIA = 0.30;
const RATIO_AUTOCONSUMO_CON_BATERIA = 0.70;
const DEGRADACION_ANUAL = 0.005;             // 0,5%/año

/* ─── INTERFACES DE RESULTADOS ─── */

interface Resultados {
  produccionAnual: number;       // kWh/año
  autoconsumoKwh: number;        // kWh/año
  excedenteKwh: number;          // kWh/año
  ahorroAutoconsumo: number;     // €/año
  ingresoExcedentes: number;     // €/año
  ahorroTotal: number;           // €/año
  costeInstalacion: number;      // €
  amortizacionAnios: number;     // años
  co2Evitado: number;            // kg/año
  consumoAnual: number;          // kWh/año
  ratioAutoconsumo: number;      // 0-1
}

export default function SimuladorPlacasSolaresPage() {
  // Estado del formulario
  const [zonaId, setZonaId] = useState('centro');
  const [consumoMensual, setConsumoMensual] = useState('');
  const [precioElectricidad, setPrecioElectricidad] = useState('0,18');
  const [potenciaKwp, setPotenciaKwp] = useState('');
  const [conBateria, setConBateria] = useState(false);
  const [orientacionId, setOrientacionId] = useState('sur');

  // Estado de resultados
  const [resultados, setResultados] = useState<Resultados | null>(null);

  const parseInput = (val: string): number => {
    return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const calcular = () => {
    const consumo = parseInput(consumoMensual);
    const precio = parseInput(precioElectricidad);
    const potencia = parseInput(potenciaKwp);

    if (consumo <= 0 || precio <= 0 || potencia <= 0) return;

    const zona = ZONAS_SOLARES.find(z => z.id === zonaId);
    const orientacion = ORIENTACIONES.find(o => o.id === orientacionId);
    if (!zona || !orientacion) return;

    const consumoAnual = consumo * 12;
    const produccionAnual = potencia * zona.irradiacion * orientacion.factor;
    const ratioAutoconsumo = conBateria ? RATIO_AUTOCONSUMO_CON_BATERIA : RATIO_AUTOCONSUMO_SIN_BATERIA;

    // El autoconsumo no puede superar el consumo anual
    const autoconsumoKwh = Math.min(produccionAnual * ratioAutoconsumo, consumoAnual);
    const excedenteKwh = produccionAnual - autoconsumoKwh;

    const ahorroAutoconsumo = autoconsumoKwh * precio;
    const ingresoExcedentes = excedenteKwh * COMPENSACION_EXCEDENTES;
    const ahorroTotal = ahorroAutoconsumo + ingresoExcedentes;

    const costeInstalacion = potencia * COSTE_INSTALACION_KWP;
    const amortizacionAnios = ahorroTotal > 0 ? costeInstalacion / ahorroTotal : 0;

    const co2Evitado = produccionAnual * CO2_FACTOR;

    setResultados({
      produccionAnual,
      autoconsumoKwh,
      excedenteKwh,
      ahorroAutoconsumo,
      ingresoExcedentes,
      ahorroTotal,
      costeInstalacion,
      amortizacionAnios,
      co2Evitado,
      consumoAnual,
      ratioAutoconsumo,
    });
  };

  // Para la barra comparativa
  const maxBar = resultados
    ? Math.max(resultados.consumoAnual, resultados.produccionAnual)
    : 1;

  const barPct = (val: number) => Math.max(2, (val / maxBar) * 100);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroIcon} aria-hidden="true">&#9728;&#65039;</div>
          <h1 className={styles.title}>Simulador de Ahorro con Placas Solares</h1>
          <p className={styles.subtitle}>
            Estima tu producción fotovoltaica, ahorro anual y período de amortización en España
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="financial"
          severity="high"
          context="simulador-placas-solares"
        >
          Los resultados son estimaciones orientativas basadas en datos medios de irradiación solar. La producción real depende de la orientación exacta, inclinación, sombras, calidad de los paneles y condiciones climáticas locales. Solicita siempre un estudio técnico personalizado a un instalador acreditado.
        </DisclaimerCard>

        {/* Formulario */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">&#9881;&#65039;</span> Configura tu instalación
          </h2>

          <div className={styles.formGrid}>
            {/* Zona geográfica */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="zona">Zona geográfica</label>
              <select
                id="zona"
                className={styles.select}
                value={zonaId}
                onChange={e => setZonaId(e.target.value)}
              >
                {ZONAS_SOLARES.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.nombre} — {formatNumber(z.irradiacion, 0)} kWh/m²/año ({z.provincias})
                  </option>
                ))}
              </select>
            </div>

            {/* Orientación */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="orientacion">Orientación del tejado</label>
              <select
                id="orientacion"
                className={styles.select}
                value={orientacionId}
                onChange={e => setOrientacionId(e.target.value)}
              >
                {ORIENTACIONES.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.nombre} ({Math.round(o.factor * 100)}% rendimiento) — {o.descripcion}
                  </option>
                ))}
              </select>
            </div>

            {/* Consumo mensual */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="consumo">Consumo mensual (kWh)</label>
              <input
                id="consumo"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={consumoMensual}
                onChange={e => setConsumoMensual(e.target.value)}
                placeholder="Ej: 300"
                aria-label="Consumo eléctrico mensual en kilovatios hora"
              />
              <span className={styles.helperText}>Lo encuentras en tu factura de la luz</span>
            </div>

            {/* Precio electricidad */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="precio">Precio electricidad (€/kWh)</label>
              <input
                id="precio"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={precioElectricidad}
                onChange={e => setPrecioElectricidad(e.target.value)}
                placeholder="0,18"
                aria-label="Precio del kilovatio hora en euros"
              />
              <span className={styles.helperText}>Referencia media: {formatCurrency(PRECIO_ELECTRICIDAD_DEFECTO)}/kWh</span>
            </div>

            {/* Potencia instalación */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="potencia">Potencia instalación (kWp)</label>
              <input
                id="potencia"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={potenciaKwp}
                onChange={e => setPotenciaKwp(e.target.value)}
                placeholder="Ej: 5"
                aria-label="Potencia de la instalación en kilovatios pico"
              />
              <div className={styles.quickButtons}>
                {POTENCIAS_RAPIDAS.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.quickBtn} ${potenciaKwp === String(p) ? styles.quickBtnActive : ''}`}
                    onClick={() => setPotenciaKwp(String(p))}
                    aria-label={`Seleccionar ${p} kWp`}
                    aria-pressed={potenciaKwp === String(p)}
                  >
                    {p} kWp
                  </button>
                ))}
              </div>
            </div>

            {/* Batería */}
            <div className={styles.field}>
              <span className={styles.label}>Almacenamiento</span>
              <label
                className={`${styles.checkboxRow} ${conBateria ? styles.checkboxRowActive : ''}`}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={conBateria}
                  onChange={e => setConBateria(e.target.checked)}
                />
                <span className={styles.checkboxLabel}>Batería de almacenamiento</span>
              </label>
              <span className={styles.checkboxHelper}>
                {conBateria
                  ? `Autoconsumo estimado: ~${Math.round(RATIO_AUTOCONSUMO_CON_BATERIA * 100)}% de la producción`
                  : `Sin batería: ~${Math.round(RATIO_AUTOCONSUMO_SIN_BATERIA * 100)}% autoconsumo directo`}
              </span>
            </div>

            {/* Botón */}
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={calcular}
                aria-label="Simular ahorro con placas solares"
              >
                Simular ahorro
              </button>
            </div>
          </div>
        </section>

        {/* Resultados */}
        {resultados && (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span aria-hidden="true">&#128200;</span> Resultados de la simulación
              </h2>

              <div className={styles.resultsGrid}>
                <div className={styles.resultCard}>
                  <span className={`${styles.resultValue} ${styles.resultValueSolar}`}>
                    {formatNumber(resultados.produccionAnual, 0)} kWh
                  </span>
                  <span className={styles.resultLabel}>Producción anual estimada</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={`${styles.resultValue} ${styles.resultValueHighlight}`}>
                    {formatNumber(resultados.autoconsumoKwh, 0)} kWh
                  </span>
                  <span className={styles.resultLabel}>Autoconsumo estimado/año</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>
                    {formatNumber(resultados.excedenteKwh, 0)} kWh
                  </span>
                  <span className={styles.resultLabel}>Excedente vertido a red</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={`${styles.resultValue} ${styles.resultValueHighlight}`}>
                    {formatCurrency(resultados.ahorroAutoconsumo)}
                  </span>
                  <span className={styles.resultLabel}>Ahorro por autoconsumo/año</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>
                    {formatCurrency(resultados.ingresoExcedentes)}
                  </span>
                  <span className={styles.resultLabel}>Compensación excedentes/año</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={`${styles.resultValue} ${styles.resultValueHighlight}`}>
                    {formatCurrency(resultados.ahorroTotal)}
                  </span>
                  <span className={styles.resultLabel}>Ahorro total anual</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>
                    {formatCurrency(resultados.costeInstalacion)}
                  </span>
                  <span className={styles.resultLabel}>Coste estimado instalación</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={`${styles.resultValue} ${styles.resultValueHighlight}`}>
                    {formatNumber(resultados.co2Evitado, 0)} kg
                  </span>
                  <span className={styles.resultLabel}>CO₂ evitado/año</span>
                </div>
              </div>

              {/* Barra comparativa */}
              <div className={styles.barChart} role="img" aria-label="Comparativa de consumo y producción anual">
                <div className={styles.barRow}>
                  <span className={styles.barLabel}>Consumo</span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${styles.barConsumo}`}
                      style={{ width: `${barPct(resultados.consumoAnual)}%` }}
                    >
                      {formatNumber(resultados.consumoAnual, 0)}
                    </div>
                  </div>
                  <span className={styles.barValue}>kWh/año</span>
                </div>
                <div className={styles.barRow}>
                  <span className={styles.barLabel}>Producción</span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${styles.barProduccion}`}
                      style={{ width: `${barPct(resultados.produccionAnual)}%` }}
                    >
                      {formatNumber(resultados.produccionAnual, 0)}
                    </div>
                  </div>
                  <span className={styles.barValue}>kWh/año</span>
                </div>
                <div className={styles.barRow}>
                  <span className={styles.barLabel}>Autoconsumo</span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${styles.barAutoconsumo}`}
                      style={{ width: `${barPct(resultados.autoconsumoKwh)}%` }}
                    >
                      {formatNumber(resultados.autoconsumoKwh, 0)}
                    </div>
                  </div>
                  <span className={styles.barValue}>kWh/año</span>
                </div>
              </div>

              {/* Amortización destacada */}
              <div className={styles.amortizacionCard} role="alert" aria-live="polite">
                <span className={styles.amortizacionValor}>
                  {formatNumber(resultados.amortizacionAnios, 1)} años
                </span>
                <span className={styles.amortizacionLabel}>Período de amortización estimado</span>
                <p className={styles.amortizacionDetalle}>
                  Inversión de {formatCurrency(resultados.costeInstalacion)} con un ahorro anual de {formatCurrency(resultados.ahorroTotal)}.
                  {' '}La vida útil de los paneles supera los 25 años (degradación ~{formatNumber(DEGRADACION_ANUAL * 100, 1)}%/año).
                </p>
              </div>
            </section>
          </>
        )}

        {/* Educación v2.0 */}
        <EducationalSection
          title="Guía completa sobre autoconsumo fotovoltaico en España"
          subtitle="Todo lo que necesitas saber antes de instalar placas solares"
        >
          {/* Cómo funciona la energía solar */}
          <section className={styles.guideSection}>
            <h2>¿Cómo funcionan las placas solares?</h2>
            <div className={styles.stepsGrid}>
              {[
                { n: '1', titulo: 'Captación solar', desc: 'Los paneles fotovoltaicos convierten la radiación solar en corriente continua (DC) mediante células de silicio. A más irradiación, más producción.' },
                { n: '2', titulo: 'Inversión de corriente', desc: 'Un inversor transforma la corriente continua en corriente alterna (AC) compatible con los electrodomésticos de tu hogar.' },
                { n: '3', titulo: 'Autoconsumo directo', desc: 'La energía generada se consume primero en tu vivienda. Todo lo que produces y usas simultáneamente es ahorro directo en la factura.' },
                { n: '4', titulo: 'Excedentes a la red', desc: 'La energía sobrante se vierte a la red eléctrica. Con compensación simplificada, tu comercializadora te descuenta ~0,05 €/kWh de la factura.' },
                { n: '5', titulo: 'Batería (opcional)', desc: 'Una batería almacena excedentes para usarlos por la noche o en horas punta, aumentando el autoconsumo del 30% al 70% aproximadamente.' },
                { n: '6', titulo: 'Monitorización', desc: 'La mayoría de instalaciones incluyen una app de monitorización donde puedes ver la producción, consumo y ahorro en tiempo real.' },
              ].map(s => (
                <div key={s.n} className={styles.stepCard}>
                  <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
                  <h3>{s.titulo}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Compensación PVPC */}
          <section className={styles.guideSection}>
            <h2>¿Qué es la compensación de excedentes?</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Desde 2019, el RD 244/2019 permite la <strong>compensación simplificada</strong> para instalaciones de hasta 100 kW.
              Tu comercializadora descuenta el valor de la energía excedentaria de tu factura mensual (nunca puedes ganar dinero,
              solo reducir la parte variable de la factura a cero). El precio de compensación varía entre 0,03 y 0,08 €/kWh según
              la comercializadora y el mercado. En esta simulación usamos 0,05 €/kWh como referencia media.
            </p>
          </section>

          {/* Tabla comparativa con/sin batería */}
          <section className={styles.guideSection}>
            <h2>Comparativa: con batería vs sin batería</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Sin batería</th>
                    <th>Con batería</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Autoconsumo</td>
                    <td>~30% de la producción</td>
                    <td>~70% de la producción</td>
                  </tr>
                  <tr>
                    <td>Coste instalación (5 kWp)</td>
                    <td>{formatCurrency(5 * COSTE_INSTALACION_KWP)}</td>
                    <td>{formatCurrency(5 * COSTE_INSTALACION_KWP + 4000)} (batería ~4.000 €)</td>
                  </tr>
                  <tr>
                    <td>Excedentes vertidos</td>
                    <td>Alto: mucho excedente a red</td>
                    <td>Bajo: se almacena para la noche</td>
                  </tr>
                  <tr>
                    <td>Independencia energética</td>
                    <td>Parcial: dependes de la red de noche</td>
                    <td>Alta: cubres noche y picos</td>
                  </tr>
                  <tr>
                    <td>Amortización</td>
                    <td>6-10 años típicamente</td>
                    <td>8-14 años (mayor inversión)</td>
                  </tr>
                  <tr>
                    <td>Vida útil batería</td>
                    <td>N/A</td>
                    <td>10-15 años (litio)</td>
                  </tr>
                  <tr>
                    <td>Mejor para...</td>
                    <td>Consumo diurno alto (teletrabajo)</td>
                    <td>Consumo nocturno o tarifa variable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4 Escenarios */}
          <section className={styles.guideSection}>
            <h2>Escenarios típicos de instalación</h2>
            <div className={styles.scenariosGrid}>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">&#127960;&#65039;</span>
                <h3>Piso pequeño (2-3 kWp)</h3>
                <p>Consumo de ~200 kWh/mes. Instalación en cubierta comunitaria o balcón solar. Ahorro modesto pero amortización rápida. Ideal para empezar con autoconsumo.</p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">&#127968;</span>
                <h3>Chalet unifamiliar (5-8 kWp)</h3>
                <p>Consumo de 300-500 kWh/mes. Tejado propio con buena orientación. El escenario más rentable: amortización en 6-9 años y ahorro significativo durante 25+ años.</p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">&#127970;</span>
                <h3>Comunidad de vecinos (15-30 kWp)</h3>
                <p>Autoconsumo colectivo (RD 244/2019). La inversión se reparte entre vecinos. Requiere acuerdo de la junta con 1/3 de votos. Reducción notable en zonas comunes y viviendas.</p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">&#127806;</span>
                <h3>Casa rural / aislada (8-15 kWp)</h3>
                <p>Consumo variable con picos estacionales. Batería casi imprescindible por falta de conexión a red o conexión débil. Mayor independencia energética y ahorro en gasoil/generador.</p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes sobre placas solares</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h3>¿Necesito permiso para instalar placas solares?</h3>
                <p>Sí: necesitas licencia de obra menor del ayuntamiento, autorización de la distribuidora (si viertes excedentes) y alta en el RAIPRE si superas 100 kW. Para viviendas unifamiliares el trámite es sencillo y muchos instaladores lo gestionan.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Cuánto duran los paneles solares?</h3>
                <p>Los paneles de calidad tienen garantía de producción de 25-30 años, con una degradación del 0,5% anual. El inversor dura 10-15 años y es el componente que más probablemente necesites reemplazar.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Hay subvenciones disponibles?</h3>
                <p>Sí: los fondos Next Generation EU financian parte de la instalación (hasta 600 €/kWp en paneles y hasta 490 €/kWh en baterías). Las convocatorias dependen de cada Comunidad Autónoma y pueden estar agotadas. Consulta el IDAE.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Puedo instalar placas solares en un piso?</h3>
                <p>Sí, hay dos opciones: autoconsumo colectivo en la cubierta del edificio (requiere acuerdo de la comunidad con 1/3 de votos) o paneles de balcón (kits plug&amp;play de 300-800W, sin obra).</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Qué pasa en días nublados o en invierno?</h3>
                <p>Los paneles siguen produciendo con luz difusa, aunque la producción baja un 60-80%. En invierno, los días más cortos reducen la producción mensual. La irradiación anual media ya tiene en cuenta estas variaciones estacionales.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Cuánto mantenimiento necesitan?</h3>
                <p>Muy poco: limpieza de paneles 1-2 veces al año (la lluvia ayuda), revisión del inversor y cableado anual. Coste estimado: 100-200 €/año. La monitorización online permite detectar fallos rápidamente.</p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className={styles.guideSection}>
            <h2>6 consejos para maximizar tu ahorro solar</h2>
            <div className={styles.tipsGrid}>
              {[
                { icon: '&#9200;', titulo: 'Concentra consumo en horas solares', desc: 'Pon lavadora, lavavajillas y otros grandes consumos entre las 10:00 y las 16:00 para maximizar el autoconsumo directo.' },
                { icon: '&#128161;', titulo: 'Dimensiona bien la instalación', desc: 'No sobredimensiones: una instalación demasiado grande genera excedentes que se compensan a precio muy bajo. Ajusta al consumo real.' },
                { icon: '&#128269;', titulo: 'Compara al menos 3 presupuestos', desc: 'Los precios varían mucho entre instaladores. Pide presupuesto detallado con marca de paneles, inversor y garantías incluidas.' },
                { icon: '&#128176;', titulo: 'Aprovecha las subvenciones', desc: 'Solicita fondos Next Generation antes de instalar. Algunas CCAA tienen convocatorias propias adicionales. Infórmate en el IDAE.' },
                { icon: '&#128267;', titulo: 'Considera tarifa con discriminación horaria', desc: 'Con placas solares, una tarifa con tramos horarios te beneficia: produces gratis en punta y consumes de red en valle (más barato).' },
                { icon: '&#128200;', titulo: 'Monitoriza tu producción', desc: 'Usa la app del inversor para controlar que la producción real coincide con la estimada. Una caída puede indicar suciedad o avería.' },
              ].map(t => (
                <div key={t.titulo} className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: t.icon }} />
                  <h3>{t.titulo}</h3>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Warning box */}
          <section className={styles.warningBox}>
            <h2>Advertencias importantes</h2>
            <div className={styles.warningGrid}>
              {[
                { titulo: 'Las estimaciones son orientativas', desc: 'La producción real depende de sombras, inclinación exacta, temperatura, suciedad y calidad del equipo. Solo un estudio técnico in situ puede dar cifras precisas.' },
                { titulo: 'Los precios de la electricidad fluctúan', desc: 'El precio medio de referencia (0,18 €/kWh) puede variar significativamente. En tarifa PVPC el precio cambia cada hora. Ajusta el simulador a tu precio real.' },
                { titulo: 'Las subvenciones tienen plazos y fondos limitados', desc: 'Los fondos Next Generation y las ayudas autonómicas pueden agotarse o cambiar de condiciones. Verifica siempre la convocatoria vigente antes de contar con ellas.' },
                { titulo: 'La compensación de excedentes tiene límites', desc: 'Solo puedes compensar hasta el importe de la energía consumida de red ese mes (nunca a favor). Si produces mucho más de lo que consumes, el excedente extra no se paga.' },
              ].map(w => (
                <div key={w.titulo} className={styles.warningItem}>
                  <strong>{w.titulo}</strong>
                  <p>{w.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-placas-solares')} />
        <ShareCard appName="simulador-placas-solares" />
        <Footer appName="simulador-placas-solares" />
    </div>
  );
}
