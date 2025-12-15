/**
 * Base de datos completa de aplicaciones meskeIA
 * Total: 140 aplicaciones organizadas por 12 categorías + 7 momentos
 * Actualizado: 2025-12-07
 *
 * CONVENCIÓN DE NOMBRES (actualizado 2025-11-26):
 * - calculadora-: Apps que calculan/resuelven
 * - conversor-: Apps que convierten formatos/unidades
 * - generador-: Apps que crean contenido
 * - simulador-: Apps con simulaciones complejas
 * - validador-: Apps que verifican/validan
 * - juego-: Juegos y entretenimiento
 * - lista-: Gestión de listas
 * - curso-: Contenido educativo estructurado
 * - creador-: Apps creativas
 *
 * SISTEMA DE MOMENTOS (2025-11-30):
 * Cada app puede pertenecer a múltiples "momentos" (contextos de uso)
 * Los momentos complementan las categorías, no las reemplazan
 *
 * RESTRUCTURACIÓN DE CATEGORÍAS (2025-11-30):
 * 14 categorías → 12 categorías (orden alfabético)
 * Criterio único: tipo de herramienta (no contexto de uso, eso lo cubren los momentos)
 */

// Tipos de momentos disponibles
export type MomentType = 'trabajo' | 'estudio' | 'casa' | 'dinero' | 'creando' | 'relax' | 'curiosidad';

// Definición de los 7 momentos
export const moments = [
  {
    id: 'trabajo' as MomentType,
    name: 'Trabajando',
    icon: '💼',
    description: 'Productividad y herramientas profesionales'
  },
  {
    id: 'estudio' as MomentType,
    name: 'Estudiando',
    icon: '🎓',
    description: 'Aprende y resuelve ejercicios'
  },
  {
    id: 'casa' as MomentType,
    name: 'En casa',
    icon: '🏠',
    description: 'Hogar, cocina y vida doméstica'
  },
  {
    id: 'dinero' as MomentType,
    name: 'Mi dinero',
    icon: '💰',
    description: 'Gestiona tus finanzas e impuestos'
  },
  {
    id: 'creando' as MomentType,
    name: 'Creando',
    icon: '🎨',
    description: 'Diseño, contenido y desarrollo web'
  },
  {
    id: 'relax' as MomentType,
    name: 'Relajándome',
    icon: '🎮',
    description: 'Juegos y entretenimiento'
  },
  {
    id: 'curiosidad' as MomentType,
    name: 'Curioseando',
    icon: '🧭',
    description: 'Descubre y aprende cosas curiosas'
  },
] as const;

export interface Application {
  name: string;
  category: string;
  contexts?: MomentType[];  // Momentos en los que aplica esta app
  icon: string;
  description: string;
  url: string;
  keywords: string[];
}

export const applicationsDatabase: Application[] = [
  // ============================================
  // 1. Calculadoras Prácticas (10)
  // ============================================
  { name: "Calculadora de Propinas", category: "Calculadoras Prácticas", contexts: ["casa", "relax"], icon: "🧮", description: "Calcula propinas y divide la cuenta entre varias personas fácilmente", url: "/calculadora-propinas/", keywords: ["propina", "cuenta", "dividir", "restaurante", "porcentaje"] },
  { name: "Calculadora de IVA", category: "Calculadoras Prácticas", contexts: ["dinero", "trabajo"], icon: "🧮", description: "Calcula el IVA español: añade o quita IVA al 21%, 10% o 4% con un clic", url: "/calculadora-iva/", keywords: ["iva", "impuesto", "base imponible", "21%", "10%", "4%", "fiscal"] },
  { name: "Calculadora de Descuentos", category: "Calculadoras Prácticas", contexts: ["casa", "dinero"], icon: "🏷️", description: "Calcula el precio final con descuento y cuánto ahorras. Soporta descuentos encadenados", url: "/calculadora-descuentos/", keywords: ["descuento", "rebaja", "oferta", "ahorro", "black friday", "rebajas"] },
  { name: "Calculadora de Porcentajes", category: "Calculadoras Prácticas", contexts: ["estudio", "trabajo", "casa"], icon: "🧮", description: "Calculadora de porcentajes completa: X% de cantidad, qué % es, aumentos, disminuciones y variaciones", url: "/calculadora-porcentajes/", keywords: ["porcentaje", "tanto por ciento", "aumento", "disminucion", "variacion"] },
  { name: "Calculadora Regla de Tres", category: "Calculadoras Prácticas", contexts: ["estudio", "casa"], icon: "🧮", description: "Calculadora completa de regla de tres simple y compuesta con ejemplos prácticos españoles", url: "/calculadora-regla-de-tres/", keywords: ["proporcion", "regla", "tres", "directa", "inversa", "matematicas"] },
  { name: "Calculadora de Fechas", category: "Calculadoras Prácticas", contexts: ["trabajo", "casa"], icon: "🧮", description: "Calcula días entre fechas, suma o resta días a cualquier fecha", url: "/calculadora-fechas/", keywords: ["fecha", "dias", "calendario", "diferencia", "tiempo"] },
  { name: "Conversor de Tallas", category: "Calculadoras Prácticas", contexts: ["casa", "curiosidad"], icon: "🧮", description: "Convierte tallas de ropa y calzado entre sistemas EU, UK, US", url: "/conversor-tallas/", keywords: ["talla", "ropa", "zapatos", "conversion", "medida"] },
  { name: "Calculadora de Cocina", category: "Calculadoras Prácticas", contexts: ["casa"], icon: "🍳", description: "Conversor de unidades de cocina, escalador de recetas, tiempos de cocción y sustitutos de ingredientes", url: "/calculadora-cocina/", keywords: ["cocina", "recetas", "conversor", "tazas", "gramos", "temperatura", "horno", "tiempo", "coccion", "ingredientes", "sustitutos"] },
  { name: "Lista de Compras", category: "Calculadoras Prácticas", contexts: ["casa"], icon: "🛒", description: "Lista de compras con organización automática por categorías del supermercado, guardado local y exportación", url: "/lista-compras/", keywords: ["lista", "compras", "supermercado", "shopping", "productos", "mercado", "groceries", "organizar", "categorias", "offline"] },
  { name: "Calculadora de Gasto Energético", category: "Calculadoras Prácticas", contexts: ["casa", "dinero"], icon: "⚡", description: "Calcula el consumo eléctrico de tus electrodomésticos y el coste mensual en tu factura de luz. Precios PVPC y mercado libre", url: "/calculadora-gasto-energetico/", keywords: ["gasto energetico", "consumo electrico", "factura luz", "electrodomesticos", "kwh", "pvpc", "ahorro energia", "precio electricidad", "potencia contratada"] },
  { name: "Calculadora de Pintura", category: "Calculadoras Prácticas", contexts: ["casa"], icon: "🎨", description: "Calcula cuánta pintura necesitas para pintar paredes y techos. Estimación de botes y coste según tipo de superficie", url: "/calculadora-pintura/", keywords: ["pintura", "paredes", "litros", "metros cuadrados", "botes", "superficie", "habitacion", "pintar"] },
  { name: "Calculadora Consumo Combustible", category: "Calculadoras Prácticas", contexts: ["casa", "dinero"], icon: "⛽", description: "Calcula el consumo de combustible de tu vehículo en L/100km y el coste de tus viajes", url: "/calculadora-combustible/", keywords: ["combustible", "gasolina", "diesel", "consumo", "litros", "kilometros", "coche", "viaje"] },
  { name: "Calculadora Edad Mascotas", category: "Calculadoras Prácticas", contexts: ["casa", "curiosidad"], icon: "🐾", description: "Calcula la edad de tu perro o gato en años humanos según su tamaño. Fórmula científica actualizada", url: "/calculadora-edad-mascotas/", keywords: ["edad perro", "edad gato", "años humanos", "mascota", "veterinario", "perros", "gatos"] },
  { name: "Planificador de Boda", category: "Calculadoras Prácticas", contexts: ["casa", "dinero"], icon: "💒", description: "Organiza tu boda paso a paso: checklist por meses, calculadora de presupuesto, timeline del día y consejos de wedding planner", url: "/planificador-boda/", keywords: ["boda", "wedding planner", "matrimonio", "checklist boda", "presupuesto boda", "organizador boda", "lista tareas boda", "timeline boda"] },

  // ============================================
  // 2. Criptografía y Seguridad (7)
  // ============================================
  { name: "Cifrado Clásico", category: "Criptografía y Seguridad", contexts: ["curiosidad"], icon: "🔐", description: "Cifra textos con métodos clásicos: César, ROT13 y Atbash. Visualización del alfabeto cifrado y presets históricos", url: "/cifrado-clasico/", keywords: ["cifrado", "cesar", "rot13", "atbash", "criptografia", "encriptar", "clasico"] },
  { name: "Cifrado Vigenère", category: "Criptografía y Seguridad", contexts: ["curiosidad"], icon: "🔑", description: "Cifrado polialfabético con palabra clave. Más seguro que César, usado durante siglos. Visualización de tabla Vigenère", url: "/cifrado-vigenere/", keywords: ["vigenere", "cifrado", "clave", "polialfabetico", "criptografia", "bellaso"] },
  { name: "Cifrado por Transposición", category: "Criptografía y Seguridad", contexts: ["curiosidad"], icon: "🔀", description: "Cifra reordenando letras: Columnas, Rail Fence y Escítala. Visualización interactiva de cada método", url: "/cifrado-transposicion/", keywords: ["transposicion", "columnas", "rail fence", "escitala", "reordenar", "cifrado", "criptografia"] },
  { name: "Cifrado Playfair", category: "Criptografía y Seguridad", contexts: ["curiosidad"], icon: "🔲", description: "Cifrado por digramas con matriz 5x5. Usado en guerras mundiales. Visualización de matriz y proceso de cifrado", url: "/cifrado-playfair/", keywords: ["playfair", "matriz", "digramas", "5x5", "wheatstone", "cifrado", "criptografia"] },
  { name: "Cifrado AES", category: "Criptografía y Seguridad", contexts: ["trabajo"], icon: "🔷", description: "Cifrado simétrico moderno AES-256. Modos GCM y CBC, derivación de clave PBKDF2. El estándar mundial de seguridad", url: "/cifrado-aes/", keywords: ["aes", "aes-256", "cifrado simetrico", "gcm", "cbc", "pbkdf2", "criptografia moderna", "seguridad"] },
  { name: "Generador de Hashes", category: "Criptografía y Seguridad", contexts: ["trabajo", "creando"], icon: "🛡️", description: "Genera hashes MD5, SHA-256, SHA-512 para verificar integridad de datos. Compara archivos y textos de forma segura", url: "/generador-hashes/", keywords: ["hash", "md5", "sha256", "sha512", "checksum", "integridad", "seguridad", "verificar"] },
  { name: "Codificador Base64", category: "Criptografía y Seguridad", contexts: ["trabajo", "creando"], icon: "🔒", description: "Codifica y decodifica texto en Base64, URL encode y Hexadecimal. Soporta archivos e imágenes", url: "/codificador-base64/", keywords: ["base64", "url encode", "hexadecimal", "codificar", "decodificar", "btoa", "atob"] },

  // ============================================
  // 3. Diseño Web (12)
  // ============================================
  { name: "Conversor de Colores", category: "Diseño Web", contexts: ["creando"], icon: "🎨", description: "Convierte entre HEX, RGB, HSL y CMYK con color picker visual y generación de paletas automáticas", url: "/conversor-colores/", keywords: ["colores", "hex", "rgb", "hsl", "cmyk", "convertidor", "color picker", "paleta"] },
  { name: "Calculadora de Contraste", category: "Diseño Web", contexts: ["creando"], icon: "🎨", description: "Verifica accesibilidad WCAG con ratios de contraste AA/AAA y simulación de daltonismo", url: "/contraste-colores/", keywords: ["contraste", "accesibilidad", "wcag", "daltonismo", "aa", "aaa", "diseño accesible"] },
  { name: "Generador de Gradientes", category: "Diseño Web", contexts: ["creando"], icon: "🎨", description: "Crea gradientes CSS lineales, radiales y cónicos con presets populares y código listo para copiar", url: "/generador-gradientes/", keywords: ["gradientes", "css", "gradient", "linear", "radial", "conic", "background"] },
  { name: "Generador de Sombras", category: "Diseño Web", contexts: ["creando"], icon: "🎨", description: "Genera box-shadow y text-shadow con múltiples capas, presets de neuromorfismo y material design", url: "/generador-sombras/", keywords: ["sombras", "shadow", "box-shadow", "text-shadow", "neuromorfismo", "material design"] },
  { name: "Calculadora de Aspectos", category: "Diseño Web", contexts: ["creando", "trabajo"], icon: "🎨", description: "Mantiene proporciones al redimensionar, presets para redes sociales (Instagram, Facebook, YouTube)", url: "/calculadora-aspectos/", keywords: ["aspectos", "ratio", "proporciones", "redimensionar", "instagram", "facebook", "16:9", "4:3"] },
  { name: "Generador de Tipografías", category: "Diseño Web", contexts: ["creando"], icon: "🎨", description: "Combina Google Fonts con pairings armónicos predefinidos, previsualización en tiempo real y generación de código CSS", url: "/generador-tipografias/", keywords: ["tipografias", "fonts", "google fonts", "fuentes", "typography", "pairings", "css", "web fonts"] },
  { name: "Creador de Paletas", category: "Diseño Web", contexts: ["creando"], icon: "🎨", description: "Diseña paletas de colores profesionales para tus proyectos web", url: "/creador-paletas/", keywords: ["colores", "paleta", "diseño", "web", "hex", "esquema colores", "armonia cromatica"] },
  { name: "Creador de Thumbnails YouTube", category: "Diseño Web", contexts: ["creando", "trabajo"], icon: "🎬", description: "Diseña miniaturas profesionales para YouTube: texto, imágenes, formas y exportación PNG 1280x720", url: "/creador-thumbnails/", keywords: ["thumbnails", "youtube", "miniaturas", "portadas", "editor", "diseño", "1280x720", "videos"] },
  { name: "Validador JSON", category: "Diseño Web", contexts: ["trabajo", "creando"], icon: "💻", description: "Valida, formatea y minifica código JSON y XML al instante con detección de errores", url: "/validador-json/", keywords: ["json", "xml", "validar", "formatear", "codigo"] },
  { name: "Generador de Iconos PWA", category: "Diseño Web", contexts: ["creando", "trabajo"], icon: "💻", description: "Genera todos los tamaños de iconos para PWA, favicon y apps móviles. Múltiples formatos y presets para diferentes plataformas", url: "/generador-iconos/", keywords: ["iconos", "pwa", "favicon", "app icons", "manifest", "apple touch"] },
  { name: "Validador RegEx", category: "Diseño Web", contexts: ["trabajo", "creando"], icon: "💻", description: "Testa y valida expresiones regulares con resaltado de coincidencias y ejemplos prácticos", url: "/validador-regex/", keywords: ["regex", "expresiones regulares", "validar", "patron", "programacion"] },
  { name: "Conversor de Imágenes", category: "Diseño Web", contexts: ["creando", "trabajo", "casa"], icon: "💻", description: "Convierte formatos de imagen (JPG, PNG, WebP), comprime y redimensiona con control de calidad total", url: "/conversor-imagenes/", keywords: ["imagen", "convertir", "comprimir", "redimensionar", "jpg", "png"] },
  { name: "Compresor de Imágenes por Lotes", category: "Diseño Web", contexts: ["creando", "trabajo"], icon: "🗜️", description: "Comprime múltiples imágenes a la vez sin límites ni marcas de agua. Reduce el tamaño de JPG, PNG, WebP manteniendo la calidad", url: "/compresor-imagenes/", keywords: ["compresor", "imagenes", "comprimir", "lotes", "batch", "optimizar", "reducir", "peso", "fotos", "webp", "jpg", "png"] },
  { name: "Recortador de Audio", category: "Diseño Web", contexts: ["creando", "trabajo", "relax"], icon: "✂️", description: "Recorta y edita archivos de audio online gratis. Corta MP3, WAV, OGG sin límites ni marcas de agua. Fade in/out y ajuste de volumen", url: "/recortador-audio/", keywords: ["recortador", "audio", "cortar", "mp3", "wav", "ogg", "trim", "editar", "tonos", "fade", "volumen"] },
  { name: "Generador de Enlaces UTM", category: "Diseño Web", contexts: ["trabajo", "creando"], icon: "💻", description: "Genera enlaces UTM para Google Analytics. Trackea campañas de marketing con parámetros utm_source, utm_medium, utm_campaign", url: "/generador-utm/", keywords: ["utm", "google analytics", "tracking", "marketing", "campañas", "enlaces"] },
  { name: "Generador de Ondas y Visualizador", category: "Diseño Web", contexts: ["estudio", "creando", "curiosidad"], icon: "🔊", description: "Genera ondas sonoras (senoidal, cuadrada, triangular, sierra) y visualiza audio de archivos. Herramienta educativa de física del sonido con frecuencias y notas musicales", url: "/generador-ondas/", keywords: ["ondas", "waveform", "senoidal", "cuadrada", "triangular", "frecuencia", "hz", "audio", "visualizador", "sonido", "osciloscopio", "generador tonos", "notas musicales"] },
  { name: "Editor EXIF", category: "Diseño Web", contexts: ["creando", "casa"], icon: "📷", description: "Visualiza y elimina metadatos EXIF de tus fotos: GPS, cámara, fecha, dispositivo. Protege tu privacidad antes de compartir imágenes online", url: "/editor-exif/", keywords: ["exif", "metadatos", "fotos", "privacidad", "gps", "ubicacion", "camara", "eliminar", "limpiar", "seguridad", "imagen"] },

  // ============================================
  // 4. Emprendimiento y SEO (17)
  // ============================================
  { name: "Calculadora Tarifa Freelance", category: "Emprendimiento y SEO", contexts: ["trabajo", "dinero"], icon: "💼", description: "Calcula tu tarifa freelance ideal considerando gastos, impuestos, vacaciones y margen de beneficio. Evita cobrar de menos", url: "/calculadora-tarifa-freelance/", keywords: ["freelance", "tarifa", "precio", "autonomo", "honorarios"] },
  { name: "Calculadora Break-Even", category: "Emprendimiento y SEO", contexts: ["trabajo", "dinero"], icon: "💼", description: "Calcula el punto de equilibrio de tus productos. Analiza margen de contribución, rentabilidad y escenarios de costos/precios", url: "/calculadora-break-even/", keywords: ["break even", "punto equilibrio", "costos", "precio", "rentabilidad"] },
  { name: "Planificador Cash Flow", category: "Emprendimiento y SEO", contexts: ["trabajo", "dinero"], icon: "💼", description: "Proyecta tu flujo de caja a 12 meses. Identifica meses críticos, previene crisis de liquidez y simula escenarios What-If", url: "/planificador-cashflow/", keywords: ["cash flow", "flujo caja", "liquidez", "tesoreria", "finanzas"] },
  { name: "Calculadora ROI Marketing", category: "Emprendimiento y SEO", contexts: ["trabajo", "creando"], icon: "💼", description: "Calcula el ROI por canal de marketing (Google Ads, Facebook, email, SEO). Analiza CAC, CLV y optimiza tu inversión publicitaria", url: "/calculadora-roi-marketing/", keywords: ["roi", "marketing", "publicidad", "cac", "clv", "ads"] },
  { name: "Generador de Nombres", category: "Emprendimiento y SEO", contexts: ["trabajo"], icon: "💼", description: "Genera nombres creativos para tu empresa por sectores. Enlaces directos para verificar disponibilidad y registrar dominios .com, .es", url: "/generador-nombres-empresa/", keywords: ["nombre", "empresa", "marca", "branding", "dominio", "startup"] },
  { name: "Simulador Gastos Deducibles", category: "Emprendimiento y SEO", contexts: ["trabajo", "dinero"], icon: "💼", description: "Calcula tu ahorro fiscal con gastos deducibles. Descubre qué gastos puedes deducir (100%, 50%, 30%) y optimiza tu declaración de IRPF e IVA", url: "/simulador-gastos-deducibles/", keywords: ["gastos deducibles", "autonomo", "irpf", "iva", "hacienda", "deduccion"] },
  { name: "Curso de Emprendimiento", category: "Emprendimiento y SEO", contexts: ["estudio", "trabajo"], icon: "📚", description: "Guía práctica de emprendimiento: de la idea al primer cliente con ejemplos españoles", url: "/curso-emprendimiento/", keywords: ["emprendimiento", "negocio", "startup", "empresa", "curso"] },
  { name: "Generador de Meta Descripciones", category: "Emprendimiento y SEO", contexts: ["creando", "trabajo"], icon: "🔍", description: "Genera meta descripciones optimizadas para SEO con contador de caracteres y vista previa de Google. Mejora tu CTR", url: "/generador-meta-descripciones/", keywords: ["meta description", "seo", "google", "serp", "ctr", "snippet", "descripcion"] },
  { name: "Analizador de Densidad SEO", category: "Emprendimiento y SEO", contexts: ["creando", "trabajo"], icon: "📊", description: "Analiza la densidad de palabras clave en tu texto. Detecta sobreoptimización y sugiere mejoras para SEO on-page", url: "/analizador-densidad-seo/", keywords: ["densidad", "keywords", "seo", "palabras clave", "optimizacion", "on-page"] },
  { name: "Generador de Palabras Clave", category: "Emprendimiento y SEO", contexts: ["creando", "trabajo"], icon: "🔑", description: "Genera ideas de palabras clave long-tail a partir de una semilla. Variaciones, preguntas y sugerencias por categoría", url: "/generador-palabras-clave/", keywords: ["palabras clave", "keywords", "seo", "long tail", "semrush", "ideas", "contenido"] },
  { name: "Generador de Hashtags", category: "Emprendimiento y SEO", contexts: ["creando"], icon: "#️⃣", description: "Genera hashtags relevantes para Instagram, Twitter, TikTok y LinkedIn. Categorías por nicho y tendencias", url: "/generador-hashtags/", keywords: ["hashtags", "instagram", "twitter", "tiktok", "redes sociales", "trending", "viral"] },
  { name: "Analizador de Títulos SEO", category: "Emprendimiento y SEO", contexts: ["creando", "trabajo"], icon: "📝", description: "Analiza y optimiza títulos para SEO. Puntuación CTR, palabras poderosas, longitud óptima y vista previa SERP", url: "/analizador-titulos-seo/", keywords: ["titulo", "seo", "ctr", "serp", "headline", "h1", "meta title", "palabras poderosas"] },
  { name: "Calculadora de Legibilidad", category: "Emprendimiento y SEO", contexts: ["creando", "trabajo"], icon: "📖", description: "Calcula índices de legibilidad Flesch-Szigriszt, Fernández Huerta e INFLESZ. Optimiza textos para tu audiencia", url: "/calculadora-legibilidad/", keywords: ["legibilidad", "flesch", "readability", "inflesz", "fernandez huerta", "lectura", "comprension"] },
  { name: "Calculadora Tiempo de Lectura", category: "Emprendimiento y SEO", contexts: ["creando"], icon: "⏱️", description: "Calcula el tiempo de lectura de tu contenido. Velocidad configurable, tiempo hablado y badge para tu artículo", url: "/calculadora-tiempo-lectura/", keywords: ["tiempo lectura", "reading time", "palabras por minuto", "ppm", "contenido", "articulo", "badge"] },
  { name: "Generador de Schema Markup", category: "Emprendimiento y SEO", contexts: ["creando", "trabajo"], icon: "🏷️", description: "Genera código JSON-LD Schema.org para SEO. Artículos, productos, FAQ, negocios locales y recetas", url: "/generador-schema-markup/", keywords: ["schema", "json-ld", "structured data", "rich snippets", "seo tecnico", "schema.org", "markup"] },
  { name: "Generador de Facturas", category: "Emprendimiento y SEO", contexts: ["trabajo", "dinero"], icon: "🧾", description: "Crea facturas profesionales para autónomos. IVA automático, retención IRPF, múltiples líneas y exportación a PDF", url: "/generador-facturas/", keywords: ["factura", "autonomo", "facturar", "iva", "irpf", "pdf", "plantilla factura", "pequeña empresa"] },
  { name: "Generador de Carruseles", category: "Emprendimiento y SEO", contexts: ["creando", "trabajo"], icon: "📱", description: "Crea carruseles profesionales para Instagram y LinkedIn. Diseña slides, elige plantillas, personaliza colores y descarga como imágenes PNG", url: "/generador-carruseles/", keywords: ["carrusel", "instagram", "linkedin", "slides", "redes sociales", "marketing", "contenido", "png"] },
  { name: "Analizador GEO/AEO", category: "Emprendimiento y SEO", contexts: ["creando", "trabajo"], icon: "🤖", description: "Analiza y optimiza tu contenido para ser citado por ChatGPT, Perplexity, Gemini y Google AI Overviews. Puntuación GEO con recomendaciones", url: "/analizador-geo/", keywords: ["geo", "aeo", "ia", "chatgpt", "perplexity", "gemini", "optimizacion", "citabilidad", "seo ia", "answer engine"] },

  // ============================================
  // 5. Finanzas Personales (15)
  // ============================================
  { name: "Simulador de Hipoteca", category: "Finanzas Personales", contexts: ["dinero", "casa"], icon: "💰", description: "Calcula tu hipoteca con cuadro de amortización completo y análisis detallado", url: "/simulador-hipoteca/", keywords: ["prestamo", "casa", "vivienda", "banco", "interes", "amortizacion", "cuota", "euribor"] },
  { name: "Calculadora de Jubilación", category: "Finanzas Personales", contexts: ["dinero"], icon: "💰", description: "Planifica tu jubilación calculando ahorros necesarios y pensión estimada", url: "/calculadora-jubilacion/", keywords: ["pension", "retiro", "ahorro", "inversion", "planes", "seguridad social"] },
  { name: "Calculadora de Inversiones", category: "Finanzas Personales", contexts: ["dinero"], icon: "💰", description: "Simula el crecimiento de tus inversiones con interés compuesto", url: "/calculadora-inversiones/", keywords: ["bolsa", "acciones", "fondos", "rentabilidad", "capital", "dividendos"] },
  { name: "Calculadora de Interés Compuesto", category: "Finanzas Personales", contexts: ["dinero", "estudio"], icon: "💰", description: "Calcula el interés compuesto de tus ahorros e inversiones a largo plazo", url: "/interes-compuesto/", keywords: ["ahorro", "capital", "rentabilidad", "interes", "compuesto"] },
  { name: "Test de Perfil Inversor", category: "Finanzas Personales", contexts: ["dinero"], icon: "🎯", description: "Descubre tu tolerancia al riesgo con un test de 10 preguntas y recibe recomendaciones personalizadas", url: "/test-perfil-inversor/", keywords: ["perfil", "inversor", "riesgo", "tolerancia", "test", "cuestionario", "inversion"] },
  { name: "Control de Gastos", category: "Finanzas Personales", contexts: ["dinero", "casa"], icon: "💰", description: "Controla tus gastos e ingresos mensuales con gráficos y categorización automática", url: "/control-gastos/", keywords: ["presupuesto", "gastos", "ingresos", "finanzas personales", "ahorro"] },
  { name: "Calculadora TIR-VAN", category: "Finanzas Personales", contexts: ["dinero", "trabajo", "estudio"], icon: "💰", description: "Calcula TIR y VAN para análisis de inversiones y proyectos", url: "/calculadora-tir-van/", keywords: ["tir", "van", "inversion", "proyecto", "rentabilidad", "flujo caja"] },
  { name: "Simulador de Préstamos", category: "Finanzas Personales", contexts: ["dinero"], icon: "🏦", description: "Compara sistemas de amortización: francés, alemán y americano. Cuadro completo, TAE vs TIN y comisiones", url: "/simulador-prestamos/", keywords: ["prestamo", "amortizacion", "frances", "aleman", "americano", "cuota", "TAE", "TIN", "interes"] },
  { name: "Amortización Anticipada Hipoteca", category: "Finanzas Personales", contexts: ["dinero", "casa"], icon: "🏠", description: "Calcula el ahorro al amortizar tu hipoteca: reducir cuota vs reducir plazo. Comparativa y recomendación", url: "/amortizacion-hipoteca/", keywords: ["amortizacion anticipada", "hipoteca", "reducir cuota", "reducir plazo", "ahorro intereses", "cancelacion parcial"] },
  { name: "Calculadora de Inflación", category: "Finanzas Personales", contexts: ["dinero", "curiosidad"], icon: "📈", description: "Calcula cómo la inflación afecta tu dinero. Poder adquisitivo histórico con datos del INE desde 1961", url: "/calculadora-inflacion/", keywords: ["inflacion", "ipc", "poder adquisitivo", "ine", "precios", "coste vida", "devaluacion"] },
  { name: "Curso Decisiones de Inversión", category: "Finanzas Personales", contexts: ["estudio", "dinero"], icon: "📚", description: "Aprende a tomar decisiones de inversión inteligentes con este curso interactivo", url: "/curso-decisiones-inversion/", keywords: ["curso", "inversion", "finanzas", "aprender", "bolsa"] },
  { name: "Calculadora de Suscripciones", category: "Finanzas Personales", contexts: ["dinero", "casa"], icon: "💳", description: "Controla tus suscripciones (Netflix, Spotify, gym...). Calcula gasto mensual y anual. Detecta gastos olvidados", url: "/calculadora-suscripciones/", keywords: ["suscripciones", "netflix", "spotify", "gastos recurrentes", "mensual", "anual", "control gastos"] },
  { name: "Calculadora Roommates", category: "Finanzas Personales", contexts: ["dinero", "casa"], icon: "🏠", description: "Divide los gastos del piso entre compañeros de forma justa. Calcula quién debe a quién automáticamente", url: "/calculadora-roommates/", keywords: ["roommates", "piso compartido", "dividir gastos", "compañeros", "deudas", "luz", "internet"] },
  { name: "Calculadora Alquiler vs Compra", category: "Finanzas Personales", contexts: ["dinero", "casa"], icon: "🏡", description: "¿Alquilar o comprar vivienda? Análisis financiero completo con hipoteca, gastos y coste de oportunidad", url: "/calculadora-alquiler-vs-compra/", keywords: ["alquiler", "compra", "vivienda", "hipoteca", "inversion", "coste oportunidad"] },

  // ============================================
  // 6. Herramientas Académicas (9)
  // ============================================
  { name: "Calculadora de Movimiento", category: "Herramientas Académicas", contexts: ["estudio"], icon: "🧪", description: "Calculadora interactiva de cinemática con gráficos y animaciones para MRU, MRUA, caída libre y tiro parabólico", url: "/calculadora-movimiento/", keywords: ["fisica", "cinematica", "movimiento", "velocidad", "aceleracion", "mru", "mrua"] },
  { name: "Tabla Periódica Interactiva", category: "Herramientas Académicas", contexts: ["estudio", "curiosidad"], icon: "⚛️", description: "Tabla periódica interactiva con 118 elementos, calculadora de masa molar y filtros avanzados", url: "/tabla-periodica/", keywords: ["quimica", "elementos", "atomos", "tabla periodica", "propiedades", "masa molar"] },
  { name: "Glosario de Física y Química", category: "Herramientas Académicas", contexts: ["estudio", "curiosidad"], icon: "🧪", description: "Glosario interactivo de física y química con quizzes educativos y sistema de gamificación", url: "/glosario-fisica-quimica/", keywords: ["glosario", "definiciones", "terminos", "fisica", "quimica"] },
  { name: "Calculadora de Electricidad", category: "Herramientas Académicas", contexts: ["estudio", "casa"], icon: "⚡", description: "Calculadora completa de electricidad: Ley de Ohm, potencia, resistencias y análisis de circuitos eléctricos", url: "/calculadora-electricidad/", keywords: ["electricidad", "ohm", "resistencia", "voltaje", "corriente", "circuito"] },
  { name: "Calculadora de Notas", category: "Herramientas Académicas", contexts: ["estudio"], icon: "📚", description: "Calcula tu media académica ponderada y nota final del curso", url: "/calculadora-notas/", keywords: ["notas", "calificaciones", "media", "universidad", "estudiante"] },
  { name: "Generador de Horarios de Estudio", category: "Herramientas Académicas", contexts: ["estudio"], icon: "📚", description: "Genera horarios de estudio personalizados con distribución inteligente de tiempo. Técnica Pomodoro, gestión de prioridades y calendario visual", url: "/generador-horarios-estudio/", keywords: ["horario", "estudio", "planificar", "calendario", "pomodoro"] },
  { name: "Creador de Flashcards", category: "Herramientas Académicas", contexts: ["estudio"], icon: "📚", description: "Crea y estudia con flashcards personalizadas. Modo estudio interactivo, gestión de mazos, importa/exporta tarjetas", url: "/creador-flashcards/", keywords: ["flashcards", "tarjetas", "estudio", "memorizar", "aprender"] },
  { name: "Curso de Introducción a la Teoría Política", category: "Herramientas Académicas", contexts: ["estudio"], icon: "🏛️", description: "Aprende los fundamentos del pensamiento político: desde Platón y Aristóteles hasta Marx y Rawls. 9 capítulos con los grandes pensadores", url: "/curso-teoria-politica/", keywords: ["teoria politica", "filosofia politica", "platon", "aristoteles", "maquiavelo", "hobbes", "locke", "rousseau", "marx", "rawls", "curso", "politica"] },
  { name: "Curso de Pensamiento Científico", category: "Herramientas Académicas", contexts: ["estudio"], icon: "🧠", description: "Aprende el método científico, pensamiento crítico, falacias lógicas y cómo aplicar la ciencia en tu vida cotidiana. 12 capítulos interactivos", url: "/curso-pensamiento-cientifico/", keywords: ["pensamiento cientifico", "metodo cientifico", "pensamiento critico", "falacias", "logica", "ciencia", "sesgos", "pseudociencia", "popper", "kuhn"] },
  { name: "Curso de Pensamiento Sistémico", category: "Herramientas Académicas", contexts: ["estudio", "trabajo"], icon: "🔄", description: "Aprende a entender el mundo como sistemas interconectados: redes, retroalimentación, emergencia, antifragilidad y aplicaciones prácticas. 20 capítulos", url: "/curso-pensamiento-sistemico/", keywords: ["pensamiento sistemico", "teoria sistemas", "complejidad", "retroalimentacion", "emergencia", "antifragilidad", "redes", "holismo", "sistemas complejos", "dinamica sistemas"] },
  { name: "Curso de Empresa Familiar", category: "Herramientas Académicas", contexts: ["estudio", "trabajo"], icon: "🏢", description: "Domina la gestión de empresas familiares: gobierno corporativo, protocolo familiar, sucesión, modelos de gestión. Casos Inditex, Mercadona, El Corte Inglés. 12 capítulos", url: "/curso-empresa-familiar/", keywords: ["empresa familiar", "sucesion", "protocolo familiar", "consejo familia", "gobierno corporativo", "inditex", "mercadona", "pyme", "herencia empresarial", "profesionalizacion"] },
  { name: "Curso de Negociación Exitosa", category: "Herramientas Académicas", contexts: ["estudio", "trabajo"], icon: "🤝", description: "Domina el arte de negociar: BATNA, ZOPA, tácticas de persuasión, Cialdini, cierre de acuerdos, resolución de conflictos y negociación multicultural. 12 capítulos", url: "/curso-negociacion/", keywords: ["negociacion", "batna", "zopa", "persuasion", "cialdini", "cierre ventas", "contratos", "mediacion", "arbitraje", "negociacion internacional"] },
  { name: "Curso de Optimización para IAs (GEO/AEO)", category: "Emprendimiento y SEO", contexts: ["estudio", "trabajo", "creando"], icon: "🤖", description: "Aprende GEO y AEO: optimiza tu contenido para que ChatGPT, Perplexity y Gemini lo citen. LLMs, RAG, E-E-A-T, Schema Markup y estrategias por plataforma. 6 capítulos", url: "/curso-optimizacion-ia/", keywords: ["geo", "aeo", "optimizacion ia", "chatgpt seo", "perplexity", "gemini", "llm", "rag", "eeat", "schema markup", "citaciones ia", "seo 2025"] },
  { name: "Curso de Marketing Digital 2025", category: "Emprendimiento y SEO", contexts: ["estudio", "trabajo", "creando"], icon: "📈", description: "Domina el marketing digital: branding, SEO, redes sociales, Meta Ads, Google Ads, automatización e IA. 30 capítulos prácticos con ejemplos reales", url: "/curso-marketing-digital/", keywords: ["marketing digital", "branding", "seo", "redes sociales", "meta ads", "google ads", "automatizacion", "ia marketing", "customer journey", "kpis", "storytelling", "copywriting", "publicidad digital"] },
  { name: "Curso de Estrategia Empresarial", category: "Herramientas Académicas", contexts: ["estudio", "trabajo"], icon: "♟️", description: "Pensamiento estratégico para la era de la incertidumbre: Porter actualizado, fracasos de empresas excelentes, nuevos moats, experimentación vs planificación. 10 capítulos", url: "/curso-estrategia-empresarial/", keywords: ["estrategia empresarial", "porter", "swot", "ventaja competitiva", "disrupcion", "antifragilidad", "planificacion estrategica", "moats", "kodak", "nokia", "openai", "tesla", "amazon"] },
  { name: "Curso de Criptografía y Seguridad", category: "Criptografía y Seguridad", contexts: ["estudio", "trabajo", "curiosidad"], icon: "🔐", description: "Domina la criptografía: desde cifrados históricos (César, Vigenère, Enigma) hasta técnicas modernas (AES, SHA-256, 2FA). 15 capítulos con herramientas prácticas", url: "/curso-criptografia-seguridad/", keywords: ["criptografia", "seguridad", "cifrado", "aes", "hash", "sha256", "md5", "contrasenas", "cesar", "vigenere", "playfair", "base64", "2fa", "autenticacion"] },
  { name: "Curso de Redacción Académica", category: "Herramientas Académicas", contexts: ["estudio", "trabajo"], icon: "📝", description: "Guía práctica para escribir textos académicos: estructura tu TFG, TFM, tesis o artículo con pautas aplicables desde el primer día. Citas APA, coherencia, estilo y más. 13 capítulos", url: "/curso-redaccion-academica/", keywords: ["redaccion academica", "tfg", "tfm", "tesis", "articulo cientifico", "citas apa", "bibliografia", "abstract", "introduccion", "conclusiones", "coherencia", "estilo academico", "escritura"] },
  { name: "Guía Cuidado de Mascotas", category: "Vida Cotidiana", contexts: ["casa", "curiosidad"], icon: "🐾", description: "Todo lo que necesitas saber para cuidar a tu perro o gato: alimentación, salud, parásitos, crecimiento, emergencias y herramientas útiles. 8 capítulos fáciles y cercanos", url: "/guia-cuidado-mascota/", keywords: ["mascotas", "perros", "gatos", "alimentacion", "veterinario", "antiparasitarios", "cachorros", "salud mascota", "cuidado animal", "adopcion"] },

  // ============================================
  // 7. Impuestos y Fiscalidad (9)
  // ============================================
  { name: "Simulador IRPF", category: "Impuestos y Fiscalidad", contexts: ["dinero", "trabajo"], icon: "💰", description: "Calcula tu IRPF y retenciones según la normativa fiscal española actual", url: "/simulador-irpf/", keywords: ["impuestos", "renta", "hacienda", "declaracion", "retenciones", "fiscal"] },
  { name: "Calculadora de Donaciones - Cataluña", category: "Impuestos y Fiscalidad", contexts: ["dinero"], icon: "💰", description: "Calcula el impuesto de donaciones según la normativa catalana con tarifa reducida, primera vivienda y bonificaciones", url: "/calculadora-donaciones-cataluna/", keywords: ["donacion", "impuesto", "cataluna", "catalunya", "herencia", "fiscal", "tarifa reducida"] },
  { name: "Calculadora de Donaciones - Nacional", category: "Impuestos y Fiscalidad", contexts: ["dinero"], icon: "💰", description: "Calcula el impuesto de donaciones para 14 comunidades autónomas con bonificaciones actualizadas 2025", url: "/calculadora-donaciones-nacional/", keywords: ["donacion", "impuesto", "comunidad autonoma", "regimen comun", "nacional", "fiscal", "madrid", "andalucia"] },
  { name: "Calculadora de Sucesiones - Cataluña", category: "Impuestos y Fiscalidad", contexts: ["dinero"], icon: "💰", description: "Calcula el impuesto de sucesiones (herencias) con normativa catalana: bonificación cónyuge 99%, vivienda habitual 95%", url: "/calculadora-sucesiones-cataluna/", keywords: ["herencia", "testamento", "sucesion", "impuesto", "cataluna", "catalunya", "fiscal"] },
  { name: "Calculadora de Sucesiones - Nacional", category: "Impuestos y Fiscalidad", contexts: ["dinero"], icon: "💰", description: "Calcula el impuesto de sucesiones para 14 CCAA: bonificaciones desde 99% (Madrid) hasta 0% (Asturias)", url: "/calculadora-sucesiones-nacional/", keywords: ["herencia", "testamento", "sucesion", "impuesto", "regimen comun", "nacional", "fiscal", "bonificaciones"] },
  { name: "Calculadora Plusvalías IRPF", category: "Impuestos y Fiscalidad", contexts: ["dinero"], icon: "📊", description: "Calcula el IRPF de tus inversiones: plusvalías de acciones, fondos, criptomonedas, dividendos e intereses con tramos 2025", url: "/calculadora-plusvalias-irpf/", keywords: ["plusvalias", "irpf", "capital mobiliario", "dividendos", "acciones", "criptomonedas", "fondos", "tramos ahorro"] },
  { name: "Guía Tramitación Herencias", category: "Impuestos y Fiscalidad", contexts: ["dinero"], icon: "📋", description: "Guía paso a paso para tramitar una herencia: checklist documentos, orden de gestiones, plazos críticos y costes orientativos de notaría y registro", url: "/guia-tramitacion-herencias/", keywords: ["herencia", "tramitar", "testamento", "notario", "registro", "sucesion", "documentos", "checklist", "plazos", "abintestato"] },
  { name: "Herencias Paso a Paso", category: "Impuestos y Fiscalidad", contexts: ["estudio", "dinero"], icon: "📜", description: "Curso práctico de 9 capítulos para gestionar una herencia en España: desde los primeros pasos hasta la escritura final. Incluye glosario legal y enlaces a calculadoras de impuestos", url: "/herencias-paso-a-paso/", keywords: ["herencia", "curso", "sucesion", "testamento", "herederos", "impuesto sucesiones", "plusvalia", "notario", "registro", "aceptar herencia", "renunciar herencia", "glosario legal"] },

  // ============================================
  // 8. Juegos y Entretenimiento (12)
  // ============================================
  { name: "Test de Velocidad de Escritura", category: "Juegos y Entretenimiento", contexts: ["relax", "trabajo", "estudio"], icon: "⌨️", description: "Mide tu velocidad de escritura en palabras por minuto (PPM) y mejora tu mecanografía con textos en español", url: "/test-velocidad-escritura/", keywords: ["mecanografia", "velocidad", "escritura", "ppm", "palabras por minuto", "typing test", "teclado"] },
  { name: "Radio meskeIA", category: "Juegos y Entretenimiento", contexts: ["relax", "casa", "trabajo"], icon: "📻", description: "Escucha miles de emisoras de radio de todo el mundo en vivo", url: "/radio-meskeia/", keywords: ["radio", "musica", "emisoras", "streaming", "noticias", "podcasts", "online"] },
  { name: "Juego Wordle", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "🎮", description: "Adivina la palabra del día en español con 6 intentos", url: "/juego-wordle/", keywords: ["wordle", "palabra", "juego", "adivinar", "español"] },
  { name: "Juego Sudoku", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "🎮", description: "Resuelve puzzles Sudoku con diferentes niveles de dificultad", url: "/juego-sudoku/", keywords: ["sudoku", "puzzle", "numeros", "logica", "juego"] },
  { name: "Juego Tres en Raya", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "🎮", description: "Juega al clásico tres en raya contra la computadora", url: "/juego-tres-en-raya/", keywords: ["tres en raya", "tic tac toe", "juego", "clasico"] },
  { name: "Juego de Memoria", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "🎮", description: "Entrena tu memoria encontrando parejas de cartas", url: "/juego-memoria/", keywords: ["memoria", "cartas", "parejas", "concentracion", "juego"] },
  { name: "Juego Piedra Papel Tijera", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "🎮", description: "Juega piedra, papel o tijera contra la computadora", url: "/juego-piedra-papel-tijera/", keywords: ["piedra", "papel", "tijera", "juego", "clasico"] },
  { name: "Juego 2048", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "🎮", description: "Desliza y combina números para llegar a 2048", url: "/juego-2048/", keywords: ["2048", "numeros", "puzzle", "juego", "estrategia"] },
  { name: "Juego Puzzle Matemático", category: "Juegos y Entretenimiento", contexts: ["relax", "estudio"], icon: "🎮", description: "Resuelve puzzles matemáticos y ejercita tu mente", url: "/juego-puzzle-matematico/", keywords: ["puzzle", "matematicas", "logica", "juego", "cerebro"] },
  { name: "Juego Asteroids", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "🚀", description: "Juega al clásico Asteroids: controla tu nave, destruye asteroides y OVNIs en este arcade espacial", url: "/juego-asteroids/", keywords: ["asteroids", "arcade", "nave", "espacio", "retro", "clasico", "disparos"] },
  { name: "Juego Space Invaders", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "👾", description: "Defiende la Tierra de la invasión alienígena en el clásico Space Invaders", url: "/juego-space-invaders/", keywords: ["space invaders", "arcade", "aliens", "invasores", "retro", "clasico", "disparos"] },
  { name: "Juego Platform Runner", category: "Juegos y Entretenimiento", contexts: ["relax"], icon: "🏃", description: "Corre, salta, recolecta monedas y derrota enemigos en este juego de plataformas", url: "/juego-platform-runner/", keywords: ["plataformas", "runner", "saltar", "monedas", "enemigos", "niveles", "arcade"] },
  { name: "Ruleta Aleatoria", category: "Juegos y Entretenimiento", contexts: ["relax", "trabajo", "curiosidad"], icon: "🎡", description: "Ruleta personalizable para sorteos, decisiones y selección al azar. Añade opciones, gira y elige ganador", url: "/ruleta-aleatoria/", keywords: ["ruleta", "sorteo", "aleatorio", "wheel of names", "decision", "elegir", "azar", "girar"] },
  { name: "Generador de Lotería", category: "Juegos y Entretenimiento", contexts: ["relax", "curiosidad"], icon: "🎲", description: "Genera números aleatorios para Primitiva, Euromillones, Bonoloto, El Gordo y Lototurf. Combinaciones al azar y favoritos", url: "/generador-loteria/", keywords: ["loteria", "primitiva", "euromillones", "bonoloto", "numeros", "sorteo", "gordo", "suerte", "combinacion"] },

  // ============================================
  // 9. Matemáticas y Estadística (11)
  // ============================================
  { name: "Calculadora de Probabilidad", category: "Matemáticas y Estadística", contexts: ["estudio"], icon: "📐", description: "Calculadora completa de probabilidades con teoría y simulaciones", url: "/calculadora-probabilidad/", keywords: ["probabilidad", "estadistica", "azar", "combinatoria", "permutaciones"] },
  { name: "Calculadora MCD y MCM", category: "Matemáticas y Estadística", contexts: ["estudio"], icon: "📐", description: "Calcula el Máximo Común Divisor y Mínimo Común Múltiplo de hasta 5 números con explicación paso a paso", url: "/calculadora-mcd-mcm/", keywords: ["mcd", "mcm", "maximo comun divisor", "minimo comun multiplo", "factorizacion", "primos"] },
  { name: "Calculadora Estadística", category: "Matemáticas y Estadística", contexts: ["estudio", "trabajo"], icon: "📐", description: "Calcula media, mediana, desviación estándar y análisis estadístico completo", url: "/calculadora-estadistica/", keywords: ["estadistica", "media", "mediana", "desviacion", "datos"] },
  { name: "Calculadora Matemática Avanzada", category: "Matemáticas y Estadística", contexts: ["estudio"], icon: "📐", description: "Resuelve ecuaciones, matrices, derivadas e integrales online", url: "/calculadora-matematica/", keywords: ["matematicas", "ecuaciones", "matrices", "calcular", "resolver"] },
  { name: "Calculadora de Ecuaciones", category: "Matemáticas y Estadística", contexts: ["estudio"], icon: "📐", description: "Resuelve ecuaciones lineales, cuadráticas y sistemas 2x2 con explicaciones paso a paso", url: "/algebra-ecuaciones/", keywords: ["ecuaciones", "sistemas", "lineal", "cuadratica", "algebra", "resolver", "paso a paso"] },
  { name: "Calculadora de Geometría", category: "Matemáticas y Estadística", contexts: ["estudio", "casa"], icon: "📐", description: "Calcula áreas, perímetros y volúmenes de figuras geométricas", url: "/calculadora-geometria/", keywords: ["area", "perimetro", "volumen", "figuras", "geometria", "triangulo", "circulo"] },
  { name: "Calculadora de Cálculo", category: "Matemáticas y Estadística", contexts: ["estudio"], icon: "📐", description: "Deriva e integra funciones, límites y análisis matemático", url: "/calculadora-calculo/", keywords: ["derivadas", "integrales", "limites", "calculo", "funciones"] },
  { name: "Calculadora de Trigonometría", category: "Matemáticas y Estadística", contexts: ["estudio"], icon: "📐", description: "Funciones trigonométricas, identidades y triángulos", url: "/calculadora-trigonometria/", keywords: ["seno", "coseno", "tangente", "trigonometria", "angulos"] },
  { name: "Calculadora Teoría de Números", category: "Matemáticas y Estadística", contexts: ["estudio", "curiosidad"], icon: "📐", description: "Números primos, factorización y teoría de números", url: "/calculadora-teoria-numeros/", keywords: ["primos", "factorizacion", "divisores", "numeros"] },
  { name: "Calculadora Álgebra Abstracta", category: "Matemáticas y Estadística", contexts: ["estudio"], icon: "📐", description: "Grupos, anillos, campos y estructuras algebraicas", url: "/calculadora-algebra-abstracta/", keywords: ["grupos", "anillos", "campos", "abstracta"] },
  { name: "Calculadora Teoría de Colas", category: "Matemáticas y Estadística", contexts: ["estudio", "trabajo"], icon: "📐", description: "Calcula métricas de sistemas de colas M/M/1: utilización, tiempos de espera y simulación", url: "/calculadora-teoria-colas/", keywords: ["teoria colas", "mm1", "sistema espera", "utilizacion", "little", "poisson"] },

  // ============================================
  // 10. Productividad (13)
  // ============================================
  { name: "Notas", category: "Productividad", contexts: ["trabajo", "estudio", "casa"], icon: "📝", description: "Guarda tus notas, ideas y apuntes organizados por categorías con guardado automático local", url: "/notas/", keywords: ["notas", "apuntes", "ideas", "texto", "escribir", "guardar", "categorias"] },
  { name: "Temporizador Pomodoro", category: "Productividad", contexts: ["trabajo", "estudio"], icon: "🍅", description: "Técnica Pomodoro con sesiones configurables, estadísticas de productividad y sonidos. Mejora tu concentración", url: "/temporizador-pomodoro/", keywords: ["pomodoro", "temporizador", "productividad", "concentracion", "tecnica pomodoro", "timer", "enfoque", "trabajo", "estudio"] },
  { name: "Lista de Tareas", category: "Productividad", contexts: ["trabajo", "casa", "estudio"], icon: "⚡", description: "Organiza tus tareas pendientes con categorías, prioridades y fechas límite", url: "/lista-tareas/", keywords: ["tareas", "todo", "pendientes", "organizar", "productividad"] },
  { name: "Cronómetro y Temporizador", category: "Productividad", contexts: ["trabajo", "estudio", "casa"], icon: "⚡", description: "Cronómetro con vueltas y temporizador con cuenta regresiva y alarma sonora", url: "/cronometro/", keywords: ["cronometro", "temporizador", "pomodoro", "stopwatch", "timer", "alarma", "tiempo", "productividad", "concentracion", "descansos"] },
  { name: "Conversor de Horarios", category: "Productividad", contexts: ["trabajo", "curiosidad"], icon: "⚡", description: "Convierte horarios entre 25+ ciudades del mundo con reloj mundial en tiempo real", url: "/conversor-horarios/", keywords: ["horarios", "zonas horarias", "reloj mundial", "diferencia horaria", "hora internacional", "convertir hora", "tiempo mundial"] },
  { name: "Información del Tiempo", category: "Productividad", contexts: ["casa", "trabajo"], icon: "⚡", description: "Consulta el pronóstico del tiempo para cualquier ciudad del mundo", url: "/informacion-tiempo/", keywords: ["clima", "tiempo", "meteorologia", "pronostico", "temperatura"] },
  { name: "Generador de Contraseñas", category: "Criptografía y Seguridad", contexts: ["trabajo", "casa"], icon: "🔐", description: "Crea contraseñas seguras y personalizadas con diferentes niveles de complejidad", url: "/generador-contrasenas/", keywords: ["password", "seguridad", "contrasena", "generar", "segura"] },
  { name: "Generador de Códigos QR", category: "Productividad", contexts: ["trabajo", "creando"], icon: "⚡", description: "Crea códigos QR para URLs, texto, WiFi, contactos vCard, email y teléfono", url: "/generador-qr/", keywords: ["qr", "codigo", "generar", "escanear", "wifi", "vcard"] },
  { name: "Generador de Códigos de Barras", category: "Productividad", contexts: ["trabajo"], icon: "⚡", description: "Genera códigos de barras EAN-13, EAN-8, UPC-A, Code128 y Code39", url: "/generador-codigos-barras/", keywords: ["codigo barras", "ean13", "ean8", "code128", "upc", "barcode", "generar barras", "etiquetas productos", "inventario"] },
  { name: "Generador de Firmas Email", category: "Productividad", contexts: ["trabajo"], icon: "✉️", description: "Crea firmas de email profesionales en HTML. Compatible con Gmail, Outlook, Apple Mail. Múltiples plantillas y redes sociales", url: "/generador-firma-email/", keywords: ["firma", "email", "html", "gmail", "outlook", "profesional", "plantilla", "correo"] },
  { name: "Time Tracker", category: "Productividad", contexts: ["trabajo"], icon: "⏱️", description: "Registra tiempo por proyecto y cliente. Informes de horas trabajadas, exportación y tarifa por hora para freelancers", url: "/time-tracker/", keywords: ["time tracker", "horas", "proyecto", "cliente", "freelance", "registro tiempo", "facturacion"] },
  { name: "Conversor de Unidades", category: "Productividad", contexts: ["estudio", "casa", "trabajo"], icon: "🧪", description: "Conversor científico avanzado: 13 categorías incluyendo química, presión, energía, fuerza y potencia", url: "/conversor-unidades/", keywords: ["conversion", "unidades", "medidas", "fisica", "quimica"] },
  { name: "Lista de Equipaje", category: "Productividad", contexts: ["casa", "curiosidad"], icon: "🧳", description: "Genera una lista de equipaje personalizada según tipo de viaje, clima y duración. Checklist interactivo", url: "/lista-equipaje/", keywords: ["equipaje", "maleta", "viaje", "checklist", "vacaciones", "viajar", "empacar"] },
  { name: "Generador de Actas de Reunión", category: "Productividad", contexts: ["trabajo"], icon: "📋", description: "Crea actas de reunión profesionales con plantillas, gestión de asistentes, orden del día y seguimiento de tareas. Exporta a PDF", url: "/generador-actas/", keywords: ["actas", "reunion", "minuta", "acuerdos", "tareas", "asistentes", "junta", "comite", "orden del dia"] },
  { name: "Prueba de Cámara Web", category: "Productividad", contexts: ["trabajo"], icon: "📷", description: "Prueba tu webcam antes de videollamadas. Verifica resolución, ajusta brillo/contraste y toma fotos. 100% privado", url: "/prueba-camara/", keywords: ["camara", "webcam", "videollamada", "zoom", "meet", "teams", "probar camara", "test webcam", "foto"] },
  { name: "Prueba de Micrófono", category: "Productividad", contexts: ["trabajo"], icon: "🎙️", description: "Prueba tu micrófono antes de videollamadas. Visualiza niveles de audio, graba y reproduce. Sin registro, 100% privado", url: "/prueba-microfono/", keywords: ["microfono", "audio", "videollamada", "zoom", "meet", "teams", "probar micro", "test audio", "grabar voz"] },
  { name: "Mi IP y Conexión", category: "Productividad", contexts: ["trabajo", "curiosidad"], icon: "🌐", description: "Descubre tu IP pública, ubicación aproximada, proveedor de internet, tipo de conexión y velocidad. Historial de IPs", url: "/mi-ip/", keywords: ["mi ip", "ip publica", "cual es mi ip", "direccion ip", "isp", "proveedor internet", "geolocalización", "ipv4", "ipv6", "conexion"] },

  // ============================================
  // 11. Salud y Bienestar (15)
  // ============================================
  { name: "Calculadora IMC", category: "Salud y Bienestar", contexts: ["casa"], icon: "⚖️", description: "Calcula tu Índice de Masa Corporal y conoce tu clasificación según la OMS", url: "/calculadora-imc/", keywords: ["imc", "peso", "altura", "obesidad", "salud", "oms"] },
  { name: "Calculadora de Calorías", category: "Salud y Bienestar", contexts: ["casa"], icon: "🏥", description: "Calcula las calorías quemadas según tu actividad física, pasos y tiempo de ejercicio", url: "/calculadora-calorias-ejercicio/", keywords: ["calorias", "ejercicio", "deporte", "quemar", "actividad fisica"] },
  { name: "Calculadora de Hidratación", category: "Salud y Bienestar", contexts: ["casa"], icon: "🏥", description: "Calcula cuánta agua necesitas beber diariamente según tu peso, actividad física y clima", url: "/calculadora-hidratacion/", keywords: ["agua", "hidratacion", "beber", "litros", "salud"] },
  { name: "Calculadora de Sueño", category: "Salud y Bienestar", contexts: ["casa"], icon: "🏥", description: "Calcula tus ciclos de sueño ideales y descubre a qué hora acostarte para despertar descansado", url: "/calculadora-sueno/", keywords: ["sueño", "dormir", "ciclos", "descanso", "rem"] },
  { name: "Curso de Nutrición", category: "Salud y Bienestar", contexts: ["estudio", "casa"], icon: "🥗", description: "Curso de nutrición avanzado basado en ciencia. 15 capítulos sobre macronutrientes, micronutrientes, interacciones y aplicación práctica", url: "/curso-nutrisalud/", keywords: ["nutricion", "alimentos", "dieta", "salud", "vitaminas", "curso", "macronutrientes", "microbiota"] },
  { name: "Seguimiento de Hábitos", category: "Salud y Bienestar", contexts: ["casa"], icon: "🏥", description: "Rastrea tus hábitos saludables con visualización de rachas y estadísticas motivadoras", url: "/seguimiento-habitos/", keywords: ["habitos", "racha", "tracker", "rutina", "salud", "motivacion"] },
  { name: "Planificador de Menú Semanal", category: "Salud y Bienestar", contexts: ["casa"], icon: "📅", description: "Planifica tu menú semanal de forma equilibrada con sugerencias mediterráneas y consejos de compra", url: "/planificador-menu/", keywords: ["menu", "semanal", "planificar", "comidas", "dieta", "mediterranea", "batch cooking"] },
  { name: "Calculadora de Porciones", category: "Salud y Bienestar", contexts: ["casa"], icon: "✋", description: "Aprende a medir porciones de alimentos usando tu mano como referencia. Método visual y práctico", url: "/calculadora-porciones/", keywords: ["porciones", "mano", "medir", "raciones", "plato", "equilibrado"] },
  { name: "Test de Hábitos Saludables", category: "Salud y Bienestar", contexts: ["casa"], icon: "🌟", description: "Evalúa tus hábitos de vida con un test de 21 preguntas. Perfil visual de hidratación, alimentación, actividad y descanso", url: "/test-habitos/", keywords: ["test", "habitos", "saludables", "evaluacion", "bienestar", "estilo vida"] },
  { name: "Planificador Embarazo y Bebé", category: "Salud y Bienestar", contexts: ["casa"], icon: "🤰", description: "Planifica tu embarazo: calculadora FPP, checklist por trimestre, lista de compras del bebé y calendario de vacunación España 2024", url: "/planificador-embarazo/", keywords: ["embarazo", "fecha parto", "fpp", "semanas gestacion", "trimestre", "fur", "regla naegele", "checklist embarazo", "lista compras bebe", "vacunas recien nacido", "canastilla", "planificador"] },
  { name: "Planificador de Mascota", category: "Salud y Bienestar", contexts: ["casa"], icon: "🐾", description: "Organiza la llegada de tu cachorro o gatito: perfil, checklist por etapas, lista de compras y calendario de vacunas. Perros y gatos", url: "/planificador-mascota/", keywords: ["mascota", "cachorro", "gatito", "perro", "gato", "checklist", "vacunas perro", "vacunas gato", "compras mascota", "cuidados cachorro", "adoptar perro", "adoptar gato"] },
  { name: "Calculadora de Alimentación Mascotas", category: "Salud y Bienestar", contexts: ["casa"], icon: "🍖", description: "Calcula la cantidad diaria de comida para tu perro o gato según peso, edad y actividad. Incluye detector de alimentos tóxicos y guía de transición de pienso", url: "/calculadora-alimentacion-mascotas/", keywords: ["alimentacion perro", "comida gato", "cantidad pienso", "gramos diarios", "racion perro", "dieta mascota", "alimentos toxicos", "chocolate perro", "transicion pienso"] },
  { name: "Calculadora de Medicamentos Mascotas", category: "Salud y Bienestar", contexts: ["casa"], icon: "💊", description: "Calcula la dosis de antiparasitarios y medicamentos comunes para tu mascota según su peso. Incluye frecuencia de desparasitación y recordatorios", url: "/calculadora-medicamentos-mascotas/", keywords: ["dosis medicamento perro", "antiparasitario perro", "desparasitar gato", "pipeta perro", "collar antiparasitario", "dosis peso mascota", "veterinario", "pulgas", "garrapatas"] },
  { name: "Calculadora Tamaño Adulto Cachorro", category: "Salud y Bienestar", contexts: ["casa"], icon: "📏", description: "Predice el peso adulto de tu cachorro según su edad, peso actual y tamaño de raza. Curvas de crecimiento y tabla de razas de referencia", url: "/calculadora-tamano-adulto-perro/", keywords: ["peso adulto cachorro", "tamano perro", "crecimiento cachorro", "prediccion peso", "raza perro", "cuanto pesara mi perro", "desarrollo cachorro"] },
  { name: "Calculadora Percentiles Infantiles", category: "Salud y Bienestar", contexts: ["casa"], icon: "👶", description: "Calcula el percentil de peso y talla de tu bebé o niño según las tablas de crecimiento de la OMS", url: "/calculadora-percentiles/", keywords: ["percentiles", "peso bebe", "talla niño", "oms", "crecimiento infantil", "pediatria"] },

  // ============================================
  // 12. Texto y Conversores (14)
  // ============================================
  { name: "Contador de Palabras", category: "Texto y Conversores", contexts: ["trabajo", "estudio", "creando"], icon: "📝", description: "Cuenta palabras, caracteres, párrafos y tiempo de lectura en tiempo real. Objetivo de palabras configurable", url: "/contador-palabras/", keywords: ["contar", "palabras", "caracteres", "texto", "escritura"] },
  { name: "Conversor de Texto", category: "Texto y Conversores", contexts: ["trabajo", "creando"], icon: "📝", description: "Convierte texto entre MAYÚSCULAS, minúsculas, Capitalizado, Título, aLtErNaDo e iNvErTiDo", url: "/conversor-texto/", keywords: ["convertir", "mayusculas", "minusculas", "texto", "formato"] },
  { name: "Limpiador de Texto", category: "Texto y Conversores", contexts: ["trabajo", "creando"], icon: "📝", description: "Limpia texto eliminando espacios duplicados, líneas vacías extras, tabulaciones y caracteres especiales", url: "/limpiador-texto/", keywords: ["limpiar", "texto", "espacios", "formato", "eliminar"] },
  { name: "Comparador de Textos", category: "Texto y Conversores", contexts: ["trabajo", "creando"], icon: "📝", description: "Compara dos textos línea por línea detectando diferencias añadidas, eliminadas y modificadas. Ideal para editores, escritores y traductores", url: "/comparador-textos/", keywords: ["comparar", "diff", "diferencias", "texto", "cambios"] },
  { name: "Conversor Markdown-HTML", category: "Texto y Conversores", contexts: ["creando", "trabajo"], icon: "📝", description: "Convierte Markdown a HTML limpio con vista previa en tiempo real. Soporte completo de sintaxis: títulos, listas, enlaces, código, tablas", url: "/conversor-markdown-html/", keywords: ["markdown", "html", "convertir", "formato", "codigo"] },
  { name: "Conversor de Código Morse", category: "Texto y Conversores", contexts: ["curiosidad"], icon: "📡", description: "Convierte texto a código Morse y viceversa con reproducción de audio. Alfabeto completo y señales internacionales", url: "/conversor-morse/", keywords: ["morse", "codigo", "puntos", "rayas", "telegrafo", "sos", "audio"] },
  { name: "Conversor Números Romanos", category: "Texto y Conversores", contexts: ["curiosidad", "estudio"], icon: "🏛️", description: "Convierte entre números arábigos y romanos con desglose paso a paso. Tabla de símbolos y reglas explicadas", url: "/conversor-numeros-romanos/", keywords: ["romanos", "numeros", "conversion", "romano", "arabigo", "I", "V", "X", "L", "C", "D", "M"] },
  { name: "Detector de Idioma", category: "Texto y Conversores", contexts: ["trabajo", "curiosidad"], icon: "🌍", description: "Detecta automáticamente el idioma de cualquier texto. Soporta 10+ idiomas con porcentaje de confianza", url: "/detector-idioma/", keywords: ["idioma", "detector", "lengua", "traduccion", "español", "ingles", "frances"] },
  { name: "Conversor Binario", category: "Texto y Conversores", contexts: ["curiosidad", "estudio", "creando"], icon: "💾", description: "Convierte texto a binario y viceversa. Muestra también hexadecimal, octal y decimal con tabla ASCII", url: "/conversor-binario/", keywords: ["binario", "texto", "ascii", "hexadecimal", "octal", "conversion", "bits"] },
  { name: "Conversor Braille", category: "Texto y Conversores", contexts: ["curiosidad"], icon: "⠃", description: "Convierte texto a Braille español y viceversa. Sistema completo con ñ, acentos, números y visualización de celdas", url: "/conversor-braille/", keywords: ["braille", "accesibilidad", "discapacidad visual", "alfabeto", "puntos", "ciego", "inclusion"] },
  { name: "Generador de Anagramas", category: "Texto y Conversores", contexts: ["relax", "curiosidad"], icon: "🔤", description: "Encuentra todas las palabras que puedes formar con tus letras. Ideal para Wordle, Scrabble y crucigramas", url: "/generador-anagramas/", keywords: ["anagramas", "palabras", "wordle", "scrabble", "crucigrama", "letras", "juego palabras"] },
  { name: "Generador Lorem Ipsum", category: "Texto y Conversores", contexts: ["creando"], icon: "📄", description: "Genera texto Lorem Ipsum de 1 a 10 párrafos. Ideal para diseño, maquetación y desarrollo web", url: "/generador-lorem-ipsum/", keywords: ["lorem ipsum", "texto prueba", "placeholder", "maquetacion", "diseño", "dummy text"] },
  { name: "Contador de Sílabas", category: "Texto y Conversores", contexts: ["estudio", "creando"], icon: "📝", description: "Cuenta y separa las sílabas de cualquier palabra o texto en español. Útil para poesía y ortografía", url: "/contador-silabas/", keywords: ["silabas", "separar", "silabeador", "division silabica", "poesia", "metrica", "ortografia"] },
];

// ============================================
// 12 CATEGORÍAS (orden alfabético)
// ============================================
export const categories = [
  {
    id: 'calculadoras',
    name: 'Calculadoras Prácticas',
    icon: '🧮',
    description: 'Herramientas de cálculo para el día a día'
  },
  {
    id: 'criptografia',
    name: 'Criptografía y Seguridad',
    icon: '🔐',
    description: 'Cifrado de textos y verificación de datos'
  },
  {
    id: 'diseno',
    name: 'Diseño Web',
    icon: '🎨',
    description: 'Colores, tipografías y herramientas para diseñadores'
  },
  {
    id: 'emprendimiento',
    name: 'Emprendimiento y SEO',
    icon: '💼',
    description: 'Gestiona tu negocio y optimiza tu presencia online'
  },
  {
    id: 'finanzas',
    name: 'Finanzas Personales',
    icon: '💰',
    description: 'Inversiones, ahorro y planificación financiera'
  },
  {
    id: 'academicas',
    name: 'Herramientas Académicas',
    icon: '🎓',
    description: 'Ciencias, física, química y productividad de estudio'
  },
  {
    id: 'impuestos',
    name: 'Impuestos y Fiscalidad',
    icon: '📋',
    description: 'IRPF, sucesiones, donaciones y normativa fiscal española'
  },
  {
    id: 'juegos',
    name: 'Juegos y Entretenimiento',
    icon: '🎮',
    description: 'Diviértete mientras aprendes'
  },
  {
    id: 'matematicas',
    name: 'Matemáticas y Estadística',
    icon: '📐',
    description: 'Álgebra, cálculo, probabilidad y análisis de datos'
  },
  {
    id: 'productividad',
    name: 'Productividad',
    icon: '⚡',
    description: 'Optimiza tu tiempo y organización'
  },
  {
    id: 'salud',
    name: 'Salud y Bienestar',
    icon: '🏥',
    description: 'Cuida tu salud con herramientas especializadas'
  },
  {
    id: 'texto',
    name: 'Texto y Conversores',
    icon: '📝',
    description: 'Procesa, formatea y convierte texto'
  },
];

// ============================================
// Funciones auxiliares para momentos
// ============================================

/**
 * Obtiene todas las apps que pertenecen a un momento específico
 */
export const getAppsByMoment = (momentId: MomentType): Application[] => {
  return applicationsDatabase.filter(app =>
    app.contexts?.includes(momentId)
  );
};

/**
 * Cuenta cuántas apps hay en cada momento
 */
export const getMomentCounts = (): Record<MomentType, number> => {
  const counts: Record<MomentType, number> = {
    trabajo: 0,
    estudio: 0,
    casa: 0,
    dinero: 0,
    creando: 0,
    relax: 0,
    curiosidad: 0,
  };

  applicationsDatabase.forEach(app => {
    app.contexts?.forEach(context => {
      counts[context]++;
    });
  });

  return counts;
};
