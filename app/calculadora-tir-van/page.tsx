'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraTIRVAN.module.css';
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
        <h1 className={styles.title}>📈 Calculadora TIR y VAN</h1>
        <p className={styles.subtitle}>
          Evalúa la rentabilidad de tus proyectos de inversión
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>💰 Datos del Proyecto</h2>

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
              <h3 className={styles.sectionTitle}>📊 Flujos de Caja Esperados</h3>
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
              <button className={styles.btnSecundario} onClick={agregarAno}>
                + Añadir Año
              </button>
              {flujos.length > 1 && (
                <button className={styles.btnSecundario} onClick={eliminarUltimoAno}>
                  - Quitar Año
                </button>
              )}
            </div>
          </div>

          <button
            className={styles.btnCalcular}
            onClick={() => setCalculado(true)}
          >
            Calcular TIR y VAN
          </button>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>📊 Resultados del Análisis</h2>

          {resultado ? (
            <>
              {/* Resultados Principales */}
              <div className={styles.resultadosGrid}>
                <div className={`${styles.resultadoCard} ${resultado.van >= 0 ? styles.positivo : styles.negativo}`}>
                  <div className={styles.resultadoIcon}>💵</div>
                  <span className={styles.resultadoLabel}>Valor Actual Neto (VAN)</span>
                  <span className={styles.resultadoValor}>
                    {formatCurrency(resultado.van)}
                  </span>
                  <span className={styles.resultadoSubtexto}>
                    {resultado.van >= 0 ? 'Genera valor' : 'Destruye valor'}
                  </span>
                </div>

                <div className={`${styles.resultadoCard} ${resultado.tir && resultado.tir > parseSpanishNumber(tasaDescuento) ? styles.positivo : styles.negativo}`}>
                  <div className={styles.resultadoIcon}>📈</div>
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
                  <div className={styles.resultadoIcon}>⏱️</div>
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
                  <div className={styles.resultadoIcon}>💰</div>
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
                <h4>📋 Interpretación del Análisis</h4>
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
                    ? '✅ Recomendación: El proyecto es financieramente viable'
                    : '❌ Recomendación: El proyecto no cumple los criterios de rentabilidad'}
                </div>
              </div>

              {/* Tabla de Flujos Descontados */}
              <div className={styles.tablaFlujos}>
                <h4>📊 Desglose de Flujos Descontados</h4>
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
              <div className={styles.placeholderIcon}>📈</div>
              <p>Introduce los datos del proyecto</p>
              <p>y pulsa &quot;Calcular TIR y VAN&quot;</p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-tir-van"
        collapsible={true}
      />

      

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres entender mejor el VAN y la TIR?"
        subtitle="Aprende los conceptos fundamentales del análisis de inversiones y cómo interpretar estos indicadores"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué son el VAN y la TIR?</h2>
          <p className={styles.introParagraph}>
            El VAN (Valor Actual Neto) y la TIR (Tasa Interna de Retorno) son las dos herramientas
            más utilizadas en finanzas para evaluar la viabilidad de proyectos de inversión. Permiten
            comparar diferentes alternativas y decidir si una inversión merece la pena.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>💵 Valor Actual Neto (VAN)</h4>
              <p>
                El VAN calcula cuánto valor genera (o destruye) un proyecto en términos de dinero de hoy.
                Descuenta los flujos futuros a una tasa que representa el coste de oportunidad del capital.
                Si el VAN es positivo, el proyecto genera valor; si es negativo, lo destruye.
              </p>
              <code className={styles.formula}>VAN = -I₀ + Σ(FC_t / (1+r)^t)</code>
            </div>
            <div className={styles.contentCard}>
              <h4>📈 Tasa Interna de Retorno (TIR)</h4>
              <p>
                La TIR es la tasa de descuento que hace que el VAN sea exactamente cero.
                Representa la rentabilidad intrínseca del proyecto. Si la TIR supera el
                coste del capital (tasa de descuento), el proyecto es rentable.
              </p>
              <code className={styles.formula}>TIR = r cuando VAN = 0</code>
            </div>
            <div className={styles.contentCard}>
              <h4>⏱️ Payback Descontado</h4>
              <p>
                Es el tiempo necesario para recuperar la inversión inicial, considerando
                el valor temporal del dinero. A diferencia del payback simple, tiene en cuenta
                que un euro hoy vale más que un euro mañana.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Tasa de Descuento</h4>
              <p>
                Representa el coste de oportunidad del capital: la rentabilidad que obtendrías
                invirtiendo en una alternativa de riesgo similar. Puede ser el coste de financiación
                (WACC) o la rentabilidad mínima exigida por los accionistas.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Criterios de Decisión</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>✅ Aceptar el proyecto si:</h4>
              <p>
                • VAN &gt; 0 (genera valor añadido)<br />
                • TIR &gt; tasa de descuento<br />
                • Payback &lt; período máximo aceptable<br />
                Los tres criterios deberían cumplirse simultáneamente.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>❌ Rechazar el proyecto si:</h4>
              <p>
                • VAN &lt; 0 (destruye valor)<br />
                • TIR &lt; tasa de descuento<br />
                • Payback &gt; período máximo aceptable<br />
                El VAN es el criterio más fiable para proyectos mutuamente excluyentes.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-tir-van')} />

      <ShareCard appName="calculadora-tir-van" />
      <Footer appName="calculadora-tir-van" />
    </div>
  );
}
