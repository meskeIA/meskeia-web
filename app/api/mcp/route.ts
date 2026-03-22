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
import { calcularIMC } from '@/lib/calculadoras/imc';
import { calcularInteresCompuesto, type FrecuenciaCapitalizacion } from '@/lib/calculadoras/interesCompuesto';
import {
  calcularDiferenciaFechas,
  calcularOperacionFecha,
  calcularDiaSemana,
  calcularEdad,
  type UnidadTiempo,
  type OperacionFecha,
} from '@/lib/calculadoras/fechas';
import {
  calcularDonacion,
  type GrupoParentesco,
  type NivelDiscapacidad,
  type IndicePatrimonio,
} from '@/lib/calculadoras/donaciones';

// ---------------------------------------------------------------------------
// Analytics: reutilizamos el mismo sistema que usan las apps web
// ---------------------------------------------------------------------------
async function registrarUsoMCP(tool: string, aiCaller: string): Promise<void> {
  try {
    // Usamos el dominio canónico — VERCEL_URL devuelve la URL del deployment, no el custom domain
    const baseUrl = 'https://meskeia.com';

    await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // User-agent neutro para no ser filtrado por el bloqueo de bots
        'User-Agent': 'meskeIA-MCP/1.0',
      },
      body: JSON.stringify({
        aplicacion: `mcp:${tool}`,   // campo correcto que espera el endpoint
        modo: 'mcp',
        datos_adicionales: { aiCaller },
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

  // ------------------------------------------------------------------
  // TOOL: calcular_imc
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_imc',
    'Calcula el Índice de Masa Corporal (IMC) a partir del peso y la altura. ' +
    'Devuelve la categoría (normopeso, sobrepeso, obesidad...), el rango de peso saludable ' +
    'y cuántos kg faltan o sobran para alcanzarlo. ' +
    '⚕️ Herramienta orientativa — no reemplaza valoración médica.',
    {
      pesoKg: z.number().positive().max(500)
        .describe('Peso en kilogramos (ej: 75)'),
      alturaCm: z.number().positive().max(300)
        .describe('Altura en centímetros (ej: 175)'),
    },
    async ({ pesoKg, alturaCm }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_imc', aiCaller);

      const r = calcularIMC({ pesoKg, alturaCm });

      const lineas = [
        `${r.icono} **IMC: ${r.imcFormateado}** — ${r.categoria}`,
        `📋 ${r.descripcion}`,
        `⚖️ Rango de peso saludable para tu altura: ${r.pesoIdealMinKg} – ${r.pesoIdealMaxKg} kg`,
      ];

      if (r.diferenciaKg > 0) {
        lineas.push(`📈 Necesitarías ganar ${r.diferenciaKg} kg para alcanzar el normopeso`);
      } else if (r.diferenciaKg < 0) {
        lineas.push(`📉 Necesitarías perder ${Math.abs(r.diferenciaKg)} kg para alcanzar el normopeso`);
      } else {
        lineas.push(`✅ Tu peso actual está dentro del rango saludable`);
      }

      lineas.push('', '⚕️ *Este resultado es orientativo. Consulta con un profesional sanitario para una valoración completa.*');

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_interes_compuesto
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_interes_compuesto',
    'Simula el crecimiento de una inversión o ahorro con interés compuesto. ' +
    'Calcula el capital final, los intereses generados y la rentabilidad total. ' +
    'Admite aportaciones periódicas mensuales y diferentes frecuencias de capitalización. ' +
    '💰 Herramienta orientativa — no constituye asesoramiento financiero.',
    {
      capitalInicial: z.number().nonnegative()
        .describe('Capital inicial invertido en euros (ej: 10000)'),
      tasaAnual: z.number().min(0).max(100)
        .describe('Rentabilidad anual en porcentaje (ej: 7 para 7%)'),
      anos: z.number().int().min(1).max(100)
        .describe('Número de años de la inversión'),
      aportacionPeriodica: z.number().nonnegative().optional()
        .describe('Aportación mensual adicional en euros (opcional, por defecto 0)'),
      frecuenciaCapitalizacion: z.enum(['anual', 'semestral', 'trimestral', 'mensual']).optional()
        .describe('Frecuencia de capitalización de intereses (por defecto anual)'),
    },
    async ({ capitalInicial, tasaAnual, anos, aportacionPeriodica, frecuenciaCapitalizacion }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_interes_compuesto', aiCaller);

      const r = calcularInteresCompuesto({
        capitalInicial,
        tasaAnual,
        anos,
        aportacionPeriodica,
        frecuenciaCapitalizacion: frecuenciaCapitalizacion as FrecuenciaCapitalizacion | undefined,
      });

      const lineas = [
        `💰 **Simulación de interés compuesto — ${anos} años al ${tasaAnual}%**`,
        '',
        `💵 Capital inicial: **${capitalInicial.toLocaleString('es-ES')} €**`,
        aportacionPeriodica ? `➕ Aportación mensual: **${aportacionPeriodica.toLocaleString('es-ES')} €**` : '',
        `📦 Total aportado: **${r.totalAportado.toLocaleString('es-ES')} €**`,
        `📈 Intereses generados: **${r.totalIntereses.toLocaleString('es-ES')} €**`,
        `🏆 Capital final: **${r.capitalFinal.toLocaleString('es-ES')} €**`,
        `📊 Rentabilidad total: **${r.rentabilidadPct}%**`,
        '',
        '💡 *Resultado orientativo. No constituye asesoramiento financiero. Consulta con un asesor antes de invertir.*',
      ].filter((l) => l !== undefined);

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_diferencia_fechas
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_diferencia_fechas',
    'Calcula cuánto tiempo hay entre dos fechas: días totales, semanas, meses y desglose exacto en años/meses/días. ' +
    'Útil para plazos, antigüedad, tiempo transcurrido o tiempo restante hasta un evento.',
    {
      fechaInicio: z.string()
        .describe('Fecha inicial en formato YYYY-MM-DD o "hoy"'),
      fechaFin: z.string()
        .describe('Fecha final en formato YYYY-MM-DD o "hoy"'),
    },
    async ({ fechaInicio, fechaFin }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_diferencia_fechas', aiCaller);

      const r = calcularDiferenciaFechas({ fechaInicio, fechaFin });

      const texto = [
        `📅 **Diferencia entre fechas**`,
        `⏱️ Tiempo exacto: **${r.descripcion}**`,
        `📆 Días totales: ${r.diasTotales}`,
        `📆 Semanas: ${r.semanas}`,
        `📆 Meses aproximados: ${r.mesesAproximados}`,
      ].join('\n');

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_fecha_resultado
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_fecha_resultado',
    'Suma o resta días, semanas, meses o años a una fecha para obtener otra fecha. ' +
    'Útil para calcular plazos, vencimientos, fechas futuras o pasadas.',
    {
      fechaBase: z.string()
        .describe('Fecha de partida en formato YYYY-MM-DD o "hoy"'),
      operacion: z.enum(['sumar', 'restar'])
        .describe('"sumar" para obtener una fecha futura, "restar" para una fecha pasada'),
      cantidad: z.number().int().positive()
        .describe('Número de unidades a sumar o restar'),
      unidad: z.enum(['dias', 'semanas', 'meses', 'anios'])
        .describe('Unidad de tiempo: dias, semanas, meses o anios'),
    },
    async ({ fechaBase, operacion, cantidad, unidad }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_fecha_resultado', aiCaller);

      const r = calcularOperacionFecha({
        fechaBase,
        operacion: operacion as OperacionFecha,
        cantidad,
        unidad: unidad as UnidadTiempo,
      });

      const texto = [
        `📅 **Fecha resultado**`,
        `📆 ${r.fechaFormateada}`,
        `🗓️ Día de la semana: **${r.diaSemana}**`,
        `🔢 Fecha ISO: ${r.fechaResultado}`,
      ].join('\n');

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_dia_semana
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_dia_semana',
    'Dice qué día de la semana (lunes, martes...) cae una fecha concreta. ' +
    'Indica también si es hoy, ayer, mañana o cuántos días faltan/han pasado.',
    {
      fecha: z.string()
        .describe('Fecha a consultar en formato YYYY-MM-DD o "hoy"'),
    },
    async ({ fecha }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_dia_semana', aiCaller);

      const r = calcularDiaSemana({ fecha });

      const texto = [
        `📅 **${r.fechaFormateada}**`,
        `📆 Día: **${r.diaSemana}** (${r.referenciaHoy})`,
      ].join('\n');

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_edad
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_edad',
    'Calcula la edad exacta en años, meses y días a partir de una fecha de nacimiento. ' +
    'Indica también el total de días vividos y cuándo es el próximo cumpleaños.',
    {
      fechaNacimiento: z.string()
        .describe('Fecha de nacimiento en formato YYYY-MM-DD (ej: 1990-05-15)'),
      fechaReferencia: z.string().optional()
        .describe('Fecha en la que calcular la edad en formato YYYY-MM-DD o "hoy". Por defecto hoy.'),
    },
    async ({ fechaNacimiento, fechaReferencia }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_edad', aiCaller);

      const r = calcularEdad({ fechaNacimiento, fechaReferencia });

      const texto = [
        `🎂 **Edad: ${r.descripcion}**`,
        `📆 Días vividos: ${r.totalDias.toLocaleString('es-ES')}`,
        `🎉 Próximo cumpleaños: ${r.proximoCumpleanos} (en ${r.diasHastaProximoCumpleanos} días)`,
      ].join('\n');

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_donaciones
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_donaciones',
    'Calcula el Impuesto de Donaciones (ISD) en España con precisión normativa 2025. ' +
    'Más exacto que el conocimiento general: aplica la tarifa estatal (16 tramos), ' +
    'la tarifa propia de Cataluña, los coeficientes multiplicadores por patrimonio ' +
    'preexistente y las bonificaciones autonómicas de las 17 CCAA. ' +
    'Devuelve la cuota a pagar, el tipo efectivo y el desglose completo del cálculo. ' +
    '⚠️ Estimación orientativa — no reemplaza asesoramiento fiscal profesional.',
    {
      valorDonacion: z.number().positive()
        .describe('Valor de la donación en euros (ej: 50000 para 50.000 €)'),
      ccaa: z.enum([
        'madrid', 'andalucia', 'galicia', 'murcia', 'valencia', 'extremadura',
        'canarias', 'castilla-leon', 'rioja', 'castilla-mancha', 'cantabria',
        'aragon', 'baleares', 'asturias', 'cataluna', 'pais-vasco', 'navarra',
      ]).describe(
        'Comunidad autónoma del donatario (quien recibe la donación). ' +
        'Valores: madrid, andalucia, galicia, murcia, valencia, extremadura, ' +
        'canarias, castilla-leon, rioja, castilla-mancha, cantabria, aragon, ' +
        'baleares, asturias, cataluna, pais-vasco, navarra'
      ),
      grupo: z.enum(['I-conyuge', 'I-descendiente', 'II', 'II-ascendiente', 'III', 'IV'])
        .describe(
          'Grupo de parentesco del donatario: ' +
          'I-conyuge = cónyuge o pareja de hecho, ' +
          'I-descendiente = hijo/nieto menor de 21 años, ' +
          'II = hijo/nieto mayor de 21 años u otro descendiente/ascendiente, ' +
          'II-ascendiente = padre, madre, abuelo, ' +
          'III = colateral 2º y 3er grado (hermano, tío, sobrino), cónyuge de descendiente, ' +
          'IV = colateral 4º grado, extraños'
        ),
      cargas: z.number().nonnegative().optional()
        .describe('Cargas deducibles en euros (hipotecas u otras cargas reales sobre el bien donado). Por defecto 0.'),
      escrituraPublica: z.boolean().optional()
        .describe('Si la donación se formaliza en escritura pública notarial. Afecta a Cataluña (tarifa reducida) y Castilla-La Mancha (bonificación). Por defecto true.'),
      discapacidad: z.enum(['0', '33', '65']).optional()
        .describe('Grado de discapacidad del donatario: "0" = sin discapacidad, "33" = grado 33%–64%, "65" = grado ≥65%. Por defecto "0".'),
      patrimonioIdx: z.number().int().min(1).max(4).optional()
        .describe(
          'Índice del patrimonio preexistente del donatario (afecta al coeficiente multiplicador): ' +
          '1 = hasta 402.678 €, 2 = de 402.678 a 2.007.380 €, ' +
          '3 = de 2.007.380 a 4.020.770 €, 4 = más de 4.020.770 €. Por defecto 1.'
        ),
    },
    async ({ valorDonacion, ccaa, grupo, cargas, escrituraPublica, discapacidad, patrimonioIdx }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_donaciones', aiCaller);

      let r;
      try {
        r = calcularDonacion({
          valorDonacion,
          ccaa,
          grupo: grupo as GrupoParentesco,
          cargas,
          escrituraPublica,
          discapacidad: discapacidad as NivelDiscapacidad | undefined,
          patrimonioIdx: patrimonioIdx as IndicePatrimonio | undefined,
        });
      } catch (err) {
        return {
          content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }],
        };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const lineas: string[] = [
        `🏛️ **Impuesto de Donaciones — ${r.ccaaNombre}**`,
        `📋 Tarifa: ${r.tarifaAplicada}`,
        '',
        `💶 Valor donación: **${fmt(r.baseImponible)} €**`,
      ];

      if (r.cargas > 0) lineas.push(`➖ Cargas deducibles: ${fmt(r.cargas)} €`);
      lineas.push(`📦 Base liquidable: ${fmt(r.baseLiquidable)} €`);

      if (r.reduccionParentesco > 0) lineas.push(`➖ Reducción parentesco: ${fmt(r.reduccionParentesco)} €`);
      if (r.reduccionDiscapacidad > 0) lineas.push(`➖ Reducción discapacidad: ${fmt(r.reduccionDiscapacidad)} €`);
      if (r.reduccionParentesco > 0 || r.reduccionDiscapacidad > 0) {
        lineas.push(`📊 Base neta reducida: ${fmt(r.baseNetaReducida)} €`);
      }

      lineas.push(
        '',
        `🔢 Cuota íntegra: ${fmt(r.cuotaIntegra)} €`,
      );

      if (r.coeficienteMultiplicador !== 1) {
        lineas.push(`✖️ Coeficiente multiplicador: ×${r.coeficienteMultiplicador}`);
        lineas.push(`🔢 Cuota tributaria: ${fmt(r.cuotaTributaria)} €`);
      }

      if (r.bonificacionCcaa > 0) {
        lineas.push(`➖ ${r.detalleBonificacion}: −${fmt(r.bonificacionCcaa)} €`);
      } else if (r.porcentajeBonificacion === 0) {
        lineas.push(`ℹ️ Bonificación: ${r.detalleBonificacion}`);
      }

      lineas.push(
        '',
        `💰 **Cuota a pagar: ${fmt(r.cuotaFinal)} €**`,
        `📈 Tipo efectivo: **${r.tipoEfectivo.toFixed(2).replace('.', ',')}%**`,
      );

      if (r.esForal) {
        lineas.push('', `⚠️ **Régimen foral**: ${r.notasCcaa}`);
      } else if (r.notasCcaa) {
        lineas.push('', `ℹ️ ${r.notasCcaa}`);
      }

      lineas.push(
        '',
        '⚖️ *Estimación orientativa basada en normativa 2025 (Ley 29/1987 ISD). No constituye asesoramiento fiscal. Plazo de autoliquidación: 1 mes desde la donación (Modelo 651). Consulta con un asesor fiscal.*',
      );

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
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
