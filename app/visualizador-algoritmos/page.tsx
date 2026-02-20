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
        title="Aprende Algoritmos de Ordenación: Guía Completa con Ejemplos"
        subtitle="Comprende las diferencias, cuándo usar cada algoritmo y cómo elegir el más adecuado para tu proyecto"
        icon="📚"
      >
        <div className={styles.educationalContent}>

          {/* Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>📊 Comparativa Completa de Algoritmos</h2>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Algoritmo</th>
                  <th>Mejor Caso</th>
                  <th>Caso Promedio</th>
                  <th>Peor Caso</th>
                  <th>Espacio</th>
                  <th>Estable</th>
                  <th>Ideal para</th>
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
                  <td>Aprender, arrays muy pequeños</td>
                </tr>
                <tr>
                  <td><strong>Selection Sort</strong></td>
                  <td>O(n²)</td>
                  <td>O(n²)</td>
                  <td>O(n²)</td>
                  <td>O(1)</td>
                  <td>No</td>
                  <td>Minimizar escrituras en memoria</td>
                </tr>
                <tr>
                  <td><strong>Insertion Sort</strong></td>
                  <td>O(n)</td>
                  <td>O(n²)</td>
                  <td>O(n²)</td>
                  <td>O(1)</td>
                  <td>Sí</td>
                  <td>Arrays casi ordenados, pequeños</td>
                </tr>
                <tr>
                  <td><strong>Quick Sort</strong></td>
                  <td>O(n log n)</td>
                  <td>O(n log n)</td>
                  <td>O(n²)</td>
                  <td>O(log n)</td>
                  <td>No</td>
                  <td>Uso general, datos aleatorios</td>
                </tr>
                <tr>
                  <td><strong>Merge Sort</strong></td>
                  <td>O(n log n)</td>
                  <td>O(n log n)</td>
                  <td>O(n log n)</td>
                  <td>O(n)</td>
                  <td>Sí</td>
                  <td>Ordenación garantizada, objetos</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Casos de uso */}
          <section className={styles.guideSection}>
            <h2>👥 ¿Quién usa este visualizador?</h2>
            <div className={styles.casosUsoGrid}>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🎓</div>
                <div className={styles.casoTitle}>Estudiante de Informática</div>
                <div className={styles.casoSubtitle}>1º y 2º de grado, FP DAM/DAW</div>
                <div className={styles.casoDesc}>
                  Visualiza cómo funciona cada algoritmo paso a paso para entender los conceptos
                  de complejidad. Ideal para preparar exámenes de Algoritmos y Estructuras de Datos.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>💼</div>
                <div className={styles.casoTitle}>Dev Junior en Entrevistas</div>
                <div className={styles.casoSubtitle}>Preparando entrevistas técnicas</div>
                <div className={styles.casoDesc}>
                  Repasa los algoritmos clásicos que preguntan en entrevistas de empresas tech.
                  Comprende el trade-off entre Quick Sort y Merge Sort para explicarlo con fluidez.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🏫</div>
                <div className={styles.casoTitle}>Profesor / Formador</div>
                <div className={styles.casoSubtitle}>Docentes de programación</div>
                <div className={styles.casoDesc}>
                  Usa la visualización en clase para explicar de forma gráfica cómo se comportan
                  los algoritmos. El modo paso a paso permite avanzar al ritmo de los alumnos.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🔍</div>
                <div className={styles.casoTitle}>Curioso con Experiencia</div>
                <div className={styles.casoSubtitle}>Devs con varios años de experiencia</div>
                <div className={styles.casoDesc}>
                  Refresca conceptos que quizás no usas en el día a día. Comprueba visualmente
                  por qué Insertion Sort supera a Quick Sort en arrays muy pequeños o ya ordenados.
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>❓ Preguntas Frecuentes sobre Algoritmos</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Por qué Quick Sort es más rápido en la práctica si tiene peor caso O(n²)?</div>
                <div className={styles.faqRespuesta}>
                  La constante oculta en la notación Big O importa. Quick Sort tiene muy buen rendimiento
                  de caché (accede a memoria secuencialmente) y el peor caso O(n²) es estadísticamente raro
                  con datos aleatorios. Con pivote aleatorio, la probabilidad del peor caso es despreciable.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cuándo usar Merge Sort en lugar de Quick Sort?</div>
                <div className={styles.faqRespuesta}>
                  Usa Merge Sort cuando necesites rendimiento garantizado O(n log n) siempre (Quick Sort
                  puede degradarse), cuando necesites estabilidad (mantener el orden de elementos iguales),
                  o cuando ordenes listas enlazadas (Merge Sort no necesita acceso aleatorio).
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué significa exactamente que un algoritmo sea "estable"?</div>
                <div className={styles.faqRespuesta}>
                  Un algoritmo estable mantiene el orden relativo de los elementos con la misma clave.
                  Ejemplo: si ordenas una lista de personas por apellido y dos personas tienen el mismo
                  apellido, un algoritmo estable mantiene el orden original entre ellas. Bubble, Insertion
                  y Merge Sort son estables; Selection y Quick Sort no lo son.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Existen algoritmos más rápidos que O(n log n) para ordenar?</div>
                <div className={styles.faqRespuesta}>
                  Sí, pero solo cuando los datos tienen restricciones. Counting Sort, Radix Sort y Bucket Sort
                  pueden lograr O(n) si los valores son enteros en un rango conocido. Para ordenación por
                  comparación pura, O(n log n) es el límite teórico demostrado matemáticamente.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Por qué se enseña Bubble Sort si es tan ineficiente?</div>
                <div className={styles.faqRespuesta}>
                  Bubble Sort es pedagogicamente valioso: su lógica es intuitiva, fácil de implementar
                  y debuggear, y sirve para introducir conceptos como comparaciones, intercambios y
                  complejidad. En producción nunca se usa directamente, pero entenderlo afianza las bases.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es un "pivote" en Quick Sort y por qué importa su elección?</div>
                <div className={styles.faqRespuesta}>
                  El pivote es el elemento sobre el que se divide el array en dos partes: menores y mayores.
                  Una mala elección (siempre el mínimo o máximo) lleva al peor caso O(n²). La estrategia
                  "mediana de tres" (primer, medio y último elemento) o pivote aleatorio evita este problema.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cuándo es mejor Insertion Sort que Quick Sort?</div>
                <div className={styles.faqRespuesta}>
                  Para arrays de menos de 10-20 elementos, Insertion Sort suele ganar por su constante
                  pequeña y mejor comportamiento de caché. Además, si el array está casi ordenado (pocas
                  inversiones), Insertion Sort es O(n) mientras Quick Sort sigue siendo O(n log n).
                  Por eso muchos Quick Sort modernos cambian a Insertion Sort para subproblemas pequeños.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué algoritmo usa JavaScript internamente en Array.sort()?</div>
                <div className={styles.faqRespuesta}>
                  Desde 2019 (V8 v7.0+), JavaScript usa Tim Sort, un híbrido de Merge Sort e Insertion Sort
                  diseñado para datos reales. Es estable, con complejidad O(n log n) en el peor caso y
                  O(n) cuando los datos ya están parcialmente ordenados (muy común en la práctica).
                </div>
              </div>
            </div>
          </section>

          {/* Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>🗺️ Cómo elegir el algoritmo correcto: 6 pasos</h2>
            <ol className={styles.pasosList}>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>1</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Evalúa el tamaño de los datos</div>
                  <div className={styles.pasoDesc}>
                    ¿Menos de 50 elementos? Considera Insertion Sort (constante pequeña, buen caché).
                    ¿Cientos o miles? O(n log n) es obligatorio: Quick Sort o Merge Sort.
                    ¿Millones? Considera algoritmos especializados (Radix Sort si son enteros).
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>2</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Analiza si los datos están parcialmente ordenados</div>
                  <div className={styles.pasoDesc}>
                    Si los datos llegan casi ordenados (ej: logs con timestamps), Insertion Sort es O(n).
                    Si son completamente aleatorios, Quick Sort con pivote aleatorio es óptimo.
                    Si son datos reales mixtos, Tim Sort (el de JavaScript) es la mejor opción general.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>3</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Decide si necesitas estabilidad</div>
                  <div className={styles.pasoDesc}>
                    ¿Ordenas por múltiples criterios? (ej: primero por precio, luego por nombre).
                    Si la ordenación secundaria ya está hecha y quieres preservarla, necesitas
                    un algoritmo estable: Merge Sort, Insertion Sort o Tim Sort.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>4</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Considera las restricciones de memoria</div>
                  <div className={styles.pasoDesc}>
                    Si la memoria es crítica (sistemas embebidos, arrays gigantes), usa algoritmos
                    in-place: Quick Sort O(log n), Heap Sort O(1). Si tienes memoria disponible,
                    Merge Sort O(n) extra te da estabilidad y rendimiento garantizado.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>5</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Evalúa el peor caso aceptable</div>
                  <div className={styles.pasoDesc}>
                    En sistemas críticos (tiempo real, banca), el peor caso importa tanto como
                    el promedio. Quick Sort puede degradarse a O(n²) en datos adversariales.
                    Merge Sort garantiza O(n log n) siempre. Para uso general, Quick Sort aleatorio
                    es seguro estadísticamente.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>6</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Mide y decide con benchmarks reales</div>
                  <div className={styles.pasoDesc}>
                    La teoría guía, pero los datos reales deciden. Haz benchmarks con tu conjunto
                    de datos específico. A veces una implementación bien optimizada de un algoritmo
                    &ldquo;peor&rdquo; supera a una naïve de un algoritmo &ldquo;mejor&rdquo;.
                    Usa herramientas como jsperf.com o console.time() en JavaScript.
                  </div>
                </div>
              </li>
            </ol>
          </section>

          {/* Tips y Errores */}
          <section className={styles.guideSection}>
            <h2>💡 Tips y Errores Frecuentes</h2>
            <div className={styles.tipsErrorsSection}>
              <div className={styles.tipsColumn}>
                <div className={styles.tipsHeader}>✅ Tips de Experto</div>
                <div className={styles.tipItem}>
                  Para arrays pequeños (&lt;20 elementos), Insertion Sort gana por la constante pequeña
                  y mejor localidad de caché, aunque su Big O sea peor.
                </div>
                <div className={styles.tipItem}>
                  Quick Sort con pivote aleatorio convierte el peor caso O(n²) en un evento
                  estadísticamente despreciable sin coste algorítmico.
                </div>
                <div className={styles.tipItem}>
                  En JavaScript usa Array.sort() (Tim Sort) en lugar de reimplementar:
                  está altamente optimizado y es estable desde ES2019.
                </div>
                <div className={styles.tipItem}>
                  Selection Sort tiene una ventaja única: minimiza el número de escrituras
                  en memoria (máximo n-1 intercambios). Útil en EEPROM con escrituras limitadas.
                </div>
                <div className={styles.tipItem}>
                  Para ordenar listas enlazadas, Merge Sort es natural porque no necesita
                  acceso aleatorio. Quick Sort en listas enlazadas es complicado.
                </div>
                <div className={styles.tipItem}>
                  Si tus datos son enteros en rango acotado, Counting Sort o Radix Sort
                  logran O(n), superando el límite teórico de comparación O(n log n).
                </div>
              </div>
              <div className={styles.tipsColumn}>
                <div className={styles.errorsHeader}>❌ Errores Frecuentes</div>
                <div className={styles.errorItem}>
                  Confundir complejidad media con peor caso. Quick Sort tiene O(n log n) promedio
                  pero O(n²) peor caso, no al revés.
                </div>
                <div className={styles.errorItem}>
                  Asumir que O(n log n) siempre es más rápido que O(n²). Para arrays pequeños,
                  la constante oculta en Big O puede invertir el resultado real.
                </div>
                <div className={styles.errorItem}>
                  Ignorar la estabilidad. Si ordenas registros multi-campo (nombre + apellido),
                  un algoritmo inestable puede destruir la ordenación secundaria.
                </div>
                <div className={styles.errorItem}>
                  Creer que Quick Sort es O(log n) en espacio porque es in-place.
                  La pila de llamadas recursivas ocupa O(log n) en el caso medio y O(n) en el peor.
                </div>
                <div className={styles.errorItem}>
                  Usar Bubble Sort en producción &ldquo;porque los arrays son pequeños&rdquo;.
                  Insertion Sort es siempre mejor que Bubble Sort para arrays pequeños.
                </div>
                <div className={styles.errorItem}>
                  Confundir número de comparaciones con número de intercambios.
                  Selection Sort minimiza intercambios pero maximiza comparaciones.
                </div>
              </div>
            </div>
          </section>

          {/* Conceptos clave (mantenido del original) */}
          <section className={styles.guideSection}>
            <h2>📖 Conceptos Clave de Complejidad</h2>

            <div className={styles.tipCard}>
              <h4>¿Qué significa O(n²) en la práctica?</h4>
              <p>
                La notación O grande describe cómo crece el tiempo de ejecución con el tamaño
                de la entrada. O(n²) significa que si duplicas el tamaño del array, el tiempo
                se cuadruplica. O(n log n) crece mucho más lento: un array de 1.000 elementos
                tarda ~10.000 operaciones en vez de ~1.000.000 con O(n²).
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>Algoritmos estables vs. inestables</h4>
              <p>
                Un algoritmo estable mantiene el orden relativo de elementos con claves iguales.
                Por ejemplo, si ordenas estudiantes por nota y dos tienen la misma nota,
                un algoritmo estable los mantiene en el orden original. Estables: Bubble, Insertion,
                Merge Sort. Inestables: Selection Sort, Quick Sort (implementación estándar).
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>In-place vs. memoria adicional</h4>
              <p>
                Los algoritmos in-place (Bubble, Selection, Insertion, Quick) ordenan
                usando solo O(1) o O(log n) de memoria extra. Merge Sort necesita O(n) de
                memoria adicional para el array temporal durante la fusión, lo que puede ser
                un problema con arrays de cientos de millones de elementos.
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
