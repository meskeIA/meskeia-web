import { MetadataRoute } from 'next';

// Configuración para static export
export const dynamic = 'force-static';

/**
 * robots.txt para PRODUCCIÓN (meskeia.com)
 *
 * PERMITE rastreo completo de buscadores y LLMs.
 * Incluye referencias al sitemap y API de herramientas para indexación.
 *
 * User-Agents de LLMs soportados:
 * - GPTBot (OpenAI/ChatGPT)
 * - Claude-Web (Anthropic/Claude)
 * - PerplexityBot (Perplexity AI)
 * - Google-Extended (Gemini/Bard)
 * - Amazonbot (Amazon/Alexa)
 * - FacebookBot (Meta AI)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Regla general para todos los bots
      // - /api/: endpoints serverless (MCP, ChatGPT tools, analytics, tRPC).
      //   Devuelven 4xx ante GET de crawlers — no son páginas indexables.
      //   Los LLMs que sí los necesitan tienen acceso explícito más abajo.
      // - /*?from=*: tracking interno de cross-linking entre apps.
      // - /*?ref=*: parámetros UTM de campañas externas (Product Hunt, etc.).
      //   La canonical apunta a la URL limpia, así que Google las marca como
      //   "alternativas". Bloquearlas ahorra crawl budget y elimina el aviso.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/*?from=', '/*?ref='],
      },
      // GPTBot (ChatGPT/OpenAI) - Permitir acceso completo + índice de herramientas
      {
        userAgent: 'GPTBot',
        allow: ['/', '/api/', '/ai-index.json'],
      },
      // Claude-Web (Anthropic) - Permitir acceso completo + índice de herramientas
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/api/', '/ai-index.json'],
      },
      // PerplexityBot - Permitir acceso completo + índice de herramientas
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/api/', '/ai-index.json'],
      },
      // Google-Extended (Gemini/Bard) - Permitir acceso completo
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/api/', '/ai-index.json'],
      },
      // Amazonbot (Alexa) - Permitir acceso completo
      {
        userAgent: 'Amazonbot',
        allow: ['/', '/api/', '/ai-index.json'],
      },
      // FacebookBot (Meta AI) - Permitir acceso completo
      {
        userAgent: 'FacebookBot',
        allow: ['/', '/api/', '/ai-index.json'],
      },
    ],
    sitemap: 'https://meskeia.com/sitemap.xml',
  };
}
