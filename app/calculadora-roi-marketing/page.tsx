'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './CalculadoraROIMarketing.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber, formatPercentage } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import Chart from 'chart.js/auto';

interface CanalMarketing {
  id: string;
  nombre: string;
  icono: string;
  inversion: string;
  clientes: string;
  ingresosPorCliente: string;
}

const canalesIniciales: CanalMarketing[] = [
  { id: '1', nombre: 'Google Ads', icono: '🔍', inversion: '500', clientes: '15', ingresosPorCliente: '100' },
  { id: '2', nombre: 'Facebook/Instagram Ads', icono: '📱', inversion: '300', clientes: '10', ingresosPorCliente: '80' },
  { id: '3', nombre: 'Email Marketing', icono: '📧', inversion: '50', clientes: '8', ingresosPorCliente: '120' },
];

const opcionesCanales = [
  { nombre: 'Google Ads', icono: '🔍' },
  { nombre: 'Facebook Ads', icono: '👥' },
  { nombre: 'Instagram Ads', icono: '📸' },
  { nombre: 'LinkedIn Ads', icono: '💼' },
  { nombre: 'TikTok Ads', icono: '🎵' },
  { nombre: 'Email Marketing', icono: '📧' },
  { nombre: 'SEO Orgánico', icono: '🌐' },
  { nombre: 'Marketing de Contenidos', icono: '📝' },
  { nombre: 'Influencer Marketing', icono: '⭐' },
  { nombre: 'Afiliados', icono: '🤝' },
  { nombre: 'Offline/Eventos', icono: '📍' },
  { nombre: 'Otro', icono: '📊' },
];

export default function CalculadoraROIMarketingPage() {
  const [canales, setCanales] = useState<CanalMarketing[]>(canalesIniciales);
  const [valorVidaCliente, setValorVidaCliente] = useState('500');
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [nuevoCanal, setNuevoCanal] = useState({ nombre: '', icono: '📊' });

  // Refs para gráficos
  const chartRoiRef = useRef<HTMLCanvasElement>(null);
  const chartRoiInstanceRef = useRef<Chart | null>(null);
  const chartScatterRef = useRef<HTMLCanvasElement>(null);
  const chartScatterInstanceRef = useRef<Chart | null>(null);

  const actualizarCanal = (id: string, campo: keyof CanalMarketing, valor: string) => {
    setCanales(prev => prev.map(c => c.id === id ? { ...c, [campo]: valor } : c));
  };

  const eliminarCanal = (id: string) => {
    setCanales(prev => prev.filter(c => c.id !== id));
  };

  const agregarCanal = () => {
    if (nuevoCanal.nombre) {
      const nuevo: CanalMarketing = {
        id: String(Date.now()),
        nombre: nuevoCanal.nombre,
        icono: nuevoCanal.icono,
        inversion: '0',
        clientes: '0',
        ingresosPorCliente: '0'
      };
      setCanales(prev => [...prev, nuevo]);
      setNuevoCanal({ nombre: '', icono: '📊' });
      setMostrarFormNuevo(false);
    }
  };

  const seleccionarCanalPreset = (preset: typeof opcionesCanales[0]) => {
    setNuevoCanal({ nombre: preset.nombre, icono: preset.icono });
  };

  // Cálculos
  const calculos = useMemo(() => {
    const clv = parseSpanishNumber(valorVidaCliente) || 0;

    const canalesConMetricas = canales.map(canal => {
      const inversion = parseSpanishNumber(canal.inversion) || 0;
      const clientes = parseSpanishNumber(canal.clientes) || 0;
      const ingresoPorCliente = parseSpanishNumber(canal.ingresosPorCliente) || 0;

      const ingresosTotales = clientes * ingresoPorCliente;
      const beneficio = ingresosTotales - inversion;
      const roi = inversion > 0 ? ((beneficio / inversion) * 100) : 0;
      const cac = clientes > 0 ? inversion / clientes : 0;
      const roasMultiplier = inversion > 0 ? ingresosTotales / inversion : 0;
      const clvCacRatio = cac > 0 ? clv / cac : 0;

      return {
        ...canal,
        inversion,
        clientes,
        ingresoPorCliente,
        ingresosTotales,
        beneficio,
        roi,
        cac,
        roasMultiplier,
        clvCacRatio,
        esRentable: beneficio > 0,
        recomendacion: getRecomendacion(roi, clvCacRatio)
      };
    });

    // Totales
    const inversionTotal = canalesConMetricas.reduce((sum, c) => sum + c.inversion, 0);
    const ingresosTotal = canalesConMetricas.reduce((sum, c) => sum + c.ingresosTotales, 0);
    const clientesTotal = canalesConMetricas.reduce((sum, c) => sum + c.clientes, 0);
    const beneficioTotal = ingresosTotal - inversionTotal;
    const roiTotal = inversionTotal > 0 ? ((beneficioTotal / inversionTotal) * 100) : 0;
    const cacPromedio = clientesTotal > 0 ? inversionTotal / clientesTotal : 0;

    // Ranking por ROI
    const ranking = [...canalesConMetricas]
      .filter(c => c.inversion > 0)
      .sort((a, b) => b.roi - a.roi);

    const mejorCanal = ranking[0] || null;
    const peorCanal = ranking[ranking.length - 1] || null;

    return {
      canales: canalesConMetricas,
      inversionTotal,
      ingresosTotal,
      clientesTotal,
      beneficioTotal,
      roiTotal,
      cacPromedio,
      ranking,
      mejorCanal,
      peorCanal,
      clv
    };
  }, [canales, valorVidaCliente]);

  function getRecomendacion(roi: number, clvCacRatio: number): { texto: string; tipo: 'excelente' | 'bueno' | 'revisar' | 'pausar' } {
    if (roi > 200 && clvCacRatio > 3) return { texto: 'Escalar inversión', tipo: 'excelente' };
    if (roi > 100) return { texto: 'Mantener y optimizar', tipo: 'bueno' };
    if (roi > 0) return { texto: 'Revisar segmentación', tipo: 'revisar' };
    return { texto: 'Considerar pausar', tipo: 'pausar' };
  }

  // Gráfico de barras ROI por canal
  useEffect(() => {
    if (!chartRoiRef.current || calculos.ranking.length === 0) return;

    // Destruir instancia anterior
    if (chartRoiInstanceRef.current) {
      chartRoiInstanceRef.current.destroy();
    }

    const ctx = chartRoiRef.current.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E5E5E5' : '#1A1A1A';
    const gridColor = isDark ? '#404040' : '#E5E5E5';

    // Colores según ROI
    const getBarColor = (roi: number) => {
      if (roi > 200) return '#10B981'; // Excelente
      if (roi > 100) return '#2E86AB'; // Bueno
      if (roi > 0) return '#F59E0B';   // Regular
      return '#EF4444';                 // Negativo
    };

    chartRoiInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: calculos.ranking.map(c => c.nombre),
        datasets: [{
          label: 'ROI (%)',
          data: calculos.ranking.map(c => c.roi),
          backgroundColor: calculos.ranking.map(c => getBarColor(c.roi)),
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const canal = calculos.ranking[context.dataIndex];
                return [
                  `ROI: ${formatNumber(canal.roi, 1)}%`,
                  `Beneficio: ${formatCurrency(canal.beneficio)}`,
                  `CAC: ${formatCurrency(canal.cac)}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor },
            title: {
              display: true,
              text: 'ROI (%)',
              color: textColor
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: textColor }
          }
        }
      }
    });

    return () => {
      if (chartRoiInstanceRef.current) {
        chartRoiInstanceRef.current.destroy();
      }
    };
  }, [calculos.ranking]);

  // Gráfico de dispersión: Inversión vs ROI
  useEffect(() => {
    if (!chartScatterRef.current || calculos.ranking.length === 0) return;

    if (chartScatterInstanceRef.current) {
      chartScatterInstanceRef.current.destroy();
    }

    const ctx = chartScatterRef.current.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E5E5E5' : '#1A1A1A';
    const gridColor = isDark ? '#404040' : '#E5E5E5';

    // Datos para scatter
    const scatterData = calculos.ranking.map(c => ({
      x: c.inversion,
      y: c.roi,
      nombre: c.nombre,
      icono: c.icono
    }));

    chartScatterInstanceRef.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Canales',
          data: scatterData,
          backgroundColor: '#2E86AB',
          borderColor: '#48A9A6',
          borderWidth: 2,
          pointRadius: 12,
          pointHoverRadius: 16,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = context.raw as { x: number; y: number; nombre: string };
                return [
                  point.nombre,
                  `Inversión: ${formatCurrency(point.x)}`,
                  `ROI: ${formatNumber(point.y, 1)}%`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (value) => formatCurrency(value as number)
            },
            title: {
              display: true,
              text: 'Inversión (€)',
              color: textColor
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (value) => `${value}%`
            },
            title: {
              display: true,
              text: 'ROI (%)',
              color: textColor
            }
          }
        }
      }
    });

    return () => {
      if (chartScatterInstanceRef.current) {
        chartScatterInstanceRef.current.destroy();
      }
    };
  }, [calculos.ranking]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📈 Calculadora ROI Marketing</h1>
        <p className={styles.subtitle}>
          Mide la rentabilidad de tus campañas por canal. Compara Google Ads, redes sociales, email y más.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Resumen global */}
      <section className={styles.resumenGlobal}>
        <div className={styles.resumenGrid}>
          <ResultCard
            title="ROI Total"
            value={formatNumber(calculos.roiTotal, 1)}
            unit="%"
            variant={calculos.roiTotal > 100 ? 'success' : calculos.roiTotal > 0 ? 'warning' : 'default'}
            icon="📊"
            description={calculos.roiTotal > 0 ? 'Rentable' : 'Con pérdidas'}
          />
          <ResultCard
            title="Inversión Total"
            value={formatNumber(calculos.inversionTotal, 0)}
            unit="€"
            variant="default"
            icon="💸"
          />
          <ResultCard
            title="Ingresos Generados"
            value={formatNumber(calculos.ingresosTotal, 0)}
            unit="€"
            variant="info"
            icon="💰"
          />
          <ResultCard
            title="Beneficio Neto"
            value={formatNumber(calculos.beneficioTotal, 0)}
            unit="€"
            variant={calculos.beneficioTotal > 0 ? 'success' : 'warning'}
            icon={calculos.beneficioTotal > 0 ? '✅' : '⚠️'}
          />
          <ResultCard
            title="Clientes Adquiridos"
            value={formatNumber(calculos.clientesTotal, 0)}
            unit=""
            variant="default"
            icon="👥"
          />
          <ResultCard
            title="CAC Promedio"
            value={formatNumber(calculos.cacPromedio, 2)}
            unit="€"
            variant="info"
            icon="🎯"
            description="Coste por cliente"
          />
        </div>
      </section>

      {/* CLV Config */}
      <section className={styles.clvSection}>
        <div className={styles.clvCard}>
          <div className={styles.clvInfo}>
            <h3>Valor de Vida del Cliente (CLV)</h3>
            <p>¿Cuánto gasta un cliente promedio durante toda su relación contigo?</p>
          </div>
          <div className={styles.clvInput}>
            <NumberInput
              value={valorVidaCliente}
              onChange={setValorVidaCliente}
              label=""
              placeholder="500"
              suffix="€"
              helperText="Usado para calcular ratio CLV/CAC"
            />
          </div>
        </div>
      </section>

      {/* Canales */}
      <section className={styles.canalesSection}>
        <div className={styles.sectionHeader}>
          <h2>Canales de Marketing</h2>
          <button
            className={styles.btnAgregar}
            onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
          >
            + Añadir Canal
          </button>
        </div>

        {/* Form nuevo canal */}
        {mostrarFormNuevo && (
          <div className={styles.nuevoCanal}>
            <h4>Selecciona un canal:</h4>
            <div className={styles.presetsGrid}>
              {opcionesCanales.map(preset => (
                <button
                  key={preset.nombre}
                  className={`${styles.presetBtn} ${nuevoCanal.nombre === preset.nombre ? styles.presetActivo : ''}`}
                  onClick={() => seleccionarCanalPreset(preset)}
                >
                  <span>{preset.icono}</span>
                  <span>{preset.nombre}</span>
                </button>
              ))}
            </div>
            <div className={styles.nuevoCanalAcciones}>
              <button className={styles.btnConfirmar} onClick={agregarCanal} disabled={!nuevoCanal.nombre}>
                Añadir {nuevoCanal.nombre || 'canal'}
              </button>
              <button className={styles.btnCancelar} onClick={() => setMostrarFormNuevo(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de canales */}
        <div className={styles.canalesGrid}>
          {calculos.canales.map(canal => (
            <div key={canal.id} className={`${styles.canalCard} ${canal.esRentable ? styles.canalRentable : styles.canalNoRentable}`}>
              <div className={styles.canalHeader}>
                <span className={styles.canalIcono}>{canal.icono}</span>
                <h3>{canal.nombre}</h3>
                <button
                  className={styles.btnEliminar}
                  onClick={() => eliminarCanal(canal.id)}
                  title="Eliminar canal"
                >
                  ×
                </button>
              </div>

              <div className={styles.canalInputs}>
                <NumberInput
                  value={String(canal.inversion)}
                  onChange={(v) => actualizarCanal(canal.id, 'inversion', v)}
                  label="Inversión"
                  placeholder="0"
                  suffix="€"
                />
                <NumberInput
                  value={String(canal.clientes)}
                  onChange={(v) => actualizarCanal(canal.id, 'clientes', v)}
                  label="Clientes"
                  placeholder="0"
                />
                <NumberInput
                  value={canal.ingresosPorCliente}
                  onChange={(v) => actualizarCanal(canal.id, 'ingresosPorCliente', v)}
                  label="€/Cliente"
                  placeholder="0"
                  suffix="€"
                />
              </div>

              <div className={styles.canalMetricas}>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>ROI</span>
                  <span className={`${styles.metricaValor} ${canal.roi > 100 ? styles.valorExcelente : canal.roi > 0 ? styles.valorBueno : styles.valorMalo}`}>
                    {formatNumber(canal.roi, 0)}%
                  </span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>CAC</span>
                  <span className={styles.metricaValor}>{formatCurrency(canal.cac)}</span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>ROAS</span>
                  <span className={styles.metricaValor}>{formatNumber(canal.roasMultiplier, 1)}x</span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>CLV/CAC</span>
                  <span className={`${styles.metricaValor} ${canal.clvCacRatio > 3 ? styles.valorExcelente : canal.clvCacRatio > 1 ? styles.valorBueno : styles.valorMalo}`}>
                    {formatNumber(canal.clvCacRatio, 1)}
                  </span>
                </div>
              </div>

              <div className={`${styles.recomendacion} ${styles[`recomendacion${canal.recomendacion.tipo.charAt(0).toUpperCase() + canal.recomendacion.tipo.slice(1)}`]}`}>
                {canal.recomendacion.texto}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gráficos de Análisis */}
      {calculos.ranking.length > 0 && (
        <section className={styles.chartsSection}>
          <h2>📊 Análisis Visual de Canales</h2>
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3>ROI por Canal</h3>
              <p className={styles.chartDescription}>Compara el retorno de inversión de cada canal</p>
              <div className={styles.chartContainer}>
                <canvas ref={chartRoiRef}></canvas>
              </div>
              <div className={styles.chartLegend}>
                <span className={styles.legendItem}><span className={styles.legendDotExcelente}></span> Excelente (&gt;200%)</span>
                <span className={styles.legendItem}><span className={styles.legendDotBueno}></span> Bueno (&gt;100%)</span>
                <span className={styles.legendItem}><span className={styles.legendDotRegular}></span> Regular (0-100%)</span>
                <span className={styles.legendItem}><span className={styles.legendDotNegativo}></span> Negativo (&lt;0%)</span>
              </div>
            </div>
            <div className={styles.chartCard}>
              <h3>Inversión vs ROI</h3>
              <p className={styles.chartDescription}>¿Más inversión significa mejor ROI?</p>
              <div className={styles.chartContainer}>
                <canvas ref={chartScatterRef}></canvas>
              </div>
              <p className={styles.chartHint}>Los puntos en la parte superior-izquierda son los más eficientes (alto ROI con baja inversión)</p>
            </div>
          </div>
        </section>
      )}

      {/* Tabla Comparativa */}
      {calculos.ranking.length > 0 && (
        <section className={styles.tablaSection}>
          <h2>📋 Tabla Comparativa de Métricas</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Inversión</th>
                  <th>Clientes</th>
                  <th>Ingresos</th>
                  <th>Beneficio</th>
                  <th>ROI</th>
                  <th>CAC</th>
                  <th>ROAS</th>
                  <th>CLV/CAC</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {calculos.ranking.map((canal, idx) => (
                  <tr key={canal.id} className={idx === 0 ? styles.mejorFila : ''}>
                    <td>
                      <span className={styles.canalNombre}>
                        <span className={styles.canalIconoTabla}>{canal.icono}</span>
                        {canal.nombre}
                      </span>
                    </td>
                    <td>{formatCurrency(canal.inversion)}</td>
                    <td>{formatNumber(canal.clientes, 0)}</td>
                    <td>{formatCurrency(canal.ingresosTotales)}</td>
                    <td className={canal.beneficio >= 0 ? styles.valorPositivo : styles.valorNegativo}>
                      {canal.beneficio >= 0 ? '+' : ''}{formatCurrency(canal.beneficio)}
                    </td>
                    <td className={canal.roi > 100 ? styles.valorExcelente : canal.roi > 0 ? styles.valorBueno : styles.valorMalo}>
                      {formatNumber(canal.roi, 1)}%
                    </td>
                    <td>{formatCurrency(canal.cac)}</td>
                    <td>{formatNumber(canal.roasMultiplier, 2)}x</td>
                    <td className={canal.clvCacRatio > 3 ? styles.valorExcelente : canal.clvCacRatio > 1 ? styles.valorBueno : styles.valorMalo}>
                      {formatNumber(canal.clvCacRatio, 1)}
                    </td>
                    <td>
                      <span className={`${styles.estadoBadge} ${styles[`badge${canal.recomendacion.tipo.charAt(0).toUpperCase() + canal.recomendacion.tipo.slice(1)}`]}`}>
                        {canal.recomendacion.texto}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.filaTotales}>
                  <td><strong>TOTALES</strong></td>
                  <td><strong>{formatCurrency(calculos.inversionTotal)}</strong></td>
                  <td><strong>{formatNumber(calculos.clientesTotal, 0)}</strong></td>
                  <td><strong>{formatCurrency(calculos.ingresosTotal)}</strong></td>
                  <td className={calculos.beneficioTotal >= 0 ? styles.valorPositivo : styles.valorNegativo}>
                    <strong>{calculos.beneficioTotal >= 0 ? '+' : ''}{formatCurrency(calculos.beneficioTotal)}</strong>
                  </td>
                  <td className={calculos.roiTotal > 100 ? styles.valorExcelente : calculos.roiTotal > 0 ? styles.valorBueno : styles.valorMalo}>
                    <strong>{formatNumber(calculos.roiTotal, 1)}%</strong>
                  </td>
                  <td><strong>{formatCurrency(calculos.cacPromedio)}</strong></td>
                  <td>-</td>
                  <td>-</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* Ranking */}
      {calculos.ranking.length > 1 && (
        <section className={styles.rankingSection}>
          <h2>🏆 Ranking de Canales por ROI</h2>
          <div className={styles.rankingLista}>
            {calculos.ranking.map((canal, idx) => (
              <div key={canal.id} className={styles.rankingItem}>
                <span className={styles.rankingPosicion}>#{idx + 1}</span>
                <span className={styles.rankingIcono}>{canal.icono}</span>
                <span className={styles.rankingNombre}>{canal.nombre}</span>
                <span className={`${styles.rankingRoi} ${canal.roi > 100 ? styles.valorExcelente : canal.roi > 0 ? styles.valorBueno : styles.valorMalo}`}>
                  {formatNumber(canal.roi, 0)}% ROI
                </span>
                <span className={styles.rankingBeneficio}>
                  {canal.beneficio >= 0 ? '+' : ''}{formatCurrency(canal.beneficio)}
                </span>
              </div>
            ))}
          </div>

          {calculos.mejorCanal && calculos.peorCanal && calculos.mejorCanal.id !== calculos.peorCanal.id && (
            <div className={styles.insightsGrid}>
              <div className={styles.insightCard}>
                <h4>🏆 Mejor rendimiento</h4>
                <p>
                  <strong>{calculos.mejorCanal.nombre}</strong> tiene el mejor ROI ({formatNumber(calculos.mejorCanal.roi, 0)}%).
                  Considera aumentar la inversión en este canal.
                </p>
              </div>
              <div className={styles.insightCard}>
                <h4>⚠️ Necesita atención</h4>
                <p>
                  <strong>{calculos.peorCanal.nombre}</strong> tiene el ROI más bajo ({formatNumber(calculos.peorCanal.roi, 0)}%).
                  Revisa la segmentación o considera redistribuir presupuesto.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-roi-marketing"
        collapsible={true}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor las métricas de marketing?"
        subtitle="ROI, CAC, CLV, ROAS y cómo optimizar tu inversión publicitaria"
      >
        <section className={styles.guideSection}>
          <h2>Métricas Clave de Marketing Digital</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 ROI (Return on Investment)</h4>
              <p>
                <strong>Fórmula:</strong> (Ingresos - Inversión) / Inversión × 100<br /><br />
                Un ROI del 100% significa que duplicaste tu inversión. Por encima de 200% es excelente.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎯 CAC (Coste de Adquisición)</h4>
              <p>
                <strong>Fórmula:</strong> Inversión / Clientes adquiridos<br /><br />
                Cuánto te cuesta conseguir un nuevo cliente. Idealmente, CAC &lt; 1/3 del CLV.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💎 CLV (Valor de Vida del Cliente)</h4>
              <p>
                Ingresos totales que genera un cliente durante toda su relación con tu negocio.<br /><br />
                <strong>Ratio CLV/CAC ideal:</strong> &gt; 3:1
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📈 ROAS (Return on Ad Spend)</h4>
              <p>
                <strong>Fórmula:</strong> Ingresos / Inversión publicitaria<br /><br />
                ROAS de 4x significa que por cada 1€ invertido, generas 4€ en ingresos.
              </p>
            </div>
          </div>

          <h3>Benchmarks por Canal (orientativos)</h3>
          <ul className={styles.tipsList}>
            <li><strong>Google Ads (Search):</strong> ROI 200-400%, ROAS 3-5x</li>
            <li><strong>Facebook/Instagram Ads:</strong> ROI 100-300%, ROAS 2-4x</li>
            <li><strong>Email Marketing:</strong> ROI 3000-4000% (muy bajo coste)</li>
            <li><strong>SEO Orgánico:</strong> ROI variable, pero muy alto a largo plazo</li>
            <li><strong>LinkedIn Ads:</strong> ROI 50-200% (B2B, tickets altos)</li>
          </ul>
        </section>

        {/* --- SECCIÓN 2: Tabla Comparativa de Canales --- */}
        <section className={styles.eduComparativaSection}>
          <h3>📊 Comparativa de Canales de Marketing</h3>
          <p className={styles.eduComparativaSubtitle}>Benchmarks orientativos para España 2025. Los resultados reales dependen del sector, la creatividad y la optimización de cada cuenta.</p>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTablaComparativa}>
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>ROI Típico</th>
                  <th>ROAS Mínimo</th>
                  <th>CPL Medio</th>
                  <th>Mejor Para</th>
                  <th>Horizonte</th>
                  <th>Dificultad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🔍 Google Ads (Search)</td>
                  <td>200–400%</td>
                  <td>3–5x</td>
                  <td>15–80 €</td>
                  <td>Demanda activa</td>
                  <td>Inmediato</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>📱 Meta Ads (FB/IG)</td>
                  <td>100–300%</td>
                  <td>2–4x</td>
                  <td>5–40 €</td>
                  <td>Awareness + Remarketing</td>
                  <td>1–3 meses</td>
                  <td>Media-Alta</td>
                </tr>
                <tr>
                  <td>📧 Email Marketing</td>
                  <td>3.000–4.200%</td>
                  <td>–</td>
                  <td>1–5 €</td>
                  <td>Retención y fidelización</td>
                  <td>Inmediato</td>
                  <td>Baja</td>
                </tr>
                <tr>
                  <td>🌐 SEO Orgánico</td>
                  <td>500–2.000%</td>
                  <td>–</td>
                  <td>Casi 0 €</td>
                  <td>Tráfico sostenible</td>
                  <td>6–12 meses</td>
                  <td>Alta</td>
                </tr>
                <tr>
                  <td>💼 LinkedIn Ads</td>
                  <td>50–200%</td>
                  <td>2–3x</td>
                  <td>40–150 €</td>
                  <td>B2B, decisores</td>
                  <td>3–6 meses</td>
                  <td>Alta</td>
                </tr>
                <tr>
                  <td>🎵 TikTok Ads</td>
                  <td>80–250%</td>
                  <td>2–4x</td>
                  <td>3–20 €</td>
                  <td>Público joven, productos virales</td>
                  <td>1–2 meses</td>
                  <td>Media</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* --- SECCIÓN 3: Casos de Uso por Tipo de Negocio --- */}
        <section className={styles.eduEscenariosSection}>
          <h3>💼 Casos de Uso por Tipo de Negocio</h3>
          <p className={styles.eduEscenariosSubtitle}>Estrategias reales adaptadas a diferentes modelos de negocio en el mercado español.</p>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🛒</span>
                <h4>Ecommerce — Moda</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                Inversión: 2.000 €/mes entre Google Shopping (50%), Meta Ads (30%) y Email (20%). CLV medio: 280 €. CAC objetivo máximo: 35 €. ROAS mínimo rentable: 3,5x.
              </p>
              <p className={styles.eduEscenarioTip}>💡 Email Marketing da el mayor ROI: cuida tu lista como un activo estratégico.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>💻</span>
                <h4>SaaS B2B — Software</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                Inversión: 5.000 €/mes en LinkedIn Ads (40%), Google Search (40%) y SEO/Contenidos (20%). CLV medio: 4.800 €/año. CAC objetivo: hasta 600 €. Ciclo de venta: 30–90 días.
              </p>
              <p className={styles.eduEscenarioTip}>💡 Ratio CLV/CAC de 8:1 justifica un CAC elevado. No optimices solo para CPL bajo.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🏠</span>
                <h4>Negocio Local — Clínica</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                Inversión: 800 €/mes en Google Ads Local (60%) y Meta Local (40%). Ticket medio primera cita: 90 €. CLV recurrente: 1.200 €. CAC máximo permitido: 120 €.
              </p>
              <p className={styles.eduEscenarioTip}>💡 Usa extensiones de llamada y ubicación. El 70% de los clics locales son desde móvil.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🎓</span>
                <h4>Infoproductos — Cursos Online</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                Inversión: 3.000 €/mes en Meta Ads (60%), Email a lista propia (20%) y YouTube orgánico (20%). Precio producto: 497 €. CAC objetivo: 80–120 €. ROI objetivo: 300–500%.
              </p>
              <p className={styles.eduEscenarioTip}>💡 El webinar como embudo convierte 3–5x más que la venta directa desde anuncio.</p>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 4: FAQ Avanzado --- */}
        <section className={styles.eduFaqSection}>
          <h3>❓ Preguntas Frecuentes sobre ROI en Marketing</h3>
          <p className={styles.eduFaqSubtitle}>Respuestas a las dudas más habituales al analizar la rentabilidad de tus campañas.</p>
          <div className={styles.eduFaqList}>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuál es el ROAS mínimo para que una campaña sea rentable?</h4>
              <p>Depende de tu margen bruto. Si vendes con un margen del 30%, necesitas ROAS ≥ 3,33x para cubrir costes. Fórmula: ROAS mínimo = 1 / Margen bruto. Por debajo de ese umbral, cada venta genera pérdida.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuándo debería pausar un canal con ROI negativo?</h4>
              <p>Antes de pausar, analiza si el canal está en fase de aprendizaje (primeras 2–4 semanas), si el problema es creativo o de segmentación, y si tiene valor de marca no medido. Pausa si tras 60 días optimizando el ROI sigue negativo.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo afecta la atribución multicanal al ROI calculado?</h4>
              <p>La atribución al último clic sobrevalora al canal que cierra la venta (normalmente Search) y subvalora al que genera conciencia (Display, Social). Usa modelos de atribución basados en datos o lineal en GA4 para una visión más justa.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Qué CAC es razonable para mi sector?</h4>
              <p>La regla general es CAC ≤ 1/3 del CLV (ratio CLV/CAC ≥ 3:1). En ecommerce: 20–80 €. En SaaS B2B: 500–3.000 €. En seguros: 100–300 €. En inmobiliaria: 500–2.000 €. En servicios locales: 30–150 €.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuál es la diferencia entre ROI y ROAS?</h4>
              <p>ROI incluye todos los costes (producción, personal, herramientas, plataforma) y mide el beneficio real. ROAS solo divide ingresos entre gasto en plataforma publicitaria. Un ROAS de 5x puede tener ROI negativo si los costes operativos son altos.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo calcular el CLV si tengo clientes de larga duración?</h4>
              <p>CLV = Ticket medio × Frecuencia anual × Años de retención media. Ejemplo: 80 € × 4 compras/año × 3 años = 960 €. Alternativa: CLV = Margen bruto anual por cliente / Tasa de churn anual.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Debo incluir el coste de la agencia en la inversión?</h4>
              <p>Sí, siempre. Un ROI calculado sin incluir fees de agencia o coste de gestión interna está inflado artificialmente. El coste real incluye: inversión en plataforma + gestión + creatividades + herramientas de analítica.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cada cuánto revisar el ROI por canal?</h4>
              <p>Micro-optimizaciones: diariamente o 3 veces/semana. Decisiones estratégicas (pausar/escalar): mensualmente, con al menos 30 días de datos y 100+ conversiones por canal para significancia estadística.</p>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 5: Guía Paso a Paso --- */}
        <section className={styles.eduStepSection}>
          <h3>🗺️ Guía: Cómo Optimizar tu Mix de Marketing en 7 Pasos</h3>
          <p className={styles.eduStepSubtitle}>Proceso sistemático para redistribuir presupuesto y maximizar el ROI global de todos tus canales.</p>
          <div className={styles.eduStepGuide}>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>1</span>
              <div className={styles.eduStepContent}>
                <h4>Audita tus canales actuales</h4>
                <p>Introduce en la calculadora los datos reales de los últimos 90 días de cada canal. Usa datos completos: incluye gastos de gestión, herramientas y producción de creatividades.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>2</span>
              <div className={styles.eduStepContent}>
                <h4>Calcula tu CLV real</h4>
                <p>No uses el precio de primera compra. Analiza cuánto gasta un cliente durante 12–36 meses. Segmenta por canal de adquisición: los clientes de SEO suelen tener mayor LTV que los de Social Ads.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>3</span>
              <div className={styles.eduStepContent}>
                <h4>Fija tu CAC máximo por canal</h4>
                <p>Define el CAC máximo que puedes permitirte según el CLV esperado. Los canales con CLV alto (B2B, clientes recurrentes) admiten un CAC mayor que los transaccionales de ticket bajo.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>4</span>
              <div className={styles.eduStepContent}>
                <h4>Identifica el canal con mejor ratio CLV/CAC</h4>
                <p>Es tu candidato a escalar primero. Antes de escalar, verifica que el CAC no se dispara al aumentar presupuesto (efecto de saturación de audiencia).</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>5</span>
              <div className={styles.eduStepContent}>
                <h4>Redistribuye presupuesto hacia los canales ganadores</h4>
                <p>Reasigna entre un 20–40% del presupuesto de canales con ROI bajo hacia los de mayor ROI. Hazlo gradualmente: los algoritmos de las plataformas necesitan tiempo de reaprendizaje.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>6</span>
              <div className={styles.eduStepContent}>
                <h4>Mantén siempre un canal de demanda orgánica</h4>
                <p>SEO y Email Marketing son activos propios: no dependes de plataformas terceras ni de subidas de CPC. Destina al menos un 20% del presupuesto a canales propios.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>7</span>
              <div className={styles.eduStepContent}>
                <h4>Revisa el mix mensualmente, no el canal individualmente</h4>
                <p>El marketing multicanal tiene efectos sinérgicos: un lead de LinkedIn puede convertir después de un anuncio de remarketing de Meta. Evalúa el ROI global del mix, no solo canal a canal.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 6: Mejores Prácticas --- */}
        <section className={styles.eduTipsSection}>
          <h3>⚡ 6 Reglas del Marketing Rentable</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📏</span>
              <h4>Mide conversiones, no clics</h4>
              <p>El CTR alto con conversión baja es ruido. Configura Google Analytics 4 y los píxeles de conversión correctamente antes de lanzar cualquier campaña.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🎯</span>
              <h4>Define el CAC máximo antes de gastar</h4>
              <p>Sin un CAC máximo definido, optimizarás por volumen de clientes en lugar de por rentabilidad. Tu CAC máximo = CLV × Margen objetivo / Periodo de recuperación.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🔄</span>
              <h4>El remarketing tiene el mejor ROI</h4>
              <p>Las audiencias que ya conocen tu marca convierten 3–7x más que el tráfico frío. Destina al menos el 20% del presupuesto en Social y Display a remarketing.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📧</span>
              <h4>Email es el canal con mayor ROI</h4>
              <p>Con ROI medio de 3.500–4.200%, el email supera a todos los canales de pago. Una lista de email de calidad es el mejor activo de marketing a largo plazo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>⏳</span>
              <h4>Respeta el periodo de aprendizaje</h4>
              <p>Los algoritmos de Meta y Google necesitan 50–100 conversiones para optimizar bien. No realices cambios bruscos en los primeros 7–14 días de una campaña nueva.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🌱</span>
              <h4>Diversifica sin dispersar</h4>
              <p>2–3 canales bien trabajados dan mejores resultados que 8 canales mal optimizados. Domina un canal antes de añadir el siguiente. La dispersión destruye el ROI.</p>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 7: Warning Box --- */}
        <section className={styles.eduWarningBox}>
          <div className={styles.eduWarningHeader}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <h3>Errores que Destruyen el ROI de tus Campañas</h3>
          </div>
          <ul className={styles.eduWarningList}>
            <li>
              <span>🔴</span>
              <span><strong>Optimizar solo para el último clic.</strong> El canal que cierra la venta recibe todo el crédito, aunque el usuario te conoció por otro canal. Usa atribución basada en datos en GA4.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>Ignorar el coste total de gestión.</strong> Una agencia cobra 1.500 €/mes por gestionar 3.000 € en plataformas. Tu ROI real es sobre 4.500 €, no sobre 3.000 €. Incluye siempre todos los costes.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>Pausar campañas en el período de aprendizaje.</strong> Pausar o modificar campañas en las primeras 2 semanas reinicia el aprendizaje del algoritmo. Da tiempo antes de tomar decisiones.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>No segmentar por canal de adquisición en CRM.</strong> Sin saber qué canal genera clientes con mayor CLV, redistribuirás el presupuesto por volumen y no por rentabilidad real a largo plazo.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>Usar el presupuesto de marketing como colchón de emergencia.</strong> Cuando las ventas bajan, recortar marketing reduce las ventas aún más. El presupuesto debe ser fijo y planificado anualmente.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>Confundir ROAS con ROI.</strong> Un ROAS de 6x con costes de gestión y producción del 40% puede tener un ROI del 20%. Calcula siempre el ROI incluyendo todos los costes asociados.</span>
            </li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-roi-marketing')} />

      <ShareCard appName="calculadora-roi-marketing" />
      <Footer appName="calculadora-roi-marketing" />
    </div>
  );
}
