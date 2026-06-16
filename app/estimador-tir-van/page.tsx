'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorTirVan.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface FlujosCaja {
  ano: number;
  valor: string;
}

interface ResultadoTIRVAN {
  van: number;
  tir: number | null;
  tirEncontrada: boolean;
  payback: number | null;
  flujosDescontados: { ano: number; flujo: number; flujoDescontado: number; acumulado: number }[];
  totalInversion: number;
  totalRetornos: number;
}

export default function CalculadoraTIRVANPage() {
  const [inversionInicial, setInversionInicial] = useState('100000');
  const [tasaDescuento, setTasaDescuento] = useState('10');
  const [flujos, setFlujos] = useState<FlujosCaja[]>([
    { ano: 1, valor: '25000' },
    { ano: 2, valor: '30000' },
    { ano: 3, valor: '35000' },
    { ano: 4, valor: '40000' },
    { ano: 5, valor: '45000' },
  ]);

  const [calculado, setCalculado] = useState(false);

  // Añadir un año más
  const agregarAno = () => {
    const nuevoAno = flujos.length > 0 ? flujos[flujos.length - 1].ano + 1 : 1;
    setFlujos([...flujos, { ano: nuevoAno, valor: '' }]);
  };

  // Eliminar el último año
  const eliminarUltimoAno = () => {
    if (flujos.length > 1) {
      setFlujos(flujos.slice(0, -1));
    }
  };

  // Actualizar valor de flujo
  const actualizarFlujo = (index: number, valor: string) => {
    const nuevosFlujos = [...flujos];
    nuevosFlujos[index].valor = valor;
    setFlujos(nuevosFlujos);
  };

  // Calcular VAN
  const calcularVAN = (tasa: number, inversion: number, flujosArray: number[]): number => {
    let van = -inversion;
    flujosArray.forEach((flujo, i) => {
      van += flujo / Math.pow(1 + tasa / 100, i + 1);
    });
    return van;
  };

  // Calcular TIR usando método de Newton-Raphson
  const calcularTIR = (inversion: number, flujosArray: number[]): number | null => {
    // Empezar con una estimación inicial
    let tir = 10; // 10%
    const maxIteraciones = 100;
    const tolerancia = 0.0001;

    for (let i = 0; i < maxIteraciones; i++) {
      const van = calcularVAN(tir, inversion, flujosArray);

      // Derivada del VAN respecto a la tasa
      let derivada = 0;
      flujosArray.forEach((flujo, j) => {
        derivada -= (j + 1) * flujo / Math.pow(1 + tir / 100, j + 2) / 100;
      });

      if (Math.abs(derivada) < 0.0000001) {
        // Evitar división por cero
        break;
      }

      const nuevaTIR = tir - van / derivada;

      if (Math.abs(nuevaTIR - tir) < tolerancia) {
        return nuevaTIR;
      }

      tir = nuevaTIR;

      // Evitar valores extremos
      if (tir < -99 || tir > 1000) {
        break;
      }
    }

    // Si no converge, intentar método de bisección
    let tirBaja = -50;
    let tirAlta = 200;

    for (let i = 0; i < maxIteraciones; i++) {
      const tirMedia = (tirBaja + tirAlta) / 2;
      const vanMedia = calcularVAN(tirMedia, inversion, flujosArray);

      if (Math.abs(vanMedia) < tolerancia || (tirAlta - tirBaja) / 2 < tolerancia) {
        return tirMedia;
      }

      const vanBaja = calcularVAN(tirBaja, inversion, flujosArray);

      if (vanMedia * vanBaja < 0) {
        tirAlta = tirMedia;
      } else {
        tirBaja = tirMedia;
      }
    }

    return null;
  };

  const resultado = useMemo((): ResultadoTIRVAN | null => {
    if (!calculado) return null;

    const inversion = parseSpanishNumber(inversionInicial) || 0;
    const tasa = parseSpanishNumber(tasaDescuento) || 0;
    const flujosNumericos = flujos.map(f => parseSpanishNumber(f.valor) || 0);

    // Calcular VAN
    const van = calcularVAN(tasa, inversion, flujosNumericos);

    // Calcular TIR
    const tir = calcularTIR(inversion, flujosNumericos);

    // Calcular flujos descontados y payback
    let acumulado = -inversion;
    let payback: number | null = null;
    const flujosDescontados = flujosNumericos.map((flujo, i) => {
      const flujoDescontado = flujo / Math.pow(1 + tasa / 100, i + 1);
      acumulado += flujoDescontado;

      // Calcular payback descontado
      if (payback === null && acumulado >= 0) {
        const acumuladoAnterior = acumulado - flujoDescontado;
        payback = i + (-acumuladoAnterior / flujoDescontado);
      }

      return {
        ano: i + 1,
        flujo,
        flujoDescontado,
        acumulado,
      };
    });

    // Total inversión y retornos
    const totalRetornos = flujosNumericos.reduce((sum, f) => sum + f, 0);

    return {
      van,
      tir,
      tirEncontrada: tir !== null,
      payback,
      flujosDescontados,
      totalInversion: inversion,
      totalRetornos,
    };
  }, [calculado, inversionInicial, tasaDescuento, flujos]);

  const esProyectoRentable = resultado && resultado.van > 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📈</span> Estimador TIR y VAN</h1>
        <p className={styles.subtitle}>
          Evalúa la rentabilidad de tus proyectos de inversión
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">💰</span> Datos del Proyecto</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Inversión inicial</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={inversionInicial}
                onChange={(e) => setInversionInicial(e.target.value)}
                placeholder="100000"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>Capital necesario para iniciar el proyecto</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Tasa de descuento (coste de oportunidad)</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={tasaDescuento}
                onChange={(e) => setTasaDescuento(e.target.value)}
                placeholder="10"
              />
              <span className={styles.unit}>%</span>
            </div>
            <span className={styles.helpText}>Rentabilidad mínima esperada o coste del capital</span>
          </div>

          <div className={styles.flujosSection}>
            <div className={styles.flujosHeader}>
              <h3 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Flujos de Caja Esperados</h3>
            </div>

            <div className={styles.flujosLista}>
              {flujos.map((flujo, index) => {
                const valor = parseSpanishNumber(flujo.valor) || 0;
                const esPositivo = valor > 0;
                const esNegativo = valor < 0;

                return (
                  <div key={index} className={styles.flujoItem}>
                    <span className={styles.flujoAno}>Año {flujo.ano}</span>
                    <input
                      type="text"
                      className={`${styles.flujoInput} ${esPositivo ? styles.positivo : ''} ${esNegativo ? styles.negativo : ''}`}
                      value={flujo.valor}
                      onChange={(e) => actualizarFlujo(index, e.target.value)}
                      placeholder="0"
                    />
                    <span className={styles.unit}>€</span>
                    {flujos.length > 1 && index === flujos.length - 1 && (
                      <button
                        type="button"
                        className={styles.btnEliminar}
                        onClick={() => eliminarUltimoAno()}
                        title="Eliminar año"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.botonesAccion}>
              <button type="button" className={styles.btnSecundario} onClick={agregarAno}>
                + Añadir Año
              </button>
              {flujos.length > 1 && (
                <button type="button" className={styles.btnSecundario} onClick={eliminarUltimoAno}>
                  - Quitar Año
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            className={styles.btnCalcular}
            onClick={() => setCalculado(true)}
          >
            Calcular TIR y VAN
          </button>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Resultados del Análisis</h2>

          {resultado ? (
            <>
              {/* Resultados Principales */}
              <div className={styles.resultadosGrid}>
                <div className={`${styles.resultadoCard} ${resultado.van >= 0 ? styles.positivo : styles.negativo}`}>
                  <div className={styles.resultadoIcon} aria-hidden="true">💵</div>
                  <span className={styles.resultadoLabel}>Valor Actual Neto (VAN)</span>
                  <span className={styles.resultadoValor}>
                    {formatCurrency(resultado.van)}
                  </span>
                  <span className={styles.resultadoSubtexto}>
                    {resultado.van >= 0 ? 'Genera valor' : 'Destruye valor'}
                  </span>
                </div>

                <div className={`${styles.resultadoCard} ${resultado.tir && resultado.tir > parseSpanishNumber(tasaDescuento) ? styles.positivo : styles.negativo}`}>
                  <div className={styles.resultadoIcon} aria-hidden="true">📈</div>
                  <span className={styles.resultadoLabel}>Tasa Interna de Retorno (TIR)</span>
                  <span className={styles.resultadoValor}>
                    {resultado.tirEncontrada
                      ? `${formatNumber(resultado.tir!, 2)}%`
                      : 'No calculable'}
                  </span>
                  <span className={styles.resultadoSubtexto}>
                    {resultado.tirEncontrada
                      ? resultado.tir! > parseSpanishNumber(tasaDescuento)
                        ? `Supera la tasa requerida (${tasaDescuento}%)`
                        : `Por debajo de la tasa requerida (${tasaDescuento}%)`
                      : 'Flujos irregulares'}
                  </span>
                </div>
              </div>

              {/* Payback y métricas adicionales */}
              <div className={styles.resultadosGrid}>
                <div className={styles.resultadoCard}>
                  <div className={styles.resultadoIcon} aria-hidden="true">⏱️</div>
                  <span className={styles.resultadoLabel}>Payback Descontado</span>
                  <span className={styles.resultadoValor}>
                    {resultado.payback !== null
                      ? `${formatNumber(resultado.payback, 1)} años`
                      : 'No recuperable'}
                  </span>
                  <span className={styles.resultadoSubtexto}>
                    Tiempo para recuperar la inversión
                  </span>
                </div>

                <div className={styles.resultadoCard}>
                  <div className={styles.resultadoIcon} aria-hidden="true">💰</div>
                  <span className={styles.resultadoLabel}>Retorno Total (sin descontar)</span>
                  <span className={styles.resultadoValor}>
                    {formatCurrency(resultado.totalRetornos)}
                  </span>
                  <span className={styles.resultadoSubtexto}>
                    Ratio: {formatNumber(resultado.totalRetornos / resultado.totalInversion, 2)}x
                  </span>
                </div>
              </div>

              {/* Interpretación */}
              <div className={styles.interpretacionBox}>
                <h4><span aria-hidden="true">📋</span> Interpretación del Análisis</h4>
                <p>
                  {resultado.van >= 0
                    ? `El proyecto genera un valor añadido de ${formatCurrency(resultado.van)} por encima de la rentabilidad mínima exigida (${tasaDescuento}%). `
                    : `El proyecto destruye valor: ${formatCurrency(Math.abs(resultado.van))} por debajo de la rentabilidad mínima exigida. `}
                  {resultado.tirEncontrada && (
                    <>
                      La rentabilidad real del proyecto (TIR) es del {formatNumber(resultado.tir!, 2)}%,
                      {resultado.tir! > parseSpanishNumber(tasaDescuento)
                        ? ` superior a la tasa de descuento del ${tasaDescuento}%.`
                        : ` inferior a la tasa de descuento del ${tasaDescuento}%.`}
                    </>
                  )}
                </p>
                <div className={`${styles.recomendacion} ${esProyectoRentable ? styles.positiva : styles.negativa}`}>
                  {esProyectoRentable
                    ? <><span aria-hidden="true">✅</span> Recomendación: El proyecto es financieramente viable</>
                    : <><span aria-hidden="true">❌</span> Recomendación: El proyecto no cumple los criterios de rentabilidad</>}
                </div>
              </div>

              {/* Tabla de Flujos Descontados */}
              <div className={styles.tablaFlujos}>
                <h4><span aria-hidden="true">📊</span> Desglose de Flujos Descontados</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Flujo</th>
                      <th>Flujo Descontado</th>
                      <th>Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Año 0 (Inversión)</td>
                      <td className={styles.flujoNegativo}>-{formatCurrency(resultado.totalInversion)}</td>
                      <td className={styles.flujoNegativo}>-{formatCurrency(resultado.totalInversion)}</td>
                      <td className={styles.flujoNegativo}>-{formatCurrency(resultado.totalInversion)}</td>
                    </tr>
                    {resultado.flujosDescontados.map((fd) => (
                      <tr key={fd.ano}>
                        <td>Año {fd.ano}</td>
                        <td className={fd.flujo >= 0 ? styles.flujoPositivo : styles.flujoNegativo}>
                          {formatCurrency(fd.flujo)}
                        </td>
                        <td className={fd.flujoDescontado >= 0 ? styles.flujoPositivo : styles.flujoNegativo}>
                          {formatCurrency(fd.flujoDescontado)}
                        </td>
                        <td className={fd.acumulado >= 0 ? styles.flujoPositivo : styles.flujoNegativo}>
                          {formatCurrency(fd.acumulado)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>Total</td>
                      <td>{formatCurrency(resultado.totalRetornos - resultado.totalInversion)}</td>
                      <td>-</td>
                      <td className={resultado.van >= 0 ? styles.flujoPositivo : styles.flujoNegativo}>
                        VAN: {formatCurrency(resultado.van)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon} aria-hidden="true">📈</div>
              <p>Introduce los datos del proyecto</p>
              <p>y pulsa &quot;Calcular TIR y VAN&quot;</p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-tir-van"
        collapsible={false}
      />

      

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 Guía completa de análisis de inversiones: VAN, TIR y Payback"
        subtitle="Aprende a evaluar proyectos de inversión con los indicadores más usados en finanzas y toma decisiones con datos reales"
      >
        {/* TABLA COMPARATIVA */}
        <section className={styles.eduComparativa}>
          <h2><span aria-hidden="true">⚖️</span> VAN vs TIR vs Payback: comparativa de indicadores</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>VAN</th>
                  <th>TIR</th>
                  <th>Payback Descontado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>¿Qué mide?</strong></td>
                  <td>Valor creado en € de hoy</td>
                  <td>Rentabilidad intrínseca (%)</td>
                  <td>Tiempo de recuperación</td>
                </tr>
                <tr>
                  <td><strong>Unidad</strong></td>
                  <td>Euros (€)</td>
                  <td>Porcentaje (%)</td>
                  <td>Años / meses</td>
                </tr>
                <tr>
                  <td><strong>Criterio aceptar</strong></td>
                  <td>VAN &gt; 0</td>
                  <td>TIR &gt; tasa descuento</td>
                  <td>Payback &lt; período máximo</td>
                </tr>
                <tr>
                  <td><strong>Ventaja clave</strong></td>
                  <td>Más fiable para proyectos excluyentes</td>
                  <td>Fácil de comparar con coste capital</td>
                  <td>Mide liquidez y recuperación</td>
                </tr>
                <tr>
                  <td><strong>Limitación</strong></td>
                  <td>Depende de la tasa de descuento elegida</td>
                  <td>Asume reinversión a la misma TIR</td>
                  <td>Ignora flujos después del payback</td>
                </tr>
                <tr>
                  <td><strong>Uso recomendado</strong></td>
                  <td>Decisión final siempre</td>
                  <td>Comparación entre proyectos similares</td>
                  <td>Complemento de liquidez</td>
                </tr>
                <tr>
                  <td><strong>Proyectos idóneos</strong></td>
                  <td>Todos (el más universal)</td>
                  <td>Proyectos independientes</td>
                  <td>Proyectos con riesgo de liquidez</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section className={styles.eduEscenarios}>
          <h2><span aria-hidden="true">🎯</span> Casos reales de análisis de inversión</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏭</span>
                <h3>Maquinaria industrial (PYME)</h3>
              </div>
              <p className={styles.escenarioExample}>
                Inversión inicial: 80.000 €. Flujos anuales: 25.000 € durante 5 años. Tasa descuento: 8%.
                <br /><strong>VAN = +19.800 € → Aceptar. TIR = 16,9% &gt; 8% → Rentable.</strong>
              </p>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> La maquinaria se amortiza en 3,8 años y genera valor adicional.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏗️</span>
                <h3>Proyecto inmobiliario (promotor)</h3>
              </div>
              <p className={styles.escenarioExample}>
                Inversión: 500.000 €. Venta en año 3: 750.000 €. Sin flujos intermedios. Tasa: 12%.
                <br /><strong>VAN = +33.500 € → Aceptar. TIR = 14,5% &gt; 12%.</strong>
              </p>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Payback de 3 años. Clave: certeza en precio de venta.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">☀️</span>
                <h3>Placas solares (particular)</h3>
              </div>
              <p className={styles.escenarioExample}>
                Inversión: 12.000 €. Ahorro anual en electricidad: 1.800 € durante 20 años. Tasa: 4%.
                <br /><strong>VAN = +12.450 € → Muy rentable. TIR = 14,4%.</strong>
              </p>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Payback: 7,5 años. A largo plazo, excelente inversión.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛑</span>
                <h3>Expansión tienda física (VAN negativo)</h3>
              </div>
              <p className={styles.escenarioExample}>
                Inversión: 60.000 €. Flujos anuales: 8.000 € durante 10 años. Tasa: 12%.
                <br /><strong>VAN = -14.800 € → Rechazar. TIR = 5,2% &lt; 12%.</strong>
              </p>
              <p className={styles.escenarioTip}><span aria-hidden="true">⚠️</span> Destruye valor aunque genera caja positiva anual.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
                <h3>App SaaS (startup tecnológica)</h3>
              </div>
              <p className={styles.escenarioExample}>
                Inversión: 150.000 €. Flujos crecientes: 10k, 30k, 60k, 90k, 120k €. Tasa: 18%.
                <br /><strong>VAN = +32.400 € → Aceptar. TIR = 26,1%.</strong>
              </p>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Crecimiento exponencial justifica alta tasa de descuento.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔀</span>
                <h3>Elegir entre 2 proyectos excluyentes</h3>
              </div>
              <p className={styles.escenarioExample}>
                Proyecto A: VAN=45.000 €, TIR=22%. Proyecto B: VAN=65.000 €, TIR=18%.
                <br /><strong>Decisión: Proyecto B (mayor VAN, aunque menor TIR).</strong>
              </p>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Siempre elige por VAN, no por TIR, en proyectos excluyentes.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre VAN, TIR y análisis de inversiones</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Qué tasa de descuento debo usar?</h4>
              <p>
                Depende del tipo de decisión. Para una empresa, usa el WACC (coste medio ponderado del capital): coste del capital propio × porcentaje propio + coste de deuda × porcentaje deuda. Para inversión personal, usa la rentabilidad alternativa: si podrías obtener un 5% en renta fija, usa esa como referencia. Para proyectos con riesgo alto (startups), aplica primas de riesgo del 15-25%.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Regla práctica:</strong> Empieza con el 8-10% para proyectos empresariales estándar. Ajusta según el riesgo específico del sector y momento económico.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Cuándo puede dar señales incorrectas la TIR?</h4>
              <p>
                La TIR tiene 3 limitaciones críticas: (1) En proyectos con flujos que cambian de signo varias veces, puede haber múltiples TIR matemáticas. (2) Asume que los flujos intermedios se reinvierten a la misma TIR, lo que raramente ocurre en la práctica. (3) Favorece proyectos pequeños con alta rentabilidad relativa sobre proyectos grandes con mayor valor absoluto. En estos casos, el VAN siempre es más fiable.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Solución:</strong> Para flujos no convencionales, usa la TIRM (Tasa Interna de Retorno Modificada), que asume una tasa de reinversión realista.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Qué significa un VAN de 0?</h4>
              <p>
                Un VAN = 0 significa que el proyecto exactamente compensa el coste del capital: recuperas la inversión inicial más la rentabilidad mínima exigida, pero no creas valor adicional. Es el punto de indiferencia matemática. En la práctica, un proyecto con VAN cercano a 0 probablemente no merece la pena debido al riesgo, el trabajo de gestión y los costes ocultos no modelados.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Umbral recomendado:</strong> Exige un VAN mínimo de 10-15% sobre la inversión inicial como &quot;margen de seguridad&quot; ante incertidumbre.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Cómo estimo los flujos de caja futuros?</h4>
              <p>
                Los flujos de caja son la parte más difícil y la que más impacto tiene en el resultado. Métodos recomendados: (1) Base histórica: si el negocio ya existe, proyecta con crecimientos conservadores (5-10%). (2) Bottom-up: construye desde unidades × precio × margen. (3) Escenarios: calcula 3 escenarios (pesimista, base, optimista) y promedia con probabilidades. Evita flujos &quot;deseados&quot; sin base analítica.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Consejo:</strong> Usa el escenario pesimista como caso de decisión. Si el VAN es positivo incluso en el peor caso, el proyecto es muy sólido.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿El Payback simple vs descontado: cuál usar?</h4>
              <p>
                El payback simple cuenta los años hasta recuperar la inversión sin considerar el valor del dinero en el tiempo. Es fácil pero engañoso. El payback descontado trae los flujos futuros a valor presente antes de acumularlos, siendo más preciso. Siempre usa payback descontado para proyectos de más de 2 años. La diferencia puede ser de 1-3 años en proyectos a largo plazo con altas tasas de descuento.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Límite recomendado:</strong> Para inversiones en maquinaria, máximo 4-5 años. Para inmobiliario, hasta 10-12 años. Para startups, el payback es secundario al VAN.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Cómo analizo proyectos con diferente duración?</h4>
              <p>
                Comparar un proyecto de 3 años con uno de 8 años directamente por VAN es erróneo. Métodos para igualar duraciones: (1) MCM (Mínimo Común Múltiplo): replica ambos proyectos hasta la misma duración total. (2) EAA (Equivalent Annual Annuity): convierte el VAN de cada proyecto en una anualidad equivalente. El proyecto con mayor EAA es el mejor cuando puedes repetir el ciclo.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Regla práctica:</strong> Si los proyectos son únicos (no repetibles), compara VAN directamente. Si son repetibles (renovar maquinaria cada X años), usa EAA.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Debo incluir la inflación en el análisis?</h4>
              <p>
                Hay dos enfoques consistentes: (1) Flujos reales + tasa real: proyecta flujos sin inflación y descuenta a tasa real (tasa nominal - inflación). (2) Flujos nominales + tasa nominal: incluye inflación en los flujos y descuenta a tasa nominal. NUNCA mezcles: flujos reales con tasa nominal (ni al revés) da resultados incorrectos. En España, con inflación variable, es más práctico el enfoque nominal con proyecciones conservadoras.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Tip:</strong> Para proyectos &gt;5 años, la inflación tiene impacto muy significativo. Una inflación del 3% durante 10 años reduce el valor real de un flujo al 74%.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Qué es el índice de rentabilidad (IR) y cuándo usarlo?</h4>
              <p>
                El Índice de Rentabilidad (IR) = (VAN + Inversión) / Inversión = VAN / Inversión + 1. Mide el valor creado por cada euro invertido. Es útil cuando tienes capital limitado y debes elegir entre varios proyectos: prioriza los de mayor IR, no los de mayor VAN absoluto. Ejemplo: Proyecto A (VAN=100k, IR=1.8), Proyecto B (VAN=150k, IR=1.3). Con 200k disponibles: A genera más valor por euro invertido.
              </p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Cuándo usarlo:</strong> Siempre que tengas restricción de capital y varios proyectos alternativos. El IR optimiza la cartera de proyectos.</p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2><span aria-hidden="true">📋</span> Cómo analizar una inversión paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Define claramente la inversión inicial (I₀)</h4>
                <p>Incluye TODOS los costes: compra de activo, instalación, formación, capital circulante necesario, y posibles costes de desmantelamiento al final. Un error común es olvidar el capital de trabajo (stock inicial, créditos a clientes). Para proyectos complejos, I₀ puede extenderse varios años.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Estima los flujos de caja libres (FCF)</h4>
                <p>FCF = EBITDA - Impuestos - CAPEX - Variación de capital circulante. No uses beneficio contable: las amortizaciones no son salidas de caja, pero sí afectan a los impuestos. Distingue entre flujos ciertos (contratos firmados) y proyecciones (estímalos conservadoramente, con -20% sobre lo &quot;esperado&quot;).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Determina la tasa de descuento apropiada</h4>
                <p>Para empresas: WACC (Ke × %equity + Kd × (1-t) × %deuda). Para inversiones personales: rentabilidad alternativa + prima de riesgo. Añade 2-5 puntos extra si el proyecto tiene alta incertidumbre. La tasa elegida tiene enorme impacto: pasar del 8% al 12% puede cambiar un VAN de +50k a -10k.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Calcula VAN, TIR y Payback descontado</h4>
                <p>Introduce todos los datos en la calculadora meskeIA. El VAN te da el valor en euros de hoy. La TIR te dice la rentabilidad anual equivalente. El Payback descontado te indica cuándo recuperas la inversión en términos reales. Los tres indicadores juntos dan una visión completa.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Realiza análisis de sensibilidad</h4>
                <p>Cambia los supuestos clave uno a uno: ¿qué pasa si los ingresos son un 20% menores? ¿Si la tasa de descuento sube 2 puntos? ¿Si el proyecto dura 2 años menos? Un buen proyecto debe mantener VAN positivo en todos los escenarios razonables. Si el VAN solo es positivo en el mejor caso, el proyecto es demasiado arriesgado.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Considera los factores cualitativos</h4>
                <p>El análisis financiero no lo es todo. Evalúa también: ¿encaja con la estrategia de la empresa? ¿Hay riesgos regulatorios o tecnológicos? ¿Qué pasa si un competidor lanza algo similar? ¿Es reversible si sale mal? Un proyecto con VAN positivo marginal y muchos riesgos cualitativos puede ser peor que uno con VAN menor pero más seguro.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Documenta y presenta la decisión</h4>
                <p>Registra los supuestos utilizados, los escenarios analizados y la justificación de la decisión. Esto es crucial para: aprender de proyectos anteriores, justificar la decisión ante inversores o directivos, y revisitar el análisis si cambia el contexto. Un buen análisis documentado puede reutilizarse para proyectos similares futuros.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section className={styles.eduTips}>
          <h2><span aria-hidden="true">✅</span> Mejores prácticas en análisis de inversiones</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>VAN manda sobre TIR</h4>
              <p>En proyectos mutuamente excluyentes, elige siempre el de mayor VAN. La TIR puede ser engañosa cuando los proyectos tienen diferente tamaño o duración.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Analiza escenarios, no solo el base</h4>
              <p>Calcula siempre 3 escenarios: pesimista, base y optimista. El proyecto debe ser rentable en el pesimista, no solo en el base. El análisis de sensibilidad es obligatorio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💰</span>
              <h4>Usa flujos de caja, no beneficios</h4>
              <p>El VAN trabaja con dinero real que entra y sale. Las amortizaciones son un gasto contable pero no una salida de caja. Siempre parte del EBITDA, no del beneficio neto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <h4>El payback es un complemento, no un criterio principal</h4>
              <p>El payback no mide rentabilidad, solo liquidez. Un proyecto con payback largo puede ser más rentable. Úsalo para evaluar riesgo de recuperación, no como decisión final.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <h4>Sé conservador con los flujos</h4>
              <p>Los flujos optimistas raramente se cumplen. Aplica un &quot;haircut&quot; del 10-20% a tus estimaciones de ingresos y un 10-20% de exceso en costes. El margen de seguridad salva proyectos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <h4>Documenta todos los supuestos</h4>
              <p>¿Por qué elegiste esa tasa de descuento? ¿En qué se basan los flujos proyectados? Documentar supuestos permite revisarlos si el contexto cambia y aprender de proyectos anteriores.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores frecuentes en el análisis de inversiones que cuestan dinero real</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong><span aria-hidden="true">❌</span>Usar la TIR como único criterio:</strong> La TIR puede dar múltiples valores matemáticos en proyectos con flujos irregulares, y favorece proyectos pequeños con alta rentabilidad relativa frente a proyectos grandes con mayor valor absoluto. El VAN siempre es el árbitro final.</li>
            <li><strong><span aria-hidden="true">❌</span>Olvidar el capital circulante en I₀:</strong> El stock inicial, los créditos a clientes y las fianzas a proveedores son parte de la inversión pero se olvidan frecuentemente. Su omisión infla artificialmente el VAN y crea problemas de liquidez desde el inicio.</li>
            <li><strong><span aria-hidden="true">❌</span>No incluir el valor residual:</strong> Al final del proyecto, los activos aún tienen valor (maquinaria, inmuebles, patentes). Olvidar el valor terminal puede hacer que un proyecto rentable parezca no serlo. Para proyectos inmobiliarios, el valor residual puede ser el 60-80% del VAN total.</li>
            <li><strong><span aria-hidden="true">❌</span>Usar flujos nominales con tasa real (o viceversa):</strong> Si proyectas flujos creciendo con inflación, debes descontar con tasa nominal. Si proyectas flujos en € constantes, usa tasa real. Mezclar ambos enfoques invalida completamente el análisis.</li>
            <li><strong><span aria-hidden="true">❌</span>Ignorar los costes hundidos:</strong> Los costes ya incurridos (estudio previo, prototipo) no deben incluirse en el análisis prospectivo. Solo importan los flujos futuros. Incluir costes hundidos sesga el VAN y puede llevar a seguir proyectos que deberían abandonarse.</li>
            <li><strong><span aria-hidden="true">❌</span>Tasa de descuento demasiado baja:</strong> Usar un 5% para un proyecto de startup de alto riesgo es un error grave. Una tasa demasiado baja infla artificialmente el VAN y hace que proyectos insostenibles parezcan atractivos. La tasa debe reflejar el riesgo real del proyecto.</li>
            <li><strong><span aria-hidden="true">❌</span>No revisar el análisis si cambian las condiciones:</strong> Un análisis hecho con tipos al 2% y hecho hace 3 años puede ser completamente inválido hoy. Actualiza el análisis si cambia significativamente la inflación, los tipos de interés o el entorno competitivo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-tir-van')} />

      <ShareCard appName="estimador-tir-van" />
      <Footer appName="estimador-tir-van" />
    </div>
  );
}
