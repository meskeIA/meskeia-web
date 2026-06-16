'use client';
// @disclaimer: exempt

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QuizComplejidadAlgoritmos.module.css';

type CategoriaAlgo = 'notacion' | 'busqueda-ordenacion' | 'estructuras-datos' | 'analisis-codigo' | 'comparativa';
type ModoQuiz = 'examen' | 'practica';
type EstadoQuiz = 'inicio' | 'jugando' | 'respondida' | 'fin';

interface PreguntaAlgo {
  id: number;
  categoria: CategoriaAlgo;
  pregunta: string;
  codigo?: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

const ETIQUETAS_CATEGORIA: Record<CategoriaAlgo, string> = {
  'notacion': 'Notación Big O',
  'busqueda-ordenacion': 'Búsqueda y Ordenación',
  'estructuras-datos': 'Estructuras de Datos',
  'analisis-codigo': 'Análisis de Código',
  'comparativa': 'Comparativa',
};

const BANCO_PREGUNTAS: PreguntaAlgo[] = [
  // ─── Categoría: notacion ───────────────────────────────────────────────────
  {
    id: 1,
    categoria: 'notacion',
    pregunta: '¿Qué describe la notación Big O?',
    opciones: [
      'El tiempo exacto de ejecución en segundos',
      'El mejor caso de un algoritmo',
      'El crecimiento del tiempo/espacio en función del tamaño de la entrada (caso peor)',
      'El número de líneas de código',
    ],
    correcta: 2,
    explicacion: 'Big O describe el comportamiento asintótico en el peor caso. No mide tiempo real (depende del hardware), sino cómo crece el recurso (tiempo o espacio) cuando n → ∞. Ignoramos constantes y términos de menor orden.',
  },
  {
    id: 2,
    categoria: 'notacion',
    pregunta: 'Ordena de mejor a peor: O(n²), O(log n), O(1), O(n log n), O(n)',
    opciones: [
      'O(1) < O(n) < O(log n) < O(n log n) < O(n²)',
      'O(1) < O(log n) < O(n) < O(n log n) < O(n²)',
      'O(log n) < O(1) < O(n) < O(n²) < O(n log n)',
      'O(1) < O(log n) < O(n log n) < O(n) < O(n²)',
    ],
    correcta: 1,
    explicacion: 'El orden correcto de "mejor a peor" es: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!). Para n=1000: O(1)=1, O(log n)≈10, O(n)=1000, O(n log n)≈10000, O(n²)=1.000.000.',
  },
  {
    id: 3,
    categoria: 'notacion',
    pregunta: '¿Cuál es la complejidad de acceder a un elemento de un array por su índice?',
    opciones: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correcta: 3,
    explicacion: 'Los arrays almacenan elementos en posiciones de memoria contiguas. Acceder por índice es una operación aritmética directa: base_address + index × element_size. Siempre igual sin importar el tamaño del array.',
  },
  {
    id: 4,
    categoria: 'notacion',
    pregunta: 'Si un algoritmo tiene complejidad O(2n + 5), ¿cuál es su Big O simplificado?',
    opciones: ['O(2n)', 'O(n + 5)', 'O(n)', 'O(2n + 5)'],
    correcta: 2,
    explicacion: 'En notación Big O se eliminan constantes multiplicativas y términos aditivos de menor orden. O(2n + 5) = O(n) porque al crecer n → ∞, la constante 2 y el término +5 son irrelevantes frente al crecimiento lineal.',
  },
  {
    id: 5,
    categoria: 'notacion',
    pregunta: '¿Qué complejidad tiene un algoritmo con dos bucles anidados que cada uno itera n veces?',
    opciones: ['O(2n)', 'O(n log n)', 'O(n²)', 'O(n + n)'],
    correcta: 2,
    explicacion: 'Dos bucles anidados que cada uno ejecuta n iteraciones realizan n × n = n² operaciones en total. Para n=100: 10.000 operaciones. Para n=1000: 1.000.000. Es el patrón más común de O(n²) y aparece en algoritmos como Bubble Sort o Selection Sort.',
  },

  // ─── Categoría: busqueda-ordenacion ───────────────────────────────────────
  {
    id: 6,
    categoria: 'busqueda-ordenacion',
    pregunta: '¿Cuál es la complejidad de la búsqueda binaria?',
    opciones: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    correcta: 2,
    explicacion: 'La búsqueda binaria divide el espacio de búsqueda por 2 en cada paso. Para n=1.000.000 solo necesita log₂(1.000.000) ≈ 20 comparaciones. Requisito: el array debe estar ordenado previamente.',
  },
  {
    id: 7,
    categoria: 'busqueda-ordenacion',
    pregunta: '¿Cuál es la complejidad temporal media de Quicksort?',
    opciones: ['O(n²)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correcta: 3,
    explicacion: 'En el caso promedio, Quicksort divide el array en dos mitades aproximadamente iguales (log n niveles de recursión) y procesa n elementos en cada nivel → O(n log n). En el peor caso (pivote siempre el mínimo/máximo en array ya ordenado) es O(n²).',
  },
  {
    id: 8,
    categoria: 'busqueda-ordenacion',
    pregunta: '¿Qué algoritmo de ordenación tiene garantía de O(n log n) en el peor caso?',
    opciones: ['Quicksort', 'Insertion Sort', 'Merge Sort', 'Bubble Sort'],
    correcta: 2,
    explicacion: 'Merge Sort siempre divide el array en dos mitades iguales (no depende del pivote) y la fusión toma O(n). Por eso su peor caso es O(n log n), a diferencia de Quicksort que puede degradar a O(n²). El precio es O(n) espacio adicional.',
  },
  {
    id: 9,
    categoria: 'busqueda-ordenacion',
    pregunta: '¿Cuándo es Insertion Sort preferible sobre Merge Sort?',
    opciones: [
      'Nunca, Merge Sort es siempre mejor',
      'Para arrays de más de 1000 elementos',
      'Para arrays pequeños (n < ~20) o casi ordenados',
      'Cuando se necesita ordenar en paralelo',
    ],
    correcta: 2,
    explicacion: 'Insertion Sort tiene O(n²) en general pero O(n) en arrays casi ordenados y muy bajo overhead de constantes. Para n pequeño, las constantes importan más que la complejidad asintótica. Python\'s Timsort usa Insertion Sort para subarrays pequeños.',
  },
  {
    id: 10,
    categoria: 'busqueda-ordenacion',
    pregunta: '¿Cuál es el límite inferior teórico de los algoritmos de ordenación basados en comparaciones?',
    opciones: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
    correcta: 3,
    explicacion: 'Cualquier algoritmo de ordenación que solo use comparaciones no puede superar O(n log n) en el caso promedio. La demostración usa árboles de decisión: n! permutaciones posibles requieren al menos log₂(n!) ≈ n log n comparaciones. Counting Sort y Radix Sort evitan esto no usando comparaciones.',
  },

  // ─── Categoría: estructuras-datos ─────────────────────────────────────────
  {
    id: 11,
    categoria: 'estructuras-datos',
    pregunta: '¿Cuál es la complejidad de buscar un elemento en un HashSet en el caso promedio?',
    opciones: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correcta: 3,
    explicacion: 'Las tablas hash calculan el índice directamente con la función hash: O(1) en promedio. En el peor caso (muchas colisiones) puede llegar a O(n), pero con una buena función hash y factor de carga adecuado, el promedio es O(1).',
  },
  {
    id: 12,
    categoria: 'estructuras-datos',
    pregunta: '¿Cuál es la complejidad de insertar al final de una lista enlazada con puntero a cola?',
    opciones: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correcta: 3,
    explicacion: 'Si la lista mantiene un puntero al último nodo (tail), insertar al final es O(1): crear nodo nuevo, actualizar tail.next y tail. Sin puntero tail, habría que recorrer toda la lista: O(n).',
  },
  {
    id: 13,
    categoria: 'estructuras-datos',
    pregunta: '¿Cuál es la complejidad de buscar un elemento en un árbol binario de búsqueda (BST) balanceado?',
    opciones: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correcta: 2,
    explicacion: 'En un BST balanceado con altura O(log n), cada comparación descarta la mitad del árbol. En el peor caso (BST degenerado, como una lista enlazada) es O(n). Por eso existen árboles autobalanceados como AVL o Red-Black.',
  },
  {
    id: 14,
    categoria: 'estructuras-datos',
    pregunta: '¿Qué complejidad tiene acceder al elemento de mayor prioridad en un heap (montículo)?',
    opciones: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
    correcta: 3,
    explicacion: 'En un max-heap, el elemento mayor está siempre en la raíz (posición 0 del array). Acceder es O(1). Insertar o eliminar el máximo es O(log n) porque requiere reordenar (sift-up/sift-down).',
  },
  {
    id: 15,
    categoria: 'estructuras-datos',
    pregunta: '¿Cuánto espacio extra usa Merge Sort además de los datos de entrada?',
    opciones: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correcta: 2,
    explicacion: 'Merge Sort necesita un array auxiliar del mismo tamaño para la fusión (merge step). Esto es una desventaja respecto a Quicksort, que ordena in-place con solo O(log n) de pila de llamadas.',
  },

  // ─── Categoría: analisis-codigo ───────────────────────────────────────────
  {
    id: 16,
    categoria: 'analisis-codigo',
    pregunta: '¿Cuál es la complejidad de este código?',
    codigo: 'for i in range(n):\n    for j in range(i, n):\n        print(i, j)',
    opciones: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2n)'],
    correcta: 2,
    explicacion: 'El bucle exterior itera n veces. El interior itera n-i veces. Total: n + (n-1) + ... + 1 = n(n+1)/2 ≈ n²/2 → O(n²). El hecho de que j empiece en i (no en 0) no cambia el orden de magnitud.',
  },
  {
    id: 17,
    categoria: 'analisis-codigo',
    pregunta: '¿Cuál es la complejidad de este código?',
    codigo: 'i = n\nwhile i > 1:\n    i = i // 2',
    opciones: ['O(n)', 'O(n²)', 'O(1)', 'O(log n)'],
    correcta: 3,
    explicacion: 'El valor de i se divide por 2 en cada iteración: n → n/2 → n/4 → ... → 1. El número de iteraciones es log₂(n). Este patrón de "dividir por una constante en cada paso" siempre produce O(log n).',
  },
  {
    id: 18,
    categoria: 'analisis-codigo',
    pregunta: '¿Cuál es la complejidad temporal de este código?',
    codigo: 'def fibonacci(n):\n    if n <= 1: return n\n    return fibonacci(n-1) + fibonacci(n-2)',
    opciones: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    correcta: 3,
    explicacion: 'Cada llamada genera 2 llamadas más. El árbol de recursión tiene profundidad n y ~2ⁿ nodos. Para n=40 ya son ~1.000 millones de llamadas. Solución: memoización reduce a O(n), programación dinámica iterativa también O(n).',
  },
  {
    id: 19,
    categoria: 'analisis-codigo',
    pregunta: '¿Cuál es la complejidad de este código con memoización?',
    codigo: 'memo = {}\ndef fib(n):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib(n-1) + fib(n-2)\n    return memo[n]',
    opciones: ['O(2ⁿ)', 'O(n²)', 'O(log n)', 'O(n)'],
    correcta: 3,
    explicacion: 'Con memoización, cada valor de fib(k) se calcula solo una vez y se guarda. Las siguientes consultas son O(1). En total se calculan n valores únicos → O(n) tiempo y O(n) espacio para el diccionario.',
  },
  {
    id: 20,
    categoria: 'analisis-codigo',
    pregunta: '¿Cuál es la complejidad de este código?',
    codigo: 'for i in range(n):\n    print(i)\nfor j in range(n):\n    for k in range(n):\n        print(j, k)',
    opciones: ['O(n + n²) = O(n³)', 'O(2n²)', 'O(n²)', 'O(n · n²) = O(n³)'],
    correcta: 2,
    explicacion: 'El primer bucle es O(n). El doble bucle anidado es O(n²). La suma de dos términos se simplifica al mayor: O(n) + O(n²) = O(n²). No se multiplican porque son secuenciales, no anidados.',
  },

  // ─── Categoría: comparativa ───────────────────────────────────────────────
  {
    id: 21,
    categoria: 'comparativa',
    pregunta: 'Para buscar un elemento en una lista no ordenada de 10 millones de elementos, ¿qué estructura es más eficiente?',
    opciones: [
      'Array (búsqueda lineal) O(n)',
      'Array ordenado (búsqueda binaria) O(log n)',
      'HashSet O(1) promedio',
      'BST balanceado O(log n)',
    ],
    correcta: 2,
    explicacion: 'O(1) > O(log n) > O(n). Para 10M elementos: HashSet ≈ 1 operación, BST/binary search ≈ 23 comparaciones, búsqueda lineal ≈ 5M comparaciones. El HashSet es el ganador claro si no necesitas orden.',
  },
  {
    id: 22,
    categoria: 'comparativa',
    pregunta: 'Tienes datos casi ordenados y debes ordenarlos. ¿Cuál es la mejor opción?',
    opciones: [
      'Merge Sort O(n log n) siempre',
      'Quicksort O(n log n) promedio',
      'Insertion Sort O(n) en datos casi ordenados',
      'Heap Sort O(n log n)',
    ],
    correcta: 2,
    explicacion: 'Insertion Sort tiene O(n) cuando los datos están casi ordenados (pocas inversiones). Para este caso específico, supera asintóticamente a Merge Sort. Timsort (Python, Java) usa exactamente este principio: detecta secuencias ya ordenadas y las combina con Merge Sort.',
  },
  {
    id: 23,
    categoria: 'comparativa',
    pregunta: 'Para implementar una cola de prioridad que soporte inserción y extracción del mínimo, ¿qué estructura es más eficiente?',
    opciones: [
      'Array sin ordenar: inserción O(1), extracción O(n)',
      'Array ordenado: inserción O(n), extracción O(1)',
      'Heap: inserción O(log n), extracción O(log n)',
      'Lista enlazada: inserción O(1), extracción O(n)',
    ],
    correcta: 2,
    explicacion: 'El heap equilibra ambas operaciones en O(log n). Para k inserciones y k extracciones: O(k log n). Los arrays desequilibran el coste: si hay muchas inserciones el array ordenado es malo; si hay muchas extracciones el no ordenado es malo.',
  },
  {
    id: 24,
    categoria: 'comparativa',
    pregunta: 'Tu algoritmo necesita saber si un elemento está en un conjunto. Hay 1 millón de elementos y se harán 10 millones de consultas. ¿Qué estructura minimiza el tiempo total?',
    opciones: [
      'Lista enlazada ordenada O(log n) con binary search',
      'Array ordenado O(log n) con binary search',
      'HashSet O(1) amortizado',
      'BST Red-Black O(log n)',
    ],
    correcta: 2,
    explicacion: 'Para 10M consultas: HashSet ≈ 10M ops totales; BST/binary search ≈ 10M × 20 ≈ 200M ops. El HashSet gana claramente. El trade-off es mayor uso de memoria y que no mantiene orden. Si necesitaras recorrer los elementos en orden, el BST sería mejor.',
  },
  {
    id: 25,
    categoria: 'comparativa',
    pregunta: 'Para encontrar el k-ésimo elemento más pequeño en un flujo continuo de datos, ¿cuál es la mejor estructura?',
    opciones: [
      'Ordenar el array completo cada vez: O(n log n) por consulta',
      'Árbol BST: O(log n) inserción, O(log n) búsqueda del k-ésimo',
      'Array sin ordenar: O(n) por búsqueda con quickselect',
      'Max-heap de tamaño k: O(log k) por inserción, O(1) para el k-ésimo',
    ],
    correcta: 3,
    explicacion: 'Manteniendo un max-heap de tamaño k, el k-ésimo mínimo está siempre en la raíz (O(1)). Cada nuevo elemento: si es menor que la raíz, se inserta (O(log k)) y se extrae el máximo (O(log k)). Total para n elementos: O(n log k). Patrón clásico de entrevistas técnicas.',
  },
];

const TODAS_CATEGORIAS = Object.keys(ETIQUETAS_CATEGORIA) as CategoriaAlgo[];

function getClasificacion(pct: number): { texto: string; emoji: string } {
  if (pct === 100) return { texto: 'Experto en algoritmia', emoji: '🏆' };
  if (pct >= 80) return { texto: 'Listo para entrevistas senior', emoji: '🌟' };
  if (pct >= 60) return { texto: 'Buen nivel para entrevistas júnior', emoji: '👍' };
  if (pct >= 40) return { texto: 'Base sólida, sigue practicando', emoji: '💪' };
  return { texto: 'Necesitas repasar los fundamentos', emoji: '📚' };
}

export default function QuizComplejidadAlgoritmosPage() {
  const [estado, setEstado] = useState<EstadoQuiz>('inicio');
  const [modo, setModo] = useState<ModoQuiz>('examen');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaAlgo>('notacion');
  const [preguntas, setPreguntas] = useState<PreguntaAlgo[]>([]);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState<boolean[]>([]);
  const [aciertosPorCategoria, setAciertosPorCategoria] = useState<Record<CategoriaAlgo, { correctas: number; total: number }>>({
    'notacion': { correctas: 0, total: 0 },
    'busqueda-ordenacion': { correctas: 0, total: 0 },
    'estructuras-datos': { correctas: 0, total: 0 },
    'analisis-codigo': { correctas: 0, total: 0 },
    'comparativa': { correctas: 0, total: 0 },
  });

  const preguntaActual = preguntas[indice];
  const haRespondido = seleccionada !== null;
  const totalAciertos = aciertos.filter(Boolean).length;
  const pct = preguntas.length > 0 ? Math.round((totalAciertos / preguntas.length) * 100) : 0;

  function iniciarQuiz() {
    let seleccionadas: PreguntaAlgo[];
    if (modo === 'examen') {
      seleccionadas = [...BANCO_PREGUNTAS];
    } else {
      seleccionadas = BANCO_PREGUNTAS.filter(p => p.categoria === categoriaSeleccionada);
    }
    setPreguntas(seleccionadas);
    setIndice(0);
    setSeleccionada(null);
    setAciertos([]);
    setAciertosPorCategoria({
      'notacion': { correctas: 0, total: 0 },
      'busqueda-ordenacion': { correctas: 0, total: 0 },
      'estructuras-datos': { correctas: 0, total: 0 },
      'analisis-codigo': { correctas: 0, total: 0 },
      'comparativa': { correctas: 0, total: 0 },
    });
    setEstado('jugando');
  }

  function responder(i: number) {
    if (haRespondido) return;
    const esCorrecto = i === preguntaActual.correcta;
    setSeleccionada(i);
    setAciertos(prev => [...prev, esCorrecto]);
    setAciertosPorCategoria(prev => ({
      ...prev,
      [preguntaActual.categoria]: {
        correctas: prev[preguntaActual.categoria].correctas + (esCorrecto ? 1 : 0),
        total: prev[preguntaActual.categoria].total + 1,
      },
    }));
    setEstado('respondida');
  }

  function siguiente() {
    if (indice + 1 >= preguntas.length) {
      setEstado('fin');
    } else {
      setIndice(p => p + 1);
      setSeleccionada(null);
      setEstado('jugando');
    }
  }

  function reiniciar() {
    setEstado('inicio');
    setPreguntas([]);
    setIndice(0);
    setSeleccionada(null);
    setAciertos([]);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitulo}>Quiz Complejidad Algorítmica</h1>
        <p className={styles.heroSubtitulo}>
          25 preguntas sobre notación Big O, ordenación, estructuras de datos y análisis de código
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Pantalla de inicio ── */}
        {estado === 'inicio' && (
          <div className={styles.pantallaCentrada}>
            <div className={styles.cardInicio}>
              <div className={styles.iconoInicio} aria-hidden="true">⚡</div>
              <h2 className={styles.tituloInicio}>¿Sabes analizar algoritmos?</h2>
              <p className={styles.descInicio}>
                Pon a prueba tu conocimiento de complejidad algorítmica con preguntas sobre
                notación Big O, búsqueda, ordenación, estructuras de datos y análisis de código.
              </p>

              <div className={styles.selectorModo}>
                <p className={styles.labelModo}>Modo de juego:</p>
                <div className={styles.botonesModо}>
                  <button
                    type="button"
                    className={`${styles.btnModo} ${modo === 'examen' ? styles.btnModoActivo : ''}`}
                    onClick={() => setModo('examen')}
                    aria-pressed={modo === 'examen'}
                  >
                    Examen completo (25)
                  </button>
                  <button
                    type="button"
                    className={`${styles.btnModo} ${modo === 'practica' ? styles.btnModoActivo : ''}`}
                    onClick={() => setModo('practica')}
                    aria-pressed={modo === 'practica'}
                  >
                    Práctica por categoría (5)
                  </button>
                </div>
              </div>

              {modo === 'practica' && (
                <div className={styles.selectorCategoria}>
                  <p className={styles.labelModo}>Elige categoría:</p>
                  <div className={styles.categoriasGrid}>
                    {TODAS_CATEGORIAS.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={`${styles.btnCategoria} ${styles[`cat_${cat.replace(/-/g, '_')}`]} ${categoriaSeleccionada === cat ? styles.btnCategoriaActivo : ''}`}
                        onClick={() => setCategoriaSeleccionada(cat)}
                        aria-pressed={categoriaSeleccionada === cat}
                      >
                        {ETIQUETAS_CATEGORIA[cat]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.badgesCategoria}>
                {TODAS_CATEGORIAS.map(cat => (
                  <span key={cat} className={`${styles.badge} ${styles[`badge_${cat.replace(/-/g, '_')}`]}`}>
                    {ETIQUETAS_CATEGORIA[cat]}
                  </span>
                ))}
              </div>

              <button type="button" className={styles.btnPrimario} onClick={iniciarQuiz}>
                {modo === 'examen' ? 'Comenzar examen →' : `Practicar ${ETIQUETAS_CATEGORIA[categoriaSeleccionada]} →`}
              </button>
            </div>
          </div>
        )}

        {/* ── Pantalla de pregunta / respondida ── */}
        {(estado === 'jugando' || estado === 'respondida') && preguntaActual && (
          <div className={styles.areaQuiz}>
            <div className={styles.barraProgreso}>
              <div className={styles.progresoInfo}>
                <span>Pregunta {indice + 1} de {preguntas.length}</span>
                <span className={styles.aciertosActuales}>
                  <span aria-hidden="true">✓</span> {totalAciertos} correctas
                </span>
              </div>
              <div className={styles.barraFondo}>
                <div
                  className={styles.barraRelleno}
                  style={{ width: `${(indice / preguntas.length) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={indice}
                  aria-valuemin={0}
                  aria-valuemax={preguntas.length}
                />
              </div>
            </div>

            <div className={styles.tarjetaPregunta}>
              <span className={`${styles.badgeCategoria} ${styles[`badge_${preguntaActual.categoria.replace(/-/g, '_')}`]}`}>
                {ETIQUETAS_CATEGORIA[preguntaActual.categoria]}
              </span>

              <p className={styles.textoPregunta}>{preguntaActual.pregunta}</p>

              {preguntaActual.codigo && (
                <pre className={styles.bloquecodigo}>
                  <code>{preguntaActual.codigo}</code>
                </pre>
              )}

              <div className={styles.listaOpciones}>
                {preguntaActual.opciones.map((opcion, i) => {
                  let claseOpcion = styles.opcion;
                  if (haRespondido) {
                    if (i === preguntaActual.correcta) claseOpcion = `${styles.opcion} ${styles.opcionCorrecta}`;
                    else if (i === seleccionada) claseOpcion = `${styles.opcion} ${styles.opcionIncorrecta}`;
                    else claseOpcion = `${styles.opcion} ${styles.opcionApagada}`;
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      className={claseOpcion}
                      onClick={() => responder(i)}
                      disabled={haRespondido}
                      aria-pressed={seleccionada === i}
                    >
                      <span className={styles.letraOpcion} aria-hidden="true">
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <span>{opcion}</span>
                    </button>
                  );
                })}
              </div>

              {haRespondido && (
                <div
                  className={`${styles.panelFeedback} ${seleccionada === preguntaActual.correcta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                  role="alert"
                  aria-live="polite"
                >
                  <p className={styles.resultadoFeedback}>
                    {seleccionada === preguntaActual.correcta ? '✓ ¡Correcto!' : '✗ Incorrecto'}
                  </p>
                  <p className={styles.explicacionFeedback}>{preguntaActual.explicacion}</p>
                  <button type="button" className={styles.btnSiguiente} onClick={siguiente}>
                    {indice + 1 >= preguntas.length ? 'Ver resultados →' : 'Siguiente pregunta →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Pantalla de resultados ── */}
        {estado === 'fin' && (
          <div className={styles.pantallaCentrada}>
            <div className={styles.cardResultado}>
              <div className={styles.circuloPuntuacion}>
                <span className={styles.numeroAciertos}>{totalAciertos}</span>
                <span className={styles.totalPreguntas}>/{preguntas.length}</span>
              </div>

              <div className={styles.mensajeClasificacion}>
                <span className={styles.emojiClasificacion} aria-hidden="true">
                  {getClasificacion(pct).emoji}
                </span>
                <p className={styles.textoClasificacion}>{getClasificacion(pct).texto}</p>
              </div>

              <div className={styles.statsResumen}>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{totalAciertos}</span>
                  <span className={styles.statLabel}>Aciertos</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{preguntas.length - totalAciertos}</span>
                  <span className={styles.statLabel}>Errores</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{pct}%</span>
                  <span className={styles.statLabel}>Puntuación</span>
                </div>
              </div>

              {modo === 'examen' && (
                <div className={styles.desgloseCategorias}>
                  <h3 className={styles.tituloDesglose}>Resultado por categoría</h3>
                  {TODAS_CATEGORIAS.map(cat => {
                    const datos = aciertosPorCategoria[cat];
                    const porcentaje = datos.total > 0 ? Math.round((datos.correctas / datos.total) * 100) : 0;
                    return (
                      <div key={cat} className={styles.filaCategoriaResultado}>
                        <span className={`${styles.badgePequeno} ${styles[`badge_${cat.replace(/-/g, '_')}`]}`}>
                          {ETIQUETAS_CATEGORIA[cat]}
                        </span>
                        <div className={styles.barritaCategoria}>
                          <div
                            className={styles.barritaRelleno}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className={styles.porcentajeCategoria}>{datos.correctas}/{datos.total}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className={styles.botonesResultado}>
                <button type="button" className={styles.btnPrimario} onClick={iniciarQuiz}>
                  Repetir quiz
                </button>
                <button type="button" className={styles.btnSecundario} onClick={reiniciar}>
                  Cambiar modo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <EducationalSection
        title="Complejidad Algorítmica: Conceptos Esenciales"
        subtitle="Los 6 órdenes de complejidad que necesitas dominar"
      >
        <p>
          La complejidad algorítmica describe cómo crece el consumo de recursos (tiempo o memoria)
          de un algoritmo en función del tamaño de la entrada. Entenderla te permite elegir el
          algoritmo adecuado para cada problema y razonar sobre escalabilidad.
        </p>

        <h3>Los 6 órdenes de complejidad más comunes</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Notación</th>
                <th>Nombre</th>
                <th>Ejemplo de algoritmo</th>
                <th>n=100 ops.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>O(1)</code></td>
                <td>Constante</td>
                <td>Acceso a array por índice, operaciones hash</td>
                <td>1</td>
              </tr>
              <tr>
                <td><code>O(log n)</code></td>
                <td>Logarítmica</td>
                <td>Búsqueda binaria, BST balanceado</td>
                <td>~7</td>
              </tr>
              <tr>
                <td><code>O(n)</code></td>
                <td>Lineal</td>
                <td>Búsqueda lineal, recorrido de lista</td>
                <td>100</td>
              </tr>
              <tr>
                <td><code>O(n log n)</code></td>
                <td>Lineal-logarítmica</td>
                <td>Merge Sort, Heap Sort, Quicksort (promedio)</td>
                <td>~700</td>
              </tr>
              <tr>
                <td><code>O(n²)</code></td>
                <td>Cuadrática</td>
                <td>Bubble Sort, Insertion Sort, Selection Sort</td>
                <td>10.000</td>
              </tr>
              <tr>
                <td><code>O(2ⁿ)</code></td>
                <td>Exponencial</td>
                <td>Fibonacci recursivo, subconjuntos de un conjunto</td>
                <td>~10³⁰</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Cómo razonar la complejidad en voz alta (entrevistas)</h3>
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">💡</span>
            <strong>Técnica para entrevistas técnicas</strong>
          </div>
          <p style={{ marginTop: '0.75rem' }}>
            Al analizar un fragmento de código, sigue estos pasos en voz alta:
          </p>
          <ol className={styles.listaConsejos}>
            <li><strong>Identifica los bucles</strong>: cada bucle que itera n veces multiplica la complejidad.</li>
            <li><strong>Anidados = multiplicar, secuenciales = sumar</strong>: dos bucles anidados → O(n²); dos bucles seguidos → O(n) + O(n) = O(n).</li>
            <li><strong>Busca divisiones</strong>: si la entrada se divide por 2 en cada paso → O(log n).</li>
            <li><strong>Simplifica</strong>: elimina constantes y términos de menor orden al final.</li>
            <li><strong>Menciona el caso peor</strong>: salvo que el entrevistador pregunte por el promedio o el mejor caso.</li>
          </ol>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-complejidad-algoritmos')} />
      <ShareCard appName="quiz-complejidad-algoritmos" />
      <Footer appName="quiz-complejidad-algoritmos" />
    </div>
  );
}
