/**
 * API Route: Asistente meskeIA
 *
 * Recibe una consulta en lenguaje natural y devuelve las apps de meskeIA
 * más relevantes usando Claude Haiku como clasificador de intención.
 *
 * El catálogo se construye dinámicamente desde data/applications.ts,
 * filtrado a apps implementadas, por lo que escala automáticamente
 * con cada nueva app añadida.
 *
 * POST /api/asistente
 * Body: { consulta: string }
 * Response: { apps: AppRecomendada[], mensaje?: string }
 */

import Anthropic from '@anthropic-ai/sdk';
import { applicationsDatabase } from '@/data/applications';
import { implementedAppsUrls } from '@/data/implemented-apps';

const cliente = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AppRecomendada {
  name: string;
  icon: string;
  description: string;
  url: string;
}

// Construye el catálogo compacto de apps implementadas para el system prompt.
// Solo campos esenciales para minimizar tokens (~8k tokens para 305 apps).
function construirCatalogo(): string {
  const appsImplementadas = applicationsDatabase.filter((app) =>
    implementedAppsUrls.includes(app.url)
  );

  return appsImplementadas
    .map((app) => `${app.icon} ${app.name}: ${app.description} [${app.url}]`)
    .join('\n');
}

const SYSTEM_PROMPT = `Eres el asistente de navegación de meskeIA, una web con herramientas gratuitas para el día a día en España.

Tu ÚNICA función es identificar qué apps del catálogo responden a la necesidad del usuario.

CATÁLOGO DE APPS DISPONIBLES:
${construirCatalogo()}

REGLAS ESTRICTAS:
- Responde EXCLUSIVAMENTE con un array JSON de URLs del catálogo anterior
- Devuelve entre 1 y 4 URLs, las más relevantes para la consulta
- Si ninguna app encaja, responde con: []
- NUNCA calcules, NUNCA des consejos, NUNCA respondas con texto
- NUNCA inventes URLs que no estén en el catálogo
- Formato exacto de respuesta: ["url1", "url2"]`;

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json() as { consulta?: string };
    const consulta = body.consulta?.trim();

    if (!consulta || consulta.length < 3) {
      return Response.json(
        { error: 'Consulta demasiado corta' },
        { status: 400 }
      );
    }

    if (consulta.length > 500) {
      return Response.json(
        { error: 'Consulta demasiado larga' },
        { status: 400 }
      );
    }

    const respuesta = await cliente.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: consulta }],
    });

    const textoRespuesta = respuesta.content[0].type === 'text'
      ? respuesta.content[0].text.trim()
      : '[]';

    // Parsear el JSON devuelto por Claude (array de URLs)
    let urlsRecomendadas: string[] = [];
    try {
      const parsed = JSON.parse(textoRespuesta) as unknown;
      if (Array.isArray(parsed)) {
        urlsRecomendadas = parsed.filter(
          (item): item is string => typeof item === 'string'
        );
      }
    } catch {
      urlsRecomendadas = [];
    }

    // Construir las apps completas a partir de las URLs recomendadas
    const appsRecomendadas: AppRecomendada[] = urlsRecomendadas
      .map((url) => applicationsDatabase.find((app) => app.url === url))
      .filter((app): app is NonNullable<typeof app> => app !== undefined)
      .map((app) => ({
        name: app.name,
        icon: app.icon,
        description: app.description,
        url: app.url,
      }));

    return Response.json({ apps: appsRecomendadas });

  } catch (error) {
    console.error('[asistente] Error:', error);
    return Response.json(
      { error: 'Error interno del asistente' },
      { status: 500 }
    );
  }
}
