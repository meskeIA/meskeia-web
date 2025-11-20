/**
 * Base de datos de aplicaciones meskeIA
 * Total: 84 aplicaciones organizadas por categorías
 */

export interface Application {
  name: string;
  category: string;
  icon: string;
  description: string;
  url: string;
  keywords: string[];
}

export const applicationsDatabase: Application[] = [
  // Finanzas y Fiscalidad (11)
  { name: "Simulador de Hipoteca", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula tu hipoteca con cuadro de amortización completo y análisis detallado", url: "/simulador-hipoteca/", keywords: ["prestamo", "casa", "vivienda", "banco", "interes", "amortizacion", "cuota", "euribor"] },
  { name: "Calculadora de Jubilación", category: "Finanzas y Fiscalidad", icon: "💰", description: "Planifica tu jubilación calculando ahorros necesarios y pensión estimada", url: "/calculadora-jubilacion/", keywords: ["pension", "retiro", "ahorro", "inversion", "planes", "seguridad social"] },
  { name: "Calculadora de Inversiones", category: "Finanzas y Fiscalidad", icon: "💰", description: "Simula el crecimiento de tus inversiones con interés compuesto", url: "/calculadora-inversiones/", keywords: ["bolsa", "acciones", "fondos", "rentabilidad", "capital", "dividendos"] },
  { name: "Interés Compuesto", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el interés compuesto de tus ahorros e inversiones a largo plazo", url: "/interes-compuesto/", keywords: ["ahorro", "capital", "rentabilidad", "interes", "compuesto"] },
  { name: "Control de Gastos Mensual", category: "Finanzas y Fiscalidad", icon: "💰", description: "Controla tus gastos e ingresos mensuales con gráficos y categorización automática", url: "/control-gastos-mensual/", keywords: ["presupuesto", "gastos", "ingresos", "finanzas personales", "ahorro"] },
  { name: "Simulador IRPF", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula tu IRPF y retenciones según la normativa fiscal española actual", url: "/simulador-irpf/", keywords: ["impuestos", "renta", "hacienda", "declaracion", "retenciones", "fiscal"] },
  { name: "Calculadora Impuesto de Donaciones - Cataluña", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el impuesto de donaciones según la normativa catalana", url: "/impuesto-donaciones/", keywords: ["donacion", "impuesto", "cataluna", "catalunya", "herencia", "fiscal"] },
  { name: "Calculadora Impuesto de Donaciones - Nacional", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el impuesto de donaciones para régimen común (14 comunidades autónomas)", url: "/impuesto-donaciones-nacional/", keywords: ["donacion", "impuesto", "comunidad autonoma", "regimen comun", "nacional", "fiscal"] },
  { name: "Calculadora Impuesto de Sucesiones - Cataluña", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el impuesto de sucesiones con la normativa catalana", url: "/impuesto-sucesiones/", keywords: ["herencia", "testamento", "sucesion", "impuesto", "cataluna", "catalunya", "fiscal"] },
  { name: "Calculadora Impuesto de Sucesiones - Nacional", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el impuesto de sucesiones para régimen común (todas las CCAA excepto Cataluña, País Vasco y Navarra)", url: "/impuesto-sucesiones-nacional/", keywords: ["herencia", "testamento", "sucesion", "impuesto", "regimen comun", "nacional", "fiscal"] },
  { name: "Calculadora TIR-VAN", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula TIR y VAN para análisis de inversiones y proyectos", url: "/tir-van/", keywords: ["tir", "van", "inversion", "proyecto", "rentabilidad", "flujo caja"] },

  // Calculadoras y Utilidades (7)
  { name: "Calculadora de Porcentajes Avanzada", category: "Calculadoras y Utilidades", icon: "🧮", description: "Calculadora avanzada de porcentajes con visualizaciones: descuentos, IVA, propinas y cambios porcentuales", url: "/calculadora-porcentajes/", keywords: ["porcentaje", "descuento", "iva", "propina", "rebaja", "aumento"] },
  { name: "Calculadora de Regla de Tres", category: "Calculadoras y Utilidades", icon: "🧮", description: "Calculadora completa de regla de tres simple y compuesta con ejemplos prácticos españoles", url: "/regla-de-tres/", keywords: ["proporcion", "regla", "tres", "directa", "inversa", "matematicas"] },
  { name: "Calculadora de Fechas", category: "Calculadoras y Utilidades", icon: "🧮", description: "Calcula días entre fechas, suma o resta días a cualquier fecha", url: "/calculadora-fechas/", keywords: ["fecha", "dias", "calendario", "diferencia", "tiempo"] },
  { name: "Conversor de Tallas Internacional", category: "Calculadoras y Utilidades", icon: "🧮", description: "Convierte tallas de ropa y calzado entre sistemas EU, UK, US", url: "/conversor-tallas/", keywords: ["talla", "ropa", "zapatos", "conversion", "medida"] },
  { name: "Calculadora de Cocina", category: "Calculadoras y Utilidades", icon: "🍳", description: "Conversor de unidades de cocina, escalador de recetas, tiempos de cocción y sustitutos de ingredientes", url: "/calculadora-cocina/", keywords: ["cocina", "recetas", "conversor", "tazas", "gramos", "temperatura", "horno", "tiempo", "coccion", "ingredientes", "sustitutos"] },
  { name: "Lista de Compras Inteligente", category: "Calculadoras y Utilidades", icon: "🛒", description: "Lista de compras con organización automática por categorías del supermercado, guardado local y exportación", url: "/lista-compras/", keywords: ["lista", "compras", "supermercado", "shopping", "productos", "mercado", "groceries", "organizar", "categorias", "offline"] },
  { name: "Conversor de Divisas", category: "Calculadoras y Utilidades", icon: "💱", description: "Conversor de divisas con tipos de cambio actualizados del Banco Central Europeo. 33 monedas internacionales", url: "/conversor-divisas/", keywords: ["conversor", "divisas", "cambio", "euro", "dolar", "libra", "moneda", "tipos", "forex", "BCE", "USD", "GBP", "JPY", "conversion", "monedas"] },

  // Matemáticas y Estadística (10)
  { name: "Calculadora de Probabilidad", category: "Matemáticas y Estadística", icon: "📐", description: "Calculadora completa de probabilidades con teoría y simulaciones", url: "/probabilidad/", keywords: ["probabilidad", "estadistica", "azar", "combinatoria", "permutaciones"] },
  { name: "Calculadora Estadística", category: "Matemáticas y Estadística", icon: "📐", description: "Calcula media, mediana, desviación estándar y análisis estadístico completo", url: "/calculadora-estadistica/", keywords: ["estadistica", "media", "mediana", "desviacion", "datos"] },
  { name: "Calculadora Matemática Avanzada", category: "Matemáticas y Estadística", icon: "📐", description: "Resuelve ecuaciones, matrices, derivadas e integrales online", url: "/calculadora-matematica/", keywords: ["matematicas", "ecuaciones", "matrices", "calcular", "resolver"] },
  { name: "Álgebra", category: "Matemáticas y Estadística", icon: "📐", description: "Resuelve ecuaciones lineales, cuadráticas y sistemas de ecuaciones", url: "/algebra/", keywords: ["ecuaciones", "sistemas", "lineal", "cuadratica", "algebra"] },
  { name: "Geometría", category: "Matemáticas y Estadística", icon: "📐", description: "Calcula áreas, perímetros y volúmenes de figuras geométricas", url: "/geometria/", keywords: ["area", "perimetro", "volumen", "figuras", "geometria", "triangulo", "circulo"] },
  { name: "Cálculo Diferencial e Integral", category: "Matemáticas y Estadística", icon: "📐", description: "Deriva e integra funciones, límites y análisis matemático", url: "/calculo/", keywords: ["derivadas", "integrales", "limites", "calculo", "funciones"] },
  { name: "Trigonometría", category: "Matemáticas y Estadística", icon: "📐", description: "Funciones trigonométricas, identidades y triángulos", url: "/trigonometria/", keywords: ["seno", "coseno", "tangente", "trigonometria", "angulos"] },
  { name: "Teoría de Números", category: "Matemáticas y Estadística", icon: "📐", description: "Números primos, factorización y teoría de números", url: "/teoria-numeros/", keywords: ["primos", "factorizacion", "divisores", "numeros"] },
  { name: "Álgebra Abstracta", category: "Matemáticas y Estadística", icon: "📐", description: "Grupos, anillos, campos y estructuras algebraicas", url: "/algebra-abstracta/", keywords: ["grupos", "anillos", "campos", "abstracta"] },
  { name: "Investigación Operativa", category: "Matemáticas y Estadística", icon: "📐", description: "Optimización, programación lineal y análisis de operaciones", url: "/investigacion-operativa/", keywords: ["optimizacion", "programacion lineal", "simplex", "investigacion"] },

  // Física y Química (6)
  { name: "Calculadora de Movimiento (Cinemática)", category: "Física y Química", icon: "🧪", description: "Calculadora interactiva de cinemática con gráficos y animaciones para MRU, MRUA, caída libre y tiro parabólico", url: "/calculadora-movimiento/", keywords: ["fisica", "cinematica", "movimiento", "velocidad", "aceleracion", "mru", "mrua"] },
  { name: "Tabla Periódica Interactiva", category: "Física y Química", icon: "⚛️", description: "Tabla periódica interactiva con información detallada de todos los elementos químicos", url: "/tabla-periodica/", keywords: ["quimica", "elementos", "atomos", "tabla periodica", "propiedades"] },
  { name: "Constructor de Fórmulas Químicas", category: "Física y Química", icon: "🧪", description: "Constructor interactivo de fórmulas químicas con validación de valencias y balanceamiento automático", url: "/formulas-quimicas/", keywords: ["quimica", "formulas", "compuestos", "valencias", "reacciones"] },
  { name: "Glosario de Física y Química", category: "Física y Química", icon: "🧪", description: "Glosario interactivo de física y química con quizzes educativos y sistema de gamificación", url: "/glosario-fisica-quimica/", keywords: ["glosario", "definiciones", "terminos", "fisica", "quimica"] },
  { name: "Calculadora de Electricidad", category: "Física y Química", icon: "⚡", description: "Calculadora completa de electricidad: Ley de Ohm, potencia, resistencias y análisis de circuitos eléctricos", url: "/calculadora-electricidad/", keywords: ["electricidad", "ohm", "resistencia", "voltaje", "corriente", "circuito"] },
  { name: "Conversor de Unidades Científico", category: "Física y Química", icon: "🧪", description: "Conversor científico avanzado: 13 categorías incluyendo química, presión, energía, fuerza y potencia", url: "/conversor-unidades/", keywords: ["conversion", "unidades", "medidas", "fisica", "quimica"] },

  // ... (Continúa con las demás categorías)

  // NOTA: Este archivo está parcialmente generado
  // Las demás categorías se añadirán en la siguiente versión
];

export const categories = [
  {
    id: 'finanzas',
    name: 'Finanzas y Fiscalidad',
    icon: '💰',
    description: 'Planifica tu economía personal y calcula impuestos españoles'
  },
  {
    id: 'calculadoras',
    name: 'Calculadoras y Utilidades',
    icon: '🧮',
    description: 'Herramientas prácticas para el día a día'
  },
  {
    id: 'matematicas',
    name: 'Matemáticas y Estadística',
    icon: '📐',
    description: 'Resuelve problemas matemáticos avanzados'
  },
  {
    id: 'fisica-quimica',
    name: 'Física y Química',
    icon: '🧪',
    description: 'Aprende y calcula conceptos científicos'
  },
  {
    id: 'productividad',
    name: 'Herramientas de Productividad',
    icon: '⚡',
    description: 'Optimiza tu tiempo y organización'
  },
  {
    id: 'juegos',
    name: 'Juegos y Entretenimiento',
    icon: '🎮',
    description: 'Diviértete mientras aprendes'
  },
  {
    id: 'campus',
    name: 'Campus Digital',
    icon: '📚',
    description: 'Recursos educativos y cursos gratuitos'
  },
  {
    id: 'salud',
    name: 'Salud & Bienestar',
    icon: '🏥',
    description: 'Cuida tu salud con herramientas especializadas'
  },
  {
    id: 'web',
    name: 'Herramientas Web y Tecnología',
    icon: '💻',
    description: 'Utilidades para desarrolladores'
  },
  {
    id: 'texto',
    name: 'Texto y Documentos',
    icon: '📝',
    description: 'Procesa y formatea texto eficientemente'
  },
  {
    id: 'diseno',
    name: 'Creatividad y Diseño',
    icon: '🎨',
    description: 'Herramientas para diseñadores web'
  },
  {
    id: 'emprendimiento',
    name: 'Emprendimiento y Negocios',
    icon: '💼',
    description: 'Gestiona tu negocio como un profesional'
  },
  {
    id: 'radio',
    name: 'Radio meskeIA',
    icon: '📻',
    description: 'Miles de emisoras de radio en vivo'
  }
];
