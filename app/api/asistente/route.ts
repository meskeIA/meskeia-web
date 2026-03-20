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
import { calcularIMC } from '@/lib/calculadoras/imc';
import {
  calcularDiferenciaFechas,
  calcularOperacionFecha,
  calcularDiaSemana,
  calcularEdad,
  type UnidadTiempo,
  type OperacionFecha,
} from '@/lib/calculadoras/fechas';

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
  {
    name: 'calcular_diferencia_fechas',
    description: 'Calcula cuántos días, semanas, meses y años hay entre dos fechas. Úsalo cuando el usuario pregunte "cuánto tiempo falta/queda/hay", "cuántos días entre", plazos, antigüedad, tiempo transcurrido.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fechaInicio: { type: 'string', description: 'Fecha inicial en formato YYYY-MM-DD o "hoy"' },
        fechaFin:    { type: 'string', description: 'Fecha final en formato YYYY-MM-DD o "hoy"' },
      },
      required: ['fechaInicio', 'fechaFin'],
    },
  },
  {
    name: 'calcular_fecha_resultado',
    description: 'Suma o resta días, semanas, meses o años a una fecha para obtener otra fecha. Úsalo cuando el usuario pregunte "qué fecha será en X días/meses", "cuándo vence en X días", plazos futuros o pasados.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fechaBase:  { type: 'string', description: 'Fecha de partida en formato YYYY-MM-DD o "hoy"' },
        operacion:  { type: 'string', enum: ['sumar', 'restar'], description: '"sumar" para fecha futura, "restar" para fecha pasada' },
        cantidad:   { type: 'number', description: 'Número de unidades a sumar o restar' },
        unidad:     { type: 'string', enum: ['dias', 'semanas', 'meses', 'anios'], description: 'Unidad temporal' },
      },
      required: ['fechaBase', 'operacion', 'cantidad', 'unidad'],
    },
  },
  {
    name: 'calcular_dia_semana',
    description: 'Dice qué día de la semana (lunes, martes...) es una fecha concreta. Úsalo cuando el usuario pregunte "qué día cae", "en qué día de la semana es/fue", o quiera saber si una fecha es festivo/fin de semana.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fecha: { type: 'string', description: 'Fecha a consultar en formato YYYY-MM-DD o "hoy"' },
      },
      required: ['fecha'],
    },
  },
  {
    name: 'calcular_edad',
    description: 'Calcula la edad exacta (años, meses, días) a partir de una fecha de nacimiento. Úsalo para preguntas de edad, cuántos años tiene alguien, cuándo cumple años.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fechaNacimiento: { type: 'string', description: 'Fecha de nacimiento en formato YYYY-MM-DD' },
        fechaReferencia: { type: 'string', description: 'Fecha en la que calcular la edad (YYYY-MM-DD o "hoy"). Por defecto hoy.' },
      },
      required: ['fechaNacimiento'],
    },
  },
  {
    name: 'calcular_imc',
    description: 'Calcula el Índice de Masa Corporal (IMC) a partir del peso y la altura, e indica la categoría (normopeso, sobrepeso, obesidad...) y el rango de peso saludable. Úsalo cuando el usuario pregunte por su IMC, peso ideal o clasificación de peso.',
    input_schema: {
      type: 'object' as const,
      properties: {
        pesoKg:   { type: 'number', description: 'Peso en kilogramos, ej: 75' },
        alturaCm: { type: 'number', description: 'Altura en centímetros, ej: 175' },
      },
      required: ['pesoKg', 'alturaCm'],
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

    if (nombre === 'calcular_diferencia_fechas') {
      const { fechaInicio, fechaFin } = params as { fechaInicio: string; fechaFin: string };
      const r = calcularDiferenciaFechas({ fechaInicio, fechaFin });
      return JSON.stringify({
        dias_totales: r.diasTotales,
        semanas: r.semanas,
        meses_aproximados: r.mesesAproximados,
        tiempo_exacto: r.descripcion,
      });
    }

    if (nombre === 'calcular_fecha_resultado') {
      const { fechaBase, operacion, cantidad, unidad } = params as {
        fechaBase: string; operacion: OperacionFecha; cantidad: number; unidad: UnidadTiempo;
      };
      const r = calcularOperacionFecha({ fechaBase, operacion, cantidad, unidad });
      return JSON.stringify({
        fecha_resultado: r.fechaFormateada,
        fecha_iso: r.fechaResultado,
        dia_semana: r.diaSemana,
      });
    }

    if (nombre === 'calcular_dia_semana') {
      const { fecha } = params as { fecha: string };
      const r = calcularDiaSemana({ fecha });
      return JSON.stringify({
        dia_semana: r.diaSemana,
        fecha_completa: r.fechaFormateada,
        referencia: r.referenciaHoy,
      });
    }

    if (nombre === 'calcular_edad') {
      const { fechaNacimiento, fechaReferencia } = params as {
        fechaNacimiento: string; fechaReferencia?: string;
      };
      const r = calcularEdad({ fechaNacimiento, fechaReferencia });
      return JSON.stringify({
        edad: r.descripcion,
        anios: r.anios,
        dias_vividos: r.totalDias,
        proximo_cumpleanos: r.proximoCumpleanos,
        dias_hasta_cumpleanos: r.diasHastaProximoCumpleanos,
      });
    }

    if (nombre === 'calcular_imc') {
      const { pesoKg, alturaCm } = params as { pesoKg: number; alturaCm: number };
      const r = calcularIMC({ pesoKg, alturaCm });
      return JSON.stringify({
        imc: r.imcFormateado,
        categoria: `${r.icono} ${r.categoria}`,
        descripcion: r.descripcion,
        peso_ideal_min_kg: r.pesoIdealMinKg,
        peso_ideal_max_kg: r.pesoIdealMaxKg,
        diferencia_kg: r.diferenciaKg,
        _disclaimer: { variant: 'medical', severity: 'high' },
      });
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
1. Tienes herramientas para calcular propinas, porcentajes, combustible y fechas — úsalas cuando el usuario lo necesite.
2. Para otros temas, recomienda apps del catálogo respondiendo SOLO con un array JSON de URLs.

COMPORTAMIENTO:
- Si el usuario pide un cálculo de propina, porcentaje, combustible o fechas → usa la herramienta correspondiente.
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

    // Acumulador de disclaimer (se rellena si alguna tool lo incluye)
    let disclaimerInfo: { variant: string; severity: string } | undefined;

    // Bucle de tool_use: Claude puede pedir ejecutar una herramienta
    while (respuesta.stop_reason === 'tool_use') {
      const bloquesTool = respuesta.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      // Construir resultados: extraer _disclaimer antes de enviar a Claude
      const resultadosTool: Anthropic.ToolResultBlockParam[] = bloquesTool.map((bloque) => {
        const resultado = ejecutarHerramienta(bloque.name, bloque.input as Record<string, unknown>);

        // Detectar y extraer _disclaimer del JSON resultado
        try {
          const parsed = JSON.parse(resultado) as Record<string, unknown>;
          if (parsed._disclaimer) {
            disclaimerInfo = parsed._disclaimer as { variant: string; severity: string };
            delete parsed._disclaimer;
            return { type: 'tool_result' as const, tool_use_id: bloque.id, content: JSON.stringify(parsed) };
          }
        } catch { /* resultado no es JSON, pasar tal cual */ }

        return { type: 'tool_result' as const, tool_use_id: bloque.id, content: resultado };
      });

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
      disclaimer: disclaimerInfo,
      historial: historialActualizado,
    });

  } catch (error) {
    console.error('[asistente] Error:', error);
    return Response.json({ error: 'Error interno del asistente' }, { status: 500 });
  }
}
