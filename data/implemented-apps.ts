/**
 * Lista de aplicaciones IMPLEMENTADAS en meskeIA Next.js
 *
 * IMPORTANTE: Esta lista debe coincidir con las carpetas en app/
 * Solo añadir URLs cuando la app esté realmente creada
 *
 * Actualizado: 2025-11-26
 */

export const implementedAppsUrls = [
  // Finanzas y Fiscalidad (4 implementadas)
  // NOTA: Estas 4 apps mantienen URLs antiguas temporalmente hasta migrar
  "/impuesto-donaciones/",           // TODO: Renombrar a /calculadora-donaciones-cataluna/
  "/impuesto-donaciones-nacional/",  // TODO: Renombrar a /calculadora-donaciones-nacional/
  "/impuesto-sucesiones/",           // TODO: Renombrar a /calculadora-sucesiones-cataluna/
  "/impuesto-sucesiones-nacional/",  // TODO: Renombrar a /calculadora-sucesiones-nacional/

  // Calculadoras y Utilidades (7 implementadas)
  "/calculadora-propinas/",
  "/calculadora-fechas/",
  "/calculadora-regla-de-tres/",
  "/calculadora-cocina/",
  "/lista-compras/",
  "/conversor-tallas/",

  // Matemáticas y Estadística (1 implementada)
  // NOTA: Mantiene URL antigua temporalmente hasta renombrar carpeta
  "/algebra-ecuaciones/",            // TODO: Renombrar a /calculadora-ecuaciones/

  // Herramientas de Productividad (8 implementadas)
  "/notas/",
  "/generador-contrasenas/",
  "/lista-tareas/",
  "/cronometro/",
  "/conversor-horarios/",
  "/generador-qr/",
  "/generador-codigos-barras/",
  "/informacion-tiempo/",

  // Texto y Documentos (4 implementadas)
  "/contador-palabras/",
  "/conversor-texto/",
  "/limpiador-texto/",
  "/comparador-textos/",
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
