'use client';

import { useState, useMemo } from 'react';
import styles from './InteresCompuesto.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps } from '@/components';
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('interes-compuesto')} />
      <Footer appName="interes-compuesto" />
    </div>
  );
}
