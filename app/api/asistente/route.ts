/**
 * API Route: Asistente meskeIA
 *
 * Recibe una consulta en lenguaje natural y devuelve las apps de meskeIA
 * más relevantes usando Claude Haiku como clasificador de intención.
 *
 * POST /api/asistente
 * Body: { consulta: string }
 * Response: { apps: AppRecomendada[], _debug?: string }
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

// Construye el catálogo en runtime (no en module-init) para garantizar
// que los datos están disponibles en el contexto serverless.
function construirCatalogo(): string {
  const appsImplementadas = applicationsDatabase.filter((app) =>
    implementedAppsUrls.includes(app.url)
  );

  // Log para verificar que el catálogo no está vacío
  console.log(`[asistente] Catálogo construido: ${appsImplementadas.length} apps`);

  return appsImplementadas
    .map((app) => `${app.icon} ${app.name}: ${app.description} [${app.url}]`)
    .join('\n');
}

// Extrae el array JSON de la respuesta de Claude de forma robusta.
// Maneja: texto extra antes/después, bloques markdown ```json ... ```.
function extraerArrayJSON(texto: string): string[] {
  // Limpiar bloques markdown
  const limpio = texto
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  // Intento 1: parsear directamente
  try {
    const parsed = JSON.parse(limpio) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === 'string');
    }
  } catch { /* continuar */ }

  // Intento 2: extraer array con regex (maneja texto extra alrededor)
  const match = limpio.match(/\[[\s\S]*?\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === 'string');
      }
    } catch { /* continuar */ }
  }

  return [];
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json() as { consulta?: string };
    const consulta = body.consulta?.trim();

    if (!consulta || consulta.length < 3) {
      return Response.json({ error: 'Consulta demasiado corta' }, { status: 400 });
    }

    if (consulta.length > 500) {
      return Response.json({ error: 'Consulta demasiado larga' }, { status: 400 });
    }

    const catalogo = construirCatalogo();

    const systemPrompt = `Eres el asistente de navegación de meskeIA, una web con herramientas gratuitas para el día a día en España.

Tu función es identificar qué apps del catálogo pueden ser útiles para el usuario.

CATÁLOGO DE APPS DISPONIBLES:
${catalogo}

INSTRUCCIONES:
- Responde EXCLUSIVAMENTE con un array JSON de URLs del catálogo anterior
- Devuelve entre 1 y 4 URLs, ordenadas de más a menos relevante
- Sé GENEROSO: si el usuario pregunta sobre un tema, recomienda la app aunque no pida explícitamente una herramienta
- Si pregunta "cómo se calcula X" o "qué es X", recomienda la app que lo calcula o explica
- Solo devuelve [] si la consulta no tiene ninguna relación con ninguna app
- NUNCA calcules resultados ni des consejos, solo devuelve el array JSON
- NUNCA inventes URLs que no estén en el catálogo

Formato de respuesta (SOLO esto, sin texto adicional):
["url1", "url2"]`;

    console.log(`[asistente] Consulta: "${consulta}"`);

    const respuesta = await cliente.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: systemPrompt,
      messages: [{ role: 'user', content: consulta }],
    });

    const textoRaw = respuesta.content[0].type === 'text'
      ? respuesta.content[0].text.trim()
      : '[]';

    console.log(`[asistente] Respuesta Claude: ${textoRaw}`);

    const urlsRecomendadas = extraerArrayJSON(textoRaw);

    console.log(`[asistente] URLs extraídas: ${JSON.stringify(urlsRecomendadas)}`);

    // Mapear URLs a apps completas
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
