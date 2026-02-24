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
          <button onClick={calcularMetricas} className={styles.btnPrimary}>
            📈 Calcular Métricas
          </button>
          <button onClick={cargarEjemplo} className={styles.btnSecondary}>
            📋 Cargar Ejemplo
          </button>
          <button onClick={limpiar} className={styles.btnOutline}>
            🗑️ Limpiar
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
              <div className={styles.metricIcon}>⚙️</div>
              <div className={styles.metricValue}>{formatNumber(metricas.rho * 100, 2)}%</div>
              <div className={styles.metricLabel}>Utilización (ρ)</div>
              <div className={styles.metricDesc}>Porcentaje de tiempo servidor ocupado</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>🚪</div>
              <div className={styles.metricValue}>{formatNumber(metricas.P0 * 100, 2)}%</div>
              <div className={styles.metricLabel}>P₀ - Sistema Vacío</div>
              <div className={styles.metricDesc}>Probabilidad de no tener clientes</div>
            </div>

            {metricas.estable && (
              <>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>👥</div>
                  <div className={styles.metricValue}>{formatNumber(metricas.L, 4)}</div>
                  <div className={styles.metricLabel}>L - En Sistema</div>
                  <div className={styles.metricDesc}>Clientes promedio en el sistema</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>🚶</div>
                  <div className={styles.metricValue}>{formatNumber(metricas.Lq, 4)}</div>
                  <div className={styles.metricLabel}>Lq - En Cola</div>
                  <div className={styles.metricDesc}>Clientes promedio esperando</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>⏱️</div>
                  <div className={styles.metricValue}>{formatNumber(metricas.W * 60, 2)} min</div>
                  <div className={styles.metricLabel}>W - Tiempo en Sistema</div>
                  <div className={styles.metricDesc}>Tiempo promedio total</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>⏳</div>
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
              onClick={ejecutarSimulacion}
              className={styles.btnSecondary}
              disabled={simulando}
            >
              {simulando ? '⏳ Simulando...' : '🎲 Ejecutar Simulación'}
            </button>
            <button onClick={exportarReporte} className={styles.btnOutline}>
              📄 Exportar Reporte
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
        title="📚 ¿Quieres aprender más sobre Teoría de Colas?"
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-teoria-colas')} />

      <ShareCard appName="calculadora-teoria-colas" />
      <Footer appName="calculadora-teoria-colas" />
    </div>
  );
}
