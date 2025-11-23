'use client';

import { useState, useEffect, useRef } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { Button } from '@/components/ui';
import styles from './CalculadoraInversiones.module.css';
import { jsonLd } from './metadata';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import jsPDF from 'jspdf';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Datos de activos (rentabilidad y volatilidad históricas)
const assetData = {
  equity: {
    name: 'Renta Variable (Acciones)',
    return: 8.5,
    volatility: 18.0,
    description: 'Acciones globales diversificadas',
  },
  bonds: {
    name: 'Renta Fija (Bonos)',
    return: 3.5,
    volatility: 6.0,
    description: 'Bonos corporativos y gubernamentales',
  },
  reits: {
    name: 'REITs (Inmobiliario)',
    return: 7.0,
    volatility: 15.0,
    description: 'Fondos de inversión inmobiliaria',
  },
  commodities: {
    name: 'Commodities (Materias Primas)',
    return: 5.0,
    volatility: 20.0,
    description: 'Oro, petróleo y otras materias primas',
  },
};

// Perfiles predefinidos
const profiles = {
  conservative: {
    name: 'Conservador',
    equity: 30,
    bonds: 50,
    reits: 15,
    commodities: 5,
  },
  moderate: {
    name: 'Moderado',
    equity: 55,
    bonds: 30,
    reits: 10,
    commodities: 5,
  },
  aggressive: {
    name: 'Agresivo',
    equity: 75,
    bonds: 10,
    reits: 10,
    commodities: 5,
  },
};

interface Allocation {
  equity: number;
  bonds: number;
  reits: number;
  commodities: number;
}

interface Metrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  profile: string;
}

interface Parameters {
  initial: number;
  monthly: number;
  years: number;
}

interface Projection {
  years: number;
  finalAmount: number;
  totalContributed: number;
  totalGain: number;
  roi: number;
}

export default function CalculadoraInversiones() {
  const [allocation, setAllocation] = useState<Allocation>({
    equity: 55,
    bonds: 30,
    reits: 10,
    commodities: 5,
  });

  const [parameters, setParameters] = useState<Parameters>({
    initial: 10000,
    monthly: 500,
    years: 20,
  });

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [insights, setInsights] = useState<
    Array<{ icon: string; title: string; text: string }>
  >([]);
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  const chartRef = useRef<ChartJS<'doughnut'> | null>(null);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateMetrics = () => {
    const total = allocation.equity + allocation.bonds + allocation.reits + allocation.commodities;

    if (total !== 100) return null;

    // Calcular rentabilidad esperada (media ponderada)
    const expectedReturn =
      (allocation.equity / 100) * assetData.equity.return +
      (allocation.bonds / 100) * assetData.bonds.return +
      (allocation.reits / 100) * assetData.reits.return +
      (allocation.commodities / 100) * assetData.commodities.return;

    // Calcular volatilidad (simplificado - sin correlaciones)
    const portfolioVariance =
      Math.pow(allocation.equity / 100, 2) * Math.pow(assetData.equity.volatility, 2) +
      Math.pow(allocation.bonds / 100, 2) * Math.pow(assetData.bonds.volatility, 2) +
      Math.pow(allocation.reits / 100, 2) * Math.pow(assetData.reits.volatility, 2) +
      Math.pow(allocation.commodities / 100, 2) *
        Math.pow(assetData.commodities.volatility, 2);

    const portfolioVolatility = Math.sqrt(portfolioVariance);

    // Ratio Sharpe (asumiendo tipo libre de riesgo del 2%)
    const riskFreeRate = 2.0;
    const sharpeRatio = (expectedReturn - riskFreeRate) / portfolioVolatility;

    // Detectar perfil
    let profile = 'Conservador';
    if (allocation.equity > 70) profile = 'Agresivo';
    else if (allocation.equity > 35) profile = 'Moderado';

    return {
      expectedReturn,
      volatility: portfolioVolatility,
      sharpeRatio,
      profile,
    };
  };

  const generateInsights = (metricsData: Metrics) => {
    const newInsights: Array<{ icon: string; title: string; text: string }> = [];

    // Insight sobre rentabilidad
    if (metricsData.expectedReturn > 7.5) {
      newInsights.push({
        icon: '📈',
        title: 'Excelente Potencial de Crecimiento',
        text: `Tu cartera tiene una rentabilidad esperada del ${metricsData.expectedReturn.toFixed(1)}%, superior al promedio del mercado. Esto sugiere un buen potencial de crecimiento a largo plazo.`,
      });
    } else if (metricsData.expectedReturn < 5) {
      newInsights.push({
        icon: '🛡️',
        title: 'Enfoque Conservador',
        text: `Tu cartera prioriza la estabilidad con una rentabilidad esperada del ${metricsData.expectedReturn.toFixed(1)}%. Ideal para preservar capital con crecimiento moderado.`,
      });
    }

    // Insight sobre riesgo
    if (metricsData.volatility > 15) {
      newInsights.push({
        icon: '⚠️',
        title: 'Volatilidad Elevada',
        text: `Tu cartera tiene una volatilidad del ${metricsData.volatility.toFixed(1)}%. Prepárate para fluctuaciones significativas, especialmente a corto plazo.`,
      });
    } else if (metricsData.volatility < 8) {
      newInsights.push({
        icon: '🎯',
        title: 'Riesgo Controlado',
        text: `Con una volatilidad del ${metricsData.volatility.toFixed(1)}%, tu cartera ofrece estabilidad y fluctuaciones moderadas.`,
      });
    }

    // Insight sobre Ratio Sharpe
    if (metricsData.sharpeRatio > 0.7) {
      newInsights.push({
        icon: '🏆',
        title: 'Excelente Eficiencia',
        text: `Tu ratio Sharpe de ${metricsData.sharpeRatio.toFixed(2)} indica una excelente relación riesgo-rentabilidad. Estás obteniendo buena compensación por el riesgo asumido.`,
      });
    } else if (metricsData.sharpeRatio < 0.4) {
      newInsights.push({
        icon: '🔧',
        title: 'Margen de Mejora',
        text: `Tu ratio Sharpe de ${metricsData.sharpeRatio.toFixed(2)} sugiere que podrías optimizar la relación riesgo-rentabilidad. Considera rebalancear tu allocation.`,
      });
    }

    // Insight sobre diversificación
    const maxAllocation = Math.max(
      allocation.equity,
      allocation.bonds,
      allocation.reits,
      allocation.commodities
    );
    if (maxAllocation > 80) {
      newInsights.push({
        icon: '🌍',
        title: 'Considera Mayor Diversificación',
        text: `Tu cartera está muy concentrada (${maxAllocation}% en un solo activo). Una mayor diversificación podría reducir el riesgo.`,
      });
    } else if (maxAllocation < 40) {
      newInsights.push({
        icon: '✅',
        title: 'Excelente Diversificación',
        text: 'Tu cartera está bien diversificada entre diferentes clases de activos, lo que ayuda a reducir el riesgo general.',
      });
    }

    setInsights(newInsights);
  };

  const calculateProjection = (years: number): Projection => {
    if (!metrics) throw new Error('Metrics not calculated');

    const annualReturn = metrics.expectedReturn / 100;
    const monthlyReturn = annualReturn / 12;

    let balance = parameters.initial;
    let totalContributed = parameters.initial;

    // Simulación mes a mes
    for (let month = 1; month <= years * 12; month++) {
      // Añadir aportación mensual
      balance += parameters.monthly;
      totalContributed += parameters.monthly;

      // Aplicar rentabilidad mensual
      balance *= 1 + monthlyReturn;
    }

    const finalAmount = balance;
    const totalGain = balance - totalContributed;
    const roi = ((balance - totalContributed) / totalContributed) * 100;

    return {
      years,
      finalAmount,
      totalContributed,
      totalGain,
      roi,
    };
  };

  const simulatePortfolio = () => {
    const total = allocation.equity + allocation.bonds + allocation.reits + allocation.commodities;

    if (total !== 100) {
      alert('⚠️ La suma de asset allocation debe ser exactamente 100%');
      return;
    }

    const metricsData = calculateMetrics();
    if (!metricsData) return;

    setMetrics(metricsData);
    generateInsights(metricsData);

    // Realizar proyecciones para diferentes períodos
    const periods = [5, 10, 15, 20, 25];
    const newProjections: Projection[] = [];

    periods.forEach((years) => {
      if (years <= parameters.years) {
        const projection = {
          ...calculateProjection(years),
          years,
        };
        newProjections.push(projection);
      }
    });

    setProjections(newProjections);
    setShowResults(true);

    // Scroll suave a resultados
    setTimeout(() => {
      document.getElementById('simulationResults')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const applyProfile = (profileKey: keyof typeof profiles) => {
    const profile = profiles[profileKey];
    setAllocation({
      equity: profile.equity,
      bonds: profile.bonds,
      reits: profile.reits,
      commodities: profile.commodities,
    });
  };

  const resetForm = () => {
    setAllocation({ equity: 55, bonds: 30, reits: 10, commodities: 5 });
    setParameters({ initial: 10000, monthly: 500, years: 20 });
    setMetrics(null);
    setProjections([]);
    setShowResults(false);
    setInsights([]);
  };

  const generatePDF = () => {
    if (!metrics || projections.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(20);
    doc.setTextColor(46, 134, 171);
    doc.text('Reporte de Cartera de Inversión', pageWidth / 2, 20, { align: 'center' });

    // Línea separadora
    doc.setDrawColor(229, 229, 229);
    doc.line(20, 25, pageWidth - 20, 25);

    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 30, {
      align: 'center',
    });

    // Asset Allocation
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('Asset Allocation', 20, 45);

    doc.setFontSize(11);
    doc.setTextColor(102, 102, 102);
    let yPos = 52;
    doc.text(`Renta Variable: ${allocation.equity}%`, 20, yPos);
    yPos += 7;
    doc.text(`Renta Fija: ${allocation.bonds}%`, 20, yPos);
    yPos += 7;
    doc.text(`REITs: ${allocation.reits}%`, 20, yPos);
    yPos += 7;
    doc.text(`Commodities: ${allocation.commodities}%`, 20, yPos);

    // Métricas
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('Métricas de la Cartera', 20, yPos);

    yPos += 7;
    doc.setFontSize(11);
    doc.setTextColor(102, 102, 102);
    doc.text(`Rentabilidad Esperada: ${metrics.expectedReturn.toFixed(1)}%`, 20, yPos);
    yPos += 7;
    doc.text(`Volatilidad: ${metrics.volatility.toFixed(1)}%`, 20, yPos);
    yPos += 7;
    doc.text(`Ratio Sharpe: ${metrics.sharpeRatio.toFixed(2)}`, 20, yPos);
    yPos += 7;
    doc.text(`Perfil: ${metrics.profile}`, 20, yPos);

    // Proyecciones
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('Proyecciones de Crecimiento', 20, yPos);

    yPos += 7;
    doc.setFontSize(11);
    doc.setTextColor(102, 102, 102);

    projections.forEach((proj) => {
      yPos += 7;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(
        `${proj.years} años: ${formatCurrency(proj.finalAmount)} (ROI: ${proj.roi.toFixed(1)}%)`,
        20,
        yPos
      );
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(153, 153, 153);
    doc.text('© 2025 meskeIA - Calculadora de Inversiones', pageWidth / 2, 285, {
      align: 'center',
    });

    doc.save('reporte-cartera-meskeia.pdf');
  };

  // Calcular métricas automáticamente cuando cambia la asignación
  useEffect(() => {
    const metricsData = calculateMetrics();
    if (metricsData) {
      setMetrics(metricsData);
      generateInsights(metricsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocation]);

  // Configuración del gráfico de dona
  const chartData = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [] as string[],
        borderWidth: 3,
        borderColor: '#ffffff',
      },
    ],
  };

  const colorMap: Record<string, string> = {
    equity: '#2E86AB',
    bonds: '#28a745',
    reits: '#f39c12',
    commodities: '#6c757d',
  };

  // Solo incluir assets con allocation > 0
  Object.entries(allocation).forEach(([asset, percentage]) => {
    if (percentage > 0) {
      chartData.labels.push(assetData[asset as keyof typeof assetData].name);
      chartData.datasets[0].data.push(percentage);
      chartData.datasets[0].backgroundColor.push(colorMap[asset]);
    }
  });

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
            weight: 600,
          },
          color: '#1A1A1A',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.label + ': ' + context.parsed + '%';
          },
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1A1A1A',
        bodyColor: '#666666',
        borderColor: '#E5E5E5',
        borderWidth: 1,
      },
    },
  };

  const total = allocation.equity + allocation.bonds + allocation.reits + allocation.commodities;
  const isAllocationValid = total === 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />
      <AnalyticsTracker appName="calculadora-inversiones" />

      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1>📊 Calculadora de Inversiones - Asset Allocation</h1>
          <p className={styles.subtitle}>
            Diseña tu cartera de inversión ideal con análisis profesional de riesgo y rentabilidad
          </p>
        </div>

        {/* Layout Principal */}
        <div className={styles.mainLayout}>
          {/* Panel de Configuración */}
          <div className={styles.configPanel}>
            <h2 className={styles.panelTitle}>🎯 Configuración de Cartera</h2>

            {/* Perfiles Predefinidos */}
            <div className={styles.profilePresets}>
              <button
                type="button"
                className={styles.profileButton}
                onClick={() => applyProfile('conservative')}
              >
                🛡️ Conservador
              </button>
              <button
                type="button"
                className={styles.profileButton}
                onClick={() => applyProfile('moderate')}
              >
                ⚖️ Moderado
              </button>
              <button
                type="button"
                className={styles.profileButton}
                onClick={() => applyProfile('aggressive')}
              >
                🚀 Agresivo
              </button>
            </div>

            {/* Asset Allocation */}
            <div className={styles.allocationSection}>
              <h3>Asset Allocation</h3>

              <div className={styles.assetSlider}>
                <label>
                  <span>Renta Variable (Acciones)</span>
                  <span className={styles.sliderValue}>{allocation.equity}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocation.equity}
                  onChange={(e) =>
                    setAllocation({ ...allocation, equity: parseInt(e.target.value) })
                  }
                  className={styles.slider}
                />
              </div>

              <div className={styles.assetSlider}>
                <label>
                  <span>Renta Fija (Bonos)</span>
                  <span className={styles.sliderValue}>{allocation.bonds}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocation.bonds}
                  onChange={(e) =>
                    setAllocation({ ...allocation, bonds: parseInt(e.target.value) })
                  }
                  className={styles.slider}
                />
              </div>

              <div className={styles.assetSlider}>
                <label>
                  <span>REITs (Inmobiliario)</span>
                  <span className={styles.sliderValue}>{allocation.reits}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocation.reits}
                  onChange={(e) =>
                    setAllocation({ ...allocation, reits: parseInt(e.target.value) })
                  }
                  className={styles.slider}
                />
              </div>

              <div className={styles.assetSlider}>
                <label>
                  <span>Commodities (Materias Primas)</span>
                  <span className={styles.sliderValue}>{allocation.commodities}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocation.commodities}
                  onChange={(e) =>
                    setAllocation({ ...allocation, commodities: parseInt(e.target.value) })
                  }
                  className={styles.slider}
                />
              </div>

              <div className={styles.allocationTotal}>
                <span>Total:</span>
                <span className={isAllocationValid ? styles.valid : styles.invalid}>
                  {total}%
                </span>
              </div>
            </div>

            {/* Parámetros de Inversión */}
            <div className={styles.parametersSection}>
              <h3>Parámetros de Inversión</h3>

              <div className={styles.inputGroup}>
                <label>Capital Inicial (€)</label>
                <input
                  type="number"
                  min="0"
                  value={parameters.initial}
                  onChange={(e) =>
                    setParameters({ ...parameters, initial: parseFloat(e.target.value) || 0 })
                  }
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Aportación Mensual (€)</label>
                <input
                  type="number"
                  min="0"
                  value={parameters.monthly}
                  onChange={(e) =>
                    setParameters({ ...parameters, monthly: parseFloat(e.target.value) || 0 })
                  }
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Horizonte Temporal (años)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={parameters.years}
                  onChange={(e) =>
                    setParameters({ ...parameters, years: parseInt(e.target.value) || 20 })
                  }
                  className={styles.input}
                />
              </div>
            </div>

            {/* Botones de Control */}
            <div className={styles.controlButtons}>
              <Button onClick={simulatePortfolio} variant="primary" disabled={!isAllocationValid}>
                🚀 Simular Cartera
              </Button>
              <Button onClick={resetForm} variant="secondary">
                🔄 Reiniciar
              </Button>
            </div>
          </div>

          {/* Panel de Resultados */}
          <div className={styles.resultsPanel}>
            <h2 className={styles.panelTitle}>📈 Análisis de Cartera</h2>

            {/* Gráfico de Allocation */}
            {chartData.labels.length > 0 && (
              <div className={styles.chartContainer}>
                <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
              </div>
            )}

            {/* Métricas */}
            {metrics && (
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Rentabilidad Esperada</div>
                  <div className={styles.metricValue}>{metrics.expectedReturn.toFixed(1)}%</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Volatilidad</div>
                  <div className={styles.metricValue}>{metrics.volatility.toFixed(1)}%</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Ratio Sharpe</div>
                  <div className={styles.metricValue}>{metrics.sharpeRatio.toFixed(2)}</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Perfil Detectado</div>
                  <div className={styles.metricValue}>{metrics.profile}</div>
                </div>
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div className={styles.insightsSection}>
                <h3>💡 Insights de tu Cartera</h3>
                <div className={styles.insightsList}>
                  {insights.map((insight, index) => (
                    <div key={index} className={styles.insightCard}>
                      <strong>
                        {insight.icon} {insight.title}
                      </strong>
                      <p>{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resultados de Simulación */}
        {showResults && projections.length > 0 && (
          <div id="simulationResults" className={styles.simulationResults}>
            <h2 className={styles.sectionTitle}>🎯 Proyecciones de Crecimiento</h2>

            <div className={styles.projectionsGrid}>
              {projections.map((proj) => (
                <div key={proj.years} className={styles.projectionCard}>
                  <div className={styles.projectionYears}>{proj.years} años</div>
                  <div className={styles.projectionAmount}>{formatCurrency(proj.finalAmount)}</div>
                  <div className={styles.projectionDetails}>
                    <div>Aportado: {formatCurrency(proj.totalContributed)}</div>
                    <div>Ganancia: {formatCurrency(proj.totalGain)}</div>
                    <div>ROI: {proj.roi.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botones Finales */}
            <div className={styles.finalActions}>
              <Button onClick={generatePDF} variant="primary">
                📄 Descargar PDF
              </Button>
            </div>
          </div>
        )}

        {/* Advertencia Legal */}
        <div className={styles.legalDisclaimer}>
          <h4>⚠️ Advertencia Legal</h4>
          <p>
            Esta calculadora tiene fines educativos e informativos. Las proyecciones se basan en
            datos históricos y NO garantizan resultados futuros. Los mercados financieros son
            volátiles y pueden resultar en pérdidas. Consulta con un asesor financiero profesional
            antes de tomar decisiones de inversión. meskeIA no se responsabiliza de las decisiones
            tomadas con base en esta herramienta.
          </p>
        </div>

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Asset Allocation e Inversión?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre estrategias de diversificación, tipos de activos, perfiles de inversión y respuestas a las preguntas más frecuentes
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
            {/* Sección: ¿Qué es Asset Allocation? */}
            <section className={styles.assetAllocationGuide}>
              <h2>💼 ¿Qué es Asset Allocation?</h2>
              <p className={styles.introText}>
                El <strong>Asset Allocation</strong> o asignación de activos es una estrategia de inversión que busca equilibrar riesgo y rentabilidad mediante la distribución de inversiones entre diferentes categorías de activos como acciones, bonos, bienes raíces y materias primas.
              </p>
              <p className={styles.introText}>
                Esta diversificación es fundamental porque diferentes activos reaccionan de manera distinta ante los cambios económicos. Cuando las acciones caen, los bonos pueden mantener estabilidad, y viceversa. Una cartera bien diversificada puede reducir significativamente el riesgo sin sacrificar demasiada rentabilidad.
              </p>
            </section>

            {/* Sección: Tipos de Activos */}
            <section className={styles.assetTypesSection}>
              <h3>📊 Tipos de Activos Principales</h3>
              <div className={styles.assetTypesGrid}>
                <div className={styles.assetTypeCard}>
                  <h4>📈 Renta Variable (Acciones)</h4>
                  <p>
                    <strong>Alto potencial de crecimiento pero mayor volatilidad.</strong> Incluye acciones individuales y ETFs de índices bursátiles. Históricamente han ofrecido las mejores rentabilidades a largo plazo (~8-10% anual), pero con mayor riesgo de pérdidas a corto plazo.
                  </p>
                  <ul>
                    <li>✓ Crecimiento del capital a largo plazo</li>
                    <li>✓ Dividendos de empresas sólidas</li>
                    <li>✗ Alta volatilidad en crisis</li>
                  </ul>
                </div>

                <div className={styles.assetTypeCard}>
                  <h4>🏛️ Renta Fija (Bonos)</h4>
                  <p>
                    <strong>Proporcionan estabilidad y ingresos regulares.</strong> Menor riesgo pero también menor rentabilidad esperada (~3-4% anual). Son fundamentales para reducir la volatilidad general de la cartera.
                  </p>
                  <ul>
                    <li>✓ Pagos de cupones predecibles</li>
                    <li>✓ Menor volatilidad que acciones</li>
                    <li>✗ Sensibilidad a tipos de interés</li>
                  </ul>
                </div>

                <div className={styles.assetTypeCard}>
                  <h4>🏢 Inmobiliario (REITs)</h4>
                  <p>
                    <strong>Exposición al mercado inmobiliario con liquidez bursátil.</strong> Diversificación adicional y dividendos (~6-8% anual). Los REITs combinan crecimiento del capital con rentas periódicas.
                  </p>
                  <ul>
                    <li>✓ Dividendos atractivos (&gt;4%)</li>
                    <li>✓ Protección contra inflación</li>
                    <li>✗ Correlación con sector financiero</li>
                  </ul>
                </div>

                <div className={styles.assetTypeCard}>
                  <h4>🥇 Materias Primas</h4>
                  <p>
                    <strong>Protección contra inflación.</strong> Incluye oro, petróleo, productos agrícolas y otros commodities. Baja correlación con otros activos, ideal para diversificación.
                  </p>
                  <ul>
                    <li>✓ Cobertura contra inflación</li>
                    <li>✓ Baja correlación con acciones</li>
                    <li>✗ No generan dividendos ni intereses</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sección: Perfiles de Inversión */}
            <section className={styles.investmentProfilesSection}>
              <h3>🎯 Perfiles de Inversión por Edad y Tolerancia al Riesgo</h3>
              <p className={styles.profileIntro}>
                Una regla tradicional sugiere que el porcentaje en bonos debe ser aproximadamente igual a tu edad (ej: 30 años = 30% bonos, 70% acciones). Sin embargo, con el aumento de la esperanza de vida, muchos expertos recomiendan estrategias más agresivas.
              </p>

              <div className={styles.profilesGrid}>
                <div className={styles.profileCard}>
                  <div className={styles.profileHeader}>
                    <span className={styles.profileIcon}>🛡️</span>
                    <h4>Perfil Conservador</h4>
                  </div>
                  <div className={styles.profileAllocation}>
                    <div className={styles.allocationBar}>
                      <div className={styles.equityBar} style={{ width: '30%' }}>30%</div>
                      <div className={styles.bondsBar} style={{ width: '50%' }}>50%</div>
                      <div className={styles.reitsBar} style={{ width: '15%' }}>15%</div>
                      <div className={styles.commoditiesBar} style={{ width: '5%' }}>5%</div>
                    </div>
                  </div>
                  <p><strong>Para quién:</strong> Inversores cerca de la jubilación (60+ años), baja tolerancia al riesgo, necesidad de capital a corto plazo.</p>
                  <p><strong>Rentabilidad esperada:</strong> 4-5% anual</p>
                  <p><strong>Volatilidad:</strong> Baja (8-10%)</p>
                </div>

                <div className={styles.profileCard}>
                  <div className={styles.profileHeader}>
                    <span className={styles.profileIcon}>⚖️</span>
                    <h4>Perfil Moderado</h4>
                  </div>
                  <div className={styles.profileAllocation}>
                    <div className={styles.allocationBar}>
                      <div className={styles.equityBar} style={{ width: '55%' }}>55%</div>
                      <div className={styles.bondsBar} style={{ width: '30%' }}>30%</div>
                      <div className={styles.reitsBar} style={{ width: '10%' }}>10%</div>
                      <div className={styles.commoditiesBar} style={{ width: '5%' }}>5%</div>
                    </div>
                  </div>
                  <p><strong>Para quién:</strong> Inversores de 40-60 años, horizonte temporal medio (10-20 años), equilibrio entre crecimiento y estabilidad.</p>
                  <p><strong>Rentabilidad esperada:</strong> 6-7% anual</p>
                  <p><strong>Volatilidad:</strong> Media (12-14%)</p>
                </div>

                <div className={styles.profileCard}>
                  <div className={styles.profileHeader}>
                    <span className={styles.profileIcon}>🚀</span>
                    <h4>Perfil Agresivo</h4>
                  </div>
                  <div className={styles.profileAllocation}>
                    <div className={styles.allocationBar}>
                      <div className={styles.equityBar} style={{ width: '75%' }}>75%</div>
                      <div className={styles.bondsBar} style={{ width: '10%' }}>10%</div>
                      <div className={styles.reitsBar} style={{ width: '10%' }}>10%</div>
                      <div className={styles.commoditiesBar} style={{ width: '5%' }}>5%</div>
                    </div>
                  </div>
                  <p><strong>Para quién:</strong> Inversores jóvenes (20-40 años), horizonte temporal largo (+20 años), alta tolerancia al riesgo.</p>
                  <p><strong>Rentabilidad esperada:</strong> 8-9% anual</p>
                  <p><strong>Volatilidad:</strong> Alta (16-18%)</p>
                </div>
              </div>
            </section>

            {/* Sección: Principios Fundamentales */}
            <section className={styles.fundamentalPrinciplesSection}>
              <h3>💡 Principios Fundamentales de Inversión</h3>
              <div className={styles.principlesGrid}>
                <div className={styles.principleCard}>
                  <strong>📊 La diversificación reduce el riesgo sin sacrificar rentabilidad</strong>
                  <p>No pongas todos los huevos en la misma cesta. Distribuir tu capital entre diferentes activos reduce el impacto de pérdidas en una sola clase de activo.</p>
                </div>

                <div className={styles.principleCard}>
                  <strong>⏰ El tiempo es tu mejor aliado para el crecimiento</strong>
                  <p>El interés compuesto trabaja de forma exponencial. Invertir durante 30 años puede generar rendimientos 10 veces superiores que invertir durante 10 años.</p>
                </div>

                <div className={styles.principleCard}>
                  <strong>🔄 Rebalancear periódicamente mantiene tu estrategia</strong>
                  <p>Cuando una clase de activo crece mucho, puede desbalancear tu cartera. Rebalancear anualmente te obliga a "vender caro y comprar barato".</p>
                </div>

                <div className={styles.principleCard}>
                  <strong>💰 Costes bajos aumentan tu rentabilidad neta</strong>
                  <p>Una diferencia del 1% en comisiones puede reducir tu patrimonio final en un 25% tras 30 años. Elige ETFs de bajo coste (TER &lt; 0.3%).</p>
                </div>

                <div className={styles.principleCard}>
                  <strong>🧘 La disciplina es más importante que el timing</strong>
                  <p>Intentar cronometrar el mercado es contraproducente. El Dollar Cost Averaging (inversiones periódicas) reduce el riesgo de timing.</p>
                </div>

                <div className={styles.principleCard}>
                  <strong>📉 Las crisis son oportunidades de compra</strong>
                  <p>Los mercados caen periódicamente, pero históricamente siempre se han recuperado. Mantener la calma y seguir invirtiendo en crisis maximiza rentabilidades.</p>
                </div>
              </div>
            </section>

            {/* Sección: FAQ */}
            <section className={styles.faqSection}>
              <h3>❓ Preguntas Frecuentes</h3>
              <div className={styles.faqList}>
                <details className={styles.faqItem}>
                  <summary>¿Cuánto dinero necesito para empezar a invertir?</summary>
                  <p>
                    Puedes empezar con cantidades pequeñas, incluso 50€ al mes. Lo importante es la constancia y el tiempo en el mercado. Muchos brokers online no tienen mínimos de inversión para ETFs. Con 100-200€ mensuales puedes construir una cartera diversificada en 2-3 años.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Qué es mejor: invertir todo de una vez o poco a poco?</summary>
                  <p>
                    El <strong>Dollar Cost Averaging (DCA)</strong> o inversión periódica reduce el riesgo de timing y suaviza la volatilidad. Es especialmente recomendable para inversores principiantes o en mercados inciertos. Si tienes una suma grande, algunos estudios sugieren invertir todo de una vez (lump sum), pero psicológicamente DCA es más cómodo.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Con qué frecuencia debo rebalancear mi cartera?</summary>
                  <p>
                    Rebalancear <strong>anualmente</strong> suele ser suficiente para la mayoría de inversores. Hazlo cuando una categoría de activos se desvíe más del 5-10% de tu asignación objetivo. Rebalancear con demasiada frecuencia genera costes de transacción innecesarios.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Los ETFs son mejor opción que los fondos de inversión tradicionales?</summary>
                  <p>
                    Los ETFs suelen tener <strong>comisiones más bajas</strong> (TER 0.1-0.5% vs 1-2% fondos activos), mayor transparencia y liquidez diaria. Son especialmente útiles para estrategias de inversión pasiva y diversificación amplia del mercado. Los fondos activos rara vez baten al índice de referencia a largo plazo.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Es seguro invertir todo en acciones si soy joven?</summary>
                  <p>
                    Si tienes un horizonte temporal largo (+20 años) y tolerancia al riesgo, una alta exposición a acciones (70-90%) puede ser adecuada. Sin embargo, incluir algo de renta fija (10-20%) aporta estabilidad psicológica durante crisis, evitando ventas por pánico. La clave es mantener la inversión durante caídas.
                  </p>
                </details>
              </div>
            </section>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
