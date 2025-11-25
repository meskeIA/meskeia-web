/**
 * Lista de aplicaciones IMPLEMENTADAS en meskeIA Next.js
 * Total: 28 aplicaciones
 *
 * Esta lista filtra applicationsDatabase para mostrar solo apps que existen realmente
 */

export const implementedAppsUrls = [
  // Finanzas y Fiscalidad (13)
  "/simulador-hipoteca/",
  "/calculadora-jubilacion/",
  "/calculadora-inversiones/",
  "/interes-compuesto/",
  "/control-gastos-mensual/",
  "/simulador-irpf/",
  "/impuesto-donaciones/",
  "/impuesto-donaciones-nacional/",
  "/impuesto-sucesiones/",
  "/impuesto-sucesiones-nacional/",
  "/tir-van/",
  "/calculadora-porcentajes/",
  "/calculadora-propinas/",

  // Calculadoras y Utilidades (6)
  "/calculadora-fechas/",
  "/conversor-tallas/",
  "/regla-de-tres/",
  "/calculadora-cocina/",
  "/lista-compras/",
  "/conversor-divisas/",

  // Matemáticas y Estadística (2)
  "/algebra-ecuaciones/",
  "/trigonometria/",

  // Herramientas de Productividad (1)
  "/generador-contrasenas/",
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
export const TOTAL_IMPLEMENTED_APPS = implementedAppsUrls.length; // 28
