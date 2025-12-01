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
      {
        userAgent: '*',
        allow: '/',
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
    // Host canónico
    host: 'https://meskeia.com',
  };
}
