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
  { url: '/estimador-pension-viudedad/', icon: '💍', name: 'Pensión de Viudedad', description: 'Cuantía y requisitos 2026' },
  { url: '/planificador-ahorro-jubilacion/', icon: '💹', name: 'Planificador de Ahorro', description: 'Brecha, ahorro y plan de pensiones' },
  { url: '/estimador-irpf-pensionista/', icon: '📊', name: 'IRPF Pensionista', description: 'Cuánto pagas de renta al jubilarte' },
  { url: '/verificador-complemento-brecha-genero/', icon: '⚖️', name: 'Complemento Brecha de Género', description: '36,90 €/mes por hijo en tu pensión' },
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
  { url: '/orientador-iva-espana/', icon: '🧭', name: 'Orientador del IVA', description: 'Qué IVA aplicar en cada operación' },
];

// ==========================================
// FAMILIA: SALUD Y BIENESTAR
// ==========================================
const saludApps: RelatedApp[] = [
  { url: '/calculadora-zonas-entrenamiento/', icon: '❤️', name: 'Zonas de Entrenamiento', description: '5 zonas de FC: FCmáx y Karvonen' },
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
// Nota SEO (P1 enlazado interno, 2026-07-05): textoApps lo referencian 9 apps →
// es el grupo con más "autoridad interna". Se incluyen aquí las dos apps con
// demanda probada y ancladas en pos 6-9 (contador-sílabas 3.958 impr,
// generador-anagramas 1.652 impr) para multiplicar sus enlaces entrantes.
// slice(0,2) se conserva = [contador-palabras, conversor-texto].
const textoApps: RelatedApp[] = [
  { url: '/contador-palabras/', icon: '🔢', name: 'Contador Palabras', description: 'Palabras y caracteres' },
  { url: '/conversor-texto/', icon: '🔄', name: 'Conversor Texto', description: 'Mayúsculas y más' },
  { url: '/contador-silabas/', icon: '📐', name: 'Contador Sílabas', description: 'Separa y cuenta sílabas' },
  { url: '/generador-anagramas/', icon: '🔀', name: 'Generador Anagramas', description: 'Reordena letras' },
  { url: '/limpiador-texto/', icon: '🧹', name: 'Limpiador Texto', description: 'Elimina formato' },
];

// [0] contador-silabas · [1] conversor-markdown-html · [2] generador-lorem-ipsum
// se preservan (hay referencias posicionales textoExtraApps[0/1/2]). comparador-textos
// se mueve aquí desde textoApps para no perder su enlazado.
const textoExtraApps: RelatedApp[] = [
  { url: '/contador-silabas/', icon: '📐', name: 'Contador Sílabas', description: 'Separa y cuenta' },
  { url: '/conversor-markdown-html/', icon: '📄', name: 'Markdown a HTML', description: 'Convierte formatos' },
  { url: '/generador-lorem-ipsum/', icon: '📝', name: 'Lorem Ipsum', description: 'Texto de prueba' },
  { url: '/generador-anagramas/', icon: '🔀', name: 'Generador Anagramas', description: 'Reordena letras' },
  { url: '/comparador-textos/', icon: '🔍', name: 'Comparador Textos', description: 'Diferencias entre textos' },
];

// ==========================================
// FAMILIA: CONVERSIÓN DE DATOS
// ==========================================
const conversionDatosApps: RelatedApp[] = [
  { url: '/conversor-formatos/', icon: '🔄', name: 'Conversor Formatos', description: 'JSON, CSV, Excel, XML' },
  { url: '/codificador-base64/', icon: '🔐', name: 'Base64', description: 'Codifica/decodifica' },
  { url: '/conversor-markdown-html/', icon: '📄', name: 'Markdown a HTML', description: 'Convierte formatos' },
  { url: '/validador-json/', icon: '📋', name: 'Generador JSON', description: 'Crea estructuras JSON' },
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

// SEGURIDAD DIGITAL PRÁCTICA (contraseñas, phishing, privacidad del usuario)
const seguridadDigitalApps: RelatedApp[] = [
  { url: '/evaluador-fortaleza-contrasena/', icon: '🔒', name: 'Fortaleza de Contraseñas', description: '¿Es segura tu clave?' },
  { url: '/generador-contrasenas/', icon: '🔑', name: 'Generador Contraseñas', description: 'Contraseñas seguras' },
  { url: '/test-phishing/', icon: '🎣', name: 'Test ¿Es Phishing?', description: 'Detecta estafas y fraudes' },
  { url: '/generador-hashes/', icon: '#️⃣', name: 'Generador Hashes', description: 'MD5, SHA-256, SHA-512' },
  { url: '/editor-exif/', icon: '📷', name: 'Editor EXIF', description: 'Privacidad de tus fotos' },
  { url: '/curso-criptografia-seguridad/', icon: '🔐', name: 'Curso Criptografía', description: 'Seguridad de la A a la Z' },
];

// ==========================================
// FAMILIA: DISEÑO Y COLORES
// ==========================================
const disenoColoresApps: RelatedApp[] = [
  { url: '/conversor-colores/', icon: '🎨', name: 'Conversor Colores', description: 'HEX, RGB, HSL' },
  { url: '/creador-paletas/', icon: '🌈', name: 'Creador Paletas', description: 'Paletas armónicas' },
  { url: '/generador-gradientes/', icon: '🌅', name: 'Generador Gradientes', description: 'CSS gradients' },
  { url: '/contraste-colores/', icon: '👁️', name: 'Contraste Colores', description: 'Accesibilidad WCAG' },
  { url: '/simulador-baja-vision/', icon: '👁️', name: 'Simulador Baja Visión', description: 'Cataratas, presbicia' },
  { url: '/simulador-daltonismo/', icon: '🌈', name: 'Simulador Daltonismo', description: '8 tipos visuales' },
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
  { url: '/preparar-entrevista-competencias/', icon: '🌟', name: 'Entrevista por Competencias', description: 'Prepara respuestas con el método STAR' },
];

const viajesApps: RelatedApp[] = [
  { url: '/guia-seguro-viaje/', icon: '🛡️', name: 'Seguro de Viaje', description: 'Qué cobertura necesitas' },
  { url: '/comparador-transporte-viaje/', icon: '🚄', name: 'Comparador Transporte', description: 'Avión, tren, bus o coche' },
  // P2 enlazado interno (2026-07-08): comparador-coste-vida sube al top-4 (estaba en pos 11 → invisible por slice(0,4))
  // por demanda probada (495 impr, pos 8, huérfana de enlaces entrantes). lista-equipaje baja de visibilidad.
  { url: '/comparador-coste-vida/', icon: '🏙️', name: 'Coste de Vida', description: 'Compara ciudades del mundo' },
  { url: '/planificador-itinerario/', icon: '🗓️', name: 'Planificador Itinerario', description: 'Organiza días y actividades' },
  { url: '/lista-equipaje/', icon: '🧳', name: 'Lista Equipaje', description: 'Checklist de viaje' },
  { url: '/checklist-documentos-viaje/', icon: '📋', name: 'Documentos de Viaje', description: 'Pasaporte, visado y más' },
  { url: '/orientador-jet-lag/', icon: '✈️', name: 'Simulador Jet Lag', description: 'Impacto del cambio horario' },
  { url: '/conversor-horarios/', icon: '🌍', name: 'Conversor Horarios', description: 'Zonas horarias' },
  { url: '/conversor-divisas/', icon: '💱', name: 'Conversor Divisas', description: 'Tipos de cambio BCE' },
  { url: '/presupuesto-viaje/', icon: '🗺️', name: 'Presupuesto Viaje', description: 'Planifica y divide gastos' },
  { url: '/enchufes-por-pais/', icon: '🔌', name: 'Enchufes por País', description: 'Qué adaptador llevar' },
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
  { url: '/visualizador-arquitectura-computador/', icon: '🖥️', name: 'Arquitectura Computador', description: 'Von Neumann, CPU y ciclo FDE' },
  { url: '/quiz-complejidad-algoritmos/', icon: '⏱️', name: 'Quiz Complejidad', description: 'Big O, ordenación y estructuras' },
  { url: '/visualizador-algoritmos/', icon: '📊', name: 'Visualizador Algoritmos', description: 'Ordenación paso a paso' },
  { url: '/playground-sql/', icon: '🗃️', name: 'Playground SQL', description: 'Editor SQL interactivo' },
  { url: '/simulador-puertas-logicas/', icon: '🔌', name: 'Puertas Lógicas', description: 'Circuitos digitales' },
  { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: '100+ términos de código' },
  { url: '/simulador-git-ramas/', icon: '🌿', name: 'Simulador de Git', description: 'Ramas, commits y merge' },
  { url: '/calculadora-sistemas-numericos/', icon: '🔢', name: 'Sistemas Numéricos', description: 'Binario, hex, octal' },
  { url: '/calculadora-subredes/', icon: '🌐', name: 'Calculadora Subredes', description: 'CIDR, máscaras IP' },
  { url: '/simulador-modelo-osi/', icon: '🌐', name: 'Modelo OSI', description: '7 capas y encapsulación' },
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
  { url: '/recortador-video/', icon: '🎞️', name: 'Recortador Vídeo', description: 'Corta vídeos MP4 en local' },
  // P2 enlazado interno (2026-07-08): generador-tonos al top-4 por demanda probada (7.052 impr, 149 clics, pos 7,8)
  // e infra-enlazado (3 entrantes). generador-ondas baja de visibilidad.
  { url: '/generador-tonos/', icon: '🎵', name: 'Generador de Tonos', description: 'Frecuencias y tonos de prueba' },
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
  'calculadora-notas': [
    { url: '/generador-horarios-estudio/', icon: '📅', name: 'Horario de Estudio', description: 'Planifica tu tiempo entre asignaturas' },
    { url: '/creador-flashcards/', icon: '🃏', name: 'Flashcards', description: 'Memoriza conceptos con tarjetas de repaso' },
    { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Técnica de estudio 25/5' },
    { url: '/planificador-estudio-oposiciones/', icon: '📚', name: 'Planificador Estudio', description: 'Distribución de temas y repasos espaciados' },
  ],
  'creador-flashcards': estudiantesApps.filter(a => a.url !== '/creador-flashcards/'),
  'generador-horarios-estudio': estudiantesApps.filter(a => a.url !== '/generador-horarios-estudio/'),
  'temporizador-pomodoro': [...estudiantesApps.filter(a => a.url !== '/temporizador-pomodoro/').slice(0, 2), ...productividadApps.slice(0, 2)],

  // FINANZAS - INVERSIÓN
  'interes-compuesto': finanzasInversionApps.filter(a => a.url !== '/estimador-interes-compuesto/'),
  'calculadora-inversiones': finanzasInversionApps.filter(a => a.url !== '/estimador-inversiones/'),
  'simulador-sesgos-inversor': [
    { url: '/test-tolerancia-riesgo-detallado/', icon: '📊', name: 'Test Riesgo Detallado', description: 'Evaluación profunda en 5 dimensiones' },
    { url: '/test-perfil-inversor/', icon: '🎯', name: 'Test Perfil Inversor', description: 'Descubre tu perfil de riesgo' },
    { url: '/estimador-interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Crecimiento de inversiones a largo plazo' },
  ],
  'test-tolerancia-riesgo-detallado': [
    { url: '/test-perfil-inversor/', icon: '🎯', name: 'Test Perfil Inversor', description: 'Cuestionario básico de perfil' },
    { url: '/simulador-sesgos-inversor/', icon: '🧠', name: 'Sesgos del Inversor', description: 'Detecta tus sesgos cognitivos' },
    ...finanzasInversionApps.filter(a => a.url !== '/test-perfil-inversor/').slice(0, 1),
  ],
  'test-perfil-inversor': [
    { url: '/visualizador-tipos-activos/', icon: '📊', name: 'Clases de Activos', description: 'Qué es cada activo antes de invertir' },
    { url: '/estimador-cartera-inversion/', icon: '💼', name: 'Cartera según tu Perfil', description: 'Asignación de activos personalizada' },
    { url: '/simulador-sesgos-inversor/', icon: '🧠', name: 'Sesgos del Inversor', description: 'Evita errores cognitivos al invertir' },
    { url: '/test-tolerancia-riesgo-detallado/', icon: '📊', name: 'Test Riesgo Detallado', description: 'Evaluación profunda en 5 dimensiones' },
  ],
  'visualizador-tipos-activos': [
    { url: '/test-perfil-inversor/', icon: '🎯', name: 'Test Perfil Inversor', description: 'Descubre qué perfil de riesgo eres' },
    { url: '/estimador-cartera-inversion/', icon: '💼', name: 'Simulador de Cartera', description: 'Monte Carlo con las clases que elijas' },
    { url: '/simulador-sesgos-inversor/', icon: '🧠', name: 'Sesgos del Inversor', description: 'Los errores cognitivos que destrozan carteras' },
    { url: '/test-tolerancia-riesgo-detallado/', icon: '📊', name: 'Test Riesgo Detallado', description: 'Evaluación profunda en 5 dimensiones' },
  ],
  'estimador-cartera-inversion': finanzasInversionApps.filter(a => a.url !== '/estimador-cartera-inversion/'),
  'calculadora-tir-van': finanzasInversionApps.filter(a => a.url !== '/estimador-tir-van/'),

  // FINANZAS - HIPOTECA / INMOBILIARIA
  'simulador-hipoteca': finanzasHipotecaApps.filter(a => a.url !== '/estimador-hipoteca/'),
  'simulador-compraventa-inmueble': finanzasHipotecaApps.filter(a => a.url !== '/estimador-compraventa-inmueble/'),
  'estimador-compraventa-inmueble': [
    { url: '/estimador-hipoteca/', icon: '🏠', name: 'Simulador Hipoteca', description: 'Calcula la cuota mensual de tu préstamo' },
    { url: '/estimador-plusvalia-municipal/', icon: '🏛️', name: 'Plusvalía Municipal', description: 'Impuesto del vendedor en la transmisión' },
    { url: '/orientador-alquiler-vs-compra/', icon: '⚖️', name: 'Alquiler vs Compra', description: 'Análisis financiero completo para decidir' },
    { url: '/calculadora-rentabilidad-alquiler/', icon: '🏘️', name: 'Rentabilidad Alquiler', description: 'ROI y cash flow si vas a alquilar' },
  ],
  'simulador-gastos-compraventa-garaje': [
    { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Estimador Completo', description: 'Todos los tipos de inmueble' },
    { url: '/simulador-gastos-compraventa-trastero/', icon: '📦', name: 'Gastos Trastero', description: 'Calcula los gastos de tu trastero' },
    { url: '/simulador-gastos-compraventa-nave-industrial/', icon: '🏭', name: 'Gastos Nave Industrial', description: 'IVA 21% y gastos de compra' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/estimador-plusvalia-municipal/', icon: '🏛️', name: 'Plusvalía Municipal', description: 'Calcula el impuesto del vendedor' },
  ],
  'simulador-gastos-compraventa-nave-industrial': [
    { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Estimador Completo', description: 'Todos los tipos de inmueble' },
    { url: '/simulador-gastos-compraventa-garaje/', icon: '🚗', name: 'Gastos Garaje', description: 'Calcula los gastos de tu garaje' },
    { url: '/simulador-gastos-compraventa-trastero/', icon: '📦', name: 'Gastos Trastero', description: 'Calcula los gastos de tu trastero' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/estimador-plusvalia-municipal/', icon: '🏛️', name: 'Plusvalía Municipal', description: 'Calcula el impuesto del vendedor' },
  ],
  'simulador-gastos-compraventa-trastero': [
    { url: '/estimador-compraventa-inmueble/', icon: '📋', name: 'Estimador Completo', description: 'Todos los tipos de inmueble' },
    { url: '/simulador-gastos-compraventa-garaje/', icon: '🚗', name: 'Gastos Garaje', description: 'Calcula los gastos de tu garaje' },
    { url: '/simulador-gastos-compraventa-nave-industrial/', icon: '🏭', name: 'Gastos Nave Industrial', description: 'IVA 21% y gastos de compra' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador Hipoteca', description: 'Calcula tu cuota mensual' },
    { url: '/estimador-plusvalia-municipal/', icon: '🏛️', name: 'Plusvalía Municipal', description: 'Calcula el impuesto del vendedor' },
  ],
  'amortizacion-hipoteca': finanzasHipotecaApps.filter(a => a.url !== '/amortizacion-hipoteca/'),
  'simulador-prestamos': finanzasHipotecaApps.filter(a => a.url !== '/estimador-prestamos/'),
  'calculadora-alquiler-vs-compra': finanzasHipotecaApps.filter(a => a.url !== '/orientador-alquiler-vs-compra/'),
  // Nota: clave antigua calculadora-coste-vivienda eliminada (app renombrada a estimador-coste-vivienda en 035a31a0).

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
  // Nota: clave antigua calculadora-deuda eliminada (app renombrada a estimador-deuda en 035a31a0).

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
    { url: '/visualizador-microeconomia/', icon: '⚖️', name: 'Microeconomía Visual', description: '6 conceptos clave de microeconomía' },
    { url: '/visualizador-como-funciona-banco/', icon: '🏦', name: 'Cómo Funciona un Banco', description: 'Sistema bancario visual' },
    { url: '/visualizador-viaje-impuestos/', icon: '🏛️', name: 'El Viaje de tus Impuestos', description: 'A dónde va tu dinero' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo por compra' },
  ],
  'visualizador-microeconomia': [
    { url: '/visualizador-macroeconomia/', icon: '📈', name: 'Macroeconomía Visual', description: 'La economía de un país, concepto a concepto' },
    { url: '/visualizador-oferta-demanda/', icon: '📊', name: 'Oferta y Demanda', description: 'Por qué suben los precios' },
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'Cómo funciona la bolsa' },
    { url: '/quiz-conceptos-financieros/', icon: '🧠', name: 'Quiz de Conceptos Financieros', description: 'Pon a prueba lo aprendido' },
  ],
  'visualizador-macroeconomia': [
    { url: '/visualizador-microeconomia/', icon: '⚖️', name: 'Microeconomía Visual', description: 'Cómo deciden personas y empresas' },
    { url: '/estimador-inflacion/', icon: '📈', name: 'Estimador de Inflación', description: 'Tu poder adquisitivo en el tiempo' },
    { url: '/visualizador-como-funciona-banco/', icon: '🏦', name: 'Cómo Funciona un Banco', description: 'Tipos de interés y creación de dinero' },
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'Bolsa, órdenes y activos' },
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
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué son los códigos E de las etiquetas alimentarias' },
    { url: '/visualizador-precio-real-cosas/', icon: '⏰', name: 'El Precio Real de las Cosas', description: 'Horas de trabajo por compra' },
  ],
  'visualizador-sesgos-cognitivos': [
    { url: '/visualizador-falacias-logicas/', icon: '🎯', name: 'Pensamiento Crítico', description: 'Evalúa tu capacidad analítica' },
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
    { url: '/visualizador-historia/epidemias/', icon: '🦠', name: 'Historia de las Epidemias', description: 'Cada vacuna llegó como respuesta a una epidemia devastadora — el arco completo desde la infección al control' },
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
    { url: '/transpositor-acordes/', icon: '🎵', name: 'Transpositor de Acordes', description: 'Cambia la tonalidad de tu canción' },
    { url: '/visualizador-escalas-musicales/', icon: '🎼', name: 'Escalas Musicales', description: 'Mayor, menor, pentatónica y modos' },
    { url: '/visualizador-circulo-quintas/', icon: '🎶', name: 'Círculo de Quintas', description: 'Acordes diatónicos y armonía' },
    { url: '/visualizador-probabilidad/', icon: '🎲', name: 'Probabilidad', description: 'Simulaciones interactivas' },
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
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias' },
    { url: '/visualizador-historia-dinero/', icon: '🪙', name: 'La Evolución del Dinero', description: 'Del trueque al bitcoin' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'De dónde Viene tu Camiseta', description: 'Cadena global' },
    { url: '/visualizador-historia-escritura/', icon: '✍️', name: 'Evolución de la Escritura', description: '5.000 años de escritura' },
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
    { url: '/visualizador-redes-computadoras/', icon: '🌐', name: 'Redes de Computadoras', description: 'WiFi es la capa física — TCP/IP, DNS y routing son las capas superiores que completan la red' },
    { url: '/visualizador-anatomia-smartphone/', icon: '📱', name: 'Anatomía de un Smartphone', description: 'Lo que hay dentro' },
  ],
  'visualizador-matrices': [
    { url: '/visualizador-algebra-lineal/', icon: '🔢', name: 'Álgebra Lineal', description: 'Las matrices son la representación algebraica de las transformaciones lineales: vectores, determinante y eigenvalores' },
    { url: '/visualizador-numeros-complejos/', icon: '𝕚', name: 'Números Complejos', description: 'Rotaciones y escalados del plano se expresan también con números complejos' },
    { url: '/visualizador-geometria-analitica/', icon: '📉', name: 'Geometría Analítica', description: 'Las transformaciones matriciales actúan sobre cónicas y curvas del plano' },
    { url: '/visualizador-funciones-mundo/', icon: '📈', name: 'Funciones del Mundo', description: '4 funciones fundamentales' },
  ],
  'simulador-reacciones-quimicas': [
    { url: '/simulador-equilibrio-quimico/', icon: '⚖️', name: 'Equilibrio Químico', description: 'Reacciones reversibles, Le Chatelier y constante Kc' },
    { url: '/simulador-titulacion/', icon: '🧪', name: 'Titulación Ácido-Base', description: 'Caso práctico de reacción controlada gota a gota' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas Visual', description: 'Tipos, balanceo y átomos animados' },
    { url: '/tabla-periodica/', icon: '🧪', name: 'Tabla Periódica', description: 'Masas atómicas y propiedades' },
  ],
  'visualizador-reacciones-quimicas': [
    { url: '/simulador-reacciones-quimicas/', icon: '⚗️', name: 'Calculadora de Reacciones', description: 'Estequiometría y reactivo limitante' },
    { url: '/visualizador-tabla-periodica/', icon: '🧪', name: 'Tabla Periódica Visual', description: 'Elementos interactivos' },
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'De la luz a la vida' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Animal vs vegetal' },
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
    { url: '/visualizador-ciclo-nitrogeno/', icon: '🔄', name: 'Ciclo del Nitrógeno', description: 'El nitrógeno asimilado por las raíces es tan esencial para la fotosíntesis como la luz solar' },
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
    { url: '/visualizador-colores-cielo/', icon: '🌈', name: 'Colores del Cielo', description: 'La dispersión de Rayleigh y Mie explica cada fase del cielo' },
    { url: '/visualizador-leyes-newton/', icon: '🍎', name: 'Leyes de Newton', description: 'Las 3 leyes de la física' },
    { url: '/visualizador-pantallas/', icon: '🖥️', name: 'Cómo Funciona una Pantalla', description: 'Píxeles y resoluciones' },
    { url: '/visualizador-escala-universo/', icon: '🔬', name: 'La Escala del Universo', description: 'Del quark a la galaxia' },
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
    { url: '/simulador-ecosistema-trofico/', icon: '🌍', name: 'Ecosistema Trófico', description: 'Simula productores, consumidores y la pirámide trófica' },
    { url: '/visualizador-cadena-alimentaria/', icon: '🌾', name: 'De la Granja a tu Mesa', description: 'Cadena alimentaria' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'El Ciclo del Agua', description: 'Ciclo hidrológico' },
    { url: '/visualizador-ciclo-nitrogeno/', icon: '🔄', name: 'Ciclo del Nitrógeno', description: 'El nitrógeno disponible en el suelo es el factor limitante de la productividad primaria del ecosistema' },
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
    { url: '/visualizador-reino-vegetal/', icon: '🌿', name: 'El Reino Vegetal', description: 'Clasificación completa: criptógamas y fanerógamas' },
    { url: '/visualizador-anatomia-flor/', icon: '🌸', name: 'Anatomía de una Flor', description: 'Polinización y frutos' },
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'De la luz a la vida' },
    { url: '/visualizador-transporte-plantas/', icon: '🌱', name: 'Transporte en Plantas', description: 'Xilema y floema' },
  ],
  'visualizador-reino-vegetal': [
    { url: '/visualizador-arbol-vida/', icon: '🌳', name: 'El Árbol de la Vida Animal', description: 'Clasificación del reino animal — el espejo vegetal' },
    { url: '/visualizador-adaptaciones-plantas/', icon: '🌵', name: 'Adaptaciones de las Plantas', description: 'Hábitats extremos y plantas carnívoras' },
    { url: '/quiz-tipos-plantas/', icon: '🌿', name: 'Quiz Tipos de Plantas', description: 'Clasifica 40 organismos vegetales' },
    { url: '/visualizador-reino-fungi/', icon: '🍄', name: 'El Reino Fungi', description: 'Hongos: el tercer reino — ni plantas ni animales' },
  ],
  'falsos-amigos-ingles': [
    { url: '/quiz-mitos-ciencia/', icon: '🔬', name: 'Quiz Mitos y Realidades de la Ciencia', description: 'Otro clásico del pensamiento crítico: palabras que no significan lo que parece, conceptos que no son lo que creemos.' },
    { url: '/quiz-figuras-retoricas/', icon: '📝', name: 'Quiz Figuras Retóricas', description: 'Para quienes quieren dominar el lenguaje en profundidad: las figuras retóricas completan el vocabulario avanzado.' },
    { url: '/quiz-literatura-universal/', icon: '🎭', name: 'Quiz Literatura Universal', description: 'Los falsos amigos aparecen también en las traducciones literarias: dominar el vocabulario bilingüe ayuda a leer a los autores en original.' },
    { url: '/visualizador-historia/historia-descubrimientos-cientificos/', icon: '🔭', name: 'Historia de los Descubrimientos Científicos', description: 'Muchos términos científicos son falsos amigos: "theory" en inglés científico tiene mucho más peso que "teoría" coloquial en español.' },
  ],
  'quiz-mitos-ciencia': [
    { url: '/quiz-biologia-molecular/', icon: '🧬', name: 'Quiz Biología Molecular', description: 'Si los mitos de biología te engancharon, el quiz de ADN, ARN y replicación llevará ese conocimiento al siguiente nivel' },
    { url: '/visualizador-historia/historia-descubrimientos-cientificos/', icon: '🔭', name: 'Historia de los Descubrimientos Científicos', description: 'Cómo la ciencia ha ido desmontando los mitos a lo largo de la historia: de la Tierra plana al ADN' },
    { url: '/visualizador-evolucion-humana/', icon: '🦴', name: 'Evolución Humana', description: 'El mito de que "descendemos de los chimpancés" tiene su respuesta completa en la cronología de la evolución homínida' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'El Sistema Nervioso', description: 'El mito del "10% del cerebro" requiere entender cómo funciona realmente el cerebro: neuronas, regiones y neurotransmisores' },
  ],
  'quiz-biologia-molecular': [
    { url: '/simulador-genetica/', icon: '🧬', name: 'Simulador Genética', description: 'Cruces mendelianos y Punnett' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'Neuronas y neurotransmisores' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'Orgánulos y biología celular' },
    { url: '/visualizador-mitosis-meiosis/', icon: '🧬', name: 'Mitosis y Meiosis', description: 'División celular' },
  ],
  'visualizador-reino-fungi': [
    { url: '/visualizador-reino-vegetal/', icon: '🌿', name: 'El Reino Vegetal', description: 'Plantas: el contraste directo con los hongos' },
    { url: '/visualizador-reino-animal/', icon: '🦁', name: 'El Reino Animal', description: 'Vertebrados e invertebrados: completa la trilogía de reinos' },
    { url: '/quiz-reinos-naturaleza/', icon: '🔬', name: 'Quiz Reinos de la Naturaleza', description: 'Pon a prueba tus conocimientos de clasificación' },
    { url: '/visualizador-microbiologia/', icon: '🦠', name: 'Microbiología', description: 'Bacterias, levaduras y los 3 dominios de la vida' },
  ],
  'visualizador-adaptaciones-plantas': [
    { url: '/visualizador-reino-vegetal/', icon: '🌿', name: 'El Reino Vegetal', description: 'Clasificación: criptógamas y fanerógamas' },
    { url: '/visualizador-biomas-terrestres/', icon: '🌍', name: 'Biomas Terrestres', description: 'Cada bioma define qué adaptaciones son necesarias' },
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'CAM y C4 son variantes adaptativas de la fotosíntesis' },
    { url: '/quiz-tipos-plantas/', icon: '🌿', name: 'Quiz Tipos de Plantas', description: 'Pon a prueba tu clasificación botánica' },
  ],
  'quiz-tipos-plantas': [
    { url: '/visualizador-reino-vegetal/', icon: '🌿', name: 'El Reino Vegetal', description: 'Árbol interactivo de clasificación' },
    { url: '/quiz-reinos-naturaleza/', icon: '🔬', name: 'Quiz Reinos de la Naturaleza', description: '43 organismos sorprendentes' },
    { url: '/visualizador-anatomia-flor/', icon: '🌸', name: 'Anatomía de una Flor', description: 'Polinización y frutos' },
    { url: '/visualizador-adaptaciones-plantas/', icon: '🌵', name: 'Adaptaciones de las Plantas', description: 'Hábitats extremos y carnívoras' },
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
    { url: '/visualizador-crispr-cas9/', icon: '✂️', name: 'CRISPR-Cas9', description: 'CRISPR edita directamente el código genético — sin entender el ADN, no hay edición posible' },
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
    { url: '/estimador-fondo-emergencia/', icon: '🏦', name: 'Fondo de Emergencia', description: 'Versión general del cálculo' },
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
    { url: '/estimador-inversiones/', icon: '📊', name: 'Simulador de Inversión', description: 'Cuánto crece tu dinero' },
    { url: '/selector-tipo-hipoteca/', icon: '🏦', name: 'Comparador Hipotecas', description: 'Tipos fijo vs variable' },
    { url: '/estimador-inversiones/', icon: '💹', name: 'Rentabilidad de Inversión', description: 'ROI e interés compuesto' },
  ],
  'visualizador-cambio-climatico-tipping-points': [
    { url: '/visualizador-efecto-invernadero/', icon: '🌍', name: 'Efecto Invernadero', description: 'Gases y calentamiento' },
    { url: '/visualizador-energia-nuclear/', icon: '⚛️', name: 'Energía Nuclear', description: 'Nuclear en la transición energética' },
    { url: '/calculadora-huella-carbono/', icon: '🌱', name: 'Huella de Carbono', description: 'Tu impacto personal' },
    { url: '/visualizador-ciclo-agua/', icon: '💧', name: 'Ciclo del Agua', description: 'Cómo cambia el ciclo hidrológico' },
  ],
  'visualizador-deuda-publica': [
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'Cómo se negocian los bonos' },
    { url: '/estimador-inversiones/', icon: '💹', name: 'Rentabilidad de Inversión', description: 'ROI e interés compuesto' },
    { url: '/estimador-inversiones/', icon: '📊', name: 'Simulador de Inversión', description: 'Cuánto rinde tu capital' },
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
    { url: '/visualizador-internet-60-segundos/', icon: '🌐', name: 'Cómo Funciona Internet', description: 'Infraestructura sobre la que opera blockchain' },
    { url: '/estimador-inversiones/', icon: '📊', name: 'Simulador de Inversión', description: 'Cripto como activo en cartera' },
  ],
  'visualizador-criptografia': [
    { url: '/visualizador-blockchain/', icon: '⛓️', name: 'Blockchain', description: 'La criptografía que protege la cadena de bloques' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🤖', name: 'IA y Redes Neuronales', description: 'Otra revolución tecnológica paralela' },
    { url: '/visualizador-redes-computadoras/', icon: '🌐', name: 'Redes de Computadoras', description: 'TLS/HTTPS protege cada conexión TCP/IP — la criptografía es la capa de seguridad de la red' },
    { url: '/visualizador-logica-proposicional/', icon: '🔣', name: 'Lógica Proposicional', description: 'El álgebra booleana es la base matemática de los circuitos de cifrado y las operaciones XOR' },
  ],
  'visualizador-tipos-interes-bce': [
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'Cómo reaccionan bonos y bolsa a los tipos' },
    { url: '/visualizador-deuda-publica/', icon: '🏛️', name: 'Deuda Pública', description: 'Bonos soberanos y prima de riesgo' },
    { url: '/selector-tipo-hipoteca/', icon: '🏦', name: 'Comparador Hipotecas', description: 'Impacto real del Euríbor en tu cuota' },
    { url: '/estimador-inversiones/', icon: '📊', name: 'Simulador de Inversión', description: 'Renta fija más atractiva con tipos altos' },
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
    { url: '/simulador-campo-electrico/', icon: '⚡', name: 'Campo Eléctrico', description: 'Cargas, líneas y equipotenciales' },
    { url: '/visualizador-mecanica-cuantica/', icon: '🔮', name: 'Mecánica Cuántica', description: 'La física que explica las cargas eléctricas' },
    { url: '/visualizador-relatividad-especial/', icon: '🌌', name: 'Relatividad Especial', description: 'Einstein y el electromagnetismo' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Cargas eléctricas en el átomo' },
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
    { url: '/tokenizador-ia/', icon: '🔤', name: 'Tokenizador Visual', description: 'Cuenta los tokens de tu texto y calcula el coste de API' },
    { url: '/arbol-decision-ia/', icon: '🌳', name: 'Árbol de Decisión', description: 'Visualiza cómo una máquina aprende a clasificar datos' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🧠', name: 'IA y Redes Neuronales', description: 'Las redes que hacen posibles los transformers' },
    { url: '/constructor-prompts/', icon: '🧱', name: 'Constructor de Prompts', description: 'Crea instrucciones efectivas para cualquier LLM' },
  ],
  'visualizador-ciclo-economico': [
    { url: '/visualizador-tipos-interes-bce/', icon: '🏦', name: 'Tipos de Interés BCE', description: 'Cómo el BCE usa los tipos para modular el ciclo' },
    { url: '/visualizador-mercados-financieros/', icon: '📈', name: 'Mercados Financieros', description: 'La bolsa como indicador leading del ciclo' },
    { url: '/visualizador-estructuras-mercado/', icon: '🏪', name: 'Estructuras de Mercado', description: 'La estructura del mercado (monopolio, oligopolio) determina cómo se transmiten los shocks cíclicos' },
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
    { url: '/visualizador-falacias-logicas/', icon: '🔍', name: 'Test Pensamiento Crítico', description: 'Evalúa tu razonamiento lógico' },
    { url: '/visualizador-evolucion-humana/', icon: '🦴', name: 'Evolución Humana', description: 'El origen cognitivo de nuestros razonamientos' },
    { url: '/visualizador-falacias-logicas/', icon: '❌', name: 'Falacias Lógicas', description: 'Guía visual de errores de razonamiento' },
  ],
  'visualizador-evolucion-humana': [
    { url: '/visualizador-falacias-logicas/', icon: '🧠', name: 'Falacias Lógicas', description: 'Cómo razona el cerebro humano' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'La base molecular de la herencia' },
    { url: '/visualizador-cerebro/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'El cerebro moderno que heredamos' },
    { url: '/visualizador-ecosistema/', icon: '🌿', name: 'Ecosistemas', description: 'El entorno que moldeó nuestra evolución' },
  ],
  'visualizador-economia-circular': [
    { url: '/calculadora-huella-carbono/', icon: '🌍', name: 'Huella de Carbono', description: 'Tu impacto ambiental personal' },
    { url: '/visualizador-cambio-climatico-tipping-points/', icon: '🌡️', name: 'Cambio Climático', description: 'Los puntos de no retorno del planeta' },
    { url: '/visualizador-energia-nuclear/', icon: '⚛️', name: 'Energía Nuclear', description: 'Energía sin carbono en el mix energético' },
  ],
  'visualizador-cortisol': [
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'Todas las hormonas y sus interacciones' },
    { url: '/visualizador-cerebro/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'Cómo el estrés afecta la memoria' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Ciclos del Sueño', description: 'El cortisol y el ritmo circadiano del sueño' },
    { url: '/visualizador-piel/', icon: '🫁', name: 'Piel y Barrera Cutánea', description: 'El cortisol y su efecto en la piel' },
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
    { url: '/visualizador-cerebro/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'Dopamina y consolidación de memoria' },
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
    { url: '/visualizador-cronobiologia/', icon: '🕐', name: 'Cronobiología', description: 'La melatonina es la señal de salida del reloj circadiano — el puente entre el reloj molecular y el cuerpo' },
  ],
  'visualizador-endorfinas': [
    { url: '/visualizador-dopamina/', icon: '⚡', name: 'Dopamina', description: 'El otro sistema del placer y la recompensa' },
    { url: '/visualizador-cortisol/', icon: '⚡', name: 'Cortisol', description: 'Ejercicio: endorfinas suben, cortisol se regula' },
    { url: '/visualizador-oxitocina/', icon: '🤝', name: 'Oxitocina', description: 'El contacto social activa tanto oxitocina como endorfinas' },
    { url: '/visualizador-cerebro/', icon: '🧠', name: 'Neurociencia del Aprendizaje', description: 'El sistema opioide y la motivación de aprender' },
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
    { url: '/visualizador-cerebro/', icon: '🎓', name: 'Neurociencia del Aprendizaje', description: 'Memoria implícita bajo anestesia: un fenómeno sorprendente' },
  ],
  'visualizador-lactasa': [
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧫', name: 'Enzimas del Cuerpo Humano', description: 'El panorama completo de las enzimas' },
    { url: '/visualizador-catalasa/', icon: '⚗️', name: 'Catalasa', description: 'Otra enzima espectacular: 40M reacciones/s' },
    { url: '/visualizador-evolucion-humana/', icon: '🦴', name: 'Evolución Humana', description: 'La mutación que permitió digerir leche en adultos' },
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
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué significan los códigos E de los alimentos procesados' },
  ],
  'visualizador-toma-decisiones': [
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos Cognitivos', description: 'Los sesgos individuales que el Sistema 1 introduce en cada decisión' },
    { url: '/analisis-decision-reversible/', icon: '🔄', name: 'Decisión Reversible', description: 'El marco Bezos para distinguir decisiones de alto y bajo riesgo' },
    { url: '/visualizador-cerebro-emociones/', icon: '💭', name: 'Cerebro y Emociones', description: 'Cómo la amígdala y la emoción secuestran al Sistema 2' },
    { url: '/visualizador-cerebro/', icon: '🧩', name: 'Memoria', description: 'Cómo la memoria de trabajo limita la capacidad del Sistema 2' },
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
    { url: '/guia-razas-perros/', icon: '🐕', name: 'Guía de Razas de Perros', description: '40 razas: tamaño, energía, temperamento y compatibilidad' },
    { url: '/guia-razas-gatos/', icon: '🐈', name: 'Guía de Razas de Gatos', description: '35 razas: pelo, energía, temperamento y compatibilidad' },
    { url: '/guia-cuidado-mascota/', icon: '📚', name: 'Guía Cuidado Mascota', description: 'Todo lo que necesitas saber para cuidar a tu mascota' },
    { url: '/calculadora-alimentacion-mascotas/', icon: '🍖', name: 'Alimentación Mascotas', description: 'Raciones diarias según peso y edad' },
  ],
  'selector-seguro-salud': [
    { url: '/selector-mascota/', icon: '🐾', name: 'Selector de Mascota', description: '¿Qué animal se adapta a tu vida?' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador de Seguros', description: 'Guía de todos los seguros en España' },
    { url: '/control-gastos/', icon: '🏠', name: 'Calculadora Gastos Hogar', description: 'Control de tu presupuesto mensual' },
    { url: '/estimador-sueldo-neto/', icon: '💰', name: 'Calculadora Salario Neto', description: 'Tu sueldo neto real tras IRPF y SS' },
  ],
  'selector-seguro-hogar': [
    { url: '/selector-seguro-salud/', icon: '🏥', name: 'Selector Seguro de Salud', description: '¿Necesitas seguro médico privado?' },
    { url: '/comparador-tipos-seguros/', icon: '📊', name: 'Comparador de Seguros', description: 'Guía de todos los seguros en España' },
    { url: '/control-gastos/', icon: '🏠', name: 'Calculadora Gastos Hogar', description: 'Control de tu presupuesto mensual' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Calculadora de Hipoteca', description: 'Cuota mensual y coste total de tu préstamo' },
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
  'calculadora-zonas-entrenamiento': saludApps.filter(a => a.url !== '/calculadora-zonas-entrenamiento/').slice(0, 4),

  // ── Deporte y Rendimiento Físico ──
  'calculadora-tiempos-running': [
    { url: '/calculadora-pace-running/', icon: '⏱️', name: 'Calculadora de Pace', description: 'Ritmo, velocidad y splits por kilómetro' },
    { url: '/calculadora-zonas-cardiacas/', icon: '💓', name: 'Zonas Cardíacas (Karvonen)', description: 'Tus 5 zonas de entrenamiento personalizadas' },
    { url: '/calculadora-zonas-entrenamiento/', icon: '❤️', name: 'Zonas de Entrenamiento FC', description: 'Pulsaciones por zona para correr' },
    { url: '/selector-ejercicio/', icon: '🏋️', name: 'Selector de Ejercicio', description: '¿Qué actividad física te conviene?' },
  ],
  'calculadora-zonas-cardiacas': [
    { url: '/calculadora-tiempos-running/', icon: '🏃', name: 'Predictor de Tiempos de Running', description: 'Estima tu tiempo en 5K, 10K y maratón' },
    { url: '/calculadora-pace-running/', icon: '⏱️', name: 'Calculadora de Pace', description: 'Ritmo y splits por kilómetro' },
    { url: '/calculadora-potencia-ciclismo/', icon: '🚴', name: 'Potencia en Ciclismo', description: 'W/kg, FTP y zonas de entrenamiento' },
    { url: '/calculadora-zonas-entrenamiento/', icon: '❤️', name: 'Zonas de Entrenamiento FC', description: 'Otra calculadora de zonas cardíacas' },
  ],
  'calculadora-1rm-gimnasio': [
    { url: '/calculadora-zonas-cardiacas/', icon: '💓', name: 'Zonas Cardíacas (Karvonen)', description: 'Entrena en las zonas adecuadas' },
    { url: '/calculadora-potencia-ciclismo/', icon: '🚴', name: 'Potencia en Ciclismo', description: 'W/kg y zonas de potencia FTP' },
    { url: '/selector-tipo-gimnasio/', icon: '🏋️', name: 'Selector de Tipo de Gimnasio', description: '¿Qué tipo de entrenamiento te conviene?' },
    { url: '/selector-ejercicio/', icon: '🏋️', name: 'Selector de Ejercicio', description: '¿Qué actividad física te conviene?' },
  ],
  'calculadora-potencia-ciclismo': [
    { url: '/calculadora-zonas-cardiacas/', icon: '💓', name: 'Zonas Cardíacas (Karvonen)', description: 'Combina potencia y frecuencia cardíaca' },
    { url: '/calculadora-pace-running/', icon: '⏱️', name: 'Calculadora de Pace', description: 'Equivalente al pace para ciclistas' },
    { url: '/calculadora-1rm-gimnasio/', icon: '🏋️', name: 'Calculadora de 1RM', description: 'Fuerza máxima para complementar el ciclismo' },
    { url: '/calculadora-tiempos-running/', icon: '🏃', name: 'Predictor de Tiempos Running', description: 'Predice tus tiempos de carrera' },
  ],
  'calculadora-pace-running': [
    { url: '/calculadora-tiempos-running/', icon: '🏃', name: 'Predictor de Tiempos de Running', description: 'Estima tu tiempo en cualquier distancia' },
    { url: '/calculadora-zonas-cardiacas/', icon: '💓', name: 'Zonas Cardíacas (Karvonen)', description: 'Entrena en el ritmo cardíaco correcto' },
    { url: '/calculadora-zonas-entrenamiento/', icon: '❤️', name: 'Zonas de Entrenamiento FC', description: 'Pulsaciones por zona para correr' },
    { url: '/selector-ejercicio/', icon: '🏋️', name: 'Selector de Ejercicio', description: '¿Qué actividad física te conviene?' },
  ],
  'calculadora-swolf-natacion': [
    { url: '/calculadora-zonas-cardiacas/', icon: '💓', name: 'Zonas Cardíacas (Karvonen)', description: 'Zonas de entrenamiento para natación' },
    { url: '/calculadora-pace-running/', icon: '⏱️', name: 'Calculadora de Pace', description: 'Equivalent del pace en running' },
    { url: '/calculadora-tiempos-running/', icon: '🏃', name: 'Predictor de Tiempos Running', description: 'Si también practicas running' },
    { url: '/selector-ejercicio/', icon: '🏋️', name: 'Selector de Ejercicio', description: '¿Qué actividad física te conviene?' },
  ],

  'selector-ejercicio': [
    { url: '/calculadora-zonas-entrenamiento/', icon: '❤️', name: 'Zonas de Entrenamiento', description: 'Calcula tus 5 zonas de FC para entrenar mejor' },
    { url: '/selector-dieta/', icon: '🥗', name: 'Selector de Dieta', description: '¿Qué tipo de alimentación te conviene?' },
    { url: '/orientador-imc/', icon: '⚖️', name: 'Orientador IMC', description: 'Calcula tu índice de masa corporal' },
    { url: '/test-habitos-saludables/', icon: '💚', name: 'Test Hábitos Saludables', description: 'Evalúa tus hábitos de vida' },
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
  'test-habitos-saludables': [
    { url: '/seguimiento-habitos/', icon: '✅', name: 'Seguimiento Hábitos', description: 'Construye rutinas saludables' },
    { url: '/calculadora-sueno/', icon: '😴', name: 'Calculadora Sueño', description: 'Ciclos de sueño óptimos' },
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué significan los códigos E de los alimentos' },
    { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Técnica de productividad' },
  ],
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
  'guia-cuidado-mascota': [
    { url: '/guia-razas-perros/', icon: '🐕', name: 'Guía de Razas de Perros', description: '40 razas: tamaño, energía, temperamento y compatibilidad' },
    { url: '/guia-razas-gatos/', icon: '🐈', name: 'Guía de Razas de Gatos', description: '35 razas: pelo, energía, temperamento y compatibilidad' },
    { url: '/selector-mascota/', icon: '🐾', name: 'Selector de Mascota', description: 'Test de 10 preguntas: qué mascota se adapta a ti' },
    { url: '/calculadora-alimentacion-mascotas/', icon: '🍖', name: 'Alimentación Mascotas', description: 'Raciones diarias según peso y edad' },
  ],

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

  // ESTILOS LITERARIOS
  'visualizador-estilos-literarios': [
    { url: '/comparador-voces-narrativas/', icon: '🎭', name: 'Comparador de Voces', description: 'Compara el estilo de los grandes novelistas' },
    { url: '/visualizador-narratologia/', icon: '🧠', name: 'Narratología Visual', description: 'Genette y Greimas: tiempo, voz y modelo actancial' },
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
    { url: '/test-tipo-lector/', icon: '📚', name: 'Test Tipo Lector', description: 'Descubre tu arquetipo como lector' },
  ],

  // COMPARADOR DE VOCES
  'comparador-voces-narrativas': [
    { url: '/configurador-narrativo/', icon: '🧭', name: 'Configurador Narrativo', description: 'Elige persona, narrador y tiempo verbal para tu historia' },
    { url: '/visualizador-narratologia/', icon: '🧠', name: 'Narratología Visual', description: 'Genette y Greimas: tiempo, voz y modelo actancial' },
    { url: '/visualizador-estilos-literarios/', icon: '📖', name: 'Estilos Literarios', description: 'Explora los grandes movimientos de la literatura' },
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
  ],

  // ESCRITURA CREATIVA
  'orientador-escritura-creativa': [
    { url: '/visualizador-estructuras-narrativas/', icon: '🏗️', name: 'Estructuras Narrativas', description: '6 modelos: Freytag, 3 Actos, Héroe, Kishōtenketsu…' },
    { url: '/errores-escritura-creativa/', icon: '✏️', name: 'Errores de Escritura', description: '15 fallos frecuentes con corrección explicada' },
    { url: '/generador-incipit/', icon: '📝', name: 'Generador de Íncipit', description: '62 primeras frases para arrancar tu novela' },
    { url: '/visualizador-narratologia/', icon: '🧠', name: 'Narratología Visual', description: 'Genette y Greimas: tiempo, voz y modelo actancial' },
  ],

  // GÉNEROS DE LA NOVELA
  'visualizador-generos-novela': [
    { url: '/test-tipo-lector/', icon: '📚', name: 'Test Tipo Lector', description: 'Descubre tu arquetipo como lector' },
    { url: '/configurador-narrativo/', icon: '🧭', name: 'Configurador Narrativo', description: 'Elige persona, narrador y tiempo verbal para tu historia' },
    { url: '/visualizador-estilos-literarios/', icon: '📖', name: 'Estilos Literarios', description: 'Explora los grandes movimientos de la literatura' },
    { url: '/comparador-voces-narrativas/', icon: '🎭', name: 'Comparador de Voces', description: 'Compara el estilo de los grandes novelistas' },
  ],

  // RECURSOS LITERARIOS
  'visualizador-recursos-literarios': [
    { url: '/quiz-figuras-retoricas/', icon: '📝', name: 'Quiz Figuras Retóricas', description: 'Pon a prueba el reconocimiento de figuras en contexto real' },
    { url: '/generador-poemas/', icon: '✍️', name: 'Generador de Poemas', description: 'Escribe haiku, soneto, romance y más con guía métrica' },
    { url: '/guia-comentario-texto/', icon: '📝', name: 'Comentario de Texto', description: 'Metodología completa con plantillas y vocabulario' },
    { url: '/guia-metrica-estrofas/', icon: '🎵', name: 'Métrica y Estrofas', description: 'Contador de sílabas, tipos de verso y estrofas clásicas' },
  ],

  // TEST TIPO LECTOR
  'test-tipo-lector': [
    { url: '/visualizador-generos-novela/', icon: '🐉', name: 'Géneros de la Novela', description: 'Explora los 11 grandes géneros narrativos' },
    { url: '/quiz-literatura-universal/', icon: '🎭', name: 'Quiz de Literatura', description: 'Pon a prueba tus conocimientos literarios' },
    { url: '/visualizador-estilos-literarios/', icon: '📖', name: 'Estilos Literarios', description: 'Explora los grandes movimientos de la literatura' },
    { url: '/comparador-voces-narrativas/', icon: '🎭', name: 'Comparador de Voces', description: 'Compara el estilo de los grandes novelistas' },
  ],

  // QUIZ LITERATURA UNIVERSAL
  'quiz-literatura-universal': [
    { url: '/guia-metrica-estrofas/', icon: '🎵', name: 'Métrica y Estrofas', description: 'Contador de sílabas, tipos de verso y estrofas clásicas' },
    { url: '/visualizador-estilos-literarios/', icon: '📖', name: 'Estilos Literarios', description: 'Explora los grandes movimientos de la literatura' },
    { url: '/comparador-voces-narrativas/', icon: '🎭', name: 'Comparador de Voces', description: 'Compara el estilo de los grandes novelistas' },
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
  ],
  // ERRORES ESCRITURA CREATIVA
  'errores-escritura-creativa': [
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
    { url: '/guia-metrica-estrofas/', icon: '🎵', name: 'Métrica y Estrofas', description: 'Contador de sílabas, tipos de verso y estrofas clásicas' },
    { url: '/visualizador-recursos-literarios/', icon: '📜', name: 'Recursos Literarios', description: '27 figuras retóricas con definición y ejemplos' },
    { url: '/generador-incipit/', icon: '📝', name: 'Generador de Íncipit', description: '62 primeras frases para arrancar tu novela' },
  ],

  // CONFIGURADOR NARRATIVO
  'configurador-narrativo': [
    { url: '/visualizador-estructuras-narrativas/', icon: '🏗️', name: 'Estructuras Narrativas', description: '6 modelos: Freytag, 3 Actos, Héroe, Kishōtenketsu…' },
    { url: '/errores-escritura-creativa/', icon: '✏️', name: 'Errores de Escritura', description: '15 fallos frecuentes con corrección explicada' },
    { url: '/visualizador-narratologia/', icon: '🧠', name: 'Narratología Visual', description: 'Genette y Greimas: tiempo, voz y modelo actancial' },
    { url: '/generador-incipit/', icon: '📝', name: 'Generador de Íncipit', description: '62 primeras frases para arrancar tu novela' },
  ],

  // GENERADOR DE ÍNCIPIT
  'generador-incipit': [
    { url: '/errores-escritura-creativa/', icon: '✏️', name: 'Errores de Escritura', description: '15 fallos frecuentes con corrección explicada' },
    { url: '/configurador-narrativo/', icon: '🧭', name: 'Configurador Narrativo', description: 'Elige persona, narrador y tiempo verbal para tu historia' },
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
    { url: '/visualizador-recursos-literarios/', icon: '📜', name: 'Recursos Literarios', description: '27 figuras retóricas con definición y ejemplos' },
  ],

  // NARRATOLOGÍA VISUAL
  'visualizador-narratologia': [
    { url: '/configurador-narrativo/', icon: '🧭', name: 'Configurador Narrativo', description: 'Elige persona, narrador y tiempo verbal para tu historia' },
    { url: '/visualizador-estructuras-narrativas/', icon: '🏗️', name: 'Estructuras Narrativas', description: '6 modelos: Freytag, 3 Actos, Héroe, Kishōtenketsu…' },
    { url: '/comparador-voces-narrativas/', icon: '🎭', name: 'Comparador de Voces', description: 'Compara el estilo de los grandes novelistas' },
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
  ],

  // ESTRUCTURAS NARRATIVAS
  'visualizador-estructuras-narrativas': [
    { url: '/constructor-personaje/', icon: '👤', name: 'Constructor de Personaje', description: '19 dimensiones para crear personajes memorables' },
    { url: '/visualizador-narratologia/', icon: '🧠', name: 'Narratología Visual', description: 'Genette y Greimas: tiempo, voz y modelo actancial' },
    { url: '/configurador-narrativo/', icon: '🧭', name: 'Configurador Narrativo', description: 'Elige persona, narrador y tiempo verbal para tu historia' },
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
  ],

  // CONSTRUCTOR DE PERSONAJE
  'constructor-personaje': [
    { url: '/visualizador-estructuras-narrativas/', icon: '🏗️', name: 'Estructuras Narrativas', description: '6 modelos: Freytag, 3 Actos, Héroe, Kishōtenketsu…' },
    { url: '/guia-metrica-estrofas/', icon: '🎵', name: 'Métrica y Estrofas', description: 'Contador de sílabas, tipos de verso y estrofas clásicas' },
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
    { url: '/generador-incipit/', icon: '📝', name: 'Generador de Íncipit', description: '62 primeras frases para arrancar tu novela' },
  ],

  // GUÍA DE MÉTRICA Y ESTROFAS
  'guia-metrica-estrofas': [
    { url: '/quiz-metrica-estrofas/', icon: '🎶', name: 'Quiz de Métrica', description: 'Pon a prueba tipos de verso, estrofas y rima' },
    { url: '/generador-poemas/', icon: '✍️', name: 'Generador de Poemas', description: 'Escribe haiku, soneto, romance y más con guía métrica' },
    { url: '/guia-comentario-texto/', icon: '📝', name: 'Comentario de Texto', description: 'Metodología completa con plantillas y vocabulario' },
    { url: '/visualizador-recursos-literarios/', icon: '📜', name: 'Recursos Literarios', description: '27 figuras retóricas con definición y ejemplos' },
  ],

  // GUÍA COMENTARIO DE TEXTO
  'guia-comentario-texto': [
    { url: '/guia-metrica-estrofas/', icon: '🎵', name: 'Guía de Métrica', description: 'Contador de sílabas, tipos de verso y estrofas clásicas' },
    { url: '/generador-poemas/', icon: '✍️', name: 'Generador de Poemas', description: 'Escribe haiku, soneto, romance y más con guía métrica' },
    { url: '/visualizador-recursos-literarios/', icon: '📜', name: 'Recursos Literarios', description: '27 figuras retóricas con definición y ejemplos' },
    { url: '/quiz-figuras-retoricas/', icon: '📝', name: 'Quiz Figuras Retóricas', description: 'Pon a prueba el reconocimiento de figuras retóricas' },
  ],

  // QUIZ DE MÉTRICA Y ESTROFAS
  'quiz-metrica-estrofas': [
    { url: '/guia-metrica-estrofas/', icon: '🎵', name: 'Guía de Métrica', description: 'Contador de sílabas, tipos de verso y estrofas clásicas' },
    { url: '/generador-poemas/', icon: '✍️', name: 'Generador de Poemas', description: 'Escribe haiku, soneto, romance y más con guía métrica' },
    { url: '/quiz-figuras-retoricas/', icon: '📝', name: 'Quiz Figuras Retóricas', description: 'Pon a prueba el reconocimiento de figuras retóricas' },
    { url: '/visualizador-recursos-literarios/', icon: '📜', name: 'Recursos Literarios', description: '27 figuras retóricas con definición y ejemplos' },
  ],

  // GENERADOR DE POEMAS POR FORMA
  'generador-poemas': [
    { url: '/guia-metrica-estrofas/', icon: '🎵', name: 'Guía de Métrica', description: 'Contador de sílabas, tipos de verso y estrofas clásicas' },
    { url: '/quiz-metrica-estrofas/', icon: '🎶', name: 'Quiz de Métrica', description: 'Pon a prueba tipos de verso, estrofas y rima · 3 niveles' },
    { url: '/visualizador-recursos-literarios/', icon: '📜', name: 'Recursos Literarios', description: '27 figuras retóricas con definición y ejemplos' },
    { url: '/guia-comentario-texto/', icon: '📝', name: 'Comentario de Texto', description: 'Metodología completa con plantillas y vocabulario' },
  ],

  'curso-redaccion-academica': [
    { url: '/orientador-escritura-creativa/', icon: '✍️', name: 'Orientador de Escritura', description: 'Elige tu género y obtén tu hoja de ruta' },
    { url: '/calculadora-legibilidad/', icon: '📖', name: 'Calculadora de Legibilidad', description: 'Mide cuán fácil de leer es tu texto' },
    { url: '/contador-palabras/', icon: '🔢', name: 'Contador de Palabras', description: 'Palabras, caracteres y tiempo de lectura' },
    { url: '/comparador-textos/', icon: '🔍', name: 'Comparador de Textos', description: 'Diferencias entre versiones' },
  ],

  // TEXTO
  'contador-palabras': [...textoApps.filter(a => a.url !== '/contador-palabras/'), textoExtraApps[0]],
  'conversor-texto': [...textoApps.filter(a => a.url !== '/conversor-texto/'), textoExtraApps[1]],
  'limpiador-texto': [...textoApps.filter(a => a.url !== '/limpiador-texto/'), textoExtraApps[2]],
  'comparador-textos': [...textoApps.filter(a => a.url !== '/comparador-textos/'), textoExtraApps[1]],
  'contador-silabas': [...textoApps.filter(a => a.url !== '/contador-silabas/'), textoExtraApps[1]],
  'conversor-markdown-html': [...textoApps.slice(0, 2), ...webDevApps.slice(0, 2)],
  'generador-lorem-ipsum': [...textoApps.filter(a => a.url !== '/generador-lorem-ipsum/')],
  'generador-anagramas': [
    { url: '/contador-silabas/', icon: '📐', name: 'Contador Sílabas', description: 'Separa y cuenta sílabas' },
    { url: '/buscador-palabras-patron/', icon: '🔍', name: 'Buscador por Patrón', description: 'Palabras con huecos para crucigramas' },
    { url: '/juego-wordle/', icon: '🔤', name: 'Wordle', description: 'Adivina la palabra del día' },
    { url: '/limpiador-texto/', icon: '🧹', name: 'Limpiador Texto', description: 'Elimina formato' },
    { url: '/contador-palabras/', icon: '🔢', name: 'Contador Palabras', description: 'Palabras y caracteres' },
  ],
  'buscador-palabras-patron': [
    { url: '/generador-anagramas/', icon: '🔤', name: 'Generador Anagramas', description: 'Palabras con letras sueltas' },
    { url: '/juego-wordle/', icon: '🔤', name: 'Wordle', description: 'Adivina la palabra del día' },
    { url: '/juego-ahorcado/', icon: '🎯', name: 'Ahorcado', description: 'Adivina la palabra letra a letra' },
    { url: '/conjugador-verbos/', icon: '🔁', name: 'Conjugador Verbos', description: 'Conjugaciones del español' },
  ],
  'detector-idioma': textoApps,
  'conjugador-verbos': [
    { url: '/buscador-palabras-patron/', icon: '🔍', name: 'Buscador por Patrón', description: 'Palabras con huecos' },
    { url: '/contador-silabas/', icon: '📐', name: 'Contador Sílabas', description: 'Separa y cuenta sílabas' },
    { url: '/generador-anagramas/', icon: '🔤', name: 'Generador Anagramas', description: 'Reordena letras' },
    { url: '/detector-idioma/', icon: '🌍', name: 'Detector Idioma', description: 'Identifica el idioma' },
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
  'generador-hashes': seguridadDigitalApps.filter(a => a.url !== '/generador-hashes/'),
  'codificador-base64': criptografiaModernaApps.filter(a => a.url !== '/codificador-base64/'),

  // SEGURIDAD DIGITAL PRÁCTICA
  'evaluador-fortaleza-contrasena': seguridadDigitalApps.filter(a => a.url !== '/evaluador-fortaleza-contrasena/'),
  'test-phishing': seguridadDigitalApps.filter(a => a.url !== '/test-phishing/'),
  'curso-criptografia-seguridad': seguridadDigitalApps.filter(a => a.url !== '/curso-criptografia-seguridad/'),

  // CONVERSIÓN DE DATOS
  'conversor-formatos': conversionDatosApps.filter(a => a.url !== '/conversor-formatos/'),

  // DISEÑO
  'visualizador-colores-cielo': [
    { url: '/golden-hour/', icon: '🌅', name: 'Golden Hour', description: 'Calcula la hora dorada y azul exactas para tu ubicación y fecha' },
    { url: '/creador-paletas/', icon: '🎨', name: 'Creador de Paletas', description: 'Genera paletas de color armónicas para diseño web y branding' },
    { url: '/conversor-colores/', icon: '🔄', name: 'Conversor de Colores', description: 'Convierte entre HEX, RGB, HSL, CMYK y otros espacios de color' },
    { url: '/generador-gradientes/', icon: '🌅', name: 'Generador de Gradientes', description: 'Crea gradientes CSS a partir de los colores del cielo que hayas copiado' },
    { url: '/visualizador-optica/', icon: '💡', name: 'Óptica y la Luz', description: 'La física detrás del color: reflexión, refracción y descomposición espectral' },
  ],
  'conversor-colores': disenoColoresApps.filter(a => a.url !== '/conversor-colores/'),
  'creador-paletas': disenoColoresApps.filter(a => a.url !== '/creador-paletas/'),
  'generador-gradientes': disenoColoresApps.filter(a => a.url !== '/generador-gradientes/'),
  'contraste-colores': disenoColoresApps.filter(a => a.url !== '/contraste-colores/'),
  'simulador-baja-vision': [
    { url: '/simulador-daltonismo/', icon: '🌈', name: 'Simulador de Daltonismo', description: 'Sube una imagen y simula protanopia, deuteranopia y tritanopia' },
    { url: '/conversor-braille/', icon: '⠃', name: 'Traductor de Braille', description: 'El sistema de lectura para visión muy reducida o ceguera' },
    { url: '/lupa-digital/', icon: '🔍', name: 'Lupa Digital', description: 'Herramienta de magnificación con cámara para baja visión' },
    { url: '/guia/accesibilidad/', icon: '♿', name: 'Guía de Accesibilidad', description: 'Recorrido completo por las herramientas y apoyos visuales' },
  ],
  'simulador-daltonismo': disenoColoresApps.filter(a => a.url !== '/simulador-daltonismo/'),
  'convertidor-subtitulos': [
    { url: '/contraste-colores/', icon: '👁️', name: 'Contraste Colores', description: 'Accesibilidad WCAG' },
    { url: '/simulador-daltonismo/', icon: '🌈', name: 'Simulador Daltonismo', description: '8 tipos visuales' },
    { url: '/simulador-baja-vision/', icon: '👁️', name: 'Simulador Baja Visión', description: 'Cataratas, presbicia' },
    { url: '/conversor-braille/', icon: '⠃', name: 'Conversor Braille', description: 'Texto ↔ Braille' },
    { url: '/conversor-formatos/', icon: '🔄', name: 'Conversor Formatos', description: 'JSON, CSV, Excel, XML' },
  ],
  'generador-sombras': disenoExtraApps.filter(a => a.url !== '/generador-sombras/'),
  'generador-tipografias': disenoExtraApps.filter(a => a.url !== '/generador-tipografias/'),
  'calculadora-aspectos': [...disenoExtraApps.filter(a => a.url !== '/calculadora-aspectos/').slice(0, 2), ...imagenesApps.slice(0, 2)],
  'creador-thumbnails': [...imagenesApps.slice(0, 2), ...disenoColoresApps.slice(0, 2)],
  'generador-og-images': [
    { url: '/creador-thumbnails/', icon: '🎬', name: 'Creador Thumbnails', description: 'Miniaturas para YouTube' },
    { url: '/creador-paletas/', icon: '🎨', name: 'Creador de Paletas', description: 'Elige la paleta de colores de tu imagen' },
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
  'calculadora-geometria': [
    ...matematicasAvanzadasApps.filter(a => a.url !== '/calculadora-geometria/'),
    { url: '/visualizador-volumenes/', icon: '🔷', name: 'Volúmenes 3D', description: 'Visualiza y calcula volúmenes de esfera, cubo, cilindro, cono y pirámide con sliders interactivos' },
  ],
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
  'preparar-entrevista-competencias': [
    { url: '/generador-curriculum/', icon: '📄', name: 'Crear Currículum', description: 'CV / hoja de vida ATS-friendly con vista previa' },
    { url: '/test-competencias-digitales/', icon: '📊', name: 'Test de Competencias Digitales', description: 'Autoevaluación DigComp con plan de desarrollo' },
    ...productividadApps.filter(a => a.url !== '/preparar-entrevista-competencias/').slice(0, 1),
    { url: '/quiz-complejidad-algoritmos/', icon: '⏱️', name: 'Quiz Complejidad', description: 'Prepara entrevistas técnicas de programación' },
  ],
  'test-competencias-digitales': [
    { url: '/generador-curriculum/', icon: '📄', name: 'Crear Currículum', description: 'Vuelca tus competencias en tu CV' },
    { url: '/preparar-entrevista-competencias/', icon: '🌟', name: 'Entrevista por Competencias', description: 'Prepara respuestas con el método STAR' },
    { url: '/test-madurez-digital/', icon: '🤖', name: 'Test Madurez Digital', description: 'Nivel de digitalización de tu empresa' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: '100+ términos de programación' },
  ],
  'generador-curriculum': [
    { url: '/preparar-entrevista-competencias/', icon: '🌟', name: 'Entrevista por Competencias', description: 'Prepara la entrevista con el método STAR' },
    { url: '/test-competencias-digitales/', icon: '📊', name: 'Test de Competencias Digitales', description: 'Descubre tu nivel digital para el CV' },
    ...productividadApps.filter(a => a.url !== '/preparar-entrevista-competencias/').slice(0, 2),
  ],
  'guia-primer-empleo': [
    { url: '/test-competencias-digitales/', icon: '📊', name: 'Test de Competencias Digitales', description: 'Autoevaluación DigComp con plan de desarrollo' },
    { url: '/generador-curriculum/', icon: '📄', name: 'Crear Currículum', description: 'CV / hoja de vida ATS-friendly con vista previa' },
    { url: '/preparar-entrevista-competencias/', icon: '🌟', name: 'Entrevista por Competencias', description: 'Prepara respuestas con el método STAR' },
    { url: '/visualizador-sueldo-neto/', icon: '💶', name: 'Tu Sueldo al Desnudo', description: 'De bruto a neto explicado paso a paso' },
  ],
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
    { url: '/constructor-prompts/', icon: '🧱', name: 'Constructor de Prompts', description: 'Crea prompts paso a paso para cualquier IA' },
    { url: '/diagnostico-brecha-ia/', icon: '🧠', name: 'Brecha IA', description: '¿Usas la IA para pensar mejor?' },
    { url: '/mapa-automatizacion-personal/', icon: '🗺️', name: 'Automatización Personal', description: '¿Qué automatizar y qué proteger?' },
    { url: '/visualizador-comparador-ia/', icon: '🗂️', name: 'Comparador de IAs', description: 'ChatGPT, Claude, Gemini y más — guía interactiva' },
  ],
  'constructor-prompts': [
    { url: '/evaluador-prompts/', icon: '💬', name: 'Evaluador de Prompts', description: '¿Tus instrucciones a la IA son buenas?' },
    { url: '/tokenizador-ia/', icon: '🔤', name: 'Tokenizador Visual', description: 'Cuántos tokens usa tu prompt y cuánto cuesta' },
    { url: '/visualizador-comparador-ia/', icon: '🗂️', name: 'Comparador de IAs 2026', description: 'Qué modelo elegir según tu caso de uso' },
    { url: '/diagnostico-brecha-ia/', icon: '🧠', name: 'Brecha IA', description: '¿Usas la IA para pensar mejor o dejar de pensar?' },
  ],
  'guia-programar-con-ia': [
    { url: '/comparador-ides-ia/', icon: '🖥️', name: 'IDEs con IA 2026', description: 'Cursor, Windsurf, VS Code, Zed — cuál usar para empezar' },
    { url: '/comparador-asistentes-codigo/', icon: '⌨️', name: 'Asistentes de Código IA', description: 'Claude Code, Copilot, Gemini — cuál añadir a tu IDE' },
    { url: '/constructor-prompts/', icon: '🧱', name: 'Constructor de Prompts', description: 'Crea instrucciones claras para la IA paso a paso' },
    { url: '/evaluador-prompts/', icon: '💬', name: 'Evaluador de Prompts', description: '¿Tus instrucciones a la IA son lo suficientemente buenas?' },
  ],
  'comparador-ides-ia': [
    { url: '/comparador-asistentes-codigo/', icon: '⌨️', name: 'Asistentes de Código IA', description: 'Claude Code, Copilot, Gemini Code Assist y Codex — cuál asistente añadir a tu IDE' },
    { url: '/visualizador-comparador-ia/', icon: '🗂️', name: 'Comparador de IAs 2026', description: 'ChatGPT, Claude, Gemini — comparativa general más allá del código' },
    { url: '/tokenizador-ia/', icon: '🔤', name: 'Tokenizador Visual', description: 'Cuántos tokens usa tu código y cuánto cuesta la API' },
    { url: '/constructor-prompts/', icon: '🧱', name: 'Constructor de Prompts', description: 'Crea instrucciones efectivas para tu asistente de código' },
  ],
  'comparador-asistentes-codigo': [
    { url: '/comparador-ides-ia/', icon: '🖥️', name: 'IDEs con IA 2026', description: 'Cursor, Windsurf, VS Code, Zed — dónde instalar tu asistente' },
    { url: '/visualizador-comparador-ia/', icon: '🗂️', name: 'Comparador de IAs 2026', description: 'ChatGPT, Claude, Gemini, Copilot, Mistral — comparativa general' },
    { url: '/constructor-prompts/', icon: '🧱', name: 'Constructor de Prompts', description: 'Crea instrucciones efectivas para cualquier IA' },
    { url: '/tokenizador-ia/', icon: '🔤', name: 'Tokenizador Visual', description: 'Cuenta tokens y calcula costes de API' },
  ],
  'arbol-decision-ia': [
    { url: '/visualizador-llm-funcionamiento/', icon: '🤖', name: 'Cómo Funcionan los LLMs', description: 'Tokens, embeddings, atención y parámetros avanzados' },
    { url: '/tokenizador-ia/', icon: '🔤', name: 'Tokenizador Visual', description: 'Cómo dividen el texto en tokens los LLMs' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🧠', name: 'IA y Redes Neuronales', description: 'Cómo aprenden las redes neuronales' },
    { url: '/constructor-prompts/', icon: '🧱', name: 'Constructor de Prompts', description: 'Crea instrucciones paso a paso para IAs' },
  ],
  'tokenizador-ia': [
    { url: '/constructor-prompts/', icon: '🧱', name: 'Constructor de Prompts', description: 'Crea instrucciones paso a paso para cualquier IA' },
    { url: '/evaluador-prompts/', icon: '💬', name: 'Evaluador de Prompts', description: '¿Tus instrucciones a la IA son específicas o vagas?' },
    { url: '/visualizador-comparador-ia/', icon: '🗂️', name: 'Comparador de IAs 2026', description: 'Cuál es el modelo más adecuado para tu caso' },
    { url: '/visualizador-llm-funcionamiento/', icon: '🤖', name: 'Cómo Funcionan los LLMs', description: 'Tokens, embeddings, atención y temperatura explicados' },
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
    { url: '/visualizador-estrategia-empresarial/', icon: '♟️', name: 'Estrategia Empresarial Visual', description: 'Los 6 módulos de la estrategia' },
    { url: '/auditoria-propuesta-valor/', icon: '💎', name: 'Propuesta de Valor', description: '¿Tu oferta encaja con la necesidad?' },
    { url: '/test-validacion-idea/', icon: '🧪', name: 'Validación de Idea', description: '¿Tu idea resuelve un problema real?' },
    { url: '/mapa-riesgo-emprendedor/', icon: '🎲', name: 'Riesgo Emprendedor', description: '¿Qué pasa si no funciona?' },
  ],
  'visualizador-estrategia-empresarial': [
    { url: '/curso-estrategia-empresarial/', icon: '♟️', name: 'Curso de Estrategia Empresarial', description: 'Profundiza en 10 capítulos' },
    { url: '/diagnostico-modelo-negocio/', icon: '🏛️', name: 'Diagnóstico de Modelo de Negocio', description: 'Aplica el Business Model Canvas a tu negocio' },
    { url: '/auditoria-propuesta-valor/', icon: '💎', name: 'Auditoría de Propuesta de Valor', description: '¿Tu oferta encaja con la necesidad?' },
    { url: '/test-validacion-idea/', icon: '🧪', name: 'Test de Validación de Idea', description: '¿Tu idea resuelve un problema real?' },
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
    { url: '/paises-del-mundo/', icon: '🌍', name: 'Países del Mundo', description: 'Buscador de 196 países' },
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
    { url: '/visualizador-recursos-literarios/', icon: '📜', name: 'Guía de Figuras Retóricas', description: '27 figuras con definición, ejemplos y cómo distinguirlas' },
    { url: '/quiz-metrica-estrofas/', icon: '🎶', name: 'Quiz de Métrica', description: 'Tipos de verso, estrofas y rima · 3 niveles' },
    { url: '/visualizador-estilos-literarios/', icon: '📖', name: 'Estilos Literarios', description: 'Los grandes movimientos de la literatura' },
    { url: '/quiz-literatura-universal/', icon: '🎭', name: 'Quiz de Literatura', description: 'Autores, obras y movimientos literarios' },
  ],
  'quiz-reinos-naturaleza': [
    { url: '/quiz-tipos-plantas/', icon: '🌿', name: 'Quiz Tipos de Plantas', description: 'Clasifica 40 organismos vegetales en 6 grupos' },
    { url: '/visualizador-reino-vegetal/', icon: '🌿', name: 'El Reino Vegetal', description: 'Árbol interactivo de clasificación botánica' },
    { url: '/visualizador-reino-fungi/', icon: '🍄', name: 'El Reino Fungi', description: 'Ascomicetos, basidiomicetos y ciclo de vida del hongo' },
    { url: '/quiz-simbolos-quimicos/', icon: '⚗️', name: 'Quiz Símbolos Químicos', description: 'Aprende la tabla periódica' },
  ],
  'quiz-tabla-periodica': [
    { url: '/quiz-simbolos-quimicos/', icon: '⚗️', name: 'Quiz Símbolos Químicos', description: 'Símbolo ↔ nombre de 85 elementos' },
    { url: '/tabla-periodica/', icon: '🧪', name: 'Tabla Periódica', description: 'Consulta los 118 elementos' },
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '🔬', name: 'Tendencias Periódicas', description: 'Mapas de calor y propiedades' },
  ],
  'quiz-simbolos-quimicos': [
    { url: '/quiz-tabla-periodica/', icon: '🧪', name: 'Quiz Tabla Periódica', description: 'Grupos, períodos y propiedades' },
    { url: '/quiz-reinos-naturaleza/', icon: '🔬', name: 'Quiz Reinos Naturaleza', description: '43 organismos sorprendentes' },
    { url: '/quiz-paises-capitales/', icon: '🌍', name: 'Quiz Países', description: 'Capitales y banderas del mundo' },
    { url: '/tabla-periodica/', icon: '🧪', name: 'Tabla Periódica', description: 'Consulta los 118 elementos' },
  ],
  'juego-memoria': [
    { url: '/juego-sudoku/', icon: '🔢', name: 'Sudoku', description: 'Puzzle lógico clásico' },
    { url: '/juego-puzzle-matematico/', icon: '➕', name: 'Puzzle Matemático', description: 'Retos numéricos mentales' },
    { url: '/juego-ahorcado/', icon: '🎯', name: 'Ahorcado', description: 'Adivina la palabra letra a letra' },
    { url: '/quiz-paises-capitales/', icon: '🌍', name: 'Quiz Países y Capitales', description: 'Pon a prueba tu memoria geográfica' },
  ],
  'juego-puzzle-matematico': [
    { url: '/juego-sudoku/', icon: '🔢', name: 'Sudoku', description: 'Puzzle lógico clásico' },
    { url: '/juego-memoria/', icon: '🧠', name: 'Juego de Memoria', description: 'Encuentra parejas y entrena la memoria' },
    { url: '/juego-ahorcado/', icon: '🎯', name: 'Ahorcado', description: 'Adivina la palabra letra a letra' },
    { url: '/calculadora-notas/', icon: '📊', name: 'Calculadora de Notas', description: 'Calcula medias y notas para superar el curso' },
  ],
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
  'editor-exif': [...imagenesApps.filter(a => a.url !== '/editor-exif/'), { url: '/test-phishing/', icon: '🎣', name: 'Test ¿Es Phishing?', description: 'Detecta estafas' }, { url: '/evaluador-fortaleza-contrasena/', icon: '🔒', name: 'Fortaleza de Contraseñas', description: '¿Es segura tu clave?' }],
  'generador-iconos': imagenesApps.filter(a => a.url !== '/generador-iconos/'),
  'extractor-audio-video': audioApps.filter(a => a.url !== '/extractor-audio-video/'),
  'recortador-audio': audioApps.filter(a => a.url !== '/recortador-audio/'),
  'recortador-video': audioApps.filter(a => a.url !== '/recortador-video/'),
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
  'conversor-braille': [
    { url: '/simulador-baja-vision/', icon: '👁️', name: 'Simulador de Baja Visión', description: 'Entiende cataratas, glaucoma y daltonismo: cuándo el Braille es esencial' },
    { url: '/adaptador-dislexia/', icon: '📖', name: 'Adaptador Dislexia', description: 'Otra forma de hacer accesible el texto: tipografía y espaciado' },
    { url: '/lupa-digital/', icon: '🔍', name: 'Lupa Digital', description: 'Amplía texto y objetos con la cámara hasta 5x' },
    { url: '/lector-texto-voz/', icon: '🔊', name: 'Lector de Texto a Voz', description: 'Alternativa auditiva para baja visión severa' },
  ],

  // CÓDIGOS
  'generador-qr': codigosApps.filter(a => a.url !== '/generador-qr/'),
  'generador-codigos-barras': codigosApps.filter(a => a.url !== '/generador-codigos-barras/'),
  'generador-contrasenas': seguridadDigitalApps.filter(a => a.url !== '/generador-contrasenas/'),
  'generador-gitignore': webDevApps,
  'generador-firma-email': codigosApps.filter(a => a.url !== '/generador-firma-email/'),

  // HOGAR Y COCINA
  'calculadora-cocina': [
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'El peso real de cada taza: harina, azúcar, líquidos…' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta cantidades a cualquier número de raciones' },
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Panadería: % del Panadero', description: 'Fórmulas profesionales para pan y masas fermentadas' },
    { url: '/calculadora-ganache/', icon: '🍫', name: 'Repostería: Ganache', description: 'Proporciones de chocolate y nata según textura' },
  ],
  'lista-compras': cocinaApps.filter(a => a.url !== '/lista-compras/'),
  'guia-productos-limpieza': [
    { url: '/calculadora-pintura/', icon: '🎨', name: 'Calculadora Pintura', description: 'Litros y tipos de pintura por superficie' },
    { url: '/estimador-reformas-hogar/', icon: '🏗️', name: 'Estimador Reformas', description: 'Presupuesto de reformas por tipo y m²' },
    { url: '/selector-seguro-hogar/', icon: '🛡️', name: 'Seguro del Hogar', description: '¿Qué cobertura de hogar necesitas?' },
    { url: '/calculadora-piscinas/', icon: '🏊', name: 'Calculadora Piscinas', description: 'Dosis de cloro, pH y mantenimiento del agua' },
  ],
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
  'simulador-fisica': [{ url: '/calculadora-movimiento/', icon: '🚀', name: 'Calculadora Movimiento', description: 'MRU, MRUA, caída libre' }, { url: '/simulador-circuitos-electricos/', icon: '🔋', name: 'Circuitos Eléctricos', description: 'Serie, paralelo, Ohm, potencia' }, { url: '/calculadora-electricidad/', icon: '⚡', name: 'Electricidad', description: 'Ley de Ohm, potencia' }, { url: '/tabla-periodica/', icon: '⚗️', name: 'Tabla Periódica', description: 'Elementos químicos' }],
  'simulador-circuitos-electricos': [
    { url: '/calculadora-electricidad/', icon: '⚡', name: 'Electricidad', description: 'Ley de Ohm y potencia básica' },
    { url: '/calculadora-resistencias-led/', icon: '🔴', name: 'Resistencias y LED', description: 'Código de colores y circuito LED' },
    { url: '/simulador-campo-electrico/', icon: '🧲', name: 'Campo Eléctrico', description: 'Cargas, líneas y equipotenciales' },
    { url: '/simulador-puertas-logicas/', icon: '🔌', name: 'Puertas Lógicas', description: 'Circuitos digitales y álgebra booleana' },
  ],
  'calculadora-electricidad': [
    { url: '/calculadora-resistencias-led/', icon: '🔴', name: 'Resistencias y LED', description: 'Código de colores y circuitos LED' },
    { url: '/simulador-circuitos-electricos/', icon: '🔋', name: 'Circuitos Eléctricos', description: 'Serie, paralelo, hasta 6 resistencias' },
    { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales' },
    { url: '/calculadora-gasto-energetico/', icon: '⚡', name: 'Gasto Energético', description: 'Consumo eléctrico' },
  ],
  'calculadora-resistencias-led': [
    { url: '/calculadora-electricidad/', icon: '⚡', name: 'Calculadora Electricidad', description: 'Ley de Ohm, potencia y circuitos' },
    { url: '/simulador-circuitos-electricos/', icon: '🔋', name: 'Circuitos Eléctricos', description: 'Serie, paralelo, hasta 6 resistencias' },
    { url: '/calculadora-sistemas-numericos/', icon: '🔢', name: 'Sistemas Numéricos', description: 'Binario, hex, octal y bit a bit' },
  ],
  'tabla-periodica': [
    { url: '/quiz-tabla-periodica/', icon: '🧪', name: 'Quiz Tabla Periódica', description: 'Pon a prueba tus conocimientos de química' },
    { url: '/simulador-estequiometria/', icon: '⚗️', name: 'Estequiometría', description: 'Reacciones, masas molares y reactivo limitante' },
    { url: '/simulador-equilibrio-quimico/', icon: '⚖️', name: 'Equilibrio Químico', description: 'Le Chatelier y constante Kc' },
    { url: '/glosario-fisica-quimica/', icon: '📖', name: 'Glosario Física-Química', description: 'Términos clave de química y física' },
  ],
  'glosario-fisica-quimica': [{ url: '/tabla-periodica/', icon: '⚗️', name: 'Tabla Periódica', description: 'Elementos químicos' }, { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Simulaciones visuales' }, ...matematicasBasicasApps.slice(0, 1)],

  // UTILIDADES EXTRA
  'calculadora-propinas': [
    { url: '/conversor-divisas/', icon: '💱', name: 'Conversor Divisas', description: 'Tipos de cambio BCE' },
    { url: '/presupuesto-viaje/', icon: '🗺️', name: 'Presupuesto Viaje', description: 'Planifica gastos' },
    ...cocinaApps.slice(0, 2),
  ],
  'calculadora-iva': [...fiscalApps.slice(1, 2), ...matematicasBasicasApps.slice(0, 2)],
  'orientador-iva-espana': [
    { url: '/calculadora-iva/', icon: '🧾', name: 'Calculadora IVA', description: 'Añade o quita IVA al 21/10/4 %' },
    { url: '/orientador-tipos-renta-irpf/', icon: '🧭', name: 'Tipos de Renta IRPF', description: 'Cómo tributa cada ingreso' },
    { url: '/generador-facturas/', icon: '🧾', name: 'Generador Facturas', description: 'Facturas con IVA e IRPF' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Cuota Autónomo', description: 'Tu cuota RETA mensual' },
  ],
  'orientador-tipos-renta-irpf': [
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador de IRPF', description: 'Calcula tu cuota de IRPF' },
    { url: '/estimador-plusvalias-irpf/', icon: '💹', name: 'Plusvalías IRPF', description: 'Ganancias por venta de activos' },
    { url: '/orientador-iva-espana/', icon: '🧭', name: 'Orientador del IVA', description: 'Qué IVA aplicar en cada operación' },
    { url: '/orientador-gastos-deducibles/', icon: '🧾', name: 'Gastos Deducibles', description: 'Qué puedes deducir como autónomo' },
  ],
  'orientador-impuesto-patrimonio': [
    { url: '/orientador-limite-conjunto-patrimonio/', icon: '⚖️', name: 'Límite Conjunto IRPF-Patrimonio', description: 'Reducción de la cuota (regla del 60%)' },
    { url: '/estimador-plusvalias-irpf/', icon: '💹', name: 'Plusvalías IRPF', description: 'Ganancias por venta de activos' },
    { url: '/orientador-tipos-renta-irpf/', icon: '🧭', name: 'Tipos de Renta IRPF', description: 'Cómo tributa cada ingreso' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador de IRPF', description: 'Calcula tu cuota de IRPF' },
  ],
  'calculadora-descuentos': [...matematicasBasicasApps.slice(0, 2), { url: '/calculadora-iva/', icon: '🧾', name: 'Calculadora IVA', description: 'Añadir o quitar IVA' }],
  'prueba-camara': [{ url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir luz para fotos' }, { url: '/prueba-microfono/', icon: '🎤', name: 'Prueba Micrófono', description: 'Test de audio' }, { url: '/mi-ip/', icon: '🌐', name: 'Mi IP', description: 'Información de red' }],
  'prueba-microfono': [{ url: '/sonometro/', icon: '🔊', name: 'Sonómetro', description: 'Medir decibelios' }, { url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir luz ambiente' }],
  'sonometro': [{ url: '/generador-tonos/', icon: '🔊', name: 'Generador Tonos', description: 'Frecuencias de audio' }, { url: '/analizador-espectro/', icon: '📊', name: 'Analizador Espectro', description: 'Visualiza frecuencias' }, { url: '/diapason/', icon: '🎼', name: 'Diapasón', description: 'La 440 Hz de referencia' }, { url: '/prueba-microfono/', icon: '🎤', name: 'Prueba Micrófono', description: 'Test de audio' }],
  'luxometro': [{ url: '/golden-hour/', icon: '🌅', name: 'Golden Hour', description: 'Hora dorada y azul' }, { url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/conversor-colores/', icon: '🎨', name: 'Conversor Colores', description: 'HEX, RGB, HSL' }],
  'golden-hour': [{ url: '/visualizador-colores-cielo/', icon: '🌈', name: 'Colores del Cielo', description: 'Paleta HEX y física de cada fase: golden hour, hora azul, amanecer' }, { url: '/simulador-fotografia/', icon: '📷', name: 'Simulador de Fotografía', description: 'Triángulo de exposición: ISO, apertura, velocidad' }, { url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir intensidad de luz' }, { url: '/informacion-tiempo/', icon: '🌤️', name: 'Info Tiempo', description: 'Previsión meteorológica' }],
  'mi-ip': [{ url: '/prueba-camara/', icon: '📷', name: 'Prueba Cámara', description: 'Test de webcam' }, { url: '/prueba-microfono/', icon: '🎤', name: 'Prueba Micrófono', description: 'Test de audio' }],
  'metronomo': [
    { url: '/transpositor-acordes/', icon: '🎵', name: 'Transpositor de Acordes', description: 'Cambia la tonalidad de tu canción' },
    { url: '/afinador-instrumentos/', icon: '🎸', name: 'Afinador', description: 'Afina tu instrumento con el micrófono' },
    { url: '/visualizador-circulo-quintas/', icon: '🎶', name: 'Círculo de Quintas', description: 'Acordes diatónicos y armonía' },
    { url: '/cronometro/', icon: '⏱️', name: 'Cronómetro', description: 'Medir tiempo' },
  ],
  'calculadora-inflacion': finanzasPersonalesApps,
  'analizador-espectro': [{ url: '/generador-tonos/', icon: '🔊', name: 'Generador Tonos', description: 'Frecuencias de audio' }, { url: '/sonometro/', icon: '🔊', name: 'Sonómetro', description: 'Medir decibelios' }, { url: '/prueba-microfono/', icon: '🎤', name: 'Prueba Micrófono', description: 'Test de audio' }, { url: '/metronomo/', icon: '🎵', name: 'Metrónomo', description: 'Tempo musical' }],
  'nivel-burbuja': [{ url: '/conversor-unidades/', icon: '📏', name: 'Conversor Unidades', description: 'Longitud y ángulos' }, { url: '/calculadora-pintura/', icon: '🎨', name: 'Calculadora Pintura', description: 'Litros necesarios' }, { url: '/luxometro/', icon: '💡', name: 'Luxómetro', description: 'Medir intensidad de luz' }],

  // INSTRUMENTOS DIGITALES (sustituyen aparatos físicos)
  'contador-manual': [{ url: '/cronometro/', icon: '⏱️', name: 'Cronómetro', description: 'Medir tiempo' }, { url: '/temporizador-pomodoro/', icon: '🍅', name: 'Pomodoro', description: 'Técnica productividad' }, { url: '/seguimiento-habitos/', icon: '✅', name: 'Seguimiento Hábitos', description: 'Rastrea tus hábitos' }],
  'diapason': [
    { url: '/afinador-instrumentos/', icon: '🎸', name: 'Afinador', description: 'Afina tu instrumento' },
    { url: '/generador-tonos/', icon: '🔊', name: 'Generador Tonos', description: 'Frecuencias de audio' },
    { url: '/sonometro/', icon: '🔊', name: 'Sonómetro', description: 'Medir decibelios' },
    { url: '/metronomo/', icon: '🎵', name: 'Metrónomo', description: 'Tempo musical' },
    { url: '/transpositor-acordes/', icon: '🎵', name: 'Transpositor de Acordes', description: 'Cambia la tonalidad de tu canción' },
  ],
  'generador-tonos': [{ url: '/analizador-espectro/', icon: '📊', name: 'Analizador Espectro', description: 'Visualiza frecuencias' }, { url: '/afinador-instrumentos/', icon: '🎸', name: 'Afinador', description: 'Afina tu instrumento' }, { url: '/diapason/', icon: '🎼', name: 'Diapasón', description: 'La 440Hz' }, { url: '/sonometro/', icon: '🔊', name: 'Sonómetro', description: 'Medir decibelios' }],
  'transpositor-acordes': [
    { url: '/visualizador-escalas-musicales/', icon: '🎼', name: 'Escalas Musicales', description: 'Notas, intervalos y piano interactivo' },
    { url: '/visualizador-circulo-quintas/', icon: '🎶', name: 'Círculo de Quintas', description: 'Acordes diatónicos y tonalidades vecinas' },
    { url: '/afinador-instrumentos/', icon: '🎸', name: 'Afinador', description: 'Afina tu instrumento con el micrófono' },
    { url: '/visualizador-matematicas-musica/', icon: '🎵', name: 'Los Números de la Música', description: 'Frecuencias, armonía y ritmo' },
  ],
  'visualizador-escalas-musicales': [
    { url: '/transpositor-acordes/', icon: '🎵', name: 'Transpositor de Acordes', description: 'Cambia el tono de tu canción al instante' },
    { url: '/visualizador-circulo-quintas/', icon: '🎶', name: 'Círculo de Quintas', description: 'Acordes diatónicos y armonía' },
    { url: '/afinador-instrumentos/', icon: '🎸', name: 'Afinador', description: 'Afina tu instrumento con el micrófono' },
    { url: '/visualizador-matematicas-musica/', icon: '🎵', name: 'Los Números de la Música', description: 'Frecuencias, ratios pitagóricos y armonía' },
  ],
  'visualizador-circulo-quintas': [
    { url: '/transpositor-acordes/', icon: '🎵', name: 'Transpositor de Acordes', description: 'Cambia el tono de tu canción al instante' },
    { url: '/visualizador-escalas-musicales/', icon: '🎼', name: 'Escalas Musicales', description: 'Mayor, menor, pentatónica y modos griegos' },
    { url: '/afinador-instrumentos/', icon: '🎸', name: 'Afinador', description: 'Afina tu instrumento con el micrófono' },
    { url: '/visualizador-matematicas-musica/', icon: '🎵', name: 'Los Números de la Música', description: 'Frecuencias, ratios pitagóricos y armonía' },
  ],
  'afinador-instrumentos': [
    { url: '/transpositor-acordes/', icon: '🎵', name: 'Transpositor de Acordes', description: 'Cambia la tonalidad de tu canción' },
    { url: '/visualizador-escalas-musicales/', icon: '🎼', name: 'Escalas Musicales', description: 'Notas, intervalos y piano' },
    { url: '/diapason/', icon: '🎼', name: 'Diapasón', description: 'La 440Hz de referencia' },
    { url: '/metronomo/', icon: '🎵', name: 'Metrónomo', description: 'Tempo musical' },
  ],
  'lupa-digital': [
    { url: '/simulador-baja-vision/', icon: '👁️', name: 'Simulador de Baja Visión', description: 'Entiende por qué necesitas magnificación: cataratas, glaucoma, miopía severa' },
    { url: '/conversor-braille/', icon: '⠃', name: 'Traductor de Braille', description: 'Alternativa para casos donde la lupa ya no basta' },
    { url: '/adaptador-dislexia/', icon: '📖', name: 'Adaptador Dislexia', description: 'Otro apoyo de lectura: tipografías y espaciado adaptado' },
    { url: '/espejo/', icon: '🪞', name: 'Espejo Digital', description: 'Otra herramienta que aprovecha la cámara del móvil' },
  ],
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
  'quiz-complejidad-algoritmos': informaticaApps.filter(a => a.url !== '/quiz-complejidad-algoritmos/'),
  'visualizador-arquitectura-computador': [
    ...informaticaApps.filter(a => a.url !== '/visualizador-arquitectura-computador/').slice(0, 3),
    { url: '/comparador-velocidad-almacenamiento/', icon: '⚡', name: 'Velocidad de Almacenamiento', description: 'HDD, SSD NVMe, USB y UFS: tiempos reales de transferencia y jerarquía de velocidades' },
  ],
  'visualizador-algoritmos': informaticaApps.filter(a => a.url !== '/visualizador-algoritmos/'),
  'playground-sql': informaticaApps.filter(a => a.url !== '/playground-sql/'),
  'simulador-puertas-logicas': [
    { url: '/calculadora-algebra-booleana/', icon: '🔢', name: 'Álgebra Booleana', description: 'Karnaugh, SOP, POS y simplificación lógica' },
    { url: '/calculadora-sistemas-numericos/', icon: '🔢', name: 'Sistemas Numéricos', description: 'Binario, hexadecimal y octal' },
    { url: '/simulador-circuitos-electricos/', icon: '⚡', name: 'Circuitos Eléctricos', description: 'Serie, paralelo y Ley de Ohm' },
    { url: '/visualizador-estructuras-datos/', icon: '📦', name: 'Estructuras de Datos', description: 'Arrays, pilas, colas y árboles' },
  ],
  'glosario-programacion': informaticaApps.filter(a => a.url !== '/glosario-programacion/'),
  'calculadora-sistemas-numericos': informaticaApps.filter(a => a.url !== '/calculadora-sistemas-numericos/'),
  'calculadora-subredes': informaticaApps.filter(a => a.url !== '/calculadora-subredes/'),
  'simulador-modelo-osi': informaticaApps.filter(a => a.url !== '/simulador-modelo-osi/'),
  'simulador-git-ramas': informaticaApps.filter(a => a.url !== '/simulador-git-ramas/'),
  'visualizador-estructuras-datos': informaticaApps.filter(a => a.url !== '/visualizador-estructuras-datos/'),
  'conversor-ieee754': informaticaApps.filter(a => a.url !== '/conversor-ieee754/'),
  'calculadora-algebra-booleana': [
    { url: '/simulador-puertas-logicas/', icon: '🔌', name: 'Puertas Lógicas', description: 'Circuitos digitales y álgebra booleana' },
    ...informaticaApps.filter(a => a.url !== '/calculadora-algebra-booleana/' && a.url !== '/simulador-puertas-logicas/'),
  ],

  // BIOMEDICINA Y CIENCIAS DE LA SALUD
  'simulador-genetica': [
    { url: '/simulador-deriva-genetica/', icon: '🧬', name: 'Deriva Genética', description: 'Cambios aleatorios en frecuencias alélicas por azar' },
    { url: '/visualizador-seleccion-natural/', icon: '🦎', name: 'Selección Natural', description: 'Evolución y adaptación de poblaciones' },
    { url: '/visualizador-evolucion-molecular/', icon: '🔬', name: 'Evolución Molecular', description: 'Mutaciones y árboles filogenéticos' },
    { url: '/calculadora-probabilidad/', icon: '🎲', name: 'Calculadora de Probabilidad', description: 'Herramienta complementaria para los cruces de Punnett' },
  ],
  'calculadora-estadistica-medica': biomedicinaApps.filter(a => a.url !== '/calculadora-estadistica-medica/'),

  // SIMULADORES BACHILLERATO/UNIVERSIDAD — Tanda 1 (2026-05-07)
  'simulador-proyectiles': [
    { url: '/simulador-pendulo/', icon: '⏳', name: 'Péndulo Simple y MAS', description: 'Oscilaciones, período y energía' },
    { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Más simulaciones de física' },
    { url: '/calculadora-movimiento/', icon: '🚀', name: 'Cinemática', description: 'MRU, MRUA y caída libre' },
    { url: '/calculadora-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Funciones, identidades y ecuaciones' },
  ],
  'simulador-colisiones': [
    { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Caída libre, proyectiles, ondas y MAS' },
    { url: '/visualizador-leyes-newton/', icon: '🍎', name: 'Leyes de Newton', description: 'La 3ª ley explica la fuerza en el choque' },
    { url: '/simulador-pendulo/', icon: '⏳', name: 'Péndulo y MAS', description: 'Energía cinética y potencial en oscilaciones' },
    { url: '/calculadora-movimiento/', icon: '🚀', name: 'Calculadora Movimiento', description: 'MRU, MRUA y cinemática' },
  ],
  'simulador-pendulo': [
    { url: '/simulador-proyectiles/', icon: '🎯', name: 'Proyectiles 2D', description: 'Movimiento parabólico interactivo' },
    { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Más simulaciones de física' },
    { url: '/simulador-circuitos-electricos/', icon: '⚡', name: 'Circuitos Eléctricos', description: 'Serie, paralelo, Ley de Ohm' },
    { url: '/glosario-fisica-quimica/', icon: '📖', name: 'Glosario Física-Química', description: 'Términos clave para estudiar' },
  ],
  'simulador-equilibrio-quimico': [
    { url: '/simulador-titulacion/', icon: '🧪', name: 'Titulación Ácido-Base', description: 'Aplicación práctica del equilibrio: curva de pH y punto de equivalencia' },
    { url: '/visualizador-termodinamica-quimica/', icon: '🌡️', name: 'Termodinámica Química', description: 'ΔG, espontaneidad y la base teórica de Le Chatelier' },
    { url: '/simulador-cinetica-arrhenius/', icon: '⚗️', name: 'Cinética Arrhenius', description: 'La cinética dice a qué velocidad se alcanza el equilibrio' },
    { url: '/simulador-estequiometria/', icon: '🧪', name: 'Estequiometría', description: 'Reactivo limitante y masas molares de las mismas reacciones' },
  ],
  'simulador-lotka-volterra': [
    { url: '/simulador-genetica/', icon: '🧬', name: 'Genética Mendeliana', description: 'Cruces, Punnett y poblaciones' },
    { url: '/visualizador-ecosistema/', icon: '🌳', name: 'Ecosistemas', description: 'Cadenas tróficas y biodiversidad' },
    { url: '/visualizador-seleccion-natural/', icon: '🦎', name: 'Selección Natural', description: 'Evolución y adaptación' },
    { url: '/visualizador-modelos-epidemiologicos/', icon: '🦠', name: 'Modelos Epidemiológicos', description: 'SIR y dinámica de contagios' },
  ],

  // SIMULADORES BACHILLERATO/UNIVERSIDAD — Tanda 2 (2026-05-07)
  'simulador-gas-ideal': [
    { url: '/simulador-equilibrio-quimico/', icon: '⚖️', name: 'Equilibrio Químico', description: 'Le Chatelier y constante Kc' },
    { url: '/visualizador-termodinamica/', icon: '🔥', name: 'Termodinámica Visual', description: 'Energía, calor y entropía' },
    { url: '/visualizador-estados-materia/', icon: '💧', name: 'Estados de la Materia', description: 'Sólido, líquido y gaseoso' },
    { url: '/simulador-pendulo/', icon: '⏳', name: 'Péndulo y MAS', description: 'Oscilaciones y energía mecánica' },
  ],
  'simulador-campo-electrico': [
    { url: '/simulador-circuitos-electricos/', icon: '⚡', name: 'Circuitos Eléctricos', description: 'Serie, paralelo, Ley de Ohm' },
    { url: '/visualizador-electromagnetismo/', icon: '🧲', name: 'Electromagnetismo', description: 'Campos E y B, inducción' },
    { url: '/simulador-ondas-interferencia/', icon: '🌊', name: 'Ondas e Interferencia', description: 'Superposición y estacionarias' },
    { url: '/calculadora-electricidad/', icon: '🔌', name: 'Calculadora Electricidad', description: 'Ohm, potencia y consumo' },
  ],
  'simulador-ondas-interferencia': [
    { url: '/simulador-pendulo/', icon: '⏳', name: 'Péndulo y MAS', description: 'Oscilaciones y resonancia' },
    { url: '/visualizador-sonido-ondas/', icon: '🔊', name: 'Sonido y Ondas', description: 'Acústica y armónicos' },
    { url: '/visualizador-optica-ondulatoria/', icon: '🌈', name: 'Óptica Ondulatoria', description: 'Doble rendija y difracción' },
    { url: '/simulador-campo-electrico/', icon: '⚡', name: 'Campo Eléctrico', description: 'Cargas, líneas y equipotenciales' },
  ],

  // SIMULADORES BACHILLERATO/UNIVERSIDAD — Tanda 3 (2026-05-07)
  'simulador-titulacion': [
    { url: '/simulador-disoluciones/', icon: '🧪', name: 'Disoluciones', description: 'Molaridad, concentración y dilución' },
    { url: '/visualizador-ph-acidos-bases/', icon: '🧫', name: 'pH, Ácidos y Bases', description: 'Escala pH y reacciones' },
    { url: '/simulador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Estequiometría y reactivo limitante' },
    { url: '/tabla-periodica/', icon: '🧪', name: 'Tabla Periódica', description: 'Elementos químicos completos' },
  ],
  'simulador-disoluciones': [
    { url: '/simulador-titulacion/', icon: '🧫', name: 'Titulación ácido-base', description: 'Bureta, curva de pH e indicadores' },
    { url: '/simulador-estequiometria/', icon: '⚗️', name: 'Estequiometría', description: 'Moles, masa y reactivo limitante' },
    { url: '/visualizador-ph-acidos-bases/', icon: '🧪', name: 'pH, Ácidos y Bases', description: 'Escala pH y concentración' },
    { url: '/tabla-periodica/', icon: '🧪', name: 'Tabla Periódica', description: 'Masas molares de los elementos' },
  ],
  'simulador-vsepr': [
    { url: '/simulador-equilibrio-quimico/', icon: '⚖️', name: 'Equilibrio Químico', description: 'Le Chatelier y reacciones reversibles' },
    { url: '/visualizador-enlaces-quimicos/', icon: '🔗', name: 'Enlaces Químicos', description: 'Iónico, covalente y metálico' },
    { url: '/visualizador-quimica-organica/', icon: '🧬', name: 'Química Orgánica', description: 'Funciones y nomenclatura' },
    { url: '/tabla-periodica/', icon: '🧪', name: 'Tabla Periódica', description: 'Configuración electrónica y propiedades' },
  ],
  'simulador-deriva-genetica': [
    { url: '/simulador-genetica/', icon: '🧬', name: 'Genética Mendeliana', description: 'Cruces, Punnett y herencia' },
    { url: '/simulador-lotka-volterra/', icon: '🦊', name: 'Depredador-Presa', description: 'Dinámica de poblaciones' },
    { url: '/visualizador-seleccion-natural/', icon: '🦎', name: 'Selección Natural', description: 'Evolución y adaptación' },
    { url: '/visualizador-evolucion-molecular/', icon: '🧪', name: 'Evolución Molecular', description: 'Mutaciones y árboles filogenéticos' },
  ],

  // SIMULADORES INFORMÁTICA FP/UNIVERSIDAD — Tanda 1 (2026-05-07)
  'simulador-planificador-procesos': [
    { url: '/simulador-concurrencia/', icon: '🔀', name: 'Concurrencia', description: 'Semáforos, carreras y deadlock' },
    { url: '/simulador-reemplazo-paginas/', icon: '🧩', name: 'Reemplazo de Páginas', description: 'FIFO, LRU, Optimal, Clock, LFU' },
    { url: '/visualizador-sistemas-operativos/', icon: '💻', name: 'Sistemas Operativos', description: 'Procesos, hilos, memoria y E/S' },
    { url: '/simulador-ordenacion/', icon: '📊', name: 'Algoritmos Ordenación', description: '7 algoritmos paso a paso' },
  ],
  'simulador-concurrencia': [
    { url: '/simulador-planificador-procesos/', icon: '⏱️', name: 'Planificador de Procesos', description: 'FCFS, SJF, Round Robin, Priority' },
    { url: '/visualizador-sistemas-operativos/', icon: '💻', name: 'Sistemas Operativos', description: 'Procesos, hilos, memoria y E/S' },
    { url: '/simulador-reemplazo-paginas/', icon: '🧩', name: 'Reemplazo de Páginas', description: 'FIFO, LRU, Optimal, Clock, LFU' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: 'Términos clave A-Z' },
  ],
  'simulador-reemplazo-paginas': [
    { url: '/simulador-planificador-procesos/', icon: '⏱️', name: 'Planificador de Procesos', description: 'FCFS, SJF, Round Robin, Priority' },
    { url: '/visualizador-sistemas-operativos/', icon: '💻', name: 'Sistemas Operativos', description: 'Procesos, hilos, memoria y E/S' },
    { url: '/visualizador-estructuras-datos/', icon: '🗂️', name: 'Estructuras de Datos', description: 'Pilas, colas, árboles y hash' },
    { url: '/simulador-ordenacion/', icon: '📊', name: 'Algoritmos Ordenación', description: '7 algoritmos paso a paso' },
  ],
  'simulador-sql-join': [
    { url: '/playground-sql/', icon: '🗄️', name: 'Playground SQL', description: 'Editor SQL interactivo con ejercicios' },
    { url: '/visualizador-base-datos-relacional/', icon: '📚', name: 'Bases de Datos Relacionales', description: 'Modelo E-R, tablas y normalización' },
    { url: '/visualizador-estructuras-datos/', icon: '🗂️', name: 'Estructuras de Datos', description: 'Pilas, colas, árboles y hash' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: 'Términos clave A-Z' },
  ],
  'simulador-ordenacion': [
    { url: '/visualizador-algoritmos-ordenacion/', icon: '📈', name: 'Visualizador Algoritmos', description: 'Algoritmos clásicos animados' },
    { url: '/simulador-grafos/', icon: '🕸️', name: 'Algoritmos de Grafos', description: 'BFS, DFS, Dijkstra, A*' },
    { url: '/simulador-arboles-bst-avl/', icon: '🌳', name: 'Árboles BST y AVL', description: 'Inserción, borrado y rotaciones' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: 'Términos clave A-Z' },
  ],

  // SIMULADORES INFORMÁTICA FP/UNIVERSIDAD — Tanda 2 (2026-05-07)
  'simulador-grafos': [
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'Búsqueda de caminos en videojuegos' },
    { url: '/simulador-arboles-bst-avl/', icon: '🌳', name: 'Árboles BST y AVL', description: 'Inserción, borrado y rotaciones' },
    { url: '/simulador-ordenacion/', icon: '📊', name: 'Algoritmos Ordenación', description: '7 algoritmos paso a paso' },
    { url: '/visualizador-estructuras-datos/', icon: '🗂️', name: 'Estructuras de Datos', description: 'Pilas, colas, árboles y hash' },
  ],
  'simulador-pathfinding': [
    { url: '/simulador-grafos/', icon: '🕸️', name: 'Algoritmos de Grafos', description: 'BFS, DFS, Dijkstra, A* en grafos' },
    { url: '/simulador-boids/', icon: '🐦', name: 'Boids (Bandada)', description: 'IA de movimiento emergente' },
    { url: '/visualizador-ruido-perlin/', icon: '🏔️', name: 'Ruido Perlin', description: 'Generación procedimental' },
    { url: '/visualizador-estructuras-datos/', icon: '🗂️', name: 'Estructuras de Datos', description: 'Pilas, colas, árboles y hash' },
  ],

  // PROGRAMACIÓN DE VIDEOJUEGOS / GRÁFICOS — Tanda Stemum (2026-06-27)
  'visualizador-ruido-perlin': [
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'Búsqueda de caminos en videojuegos' },
    { url: '/simulador-boids/', icon: '🐦', name: 'Boids (Bandada)', description: 'Comportamiento emergente' },
    { url: '/visualizador-geometria-fractales/', icon: '🌀', name: 'Fractales', description: 'Geometría que se repite a escalas' },
    { url: '/visualizador-espacios-color/', icon: '🎨', name: 'Espacios de Color', description: 'RGB, HSV, HSL y HEX' },
  ],
  'visualizador-curvas-bezier': [
    { url: '/visualizador-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Senos, cosenos y ángulos' },
    { url: '/visualizador-geometria-analitica/', icon: '📊', name: 'Geometría Analítica', description: 'Puntos, rectas y curvas' },
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'Trayectorias en videojuegos' },
    { url: '/visualizador-funciones-mundo/', icon: '🌍', name: 'Funciones del Mundo Real', description: 'Curvas que modelan la realidad' },
  ],
  'visualizador-espacios-color': [
    { url: '/visualizador-ruido-perlin/', icon: '🏔️', name: 'Ruido Perlin', description: 'Texturas y terrenos procedurales' },
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'IA de videojuegos' },
    { url: '/visualizador-espectro-electromagnetico/', icon: '🌈', name: 'Espectro Electromagnético', description: 'La luz visible y el color' },
    { url: '/simulador-boids/', icon: '🐦', name: 'Boids (Bandada)', description: 'Sistemas emergentes' },
  ],
  'simulador-boids': [
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'Búsqueda de caminos en videojuegos' },
    { url: '/visualizador-ruido-perlin/', icon: '🏔️', name: 'Ruido Perlin', description: 'Generación procedimental' },
    { url: '/simulador-automatas-celulares/', icon: '🦠', name: 'Autómatas Celulares', description: 'Juego de la Vida y emergencia' },
    { url: '/simulador-lotka-volterra/', icon: '🦊', name: 'Depredador-Presa', description: 'Otra dinámica colectiva' },
  ],

  // PROGRAMACIÓN DE VIDEOJUEGOS / GRÁFICOS — Tanda Stemum 2 (2026-06-27)
  'visualizador-funciones-easing': [
    { url: '/visualizador-curvas-bezier/', icon: '✏️', name: 'Curvas de Bézier', description: 'Las easing se definen con Bézier' },
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'IA de videojuegos' },
    { url: '/visualizador-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Senos y cosenos en la animación' },
    { url: '/visualizador-funciones-mundo/', icon: '🌍', name: 'Funciones del Mundo Real', description: 'Curvas que modelan la realidad' },
  ],
  'simulador-automatas-celulares': [
    { url: '/visualizador-ruido-perlin/', icon: '🏔️', name: 'Ruido Perlin', description: 'Otra vía de generación procedimental' },
    { url: '/simulador-boids/', icon: '🐦', name: 'Boids (Bandada)', description: 'Comportamiento emergente' },
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'IA de videojuegos' },
    { url: '/simulador-grafos/', icon: '🕸️', name: 'Algoritmos de Grafos', description: 'BFS, DFS, Dijkstra, A*' },
  ],
  'visualizador-convolucion-kernels': [
    { url: '/visualizador-espacios-color/', icon: '🎨', name: 'Espacios de Color', description: 'RGB, HSV, HSL y HEX' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🧠', name: 'Redes Neuronales', description: 'La convolución en las CNN' },
    { url: '/visualizador-ruido-perlin/', icon: '🏔️', name: 'Ruido Perlin', description: 'Texturas procedurales' },
    { url: '/visualizador-iluminacion-phong/', icon: '💡', name: 'Iluminación (Phong)', description: 'Gráficos y render' },
  ],
  'visualizador-iluminacion-phong': [
    { url: '/visualizador-espacios-color/', icon: '🎨', name: 'Espacios de Color', description: 'RGB, HSV, HSL y HEX' },
    { url: '/visualizador-convolucion-kernels/', icon: '🖼️', name: 'Convolución y Kernels', description: 'Filtros de imagen' },
    { url: '/visualizador-optica/', icon: '🔬', name: 'Óptica', description: 'Reflexión y refracción de la luz' },
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'IA de videojuegos' },
  ],
  'visualizador-quadtree': [
    { url: '/visualizador-estructuras-datos/', icon: '🗂️', name: 'Estructuras de Datos', description: 'Pilas, colas, árboles y hash' },
    { url: '/simulador-pathfinding/', icon: '🎮', name: 'Pathfinding A*', description: 'Colisiones e IA en videojuegos' },
    { url: '/simulador-boids/', icon: '🐦', name: 'Boids (Bandada)', description: 'Vecindad espacial de agentes' },
    { url: '/simulador-arboles-bst-avl/', icon: '🌳', name: 'Árboles BST y AVL', description: 'Otras estructuras de árbol' },
  ],
  'simulador-arboles-bst-avl': [
    { url: '/simulador-arboles-b/', icon: '🌲', name: 'Árbol B (B-Tree)', description: 'Índices de bases de datos' },
    { url: '/simulador-grafos/', icon: '🕸️', name: 'Algoritmos de Grafos', description: 'BFS, DFS, Dijkstra, A*' },
    { url: '/visualizador-estructuras-datos/', icon: '🗂️', name: 'Estructuras de Datos', description: 'Pilas, colas, árboles y hash' },
    { url: '/simulador-ordenacion/', icon: '📊', name: 'Algoritmos Ordenación', description: '7 algoritmos paso a paso' },
  ],
  'simulador-arboles-b': [
    { url: '/simulador-arboles-bst-avl/', icon: '🌳', name: 'Árboles BST y AVL', description: 'Árboles binarios y rotaciones' },
    { url: '/simulador-sql-join/', icon: '🔗', name: 'JOINs de SQL', description: 'Cómo consultan las bases de datos' },
    { url: '/visualizador-estructuras-datos/', icon: '🗂️', name: 'Estructuras de Datos', description: 'Pilas, colas, árboles y hash' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: 'Términos clave A-Z' },
  ],
  'simulador-recursion': [
    { url: '/simulador-programacion-dinamica/', icon: '📐', name: 'Programación Dinámica', description: 'De la recursión a la tabla DP' },
    { url: '/simulador-arboles-bst-avl/', icon: '🌳', name: 'Árboles BST y AVL', description: 'Estructuras recursivas' },
    { url: '/simulador-grafos/', icon: '🕸️', name: 'Algoritmos de Grafos', description: 'DFS recursivo y otros' },
    { url: '/simulador-ordenacion/', icon: '📊', name: 'Algoritmos Ordenación', description: 'Merge Sort y Quick Sort recursivos' },
  ],
  'simulador-programacion-dinamica': [
    { url: '/simulador-recursion/', icon: '🔁', name: 'Recursión y Pila', description: 'El punto de partida de la DP' },
    { url: '/simulador-backtracking/', icon: '♛', name: 'Backtracking', description: 'La otra cara de la recursión' },
    { url: '/simulador-ordenacion/', icon: '📊', name: 'Algoritmos Ordenación', description: 'Divide y vencerás' },
    { url: '/quiz-complejidad-algoritmos/', icon: '⏱️', name: 'Quiz Complejidad', description: 'Big O y coste temporal' },
  ],
  'simulador-backtracking': [
    { url: '/simulador-recursion/', icon: '🔁', name: 'Recursión y Pila', description: 'La base del backtracking' },
    { url: '/simulador-programacion-dinamica/', icon: '📐', name: 'Programación Dinámica', description: 'Cuando hay subproblemas solapados' },
    { url: '/simulador-grafos/', icon: '🕸️', name: 'Algoritmos de Grafos', description: 'DFS y búsqueda de caminos' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: 'Términos clave A-Z' },
  ],

  // SIMULADORES INFORMÁTICA FP/UNIVERSIDAD — Tanda 3 (2026-05-07)
  'simulador-maquina-turing': [
    { url: '/simulador-automatas-finitos/', icon: '🔄', name: 'Autómatas Finitos DFA/NFA', description: 'Lenguajes regulares y editor visual' },
    { url: '/simulador-puertas-logicas/', icon: '🔌', name: 'Puertas Lógicas', description: 'Circuitos digitales y álgebra booleana' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'Cifrados clásicos y modernos' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: 'Términos clave A-Z' },
  ],
  'simulador-automatas-finitos': [
    { url: '/simulador-maquina-turing/', icon: '📜', name: 'Máquina de Turing', description: 'Modelo computacional universal' },
    { url: '/simulador-grafos/', icon: '🕸️', name: 'Algoritmos de Grafos', description: 'BFS, DFS, Dijkstra, A*' },
    { url: '/calculadora-algebra-booleana/', icon: '⚙️', name: 'Álgebra Booleana', description: 'Karnaugh, SOP/POS, tablas verdad' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: 'Términos clave A-Z' },
  ],
  'simulador-regresion': [
    { url: '/simulador-kmeans/', icon: '🎯', name: 'K-Means Clustering', description: 'Aprendizaje no supervisado' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🧠', name: 'Redes Neuronales', description: 'Perceptrones y aprendizaje' },
    { url: '/calculadora-estadistica/', icon: '📈', name: 'Calculadora Estadística', description: 'Media, mediana, desviación' },
    { url: '/visualizador-estadistica-inferencial/', icon: '📊', name: 'Estadística Inferencial', description: 'Intervalos y contraste hipótesis' },
  ],
  'simulador-kmeans': [
    { url: '/simulador-regresion/', icon: '📉', name: 'Regresión Lineal y Logística', description: 'OLS y descenso de gradiente' },
    { url: '/visualizador-ia-redes-neuronales/', icon: '🧠', name: 'Redes Neuronales', description: 'Perceptrones y aprendizaje' },
    { url: '/calculadora-estadistica/', icon: '📈', name: 'Calculadora Estadística', description: 'Media, mediana, desviación' },
    { url: '/visualizador-llm-funcionamiento/', icon: '🤖', name: 'Cómo funciona un LLM', description: 'Tokens, embeddings, atención' },
  ],

  // SIMULADORES FISCALES-ESPAÑA — Tanda 1 (2026-05-07)
  'simulador-irpf-tramos': [
    { url: '/simulador-mito-tramo-superior/', icon: '🚫', name: 'Mito del Tramo Superior', description: '¿Subir de tramo te quita más?' },
    { url: '/simulador-desglose-nomina/', icon: '💼', name: 'Desglose de Nómina', description: 'Bruto a neto paso a paso' },
    { url: '/estimador-irpf/', icon: '📋', name: 'Estimador IRPF Completo', description: 'Calcula tu cuota con mínimos personales' },
    { url: '/test-obligado-declarar-renta/', icon: '✅', name: 'Test ¿Obligado a Declarar?', description: 'Comprueba si debes hacer la Renta' },
  ],
  'simulador-desglose-nomina': [
    { url: '/simulador-irpf-tramos/', icon: '📊', name: 'Tramos IRPF Visuales', description: 'Cómo funcionan los 6 tramos' },
    { url: '/simulador-mito-tramo-superior/', icon: '🚫', name: 'Mito del Tramo Superior', description: 'Lo que pasa al cruzar de tramo' },
    { url: '/estimador-irpf/', icon: '📋', name: 'Estimador IRPF Completo', description: 'Cuota con situación familiar' },
    { url: '/visualizador-sueldo-neto/', icon: '💰', name: 'Sueldo Neto Visual', description: 'Cómo se reparte tu salario' },
  ],
  'simulador-mito-tramo-superior': [
    { url: '/simulador-irpf-tramos/', icon: '📊', name: 'Tramos IRPF Visuales', description: 'Vista interactiva de los 6 tramos' },
    { url: '/simulador-desglose-nomina/', icon: '💼', name: 'Desglose de Nómina', description: 'Del bruto al neto paso a paso' },
    { url: '/estimador-irpf/', icon: '📋', name: 'Estimador IRPF Completo', description: 'Tu cuota orientativa anual' },
    { url: '/visualizador-anatomia-nomina/', icon: '📄', name: 'Anatomía de la Nómina', description: 'Qué significa cada concepto' },
  ],

  // SIMULADORES FISCALES-ESPAÑA — Tanda 2 (2026-05-07)
  'simulador-modulos-vs-directa': [
    { url: '/comparador-autonomo-vs-sl/', icon: '⚖️', name: 'Autónomo vs SL', description: 'Otra decisión clave del autónomo' },
    { url: '/estimador-cuota-autonomo/', icon: '🧾', name: 'Cuota de Autónomo', description: 'Tu cuota RETA mensual' },
    { url: '/calculadora-iva/', icon: '💶', name: 'Calculadora IVA', description: 'Tipos general, reducido, superreducido' },
    { url: '/simulador-irpf-tramos/', icon: '📊', name: 'Tramos IRPF Visuales', description: 'Cómo se aplica el IRPF' },
  ],
  'simulador-heredar-vivienda': [
    { url: '/estimador-impuesto-sucesiones/', icon: '⚖️', name: 'Impuesto de Sucesiones', description: 'ISD por CCAA en detalle' },
    { url: '/estimador-plusvalia-municipal/', icon: '🏙️', name: 'Plusvalía Municipal', description: 'IIVTNU método objetivo y real' },
    { url: '/estimador-plusvalias-irpf/', icon: '📈', name: 'Plusvalía IRPF', description: 'Ganancia patrimonial al vender' },
    { url: '/orientacion-tramitacion-herencias/', icon: '📋', name: 'Tramitar Herencia', description: 'Checklist y plazos' },
  ],
  'simulador-renta-plan-pensiones': [
    { url: '/selector-plan-pensiones/', icon: '🏦', name: 'Selector Plan Pensiones', description: '¿Te conviene un plan?' },
    { url: '/simulador-irpf-tramos/', icon: '📊', name: 'Tramos IRPF Visuales', description: 'Cómo afecta el marginal' },
    { url: '/simulador-jubilacion-publica/', icon: '👴', name: 'Jubilación Pública', description: 'Tu pensión de la SS' },
    { url: '/estimador-irpf-pensionista/', icon: '📋', name: 'IRPF Pensionista', description: 'IRPF en la jubilación' },
  ],

  // ORIENTADOR PATRIMONIO — Art. 31 Ley 19/1991 (2026-05-08)
  'orientador-limite-conjunto-patrimonio': [
    { url: '/orientador-impuesto-patrimonio/', icon: '🏛️', name: 'Impuesto sobre el Patrimonio', description: 'Valora tus bienes y si declaras' },
    { url: '/estimador-irpf/', icon: '📋', name: 'Estimador IRPF', description: 'Cuota íntegra de tu declaración' },
    { url: '/estimador-plusvalias-irpf/', icon: '💹', name: 'Plusvalías IRPF', description: 'Ganancia patrimonial en venta de activos' },
    { url: '/estimador-impuesto-sucesiones/', icon: '⚖️', name: 'Impuesto de Sucesiones', description: 'ISD por CCAA y parentesco' },
  ],

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
    { url: '/lector-texto-voz/', icon: '🔊', name: 'Lector de Texto', description: 'Alternativa auditiva para la lectura' },
    { url: '/lupa-digital/', icon: '🔍', name: 'Lupa Digital', description: 'Magnificación con cámara para texto pequeño' },
    { url: '/temporizador-visual/', icon: '⏱️', name: 'Temporizador Visual', description: 'Timer con círculo de colores para organización' },
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
  'orientador-ayudas-autonomos-pymes': [
    { url: '/asistente-alta-autonomo/', icon: '📋', name: 'Asistente Alta Autónomo', description: 'Trámites para darte de alta' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Estimador Cuota Autónomo', description: 'Cuánto pagarás con o sin tarifa plana' },
    { url: '/comparador-formas-juridicas/', icon: '⚖️', name: 'Comparador Formas Jurídicas', description: 'Autónomo, SL, cooperativa...' },
    { url: '/orientador-ayudas-personas-familias/', icon: '🧭', name: 'Ayudas para Personas y Familias', description: 'IMV, desempleo, bono social, deducciones familiares' },
  ],
  'orientador-ayudas-personas-familias': [
    { url: '/orientador-tramites-jubilacion/', icon: '🏖️', name: 'Trámites de Jubilación', description: 'Solicitud de pensión, complementos e IRPF pensionista' },
    { url: '/orientador-discapacidad/', icon: '♿', name: 'Grado de Discapacidad', description: '¿Vale la pena solicitarlo?' },
    { url: '/orientador-grado-dependencia/', icon: '📋', name: 'Grado de Dependencia', description: 'Orientación BVD y prestaciones SAAD' },
    { url: '/orientador-becas-ayudas-estudio/', icon: '🎓', name: 'Becas y Ayudas al Estudio', description: 'Beca general MEC, NEAE, comedor, transporte' },
  ],
  'orientador-becas-ayudas-estudio': [
    { url: '/orientador-ayudas-personas-familias/', icon: '🧭', name: 'Ayudas para Personas y Familias', description: 'IMV, desempleo, bono social, deducciones familiares' },
    { url: '/orientador-discapacidad/', icon: '♿', name: 'Grado de Discapacidad', description: '¿Vale la pena solicitarlo?' },
    { url: '/estimador-sueldo-neto/', icon: '💶', name: 'Estimador Sueldo Neto', description: 'Deducciones familiares en tu nómina' },
    { url: '/estimacion-baja-maternal/', icon: '📅', name: 'Baja Maternal y Paternal', description: 'Permiso por nacimiento, semanas y prestación' },
  ],
  'orientador-tramites-jubilacion': [
    { url: '/simulador-jubilacion-publica/', icon: '🏤', name: 'Simulador Jubilación Pública', description: 'Edad, pensión, anticipada y parcial' },
    { url: '/estimador-irpf-pensionista/', icon: '📊', name: 'IRPF Pensionista', description: 'Cuánto pagas de renta al jubilarte' },
    { url: '/estimador-pension-viudedad/', icon: '💍', name: 'Pensión de Viudedad', description: 'Cuantía y requisitos 2026' },
    { url: '/orientador-ayudas-personas-familias/', icon: '🧭', name: 'Ayudas para Personas y Familias', description: 'IMV, desempleo, bono social, deducciones familiares' },
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
  'orientador-ayuda-vivienda-rural': [
    { url: '/simulador-bono-joven-alquiler/', icon: '🏠', name: 'Bono Joven Alquiler 2026-2030', description: 'Si todavía alquilas mientras buscas vivienda para comprar, el Bono Joven de alquiler (hasta 300 €/mes) puede ser compatible con esta ayuda' },
    { url: '/orientador-aval-ico/', icon: '🏦', name: 'Orientador Aval ICO', description: 'El aval del Estado para el 20% de entrada puede complementarse con esta ayuda para zonas rurales' },
    { url: '/estimador-hipoteca/', icon: '📊', name: 'Estimador Hipoteca', description: 'Con la ayuda cubriendo hasta 15.000 €, la hipoteca será menor: calcula la cuota mensual resultante' },
    { url: '/orientador-alquiler-vs-compra/', icon: '🔑', name: 'Alquiler vs Compra', description: 'Analiza si con esta ayuda la compra rural supera financieramente al alquiler en tu caso concreto' },
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
    { url: '/test-competencias-digitales/', icon: '📊', name: 'Test de Competencias Digitales', description: 'Tu nivel personal DigComp y plan de mejora' },
    { url: '/test-burnout-laboral/', icon: '🧘', name: 'Test Burnout Laboral', description: 'Detecta el agotamiento profesional' },
    { url: '/calculadora-costes-teletrabajo/', icon: '🏠', name: 'Costes Teletrabajo', description: 'Cuánto ahorras trabajando en casa' },
    { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Calculadora Tarifa/Hora', description: 'Fija tu precio como freelance' },
  ],
  'estimador-pension-viudedad': [
    ...jubilacionApps.filter(a => a.url !== '/estimador-pension-viudedad/').slice(0, 4),
  ],
  'estimador-complemento-minimos': [
    { url: '/verificador-complemento-brecha-genero/', icon: '⚖️', name: 'Complemento Brecha de Género', description: '36,90 €/mes por hijo en tu pensión' },
    ...jubilacionApps.filter(a => a.url !== '/estimador-complemento-minimos/').slice(0, 3),
    { url: '/estimacion-prestaciones-dependencia/', icon: '💶', name: 'Prestaciones Dependencia', description: 'Cuantías SAAD según grado' },
  ],
  'verificador-complemento-brecha-genero': [
    { url: '/estimador-complemento-minimos/', icon: '🏛️', name: 'Complemento a Mínimos', description: 'Pensión mínima garantizada SS' },
    { url: '/simulador-jubilacion-publica/', icon: '🏤', name: 'Simulador Jubilación Pública', description: 'Edad, pensión, anticipada y parcial' },
    { url: '/estimador-pension-viudedad/', icon: '💍', name: 'Pensión de Viudedad', description: 'Cuantía y requisitos 2026' },
    { url: '/estimador-irpf-pensionista/', icon: '📊', name: 'IRPF Pensionista', description: 'Cuánto pagas de renta al jubilarte' },
    { url: '/planificador-ahorro-jubilacion/', icon: '💹', name: 'Planificador de Ahorro', description: 'Brecha, ahorro y plan de pensiones' },
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
    { url: '/seguimiento-habitos/', icon: '📋', name: 'Planificador de Hábitos', description: 'Crea rutinas de estudio' },
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
  'quiz-conceptos-inversion': [
    { url: '/visualizador-tipos-activos/', icon: '📊', name: 'Clases de Activos', description: 'Renta fija, variable, alternativos y más' },
    { url: '/visualizador-ciclo-economico/', icon: '🔄', name: 'Ciclo Económico', description: 'Cómo afecta el ciclo a cada activo' },
    { url: '/estimador-cartera-inversion/', icon: '💼', name: 'Simulador de Cartera', description: 'Construye y proyecta tu cartera' },
    { url: '/quiz-conceptos-financieros/', icon: '🧠', name: 'Quiz Financiero Básico', description: 'El nivel anterior a este quiz' },
  ],
  'quiz-conceptos-financieros': [
    { url: '/simulador-paga-ahorro/', icon: '🐷', name: 'Simulador de Paga', description: 'Gestiona tu paga y ahorra' },
    { url: '/juego-presupuesto-mensual/', icon: '🎮', name: 'Juego de Presupuesto', description: '¿Llegas a fin de mes?' },
    { url: '/simulador-contabilidad-basica/', icon: '📒', name: 'Contabilidad Básica', description: 'Partida doble y libro mayor' },
    { url: '/quiz-conceptos-inversion/', icon: '📈', name: 'Quiz Inversión Intermedio', description: 'El siguiente nivel — Sharpe, beta, TER' },
  ],
  'simulador-contabilidad-basica': [
    { url: '/analizador-ratios-financieros/', icon: '📊', name: 'Analizador de Ratios', description: 'Analiza el balance con 12 ratios' },
    { url: '/calculadora-valoracion-empresa/', icon: '🏢', name: 'Valoración de Empresa', description: 'Estima cuánto vale tu empresa' },
    { url: '/visualizador-beneficio-liquidez/', icon: '💸', name: 'Beneficio vs Liquidez', description: 'Por qué tener beneficios no es tener caja' },
    { url: '/calculadora-amortizacion-inmovilizado/', icon: '🏭', name: 'Amortización de Inmovilizado', description: 'Lineal, degresivo y suma de dígitos comparados' },
  ],
  'analizador-ratios-financieros': [
    { url: '/calculadora-z-score-altman/', icon: '📉', name: 'Z-Score de Altman', description: 'Riesgo de quiebra a partir del balance' },
    { url: '/visualizador-beneficio-liquidez/', icon: '💸', name: 'Beneficio vs Liquidez', description: 'Por qué tener beneficios no es tener caja' },
    { url: '/calculadora-valoracion-empresa/', icon: '🏢', name: 'Valoración de Empresa', description: 'Estima cuánto vale tu empresa con ratios' },
    { url: '/simulador-ciclo-explotacion/', icon: '🔄', name: 'Ciclo de Explotación', description: 'PME, PMF y fondo de maniobra' },
    { url: '/simulador-financiacion-empresarial/', icon: '⚖️', name: 'Financiación Empresarial', description: 'Préstamo vs leasing vs ampliación de capital' },
  ],
  'visualizador-beneficio-liquidez': [
    { url: '/simulador-ciclo-explotacion/', icon: '🔄', name: 'Ciclo de Explotación', description: 'PME, PMF y fondo de maniobra necesario' },
    { url: '/analizador-ratios-financieros/', icon: '📊', name: 'Analizador de Ratios', description: 'Analiza el balance con 12 ratios' },
    { url: '/calculadora-valoracion-empresa/', icon: '🏢', name: 'Valoración de Empresa', description: 'Estima cuánto vale tu empresa' },
    { url: '/calculadora-z-score-altman/', icon: '📉', name: 'Z-Score de Altman', description: 'Riesgo de insolvencia a partir del balance' },
    { url: '/simulador-financiacion-empresarial/', icon: '⚖️', name: 'Financiación Empresarial', description: 'Préstamo vs leasing vs ampliación de capital' },
  ],
  'calculadora-valoracion-empresa': [
    { url: '/analizador-ratios-financieros/', icon: '📊', name: 'Analizador de Ratios', description: 'Analiza el balance con 12 ratios clave' },
    { url: '/simulador-ciclo-explotacion/', icon: '🔄', name: 'Ciclo de Explotación', description: 'PME, PMF y fondo de maniobra' },
    { url: '/visualizador-beneficio-liquidez/', icon: '💸', name: 'Beneficio vs Liquidez', description: 'Por qué tener beneficios no es tener caja' },
    { url: '/calculadora-z-score-altman/', icon: '📉', name: 'Z-Score de Altman', description: 'Riesgo de quiebra a partir del balance' },
    { url: '/simulador-financiacion-empresarial/', icon: '⚖️', name: 'Financiación Empresarial', description: 'Préstamo vs leasing vs ampliación de capital' },
  ],
  'simulador-ciclo-explotacion': [
    { url: '/analizador-ratios-financieros/', icon: '📊', name: 'Analizador de Ratios', description: 'Ratios PMC y PMP del balance' },
    { url: '/visualizador-beneficio-liquidez/', icon: '💸', name: 'Beneficio vs Liquidez', description: 'Por qué tener beneficios no es tener caja' },
    { url: '/calculadora-valoracion-empresa/', icon: '🏢', name: 'Valoración de Empresa', description: 'Cuánto vale tu empresa' },
    { url: '/simulador-financiacion-empresarial/', icon: '⚖️', name: 'Financiación Empresarial', description: 'Préstamo vs leasing vs ampliación de capital' },
  ],
  'simulador-financiacion-empresarial': [
    { url: '/analizador-ratios-financieros/', icon: '📊', name: 'Analizador de Ratios', description: 'Mide tu endeudamiento antes de pedir deuda' },
    { url: '/calculadora-valoracion-empresa/', icon: '🏢', name: 'Valoración de Empresa', description: 'Cuánto vale tu empresa para una ampliación' },
    { url: '/simulador-ciclo-explotacion/', icon: '🔄', name: 'Ciclo de Explotación', description: 'PME, PMF y fondo de maniobra necesario' },
    { url: '/calculadora-amortizacion-inmovilizado/', icon: '🏭', name: 'Amortización de Inmovilizado', description: 'Amortiza el activo que vas a financiar' },
    { url: '/visualizador-beneficio-liquidez/', icon: '💸', name: 'Beneficio vs Liquidez', description: 'El impacto de la financiación en tu caja' },
  ],
  'calculadora-amortizacion-inmovilizado': [
    { url: '/simulador-contabilidad-basica/', icon: '📒', name: 'Contabilidad Básica', description: 'Partida doble, diario y libro mayor' },
    { url: '/analizador-ratios-financieros/', icon: '📊', name: 'Analizador de Ratios', description: 'Analiza el balance con 12 ratios y DuPont' },
    { url: '/simulador-financiacion-empresarial/', icon: '⚖️', name: 'Financiación Empresarial', description: 'Préstamo vs leasing vs ampliación de capital' },
    { url: '/calculadora-valoracion-empresa/', icon: '🏢', name: 'Valoración de Empresa', description: 'Estima cuánto vale tu empresa' },
  ],
  'calculadora-z-score-altman': [
    { url: '/analizador-ratios-financieros/', icon: '📊', name: 'Analizador de Ratios', description: 'Los 12 ratios que alimentan el Z-Score' },
    { url: '/visualizador-beneficio-liquidez/', icon: '💸', name: 'Beneficio vs Liquidez', description: 'Por qué se quiebra con beneficios pero sin caja' },
    { url: '/calculadora-valoracion-empresa/', icon: '🏢', name: 'Valoración de Empresa', description: 'Cuánto vale tu empresa' },
    { url: '/simulador-ciclo-explotacion/', icon: '🔄', name: 'Ciclo de Explotación', description: 'PME, PMF y fondo de maniobra necesario' },
  ],
  'estimador-costas-judiciales': [
    { url: '/estimador-costes-divorcio/', icon: '📝', name: 'Costes de Divorcio', description: 'Mutuo acuerdo vs contencioso' },
    { url: '/orientador-justicia-gratuita/', icon: '🏛️', name: 'Justicia Gratuita', description: '¿Tienes derecho a abogado gratis?' },
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción y caducidad en España' },
    { url: '/asistente-reclamaciones/', icon: '⚖️', name: 'Reclamaciones', description: 'Guía para reclamar tus derechos' },
  ],
  'estimador-costes-divorcio': [
    { url: '/impuestos-divorcio/', icon: '⚖️', name: 'Impuestos en el Divorcio', description: 'IRPF, vivienda, pensión y custodia' },
    { url: '/estimador-costas-judiciales/', icon: '⚖️', name: 'Costas Judiciales', description: 'Cuánto cuesta un juicio' },
    { url: '/orientador-justicia-gratuita/', icon: '🏛️', name: 'Justicia Gratuita', description: '¿Tienes derecho a abogado gratis?' },
    { url: '/plazos-legales/', icon: '⏱️', name: 'Plazos Legales', description: 'Prescripción y caducidad en España' },
  ],
  'impuestos-divorcio': [
    { url: '/estimador-costes-divorcio/', icon: '📝', name: 'Costes del Divorcio', description: 'Mutuo acuerdo, notarial o contencioso' },
    { url: '/estimador-irpf/', icon: '📊', name: 'Estimador IRPF', description: 'Tu cuota orientativa 2025' },
    { url: '/estimador-plusvalia-municipal/', icon: '🏙️', name: 'Plusvalía Municipal', description: 'Al vender o transmitir un inmueble' },
    { url: '/orientador-justicia-gratuita/', icon: '🏛️', name: 'Justicia Gratuita', description: '¿Tienes derecho a abogado gratis?' },
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
    { url: '/requisitos-nomada-digital/', icon: '💻', name: 'Requisitos Nómada Digital', description: 'Visados y requisitos por país' },
    { url: '/control-gastos/', icon: '💰', name: 'Control Gastos', description: 'Planifica tu presupuesto de viaje' },
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
    { url: '/estimador-reformas-hogar/', icon: '🔨', name: 'Presupuesto de Reforma', description: 'Estima el coste de tu reforma' },
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
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Calculadora Cuota Autónomos', description: 'Calcula tu cuota RETA mensual' },
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
    { url: '/visualizador-estratificacion-social/', icon: '📊', name: 'Estratificación Social', description: 'Los regímenes determinan la movilidad social: democracias nórdicas con alta movilidad vs sistemas con élites cerradas' },
    { url: '/visualizador-desinformacion/', icon: '📰', name: 'Desinformación', description: 'La libertad de prensa y el pluralismo informativo son características estructurales de algunos regímenes' },
  ],

  // EJE A — Matemáticas fundamentos visuales (Roadmap v4, 2026-04-30)
  'visualizador-trigonometria': [
    { url: '/visualizador-calculo-visual/', icon: '∫', name: 'Cálculo Visual', description: 'Las funciones trigonométricas son la base del cálculo: derivadas, integrales de seno y coseno' },
    { url: '/visualizador-series-convergencia/', icon: '♾️', name: 'Series y Convergencia', description: 'Las series de Taylor aproximan seno y coseno con polinomios' },
    { url: '/visualizador-transformada-fourier/', icon: '〰️', name: 'Transformada de Fourier', description: 'La Transformada de Fourier descompone señales en suma de senos y cosenos' },
    { url: '/visualizador-geometria-analitica/', icon: '📉', name: 'Geometría Analítica', description: 'Las cónicas se describen con funciones trigonométricas en coordenadas polares' },
    { url: '/visualizador-volumenes/', icon: '🔷', name: 'Volúmenes 3D', description: 'La trigonometría define las relaciones entre radios, alturas y volúmenes de esfera, cono y cilindro' },
  ],
  'visualizador-geometria-analitica': [
    { url: '/visualizador-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Las coordenadas polares y las cónicas usan seno y coseno como base' },
    { url: '/visualizador-algebra-lineal/', icon: '🔢', name: 'Álgebra Lineal', description: 'Las transformaciones lineales cambian la forma de las cónicas en el plano' },
    { url: '/visualizador-geometria-fractales/', icon: '🌀', name: 'Geometría Fractal', description: 'Las cónicas son formas euclidianas; los fractales exploran geometrías más complejas' },
    { url: '/visualizador-volumenes/', icon: '🔷', name: 'Volúmenes 3D', description: 'Las secciones cónicas (elipse, parábola) generan las figuras de revolución: esfera, cono, cilindro' },
  ],
  'visualizador-volumenes': [
    { url: '/calculadora-geometria/', icon: '📏', name: 'Geometría', description: 'Áreas, perímetros y volúmenes de figuras planas y sólidos' },
    { url: '/visualizador-geometria-analitica/', icon: '📉', name: 'Geometría Analítica', description: 'Las secciones cónicas (elipse, parábola) dan lugar a las figuras de revolución' },
    { url: '/visualizador-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Sin y cos relacionan ángulos con las proporciones de esferas y cilindros' },
    { url: '/visualizador-geometria-fractales/', icon: '🌀', name: 'Geometría Fractal', description: 'Cuando el volumen fractal supera la dimensión euclidiana clásica' },
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

  // EJE B — Física: óptica ondulatoria y electrónica (Roadmap v4, 2026-04-30)
  'visualizador-mecanica-fluidos': [
    { url: '/visualizador-leyes-newton/', icon: '⚙️', name: 'Leyes de Newton', description: 'La mecánica de fluidos es una extensión de la dinámica de Newton a medios continuos' },
    { url: '/visualizador-termodinamica/', icon: '🌡️', name: 'Termodinámica', description: 'La presión, densidad y temperatura de los fluidos se gobiernan por las leyes termodinámicas' },
    { url: '/visualizador-ecuaciones-diferenciales/', icon: '📈', name: 'Ecuaciones Diferenciales', description: 'Las ecuaciones de Navier-Stokes son EDPs (ecuaciones en derivadas parciales) de fluidos' },
    { url: '/visualizador-vuelo-avion/', icon: '✈️', name: 'Vuelo del Avión', description: 'La sustentación del avión combina Bernoulli, circulación y ángulo de ataque' },
  ],
  'visualizador-optica-ondulatoria': [
    { url: '/visualizador-optica/', icon: '🔭', name: 'Óptica Geométrica', description: 'La óptica geométrica (rayos, lentes) es el límite cuando λ ≪ obstáculos — sin difracción' },
    { url: '/visualizador-mecanica-cuantica/', icon: '⚛️', name: 'Mecánica Cuántica', description: 'El experimento de Young con fotones individuales revela la naturaleza cuántica de la luz' },
    { url: '/visualizador-transformada-fourier/', icon: '〰️', name: 'Transformada de Fourier', description: 'El análisis de Fourier describe la descomposición de la luz en frecuencias (colores)' },
    { url: '/visualizador-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Las ondas sinusoidales y la trigonometría son la base del análisis de la interferencia' },
  ],
  'visualizador-circuitos-electronicos': [
    { url: '/visualizador-electricidad-domestica/', icon: '🏠', name: 'Electricidad Doméstica', description: 'Los circuitos domésticos aplican los mismos principios R/L/C a escala de instalación' },
    { url: '/visualizador-ecuaciones-diferenciales/', icon: '📈', name: 'Ecuaciones Diferenciales', description: 'Los circuitos RC/RL se modelan con EDO de primer orden — matemáticamente idénticos a otros sistemas físicos' },
    { url: '/visualizador-logica-proposicional/', icon: '🔣', name: 'Lógica Proposicional', description: 'Las puertas AND/OR/NOT son la implementación física de los conectores lógicos proposicionales' },
    { url: '/visualizador-computacion-cuantica/', icon: '⚛️', name: 'Computación Cuántica', description: 'El qubit cuántico reemplaza el transistor clásico en la computación del futuro' },
  ],
  'visualizador-particulas-subatomicas': [
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Los quarks forman protones y neutrones, que a su vez forman el núcleo atómico' },
    { url: '/visualizador-mecanica-cuantica/', icon: '🌊', name: 'Mecánica Cuántica', description: 'Las partículas subatómicas obedecen la mecánica cuántica: superposición, entrelazamiento, incertidumbre' },
    { url: '/visualizador-energia-nuclear/', icon: '☢️', name: 'Energía Nuclear', description: 'La fisión y fusión nucleares liberan la energía de los quarks (fuerza nuclear fuerte)' },
    { url: '/visualizador-cosmologia/', icon: '🌌', name: 'Cosmología', description: 'En el Big Bang, las condiciones generaron las partículas del Modelo Estándar' },
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
    { url: '/visualizador-polimeros-materiales/', icon: '🧪', name: 'Polímeros y Materiales', description: 'La electroquímica explica la corrosión metálica, clave para entender la durabilidad de los materiales poliméricos' },
  ],

  // EJE C — Química orgánica y nuclear (Roadmap v4, 2026-04-30)
  'visualizador-quimica-organica': [
    { url: '/visualizador-termodinamica-quimica/', icon: '⚗️', name: 'Termodinámica Química', description: 'La esterificación y las reacciones orgánicas en equilibrio se rigen por el mismo ΔG que estudias aquí' },
    { url: '/visualizador-cinetica-quimica/', icon: '⚡', name: 'Cinética Química', description: 'Las reacciones de sustitución nucleófila tienen perfiles de energía de activación explicados por la cinética' },
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'Los orbitales atómicos y la hibridación sp³/sp² del carbono son la base de la geometría orgánica' },
    { url: '/visualizador-polimeros-materiales/', icon: '🧪', name: 'Polímeros y Materiales', description: 'La polimerización por condensación (nylon, PET) aplica directamente las reacciones de esterificación y amidación' },
  ],
  'visualizador-radioactividad': [
    { url: '/visualizador-estructura-atomo/', icon: '⚛️', name: 'Estructura del Átomo', description: 'La radioactividad es una propiedad nuclear — entender el núcleo atómico es el punto de partida' },
    { url: '/visualizador-energia-nuclear/', icon: '⚡', name: 'Energía Nuclear', description: 'La fisión del U-235 en reactores nucleares emite radiación γ y neutrones — la misma física de este visualizador' },
    { url: '/visualizador-mecanica-cuantica/', icon: '🔬', name: 'Mecánica Cuántica', description: 'La desintegración radiactiva es intrínsecamente probabilística — la mecánica cuántica describe por qué' },
    { url: '/visualizador-particulas-subatomicas/', icon: '⚛️', name: 'Partículas Subatómicas', description: 'Los positrones de la desintegración β⁺ son antielectrones — el Modelo Estándar explica su existencia' },
  ],
  'visualizador-polimeros-materiales': [
    { url: '/visualizador-quimica-organica/', icon: '⚗️', name: 'Química Orgánica', description: 'Los monómeros son moléculas orgánicas con grupos funcionales reactivos — primero entiende la química orgánica' },
    { url: '/visualizador-termodinamica-quimica/', icon: '🌡️', name: 'Termodinámica Química', description: 'La Tg y Tm de los polímeros se explican desde la termodinámica de las transiciones de fase' },
    { url: '/visualizador-viaje-basura/', icon: '♻️', name: 'Viaje de la Basura', description: 'El destino final de los plásticos depende de su código de reciclaje — conecta aquí con el ciclo de residuos' },
    { url: '/visualizador-electroquimica/', icon: '🔋', name: 'Electroquímica', description: 'La corrosión metálica y la síntesis electroquímica afectan a los materiales compuestos de polímeros y metales' },
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
    { url: '/visualizador-historia/epidemias/', icon: '🦠', name: 'Historia de las Epidemias', description: 'Los modelos SIR/SEIR explican matemáticamente lo que cada epidemia histórica demostró empíricamente' },
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
    { url: '/visualizador-adn-polimerasa/', icon: '🔬', name: 'ADN y Replicación', description: 'Los virus ADN aprovechan la maquinaria de replicación celular; los ARN llevan su propia polimerasa' },
  ],
  'visualizador-diabetes-mecanismo': [
    { url: '/visualizador-sistema-endocrino/', icon: '⚗️', name: 'Sistema Endocrino', description: 'La insulina y el glucagón son las hormonas pancreáticas dentro del sistema endocrino completo' },
    { url: '/visualizador-higado/', icon: '🫀', name: 'Hígado', description: 'El hígado es el órgano central de la gluconeogénesis y el almacenamiento de glucógeno regulado por insulina' },
    { url: '/visualizador-proteinas-plegamiento/', icon: '🧬', name: 'Plegamiento de Proteínas', description: 'La insulina es una proteína pequeña cuya estructura 3D es esencial para su unión al receptor' },
    { url: '/visualizador-ciclo-viral/', icon: '🦠', name: 'Ciclo Viral', description: 'Algunos virus (Coxsackie B4) se han propuesto como desencadenantes del proceso autoinmune en la diabetes tipo 1' },
  ],
  'visualizador-alzheimer-parkinson': [
    { url: '/visualizador-proteinas-plegamiento/', icon: '🧬', name: 'Plegamiento de Proteínas', description: 'Alzheimer y Parkinson son proteinopatías: enfermedades causadas por proteínas mal plegadas (Aβ, Tau, α-sinucleína)' },
    { url: '/visualizador-sistema-nervioso/', icon: '⚡', name: 'La Neurona', description: 'Cómo funciona una neurona sana: potencial de acción, sinapsis y neurotransmisores que se alteran en estas enfermedades' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'La anatomía del sistema nervioso central donde se desarrollan los procesos neurodegenerativos' },
    { url: '/visualizador-sistema-nervioso/', icon: '💬', name: 'Neurotransmisores', description: 'La dopamina (Parkinson) y la acetilcolina (Alzheimer) son los neurotransmisores más afectados' },
  ],
  'visualizador-cancer': [
    { url: '/visualizador-adn-polimerasa/', icon: '🔬', name: 'ADN y Replicación', description: 'Los errores en la replicación del ADN y los fallos en su reparación son el origen de las mutaciones cancerígenas' },
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
    { url: '/visualizador-tiroides/', icon: '🦋', name: 'Tiroides', description: 'El tiroides regula el metabolismo basal e interactúa con el ciclo menstrual' },
    { url: '/seguimiento-ciclo-menstrual/', icon: '📅', name: 'Seguimiento de Ciclo', description: 'Predice tus próximos ciclos, ventana fértil y ovulación con tu tracker personal' },
  ],
  'visualizador-proteinas-plegamiento': [
    { url: '/visualizador-adn-polimerasa/', icon: '🧬', name: 'ADN y Replicación', description: 'El ADN codifica la secuencia de aminoácidos que determina el plegamiento proteínico' },
    { url: '/visualizador-alzheimer-parkinson/', icon: '🧠', name: 'Alzheimer y Parkinson', description: 'Ambas enfermedades están causadas por proteínas mal plegadas: Aβ/tau y α-sinucleína' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'Los anticuerpos son proteínas con plegamiento preciso que reconoce antígenos específicos' },
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧪', name: 'Enzimas', description: 'Las enzimas son proteínas cuya actividad catalítica depende de su plegamiento 3D exacto' },
  ],

  // EJE E — Física avanzada (2026-04-25)
  'visualizador-relatividad-general': [
    { url: '/visualizador-relatividad-especial/', icon: '⚡', name: 'Relatividad Especial', description: 'La relatividad especial (1905) es el punto de partida: sin gravedad, solo velocidad' },
    { url: '/visualizador-mecanica-cuantica/', icon: '⚛️', name: 'Mecánica Cuántica', description: 'Relatividad general y mecánica cuántica: las dos grandes teorías incompatibles' },
    { url: '/visualizador-caos-mariposa/', icon: '🦋', name: 'Caos y Mariposa', description: 'Los sistemas caóticos también surgen en la dinámica relativista de agujeros negros' },
    { url: '/visualizador-escala-universo/', icon: '🌠', name: 'Astrofísica', description: 'La relatividad general describe la estructura y evolución del universo a gran escala' },
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

  // EJE E — Tecnología y computación (Roadmap v4, 2026-04-30)
  'visualizador-logica-proposicional': [
    { url: '/visualizador-circuitos-electronicos/', icon: '⚡', name: 'Circuitos Electrónicos', description: 'Las puertas AND/OR/NOT físicas son la implementación hardware de los conectores lógicos proposicionales' },
    { url: '/visualizador-falacias-logicas/', icon: '🧠', name: 'Falacias Lógicas', description: 'La lógica formal (tablas de verdad) vs la lógica informal (falacias): dos caras del razonamiento correcto' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'AES, RSA y SHA-256 usan álgebra booleana — la operación XOR es el corazón del cifrado simétrico' },
    { url: '/visualizador-algoritmos-ordenacion/', icon: '⚙️', name: 'Algoritmos de Ordenación', description: 'El problema SAT es NP-completo — el nexo entre lógica proposicional y la teoría de la complejidad computacional' },
  ],
  'visualizador-teoria-informacion': [
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'La entropía de Shannon mide la aleatoriedad: un buen cifrado maximiza la entropía de la salida' },
    { url: '/visualizador-algoritmos-ordenacion/', icon: '⚙️', name: 'Algoritmos de Ordenación', description: 'La complejidad de los algoritmos de compresión (Huffman es O(n log n)) conecta con el análisis Big O' },
    { url: '/visualizador-circuitos-electronicos/', icon: '⚡', name: 'Circuitos Electrónicos', description: 'Las señales digitales son bits — y la capacidad del canal determina cuántos bits por segundo puede transmitir el hardware' },
    { url: '/visualizador-redes-computadoras/', icon: '🌐', name: 'Redes de Computadoras', description: 'Shannon-Hartley calcula el límite teórico de velocidad de cualquier red: WiFi, fibra o 5G' },
  ],
  'visualizador-redes-computadoras': [
    { url: '/visualizador-como-funciona-wifi/', icon: '📶', name: 'Cómo Funciona el WiFi', description: 'WiFi es la capa física e inalámbrica — TCP/IP, DNS y routing son las capas superiores de la red' },
    { url: '/visualizador-internet-60-segundos/', icon: '🌐', name: 'Internet en 60 Segundos', description: 'El viaje de un paquete HTTP desde el navegador hasta el servidor: DNS, TCP, IP y Ethernet en acción' },
    { url: '/visualizador-criptografia/', icon: '🔐', name: 'Criptografía', description: 'TLS 1.3 protege cada conexión TCP: sin la capa de criptografía, las redes serían completamente inseguras' },
    { url: '/visualizador-sistemas-operativos/', icon: '🖥️', name: 'Sistemas Operativos', description: 'El SO gestiona la pila TCP/IP mediante syscalls y sockets — la red es un recurso más que administra el kernel' },
  ],
  'comparador-velocidad-almacenamiento': [
    { url: '/visualizador-arquitectura-computador/', icon: '🖥️', name: 'Arquitectura de Computador', description: 'Von Neumann, CPU, memoria caché y jerarquía de memoria — el contexto hardware del almacenamiento' },
    { url: '/visualizador-sistemas-operativos/', icon: '💻', name: 'Sistemas Operativos', description: 'El SO gestiona el acceso al disco: caché de página, scheduler de I/O y sistema de ficheros' },
    { url: '/visualizador-redes-computadoras/', icon: '🌐', name: 'Redes de Computadoras', description: 'Velocidad de red vs velocidad de disco: Gigabit Ethernet (125 MB/s) vs NVMe Gen 4 (7.000 MB/s)' },
  ],
  'visualizador-sistemas-operativos': [
    { url: '/visualizador-redes-computadoras/', icon: '🌐', name: 'Redes de Computadoras', description: 'El SO implementa la pila TCP/IP: los sockets y syscalls son el puente entre las apps y la red física' },
    { url: '/visualizador-circuitos-electronicos/', icon: '⚡', name: 'Circuitos Electrónicos', description: 'El SO coordina el hardware: desde interrupciones del timer hasta el DMA — todo comienza en los transistores' },
    { url: '/visualizador-estructuras-datos/', icon: '🌳', name: 'Estructuras de Datos', description: 'El scheduler usa colas de prioridad, el sistema de ficheros usa árboles B, el SO usa todas las estructuras de datos' },
    { url: '/visualizador-computacion-cuantica/', icon: '⚛️', name: 'Computación Cuántica', description: 'Los SO cuánticos son el siguiente reto: gestionar qubits, coherencia y corrección de errores a nivel de kernel' },
  ],

  // EJE D — Biología: reino animal, embriogénesis, microbiología, cronobiología, CRISPR, biomas (Roadmap v4, 2026-04-30)
  'visualizador-reino-animal': [
    { url: '/visualizador-seleccion-natural/', icon: '🌱', name: 'Selección Natural', description: 'La diversidad del reino animal es el resultado de millones de años de selección natural y especiación' },
    { url: '/visualizador-ecosistema/', icon: '🌿', name: 'Ecosistema', description: 'Los animales son actores clave en las pirámides tróficas y los ciclos biogeoquímicos del ecosistema' },
    { url: '/visualizador-evolucion-humana/', icon: '🦴', name: 'Evolución Humana', description: 'Los humanos somos mamíferos: el árbol filogenético del reino animal conecta con nuestra propia evolución' },
    { url: '/visualizador-mitosis-meiosis/', icon: '🧬', name: 'Mitosis y Meiosis', description: 'La reproducción sexual (meiosis) es uno de los rasgos que une a casi todos los animales del reino' },
  ],
  'visualizador-embriogenesis': [
    { url: '/visualizador-celula/', icon: '🔬', name: 'La Célula por Dentro', description: 'La embriogénesis comienza en una sola célula: el cigoto que contiene todo el programa de desarrollo' },
    { url: '/visualizador-mitosis-meiosis/', icon: '🧬', name: 'Mitosis y Meiosis', description: 'La segmentación es mitosis acelerada sin crecimiento celular — el mismo proceso a ritmo embrionario' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'Los genes Hox y morfógenos son el código genético que dirige el plan corporal durante la organogénesis' },
    { url: '/visualizador-epigenetica/', icon: '🧬', name: 'Epigenética', description: 'La diferenciación celular es epigenética: todas las células tienen el mismo ADN pero genes distintos activados' },
  ],
  'visualizador-microbiologia': [
    { url: '/visualizador-antibioticos/', icon: '💊', name: 'Antibióticos', description: 'Los mecanismos de acción antibiótica se dirigen a estructuras bacterianas únicas: pared, ribosomas, ADN' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'El sistema inmune distingue entre bacterias patógenas y comensales — clave para entender la microbiota' },
    { url: '/visualizador-microbioma/', icon: '🦠', name: 'Microbioma', description: 'El microbioma intestinal son bacterias conviviendo bajo las mismas reglas de crecimiento que aprendes aquí' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'La conjugación bacteriana y la transferencia horizontal de genes depende del ADN plasmídico' },
  ],
  'visualizador-cronobiologia': [
    { url: '/visualizador-melatonina/', icon: '🌙', name: 'Melatonina', description: 'La melatonina es el principal mediador del ritmo circadiano: su curva de secreción es la salida del reloj biológico' },
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'El núcleo supraquiasmático del hipotálamo es el marcapasos central del ritmo circadiano en mamíferos' },
    { url: '/visualizador-ciclos-sueno/', icon: '😴', name: 'Ciclos del Sueño', description: 'La arquitectura del sueño (NREM/REM) está regulada por el reloj circadiano y la presión homeostática' },
    { url: '/visualizador-seleccion-natural/', icon: '🌱', name: 'Selección Natural', description: 'Los ritmos circadianos están altamente conservados evolutivamente: incluso las cianobacterias tienen reloj' },
  ],
  'visualizador-crispr-cas9': [
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'CRISPR es cirugía molecular en el ADN: sin entender la doble hélice y las bases, no hay edición posible' },
    { url: '/visualizador-epigenetica/', icon: '🧬', name: 'Epigenética', description: 'Los sistemas CRISPR-dCas9 permiten editar el epigenoma (sin cortar el ADN) para activar o silenciar genes' },
    { url: '/visualizador-evolucion-molecular/', icon: '🌿', name: 'Evolución Molecular', description: 'CRISPR-Cas9 es un sistema inmune adaptativo bacteriano — un producto de la evolución molecular acelerada' },
    { url: '/visualizador-cancer/', icon: '🔬', name: 'Cáncer', description: 'La oncología es uno de los campos más activos de CRISPR: editar oncogenes y potenciar células CAR-T' },
  ],
  'visualizador-biomas-terrestres': [
    { url: '/visualizador-ecosistema/', icon: '🌿', name: 'Ecosistema', description: 'Cada bioma es un tipo de ecosistema a escala global: mismas reglas tróficas, distintas condiciones climáticas' },
    { url: '/visualizador-ciclo-carbono-completo/', icon: '♻️', name: 'Ciclo del Carbono', description: 'Los biomas son los grandes reservorios de carbono terrestre — la deforestación altera el ciclo global' },
    { url: '/visualizador-viaje-basura/', icon: '♻️', name: 'Viaje de la Basura', description: 'Los residuos plásticos llegan a todos los biomas: desde la tundra ártica hasta los arrecifes de coral' },
    { url: '/visualizador-ciclo-nitrogeno/', icon: '🔄', name: 'Ciclo del Nitrógeno', description: 'El ciclo del nitrógeno determina la fertilidad del suelo y la productividad primaria de cada bioma' },
  ],

  // EJE F — Sociedad, economía y cultura (Roadmap v4, 2026-04-30)
  'visualizador-estructuras-mercado': [
    { url: '/visualizador-ciclo-economico/', icon: '📈', name: 'Ciclo Económico', description: 'Las estructuras de mercado determinan cómo los shocks cíclicos se transmiten a precios y cantidades' },
    { url: '/visualizador-tipos-interes-bce/', icon: '🏦', name: 'Tipos de Interés BCE', description: 'Los tipos de interés modifican el coste de capital y alteran el equilibrio en mercados imperfectos' },
    { url: '/visualizador-inflacion/', icon: '📉', name: 'Inflación', description: 'El poder de mercado de los monopolios permite trasladar la inflación de costes a precios finales' },
    { url: '/visualizador-estratificacion-social/', icon: '📊', name: 'Estratificación Social', description: 'La concentración del mercado es una de las causas estructurales de la desigualdad económica' },
  ],
  'visualizador-seguros-riesgo': [
    { url: '/visualizador-tipos-interes-bce/', icon: '🏦', name: 'Tipos de Interés BCE', description: 'Los tipos de interés determinan el rendimiento de las reservas técnicas de las aseguradoras' },
    { url: '/visualizador-como-funciona-banco/', icon: '🏦', name: 'Cómo Funciona un Banco', description: 'Los bancos y aseguradoras son los dos grandes intermediarios financieros que gestionan el riesgo' },
    { url: '/visualizador-inflacion/', icon: '📈', name: 'Inflación', description: 'La inflación erosiona el valor real de las indemnizaciones y obliga a actualizar las primas periódicamente' },
    { url: '/visualizador-estructuras-mercado/', icon: '🏪', name: 'Estructuras de Mercado', description: 'El sector asegurador es un oligopolio en la mayoría de países — con regulación específica antiprivatera' },
  ],
  'visualizador-historia-epidemias': [
    { url: '/visualizador-modelos-epidemiologicos/', icon: '🦠', name: 'Modelos Epidemiológicos', description: 'Los modelos SIR/SEIR actuales explican matemáticamente lo que las epidemias históricas mostraron empíricamente' },
    { url: '/visualizador-vacunas/', icon: '💉', name: 'Cómo Funcionan las Vacunas', description: 'La historia de las epidemias es inseparable de la historia de las vacunas que las controlaron' },
    { url: '/visualizador-sistema-inmune/', icon: '🛡️', name: 'Sistema Inmune', description: 'El sistema inmune es el protagonista silencioso de cada epidemia: inmunidad de rebaño y respuesta humoral' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'La Muerte Negra transformó el arte gótico; la gripe española marcó el expresionismo de entreguerras' },
  ],
  'visualizador-urbanismo': [
    { url: '/visualizador-estratificacion-social/', icon: '📊', name: 'Estratificación Social', description: 'La zonificación urbana reproduce y amplifica la estratificación social: barrios por clase económica' },
    { url: '/visualizador-cadenas-suministro/', icon: '🚢', name: 'Cadenas de Suministro', description: 'La logística urbana (last-mile delivery, hubs) es el punto donde las cadenas de suministro llegan al ciudadano' },
    { url: '/visualizador-regimenes-politicos/', icon: '🏛️', name: 'Regímenes Políticos', description: 'El urbanismo refleja el sistema político: ciudades-jardín socialistas, megalópolis neoliberales, ciudades planificadas' },
    { url: '/visualizador-estructuras-mercado/', icon: '🏪', name: 'Estructuras de Mercado', description: 'El mercado inmobiliario urbano es un oligopolio local con altas barreras de entrada y poder de fijación de precios' },
  ],
  'visualizador-estratificacion-social': [
    { url: '/visualizador-ciclo-economico/', icon: '📈', name: 'Ciclo Económico', description: 'Las recesiones golpean más a las clases bajas y ensanchan la brecha entre estratos durante las crisis' },
    { url: '/visualizador-regimenes-politicos/', icon: '🏛️', name: 'Regímenes Políticos', description: 'El sistema político determina la movilidad social: democracias nórdicas vs sistemas con élites cerradas' },
    { url: '/visualizador-estructuras-mercado/', icon: '🏪', name: 'Estructuras de Mercado', description: 'La concentración de mercado y la desigualdad salarial son dos caras del mismo fenómeno estructural' },
    { url: '/visualizador-urbanismo/', icon: '🏙️', name: 'Urbanismo', description: 'La segregación residencial urbana reproduce la estratificación social en el espacio físico de la ciudad' },
  ],
  'visualizador-ciclo-nitrogeno': [
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'La Fotosíntesis', description: 'La fotosíntesis fija el carbono; el ciclo del nitrógeno fija el nitrógeno — los dos grandes ciclos de la vida' },
    { url: '/visualizador-ecosistema/', icon: '🌿', name: 'Ecosistemas', description: 'El ciclo del nitrógeno determina la productividad primaria y la capacidad de carga de cada ecosistema' },
    { url: '/visualizador-transporte-plantas/', icon: '🌱', name: 'Transporte en Plantas', description: 'El nitrato (NO₃⁻) absorbido por las raíces asciende por el xilema hasta los cloroplastos de las hojas' },
    { url: '/visualizador-biomas-terrestres/', icon: '🌍', name: 'Biomas Terrestres', description: 'La disponibilidad de nitrógeno es uno de los factores que limita la productividad de cada bioma' },
  ],
  'visualizador-arte-movimientos': [
    { url: '/visualizador-musica-movimientos/', icon: '🎵', name: 'Movimientos Musicales', description: 'Arte y música comparten períodos: el Barroco de Bach y el de Velázquez son el mismo mundo' },
    { url: '/visualizador-arquitectura-estilos/', icon: '🏛️', name: 'Estilos Arquitectónicos', description: 'Cada estilo artístico tiene su equivalente arquitectónico: Gótico, Barroco, Neoclásico, Bauhaus' },
    { url: '/visualizador-literatura-movimientos/', icon: '📖', name: 'Movimientos Literarios', description: 'Las vanguardias literarias y artísticas nacieron juntas: cubismo, surrealismo, dadaísmo' },
    { url: '/visualizador-historia/epidemias/', icon: '🦠', name: 'Historia de las Epidemias', description: 'La Muerte Negra transformó la iconografía medieval; el COVID aceleró el arte digital y los NFT' },
  ],

  // ─── Cronologías culturales (2026-04-30) ───────────────────────────────────

  'visualizador-musica-movimientos': [
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'Arte y música comparten períodos históricos: el Barroco pictórico y el musical son inseparables' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Romanticismo, Ilustración y Posmodernismo definen tanto la música como el pensamiento de cada época' },
    { url: '/visualizador-literatura-movimientos/', icon: '📖', name: 'Movimientos Literarios', description: 'El Romanticismo de Schubert y el de Byron son el mismo impulso expresado en diferentes medios' },
    { url: '/visualizador-arquitectura-estilos/', icon: '🏛️', name: 'Estilos Arquitectónicos', description: 'La música de Bach y las iglesias barrocas de Bernini comparten el mismo lenguaje ornamental' },
  ],

  'visualizador-filosofia': [
    { url: '/visualizador-musica-movimientos/', icon: '🎵', name: 'Movimientos Musicales', description: 'Nietzsche escribió sobre Wagner; Adorno sobre jazz y Beethoven; filosofía y música son inseparables' },
    { url: '/visualizador-literatura-movimientos/', icon: '📖', name: 'Movimientos Literarios', description: 'El existencialismo de Sartre es también el de Camus y Kafka: filosofía y literatura en diálogo permanente' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'El surrealismo bebió del psicoanálisis de Freud; el Arte Conceptual es filosofía materializada' },
    { url: '/visualizador-historia/epidemias/', icon: '🦠', name: 'Historia de las Epidemias', description: 'La Peste Negra generó el existencialismo medieval; el SIDA redefinió la ética filosófica contemporánea' },
  ],

  'visualizador-literatura-movimientos': [
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Sartre escribía novelas y obras de teatro; Camus recibió el Nobel; filosofía y literatura son una misma pregunta' },
    { url: '/visualizador-musica-movimientos/', icon: '🎵', name: 'Movimientos Musicales', description: 'El Romanticismo literario y el musical son el mismo movimiento: Goethe, Schubert y Byron comparten época' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'Las vanguardias del siglo XX fueron simultáneas: el dadaísmo literario y el pictórico nacieron juntos' },
    { url: '/visualizador-arquitectura-estilos/', icon: '🏛️', name: 'Estilos Arquitectónicos', description: 'Renacimiento, Barroco y Neoclásico son períodos compartidos por literatura y arquitectura' },
  ],

  'visualizador-arquitectura-estilos': [
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'Románico, Gótico, Renacimiento y Barroco son períodos compartidos por arquitectura y artes visuales' },
    { url: '/visualizador-urbanismo/', icon: '🏙️', name: 'Urbanismo', description: 'Los estilos arquitectónicos dan forma a la ciudad: el urbanismo es arquitectura a escala urbana' },
    { url: '/visualizador-musica-movimientos/', icon: '🎵', name: 'Movimientos Musicales', description: 'La Bauhaus diseñó para el mundo moderno; la música de ese período también rompía moldes académicos' },
    { url: '/visualizador-revoluciones-industriales/', icon: '🏭', name: 'Revoluciones Industriales', description: 'El hierro y el acero de la Revolución Industrial permitieron el modernismo y el rascacielos' },
  ],

  // ─── Cronologías culturales Grupo 2 (2026-04-30) ──────────────────────────
  // Nota: las claves antiguas visualizador-historia-{medicina,internet} se eliminaron
  // al migrar al sistema dinámico /visualizador-historia/[slug]/.

  'visualizador-derechos-humanos': [
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'El derecho a la salud es un derecho humano; la bioética nació cuando la medicina superó sus propios límites' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Los derechos digitales y la privacidad online son la nueva frontera de los derechos humanos del siglo XXI' },
    { url: '/visualizador-revoluciones-industriales/', icon: '🏭', name: 'Revoluciones Industriales', description: 'Los derechos laborales y el movimiento obrero nacieron como respuesta a las condiciones de la Revolución Industrial' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Locke, Rousseau y Kant son los padres filosóficos de los derechos humanos modernos' },
  ],

  'visualizador-revoluciones-industriales': [
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'La bacteriología, la farmacología industrial y la radiología nacen en plena Segunda Revolución Industrial' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet es el motor de la Tercera Revolución Industrial; la IA generativa impulsa la Cuarta' },
    { url: '/visualizador-derechos-humanos/', icon: '⚖️', name: 'Derechos Humanos', description: 'Los derechos laborales, la jornada de 8 horas y la abolición del trabajo infantil son conquistas de la era industrial' },
    { url: '/visualizador-arquitectura-estilos/', icon: '🏛️', name: 'Estilos Arquitectónicos', description: 'El hierro, el acero y el hormigón de la Revolución Industrial hicieron posibles el modernismo y el rascacielos' },
  ],

  // Cronologías Ciencia — Grupo 3 (2026-05-01)
  // Nota: clave antigua visualizador-historia-fisica eliminada al migrar a /visualizador-historia/[slug]/.
  'visualizador-historia-quimica': [
    { url: '/visualizador-historia/fisica/', icon: '⚛️', name: 'Historia de la Física', description: 'La mecánica cuántica explica el enlace covalente; termodinámica y electroquímica son física y química a la vez' },
    { url: '/visualizador-historia/matematicas/', icon: '📐', name: 'Historia de las Matemáticas', description: 'La tabla periódica es matemática; la química computacional resuelve ecuaciones cuánticas con álgebra lineal' },
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'Pasteur, la penicilina y el ADN son hitos compartidos por química y medicina' },
    { url: '/visualizador-historia/astronomia/', icon: '🔭', name: 'Historia de la Astronomía', description: 'La espectroscopía nació para estudiar el Sol; reveló de qué están hechas las estrellas' },
  ],
  'visualizador-historia-matematicas': [
    { url: '/visualizador-historia/fisica/', icon: '⚛️', name: 'Historia de la Física', description: 'Newton inventó el cálculo para describir el movimiento; las ecuaciones de Maxwell y la cuántica son matemáticas puras aplicadas' },
    { url: '/visualizador-historia/astronomia/', icon: '🔭', name: 'Historia de la Astronomía', description: 'La geometría esférica, la trigonometría y los sistemas de coordenadas nacieron para navegar el cielo' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Platón consideraba las matemáticas la forma más alta de conocimiento; Gödel sacudió los fundamentos del racionalismo' },
    { url: '/visualizador-historia/quimica/', icon: '🧪', name: 'Historia de la Química', description: 'La química cuántica resuelve ecuaciones diferenciales; la DFT y AlphaFold son matemáticas aplicadas a la materia' },
  ],
  'visualizador-historia-astronomia': [
    { url: '/visualizador-historia/fisica/', icon: '⚛️', name: 'Historia de la Física', description: 'La relatividad general, las ondas gravitacionales y la cosmología cuántica son física del cosmos' },
    { url: '/visualizador-historia/matematicas/', icon: '📐', name: 'Historia de las Matemáticas', description: 'Desde Eratóstenes midiendo la Tierra hasta Hubble aplicando geometría diferencial al universo' },
    { url: '/visualizador-historia/quimica/', icon: '🧪', name: 'Historia de la Química', description: 'La espectroscopía reveló la composición química de las estrellas; el Big Bang produjo los primeros átomos' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'La revolución copernicana cambió nuestra cosmovisión; el Big Bang replantea preguntas sobre origen y fin' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'Historia de la Exploración', description: 'La astronomía guió a navegantes fenicios, vikingos y a los astronautas del Apollo' },
  ],
  // Herramientas de Referencia
  'visualizador-comparador-ia': [
    { url: '/comparador-asistentes-codigo/', icon: '⌨️', name: 'Asistentes de Código IA', description: 'Claude Code, Copilot, Gemini Code Assist y Codex — cuál usar para programar' },
    { url: '/constructor-prompts/', icon: '🧱', name: 'Constructor de Prompts', description: 'Ya elegiste tu IA — ahora crea instrucciones que funcionen de verdad' },
    { url: '/evaluador-prompts/', icon: '💬', name: 'Evaluador de Prompts', description: '¿Tus instrucciones a la IA son específicas o vagas?' },
    { url: '/tokenizador-ia/', icon: '🔤', name: 'Tokenizador Visual', description: 'Cuenta tokens y calcula costes de API en tiempo real' },
  ],
  // Cronologías Sociedad y Cultura — Grupo 6
  'visualizador-historia-economia-espana': [
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'La industrialización española trajo hospitales modernos; la sanidad pública nació con el Estado del Bienestar' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'La economía digital y los fondos Next Generation EU están transformando el modelo económico español' },
    { url: '/visualizador-revoluciones-industriales/', icon: '⚙️', name: 'Revoluciones Industriales', description: 'España siguió con retraso las revoluciones industriales; entender por qué es clave para su historia económica' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'Historia de la Exploración', description: 'El Imperio colonial español fue la base de la economía de metales preciosos que marcó tres siglos de historia' },
  ],
  'visualizador-historia-gastronomia': [
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'Historia de la Exploración', description: 'Los viajes de Colón y Magallanes trajeron el tomate, la patata, el chocolate y el maíz a Europa' },
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'Gastronomía y medicina comparten historia: Hipócrates dijo que la alimentación es la primera medicina' },
    { url: '/visualizador-historia/quimica/', icon: '🧪', name: 'Historia de la Química', description: 'La pasteurización, la fermentación y la cocina molecular son química aplicada a los alimentos' },
    { url: '/visualizador-historia/danza/', icon: '💃', name: 'Historia de la Danza', description: 'Gastronomía y danza son las artes más universales: presentes en todas las culturas como celebración y rito' },
  ],
  'visualizador-historia-deporte': [
    { url: '/visualizador-historia/danza/', icon: '💃', name: 'Historia de la Danza', description: 'Danza y deporte comparten la expresión corporal como lenguaje; el breaking olímpico une ambos mundos' },
    { url: '/visualizador-historia/videojuegos/', icon: '🎮', name: 'Historia de los Videojuegos', description: 'Los eSports son el resultado de videojuegos y deporte convergiendo en un mismo espectáculo de masas' },
    { url: '/visualizador-historia/psicologia/', icon: '🧠', name: 'Historia de la Psicología', description: 'La psicología del deporte es una disciplina clave: rendimiento, motivación, presión y salud mental atlética' },
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'Medicina y deporte han evolucionado juntos: biomecánica, nutrición deportiva, cirugía y antidopaje' },
  ],
  // Cronologías Artes y Mente — Grupo 5
  'visualizador-historia-psicologia': [
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'Psicología y medicina comparten historia: de Hipócrates a la neurociencia, el estudio de la mente y el cuerpo siempre fue inseparable' },
    { url: '/visualizador-historia/filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'La filosofía griega es el origen de la psicología: Platón, Aristóteles y el problema mente-cuerpo siguen en el centro de la neurociencia' },
    { url: '/visualizador-historia/danza/', icon: '💃', name: 'Historia de la Danza', description: 'La psicología del movimiento y la expresión corporal conectan danza y psicología: el cuerpo como lenguaje emocional' },
    { url: '/visualizador-historia/teatro/', icon: '🎭', name: 'Historia del Teatro', description: 'Stanislavski y el método de actuación aplican psicología; Freud usó el drama griego (Edipo) para construir su teoría' },
  ],
  'visualizador-historia-fotografia': [
    { url: '/simulador-fotografia/', icon: '📷', name: 'Simulador de Fotografía', description: 'De la teoría histórica a la práctica: triángulo de exposición ISO/apertura/velocidad con escenas interactivas' },
    { url: '/visualizador-historia/cine/', icon: '🎬', name: 'Historia del Cine', description: 'La cronofotografía de Muybridge y Marey fue el paso previo al cine; ambos medios comparten soportes, técnica y revolución digital' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet transformó la fotografía: JPEG, compartición digital, Instagram y la IA generativa son imposibles sin la red' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'La fotografía inspiró y fue inspirada por el impresionismo, el surrealismo y el pop art; Warhol usó la serigrafía fotográfica' },
  ],
  'visualizador-historia-teatro': [
    { url: '/visualizador-historia/danza/', icon: '💃', name: 'Historia de la Danza', description: 'Teatro y danza han estado unidos desde los coros griegos: el Tanztheater de Pina Bausch y el teatro-danza son inseparables' },
    { url: '/visualizador-historia/cine/', icon: '🎬', name: 'Historia del Cine', description: 'El cine nació del teatro y sigue debiéndole el guión, la dirección de actores y los géneros dramáticos' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Aristóteles teorizó el teatro en la Poética; Brecht aplicó filosofía marxista; Beckett expresó el existencialismo en escena' },
    { url: '/visualizador-literatura-movimientos/', icon: '📖', name: 'Movimientos Literarios', description: 'Teatro y literatura son inseparables: Shakespeare, Ibsen, Chéjov y Beckett son tanto dramaturgos como escritores' },
  ],
  // Nota: clave antigua visualizador-historia-danza eliminada al migrar a /visualizador-historia/[slug]/.
  // Cronologías Cultura Popular — Grupo 4
  'visualizador-historia-cine': [
    { url: '/visualizador-historia/videojuegos/', icon: '🎮', name: 'Historia de los Videojuegos', description: 'Cine y videojuegos comparten efectos especiales, narrativa y revoluciones digitales paralelas' },
    { url: '/visualizador-historia/moda/', icon: '👗', name: 'Historia de la Moda', description: 'El cine ha dictado tendencias de moda desde el Hollywood dorado hasta hoy' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'El streaming cambió el consumo de cine igual que internet transformó la comunicación' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'El expresionismo, surrealismo y pop art influyeron directamente en el lenguaje cinematográfico' },
  ],
  'visualizador-historia-videojuegos': [
    { url: '/visualizador-historia/cine/', icon: '🎬', name: 'Historia del Cine', description: 'Videojuegos y cine comparten motores gráficos, narrativa y distribución digital' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'El juego online y los esports son imposibles sin la evolución de internet' },
    { url: '/visualizador-historia/moda/', icon: '👗', name: 'Historia de la Moda', description: 'Los skins y la moda virtual en videojuegos han creado una industria millonaria' },
    { url: '/visualizador-historia/fisica/', icon: '⚛️', name: 'Historia de la Física', description: 'Los motores gráficos aplican física de colisiones, luz y fluidos en tiempo real' },
  ],
  'visualizador-historia-moda': [
    { url: '/visualizador-historia/cine/', icon: '🎬', name: 'Historia del Cine', description: 'Hollywood y la moda han sido inseparables desde los años 30: los trajes de película definen tendencias' },
    { url: '/visualizador-historia/videojuegos/', icon: '🎮', name: 'Historia de los Videojuegos', description: 'La moda virtual y los skins han creado un mercado de miles de millones en videojuegos' },
    { url: '/visualizador-arquitectura-estilos/', icon: '🏛️', name: 'Estilos Arquitectónicos', description: 'Moda y arquitectura comparten los mismos movimientos estéticos: Art Nouveau, Bauhaus, posmodernismo' },
    { url: '/visualizador-literatura-movimientos/', icon: '📖', name: 'Movimientos Literarios', description: 'Romanticismo, modernismo y posmodernismo se expresan igual en literatura que en moda' },
  ],
  'visualizador-historia-exploracion': [
    { url: '/visualizador-historia/astronomia/', icon: '🔭', name: 'Historia de la Astronomía', description: 'La astronomía fue la guía de exploradores: desde fenicios que navegaban por estrellas hasta el Apollo XI' },
    { url: '/visualizador-historia/fisica/', icon: '⚛️', name: 'Historia de la Física', description: 'Los cohetes de la era espacial aplican la mecánica newtoniana y la termodinámica de propulsión' },
    { url: '/visualizador-historia/matematicas/', icon: '📐', name: 'Historia de las Matemáticas', description: 'La cartografía, la navegación y los cálculos orbitales son matemáticas aplicadas a la exploración' },
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'Las expediciones llevaron enfermedades y también avances médicos: la exploración y la medicina evolucionaron juntas' },
  ],
  // Cronologías Tendencias España — Roadmap v7 EJE A (2026-05-02)
  'visualizador-historia-energia': [
    { url: '/visualizador-revoluciones-industriales/', icon: '🏭', name: 'Revoluciones Industriales', description: 'El carbón y el vapor son el punto de inflexión: la energía fósil creó la primera revolución industrial' },
    { url: '/visualizador-historia/clima/', icon: '🌡️', name: 'Historia del Clima', description: 'Las emisiones energéticas son el motor del cambio climático: energía y clima son inseparables' },
    { url: '/visualizador-geopolitica-energetica/', icon: '🌍', name: 'Geopolítica Energética', description: 'Petróleo, gas y renovables como vectores de poder global: la geopolítica sigue la energía' },
    { url: '/visualizador-historia/quimica/', icon: '🧪', name: 'Historia de la Química', description: 'El proceso Haber-Bosch, los plásticos del petróleo y las celdas solares son química energética' },
  ],
  'visualizador-historia-clima': [
    { url: '/visualizador-historia/energia/', icon: '⚡', name: 'Historia de la Energía', description: 'Las emisiones de combustibles fósiles son la causa del calentamiento global desde la Revolución Industrial' },
    { url: '/visualizador-efecto-invernadero/', icon: '🌍', name: 'Efecto Invernadero', description: 'El mecanismo físico que conecta el CO₂ con el calentamiento: base científica del cambio climático' },
    { url: '/visualizador-historia/epidemias/', icon: '🦠', name: 'Historia de las Epidemias', description: 'El cambio climático amplifica vectores de enfermedades: el clima y la salud global están ligados' },
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'Las pandemias y el clima han moldeado la historia de la humanidad como fuerzas paralelas' },
  ],
  // Nota: claves antiguas visualizador-historia-{aviacion,comics} eliminadas al migrar a /visualizador-historia/[slug]/.

  // Cronologías Tendencias España — Roadmap v8 EJE A (2026-05-02)
  'visualizador-historia-radio': [
    { url: '/visualizador-historia/television/', icon: '📺', name: 'Historia de la Televisión', description: 'Radio y TV nacieron juntas: muchos formatos (soap operas, debates políticos) migraron de un medio a otro' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet transformó la radio: el podcast es la radio del siglo XXI, bajo demanda y global' },
    { url: '/visualizador-historia/musica-movimientos/', icon: '🎵', name: 'Historia de la Música', description: 'La radio fue el gran difusor de la música popular: de la big band al rock, del pop al hip-hop' },
    { url: '/visualizador-historia/publicidad/', icon: '📢', name: 'Historia de la Publicidad', description: 'La radio comercial inventó el modelo publicitario que luego adoptaría la televisión e internet' },
  ],
  'visualizador-historia-television': [
    { url: '/visualizador-historia/radio/', icon: '📻', name: 'Historia de la Radio', description: 'Radio y televisión comparten historia: formatos, modelos de negocio y cultura mediática' },
    { url: '/visualizador-historia/cine/', icon: '🎬', name: 'Historia del Cine', description: 'Cine y TV: competencia, hibridación y convergencia en el streaming del siglo XXI' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'El streaming nació cuando internet alcanzó la velocidad suficiente para sustituir a la TV convencional' },
    { url: '/visualizador-historia/publicidad/', icon: '📢', name: 'Historia de la Publicidad', description: 'La TV definió la publicidad masiva del siglo XX: el spot de 30 segundos fue el formato dominante' },
  ],
  'visualizador-historia-robotica': [
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'La conectividad permitió robots en red, cloud robotics y actualizaciones OTA como Tesla Optimus' },
    { url: '/visualizador-historia/energia/', icon: '⚡', name: 'Historia de la Energía', description: 'Los robots requieren energía: baterías de litio, motores eléctricos eficientes y gestión energética' },
    { url: '/visualizador-historia/videojuegos/', icon: '🎮', name: 'Historia de los Videojuegos', description: 'Los videojuegos entrenan a los robots: simulación, reinforcement learning y motores físicos compartidos' },
    { url: '/visualizador-historia/aviacion/', icon: '✈️', name: 'Historia de la Aviación', description: 'Drones y robótica aérea: de los aviones no tripulados militares a los robots voladores de logística' },
  ],
  'visualizador-historia-publicidad': [
    { url: '/visualizador-historia/television/', icon: '📺', name: 'Historia de la Televisión', description: 'La televisión fue el gran medio publicitario del siglo XX: el spot de 30s definió una era' },
    { url: '/visualizador-historia/radio/', icon: '📻', name: 'Historia de la Radio', description: 'La radio comercial inventó la publicidad de masas: los soap operas financiados por Procter & Gamble' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet transformó la publicidad: del banner (1994) al targeting comportamental y la IA generativa' },
    { url: '/visualizador-historia/cine/', icon: '🎬', name: 'Historia del Cine', description: 'El product placement y la publicidad cinematográfica son tan antiguos como Hollywood' },
  ],
  'visualizador-historia-videojuegos-espanoles': [
    { url: '/visualizador-historia/videojuegos/', icon: '🎮', name: 'Historia Global de los Videojuegos', description: 'El contexto internacional: de Atari y Nintendo a Steam y los esports, en paralelo a la Edad de Oro española' },
    { url: '/visualizador-historia/cine/', icon: '🎬', name: 'Historia del Cine', description: 'Videojuegos y cine comparten narrativa: adaptaciones, transmedia y las series de Hollywood basadas en juegos' },
    { url: '/visualizador-historia/comics/', icon: '💬', name: 'Historia del Cómic', description: 'Batman, Spider-Man y los superhéroes de cómic pueblan los videojuegos españoles: de Amstrad a PS5' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet democratizó la distribución: Steam y itch.io permitieron que el indie español llegara a todo el mundo' },
  ],

  // Cronologías Tendencias España — Roadmap v8 EJE B (2026-05-02)
  'visualizador-historia-ordenadores': [
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet y los ordenadores son inseparables: la WWW nació en un ordenador del CERN y transformó la historia de la informática' },
    { url: '/visualizador-historia/robotica/', icon: '🤖', name: 'Historia de la Robótica', description: 'Los ordenadores son el cerebro de los robots: sin microprocesadores ni IA, la robótica moderna sería imposible' },
    { url: '/visualizador-historia/videojuegos/', icon: '🎮', name: 'Historia de los Videojuegos', description: 'Los videojuegos impulsaron la GPU y la potencia gráfica que hoy entrena los modelos de IA más avanzados' },
    { url: '/visualizador-historia/television/', icon: '📺', name: 'Historia de la Televisión', description: 'La convergencia digital fusionó TV y ordenador: Netflix, streaming y las plataformas nacen de esa unión' },
  ],
  'visualizador-historia-tren': [
    { url: '/visualizador-historia/aviacion/', icon: '✈️', name: 'Historia de la Aviación', description: 'Tren y avión compiten y se complementan: el AVE supera al avión en rutas de menos de 600 km puerta a puerta' },
    { url: '/visualizador-revoluciones-industriales/', icon: '🏭', name: 'Revoluciones Industriales', description: 'El ferrocarril fue el motor de la Primera Revolución Industrial: unió mercados, movió carbón y creó la clase obrera moderna' },
    { url: '/visualizador-historia/energia/', icon: '⚡', name: 'Historia de la Energía', description: 'Del vapor al eléctrico y al hidrógeno: la historia del tren es también la historia de las fuentes de energía' },
    { url: '/visualizador-historia/ordenadores/', icon: '💻', name: 'Historia de los Ordenadores', description: 'La IA gestiona el tráfico ferroviario, el mantenimiento predictivo y la venta de billetes: tecnología e infraestructura convergen' },
  ],
  'visualizador-historia-viajes-espaciales': [
    { url: '/visualizador-historia/aviacion/', icon: '✈️', name: 'Historia de la Aviación', description: 'La aviación precedió al espacio: los pilotos de prueba de los 50 se convirtieron en los primeros astronautas del programa Mercury' },
    { url: '/visualizador-historia/ordenadores/', icon: '💻', name: 'Historia de los Ordenadores', description: 'El Apollo Guidance Computer (4KB RAM) llevó al hombre a la Luna: la informática y el espacio crecieron juntos' },
    { url: '/visualizador-cosmologia/', icon: '🌌', name: 'Cosmología y el Universo', description: 'Los viajes espaciales nos han dado las mejores imágenes del cosmos: Hubble, JWST y las sondas Voyager más allá del sistema solar' },
    { url: '/visualizador-historia/robotica/', icon: '🤖', name: 'Historia de la Robótica', description: 'Robots y espacio van de la mano: Opportunity, Curiosity, Perseverance e Ingenuity son los exploradores robóticos de Marte' },
  ],

  // Cronologías Tecnologías del Cotidiano — Roadmap v9 EJE A (2026-05-03)
  'visualizador-historia-automocion': [
    { url: '/visualizador-historia/tren/', icon: '🚄', name: 'Historia del Tren', description: 'Tren y automóvil compiten y se complementan: la crisis del petróleo (1973) revitalizó el ferrocarril cuando el coche dominaba' },
    { url: '/visualizador-historia/energia/', icon: '⚡', name: 'Historia de la Energía', description: 'Del motor de explosión al eléctrico: la historia del automóvil refleja cada transición energética del último siglo' },
    { url: '/visualizador-revoluciones-industriales/', icon: '🏭', name: 'Revoluciones Industriales', description: 'La cadena de montaje de Ford fue el símbolo de la Segunda Revolución Industrial y cambió para siempre la producción en masa' },
    { url: '/visualizador-historia/robotica/', icon: '🤖', name: 'Historia de la Robótica', description: 'Las fábricas de coches fueron las primeras en adoptar brazos robóticos industriales: el automóvil impulsó la robótica moderna' },
  ],
  'visualizador-historia-telefono': [
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'El smartphone fusionó el teléfono con Internet: la web móvil y las apps han redefinido cómo usamos la red' },
    { url: '/visualizador-historia/radio/', icon: '📻', name: 'Historia de la Radio', description: 'Radio y teléfono comparten raíces en las ondas electromagnéticas: Marconi y Bell son contemporáneos que cambiaron la comunicación' },
    { url: '/visualizador-historia/ordenadores/', icon: '💻', name: 'Historia de los Ordenadores', description: 'El smartphone es el ordenador más usado del mundo: la convergencia entre teléfono y computadora culminó con el iPhone' },
    { url: '/visualizador-historia/television/', icon: '📺', name: 'Historia de la Televisión', description: 'El móvil ha superado a la TV como pantalla principal: streaming y redes sociales consumen hoy más tiempo que la televisión convencional' },
  ],
  'visualizador-historia-prensa': [
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet destruyó el modelo de negocio de la prensa tradicional: la web democratizó la publicación pero también la desinformación' },
    { url: '/visualizador-historia-escritura/', icon: '✍️', name: 'Historia de la Escritura', description: 'La imprenta de Gutenberg presupone la escritura alfabética: 3.000 años de escritura hicieron posible la revolución tipográfica de 1450' },
    { url: '/visualizador-historia/radio/', icon: '📻', name: 'Historia de la Radio', description: 'La radio fue el primer gran competidor de la prensa escrita: las noticias de última hora dejaron de necesitar papel' },
    { url: '/visualizador-desinformacion/', icon: '🔍', name: 'Desinformación y Pensamiento Crítico', description: 'La crisis actual del periodismo y las fake news tienen raíces históricas: el periodismo amarillo del s.XIX anticipó los problemas actuales' },
  ],

  // Cronologías Cultura y Estilo — Roadmap v9 EJE B (2026-05-03)
  'visualizador-historia-arquitectura-espanola': [
    { url: '/visualizador-arquitectura-estilos/', icon: '🏛️', name: 'Estilos Arquitectónicos del Mundo', description: 'La arquitectura española es una síntesis única: el románico lombardo, el gótico francés, el mudéjar islámico y el barroco italiano se fusionan en un estilo propio' },
    { url: '/visualizador-historia/moda-espanola/', icon: '👗', name: 'Historia de la Moda Española', description: 'Arquitectura y moda comparten patrones: las mismas épocas que producen el Barroco churrigueresco producen los trajes de Corte más ornamentados' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'La arquitectura española es inseparable del arte: Gaudí es tanto arquitecto como escultor, y el Escorial define una estética que abarca pintura, tapices y orfebrería' },
    { url: '/visualizador-historia/economia-espana/', icon: '📊', name: 'Historia de la Economía Española', description: 'Las grandes obras arquitectónicas reflejan la economía: las catedrales del s.XIII coinciden con el auge comercial, el Guggenheim con la reindustrialización del País Vasco' },
  ],
  'visualizador-historia-moda-espanola': [
    { url: '/visualizador-historia/arquitectura-espanola/', icon: '🏛️', name: 'Arquitectura Española', description: 'Moda y arquitectura van de la mano: las mismas élites que encargaron el Escorial definieron la moda del negro austero que dominó Europa en el s.XVI' },
    { url: '/visualizador-historia/moda/', icon: '👘', name: 'Historia de la Moda Mundial', description: 'La moda española influyó en Europa (s.XVI), fue superada por Francia (s.XVII) y hoy vuelve al primer plano con Balenciaga, Loewe e Inditex' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'Goya pintó la moda de su época: las majas y majos son tanto un documento histórico de indumentaria como una obra de arte' },
    { url: '/visualizador-historia/economia-espana/', icon: '📊', name: 'Historia de la Economía Española', description: 'Inditex es la empresa española con mayor capitalización bursátil: la moda fast fashion es un fenómeno económico, no solo cultural' },
  ],
  'visualizador-historia-banca': [
    { url: '/visualizador-como-funciona-banco/', icon: '🏦', name: 'Cómo Funciona un Banco', description: 'La historia de la banca es el contexto de cómo funciona un banco hoy: reserva fraccionaria, tipos de interés y regulación tienen raíces históricas' },
    { url: '/visualizador-burbuja-especulativa/', icon: '📈', name: 'Burbujas Especulativas', description: 'Las crisis bancarias producen burbujas: el South Sea Bubble (1720), el Crash del 29 y la crisis de 2008 siguen el mismo patrón histórico' },
    { url: '/visualizador-historia/economia-espana/', icon: '📊', name: 'Historia de la Economía Española', description: 'La banca española —Santander, BBVA, Banco de España— es inseparable de la historia económica del país desde el s.XIX' },
    { url: '/visualizador-blockchain/', icon: '🔗', name: 'Blockchain y Criptografía', description: 'Bitcoin y las criptomonedas son la respuesta tecnológica a la crisis bancaria de 2008: Satoshi Nakamoto publicó el whitepaper el mismo año que cayó Lehman' },
  ],

  // Sistema dinámico de Historias — Ruta /visualizador-historia/[slug]/ (2026-05-03)
  'visualizador-historia-grecia': [
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'Roma conquistó Grecia en el 146 a.C. pero fue conquistada culturalmente por ella: el helenismo impregnó toda la civilización romana' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Sócrates, Platón y Aristóteles son griegos: la filosofía occidental nació en Atenas en el siglo V a.C.' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'El arte clásico griego —Partenón, Discóbolo, cerámica de figuras rojas— es el fundamento del arte occidental' },
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'Hipócrates es el padre de la medicina occidental: el juramento hipocrático nació en la Grecia del siglo V a.C.' },
  ],
  'visualizador-historia-roma': [
    { url: '/visualizador-historia/grecia/', icon: '🏛️', name: 'Historia de la Antigua Grecia', description: 'Grecia fue la madre cultural de Roma: la mitología, la filosofía, el arte y la arquitectura romana son deudoras directas de la civilización griega' },
    { url: '/visualizador-historia/egipto/', icon: '🏺', name: 'Historia del Antiguo Egipto', description: 'Egipto fue la última gran civilización que Roma conquistó: Cleopatra VII y la batalla de Actium pusieron fin a 3.000 años de historia faraónica' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'El estoicismo romano —Marco Aurelio, Séneca, Epicteto— es la filosofía práctica del Imperio: cómo vivir y gobernar con virtud' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'La arquitectura romana —arco, bóveda, cúpula, acueducto— es el origen directo del Renacimiento y el Clasicismo europeo' },
  ],
  'visualizador-historia-egipto': [
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'Roma conquistó Egipto en el 30 a.C. con la derrota de Cleopatra VII en Actium: fin de 3.000 años de civilización faraónica' },
    { url: '/visualizador-historia/mesopotamia/', icon: '🏺', name: 'Historia de Mesopotamia', description: 'Egipto y Mesopotamia son las dos cunas de la civilización: comerciaron, compitieron y se influyeron mutuamente durante milenios' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'El arte egipcio —pirámides, estatuaria, pintura funeraria— influyó en el arte greco-romano y fascina a la humanidad desde el Renacimiento' },
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'El papiro Ebers (1550 a.C.) es el documento médico más antiguo completo: los egipcios tenían medicina organizada 1.500 años antes de Hipócrates' },
  ],
  'visualizador-historia-mesopotamia': [
    { url: '/visualizador-historia/egipto/', icon: '🏺', name: 'Historia del Antiguo Egipto', description: 'Egipto y Mesopotamia son las dos primeras civilizaciones escritas de la humanidad, separadas por el desierto pero conectadas por el comercio milenario' },
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'Mesopotamia fue la cuna de las leyes: el Código de Hammurabi (1754 a.C.) inspira conceptos jurídicos que Roma convirtió en derecho universal' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'La cosmología babilónica y la astronomía mesopotámica precedieron al pensamiento griego: los primeros sistemas de predicción astronómica nacieron en Babilonia' },
    { url: '/visualizador-historia/banca/', icon: '🏦', name: 'Historia de la Banca', description: 'El primer sistema de crédito y los primeros contratos comerciales escritos nacieron en Mesopotamia: el templo-banco sumerio es el origen de la banca moderna' },
  ],
  'visualizador-historia-otomano': [
    { url: '/visualizador-historia/mongol/', icon: '🐴', name: 'Historia del Imperio Mongol', description: 'Tamerlán, heredero del legado mongol, destruyó el ejército otomano en Ankara (1402) y capturó a Beyazid I: el Imperio Mongol marcó el destino otomano' },
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'Los otomanos conquistaron Constantinopla (1453), capital del Imperio Romano de Oriente: Mehmed II se proclamó heredero de los Césares romanos' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'La arquitectura otomana —Mezquita Azul, Topkapi, Sinan— es una de las cumbres del arte islámico y dejó su huella en tres continentes' },
    { url: '/visualizador-historia/banca/', icon: '🏦', name: 'Historia de la Banca', description: 'El control otomano de las rutas comerciales forzó a los europeos a buscar rutas marítimas: el origen indirecto de la globalización bancaria moderna' },
  ],
  'visualizador-historia-mongol': [
    { url: '/visualizador-historia/otomano/', icon: '🌙', name: 'Historia del Imperio Otomano', description: 'Tamerlán, heredero del legado mongol, humilló al Imperio Otomano en Ankara (1402): el mayor choque entre los dos grandes imperios euroasiáticos' },
    { url: '/visualizador-historia/mesopotamia/', icon: '🏺', name: 'Historia de Mesopotamia', description: 'Los mongoles de Hulagu destruyeron Bagdad en 1258, poniendo fin al Califato Abásida y a la Edad de Oro islámica nacida en la cuna mesopotámica' },
    { url: '/visualizador-historia/china-dinastias/', icon: '🐉', name: 'Las Grandes Dinastías Chinas', description: 'Kublai Kan fundó la dinastía Yuan en China (1271): los mongoles gobernaron el país más poblado del mundo durante casi un siglo' },
    { url: '/visualizador-historia/banca/', icon: '🏦', name: 'Historia de la Banca', description: 'La Pax Mongolica reactivó la Ruta de la Seda: el comercio seguro de Asia a Europa en el siglo XIII fue el precursor del sistema financiero europeo moderno' },
  ],
  'visualizador-historia-revolucion-francesa': [
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'La República romana fue el modelo que los revolucionarios franceses quisieron resucitar: "ciudadanos", "repúblicas" y "senados" son conceptos romanos que reaparecen en 1789' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Rousseau, Voltaire y Montesquieu son la base intelectual de la Revolución: la Ilustración francesa es inseparable del estallido de 1789' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'El Neoclasicismo y el Romanticismo son la respuesta artística a la Revolución: David pintó a Napoleón, Delacroix a la Libertad guiando al pueblo' },
    { url: '/visualizador-historia/banca/', icon: '🏦', name: 'Historia de la Banca', description: 'La quiebra financiera del Antiguo Régimen desencadenó la Revolución: la deuda de las guerras americanas y la bancarrota del Estado son la causa económica de 1789' },
  ],
  'visualizador-historia-revolucion-industrial': [
    { url: '/visualizador-historia/tren/', icon: '🚂', name: 'Historia del Ferrocarril', description: 'El ferrocarril fue el hijo directo de la Revolución Industrial: fusionó vapor, hierro y carbón en la máquina que integró los mercados y disparó la demanda de acero' },
    { url: '/visualizador-historia/historia-electricidad/', icon: '⚡', name: 'Historia de la Electricidad', description: 'La electricidad es el corazón de la Segunda Revolución Industrial: la dinamo, la central de Edison y la corriente alterna de Tesla llevaron la energía a cada máquina y hogar' },
    { url: '/visualizador-historia/historia-trabajo/', icon: '🛠️', name: 'Historia del Trabajo', description: 'La fábrica creó al obrero moderno: la cuestión social, el ludismo, los sindicatos y las primeras leyes laborales nacen del choque entre máquina y trabajador' },
    { url: '/visualizador-historia/historia-capitalismo/', icon: '💰', name: 'Historia del Capitalismo', description: 'La industrialización es el motor del capitalismo moderno: la fábrica, la corporación y la producción en masa transformaron el comercio en crecimiento económico sostenido' },
  ],
  'visualizador-historia-revolucion-cientifica': [
    { url: '/visualizador-historia/renacimiento/', icon: '🎨', name: 'El Renacimiento', description: 'El Renacimiento recuperó los textos griegos y el interés por la naturaleza que hicieron posible la ciencia moderna: sin humanismo no hay Revolución Científica' },
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'La Ilustración es la heredera directa: los "Principia" de Newton (1687) inauguran la confianza en la razón que Voltaire y los enciclopedistas convertirán en programa cultural' },
    { url: '/visualizador-historia/astronomia/', icon: '🔭', name: 'Historia de la Astronomía', description: 'De Copérnico a Kepler y Galileo, la astronomía fue el frente donde estalló la revolución: el heliocentrismo derribó el cosmos aristotélico' },
    { url: '/visualizador-historia/fisica/', icon: '⚛️', name: 'Historia de la Física', description: 'La síntesis newtoniana de la gravitación universal fundó la física moderna: leyes matemáticas que gobiernan por igual la caída de una manzana y la órbita de la Luna' },
  ],
  'visualizador-historia-descolonizacion': [
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'Segunda Guerra Mundial', description: 'La Segunda Guerra debilitó a las potencias coloniales europeas y deslegitimó su dominio: la descolonización es una de sus consecuencias directas' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '❄️', name: 'La Guerra Fría', description: 'La descolonización se cruzó con la Guerra Fría: EE.UU. y la URSS compitieron por la lealtad de los nuevos Estados, y el Movimiento de No Alineados buscó una tercera vía' },
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia de África', description: 'El "Año de África" (1960) vio nacer 17 Estados independientes: la descolonización redibujó por completo el mapa del continente' },
    { url: '/visualizador-historia/historia-india/', icon: '🕉️', name: 'Historia de la India', description: 'La independencia de India y Pakistán (1947) fue el gran precedente de toda la descolonización asiática y africana posterior' },
  ],
  'visualizador-historia-revolucion-rusa': [
    { url: '/visualizador-historia/historia-rusia/', icon: '🐻', name: 'Historia de Rusia', description: 'La Revolución de 1917 es el punto de inflexión de toda la historia rusa: puso fin a tres siglos de dinastía Romanov y fundó el primer Estado socialista' },
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '🪖', name: 'Primera Guerra Mundial', description: 'La Gran Guerra fue el detonante: el desgaste militar y el hambre de 1917 hicieron caer al zar y abrieron la puerta a los bolcheviques' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '❄️', name: 'La Guerra Fría', description: 'La URSS nacida de la Revolución sería uno de los dos polos de la Guerra Fría: el enfrentamiento del siglo XX arranca aquí' },
    { url: '/visualizador-historia/historia-capitalismo/', icon: '💰', name: 'Historia del Capitalismo', description: 'La Revolución Rusa fue el primer intento a gran escala de construir una economía alternativa al capitalismo: su sombra marcó todo el siglo XX' },
  ],
  'visualizador-historia-gran-depresion': [
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '🌐', name: 'Historia de la Economía Mundial', description: 'La Gran Depresión es la mayor crisis del capitalismo del siglo XX: reconfiguró el papel del Estado en la economía y sentó las bases del keynesianismo' },
    { url: '/visualizador-historia/banca/', icon: '🏦', name: 'Historia de la Banca', description: 'Las quiebras bancarias en cadena de 1930-1933 fueron el motor de la depresión: de ahí nacieron la regulación financiera moderna y los seguros de depósitos' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'Segunda Guerra Mundial', description: 'La Depresión alimentó el ascenso del nazismo en Alemania y el rearme fue lo que finalmente sacó a las economías de la crisis: el puente entre 1929 y 1939' },
    { url: '/visualizador-historia/historia-capitalismo/', icon: '💰', name: 'Historia del Capitalismo', description: 'El crac de 1929 puso fin al capitalismo del "laissez-faire" puro y abrió la era de la intervención estatal y el Estado del bienestar' },
  ],
  'visualizador-historia-independencias-hispanoamericanas': [
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Las independencias son el acto fundacional de las repúblicas latinoamericanas: aquí nacen las ~18 naciones que después seguirán su propia historia' },
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'Los ideales ilustrados —soberanía popular, derechos, división de poderes— fueron el combustible ideológico de los libertadores criollos' },
    { url: '/visualizador-historia/revolucion-francesa/', icon: '🗽', name: 'La Revolución Francesa', description: 'La Revolución Francesa y la invasión napoleónica de España (1808) desencadenaron la crisis de la monarquía que abrió la puerta a las juntas americanas' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'Tres siglos después de la conquista, las independencias cierran el ciclo colonial: el mismo territorio que España conquistó se emancipa entre 1808 y 1824' },
  ],
  'visualizador-historia-peste-negra': [
    { url: '/visualizador-historia/epidemias/', icon: '🦠', name: 'Historia de las Epidemias', description: 'La Peste Negra es la mayor pandemia de la historia europea: la referencia con la que se han medido todas las epidemias posteriores, hasta la COVID-19' },
    { url: '/visualizador-historia/edad-media-europea/', icon: '🏰', name: 'La Edad Media Europea', description: 'La peste de 1348 partió en dos la Edad Media: la escasez de mano de obra debilitó el feudalismo y transformó la sociedad medieval' },
    { url: '/visualizador-historia/medicina/', icon: '⚕️', name: 'Historia de la Medicina', description: 'La medicina medieval, basada en la teoría miasmática, fue impotente ante la peste: hasta 1894 no se identificaría la bacteria Yersinia pestis' },
    { url: '/visualizador-historia/higiene-salud-publica/', icon: '🧼', name: 'Historia de la Higiene y la Salud Pública', description: 'Las cuarentenas y los cordones sanitarios nacidos frente a la peste son el origen de la salud pública: la primera respuesta organizada de los Estados ante una epidemia' },
  ],
  'visualizador-historia-caida-imperio-romano': [
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'Para el arco completo de Roma —de Rómulo (753 a.C.) a 476 d.C.—; esta cronología se centra en cambio solo en el "cómo y por qué" del declive final' },
    { url: '/visualizador-historia/historia-bizancio/', icon: '⛪', name: 'Historia de Bizancio', description: 'Cuando Occidente cayó (476), el Imperio de Oriente sobrevivió casi mil años más: Bizancio es la continuación directa del Imperio Romano' },
    { url: '/visualizador-historia/edad-media-europea/', icon: '🏰', name: 'La Edad Media Europea', description: 'La caída de Roma abre la Edad Media: los reinos germánicos que sustituyeron al Imperio son el punto de partida de la Europa medieval' },
    { url: '/visualizador-historia/historia-islam-clasico/', icon: '🕌', name: 'El Islam Clásico', description: 'El vacío de poder tras Roma y el debilitamiento de Bizancio y Persia facilitaron la fulgurante expansión del islam en el siglo VII' },
  ],
  'visualizador-historia-caida-constantinopla': [
    { url: '/visualizador-historia/historia-bizancio/', icon: '⛪', name: 'Historia de Bizancio', description: '1453 es el final de Bizancio: la caída de Constantinopla cierra los más de mil años del Imperio Romano de Oriente' },
    { url: '/visualizador-historia/otomano/', icon: '🌙', name: 'Historia del Imperio Otomano', description: 'La conquista de Constantinopla por Mehmed II convirtió a los otomanos en la gran potencia euroasiática: la ciudad sería su capital durante casi cinco siglos' },
    { url: '/visualizador-historia/renacimiento/', icon: '🎨', name: 'El Renacimiento', description: 'La huida de eruditos griegos con manuscritos clásicos tras 1453 dio un impulso decisivo al Renacimiento italiano' },
    { url: '/visualizador-historia/las-cruzadas/', icon: '✝️', name: 'Las Cruzadas', description: 'La Cuarta Cruzada saqueó Constantinopla en 1204 y la debilitó de forma irreversible: el declive que culminaría en 1453 empezó con las propias cruzadas' },
  ],
  'visualizador-historia-revoluciones-1848': [
    { url: '/visualizador-historia/revolucion-francesa/', icon: '🗽', name: 'La Revolución Francesa', description: '1848 es heredera de 1789: los ideales de libertad, igualdad y soberanía nacional que estallaron en la Revolución Francesa resurgen en toda Europa' },
    { url: '/visualizador-historia/historia-alemania/', icon: '🦅', name: 'Historia de Alemania', description: 'El Parlamento de Frankfurt de 1848 fue el primer intento de unificar Alemania por vía liberal: fracasó, pero anticipó la unificación de 1871' },
    { url: '/visualizador-historia/historia-italia/', icon: '🍝', name: 'Historia de Italia', description: 'Las Cinco Jornadas de Milán y la República Romana de 1848-1849 son un episodio clave del Risorgimento: la semilla de la unificación italiana' },
    { url: '/visualizador-historia/historia-austria-hungria/', icon: '👑', name: 'Historia de Austria-Hungría', description: 'La caída de Metternich y la revolución húngara de Kossuth (1848) sacudieron el Imperio austríaco hasta sus cimientos y anticiparon el compromiso de 1867' },
  ],
  'visualizador-historia-independencia-eeuu': [
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'La Declaración de Independencia y la Constitución beben de la Ilustración: la soberanía popular de Locke, la división de poderes de Montesquieu y el contrato social se convierten aquí en un Estado' },
    { url: '/visualizador-historia/revolucion-francesa/', icon: '🗽', name: 'La Revolución Francesa', description: 'La Revolución Americana (1776) precedió e influyó en la Francesa (1789): oficiales franceses como Lafayette llevaron a Francia la experiencia y las ideas del proceso americano' },
    { url: '/visualizador-historia/independencias-hispanoamericanas/', icon: '✊', name: 'Las Independencias Hispanoamericanas', description: 'El precedente de 1776 inspiró a los libertadores hispanoamericanos: la idea de que unas colonias podían emanciparse de su metrópoli europea recorrió todo el continente' },
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de Estados Unidos', description: 'Para el arco completo del país tras su fundación: esta cronología se centra solo en el proceso de independencia (1763-1789), su punto de partida' },
  ],
  'visualizador-historia-guerra-civil-espanola': [
    { url: '/visualizador-historia/espana-contemporanea/', icon: '📜', name: 'La España Contemporánea', description: 'La guerra se enmarca en el convulso siglo XX español: aquí está el arco largo que va de la Restauración a la democracia, con la República y el franquismo en su contexto' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'Segunda Guerra Mundial', description: 'Muchos historiadores ven la guerra española como un "ensayo general" de la Segunda Guerra Mundial: Alemania e Italia probaron en ella aviación y tácticas que emplearían después' },
    { url: '/visualizador-historia/revolucion-rusa/', icon: '🚩', name: 'La Revolución Rusa', description: 'La URSS surgida de 1917 fue el principal apoyo exterior de la República; el peso del comunismo en el bando republicano solo se entiende a la luz de la Revolución Rusa' },
    { url: '/visualizador-historia/historia-italia/', icon: '🍝', name: 'Historia de Italia', description: 'La Italia fascista de Mussolini envió tropas y aviación al bando sublevado; su derrota en Guadalajara (1937) fue uno de los reveses italianos de la guerra' },
  ],
  'visualizador-historia-guerra-treinta-anios': [
    { url: '/visualizador-historia/la-reforma/', icon: '📜', name: 'La Reforma Protestante', description: 'La fractura religiosa abierta por la Reforma (1517) es el trasfondo del conflicto: la Paz de Augsburgo de 1555 no resolvió la convivencia entre católicos y protestantes en el Imperio' },
    { url: '/visualizador-historia/espana-austrias/', icon: '🏰', name: 'La España de los Austrias', description: 'Los Tercios españoles combatieron del lado de los Habsburgo; la derrota de Rocroi (1643) se ha visto tradicionalmente como símbolo del declive militar de la Monarquía Hispánica' },
    { url: '/visualizador-historia/historia-alemania/', icon: '🦅', name: 'Historia de Alemania', description: 'La guerra se libró sobre todo en el Sacro Imperio y causó una enorme mortandad en las tierras alemanas: su recuerdo marcó durante siglos la historia de Alemania' },
    { url: '/visualizador-historia/renacimiento/', icon: '🎨', name: 'El Renacimiento', description: 'El conflicto cierra la larga crisis religiosa y política que siguió al Renacimiento y la Reforma, y abre la Europa moderna de los Estados soberanos' },
  ],
  'visualizador-historia-guerra-secesion-eeuu': [
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de Estados Unidos', description: 'La Guerra de Secesión es el punto de inflexión de la historia estadounidense: definió si el país seguiría siendo esclavista y si la Unión era indisoluble' },
    { url: '/visualizador-historia/independencia-eeuu/', icon: '🎆', name: 'La Independencia de Estados Unidos', description: 'La contradicción entre la Declaración de 1776 ("todos los hombres son creados iguales") y la esclavitud quedó sin resolver en la fundación; la Guerra de Secesión fue su ajuste de cuentas' },
    { url: '/visualizador-historia/historia-derechos-humanos/', icon: '⚖️', name: 'Historia de los Derechos Humanos', description: 'La abolición de la esclavitud (Enmienda XIII) y las Enmiendas XIV y XV son un hito en la historia de los derechos, aunque la segregación posterior mostró sus límites' },
    { url: '/visualizador-historia/revolucion-industrial/', icon: '⚙️', name: 'La Revolución Industrial', description: 'El choque entre un Norte industrial y un Sur agrario y esclavista está en la raíz del conflicto: dos modelos económicos incompatibles dentro de un mismo país' },
  ],
  'visualizador-historia-revolucion-mexicana': [
    { url: '/visualizador-historia/mexico-moderno/', icon: '🇲🇽', name: 'Historia de México', description: 'Para el arco completo de la historia mexicana; esta cronología se centra en la década revolucionaria (1910-1920), uno de sus periodos fundacionales' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'La Revolución Mexicana fue la primera gran revolución social del siglo XX en América Latina e influyó en los movimientos agrarios y sociales de todo el continente' },
    { url: '/visualizador-historia/independencias-hispanoamericanas/', icon: '✊', name: 'Las Independencias Hispanoamericanas', description: 'Un siglo después de la independencia, la Revolución replanteó qué tipo de país debía ser México: la cuestión de la tierra y la justicia social que la emancipación dejó pendiente' },
    { url: '/visualizador-historia/revolucion-rusa/', icon: '🚩', name: 'La Revolución Rusa', description: 'Casi simultánea a la mexicana, la Revolución Rusa (1917) es la otra gran revolución social de la década: comparar ambas ayuda a entender el convulso comienzo del siglo XX' },
  ],
  'visualizador-historia-guerra-sucesion-espanola': [
    { url: '/visualizador-historia/espana-borbones/', icon: '⚜️', name: 'La España de los Borbones', description: 'La guerra instaura la dinastía borbónica en España: Felipe V es el primer Borbón, y los Decretos de Nueva Planta inauguran el modelo de Estado centralizado del siglo XVIII' },
    { url: '/visualizador-historia/espana-austrias/', icon: '🏰', name: 'La España de los Austrias', description: 'La muerte sin descendencia de Carlos II, último Austria español, es el detonante del conflicto: el fin de una dinastía de dos siglos abre la disputa por el trono' },
    { url: '/visualizador-historia/historia-constituciones/', icon: '📜', name: 'Historia de las Constituciones', description: 'Los Decretos de Nueva Planta reorganizaron el Estado aboliendo los fueros de la Corona de Aragón: un precedente clave en la larga historia de la organización territorial de España' },
    { url: '/visualizador-historia/guerras-napoleonicas/', icon: '⚔️', name: 'Guerras Napoleónicas', description: 'Un siglo después, otra crisis dinástica —la invasión napoleónica de 1808— volvería a partir España en dos: los conflictos por el trono jalonan el siglo XVIII y XIX españoles' },
  ],
  'visualizador-historia-disolucion-yugoslavia': [
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '❄️', name: 'La Guerra Fría', description: 'El fin de la Guerra Fría y el hundimiento del comunismo en Europa del Este quitaron a Yugoslavia el marco que la mantenía unida: su disolución es una de las consecuencias de 1989' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'Segunda Guerra Mundial', description: 'Las guerras yugoslavas fueron el conflicto más sangriento en Europa desde 1945 y trajeron de vuelta términos como "limpieza étnica" y "genocidio" al continente' },
    { url: '/visualizador-historia/historia-derechos-humanos/', icon: '⚖️', name: 'Historia de los Derechos Humanos', description: 'El conflicto dio lugar al primer gran tribunal penal internacional desde Núremberg (el TPIY) y a jurisprudencia decisiva sobre genocidio y crímenes de lesa humanidad' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'Historia de la Unión Europea', description: 'La incapacidad de Europa para frenar la guerra en su propio continente marcó a la UE e impulsó el desarrollo posterior de su política exterior y de defensa común' },
  ],
  'visualizador-historia-imperio-persa': [
    { url: '/visualizador-historia/grecia/', icon: '🏛️', name: 'Historia de la Antigua Grecia', description: 'Las Guerras Médicas —Maratón, Termópilas, Salamina— son el eje del conflicto entre Persia y Grecia: sin Persia, no hay narrativa griega del siglo V a.C.' },
    { url: '/visualizador-historia/mesopotamia/', icon: '🏺', name: 'Historia de Mesopotamia', description: 'Ciro el Grande conquistó Babilonia sin batalla (539 a.C.) y liberó a los judíos: Persia heredó el legado mesopotámico y lo administró durante dos siglos' },
    { url: '/visualizador-historia/egipto/', icon: '🏺', name: 'Historia del Antiguo Egipto', description: 'Cambises II conquistó Egipto en el 525 a.C.: los persas gobernaron el Nilo durante 120 años y fueron los últimos faraones extranjeros antes de Alejandro' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'El zoroastrismo persa —dualismo bien/mal, juicio final, resurrección— influyó en el judaísmo tardío, el cristianismo y el islam: la filosofía moral persa cambió el mundo' },
  ],
  'visualizador-historia-japon': [
    { url: '/visualizador-historia/china-dinastias/', icon: '🐉', name: 'Las Grandes Dinastías Chinas', description: 'El Japón clásico tomó prestado de China su escritura, budismo, derecho y arquitectura: la cultura Tang fue el modelo que Nara y Heian adaptaron a la identidad japonesa' },
    { url: '/visualizador-historia/mongol/', icon: '🐴', name: 'Historia del Imperio Mongol', description: 'Kublai Kan intentó dos veces conquistar Japón (1274 y 1281): los kamikaze —vientos divinos— salvaron a Japón del único intento de invasión exterior de su historia' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'El ukiyo-e japonés —Hokusai, Hiroshige— fascinó a los impresionistas europeos del siglo XIX: el japonismo transformó el arte occidental moderno' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'El budismo zen, el shintoísmo y el bushido son sistemas filosóficos-espirituales japoneses que han influido en la meditación, el management y la cultura occidental contemporánea' },
  ],
  'visualizador-historia-china-dinastias': [
    { url: '/visualizador-historia/japon/', icon: '⛩️', name: 'Historia de Japón', description: 'China fue el modelo cultural de Japón durante siglos: escritura, budismo, administración y arte chino llegaron a Japón y transformaron su civilización' },
    { url: '/visualizador-historia/mongol/', icon: '🐴', name: 'Historia del Imperio Mongol', description: 'Los mongoles de Kublai Kan conquistaron China y fundaron la dinastía Yuan (1271): el mayor Imperio terrestre gobernó el mayor país del mundo durante casi un siglo' },
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '🪖', name: 'Primera Guerra Mundial', description: 'Las Guerras del Opio y el "siglo de la humillación" chino son el contexto que explica por qué China no jugó un papel protagonista en la Gran Guerra de 1914' },
    { url: '/visualizador-historia/banca/', icon: '🏦', name: 'Historia de la Banca', description: 'China inventó el papel moneda durante la dinastía Song (siglo X): el primer sistema de dinero fiduciario de la historia, 700 años antes de que Europa lo adoptara' },
  ],
  'visualizador-historia-primera-guerra-mundial': [
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'Segunda Guerra Mundial', description: 'Versalles sembró las semillas de la Segunda Guerra: la humillación de Alemania, las reparaciones imposibles y el resentimiento de la "puñalada por la espalda" llevaron directamente a Hitler' },
    { url: '/visualizador-historia/revolucion-francesa/', icon: '🗽', name: 'La Revolución Francesa', description: 'El nacionalismo que desencadenó la I Guerra Mundial tiene sus raíces ideológicas en la Revolución Francesa: el Estado-nación soberano como concepto surgió en 1789' },
    { url: '/visualizador-historia/otomano/', icon: '🌙', name: 'Historia del Imperio Otomano', description: 'El Imperio Otomano colapsó en la I Guerra Mundial al aliarse con las Potencias Centrales: la derrota en 1918 puso fin a 600 años de dominio otomano y creó los actuales países de Oriente Medio' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'El existencialismo, el nihilismo y la crisis del positivismo europeo son la respuesta filosófica a la carnicería de la Gran Guerra: Kafka, Camus y Sartre nacen de las trincheras' },
  ],
  'visualizador-historia-segunda-guerra-mundial': [
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '🪖', name: 'Primera Guerra Mundial', description: 'La Segunda Guerra es la secuela directa de la Primera: Versalles, la Gran Depresión y el ascenso de Hitler son consecuencias del tratado de paz de 1919' },
    { url: '/visualizador-historia/china-dinastias/', icon: '🐉', name: 'Las Grandes Dinastías Chinas', description: 'La Segunda Guerra incluyó el teatro del Pacífico: Japón había estado en guerra con China desde 1937, y la bomba atómica acabó con el último gran conflicto de la era imperial japonesa' },
    { url: '/visualizador-historia/banca/', icon: '🏦', name: 'Historia de la Banca', description: 'Bretton Woods (1944) y el Plan Marshall (1947) rediseñaron el sistema financiero global: el dólar como moneda de reserva mundial nació directamente de la posguerra de la Segunda Guerra' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'El expresionismo abstracto, el dadaísmo y el arte de posguerra son la respuesta artística al Holocausto y Hiroshima: el arte moderno no puede entenderse sin la Segunda Guerra Mundial' },
  ],
  'visualizador-historia-civilizaciones-precolombinas': [
    { url: '/visualizador-historia/maya/', icon: '🌿', name: 'Historia de los Mayas', description: 'Profundiza en la civilización maya individualmente: 3.000 años de historia, el cero, Tikal, Palenque y el Popol Vuh con mucho más detalle que en la vista combinada' },
    { url: '/visualizador-historia/azteca/', icon: '🦅', name: 'Historia de los Aztecas', description: 'El ascenso meteórico de los mexicas: de pueblo errante a mayor ciudad del hemisferio occidental en 200 años, con la Triple Alianza y la caída de Tenochtitlan en detalle' },
    { url: '/visualizador-historia/inca/', icon: '🏔️', name: 'Historia del Imperio Inca', description: 'El Tawantinsuyu en detalle: Pachacútec, Machu Picchu, los quipus, el Qhapaq Ñan y la resistencia de Vilcabamba hasta 1572' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'El capítulo siguiente: cómo estas civilizaciones fueron encontradas, enfrentadas y transformadas por la llegada europea desde 1492' },
  ],
  'visualizador-historia-maya': [
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Vista combinada de mayas, aztecas e incas: el contexto continental que permite comparar las tres grandes civilizaciones de América' },
    { url: '/visualizador-historia/azteca/', icon: '🦅', name: 'Historia de los Aztecas', description: 'Los aztecas conocieron a los mayas postclásicos y absorbieron elementos de su tradición: las ciudades-estado yucatecas eran contemporáneas del ascenso mexica' },
    { url: '/visualizador-historia/olmeca/', icon: '🗿', name: 'Historia de los Olmecas', description: 'La civilización madre de Mesoamérica: los olmecas pusieron los fundamentos —calendario, escritura, juego de pelota— sobre los que los mayas construyeron su esplendor' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'La conquista de Yucatán fue extraordinariamente difícil: Francisco de Montejo tardó 20 años en someter el territorio maya, que ya estaba fragmentado en ciudades-estado rivales' },
  ],
  'visualizador-historia-azteca': [
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Vista combinada de mayas, aztecas e incas: el contexto continental donde los aztecas fueron la potencia dominante de Mesoamérica en su momento de mayor esplendor' },
    { url: '/visualizador-historia/tolteca/', icon: '🐍', name: 'Historia de los Toltecas', description: 'Los toltecas fueron los maestros que los aztecas admiraban: reclamaron descender de ellos y adoptaron su arquitectura, sus órdenes militares y la leyenda de Quetzalcóatl' },
    { url: '/visualizador-historia/olmeca/', icon: '🗿', name: 'Historia de los Olmecas', description: 'Los olmecas pusieron los fundamentos de todo lo azteca: el calendario, el juego de pelota, el culto al jaguar y la arquitectura de plataformas ceremoniales son herencias olmecas' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'La caída de Tenochtitlan en 1521 es el episodio central de la conquista de México: epidemias, la alianza tlaxcalteca y Cortés desmantelan el Imperio Mexica en dos años' },
  ],
  'visualizador-historia-inca': [
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Vista combinada de mayas, aztecas e incas: el contexto continental donde el Tawantinsuyu fue el mayor estado de América, tan vasto como la distancia de Madrid a Moscú' },
    { url: '/visualizador-historia/azteca/', icon: '🦅', name: 'Historia de los Aztecas', description: 'Aztecas e incas fueron contemporáneos: mientras los mexicas dominaban Mesoamérica, el Tawantinsuyu se extendía por los Andes, los dos imperios sin contacto directo entre sí' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'La captura de Atahualpa en Cajamarca (1532) y el Estado Neo-Inca de Vilcabamba (hasta 1572): la conquista del Perú fue más lenta y compleja que la de México' },
    { url: '/visualizador-historia/mesopotamia/', icon: '🏺', name: 'Historia de Mesopotamia', description: 'Los incas y los sumerios demuestran que los grandes imperios de la historia resolvieron los mismos desafíos —administración territorial, redistribución económica, monumentalidad— con soluciones sorprendentemente similares' },
  ],
  'visualizador-historia-olmeca': [
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'El gran resumen de las civilizaciones americanas: los olmecas son el origen del que mayas, aztecas e incas heredaron los fundamentos de su cosmovisión' },
    { url: '/visualizador-historia/maya/', icon: '🌿', name: 'Historia de los Mayas', description: 'Los mayas son los herederos más directos de la tradición olmeca: el calendario, la escritura y el juego de pelota que los olmecas iniciaron llegaron a su máxima expresión en el mundo maya' },
    { url: '/visualizador-historia/tolteca/', icon: '🐍', name: 'Historia de los Toltecas', description: 'El puente entre el mundo olmeca y el azteca: los toltecas preservaron y transmitieron elementos de la tradición olmeca —el jaguar, la serpiente emplumada— al Valle de México posclásico' },
    { url: '/visualizador-historia/mesopotamia/', icon: '🏺', name: 'Historia de Mesopotamia', description: 'Olmecas y sumerios son los dos grandes casos de "primeras civilizaciones" en sus continentes: inventores del calendario, la escritura y la ciudad sin influencia mutua, en un paralelo fascinante' },
  ],
  'visualizador-historia-tolteca': [
    { url: '/visualizador-historia/azteca/', icon: '🦅', name: 'Historia de los Aztecas', description: 'Los aztecas se consideraban herederos de los toltecas: la grandeza de Tula era su modelo y su legitimación, y adoptaron las órdenes militares y la iconografía tolteca como propias' },
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Los toltecas son el eslabón entre Teotihuacán y los aztecas en la gran cadena de civilizaciones mesoamericanas: la vista combinada sitúa su papel en el contexto continental' },
    { url: '/visualizador-historia/olmeca/', icon: '🗿', name: 'Historia de los Olmecas', description: 'Los olmecas iniciaron la tradición que los toltecas amplificaron: el hombre-jaguar olmeca se transformó en la figura del jaguar de las órdenes militares toltecas y aztecas' },
    { url: '/visualizador-historia/maya/', icon: '🌿', name: 'Historia de los Mayas', description: 'La influencia tolteca en Chichén Itzá es el mayor misterio de la arqueología mesoamericana: los Atlantes de Tula y el Templo de los Guerreros de Chichén son casi idénticos a 1.500 km de distancia' },
  ],
  'visualizador-historia-espana-antigua': [
    { url: '/visualizador-historia/espana-medieval/', icon: '🏰', name: 'La España Medieval', description: 'El período que arranca exactamente donde termina la España Antigua: los visigodos (409) dan paso a Al-Ándalus y los reinos cristianos hasta 1492' },
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'Roma es el protagonista principal de la España Antigua: la conquista, la romanización y el colapso del Imperio enmarcan más de 600 años de historia peninsular' },
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Los íberos y sus contemporáneos americanos son civilizaciones que Roma nunca conoció: el paralelo entre culturas que evolucionaron sin contacto es fascinante' },
    { url: '/quiz-historia-espana/', icon: '🧠', name: 'Quiz Historia de España', description: '81 preguntas sobre toda la historia española — incluyendo el período romano y prerromano' },
  ],
  'visualizador-historia-espana-medieval': [
    { url: '/visualizador-historia/espana-antigua/', icon: '🏺', name: 'La España Antigua', description: 'El período anterior: íberos, celtas, Cartago y la Hispania Romana hasta el 409 que da inicio a la España Medieval' },
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Los Reyes Católicos enviaron a Colón justo al cerrar la Edad Media: el mundo precolombino al que llegaron en 1492 era tan complejo y avanzado como la propia Europa medieval' },
    { url: '/visualizador-historia/otomano/', icon: '🌙', name: 'Historia del Imperio Otomano', description: 'Al-Ándalus y el Imperio Otomano son los dos grandes proyectos de civilización islámica en Europa: contemporáneos y complementarios, con el Imperio Otomano tomando el relevo cultural cuando Al-Ándalus cae' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Averroes (Córdoba, 1126) y Maimónides (Córdoba, 1138) nacieron en Al-Ándalus: sin la España medieval islámica, la filosofía griega no habría llegado a la Europa cristiana medieval' },
  ],
  'visualizador-historia-edad-media-europea': [
    { url: '/visualizador-historia/renacimiento/', icon: '🎨', name: 'El Renacimiento', description: 'El Renacimiento es exactamente la salida de la Edad Media: las ciudades italianas del siglo XV se construyeron sobre los pilares feudales y eclesiásticos medievales que ahora cuestionaban' },
    { url: '/visualizador-historia/las-cruzadas/', icon: '⚔️', name: 'Las Cruzadas', description: 'Las Cruzadas son el fenómeno más característico de la Alta Edad Media: la movilización religiosa masiva que muestra el poder de la Iglesia y los límites del feudalismo europeo' },
    { url: '/visualizador-historia/espana-medieval/', icon: '🏰', name: 'La España Medieval', description: 'La Edad Media española tiene sus propias particularidades: tres culturas conviviendo en Al-Ándalus mientras el resto de Europa era homogéneamente cristiana' },
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'La Edad Media comienza exactamente donde termina Roma: el 476 d.C. es la bisagra entre dos mundos, y entender Roma es entender qué heredó y qué perdió la Europa medieval' },
  ],
  'visualizador-historia-renacimiento': [
    { url: '/visualizador-historia/edad-media-europea/', icon: '🏰', name: 'La Edad Media Europea', description: 'El Renacimiento no surgió de la nada: los avances medievales en universidades, teología y arte son el sustrato sobre el que florecen los humanistas del siglo XV' },
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'La Ilustración del siglo XVIII es el heredero directo del Renacimiento: la fe en la razón humana que Erasmo y Montaigne sembraron florece plenamente con Voltaire y Rousseau' },
    { url: '/visualizador-historia/la-reforma/', icon: '✝️', name: 'La Reforma Protestante', description: 'Erasmo de Rotterdam fue el gran humanista del Renacimiento nórdico y el maestro intelectual de Lutero: el Renacimiento y la Reforma son dos caras del mismo giro cultural del siglo XVI' },
    { url: '/visualizador-arte-movimientos/', icon: '🎨', name: 'Movimientos Artísticos', description: 'El Renacimiento es el período más estudiado en la historia del arte: Leonardo, Miguel Ángel y Rafael definen el ideal de artista que persiguieron todos los movimientos posteriores' },
  ],
  'visualizador-historia-la-reforma': [
    { url: '/visualizador-historia/renacimiento/', icon: '🎨', name: 'El Renacimiento', description: 'El humanismo renacentista proporcionó las herramientas intelectuales de la Reforma: el retorno a las fuentes (Lutero vuelve al griego del Nuevo Testamento gracias a Erasmo)' },
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'La Paz de Westfalia (1648) no solo cierra las guerras de religión: establece la soberanía territorial y la tolerancia religiosa que son el preludio del pensamiento ilustrado' },
    { url: '/visualizador-historia/edad-media-europea/', icon: '🏰', name: 'La Edad Media Europea', description: 'La Reforma es la ruptura definitiva con el modelo eclesiástico medieval: Lutero cuestiona exactamente la estructura de poder que la Iglesia había construido durante mil años' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Calvino y Lutero son también filósofos: sus concepciones de la fe, la gracia y el libre albedrío conectan directamente con los debates de la filosofía moderna sobre autonomía y razón' },
  ],
  'visualizador-historia-las-cruzadas': [
    { url: '/visualizador-historia/edad-media-europea/', icon: '🏰', name: 'La Edad Media Europea', description: 'Las Cruzadas son el fenómeno europeo medieval por excelencia: solo se entienden en el contexto del feudalismo, el poder de la Iglesia y la amenaza exterior que estructuró la identidad medieval' },
    { url: '/visualizador-historia/otomano/', icon: '🌙', name: 'Historia del Imperio Otomano', description: 'El Imperio Otomano hereda los territorios que las Cruzadas intentaron controlar: la caída de Constantinopla en 1453 es, en cierto modo, la respuesta final al proyecto cruzado' },
    { url: '/visualizador-historia/espana-medieval/', icon: '🏰', name: 'La España Medieval', description: 'El proyecto de avance cristiano en la Península Ibérica fue llamado por los papas "cruzada": la misma lógica religiosa que movilizó a Europa hacia Oriente operó en el Mediterráneo occidental' },
    { url: '/visualizador-historia/grecia/', icon: '🏛️', name: 'Historia de la Antigua Grecia', description: 'Los cruzados llamaban a Bizancio "la ciudad griega": el Imperio Romano de Oriente era el guardián del legado clásico griego, y su debilitamiento por la Cuarta Cruzada fue una pérdida cultural irreparable' },
  ],
  'visualizador-historia-ilustracion': [
    { url: '/visualizador-historia/renacimiento/', icon: '🎨', name: 'El Renacimiento', description: 'La Ilustración es el hijo del Renacimiento: la fe humanista en la capacidad humana de conocer y transformar el mundo, que el siglo XVIII lleva a sus consecuencias políticas y sociales' },
    { url: '/visualizador-historia/la-reforma/', icon: '✝️', name: 'La Reforma Protestante', description: 'La Reforma sembró el pluralismo que hizo posible la Ilustración: sin la ruptura de la autoridad única de Roma, la libertad de pensamiento ilustrada hubiera sido imposible' },
    { url: '/visualizador-historia/revolucion-francesa/', icon: '🗽', name: 'La Revolución Francesa', description: 'La Revolución Francesa es la Ilustración hecha política: los conceptos de Rousseau, Voltaire y Montesquieu se convierten en la Declaración de Derechos del Hombre y el Ciudadano' },
    { url: '/visualizador-filosofia/', icon: '🦉', name: 'Historia de la Filosofía', description: 'Kant, Hume, Locke y Rousseau son simultáneamente filósofos e ilustrados: la Ilustración es el momento en que la filosofía moderna alcanza su madurez y mayor influencia social' },
  ],

  // Temáticas Adicionales — Roadmap v10 EJE C (2026-05-04)
  'visualizador-historia-historia-descubrimientos-cientificos': [
    { url: '/visualizador-historia/historia-ciencia-espanola/', icon: '🔬', name: 'Ciencia Española', description: 'Los descubrimientos científicos globales tienen contribuciones españolas directas: Cajal y la neurona, Severo Ochoa y el ARN mensajero, la participación en el CRISPR y el CERN' },
    { url: '/visualizador-historia/fisica/', icon: '⚛️', name: 'Historia de la Física', description: 'La física es el eje central de la historia de los descubrimientos científicos: de Newton a Einstein, de la mecánica cuántica a la teoría de cuerdas' },
    { url: '/visualizador-historia/historia-electricidad/', icon: '⚡', name: 'Historia de la Electricidad', description: 'Faraday, Maxwell y Tesla conectan los descubrimientos científicos con la historia de la electricidad: la teoría electromagnética es simultáneamente física fundamental y revolución tecnológica' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'La computación, el transistor y la World Wide Web son el capítulo tecnológico de los descubrimientos científicos: de la máquina de Turing al ChatGPT' },
  ],
  'visualizador-historia-historia-india': [
    { url: '/visualizador-historia/historia-descubrimientos-cientificos/', icon: '🔭', name: 'Historia de los Descubrimientos Científicos', description: 'India inventó el cero y el sistema numérico posicional: Aryabhata, Brahmagupta y los matemáticos gupta hicieron contribuciones fundamentales que Europa tardó siglos en igualar' },
    { url: '/visualizador-historia/mongol/', icon: '🐴', name: 'Historia del Imperio Mongol', description: 'Los mogoles (Mughals) de la India son la rama india de la expansión mongola: Babur, fundador del Imperio Mughal, era descendiente de Timur y de Gengis Kan' },
    { url: '/visualizador-historia/historia-reino-unido/', icon: '👑', name: 'Historia del Reino Unido', description: 'El colonialismo británico en India es el capítulo más determinante de la historia moderna india: la EIC, el Raj, Gandhi y la independencia son inseparables de la historia del Imperio Británico' },
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'India y las civilizaciones precolombinas son los grandes ejemplos de civilizaciones que desarrollaron matemáticas, astronomía y arquitectura monumentales de forma independiente a Europa' },
  ],
  'visualizador-historia-historia-bizancio': [
    { url: '/visualizador-historia/otomano/', icon: '🌙', name: 'Historia del Imperio Otomano', description: 'El Imperio Otomano y Bizancio son las dos caras de la misma historia: el otomano nació en los territorios que Bizancio iba perdiendo, y la caída de Constantinopla en 1453 fundó definitivamente el Imperio Otomano' },
    { url: '/visualizador-historia/las-cruzadas/', icon: '⚔️', name: 'Las Cruzadas', description: 'La Cuarta Cruzada y el saqueo de Constantinopla (1204) son el episodio más traumático de la historia de Bizancio: los cruzados aliados debilitaron mortalmente al Imperio que debían defender' },
    { url: '/visualizador-historia/roma/', icon: '🦅', name: 'Historia de la Antigua Roma', description: 'Bizancio es la continuación directa de Roma: Constantino la fundó como Nueva Roma, sus emperadores se llamaban Romanos hasta 1453, y el Corpus Juris Civilis de Justiniano es la cumbre del derecho romano' },
    { url: '/visualizador-historia/historia-rusia/', icon: '🏔️', name: 'Historia de Rusia', description: 'La Rus de Kiev adoptó el Ortodoxismo de Bizancio en 988: la cultura, el arte y la religión byzantinos fundaron la identidad rusa. Moscú se proclamó "Tercera Roma" tras la caída de Constantinopla' },
  ],
  'visualizador-historia-historia-videojuegos-japoneses': [
    { url: '/visualizador-historia/videojuegos/', icon: '🕹️', name: 'Historia de los Videojuegos', description: 'La historia global del videojuego y la historia de los videojuegos japoneses son inseparables: Japón dominó la industria durante 30 años y definió sus géneros, mecánicas y estética más influyentes' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Los videojuegos online, los MMORPGs, los esports y las plataformas de distribución digital (Steam, PlayStation Network) conectan la historia del videojuego japonés con la historia de Internet' },
    { url: '/visualizador-historia/japon/', icon: '⛩️', name: 'Historia de Japón', description: 'Los videojuegos japoneses son inseparables de la cultura japonesa: el anime, el manga, el espíritu "monozukuri" (artesanía de excelencia) y la cultura otaku forman el ecosistema que los produjo' },
    { url: '/visualizador-historia/historia-descubrimientos-cientificos/', icon: '🔭', name: 'Descubrimientos Científicos', description: 'Los videojuegos son el mayor acelerador de la computación gráfica y la IA: la GPU fue inventada para videojuegos (NVIDIA, 1999) y hoy alimenta los modelos de IA más avanzados del mundo' },
  ],

  // Períodos y Temas Globales — Roadmap v10 EJE B (2026-05-04)
  'visualizador-historia-historia-guerra-fria': [
    { url: '/visualizador-historia/historia-eeuu/', icon: '🦅', name: 'Historia de EE.UU.', description: 'La Guerra Fría es el eje central de la historia americana de posguerra: de la Doctrina Truman al reaganismo, EE.UU. organizó toda su política exterior y buena parte de la interior en torno a la rivalidad con la URSS' },
    { url: '/visualizador-historia/historia-rusia/', icon: '🏔️', name: 'Historia de Rusia', description: 'La URSS es el otro protagonista absoluto: desde Stalin y la victoria en la Segunda Guerra Mundial hasta Gorbachov y el colapso, la historia soviética y la Guerra Fría son inseparables' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'La Segunda Guerra Mundial', description: 'La Guerra Fría nació directamente de la Segunda Guerra Mundial: las tensiones entre los Aliados sobre el reparto de Europa emergieron antes incluso de la derrota de Alemania' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'América Latina fue el campo de batalla más activo de la Guerra Fría fuera de Asia: Cuba, Chile, Nicaragua, Guatemala y decenas de golpes de Estado y guerrillas definidos por la lógica Este-Oeste' },
  ],
  'visualizador-historia-historia-america-latina': [
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'América Latina vivió la Guerra Fría de forma brutal: dictaduras apoyadas por EE.UU., guerrillas inspiradas por Cuba, el Operativo Cóndor y revoluciones como la sandinista son la expresión latinoamericana del conflicto global' },
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Las raíces profundas de América Latina: las civilizaciones maya, azteca e inca son el sustrato cultural que sobrevivió a la conquista y sigue presente en la identidad de México, Guatemala, Perú y Bolivia' },
    { url: '/visualizador-historia/espana-medieval/', icon: '🏰', name: 'La España Medieval', description: 'España colonial heredó las estructuras medievales castellanas: los latifundios, la encomienda, la estructura eclesiástica y el sistema de castas que organizaron América durante tres siglos tienen raíces en la Castilla medieval' },
    { url: '/visualizador-historia/revolucion-francesa/', icon: '🗽', name: 'La Revolución Francesa', description: 'Los ideales ilustrados franceses inspiraron directamente a los líderes independentistas latinoamericanos: Bolívar, San Martín y los patriotas criollos leyeron a Rousseau, Voltaire y la Declaración de Derechos del Hombre' },
  ],
  'visualizador-historia-historia-electricidad': [
    { url: '/visualizador-historia/historia-eeuu/', icon: '🦅', name: 'Historia de EE.UU.', description: 'EE.UU. fue el laboratorio donde se libró la Guerra de las Corrientes, donde se construyó la primera red eléctrica de Edison y donde Tesla y Westinghouse demostraron el poder de la corriente alterna: la electrificación americana fue el primer modelo global' },
    { url: '/visualizador-historia/fisica/', icon: '⚛️', name: 'Historia de la Física', description: 'La electricidad y la física son inseparables: de las ecuaciones de Maxwell a la mecánica cuántica que explica los semiconductores, cada avance eléctrico tiene un fundamento físico que esta cronología explora en profundidad' },
    { url: '/visualizador-historia/historia-ciencia-espanola/', icon: '🔬', name: 'Ciencia Española', description: 'Torres Quevedo (precursor de la automatización) y la participación española en el CERN son el nexo entre la historia de la electricidad y la ciencia española: la ingeniería eléctrica tuvo pioneros notables en España' },
    { url: '/visualizador-clima/', icon: '🌡️', name: 'Cómo Funciona el Clima', description: 'La transición energética que cierra la historia de la electricidad es la respuesta al cambio climático: entender el calentamiento global da sentido urgente al boom de las renovables y la descarbonización del sector eléctrico' },
  ],
  'visualizador-historia-historia-ciencia-espanola': [
    { url: '/visualizador-historia/espana-medieval/', icon: '🏰', name: 'La España Medieval', description: 'La Escuela de Traductores de Toledo y la ciencia de Al-Ándalus son inseparables de la España Medieval: Averroes, Maimónides y los traductores toledanos operaron en el mismo contexto histórico que Reconquista y convivencia de las tres culturas' },
    { url: '/visualizador-historia/historia-electricidad/', icon: '⚡', name: 'Historia de la Electricidad', description: 'Torres Quevedo, pionero español de la automatización y la computación, conecta directamente la historia de la ciencia española con la historia de la electricidad y la tecnología: su "Ajedrecista" anticipó la IA décadas antes que Turing' },
    { url: '/visualizador-historia/renacimiento/', icon: '🎨', name: 'El Renacimiento', description: 'Los científicos españoles del Siglo de Oro (Hernández, Urdaneta, Valverde) operaron en el mismo contexto del Renacimiento europeo: la revolución científica del siglo XVI fue tan española como italiana o alemana' },
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'Las Reales Expediciones Botánicas y la Expedición Balmis son la expresión española de la Ilustración: el afán sistematizador ilustrado aplicado a la naturaleza americana y a la salud pública global' },
  ],

  // Grandes Potencias y Naciones — Roadmap v10 EJE A (2026-05-04)
  'visualizador-historia-historia-eeuu': [
    { url: '/visualizador-historia/historia-reino-unido/', icon: '👑', name: 'Historia del Reino Unido', description: 'La relación entre EE.UU. y el Reino Unido es única: colonia que derrota a la metrópoli, aliados en dos guerras mundiales, relación especial que define la política exterior del siglo XX' },
    { url: '/visualizador-historia/historia-rusia/', icon: '🏔️', name: 'Historia de Rusia', description: 'EE.UU. y Rusia definieron el siglo XX: desde la alianza contra Hitler hasta la Guerra Fría, la carrera espacial y el mundo post-1991, son las dos potencias cuya rivalidad estructura la geopolítica moderna' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'La Segunda Guerra Mundial', description: 'EE.UU. transformó su papel en el mundo al entrar en la Segunda Guerra Mundial: de potencia continental aislacionista a garante del orden liberal internacional, un cambio que dura hasta hoy' },
    { url: '/visualizador-historia/revolucion-francesa/', icon: '🗽', name: 'La Revolución Francesa', description: 'La Revolución Americana (1776) y la Francesa (1789) son las dos caras del mismo movimiento ilustrado: los padres fundadores de EE.UU. influyeron directamente en los revolucionarios franceses' },
  ],
  'visualizador-historia-historia-rusia': [
    { url: '/visualizador-historia/historia-eeuu/', icon: '🦅', name: 'Historia de los EE.UU.', description: 'Las dos superpotencias que definieron el siglo XX: desde la alianza en la Segunda Guerra Mundial hasta la Guerra Fría, la carrera espacial y la geopolítica post-1991' },
    { url: '/visualizador-historia/historia-reino-unido/', icon: '👑', name: 'Historia del Reino Unido', description: 'El Imperio Británico y el Imperio Ruso fueron los grandes rivales del siglo XIX en el "Gran Juego" por Asia Central; en el XX, aliados cruciales contra Alemania en ambas guerras mundiales' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'La Segunda Guerra Mundial', description: 'La URSS soportó el mayor peso de la guerra contra el nazismo: 27 millones de muertos soviéticos, Stalingrado como punto de inflexión, y la victoria que convirtió a la URSS en superpotencia' },
    { url: '/visualizador-historia/otomano/', icon: '🌙', name: 'Historia del Imperio Otomano', description: 'Rusia y el Imperio Otomano fueron rivales durante siglos por el Mar Negro y los Balcanes: las guerras Ruso-Turcas del siglo XIX definieron el mapa de Europa Oriental' },
  ],
  'visualizador-historia-historia-reino-unido': [
    { url: '/visualizador-historia/historia-eeuu/', icon: '🦅', name: 'Historia de los EE.UU.', description: 'Las trece colonias británicas que se convirtieron en superpotencia: la relación especial entre Londres y Washington es la alianza más duradera del mundo moderno' },
    { url: '/visualizador-historia/historia-vikingos/', icon: '🚢', name: 'La Era Vikinga', description: 'Los normandos que conquistaron Inglaterra en 1066 eran descendientes de vikingos: la Conquista Normanda, el hito fundacional de la historia inglesa, es el último capítulo de la expansión vikinga' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'La Segunda Guerra Mundial', description: 'La Batalla de Gran Bretaña y el liderazgo de Churchill son uno de los momentos más estudiados del siglo XX: la isla que resistió sola define el carácter nacional británico hasta hoy' },
    { url: '/visualizador-historia/edad-media-europea/', icon: '🏰', name: 'La Edad Media Europea', description: 'La Magna Carta (1215) y el parlamentarismo inglés son la aportación británica al constitucionalismo europeo: el modelo que influiría en todas las democracias occidentales' },
  ],
  'visualizador-historia-historia-vikingos': [
    { url: '/visualizador-historia/historia-reino-unido/', icon: '👑', name: 'Historia del Reino Unido', description: 'La Conquista Normanda de 1066 cierra la Era Vikinga y abre la historia medieval inglesa: los normandos son vikingos romanizados que transformaron para siempre el idioma, la cultura y las instituciones de Inglaterra' },
    { url: '/visualizador-historia/historia-rusia/', icon: '🏔️', name: 'Historia de Rusia', description: 'Los varegos suecos fundaron la Rus de Kiev y Nóvgorod: los vikingos del este son literalmente los fundadores del Estado ruso, conectando Escandinavia con Bizancio y el mundo islámico a través de los ríos' },
    { url: '/visualizador-historia/edad-media-europea/', icon: '🏰', name: 'La Edad Media Europea', description: 'Las incursiones vikingas aceleraron la fragmentación carolingia y el nacimiento del feudalismo: la Normandía viking, el Danelaw inglés y la Rus son tres ramas del mismo árbol que remodeló la Europa medieval' },
    { url: '/visualizador-historia/las-cruzadas/', icon: '⚔️', name: 'Las Cruzadas', description: 'La Guardia Varega de Bizancio, formada por vikingos suecos, defendió el Imperio durante siglos: los mismos guerreros del norte que saqueaban Europa occidental protegían la capital del Imperio Romano de Oriente' },
  ],

  // Grandes Temas Siglo XX-XXI — Roadmap v11 EJE B (2026-05-04)
  'visualizador-historia-historia-derechos-humanos': [
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'Los Acuerdos de Helsinki (1975) y el proceso CSCE vincularon por primera vez la seguridad europea con el respeto a los derechos humanos: la presión occidental sobre los regímenes del Este por los derechos civiles fue una de las palancas del colapso soviético' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'La Segunda Guerra Mundial', description: 'El Holocausto y los crímenes de guerra del nazismo fueron el catalizador directo de la Declaración Universal de 1948: "Nunca más" fue el imperativo moral que convenció a los estados de firmar un código universal de derechos humanos' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Las dictaduras militares latinoamericanas de los años 70-80 (Pinochet, Videla, la guerra sucia) pusieron a prueba los mecanismos internacionales de derechos humanos: organizaciones como Amnistía Internacional y la CIDH se forjaron en esos casos' },
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia de África', description: 'El proceso de descolonización africana (años 60) amplió el concepto de derechos humanos con el derecho a la autodeterminación y el fin del apartheid en Sudáfrica: la lucha de Mandela es inseparable de la historia de los derechos humanos' },
  ],
  'visualizador-historia-historia-medicina-contemporanea': [
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina (Antigua)', description: 'La medicina contemporánea empieza donde termina la medicina antigua: la teoría germinal de Pasteur (1865) rompe definitivamente con la teoría miasmática que dominó la medicina desde Hipócrates hasta el siglo XIX' },
    { url: '/visualizador-historia/epidemias/', icon: '🦠', name: 'Historia de las Epidemias', description: 'La penicilina (1942), las vacunas modernas y la erradicación de la viruela (1980) son los logros de la medicina contemporánea que hicieron posible controlar epidemias que diezmaban poblaciones: el final de la era pre-antibiótica cambió la historia de las enfermedades infecciosas' },
    { url: '/visualizador-historia/historia-descubrimientos-cientificos/', icon: '🔭', name: 'Historia de los Descubrimientos Científicos', description: 'El doble hélice del ADN (Watson y Crick, 1953), la penicilina (Fleming, 1928) y CRISPR (Doudna/Charpentier, 2012) son simultáneamente los grandes descubrimientos científicos y los hitos clave de la medicina contemporánea' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la Inteligencia Artificial', description: 'AlphaFold (2020) resolvió el problema del plegamiento de proteínas que llevaba 50 años sin resolver: la IA es ya la herramienta más transformadora de la medicina del siglo XXI, desde el diagnóstico por imagen hasta el descubrimiento de fármacos' },
  ],
  'visualizador-historia-historia-economia-mundial': [
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'El Plan Marshall (1948), el FMI, el Banco Mundial y la OTAN son simultáneamente instituciones económicas y estratégicas de la Guerra Fría: la economía del bloque occidental fue el campo de batalla más importante de la confrontación ideológica' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'ChatGPT y los grandes modelos de lenguaje plantean la pregunta económica más importante de este siglo: ¿La IA destruirá empleos a una velocidad que el sistema económico no pueda absorber? La respuesta determinará el próximo gran ciclo económico' },
    { url: '/visualizador-historia/historia-china-moderna/', icon: '🐉', name: 'Historia de la China Moderna', description: 'La reforma económica de Deng Xiaoping (1978) y la entrada de China en la OMC (2001) son los dos eventos que más transformaron la economía mundial desde Bretton Woods: el ascenso de China como fábrica del mundo y potencia económica reconfiguró la globalización' },
    { url: '/visualizador-historia/economia-espana/', icon: '🇪🇸', name: 'Historia de la Economía Española', description: 'La economía española es un reflejo amplificado de los ciclos económicos mundiales: la burbuja de 1997-2007, la crisis de 2008-2013 y la recuperación posterior son variantes nacionales de los mismos patrones descritos en la historia económica mundial' },
  ],
  'visualizador-historia-historia-inteligencia-artificial': [
    { url: '/visualizador-historia/historia-descubrimientos-cientificos/', icon: '🔭', name: 'Historia de los Descubrimientos Científicos', description: 'La IA es el último gran descubrimiento científico de la historia moderna: la teoría de la computación de Turing (1950), las redes neuronales y el deep learning son tan transformadores como la mecánica cuántica o la doble hélice del ADN' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📉', name: 'Historia de la Economía Mundial', description: 'ChatGPT y los LLMs plantean la mayor pregunta económica desde la Revolución Industrial: ¿automatización que destruye empleos o que los transforma? La respuesta determinará el próximo gran ciclo económico y la distribución de la riqueza global' },
    { url: '/visualizador-historia/ordenadores/', icon: '💻', name: 'Historia de los Ordenadores', description: 'La historia de la IA es inseparable de la historia del hardware: el transistor (1947), los circuitos integrados, la Ley de Moore y las GPU de NVIDIA son el sustrato físico sin el cual el deep learning de 2012 y los LLMs de 2020 no habrían sido posibles' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet fue el ecosistema que hizo posible el big data, y el big data fue el combustible que permitió entrenar los modelos de deep learning: sin los datos de búsquedas de Google, las redes sociales y Wikipedia, GPT no existiría' },
  ],

  // Cultura Popular y Deporte — Roadmap v11 EJE C (2026-05-04)
  'visualizador-historia-historia-futbol': [
    { url: '/visualizador-historia/deporte/', icon: '🏅', name: 'Historia del Deporte', description: 'La historia general del deporte incluye los Juegos Olímpicos, el atletismo y los grandes momentos del deporte mundial: el fútbol es el capítulo más largo de esa historia global' },
    { url: '/visualizador-historia/historia-reino-unido/', icon: '👑', name: 'Historia del Reino Unido', description: 'Inglaterra inventó el fútbol moderno: la Football Association (1863), la Football League (1888) y la Premier League (1992) son instituciones británicas que globalizaron el deporte más popular del mundo' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Brasil y Argentina son las dos grandes potencias del fútbol mundial: Pelé, Maradona, Ronaldinho y Messi son la cara latinoamericana del deporte más popular del planeta' },
    { url: '/visualizador-historia/historia-oriente-medio/', icon: '🕌', name: 'Historia del Oriente Medio', description: 'El Mundial de Qatar 2022 fue el primer Mundial celebrado en Oriente Medio: la llegada del dinero del Golfo al fútbol europeo es el capítulo más reciente de la geopolítica del fútbol' },
  ],
  'visualizador-historia-historia-musica-popular': [
    { url: '/visualizador-historia/historia-eeuu/', icon: '🦅', name: 'Historia de los EE.UU.', description: 'El blues, el jazz, el rock & roll y el hip-hop nacieron en Estados Unidos: la música popular americana es inseparable de la historia social del país, desde la esclavitud hasta los derechos civiles y la cultura global' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'La IA generativa (Suno, Udio) está empezando a componer música: el debate sobre derechos de autor y el futuro de la industria musical son los capítulos más recientes de la historia de la música popular' },
    { url: '/visualizador-historia/historia-japon-moderno/', icon: '⛩️', name: 'Historia del Japón Moderno', description: 'El manga, el anime y el K-pop son la versión asiática del fenómeno de la cultura popular globalizada: BTS y BLACKPINK repitieron en el siglo XXI lo que Los Beatles hicieron con la invasión británica de 1964' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Napster, iTunes, YouTube, Spotify y TikTok son los hitos de internet que destruyeron y reconstruyeron la industria musical: la historia de la música popular del siglo XXI es inseparable de la historia de internet' },
  ],
  'visualizador-historia-historia-arquitectura-moderna': [
    { url: '/visualizador-historia/historia-descubrimientos-cientificos/', icon: '🔭', name: 'Historia de los Descubrimientos Científicos', description: 'El hormigón armado, el acero estructural y el vidrio float son descubrimientos científicos que hicieron posible la arquitectura moderna: sin la metalurgia del siglo XIX no hay rascacielos' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'El diseño paramétrico con IA está transformando la arquitectura: las formas imposibles de Zaha Hadid que requerían CATIA en los 90 hoy se generan con prompts de IA generativa' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📉', name: 'Historia de la Economía Mundial', description: 'Los ciclos económicos definen la arquitectura: el boom de los 60 produjo el brutalismo del Estado del Bienestar; la crisis de 2008 paralizó miles de proyectos; el dinero del Golfo financia los rascacielos más altos del mundo' },
    { url: '/visualizador-historia/historia-reino-unido/', icon: '👑', name: 'Historia del Reino Unido', description: 'El Crystal Palace (1851), la arquitectura High-Tech de Norman Foster y Richard Rogers, el Barbican y el Shard son hitos de la arquitectura británica desde la Revolución Industrial hasta el siglo XXI' },
  ],

  // Naciones Pendientes — Roadmap v11 EJE A (2026-05-04)
  'visualizador-historia-historia-china-moderna': [
    { url: '/visualizador-historia/china-dinastias/', icon: '🏯', name: 'China Imperial: Dinastías', description: 'La historia dinástica de China termina donde empieza la China moderna: la caída de la dinastía Qing en 1912 es el momento en que el milenario sistema imperial da paso a la República y luego al comunismo maoísta' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'La China de Mao fue el tercer actor de la Guerra Fría: la ruptura sino-soviética de los años 60, la apertura de Nixon a China en 1972 y la alineación de Pekín con Occidente reequilibraron completamente el bipolarismo' },
    { url: '/visualizador-historia/historia-japon-moderno/', icon: '⛩️', name: 'Historia del Japón Moderno', description: 'La guerra sino-japonesa (1937-1945) es la experiencia que une y separa a los dos gigantes asiáticos: Japón ocupó China, cometió la Masacre de Nankín y marcó para generaciones la relación bilateral' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'La Revolución Cubana de 1959 y el apoyo de China a los movimientos guerrilleros latinoamericanos conectan la historia de la China maoísta con el turbulento siglo XX latinoamericano' },
  ],
  'visualizador-historia-historia-japon-moderno': [
    { url: '/visualizador-historia/japon/', icon: '🗾', name: 'Historia del Japón Clásico', description: 'El Japón clásico termina en 1868 con la Restauración Meiji: el shogunato Tokugawa que dominó Japón 265 años en aislamiento voluntario dio paso al Japón que en 50 años se convertiría en potencia industrial y militar' },
    { url: '/visualizador-historia/historia-china-moderna/', icon: '🐉', name: 'Historia de la China Moderna', description: 'La guerra sino-japonesa (1937-1945) y la Masacre de Nankín marcaron para siempre la relación entre Japón y China: la competencia y el recelo mutuo entre las dos mayores economías de Asia tienen raíces en ese período' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '✈️', name: 'La Segunda Guerra Mundial', description: 'El teatro del Pacífico de la Segunda Guerra Mundial es inseparable de la historia japonesa: Pearl Harbor, Midway, las campañas de las islas y los bombardeos atómicos de Hiroshima y Nagasaki son los hitos más estudiados' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'La ocupación americana de Japón (1945-1952) y la nueva Constitución pacifista transformaron Japón en el aliado estratégico clave de EE.UU. en el Pacífico, base del milagro económico y del sistema de seguridad regional' },
  ],
  'visualizador-historia-historia-oriente-medio': [
    { url: '/visualizador-historia/otomano/', icon: '🌙', name: 'Historia del Imperio Otomano', description: 'El Imperio Otomano era el poder que controlaba Oriente Medio hasta la Primera Guerra Mundial: el Acuerdo Sykes-Picot que dibujó las fronteras actuales se hizo sobre las ruinas del Imperio Otomano, repartiendo sus territorios árabes' },
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '💣', name: 'La Primera Guerra Mundial', description: 'La Primera Guerra Mundial disolvió el Imperio Otomano y creó el Oriente Medio moderno: la Campaña de Arabia, Lawrence de Arabia y la Declaración Balfour son capítulos simultáneos de la misma guerra' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'Oriente Medio fue uno de los principales campos de batalla de la Guerra Fría: la crisis de Suez, la revolución iraní, la invasión soviética de Afganistán y las guerras proxy de EE.UU. y la URSS definieron la región' },
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia de África', description: 'El colonialismo europeo que dibujó las fronteras artificiales de África y el Oriente Medio son dos productos del mismo período histórico: el reparto imperialista de finales del siglo XIX y principios del XX' },
  ],
  'visualizador-historia-historia-africa': [
    { url: '/visualizador-historia/imperios-africa-occidental/', icon: '🏅', name: 'Imperios de África Occidental', description: 'Antes del reparto colonial, África Occidental albergó grandes imperios: Ghana, Mali y Songhai controlaron el comercio transahariano del oro y la sal durante trece siglos, y Tombuctú fue un faro intelectual del islam mucho antes de la Conferencia de Berlín.' },
    { url: '/visualizador-historia/etiopia-aksum/', icon: '🦁', name: 'Historia de Etiopía', description: 'Etiopía es la gran excepción de la historia colonial africana: la victoria de Adwa (1896) frente a Italia preservó una soberanía milenaria que se remonta al Reino de Aksum, mientras el resto del continente era repartido entre potencias europeas.' },
    { url: '/visualizador-historia/historia-oriente-medio/', icon: '🕌', name: 'Historia del Oriente Medio', description: 'El colonialismo europeo que repartió Oriente Medio y África en el siglo XIX y XX es el mismo fenómeno: la Conferencia de Berlín (1884) para África y el Acuerdo Sykes-Picot (1916) para el Oriente Medio son el mismo patrón colonial' },
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Las civilizaciones precolombinas y África precolonial son los dos grandes ejemplos de mundos con civilizaciones avanzadas que el imperialismo europeo disrumpió violentamente en los siglos XV-XIX' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'Las independencias africanas de los años 60 coincidieron con la Guerra Fría: EE.UU. y la URSS compitieron por la influencia en el continente, apoyando a distintos bandos en guerras civiles como la del Congo, Angola y Mozambique' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'El colonialismo, la esclavitud y los procesos de descolonización son experiencias compartidas entre África y América Latina: la diáspora africana es el vínculo demográfico y cultural más profundo entre los dos continentes' },
    { url: '/visualizador-historia/reino-kongo/', icon: '👑', name: 'Reino del Kongo', description: 'El Kongo fue uno de los Estados africanos atlánticos mejor documentados antes de la colonización: su contacto con Portugal desde 1483 y las cartas de Afonso I contra la trata muestran una África que negoció, escribió y resistió mucho antes del reparto de Berlín.' },
    { url: '/visualizador-historia/reino-benin/', icon: '🛡️', name: 'Reino de Benín (Edo)', description: 'El Reino de Benín y el expolio de sus bronces en 1897 son hoy el centro del debate sobre la restitución del patrimonio africano: un caso emblemático para entender qué se llevó el colonialismo y qué se reclama en la África contemporánea.' },
    { url: '/visualizador-historia/imperio-oyo/', icon: '🐎', name: 'Imperio de Oyó y los Estados Yoruba', description: 'La cultura yoruba es uno de los grandes legados africanos en el mundo: las guerras del siglo XIX y la trata llevaron a los orishas a Cuba y Brasil, donde pervive en la santería y el candomblé, tendiendo un puente vivo entre África y América.' },
  ],

  // Nuevas Historias — Prehistoria, UE, Conquista y Alemania (2026-05-05)
  'visualizador-historia-historia-prehistoria': [
    { url: '/visualizador-historia/mesopotamia/', icon: '🏺', name: 'Mesopotamia', description: 'La prehistoria termina donde empieza Mesopotamia: la escritura cuneiforme de Uruk (~3.200 a.C.) es la frontera entre la prehistoria y la historia. Los primeros sumerios son el siguiente capítulo del relato humano.' },
    { url: '/visualizador-historia/egipto/', icon: '🏛️', name: 'Antiguo Egipto', description: 'Egipto faraónico comienza justo donde termina el Calcolítico prehistórico: las primeras dinastías egipcias (3.100 a.C.) son el producto directo de la sedentarización y las técnicas neolíticas.' },
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Las primeras civilizaciones americanas (olmecas, mayas, aztecas, incas) surgieron de los mismos procesos neolíticos que en el Viejo Mundo: agricultura, sedentarismo y urbanización, pero milenios después.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'La conquista de América (1492-1600) destruyó en décadas civilizaciones que habían tardado miles de años en desarrollarse desde los primeros pobladores americanos que cruzaron Beringia en la prehistoria.' },
  ],
  'visualizador-historia-historia-union-europea': [
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '💥', name: 'Segunda Guerra Mundial', description: 'La Segunda Guerra Mundial fue la razón de ser de la Unión Europea: los padres fundadores como Schuman, Monnet y Adenauer crearon la CECA en 1951 precisamente para hacer imposible otra guerra entre Francia y Alemania.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'La UE se construyó en el contexto de la Guerra Fría: la división de Europa entre el bloque occidental (CEE) y el bloque soviético (Comecon) fue el telón de fondo de toda la integración europea de 1945 a 1991.' },
    { url: '/visualizador-historia/historia-alemania/', icon: '🇩🇪', name: 'Historia de Alemania', description: 'Alemania es el actor central de la integración europea: su reconciliación con Francia fue el motor fundacional, su reunificación en 1990 el mayor desafío, y su economía el motor actual de la UE.' },
    { url: '/visualizador-historia/historia-reino-unido/', icon: '🇬🇧', name: 'Historia del Reino Unido', description: 'El Reino Unido fue miembro de la CEE desde 1973 y abandonó la UE con el Brexit en 2020: su relación con la integración europea ha sido siempre ambivalente, desde el veto de De Gaulle hasta el referéndum de 2016.' },
  ],
  'visualizador-historia-historia-conquista-america': [
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🌽', name: 'Civilizaciones Precolombinas', description: 'Las civilizaciones azteca, inca y maya que Cortés y Pizarro conquistaron son el objeto directo de la conquista: entender el Imperio Azteca y el Inca es entender qué se destruyó y qué se transformó.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'La conquista de 1492-1600 es el punto de partida de toda la historia latinoamericana: el mestizaje, las instituciones coloniales y el trauma del colapso demográfico son la herencia directa de este período.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'Historia de la Exploración', description: 'La conquista de América fue el acto central de la gran era de exploraciones europeas: Colón, Vespucio, Magallanes y Elcano son los protagonistas del mismo siglo de descubrimientos geográficos.' },
    { url: '/visualizador-historia/historia-prehistoria/', icon: '🦴', name: 'Prehistoria', description: 'Los primeros americanos llegaron desde Siberia cruzando Beringia hace ~15.000 años: los pueblos que Colón encontró en 1492 eran los descendientes de esa migración prehistórica que pobló todo el continente.' },
  ],
  'visualizador-historia-historia-alemania': [
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '⚔️', name: 'Primera Guerra Mundial', description: 'Alemania fue el actor central de la Primera Guerra Mundial: el sistema de alianzas bismarckiano, el Weltpolitik de Guillermo II y el Plan Schlieffen son los factores alemanes que desencadenaron el conflicto.' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '💥', name: 'Segunda Guerra Mundial', description: 'Alemania bajo el nazismo fue el iniciador y principal responsable de la Segunda Guerra Mundial y el Holocausto: entender el Tercer Reich es indispensable para entender el mayor conflicto de la historia.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'Alemania fue literalmente el frente principal de la Guerra Fría: la división en RFA y RDA, el Muro de Berlín y la reunificación de 1990 son los hitos más concretos y visibles de toda la confrontación Este-Oeste.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'La Unión Europea', description: 'Alemania es el motor político y económico de la Unión Europea: desde la reconciliación franco-alemana de 1950 hasta el liderazgo de Merkel en la crisis del euro, Alemania y la UE son inseparables.' },
  ],

  // Italia, Francia Contemporánea y Serie España — (2026-05-05)
  'visualizador-historia-historia-italia': [
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '⚔️', name: 'Primera Guerra Mundial', description: 'Italia entró en la guerra en 1915 con la promesa de territorios y salió con la "victoria mutilada": la humillación de Versalles fue el caldo de cultivo directo del fascismo de Mussolini.' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '💥', name: 'Segunda Guerra Mundial', description: 'Italia fue aliada de Hitler hasta 1943, luego cambió de bando: el armisticio, la liberación partisana y la muerte de Mussolini son los capítulos italianos de la guerra más larga de la historia.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'La Unión Europea', description: 'Italia fue uno de los seis países fundadores de la CEE en 1957: De Gasperi fue tan importante como Schuman y Adenauer en la construcción europea. El tratado fundacional se firmó en Roma.' },
    { url: '/visualizador-historia/historia-alemania/', icon: '🇩🇪', name: 'Historia de Alemania', description: 'Alemania e Italia compartieron el Eje durante la Segunda Guerra Mundial y luego cofundaron la Unión Europea: dos países que pasaron del fascismo a la democracia y la integración europea de forma paralela.' },
  ],
  'visualizador-historia-historia-francia-contemporanea': [
    { url: '/visualizador-historia/revolucion-francesa/', icon: '⚡', name: 'La Revolución Francesa', description: 'La Revolución Francesa (1789-1799) y el período napoleónico son el punto de partida directo de la Francia contemporánea: la Tercera República (1870) hereda los principios de Liberté, Égalité, Fraternité.' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '💥', name: 'Segunda Guerra Mundial', description: 'Vichy y la Resistencia son el capítulo más traumático de la Francia contemporánea: la colaboración con los nazis, la deportación de 75.000 judíos y el mito resistencialista de De Gaulle marcaron décadas de historia.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'La Unión Europea', description: 'Francia fue cofundadora de la CEE junto a Alemania: la reconciliación franco-alemana de Schuman y Adenauer (1950) es el acto fundacional más importante de la integración europea.' },
    { url: '/visualizador-historia/historia-alemania/', icon: '🇩🇪', name: 'Historia de Alemania', description: 'Francia y Alemania son el eje motor de la integración europea: dos países que fueron enemigos en tres guerras (1870, 1914, 1940) y se convirtieron en el corazón del proyecto europeo.' },
  ],
  'visualizador-historia-espana-austrias': [
    { url: '/visualizador-historia/espana-medieval/', icon: '🏰', name: 'España Medieval', description: 'La España de los Austrias es la continuación directa de la España medieval: la Reconquista concluye en 1492, el mismo año que Colón llega a América, estableciendo el punto de partida del Imperio.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'La conquista de América es inseparable de la España de los Austrias: fue financiada por los Reyes Católicos, ejecutada bajo Carlos I y Felipe II, y su plata financió el Imperio europeo durante dos siglos.' },
    { url: '/visualizador-historia/espana-borbones/', icon: '🌸', name: 'España de los Borbones', description: 'La España de los Borbones (1700-1808) es la continuación directa de los Austrias: Felipe V hereda el Imperio que Carlos II dejó en crisis y aplica las reformas borbónicas sobre la estructura habsburguesa.' },
    { url: '/visualizador-historia/renacimiento/', icon: '🎨', name: 'El Renacimiento', description: 'El Siglo de Oro español coincide con el Renacimiento europeo: Cervantes, Lope y Velázquez son contemporáneos de Shakespeare y Rembrandt. España fue el mayor mecenas del arte renacentista fuera de Italia.' },
  ],
  'visualizador-historia-espana-borbones': [
    { url: '/visualizador-historia/espana-austrias/', icon: '⚜️', name: 'España de los Austrias', description: 'La España borbónica (1700-1808) hereda directamente el Imperio decadente de los Austrias: Felipe V llega a un país en crisis y aplica las reformas ilustradas francesas sobre una estructura habsburguesa en ruinas.' },
    { url: '/visualizador-historia/espana-contemporanea/', icon: '🇪🇸', name: 'España Contemporánea', description: 'Las Abdicaciones de Bayona (1808) marcan el fin de la España borbónica del siglo XVIII y el inicio de la España contemporánea: la Guerra de Independencia y la Constitución de Cádiz nacen del vacío de poder napoleónico.' },
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'La España de Carlos III es el capítulo español de la Ilustración europea: Jovellanos, Campomanes y Olavide son los ilustrados españoles que intentan modernizar el país siguiendo el modelo enciclopedista francés.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'Las reformas borbónicas en América (1765-1808) reorganizan el Imperio colonial creado por los Austrias: las Intendencias, el Libre Comercio y los nuevos virreinatos aceleran paradójicamente las independencias americanas.' },
  ],
  'visualizador-historia-espana-contemporanea': [
    { url: '/visualizador-historia/espana-borbones/', icon: '🌸', name: 'España de los Borbones', description: 'La España contemporánea arranca donde termina la borbónica: las Abdicaciones de Bayona (1808) y la Guerra de Independencia son el punto cero de la España liberal y constitucional.' },
    { url: '/visualizador-historia/revolucion-francesa/', icon: '⚡', name: 'La Revolución Francesa', description: 'La Revolución Francesa inspira directamente la Constitución de Cádiz (1812) y el liberalismo español: el impacto de 1789 en España fue doble — ideológico (liberalismo) y traumático (invasión napoleónica).' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '☢️', name: 'La Guerra Fría', description: 'El franquismo sobrevivió gracias a la Guerra Fría: EE.UU. firmó los Pactos de Madrid (1953) con Franco a cambio de bases militares, legitimando una dictadura que de otro modo habría quedado aislada.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'La Unión Europea', description: 'La integración europea es el proyecto más transformador de la España democrática: la entrada en la CEE (1986) fue el premio a la Transición y el motor del desarrollo económico de los años 80 y 90.' },
  ],

  // Imperio Austro-Húngaro, Islam Clásico y Portugal Ultramar — (2026-05-05)
  'visualizador-historia-historia-austria-hungria': [
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '💣', name: 'La Primera Guerra Mundial', description: 'El asesinato del Archiduque Franz Ferdinand en Sarajevo (1914) fue el detonante de la Primera Guerra Mundial y el fin del Imperio Austro-Húngaro: sin ese disparo, la guerra habría tenido otro origen o no habría estallado ese verano.' },
    { url: '/visualizador-historia/historia-alemania/', icon: '🇩🇪', name: 'Historia de Alemania', description: 'Austria-Hungría y Alemania son la cara y la cruz de la Europa centroeuropea: aliados en la Triple Alianza, derrotados juntos en 1918, y sus imperios desmembrados dan lugar a la República de Weimar y las repúblicas sucesorias austro-húngaras.' },
    { url: '/visualizador-historia/historia-italia/', icon: '🇮🇹', name: 'Historia de Italia', description: 'Italia nació en parte contra Austria: el Risorgimento fue también una guerra de independencia contra el dominio habsburgués en Lombardía y Véneto. Las guerras de 1848, 1859 y 1866 definen la relación italo-austríaca.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'La Unión Europea', description: 'Los Estados sucesorios del Imperio Austro-Húngaro (Austria, Hungría, Chequia, Eslovaquia, Croacia, Eslovenia...) son hoy miembros de la UE: la integración europea reimagina el espacio de convivencia que los Habsburgo gestionaron durante siglos.' },
  ],
  'visualizador-historia-historia-islam-clasico': [
    { url: '/visualizador-historia/espana-medieval/', icon: '🏰', name: 'España Medieval', description: 'Al-Ándalus es el capítulo español de la civilización islámica clásica: la llegada de Tariq ibn Ziyad (711) y el Califato de Córdoba conectan directamente la Edad de Oro islámica con la historia medieval española.' },
    { url: '/visualizador-historia/las-cruzadas/', icon: '✝️', name: 'Las Cruzadas', description: 'Las Cruzadas son el punto de fricción entre la civilización islámica y la cristiana: la Primera Cruzada (1096) responde a la expansión turco-selyúcida y la toma de Jerusalén, y durante dos siglos el Mediterráneo es el campo de batalla compartido.' },
    { url: '/visualizador-historia/historia-oriente-medio/', icon: '🌍', name: 'Historia de Oriente Medio', description: 'El Islam clásico es el fundamento de Oriente Medio moderno: el Califato Abasí de Bagdad es el antecedente directo de Irak, y la fractura suní-chií (desde la batalla de Kerbala en 680) sigue estructurando la geopolítica actual.' },
    { url: '/visualizador-historia/mongol/', icon: '🐎', name: 'El Imperio Mongol', description: 'Los mongoles pusieron fin al Islam clásico: el saqueo de Bagdad por Hulagu (1258) destruyó la Casa de la Sabiduría y mató al último califa abasí, cerrando la Edad de Oro islámica con una de las mayores destrucciones culturales de la historia.' },
  ],
  'visualizador-historia-historia-portugal-ultramar': [
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'Portugal y España se repartieron el mundo: el Tratado de Tordesillas (1494) dividió el Atlántico entre las dos potencias ibéricas, dando a Portugal Brasil y la ruta a Asia mientras España se quedaba con el resto de América.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'Portugal fue el iniciador de la Era de las Exploraciones: el Infante Enrique el Navegante, Bartolomeu Dias y Vasco de Gama establecieron las técnicas cartográficas y de navegación que luego adoptaron todas las potencias europeas.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Brasil es el legado más duradero de Portugal en el mundo: la independencia de 1822 con Pedro I crea el mayor país lusófono, y la influencia portuguesa en Brasil va desde el idioma hasta las instituciones jurídicas y la cultura colonial.' },
    { url: '/visualizador-historia/espana-austrias/', icon: '⚜️', name: 'La España de los Austrias', description: 'Portugal y España vivieron juntos bajo la Unión Ibérica (1580-1640): Felipe II heredó Portugal tras la derrota de Alcazarquivir, uniendo las dos mayores potencias coloniales del mundo durante 60 años que marcaron la historia de ambos imperios.' },
    { url: '/visualizador-historia/reino-kongo/', icon: '👑', name: 'Reino del Kongo', description: 'El Kongo fue el contacto africano más singular de Portugal: la llegada de Diogo Cão (1483), la conversión cristiana de su corte y la fundación de Luanda (1576) entrelazaron al reino con el imperio ultramarino portugués durante más de cuatro siglos, hasta su absorción en la Angola colonial.' },
  ],

  // EJE A: Pensamiento Político, Constituciones, Derecho y Ética — (2026-05-05)
  'visualizador-historia-historia-pensamiento-politico': [
    { url: '/visualizador-historia/historia-etica/', icon: '🤔', name: 'Historia de la Ética', description: 'Filosofía política y ética son inseparables: de Aristóteles a Rawls, las grandes tradiciones morales (estoicismo, kantismo, utilitarismo) tienen siempre una dimensión política que alimenta y es alimentada por el pensamiento sobre el poder.' },
    { url: '/visualizador-historia/historia-constituciones/', icon: '⚖️', name: 'Historia de las Constituciones y la Democracia', description: 'Las ideas de Locke, Rousseau y Montesquieu no se quedaron en papel: se convirtieron en las constituciones americana (1787) y francesa (1789) que transformaron el mundo real y el pensamiento político en acción histórica.' },
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'La Ilustración es el momento en que el pensamiento político produce sus frutos más prácticos: de Montesquieu, Voltaire y Diderot directamente a las revoluciones americana y francesa que reconfiguran el mundo occidental.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'Economía política y filosofía política son dos caras de la misma moneda: Adam Smith, Marx y Keynes son a la vez economistas y filósofos políticos, y sus ideas moldean tanto el pensamiento como las políticas reales.' },
  ],
  'visualizador-historia-historia-constituciones': [
    { url: '/visualizador-historia/historia-pensamiento-politico/', icon: '📜', name: 'Historia del Pensamiento Político', description: 'Las constituciones no nacen de la nada: detrás de cada gran texto constitucional hay una teoría política, de Locke al constitucionalismo americano, de Rousseau a la Declaración de 1789. Las ideas preceden siempre a las instituciones.' },
    { url: '/visualizador-historia/historia-derecho/', icon: '🏛️', name: 'Historia del Derecho', description: 'La constitución es la cima del ordenamiento jurídico: la historia del derecho y la del constitucionalismo avanzan juntas, del ius natural de Grocio al Estado de derecho constitucional contemporáneo y los derechos fundamentales.' },
    { url: '/visualizador-historia/historia-derechos-humanos/', icon: '✊', name: 'Historia de los Derechos Humanos', description: 'Los derechos humanos son el contenido material de las constituciones modernas: sin la Declaración Universal de 1948 y el Convenio Europeo de 1950, el constitucionalismo del siglo XX es incomprensible.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'La Unión Europea', description: 'La UE es el mayor experimento de constitucionalismo supranacional de la historia: desde el Tratado de Roma hasta la Carta de Derechos Fundamentales, Europa ha creado un orden constitucional sin Estado federal.' },
  ],
  'visualizador-historia-historia-derecho': [
    { url: '/visualizador-historia/historia-constituciones/', icon: '⚖️', name: 'Historia de las Constituciones y la Democracia', description: 'Constitución y derecho ordinario forman una pirámide normativa: la historia del constitucionalismo y la del derecho privado son el anverso y el reverso del mismo proceso de racionalización jurídica de las sociedades modernas.' },
    { url: '/visualizador-historia/roma/', icon: '🏛️', name: 'Historia de la Antigua Roma', description: 'El Derecho Romano es la mayor herencia jurídica de Roma: las XII Tablas, el ius civile y el Corpus Iuris Civilis de Justiniano son la base del derecho civil continental europeo actual, dos mil años después.' },
    { url: '/visualizador-historia/historia-derechos-humanos/', icon: '✊', name: 'Historia de los Derechos Humanos', description: 'El derecho internacional de los derechos humanos es la gran innovación jurídica del siglo XX: de Núremberg a la Corte Penal Internacional, el derecho se transforma de instrumento de poder en escudo del ciudadano.' },
    { url: '/visualizador-historia/historia-pensamiento-politico/', icon: '📜', name: 'Historia del Pensamiento Político', description: 'Derecho y poder son inseparables: Hobbes y Locke teorizan el Estado; el Código Napoleónico lo organiza jurídicamente. La filosofía política y la filosofía del derecho son disciplinas hermanas desde los griegos.' },
  ],
  'visualizador-historia-historia-etica': [
    { url: '/visualizador-historia/historia-pensamiento-politico/', icon: '📜', name: 'Historia del Pensamiento Político', description: 'Ética y política son inseparables: de Aristóteles a Rawls, la reflexión moral sobre cómo debemos vivir incluye siempre la pregunta sobre cómo debemos organizarnos políticamente y qué hace justo a un sistema de gobierno.' },
    { url: '/visualizador-historia/historia-derecho/', icon: '🏛️', name: 'Historia del Derecho', description: 'El derecho positivo tiene siempre una base ética: el iusnaturalismo, los derechos humanos y la bioética muestran que la ética no es solo teoría sino el fundamento del orden jurídico de las sociedades democráticas.' },
    { url: '/visualizador-historia/psicologia/', icon: '🧠', name: 'Historia de la Psicología', description: 'Ética y psicología convergen en el siglo XX: el desarrollo moral de Kohlberg, los sesgos cognitivos de Kahneman y la psicología moral de Jonathan Haidt iluminan cómo los humanos razonan y actúan moralmente en la realidad.' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la Inteligencia Artificial', description: 'La ética de la IA es el gran desafío filosófico del siglo XXI: alineación de valores, responsabilidad algorítmica y autonomía de las máquinas replantean preguntas kantianas y utilitaristas en el contexto de los sistemas digitales.' },
  ],

  // EJE B: Capitalismo, Comercio, Trabajo y Agricultura — (2026-05-05)
  'visualizador-historia-historia-capitalismo': [
    { url: '/visualizador-historia/historia-comercio/', icon: '🌍', name: 'Historia del Comercio Mundial', description: 'Capitalismo y comercio han sido inseparables desde el mercantilismo: las Compañías de Indias, el libre comercio victoriano y la globalización financiera son tanto historia del capital como del intercambio mundial.' },
    { url: '/visualizador-historia/historia-trabajo/', icon: '🔨', name: 'Historia del Trabajo', description: 'Trabajo y capital son los dos polos del capitalismo: cada transformación del sistema económico (industrialización, neoliberalismo, gig economy) tiene su contrapartida directa en la historia del trabajo.' },
    { url: '/visualizador-historia/historia-pensamiento-politico/', icon: '📜', name: 'Historia del Pensamiento Político', description: 'Adam Smith, Marx, Keynes, Hayek y Piketty son también filósofos políticos que debatieron sobre poder, distribución y el papel del Estado: no hay historia del capitalismo sin historia del pensamiento que lo creó o cuestionó.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'El capitalismo genera la economía mundial: la Revolución Industrial, las crisis de 1929 y 2008 y la globalización son capítulos que se narran desde ambas cronologías y que se explican mejor juntas.' },
  ],
  'visualizador-historia-historia-comercio': [
    { url: '/visualizador-historia/historia-capitalismo/', icon: '📈', name: 'Historia del Capitalismo', description: 'El capitalismo y el comercio han sido inseparables desde el mercantilismo: las Compañías de Indias, el libre comercio victoriano y la globalización son tanto historia del capital como del intercambio mundial.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'La Era de las Exploraciones y el comercio mundial son una misma historia: Vasco de Gama, Colón y Magallanes buscaban rutas comerciales, y cada descubrimiento geográfico abría nuevos mercados y flujos de intercambio.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'La Conquista de América', description: 'La conquista de América fue ante todo una empresa comercial: la búsqueda de especias, oro y plata reconfiguró los flujos comerciales mundiales y creó el primer mercado verdaderamente global en el siglo XVI.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'La historia del comercio es la historia de la economía mundial vista desde los flujos de bienes: la Ruta de la Seda, las Compañías de Indias y la OMC son los pilares del sistema económico global.' },
  ],
  'visualizador-historia-historia-trabajo': [
    { url: '/visualizador-historia/historia-capitalismo/', icon: '📈', name: 'Historia del Capitalismo', description: 'Trabajo y capital son los dos polos del capitalismo: cada transformación del sistema económico —industrialización, neoliberalismo, gig economy— tiene su contrapartida en la historia del trabajo y los derechos laborales.' },
    { url: '/visualizador-historia/historia-derechos-humanos/', icon: '✊', name: 'Historia de los Derechos Humanos', description: 'Los derechos laborales son una extensión de los derechos humanos: la jornada de 8 horas, la prohibición del trabajo infantil y la libertad sindical son conquistas del mismo impulso emancipador que los derechos civiles y políticos.' },
    { url: '/visualizador-historia/historia-agricultura/', icon: '🌾', name: 'Historia de la Agricultura', description: 'La agricultura es el primer trabajo humano y el primero en transformarse por la tecnología. El éxodo rural provocado por la mecanización agrícola en los siglos XIX y XX crea la clase obrera industrial.' },
    { url: '/visualizador-historia/historia-pensamiento-politico/', icon: '📜', name: 'Historia del Pensamiento Político', description: 'Marx, Proudhon y Bakunin son tanto teóricos del trabajo como del poder político: la cuestión obrera es el motor ideológico del siglo XIX y XX, y el pensamiento político moderno no se entiende sin ella.' },
  ],
  'visualizador-historia-historia-agricultura': [
    { url: '/visualizador-historia/historia-comercio/', icon: '🌍', name: 'Historia del Comercio Mundial', description: 'Agricultura y comercio nacieron juntos: los primeros mercados de Mesopotamia intercambiaban excedentes agrícolas. La Ruta de la Seda transportaba especias. El comercio global hoy depende de cadenas agroalimentarias que conectan el campo con supermercados de todo el mundo.' },
    { url: '/visualizador-historia/historia-trabajo/', icon: '🔨', name: 'Historia del Trabajo', description: 'La agricultura es el primer trabajo humano: de la azada a la cosechadora en 12.000 años. El éxodo rural provocado por la mecanización agrícola es el mayor movimiento de trabajadores de la historia y el origen de la clase obrera industrial.' },
    { url: '/visualizador-historia/historia-capitalismo/', icon: '📈', name: 'Historia del Capitalismo', description: 'El capitalismo agrario (enclosures, plantaciones coloniales, agroindustria) es una fase específica del capitalismo: la tierra como mercancía y el alimento como producto financiero son la aplicación del capital al campo.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'La soberanía alimentaria y los precios agrícolas son variables macroeconómicas clave: los alimentos representan el 10% del PIB global y las crisis de precios agrícolas de 1973 y 2008 desencadenaron crisis políticas en todo el mundo.' },
  ],

  // EJE C: Educación, Ocio y Turismo — Roadmap v12 (2026-05-05)
  'visualizador-historia-historia-educacion': [
    { url: '/visualizador-historia/historia-pensamiento-politico/', icon: '📜', name: 'Historia del Pensamiento Político', description: 'Educación y filosofía política son inseparables: Platón fundó la Academia para crear gobernantes filósofos; Rousseau y los ilustrados hicieron de la educación universal la base de la ciudadanía democrática; Dewey convirtió la escuela en el laboratorio de la democracia.' },
    { url: '/visualizador-historia/historia-constituciones/', icon: '⚖️', name: 'Historia de las Constituciones y la Democracia', description: 'La educación pública es una conquista constitucional del siglo XIX y XX: el derecho a la educación aparece en las constituciones liberales y se consolida en la DUDH de 1948 y los pactos internacionales de derechos económicos, sociales y culturales.' },
    { url: '/visualizador-historia/historia-islam-clasico/', icon: '🌙', name: 'El Islam Clásico', description: 'Las madrasas islámicas del siglo IX y la Casa de la Sabiduría de Bagdad preservaron y transmitieron el saber clásico greco-romano durante la Edad Media: la universidad europea debe mucho a este modelo educativo islámico.' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet transformó la educación más que cualquier tecnología anterior: los MOOCs de Coursera (2012), Khan Academy, Wikipedia y ahora la IA generativa replantean qué es aprender, quién puede hacerlo y cuánto cuesta.' },
  ],
  'visualizador-historia-historia-ocio': [
    { url: '/visualizador-historia/historia-trabajo/', icon: '🔨', name: 'Historia del Trabajo', description: 'El ocio moderno nació como conquista del movimiento obrero: las vacaciones pagadas (Francia 1936), la jornada de 8 horas y el fin de semana son derechos laborales que crearon el tiempo libre para las clases trabajadoras por primera vez en la historia.' },
    { url: '/visualizador-historia/historia-turismo/', icon: '✈️', name: 'Historia del Turismo', description: 'El turismo es la institucionalización del ocio: el Grand Tour aristocrático (siglo XVII), el turismo de Thomas Cook (1841) y el turismo de masas de posguerra son etapas del mismo proceso de convertir el viaje en ocio organizado.' },
    { url: '/visualizador-historia/historia-musica-popular/', icon: '🎵', name: 'Historia de la Música Popular', description: 'La música popular es el contenido central del ocio del siglo XX: el jazz, el rock, el pop y el hip-hop son géneros que nacieron para el entretenimiento masivo y definen épocas enteras de la historia cultural.' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet reinventó el ocio: YouTube, Netflix, Spotify, los videojuegos online y TikTok son formas de entretenimiento que no existían hace 30 años y que hoy ocupan más tiempo de ocio que la televisión o el cine.' },
  ],
  'visualizador-historia-historia-turismo': [
    { url: '/visualizador-historia/historia-ocio/', icon: '🎭', name: 'Historia del Ocio', description: 'El turismo es el ocio aplicado al viaje: la democratización del tiempo libre en el siglo XX es la misma fuerza que convirtió el viaje de privilegio aristocrático en fenómeno de masas con 1.400 millones de turistas internacionales al año.' },
    { url: '/visualizador-historia/historia-trabajo/', icon: '🔨', name: 'Historia del Trabajo', description: 'El turismo de masas fue posible gracias a las vacaciones pagadas: sin el Frente Popular francés (1936) y las leyes laborales del siglo XX, los trabajadores no habrían tenido ni el tiempo ni el dinero para convertirse en turistas.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'El Grand Tour del siglo XVII hereda el espíritu explorador de los viajeros renacentistas: el viaje como formación, como curiosidad y como experiencia transformadora es una continuación secularizada de la era de los descubrimientos geográficos.' },
    { url: '/visualizador-historia/historia-capitalismo/', icon: '📈', name: 'Historia del Capitalismo', description: 'El turismo es la mayor industria de servicios del capitalismo global: Airbnb, Booking, los fondos de inversión hoteleros y el overtourism son capítulos del capitalismo financiero aplicados al deseo humano de viajar.' },
  ],

  // Roadmap v13 EJE B1 — Naciones pendientes Europa (2026-05-08)
  'visualizador-historia-escandinavia': [
    { url: '/visualizador-historia/historia-vikingos/', icon: '⚔️', name: 'Historia de los Vikingos', description: 'La era vikinga (793-1066) es el punto de partida de la historia escandinava: las expediciones nórdicas, los asentamientos en Islandia, Groenlandia y Vinland y los reinos vikingos de Cnut el Grande son la base sobre la que se forjaron Suecia, Noruega y Dinamarca.' },
    { url: '/visualizador-historia/historia-reino-unido/', icon: '🇬🇧', name: 'Historia del Reino Unido', description: 'La conexión vikinga-anglosajona es central: las incursiones de Lindisfarne, el Danelaw, el imperio de Cnut sobre Inglaterra, Dinamarca y Noruega y las dinastías nórdicas marcaron siglos de historia compartida entre Escandinavia y las Islas Británicas.' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '⚔️', name: 'Segunda Guerra Mundial', description: 'La Segunda Guerra Mundial dividió a Escandinavia: Dinamarca y Noruega fueron ocupadas por la Alemania nazi (1940-1945), Suecia mantuvo la neutralidad y la Resistencia danesa logró rescatar a la práctica totalidad de la población judía en 1943.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'Historia de la Unión Europea', description: 'La integración europea de Escandinavia ha sido tardía y selectiva: Dinamarca ingresó en 1973, Suecia y Finlandia en 1995, Noruega rechazó la adhesión en dos referéndums; tras la guerra de Ucrania, Suecia y Finlandia ingresaron en la OTAN abandonando décadas de neutralidad.' },
  ],
  'visualizador-historia-paises-bajos': [
    { url: '/visualizador-historia/espana-austrias/', icon: '👑', name: 'España de los Austrias', description: 'La Guerra de los Ochenta Años (1568-1648) entre las Provincias Unidas y la monarquía hispánica de Felipe II y sus sucesores marcó el destino de los Países Bajos: la Unión de Utrecht (1579) y la Paz de Westfalia (1648) reconocieron la independencia neerlandesa frente al imperio español.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'La Compañía Neerlandesa de las Indias Orientales (VOC, 1602) fue la primera multinacional moderna y la primera empresa cotizada en bolsa: convirtió a los Países Bajos en la mayor potencia comercial del siglo XVII y conectó Europa, Asia, África y América.' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '⚔️', name: 'Segunda Guerra Mundial', description: 'La invasión nazi de los Países Bajos (mayo de 1940) y la deportación de la mayoría de la población judía neerlandesa al Holocausto, junto al testimonio de Ana Frank, son capítulos centrales de la Segunda Guerra Mundial en Europa Occidental.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'Historia de la Unión Europea', description: 'Los Países Bajos son uno de los seis países fundadores del proyecto europeo: firmaron el Tratado de Roma (1957) y han sido protagonistas en cada hito de la integración, desde el Tratado de Maastricht (1992) firmado en suelo neerlandés hasta el euro y la ampliación al Este.' },
  ],
  'visualizador-historia-polonia': [
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '⚔️', name: 'Segunda Guerra Mundial', description: 'Polonia fue el primer país invadido en la Segunda Guerra Mundial (1 de septiembre de 1939) por la Alemania nazi y la URSS según el Pacto Molotov-Ribbentrop. Auschwitz, los guetos, el Levantamiento del Gueto de Varsovia (1943) y el Levantamiento de Varsovia (1944) marcaron el conflicto.' },
    { url: '/visualizador-historia/historia-rusia/', icon: '🇷🇺', name: 'Historia de Rusia', description: 'Las relaciones polaco-rusas atraviesan toda la historia moderna: las particiones del siglo XVIII liquidaron el Estado polaco con participación rusa, la insurrección de 1863 fue reprimida por el Imperio Zarista y el período 1945-1989 transcurrió bajo la órbita soviética.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'Polonia fue protagonista del fin de la Guerra Fría: el sindicato Solidaridad de Lech Walesa (1980), la ley marcial del general Jaruzelski (1981-1983) y las elecciones semilibres de junio de 1989 abrieron el proceso de caída del bloque comunista en Europa del Este.' },
    { url: '/visualizador-historia/historia-union-europea/', icon: '🇪🇺', name: 'Historia de la Unión Europea', description: 'El ingreso de Polonia en la UE en 2004 fue parte de la mayor ampliación europea de la historia (10 países simultáneamente). Polonia es hoy una de las mayores economías de la UE y receptora neta de fondos estructurales para el desarrollo de Europa del Este.' },
  ],

  // Roadmap v13 EJE B2 — Naciones pendientes Asia-Pacífico (2026-05-08)
  'visualizador-historia-corea': [
    { url: '/visualizador-historia/japon/', icon: '🗾', name: 'Historia de Japón', description: 'Japón y Corea comparten siglos de intercambio cultural —el budismo, la escritura china y la cerámica llegaron a Japón desde la Península Coreana— seguidos de la colonización japonesa de Corea (1910-1945), que marca una de las relaciones históricas más tensas de Asia Oriental.' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '⚔️', name: 'Segunda Guerra Mundial', description: 'La Segunda Guerra Mundial determinó el destino de Corea: la derrota de Japón en 1945 liberó la península pero la dividió en dos zonas de ocupación (URSS al norte, EEUU al sur), origen directo de la división que persiste hasta hoy.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'La Guerra de Corea (1950-1953) fue el primer conflicto armado de la Guerra Fría: enfrentó a EEUU y la ONU contra Corea del Norte apoyada por China y la URSS, y acabó en armisticio sin tratado de paz, dejando la península técnicamente en guerra.' },
    { url: '/visualizador-historia/historia-china-moderna/', icon: '🇨🇳', name: 'Historia de la China Moderna', description: 'China e intervino decisivamente en la Guerra de Corea (1950), enviando cientos de miles de voluntarios del Ejército Popular de Liberación. La influencia china sobre la Península Coreana es milenaria: la escritura china, el confucianismo y el sistema de gobierno llegaron a Corea a través de China.' },
  ],
  'visualizador-historia-australia': [
    { url: '/visualizador-historia/nueva-zelanda/', icon: '🥝', name: 'Historia de Nueva Zelanda (Aotearoa)', description: 'Australia y Nueva Zelanda son las dos naciones del Pacífico nacidas de la colonización británica: comparten el cuerpo ANZAC en Gallipoli (1915), la pertenencia al Commonwealth y el reto de reconciliarse con sus pueblos originarios (aborígenes y maoríes).' },
    { url: '/visualizador-historia/pueblos-pacifico/', icon: '🌊', name: 'Los Pueblos del Pacífico', description: 'Australia y la Polinesia representan dos poblamientos distintos de Oceanía: los aborígenes llegaron hace más de 50.000 años por el antiguo continente de Sahul, mientras los navegantes polinesios colonizaron las islas remotas del Pacífico apenas en los últimos tres milenios.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'Australia fue el último continente habitado descubierto por los europeos: Janszoon (1606), Tasman (1642) y finalmente Cook (1770) completaron el mapa del Pacífico, cerrando la era de las grandes exploraciones geográficas iniciada en el siglo XV.' },
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '⚔️', name: 'Primera Guerra Mundial', description: 'Los ANZAC (Australia and New Zealand Army Corps) en Gallipoli (1915) se convirtieron en el mito fundador de la identidad australiana: la derrota en los Dardanelos frente al Imperio Otomano forjó la noción de nación con un precio enorme en vidas.' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '⚔️', name: 'Segunda Guerra Mundial', description: 'Australia fue la primera nación anglosajona amenazada directamente por Japón: el bombardeo de Darwin (19 febrero 1942) y la caída de Singapur impactaron profundamente en la sociedad australiana y aceleraron el giro estratégico hacia EEUU y el Pacífico.' },
    { url: '/visualizador-historia/historia-reino-unido/', icon: '🇬🇧', name: 'Historia del Reino Unido', description: 'Australia fue colonia y luego Dominio de la Corona Británica: el sistema legal, parlamentario y cultural australiano es herencia directa británica; la bandera australiana incluye la Union Jack y el Monarca británico es Jefe de Estado, aunque el debate sobre la república sigue abierto.' },
  ],
  'visualizador-historia-sudeste-asiatico': [
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'El Sudeste Asiático fue el destino central de las grandes exploraciones europeas: las especias de las Molucas (clavo, nuez moscada, pimienta) motivaron los viajes de Vasco de Gama, Magallanes y la fundación de la VOC neerlandesa, que convirtió la región en el eje del comercio global del siglo XVII.' },
    { url: '/visualizador-historia/segunda-guerra-mundial/', icon: '⚔️', name: 'Segunda Guerra Mundial', description: 'Japón ocupó todo el Sudeste Asiático entre 1941 y 1945 bajo el eslogan de la "Esfera de Coprosperidad de Gran Asia Oriental": desmanteló el poder colonial europeo, pero sus métodos de ocupación aceleraron los movimientos independentistas que culminaron tras 1945.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'El Sudeste Asiático fue uno de los escenarios más calientes de la Guerra Fría: la Guerra de Vietnam (1955-1975), el conflicto de Corea, los golpes comunistas en Laos y Camboya y el genocidio de Pol Pot fueron consecuencia directa de la competencia entre bloques.' },
    { url: '/visualizador-historia/historia-india/', icon: '🇮🇳', name: 'Historia de la India', description: 'La cultura india penetró el Sudeste Asiático durante más de mil años: el hinduismo, el budismo, el sánscrito y la arquitectura (Angkor Wat es un templo hindú) llegaron a través del comercio marítimo del Océano Índico, creando una zona de influencia que los historiadores llaman "India Mayor".' },
  ],

  // Roadmap — África y Oceanía precolonial (2026-06-24)
  'visualizador-historia-imperios-africa-occidental': [
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia Contemporánea de África', description: 'Donde terminan los imperios sahelianos empieza el África colonial: las fronteras que la Conferencia de Berlín (1884) trazó sobre Mali, Songhai y el Sahel ignoraron por completo estos antiguos Estados, y los manuscritos de Tombuctú siguen siendo símbolo del pasado precolonial del continente.' },
    { url: '/visualizador-historia/gran-zimbabue/', icon: '🪨', name: 'Gran Zimbabue y la Costa Swahili', description: 'Los dos grandes polos del comercio africano medieval: mientras el oro del Sahel fluía al norte por el Sáhara hacia el Mediterráneo, el oro de Gran Zimbabue salía al este por la costa swahili hacia el océano Índico. Dos redes comerciales africanas que enriquecieron a Eurasia.' },
    { url: '/visualizador-historia/etiopia-aksum/', icon: '🦁', name: 'Historia de Etiopía', description: 'Los tres grandes focos del África medieval no europea: el Sahel islámico del oro, la Etiopía cristiana de las montañas y la costa swahili del Índico desarrollaron Estados, escritura y arquitectura monumental siglos antes de la colonización europea.' },
    { url: '/visualizador-historia/historia-islam-clasico/', icon: '☪️', name: 'Historia del Islam Clásico', description: 'El islam transformó África Occidental a través del comercio transahariano: Mali y Songhai adoptaron el islam como religión de Estado, Tombuctú se convirtió en un centro intelectual islámico de primer orden y la peregrinación de Mansa Musa a La Meca (1324) conectó el Sahel con el corazón del mundo musulmán.' },
    { url: '/visualizador-historia/reino-benin/', icon: '🛡️', name: 'Reino de Benín (Edo)', description: 'Mientras los imperios sahelianos prosperaban en la sabana del oro y la sal, Benín representaba el gran Estado de la franja forestal de África Occidental: un reino amurallado volcado a la costa atlántica, con un arte cortesano de bronce que es hoy emblema del pasado precolonial africano.' },
  ],
  'visualizador-historia-etiopia-aksum': [
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia Contemporánea de África', description: 'Etiopía es la gran excepción del África colonial: mientras la Conferencia de Berlín repartía todo el continente, la victoria de Adwa (1896) mantuvo la independencia etíope. Solo la ocupación fascista italiana (1936-1941) interrumpió brevemente su soberanía milenaria.' },
    { url: '/visualizador-historia/imperios-africa-occidental/', icon: '🏅', name: 'Imperios de África Occidental', description: 'Etiopía cristiana y el Sahel islámico son las dos grandes civilizaciones africanas medievales con escritura propia y Estados centralizados: la una mirando al mar Rojo y el cristianismo copto, la otra al Sáhara y el islam, ambas anteriores a la colonización europea.' },
    { url: '/visualizador-historia/historia-bizancio/', icon: '⛪', name: 'Historia de Bizancio', description: 'Aksum y Bizancio fueron aliados comerciales y religiosos: ambos reinos cristianos del Mediterráneo oriental cooperaron contra la Persia sasánida, compartieron rutas del mar Rojo y la Iglesia etíope Tewahedo nació en la órbita del cristianismo oriental.' },
    { url: '/visualizador-historia/gran-zimbabue/', icon: '🪨', name: 'Gran Zimbabue y la Costa Swahili', description: 'El cuerno de África y la costa swahili formaban parte de la misma red comercial del océano Índico: Aksum, las ciudades swahili y los puertos del mar Rojo conectaron el interior africano con Arabia, India y China a través del comercio monzónico.' },
  ],
  'visualizador-historia-gran-zimbabue': [
    { url: '/visualizador-historia/imperios-africa-occidental/', icon: '🏅', name: 'Imperios de África Occidental', description: 'Los dos grandes complejos auríferos del África medieval: el oro de Gran Zimbabue y Mutapa salía por la costa swahili hacia el Índico, mientras el del Sahel (Ghana, Mali, Songhai) cruzaba el Sáhara hacia el Mediterráneo. Ambos refutan el mito colonial de un África "sin historia".' },
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia Contemporánea de África', description: 'Las ruinas de Gran Zimbabue dieron nombre al Zimbabue moderno y se convirtieron en símbolo nacional: el África precolonial de la piedra y el oro es el orgulloso contrapunto al período colonial que la Conferencia de Berlín inauguró en el continente.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'La llegada de Vasco da Gama al océano Índico (1498) irrumpió en la próspera red comercial swahili: los portugueses bombardearon Kilwa y Mombasa y construyeron el Fuerte Jesús, desviando hacia Europa el comercio del oro, el marfil y las especias del Índico.' },
    { url: '/visualizador-historia/historia-india/', icon: '🇮🇳', name: 'Historia de la India', description: 'La costa swahili era el extremo africano del comercio monzónico del océano Índico: textiles indios, porcelana china y perlas del Golfo se intercambiaban por oro, marfil y esclavos africanos en una red mercantil que unía tres continentes mucho antes de la llegada europea.' },
  ],
  'visualizador-historia-reino-kongo': [
    { url: '/visualizador-historia/historia-portugal-ultramar/', icon: '⛵', name: 'Historia de Portugal de Ultramar', description: 'El Reino del Kongo fue uno de los primeros y más complejos contactos de Portugal en el África atlántica: de la llegada de Diogo Cão (1483) y la alianza cristiana con Afonso I a la fundación de Luanda (1576) y la posterior absorción en la Angola portuguesa, el Kongo y el imperio ultramarino portugués estuvieron entrelazados durante más de cuatro siglos.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'El Kongo fue uno de los grandes orígenes de la trata atlántica: cientos de miles de personas esclavizadas embarcadas en la costa centroafricana fueron llevadas a Brasil y el Caribe, donde su cultura dejó una huella profunda. Las cartas de Afonso I a la corona portuguesa son uno de los primeros testimonios africanos documentados contra ese comercio.' },
    { url: '/visualizador-historia/imperios-africa-occidental/', icon: '🏅', name: 'Imperios de África Occidental', description: 'Kongo y los imperios del Sahel muestran dos modelos de Estado africano precolonial: el saheliano, articulado en torno al islam y el comercio transahariano, y el kongo, centralizado en torno al manikongo y volcado hacia el Atlántico tras el contacto portugués. Ambos refutan el mito de un África "sin historia".' },
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia Contemporánea de África', description: 'La trayectoria del Kongo desemboca en el África colonial: su territorio quedó repartido entre la Angola portuguesa, el Congo francés y el Estado Libre del Congo de Leopoldo II tras la Conferencia de Berlín (1884), una fragmentación que ignoró por completo la antigua unidad del reino.' },
  ],
  'visualizador-historia-reino-benin': [
    { url: '/visualizador-historia/imperio-oyo/', icon: '🐎', name: 'Imperio de Oyó y los Estados Yoruba', description: 'Benín y el mundo yoruba comparten un origen mítico común: la tradición vincula la dinastía de los obas de Benín con Ifé a través del príncipe Oranmiyan. Vecinos en el sur de la actual Nigeria, ambos desarrollaron un arte cortesano de bronce y latón de fama mundial.' },
    { url: '/visualizador-historia/historia-portugal-ultramar/', icon: '⛵', name: 'Historia de Portugal de Ultramar', description: 'El contacto portugués con Benín (João Afonso de Aveiro, 1485) abrió un comercio temprano de pimienta, marfil, telas y personas esclavizadas. Benín controló estrechamente ese comercio desde su corte, en una relación con los europeos muy distinta de la que tuvieron otros Estados de la costa.' },
    { url: '/visualizador-historia/imperios-africa-occidental/', icon: '🏅', name: 'Imperios de África Occidental', description: 'Frente a los grandes imperios sahelianos de la sabana (Ghana, Mali, Songhai), Benín representa el Estado de la franja forestal de África Occidental: un reino centralizado y amurallado cuya riqueza no dependía del comercio transahariano sino del control de la costa atlántica.' },
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia Contemporánea de África', description: 'La expedición punitiva británica de 1897 contra Benín ejemplifica la conquista colonial de África: el destierro del oba, la anexión a Nigeria y el expolio de los Bronces de Benín siguen vivos hoy en el debate internacional sobre la restitución del patrimonio africano.' },
  ],
  'visualizador-historia-imperio-oyo': [
    { url: '/visualizador-historia/reino-benin/', icon: '🛡️', name: 'Reino de Benín (Edo)', description: 'Oyó/Ifé y Benín fueron los dos grandes Estados del sur de la actual Nigeria, vinculados por la tradición de Oranmiyan. Ambos desarrollaron una sofisticada metalurgia artística —las cabezas de Ifé y los Bronces de Benín— hoy reconocidas entre las cumbres del arte africano.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'El colapso de Oyó y las guerras yoruba del siglo XIX alimentaron la trata atlántica: numerosos yoruba esclavizados llegaron a Cuba y Brasil, donde su religión —los orishas— pervive en la santería y el candomblé. La cultura yoruba es una de las que más profundamente marcó la América atlántica.' },
    { url: '/visualizador-historia/imperios-africa-occidental/', icon: '🏅', name: 'Imperios de África Occidental', description: 'La caída de Oyó está ligada al islam saheliano: la yihad fulani que fundó el Califato de Sokoto desbordó hacia el sur y el emirato de Ilorin precipitó el colapso de Ọyọ-Ilé (c. 1835), conectando la historia yoruba con la dinámica de los grandes Estados islámicos del interior.' },
    { url: '/visualizador-historia/historia-africa/', icon: '🌍', name: 'Historia Contemporánea de África', description: 'Las guerras yoruba del siglo XIX terminaron con la intervención británica desde Lagos (1861) y los tratados de los años 1880-90, integrando el país yoruba en la Nigeria colonial: el final de la soberanía de Oyó es el preludio del África repartida tras la Conferencia de Berlín.' },
  ],
  'visualizador-historia-nueva-zelanda': [
    { url: '/visualizador-historia/australia/', icon: '🦘', name: 'Historia de Australia', description: 'Australia y Nueva Zelanda comparten el origen colonial británico, el cuerpo de ejército ANZAC en Gallipoli (1915) y el reto contemporáneo de reconciliarse con sus pueblos originarios (aborígenes y maoríes), aunque sus trayectorias con la población indígena han sido muy distintas.' },
    { url: '/visualizador-historia/pueblos-pacifico/', icon: '🌊', name: 'Los Pueblos del Pacífico', description: 'Los maoríes fueron la última rama de la gran expansión polinesia: las mismas piraguas dobles y técnicas de navegación que colonizaron Hawái y Rapa Nui llevaron a los polinesios a Aotearoa hacia 1250, cerrando la mayor colonización marítima de la historia.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'Abel Tasman (1642) y James Cook (1769) pusieron Nueva Zelanda en el mapa europeo: los tres viajes de Cook por el Pacífico cartografiaron la costa neozelandesa y abrieron la puerta a balleneros, misioneros y, finalmente, a la colonización británica.' },
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '⚔️', name: 'Primera Guerra Mundial', description: 'Los ANZAC (Australia and New Zealand Army Corps) en Gallipoli (1915) forjaron la identidad nacional neozelandesa: la derrota frente al Imperio Otomano en los Dardanelos tuvo un coste enorme y se conmemora cada 25 de abril como el Día de ANZAC.' },
  ],
  'visualizador-historia-pueblos-pacifico': [
    { url: '/visualizador-historia/nueva-zelanda/', icon: '🥝', name: 'Historia de Nueva Zelanda (Aotearoa)', description: 'Nueva Zelanda fue el último vértice del triángulo polinesio en ser colonizado (~1250): la historia maorí de Aotearoa es el capítulo final y mejor documentado de la gran expansión polinesia que cubrió todo el Pacífico.' },
    { url: '/visualizador-historia/australia/', icon: '🦘', name: 'Historia de Australia', description: 'Australia y el mundo polinesio representan dos poblamientos distintos del Pacífico: los aborígenes australianos llegaron hace más de 50.000 años por Sahul, mientras los polinesios colonizaron las islas remotas del océano apenas en los últimos tres milenios mediante navegación de altura.' },
    { url: '/visualizador-historia/exploracion/', icon: '🧭', name: 'La Era de las Exploraciones', description: 'El Pacífico fue el último gran espacio explorado por los europeos: de Magallanes (1521) a los tres viajes de James Cook (1768-1779), los navegantes europeos cartografiaron un océano que los polinesios ya habían dominado y poblado siglos antes.' },
    { url: '/visualizador-historia/historia-prehistoria/', icon: '🦴', name: 'Prehistoria', description: 'La expansión austronesia desde Taiwán y el Sudeste Asiático fue una de las grandes migraciones humanas de la prehistoria reciente: el mismo impulso colonizador que pobló el planeta llevó a los pueblos del mar a alcanzar las islas más remotas del Pacífico.' },
  ],

  // Roadmap v14 — Cronologías LATAM (2026-05-08)
  'visualizador-historia-argentina': [
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Argentina es el eje del Cono Sur y actor central en la historia latinoamericana: el peronismo influyó en toda la región, la dictadura de 1976-1983 participó en el Plan Cóndor junto a Chile, Uruguay y Brasil, y la crisis de 2001 marcó el debate sobre el modelo económico en toda América Latina.' },
    { url: '/visualizador-historia/chile/', icon: '🌋', name: 'Historia de Chile', description: 'Argentina y Chile comparten la Cordillera de los Andes y una historia interconectada: San Martín cruzó los Andes para liberar Chile, la guerra de la Triple Alianza y los conflictos fronterazos del siglo XIX, y el Plan Cóndor vinculó las dictaduras militares de ambos países en los años 70.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'El Proceso de Reorganización Nacional (1976-1983) fue parte de la ola de golpes anticomunistas en el Cono Sur durante la Guerra Fría. La doctrina de seguridad nacional, el Plan Cóndor de coordinación represiva y el apoyo de EEUU a los gobiernos militares fueron elementos del conflicto bipolar en América del Sur.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'Argentina protagonizó la mayor reestructuración de deuda soberana de la historia hasta entonces (2001-2005): el default de 93.000 millones de dólares, el corralito y el colapso del sistema bancario marcaron un hito en la historia económica global sobre los límites de los programas de ajuste del FMI.' },
    { url: '/visualizador-historia/paraguay/', icon: '🧉', name: 'Historia de Paraguay', description: 'Argentina formó parte de la Triple Alianza que, junto a Brasil y Uruguay, derrotó a Paraguay en la guerra de 1864-1870. Ambos países comparten la Cuenca del Plata, intensos lazos migratorios y una larga historia de relaciones económicas en el Cono Sur.' },
  ],
  'visualizador-historia-colombia': [
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Colombia es el caso más complejo de conflicto armado interno de América Latina en el siglo XX: el surgimiento de las FARC (1964), el narcotráfico, la violencia paramilitar y el proceso de paz de 2016 son capítulos centrales de la historia política latinoamericana contemporánea.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'El territorio colombiano fue el corazón de la Nueva Granada colonial: Cartagena de Indias fue el principal puerto de entrada de esclavos africanos y de salida de oro y plata, y Bogotá (Santa Fe) fue capital del Virreinato de la Nueva Granada desde 1717.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'Colombia es el mayor productor mundial de café arábica de alta calidad y el segundo de flores cortadas: la economía cafetera del siglo XX definió su estructura social y regional, y hoy el sector servicios y las exportaciones de petróleo conviven con los cultivos de coca como tensión permanente.' },
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de los EEUU', description: 'La relación Colombia-EEUU es central en la historia contemporánea: el Plan Colombia (2000), la cooperación antinarcóticos, la separación de Panamá (1903) apoyada por Roosevelt y los debates sobre extradición de narcotraficantes definen décadas de política exterior.' },
    { url: '/visualizador-historia/ecuador/', icon: '🌋', name: 'Historia de Ecuador', description: 'Colombia y Ecuador formaron parte de la Gran Colombia de Bolívar hasta su disolución en 1830. Comparten la herencia del Virreinato de la Nueva Granada y una frontera común atravesada por los conflictos del narcotráfico y la guerrilla de la región andina.' },
  ],
  'visualizador-historia-chile': [
    { url: '/visualizador-historia/argentina/', icon: '🧉', name: 'Historia de Argentina', description: 'Argentina y Chile tienen historias entrelazadas: San Martín cruzó los Andes para liberar Chile en Chacabuco (1817), y el Plan Cóndor vinculó las dictaduras militares de ambos países en los años 70. Miles de exiliados chilenos encontraron refugio en Argentina y viceversa.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'Chile fue el laboratorio de dos experimentos opuestos de la Guerra Fría: la "vía chilena al socialismo" de Allende (1970-1973) y el modelo económico neoliberal bajo el régimen militar de Pinochet, asesorado por los "Chicago Boys". El golpe del 11 de septiembre de 1973 fue seguido de cerca por ambas superpotencias.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'Chile fue el primer país de América Latina en aplicar políticas económicas neoliberales a gran escala (libre mercado, privatizaciones, sistema de pensiones privadas AFP) y en las décadas siguientes alcanzó el mayor PIB per cápita de la región, convirtiéndose en caso de estudio para instituciones como el FMI y el Banco Mundial.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'La transición democrática chilena (1990) fue un modelo para la región: la negociación entre el régimen militar y la oposición, el plebiscito de 1988 y el juicio a Pinochet en Londres (1998) marcaron hitos en los procesos de justicia transicional latinoamericanos.' },
    { url: '/visualizador-historia/bolivia/', icon: '🏔️', name: 'Historia de Bolivia', description: 'La Guerra del Pacífico (1879-1884) enfrentó a Chile con Perú y Bolivia: Chile incorporó el litoral boliviano y dejó a Bolivia sin salida al mar, una de las consecuencias territoriales más duraderas de la historia sudamericana.' },
  ],
  'visualizador-historia-peru': [
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🏛️', name: 'Civilizaciones Precolombinas', description: 'Perú es el corazón de las grandes civilizaciones precolombinas andinas: el Imperio Inca (Tawantinsuyu) con capital en Cusco fue la mayor civilización de América del Sur. Machu Picchu, el Camino Inca y el quechua como lengua viva son herencias directas que definen la identidad peruana contemporánea.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'La conquista del Imperio Inca por Francisco Pizarro (1532-1533) fue el episodio más traumático de la historia del Perú: la captura y ejecución de Atahualpa, el saqueo del Templo del Sol y la desestructuración del sistema inca son el origen directo de la sociedad colonial que precedió al Perú moderno.' },
    { url: '/visualizador-historia/chile/', icon: '🌋', name: 'Historia de Chile', description: 'La guerra del Pacífico (1879-1884) entre Perú, Bolivia y Chile marcó profundamente a ambos países: Perú perdió Tarapacá (con sus yacimientos de salitre) y la región de Arica, y Chile ocupó Lima durante dos años. Las consecuencias territoriales siguen siendo parte de la memoria histórica de los tres países.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Sendero Luminoso fue la organización armada más letal de América Latina en los años 80-90: el maoísmo de Abimael Guzmán, las masacres de comunidades andinas y la respuesta del Estado configuraron una de las crisis humanitarias más complejas de la historia latinoamericana reciente.' },
    { url: '/visualizador-historia/bolivia/', icon: '🏔️', name: 'Historia de Bolivia', description: 'Perú y Bolivia comparten raíz andina: el Alto Perú fue parte del Virreinato del Perú antes de independizarse como Bolivia, ambos formaron la Confederación Perú-Boliviana (1836-1839) y fueron aliados frente a Chile en la Guerra del Pacífico de 1879.' },
  ],
  'visualizador-historia-ecuador': [
    { url: '/visualizador-historia/colombia/', icon: '☕', name: 'Historia de Colombia', description: 'Ecuador y Colombia nacieron de la misma matriz: ambos formaron parte de la Gran Colombia de Bolívar hasta su disolución en 1830. La Real Audiencia de Quito perteneció al Virreinato de la Nueva Granada, y la frontera norte ecuatoriana sigue marcada por dinámicas compartidas como el conflicto armado y el narcotráfico de la región andina.' },
    { url: '/visualizador-historia/peru/', icon: '🦙', name: 'Historia de Perú', description: 'Ecuador y Perú mantuvieron una de las disputas fronterizas más largas de América: desde la guerra de 1941 hasta el conflicto del Alto Cenepa (1995), la delimitación amazónica no se cerró hasta el acuerdo de paz de 1998. Ambos comparten además el legado inca y la herencia de la Real Audiencia de Quito.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'El territorio ecuatoriano fue conquistado por Sebastián de Benalcázar tras la caída del Imperio inca: Quito, antigua sede norte del Tawantinsuyu, se convirtió en Real Audiencia dentro del orden colonial español que precedió a la república independiente.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Ecuador ilustra dos fenómenos clave de la región contemporánea: la dolarización de su economía en 2000 tras una grave crisis bancaria, y la oleada de inseguridad ligada al narcotráfico que ha sacudido a varios países andinos en los años 2020.' },
  ],
  'visualizador-historia-bolivia': [
    { url: '/visualizador-historia/peru/', icon: '🦙', name: 'Historia de Perú', description: 'Bolivia y Perú comparten el corazón andino: el Alto Perú fue el origen del territorio boliviano, ambos formaron la efímera Confederación Perú-Boliviana (1836-1839) y fueron aliados en la Guerra del Pacífico contra Chile (1879), conflicto en el que Bolivia perdió su salida al mar.' },
    { url: '/visualizador-historia/chile/', icon: '🌋', name: 'Historia de Chile', description: 'La Guerra del Pacífico (1879-1884) definió la relación entre Bolivia y Chile: Bolivia perdió el departamento del Litoral y con él su acceso soberano al océano, una reivindicación marítima que sigue presente en la diplomacia boliviana del siglo XXI.' },
    { url: '/visualizador-historia/paraguay/', icon: '🧉', name: 'Historia de Paraguay', description: 'Bolivia y Paraguay libraron la Guerra del Chaco (1932-1935), el mayor conflicto armado de Sudamérica en el siglo XX: una guerra devastadora por el control del Chaco Boreal que marcó profundamente a ambas sociedades y precipitó cambios políticos internos.' },
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🏛️', name: 'Civilizaciones Precolombinas', description: 'El altiplano boliviano albergó Tiwanaku, una de las grandes civilizaciones andinas anteriores a los incas, cuyo centro ceremonial junto al lago Titicaca es uno de los yacimientos arqueológicos más importantes de América del Sur.' },
  ],
  'visualizador-historia-paraguay': [
    { url: '/visualizador-historia/argentina/', icon: '🧉', name: 'Historia de Argentina', description: 'Paraguay y Argentina comparten la Cuenca del Plata y una historia entrelazada: Argentina integró la Triple Alianza (junto a Brasil y Uruguay) que derrotó a Paraguay en la guerra de 1864-1870, y ambos países mantienen profundos lazos económicos y migratorios.' },
    { url: '/visualizador-historia/bolivia/', icon: '🏔️', name: 'Historia de Bolivia', description: 'Paraguay y Bolivia se enfrentaron en la Guerra del Chaco (1932-1935) por el control del Chaco Boreal, el conflicto interestatal más sangriento de Sudamérica en el siglo XX, con consecuencias políticas duraderas en ambos países.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'El Paraguay colonial fue escenario de las reducciones jesuíticas guaraníes, un experimento social y religioso singular en la América española, y Asunción fue uno de los primeros núcleos de la colonización del Río de la Plata.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Paraguay condensa varios extremos de la historia latinoamericana: la dictadura aislacionista del Dr. Francia, una de las catástrofes demográficas más graves de la región tras la Triple Alianza, y una de las dictaduras más largas del continente, la de Stroessner (1954-1989).' },
  ],
  'visualizador-historia-cuba': [
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'Cuba fue el epicentro de la Guerra Fría en el Caribe: la crisis de los misiles de octubre de 1962 llevó al mundo al borde de un conflicto nuclear durante trece días. La política exterior cubana en Angola, Etiopía y América Central fue un capítulo central del conflicto bipolar en el Tercer Mundo.' },
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de los EEUU', description: 'La relación Cuba-EEUU es una de las más tensas de la historia hemisférica: la Enmienda Platt, el apoyo a Batista, Bahía de Cochinos (1961), las restricciones comerciales desde 1962, el deshielo Obama-Raúl Castro (2015) y el re-enfriamiento posterior son capítulos continuos de una relación sin resolver.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'La Revolución Cubana de 1959 fue el hecho político más influyente en América Latina del siglo XX: inspiró a movimientos guerrilleros en toda la región (FARC, Sendero, Tupamaros, Sandinistas), y el modelo político cubano fue referente del debate sobre el socialismo latinoamericano durante décadas.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'Cuba fue la primera gran colonia española en el Caribe: la hacienda azucarera y la esclavitud africana masiva (medio millón de esclavos importados entre 1790-1870) son el origen de la sociedad cubana actual, y la lucha por la abolición y la independencia están entrelazadas desde el siglo XIX.' },
  ],
  'visualizador-historia-venezuela': [
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Venezuela fue cuna del bolivarianismo y escenario de uno de los mayores ciclos de bonanza y crisis económica de América Latina: el boom petrolero de los años 70 la convirtió en la "Venezuela Saudita" y la crisis de Maduro generó la mayor diáspora latinoamericana de la historia reciente (más de 7 millones de personas).' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'Venezuela fue uno de los principales proveedores de petróleo a EEUU durante la Guerra Fría: la nacionalización del petróleo (1976) y la política exterior independiente de Chávez (alianza con Cuba, Rusia, Irán) desafiaron la hegemonía estadounidense en el hemisferio occidental después del fin del orden bipolar.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'Venezuela es el mayor poseedor de reservas probadas de petróleo del mundo (302.000 millones de barriles según la OPEP 2022), pero la dependencia petrolera extrema produjo la "enfermedad holandesa" y la desindustrialización. Su hundimiento económico es uno de los casos más estudiados de colapso por maldición de los recursos naturales.' },
    { url: '/visualizador-historia/cuba/', icon: '🎺', name: 'Historia de Cuba', description: 'La alianza Cuba-Venezuela fue el eje político de la izquierda latinoamericana del siglo XXI: el petróleo venezolano financiaba programas cubanos en Venezuela, y Cuba proporcionaba médicos y asesores de inteligencia. La dependencia de Cuba respecto al petróleo venezolano creó una interdependencia que marcó la política regional.' },
  ],
  'visualizador-historia-uruguay': [
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Uruguay es el caso de estado de bienestar más temprano y avanzado de América Latina: el batllismo de principios del siglo XX adelantó en décadas reformas (jornada de 8 horas, pensiones, educación laica gratuita) que otros países de la región no alcanzaron hasta mediados del siglo XX.' },
    { url: '/visualizador-historia/argentina/', icon: '🧉', name: 'Historia de Argentina', description: 'Uruguay y Argentina comparten el Río de la Plata y una historia profundamente interconectada: la rivalidad entre Montevideo y Buenos Aires en el siglo XIX, el Plan Cóndor que vinculó ambas dictaduras militares en los 70, y el Mercosur que integra sus economías son capítulos de una historia regional compartida.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'La dictadura cívico-militar uruguaya (1973-1984) y el MLN-Tupamaros son capítulos del conflicto latinoamericano durante la Guerra Fría: Uruguay tuvo el mayor número de presos políticos per cápita del mundo en los años 70. El Plan Cóndor coordinó la represión entre Uruguay, Argentina, Chile y Brasil.' },
    { url: '/visualizador-historia/chile/', icon: '🌋', name: 'Historia de Chile', description: 'Uruguay y Chile son los dos casos más estudiados de transición democrática pactada en el Cono Sur: el Pacto del Club Naval (Uruguay, 1984) y las negociaciones que llevaron al plebiscito de 1988 en Chile son modelos de transición negociada que influyeron en la ciencia política comparada.' },
  ],
  'visualizador-historia-centroamerica': [
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Las guerras civiles centroamericanas de los años 80 (Nicaragua, El Salvador, Guatemala) fueron el frente caliente más intenso de la Guerra Fría en América Latina: la intervención de EEUU, Cuba y la URSS, y los más de 300.000 muertos entre los tres conflictos, marcaron toda una generación.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'Centroamérica fue el principal escenario de la Guerra Fría en América entre 1979 y 1990: la Revolución Sandinista, los Contras financiados por EEUU (Irangate), el FMLN en El Salvador y la URNG en Guatemala fueron partes del mismo conflicto bipolar en suelo centroamericano.' },
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de los EEUU', description: 'La historia de Centroamérica no puede entenderse sin la intervención de EEUU: desde la United Fruit Company y William Walker hasta la operación PBSUCCESS en Guatemala (1954), los Contras nicaragüenses, la invasión de Panamá (1989) y la crisis migratoria actual con el Triángulo Norte.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'Centroamérica fue conquistada entre 1519 y 1540 por expediciones salidas de México y Panamá: Pedro de Alvarado en Guatemala, Gil González en Nicaragua y Pedrarias Dávila en Panamá son los conquistadores cuya violencia y las epidemias que acompañaron la conquista redujeron la población indígena entre un 80-90%.' },
  ],
  'visualizador-historia-republica-dominicana': [
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'La República Dominicana comparte la isla La Española con Haití, en una de las relaciones más complejas del Caribe: la independencia de Haití en 1804 fue la primera revolución de esclavos exitosa del mundo y definió el contexto en que surgió la República Dominicana en 1844.' },
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de los EEUU', description: 'EEUU intervino militarmente en la República Dominicana en dos ocasiones (1916-1924 y 1965): la primera estableció la Guardia Nacional que facilitó el ascenso de Trujillo, y la segunda fue la mayor intervención militar estadounidense en América Latina desde la Segunda Guerra Mundial.' },
    { url: '/visualizador-historia/centroamerica/', icon: '🌺', name: 'Historia de Centroamérica', description: 'El Caribe insular y Centroamérica comparten los patrones de la dominación colonial española, la dependencia de cultivos de exportación (azúcar, cacao, banano), la influencia de EEUU y los fenómenos migratorios masivos hacia el norte. La República Dominicana es el mayor receptor de turismo de toda esta zona geográfica.' },
    { url: '/visualizador-historia/cuba/', icon: '🎺', name: 'Historia de Cuba', description: 'Cuba y la República Dominicana comparten la historia del Caribe hispanohablante: las guerras de independencia de finales del siglo XIX, la intervención estadounidense tras 1898, el azúcar como monocultivo colonial y la diáspora hacia Nueva York y Miami son experiencias comunes de los dos países.' },
  ],
  'visualizador-historia-puerto-rico': [
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de los EEUU', description: 'Puerto Rico es territorio de EEUU desde 1898: el debate sobre su estatus (estadidad, independencia o Estado Libre Asociado) es un capítulo permanente de la política interior estadounidense. La ley PROMESA (2016), impuesta por el Congreso, y la respuesta federal al huracán María ilustran la naturaleza singular de esta relación.' },
    { url: '/visualizador-historia/cuba/', icon: '🎺', name: 'Historia de Cuba', description: 'Cuba y Puerto Rico fueron las últimas colonias españolas en América y su destino divergió en 1898: Cuba obtuvo una independencia formal (mediatizada), mientras Puerto Rico pasó directamente de España a EEUU. José Martí luchó por la independencia de ambas islas y las dos comparten la herencia caribeña hispanohablante.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'Puerto Rico fue colonizada por Juan Ponce de León en 1508: la explotación del oro, la desaparición de la población taína por enfermedades y trabajo forzado y la sustitución por esclavos africanos para las plantaciones de azúcar son el origen de la sociedad puertorriqueña que precedió a la era estadounidense.' },
    { url: '/visualizador-historia/republica-dominicana/', icon: '🌴', name: 'Historia de la República Dominicana', description: 'Puerto Rico y la República Dominicana son los dos países hispanohablantes del Caribe que comparten las dinámicas de la insularidad, la herencia colonial española, el turismo como motor económico, la diáspora hacia EEUU y la complejidad de sus relaciones con el vecino norteamericano.' },
  ],

  // Roadmap v13 EJE B3 — Naciones pendientes América (2026-05-08)
  'visualizador-historia-brasil-moderno': [
    { url: '/visualizador-historia/historia-portugal-ultramar/', icon: '⚓', name: 'Portugal y el Ultramar', description: 'La historia colonial de Brasil (1500-1822) está cubierta por esta cronología: la llegada de Cabral, el Brasil azucarero, la colonia de esclavos africanos y la llegada de la familia real portuguesa en 1808 son el origen directo del Brasil independiente que proclamó Pedro I en 1822.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Brasil es la mayor economía de América Latina y su historia entrelaza los grandes procesos regionales: independencia, caudillismo, industrialización tardía, dictaduras militares de los años 60-80 y transiciones democráticas. La cronología latinoamericana contextualiza Brasil en el conjunto regional.' },
    { url: '/visualizador-historia/historia-guerra-fria/', icon: '🧊', name: 'Historia de la Guerra Fría', description: 'El golpe militar brasileño de 1964 fue parte de la ola de golpes anticomunistas en América Latina durante la Guerra Fría, con apoyo documentado de EEUU vía Operación Brother Sam. La dictadura brasileña (1964-1985) fue el régimen más duradero del Cono Sur.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '📊', name: 'Historia de la Economía Mundial', description: 'Brasil es uno de los BRICS y la mayor economía de América Latina: el Plan Real (1994), el ciclo de materias primas (2003-2011) y el descubrimiento del petróleo pre-sal lo posicionaron como potencia emergente, aunque la recesión de 2015 y la pandemia revelaron vulnerabilidades estructurales.' },
  ],
  'visualizador-historia-mexico-moderno': [
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🏛️', name: 'Civilizaciones Precolombinas', description: 'México moderno se construyó sobre el territorio y el legado de las grandes civilizaciones mesoamericanas: olmecas, mayas, toltecas y aztecas (mexicas) forman el sustrato cultural de la identidad mexicana contemporánea, que el muralismo y la Revolución reivindicaron frente a la herencia europea.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⚔️', name: 'Historia de la Conquista de América', description: 'La caída de Tenochtitlán (1521) ante Hernán Cortés y los aliados tlaxcaltecas es el punto de inicio del México colonial que precedió al México moderno. La pérdida de la mitad del territorio ante EEUU (1848) y la Intervención Francesa son los traumas fundacionales del Estado mexicano.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'México comparte con América Latina los grandes ciclos históricos: independencia en el siglo XIX, hegemonía de partidos únicos, crisis de la deuda de los 80 y transiciones democráticas. El zapatismo (1994) y el TLCAN marcaron el debate latinoamericano sobre globalización e identidad indígena.' },
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de los EEUU', description: 'La relación con EEUU es el eje central de la historia mexicana moderna: la guerra de 1846-1848 y la pérdida del 55% del territorio, el Tratado de Guadalupe Hidalgo, el TLCAN (1994), la migración y los aranceles de Trump definen una relación asimétrica que atraviesa toda la historia contemporánea.' },
  ],
  'visualizador-historia-canada': [
    { url: '/visualizador-historia/historia-reino-unido/', icon: '🇬🇧', name: 'Historia del Reino Unido', description: 'Canadá es el resultado del dominio británico sobre la Nueva Francia: la victoria en las Llanuras de Abraham (1759), el Acta de América del Norte Británica (1867) y la lenta separación del Imperio hasta el Estatuto de Westminster (1931) y la patriación de la Constitución (1982) definen la relación con la Corona.' },
    { url: '/visualizador-historia/primera-guerra-mundial/', icon: '⚔️', name: 'Primera Guerra Mundial', description: 'La batalla de Vimy Ridge (abril 1917) es el mito fundacional de la identidad canadiense: las divisiones canadienses tomaron una posición que los franceses y británicos no habían podido conquistar, y el éxito convirtió la guerra en el primer acto de política exterior autónoma canadiense.' },
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de los EEUU', description: 'Canadá y EEUU comparten la mayor frontera sin militarizar del mundo y la mayor relación comercial bilateral del planeta. El TLCAN/CUSMA, la crisis arancelaria de Trump, la migración irregular y la política energética son capítulos compartidos de dos historias que no pueden entenderse por separado.' },
    { url: '/visualizador-historia/historia-america-latina/', icon: '🌎', name: 'Historia de América Latina', description: 'Canadá forma parte del TLCAN junto a México y EEUU (hoy CUSMA), y ha desarrollado una política exterior activa en América Latina: misiones de paz, relaciones diplomáticas con Cuba durante la Guerra Fría y acuerdos de libre comercio con Chile, Colombia y Perú.' },
  ],

  // Productos icónicos y Guerras (2026-05-08)
  'visualizador-historia-chocolate': [
    { url: '/visualizador-historia/civilizaciones-precolombinas/', icon: '🏛️', name: 'Civilizaciones Precolombinas', description: 'El cacao sagrado de los olmecas, mayas y aztecas forma parte del universo cultural de las civilizaciones precolombinas: el xocolatl era moneda, ofrenda ritual y privilegio de la élite guerrera mexica antes de que Hernán Cortés lo llevara a Europa en 1528.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'Conquista de América', description: 'La conquista española de América es el puente entre el chocolate mesoamericano y el europeo: Cortés recibe xocolatl de Moctezuma en 1519 y lo lleva a la corte de Carlos I en 1528. El modelo de plantation economy colonial que hizo masiva la producción de cacao tiene sus raíces en la conquista.' },
    { url: '/visualizador-historia/azucar/', icon: '🎍', name: 'Historia del Azúcar', description: 'Chocolate y azúcar son inseparables en la historia: el xocolatl mesoamericano era amargo; fue la adición de azúcar de caña en la España del siglo XVI lo que creó el chocolate tal como lo conocemos hoy. La historia del cacao industrializado y la del azúcar colonial comparten la misma geografía atlántica.' },
  ],
  'visualizador-historia-azucar': [
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'Conquista de América', description: 'La expansión azucarera del Caribe es inseparable de la conquista: Colón llevó caña de azúcar en su segundo viaje (1493), y el modelo de plantation economy colonial transformó la demografía atlántica. La economía azucarera fue el motor económico que impulsó la explotación colonial del Nuevo Mundo.' },
    { url: '/visualizador-historia/chocolate/', icon: '🍫', name: 'Historia del Chocolate', description: 'Azúcar y chocolate están entrelazados desde el siglo XVI: el xocolatl mesoamericano era amargo hasta que se mezcló con azúcar de caña en España. La industrialización del chocolate (Van Houten, Cadbury, Nestlé) y del azúcar (remolacha, ingenios mecánicos) ocurrieron en paralelo en el siglo XIX.' },
    { url: '/visualizador-historia/historia-comercio/', icon: '🏪', name: 'Historia del Comercio', description: 'El azúcar es uno de los grandes motores del comercio global: el monopolio veneciano medieval, las rutas comerciales árabes, el comercio triangular atlántico (azúcar, esclavos, manufacturas) y las cuotas internacionales del siglo XX hacen del azúcar un caso paradigmático de cómo un producto transforma el comercio mundial.' },
    { url: '/visualizador-historia/guerras-napoleonicas/', icon: '⚔️', name: 'Guerras Napoleónicas', description: 'El azúcar y Napoleón están directamente conectados: el bloqueo naval británico durante las Guerras Napoleónicas (1806-1815) cortó el suministro de azúcar de caña a Europa, obligando a Napoleón a impulsar el azúcar de remolacha azucarera. La crisis azucarera fue uno de los factores económicos que motivaron el bloqueo continental.' },
  ],
  'visualizador-historia-guerras-napoleonicas': [
    { url: '/visualizador-historia/revolucion-francesa/', icon: '🔵', name: 'Revolución Francesa', description: 'Las Guerras Napoleónicas son la continuación directa de la Revolución Francesa: Napoleón fue el heredero político de la Revolución, y su expansión militar difundió por Europa los principios de 1789 (igualdad ante la ley, abolición del feudalismo, Código Civil) a la punta de la bayoneta. Sin la Revolución no hay Napoleón.' },
    { url: '/visualizador-historia/espana-borbones/', icon: '👑', name: 'España Borbónica', description: 'España fue el escenario de uno de los episodios más importantes de las Guerras Napoleónicas: la Guerra de la Independencia (1808-1814), que dio origen al concepto "guerrilla", produjo la Constitución de 1812 ("La Pepa") y agotó cientos de miles de soldados imperiales. La invasión napoleónica también precipitó las independencias de América Latina.' },
    { url: '/visualizador-historia/historia-reino-unido/', icon: '🇬🇧', name: 'Historia del Reino Unido', description: 'Gran Bretaña fue el enemigo principal y consistente de Napoleón durante toda la era: la victoria de Trafalgar (1805) garantizó su supremacía naval, el financiamiento de las coaliciones europeas con oro británico fue decisivo, y Wellington fue el arquitecto militar de la derrota final. Sin la resistencia británica, Europa habría sido napoleónica.' },
    { url: '/visualizador-historia/historia-alemania/', icon: '🦅', name: 'Historia de Alemania', description: 'Las Guerras Napoleónicas transformaron los estados alemanes: la creación de la Confederación del Rin (1806) y la disolución del Sacro Imperio Romano Germánico (1806), la batalla de Jena (1806) que destruyó Prusia, y la resistencia alemana en Leipzig (1813) son los antecedentes directos del nacionalismo alemán y la posterior unificación de 1871.' },
  ],

  // Roadmap v13 EJE E2 — Era Big Tech (2026-05-08)
  'visualizador-historia-redes-sociales': [
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'La IA generativa está redefiniendo el contenido de las redes sociales: algoritmos de recomendación basados en deep learning, chatbots integrados (Grok, Meta AI) y la automatización de la creación de contenido son el próximo capítulo de la historia de las redes sociales.' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Las redes sociales son una capa construida sobre internet: la web (1991), el correo electrónico, los foros y el HTML pusieron la infraestructura sobre la que Facebook, Twitter e Instagram construyeron sus plataformas. Sin HTTP y el navegador, no habría red social.' },
    { url: '/visualizador-historia/ordenadores/', icon: '💻', name: 'Historia de los Ordenadores', description: 'Los smartphones que pusieron las redes sociales en el bolsillo de 5.000 millones de personas son la culminación de 80 años de miniaturización del ordenador: de los mainframes a los chips M3 y Snapdragon que procesan algoritmos de recomendación en tiempo real.' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🧠', name: 'IA y Algoritmos Sociales', description: 'El algoritmo de TikTok (ForYouPage) y el EdgeRank de Facebook son aplicaciones de machine learning: redes neuronales entrenadas para maximizar el engagement prediciendo qué contenido verá cada usuario. La historia de la IA y la historia de las redes sociales convergen en la era actual.' },
  ],
  'visualizador-historia-silicon-valley': [
    { url: '/visualizador-historia/ordenadores/', icon: '💻', name: 'Historia de los Ordenadores', description: 'Silicon Valley es el epicentro de la historia del ordenador personal: Intel (microprocesador), Apple (Mac, iPhone), HP (calculadoras científicas) y NVIDIA (GPUs para IA) son empresas del Valley que han definido cada generación de hardware en los últimos 70 años.' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'Silicon Valley alberga los laboratorios de IA más influyentes del mundo: Google DeepMind, OpenAI, Anthropic, Meta AI y los equipos de Apple Machine Learning. La concentración de talento, capital y datos en el Valley explica por qué domina la carrera de la IA generativa.' },
    { url: '/visualizador-historia/historia-eeuu/', icon: '🇺🇸', name: 'Historia de los EEUU', description: 'Silicon Valley y la historia de EEUU están entrelazadas: la financiación militar de DARPA creó internet, el frío fue el catalizador de los semiconductores, y la política antimonopolio del DOJ contra Google (fallo 2024) refleja el debate sobre concentración de poder en la economía americana.' },
    { url: '/visualizador-historia/redes-sociales/', icon: '📱', name: 'Historia de las Redes Sociales', description: 'Las redes sociales son el producto más visible de Silicon Valley en el siglo XXI: Facebook (Palo Alto), Twitter (San Francisco), Instagram, Snapchat y LinkedIn nacieron a pocos kilómetros entre sí, financiadas por los mismos fondos de venture capital que llevan décadas invirtiendo en el Valley.' },
  ],
  'visualizador-historia-criptomonedas': [
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'IA y blockchain son las dos tecnologías más disruptivas de los años 2020: la IA generativa (ChatGPT, 2022) y el colapso de FTX (2022) ocurrieron en el mismo año. La intersección entre ambas —agentes de IA que operan en blockchains, tokenización de modelos— es el próximo frente de innovación.' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Bitcoin (2009) nació como respuesta a la crisis financiera de 2008 y como evolución del cypherpunk de los años 90, que ya experimentaba con dinero digital (DigiCash, b-money). La blockchain es la infraestructura de confianza distribuida que internet nunca tuvo de forma nativa.' },
    { url: '/visualizador-historia/banca/', icon: '🏦', name: 'Historia de la Banca', description: 'Las criptomonedas desafían directamente al sistema bancario tradicional: la promesa de DeFi es reemplazar préstamos, depósitos e intercambios sin bancos intermediarios. La respuesta de los bancos centrales (CBDCs, monedas digitales soberanas) y los reguladores (MiCA) define el nuevo equilibrio.' },
    { url: '/visualizador-historia/silicon-valley/', icon: '🏔️', name: 'Historia de Silicon Valley', description: 'Silicon Valley financió el ecosistema cripto: Andreessen Horowitz (a16z) es el mayor fondo de venture capital en cripto con más de 7.600M$ bajo gestión. Coinbase (San Francisco) fue el primer exchange en cotizar en bolsa (NASDAQ, 2021), cerrando el círculo entre el ecosistema tech del Valley y las criptomonedas.' },
  ],

  // Opción E EJE E1+E3 — Lenguaje y Datos (2026-05-09)
  'visualizador-historia-idiomas-mundo': [
    { url: '/visualizador-historia/historia-conquista-america/', icon: '⛵', name: 'Conquista de América', description: 'La conquista española transformó el paisaje lingüístico de América: el español desplazó o subordinó cientos de lenguas indígenas (náhuatl, quechua, maya), aunque muchas sobrevivieron. El contacto colonial creó el español latinoamericano, el quechua moderno y miles de lenguas criollas caribeñas.' },
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'La Ilustración fue el gran catalizador de la normalización lingüística: la Encyclopédie de Diderot (1751), los primeros diccionarios nacionales (RAE 1713, Académie française), y la idea de una lengua estándar como pilar de la nación-estado surgieron en el siglo XVIII y definieron qué idiomas importaban.' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet ha acelerado tanto la globalización del inglés como la documentación de lenguas en peligro: Wikipedia existe en 300+ idiomas, Google Translate cubre 133 lenguas, y proyectos como Common Voice de Mozilla recopilan voz en lenguas minorizadas. La web es simultáneamente amenaza y salvavidas para la diversidad lingüística.' },
    { url: '/visualizador-historia/historia-periodismo/', icon: '📰', name: 'Historia del Periodismo', description: 'Periodismo e idioma están profundamente entrelazados: la prensa escrita del siglo XIX estandarizó la ortografía y el vocabulario de los idiomas nacionales, el periodismo de masas creó argots y lenguajes coloquiales, y hoy los medios digitales aceleran la creación de neologismos y la mezcla de lenguas.' },
  ],
  'visualizador-historia-diccionarios-enciclopedias': [
    { url: '/visualizador-historia/ilustracion/', icon: '💡', name: 'La Ilustración', description: 'La Encyclopédie de Diderot y D\'Alembert (1751-1772) es el proyecto enciclopédico más emblemático de la Ilustración: 28 volúmenes, 72.000 artículos y 3.000 colaboradores que sistematizaron el conocimiento humano con perspectiva crítica y racionalista. Fue censurada por la Iglesia y la corona francesa, pero circuló clandestinamente por toda Europa.' },
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Wikipedia (2001) solo fue posible gracias a internet: la edición colaborativa masiva, los bots de corrección automática y la API libre de contenidos son características nativas del medio digital. Hoy Wikipedia tiene más de 60 millones de artículos en 300+ idiomas y es la mayor enciclopedia jamás escrita.' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'Los LLMs (GPT-4, Claude, Gemini) son enciclopedias implícitas: entrenados sobre todo el texto accesible en internet, pueden responder preguntas con la amplitud de una enciclopedia universal. Este nuevo paradigma plantea cuestiones sobre autoría, actualización y fiabilidad del conocimiento codificado.' },
    { url: '/visualizador-historia/idiomas-mundo/', icon: '🗣️', name: 'Historia de los Idiomas', description: 'Los diccionarios son los guardianes de las lenguas: la RAE (1713), el Dictionnaire de l\'Académie française (1694) y el Oxford English Dictionary (1884-1928) no solo describen el idioma, sino que lo modelan. La lexicografía es siempre un acto político: qué palabras incluir, cuáles excluir y cómo definirlas refleja la ideología de cada época.' },
  ],
  'visualizador-historia-historia-periodismo': [
    { url: '/visualizador-historia/internet/', icon: '🌐', name: 'Historia de Internet', description: 'Internet es la mayor revolución en la historia del periodismo desde Gutenberg: la web permitió la publicación inmediata y global sin costes de impresión, destruyó el modelo publicitario de los periódicos en papel, creó los nativos digitales y abrió la era de las redes sociales como distribuidores de noticias.' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'La IA generativa está transformando el periodismo: redactores automáticos (AP, Reuters), verificación de hechos algorítmica, detección de deepfakes y el debate sobre si los LLMs reemplazarán periodistas o los potenciarán. Los Panama Papers (2016) fueron posibles gracias al análisis de datos masivos, anticipo del periodismo asistido por IA.' },
    { url: '/visualizador-historia/redes-sociales/', icon: '📱', name: 'Historia de las Redes Sociales', description: 'Las redes sociales han redefinido la distribución de noticias y la agenda informativa: Twitter fue el primer medio de comunicación de emergencias en tiempo real, Facebook creó el fenómeno de la burbuja de filtro, y TikTok es hoy la primera fuente de información para la generación Z.' },
    { url: '/visualizador-historia/diccionarios-enciclopedias/', icon: '📖', name: 'Diccionarios y Enciclopedias', description: 'Periodismo y enciclopedismo comparten el mismo propósito: hacer circular el conocimiento. La Encyclopédie iluminista fue un acto periodístico y político; los periódicos del siglo XIX publicaban en entregas artículos que hoy serían ensayos de Wikipedia. El fact-checking periodístico y la edición colaborativa son expresiones contemporáneas de la misma voluntad de verificar hechos.' },
  ],
  'visualizador-historia-cartografia': [
    { url: '/visualizador-historia/exploracion/', icon: '⛵', name: 'Historia de la Exploración', description: 'La cartografía y la exploración son inseparables: cada gran expedición —Colón, Magallanes, Cook— producía mapas nuevos que a su vez motivaban nuevas exploraciones. Los portulanos mediterráneos del siglo XIII y las proyecciones de Mercator (1569) fueron instrumentos técnicos que hicieron posible la circunnavegación del globo.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '🗺️', name: 'Conquista de América', description: 'Los mapas fueron instrumentos de poder colonial: la bula Inter Caetera (1493) y el Tratado de Tordesillas (1494) dividieron el mundo entre España y Portugal sobre un mapa. La cartografía colonial borró los topónimos indígenas y renombró continentes con nombres europeos, convirtiendo el mapa en un acto político de apropiación territorial.' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'Google Maps y los Sistemas de Información Geográfica (SIG) son aplicaciones de IA aplicada a la cartografía: el reconocimiento de imágenes satelitales, la detección automática de carreteras y el geoposicionamiento de millones de dispositivos son hoy el mayor proyecto cartográfico colaborativo de la historia.' },
    { url: '/visualizador-historia/estadistica/', icon: '📊', name: 'Historia de la Estadística', description: 'Cartografía y estadística convergen en los mapas temáticos: el mapa de John Snow sobre el cólera en Londres (1854) es el primer gran ejemplo de cartografía estadística que cambió la historia de la medicina pública. Hoy los mapas de calor, los coropletas y los dashboards geoespaciales son las herramientas básicas del análisis de datos territoriales.' },
  ],
  'visualizador-historia-estadistica': [
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'La estadística moderna nació en parte de la medicina: Florence Nightingale inventó el diagrama de área polar para mostrar las muertes evitables en Crimea (1858), John Snow usó mapas de puntos para identificar la bomba de agua infectada en el cólera de Londres (1854), y los ensayos clínicos controlados convirtieron la medicina en una ciencia estadística.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '💹', name: 'Historia de la Economía Mundial', description: 'La econometría y la macroeconomía son estadística aplicada a la economía: el PIB, el IPC y la tasa de paro son construcciones estadísticas que gobiernan las políticas económicas mundiales. Las crisis de 2008 y 2020 mostraron tanto el poder como los límites de los modelos estadísticos para predecir el comportamiento de sistemas complejos.' },
    { url: '/visualizador-historia/historia-inteligencia-artificial/', icon: '🤖', name: 'Historia de la IA', description: 'El machine learning es estadística escalada: las redes neuronales, la regresión logística y los transformers son algoritmos estadísticos entrenados con datos masivos. La revolución del deep learning (2012-presente) es el capítulo más reciente de la historia de la estadística, donde los modelos aprendieron a superar a los humanos en tareas específicas.' },
    { url: '/visualizador-historia/cartografia/', icon: '🗺️', name: 'Historia de la Cartografía', description: 'Los mapas temáticos son la visualización estadística más antigua e influyente: de los cartogramas de población del siglo XIX a los dashboards geoespaciales del COVID-19 (Johns Hopkins, 2020), la cartografía estadística ha sido el puente entre los datos abstractos y la comprensión intuitiva del territorio.' },
  ],

  // Roadmap v16 — Especias + Vida Cotidiana (2026-05-09)
  'visualizador-historia-especias-rutas-comerciales': [
    { url: '/visualizador-historia/exploracion/', icon: '⛵', name: 'Historia de la Exploración', description: 'La búsqueda de especias fue el motor principal de la Era de los Descubrimientos: Vasco da Gama llegó a Calicut (1498) buscando pimienta, clavo y canela; Colón llegó a América buscando la ruta occidental a las especias; Magallanes circumnavegó el globo para llegar a las Molucas. Sin la pimienta y la nuez moscada, no hay exploración global.' },
    { url: '/visualizador-historia/historia-conquista-america/', icon: '🗺️', name: 'Conquista de América', description: 'Colón buscaba especias, no un continente nuevo: sus Capitulaciones de Santa Fe (1492) le garantizaban el 10% de todas las especias encontradas. El error geográfico que dio lugar a América fue, literalmente, un error de navegación espicera. Las rutas de las especias americanas (chile, vainilla, cacao) completaron la primera globalización alimentaria.' },
    { url: '/visualizador-historia/historia-comercio/', icon: '🏪', name: 'Historia del Comercio', description: 'Las especias son el caso paradigmático del comercio global a larga distancia: el monopolio árabe-veneciano durante siglos, la ruptura portuguesa (1498), la VOC holandesa como primera multinacional de la historia, y la democratización de la pimienta en el siglo XVIII son los capítulos fundacionales del comercio internacional moderno.' },
    { url: '/visualizador-historia/gastronomia/', icon: '🍽️', name: 'Historia de la Gastronomía', description: 'Las especias transformaron la cocina mundial: la pimienta de la cocina romana, la canela y el azafrán de la cocina medieval europea, el chile americano que reinventó la cocina asiática (curry tailandés, kimchi coreano) y la vainilla en la repostería global son ejemplos de cómo las rutas especieras crearon las cocinas nacionales que hoy consideramos "tradicionales".' },
  ],
  'visualizador-historia-urbanismo': [
    { url: '/visualizador-historia/vivienda/', icon: '🏠', name: 'Historia de la Vivienda', description: 'Urbanismo y vivienda son inseparables: el tipo de vivienda define la forma urbana (la insula romana genera la ciudad densa, la casa unifamiliar americana genera el sprawl suburbano) y viceversa. La crisis de vivienda asequible del siglo XXI es también una crisis de planificación urbana: ciudades que crecieron para el coche, no para las personas.' },
    { url: '/visualizador-historia/historia-arquitectura-moderna/', icon: '🏛️', name: 'Arquitectura Moderna', description: 'El urbanismo moderno y la arquitectura moderna son movimientos gemelos: Le Corbusier fue a la vez arquitecto y urbanista, la Bauhaus produjo tanto diseño de objetos como planificación urbana, y el fracaso del Pruitt-Igoe (demolido en 1972) fue el fracaso simultáneo de la arquitectura y el urbanismo funcionalistas.' },
    { url: '/visualizador-historia/historia-capitalismo/', icon: '💹', name: 'Historia del Capitalismo', description: 'El suelo urbano es el activo más valioso del capitalismo contemporáneo: la especulación inmobiliaria, el mercado del alquiler, los fondos de inversión inmobiliaria (REITs) y la crisis de las hipotecas subprime (2008) son expresiones del capitalismo financiero aplicado al espacio urbano. La gentrificación es el proceso por el que el capital expulsa a los residentes de menor renta.' },
    { url: '/visualizador-historia/historia-trabajo/', icon: '⚒️', name: 'Historia del Trabajo', description: 'La ciudad industrial nació del trabajo: las ciudades textiles de Manchester y Birmingham, los Krupp-Siedlung de Essen (viviendas obreras anexas a las fábricas), los Höfe vieneses (Red Vienna) como proyecto político de vivienda para la clase trabajadora, y el commuting suburbano como nueva forma de disciplina del tiempo laboral. El trabajo ha definido la forma de las ciudades en cada era.' },
  ],
  'visualizador-historia-higiene-salud-publica': [
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'La higiene pública y la medicina clínica caminaron durante siglos por caminos separados: mientras Galeno y sus sucesores trataban a individuos, los ingenieros romanos construían acueductos que salvaban a poblaciones enteras. La unificación de ambas tradiciones —en la figura de John Snow, Pasteur y Koch— es el nacimiento de la medicina científica moderna.' },
    { url: '/visualizador-historia/epidemias/', icon: '🦠', name: 'Historia de las Epidemias', description: 'La historia de las epidemias es inseparable de la historia de la higiene: la Peste Negra (1347) aceleró el concepto de cuarentena, el cólera del Soho (1854) creó la epidemiología moderna, la gripe española (1918) mostró la necesidad de coordinación internacional, y la COVID-19 (2020) probó tanto los avances como las lagunas del sistema global de salud pública.' },
    { url: '/visualizador-historia/historia-medicina-contemporanea/', icon: '💉', name: 'Medicina Contemporánea', description: 'La salud pública contemporánea es el resultado de tres siglos de lucha: las vacunas de Jenner (1796), los antibióticos de Fleming (1928), la erradicación de la viruela (1980) y las vacunas de ARNm contra la COVID-19 (2020) son hitos de la medicina que solo fueron posibles gracias a sistemas de salud pública que los administraron masivamente.' },
    { url: '/visualizador-historia/urbanismo/', icon: '🏙️', name: 'Historia del Urbanismo', description: 'La reforma sanitaria del siglo XIX fue también una reforma urbana: las grandes obras de alcantarillado de Londres (1858-1875, Joseph Bazalgette), el Haussman de París y el Ensanche de Barcelona surgieron de la misma crisis de cólera que mató a decenas de miles de personas en ciudades hacinadas. La salud pública moderna nació en las ciudades industriales.' },
  ],
  'visualizador-historia-vejez-longevidad': [
    { url: '/visualizador-historia/medicina/', icon: '🏥', name: 'Historia de la Medicina', description: 'La longevidad creciente del siglo XX es en gran parte un triunfo de la medicina: la reducción de la mortalidad infantil, los antibióticos, las vacunas y la cirugía cardiovascular son las razones por las que la esperanza de vida media pasó de 48 años (1900) a 73 años (2023). La gerontología y la geriatría como especialidades médicas son el reconocimiento de que vivir más necesita medicina propia.' },
    { url: '/visualizador-historia/historia-medicina-contemporanea/', icon: '💉', name: 'Medicina Contemporánea', description: 'La biología del envejecimiento es la nueva frontera de la medicina: los telómeros (Blackburn, Nobel 2009), las células senescentes y las senolíticas, la restricción calórica y las vías del mTOR y la sirtuina son el vocabulario de la ciencia longevity, que promete extender no solo la duración sino la calidad de vida en la vejez.' },
    { url: '/visualizador-historia/historia-trabajo/', icon: '⚒️', name: 'Historia del Trabajo', description: 'La vejez y el trabajo están históricamente conectados: la jubilación bismarckiana (1889) a los 70 años cuando la esperanza de vida era de 45 fue un cálculo actuarial, no un derecho social. El debate actual sobre la edad de jubilación, los sistemas de pensiones y el trabajo en la tercera edad es consecuencia directa del envejecimiento demográfico que nadie previó en el siglo XIX.' },
    { url: '/visualizador-historia/historia-economia-mundial/', icon: '💹', name: 'Historia de la Economía Mundial', description: 'El envejecimiento demográfico es el mayor desafío macroeconómico del siglo XXI: Japón, con más del 29% de su población mayor de 65 años, es el laboratorio de lo que le espera a Europa y China. Los sistemas de pensiones de reparto, diseñados cuando había 5 trabajadores por jubilado, funcionan mal cuando hay 1,5. La economía del envejecimiento es ya una disciplina en sí misma.' },
  ],
  'visualizador-historia-vivienda': [
    { url: '/visualizador-historia/urbanismo/', icon: '🏙️', name: 'Historia del Urbanismo', description: 'La vivienda y el urbanismo son las dos caras del mismo problema: cómo organizar el espacio humano. La domus romana generó la ciudad densa mediterránea; la back-to-back house victoriana generó los slums industriales; la casa unifamiliar con jardín generó el sprawl suburbano americano. Cada tipo de vivienda crea un tipo de ciudad y un modo de vida.' },
    { url: '/visualizador-historia/historia-capitalismo/', icon: '💹', name: 'Historia del Capitalismo', description: 'La vivienda es el activo financiero más importante de la mayoría de familias en el mundo desarrollado: la hipoteca a 30 años americana (FHA, 1934), los fondos de inversión inmobiliaria (REITs, 1960), la titulización de hipotecas y la crisis subprime (2008) son capítulos de cómo el capitalismo financiero convirtió el hogar en un instrumento de especulación.' },
    { url: '/visualizador-historia/historia-trabajo/', icon: '⚒️', name: 'Historia del Trabajo', description: 'La vivienda obrera fue el primer campo de batalla del Estado del Bienestar: los Krupp-Siedlung alemanes, las garden cities inglesas, los Höfe vieneses y los HLM franceses son ejemplos de cuando los estados intentaron garantizar vivienda digna a los trabajadores industriales. El fracaso o éxito de estos modelos define la desigualdad residencial actual.' },
    { url: '/visualizador-historia/historia-arquitectura-moderna/', icon: '🏛️', name: 'Arquitectura Moderna', description: 'La arquitectura moderna del siglo XX fue en gran parte arquitectura residencial: la Unité d\'Habitation de Le Corbusier (1952), las torres Mies van der Rohe de Chicago, los bloques prefabricados soviéticos (khrushchyovka) y los grands ensembles franceses fueron experimentos sociales a escala masiva. Su legado —tanto los éxitos como los fracasos— define el debate urbanístico actual.' },
  ],

  // Apps de referencia específica (2026-05-03)
  'aditivos-e-alimentarios': [
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias. El complemento natural a la lectura de etiquetas.' },
    { url: '/visualizador-huella-alimentos/', icon: '🌍', name: 'Huella de lo que Comes', description: 'Impacto ambiental de cada alimento: CO₂, agua y tierra consumidos. Complementa la lectura de etiquetas con el impacto ecológico.' },
    { url: '/visualizador-indice-glucemico/', icon: '📊', name: 'Índice Glucémico', description: 'Cómo los alimentos afectan tu glucemia: el IG y la carga glucémica de 26 alimentos comunes, incluidos muchos que contienen aditivos.' },
  ],
  'guia-especias': [
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Guía de Hierbas Aromáticas', description: 'Hierbas aromáticas: familia, origen, aroma, cultivo y usos culinarios y medicinales' },
    { url: '/guia-infusiones/', icon: '🫖', name: 'Guía de Infusiones', description: 'Usos tradicionales, preparación y contraindicaciones de 55 plantas para infusión' },
    { url: '/guia-cafe/', icon: '☕', name: 'Guía del Café', description: '38 orígenes de café del mundo: especie, altitud, notas de sabor y preparación ideal' },
    { url: '/guia-te/', icon: '🍵', name: 'Guía del Té', description: '40 variedades de té: familia, origen, temperatura de infusión y nivel de cafeína' },
  ],
  'guia-infusiones': [
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Guía de Hierbas Aromáticas', description: 'Hierbas aromáticas: familia, origen, aroma, cultivo y usos culinarios y medicinales' },
    { url: '/guia-especias/', icon: '🫚', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias' },
    { url: '/guia-cafe/', icon: '☕', name: 'Guía del Café', description: '38 orígenes de café del mundo: especie, altitud, notas de sabor y preparación ideal' },
    { url: '/guia-te/', icon: '🍵', name: 'Guía del Té', description: '40 variedades de té: familia, origen, temperatura de infusión y nivel de cafeína' },
  ],
  'guia-cafe': [
    { url: '/guia-te/', icon: '🍵', name: 'Guía del Té', description: '40 variedades de té: familia, origen, temperatura de infusión y nivel de cafeína' },
    { url: '/guia-infusiones/', icon: '🫖', name: 'Guía de Infusiones', description: 'Usos tradicionales, preparación y contraindicaciones de 55 plantas para infusión' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué significan los códigos E de las etiquetas alimentarias' },
  ],
  'guia-te': [
    { url: '/guia-cafe/', icon: '☕', name: 'Guía del Café', description: '38 orígenes de café del mundo: especie, altitud, notas de sabor y preparación ideal' },
    { url: '/guia-infusiones/', icon: '🫖', name: 'Guía de Infusiones', description: 'Usos tradicionales, preparación y contraindicaciones de 55 plantas para infusión' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué significan los códigos E de las etiquetas alimentarias' },
  ],
  'guia-quesos': [
    { url: '/guia-aceite-oliva/', icon: '🫒', name: 'Guía del Aceite de Oliva', description: '32 variedades de AOVE: perfil, intensidad, usos culinarios y denominaciones de origen' },
    { url: '/guia-cocteles/', icon: '🍸', name: 'Guía de Cócteles Clásicos', description: '45 cócteles clásicos: ingredientes, método, copa y maridaje ideal' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué significan los códigos E de las etiquetas alimentarias' },
  ],
  'guia-aceite-oliva': [
    { url: '/guia-quesos/', icon: '🧀', name: 'Guía de Quesos', description: '55 quesos del mundo: tipo de leche, maduración, maridaje y denominación de origen' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/guia-cocteles/', icon: '🍸', name: 'Guía de Cócteles Clásicos', description: '45 cócteles clásicos: ingredientes, método, copa y maridaje ideal' },
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué significan los códigos E de las etiquetas alimentarias' },
  ],
  'guia-cocteles': [
    { url: '/guia-varietales-vino/', icon: '🍷', name: 'Guía de Varietales de Vino', description: '45 varietales: cuerpo, taninos, acidez, temperatura y maridaje. Incluye Malbec, Torrontés, Carménère y generosos' },
    { url: '/guia-estilos-cerveza/', icon: '🍺', name: 'Guía de Estilos de Cerveza', description: '47 estilos: IBU, ABV, temperatura y maridaje. Incluye NEIPA, Quadrupel, Mexican Lager' },
    { url: '/guia-quesos/', icon: '🧀', name: 'Guía de Quesos', description: '55 quesos del mundo: tipo de leche, maduración, maridaje y denominación de origen' },
    { url: '/guia-cafe/', icon: '☕', name: 'Guía del Café', description: '38 orígenes de café del mundo: especie, altitud, notas de sabor y preparación ideal' },
  ],
  'guia-plantas-interior': [
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Guía de Hierbas Aromáticas', description: 'Hierbas aromáticas: familia, origen, aroma, cultivo y usos culinarios y medicinales' },
    { url: '/guia-insectos-jardin/', icon: '🐛', name: 'Guía de Insectos del Jardín', description: '35 insectos: rol beneficioso/perjudicial, identificación y qué hacer' },
    { url: '/guia-aves-comunes/', icon: '🐦', name: 'Guía de Aves Comunes', description: '40 aves de España y Europa: hábitat, canto, presencia y estado de conservación' },
    { url: '/guia-superalimentos/', icon: '🥗', name: 'Guía de Superalimentos', description: '40 superalimentos: nutrientes, beneficios, cómo consumirlos y contraindicaciones' },
  ],
  'guia-setas': [
    { url: '/guia-plantas-interior/', icon: '🪴', name: 'Guía de Plantas de Interior', description: '40 plantas de interior: luz, riego, toxicidad para mascotas y dificultad de cuidado' },
    { url: '/guia-superalimentos/', icon: '🥗', name: 'Guía de Superalimentos', description: '40 superalimentos: nutrientes, beneficios, cómo consumirlos y contraindicaciones' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué significan los códigos E de las etiquetas alimentarias' },
  ],
  'guia-superalimentos': [
    { url: '/guia-frutas-exoticas/', icon: '🍑', name: 'Guía de Frutas Exóticas', description: '40 frutas exóticas: origen, sabor, temporada y cómo consumirlas' },
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Guía de Hierbas Aromáticas', description: 'Hierbas aromáticas: familia, origen, aroma, cultivo y usos culinarios y medicinales' },
    { url: '/guia-especias/', icon: '🫚', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/aditivos-e-alimentarios/', icon: '🏷️', name: 'Guía Aditivos E', description: 'Qué significan los códigos E de las etiquetas alimentarias' },
  ],
  'guia-cortes-carne': [
    { url: '/guia-superalimentos/', icon: '🥗', name: 'Guía de Superalimentos', description: '40 superalimentos: nutrientes, beneficios, cómo consumirlos y contraindicaciones' },
    { url: '/guia-quesos/', icon: '🧀', name: 'Guía de Quesos', description: '55 quesos del mundo: tipo de leche, maduración, maridaje y denominación de origen' },
    { url: '/guia-tipos-pan/', icon: '🍞', name: 'Guía de Tipos de Pan', description: '35 panes del mundo: harina, fermentación, textura y acompañamientos' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
  ],
  'guia-varietales-vino': [
    { url: '/que-vino-elegir/', icon: '🍷', name: '¿Qué vino elegir?', description: 'Asistente situacional: dime qué necesitas y te recomiendo el vino adecuado' },
    { url: '/guia-estilos-cerveza/', icon: '🍺', name: 'Guía de Estilos de Cerveza', description: '47 estilos: IBU, ABV, temperatura y maridaje. Incluye NEIPA, Quadrupel, Mexican Lager' },
    { url: '/guia-cocteles/', icon: '🍸', name: 'Guía de Cócteles', description: '45 cócteles clásicos: ingredientes, método, copa y maridaje' },
    { url: '/guia-quesos/', icon: '🧀', name: 'Guía de Quesos', description: '55 quesos del mundo: tipo de leche, maduración, maridaje y denominación de origen' },
  ],
  'que-vino-elegir': [
    { url: '/guia-varietales-vino/', icon: '🍷', name: 'Guía de Varietales de Vino', description: '45 varietales: cuerpo, taninos, acidez, temperatura y maridaje. Incluye Malbec, Torrontés, Carménère y generosos' },
    { url: '/que-cerveza-elegir/', icon: '🍺', name: '¿Qué cerveza elegir?', description: 'Asistente situacional para cervezas: comida, regalo, bar u ocasión' },
    { url: '/guia-quesos/', icon: '🧀', name: 'Guía de Quesos', description: '55 quesos del mundo: tipo de leche, maduración, maridaje y denominación de origen' },
    { url: '/guia-cortes-carne/', icon: '🥩', name: 'Guía de Cortes de Carne', description: '45 cortes de carne: terneza, cocción, temperatura y consejos' },
  ],
  'guia-estilos-cerveza': [
    { url: '/que-cerveza-elegir/', icon: '🍺', name: '¿Qué cerveza elegir?', description: 'Asistente situacional: dime qué necesitas y te recomiendo la cerveza adecuada' },
    { url: '/guia-varietales-vino/', icon: '🍷', name: 'Guía de Varietales de Vino', description: '45 varietales: cuerpo, taninos, acidez, temperatura y maridaje. Incluye Malbec, Torrontés, Carménère y generosos' },
    { url: '/guia-cocteles/', icon: '🍸', name: 'Guía de Cócteles', description: '45 cócteles clásicos: ingredientes, método, copa y maridaje' },
    { url: '/guia-tipos-pan/', icon: '🍞', name: 'Guía de Tipos de Pan', description: '35 panes del mundo: harina, fermentación, textura y acompañamientos' },
  ],
  'que-cerveza-elegir': [
    { url: '/guia-estilos-cerveza/', icon: '🍺', name: 'Guía de Estilos de Cerveza', description: '47 estilos: IBU, ABV, temperatura y maridaje. Incluye NEIPA, Quadrupel, Mexican Lager' },
    { url: '/que-vino-elegir/', icon: '🍷', name: '¿Qué vino elegir?', description: 'Asistente situacional para vinos: cena, regalo, restaurante u ocasión' },
    { url: '/guia-cortes-carne/', icon: '🥩', name: 'Guía de Cortes de Carne', description: '45 cortes de carne: terneza, cocción, temperatura y consejos' },
    { url: '/guia-tipos-pan/', icon: '🍞', name: 'Guía de Tipos de Pan', description: '35 panes del mundo: harina, fermentación, textura y acompañamientos' },
  ],
  'guia-tipos-pan': [
    { url: '/guia-cortes-carne/', icon: '🥩', name: 'Guía de Cortes de Carne', description: '45 cortes de carne: terneza, cocción, temperatura y consejos' },
    { url: '/guia-varietales-vino/', icon: '🍷', name: 'Guía de Varietales de Vino', description: '45 varietales: cuerpo, taninos, acidez, temperatura y maridaje. Incluye Malbec, Torrontés, Carménère y generosos' },
    { url: '/guia-tipos-pasta/', icon: '🍝', name: 'Guía de Tipos de Pasta', description: '40 pastas italianas: forma, región, cocción y salsa ideal' },
    { url: '/guia-tipos-arroz/', icon: '🍚', name: 'Guía de Tipos de Arroz', description: '30 variedades de arroz: grano, almidón, región y uso culinario' },
  ],
  'guia-tipos-pasta': [
    { url: '/guia-tipos-arroz/', icon: '🍚', name: 'Guía de Tipos de Arroz', description: '30 variedades de arroz: grano, almidón, región y uso culinario' },
    { url: '/guia-tipos-pan/', icon: '🍞', name: 'Guía de Tipos de Pan', description: '35 panes del mundo: harina, fermentación, textura y acompañamientos' },
    { url: '/guia-varietales-vino/', icon: '🍷', name: 'Guía de Varietales de Vino', description: '45 varietales: cuerpo, taninos, acidez, temperatura y maridaje. Incluye Malbec, Torrontés, Carménère y generosos' },
    { url: '/guia-vinagres-mundo/', icon: '🧪', name: 'Guía de Vinagres del Mundo', description: '25 vinagres: origen, acidez, intensidad y maridaje' },
  ],
  'guia-tipos-arroz': [
    { url: '/guia-tipos-pasta/', icon: '🍝', name: 'Guía de Tipos de Pasta', description: '40 pastas italianas: forma, región, cocción y salsa ideal' },
    { url: '/guia-tipos-pan/', icon: '🍞', name: 'Guía de Tipos de Pan', description: '35 panes del mundo: harina, fermentación, textura y acompañamientos' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/guia-cortes-carne/', icon: '🥩', name: 'Guía de Cortes de Carne', description: '45 cortes de carne: terneza, cocción, temperatura y consejos' },
  ],
  'guia-vinagres-mundo': [
    { url: '/guia-aceite-oliva/', icon: '🫒', name: 'Guía del Aceite de Oliva', description: '32 variedades de AOVE: perfil, intensidad, usos culinarios y D.O.' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/guia-tipos-pasta/', icon: '🍝', name: 'Guía de Tipos de Pasta', description: '40 pastas italianas: forma, región, cocción y salsa ideal' },
    { url: '/guia-quesos/', icon: '🧀', name: 'Guía de Quesos', description: '55 quesos del mundo: tipo de leche, maduración, maridaje y D.O.' },
  ],
  'guia-frutas-exoticas': [
    { url: '/guia-superalimentos/', icon: '🥗', name: 'Guía de Superalimentos', description: '40 superalimentos: nutrientes, beneficios, cómo consumirlos y contraindicaciones' },
    { url: '/guia-frutos-secos/', icon: '🥜', name: 'Guía de Frutos Secos', description: '30 frutos secos y semillas: categoría, perfil nutricional, calorías y usos culinarios' },
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Guía de Hierbas Aromáticas', description: 'Hierbas aromáticas: familia, origen, aroma, cultivo y usos culinarios y medicinales' },
    { url: '/guia-especias/', icon: '🫚', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
  ],
  'guia-frutos-secos': [
    { url: '/guia-frutas-exoticas/', icon: '🍑', name: 'Guía de Frutas Exóticas', description: '40 frutas exóticas: origen, sabor, temporada y cómo consumirlas' },
    { url: '/guia-superalimentos/', icon: '🥗', name: 'Guía de Superalimentos', description: '40 superalimentos: nutrientes, beneficios, cómo consumirlos y contraindicaciones' },
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Guía de Hierbas Aromáticas', description: 'Hierbas aromáticas: familia, origen, aroma, cultivo y usos culinarios y medicinales' },
    { url: '/guia-especias/', icon: '🫚', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
  ],
  'guia-hierbas-aromaticas': [
    { url: '/guia-especias/', icon: '🫚', name: 'Guía de Especias', description: 'Perfil de sabor, usos y conservación de 65 especias culinarias del mundo' },
    { url: '/guia-infusiones/', icon: '🫖', name: 'Guía de Infusiones', description: 'Usos tradicionales, preparación y contraindicaciones de 55 plantas para infusión' },
    { url: '/guia-plantas-interior/', icon: '🪴', name: 'Guía de Plantas de Interior', description: '40 plantas de interior: luz, riego, toxicidad para mascotas y cuidados' },
    { url: '/guia-superalimentos/', icon: '🥗', name: 'Guía de Superalimentos', description: '40 superalimentos: nutrientes, beneficios, cómo consumirlos y contraindicaciones' },
  ],
  'guia-tejidos-fibras': [
    { url: '/guia-maderas/', icon: '🪵', name: 'Guía de Maderas', description: '35 maderas: Janka, densidad, origen, dificultad de trabajo y usos' },
    { url: '/visualizador-origen-camiseta/', icon: '👕', name: 'Origen de una Camiseta', description: 'El viaje global de una camiseta: algodón, fabricación, transporte y distribución' },
    { url: '/visualizador-agua-virtual/', icon: '💧', name: 'Agua Virtual', description: 'El agua oculta en lo que compramos y comemos: huella hídrica de productos cotidianos' },
    { url: '/guia-plantas-interior/', icon: '🪴', name: 'Guía de Plantas de Interior', description: '40 plantas de interior: luz, riego, toxicidad para mascotas y cuidados' },
  ],
  'guia-maderas': [
    { url: '/guia-tejidos-fibras/', icon: '🧵', name: 'Guía de Tejidos y Fibras', description: '35 tejidos y fibras: origen, propiedades, cuidados, sostenibilidad y usos' },
    { url: '/guia-aves-comunes/', icon: '🐦', name: 'Guía de Aves Comunes', description: '40 aves de España y Europa: hábitat, canto, presencia y estado de conservación' },
    { url: '/guia-plantas-interior/', icon: '🪴', name: 'Guía de Plantas de Interior', description: '40 plantas de interior: luz, riego, toxicidad para mascotas y cuidados' },
    { url: '/guia-setas/', icon: '🍄', name: 'Guía de Setas', description: '40 setas: comestibilidad, hábitat, temporada e identificación con avisos de seguridad' },
  ],
  'guia-aves-comunes': [
    { url: '/guia-insectos-jardin/', icon: '🐛', name: 'Guía de Insectos del Jardín', description: '35 insectos: rol beneficioso/perjudicial, identificación y qué hacer' },
    { url: '/guia-plantas-interior/', icon: '🪴', name: 'Guía de Plantas de Interior', description: '40 plantas de interior: luz, riego, toxicidad para mascotas y cuidados' },
    { url: '/guia-setas/', icon: '🍄', name: 'Guía de Setas', description: '40 setas: comestibilidad, hábitat, temporada e identificación con avisos de seguridad' },
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Guía de Hierbas Aromáticas', description: 'Hierbas aromáticas: familia, origen, aroma, cultivo y usos culinarios y medicinales' },
  ],
  'guia-razas-perros': [
    { url: '/guia-razas-gatos/', icon: '🐈', name: 'Guía de Razas de Gatos', description: '35 razas de gatos: pelo, energía, temperamento y compatibilidad' },
    { url: '/selector-mascota/', icon: '🐾', name: 'Selector de Mascota', description: 'Test de 10 preguntas: qué mascota se adapta mejor a ti' },
    { url: '/guia-cuidado-mascota/', icon: '📚', name: 'Guía Cuidado Mascota', description: 'Todo sobre alimentación, salud, parásitos y emergencias' },
    { url: '/calculadora-alimentacion-mascotas/', icon: '🍖', name: 'Alimentación Mascotas', description: 'Raciones diarias de comida según peso, edad y actividad' },
  ],
  'guia-razas-gatos': [
    { url: '/guia-razas-perros/', icon: '🐕', name: 'Guía de Razas de Perros', description: '40 razas de perros: tamaño, energía, temperamento y compatibilidad' },
    { url: '/selector-mascota/', icon: '🐾', name: 'Selector de Mascota', description: 'Test de 10 preguntas: qué mascota se adapta mejor a ti' },
    { url: '/guia-cuidado-mascota/', icon: '📚', name: 'Guía Cuidado Mascota', description: 'Todo sobre alimentación, salud, parásitos y emergencias' },
    { url: '/calculadora-edad-mascotas/', icon: '🎂', name: 'Edad Mascotas', description: 'Calcula la edad de tu gato o perro en años humanos' },
  ],
  'guia-insectos-jardin': [
    { url: '/guia-plantas-interior/', icon: '🪴', name: 'Guía de Plantas de Interior', description: '40 plantas de interior: luz, riego, toxicidad para mascotas y cuidados' },
    { url: '/guia-aves-comunes/', icon: '🐦', name: 'Guía de Aves Comunes', description: '40 aves de España y Europa: hábitat, canto, presencia y estado de conservación' },
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Guía de Hierbas Aromáticas', description: 'Plantas aromáticas repelentes de plagas: albahaca, lavanda, menta y más' },
    { url: '/guia-setas/', icon: '🍄', name: 'Guía de Setas', description: '40 setas: comestibilidad, hábitat, temporada e identificación' },
  ],

  // CURSOS — relaciones cruzadas (gap completado 2026-05-06)
  'curso-optimizacion-ia': [
    { url: '/curso-pensamiento-sistemico/', icon: '🧩', name: 'Curso Pensamiento Sistémico', description: 'Resolver problemas complejos paso a paso' },
    { url: '/curso-negociacion/', icon: '🤝', name: 'Curso Negociación', description: 'Técnicas profesionales de negociación' },
    { url: '/glosario-programacion/', icon: '📖', name: 'Glosario Programación', description: '100+ términos clave de código y dev' },
    { url: '/visualizador-algoritmos/', icon: '📊', name: 'Visualizador Algoritmos', description: 'Cómo funcionan algoritmos de ordenación' },
  ],
  'curso-pensamiento-sistemico': [
    { url: '/curso-optimizacion-ia/', icon: '🤖', name: 'Curso GEO/AEO', description: 'Optimiza tu contenido para que los LLMs te citen' },
    { url: '/curso-negociacion/', icon: '🤝', name: 'Curso Negociación', description: 'Técnicas profesionales de negociación' },
    { url: '/curso-decisiones-inversion/', icon: '💼', name: 'Curso Decisiones de Inversión', description: 'Marco mental para invertir mejor' },
    { url: '/matriz-eisenhower/', icon: '📊', name: 'Matriz Eisenhower', description: 'Prioriza urgente vs importante' },
  ],
  'curso-negociacion': [
    { url: '/curso-pensamiento-sistemico/', icon: '🧩', name: 'Curso Pensamiento Sistémico', description: 'Resolver problemas complejos' },
    { url: '/curso-optimizacion-ia/', icon: '🤖', name: 'Curso GEO/AEO', description: 'Optimiza tu contenido para que los LLMs te citen' },
    { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Calcula tu hora antes de negociar' },
    { url: '/calculadora-presupuestos/', icon: '📋', name: 'Presupuestos', description: 'Propuestas profesionales a clientes' },
  ],

  // SIMULADORES EDUCATIVOS MATEMÁTICAS/ESTADÍSTICA (2026-05-10)
  'simulador-distribucion-normal': [
    { url: '/simulador-teorema-central-limite/', icon: '🎲', name: 'Teorema Central del Límite', description: 'Por qué la normal aparece en todas partes' },
    { url: '/simulador-derivada-pendiente/', icon: '📈', name: 'Simulador Derivadas', description: 'Pendiente de la tangente visual' },
    { url: '/simulador-regresion/', icon: '📉', name: 'Simulador Regresión', description: 'Lineal, polinómica y logística' },
    { url: '/calculadora-estadistica/', icon: '📊', name: 'Calculadora Estadística', description: 'Media, varianza, percentiles, distribuciones' },
  ],
  'simulador-derivada-pendiente': [
    { url: '/simulador-integral-area/', icon: '📐', name: 'Simulador Integrales', description: 'Área bajo la curva con sumas de Riemann' },
    { url: '/simulador-distribucion-normal/', icon: '📊', name: 'Distribución Normal', description: 'Curva de Gauss interactiva' },
    { url: '/visualizador-calculo-visual/', icon: '🔬', name: 'Cálculo Visual', description: 'Límites, tangentes y áreas en canvas' },
    { url: '/calculadora-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Funciones, identidades y ecuaciones' },
  ],
  'simulador-teorema-central-limite': [
    { url: '/simulador-intervalos-confianza/', icon: '📏', name: 'Intervalos de Confianza', description: 'Aplicación directa del TCL: IC para μ' },
    { url: '/simulador-distribucion-normal/', icon: '📊', name: 'Distribución Normal', description: 'Curva de Gauss interactiva' },
    { url: '/simulador-test-hipotesis/', icon: '🎯', name: 'Test de Hipótesis', description: 'α, β, p-valor y potencia' },
    { url: '/calculadora-estadistica/', icon: '📊', name: 'Calculadora Estadística', description: 'Media, varianza, percentiles, distribuciones' },
  ],
  'simulador-integral-area': [
    { url: '/simulador-derivada-pendiente/', icon: '📈', name: 'Simulador Derivadas', description: 'Pendiente de la tangente: el otro lado del cálculo' },
    { url: '/visualizador-calculo-visual/', icon: '🔬', name: 'Cálculo Visual', description: 'Límites, tangentes y áreas en canvas' },
    { url: '/calculadora-trigonometria/', icon: '📐', name: 'Trigonometría', description: 'Funciones, identidades y ecuaciones' },
    { url: '/simulador-distribucion-normal/', icon: '📊', name: 'Distribución Normal', description: 'Áreas bajo la curva de Gauss = probabilidades' },
  ],
  'simulador-intervalos-confianza': [
    { url: '/simulador-test-hipotesis/', icon: '🎯', name: 'Test de Hipótesis', description: 'IC y test: dos caras de la misma moneda' },
    { url: '/simulador-teorema-central-limite/', icon: '🎲', name: 'Teorema Central del Límite', description: 'La base teórica del IC para μ' },
    { url: '/simulador-distribucion-normal/', icon: '📊', name: 'Distribución Normal', description: 'Z y áreas bajo la curva' },
    { url: '/calculadora-estadistica/', icon: '📊', name: 'Calculadora Estadística', description: 'Media, varianza, percentiles' },
  ],
  'simulador-test-hipotesis': [
    { url: '/simulador-intervalos-confianza/', icon: '📏', name: 'Intervalos de Confianza', description: 'IC y test: dos caras de la misma moneda' },
    { url: '/simulador-teorema-central-limite/', icon: '🎲', name: 'Teorema Central del Límite', description: 'Distribución muestral de X̄' },
    { url: '/simulador-distribucion-normal/', icon: '📊', name: 'Distribución Normal', description: 'Z, p-valor, áreas bajo Gauss' },
    { url: '/calculadora-estadistica/', icon: '📊', name: 'Calculadora Estadística', description: 'Media, varianza, percentiles' },
  ],
  'simulador-conservacion-energia': [
    { url: '/simulador-lentes-opticas/', icon: '🔍', name: 'Simulador Lentes Ópticas', description: 'Trazado de rayos en lentes' },
    { url: '/visualizador-termodinamica/', icon: '🌡️', name: 'Termodinámica', description: 'La 1.ª ley generaliza la conservación de energía' },
    { url: '/calculadora-movimiento/', icon: '🚀', name: 'Calculadora de Movimiento', description: 'Cinemática del MRU y MRUA' },
    { url: '/visualizador-fuerzas-invisibles/', icon: '🧲', name: 'Fuerzas Invisibles', description: 'Las fuerzas que actúan sobre los objetos' },
  ],
  'simulador-lentes-opticas': [
    { url: '/simulador-fotografia/', icon: '📷', name: 'Simulador de Fotografía', description: 'El objetivo de la cámara es una lente convergente: aplica aquí la óptica al triángulo de exposición' },
    { url: '/visualizador-optica/', icon: '🌈', name: 'Óptica visual', description: 'Reflexión, refracción, lentes y prismas' },
    { url: '/visualizador-ojo-humano-vision/', icon: '👁️', name: 'Cómo funciona el ojo', description: 'El cristalino: una lente convergente biológica' },
    { url: '/visualizador-optica-ondulatoria/', icon: '🌊', name: 'Óptica ondulatoria', description: 'Difracción, interferencia y polarización' },
  ],
  'simulador-cinetica-arrhenius': [
    { url: '/simulador-fluidos-bernoulli/', icon: '🌊', name: 'Fluidos Bernoulli', description: 'Otro pilar Bachillerato: presión y velocidad' },
    { url: '/visualizador-termodinamica-quimica/', icon: '🌡️', name: 'Termodinámica Química', description: 'ΔH, ΔG, equilibrio y catalizadores' },
    { url: '/visualizador-reacciones-quimicas/', icon: '⚗️', name: 'Reacciones Químicas', description: 'Tipos, balanceo y átomos' },
    { url: '/visualizador-enzimas-cuerpo-humano/', icon: '🧬', name: 'Enzimas humanas', description: 'Catalizadores biológicos: bajan Ea drásticamente' },
  ],
  'simulador-fluidos-bernoulli': [
    { url: '/simulador-conservacion-energia/', icon: '🎢', name: 'Conservación de la Energía', description: 'Bernoulli es conservación de energía en fluidos' },
    { url: '/simulador-cinetica-arrhenius/', icon: '⚗️', name: 'Cinética Arrhenius', description: 'Otro pilar de Química/Física Bachillerato' },
    { url: '/visualizador-corazon-ciclo-cardiaco/', icon: '❤️', name: 'Ciclo cardíaco', description: 'Bernoulli aplicada a la circulación humana' },
    { url: '/visualizador-sangre-componentes/', icon: '🩸', name: 'Sangre humana', description: 'El fluido más característico que estudia Bernoulli' },
  ],
  'simulador-teorema-bayes': [
    { url: '/simulador-distribucion-normal/', icon: '📊', name: 'Distribución Normal', description: 'Otra pieza clave del razonamiento probabilístico' },
    { url: '/simulador-test-hipotesis/', icon: '🎯', name: 'Test de Hipótesis', description: 'Frecuentista vs bayesiano: dos visiones complementarias' },
    { url: '/visualizador-probabilidad/', icon: '🎰', name: 'Probabilidad', description: 'Conceptos fundamentales con ejemplos' },
    { url: '/visualizador-sesgos-cognitivos/', icon: '🧠', name: 'Sesgos cognitivos', description: 'La falacia bayesiana en la mente humana' },
  ],
  'simulador-termodinamica-carnot': [
    { url: '/simulador-conservacion-energia/', icon: '🎢', name: 'Conservación de la Energía', description: '1.ª ley termodinámica (Carnot es 2.ª)' },
    { url: '/visualizador-termodinamica/', icon: '🌡️', name: 'Termodinámica', description: 'Conducción, convección, radiación' },
    { url: '/visualizador-termodinamica-quimica/', icon: '⚗️', name: 'Termodinámica Química', description: 'ΔG, ΔH y equilibrio químico' },
    { url: '/visualizador-maquinas-simples/', icon: '⚙️', name: 'Máquinas simples', description: 'Palancas y poleas: motores no térmicos' },
  ],
  'simulador-potencial-accion': [
    { url: '/visualizador-sistema-nervioso/', icon: '🧠', name: 'Sistema Nervioso', description: 'Anatomía SNC/SNP, neuronas, sinapsis' },
    { url: '/visualizador-cerebro/', icon: '🧠', name: 'Cerebro humano', description: 'Áreas, lóbulos y funciones cognitivas' },
    { url: '/visualizador-cerebro-emociones/', icon: '❤️', name: 'Cerebro y emociones', description: 'Amígdala, neurotransmisores, circuitos' },
    { url: '/visualizador-ojo-humano-vision/', icon: '👁️', name: 'Visión humana', description: 'Bastones y conos: neuronas que NO disparan PA' },
  ],

  // SIMULADORES BIOLOGÍA — Lista B Sonnet (2026-05-10)
  'simulador-mitosis-meiosis': [
    { url: '/simulador-punnett/', icon: '🧬', name: 'Cuadro de Punnett', description: 'La meiosis genera la variabilidad que Mendel estudió con el cuadro de Punnett' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'Célula animal y vegetal', description: 'Dónde ocurre la división: núcleo, centriolos, huso acromático' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'El ADN que se replica y divide en mitosis y meiosis' },
    { url: '/simulador-potencial-accion/', icon: '⚡', name: 'Potencial de Acción', description: 'Otro simulador de Biología EBAU con animación celular' },
  ],
  'simulador-fotosintesis-factores': [
    { url: '/simulador-ecosistema-trofico/', icon: '🌍', name: 'Ecosistema Trófico', description: 'Los productores que aquí simulamos son la base de la pirámide trófica' },
    { url: '/visualizador-fotosintesis/', icon: '🌿', name: 'Fotosíntesis visual', description: 'Explicador completo: Calvin, fase oscura, cloroplasto' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'Célula vegetal', description: 'El cloroplasto donde ocurre la fotosíntesis' },
    { url: '/visualizador-ecosistema/', icon: '🌱', name: 'Ecosistema', description: 'Ciclos biogeoquímicos y flujo de energía en el ecosistema' },
  ],
  'simulador-punnett': [
    { url: '/simulador-mitosis-meiosis/', icon: '🧬', name: 'Mitosis y Meiosis', description: 'La meiosis genera los gametos con los alelos que combina el cuadro de Punnett' },
    { url: '/visualizador-adn-codigo-genetico/', icon: '🧬', name: 'ADN y Código Genético', description: 'Los alelos son secuencias de ADN en el mismo locus cromosómico' },
    { url: '/visualizador-evolucion-molecular/', icon: '🔬', name: 'Evolución Molecular', description: 'Las mutaciones generan nuevos alelos que Mendel no podía predecir' },
    { url: '/visualizador-adn-polimerasa/', icon: '🔬', name: 'ADN Polimerasa', description: 'La replicación del ADN que copia los alelos antes de la división' },
  ],
  'simulador-ecosistema-trofico': [
    { url: '/simulador-fotosintesis-factores/', icon: '🌿', name: 'Fotosíntesis: Factores Limitantes', description: 'Los productores de la base de la pirámide fijan energía mediante fotosíntesis' },
    { url: '/visualizador-ecosistema/', icon: '🌱', name: 'Ecosistema', description: 'Pirámide trófica, regla del 10% y ciclos biogeoquímicos explicados' },
    { url: '/visualizador-celula/', icon: '🔬', name: 'Célula', description: 'La célula es la unidad de todos los organismos de la cadena trófica' },
    { url: '/visualizador-evolucion-molecular/', icon: '🔬', name: 'Evolución Molecular', description: 'La evolución da forma a las relaciones depredador-presa del ecosistema' },
  ],

  // SIMULADORES FÍSICA + QUÍMICA — Lista B Sonnet (2026-05-10)
  'simulador-movimiento-circular': [
    { url: '/simulador-pendulo/', icon: '⏳', name: 'Péndulo Simple', description: 'Movimiento periódico, período y oscilaciones' },
    { url: '/simulador-mas-resorte/', icon: '🌀', name: 'Masa-Resorte (MAS)', description: 'Movimiento armónico simple y frecuencia' },
    { url: '/simulador-conservacion-energia/', icon: '🎢', name: 'Conservación de la Energía', description: 'Energía cinética y potencial en sistemas físicos' },
    { url: '/simulador-fisica/', icon: '🔬', name: 'Simulador Física', description: 'Más simulaciones de física de bachillerato' },
  ],
  'simulador-mas-resorte': [
    { url: '/simulador-movimiento-circular/', icon: '🔄', name: 'Movimiento Circular', description: 'MCU: otro caso de movimiento periódico con ω constante' },
    { url: '/simulador-pendulo/', icon: '🕰️', name: 'Péndulo Simple', description: 'Oscilador análogo al resorte para ángulos pequeños' },
    { url: '/simulador-conservacion-energia/', icon: '🎢', name: 'Conservación de la Energía', description: 'E_k + E_p = constante, igual que en el MAS sin amortiguamiento' },
    { url: '/visualizador-termodinamica/', icon: '🌡️', name: 'Termodinámica', description: 'El amortiguamiento convierte E mecánica en calor' },
  ],
  'simulador-tabla-periodica-tendencias': [
    { url: '/simulador-estequiometria/', icon: '🧪', name: 'Estequiometría', description: 'Las masas molares que usas en estequiometría vienen de la tabla' },
    { url: '/simulador-cinetica-arrhenius/', icon: '⚗️', name: 'Cinética Arrhenius', description: 'La reactividad química depende de las tendencias periódicas' },
    { url: '/visualizador-tabla-periodica/', icon: '🔬', name: 'Tabla Periódica', description: 'Visualizador de la tabla periódica con información de cada elemento' },
    { url: '/visualizador-tabla-periodica-interactiva/', icon: '⚗️', name: 'Tabla Periódica Interactiva', description: 'Tendencias, mapas de calor y datos ampliados' },
  ],
  'simulador-estequiometria': [
    { url: '/simulador-tabla-periodica-tendencias/', icon: '⚗️', name: 'Tendencias Periódicas', description: 'Masas molares y reactividad explicadas desde la tabla periódica' },
    { url: '/simulador-cinetica-arrhenius/', icon: '⚗️', name: 'Cinética Arrhenius', description: 'Velocidad de las mismas reacciones que calculas aquí' },
    { url: '/visualizador-quimica-organica/', icon: '🧬', name: 'Química Orgánica', description: 'Grupos funcionales y reacciones de compuestos orgánicos' },
    { url: '/visualizador-termodinamica-quimica/', icon: '🌡️', name: 'Termodinámica Química', description: 'ΔH y ΔG de las reacciones estequiométricas' },
  ],

  // SIMULADORES MATEMÁTICAS — Lista B Sonnet (2026-05-10)
  'simulador-monty-hall': [
    { url: '/simulador-teorema-bayes/', icon: '🎲', name: 'Teorema de Bayes', description: 'La probabilidad condicional detrás del problema' },
    { url: '/simulador-distribucion-normal/', icon: '📊', name: 'Distribución Normal', description: 'Otra pieza clave del razonamiento probabilístico' },
    { url: '/visualizador-probabilidad/', icon: '🎰', name: 'Probabilidad visual', description: 'Conceptos fundamentales con ejemplos interactivos' },
    { url: '/simulador-trigonometria-circulo-unitario/', icon: '⭕', name: 'Círculo Trigonométrico', description: 'Otro simulador visual de Matemáticas Bachillerato' },
  ],
  'simulador-trigonometria-circulo-unitario': [
    { url: '/simulador-funciones-transformaciones/', icon: '📉', name: 'Transformaciones de Funciones', description: 'Cómo a, b, c, d modifican sin, cos y otras bases' },
    { url: '/simulador-derivada-pendiente/', icon: '📈', name: 'Simulador Derivadas', description: 'Pendiente de la tangente sobre funciones trigonométricas' },
    { url: '/simulador-integral-area/', icon: '📐', name: 'Simulador Integrales', description: 'Área bajo sin(x) y cos(x) con sumas de Riemann' },
    { url: '/calculadora-trigonometria/', icon: '📐', name: 'Calculadora Trigonometría', description: 'Funciones, identidades y ecuaciones trigonométricas' },
  ],
  'simulador-funciones-transformaciones': [
    { url: '/simulador-trigonometria-circulo-unitario/', icon: '⭕', name: 'Círculo Trigonométrico', description: 'Geometría de sin y cos antes de transformarlas' },
    { url: '/simulador-derivada-pendiente/', icon: '📈', name: 'Simulador Derivadas', description: "Cómo las transformaciones afectan a f'(x)" },
    { url: '/simulador-integral-area/', icon: '📐', name: 'Simulador Integrales', description: 'Área bajo la curva transformada' },
    { url: '/visualizador-calculo-visual/', icon: '🔬', name: 'Cálculo Visual', description: 'Límites, tangentes y áreas en canvas' },
  ],

  // SIMULADORES ECONOMÍA — Lista B Sonnet (2026-05-10)
  'simulador-oferta-demanda': [
    { url: '/visualizador-oferta-demanda/', icon: '📊', name: 'Oferta y Demanda (explicador)', description: 'Marco conceptual de las curvas que mueves en este simulador' },
    { url: '/simulador-elasticidad-precio/', icon: '📈', name: 'Elasticidad Precio', description: 'Cuánto responde la cantidad al precio: la pendiente de la curva D' },
    { url: '/visualizador-inflacion/', icon: '💸', name: 'Inflación', description: 'Desequilibrios de demanda generan inflación de demanda' },
    { url: '/visualizador-estructuras-mercado/', icon: '🏭', name: 'Estructuras de Mercado', description: 'Cómo cambia la curva S en monopolio, oligopolio o competencia perfecta' },
  ],
  'simulador-elasticidad-precio': [
    { url: '/simulador-oferta-demanda/', icon: '📊', name: 'Oferta y Demanda', description: 'La elasticidad determina cómo se desplazan los excedentes al mover la curva' },
    { url: '/visualizador-estructuras-mercado/', icon: '🏭', name: 'Estructuras de Mercado', description: 'El poder de mercado permite al monopolio explotar la inelasticidad' },
    { url: '/simulador-distribucion-normal/', icon: '📐', name: 'Distribución Normal', description: 'Estadística aplicada a la variabilidad del precio en mercados reales' },
    { url: '/calculadora-estadistica/', icon: '📊', name: 'Calculadora Estadística', description: 'Cálculos cuantitativos complementarios para análisis económico' },
  ],
  'simulador-curva-phillips': [
    { url: '/visualizador-inflacion/', icon: '💸', name: 'Inflación', description: 'El eje vertical de la curva de Phillips: tipos, causas y efectos' },
    { url: '/visualizador-desempleo-tipos/', icon: '📉', name: 'Tipos de Desempleo', description: 'El eje horizontal: friccional, estructural, cíclico y NAIRU explicados' },
    { url: '/simulador-oferta-demanda/', icon: '📊', name: 'Oferta y Demanda', description: 'Los shocks de oferta desplazan la curva de Phillips verticalmente' },
    { url: '/simulador-multiplicador-gasto/', icon: '💰', name: 'Multiplicador del Gasto', description: 'Más gasto público → más PIB → menos u → más π: la lógica de Phillips' },
  ],
  'simulador-multiplicador-gasto': [
    { url: '/simulador-oferta-demanda/', icon: '📊', name: 'Oferta y Demanda', description: 'El multiplicador amplía la demanda agregada que mueve el equilibrio' },
    { url: '/visualizador-inflacion/', icon: '💸', name: 'Inflación', description: 'Un multiplicador excesivo genera inflación de demanda' },
    { url: '/simulador-curva-phillips/', icon: '📉', name: 'Curva de Phillips', description: 'Más gasto → más PIB → menos desempleo → posiblemente más inflación' },
    { url: '/calculadora-estadistica/', icon: '📊', name: 'Calculadora Estadística', description: 'Para verificar cálculos macroeconómicos del multiplicador' },
  ],

  // SIMULADORES INFORMÁTICA — Lista B Sonnet (2026-05-10)
  'simulador-hashing-colisiones': [
    { url: '/visualizador-teoria-informacion/', icon: '📡', name: 'Teoría de la Información', description: 'Entropía y codificación: el contexto matemático de las funciones hash' },
    { url: '/visualizador-sistemas-operativos/', icon: '💻', name: 'Sistemas Operativos', description: 'Los SO usan tablas hash internamente para gestión de procesos y ficheros' },
    { url: '/simulador-cifrado-cesar/', icon: '🔐', name: 'Cifrado César', description: 'Otro concepto clave de criptografía e informática básica' },
    { url: '/simulador-tcp-handshake/', icon: '🤝', name: 'Handshake TCP', description: 'Los protocolos de red usan hashing para verificación de integridad' },
  ],
  'simulador-cifrado-cesar': [
    { url: '/simulador-hashing-colisiones/', icon: '🗂️', name: 'Hashing y Colisiones', description: 'Las funciones hash son la base de la criptografía moderna' },
    { url: '/visualizador-logica-proposicional/', icon: '🔣', name: 'Lógica Proposicional', description: 'Los fundamentos matemáticos de la seguridad informática' },
    { url: '/visualizador-teoria-informacion/', icon: '📡', name: 'Teoría de la Información', description: 'Entropía y cifrado: por qué la aleatoriedad es esencial en criptografía' },
    { url: '/simulador-tcp-handshake/', icon: '🤝', name: 'Handshake TCP', description: 'TLS 1.3 usa AES-256 sobre TCP para proteger cada conexión HTTPS' },
  ],
  'simulador-tcp-handshake': [
    { url: '/visualizador-redes-computadoras/', icon: '🌐', name: 'Redes de Computadoras', description: 'TCP/IP, DNS y routing: el contexto completo donde vive el handshake' },
    { url: '/simulador-hashing-colisiones/', icon: '🗂️', name: 'Hashing y Colisiones', description: 'Los protocolos usan hashing (MD5, SHA) para verificación de integridad' },
    { url: '/simulador-cifrado-cesar/', icon: '🔐', name: 'Cifrado César', description: 'Los fundamentos del cifrado que protege las conexiones TLS sobre TCP' },
    { url: '/visualizador-sistemas-operativos/', icon: '💻', name: 'Sistemas Operativos', description: 'El SO gestiona los sockets TCP y el estado de las conexiones' },
  ],

  // FOTOGRAFÍA (2026-05-14)
  'simulador-fotografia': [
    { url: '/visualizador-focales-fotografia/', icon: '🔭', name: 'Visualizador de Focales', description: 'Compara lado a lado 14/24/50/85/200 mm: la otra mitad de la decisión fotográfica' },
    { url: '/simulador-balance-blancos/', icon: '🌡️', name: 'Balance de Blancos', description: 'Slider Kelvin sobre 3 escenas: cierra los pilares del control creativo' },
    { url: '/calculadora-profundidad-campo/', icon: '🎯', name: 'Profundidad de Campo', description: 'Calcula DoF e hiperfocal: el efecto técnico de tu apertura sobre la nitidez' },
    { url: '/calculadora-regla-500-npf-astrofoto/', icon: '🌌', name: 'Regla 500 y NPF Astrofoto', description: 'Tiempo máximo de exposición sin estelas: el caso extremo del triángulo' },
  ],
  'visualizador-focales-fotografia': [
    { url: '/simulador-fotografia/', icon: '📷', name: 'Triángulo de Exposición', description: 'ISO, apertura y velocidad: el otro pilar de toda decisión fotográfica' },
    { url: '/simulador-balance-blancos/', icon: '🌡️', name: 'Balance de Blancos', description: 'Slider Kelvin sobre 3 escenas: completa el círculo de los fundamentos fotográficos' },
    { url: '/simulador-lentes-opticas/', icon: '🔍', name: 'Lentes Ópticas', description: 'La óptica detrás de cada distancia focal: cómo el cristal forma la imagen' },
    { url: '/golden-hour/', icon: '🌅', name: 'Hora Dorada y Azul', description: 'Combina la mejor luz con la focal adecuada para clavar la foto' },
  ],
  'simulador-balance-blancos': [
    { url: '/simulador-fotografia/', icon: '📷', name: 'Triángulo de Exposición', description: 'ISO, apertura, velocidad: la otra mitad del control creativo en cámara' },
    { url: '/visualizador-focales-fotografia/', icon: '🔭', name: 'Visualizador de Focales', description: '14/24/50/85/200 mm lado a lado: completa los pilares de la fotografía' },
    { url: '/calculadora-profundidad-campo/', icon: '🎯', name: 'Profundidad de Campo', description: 'Calcula la zona de nitidez e hiperfocal con visualización en regla' },
    { url: '/golden-hour/', icon: '🌅', name: 'Hora Dorada y Azul', description: 'La hora dorada tiene ~3500K: usa esto para entender por qué se ve cálida' },
  ],
  'calculadora-profundidad-campo': [
    { url: '/simulador-fotografia/', icon: '📷', name: 'Triángulo de Exposición', description: 'La apertura controla DoF y exposición a la vez: aquí ves ambos efectos' },
    { url: '/visualizador-focales-fotografia/', icon: '🔭', name: 'Visualizador de Focales', description: 'La focal cambia el encuadre y la DoF: ve los 5 valores clásicos lado a lado' },
    { url: '/calculadora-regla-500-npf-astrofoto/', icon: '🌌', name: 'Regla 500 y NPF Astrofoto', description: 'Tiempo máximo de exposición para Vía Láctea sin estelas de estrellas' },
    { url: '/simulador-balance-blancos/', icon: '🌡️', name: 'Balance de Blancos', description: 'Completa los pilares del control fotográfico con la temperatura de color' },
  ],
  'calculadora-regla-500-npf-astrofoto': [
    { url: '/simulador-fotografia/', icon: '📷', name: 'Triángulo de Exposición', description: 'En astrofoto el triángulo es crítico: apertura máxima, ISO alto y tiempo NPF' },
    { url: '/calculadora-profundidad-campo/', icon: '🎯', name: 'Profundidad de Campo', description: 'En astrofoto enfocas al infinito: aquí entiendes por qué todo sale nítido' },
    { url: '/visualizador-focales-fotografia/', icon: '🔭', name: 'Visualizador de Focales', description: 'Para Vía Láctea, 14-24 mm. Compara las focales lado a lado' },
    { url: '/golden-hour/', icon: '🌅', name: 'Hora Dorada y Azul', description: 'Planifica cuándo dispara: hora azul y crepúsculo astronómico' },
  ],

  // ── Videografía ──
  'calculadora-regla-180-video': [
    { url: '/calculadora-filtro-nd-video/', icon: '🔲', name: 'Filtro ND para Vídeo', description: 'Qué filtro ND necesitas para aplicar la regla 180° en exteriores' },
    { url: '/calculadora-camara-lenta/', icon: '🐢', name: 'Cámara Lenta (Slow Motion)', description: 'Factor de ralentización y obturador correcto a fps altos' },
    { url: '/calculadora-fov-video/', icon: '📐', name: 'Ángulo de Campo (FOV)', description: 'Ángulo de visión según focal y sensor para cada plano' },
    { url: '/simulador-fotografia/', icon: '📷', name: 'Triángulo de Exposición', description: 'Domina ISO, apertura y velocidad: los mismos principios en foto y vídeo' },
  ],
  'calculadora-camara-lenta': [
    { url: '/calculadora-regla-180-video/', icon: '🎬', name: 'Regla de los 180°', description: 'Obturador correcto para cada fps de grabación' },
    { url: '/calculadora-filtro-nd-video/', icon: '🔲', name: 'Filtro ND para Vídeo', description: 'Filtro ND necesario cuando hay demasiada luz' },
    { url: '/calculadora-bitrate-video/', icon: '💾', name: 'Bitrate y Tamaño de Vídeo', description: 'Cuánto espacio ocupará tu vídeo slow motion' },
    { url: '/calculadora-fov-video/', icon: '📐', name: 'Ángulo de Campo (FOV)', description: 'Qué focal usar para cada tipo de plano' },
  ],
  'calculadora-filtro-nd-video': [
    { url: '/calculadora-regla-180-video/', icon: '🎬', name: 'Regla de los 180°', description: 'El objetivo que justifica el filtro ND en vídeo' },
    { url: '/calculadora-camara-lenta/', icon: '🐢', name: 'Cámara Lenta', description: 'Factor de ralentización y obturador a fps altos' },
    { url: '/calculadora-fov-video/', icon: '📐', name: 'Ángulo de Campo (FOV)', description: 'Ángulo de visión con tu focal y sensor' },
    { url: '/simulador-fotografia/', icon: '📷', name: 'Triángulo de Exposición', description: 'ISO, apertura y velocidad en foto y vídeo' },
  ],
  'calculadora-bitrate-video': [
    { url: '/calculadora-regla-180-video/', icon: '🎬', name: 'Regla de los 180°', description: 'Obturador correcto para movimiento natural' },
    { url: '/calculadora-camara-lenta/', icon: '🐢', name: 'Cámara Lenta', description: 'Slow motion: a más fps, más datos por segundo' },
    { url: '/calculadora-fov-video/', icon: '📐', name: 'Ángulo de Campo (FOV)', description: 'Ángulo de visión con tu focal y sensor' },
    { url: '/calculadora-profundidad-campo/', icon: '🎯', name: 'Profundidad de Campo', description: 'Hiperfocal y DoF: los mismos cálculos aplican en vídeo' },
  ],
  'calculadora-fov-video': [
    { url: '/calculadora-regla-180-video/', icon: '🎬', name: 'Regla de los 180°', description: 'Obturador correcto para cada fps' },
    { url: '/calculadora-filtro-nd-video/', icon: '🔲', name: 'Filtro ND para Vídeo', description: 'Filtro para cumplir la regla 180° en exteriores' },
    { url: '/visualizador-focales-fotografia/', icon: '🔭', name: 'Visualizador de Focales', description: 'Compara 14/24/50/85/200 mm lado a lado' },
    { url: '/calculadora-profundidad-campo/', icon: '🎯', name: 'Profundidad de Campo', description: 'La focal también afecta a la DoF: cálculo completo' },
  ],

  'developers': [
    { url: '/estimador-irpf/', icon: '🏛️', name: 'Calculadora IRPF', description: 'Ejemplo de herramienta fiscal disponible vía MCP' },
    { url: '/estimador-hipoteca/', icon: '🏦', name: 'Simulador de Hipoteca', description: 'Ejemplo de herramienta financiera disponible vía MCP' },
    { url: '/estimador-cuota-autonomo/', icon: '💼', name: 'Cuota de Autónomo', description: 'Ejemplo de herramienta laboral disponible vía MCP' },
    { url: '/developers/terminos/', icon: '⚖️', name: 'Términos de Uso MCP', description: 'Condiciones legales para integradores del servidor MCP' },
  ],

  // ── Cocina Técnica (Tanda 3 MCP — 2026-05-20) ──────────────────────────────
  'calculadora-porcentaje-panadero': [
    { url: '/calculadora-hidratacion-pan/', icon: '💧', name: 'Hidratación del Pan', description: 'Calcula o convierte el porcentaje de agua de tu masa' },
    { url: '/calculadora-masa-madre/', icon: '🦠', name: 'Sustitución Masa Madre', description: 'Convierte levadura comercial a masa madre con ajuste de receta' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta tu fórmula de pan a más o menos piezas' },
    { url: '/calculadora-temperatura-masa/', icon: '🌡️', name: 'Temperatura de la Masa (DDT)', description: 'Temperatura del agua para controlar la fermentación' },
  ],
  'calculadora-hidratacion-pan': [
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Porcentaje del Panadero', description: 'Expresa cada ingrediente como % del peso de harina' },
    { url: '/calculadora-masa-madre/', icon: '🦠', name: 'Sustitución Masa Madre', description: 'Convierte levadura a fermento natural con ajuste de agua' },
    { url: '/calculadora-temperatura-masa/', icon: '🌡️', name: 'Temperatura de la Masa (DDT)', description: 'La temperatura del agua afecta la hidratación percibida' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta todos los ingredientes al número de panes que quieres' },
  ],
  'calculadora-masa-madre': [
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Porcentaje del Panadero', description: 'Entiende la receta original en formato profesional' },
    { url: '/calculadora-hidratacion-pan/', icon: '💧', name: 'Hidratación del Pan', description: 'Ajusta la hidratación total tras añadir la masa madre' },
    { url: '/calculadora-temperatura-masa/', icon: '🌡️', name: 'Temperatura de la Masa (DDT)', description: 'Controla la fermentación con la temperatura del agua' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Escala toda la receta de pan, incluida la masa madre' },
  ],
  'calculadora-temperatura-masa': [
    { url: '/fermentacion-temperatura/', icon: '⏳', name: 'Fermentación por Temperatura', description: 'Cuánto tarda el levado a la temperatura de tu masa' },
    { url: '/calculadora-hidratacion-pan/', icon: '💧', name: 'Hidratación del Pan', description: 'La temperatura afecta cómo se integra el agua en la masa' },
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Porcentaje del Panadero', description: 'Sistema profesional para formular cualquier receta de pan' },
    { url: '/calculadora-masa-madre/', icon: '🦠', name: 'Sustitución Masa Madre', description: 'El preferment a temperatura correcta mejora la fermentación' },
  ],
  'calculadora-puntos-azucar': [
    { url: '/calculadora-ganache/', icon: '🍫', name: 'Ganache de Chocolate', description: 'Proporciones exactas según tipo de chocolate y textura' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta las cantidades de azúcar y demás ingredientes' },
    { url: '/calculadora-gelatina/', icon: '🟡', name: 'Sustitución de Gelatina', description: 'Para recetas que combinan caramelo y gelificación' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversiones de unidades y más herramientas culinarias' },
  ],
  'calculadora-gelatina': [
    { url: '/calculadora-ganache/', icon: '🍫', name: 'Ganache de Chocolate', description: 'Proporciones de chocolate y nata para entremets y mousses' },
    { url: '/calculadora-puntos-azucar/', icon: '🍬', name: 'Puntos del Azúcar', description: 'Temperatura del almíbar para glasas y caramelos con gelatina' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta la gelatina y demás ingredientes a más raciones' },
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Porcentaje del Panadero', description: 'Sistema de proporciones para pastelería profesional' },
  ],
  'calculadora-ganache': [
    { url: '/calculadora-puntos-azucar/', icon: '🍬', name: 'Puntos del Azúcar', description: 'Temperatura para glasas y caramelos con los que combinar el ganache' },
    { url: '/calculadora-gelatina/', icon: '🟡', name: 'Sustitución de Gelatina', description: 'Añade firmeza a mousses y bavarois de chocolate' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta las proporciones a la cantidad total que necesitas' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversiones de unidades y más herramientas culinarias' },
  ],
  'escalador-recetas': [
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pasa una receta en tazas a gramos con el peso real de cada uno' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversiones de unidades culinarias para cualquier receta' },
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Porcentaje del Panadero', description: 'Sistema de proporciones para escalar recetas de pan sin errores' },
    { url: '/calculadora-hidratacion-pan/', icon: '💧', name: 'Hidratación del Pan', description: 'Verifica la hidratación tras escalar tu masa' },
  ],
  'conversor-tazas-gramos': [
    { url: '/ajuste-recetas-altitud/', icon: '⛰️', name: 'Ajuste de Recetas por Altitud', description: 'Adapta tu receta si cocinas en altura (CDMX, Bogotá, Quito…)' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversor general de unidades culinarias y temperaturas' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta las cantidades de una receta a más o menos raciones' },
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Porcentaje del Panadero', description: 'Proporciones en gramos para tus masas de pan' },
  ],
  'ajuste-recetas-altitud': [
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pasa de tazas a gramos con el peso real de cada ingrediente' },
    { url: '/conversor-temperatura-horno/', icon: '🌡️', name: 'Temperatura de Horno', description: 'Convierte entre °C, °F y gas mark, con ajuste de ventilador' },
    { url: '/calculadora-temperatura-masa/', icon: '🌡️', name: 'Temperatura de la Masa', description: 'Calcula la temperatura del agua para una fermentación controlada' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta las cantidades de una receta a más o menos raciones' },
  ],
  'conversor-temperatura-horno': [
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'El peso real de cada taza: harina, azúcar, líquidos…' },
    { url: '/ajuste-recetas-altitud/', icon: '⛰️', name: 'Ajuste de Recetas por Altitud', description: 'Sube el horno y ajusta el leudante si cocinas en altura' },
    { url: '/sustituciones-ingredientes/', icon: '🔄', name: 'Sustituciones de Ingredientes', description: 'Con qué reemplazar huevo, mantequilla, azúcar o harina' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversor general de unidades culinarias y temperaturas' },
  ],
  'sustituciones-ingredientes': [
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'El peso real de cada taza para medir el sustituto' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta las cantidades de una receta a más o menos raciones' },
    { url: '/conversor-temperatura-horno/', icon: '🌡️', name: 'Temperatura de Horno', description: 'Convierte entre °C, °F y gas mark, con ajuste de ventilador' },
    { url: '/selector-dieta/', icon: '🥗', name: 'Selector de Dieta', description: 'Compara patrones de alimentación según tus objetivos' },
  ],
  'calculadora-masa-pizza': [
    { url: '/fermentacion-temperatura/', icon: '⏳', name: 'Fermentación por Temperatura', description: 'Cuánto tarda en levar tu masa según la temperatura' },
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Porcentaje del Panadero', description: 'El sistema de proporciones que usa esta calculadora' },
    { url: '/calculadora-hidratacion-pan/', icon: '💧', name: 'Hidratación del Pan', description: 'Relación agua/harina en porcentaje del panadero' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pesa la harina con precisión para tu masa' },
  ],
  'fermentacion-temperatura': [
    { url: '/calculadora-temperatura-masa/', icon: '🌡️', name: 'Temperatura de la Masa', description: 'La temperatura del agua para llegar a la masa que quieres' },
    { url: '/calculadora-masa-pizza/', icon: '🍕', name: 'Masa de Pizza', description: 'Calcula los ingredientes de tu masa por % del panadero' },
    { url: '/calculadora-masa-madre/', icon: '🫙', name: 'Masa Madre', description: 'Sustituye levadura comercial por masa madre' },
    { url: '/ajuste-recetas-altitud/', icon: '⛰️', name: 'Ajuste de Recetas por Altitud', description: 'En altura la fermentación también cambia' },
  ],
  'temperatura-coccion-carne': [
    { url: '/tiempos-coccion/', icon: '⏱️', name: 'Tiempos de Cocción', description: 'Cuánto cocer huevos, arroz, legumbres y verduras' },
    { url: '/conversor-temperatura-horno/', icon: '🌡️', name: 'Temperatura de Horno', description: 'Convierte entre °C, °F y gas mark, con ajuste de ventilador' },
    { url: '/guia-cortes-carne/', icon: '🥩', name: 'Cortes de Carne', description: 'Qué corte usar y cómo cocinarlo mejor' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversor general de unidades culinarias' },
  ],
  'tiempos-coccion': [
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'El punto seguro de carne y pescado' },
    { url: '/ajuste-recetas-altitud/', icon: '⛰️', name: 'Ajuste de Recetas por Altitud', description: 'En altura los tiempos de cocción se alargan' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversor general de unidades culinarias' },
    { url: '/planificador-menu/', icon: '🗓️', name: 'Planificador de Menú', description: 'Organiza las comidas de la semana' },
  ],
  'escandallo-food-cost': [
    { url: '/calculadora-merma/', icon: '📉', name: 'Calculadora de Merma', description: 'El coste real de la materia prima tras limpiar y cocinar' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta la receta a las raciones que necesitas escandallar' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pasa cantidades a gramos para costear con precisión' },
    { url: '/orientador-tarifa-freelance/', icon: '💼', name: 'Tarifa Freelance', description: 'Pon precio también a tu tiempo y tus servicios' },
  ],
  'calculadora-merma': [
    { url: '/escandallo-food-cost/', icon: '💼', name: 'Escandallo y Food Cost', description: 'Lleva el coste real al precio de venta de tus platos' },
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'La cocción también influye en la merma de la carne' },
    { url: '/guia-cortes-carne/', icon: '🥩', name: 'Cortes de Carne', description: 'Cada corte rinde distinto según el despiece' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta las cantidades de una receta a más o menos raciones' },
  ],
  'conversor-moldes': [
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta la receta a más o menos raciones' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pesa los ingredientes con precisión' },
    { url: '/calculadora-masa-pizza/', icon: '🍕', name: 'Masa de Pizza', description: 'Calcula la masa para tus bases por % del panadero' },
    { url: '/conversor-temperatura-horno/', icon: '🌡️', name: 'Temperatura de Horno', description: 'Convierte entre °C, °F y gas mark' },
  ],
  'conversor-horno-airfryer': [
    { url: '/conversor-temperatura-horno/', icon: '🌡️', name: 'Temperatura de Horno', description: 'Convierte entre °C, °F y gas mark, con ajuste de ventilador' },
    { url: '/tiempos-coccion/', icon: '⏱️', name: 'Tiempos de Cocción', description: 'Cuánto cocer huevos, arroz, legumbres y verduras' },
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'El punto seguro de carne y pescado' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversor general de unidades culinarias' },
  ],
  'calculadora-caducidad': [
    { url: '/tiempos-coccion/', icon: '⏱️', name: 'Tiempos de Cocción', description: 'Cuánto cocer cada alimento en agua' },
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'Cocina carne y pescado de forma segura' },
    { url: '/planificador-menu/', icon: '🗓️', name: 'Planificador de Menú', description: 'Organiza la semana y aprovecha mejor la compra' },
    { url: '/calculadora-merma/', icon: '📉', name: 'Calculadora de Merma', description: 'Cuánto se aprovecha de verdad de cada alimento' },
  ],
  'ratio-cafe': [
    { url: '/guia-cafe/', icon: '☕', name: 'Guía del Café', description: 'Métodos, tuestes y orígenes para entender cada taza' },
    { url: '/guia-te/', icon: '🍵', name: 'Guía del Té', description: 'Tipos de té y cómo prepararlos' },
    { url: '/guia-infusiones/', icon: '🫖', name: 'Guía de Infusiones', description: 'Hierbas e infusiones y sus propiedades' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pesa con precisión también en repostería' },
  ],
  'calculadora-almibar': [
    { url: '/calculadora-puntos-azucar/', icon: '🍬', name: 'Puntos del Azúcar', description: 'Hebra, bola y caramelo: el azúcar por temperatura' },
    { url: '/calculadora-merengue/', icon: '🍥', name: 'Merengue', description: 'El merengue italiano usa un almíbar a 118 °C' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pesa el azúcar con precisión' },
    { url: '/guia-cocteles/', icon: '🍸', name: 'Guía de Cócteles', description: 'El sirope (gomme) en coctelería' },
  ],
  'calculadora-merengue': [
    { url: '/calculadora-almibar/', icon: '🍯', name: 'Almíbar', description: 'El almíbar a 118 °C del merengue italiano' },
    { url: '/calculadora-macarons/', icon: '🌈', name: 'Macarons', description: 'Llevan un merengue francés en su base' },
    { url: '/calculadora-puntos-azucar/', icon: '🍬', name: 'Puntos del Azúcar', description: 'La temperatura del almíbar paso a paso' },
    { url: '/calculadora-crema-pastelera/', icon: '🍮', name: 'Crema Pastelera', description: 'Otra crema clásica de repostería' },
  ],
  'calculadora-crema-pastelera': [
    { url: '/calculadora-merengue/', icon: '🍥', name: 'Merengue', description: 'Para coronar tartas y postres' },
    { url: '/calculadora-ganache/', icon: '🍫', name: 'Ganache', description: 'Otro relleno y cobertura clásico' },
    { url: '/calculadora-gelatina/', icon: '🍮', name: 'Gelatina', description: 'Cuajar y dar firmeza a cremas y postres' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta la receta a las raciones que necesitas' },
  ],
  'calculadora-macarons': [
    { url: '/calculadora-merengue/', icon: '🍥', name: 'Merengue', description: 'La base de aire del macaron' },
    { url: '/calculadora-ganache/', icon: '🍫', name: 'Ganache', description: 'El relleno más habitual de los macarons' },
    { url: '/calculadora-crema-pastelera/', icon: '🍮', name: 'Crema Pastelera', description: 'Otro relleno cremoso para tus macarons' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pesa la almendra y el azúcar al gramo' },
  ],
  'calculadora-royal-icing': [
    { url: '/calculadora-merengue/', icon: '🍥', name: 'Merengue', description: 'Otra preparación de claras y azúcar' },
    { url: '/calculadora-puntos-azucar/', icon: '🍬', name: 'Puntos del Azúcar', description: 'Para caramelos y dulces decorados' },
    { url: '/calculadora-gelatina/', icon: '🍮', name: 'Gelatina', description: 'Para fondant y trabajos de azúcar' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pesa el azúcar glas con precisión' },
  ],
  'tiempos-asado': [
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'Confirma el punto seguro de la carne' },
    { url: '/calculadora-salmuera/', icon: '🧂', name: 'Salmuera (Brining)', description: 'Una salmuera previa deja el asado más jugoso' },
    { url: '/conversor-temperatura-horno/', icon: '🌡️', name: 'Temperatura de Horno', description: 'Convierte entre °C, °F y gas mark' },
    { url: '/tiempos-coccion/', icon: '⏱️', name: 'Tiempos de Cocción', description: 'Tiempos de huevos, arroz, legumbres y verduras' },
  ],
  'sous-vide': [
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'Los puntos de la carne y su mínimo seguro' },
    { url: '/tiempos-asado/', icon: '🍗', name: 'Tiempos de Asado', description: 'La alternativa al horno tradicional' },
    { url: '/conversor-temperatura-horno/', icon: '🌡️', name: 'Temperatura de Horno', description: 'Convierte entre °C, °F y gas mark' },
    { url: '/calculadora-salmuera/', icon: '🧂', name: 'Salmuera (Brining)', description: 'Sazona y da jugosidad antes de cocinar' },
  ],
  'calculadora-salmuera': [
    { url: '/tiempos-asado/', icon: '🍗', name: 'Tiempos de Asado', description: 'Asa tu pieza tras la salmuera' },
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'El punto seguro de carne y pescado' },
    { url: '/sous-vide/', icon: '♨️', name: 'Sous-Vide', description: 'Otra técnica para máxima jugosidad' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pesa la sal con precisión' },
  ],
  'huevo-perfecto': [
    { url: '/tiempos-coccion/', icon: '⏱️', name: 'Tiempos de Cocción', description: 'Cuánto cocer arroz, pasta, legumbres y verduras' },
    { url: '/sous-vide/', icon: '♨️', name: 'Sous-Vide', description: 'El huevo a baja temperatura, de yema sedosa' },
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'El punto seguro de carne y pescado' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversor general de unidades culinarias' },
  ],
  'calculadora-congelacion': [
    { url: '/calculadora-caducidad/', icon: '🧊', name: 'Cuánto Dura Cada Alimento', description: 'Tiempos en nevera, congelador y despensa' },
    { url: '/descongelacion-segura/', icon: '🧊', name: 'Descongelación Segura', description: 'Cómo descongelar sin riesgos lo que congelaste' },
    { url: '/planificador-menu/', icon: '🗓️', name: 'Planificador de Menú', description: 'Organiza la semana y cocina para congelar' },
    { url: '/calculadora-merma/', icon: '📉', name: 'Calculadora de Merma', description: 'Aprovecha mejor lo que compras' },
  ],
  'descongelacion-segura': [
    { url: '/calculadora-congelacion/', icon: '❄️', name: 'Qué se Puede Congelar', description: 'Qué congelar, qué no y cuánto dura' },
    { url: '/calculadora-caducidad/', icon: '🧊', name: 'Cuánto Dura Cada Alimento', description: 'Tiempos de conservación por alimento' },
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'Cocina la pieza descongelada de forma segura' },
    { url: '/tiempos-asado/', icon: '🍗', name: 'Tiempos de Asado', description: 'Asa tu pieza ya descongelada' },
  ],
  'calculadora-mermelada': [
    { url: '/calculadora-encurtidos/', icon: '🥒', name: 'Encurtidos', description: 'Otra forma de conservar la cosecha' },
    { url: '/calculadora-puntos-azucar/', icon: '🍬', name: 'Puntos del Azúcar', description: 'El punto de cocción del azúcar' },
    { url: '/calculadora-caducidad/', icon: '🧊', name: 'Cuánto Dura Cada Alimento', description: 'Cuánto aguanta cada conserva' },
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pesa fruta y azúcar con precisión' },
  ],
  'calculadora-encurtidos': [
    { url: '/fermentados-vegetales/', icon: '🥬', name: 'Fermentados Vegetales', description: 'Conservar verduras por fermentación' },
    { url: '/calculadora-mermelada/', icon: '🍓', name: 'Mermelada', description: 'Conservar fruta en mermelada' },
    { url: '/guia-vinagres-mundo/', icon: '🧪', name: 'Guía de Vinagres', description: 'Qué vinagre usar para tus encurtidos' },
    { url: '/calculadora-salmuera/', icon: '🧂', name: 'Salmuera (Brining)', description: 'Otra técnica con sal y agua' },
  ],
  'fermentados-vegetales': [
    { url: '/calculadora-encurtidos/', icon: '🥒', name: 'Encurtidos', description: 'Conservar verduras en vinagre' },
    { url: '/calculadora-salmuera/', icon: '🧂', name: 'Salmuera (Brining)', description: 'Otra preparación con agua y sal' },
    { url: '/calculadora-caducidad/', icon: '🧊', name: 'Cuánto Dura Cada Alimento', description: 'Conservación de los alimentos' },
    { url: '/guia-superalimentos/', icon: '🥗', name: 'Guía de Superalimentos', description: 'Los fermentados y la alimentación' },
  ],
  'escalado-cocteles': [
    { url: '/guia-cocteles/', icon: '🍸', name: 'Guía de Cócteles', description: 'Recetas y técnicas de coctelería clásica' },
    { url: '/calculadora-almibar/', icon: '🍯', name: 'Almíbar', description: 'El sirope (gomme) para tus cócteles' },
    { url: '/maridaje/', icon: '🍷', name: 'Maridaje de Comida', description: 'Qué beber con cada plato' },
    { url: '/cantidades-evento/', icon: '🎉', name: 'Cantidades para un Evento', description: 'Cuánta bebida y comida por invitado' },
  ],
  'aguas-frescas': [
    { url: '/ratio-cafe/', icon: '☕', name: 'Ratio de Café', description: 'Otra bebida con su proporción exacta' },
    { url: '/guia-infusiones/', icon: '🫖', name: 'Guía de Infusiones', description: 'Hierbas e infusiones frías y calientes' },
    { url: '/calculadora-almibar/', icon: '🍯', name: 'Almíbar', description: 'Para endulzar tus bebidas sin que quede azúcar al fondo' },
    { url: '/cantidades-evento/', icon: '🎉', name: 'Cantidades para un Evento', description: 'Cuánta bebida preparar para un grupo' },
  ],
  'maridaje': [
    { url: '/que-vino-elegir/', icon: '🍷', name: '¿Qué Vino Elegir?', description: 'Encuentra el vino para cada ocasión' },
    { url: '/que-cerveza-elegir/', icon: '🍺', name: '¿Qué Cerveza Elegir?', description: 'El estilo de cerveza que buscas' },
    { url: '/guia-quesos/', icon: '🧀', name: 'Guía de Quesos', description: 'Qué beber con cada tipo de queso' },
    { url: '/escalado-cocteles/', icon: '🍸', name: 'Escalado de Cócteles', description: 'Prepara cócteles para acompañar' },
  ],
  'cantidades-evento': [
    { url: '/asado-personas/', icon: '🍖', name: 'Carne para un Asado', description: 'Cuánta carne comprar para la barbacoa' },
    { url: '/escalado-cocteles/', icon: '🍸', name: 'Escalado de Cócteles', description: 'Cócteles para tu evento' },
    { url: '/planificador-menu/', icon: '🗓️', name: 'Planificador de Menú', description: 'Organiza el menú del evento' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Multiplica las recetas a las raciones que necesitas' },
  ],
  'asado-personas': [
    { url: '/cantidades-evento/', icon: '🎉', name: 'Cantidades para un Evento', description: 'Comida y bebida completas por invitado' },
    { url: '/tiempos-asado/', icon: '🍗', name: 'Tiempos de Asado', description: 'Cuánto asar cada pieza según el peso' },
    { url: '/temperatura-coccion-carne/', icon: '🌡️', name: 'Temperatura Interna de Cocción', description: 'El punto seguro de la carne' },
    { url: '/guia-cortes-carne/', icon: '🥩', name: 'Cortes de Carne', description: 'Qué corte usar para cada cosa' },
  ],
  'guia-chiles': [
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'El mundo de las especias y sus usos' },
    { url: '/guia-hierbas-aromaticas/', icon: '🌿', name: 'Hierbas Aromáticas', description: 'Qué hierba va con cada plato' },
    { url: '/visualizador-mapa-especias/', icon: '🌶️', name: 'El Mapa de las Especias', description: 'De dónde viene cada especia' },
    { url: '/guia-tipos-sal/', icon: '🧂', name: 'Tipos de Sal', description: 'Otra pieza clave de la despensa' },
  ],
  'guia-harinas': [
    { url: '/calculadora-porcentaje-panadero/', icon: '🥖', name: 'Porcentaje del Panadero', description: 'Formula tu pan con la harina elegida' },
    { url: '/calculadora-hidratacion-pan/', icon: '💧', name: 'Hidratación del Pan', description: 'Ajusta el agua a tu harina' },
    { url: '/guia-tipos-pan/', icon: '🍞', name: 'Tipos de Pan', description: 'Panes del mundo y sus masas' },
    { url: '/guia-tipos-pasta/', icon: '🍝', name: 'Tipos de Pasta', description: 'La sémola y la pasta' },
  ],
  'guia-tipos-sal': [
    { url: '/calculadora-salmuera/', icon: '🧂', name: 'Salmuera (Brining)', description: 'Sal y agua para carnes jugosas' },
    { url: '/guia-especias/', icon: '🌿', name: 'Guía de Especias', description: 'Sazonar más allá de la sal' },
    { url: '/guia-chiles/', icon: '🌶️', name: 'Chiles y Pimientos', description: 'El picante de la despensa' },
    { url: '/guia-vinagres-mundo/', icon: '🧪', name: 'Guía de Vinagres', description: 'Acidez para tus platos' },
  ],
  'guia-chocolate': [
    { url: '/calculadora-ganache/', icon: '🍫', name: 'Ganache', description: 'Chocolate y nata en su proporción' },
    { url: '/guia-cafe/', icon: '☕', name: 'Guía del Café', description: 'Otro placer amargo y aromático' },
    { url: '/calculadora-puntos-azucar/', icon: '🍬', name: 'Puntos del Azúcar', description: 'Para trabajar dulces y caramelo' },
    { url: '/guia-azucares/', icon: '🍬', name: 'Azúcares y Endulzantes', description: 'Con qué endulzar tus postres' },
  ],
  'guia-azucares': [
    { url: '/calculadora-almibar/', icon: '🍯', name: 'Almíbar', description: 'Azúcar y agua para tus siropes' },
    { url: '/calculadora-puntos-azucar/', icon: '🍬', name: 'Puntos del Azúcar', description: 'Las fases de cocción del azúcar' },
    { url: '/guia-chocolate/', icon: '🍫', name: 'Chocolate y Cacao', description: 'El otro pilar de la repostería' },
    { url: '/calculadora-mermelada/', icon: '🍓', name: 'Mermelada', description: 'El azúcar como conservante' },
  ],
  'guia-tuberculos-latam': [
    { url: '/guia-maices/', icon: '🌽', name: 'Maíces y Nixtamal', description: 'El otro pilar de la despensa americana' },
    { url: '/tiempos-coccion/', icon: '⏱️', name: 'Tiempos de Cocción', description: 'Cuánto cocer cada tubérculo' },
    { url: '/guia-frutas-exoticas/', icon: '🍑', name: 'Frutas Exóticas', description: 'Más despensa tropical' },
    { url: '/guia-tipos-arroz/', icon: '🍚', name: 'Tipos de Arroz', description: 'Otro básico que acompaña' },
  ],
  'guia-maices': [
    { url: '/guia-tuberculos-latam/', icon: '🥔', name: 'Tubérculos de Latinoamérica', description: 'La despensa de raíces de América' },
    { url: '/guia-harinas/', icon: '🌾', name: 'Guía de Harinas', description: 'Incluida la harina de maíz' },
    { url: '/guia-tipos-pan/', icon: '🍞', name: 'Tipos de Pan', description: 'Panes del mundo, también de maíz' },
    { url: '/guia-chiles/', icon: '🌶️', name: 'Chiles y Pimientos', description: 'Compañero del maíz en la cocina mexicana' },
  ],
  'calendario-temporada': [
    { url: '/planificador-menu/', icon: '🗓️', name: 'Planificador de Menú', description: 'Planifica con productos de temporada' },
    { url: '/guia-frutas-exoticas/', icon: '🍑', name: 'Frutas Exóticas', description: 'Más frutas para tu cocina' },
    { url: '/guia-setas/', icon: '🍄', name: 'Guía de Setas', description: 'La temporada de las setas' },
    { url: '/calculadora-mermelada/', icon: '🍓', name: 'Mermelada', description: 'Aprovecha la fruta de temporada' },
  ],
  'medidas-a-ojo': [
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'Pasa las tazas a peso exacto' },
    { url: '/densidad-liquidos/', icon: '💧', name: 'Conversor de Líquidos', description: 'ml a gramos según el líquido' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversor general de unidades' },
    { url: '/conversor-temperatura-horno/', icon: '🌡️', name: 'Temperatura de Horno', description: '°C, °F y gas mark' },
  ],
  'densidad-liquidos': [
    { url: '/conversor-tazas-gramos/', icon: '🥄', name: 'Tazas a Gramos por Ingrediente', description: 'El peso real de cada ingrediente' },
    { url: '/medidas-a-ojo/', icon: '🤏', name: 'Medidas a Ojo', description: 'Pizca, chorro, vaso… en cantidades' },
    { url: '/calculadora-cocina/', icon: '🍳', name: 'Calculadora de Cocina', description: 'Conversor general de unidades' },
    { url: '/escalador-recetas/', icon: '⚖️', name: 'Escalador de Recetas', description: 'Ajusta las cantidades por raciones' },
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

    // Cursos meskeIA
    'curso-optimizacion-ia': { title: 'Otros cursos meskeIA', icon: '🎓' },
    'curso-pensamiento-sistemico': { title: 'Otros cursos meskeIA', icon: '🎓' },
    'curso-negociacion': { title: 'Otros cursos meskeIA', icon: '🎓' },

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
    'evaluador-fortaleza-contrasena': { title: 'Seguridad y contraseñas', icon: '🔒' },
    'test-phishing': { title: 'Seguridad digital', icon: '🛡️' },
    'curso-criptografia-seguridad': { title: 'Seguridad y contraseñas', icon: '🔐' },

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
