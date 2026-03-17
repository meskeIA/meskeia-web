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
        title="Guía de Resolución de Ecuaciones"
        subtitle="Métodos, tipos y estrategias para resolver ecuaciones algebraicas paso a paso"
        icon="🔢"
      >
        {/* 1. TABLA COMPARATIVA — tipos de ecuaciones */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo de Ecuación</th>
                <th>Forma general</th>
                <th>Número de soluciones</th>
                <th>Método principal</th>
                <th>Nivel</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Lineal (1er grado)</td><td>ax + b = 0</td><td>1 solución real</td><td>Despejar x directamente</td><td>ESO 1º-2º</td></tr>
              <tr><td>Cuadrática (2º grado)</td><td>ax² + bx + c = 0</td><td>0, 1 o 2 soluciones reales</td><td>Fórmula cuadrática / factorización</td><td>ESO 3º-4º</td></tr>
              <tr><td>Cúbica (3er grado)</td><td>ax³ + bx² + cx + d = 0</td><td>1 o 3 soluciones reales</td><td>Ruffini / fórmula de Cardano</td><td>Bachillerato</td></tr>
              <tr><td>Racional</td><td>P(x)/Q(x) = 0</td><td>Variable (Q(x) ≠ 0)</td><td>Mínimo común denominador</td><td>ESO 4º / Bach.</td></tr>
              <tr><td>Irracional</td><td>√f(x) = g(x)</td><td>Variable (verificar soluciones)</td><td>Elevar al cuadrado ambos miembros</td><td>Bachillerato</td></tr>
              <tr><td>Sistema 2×2</td><td>ax+by=c, dx+ey=f</td><td>0, 1 o ∞ soluciones</td><td>Sustitución / reducción / Cramer</td><td>ESO 3º-4º</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎓</span>
              <strong>Estudiante de ESO / Bachillerato</strong>
            </div>
            <p>Verifica los resultados de tus ejercicios de álgebra, comprende el proceso de resolución paso a paso y detecta dónde te has equivocado antes de entregar el examen.</p>
            <div className={styles.escenarioTip}>Tip: Comprueba siempre sustituyendo la solución en la ecuación original. Si el resultado no es 0 (o la igualdad no se cumple), hay un error.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📐</span>
              <strong>Ingeniero / Físico</strong>
            </div>
            <p>Resuelve ecuaciones que aparecen en problemas de circuitos eléctricos, mecánica, termodinámica y optimización donde las soluciones analíticas exactas son necesarias.</p>
            <div className={styles.escenarioTip}>Tip: En ingeniería las ecuaciones cúbicas aparecen frecuentemente en cálculo de presiones, temperaturas críticas y análisis de estructuras.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>💼</span>
              <strong>Profesional / Opositor</strong>
            </div>
            <p>Practica la resolución de ecuaciones para pruebas de aptitud numérica, test de razonamiento lógico-matemático y exámenes de oposición que incluyen álgebra básica e intermedia.</p>
            <div className={styles.escenarioTip}>Tip: En oposiciones el tiempo es clave. Aprende a reconocer cuadráticas factorizables visualmente antes de aplicar la fórmula general.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👩‍🏫</span>
              <strong>Docente / Tutor</strong>
            </div>
            <p>Genera soluciones detalladas paso a paso para explicar en clase o en tutorías. Útil para crear enunciados de examen y verificar que los problemas planteados tienen solución real.</p>
            <div className={styles.escenarioTip}>Tip: Una ecuación cuadrática sin soluciones reales (discriminante negativo) puede usarse para introducir los números complejos en Bachillerato.</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <details className={styles.faqList}>
          <summary className={styles.faqItem} style={{listStyle:'none', cursor:'pointer', fontWeight:600, fontSize:'1.1rem', padding:'0.75rem 0'}}>❓ Preguntas Frecuentes sobre Ecuaciones Algebraicas</summary>
          <div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es el discriminante de una ecuación cuadrática y qué indica?</div>
              <div className={styles.faqRespuesta}>El discriminante es Δ = b² - 4ac. Si Δ &gt; 0: dos soluciones reales distintas. Si Δ = 0: una solución real doble (la parábola es tangente al eje X). Si Δ &lt; 0: no hay soluciones reales (sí complejas). Es el primer cálculo a hacer con cualquier cuadrática.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuándo se usa Ruffini para resolver ecuaciones?</div>
              <div className={styles.faqRespuesta}>La regla de Ruffini se aplica a polinomios de grado ≥ 2 cuando se conoce (o se puede adivinar) una raíz entera. Se busca entre los divisores del término independiente. Si p(a) = 0, entonces (x - a) es un factor y Ruffini divide el polinomio por ese factor, reduciendo el grado en 1.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Por qué hay que verificar las soluciones en ecuaciones irracionales?</div>
              <div className={styles.faqRespuesta}>Al elevar ambos miembros al cuadrado para eliminar la raíz, se puede introducir soluciones extrañas que satisfacen la ecuación transformada pero no la original. Por ejemplo, √x = -2 no tiene solución, pero al elevar al cuadrado da x = 4, que al sustituir produce √4 = 2 ≠ -2. Siempre verificar.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué diferencia hay entre ecuación e identidad?</div>
              <div className={styles.faqRespuesta}>Una ecuación es verdadera solo para ciertos valores de la incógnita (soluciones). Una identidad es verdadera para todos los valores: (a+b)² = a²+2ab+b² es una identidad, no una ecuación. Intentar &quot;resolver&quot; una identidad lleva a 0=0, lo que significa que es cierta para cualquier valor.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuándo un sistema de ecuaciones tiene infinitas soluciones?</div>
              <div className={styles.faqRespuesta}>Cuando las ecuaciones son dependientes (una es múltiplo de la otra), el sistema es compatible indeterminado y tiene infinitas soluciones. Geométricamente, las dos rectas son la misma. Si son paralelas (mismo coeficiente directivo, diferente término independiente) el sistema es incompatible y no tiene solución.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es el Teorema de Vieta y para qué sirve?</div>
              <div className={styles.faqRespuesta}>Para ax² + bx + c = 0 con raíces x₁ y x₂: la suma x₁+x₂ = -b/a y el producto x₁·x₂ = c/a. Sirve para comprobar resultados rápidamente (la suma y producto de las raíces deben coincidir), encontrar ecuaciones dadas sus raíces, y acelerar la factorización de cuadráticas con coeficientes enteros.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la diferencia entre el método de sustitución y el de reducción en sistemas?</div>
              <div className={styles.faqRespuesta}>En sustitución se despeja una variable en una ecuación y se sustituye en la otra. Es más intuitivo. En reducción (o eliminación) se suman o restan las ecuaciones multiplicadas por coeficientes para eliminar una variable. La reducción es más eficiente cuando los coeficientes son fácilmente igualables.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo se resuelven las ecuaciones bicuadráticas?</div>
              <div className={styles.faqRespuesta}>Una ecuación bicuadrática tiene la forma ax⁴ + bx² + c = 0. Se resuelve con el cambio de variable t = x²: la ecuación se convierte en at² + bt + c = 0, que es una cuadrática ordinaria. Se resuelve para t y luego x = ±√t (solo valores positivos de t dan soluciones reales).</div>
            </div>
          </div>
        </details>

        {/* 4. GUÍA PASO A PASO */}
        <ol className={styles.pasosList}>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>1</span>
            <div><strong>Identifica el tipo de ecuación</strong> — Determina el grado (mayor exponente de la incógnita) y si es lineal, cuadrática, racional, irracional o un sistema. El tipo determina el método.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>2</span>
            <div><strong>Simplifica y ordena</strong> — Elimina denominadores (multiplicar por el mínimo común múltiplo), expande paréntesis y agrupa todos los términos en un mismo lado: f(x) = 0.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>3</span>
            <div><strong>Aplica el método adecuado</strong> — Grado 1: despejar x. Grado 2: discriminante y fórmula cuadrática. Grado 3+: buscar raíces racionales con Ruffini. Sistemas: sustitución o reducción.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>4</span>
            <div><strong>Obtén todas las soluciones</strong> — Un polinomio de grado n tiene exactamente n raíces (reales o complejas). Verifica que has encontrado todas o que has justificado por qué no hay más soluciones reales.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>5</span>
            <div><strong>Verifica las soluciones</strong> — Sustituye cada solución en la ecuación original. Si hay denominadores, comprueba que no se anulan. Si hay raíces cuadradas, comprueba que la igualdad original se cumple (no la transformada).</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>6</span>
            <div><strong>Expresa el resultado correctamente</strong> — Indica todas las soluciones. Si son complejas, exprésalas en forma a+bi. Si el sistema es indeterminado, exprésalo en forma paramétrica.</div>
          </li>
        </ol>

        {/* 5. TIPS GRID */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>⚡</span>
            <strong>Discriminante primero</strong>
            <p>En cualquier cuadrática, calcula Δ = b²-4ac antes de nada. Si es negativo, no hay soluciones reales y ahorras tiempo de cálculo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔍</span>
            <strong>Factorización rápida</strong>
            <p>Para x² + bx + c = 0 (a=1), busca dos números cuya suma sea b y cuyo producto sea c. Más rápido que la fórmula para coeficientes enteros pequeños.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📋</span>
            <strong>Vieta como verificación</strong>
            <p>Suma de raíces = -b/a y producto = c/a. Comprueba esto tras resolver cualquier cuadrática. Si no coincide, hay un error de cálculo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔢</span>
            <strong>Ruffini: prueba con ±1, ±2...</strong>
            <p>Los candidatos a raíces racionales son los divisores del término independiente divididos entre los del coeficiente principal. Empieza siempre por ±1.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>✏️</span>
            <strong>Escribe cada paso</strong>
            <p>En exámenes, la resolución paso a paso vale puntos parciales aunque el resultado final sea incorrecto. Nunca saltes pasos mentalmente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🎯</span>
            <strong>Comprueba siempre</strong>
            <p>30 segundos de verificación sustituyendo la solución en la ecuación original evitan errores graves. Especialmente crítico en irracionales y racionales.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono}>⚠️</span>
            <strong>Errores frecuentes al resolver ecuaciones</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Dividir ambos miembros por la incógnita</strong> — Si divides por x, pierdes la solución x = 0. Nunca dividas por una expresión que puede ser cero; lleva los términos al mismo lado y factoriza.</li>
            <li><strong>Olvidar el ± al sacar raíz cuadrada</strong> — Si x² = 9, la solución es x = ±3, no solo x = 3. El signo negativo es tan válido como el positivo.</li>
            <li><strong>No verificar soluciones en ecuaciones irracionales y racionales</strong> — Elevar al cuadrado o multiplicar por el denominador puede introducir soluciones extrañas. Siempre sustituye en la ecuación original.</li>
            <li><strong>Confundir grado con número de soluciones reales</strong> — Una ecuación de grado 3 tiene siempre 3 raíces (contando multiplicidad y complejas), pero puede tener solo 1 solución real.</li>
            <li><strong>Errores de signo al transponer términos</strong> — Al pasar un término al otro lado, cambia de signo. Este es el error más frecuente y se evita reescribiendo el paso completo sin hacer operaciones mentales.</li>
            <li><strong>No comprobar las restricciones del dominio</strong> — En ecuaciones racionales, los valores que anulan el denominador son soluciones prohibidas aunque algebraicamente &quot;salgan&quot;.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('algebra-ecuaciones')} />
      <ShareCard appName="algebra-ecuaciones" />
      <Footer appName="algebra-ecuaciones" />
    </div>
  );
}
