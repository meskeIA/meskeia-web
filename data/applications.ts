/**
 * Base de datos completa de aplicaciones meskeIA
 * Total: 110 aplicaciones organizadas por 13 categorías
 * Actualizado: 2025-11-29
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
  // Finanzas y Fiscalidad (15)
  { name: "Simulador de Hipoteca", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula tu hipoteca con cuadro de amortización completo y análisis detallado", url: "/simulador-hipoteca/", keywords: ["prestamo", "casa", "vivienda", "banco", "interes", "amortizacion", "cuota", "euribor"] },
  { name: "Calculadora de Jubilación", category: "Finanzas y Fiscalidad", icon: "💰", description: "Planifica tu jubilación calculando ahorros necesarios y pensión estimada", url: "/calculadora-jubilacion/", keywords: ["pension", "retiro", "ahorro", "inversion", "planes", "seguridad social"] },
  { name: "Calculadora de Inversiones", category: "Finanzas y Fiscalidad", icon: "💰", description: "Simula el crecimiento de tus inversiones con interés compuesto", url: "/calculadora-inversiones/", keywords: ["bolsa", "acciones", "fondos", "rentabilidad", "capital", "dividendos"] },
  { name: "Calculadora de Interés Compuesto", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el interés compuesto de tus ahorros e inversiones a largo plazo", url: "/interes-compuesto/", keywords: ["ahorro", "capital", "rentabilidad", "interes", "compuesto"] },
  { name: "Test de Perfil Inversor", category: "Finanzas y Fiscalidad", icon: "🎯", description: "Descubre tu tolerancia al riesgo con un test de 10 preguntas y recibe recomendaciones personalizadas", url: "/test-perfil-inversor/", keywords: ["perfil", "inversor", "riesgo", "tolerancia", "test", "cuestionario", "inversion"] },
  { name: "Control de Gastos", category: "Finanzas y Fiscalidad", icon: "💰", description: "Controla tus gastos e ingresos mensuales con gráficos y categorización automática", url: "/control-gastos/", keywords: ["presupuesto", "gastos", "ingresos", "finanzas personales", "ahorro"] },
  { name: "Simulador IRPF", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula tu IRPF y retenciones según la normativa fiscal española actual", url: "/simulador-irpf/", keywords: ["impuestos", "renta", "hacienda", "declaracion", "retenciones", "fiscal"] },
  { name: "Calculadora de Donaciones - Cataluña", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el impuesto de donaciones según la normativa catalana con tarifa reducida, primera vivienda y bonificaciones", url: "/calculadora-donaciones-cataluna/", keywords: ["donacion", "impuesto", "cataluna", "catalunya", "herencia", "fiscal", "tarifa reducida"] },
  { name: "Calculadora de Donaciones - Nacional", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el impuesto de donaciones para 14 comunidades autónomas con bonificaciones actualizadas 2025", url: "/calculadora-donaciones-nacional/", keywords: ["donacion", "impuesto", "comunidad autonoma", "regimen comun", "nacional", "fiscal", "madrid", "andalucia"] },
  { name: "Calculadora de Sucesiones - Cataluña", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el impuesto de sucesiones (herencias) con normativa catalana: bonificación cónyuge 99%, vivienda habitual 95%", url: "/calculadora-sucesiones-cataluna/", keywords: ["herencia", "testamento", "sucesion", "impuesto", "cataluna", "catalunya", "fiscal"] },
  { name: "Calculadora de Sucesiones - Nacional", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula el impuesto de sucesiones para 14 CCAA: bonificaciones desde 99% (Madrid) hasta 0% (Asturias)", url: "/calculadora-sucesiones-nacional/", keywords: ["herencia", "testamento", "sucesion", "impuesto", "regimen comun", "nacional", "fiscal", "bonificaciones"] },
  { name: "Calculadora TIR-VAN", category: "Finanzas y Fiscalidad", icon: "💰", description: "Calcula TIR y VAN para análisis de inversiones y proyectos", url: "/calculadora-tir-van/", keywords: ["tir", "van", "inversion", "proyecto", "rentabilidad", "flujo caja"] },
  { name: "Calculadora Plusvalías IRPF", category: "Finanzas y Fiscalidad", icon: "📊", description: "Calcula el IRPF de tus inversiones: plusvalías de acciones, fondos, criptomonedas, dividendos e intereses con tramos 2025", url: "/calculadora-plusvalias-irpf/", keywords: ["plusvalias", "irpf", "capital mobiliario", "dividendos", "acciones", "criptomonedas", "fondos", "tramos ahorro"] },
  { name: "Simulador de Préstamos", category: "Finanzas y Fiscalidad", icon: "🏦", description: "Compara sistemas de amortización: francés, alemán y americano. Cuadro completo, TAE vs TIN y comisiones", url: "/simulador-prestamos/", keywords: ["prestamo", "amortizacion", "frances", "aleman", "americano", "cuota", "TAE", "TIN", "interes"] },
  { name: "Amortización Anticipada Hipoteca", category: "Finanzas y Fiscalidad", icon: "🏠", description: "Calcula el ahorro al amortizar tu hipoteca: reducir cuota vs reducir plazo. Comparativa y recomendación", url: "/amortizacion-hipoteca/", keywords: ["amortizacion anticipada", "hipoteca", "reducir cuota", "reducir plazo", "ahorro intereses", "cancelacion parcial"] },

  // Calculadoras y Utilidades (10)
  { name: "Calculadora de Propinas", category: "Calculadoras y Utilidades", icon: "🧮", description: "Calcula propinas y divide la cuenta entre varias personas fácilmente", url: "/calculadora-propinas/", keywords: ["propina", "cuenta", "dividir", "restaurante", "porcentaje"] },
  { name: "Calculadora de IVA", category: "Calculadoras y Utilidades", icon: "🧮", description: "Calcula el IVA español: añade o quita IVA al 21%, 10% o 4% con un clic", url: "/calculadora-iva/", keywords: ["iva", "impuesto", "base imponible", "21%", "10%", "4%", "fiscal"] },
  { name: "Calculadora de Descuentos", category: "Calculadoras y Utilidades", icon: "🏷️", description: "Calcula el precio final con descuento y cuánto ahorras. Soporta descuentos encadenados", url: "/calculadora-descuentos/", keywords: ["descuento", "rebaja", "oferta", "ahorro", "black friday", "rebajas"] },
  { name: "Calculadora de Porcentajes", category: "Calculadoras y Utilidades", icon: "🧮", description: "Calculadora de porcentajes completa: X% de cantidad, qué % es, aumentos, disminuciones y variaciones", url: "/calculadora-porcentajes/", keywords: ["porcentaje", "tanto por ciento", "aumento", "disminucion", "variacion"] },
  { name: "Calculadora Regla de Tres", category: "Calculadoras y Utilidades", icon: "🧮", description: "Calculadora completa de regla de tres simple y compuesta con ejemplos prácticos españoles", url: "/calculadora-regla-de-tres/", keywords: ["proporcion", "regla", "tres", "directa", "inversa", "matematicas"] },
  { name: "Calculadora de Fechas", category: "Calculadoras y Utilidades", icon: "🧮", description: "Calcula días entre fechas, suma o resta días a cualquier fecha", url: "/calculadora-fechas/", keywords: ["fecha", "dias", "calendario", "diferencia", "tiempo"] },
  { name: "Conversor de Tallas", category: "Calculadoras y Utilidades", icon: "🧮", description: "Convierte tallas de ropa y calzado entre sistemas EU, UK, US", url: "/conversor-tallas/", keywords: ["talla", "ropa", "zapatos", "conversion", "medida"] },
  { name: "Calculadora de Cocina", category: "Calculadoras y Utilidades", icon: "🍳", description: "Conversor de unidades de cocina, escalador de recetas, tiempos de cocción y sustitutos de ingredientes", url: "/calculadora-cocina/", keywords: ["cocina", "recetas", "conversor", "tazas", "gramos", "temperatura", "horno", "tiempo", "coccion", "ingredientes", "sustitutos"] },
  { name: "Lista de Compras", category: "Calculadoras y Utilidades", icon: "🛒", description: "Lista de compras con organización automática por categorías del supermercado, guardado local y exportación", url: "/lista-compras/", keywords: ["lista", "compras", "supermercado", "shopping", "productos", "mercado", "groceries", "organizar", "categorias", "offline"] },

  // Matemáticas y Estadística (11)
  { name: "Calculadora de Probabilidad", category: "Matemáticas y Estadística", icon: "📐", description: "Calculadora completa de probabilidades con teoría y simulaciones", url: "/calculadora-probabilidad/", keywords: ["probabilidad", "estadistica", "azar", "combinatoria", "permutaciones"] },
  { name: "Calculadora MCD y MCM", category: "Matemáticas y Estadística", icon: "📐", description: "Calcula el Máximo Común Divisor y Mínimo Común Múltiplo de hasta 5 números con explicación paso a paso", url: "/calculadora-mcd-mcm/", keywords: ["mcd", "mcm", "maximo comun divisor", "minimo comun multiplo", "factorizacion", "primos"] },
  { name: "Calculadora Estadística", category: "Matemáticas y Estadística", icon: "📐", description: "Calcula media, mediana, desviación estándar y análisis estadístico completo", url: "/calculadora-estadistica/", keywords: ["estadistica", "media", "mediana", "desviacion", "datos"] },
  { name: "Calculadora Matemática Avanzada", category: "Matemáticas y Estadística", icon: "📐", description: "Resuelve ecuaciones, matrices, derivadas e integrales online", url: "/calculadora-matematica/", keywords: ["matematicas", "ecuaciones", "matrices", "calcular", "resolver"] },
  // NOTA: Mantiene URL antigua (ya implementada) - se renombrará a /calculadora-ecuaciones/
  { name: "Calculadora de Ecuaciones", category: "Matemáticas y Estadística", icon: "📐", description: "Resuelve ecuaciones lineales, cuadráticas y sistemas 2x2 con explicaciones paso a paso", url: "/algebra-ecuaciones/", keywords: ["ecuaciones", "sistemas", "lineal", "cuadratica", "algebra", "resolver", "paso a paso"] },
  { name: "Calculadora de Geometría", category: "Matemáticas y Estadística", icon: "📐", description: "Calcula áreas, perímetros y volúmenes de figuras geométricas", url: "/calculadora-geometria/", keywords: ["area", "perimetro", "volumen", "figuras", "geometria", "triangulo", "circulo"] },
  { name: "Calculadora de Cálculo", category: "Matemáticas y Estadística", icon: "📐", description: "Deriva e integra funciones, límites y análisis matemático", url: "/calculadora-calculo/", keywords: ["derivadas", "integrales", "limites", "calculo", "funciones"] },
  { name: "Calculadora de Trigonometría", category: "Matemáticas y Estadística", icon: "📐", description: "Funciones trigonométricas, identidades y triángulos", url: "/calculadora-trigonometria/", keywords: ["seno", "coseno", "tangente", "trigonometria", "angulos"] },
  { name: "Calculadora Teoría de Números", category: "Matemáticas y Estadística", icon: "📐", description: "Números primos, factorización y teoría de números", url: "/calculadora-teoria-numeros/", keywords: ["primos", "factorizacion", "divisores", "numeros"] },
  { name: "Calculadora Álgebra Abstracta", category: "Matemáticas y Estadística", icon: "📐", description: "Grupos, anillos, campos y estructuras algebraicas", url: "/calculadora-algebra-abstracta/", keywords: ["grupos", "anillos", "campos", "abstracta"] },
  { name: "Calculadora Teoría de Colas", category: "Matemáticas y Estadística", icon: "📐", description: "Calcula métricas de sistemas de colas M/M/1: utilización, tiempos de espera y simulación", url: "/calculadora-teoria-colas/", keywords: ["teoria colas", "mm1", "sistema espera", "utilizacion", "little", "poisson"] },

  // Física y Química (5) - Generador de Fórmulas Químicas eliminado (UX confusa, poco valor)
  { name: "Calculadora de Movimiento", category: "Física y Química", icon: "🧪", description: "Calculadora interactiva de cinemática con gráficos y animaciones para MRU, MRUA, caída libre y tiro parabólico", url: "/calculadora-movimiento/", keywords: ["fisica", "cinematica", "movimiento", "velocidad", "aceleracion", "mru", "mrua"] },
  { name: "Tabla Periódica Interactiva", category: "Física y Química", icon: "⚛️", description: "Tabla periódica interactiva con 118 elementos, calculadora de masa molar y filtros avanzados", url: "/tabla-periodica/", keywords: ["quimica", "elementos", "atomos", "tabla periodica", "propiedades", "masa molar"] },
  { name: "Glosario de Física y Química", category: "Física y Química", icon: "🧪", description: "Glosario interactivo de física y química con quizzes educativos y sistema de gamificación", url: "/glosario-fisica-quimica/", keywords: ["glosario", "definiciones", "terminos", "fisica", "quimica"] },
  { name: "Calculadora de Electricidad", category: "Física y Química", icon: "⚡", description: "Calculadora completa de electricidad: Ley de Ohm, potencia, resistencias y análisis de circuitos eléctricos", url: "/calculadora-electricidad/", keywords: ["electricidad", "ohm", "resistencia", "voltaje", "corriente", "circuito"] },
  { name: "Conversor de Unidades", category: "Física y Química", icon: "🧪", description: "Conversor científico avanzado: 13 categorías incluyendo química, presión, energía, fuerza y potencia", url: "/conversor-unidades/", keywords: ["conversion", "unidades", "medidas", "fisica", "quimica"] },

  // Herramientas de Productividad (8)
  { name: "Notas", category: "Herramientas de Productividad", icon: "📝", description: "Guarda tus notas, ideas y apuntes organizados por categorías con guardado automático local", url: "/notas/", keywords: ["notas", "apuntes", "ideas", "texto", "escribir", "guardar", "categorias"] },
  { name: "Lista de Tareas", category: "Herramientas de Productividad", icon: "⚡", description: "Organiza tus tareas pendientes con categorías, prioridades y fechas límite", url: "/lista-tareas/", keywords: ["tareas", "todo", "pendientes", "organizar", "productividad"] },
  { name: "Cronómetro y Temporizador", category: "Herramientas de Productividad", icon: "⚡", description: "Cronómetro con vueltas y temporizador con cuenta regresiva y alarma sonora", url: "/cronometro/", keywords: ["cronometro", "temporizador", "pomodoro", "stopwatch", "timer", "alarma", "tiempo", "productividad", "concentracion", "descansos"] },
  { name: "Conversor de Horarios", category: "Herramientas de Productividad", icon: "⚡", description: "Convierte horarios entre 25+ ciudades del mundo con reloj mundial en tiempo real", url: "/conversor-horarios/", keywords: ["horarios", "zonas horarias", "reloj mundial", "diferencia horaria", "hora internacional", "convertir hora", "tiempo mundial"] },
  { name: "Información del Tiempo", category: "Herramientas de Productividad", icon: "⚡", description: "Consulta el pronóstico del tiempo para cualquier ciudad del mundo", url: "/informacion-tiempo/", keywords: ["clima", "tiempo", "meteorologia", "pronostico", "temperatura"] },
  { name: "Generador de Contraseñas", category: "Herramientas de Productividad", icon: "⚡", description: "Crea contraseñas seguras y personalizadas con diferentes niveles de complejidad", url: "/generador-contrasenas/", keywords: ["password", "seguridad", "contrasena", "generar", "segura"] },
  { name: "Generador de Códigos QR", category: "Herramientas de Productividad", icon: "⚡", description: "Crea códigos QR para URLs, texto, WiFi, contactos vCard, email y teléfono", url: "/generador-qr/", keywords: ["qr", "codigo", "generar", "escanear", "wifi", "vcard"] },
  { name: "Generador de Códigos de Barras", category: "Herramientas de Productividad", icon: "⚡", description: "Genera códigos de barras EAN-13, EAN-8, UPC-A, Code128 y Code39", url: "/generador-codigos-barras/", keywords: ["codigo barras", "ean13", "ean8", "code128", "upc", "barcode", "generar barras", "etiquetas productos", "inventario"] },
  { name: "Generador de Firmas Email", category: "Herramientas de Productividad", icon: "✉️", description: "Crea firmas de email profesionales en HTML. Compatible con Gmail, Outlook, Apple Mail. Múltiples plantillas y redes sociales", url: "/generador-firma-email/", keywords: ["firma", "email", "html", "gmail", "outlook", "profesional", "plantilla", "correo"] },

  // Juegos y Entretenimiento (9)
  { name: "Test de Velocidad de Escritura", category: "Juegos y Entretenimiento", icon: "⌨️", description: "Mide tu velocidad de escritura en palabras por minuto (PPM) y mejora tu mecanografía con textos en español", url: "/test-velocidad-escritura/", keywords: ["mecanografia", "velocidad", "escritura", "ppm", "palabras por minuto", "typing test", "teclado"] },
  { name: "Radio meskeIA", category: "Juegos y Entretenimiento", icon: "📻", description: "Escucha miles de emisoras de radio de todo el mundo en vivo", url: "/radio-meskeia/", keywords: ["radio", "musica", "emisoras", "streaming", "noticias", "podcasts", "online"] },
  { name: "Juego Wordle", category: "Juegos y Entretenimiento", icon: "🎮", description: "Adivina la palabra del día en español con 6 intentos", url: "/juego-wordle/", keywords: ["wordle", "palabra", "juego", "adivinar", "español"] },
  { name: "Juego Sudoku", category: "Juegos y Entretenimiento", icon: "🎮", description: "Resuelve puzzles Sudoku con diferentes niveles de dificultad", url: "/juego-sudoku/", keywords: ["sudoku", "puzzle", "numeros", "logica", "juego"] },
  { name: "Juego Tres en Raya", category: "Juegos y Entretenimiento", icon: "🎮", description: "Juega al clásico tres en raya contra la computadora", url: "/juego-tres-en-raya/", keywords: ["tres en raya", "tic tac toe", "juego", "clasico"] },
  { name: "Juego de Memoria", category: "Juegos y Entretenimiento", icon: "🎮", description: "Entrena tu memoria encontrando parejas de cartas", url: "/juego-memoria/", keywords: ["memoria", "cartas", "parejas", "concentracion", "juego"] },
  { name: "Juego Piedra Papel Tijera", category: "Juegos y Entretenimiento", icon: "🎮", description: "Juega piedra, papel o tijera contra la computadora", url: "/juego-piedra-papel-tijera/", keywords: ["piedra", "papel", "tijera", "juego", "clasico"] },
  { name: "Juego 2048", category: "Juegos y Entretenimiento", icon: "🎮", description: "Desliza y combina números para llegar a 2048", url: "/juego-2048/", keywords: ["2048", "numeros", "puzzle", "juego", "estrategia"] },
  { name: "Juego Puzzle Matemático", category: "Juegos y Entretenimiento", icon: "🎮", description: "Resuelve puzzles matemáticos y ejercita tu mente", url: "/juego-puzzle-matematico/", keywords: ["puzzle", "matematicas", "logica", "juego", "cerebro"] },

  // Campus Digital (5)
  { name: "Calculadora de Notas", category: "Campus Digital", icon: "📚", description: "Calcula tu media académica ponderada y nota final del curso", url: "/calculadora-notas/", keywords: ["notas", "calificaciones", "media", "universidad", "estudiante"] },
  { name: "Generador de Horarios de Estudio", category: "Campus Digital", icon: "📚", description: "Genera horarios de estudio personalizados con distribución inteligente de tiempo. Técnica Pomodoro, gestión de prioridades y calendario visual", url: "/generador-horarios-estudio/", keywords: ["horario", "estudio", "planificar", "calendario", "pomodoro"] },
  { name: "Creador de Flashcards", category: "Campus Digital", icon: "📚", description: "Crea y estudia con flashcards personalizadas. Modo estudio interactivo, gestión de mazos, importa/exporta tarjetas", url: "/creador-flashcards/", keywords: ["flashcards", "tarjetas", "estudio", "memorizar", "aprender"] },
  { name: "Curso Decisiones de Inversión", category: "Campus Digital", icon: "📚", description: "Aprende a tomar decisiones de inversión inteligentes con este curso interactivo", url: "/curso-decisiones-inversion/", keywords: ["curso", "inversion", "finanzas", "aprender", "bolsa"] },
  { name: "Curso de Emprendimiento", category: "Campus Digital", icon: "📚", description: "Guía práctica de emprendimiento: de la idea al primer cliente con ejemplos españoles", url: "/curso-emprendimiento/", keywords: ["emprendimiento", "negocio", "startup", "empresa", "curso"] },

  // Salud & Bienestar (9)
  { name: "Calculadora IMC", category: "Salud & Bienestar", icon: "⚖️", description: "Calcula tu Índice de Masa Corporal y conoce tu clasificación según la OMS", url: "/calculadora-imc/", keywords: ["imc", "peso", "altura", "obesidad", "salud", "oms"] },
  { name: "Calculadora de Calorías", category: "Salud & Bienestar", icon: "🏥", description: "Calcula las calorías quemadas según tu actividad física, pasos y tiempo de ejercicio", url: "/calculadora-calorias-ejercicio/", keywords: ["calorias", "ejercicio", "deporte", "quemar", "actividad fisica"] },
  { name: "Calculadora de Hidratación", category: "Salud & Bienestar", icon: "🏥", description: "Calcula cuánta agua necesitas beber diariamente según tu peso, actividad física y clima", url: "/calculadora-hidratacion/", keywords: ["agua", "hidratacion", "beber", "litros", "salud"] },
  { name: "Calculadora de Sueño", category: "Salud & Bienestar", icon: "🏥", description: "Calcula tus ciclos de sueño ideales y descubre a qué hora acostarte para despertar descansado", url: "/calculadora-sueno/", keywords: ["sueño", "dormir", "ciclos", "descanso", "rem"] },
  { name: "NutriSalud", category: "Salud & Bienestar", icon: "🥗", description: "Curso de nutrición avanzado basado en ciencia. 15 capítulos sobre macronutrientes, micronutrientes, interacciones y aplicación práctica", url: "/curso-nutrisalud/", keywords: ["nutricion", "alimentos", "dieta", "salud", "vitaminas", "curso", "macronutrientes", "microbiota"] },
  { name: "Seguimiento de Hábitos", category: "Salud & Bienestar", icon: "🏥", description: "Rastrea tus hábitos saludables con visualización de rachas y estadísticas motivadoras", url: "/seguimiento-habitos/", keywords: ["habitos", "racha", "tracker", "rutina", "salud", "motivacion"] },
  { name: "Planificador de Menú Semanal", category: "Salud & Bienestar", icon: "📅", description: "Planifica tu menú semanal de forma equilibrada con sugerencias mediterráneas y consejos de compra", url: "/planificador-menu/", keywords: ["menu", "semanal", "planificar", "comidas", "dieta", "mediterranea", "batch cooking"] },
  { name: "Calculadora de Porciones", category: "Salud & Bienestar", icon: "✋", description: "Aprende a medir porciones de alimentos usando tu mano como referencia. Método visual y práctico", url: "/calculadora-porciones/", keywords: ["porciones", "mano", "medir", "raciones", "plato", "equilibrado"] },
  { name: "Test de Hábitos Saludables", category: "Salud & Bienestar", icon: "🌟", description: "Evalúa tus hábitos de vida con un test de 21 preguntas. Perfil visual de hidratación, alimentación, actividad y descanso", url: "/test-habitos/", keywords: ["test", "habitos", "saludables", "evaluacion", "bienestar", "estilo vida"] },

  // Herramientas Web y Tecnología (5) - generador-hash y conversor-base64 movidos a Criptografía
  { name: "Validador JSON", category: "Herramientas Web y Tecnología", icon: "💻", description: "Valida, formatea y minifica código JSON y XML al instante con detección de errores", url: "/validador-json/", keywords: ["json", "xml", "validar", "formatear", "codigo"] },
  { name: "Generador de Iconos PWA", category: "Herramientas Web y Tecnología", icon: "💻", description: "Genera todos los tamaños de iconos para PWA, favicon y apps móviles. Múltiples formatos y presets para diferentes plataformas", url: "/generador-iconos/", keywords: ["iconos", "pwa", "favicon", "app icons", "manifest", "apple touch"] },
  { name: "Generador de Enlaces UTM", category: "Herramientas Web y Tecnología", icon: "💻", description: "Genera enlaces UTM para Google Analytics. Trackea campañas de marketing con parámetros utm_source, utm_medium, utm_campaign", url: "/generador-utm/", keywords: ["utm", "google analytics", "tracking", "marketing", "campañas", "enlaces"] },
  { name: "Validador RegEx", category: "Herramientas Web y Tecnología", icon: "💻", description: "Testa y valida expresiones regulares con resaltado de coincidencias y ejemplos prácticos", url: "/validador-regex/", keywords: ["regex", "expresiones regulares", "validar", "patron", "programacion"] },
  { name: "Conversor de Imágenes", category: "Herramientas Web y Tecnología", icon: "💻", description: "Convierte formatos de imagen (JPG, PNG, WebP), comprime y redimensiona con control de calidad total", url: "/conversor-imagenes/", keywords: ["imagen", "convertir", "comprimir", "redimensionar", "jpg", "png"] },

  // Texto y Documentos (10)
  { name: "Contador de Palabras", category: "Texto y Documentos", icon: "📝", description: "Cuenta palabras, caracteres, párrafos y tiempo de lectura en tiempo real. Objetivo de palabras configurable", url: "/contador-palabras/", keywords: ["contar", "palabras", "caracteres", "texto", "escritura"] },
  { name: "Conversor de Texto", category: "Texto y Documentos", icon: "📝", description: "Convierte texto entre MAYÚSCULAS, minúsculas, Capitalizado, Título, aLtErNaDo e iNvErTiDo", url: "/conversor-texto/", keywords: ["convertir", "mayusculas", "minusculas", "texto", "formato"] },
  { name: "Limpiador de Texto", category: "Texto y Documentos", icon: "📝", description: "Limpia texto eliminando espacios duplicados, líneas vacías extras, tabulaciones y caracteres especiales", url: "/limpiador-texto/", keywords: ["limpiar", "texto", "espacios", "formato", "eliminar"] },
  { name: "Comparador de Textos", category: "Texto y Documentos", icon: "📝", description: "Compara dos textos línea por línea detectando diferencias añadidas, eliminadas y modificadas. Ideal para editores, escritores y traductores", url: "/comparador-textos/", keywords: ["comparar", "diff", "diferencias", "texto", "cambios"] },
  { name: "Conversor Markdown-HTML", category: "Texto y Documentos", icon: "📝", description: "Convierte Markdown a HTML limpio con vista previa en tiempo real. Soporte completo de sintaxis: títulos, listas, enlaces, código, tablas", url: "/conversor-markdown-html/", keywords: ["markdown", "html", "convertir", "formato", "codigo"] },
  { name: "Conversor de Código Morse", category: "Texto y Documentos", icon: "📡", description: "Convierte texto a código Morse y viceversa con reproducción de audio. Alfabeto completo y señales internacionales", url: "/conversor-morse/", keywords: ["morse", "codigo", "puntos", "rayas", "telegrafo", "sos", "audio"] },
  { name: "Conversor Números Romanos", category: "Texto y Documentos", icon: "🏛️", description: "Convierte entre números arábigos y romanos con desglose paso a paso. Tabla de símbolos y reglas explicadas", url: "/conversor-numeros-romanos/", keywords: ["romanos", "numeros", "conversion", "romano", "arabigo", "I", "V", "X", "L", "C", "D", "M"] },
  { name: "Detector de Idioma", category: "Texto y Documentos", icon: "🌍", description: "Detecta automáticamente el idioma de cualquier texto. Soporta 10+ idiomas con porcentaje de confianza", url: "/detector-idioma/", keywords: ["idioma", "detector", "lengua", "traduccion", "español", "ingles", "frances"] },
  { name: "Conversor Binario", category: "Texto y Documentos", icon: "💾", description: "Convierte texto a binario y viceversa. Muestra también hexadecimal, octal y decimal con tabla ASCII", url: "/conversor-binario/", keywords: ["binario", "texto", "ascii", "hexadecimal", "octal", "conversion", "bits"] },
  { name: "Conversor Braille", category: "Texto y Documentos", icon: "⠃", description: "Convierte texto a Braille español y viceversa. Sistema completo con ñ, acentos, números y visualización de celdas", url: "/conversor-braille/", keywords: ["braille", "accesibilidad", "discapacidad visual", "alfabeto", "puntos", "ciego", "inclusion"] },
  { name: "Generador de Anagramas", category: "Texto y Documentos", icon: "🔤", description: "Encuentra todas las palabras que puedes formar con tus letras. Ideal para Wordle, Scrabble y crucigramas", url: "/generador-anagramas/", keywords: ["anagramas", "palabras", "wordle", "scrabble", "crucigrama", "letras", "juego palabras"] },
  { name: "Generador Lorem Ipsum", category: "Texto y Documentos", icon: "📄", description: "Genera texto Lorem Ipsum de 1 a 10 párrafos. Ideal para diseño, maquetación y desarrollo web", url: "/generador-lorem-ipsum/", keywords: ["lorem ipsum", "texto prueba", "placeholder", "maquetacion", "diseño", "dummy text"] },

  // Criptografía y Seguridad (6)
  { name: "Cifrado Clásico", category: "Criptografía y Seguridad", icon: "🔐", description: "Cifra textos con métodos clásicos: César, ROT13 y Atbash. Visualización del alfabeto cifrado y presets históricos", url: "/cifrado-clasico/", keywords: ["cifrado", "cesar", "rot13", "atbash", "criptografia", "encriptar", "clasico"] },
  { name: "Cifrado Vigenère", category: "Criptografía y Seguridad", icon: "🔑", description: "Cifrado polialfabético con palabra clave. Más seguro que César, usado durante siglos. Visualización de tabla Vigenère", url: "/cifrado-vigenere/", keywords: ["vigenere", "cifrado", "clave", "polialfabetico", "criptografia", "bellaso"] },
  { name: "Cifrado por Transposición", category: "Criptografía y Seguridad", icon: "🔀", description: "Cifra reordenando letras: Columnas, Rail Fence y Escítala. Visualización interactiva de cada método", url: "/cifrado-transposicion/", keywords: ["transposicion", "columnas", "rail fence", "escitala", "reordenar", "cifrado", "criptografia"] },
  { name: "Cifrado Playfair", category: "Criptografía y Seguridad", icon: "🔲", description: "Cifrado por digramas con matriz 5x5. Usado en guerras mundiales. Visualización de matriz y proceso de cifrado", url: "/cifrado-playfair/", keywords: ["playfair", "matriz", "digramas", "5x5", "wheatstone", "cifrado", "criptografia"] },
  { name: "Generador de Hashes", category: "Criptografía y Seguridad", icon: "🛡️", description: "Genera hashes MD5, SHA-256, SHA-512 para verificar integridad de datos. Compara archivos y textos de forma segura", url: "/generador-hashes/", keywords: ["hash", "md5", "sha256", "sha512", "checksum", "integridad", "seguridad", "verificar"] },
  { name: "Codificador Base64", category: "Criptografía y Seguridad", icon: "🔒", description: "Codifica y decodifica texto en Base64, URL encode y Hexadecimal. Soporta archivos e imágenes", url: "/codificador-base64/", keywords: ["base64", "url encode", "hexadecimal", "codificar", "decodificar", "btoa", "atob"] },

  // Creatividad y Diseño (7)
  { name: "Conversor de Colores", category: "Creatividad y Diseño", icon: "🎨", description: "Convierte entre HEX, RGB, HSL y CMYK con color picker visual y generación de paletas automáticas", url: "/conversor-colores/", keywords: ["colores", "hex", "rgb", "hsl", "cmyk", "convertidor", "color picker", "paleta"] },
  { name: "Calculadora de Contraste", category: "Creatividad y Diseño", icon: "🎨", description: "Verifica accesibilidad WCAG con ratios de contraste AA/AAA y simulación de daltonismo", url: "/contraste-colores/", keywords: ["contraste", "accesibilidad", "wcag", "daltonismo", "aa", "aaa", "diseño accesible"] },
  { name: "Generador de Gradientes", category: "Creatividad y Diseño", icon: "🎨", description: "Crea gradientes CSS lineales, radiales y cónicos con presets populares y código listo para copiar", url: "/generador-gradientes/", keywords: ["gradientes", "css", "gradient", "linear", "radial", "conic", "background"] },
  { name: "Generador de Sombras", category: "Creatividad y Diseño", icon: "🎨", description: "Genera box-shadow y text-shadow con múltiples capas, presets de neuromorfismo y material design", url: "/generador-sombras/", keywords: ["sombras", "shadow", "box-shadow", "text-shadow", "neuromorfismo", "material design"] },
  { name: "Calculadora de Aspectos", category: "Creatividad y Diseño", icon: "🎨", description: "Mantiene proporciones al redimensionar, presets para redes sociales (Instagram, Facebook, YouTube)", url: "/calculadora-aspectos/", keywords: ["aspectos", "ratio", "proporciones", "redimensionar", "instagram", "facebook", "16:9", "4:3"] },
  { name: "Generador de Tipografías", category: "Creatividad y Diseño", icon: "🎨", description: "Combina Google Fonts con pairings armónicos predefinidos, previsualización en tiempo real y generación de código CSS", url: "/generador-tipografias/", keywords: ["tipografias", "fonts", "google fonts", "fuentes", "typography", "pairings", "css", "web fonts"] },
  { name: "Creador de Paletas", category: "Creatividad y Diseño", icon: "🎨", description: "Diseña paletas de colores profesionales para tus proyectos web", url: "/creador-paletas/", keywords: ["colores", "paleta", "diseño", "web", "hex", "esquema colores", "armonia cromatica"] },

  // Emprendimiento y Negocios (6)
  { name: "Calculadora Tarifa Freelance", category: "Emprendimiento y Negocios", icon: "💼", description: "Calcula tu tarifa freelance ideal considerando gastos, impuestos, vacaciones y margen de beneficio. Evita cobrar de menos", url: "/calculadora-tarifa-freelance/", keywords: ["freelance", "tarifa", "precio", "autonomo", "honorarios"] },
  { name: "Calculadora Break-Even", category: "Emprendimiento y Negocios", icon: "💼", description: "Calcula el punto de equilibrio de tus productos. Analiza margen de contribución, rentabilidad y escenarios de costos/precios", url: "/calculadora-break-even/", keywords: ["break even", "punto equilibrio", "costos", "precio", "rentabilidad"] },
  { name: "Planificador Cash Flow", category: "Emprendimiento y Negocios", icon: "💼", description: "Proyecta tu flujo de caja a 12 meses. Identifica meses críticos, previene crisis de liquidez y simula escenarios What-If", url: "/planificador-cashflow/", keywords: ["cash flow", "flujo caja", "liquidez", "tesoreria", "finanzas"] },
  { name: "Calculadora ROI Marketing", category: "Emprendimiento y Negocios", icon: "💼", description: "Calcula el ROI por canal de marketing (Google Ads, Facebook, email, SEO). Analiza CAC, CLV y optimiza tu inversión publicitaria", url: "/calculadora-roi-marketing/", keywords: ["roi", "marketing", "publicidad", "cac", "clv", "ads"] },
  { name: "Generador de Nombres", category: "Emprendimiento y Negocios", icon: "💼", description: "Genera nombres creativos para tu empresa por sectores. Enlaces directos para verificar disponibilidad y registrar dominios .com, .es", url: "/generador-nombres-empresa/", keywords: ["nombre", "empresa", "marca", "branding", "dominio", "startup"] },
  { name: "Simulador Gastos Deducibles", category: "Emprendimiento y Negocios", icon: "💼", description: "Calcula tu ahorro fiscal con gastos deducibles. Descubre qué gastos puedes deducir (100%, 50%, 30%) y optimiza tu declaración de IRPF e IVA", url: "/simulador-gastos-deducibles/", keywords: ["gastos deducibles", "autonomo", "irpf", "iva", "hacienda", "deduccion"] },
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
    id: 'criptografia',
    name: 'Criptografía y Seguridad',
    icon: '🔐',
    description: 'Cifrado de textos y verificación de datos'
  },
];
