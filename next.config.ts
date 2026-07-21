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
    value: 'camera=(self), microphone=(self), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  },
  // CSP enforcement activo desde 23/02/2026 (período report-only superado sin incidencias)
  // Dominios adicionales identificados en auditoría de seguridad:
  // - ipapi.co, api64.ipify.org → app mi-ip (geolocalización cliente)
  // - api.openweathermap.org   → app informacion-tiempo
  // - cdn.jsdelivr.net         → app extractor-audio-video (ffmpeg.wasm scripts)
  // - www.openstreetmap.org    → app editor-exif (iframe mapa)
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://meskeia.com https://ipapi.co https://api64.ipify.org https://api.openweathermap.org",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "frame-src 'self' https://www.openstreetmap.org",
      "frame-ancestors 'none'",
      "report-uri /api/csp-report",
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
  // TYPESCRIPT - ignoreBuildErrors: true en producción (Vercel Hobby: 8 GB RAM)
  // El checker de TS con ~980 apps agota la RAM de la build machine de Vercel.
  // La validación TS se mantiene en local (npm run build, 32 GB) antes de cada push.
  // ============================================================================
  typescript: {
    ignoreBuildErrors: true,
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
  // REWRITES POR HOST - delegum.com sirve la marca Delegum desde este mismo proyecto
  //   delegum.com/api/mcp/                        → servidor MCP Delegum (/api/mcp/delegum)
  //   delegum.com/.well-known/mcp/server-card.json → tarjeta de discovery propia de Delegum
  // El enrutado de las PÁGINAS de delegum.com (/, /datos-fiscales, /asistente-ia,
  // /calculadoras, /aviso-legal → /delegum/*) lo hace middleware.ts, que también
  // cubre la navegación client-side. Aquí solo queda el endpoint MCP y su server-card.
  // El server-card se sirve por host porque public/.well-known/... es estático (mismo
  // contenido para todos los dominios) y meskeIA ya usa esa ruta estática.
  // ============================================================================
  async rewrites() {
    const has = [{ type: 'host' as const, value: '(www\\.)?delegum\\.com' }];
    return {
      beforeFiles: [
        { source: '/api/mcp', has, destination: '/api/mcp/delegum' },
        { source: '/api/mcp/', has, destination: '/api/mcp/delegum' },
        { source: '/.well-known/mcp/server-card.json', has, destination: '/delegum/well-known-mcp' },
      ],
    };
  },

  // ============================================================================
  // REDIRECTS - Consolidación canónica de la marca Delegum
  // En meskeia.com las páginas viven en /delegum/* por implementación, pero la URL
  // canónica es delegum.com/*. Redirigimos meskeia.com/delegum/* → delegum.com/*
  // para evitar contenido duplicado y URLs con prefijo. Solo afecta al host meskeia.com.
  // ============================================================================
  async redirects() {
    const has = [{ type: 'host' as const, value: '(www\\.)?meskeia\\.com' }];
    return [
      { source: '/delegum', has, destination: 'https://delegum.com/', permanent: true },
      { source: '/delegum/:path*', has, destination: 'https://delegum.com/:path*', permanent: true },
      // Consolidación canónica de Cronicum: el prefijo interno /cronicum/* vive en
      // meskeia.com por implementación, pero la URL canónica es cronicum.com/*.
      { source: '/cronicum', has, destination: 'https://cronicum.com/', permanent: true },
      { source: '/cronicum/:path*', has, destination: 'https://cronicum.com/:path*', permanent: true },

      // Recuperación de 404 por apps renombradas (detectado en GSC 2026-07-18).
      // Slugs antiguos (calculadora-*/simulador-*/convertidor-*) que Google aún
      // rastrea y que conservan posición; el 301 traspasa ese ranking a la app
      // vigente en lugar de dejar la nueva URL empezar de cero. Traffic bajo pero
      // real y con posiciones de página 1 en varios casos (p.ej. jet-lag pos 4,7).
      { source: '/simulador-jet-lag', has, destination: '/orientador-jet-lag/', permanent: true },
      { source: '/convertidor-markdown-html', has, destination: '/conversor-markdown-html/', permanent: true },
      { source: '/calculadora-coste-vivienda', has, destination: '/estimador-coste-vivienda/', permanent: true },
      { source: '/calculadora-fire', has, destination: '/estimador-fire/', permanent: true },
      { source: '/simulador-cartera-inversion', has, destination: '/estimador-cartera-inversion/', permanent: true },
      { source: '/calculadora-tension-arterial', has, destination: '/orientador-tension-arterial/', permanent: true },
      { source: '/calculadora-percentiles', has, destination: '/orientador-percentiles/', permanent: true },
      { source: '/calculadora-imc', has, destination: '/orientador-imc/', permanent: true },
      { source: '/test-habitos', has, destination: '/test-habitos-saludables/', permanent: true },
    ];
  },

  // ============================================================================
  // TURBOPACK - Configuración para sql.js (WebAssembly SQLite)
  // ============================================================================
  // sql.js intenta importar 'fs' que no existe en el browser
  // Esta configuración lo ignora para el bundle del cliente
  // Nota: los archivos WASM se sirven desde public/wasm/ (ver app/playground-sql/page.tsx)
  // para cumplir con la CSP estricta sin permitir CDNs externos.
  turbopack: {
    resolveAlias: {
      fs: { browser: './empty-module.js' },
      path: { browser: './empty-module.js' },
      crypto: { browser: './empty-module.js' },
    },
  },
};

export default withBundleAnalyzer(nextConfig);
