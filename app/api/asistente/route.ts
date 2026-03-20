/**
 * API Route: Asistente meskeIA — modo conversacional con tool_use
 *
 * Dos comportamientos según la consulta:
 * 1. Cálculo: usa tool_use para llamar a las calculadoras de lib/calculadoras/
 *    → Claude pregunta datos faltantes y devuelve resultado exacto
 * 2. Navegación: recomienda apps del catálogo (comportamiento anterior)
 *
 * POST /api/asistente
 * Body: { consulta: string, historial?: MensajeHistorial[] }
 * Response: { texto?: string, apps?: AppRecomendada[], historial: MensajeHistorial[] }
 */

import Anthropic from '@anthropic-ai/sdk';
import { applicationsDatabase } from '@/data/applications';
import { implementedAppsUrls } from '@/data/implemented-apps';
import { calcularPropina } from '@/lib/calculadoras/propinas';
import { calcularPorcentaje, type ModoPorcentaje } from '@/lib/calculadoras/porcentajes';
import { calcularConsumo, calcularViaje } from '@/lib/calculadoras/combustible';

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
// Definición de herramientas (tools) para Claude
// ---------------------------------------------------------------------------

const HERRAMIENTAS: Anthropic.Tool[] = [
  {
    name: 'calcular_propina',
    description: 'Calcula la propina de una cuenta de restaurante y la divide entre varias personas. Usa esto cuando el usuario quiera calcular propinas o dividir una cuenta.',
    input_schema: {
      type: 'object' as const,
      properties: {
        monto:      { type: 'number', description: 'Importe total de la cuenta en euros' },
        porcentaje: { type: 'number', description: 'Porcentaje de propina, ej: 10 para 10%. Por defecto 10.' },
        personas:   { type: 'number', description: 'Número de personas entre las que dividir. Por defecto 1.' },
      },
      required: ['monto'],
    },
  },
  {
    name: 'calcular_porcentaje',
    description: 'Realiza cálculos con porcentajes. Modos: percentOf (X% de Y), whatPercent (qué % es X de Y), increase (aumentar X en Y%), decrease (disminuir X en Y%), variation (variación de X a Y).',
    input_schema: {
      type: 'object' as const,
      properties: {
        modo:   { type: 'string', enum: ['percentOf', 'whatPercent', 'increase', 'decrease', 'variation'], description: 'Tipo de cálculo' },
        valor1: { type: 'number', description: 'Primer valor según el modo' },
        valor2: { type: 'number', description: 'Segundo valor según el modo' },
      },
      required: ['modo', 'valor1', 'valor2'],
    },
  },
  {
    name: 'calcular_combustible',
    description: 'Dos modos: "consumo" (dados km y litros gastados, calcula L/100km y coste) o "viaje" (dados km del trayecto y consumo del coche, calcula litros y coste total).',
    input_schema: {
      type: 'object' as const,
      properties: {
        modo:             { type: 'string', enum: ['consumo', 'viaje'], description: '"consumo" para trayecto ya hecho, "viaje" para estimar uno futuro' },
        precioCombustible:{ type: 'number', description: 'Precio del combustible en €/litro, ej: 1.65' },
        kilometros:       { type: 'number', description: '(Modo consumo) km recorridos' },
        litros:           { type: 'number', description: '(Modo consumo) litros gastados' },
        distanciaKm:      { type: 'number', description: '(Modo viaje) distancia del trayecto en km' },
        consumoL100km:    { type: 'number', description: '(Modo viaje) consumo medio del vehículo en L/100km' },
      },
      required: ['modo', 'precioCombustible'],
    },
  },
];

// ---------------------------------------------------------------------------
// Ejecución de herramientas
// ---------------------------------------------------------------------------

function ejecutarHerramienta(nombre: string, params: Record<string, unknown>): string {
  try {
    if (nombre === 'calcular_propina') {
      const { monto, porcentaje = 10, personas = 1 } = params as {
        monto: number; porcentaje?: number; personas?: number;
      };
      const r = calcularPropina({ monto, porcentaje, personas });
      return JSON.stringify({
        propina_euros: r.propina,
        total_con_propina: r.totalConPropina,
        por_persona: r.totalPorPersona,
        personas,
        porcentaje_aplicado: porcentaje,
      });
    }

    if (nombre === 'calcular_porcentaje') {
      const { modo, valor1, valor2 } = params as {
        modo: ModoPorcentaje; valor1: number; valor2: number;
      };
      const r = calcularPorcentaje({ modo, valor1, valor2 });
      return JSON.stringify({ resultado: r.resultado, detalle: r.detalle, es_porcentaje: r.esProcentaje });
    }

    if (nombre === 'calcular_combustible') {
      const { modo, precioCombustible, kilometros, litros, distanciaKm, consumoL100km } = params as {
        modo: 'consumo' | 'viaje';
        precioCombustible: number;
        kilometros?: number;
        litros?: number;
        distanciaKm?: number;
        consumoL100km?: number;
      };
      if (modo === 'consumo') {
        if (!kilometros || !litros) return 'Faltan datos: necesito kilómetros recorridos y litros gastados.';
        const r = calcularConsumo({ kilometros, litros, precioCombustible });
        return JSON.stringify({
          consumo_l100km: r.consumoL100km,
          coste_por_km: r.costePorKm,
          autonomia_con_50_euros: r.autonomiaCon50Euros,
          eficiencia: r.eficiencia,
        });
      } else {
        if (!distanciaKm || !consumoL100km) return 'Faltan datos: necesito distancia en km y consumo del vehículo en L/100km.';
        const r = calcularViaje({ distanciaKm, consumoL100km, precioCombustible });
        return JSON.stringify({
          litros_necesarios: r.litrosNecesarios,
          coste_total: r.costeTotal,
          coste_por_km: r.costePorKm,
        });
      }
    }

    return 'Herramienta no reconocida.';
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : 'parámetros inválidos'}`;
  }
}

// ---------------------------------------------------------------------------
// Catálogo de apps (para recomendación cuando no hay cálculo)
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

CAPACIDADES:
1. Tienes herramientas para calcular propinas, porcentajes y combustible — úsalas cuando el usuario lo necesite.
2. Para otros temas, recomienda apps del catálogo respondiendo SOLO con un array JSON de URLs.

COMPORTAMIENTO:
- Si el usuario pide un cálculo de propina, porcentaje o combustible → usa la herramienta correspondiente.
- Si faltan datos para calcular → pregunta solo lo estrictamente necesario, en una sola pregunta.
- Si el tema no corresponde a ninguna herramienta → responde con un array JSON: ["/url-app/"]
- Si no hay ninguna app relevante → responde con []
- Responde siempre en español, de forma concisa y amable.
- Para los resultados de cálculos: usa formato español (coma decimal, punto miles) y añade la unidad.

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

    // Construir el array de mensajes para Claude
    const mensajes: Anthropic.MessageParam[] = [
      ...historialPrevio.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: consulta },
    ];

    // Primera llamada a Claude (con tools disponibles)
    let respuesta = await cliente.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: HERRAMIENTAS,
      messages: mensajes,
    });

    // Bucle de tool_use: Claude puede pedir ejecutar una herramienta
    while (respuesta.stop_reason === 'tool_use') {
      const bloquesTool = respuesta.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      // Construir resultados de todas las herramientas llamadas
      const resultadosTool: Anthropic.ToolResultBlockParam[] = bloquesTool.map((bloque) => ({
        type: 'tool_result' as const,
        tool_use_id: bloque.id,
        content: ejecutarHerramienta(bloque.name, bloque.input as Record<string, unknown>),
      }));

      // Añadir la respuesta del asistente (con tool_use) y los resultados
      mensajes.push({ role: 'assistant', content: respuesta.content });
      mensajes.push({ role: 'user', content: resultadosTool });

      // Segunda llamada: Claude formatea la respuesta final con los datos calculados
      respuesta = await cliente.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: HERRAMIENTAS,
        messages: mensajes,
      });
    }

    // Extraer texto de la respuesta final
    const textoFinal = respuesta.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // Intentar interpretar como recomendación de apps
    const urls = extraerArrayJSON(textoFinal);
    const apps: AppRecomendada[] = urls
      .map((url) => applicationsDatabase.find((a) => a.url === url))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .map((a) => ({ name: a.name, icon: a.icon, description: a.description, url: a.url }));

    // Historial actualizado para el siguiente turno
    const historialActualizado: MensajeHistorial[] = [
      ...historialPrevio,
      { role: 'user', content: consulta },
      { role: 'assistant', content: textoFinal },
    ];

    return Response.json({
      texto: apps.length > 0 ? undefined : textoFinal,
      apps: apps.length > 0 ? apps : undefined,
      historial: historialActualizado,
    });

  } catch (error) {
    console.error('[asistente] Error:', error);
    return Response.json({ error: 'Error interno del asistente' }, { status: 500 });
  }
}
