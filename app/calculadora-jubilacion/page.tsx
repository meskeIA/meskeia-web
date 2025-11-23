'use client';

import { useState, useEffect } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './CalculadoraJubilacion.module.css';
import { jsonLd } from './metadata';

export default function CalculadoraJubilacion() {
  const [edadActual, setEdadActual] = useState(35);
  const [edadJubilacion, setEdadJubilacion] = useState(65);
  const [capitalInicial, setCapitalInicial] = useState(5000);
  const [aportacionMensual, setAportacionMensual] = useState(300);
  const [rentabilidad, setRentabilidad] = useState('5');
  const [rentabilidadPersonalizada, setRentabilidadPersonalizada] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  // Resultados calculados
  const [capitalTotal, setCapitalTotal] = useState(0);
  const [pensionMensual, setPensionMensual] = useState(0);
  const [anosAhorro, setAnosAhorro] = useState(0);
  const [totalAportado, setTotalAportado] = useState(0);
  const [chartData, setChartData] = useState<Array<{ anos: number; valor: number }>>([]);

  const formatearNumero = (numero: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numero);
  };

  const calcularJubilacion = () => {
    // Validaciones
    if (edadActual >= edadJubilacion) {
      alert('La edad de jubilación debe ser mayor que la edad actual');
      return;
    }

    if (edadActual < 18 || edadActual > 67) {
      alert('La edad actual debe estar entre 18 y 67 años');
      return;
    }

    // Obtener rentabilidad anual
    let rentabilidadAnual: number;
    if (rentabilidad === 'custom') {
      rentabilidadAnual = rentabilidadPersonalizada;
    } else {
      rentabilidadAnual = parseFloat(rentabilidad);
    }

    // Cálculos
    const anos = edadJubilacion - edadActual;
    const meses = anos * 12;
    const rentabilidadMensual = rentabilidadAnual / 100 / 12;

    // Fórmula de valor futuro con aportaciones periódicas
    // VF = VA(1+r)^n + PMT[((1+r)^n-1)/r]
    const factorCapitalInicial = Math.pow(1 + rentabilidadMensual, meses);
    const valorFuturoCapitalInicial = capitalInicial * factorCapitalInicial;

    let valorFuturoAportaciones = 0;
    if (rentabilidadMensual > 0 && aportacionMensual > 0) {
      valorFuturoAportaciones =
        aportacionMensual * ((factorCapitalInicial - 1) / rentabilidadMensual);
    } else if (aportacionMensual > 0) {
      valorFuturoAportaciones = aportacionMensual * meses;
    }

    const capitalTotalCalculado = valorFuturoCapitalInicial + valorFuturoAportaciones;
    const totalAportadoCalculado = capitalInicial + aportacionMensual * meses;

    // Pensión mensual equivalente (asumiendo 20 años de jubilación)
    const pensionMensualCalculada = capitalTotalCalculado / (20 * 12);

    // Actualizar estado
    setCapitalTotal(capitalTotalCalculado);
    setPensionMensual(pensionMensualCalculada);
    setAnosAhorro(anos);
    setTotalAportado(totalAportadoCalculado);
    setShowResults(true);

    // Generar datos del gráfico
    generarGrafico(capitalInicial, aportacionMensual, rentabilidadMensual, anos);
  };

  const generarGrafico = (
    capitalInicialParam: number,
    aportacionMensualParam: number,
    rentabilidadMensualParam: number,
    anosAhorroParam: number
  ) => {
    const intervalos = Math.min(10, anosAhorroParam); // Máximo 10 barras
    const anosPorBarra = Math.ceil(anosAhorroParam / intervalos);

    const valores: Array<{ anos: number; valor: number }> = [];

    for (let i = 0; i < intervalos; i++) {
      const anosTranscurridos = (i + 1) * anosPorBarra;
      const mesesTranscurridos = Math.min(anosTranscurridos * 12, anosAhorroParam * 12);

      const factorCapital = Math.pow(1 + rentabilidadMensualParam, mesesTranscurridos);
      const valorCapitalInicial = capitalInicialParam * factorCapital;

      let valorAportaciones = 0;
      if (rentabilidadMensualParam > 0) {
        valorAportaciones =
          aportacionMensualParam * ((factorCapital - 1) / rentabilidadMensualParam);
      } else {
        valorAportaciones = aportacionMensualParam * mesesTranscurridos;
      }

      const valorTotal = valorCapitalInicial + valorAportaciones;
      valores.push({
        anos: Math.min(anosTranscurridos, anosAhorroParam),
        valor: valorTotal,
      });
    }

    setChartData(valores);
  };

  // Cálculo automático cuando cambian los valores
  useEffect(() => {
    if (edadActual && edadJubilacion) {
      calcularJubilacion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    edadActual,
    edadJubilacion,
    capitalInicial,
    aportacionMensual,
    rentabilidad,
    rentabilidadPersonalizada,
  ]);

  // Calcular altura máxima para el gráfico
  const maxValor = Math.max(...chartData.map((item) => item.valor), 1);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />
      <AnalyticsTracker appName="calculadora-jubilacion" />

      <div className={styles.mainAppWrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>💰 Calculadora de Jubilación</h1>
            <p>Planifica tu futuro financiero con precisión</p>
          </div>

          <div className={styles.content}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>📊 Datos de tu Plan</h3>

              <div className={styles.formGroup}>
                <label htmlFor="edadActual">Edad actual (años)</label>
                <input
                  type="number"
                  id="edadActual"
                  min="18"
                  max="67"
                  value={edadActual}
                  onChange={(e) => setEdadActual(parseInt(e.target.value) || 35)}
                  placeholder="Ej: 35"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edadJubilacion">Edad de jubilación deseada (años)</label>
                <input
                  type="number"
                  id="edadJubilacion"
                  min="50"
                  max="75"
                  value={edadJubilacion}
                  onChange={(e) => setEdadJubilacion(parseInt(e.target.value) || 65)}
                  placeholder="Ej: 65"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="capitalInicial">Capital inicial (€)</label>
                <input
                  type="number"
                  id="capitalInicial"
                  min="0"
                  value={capitalInicial}
                  onChange={(e) => setCapitalInicial(parseFloat(e.target.value) || 0)}
                  placeholder="Ej: 5000"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="aportacionMensual">Aportación mensual (€)</label>
                <input
                  type="number"
                  id="aportacionMensual"
                  min="0"
                  value={aportacionMensual}
                  onChange={(e) => setAportacionMensual(parseFloat(e.target.value) || 0)}
                  placeholder="Ej: 300"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="rentabilidad">Rentabilidad anual esperada</label>
                <select
                  id="rentabilidad"
                  value={rentabilidad}
                  onChange={(e) => setRentabilidad(e.target.value)}
                >
                  <option value="3">Conservador - 3% anual</option>
                  <option value="5">Moderado - 5% anual</option>
                  <option value="7">Agresivo - 7% anual</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {rentabilidad === 'custom' && (
                <div className={styles.formGroup}>
                  <label htmlFor="rentabilidadPersonalizada">
                    Rentabilidad personalizada (%)
                  </label>
                  <input
                    type="number"
                    id="rentabilidadPersonalizada"
                    min="0"
                    max="20"
                    step="0.1"
                    value={rentabilidadPersonalizada}
                    onChange={(e) =>
                      setRentabilidadPersonalizada(parseFloat(e.target.value) || 5)
                    }
                    placeholder="Ej: 4.5"
                  />
                </div>
              )}

              <button type="button" className={styles.calcButton} onClick={calcularJubilacion}>
                🔢 Calcular mi Jubilación
              </button>
            </div>

            <div className={styles.resultsSection}>
              <h3 className={styles.sectionTitle}>📈 Resultados</h3>

              {showResults ? (
                <div id="results">
                  <div className={styles.resultCard}>
                    <div className={styles.resultValue}>{formatearNumero(capitalTotal)}</div>
                    <div className={styles.resultLabel}>Capital total acumulado</div>
                  </div>

                  <div className={styles.resultCard}>
                    <div className={styles.resultValue}>{formatearNumero(pensionMensual)}</div>
                    <div className={styles.resultLabel}>
                      Pensión mensual equivalente (20 años)
                    </div>
                  </div>

                  <div className={styles.resultCard}>
                    <div className={styles.resultValue}>{anosAhorro} años</div>
                    <div className={styles.resultLabel}>Período de ahorro</div>
                  </div>

                  <div className={styles.resultCard}>
                    <div className={styles.resultValue}>{formatearNumero(totalAportado)}</div>
                    <div className={styles.resultLabel}>
                      Total aportado (capital + mensualidades)
                    </div>
                  </div>
                </div>
              ) : (
                <div id="noResults">
                  <p className={styles.noResults}>
                    ✏️ Completa los datos para ver tus resultados
                  </p>
                </div>
              )}
            </div>
          </div>

          {showResults && chartData.length > 0 && (
            <div className={styles.chartContainer} id="chartContainer">
              <h3 className={styles.chartTitle}>📊 Evolución de tu Capital</h3>
              <div className={styles.chartBars}>
                {chartData.map((item, index) => {
                  const altura = (item.valor / maxValor) * 100;
                  return (
                    <div key={index} className={styles.chartBar} style={{ height: `${altura}%` }}>
                      <div className={styles.chartBarLabel}>Año {item.anos}</div>
                      <div className={styles.chartBarValue}>{formatearNumero(item.valor)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.disclaimer}>
            <h4>⚠️ Advertencia Legal y Limitaciones</h4>
            <p>
              Esta calculadora proporciona estimaciones basadas en datos históricos y proyecciones
              matemáticas. <strong>Los rendimientos pasados no garantizan resultados futuros.</strong>{' '}
              Las rentabilidades reales pueden variar significativamente debido a fluctuaciones del
              mercado, inflación, cambios legislativos y otros factores económicos.
            </p>
            <br />
            <p>
              Esta herramienta tiene fines educativos e informativos únicamente. Para decisiones de
              inversión importantes, consulte con un asesor financiero profesional. meskeIA no se
              hace responsable de las decisiones tomadas basándose en estos cálculos.
            </p>
          </div>
        </div>

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Planificación de Jubilación?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre estrategias de ahorro, conceptos clave de inversión a largo plazo, consejos prácticos y respuestas a preguntas frecuentes sobre planificación financiera para tu jubilación
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido Educativo Colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            <section className={styles.retirementGuide}>
            <h2>Guía Completa para Planificar tu Jubilación</h2>
            <p>
              Nuestra calculadora de jubilación te ayuda a planificar tu futuro financiero con
              precisión. Utilizando fórmulas de valor futuro con aportaciones periódicas, puedes
              proyectar cuánto capital necesitarás acumular y qué pensión mensual podrás obtener
              según diferentes escenarios de rentabilidad y ahorro.
            </p>

            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <h4>💰 Cálculo de Pensión Futura</h4>
                <p>
                  <strong>Proyección precisa:</strong> Calcula tu pensión mensual futura basada en tu
                  capacidad de ahorro actual.
                </p>
                <p>
                  La calculadora utiliza fórmulas financieras avanzadas para proyectar el capital
                  total que acumularás hasta tu jubilación y la pensión mensual equivalente que
                  podrás obtener durante 20 años de jubilación.
                </p>
              </div>

              <div className={styles.featureItem}>
                <h4>📊 Escenarios de Rentabilidad</h4>
                <p>
                  <strong>Múltiples estrategias:</strong> Compara escenarios conservadores, moderados
                  y agresivos de inversión.
                </p>
                <p>
                  Perfil Conservador (3% anual): Inversiones de bajo riesgo. Perfil Moderado (5%
                  anual): Equilibrio entre riesgo y rentabilidad. Perfil Agresivo (7% anual): Mayor
                  potencial con más volatilidad. Opción personalizada para estrategias específicas.
                </p>
              </div>

              <div className={styles.featureItem}>
                <h4>📈 Visualización de Evolución</h4>
                <p>
                  <strong>Gráficos interactivos:</strong> Observa cómo evoluciona tu capital de ahorro
                  a lo largo de los años.
                </p>
                <p>
                  Los gráficos de barras muestran la progresión de tu capital acumulado año tras año,
                  considerando tanto el capital inicial como las aportaciones mensuales con sus
                  respectivos rendimientos compuestos.
                </p>
              </div>

              <div className={styles.featureItem}>
                <h4>🎯 Planificación Personalizada</h4>
                <p>
                  <strong>Ajuste a tu situación:</strong> Personaliza todos los parámetros según tu
                  situación financiera específica.
                </p>
                <p>
                  Configura tu edad actual, edad de jubilación deseada, capital inicial disponible,
                  aportación mensual posible y rentabilidad esperada para obtener un plan de
                  jubilación completamente adaptado a ti.
                </p>
              </div>

              <div className={styles.featureItem}>
                <h4>🔒 Privacidad y Seguridad</h4>
                <p>
                  <strong>Cálculos locales:</strong> Toda tu información financiera permanece privada
                  en tu navegador.
                </p>
                <p>
                  Los cálculos se realizan completamente en tu dispositivo sin enviar datos a
                  servidores externos, garantizando confidencialidad absoluta de tu información
                  financiera personal y planes de jubilación.
                </p>
              </div>

              <div className={styles.featureItem}>
                <h4>⚡ Resultados Instantáneos</h4>
                <p>
                  <strong>Recálculo automático:</strong> Los resultados se actualizan
                  instantáneamente al modificar cualquier parámetro.
                </p>
                <p>
                  Sistema de cálculo dinámico que permite experimentar con diferentes escenarios de
                  ahorro e inversión para encontrar la estrategia de jubilación que mejor se adapte a
                  tus objetivos financieros.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.strategies}>
            <h3>Estrategias de Ahorro para la Jubilación</h3>
            <div className={styles.strategiesGrid}>
              <div className={styles.strategyCard}>
                <h4>🏛️ Estrategia Conservadora</h4>
                <p>
                  Ideal para inversores con baja tolerancia al riesgo. Utiliza instrumentos de renta
                  fija, depósitos a plazo y bonos del estado. Rentabilidad esperada del 3% anual con
                  muy bajo riesgo de pérdidas.
                </p>
              </div>

              <div className={styles.strategyCard}>
                <h4>⚖️ Estrategia Moderada</h4>
                <p>
                  Equilibrio entre seguridad y crecimiento. Combina renta fija (60%) y renta variable
                  (40%). Rentabilidad esperada del 5% anual con riesgo moderado y mejor protección
                  contra la inflación.
                </p>
              </div>

              <div className={styles.strategyCard}>
                <h4>📈 Estrategia Agresiva</h4>
                <p>
                  Para inversores jóvenes con horizonte temporal largo. Mayor exposición a renta
                  variable nacional e internacional. Rentabilidad esperada del 7% anual con volatilidad
                  alta pero mayor potencial de crecimiento.
                </p>
              </div>

              <div className={styles.strategyCard}>
                <h4>🎯 Estrategia Personalizada</h4>
                <p>
                  Diseña tu propia estrategia según tus conocimientos y preferencias de inversión.
                  Permite ajustar la rentabilidad esperada según tu cartera específica de inversiones
                  y productos financieros.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.concepts}>
            <h3>Conceptos Clave de Planificación de Jubilación</h3>
            <div className={styles.conceptsGrid}>
              <div className={styles.conceptItem}>
                <h4>Interés Compuesto</h4>
                <p>
                  El interés compuesto es el motor del crecimiento a largo plazo. Los rendimientos se
                  reinvierten generando nuevos rendimientos, creando un efecto multiplicador que se
                  acelera con el tiempo.
                </p>
              </div>

              <div className={styles.conceptItem}>
                <h4>Horizonte Temporal</h4>
                <p>
                  A mayor tiempo hasta la jubilación, mayor capacidad para asumir riesgos y obtener
                  rentabilidades superiores. El horizonte temporal largo permite superar las
                  volatilidades del mercado.
                </p>
              </div>

              <div className={styles.conceptItem}>
                <h4>Diversificación</h4>
                <p>
                  Distribuir las inversiones entre diferentes activos, sectores y geografías reduce el
                  riesgo global de la cartera manteniendo el potencial de rentabilidad a largo plazo.
                </p>
              </div>

              <div className={styles.conceptItem}>
                <h4>Inflación</h4>
                <p>
                  La inflación reduce el poder adquisitivo del dinero con el tiempo. Es crucial que la
                  rentabilidad de las inversiones supere la inflación para mantener el nivel de vida en
                  la jubilación.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.tips}>
            <h3>Consejos Prácticos para Maximizar tu Jubilación</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <h4>💡 Tip 1: Empieza Cuanto Antes</h4>
                <p>
                  El factor tiempo es crucial en la planificación de la jubilación. Comenzar a ahorrar
                  a los 25 años en lugar de a los 35 puede duplicar el capital acumulado gracias al
                  interés compuesto.
                </p>
              </div>

              <div className={styles.tipCard}>
                <h4>💡 Tip 2: Aumenta las Aportaciones</h4>
                <p>
                  Incrementa tu aportación mensual cada vez que recibas un aumento salarial. Destinar
                  al menos el 10-15% de tus ingresos al ahorro para la jubilación es una buena
                  práctica.
                </p>
              </div>

              <div className={styles.tipCard}>
                <h4>💡 Tip 3: Aprovecha las Ventajas Fiscales</h4>
                <p>
                  Utiliza productos con ventajas fiscales como planes de pensiones, seguros de ahorro o
                  EPSV que permiten diferir impuestos y optimizar la fiscalidad de tu ahorro.
                </p>
              </div>

              <div className={styles.tipCard}>
                <h4>💡 Tip 4: Revisa Regularmente</h4>
                <p>
                  Revisa tu plan de jubilación al menos una vez al año. Ajusta las aportaciones, la
                  estrategia de inversión y los objetivos según cambien tus circunstancias personales y
                  del mercado.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <div className={styles.faqContainer}>
            <div className={styles.faqCard}>
              <h2 className={styles.faqTitle}>❓ Preguntas Frecuentes</h2>

              <div className={styles.faqGrid}>
                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    ¿Cuándo debo empezar a planificar mi jubilación?
                  </summary>
                  <p className={styles.faqAnswer}>
                    Lo ideal es comenzar en cuanto empiezas a trabajar. Incluso pequeñas aportaciones
                    a los 20 años pueden generar un capital significativo gracias al interés compuesto.
                    Nunca es tarde para empezar, pero cuanto antes mejor.
                  </p>
                </details>

                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    ¿Qué porcentaje de mis ingresos debo ahorrar?
                  </summary>
                  <p className={styles.faqAnswer}>
                    Los expertos recomiendan ahorrar entre el 10% y 15% de tus ingresos brutos para la
                    jubilación. Si empiezas tarde, puede ser necesario ahorrar un porcentaje mayor para
                    alcanzar tus objetivos.
                  </p>
                </details>

                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    ¿Son realistas las rentabilidades propuestas?
                  </summary>
                  <p className={styles.faqAnswer}>
                    Las rentabilidades están basadas en promedios históricos a largo plazo. El 3% es
                    conservador (renta fija), 5% moderado (carteras mixtas) y 7% agresivo (renta
                    variable). Los resultados reales pueden variar.
                  </p>
                </details>

                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    ¿Qué pasa si cambio de trabajo frecuentemente?
                  </summary>
                  <p className={styles.faqAnswer}>
                    La planificación individual de jubilación te da independencia de tu empleador.
                    Planes de pensiones individuales, seguros de ahorro y carteras de inversión te
                    acompañan independientemente de tu situación laboral.
                  </p>
                </details>

                <details className={styles.faqDetails}>
                  <summary className={styles.faqSummary}>
                    ¿Debo contar con la pensión pública?
                  </summary>
                  <p className={styles.faqAnswer}>
                    La pensión pública será un complemento, pero es recomendable no depender
                    exclusivamente de ella. Las tendencias demográficas sugieren que las pensiones
                    públicas futuras podrían ser menores que las actuales.
                  </p>
                </details>
              </div>
            </div>
          </div>

          {/* Secciones Educativas meskeIA */}
          <div className={styles.meskeiEduSection}>
            <h2>¿Cómo funciona esta calculadora de jubilación?</h2>
            <p>
              Estima tu pensión futura, calcula cuánto ahorrar para mantener nivel de vida y proyecta
              ingresos necesarios en la jubilación según edad y esperanza de vida.
            </p>
            <ul>
              <li>
                <strong>Estimación de pensión</strong>: Calcula pensión pública según años cotizados y
                base reguladora
              </li>
              <li>
                <strong>Gap de ingresos</strong>: Diferencia entre ingresos actuales y pensión esperada
              </li>
              <li>
                <strong>Ahorro necesario</strong>: Capital requerido para complementar pensión pública
              </li>
              <li>
                <strong>Tasa de reemplazo</strong>: Porcentaje del último salario que recibirás de
                pensión
              </li>
              <li>
                <strong>Esperanza de vida</strong>: Ajusta proyecciones según expectativa de años de
                retiro
              </li>
            </ul>
          </div>

          <div className={styles.meskeiEduSection}>
            <h2>Casos de uso prácticos</h2>
            <ul>
              <li>
                <strong>Planificar jubilación</strong>: Ganas 40.000€/año, pensión estimada 24.000€
                (60%). Gap = 16.000€/año a cubrir
              </li>
              <li>
                <strong>Autónomos</strong>: Sin pensión garantizada. ¿Cuánto ahorrar para 1.500€/mes
                durante 25 años? = 300.000€
              </li>
              <li>
                <strong>Jubilación anticipada</strong>: Retirarte a 55 en vez de 67. Necesitas 12 años
                extra de ahorro = +144.000€
              </li>
              <li>
                <strong>Complemento privado</strong>: Pensión pública 1.200€/mes, necesitas 2.000€. Plan
                de pensiones aporta 800€/mes
              </li>
              <li>
                <strong>Herencia planificada</strong>: Calcular capital sobrante si falleces antes de
                agotar ahorros de jubilación
              </li>
            </ul>
          </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
