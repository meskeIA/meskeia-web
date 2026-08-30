'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './EstimadorInflacion.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { IPC_DATA, IPC_YEARS as YEARS } from '@/data/ipc-ine';

type ModoApp = 'calculadora' | 'comparador';

interface DatosPeriodo {
  nombre: string;
  añoInicio: number;
  añoFin: number;
  ipcInicio: number;
  ipcFin: number;
  inflacionAcumulada: number;
  inflacionMediaAnual: number;
  años: number;
  datosGrafico: { año: number; ipc: number }[];
  color: string;
}

export default function CalculadoraInflacionPage() {
  const [cantidad, setCantidad] = useState('1000');
  const [añoOrigen, setAñoOrigen] = useState(2000);
  const [añoDestino, setAñoDestino] = useState(2025);

  // Estado para modo comparador
  const [modo, setModo] = useState<ModoApp>('calculadora');
  const [periodo1Inicio, setPeriodo1Inicio] = useState(2000);
  const [periodo1Fin, setPeriodo1Fin] = useState(2010);
  const [periodo2Inicio, setPeriodo2Inicio] = useState(2010);
  const [periodo2Fin, setPeriodo2Fin] = useState(2020);
  const [periodo3Inicio, setPeriodo3Inicio] = useState(2020);
  const [periodo3Fin, setPeriodo3Fin] = useState(2025);

  // Referencias para Chart.js
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const resultado = useMemo(() => {
    const cantidadNum = parseSpanishNumber(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) return null;

    const ipcOrigen = IPC_DATA[añoOrigen];
    const ipcDestino = IPC_DATA[añoDestino];

    if (!ipcOrigen || !ipcDestino) return null;

    // Cálculo del valor equivalente
    const valorEquivalente = (cantidadNum * ipcDestino) / ipcOrigen;

    // Inflación acumulada
    const inflacionAcumulada = ((ipcDestino - ipcOrigen) / ipcOrigen) * 100;

    // Años transcurridos
    const años = Math.abs(añoDestino - añoOrigen);

    // Inflación media anual (si hay más de 0 años)
    const inflacionMediaAnual = años > 0
      ? (Math.pow(ipcDestino / ipcOrigen, 1 / años) - 1) * 100
      : 0;

    // Pérdida/ganancia de poder adquisitivo
    const diferencia = valorEquivalente - cantidadNum;

    return {
      valorEquivalente,
      inflacionAcumulada,
      inflacionMediaAnual,
      diferencia,
      años,
      ipcOrigen,
      ipcDestino,
    };
  }, [cantidad, añoOrigen, añoDestino]);

  // Cálculos para el modo comparador
  const datosComparador = useMemo((): DatosPeriodo[] => {
    const colores = ['#2E86AB', '#48A9A6', '#7FB3D3'];
    const periodos = [
      { inicio: periodo1Inicio, fin: periodo1Fin, nombre: 'Periodo 1' },
      { inicio: periodo2Inicio, fin: periodo2Fin, nombre: 'Periodo 2' },
      { inicio: periodo3Inicio, fin: periodo3Fin, nombre: 'Periodo 3' },
    ];

    return periodos.map((p, index) => {
      const ipcInicio = IPC_DATA[p.inicio] || 0;
      const ipcFin = IPC_DATA[p.fin] || 0;
      const años = Math.abs(p.fin - p.inicio);

      // Inflación acumulada
      const inflacionAcumulada = ipcInicio > 0
        ? ((ipcFin - ipcInicio) / ipcInicio) * 100
        : 0;

      // Inflación media anual
      const inflacionMediaAnual = años > 0 && ipcInicio > 0
        ? (Math.pow(ipcFin / ipcInicio, 1 / años) - 1) * 100
        : 0;

      // Datos para el gráfico (IPC normalizado a base 100)
      const datosGrafico: { año: number; ipc: number }[] = [];
      const añoMin = Math.min(p.inicio, p.fin);
      const añoMax = Math.max(p.inicio, p.fin);

      for (let año = añoMin; año <= añoMax; año++) {
        if (IPC_DATA[año]) {
          // Normalizar a base 100 desde el inicio del periodo
          const ipcNormalizado = ipcInicio > 0
            ? (IPC_DATA[año] / ipcInicio) * 100
            : 0;
          datosGrafico.push({ año, ipc: ipcNormalizado });
        }
      }

      return {
        nombre: `${p.inicio} - ${p.fin}`,
        añoInicio: p.inicio,
        añoFin: p.fin,
        ipcInicio,
        ipcFin,
        inflacionAcumulada,
        inflacionMediaAnual,
        años,
        datosGrafico,
        color: colores[index],
      };
    });
  }, [periodo1Inicio, periodo1Fin, periodo2Inicio, periodo2Fin, periodo3Inicio, periodo3Fin]);

  // Encontrar el periodo con mayor inflación
  const periodoMayorInflacion = useMemo(() => {
    if (datosComparador.length === 0) return null;
    return datosComparador.reduce((max, periodo) =>
      periodo.inflacionAcumulada > max.inflacionAcumulada ? periodo : max
    );
  }, [datosComparador]);

  // Effect para el gráfico Chart.js
  useEffect(() => {
    if (modo !== 'comparador' || !chartRef.current || datosComparador.length === 0) return;

    // Destruir gráfico anterior
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Encontrar el rango máximo de años para el eje X
    const todosLosAños = datosComparador.flatMap(p =>
      p.datosGrafico.map(d => d.año)
    );
    const añoMinGlobal = Math.min(...todosLosAños);
    const añoMaxGlobal = Math.max(...todosLosAños);

    // Crear datasets para cada periodo
    const datasets = datosComparador.map((periodo) => ({
      label: periodo.nombre,
      data: periodo.datosGrafico.map(d => ({
        x: d.año,
        y: d.ipc,
      })),
      borderColor: periodo.color,
      backgroundColor: periodo.color + '20',
      borderWidth: 3,
      fill: false,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
    }));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 14 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
              title: (items) => `Año ${items[0].parsed.x}`,
              label: (context) => {
                const valor = context.parsed.y;
                return `${context.dataset.label}: ${formatNumber(valor ?? 0, 2)} (base 100)`;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: añoMinGlobal,
            max: añoMaxGlobal,
            title: {
              display: true,
              text: 'Año',
              font: { size: 14, weight: 'bold' },
            },
            ticks: {
              stepSize: 1,
              callback: (value) => Math.floor(Number(value)).toString(),
            },
            grid: {
              color: 'rgba(0,0,0,0.05)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'IPC (Base 100 = inicio periodo)',
              font: { size: 14, weight: 'bold' },
            },
            grid: {
              color: 'rgba(0,0,0,0.05)',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [modo, datosComparador]);

  const intercambiarAños = () => {
    setAñoOrigen(añoDestino);
    setAñoDestino(añoOrigen);
  };

  // Ejemplos históricos
  const ejemplosHistoricos = [
    { año: 1975, evento: 'Fin del franquismo', ipc: IPC_DATA[1975] },
    { año: 1986, evento: 'España entra en CEE', ipc: IPC_DATA[1986] },
    { año: 2002, evento: 'Llegada del Euro', ipc: IPC_DATA[2002] },
    { año: 2008, evento: 'Crisis financiera', ipc: IPC_DATA[2008] },
    { año: 2020, evento: 'Pandemia COVID-19', ipc: IPC_DATA[2020] },
    { año: 2022, evento: 'Crisis energética', ipc: IPC_DATA[2022] },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📈 Estimador de Inflación</h1>
        <p className={styles.subtitle}>
          Descubre cómo la inflación afecta tu dinero con datos históricos del INE
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Selector de modo */}
      <div className={styles.modoSelector}>
        <button
          type="button"
          onClick={() => setModo('calculadora')}
          className={`${styles.modoBtn} ${modo === 'calculadora' ? styles.modoActivo : ''}`}
          aria-pressed={modo === 'calculadora'}
        >
          <span className={styles.modoIcon} aria-hidden="true">🧮</span>
          <span className={styles.modoNombre}>Calculadora</span>
        </button>
        <button
          type="button"
          onClick={() => setModo('comparador')}
          className={`${styles.modoBtn} ${modo === 'comparador' ? styles.modoActivo : ''}`}
          aria-pressed={modo === 'comparador'}
        >
          <span className={styles.modoIcon} aria-hidden="true">📊</span>
          <span className={styles.modoNombre}>Comparador</span>
        </button>
      </div>

      {modo === 'calculadora' ? (
      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Configura el cálculo</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Cantidad en euros (€)</label>
            <input
              type="text"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className={styles.input}
              placeholder="1000"
            />
          </div>

          <div className={styles.yearSelectors}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Año origen</label>
              <select
                value={añoOrigen}
                onChange={(e) => setAñoOrigen(Number(e.target.value))}
                className={styles.select}
                title="Selecciona el año de origen"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={intercambiarAños}
              className={styles.swapButton}
              title="Intercambiar años"
            >
              ⇄
            </button>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Año destino</label>
              <select
                value={añoDestino}
                onChange={(e) => setAñoDestino(Number(e.target.value))}
                className={styles.select}
                title="Selecciona el año de destino"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Presets rápidos */}
          <div className={styles.presets}>
            <span className={styles.presetsLabel}>Comparar con:</span>
            <div className={styles.presetButtons}>
              <button type="button" onClick={() => { setAñoOrigen(2000); setAñoDestino(2025); }} className={styles.presetBtn}>
                2000 → Hoy
              </button>
              <button type="button" onClick={() => { setAñoOrigen(2010); setAñoDestino(2025); }} className={styles.presetBtn}>
                2010 → Hoy
              </button>
              <button type="button" onClick={() => { setAñoOrigen(2020); setAñoDestino(2025); }} className={styles.presetBtn}>
                2020 → Hoy
              </button>
              <button type="button" onClick={() => { setAñoOrigen(2002); setAñoDestino(2025); }} className={styles.presetBtn}>
                Euro → Hoy
              </button>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.mainResult}>
                <div className={styles.resultLabel}>
                  {formatCurrency(parseSpanishNumber(cantidad))} de {añoOrigen} equivalen a:
                </div>
                <div className={styles.resultValue}>
                  {formatCurrency(resultado.valorEquivalente)}
                </div>
                <div className={styles.resultSubtext}>en {añoDestino}</div>
              </div>

              <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${resultado.inflacionAcumulada >= 0 ? styles.negative : styles.positive}`}>
                  <div className={styles.statIcon}>{resultado.inflacionAcumulada >= 0 ? '📉' : '📈'}</div>
                  <div className={styles.statValue}>
                    {resultado.inflacionAcumulada >= 0 ? '+' : ''}{formatNumber(resultado.inflacionAcumulada, 2)}%
                  </div>
                  <div className={styles.statLabel}>Inflación acumulada</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📊</div>
                  <div className={styles.statValue}>
                    {formatNumber(resultado.inflacionMediaAnual, 2)}%
                  </div>
                  <div className={styles.statLabel}>Media anual</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📅</div>
                  <div className={styles.statValue}>{resultado.años}</div>
                  <div className={styles.statLabel}>Años transcurridos</div>
                </div>

                <div className={`${styles.statCard} ${resultado.diferencia >= 0 ? styles.negative : styles.positive}`}>
                  <div className={styles.statIcon}>💸</div>
                  <div className={styles.statValue}>
                    {resultado.diferencia >= 0 ? '+' : ''}{formatCurrency(resultado.diferencia)}
                  </div>
                  <div className={styles.statLabel}>
                    {resultado.diferencia >= 0 ? 'Necesitas más' : 'Ahorras'}
                  </div>
                </div>
              </div>

              {/* Interpretación */}
              <div className={styles.interpretation}>
                <h3>💡 Interpretación</h3>
                {añoOrigen < añoDestino ? (
                  <p>
                    Si en <strong>{añoOrigen}</strong> tenías <strong>{formatCurrency(parseSpanishNumber(cantidad))}</strong>,
                    necesitarías <strong>{formatCurrency(resultado.valorEquivalente)}</strong> en <strong>{añoDestino}</strong> para
                    mantener el mismo poder adquisitivo. La inflación ha hecho que tu dinero pierda
                    un <strong>{formatNumber(resultado.inflacionAcumulada, 1)}%</strong> de su valor.
                  </p>
                ) : (
                  <p>
                    <strong>{formatCurrency(parseSpanishNumber(cantidad))}</strong> de <strong>{añoOrigen}</strong> tenían
                    el mismo poder adquisitivo que <strong>{formatCurrency(resultado.valorEquivalente)}</strong> en <strong>{añoDestino}</strong>.
                    El dinero valía {resultado.inflacionAcumulada < 0 ? 'más' : 'menos'} en aquel entonces.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>📈</div>
              <p>Introduce una cantidad válida para ver los resultados</p>
            </div>
          )}
        </div>
      </div>
      ) : (
      /* Modo Comparador */
      <div className={styles.comparadorContent}>
        <div className={styles.comparadorIntro}>
          <h2 className={styles.panelTitle}>📊 Compara diferentes periodos históricos</h2>
          <p className={styles.comparadorDesc}>
            Selecciona 3 periodos para comparar cómo evolucionó la inflación en cada uno
          </p>
        </div>

        {/* Selectores de periodos */}
        <div className={styles.periodosInputGrid}>
          {/* Periodo 1 */}
          <div className={styles.periodoCard}>
            <div className={styles.periodoHeader} style={{ borderColor: '#2E86AB' }}>
              <span className={styles.periodoNumero}>1</span>
              <span>Periodo 1</span>
            </div>
            <div className={styles.periodoInputs}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Desde</label>
                <select
                  value={periodo1Inicio}
                  onChange={(e) => setPeriodo1Inicio(Number(e.target.value))}
                  className={styles.select}
                  title="Año de inicio del periodo 1"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Hasta</label>
                <select
                  value={periodo1Fin}
                  onChange={(e) => setPeriodo1Fin(Number(e.target.value))}
                  className={styles.select}
                  title="Año de fin del periodo 1"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Periodo 2 */}
          <div className={styles.periodoCard}>
            <div className={styles.periodoHeader} style={{ borderColor: '#48A9A6' }}>
              <span className={styles.periodoNumero}>2</span>
              <span>Periodo 2</span>
            </div>
            <div className={styles.periodoInputs}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Desde</label>
                <select
                  value={periodo2Inicio}
                  onChange={(e) => setPeriodo2Inicio(Number(e.target.value))}
                  className={styles.select}
                  title="Año de inicio del periodo 2"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Hasta</label>
                <select
                  value={periodo2Fin}
                  onChange={(e) => setPeriodo2Fin(Number(e.target.value))}
                  className={styles.select}
                  title="Año de fin del periodo 2"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Periodo 3 */}
          <div className={styles.periodoCard}>
            <div className={styles.periodoHeader} style={{ borderColor: '#7FB3D3' }}>
              <span className={styles.periodoNumero}>3</span>
              <span>Periodo 3</span>
            </div>
            <div className={styles.periodoInputs}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Desde</label>
                <select
                  value={periodo3Inicio}
                  onChange={(e) => setPeriodo3Inicio(Number(e.target.value))}
                  className={styles.select}
                  title="Año de inicio del periodo 3"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Hasta</label>
                <select
                  value={periodo3Fin}
                  onChange={(e) => setPeriodo3Fin(Number(e.target.value))}
                  className={styles.select}
                  title="Año de fin del periodo 3"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de evolución */}
        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>📈 Evolución del IPC (Base 100 = inicio de cada periodo)</h3>
          <div className={styles.chartContainer}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Cards de resumen */}
        <div className={styles.resumenCards}>
          {datosComparador.map((periodo, index) => (
            <div
              key={index}
              className={`${styles.resumenCard} ${periodoMayorInflacion?.nombre === periodo.nombre ? styles.mejorOpcion : ''}`}
              style={{ borderTopColor: periodo.color }}
            >
              {periodoMayorInflacion?.nombre === periodo.nombre && (
                <span className={styles.mejorBadge}>🔥 Mayor inflación</span>
              )}
              <h4 className={styles.resumenTitulo}>{periodo.nombre}</h4>
              <div className={styles.resumenValor}>
                {formatNumber(periodo.inflacionAcumulada, 2)}%
              </div>
              <div className={styles.resumenLabel}>Inflación acumulada</div>
              <div className={styles.resumenDetalle}>
                <span>{formatNumber(periodo.inflacionMediaAnual, 2)}% anual</span>
                <span>{periodo.años} años</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla comparativa */}
        <div className={styles.tablaSection}>
          <h3 className={styles.tablaTitle}>📋 Comparación detallada</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  {datosComparador.map((p, i) => (
                    <th key={i} style={{ color: p.color }}>{p.nombre}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IPC inicio</td>
                  {datosComparador.map((p, i) => (
                    <td key={i}>{formatNumber(p.ipcInicio, 2)}</td>
                  ))}
                </tr>
                <tr>
                  <td>IPC fin</td>
                  {datosComparador.map((p, i) => (
                    <td key={i}>{formatNumber(p.ipcFin, 2)}</td>
                  ))}
                </tr>
                <tr>
                  <td>Inflación acumulada</td>
                  {datosComparador.map((p, i) => (
                    <td key={i} className={p.inflacionAcumulada > 50 ? styles.valorAlto : ''}>
                      {formatNumber(p.inflacionAcumulada, 2)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Inflación media anual</td>
                  {datosComparador.map((p, i) => (
                    <td key={i}>{formatNumber(p.inflacionMediaAnual, 2)}%</td>
                  ))}
                </tr>
                <tr>
                  <td>Duración</td>
                  {datosComparador.map((p, i) => (
                    <td key={i}>{p.años} años</td>
                  ))}
                </tr>
                <tr>
                  <td>100€ al inicio valdrían</td>
                  {datosComparador.map((p, i) => (
                    <td key={i}>{formatCurrency(100 * (1 + p.inflacionAcumulada / 100))}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* Hitos históricos */}
      <div className={styles.historicalSection}>
        <h2 className={styles.sectionTitle}>📅 Hitos históricos del IPC en España</h2>
        <div className={styles.timelineGrid}>
          {ejemplosHistoricos.map((item) => (
            <button
              key={item.año}
              type="button"
              onClick={() => { setAñoOrigen(item.año); setAñoDestino(2025); }}
              className={styles.timelineCard}
            >
              <div className={styles.timelineYear}>{item.año}</div>
              <div className={styles.timelineEvent}>{item.evento}</div>
              <div className={styles.timelineIpc}>IPC: {formatNumber(item.ipc, 2)}</div>
            </button>
          ))}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-inflacion"
        collapsible={false}
      />
{/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor la inflación?"
        subtitle="Aprende cómo afecta a tu economía personal y estrategias para protegerte"
      >
        {/* TABLA COMPARATIVA */}
        <section className={styles.eduComparativa}>
          <h2>📊 Tipos de inflación en España: características y efectos sobre tu economía</h2>
          <p className={styles.eduIntro}>
            No toda inflación afecta igual a tu patrimonio. Conocer el tipo de inflación que estás viviendo te ayuda a tomar mejores decisiones de ahorro e inversión.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de inflación</th>
                  <th>Tasa anual</th>
                  <th>Ejemplo histórico (España)</th>
                  <th>Efecto en ahorros</th>
                  <th>Estrategia recomendada</th>
                  <th>Señal de alarma</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Deflación</strong></td>
                  <td>&lt;0%</td>
                  <td>2009, 2014-2016 (España)</td>
                  <td>✅ Aumenta valor real</td>
                  <td>Efectivo, bonos soberanos, esperar compras grandes</td>
                  <td>Retraso consumo, espiral deflacionaria</td>
                </tr>
                <tr>
                  <td><strong>Inflación baja/estable</strong></td>
                  <td>0-2%</td>
                  <td>2004-2006, 2018-2019</td>
                  <td>⚠️ Pequeña pérdida anual</td>
                  <td>Fondos indexados, depósitos &gt;2%, IBEX diversificado</td>
                  <td>Ninguna (situación óptima según BCE)</td>
                </tr>
                <tr>
                  <td><strong>Inflación moderada</strong></td>
                  <td>2-5%</td>
                  <td>2001-2003, 2021</td>
                  <td>❌ Pérdida real notable</td>
                  <td>Renta variable, inmuebles, bonos ligados IPC</td>
                  <td>Deuda variable sube, hipoteca euríbor encarecer</td>
                </tr>
                <tr>
                  <td><strong>Inflación alta</strong></td>
                  <td>5-10%</td>
                  <td>2022 (8,3% media)</td>
                  <td>🔴 Pérdida grave del poder adquisitivo</td>
                  <td>Activos reales (oro, materias primas, REITs), TIPS</td>
                  <td>BCE sube tipos → hipotecas variables +200 €/mes</td>
                </tr>
                <tr>
                  <td><strong>Inflación muy alta</strong></td>
                  <td>10-50%</td>
                  <td>1977 (26,4%), 1977-1983</td>
                  <td>🔴🔴 Destrucción masiva de ahorro</td>
                  <td>Diversificación máxima, activos indexados al IPC</td>
                  <td>Salarios reales negativos, malestar social</td>
                </tr>
                <tr>
                  <td><strong>Hiperinflación</strong></td>
                  <td>&gt;50%/mes</td>
                  <td>No en España (sí Argentina, Zimbabwe)</td>
                  <td>🔴🔴🔴 Moneda sin valor</td>
                  <td>Activos reales, divisas extranjeras, criptomonedas</td>
                  <td>Colapso económico, fin del sistema monetario</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.eduEscenarios}>
          <h2>💼 Cómo te afecta la inflación según tu situación financiera</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💰</span>
                <h3>Ahorros en cuenta corriente</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> 20.000 € en cuenta con 0% de rentabilidad. Inflación 2022: 8,3%.</p>
                <code>Pérdida real: 20.000 × 8,3% = -1.660 € en poder adquisitivo</code>
              </div>
              <p className={styles.escenarioTip}><strong>Impacto:</strong> Al cabo de 10 años con inflación media del 3%, esos 20.000 € solo &quot;valdrán&quot; 14.880 € en términos reales. Si el dinero no rinde al menos la inflación, pierde valor cada año.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <h3>Hipoteca a tipo variable (euríbor)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> Hipoteca de 200.000 € a euríbor+0,5%. Euríbor pasó de 0% (2021) a 4,2% (2023).</p>
                <code>Cuota mensual: 850 € → 1.210 € (+360 €/mes = +4.320 €/año)</code>
              </div>
              <p className={styles.escenarioTip}><strong>Impacto:</strong> La inflación obliga al BCE a subir tipos, lo que eleva el euríbor. Una hipoteca variable se encarece precisamente cuando más sube el coste de la vida. Doble golpe al bolsillo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👔</span>
                <h3>Salario sin revisión anual</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> Salario 30.000 €/año sin subida. Inflación acumulada 2021-2022: 12%.</p>
                <code>Pérdida poder adquisitivo real: 30.000 × 12% = -3.600 €/año</code>
              </div>
              <p className={styles.escenarioTip}><strong>Impacto:</strong> Si tu salario no sube al menos con el IPC, pierdes poder adquisitivo real cada año. Negociar una revisión IPC anual en tu contrato es una de las protecciones más eficaces contra la inflación.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📈</span>
                <h3>Inversión en bolsa diversificada</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> 10.000 € en fondo indexado MSCI World. Rentabilidad histórica ~7%/año. Inflación media España ~3%.</p>
                <code>Rentabilidad real neta: 7% - 3% = +4% anual = +10.000 € en 18 años</code>
              </div>
              <p className={styles.escenarioTip}><strong>Impacto:</strong> La renta variable históricamente supera la inflación en el largo plazo. No garantiza nada a corto plazo, pero es una de las pocas clases de activos que han preservado el poder adquisitivo de forma consistente durante décadas.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏘️</span>
                <h3>Compra de vivienda como inversión</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> Piso comprado en 2010 por 180.000 €. Precio actual (2025): ~240.000 €. Inflación acumulada 2010-2025: ~28%.</p>
                <code>Revalorización nominal: +33% | Revalorización real: ~+4%</code>
              </div>
              <p className={styles.escenarioTip}><strong>Impacto:</strong> El ladrillo se percibe como protección contra la inflación, pero hay que descontar la inflación acumulada para ver la ganancia real. Además, los gastos de mantenimiento, comunidad e IBI reducen aún más la rentabilidad neta real.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👴</span>
                <h3>Pensión de jubilación</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong> Pensión de 1.200 €/mes en 2010. Revalorización media anual: 0,25% (2013-2022). Inflación media: 2,5%.</p>
                <code>Pérdida poder adquisitivo real: 1.200 × (2,25% × 12) = -324 €/mes real en 12 años</code>
              </div>
              <p className={styles.escenarioTip}><strong>Impacto:</strong> Las pensiones revalorizadas por debajo del IPC pierden poder adquisitivo real año a año. Desde 2023 se revalorizan al IPC real, pero los años anteriores implicaron pérdidas acumuladas significativas para los pensionistas.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>❓ Preguntas frecuentes sobre la inflación y tu economía</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia hay entre IPC general, IPC subyacente e IPCA?</h4>
              <p>
                El <strong>IPC general</strong> incluye todos los bienes y servicios, incluyendo energía y alimentos frescos (los más volátiles). El <strong>IPC subyacente</strong> excluye energía y alimentos no elaborados, dando una imagen más estable de la tendencia real. El <strong>IPCA</strong> (Índice de Precios al Consumo Armonizado) es comparable entre países europeos y es el que usa el BCE para fijar la política monetaria.
              </p>
              <p className={styles.faqTip}>💡 <strong>Cuándo mirar cuál:</strong> Para negociar salario, usa el IPC general. Para entender tendencias de largo plazo, usa el IPC subyacente. Para comparar con Europa, usa el IPCA.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo calcula el INE el IPC y por qué no me representa?</h4>
              <p>
                El INE calcula el IPC usando una <strong>cesta de la compra promedio</strong> de los hogares españoles (unos 500 artículos con distintos pesos). El peso de la vivienda es del ~27%, el transporte ~15%, la alimentación ~20%. Si tus gastos difieren mucho de la media (por ejemplo, pagas alquiler alto en Madrid), tu inflación personal puede ser bastante superior a la oficial. La inflación que sientes es real, aunque el dato estadístico sea distinto.
              </p>
              <p className={styles.faqTip}>💡 <strong>Tip:</strong> Calcula tu IPC personal: haz una lista de tus gastos mensuales y compara los precios de hace 1 año. Tu &quot;cesta personal&quot; puede mostrar una inflación del 5-15% cuando el dato oficial es del 2%.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué el BCE tiene un objetivo del 2% y no del 0%?</h4>
              <p>
                Un poco de inflación (2%) es beneficioso porque: incentiva el consumo y la inversión (si los precios van a subir, mejor comprar/invertir ahora), da margen al BCE para bajar tipos en crisis, y evita la deflación (que es más difícil de combatir). Cero inflación es peligroso porque puede derivar en deflación (espiral de precios a la baja → menos consumo → menos producción → desempleo → Japón 1990-2020).
              </p>
              <p className={styles.faqTip}>💡 <strong>Dato:</strong> El objetivo del 2% no es arbitrario: es el punto donde la inflación &quot;lubrica&quot; la economía sin erosionar el poder adquisitivo de forma perceptible en el día a día.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué activos protegen mejor contra la inflación en España?</h4>
              <p>
                Históricamente en España: <strong>Fondos indexados globales (MSCI World)</strong> han dado ~7% nominal (~4% real). <strong>Inmobiliario en grandes ciudades</strong>: rentabilidad variable pero buena cobertura a largo plazo. <strong>Bonos ligados al IPC (OBEIs)</strong>: rentabilidad garantizada sobre el IPC. <strong>Oro</strong>: buena cobertura en periodos de inflación extrema. Los <strong>depósitos y cuentas de ahorro</strong> solo protegen si la tasa supera el IPC.
              </p>
              <p className={styles.faqTip}>💡 <strong>Regla de oro:</strong> Tasa real = Tasa nominal - Inflación. Si el depósito da 2% y la inflación es 3%, tu tasa real es -1%: estás perdiendo dinero en términos reales.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo es mejor pedir una hipoteca: con inflación alta o baja?</h4>
              <p>
                Con inflación alta, los tipos de interés (la tasa de interés que pagas por el crédito) suben (el BCE sube el euríbor para frenar la inflación), lo que encarece las hipotecas. Sin embargo, si la inflación es persistente y tu salario sube con ella, la cuota hipotecaria se vuelve relativamente más barata en términos reales con el tiempo. La lección del 2022: pedir hipoteca variable justo antes de una subida inflacionaria es muy arriesgado. Una hipoteca fija protege de este escenario.
              </p>
              <p className={styles.faqTip}>💡 <strong>Estrategia:</strong> En momentos de inflación baja y tipos bajos = hipoteca fija para asegurar condiciones. En momentos de tipos altos = hipoteca variable apostando a que bajen (más riesgo).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo afecta la inflación a mi plan de jubilación?</h4>
              <p>
                Si planeas jubilarte en 30 años con 1.000.000 € ahorrados, necesitas tener en cuenta que ese millón valdrá mucho menos en términos reales. Con inflación media del 2,5%, en 30 años ese millón equivaldrá en poder adquisitivo a unos <strong>475.000 € de hoy</strong>. Por eso los planes de pensiones deben invertir en activos que superen la inflación (renta variable) y no solo en depósitos o bonos de bajo rendimiento.
              </p>
              <p className={styles.faqTip}>💡 <strong>Calculadora:</strong> Usa la herramienta meskeIA de Calculadora Jubilación para simular tus necesidades ajustadas a la inflación.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es la &quot;inflación percibida&quot; y por qué suele ser mayor que la oficial?</h4>
              <p>
                La inflación percibida es lo que sentimos que suben los precios, generalmente más alta que el IPC oficial. Razones: tendemos a recordar mejor los productos que más han subido (sesgo de negatividad), compramos más frecuentemente alimentos (que suelen subir más), y el IPC promedia toda España, no tu ciudad específica. En Madrid y Barcelona, el coste de la vivienda eleva la inflación personal muy por encima de la media nacional.
              </p>
              <p className={styles.faqTip}>💡 <strong>Tip:</strong> Usa la calculadora meskeIA para ver la inflación de periodos específicos relevantes para ti, no solo el dato anual promedio.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo ha sido más alta la inflación en España y qué pasó?</h4>
              <p>
                El máximo histórico fue en <strong>1977: 26,4%</strong>, durante la crisis del petróleo y la transición política. En los años 80 se redujo gradualmente gracias a la política monetaria restrictiva. La entrada en la CEE en 1986 y más tarde el euro en 2002 ancló las expectativas inflacionarias. El segundo gran episodio fue <strong>2022: 8,3%</strong> por la crisis energética post-COVID y la guerra de Ucrania, el mayor en 40 años.
              </p>
              <p className={styles.faqTip}>💡 <strong>Dato histórico:</strong> Con la calculadora puedes ver que 1.000 € de 1977 equivalen a más de 45.000 € hoy. La inflación acumulada en España desde 1961 supera el 4.000%.</p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2>📋 Cómo proteger tus ahorros de la inflación: plan de acción</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Calcula tu inflación personal real</h4>
                <p>Revisa tus gastos del año pasado y compáralos con el actual. Divide tus gastos en categorías (vivienda, alimentación, transporte, ocio) y calcula qué ha subido más. Si tu vivienda es de alquiler y ha subido un 10%, tu inflación personal es muy superior a la media. Esta calculadora te ayuda a comparar cualquier importe entre cualquier año desde 1961.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Evalúa tu exposición: ¿tienes dinero &quot;parado&quot;?</h4>
                <p>Identifica cuánto dinero tienes en cuentas corrientes sin rentabilidad o depósitos por debajo del IPC. Ese dinero pierde poder adquisitivo cada año. Una regla práctica: el dinero que no necesitas en los próximos 6-12 meses debería estar en algún activo que rinda por encima de la inflación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Diversifica en activos anti-inflación</h4>
                <p>Distribuye tu ahorro entre: fondo de emergencia en cuenta remunerada (3-6 meses de gastos), inversión a largo plazo en fondos indexados globales (horizonte &gt;5 años), y opcionalmente inmobiliario o bonos ligados al IPC si tienes capital suficiente. La diversificación reduce el riesgo sin sacrificar la protección contra la inflación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Negocia tu salario con el IPC como referencia</h4>
                <p>Antes de cualquier negociación salarial, consulta el IPC del último año (disponible en INE.es). Si la inflación fue del 3,5% y te ofrecen una subida del 1%, estás aceptando una bajada de sueldo real del 2,5%. Argumenta con datos concretos y pide al menos la inflación acumulada desde tu última revisión salarial.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Revisa tu hipoteca: ¿fija o variable?</h4>
                <p>Si tienes hipoteca variable y estamos en ciclo de inflación alta (BCE subiendo tipos), considera subrogarte a tipo fijo para protegerte de nuevas subidas. Si los tipos están altos y se espera que bajen, una variable puede ser más ventajosa. Usa la calculadora de amortización de meskeIA para comparar el coste total en diferentes escenarios de euríbor.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Ajusta tu presupuesto a la nueva realidad de precios</h4>
                <p>En períodos de inflación alta, revisa tu presupuesto mensual al menos trimestralmente. Identifica gastos que han subido mucho y busca alternativas: marcas blancas, negociación de contratos (seguro, telefonía, energía), revisión de suscripciones. Un hogar bien gestionado puede reducir su inflación personal 2-3 puntos por debajo de la media con pequeños ajustes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.eduTips}>
          <h2>✅ Claves para interpretar y usar los datos de inflación</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <h4>Usa periodos relevantes para ti</h4>
              <p>No te limites a &quot;el último año&quot;. Compara desde cuando compraste tu casa, empezaste a trabajar o comenzaste a ahorrar. Los datos del INE desde 1961 te dan una perspectiva completa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔢</span>
              <h4>Distingue nominal de real</h4>
              <p>Si alguien te dice &quot;mi sueldo ha subido un 5%&quot;, pregunta si es nominal o real. Si la inflación fue 4%, la subida real fue solo el 1%. Los datos nominales siempre engañan sin el contexto inflacionario.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌍</span>
              <h4>Compara con la inflación europea</h4>
              <p>El IPCA armonizado permite comparar España con la eurozona. Si España tiene más inflación que Alemania, nuestra competitividad exportadora se deteriora. Afecta al empleo y al crecimiento.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h4>IPC ≠ tu inflación personal</h4>
              <p>El IPC es una media nacional. Si eres inquilino en Madrid o Barcelona, tu inflación real puede superar en 3-5 puntos la media. Calcula tu cesta personalizada para tener datos más útiles.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <h4>La energía amplifica la volatilidad</h4>
              <p>El IPC subyacente (sin energía) es mucho más estable. Cuando el petróleo o el gas sube bruscamente, el IPC general se dispara. Mira el subyacente para entender la tendencia real de la economía.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <h4>Inflación y tipos de interés van juntos</h4>
              <p>Inflación alta → BCE sube el tipo de interés (también llamado tasa de interés) → euríbor sube → hipotecas variables más caras. Inflación baja → BCE baja tipos → mejores condiciones de crédito. El ciclo inflacionario impacta directamente en el coste de tu deuda.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores frecuentes al interpretar la inflación que te cuestan dinero</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Confundir inflación interanual con mensual:</strong> &quot;La inflación bajó al 2%&quot; puede significar que sigue subiendo, solo que más despacio. Bajada de inflación ≠ bajada de precios.</li>
            <li><strong>❌ Dejar todo el ahorro en cuenta corriente &quot;para ver qué pasa&quot;:</strong> Con inflación media del 2,5%, en 10 años habrás perdido el 22% del valor real sin hacer nada. La inacción tiene coste.</li>
            <li><strong>❌ Interpretar subida salarial nominal como ganancia real:</strong> Una subida del 3% con inflación del 4% es una pérdida de poder adquisitivo del 1%. Siempre resta la inflación para conocer la variación real.</li>
            <li><strong>❌ Pensar que los inmuebles siempre superan la inflación:</strong> En periodos como 2007-2015, el inmobiliario en España cayó un 40% nominal mientras la inflación seguía acumulándose. La rentabilidad real fue devastadora para quienes compraron en el pico.</li>
            <li><strong>❌ Ignorar la inflación al calcular la rentabilidad de inversiones:</strong> Un fondo que dio 5% nominal en un año con 4% de inflación solo dio 1% real. Los rankings de fondos casi siempre muestran rentabilidades nominales.</li>
            <li><strong>❌ Asumir que las pensiones seguirán el IPC:</strong> Entre 2013 y 2022, las pensiones se revalorizaron al 0,25% anual mientras el IPC acumulaba ~15%. Los futuros jubilados deben planificar con ahorro complementario.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-inflacion')} />

      <ShareCard appName="estimador-inflacion" />
      <Footer appName="estimador-inflacion" />
    </div>
  );
}
