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
        defaultOpen={false}
      >
        {/* 1. Tabla comparativa */}
        <div className={styles.eduComparativa}>
          <h2>ROI típico por canal de marketing digital en España</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr><th>Canal</th><th>ROI medio</th><th>Plazo resultados</th><th>Inversión mínima</th><th>Mejor para</th></tr>
              </thead>
              <tbody>
                <tr><td>Email marketing</td><td>3.600–4.200%</td><td>Inmediato (1–7 días)</td><td>Baja (herramienta + tiempo)</td><td>Retención, fidelización, e-commerce</td></tr>
                <tr><td>SEO / Contenido</td><td>300–1.200%</td><td>Largo plazo (6–18 meses)</td><td>Media (contenido + técnico)</td><td>Generación de leads orgánicos</td></tr>
                <tr><td>Google Ads (SEM)</td><td>200–800%</td><td>Inmediato (días)</td><td>Media-Alta (CPC competitivo)</td><td>Captura demanda existente</td></tr>
                <tr><td>Redes sociales (orgánico)</td><td>50–300%</td><td>Medio plazo (3–6 meses)</td><td>Baja (tiempo y creatividad)</td><td>Branding, comunidad, top of mind</td></tr>
                <tr><td>Influencer marketing</td><td>500–1.100%</td><td>Medio plazo (1–3 meses)</td><td>Variable (micro a macro)</td><td>Awareness, lanzamiento de producto</td></tr>
                <tr><td>Meta Ads (Facebook/Instagram)</td><td>150–600%</td><td>Corto plazo (1–4 semanas)</td><td>Media (creative + budget)</td><td>E-commerce, generación de leads</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Escenarios */}
        <div className={styles.eduEscenarios}>
          <h2>Ejemplos reales de ROI por tipo de negocio</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🛒</span><h3>E-commerce de moda</h3></div>
              <p className={styles.escenarioExample}>Inversión 2.000 € en Meta Ads. Ventas generadas: 8.500 €. Coste producto: 4.000 €. Margen bruto: 4.500 €. ROI = (4.500 − 2.000) / 2.000 × 100 = 125%. ROAS = 4,25x.</p>
              <span className={styles.escenarioTip}>ROAS mínimo viable para e-commerce: 3x</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏢</span><h3>B2B SaaS — Google Ads</h3></div>
              <p className={styles.escenarioExample}>Inversión 5.000 €/mes. 20 leads cualificados. 3 cierres a 1.200 €/año (LTV 3 años = 3.600 €). Ingresos generados: 10.800 €. ROI = 116%. CAC = 1.667 €, LTV/CAC = 2,16x.</p>
              <span className={styles.escenarioTip}>LTV/CAC ratio saludable: &gt; 3x</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>📧</span><h3>Campaña de email reactivación</h3></div>
              <p className={styles.escenarioExample}>Base 10.000 contactos inactivos. Coste campaña: 200 €. Tasa apertura 18%, click 4%, conversión 2% = 200 ventas a 45 € = 9.000 €. ROI = 4.400%. El canal más rentable.</p>
              <span className={styles.escenarioTip}>Email a base propia: el ROI más alto del marketing</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>📱</span><h3>Influencer micro en Instagram</h3></div>
              <p className={styles.escenarioExample}>Micro-influencer 15K seguidores nicho fitness: 500 €. Código descuento rastreable: 45 ventas a 35 € = 1.575 €. ROI = 215%. Mejor engagement que macro-influencers.</p>
              <span className={styles.escenarioTip}>Micro-influencers: mayor engagement, menor coste</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>📝</span><h3>Blog corporativo + SEO</h3></div>
              <p className={styles.escenarioExample}>Inversión 12 meses: 8.000 € (redactor + SEO técnico). Mes 18: 2.000 visitas orgánicas/mes. 40 leads/mes × 15% cierre × 800 € ticket = 4.800 €/mes. ROI acumulado año 2: 628%.</p>
              <span className={styles.escenarioTip}>SEO: bajo ROI año 1, exponencial del año 2</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🎯</span><h3>Campaña retargeting e-commerce</h3></div>
              <p className={styles.escenarioExample}>Audiencia: carritos abandonados (1.200 usuarios/mes). Inversión retargeting: 400 €. Recuperación: 8% = 96 ventas a 65 € = 6.240 €. ROI = 1.460%. El retargeting: ROI más alto en paid media.</p>
              <span className={styles.escenarioTip}>Retargeting: siempre antes que prospección fría</span>
            </div>
          </div>
        </div>

        {/* 3. FAQ */}
        <div className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre ROI en marketing</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}><h4>¿Cuál es un buen ROI en marketing?</h4><p>Depende del canal y sector. Como referencia general: ROI positivo (&gt;0%) significa que la campaña es rentable. Por encima del 200–300% se considera bueno. Email marketing suele superar el 3.600%. En paid media, un ROAS de 4x (400% de retorno) es el objetivo mínimo para muchos e-commerce.</p></div>
            <div className={styles.faqItem}><h4>¿Diferencia entre ROI y ROAS?</h4><p>ROAS (Return on Ad Spend) mide ingresos totales generados divididos entre el gasto en publicidad, sin restar costes. ROI mide el beneficio neto (ingresos − todos los costes) sobre la inversión. ROAS = 4x puede significar ROI negativo si los márgenes son bajos. El ROI es la métrica más completa.</p></div>
            <div className={styles.faqItem}><h4>¿Cómo atribuir ventas a una campaña de marketing?</h4><p>Los modelos de atribución más usados: último clic (simplista), primer clic (branding), lineal (distribuye igual entre touchpoints) y data-driven (IA). La realidad es que el customer journey es multicanal; un cliente ve un anuncio en Instagram, busca en Google y compra por email. Ningún modelo es perfecto.</p></div>
            <div className={styles.faqItem}><h4>¿Qué costes debo incluir en el cálculo del ROI?</h4><p>Inversión directa en medios + coste de producción de creatividades + tiempo interno del equipo (a tarifa hora) + herramientas y software de marketing + coste de la agencia si aplica. Muchas empresas solo cuentan el gasto en plataformas y sobreestiman el ROI real.</p></div>
            <div className={styles.faqItem}><h4>¿Cuándo debo parar una campaña con ROI negativo?</h4><p>Depende del objetivo y el plazo. Si es campaña de performance (ventas directas) y ROI negativo tras 4–6 semanas de optimización: parar o pivotar. Si es campaña de branding o SEO, el ROI negativo a corto plazo puede ser normal; evalúa a 6–12 meses. Siempre define el plazo de evaluación antes de lanzar.</p></div>
            <div className={styles.faqItem}><h4>¿Cómo calcular el LTV (Lifetime Value) de un cliente?</h4><p>LTV = Ticket medio × Frecuencia de compra anual × Años de retención media. Ejemplo: 50 € × 4 veces/año × 3 años = 600 € LTV. Con este dato puedes calcular cuánto puedes gastar en captar un cliente (CAC) manteniendo la rentabilidad. Regla práctica: LTV/CAC &gt; 3.</p></div>
            <div className={styles.faqItem}><h4>¿El ROI de las redes sociales es medible?</h4><p>Difícilmente de forma directa en orgánico. El contenido orgánico construye marca, confianza y comunidad — activos difíciles de monetizar a corto plazo. Usa métricas proxy: tráfico referido, leads desde RRSS, brand searches. En paid (Meta Ads, TikTok Ads) sí hay atribución directa aunque imperfecta.</p></div>
            <div className={styles.faqItem}><h4>¿Qué ROI mínimo necesito para que una campaña tenga sentido?</h4><p>El ROI mínimo viable depende de tu margen bruto. Si tu margen es del 40%, necesitas al menos ROI del 150% para cubrir costes fijos y ser rentable. Una calculadora de punto de equilibrio (break-even) de ROI te da el umbral exacto según tu estructura de costes.</p></div>
          </div>
        </div>

        {/* 4. Guía paso a paso */}
        <div className={styles.eduGuia}>
          <h2>Cómo calcular y mejorar el ROI de tus campañas en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.eduStep}><div className={styles.stepNumber}>1</div><div className={styles.stepContent}><strong>Define el objetivo y la métrica de conversión</strong><p>Antes de invertir, define qué cuenta como conversión: venta, lead, descarga, suscripción. Sin una conversión clara, el ROI es imposible de calcular. Usa Google Analytics 4 o el píxel de Meta para rastrear cada conversión.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>2</div><div className={styles.stepContent}><strong>Calcula el valor real de cada conversión</strong><p>Para ventas directas es fácil (precio − coste). Para leads, multiplica: tasa de cierre × ticket medio × LTV. Este valor de conversión es lo máximo que puedes pagar por adquirir un cliente (CAC máximo sostenible).</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>3</div><div className={styles.stepContent}><strong>Registra TODOS los costes de la campaña</strong><p>Presupuesto en plataformas + producción de anuncios + tiempo del equipo (horas × tarifa) + herramientas + agencia. El error más común es olvidar el tiempo interno, que puede representar el 30–50% del coste real.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>4</div><div className={styles.stepContent}><strong>Implementa el tracking correctamente antes de lanzar</strong><p>Verifica que los píxeles, UTMs y eventos de conversión funcionan antes de gastar. Una campaña perfecta con tracking roto = ROI incalculable. Usa Google Tag Manager para centralizar el tracking.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>5</div><div className={styles.stepContent}><strong>Lanza, mide y optimiza en ciclos cortos</strong><p>Primeras 2 semanas: fase de aprendizaje (no optimices todavía, deja que los algoritmos aprendan). Semana 3–4: analiza resultados y ajusta creatividades, audiencias y pujas. Toma decisiones con datos, no con intuición.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>6</div><div className={styles.stepContent}><strong>Calcula el ROI con margen bruto, no ingresos brutos</strong><p>ROI = (Ingresos generados − Coste del producto/servicio − Inversión en marketing) / Inversión en marketing × 100. Usar ingresos brutos sin restar costes de producto infla el ROI y lleva a decisiones erróneas.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>7</div><div className={styles.stepContent}><strong>Compara entre canales y redistribuye el presupuesto</strong><p>Cada trimestre, compara el ROI por canal. Incrementa presupuesto en los de mayor ROI, reduce en los de menor rendimiento. El marketing de mayor ROI no es el más vistoso, sino el que genera más beneficio por euro invertido.</p></div></div>
          </div>
        </div>

        {/* 5. Tips */}
        <div className={styles.eduTips}>
          <h2>Claves para maximizar el ROI de tus campañas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🎯</span><strong>Retargeting primero</strong><p>El retargeting a audiencias calientes (visitantes web, carritos abandonados) siempre tiene mejor ROI que la prospección fría. Empieza por ahí antes de escalar a nuevas audiencias.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📧</span><strong>Invierte en tu base de email</strong><p>La lista de email propia es el activo de marketing más rentable: no depende de algoritmos, no tienes que pagar por cada impacto y el ROI medio supera el 3.600%.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🧪</span><strong>A/B testing continuo</strong><p>Prueba un elemento a la vez (titular, imagen, CTA, audiencia). Una mejora del 20% en tasa de conversión duplica el ROI sin aumentar el presupuesto.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📊</span><strong>Mide el LTV, no solo la primera compra</strong><p>Una campaña con ROI negativo en la primera compra puede ser rentable si el LTV es alto. Los negocios con suscripciones o compras recurrentes deben evaluar el ROI a 12–24 meses.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🔄</span><strong>Optimiza la página de destino</strong><p>El 50% del ROI depende de la landing page, no del anuncio. Un anuncio mediocre a una landing excelente supera a un anuncio perfecto con landing deficiente.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>⏱️</span><strong>Define el horizonte temporal antes de evaluar</strong><p>SEO y content marketing tienen ROI negativo los primeros 6 meses. Evaluar demasiado pronto lleva a cancelar estrategias que serían muy rentables a largo plazo.</p></div>
          </div>
        </div>

        {/* 6. Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores críticos al calcular y optimizar el ROI de marketing</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Calcular el ROI sobre ingresos brutos sin restar el coste del producto — puede convertir una campaña perdedora en aparentemente rentable</li>
            <li>No incluir el tiempo del equipo en los costes — en muchas pymes, es el mayor coste de marketing y se ignora sistemáticamente</li>
            <li>Medir el ROI solo a corto plazo para canales de construcción (SEO, contenido, branding) — lleva a abandonar estrategias antes de que maduren</li>
            <li>Atribuir toda la venta al último clic — ignora el papel del resto de touchpoints y penaliza injustamente canales de awareness</li>
            <li>Escalar presupuesto sin mejorar primero la tasa de conversión — multiplicar la inversión en un funnel con conversión baja solo amplifica las pérdidas</li>
            <li>No tener tracking correcto antes de lanzar — sin datos fiables de conversión, cualquier decisión de optimización es un salto al vacío</li>
            <li>Comparar ROAS entre canales distintos sin ajustar por margen — un ROAS de 4x en moda (margen 70%) es mejor que 6x en electrónica (margen 15%)</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-roi-marketing')} />

      <ShareCard appName="calculadora-roi-marketing" />
      <Footer appName="calculadora-roi-marketing" />
    </div>
  );
}
