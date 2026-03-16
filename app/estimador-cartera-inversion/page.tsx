'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './EstimadorCartera.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency } from '@/lib';
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
import { Line } from 'react-chartjs-2';

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

// ============ TIPOS ============

interface AssetClass {
  id: string;
  nombre: string;
  rentabilidadMedia: number; // Anual esperada
  volatilidad: number; // Desviación estándar anual
  color: string;
  descripcion: string;
}

interface CarteraConfig {
  rv: number; // Renta Variable %
  rf: number; // Renta Fija %
  liq: number; // Liquidez %
  alt: number; // Alternativos %
}

interface SimulacionResultado {
  años: number[];
  percentil10: number[];
  percentil25: number[];
  percentil50: number[];
  percentil75: number[];
  percentil90: number[];
  escenarios: number[][]; // Todos los escenarios para análisis
}

interface MetricasCartera {
  rentabilidadEsperada: number;
  volatilidadCartera: number;
  sharpeRatio: number;
  maxDrawdownEsperado: number;
  probabilidadObjetivo: number;
  capitalFinalMediano: number;
  capitalFinalPeor: number;
  capitalFinalMejor: number;
}

// ============ CONSTANTES ============

const ASSET_CLASSES: AssetClass[] = [
  {
    id: 'rv',
    nombre: 'Renta Variable',
    rentabilidadMedia: 0.07, // 7% anual
    volatilidad: 0.16, // 16% desviación
    color: '#2E86AB',
    descripcion: 'Acciones globales (MSCI World)',
  },
  {
    id: 'rf',
    nombre: 'Renta Fija',
    rentabilidadMedia: 0.03, // 3% anual
    volatilidad: 0.05, // 5% desviación
    color: '#48A9A6',
    descripcion: 'Bonos gubernamentales y corporativos',
  },
  {
    id: 'liq',
    nombre: 'Liquidez',
    rentabilidadMedia: 0.015, // 1.5% anual
    volatilidad: 0.005, // 0.5% desviación
    color: '#10B981',
    descripcion: 'Fondos monetarios y depósitos',
  },
  {
    id: 'alt',
    nombre: 'Alternativos',
    rentabilidadMedia: 0.05, // 5% anual
    volatilidad: 0.12, // 12% desviación
    color: '#F59E0B',
    descripcion: 'REITs, materias primas, oro',
  },
];

const PERFILES_PREDEFINIDOS: Record<string, { nombre: string; cartera: CarteraConfig }> = {
  conservador: { nombre: 'Conservador', cartera: { rv: 15, rf: 60, liq: 20, alt: 5 } },
  moderado: { nombre: 'Moderado', cartera: { rv: 30, rf: 50, liq: 15, alt: 5 } },
  equilibrado: { nombre: 'Equilibrado', cartera: { rv: 50, rf: 35, liq: 10, alt: 5 } },
  dinamico: { nombre: 'Dinámico', cartera: { rv: 70, rf: 20, liq: 5, alt: 5 } },
  agresivo: { nombre: 'Agresivo', cartera: { rv: 90, rf: 5, liq: 0, alt: 5 } },
};

const NUM_SIMULACIONES = 1000;
const TASA_LIBRE_RIESGO = 0.02; // 2% para cálculo Sharpe

// ============ FUNCIONES DE SIMULACIÓN ============

// Generador de números aleatorios con distribución normal (Box-Muller)
function randomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Calcular rentabilidad y volatilidad de la cartera
function calcularParametrosCartera(cartera: CarteraConfig): { rentabilidad: number; volatilidad: number } {
  const pesos = [cartera.rv / 100, cartera.rf / 100, cartera.liq / 100, cartera.alt / 100];

  // Rentabilidad ponderada
  let rentabilidad = 0;
  ASSET_CLASSES.forEach((asset, i) => {
    rentabilidad += pesos[i] * asset.rentabilidadMedia;
  });

  // Volatilidad con matriz de correlaciones simplificada (Markowitz)
  // σ_p² = Σ w_i²·σ_i² + 2·Σ_{i<j} w_i·w_j·σ_i·σ_j·ρ_ij
  // Correlaciones aproximadas: RV-RF=0.25, RV-LIQ=0.1, RV-ALT=0.4, RF-LIQ=0.05, RF-ALT=0.15, LIQ-ALT=0.05
  const correlaciones = [
    [1.00, 0.25, 0.10, 0.40],
    [0.25, 1.00, 0.05, 0.15],
    [0.10, 0.05, 1.00, 0.05],
    [0.40, 0.15, 0.05, 1.00],
  ];
  let varianza = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      varianza += pesos[i] * pesos[j] * ASSET_CLASSES[i].volatilidad * ASSET_CLASSES[j].volatilidad * correlaciones[i][j];
    }
  }

  return {
    rentabilidad,
    volatilidad: Math.sqrt(varianza),
  };
}

// Simulación Monte Carlo
function simularCartera(
  capitalInicial: number,
  aportacionMensual: number,
  años: number,
  cartera: CarteraConfig,
  inflacion: number
): SimulacionResultado {
  const { rentabilidad, volatilidad } = calcularParametrosCartera(cartera);
  const rentabilidadReal = rentabilidad - inflacion;

  const escenarios: number[][] = [];
  const meses = años * 12;

  // Generar N simulaciones
  for (let sim = 0; sim < NUM_SIMULACIONES; sim++) {
    const evolucion: number[] = [capitalInicial];
    let capital = capitalInicial;

    for (let mes = 1; mes <= meses; mes++) {
      // Rentabilidad mensual con variación aleatoria
      const rentabilidadMensual = rentabilidadReal / 12;
      const volatilidadMensual = volatilidad / Math.sqrt(12);
      const retornoMensual = rentabilidadMensual + volatilidadMensual * randomNormal();

      capital = capital * (1 + retornoMensual) + aportacionMensual;

      // Guardar solo valores anuales para el gráfico
      if (mes % 12 === 0) {
        evolucion.push(Math.max(0, capital));
      }
    }

    escenarios.push(evolucion);
  }

  // Calcular percentiles por año
  const añosArray = Array.from({ length: años + 1 }, (_, i) => i);
  const percentil10: number[] = [];
  const percentil25: number[] = [];
  const percentil50: number[] = [];
  const percentil75: number[] = [];
  const percentil90: number[] = [];

  for (let año = 0; año <= años; año++) {
    const valoresAño = escenarios.map(e => e[año]).sort((a, b) => a - b);
    percentil10.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.10)]);
    percentil25.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.25)]);
    percentil50.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.50)]);
    percentil75.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.75)]);
    percentil90.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.90)]);
  }

  return {
    años: añosArray,
    percentil10,
    percentil25,
    percentil50,
    percentil75,
    percentil90,
    escenarios,
  };
}

// Calcular métricas de la cartera
function calcularMetricas(
  resultado: SimulacionResultado,
  cartera: CarteraConfig,
  objetivo: number
): MetricasCartera {
  const { rentabilidad, volatilidad } = calcularParametrosCartera(cartera);
  const sharpe = (rentabilidad - TASA_LIBRE_RIESGO) / volatilidad;

  // Max Drawdown esperado (aproximación empírica)
  const maxDrawdownEsperado = volatilidad * 2.5; // Regla empírica

  // Probabilidad de alcanzar objetivo
  const valoresFinales = resultado.escenarios.map(e => e[e.length - 1]);
  const exitosos = valoresFinales.filter(v => v >= objetivo).length;
  const probabilidad = (exitosos / NUM_SIMULACIONES) * 100;

  // Valores finales
  const ordenados = [...valoresFinales].sort((a, b) => a - b);

  return {
    rentabilidadEsperada: rentabilidad * 100,
    volatilidadCartera: volatilidad * 100,
    sharpeRatio: sharpe,
    maxDrawdownEsperado: maxDrawdownEsperado * 100,
    probabilidadObjetivo: probabilidad,
    capitalFinalMediano: ordenados[Math.floor(NUM_SIMULACIONES * 0.50)],
    capitalFinalPeor: ordenados[Math.floor(NUM_SIMULACIONES * 0.05)],
    capitalFinalMejor: ordenados[Math.floor(NUM_SIMULACIONES * 0.95)],
  };
}

// ============ COMPONENTE PRINCIPAL ============

export default function SimuladorCarteraPage() {
  const searchParams = useSearchParams();
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Cargar perfil desde URL si viene del test
  const perfilURL = searchParams.get('perfil');
  const perfilInicial = perfilURL && PERFILES_PREDEFINIDOS[perfilURL]
    ? PERFILES_PREDEFINIDOS[perfilURL].cartera
    : { rv: 50, rf: 35, liq: 10, alt: 5 };

  // Estado de configuración
  const [capitalInicial, setCapitalInicial] = useState(10000);
  const [aportacionMensual, setAportacionMensual] = useState(200);
  const [años, setAños] = useState(20);
  const [inflacion, setInflacion] = useState(2);
  const [objetivo, setObjetivo] = useState(100000);
  const [cartera, setCartera] = useState<CarteraConfig>(perfilInicial);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<string>(perfilURL || '');

  // Estado de resultados
  const [resultado, setResultado] = useState<SimulacionResultado | null>(null);
  const [metricas, setMetricas] = useState<MetricasCartera | null>(null);
  const [simulando, setSimulando] = useState(false);

  // Actualizar cartera al seleccionar perfil
  const handlePerfilChange = (perfil: string) => {
    setPerfilSeleccionado(perfil);
    if (perfil && PERFILES_PREDEFINIDOS[perfil]) {
      setCartera(PERFILES_PREDEFINIDOS[perfil].cartera);
    }
  };

  // Actualizar peso de un activo
  const handlePesoChange = (activo: keyof CarteraConfig, valor: number) => {
    setPerfilSeleccionado(''); // Deseleccionar perfil predefinido
    setCartera(prev => ({ ...prev, [activo]: valor }));
  };

  // Normalizar pesos para que sumen 100
  const normalizarPesos = useCallback(() => {
    const total = cartera.rv + cartera.rf + cartera.liq + cartera.alt;
    if (total === 0) {
      setCartera({ rv: 25, rf: 25, liq: 25, alt: 25 });
    } else if (total !== 100) {
      const factor = 100 / total;
      setCartera({
        rv: Math.round(cartera.rv * factor),
        rf: Math.round(cartera.rf * factor),
        liq: Math.round(cartera.liq * factor),
        alt: Math.round(cartera.alt * factor),
      });
    }
  }, [cartera]);

  // Ejecutar simulación
  const ejecutarSimulacion = useCallback(() => {
    setSimulando(true);

    // Usar setTimeout para no bloquear UI
    setTimeout(() => {
      const res = simularCartera(
        capitalInicial,
        aportacionMensual,
        años,
        cartera,
        inflacion / 100
      );
      setResultado(res);

      const met = calcularMetricas(res, cartera, objetivo);
      setMetricas(met);

      setSimulando(false);
    }, 100);
  }, [capitalInicial, aportacionMensual, años, cartera, inflacion, objetivo]);

  // Total de pesos
  const totalPesos = cartera.rv + cartera.rf + cartera.liq + cartera.alt;

  // Datos para el gráfico
  const chartData = useMemo(() => {
    if (!resultado) return null;

    return {
      labels: resultado.años.map(a => `Año ${a}`),
      datasets: [
        {
          label: 'Percentil 90 (Optimista)',
          data: resultado.percentil90,
          borderColor: 'rgba(16, 185, 129, 0.8)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [5, 5],
        },
        {
          label: 'Percentil 75',
          data: resultado.percentil75,
          borderColor: 'rgba(72, 169, 166, 0.6)',
          backgroundColor: 'rgba(72, 169, 166, 0.15)',
          fill: '+1',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Mediana (Esperado)',
          data: resultado.percentil50,
          borderColor: '#2E86AB',
          backgroundColor: 'rgba(46, 134, 171, 0.2)',
          fill: false,
          tension: 0.3,
          pointRadius: 2,
          borderWidth: 3,
        },
        {
          label: 'Percentil 25',
          data: resultado.percentil25,
          borderColor: 'rgba(245, 158, 11, 0.6)',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          fill: '-1',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Percentil 10 (Pesimista)',
          data: resultado.percentil10,
          borderColor: 'rgba(239, 68, 68, 0.8)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [5, 5],
        },
      ],
    };
  }, [resultado]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: { dataset: { label: string }; parsed: { y: number } }) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estimador de Cartera de Inversión</h1>
        <p className={styles.subtitle}>
          Proyecta la evolución de tu patrimonio con simulación Monte Carlo
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Banner si viene del test */}
      {perfilURL && PERFILES_PREDEFINIDOS[perfilURL] && (
        <div className={styles.perfilBanner}>
          <span className={styles.perfilBannerIcon}>🎯</span>
          <span>
            Simulando con tu perfil <strong>{PERFILES_PREDEFINIDOS[perfilURL].nombre}</strong> del test
          </span>
          <Link href="/test-perfil-inversor/" className={styles.perfilBannerLink}>
            Repetir test →
          </Link>
        </div>
      )}

      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>
            <span>⚙️</span> Configuración
          </h2>

          {/* Capital y Aportaciones */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Capital inicial</label>
            <div className={styles.inputWithUnit}>
              <input
                type="number"
                className={styles.input}
                value={capitalInicial}
                onChange={e => setCapitalInicial(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                step={1000}
              />
              <span className={styles.inputUnit}>€</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Aportación mensual</label>
            <div className={styles.inputWithUnit}>
              <input
                type="number"
                className={styles.input}
                value={aportacionMensual}
                onChange={e => setAportacionMensual(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                step={50}
              />
              <span className={styles.inputUnit}>€/mes</span>
            </div>
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Horizonte</label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  className={styles.input}
                  value={años}
                  onChange={e => setAños(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={50}
                />
                <span className={styles.inputUnit}>años</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Inflación</label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  className={styles.input}
                  value={inflacion}
                  onChange={e => setInflacion(Math.max(0, parseFloat(e.target.value) || 0))}
                  min={0}
                  max={10}
                  step={0.5}
                />
                <span className={styles.inputUnit}>%</span>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Objetivo de patrimonio</label>
            <div className={styles.inputWithUnit}>
              <input
                type="number"
                className={styles.input}
                value={objetivo}
                onChange={e => setObjetivo(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                step={10000}
              />
              <span className={styles.inputUnit}>€</span>
            </div>
          </div>

          {/* Distribución de Cartera */}
          <div className={styles.carteraSection}>
            <h3 className={styles.subsectionTitle}>
              <span>📊</span> Distribución de Cartera
            </h3>

            {/* Selector de perfil predefinido */}
            <div className={styles.perfilesGrid}>
              {Object.entries(PERFILES_PREDEFINIDOS).map(([key, { nombre }]) => (
                <button
                  key={key}
                  className={`${styles.perfilBtn} ${perfilSeleccionado === key ? styles.perfilBtnActive : ''}`}
                  onClick={() => handlePerfilChange(key)}
                >
                  {nombre}
                </button>
              ))}
            </div>

            {/* Sliders de peso */}
            <div className={styles.pesosGrid}>
              {ASSET_CLASSES.map(asset => (
                <div key={asset.id} className={styles.pesoItem}>
                  <div className={styles.pesoHeader}>
                    <div
                      className={styles.pesoColor}
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className={styles.pesoNombre}>{asset.nombre}</span>
                    <span className={styles.pesoValor}>
                      {cartera[asset.id as keyof CarteraConfig]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    className={styles.slider}
                    min={0}
                    max={100}
                    value={cartera[asset.id as keyof CarteraConfig]}
                    onChange={e => handlePesoChange(
                      asset.id as keyof CarteraConfig,
                      parseInt(e.target.value)
                    )}
                    style={{
                      background: `linear-gradient(to right, ${asset.color} 0%, ${asset.color} ${cartera[asset.id as keyof CarteraConfig]}%, #E5E5E5 ${cartera[asset.id as keyof CarteraConfig]}%, #E5E5E5 100%)`
                    }}
                  />
                  <div className={styles.pesoMeta}>
                    <span>Rent: {(asset.rentabilidadMedia * 100).toFixed(1)}%</span>
                    <span>Vol: {(asset.volatilidad * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className={`${styles.totalPesos} ${totalPesos !== 100 ? styles.totalError : ''}`}>
              <span>Total:</span>
              <span>{totalPesos}%</span>
              {totalPesos !== 100 && (
                <button
                  className={styles.normalizarBtn}
                  onClick={normalizarPesos}
                >
                  Normalizar a 100%
                </button>
              )}
            </div>
          </div>

          {/* Botón simular */}
          <button
            className={styles.btnPrimary}
            onClick={ejecutarSimulacion}
            disabled={totalPesos !== 100 || simulando}
          >
            {simulando ? (
              <>
                <span className={styles.spinner}></span>
                Simulando {NUM_SIMULACIONES} escenarios...
              </>
            ) : (
              <>
                <span>🎲</span> Simular Cartera
              </>
            )}
          </button>

          <p className={styles.simulacionInfo}>
            {NUM_SIMULACIONES} escenarios Monte Carlo
          </p>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultadosPanel}>
          {resultado && metricas ? (
            <>
              {/* Gráfico */}
              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>📈 Evolución del Patrimonio</h3>
                <div className={styles.chartWrapper}>
                  {chartData && (
                    <Line
                      ref={chartRef}
                      data={chartData}
                      options={chartOptions as never}
                    />
                  )}
                </div>
              </div>

              {/* Métricas principales */}
              <div className={styles.metricasGrid}>
                <div className={`${styles.metricaCard} ${styles.destacada}`}>
                  <div className={styles.metricaIcono}>💰</div>
                  <div className={styles.metricaValor}>
                    {formatCurrency(metricas.capitalFinalMediano)}
                  </div>
                  <div className={styles.metricaLabel}>Capital Final (Mediana)</div>
                </div>

                <div className={styles.metricaCard}>
                  <div className={styles.metricaIcono}>🎯</div>
                  <div className={styles.metricaValor}>
                    {formatNumber(metricas.probabilidadObjetivo, 1)}%
                  </div>
                  <div className={styles.metricaLabel}>
                    Prob. alcanzar {formatCurrency(objetivo)}
                  </div>
                </div>

                <div className={styles.metricaCard}>
                  <div className={styles.metricaIcono}>📊</div>
                  <div className={styles.metricaValor}>
                    {formatNumber(metricas.sharpeRatio, 2)}
                  </div>
                  <div className={styles.metricaLabel}>Ratio de Sharpe</div>
                </div>

                <div className={styles.metricaCard}>
                  <div className={styles.metricaIcono}>📉</div>
                  <div className={styles.metricaValor}>
                    -{formatNumber(metricas.maxDrawdownEsperado, 1)}%
                  </div>
                  <div className={styles.metricaLabel}>Max Drawdown Esperado</div>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className={styles.detallesSection}>
                <h3 className={styles.subsectionTitle}>
                  <span>📋</span> Detalles de la Simulación
                </h3>

                <div className={styles.detallesGrid}>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Rentabilidad esperada</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(metricas.rentabilidadEsperada, 2)}% anual
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Volatilidad cartera</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(metricas.volatilidadCartera, 2)}% anual
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Escenario pesimista (P5)</span>
                    <span className={styles.detalleValor}>
                      {formatCurrency(metricas.capitalFinalPeor)}
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Escenario optimista (P95)</span>
                    <span className={styles.detalleValor}>
                      {formatCurrency(metricas.capitalFinalMejor)}
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Total aportado</span>
                    <span className={styles.detalleValor}>
                      {formatCurrency(capitalInicial + aportacionMensual * años * 12)}
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Ganancia esperada</span>
                    <span className={styles.detalleValor}>
                      {formatCurrency(metricas.capitalFinalMediano - (capitalInicial + aportacionMensual * años * 12))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interpretación */}
              <div className={styles.interpretacion}>
                <h4>💡 Interpretación</h4>
                <ul>
                  <li>
                    <strong>Mediana:</strong> En el 50% de los escenarios, tu patrimonio superará {formatCurrency(metricas.capitalFinalMediano)}
                  </li>
                  <li>
                    <strong>Rango probable:</strong> En el 80% de los casos, terminarás entre {formatCurrency(resultado.percentil10[resultado.percentil10.length - 1])} y {formatCurrency(resultado.percentil90[resultado.percentil90.length - 1])}
                  </li>
                  <li>
                    <strong>Sharpe Ratio:</strong> {metricas.sharpeRatio >= 0.5 ? 'Buena relación rentabilidad/riesgo' : 'Relación rentabilidad/riesgo mejorable'} ({metricas.sharpeRatio >= 0.5 ? '> 0.5 es aceptable' : '< 0.5 es bajo'})
                  </li>
                  <li>
                    <strong>Objetivo:</strong> Tienes un {formatNumber(metricas.probabilidadObjetivo, 0)}% de probabilidad de alcanzar {formatCurrency(objetivo)}
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <h3 className={styles.emptyTitle}>Configura tu simulación</h3>
              <p className={styles.emptyText}>
                Ajusta los parámetros de tu cartera y pulsa &quot;Simular&quot; para ver
                la proyección de tu patrimonio con {NUM_SIMULACIONES} escenarios posibles.
              </p>
              <div className={styles.emptyFeatures}>
                <div className={styles.emptyFeature}>
                  <span>🎲</span>
                  <span>Simulación Monte Carlo</span>
                </div>
                <div className={styles.emptyFeature}>
                  <span>📈</span>
                  <span>Bandas de confianza</span>
                </div>
                <div className={styles.emptyFeature}>
                  <span>📊</span>
                  <span>Métricas financieras</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-cartera-inversion"
        collapsible={true}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor la simulación?"
        subtitle="Aprende sobre Monte Carlo, Sharpe ratio y conceptos clave de inversión"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Clave</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🎲 ¿Qué es Monte Carlo?</h4>
              <p>
                Es una técnica que genera miles de escenarios posibles usando números aleatorios.
                En lugar de predecir UN resultado, te muestra la distribución de posibles resultados,
                ayudándote a entender el rango de lo que podría pasar.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Ratio de Sharpe</h4>
              <p>
                Mide cuánta rentabilidad extra obtienes por cada unidad de riesgo.
                Un Sharpe de 0.5+ es aceptable, 1+ es bueno, y 2+ es excelente.
                Te ayuda a comparar carteras considerando el riesgo asumido.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📉 Max Drawdown</h4>
              <p>
                Es la máxima caída desde un pico hasta el siguiente mínimo.
                Te indica cuánto podrías llegar a perder temporalmente en el peor momento.
                Importante para saber si podrás aguantar psicológicamente las caídas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📈 Percentiles</h4>
              <p>
                El percentil 50 (mediana) es el resultado típico.
                El percentil 10 es el escenario pesimista (solo 10% de casos es peor).
                El percentil 90 es el optimista (solo 10% de casos es mejor).
              </p>
            </div>
          </div>
        </section>

        {/* ========== TABLA COMPARATIVA: PERFILES DE INVERSOR ========== */}
        <section className={styles.comparativaSection}>
          <h2>⚖️ Perfiles de Inversor: ¿Cuál es el tuyo?</h2>
          <p className={styles.comparativaSubtitle}>
            Descubre qué estrategia de cartera se adapta mejor a tu situación personal
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Composición típica</th>
                  <th>Rentabilidad esperada</th>
                  <th>Volatilidad</th>
                  <th>Horizonte temporal</th>
                  <th>Ideal para...</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🛡️ Conservador</strong></td>
                  <td>20% RV, 70% RF, 10% Liquidez</td>
                  <td>3-4% anual</td>
                  <td>Baja (6-8%)</td>
                  <td>Corto plazo (&lt;5 años)</td>
                  <td>Preservar capital, pre-jubilados, baja tolerancia al riesgo</td>
                </tr>
                <tr>
                  <td><strong>📊 Moderado</strong></td>
                  <td>50% RV, 40% RF, 10% Liquidez</td>
                  <td>5-6% anual</td>
                  <td>Media (10-12%)</td>
                  <td>Medio plazo (5-15 años)</td>
                  <td>Equilibrio riesgo-rentabilidad, inversores mediana edad</td>
                </tr>
                <tr>
                  <td><strong>🚀 Agresivo</strong></td>
                  <td>80% RV, 15% RF, 5% Liquidez</td>
                  <td>7-8% anual</td>
                  <td>Alta (14-18%)</td>
                  <td>Largo plazo (&gt;15 años)</td>
                  <td>Maximizar crecimiento, jóvenes, alta tolerancia al riesgo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.comparativaConsejo}>
            <strong>💡 Regla de oro:</strong> Tu % de renta variable NO debe superar 120 - tu edad.
            Ejemplo: Si tienes 40 años, máximo 80% en RV (120-40=80). Ajusta según tu tolerancia real al riesgo.
          </div>
        </section>

        {/* ========== CASOS DE USO: PERFILES REALES ========== */}
        <section className={styles.escenariosSection}>
          <h2>💼 Perfiles de inversores y estrategias reales</h2>
          <p className={styles.escenariosSubtitle}>
            Ejemplos de carteras según edad, objetivos y situación personal
          </p>

          <div className={styles.escenariosGrid}>
            {/* Caso 1: Joven inversor */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍💻</span>
                <h3>Joven inversor (28 años)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Capital inicial: 10.000 €<br />
                Aportación mensual: 300 €<br />
                Horizonte: 30 años (jubilación)<br />
                Tolerancia al riesgo: Alta</p>
                <p><strong>Cartera:</strong> 80% RV, 15% RF, 5% Liquidez</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Con 30 años por delante, puede aguantar volatilidad y beneficiarse del interés compuesto.
                Las caídas temporales son oportunidades de compra. Capital final esperado (mediana): ~230.000 €.
              </p>
            </div>

            {/* Caso 2: Familia mediana edad */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
                <h3>Familia (45 años)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Capital inicial: 50.000 €<br />
                Aportación mensual: 500 €<br />
                Horizonte: 15 años (estudios hijos)<br />
                Tolerancia al riesgo: Moderada</p>
                <p><strong>Cartera:</strong> 60% RV, 35% RF, 5% Liquidez</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Equilibrio entre crecimiento y estabilidad. Suficiente RF para suavizar caídas.
                A medida que se acerque el objetivo (año 10-15), reducir RV progresivamente. Capital final esperado: ~200.000 €.
              </p>
            </div>

            {/* Caso 3: Pre-jubilado */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏖️</span>
                <h3>Pre-jubilado (60 años)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Capital inicial: 150.000 €<br />
                Aportación mensual: 0 € (ya no trabaja)<br />
                Horizonte: 5 años (preservar capital)<br />
                Tolerancia al riesgo: Baja</p>
                <p><strong>Cartera:</strong> 30% RV, 60% RF, 10% Liquidez</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Prioridad en preservar capital y generar renta estable. Algo de RV (30%) para mantener poder adquisitivo vs inflación.
                A los 65, reducir RV al 20%. Capital tras 5 años (mediana): ~170.000 €.
              </p>
            </div>

            {/* Caso 4: Inversor conservador */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛡️</span>
                <h3>Inversor conservador (35 años)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Capital inicial: 30.000 €<br />
                Aportación mensual: 400 €<br />
                Horizonte: 10 años (entrada vivienda)<br />
                Tolerancia al riesgo: Muy baja</p>
                <p><strong>Cartera:</strong> 35% RV, 55% RF, 10% Liquidez</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Objetivo a medio plazo con fecha concreta (compra vivienda). No puede permitirse gran caída en año 8-9.
                RF proporciona estabilidad. Poco RV (35%) para algo de crecimiento. Capital tras 10 años (mediana): ~90.000 €.
              </p>
            </div>
          </div>
        </section>

        {/* ========== FAQ AMPLIADO ========== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas frecuentes sobre inversión en carteras</h2>

          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuánto dinero necesito para empezar a invertir?</h4>
              <p>
                No hay un mínimo universal, pero <strong>recomendamos al menos 1.000-3.000 €</strong> para diversificar correctamente.
                Con menos de 1.000 €, los costes de transacción (comisiones de fondos/ETFs, custodia) pueden comerse una parte significativa de la rentabilidad.
              </p>
              <p>
                <strong>Alternativa si tienes poco capital:</strong> Empieza con fondos indexados de acumulación (sin reparto de dividendos)
                y ve aportando mensualmente (50-200 €/mes). Muchos brokers permiten aportaciones automáticas sin comisiones.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Debo rebalancear mi cartera? ¿Con qué frecuencia?</h4>
              <p>
                <strong>Sí, el rebalanceo es clave.</strong> Si tu cartera objetivo es 60% RV / 40% RF, y tras un año de subidas la RV pasa a ser 70%,
                debes vender RV y comprar RF para volver al 60/40. Esto te obliga a <strong>vender caro y comprar barato</strong> de forma disciplinada.
              </p>
              <p>
                <strong>Frecuencia recomendada:</strong> 1-2 veces al año (junio y diciembre) o cuando una clase de activo se desvíe más del 5% de su objetivo.
                No rebalancees en pánico durante caídas de mercado; hazlo según calendario fijo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué porcentaje de mi patrimonio debo invertir?</h4>
              <p>
                <strong>Regla general:</strong> Invierte solo el dinero que NO necesites en los próximos 5-10 años. Antes de invertir, asegúrate de tener:
              </p>
              <p>
                1. <strong>Fondo de emergencia:</strong> 3-6 meses de gastos en cuenta corriente/ahorro líquido<br />
                2. <strong>Deudas de alto interés pagadas:</strong> Tarjetas de crédito, préstamos personales (&gt;5% TAE)<br />
                3. <strong>Objetivos a corto plazo cubiertos:</strong> Vacaciones, reparaciones del coche, etc.
              </p>
              <p>
                Solo entonces, invierte el excedente. Si tienes 50.000 € ahorrados, quizás 10.000 € sean fondo emergencia y 40.000 € invertibles.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es mejor invertir todo de golpe o poco a poco (DCA)?</h4>
              <p>
                Depende de tu psicología y el momento de mercado. Dos estrategias:
              </p>
              <p>
                <strong>Lump Sum (todo de golpe):</strong> Históricamente gana en el 60-70% de casos porque el mercado sube más de lo que baja.
                Si tienes una suma grande (ej: herencia, bonus), invertirla de golpe suele ser óptimo <strong>si puedes dormir tranquilo</strong>.
              </p>
              <p>
                <strong>DCA (Dollar Cost Averaging):</strong> Inviertes cantidades fijas periódicamente (ej: 500 €/mes durante 20 meses si tienes 10.000 €).
                Reduce el riesgo psicológico de invertir justo antes de una caída. <strong>Mejor para inversores nerviosos</strong> o si estás empezando.
              </p>
              <p>
                <strong>Consejo:</strong> Si tienes una suma grande y dudas, compromiso intermedio: invierte 50% ahora y el otro 50% en 6 cuotas mensuales.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Dónde invierto? ¿Fondos indexados o ETFs?</h4>
              <p>
                Ambos son vehículos de inversión pasiva excelentes. La elección depende de tu situación:
              </p>
              <p>
                <strong>Fondos indexados:</strong> Compras directamente en la gestora (ej: Vanguard, Amundi, BlackRock a través de tu banco/broker).
                Sin comisiones de compra/venta en muchos casos. Ideal si haces aportaciones pequeñas frecuentes (100-200 €/mes).
                Fiscalidad: Traspasables sin tributar (solo pagas cuando vendes definitivamente).
              </p>
              <p>
                <strong>ETFs:</strong> Se compran en bolsa como acciones (necesitas broker). Más flexibilidad (puedes vender en cualquier momento durante mercado abierto).
                Pagas comisión de compra/venta (0.5-1 € por operación en brokers baratos). Ideal si inviertes sumas mayores de forma esporádica (1.000+ €).
                Fiscalidad: Cada venta tributa (aunque vendas para traspasar).
              </p>
              <p>
                <strong>Recomendación:</strong> Si eres principiante con capital inicial pequeño y aportaciones mensuales, empieza con fondos indexados.
                Si tienes sumas grandes o quieres máxima flexibilidad, ETFs.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si necesito el dinero antes de tiempo?</h4>
              <p>
                Puedes vender en cualquier momento (liquidez diaria en fondos/ETFs), pero <strong>asumir consecuencias:</strong>
              </p>
              <p>
                1. <strong>Riesgo de vender en pérdidas:</strong> Si el mercado ha caído un 20% y vendes, cristalizas esas pérdidas.
                Si hubieras esperado 2-3 años, probablemente se habría recuperado.<br />
                2. <strong>Impacto fiscal:</strong> Pagas impuestos sobre las ganancias (19-26% según tramo en España). Si vendes con pérdidas,
                puedes compensarlas con ganancias futuras durante los próximos 4 años.<br />
                3. <strong>Coste de oportunidad:</strong> Pierdes el potencial de crecimiento futuro del capital retirado.
              </p>
              <p>
                <strong>Solución:</strong> Por eso es clave tener fondo de emergencia separado. Solo invierte dinero que sepas que no necesitarás en 5+ años.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo debo vender? ¿Cómo saber si es buen momento?</h4>
              <p>
                <strong>NO vendas intentando "adivinar el mercado"</strong> (market timing). Incluso profesionales fallan. En su lugar, vende cuando:
              </p>
              <p>
                1. <strong>Alcanzas tu objetivo:</strong> Necesitas el dinero para el fin previsto (comprar casa, jubilación, estudios).<br />
                2. <strong>Cambia tu situación:</strong> Pérdida de empleo, enfermedad grave, cambio radical de tolerancia al riesgo.<br />
                3. <strong>Rebalanceo programado:</strong> Vender RV automáticamente cuando supera tu % objetivo (disciplina, no emoción).
              </p>
              <p>
                <strong>NUNCA vendas por:</strong> Noticias alarmistas, caídas del 10-20% (normales), miedo al crash (imposible predecir),
                consejos de familiares/amigos sin formación financiera.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es seguro invertir? ¿Puedo perder todo mi dinero?</h4>
              <p>
                <strong>Depende de cómo inviertas.</strong> Con diversificación adecuada (fondos indexados globales), es extremadamente improbable perder TODO:
              </p>
              <p>
                • <strong>Fondos indexados globales (MSCI World):</strong> Invierten en 1.500+ empresas de 23 países. Para perder todo,
                todas las empresas del mundo tendrían que quebrar (escenario apocalíptico).<br />
                • <strong>Peor caída histórica:</strong> 2008-2009, caída del 55% desde picos. Pero quien aguantó recuperó en 3-4 años y luego multiplicó x3.<br />
                • <strong>Renta Fija:</strong> Mucho más estable. Bonos gubernamentales de países desarrollados casi nunca quiebran.
              </p>
              <p>
                <strong>Riesgos REALES:</strong><br />
                1. Vender en pánico durante caídas (pérdidas cristalizadas).<br />
                2. Invertir en productos complejos sin entenderlos (CFDs, opciones, criptos sin conocimiento).<br />
                3. Concentración excesiva (todo en 2-3 acciones individuales, todo en un sector/país).
              </p>
              <p>
                <strong>Solución:</strong> Diversifica (fondos indexados), ten horizonte largo (5+ años), no vendas en pánico, edúcate antes de invertir.
              </p>
            </div>
          </div>
        </section>

        {/* ========== GUÍA PASO A PASO ========== */}
        <section className={styles.guideSection}>
          <h2>📋 Guía paso a paso: Cómo construir tu cartera de inversión</h2>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Define tus objetivos y horizonte temporal</h4>
                <p>
                  Antes de invertir, responde: <strong>¿Para qué inviertes?</strong> (jubilación, comprar casa, estudios hijos) y
                  <strong>¿cuándo lo necesitas?</strong> (5, 10, 20 años). Tu horizonte determina cuánto riesgo puedes asumir:
                </p>
                <p>
                  • Menos de 3 años: NO inviertas en RV (mucha volatilidad), usa depósitos/RF.<br />
                  • 3-10 años: Cartera moderada (40-60% RV).<br />
                  • Más de 10 años: Cartera agresiva (60-80% RV) es viable.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Evalúa tu tolerancia al riesgo (test real)</h4>
                <p>
                  Pregúntate: <strong>Si tu cartera cayera un 30% en 6 meses, ¿qué harías?</strong>
                </p>
                <p>
                  A) Vendería todo de inmediato (pánico) → <strong>Perfil conservador</strong> (máx 30-40% RV)<br />
                  B) Me preocuparía pero no vendería → <strong>Perfil moderado</strong> (50-60% RV)<br />
                  C) Aprovecharía para comprar más (oportunidad) → <strong>Perfil agresivo</strong> (70-80% RV)
                </p>
                <p>
                  <strong>Consejo:</strong> Es mejor ser conservador y cumplir el plan que ser agresivo y vender en pánico a pérdidas.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Selecciona tus activos (fondos indexados simples)</h4>
                <p>
                  Para empezar, <strong>menos es más</strong>. Una cartera de 2-3 fondos es suficiente:
                </p>
                <p>
                  • <strong>Renta Variable:</strong> 1 fondo indexado global (MSCI World o S&P 500).
                  Ejemplo: Vanguard Global Stock Index, Amundi MSCI World.<br />
                  • <strong>Renta Fija:</strong> 1 fondo de bonos agregados (gubernamentales + corporativos).
                  Ejemplo: Vanguard Global Bond Index.<br />
                  • <strong>Liquidez:</strong> Fondo monetario o depósito a corto plazo (reserva accesible).
                </p>
                <p>
                  <strong>Evita:</strong> Fondos de gestión activa con comisiones &gt;1% anual. Busca TER (Total Expense Ratio) &lt;0.3%.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Decide tu asset allocation (distribución de activos)</h4>
                <p>
                  Basándote en tu perfil de riesgo (paso 2) y horizonte (paso 1), define los % de cada activo:
                </p>
                <p>
                  • <strong>Conservador:</strong> 30% RV, 60% RF, 10% Liquidez<br />
                  • <strong>Moderado:</strong> 50% RV, 40% RF, 10% Liquidez<br />
                  • <strong>Agresivo:</strong> 80% RV, 15% RF, 5% Liquidez
                </p>
                <p>
                  <strong>Regla de oro:</strong> Tu % de RV = 100 - tu edad (o 120 - tu edad si eres agresivo).
                  Ej: 40 años → 60% RV máximo.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Abre cuenta en un broker/plataforma de bajo coste</h4>
                <p>
                  Compara brokers por: <strong>comisiones de compra/venta, custodia anual, variedad de fondos/ETFs</strong>.
                </p>
                <p>
                  <strong>Opciones en España:</strong><br />
                  • MyInvestor: Sin comisiones de custodia, amplio catálogo de fondos.<br />
                  • Openbank: Compra/venta de ETFs desde 5 €, sin custodia si tienes nómina.<br />
                  • Interactive Brokers: Muy barato para ETFs internacionales, pero más complejo.
                </p>
                <p>
                  <strong>Documentación necesaria:</strong> DNI, justificante de domicilio, número de cuenta bancaria.
                  Proceso 100% online (10-20 minutos).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Haz tu primera inversión y configura aportaciones</h4>
                <p>
                  Invierte tu capital inicial según los % definidos. Si tienes 10.000 € y perfil 60/40:
                </p>
                <p>
                  • Compra 6.000 € de fondo RV (60%)<br />
                  • Compra 4.000 € de fondo RF (40%)
                </p>
                <p>
                  <strong>Aportaciones automáticas:</strong> Configura transferencias mensuales automáticas desde tu nómina
                  (ej: 300 €/mes) para seguir invirtiendo sin pensar. El broker puede reinvertir automáticamente en tus fondos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Rebalancea periódicamente y revisa anualmente</h4>
                <p>
                  <strong>Rebalanceo (cada 6-12 meses):</strong> Si tu cartera 60/40 ahora es 70/30 porque RV subió mucho,
                  vende 10% de RV y compra 10% de RF para volver a 60/40. Esto te obliga a <strong>vender caro y comprar barato</strong>.
                </p>
                <p>
                  <strong>Revisión anual:</strong> Cada enero, revisa si tu situación cambió (nueva edad, cambio de objetivos, cambio de tolerancia).
                  Ajusta tu asset allocation si es necesario (ej: a los 50 años, reduces RV del 70% al 60%).
                </p>
                <p>
                  <strong>Lo que NO debes hacer:</strong> Revisar tu cartera cada día/semana. Míraras solo 2-4 veces al año (menos ansiedad, mejores resultados).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== MEJORES PRÁCTICAS ========== */}
        <section className={styles.tipsSection}>
          <h2>✅ Mejores prácticas para inversores a largo plazo</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Diversifica siempre: nunca todo en un solo activo</h4>
              <p>
                No pongas más del 5-10% de tu cartera en una sola empresa o sector. Usa fondos indexados que invierten en
                cientos/miles de empresas automáticamente. La diversificación es el único "almuerzo gratis" en finanzas.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Invierte regular y automáticamente (olvidate del timing)</h4>
              <p>
                No intentes adivinar cuándo el mercado está "barato". Configura aportaciones mensuales automáticas (DCA: Dollar Cost Averaging).
                Comprarás a veces caro, a veces barato, pero eliminas la emoción y el estrés de decidir "cuándo entrar".
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Minimiza costes: busca TER &lt; 0.3% anual</h4>
              <p>
                Un fondo con TER 0.2% vs uno con 1.5% puede costarte decenas de miles de euros en 20 años. Ejemplo: 50.000 € a 20 años con 6% rentabilidad
                → con TER 0.2% acabas con ~157.000 €, con TER 1.5% acabas con ~139.000 € (18.000 € de diferencia solo en comisiones).
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Rebalancea sin emoción: vende caro y compra barato</h4>
              <p>
                Si tu cartera 60/40 se convierte en 75/25 tras una subida de RV, rebalancea vendiendo RV y comprando RF. Te obligas a vender en máximos
                y comprar en mínimos relativos. Hazlo por calendario (junio/diciembre), no por "sensaciones" del mercado.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Edúcate continuamente: lee libros y blogs de referencia</h4>
              <p>
                Libros recomendados: "El inversor inteligente" (Benjamin Graham), "Un paseo aleatorio por Wall Street" (Burton Malkiel),
                "The Bogleheads' Guide to Investing". Blogs: Bogleheads.org, The White Coat Investor. Evita "gurús" que prometen rentabilidades del 20%+ anual.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Mantén un fondo de emergencia fuera de la inversión</h4>
              <p>
                Antes de invertir, ten 3-6 meses de gastos en cuenta corriente/ahorro líquido. Esto evita que tengas que vender inversiones con pérdidas
                ante imprevistos (avería coche, despido, enfermedad). El fondo de emergencia es tu colchón de seguridad psicológica.
              </p>
            </div>
          </div>
        </section>

        {/* ========== WARNING BOX: ERRORES COMUNES ========== */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores costosos que cometen inversores principiantes</h3>
          </div>

          <ul className={styles.warningList}>
            <li>
              <strong>Vender en pánico durante caídas del mercado:</strong> Las caídas del 20-30% son normales cada 5-10 años.
              Quien vendió en marzo 2020 (COVID) con -35% perdió la recuperación más rápida de la historia (en 6 meses ya estaba en máximos).
              <strong>Solución:</strong> No mires tu cartera durante crisis, mantén el plan. Si no puedes aguantar psicológicamente caídas del 30%,
              reduce tu % de RV ANTES de que ocurran.
            </li>
            <li>
              <strong>Intentar hacer market timing (adivinar cuándo comprar/vender):</strong> Incluso gestores profesionales fallan en predecir máximos y mínimos.
              Si te pierdes los 10 mejores días del mercado en 20 años, tu rentabilidad cae a la mitad. <strong>Solución:</strong> Stay invested, no entres y salgas.
              Invierte regularmente sin intentar "esperar el mejor momento".
            </li>
            <li>
              <strong>Concentración excesiva en pocas acciones o sectores:</strong> "Poner todos los huevos en la misma cesta". Si inviertes todo en tecnología
              y el sector cae 50%, tu cartera cae 50%. <strong>Solución:</strong> Diversificación global con fondos indexados que cubran miles de empresas y sectores.
            </li>
            <li>
              <strong>Perseguir rentabilidades pasadas ("performance chasing"):</strong> Ver que un fondo subió 40% el año pasado y comprarlo.
              Problema: lo que sube rápido suele caer rápido (reversión a la media). <strong>Solución:</strong> Invierte en fondos con estrategia consistente
              (indexación), no en los "ganadores del año pasado".
            </li>
            <li>
              <strong>Pagar comisiones altas por gestión activa sin valor añadido:</strong> Fondos de gestión activa con TER 1.5-2% rara vez baten al mercado
              tras costes. En 20 años, esas comisiones se comen el 30-40% de tu rentabilidad final. <strong>Solución:</strong> Fondos indexados pasivos con TER &lt;0.3%.
            </li>
            <li>
              <strong>No tener un plan escrito y dejarse llevar por emociones:</strong> Invertir sin estrategia clara lleva a decisiones impulsivas (comprar en euforia,
              vender en pánico). <strong>Solución:</strong> Escribe tu plan de inversión (objetivos, asset allocation, reglas de rebalanceo) y cúmplelo mecánicamente.
              La disciplina vence a la inteligencia en inversión.
            </li>
            <li>
              <strong>Ignorar la fiscalidad e impuestos sobre ganancias:</strong> En España pagas 19-26% sobre ganancias al vender. Si haces muchas compra/ventas,
              pagas impuestos cada año. <strong>Solución:</strong> Buy and hold (compra y mantén), aprovecha traspasos sin tributar entre fondos, minimiza rotación.
              Vende solo cuando necesites el dinero o rebalancees (1-2 veces/año máx).
            </li>
            <li>
              <strong>Invertir dinero que necesitas a corto plazo:</strong> Invertir el ahorro para la entrada del piso que compras en 1 año es un error enorme.
              Si el mercado cae 20% ese año, te falta el 20% de la entrada. <strong>Solución:</strong> Solo invierte dinero que NO necesites en los próximos 5+ años.
              Objetivos a corto plazo (&lt;3 años) van a depósitos/RF estable, no a RV.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-cartera-inversion')} />

      <ShareCard appName="estimador-cartera-inversion" />
      <Footer appName="estimador-cartera-inversion" />
    </div>
  );
}
