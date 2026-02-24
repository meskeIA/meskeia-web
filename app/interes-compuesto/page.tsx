'use client';

import { useState, useMemo } from 'react';
import styles from './InteresCompuesto.module.css';
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
        context="interes-compuesto"
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
        <section className={styles.guideSection}>
          <h2>¿Qué es el Interés Compuesto?</h2>
          <p className={styles.introParagraph}>
            El interés compuesto es el interés que se calcula sobre el capital inicial más los
            intereses acumulados de períodos anteriores. A diferencia del interés simple, donde
            solo ganas sobre tu inversión inicial, con el compuesto ganas &quot;intereses sobre los intereses&quot;.
            Este efecto de bola de nieve es la base de la creación de riqueza a largo plazo.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>⏰ El Factor Tiempo</h4>
              <p>
                El tiempo es tu mayor aliado. Empezar a invertir pronto, aunque sea poco,
                supera con creces empezar tarde con cantidades mayores. 10.000€ invertidos
                30 años al 7% se convierten en 76.000€. Solo 20 años: 38.000€.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 La Regla del 72</h4>
              <p>
                Divide 72 entre tu tasa de interés para saber cuántos años tardará tu dinero
                en duplicarse. Al 7%: 72/7 ≈ 10 años. Al 10%: 72/10 ≈ 7 años.
                Simple pero sorprendentemente preciso.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💰 Aportaciones Constantes</h4>
              <p>
                Las aportaciones periódicas (DCA - Dollar Cost Averaging) reducen el riesgo
                de entrar en mal momento y aprovechan el interés compuesto desde cada aportación.
                200€/mes durante 30 años al 7% superan los 240.000€.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏦 Fondos Indexados</h4>
              <p>
                Los fondos indexados de bajo coste (como los que replican el S&P500 o el MSCI World)
                ofrecen diversificación y rentabilidades históricas del 7-10% anual a largo plazo,
                con comisiones mínimas que no erosionan tu interés compuesto.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Ejemplo Práctico</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>👩 María (25 años)</h4>
              <p>
                Invierte 200€/mes desde los 25 hasta los 35 (10 años, 24.000€ totales).
                Luego deja de aportar. A los 65 años, al 7% anual, tendrá aproximadamente
                <strong> 340.000€</strong>.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>👨 Pedro (35 años)</h4>
              <p>
                Empieza a invertir 200€/mes a los 35 y no para hasta los 65 (30 años, 72.000€ totales).
                A los 65 años, al 7% anual, tendrá aproximadamente <strong>243.000€</strong>.
                María aportó 3 veces menos y tiene más.
              </p>
            </div>
          </div>
        </section>

        {/* Tabla Comparativa de Instrumentos */}
        <section className={styles.comparativaSection}>
          <h2>Comparativa de Instrumentos de Ahorro e Inversión</h2>
          <p className={styles.comparativaSubtitle}>
            Qué rendimiento esperar de cada vehículo y cómo afecta al interés compuesto a largo plazo
          </p>
          <div className={styles.profTableWrapper}>
            <table className={styles.profComparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>💳 Depósitos</th>
                  <th>📊 Bonos / RF</th>
                  <th>⚖️ ETFs Mixtos</th>
                  <th>🌍 ETFs RV Global</th>
                  <th>📈 Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Rentabilidad esperada</strong></td>
                  <td>2–4%</td>
                  <td>3–5%</td>
                  <td>5–7%</td>
                  <td>7–10%</td>
                  <td>8–12%+</td>
                </tr>
                <tr>
                  <td><strong>Volatilidad anual</strong></td>
                  <td>&lt;1%</td>
                  <td>5–8%</td>
                  <td>8–12%</td>
                  <td>15–20%</td>
                  <td>20–30%+</td>
                </tr>
                <tr>
                  <td><strong>10.000€ a 20 años</strong></td>
                  <td>~18.000€</td>
                  <td>~22.000€</td>
                  <td>~30.000€</td>
                  <td>~39.000€</td>
                  <td>~48.000€</td>
                </tr>
                <tr>
                  <td><strong>Capitalización típica</strong></td>
                  <td>Mensual</td>
                  <td>Semestral</td>
                  <td>Variable</td>
                  <td>Variable</td>
                  <td>Trimestral</td>
                </tr>
                <tr>
                  <td><strong>Horizonte ideal</strong></td>
                  <td>1–3 años</td>
                  <td>3–7 años</td>
                  <td>5–10 años</td>
                  <td>+10 años</td>
                  <td>+15 años</td>
                </tr>
                <tr>
                  <td><strong>Complejidad</strong></td>
                  <td>Baja</td>
                  <td>Media</td>
                  <td>Baja</td>
                  <td>Baja</td>
                  <td>Alta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso */}
        <section className={styles.escenariosSection}>
          <h2>El Interés Compuesto en la Vida Real</h2>
          <p className={styles.escenariosSubtitle}>
            4 perfiles con distintos puntos de partida y cómo el tiempo cambia el resultado
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h3>Joven de 23 años</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>Capital inicial: 0€ · Aportación: 100€/mes · Tasa: 7% · Plazo: 42 años (hasta 65)</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Resultado aproximado: 280.000€</strong> con solo 50.400€ aportados.
                El 82% es interés compuesto puro. El tiempo es el ingrediente más poderoso.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
                <h3>Familia de 35 años</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>Capital inicial: 10.000€ · Aportación: 300€/mes · Tasa: 6% · Plazo: 20 años</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Resultado aproximado: 175.000€</strong> con 82.000€ aportados.
                Objetivo: fondo educación hijos + complemento jubilación. Perfil moderado adecuado.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <h3>Autónomo de 40 años</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>Capital inicial: 0€ · Aportación: 500€/mes · Tasa: 7% · Plazo: 25 años (hasta 65)</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Resultado aproximado: 400.000€</strong> con 150.000€ aportados.
                Sin pensión pública garantizada, el interés compuesto es especialmente crítico para autónomos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💰</span>
                <h3>Pre-jubilado de 50 años</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>Capital inicial: 50.000€ · Aportación: 0€/mes · Tasa: 5% · Plazo: 15 años</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Resultado aproximado: 104.000€</strong> sin aportar nada más.
                Perfil conservador recomendado. La clave es no tocar el capital antes del plazo.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Ampliado */}
        <section className={styles.faqSection}>
          <h2>Preguntas Frecuentes Avanzadas</h2>
          <div className={styles.faqList}>
            <div className={styles.faqSectionItem}>
              <h3>¿Qué rentabilidad es realista esperar a largo plazo?</h3>
              <p>
                El S&amp;P500 ha rentado un <strong>~10% nominal anual durante 100 años</strong> (7–8% ajustado a inflación).
                El MSCI World ronda el 8–9% nominal. Para una cartera diversificada conservadora, un 4–5% real
                es razonable. El 7% anual que sugiere la calculadora por defecto es la estimación histórica estándar
                para carteras de renta variable global.
              </p>
              <p className={styles.faqTip}>
                💡 Usa siempre el 7% como escenario base y complementa con el 4% (pesimista) y el 10% (optimista)
                para tener una visión del rango posible de resultados.
              </p>
            </div>

            <div className={styles.faqSectionItem}>
              <h3>¿Cómo afecta la inflación al interés compuesto?</h3>
              <p>
                La inflación <strong>erosiona el poder adquisitivo</strong> de tus ganancias. Si tu inversión renta
                un 7% anual pero la inflación es del 3%, tu rentabilidad real es de solo ~4%.
                La calculadora muestra rentabilidad nominal (sin descontar inflación). Para comparar con tu
                situación real, resta la inflación esperada a la tasa introducida.
              </p>
            </div>

            <div className={styles.faqSectionItem}>
              <h3>¿Es mejor invertir todo de golpe (lump sum) o en aportaciones periódicas (DCA)?</h3>
              <p>
                Estadísticamente, invertir todo de golpe gana al DCA en ~2/3 de los casos a largo plazo,
                porque el mercado sube más tiempo del que baja. Pero el <strong>DCA reduce el riesgo psicológico</strong>:
                si inviertes justo antes de una caída del 30%, el DCA amortigua el golpe. Para la mayoría de
                inversores, el DCA mensual es la estrategia óptima por su sostenibilidad emocional.
              </p>
            </div>

            <div className={styles.faqSectionItem}>
              <h3>¿Qué instrumentos maximizan el interés compuesto?</h3>
              <p>
                Los <strong>fondos de inversión y ETFs de acumulación</strong> (que reinvierten dividendos automáticamente)
                son los más eficientes porque no tributan al reinvertir. Los ETFs de distribución te obligan a
                pagar IRPF en cada dividendo, reduciendo el capital que se reinvierte. En España, los fondos
                de inversión permiten traspasos sin tributación, potenciando aún más el efecto compuesto.
              </p>
              <p className={styles.faqTip}>
                💡 Busca ETFs con &quot;Acc&quot; en el nombre (Accumulating) como el Vanguard FTSE All-World Acc o
                el iShares MSCI World Acc. Reinvierten dividendos automáticamente.
              </p>
            </div>

            <div className={styles.faqSectionItem}>
              <h3>¿Cómo tributan las ganancias de inversión en España?</h3>
              <p>
                Las ganancias tributan como <strong>rendimientos del capital mobiliario</strong> en el IRPF:
                19% hasta 6.000€, 21% de 6.000€ a 50.000€, 23% de 50.000€ a 200.000€, y 26% a partir de 200.000€.
                Solo tributan al vender, no por el mero crecimiento. Los traspasos entre fondos en España
                no tributan hasta la venta final (ventaja fiscal única de los fondos vs ETFs).
              </p>
            </div>

            <div className={styles.faqSectionItem}>
              <h3>¿Qué es la TAE y cómo se relaciona con el interés compuesto?</h3>
              <p>
                La <strong>TAE (Tasa Anual Equivalente)</strong> es el tipo de interés efectivo que tiene en cuenta
                la frecuencia de capitalización. Una cuenta al 4% mensual no es lo mismo que al 4% anual:
                mensual → TAE 4,07%; trimestral → TAE 4,06%; semestral → TAE 4,04%. La TAE permite comparar
                productos con distintas frecuencias de capitalización de forma justa.
              </p>
            </div>

            <div className={styles.faqSectionItem}>
              <h3>¿Cuánto necesito invertir para tener X euros a la jubilación?</h3>
              <p>
                Usa la calculadora inversa: si quieres 300.000€ en 30 años al 7%,
                necesitas aproximadamente <strong>247€/mes sin capital inicial</strong>.
                Con 10.000€ de capital inicial, bajarías a ~170€/mes. Cada año que retrasas
                el inicio aumenta la aportación mensual necesaria en un 7–10%.
              </p>
              <p className={styles.faqTip}>
                💡 Regla del 4%: Para vivir de rentas necesitas un patrimonio de 25 veces tus gastos anuales.
                Gastos de 24.000€/año → patrimonio objetivo de 600.000€.
              </p>
            </div>

            <div className={styles.faqSectionItem}>
              <h3>¿Qué son las comisiones y cómo destruyen el interés compuesto?</h3>
              <p>
                Una comisión anual del <strong>1,5% reduce tu rentabilidad final en un 30–40%</strong> a largo plazo.
                Si tu fondo renta un 7% pero cobra 1,5% en comisiones, tu rentabilidad real es 5,5%.
                En 30 años: 10.000€ al 7% = 76.000€; al 5,5% = 51.000€. La diferencia de 25.000€ se la
                queda la gestora. Los ETFs de bajo coste tienen TER inferior al 0,2%.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.stepGuideSection}>
          <h2>Cómo Empezar a Invertir con Interés Compuesto en 7 Pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Construye tu colchón de emergencia primero</h3>
                <p>
                  Reserva <strong>3–6 meses de gastos fijos</strong> en una cuenta de fácil acceso antes de invertir.
                  Sin colchón, cualquier imprevisto te obligará a vender inversiones en el peor momento,
                  arruinando el efecto compuesto.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Define tu objetivo y horizonte temporal</h3>
                <p>
                  Sé específico: <strong>&quot;quiero 200.000€ en 25 años para complementar la jubilación&quot;</strong>.
                  Usa la calculadora para saber qué aportación mensual necesitas. El objetivo concreto
                  te mantiene motivado durante los mercados bajistas.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Elige el instrumento adecuado</h3>
                <p>
                  Para plazos <strong>superiores a 10 años</strong>, los ETFs de acumulación (MSCI World, S&amp;P500)
                  son la opción más eficiente: bajo coste (TER &lt;0,2%), diversificación global y reinversión
                  automática de dividendos. Para plazos menores, considera fondos mixtos o renta fija.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Abre una cuenta en un bróker de bajo coste</h3>
                <p>
                  Las comisiones del bróker impactan directamente el interés compuesto. Brokers como Interactive
                  Brokers, Trade Republic o MyInvestor ofrecen <strong>acceso a ETFs con comisiones mínimas</strong>.
                  Evita los fondos de banca tradicional con comisiones del 1,5–2% anual.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Automatiza tus aportaciones periódicas</h3>
                <p>
                  Configura una <strong>aportación automática mensual</strong> el día de cobro. El DCA automático
                  elimina la tentación de &quot;esperar un mejor momento&quot; y garantiza consistencia. Tratar la inversión
                  como un gasto fijo es el secreto del inversor exitoso.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Reinvierte siempre los dividendos</h3>
                <p>
                  Si tu instrumento distribuye dividendos, <strong>reinviértelos inmediatamente</strong>.
                  Los dividendos son la gasolina del interés compuesto: representan ~40% de la rentabilidad
                  histórica total del mercado. Un ETF de acumulación lo hace automáticamente.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Mantén el rumbo en los mercados bajistas</h3>
                <p>
                  Las caídas del mercado son <strong>oportunidades, no catástrofes</strong>. Comprás más participaciones
                  al mismo precio mensual cuando el mercado está bajo. La mayoría de pérdidas de los inversores
                  minoristas ocurren por vender en pánico. La inactividad es una estrategia válida.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.tipsSection}>
          <h2>6 Hábitos del Inversor que Aprovecha el Interés Compuesto</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏰</span>
              <h3>Empieza cuanto antes</h3>
              <p>
                Cada año de retraso es dinero que nunca recuperarás. A los 25 años, 100€/mes
                valen el doble que a los 35 años.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <h3>Reinvierte siempre</h3>
              <p>
                No retires los rendimientos hasta el horizonte planificado. Cada euro reinvertido
                se convierte en varios a largo plazo.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💸</span>
              <h3>Minimiza comisiones</h3>
              <p>
                El 1% de comisiones puede reducir tu patrimonio final hasta un 25%. Elige
                ETFs con TER inferior al 0,2% anual.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📆</span>
              <h3>Aporta de forma regular</h3>
              <p>
                El DCA mensual automatizado elimina la emoción de la ecuación. La consistencia
                supera al talento en la inversión a largo plazo.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h3>Ajusta la tasa a la inflación</h3>
              <p>
                Al planificar, usa rentabilidades reales (7% nominal – 3% inflación = 4% real)
                para no sobreestimar el poder adquisitivo futuro.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🛑</span>
              <h3>No interrumpas en caídas</h3>
              <p>
                Vender en mercados bajistas cristaliza pérdidas y elimina el rebote posterior.
                Las caídas son temporales; el interés compuesto, permanente.
              </p>
            </div>
          </div>
        </section>

        {/* Errores Comunes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores que Destruyen el Interés Compuesto</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>No considerar la inflación:</strong> Una rentabilidad del 4% con inflación del 4% es rentabilidad real
              cero. Siempre planifica en términos reales y no te sorprendas si el dinero futuro no alcanza para lo que esperas.
            </li>
            <li>
              <strong>Esperar el &quot;momento perfecto&quot; para invertir:</strong> No existe el momento perfecto. Cada mes de
              espera es interés compuesto perdido. Estudios muestran que &quot;time in the market&quot; supera al &quot;timing the market&quot;
              en el 90% de los casos.
            </li>
            <li>
              <strong>Interrumpir las aportaciones en crisis:</strong> Precisamente cuando el mercado cae, cada euro aportado
              compra más participaciones. Interrumpir el DCA en mercados bajistas es el error más costoso del inversor minorista.
            </li>
            <li>
              <strong>Subestimar las comisiones (el &quot;dragón de las comisiones&quot;):</strong> El 1,5% anual en comisiones
              reduce tu capital final en un 30–40% en 30 años. No es un gasto menor: es el activo más rentable de tu gestora.
            </li>
            <li>
              <strong>Proyectar sobre tasas históricas sin margen:</strong> Las rentabilidades pasadas no garantizan el futuro.
              Usa siempre un escenario conservador (4–5%) como base de planificación y trata el 7–10% como optimista.
            </li>
            <li>
              <strong>Retirar capital antes del horizonte planificado:</strong> Romper la curva de interés compuesto a mitad
              del camino pierde desproporcionadamente la parte donde más crece (los últimos años son los más valiosos).
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('interes-compuesto')} />
      <ShareCard appName="interes-compuesto" />
      <Footer appName="interes-compuesto" />
    </div>
  );
}
