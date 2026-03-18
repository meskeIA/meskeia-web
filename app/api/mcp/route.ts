/**
 * Servidor MCP (Model Context Protocol) de meskeIA
 *
 * Expone las herramientas de meskeIA como tools MCP consumibles por
 * Claude, Perplexity, ChatGPT y otros agentes compatibles.
 *
 * Endpoint: /api/mcp
 * Modo: stateless (una instancia por petición, apto para Vercel serverless)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { calcularPropina, obtenerPorcentajePais, PROPINAS_POR_PAIS } from '@/lib/calculadoras/propinas';
import { calcularPorcentaje, type ModoPorcentaje } from '@/lib/calculadoras/porcentajes';
import { calcularConsumo, calcularViaje } from '@/lib/calculadoras/combustible';

// ---------------------------------------------------------------------------
// Analytics: reutilizamos el mismo sistema que usan las apps web
// ---------------------------------------------------------------------------
async function registrarUsoMCP(tool: string, aiCaller: string): Promise<void> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3050';

    await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationName: `mcp:${tool}`,
        source: 'mcp',
        aiCaller,
      }),
    });
  } catch {
    // Los errores de analytics no deben interrumpir el cálculo
  }
}

// ---------------------------------------------------------------------------
// Función para crear el servidor MCP con todas sus herramientas
// ---------------------------------------------------------------------------
function crearServidorMCP(): McpServer {
  const servidor = new McpServer({
    name: 'meskeIA',
    version: '1.0.0',
  });

  // ------------------------------------------------------------------
  // TOOL: calcular_propina
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_propina',
    'Calcula la propina de una cuenta de restaurante y la divide entre varias personas. ' +
    'Conoce los porcentajes habituales de propina por país (España, EE. UU., Japón, etc.).',
    {
      monto: z.number().positive()
        .describe('Importe total de la cuenta en euros (número positivo)'),
      porcentaje: z.number().min(0).max(100).optional()
        .describe('Porcentaje de propina a aplicar, por ejemplo 15 para 15%. ' +
                  'Si no se indica, se usa el porcentaje habitual del país.'),
      pais: z.string().optional()
        .describe('País para aplicar el porcentaje habitual. ' +
                  'Valores válidos: espana, usa, reino_unido, alemania, francia, italia, japon'),
      personas: z.number().int().positive().optional()
        .describe('Número de personas entre las que dividir la cuenta. Por defecto 1.'),
    },
    async ({ monto, porcentaje, pais, personas }, extra) => {
      // Detectar qué IA llama (para analytics)
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_propina', aiCaller);

      // Determinar el porcentaje a usar
      let pct = porcentaje;
      if (pct === undefined) {
        if (pais) {
          const pctPais = obtenerPorcentajePais(pais);
          pct = pctPais ?? 10; // fallback a 10% si el país no existe
        } else {
          pct = 10; // fallback general
        }
      }

      const resultado = calcularPropina({ monto, porcentaje: pct, personas });

      const paisInfo = pais ? PROPINAS_POR_PAIS[pais.toLowerCase()] : null;
      const notaPais = paisInfo ? `\n📍 ${paisInfo.descripcion}` : '';

      const texto = [
        `💶 **Cuenta:** ${monto.toFixed(2)} €`,
        `💰 **Propina (${pct}%):** ${resultado.propina.toFixed(2)} €`,
        `🧾 **Total con propina:** ${resultado.totalConPropina.toFixed(2)} €`,
        resultado.personas > 1
          ? `👥 **Por persona (${resultado.personas}):** ${resultado.totalPorPersona.toFixed(2)} € ` +
            `(cuenta: ${resultado.montoPorPersonaSinPropina.toFixed(2)} € + propina: ${resultado.propinaPorPersona.toFixed(2)} €)`
          : '',
        notaPais,
      ].filter(Boolean).join('\n');

      return {
        content: [{ type: 'text', text: texto }],
      };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_porcentaje
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_porcentaje',
    'Realiza cálculos con porcentajes. Cinco modos disponibles: ' +
    '(1) percentOf: ¿cuánto es el X% de Y?, ' +
    '(2) whatPercent: ¿qué % es X de Y?, ' +
    '(3) increase: aumentar X en Y%, ' +
    '(4) decrease: disminuir X en Y%, ' +
    '(5) variation: variación porcentual de X a Y.',
    {
      modo: z.enum(['percentOf', 'whatPercent', 'increase', 'decrease', 'variation'])
        .describe(
          'Tipo de cálculo: ' +
          'percentOf = ¿cuánto es el X% de Y?, ' +
          'whatPercent = ¿qué % es X de Y?, ' +
          'increase = aumentar X en Y%, ' +
          'decrease = disminuir X en Y%, ' +
          'variation = variación porcentual de X a Y'
        ),
      valor1: z.number().describe(
        'Primer valor. Según el modo: ' +
        'percentOf → porcentaje (ej: 15 para 15%), ' +
        'whatPercent → cantidad parcial, ' +
        'increase/decrease → valor inicial, ' +
        'variation → valor inicial'
      ),
      valor2: z.number().describe(
        'Segundo valor. Según el modo: ' +
        'percentOf → cantidad base, ' +
        'whatPercent → cantidad total, ' +
        'increase/decrease → porcentaje a aplicar, ' +
        'variation → valor final'
      ),
    },
    async ({ modo, valor1, valor2 }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_porcentaje', aiCaller);

      const resultado = calcularPorcentaje({ modo: modo as ModoPorcentaje, valor1, valor2 });

      const iconos: Record<string, string> = {
        percentOf: '🔢', whatPercent: '❓', increase: '📈', decrease: '📉', variation: '🔄',
      };

      const texto = [
        `${iconos[modo]} **${resultado.detalle}**`,
        resultado.esProcentaje
          ? `📊 **Resultado:** ${resultado.resultado}%`
          : `📊 **Resultado:** ${resultado.resultado}`,
      ].join('\n');

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_combustible
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_combustible',
    'Calculadora de combustible con dos modos: ' +
    '(1) consumo: dado un trayecto real (km recorridos + litros gastados), calcula el consumo en L/100km, el coste por km y la autonomía con 50€. ' +
    '(2) viaje: dada la distancia de un trayecto y el consumo medio del vehículo, calcula los litros necesarios y el coste total del viaje.',
    {
      modo: z.enum(['consumo', 'viaje'])
        .describe('consumo = calcular consumo real de un trayecto ya hecho | viaje = estimar coste de un trayecto futuro'),
      kilometros: z.number().positive().optional()
        .describe('(Modo consumo) Kilómetros recorridos en el trayecto de referencia'),
      litros: z.number().positive().optional()
        .describe('(Modo consumo) Litros gastados en ese trayecto'),
      distanciaKm: z.number().positive().optional()
        .describe('(Modo viaje) Distancia del trayecto en kilómetros'),
      consumoL100km: z.number().positive().optional()
        .describe('(Modo viaje) Consumo medio del vehículo en litros cada 100 km'),
      precioCombustible: z.number().positive()
        .describe('Precio del combustible en €/litro (ej: 1.65 para 1,65 €/L)'),
    },
    async ({ modo, kilometros, litros, distanciaKm, consumoL100km, precioCombustible }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_combustible', aiCaller);

      if (modo === 'consumo') {
        if (!kilometros || !litros) {
          return { content: [{ type: 'text', text: 'Para el modo consumo necesito: kilómetros recorridos y litros gastados.' }] };
        }
        const r = calcularConsumo({ kilometros, litros, precioCombustible });
        const texto = [
          `⛽ **Consumo real del vehículo**`,
          `📊 Consumo: **${r.consumoL100km} L/100km** — ${r.eficiencia}`,
          `💶 Coste por km: **${r.costePorKm} €/km**`,
          `🛣️ Con 50 €: puedes recorrer **${r.autonomiaCon50Euros} km**`,
        ].join('\n');
        return { content: [{ type: 'text', text: texto }] };
      }

      // modo viaje
      if (!distanciaKm || !consumoL100km) {
        return { content: [{ type: 'text', text: 'Para el modo viaje necesito: distancia en km y consumo medio del vehículo en L/100km.' }] };
      }
      const r = calcularViaje({ distanciaKm, consumoL100km, precioCombustible });
      const texto = [
        `🗺️ **Coste del viaje (${distanciaKm} km)**`,
        `⛽ Litros necesarios: **${r.litrosNecesarios} L**`,
        `💶 Coste total: **${r.costeTotal} €**`,
        `📍 Coste por km: **${r.costePorKm} €/km**`,
      ].join('\n');
      return { content: [{ type: 'text', text: texto }] };
    }
  );

  return servidor;
}

// ---------------------------------------------------------------------------
// Handler Next.js App Router — stateless (una instancia por petición)
// ---------------------------------------------------------------------------
async function handler(req: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless: sin gestión de sesión
    enableJsonResponse: true,      // respuesta JSON simple (sin SSE)
  });

  const servidor = crearServidorMCP();
  await servidor.connect(transport);

  return transport.handleRequest(req);
}

export const GET  = handler;
export const POST = handler;
export const DELETE = handler;
