'use client';

import { useState, useMemo } from 'react';
import styles from './ConversorPesetasEuros.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import RegionBadge from '@/components/RegionBadge';
import EducationalSection from '@/components/EducationalSection';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { IPC_DATA, IPC_MAX_YEAR, TASA_FIJA_PESETA_EURO } from '@/data/ipc-ine';

// La peseta circuló hasta el 28/02/2002; los años seleccionables para "valor real
// hoy" son los que tienen IPC y son anteriores a la desaparición física de la moneda.
const AÑOS_PESETA = Object.keys(IPC_DATA)
  .map(Number)
  .filter((año) => año <= 2001)
  .sort((a, b) => a - b);

type ModoApp = 'directa' | 'historico';
type Direccion = 'ptasAEuros' | 'eurosAPtas';

export default function ConversorPesetasEurosPage() {
  const [modo, setModo] = useState<ModoApp>('directa');

  // Modo conversión directa
  const [cantidadDirecta, setCantidadDirecta] = useState('100000');
  const [direccion, setDireccion] = useState<Direccion>('ptasAEuros');

  // Modo valor real hoy
  const [cantidadHistorica, setCantidadHistorica] = useState('100000');
  const [añoReferencia, setAñoReferencia] = useState(1985);

  const resultadoDirecta = useMemo(() => {
    const cantidad = parseSpanishNumber(cantidadDirecta);
    if (isNaN(cantidad) || cantidad < 0) return null;

    const convertido = direccion === 'ptasAEuros'
      ? cantidad / TASA_FIJA_PESETA_EURO
      : cantidad * TASA_FIJA_PESETA_EURO;

    return { cantidad, convertido };
  }, [cantidadDirecta, direccion]);

  const resultadoHistorico = useMemo(() => {
    const cantidad = parseSpanishNumber(cantidadHistorica);
    if (isNaN(cantidad) || cantidad < 0) return null;

    const ipcAño = IPC_DATA[añoReferencia];
    const ipcHoy = IPC_DATA[IPC_MAX_YEAR];
    if (!ipcAño || !ipcHoy) return null;

    const eurosÉpoca = cantidad / TASA_FIJA_PESETA_EURO;
    const valorHoy = eurosÉpoca * (ipcHoy / ipcAño);
    const inflacionAcumulada = ((ipcHoy - ipcAño) / ipcAño) * 100;
    const añosTranscurridos = IPC_MAX_YEAR - añoReferencia;

    return { cantidad, eurosÉpoca, valorHoy, inflacionAcumulada, añosTranscurridos };
  }, [cantidadHistorica, añoReferencia]);

  const intercambiarDireccion = () => {
    setDireccion((prev) => (prev === 'ptasAEuros' ? 'eurosAPtas' : 'ptasAEuros'));
  };

  const hitosHistoricos = [
    { fecha: '1868', evento: 'Se crea la peseta como moneda decimal española' },
    { fecha: '1986', evento: 'España entra en la CEE' },
    { fecha: '01/01/1999', evento: 'Se fija de forma irrevocable el tipo de cambio: 166,386 ptas/€' },
    { fecha: 'ene-feb 2002', evento: 'Doble circulación: euro y peseta a la vez' },
    { fecha: '01/03/2002', evento: 'El euro pasa a ser la única moneda de curso legal' },
    { fecha: '30/06/2021', evento: 'Termina el plazo de canje en el Banco de España' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🪙</span> Conversor de Pesetas a Euros</h1>
        <p className={styles.subtitle}>
          Convierte al tipo oficial y descubre cuánto valdría esa cantidad hoy según la inflación
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated="2026-08-30" />

      {/* Selector de modo */}
      <div className={styles.modoSelector}>
        <button
          type="button"
          onClick={() => setModo('directa')}
          className={`${styles.modoBtn} ${modo === 'directa' ? styles.modoActivo : ''}`}
          aria-pressed={modo === 'directa'}
        >
          <span className={styles.modoIcon} aria-hidden="true">🔄</span>
          <span className={styles.modoNombre}>Conversión oficial</span>
        </button>
        <button
          type="button"
          onClick={() => setModo('historico')}
          className={`${styles.modoBtn} ${modo === 'historico' ? styles.modoActivo : ''}`}
          aria-pressed={modo === 'historico'}
        >
          <span className={styles.modoIcon} aria-hidden="true">📈</span>
          <span className={styles.modoNombre}>Valor real hoy</span>
        </button>
      </div>

      {modo === 'directa' ? (
        <div className={styles.mainContent}>
          <div className={styles.inputPanel}>
            <h2 className={styles.panelTitle}>Introduce la cantidad</h2>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="cantidad-directa">
                {direccion === 'ptasAEuros' ? 'Cantidad en pesetas' : 'Cantidad en euros (€)'}
              </label>
              <input
                id="cantidad-directa"
                type="text"
                inputMode="decimal"
                value={cantidadDirecta}
                onChange={(e) => setCantidadDirecta(e.target.value)}
                className={styles.input}
                placeholder="100000"
              />
            </div>

            <div className={styles.yearSelectors}>
              <div className={styles.inputGroup}>
                <span className={styles.label}>
                  {direccion === 'ptasAEuros' ? 'Pesetas' : 'Euros'}
                </span>
              </div>
              <button
                type="button"
                onClick={intercambiarDireccion}
                className={styles.swapButton}
                title="Cambiar dirección de la conversión"
              >
                ⇄
              </button>
              <div className={styles.inputGroup}>
                <span className={styles.label}>
                  {direccion === 'ptasAEuros' ? 'Euros' : 'Pesetas'}
                </span>
              </div>
            </div>

            <div className={styles.presets}>
              <span className={styles.presetsLabel}>Cantidades habituales:</span>
              <div className={styles.presetButtons}>
                {[1000, 10000, 100000, 1000000].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setCantidadDirecta(String(valor))}
                    className={styles.presetBtn}
                  >
                    {formatNumber(valor, 0)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.resultsPanel}>
            {resultadoDirecta ? (
              <>
                <div className={styles.mainResult}>
                  <div className={styles.resultLabel}>
                    {direccion === 'ptasAEuros'
                      ? `${formatNumber(resultadoDirecta.cantidad, 0)} pesetas equivalen a:`
                      : `${formatCurrency(resultadoDirecta.cantidad)} equivalen a:`}
                  </div>
                  <div className={styles.resultValue}>
                    {direccion === 'ptasAEuros'
                      ? formatCurrency(resultadoDirecta.convertido)
                      : `${formatNumber(resultadoDirecta.convertido, 0)} ptas`}
                  </div>
                  <div className={styles.resultSubtext}>
                    al tipo fijo oficial de {formatNumber(TASA_FIJA_PESETA_EURO, 3)} ptas/€
                  </div>
                </div>

                <div className={styles.interpretation}>
                  <h3><span aria-hidden="true">💡</span> Interpretación</h3>
                  <p>
                    Esta es una <strong>conversión de unidad</strong>, no un cálculo de poder
                    adquisitivo: el tipo {formatNumber(TASA_FIJA_PESETA_EURO, 3)} ptas/€ es fijo desde
                    el 1 de enero de 1999 y nunca ha cambiado. Si quieres saber cuánto valdría hoy esa
                    cantidad de pesetas de un año concreto, usa el modo <strong>&quot;Valor real hoy&quot;</strong>.
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon} aria-hidden="true">🪙</div>
                <p>Introduce una cantidad válida para ver el resultado</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.mainContent}>
          <div className={styles.inputPanel}>
            <h2 className={styles.panelTitle}>Configura el cálculo</h2>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="cantidad-historica">Cantidad en pesetas</label>
              <input
                id="cantidad-historica"
                type="text"
                inputMode="decimal"
                value={cantidadHistorica}
                onChange={(e) => setCantidadHistorica(e.target.value)}
                className={styles.input}
                placeholder="100000"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="año-referencia">¿De qué año son esas pesetas?</label>
              <select
                id="año-referencia"
                value={añoReferencia}
                onChange={(e) => setAñoReferencia(Number(e.target.value))}
                className={styles.select}
                title="Año de referencia de la cantidad en pesetas"
              >
                {AÑOS_PESETA.map((año) => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
            </div>

            <div className={styles.presets}>
              <span className={styles.presetsLabel}>Décadas habituales:</span>
              <div className={styles.presetButtons}>
                <button type="button" onClick={() => setAñoReferencia(1970)} className={styles.presetBtn}>1970</button>
                <button type="button" onClick={() => setAñoReferencia(1980)} className={styles.presetBtn}>1980</button>
                <button type="button" onClick={() => setAñoReferencia(1990)} className={styles.presetBtn}>1990</button>
                <button type="button" onClick={() => setAñoReferencia(2000)} className={styles.presetBtn}>2000</button>
              </div>
            </div>
          </div>

          <div className={styles.resultsPanel}>
            {resultadoHistorico ? (
              <>
                <div className={styles.mainResult}>
                  <div className={styles.resultLabel}>
                    {formatNumber(resultadoHistorico.cantidad, 0)} pesetas de {añoReferencia} equivalen hoy a:
                  </div>
                  <div className={styles.resultValue}>
                    {formatCurrency(resultadoHistorico.valorHoy)}
                  </div>
                  <div className={styles.resultSubtext}>
                    en poder adquisitivo de {IPC_MAX_YEAR}
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon} aria-hidden="true">🔄</div>
                    <div className={styles.statValue}>{formatCurrency(resultadoHistorico.eurosÉpoca)}</div>
                    <div className={styles.statLabel}>Conversión directa (sin inflación)</div>
                  </div>
                  <div className={`${styles.statCard} ${styles.negative}`}>
                    <div className={styles.statIcon} aria-hidden="true">📉</div>
                    <div className={styles.statValue}>
                      +{formatNumber(resultadoHistorico.inflacionAcumulada, 1)}%
                    </div>
                    <div className={styles.statLabel}>Inflación acumulada</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon} aria-hidden="true">📅</div>
                    <div className={styles.statValue}>{resultadoHistorico.añosTranscurridos}</div>
                    <div className={styles.statLabel}>Años transcurridos</div>
                  </div>
                </div>

                <div className={styles.interpretation}>
                  <h3><span aria-hidden="true">💡</span> Interpretación</h3>
                  <p>
                    Al cambio oficial, {formatNumber(resultadoHistorico.cantidad, 0)} pesetas de{' '}
                    {añoReferencia} son <strong>{formatCurrency(resultadoHistorico.eurosÉpoca)}</strong>.
                    Pero para tener el mismo poder adquisitivo hoy necesitarías{' '}
                    <strong>{formatCurrency(resultadoHistorico.valorHoy)}</strong>: la diferencia es el
                    efecto acumulado de {resultadoHistorico.añosTranscurridos} años de inflación según
                    el IPC del INE.
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon} aria-hidden="true">📈</div>
                <p>Introduce una cantidad válida para ver el resultado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hitos históricos */}
      <div className={styles.historicalSection}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📅</span> La peseta en fechas clave</h2>
        <div className={styles.timelineGrid}>
          {hitosHistoricos.map((item) => (
            <div key={item.fecha} className={styles.timelineCard}>
              <div className={styles.timelineYear}>{item.fecha}</div>
              <div className={styles.timelineEvent}>{item.evento}</div>
            </div>
          ))}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="conversor-pesetas-euros"
        collapsible={false}
      />

      <EducationalSection
        title="¿Quieres entender mejor la conversión de pesetas?"
        subtitle="La diferencia entre cambiar de unidad y calcular el poder adquisitivo real"
      >
        <section className={styles.eduComparativa}>
          <h2><span aria-hidden="true">📊</span> Conversión oficial frente a valor real hoy: qué calcula cada una</h2>
          <p className={styles.eduIntro}>
            Son dos preguntas distintas que se confunden a menudo. Esta tabla resume cuándo interesa
            cada una.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Conversión oficial</th>
                  <th>Valor real hoy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Qué responde</strong></td>
                  <td>¿Cuántos euros son X pesetas?</td>
                  <td>¿Cuánto necesitaría hoy para comprar lo mismo?</td>
                </tr>
                <tr>
                  <td><strong>Fórmula</strong></td>
                  <td>pesetas ÷ 166,386</td>
                  <td>(pesetas ÷ 166,386) × (IPC hoy ÷ IPC del año)</td>
                </tr>
                <tr>
                  <td><strong>¿Cambia con el tiempo?</strong></td>
                  <td>No, es un tipo fijo legal desde 1999</td>
                  <td>Sí, crece cada año que se actualiza el IPC</td>
                </tr>
                <tr>
                  <td><strong>Necesita un año</strong></td>
                  <td>No</td>
                  <td>Sí, el año en que tenías esas pesetas</td>
                </tr>
                <tr>
                  <td><strong>Uso típico</strong></td>
                  <td>Traducir una cifra antigua a euros literalmente</td>
                  <td>Comparar un sueldo, un precio o un ahorro con el de hoy</td>
                </tr>
                <tr>
                  <td><strong>Ejemplo</strong></td>
                  <td>100.000 ptas = 601,01 €, sea del año que sea</td>
                  <td>100.000 ptas de 1985 = unos 1.470 € de poder adquisitivo hoy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.eduEscenarios}>
          <h2><span aria-hidden="true">💼</span> Cuándo se usa cada tipo de conversión</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📄</span>
                <h3>Revisar una escritura o contrato antiguo</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> Una escritura de 1998 refleja un precio en pesetas.</p>
                <code>Modo &quot;Conversión oficial&quot;: solo necesitas la cifra en euros de hoy, sin ajustar poder adquisitivo</code>
              </div>
              <p className={styles.escenarioTip}><strong>Por qué:</strong> Los registros legales y notariales expresan el mismo importe, solo cambia la unidad. No hay inflación que aplicar en un documento.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
                <h3>Comparar un sueldo o ahorro familiar</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> &quot;Mi padre ganaba 80.000 pesetas al mes en 1988&quot;.</p>
                <code>Modo &quot;Valor real hoy&quot;: da el equivalente en poder adquisitivo actual, no solo el cambio de unidad</code>
              </div>
              <p className={styles.escenarioTip}><strong>Por qué:</strong> Comparar sueldos de épocas distintas sin ajustar por inflación lleva a conclusiones erróneas sobre si se vivía mejor o peor.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <h3>Entender el precio de una vivienda heredada</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> Un piso comprado en 1975 por 900.000 pesetas.</p>
                <code>Modo &quot;Valor real hoy&quot;: 900.000 ptas de 1975 equivalen a mucho más poder adquisitivo que su simple conversión a euros</code>
              </div>
              <p className={styles.escenarioTip}><strong>Por qué:</strong> El precio nominal antiguo, convertido sin más, suena ridículamente bajo comparado con el mercado actual. El ajuste por inflación da la comparación justa.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🪙</span>
                <h3>Vaciar un cajón con pesetas físicas</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> Aparecen 25.000 pesetas en billetes al hacer una mudanza.</p>
                <code>El plazo de canje en el Banco de España terminó el 30/06/2021: hoy ya no tienen valor liberatorio</code>
              </div>
              <p className={styles.escenarioTip}><strong>Por qué:</strong> Conviene saberlo antes de intentar cambiarlas en un banco. Solo les queda un posible valor numismático si son piezas raras o de coleccionista.</p>
            </div>
          </div>
        </section>

        <section className={styles.eduFaq}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre la conversión de pesetas</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Cuál es el tipo de cambio oficial de pesetas a euros?</h4>
              <p>
                1 euro = 166,386 pesetas. Es un tipo de cambio <strong>fijado por ley</strong> —el
                Reglamento (CE) 2866/98 del Consejo de la Unión Europea, de 31 de diciembre de
                1998— y no un tipo de mercado: nunca ha fluctuado ni lo hará.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Tip:</strong> Para pasar de pesetas a euros, divide entre 166,386. Para el camino inverso, multiplica.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Por qué el resultado de &quot;valor real hoy&quot; es tan distinto al de la conversión oficial?</h4>
              <p>
                Porque responden preguntas distintas. La conversión oficial solo cambia la unidad
                monetaria (pesetas por euros) con un tipo que no varía. El &quot;valor real hoy&quot;
                añade la inflación acumulada desde el año de referencia: cuanto más antigua sea la
                cantidad, mayor será la diferencia entre ambos resultados.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Ejemplo:</strong> 100.000 pesetas de 1970 son siempre 601,01 € al cambio oficial, pero representaban un poder adquisitivo muy superior al de 601,01 € actuales.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Todavía puedo cambiar pesetas físicas en el banco?</h4>
              <p>
                No. Hasta el 30 de junio de 2002 se podían cambiar en cualquier entidad bancaria, y
                después solo en el Banco de España, hasta que ese plazo terminó definitivamente el
                30 de junio de 2021. Las pesetas que aparezcan hoy ya no tienen valor liberatorio.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Alternativa:</strong> Si son billetes o monedas antiguas, poco comunes o en buen estado, un numismático puede valorarlas por su interés de colección, al margen de su valor facial.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Hasta cuándo se pagó en pesetas en las tiendas?</h4>
              <p>
                Del 1 de enero al 28 de febrero de 2002 convivieron el euro y la peseta como medios
                de pago válidos. Desde el 1 de marzo de 2002, el euro es la única moneda de curso
                legal en España. El tipo de cambio, sin embargo, llevaba fijado desde el 1 de enero
                de 1999, con lo que los precios ya se venían mostrando en ambas monedas antes del
                cambio físico.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Dato:</strong> Esos tres años de doble indicación de precios (1999-2002) sirvieron para que el público se familiarizara con la nueva moneda antes de su circulación física.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿De dónde salen los datos que usa el cálculo de &quot;valor real hoy&quot;?</h4>
              <p>
                De la serie histórica del Índice de Precios al Consumo (IPC) del INE, disponible
                desde 1961 —la misma que usa el Estimador de Inflación de meskeIA—. La fórmula
                combina el tipo de cambio fijo con la variación del IPC entre el año de referencia y
                el año más reciente disponible.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Relacionado:</strong> Si quieres comparar dos años cualquiera en euros (sin pesetas de por medio), usa el Estimador de Inflación.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Por qué el tipo de cambio tiene tantos decimales (166,386)?</h4>
              <p>
                Porque no se eligió una cifra redonda: se calculó a partir del valor de mercado
                medio de la peseta frente al ECU (la unidad de cuenta europea previa al euro) en el
                momento de la fijación, para que el cambio fuera neutral y no favoreciera ni
                perjudicara a nadie el día del cambio. Por eso cada moneda del euro tiene su propio
                tipo fijo con distinto número de decimales.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Comparación:</strong> El franco francés se fijó en 6,55957 y el marco alemán en 1,95583 francos/euro y marcos/euro respectivamente — cada país con su propia cifra exacta.</p>
            </div>
          </div>
        </section>

        <section className={styles.eduGuia}>
          <h2><span aria-hidden="true">📋</span> Cómo interpretar una cantidad antigua en pesetas</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Identifica el año exacto de la cantidad</h4>
                <p>Una factura, nómina o escritura suele llevar fecha. Ese año es imprescindible si quieres calcular poder adquisitivo, aunque no hace falta si solo quieres la conversión literal a euros.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Decide qué pregunta quieres responder</h4>
                <p>¿Necesitas la cifra en euros tal cual (documento legal, escritura, registro contable)? Usa la conversión oficial. ¿Quieres comparar con el presente (sueldo, precio, ahorro)? Usa el valor real hoy.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Introduce la cantidad y, si aplica, el año</h4>
                <p>El campo admite tanto el formato español (100.000) como cifras sin puntos. Si la cantidad viene de antes de 1961, usa el año más antiguo disponible como aproximación: el IPC no tiene datos anteriores.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Contrasta el resultado con el contexto</h4>
                <p>Un resultado de &quot;valor real hoy&quot; es una estimación basada en la cesta media de consumo del INE, no en el precio de un bien concreto (vivienda, coche, etc.), que puede haber subido más o menos que la media.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Si son pesetas físicas, no esperes cambiarlas</h4>
                <p>El plazo de canje terminó en 2021. Si sospechas que una pieza puede tener valor de colección, consulta a un numismático antes de descartarla.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.eduTips}>
          <h2><span aria-hidden="true">✅</span> Claves para no confundirte con la peseta</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <h4>166,386 es fijo, no de mercado</h4>
              <p>A diferencia del dólar o la libra, la peseta no &quot;cotiza&quot;: su cambio con el euro es una cifra legal congelada desde 1999.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>El año importa solo para el poder adquisitivo</h4>
              <p>Para la conversión literal, el año es irrelevante. Solo lo necesitas si quieres saber cuánto &quot;valía&quot; esa cantidad.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏦</span>
              <h4>El canje físico ya terminó</h4>
              <p>Desde el 30/06/2021 el Banco de España no cambia pesetas por euros. No es un trámite pendiente, es un plazo cerrado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>El IPC es una media, no un precio concreto</h4>
              <p>La vivienda o la energía pueden haber subido mucho más que la media del IPC. El &quot;valor real hoy&quot; es una referencia general, no el precio exacto de un bien.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪙</span>
              <h4>Las monedas raras pueden valer más que su cambio</h4>
              <p>Ciertas series limitadas o con errores de acuñación cotizan muy por encima de su valor facial entre coleccionistas, al margen de cualquier cálculo de inflación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <h4>Combínalo con el Estimador de Inflación</h4>
              <p>Si la cantidad ya está en euros (por ejemplo, de 2005 en adelante), el Estimador de Inflación de meskeIA compara directamente dos años sin pasar por pesetas.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores frecuentes al interpretar cifras en pesetas</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong><span aria-hidden="true">❌</span> Pensar que se puede seguir canjeando pesetas:</strong> El plazo terminó el 30/06/2021. No es un trámite lento, es un plazo legal ya cerrado.</li>
            <li><strong><span aria-hidden="true">❌</span> Comparar sueldos o precios antiguos solo con la conversión oficial:</strong> &quot;Ganaba 60.000 pesetas&quot; convertido sin más a euros parece una miseria; ajustado por inflación, la comparación es mucho más justa.</li>
            <li><strong><span aria-hidden="true">❌</span> Redondear el tipo de cambio a 166 o 166,4:</strong> Para cantidades grandes, el redondeo del tipo exacto (166,386) genera diferencias apreciables.</li>
            <li><strong><span aria-hidden="true">❌</span> Aplicar el valor real hoy a un documento legal:</strong> Una escritura o registro contable antiguo se traduce con la conversión oficial, no con el ajuste por inflación.</li>
            <li><strong><span aria-hidden="true">❌</span> Suponer que todo subió igual que la media del IPC:</strong> La vivienda en grandes ciudades y la energía han subido, en general, muy por encima de la media; otros bienes, por debajo.</li>
            <li><strong><span aria-hidden="true">❌</span> Tirar pesetas físicas sin comprobar si son piezas raras:</strong> Antes de descartarlas, una consulta rápida a un numismático puede evitar perder algo con valor de colección.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-pesetas-euros')} />

      <ShareCard appName="conversor-pesetas-euros" />
      <Footer appName="conversor-pesetas-euros" />
    </div>
  );
}
