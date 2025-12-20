'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './SimuladorCartera.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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

  // Volatilidad simplificada (asumiendo correlación baja entre activos)
  // En realidad debería usar matriz de covarianzas, pero simplificamos
  let varianza = 0;
  ASSET_CLASSES.forEach((asset, i) => {
    varianza += Math.pow(pesos[i] * asset.volatilidad, 2);
  });
  // Añadir algo de correlación entre RV y Alt
  varianza += 2 * pesos[0] * pesos[3] * 0.4 * ASSET_CLASSES[0].volatilidad * ASSET_CLASSES[3].volatilidad;

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
        <h1 className={styles.title}>Simulador de Cartera de Inversión</h1>
        <p className={styles.subtitle}>
          Proyecta la evolución de tu patrimonio con simulación Monte Carlo
        </p>
      </header>

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
                      options={chartOptions}
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

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta simulación es <strong>educativa y orientativa</strong>. Los resultados se basan en
          rentabilidades históricas típicas y <strong>no garantizan resultados futuros</strong>.
          Las rentabilidades pasadas no predicen rentabilidades futuras. La simulación no considera
          costes de transacción, impuestos, ni eventos extraordinarios del mercado. Consulta con
          un asesor financiero antes de tomar decisiones de inversión.
        </p>
      </div>

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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-cartera-inversion')} />

      <Footer appName="simulador-cartera-inversion" />
    </div>
  );
}
