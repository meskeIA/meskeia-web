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
 * - GPTBot + OAI-SearchBot (OpenAI: entrenamiento + búsqueda de ChatGPT)
 * - ClaudeBot + anthropic-ai + Claude-User (Anthropic/Claude)
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
      // - /*?ref=*: parámetros UTM de campañas externas (Product Hunt, etc.).
      //   La canonical apunta a la URL limpia, así que Google las marca como
      //   "alternativas". Bloquearlas ahorra crawl budget y elimina el aviso.
      //
      // ?from= NO se bloquea desde el 26/09/2026. Se bloqueó el 26/05 (ad9a97c2),
      // cuando todo enlace interno lo llevaba; desde el 28/07 (5097b9fc) los internos
      // usan #from=, que Google ignora, y ?from= queda solo en los saltos
      // cross-dominio (p. ej. delegum.com/soluciones/ → ?from=delegum). Bloquearlo
      // dejaba esos enlaces sin seguir: Google no podía llegar a la canonical y el
      // enlace no transmitía nada. Los cuatro verticales nunca lo bloquearon.
      // El Analytics no se contamina: el tracker descarta a Googlebot en cliente y
      // servidor. Medición que lo motivó: memoria project_baseline_indexacion_gsc.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/*?ref='],
      },
      // OpenAI - GPTBot (entrenamiento) + OAI-SearchBot (búsqueda de ChatGPT, el que
      // cita y devuelve clics). Acceso completo + índice de herramientas.
      {
        userAgent: ['GPTBot', 'OAI-SearchBot'],
        allow: ['/', '/api/', '/ai-index.json'],
      },
      // Anthropic - ClaudeBot (rastreo), anthropic-ai (legacy) y Claude-User (Claude
      // accediendo a la web por encargo del usuario). Acceso completo + índice.
      // Antes solo figuraba 'Claude-Web', nombre legacy que ya no coincide con el
      // crawler real → caía bajo la regla '*' y se quedaba sin /api/.
      {
        userAgent: ['ClaudeBot', 'anthropic-ai', 'Claude-User'],
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
