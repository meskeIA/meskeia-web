/**
 * API Route: Asistente meskeIA — recomendador de apps por lenguaje natural
 *
 * Recibe una consulta en lenguaje natural y devuelve las apps del catálogo
 * más relevantes. Los cálculos los realiza el usuario en la app correspondiente.
 *
 * POST /api/asistente
 * Body: { consulta: string, historial?: MensajeHistorial[] }
 * Response: { texto?: string, apps?: AppRecomendada[], historial: MensajeHistorial[] }
 */

import Anthropic from '@anthropic-ai/sdk';
import { applicationsDatabase } from '@/data/applications';
import { implementedAppsUrls } from '@/data/implemented-apps';

const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface AppRecomendada {
  name: string;
  icon: string;
  description: string;
  url: string;
}

export interface MensajeHistorial {
  role: 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Catálogo y utilidades
// ---------------------------------------------------------------------------

function construirCatalogo(): string {
  return applicationsDatabase
    .filter((app) => implementedAppsUrls.includes(app.url))
    .map((app) => `${app.icon} ${app.name}: ${app.description} [${app.url}]`)
    .join('\n');
}

function extraerArrayJSON(texto: string): string[] {
  const limpio = texto.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const intentos = [limpio, ...(limpio.match(/\[[\s\S]*?\]/g) ?? [])];
  for (const intento of intentos) {
    try {
      const parsed = JSON.parse(intento) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
    } catch { /* continuar */ }
  }
  return [];
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Eres el asistente de meskeIA, una web de herramientas gratuitas para el día a día en España.

Tu única función es orientar al usuario hacia las apps del catálogo que mejor respondan a su necesidad.

INSTRUCCIONES:
- Analiza la consulta del usuario y selecciona las apps más relevantes del catálogo.
- Responde SIEMPRE con un array JSON de URLs: ["/url-app-1/", "/url-app-2/"]
- Incluye entre 1 y 4 apps ordenadas de más a menos relevante.
- Si ninguna app del catálogo es relevante, responde con [].
- Sé generoso: si hay duda entre incluir o no una app, inclúyela.
- Nunca calcules ni respondas preguntas directamente. Tu rol es orientar, no calcular.
- Responde siempre en español.

CATÁLOGO DE APPS:
${construirCatalogo()}`;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json() as { consulta?: string; historial?: MensajeHistorial[] };
    const consulta = body.consulta?.trim();
    const historialPrevio: MensajeHistorial[] = body.historial ?? [];

    if (!consulta || consulta.length < 2) {
      return Response.json({ error: 'Consulta demasiado corta' }, { status: 400 });
    }

    const mensajes: Anthropic.MessageParam[] = [
      ...historialPrevio.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: consulta },
    ];

    const respuesta = await cliente.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: mensajes,
    });

    const textoFinal = respuesta.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const urls = extraerArrayJSON(textoFinal);
    const apps: AppRecomendada[] = urls
      .map((url) => applicationsDatabase.find((a) => a.url === url))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .map((a) => ({ name: a.name, icon: a.icon, description: a.description, url: a.url }));

    const historialActualizado: MensajeHistorial[] = [
      ...historialPrevio,
      { role: 'user', content: consulta },
      { role: 'assistant', content: textoFinal },
    ];

    return Response.json({
      apps: apps.length > 0 ? apps : undefined,
      historial: historialActualizado,
    });

  } catch (error) {
    console.error('[asistente] Error:', error);
    return Response.json({ error: 'Error interno del asistente' }, { status: 500 });
  }
}
