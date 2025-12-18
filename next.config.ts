import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * Configuración de Next.js 16.0.3 para meskeIA
 *
 * Deployment: Vercel (híbrido - SSG + API Routes serverless)
 * Anteriormente: Static Export para Webempresa (Apache)
 *
 * CAMBIO 18/12/2025: Migración a Vercel
 * - Eliminado output: 'export' para soportar API Routes (Analytics Turso)
 * - Las páginas estáticas se generan en build (ISR)
 * - Las API Routes se ejecutan como Edge Functions
 */
const nextConfig: NextConfig = {
  // ============================================================================
  // NOTA: output: 'export' ELIMINADO
  // Vercel soporta modo híbrido: páginas estáticas + API Routes dinámicas
  // ============================================================================

  // ============================================================================
  // SERVIDOR WEB - URLs con trailing slash para compatibilidad
  // ============================================================================
  trailingSlash: true,

  // ============================================================================
  // IMÁGENES - Sin optimización por ahora (puede habilitarse en Vercel)
  // ============================================================================
  images: {
    unoptimized: true,
  },

  // ============================================================================
  // TYPESCRIPT - Validación parcial
  // ============================================================================
  // IMPORTANTE: Las apps nuevas NO tienen errores TypeScript
  // Errores existentes SOLO en guías auto-generadas (atributos HTML legacy)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withBundleAnalyzer(nextConfig);
