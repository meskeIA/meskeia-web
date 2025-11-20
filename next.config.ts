import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MODO STATIC EXPORT - Compatible con Webempresa (hosting estático)
  output: 'export',

  // Trailing slash para mejor compatibilidad con servidores Apache
  trailingSlash: true,

  // Imágenes sin optimización (no requiere servidor Node.js)
  images: {
    unoptimized: true,
  },

  // Deshabilitar TypeScript strict durante build (acelera desarrollo)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
