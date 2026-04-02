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
    value: 'camera=(), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
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
      "media-src 'self'",
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
  // TYPESCRIPT - Validación estricta activada (0 errores desde 2026-02-06)
  // ============================================================================
  typescript: {
    ignoreBuildErrors: false,
  },

  // ============================================================================
  // REDIRECTS 301 - URLs antiguas renombradas (evita 404 en bookmarks y Google)
  // ============================================================================
  async redirects() {
    return [
      // Apps renombradas en febrero 2026
      { source: '/simulador-gastos-deducibles/', destination: '/orientador-gastos-deducibles/', permanent: true },
      { source: '/test-habitos/', destination: '/test-habitos-saludables/', permanent: true },
      { source: '/conversor-codigo-morse/', destination: '/conversor-morse/', permanent: true },
      { source: '/calculadora-tamano-cachorro/', destination: '/calculadora-tamano-adulto-perro/', permanent: true },
      { source: '/calculadora-percentiles-infantiles/', destination: '/orientador-percentiles/', permanent: true },
      { source: '/entrenador-tablas-multiplicar/', destination: '/tablas-multiplicar/', permanent: true },
      { source: '/constelaciones-cielo/', destination: '/constelaciones-del-cielo/', permanent: true },
      { source: '/simulador-genetica-mendeliana/', destination: '/simulador-genetica/', permanent: true },
      // Selectores renombrados en marzo 2026 (asesor → selector)
      { source: '/asesor-vehiculo/', destination: '/selector-vehiculo/', permanent: true },
      { source: '/asesor-smartphone/', destination: '/selector-smartphone/', permanent: true },
      { source: '/asesor-calefaccion/', destination: '/selector-calefaccion/', permanent: true },
      { source: '/asesor-portatil/', destination: '/selector-portatil/', permanent: true },
      { source: '/asesor-mascota/', destination: '/selector-mascota/', permanent: true },
      { source: '/asesor-seguro-salud/', destination: '/selector-seguro-salud/', permanent: true },
      // Apps renombradas en marzo 2026 (calculadora/simulador → estimador/orientador)
      { source: '/simulador-hipoteca/', destination: '/estimador-hipoteca/', permanent: true },
      { source: '/simulador-prestamos/', destination: '/estimador-prestamos/', permanent: true },
      { source: '/simulador-cartera-inversion/', destination: '/estimador-cartera-inversion/', permanent: true },
      { source: '/calculadora-jubilacion/', destination: '/planificador-ahorro-jubilacion/', permanent: true },
      { source: '/estimador-jubilacion/', destination: '/planificador-ahorro-jubilacion/', permanent: true },
      { source: '/calculadora-inversiones/', destination: '/estimador-inversiones/', permanent: true },
      { source: '/calculadora-fire/', destination: '/estimador-fire/', permanent: true },
      { source: '/calculadora-seguro-vida/', destination: '/orientador-seguro-vida/', permanent: true },
      { source: '/calculadora-infraseguro/', destination: '/estimador-infraseguro/', permanent: true },
      { source: '/calculadora-deuda/', destination: '/estimador-deuda/', permanent: true },
      { source: '/calculadora-tension-arterial/', destination: '/orientador-tension-arterial/', permanent: true },
      { source: '/calculadora-colesterol/', destination: '/orientador-colesterol/', permanent: true },
      { source: '/calculadora-medicamentos-mascotas/', destination: '/orientador-medicamentos-mascotas/', permanent: true },
      { source: '/simulador-compraventa-inmueble/', destination: '/estimador-compraventa-inmueble/', permanent: true },
      { source: '/calculadora-regla-50-30-20/', destination: '/orientador-regla-50-30-20/', permanent: true },
      { source: '/calculadora-fondo-emergencia/', destination: '/estimador-fondo-emergencia/', permanent: true },
      { source: '/calculadora-alquiler-vs-compra/', destination: '/orientador-alquiler-vs-compra/', permanent: true },
      { source: '/calculadora-tir-van/', destination: '/estimador-tir-van/', permanent: true },
      { source: '/calculadora-break-even/', destination: '/estimador-break-even/', permanent: true },
      { source: '/calculadora-roi-marketing/', destination: '/estimador-roi-marketing/', permanent: true },
      { source: '/calculadora-tarifa-freelance/', destination: '/orientador-tarifa-freelance/', permanent: true },
      { source: '/calculadora-coste-vivienda/', destination: '/estimador-coste-vivienda/', permanent: true },
      { source: '/calculadora-reformas-hogar/', destination: '/estimador-reformas-hogar/', permanent: true },
      { source: '/calculadora-imc/', destination: '/orientador-imc/', permanent: true },
      { source: '/calculadora-percentiles/', destination: '/orientador-percentiles/', permanent: true },
      { source: '/interes-compuesto/', destination: '/estimador-interes-compuesto/', permanent: true },
      { source: '/calculadora-inflacion/', destination: '/estimador-inflacion/', permanent: true },
      { source: '/calculadora-gastos-comunidad/', destination: '/estimador-gastos-comunidad/', permanent: true },
      { source: '/calculadora-coste-plazos/', destination: '/estimador-coste-plazos/', permanent: true },
      { source: '/simulador-jet-lag/', destination: '/orientador-jet-lag/', permanent: true },
    ];
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
