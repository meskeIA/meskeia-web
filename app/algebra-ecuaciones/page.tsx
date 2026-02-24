'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AlgebraEcuaciones.module.css';
import { Footer, MeskeiaLogo, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import * as Algebrite from 'algebrite';

Chart.register(...registerables);

// Tipos de ecuaciones
type EquationType = 'linear' | 'quadratic' | 'system';

export default function AlgebraEcuacionesPage() {
  // Estado principal
  const [equationType, setEquationType] = useState<EquationType>('linear');

  // Estados para ecuación lineal (ax + b = c)
  const [linearA, setLinearA] = useState<string>('2');
  const [linearB, setLinearB] = useState<string>('5');
  const [linearC, setLinearC] = useState<string>('13');
  const [linearSolution, setLinearSolution] = useState<string>('');
  const [linearSteps, setLinearSteps] = useState<string[]>([]);

  // Estados para ecuación cuadrática (ax² + bx + c = 0)
  const [quadA, setQuadA] = useState<string>('1');
  const [quadB, setQuadB] = useState<string>('5');
  const [quadC, setQuadC] = useState<string>('6');
  const [quadSolutions, setQuadSolutions] = useState<{ x1: string; x2: string }>({ x1: '', x2: '' });
  const [quadSteps, setQuadSteps] = useState<string[]>([]);
  const [discriminant, setDiscriminant] = useState<string>('');
  const [vertex, setVertex] = useState<{ x: string; y: string }>({ x: '', y: '' });

  // Estados para sistema 2x2
  const [sysA1, setSysA1] = useState<string>('2');
  const [sysB1, setSysB1] = useState<string>('3');
  const [sysC1, setSysC1] = useState<string>('8');
  const [sysA2, setSysA2] = useState<string>('1');
  const [sysB2, setSysB2] = useState<string>('-1');
  const [sysC2, setSysC2] = useState<string>('1');
  const [systemSolution, setSystemSolution] = useState<{ x: string; y: string }>({ x: '', y: '' });
  const [systemSteps, setSystemSteps] = useState<string[]>([]);

  // Referencia para gráfica
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Formato de números español
  const formatNumber = (num: number, decimals: number = 4): string => {
    if (isNaN(num)) return 'No definido';
    if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
    if (Math.abs(num) < 0.0001 && num !== 0) return '≈0';
    return num.toFixed(decimals).replace('.', ',');
  };

  // Resolver ecuación lineal: ax + b = c → x = (c - b) / a
  const solveLinear = () => {
    const a = parseFloat(linearA);
    const b = parseFloat(linearB);
    const c = parseFloat(linearC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setLinearSolution('Error: Ingresa valores numéricos válidos');
      setLinearSteps([]);
      return;
    }

    if (a === 0) {
      setLinearSolution('Error: El coeficiente "a" no puede ser cero');
      setLinearSteps([]);
      return;
    }

    const x = (c - b) / a;
    const steps = [
      `Ecuación original: ${formatNumber(a)}x + ${formatNumber(b)} = ${formatNumber(c)}`,
      `Paso 1: Restar ${formatNumber(b)} de ambos lados`,
      `${formatNumber(a)}x = ${formatNumber(c)} - ${formatNumber(b)}`,
      `${formatNumber(a)}x = ${formatNumber(c - b)}`,
      `Paso 2: Dividir ambos lados entre ${formatNumber(a)}`,
      `x = ${formatNumber(c - b)} / ${formatNumber(a)}`,
      `x = ${formatNumber(x)}`,
    ];

    setLinearSolution(`x = ${formatNumber(x)}`);
    setLinearSteps(steps);
  };

  // Resolver ecuación cuadrática: ax² + bx + c = 0
  const solveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setQuadSolutions({ x1: 'Error: Valores inválidos', x2: '' });
      setQuadSteps([]);
      setDiscriminant('');
      setVertex({ x: '', y: '' });
      return;
    }

    if (a === 0) {
      setQuadSolutions({ x1: 'Error: "a" no puede ser cero', x2: '' });
      setQuadSteps([]);
      return;
    }

    // Calcular discriminante
    const disc = b * b - 4 * a * c;
    setDiscriminant(formatNumber(disc));

    // Calcular vértice
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    setVertex({ x: formatNumber(vertexX), y: formatNumber(vertexY) });

    const steps: string[] = [
      `Ecuación: ${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0`,
      `Fórmula cuadrática: x = (-b ± √(b² - 4ac)) / (2a)`,
      `Paso 1: Calcular discriminante (Δ = b² - 4ac)`,
      `Δ = (${formatNumber(b)})² - 4(${formatNumber(a)})(${formatNumber(c)})`,
      `Δ = ${formatNumber(b * b)} - ${formatNumber(4 * a * c)}`,
      `Δ = ${formatNumber(disc)}`,
    ];

    if (disc < 0) {
      setQuadSolutions({ x1: 'No hay soluciones reales', x2: '(raíces complejas)' });
      steps.push('Como Δ < 0, no existen soluciones reales (raíces complejas)');
    } else if (disc === 0) {
      const x = -b / (2 * a);
      setQuadSolutions({ x1: formatNumber(x), x2: '(raíz doble)' });
      steps.push(
        'Como Δ = 0, hay una única solución (raíz doble)',
        `x = -b / (2a) = ${formatNumber(-b)} / ${formatNumber(2 * a)}`,
        `x = ${formatNumber(x)}`
      );
    } else {
      const sqrtDisc = Math.sqrt(disc);
      const x1 = (-b + sqrtDisc) / (2 * a);
      const x2 = (-b - sqrtDisc) / (2 * a);
      setQuadSolutions({ x1: formatNumber(x1), x2: formatNumber(x2) });
      steps.push(
        'Como Δ > 0, hay dos soluciones reales distintas',
        `x₁ = (-b + √Δ) / (2a) = (${formatNumber(-b)} + ${formatNumber(sqrtDisc)}) / ${formatNumber(2 * a)}`,
        `x₁ = ${formatNumber(x1)}`,
        `x₂ = (-b - √Δ) / (2a) = (${formatNumber(-b)} - ${formatNumber(sqrtDisc)}) / ${formatNumber(2 * a)}`,
        `x₂ = ${formatNumber(x2)}`
      );
    }

    setQuadSteps(steps);
    drawQuadraticGraph(a, b, c, vertexX);
  };

  // Dibujar gráfica de parábola
  const drawQuadraticGraph = (a: number, b: number, c: number, vertexX: number) => {
    if (!chartRef.current) return;

    // Destruir gráfica anterior
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Generar puntos
    const range = 10;
    const xValues: number[] = [];
    const yValues: number[] = [];

    for (let x = vertexX - range; x <= vertexX + range; x += 0.5) {
      xValues.push(x);
      yValues.push(a * x * x + b * x + c);
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: xValues.map((x) => x.toFixed(1)),
        datasets: [
          {
            label: `f(x) = ${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)}`,
            data: yValues,
            borderColor: '#2E86AB',
            backgroundColor: 'rgba(46, 134, 171, 0.1)',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Gráfica de la Parábola',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'x',
              font: { size: 14, weight: 'bold' },
            },
            ticks: {
              maxTicksLimit: 10,
            },
          },
          y: {
            title: {
              display: true,
              text: 'f(x)',
              font: { size: 14, weight: 'bold' },
            },
          },
        },
      },
    };

    chartInstanceRef.current = new Chart(chartRef.current, config);
  };

  // Resolver sistema de ecuaciones 2x2
  const solveSystem = () => {
    const a1 = parseFloat(sysA1);
    const b1 = parseFloat(sysB1);
    const c1 = parseFloat(sysC1);
    const a2 = parseFloat(sysA2);
    const b2 = parseFloat(sysB2);
    const c2 = parseFloat(sysC2);

    if (isNaN(a1) || isNaN(b1) || isNaN(c1) || isNaN(a2) || isNaN(b2) || isNaN(c2)) {
      setSystemSolution({ x: 'Error: Valores inválidos', y: '' });
      setSystemSteps([]);
      return;
    }

    // Determinante principal
    const det = a1 * b2 - a2 * b1;

    const steps: string[] = [
      `Sistema de ecuaciones:`,
      `${formatNumber(a1)}x + ${formatNumber(b1)}y = ${formatNumber(c1)}`,
      `${formatNumber(a2)}x + ${formatNumber(b2)}y = ${formatNumber(c2)}`,
      `Método de Cramer - Determinante principal:`,
      `det = a₁b₂ - a₂b₁ = (${formatNumber(a1)})(${formatNumber(b2)}) - (${formatNumber(a2)})(${formatNumber(b1)})`,
      `det = ${formatNumber(det)}`,
    ];

    if (det === 0) {
      setSystemSolution({ x: 'Sistema sin solución única', y: '(infinitas o ninguna)' });
      steps.push('Como det = 0, el sistema no tiene solución única');
      setSystemSteps(steps);
      return;
    }

    // Regla de Cramer
    const detX = c1 * b2 - c2 * b1;
    const detY = a1 * c2 - a2 * c1;
    const x = detX / det;
    const y = detY / det;

    steps.push(
      `Determinante para x:`,
      `det_x = c₁b₂ - c₂b₁ = (${formatNumber(c1)})(${formatNumber(b2)}) - (${formatNumber(c2)})(${formatNumber(b1)})`,
      `det_x = ${formatNumber(detX)}`,
      `x = det_x / det = ${formatNumber(detX)} / ${formatNumber(det)} = ${formatNumber(x)}`,
      `Determinante para y:`,
      `det_y = a₁c₂ - a₂c₁ = (${formatNumber(a1)})(${formatNumber(c2)}) - (${formatNumber(a2)})(${formatNumber(c1)})`,
      `det_y = ${formatNumber(detY)}`,
      `y = det_y / det = ${formatNumber(detY)} / ${formatNumber(det)} = ${formatNumber(y)}`
    );

    setSystemSolution({ x: formatNumber(x), y: formatNumber(y) });
    setSystemSteps(steps);
  };

  // Resolver al cambiar tipo de ecuación
  useEffect(() => {
    if (equationType === 'linear') {
      solveLinear();
    } else if (equationType === 'quadratic') {
      solveQuadratic();
    } else if (equationType === 'system') {
      solveSystem();
    }
  }, [equationType]);

  // Limpiar gráfica al desmontar
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Logo meskeIA */}
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}>🧮 Calculadora de Ecuaciones Algebraicas</h1>
        <p className={styles.subtitle}>
          Resuelve ecuaciones lineales, cuadráticas y sistemas 2x2 con explicaciones paso a paso
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Selector de tipo de ecuación */}
      <div className={styles.typeSelector}>
        <button
          type="button"
          className={`${styles.typeButton} ${equationType === 'linear' ? styles.active : ''}`}
          onClick={() => setEquationType('linear')}
        >
          📐 Lineal
        </button>
        <button
          type="button"
          className={`${styles.typeButton} ${equationType === 'quadratic' ? styles.active : ''}`}
          onClick={() => setEquationType('quadratic')}
        >
          📊 Cuadrática
        </button>
        <button
          type="button"
          className={`${styles.typeButton} ${equationType === 'system' ? styles.active : ''}`}
          onClick={() => setEquationType('system')}
        >
          🔗 Sistema 2x2
        </button>
      </div>

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Panel izquierdo: Entrada de datos */}
        <div className={styles.inputPanel}>
          {/* Ecuación Lineal */}
          {equationType === 'linear' && (
            <div className={styles.equationCard}>
              <h2 className={styles.cardTitle}>Ecuación Lineal: ax + b = c</h2>
              <div className={styles.inputGroup}>
                <label>
                  Coeficiente a:
                  <input
                    type="number"
                    value={linearA}
                    onChange={(e) => setLinearA(e.target.value)}
                    step="0.1"
                    className={styles.input}
                  />
                </label>
                <label>
                  Término b:
                  <input
                    type="number"
                    value={linearB}
                    onChange={(e) => setLinearB(e.target.value)}
                    step="0.1"
                    className={styles.input}
                  />
                </label>
                <label>
                  Resultado c:
                  <input
                    type="number"
                    value={linearC}
                    onChange={(e) => setLinearC(e.target.value)}
                    step="0.1"
                    className={styles.input}
                  />
                </label>
              </div>
              <button type="button" onClick={solveLinear} className={styles.btnPrimary}>
                Resolver
              </button>
            </div>
          )}

          {/* Ecuación Cuadrática */}
          {equationType === 'quadratic' && (
            <div className={styles.equationCard}>
              <h2 className={styles.cardTitle}>Ecuación Cuadrática: ax² + bx + c = 0</h2>
              <div className={styles.inputGroup}>
                <label>
                  Coeficiente a:
                  <input
                    type="number"
                    value={quadA}
                    onChange={(e) => setQuadA(e.target.value)}
                    step="0.1"
                    className={styles.input}
                  />
                </label>
                <label>
                  Coeficiente b:
                  <input
                    type="number"
                    value={quadB}
                    onChange={(e) => setQuadB(e.target.value)}
                    step="0.1"
                    className={styles.input}
                  />
                </label>
                <label>
                  Término c:
                  <input
                    type="number"
                    value={quadC}
                    onChange={(e) => setQuadC(e.target.value)}
                    step="0.1"
                    className={styles.input}
                  />
                </label>
              </div>
              <button type="button" onClick={solveQuadratic} className={styles.btnPrimary}>
                Resolver
              </button>
            </div>
          )}

          {/* Sistema 2x2 */}
          {equationType === 'system' && (
            <div className={styles.equationCard}>
              <h2 className={styles.cardTitle}>Sistema de Ecuaciones 2x2</h2>
              <div className={styles.systemGroup}>
                <div className={styles.systemRow}>
                  <span className={styles.systemLabel}>Ecuación 1:</span>
                  <input
                    type="number"
                    value={sysA1}
                    onChange={(e) => setSysA1(e.target.value)}
                    step="0.1"
                    className={styles.inputSmall}
                    placeholder="a₁"
                  />
                  <span>x +</span>
                  <input
                    type="number"
                    value={sysB1}
                    onChange={(e) => setSysB1(e.target.value)}
                    step="0.1"
                    className={styles.inputSmall}
                    placeholder="b₁"
                  />
                  <span>y =</span>
                  <input
                    type="number"
                    value={sysC1}
                    onChange={(e) => setSysC1(e.target.value)}
                    step="0.1"
                    className={styles.inputSmall}
                    placeholder="c₁"
                  />
                </div>
                <div className={styles.systemRow}>
                  <span className={styles.systemLabel}>Ecuación 2:</span>
                  <input
                    type="number"
                    value={sysA2}
                    onChange={(e) => setSysA2(e.target.value)}
                    step="0.1"
                    className={styles.inputSmall}
                    placeholder="a₂"
                  />
                  <span>x +</span>
                  <input
                    type="number"
                    value={sysB2}
                    onChange={(e) => setSysB2(e.target.value)}
                    step="0.1"
                    className={styles.inputSmall}
                    placeholder="b₂"
                  />
                  <span>y =</span>
                  <input
                    type="number"
                    value={sysC2}
                    onChange={(e) => setSysC2(e.target.value)}
                    step="0.1"
                    className={styles.inputSmall}
                    placeholder="c₂"
                  />
                </div>
              </div>
              <button type="button" onClick={solveSystem} className={styles.btnPrimary}>
                Resolver Sistema
              </button>
            </div>
          )}
        </div>

        {/* Panel derecho: Resultados */}
        <div className={styles.resultsPanel}>
          {/* Resultados Ecuación Lineal */}
          {equationType === 'linear' && (
            <div className={styles.resultsCard}>
              <h2 className={styles.cardTitle}>Solución</h2>
              <div className={styles.solution}>
                <p className={styles.solutionValue}>{linearSolution || 'Esperando datos...'}</p>
              </div>
              {linearSteps.length > 0 && (
                <div className={styles.steps}>
                  <h3 className={styles.stepsTitle}>Paso a Paso:</h3>
                  {linearSteps.map((step, index) => (
                    <p key={index} className={styles.step}>
                      {step}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resultados Ecuación Cuadrática */}
          {equationType === 'quadratic' && (
            <>
              <div className={styles.resultsCard}>
                <h2 className={styles.cardTitle}>Soluciones</h2>
                <div className={styles.solution}>
                  <p className={styles.solutionValue}>
                    x₁ = {quadSolutions.x1 || 'Esperando datos...'}
                  </p>
                  {quadSolutions.x2 && (
                    <p className={styles.solutionValue}>x₂ = {quadSolutions.x2}</p>
                  )}
                </div>
                {discriminant && (
                  <div className={styles.extraInfo}>
                    <p>
                      <strong>Discriminante (Δ):</strong> {discriminant}
                    </p>
                    <p>
                      <strong>Vértice:</strong> ({vertex.x}, {vertex.y})
                    </p>
                  </div>
                )}
                {quadSteps.length > 0 && (
                  <div className={styles.steps}>
                    <h3 className={styles.stepsTitle}>Paso a Paso:</h3>
                    {quadSteps.map((step, index) => (
                      <p key={index} className={styles.step}>
                        {step}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Gráfica de parábola */}
              <div className={styles.chartCard}>
                <canvas ref={chartRef} className={styles.chart}></canvas>
              </div>
            </>
          )}

          {/* Resultados Sistema 2x2 */}
          {equationType === 'system' && (
            <div className={styles.resultsCard}>
              <h2 className={styles.cardTitle}>Solución del Sistema</h2>
              <div className={styles.solution}>
                <p className={styles.solutionValue}>
                  x = {systemSolution.x || 'Esperando datos...'}
                </p>
                {systemSolution.y && <p className={styles.solutionValue}>y = {systemSolution.y}</p>}
              </div>
              {systemSteps.length > 0 && (
                <div className={styles.steps}>
                  <h3 className={styles.stepsTitle}>Paso a Paso (Regla de Cramer):</h3>
                  {systemSteps.map((step, index) => (
                    <p key={index} className={styles.step}>
                      {step}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="educational"
        severity="low"
        context="algebra-ecuaciones"
        collapsible={true}
      />


      <EducationalSection
        title="¿Quieres aprender más sobre Ecuaciones Algebraicas?"
        subtitle="Descubre métodos de resolución, conceptos clave, ejemplos prácticos y respuestas a las preguntas más frecuentes"
      >
          {/* Sección 1: Introducción */}
          <section className={styles.guideSection}>
            <h2>¿Qué son las Ecuaciones Algebraicas?</h2>
            <p className={styles.introParagraph}>
              Las ecuaciones algebraicas son expresiones matemáticas que contienen una o más
              incógnitas (variables) y establecen una igualdad entre dos expresiones. Resolver una
              ecuación significa encontrar el valor o valores de la incógnita que hacen verdadera la
              igualdad. Son fundamentales en matemáticas, física, ingeniería y muchas aplicaciones
              prácticas del día a día.
            </p>

            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>📐 Ecuaciones Lineales</h4>
                <p>
                  <strong>Forma:</strong> ax + b = c
                </p>
                <p>
                  Las ecuaciones lineales son las más simples. Representan una línea recta cuando se
                  grafican. Siempre tienen una única solución cuando a ≠ 0.
                </p>
                <p>
                  <strong>Ejemplo:</strong> 2x + 5 = 13 → x = 4
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>📊 Ecuaciones Cuadráticas</h4>
                <p>
                  <strong>Forma:</strong> ax² + bx + c = 0
                </p>
                <p>
                  Las ecuaciones cuadráticas representan parábolas. Pueden tener dos soluciones
                  reales distintas, una solución doble, o soluciones complejas, dependiendo del
                  discriminante.
                </p>
                <p>
                  <strong>Ejemplo:</strong> x² - 5x + 6 = 0 → x₁ = 2, x₂ = 3
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>🔗 Sistemas de Ecuaciones</h4>
                <p>
                  <strong>Forma:</strong> a₁x + b₁y = c₁; a₂x + b₂y = c₂
                </p>
                <p>
                  Los sistemas relacionan dos o más ecuaciones. Se resuelven encontrando valores que
                  satisfacen simultáneamente todas las ecuaciones. Métodos comunes: sustitución,
                  igualación y Cramer.
                </p>
                <p>
                  <strong>Ejemplo:</strong> 2x + 3y = 8; x - y = 1 → x = 2, y = 1
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>🎯 Aplicaciones Prácticas</h4>
                <p>
                  Las ecuaciones algebraicas se usan en física (movimiento), economía (oferta y
                  demanda), ingeniería (diseño de estructuras), informática (algoritmos) y vida
                  cotidiana (cálculo de presupuestos, tasas de interés).
                </p>
              </div>
            </div>
          </section>

          {/* Sección 2: Métodos de Resolución */}
          <section className={styles.guideSection}>
            <h2>Métodos de Resolución</h2>

            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>🧮 Despeje Algebraico (Lineales)</h4>
                <p>
                  <strong>Proceso:</strong>
                </p>
                <ol>
                  <li>Aislar la variable en un lado de la ecuación</li>
                  <li>Aplicar operaciones inversas (suma/resta, multiplicación/división)</li>
                  <li>Simplificar hasta obtener el valor de x</li>
                </ol>
                <p>
                  <strong>Ejemplo:</strong> 3x - 7 = 14 → 3x = 21 → x = 7
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>📐 Fórmula Cuadrática</h4>
                <p>
                  <strong>Fórmula:</strong> x = (-b ± √(b² - 4ac)) / (2a)
                </p>
                <p>
                  Método universal para resolver ecuaciones cuadráticas. El discriminante (Δ = b² -
                  4ac) determina el tipo de soluciones:
                </p>
                <ul>
                  <li>Δ &gt; 0: Dos soluciones reales distintas</li>
                  <li>Δ = 0: Una solución doble (raíz repetida)</li>
                  <li>Δ &lt; 0: Dos soluciones complejas conjugadas</li>
                </ul>
              </div>

              <div className={styles.contentCard}>
                <h4>✂️ Factorización</h4>
                <p>
                  Método alternativo para cuadráticas que se pueden factorizar fácilmente. Consiste
                  en expresar ax² + bx + c como producto de dos binomios.
                </p>
                <p>
                  <strong>Ejemplo:</strong> x² - 5x + 6 = 0 → (x - 2)(x - 3) = 0 → x = 2 o x = 3
                </p>
                <p>Aplica la propiedad: Si A·B = 0, entonces A = 0 o B = 0</p>
              </div>

              <div className={styles.contentCard}>
                <h4>🎲 Regla de Cramer (Sistemas)</h4>
                <p>
                  Método basado en determinantes para resolver sistemas de ecuaciones lineales. Muy
                  eficiente para sistemas 2x2 y 3x3.
                </p>
                <p>
                  <strong>Fórmulas:</strong>
                </p>
                <ul>
                  <li>det = a₁b₂ - a₂b₁ (determinante principal)</li>
                  <li>x = (c₁b₂ - c₂b₁) / det</li>
                  <li>y = (a₁c₂ - a₂c₁) / det</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 3: Conceptos Clave */}
          <section className={styles.guideSection}>
            <h2>Conceptos Clave</h2>

            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>🔢 Discriminante (Δ)</h4>
                <p>
                  <strong>Definición:</strong> Δ = b² - 4ac
                </p>
                <p>
                  El discriminante de una ecuación cuadrática determina la naturaleza de sus raíces
                  sin necesidad de calcularlas. Es una herramienta fundamental para clasificar
                  ecuaciones cuadráticas.
                </p>
                <p>
                  <strong>Interpretación geométrica:</strong> Indica cuántas veces la parábola cruza
                  el eje x.
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>📍 Vértice de la Parábola</h4>
                <p>
                  <strong>Coordenadas:</strong> V = (-b/(2a), f(-b/(2a)))
                </p>
                <p>
                  El vértice es el punto máximo o mínimo de una parábola. Si a &gt; 0, el vértice es
                  un mínimo (parábola abre hacia arriba). Si a &lt; 0, es un máximo (parábola abre
                  hacia abajo).
                </p>
                <p>
                  <strong>Aplicación:</strong> Optimización de funciones, cálculo de trayectorias.
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>🎯 Raíces o Soluciones</h4>
                <p>
                  Las raíces son los valores de la variable que satisfacen la ecuación (hacen que la
                  igualdad sea verdadera). También se llaman ceros de la función.
                </p>
                <p>
                  <strong>Tipos:</strong>
                </p>
                <ul>
                  <li>Reales: Se pueden representar en la recta numérica</li>
                  <li>Complejas: Incluyen la unidad imaginaria i = √(-1)</li>
                  <li>Múltiples: Raíces que aparecen más de una vez</li>
                </ul>
              </div>

              <div className={styles.contentCard}>
                <h4>🧩 Determinante</h4>
                <p>
                  <strong>Definición:</strong> Número asociado a una matriz cuadrada
                </p>
                <p>
                  En sistemas 2x2, el determinante indica si el sistema tiene solución única (det ≠
                  0) o infinitas/ninguna solución (det = 0). Es fundamental en álgebra lineal.
                </p>
                <p>
                  <strong>Interpretación geométrica:</strong> Representa el área del paralelogramo
                  formado por los vectores fila.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 4: Ejemplos Reales */}
          <section className={styles.guideSection}>
            <h2>Ejemplos de la Vida Real</h2>

            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>🚗 Ana y el Viaje en Carro</h4>
                <p>
                  Ana conduce a una velocidad constante. Si después de 2 horas ha recorrido 150 km,
                  ¿cuánto recorrerá en 5 horas?
                </p>
                <p>
                  <strong>Ecuación:</strong> 2v = 150 → v = 75 km/h
                </p>
                <p>
                  <strong>Respuesta:</strong> En 5 horas: 5 × 75 = 375 km
                </p>
                <p>
                  <em>Ecuación lineal aplicada a velocidad constante.</em>
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>🏐 Carlos y el Lanzamiento de Pelota</h4>
                <p>
                  Carlos lanza una pelota verticalmente. La altura h(t) = -5t² + 20t + 1 (metros)
                  describe su trayectoria. ¿En qué momento alcanza la altura máxima?
                </p>
                <p>
                  <strong>Vértice:</strong> t = -20/(2×(-5)) = 2 segundos
                </p>
                <p>
                  <strong>Altura máxima:</strong> h(2) = -5(4) + 40 + 1 = 21 metros
                </p>
                <p>
                  <em>Ecuación cuadrática aplicada a movimiento parabólico.</em>
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>🛒 María en el Supermercado</h4>
                <p>
                  María compra manzanas (x) a 2€/kg y naranjas (y) a 3€/kg. Gasta 14€ en total y
                  compra 2 kg más de manzanas que de naranjas.
                </p>
                <p>
                  <strong>Sistema:</strong> 2x + 3y = 14; x = y + 2
                </p>
                <p>
                  <strong>Solución:</strong> Sustituyendo: 2(y+2) + 3y = 14 → y = 2 kg, x = 4 kg
                </p>
                <p>
                  <em>Sistema de ecuaciones aplicado a compras.</em>
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>💰 Luis e Inversión en Acciones</h4>
                <p>
                  Luis invierte 10.000€ en dos fondos. El fondo A rinde 5% anual y el fondo B rinde
                  8%. Si gana 650€ al año, ¿cuánto invirtió en cada fondo?
                </p>
                <p>
                  <strong>Sistema:</strong> x + y = 10000; 0,05x + 0,08y = 650
                </p>
                <p>
                  <strong>Solución:</strong> x = 5.000€ (fondo A), y = 5.000€ (fondo B)
                </p>
                <p>
                  <em>Sistema aplicado a finanzas e inversiones.</em>
                </p>
              </div>
            </div>
          </section>

          {/* Sección 5: FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes (FAQ)</h2>

            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>❓ ¿Por qué mi ecuación cuadrática no tiene soluciones reales?</h4>
                <p>
                  Cuando el discriminante (Δ = b² - 4ac) es negativo, la ecuación no tiene
                  soluciones reales, solo soluciones complejas (con números imaginarios).
                  Geométricamente, significa que la parábola no cruza el eje x.
                </p>
                <p>
                  <strong>Ejemplo:</strong> x² + 2x + 5 = 0 → Δ = 4 - 20 = -16 &lt; 0
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>❓ ¿Qué significa que un sistema tenga determinante cero?</h4>
                <p>
                  Si el determinante es cero (det = 0), el sistema no tiene solución única. Puede
                  tener infinitas soluciones (ecuaciones dependientes) o ninguna solución (ecuaciones
                  inconsistentes). Las rectas son paralelas o coincidentes.
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>❓ ¿Cuándo debo usar factorización vs fórmula cuadrática?</h4>
                <p>
                  Usa factorización cuando la ecuación se factoriza fácilmente con números enteros
                  (más rápido). Usa la fórmula cuadrática cuando los coeficientes son decimales,
                  fracciones, o la factorización no es evidente. La fórmula siempre funciona.
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>❓ ¿Puedo resolver ecuaciones de grado mayor a 2?</h4>
                <p>
                  Sí, pero se vuelven más complejas. Las ecuaciones cúbicas (grado 3) y cuárticas
                  (grado 4) tienen fórmulas específicas. Para grado 5 o mayor, generalmente se
                  requieren métodos numéricos o aproximaciones, ya que no existen fórmulas generales.
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>❓ ¿Qué es una raíz doble o múltiple?</h4>
                <p>
                  Una raíz doble ocurre cuando Δ = 0 en una ecuación cuadrática. Significa que la
                  parábola toca el eje x en un solo punto (el vértice). Matemáticamente, la misma
                  solución aparece dos veces: x₁ = x₂.
                </p>
                <p>
                  <strong>Ejemplo:</strong> x² - 4x + 4 = 0 → (x - 2)² = 0 → x = 2 (raíz doble)
                </p>
              </div>

              <div className={styles.contentCard}>
                <h4>❓ ¿Por qué es importante el vértice de una parábola?</h4>
                <p>
                  El vértice representa el punto óptimo (máximo o mínimo) de la función cuadrática.
                  Es crucial en problemas de optimización: maximizar ganancias, minimizar costos,
                  calcular alturas máximas en proyectiles, etc.
                </p>
              </div>
            </div>
          </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('algebra-ecuaciones')} />
      <ShareCard appName="algebra-ecuaciones" />
      <Footer appName="algebra-ecuaciones" />
    </div>
  );
}
