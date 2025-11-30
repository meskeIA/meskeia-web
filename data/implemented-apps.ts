/**
 * Lista de aplicaciones IMPLEMENTADAS en meskeIA Next.js
 *
 * IMPORTANTE: Esta lista debe coincidir con las carpetas en app/
 * Solo añadir URLs cuando la app esté realmente creada
 *
 * Actualizado: 2025-11-30
 */

export const implementedAppsUrls = [
  // Finanzas y Fiscalidad (16 implementadas)
  "/calculadora-inflacion/",
  "/calculadora-donaciones-cataluna/",
  "/calculadora-donaciones-nacional/",
  "/calculadora-sucesiones-cataluna/",
  "/calculadora-sucesiones-nacional/",
  "/simulador-irpf/",
  "/calculadora-plusvalias-irpf/",   // Plusvalías capital mobiliario (acciones, fondos, cripto)
  "/calculadora-tir-van/",
  "/control-gastos/",
  "/interes-compuesto/",
  "/simulador-hipoteca/",
  "/simulador-prestamos/",           // Compara sistemas francés, alemán, americano
  "/amortizacion-hipoteca/",         // Amortización anticipada: reducir cuota vs plazo
  "/calculadora-jubilacion/",
  "/calculadora-inversiones/",
  "/test-perfil-inversor/",

  // Calculadoras y Utilidades (11 implementadas)
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

  // Matemáticas y Estadística (11 implementadas)
  "/algebra-ecuaciones/",            // Calculadora de Ecuaciones
  "/calculadora-mcd-mcm/",
  "/calculadora-probabilidad/",
  "/calculadora-estadistica/",
  "/calculadora-matematica/",
  "/calculadora-geometria/",
  "/calculadora-calculo/",
  "/calculadora-trigonometria/",
  "/calculadora-teoria-numeros/",
  "/calculadora-algebra-abstracta/",
  "/calculadora-teoria-colas/",

  // Herramientas de Productividad (11 implementadas)
  "/time-tracker/",
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

  // Texto y Documentos (12 implementadas)
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

  // Criptografía y Seguridad (7 implementadas)
  "/cifrado-clasico/",          // César + ROT13 + Atbash
  "/cifrado-vigenere/",         // Cifrado polialfabético con clave
  "/cifrado-transposicion/",    // Columnas, Rail Fence, Escítala
  "/cifrado-playfair/",         // Matriz 5x5, digramas
  "/cifrado-aes/",              // AES-256 GCM/CBC moderno
  "/generador-hashes/",         // MD5, SHA-256, SHA-512
  "/codificador-base64/",       // Base64, URL encode, Hexadecimal

  // Juegos y Entretenimiento (9 implementadas)
  "/test-velocidad-escritura/",
  "/juego-piedra-papel-tijera/",
  "/juego-tres-en-raya/",
  "/juego-memoria/",
  "/juego-2048/",
  "/juego-wordle/",
  "/juego-sudoku/",
  "/juego-puzzle-matematico/",
  "/radio-meskeia/",

  // Salud y Bienestar (9 implementadas)
  "/calculadora-imc/",
  "/calculadora-calorias-ejercicio/",
  "/calculadora-hidratacion/",
  "/calculadora-sueno/",
  "/seguimiento-habitos/",
  "/curso-nutrisalud/",
  "/planificador-menu/",
  "/calculadora-porciones/",
  "/test-habitos/",

  // Herramientas Web y Tecnología (6 implementadas)
  "/validador-json/",
  "/conversor-base64/",
  "/generador-utm/",
  "/validador-regex/",
  "/conversor-imagenes/",
  "/generador-iconos/",

  // Creatividad y Diseño (7 implementadas)
  "/calculadora-aspectos/",
  "/conversor-colores/",
  "/generador-gradientes/",
  "/generador-sombras/",
  "/contraste-colores/",
  "/creador-paletas/",
  "/generador-tipografias/",

  // Emprendimiento y Negocios (6 implementadas)
  "/calculadora-tarifa-freelance/",
  "/simulador-gastos-deducibles/",
  "/calculadora-break-even/",
  "/calculadora-roi-marketing/",
  "/planificador-cashflow/",
  "/generador-nombres-empresa/",

  // Física y Química (5 implementadas)
  "/conversor-unidades/",
  "/calculadora-movimiento/",
  "/calculadora-electricidad/",
  "/glosario-fisica-quimica/",
  "/tabla-periodica/",

  // Campus Digital (6 implementadas)
  "/calculadora-notas/",
  "/creador-flashcards/",
  "/generador-horarios-estudio/",
  "/curso-emprendimiento/",
  "/curso-decisiones-inversion/",
  "/curso-nutrisalud/",

  // SEO & Marketing (8 implementadas)
  "/generador-meta-descripciones/",
  "/analizador-densidad-seo/",
  "/generador-palabras-clave/",
  "/generador-hashtags/",
  "/analizador-titulos-seo/",
  "/calculadora-legibilidad/",
  "/calculadora-tiempo-lectura/",
  "/generador-schema-markup/",
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
