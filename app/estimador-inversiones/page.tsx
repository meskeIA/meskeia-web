'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './EstimadorInversiones.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import Chart from 'chart.js/auto';

type PerfilInversor = 'conservador' | 'moderado' | 'equilibrado' | 'dinamico' | 'agresivo';
type ModoApp = 'calculadora' | 'comparador';

interface AsignacionActivos {
  rentaVariable: number;
  rentaFija: number;
  liquidez: number;
  alternativos: number;
}

const PERFILES: Record<PerfilInversor, { nombre: string; icon: string; desc: string; asignacion: AsignacionActivos; rentabilidadEsperada: number; volatilidad: number }> = {
  conservador: {
    nombre: 'Conservador',
    icon: '🛡️',
    desc: 'Mínimo riesgo',
    asignacion: { rentaVariable: 15, rentaFija: 60, liquidez: 20, alternativos: 5 },
    rentabilidadEsperada: 3,
    volatilidad: 5,
  },
  moderado: {
    nombre: 'Moderado',
    icon: '⚖️',
    desc: 'Riesgo bajo',
    asignacion: { rentaVariable: 30, rentaFija: 50, liquidez: 15, alternativos: 5 },
    rentabilidadEsperada: 4.5,
    volatilidad: 8,
  },
  equilibrado: {
    nombre: 'Equilibrado',
    icon: '📊',
    desc: 'Riesgo medio',
    asignacion: { rentaVariable: 50, rentaFija: 35, liquidez: 10, alternativos: 5 },
    rentabilidadEsperada: 6,
    volatilidad: 12,
  },
  dinamico: {
    nombre: 'Dinámico',
    icon: '📈',
    desc: 'Riesgo alto',
    asignacion: { rentaVariable: 70, rentaFija: 20, liquidez: 5, alternativos: 5 },
    rentabilidadEsperada: 7.5,
    volatilidad: 16,
  },
  agresivo: {
    nombre: 'Agresivo',
    icon: '🚀',
    desc: 'Máximo riesgo',
    asignacion: { rentaVariable: 85, rentaFija: 5, liquidez: 5, alternativos: 5 },
    rentabilidadEsperada: 9,
    volatilidad: 22,
  },
};

export default function CalculadoraInversionesPage() {
  const [modo, setModo] = useState<ModoApp>('calculadora');
  const [capitalInvertir, setCapitalInvertir] = useState('50000');
  const [perfil, setPerfil] = useState<PerfilInversor>('equilibrado');
  const [horizonteTemporal, setHorizonteTemporal] = useState(10);
  const [edadInversor, setEdadInversor] = useState(35);

  // Estados para modo comparador (3 escenarios)
  const [escenario1, setEscenario1] = useState('25000');
  const [escenario2, setEscenario2] = useState('50000');
  const [escenario3, setEscenario3] = useState('100000');

  // Ref para el gráfico
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const perfilActual = PERFILES[perfil];

  // Calcular distribución
  const distribucion = useMemo(() => {
    const capital = parseSpanishNumber(capitalInvertir) || 0;
    const asignacion = perfilActual.asignacion;

    return {
      rentaVariable: {
        porcentaje: asignacion.rentaVariable,
        importe: capital * (asignacion.rentaVariable / 100),
      },
      rentaFija: {
        porcentaje: asignacion.rentaFija,
        importe: capital * (asignacion.rentaFija / 100),
      },
      liquidez: {
        porcentaje: asignacion.liquidez,
        importe: capital * (asignacion.liquidez / 100),
      },
      alternativos: {
        porcentaje: asignacion.alternativos,
        importe: capital * (asignacion.alternativos / 100),
      },
    };
  }, [capitalInvertir, perfilActual]);

  // Calcular métricas
  const metricas = useMemo(() => {
    const capital = parseSpanishNumber(capitalInvertir) || 0;
    const rentabilidad = perfilActual.rentabilidadEsperada / 100;
    const volatilidad = perfilActual.volatilidad;

    // Capital proyectado
    const capitalProyectado = capital * Math.pow(1 + rentabilidad, horizonteTemporal);

    // Escenario pesimista (rentabilidad - 1σ de volatilidad)
    const rentabilidadPesimista = Math.max(0, rentabilidad - volatilidad / 100);
    const capitalPesimista = capital * Math.pow(1 + rentabilidadPesimista, horizonteTemporal);

    // Escenario optimista (rentabilidad + 1σ de volatilidad)
    const rentabilidadOptimista = rentabilidad + volatilidad / 100;
    const capitalOptimista = capital * Math.pow(1 + rentabilidadOptimista, horizonteTemporal);

    // Sharpe ratio (tasa libre de riesgo: Bono España 10y 2026 ≈ 3,75%)
    const tasaLibreDeRiesgo = 3.75;
    const sharpeRatio = (perfilActual.rentabilidadEsperada - tasaLibreDeRiesgo) / volatilidad;

    return {
      capitalProyectado,
      capitalPesimista,
      capitalOptimista,
      rentabilidadEsperada: perfilActual.rentabilidadEsperada,
      volatilidad,
      sharpeRatio,
      gananciasEsperadas: capitalProyectado - capital,
    };
  }, [capitalInvertir, perfilActual, horizonteTemporal]);

  // Recomendaciones basadas en edad y horizonte
  const recomendaciones = useMemo(() => {
    const recs: string[] = [];

    // Regla del 110 (o 120 para más agresivos)
    const porcentajeRVRecomendado = Math.max(0, 110 - edadInversor);

    if (perfilActual.asignacion.rentaVariable > porcentajeRVRecomendado + 15) {
      recs.push(`Según tu edad (${edadInversor} años), podrías considerar reducir renta variable al ~${porcentajeRVRecomendado}%.`);
    }

    if (horizonteTemporal < 5 && perfil === 'agresivo') {
      recs.push('Con un horizonte menor a 5 años, un perfil agresivo podría ser demasiado arriesgado.');
    }

    if (horizonteTemporal > 15 && (perfil === 'conservador' || perfil === 'moderado')) {
      recs.push('Con un horizonte tan largo, podrías considerar un perfil más dinámico para aprovechar el interés compuesto.');
    }

    const capital = parseSpanishNumber(capitalInvertir) || 0;
    if (distribucion.liquidez.importe > 10000) {
      recs.push('Mantener más de 10.000€ en liquidez puede ser ineficiente. Considera un fondo monetario.');
    }

    if (capital > 100000 && distribucion.alternativos.porcentaje < 10) {
      recs.push('Con un capital elevado, podrías diversificar más con alternativos (REITs, materias primas).');
    }

    if (recs.length === 0) {
      recs.push('Tu cartera está bien equilibrada para tu perfil de riesgo y horizonte temporal.');
    }

    return recs;
  }, [perfil, perfilActual, edadInversor, horizonteTemporal, capitalInvertir, distribucion]);

  // Calcular datos para modo comparador
  const datosComparador = useMemo(() => {
    const capitales = [
      parseSpanishNumber(escenario1) || 0,
      parseSpanishNumber(escenario2) || 0,
      parseSpanishNumber(escenario3) || 0,
    ];
    const rentabilidad = perfilActual.rentabilidadEsperada / 100;

    // Evolución año a año para cada escenario
    const evolucionAnual: { ano: number; valores: number[] }[] = [];
    for (let ano = 0; ano <= horizonteTemporal; ano++) {
      evolucionAnual.push({
        ano,
        valores: capitales.map(cap => cap * Math.pow(1 + rentabilidad, ano)),
      });
    }

    // Resumen final de cada escenario
    const resumenEscenarios = capitales.map((cap, idx) => {
      const capitalFinal = cap * Math.pow(1 + rentabilidad, horizonteTemporal);
      const ganancia = capitalFinal - cap;
      const porcentajeGanancia = cap > 0 ? ((capitalFinal / cap) - 1) * 100 : 0;
      return {
        nombre: `Escenario ${idx + 1}`,
        capitalInicial: cap,
        capitalFinal,
        ganancia,
        porcentajeGanancia,
      };
    });

    return { evolucionAnual, resumenEscenarios };
  }, [escenario1, escenario2, escenario3, perfilActual, horizonteTemporal]);

  // Efecto para crear/actualizar el gráfico
  useEffect(() => {
    if (modo !== 'comparador' || !chartRef.current) return;

    // Destruir gráfico anterior si existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = datosComparador.evolucionAnual.map(d => `Año ${d.ano}`);
    const colores = ['#2E86AB', '#48A9A6', '#7FB3D3'];

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Escenario 1 (${formatCurrency(parseSpanishNumber(escenario1) || 0)})`,
            data: datosComparador.evolucionAnual.map(d => d.valores[0]),
            borderColor: colores[0],
            backgroundColor: 'rgba(46, 134, 171, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: `Escenario 2 (${formatCurrency(parseSpanishNumber(escenario2) || 0)})`,
            data: datosComparador.evolucionAnual.map(d => d.valores[1]),
            borderColor: colores[1],
            backgroundColor: 'rgba(72, 169, 166, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: `Escenario 3 (${formatCurrency(parseSpanishNumber(escenario3) || 0)})`,
            data: datosComparador.evolucionAnual.map(d => d.valores[2]),
            borderColor: colores[2],
            backgroundColor: 'rgba(127, 179, 211, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y ?? 0)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(Number(value));
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [modo, datosComparador, escenario1, escenario2, escenario3]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📊 Estimador de Inversiones</h1>
        <p className={styles.subtitle}>
          Diseña tu cartera según tu perfil de riesgo
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Selector de Modo */}
      <div className={styles.modoSelector}>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'calculadora' ? styles.modoActivo : ''}`}
          onClick={() => setModo('calculadora')}
        >
          <span className={styles.modoIcon}>🧮</span>
          <span className={styles.modoNombre}>Calculadora</span>
        </button>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'comparador' ? styles.modoActivo : ''}`}
          onClick={() => setModo('comparador')}
        >
          <span className={styles.modoIcon}>📊</span>
          <span className={styles.modoNombre}>Comparador</span>
        </button>
      </div>

      {modo === 'calculadora' ? (
      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>💰 Capital a Invertir</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Importe total</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={capitalInvertir}
                onChange={(e) => setCapitalInvertir(e.target.value)}
                placeholder="50000"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>👤 Tu Perfil</h2>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Tu edad</label>
              <span className={styles.sliderValue}>{edadInversor} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="18"
              max="70"
              value={edadInversor}
              onChange={(e) => setEdadInversor(parseInt(e.target.value))}
            />
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Horizonte temporal</label>
              <span className={styles.sliderValue}>{horizonteTemporal} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="1"
              max="30"
              value={horizonteTemporal}
              onChange={(e) => setHorizonteTemporal(parseInt(e.target.value))}
            />
          </div>

          <h2 className={styles.sectionTitle}>📈 Perfil de Riesgo</h2>

          <div className={styles.perfilesGrid}>
            {(Object.keys(PERFILES) as PerfilInversor[]).map((key) => (
              <button
                key={key}
                className={`${styles.perfilBtn} ${perfil === key ? styles.activo : ''}`}
                onClick={() => setPerfil(key)}
              >
                <div className={styles.perfilIcon}>{PERFILES[key].icon}</div>
                <span className={styles.perfilNombre}>{PERFILES[key].nombre}</span>
                <span className={styles.perfilDesc}>{PERFILES[key].desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>📊 Tu Distribución de Activos</h2>

          {/* Barra Visual */}
          <div className={styles.distribucionVisual}>
            <div className={styles.barraDistribucion}>
              {distribucion.rentaVariable.porcentaje > 0 && (
                <div
                  className={`${styles.barraSegmento} ${styles.rentaVariable}`}
                  style={{ width: `${distribucion.rentaVariable.porcentaje}%` }}
                >
                  {distribucion.rentaVariable.porcentaje}%
                </div>
              )}
              {distribucion.rentaFija.porcentaje > 0 && (
                <div
                  className={`${styles.barraSegmento} ${styles.rentaFija}`}
                  style={{ width: `${distribucion.rentaFija.porcentaje}%` }}
                >
                  {distribucion.rentaFija.porcentaje}%
                </div>
              )}
              {distribucion.liquidez.porcentaje > 0 && (
                <div
                  className={`${styles.barraSegmento} ${styles.liquidez}`}
                  style={{ width: `${distribucion.liquidez.porcentaje}%` }}
                >
                  {distribucion.liquidez.porcentaje}%
                </div>
              )}
              {distribucion.alternativos.porcentaje > 0 && (
                <div
                  className={`${styles.barraSegmento} ${styles.alternativos}`}
                  style={{ width: `${distribucion.alternativos.porcentaje}%` }}
                >
                  {distribucion.alternativos.porcentaje}%
                </div>
              )}
            </div>

            <div className={styles.leyenda}>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.rentaVariable}`} />
                <span>Renta Variable</span>
              </div>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.rentaFija}`} />
                <span>Renta Fija</span>
              </div>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.liquidez}`} />
                <span>Liquidez</span>
              </div>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.alternativos}`} />
                <span>Alternativos</span>
              </div>
            </div>
          </div>

          {/* Cards de Distribución */}
          <div className={styles.distribucionGrid}>
            <div className={styles.activoCard}>
              <div className={styles.activoHeader}>
                <span className={styles.activoNombre}>📈 Renta Variable</span>
                <span className={styles.activoPorcentaje}>{distribucion.rentaVariable.porcentaje}%</span>
              </div>
              <div className={styles.activoImporte}>{formatCurrency(distribucion.rentaVariable.importe)}</div>
              <div className={styles.activoDesc}>Acciones, ETFs de índices, fondos de inversión</div>
            </div>

            <div className={styles.activoCard}>
              <div className={styles.activoHeader}>
                <span className={styles.activoNombre}>📊 Renta Fija</span>
                <span className={styles.activoPorcentaje}>{distribucion.rentaFija.porcentaje}%</span>
              </div>
              <div className={styles.activoImporte}>{formatCurrency(distribucion.rentaFija.importe)}</div>
              <div className={styles.activoDesc}>Bonos gubernamentales, corporativos, fondos RF</div>
            </div>

            <div className={styles.activoCard}>
              <div className={styles.activoHeader}>
                <span className={styles.activoNombre}>💵 Liquidez</span>
                <span className={styles.activoPorcentaje}>{distribucion.liquidez.porcentaje}%</span>
              </div>
              <div className={styles.activoImporte}>{formatCurrency(distribucion.liquidez.importe)}</div>
              <div className={styles.activoDesc}>Depósitos, cuentas remuneradas, monetarios</div>
            </div>

            <div className={styles.activoCard}>
              <div className={styles.activoHeader}>
                <span className={styles.activoNombre}>🏠 Alternativos</span>
                <span className={styles.activoPorcentaje}>{distribucion.alternativos.porcentaje}%</span>
              </div>
              <div className={styles.activoImporte}>{formatCurrency(distribucion.alternativos.importe)}</div>
              <div className={styles.activoDesc}>REITs, materias primas, criptomonedas</div>
            </div>
          </div>

          {/* Métricas */}
          <div className={styles.metricasSection}>
            <h3 className={styles.sectionTitle}>📈 Proyección a {horizonteTemporal} años</h3>
            <div className={styles.metricasGrid}>
              <div className={`${styles.metricaCard} ${styles.positivo}`}>
                <span className={styles.metricaLabel}>Capital proyectado</span>
                <span className={styles.metricaValor}>{formatCurrency(metricas.capitalProyectado)}</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Rentabilidad esperada</span>
                <span className={styles.metricaValor}>{formatNumber(metricas.rentabilidadEsperada, 1)}%</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Volatilidad</span>
                <span className={styles.metricaValor}>{formatNumber(metricas.volatilidad, 0)}%</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Escenario pesimista</span>
                <span className={styles.metricaValor}>{formatCurrency(metricas.capitalPesimista)}</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Escenario optimista</span>
                <span className={styles.metricaValor}>{formatCurrency(metricas.capitalOptimista)}</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Ratio Sharpe</span>
                <span className={styles.metricaValor}>{formatNumber(metricas.sharpeRatio, 2)}</span>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className={styles.recomendacionesSection}>
            <h4>💡 Recomendaciones Personalizadas</h4>
            {recomendaciones.map((rec, index) => (
              <div key={index} className={styles.recomendacionItem}>
                <span className={styles.recomendacionIcon}>💡</span>
                <span className={styles.recomendacionTexto}>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      ) : (
      /* MODO COMPARADOR */
      <div className={styles.comparadorContent}>
        <p className={styles.modoDesc}>
          Compara hasta 3 capitales diferentes con el perfil <strong>{perfilActual.nombre}</strong> ({formatNumber(perfilActual.rentabilidadEsperada, 1)}% anual)
        </p>

        {/* Selector de Perfil y Horizonte */}
        <div className={styles.comparadorConfig}>
          <div className={styles.configItem}>
            <label className={styles.label}>Perfil de riesgo</label>
            <div className={styles.perfilesRow}>
              {(Object.keys(PERFILES) as PerfilInversor[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.perfilBtnSmall} ${perfil === key ? styles.activo : ''}`}
                  onClick={() => setPerfil(key)}
                >
                  {PERFILES[key].icon} {PERFILES[key].nombre}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.configItem}>
            <label className={styles.label}>Horizonte: {horizonteTemporal} años</label>
            <input
              type="range"
              className={styles.slider}
              min="1"
              max="30"
              value={horizonteTemporal}
              onChange={(e) => setHorizonteTemporal(parseInt(e.target.value))}
              aria-label="Horizonte temporal en años"
            />
          </div>
        </div>

        {/* Inputs de Escenarios */}
        <div className={styles.escenariosInputGrid}>
          <div className={styles.escenarioInput}>
            <label className={styles.escenarioLabel}>💰 Escenario 1</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={escenario1}
                onChange={(e) => setEscenario1(e.target.value)}
                placeholder="25000"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>
          <div className={styles.escenarioInput}>
            <label className={styles.escenarioLabel}>💰 Escenario 2</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={escenario2}
                onChange={(e) => setEscenario2(e.target.value)}
                placeholder="50000"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>
          <div className={styles.escenarioInput}>
            <label className={styles.escenarioLabel}>💰 Escenario 3</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={escenario3}
                onChange={(e) => setEscenario3(e.target.value)}
                placeholder="100000"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Evolución */}
        <div className={styles.graficoSection}>
          <h3 className={styles.sectionTitle}>📈 Evolución del Capital a {horizonteTemporal} años</h3>
          <div className={styles.chartContainer}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Cards de Resumen */}
        <div className={styles.escenariosGrid}>
          {datosComparador.resumenEscenarios.map((esc, idx) => (
            <div key={idx} className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioNum}>{esc.nombre}</span>
                <span className={styles.escenarioImporte}>{formatCurrency(esc.capitalInicial)}</span>
              </div>
              <div className={styles.escenarioBody}>
                <div className={styles.escenarioRow}>
                  <span>Capital final</span>
                  <strong>{formatCurrency(esc.capitalFinal)}</strong>
                </div>
                <div className={styles.escenarioRow}>
                  <span>Ganancia</span>
                  <strong className={styles.positivo}>+{formatCurrency(esc.ganancia)}</strong>
                </div>
                <div className={styles.escenarioRow}>
                  <span>Rentabilidad total</span>
                  <strong className={styles.positivo}>+{formatNumber(esc.porcentajeGanancia, 1)}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla Comparativa */}
        <div className={styles.comparativaEscenarios}>
          <h3>📊 Tabla Comparativa</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Escenario</th>
                  <th>Capital Inicial</th>
                  <th>Capital Final</th>
                  <th>Ganancia</th>
                  <th>% Rentabilidad</th>
                </tr>
              </thead>
              <tbody>
                {datosComparador.resumenEscenarios.map((esc, idx) => {
                  const mejorGanancia = Math.max(...datosComparador.resumenEscenarios.map(e => e.ganancia));
                  const esMejor = esc.ganancia === mejorGanancia && esc.ganancia > 0;
                  return (
                    <tr key={idx} className={esMejor ? styles.mejorEscenario : ''}>
                      <td>{esc.nombre}</td>
                      <td>{formatCurrency(esc.capitalInicial)}</td>
                      <td>{formatCurrency(esc.capitalFinal)}</td>
                      <td className={styles.positivo}>+{formatCurrency(esc.ganancia)}</td>
                      <td className={styles.positivo}>+{formatNumber(esc.porcentajeGanancia, 1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-inversiones"
        collapsible={false}
      />


      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres entender mejor la asignación de activos?"
        subtitle="Aprende los fundamentos de la diversificación y cómo construir una cartera equilibrada"
      >
        <section className={styles.guideSection}>
          <h2>Fundamentos de la Inversión</h2>
          <p className={styles.introParagraph}>
            La asignación de activos (asset allocation) es la estrategia de distribuir tu inversión
            entre diferentes tipos de activos para equilibrar riesgo y rentabilidad. Es más importante
            que la selección individual de valores: determina más del 90% del rendimiento de tu cartera.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📈 Renta Variable</h4>
              <p>
                Acciones y fondos de renta variable. Mayor potencial pero también caídas históricas del 30-55% en crisis.
                Rentabilidad histórica nominal: ~5-7% anual en mercados desarrollados ex-USA, ~7-10% en el S&amp;P 500 (1926-2023).
                Hay décadas en las que la renta variable no ha batido a la inflación (Japón 1990-2020, EEUU 1966-1982).
                Adecuada solo si puedes mantener la inversión 10+ años.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Renta Fija</h4>
              <p>
                Bonos y obligaciones. Menor rentabilidad pero más estabilidad.
                Actúa como amortiguador cuando la renta variable cae.
                Especialmente importante cerca de la jubilación.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💵 Liquidez</h4>
              <p>
                Efectivo y equivalentes (depósitos, monetarios). Rentabilidad mínima
                pero disponibilidad inmediata. Esencial para emergencias
                y oportunidades de inversión.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏠 Alternativos</h4>
              <p>
                Inmobiliario (REITs), materias primas, oro, cripto.
                Descorrelación con mercados tradicionales.
                Añaden diversificación pero con riesgos específicos.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>La Regla del 110</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📐 Fórmula Simple</h4>
              <p>
                % Renta Variable = 110 - tu edad. A los 30 años: 80% RV, 20% RF.
                A los 50 años: 60% RV, 40% RF. A los 65: 45% RV, 55% RF.
                Es una guía orientativa, no una regla absoluta.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔄 Rebalanceo</h4>
              <p>
                Revisa tu cartera anualmente y rebalancea si la distribución
                se desvía más de un 5% del objetivo. Vende lo que ha subido
                y compra lo que ha bajado: comprar barato, vender caro.
              </p>
            </div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9em', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Nota: esta heurística orientativa de la tradición anglosajona ignora factores clave como pensión pública española,
            patrimonio inmobiliario, situación familiar y tolerancia emocional real. No la apliques sin evaluar tu situación completa.
          </p>
        </section>

        {/* Tabla Comparativa de Tipos de Activos */}
        <section className={styles.eduComparativaSection}>
          <h2>Comparativa de Tipos de Activos</h2>
          <p className={styles.eduComparativaSubtitle}>
            Características clave de cada clase de activo para diseñar una cartera equilibrada
          </p>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduComparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>📈 Acciones RV</th>
                  <th>📊 Bonos RF</th>
                  <th>🏠 REITs</th>
                  <th>🪙 Materias Primas</th>
                  <th>💵 Liquidez</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Rentabilidad histórica nominal (referencia, no garantía)</strong></td>
                  <td>7–10%</td>
                  <td>3–5%</td>
                  <td>5–8%</td>
                  <td>2–5%</td>
                  <td>2–4%</td>
                </tr>
                <tr>
                  <td colSpan={6} style={{ fontSize: '0.85em', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    Las rentabilidades futuras pueden ser sustancialmente menores.
                  </td>
                </tr>
                <tr>
                  <td><strong>Volatilidad anual</strong></td>
                  <td>15–20%</td>
                  <td>5–8%</td>
                  <td>12–18%</td>
                  <td>15–25%</td>
                  <td>&lt;1%</td>
                </tr>
                <tr>
                  <td><strong>Horizonte ideal</strong></td>
                  <td>+10 años</td>
                  <td>3–7 años</td>
                  <td>+7 años</td>
                  <td>Táctica</td>
                  <td>1–3 años</td>
                </tr>
                <tr>
                  <td><strong>Correlación con RV</strong></td>
                  <td>Alta (+1)</td>
                  <td>Baja/negativa</td>
                  <td>Media (0,6)</td>
                  <td>Baja (0,2)</td>
                  <td>Ninguna</td>
                </tr>
                <tr>
                  <td><strong>Liquidez inmediata</strong></td>
                  <td>Alta (mercado)</td>
                  <td>Media</td>
                  <td>Alta (ETF)</td>
                  <td>Alta (ETF)</td>
                  <td>Inmediata</td>
                </tr>
                <tr>
                  <td><strong>Uso en cartera</strong></td>
                  <td>Motor de crecimiento</td>
                  <td>Amortiguador</td>
                  <td>Diversificación</td>
                  <td>Cobertura inflación</td>
                  <td>Fondo emergencia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso por Perfil de Inversor */}
        <section className={styles.eduEscenariosSection}>
          <h2>Carteras Reales por Perfil de Capital</h2>
          <p className={styles.eduEscenariosSubtitle}>
            Cómo distribuiría la calculadora distintos capitales según perfil y horizonte
          </p>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🌱</span>
                <h3>Primer inversor</h3>
              </div>
              <div className={styles.eduEscenarioExample}>
                <p>Configuración:</p>
                <code>Capital: 10.000€ · Perfil: Moderado · Horizonte: 10 años · Edad: 28</code>
              </div>
              <p className={styles.eduEscenarioTip}>
                <strong>Distribución: 30% RV · 50% RF · 15% Liquidez · 5% Alt.</strong> Capital modesto
                con horizonte medio. Priorizar fondos indexados de bajo coste. Meta: aprender
                gestionando sin riesgo excesivo.
              </p>
            </div>

            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🎯</span>
                <h3>Inversor intermedio</h3>
              </div>
              <div className={styles.eduEscenarioExample}>
                <p>Configuración:</p>
                <code>Capital: 50.000€ · Perfil: Equilibrado · Horizonte: 15 años · Edad: 38</code>
              </div>
              <p className={styles.eduEscenarioTip}>
                <strong>Distribución: 50% RV · 35% RF · 10% Liquidez · 5% Alt.</strong> Cartera 60/40
                clásica con mayor peso en renta variable. Ideal para objetivo de independencia financiera
                o complementar jubilación.
              </p>
            </div>

            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🚀</span>
                <h3>Inversor avanzado</h3>
              </div>
              <div className={styles.eduEscenarioExample}>
                <p>Configuración:</p>
                <code>Capital: 200.000€ · Perfil: Dinámico · Horizonte: 20 años · Edad: 42</code>
              </div>
              <p className={styles.eduEscenarioTip}>
                <strong>Distribución: 70% RV · 20% RF · 5% Liquidez · 5% Alt.</strong> Capital elevado
                permite mayor exposición a renta variable. Considera factor investing (small caps, value)
                y mercados emergentes para potenciar rentabilidad.
              </p>
            </div>

            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🛡️</span>
                <h3>Jubilado / Preservación</h3>
              </div>
              <div className={styles.eduEscenarioExample}>
                <p>Configuración:</p>
                <code>Capital: 300.000€ · Perfil: Conservador · Horizonte: 3 años · Edad: 65</code>
              </div>
              <p className={styles.eduEscenarioTip}>
                <strong>Distribución: 15% RV · 60% RF · 20% Liquidez · 5% Alt.</strong> Objetivo:
                preservar capital y generar rentas. Algunos estudios sugieren tasas de retirada del 3-4% anual
                sobre el capital inicial; este rango depende fuertemente de la composición de cartera y de la inflación.
                Para carteras muy conservadoras (15% RV), la tasa sostenible histórica es más cercana al 2,5-3%.
                Consulta a un asesor antes de planificar retiradas.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Avanzado */}
        <section className={styles.eduFaqSection}>
          <h2>Preguntas Frecuentes sobre Asignación de Activos</h2>
          <div className={styles.eduFaqList}>
            <div className={styles.eduFaqItem}>
              <h3>¿Qué es el Ratio Sharpe y cómo interpreto el que muestra la calculadora?</h3>
              <p>
                El <strong>Ratio Sharpe mide la rentabilidad ajustada al riesgo</strong>: cuánta rentabilidad
                extra obtienes por cada unidad de riesgo asumida. Un Sharpe &gt; 1 es bueno, &gt; 2 es excelente.
                Si la calculadora muestra 0,8 para tu perfil equilibrado, significa que por cada 1% de volatilidad
                extra, obtienes 0,8% de rentabilidad adicional sobre la tasa libre de riesgo.
              </p>
              <p className={styles.eduFaqTip}>
                💡 El perfil equilibrado suele tener el mejor Ratio Sharpe de todos, no el agresivo.
                Más rentabilidad bruta no significa mejor rentabilidad ajustada al riesgo.
              </p>
            </div>

            <div className={styles.eduFaqItem}>
              <h3>¿Cuándo y cómo debo rebalancear mi cartera?</h3>
              <p>
                Rebalancea cuando tu distribución real se desvíe <strong>más de un 5% del objetivo</strong>
                (por ejemplo: objetivo 50% RV y tienes 57% tras un año alcista en bolsa).
                Hazlo <strong>una vez al año</strong> o tras movimientos excepcionales del mercado.
                La forma más eficiente: añade nuevas aportaciones al activo infraponderado antes de vender.
              </p>
            </div>

            <div className={styles.eduFaqItem}>
              <h3>¿Qué diferencia hay entre un ETF y un fondo indexado?</h3>
              <p>
                Ambos replican un índice de forma pasiva, pero los ETFs <strong>cotizan en bolsa</strong>
                (puedes comprar/vender en cualquier momento de la sesión) mientras que los fondos indexados
                solo se valoran una vez al día. Los ETFs suelen tener menor TER pero requieren bróker.
                Los fondos indexados permiten traspasos sin tributación en España, ventaja fiscal exclusiva.
              </p>
            </div>

            <div className={styles.eduFaqItem}>
              <h3>¿Cuánto destruyen realmente las comisiones a largo plazo?</h3>
              <p>
                El impacto es devastador: <strong>1% anual de comisiones reduce el capital final en ~25%
                en 30 años</strong>. Con 100.000€ al 7% durante 30 años: sin comisiones → 761.000€;
                con 1% comisiones → 574.000€; con 2% comisiones → 432.000€. La diferencia (187.000€)
                se la lleva la gestora. Los ETFs de bajo coste tienen TER del 0,07–0,2%.
              </p>
            </div>

            <div className={styles.eduFaqItem}>
              <h3>¿Qué son los REITs y merece la pena incluirlos?</h3>
              <p>
                Los <strong>REITs (Real Estate Investment Trusts)</strong> son fondos de inversión inmobiliaria
                cotizados. Distribuyen el 90% de sus beneficios como dividendos, ofrecen exposición inmobiliaria
                sin comprar un piso y tienen correlación media con la renta variable. Son especialmente útiles
                como cobertura contra inflación y para diversificar sin sacrificar liquidez.
              </p>
              <p className={styles.eduFaqTip}>
                💡 Muchos ETFs globales ya incluyen REITs en su composición. Antes de añadirlos
                por separado, comprueba si tu ETF principal ya tiene exposición inmobiliaria.
              </p>
            </div>

            <div className={styles.eduFaqItem}>
              <h3>¿Cuándo usar el modo Comparador vs la Calculadora?</h3>
              <p>
                Usa la <strong>Calculadora</strong> para diseñar tu cartera según tu perfil y ver la proyección.
                Usa el <strong>Comparador</strong> para analizar distintos capitales con el mismo perfil:
                por ejemplo, si recibes una herencia y quieres ver si invertir 50.000€, 100.000€ o 150.000€
                cambia significativamente tu situación a 15 años.
              </p>
            </div>

            <div className={styles.eduFaqItem}>
              <h3>¿Es mejor invertir todo de golpe o en aportaciones periódicas?</h3>
              <p>
                Estadísticamente, invertir todo de golpe (<strong>lump sum</strong>) supera al DCA en ~2/3 de los casos
                porque el mercado sube más tiempo del que baja. Pero si tienes miedo a una caída justo después
                de invertir, el DCA mensual reduce el riesgo psicológico y garantiza disciplina. Para capitales
                grandes (herencias, bonus), considera un DCA de 6–12 meses como compromiso.
              </p>
            </div>

            <div className={styles.eduFaqItem}>
              <h3>¿Qué pasa si necesito el dinero antes del horizonte planificado?</h3>
              <p>
                Si necesitas retirar antes, hazlo en el siguiente orden de prioridad: <strong>primero liquidez</strong>
                (sin pérdidas), luego renta fija (pérdidas pequeñas), y solo en último lugar renta variable
                (puede estar en pérdidas). Por esto, el horizonte temporal es el factor más importante antes
                de elegir perfil. Si tienes dudas sobre cuándo necesitarás el dinero, sé más conservador.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.eduStepSection}>
          <h2>Cómo Construir tu Primera Cartera de Inversión en 7 Pasos</h2>
          <div className={styles.eduStepGuide}>
            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber}>1</div>
              <div className={styles.eduStepContent}>
                <h3>Define tu objetivo financiero concreto</h3>
                <p>
                  No &quot;quiero invertir&quot;, sino <strong>&quot;quiero 200.000€ en 20 años para la jubilación&quot;</strong>.
                  El objetivo determina el horizonte, que determina el perfil, que determina la distribución.
                  Sin objetivo claro, tenderás a cambiar de estrategia en cada crisis.
                </p>
              </div>
            </div>

            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber}>2</div>
              <div className={styles.eduStepContent}>
                <h3>Asegura tu colchón de emergencia antes de invertir</h3>
                <p>
                  <strong>3–6 meses de gastos fijos</strong> en una cuenta remunerada o fondo monetario.
                  Este dinero nunca se invierte. Sin colchón, venderás en el peor momento si surge un imprevisto,
                  cristalizando pérdidas y rompiendo el plan.
                </p>
              </div>
            </div>

            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber}>3</div>
              <div className={styles.eduStepContent}>
                <h3>Realiza el Test de Perfil Inversor honestamente</h3>
                <p>
                  Usa el <strong>Test de Perfil Inversor</strong> de meskeIA para obtener tu perfil real.
                  Responde cómo actuarías de verdad en una caída del 30%, no cómo crees que deberías actuar.
                  Un perfil agresivo que no puedes mantener en crisis es peor que uno conservador.
                </p>
              </div>
            </div>

            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber}>4</div>
              <div className={styles.eduStepContent}>
                <h3>Selecciona 2–3 ETFs de bajo coste como base</h3>
                <p>
                  Una cartera sencilla funciona: <strong>ETF global (MSCI World Acc) + ETF renta fija + liquidez</strong>.
                  No necesitas 15 fondos. La simplicidad reduce costes, errores y tentaciones de cambiar.
                  El TER total de tu cartera debería ser inferior al 0,3% anual.
                </p>
              </div>
            </div>

            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber}>5</div>
              <div className={styles.eduStepContent}>
                <h3>Abre una cuenta en un bróker de bajo coste</h3>
                <p>
                  Interactive Brokers, Trade Republic, MyInvestor, Indexa Capital o Finizens son opciones
                  populares en España. Compara <strong>comisiones de custodia, compraventa y cambio de divisa</strong>.
                  Para carteras pasivas, los robo-advisors como Indexa son una opción excelente para principiantes.
                </p>
              </div>
            </div>

            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber}>6</div>
              <div className={styles.eduStepContent}>
                <h3>Ejecuta y automatiza aportaciones periódicas</h3>
                <p>
                  Realiza la inversión inicial y configura <strong>aportaciones mensuales automáticas</strong>.
                  El DCA automático garantiza disciplina y elimina el &quot;timing&quot;. Trata la inversión como
                  un gasto fijo más, no como algo opcional que harás cuando &quot;sobre&quot; dinero.
                </p>
              </div>
            </div>

            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber}>7</div>
              <div className={styles.eduStepContent}>
                <h3>Revisa anualmente y rebalancea si es necesario</h3>
                <p>
                  Una vez al año, comprueba que la distribución real sigue alineada con tu objetivo.
                  Si la RV ha crecido del 50% al 60%, <strong>vende RV y compra RF</strong> para volver al 50/50.
                  No hagas cambios más frecuentes: el exceso de trading destruye rentabilidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.eduTipsSection}>
          <h2>6 Principios del Inversor Pasivo Exitoso</h2>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🌍</span>
              <h3>Diversifica por activo y geografía</h3>
              <p>
                Un ETF global cubre 1.500+ empresas de 23 países. No concentres en España,
                Europa ni en un solo sector.
              </p>
            </div>

            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🔄</span>
              <h3>Rebalancea una vez al año</h3>
              <p>
                El rebalanceo anual fuerza a comprar barato y vender caro sistemáticamente.
                Más frecuencia genera costes innecesarios.
              </p>
            </div>

            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>💸</span>
              <h3>Minimiza el TER total</h3>
              <p>
                El coste total de tu cartera debería ser inferior al 0,3% anual. Cada 0,1%
                adicional reduce significativamente el capital final a 20 años.
              </p>
            </div>

            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📅</span>
              <h3>No persigas rentabilidades pasadas</h3>
              <p>
                El fondo más rentable del año pasado raramente repite. Mantén tu estrategia
                y evita el &quot;chasing performance&quot;.
              </p>
            </div>

            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🏦</span>
              <h3>Separa objetivos por horizonte</h3>
              <p>
                Corto plazo (1–3 años) → liquidez/RF. Medio plazo (3–7 años) → mixto.
                Largo plazo (+10 años) → RV dominante.
              </p>
            </div>

            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🧘</span>
              <h3>Ignora el ruido del mercado</h3>
              <p>
                Las noticias económicas diarias son ruido para el inversor a largo plazo.
                Revisa tu cartera mensualmente, no diariamente.
              </p>
            </div>
          </div>
        </section>

        {/* Errores Comunes */}
        <div className={styles.eduWarningBox}>
          <div className={styles.eduWarningHeader}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <h3>Errores Comunes al Diseñar una Cartera de Inversión</h3>
          </div>
          <ul className={styles.eduWarningList}>
            <li>
              <strong>Sobreconcentrar en un solo activo o sector:</strong> Tener el 100% en acciones tecnológicas
              o en un único ETF de mercados emergentes aumenta innecesariamente el riesgo específico. La diversificación
              es el único &quot;almuerzo gratis&quot; en finanzas.
            </li>
            <li>
              <strong>Ignorar las comisiones de gestión:</strong> Un fondo activo al 2% de TER frente a un ETF al 0,1%
              supone una diferencia de 600.000€ en una cartera de 100.000€ a 30 años. Las comisiones se pagan siempre,
              ganes o pierdas.
            </li>
            <li>
              <strong>Rebalancear con demasiada frecuencia:</strong> Rebalancear mensualmente genera costes de transacción
              y posibles eventos fiscales. Una vez al año (o cuando la desviación supere el 5%) es suficiente y más eficiente.
            </li>
            <li>
              <strong>Perseguir la &quot;inversión del momento&quot;:</strong> Criptomonedas en 2021, tecnología en 2023,
              IA en 2024... Comprar lo que está de moda después de una gran subida es comprar caro. Tu perfil de riesgo,
              no las tendencias, debe guiar tu cartera.
            </li>
            <li>
              <strong>Mezclar el fondo de emergencia con la cartera de inversión:</strong> El fondo de emergencia debe
              estar siempre en liquidez inmediata. Mezclarlo con tu cartera te forzará a vender inversiones en mal momento
              cuando surja un imprevisto.
            </li>
            <li>
              <strong>Cambiar de estrategia en cada caída del mercado:</strong> Pasar de agresivo a conservador después
              de una caída del 20% cristaliza las pérdidas y te hace perderte el rebote. Los cambios de perfil deben
              obedecer a cambios en tu situación vital, no a los movimientos del mercado.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-inversiones')} />

      <ShareCard appName="estimador-inversiones" />
      <Footer appName="estimador-inversiones" />
    </div>
  );
}
