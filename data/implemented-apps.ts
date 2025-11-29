/**
 * Lista de aplicaciones IMPLEMENTADAS en meskeIA Next.js
 *
 * IMPORTANTE: Esta lista debe coincidir con las carpetas en app/
 * Solo añadir URLs cuando la app esté realmente creada
 *
 * Actualizado: 2025-11-29
 */

export const implementedAppsUrls = [
  // Finanzas y Fiscalidad (13 implementadas)
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
  "/calculadora-jubilacion/",
  "/calculadora-inversiones/",
  "/test-perfil-inversor/",

  // Calculadoras y Utilidades (10 implementadas)
  "/calculadora-propinas/",
  "/calculadora-iva/",
  "/calculadora-descuentos/",
  "/calculadora-porcentajes/",
  "/calculadora-fechas/",
  "/calculadora-regla-de-tres/",
  "/calculadora-cocina/",
  "/lista-compras/",
  "/conversor-tallas/",

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

  // Herramientas de Productividad (8 implementadas)
  "/notas/",
  "/generador-contrasenas/",
  "/lista-tareas/",
  "/cronometro/",
  "/conversor-horarios/",
  "/generador-qr/",
  "/generador-codigos-barras/",
  "/informacion-tiempo/",

  // Texto y Documentos (5 implementadas)
  "/contador-palabras/",
  "/conversor-texto/",
  "/limpiador-texto/",
  "/comparador-textos/",
  "/conversor-markdown-html/",

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

  // Herramientas Web y Tecnología (7 implementadas)
  "/validador-json/",
  "/conversor-base64/",
  "/generador-hash/",
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
