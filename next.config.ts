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
// ============================================================================
// CABECERAS DE SEGURIDAD HTTP
// ============================================================================
const securityHeaders = [
  // Prevenir clickjacking - No permitir iframe de nuestra web
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevenir MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Política de referrer
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Protección XSS legacy (navegadores antiguos)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Restringir APIs del navegador innecesarias
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  },
  // CSP en modo report-only (no bloquea, solo registra violaciones)
  // Una vez verificado que no hay violaciones, cambiar a Content-Security-Policy
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://meskeia.com",
      "media-src 'self'",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

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
  // TYPESCRIPT - Validación estricta activada (0 errores desde 2026-02-06)
  // ============================================================================
  typescript: {
    ignoreBuildErrors: false,
  },

  // ============================================================================
  // CABECERAS DE SEGURIDAD - Se aplican a todas las rutas
  // ============================================================================
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // ============================================================================
  // TURBOPACK - Configuración para sql.js (WebAssembly SQLite)
  // ============================================================================
  // sql.js intenta importar 'fs' que no existe en el browser
  // Esta configuración lo ignora para el bundle del cliente
  turbopack: {
    resolveAlias: {
      fs: { browser: './empty-module.js' },
      path: { browser: './empty-module.js' },
      crypto: { browser: './empty-module.js' },
    },
  },
};

export default withBundleAnalyzer(nextConfig);
