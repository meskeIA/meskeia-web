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
    // magnetometer/gyroscope/accelerometer en (self): los necesita nivel-burbuja
    // (evento deviceorientation). Con =() Chrome los bloqueaba en silencio.
    value: 'camera=(self), microphone=(self), geolocation=(self), payment=(), usb=(), magnetometer=(self), gyroscope=(self), accelerometer=(self)',
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

      // 301 DE MIGRACIÓN de las cronologías (distinto del canónico de arriba): las
      // cronologías del sistema dinámico vivían en meskeia.com/visualizador-historia/[slug]
      // y a la vez en cronicum.com/[slug] (mismo dato, misma componente). Cronicum ya está
      // plenamente indexado (GSC 2026-07-22: cronologías "Enviada e indexada", canónica
      // aceptada por Google); el canonical blando no bastaba para consolidar las páginas
      // fuertes (p.ej. roma seguía coronada en meskeia pese al canonical → cronicum), así
      // que este 301 fuerza la mudanza definitiva a cronicum.com. El query string se
      // reenvía automáticamente, preservando la atribución ?from= a través del salto.
      // NO captura las 3 apps custom hifenadas (/visualizador-historia-reloj|dinero|
      // escritura/): son apps propias de meskeIA con formato distinto, no cronologías, y
      // no existen en Cronicum — su path no casa con /visualizador-historia/:path* (barra).
      { source: '/visualizador-historia/:path*', has, destination: 'https://cronicum.com/:path*', permanent: true },

      // Recuperación de 404 por apps renombradas (detectado en GSC 2026-07-18).
      // Slugs antiguos (calculadora-*/simulador-*/convertidor-*) que Google aún
      // rastrea y que conservan posición; el 301 traspasa ese ranking a la app
      // vigente en lugar de dejar la nueva URL empezar de cero. Traffic bajo pero
      // real y con posiciones de página 1 en varios casos (p.ej. jet-lag pos 4,7).
      { source: '/simulador-jet-lag', has, destination: '/orientador-jet-lag/', permanent: true },
      // Slug antiguo del estimador de compraventa: seguía en el índice de Google con
      // 333 impresiones y 14 clics en 180 días (posición media 8,9) devolviendo 404
      // (verificado en GSC 2026-07-25). El 301 recupera esos clics y traspasa la señal.
      { source: '/simulador-compraventa-inmueble', has, destination: '/estimador-compraventa-inmueble/', permanent: true },
      { source: '/convertidor-markdown-html', has, destination: '/conversor-markdown-html/', permanent: true },
      { source: '/calculadora-coste-vivienda', has, destination: '/estimador-coste-vivienda/', permanent: true },
      { source: '/calculadora-fire', has, destination: '/estimador-fire/', permanent: true },
      { source: '/simulador-cartera-inversion', has, destination: '/estimador-cartera-inversion/', permanent: true },
      { source: '/calculadora-tension-arterial', has, destination: '/orientador-tension-arterial/', permanent: true },
      { source: '/calculadora-percentiles', has, destination: '/orientador-percentiles/', permanent: true },
      { source: '/calculadora-imc', has, destination: '/orientador-imc/', permanent: true },
      { source: '/test-habitos', has, destination: '/test-habitos-saludables/', permanent: true },

      // Fusión de las tres apps de algoritmos de ordenación (31/07/2026). Las tres
      // hacían lo mismo con títulos casi idénticos y se canibalizaban entre sí: 1
      // impresión en Google en 90 días ENTRE LAS TRES. visualizador-algoritmos
      // absorbió lo que tenían de propio (Heap y Counting Sort, modo comparativa,
      // presets y array propio), así que estas dos ya no aportan nada que no esté allí.
      { source: '/simulador-ordenacion', has, destination: '/visualizador-algoritmos/', permanent: true },
      { source: '/visualizador-algoritmos-ordenacion', has, destination: '/visualizador-algoritmos/', permanent: true },

      // Renombrado de «Calculadora Roommates» (08/08/2026). El anglicismo del slug la hacía
      // invisible —ni siquiera se encontraba buscándola dentro del propio catálogo— y el
      // encuadre en piso compartido dejaba fuera viaje, cena y regalo conjunto, que son la
      // otra mitad de la demanda. 1 uso en 30 días con ocho meses de antigüedad.
      { source: '/calculadora-roommates', has, destination: '/calculadora-gastos-compartidos/', permanent: true },
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
