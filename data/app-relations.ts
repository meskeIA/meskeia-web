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
  'diagnostico-explotacion-exploracion': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'auditoria-reuniones': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'mapa-decisiones-urgentes-importantes': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'test-delegacion-efectiva': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'diagnostico-comunicacion-interna': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'checklist-pre-mortem': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'diagnostico-brecha-ia': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'evaluador-prompts': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'test-dependencia-tecnologica': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'mapa-automatizacion-personal': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'diagnostico-estancamiento-profesional': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'mapa-dependencia-clientes': [...freelanceApps.slice(0, 3), ...productividadApps.slice(0, 1)],
  'auditoria-habilidades-mercado': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'test-sindrome-impostor': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'test-ritmo-vital': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'auditoria-energia-semanal': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'diagnostico-multitarea': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'mapa-compromisos-capacidad': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'detector-sesgos-cognitivos': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'analisis-decision-reversible': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'test-pensamiento-grupo': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'checklist-segunda-opinion': [...productividadApps.slice(0, 3), ...freelanceApps.slice(0, 1)],
  'diagnostico-modelo-negocio': [...freelanceApps.slice(0, 3), ...productividadApps.slice(0, 1)],
  'cronometro': productividadApps,
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
    { url: '/estimador-impuesto-donaciones/', icon: '🎁', name: 'Estimador Donaciones', description: 'Impuesto por recibir una donación' },
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
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Gastos Deducibles', description: 'Qué puedes deducir como autónomo' },
    { url: '/calendario-fiscal-emprendedor/', icon: '📅', name: 'Calendario Fiscal', description: 'Plazos y obligaciones fiscales' },
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
