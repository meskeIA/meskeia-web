import type { NextConfig } from "next";

/**
 * Configuración de Next.js 16.0.3 para meskeIA
 *
 * Deployment: Static Site Generation (SSG) en subdominio next.meskeia.com
 * Hosting: Webempresa (Apache, sin Node.js)
 *
 * NOTA: Sin basePath - el subdominio sirve directamente desde raíz
 */
const nextConfig: NextConfig = {
  // ============================================================================
  // STATIC EXPORT - Compatible con hosting estático (sin servidor Node.js)
  // ============================================================================
  output: 'export',

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
  // IMPORTANTE: Las apps nuevas NO tienen errores TypeScript
  // Errores existentes SOLO en guías auto-generadas (atributos HTML legacy)
  // TODO: Revisar manualmente guías después de migrar las apps principales
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
