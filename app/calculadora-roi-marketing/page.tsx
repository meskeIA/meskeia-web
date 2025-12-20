'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './CalculadoraROIMarketing.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps} from '@/components';
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
                  value={canal.inversion}
                  onChange={(v) => actualizarCanal(canal.id, 'inversion', v)}
                  label="Inversión"
                  placeholder="0"
                  suffix="€"
                />
                <NumberInput
                  value={canal.clientes}
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

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona métricas simplificadas de ROI de marketing.
          El rendimiento real puede variar según el modelo de atribución, ciclo de venta y otros factores.
          <strong> Usa estas métricas como guía, no como única fuente de decisión.</strong>
        </p>
      </div>

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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-roi-marketing')} />

      <Footer appName="calculadora-roi-marketing" />
    </div>
  );
}
