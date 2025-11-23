'use client';

import { useState, useEffect } from 'react';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui';
import { jsonLd } from './metadata';
import styles from './SimuladorHipoteca.module.css';
import { Line } from 'react-chartjs-2';
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
import jsPDF from 'jspdf';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface AmortizationRow {
  payment: number;
  principal: number;
  interest: number;
  monthlyPayment: number;
  remainingBalance: number;
}

interface LoanResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalPayments: number;
  amortizationTable: AmortizationRow[];
  parameters: {
    principal: number;
    years: number;
    annualRate: number;
  };
}

export default function SimuladorHipoteca() {
  // Estados
  const [amount, setAmount] = useState<number>(200000);
  const [years, setYears] = useState<number>(25);
  const [rate, setRate] = useState<number>(3.5);
  const [results, setResults] = useState<LoanResults | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  // Cálculo automático al cambiar valores
  useEffect(() => {
    if (amount > 0 && years > 0 && rate >= 0) {
      calculateLoan();
    }
  }, [amount, years, rate]);

  // Calcular hipoteca
  const calculateLoan = () => {
    const principal = amount;
    const monthlyRate = rate / 12 / 100;
    const totalPayments = years * 12;

    // Calcular cuota mensual (Sistema Francés)
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments);
    const denominator = Math.pow(1 + monthlyRate, totalPayments) - 1;
    const monthlyPayment = numerator / denominator;

    // Generar tabla de amortización
    let amortizationTable: AmortizationRow[] = [];
    let remainingBalance = principal;
    let totalInterestPaid = 0;

    for (let payment = 1; payment <= totalPayments; payment++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      totalInterestPaid += interestPayment;

      // Evitar valores negativos muy pequeños por precisión
      if (remainingBalance < 0.01) {
        remainingBalance = 0;
      }

      amortizationTable.push({
        payment,
        principal: principalPayment,
        interest: interestPayment,
        monthlyPayment,
        remainingBalance,
      });
    }

    const totalPayment = monthlyPayment * totalPayments;

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest: totalInterestPaid,
      totalPayments,
      amortizationTable,
      parameters: {
        principal,
        years,
        annualRate: rate,
      },
    });

    setShowResults(true);
  };

  // Resetear calculadora
  const resetCalculator = () => {
    setAmount(200000);
    setYears(25);
    setRate(3.5);
    setShowResults(false);
    setResults(null);
  };

  // Formatear moneda española
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Generar PDF
  const generatePDF = () => {
    if (!results) {
      alert('No hay resultados para generar el reporte.');
      return;
    }

    try {
      const doc = new jsPDF();

      // Configuración
      const margin = 20;
      let yPosition = margin;

      // Título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Hipoteca - Sistema Frances', margin, yPosition);
      yPosition += 15;

      // Fecha
      const today = new Date().toLocaleDateString('es-ES');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha de generacion: ${today}`, margin, yPosition);
      yPosition += 20;

      // Parámetros
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Parametros de la Hipoteca:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Importe: ${formatCurrency(results.parameters.principal)}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Duracion: ${results.parameters.years} anos`, margin, yPosition);
      yPosition += 7;
      doc.text(`Interes Anual: ${results.parameters.annualRate}%`, margin, yPosition);
      yPosition += 15;

      // Resultados
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen de Resultados:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Cuota Mensual: ${formatCurrency(results.monthlyPayment)}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Total a Pagar: ${formatCurrency(results.totalPayment)}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Total Intereses: ${formatCurrency(results.totalInterest)}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Numero de Cuotas: ${results.totalPayments}`, margin, yPosition);
      yPosition += 15;

      // Tabla de amortización (primeros 24 meses)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Tabla de Amortizacion (primeros 24 meses):', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // Encabezados de tabla
      doc.text('Cuota', margin, yPosition);
      doc.text('Capital', margin + 25, yPosition);
      doc.text('Intereses', margin + 65, yPosition);
      doc.text('Cuota Total', margin + 105, yPosition);
      doc.text('Pendiente', margin + 150, yPosition);
      yPosition += 8;

      // Datos de tabla
      const maxRows = Math.min(24, results.amortizationTable.length);
      for (let i = 0; i < maxRows; i++) {
        const row = results.amortizationTable[i];
        doc.text(`${row.payment}`, margin, yPosition);
        doc.text(`${formatCurrency(row.principal)}`, margin + 25, yPosition);
        doc.text(`${formatCurrency(row.interest)}`, margin + 65, yPosition);
        doc.text(`${formatCurrency(row.monthlyPayment)}`, margin + 105, yPosition);
        doc.text(`${formatCurrency(row.remainingBalance)}`, margin + 150, yPosition);
        yPosition += 6;

        // Nueva página si es necesario
        if (yPosition > 270) {
          doc.addPage();
          yPosition = margin;
        }
      }

      // Pie de página
      const footerY = doc.internal.pageSize.height - 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Reporte generado por meskeIA - Simulador de Hipoteca', margin, footerY);

      // Descargar
      const fileName = `hipoteca-${today.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF generado exitosamente:', fileName);
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  // Compartir resultados
  const shareResults = () => {
    if (!results) {
      alert('No hay resultados para compartir.');
      return;
    }

    const shareText = `🏠 Mi simulación de hipoteca:
💰 Importe: ${formatCurrency(results.parameters.principal)}
📅 Duración: ${results.parameters.years} años
📈 Interés: ${results.parameters.annualRate}%

💳 Cuota mensual: ${formatCurrency(results.monthlyPayment)}
💰 Total a pagar: ${formatCurrency(results.totalPayment)}
📊 Total intereses: ${formatCurrency(results.totalInterest)}

Calculado con meskeIA 🚀`;

    if (navigator.share) {
      navigator.share({
        title: 'Mi Simulación de Hipoteca',
        text: shareText,
      });
    } else {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert('Resultados copiados al portapapeles 📋');
        })
        .catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Resultados copiados al portapapeles 📋');
        });
    }
  };

  // Datos para el gráfico
  const chartData = results
    ? {
        labels: results.amortizationTable
          .filter((_, index) => (index + 1) % 12 === 0)
          .map((_, index) => `Año ${index + 1}`),
        datasets: [
          {
            label: '💰 Capital Pendiente',
            data: results.amortizationTable
              .filter((_, index) => (index + 1) % 12 === 0)
              .map((row) => row.remainingBalance),
            borderColor: '#2E86AB',
            backgroundColor: 'rgba(46, 134, 171, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: '✅ Capital Amortizado',
            data: results.amortizationTable
              .filter((_, index) => (index + 1) % 12 === 0)
              .map((row) => results.parameters.principal - row.remainingBalance),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Number(value));
          },
          color: '#666666',
        },
        grid: {
          color: '#E5E5E5',
        },
      },
      x: {
        ticks: {
          color: '#666666',
        },
        grid: {
          color: '#E5E5E5',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#1A1A1A',
          font: {
            weight: 600,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
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

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Analytics v2.1 */}
      <AnalyticsTracker applicationName="simulador-hipoteca" />

      {/* Logo meskeIA */}
      <MeskeiaLogo />

      <div className="container-lg">
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.hero}>
            <h1 className="text-2xl text-lg-3xl text-center mb-sm">🏠 Simulador de Hipoteca</h1>
            <p className={styles.subtitle}>
              Calcula tu hipoteca con sistema francés y visualiza toda la información de amortización de forma clara y
              detallada
            </p>
          </header>

          {/* Layout Principal */}
          <div className={styles.mainLayout}>
            {/* Panel de Entrada */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>📊 Datos de la Hipoteca</h3>

              <div className={styles.formGroup}>
                <label htmlFor="amount" className={styles.label}>
                  💰 Importe de la Hipoteca (€)
                </label>
                <input
                  type="number"
                  id="amount"
                  className={styles.input}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  min="1000"
                  step="1000"
                />
                <small className={styles.hint}>Cantidad total que necesitas pedir prestada</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="years" className={styles.label}>
                  📅 Duración (años)
                </label>
                <input
                  type="number"
                  id="years"
                  className={styles.input}
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                  min="1"
                  max="50"
                  step="1"
                />
                <small className={styles.hint}>Tiempo para devolver la hipoteca completa</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="rate" className={styles.label}>
                  📈 Interés Anual (%)
                </label>
                <input
                  type="number"
                  id="rate"
                  className={styles.input}
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  min="0.1"
                  max="15"
                  step="0.1"
                />
                <small className={styles.hint}>Tipo de interés anual (TIN)</small>
              </div>

              <div className={styles.controlButtons}>
                <Button variant="primary" onClick={() => calculateLoan()}>
                  🧮 Calcular Hipoteca
                </Button>
                <Button variant="secondary" onClick={resetCalculator}>
                  🔄 Limpiar
                </Button>
              </div>
            </div>

            {/* Panel de Resultados */}
            {showResults && results && (
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>💡 Resumen de Resultados</h3>

                <div className={styles.resultsSummary}>
                  <div className={`${styles.resultCard} ${styles.highlight}`}>
                    <h4>💳 Cuota Mensual</h4>
                    <div className={styles.resultValue}>{formatCurrency(results.monthlyPayment)}</div>
                  </div>

                  <div className={styles.resultCard}>
                    <h4>💰 Total a Pagar</h4>
                    <div className={styles.resultValue}>{formatCurrency(results.totalPayment)}</div>
                  </div>

                  <div className={styles.resultCard}>
                    <h4>📊 Total Intereses</h4>
                    <div className={styles.resultValue}>{formatCurrency(results.totalInterest)}</div>
                  </div>

                  <div className={styles.resultCard}>
                    <h4>🎯 Número de Cuotas</h4>
                    <div className={styles.resultValue}>{results.totalPayments}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico de Evolución */}
          {showResults && results && chartData && (
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>📈 Evolución de la Hipoteca</h3>
              <div className={styles.chartWrapper}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Tabla de Amortización */}
          {showResults && results && (
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h3>📋 Tabla de Amortización Completa</h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Cuota</th>
                      <th>Capital</th>
                      <th>Intereses</th>
                      <th>Cuota Total</th>
                      <th>Capital Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.amortizationTable.map((row) => (
                      <tr key={row.payment}>
                        <td>
                          <strong>{row.payment}</strong>
                        </td>
                        <td>{formatCurrency(row.principal)}</td>
                        <td>{formatCurrency(row.interest)}</td>
                        <td>
                          <strong>{formatCurrency(row.monthlyPayment)}</strong>
                        </td>
                        <td>{formatCurrency(row.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Acciones */}
          {showResults && results && (
            <div className={styles.actionButtons}>
              <Button variant="primary" onClick={generatePDF}>
                📄 Descargar PDF
              </Button>
              <Button variant="secondary" onClick={shareResults}>
                📤 Compartir
              </Button>
            </div>
          )}
        </div>

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Hipotecas y Sistema Francés?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre cómo funciona el sistema francés, conceptos clave, casos de uso, consejos para optimizar tu hipoteca y respuestas a preguntas frecuentes
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
            {/* Sección: Guía Completa */}
            <section className={styles.mortgageGuide}>
              <h2>📖 Guía Completa del Simulador de Hipoteca</h2>
              <p className={styles.introText}>
                Nuestro simulador de hipoteca utiliza el <strong>sistema francés de amortización</strong>, el método más utilizado en España para el cálculo de préstamos hipotecarios. Con esta herramienta gratuita podrás planificar tu compra de vivienda conociendo exactamente cuánto pagarás cada mes y cuántos intereses totales generará tu hipoteca.
              </p>

              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <h4>🧮 Cálculos Precisos del Sistema Francés</h4>
                  <p><strong>Cuotas constantes:</strong> El sistema francés calcula cuotas mensuales fijas durante toda la vida del préstamo.</p>
                  <p>Al principio pagas más intereses y menos capital, equilibrándose gradualmente hasta que al final pagas más capital que intereses. Nuestro simulador aplica las fórmulas matemáticas oficiales utilizadas por entidades bancarias.</p>
                </div>

                <div className={styles.featureCard}>
                  <h4>📊 Tabla de Amortización Completa</h4>
                  <p><strong>Desglose detallado:</strong> Visualiza mes a mes cómo evoluciona tu hipoteca con información precisa.</p>
                  <p>Cada fila muestra el capital amortizado, intereses pagados, cuota total y capital pendiente de pago. Información completa para planificar amortizaciones anticipadas y entender el comportamiento financiero de tu préstamo.</p>
                </div>

                <div className={styles.featureCard}>
                  <h4>📈 Visualizaciones Interactivas</h4>
                  <p><strong>Gráficos evolutivos:</strong> Comprende visualmente cómo evoluciona tu hipoteca año a año.</p>
                  <p>Los gráficos muestran la evolución del capital pendiente y capital amortizado, facilitando la comprensión del comportamiento financiero del préstamo y ayudando en la toma de decisiones sobre amortizaciones anticipadas.</p>
                </div>

                <div className={styles.featureCard}>
                  <h4>📄 Reportes en PDF</h4>
                  <p><strong>Documentación completa:</strong> Genera reportes profesionales con todos los detalles de tu simulación.</p>
                  <p>Los PDF incluyen parámetros de entrada, resumen de resultados y tabla de amortización detallada. Ideal para presentar a asesores financieros o para tu planificación personal de compra de vivienda.</p>
                </div>

                <div className={styles.featureCard}>
                  <h4>🔒 Privacidad Total</h4>
                  <p><strong>Cálculos locales:</strong> Todos los cálculos se realizan en tu navegador sin enviar datos a servidores externos.</p>
                  <p>Tu información financiera permanece completamente privada. No guardamos, almacenamos ni transmitimos ningún dato personal o financiero, garantizando confidencialidad absoluta en tus simulaciones hipotecarias.</p>
                </div>

                <div className={styles.featureCard}>
                  <h4>⚡ Resultados Instantáneos</h4>
                  <p><strong>Cálculo automático:</strong> Los resultados se actualizan automáticamente al modificar cualquier parámetro.</p>
                  <p>Sistema de recálculo dinámico que permite experimentar con diferentes escenarios: variar el importe, duración o tipo de interés para encontrar la configuración de hipoteca que mejor se ajuste a tu capacidad financiera.</p>
                </div>
              </div>
            </section>

            {/* Sección: Casos de Uso */}
            <section className={styles.useCasesSection}>
              <h3>🏠 Casos de Uso del Simulador de Hipoteca</h3>
              <div className={styles.useCasesGrid}>
                <div className={styles.useCaseCard}>
                  <h4>🏠 Compra de Primera Vivienda</h4>
                  <p>Planifica tu primera compra inmobiliaria calculando cuotas mensuales ajustadas a tus ingresos. Simula diferentes escenarios de financiación para tomar la mejor decisión financiera. ¿Puedes pagar 800€/mes? Simula con 150.000€ a 25 años al 3,5% para ver si la cuota se ajusta a tu presupuesto.</p>
                </div>

                <div className={styles.useCaseCard}>
                  <h4>🔄 Cambio de Hipoteca</h4>
                  <p>Compara tu hipoteca actual con nuevas ofertas del mercado. Evalúa si te conviene cambiar de entidad bancaria o renegociar condiciones con tu banco actual. Banco A ofrece 3,2% y Banco B 3,8%. Simula ambos para ver la diferencia real en euros mensuales.</p>
                </div>

                <div className={styles.useCaseCard}>
                  <h4>💰 Planificación de Amortizaciones</h4>
                  <p>Utiliza la tabla detallada para planificar amortizaciones anticipadas estratégicas que reduzcan significativamente el coste total de tu hipoteca. Consulta la tabla para ver cuándo te conviene más hacer una amortización anticipada (primeros años = mayor ahorro).</p>
                </div>

                <div className={styles.useCaseCard}>
                  <h4>📊 Asesoramiento Financiero</h4>
                  <p>Herramienta profesional para asesores financieros e inmobiliarios que necesitan generar simulaciones precisas y reportes detallados para sus clientes. Genera un PDF con tu simulación para mostrarlo a tu asesor financiero o familiar.</p>
                </div>
              </div>
            </section>

            {/* Sección: Conceptos Clave */}
            <section className={styles.conceptsSection}>
              <h3>🎓 Conceptos Clave de Hipotecas</h3>
              <div className={styles.conceptsGrid}>
                <div className={styles.conceptCard}>
                  <h4>Sistema Francés de Amortización</h4>
                  <p>Método de cálculo donde las cuotas mensuales permanecen constantes durante toda la vida del préstamo. Al inicio se pagan más intereses, equilibrándose progresivamente hacia el capital. Es el sistema más utilizado en España por su predictibilidad en el pago mensual.</p>
                </div>

                <div className={styles.conceptCard}>
                  <h4>TIN - Tipo de Interés Nominal</h4>
                  <p>Porcentaje anual que se aplica sobre el capital pendiente de amortizar. Es el interés puro sin incluir comisiones ni gastos adicionales del préstamo hipotecario. Por ejemplo, un TIN del 3,5% significa que pagarás 3,5% de interés anual sobre el capital pendiente.</p>
                </div>

                <div className={styles.conceptCard}>
                  <h4>Capital e Intereses</h4>
                  <p>Cada cuota se divide en capital (cantidad que reduce la deuda) e intereses (coste del dinero prestado). La proporción varía mensualmente según el sistema francés. Al principio, la mayor parte de la cuota son intereses; al final, la mayor parte es capital.</p>
                </div>

                <div className={styles.conceptCard}>
                  <h4>Amortización Anticipada</h4>
                  <p>Pago adicional voluntario que reduce el capital pendiente, disminuyendo significativamente los intereses totales y/o acortando la duración del préstamo hipotecario. Las amortizaciones en los primeros años generan mayores ahorros.</p>
                </div>
              </div>
            </section>

            {/* Sección: Consejos */}
            <section className={styles.tipsSection}>
              <h3>💡 Consejos para Optimizar tu Hipoteca</h3>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <strong>💡 Compara Ofertas</strong>
                  <p>Utiliza el simulador para comparar diferentes ofertas bancarias variando el tipo de interés. Una diferencia de 0,5% puede suponer miles de euros de ahorro. Compara al menos 3 entidades antes de decidir.</p>
                </div>

                <div className={styles.tipCard}>
                  <strong>💡 Amortiza Estratégicamente</strong>
                  <p>Las amortizaciones anticipadas en los primeros años generan mayores ahorros en intereses. Consulta la tabla para identificar los mejores momentos para amortizar. Prioriza reducir plazo sobre reducir cuota si buscas ahorro máximo.</p>
                </div>

                <div className={styles.tipCard}>
                  <strong>💡 Considera la Duración</strong>
                  <p>Préstamos más largos tienen cuotas menores pero intereses totales mayores. Encuentra el equilibrio entre cuota mensual asumible e intereses totales. Compara hipoteca a 20 vs 30 años: cuotas menores pero más intereses totales.</p>
                </div>

                <div className={styles.tipCard}>
                  <strong>💡 Planifica tu Capacidad</strong>
                  <p>La cuota hipotecaria no debería superar el 35% de tus ingresos netos mensuales. Deja margen para gastos imprevistos, mantenimiento de la vivienda, seguros y comunidad. Tu salario permite cuotas de máximo 1.000€. ¿Cuál es el importe máximo que puedes pedir?</p>
                </div>
              </div>
            </section>

            {/* Sección: FAQ */}
            <section className={styles.faqSection}>
              <h3>❓ Preguntas Frecuentes</h3>
              <div className={styles.faqList}>
                <details className={styles.faqItem}>
                  <summary>¿Cómo funciona el sistema francés de amortización?</summary>
                  <p>
                    El sistema francés calcula cuotas mensuales constantes donde inicialmente se pagan más intereses y menos capital, equilibrándose progresivamente. Es el método más utilizado en España por su predictibilidad en el pago mensual. La fórmula matemática garantiza que cada mes pagues exactamente la misma cantidad.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Son precisos los cálculos del simulador?</summary>
                  <p>
                    Sí, utilizamos las fórmulas matemáticas oficiales del sistema francés empleadas por entidades bancarias. Los cálculos son exactos y coinciden con las simulaciones bancarias oficiales. Cualquier diferencia menor puede deberse a redondeos o comisiones adicionales que cada banco aplica.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Puedo simular amortizaciones anticipadas?</summary>
                  <p>
                    La tabla detallada te permite ver el capital pendiente mes a mes, facilitando el cálculo manual de amortizaciones anticipadas. Puedes ver exactamente cuánto capital queda pendiente en cualquier momento y calcular el ahorro que generaría una amortización anticipada.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Qué diferencia hay entre TIN y TAE?</summary>
                  <p>
                    El <strong>TIN</strong> (Tipo de Interés Nominal) es el tipo de interés puro que utilizamos en el simulador, sin incluir gastos. La <strong>TAE</strong> (Tasa Anual Equivalente) incluye comisiones, gastos de apertura y otros costes asociados. Para simulaciones básicas, el TIN proporciona una aproximación muy precisa de la cuota mensual.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Es seguro introducir mis datos financieros?</summary>
                  <p>
                    Completamente seguro. Todos los cálculos se realizan localmente en tu navegador mediante JavaScript. No enviamos, almacenamos ni procesamos ningún dato en servidores externos, garantizando privacidad total. Tu información financiera jamás sale de tu dispositivo.
                  </p>
                </details>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer meskeIA Unificado */}
      <Footer appName="Simulador de Hipoteca - meskeIA" />
    </>
  );
}
