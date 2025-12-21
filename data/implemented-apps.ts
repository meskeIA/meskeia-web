/**
 * Lista de aplicaciones IMPLEMENTADAS en meskeIA Next.js
 *
 * IMPORTANTE: Esta lista debe coincidir con las carpetas en app/
 * Solo añadir URLs cuando la app esté realmente creada
 *
 * Actualizado: 2025-12-07
 */

export const implementedAppsUrls = [
  // Finanzas y Fiscalidad (19 implementadas)
  "/calculadora-inflacion/",
  "/calculadora-donaciones-cataluna/",
  "/calculadora-donaciones-nacional/",
  "/calculadora-sucesiones-cataluna/",
  "/calculadora-sucesiones-nacional/",
  "/simulador-irpf/",
  "/calculadora-plusvalias-irpf/",   // Plusvalías capital mobiliario (acciones, fondos, cripto)
  "/guia-tramitacion-herencias/",    // Guía paso a paso para tramitar herencias
  "/herencias-paso-a-paso/",         // Curso Herencias Paso a Paso (9 capítulos)
  "/calculadora-tir-van/",
  "/control-gastos/",
  "/interes-compuesto/",
  "/simulador-hipoteca/",
  "/simulador-prestamos/",           // Compara sistemas francés, alemán, americano
  "/amortizacion-hipoteca/",         // Amortización anticipada: reducir cuota vs plazo
  "/calculadora-jubilacion/",
  "/calculadora-inversiones/",
  "/test-perfil-inversor/",
  "/simulador-cartera-inversion/",    // Monte Carlo, Sharpe, volatilidad
  "/calculadora-suscripciones/",      // Control de suscripciones recurrentes
  "/calculadora-roommates/",          // División gastos piso compartido
  "/calculadora-alquiler-vs-compra/", // Análisis alquiler vs compra vivienda

  // Calculadoras y Utilidades (14 implementadas)
  "/calculadora-propinas/",
  "/calculadora-iva/",
  "/calculadora-descuentos/",
  "/calculadora-porcentajes/",
  "/calculadora-fechas/",
  "/calculadora-regla-de-tres/",
  "/calculadora-cocina/",
  "/lista-compras/",
  "/conversor-tallas/",
  "/calculadora-gasto-energetico/",
  "/calculadora-pintura/",           // Calcular litros de pintura
  "/calculadora-combustible/",       // Consumo L/100km y coste viajes
  "/calculadora-edad-mascotas/",     // Edad perros/gatos en años humanos
  "/planificador-boda/",             // Wedding planner: checklist, presupuesto, timeline
  "/planificador-mudanzas/",         // Mudanza: tareas, inventario, presupuesto
  "/calculadora-huella-carbono/",    // Huella de carbono personal

  // Matemáticas y Estadística (13 implementadas)
  "/algebra-ecuaciones/",            // Calculadora de Ecuaciones
  "/calculadora-mcd-mcm/",
  "/calculadora-probabilidad/",
  "/calculadora-estadistica/",
  "/estadistica-avanzada/",
  "/calculadora-distribuciones/",    // Distribuciones: Normal, Poisson, Exponencial, etc.
  "/inferencia-bayesiana/",          // Teorema de Bayes, tests diagnósticos
  "/calculadora-matematica/",
  "/calculadora-geometria/",
  "/calculadora-calculo/",
  "/calculadora-trigonometria/",
  "/calculadora-teoria-numeros/",
  "/calculadora-algebra-abstracta/",
  "/calculadora-teoria-colas/",

  // Herramientas de Productividad (16 implementadas)
  "/time-tracker/",
  "/planificador-turnos/",
  "/notas/",
  "/generador-contrasenas/",
  "/lista-tareas/",
  "/cronometro/",
  "/temporizador-pomodoro/",       // Técnica Pomodoro con estadísticas
  "/conversor-horarios/",
  "/generador-qr/",
  "/generador-codigos-barras/",
  "/informacion-tiempo/",
  "/generador-firma-email/",
  "/lista-equipaje/",              // Checklist personalizado de viaje
  "/generador-actas/",             // Generador de actas de reunión profesionales
  "/prueba-camara/",               // Test de webcam con captura de fotos
  "/prueba-microfono/",            // Test de micrófono con grabación de audio
  "/luxometro/",                   // Luxómetro/fotómetro para medir intensidad de luz
  "/golden-hour/",                 // Calculadora hora dorada y azul para fotografía
  "/sonometro/",                   // Sonómetro/decibelímetro para medir nivel de ruido
  "/metronomo/",                   // Metrónomo online con tap tempo
  "/mi-ip/",                       // IP pública, geolocalización, ISP, conexión
  "/analizador-espectro/",         // Analizador de espectro de audio FFT
  "/nivel-burbuja/",               // Nivel de burbuja digital + inclinómetro

  // Texto y Documentos (14 implementadas)
  "/contador-palabras/",
  "/conversor-texto/",
  "/limpiador-texto/",
  "/comparador-textos/",
  "/conversor-markdown-html/",
  "/conversor-morse/",
  "/conversor-numeros-romanos/",
  "/detector-idioma/",
  "/conversor-binario/",
  "/conversor-braille/",
  "/generador-anagramas/",
  "/generador-lorem-ipsum/",    // Generador de texto de prueba
  "/contador-silabas/",         // Separar y contar sílabas en español
  "/conversor-formatos/",       // JSON, CSV, Excel, XML, YAML
  "/conjugador-verbos/",        // Conjugador de verbos español con irregulares

  // Criptografía y Seguridad (7 implementadas)
  "/cifrado-clasico/",          // César + ROT13 + Atbash
  "/cifrado-vigenere/",         // Cifrado polialfabético con clave
  "/cifrado-transposicion/",    // Columnas, Rail Fence, Escítala
  "/cifrado-playfair/",         // Matriz 5x5, digramas
  "/cifrado-aes/",              // AES-256 GCM/CBC moderno
  "/generador-hashes/",         // MD5, SHA-256, SHA-512
  "/codificador-base64/",       // Base64, URL encode, Hexadecimal

  // Juegos y Entretenimiento (14 implementadas)
  "/test-velocidad-escritura/",
  "/juego-piedra-papel-tijera/",
  "/juego-tres-en-raya/",
  "/juego-memoria/",
  "/juego-2048/",
  "/juego-wordle/",
  "/juego-sudoku/",
  "/juego-puzzle-matematico/",
  "/radio-meskeia/",
  "/juego-asteroids/",          // Arcade clásico espacial
  "/juego-space-invaders/",     // Arcade clásico de invasores
  "/juego-platform-runner/",    // Juego de plataformas
  "/ruleta-aleatoria/",         // Ruleta personalizable para sorteos
  "/generador-loteria/",        // Números para Primitiva, Euromillones, Bonoloto

  // Salud y Bienestar (14 implementadas)
  "/calculadora-imc/",
  "/calculadora-calorias-ejercicio/",
  "/calculadora-hidratacion/",
  "/calculadora-sueno/",
  "/seguimiento-habitos/",
  "/curso-nutrisalud/",
  "/planificador-menu/",
  "/calculadora-porciones/",
  "/test-habitos/",
  "/planificador-embarazo/",         // Planificador embarazo: FPP, checklist, compras, vacunas
  "/planificador-mascota/",          // Planificador mascota: cachorro/gatito, checklist, compras, vacunas
  "/calculadora-alimentacion-mascotas/", // Alimentación perros/gatos: raciones, tóxicos, transición pienso
  "/calculadora-medicamentos-mascotas/", // Medicamentos mascotas: antiparasitarios, frecuencia, síntomas
  "/calculadora-tamano-adulto-perro/",   // Predicción peso adulto cachorros
  "/calculadora-percentiles/",       // Percentiles peso/talla infantil OMS

  // Herramientas Web y Tecnología (6 implementadas)
  "/validador-json/",
  "/conversor-base64/",
  "/generador-utm/",
  "/validador-regex/",
  "/conversor-imagenes/",
  "/compresor-imagenes/",       // Compresor de imágenes por lotes sin límites
  "/recortador-audio/",        // Recortador de audio con fade in/out
  "/generador-ondas/",         // Generador de ondas y visualizador de audio
  "/generador-iconos/",
  "/editor-exif/",             // Editor EXIF: visualiza y elimina metadatos de fotos

  // Creatividad y Diseño (7 implementadas)
  "/calculadora-aspectos/",
  "/conversor-colores/",
  "/generador-gradientes/",
  "/generador-sombras/",
  "/contraste-colores/",
  "/creador-paletas/",
  "/generador-tipografias/",
  "/creador-thumbnails/",           // Creador de thumbnails para YouTube

  // Emprendimiento y Negocios (8 implementadas)
  "/calculadora-tarifa-freelance/",
  "/simulador-gastos-deducibles/",
  "/calculadora-break-even/",
  "/calculadora-roi-marketing/",
  "/planificador-cashflow/",
  "/generador-nombres-empresa/",
  "/generador-facturas/",           // Facturas para autónomos con IVA/IRPF
  "/generador-carruseles/",         // Carruseles para Instagram/LinkedIn

  // Física y Química (7 implementadas)
  "/conversor-unidades/",
  "/conversor-unidades-rf/",        // dBm, Watts, VSWR, longitud de onda
  "/calculadora-movimiento/",
  "/simulador-fisica/",            // Simulador visual: caída libre, péndulo, proyectiles, ondas, resorte
  "/calculadora-electricidad/",
  "/glosario-fisica-quimica/",
  "/tabla-periodica/",

  // Campus Digital (9 implementadas)
  "/calculadora-notas/",
  "/creador-flashcards/",
  "/generador-horarios-estudio/",
  "/curso-emprendimiento/",
  "/curso-decisiones-inversion/",
  "/curso-nutrisalud/",
  "/curso-teoria-politica/",
  "/curso-pensamiento-cientifico/",
  "/curso-pensamiento-sistemico/",   // Curso Pensamiento Sistémico (20 capítulos)
  "/curso-empresa-familiar/",
  "/curso-negociacion/",
  "/curso-optimizacion-ia/",        // Curso GEO/AEO: optimización para IAs (6 capítulos)
  "/curso-marketing-digital/",      // Curso Marketing Digital 2025 (30 capítulos)
  "/curso-estrategia-empresarial/", // Curso Estrategia Empresarial (10 capítulos)
  "/curso-criptografia-seguridad/", // Curso Criptografía y Seguridad (15 capítulos)
  "/curso-redaccion-academica/",    // Curso Redacción Académica (13 capítulos)
  "/guia-cuidado-mascota/",         // Guía Cuidado de Mascotas (8 capítulos)

  // SEO & Marketing (9 implementadas)
  "/generador-meta-descripciones/",
  "/analizador-densidad-seo/",
  "/generador-palabras-clave/",
  "/generador-hashtags/",
  "/analizador-titulos-seo/",
  "/calculadora-legibilidad/",
  "/calculadora-tiempo-lectura/",
  "/generador-schema-markup/",
  "/analizador-geo/",                // Optimización contenido para IAs (GEO/AEO)

  // Referencia y Cultura General (6 implementadas)
  "/paises-del-mundo/",             // Buscador de países: banderas, capitales, monedas, idiomas
  "/minerales-del-mundo/",          // Guía de 50 minerales: composición, dureza, usos, curiosidades
  "/huesos-cuerpo-humano/",         // Guía de 206 huesos: nombre latino, tipo, región, articulaciones
  "/constelaciones-del-cielo/",     // Guía de 32 constelaciones: zodiaco, estrellas, mitología
  "/instrumentos-musicales/",       // Guía de 45 instrumentos: cuerda, viento, percusión, teclado
  "/vitaminas-minerales/",          // Guía de 30 nutrientes: vitaminas y minerales esenciales

  // Informática y Programación (1 implementada)
  "/visualizador-algoritmos/",      // Visualiza algoritmos de ordenación paso a paso

  // Biomedicina y Ciencias de la Salud (1 implementada)
  "/simulador-genetica/",           // Simulador de genética mendeliana con Punnett


  // Creatividad y Diseño (1 implementada)
  "/generador-avatares/",           // Genera avatares únicos desde nombre/texto
];

/**
 * Función helper para verificar si una app está implementada
 */
export const isAppImplemented = (url: string): boolean => {
  return implementedAppsUrls.includes(url);
};

/**
 * Total de apps implementadas (para contadores)
 */
export const TOTAL_IMPLEMENTED_APPS = implementedAppsUrls.length;
