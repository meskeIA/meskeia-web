'use client';

import { useState } from 'react';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { jsonLd } from './metadata';
import styles from './TIRVAN.module.css';

// Tipos
interface Scenario {
  name: string;
  rentaMultiplier: number;
  valorMultiplier: number;
  class: string;
}

const SCENARIOS: Scenario[] = [
  { name: 'Optimista', rentaMultiplier: 1.2, valorMultiplier: 1.3, class: 'optimista' },
  { name: 'Realista', rentaMultiplier: 1.0, valorMultiplier: 1.0, class: 'realista' },
  { name: 'Pesimista', rentaMultiplier: 0.8, valorMultiplier: 0.7, class: 'pesimista' },
];

export default function TIRVAN() {
  // Estados
  const [inversionInicial, setInversionInicial] = useState<string>('100000');
  const [rentaAnual, setRentaAnual] = useState<string>('12000');
  const [numeroAnios, setNumeroAnios] = useState<string>('10');
  const [valorFinal, setValorFinal] = useState<string>('150000');
  const [tipoMercado, setTipoMercado] = useState<string>('4');
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  // Formatear números al estilo español
  const formatearNumero = (numero: number, decimales: number = 2): string => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
      useGrouping: true,
    }).format(numero);
  };

  // Construir flujos de caja
  const buildCashFlows = (
    inversion: number,
    renta: number,
    anios: number,
    valorFinal: number
  ): number[] => {
    const cashFlows: number[] = [];

    // Año 0: Inversión inicial (negativa)
    cashFlows.push(-inversion);

    // Años 1 a n-1: Renta anual
    for (let i = 1; i < anios; i++) {
      cashFlows.push(renta);
    }

    // Año n: Renta anual + valor final
    cashFlows.push(renta + valorFinal);

    return cashFlows;
  };

  // Calcular VAN
  const calculateNPV = (cashFlows: number[], rate: number): number => {
    return cashFlows.reduce((npv, cashFlow, index) => {
      return npv + cashFlow / Math.pow(1 + rate, index);
    }, 0);
  };

  // Calcular derivada del VAN (para Newton-Raphson)
  const calculateDerivativeNPV = (cashFlows: number[], rate: number): number => {
    return cashFlows.reduce((derivative, cashFlow, index) => {
      if (index === 0) return derivative;
      return derivative - (index * cashFlow) / Math.pow(1 + rate, index + 1);
    }, 0);
  };

  // Calcular TIR usando método Newton-Raphson
  const calculateTIR = (cashFlows: number[]): number => {
    let rate = 0.1; // Estimación inicial del 10%
    const maxIterations = 1000;
    const tolerance = 1e-10;

    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(cashFlows, rate);
      const dnpv = calculateDerivativeNPV(cashFlows, rate);

      if (Math.abs(dnpv) < tolerance) {
        throw new Error('No se puede calcular el TIR (derivada muy pequeña)');
      }

      const newRate = rate - npv / dnpv;

      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }

      rate = newRate;

      // Verificar convergencia
      if (i === maxIterations - 1) {
        throw new Error('No se pudo calcular el TIR (no converge)');
      }
    }

    return rate;
  };

  // Calcular resultados principales
  const inversionNum = parseFloat(inversionInicial) || 0;
  const rentaNum = parseFloat(rentaAnual) || 0;
  const aniosNum = parseInt(numeroAnios) || 1;
  const valorFinalNum = parseFloat(valorFinal) || 0;
  const tipoMercadoNum = (parseFloat(tipoMercado) || 0) / 100;

  let tir = 0;
  let van = 0;
  let cashFlows: number[] = [];
  let error: string | null = null;

  try {
    cashFlows = buildCashFlows(inversionNum, rentaNum, aniosNum, valorFinalNum);
    tir = calculateTIR(cashFlows);
    van = calculateNPV(cashFlows, tipoMercadoNum);
  } catch (e) {
    error = (e as Error).message;
  }

  const diferenciaTIR = (tir * 100 - tipoMercadoNum * 100).toFixed(2);
  const esRentable = parseFloat(diferenciaTIR) > 0;

  // Calcular escenarios
  const calcularEscenarios = (): {
    name: string;
    tir: number;
    van: number;
    diferencia: number;
    estado: string;
  }[] => {
    return SCENARIOS.map((scenario) => {
      const rentaEscenario = rentaNum * scenario.rentaMultiplier;
      const valorEscenario = valorFinalNum * scenario.valorMultiplier;
      const cashFlowsEscenario = buildCashFlows(
        inversionNum,
        rentaEscenario,
        aniosNum,
        valorEscenario
      );

      try {
        const tirEscenario = calculateTIR(cashFlowsEscenario);
        const vanEscenario = calculateNPV(cashFlowsEscenario, tipoMercadoNum);
        const diferencia = tirEscenario * 100 - tipoMercadoNum * 100;

        let estado = '';
        if (diferencia > 0.5) estado = '✅ Excelente';
        else if (diferencia > 0) estado = '✅ Buena';
        else if (diferencia > -0.5) estado = '⚠️ Marginal';
        else estado = '❌ Negativa';

        return {
          name: scenario.name,
          tir: tirEscenario,
          van: vanEscenario,
          diferencia,
          estado,
        };
      } catch {
        return {
          name: scenario.name,
          tir: 0,
          van: 0,
          diferencia: 0,
          estado: '❌ Error',
        };
      }
    });
  };

  const escenarios = calcularEscenarios();

  // Análisis de sensibilidad
  const variaciones = [-30, -20, -10, -5, 0, 5, 10, 20, 30];
  const sensibilidad = variaciones.map((variacion) => {
    const nuevaRenta = rentaNum * (1 + variacion / 100);
    const cashFlowsSens = buildCashFlows(inversionNum, nuevaRenta, aniosNum, valorFinalNum);

    try {
      const tirSens = calculateTIR(cashFlowsSens);
      const diferencia = tirSens * 100 - tipoMercadoNum * 100;

      return {
        variacion,
        nuevaRenta,
        tir: tirSens,
        diferencia,
        viable: diferencia > 0,
      };
    } catch {
      return {
        variacion,
        nuevaRenta,
        tir: 0,
        diferencia: 0,
        viable: false,
      };
    }
  });

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Analytics v2.1 */}
      <AnalyticsTracker applicationName="tir-van" />

      {/* Logo meskeIA */}
      <MeskeiaLogo />

      <div className="container-lg">
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.header}>
            <h1 className="text-2xl text-lg-3xl mb-sm">📊 Calculadora TIR y VAN</h1>
            <p className="text-center">
              Tasa Interna de Retorno y Valor Actual Neto para análisis de inversiones
            </p>
          </header>

          {/* Layout principal */}
          <div className={styles.mainContent}>
            {/* Panel de inputs */}
            <div className={styles.panel}>
              <h2>📝 Datos de la Inversión</h2>

              <div className={styles.formGroup}>
                <label htmlFor="inversionInicial">💰 Inversión Inicial (€)</label>
                <input
                  type="number"
                  id="inversionInicial"
                  min="0"
                  step="1000"
                  value={inversionInicial}
                  onChange={(e) => setInversionInicial(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="rentaAnual">📈 Renta Anual (€)</label>
                <input
                  type="number"
                  id="rentaAnual"
                  min="0"
                  step="1000"
                  value={rentaAnual}
                  onChange={(e) => setRentaAnual(e.target.value)}
                  className={styles.input}
                />
                <span className={styles.hint}>
                  Ingresos netos anuales esperados de la inversión
                </span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="numeroAnios">📅 Número de Años</label>
                <input
                  type="number"
                  id="numeroAnios"
                  min="1"
                  max="50"
                  value={numeroAnios}
                  onChange={(e) => setNumeroAnios(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="valorFinal">🏁 Valor Final (€)</label>
                <input
                  type="number"
                  id="valorFinal"
                  min="0"
                  step="1000"
                  value={valorFinal}
                  onChange={(e) => setValorFinal(e.target.value)}
                  className={styles.input}
                />
                <span className={styles.hint}>
                  Valor residual o de venta al final del período
                </span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tipoMercado">📊 Tasa de Descuento (%)</label>
                <input
                  type="number"
                  id="tipoMercado"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tipoMercado}
                  onChange={(e) => setTipoMercado(e.target.value)}
                  className={styles.input}
                />
                <span className={styles.hint}>
                  Rentabilidad mínima exigida o coste de oportunidad
                </span>
              </div>

              {/* Flujos de caja */}
              <div className={styles.cashFlowsBox}>
                <h3>💵 Flujos de Caja Proyectados</h3>
                <div className={styles.cashFlowsList}>
                  {cashFlows.map((flow, index) => (
                    <div key={index} className={styles.cashFlowItem}>
                      <span className={styles.cashFlowYear}>Año {index}:</span>
                      <span
                        className={`${styles.cashFlowValue} ${
                          flow < 0 ? styles.negative : styles.positive
                        }`}
                      >
                        {formatearNumero(flow, 0)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de resultados */}
            <div className={styles.panel}>
              <h2>🧮 Resultados del Análisis</h2>

              {error ? (
                <div className={styles.errorBox}>
                  <p>⚠️ {error}</p>
                  <p className={styles.errorHint}>
                    Verifica que los datos sean coherentes y que la inversión genere
                    flujos positivos suficientes.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.resultsMain}>
                    <div className={styles.resultCard}>
                      <div className={styles.resultLabel}>TIR</div>
                      <div className={styles.resultValue}>
                        {formatearNumero(tir * 100, 2)}%
                      </div>
                      <div className={styles.resultSubtext}>
                        Tasa Interna de Retorno
                      </div>
                    </div>

                    <div className={styles.resultCard}>
                      <div className={styles.resultLabel}>VAN</div>
                      <div className={styles.resultValue}>
                        {formatearNumero(van, 0)} €
                      </div>
                      <div className={styles.resultSubtext}>Valor Actual Neto</div>
                    </div>
                  </div>

                  <div className={styles.comparison}>
                    <div className={styles.comparisonRow}>
                      <span>TIR calculada:</span>
                      <span className={styles.bold}>
                        {formatearNumero(tir * 100, 2)}%
                      </span>
                    </div>
                    <div className={styles.comparisonRow}>
                      <span>Tasa de descuento:</span>
                      <span className={styles.bold}>
                        {formatearNumero(tipoMercadoNum * 100, 2)}%
                      </span>
                    </div>
                    <div className={styles.comparisonRow}>
                      <span>Diferencia:</span>
                      <span
                        className={`${styles.bold} ${
                          esRentable ? styles.positive : styles.negative
                        }`}
                      >
                        {diferenciaTIR}%
                      </span>
                    </div>
                  </div>

                  <div
                    className={`${styles.verdict} ${
                      esRentable ? styles.verdictPositive : styles.verdictNegative
                    }`}
                  >
                    <div className={styles.verdictIcon}>
                      {esRentable ? '✅' : '❌'}
                    </div>
                    <div className={styles.verdictText}>
                      {esRentable
                        ? 'Inversión RENTABLE'
                        : 'Inversión NO RENTABLE'}
                    </div>
                    <div className={styles.verdictExplanation}>
                      {esRentable
                        ? `La TIR (${formatearNumero(
                            tir * 100,
                            2
                          )}%) supera la tasa de descuento (${formatearNumero(
                            tipoMercadoNum * 100,
                            2
                          )}%). El VAN es positivo.`
                        : `La TIR (${formatearNumero(
                            tir * 100,
                            2
                          )}%) es inferior a la tasa de descuento (${formatearNumero(
                            tipoMercadoNum * 100,
                            2
                          )}%). El VAN es negativo.`}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Análisis de Escenarios */}
          {!error && (
            <div className={styles.scenariosSection}>
              <h2>🎭 Análisis de Escenarios</h2>
              <div className={styles.scenariosGrid}>
                {escenarios.map((escenario, index) => (
                  <div
                    key={index}
                    className={`${styles.scenarioCard} ${
                      styles[SCENARIOS[index].class]
                    }`}
                  >
                    <h3>{escenario.name}</h3>
                    <div className={styles.scenarioData}>
                      <div className={styles.scenarioRow}>
                        <span>TIR:</span>
                        <span className={styles.bold}>
                          {formatearNumero(escenario.tir * 100, 2)}%
                        </span>
                      </div>
                      <div className={styles.scenarioRow}>
                        <span>VAN:</span>
                        <span className={styles.bold}>
                          {formatearNumero(escenario.van, 0)} €
                        </span>
                      </div>
                      <div className={styles.scenarioRow}>
                        <span>Diferencia:</span>
                        <span
                          className={`${styles.bold} ${
                            escenario.diferencia > 0
                              ? styles.positive
                              : styles.negative
                          }`}
                        >
                          {formatearNumero(escenario.diferencia, 2)}%
                        </span>
                      </div>
                    </div>
                    <div className={styles.scenarioStatus}>{escenario.estado}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análisis de Sensibilidad */}
          {!error && (
            <div className={styles.sensitivitySection}>
              <h2>📉 Análisis de Sensibilidad - Variación de Renta Anual</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Variación</th>
                      <th>Nueva Renta</th>
                      <th>TIR</th>
                      <th>Diferencia vs Tasa</th>
                      <th>Viabilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensibilidad.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          item.variacion === 0
                            ? styles.centerRow
                            : item.viable
                            ? styles.sensitivityPositive
                            : styles.sensitivityNegative
                        }
                      >
                        <td>
                          {item.variacion > 0 ? '+' : ''}
                          {item.variacion}%
                        </td>
                        <td>{formatearNumero(item.nuevaRenta, 0)} €</td>
                        <td>{formatearNumero(item.tir * 100, 2)}%</td>
                        <td
                          className={
                            item.diferencia > 0 ? styles.positive : styles.negative
                          }
                        >
                          {formatearNumero(item.diferencia, 2)}%
                        </td>
                        <td>{item.viable ? '✅ Sí' : '❌ No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre TIR, VAN y Análisis de Inversiones?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre cómo interpretar la TIR y el VAN, cuándo usar cada métrica, y cómo
            tomar decisiones de inversión informadas
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent
              ? '⬆️ Ocultar Guía Educativa'
              : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido educativo colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            <div className={styles.eduSection}>
              <h2>¿Qué es la TIR?</h2>
              <p>
                La <strong>Tasa Interna de Retorno (TIR)</strong> es la rentabilidad
                que ofrece una inversión. Representa el porcentaje de beneficio o
                pérdida que tendrá una inversión para las cantidades que no se han
                retirado del proyecto.
              </p>
              <p>
                Matemáticamente, es la tasa de descuento que hace que el VAN (Valor
                Actual Neto) de todos los flujos de caja sea igual a cero. Se calcula
                mediante el método iterativo de Newton-Raphson.
              </p>
            </div>

            <div className={styles.eduSection}>
              <h2>¿Qué es el VAN?</h2>
              <p>
                El <strong>Valor Actual Neto (VAN)</strong> es la diferencia entre el
                valor presente de los cobros y los pagos generados por una inversión.
              </p>
              <p>
                Un VAN positivo indica que la inversión es rentable, mientras que un
                VAN negativo sugiere que la inversión no es viable económicamente con
                la tasa de descuento utilizada.
              </p>
            </div>

            <div className={styles.eduSection}>
              <h2>¿Cómo interpretar los resultados?</h2>
              <ul>
                <li>
                  <strong>TIR {'>'} Tasa de Descuento</strong>: La inversión es
                  rentable. Cuanto mayor sea la diferencia, mejor.
                </li>
                <li>
                  <strong>TIR = Tasa de Descuento</strong>: La inversión está en el
                  punto de equilibrio.
                </li>
                <li>
                  <strong>TIR {'<'} Tasa de Descuento</strong>: La inversión no es
                  rentable. Es mejor no realizarla.
                </li>
                <li>
                  <strong>VAN {'>'} 0</strong>: La inversión genera valor.
                </li>
                <li>
                  <strong>VAN {'<'} 0</strong>: La inversión destruye valor.
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>Análisis de Escenarios</h2>
              <p>
                El análisis de escenarios te permite evaluar cómo cambiaría la
                rentabilidad de tu inversión en diferentes condiciones de mercado:
              </p>
              <ul>
                <li>
                  <strong>Escenario Optimista</strong>: +20% en rentas, +30% en valor
                  final
                </li>
                <li>
                  <strong>Escenario Realista</strong>: Valores base introducidos
                </li>
                <li>
                  <strong>Escenario Pesimista</strong>: -20% en rentas, -30% en valor
                  final
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>Análisis de Sensibilidad</h2>
              <p>
                El análisis de sensibilidad muestra cómo varía la TIR al modificar la
                renta anual esperada. Esto te ayuda a identificar:
              </p>
              <ul>
                <li>
                  <strong>Punto de equilibrio</strong>: La renta mínima necesaria para
                  que la inversión sea viable
                </li>
                <li>
                  <strong>Margen de seguridad</strong>: Cuánto pueden reducirse los
                  ingresos antes de que la inversión deje de ser rentable
                </li>
                <li>
                  <strong>Potencial de mejora</strong>: El impacto de aumentar los
                  ingresos proyectados
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer meskeIA Unificado */}
      <Footer appName="Calculadora TIR y VAN - meskeIA" />
    </>
  );
}
