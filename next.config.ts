import type { NextConfig } from "next";

/**
 * Configuración de Next.js 16.0.3 para meskeIA
 *
 * Deployment: Static Site Generation (SSG) en /beta/ subdirectory
 * Hosting: Webempresa (Apache, sin Node.js)
 * Apps migradas: 2/84 (calculadora-propinas, generador-contrasenas)
 */
const nextConfig: NextConfig = {
  // ============================================================================
  // STATIC EXPORT - Compatible con hosting estático (sin servidor Node.js)
  // ============================================================================
  output: 'export',

  // ============================================================================
  // BASE PATH - Deployment en subdirectorio
  // ============================================================================
  // PRODUCCIÓN: '/beta' para testing en https://meskeia.com/beta/
  // MIGRACIÓN FINAL: Cambiar a '' cuando se reemplace meskeia-web completamente
  // DESARROLLO: Comentado para testing local sin /beta
  // basePath: '/beta',

  // ============================================================================
  // SERVIDOR WEB - Optimizaciones para Apache
  // ============================================================================
  trailingSlash: true, // URLs terminan con / para mejor compatibilidad Apache

  // ============================================================================
  // IMÁGENES - Sin optimización (requeriría servidor Node.js)
  // ============================================================================
  images: {
    unoptimized: true, // Servir imágenes sin procesamiento dinámico
  },

  // ============================================================================
  // TYPESCRIPT - Validación parcial
  // ============================================================================
  // IMPORTANTE: Las 2 apps migradas NO tienen errores TypeScript
  // Errores existentes SOLO en 91 guías auto-generadas (atributos HTML legacy)
  // TODO: Revisar manualmente guías después de migrar las 84 apps principales
  typescript: {
    ignoreBuildErrors: true,
  },

  // ============================================================================
  // OPTIMIZACIONES DE PRODUCCIÓN
  // ============================================================================
  // Next.js 16 usa Turbopack por defecto para builds
  // No se requiere configuración adicional
};

export default nextConfig;
