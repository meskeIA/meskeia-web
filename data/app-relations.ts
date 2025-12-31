/**
 * Mapeo de relaciones entre apps meskeIA
 *
 * Define qué apps están relacionadas entre sí para mostrar sugerencias
 * al final de cada página. Máximo 4 apps por relación.
 *
 * Estructura: { [appSlug]: RelatedApp[] }
 */

import { RelatedApp } from '@/components/RelatedApps';

/**
 * Base de datos de apps relacionadas
 *
 * Organizado por familias temáticas:
 * - Estudiantes: notas, flashcards, horarios, pomodoro
 * - Herencias/Fiscal: sucesiones, donaciones, guías
 * - Finanzas: hipotecas, préstamos, inversiones
 * - Salud: IMC, calorías, hidratación, menú
 * - Mascotas: planificador, alimentación, medicamentos, edad
 * - SEO/Contenido: títulos, meta, densidad, legibilidad
 * - Texto: contador, conversor, limpiador, comparador
 * - Criptografía: cifrados clásicos y modernos
 * - Diseño: colores, gradientes, paletas, contraste
 * - Freelance: tarifa, gastos, facturas, break-even
 */

// ==========================================
// FAMILIA: ESTUDIANTES
// ==========================================
const estudiantesApps: RelatedApp[] = [
  { url: '/calculadora-notas/', icon: '📊', name: 'Calculadora de Notas', description: 'Calcula tu nota media ponderada' },
  { url: '/creador-flashcards/', icon: '🎴', name: 'Creador de Flashcards', description: 'Crea tarjetas de memoria' },
  { url: '/generador-horarios-estudio/', icon: '📅', name: 'Horarios de Estudio', description: 'Planifica tus sesiones' },
  { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Técnica de productividad' },
];

// ==========================================
// FAMILIA: HERENCIAS Y FISCAL
// ==========================================
const herenciasApps: RelatedApp[] = [
  { url: '/calculadora-herencias/', icon: '⚖️', name: 'Calculadora Herencias', description: 'Reparto según derecho civil' },
  { url: '/calculadora-sucesiones-cataluna/', icon: '🏛️', name: 'Sucesiones Cataluña', description: 'Impuesto de sucesiones' },
  { url: '/calculadora-sucesiones-nacional/', icon: '🇪🇸', name: 'Sucesiones Nacional', description: 'Normativa estatal' },
  { url: '/guia-tramitacion-herencias/', icon: '📋', name: 'Guía Herencias', description: 'Pasos a seguir' },
  { url: '/herencias-paso-a-paso/', icon: '📚', name: 'Curso Herencias', description: '9 capítulos completos' },
];

const donacionesApps: RelatedApp[] = [
  { url: '/calculadora-donaciones-cataluna/', icon: '🎁', name: 'Donaciones Cataluña', description: 'Impuesto donaciones' },
  { url: '/calculadora-donaciones-nacional/', icon: '🇪🇸', name: 'Donaciones Nacional', description: 'Normativa estatal' },
  { url: '/calculadora-sucesiones-cataluna/', icon: '🏛️', name: 'Sucesiones Cataluña', description: 'Herencias en Cataluña' },
  { url: '/calculadora-sucesiones-nacional/', icon: '🇪🇸', name: 'Sucesiones Nacional', description: 'Herencias estatal' },
];

// ==========================================
// FAMILIA: FINANZAS PERSONALES
// ==========================================
const finanzasInversionApps: RelatedApp[] = [
  { url: '/interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Crecimiento de inversiones' },
  { url: '/calculadora-inversiones/', icon: '💹', name: 'Calculadora Inversiones', description: 'Rentabilidad y riesgo' },
  { url: '/test-perfil-inversor/', icon: '🎯', name: 'Perfil Inversor', description: 'Descubre tu perfil' },
  { url: '/simulador-cartera-inversion/', icon: '📊', name: 'Simulador Cartera', description: 'Monte Carlo y Sharpe' },
  { url: '/calculadora-tir-van/', icon: '📉', name: 'TIR y VAN', description: 'Análisis de proyectos' },
];

const finanzasHipotecaApps: RelatedApp[] = [
  { url: '/simulador-hipoteca/', icon: '🏠', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
  { url: '/amortizacion-hipoteca/', icon: '💰', name: 'Amortización Anticipada', description: 'Reducir cuota vs plazo' },
  { url: '/simulador-prestamos/', icon: '🏦', name: 'Simulador Préstamos', description: 'Compara sistemas' },
  { url: '/calculadora-alquiler-vs-compra/', icon: '🔑', name: 'Alquiler vs Compra', description: 'Análisis financiero' },
  { url: '/simulador-compraventa-inmueble/', icon: '📋', name: 'Gastos Compraventa', description: 'ITP, notaría, plusvalía' },
];

const finanzasPersonalesApps: RelatedApp[] = [
  { url: '/control-gastos/', icon: '💳', name: 'Control de Gastos', description: 'Gestiona tu presupuesto' },
  { url: '/calculadora-suscripciones/', icon: '📱', name: 'Control Suscripciones', description: 'Gastos recurrentes' },
  { url: '/calculadora-roommates/', icon: '🏘️', name: 'Gastos Compartidos', description: 'División justa' },
  { url: '/calculadora-jubilacion/', icon: '👴', name: 'Calculadora Jubilación', description: 'Planifica tu retiro' },
  { url: '/calculadora-fondo-emergencia/', icon: '🛡️', name: 'Fondo de Emergencia', description: 'Cuánto ahorrar' },
  { url: '/calculadora-regla-50-30-20/', icon: '📊', name: 'Regla 50/30/20', description: 'Distribuye tu presupuesto' },
  { url: '/calculadora-fire/', icon: '🔥', name: 'Calculadora FIRE', description: 'Independencia financiera' },
  { url: '/calculadora-coste-plazos/', icon: '💳', name: 'Coste Real a Plazos', description: 'TAE e intereses ocultos' },
  { url: '/calculadora-deuda/', icon: '🎯', name: 'Calculadora de Deuda', description: 'Bola de nieve vs avalancha' },
];

const fiscalApps: RelatedApp[] = [
  { url: '/simulador-irpf/', icon: '📋', name: 'Simulador IRPF', description: 'Calcula tu declaración' },
  { url: '/calculadora-plusvalias-irpf/', icon: '📈', name: 'Plusvalías IRPF', description: 'Ganancias patrimoniales' },
  { url: '/calculadora-iva/', icon: '🧾', name: 'Calculadora IVA', description: 'Añadir o quitar IVA' },
  { url: '/simulador-gastos-deducibles/', icon: '✅', name: 'Gastos Deducibles', description: 'Para autónomos' },
];

// ==========================================
// FAMILIA: SALUD Y BIENESTAR
// ==========================================
const saludApps: RelatedApp[] = [
  { url: '/calculadora-imc/', icon: '⚖️', name: 'Calculadora IMC', description: 'Índice de masa corporal' },
  { url: '/calculadora-colesterol/', icon: '🩺', name: 'Calculadora Colesterol', description: 'Ratios y riesgo cardiovascular' },
  { url: '/calculadora-calorias-ejercicio/', icon: '🔥', name: 'Calorías Diarias', description: 'Necesidades calóricas' },
  { url: '/calculadora-macros/', icon: '🥗', name: 'Calculadora Macros', description: 'Proteínas, carbos, grasas' },
  { url: '/calculadora-hidratacion/', icon: '💧', name: 'Hidratación', description: 'Agua recomendada' },
  { url: '/planificador-menu/', icon: '🍽️', name: 'Planificador Menú', description: 'Dieta mediterránea' },
  { url: '/vitaminas-minerales/', icon: '🥗', name: 'Vitaminas y Minerales', description: '30 nutrientes esenciales' },
];

const saludHabitosApps: RelatedApp[] = [
  { url: '/seguimiento-habitos/', icon: '✅', name: 'Seguimiento Hábitos', description: 'Construye rutinas' },
  { url: '/test-habitos/', icon: '📋', name: 'Test de Hábitos', description: 'Evalúa tus hábitos' },
  { url: '/calculadora-sueno/', icon: '😴', name: 'Calculadora Sueño', description: 'Ciclos de sueño' },
  { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Productividad' },
];

// ==========================================
// FAMILIA: MASCOTAS
// ==========================================
const mascotasApps: RelatedApp[] = [
  { url: '/planificador-mascota/', icon: '📋', name: 'Planificador Mascota', description: 'Checklist completo' },
  { url: '/calculadora-alimentacion-mascotas/', icon: '🍖', name: 'Alimentación Mascotas', description: 'Raciones diarias' },
  { url: '/calculadora-medicamentos-mascotas/', icon: '💊', name: 'Medicamentos Mascotas', description: 'Dosis antiparasitarios' },
  { url: '/calculadora-edad-mascotas/', icon: '🎂', name: 'Edad Mascotas', description: 'Años humanos' },
];

const mascotasExtraApps: RelatedApp[] = [
  { url: '/calculadora-tamano-adulto-perro/', icon: '📏', name: 'Tamaño Adulto Perro', description: 'Predicción de peso' },
  { url: '/guia-cuidado-mascota/', icon: '📚', name: 'Guía Cuidado Mascota', description: 'Curso completo' },
];

// ==========================================
// FAMILIA: SEO Y CONTENIDO
// ==========================================
const seoApps: RelatedApp[] = [
  { url: '/analizador-titulos-seo/', icon: '🎯', name: 'Analizador Títulos', description: 'Optimiza tus títulos' },
  { url: '/generador-meta-descripciones/', icon: '📝', name: 'Meta Descripciones', description: 'Para Google' },
  { url: '/analizador-densidad-seo/', icon: '📊', name: 'Densidad SEO', description: 'Palabras clave' },
  { url: '/calculadora-legibilidad/', icon: '📖', name: 'Legibilidad', description: 'Índice Flesch' },
];

const seoExtraApps: RelatedApp[] = [
  { url: '/calculadora-tiempo-lectura/', icon: '⏱️', name: 'Tiempo de Lectura', description: 'Minutos estimados' },
  { url: '/generador-palabras-clave/', icon: '🔑', name: 'Palabras Clave', description: 'Ideas de keywords' },
  { url: '/generador-schema-markup/', icon: '🏷️', name: 'Schema Markup', description: 'Datos estructurados' },
  { url: '/analizador-geo/', icon: '🤖', name: 'Analizador GEO', description: 'Optimización para IAs' },
];

// ==========================================
// FAMILIA: TEXTO Y DOCUMENTOS
// ==========================================
const textoApps: RelatedApp[] = [
  { url: '/contador-palabras/', icon: '🔢', name: 'Contador Palabras', description: 'Palabras y caracteres' },
  { url: '/conversor-texto/', icon: '🔄', name: 'Conversor Texto', description: 'Mayúsculas y más' },
  { url: '/limpiador-texto/', icon: '🧹', name: 'Limpiador Texto', description: 'Elimina formato' },
  { url: '/comparador-textos/', icon: '🔍', name: 'Comparador Textos', description: 'Diferencias entre textos' },
];

const textoExtraApps: RelatedApp[] = [
  { url: '/contador-silabas/', icon: '📐', name: 'Contador Sílabas', description: 'Separa y cuenta' },
  { url: '/conversor-markdown-html/', icon: '📄', name: 'Markdown a HTML', description: 'Convierte formatos' },
  { url: '/generador-lorem-ipsum/', icon: '📝', name: 'Lorem Ipsum', description: 'Texto de prueba' },
  { url: '/generador-anagramas/', icon: '🔀', name: 'Generador Anagramas', description: 'Reordena letras' },
];

// ==========================================
// FAMILIA: CONVERSIÓN DE DATOS
// ==========================================
const conversionDatosApps: RelatedApp[] = [
  { url: '/conversor-formatos/', icon: '🔄', name: 'Conversor Formatos', description: 'JSON, CSV, Excel, XML' },
  { url: '/codificador-base64/', icon: '🔐', name: 'Base64', description: 'Codifica/decodifica' },
  { url: '/conversor-markdown-html/', icon: '📄', name: 'Markdown a HTML', description: 'Convierte formatos' },
  { url: '/generador-json/', icon: '📋', name: 'Generador JSON', description: 'Crea estructuras JSON' },
];

// ==========================================
// FAMILIA: CRIPTOGRAFÍA
// ==========================================
const criptografiaClasicaApps: RelatedApp[] = [
  { url: '/cifrado-clasico/', icon: '🔐', name: 'Cifrado Clásico', description: 'César, ROT13, Atbash' },
  { url: '/cifrado-vigenere/', icon: '🔑', name: 'Cifrado Vigenère', description: 'Polialfabético' },
  { url: '/cifrado-transposicion/', icon: '🔀', name: 'Transposición', description: 'Columnas y Rail Fence' },
  { url: '/cifrado-playfair/', icon: '🧩', name: 'Cifrado Playfair', description: 'Matriz 5x5' },
];

const criptografiaModernaApps: RelatedApp[] = [
  { url: '/cifrado-aes/', icon: '🛡️', name: 'Cifrado AES', description: 'AES-256 moderno' },
  { url: '/generador-hashes/', icon: '#️⃣', name: 'Generador Hashes', description: 'MD5, SHA-256, SHA-512' },
  { url: '/codificador-base64/', icon: '📦', name: 'Base64', description: 'Codificación de datos' },
  { url: '/generador-contrasenas/', icon: '🔒', name: 'Generador Contraseñas', description: 'Contraseñas seguras' },
];

// ==========================================
// FAMILIA: DISEÑO Y COLORES
// ==========================================
const disenoColoresApps: RelatedApp[] = [
  { url: '/conversor-colores/', icon: '🎨', name: 'Conversor Colores', description: 'HEX, RGB, HSL' },
  { url: '/creador-paletas/', icon: '🌈', name: 'Creador Paletas', description: 'Paletas armónicas' },
  { url: '/generador-gradientes/', icon: '🌅', name: 'Generador Gradientes', description: 'CSS gradients' },
  { url: '/contraste-colores/', icon: '👁️', name: 'Contraste Colores', description: 'Accesibilidad WCAG' },
];

const disenoExtraApps: RelatedApp[] = [
  { url: '/generador-sombras/', icon: '🌑', name: 'Generador Sombras', description: 'CSS box-shadow' },
  { url: '/generador-tipografias/', icon: '🔤', name: 'Tipografías', description: 'Combina fuentes' },
  { url: '/calculadora-aspectos/', icon: '📐', name: 'Ratio de Aspecto', description: 'Proporciones' },
  { url: '/creador-thumbnails/', icon: '🖼️', name: 'Creador Thumbnails', description: 'Miniaturas YouTube' },
];

// ==========================================
// FAMILIA: FREELANCE Y NEGOCIOS
// ==========================================
const freelanceApps: RelatedApp[] = [
  { url: '/calculadora-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Calcula tu hora' },
  { url: '/simulador-gastos-deducibles/', icon: '✅', name: 'Gastos Deducibles', description: 'Para autónomos' },
  { url: '/calculadora-presupuestos/', icon: '📋', name: 'Presupuestos', description: 'Propuestas a clientes' },
  { url: '/generador-facturas/', icon: '🧾', name: 'Generador Facturas', description: 'Facturas con IVA/IRPF' },
];

const emprendimientoApps: RelatedApp[] = [
  { url: '/asistente-constitucion-sociedad/', icon: '🏢', name: 'Constituir Sociedad', description: 'SL, SLU o SA paso a paso' },
  { url: '/asistente-alta-autonomo/', icon: '💼', name: 'Alta Autónomo', description: 'Darse de alta paso a paso' },
  { url: '/asistente-constitucion-asociacion/', icon: '🤝', name: 'Constituir Asociación', description: 'ASL sin ánimo de lucro' },
  { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Fechas y modelos tributarios' },
  { url: '/comparador-formas-juridicas/', icon: '⚖️', name: 'Formas Jurídicas', description: 'Autónomo vs SL vs Cooperativa' },
  { url: '/simulador-autonomo-vs-sl/', icon: '📊', name: 'Autónomo vs SL', description: 'Comparativa fiscal completa' },
  { url: '/calculadora-cuota-autonomo/', icon: '💼', name: 'Cuota Autónomo', description: 'Tramos cotización 2025' },
  { url: '/generador-nombres-empresa/', icon: '✨', name: 'Nombres Empresa', description: 'Ideas de nombres' },
  { url: '/generador-facturas/', icon: '🧾', name: 'Generador Facturas', description: 'Facturas profesionales' },
  { url: '/calculadora-presupuestos/', icon: '📋', name: 'Presupuestos', description: 'Propuestas a clientes' },
];

const negociosApps: RelatedApp[] = [
  { url: '/calculadora-roi-marketing/', icon: '📊', name: 'ROI Marketing', description: 'Retorno inversión' },
  { url: '/planificador-cashflow/', icon: '💰', name: 'Cashflow', description: 'Flujo de caja' },
  { url: '/generador-nombres-empresa/', icon: '✨', name: 'Nombres Empresa', description: 'Ideas de nombres' },
  { url: '/generador-carruseles/', icon: '📱', name: 'Carruseles', description: 'Instagram/LinkedIn' },
];

// ==========================================
// FAMILIA: MATEMÁTICAS
// ==========================================
const matematicasBasicasApps: RelatedApp[] = [
  { url: '/calculadora-matematica/', icon: '🔢', name: 'Calculadora Matemática', description: 'Operaciones básicas' },
  { url: '/calculadora-porcentajes/', icon: '📊', name: 'Porcentajes', description: 'Cálculos de %' },
  { url: '/calculadora-regla-de-tres/', icon: '⚖️', name: 'Regla de Tres', description: 'Proporciones' },
  { url: '/calculadora-mcd-mcm/', icon: '🔗', name: 'MCD y MCM', description: 'Divisores y múltiplos' },
];

const matematicasAvanzadasApps: RelatedApp[] = [
  { url: '/algebra-ecuaciones/', icon: '📐', name: 'Ecuaciones', description: 'Resolver ecuaciones' },
  { url: '/calculadora-geometria/', icon: '📏', name: 'Geometría', description: 'Áreas y volúmenes' },
  { url: '/calculadora-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Seno, coseno, tangente' },
  { url: '/calculadora-calculo/', icon: '∫', name: 'Cálculo', description: 'Derivadas e integrales' },
];

const estadisticaApps: RelatedApp[] = [
  { url: '/calculadora-estadistica/', icon: '📈', name: 'Estadística', description: 'Media, mediana, moda' },
  { url: '/estadistica-avanzada/', icon: '📊', name: 'Estadística Avanzada', description: 'Tests, regresión, correlación' },
  { url: '/calculadora-probabilidad/', icon: '🎲', name: 'Probabilidad', description: 'Cálculos de probabilidad' },
  { url: '/calculadora-distribuciones/', icon: '📊', name: 'Distribuciones', description: 'Normal, Poisson, Exponencial' },
  { url: '/inferencia-bayesiana/', icon: '🧠', name: 'Inferencia Bayesiana', description: 'Teorema de Bayes' },
  { url: '/calculadora-teoria-colas/', icon: '👥', name: 'Teoría de Colas', description: 'Sistemas de espera' },
];

// ==========================================
// FAMILIA: PRODUCTIVIDAD
// ==========================================
const productividadApps: RelatedApp[] = [
  { url: '/lista-tareas/', icon: '✅', name: 'Lista de Tareas', description: 'Organiza tu día' },
  { url: '/matriz-eisenhower/', icon: '📊', name: 'Matriz Eisenhower', description: 'Prioriza urgente/importante' },
  { url: '/notas/', icon: '📝', name: 'Notas', description: 'Toma notas rápidas' },
  { url: '/time-tracker/', icon: '⏱️', name: 'Time Tracker', description: 'Registra tu tiempo' },
  { url: '/calculadora-productividad/', icon: '📊', name: 'Productividad', description: 'Ingresos por hora real' },
  { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Técnica 25/5' },
  { url: '/planificador-turnos/', icon: '📅', name: 'Planificador Turnos', description: 'Organiza horarios' },
];

const viajesApps: RelatedApp[] = [
  { url: '/lista-equipaje/', icon: '🧳', name: 'Lista Equipaje', description: 'Checklist de viaje' },
  { url: '/conversor-horarios/', icon: '🌍', name: 'Conversor Horarios', description: 'Zonas horarias' },
  { url: '/calculadora-combustible/', icon: '⛽', name: 'Combustible', description: 'Coste del viaje' },
  { url: '/informacion-tiempo/', icon: '☀️', name: 'Tiempo', description: 'Previsión meteorológica' },
];

// ==========================================
// FAMILIA: JUEGOS
// ==========================================
const juegosArcadeApps: RelatedApp[] = [
  { url: '/juego-asteroids/', icon: '🚀', name: 'Asteroids', description: 'Arcade espacial' },
  { url: '/juego-space-invaders/', icon: '👾', name: 'Space Invaders', description: 'Clásico arcade' },
  { url: '/juego-platform-runner/', icon: '🏃', name: 'Platform Runner', description: 'Plataformas' },
  { url: '/juego-2048/', icon: '🎮', name: '2048', description: 'Puzzle numérico' },
];

const juegosPuzzleApps: RelatedApp[] = [
  { url: '/juego-sudoku/', icon: '🔢', name: 'Sudoku', description: 'Puzzle clásico' },
  { url: '/juego-wordle/', icon: '🔤', name: 'Wordle', description: 'Adivina la palabra' },
  { url: '/juego-memoria/', icon: '🧠', name: 'Memoria', description: 'Encuentra parejas' },
  { url: '/juego-puzzle-matematico/', icon: '➕', name: 'Puzzle Matemático', description: 'Retos numéricos' },
];

const juegosCasualApps: RelatedApp[] = [
  { url: '/juego-tres-en-raya/', icon: '⭕', name: 'Tres en Raya', description: 'Tic-tac-toe' },
  { url: '/juego-piedra-papel-tijera/', icon: '✂️', name: 'Piedra Papel Tijera', description: 'Clásico' },
  { url: '/ruleta-aleatoria/', icon: '🎰', name: 'Ruleta', description: 'Sorteos' },
  { url: '/generador-loteria/', icon: '🎱', name: 'Lotería', description: 'Números aleatorios' },
  { url: '/cara-o-cruz/', icon: '🪙', name: 'Cara o Cruz', description: 'Lanza la moneda' },
  { url: '/tirador-dados/', icon: '🎲', name: 'Tirador de Dados', description: 'Dados para rol y mesa' },
];

// ==========================================
// FAMILIA: HERRAMIENTAS WEB
// ==========================================
const webDevApps: RelatedApp[] = [
  { url: '/validador-json/', icon: '📦', name: 'Validador JSON', description: 'Valida y formatea' },
  { url: '/validador-regex/', icon: '🔍', name: 'Validador Regex', description: 'Prueba expresiones' },
  { url: '/conversor-base64/', icon: '🔄', name: 'Base64', description: 'Codifica/decodifica' },
  { url: '/generador-utm/', icon: '🔗', name: 'Generador UTM', description: 'Parámetros de campaña' },
];

// ==========================================
// FAMILIA: INFORMÁTICA Y PROGRAMACIÓN
// ==========================================
const informaticaApps: RelatedApp[] = [
  { url: '/visualizador-algoritmos/', icon: '📊', name: 'Visualizador Algoritmos', description: 'Ordenación paso a paso' },
  { url: '/playground-sql/', icon: '🗃️', name: 'Playground SQL', description: 'Editor SQL interactivo' },
  { url: '/simulador-puertas-logicas/', icon: '🔌', name: 'Puertas Lógicas', description: 'Circuitos digitales' },
  { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: '100+ términos de código' },
  { url: '/calculadora-sistemas-numericos/', icon: '🔢', name: 'Sistemas Numéricos', description: 'Binario, hex, octal' },
  { url: '/calculadora-subredes/', icon: '🌐', name: 'Calculadora Subredes', description: 'CIDR, máscaras IP' },
  { url: '/visualizador-estructuras-datos/', icon: '📦', name: 'Estructuras de Datos', description: 'Arrays, pilas, colas, BST' },
  { url: '/conversor-ieee754/', icon: '🔢', name: 'Conversor IEEE 754', description: 'Punto flotante 32/64 bits' },
  { url: '/calculadora-algebra-booleana/', icon: '🔢', name: 'Álgebra Booleana', description: 'Karnaugh, SOP, POS' },
  { url: '/validador-json/', icon: '🗂️', name: 'Validador JSON', description: 'Valida y formatea' },
  { url: '/validador-regex/', icon: '🔍', name: 'Validador Regex', description: 'Prueba expresiones' },
];

// BIOMEDICINA Y CIENCIAS DE LA SALUD
// ==========================================
const biomedicinaApps: RelatedApp[] = [
  { url: '/simulador-genetica/', icon: '🧬', name: 'Simulador Genética', description: 'Cruces mendelianos' },
  { url: '/calculadora-estadistica-medica/', icon: '🩺', name: 'Estadística Médica', description: 'Sensibilidad, VPP, NNT' },
  { url: '/calculadora-imc/', icon: '⚖️', name: 'Calculadora IMC', description: 'Índice masa corporal' },
  { url: '/vitaminas-minerales/', icon: '🥗', name: 'Vitaminas y Minerales', description: 'Guía nutrientes' },
  { url: '/huesos-cuerpo-humano/', icon: '🦴', name: 'Huesos Humanos', description: 'Anatomía esqueleto' },
];


const imagenesApps: RelatedApp[] = [
  { url: '/conversor-imagenes/', icon: '🖼️', name: 'Conversor Imágenes', description: 'Cambia formatos' },
  { url: '/compresor-imagenes/', icon: '📦', name: 'Compresor Imágenes', description: 'Reduce tamaño' },
  { url: '/editor-exif/', icon: '📷', name: 'Editor EXIF', description: 'Metadatos de fotos' },
  { url: '/generador-iconos/', icon: '🎨', name: 'Generador Iconos', description: 'Iconos para apps' },
];

const audioApps: RelatedApp[] = [
  { url: '/recortador-audio/', icon: '✂️', name: 'Recortador Audio', description: 'Corta y edita' },
  { url: '/generador-ondas/', icon: '🌊', name: 'Generador Ondas', description: 'Visualizador audio' },
  { url: '/radio-meskeia/', icon: '📻', name: 'Radio meskeIA', description: 'Emisoras online' },
];

// ==========================================
// FAMILIA: CONVERSORES
// ==========================================
const conversoresApps: RelatedApp[] = [
  { url: '/conversor-unidades/', icon: '📏', name: 'Conversor Unidades', description: 'Longitud, peso, etc.' },
  { url: '/conversor-tallas/', icon: '👕', name: 'Conversor Tallas', description: 'Ropa y calzado' },
  { url: '/conversor-numeros-romanos/', icon: '🏛️', name: 'Números Romanos', description: 'I, II, III...' },
  { url: '/conversor-morse/', icon: '📡', name: 'Código Morse', description: '... --- ...' },
];

// ==========================================
// FAMILIA: CÓDIGOS Y GENERADORES
// ==========================================
const codigosApps: RelatedApp[] = [
  { url: '/generador-qr/', icon: '📱', name: 'Generador QR', description: 'Códigos QR' },
  { url: '/generador-codigos-barras/', icon: '📊', name: 'Códigos de Barras', description: 'EAN, UPC, Code128' },
  { url: '/generador-contrasenas/', icon: '🔒', name: 'Contraseñas', description: 'Seguras y aleatorias' },
  { url: '/generador-firma-email/', icon: '✉️', name: 'Firma Email', description: 'HTML profesional' },
];

// ==========================================
// FAMILIA: HOGAR Y COCINA
// ==========================================
const cocinaApps: RelatedApp[] = [
  { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora Cocina', description: 'Conversiones culinarias' },
  { url: '/calculadora-porciones/', icon: '🍽️', name: 'Porciones', description: 'Ajusta recetas' },
  { url: '/planificador-menu/', icon: '📅', name: 'Planificador Menú', description: 'Menú semanal' },
  { url: '/lista-compras/', icon: '🛒', name: 'Lista Compras', description: 'Organiza tu compra' },
];

const hogarApps: RelatedApp[] = [
  { url: '/calculadora-pintura/', icon: '🎨', name: 'Calculadora Pintura', description: 'Litros necesarios' },
  { url: '/calculadora-gasto-energetico/', icon: '⚡', name: 'Gasto Energético', description: 'Consumo eléctrico' },
  { url: '/calculadora-huella-carbono/', icon: '🌍', name: 'Huella de Carbono', description: 'Tu impacto ambiental' },
  { url: '/planificador-mudanzas/', icon: '📦', name: 'Planificador Mudanzas', description: 'Organiza tu mudanza' },
];

// ==========================================
// FAMILIA: FAMILIA Y NIÑOS
// ==========================================
const familiaApps: RelatedApp[] = [
  { url: '/planificador-embarazo/', icon: '🤰', name: 'Planificador Embarazo', description: 'Semanas y checklist' },
  { url: '/calculadora-percentiles/', icon: '📏', name: 'Percentiles Infantiles', description: 'Peso y talla OMS' },
  { url: '/calculadora-fechas/', icon: '📅', name: 'Calculadora Fechas', description: 'Días entre fechas' },
];

// ==========================================
// MAPEO PRINCIPAL: appSlug -> RelatedApp[]
// ==========================================
export const appRelationsMap: Record<string, RelatedApp[]> = {
  // ESTUDIANTES
  'calculadora-notas': estudiantesApps.filter(a => a.url !== '/calculadora-notas/'),
  'creador-flashcards': estudiantesApps.filter(a => a.url !== '/creador-flashcards/'),
  'generador-horarios-estudio': estudiantesApps.filter(a => a.url !== '/generador-horarios-estudio/'),
  'temporizador-pomodoro': [...estudiantesApps.filter(a => a.url !== '/temporizador-pomodoro/').slice(0, 2), ...productividadApps.slice(0, 2)],

  // HERENCIAS Y FISCAL
  'calculadora-sucesiones-cataluna': herenciasApps.filter(a => a.url !== '/calculadora-sucesiones-cataluna/'),
  'calculadora-sucesiones-nacional': herenciasApps.filter(a => a.url !== '/calculadora-sucesiones-nacional/'),
  'calculadora-donaciones-cataluna': donacionesApps.filter(a => a.url !== '/calculadora-donaciones-cataluna/'),
  'calculadora-donaciones-nacional': donacionesApps.filter(a => a.url !== '/calculadora-donaciones-nacional/'),
  'guia-tramitacion-herencias': herenciasApps.filter(a => a.url !== '/guia-tramitacion-herencias/'),
  'herencias-paso-a-paso': herenciasApps.filter(a => a.url !== '/herencias-paso-a-paso/'),
  'calculadora-herencias': herenciasApps.filter(a => a.url !== '/calculadora-herencias/'),
  'simulador-irpf': fiscalApps.filter(a => a.url !== '/simulador-irpf/'),
  'calculadora-plusvalias-irpf': fiscalApps.filter(a => a.url !== '/calculadora-plusvalias-irpf/'),
  'calculadora-sueldo-neto': [
    { url: '/simulador-irpf/', icon: '📋', name: 'Simulador IRPF', description: 'Calcula tu declaración' },
    { url: '/calculadora-cuota-autonomo/', icon: '💼', name: 'Cuota Autónomo', description: 'Tramos cotización 2025' },
    { url: '/simulador-gastos-deducibles/', icon: '✅', name: 'Gastos Deducibles', description: 'Para autónomos' },
    { url: '/calculadora-tarifa-freelance/', icon: '💰', name: 'Tarifa Freelance', description: 'Calcula tu hora' },
  ],

  // FINANZAS - INVERSIÓN
  'interes-compuesto': finanzasInversionApps.filter(a => a.url !== '/interes-compuesto/'),
  'calculadora-inversiones': finanzasInversionApps.filter(a => a.url !== '/calculadora-inversiones/'),
  'test-perfil-inversor': finanzasInversionApps.filter(a => a.url !== '/test-perfil-inversor/'),
  'simulador-cartera-inversion': finanzasInversionApps.filter(a => a.url !== '/simulador-cartera-inversion/'),
  'calculadora-tir-van': finanzasInversionApps.filter(a => a.url !== '/calculadora-tir-van/'),

  // FINANZAS - HIPOTECA / INMOBILIARIA
  'simulador-hipoteca': finanzasHipotecaApps.filter(a => a.url !== '/simulador-hipoteca/'),
  'amortizacion-hipoteca': finanzasHipotecaApps.filter(a => a.url !== '/amortizacion-hipoteca/'),
  'simulador-prestamos': finanzasHipotecaApps.filter(a => a.url !== '/simulador-prestamos/'),
  'calculadora-alquiler-vs-compra': finanzasHipotecaApps.filter(a => a.url !== '/calculadora-alquiler-vs-compra/'),
  'simulador-compraventa-inmueble': finanzasHipotecaApps.filter(a => a.url !== '/simulador-compraventa-inmueble/'),
  'calculadora-coste-vivienda': [
    { url: '/simulador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/calculadora-alquiler-vs-compra/', icon: '⚖️', name: 'Alquiler vs Compra', description: 'Compara opciones' },
    { url: '/simulador-compraventa-inmueble/', icon: '🏠', name: 'Compraventa Inmueble', description: 'Gastos e impuestos' },
    { url: '/calculadora-gasto-energetico/', icon: '💡', name: 'Gasto Energético', description: 'Coste de electrodomésticos' },
  ],

  // FINANZAS - PERSONALES
  'control-gastos': finanzasPersonalesApps.filter(a => a.url !== '/control-gastos/'),
  'calculadora-suscripciones': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-suscripciones/'),
  'calculadora-roommates': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-roommates/'),
  'calculadora-jubilacion': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-jubilacion/'),
  'calculadora-fondo-emergencia': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-fondo-emergencia/'),
  'calculadora-regla-50-30-20': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-regla-50-30-20/'),
  'calculadora-fire': [...finanzasPersonalesApps.filter(a => a.url !== '/calculadora-fire/').slice(0, 2), ...finanzasInversionApps.slice(0, 2)],
  'calculadora-coste-plazos': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-coste-plazos/').slice(0, 4),
  'calculadora-deuda': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-deuda/').slice(0, 4),
  'comparador-vehiculos': [
    { url: '/simulador-prestamos/', icon: '🏦', name: 'Simulador Préstamos', description: 'Compara sistemas de amortización' },
    { url: '/calculadora-coste-plazos/', icon: '💳', name: 'Coste Real a Plazos', description: 'TAE e intereses ocultos' },
    { url: '/simulador-gastos-deducibles/', icon: '✅', name: 'Gastos Deducibles', description: 'Para autónomos y empresas' },
    { url: '/calculadora-tir-van/', icon: '📉', name: 'TIR y VAN', description: 'Análisis de inversiones' },
  ],
  'calculadora-seguro-vida': [
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Tipos Seguros', description: 'Guía de seguros en España' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas según tu perfil' },
    { url: '/calculadora-infraseguro/', icon: '⚖️', name: 'Calculadora Infraseguro', description: 'Regla proporcional en siniestros' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Guía Seguro Coche', description: 'Cuándo reclamar al seguro' },
  ],
  'comparador-tipos-seguros': [
    { url: '/calculadora-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro Vida', description: 'Cuánto seguro necesitas' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas según tu perfil' },
    { url: '/calculadora-infraseguro/', icon: '⚖️', name: 'Calculadora Infraseguro', description: 'Regla proporcional en siniestros' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Guía Seguro Coche', description: 'Cuándo reclamar al seguro' },
  ],
  'checklist-coberturas-seguros': [
    { url: '/calculadora-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro Vida', description: 'Cuánto seguro de vida necesitas' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Tipos Seguros', description: 'Guía de seguros en España' },
    { url: '/calculadora-infraseguro/', icon: '⚖️', name: 'Calculadora Infraseguro', description: 'Regla proporcional en siniestros' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Guía Seguro Coche', description: 'Cuándo reclamar al seguro' },
  ],
  'calculadora-infraseguro': [
    { url: '/calculadora-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro Vida', description: 'Cuánto seguro de vida necesitas' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Tipos Seguros', description: 'Guía de seguros en España' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas según tu perfil' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Guía Seguro Coche', description: 'Cuándo reclamar al seguro' },
  ],
  'guia-reclamar-seguro-coche': [
    { url: '/calculadora-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro Vida', description: 'Cuánto seguro de vida necesitas' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Tipos Seguros', description: 'Guía de seguros en España' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas según tu perfil' },
    { url: '/calculadora-infraseguro/', icon: '⚖️', name: 'Calculadora Infraseguro', description: 'Regla proporcional en siniestros' },
  ],
  'asistente-reclamaciones': [
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Plazos de prescripción y caducidad' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Reclamar Seguro Coche', description: 'Cuándo reclamar al seguro del coche' },
    { url: '/guia-tramitacion-herencias/', icon: '📋', name: 'Tramitación Herencias', description: 'Pasos para tramitar una herencia' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas' },
  ],
  'plazos-legales': [
    { url: '/asistente-reclamaciones/', icon: '📝', name: 'Asistente Reclamaciones', description: 'Guía para reclamar tus derechos' },
    { url: '/guia-tramitacion-herencias/', icon: '📋', name: 'Tramitación Herencias', description: 'Pasos para tramitar una herencia' },
    { url: '/calculadora-cuota-autonomo/', icon: '💼', name: 'Cuota Autónomo', description: 'Calcula tu cuota de autónomo' },
    { url: '/calculadora-iva/', icon: '🧾', name: 'Calculadora IVA', description: 'Calcula IVA incluido o sin IVA' },
  ],

  // SALUD
  'calculadora-imc': saludApps.filter(a => a.url !== '/calculadora-imc/'),
  'calculadora-colesterol': saludApps.filter(a => a.url !== '/calculadora-colesterol/'),
  'calculadora-calorias-ejercicio': saludApps.filter(a => a.url !== '/calculadora-calorias-ejercicio/'),
  'calculadora-macros': saludApps.filter(a => a.url !== '/calculadora-macros/'),
  'calculadora-hidratacion': saludApps.filter(a => a.url !== '/calculadora-hidratacion/'),
  'planificador-menu': [...saludApps.filter(a => a.url !== '/planificador-menu/').slice(0, 2), ...cocinaApps.slice(0, 2)],
  'calculadora-porciones': [...cocinaApps.filter(a => a.url !== '/calculadora-porciones/').slice(0, 2), ...saludApps.slice(0, 2)],
  'vitaminas-minerales': saludApps.filter(a => a.url !== '/vitaminas-minerales/'),
  'seguimiento-habitos': saludHabitosApps.filter(a => a.url !== '/seguimiento-habitos/'),
  'test-habitos': saludHabitosApps.filter(a => a.url !== '/test-habitos/'),
  'calculadora-sueno': saludHabitosApps.filter(a => a.url !== '/calculadora-sueno/'),

  // MASCOTAS
  'planificador-mascota': [...mascotasApps.filter(a => a.url !== '/planificador-mascota/').slice(0, 3), mascotasExtraApps[1]],
  'calculadora-alimentacion-mascotas': [...mascotasApps.filter(a => a.url !== '/calculadora-alimentacion-mascotas/').slice(0, 3), mascotasExtraApps[0]],
  'calculadora-medicamentos-mascotas': [...mascotasApps.filter(a => a.url !== '/calculadora-medicamentos-mascotas/').slice(0, 3), mascotasExtraApps[1]],
  'calculadora-edad-mascotas': [...mascotasApps.filter(a => a.url !== '/calculadora-edad-mascotas/').slice(0, 3), mascotasExtraApps[0]],
  'calculadora-tamano-adulto-perro': mascotasApps,
  'guia-cuidado-mascota': mascotasApps,

  // SEO
  'analizador-titulos-seo': [...seoApps.filter(a => a.url !== '/analizador-titulos-seo/'), seoExtraApps[0]],
  'generador-meta-descripciones': [...seoApps.filter(a => a.url !== '/generador-meta-descripciones/'), seoExtraApps[1]],
  'analizador-densidad-seo': [...seoApps.filter(a => a.url !== '/analizador-densidad-seo/'), seoExtraApps[1]],
  'calculadora-legibilidad': [...seoApps.filter(a => a.url !== '/calculadora-legibilidad/'), seoExtraApps[0]],
  'calculadora-tiempo-lectura': seoApps,
  'generador-palabras-clave': seoApps,
  'generador-schema-markup': [...seoApps.slice(0, 2), ...seoExtraApps.slice(2, 4)],
  'analizador-geo': seoApps,
  'generador-hashtags': [...seoApps.slice(0, 2), ...negociosApps.slice(2, 4)],

  // TEXTO
  'contador-palabras': [...textoApps.filter(a => a.url !== '/contador-palabras/'), textoExtraApps[0]],
  'conversor-texto': [...textoApps.filter(a => a.url !== '/conversor-texto/'), textoExtraApps[1]],
  'limpiador-texto': [...textoApps.filter(a => a.url !== '/limpiador-texto/'), textoExtraApps[2]],
  'comparador-textos': [...textoApps.filter(a => a.url !== '/comparador-textos/'), textoExtraApps[1]],
  'contador-silabas': textoApps,
  'conversor-markdown-html': [...textoApps.slice(0, 2), ...webDevApps.slice(0, 2)],
  'generador-lorem-ipsum': textoApps,
  'generador-anagramas': textoApps,
  'detector-idioma': textoApps,
  'conjugador-verbos': [
    { url: '/contador-silabas/', icon: '📐', name: 'Contador Sílabas', description: 'Separa y cuenta sílabas' },
    { url: '/detector-idioma/', icon: '🌍', name: 'Detector Idioma', description: 'Identifica el idioma' },
    { url: '/contador-palabras/', icon: '🔢', name: 'Contador Palabras', description: 'Cuenta palabras y caracteres' },
    { url: '/generador-anagramas/', icon: '🔀', name: 'Generador Anagramas', description: 'Reordena letras' },
  ],
  'tablas-multiplicar': [
    { url: '/calculadora-notas/', icon: '📊', name: 'Calculadora Notas', description: 'Calcula tu nota media' },
    { url: '/juego-puzzle-matematico/', icon: '➕', name: 'Puzzle Matemático', description: 'Retos numéricos' },
    { url: '/calculadora-matematica/', icon: '🔢', name: 'Calculadora Matemática', description: 'Operaciones básicas' },
    { url: '/creador-flashcards/', icon: '🎴', name: 'Flashcards', description: 'Tarjetas de memoria' },
  ],

  // CRIPTOGRAFÍA
  'cifrado-clasico': criptografiaClasicaApps.filter(a => a.url !== '/cifrado-clasico/'),
  'cifrado-vigenere': criptografiaClasicaApps.filter(a => a.url !== '/cifrado-vigenere/'),
  'cifrado-transposicion': criptografiaClasicaApps.filter(a => a.url !== '/cifrado-transposicion/'),
  'cifrado-playfair': criptografiaClasicaApps.filter(a => a.url !== '/cifrado-playfair/'),
  'cifrado-aes': criptografiaModernaApps.filter(a => a.url !== '/cifrado-aes/'),
  'generador-hashes': criptografiaModernaApps.filter(a => a.url !== '/generador-hashes/'),
  'codificador-base64': criptografiaModernaApps.filter(a => a.url !== '/codificador-base64/'),

  // CONVERSIÓN DE DATOS
  'conversor-formatos': conversionDatosApps.filter(a => a.url !== '/conversor-formatos/'),

  // DISEÑO
  'conversor-colores': disenoColoresApps.filter(a => a.url !== '/conversor-colores/'),
  'creador-paletas': disenoColoresApps.filter(a => a.url !== '/creador-paletas/'),
  'generador-gradientes': disenoColoresApps.filter(a => a.url !== '/generador-gradientes/'),
  'contraste-colores': disenoColoresApps.filter(a => a.url !== '/contraste-colores/'),
  'generador-sombras': disenoExtraApps.filter(a => a.url !== '/generador-sombras/'),
  'generador-tipografias': disenoExtraApps.filter(a => a.url !== '/generador-tipografias/'),
  'calculadora-aspectos': [...disenoExtraApps.filter(a => a.url !== '/calculadora-aspectos/').slice(0, 2), ...imagenesApps.slice(0, 2)],
  'creador-thumbnails': [...imagenesApps.slice(0, 2), ...disenoColoresApps.slice(0, 2)],
  'generador-og-images': [
    { url: '/creador-thumbnails/', icon: '🎬', name: 'Creador Thumbnails', description: 'Miniaturas para YouTube' },
    { url: '/generador-schema-markup/', icon: '🏷️', name: 'Schema Markup', description: 'Datos estructurados SEO' },
    { url: '/analizador-titulos-seo/', icon: '🎯', name: 'Analizador Títulos', description: 'Optimiza títulos SEO' },
    { url: '/generador-meta-descripciones/', icon: '📝', name: 'Meta Descripciones', description: 'Para Google' },
  ],

  // FREELANCE Y NEGOCIOS
  'calculadora-tarifa-freelance': freelanceApps.filter(a => a.url !== '/calculadora-tarifa-freelance/'),
  'simulador-gastos-deducibles': freelanceApps.filter(a => a.url !== '/simulador-gastos-deducibles/'),
  'calculadora-presupuestos': freelanceApps.filter(a => a.url !== '/calculadora-presupuestos/'),
  'generador-facturas': freelanceApps.filter(a => a.url !== '/generador-facturas/'),
  'asistente-constitucion-sociedad': emprendimientoApps.filter(a => a.url !== '/asistente-constitucion-sociedad/'),
  'asistente-alta-autonomo': emprendimientoApps.filter(a => a.url !== '/asistente-alta-autonomo/'),
  'asistente-constitucion-asociacion': emprendimientoApps.filter(a => a.url !== '/asistente-constitucion-asociacion/'),
  'calendario-fiscal-emprendedor': emprendimientoApps.filter(a => a.url !== '/calendario-fiscal-emprendedor/'),
  'comparador-formas-juridicas': emprendimientoApps.filter(a => a.url !== '/comparador-formas-juridicas/'),
  'simulador-autonomo-vs-sl': emprendimientoApps.filter(a => a.url !== '/simulador-autonomo-vs-sl/'),
  'calculadora-cuota-autonomo': emprendimientoApps.filter(a => a.url !== '/calculadora-cuota-autonomo/'),
  'calculadora-break-even': [...freelanceApps.filter(a => a.url !== '/calculadora-break-even/').slice(0, 2), ...negociosApps.slice(0, 2)],
  'calculadora-roi-marketing': negociosApps.filter(a => a.url !== '/calculadora-roi-marketing/'),
  'planificador-cashflow': [...negociosApps.filter(a => a.url !== '/planificador-cashflow/').slice(0, 2), ...freelanceApps.slice(0, 2)],
  'generador-nombres-empresa': negociosApps.filter(a => a.url !== '/generador-nombres-empresa/'),
  'generador-carruseles': [...negociosApps.filter(a => a.url !== '/generador-carruseles/').slice(0, 2), ...seoApps.slice(0, 2)],

  // MATEMÁTICAS
  'calculadora-matematica': matematicasBasicasApps.filter(a => a.url !== '/calculadora-matematica/'),
  'calculadora-porcentajes': matematicasBasicasApps.filter(a => a.url !== '/calculadora-porcentajes/'),
  'calculadora-regla-de-tres': matematicasBasicasApps.filter(a => a.url !== '/calculadora-regla-de-tres/'),
  'calculadora-mcd-mcm': matematicasBasicasApps.filter(a => a.url !== '/calculadora-mcd-mcm/'),
  'algebra-ecuaciones': matematicasAvanzadasApps.filter(a => a.url !== '/algebra-ecuaciones/'),
  'calculadora-geometria': matematicasAvanzadasApps.filter(a => a.url !== '/calculadora-geometria/'),
  'calculadora-trigonometria': matematicasAvanzadasApps.filter(a => a.url !== '/calculadora-trigonometria/'),
  'calculadora-calculo': matematicasAvanzadasApps.filter(a => a.url !== '/calculadora-calculo/'),
  'calculadora-estadistica': [...estadisticaApps.filter(a => a.url !== '/calculadora-estadistica/'), matematicasBasicasApps[0]],
  'estadistica-avanzada': [...estadisticaApps.filter(a => a.url !== '/estadistica-avanzada/'), matematicasBasicasApps[0]],
  'calculadora-probabilidad': [...estadisticaApps.filter(a => a.url !== '/calculadora-probabilidad/'), matematicasBasicasApps[0]],
  'calculadora-distribuciones': [...estadisticaApps.filter(a => a.url !== '/calculadora-distribuciones/'), matematicasBasicasApps[0]],
  'inferencia-bayesiana': [...estadisticaApps.filter(a => a.url !== '/inferencia-bayesiana/'), matematicasBasicasApps[0]],
  'calculadora-teoria-colas': [...estadisticaApps.filter(a => a.url !== '/calculadora-teoria-colas/'), matematicasBasicasApps[0]],
  'calculadora-teoria-numeros': [...matematicasBasicasApps.slice(0, 2), ...matematicasAvanzadasApps.slice(0, 2)],
  'calculadora-algebra-abstracta': matematicasAvanzadasApps,

  // PRODUCTIVIDAD
  'lista-tareas': productividadApps.filter(a => a.url !== '/lista-tareas/'),
  'matriz-eisenhower': productividadApps.filter(a => a.url !== '/matriz-eisenhower/'),
  'notas': productividadApps.filter(a => a.url !== '/notas/'),
  'time-tracker': productividadApps.filter(a => a.url !== '/time-tracker/'),
  'calculadora-productividad': [...productividadApps.filter(a => a.url !== '/calculadora-productividad/').slice(0, 2), ...freelanceApps.slice(0, 2)],
  'planificador-turnos': productividadApps.filter(a => a.url !== '/planificador-turnos/'),
  'cronometro': productividadApps,
  'lista-equipaje': viajesApps.filter(a => a.url !== '/lista-equipaje/'),
  'conversor-horarios': viajesApps.filter(a => a.url !== '/conversor-horarios/'),
  'calculadora-combustible': viajesApps.filter(a => a.url !== '/calculadora-combustible/'),
  'informacion-tiempo': viajesApps.filter(a => a.url !== '/informacion-tiempo/'),
  'generador-actas': [...productividadApps.slice(0, 2), ...textoApps.slice(0, 2)],

  // JUEGOS
  'juego-asteroids': juegosArcadeApps.filter(a => a.url !== '/juego-asteroids/'),
  'juego-space-invaders': juegosArcadeApps.filter(a => a.url !== '/juego-space-invaders/'),
  'juego-platform-runner': juegosArcadeApps.filter(a => a.url !== '/juego-platform-runner/'),
  'juego-2048': [...juegosPuzzleApps.slice(0, 2), ...juegosArcadeApps.slice(0, 2)],
  'juego-sudoku': juegosPuzzleApps.filter(a => a.url !== '/juego-sudoku/'),
  'juego-wordle': juegosPuzzleApps.filter(a => a.url !== '/juego-wordle/'),
  'juego-memoria': juegosPuzzleApps.filter(a => a.url !== '/juego-memoria/'),
  'juego-puzzle-matematico': juegosPuzzleApps.filter(a => a.url !== '/juego-puzzle-matematico/'),
  'juego-tres-en-raya': juegosCasualApps.filter(a => a.url !== '/juego-tres-en-raya/'),
  'juego-piedra-papel-tijera': juegosCasualApps.filter(a => a.url !== '/juego-piedra-papel-tijera/'),
  'ruleta-aleatoria': juegosCasualApps.filter(a => a.url !== '/ruleta-aleatoria/'),
  'generador-loteria': juegosCasualApps.filter(a => a.url !== '/generador-loteria/'),
  'cara-o-cruz': juegosCasualApps.filter(a => a.url !== '/cara-o-cruz/'),
  'tirador-dados': juegosCasualApps.filter(a => a.url !== '/tirador-dados/'),
  'test-velocidad-escritura': [...productividadApps.slice(0, 2), ...juegosPuzzleApps.slice(0, 2)],

  // HERRAMIENTAS WEB
  'validador-json': webDevApps.filter(a => a.url !== '/validador-json/'),
  'validador-regex': webDevApps.filter(a => a.url !== '/validador-regex/'),
  'conversor-base64': webDevApps.filter(a => a.url !== '/conversor-base64/'),
  'generador-utm': webDevApps.filter(a => a.url !== '/generador-utm/'),
  'conversor-imagenes': imagenesApps.filter(a => a.url !== '/conversor-imagenes/'),
  'compresor-imagenes': imagenesApps.filter(a => a.url !== '/compresor-imagenes/'),
  'editor-exif': imagenesApps.filter(a => a.url !== '/editor-exif/'),
  'generador-iconos': imagenesApps.filter(a => a.url !== '/generador-iconos/'),
  'recortador-audio': audioApps.filter(a => a.url !== '/recortador-audio/'),
  'generador-ondas': audioApps.filter(a => a.url !== '/generador-ondas/'),
  'radio-meskeia': audioApps.filter(a => a.url !== '/radio-meskeia/'),

  // CONVERSORES
  'conversor-unidades': conversoresApps.filter(a => a.url !== '/conversor-unidades/'),
  'conversor-unidades-rf': [
    { url: '/conversor-unidades/', icon: '📏', name: 'Conversor Unidades', description: 'Longitud, peso, temperatura' },
    { url: '/calculadora-electricidad/', icon: '⚡', name: 'Electricidad', description: 'Ley de Ohm, potencia, circuitos' },
    { url: '/analizador-espectro/', icon: '📊', name: 'Analizador Espectro', description: 'FFT y frecuencias de audio' },
    { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Ondas y oscilaciones' },
  ],
  'conversor-tallas': conversoresApps.filter(a => a.url !== '/conversor-tallas/'),
  'conversor-numeros-romanos': conversoresApps.filter(a => a.url !== '/conversor-numeros-romanos/'),
  'conversor-morse': [...conversoresApps.filter(a => a.url !== '/conversor-morse/').slice(0, 2), ...criptografiaClasicaApps.slice(0, 2)],
  'conversor-binario': [...conversoresApps.slice(0, 2), ...criptografiaModernaApps.slice(2, 4)],
  'conversor-braille': conversoresApps,

  // CÓDIGOS
  'generador-qr': codigosApps.filter(a => a.url !== '/generador-qr/'),
  'generador-codigos-barras': codigosApps.filter(a => a.url !== '/generador-codigos-barras/'),
  'generador-contrasenas': [...criptografiaModernaApps.filter(a => a.url !== '/generador-contrasenas/').slice(0, 2), ...codigosApps.slice(0, 2)],
  'generador-firma-email': codigosApps.filter(a => a.url !== '/generador-firma-email/'),

  // HOGAR Y COCINA
  'calculadora-cocina': cocinaApps.filter(a => a.url !== '/calculadora-cocina/'),
  'lista-compras': cocinaApps.filter(a => a.url !== '/lista-compras/'),
  'calculadora-pintura': hogarApps.filter(a => a.url !== '/calculadora-pintura/'),
  'calculadora-gasto-energetico': hogarApps.filter(a => a.url !== '/calculadora-gasto-energetico/'),
  'calculadora-huella-carbono': hogarApps.filter(a => a.url !== '/calculadora-huella-carbono/'),
  'planificador-boda': [...hogarApps.filter(a => a.url !== '/planificador-boda/'), ...productividadApps.slice(0, 1)],
  'planificador-mudanzas': [
    { url: '/lista-compras/', icon: '🛒', name: 'Lista Compras', description: 'Organiza tu compra' },
    { url: '/lista-tareas/', icon: '✅', name: 'Lista Tareas', description: 'Gestiona tus pendientes' },
    { url: '/calculadora-pintura/', icon: '🎨', name: 'Calculadora Pintura', description: 'Litros de pintura' },
    { url: '/control-gastos/', icon: '💳', name: 'Control Gastos', description: 'Gestiona presupuesto' },
  ],

  // FAMILIA
  'planificador-embarazo': familiaApps.filter(a => a.url !== '/planificador-embarazo/'),
  'calculadora-percentiles': familiaApps.filter(a => a.url !== '/calculadora-percentiles/'),
  'calculadora-fechas': [...familiaApps.filter(a => a.url !== '/calculadora-fechas/'), ...productividadApps.slice(0, 2)],

  // FÍSICA Y QUÍMICA
  'calculadora-movimiento': [{ url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales interactivas' }, ...matematicasAvanzadasApps.slice(0, 2), { url: '/conversor-unidades/', icon: '📏', name: 'Conversor Unidades', description: 'Longitud, peso, etc.' }],
  'simulador-fisica': [{ url: '/calculadora-movimiento/', icon: '🚀', name: 'Calculadora Movimiento', description: 'MRU, MRUA, caída libre' }, { url: '/conversor-unidades/', icon: '📏', name: 'Conversor Unidades', description: 'Longitud, peso, etc.' }, { url: '/calculadora-electricidad/', icon: '⚡', name: 'Electricidad', description: 'Ley de Ohm, potencia' }, { url: '/tabla-periodica/', icon: '⚗️', name: 'Tabla Periódica', description: 'Elementos químicos' }],
  'calculadora-electricidad': [{ url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales' }, { url: '/calculadora-gasto-energetico/', icon: '⚡', name: 'Gasto Energético', description: 'Consumo eléctrico' }, ...matematicasAvanzadasApps.slice(0, 2)],
  'tabla-periodica': [{ url: '/glosario-fisica-quimica/', icon: '📖', name: 'Glosario', description: 'Términos de física y química' }, { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales' }, ...matematicasBasicasApps.slice(0, 1)],
  'glosario-fisica-quimica': [{ url: '/tabla-periodica/', icon: '⚗️', name: 'Tabla Periódica', description: 'Elementos químicos' }, { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales' }, ...matematicasBasicasApps.slice(0, 1)],

  // UTILIDADES EXTRA
  'calculadora-propinas': [...matematicasBasicasApps.slice(0, 2), ...cocinaApps.slice(0, 2)],
  'calculadora-iva': [...fiscalApps.slice(0, 2), ...matematicasBasicasApps.slice(0, 2)],
  'calculadora-descuentos': [...matematicasBasicasApps.slice(0, 2), { url: '/calculadora-iva/', icon: '🧾', name: 'Calculadora IVA', description: 'Añadir o quitar IVA' }],
  'prueba-camara': [{ url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir luz para fotos' }, { url: '/prueba-microfono/', icon: '🎤', name: 'Prueba Micrófono', description: 'Test de audio' }, { url: '/mi-ip/', icon: '🌐', name: 'Mi IP', description: 'Información de red' }],
  'prueba-microfono': [{ url: '/sonometro/', icon: '🔊', name: 'Sonómetro', description: 'Medir decibelios' }, { url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir luz ambiente' }],
  'sonometro': [{ url: '/analizador-espectro/', icon: '📊', name: 'Analizador Espectro', description: 'Visualiza frecuencias' }, { url: '/prueba-microfono/', icon: '🎤', name: 'Prueba Micrófono', description: 'Test de audio' }, { url: '/metronomo/', icon: '🎵', name: 'Metrónomo', description: 'Tempo musical' }],
  'luxometro': [{ url: '/golden-hour/', icon: '🌅', name: 'Golden Hour', description: 'Hora dorada y azul' }, { url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/conversor-colores/', icon: '🎨', name: 'Conversor Colores', description: 'HEX, RGB, HSL' }],
  'golden-hour': [{ url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir intensidad de luz' }, { url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/informacion-tiempo/', icon: '🌤️', name: 'Info Tiempo', description: 'Previsión meteorológica' }],
  'mi-ip': [{ url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/prueba-microfono/', icon: '🎤', name: 'Prueba Micrófono', description: 'Test de audio' }],
  'metronomo': [{ url: '/cronometro/', icon: '⏱️', name: 'Cronómetro', description: 'Medir tiempo' }, { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Técnica de productividad' }, { url: '/sonometro/', icon: '🔊', name: 'Sonómetro', description: 'Medir decibelios' }],
  'calculadora-inflacion': finanzasPersonalesApps,
  'analizador-espectro': [{ url: '/sonometro/', icon: '🔊', name: 'Sonómetro', description: 'Medir decibelios' }, { url: '/prueba-microfono/', icon: '🎤', name: 'Prueba Micrófono', description: 'Test de audio' }, { url: '/metronomo/', icon: '🎵', name: 'Metrónomo', description: 'Tempo musical' }],
  'nivel-burbuja': [{ url: '/conversor-unidades/', icon: '📏', name: 'Conversor Unidades', description: 'Longitud y ángulos' }, { url: '/calculadora-pintura/', icon: '🎨', name: 'Calculadora Pintura', description: 'Litros necesarios' }, { url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir intensidad de luz' }],

  // INSTRUMENTOS DIGITALES (sustituyen aparatos físicos)
  'contador-manual': [{ url: '/cronometro/', icon: '⏱️', name: 'Cronómetro', description: 'Medir tiempo' }, { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Técnica productividad' }, { url: '/seguimiento-habitos/', icon: '✅', name: 'Seguimiento Hábitos', description: 'Rastrea tus hábitos' }],
  'diapason': [{ url: '/afinador-instrumentos/', icon: '🎸', name: 'Afinador', description: 'Afina tu instrumento' }, { url: '/metronomo/', icon: '🎵', name: 'Metrónomo', description: 'Tempo musical' }, { url: '/generador-tonos/', icon: '🔊', name: 'Generador Tonos', description: 'Frecuencias de audio' }],
  'generador-tonos': [{ url: '/analizador-espectro/', icon: '📊', name: 'Analizador Espectro', description: 'Visualiza frecuencias' }, { url: '/afinador-instrumentos/', icon: '🎸', name: 'Afinador', description: 'Afina tu instrumento' }, { url: '/diapason/', icon: '🎼', name: 'Diapasón', description: 'La 440Hz' }, { url: '/sonometro/', icon: '🔊', name: 'Sonómetro', description: 'Medir decibelios' }],
  'afinador-instrumentos': [{ url: '/diapason/', icon: '🎼', name: 'Diapasón', description: 'La 440Hz' }, { url: '/metronomo/', icon: '🎵', name: 'Metrónomo', description: 'Tempo musical' }, { url: '/generador-tonos/', icon: '🔊', name: 'Generador Tonos', description: 'Frecuencias de audio' }, { url: '/analizador-espectro/', icon: '📊', name: 'Analizador Espectro', description: 'Visualiza frecuencias' }],
  'lupa-digital': [{ url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/espejo/', icon: '🪞', name: 'Espejo', description: 'Espejo digital' }, { url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir luz ambiente' }],
  'espejo': [{ url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/lupa-digital/', icon: '🔍', name: 'Lupa Digital', description: 'Amplía con la cámara' }, { url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir luz ambiente' }],

  // REFERENCIA Y CULTURA GENERAL
  'paises-del-mundo': [
    { url: '/constelaciones-del-cielo/', icon: '🌌', name: 'Constelaciones', description: '32 constelaciones famosas' },
    { url: '/minerales-del-mundo/', icon: '💎', name: 'Minerales del Mundo', description: '50 minerales esenciales' },
    { url: '/huesos-cuerpo-humano/', icon: '🦴', name: 'Huesos del Cuerpo', description: 'Anatomía humana' },
    { url: '/conversor-horarios/', icon: '🕐', name: 'Conversor Horarios', description: 'Zonas horarias' },
  ],
  'minerales-del-mundo': [
    { url: '/constelaciones-del-cielo/', icon: '🌌', name: 'Constelaciones', description: '32 constelaciones famosas' },
    { url: '/tabla-periodica/', icon: '⚗️', name: 'Tabla Periódica', description: 'Elementos químicos' },
    { url: '/huesos-cuerpo-humano/', icon: '🦴', name: 'Huesos del Cuerpo', description: 'Anatomía humana' },
    { url: '/paises-del-mundo/', icon: '🌍', name: 'Países del Mundo', description: 'Geografía mundial' },
  ],
  'huesos-cuerpo-humano': [
    { url: '/constelaciones-del-cielo/', icon: '🌌', name: 'Constelaciones', description: '32 constelaciones famosas' },
    { url: '/minerales-del-mundo/', icon: '💎', name: 'Minerales del Mundo', description: '50 minerales esenciales' },
    { url: '/paises-del-mundo/', icon: '🌍', name: 'Países del Mundo', description: 'Geografía mundial' },
    { url: '/tabla-periodica/', icon: '⚗️', name: 'Tabla Periódica', description: 'Elementos químicos' },
  ],
  'constelaciones-del-cielo': [
    { url: '/instrumentos-musicales/', icon: '🎵', name: 'Instrumentos Musicales', description: '45 instrumentos del mundo' },
    { url: '/paises-del-mundo/', icon: '🌍', name: 'Países del Mundo', description: 'Geografía mundial' },
    { url: '/minerales-del-mundo/', icon: '💎', name: 'Minerales del Mundo', description: '50 minerales esenciales' },
    { url: '/huesos-cuerpo-humano/', icon: '🦴', name: 'Huesos del Cuerpo', description: 'Anatomía humana' },
  ],
  'instrumentos-musicales': [
    { url: '/constelaciones-del-cielo/', icon: '🌌', name: 'Constelaciones', description: '32 constelaciones famosas' },
    { url: '/paises-del-mundo/', icon: '🌍', name: 'Países del Mundo', description: 'Geografía mundial' },
    { url: '/minerales-del-mundo/', icon: '💎', name: 'Minerales del Mundo', description: '50 minerales esenciales' },
    { url: '/radio-meskeia/', icon: '📻', name: 'Radio meskeIA', description: 'Emisoras del mundo' },
  ],

  // INFORMÁTICA Y PROGRAMACIÓN
  'visualizador-algoritmos': informaticaApps.filter(a => a.url !== '/visualizador-algoritmos/'),
  'playground-sql': informaticaApps.filter(a => a.url !== '/playground-sql/'),
  'simulador-puertas-logicas': informaticaApps.filter(a => a.url !== '/simulador-puertas-logicas/'),
  'glosario-programacion': informaticaApps.filter(a => a.url !== '/glosario-programacion/'),
  'calculadora-sistemas-numericos': informaticaApps.filter(a => a.url !== '/calculadora-sistemas-numericos/'),
  'calculadora-subredes': informaticaApps.filter(a => a.url !== '/calculadora-subredes/'),
  'visualizador-estructuras-datos': informaticaApps.filter(a => a.url !== '/visualizador-estructuras-datos/'),
  'conversor-ieee754': informaticaApps.filter(a => a.url !== '/conversor-ieee754/'),
  'calculadora-algebra-booleana': informaticaApps.filter(a => a.url !== '/calculadora-algebra-booleana/'),

  // BIOMEDICINA Y CIENCIAS DE LA SALUD
  'simulador-genetica': biomedicinaApps.filter(a => a.url !== '/simulador-genetica/'),
  'calculadora-estadistica-medica': biomedicinaApps.filter(a => a.url !== '/calculadora-estadistica-medica/'),

  // CREATIVIDAD Y DISEÑO EXTRA
  'generador-avatares': [
    { url: '/creador-paletas/', icon: '🎨', name: 'Creador de Paletas', description: 'Diseña paletas de colores' },
    { url: '/conversor-colores/', icon: '🌈', name: 'Conversor Colores', description: 'HEX, RGB, HSL, CMYK' },
    { url: '/generador-qr/', icon: '📱', name: 'Generador QR', description: 'Crea códigos QR' },
    { url: '/generador-firma-email/', icon: '✉️', name: 'Firma Email', description: 'Firma profesional HTML' },
  ],
};

/**
 * Obtiene las apps relacionadas para una app dada
 *
 * @param appSlug - El slug de la app (ej: 'calculadora-notas')
 * @returns Array de apps relacionadas o array vacío
 */
export function getRelatedApps(appSlug: string): RelatedApp[] {
  return appRelationsMap[appSlug] || [];
}

/**
 * Obtiene el título sugerido para la sección de apps relacionadas
 *
 * @param appSlug - El slug de la app
 * @returns Título y icono sugeridos
 */
export function getRelatedAppsTitle(appSlug: string): { title: string; icon: string } {
  // Definir títulos por familia
  const familyTitles: Record<string, { title: string; icon: string }> = {
    // Estudiantes
    'calculadora-notas': { title: 'Más herramientas para estudiantes', icon: '📚' },
    'creador-flashcards': { title: 'Más herramientas para estudiar', icon: '📚' },
    'generador-horarios-estudio': { title: 'Mejora tu rendimiento académico', icon: '📚' },

    // Herencias
    'calculadora-sucesiones-cataluna': { title: 'Herramientas para herencias', icon: '⚖️' },
    'calculadora-sucesiones-nacional': { title: 'Herramientas para herencias', icon: '⚖️' },
    'calculadora-donaciones-cataluna': { title: 'Herramientas fiscales', icon: '⚖️' },
    'calculadora-donaciones-nacional': { title: 'Herramientas fiscales', icon: '⚖️' },
    'guia-tramitacion-herencias': { title: 'Calculadoras de herencias', icon: '⚖️' },
    'calculadora-herencias': { title: 'Herramientas para herencias', icon: '⚖️' },

    // Finanzas
    'interes-compuesto': { title: 'Más herramientas de inversión', icon: '💰' },
    'simulador-hipoteca': { title: 'Herramientas para tu hipoteca', icon: '🏠' },
    'control-gastos': { title: 'Gestiona tus finanzas', icon: '💳' },

    // Salud
    'calculadora-imc': { title: 'Cuida tu salud', icon: '❤️' },
    'calculadora-calorias-ejercicio': { title: 'Herramientas de salud', icon: '❤️' },

    // Mascotas
    'planificador-mascota': { title: 'Más herramientas para tu mascota', icon: '🐾' },
    'calculadora-alimentacion-mascotas': { title: 'Cuida a tu mascota', icon: '🐾' },
    'calculadora-medicamentos-mascotas': { title: 'Salud de tu mascota', icon: '🐾' },
    'calculadora-edad-mascotas': { title: 'Más sobre tu mascota', icon: '🐾' },

    // SEO
    'analizador-titulos-seo': { title: 'Optimiza tu contenido', icon: '🎯' },
    'generador-meta-descripciones': { title: 'Herramientas SEO', icon: '🎯' },

    // Texto
    'contador-palabras': { title: 'Herramientas de texto', icon: '📝' },
    'conversor-texto': { title: 'Más utilidades de texto', icon: '📝' },

    // Criptografía
    'cifrado-clasico': { title: 'Más cifrados clásicos', icon: '🔐' },
    'cifrado-aes': { title: 'Herramientas de seguridad', icon: '🛡️' },

    // Diseño
    'conversor-colores': { title: 'Herramientas de diseño', icon: '🎨' },
    'creador-paletas': { title: 'Diseña con colores', icon: '🎨' },

    // Freelance y Emprendimiento
    'calculadora-tarifa-freelance': { title: 'Herramientas para autónomos', icon: '💼' },
    'generador-facturas': { title: 'Gestiona tu negocio', icon: '💼' },
    'asistente-constitucion-sociedad': { title: 'Herramientas para emprendedores', icon: '🚀' },
    'asistente-alta-autonomo': { title: 'Herramientas para emprendedores', icon: '💼' },
    'calendario-fiscal-emprendedor': { title: 'Gestión fiscal', icon: '📅' },

    // Matemáticas
    'algebra-ecuaciones': { title: 'Más matemáticas', icon: '📐' },
    'calculadora-estadistica': { title: 'Herramientas estadísticas', icon: '📊' },

    // Juegos
    'juego-asteroids': { title: 'Más juegos arcade', icon: '🎮' },
    'juego-sudoku': { title: 'Más puzzles', icon: '🧩' },

    // Web
    'validador-json': { title: 'Herramientas para desarrolladores', icon: '💻' },
    'conversor-imagenes': { title: 'Edita tus imágenes', icon: '🖼️' },

    // Referencia
    'paises-del-mundo': { title: 'Más herramientas de referencia', icon: '🌍' },
  };

  return familyTitles[appSlug] || { title: 'Apps relacionadas', icon: '🔗' };
}
