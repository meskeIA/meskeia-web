'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './TeoriaColas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Metricas {
  rho: number;      // Utilización del sistema
  L: number;        // Número promedio en el sistema
  Lq: number;       // Número promedio en cola
  W: number;        // Tiempo promedio en el sistema
  Wq: number;       // Tiempo promedio en cola
  P0: number;       // Probabilidad de sistema vacío
  estable: boolean; // Si el sistema es estable
}

interface SimulacionEvento {
  tiempo: number;
  tipo: 'llegada' | 'salida';
  clientesEnSistema: number;
  clientesEnCola: number;
}

export default function CalculadoraTeoriaColasPage() {
  // Estados para inputs
  const [lambda, setLambda] = useState<string>('5');
  const [mu, setMu] = useState<string>('8');

  // Estados para resultados
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);

  // Estados para simulación
  const [simulando, setSimulando] = useState(false);
  const [eventosSimulacion, setEventosSimulacion] = useState<SimulacionEvento[]>([]);
  const [estadisticasSimulacion, setEstadisticasSimulacion] = useState<{
    clientesAtendidos: number;
    tiempoTotal: number;
    utilizacionReal: number;
  } | null>(null);

  // Ref para canvas del gráfico
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calcular métricas M/M/1
  const calcularMetricas = () => {
    const tasaLlegada = parseFloat(lambda.replace(',', '.'));
    const tasaServicio = parseFloat(mu.replace(',', '.'));

    if (isNaN(tasaLlegada) || isNaN(tasaServicio) || tasaLlegada <= 0 || tasaServicio <= 0) {
      alert('Por favor, ingresa valores válidos mayores que 0');
      return;
    }

    const rho = tasaLlegada / tasaServicio;
    const estable = rho < 1;

    if (!estable) {
      setMetricas({
        rho,
        L: Infinity,
        Lq: Infinity,
        W: Infinity,
        Wq: Infinity,
        P0: 0,
        estable: false
      });
      setMostrarGrafico(true);
      return;
    }

    // Fórmulas M/M/1
    const L = tasaLlegada / (tasaServicio - tasaLlegada);
    const Lq = (tasaLlegada * tasaLlegada) / (tasaServicio * (tasaServicio - tasaLlegada));
    const W = 1 / (tasaServicio - tasaLlegada);
    const Wq = tasaLlegada / (tasaServicio * (tasaServicio - tasaLlegada));
    const P0 = 1 - rho;

    setMetricas({
      rho,
      L,
      Lq,
      W,
      Wq,
      P0,
      estable: true
    });
    setMostrarGrafico(true);
  };

  // Dibujar gráfico de probabilidades
  useEffect(() => {
    if (!mostrarGrafico || !metricas || !metricas.estable || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas para alta resolución
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Colores meskeIA
    const primary = '#2E86AB';
    const secondary = '#48A9A6';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1A1A1A';

    // Calcular probabilidades P(n) para n = 0 a 10
    const rho = metricas.rho;
    const probabilidades: number[] = [];
    const maxN = 10;

    for (let n = 0; n <= maxN; n++) {
      const Pn = (1 - rho) * Math.pow(rho, n);
      probabilidades.push(Pn);
    }

    const maxProb = Math.max(...probabilidades);
    const barWidth = chartWidth / (maxN + 1) - 10;

    // Dibujar ejes
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Etiquetas del eje Y
    ctx.fillStyle = textColor;
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const y = height - padding - (chartHeight * i / 5);
      const value = (maxProb * i / 5 * 100).toFixed(0);
      ctx.fillText(`${value}%`, padding - 10, y + 4);

      // Líneas de cuadrícula
      ctx.strokeStyle = '#E5E5E5';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Dibujar barras
    ctx.textAlign = 'center';
    probabilidades.forEach((prob, i) => {
      const x = padding + (i * (chartWidth / (maxN + 1))) + 5;
      const barHeight = (prob / maxProb) * chartHeight;
      const y = height - padding - barHeight;

      // Gradiente para la barra
      const gradient = ctx.createLinearGradient(x, y, x, height - padding);
      gradient.addColorStop(0, primary);
      gradient.addColorStop(1, secondary);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Etiqueta del eje X
      ctx.fillStyle = textColor;
      ctx.fillText(`n=${i}`, x + barWidth / 2, height - padding + 20);

      // Valor sobre la barra
      if (prob > 0.01) {
        ctx.fillText(`${(prob * 100).toFixed(1)}%`, x + barWidth / 2, y - 5);
      }
    });

    // Título del gráfico
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = primary;
    ctx.textAlign = 'center';
    ctx.fillText('Distribución de Probabilidad P(n) - Clientes en el Sistema', width / 2, 25);

  }, [mostrarGrafico, metricas]);

  // Ejecutar simulación de eventos discretos
  const ejecutarSimulacion = () => {
    const tasaLlegada = parseFloat(lambda.replace(',', '.'));
    const tasaServicio = parseFloat(mu.replace(',', '.'));

    if (isNaN(tasaLlegada) || isNaN(tasaServicio) || tasaLlegada <= 0 || tasaServicio <= 0) {
      alert('Primero calcula las métricas con valores válidos');
      return;
    }

    setSimulando(true);
    const eventos: SimulacionEvento[] = [];

    // Parámetros de simulación
    const tiempoSimulacion = 100; // 100 unidades de tiempo
    let tiempoActual = 0;
    let clientesEnSistema = 0;
    let clientesEnCola = 0;
    let proximaLlegada = -Math.log(Math.random()) / tasaLlegada;
    let proximaSalida = Infinity;
    let clientesAtendidos = 0;
    let tiempoOcupado = 0;

    while (tiempoActual < tiempoSimulacion && eventos.length < 200) {
      if (proximaLlegada < proximaSalida) {
        // Evento de llegada
        tiempoActual = proximaLlegada;
        clientesEnSistema++;

        if (clientesEnSistema === 1) {
          // Servidor estaba vacío, programar salida
          proximaSalida = tiempoActual + (-Math.log(Math.random()) / tasaServicio);
        } else {
          clientesEnCola = clientesEnSistema - 1;
        }

        eventos.push({
          tiempo: tiempoActual,
          tipo: 'llegada',
          clientesEnSistema,
          clientesEnCola: Math.max(0, clientesEnSistema - 1)
        });

        // Programar siguiente llegada
        proximaLlegada = tiempoActual + (-Math.log(Math.random()) / tasaLlegada);
      } else {
        // Evento de salida
        const tiempoAnterior = tiempoActual;
        tiempoActual = proximaSalida;
        tiempoOcupado += (tiempoActual - tiempoAnterior);
        clientesEnSistema--;
        clientesAtendidos++;

        if (clientesEnSistema > 0) {
          // Hay clientes esperando, programar siguiente salida
          proximaSalida = tiempoActual + (-Math.log(Math.random()) / tasaServicio);
        } else {
          proximaSalida = Infinity;
        }

        eventos.push({
          tiempo: tiempoActual,
          tipo: 'salida',
          clientesEnSistema,
          clientesEnCola: Math.max(0, clientesEnSistema - 1)
        });
      }
    }

    setEventosSimulacion(eventos);
    setEstadisticasSimulacion({
      clientesAtendidos,
      tiempoTotal: tiempoActual,
      utilizacionReal: tiempoOcupado / tiempoActual
    });
    setSimulando(false);
  };

  // Limpiar todo
  const limpiar = () => {
    setLambda('5');
    setMu('8');
    setMetricas(null);
    setMostrarGrafico(false);
    setEventosSimulacion([]);
    setEstadisticasSimulacion(null);
  };

  // Exportar reporte
  const exportarReporte = () => {
    if (!metricas) return;

    const tasaLlegada = parseFloat(lambda.replace(',', '.'));
    const tasaServicio = parseFloat(mu.replace(',', '.'));

    let reporte = `═══════════════════════════════════════════════════════════
        REPORTE DE ANÁLISIS - SISTEMA DE COLAS M/M/1
              Generado por meskeIA - ${new Date().toLocaleDateString('es-ES')}
═══════════════════════════════════════════════════════════

PARÁMETROS DE ENTRADA
─────────────────────
• Tasa de llegada (λ): ${formatNumber(tasaLlegada, 2)} clientes/hora
• Tasa de servicio (μ): ${formatNumber(tasaServicio, 2)} clientes/hora

MÉTRICAS CALCULADAS
─────────────────────
• Utilización del sistema (ρ): ${formatNumber(metricas.rho * 100, 2)}%
• Probabilidad sistema vacío (P₀): ${formatNumber(metricas.P0 * 100, 2)}%
`;

    if (metricas.estable) {
      reporte += `
• Clientes promedio en sistema (L): ${formatNumber(metricas.L, 4)}
• Clientes promedio en cola (Lq): ${formatNumber(metricas.Lq, 4)}
• Tiempo promedio en sistema (W): ${formatNumber(metricas.W * 60, 2)} minutos
• Tiempo promedio en cola (Wq): ${formatNumber(metricas.Wq * 60, 2)} minutos

INTERPRETACIÓN
─────────────────────
✓ El sistema es ESTABLE (ρ < 1)
✓ El servidor está ocupado el ${formatNumber(metricas.rho * 100, 1)}% del tiempo
✓ En promedio hay ${formatNumber(metricas.L, 1)} cliente(s) en el sistema
✓ Un cliente espera aproximadamente ${formatNumber(metricas.Wq * 60, 1)} minutos en la cola
`;
    } else {
      reporte += `
⚠️ SISTEMA INESTABLE
─────────────────────
El sistema NO es estable porque ρ ≥ 1.
La cola crecerá indefinidamente.

RECOMENDACIÓN: Aumentar la capacidad de servicio (μ)
o reducir la tasa de llegadas (λ).
`;
    }

    if (estadisticasSimulacion) {
      reporte += `
RESULTADOS DE SIMULACIÓN
─────────────────────
• Clientes atendidos: ${estadisticasSimulacion.clientesAtendidos}
• Tiempo total simulado: ${formatNumber(estadisticasSimulacion.tiempoTotal, 2)} horas
• Utilización real observada: ${formatNumber(estadisticasSimulacion.utilizacionReal * 100, 2)}%
`;
    }

    reporte += `
═══════════════════════════════════════════════════════════
              https://meskeia.com/calculadora-teoria-colas
═══════════════════════════════════════════════════════════
`;

    const blob = new Blob([reporte], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-colas-mm1-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cargar ejemplo
  const cargarEjemplo = () => {
    setLambda('5');
    setMu('8');
    setMetricas(null);
    setMostrarGrafico(false);
    setEventosSimulacion([]);
    setEstadisticasSimulacion(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📊 Calculadora Teoría de Colas M/M/1</h1>
        <p className={styles.subtitle}>
          Analiza sistemas de espera con métricas completas: utilización, longitud de cola y tiempos de espera
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Panel de entrada */}
      <div className={styles.inputPanel}>
        <h2 className={styles.panelTitle}>Parámetros del Sistema</h2>

        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="lambda" className={styles.label}>
              Tasa de llegada (λ)
              <span className={styles.labelUnit}>clientes/hora</span>
            </label>
            <input
              type="text"
              id="lambda"
              value={lambda}
              onChange={(e) => setLambda(e.target.value)}
              className={styles.input}
              placeholder="5"
            />
            <p className={styles.inputHelp}>Promedio de clientes que llegan por hora</p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="mu" className={styles.label}>
              Tasa de servicio (μ)
              <span className={styles.labelUnit}>clientes/hora</span>
            </label>
            <input
              type="text"
              id="mu"
              value={mu}
              onChange={(e) => setMu(e.target.value)}
              className={styles.input}
              placeholder="8"
            />
            <p className={styles.inputHelp}>Promedio de clientes atendidos por hora</p>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" onClick={calcularMetricas} className={styles.btnPrimary}>
            <span aria-hidden="true">📈</span> Calcular Métricas
          </button>
          <button type="button" onClick={cargarEjemplo} className={styles.btnSecondary}>
            <span aria-hidden="true">📋</span> Cargar Ejemplo
          </button>
          <button type="button" onClick={limpiar} className={styles.btnOutline}>
            <span aria-hidden="true">🗑️</span> Limpiar
          </button>
        </div>
      </div>

      {/* Resultados */}
      {metricas && (
        <div className={styles.resultsSection}>
          <h2 className={styles.panelTitle}>Resultados del Análisis</h2>

          {/* Estado del sistema */}
          <div className={metricas.estable ? styles.alertSuccess : styles.alertDanger}>
            {metricas.estable ? (
              <>
                <strong>✅ Sistema Estable</strong>
                <p>La utilización (ρ = {formatNumber(metricas.rho * 100, 2)}%) es menor al 100%. El sistema puede manejar la carga.</p>
              </>
            ) : (
              <>
                <strong>⚠️ Sistema Inestable</strong>
                <p>La utilización (ρ = {formatNumber(metricas.rho * 100, 2)}%) es igual o mayor al 100%. La cola crecerá indefinidamente.</p>
              </>
            )}
          </div>

          {/* Métricas principales */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon} aria-hidden="true">⚙️</div>
              <div className={styles.metricValue}>{formatNumber(metricas.rho * 100, 2)}%</div>
              <div className={styles.metricLabel}>Utilización (ρ)</div>
              <div className={styles.metricDesc}>Porcentaje de tiempo servidor ocupado</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} aria-hidden="true">🚪</div>
              <div className={styles.metricValue}>{formatNumber(metricas.P0 * 100, 2)}%</div>
              <div className={styles.metricLabel}>P₀ - Sistema Vacío</div>
              <div className={styles.metricDesc}>Probabilidad de no tener clientes</div>
            </div>

            {metricas.estable && (
              <>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} aria-hidden="true">👥</div>
                  <div className={styles.metricValue}>{formatNumber(metricas.L, 4)}</div>
                  <div className={styles.metricLabel}>L - En Sistema</div>
                  <div className={styles.metricDesc}>Clientes promedio en el sistema</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} aria-hidden="true">🚶</div>
                  <div className={styles.metricValue}>{formatNumber(metricas.Lq, 4)}</div>
                  <div className={styles.metricLabel}>Lq - En Cola</div>
                  <div className={styles.metricDesc}>Clientes promedio esperando</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} aria-hidden="true">⏱️</div>
                  <div className={styles.metricValue}>{formatNumber(metricas.W * 60, 2)} min</div>
                  <div className={styles.metricLabel}>W - Tiempo en Sistema</div>
                  <div className={styles.metricDesc}>Tiempo promedio total</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} aria-hidden="true">⏳</div>
                  <div className={styles.metricValue}>{formatNumber(metricas.Wq * 60, 2)} min</div>
                  <div className={styles.metricLabel}>Wq - Tiempo en Cola</div>
                  <div className={styles.metricDesc}>Tiempo promedio de espera</div>
                </div>
              </>
            )}
          </div>

          {/* Gráfico de probabilidades */}
          {metricas.estable && (
            <div className={styles.chartContainer}>
              <canvas ref={canvasRef} className={styles.chart} />
            </div>
          )}

          {/* Interpretación */}
          {metricas.estable && (
            <div className={styles.interpretacion}>
              <h3>📋 Interpretación de Resultados</h3>
              <ul>
                <li>El servidor está ocupado el <strong>{formatNumber(metricas.rho * 100, 1)}%</strong> del tiempo.</li>
                <li>En promedio hay <strong>{formatNumber(metricas.L, 1)}</strong> cliente(s) en el sistema.</li>
                <li>Un cliente espera aproximadamente <strong>{formatNumber(metricas.Wq * 60, 1)} minutos</strong> antes de ser atendido.</li>
                <li>El tiempo total en el sistema (espera + servicio) es de <strong>{formatNumber(metricas.W * 60, 1)} minutos</strong>.</li>
                <li>El sistema está vacío el <strong>{formatNumber(metricas.P0 * 100, 1)}%</strong> del tiempo.</li>
              </ul>
            </div>
          )}

          {/* Botones de acción */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              onClick={ejecutarSimulacion}
              className={styles.btnSecondary}
              disabled={simulando}
            >
              {simulando ? <><span aria-hidden="true">⏳</span> Simulando...</> : <><span aria-hidden="true">🎲</span> Ejecutar Simulación</>}
            </button>
            <button type="button" onClick={exportarReporte} className={styles.btnOutline}>
              <span aria-hidden="true">📄</span> Exportar Reporte
            </button>
          </div>
        </div>
      )}

      {/* Resultados de simulación */}
      {estadisticasSimulacion && (
        <div className={styles.simulacionSection}>
          <h2 className={styles.panelTitle}>🎲 Resultados de Simulación</h2>

          <div className={styles.simulacionStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Clientes atendidos:</span>
              <span className={styles.statValue}>{estadisticasSimulacion.clientesAtendidos}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Tiempo simulado:</span>
              <span className={styles.statValue}>{formatNumber(estadisticasSimulacion.tiempoTotal, 2)} horas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Utilización real:</span>
              <span className={styles.statValue}>{formatNumber(estadisticasSimulacion.utilizacionReal * 100, 2)}%</span>
            </div>
            {metricas && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Utilización teórica:</span>
                <span className={styles.statValue}>{formatNumber(metricas.rho * 100, 2)}%</span>
              </div>
            )}
          </div>

          {/* Tabla de eventos */}
          <div className={styles.eventosContainer}>
            <h3>Registro de Eventos (primeros 50)</h3>
            <div className={styles.eventosTable}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tiempo</th>
                    <th>Evento</th>
                    <th>En Sistema</th>
                    <th>En Cola</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosSimulacion.slice(0, 50).map((evento, idx) => (
                    <tr key={idx} className={evento.tipo === 'llegada' ? styles.llegada : styles.salida}>
                      <td>{idx + 1}</td>
                      <td>{formatNumber(evento.tiempo, 4)}</td>
                      <td>{evento.tipo === 'llegada' ? '📥 Llegada' : '📤 Salida'}</td>
                      <td>{evento.clientesEnSistema}</td>
                      <td>{evento.clientesEnCola}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="calculadora-teoria-colas">
        <p>Esta calculadora es una <strong>herramienta educativa</strong> para analizar sistemas de colas M/M/1:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Verifica resultados en análisis empresarial</strong>: Especialmente en diseño de servicios, optimización de recursos y simulación</li>
          <li><strong>Consulta con un especialista</strong>: Para decisiones críticas sobre dimensionamiento de sistemas reales</li>
        </ul>
      </DisclaimerCard>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre Teoría de Colas?"
        subtitle="Descubre conceptos clave, fórmulas y aplicaciones prácticas"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es la Teoría de Colas?</h2>
          <p className={styles.introParagraph}>
            La <strong>Teoría de Colas</strong> es una rama de la investigación operativa que estudia
            los sistemas de espera. Se aplica cuando hay clientes que llegan a un servicio y deben
            esperar si el servidor está ocupado.
          </p>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>🔤 Notación de Kendall</h4>
              <p>
                Los sistemas se clasifican con la notación A/S/c, donde:
              </p>
              <ul>
                <li><strong>A</strong>: Distribución de llegadas (M = Poisson)</li>
                <li><strong>S</strong>: Distribución de servicio (M = Exponencial)</li>
                <li><strong>c</strong>: Número de servidores (1 = un servidor)</li>
              </ul>
              <p>
                <strong>M/M/1</strong> significa: llegadas Poisson, servicio exponencial, 1 servidor.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>📐 Fórmulas M/M/1</h4>
              <ul>
                <li><strong>ρ = λ/μ</strong> - Utilización del sistema</li>
                <li><strong>L = λ/(μ-λ)</strong> - Clientes en sistema</li>
                <li><strong>Lq = λ²/(μ(μ-λ))</strong> - Clientes en cola</li>
                <li><strong>W = 1/(μ-λ)</strong> - Tiempo en sistema</li>
                <li><strong>Wq = λ/(μ(μ-λ))</strong> - Tiempo en cola</li>
                <li><strong>P₀ = 1-ρ</strong> - Probabilidad vacío</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>⚠️ Condición de Estabilidad</h4>
              <p>
                Para que el sistema sea <strong>estable</strong>, la tasa de llegadas debe ser
                menor que la tasa de servicio:
              </p>
              <p className={styles.formula}>
                <strong>ρ = λ/μ &lt; 1</strong>
              </p>
              <p>
                Si ρ ≥ 1, la cola crece indefinidamente y el sistema colapsa.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>🏪 Aplicaciones Prácticas</h4>
              <ul>
                <li>Cajas de supermercados</li>
                <li>Call centers</li>
                <li>Servidores web</li>
                <li>Bancos y cajeros</li>
                <li>Urgencias hospitalarias</li>
                <li>Tráfico de red</li>
              </ul>
            </div>
          </div>

          <h3>📖 Ley de Little</h3>
          <p>
            Una de las fórmulas más importantes de la teoría de colas es la <strong>Ley de Little</strong>:
          </p>
          <div className={styles.formulaBox}>
            <p className={styles.formula}><strong>L = λ × W</strong></p>
            <p>El número promedio de clientes en el sistema es igual a la tasa de llegadas
            multiplicada por el tiempo promedio en el sistema.</p>
          </div>

          <h3>🎯 Ejemplo Práctico</h3>
          <div className={styles.exampleBox}>
            <p><strong>Situación:</strong> Una ventanilla de banco recibe 5 clientes por hora (λ=5)
            y puede atender 8 clientes por hora (μ=8).</p>
            <ul>
              <li>Utilización: ρ = 5/8 = 62,5%</li>
              <li>Clientes en sistema: L = 5/(8-5) = 1,67</li>
              <li>Tiempo de espera: Wq = 5/(8×3) = 12,5 minutos</li>
            </ul>
          </div>
        </section>

        {/* 1. TABLA COMPARATIVA DE MODELOS */}
        <section>
          <h2 className={styles.guideSection && ''} style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '1rem' }}>
            📊 Comparativa de Modelos de Colas
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
            Elegir el modelo correcto es fundamental. Cada modelo tiene supuestos distintos y produce
            resultados diferentes. Usa esta tabla para identificar cuál se ajusta a tu sistema real.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Llegadas</th>
                  <th>Servicio</th>
                  <th>Servidores</th>
                  <th>Capacidad</th>
                  <th>Uso típico</th>
                  <th>Fórmula Lq</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>M/M/1</td>
                  <td>Poisson</td>
                  <td>Exponencial</td>
                  <td>1</td>
                  <td>Infinita</td>
                  <td>Cajero único, impresora de oficina</td>
                  <td>ρ² / (1 - ρ)</td>
                </tr>
                <tr>
                  <td>M/M/c</td>
                  <td>Poisson</td>
                  <td>Exponencial</td>
                  <td>c ≥ 2</td>
                  <td>Infinita</td>
                  <td>Call center con 5 agentes, banco con 3 ventanillas</td>
                  <td>Erlang C × ρ / (c(1-ρ/c))</td>
                </tr>
                <tr>
                  <td>M/D/1</td>
                  <td>Poisson</td>
                  <td>Determinista</td>
                  <td>1</td>
                  <td>Infinita</td>
                  <td>Línea de montaje automatizada, semáforos con ciclo fijo</td>
                  <td>ρ² / (2(1 - ρ))</td>
                </tr>
                <tr>
                  <td>M/G/1</td>
                  <td>Poisson</td>
                  <td>General</td>
                  <td>1</td>
                  <td>Infinita</td>
                  <td>Soporte técnico con tiempos de resolución variables</td>
                  <td>ρ² (1 + Cs²) / (2(1 - ρ))</td>
                </tr>
                <tr>
                  <td>M/M/1/K</td>
                  <td>Poisson</td>
                  <td>Exponencial</td>
                  <td>1</td>
                  <td>K máx.</td>
                  <td>Buffer de router con límite, sala de espera con aforo</td>
                  <td>Suma finita de estados P(n)·(n-1)</td>
                </tr>
                <tr>
                  <td>M/M/c/K</td>
                  <td>Poisson</td>
                  <td>Exponencial</td>
                  <td>c ≥ 2</td>
                  <td>K máx.</td>
                  <td>Urgencias hospitalarias con camas limitadas (K=20, c=5)</td>
                  <td>Erlang B + estados intermedios</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CASOS DE USO */}
        <section>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            👥 Casos de Uso por Perfil Profesional
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            La teoría de colas se aplica en sectores muy distintos. Estos son ejemplos reales con
            parámetros concretos que puedes reproducir directamente en la calculadora.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📞</span>
                <h4>Gerente de Call Center</h4>
              </div>
              <div className={styles.escenarioExample}>
                <strong>Objetivo:</strong> Dimensionar agentes para SLA del 80% de llamadas atendidas
                en menos de 20 segundos. Con λ = 120 llamadas/hora y μ = 30 llamadas/hora por agente,
                necesitas al menos 5 agentes (M/M/c) para mantener ρ por agente = 0,80.
              </div>
              <p className={styles.escenarioTip}>
                Tip: Con M/M/1 la cola colapsa. Usa M/M/5 y comprueba que Wq &lt; 20 s con Erlang C.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌐</span>
                <h4>Ingeniero de Redes</h4>
              </div>
              <div className={styles.escenarioExample}>
                <strong>Objetivo:</strong> Calcular el tamaño de buffer de un router con tráfico de
                10 Mbps de entrada y capacidad de enlace de 15 Mbps. Modelo M/M/1/K con K = 500
                paquetes. Con ρ = 0,67 la probabilidad de descarte es &lt; 0,1%.
              </div>
              <p className={styles.escenarioTip}>
                Tip: Si el coeficiente de variación del paquete &gt; 1, usa M/G/1 para no subestimar Lq.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏥</span>
                <h4>Responsable de Urgencias Hospitalarias</h4>
              </div>
              <div className={styles.escenarioExample}>
                <strong>Objetivo:</strong> Estimar tiempos de espera por nivel de triaje. Pacientes
                críticos (nivel 1): λ = 2/h, μ = 6/h → Wq = 3,3 min. Pacientes nivel 3: λ = 8/h,
                μ = 10/h → Wq = 24 min. Usa M/M/c/K por aforo limitado de camas (K = 20).
              </div>
              <p className={styles.escenarioTip}>
                Tip: Modela cada nivel de triaje como una cola separada con prioridad no expulsiva.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚙️</span>
                <h4>Desarrollador de Sistemas</h4>
              </div>
              <div className={styles.escenarioExample}>
                <strong>Objetivo:</strong> Diseñar el rate limiting de una API con 500 rps de tráfico
                y 800 rps de capacidad de procesamiento. Modelo M/M/1: ρ = 0,625, Wq = 1,67 ms.
                Para microservicios con 3 instancias usa M/M/3 y reduce Wq a 0,22 ms.
              </div>
              <p className={styles.escenarioTip}>
                Tip: Mide la distribución real de latencia antes de asumir servicio exponencial.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            ❓ Preguntas Frecuentes sobre Teoría de Colas
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            Respuestas directas a las dudas más habituales al aplicar la teoría de colas en proyectos reales.
          </p>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué significa M/M/1 exactamente?</strong>
              <p>
                Es la notación de Kendall A/S/c. La primera M indica que las llegadas siguen un proceso
                de Poisson (intervalos exponenciales). La segunda M indica que el tiempo de servicio es
                también exponencial. El 1 es el número de servidores. Por tanto, M/M/1 es el modelo más
                simple: un solo servidor con ambas distribuciones memoryless.
              </p>
            </div>

            <div className={styles.faqItem}>
              <strong>¿Qué es la intensidad de tráfico ρ y por qué importa tanto?</strong>
              <p>
                ρ = λ/μ es la fracción del tiempo que el servidor está ocupado (utilización).
                Si ρ = 0,75, el servidor trabaja el 75% del tiempo. Cuando ρ se acerca a 1,
                las métricas se disparan de forma no lineal: con ρ = 0,9 la cola es 9 veces mayor
                que con ρ = 0,5. Este comportamiento hiperbólico es el motivo por el que pequeñas
                mejoras en capacidad producen grandes reducciones en espera.
              </p>
              <div className={styles.faqTip}>
                Ejemplo: Con λ=9 y μ=10 (ρ=0,9), Lq = 8,1 clientes. Con λ=5 y μ=10 (ρ=0,5), Lq = 0,5 clientes.
              </div>
            </div>

            <div className={styles.faqItem}>
              <strong>¿Cuándo colapsa una cola y cómo evitarlo?</strong>
              <p>
                Una cola colapsa cuando ρ ≥ 1 (λ ≥ μ). La longitud de la cola tiende a infinito
                porque llegan más clientes de los que se pueden atender. Para evitarlo: (1) aumentar
                la tasa de servicio μ reduciendo el tiempo medio de atención, (2) añadir servidores
                pasando de M/M/1 a M/M/c, (3) limitar la capacidad con M/M/1/K rechazando clientes
                cuando se supera K, o (4) reducir λ con prioridades o reservas.
              </p>
            </div>

            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre Lq y Wq?</strong>
              <p>
                Lq es el <strong>número medio de clientes esperando en la cola</strong> (sin contar al que
                está siendo atendido). Wq es el <strong>tiempo medio que un cliente espera en la cola</strong>
                antes de ser atendido. Están relacionados por la Ley de Little: Lq = λ × Wq.
                Si Lq = 2 clientes y λ = 5 clientes/hora, entonces Wq = 0,4 horas = 24 minutos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <strong>¿Cómo se aplica la Ley de Little en la práctica?</strong>
              <p>
                L = λ × W relaciona el número medio en el sistema con el tiempo medio y la tasa de llegadas.
                Aplicación práctica: si observas que hay de media 10 personas en una sala de espera (L=10)
                y llegan 20 por hora (λ=20), puedes calcular que cada persona espera W = L/λ = 0,5 h = 30 min,
                sin necesidad de conocer la distribución del servicio.
              </p>
            </div>

            <div className={styles.faqItem}>
              <strong>¿Cuántos servidores necesito para mantener ρ &lt; 0,8?</strong>
              <p>
                Si la tasa de llegadas total es λ y cada servidor tiene capacidad μ, necesitas al menos
                c = ceil(λ / (0,8 × μ)) servidores. Ejemplo: λ = 40 llamadas/hora, μ = 15 llamadas/hora
                por agente → c = ceil(40 / 12) = ceil(3,33) = 4 agentes. Con 4 agentes, ρ por agente =
                40/(4×15) = 0,667, que está por debajo del umbral de 0,8.
              </p>
              <div className={styles.faqTip}>
                Regla práctica: Diseña con ρ = 0,75 para tener margen ante picos de demanda del 25%.
              </div>
            </div>

            <div className={styles.faqItem}>
              <strong>¿Qué es el coeficiente de variación y cuándo cambia el modelo?</strong>
              <p>
                El coeficiente de variación Cs = σ/μ_s mide la variabilidad relativa del tiempo de
                servicio (desviación típica / media). Si Cs = 1 el servicio es exponencial (M/M/1).
                Si Cs = 0 el servicio es determinista (M/D/1, con Lq exactamente la mitad que M/M/1).
                Si Cs &gt; 1 la variabilidad es alta y M/G/1 con la fórmula de Pollaczek-Khinchine
                dará Lq mayor que M/M/1.
              </p>
            </div>

            <div className={styles.faqItem}>
              <strong>¿Cómo mejoro el tiempo de espera sin añadir servidores?</strong>
              <p>
                Existen cuatro estrategias sin aumentar capacidad: (1) <strong>Reducir la variabilidad
                del servicio</strong>: pasar de Cs=1,5 a Cs=0,5 puede reducir Lq hasta un 50%.
                (2) <strong>Implementar prioridades</strong>: atender primero a clientes de mayor valor
                sin coste adicional. (3) <strong>Suavizar la demanda</strong>: redirigir llegadas a
                horas valle con incentivos. (4) <strong>Aumentar el autoservicio</strong>: delegar
                tareas simples al cliente (check-in online, FAQ automatizado).
              </p>
            </div>
          </div>
        </section>

        {/* 4. GUÍA PASO A PASO */}
        <section>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            🗺️ Guía Paso a Paso: Dimensionar un Sistema de Atención al Cliente
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            Sigue este proceso de 7 pasos para aplicar la teoría de colas a cualquier sistema real,
            desde un call center hasta un servicio web con alta concurrencia.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <strong>Medir la tasa de llegadas λ</strong>
                <p>
                  Registra el número de clientes/solicitudes por unidad de tiempo durante al menos
                  2 semanas. Identifica picos diarios y semanales. Ejemplo: un e-commerce recibe
                  240 pedidos/hora en hora punta (18:00–20:00) → λ = 240/hora = 4/minuto.
                  Elige la unidad de tiempo consistente para todo el análisis.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <strong>Medir el tiempo de servicio y calcular μ</strong>
                <p>
                  Registra la duración de al menos 100 atenciones individuales. Calcula la media
                  y la desviación típica. Si el tiempo medio es 3 minutos, μ = 20 clientes/hora.
                  Calcula también <code>Cs = σ / media</code> para elegir el modelo correcto.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <strong>Calcular la intensidad de tráfico ρ</strong>
                <p>
                  Con un servidor: <code>ρ = λ/μ</code>. Con c servidores: <code>ρ = λ/(c·μ)</code>.
                  Si ρ ≥ 1 el sistema no puede absorber la carga; necesitas más capacidad antes
                  de continuar. Objetivo inicial: ρ &lt; 0,8 para tener margen ante variaciones.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <strong>Elegir el modelo de cola adecuado</strong>
                <p>
                  Si Cs ≈ 1 y un solo servidor → M/M/1. Si hay varios servidores → M/M/c.
                  Si el servicio es casi constante (Cs &lt; 0,3) → M/D/1 (Lq 50% menor).
                  Si hay límite de capacidad (sala de espera, buffer) → M/M/1/K o M/M/c/K.
                  Usa la tabla comparativa de arriba para decidir.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <strong>Calcular Lq y Wq con las fórmulas del modelo</strong>
                <p>
                  Para M/M/1: <code>Lq = ρ²/(1-ρ)</code> y <code>Wq = Lq/λ</code>.
                  Para M/M/c usa la fórmula de Erlang C para obtener la probabilidad de espera
                  y luego <code>Wq = P(espera) / (c·μ - λ)</code>.
                  Expresa Wq en las unidades que tengan sentido para el negocio (segundos, minutos).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <strong>Interpretar los resultados contra los SLA</strong>
                <p>
                  Compara Wq con el objetivo de tiempo de espera. Ejemplo: SLA = 2 minutos,
                  Wq calculado = 3,8 minutos → el sistema no cumple. Calcula el número de
                  servidores c necesario para que Wq &lt; 2 min. Prueba c = 2, 3... hasta
                  que se cumpla el SLA con ρ razonable (&lt; 0,85).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">7</div>
              <div className={styles.stepContent}>
                <strong>Recomendar mejoras y validar con simulación</strong>
                <p>
                  Propón el número de servidores óptimo, la reducción de variabilidad de servicio
                  o la redistribución de la demanda. Valida los resultados ejecutando la simulación
                  de eventos discretos integrada en esta calculadora. Compara la utilización real
                  observada con la teórica (ρ). Una diferencia &lt; 5% confirma la validez del modelo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            ✅ Mejores Prácticas para Dimensionar Sistemas de Colas
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            Principios que aplican ingenieros y operadores experimentados para obtener sistemas
            eficientes sin sobredimensionar recursos ni comprometer la experiencia del usuario.
          </p>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <h4>Mantener ρ &lt; 0,80 como regla de oro</h4>
                <p>
                  Con ρ = 0,8 la cola media es 4 veces la del sistema al 50%. Diseña con margen:
                  si tu carga media es 70%, puedes absorber picos del 25% sin colapso. En sistemas
                  críticos (urgencias, tráfico de red) baja el umbral a ρ &lt; 0,70.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <h4>Medir la variabilidad antes de elegir modelo</h4>
                <p>
                  Calcula siempre el coeficiente de variación Cs del tiempo de servicio.
                  Si Cs = 1,5 en lugar de 1,0 y usas M/M/1, subestimarás Lq en un 37%.
                  Con Cs = 0,5 (servicio más regular) sobreestimarás y malgastarás recursos.
                  Mide primero, modela después.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👥</span>
              <div>
                <h4>Preferir M/M/c a varios M/M/1 independientes</h4>
                <p>
                  Un sistema con 3 servidores compartidos (M/M/3) produce colas más cortas
                  que 3 colas independientes con un servidor cada una. La cola común elimina
                  el desequilibrio de carga. Ejemplo: call center con cola única vs. 3 colas
                  por agente → Wq se reduce hasta un 40%.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⭐</span>
              <div>
                <h4>Implementar prioridades para clientes premium</h4>
                <p>
                  Las colas con prioridades (M/G/1 con prioridad no expulsiva) permiten reducir
                  el tiempo de espera de clientes de alto valor sin añadir servidores. Si el 20%
                  de clientes aportan el 80% del ingreso, priorizarlos reduce su Wq a menos de
                  la mitad sin perjudicar significativamente al resto.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🕐</span>
              <div>
                <h4>Modelar la demanda por franjas horarias</h4>
                <p>
                  No uses un único λ diario: modela por franjas de 30 minutos. Un restaurante
                  con λ medio = 20 clientes/hora puede tener λ = 60 clientes/hora entre 13:30 y
                  14:30. Dimensiona para el pico o implementa recursos variables (personal
                  por turnos, auto-escalado en cloud).
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <div>
                <h4>Reducir variabilidad antes que añadir capacidad</h4>
                <p>
                  Estandarizar los procesos de servicio (scripts, automatización parcial) puede
                  reducir Cs de 1,5 a 0,8 y disminuir Lq en un 30–40% sin contratar más personal.
                  En sistemas web, usar timeouts y circuit breakers estabiliza μ y evita
                  el efecto cascada cuando un servicio se degrada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h4>Errores de dimensionamiento que colapsan el sistema</h4>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Diseñar con ρ &gt; 0,90:</strong> A partir de ρ = 0,9 la cola crece de forma
              exponencial. Con ρ = 0,95 la cola es 19 veces mayor que con ρ = 0,5. Cualquier
              pico puntual del 6% empujará el sistema al colapso total.
            </li>
            <li>
              <strong>Ignorar la variabilidad del servicio:</strong> Asumir servicio exponencial
              (M/M/1) cuando el proceso es casi determinista (Cs ≈ 0) sobreestima Lq en un 50%.
              Inversamente, ignorar alta variabilidad (Cs &gt; 1,5) lleva a subdimensionar gravemente.
            </li>
            <li>
              <strong>No considerar los efectos de hora punta:</strong> Usar λ promedio diario
              en lugar de λ pico puede llevar a un dimensionamiento 2–3 veces insuficiente.
              El colapso siempre ocurre en los 30–60 minutos de mayor demanda, no en el promedio.
            </li>
            <li>
              <strong>Confundir tiempo en sistema (W) con tiempo en cola (Wq):</strong> W incluye
              el tiempo de servicio; Wq solo el tiempo de espera antes de ser atendido.
              Reportar W como &quot;tiempo de espera&quot; al cliente siempre da un número inflado.
              La diferencia es exactamente 1/μ (tiempo medio de servicio).
            </li>
            <li>
              <strong>Suponer llegadas Poisson sin verificar:</strong> Si los clientes llegan en
              grupos (batch arrivals), en ráfagas (tráfico web con picos correlacionados) o con
              citas previas, el proceso no es Poisson. Usar M/M/1 en estos casos puede subestimar
              la cola real por un factor de 3x o más.
            </li>
            <li>
              <strong>Olvidar el coste de servidores ociosos frente al coste de espera:</strong>
              Aumentar de c=4 a c=5 puede reducir Wq de 8 min a 2 min, pero el servidor adicional
              estará ocioso el 40% del tiempo. Haz siempre el análisis coste/beneficio: coste
              de espera (churn, penalización SLA) vs. coste de capacidad adicional.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-teoria-colas')} />

      <ShareCard appName="calculadora-teoria-colas" />
      <Footer appName="calculadora-teoria-colas" />
    </div>
  );
}
