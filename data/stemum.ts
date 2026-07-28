/**
 * Catálogo del portal Stemum (stemum.com) — fuente única de verdad.
 *
 * Lo consumen:
 * - `app/stemum/[disciplina]/page.tsx`: las tarjetas de cada parrilla.
 * - `proxy.ts` (host-rewrite): qué slugs son apps del catálogo y qué rutas son
 *   páginas de portal.
 * - `MeskeiaLogo` (breadcrumb): a qué disciplina pertenece la app actual.
 * - `app/stemum/page.tsx` y `llms.txt`: contadores y listados.
 *
 * Para añadir una app a una oleada: una entrada en STEMUM_APPS, nada más.
 * `npm run check:stemum` (y el propio build) avisan si algo queda descosido.
 */

// Disciplinas del portal: slug de ruta → etiqueta visible.
export const STEMUM_DISCIPLINAS: Record<string, string> = {
  'computacion': 'Computación',
  'fisica': 'Física',
  'matematicas': 'Matemáticas',
  'quimica': 'Química',
  'biologia': 'Biología',
  'tierra-espacio': 'Tierra y Espacio',
};

/**
 * CATÁLOGO DE APPS — fuente única, también de las parrillas.
 *
 * Cada entrada es a la vez la pertenencia a disciplina (breadcrumb, proxy,
 * contadores) y la tarjeta que se pinta en `app/stemum/[disciplina]/page.tsx`.
 * Van juntas a propósito: mientras fueron dos listas separadas, añadir la app al
 * mapa y olvidar la tarjeta la dejaba contada en el hero pero invisible en su
 * parrilla, y sin dar ningún error — pasó con `simulador-logica-secuencial` y
 * `ajustar-ecuaciones-quimicas` (28/07/2026).
 *
 * Las apps viven en meskeIA y se sirven bajo stemum.com en passthrough.
 * El orden dentro de cada disciplina es el orden de su parrilla.
 */
export type StemumApp = {
  slug: string;
  /** Emoji decorativo de la tarjeta (se pinta con aria-hidden). */
  icon: string;
  /** Título corto, sin «Simulador de» ni «Visualizador de». */
  titulo: string;
  /** Qué se manipula, en 1-2 frases. */
  desc: string;
  /** Slug de disciplina (clave de STEMUM_DISCIPLINAS). */
  disciplina: string;
};

export const STEMUM_APPS: StemumApp[] = [
  // Computación
  {
    slug: 'visualizador-algoritmos-ordenacion',
    icon: '🔢',
    titulo: 'Algoritmos de ordenación',
    desc: 'Burbuja, inserción, quicksort y mergesort animados paso a paso, con su complejidad Big O y cuándo usar cada uno.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-automatas-finitos',
    icon: '🔁',
    titulo: 'Autómatas finitos',
    desc: 'Diseña autómatas DFA y NFA con un editor visual y valida cadenas con animación y modo por lotes.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-maquina-turing',
    icon: '⚙️',
    titulo: 'Máquina de Turing',
    desc: 'Cinta animada y tabla de reglas con programas clásicos: incrementador binario, duplicador y palíndromos.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-grafos',
    icon: '🕸️',
    titulo: 'Grafos y caminos',
    desc: 'Editor visual de grafos con BFS, DFS, Dijkstra y A*, mostrando la cola, la pila y el heap en vivo.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-arboles-bst-avl',
    icon: '🌳',
    titulo: 'Árboles BST y AVL',
    desc: 'Inserta, elimina y busca nodos viendo las rotaciones de equilibrado AVL y los cuatro recorridos.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-arboles-b',
    icon: '🌲',
    titulo: 'Árbol B (B-Tree)',
    desc: 'Inserción con división de nodos, borrado con préstamo y fusión, y orden configurable: la estructura que indexa las bases de datos.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-llm-funcionamiento',
    icon: '🤖',
    titulo: 'Cómo funciona un LLM',
    desc: 'Tokens, embeddings, el mecanismo de atención de los transformers y el efecto de la temperatura, explicados al detalle.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-sql-join',
    icon: '🔗',
    titulo: 'JOINs de SQL',
    desc: 'INNER, LEFT, RIGHT y FULL OUTER con tablas editables, diagrama de Venn animado y el SQL generado.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-planificador-procesos',
    icon: '📊',
    titulo: 'Planificador de procesos',
    desc: 'FCFS, SJF, SRTF, Round Robin y prioridades con diagrama de Gantt y métricas de espera y turnaround.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-concurrencia',
    icon: '🔀',
    titulo: 'Concurrencia y semáforos',
    desc: 'Ejecuta hilos paso a paso: provoca condiciones de carrera, resuelve el productor-consumidor y reproduce el deadlock de los filósofos comensales.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-modelo-osi',
    icon: '🌐',
    titulo: 'Modelo OSI',
    desc: 'Recorre las 7 capas de red paso a paso y observa cómo un mensaje se encapsula y desencapsula, con comparativa frente al modelo TCP/IP.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-programacion-dinamica',
    icon: '📐',
    titulo: 'Programación dinámica',
    desc: 'Rellena la tabla DP celda a celda en la mochila 0/1, la LCS y Fibonacci, viendo de qué celdas depende cada valor y reconstruyendo la solución.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-backtracking',
    icon: '♛',
    titulo: 'Backtracking (N reinas)',
    desc: 'El algoritmo de vuelta atrás resolviendo las N reinas: prueba, descarta por conflicto, coloca y retrocede, con recuento de intentos y soluciones.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-git-ramas',
    icon: '🌿',
    titulo: 'Git: ramas y merge',
    desc: 'Crea commits, abre ramas, cambia entre ellas y fusiónalas viendo crecer el grafo de commits en tiempo real, con HEAD y los comandos de Git equivalentes.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-reemplazo-paginas',
    icon: '📄',
    titulo: 'Reemplazo de páginas',
    desc: 'FIFO, LRU, Óptimo, Clock y LFU con tabla matricial, comparativa y detección de la anomalía de Belady.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-recursion',
    icon: '🌀',
    titulo: 'Recursión paso a paso',
    desc: 'Seis funciones recursivas como factorial, Fibonacci o Hanoi con la pila de llamadas viva en cada paso.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-regresion',
    icon: '📈',
    titulo: 'Regresión',
    desc: 'Regresión lineal, polinómica y logística con mínimos cuadrados o gradiente animado y métricas R², MSE y accuracy.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-kmeans',
    icon: '🎯',
    titulo: 'Clustering K-means',
    desc: 'Animación de asignación y recálculo de centroides, inicialización k-means++ y método del codo para elegir k.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-puertas-logicas',
    icon: '🔌',
    titulo: 'Puertas lógicas',
    desc: 'Puertas lógicas, tablas de verdad y circuitos digitales para construir y probar combinaciones.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-logica-secuencial',
    icon: '⏱️',
    titulo: 'Lógica secuencial',
    desc: 'Biestables D, JK, T y SR ciclo a ciclo, contador binario, registro de desplazamiento y máquina de estados, con el cronograma de señales dibujándose en vivo.',
    disciplina: 'computacion',
  },
  {
    slug: 'calculadora-algebra-booleana',
    icon: '🔢',
    titulo: 'Álgebra de Boole y Karnaugh',
    desc: 'Simplifica expresiones booleanas con mapas de Karnaugh de 2-4 variables: pulsa las celdas y observa las agrupaciones y la forma mínima SOP/POS al instante.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-estructuras-datos',
    icon: '📚',
    titulo: 'Estructuras de datos',
    desc: 'Arrays, pilas, colas, listas enlazadas y árboles BST con operaciones visualizadas en tiempo real.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-logica-proposicional',
    icon: '🧮',
    titulo: 'Lógica proposicional',
    desc: 'Tablas de verdad AND, OR, NOT y XOR, evaluador de fórmulas y mapas de Karnaugh para simplificar.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-teoria-informacion',
    icon: '📡',
    titulo: 'Teoría de la información',
    desc: 'Entropía de Shannon con sliders, codificación Huffman animada y el teorema de Shannon-Hartley.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-arquitectura-computador',
    icon: '🖥️',
    titulo: 'Arquitectura del computador',
    desc: 'Modelo de Von Neumann, CPU con ALU y registros y el ciclo de instrucción animado paso a paso.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-hashing-colisiones',
    icon: '🗂️',
    titulo: 'Hashing y colisiones',
    desc: 'Tabla hash con tres funciones, resolución por encadenamiento y sondeo lineal, y factor de carga.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-cifrado-cesar',
    icon: '🔐',
    titulo: 'Cifrado César',
    desc: 'Rueda del alfabeto con slider de desplazamiento, histograma de frecuencias y ataque automático.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-tcp-handshake',
    icon: '🤝',
    titulo: 'Handshake TCP',
    desc: 'Diagrama de secuencia SYN, SYN-ACK y ACK y el cierre FIN, con números de secuencia configurables.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-ia-redes-neuronales',
    icon: '🧠',
    titulo: 'Redes neuronales',
    desc: 'Ajusta pesos, bias y entradas de un perceptrón con 4 funciones de activación; explora capas clicables y simula épocas viendo caer la curva de pérdida.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-computacion-cuantica',
    icon: '⚛️',
    titulo: 'Computación cuántica',
    desc: 'Esfera de Bloch con slider de superposición y medición que colapsa el qubit, paralelismo 2ⁿ, puertas cuánticas y línea temporal de la amenaza a RSA.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-ordenacion',
    icon: '🔀',
    titulo: 'Ordenación a medida',
    desc: 'Introduce tu propio array y compara hasta 4 de los 7 algoritmos a la vez, con presets (inverso, casi ordenado, duplicados), slider de velocidad y conteo de operaciones.',
    disciplina: 'computacion',
  },
  {
    slug: 'playground-sql',
    icon: '🗄️',
    titulo: 'Playground SQL',
    desc: 'Editor SQL que corre en el navegador con datasets de ejemplo, ejercicios guiados y resultados en vivo. Practica SELECT, JOIN y GROUP BY sin instalar nada.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-pathfinding',
    icon: '🎮',
    titulo: 'Pathfinding A*',
    desc: 'Simula cómo los enemigos de un videojuego encuentran el camino. Compara A*, Dijkstra y BFS paso a paso sobre una rejilla con muros, terreno costoso y diagonales.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-ruido-perlin',
    icon: '🏔️',
    titulo: 'Ruido Perlin',
    desc: 'Genera ruido de Perlin en tiempo real con octavas, persistencia y semilla, y pinta un mapa de biomas. La base de los terrenos y texturas procedimentales tipo Minecraft.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-espacios-color',
    icon: '🎨',
    titulo: 'Espacios de color',
    desc: 'Selector interactivo que muestra el mismo color en RGB, HSV, HSL y HEX a la vez. Elige tono y saturación/valor o ajusta los canales RGB y copia cualquier formato.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-boids',
    icon: '🐦',
    titulo: 'Boids (bandada)',
    desc: 'Simulación animada de bandada: cada agente sigue tres reglas (separación, alineación y cohesión) y de ellas emerge el movimiento colectivo. Ajusta los pesos y obsérvalo.',
    disciplina: 'computacion',
  },
  {
    slug: 'simulador-automatas-celulares',
    icon: '🦠',
    titulo: 'Autómatas celulares',
    desc: 'El Juego de la Vida de Conway y la generación de cuevas. Pinta células, carga patrones clásicos y observa cómo de reglas simples emerge un comportamiento complejo.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-convolucion-kernels',
    icon: '🖼️',
    titulo: 'Convolución y kernels',
    desc: 'Aplica kernels 3×3 a una imagen (desenfoque, enfoque, bordes, Sobel) y compara antes y después. La operación que está detrás de los filtros y de las redes neuronales.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-iluminacion-phong',
    icon: '💡',
    titulo: 'Iluminación (Phong)',
    desc: 'Ilumina una esfera en tiempo real con el modelo de Phong: ajusta las componentes ambiente, difusa y especular y mueve la luz. La base del render 3D y los shaders.',
    disciplina: 'computacion',
  },
  {
    slug: 'visualizador-quadtree',
    icon: '🗂️',
    titulo: 'Quadtree',
    desc: 'Añade puntos y observa cómo el espacio se subdivide en cuadrantes. Lanza una consulta de rango y compara el coste frente a la fuerza bruta. Acelera las colisiones.',
    disciplina: 'computacion',
  },
  // Física
  {
    slug: 'simulador-campo-electrico',
    icon: '⚡',
    titulo: 'Campo eléctrico',
    desc: 'Coloca cargas puntuales y observa las líneas de campo, las equipotenciales y la fuerza sobre una carga de prueba.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-pendulo',
    icon: '🕰️',
    titulo: 'Péndulo y MAS',
    desc: 'Péndulo simple y movimiento armónico: periodo, frecuencia, energía cinética y potencial, y el límite de ángulos pequeños.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-colisiones',
    icon: '💥',
    titulo: 'Colisiones',
    desc: 'Choques elásticos e inelásticos en 1D con sliders de masa, velocidad y coeficiente de restitución; momento y energía.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-ondas-interferencia',
    icon: '🌊',
    titulo: 'Ondas e interferencia',
    desc: 'Onda viajera, interferencia de dos fuentes y ondas estacionarias en cuerda y tubo, con sus modos armónicos.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-gas-ideal',
    icon: '🎈',
    titulo: 'Gas ideal',
    desc: 'PV = nRT con procesos isotermo, isobaro, isocoro y adiabático, y ciclos Carnot, Otto y Diesel en el diagrama PV.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-efecto-doppler',
    icon: '🚨',
    titulo: 'Efecto Doppler',
    desc: 'Ondas comprimidas y expandidas según la velocidad de la fuente: radar, ecografía, SONAR y el corrimiento al rojo cósmico.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-proyectiles',
    icon: '🎯',
    titulo: 'Proyectiles',
    desc: 'Movimiento parabólico 2D con alcance, altura máxima y tiempo de vuelo, gravedades planetarias y resistencia del aire.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-circuitos-electricos',
    icon: '🔌',
    titulo: 'Circuitos eléctricos',
    desc: 'Circuitos en serie y paralelo con la Ley de Ohm y la potencia, con hasta seis resistencias.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-conservacion-energia',
    icon: '⛰️',
    titulo: 'Conservación de la energía',
    desc: 'Pelota animada en cuatro pistas con barras dinámicas de energía cinética y potencial y fricción ajustable.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-lentes-opticas',
    icon: '🔍',
    titulo: 'Lentes ópticas',
    desc: 'Trazado de los tres rayos principales en lentes convergentes y divergentes, con imagen real o virtual.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-fluidos-bernoulli',
    icon: '🚰',
    titulo: 'Fluidos y Bernoulli',
    desc: 'Tubería Venturi con partículas animadas y manómetros que aplican la continuidad y la ecuación de Bernoulli.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-movimiento-circular',
    icon: '🌀',
    titulo: 'Movimiento circular',
    desc: 'MCU y MCNU con vectores de velocidad tangencial y aceleración centrípeta.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-mas-resorte',
    icon: '🪀',
    titulo: 'Masa y resorte',
    desc: 'Movimiento armónico simple con resorte animado, gráfica x(t), energías y amortiguamiento.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-vuelo-avion',
    icon: '✈️',
    titulo: 'Vuelo del avión',
    desc: 'Sustentación según el ángulo de ataque frente al mito de Bernoulli, con slider, pérdida y vuelo invertido.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-motor-electrico',
    icon: '🔋',
    titulo: 'Motor eléctrico',
    desc: 'Campo magnético rotante, inversor IGBT y regeneración, comparado con el motor de combustión.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-relatividad-general',
    icon: '🌌',
    titulo: 'Relatividad general',
    desc: 'Malla del espacio-tiempo deformada por la masa con slider, geodésicas, LIGO y GPS.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-superconductividad',
    icon: '🧲',
    titulo: 'Superconductividad',
    desc: 'Efecto Meissner animado, pares de Cooper y temperatura crítica ajustable.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-optica-ondulatoria',
    icon: '💡',
    titulo: 'Óptica ondulatoria',
    desc: 'Doble rendija de Young, difracción, polarización de Malus y coherencia láser.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-circuitos-electronicos',
    icon: '📟',
    titulo: 'Circuitos electrónicos',
    desc: 'Impedancia R/L/C, carga y descarga RC, transistor BJT y puertas lógicas.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-motor-combustion',
    icon: '🏎️',
    titulo: 'Motor de combustión',
    desc: 'Ciclo Otto en diagrama, slider de compresión, diagrama Sankey de energía y comparativa con el eléctrico.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-radioactividad',
    icon: '☢️',
    titulo: 'Radiactividad',
    desc: 'Desintegración α/β/γ, ley N(t)=N₀e^(−λt), datación por carbono-14 y dosis.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-optica',
    icon: '🔍',
    titulo: 'Óptica de la luz',
    desc: 'Diagramas SVG en vivo de reflexión, refracción con ley de Snell, lentes convergentes/divergentes y dispersión en prisma; ajustas ángulo, medio y distancia del objeto.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-maquinas-simples',
    icon: '⚙️',
    titulo: 'Máquinas simples',
    desc: 'Sliders de palanca y plano inclinado recalculan ventaja mecánica y fuerza sobre diagramas SVG; fulcro, ángulo y longitud se mueven en tiempo real.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-sonido-ondas',
    icon: '🔊',
    titulo: 'Sonido y ondas',
    desc: 'Sliders de frecuencia y amplitud redibujan la onda y suenan vía Web Audio; explora notas, decibelios y la mezcla de armónicos de cada instrumento.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-espectro-electromagnetico',
    icon: '🌈',
    titulo: 'Espectro electromagnético',
    desc: 'Barra logarítmica de 7 bandas clicables más calculadora que convierte longitud de onda en frecuencia y energía por fotón con c=λ·f.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-energia-nuclear',
    icon: '💥',
    titulo: 'Energía nuclear',
    desc: 'Slider del factor k marca reactor subcrítico/crítico/supercrítico; selector de reactores y barras comparativas conmutables entre CO₂ y factor de capacidad.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-relatividad-especial',
    icon: '🌌',
    titulo: 'Relatividad especial',
    desc: 'Sliders de velocidad recalculan factor gamma, dilatación temporal y contracción de longitud; selector de masa para E=mc² y paradoja de gemelos paso a paso.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-mecanica-cuantica',
    icon: '⚛️',
    titulo: 'Mecánica cuántica',
    desc: 'Observas el colapso de la doble rendija, ajustas certeza posición/momento de Heisenberg, abres la caja de Schrödinger y varías la barrera del efecto túnel.',
    disciplina: 'fisica',
  },
  {
    slug: 'visualizador-particulas-subatomicas',
    icon: '🧩',
    titulo: 'Partículas subatómicas',
    desc: 'Tabla clicable del Modelo Estándar con toggle de antipartículas y slider que liga la masa de cada partícula a su acoplamiento con el campo de Higgs.',
    disciplina: 'fisica',
  },
  {
    slug: 'simulador-termodinamica-carnot',
    icon: '♨️',
    titulo: 'Ciclo de Carnot',
    desc: 'El motor térmico ideal en un diagrama presión-volumen: dos isotermas y dos adiabáticas, con la eficiencia η = 1 − Tf/Tc y la 2.ª ley de la termodinámica.',
    disciplina: 'fisica',
  },
  // Matemáticas
  {
    slug: 'visualizador-calculo-visual',
    icon: '📈',
    titulo: 'Cálculo visual',
    desc: 'Límites, la tangente como derivada y el área bajo la curva como integral de Riemann, con tres funciones y sliders.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-derivada-pendiente',
    icon: '📐',
    titulo: 'La derivada como pendiente',
    desc: 'La derivada como pendiente de la tangente: 8 funciones, modo secante hacia el límite y la curva f′(x).',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-integral-area',
    icon: '∫',
    titulo: 'La integral como área',
    desc: 'Suma de Riemann con 4 métodos (izquierda, derecha, punto medio, trapecio) y el error frente al valor exacto.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-distribucion-normal',
    icon: '🔔',
    titulo: 'Distribución normal',
    desc: 'Curva de Gauss interactiva: ajusta μ y σ, calcula probabilidades, la regla 68-95-99,7 y la tipificación Z.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-transformada-fourier',
    icon: '〰️',
    titulo: 'Transformada de Fourier',
    desc: 'Síntesis de señales y su espectro, señales preconfiguradas y los epiciclos animados que las componen.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-monty-hall',
    icon: '🚪',
    titulo: 'Problema de Monty Hall',
    desc: 'Modo manual y simulación de 10.000 partidas para ver por qué cambiar de puerta gana 2/3 de las veces.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-teorema-central-limite',
    icon: '🎲',
    titulo: 'Teorema central del límite',
    desc: 'Simulación Monte Carlo con 5 distribuciones y tamaño muestral configurable comparado con la normal teórica.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-intervalos-confianza',
    icon: '📊',
    titulo: 'Intervalos de confianza',
    desc: '100 intervalos simulados y calculadora con nivel del 80-99 %, usando z o t de Student.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-test-hipotesis',
    icon: '🧪',
    titulo: 'Test de hipótesis',
    desc: 'Curvas H₀ y H₁ superpuestas con regiones de rechazo y los valores α, β, p-valor y potencia.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-teorema-bayes',
    icon: '🎯',
    titulo: 'Teorema de Bayes',
    desc: 'Rectángulo proporcional y árbol de probabilidad con el cálculo del valor predictivo positivo y negativo.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-funciones-transformaciones',
    icon: '🎛️',
    titulo: 'Transformaciones de funciones',
    desc: 'Manipula a, b, c y d en f(x)=a·g(b·(x−c))+d con un canvas dual de función base y transformada.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-volumenes',
    icon: '🧊',
    titulo: 'Volúmenes de cuerpos',
    desc: 'Esfera, cubo, cilindro, cono y pirámide en SVG isométrico con sliders y la fórmula en tiempo real.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-trigonometria',
    icon: '📡',
    titulo: 'Trigonometría',
    desc: 'Círculo unitario animado, gráficas con sliders, ángulos notables e identidades trigonométricas.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-geometria-analitica',
    icon: '🥚',
    titulo: 'Geometría analítica',
    desc: 'Cónicas (elipse, parábola, hipérbola y circunferencia) con sus ecuaciones canónicas y polares.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-algebra-lineal',
    icon: '➡️',
    titulo: 'Álgebra lineal',
    desc: 'Vectores 2D, transformaciones lineales, el determinante como área y los autovalores.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-ecuaciones-diferenciales',
    icon: '🦊',
    titulo: 'Ecuaciones diferenciales',
    desc: 'Campo de direcciones para Lotka-Volterra, el enfriamiento de Newton y el circuito RC.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-numeros-complejos',
    icon: '🌀',
    titulo: 'Números complejos',
    desc: 'Plano de Argand con operaciones geométricas, la forma polar y la identidad de Euler.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-topologia',
    icon: '🥯',
    titulo: 'Topología',
    desc: '5 superficies con selector de género, nudos topológicos y la característica de Euler.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-combinatoria',
    icon: '🔢',
    titulo: 'Combinatoria',
    desc: 'Permutaciones, triángulo de Pascal, binomio de Newton y el principio de multiplicación.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-series-convergencia',
    icon: '♾️',
    titulo: 'Series y convergencia',
    desc: 'Series de Taylor y Maclaurin, criterios de convergencia y aproximaciones de π.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-geometria-fractales',
    icon: '🔺',
    titulo: 'Geometría de fractales',
    desc: 'Sliders de iteración generan Sierpinski, Koch, alfombra y Hilbert en SVG, con sus conteos de elementos, perímetro y dimensión fractal.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-numeros-primos',
    icon: '🔢',
    titulo: 'Números primos',
    desc: 'Criba de Eratóstenes animada paso a paso o automática hasta 500, más espiral de Ulam, primos gemelos y reto de factorización RSA.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-estadistica-cotidiana',
    icon: '📊',
    titulo: 'Estadística cotidiana',
    desc: 'Slider de prevalencia para Bayes, paradoja de Simpson conmutable y lanzador de hasta 1.000 monedas con curva en vivo hacia el 50%.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-estadistica-inferencial',
    icon: '📉',
    titulo: 'Estadística inferencial',
    desc: 'Sliders mueven el estadístico z, α y el efecto sobre curvas normales, y simulan 100 intervalos de confianza para ver p-valor y potencia.',
    disciplina: 'matematicas',
  },
  {
    slug: 'simulador-trigonometria-circulo-unitario',
    icon: '📐',
    titulo: 'Círculo unitario',
    desc: 'Gira el ángulo θ con slider o animación sobre un canvas que proyecta seno, coseno y tangente, con valores y cuadrante en tiempo real.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-curvas-bezier',
    icon: '✏️',
    titulo: 'Curvas de Bézier',
    desc: 'Arrastra los puntos de control de una curva cuadrática o cúbica y anima el parámetro t para ver la construcción de De Casteljau paso a paso.',
    disciplina: 'matematicas',
  },
  {
    slug: 'visualizador-funciones-easing',
    icon: '📈',
    titulo: 'Funciones de easing',
    desc: 'Visualiza las curvas de interpolación (ease-in/out, back, elastic, bounce) y una caja que se mueve con cada una. La matemática de las animaciones.',
    disciplina: 'matematicas',
  },
  // Química
  {
    slug: 'simulador-equilibrio-quimico',
    icon: '⚗️',
    titulo: 'Equilibrio químico',
    desc: 'Principio de Le Chatelier en vivo: 6 reacciones reversibles, perturbaciones y la comparación de Q con Kc.',
    disciplina: 'quimica',
  },
  {
    slug: 'simulador-titulacion',
    icon: '🧫',
    titulo: 'Titulación ácido-base',
    desc: 'Bureta y matraz gota a gota con la curva de pH, cuatro tipos de valoración y cuatro indicadores.',
    disciplina: 'quimica',
  },
  {
    slug: 'simulador-disoluciones',
    icon: '🧪',
    titulo: 'Disoluciones (molaridad y dilución)',
    desc: 'Ajusta soluto y volumen y observa la molaridad, g/L, % m/v y ppm en vivo, con el color del vaso según la concentración. Incluye dilución C₁·V₁ = C₂·V₂.',
    disciplina: 'quimica',
  },
  {
    slug: 'simulador-vsepr',
    icon: '🔷',
    titulo: 'Geometría molecular (VSEPR)',
    desc: 'Geometría 3D rotable según VSEPR: átomo central con pares enlazantes y libres, e hibridación.',
    disciplina: 'quimica',
  },
  {
    slug: 'simulador-estequiometria',
    icon: '⚖️',
    titulo: 'Estequiometría',
    desc: 'Seis reacciones con reactivo limitante, barras de moles y rendimiento configurable.',
    disciplina: 'quimica',
  },
  {
    slug: 'ajustar-ecuaciones-quimicas',
    icon: '🧮',
    titulo: 'Ajustar ecuaciones químicas',
    desc: 'Escribe la reacción sin coeficientes y obtén los enteros mínimos comprobados átomo a átomo, los números de oxidación y la redox por ion-electrón en medio ácido y básico.',
    disciplina: 'quimica',
  },
  {
    slug: 'simulador-cinetica-arrhenius',
    icon: '💨',
    titulo: 'Cinética y Arrhenius',
    desc: 'Distribución de Maxwell-Boltzmann con energía de activación ajustable y la recta de Arrhenius.',
    disciplina: 'quimica',
  },
  {
    slug: 'simulador-tabla-periodica-tendencias',
    icon: '🗺️',
    titulo: 'Tabla periódica y tendencias',
    desc: 'Mapa de calor de los 118 elementos con cinco propiedades y flechas que marcan las tendencias.',
    disciplina: 'quimica',
  },
  {
    slug: 'visualizador-termodinamica-quimica',
    icon: '🔥',
    titulo: 'Termodinámica química',
    desc: 'Entalpía con catalizador ajustable, energía libre de Gibbs y constante de equilibrio.',
    disciplina: 'quimica',
  },
  {
    slug: 'visualizador-electroquimica',
    icon: '🔋',
    titulo: 'Electroquímica',
    desc: 'Pila Daniell animada, serie electroquímica, electrólisis y baterías de litio.',
    disciplina: 'quimica',
  },
  {
    slug: 'visualizador-carbono',
    icon: '⚛️',
    titulo: 'El carbono',
    desc: 'Alterna entre los 4 alótropos con sus estructuras SVG, explora el ciclo del carbono y grupos funcionales, y data objetos con un slider de desintegración de C-14.',
    disciplina: 'quimica',
  },
  {
    slug: 'visualizador-cinetica-quimica',
    icon: '⚗️',
    titulo: 'Cinética química',
    desc: 'Mueve Ea, ΔH y catalizador sobre el perfil de energía, ve k crecer en la curva de Arrhenius y compara curvas de concentración y vida media de los órdenes 0, 1 y 2.',
    disciplina: 'quimica',
  },
  // Biología
  {
    slug: 'simulador-lotka-volterra',
    icon: '🦊',
    titulo: 'Depredador-presa (Lotka-Volterra)',
    desc: 'Oscilaciones del modelo depredador-presa con diagrama de fases, integración RK4 y modo logístico.',
    disciplina: 'biologia',
  },
  {
    slug: 'simulador-ecosistema-trofico',
    icon: '🌿',
    titulo: 'Ecosistema trófico',
    desc: 'Cuatro ecosistemas con cascadas tróficas: introduce eventos y observa la pirámide alimentaria animada.',
    disciplina: 'biologia',
  },
  {
    slug: 'visualizador-modelos-epidemiologicos',
    icon: '🦠',
    titulo: 'Modelos epidemiológicos',
    desc: 'Simulador SIR/SEIR: ajusta Rₜ y compara la curva de cinco enfermedades resolviendo las ecuaciones por Euler.',
    disciplina: 'biologia',
  },
  {
    slug: 'simulador-deriva-genetica',
    icon: '🎲',
    titulo: 'Deriva genética',
    desc: 'Modelo de Wright-Fisher con deriva, selección, mutación y migración, y probabilidad de fijación.',
    disciplina: 'biologia',
  },
  {
    slug: 'simulador-punnett',
    icon: '🟩',
    titulo: 'Cuadro de Punnett',
    desc: 'Cruces mono y dihíbridos con celdas coloreadas y proporciones 3:1 y 9:3:3:1.',
    disciplina: 'biologia',
  },
  {
    slug: 'simulador-mitosis-meiosis',
    icon: '🔬',
    titulo: 'Mitosis y meiosis',
    desc: 'Fases de la mitosis y la meiosis en canvas 2D con crossing-over y reproducción automática.',
    disciplina: 'biologia',
  },
  {
    slug: 'simulador-fotosintesis-factores',
    icon: '🌱',
    titulo: 'Factores de la fotosíntesis',
    desc: 'Ley de Blackman con luz, CO₂ y temperatura ajustables y factor limitante en tiempo real.',
    disciplina: 'biologia',
  },
  {
    slug: 'visualizador-crispr-cas9',
    icon: '✂️',
    titulo: 'CRISPR-Cas9',
    desc: 'Mecanismo de edición en 6 pasos con slider, reparación NHEJ frente a HDR y bioética.',
    disciplina: 'biologia',
  },
  {
    slug: 'visualizador-epigenetica',
    icon: '🧪',
    titulo: 'Epigenética',
    desc: 'Nucleosoma con slider de metilación CpG, histonas clicables e imprinting genómico.',
    disciplina: 'biologia',
  },
  {
    slug: 'visualizador-embriogenesis',
    icon: '🥚',
    titulo: 'Embriogénesis',
    desc: 'Fecundación y segmentación con slider, gastrulación de tres capas y organogénesis.',
    disciplina: 'biologia',
  },
  {
    slug: 'visualizador-microbiologia',
    icon: '🧫',
    titulo: 'Microbiología',
    desc: 'Morfologías bacterianas clicables, curva de crecimiento logística y tinción de Gram.',
    disciplina: 'biologia',
  },
  {
    slug: 'visualizador-evolucion-humana',
    icon: '🦴',
    titulo: 'Evolución humana',
    desc: 'Línea del tiempo clicable de 8 homínidos, anatomía comparada con barra, mapa Out of Africa interactivo y slider de 70.000 años de hitos cognitivos.',
    disciplina: 'biologia',
  },
  {
    slug: 'visualizador-evolucion-molecular',
    icon: '🧬',
    titulo: 'Evolución molecular',
    desc: 'Muta una secuencia de ADN viendo si cambia el aminoácido, mueve el reloj molecular d=2μt y alinea especies para construir su árbol filogenético.',
    disciplina: 'biologia',
  },
  {
    slug: 'simulador-potencial-accion',
    icon: '⚡',
    titulo: 'Potencial de acción',
    desc: 'Ajusta intensidad, umbral y duración del estímulo y observa en vivo en el canvas si la neurona dispara y a qué frecuencia (ley del todo o nada).',
    disciplina: 'biologia',
  },
  // Tierra y Espacio
  {
    slug: 'visualizador-exoplanetas',
    icon: '🪐',
    titulo: 'Exoplanetas',
    desc: 'Tránsito animado con su curva de luz, el método del bamboleo, la zona habitable y más de 5.500 mundos reales.',
    disciplina: 'tierra-espacio',
  },
  {
    slug: 'visualizador-terremotos-tsunamis',
    icon: '🌋',
    titulo: 'Terremotos y tsunamis',
    desc: 'Fallas y ondas P/S, escalas Richter y Mercalli, y la propagación de tsunamis con el sistema de alerta DART.',
    disciplina: 'tierra-espacio',
  },
  {
    slug: 'visualizador-agujeros-negros',
    icon: '🕳️',
    titulo: 'Agujeros negros',
    desc: 'Anatomía clicable con el radio de Schwarzschild, la espaguetización y la radiación de Hawking.',
    disciplina: 'tierra-espacio',
  },
  {
    slug: 'visualizador-cosmologia',
    icon: '🌌',
    titulo: 'Cosmología',
    desc: 'Composición del universo, línea temporal del Big Bang, factor de escala a(t) y posibles destinos cósmicos.',
    disciplina: 'tierra-espacio',
  },
  {
    slug: 'visualizador-ciclo-carbono-completo',
    icon: '🌳',
    titulo: 'Ciclo del carbono',
    desc: 'Cinco reservorios y sus flujos con un control de emisiones y distintos escenarios de mitigación.',
    disciplina: 'tierra-espacio',
  },
  {
    slug: 'visualizador-el-nino',
    icon: '🌊',
    titulo: 'El Niño y La Niña',
    desc: 'Circulación de Walker, fases El Niño y La Niña, teleconexiones e índices SOI y ONI.',
    disciplina: 'tierra-espacio',
  },
  {
    slug: 'visualizador-vida-estrella',
    icon: '⭐',
    titulo: 'Vida de una estrella',
    desc: 'El slider de masa estelar recalcula vida, temperatura, color espectral y diagrama HR, y bifurca el destino entre enana blanca, neutrón o agujero negro.',
    disciplina: 'tierra-espacio',
  },
  {
    slug: 'visualizador-sistema-solar',
    icon: '🪐',
    titulo: 'Sistema solar',
    desc: 'Fichas de planetas desplegables, slider de escala que reduce el Sol a un balón y línea del tiempo de la luz desde Mercurio a Neptuno.',
    disciplina: 'tierra-espacio',
  },
  {
    slug: 'visualizador-ciclo-nitrogeno',
    icon: '🌱',
    titulo: 'Ciclo del nitrógeno',
    desc: 'Diagrama SVG clicable de fijación, nitrificación y desnitrificación, con slider de año 1900-2025 que cuantifica la fijación humana frente a la biológica.',
    disciplina: 'tierra-espacio',
  },
];

// Apps de una disciplina, en el orden del catálogo. Lo usa cada parrilla.
export function appsDeDisciplina(disciplina: string): StemumApp[] {
  return STEMUM_APPS.filter((a) => a.disciplina === disciplina);
}

// Slug → disciplina, derivado del catálogo: breadcrumb de MeskeiaLogo, banda
// DescubreVertical y llms.txt del portal.
export const STEMUM_APP_DISCIPLINA: Record<string, string> = Object.fromEntries(
  STEMUM_APPS.map((a) => [a.slug, a.disciplina]),
);

/**
 * MATERIAL DE APOYO — contenedor subordinado del portal.
 *
 * Piezas de CONSULTA (tablas, formularios y, en el futuro, glosarios) que
 * acompañan a los simuladores sin formar parte del catálogo: no se tocan ni se
 * ajustan, se consultan. Por eso viven fuera de STEMUM_APPS — no
 * cuentan como simuladores en el hero ni ensucian las páginas de disciplina,
 * que prometen manipulación en tiempo real.
 *
 * Criterio de admisión: buscador SIEMPRE, más al menos una capa que un PDF no
 * puede dar. Esa capa cambia según la disciplina — demostración en matemáticas,
 * ejemplo real o formulador en química, equivalencias y orden de magnitud en
 * física— así que no se exige "demostración" literalmente. Una lista plana sin
 * ninguna de esas capas se queda en meskeIA y no entra aquí.
 *
 * `disciplina` no sirve para clasificar la sección (es una lista única), solo
 * para el breadcrumb de MeskeiaLogo y el enlace al pie de cada disciplina.
 */
export type MaterialApoyo = {
  slug: string;
  icon: string;
  titulo: string;
  desc: string;
  disciplina: string;
};

export const STEMUM_MATERIAL_APOYO: MaterialApoyo[] = [
  {
    slug: 'tabla-derivadas',
    icon: '📐',
    titulo: 'Tabla de derivadas',
    desc: 'Todas las fórmulas con buscador, regla de la cadena y un ejemplo resuelto en cada una.',
    disciplina: 'matematicas',
  },
  {
    slug: 'tabla-integrales',
    icon: '∫',
    titulo: 'Tabla de integrales',
    desc: 'Integrales inmediatas y métodos de integración, con la constante siempre presente.',
    disciplina: 'matematicas',
  },
  {
    slug: 'tabla-valencias',
    icon: '⚗️',
    titulo: 'Tabla de valencias',
    desc: 'Números de oxidación de cada elemento, las tres nomenclaturas IUPAC y formulador de compuestos.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-areas-volumenes',
    icon: '📐',
    titulo: 'Tabla de áreas y volúmenes',
    desc: '48 figuras planas y cuerpos geométricos con su diagrama, las letras explicadas y un ejemplo numérico resuelto.',
    disciplina: 'matematicas',
  },
  {
    slug: 'tabla-limites-notables',
    icon: '♾️',
    titulo: 'Tabla de límites notables',
    desc: 'Límites notables, las 7 indeterminaciones y las equivalencias infinitesimales, con justificación y ejemplo.',
    disciplina: 'matematicas',
  },
  {
    slug: 'tabla-unidades-si',
    icon: '📏',
    titulo: 'Tabla de unidades del SI',
    desc: 'Las 7 básicas, las 22 derivadas descompuestas a unidades básicas, los 24 prefijos y las unidades aceptadas.',
    disciplina: 'fisica',
  },
  {
    slug: 'tabla-constantes-fisicas',
    icon: '🔬',
    titulo: 'Tabla de constantes físicas',
    desc: 'Constantes fundamentales con valores CODATA 2022, la fórmula donde aparecen y si son exactas o medidas.',
    disciplina: 'fisica',
  },
  {
    slug: 'tabla-solubilidad',
    icon: '🧪',
    titulo: 'Tabla de solubilidad',
    desc: 'Reglas y excepciones, iones poliatómicos, valores de Kps y un comprobador de precipitación catión×anión.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-grupos-funcionales',
    icon: '⚛️',
    titulo: 'Tabla de grupos funcionales',
    desc: 'Fórmula, sufijo y prefijo IUPAC, diagrama y orden de prioridad ordenable para saber cuál manda al nombrar.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-potenciales-redox',
    icon: '🔋',
    titulo: 'Tabla de potenciales redox',
    desc: '69 semirreacciones E°, serie de actividad de los metales y constructor de pilas que calcula E°pila, ΔG° y K.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-ka-kb',
    icon: '🧫',
    titulo: 'Tabla de Ka y Kb',
    desc: 'Constantes de acidez y basicidad a 25 °C, con calculadora de pH y de disolución reguladora.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-periodica',
    icon: '🧪',
    titulo: 'Tabla periódica',
    desc: 'Los 118 elementos con buscador por nombre, símbolo o número, filtros por familia y estado, y calculadora de masa molar a partir de la fórmula.',
    disciplina: 'quimica',
  },
];

// Slug → disciplina, para el breadcrumb del material de apoyo.
export const STEMUM_MATERIAL_DISCIPLINA: Record<string, string> =
  Object.fromEntries(STEMUM_MATERIAL_APOYO.map((m) => [m.slug, m.disciplina]));

// Material de apoyo de una disciplina (enlace al pie de su página).
export function materialDeDisciplina(disciplina: string): MaterialApoyo[] {
  return STEMUM_MATERIAL_APOYO.filter((m) => m.disciplina === disciplina);
}

// Slugs de apps servidas bajo stemum.com (passthrough en el proxy). Incluye el
// material de apoyo: se sirve bajo el dominio aunque no cuente como simulador.
export const STEMUM_APP_SLUGS = new Set([
  ...Object.keys(STEMUM_APP_DISCIPLINA),
  ...STEMUM_MATERIAL_APOYO.map((m) => m.slug),
]);

// Rutas de páginas del portal (home + disciplinas + material de apoyo) que el
// proxy reescribe a /stemum/*. La cadena vacía representa la home (stemum.com/).
export const STEMUM_MATERIAL_SLUG = 'material-apoyo';

export const STEMUM_PORTAL_SLUGS = new Set([
  '',
  ...Object.keys(STEMUM_DISCIPLINAS),
  STEMUM_MATERIAL_SLUG,
]);

// Conteos derivados automáticamente del catálogo (para los contadores de la
// home y del hero). Al añadir una app a STEMUM_APPS se actualizan solos.
export const STEMUM_APPS_POR_DISCIPLINA: Record<string, number> = Object.values(
  STEMUM_APP_DISCIPLINA,
).reduce<Record<string, number>>((acc, disciplina) => {
  acc[disciplina] = (acc[disciplina] ?? 0) + 1;
  return acc;
}, {});

// Total de apps publicadas en el portal.
export const STEMUM_TOTAL_APPS = Object.keys(STEMUM_APP_DISCIPLINA).length;
