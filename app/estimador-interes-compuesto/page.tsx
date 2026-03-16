'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorInteresCompuesto.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

type FrecuenciaCapitalizacion = 'anual' | 'semestral' | 'trimestral' | 'mensual';
type FrecuenciaAportacion = 'mensual' | 'trimestral' | 'anual' | 'ninguna';

interface ResultadoAnual {
  ano: number;
  capitalInicio: number;
  aportaciones: number;
  intereses: number;
  capitalFin: number;
}

export default function InteresCompuestoPage() {
  const [capitalInicial, setCapitalInicial] = useState('10000');
  const [tasaInteres, setTasaInteres] = useState(7);
  const [anos, setAnos] = useState(20);
  const [aportacionPeriodica, setAportacionPeriodica] = useState('200');
  const [frecuenciaAportacion, setFrecuenciaAportacion] = useState<FrecuenciaAportacion>('mensual');
  const [frecuenciaCapitalizacion, setFrecuenciaCapitalizacion] = useState<FrecuenciaCapitalizacion>('anual');

  // Calcular resultado
  const resultado = useMemo(() => {
    const capital = parseSpanishNumber(capitalInicial) || 0;
    const tasa = tasaInteres / 100;
    const aportacion = parseSpanishNumber(aportacionPeriodica) || 0;

    // Períodos de capitalización por año
    const periodosCapitalizacion: Record<FrecuenciaCapitalizacion, number> = {
      anual: 1,
      semestral: 2,
      trimestral: 4,
      mensual: 12,
    };
    const n = periodosCapitalizacion[frecuenciaCapitalizacion];

    // Aportaciones por año
    const aportacionesPorAno: Record<FrecuenciaAportacion, number> = {
      ninguna: 0,
      anual: 1,
      trimestral: 4,
      mensual: 12,
    };
    const aportacionesAnuales = aportacion * aportacionesPorAno[frecuenciaAportacion];

    // Calcular evolución año a año
    const evolucion: ResultadoAnual[] = [];
    let capitalActual = capital;
    let totalAportaciones = capital;
    let totalIntereses = 0;

    for (let i = 1; i <= anos; i++) {
      const capitalInicio = capitalActual;

      // Interés compuesto sobre capital existente
      const tasaPeriodo = tasa / n;
      let capitalConInteres = capitalInicio;

      // Simular cada período de capitalización
      for (let p = 0; p < n; p++) {
        capitalConInteres *= (1 + tasaPeriodo);

        // Añadir aportaciones proporcionales si la frecuencia coincide
        if (frecuenciaAportacion !== 'ninguna') {
          const aportacionesPorPeriodo = aportacionesAnuales / n;
          capitalConInteres += aportacionesPorPeriodo;
        }
      }

      const interesesAno = capitalConInteres - capitalInicio - aportacionesAnuales;

      evolucion.push({
        ano: i,
        capitalInicio,
        aportaciones: aportacionesAnuales,
        intereses: interesesAno,
        capitalFin: capitalConInteres,
      });

      capitalActual = capitalConInteres;
      totalAportaciones += aportacionesAnuales;
      totalIntereses += interesesAno;
    }

    return {
      capitalFinal: capitalActual,
      totalAportado: totalAportaciones,
      totalIntereses,
      evolucion,
    };
  }, [capitalInicial, tasaInteres, anos, aportacionPeriodica, frecuenciaAportacion, frecuenciaCapitalizacion]);

  const multiplicador = resultado.totalAportado > 0
    ? resultado.capitalFinal / resultado.totalAportado
    : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📈 Interés Compuesto</h1>
        <p className={styles.subtitle}>
          Simula el crecimiento de tu inversión a largo plazo
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="high"
        collapsible={true}
        context="estimador-interes-compuesto"
      >
        <p>
          Este simulador proporciona <strong>proyecciones educativas</strong> basadas en rentabilidades constantes.
        </p>
        <p>
          <strong>⚠️ Factores NO considerados:</strong>
        </p>
        <ul>
          <li><strong>Volatilidad:</strong> Los mercados fluctúan; las rentabilidades nunca son constantes</li>
          <li><strong>Inflación:</strong> El poder adquisitivo de tu dinero disminuye con el tiempo</li>
          <li><strong>Comisiones:</strong> Fondos de inversión, ETFs y gestoras cobran comisiones anuales (0,5%-2%)</li>
          <li><strong>Fiscalidad:</strong> Las ganancias tributan en IRPF (19%-26% según tramo)</li>
          <li><strong>Riesgo:</strong> Rentabilidades pasadas NO garantizan rentabilidades futuras</li>
        </ul>
        <p>
          <strong>NO inviertas dinero que puedas necesitar a corto plazo.</strong> Consulta con un asesor
          financiero profesional antes de tomar decisiones de inversión.
        </p>
      </DisclaimerCard>

      {/* Última actualización */}
      

      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>💰 Datos de la Inversión</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Capital inicial</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={capitalInicial}
                onChange={(e) => setCapitalInicial(e.target.value)}
                placeholder="10000"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>Cantidad con la que empiezas</span>
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Rentabilidad anual esperada</label>
              <span className={styles.sliderValue}>{tasaInteres}%</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="1"
              max="15"
              step="0.5"
              value={tasaInteres}
              onChange={(e) => setTasaInteres(parseFloat(e.target.value))}
            />
            <span className={styles.helpText}>Histórico S&P500: ~7-10% anual</span>
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Horizonte temporal</label>
              <span className={styles.sliderValue}>{anos} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="1"
              max="40"
              value={anos}
              onChange={(e) => setAnos(parseInt(e.target.value))}
            />
          </div>

          <h2 className={styles.sectionTitle}>📥 Aportaciones Periódicas</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Aportación</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={aportacionPeriodica}
                onChange={(e) => setAportacionPeriodica(e.target.value)}
                placeholder="200"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Frecuencia de aportación</label>
            <select
              className={styles.select}
              value={frecuenciaAportacion}
              onChange={(e) => setFrecuenciaAportacion(e.target.value as FrecuenciaAportacion)}
            >
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
              <option value="ninguna">Sin aportaciones</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Capitalización de intereses</label>
            <select
              className={styles.select}
              value={frecuenciaCapitalizacion}
              onChange={(e) => setFrecuenciaCapitalizacion(e.target.value as FrecuenciaCapitalizacion)}
            >
              <option value="anual">Anual</option>
              <option value="semestral">Semestral</option>
              <option value="trimestral">Trimestral</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>📊 Resultado de la Simulación</h2>

          {/* Resultado Principal */}
          <div className={styles.resultadoPrincipal}>
            <span className={styles.resultadoLabel}>Capital final en {anos} años</span>
            <span className={styles.resultadoValor}>
              {formatCurrency(resultado.capitalFinal)}
            </span>
            <span className={styles.resultadoSubtexto}>
              Tu dinero se multiplicó x{formatNumber(multiplicador, 2)}
            </span>
          </div>

          {/* Desglose */}
          <div className={styles.desgloseGrid}>
            <div className={styles.desgloseCard}>
              <div className={styles.desgloseIcon}>💵</div>
              <span className={styles.desgloseLabel}>Total aportado</span>
              <span className={styles.desgloseValor}>
                {formatCurrency(resultado.totalAportado)}
              </span>
            </div>
            <div className={`${styles.desgloseCard} ${styles.intereses}`}>
              <div className={styles.desgloseIcon}>📈</div>
              <span className={styles.desgloseLabel}>Intereses generados</span>
              <span className={styles.desgloseValor}>
                +{formatCurrency(resultado.totalIntereses)}
              </span>
            </div>
            <div className={styles.desgloseCard}>
              <div className={styles.desgloseIcon}>📊</div>
              <span className={styles.desgloseLabel}>% de intereses</span>
              <span className={styles.desgloseValor}>
                {formatNumber((resultado.totalIntereses / resultado.capitalFinal) * 100, 1)}%
              </span>
            </div>
          </div>

          {/* Tabla de Evolución */}
          <div className={styles.tablaSection}>
            <h3 className={styles.sectionTitle}>📅 Evolución Anual</h3>
            <div className={styles.tablaContainer}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Capital Inicio</th>
                    <th>Aportaciones</th>
                    <th>Intereses</th>
                    <th>Capital Final</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.evolucion.map((row) => (
                    <tr key={row.ano}>
                      <td>{row.ano}</td>
                      <td>{formatCurrency(row.capitalInicio)}</td>
                      <td>{formatCurrency(row.aportaciones)}</td>
                      <td className={styles.positivo}>+{formatCurrency(row.intereses)}</td>
                      <td><strong>{formatCurrency(row.capitalFin)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fórmula */}
          <div className={styles.formulaBox}>
            <h4>Fórmula del Interés Compuesto</h4>
            <code className={styles.formula}>
              VF = VP × (1 + r/n)^(n×t) + PMT × [((1 + r/n)^(n×t) - 1) / (r/n)]
            </code>
          </div>
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>simulación teórica</strong> basada en una rentabilidad
          constante. En la realidad, los mercados fluctúan y las rentabilidades pasadas no garantizan
          resultados futuros. <strong>No constituye asesoramiento financiero</strong>. Consulta con un
          profesional antes de invertir y recuerda que toda inversión conlleva riesgo de pérdida.
        </p>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres entender el poder del interés compuesto?"
        subtitle="Descubre por qué Einstein lo llamó 'la octava maravilla del mundo'"
      >
        {/* Tabla Comparativa */}
        <section className={styles.eduComparativa}>
          <h2>Interés simple vs interés compuesto: la diferencia que cambia todo</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Interés simple</th>
                  <th>Interés compuesto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cómo crece</strong></td>
                  <td>Linealmente (misma cantidad cada año)</td>
                  <td>Exponencialmente (crece sobre el total acumulado)</td>
                </tr>
                <tr>
                  <td><strong>Base de cálculo</strong></td>
                  <td>Solo sobre el capital inicial</td>
                  <td>Sobre capital inicial + intereses acumulados</td>
                </tr>
                <tr>
                  <td><strong>Ejemplo 10.000 € al 5% en 20 años</strong></td>
                  <td>20.000 € (ganas 10.000 €)</td>
                  <td>26.533 € (ganas 16.533 €)</td>
                </tr>
                <tr>
                  <td><strong>Frecuencia de capitalización</strong></td>
                  <td>No aplica</td>
                  <td>Anual, trimestral, mensual, diaria</td>
                </tr>
                <tr>
                  <td><strong>Dónde se usa</strong></td>
                  <td>Préstamos a corto plazo, cuentas corrientes</td>
                  <td>Inversiones, cuentas de ahorro, fondos indexados</td>
                </tr>
                <tr>
                  <td><strong>Ventaja principal</strong></td>
                  <td>Más predecible y sencillo de calcular</td>
                  <td>Los intereses generan más intereses (efecto bola de nieve)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.eduEscenarios}>
          <h2>El interés compuesto en distintos objetivos financieros</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏖️</span>
                <strong>Ahorro para la jubilación (30 años)</strong>
              </div>
              <p className={styles.eduEscenarioExample}>Invertir 200 €/mes desde los 30 años al 7% anual: a los 65 años tendrás ~284.000 €. Si empiezas a los 40, solo llegas a ~122.000 €. 10 años de diferencia = 162.000 € menos.</p>
              <span className={styles.eduEscenarioTip}>Empieza cuanto antes, aunque sea poco</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <strong>Educación universitaria de un hijo</strong>
              </div>
              <p className={styles.eduEscenarioExample}>Si hoy inviertes 10.000 € cuando nace tu hijo al 6% anual, en 18 años tendrás ~28.543 €. Si añades 100 €/mes, llegarás a ~57.000 €: suficiente para una carrera y máster.</p>
              <span className={styles.eduEscenarioTip}>18 años de capitalización = potencia</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <strong>Ahorro para entrada de un piso (5 años)</strong>
              </div>
              <p className={styles.eduEscenarioExample}>Necesitas 40.000 € en 5 años. Si inviertes 600 €/mes al 4% anual, alcanzas ~39.700 €. En horizontes cortos, el interés compuesto ayuda pero el ahorro mensual es lo que más importa.</p>
              <span className={styles.eduEscenarioTip}>Corto plazo: ahorro mensual &gt; rentabilidad</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📈</span>
                <strong>Inversión en fondo indexado (largo plazo)</strong>
              </div>
              <p className={styles.eduEscenarioExample}>Un fondo indexado al S&amp;P 500 ha rentado históricamente ~10% anual (7% descontando inflación). 300 €/mes durante 25 años al 7%: ~243.000 €. Aportado real: 90.000 €. Interés compuesto: 153.000 €.</p>
              <span className={styles.eduEscenarioTip}>Tiempo + constancia = riqueza real</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💳</span>
                <strong>Deuda con interés compuesto (trampa)</strong>
              </div>
              <p className={styles.eduEscenarioExample}>Una tarjeta de crédito al 25% anual. Si debes 5.000 € y solo pagas el mínimo, en 10 años habrás pagado más de 15.000 €. El interés compuesto funciona igual de rápido en tu contra.</p>
              <span className={styles.eduEscenarioTip}>Cancela deudas antes de invertir</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔄</span>
                <strong>Reinversión de dividendos (DRIP)</strong>
              </div>
              <p className={styles.eduEscenarioExample}>Invertir 10.000 € en acciones con 4% de dividendo anual reinvertido durante 20 años: 21.911 € sin reinversión vs 21.911 € con reinversión + crecimiento del capital. Los dividendos reinvertidos aceleran el efecto compuesto.</p>
              <span className={styles.eduEscenarioTip}>Reinvertir dividendos amplifica el efecto</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre el interés compuesto</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué significa que el interés se capitalice mensualmente vs anualmente?</h4>
              <p>La frecuencia de capitalización indica cada cuánto se suman los intereses al capital. Capitalización anual: los intereses se añaden una vez al año. Capitalización mensual: doce veces al año. A mayor frecuencia, más intereses generas (aunque la diferencia es pequeña con tipos bajos).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuál es la regla del 72?</h4>
              <p>Una regla mental: divide 72 entre la tasa de interés anual y obtienes los años aproximados que tarda tu dinero en duplicarse. Al 6%: 72/6 = 12 años. Al 9%: 72/9 = 8 años. Al 4%: 72/4 = 18 años. Útil para cálculos rápidos sin calculadora.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre TAE y TIN?</h4>
              <p>TIN (Tipo de Interés Nominal): el tipo básico sin incluir comisiones ni capitalización. TAE (Tasa Anual Equivalente): incluye el TIN, la frecuencia de capitalización y las comisiones. Para comparar productos financieros, siempre usa la TAE: es la tasa real que pagas o recibes.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿La inflación afecta al interés compuesto?</h4>
              <p>Sí. Lo que importa es la rentabilidad real: rentabilidad nominal - inflación. Si tu inversión renta un 8% pero la inflación es del 3%, tu rentabilidad real es ~5%. Las calculadoras de interés compuesto deben usarse con la tasa real para obtener valores en poder adquisitivo actual.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo empieza a notarse el efecto del interés compuesto?</h4>
              <p>Los primeros años el crecimiento parece lento. Es en los últimos años cuando el efecto se dispara exponencialmente. En 30 años al 7%, los últimos 10 años generan más riqueza que los primeros 20. Por eso el tiempo es el factor más crítico.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo aplicar el interés compuesto con aportaciones periódicas?</h4>
              <p>Sí, y es la forma más común. Aportar una cantidad fija cada mes (dollar-cost averaging) combina el interés compuesto con el promedio de precio de compra. Aunque el mercado caiga puntualmente, a largo plazo el resultado tiende a ser positivo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Los impuestos afectan al interés compuesto?</h4>
              <p>Sí significativamente. Los fondos de inversión en España permiten traspaso sin tributar (diferimiento fiscal). Si tributan cada año (depósitos, dividendos), se &quot;rompe&quot; el ciclo compuesto porque Hacienda retiene parte de los intereses antes de que se reinviertan.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Es mejor una rentabilidad alta con riesgo o una moderada con seguridad?</h4>
              <p className={styles.faqTip}>Depende de tu horizonte temporal y tolerancia al riesgo. Para plazos largos (+15 años), una rentabilidad del 7-9% en fondos indexados históricamente ha superado consistentemente a los depósitos al 3-4%, incluso asumiendo caídas de mercado. Para plazos cortos (&lt;5 años), la seguridad del capital es prioritaria.</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.eduGuia}>
          <h2>Cómo aprovechar el interés compuesto en tu estrategia financiera</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Empieza cuanto antes, aunque sea con poco</strong>
                <p>La variable más poderosa del interés compuesto es el tiempo. Incluso 50 €/mes durante 35 años al 7% se convierten en ~83.000 €. Esperar 10 años para &quot;ahorrar más&quot; puede costarte más de 40.000 € de resultado final.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Construye primero el fondo de emergencia</strong>
                <p>Antes de invertir para el largo plazo, asegúrate de tener 3-6 meses de gastos en una cuenta líquida. Sin este colchón, cualquier imprevisto te obliga a deshacer inversiones en el peor momento.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Elige vehículos con bajos costes y diferimiento fiscal</strong>
                <p>Los fondos de inversión indexados (ETFs o fondos indexados) en España permiten traspasar sin tributar. Los costes anuales importan: un fondo al 0,2% vs uno al 1,5% puede suponer una diferencia de 30-40% en el resultado final a 30 años.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Automatiza las aportaciones mensuales</strong>
                <p>Configura una transferencia automática a tu cuenta de inversión el día de cobro. La constancia es más importante que el timing del mercado. Las aportaciones mensuales automáticas eliminan la tentación de &quot;esperar al momento perfecto&quot;.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Reinvierte todos los rendimientos</strong>
                <p>No consumas los intereses, dividendos o plusvalías intermedias. Cada euro retirado interrumpe el ciclo compuesto. Si el fondo o producto distribuye rendimientos automáticamente, busca la versión de acumulación (que los reinvierte internamente).</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Aumenta las aportaciones cuando puedas</strong>
                <p>Cada vez que suban tus ingresos (aumento de sueldo, proyecto extra), destina al menos el 50% del incremento a inversión. El efecto compuesto sobre aportaciones crecientes es exponencialmente más potente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>No interrumpas la inversión en caídas de mercado</strong>
                <p>Las caídas de mercado no son el momento de vender, sino de comprar más barato. Los inversores que mantuvieron durante la crisis de 2008 o el COVID-19 recuperaron y superaron ampliamente los niveles previos en pocos años.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.eduTips}>
          <h2>Tips para maximizar el efecto del interés compuesto</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏰</span>
              <strong>El tiempo es tu mayor activo</strong>
              <p>Cada año que adelantas el inicio puede suponer decenas de miles de euros en el resultado final.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💸</span>
              <strong>Minimiza costes y comisiones</strong>
              <p>Una diferencia del 1% en comisiones anuales puede reducir tu capital final en un 20-30% a 30 años.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Reinvierte siempre los rendimientos</strong>
              <p>No consumas los intereses. Cada euro retirado frena el efecto bola de nieve de forma permanente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧮</span>
              <strong>Usa la regla del 72</strong>
              <p>Divide 72 entre tu rentabilidad esperada para saber en cuántos años se duplica tu dinero.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🛡️</span>
              <strong>Cancela deudas de alto interés primero</strong>
              <p>Una deuda al 20% crece más rápido que cualquier inversión. Cancélala antes de invertir.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Diversifica para reducir volatilidad</strong>
              <p>Un fondo global indexado diversifica en miles de empresas, reduciendo el riesgo sin sacrificar rentabilidad a largo plazo.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.eduWarningBox}>
          <div className={styles.eduWarningHeader}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <strong>Errores que destruyen el efecto del interés compuesto</strong>
          </div>
          <ul className={styles.eduWarningList}>
            <li>Retirar el dinero antes de tiempo: interrumpe el ciclo y obliga a tributar antes de lo necesario</li>
            <li>Pagar comisiones altas: una diferencia del 1% anual puede costar más del 25% del capital final a largo plazo</li>
            <li>Invertir con dinero que necesitarás a corto plazo: el mercado puede caer justo cuando lo necesitas</li>
            <li>Vender en las caídas de mercado: cristaliza pérdidas y te pierdes la recuperación</li>
            <li>No reinvertir dividendos o intereses: los consumes, rompiendo la capitalización</li>
            <li>Esperar al &quot;momento perfecto&quot; para empezar: el coste de oportunidad del tiempo perdido es enorme</li>
            <li>Ignorar el impacto de la inflación: una rentabilidad del 3% con inflación del 3% es rendimiento real cero</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-interes-compuesto')} />
      <ShareCard appName="estimador-interes-compuesto" />
      <Footer appName="estimador-interes-compuesto" />
    </div>
  );
}
