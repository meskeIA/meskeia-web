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
// FAMILIA: HERENCIAS Y FISCAL - MOVIDAS A EX-MESKEIA
// ==========================================
// herenciasApps y donacionesApps eliminadas

// ==========================================
// FAMILIA: JUBILACIÓN Y PATRIMONIO
// ==========================================
const jubilacionApps: RelatedApp[] = [
  { url: '/simulador-jubilacion-publica/', icon: '🏤', name: 'Simulador Jubilación Pública', description: 'Edad, pensión, anticipada y parcial' },
  { url: '/estimador-pension-viudedad/', icon: '💍', name: 'Pensión de Viudedad', description: 'Cuantía y requisitos 2025' },
  { url: '/planificador-ahorro-jubilacion/', icon: '💹', name: 'Planificador de Ahorro', description: 'Brecha, ahorro y plan de pensiones' },
  { url: '/estimador-irpf-pensionista/', icon: '📊', name: 'IRPF Pensionista', description: 'Cuánto pagas de renta al jubilarte' },
];

// ==========================================
// FAMILIA: SALUD MAYORES (Lote A)
// ==========================================
const saludMayoresApps: RelatedApp[] = [
  { url: '/adaptacion-hogar/', icon: '🏠', name: 'Adaptación del Hogar', description: 'Checklist accesibilidad y costes' },
  { url: '/residencia-vs-cuidado-en-casa/', icon: '🏡', name: 'Residencia vs Cuidado', description: 'Comparativa de opciones de cuidado' },
  { url: '/estimador-riesgo-osteoporosis/', icon: '🦴', name: 'Riesgo de Osteoporosis', description: 'Test de factores de riesgo validados' },
  { url: '/test-fragilidad/', icon: '🧓', name: 'Test de Fragilidad', description: 'Escala FRAIL: detección precoz de fragilidad' },
  { url: '/orientador-grado-dependencia/', icon: '📋', name: 'Grado de Dependencia', description: 'Orientación BVD y prestaciones SAAD' },
  { url: '/orientador-discapacidad/', icon: '♿', name: 'Grado de Discapacidad', description: '¿Vale la pena solicitarlo? RD 888/2022' },
  { url: '/planificador-chequeos-medicos/', icon: '🏥', name: 'Chequeos Médicos', description: 'Revisiones preventivas por edad' },
  { url: '/estimacion-prestaciones-dependencia/', icon: '💶', name: 'Prestaciones Dependencia', description: 'Cuantías SAAD por grado' },
  { url: '/planificador-turnos-cuidadores/', icon: '📅', name: 'Turnos de Cuidadores', description: 'Organiza rotaciones de cuidado' },
  { url: '/test-zarit-cuidador/', icon: '🤝', name: 'Test Zarit Cuidador', description: 'Evalúa sobrecarga del cuidador' },
  { url: '/estimacion-deduccion-discapacidad/', icon: '♿', name: 'Deducción Discapacidad', description: 'Ahorro IRPF por discapacidad' },
  { url: '/checklist-tramites-dependencia/', icon: '✅', name: 'Trámites Dependencia', description: 'Checklist paso a paso' },
];

const patrimonioPensionApps: RelatedApp[] = [
  { url: '/estimador-legitimas/', icon: '⚖️', name: 'Estimador de Legítimas', description: 'Herencia forzosa por régimen civil' },
  { url: '/estimador-impuesto-sucesiones/', icon: '🏛️', name: 'Impuesto de Sucesiones', description: 'Cuánto pagas por herencia' },
  { url: '/estimador-impuesto-donaciones/', icon: '🎁', name: 'Impuesto de Donaciones', description: 'Donar en vida vs herencia' },
  { url: '/orientacion-tramitacion-herencias/', icon: '📋', name: 'Tramitar una Herencia', description: 'Guía paso a paso' },
  { url: '/estimador-plusvalia-municipal/', icon: '🏙️', name: 'Plusvalía Municipal', description: 'Al vender o heredar inmueble' },
];

// ==========================================
// FAMILIA: JUBILACIÓN FISCAL (Lote B2)
// ==========================================
const jubilacionFiscalApps: RelatedApp[] = [
  { url: '/optimizador-rentas-60/', icon: '📊', name: 'Optimizador de Rentas 60+', description: 'Estrategia IRPF: pensión + PP + ahorro' },
  { url: '/estimador-irpf-pensionista/', icon: '🧮', name: 'IRPF Pensionista', description: 'Cuota y retención sobre la pensión' },
  { url: '/planificador-ahorro-jubilacion/', icon: '💹', name: 'Planificador de Ahorro', description: 'Brecha, ahorro, plan de pensiones' },
  { url: '/simulador-jubilacion-publica/', icon: '🏤', name: 'Simulador Jubilación Pública', description: 'Edad, pensión, anticipada y parcial' },
];

// ==========================================
// FAMILIA: FINANZAS PERSONALES
// ==========================================
const finanzasInversionApps: RelatedApp[] = [
  { url: '/estimador-interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Crecimiento de inversiones' },
  { url: '/estimador-inversiones/', icon: '💹', name: 'Calculadora Inversiones', description: 'Rentabilidad y riesgo' },
  { url: '/test-perfil-inversor/', icon: '🎯', name: 'Perfil Inversor', description: 'Descubre tu perfil' },
  { url: '/estimador-cartera-inversion/', icon: '📊', name: 'Simulador Cartera', description: 'Monte Carlo y Sharpe' },
  { url: '/estimador-tir-van/', icon: '📉', name: 'TIR y VAN', description: 'Análisis de proyectos' },
];

const finanzasHipotecaApps: RelatedApp[] = [
  { url: '/estimador-hipoteca/', icon: '🏠', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
  { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Gastos de Compraventa', description: 'ITP, notaría y registro' },
  { url: '/amortizacion-hipoteca/', icon: '💰', name: 'Amortización Anticipada', description: 'Reducir cuota vs plazo' },
  { url: '/estimador-prestamos/', icon: '🏦', name: 'Simulador Préstamos', description: 'Compara sistemas' },
  { url: '/orientador-alquiler-vs-compra/', icon: '🔑', name: 'Alquiler vs Compra', description: 'Análisis financiero' },
];

// ==========================================
// FAMILIA: INVERSIÓN INMOBILIARIA
// ==========================================
const inversionInmobiliariaApps: RelatedApp[] = [
  { url: '/calculadora-rentabilidad-alquiler/', icon: '🏘️', name: 'Rentabilidad Alquiler', description: 'ROI, cash flow y payback' },
  { url: '/orientador-alquiler-vs-compra/', icon: '⚖️', name: 'Alquiler vs Compra', description: 'Análisis financiero' },
  { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
  { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Gastos de Compraventa', description: 'ITP, notaría y registro' },
  { url: '/estimador-gastos-comunidad/', icon: '🏘️', name: 'Gastos de Comunidad', description: 'Reparto cuotas propietarios' },
];

// ==========================================
// FAMILIA: SALUD FEMENINA
// ==========================================
const saludFemeninaApps: RelatedApp[] = [
  { url: '/seguimiento-ciclo-menstrual/', icon: '🌸', name: 'Ciclo Menstrual', description: 'Ventana fértil y ovulación' },
  { url: '/planificador-embarazo/', icon: '🤰', name: 'Planificador Embarazo', description: 'Semanas y checklist' },
  { url: '/orientador-imc/', icon: '⚖️', name: 'Orientador IMC', description: 'Índice de masa corporal' },
  { url: '/orientador-percentiles/', icon: '📏', name: 'Percentiles Infantiles', description: 'Peso y talla OMS' },
];

const finanzasPersonalesApps: RelatedApp[] = [
  { url: '/control-gastos/', icon: '💳', name: 'Control de Gastos', description: 'Gestiona tu presupuesto' },
  { url: '/calculadora-suscripciones/', icon: '📱', name: 'Control Suscripciones', description: 'Gastos recurrentes' },
  { url: '/calculadora-roommates/', icon: '🏘️', name: 'Gastos Compartidos', description: 'División justa' },
  { url: '/planificador-ahorro-jubilacion/', icon: '💹', name: 'Planificador Ahorro Jubilación', description: 'Brecha, ahorro y plan' },
  { url: '/estimador-fondo-emergencia/', icon: '🛡️', name: 'Fondo de Emergencia', description: 'Cuánto ahorrar' },
  { url: '/orientador-regla-50-30-20/', icon: '📊', name: 'Regla 50/30/20', description: 'Distribuye tu presupuesto' },
  { url: '/estimador-fire/', icon: '🔥', name: 'Estimador FIRE', description: 'Independencia financiera' },
  { url: '/estimador-coste-plazos/', icon: '💳', name: 'Coste Real a Plazos', description: 'TAE e intereses ocultos' },
  { url: '/estimador-deuda/', icon: '🎯', name: 'Estimador de Deuda', description: 'Bola de nieve vs avalancha' },
];

const fiscalApps: RelatedApp[] = [
  { url: '/calculadora-iva/', icon: '🧾', name: 'Calculadora IVA', description: 'Añadir o quitar IVA' },
];

// ==========================================
// FAMILIA: SALUD Y BIENESTAR
// ==========================================
const saludApps: RelatedApp[] = [
  { url: '/planificador-chequeos-medicos/', icon: '🏥', name: 'Chequeos Médicos', description: 'Revisiones preventivas por edad' },
  { url: '/orientador-tension-arterial/', icon: '🩺', name: 'Tensión Arterial', description: 'Clasifica tu presión (ESH/ESC)' },
  { url: '/orientador-imc/', icon: '⚖️', name: 'Orientador IMC', description: 'Índice de masa corporal' },
  { url: '/orientador-colesterol/', icon: '🫀', name: 'Calculadora Colesterol', description: 'Ratios y riesgo cardiovascular' },
  { url: '/calculadora-calorias-ejercicio/', icon: '🔥', name: 'Calorías Diarias', description: 'Necesidades calóricas' },
  { url: '/calculadora-macros/', icon: '🥗', name: 'Calculadora Macros', description: 'Proteínas, carbos, grasas' },
  { url: '/calculadora-hidratacion/', icon: '💧', name: 'Hidratación', description: 'Agua recomendada' },
  { url: '/planificador-menu/', icon: '🍽️', name: 'Planificador Menú', description: 'Dieta mediterránea' },
  { url: '/vitaminas-minerales/', icon: '🥗', name: 'Vitaminas y Minerales', description: '30 nutrientes esenciales' },
];

const saludHabitosApps: RelatedApp[] = [
  { url: '/seguimiento-habitos/', icon: '✅', name: 'Seguimiento Hábitos', description: 'Construye rutinas' },
  { url: '/test-habitos-saludables/', icon: '📋', name: 'Test de Hábitos', description: 'Evalúa tus hábitos' },
  { url: '/calculadora-sueno/', icon: '😴', name: 'Calculadora Sueño', description: 'Ciclos de sueño' },
  { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Productividad' },
];

// ==========================================
// FAMILIA: MASCOTAS
// ==========================================
const mascotasApps: RelatedApp[] = [
  { url: '/planificador-mascota/', icon: '📋', name: 'Planificador Mascota', description: 'Checklist completo' },
  { url: '/calculadora-alimentacion-mascotas/', icon: '🍖', name: 'Alimentación Mascotas', description: 'Raciones diarias' },
  { url: '/orientador-medicamentos-mascotas/', icon: '💊', name: 'Medicamentos Mascotas', description: 'Dosis antiparasitarios' },
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
  { url: '/simulador-baja-vision/', icon: '👁️', name: 'Simulador Baja Visión', description: 'Cataratas, daltonismo' },
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
  { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Calcula tu hora' },
  { url: '/calculadora-presupuestos/', icon: '📋', name: 'Presupuestos', description: 'Propuestas a clientes' },
  { url: '/generador-facturas/', icon: '🧾', name: 'Generador Facturas', description: 'Facturas con IVA/IRPF' },
];

const emprendimientoApps: RelatedApp[] = [
  { url: '/generador-nombres-empresa/', icon: '✨', name: 'Nombres Empresa', description: 'Ideas de nombres' },
  { url: '/generador-facturas/', icon: '🧾', name: 'Generador Facturas', description: 'Facturas profesionales' },
  { url: '/calculadora-presupuestos/', icon: '📋', name: 'Presupuestos', description: 'Propuestas a clientes' },
];

const negociosApps: RelatedApp[] = [
  { url: '/estimador-roi-marketing/', icon: '📊', name: 'ROI Marketing', description: 'Retorno inversión' },
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
  { url: '/guia-seguro-viaje/', icon: '🛡️', name: 'Seguro de Viaje', description: 'Qué cobertura necesitas' },
  { url: '/comparador-transporte-viaje/', icon: '🚄', name: 'Comparador Transporte', description: 'Avión, tren, bus o coche' },
  { url: '/planificador-itinerario/', icon: '🗓️', name: 'Planificador Itinerario', description: 'Organiza días y actividades' },
  { url: '/lista-equipaje/', icon: '🧳', name: 'Lista Equipaje', description: 'Checklist de viaje' },
  { url: '/checklist-documentos-viaje/', icon: '📋', name: 'Documentos de Viaje', description: 'Pasaporte, visado y más' },
  { url: '/orientador-jet-lag/', icon: '✈️', name: 'Simulador Jet Lag', description: 'Impacto del cambio horario' },
  { url: '/conversor-horarios/', icon: '🌍', name: 'Conversor Horarios', description: 'Zonas horarias' },
  { url: '/conversor-divisas/', icon: '💱', name: 'Conversor Divisas', description: 'Tipos de cambio BCE' },
  { url: '/presupuesto-viaje/', icon: '🗺️', name: 'Presupuesto Viaje', description: 'Planifica y divide gastos' },
  { url: '/enchufes-por-pais/', icon: '🔌', name: 'Enchufes por País', description: 'Qué adaptador llevar' },
  { url: '/comparador-coste-vida/', icon: '🏙️', name: 'Coste de Vida', description: 'Compara ciudades del mundo' },
  { url: '/calculadora-combustible/', icon: '⛽', name: 'Combustible', description: 'Coste del viaje' },
  { url: '/calculadora-propinas/', icon: '🧮', name: 'Calculadora Propinas', description: 'Divide la cuenta' },
  { url: '/paises-del-mundo/', icon: '🌍', name: 'Países del Mundo', description: 'Monedas, idiomas, banderas' },
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
  { url: '/juego-ahorcado/', icon: '🎯', name: 'Ahorcado', description: 'Adivina la palabra letra a letra' },
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
  { url: '/orientador-imc/', icon: '⚖️', name: 'Orientador IMC', description: 'Índice masa corporal' },
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
  { url: '/extractor-audio-video/', icon: '🎬', name: 'Extractor Audio Vídeo', description: 'De vídeo AVI/MP4 a MP3/WAV' },
  { url: '/recortador-audio/', icon: '✂️', name: 'Recortador Audio', description: 'Corta y edita audio' },
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
// FAMILIA: SOSTENIBILIDAD Y HOGAR EFICIENTE
// ==========================================
const sostenibilidadApps: RelatedApp[] = [
  { url: '/calculadora-huella-carbono/', icon: '🌍', name: 'Huella de Carbono', description: 'Tu impacto ambiental' },
  { url: '/calculadora-eficiencia-energetica/', icon: '⚡', name: 'Eficiencia Energética', description: 'Ahorro con mejoras energéticas' },
  { url: '/calculadora-gasto-energetico/', icon: '💡', name: 'Gasto Energético', description: 'Consumo eléctrico' },
  { url: '/selector-energia-hogar/', icon: '🔥', name: 'Selector Energía Hogar', description: 'Calefacción ideal para ti' },
  { url: '/simulador-placas-solares/', icon: '☀️', name: 'Placas Solares', description: 'Ahorro con autoconsumo fotovoltaico' },
  { url: '/selector-tarifa-electrica/', icon: '⚡', name: 'Tarifa Eléctrica', description: 'PVPC o mercado libre' },
  { url: '/estimacion-ahorro-hidrico/', icon: '💧', name: 'Ahorro Hídrico', description: 'Litros y euros ahorrados' },
  { url: '/simulador-subvenciones-rehabilitacion/', icon: '🏠', name: 'Subvenciones Rehabilitación', description: 'Ayudas Next Generation' },
  { url: '/estimacion-certificacion-energetica/', icon: '🏷️', name: 'Certificación Energética', description: 'Estima tu letra (A-G)' },
  { url: '/orientador-deduccion-obras-energeticas/', icon: '🏗️', name: 'Deducción IRPF Obras', description: 'Deduce 20-60% en tu renta' },
];

// ==========================================
// FAMILIA: BRICOLAJE Y REFORMAS
// ==========================================
const bricolajeApps: RelatedApp[] = [
  { url: '/calculadora-materiales-construccion/', icon: '🧱', name: 'Materiales de Construcción', description: 'Azulejos, pintura, tarima y mortero' },
  { url: '/calculadora-eficiencia-energetica/', icon: '⚡', name: 'Eficiencia Energética', description: 'Ahorro y amortización de mejoras' },
  { url: '/calculadora-pintura/', icon: '🎨', name: 'Calculadora Pintura', description: 'Litros necesarios para pintar' },
  { url: '/estimador-reformas-hogar/', icon: '🏗️', name: 'Estimador Reformas', description: 'Presupuesto por tipo de reforma' },
  { url: '/calculadora-gasto-energetico/', icon: '💡', name: 'Gasto Energético', description: 'Consumo eléctrico de electrodomésticos' },
];

// ==========================================
// FAMILIA: FAMILIA Y NIÑOS
// ==========================================
const familiaApps: RelatedApp[] = [
  { url: '/planificador-embarazo/', icon: '🤰', name: 'Planificador Embarazo', description: 'Semanas y checklist' },
  { url: '/orientador-percentiles/', icon: '📏', name: 'Percentiles Infantiles', description: 'Peso y talla OMS' },
  { url: '/calculadora-fechas/', icon: '📅', name: 'Calculadora Fechas', description: 'Días entre fechas' },
  { url: '/estimacion-prestacion-nacimiento/', icon: '👶', name: 'Prestación Nacimiento', description: 'Cuantía SS por nacimiento/adopción' },
  { url: '/estimacion-baja-maternal/', icon: '📅', name: 'Baja Maternal/Paternal', description: '16 semanas: distribución y extras' },
  { url: '/planificador-gastos-bebe/', icon: '🍼', name: 'Gastos Primer Año Bebé', description: 'Presupuesto categorizado' },
  { url: '/estimacion-deduccion-maternidad/', icon: '👩‍👧', name: 'Deducción Maternidad', description: '1.200 €/año + guardería IRPF' },
  { url: '/test-estilo-parental/', icon: '👨‍👩‍👧‍👦', name: 'Test Estilo Parental', description: 'Autoconocimiento educativo' },
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

  // FINANZAS - INVERSIÓN
  'interes-compuesto': finanzasInversionApps.filter(a => a.url !== '/estimador-interes-compuesto/'),
  'calculadora-inversiones': finanzasInversionApps.filter(a => a.url !== '/estimador-inversiones/'),
  'test-perfil-inversor': finanzasInversionApps.filter(a => a.url !== '/test-perfil-inversor/'),
  'simulador-cartera-inversion': finanzasInversionApps.filter(a => a.url !== '/estimador-cartera-inversion/'),
  'calculadora-tir-van': finanzasInversionApps.filter(a => a.url !== '/estimador-tir-van/'),

  // FINANZAS - HIPOTECA / INMOBILIARIA
  'simulador-hipoteca': finanzasHipotecaApps.filter(a => a.url !== '/estimador-hipoteca/'),
  'simulador-compraventa-inmueble': finanzasHipotecaApps.filter(a => a.url !== '/estimador-compraventa-inmueble/'),
  'amortizacion-hipoteca': finanzasHipotecaApps.filter(a => a.url !== '/amortizacion-hipoteca/'),
  'simulador-prestamos': finanzasHipotecaApps.filter(a => a.url !== '/estimador-prestamos/'),
  'calculadora-alquiler-vs-compra': finanzasHipotecaApps.filter(a => a.url !== '/orientador-alquiler-vs-compra/'),
  'calculadora-coste-vivienda': [
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Gastos de Compraventa', description: 'ITP, notaría y registro' },
    { url: '/orientador-alquiler-vs-compra/', icon: '⚖️', name: 'Alquiler vs Compra', description: 'Compara opciones' },
    { url: '/calculadora-gasto-energetico/', icon: '💡', name: 'Gasto Energético', description: 'Coste de electrodomésticos' },
  ],

  // INVERSIÓN INMOBILIARIA
  'calculadora-rentabilidad-alquiler': inversionInmobiliariaApps.filter(a => a.url !== '/calculadora-rentabilidad-alquiler/'),
  'calculadora-gastos-comunidad': [
    { url: '/calculadora-rentabilidad-alquiler/', icon: '🏘️', name: 'Rentabilidad Alquiler', description: 'ROI, cash flow y payback' },
    { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Gastos de Compraventa', description: 'ITP, notaría y registro' },
    { url: '/estimador-coste-vivienda/', icon: '🏠', name: 'Coste Real Vivienda', description: 'Gasto mensual total del hogar' },
    { url: '/orientador-alquiler-vs-compra/', icon: '⚖️', name: 'Alquiler vs Compra', description: 'Análisis financiero completo' },
  ],

  // FINANZAS - PERSONALES
  'control-gastos': finanzasPersonalesApps.filter(a => a.url !== '/control-gastos/'),
  'calculadora-suscripciones': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-suscripciones/'),
  'calculadora-roommates': finanzasPersonalesApps.filter(a => a.url !== '/calculadora-roommates/'),
  'calculadora-jubilacion': finanzasPersonalesApps.filter(a => a.url !== '/planificador-ahorro-jubilacion/'),
  'calculadora-fondo-emergencia': finanzasPersonalesApps.filter(a => a.url !== '/estimador-fondo-emergencia/'),
  'calculadora-regla-50-30-20': finanzasPersonalesApps.filter(a => a.url !== '/orientador-regla-50-30-20/'),
  'calculadora-fire': [...finanzasPersonalesApps.filter(a => a.url !== '/estimador-fire/').slice(0, 2), ...finanzasInversionApps.slice(0, 2)],
  'calculadora-coste-plazos': finanzasPersonalesApps.filter(a => a.url !== '/estimador-coste-plazos/').slice(0, 4),
  'calculadora-deuda': finanzasPersonalesApps.filter(a => a.url !== '/estimador-deuda/').slice(0, 4),

  // VISUALIZADORES
  'visualizador-fuerzas-invisibles': [
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-probabilidad/', icon: '🎲', name: 'Probabilidad', description: 'Simulaciones interactivas' },
    { url: '/visualizador-funciones-mundo/', icon: '📈', name: 'Funciones del Mundo', description: '4 funciones fundamentales' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
  ],
  'visualizador-escala-universo': [
    { url: '/visualizador-fuerzas-invisibles/', icon: '🌍', name: 'Fuerzas Invisibles', description: 'Física del día a día' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras fascinantes del ADN' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
  ],
  'visualizador-oferta-demanda': [
    { url: '/visualizador-como-funciona-banco/', icon: '🏦', name: 'Cómo Funciona un Banco', description: 'Sistema bancario visual' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'A dónde va tu dinero' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo por compra' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena global de producción' },
  ],
  'visualizador-viaje-comida': [
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma humano' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'Huella de lo que Comes', description: 'Impacto ambiental alimentos' },
    { url: '/calculadora-macros/', icon: '🥗', name: 'Calculadora Macros', description: 'Proteínas, grasas y carbohidratos' },
  ],
  'visualizador-adn-numeros': [
    { url: '/visualizador-viaje-comida/', icon: '🍽️', name: 'El Viaje de tu Comida', description: 'Sistema digestivo visual' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Salud por décadas' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales' },
  ],
  'visualizador-historia-reloj': [
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
    { url: '/visualizador-mapa-tiempo/', icon: '🗺️', name: 'El Mapa de tu Tiempo', description: 'En qué gastas tu vida' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales' },
  ],
  'visualizador-origen-camiseta': [
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'Huella de lo que Comes', description: 'Impacto ambiental' },
    { url: '/visualizador-oferta-demanda/', icon: '📊', name: 'Oferta y Demanda', description: 'Por qué suben los precios' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo por compra' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales' },
  ],
  'visualizador-funciones-mundo': [
    { url: '/visualizador-probabilidad/', icon: '🎲', name: 'Probabilidad', description: 'Simulaciones interactivas' },
    { url: '/algebra-ecuaciones/', icon: '🧮', name: 'Álgebra y Ecuaciones', description: 'Resuelve ecuaciones' },
    { url: '/visualizador-dinero-y-tiempo/', icon: '⏳', name: 'El Dinero y el Tiempo', description: 'Interés compuesto visual' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
  ],
  'visualizador-probabilidad': [
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas visuales' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
    { url: '/visualizador-como-funciona-banco/', icon: '🏦', name: 'Cómo Funciona un Banco', description: 'Sistema bancario visual' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
  ],
  'visualizador-como-funciona-banco': [
    { url: '/visualizador-dinero-y-tiempo/', icon: '⏳', name: 'El Dinero y el Tiempo', description: 'Interés compuesto e inflación' },
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'De bruto a neto visual' },
    { url: '/estimador-hipoteca/', icon: '🏠', name: 'Estimador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'A dónde va tu dinero' },
  ],
  'visualizador-internet-60-segundos': [
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
    { url: '/test-madurez-digital/', icon: '📱', name: 'Test Madurez Digital', description: 'Evalúa tu nivel digital' },
  ],
  'visualizador-peso-decisiones': [
    { url: '/visualizador-mapa-tiempo/', icon: '🗺️', name: 'El Mapa de tu Tiempo', description: 'En qué gastas tu vida' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo por compra' },
    { url: '/visualizador-dinero-y-tiempo/', icon: '⏳', name: 'El Dinero y el Tiempo', description: 'Interés compuesto e inflación' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
  ],
  'visualizador-mapa-dinero-mensual': [
    { url: '/control-gastos/', icon: '💳', name: 'Control de Gastos', description: 'Gestiona tu presupuesto' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Precios en horas de trabajo' },
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'De bruto a neto' },
    { url: '/visualizador-factura-electrica/', icon: '💡', name: 'Tu Electricidad al Desnudo', description: 'Factura de la luz explicada' },
  ],
  'visualizador-mundo-100-personas': [
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas visuales' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'La Huella de lo que Comes', description: 'Impacto ambiental alimentos' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
  ],
  'visualizador-peso-numeros': [
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales fascinantes' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'A dónde va tu dinero' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Precios en horas de trabajo' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
  ],
  'visualizador-escalas-tiempo': [
    { url: '/visualizador-mapa-tiempo/', icon: '🗺️', name: 'El Mapa de tu Tiempo', description: 'En qué gastas tu vida' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'La Huella de lo que Comes', description: 'Impacto ambiental por alimento' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
  ],
  'visualizador-factura-electrica': [
    { url: '/visualizador-anatomia-nomina/', icon: '📄', name: 'Anatomía de una Nómina', description: 'Cada línea de tu nómina explicada' },
    { url: '/calculadora-suscripciones/', icon: '📱', name: 'Control Suscripciones', description: 'Gastos recurrentes' },
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'De bruto a neto visual' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'A dónde va tu dinero' },
  ],
  'visualizador-huella-alimentos': [
    { url: '/calculadora-macros/', icon: '🥗', name: 'Calculadora Macros', description: 'Proteínas, grasas y carbohidratos' },
    { url: '/calculadora-huella-carbono/', icon: '🌱', name: 'Huella de Carbono', description: 'Tu huella personal completa' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Salud por décadas' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo por compra' },
  ],
  'visualizador-sesgos-cognitivos': [
    { url: '/diagnostico-pensamiento-critico/', icon: '🎯', name: 'Pensamiento Crítico', description: 'Evalúa tu capacidad analítica' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Precios en horas de trabajo' },
    { url: '/visualizador-mapa-tiempo/', icon: '🗺️', name: 'El Mapa de tu Tiempo', description: 'En qué gastas tu vida' },
    { url: '/test-sindrome-impostor/', icon: '🎭', name: 'Test Síndrome Impostor', description: 'Detecta si lo padeces' },
  ],
  'visualizador-mapa-tiempo': [
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Precios en horas de trabajo' },
    { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Técnica de productividad' },
    { url: '/time-tracker/', icon: '⏱️', name: 'Time Tracker', description: 'Controla tu tiempo' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
  ],
  'visualizador-jubilacion-perspectiva': [
    { url: '/simulador-jubilacion-publica/', icon: '🏤', name: 'Simulador Jubilación', description: 'Calcula tu pensión estimada' },
    { url: '/planificador-ahorro-jubilacion/', icon: '💹', name: 'Planificador Ahorro', description: 'Brecha y plan de pensiones' },
    { url: '/visualizador-dinero-y-tiempo/', icon: '⏳', name: 'El Dinero y el Tiempo', description: 'Interés compuesto e inflación' },
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'De bruto a neto visual' },
  ],
  'visualizador-precio-real-cosas': [
    { url: '/control-gastos/', icon: '💳', name: 'Control de Gastos', description: 'Gestiona tu presupuesto' },
    { url: '/calculadora-suscripciones/', icon: '📱', name: 'Control Suscripciones', description: 'Gastos recurrentes' },
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'De bruto a neto visual' },
    { url: '/visualizador-dinero-y-tiempo/', icon: '⏳', name: 'El Dinero y el Tiempo', description: 'Inflación e interés compuesto' },
  ],
  'visualizador-envejecimiento-cuerpo': [
    { url: '/orientador-imc/', icon: '⚖️', name: 'Calculadora IMC', description: 'Índice de masa corporal' },
    { url: '/test-fragilidad/', icon: '🩺', name: 'Test de Fragilidad', description: 'Escala FRAIL validada' },
    { url: '/calculadora-macros/', icon: '🥗', name: 'Calculadora Macros', description: 'Proteínas, grasas y carbohidratos' },
    { url: '/test-habitos-saludables/', icon: '💚', name: 'Test Hábitos Saludables', description: 'Evalúa tu estilo de vida' },
  ],
  'visualizador-sistemas-equilibrio': [
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'Neuronas, sinapsis, neurotransmisores' },
    { url: '/visualizador-como-funciona-el-dolor/', icon: '⚡', name: 'Cómo Funciona el Dolor', description: 'Nocicepción y tipos de dolor' },
    { url: '/test-fragilidad/', icon: '🩺', name: 'Test de Fragilidad', description: 'Escala FRAIL validada' },
  ],
  'visualizador-microbioma': [
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Defensa del organismo' },
    { url: '/visualizador-digestion-nutrientes/', icon: '🍎', name: 'Digestión y Nutrientes', description: 'De la comida a la célula' },
    { url: '/visualizador-inflamacion/', icon: '🔥', name: 'La Inflamación', description: 'Aliada y enemiga del cuerpo' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
  ],
  'visualizador-como-funciona-el-dolor': [
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'Neuronas, sinapsis, neurotransmisores' },
    { url: '/visualizador-inflamacion/', icon: '🔥', name: 'La Inflamación', description: 'Aliada y enemiga del cuerpo' },
    { url: '/visualizador-sistemas-equilibrio/', icon: '⚖️', name: 'Sistemas del Equilibrio', description: 'Vestibular, visual, propioceptivo' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
  ],
  'visualizador-inflamacion': [
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Defensa del organismo' },
    { url: '/visualizador-microbioma/', icon: '🦠', name: 'El Microbioma', description: 'Billones de aliados en tu interior' },
    { url: '/visualizador-como-funciona-el-dolor/', icon: '⚡', name: 'Cómo Funciona el Dolor', description: 'Nocicepción y tipos de dolor' },
    { url: '/visualizador-vacunas/', icon: '💉', name: 'Cómo Funcionan las Vacunas', description: 'Inmunidad activa y pasiva' },
  ],
  'visualizador-sistema-linfatico': [
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Defensa del organismo' },
    { url: '/visualizador-microbioma/', icon: '🦠', name: 'El Microbioma', description: 'Billones de aliados en tu interior' },
    { url: '/visualizador-inflamacion/', icon: '🔥', name: 'La Inflamación', description: 'Aliada y enemiga del cuerpo' },
    { url: '/visualizador-sangre-componentes/', icon: '🩸', name: 'Componentes de la Sangre', description: 'Plasma, glóbulos y plaquetas' },
  ],
  'visualizador-osteoporosis': [
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Hormonas, glándulas, feedback' },
    { url: '/visualizador-digestion-nutrientes/', icon: '🍎', name: 'Digestión y Nutrientes', description: 'Calcio, vitaminas y metabolismo' },
    { url: '/test-fragilidad/', icon: '🩺', name: 'Test de Fragilidad', description: 'Escala FRAIL validada' },
  ],
  'visualizador-hipertension': [
    { url: '/visualizador-sistemas-circulatorios/', icon: '❤️', name: 'Sistemas Circulatorios', description: 'Cómo circula la sangre' },
    { url: '/visualizador-inflamacion/', icon: '🔥', name: 'La Inflamación', description: 'Aterosclerosis y daño vascular' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
    { url: '/visualizador-osteoporosis/', icon: '🦴', name: 'Osteoporosis', description: 'Remodelado óseo y densidad' },
  ],
  'visualizador-viaje-impuestos': [
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuánto pagas de renta' },
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'Cascada bruto a neto' },
    { url: '/visualizador-anatomia-nomina/', icon: '📄', name: 'Anatomía de una Nómina', description: 'Cada línea explicada' },
    { url: '/visualizador-dinero-y-tiempo/', icon: '⏳', name: 'El Dinero y el Tiempo', description: 'Hipoteca, inflación, interés compuesto' },
  ],
  'visualizador-anatomia-nomina': [
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'Cascada bruto a neto' },
    { url: '/estimador-sueldo-neto/', icon: '🧮', name: 'Calculadora Sueldo Neto', description: 'Calcula tu neto exacto' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuota orientativa de tu renta' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Cuota Autónomo', description: 'Si eres autónomo, tu cuota RETA' },
  ],
  'visualizador-sueldo-neto': [
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuota orientativa de tu renta' },
    { url: '/estimador-sueldo-neto/', icon: '💶', name: 'Calculadora Sueldo Neto', description: 'Bruto a neto con IRPF y SS' },
    { url: '/visualizador-dinero-y-tiempo/', icon: '⏳', name: 'El Dinero y el Tiempo', description: 'Hipoteca, interés compuesto, inflación' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Cuota Autónomo', description: 'Estimador cuota RETA' },
  ],
  'visualizador-dinero-y-tiempo': [
    { url: '/estimador-hipoteca/', icon: '🏠', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/estimador-interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Calcula con tus datos reales' },
    { url: '/estimador-inflacion/', icon: '💸', name: 'Estimador Inflación', description: 'Datos históricos del INE' },
    { url: '/amortizacion-hipoteca/', icon: '💰', name: 'Amortización Hipoteca', description: 'Reducir cuota vs plazo' },
  ],
  'visualizador-coste-sanidad': [
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Qué Pasa Cuando Duermes', description: 'Ciencia del sueño' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'A dónde va tu dinero' },
  ],
  'visualizador-agua-virtual': [
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'Huella de lo que Comes', description: 'Impacto ambiental alimentos' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena global de producción' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
  ],
  'visualizador-historia-dinero': [
    { url: '/visualizador-como-funciona-banco/', icon: '🏦', name: 'Cómo Funciona un Banco', description: 'Sistema bancario visual' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'A dónde va tu dinero' },
    { url: '/visualizador-oferta-demanda/', icon: '📊', name: 'Oferta y Demanda', description: 'Por qué suben los precios' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
  ],
  'visualizador-sistema-electoral': [
    { url: '/visualizador-proceso-legislativo/', icon: '📜', name: 'El Viaje de una Ley', description: 'Cómo se hace una ley en España' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales' },
    { url: '/visualizador-peso-decisiones/', icon: '⚖️', name: 'Cuánto Pesa una Decisión', description: 'Impacto acumulado' },
  ],
  'visualizador-idiomas-mundo': [
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
    { url: '/visualizador-historia-reloj/', icon: '🕐', name: 'Historia en un Reloj', description: '300.000 años en 24 horas' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena global' },
  ],
  'visualizador-ciclos-sueno': [
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
    { url: '/visualizador-coste-sanidad/', icon: '🏥', name: 'Lo que Cuesta Enfermarse', description: 'Sanidad pública vs privada' },
    { url: '/visualizador-mapa-tiempo/', icon: '🗺️', name: 'El Mapa de tu Tiempo', description: 'Las 700.000 horas de tu vida' },
    { url: '/visualizador-peso-decisiones/', icon: '⚖️', name: 'Cuánto Pesa una Decisión', description: 'Impacto acumulado' },
  ],
  'visualizador-ciudad': [
    { url: '/visualizador-factura-electrica/', icon: '💡', name: 'Tu Electricidad al Desnudo', description: 'Anatomía de la factura' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'Presupuestos del Estado' },
    { url: '/visualizador-agua-virtual/', icon: '💧', name: 'Agua que No Ves', description: 'Huella hídrica invisible' },
    { url: '/visualizador-internet-60-segundos/', icon: '🌐', name: 'Internet en 60 Segundos', description: 'El viaje de tus datos' },
  ],
  'visualizador-desarrollo-farmaco': [
    { url: '/visualizador-coste-sanidad/', icon: '🏥', name: 'Lo que Cuesta Enfermarse', description: 'Sanidad pública vs privada' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
    { url: '/visualizador-viaje-comida/', icon: '🍽️', name: 'El Viaje de tu Comida', description: 'Sistema digestivo' },
  ],
  'visualizador-proceso-legislativo': [
    { url: '/visualizador-sistema-electoral/', icon: '🗳️', name: 'Cómo Funciona una Elección', description: 'Sistemas electorales' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'Presupuestos del Estado' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
  ],
  'visualizador-vida-estrella': [
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma humano' },
  ],
  'visualizador-vacunas': [
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos fascinantes del cuerpo' },
    { url: '/visualizador-desarrollo-farmaco/', icon: '💊', name: 'Cómo se Descubre un Medicamento', description: 'Del laboratorio a la farmacia' },
    { url: '/visualizador-coste-sanidad/', icon: '🏥', name: 'Lo que Cuesta Enfermarse', description: 'Sanidad pública vs privada' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales' },
  ],
  'visualizador-viaje-basura': [
    { url: '/visualizador-agua-virtual/', icon: '💧', name: 'Cuánta Agua Gastas sin Saberlo', description: 'Huella hídrica invisible' },
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'Huella de lo que Comes', description: 'Impacto ambiental' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Efecto invernadero y calentamiento' },
    { url: '/visualizador-ciudad/', icon: '🏙️', name: 'Anatomía de una Ciudad', description: 'Infraestructura urbana' },
  ],
  'visualizador-anatomia-smartphone': [
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena global de producción' },
    { url: '/visualizador-internet-60-segundos/', icon: '🌐', name: 'Internet en 60 Segundos', description: 'El viaje de tus datos' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo por compra' },
    { url: '/visualizador-viaje-basura/', icon: '♻️', name: 'El Viaje de tu Basura', description: 'Reciclaje y degradación' },
  ],
  'visualizador-cuerpo-numeros': [
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Cómo Envejece tu Cuerpo', description: 'Tu cuerpo década a década' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma humano' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Qué Pasa Cuando Duermes', description: 'Ciencia del sueño' },
    { url: '/visualizador-vacunas/', icon: '💉', name: 'Cómo Funciona una Vacuna', description: 'Sistema inmune visual' },
  ],
  'visualizador-matematicas-musica': [
    { url: '/visualizador-probabilidad/', icon: '🎲', name: 'Probabilidad', description: 'Simulaciones interactivas' },
    { url: '/visualizador-funciones-mundo/', icon: '📈', name: 'Funciones del Mundo', description: '4 funciones fundamentales' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
  ],
  'visualizador-construccion-edificio': [
    { url: '/visualizador-ciudad/', icon: '🏙️', name: 'Anatomía de una Ciudad', description: 'Infraestructura urbana' },
    { url: '/visualizador-factura-electrica/', icon: '💡', name: 'Tu Electricidad al Desnudo', description: 'Anatomía de la factura' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo por compra' },
    { url: '/estimador-hipoteca/', icon: '🏠', name: 'Estimador Hipoteca', description: 'Calcula tu cuota mensual' },
  ],
  'visualizador-historia-escritura': [
    { url: '/visualizador-historia-dinero/', icon: '🪙', name: 'La Evolución del Dinero', description: 'Del trueque al bitcoin' },
    { url: '/visualizador-historia-reloj/', icon: '🕐', name: 'Historia en un Reloj', description: '300.000 años en 24 horas' },
    { url: '/visualizador-idiomas-mundo/', icon: '🗣️', name: 'El Mapa de los Idiomas', description: 'Familias lingüísticas' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
  ],
  'visualizador-anatomia-vuelo': [
    { url: '/visualizador-fuerzas-invisibles/', icon: '🌍', name: 'Fuerzas Invisibles', description: 'Física del día a día' },
    { url: '/visualizador-anatomia-smartphone/', icon: '📱', name: 'Anatomía de un Smartphone', description: 'Lo que hay dentro' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Corrientes y calentamiento' },
    { url: '/visualizador-mapa-especias/', icon: '🌶️', name: 'El Mapa de las Especias', description: 'Rutas comerciales históricas' },
  ],
  'visualizador-mapa-especias': [
    { url: '/visualizador-historia-dinero/', icon: '🪙', name: 'La Evolución del Dinero', description: 'Del trueque al bitcoin' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena global' },
    { url: '/visualizador-historia-escritura/', icon: '✍️', name: 'Evolución de la Escritura', description: '5.000 años de escritura' },
    { url: '/visualizador-idiomas-mundo/', icon: '🗣️', name: 'El Mapa de los Idiomas', description: 'Familias lingüísticas' },
  ],
  'visualizador-clima': [
    { url: '/visualizador-agua-virtual/', icon: '💧', name: 'Cuánta Agua Gastas sin Saberlo', description: 'Huella hídrica' },
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'Huella de lo que Comes', description: 'Impacto ambiental' },
    { url: '/visualizador-viaje-basura/', icon: '♻️', name: 'El Viaje de tu Basura', description: 'Reciclaje y degradación' },
    { url: '/visualizador-oceano/', icon: '🌊', name: 'Los Números del Océano', description: 'Regulador del clima' },
  ],
  'visualizador-produccion-energia': [
    { url: '/visualizador-factura-electrica/', icon: '💡', name: 'Tu Electricidad al Desnudo', description: 'Anatomía de la factura' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Efecto invernadero' },
    { url: '/visualizador-ciudad/', icon: '🏙️', name: 'Anatomía de una Ciudad', description: 'Infraestructura urbana' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'Presupuestos del Estado' },
  ],
  'visualizador-oceano': [
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Corrientes y calentamiento' },
    { url: '/visualizador-agua-virtual/', icon: '💧', name: 'Cuánta Agua Gastas sin Saberlo', description: 'Huella hídrica' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-viaje-basura/', icon: '♻️', name: 'El Viaje de tu Basura', description: 'Plástico y reciclaje' },
  ],
  'visualizador-cerebro': [
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Cómo tu cerebro te engaña' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos fascinantes' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Qué Pasa Cuando Duermes', description: 'Ciencia del sueño' },
    { url: '/visualizador-peso-decisiones/', icon: '⚖️', name: 'Cuánto Pesa una Decisión', description: 'Impacto acumulado' },
  ],
  'visualizador-fibonacci-naturaleza': [
    { url: '/visualizador-matematicas-musica/', icon: '🎵', name: 'Los Números de la Música', description: 'Matemáticas y arte' },
    { url: '/visualizador-funciones-mundo/', icon: '📈', name: 'Funciones del Mundo', description: '4 funciones fundamentales' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
  ],
  'visualizador-sistema-solar': [
    { url: '/visualizador-vida-estrella/', icon: '⭐', name: 'La Vida de una Estrella', description: 'Evolución estelar' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-escalas-tiempo/', icon: '⏳', name: 'Cuánto Tarda el Mundo', description: 'Escalas temporales' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
  ],
  'visualizador-cadena-alimentaria': [
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'Huella de lo que Comes', description: 'Impacto ambiental' },
    { url: '/visualizador-agua-virtual/', icon: '💧', name: 'Cuánta Agua Gastas sin Saberlo', description: 'Huella hídrica' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena global' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo' },
  ],
  'visualizador-pantallas': [
    { url: '/visualizador-anatomia-smartphone/', icon: '📱', name: 'Anatomía de un Smartphone', description: 'Lo que hay dentro' },
    { url: '/visualizador-internet-60-segundos/', icon: '🌐', name: 'Internet en 60 Segundos', description: 'El viaje de tus datos' },
    { url: '/visualizador-gps/', icon: '📡', name: 'Cómo Funciona el GPS', description: 'Satélites y trilateración' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Qué Pasa Cuando Duermes', description: 'Luz azul y sueño' },
  ],
  'visualizador-viaje-paquete': [
    { url: '/visualizador-anatomia-smartphone/', icon: '📱', name: 'Anatomía de un Smartphone', description: 'Lo que hay dentro' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena global' },
    { url: '/visualizador-ciudad/', icon: '🏙️', name: 'Anatomía de una Ciudad', description: 'Infraestructura urbana' },
    { url: '/visualizador-viaje-basura/', icon: '♻️', name: 'El Viaje de tu Basura', description: 'Reciclaje y degradación' },
  ],
  'visualizador-tabla-periodica': [
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos fascinantes' },
    { url: '/visualizador-anatomia-smartphone/', icon: '📱', name: 'Anatomía de un Smartphone', description: 'Minerales en tu móvil' },
    { url: '/visualizador-vida-estrella/', icon: '⭐', name: 'La Vida de una Estrella', description: 'Somos polvo de estrellas' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
  ],
  'visualizador-gps': [
    { url: '/visualizador-anatomia-vuelo/', icon: '✈️', name: 'Anatomía de un Vuelo', description: 'Cómo vuela un avión' },
    { url: '/visualizador-sistema-solar/', icon: '🪐', name: 'El Sistema Solar', description: '8 planetas en números' },
    { url: '/visualizador-internet-60-segundos/', icon: '🌐', name: 'Internet en 60 Segundos', description: 'El viaje de tus datos' },
    { url: '/visualizador-pantallas/', icon: '🖥️', name: 'Cómo Funciona una Pantalla', description: 'Píxeles y resoluciones' },
  ],
  'visualizador-como-funciona-wifi': [
    { url: '/visualizador-internet-60-segundos/', icon: '🌐', name: 'Internet en 60 Segundos', description: 'El viaje de tus datos' },
    { url: '/visualizador-gps/', icon: '📡', name: 'Cómo Funciona el GPS', description: 'Satélites y trilateración' },
    { url: '/visualizador-pantallas/', icon: '🖥️', name: 'Cómo Funciona una Pantalla', description: 'Píxeles y resoluciones' },
    { url: '/visualizador-anatomia-smartphone/', icon: '📱', name: 'Anatomía de un Smartphone', description: 'Lo que hay dentro' },
  ],
  'visualizador-matrices': [
    { url: '/visualizador-funciones-mundo/', icon: '📈', name: 'Funciones del Mundo', description: '4 funciones fundamentales' },
    { url: '/visualizador-fibonacci-naturaleza/', icon: '🌻', name: 'Fibonacci en la Naturaleza', description: 'La secuencia áurea' },
    { url: '/visualizador-probabilidad/', icon: '🎲', name: 'Probabilidad en la Vida', description: 'Azar y decisiones' },
    { url: '/visualizador-peso-numeros/', icon: '🔢', name: 'El Peso de los Números', description: 'Escalas numéricas' },
  ],
  'visualizador-reacciones-quimicas': [
    { url: '/visualizador-tabla-periodica/', icon: '🧪', name: 'Tabla Periódica Visual', description: 'Elementos interactivos' },
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'De la luz a la vida' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
  ],
  'visualizador-celula': [
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'De la luz a la vida' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
    { url: '/visualizador-cerebro/', icon: '🧠', name: 'Cómo Piensa tu Cerebro', description: '86.000 millones de neuronas' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos fascinantes' },
  ],
  'visualizador-fotosintesis': [
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Átomos que se reordenan' },
    { url: '/visualizador-agua-virtual/', icon: '💧', name: 'Cuánta Agua Gastas sin Saberlo', description: 'Huella hídrica' },
    { url: '/visualizador-cadena-alimentaria/', icon: '🌾', name: 'De la Granja a tu Mesa', description: 'Cadena alimentaria' },
  ],

  'visualizador-leyes-newton': [
    { url: '/visualizador-fuerzas-invisibles/', icon: '🌍', name: 'Fuerzas Invisibles', description: 'Física del día a día' },
    { url: '/visualizador-optica/', icon: '💡', name: 'Óptica', description: 'El viaje de la luz' },
    { url: '/visualizador-estados-materia/', icon: '🧊', name: 'Estados de la Materia', description: 'Sólido, líquido, gas, plasma' },
    { url: '/visualizador-matrices/', icon: '🔢', name: 'Matrices', description: 'Transformaciones 2D' },
  ],
  'visualizador-tabla-periodica-interactiva': [
    { url: '/visualizador-tabla-periodica/', icon: '🧪', name: 'Tabla Periódica Visual', description: 'Elementos interactivos' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Átomos que se reordenan' },
    { url: '/visualizador-estados-materia/', icon: '🧊', name: 'Estados de la Materia', description: 'Sólido, líquido, gas, plasma' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
  ],
  'visualizador-optica': [
    { url: '/visualizador-leyes-newton/', icon: '🍎', name: 'Leyes de Newton', description: 'Las 3 leyes de la física' },
    { url: '/visualizador-pantallas/', icon: '🖥️', name: 'Cómo Funciona una Pantalla', description: 'Píxeles y resoluciones' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-como-funciona-wifi/', icon: '📶', name: 'Cómo Funciona el WiFi', description: 'Ondas y frecuencias' },
  ],
  'visualizador-estados-materia': [
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Átomos que se reordenan' },
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🧪', name: 'Tendencias Tabla Periódica', description: 'Mapas de calor' },
    { url: '/visualizador-leyes-newton/', icon: '🍎', name: 'Leyes de Newton', description: 'Las 3 leyes de la física' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
  ],
  'visualizador-tectonica-placas': [
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Calentamiento global' },
    { url: '/visualizador-oceano/', icon: '🌊', name: 'Los Secretos del Océano', description: '71% de la Tierra' },
    { url: '/visualizador-sistema-solar/', icon: '🪐', name: 'El Sistema Solar', description: '8 planetas en números' },
  ],
  'visualizador-mitosis-meiosis': [
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
    { url: '/simulador-genetica/', icon: '🧬', name: 'Genética Mendeliana', description: 'Cruces y Punnett' },
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'De la luz a la vida' },
  ],
  'visualizador-capas-tierra': [
    { url: '/visualizador-tectonica-placas/', icon: '🌍', name: 'Tectónica de Placas', description: 'Terremotos y volcanes' },
    { url: '/visualizador-tipos-rocas/', icon: '🪨', name: 'Tipos de Rocas', description: 'Ciclo de las rocas' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Atmósfera y calentamiento' },
  ],
  'visualizador-tipos-rocas': [
    { url: '/visualizador-capas-tierra/', icon: '🌎', name: 'Capas de la Tierra', description: 'Del suelo al núcleo' },
    { url: '/visualizador-tectonica-placas/', icon: '🌍', name: 'Tectónica de Placas', description: 'Terremotos y volcanes' },
    { url: '/visualizador-tabla-periodica/', icon: '🧪', name: 'Tabla Periódica Visual', description: 'Elementos interactivos' },
    { url: '/visualizador-estados-materia/', icon: '🧊', name: 'Estados de la Materia', description: 'Sólido, líquido, gas, plasma' },
  ],
  'visualizador-arbol-vida': [
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
    { url: '/visualizador-mitosis-meiosis/', icon: '🧬', name: 'Mitosis y Meiosis', description: 'División celular' },
    { url: '/visualizador-cerebro/', icon: '🧠', name: 'Cómo Piensa tu Cerebro', description: '86.000 millones de neuronas' },
  ],
  'visualizador-anatomia-flor': [
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'De la luz a la vida' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Célula vegetal' },
    { url: '/visualizador-cadena-alimentaria/', icon: '🌾', name: 'De la Granja a tu Mesa', description: 'Cadena alimentaria' },
    { url: '/visualizador-arbol-vida/', icon: '🌳', name: 'El Árbol de la Vida', description: 'Clasificación animal' },
  ],
  'visualizador-ciclo-agua': [
    { url: '/visualizador-oceano/', icon: '🌊', name: 'Los Secretos del Océano', description: '71% de la Tierra' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Atmósfera y calentamiento' },
    { url: '/visualizador-agua-virtual/', icon: '💧', name: 'Cuánta Agua Gastas sin Saberlo', description: 'Huella hídrica' },
    { url: '/visualizador-capas-tierra/', icon: '🌎', name: 'Capas de la Tierra', description: 'Del suelo al núcleo' },
  ],
  'visualizador-respiracion-celular': [
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'El proceso inverso' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
    { url: '/visualizador-mitosis-meiosis/', icon: '🧬', name: 'Mitosis y Meiosis', description: 'División celular' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Átomos que se reordenan' },
  ],
  'visualizador-metamorfosis': [
    { url: '/visualizador-arbol-vida/', icon: '🌳', name: 'El Árbol de la Vida', description: 'Clasificación animal' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
    { url: '/visualizador-ecosistema/', icon: '🌿', name: 'Ecosistemas', description: 'Flujo de energía' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
  ],
  'visualizador-transporte-plantas': [
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'De la luz a la vida' },
    { url: '/visualizador-anatomia-flor/', icon: '🌸', name: 'Anatomía de una Flor', description: 'Polinización y frutos' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'El Ciclo del Agua', description: 'Viaje infinito de cada gota' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Célula vegetal' },
  ],
  'visualizador-ecosistema': [
    { url: '/visualizador-cadena-alimentaria/', icon: '🌾', name: 'De la Granja a tu Mesa', description: 'Cadena alimentaria' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'El Ciclo del Agua', description: 'Ciclo hidrológico' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Atmósfera y calentamiento' },
    { url: '/visualizador-arbol-vida/', icon: '🌳', name: 'El Árbol de la Vida', description: 'Clasificación animal' },
  ],
  'visualizador-fosiles-tiempo-geologico': [
    { url: '/visualizador-capas-tierra/', icon: '🌎', name: 'Capas de la Tierra', description: 'Del suelo al núcleo' },
    { url: '/visualizador-tectonica-placas/', icon: '🌍', name: 'Tectónica de Placas', description: 'Terremotos y volcanes' },
    { url: '/visualizador-tipos-rocas/', icon: '🪨', name: 'Tipos de Rocas', description: 'Ciclo de las rocas' },
    { url: '/visualizador-arbol-vida/', icon: '🌳', name: 'El Árbol de la Vida', description: 'Clasificación animal' },
  ],
  'visualizador-biomoleculas': [
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
    { url: '/visualizador-respiracion-celular/', icon: '⚡', name: 'Respiración Celular', description: 'De glucosa a ATP' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Átomos que se reordenan' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
  ],
  'visualizador-germinacion': [
    { url: '/visualizador-anatomia-flor/', icon: '🌸', name: 'Anatomía de una Flor', description: 'Polinización y frutos' },
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'De la luz a la vida' },
    { url: '/visualizador-transporte-plantas/', icon: '🌱', name: 'Transporte en Plantas', description: 'Xilema y floema' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Célula vegetal' },
  ],
  'visualizador-sistemas-circulatorios': [
    { url: '/visualizador-arbol-vida/', icon: '🌳', name: 'El Árbol de la Vida', description: 'Clasificación animal' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos fascinantes' },
    { url: '/visualizador-cerebro/', icon: '🧠', name: 'Cómo Piensa tu Cerebro', description: '86.000 millones de neuronas' },
    { url: '/visualizador-metamorfosis/', icon: '🦋', name: 'Metamorfosis', description: 'Transformación radical' },
  ],
  'visualizador-enlaces-quimicos': [
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🧪', name: 'Tendencias Tabla Periódica', description: 'Mapas de calor' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Átomos que se reordenan' },
    { url: '/visualizador-estados-materia/', icon: '🧊', name: 'Estados de la Materia', description: 'Sólido, líquido, gas, plasma' },
    { url: '/visualizador-biomoleculas/', icon: '🧪', name: 'Biomoléculas', description: 'Los 4 ingredientes de la vida' },
  ],
  'visualizador-fases-luna-eclipses': [
    { url: '/visualizador-sistema-solar/', icon: '🪐', name: 'El Sistema Solar', description: '8 planetas en números' },
    { url: '/visualizador-vida-estrella/', icon: '⭐', name: 'La Vida de una Estrella', description: 'Evolución estelar' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'El Ciclo del Agua', description: 'Mareas y ciclo hidrológico' },
  ],
  'visualizador-seleccion-natural': [
    { url: '/visualizador-arbol-vida/', icon: '🌳', name: 'El Árbol de la Vida', description: 'Clasificación animal' },
    { url: '/visualizador-adn-numeros/', icon: '🧬', name: 'Tu ADN en Números', description: 'Cifras del genoma' },
    { url: '/visualizador-mitosis-meiosis/', icon: '🧬', name: 'Mitosis y Meiosis', description: 'División celular' },
    { url: '/visualizador-fosiles-tiempo-geologico/', icon: '🦕', name: 'Fósiles y Tiempo Geológico', description: '4.500 Ma de historia' },
  ],
  'visualizador-sistema-inmune': [
    { url: '/visualizador-vacunas/', icon: '💉', name: 'Vacunas', description: 'Historia y calendario' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos fascinantes' },
    { url: '/visualizador-biomoleculas/', icon: '🧪', name: 'Biomoléculas', description: 'Proteínas y anticuerpos' },
  ],
  'visualizador-termodinamica': [
    { url: '/visualizador-estados-materia/', icon: '🧊', name: 'Estados de la Materia', description: 'Sólido, líquido, gas, plasma' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Atmósfera y calentamiento' },
    { url: '/visualizador-produccion-energia/', icon: '⚡', name: 'Producción de Energía', description: 'Fuentes y mix español' },
    { url: '/visualizador-capas-tierra/', icon: '🌎', name: 'Capas de la Tierra', description: 'Convección del manto' },
  ],
  'visualizador-electricidad-domestica': [
    { url: '/visualizador-produccion-energia/', icon: '⚡', name: 'Producción de Energía', description: 'Fuentes y mix español' },
    { url: '/visualizador-factura-electrica/', icon: '💡', name: 'Tu Factura Eléctrica', description: 'Cada concepto explicado' },
    { url: '/visualizador-como-funciona-wifi/', icon: '📡', name: 'Cómo Funciona el WiFi', description: 'Ondas y propagación' },
    { url: '/visualizador-maquinas-simples/', icon: '⚙️', name: 'Máquinas Simples', description: 'Palanca, polea y más' },
  ],
  'visualizador-ph-acidos-bases': [
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Tipos y balanceo' },
    { url: '/visualizador-biomoleculas/', icon: '🧪', name: 'Biomoléculas', description: 'Los 4 ingredientes de la vida' },
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🔬', name: 'Tabla Periódica', description: 'Tendencias y propiedades' },
    { url: '/visualizador-enlaces-quimicos/', icon: '⚛️', name: 'Enlaces Químicos', description: 'Iónico, covalente, metálico' },
  ],
  'visualizador-estaciones-ano': [
    { url: '/visualizador-fases-luna-eclipses/', icon: '🌙', name: 'Fases de la Luna', description: 'Fases, eclipses y mareas' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Atmósfera y calentamiento' },
    { url: '/visualizador-vida-estrella/', icon: '⭐', name: 'La Vida de una Estrella', description: 'Del nacimiento al final' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'El Ciclo del Agua', description: 'Evaporación y precipitación' },
  ],
  'visualizador-maquinas-simples': [
    { url: '/visualizador-leyes-newton/', icon: '🍎', name: 'Leyes de Newton', description: 'Las 3 leyes del movimiento' },
    { url: '/visualizador-electricidad-domestica/', icon: '⚡', name: 'Electricidad Doméstica', description: 'Tu cuadro eléctrico' },
    { url: '/visualizador-construccion-edificio/', icon: '🏗️', name: 'Construcción de un Edificio', description: 'De los cimientos al tejado' },
    { url: '/visualizador-produccion-energia/', icon: '⚡', name: 'Producción de Energía', description: 'Fuentes y mix español' },
  ],
  'visualizador-sonido-ondas': [
    { url: '/visualizador-matematicas-musica/', icon: '🎵', name: 'Matemáticas y Música', description: 'Armonía, escalas y Web Audio' },
    { url: '/visualizador-optica/', icon: '🔍', name: 'Óptica', description: 'Reflexión, refracción, lentes' },
    { url: '/visualizador-leyes-newton/', icon: '🍎', name: 'Leyes de Newton', description: 'Mecánica y movimiento' },
    { url: '/visualizador-electricidad-domestica/', icon: '⚡', name: 'Electricidad Doméstica', description: 'Otra forma de energía en casa' },
  ],
  'visualizador-efecto-invernadero': [
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Atmósfera y calentamiento' },
    { url: '/visualizador-estaciones-ano/', icon: '🌍', name: 'Las Estaciones del Año', description: 'Inclinación y órbita' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'El Ciclo del Agua', description: 'Evaporación y precipitación' },
    { url: '/visualizador-produccion-energia/', icon: '⚡', name: 'Producción de Energía', description: 'Fuentes y mix español' },
  ],
  'visualizador-geometria-fractales': [
    { url: '/visualizador-numeros-primos/', icon: '🔢', name: 'Números Primos', description: 'Criba, patrones y criptografía' },
    { url: '/visualizador-matematicas-musica/', icon: '🎵', name: 'Matemáticas y Música', description: 'Patrones matemáticos en la armonía' },
    { url: '/visualizador-matrices/', icon: '📐', name: 'Matrices', description: 'Operaciones y transformaciones' },
    { url: '/visualizador-optica/', icon: '🔍', name: 'Óptica', description: 'Geometría de la luz' },
  ],
  'visualizador-numeros-primos': [
    { url: '/visualizador-geometria-fractales/', icon: '🔷', name: 'Geometría Fractal', description: 'Sierpinski, Koch, Mandelbrot' },
    { url: '/visualizador-matematicas-musica/', icon: '🎵', name: 'Matemáticas y Música', description: 'Patrones numéricos en armonía' },
    { url: '/visualizador-matrices/', icon: '📐', name: 'Matrices', description: 'Operaciones y transformaciones' },
    { url: '/visualizador-como-funciona-wifi/', icon: '📡', name: 'Cómo Funciona el WiFi', description: 'Criptografía en acción' },
  ],
  'visualizador-sistema-nervioso': [
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Hormonas y feedback' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Orgánulos y funciones' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Defensas del cuerpo' },
    { url: '/visualizador-biomoleculas/', icon: '🧪', name: 'Biomoléculas', description: 'Proteínas y neurotransmisores' },
  ],
  'visualizador-sistema-endocrino': [
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'Neuronas y sinapsis' },
    { url: '/visualizador-digestion-nutrientes/', icon: '🍎', name: 'Digestión y Nutrientes', description: 'Insulina y glucosa en contexto' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos fascinantes' },
    { url: '/visualizador-biomoleculas/', icon: '🧪', name: 'Biomoléculas', description: 'Hormonas son proteínas' },
  ],
  'visualizador-digestion-nutrientes': [
    { url: '/visualizador-viaje-comida/', icon: '🍽️', name: 'El Viaje de tu Comida', description: 'Recorrido anatómico' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Insulina y metabolismo' },
    { url: '/visualizador-biomoleculas/', icon: '🧪', name: 'Biomoléculas', description: 'Carbohidratos, lípidos, proteínas' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos del sistema digestivo' },
  ],
  'visualizador-minerales-gemas': [
    { url: '/visualizador-estructuras-cristalinas/', icon: '🔮', name: 'Estructuras Cristalinas 3D', description: 'Celdas unitarias rotables' },
    { url: '/visualizador-tipos-rocas/', icon: '🪨', name: 'Tipos de Rocas', description: 'Ígneas, sedimentarias, metamórficas' },
    { url: '/visualizador-capas-tierra/', icon: '🌎', name: 'Capas de la Tierra', description: 'De la corteza al núcleo' },
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🔬', name: 'Tabla Periódica', description: 'Elementos que forman minerales' },
  ],
  'visualizador-estructuras-cristalinas': [
    { url: '/visualizador-minerales-gemas/', icon: '💎', name: 'Minerales y Gemas', description: 'Escala de Mohs y piedras preciosas' },
    { url: '/visualizador-enlaces-quimicos/', icon: '⚛️', name: 'Enlaces Químicos', description: 'Iónico, covalente, metálico' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Partículas y orbitales' },
    { url: '/visualizador-tipos-rocas/', icon: '🪨', name: 'Tipos de Rocas', description: 'Ígneas, sedimentarias, metamórficas' },
  ],
  'visualizador-espectro-electromagnetico': [
    { url: '/visualizador-sonido-ondas/', icon: '🔊', name: 'Sonido y Ondas', description: 'Ondas mecánicas vs electromagnéticas' },
    { url: '/visualizador-optica/', icon: '🔍', name: 'Óptica', description: 'La parte visible del espectro' },
    { url: '/visualizador-como-funciona-wifi/', icon: '📡', name: 'Cómo Funciona el WiFi', description: 'Microondas en acción' },
    { url: '/visualizador-efecto-invernadero/', icon: '🌍', name: 'Efecto Invernadero', description: 'Infrarrojo atrapado' },
  ],
  'visualizador-estructura-atomo': [
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🔬', name: 'Tabla Periódica', description: 'Tendencias y propiedades' },
    { url: '/visualizador-enlaces-quimicos/', icon: '⚛️', name: 'Enlaces Químicos', description: 'Cómo se unen los átomos' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Tipos y balanceo' },
    { url: '/visualizador-estructuras-cristalinas/', icon: '🔮', name: 'Estructuras Cristalinas', description: 'Cómo se organizan en sólidos' },
  ],
  'visualizador-cartografia-proyecciones': [
    { url: '/visualizador-estaciones-ano/', icon: '🌍', name: 'Estaciones del Año', description: 'Latitudes e inclinación' },
    { url: '/visualizador-gps/', icon: '📍', name: 'Cómo Funciona el GPS', description: 'Coordenadas en acción' },
    { url: '/visualizador-mundo-100-personas/', icon: '👥', name: 'El Mundo en 100 Personas', description: 'Geografía humana' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
  ],
  'visualizador-enzimas-cuerpo-humano': [
    { url: '/visualizador-digestion-nutrientes/', icon: '🍎', name: 'Digestión y Nutrientes', description: 'Macronutrientes paso a paso' },
    { url: '/visualizador-biomoleculas/', icon: '🧪', name: 'Biomoléculas', description: 'Proteínas, lípidos, carbohidratos' },
    { url: '/visualizador-ph-acidos-bases/', icon: '🧪', name: 'pH: Ácidos y Bases', description: 'La escala que afecta a las enzimas' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Hormonas y regulación' },
  ],
  'visualizador-sangre-componentes': [
    { url: '/visualizador-sistemas-circulatorios/', icon: '❤️', name: 'Sistemas Circulatorios', description: 'Del corazón de 2 al de 4 cámaras' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Glóbulos blancos en acción' },
    { url: '/visualizador-digestion-nutrientes/', icon: '🍎', name: 'Digestión y Nutrientes', description: 'Nutrientes que viajan en sangre' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Datos fascinantes' },
  ],
  'visualizador-adn-codigo-genetico': [
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Donde vive el ADN' },
    { url: '/visualizador-biomoleculas/', icon: '🧪', name: 'Biomoléculas', description: 'Ácidos nucleicos y proteínas' },
    { url: '/visualizador-mitosis-meiosis/', icon: '🧬', name: 'Mitosis y Meiosis', description: 'Cómo se copia el ADN' },
    { url: '/visualizador-seleccion-natural/', icon: '🦎', name: 'Selección Natural', description: 'La evolución depende del ADN' },
  ],
  'visualizador-fenomenos-meteorologicos': [
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'Atmósfera y calentamiento' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'El Ciclo del Agua', description: 'Evaporación y precipitación' },
    { url: '/visualizador-efecto-invernadero/', icon: '🌍', name: 'Efecto Invernadero', description: 'Gases y calentamiento' },
    { url: '/visualizador-estaciones-ano/', icon: '🌍', name: 'Estaciones del Año', description: 'Inclinación y clima' },
  ],
  'visualizador-ojo-humano-vision': [
    { url: '/visualizador-optica/', icon: '🔍', name: 'Óptica', description: 'Reflexión, refracción, lentes' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'Del ojo al cerebro' },
    { url: '/visualizador-espectro-electromagnetico/', icon: '🌈', name: 'Espectro EM', description: 'La luz visible' },
    { url: '/visualizador-oido-equilibrio/', icon: '👂', name: 'Oído y Equilibrio', description: 'Otro sentido complejo' },
  ],
  'visualizador-sistema-respiratorio': [
    { url: '/visualizador-sangre-componentes/', icon: '🩸', name: 'La Sangre', description: 'Hemoglobina transporta O₂' },
    { url: '/visualizador-respiracion-celular/', icon: '⚡', name: 'Respiración Celular', description: 'El O₂ llega a la mitocondria' },
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas', description: 'ATP sintasa usa el O₂' },
    { url: '/visualizador-musculos-movimiento/', icon: '💪', name: 'Músculos', description: 'El diafragma es un músculo' },
  ],
  'visualizador-musculos-movimiento': [
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'La orden que mueve el músculo' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Hormonas y crecimiento muscular' },
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas', description: 'ATP sintasa como combustible' },
    { url: '/visualizador-maquinas-simples/', icon: '⚙️', name: 'Máquinas Simples', description: 'El cuerpo como palanca' },
  ],
  'visualizador-oido-equilibrio': [
    { url: '/visualizador-sonido-ondas/', icon: '🔊', name: 'Sonido y Ondas', description: 'La física de lo que oyes' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'Del oído al cerebro' },
    { url: '/visualizador-ojo-humano-vision/', icon: '👁️', name: 'Ojo y Visión', description: 'Otro sentido complejo' },
    { url: '/visualizador-sangre-componentes/', icon: '🩸', name: 'La Sangre', description: 'Irrigación del oído interno' },
  ],
  'visualizador-ciclo-vida-freelance': [
    { url: '/visualizador-estructura-costes-autonomo/', icon: '💼', name: 'Costes del Autónomo', description: 'De lo que facturas a lo que te queda' },
    { url: '/visualizador-tipos-cliente-freelance/', icon: '🤝', name: 'Tipos de Cliente', description: '6 relaciones comerciales y sus riesgos' },
    { url: '/orientador-tarifa-freelance/', icon: '💶', name: 'Tarifa Freelance', description: 'Calcula tu tarifa por hora' },
    { url: '/mapa-dependencia-clientes/', icon: '📊', name: 'Dependencia de Clientes', description: 'Analiza tu cartera' },
  ],
  'visualizador-estructura-costes-autonomo': [
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'Versión asalariado: bruto a neto' },
    { url: '/visualizador-ciclo-vida-freelance/', icon: '🔄', name: 'Ciclo Vida Freelance', description: 'Las 7 fases de un proyecto' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Cuota Autónomo', description: 'Calcula tu cuota RETA exacta' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Gastos Deducibles', description: 'Qué puedes deducir como autónomo' },
  ],
  'visualizador-tipos-cliente-freelance': [
    { url: '/visualizador-ciclo-vida-freelance/', icon: '🔄', name: 'Ciclo Vida Freelance', description: 'Fases de un proyecto completo' },
    { url: '/mapa-dependencia-clientes/', icon: '📊', name: 'Dependencia de Clientes', description: 'Analiza concentración de ingresos' },
    { url: '/orientador-intereses-demora/', icon: '📄', name: 'Intereses de Demora', description: 'Cuando el cliente no paga' },
    { url: '/comparador-autonomo-vs-sl/', icon: '⚖️', name: 'Autónomo vs SL', description: 'Elige tu forma jurídica' },
  ],
  'test-salud-negocio-freelance': [
    { url: '/visualizador-ciclo-vida-freelance/', icon: '🔄', name: 'Ciclo Vida Freelance', description: 'Las 7 fases de un proyecto' },
    { url: '/visualizador-estructura-costes-autonomo/', icon: '💼', name: 'Costes del Autónomo', description: 'De lo que facturas a lo que queda' },
    { url: '/mapa-dependencia-clientes/', icon: '📊', name: 'Dependencia de Clientes', description: 'Analiza tu cartera' },
    { url: '/orientador-tarifa-freelance/', icon: '💶', name: 'Tarifa Freelance', description: 'Calcula tu tarifa por hora' },
  ],
  'calculadora-precio-por-proyecto': [
    { url: '/orientador-tarifa-freelance/', icon: '💶', name: 'Tarifa Freelance', description: 'Calcula tu tarifa por hora' },
    { url: '/calculadora-presupuestos/', icon: '📋', name: 'Presupuestos', description: 'Gestiona tus presupuestos' },
    { url: '/visualizador-ciclo-vida-freelance/', icon: '🔄', name: 'Ciclo Vida Freelance', description: 'Fases de un proyecto completo' },
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Factura tu proyecto' },
  ],
  'checklist-preparar-verifactu': [
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Emite facturas conformes' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Fechas clave del autónomo' },
    { url: '/asistente-alta-autonomo/', icon: '📋', name: 'Alta Autónomo', description: 'Guía para darte de alta' },
    { url: '/visualizador-estructura-costes-autonomo/', icon: '💼', name: 'Costes del Autónomo', description: 'Tu estructura financiera' },
  ],
  'planificador-vacaciones-autonomo': [
    { url: '/simulador-colchon-emergencia-freelance/', icon: '🛟', name: 'Colchón de Emergencia', description: 'Meses de supervivencia sin ingresos' },
    { url: '/planificador-cashflow/', icon: '💰', name: 'Cash Flow', description: 'Planifica tu flujo de caja' },
    { url: '/visualizador-ciclo-vida-freelance/', icon: '🔄', name: 'Ciclo Vida Freelance', description: 'Fases de un proyecto' },
    { url: '/test-salud-negocio-freelance/', icon: '🩺', name: 'Salud del Negocio', description: 'Evalúa 5 dimensiones' },
  ],
  'simulador-colchon-emergencia-freelance': [
    { url: '/planificador-vacaciones-autonomo/', icon: '🏖️', name: 'Vacaciones Autónomo', description: 'Impacto económico del descanso' },
    { url: '/planificador-cashflow/', icon: '💰', name: 'Cash Flow', description: 'Planifica tu flujo de caja' },
    { url: '/visualizador-estructura-costes-autonomo/', icon: '💼', name: 'Costes del Autónomo', description: 'De lo que facturas a lo que queda' },
    { url: '/calculadora-fondo-emergencia/', icon: '🏦', name: 'Fondo de Emergencia', description: 'Versión general del cálculo' },
  ],
  'planificador-trimestres-freelance': [
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Todas las fechas clave' },
    { url: '/planificador-cashflow/', icon: '💰', name: 'Cash Flow', description: 'Flujo de caja mensual' },
    { url: '/visualizador-estructura-costes-autonomo/', icon: '💼', name: 'Costes del Autónomo', description: 'Estructura financiera completa' },
    { url: '/checklist-preparar-verifactu/', icon: '📋', name: 'Checklist VeriFactu', description: 'Facturación electrónica 2027' },
  ],
  'orientador-diversificacion-clientes': [
    { url: '/mapa-dependencia-clientes/', icon: '📊', name: 'Mapa Dependencia', description: 'Análisis detallado de cartera' },
    { url: '/visualizador-tipos-cliente-freelance/', icon: '🤝', name: 'Tipos de Cliente', description: '6 relaciones comerciales' },
    { url: '/test-salud-negocio-freelance/', icon: '🩺', name: 'Salud del Negocio', description: 'Evalúa 5 dimensiones' },
    { url: '/calculadora-precio-por-proyecto/', icon: '🧮', name: 'Precio por Proyecto', description: 'Cuánto cobrar' },
  ],
  'visualizador-energia-nuclear': [
    { url: '/visualizador-produccion-energia/', icon: '⚡', name: 'Producción de Energía', description: 'Mix energético español y mundial' },
    { url: '/visualizador-efecto-invernadero/', icon: '🌍', name: 'Efecto Invernadero', description: 'CO₂ y calentamiento global' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Protones, neutrones y fisión' },
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌡️', name: 'Tipping Points', description: 'Nuclear vs renovables en la transición' },
  ],
  'visualizador-mercados-financieros': [
    { url: '/visualizador-deuda-publica/', icon: '🏛️', name: 'Deuda Pública', description: 'Bonos soberanos y prima de riesgo' },
    { url: '/simulador-inversion/', icon: '📊', name: 'Simulador de Inversión', description: 'Cuánto crece tu dinero' },
    { url: '/comparador-hipotecas/', icon: '🏦', name: 'Comparador Hipotecas', description: 'Tipos fijo vs variable' },
    { url: '/calculadora-rentabilidad-inversion/', icon: '💹', name: 'Rentabilidad de Inversión', description: 'ROI e interés compuesto' },
  ],
  'visualizador-cambio-climatico-tipping-points': [
    { url: '/visualizador-efecto-invernadero/', icon: '🌍', name: 'Efecto Invernadero', description: 'Gases y calentamiento' },
    { url: '/visualizador-energia-nuclear/', icon: '⚛️', name: 'Energía Nuclear', description: 'Nuclear en la transición energética' },
    { url: '/calculadora-huella-carbono/', icon: '🌱', name: 'Huella de Carbono', description: 'Tu impacto personal' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'Ciclo del Agua', description: 'Cómo cambia el ciclo hidrológico' },
  ],
  'visualizador-deuda-publica': [
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'Cómo se negocian los bonos' },
    { url: '/calculadora-rentabilidad-inversion/', icon: '💹', name: 'Rentabilidad de Inversión', description: 'ROI e interés compuesto' },
    { url: '/simulador-inversion/', icon: '📊', name: 'Simulador de Inversión', description: 'Cuánto rinde tu capital' },
    { url: '/comparador-depositos/', icon: '🏦', name: 'Comparador de Depósitos', description: 'Alternativa a los bonos' },
  ],
  'visualizador-farmacocinetica': [
    { url: '/visualizador-higado/', icon: '🫀', name: 'El Hígado', description: 'Metabolismo hepático y CYP450 en detalle' },
    { url: '/visualizador-rinon-filtracion/', icon: '🫘', name: 'El Riñón', description: 'Excreción renal de fármacos' },
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas', description: 'CYP450 y otras enzimas metabólicas' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Hormonas con cinética similar a fármacos' },
  ],
  'visualizador-cicatrizacion': [
    { url: '/visualizador-piel/', icon: '🧬', name: 'La Piel', description: 'Estructura de los tejidos que cicatrizan' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Neutrófilos y macrófagos en la inflamación' },
    { url: '/visualizador-sangre-componentes/', icon: '🩸', name: 'La Sangre', description: 'Plaquetas y coagulación en hemostasia' },
    { url: '/visualizador-inflamacion/', icon: '🔥', name: 'Inflamación', description: 'Mediadores y fases inflamatorias' },
  ],
  'visualizador-ia-redes-neuronales': [
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'La neurona biológica que inspiró la IA' },
    { url: '/test-madurez-digital/', icon: '🤖', name: 'Test Madurez Digital', description: 'Nivel de digitalización con IA' },
    { url: '/selector-portatil/', icon: '💻', name: 'Selector de Portátil', description: 'Hardware para entrenamiento de modelos' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Física cuántica que inspiró los qubits' },
  ],
  'visualizador-piel': [
    { url: '/visualizador-higado/', icon: '🫀', name: 'El Hígado', description: 'Detoxificación de tóxicos externos' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Células de Langerhans en la piel' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Vitamina D y hormonas' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: '2m² de superficie, 1.5kg de peso' },
  ],
  'visualizador-higado': [
    { url: '/visualizador-rinon-filtracion/', icon: '🫘', name: 'El Riñón', description: 'Filtración final de toxinas' },
    { url: '/visualizador-sangre-componentes/', icon: '🩸', name: 'La Sangre', description: 'Factores de coagulación sintetizados' },
    { url: '/visualizador-digestion-nutrientes/', icon: '🍎', name: 'Digestión y Nutrientes', description: 'Bilis y metabolismo de nutrientes' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Glucagón, insulina y glucemia' },
  ],
  'visualizador-rinon-filtracion': [
    { url: '/visualizador-higado/', icon: '🫀', name: 'El Hígado', description: 'Primer órgano de detoxificación' },
    { url: '/visualizador-sangre-componentes/', icon: '🩸', name: 'La Sangre', description: 'El riñón la filtra continuamente' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Aldosterona, ADH, SRAA' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: '180L filtrados al día' },
  ],
  'visualizador-envejecimiento-celular': [
    { url: '/visualizador-cerebro-emociones/', icon: '🧠', name: 'Cerebro y Emociones', description: 'Neuroplasticidad y envejecimiento cerebral' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Inmunosenescencia y SASP' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫀', name: 'Tu Cuerpo en Números', description: 'Longevidad y límites fisiológicos' },
    { url: '/visualizador-higado/', icon: '🫀', name: 'El Hígado', description: 'Detoxificación y disfunción mitocondrial' },
  ],
  'visualizador-cerebro-emociones': [
    { url: '/visualizador-envejecimiento-celular/', icon: '🔬', name: 'Envejecimiento Celular', description: 'Neuroplasticidad y senescencia neuronal' },
    { url: '/visualizador-sistema-nervioso/', icon: '⚡', name: 'Sistema Nervioso', description: 'Circuitos y transmisión neural' },
    { url: '/visualizador-sistema-endocrino/', icon: '🧬', name: 'Sistema Endocrino', description: 'Cortisol, adrenalina y HPA' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Ciclos del Sueño', description: 'REM y procesamiento emocional' },
  ],
  'visualizador-blockchain': [
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'AES, RSA y SHA-256 que protegen la cadena' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🤖', name: 'IA y Redes Neuronales', description: 'Otra tecnología disruptiva del siglo XXI' },
    { url: '/visualizador-internet-funcionamiento/', icon: '🌐', name: 'Cómo Funciona Internet', description: 'Infraestructura sobre la que opera blockchain' },
    { url: '/simulador-inversion/', icon: '📊', name: 'Simulador de Inversión', description: 'Cripto como activo en cartera' },
  ],
  'visualizador-criptografia': [
    { url: '/visualizador-blockchain/', icon: '⛓️', name: 'Blockchain', description: 'La criptografía que protege la cadena de bloques' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🤖', name: 'IA y Redes Neuronales', description: 'Otra revolución tecnológica paralela' },
    { url: '/visualizador-internet-funcionamiento/', icon: '🌐', name: 'Cómo Funciona Internet', description: 'TLS y HTTPS en acción' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Mecánica cuántica y criptografía cuántica' },
  ],
  'visualizador-tipos-interes-bce': [
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'Cómo reaccionan bonos y bolsa a los tipos' },
    { url: '/visualizador-deuda-publica/', icon: '🏛️', name: 'Deuda Pública', description: 'Bonos soberanos y prima de riesgo' },
    { url: '/comparador-hipotecas/', icon: '🏦', name: 'Comparador Hipotecas', description: 'Impacto real del Euríbor en tu cuota' },
    { url: '/simulador-inversion/', icon: '📊', name: 'Simulador de Inversión', description: 'Renta fija más atractiva con tipos altos' },
  ],
  'visualizador-relatividad-especial': [
    { url: '/visualizador-mecanica-cuantica/', icon: '🔮', name: 'Mecánica Cuántica', description: 'La otra gran revolución de la física del siglo XX' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'El átomo que la relatividad explica' },
    { url: '/visualizador-energia-nuclear/', icon: '☢️', name: 'Energía Nuclear', description: 'E=mc² aplicado a fisión y fusión' },
    { url: '/visualizador-termodinamica/', icon: '🌡️', name: 'Termodinámica', description: 'Física clásica que la relatividad amplía' },
  ],
  'visualizador-mecanica-cuantica': [
    { url: '/visualizador-relatividad-especial/', icon: '⚡', name: 'Relatividad Especial', description: 'La otra revolución de Einstein' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Mecánica cuántica aplicada al átomo' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'Criptografía cuántica y algoritmos post-cuánticos' },
    { url: '/visualizador-computacion-cuantica/', icon: '💻', name: 'Computación Cuántica', description: 'Qubits, puertas y la amenaza al cifrado RSA' },
  ],
  'visualizador-corazon-ciclo-cardiaco': [
    { url: '/visualizador-sistemas-circulatorios/', icon: '❤️', name: 'Sistemas Circulatorios', description: 'Evolución del corazón de 2 a 4 cámaras' },
    { url: '/visualizador-cuerpo-numeros/', icon: '🫁', name: 'Tu Cuerpo en Números', description: '100.000 km de vasos sanguíneos' },
    { url: '/visualizador-cerebro-emociones/', icon: '🧠', name: 'Cerebro y Emociones', description: 'El sistema nervioso que regula el corazón' },
    { url: '/visualizador-piel/', icon: '🧬', name: 'La Piel', description: 'Otro órgano vital del cuerpo humano' },
  ],
  'visualizador-electromagnetismo': [
    { url: '/visualizador-mecanica-cuantica/', icon: '🔮', name: 'Mecánica Cuántica', description: 'La física que explica las cargas eléctricas' },
    { url: '/visualizador-relatividad-especial/', icon: '⚡', name: 'Relatividad Especial', description: 'Einstein y el electromagnetismo' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Cargas eléctricas en el átomo' },
    { url: '/visualizador-energia-nuclear/', icon: '☢️', name: 'Energía Nuclear', description: 'Física de campos aplicada' },
  ],
  'visualizador-computacion-cuantica': [
    { url: '/visualizador-mecanica-cuantica/', icon: '🔮', name: 'Mecánica Cuántica', description: 'Los principios físicos detrás de los qubits' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'Por qué la computación cuántica amenaza RSA' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🤖', name: 'IA y Redes Neuronales', description: 'Otra revolución computacional en curso' },
    { url: '/visualizador-blockchain/', icon: '⛓️', name: 'Blockchain', description: 'Criptografía que también podría verse afectada' },
  ],
  'visualizador-oceanos-corrientes': [
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌡️', name: 'Tipping Points Climáticos', description: 'El colapso del AMOC es un tipping point crítico' },
    { url: '/visualizador-efecto-invernadero/', icon: '🌍', name: 'Efecto Invernadero', description: 'El CO₂ que acidifica los océanos' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'Ciclo del Agua', description: 'Los océanos en el ciclo hidrológico global' },
    { url: '/visualizador-deuda-publica/', icon: '📊', name: 'Deuda Pública', description: 'El coste económico del cambio climático' },
  ],
  'visualizador-llm-funcionamiento': [
    { url: '/visualizador-computacion-cuantica/', icon: '💻', name: 'Computación Cuántica', description: 'La computación cuántica podría acelerar los LLMs' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🧠', name: 'IA y Redes Neuronales', description: 'Las redes que hacen posibles los transformers' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'Cómo se protegen las comunicaciones con los LLMs' },
    { url: '/curso-optimizacion-ia/', icon: '📊', name: 'Curso GEO/AEO', description: 'Optimiza tu contenido para que los LLMs te citen' },
  ],
  'visualizador-ciclo-economico': [
    { url: '/visualizador-tipos-interes-bce/', icon: '🏦', name: 'Tipos de Interés BCE', description: 'Cómo el BCE usa los tipos para modular el ciclo' },
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'La bolsa como indicador leading del ciclo' },
    { url: '/visualizador-deuda-publica/', icon: '📊', name: 'Deuda Pública', description: 'El ciclo y la sostenibilidad de la deuda' },
    { url: '/visualizador-comercio-internacional/', icon: '🌍', name: 'Comercio Internacional', description: 'El comercio refleja y amplifica el ciclo económico' },
  ],
  'visualizador-comercio-internacional': [
    { url: '/visualizador-ciclo-economico/', icon: '📈', name: 'Ciclo Económico', description: 'Cómo el ciclo afecta a las exportaciones' },
    { url: '/visualizador-tipos-interes-bce/', icon: '🏦', name: 'Tipos de Interés BCE', description: 'Los tipos determinan el tipo de cambio del euro' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena de producción global en la práctica' },
    { url: '/visualizador-deuda-publica/', icon: '📊', name: 'Deuda Pública', description: 'Déficit exterior y financiación internacional' },
  ],
  'visualizador-falacias-logicas': [
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Errores sistemáticos en el pensamiento' },
    { url: '/test-pensamiento-critico/', icon: '🔍', name: 'Test Pensamiento Crítico', description: 'Evalúa tu razonamiento lógico' },
    { url: '/visualizador-evolucion-humana/', icon: '🦴', name: 'Evolución Humana', description: 'El origen cognitivo de nuestros razonamientos' },
    { url: '/visualizador-falacias-logicas/', icon: '❌', name: 'Falacias Lógicas', description: 'Guía visual de errores de razonamiento' },
  ],
  'visualizador-evolucion-humana': [
    { url: '/visualizador-falacias-logicas/', icon: '🧠', name: 'Falacias Lógicas', description: 'Cómo razona el cerebro humano' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'La base molecular de la herencia' },
    { url: '/visualizador-neurociencia-aprendizaje/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'El cerebro moderno que heredamos' },
    { url: '/visualizador-ecosistemas/', icon: '🌿', name: 'Ecosistemas', description: 'El entorno que moldeó nuestra evolución' },
  ],
  'visualizador-economia-circular': [
    { url: '/calculadora-huella-carbono/', icon: '🌍', name: 'Huella de Carbono', description: 'Tu impacto ambiental personal' },
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌡️', name: 'Cambio Climático', description: 'Los puntos de no retorno del planeta' },
    { url: '/visualizador-energia-nuclear/', icon: '⚛️', name: 'Energía Nuclear', description: 'Energía sin carbono en el mix energético' },
    { url: '/calculadora-reciclaje-ahorro/', icon: '♻️', name: 'Reciclaje y Ahorro', description: 'El impacto económico de reciclar' },
  ],
  'visualizador-cortisol': [
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'Todas las hormonas y sus interacciones' },
    { url: '/visualizador-neurociencia-aprendizaje/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'Cómo el estrés afecta la memoria' },
    { url: '/visualizador-ciclo-sueno/', icon: '😴', name: 'Ciclos del Sueño', description: 'El cortisol y el ritmo circadiano del sueño' },
    { url: '/visualizador-piel-barrera-cutanea/', icon: '🫁', name: 'Piel y Barrera Cutánea', description: 'El cortisol y su efecto en la piel' },
  ],
  'visualizador-geopolitica-recursos': [
    { url: '/visualizador-comercio-internacional/', icon: '🌍', name: 'Comercio Internacional', description: 'Los recursos son el núcleo del comercio global' },
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌡️', name: 'Cambio Climático', description: 'La transición energética y sus minerales críticos' },
    { url: '/visualizador-economia-circular/', icon: '♻️', name: 'Economía Circular', description: 'Reducir la dependencia de recursos vírgenes' },
    { url: '/visualizador-desigualdad-riqueza/', icon: '📊', name: 'Desigualdad de la Riqueza', description: 'Los recursos generan riqueza concentrada' },
  ],
  'visualizador-desigualdad-riqueza': [
    { url: '/visualizador-geopolitica-recursos/', icon: '🌍', name: 'Geopolítica de los Recursos', description: 'El control de recursos y la concentración de riqueza' },
    { url: '/visualizador-ciclo-economico/', icon: '📈', name: 'Ciclo Económico', description: 'Cómo el ciclo afecta a la desigualdad' },
    { url: '/visualizador-deuda-publica/', icon: '💰', name: 'Deuda Pública', description: 'Gasto social y redistribución' },
    { url: '/visualizador-estadistica-cotidiana/', icon: '📐', name: 'Estadística Cotidiana', description: 'Cómo leer correctamente los datos de desigualdad' },
  ],
  'visualizador-impacto-ia-sectores': [
    { url: '/visualizador-llm-funcionamiento/', icon: '🤖', name: 'Cómo Funcionan los LLMs', description: 'La tecnología detrás de la automatización' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🧠', name: 'IA y Redes Neuronales', description: 'El sustrato técnico de la IA que automatiza' },
    { url: '/visualizador-computacion-cuantica/', icon: '⚛️', name: 'Computación Cuántica', description: 'La próxima ola de automatización tecnológica' },
    { url: '/visualizador-desigualdad-riqueza/', icon: '📊', name: 'Desigualdad de la Riqueza', description: 'El impacto de la IA en la distribución del trabajo' },
  ],
  'visualizador-estadistica-cotidiana': [
    { url: '/visualizador-desigualdad-riqueza/', icon: '📊', name: 'Desigualdad de la Riqueza', description: 'Curva de Lorenz y Gini: estadística aplicada' },
    { url: '/visualizador-falacias-logicas/', icon: '🧠', name: 'Falacias Lógicas', description: 'Errores de razonamiento relacionados con probabilidad' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🔍', name: 'Sesgos Cognitivos', description: 'Por qué nuestra intuición estadística falla' },
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'La estadística detrás de los mercados' },
  ],
  'visualizador-insulina-glucosa': [
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'Otra hormona clave en el metabolismo energético' },
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'El panorama completo de todas las hormonas' },
    { url: '/visualizador-tiroides/', icon: '🦋', name: 'Tiroides', description: 'La glándula que regula el metabolismo basal' },
    { url: '/visualizador-dopamina/', icon: '⚡', name: 'Dopamina', description: 'Cómo el azúcar activa el circuito de recompensa' },
  ],
  'visualizador-tiroides': [
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'El contexto hormonal completo' },
    { url: '/visualizador-insulina-glucosa/', icon: '🩸', name: 'Insulina y Glucosa', description: 'Otra hormona que regula el metabolismo' },
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'Cortisol e hipotiroidismo comparten síntomas de fatiga' },
    { url: '/visualizador-envejecimiento-celular/', icon: '🔬', name: 'Envejecimiento Celular', description: 'La función tiroidea cambia con la edad' },
  ],
  'visualizador-oxitocina': [
    { url: '/visualizador-dopamina/', icon: '⚡', name: 'Dopamina', description: 'La otra hormona del bienestar y la motivación' },
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'La oxitocina reduce el cortisol en situaciones de estrés' },
    { url: '/visualizador-cerebro-emociones/', icon: '🧠', name: 'Cerebro y Emociones', description: 'El sustrato neurológico de los vínculos sociales' },
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'Oxitocina en el contexto hormonal completo' },
  ],
  'visualizador-dopamina': [
    { url: '/visualizador-oxitocina/', icon: '🤝', name: 'Oxitocina', description: 'La hormona del vínculo social que trabaja con la dopamina' },
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'Estrés crónico y su efecto en el sistema dopaminérgico' },
    { url: '/visualizador-neurociencia-aprendizaje/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'Dopamina y consolidación de memoria' },
    { url: '/visualizador-cerebro-emociones/', icon: '🧠', name: 'Cerebro y Emociones', description: 'Emociones y el circuito de recompensa' },
  ],
  'visualizador-testosterona': [
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'El panorama hormonal completo' },
    { url: '/visualizador-estrogenos/', icon: '🌸', name: 'Estrógenos', description: 'La otra hormona sexual clave — en ambos sexos' },
    { url: '/visualizador-insulina-glucosa/', icon: '🩸', name: 'Insulina y Glucosa', description: 'Testosterona e insulina comparten efectos metabólicos' },
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'El cortisol crónico inhibe la producción de testosterona' },
  ],
  'visualizador-estrogenos': [
    { url: '/visualizador-testosterona/', icon: '💪', name: 'Testosterona', description: 'La hormona sexual complementaria — en ambos sexos' },
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'El contexto hormonal completo' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Ciclos del Sueño', description: 'Los estrógenos influyen en la calidad del sueño' },
    { url: '/visualizador-envejecimiento-celular/', icon: '🔬', name: 'Envejecimiento Celular', description: 'La caída estrogénica y el envejecimiento' },
  ],
  'visualizador-melatonina': [
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'El yin y yang del ritmo circadiano' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Ciclos del Sueño', description: 'Melatonina y arquitectura del sueño' },
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'La melatonina en el contexto hormonal' },
    { url: '/visualizador-neurociencia-aprendizaje/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'El sueño y la consolidación de memoria' },
  ],
  'visualizador-endorfinas': [
    { url: '/visualizador-dopamina/', icon: '⚡', name: 'Dopamina', description: 'El otro sistema del placer y la recompensa' },
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'Ejercicio: endorfinas suben, cortisol se regula' },
    { url: '/visualizador-oxitocina/', icon: '🤝', name: 'Oxitocina', description: 'El contacto social activa tanto oxitocina como endorfinas' },
    { url: '/visualizador-neurociencia-aprendizaje/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'El sistema opioide y la motivación de aprender' },
  ],
  'visualizador-serotonina': [
    { url: '/visualizador-dopamina/', icon: '⚡', name: 'Dopamina', description: 'El otro gran neurotransmisor del estado de ánimo y el placer' },
    { url: '/visualizador-gaba/', icon: '🛑', name: 'GABA', description: 'El freno del sistema nervioso: equilibra la excitación' },
    { url: '/visualizador-melatonina/', icon: '🌙', name: 'Melatonina', description: 'La serotonina es el precursor de la melatonina del sueño' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'Las neuronas del rafe que producen serotonina' },
  ],
  'visualizador-gaba': [
    { url: '/visualizador-serotonina/', icon: '😊', name: 'Serotonina', description: 'El otro neurotransmisor clave del bienestar emocional' },
    { url: '/visualizador-adrenalina/', icon: '⚡', name: 'Adrenalina', description: 'El opuesto excitatorio: lucha-huida vs descanso-GABA' },
    { url: '/visualizador-anestesia/', icon: '😴', name: 'Anestesia', description: 'Los anestésicos actúan sobre los receptores GABA-A' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'El equilibrio excitación/inhibición en el cerebro' },
  ],
  'visualizador-adrenalina': [
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'El eje HPA activa cortisol segundos después que la adrenalina' },
    { url: '/visualizador-gaba/', icon: '🛑', name: 'GABA', description: 'El freno GABAérgico que equilibra la excitación adrenérgica' },
    { url: '/visualizador-sistema-endocrino/', icon: '🫧', name: 'Sistema Endocrino', description: 'La glándula adrenal dentro del sistema endocrino completo' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'El sistema simpático que activa la liberación de adrenalina' },
  ],
  'visualizador-acetilcolina': [
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'La neurona y la transmisión sináptica donde actúa la ACh' },
    { url: '/visualizador-musculos-movimiento/', icon: '💪', name: 'Músculos y Movimiento', description: 'La unión neuromuscular que la ACh activa' },
    { url: '/visualizador-envejecimiento-celular/', icon: '🔬', name: 'Envejecimiento Celular', description: 'La pérdida de neuronas colinérgicas en el Alzheimer' },
    { url: '/visualizador-adrenalina/', icon: '⚡', name: 'Adrenalina', description: 'El antagonista funcional: simpático vs parasimpático' },
  ],
  'visualizador-carbono': [
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🧪', name: 'Tabla Periódica', description: 'El carbono (C, nº 6) en el contexto de todos los elementos' },
    { url: '/visualizador-silicio/', icon: '💻', name: 'Silicio', description: 'El semiconductor que comparte grupo con el carbono' },
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌡️', name: 'Cambio Climático', description: 'El ciclo del carbono perturbado: el motor del calentamiento global' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula', description: 'La vida = química del carbono: ADN, proteínas, lípidos' },
  ],
  'visualizador-silicio': [
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🧪', name: 'Tabla Periódica', description: 'El silicio (Si, nº 14) en el contexto de todos los elementos' },
    { url: '/visualizador-carbono/', icon: '⚛️', name: 'Carbono', description: 'El grafeno de carbono como semiconductor del futuro' },
    { url: '/visualizador-computacion-cuantica/', icon: '⚛️', name: 'Computación Cuántica', description: 'Los límites del silicio y el siguiente paradigma computacional' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'Los chips de silicio que hacen posible el cifrado moderno' },
  ],
  'visualizador-hidrogeno': [
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🧪', name: 'Tabla Periódica', description: 'El hidrógeno (H, nº 1) en el contexto de todos los elementos' },
    { url: '/visualizador-carbono/', icon: '⚛️', name: 'Carbono', description: 'El otro elemento clave en energía: combustibles fósiles vs H₂ verde' },
    { url: '/visualizador-energia-nuclear/', icon: '☢️', name: 'Energía Nuclear', description: 'Fusión (H) vs fisión (U): las dos fuentes sin CO₂' },
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌡️', name: 'Cambio Climático', description: 'El hidrógeno verde como solución de descarbonización' },
  ],
  'visualizador-oro': [
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🧪', name: 'Tabla Periódica', description: 'El oro (Au, nº 79) en el contexto de todos los elementos' },
    { url: '/visualizador-relatividad-especial/', icon: '💫', name: 'Relatividad Especial', description: 'La teoría de Einstein que explica por qué el oro es amarillo' },
    { url: '/visualizador-silicio/', icon: '💻', name: 'Silicio', description: 'Los chips que el oro conecta: semiconductores y circuitos integrados' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'Bitcoin vs oro físico: los dos "valores refugio" comparados' },
  ],
  'visualizador-vitamina-d': [
    { url: '/vitaminas-minerales/', icon: '🍋', name: 'Vitaminas y Minerales', description: 'El mapa completo de vitaminas y minerales esenciales' },
    { url: '/visualizador-vitamina-b12/', icon: '🔴', name: 'Vitamina B12', description: 'Otra vitamina con mecanismo y absorción especiales' },
    { url: '/visualizador-hierro/', icon: '🩸', name: 'Hierro', description: 'Otro micronutriente crítico con absorción compleja' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'La vitamina D regula directamente la inmunidad' },
  ],
  'visualizador-vitamina-b12': [
    { url: '/vitaminas-minerales/', icon: '🍋', name: 'Vitaminas y Minerales', description: 'El mapa completo de vitaminas y minerales esenciales' },
    { url: '/visualizador-vitamina-d/', icon: '☀️', name: 'Vitamina D', description: 'Otra vitamina con mecanismo hormonal y síntesis especial' },
    { url: '/visualizador-hierro/', icon: '🩸', name: 'Hierro', description: 'El déficit de hierro también causa anemia, igual que el de B12' },
    { url: '/visualizador-serotonina/', icon: '😊', name: 'Serotonina', description: 'La B12 es cofactor en la síntesis de neurotransmisores' },
  ],
  'visualizador-hierro': [
    { url: '/vitaminas-minerales/', icon: '🍋', name: 'Vitaminas y Minerales', description: 'El mapa completo de vitaminas y minerales esenciales' },
    { url: '/visualizador-vitamina-b12/', icon: '🔴', name: 'Vitamina B12', description: 'Otra deficiencia que causa anemia con mecanismo diferente' },
    { url: '/visualizador-vitamina-d/', icon: '☀️', name: 'Vitamina D', description: 'Otro micronutriente crítico para la salud ósea e inmune' },
    { url: '/visualizador-magnesio/', icon: '⚡', name: 'Magnesio', description: 'Otro mineral con déficit silencioso e infradiagnosticado' },
  ],
  'visualizador-magnesio': [
    { url: '/vitaminas-minerales/', icon: '🍋', name: 'Vitaminas y Minerales', description: 'El mapa completo de vitaminas y minerales esenciales' },
    { url: '/visualizador-hierro/', icon: '🩸', name: 'Hierro', description: 'Otro mineral con déficit común e infradiagnosticado' },
    { url: '/visualizador-vitamina-d/', icon: '☀️', name: 'Vitamina D', description: 'Otra vitamina con paradoja de deficiencia en España' },
    { url: '/visualizador-gaba/', icon: '🛑', name: 'GABA', description: 'El magnesio modula el receptor NMDA, análogo al equilibrio GABA/glutamato' },
  ],
  'visualizador-aspirina': [
    { url: '/visualizador-analgesicos/', icon: '💊', name: 'Comparativa 3 Analgésicos', description: 'Aspirina vs paracetamol vs ibuprofeno — cuándo usar cada uno' },
    { url: '/visualizador-antibioticos/', icon: '🦠', name: 'Antibióticos', description: 'Otro grupo de fármacos con mecanismo molecular fascinante' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Las prostaglandinas forman parte de la respuesta inflamatoria' },
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas del Cuerpo', description: 'La COX es una enzima — cómo funcionan en general' },
  ],
  'visualizador-antibioticos': [
    { url: '/visualizador-aspirina/', icon: '💊', name: 'Aspirina', description: 'Otro fármaco con mecanismo molecular preciso' },
    { url: '/visualizador-analgesicos/', icon: '💊', name: 'Comparativa 3 Analgésicos', description: 'Analgésicos que actúan diferente a los antibióticos' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Los antibióticos ayudan al sistema inmune — no lo sustituyen' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula', description: 'Diferencias entre célula eucariota y bacteria procariota' },
  ],
  'visualizador-analgesicos': [
    { url: '/visualizador-aspirina/', icon: '💊', name: 'Aspirina', description: 'Profundiza en el mecanismo COX irreversible y 120 años de historia' },
    { url: '/visualizador-paracetamol/', icon: '🟡', name: 'Paracetamol en Detalle', description: 'Cómo actúa en el SNC y el metabolismo hepático NAPQI' },
    { url: '/visualizador-ibuprofeno/', icon: '🔴', name: 'Ibuprofeno en Detalle', description: 'COX reversible, selectividad y el caso Vioxx' },
    { url: '/visualizador-antibioticos/', icon: '🦠', name: 'Antibióticos', description: 'Otro grupo de fármacos con mecanismo molecular fascinante' },
  ],
  'visualizador-paracetamol': [
    { url: '/visualizador-analgesicos/', icon: '💊', name: 'Comparativa 3 Analgésicos', description: 'Aspirina vs paracetamol vs ibuprofeno — cuándo elegir cada uno' },
    { url: '/visualizador-ibuprofeno/', icon: '🔴', name: 'Ibuprofeno', description: 'El analgésico COX periférico que sí tiene efecto antiinflamatorio' },
    { url: '/visualizador-aspirina/', icon: '💊', name: 'Aspirina', description: 'El tercer gran analgésico con mecanismo irreversible' },
    { url: '/visualizador-higado/', icon: '🫁', name: 'Hígado', description: 'El órgano que metaboliza el NAPQI — clave para entender la toxicidad' },
  ],
  'visualizador-ibuprofeno': [
    { url: '/visualizador-analgesicos/', icon: '💊', name: 'Comparativa 3 Analgésicos', description: 'Aspirina vs paracetamol vs ibuprofeno — cuándo elegir cada uno' },
    { url: '/visualizador-paracetamol/', icon: '🟡', name: 'Paracetamol', description: 'El analgésico SNC que no inflama tejidos periféricos' },
    { url: '/visualizador-aspirina/', icon: '💊', name: 'Aspirina', description: 'El AINE que inhibe COX de forma irreversible' },
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas del Cuerpo', description: 'La COX que el ibuprofeno inhibe es una enzima — cómo funcionan' },
  ],
  'visualizador-anestesia': [
    { url: '/visualizador-aspirina/', icon: '💊', name: 'Aspirina', description: 'Control del dolor a nivel periférico (vs central en anestesia)' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'La anestesia actúa sobre los canales iónicos de los nervios' },
    { url: '/visualizador-cerebro-emociones/', icon: '💭', name: 'Cerebro y Emociones', description: 'El enigma de la consciencia que la anestesia interrumpe' },
    { url: '/visualizador-neurociencia-aprendizaje/', icon: '🎓', name: 'Neurociencia del Aprendizaje', description: 'Memoria implícita bajo anestesia: un fenómeno sorprendente' },
  ],
  'visualizador-lactasa': [
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas del Cuerpo Humano', description: 'El panorama completo de las enzimas' },
    { url: '/visualizador-catalasa/', icon: '⚗️', name: 'Catalasa', description: 'Otra enzima espectacular: 40M reacciones/s' },
    { url: '/visualizador-evolucion-humana/', icon: '🦴', name: 'Evolución Humana', description: 'La mutación que permitió digerir leche en adultos' },
    { url: '/visualizador-sistema-digestivo/', icon: '🍎', name: 'Sistema Digestivo', description: 'Cómo el aparato digestivo procesa los alimentos' },
  ],
  'visualizador-catalasa': [
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas del Cuerpo Humano', description: 'El panorama completo de las enzimas' },
    { url: '/visualizador-lactasa/', icon: '🥛', name: 'Lactasa', description: 'Otra enzima con historia evolutiva fascinante' },
    { url: '/visualizador-atp-sintasa/', icon: '⚙️', name: 'ATP Sintasa', description: 'El motor molecular de la energía celular' },
    { url: '/visualizador-envejecimiento-celular/', icon: '🔬', name: 'Envejecimiento Celular', description: 'El daño oxidativo y las defensas antioxidantes' },
  ],
  'visualizador-atp-sintasa': [
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas del Cuerpo Humano', description: 'El panorama completo de las enzimas' },
    { url: '/visualizador-catalasa/', icon: '⚗️', name: 'Catalasa', description: 'La cadena respiratoria y el H₂O₂' },
    { url: '/visualizador-adn-polimerasa/', icon: '🧬', name: 'ADN Polimerasa', description: 'Otra máquina molecular con Premio Nobel' },
    { url: '/visualizador-envejecimiento-celular/', icon: '🔬', name: 'Envejecimiento Celular', description: 'Mitocondria, ROS y senescencia' },
  ],
  'visualizador-adn-polimerasa': [
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas del Cuerpo Humano', description: 'El panorama completo de las enzimas' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN: Código Genético', description: 'El código que la ADN polimerasa replica' },
    { url: '/visualizador-telomerasa/', icon: '⏳', name: 'Telomerasa', description: 'La enzima que completa lo que la polimerasa no puede' },
    { url: '/visualizador-atp-sintasa/', icon: '⚙️', name: 'ATP Sintasa', description: 'Otro motor molecular Premio Nobel' },
  ],
  'visualizador-telomerasa': [
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas del Cuerpo Humano', description: 'El panorama completo de las enzimas' },
    { url: '/visualizador-envejecimiento-celular/', icon: '🔬', name: 'Envejecimiento Celular', description: 'El papel de los telómeros en la senescencia' },
    { url: '/visualizador-adn-polimerasa/', icon: '🧬', name: 'ADN Polimerasa', description: 'La enzima que replica y el problema del extremo' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN: Código Genético', description: 'El código que los telómeros protegen' },
  ],
  'visualizador-ayuno-intermitente': [
    { url: '/visualizador-microbioma/', icon: '🦠', name: 'Microbioma', description: 'El ayuno modifica la composición bacteriana intestinal' },
    { url: '/visualizador-insulina-glucosa/', icon: '💉', name: 'Insulina y Glucosa', description: 'La insulina cae durante el ayuno — el eje central del proceso' },
    { url: '/visualizador-indice-glucemico/', icon: '📊', name: 'Índice Glucémico', description: 'Cómo los alimentos afectan la glucemia al romper el ayuno' },
    { url: '/visualizador-sistema-digestivo/', icon: '🍎', name: 'Sistema Digestivo', description: 'Lo que ocurre en el tracto digestivo durante el ayuno' },
  ],
  'visualizador-metabolismo-alcohol': [
    { url: '/visualizador-higado/', icon: '🫀', name: 'Hígado', description: 'Anatomía y funciones del órgano que metaboliza el alcohol' },
    { url: '/visualizador-farmacocinetica/', icon: '⚗️', name: 'Farmacocinética', description: 'El proceso ADME que también aplica al etanol' },
    { url: '/visualizador-microbioma/', icon: '🦠', name: 'Microbioma', description: 'Las bacterias orales producen acetaldehído directamente' },
    { url: '/visualizador-cerebro-emociones/', icon: '💭', name: 'Cerebro y Emociones', description: 'El alcohol actúa sobre GABA y NMDA en el cerebro' },
  ],
  'visualizador-indice-glucemico': [
    { url: '/visualizador-insulina-glucosa/', icon: '💉', name: 'Insulina y Glucosa', description: 'La respuesta de insulina al IG: el eje del proceso glucémico' },
    { url: '/visualizador-ayuno-intermitente/', icon: '⏳', name: 'Ayuno Intermitente', description: 'Cómo el ayuno restablece la sensibilidad a la insulina' },
    { url: '/visualizador-microbioma/', icon: '🦠', name: 'Microbioma', description: 'Las bacterias intestinales modulan la respuesta glucémica' },
    { url: '/visualizador-sistema-digestivo/', icon: '🍎', name: 'Sistema Digestivo', description: 'El proceso de digestión y absorción de carbohidratos' },
  ],
  'visualizador-toma-decisiones': [
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Los sesgos individuales que el Sistema 1 introduce en cada decisión' },
    { url: '/analisis-decision-reversible/', icon: '🔄', name: 'Decisión Reversible', description: 'El marco Bezos para distinguir decisiones de alto y bajo riesgo' },
    { url: '/visualizador-cerebro-emociones/', icon: '💭', name: 'Cerebro y Emociones', description: 'Cómo la amígdala y la emoción secuestran al Sistema 2' },
    { url: '/visualizador-memoria-humana/', icon: '🧩', name: 'Memoria', description: 'Cómo la memoria de trabajo limita la capacidad del Sistema 2' },
  ],
  'visualizador-algoritmos-ordenacion': [
    { url: '/visualizador-base-datos-relacional/', icon: '🗄️', name: 'Base de Datos Relacional', description: 'Los algoritmos de ordenación son clave en la construcción de índices B-Tree' },
    { url: '/visualizador-criptografia/', icon: '🔒', name: 'Criptografía', description: 'Los algoritmos de búsqueda binaria son la base de las estructuras criptográficas' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🤖', name: 'IA y Redes Neuronales', description: 'El backpropagation también depende de algoritmos eficientes de búsqueda y ordenación' },
    { url: '/visualizador-llm-funcionamiento/', icon: '💬', name: 'LLMs', description: 'Los transformers usan atención que requiere operaciones de ordenación eficiente' },
  ],
  'visualizador-base-datos-relacional': [
    { url: '/visualizador-algoritmos-ordenacion/', icon: '📊', name: 'Algoritmos de Ordenación', description: 'Los índices B-Tree se construyen con algoritmos de ordenación eficientes' },
    { url: '/visualizador-criptografia/', icon: '🔒', name: 'Criptografía', description: 'Las BD usan hashing y cifrado para proteger contraseñas y datos sensibles' },
    { url: '/visualizador-llm-funcionamiento/', icon: '💬', name: 'LLMs', description: 'Los grandes modelos de lenguaje almacenan embeddings en bases de datos vectoriales' },
    { url: '/visualizador-blockchain/', icon: '⛓️', name: 'Blockchain', description: 'Una blockchain es una BD distribuida con propiedades de inmutabilidad' },
  ],
  'visualizador-inflacion': [
    { url: '/visualizador-burbuja-especulativa/', icon: '🫧', name: 'Burbuja Especulativa', description: 'La inflación descontrolada puede desencadenar ciclos especulativos' },
    { url: '/visualizador-tipos-interes-bce/', icon: '🏦', name: 'Tipos de Interés BCE', description: 'El principal instrumento del BCE para controlar la inflación' },
    { url: '/visualizador-ciclo-economico/', icon: '📊', name: 'Ciclo Económico', description: 'La inflación varía según la fase del ciclo expansivo o recesivo' },
    { url: '/estimador-inflacion/', icon: '🧮', name: 'Estimador de Inflación', description: 'Calcula el impacto real de la inflación en tu poder adquisitivo' },
  ],
  'visualizador-burbuja-especulativa': [
    { url: '/visualizador-inflacion/', icon: '📈', name: 'Inflación', description: 'La política monetaria expansiva suele preceder a las burbujas' },
    { url: '/visualizador-mercados-financieros/', icon: '📊', name: 'Mercados Financieros', description: 'Cómo funcionan los mercados donde se forman y explotan las burbujas' },
    { url: '/visualizador-fondo-inversion/', icon: '📦', name: 'Fondos de Inversión', description: 'Cómo un fondo bien diversificado protege frente a burbujas' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Los sesgos psicológicos que hacen racional entrar en una burbuja' },
  ],
  'visualizador-fondo-inversion': [
    { url: '/visualizador-burbuja-especulativa/', icon: '🫧', name: 'Burbuja Especulativa', description: 'Cómo una cartera diversificada protege del boom-crash' },
    { url: '/visualizador-mercados-financieros/', icon: '📊', name: 'Mercados Financieros', description: 'Los mercados donde operan los fondos de inversión' },
    { url: '/visualizador-tipos-interes-bce/', icon: '🏦', name: 'Tipos de Interés BCE', description: 'Cómo los tipos condicionan la rentabilidad de bonos y acciones' },
    { url: '/visualizador-ciclo-economico/', icon: '📈', name: 'Ciclo Económico', description: 'En qué fase del ciclo tiene más sentido cada tipo de fondo' },
  ],
  'visualizador-el-nino': [
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌍', name: 'Cambio Climático', description: 'El calentamiento global está intensificando los episodios de El Niño' },
    { url: '/visualizador-oceanos-corrientes/', icon: '🌊', name: 'Océanos y Corrientes', description: 'Las corrientes oceánicas que El Niño altera a escala global' },
    { url: '/visualizador-efecto-invernadero/', icon: '♨️', name: 'Efecto Invernadero', description: 'El mecanismo que amplifica los extremos climáticos del ENSO' },
    { url: '/visualizador-terremotos-tsunamis/', icon: '🌋', name: 'Terremotos y Tsunamis', description: 'Otros fenómenos naturales de gran escala con impacto global' },
  ],
  'visualizador-ciclo-carbono-completo': [
    { url: '/visualizador-carbono/', icon: '⚛️', name: 'El Carbono', description: 'Alótropos, química orgánica y datación C-14 del elemento carbono' },
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌍', name: 'Cambio Climático', description: 'Los puntos de no retorno que el exceso de CO₂ puede desencadenar' },
    { url: '/visualizador-oceanos-corrientes/', icon: '🌊', name: 'Océanos y Corrientes', description: 'Los océanos como mayor sumidero de carbono del planeta' },
    { url: '/visualizador-efecto-invernadero/', icon: '♨️', name: 'Efecto Invernadero', description: 'Cómo el CO₂ extra retiene el calor en la atmósfera' },
  ],
  'visualizador-terremotos-tsunamis': [
    { url: '/visualizador-el-nino/', icon: '🌊', name: 'El Niño y La Niña', description: 'Otro fenómeno natural de gran escala con impacto global' },
    { url: '/visualizador-energia-nuclear/', icon: '☢️', name: 'Energía Nuclear', description: 'Los tsunamis pueden afectar a centrales nucleares costeras (Fukushima)' },
    { url: '/visualizador-oceanos-corrientes/', icon: '🌊', name: 'Océanos y Corrientes', description: 'Los tsunamis interactúan con las corrientes y la batimetría oceánica' },
    { url: '/visualizador-ciclo-carbono-completo/', icon: '🌍', name: 'Ciclo del Carbono', description: 'Los volcanes submarinos también emiten CO₂ al ciclo global' },
  ],
  'visualizador-vuelo-avion': [
    { url: '/visualizador-motor-combustion/', icon: '🔥', name: 'Motor de Combustión', description: 'El motor que propulsa los aviones convencionales' },
    { url: '/visualizador-motor-electrico/', icon: '⚡', name: 'Motor Eléctrico', description: 'El motor de los aviones eléctricos del futuro' },
    { url: '/visualizador-efecto-doppler/', icon: '🌊', name: 'Efecto Doppler', description: 'El radar Doppler guía los aviones en tormenta' },
    { url: '/visualizador-electromagnetismo/', icon: '⚡', name: 'Electromagnetismo', description: 'Las ondas de radio detrás del radar aeronáutico' },
  ],
  'visualizador-motor-combustion': [
    { url: '/visualizador-vuelo-avion/', icon: '✈️', name: 'Vuelo de Avión', description: 'El motor a reacción como versión extrema del ciclo Otto' },
    { url: '/visualizador-motor-electrico/', icon: '⚡', name: 'Motor Eléctrico', description: 'La alternativa con 85-95% de eficiencia frente al 30-40%' },
    { url: '/visualizador-energia-nuclear/', icon: '☢️', name: 'Energía Nuclear', description: 'Otra forma de generar calor para mover turbinas' },
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌍', name: 'Cambio Climático', description: 'El CO₂ que emite la combustión y sus consecuencias' },
  ],
  'visualizador-motor-electrico': [
    { url: '/visualizador-motor-combustion/', icon: '🔥', name: 'Motor de Combustión', description: 'El contrincante: ciclo Otto y sus pérdidas térmicas' },
    { url: '/visualizador-electromagnetismo/', icon: '⚡', name: 'Electromagnetismo', description: 'La inducción de Faraday que hace girar el rotor' },
    { url: '/visualizador-vuelo-avion/', icon: '✈️', name: 'Vuelo de Avión', description: 'Propulsión eléctrica en aviación emergente' },
    { url: '/visualizador-energia-nuclear/', icon: '☢️', name: 'Energía Nuclear', description: 'La electricidad que alimenta los motores eléctricos' },
  ],
  'visualizador-efecto-doppler': [
    { url: '/visualizador-sonido-ondas/', icon: '🔊', name: 'Sonido y Ondas', description: 'Propiedades fundamentales de las ondas sonoras' },
    { url: '/visualizador-electromagnetismo/', icon: '⚡', name: 'Electromagnetismo', description: 'Doppler también aplica a la luz y el espectro EM' },
    { url: '/visualizador-relatividad-especial/', icon: '🌌', name: 'Relatividad Especial', description: 'El redshift cósmico necesita la fórmula relativista a z alto' },
    { url: '/visualizador-espectro-electromagnetico/', icon: '🌈', name: 'Espectro Electromagnético', description: 'El radar Doppler usa microondas del espectro EM' },
  ],
  'selector-calefaccion': [
    { url: '/calculadora-eficiencia-energetica/', icon: '⚡', name: 'Eficiencia Energética', description: 'Ahorro y amortización de mejoras' },
    { url: '/calculadora-gasto-energetico/', icon: '💡', name: 'Gasto Energético', description: 'Consumo eléctrico de electrodomésticos' },
    { url: '/estimador-reformas-hogar/', icon: '🏗️', name: 'Estimador Reformas', description: 'Presupuesto por tipo de reforma' },
    { url: '/calculadora-huella-carbono/', icon: '🌍', name: 'Huella de Carbono', description: 'Tu impacto ambiental' },
  ],
  'selector-portatil': [
    { url: '/selector-smartphone/', icon: '📱', name: 'Selector de Smartphone', description: '¿Qué móvil te conviene?' },
    { url: '/test-madurez-digital/', icon: '🤖', name: 'Test Madurez Digital', description: 'Nivel de digitalización de tu empresa' },
    { url: '/calculadora-suscripciones/', icon: '📱', name: 'Calculadora Suscripciones', description: 'Controla lo que gastas al mes' },
    { url: '/selector-vehiculo/', icon: '🚗', name: 'Selector de Vehículo', description: '¿Qué tipo de coche te conviene?' },
  ],
  'selector-smartphone': [
    { url: '/selector-portatil/', icon: '💻', name: 'Selector de Portátil y PC', description: '¿Qué ordenador te conviene?' },
    { url: '/selector-tipo-television/', icon: '📺', name: 'Selector de TV', description: '¿OLED, QLED o LED? ¿Qué panel te conviene?' },
    { url: '/selector-vehiculo/', icon: '🚗', name: 'Selector de Vehículo', description: '¿Qué tipo de coche te conviene?' },
    { url: '/test-madurez-digital/', icon: '🤖', name: 'Test Madurez Digital', description: 'Nivel de digitalización de tu empresa' },
    { url: '/calculadora-suscripciones/', icon: '📱', name: 'Calculadora Suscripciones', description: 'Controla lo que gastas al mes' },
  ],
  'selector-tipo-television': [
    { url: '/selector-smartphone/', icon: '📱', name: 'Selector de Smartphone', description: '¿Qué móvil te conviene?' },
    { url: '/selector-portatil/', icon: '💻', name: 'Selector de Portátil y PC', description: '¿Qué ordenador te conviene?' },
    { url: '/selector-calefaccion/', icon: '🏠', name: 'Selector de Calefacción', description: '¿Aerotermia, gas o pellet?' },
    { url: '/calculadora-suscripciones/', icon: '📱', name: 'Calculadora Suscripciones', description: 'Controla lo que gastas al mes' },
  ],
  'selector-mascota': [
    { url: '/selector-seguro-salud/', icon: '🏥', name: 'Selector Seguro de Salud', description: '¿Necesitas seguro médico privado?' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Seguros', description: 'Guía de seguros en España' },
    { url: '/calculadora-gastos-hogar/', icon: '🏠', name: 'Calculadora Gastos Hogar', description: 'Control de tu presupuesto mensual' },
    { url: '/selector-vehiculo/', icon: '🚗', name: 'Selector de Vehículo', description: '¿Qué tipo de coche te conviene?' },
  ],
  'selector-seguro-salud': [
    { url: '/selector-mascota/', icon: '🐾', name: 'Selector de Mascota', description: '¿Qué animal se adapta a tu vida?' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador de Seguros', description: 'Guía de todos los seguros en España' },
    { url: '/calculadora-gastos-hogar/', icon: '🏠', name: 'Calculadora Gastos Hogar', description: 'Control de tu presupuesto mensual' },
    { url: '/calculadora-salario-neto/', icon: '💰', name: 'Calculadora Salario Neto', description: 'Tu sueldo neto real tras IRPF y SS' },
  ],
  'selector-seguro-hogar': [
    { url: '/selector-seguro-salud/', icon: '🏥', name: 'Selector Seguro de Salud', description: '¿Necesitas seguro médico privado?' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador de Seguros', description: 'Guía de todos los seguros en España' },
    { url: '/calculadora-gastos-hogar/', icon: '🏠', name: 'Calculadora Gastos Hogar', description: 'Control de tu presupuesto mensual' },
    { url: '/calculadora-hipoteca/', icon: '🏦', name: 'Calculadora de Hipoteca', description: 'Cuota mensual y coste total de tu préstamo' },
  ],
  'selector-alquiler-vs-compra': [
    { url: '/orientador-alquiler-vs-compra/', icon: '📊', name: 'Orientador Alquiler vs Compra', description: 'Cálculo financiero detallado con tus cifras reales' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Estimador de Hipoteca', description: 'Cuota mensual y coste total de tu préstamo' },
    { url: '/estimador-coste-vivienda/', icon: '🏡', name: 'Estimador Coste Vivienda', description: 'Gastos totales al comprar una vivienda' },
    { url: '/selector-seguro-hogar/', icon: '🛡️', name: 'Selector Seguro de Hogar', description: '¿Qué cobertura de seguro necesitas?' },
  ],
  'selector-zona-residencia': [
    { url: '/selector-tipo-vivienda/', icon: '🏠', name: 'Selector Tipo de Vivienda', description: '¿Piso, casa, ático o estudio?' },
    { url: '/selector-alquiler-vs-compra/', icon: '🏠', name: 'Selector Alquiler o Compra', description: '¿Te conviene más alquilar o comprar?' },
    { url: '/estimador-coste-vivienda/', icon: '🏡', name: 'Estimador Coste Vivienda', description: 'Gastos totales al comprar una vivienda' },
    { url: '/selector-seguro-hogar/', icon: '🛡️', name: 'Selector Seguro de Hogar', description: '¿Qué cobertura de seguro de hogar necesitas?' },
  ],
  'selector-tipo-vivienda': [
    { url: '/selector-zona-residencia/', icon: '🏡', name: 'Selector Zona de Residencia', description: '¿Ciudad, pueblo o costa?' },
    { url: '/orientador-alquiler-vs-compra/', icon: '⚖️', name: 'Orientador Alquiler vs Compra', description: 'Análisis financiero completo' },
    { url: '/estimador-coste-vivienda/', icon: '🏡', name: 'Estimador Coste Vivienda', description: 'Gastos totales al comprar una vivienda' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Estimador de Hipoteca', description: 'Calcula tu cuota mensual' },
  ],
  'selector-dieta': [
    { url: '/orientador-imc/', icon: '⚖️', name: 'Orientador IMC', description: 'Calcula tu índice de masa corporal' },
    { url: '/selector-ejercicio/', icon: '🏋️', name: 'Selector de Ejercicio', description: '¿Qué tipo de actividad física te conviene?' },
    { url: '/test-habitos-saludables/', icon: '💚', name: 'Test Hábitos Saludables', description: 'Evalúa tus hábitos de vida' },
    { url: '/orientador-tension-arterial/', icon: '🩺', name: 'Orientador Tensión Arterial', description: 'Interpreta tus cifras de tensión' },
  ],
  'selector-ejercicio': [
    { url: '/selector-dieta/', icon: '🥗', name: 'Selector de Dieta', description: '¿Qué tipo de alimentación te conviene?' },
    { url: '/orientador-imc/', icon: '⚖️', name: 'Orientador IMC', description: 'Calcula tu índice de masa corporal' },
    { url: '/test-habitos-saludables/', icon: '💚', name: 'Test Hábitos Saludables', description: 'Evalúa tus hábitos de vida' },
    { url: '/orientador-colesterol/', icon: '🩺', name: 'Orientador Colesterol', description: 'Interpreta tus niveles de colesterol' },
  ],
  'selector-vehiculo': [
    { url: '/selector-smartphone/', icon: '📱', name: 'Selector de Smartphone', description: '¿Qué móvil te conviene?' },
    { url: '/comparador-electrico/', icon: '⚡', name: 'Comparador Eléctrico vs Gasolina', description: '¿Cuándo compensa el eléctrico?' },
    { url: '/comparador-vehiculos/', icon: '🚗', name: 'Comparador de Vehículos', description: 'Contado vs financiación vs renting' },
    { url: '/etiqueta-dgt/', icon: '🏷️', name: 'Etiqueta DGT y ZBE', description: '¿Puedes entrar en las zonas de bajas emisiones?' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora Combustible', description: 'Coste anual de carburante' },
  ],
  'comparador-vehiculos': [
    { url: '/selector-vehiculo/', icon: '🔍', name: 'Selector de Vehículo', description: '¿Qué tipo de coche me conviene?' },
    { url: '/comparador-electrico/', icon: '⚡', name: 'Comparador Eléctrico vs Gasolina', description: 'Break-even y ahorro a 10 años' },
    { url: '/estimador-prestamos/', icon: '🏦', name: 'Simulador Préstamos', description: 'Compara sistemas de amortización' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora Combustible', description: 'Coste anual de carburante' },
  ],
  'comparador-electrico': [
    { url: '/selector-vehiculo/', icon: '🔍', name: 'Selector de Vehículo', description: '¿Qué tipo de coche me conviene?' },
    { url: '/etiqueta-dgt/', icon: '🏷️', name: 'Etiqueta DGT y ZBE', description: 'Etiqueta medioambiental y acceso a ZBE' },
    { url: '/comparador-vehiculos/', icon: '🚗', name: 'Comparador de Vehículos', description: 'Contado vs financiación vs renting' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora Combustible', description: 'Coste anual de carburante' },
  ],
  'etiqueta-dgt': [
    { url: '/comparador-electrico/', icon: '⚡', name: 'Comparador Eléctrico vs Gasolina', description: '¿Cuándo compensa el eléctrico?' },
    { url: '/selector-vehiculo/', icon: '🔍', name: 'Selector de Vehículo', description: '¿Qué tipo de coche te conviene?' },
    { url: '/comparador-vehiculos/', icon: '🚗', name: 'Comparador de Vehículos', description: 'Contado vs financiación vs renting' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora Combustible', description: 'Coste anual de carburante' },
  ],
  'selector-coche-nuevo-usado': [
    { url: '/selector-vehiculo/', icon: '🔍', name: 'Selector de Vehículo', description: '¿Qué tipo de coche te conviene?' },
    { url: '/comparador-vehiculos/', icon: '🚗', name: 'Comparador de Vehículos', description: 'Contado vs financiación vs renting' },
    { url: '/etiqueta-dgt/', icon: '🏷️', name: 'Etiqueta DGT y ZBE', description: '¿Puedes entrar en las zonas de bajas emisiones?' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora Combustible', description: 'Coste anual de carburante' },
    { url: '/comparador-electrico/', icon: '⚡', name: 'Comparador Eléctrico vs Gasolina', description: '¿Cuándo compensa el eléctrico?' },
  ],
  'calculadora-seguro-vida': [
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Tipos Seguros', description: 'Guía de seguros en España' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas según tu perfil' },
    { url: '/estimador-infraseguro/', icon: '⚖️', name: 'Calculadora Infraseguro', description: 'Regla proporcional en siniestros' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Guía Seguro Coche', description: 'Cuándo reclamar al seguro' },
  ],
  'comparador-tipos-seguros': [
    { url: '/orientador-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro Vida', description: 'Cuánto seguro necesitas' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas según tu perfil' },
    { url: '/estimador-infraseguro/', icon: '⚖️', name: 'Calculadora Infraseguro', description: 'Regla proporcional en siniestros' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Guía Seguro Coche', description: 'Cuándo reclamar al seguro' },
  ],
  'checklist-coberturas-seguros': [
    { url: '/orientador-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro Vida', description: 'Cuánto seguro de vida necesitas' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Tipos Seguros', description: 'Guía de seguros en España' },
    { url: '/estimador-infraseguro/', icon: '⚖️', name: 'Calculadora Infraseguro', description: 'Regla proporcional en siniestros' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Guía Seguro Coche', description: 'Cuándo reclamar al seguro' },
  ],
  'calculadora-infraseguro': [
    { url: '/orientador-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro Vida', description: 'Cuánto seguro de vida necesitas' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Tipos Seguros', description: 'Guía de seguros en España' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas según tu perfil' },
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Guía Seguro Coche', description: 'Cuándo reclamar al seguro' },
  ],
  'guia-reclamar-seguro-coche': [
    { url: '/orientador-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro Vida', description: 'Cuánto seguro de vida necesitas' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador Tipos Seguros', description: 'Guía de seguros en España' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas según tu perfil' },
    { url: '/estimador-infraseguro/', icon: '⚖️', name: 'Calculadora Infraseguro', description: 'Regla proporcional en siniestros' },
  ],
  'asistente-reclamaciones': [
    { url: '/guia-reclamar-seguro-coche/', icon: '🚗', name: 'Reclamar Seguro Coche', description: 'Cuándo reclamar al seguro del coche' },
    { url: '/checklist-coberturas-seguros/', icon: '✅', name: 'Checklist Coberturas', description: 'Qué seguros necesitas' },
  ],
  // SALUD
  'planificador-chequeos-medicos': saludApps.filter(a => a.url !== '/planificador-chequeos-medicos/').slice(0, 4),
  'calculadora-tension-arterial': saludApps.filter(a => a.url !== '/orientador-tension-arterial/').slice(0, 4),
  'calculadora-imc': saludApps.filter(a => a.url !== '/orientador-imc/').slice(0, 4),
  'calculadora-colesterol': saludApps.filter(a => a.url !== '/orientador-colesterol/').slice(0, 4),
  'calculadora-calorias-ejercicio': saludApps.filter(a => a.url !== '/calculadora-calorias-ejercicio/'),
  'calculadora-macros': saludApps.filter(a => a.url !== '/calculadora-macros/'),
  'calculadora-hidratacion': saludApps.filter(a => a.url !== '/calculadora-hidratacion/'),
  'planificador-menu': [...saludApps.filter(a => a.url !== '/planificador-menu/').slice(0, 2), ...cocinaApps.slice(0, 2)],
  'calculadora-porciones': [...cocinaApps.filter(a => a.url !== '/calculadora-porciones/').slice(0, 2), ...saludApps.slice(0, 2)],
  'vitaminas-minerales': saludApps.filter(a => a.url !== '/vitaminas-minerales/'),
  'seguimiento-habitos': saludHabitosApps.filter(a => a.url !== '/seguimiento-habitos/'),
  'test-habitos-saludables': saludHabitosApps.filter(a => a.url !== '/test-habitos-saludables/'),
  'calculadora-sueno': saludHabitosApps.filter(a => a.url !== '/calculadora-sueno/'),
  'test-burnout-laboral': [
    { url: '/test-habitos-saludables/', icon: '🌟', name: 'Test de Hábitos Saludables', description: 'Evalúa tu bienestar integral' },
    { url: '/seguimiento-habitos/', icon: '✅', name: 'Seguimiento de Hábitos', description: 'Construye rutinas saludables' },
    { url: '/calculadora-sueno/', icon: '😴', name: 'Calculadora de Sueño', description: 'Optimiza tu descanso' },
    { url: '/guia-respiracion/', icon: '🫁', name: 'Guía de Respiración Consciente', description: 'Reduce el estrés con respiración' },
  ],

  // MASCOTAS
  'planificador-mascota': [...mascotasApps.filter(a => a.url !== '/planificador-mascota/').slice(0, 3), mascotasExtraApps[1]],
  'calculadora-alimentacion-mascotas': [...mascotasApps.filter(a => a.url !== '/calculadora-alimentacion-mascotas/').slice(0, 3), mascotasExtraApps[0]],
  'calculadora-medicamentos-mascotas': [...mascotasApps.filter(a => a.url !== '/orientador-medicamentos-mascotas/').slice(0, 3), mascotasExtraApps[1]],
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
  'simulador-baja-vision': disenoColoresApps.filter(a => a.url !== '/simulador-baja-vision/'),
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
  'calculadora-tarifa-freelance': freelanceApps.filter(a => a.url !== '/orientador-tarifa-freelance/'),
  'calculadora-presupuestos': freelanceApps.filter(a => a.url !== '/calculadora-presupuestos/'),
  'generador-facturas': freelanceApps.filter(a => a.url !== '/generador-facturas/'),
  'calculadora-break-even': [...freelanceApps.filter(a => a.url !== '/estimador-break-even/').slice(0, 2), ...negociosApps.slice(0, 2)],
  'calculadora-roi-marketing': negociosApps.filter(a => a.url !== '/estimador-roi-marketing/'),
  'planificador-cashflow': [...negociosApps.filter(a => a.url !== '/planificador-cashflow/').slice(0, 2), ...freelanceApps.slice(0, 2)],
  'generador-nombres-empresa': negociosApps.filter(a => a.url !== '/generador-nombres-empresa/'),
  'generador-carruseles': [...negociosApps.filter(a => a.url !== '/generador-carruseles/').slice(0, 2), ...seoApps.slice(0, 2)],
  'selector-modelo-negocio': [
    { url: '/estimador-break-even/', icon: '⚖️', name: 'Break-Even', description: 'Punto de equilibrio del negocio' },
    { url: '/planificador-cashflow/', icon: '💸', name: 'Planificador Cashflow', description: 'Flujo de caja mensual' },
    { url: '/generador-nombres-empresa/', icon: '✨', name: 'Nombres Empresa', description: 'Ideas de nombres para tu negocio' },
    { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Cuánto cobrar por tu trabajo' },
  ],

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
  // ==========================================
  // FAMILIA: APPS DE REFLEXIÓN (cross-linking por afinidad temática)
  // ==========================================
  // Cat.1: Empresa y Management — enlaza entre sí + cat.5 (pensamiento crítico en decisiones)
  'diagnostico-explotacion-exploracion': [
    { url: '/checklist-pre-mortem/', icon: '🔍', name: 'Checklist Pre-Mortem', description: 'Anticipa fallos antes de lanzar' },
    { url: '/mapa-decisiones-urgentes-importantes/', icon: '🎯', name: 'Urgentes vs Importantes', description: '¿Apagafuegos o estrategia?' },
    { url: '/auditoria-reuniones/', icon: '📋', name: 'Auditoría de Reuniones', description: '¿Tus reuniones aportan valor?' },
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: '¿Decides bien o decides rápido?' },
  ],
  'auditoria-reuniones': [
    { url: '/diagnostico-comunicacion-interna/', icon: '📡', name: 'Comunicación Interna', description: '¿Rápido o profundo?' },
    { url: '/diagnostico-multitarea/', icon: '🔀', name: 'Diagnóstico Multitarea', description: '¿Tu multitarea es productiva?' },
    { url: '/mapa-decisiones-urgentes-importantes/', icon: '🎯', name: 'Urgentes vs Importantes', description: '¿Apagafuegos o estrategia?' },
    { url: '/test-delegacion-efectiva/', icon: '🤝', name: 'Test de Delegación', description: '¿Delegas bien o solo sueltas?' },
  ],
  'mapa-decisiones-urgentes-importantes': [
    { url: '/diagnostico-explotacion-exploracion/', icon: '⚖️', name: 'Explotación vs Exploración', description: '¿Corto plazo o largo plazo?' },
    { url: '/mapa-compromisos-capacidad/', icon: '📋', name: 'Compromisos vs Capacidad', description: '¿Has dicho sí a demasiado?' },
    { url: '/analisis-decision-reversible/', icon: '🚪', name: 'Decisión Reversible', description: '¿Puedes probar sin riesgo?' },
    { url: '/checklist-pre-mortem/', icon: '🔍', name: 'Checklist Pre-Mortem', description: 'Anticipa fallos antes de actuar' },
  ],
  'test-delegacion-efectiva': [
    { url: '/diagnostico-comunicacion-interna/', icon: '📡', name: 'Comunicación Interna', description: '¿Rápido o profundo?' },
    { url: '/test-pensamiento-grupo/', icon: '🫧', name: 'Pensamiento de Grupo', description: '¿Tu equipo debate o confirma?' },
    { url: '/auditoria-reuniones/', icon: '📋', name: 'Auditoría de Reuniones', description: '¿Tus reuniones aportan valor?' },
    { url: '/diagnostico-estancamiento-profesional/', icon: '🌊', name: 'Estancamiento Profesional', description: '¿Confort, estrés o flujo?' },
  ],
  'diagnostico-comunicacion-interna': [
    { url: '/auditoria-reuniones/', icon: '📋', name: 'Auditoría de Reuniones', description: '¿Tus reuniones aportan valor?' },
    { url: '/test-delegacion-efectiva/', icon: '🤝', name: 'Test de Delegación', description: '¿Delegas bien o solo sueltas?' },
    { url: '/test-pensamiento-grupo/', icon: '🫧', name: 'Pensamiento de Grupo', description: '¿Tu equipo debate o confirma?' },
    { url: '/diagnostico-multitarea/', icon: '🔀', name: 'Diagnóstico Multitarea', description: '¿Fragmentación o foco?' },
  ],
  'checklist-pre-mortem': [
    { url: '/checklist-segunda-opinion/', icon: '🔍', name: 'Segunda Opinión', description: '¿Has buscado razones para NO?' },
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: '¿Decides bien o decides rápido?' },
    { url: '/diagnostico-explotacion-exploracion/', icon: '⚖️', name: 'Explotación vs Exploración', description: '¿Corto plazo o largo plazo?' },
    { url: '/mapa-riesgo-emprendedor/', icon: '🎲', name: 'Riesgo Emprendedor', description: '¿Qué pasa si no funciona?' },
  ],
  // Cat.2: Uso Inteligente de IA — enlaza entre sí + cat.4 (productividad)
  'diagnostico-brecha-ia': [
    { url: '/evaluador-prompts/', icon: '💬', name: 'Evaluador de Prompts', description: '¿Tus instrucciones a la IA son buenas?' },
    { url: '/test-dependencia-tecnologica/', icon: '🔗', name: 'Dependencia Tecnológica', description: '¿Podrías trabajar sin IA?' },
    { url: '/mapa-automatizacion-personal/', icon: '🗺️', name: 'Automatización Personal', description: '¿Qué automatizar y qué proteger?' },
    { url: '/auditoria-habilidades-mercado/', icon: '🎯', name: 'Habilidades vs Mercado', description: '¿Lo que sabes es lo que se necesita?' },
  ],
  'evaluador-prompts': [
    { url: '/diagnostico-brecha-ia/', icon: '🧠', name: 'Brecha IA', description: '¿Usas la IA para pensar mejor?' },
    { url: '/mapa-automatizacion-personal/', icon: '🗺️', name: 'Automatización Personal', description: '¿Qué automatizar y qué proteger?' },
    { url: '/test-dependencia-tecnologica/', icon: '🔗', name: 'Dependencia Tecnológica', description: '¿Podrías trabajar sin IA?' },
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: '¿Decides bien o decides rápido?' },
  ],
  'test-dependencia-tecnologica': [
    { url: '/diagnostico-brecha-ia/', icon: '🧠', name: 'Brecha IA', description: '¿Usas la IA para pensar mejor?' },
    { url: '/evaluador-prompts/', icon: '💬', name: 'Evaluador de Prompts', description: '¿Tus instrucciones a la IA son buenas?' },
    { url: '/auditoria-habilidades-mercado/', icon: '🎯', name: 'Habilidades vs Mercado', description: '¿Lo que sabes es lo que se necesita?' },
    { url: '/diagnostico-multitarea/', icon: '🔀', name: 'Diagnóstico Multitarea', description: '¿Tu multitarea es productiva?' },
  ],
  'mapa-automatizacion-personal': [
    { url: '/diagnostico-brecha-ia/', icon: '🧠', name: 'Brecha IA', description: '¿Usas la IA para pensar mejor?' },
    { url: '/evaluador-prompts/', icon: '💬', name: 'Evaluador de Prompts', description: '¿Tus instrucciones a la IA son buenas?' },
    { url: '/diagnostico-multitarea/', icon: '🔀', name: 'Diagnóstico Multitarea', description: '¿Fragmentación o foco?' },
    { url: '/mapa-compromisos-capacidad/', icon: '📋', name: 'Compromisos vs Capacidad', description: '¿Has dicho sí a demasiado?' },
  ],
  // Cat.3: Carrera Profesional — enlaza entre sí + cat.6 (emprendimiento) y cat.4 (productividad)
  'diagnostico-estancamiento-profesional': [
    { url: '/auditoria-habilidades-mercado/', icon: '🎯', name: 'Habilidades vs Mercado', description: '¿Lo que sabes es lo que se necesita?' },
    { url: '/test-sindrome-impostor/', icon: '🎭', name: 'Síndrome del Impostor', description: '¿Subestimas tu competencia?' },
    { url: '/auditoria-energia-semanal/', icon: '🔋', name: 'Energía Semanal', description: '¿Dónde gastas energía sin retorno?' },
    { url: '/mapa-dependencia-clientes/', icon: '📊', name: 'Dependencia Clientes', description: '¿Tu negocio depende de pocos?' },
  ],
  'mapa-dependencia-clientes': [
    { url: '/diagnostico-modelo-negocio/', icon: '🏛️', name: 'Modelo de Negocio', description: '¿Tus pilares están equilibrados?' },
    { url: '/mapa-riesgo-emprendedor/', icon: '🎲', name: 'Riesgo Emprendedor', description: '¿Qué pasa si no funciona?' },
    { url: '/auditoria-propuesta-valor/', icon: '💎', name: 'Propuesta de Valor', description: '¿Tu oferta encaja con la necesidad?' },
    { url: '/diagnostico-estancamiento-profesional/', icon: '🌊', name: 'Estancamiento Profesional', description: '¿Confort, estrés o flujo?' },
  ],
  'auditoria-habilidades-mercado': [
    { url: '/diagnostico-estancamiento-profesional/', icon: '🌊', name: 'Estancamiento Profesional', description: '¿Confort, estrés o flujo?' },
    { url: '/test-sindrome-impostor/', icon: '🎭', name: 'Síndrome del Impostor', description: '¿Subestimas tu competencia?' },
    { url: '/diagnostico-brecha-ia/', icon: '🧠', name: 'Brecha IA', description: '¿Usas la IA para pensar mejor?' },
    { url: '/test-dependencia-tecnologica/', icon: '🔗', name: 'Dependencia Tecnológica', description: '¿Podrías trabajar sin IA?' },
  ],
  'test-sindrome-impostor': [
    { url: '/diagnostico-estancamiento-profesional/', icon: '🌊', name: 'Estancamiento Profesional', description: '¿Confort, estrés o flujo?' },
    { url: '/auditoria-habilidades-mercado/', icon: '🎯', name: 'Habilidades vs Mercado', description: '¿Lo que sabes es lo que se necesita?' },
    { url: '/auditoria-energia-semanal/', icon: '🔋', name: 'Energía Semanal', description: '¿Dónde gastas energía sin retorno?' },
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Los sesgos que afectan tu autopercepción' },
  ],
  // Cat.4: Productividad y Ritmo Vital — enlaza entre sí + cat.3 (carrera)
  'test-ritmo-vital': [
    { url: '/auditoria-energia-semanal/', icon: '🔋', name: 'Energía Semanal', description: '¿Dónde gastas energía sin retorno?' },
    { url: '/diagnostico-multitarea/', icon: '🔀', name: 'Diagnóstico Multitarea', description: '¿Fragmentación o foco?' },
    { url: '/mapa-compromisos-capacidad/', icon: '📋', name: 'Compromisos vs Capacidad', description: '¿Has dicho sí a demasiado?' },
    { url: '/diagnostico-estancamiento-profesional/', icon: '🌊', name: 'Estancamiento Profesional', description: '¿Confort, estrés o flujo?' },
  ],
  'auditoria-energia-semanal': [
    { url: '/test-ritmo-vital/', icon: '🌿', name: 'Test de Ritmo Vital', description: '¿Vives en modo urgencia?' },
    { url: '/mapa-compromisos-capacidad/', icon: '📋', name: 'Compromisos vs Capacidad', description: '¿Has dicho sí a demasiado?' },
    { url: '/diagnostico-multitarea/', icon: '🔀', name: 'Diagnóstico Multitarea', description: '¿Fragmentación o foco?' },
    { url: '/test-sindrome-impostor/', icon: '🎭', name: 'Síndrome del Impostor', description: '¿Te autoexiges en exceso?' },
  ],
  'diagnostico-multitarea': [
    { url: '/auditoria-energia-semanal/', icon: '🔋', name: 'Energía Semanal', description: '¿Dónde gastas energía sin retorno?' },
    { url: '/test-ritmo-vital/', icon: '🌿', name: 'Test de Ritmo Vital', description: '¿Vives en modo urgencia?' },
    { url: '/mapa-compromisos-capacidad/', icon: '📋', name: 'Compromisos vs Capacidad', description: '¿Has dicho sí a demasiado?' },
    { url: '/mapa-automatizacion-personal/', icon: '🗺️', name: 'Automatización Personal', description: '¿Qué automatizar y qué proteger?' },
  ],
  'mapa-compromisos-capacidad': [
    { url: '/auditoria-energia-semanal/', icon: '🔋', name: 'Energía Semanal', description: '¿Dónde gastas energía sin retorno?' },
    { url: '/test-ritmo-vital/', icon: '🌿', name: 'Test de Ritmo Vital', description: '¿Vives en modo urgencia?' },
    { url: '/diagnostico-multitarea/', icon: '🔀', name: 'Diagnóstico Multitarea', description: '¿Fragmentación o foco?' },
    { url: '/analisis-decision-reversible/', icon: '🚪', name: 'Decisión Reversible', description: '¿Puedes probar sin riesgo?' },
  ],
  // Cat.5: Pensamiento Crítico — enlaza entre sí + cat.1 (management)
  'detector-sesgos-cognitivos': [
    { url: '/analisis-decision-reversible/', icon: '🚪', name: 'Decisión Reversible', description: '¿Das vueltas a lo que podrías probar?' },
    { url: '/checklist-segunda-opinion/', icon: '🔍', name: 'Segunda Opinión', description: '¿Has buscado razones para NO?' },
    { url: '/test-pensamiento-grupo/', icon: '🫧', name: 'Pensamiento de Grupo', description: '¿Tu equipo debate o confirma?' },
    { url: '/checklist-pre-mortem/', icon: '🔍', name: 'Checklist Pre-Mortem', description: 'Anticipa fallos antes de actuar' },
  ],
  'analisis-decision-reversible': [
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: '¿Decides bien o decides rápido?' },
    { url: '/checklist-segunda-opinion/', icon: '🔍', name: 'Segunda Opinión', description: '¿Has buscado razones para NO?' },
    { url: '/mapa-compromisos-capacidad/', icon: '📋', name: 'Compromisos vs Capacidad', description: '¿Has dicho sí a demasiado?' },
    { url: '/mapa-riesgo-emprendedor/', icon: '🎲', name: 'Riesgo Emprendedor', description: '¿Qué pasa si no funciona?' },
  ],
  'test-pensamiento-grupo': [
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: '¿Decides bien o decides rápido?' },
    { url: '/checklist-segunda-opinion/', icon: '🔍', name: 'Segunda Opinión', description: '¿Has buscado razones para NO?' },
    { url: '/test-delegacion-efectiva/', icon: '🤝', name: 'Test de Delegación', description: '¿Delegas bien o solo sueltas?' },
    { url: '/diagnostico-comunicacion-interna/', icon: '📡', name: 'Comunicación Interna', description: '¿Rápido o profundo?' },
  ],
  'checklist-segunda-opinion': [
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: '¿Decides bien o decides rápido?' },
    { url: '/analisis-decision-reversible/', icon: '🚪', name: 'Decisión Reversible', description: '¿Puedes probar sin riesgo?' },
    { url: '/test-pensamiento-grupo/', icon: '🫧', name: 'Pensamiento de Grupo', description: '¿Tu equipo debate o confirma?' },
    { url: '/checklist-pre-mortem/', icon: '🔍', name: 'Checklist Pre-Mortem', description: 'Anticipa fallos antes de actuar' },
  ],
  // Cat.6: Emprendimiento — enlaza entre sí + cat.3 (carrera)
  'diagnostico-modelo-negocio': [
    { url: '/auditoria-propuesta-valor/', icon: '💎', name: 'Propuesta de Valor', description: '¿Tu oferta encaja con la necesidad?' },
    { url: '/test-validacion-idea/', icon: '🧪', name: 'Validación de Idea', description: '¿Tu idea resuelve un problema real?' },
    { url: '/mapa-riesgo-emprendedor/', icon: '🎲', name: 'Riesgo Emprendedor', description: '¿Qué pasa si no funciona?' },
    { url: '/mapa-dependencia-clientes/', icon: '📊', name: 'Dependencia Clientes', description: '¿Tu negocio depende de pocos?' },
  ],
  'test-validacion-idea': [
    { url: '/diagnostico-modelo-negocio/', icon: '🏛️', name: 'Modelo de Negocio', description: '¿Tus pilares están equilibrados?' },
    { url: '/auditoria-propuesta-valor/', icon: '💎', name: 'Propuesta de Valor', description: '¿Tu oferta encaja con la necesidad?' },
    { url: '/mapa-riesgo-emprendedor/', icon: '🎲', name: 'Riesgo Emprendedor', description: '¿Qué pasa si no funciona?' },
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: '¿Tus asunciones son sesgos?' },
  ],
  'mapa-riesgo-emprendedor': [
    { url: '/diagnostico-modelo-negocio/', icon: '🏛️', name: 'Modelo de Negocio', description: '¿Tus pilares están equilibrados?' },
    { url: '/test-validacion-idea/', icon: '🧪', name: 'Validación de Idea', description: '¿Tu idea resuelve un problema real?' },
    { url: '/analisis-decision-reversible/', icon: '🚪', name: 'Decisión Reversible', description: '¿Puedes probar sin riesgo?' },
    { url: '/checklist-pre-mortem/', icon: '🔍', name: 'Checklist Pre-Mortem', description: 'Anticipa fallos antes de lanzar' },
  ],
  'auditoria-propuesta-valor': [
    { url: '/diagnostico-modelo-negocio/', icon: '🏛️', name: 'Modelo de Negocio', description: '¿Tus pilares están equilibrados?' },
    { url: '/test-validacion-idea/', icon: '🧪', name: 'Validación de Idea', description: '¿Tu idea resuelve un problema real?' },
    { url: '/mapa-dependencia-clientes/', icon: '📊', name: 'Dependencia Clientes', description: '¿Tu negocio depende de pocos?' },
    { url: '/auditoria-habilidades-mercado/', icon: '🎯', name: 'Habilidades vs Mercado', description: '¿Lo que ofreces es lo que se necesita?' },
  ],
  'cronometro': productividadApps,
  'comparador-transporte-viaje': viajesApps.filter(a => a.url !== '/comparador-transporte-viaje/').slice(0, 4),
  'guia-seguro-viaje': viajesApps.filter(a => a.url !== '/guia-seguro-viaje/').slice(0, 4),
  'lista-equipaje': viajesApps.filter(a => a.url !== '/lista-equipaje/').slice(0, 4),
  'checklist-documentos-viaje': viajesApps.filter(a => a.url !== '/checklist-documentos-viaje/').slice(0, 4),
  'conversor-horarios': viajesApps.filter(a => a.url !== '/conversor-horarios/').slice(0, 4),
  'calculadora-combustible': viajesApps.filter(a => a.url !== '/calculadora-combustible/').slice(0, 4),
  'informacion-tiempo': viajesApps.filter(a => a.url !== '/informacion-tiempo/').slice(0, 4),
  'conversor-divisas': viajesApps.filter(a => a.url !== '/conversor-divisas/').slice(0, 4),
  'presupuesto-viaje': viajesApps.filter(a => a.url !== '/presupuesto-viaje/').slice(0, 4),
  'enchufes-por-pais': viajesApps.filter(a => a.url !== '/enchufes-por-pais/').slice(0, 4),
  'comparador-coste-vida': viajesApps.filter(a => a.url !== '/comparador-coste-vida/').slice(0, 4),
  'simulador-jet-lag': viajesApps.filter(a => a.url !== '/orientador-jet-lag/').slice(0, 4),
  'planificador-itinerario': viajesApps.filter(a => a.url !== '/planificador-itinerario/').slice(0, 4),
  'generador-actas': [...productividadApps.slice(0, 2), ...textoApps.slice(0, 2)],

  // JUEGOS
  'juego-asteroids': juegosArcadeApps.filter(a => a.url !== '/juego-asteroids/'),
  'juego-space-invaders': juegosArcadeApps.filter(a => a.url !== '/juego-space-invaders/'),
  'juego-platform-runner': juegosArcadeApps.filter(a => a.url !== '/juego-platform-runner/'),
  'juego-2048': [...juegosPuzzleApps.slice(0, 2), ...juegosArcadeApps.slice(0, 2)],
  'juego-sudoku': juegosPuzzleApps.filter(a => a.url !== '/juego-sudoku/').slice(0, 4),
  'juego-wordle': juegosPuzzleApps.filter(a => a.url !== '/juego-wordle/').slice(0, 4),
  'juego-ahorcado': juegosPuzzleApps.filter(a => a.url !== '/juego-ahorcado/').slice(0, 4),
  'quiz-paises-capitales': [
    { url: '/paises-del-mundo/', icon: '🌍', name: 'Países del Mundo', description: 'Buscador de 195 países' },
    { url: '/quiz-verbos-irregulares/', icon: '📝', name: 'Quiz Verbos Inglés', description: 'Aprende verbos irregulares' },
    { url: '/juego-ahorcado/', icon: '🎯', name: 'Ahorcado', description: 'Adivina la palabra' },
    { url: '/juego-wordle/', icon: '🔤', name: 'Wordle', description: 'Adivina la palabra del día' },
  ],
  'quiz-verbos-irregulares': [
    { url: '/quiz-paises-capitales/', icon: '🌍', name: 'Quiz Países', description: 'Capitales y banderas del mundo' },
    { url: '/quiz-figuras-retoricas/', icon: '✍️', name: 'Quiz Figuras Retóricas', description: 'Identifica recursos literarios' },
    { url: '/juego-ahorcado/', icon: '🎯', name: 'Ahorcado', description: 'Adivina la palabra' },
    { url: '/conjugador-verbos/', icon: '📖', name: 'Conjugador Verbos', description: 'Verbos en español' },
  ],
  'quiz-figuras-retoricas': [
    { url: '/quiz-verbos-irregulares/', icon: '📝', name: 'Quiz Verbos Inglés', description: 'Past simple A1-B2' },
    { url: '/quiz-reinos-naturaleza/', icon: '🔬', name: 'Quiz Reinos Naturaleza', description: '43 organismos sorprendentes' },
    { url: '/quiz-paises-capitales/', icon: '🌍', name: 'Quiz Países', description: 'Capitales y banderas del mundo' },
    { url: '/conjugador-verbos/', icon: '📖', name: 'Conjugador Verbos', description: 'Verbos en español' },
  ],
  'quiz-reinos-naturaleza': [
    { url: '/quiz-figuras-retoricas/', icon: '✍️', name: 'Quiz Figuras Retóricas', description: 'Identifica recursos literarios' },
    { url: '/quiz-verbos-irregulares/', icon: '📝', name: 'Quiz Verbos Inglés', description: 'Past simple A1-B2' },
    { url: '/quiz-simbolos-quimicos/', icon: '⚗️', name: 'Quiz Símbolos Químicos', description: 'Aprende la tabla periódica' },
    { url: '/quiz-paises-capitales/', icon: '🌍', name: 'Quiz Países', description: 'Capitales y banderas del mundo' },
  ],
  'quiz-simbolos-quimicos': [
    { url: '/quiz-reinos-naturaleza/', icon: '🔬', name: 'Quiz Reinos Naturaleza', description: '43 organismos sorprendentes' },
    { url: '/quiz-paises-capitales/', icon: '🌍', name: 'Quiz Países', description: 'Capitales y banderas del mundo' },
    { url: '/quiz-figuras-retoricas/', icon: '✍️', name: 'Quiz Figuras Retóricas', description: 'Identifica recursos literarios' },
    { url: '/tabla-periodica/', icon: '🧪', name: 'Tabla Periódica', description: 'Consulta los 118 elementos' },
  ],
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
  'extractor-audio-video': audioApps.filter(a => a.url !== '/extractor-audio-video/'),
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
  'generador-gitignore': webDevApps,
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
  'calculadora-reformas-hogar': [
    { url: '/calculadora-pintura/', icon: '🎨', name: 'Calculadora Pintura', description: 'Litros necesarios por m²' },
    { url: '/calculadora-materiales-construccion/', icon: '🧱', name: 'Materiales de Construcción', description: 'Azulejos, tarima y mortero' },
    { url: '/calculadora-eficiencia-energetica/', icon: '⚡', name: 'Eficiencia Energética', description: 'Ahorro con mejoras energéticas' },
    { url: '/calculadora-gasto-energetico/', icon: '💡', name: 'Gasto Energético', description: 'Consumo eléctrico' },
  ],

  // BRICOLAJE Y REFORMAS
  'calculadora-materiales-construccion': bricolajeApps.filter(a => a.url !== '/calculadora-materiales-construccion/').slice(0, 4),
  'calculadora-eficiencia-energetica': [
    { url: '/calculadora-materiales-construccion/', icon: '🧱', name: 'Materiales de Construcción', description: 'Azulejos, pintura, tarima y mortero' },
    { url: '/calculadora-gasto-energetico/', icon: '💡', name: 'Gasto Energético', description: 'Consumo eléctrico de electrodomésticos' },
    { url: '/estimador-reformas-hogar/', icon: '🏗️', name: 'Estimador Reformas', description: 'Presupuesto por tipo de reforma' },
    { url: '/calculadora-huella-carbono/', icon: '🌍', name: 'Huella de Carbono', description: 'Tu impacto ambiental' },
  ],
  'calculadora-piscinas': [
    { url: '/calculadora-materiales-construccion/', icon: '🧱', name: 'Materiales de Construcción', description: 'Azulejos, pintura, tarima y mortero' },
    { url: '/calculadora-eficiencia-energetica/', icon: '⚡', name: 'Eficiencia Energética', description: 'Ahorro con mejoras en el hogar' },
    { url: '/calculadora-gasto-energetico/', icon: '💡', name: 'Gasto Energético', description: 'Consumo eléctrico de equipos' },
    { url: '/calculadora-huella-carbono/', icon: '🌍', name: 'Huella de Carbono', description: 'Tu impacto ambiental' },
  ],

  // FAMILIA
  'planificador-embarazo': [
    ...saludFemeninaApps.filter(a => a.url !== '/planificador-embarazo/'),
    ...familiaApps.filter(a => a.url !== '/planificador-embarazo/' && !saludFemeninaApps.some(s => s.url === a.url)),
  ],
  'calculadora-percentiles': familiaApps.filter(a => a.url !== '/orientador-percentiles/'),
  'estimacion-prestacion-nacimiento': familiaApps.filter(a => a.url !== '/estimacion-prestacion-nacimiento/'),
  'estimacion-baja-maternal': familiaApps.filter(a => a.url !== '/estimacion-baja-maternal/'),
  'planificador-gastos-bebe': familiaApps.filter(a => a.url !== '/planificador-gastos-bebe/'),
  'estimacion-deduccion-maternidad': familiaApps.filter(a => a.url !== '/estimacion-deduccion-maternidad/'),
  'test-estilo-parental': familiaApps.filter(a => a.url !== '/test-estilo-parental/'),

  // SALUD FEMENINA
  'seguimiento-ciclo-menstrual': saludFemeninaApps.filter(a => a.url !== '/seguimiento-ciclo-menstrual/'),
  'calculadora-fechas': [...familiaApps.filter(a => a.url !== '/calculadora-fechas/'), ...productividadApps.slice(0, 2)],

  // FÍSICA Y QUÍMICA
  'calculadora-movimiento': [{ url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales interactivas' }, ...matematicasAvanzadasApps.slice(0, 2), { url: '/conversor-unidades/', icon: '📏', name: 'Conversor Unidades', description: 'Longitud, peso, etc.' }],
  'simulador-fisica': [{ url: '/calculadora-movimiento/', icon: '🚀', name: 'Calculadora Movimiento', description: 'MRU, MRUA, caída libre' }, { url: '/conversor-unidades/', icon: '📏', name: 'Conversor Unidades', description: 'Longitud, peso, etc.' }, { url: '/calculadora-electricidad/', icon: '⚡', name: 'Electricidad', description: 'Ley de Ohm, potencia' }, { url: '/tabla-periodica/', icon: '⚗️', name: 'Tabla Periódica', description: 'Elementos químicos' }],
  'calculadora-electricidad': [{ url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales' }, { url: '/calculadora-gasto-energetico/', icon: '⚡', name: 'Gasto Energético', description: 'Consumo eléctrico' }, ...matematicasAvanzadasApps.slice(0, 2)],
  'tabla-periodica': [{ url: '/glosario-fisica-quimica/', icon: '📖', name: 'Glosario', description: 'Términos de física y química' }, { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales' }, ...matematicasBasicasApps.slice(0, 1)],
  'glosario-fisica-quimica': [{ url: '/tabla-periodica/', icon: '⚗️', name: 'Tabla Periódica', description: 'Elementos químicos' }, { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales' }, ...matematicasBasicasApps.slice(0, 1)],

  // UTILIDADES EXTRA
  'calculadora-propinas': [
    { url: '/conversor-divisas/', icon: '💱', name: 'Conversor Divisas', description: 'Tipos de cambio BCE' },
    { url: '/presupuesto-viaje/', icon: '🗺️', name: 'Presupuesto Viaje', description: 'Planifica gastos' },
    ...cocinaApps.slice(0, 2),
  ],
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
    { url: '/quiz-paises-capitales/', icon: '🌍', name: 'Quiz Países', description: 'Pon a prueba tu geografía' },
    { url: '/conversor-divisas/', icon: '💱', name: 'Conversor Divisas', description: 'Tipos de cambio BCE' },
    { url: '/enchufes-por-pais/', icon: '🔌', name: 'Enchufes por País', description: 'Qué adaptador llevar' },
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

  // GUÍAS
  'guia-ahorrar-dinero': [
    { url: '/control-gastos/', icon: '📊', name: 'Control de Gastos', description: 'Registra y categoriza tus gastos' },
    { url: '/orientador-regla-50-30-20/', icon: '🥧', name: 'Regla 50/30/20', description: 'Distribuye tu sueldo' },
    { url: '/estimador-fondo-emergencia/', icon: '🛡️', name: 'Fondo de Emergencia', description: 'Tu colchón de seguridad' },
    { url: '/estimador-deuda/', icon: '🧨', name: 'Eliminar Deudas', description: 'Bola de nieve vs avalancha' },
  ],
  'guia-vivir-sano': [
    { url: '/orientador-imc/', icon: '⚖️', name: 'Calculadora de IMC', description: 'Peso e índice de masa corporal' },
    { url: '/calculadora-macros/', icon: '🥗', name: 'Calculadora de Macros', description: 'Proteínas, carbos y grasas' },
    { url: '/calculadora-hidratacion/', icon: '💧', name: 'Hidratación Diaria', description: 'Cuánta agua necesitas' },
    { url: '/seguimiento-habitos/', icon: '✅', name: 'Seguimiento de Hábitos', description: 'Crea hábitos duraderos' },
  ],
  'guia-comprar-coche': [
    { url: '/selector-vehiculo/', icon: '🔍', name: 'Selector de Vehículo', description: '¿Qué tipo de coche te conviene?' },
    { url: '/comparador-vehiculos/', icon: '🚗', name: 'Comparador de Vehículos', description: 'Contado vs financiación vs renting' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora Combustible', description: 'Coste anual de carburante' },
    { url: '/estimador-prestamos/', icon: '🏦', name: 'Estimador de Préstamos', description: 'Cuota y coste total' },
  ],
  'guia-montar-negocio': [
    { url: '/estimador-break-even/', icon: '⚖️', name: 'Break-Even', description: 'Punto de equilibrio del negocio' },
    { url: '/planificador-cashflow/', icon: '💸', name: 'Planificador Cashflow', description: 'Flujo de caja mensual' },
    { url: '/orientador-tarifa-freelance/', icon: '💰', name: 'Tarifa Freelance', description: 'Cuánto cobrar por hora' },
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Facturas con IVA e IRPF' },
  ],
  'guia-pensar-mejor': [
    { url: '/diagnostico-estancamiento-profesional/', icon: '🌊', name: 'Estancamiento Profesional', description: '¿Confort, estrés o flujo?' },
    { url: '/detector-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: '¿Decides bien o decides rápido?' },
    { url: '/test-validacion-idea/', icon: '🧪', name: 'Validación de Idea', description: '¿Tu idea resuelve un problema real?' },
    { url: '/diagnostico-modelo-negocio/', icon: '🏛️', name: 'Modelo de Negocio', description: '¿Tus pilares están equilibrados?' },
  ],

  // ACCESIBILIDAD
  'adaptador-dislexia': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/temporizador-visual/', icon: '⏱️', name: 'Temporizador Visual', description: 'Timer con círculo de colores' },
    { url: '/planificador-chequeos-medicos/', icon: '🏥', name: 'Chequeos Médicos', description: 'Revisiones preventivas por edad' },
    { url: '/lector-texto-voz/', icon: '🔊', name: 'Lector de Texto', description: 'Lee textos en voz alta' },
  ],
  'temporizador-visual': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/adaptador-dislexia/', icon: '📖', name: 'Adaptador Dislexia', description: 'Lee textos con más facilidad' },
    { url: '/guia-respiracion/', icon: '🫁', name: 'Guía de Respiración', description: 'Técnicas de respiración consciente' },
    { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Productividad por ciclos' },
  ],
  'guia-respiracion': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/temporizador-visual/', icon: '⏱️', name: 'Temporizador Visual', description: 'Timer con círculo de colores' },
    { url: '/ejercicios-vocalizacion/', icon: '🎙️', name: 'Vocalización Parkinson', description: 'Ejercicios de voz guiados' },
    { url: '/calculadora-sueno/', icon: '😴', name: 'Calculadora Sueño', description: 'Ciclos de sueño óptimos' },
  ],
  'lector-texto-voz': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/adaptador-dislexia/', icon: '📖', name: 'Adaptador Dislexia', description: 'Lee textos con más facilidad' },
    { url: '/tablero-comunicacion/', icon: '💬', name: 'Tablero Comunicación', description: 'Símbolos AAC con voz' },
    { url: '/calculadora-legibilidad/', icon: '📊', name: 'Calculadora Legibilidad', description: 'Facilidad de lectura de textos' },
  ],
  'tablero-comunicacion': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/lector-texto-voz/', icon: '🔊', name: 'Lector de Texto', description: 'Lee textos en voz alta' },
    { url: '/temporizador-visual/', icon: '⏱️', name: 'Temporizador Visual', description: 'Timer con círculo de colores' },
    { url: '/semaforo-emocional/', icon: '🚦', name: 'Semáforo Emocional', description: 'Expresa tu estado emocional visualmente' },
  ],
  'ejercicios-vocalizacion': [
    { url: '/guia-respiracion/', icon: '🫁', name: 'Guía de Respiración', description: 'Técnicas de respiración consciente' },
    { url: '/planificador-rutinas/', icon: '📅', name: 'Planificador de Rutinas', description: 'Estructura el día visualmente' },
    { url: '/tablero-comunicacion/', icon: '💬', name: 'Tablero Comunicación', description: 'Símbolos AAC con voz' },
    { url: '/temporizador-visual/', icon: '⏱️', name: 'Temporizador Visual', description: 'Timer para los ejercicios' },
  ],
  'planificador-rutinas': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/temporizador-visual/', icon: '⏱️', name: 'Temporizador Visual', description: 'Timer con círculo de colores' },
    { url: '/tablero-comunicacion/', icon: '💬', name: 'Tablero Comunicación', description: 'Símbolos AAC para comunicar' },
    { url: '/semaforo-emocional/', icon: '🚦', name: 'Semáforo Emocional', description: 'Gestiona el estado emocional de la rutina' },
  ],
  'generador-tarjetas-comunicacion': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/tablero-comunicacion/', icon: '💬', name: 'Tablero Comunicación', description: 'Símbolos AAC en pantalla con voz' },
    { url: '/planificador-rutinas/', icon: '📅', name: 'Planificador de Rutinas', description: 'Agenda visual con pictogramas' },
    { url: '/historias-sociales/', icon: '📖', name: 'Historias Sociales', description: 'Usa las tarjetas para ilustrar historias' },
  ],
  'semaforo-emocional': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/guia-respiracion/', icon: '🫁', name: 'Guía de Respiración', description: 'Técnicas de calma para el estado rojo' },
    { url: '/planificador-rutinas/', icon: '📅', name: 'Planificador de Rutinas', description: 'Estructura el día para reducir activación' },
    { url: '/historias-sociales/', icon: '📖', name: 'Historias Sociales', description: 'Prepara situaciones que generan activación' },
  ],
  'recordatorio-medicacion': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/planificador-rutinas/', icon: '📅', name: 'Planificador de Rutinas', description: 'Organiza el día con horarios visuales' },
    { url: '/temporizador-visual/', icon: '⏱️', name: 'Temporizador Visual', description: 'Cuenta atrás hasta la próxima toma' },
    { url: '/semaforo-emocional/', icon: '🚦', name: 'Semáforo Emocional', description: 'Gestiona el estado emocional en el día' },
  ],
  'historias-sociales': [
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Kit completo de apoyos visuales en casa' },
    { url: '/semaforo-emocional/', icon: '🚦', name: 'Semáforo Emocional', description: 'Identifica el estado emocional antes de la situación' },
    { url: '/planificador-rutinas/', icon: '📅', name: 'Planificador de Rutinas', description: 'Organiza el día visualmente con pictogramas' },
    { url: '/tablero-comunicacion/', icon: '💬', name: 'Tablero Comunicación', description: 'Expresa emociones y necesidades con símbolos' },
  ],

  // GUÍA ACCESIBILIDAD
  'guia-accesibilidad': [
    { url: '/semaforo-emocional/', icon: '🚦', name: 'Semáforo Emocional', description: 'Regulación emocional visual' },
    { url: '/planificador-rutinas/', icon: '📅', name: 'Planificador de Rutinas', description: 'Agenda visual con pictogramas' },
    { url: '/temporizador-visual/', icon: '⏱️', name: 'Temporizador Visual', description: 'Timer con círculo de colores' },
    { url: '/adaptador-dislexia/', icon: '📖', name: 'Adaptador Dislexia', description: 'Textos más fáciles de leer' },
    { url: '/historias-sociales/', icon: '📖', name: 'Historias Sociales', description: 'Prepara situaciones nuevas' },
    { url: '/tablero-comunicacion/', icon: '💬', name: 'Tablero Comunicación', description: 'Símbolos AAC con voz' },
  ],

  // ==========================================
  // FAMILIA: LEGAL Y FISCAL
  // ==========================================
  'plazos-legales': [
    { url: '/comparador-formas-juridicas/', icon: '⚖️', name: 'Comparador Formas Jurídicas', description: 'Autónomo, SL, cooperativa...' },
    { url: '/asistente-constitucion-asociacion/', icon: '🎗️', name: 'Asistente Constitución Asociación', description: 'Genera el acta y estatutos' },
    { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Calcula tu precio por hora' },
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Facturas con IVA e IRPF' },
  ],
  'comparador-formas-juridicas': [
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción, garantías y reclamaciones' },
    { url: '/asistente-constitucion-asociacion/', icon: '🎗️', name: 'Asistente Constitución Asociación', description: 'Genera acta y estatutos' },
    { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Calcula tu precio por hora' },
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Facturas con IVA e IRPF' },
  ],
  'asistente-constitucion-asociacion': [
    { url: '/comparador-formas-juridicas/', icon: '⚖️', name: 'Comparador Formas Jurídicas', description: '¿Asociación o SL? Compara opciones' },
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción, garantías y reclamaciones' },
    { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Calcula tu precio por hora' },
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Facturas con IVA e IRPF' },
  ],
  // FAMILIA: FISCAL AUTÓNOMOS
  // ==========================================
  'estimador-cuota-autonomo': [
    { url: '/estimador-sueldo-neto/', icon: '💶', name: 'Estimador Sueldo Neto', description: 'Bruto a neto con IRPF y SS' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Orientador Gastos Deducibles', description: 'Qué puedes deducir como autónomo' },
    { url: '/asistente-alta-autonomo/', icon: '📋', name: 'Asistente Alta Autónomo', description: 'Trámites para darte de alta' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Plazos y obligaciones fiscales' },
  ],
  'estimador-smi': [
    { url: '/estimador-sueldo-neto/', icon: '💶', name: 'Estimador Sueldo Neto', description: 'Bruto a neto con IRPF y SS' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuota orientativa de tu renta' },
    { url: '/test-obligado-declarar-renta/', icon: '📋', name: '¿Obligado a declarar?', description: 'Test rápido para la Renta 2025' },
    { url: '/checklist-declaracion-renta/', icon: '📋', name: 'Checklist Renta', description: 'Documentos para tu declaración' },
  ],
  'estimador-sueldo-neto': [
    { url: '/estimador-smi/', icon: '💶', name: 'Estimador SMI 2026', description: 'Neto, atrasos y comparativa provincial' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Estimador Cuota Autónomo', description: 'Cuota RETA por ingresos reales' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Orientador Gastos Deducibles', description: 'Optimiza tus deducciones' },
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Facturas con IVA e IRPF' },
  ],
  'orientador-gastos-deducibles': [
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Estimador Cuota Autónomo', description: 'Cuota RETA por ingresos reales' },
    { url: '/estimador-sueldo-neto/', icon: '💶', name: 'Estimador Sueldo Neto', description: 'Bruto a neto con IRPF y SS' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'No pierdas ningún plazo fiscal' },
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Facturas con IVA e IRPF' },
  ],
  'calendario-fiscal-emprendedor': [
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Estimador Cuota Autónomo', description: 'Cuota RETA por ingresos reales' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Orientador Gastos Deducibles', description: 'Optimiza tus deducciones' },
    { url: '/asistente-alta-autonomo/', icon: '📋', name: 'Asistente Alta Autónomo', description: 'Trámites para darte de alta' },
    { url: '/comparador-formas-juridicas/', icon: '⚖️', name: 'Comparador Formas Jurídicas', description: 'Autónomo, SL, cooperativa...' },
  ],
  'asistente-alta-autonomo': [
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Estimador Cuota Autónomo', description: 'Cuánto pagarás a la Seguridad Social' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Tus obligaciones fiscales como autónomo' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Orientador Gastos Deducibles', description: 'Qué puedes deducir' },
    { url: '/comparador-autonomo-vs-sl/', icon: '⚖️', name: 'Comparador Autónomo vs SL', description: '¿Cuándo conviene una SL?' },
  ],
  // FAMILIA: IRPF Y FISCAL GENERAL
  // ==========================================
  'estimador-irpf': [
    { url: '/estimador-sueldo-neto/', icon: '💶', name: 'Estimador Sueldo Neto', description: 'IRPF + SS en tu nómina' },
    { url: '/estimador-plusvalias-irpf/', icon: '💹', name: 'Estimador Plusvalías IRPF', description: 'IRPF por venta de activos' },
    { url: '/comparador-autonomo-vs-sl/', icon: '⚖️', name: 'Comparador Autónomo vs SL', description: 'Comparativa fiscal completa' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Plazos y obligaciones fiscales' },
  ],
  'estimador-plusvalias-irpf': [
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuota íntegra declaración renta' },
    { url: '/estimador-compraventa-inmueble/', icon: '🏠', name: 'Estimador Compraventa', description: 'Todos los gastos de compraventa' },
    { url: '/estimador-sueldo-neto/', icon: '💶', name: 'Estimador Sueldo Neto', description: 'Tu sueldo neto con IRPF' },
    { url: '/comparador-formas-juridicas/', icon: '⚖️', name: 'Comparador Formas Jurídicas', description: 'Autónomo, SL, cooperativa...' },
  ],
  'orientador-contrato-mercantil': [
    { url: '/comparador-formas-juridicas/', icon: '⚖️', name: 'Comparador Formas Jurídicas', description: 'Autónomo, SL, cooperativa...' },
    { url: '/orientador-facturacion-retencion/', icon: '🧾', name: 'Retenciones en Facturas', description: 'Cuándo y cuánto retener' },
    { url: '/asistente-constitucion-sociedad/', icon: '🏢', name: 'Constitución Sociedad', description: 'Pasos para crear tu SL' },
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción y caducidad' },
  ],
  'orientador-facturacion-retencion': [
    { url: '/planificador-trimestres-freelance/', icon: '📅', name: 'Planificador Trimestral', description: 'Fechas modelos 303 y 130' },
    { url: '/checklist-cambio-regimen-autonomo/', icon: '📋', name: 'Cambio de Régimen Fiscal', description: 'De módulos a directa' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Estimador Cuota Autónomo', description: 'Cuota RETA por ingresos reales' },
    { url: '/orientador-gastos-deducibles/', icon: '💰', name: 'Gastos Deducibles', description: 'Qué puedes desgravar' },
  ],
  'checklist-cambio-regimen-autonomo': [
    { url: '/orientador-facturacion-retencion/', icon: '🧾', name: 'Retenciones en Facturas', description: 'Cuándo y cuánto retener' },
    { url: '/selector-regimen-fiscal-autonomo/', icon: '🔍', name: 'Selector Régimen Fiscal', description: 'Módulos, directa o SL' },
    { url: '/planificador-trimestres-freelance/', icon: '📅', name: 'Planificador Trimestral', description: 'Modelos 303, 130 y fechas' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Obligaciones y plazos anuales' },
  ],
  'comparador-autonomo-vs-sl': [
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Estimador Cuota Autónomo', description: 'Cuota RETA por ingresos reales' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuánto pagarás en la renta' },
    { url: '/comparador-formas-juridicas/', icon: '⚖️', name: 'Comparador Formas Jurídicas', description: 'Autónomo, SL, cooperativa...' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Obligaciones fiscales como autónomo o SL' },
  ],
  'selector-forma-juridica': [
    { url: '/comparador-autonomo-vs-sl/', icon: '⚖️', name: 'Comparador Autónomo vs SL', description: 'Comparativa fiscal completa con cifras reales' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Estimador Cuota Autónomo', description: 'Cuánto pagarás a la Seguridad Social' },
    { url: '/asistente-alta-autonomo/', icon: '📝', name: 'Asistente Alta Autónomo', description: 'Checklist para darte de alta como autónomo' },
    { url: '/asistente-constitucion-sociedad/', icon: '🏢', name: 'Asistente Constitución Sociedad', description: 'Pasos para constituir tu SL' },
  ],
  'estimador-impuesto-donaciones': [
    { url: '/estimador-impuesto-sucesiones/', icon: '⚖️', name: 'Estimador Sucesiones', description: 'Impuesto por recibir una herencia' },
    { url: '/orientacion-tramitacion-herencias/', icon: '📋', name: 'Orientación Herencias', description: 'Checklist y orden de gestiones' },
    { url: '/estimador-compraventa-inmueble/', icon: '🏠', name: 'Estimador Compraventa', description: 'Gastos de compraventa inmobiliaria' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuota orientativa de la renta' },
  ],
  'estimador-impuesto-sucesiones': [
    { url: '/estimador-impuesto-donaciones/', icon: '🎁', name: 'Estimador Donaciones', description: 'Impuesto por recibir una donación' },
    { url: '/orientacion-tramitacion-herencias/', icon: '📋', name: 'Orientación Herencias', description: 'Checklist y orden de gestiones' },
    { url: '/estimador-compraventa-inmueble/', icon: '🏠', name: 'Estimador Compraventa', description: 'Gastos de compraventa inmobiliaria' },
    { url: '/estimador-plusvalias-irpf/', icon: '💹', name: 'Estimador Plusvalías IRPF', description: 'Impuesto por venta de activos' },
  ],
  'orientacion-tramitacion-herencias': [
    { url: '/estimador-impuesto-sucesiones/', icon: '⚖️', name: 'Estimador Sucesiones', description: 'Cuánto pagas de IS según tu CCAA' },
    { url: '/declaracion-renta-fallecidos/', icon: '📋', name: 'Renta Persona Fallecida', description: 'Guía IRPF herederos paso a paso' },
    { url: '/estimador-compraventa-inmueble/', icon: '🏠', name: 'Estimador Compraventa', description: 'Gastos al vender inmuebles heredados' },
    { url: '/guia/herencias/', icon: '📜', name: 'Guía Herencias', description: 'Journey completo para gestionar la herencia' },
  ],
  'asistente-constitucion-sociedad': [
    { url: '/asistente-alta-autonomo/', icon: '📝', name: 'Asistente Alta Autónomo', description: 'Alternativa sin constituir sociedad' },
    { url: '/asistente-constitucion-asociacion/', icon: '🤝', name: 'Asistente Constitución Asociación', description: 'Para entidades sin ánimo de lucro' },
    { url: '/comparador-autonomo-vs-sl/', icon: '⚖️', name: 'Comparador Autónomo vs SL', description: '¿Cuándo conviene crear una SL?' },
    { url: '/comparador-formas-juridicas/', icon: '📊', name: 'Comparador Formas Jurídicas', description: 'SL, SA, cooperativa, autónomo...' },
  ],
  'guia-jubilacion': [
    { url: '/simulador-jubilacion-publica/', icon: '🏤', name: 'Simulador Jubilación Pública', description: 'Edad, pensión, anticipada y parcial' },
    { url: '/planificador-ahorro-jubilacion/', icon: '💹', name: 'Planificador de Ahorro', description: 'Brecha, ahorro y plan de pensiones' },
    { url: '/estimador-irpf-pensionista/', icon: '📊', name: 'IRPF Pensionista', description: 'Cuánto pagarás de renta' },
    { url: '/optimizador-rentas-60/', icon: '💰', name: 'Optimizador Rentas 60+', description: 'Estrategia fiscal jubilados' },
    { url: '/estimador-pension-viudedad/', icon: '💍', name: 'Pensión de Viudedad', description: 'Protección familiar' },
  ],
  'guia-herencias': [
    { url: '/orientacion-tramitacion-herencias/', icon: '📋', name: 'Orientación Herencias', description: 'Checklist interactivo de documentos' },
    { url: '/estimador-impuesto-sucesiones/', icon: '⚖️', name: 'Estimador Sucesiones', description: 'Cuánto pagas de IS según tu CCAA' },
    { url: '/estimador-impuesto-donaciones/', icon: '🎁', name: 'Estimador Donaciones', description: 'Impuesto por recibir una donación' },
    { url: '/estimador-compraventa-inmueble/', icon: '🏠', name: 'Estimador Compraventa', description: 'Gastos al vender inmuebles heredados' },
  ],
  'estimador-plusvalia-municipal': [
    { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Gastos de Compraventa', description: 'ITP, notaría, registro y gestoría' },
    { url: '/estimador-impuesto-sucesiones/', icon: '⚖️', name: 'Estimador Sucesiones', description: 'Impuesto de herencias por CCAA' },
    { url: '/estimador-plusvalias-irpf/', icon: '💹', name: 'Plusvalías en IRPF', description: 'IRPF por ganancias patrimoniales' },
    { url: '/orientacion-tramitacion-herencias/', icon: '📋', name: 'Orientación Herencias', description: 'Guía para tramitar una herencia' },
  ],
  'orientador-intereses-demora': [
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador de Facturas', description: 'Crea facturas profesionales' },
    { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Calcula tu tarifa hora sostenible' },
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción y caducidad en España' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Gastos Deducibles', description: 'Qué puedes deducir como autónomo' },
  ],
  'test-obligado-declarar-renta': [
    { url: '/checklist-declaracion-renta/', icon: '📋', name: 'Checklist Renta', description: 'Documentos que necesitas para declarar' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuota orientativa de tu declaración' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Plazos y obligaciones fiscales' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Gastos Deducibles', description: 'Qué puedes deducir en tu renta' },
  ],
  'checklist-declaracion-renta': [
    { url: '/test-obligado-declarar-renta/', icon: '📋', name: '¿Obligado a declarar?', description: 'Test: ¿debes presentar la Renta 2025?' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuota orientativa de tu declaración' },
    { url: '/declaracion-renta-fallecidos/', icon: '📋', name: 'Renta Persona Fallecida', description: 'Guía IRPF herederos paso a paso' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Plazos y obligaciones fiscales' },
  ],
  'declaracion-renta-fallecidos': [
    { url: '/orientacion-tramitacion-herencias/', icon: '📋', name: 'Tramitar una Herencia', description: 'Checklist y orden de gestiones' },
    { url: '/estimador-impuesto-sucesiones/', icon: '⚖️', name: 'Estimador Sucesiones', description: 'Impuesto de herencias por CCAA' },
    { url: '/test-obligado-declarar-renta/', icon: '📋', name: '¿Obligado a declarar?', description: 'Test rápido para la Renta 2025' },
    { url: '/checklist-declaracion-renta/', icon: '📋', name: 'Checklist Renta', description: 'Documentos para tu declaración' },
  ],
  'orientador-deduccion-obras-energeticas': [
    { url: '/estimacion-certificacion-energetica/', icon: '🏷️', name: 'Certificación Energética', description: 'Estima tu letra A-G' },
    { url: '/simulador-subvenciones-rehabilitacion/', icon: '🏠', name: 'Subvenciones Rehabilitación', description: 'Ayudas Next Generation EU' },
    { url: '/calculadora-eficiencia-energetica/', icon: '⚡', name: 'Eficiencia Energética', description: 'ROI de reformas energéticas' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Cuota orientativa de tu renta' },
  ],
  'orientador-alquiler-habitaciones': [
    { url: '/estimador-actualizacion-alquiler/', icon: '🏠', name: 'Actualización Alquiler', description: 'IRAV e IPC para actualizar la renta' },
    { url: '/calculadora-rentabilidad-alquiler/', icon: '🏘️', name: 'Rentabilidad Alquiler', description: 'ROI, cash flow y payback' },
    { url: '/simulador-bono-joven-alquiler/', icon: '🏠', name: 'Bono Joven Alquiler', description: 'Comprueba si eres elegible' },
    { url: '/estimacion-certificacion-energetica/', icon: '⚡', name: 'Certificado Energético', description: 'Estima tu letra energética' },
  ],
  'estimador-actualizacion-alquiler': [
    { url: '/orientador-alquiler-habitaciones/', icon: '🏠', name: 'Alquiler por Habitaciones', description: 'Reglas en zona tensionada' },
    { url: '/calculadora-rentabilidad-alquiler/', icon: '🏘️', name: 'Rentabilidad Alquiler', description: 'ROI, cash flow y payback' },
    { url: '/orientador-alquiler-vs-compra/', icon: '⚖️', name: 'Alquiler vs Compra', description: 'Análisis financiero' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
  ],
  'requisitos-nomada-digital': [
    { url: '/asistente-alta-autonomo/', icon: '📋', name: 'Asistente Alta Autónomo', description: 'Trámites para darte de alta' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Cuota de Autónomo', description: 'Estima tu cuota RETA mensual' },
    { url: '/orientador-tarifa-freelance/', icon: '💰', name: 'Tarifa Freelance', description: 'Calcula tu precio por hora' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Gastos Deducibles', description: 'Qué puedes deducir en IRPF e IVA' },
  ],

  // JUBILACIÓN Y PATRIMONIO
  'simulador-jubilacion-publica': [
    ...jubilacionApps.filter(a => a.url !== '/simulador-jubilacion-publica/'),
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Qué pagarás de renta' },
  ],
  'planificador-ahorro-jubilacion': [
    ...jubilacionApps.filter(a => a.url !== '/planificador-ahorro-jubilacion/'),
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Qué pagarás de renta' },
  ],
  'estimador-irpf-pensionista': [
    ...jubilacionApps.filter(a => a.url !== '/estimador-irpf-pensionista/').slice(0, 4),
  ],
  'adaptacion-hogar': [
    ...saludMayoresApps.filter(a => a.url !== '/adaptacion-hogar/'),
  ],
  'residencia-vs-cuidado-en-casa': [
    ...saludMayoresApps.filter(a => a.url !== '/residencia-vs-cuidado-en-casa/'),
  ],
  'estimador-riesgo-osteoporosis': [
    ...saludMayoresApps.filter(a => a.url !== '/estimador-riesgo-osteoporosis/'),
  ],
  'test-fragilidad': [
    ...saludMayoresApps.filter(a => a.url !== '/test-fragilidad/'),
  ],
  'orientador-grado-dependencia': [
    ...saludMayoresApps.filter(a => a.url !== '/orientador-grado-dependencia/'),
  ],
  'orientador-discapacidad': [
    ...saludMayoresApps.filter(a => a.url !== '/orientador-discapacidad/'),
  ],
  'estimacion-prestaciones-dependencia': [
    ...saludMayoresApps.filter(a => a.url !== '/estimacion-prestaciones-dependencia/'),
  ],
  'planificador-turnos-cuidadores': [
    ...saludMayoresApps.filter(a => a.url !== '/planificador-turnos-cuidadores/'),
  ],
  'test-zarit-cuidador': [
    ...saludMayoresApps.filter(a => a.url !== '/test-zarit-cuidador/'),
  ],
  'estimacion-deduccion-discapacidad': [
    ...saludMayoresApps.filter(a => a.url !== '/estimacion-deduccion-discapacidad/'),
  ],
  'checklist-tramites-dependencia': [
    ...saludMayoresApps.filter(a => a.url !== '/checklist-tramites-dependencia/'),
  ],
  'simulador-bono-joven-alquiler': [
    { url: '/orientador-aval-ico/', icon: '🏡', name: 'Aval ICO Vivienda', description: 'Primera vivienda sin el 20% de entrada' },
    { url: '/orientador-alquiler-vs-compra/', icon: '⚖️', name: 'Alquiler vs Compra', description: 'Análisis financiero completo' },
    { url: '/calculadora-rentabilidad-alquiler/', icon: '🏘️', name: 'Rentabilidad Alquiler', description: 'ROI si inviertes en un piso' },
    { url: '/estimador-hipoteca/', icon: '🏠', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
  ],
  'orientador-aval-ico': [
    { url: '/simulador-bono-joven-alquiler/', icon: '🏠', name: 'Bono Joven Alquiler', description: 'Hasta 250 €/mes durante 2 años' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Gastos de Compraventa', description: 'ITP, notaría y registro' },
    { url: '/orientador-alquiler-vs-compra/', icon: '🔑', name: 'Alquiler vs Compra', description: 'Análisis financiero completo' },
  ],
  'calculadora-costes-teletrabajo': [
    { url: '/requisitos-nomada-digital/', icon: '🌍', name: 'Visa Nómada Digital', description: '¿Puedes trabajar desde España?' },
    { url: '/calculadora-productividad/', icon: '⚡', name: 'Calculadora Productividad', description: 'Mide tu eficiencia real' },
    { url: '/estimador-sueldo-neto/', icon: '💶', name: 'Sueldo Neto', description: 'Cuánto cobras después de impuestos' },
    { url: '/lista-tareas/', icon: '✅', name: 'Lista de Tareas', description: 'Organiza tu trabajo en casa' },
  ],
  'quiz-historia-espana': [
    { url: '/quiz-geografia-espana/', icon: '🌍', name: 'Quiz Geografía de España', description: 'Provincias, ríos y montañas' },
    { url: '/quiz-paises-capitales/', icon: '🗺️', name: 'Quiz Países y Capitales', description: 'Pon a prueba tu geografía' },
    { url: '/quiz-simbolos-quimicos/', icon: '⚗️', name: 'Quiz Símbolos Químicos', description: 'Aprende la tabla periódica' },
    { url: '/quiz-figuras-retoricas/', icon: '✍️', name: 'Quiz Figuras Retóricas', description: 'Recursos literarios en español' },
  ],
  'quiz-geografia-espana': [
    { url: '/quiz-historia-espana/', icon: '🏛️', name: 'Quiz Historia de España', description: 'Desde los íberos hasta 1978' },
    { url: '/quiz-paises-capitales/', icon: '🗺️', name: 'Quiz Países y Capitales', description: 'Geografía mundial' },
    { url: '/quiz-simbolos-quimicos/', icon: '⚗️', name: 'Quiz Símbolos Químicos', description: 'Aprende la tabla periódica' },
    { url: '/quiz-reinos-naturaleza/', icon: '🔬', name: 'Quiz Reinos Naturaleza', description: '43 organismos sorprendentes' },
  ],
  'test-madurez-digital': [
    { url: '/test-burnout-laboral/', icon: '🧘', name: 'Test Burnout Laboral', description: 'Detecta el agotamiento profesional' },
    { url: '/calculadora-costes-teletrabajo/', icon: '🏠', name: 'Costes Teletrabajo', description: 'Cuánto ahorras trabajando en casa' },
    { url: '/calculadora-tarifa-hora/', icon: '💼', name: 'Calculadora Tarifa/Hora', description: 'Fija tu precio como freelance' },
    { url: '/calculadora-roi/', icon: '📈', name: 'Calculadora ROI', description: 'Retorno sobre inversión' },
  ],
  'estimador-pension-viudedad': [
    ...jubilacionApps.filter(a => a.url !== '/estimador-pension-viudedad/').slice(0, 4),
  ],
  'estimador-complemento-minimos': [
    ...jubilacionApps.filter(a => a.url !== '/estimador-complemento-minimos/').slice(0, 4),
    { url: '/estimacion-prestaciones-dependencia/', icon: '💶', name: 'Prestaciones Dependencia', description: 'Cuantías SAAD según grado' },
  ],
  'diario-emocional': [
    { url: '/test-bienestar-who5/', icon: '🌱', name: 'Test Bienestar WHO-5', description: 'Evalúa tu bienestar en 5 preguntas' },
    { url: '/semaforo-emocional/', icon: '🚦', name: 'Semáforo Emocional', description: 'Regulación emocional visual' },
    { url: '/selector-gestion-estres/', icon: '🧘', name: 'Gestión del Estrés', description: 'Encuentra tu método anti-estrés' },
    { url: '/guia-respiracion/', icon: '🫁', name: 'Guía de Respiración', description: 'Técnicas para la calma' },
  ],
  'test-bienestar-who5': [
    { url: '/diario-emocional/', icon: '📔', name: 'Diario Emocional', description: 'Registra cómo te sientes cada día' },
    { url: '/test-burnout-laboral/', icon: '🔥', name: 'Test de Burnout', description: 'Evalúa tu agotamiento laboral' },
    { url: '/selector-gestion-estres/', icon: '🧘', name: 'Gestión del Estrés', description: 'Encuentra tu método anti-estrés' },
    { url: '/test-habitos-saludables/', icon: '🌟', name: 'Hábitos Saludables', description: 'Evalúa tu estilo de vida' },
  ],
  'planificador-estudio-oposiciones': [
    { url: '/orientador-tipo-oposicion/', icon: '🎯', name: 'Orientador de Oposición', description: '¿Qué oposición encaja contigo?' },
    { url: '/temporizador-pomodoro/', icon: '⏰', name: 'Pomodoro', description: 'Técnica de estudio 25+5 min' },
    { url: '/planificador-habitos/', icon: '📋', name: 'Planificador de Hábitos', description: 'Crea rutinas de estudio' },
  ],
  'orientador-tipo-oposicion': [
    { url: '/planificador-estudio-oposiciones/', icon: '📅', name: 'Planificador de Estudio', description: 'Organiza tu temario en semanas' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Calcula tu sueldo neto como funcionario' },
    { url: '/simulador-jubilacion-publica/', icon: '🏤', name: 'Simulador Jubilación', description: 'Planifica tu carrera pública' },
  ],
  'simulador-paga-ahorro': [
    { url: '/estimador-tiempo-ahorro/', icon: '🎯', name: '¿Cuánto tardo en ahorrar?', description: 'Calcula cuándo alcanzarás tu objetivo' },
    { url: '/juego-presupuesto-mensual/', icon: '🎮', name: 'Juego de Presupuesto', description: '¿Llegas a fin de mes?' },
    { url: '/quiz-conceptos-financieros/', icon: '🧠', name: 'Quiz Financiero', description: '¿Cuánto sabes de dinero?' },
    { url: '/orientador-regla-50-30-20/', icon: '📊', name: 'Regla 50/30/20', description: 'Distribuye tus ingresos' },
  ],
  'juego-presupuesto-mensual': [
    { url: '/simulador-paga-ahorro/', icon: '🐷', name: 'Simulador de Paga', description: 'Gestiona tu paga y ahorra' },
    { url: '/estimador-tiempo-ahorro/', icon: '🎯', name: '¿Cuánto tardo en ahorrar?', description: 'Plazo para tu objetivo' },
    { url: '/quiz-conceptos-financieros/', icon: '🧠', name: 'Quiz Financiero', description: '¿Cuánto sabes de dinero?' },
    { url: '/control-gastos/', icon: '📋', name: 'Control de Gastos', description: 'Registra tus gastos reales' },
  ],
  'estimador-tiempo-ahorro': [
    { url: '/simulador-paga-ahorro/', icon: '🐷', name: 'Simulador de Paga', description: 'Gestiona tu paga y ahorra' },
    { url: '/juego-presupuesto-mensual/', icon: '🎮', name: 'Juego de Presupuesto', description: '¿Llegas a fin de mes?' },
    { url: '/estimador-interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Haz crecer tu ahorro' },
    { url: '/quiz-conceptos-financieros/', icon: '🧠', name: 'Quiz Financiero', description: '¿Cuánto sabes de dinero?' },
  ],
  'quiz-conceptos-financieros': [
    { url: '/simulador-paga-ahorro/', icon: '🐷', name: 'Simulador de Paga', description: 'Gestiona tu paga y ahorra' },
    { url: '/juego-presupuesto-mensual/', icon: '🎮', name: 'Juego de Presupuesto', description: '¿Llegas a fin de mes?' },
    { url: '/estimador-tiempo-ahorro/', icon: '🎯', name: '¿Cuánto tardo en ahorrar?', description: 'Plazo para tu objetivo' },
    { url: '/estimador-interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Haz crecer tu ahorro' },
  ],
  'estimador-costas-judiciales': [
    { url: '/estimador-costes-divorcio/', icon: '📝', name: 'Costes de Divorcio', description: 'Mutuo acuerdo vs contencioso' },
    { url: '/orientador-justicia-gratuita/', icon: '🏛️', name: 'Justicia Gratuita', description: '¿Tienes derecho a abogado gratis?' },
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción y caducidad en España' },
    { url: '/asistente-reclamaciones/', icon: '⚖️', name: 'Reclamaciones', description: 'Guía para reclamar tus derechos' },
  ],
  'estimador-costes-divorcio': [
    { url: '/estimador-costas-judiciales/', icon: '⚖️', name: 'Costas Judiciales', description: 'Cuánto cuesta un juicio' },
    { url: '/orientador-justicia-gratuita/', icon: '🏛️', name: 'Justicia Gratuita', description: '¿Tienes derecho a abogado gratis?' },
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción y caducidad en España' },
  ],
  'orientador-justicia-gratuita': [
    { url: '/estimador-costas-judiciales/', icon: '⚖️', name: 'Costas Judiciales', description: 'Cuánto cuesta un juicio' },
    { url: '/estimador-costes-divorcio/', icon: '📝', name: 'Costes de Divorcio', description: 'Mutuo acuerdo vs contencioso' },
    { url: '/asistente-reclamaciones/', icon: '⚖️', name: 'Reclamaciones', description: 'Guía para reclamar tus derechos' },
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción y caducidad en España' },
  ],
  'selector-actividades-movilidad': [
    { url: '/test-fragilidad/', icon: '🧓', name: 'Test de Fragilidad', description: 'Escala FRAIL: ¿eres frágil o pre-frágil?' },
    { url: '/estimador-riesgo-osteoporosis/', icon: '🦴', name: 'Riesgo Osteoporosis', description: 'Test FRAX/IOF de riesgo óseo' },
    { url: '/orientador-grado-dependencia/', icon: '📋', name: 'Grado de Dependencia', description: 'Baremo BVD orientativo' },
    { url: '/adaptacion-hogar/', icon: '🏠', name: 'Adaptación del Hogar', description: 'Accesibilidad y seguridad en casa' },
  ],
  'estimador-legitimas': [
    ...patrimonioPensionApps.filter(a => a.url !== '/estimador-legitimas/'),
  ],
  'optimizador-rentas-60': [
    ...jubilacionFiscalApps.filter(a => a.url !== '/optimizador-rentas-60/'),
  ],
  'selector-plan-pensiones': [
    ...jubilacionApps.slice(0, 3),
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Calcula cuánto pagarás en la renta' },
  ],
  'selector-tipo-ahorro': [
    { url: '/test-perfil-inversor/', icon: '🎯', name: 'Test Perfil Inversor', description: 'Descubre tu tolerancia al riesgo' },
    { url: '/estimador-interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Simula el crecimiento de tus ahorros' },
    { url: '/estimador-fondo-emergencia/', icon: '🛡️', name: 'Fondo de Emergencia', description: 'Cuánto necesitas ahorrar' },
    { url: '/selector-plan-pensiones/', icon: '🏦', name: 'Selector Plan de Pensiones', description: 'Test: ¿te conviene contratar uno?' },
  ],
  'selector-inversiones': [
    { url: '/test-perfil-inversor/', icon: '🎯', name: 'Test Perfil Inversor', description: 'Descubre tu tolerancia al riesgo' },
    { url: '/estimador-interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Simula el crecimiento de tus ahorros' },
    { url: '/selector-tipo-ahorro/', icon: '💶', name: 'Selector Tipo de Ahorro', description: '¿Dónde poner tus ahorros?' },
    { url: '/selector-plan-pensiones/', icon: '🏦', name: 'Selector Plan de Pensiones', description: 'Test: ¿te conviene contratar un plan?' },
  ],
  'selector-tipo-prestamo': [
    { url: '/estimador-prestamos/', icon: '🏦', name: 'Simulador de Préstamos', description: 'Calcula cuota y coste total' },
    { url: '/estimador-hipoteca/', icon: '🏠', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/amortizacion-hipoteca/', icon: '💰', name: 'Amortización Anticipada', description: 'Reducir cuota vs plazo' },
    { url: '/selector-tipo-ahorro/', icon: '💶', name: 'Selector Tipo de Ahorro', description: '¿Dónde poner tus ahorros?' },
  ],

  'selector-vacaciones': [
    { url: '/orientador-jet-lag/', icon: '✈️', name: 'Orientador Jet Lag', description: 'Recupera tu ritmo tras un vuelo largo' },
    { url: '/conversor-zonas-horarias/', icon: '🕐', name: 'Conversor Zonas Horarias', description: 'Calcula la hora en destino' },
    { url: '/requisitos-nomada-digital/', icon: '💻', name: 'Requisitos Nómada Digital', description: 'Visados y requisitos por país' },
    { url: '/calculadora-gastos-hogar/', icon: '💰', name: 'Control Gastos', description: 'Planifica tu presupuesto de viaje' },
  ],

  // TRABAJO Y EMPLEO
  'selector-contrato-trabajo': [
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Cuota de Autónomo', description: 'Estima tu cuota RETA mensual' },
    { url: '/asistente-alta-autonomo/', icon: '📋', name: 'Asistente Alta Autónomo', description: 'Trámites para darte de alta' },
    { url: '/orientador-tarifa-freelance/', icon: '💰', name: 'Tarifa Freelance', description: 'Calcula tu precio por hora' },
    { url: '/test-burnout-laboral/', icon: '🧘', name: 'Test Burnout Laboral', description: '¿Estás al límite en el trabajo?' },
  ],

  'selector-energia-hogar': [
    ...sostenibilidadApps.filter(a => a.url !== '/selector-energia-hogar/'),
  ],
  'simulador-placas-solares': [
    ...sostenibilidadApps.filter(a => a.url !== '/simulador-placas-solares/'),
  ],
  'selector-tarifa-electrica': [
    ...sostenibilidadApps.filter(a => a.url !== '/selector-tarifa-electrica/'),
  ],
  'estimacion-ahorro-hidrico': [
    ...sostenibilidadApps.filter(a => a.url !== '/estimacion-ahorro-hidrico/'),
  ],
  'simulador-subvenciones-rehabilitacion': [
    ...sostenibilidadApps.filter(a => a.url !== '/simulador-subvenciones-rehabilitacion/'),
  ],
  'estimacion-certificacion-energetica': [
    ...sostenibilidadApps.filter(a => a.url !== '/estimacion-certificacion-energetica/'),
  ],

  // Educación y orientación vocacional
  'selector-carrera-universitaria': [
    { url: '/test-madurez-digital/', icon: '🤖', name: 'Test Madurez Digital', description: 'Nivel de digitalización de tu empresa' },
    { url: '/selector-contrato-trabajo/', icon: '📄', name: 'Selector de Contrato', description: '¿Qué modalidad laboral te conviene?' },
    { url: '/selector-forma-juridica/', icon: '🏢', name: 'Selector Forma Jurídica', description: '¿Autónomo o sociedad limitada?' },
    { url: '/test-perfil-inversor/', icon: '🎯', name: 'Test Perfil Inversor', description: 'Descubre tu tolerancia al riesgo' },
  ],

  // Productividad — métodos de trabajo
  'selector-herramienta-productividad': [
    { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Temporizador Pomodoro', description: 'Técnica de concentración 25/5' },
    { url: '/time-tracker/', icon: '⏱️', name: 'Time Tracker', description: 'Registra tu tiempo por proyecto' },
    { url: '/test-burnout-laboral/', icon: '🔥', name: 'Test de Burnout Laboral', description: '¿Estás al límite en el trabajo?' },
    { url: '/seguimiento-habitos/', icon: '✅', name: 'Seguimiento de Hábitos', description: 'Construye rutinas productivas' },
  ],

  // Seguros de vida
  'selector-seguro-vida': [
    { url: '/orientador-seguro-vida/', icon: '🛡️', name: 'Calculadora Seguro de Vida', description: 'Calcula el capital asegurado que necesitas' },
    { url: '/selector-seguro-salud/', icon: '🏥', name: 'Selector Seguro de Salud', description: '¿Necesitas seguro médico privado?' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/selector-tipo-ahorro/', icon: '💰', name: 'Selector Tipo de Ahorro', description: '¿Dónde poner tus ahorros?' },
  ],

  // Formación postgrado
  'selector-formacion-postgrado': [
    { url: '/selector-carrera-universitaria/', icon: '🎓', name: 'Selector Carrera Universitaria', description: '¿Qué rama universitaria elegir?' },
    { url: '/selector-metodo-estudio/', icon: '📚', name: 'Selector Método de Estudio', description: '¿Cómo aprendes mejor?' },
    { url: '/selector-herramienta-productividad/', icon: '⚡', name: 'Selector Método de Productividad', description: 'GTD, Pomodoro, Kanban...' },
    { url: '/selector-contrato-trabajo/', icon: '📋', name: 'Selector Contrato de Trabajo', description: '¿Qué tipo de contrato te conviene?' },
  ],

  // Seguro de coche
  'selector-seguro-coche': [
    { url: '/selector-coche-nuevo-usado/', icon: '🚗', name: 'Selector Coche Nuevo o Usado', description: '¿Nuevo, seminuevo o de ocasión?' },
    { url: '/selector-seguro-vida/', icon: '🛡️', name: 'Selector Seguro de Vida', description: '¿Qué tipo de seguro de vida necesitas?' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora de Combustible', description: 'Coste real de tus desplazamientos' },
    { url: '/selector-vehiculo-electrico/', icon: '⚡', name: 'Selector Vehículo Eléctrico', description: '¿BEV, PHEV o híbrido?' },
  ],

  // Idioma a aprender
  'selector-idioma': [
    { url: '/selector-formacion-postgrado/', icon: '🎓', name: 'Selector Formación Postgrado', description: '¿Máster, bootcamp u oposiciones?' },
    { url: '/selector-carrera-universitaria/', icon: '🏛️', name: 'Selector Carrera Universitaria', description: '¿Qué rama universitaria elegir?' },
    { url: '/selector-metodo-estudio/', icon: '📚', name: 'Selector Método de Estudio', description: '¿Cómo aprendes mejor?' },
    { url: '/selector-vacaciones/', icon: '✈️', name: 'Selector de Vacaciones', description: 'Descubre tu tipo de viaje ideal' },
  ],

  // Estilo decoración
  'selector-estilo-decoracion': [
    { url: '/selector-tipo-vivienda/', icon: '🏠', name: 'Selector Tipo de Vivienda', description: 'Piso, casa, ático o estudio' },
    { url: '/selector-zona-residencia/', icon: '📍', name: 'Selector Zona de Residencia', description: 'Centro, extrarradio o pueblo' },
    { url: '/presupuesto-reforma/', icon: '🔨', name: 'Presupuesto de Reforma', description: 'Estima el coste de tu reforma' },
    { url: '/selector-alquiler-vs-compra/', icon: '🏘️', name: 'Selector Alquiler vs Compra', description: '¿Comprar o alquilar?' },
  ],

  // Vehículo eléctrico
  'selector-vehiculo-electrico': [
    { url: '/selector-coche-nuevo-usado/', icon: '🚗', name: 'Selector Coche Nuevo o Usado', description: '¿Nuevo, seminuevo o de ocasión?' },
    { url: '/selector-seguro-coche/', icon: '🛡️', name: 'Selector Seguro de Coche', description: '¿Terceros o todo riesgo?' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora de Combustible', description: 'Coste real de tus desplazamientos' },
    { url: '/selector-tipo-prestamo/', icon: '💳', name: 'Selector Tipo de Préstamo', description: '¿Qué financiación elegir?' },
  ],

  // Método de estudio
  'selector-metodo-estudio': [
    { url: '/selector-formacion-postgrado/', icon: '🎓', name: 'Selector Formación Postgrado', description: '¿Máster, bootcamp u oposiciones?' },
    { url: '/selector-carrera-universitaria/', icon: '🏛️', name: 'Selector Carrera Universitaria', description: '¿Qué rama universitaria elegir?' },
    { url: '/selector-herramienta-productividad/', icon: '⚡', name: 'Selector Método de Productividad', description: 'GTD, Pomodoro, Kanban...' },
    { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Temporizador Pomodoro', description: 'Técnica de concentración 25/5' },
  ],

  // Tipo de hipoteca
  'selector-tipo-hipoteca': [
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador de Hipoteca', description: 'Calcula tu cuota mensual exacta' },
    { url: '/selector-alquiler-vs-compra/', icon: '🏘️', name: 'Selector Alquiler vs Compra', description: '¿Comprar o alquilar?' },
    { url: '/selector-tipo-vivienda/', icon: '🏠', name: 'Selector Tipo de Vivienda', description: 'Piso, casa, ático o estudio' },
    { url: '/selector-tipo-prestamo/', icon: '💳', name: 'Selector Tipo de Préstamo', description: '¿Qué financiación elegir?' },
  ],

  // Cuenta bancaria
  'selector-cuenta-bancaria': [
    { url: '/selector-tipo-ahorro/', icon: '💰', name: 'Selector Tipo de Ahorro', description: '¿Dónde colocar tus ahorros?' },
    { url: '/selector-inversiones/', icon: '📈', name: 'Selector de Inversiones', description: '¿Fondos, acciones o renta fija?' },
    { url: '/selector-regimen-fiscal-autonomo/', icon: '🧾', name: 'Selector Régimen Fiscal Autónomo', description: '¿Módulos, directa o SL?' },
    { url: '/selector-tipo-prestamo/', icon: '💳', name: 'Selector Tipo de Préstamo', description: '¿Qué financiación elegir?' },
  ],

  // Modalidad de trabajo
  'selector-modalidad-trabajo': [
    { url: '/selector-herramienta-productividad/', icon: '⚡', name: 'Selector Método Productividad', description: 'GTD, Pomodoro, Kanban...' },
    { url: '/selector-contrato-trabajo/', icon: '📋', name: 'Selector Contrato de Trabajo', description: '¿Qué tipo de contrato te conviene?' },
    { url: '/selector-forma-juridica/', icon: '⚖️', name: 'Selector Forma Jurídica', description: '¿Autónomo o sociedad limitada?' },
    { url: '/selector-canal-venta/', icon: '🛒', name: 'Selector Canal de Venta', description: '¿Marketplace, tienda propia o RRSS?' },
  ],

  // Canal de venta
  'selector-canal-venta': [
    { url: '/selector-modelo-negocio/', icon: '💼', name: 'Selector Modelo de Negocio', description: '¿Tienda, servicios, SaaS o marketplace?' },
    { url: '/selector-forma-juridica/', icon: '⚖️', name: 'Selector Forma Jurídica', description: '¿Autónomo o sociedad limitada?' },
    { url: '/selector-modalidad-trabajo/', icon: '💻', name: 'Selector Modalidad de Trabajo', description: 'Presencial, remoto o nómada' },
    { url: '/selector-regimen-fiscal-autonomo/', icon: '🧾', name: 'Selector Régimen Fiscal Autónomo', description: '¿Módulos, directa o SL?' },
  ],

  // Régimen fiscal autónomo
  'selector-regimen-fiscal-autonomo': [
    { url: '/selector-forma-juridica/', icon: '⚖️', name: 'Selector Forma Jurídica', description: '¿Autónomo o sociedad limitada?' },
    { url: '/calculadora-cuota-autonomos/', icon: '💼', name: 'Calculadora Cuota Autónomos', description: 'Calcula tu cuota RETA mensual' },
    { url: '/selector-cuenta-bancaria/', icon: '🏧', name: 'Selector Cuenta Bancaria', description: '¿Qué tipo de cuenta necesitas?' },
    { url: '/selector-contrato-trabajo/', icon: '📋', name: 'Selector Contrato de Trabajo', description: '¿Qué tipo de contrato te conviene?' },
  ],

  // Gestión del estrés
  'selector-gestion-estres': [
    { url: '/selector-ejercicio/', icon: '🏋️', name: 'Selector de Ejercicio', description: '¿Qué tipo de ejercicio te conviene?' },
    { url: '/selector-tipo-gimnasio/', icon: '🏟️', name: 'Selector Tipo de Gimnasio', description: 'Gimnasio, CrossFit, yoga o casa' },
    { url: '/selector-dieta/', icon: '🥗', name: 'Selector de Dieta', description: '¿Qué dieta se adapta a ti?' },
    { url: '/selector-herramienta-productividad/', icon: '⚡', name: 'Selector Método Productividad', description: 'GTD, Pomodoro, Kanban...' },
  ],

  // Tipo de alojamiento
  'selector-tipo-alojamiento': [
    { url: '/selector-vacaciones/', icon: '✈️', name: 'Selector de Vacaciones', description: '¿Playa, montaña o ciudad?' },
    { url: '/presupuesto-viaje/', icon: '💰', name: 'Presupuesto de Viaje', description: 'Planifica los gastos de tu viaje' },
    { url: '/lista-equipaje/', icon: '🧳', name: 'Lista de Equipaje', description: 'Checklist personalizado de viaje' },
    { url: '/selector-idioma/', icon: '🌍', name: 'Selector de Idioma', description: '¿Qué idioma aprender?' },
  ],

  // Tablet
  'selector-tablet': [
    { url: '/selector-smartphone/', icon: '📱', name: 'Selector de Smartphone', description: '¿iOS o Android?' },
    { url: '/selector-portatil/', icon: '💻', name: 'Selector de Portátil', description: '¿Qué portátil necesitas?' },
    { url: '/selector-tipo-television/', icon: '📺', name: 'Selector de Televisión', description: 'OLED, QLED o LED' },
    { url: '/selector-auriculares/', icon: '🎧', name: 'Selector de Auriculares', description: '¿Qué auriculares necesitas?' },
  ],

  // Financiación empresarial
  'selector-financiacion-empresa': [
    { url: '/selector-modelo-negocio/', icon: '💼', name: 'Selector Modelo de Negocio', description: '¿Tienda, servicios o SaaS?' },
    { url: '/selector-forma-juridica/', icon: '⚖️', name: 'Selector Forma Jurídica', description: '¿Autónomo o sociedad limitada?' },
    { url: '/selector-canal-venta/', icon: '🛒', name: 'Selector Canal de Venta', description: '¿Marketplace o tienda propia?' },
    { url: '/selector-regimen-fiscal-autonomo/', icon: '🧾', name: 'Selector Régimen Fiscal', description: '¿Módulos, directa o SL?' },
  ],

  // Tipo de gimnasio
  'selector-tipo-gimnasio': [
    { url: '/selector-ejercicio/', icon: '🏋️', name: 'Selector de Ejercicio', description: '¿Qué tipo de actividad física elegir?' },
    { url: '/selector-gestion-estres/', icon: '🧘', name: 'Selector Gestión del Estrés', description: '¿Cómo manejas el estrés?' },
    { url: '/selector-dieta/', icon: '🥗', name: 'Selector de Dieta', description: '¿Qué dieta se adapta a ti?' },
    { url: '/selector-seguro-salud/', icon: '🏥', name: 'Selector Seguro de Salud', description: '¿Necesitas seguro médico privado?' },
  ],

  // Auriculares
  'selector-auriculares': [
    { url: '/selector-smartphone/', icon: '📱', name: 'Selector de Smartphone', description: '¿iOS o Android?' },
    { url: '/selector-portatil/', icon: '💻', name: 'Selector de Portátil', description: '¿Qué portátil necesitas?' },
    { url: '/selector-tablet/', icon: '🖥️', name: 'Selector de Tablet', description: '¿Qué tablet necesitas?' },
    { url: '/selector-tipo-television/', icon: '📺', name: 'Selector de Televisión', description: 'OLED, QLED o LED' },
  ],

  // Movilidad urbana
  'selector-movilidad-urbana': [
    { url: '/selector-vehiculo-electrico/', icon: '⚡', name: 'Selector Vehículo Eléctrico', description: '¿BEV, PHEV o híbrido?' },
    { url: '/selector-coche-nuevo-usado/', icon: '🚗', name: 'Selector Coche Nuevo o Usado', description: '¿Nuevo, seminuevo o de ocasión?' },
    { url: '/calculadora-combustible/', icon: '⛽', name: 'Calculadora de Combustible', description: 'Coste real de tus desplazamientos' },
    { url: '/selector-seguro-coche/', icon: '🛡️', name: 'Selector Seguro de Coche', description: '¿Terceros o todo riesgo?' },
  ],

  // EJE C — Sociedad
  'visualizador-piramide-poblacion': [
    { url: '/visualizador-jubilacion-perspectiva/', icon: '🏖️', name: 'Perspectiva de Jubilación', description: 'El envejecimiento de la pirámide impacta directamente en el sistema de pensiones' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales de población y demografía' },
    { url: '/visualizador-migracion-global/', icon: '✈️', name: 'Migración Global', description: 'La inmigración es el principal factor que modera el envejecimiento en España' },
    { url: '/visualizador-envejecimiento-cuerpo/', icon: '🧬', name: 'Envejecimiento del Cuerpo', description: 'Los cambios fisiológicos que afectan a una población cada vez más mayor' },
  ],
  'visualizador-desinformacion': [
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Los sesgos que hacen que los bulos encuentren terreno fértil en nuestra mente' },
    { url: '/visualizador-falacias-logicas/', icon: '🗣️', name: 'Falacias Lógicas', description: 'Los errores de razonamiento que los bulos explotan para parecer convincentes' },
    { url: '/visualizador-estadistica-cotidiana/', icon: '📊', name: 'Estadística Cotidiana', description: 'Cómo la estadística mal interpretada se convierte en desinformación' },
    { url: '/visualizador-toma-decisiones/', icon: '🤔', name: 'Toma de Decisiones', description: 'El Sistema 1 automático es el principal vector de propagación de bulos' },
  ],
  'visualizador-migracion-global': [
    { url: '/visualizador-piramide-poblacion/', icon: '👥', name: 'Pirámide de Población', description: 'La migración como factor moderador del envejecimiento demográfico de España' },
    { url: '/visualizador-mundo-100-personas/', icon: '🌍', name: 'El Mundo en 100 Personas', description: 'Estadísticas globales de desigualdad y diversidad humana' },
    { url: '/visualizador-desigualdad-riqueza/', icon: '📊', name: 'Desigualdad de Riqueza', description: 'La desigualdad económica es un factor push fundamental en la migración global' },
    { url: '/visualizador-comercio-internacional/', icon: '🚢', name: 'Comercio Internacional', description: 'Globalización económica y sus vínculos con los flujos migratorios' },
  ],

  // EJE D — Matemáticas visuales
  'visualizador-calculo-visual': [
    { url: '/visualizador-funciones-mundo/', icon: '📈', name: 'Funciones que Gobiernan el Mundo', description: 'Las funciones que el cálculo analiza: lineales, exponenciales, logarítmicas' },
    { url: '/calculadora-calculo/', icon: '🧮', name: 'Calculadora de Cálculo', description: 'Calcula derivadas, integrales y límites exactos de cualquier función' },
    { url: '/visualizador-numeros-complejos/', icon: '𝕚', name: 'Números Complejos', description: 'Las derivadas de funciones complejas y la transformada de Fourier usan el cálculo' },
    { url: '/visualizador-teoria-juegos/', icon: '🎲', name: 'Teoría de Juegos', description: 'El equilibrio de Nash se encuentra optimizando funciones con derivadas' },
  ],
  'visualizador-numeros-complejos': [
    { url: '/visualizador-matrices/', icon: '🔢', name: 'Matrices y Transformaciones', description: 'Las matrices también representan rotaciones y escalados en el plano' },
    { url: '/visualizador-geometria-fractales/', icon: '🌀', name: 'Fractales', description: 'El conjunto de Mandelbrot y los fractales de Julia son aplicaciones de los complejos' },
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'La transformada de Fourier combina cálculo y números complejos' },
    { url: '/visualizador-mecanica-cuantica/', icon: '⚛️', name: 'Mecánica Cuántica', description: 'La función de onda ψ es de valor complejo — los complejos son esenciales en cuántica' },
  ],
  'visualizador-teoria-juegos': [
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Los sesgos que nos alejan del comportamiento racional que asume la teoría de juegos' },
    { url: '/visualizador-toma-decisiones/', icon: '🤔', name: 'Toma de Decisiones', description: 'Sistema 1 y 2 de Kahneman: por qué no siempre jugamos el equilibrio de Nash' },
    { url: '/visualizador-estadistica-cotidiana/', icon: '📊', name: 'Estadística Cotidiana', description: 'El valor esperado y la probabilidad son la base matemática de la teoría de juegos' },
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'El equilibrio de Nash se encuentra buscando puntos críticos (derivada = 0)' },
  ],

  // EJE A — Matemáticas visuales III (2026-04-28)
  'visualizador-transformada-fourier': [
    { url: '/visualizador-numeros-complejos/', icon: '𝕚', name: 'Números Complejos', description: 'La transformada de Fourier compleja usa exponenciales complejas e^(iωt)' },
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'Las series de Fourier son integrales — el cálculo es la herramienta que las construye' },
    { url: '/visualizador-estadistica-inferencial/', icon: '📊', name: 'Estadística Inferencial', description: 'El análisis espectral y el análisis de Fourier se aplican en tests estadísticos de series temporales' },
    { url: '/visualizador-caos-mariposa/', icon: '🦋', name: 'Caos y el Atractor de Lorenz', description: 'Los sistemas caóticos se analizan en el dominio de frecuencias con Fourier' },
  ],
  'visualizador-teoria-grafos': [
    { url: '/visualizador-algoritmos-ordenacion/', icon: '⚡', name: 'Algoritmos de Ordenación', description: 'Dijkstra y los algoritmos de ordenación comparten el lenguaje de la complejidad Big O' },
    { url: '/visualizador-base-datos-relacional/', icon: '🗄️', name: 'Bases de Datos', description: 'Los índices B-Tree y el query optimizer usan grafos internamente para el plan de ejecución' },
    { url: '/visualizador-teoria-juegos/', icon: '🎲', name: 'Teoría de Juegos', description: 'Las redes sociales como grafos y el comportamiento estratégico entre nodos conectados' },
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'El flujo máximo y algunos algoritmos de grafos se formulan como problemas de optimización' },
  ],
  'visualizador-topologia': [
    { url: '/visualizador-numeros-complejos/', icon: '𝕚', name: 'Números Complejos', description: 'El plano complejo es un espacio topológico — Riemann trabajó con superficies de Riemann' },
    { url: '/visualizador-geometria-fractales/', icon: '🌀', name: 'Fractales', description: 'Los fractales tienen dimensiones topológicas no enteras y estructuras autosimilares' },
    { url: '/visualizador-teoria-grafos/', icon: '🕸️', name: 'Teoría de Grafos', description: 'La fórmula de Euler V-E+F=2 conecta la topología de las superficies con la teoría de grafos' },
    { url: '/visualizador-mecanica-cuantica/', icon: '⚛️', name: 'Mecánica Cuántica', description: 'Los materiales topológicos cuánticos (aislantes topológicos) son una frontera de la física actual' },
  ],
  'visualizador-estadistica-inferencial': [
    { url: '/visualizador-estadistica-cotidiana/', icon: '📐', name: 'Estadística Cotidiana', description: 'Estadística descriptiva: medias, medianas y varianza — la base antes de inferir' },
    { url: '/visualizador-probabilidad/', icon: '🎲', name: 'Probabilidad', description: 'La distribución nula H₀ en el test de hipótesis se construye a partir de probabilidad' },
    { url: '/visualizador-teoria-juegos/', icon: '🎲', name: 'Teoría de Juegos', description: 'Los juegos con información incompleta usan probabilidades bayesianas para tomar decisiones' },
    { url: '/visualizador-transformada-fourier/', icon: '〰️', name: 'Transformada de Fourier', description: 'El análisis espectral aplica Fourier a series temporales para detectar señales estadísticamente' },
  ],

  // EJE E — Geopolítica y sociedad contemporánea (2026-04-28)
  'visualizador-geopolitica-energetica': [
    { url: '/visualizador-geopolitica-recursos/', icon: '⛏️', name: 'Geopolítica de Recursos', description: 'Minerales estratégicos, agua y tierra — el contexto más amplio de la geopolítica de recursos' },
    { url: '/visualizador-cadenas-suministro/', icon: '🚢', name: 'Cadenas de Suministro', description: 'La energía es el input crítico de toda cadena de suministro global' },
    { url: '/visualizador-comercio-internacional/', icon: '🌍', name: 'Comercio Internacional', description: 'Los flujos energéticos son una parte fundamental del comercio internacional de materias primas' },
    { url: '/visualizador-hidrogeno/', icon: '💧', name: 'Hidrógeno', description: 'El hidrógeno verde como vector energético emergente en la nueva geopolítica de la energía' },
  ],
  'visualizador-cadenas-suministro': [
    { url: '/visualizador-geopolitica-energetica/', icon: '⚡', name: 'Geopolítica Energética', description: 'La energía es el insumo que mueve toda la cadena de suministro global' },
    { url: '/visualizador-comercio-internacional/', icon: '🌍', name: 'Comercio Internacional', description: 'Las cadenas de suministro son la infraestructura física del comercio internacional' },
    { url: '/visualizador-inflacion/', icon: '📈', name: 'Inflación', description: 'Las disrupciones en cadenas de suministro son una causa directa de presiones inflacionarias' },
    { url: '/visualizador-historia-dinero/', icon: '💰', name: 'Historia del Dinero', description: 'El sistema financiero global financia y asegura las cadenas de suministro internacionales' },
  ],
  'visualizador-regimenes-politicos': [
    { url: '/curso-teoria-politica/', icon: '🏛️', name: 'Curso de Teoría Política', description: 'Profundiza en los fundamentos teóricos de estos sistemas: Platón, Aristóteles, Hobbes, Locke y más' },
    { url: '/visualizador-proceso-legislativo/', icon: '⚖️', name: 'Proceso Legislativo', description: 'Cómo funciona la producción de leyes en un sistema democrático representativo' },
    { url: '/visualizador-sistema-electoral/', icon: '🗳️', name: 'Sistema Electoral', description: 'Los sistemas electorales son uno de los mecanismos estructurales que diferencian los regímenes' },
    { url: '/visualizador-desinformacion/', icon: '📰', name: 'Desinformación', description: 'La libertad de prensa y el pluralismo informativo son características estructurales de algunos regímenes' },
  ],

  // EJE A — Matemáticas fundamentos visuales (Roadmap v4, 2026-04-30)
  'visualizador-trigonometria': [
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'Las funciones trigonométricas son la base del cálculo: derivadas, integrales de seno y coseno' },
    { url: '/visualizador-series-convergencia/', icon: '♾️', name: 'Series y Convergencia', description: 'Las series de Taylor aproximan seno y coseno con polinomios' },
    { url: '/visualizador-transformada-fourier/', icon: '〰️', name: 'Transformada de Fourier', description: 'La Transformada de Fourier descompone señales en suma de senos y cosenos' },
    { url: '/visualizador-geometria-analitica/', icon: '📉', name: 'Geometría Analítica', description: 'Las cónicas se describen con funciones trigonométricas en coordenadas polares' },
  ],
  'visualizador-geometria-analitica': [
    { url: '/visualizador-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Las coordenadas polares y las cónicas usan seno y coseno como base' },
    { url: '/visualizador-algebra-lineal/', icon: '🔢', name: 'Álgebra Lineal', description: 'Las transformaciones lineales cambian la forma de las cónicas en el plano' },
    { url: '/visualizador-geometria-fractales/', icon: '🌀', name: 'Geometría Fractal', description: 'Las cónicas son formas euclidianas; los fractales exploran geometrías más complejas' },
    { url: '/visualizador-topologia/', icon: '🍩', name: 'Topología', description: 'La topología generaliza la geometría: ¿qué propiedades se conservan bajo deformación continua?' },
  ],
  'visualizador-algebra-lineal': [
    { url: '/visualizador-matrices/', icon: '📊', name: 'Matrices y Transformaciones', description: 'Las matrices son la representación algebraica de las transformaciones lineales' },
    { url: '/visualizador-geometria-analitica/', icon: '📉', name: 'Geometría Analítica', description: 'Las transformaciones lineales actúan sobre las cónicas y las curvas del plano' },
    { url: '/visualizador-estadistica-inferencial/', icon: '📈', name: 'Estadística Inferencial', description: 'PCA (Análisis de Componentes Principales) es álgebra lineal aplicada a datos' },
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'La diferencial es una transformación lineal — el cálculo y el álgebra lineal convergen aquí' },
  ],
  'visualizador-combinatoria': [
    { url: '/visualizador-probabilidad/', icon: '🎲', name: 'Probabilidad', description: 'La combinatoria es la base del cálculo de probabilidades: C(n,k) aparece en la distribución binomial' },
    { url: '/visualizador-estadistica-inferencial/', icon: '📊', name: 'Estadística Inferencial', description: 'Los tests estadísticos usan combinatoria para calcular distribuciones discretas (binomial, hipergeométrica)' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'RSA y los sistemas de clave pública se basan en la dificultad computacional de problemas combinatorios' },
    { url: '/visualizador-teoria-grafos/', icon: '🕸️', name: 'Teoría de Grafos', description: 'Contar caminos, árboles de expansión y coloraciones son problemas combinatorios sobre grafos' },
  ],
  'visualizador-ecuaciones-diferenciales': [
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'Las EDO se derivan e integran: el cálculo es la herramienta fundamental para resolverlas' },
    { url: '/visualizador-algebra-lineal/', icon: '🔢', name: 'Álgebra Lineal', description: 'Los sistemas de EDO lineales se resuelven con eigenvalores y matrices de la transformación' },
    { url: '/visualizador-modelos-epidemiologicos/', icon: '🦠', name: 'Modelos Epidemiológicos', description: 'Los modelos SIR/SEIR son sistemas de ecuaciones diferenciales aplicados a epidemias' },
    { url: '/visualizador-series-convergencia/', icon: '♾️', name: 'Series y Convergencia', description: 'Las series de Taylor se usan para aproximar soluciones de EDO cuando no hay forma cerrada' },
  ],
  'visualizador-series-convergencia': [
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'Las series de Taylor son una de las aplicaciones más bellas del cálculo diferencial e integral' },
    { url: '/visualizador-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Las series de Maclaurin de seno y coseno revelan su naturaleza algebraica profunda' },
    { url: '/visualizador-transformada-fourier/', icon: '〰️', name: 'Transformada de Fourier', description: 'La Transformada de Fourier es una generalización de las series de Fourier al dominio continuo' },
    { url: '/visualizador-numeros-complejos/', icon: '𝕚', name: 'Números Complejos', description: 'La identidad de Euler e^(iπ)+1=0 emerge de las series de Taylor de eˣ, sin(x) y cos(x)' },
  ],

  // EJE C — Química avanzada (2026-04-28)
  'visualizador-termodinamica-quimica': [
    { url: '/visualizador-cinetica-quimica/', icon: '⚡', name: 'Cinética Química', description: 'La termodinámica dice si una reacción puede ocurrir; la cinética dice a qué velocidad ocurrirá' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Los fundamentos de las reacciones antes de profundizar en su energética' },
    { url: '/visualizador-electroquimica/', icon: '🔋', name: 'Electroquímica', description: 'El criterio ΔG < 0 determina si una pila galvánica genera corriente espontáneamente' },
    { url: '/visualizador-termodinamica/', icon: '🌡️', name: 'Termodinámica Física', description: 'La termodinámica química parte de los mismos principios aplicados a sistemas químicos' },
  ],
  'visualizador-cinetica-quimica': [
    { url: '/visualizador-termodinamica-quimica/', icon: '⚗️', name: 'Termodinámica Química', description: 'La termodinámica dice si una reacción puede ocurrir; la cinética dice a qué velocidad' },
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧬', name: 'Enzimas', description: 'Las enzimas son biocatalizadores — reducen la Ea de reacciones metabólicas vitales' },
    { url: '/visualizador-catalasa/', icon: '⚗️', name: 'Catalasa', description: 'La catalasa descompone H₂O₂ a 40 millones de reacciones por segundo — cinética enzimática extrema' },
    { url: '/visualizador-estados-materia/', icon: '🔴', name: 'Estados de la Materia', description: 'La temperatura afecta tanto la cinética como los estados — el mismo parámetro, efectos diferentes' },
  ],
  'visualizador-electroquimica': [
    { url: '/visualizador-termodinamica-quimica/', icon: '⚗️', name: 'Termodinámica Química', description: 'FEM > 0 equivale a ΔG < 0 — la electroquímica y la termodinámica están matemáticamente conectadas' },
    { url: '/visualizador-hidrogeno/', icon: '💧', name: 'Hidrógeno', description: 'La electrólisis del agua produce hidrógeno verde — el coste energético explicado por el sobrepotencial' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Los electrones que fluyen en la pila son los mismos que estudias en la estructura electrónica' },
    { url: '/visualizador-enlaces-quimicos/', icon: '🔗', name: 'Enlaces Químicos', description: 'La reactividad en la serie electroquímica refleja la energía de los enlaces y la electronegatividad' },
  ],

  // EJE B — Biología molecular de frontera (2026-04-28)
  'visualizador-epigenetica': [
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'El ADN no cambia en epigenética — cambia cómo se lee. Primero entiende el código que se regula' },
    { url: '/visualizador-seleccion-natural/', icon: '🌱', name: 'Selección Natural', description: 'Algunos cambios epigenéticos heredables pueden ser seleccionados igual que las mutaciones genéticas' },
    { url: '/visualizador-envejecimiento-celular/', icon: '⏳', name: 'Envejecimiento Celular', description: 'El reloj epigenético de Horvath mide la edad biológica mediante patrones de metilación del ADN' },
    { url: '/visualizador-cancer/', icon: '🔬', name: 'Cáncer', description: 'La hipermetilación de genes supresores tumorales como BRCA1 es un mecanismo epigenético clave en cáncer' },
  ],
  'visualizador-evolucion-molecular': [
    { url: '/visualizador-seleccion-natural/', icon: '🌱', name: 'Selección Natural', description: 'La evolución molecular y la selección natural son dos caras del mismo proceso — macro y micro' },
    { url: '/visualizador-evolucion-humana/', icon: '🦴', name: 'Evolución Humana', description: 'Los árboles filogenéticos moleculares confirman y refinan el árbol de homínidos fósil' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'Las mutaciones que acumula el reloj molecular son cambios en las bases del ADN que ya conoces' },
    { url: '/visualizador-epigenetica/', icon: '🧬', name: 'Epigenética', description: 'La epigenética añade otra capa: cambios heredables en la expresión génica sin cambiar la secuencia' },
  ],
  'visualizador-modelos-epidemiologicos': [
    { url: '/visualizador-vacunas/', icon: '💉', name: 'Vacunas', description: 'Las vacunas reducen β (transmisión) y aumentan el compartimento R — conecta el modelo con la intervención' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'El compartimento R del modelo SIR es la población con inmunidad — el sistema inmune la genera' },
    { url: '/visualizador-estadistica-inferencial/', icon: '📊', name: 'Estadística Inferencial', description: 'Estimar β y γ desde datos reales requiere inferencia estadística — los parámetros no se conocen directamente' },
    { url: '/visualizador-ciclo-viral/', icon: '🦠', name: 'Ciclo Viral', description: 'El compartimento I del modelo SIR es donde ocurre la replicación viral que ya conoces a nivel molecular' },
  ],

  // EJE D — Cosmos y astrofísica profunda (2026-04-28)
  'visualizador-cosmologia': [
    { url: '/visualizador-escala-universo/', icon: '🔭', name: 'Escala del Universo', description: 'Desde el quark hasta el universo observable — la perspectiva de escala que la cosmología necesita' },
    { url: '/visualizador-relatividad-general/', icon: '🌀', name: 'Relatividad General', description: 'La expansión del universo y la energía oscura se describen con las ecuaciones de Einstein' },
    { url: '/visualizador-agujeros-negros/', icon: '🕳️', name: 'Agujeros Negros', description: 'Los agujeros negros supermasivos en los centros galácticos son actores clave en la evolución cósmica' },
    { url: '/visualizador-vida-estrella/', icon: '⭐', name: 'Vida de una Estrella', description: 'Las primeras estrellas (Población III) forjaron los elementos del universo temprano' },
  ],
  'visualizador-agujeros-negros': [
    { url: '/visualizador-relatividad-general/', icon: '🌀', name: 'Relatividad General', description: 'Los agujeros negros son la predicción más extrema de las ecuaciones de campo de Einstein' },
    { url: '/visualizador-cosmologia/', icon: '🌌', name: 'Cosmología', description: 'Los agujeros negros supermasivos regulan la formación de galaxias en el universo a gran escala' },
    { url: '/visualizador-vida-estrella/', icon: '⭐', name: 'Vida de una Estrella', description: 'Los agujeros negros estelares son el destino final de estrellas con más de ~25 masas solares' },
    { url: '/visualizador-mecanica-cuantica/', icon: '⚛️', name: 'Mecánica Cuántica', description: 'La radiación de Hawking surge de aplicar la mecánica cuántica al horizonte de sucesos' },
  ],
  'visualizador-exoplanetas': [
    { url: '/visualizador-sistema-solar/', icon: '☀️', name: 'Sistema Solar', description: 'Nuestro sistema solar es el patrón de referencia para comparar los sistemas de exoplanetas detectados' },
    { url: '/visualizador-vida-estrella/', icon: '⭐', name: 'Vida de una Estrella', description: 'El tipo estelar determina la zona habitable y la duración de la ventana para que evolucione la vida' },
    { url: '/visualizador-cosmologia/', icon: '🌌', name: 'Cosmología', description: 'Los 100.000 millones de exoplanetas de la Vía Láctea son solo una fracción de los del universo observable' },
    { url: '/visualizador-escala-universo/', icon: '🔭', name: 'Escala del Universo', description: 'Las distancias a los sistemas exoplanetarios ponen en perspectiva la inmensidad del cosmos' },
  ],

  // EJE A — Enfermedades de alto impacto (2026-04-25)
  'visualizador-ciclo-viral': [
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Cómo el sistema inmune detecta y combate los virus en sus distintas fases de infección' },
    { url: '/visualizador-vacunas/', icon: '💉', name: 'Vacunas', description: 'Las vacunas entrenan al sistema inmune antes de que el virus llegue a completar su ciclo de replicación' },
    { url: '/visualizador-proteinas-plegamiento/', icon: '🧬', name: 'Plegamiento de Proteínas', description: 'Las proteínas de la cápside y envoltura viral tienen estructuras 3D muy específicas que determinan el tropismo' },
    { url: '/visualizador-adn-replicacion/', icon: '🔬', name: 'ADN y Replicación', description: 'Los virus ADN aprovechan la maquinaria de replicación celular; los ARN llevan su propia polimerasa' },
  ],
  'visualizador-diabetes-mecanismo': [
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'La insulina y el glucagón son las hormonas pancreáticas dentro del sistema endocrino completo' },
    { url: '/visualizador-higado/', icon: '🫀', name: 'Hígado', description: 'El hígado es el órgano central de la gluconeogénesis y el almacenamiento de glucógeno regulado por insulina' },
    { url: '/visualizador-proteinas-plegamiento/', icon: '🧬', name: 'Plegamiento de Proteínas', description: 'La insulina es una proteína pequeña cuya estructura 3D es esencial para su unión al receptor' },
    { url: '/visualizador-ciclo-viral/', icon: '🦠', name: 'Ciclo Viral', description: 'Algunos virus (Coxsackie B4) se han propuesto como desencadenantes del proceso autoinmune en la diabetes tipo 1' },
  ],
  'visualizador-alzheimer-parkinson': [
    { url: '/visualizador-proteinas-plegamiento/', icon: '🧬', name: 'Plegamiento de Proteínas', description: 'Alzheimer y Parkinson son proteinopatías: enfermedades causadas por proteínas mal plegadas (Aβ, Tau, α-sinucleína)' },
    { url: '/visualizador-neurona/', icon: '⚡', name: 'La Neurona', description: 'Cómo funciona una neurona sana: potencial de acción, sinapsis y neurotransmisores que se alteran en estas enfermedades' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'La anatomía del sistema nervioso central donde se desarrollan los procesos neurodegenerativos' },
    { url: '/visualizador-neurotransmisores/', icon: '💬', name: 'Neurotransmisores', description: 'La dopamina (Parkinson) y la acetilcolina (Alzheimer) son los neurotransmisores más afectados' },
  ],
  'visualizador-cancer': [
    { url: '/visualizador-adn-replicacion/', icon: '🔬', name: 'ADN y Replicación', description: 'Los errores en la replicación del ADN y los fallos en su reparación son el origen de las mutaciones cancerígenas' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'La inmunoterapia activa el sistema inmune para que reconozca y destruya las células tumorales' },
    { url: '/visualizador-proteinas-plegamiento/', icon: '🧬', name: 'Plegamiento de Proteínas', description: 'Los oncogenes y genes supresores codifican proteínas cuya función depende de su plegamiento 3D correcto' },
    { url: '/visualizador-alzheimer-parkinson/', icon: '🧠', name: 'Alzheimer y Parkinson', description: 'Como el cáncer, son enfermedades de acumulación de proteínas disfuncionales, aunque con mecanismos distintos' },
  ],

  // EJE F — Economía aplicada (2026-04-25)
  'visualizador-sistema-pensiones': [
    { url: '/visualizador-jubilacion-perspectiva/', icon: '⏳', name: 'Jubilación en Perspectiva', description: 'Tu timeline personal de cotización: cuántos años llevas y qué pensión generarás' },
    { url: '/simulador-jubilacion-publica/', icon: '🔢', name: 'Simulador Jubilación', description: 'Calcula tu pensión pública estimada con tus datos de cotización reales' },
    { url: '/visualizador-piramide-poblacion/', icon: '👥', name: 'Pirámide de Población', description: 'La presión demográfica que explica el reto de sostenibilidad del sistema' },
    { url: '/visualizador-desempleo-tipos/', icon: '📉', name: 'Tipos de Desempleo', description: 'El empleo y la cotización son la base financiera del sistema de reparto' },
  ],
  'visualizador-mercado-inmobiliario': [
    { url: '/amortizacion-hipoteca/', icon: '🏦', name: 'Amortización de Hipoteca', description: 'Calcula las cuotas y el coste total de tu hipoteca con datos reales' },
    { url: '/visualizador-tipos-interes-bce/', icon: '📊', name: 'Tipos de Interés BCE', description: 'Los tipos del BCE determinan el Euribor y el coste de las hipotecas variables' },
    { url: '/visualizador-inflacion/', icon: '💸', name: 'Inflación', description: 'La inflación erosiona el ahorro pero puede beneficiar a los propietarios de activos reales' },
    { url: '/visualizador-sistema-pensiones/', icon: '👴', name: 'Sistema de Pensiones', description: 'La vivienda como activo alternativo para complementar la pensión pública' },
  ],
  'visualizador-desempleo-tipos': [
    { url: '/visualizador-sistema-pensiones/', icon: '👴', name: 'Sistema de Pensiones', description: 'El empleo y la cotización son el combustible del sistema de reparto de pensiones' },
    { url: '/visualizador-ciclo-economico/', icon: '🔄', name: 'Ciclo Económico', description: 'El desempleo cíclico sigue el ciclo económico: sube en recesión, baja en expansión' },
    { url: '/visualizador-inflacion/', icon: '💸', name: 'Inflación', description: 'La curva de Phillips relaciona inflación y desempleo: menos paro = más inflación' },
    { url: '/visualizador-teoria-juegos/', icon: '🎲', name: 'Teoría de Juegos', description: 'La negociación laboral entre sindicatos y empresas es un juego de coordinación' },
  ],

  // EJE B — Fisiología (2026-04-25)
  'visualizador-ciclo-menstrual': [
    { url: '/visualizador-estrogenos/', icon: '🟣', name: 'Estrógenos', description: 'Biología completa del estrógeno: hueso, cardiovascular, tejidos y menopausia' },
    { url: '/visualizador-sistema-reproductor/', icon: '🫀', name: 'Sistema Reproductor', description: 'Anatomía del aparato reproductor femenino y masculino' },
    { url: '/visualizador-tiroides/', icon: '🦋', name: 'Tiroides', description: 'El tiroides regula el metabolismo basal e interactúa con el ciclo menstrual' },
    { url: '/seguimiento-ciclo-menstrual/', icon: '📅', name: 'Seguimiento de Ciclo', description: 'Predice tus próximos ciclos, ventana fértil y ovulación con tu tracker personal' },
  ],
  'visualizador-proteinas-plegamiento': [
    { url: '/visualizador-adn-replicacion/', icon: '🧬', name: 'ADN y Replicación', description: 'El ADN codifica la secuencia de aminoácidos que determina el plegamiento proteínico' },
    { url: '/visualizador-alzheimer-parkinson/', icon: '🧠', name: 'Alzheimer y Parkinson', description: 'Ambas enfermedades están causadas por proteínas mal plegadas: Aβ/tau y α-sinucleína' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Los anticuerpos son proteínas con plegamiento preciso que reconoce antígenos específicos' },
    { url: '/visualizador-enzimas/', icon: '🧪', name: 'Enzimas', description: 'Las enzimas son proteínas cuya actividad catalítica depende de su plegamiento 3D exacto' },
  ],

  // EJE E — Física avanzada (2026-04-25)
  'visualizador-relatividad-general': [
    { url: '/visualizador-relatividad-especial/', icon: '⚡', name: 'Relatividad Especial', description: 'La relatividad especial (1905) es el punto de partida: sin gravedad, solo velocidad' },
    { url: '/visualizador-mecanica-cuantica/', icon: '⚛️', name: 'Mecánica Cuántica', description: 'Relatividad general y mecánica cuántica: las dos grandes teorías incompatibles' },
    { url: '/visualizador-caos-mariposa/', icon: '🦋', name: 'Caos y Mariposa', description: 'Los sistemas caóticos también surgen en la dinámica relativista de agujeros negros' },
    { url: '/visualizador-astrofisica/', icon: '🌠', name: 'Astrofísica', description: 'La relatividad general describe la estructura y evolución del universo a gran escala' },
  ],
  'visualizador-caos-mariposa': [
    { url: '/visualizador-geometria-fractales/', icon: '❄️', name: 'Geometría Fractal', description: 'Los fractales y el caos comparten la autosimilaridad y la sensibilidad a condiciones iniciales' },
    { url: '/visualizador-relatividad-general/', icon: '🌌', name: 'Relatividad General', description: 'El caos aparece también en las órbitas relativistas cercanas a agujeros negros' },
    { url: '/visualizador-estadistica-cotidiana/', icon: '📊', name: 'Estadística Cotidiana', description: 'Los sistemas caóticos son deterministas pero estadísticamente impredecibles a largo plazo' },
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'El sistema de Lorenz son ecuaciones diferenciales ordinarias integradas numéricamente' },
  ],
  'visualizador-superconductividad': [
    { url: '/visualizador-electromagnetismo/', icon: '🔌', name: 'Electromagnetismo', description: 'El efecto Meissner expulsa el campo magnético: el diamagnetismo perfecto de los superconductores' },
    { url: '/visualizador-energia-nuclear/', icon: '☢️', name: 'Energía Nuclear', description: 'ITER usa superconductores de NbTi para los imanes toroidales del reactor de fusión' },
    { url: '/visualizador-computacion-cuantica/', icon: '💻', name: 'Computación Cuántica', description: 'Los qubits superconductores operan cerca del cero absoluto, igual que los superconductores clásicos' },
    { url: '/visualizador-mecanica-cuantica/', icon: '⚛️', name: 'Mecánica Cuántica', description: 'La teoría BCS de superconductividad es un triunfo de la mecánica cuántica aplicada' },
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

    // Herencias - Apps movidas a ex-meskeia

    // Finanzas
    'interes-compuesto': { title: 'Más herramientas de inversión', icon: '💰' },
    'simulador-hipoteca': { title: 'Herramientas para tu hipoteca', icon: '🏠' },
    'control-gastos': { title: 'Gestiona tus finanzas', icon: '💳' },

    // Salud
    'calculadora-imc': { title: 'Cuida tu salud', icon: '❤️' },
    'calculadora-calorias-ejercicio': { title: 'Herramientas de salud', icon: '❤️' },
    'test-burnout-laboral': { title: 'Más herramientas de bienestar', icon: '🧘' },
    'orientador-discapacidad': { title: 'Más herramientas de salud y bienestar', icon: '♿' },
    'estimacion-prestaciones-dependencia': { title: 'Herramientas de cuidadores y dependencia', icon: '💶' },
    'planificador-turnos-cuidadores': { title: 'Herramientas de cuidadores y dependencia', icon: '📅' },
    'test-zarit-cuidador': { title: 'Herramientas de cuidadores y dependencia', icon: '🤝' },
    'estimacion-deduccion-discapacidad': { title: 'Herramientas de discapacidad y dependencia', icon: '♿' },
    'checklist-tramites-dependencia': { title: 'Herramientas de cuidadores y dependencia', icon: '✅' },
    'estimacion-prestacion-nacimiento': { title: 'Herramientas de crianza y familia', icon: '👶' },
    'estimacion-baja-maternal': { title: 'Herramientas de crianza y familia', icon: '📅' },
    'planificador-gastos-bebe': { title: 'Herramientas de crianza y familia', icon: '🍼' },
    'estimacion-deduccion-maternidad': { title: 'Herramientas de crianza y familia', icon: '👩‍👧' },
    'test-estilo-parental': { title: 'Herramientas de crianza y familia', icon: '👨‍👩‍👧‍👦' },
    'simulador-bono-joven-alquiler': { title: 'Más herramientas de vivienda y finanzas', icon: '🏠' },
    'orientador-aval-ico': { title: 'Herramientas para comprar tu primera vivienda', icon: '🏡' },
    'calculadora-costes-teletrabajo': { title: 'Más herramientas de productividad', icon: '💻' },
    'quiz-historia-espana': { title: 'Más quizzes de cultura general', icon: '🏛️' },
    'quiz-geografia-espana': { title: 'Más quizzes de cultura general', icon: '🌍' },
    'test-madurez-digital': { title: 'Más herramientas para el trabajo', icon: '💻' },

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

    // Freelance
    'calculadora-tarifa-freelance': { title: 'Herramientas para autónomos', icon: '💼' },
    'generador-facturas': { title: 'Gestiona tu negocio', icon: '💼' },

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

    // Legal y Fiscal
    'plazos-legales': { title: 'Más herramientas legales y fiscales', icon: '⚖️' },
    'comparador-formas-juridicas': { title: 'Herramientas para emprender', icon: '⚖️' },
    'asistente-constitucion-asociacion': { title: 'Más herramientas legales', icon: '⚖️' },
    'estimador-cuota-autonomo': { title: 'Más herramientas para autónomos', icon: '💼' },
    'estimador-sueldo-neto': { title: 'Más herramientas fiscales', icon: '💶' },
    'orientador-gastos-deducibles': { title: 'Más herramientas fiscales', icon: '🧾' },
    'calendario-fiscal-emprendedor': { title: 'Herramientas para emprendedores', icon: '📅' },
    'asistente-alta-autonomo': { title: 'Más herramientas para autónomos', icon: '📋' },
    'estimador-irpf': { title: 'Más herramientas fiscales', icon: '📊' },
    'estimador-plusvalias-irpf': { title: 'Herramientas de fiscalidad patrimonial', icon: '💹' },
    'comparador-autonomo-vs-sl': { title: 'Herramientas para emprendedores', icon: '⚖️' },
    'selector-forma-juridica': { title: 'Más herramientas para emprendedores', icon: '🏢' },
    'estimador-plusvalia-municipal': { title: 'Más herramientas legales y fiscales', icon: '🏙️' },
    'orientador-intereses-demora': { title: 'Más herramientas para autónomos', icon: '📄' },

    // Smartphones y tecnología
    'selector-smartphone': { title: 'Más herramientas de tecnología', icon: '📱' },
    'selector-portatil': { title: 'Más herramientas de tecnología', icon: '💻' },
    'selector-tipo-television': { title: 'Más herramientas de tecnología y hogar', icon: '📺' },

    // Calefacción y hogar
    'selector-calefaccion': { title: 'Más herramientas para el hogar', icon: '🏠' },

    // Mascotas y salud
    'selector-mascota': { title: 'Más herramientas de salud y bienestar', icon: '🐾' },
    'selector-seguro-salud': { title: 'Más herramientas de salud y finanzas', icon: '🏥' },
    'selector-seguro-hogar': { title: 'Más herramientas para el hogar y seguros', icon: '🏠' },
    'selector-seguro-vida': { title: 'Más herramientas de seguros y finanzas', icon: '🛡️' },
    'selector-alquiler-vs-compra': { title: 'Más herramientas para decidir sobre vivienda', icon: '🏠' },
    'selector-zona-residencia': { title: 'Más herramientas sobre vivienda y estilo de vida', icon: '🏡' },
    'selector-tipo-vivienda': { title: 'Más herramientas sobre vivienda', icon: '🏠' },
    'selector-dieta': { title: 'Más herramientas de salud y bienestar', icon: '🥗' },
    'selector-ejercicio': { title: 'Más herramientas de salud y bienestar', icon: '🏋️' },
    'selector-modelo-negocio': { title: 'Más herramientas para emprender', icon: '🏢' },

    // Vehículos
    'selector-vehiculo': { title: 'Más herramientas para comprar coche', icon: '🚗' },
    'comparador-vehiculos': { title: 'Más herramientas para comprar coche', icon: '🚗' },
    'comparador-electrico': { title: 'Más herramientas de vehículos', icon: '⚡' },
    'etiqueta-dgt': { title: 'Más herramientas de vehículos', icon: '🏷️' },
    'calculadora-combustible': { title: 'Más herramientas de vehículos', icon: '⛽' },
    'selector-coche-nuevo-usado': { title: 'Más herramientas para comprar coche', icon: '🚗' },

    // Jubilación y ahorro
    'selector-plan-pensiones': { title: 'Más herramientas de jubilación y ahorro', icon: '🏦' },
    'selector-inversiones': { title: 'Más herramientas de inversión y finanzas', icon: '📈' },

    // Trabajo y empleo
    'selector-contrato-trabajo': { title: 'Más herramientas para el trabajo', icon: '💼' },

    // Viajes y ocio
    'selector-vacaciones': { title: 'Más herramientas para viajar', icon: '✈️' },

    // Hogar y energía
    'selector-energia-hogar': { title: 'Herramientas de sostenibilidad y hogar eficiente', icon: '🏠' },
    'simulador-placas-solares': { title: 'Herramientas de sostenibilidad y hogar eficiente', icon: '☀️' },
    'selector-tarifa-electrica': { title: 'Herramientas de sostenibilidad y hogar eficiente', icon: '⚡' },
    'estimacion-ahorro-hidrico': { title: 'Herramientas de sostenibilidad y hogar eficiente', icon: '💧' },
    'simulador-subvenciones-rehabilitacion': { title: 'Herramientas de sostenibilidad y hogar eficiente', icon: '🏠' },
    'estimacion-certificacion-energetica': { title: 'Herramientas de sostenibilidad y hogar eficiente', icon: '🏷️' },

    // Finanzas — préstamos
    'selector-tipo-prestamo': { title: 'Más herramientas de finanzas', icon: '💳' },

    // Educación y orientación vocacional
    'selector-carrera-universitaria': { title: 'Más herramientas para estudiantes', icon: '🎓' },

    // Productividad — métodos
    'selector-herramienta-productividad': { title: 'Más herramientas de productividad', icon: '⚡' },

    // Formación y estudio
    'selector-formacion-postgrado': { title: 'Más herramientas para estudiantes', icon: '🎓' },
    'selector-idioma': { title: 'Más herramientas de aprendizaje', icon: '🌍' },
    'selector-metodo-estudio': { title: 'Más herramientas de estudio y productividad', icon: '📚' },

    // Vehículos y seguros
    'selector-seguro-coche': { title: 'Más herramientas de vehículos y seguros', icon: '🚗' },
    'selector-vehiculo-electrico': { title: 'Más herramientas sobre vehículos', icon: '⚡' },

    // Hogar y decoración
    'selector-estilo-decoracion': { title: 'Más herramientas sobre el hogar', icon: '🏡' },

    // Finanzas personales — banca e hipotecas
    'selector-tipo-hipoteca': { title: 'Más herramientas de hipotecas y vivienda', icon: '🏦' },
    'selector-cuenta-bancaria': { title: 'Más herramientas de finanzas personales', icon: '🏧' },

    // Trabajo y emprendimiento
    'selector-modalidad-trabajo': { title: 'Más herramientas de productividad y trabajo', icon: '💻' },
    'selector-canal-venta': { title: 'Más herramientas para emprendedores', icon: '🛒' },
    'selector-regimen-fiscal-autonomo': { title: 'Más herramientas para autónomos', icon: '🧾' },

    // Movilidad
    'selector-movilidad-urbana': { title: 'Más herramientas sobre movilidad y transporte', icon: '🚲' },

    // Salud y bienestar (nuevas)
    'selector-gestion-estres': { title: 'Más herramientas de salud y bienestar', icon: '🧘' },
    'selector-tipo-gimnasio': { title: 'Más herramientas de ejercicio y salud', icon: '🏋️' },

    // Viajes y alojamiento
    'selector-tipo-alojamiento': { title: 'Más herramientas para viajes', icon: '🏨' },

    // Tecnología
    'selector-tablet': { title: 'Más herramientas para elegir tecnología', icon: '📱' },
    'selector-auriculares': { title: 'Más herramientas para elegir tecnología', icon: '🎧' },

    // Financiación y emprendimiento
    'selector-financiacion-empresa': { title: 'Más herramientas para emprendedores', icon: '💰' },
  };

  return familyTitles[appSlug] || { title: 'Apps relacionadas', icon: '🔗' };
}
