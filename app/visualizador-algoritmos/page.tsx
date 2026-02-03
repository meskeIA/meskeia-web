'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './VisualizadorAlgoritmos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  SortingCanvas,
  AlgorithmCode,
  MetricsPanel,
  useAlgorithmAnimation,
  SortingAlgorithm,
  ALGORITHMS_INFO,
} from './components';

// Generar array aleatorio
function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
}

// Tamaños disponibles
const ARRAY_SIZES = [10, 15, 20, 25, 30, 40, 50];

export default function VisualizadorAlgoritmosPage() {
  // Estado del array y algoritmo
  const [arraySize, setArraySize] = useState(25);
  const [array, setArray] = useState<number[]>(() => generateRandomArray(25));
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [speed, setSpeed] = useState(50);

  // Hook de animación
  const {
    animationState,
    currentStep,
    totalSteps,
    bars,
    currentLine,
    currentDescription,
    metrics,
    play,
    pause,
    step,
    reset,
    setSpeed: updateSpeed,
  } = useAlgorithmAnimation({
    initialArray: array,
    algorithm,
    speed,
  });

  // Valor máximo para escalar barras
  const maxValue = useMemo(() => Math.max(...array, 100), [array]);

  // Info del algoritmo actual
  const algorithmInfo = ALGORITHMS_INFO[algorithm];

  // Generar nuevo array
  const handleGenerateArray = useCallback(() => {
    const newArray = generateRandomArray(arraySize);
    setArray(newArray);
  }, [arraySize]);

  // Cambiar tamaño del array
  const handleSizeChange = useCallback((newSize: number) => {
    setArraySize(newSize);
    setArray(generateRandomArray(newSize));
  }, []);

  // Cambiar algoritmo
  const handleAlgorithmChange = useCallback((newAlgorithm: SortingAlgorithm) => {
    setAlgorithm(newAlgorithm);
  }, []);

  // Cambiar velocidad
  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    updateSpeed(newSpeed);
  }, [updateSpeed]);

  // Lista de algoritmos para el selector
  const algorithms: SortingAlgorithm[] = ['bubble', 'selection', 'insertion', 'quick', 'merge'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📊</span>
        <h1 className={styles.title}>Visualizador de Algoritmos</h1>
        <p className={styles.subtitle}>
          Aprende cómo funcionan los algoritmos de ordenación paso a paso con visualizaciones interactivas
        </p>
      </header>

      <LegalNotice />

      {/* Selector de Algoritmos */}
      <div className={styles.algorithmSelector}>
        {algorithms.map((algo) => (
          <button
            key={algo}
            className={`${styles.algorithmBtn} ${algorithm === algo ? styles.active : ''}`}
            onClick={() => handleAlgorithmChange(algo)}
            disabled={animationState === 'running'}
          >
            <span className={styles.algorithmIcon}>{ALGORITHMS_INFO[algo].icon}</span>
            <span className={styles.algorithmName}>{ALGORITHMS_INFO[algo].name}</span>
          </button>
        ))}
      </div>

      {/* Contenido Principal */}
      <div className={styles.mainContent}>
        {/* Panel de Visualización */}
        <div className={styles.visualizationPanel}>
          {/* Controles de Animación */}
          <div className={styles.animationControls}>
            <div className={styles.controlButtons}>
              {animationState !== 'running' ? (
                <button
                  className={`${styles.controlBtn} ${styles.play}`}
                  onClick={play}
                  disabled={animationState === 'finished' && currentStep >= totalSteps}
                >
                  ▶️ {animationState === 'finished' ? 'Reiniciar' : 'Play'}
                </button>
              ) : (
                <button className={`${styles.controlBtn} ${styles.pause}`} onClick={pause}>
                  ⏸️ Pausar
                </button>
              )}

              <button
                className={styles.controlBtn}
                onClick={step}
                disabled={animationState === 'running' || animationState === 'finished'}
              >
                ⏭️ Paso
              </button>

              <button
                className={styles.controlBtn}
                onClick={reset}
                disabled={animationState === 'idle'}
              >
                🔄 Reset
              </button>
            </div>

            <div className={styles.speedControl}>
              <span className={styles.speedLabel}>Velocidad:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                className={styles.speedSlider}
              />
              <span className={styles.speedValue}>{speed}%</span>
            </div>
          </div>

          {/* Canvas de Visualización */}
          <SortingCanvas bars={bars} maxValue={maxValue} />

          {/* Leyenda de Colores */}
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.normal}`}></div>
              <span>Normal</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.comparing}`}></div>
              <span>Comparando</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.swapping}`}></div>
              <span>Intercambiando</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.sorted}`}></div>
              <span>Ordenado</span>
            </div>
            {(algorithm === 'quick') && (
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.pivot}`}></div>
                <span>Pivote</span>
              </div>
            )}
          </div>

          {/* Métricas */}
          <MetricsPanel metrics={metrics} />

          {/* Progreso */}
          {totalSteps > 0 && (
            <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
              Paso {currentStep} de {totalSteps}
            </div>
          )}
        </div>

        {/* Panel Lateral */}
        <div className={styles.sidePanel}>
          {/* Panel de Código */}
          <AlgorithmCode
            algorithm={algorithm}
            highlightedLine={currentLine}
            description={currentDescription}
          />

          {/* Panel de Complejidad */}
          <div className={styles.complexityPanel}>
            <h3 className={styles.complexityTitle}>
              <span>⚡</span> Complejidad
            </h3>
            <div className={styles.complexityGrid}>
              <div className={styles.complexityItem}>
                <div className={styles.complexityLabel}>Mejor</div>
                <div className={styles.complexityValue}>{algorithmInfo.complexity.best}</div>
              </div>
              <div className={styles.complexityItem}>
                <div className={styles.complexityLabel}>Promedio</div>
                <div className={styles.complexityValue}>{algorithmInfo.complexity.average}</div>
              </div>
              <div className={styles.complexityItem}>
                <div className={styles.complexityLabel}>Peor</div>
                <div className={styles.complexityValue}>{algorithmInfo.complexity.worst}</div>
              </div>
              <div className={styles.complexityItem}>
                <div className={styles.complexityLabel}>Espacio</div>
                <div className={styles.complexityValue}>{algorithmInfo.complexity.space}</div>
              </div>
            </div>
            <p className={styles.algorithmDescription}>{algorithmInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Configuración del Array */}
      <div className={styles.configSection}>
        <span className={styles.configLabel}>Tamaño del array:</span>
        <select
          className={styles.configSelect}
          value={arraySize}
          onChange={(e) => handleSizeChange(parseInt(e.target.value))}
          disabled={animationState === 'running'}
        >
          {ARRAY_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} elementos
            </option>
          ))}
        </select>

        <button
          className={styles.generateBtn}
          onClick={handleGenerateArray}
          disabled={animationState === 'running'}
        >
          🎲 Generar Array Aleatorio
        </button>
      </div>

      {/* Sección Educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre algoritmos de ordenación?"
        subtitle="Descubre las diferencias entre algoritmos, cuándo usar cada uno y conceptos clave de complejidad computacional"
        icon="📚"
      >
        <div className={styles.educationalContent}>
          <section className={styles.guideSection}>
            <h2>📊 Comparativa de Algoritmos</h2>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Algoritmo</th>
                  <th>Mejor Caso</th>
                  <th>Caso Promedio</th>
                  <th>Peor Caso</th>
                  <th>Espacio</th>
                  <th>Estable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Bubble Sort</strong></td>
                  <td>O(n)</td>
                  <td>O(n²)</td>
                  <td>O(n²)</td>
                  <td>O(1)</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td><strong>Selection Sort</strong></td>
                  <td>O(n²)</td>
                  <td>O(n²)</td>
                  <td>O(n²)</td>
                  <td>O(1)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><strong>Insertion Sort</strong></td>
                  <td>O(n)</td>
                  <td>O(n²)</td>
                  <td>O(n²)</td>
                  <td>O(1)</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td><strong>Quick Sort</strong></td>
                  <td>O(n log n)</td>
                  <td>O(n log n)</td>
                  <td>O(n²)</td>
                  <td>O(log n)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><strong>Merge Sort</strong></td>
                  <td>O(n log n)</td>
                  <td>O(n log n)</td>
                  <td>O(n log n)</td>
                  <td>O(n)</td>
                  <td>Sí</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.guideSection}>
            <h2>🎯 ¿Cuándo usar cada algoritmo?</h2>

            <div className={styles.tipCard}>
              <h4>🫧 Bubble Sort</h4>
              <p>
                Ideal para fines educativos y arrays muy pequeños. Su simplicidad lo hace perfecto
                para entender los conceptos básicos de ordenación. No recomendado para producción.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>👆 Selection Sort</h4>
              <p>
                Útil cuando el coste de escribir en memoria es alto, ya que minimiza el número
                de intercambios (máximo n intercambios). Bueno para arrays pequeños.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>📥 Insertion Sort</h4>
              <p>
                Excelente para arrays pequeños o casi ordenados. Muchas implementaciones de
                Quick Sort lo usan para particiones pequeñas. Es estable y eficiente en memoria.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>⚡ Quick Sort</h4>
              <p>
                El más usado en la práctica. Muy eficiente para la mayoría de casos.
                Es el algoritmo por defecto en muchas librerías (como qsort en C).
                Cuidado con arrays ya ordenados (peor caso O(n²)).
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>🔀 Merge Sort</h4>
              <p>
                Garantiza O(n log n) siempre. Ideal cuando necesitas estabilidad y rendimiento
                predecible. Usado en Java para ordenar objetos. Requiere memoria adicional O(n).
              </p>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>📖 Conceptos Clave</h2>

            <div className={styles.tipCard}>
              <h4>¿Qué significa O(n²)?</h4>
              <p>
                La notación O grande describe cómo crece el tiempo de ejecución con el tamaño
                de la entrada. O(n²) significa que si duplicas el tamaño del array, el tiempo
                se cuadruplica. O(n log n) crece mucho más lento: un array de 1000 elementos
                tarda ~10.000 operaciones en vez de ~1.000.000.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>¿Qué es un algoritmo estable?</h4>
              <p>
                Un algoritmo estable mantiene el orden relativo de elementos con claves iguales.
                Por ejemplo, si ordenas estudiantes por nota y dos tienen la misma nota,
                un algoritmo estable los mantiene en el orden original.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>In-place vs. Extra memoria</h4>
              <p>
                Los algoritmos in-place (como Bubble, Selection, Insertion, Quick) ordenan
                usando solo O(1) o O(log n) de memoria extra. Merge Sort necesita O(n) de
                memoria adicional para el array temporal durante la fusión.
              </p>
            </div>
          </section>
        </div>
      </EducationalSection>

      {/* Apps Relacionadas */}
      <RelatedApps apps={getRelatedApps('visualizador-algoritmos')} />

      <Footer appName="visualizador-algoritmos" />
    </div>
  );
}
