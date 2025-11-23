'use client';

import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { metadata, jsonLd } from './metadata';
import styles from './InteresCompuesto.module.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Tipos para los datos
interface YearlyData {
  year: number;
  startBalance: number;
  contributions: number;
  interest: number;
  endBalance: number;
  totalContributed: number;
  growthRate: number;
}

interface CalculationResults {
  finalAmount: number;
  totalContributed: number;
  totalInterest: number;
  roi: number;
  yearlyData: YearlyData[];
  parameters: {
    initialCapital: number;
    monthlyContribution: number;
    annualRate: number;
    investmentPeriod: number;
    compoundFrequency: number;
  };
}

export default function InteresCompuestoPage() {
  // Estados del formulario
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualRate, setAnnualRate] = useState<number>(7);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(20);
  const [compoundFrequency, setCompoundFrequency] = useState<number>(12);

  // Estados de resultados
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showChart, setShowChart] = useState<boolean>(false);

  // Estado para contenido educativo colapsable
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  // Referencia para auto-scroll
  const resultsRef = useRef<HTMLDivElement>(null);

  // Función para realizar los cálculos matemáticos del interés compuesto
  const performCompoundCalculation = (
    principal: number,
    monthlyPayment: number,
    annualRatePerc: number,
    years: number,
    compoundingFrequency: number
  ): CalculationResults => {
    const monthlyRate = annualRatePerc / 100 / 12;

    let yearlyData: YearlyData[] = [];
    let currentBalance = principal;
    let totalContributed = principal;

    // Cálculo año por año
    for (let year = 1; year <= years; year++) {
      let yearStartBalance = currentBalance;
      let yearContributions = 0;
      let yearInterest = 0;

      // Cálculo mes por mes para este año
      for (let month = 1; month <= 12; month++) {
        // Agregar aportación mensual
        currentBalance += monthlyPayment;
        yearContributions += monthlyPayment;
        totalContributed += monthlyPayment;

        // Calcular interés compuesto según frecuencia
        if (compoundingFrequency === 12) {
          // Capitalización mensual
          const monthlyInterest = currentBalance * monthlyRate;
          currentBalance += monthlyInterest;
          yearInterest += monthlyInterest;
        } else {
          // Otras frecuencias de capitalización
          const periodsPerYear = compoundingFrequency;
          const ratePerPeriod = annualRatePerc / 100 / periodsPerYear;
          const periodsThisMonth = periodsPerYear / 12;

          for (let period = 0; period < periodsThisMonth; period++) {
            currentBalance *= 1 + ratePerPeriod;
          }
          yearInterest = currentBalance - yearStartBalance - yearContributions;
        }
      }

      const growthRate =
        year === 1
          ? 0
          : ((currentBalance - yearlyData[year - 2].endBalance) /
              yearlyData[year - 2].endBalance) *
            100;

      yearlyData.push({
        year: year,
        startBalance: yearStartBalance,
        contributions: yearContributions,
        interest: yearInterest,
        endBalance: currentBalance,
        totalContributed: totalContributed,
        growthRate: growthRate,
      });
    }

    const finalAmount = currentBalance;
    const totalInterest = finalAmount - totalContributed;
    const roi = ((finalAmount - totalContributed) / totalContributed) * 100;

    return {
      finalAmount: finalAmount,
      totalContributed: totalContributed,
      totalInterest: totalInterest,
      roi: roi,
      yearlyData: yearlyData,
      parameters: {
        initialCapital: principal,
        monthlyContribution: monthlyPayment,
        annualRate: annualRatePerc,
        investmentPeriod: years,
        compoundFrequency: compoundingFrequency,
      },
    };
  };

  // Calcular interés compuesto
  const calculateCompoundInterest = () => {
    // Validar entradas
    if (
      initialCapital < 0 ||
      monthlyContribution < 0 ||
      annualRate < 0 ||
      investmentPeriod <= 0
    ) {
      alert('Por favor, ingresa valores válidos (no negativos).');
      return;
    }

    const calculationResults = performCompoundCalculation(
      initialCapital,
      monthlyContribution,
      annualRate,
      investmentPeriod,
      compoundFrequency
    );

    setResults(calculationResults);
    setShowChart(true);

    // Auto-scroll a resultados después de un pequeño delay
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  // Aplicar preset de rentabilidad
  const applyPreset = (rate: number) => {
    setAnnualRate(rate);
  };

  // Resetear valores a defaults
  const resetForm = () => {
    setInitialCapital(10000);
    setMonthlyContribution(500);
    setAnnualRate(7);
    setInvestmentPeriod(20);
    setCompoundFrequency(12);
    setShowChart(false);
    setResults(null);
  };

  // Generar PDF con resultados
  const generatePDF = () => {
    if (!results) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Interés Compuesto', pageWidth / 2, 20, {
      align: 'center',
    });

    // Subtítulo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Generado por meskeIA', pageWidth / 2, 28, { align: 'center' });

    // Parámetros de entrada
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Parámetros de Inversión', 15, 45);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    let y = 55;
    doc.text(
      `Capital Inicial: ${results.parameters.initialCapital.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Aportación Mensual: ${results.parameters.monthlyContribution.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Rentabilidad Anual: ${results.parameters.annualRate}%`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Período de Inversión: ${results.parameters.investmentPeriod} años`,
      20,
      y
    );
    y += 8;
    const freqNames: { [key: number]: string } = {
      1: 'Anual',
      4: 'Trimestral',
      12: 'Mensual',
      365: 'Diaria',
    };
    doc.text(
      `Frecuencia de Capitalización: ${freqNames[results.parameters.compoundFrequency] || results.parameters.compoundFrequency + ' veces/año'}`,
      20,
      y
    );

    // Resumen de resultados
    y += 18;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados Finales', 15, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Valor Final: ${results.finalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Total Aportado: ${results.totalContributed.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Intereses Ganados: ${results.totalInterest.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
      20,
      y
    );
    y += 8;
    doc.text(`ROI Total: ${results.roi.toFixed(2)}%`, 20, y);

    // Tabla de evolución año por año
    y += 18;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Evolución Año por Año', 15, y);

    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Año', 20, y);
    doc.text('Aport.', 45, y);
    doc.text('Interés', 75, y);
    doc.text('Saldo Final', 110, y);
    doc.text('Crecim.', 155, y);

    y += 6;
    doc.setFont('helvetica', 'normal');

    results.yearlyData.forEach((data) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(`${data.year}`, 20, y);
      doc.text(
        `${data.contributions.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`,
        45,
        y
      );
      doc.text(
        `${data.interest.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`,
        75,
        y
      );
      doc.text(
        `${data.endBalance.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`,
        110,
        y
      );
      doc.text(`${data.growthRate.toFixed(1)}%`, 155, y);

      y += 6;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Página ${i} de ${pageCount} | meskeIA - ${new Date().toLocaleDateString('es-ES')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save('reporte-interes-compuesto-meskeia.pdf');
  };

  // Calcular automáticamente al cargar la página o cuando cambien los valores
  useEffect(() => {
    calculateCompoundInterest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Formatear moneda
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    });
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Datos para el gráfico
  const chartData = results
    ? {
        labels: results.yearlyData.map((data) => `Año ${data.year}`),
        datasets: [
          {
            label: 'Valor Total',
            data: results.yearlyData.map((data) => data.endBalance),
            borderColor: '#2E86AB',
            backgroundColor: 'rgba(46, 134, 171, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Total Aportado',
            data: results.yearlyData.map((data) => data.totalContributed),
            borderColor: '#48A9A6',
            backgroundColor: 'rgba(72, 169, 166, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'Intereses Acumulados',
            data: results.yearlyData.map(
              (data) => data.endBalance - data.totalContributed
            ),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            weight: 600,
          },
          color: '#1A1A1A',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1A1A1A',
        bodyColor: '#666666',
        borderColor: '#E5E5E5',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            });
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            });
          },
          color: '#666666',
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          color: '#666666',
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Generar insights dinámicos
  const generateInsights = (): string[] => {
    if (!results) return [];

    const insights: string[] = [];

    // Insight 1: Poder del tiempo
    if (investmentPeriod >= 20) {
      insights.push(
        `Con ${investmentPeriod} años de inversión, el efecto del interés compuesto multiplica significativamente tu capital inicial.`
      );
    }

    // Insight 2: Relación intereses vs aportaciones
    const interestRatio =
      (results.totalInterest / results.totalContributed) * 100;
    if (interestRatio > 100) {
      insights.push(
        `Los intereses generados (${formatCurrency(results.totalInterest)}) superan tus aportaciones totales. ¡El dinero trabaja por ti!`
      );
    } else if (interestRatio > 50) {
      insights.push(
        `Los intereses representan el ${interestRatio.toFixed(0)}% de tus aportaciones. El tiempo potencia tu inversión.`
      );
    }

    // Insight 3: Crecimiento en los últimos años
    if (results.yearlyData.length >= 5) {
      const last5Years = results.yearlyData.slice(-5);
      const totalInterestLast5 = last5Years.reduce(
        (sum, year) => sum + year.interest,
        0
      );
      const percentOfTotal = (totalInterestLast5 / results.totalInterest) * 100;
      insights.push(
        `Los últimos 5 años generan el ${percentOfTotal.toFixed(0)}% de todos los intereses. El efecto compuesto acelera con el tiempo.`
      );
    }

    // Insight 4: Rentabilidad
    if (annualRate >= 10) {
      insights.push(
        `Una rentabilidad del ${annualRate}% es agresiva. Asegúrate de que se alinea con tu tolerancia al riesgo.`
      );
    } else if (annualRate <= 3) {
      insights.push(
        `Con ${annualRate}% de rentabilidad conservadora, priorizas la seguridad sobre los rendimientos elevados.`
      );
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <>
      <MeskeiaLogo />
      <AnalyticsTracker appName="interes-compuesto" />

      <div className={styles.hero}>
        <h1>Calculadora de Interés Compuesto</h1>
        <p className={styles.subtitle}>
          Descubre el poder del &quot;8º Milagro del Mundo&quot; - Visualiza
          cómo crecen tus inversiones con el efecto del interés compuesto
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.mainLayout}>
          {/* Panel de entrada */}
          <div className={styles.inputPanel}>
            <h3 className={styles.panelTitle}>📊 Parámetros de Inversión</h3>

            <div className={styles.formGroup}>
              <label htmlFor="initialCapital">Capital Inicial (€)</label>
              <input
                type="number"
                id="initialCapital"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className={styles.input}
                min="0"
                step="1000"
              />
              <small>¿Con cuánto dinero empiezas?</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="monthlyContribution">
                Aportación Mensual (€)
              </label>
              <input
                type="number"
                id="monthlyContribution"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className={styles.input}
                min="0"
                step="50"
              />
              <small>¿Cuánto aportarás cada mes?</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="annualRate">Rentabilidad Anual (%)</label>
              <input
                type="number"
                id="annualRate"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className={styles.input}
                min="0"
                max="30"
                step="0.5"
              />
              <small>Rentabilidad esperada al año</small>

              <div className={styles.quickPresets}>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => applyPreset(3)}
                >
                  Conservador (3%)
                </button>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => applyPreset(7)}
                >
                  Moderado (7%)
                </button>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => applyPreset(10)}
                >
                  Agresivo (10%)
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="investmentPeriod">
                Período de Inversión (años)
              </label>
              <input
                type="number"
                id="investmentPeriod"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                className={styles.input}
                min="1"
                max="50"
              />
              <small>¿Durante cuántos años invertirás?</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="compoundFrequency">
                Frecuencia de Capitalización
              </label>
              <select
                id="compoundFrequency"
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(Number(e.target.value))}
                className={styles.input}
              >
                <option value="1">Anual (1 vez/año)</option>
                <option value="4">Trimestral (4 veces/año)</option>
                <option value="12">Mensual (12 veces/año)</option>
                <option value="365">Diaria (365 veces/año)</option>
              </select>
              <small>Frecuencia con la que se reinvierten los intereses</small>
            </div>

            <div className={styles.controlButtons}>
              <button
                type="button"
                onClick={calculateCompoundInterest}
                className={styles.btnPrimary}
              >
                Calcular
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={styles.btnSecondary}
              >
                Resetear
              </button>
            </div>
          </div>

          {/* Panel de resultados */}
          <div className={styles.resultsPanel} ref={resultsRef}>
            <h3 className={styles.panelTitle}>💰 Resultados Proyectados</h3>

            {results && (
              <>
                <div className={styles.resultsSummary}>
                  <div className={`${styles.resultCard} ${styles.highlight}`}>
                    <h4>Valor Final</h4>
                    <p className={styles.resultValue}>
                      {formatCurrency(results.finalAmount)}
                    </p>
                  </div>
                  <div className={styles.resultCard}>
                    <h4>Total Aportado</h4>
                    <p className={styles.resultValue}>
                      {formatCurrency(results.totalContributed)}
                    </p>
                  </div>
                  <div className={styles.resultCard}>
                    <h4>Intereses Ganados</h4>
                    <p className={styles.resultValue}>
                      {formatCurrency(results.totalInterest)}
                    </p>
                  </div>
                  <div className={styles.resultCard}>
                    <h4>ROI Total</h4>
                    <p className={styles.resultValue}>
                      {formatPercentage(results.roi)}
                    </p>
                  </div>
                </div>

                {insights.length > 0 && (
                  <div className={styles.insightsSection}>
                    <h4>💡 Insights Inteligentes</h4>
                    <div className={styles.insightsList}>
                      {insights.map((insight, index) => (
                        <div key={index} className={styles.insightCard}>
                          <p>{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Gráfico de evolución */}
        {showChart && chartData && (
          <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
              📈 Evolución de tu Inversión
            </h3>
            <div className={styles.chartWrapper}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Tabla detallada año por año */}
        {results && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h3>Evolución Detallada Año por Año</h3>
            </div>
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Aportaciones</th>
                    <th>Interés Generado</th>
                    <th>Saldo Final</th>
                    <th>Crecimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyData.map((data) => (
                    <tr key={data.year}>
                      <td>
                        <strong>Año {data.year}</strong>
                      </td>
                      <td>{formatCurrency(data.contributions)}</td>
                      <td>{formatCurrency(data.interest)}</td>
                      <td>
                        <strong>{formatCurrency(data.endBalance)}</strong>
                      </td>
                      <td
                        style={{
                          color: data.growthRate > 0 ? '#28a745' : '#f56565',
                        }}
                      >
                        {data.growthRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        {results && (
          <div className={styles.actionButtons}>
            <button
              type="button"
              onClick={generatePDF}
              className={styles.btnPrimary}
            >
              📄 Descargar PDF
            </button>
          </div>
        )}

        {/* Disclaimer legal */}
        <div className={styles.legalDisclaimer}>
          <h4>⚠️ Aviso Legal</h4>
          <p>
            Esta calculadora es una herramienta educativa. Las proyecciones son
            estimativas y no garantizan resultados futuros. Los rendimientos
            pasados no aseguran rendimientos futuros. Consulta con un asesor
            financiero profesional antes de tomar decisiones de inversión.
          </p>
        </div>

        {/* Toggle para contenido educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Interés Compuesto?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre estrategias, conceptos clave, ejemplos reales y respuestas a las preguntas más frecuentes
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido educativo colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            {/* Sección 1: El Poder del Interés Compuesto */}
            <section className={styles.compoundGuide}>
              <h2>El Poder del Interés Compuesto: El 8º Milagro del Mundo</h2>
              <p>
                Albert Einstein llamó al interés compuesto &quot;el octavo milagro del mundo&quot; porque quien lo entiende lo gana, y quien no lo entiende lo paga. Nuestra calculadora te permite experimentar con diferentes escenarios y visualizar cómo el tiempo convierte pequeñas inversiones en fortunas significativas mediante el poder del crecimiento exponencial.
              </p>

              <div className={styles.featuresGrid}>
                <div className={styles.featureItem}>
                  <h4>🚀 Crecimiento Exponencial</h4>
                  <p><strong>Efecto multiplicador:</strong> El interés compuesto genera rendimientos sobre los rendimientos, creando un crecimiento acelerado.</p>
                  <p>A diferencia del interés simple que crece linealmente, el interés compuesto crece exponencialmente. Cada año, los intereses del año anterior también generan nuevos intereses, creando una bola de nieve financiera que se acelera con el tiempo.</p>
                </div>

                <div className={styles.featureItem}>
                  <h4>📊 Múltiples Frecuencias de Capitalización</h4>
                  <p><strong>Maximiza tu crecimiento:</strong> Elige entre capitalización anual, trimestral, mensual o diaria.</p>
                  <p>Mayor frecuencia de capitalización significa que tus intereses se reinvierten más frecuentemente, generando ligeramente más rendimientos. La capitalización diaria maximiza el efecto compuesto al reinvertir intereses cada día.</p>
                </div>

                <div className={styles.featureItem}>
                  <h4>📈 Visualización Interactiva</h4>
                  <p><strong>Gráficos evolutivos:</strong> Observa visualmente cómo tu dinero crece año tras año.</p>
                  <p>Los gráficos muestran tres líneas: balance total, total aportado e intereses generados. Puedes ver claramente cómo los intereses eventualmente superan tus aportaciones, demostrando el verdadero poder del tiempo en las inversiones.</p>
                </div>

                <div className={styles.featureItem}>
                  <h4>🎯 Presets de Rentabilidad</h4>
                  <p><strong>Escenarios realistas:</strong> Conservador (3%), Moderado (7%) y Agresivo (10%) basados en promedios históricos.</p>
                  <p>Los presets te ayudan a explorar diferentes estrategias de inversión. El conservador refleja bonos gubernamentales, el moderado índices diversificados, y el agresivo acciones de crecimiento.</p>
                </div>

                <div className={styles.featureItem}>
                  <h4>🧠 Insights Inteligentes</h4>
                  <p><strong>Análisis automático:</strong> La calculadora identifica patrones y te proporciona insights personalizados.</p>
                  <p>Recibe automáticamente análisis sobre el poder de tu interés compuesto, la importancia del tiempo, el efecto de la capitalización frecuente y el impacto de tu ROI en el crecimiento total.</p>
                </div>

                <div className={styles.featureItem}>
                  <h4>📄 Reportes Detallados</h4>
                  <p><strong>Documentación completa:</strong> Genera reportes PDF con todos los cálculos y proyecciones.</p>
                  <p>Los reportes incluyen parámetros de inversión, resultados resumidos y tabla de evolución anual. Ideal para planificación financiera personal o presentar a asesores de inversión.</p>
                </div>
              </div>
            </section>

            {/* Sección 2: Estrategias de Inversión */}
            <section className={styles.investmentStrategies}>
              <h3>Estrategias de Inversión con Interés Compuesto</h3>
              <div className={styles.strategiesGrid}>
                <div className={styles.strategyCard}>
                  <h4>🏛️ Estrategia Conservadora</h4>
                  <p>Rentabilidad del 3% anual con muy bajo riesgo. Ideal para inversores que priorizan la seguridad del capital sobre el crecimiento. Utiliza bonos del estado, depósitos a plazo y fondos de renta fija.</p>
                </div>

                <div className={styles.strategyCard}>
                  <h4>⚖️ Estrategia Moderada</h4>
                  <p>Rentabilidad del 7% anual con riesgo moderado. Combina renta fija y variable para equilibrar seguridad y crecimiento. Fondos indexados diversificados y ETFs balanceados.</p>
                </div>

                <div className={styles.strategyCard}>
                  <h4>📈 Estrategia Agresiva</h4>
                  <p>Rentabilidad del 10% anual con mayor riesgo. Para inversores jóvenes con horizonte temporal largo. Mayor exposición a acciones de crecimiento y mercados emergentes.</p>
                </div>

                <div className={styles.strategyCard}>
                  <h4>💰 Aportaciones Regulares</h4>
                  <p>La clave del éxito es la consistencia. Pequeñas aportaciones regulares aprovechan el promediado del coste y maximizan el tiempo de crecimiento compuesto.</p>
                </div>
              </div>
            </section>

            {/* Sección 3: Conceptos Clave */}
            <section className={styles.compoundConcepts}>
              <h3>Conceptos Clave del Interés Compuesto</h3>
              <div className={styles.conceptsGrid}>
                <div className={styles.conceptItem}>
                  <h4>Efecto Bola de Nieve</h4>
                  <p>Como una bola de nieve rodando cuesta abajo, el interés compuesto empieza lento pero se acelera exponencialmente. Los primeros años pueden parecer modestos, pero las últimas décadas muestran un crecimiento espectacular.</p>
                </div>

                <div className={styles.conceptItem}>
                  <h4>Regla del 72</h4>
                  <p>Divide 72 entre la rentabilidad anual para saber cuántos años tardarás en duplicar tu dinero. Con 7% anual: 72÷7 = 10.3 años para duplicar tu inversión.</p>
                </div>

                <div className={styles.conceptItem}>
                  <h4>Valor del Tiempo</h4>
                  <p>Empezar temprano es más poderoso que aportar más dinero tarde. 10 años adicionales de crecimiento compuesto pueden valer más que duplicar tus aportaciones.</p>
                </div>

                <div className={styles.conceptItem}>
                  <h4>Capitalización</h4>
                  <p>La frecuencia de capitalización (anual, mensual, diaria) determina cuántas veces al año se reinvierten los intereses. Mayor frecuencia = ligeramente más rendimientos.</p>
                </div>
              </div>
            </section>

            {/* Sección 4: Ejemplos Reales */}
            <section className={styles.compoundExamples}>
              <h3>Ejemplos Reales del Poder del Interés Compuesto</h3>
              <div className={styles.examplesGrid}>
                <div className={styles.exampleCard}>
                  <h4>💡 El Joven Inversor</h4>
                  <p><strong>Escenario:</strong> María, 25 años, invierte €200 mensuales al 7% anual hasta los 65 años.</p>
                  <p><strong>Resultado:</strong> Aporta €96,000 pero acumula €525,000. Los intereses generan €429,000 - ¡4.5 veces sus aportaciones!</p>
                </div>

                <div className={styles.exampleCard}>
                  <h4>⏰ El Efecto de Empezar Tarde</h4>
                  <p><strong>Escenario:</strong> Carlos, 35 años, invierte €400 mensuales al 7% anual hasta los 65 años.</p>
                  <p><strong>Resultado:</strong> Aporta €144,000 pero acumula €490,000. Aporta más que María pero obtiene menos debido a 10 años menos.</p>
                </div>

                <div className={styles.exampleCard}>
                  <h4>🚀 La Ventaja de la Rentabilidad</h4>
                  <p><strong>Escenario:</strong> Ana invierte €300 mensuales durante 30 años. Al 5% obtiene €249,000, pero al 10% obtiene €678,000.</p>
                  <p><strong>Lección:</strong> 5% adicional de rentabilidad puede triplicar tu resultado final gracias al interés compuesto.</p>
                </div>

                <div className={styles.exampleCard}>
                  <h4>🏆 El Millonario del Interés Compuesto</h4>
                  <p><strong>Escenario:</strong> Pedro invierte €500 mensuales al 8% anual durante 35 años.</p>
                  <p><strong>Resultado:</strong> Aporta €210,000 pero acumula €1,037,000. ¡Se convierte en millonario principalmente gracias a los intereses compuestos!</p>
                </div>
              </div>
            </section>

            {/* Sección 5: FAQ */}
            <section className={styles.faqSection}>
              <h3>❓ Preguntas Frecuentes</h3>
              <div className={styles.faqGrid}>
                <div className={styles.faqItem}>
                  <h4>¿Por qué Einstein llamó al interés compuesto el 8º milagro del mundo?</h4>
                  <p>Einstein reconoció que el interés compuesto es la fuerza más poderosa en finanzas. Transforma pequeñas cantidades en grandes fortunas a través del tiempo, creando riqueza de manera casi &quot;milagrosa&quot; para quienes lo entienden y utilizan.</p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Cuál es la diferencia entre interés simple e interés compuesto?</h4>
                  <p>El interés simple se calcula solo sobre el capital inicial. El interés compuesto se calcula sobre el capital inicial MÁS los intereses acumulados, generando un crecimiento exponencial vs. linear.</p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Qué es más importante: cantidad invertida o tiempo?</h4>
                  <p>El tiempo es generalmente más poderoso debido al efecto exponencial. Empezar temprano con menos dinero suele generar más riqueza que empezar tarde con más dinero, gracias al interés compuesto.</p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Cómo afecta la frecuencia de capitalización a los resultados?</h4>
                  <p>Mayor frecuencia de capitalización (diaria vs anual) genera ligeramente más rendimientos porque los intereses se reinvierten más frecuentemente. Sin embargo, la diferencia es pequeña comparada con la rentabilidad base y el tiempo.</p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Son realistas las proyecciones de la calculadora?</h4>
                  <p>Las proyecciones asumen rentabilidades constantes y no consideran inflación, impuestos o fluctuaciones del mercado. Son útiles para planificación, pero los resultados reales pueden variar significativamente.</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <Footer />

      {/* JSON-LD para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
