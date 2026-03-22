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
import { calcularIVA, type TipoIVA, type ModoIVA } from '@/lib/calculadoras/iva';
import { calcularInteresDemora, type TipoInteres } from '@/lib/calculadoras/interesDemora';
import { calcularPensionPublica } from '@/lib/calculadoras/pensionPublica';
import {
  calcularSucesion,
  type GrupoParentescoIS,
  type NivelDiscapacidadIS,
  type IndicePatrimonioIS,
} from '@/lib/calculadoras/sucesiones';
import { calcularHipoteca, type TipoHipoteca } from '@/lib/calculadoras/hipoteca';
import { calcularPrestamo, type SistemaAmortizacion } from '@/lib/calculadoras/prestamo';
import {
  calcularCompraventa,
  type TipoTransmision as TipoTransmisionCompraventa,
  type TipoInmuebleMCP,
  type PerfilCompradorMCP,
} from '@/lib/calculadoras/compraventa';
import { calcularAmortizacionAnticipada } from '@/lib/calculadoras/amortizacionAnticipada';
import { calcularBrechaJubilacion } from '@/lib/calculadoras/brechaJubilacion';
import { calcularTIRVAN } from '@/lib/calculadoras/tirVan';
import { calcularFIRE } from '@/lib/calculadoras/fire';
import { calcularPensionViudedad, type SituacionCausante } from '@/lib/calculadoras/pensionViudedad';
import { calcularLegitimas, type RegimenId } from '@/lib/calculadoras/legitimas';
import { calcularTarifaFreelance } from '@/lib/calculadoras/tarifaFreelance';
import { calcularBreakEven } from '@/lib/calculadoras/breakEven';

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

  // ------------------------------------------------------------------
  // TOOL: calcular_iva
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_iva',
    'Calcula el IVA español (21%, 10%, 4% o 0%). ' +
    'Puede añadir IVA a una base imponible o extraer la base de un precio con IVA incluido. ' +
    'Devuelve base imponible, cuota de IVA y total con IVA.',
    {
      importe: z.number().positive()
        .describe('Importe en euros sobre el que operar'),
      tipoIVA: z.union([z.literal(21), z.literal(10), z.literal(4), z.literal(0)])
        .describe('Tipo de IVA: 21 (general), 10 (reducido), 4 (superreducido) o 0 (exento)'),
      modo: z.enum(['anadir', 'quitar'])
        .describe(
          '"anadir" = el importe es la base sin IVA y quieres saber el total con IVA. ' +
          '"quitar" = el importe ya incluye IVA y quieres extraer la base y la cuota.'
        ),
    },
    async ({ importe, tipoIVA, modo }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_iva', aiCaller);

      let r;
      try {
        r = calcularIVA({ importe, tipoIVA: tipoIVA as TipoIVA, modo: modo as ModoIVA });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const texto = [
        `🧾 **Calculadora de IVA (${r.tipoIVA}%)**`,
        `ℹ️ ${r.descripcionTipo}`,
        '',
        `📦 Base imponible: **${fmt(r.baseImponible)} €**`,
        `➕ Cuota IVA (${r.tipoIVA}%): **${fmt(r.cuotaIVA)} €**`,
        `💶 Total con IVA: **${fmt(r.totalConIVA)} €**`,
      ].join('\n');

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_interes_demora
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_interes_demora',
    'Calcula intereses de demora en España con normativa actualizada 2026. ' +
    'Tres modalidades: comercial (Ley 3/2004, facturas entre empresas), ' +
    'legal (art. 1108 CC, deudas civiles) y tributario (LGT art. 26, liquidaciones AEAT). ' +
    'El tipo comercial se desglose por semestres si abarca varios períodos BCE. ' +
    '⚠️ Estimación orientativa — consultar con abogado o asesor para reclamaciones reales.',
    {
      importeDeuda: z.number().positive()
        .describe('Importe de la deuda en euros'),
      fechaInicio: z.string()
        .describe('Fecha de inicio del devengo en formato YYYY-MM-DD (normalmente el día siguiente al vencimiento de la factura)'),
      fechaFin: z.string()
        .describe('Fecha de fin del cálculo en formato YYYY-MM-DD (normalmente hoy o la fecha de pago)'),
      tipoInteres: z.enum(['comercial', 'legal', 'tributario'])
        .describe(
          '"comercial" = Ley 3/2004, facturas entre empresas o con Administración (BCE + 8 pp). ' +
          '"legal" = art. 1108 CC, deudas civiles sin pacto de interés (3,25% en 2026). ' +
          '"tributario" = LGT art. 26, liquidaciones con la AEAT (4,0625% en 2026).'
        ),
    },
    async ({ importeDeuda, fechaInicio, fechaFin, tipoInteres }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_interes_demora', aiCaller);

      let r;
      try {
        r = calcularInteresDemora({
          importeDeuda,
          fechaInicio,
          fechaFin,
          tipoInteres: tipoInteres as TipoInteres,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const lineas = [
        `⏱️ **Intereses de Demora — ${tipoInteres === 'comercial' ? 'Comercial (Ley 3/2004)' : tipoInteres === 'legal' ? 'Legal (art. 1108 CC)' : 'Tributario (LGT art. 26)'}**`,
        '',
        `💶 Importe deuda: ${fmt(r.importeDeuda)} €`,
        `📅 Período: ${fechaInicio} → ${fechaFin} (${r.diasTotales} días)`,
        `📊 Tipo anual: ${r.tipoAnual.toFixed(4).replace('.', ',')}%`,
        '',
      ];

      if (r.desglose.length > 1) {
        lineas.push('📋 **Desglose por períodos:**');
        for (const d of r.desglose) {
          lineas.push(`  • ${d.periodo}: ${d.tipoAnual.toFixed(2).replace('.', ',')}% × ${d.dias} días = ${fmt(d.intereses)} €`);
        }
        lineas.push('');
      }

      lineas.push(
        `➕ Total intereses: **${fmt(r.totalIntereses)} €**`,
        `💰 Importe total (deuda + intereses): **${fmt(r.importeTotal)} €**`,
        '',
        `⚖️ *${r.nota}*`,
        `📚 Fuente: ${r.fuenteDatos}`,
      );

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_pension_publica
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_pension_publica',
    'Estima la pensión pública de jubilación en España (Seguridad Social 2026). ' +
    'Más exacto que el conocimiento general: aplica la fórmula oficial SS con tramos ' +
    'de porcentaje (Ley 21/2021), base reguladora real (300 bases / 350) y límites ' +
    'vigentes (mínima 888,70 €/mes, máxima 3.359,60 €/mes en 2026). ' +
    'Resultado ORIENTATIVO — la SS calcula sobre el historial completo de cotización. ' +
    '⚠️ No reemplaza consulta al simulador oficial de la Seguridad Social.',
    {
      baseCotizacionMensual: z.number().positive()
        .describe(
          'Base de cotización media mensual estimada de los últimos 25 años en euros. ' +
          'Si no se conoce, usar el salario bruto mensual actual como aproximación.'
        ),
      anosCotizados: z.number().min(0).max(50)
        .describe('Años totales cotizados a la Seguridad Social (puede ser decimal, ej: 35.5 para 35 años y 6 meses)'),
      edadActual: z.number().int().min(16).max(80).optional()
        .describe('Edad actual del trabajador en años (opcional, solo informativo para calcular años hasta jubilación)'),
    },
    async ({ baseCotizacionMensual, anosCotizados, edadActual }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_pension_publica', aiCaller);

      let r;
      try {
        r = calcularPensionPublica({ baseCotizacionMensual, anosCotizados, edadActual });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const lineas = [
        `🌅 **Estimación Pensión Pública de Jubilación (SS 2026)**`,
        '',
        `📊 Años cotizados: **${anosCotizados}**`,
        `💶 Base cotización media mensual: ${fmt(baseCotizacionMensual)} €`,
        `📦 Base reguladora estimada: ${fmt(r.baseReguladora)} € (= base × 300/350)`,
        `📈 Porcentaje de pensión: **${r.porcentajePension.toFixed(2).replace('.', ',')}%**`,
        '',
      ];

      if (r.aplicaMinimo) {
        lineas.push(`⬆️ Se aplica **pensión mínima** (${fmt(r.pensionMinimaRef)} €/mes)`);
      } else if (r.aplicaMaximo) {
        lineas.push(`⬇️ Se aplica **pensión máxima** SS (${fmt(r.pensionMaxima)} €/mes)`);
      }

      lineas.push(
        `💰 **Pensión mensual bruta estimada: ${fmt(r.pensionBrutaMensual)} €**`,
        `📅 Pensión anual bruta (× 14 pagas): **${fmt(r.pensionBrutaAnual)} €**`,
        '',
        `🗓️ Edad ordinaria de jubilación: ${r.edadJubilacionOrdinaria}`,
      );

      if (r.mesesParaCien > 0) {
        const anosParaCien = Math.floor(r.mesesParaCien / 12);
        const mesesRestantes = r.mesesParaCien % 12;
        lineas.push(`⏳ Para alcanzar el 100%: faltan ${anosParaCien > 0 ? `${anosParaCien} años y ` : ''}${mesesRestantes} meses más de cotización`);
      }

      lineas.push(
        '',
        `⚠️ *${r.nota}*`,
        `📚 Fuente: ${r.fuenteDatos}`,
      );

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_sucesiones
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_sucesiones',
    'Calcula el Impuesto de Sucesiones (ISD) en España con precisión normativa 2025. ' +
    'Aplica la tarifa estatal (7 tramos), la tarifa propia de Cataluña, reducciones ' +
    'por parentesco, edad (menores de 21), discapacidad, vivienda habitual y seguro de vida, ' +
    'coeficientes multiplicadores por patrimonio preexistente, y bonificaciones autonómicas ' +
    'de las 17 CCAA incluyendo escalados y límites por cuantía. ' +
    '⚠️ Estimación orientativa del impuesto del heredero individual — no incluye reparto de la masa hereditaria.',
    {
      baseImponible: z.number().positive()
        .describe('Valor neto de la herencia recibida por este heredero en euros (parte alícuota del activo neto)'),
      ccaa: z.enum([
        'madrid', 'andalucia', 'galicia', 'murcia', 'valencia', 'extremadura',
        'canarias', 'castilla-leon', 'rioja', 'castilla-mancha', 'cantabria',
        'aragon', 'baleares', 'asturias', 'cataluna', 'pais-vasco', 'navarra',
      ]).describe('Comunidad autónoma del causante (el fallecido). Mismas claves que en donaciones.'),
      grupo: z.enum(['I-conyuge', 'I-descendiente', 'II', 'II-ascendiente', 'III', 'IV'])
        .describe(
          'Grupo de parentesco del heredero respecto al causante: ' +
          'I-conyuge = cónyuge o pareja de hecho, ' +
          'I-descendiente = hijo/nieto menor de 21 años, ' +
          'II = hijo/nieto mayor de 21 años u otro descendiente, ' +
          'II-ascendiente = padre, madre, abuelo, ' +
          'III = colateral 2º y 3er grado (hermano, tío, sobrino), ' +
          'IV = colateral 4º grado o extraños'
        ),
      edadHeredero: z.number().int().min(0).max(120).optional()
        .describe('Edad del heredero en años. Si es menor de 21 y Grupo I/II, se aplica reducción adicional por edad.'),
      discapacidad: z.enum(['0', '33', '65']).optional()
        .describe('Grado de discapacidad del heredero: "0" = sin discapacidad, "33" = grado 33%–64%, "65" = grado ≥65%. Por defecto "0".'),
      patrimonioIdx: z.number().int().min(1).max(4).optional()
        .describe('Índice patrimonio preexistente: 1 (hasta 402.678 €), 2 (hasta 2.007.380 €), 3 (hasta 4.020.770 €), 4 (más de 4.020.770 €). Por defecto 1.'),
      viviendaHabitual: z.number().nonnegative().optional()
        .describe('Valor de la vivienda habitual del causante incluida en la herencia. Se aplica reducción del 95% con tope de 122.606,47 €.'),
      seguroVida: z.number().nonnegative().optional()
        .describe('Importe del seguro de vida recibido. Para cónyuge/ascendientes/descendientes: reducción del 100% con tope de 9.195,49 €.'),
      incluyeAjuar: z.boolean().optional()
        .describe('Si la base imponible incluye ya el ajuar doméstico o si hay que sumarlo (3% de la masa hereditaria). Por defecto false.'),
    },
    async ({ baseImponible, ccaa, grupo, edadHeredero, discapacidad, patrimonioIdx, viviendaHabitual, seguroVida, incluyeAjuar }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_sucesiones', aiCaller);

      let r;
      try {
        r = calcularSucesion({
          baseImponible,
          ccaa,
          grupo: grupo as GrupoParentescoIS,
          edadHeredero,
          discapacidad: discapacidad as NivelDiscapacidadIS | undefined,
          patrimonioIdx: patrimonioIdx as IndicePatrimonioIS | undefined,
          viviendaHabitual,
          seguroVida,
          incluyeAjuar,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const lineas: string[] = [
        `⚖️ **Impuesto de Sucesiones — ${r.ccaaNombre}**`,
        `📋 Tarifa: ${r.tarifaAplicada}`,
        '',
        `💶 Base imponible (herencia recibida): **${fmt(r.baseImponible)} €**`,
      ];

      if (r.ajuarDomestico > 0) lineas.push(`➕ Ajuar doméstico (3%): ${fmt(r.ajuarDomestico)} €`);

      if (r.totalReducciones > 0) {
        lineas.push('', '➖ **Reducciones aplicadas:**');
        if (r.reduccionParentesco > 0) lineas.push(`  • Por parentesco: ${fmt(r.reduccionParentesco)} €`);
        if (r.reduccionEdadMenor21 > 0) lineas.push(`  • Por edad (menor 21): ${fmt(r.reduccionEdadMenor21)} €`);
        if (r.reduccionDiscapacidad > 0) lineas.push(`  • Por discapacidad: ${fmt(r.reduccionDiscapacidad)} €`);
        if (r.reduccionVivienda > 0) lineas.push(`  • Vivienda habitual (95%): ${fmt(r.reduccionVivienda)} €`);
        if (r.reduccionSeguroVida > 0) lineas.push(`  • Seguro de vida: ${fmt(r.reduccionSeguroVida)} €`);
        lineas.push(`  **Total reducciones: ${fmt(r.totalReducciones)} €**`);
      }

      lineas.push(
        '',
        `📦 Base liquidable: **${fmt(r.baseLiquidable)} €**`,
        `🔢 Cuota íntegra: ${fmt(r.cuotaIntegra)} €`,
      );

      if (r.coeficienteMultiplicador !== 1) {
        lineas.push(`✖️ Coeficiente multiplicador: ×${r.coeficienteMultiplicador}`);
        lineas.push(`🔢 Cuota tributaria: ${fmt(r.cuotaTributaria)} €`);
      }

      if (r.bonificacionCcaa > 0) {
        lineas.push(`➖ ${r.detalleBonificacion}: −${fmt(r.bonificacionCcaa)} €`);
      } else {
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
        '⚖️ *Estimación orientativa basada en normativa 2025 (Ley 29/1987 ISD). No constituye asesoramiento fiscal ni jurídico. Plazo de autoliquidación: 6 meses desde el fallecimiento (prorrogable). Consulta con un asesor fiscal.*',
        `📚 ${r.fuenteDatos}`,
      );

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_hipoteca
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_hipoteca',
    'Calcula una hipoteca española con sistema francés (cuota constante). ' +
    'Soporta tipo fijo, variable (Euríbor + diferencial) e hipoteca mixta. ' +
    'Devuelve cuota mensual, total de intereses, total pagado, ratio cuota/ingresos ' +
    'y resumen anual de amortización. ' +
    '⚠️ Estimación orientativa — no incluye TAE, seguros ni comisiones bancarias.',
    {
      precioVivienda: z.number().positive()
        .describe('Precio de la vivienda en euros'),
      entrada: z.number().nonnegative()
        .describe('Importe de la entrada en euros (lo que aportas de tu bolsillo). Mínimo recomendado: 20% del precio.'),
      plazoAnios: z.number().int().min(1).max(40)
        .describe('Plazo de la hipoteca en años (habitualmente entre 15 y 30 años)'),
      tipoHipoteca: z.enum(['fijo', 'variable', 'mixta'])
        .describe('"fijo" = tipo constante todo el plazo. "variable" = Euríbor + diferencial. "mixta" = fase fija inicial + fase variable.'),
      interesAnual: z.number().min(0).max(15).optional()
        .describe('Tipo de interés fijo anual en % (para tipo "fijo" o fase fija de "mixta"). Ej: 3.5 para 3,5%.'),
      euribor: z.number().min(-2).max(10).optional()
        .describe('Euríbor actual anual en % (para tipo "variable" y fase variable de "mixta"). Ej: 2.5 para 2,5%.'),
      diferencial: z.number().min(0).max(5).optional()
        .describe('Diferencial del banco sobre Euríbor en % (para "variable" y "mixta"). Ej: 0.8 para 0,8%.'),
      plazoFijoMixta: z.number().int().min(1).max(20).optional()
        .describe('Años de fase fija en hipoteca mixta. Ej: 5 para los primeros 5 años a tipo fijo.'),
      ingresosMensuales: z.number().positive().optional()
        .describe('Ingresos netos mensuales del solicitante en euros. Permite calcular el ratio de endeudamiento (recomendable ≤30%).'),
    },
    async ({ precioVivienda, entrada, plazoAnios, tipoHipoteca, interesAnual, euribor, diferencial, plazoFijoMixta, ingresosMensuales }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_hipoteca', aiCaller);

      let r;
      try {
        r = calcularHipoteca({
          precioVivienda, entrada, plazoAnios,
          tipoHipoteca: tipoHipoteca as TipoHipoteca,
          interesAnual, euribor, diferencial, plazoFijoMixta, ingresosMensuales,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const lineas = [
        `🏠 **Simulador de Hipoteca (Sistema Francés)**`,
        '',
        `💶 Precio vivienda: ${fmt(precioVivienda)} €`,
        `💰 Entrada: ${fmt(entrada)} € (${r.porcentajeFinanciacion}% financiado)`,
        `📦 Capital financiado: **${fmt(r.capital)} €**`,
        `⏳ Plazo: ${plazoAnios} años`,
        `📊 Tipo efectivo: ${r.tipoEfectivo.toFixed(2).replace('.', ',')}%${r.tipoEfectivFase2 ? ` → ${r.tipoEfectivFase2.toFixed(2).replace('.', ',')}% (fase variable)` : ''}`,
        '',
        `💳 **Cuota mensual: ${fmt(r.cuotaMensual)} €**`,
      ];

      if (r.cuotaMensualFase2) {
        lineas.push(`💳 Cuota fase variable estimada: ${fmt(r.cuotaMensualFase2)} €`);
      }

      if (r.ratioCuotaIngresos !== null) {
        const emoji = r.alertaRatio ? '⚠️' : '✅';
        lineas.push(`${emoji} Ratio cuota/ingresos: **${r.ratioCuotaIngresos.toFixed(1).replace('.', ',')}%** (recomendable ≤30%)`);
      }

      lineas.push(
        '',
        `➕ Total intereses: ${fmt(r.totalIntereses)} € (${r.porcentajeInteresesSobreCapital.toFixed(1).replace('.', ',')}% sobre el capital)`,
        `💰 **Total pagado: ${fmt(r.totalPagado)} €**`,
        '',
        '📋 **Resumen primeros 5 años:**',
      );

      for (const a of r.resumenAnual.slice(0, 5)) {
        lineas.push(`  Año ${a.anio}: cuota anual ${fmt(a.cuotasAnuales)} € | intereses ${fmt(a.interesesAnio)} € | pendiente ${fmt(a.capitalPendiente)} €`);
      }

      lineas.push(
        '',
        `⚖️ *${r.nota}*`,
      );

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_prestamo
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_prestamo',
    'Calcula un préstamo personal o financiero con tres sistemas de amortización: ' +
    'francés (cuota constante, el más habitual), alemán (amortización constante, cuotas decrecientes) ' +
    'y americano/bullet (solo intereses durante el plazo, capital al final). ' +
    'Incluye TAE aproximada, comparativa de costes y primeras cuotas desglosadas. ' +
    '⚠️ Estimación orientativa — la TAE real depende de todos los gastos del contrato.',
    {
      capital: z.number().positive()
        .describe('Importe del préstamo en euros'),
      plazoMeses: z.number().int().min(1).max(600)
        .describe('Plazo del préstamo en meses. Ej: 36 para 3 años, 60 para 5 años.'),
      tin: z.number().min(0).max(50)
        .describe('Tipo de interés nominal anual (TIN) en %. Ej: 7 para 7%.'),
      sistema: z.enum(['frances', 'aleman', 'americano'])
        .describe(
          '"frances" = cuota fija (el más habitual). ' +
          '"aleman" = amortización constante, cuota inicial más alta pero va bajando, menos intereses totales. ' +
          '"americano" = solo intereses cada mes, capital devuelto de golpe al final (bullet).'
        ),
      comisionApertura: z.number().min(0).max(5).optional()
        .describe('Comisión de apertura en % sobre el capital. Afecta al cálculo de TAE. Por defecto 0.'),
    },
    async ({ capital, plazoMeses, tin, sistema, comisionApertura }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_prestamo', aiCaller);

      let r;
      try {
        r = calcularPrestamo({ capital, plazoMeses, tin, sistema: sistema as SistemaAmortizacion, comisionApertura });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const lineas = [
        `💳 **Calculadora de Préstamos — ${r.nombreSistema}**`,
        `ℹ️ ${r.descripcionSistema}`,
        '',
        `💶 Capital: ${fmt(capital)} €`,
        `⏳ Plazo: ${plazoMeses} meses (${(plazoMeses / 12).toFixed(1).replace('.', ',')} años)`,
        `📊 TIN: ${tin.toFixed(2).replace('.', ',')}%`,
        r.comisionAperturaEuros > 0 ? `📋 Comisión apertura: ${fmt(r.comisionAperturaEuros)} €` : '',
        `📈 **TAE aproximada: ${r.taeAproximada.toFixed(2).replace('.', ',')}%**`,
        '',
        `💳 Cuota inicial: **${fmt(r.cuotaInicial)} €**`,
        sistema !== 'frances' ? `💳 Cuota final: **${fmt(r.cuotaFinal)} €**` : '',
        '',
        `➕ Total intereses: ${fmt(r.totalIntereses)} €`,
        `💰 **Total pagado: ${fmt(r.totalPagado)} €**`,
        '',
        '📋 **Primeras cuotas (muestra):**',
        `  Mes | Cuota | Interés | Amortización | Pendiente`,
      ];

      for (const c of r.muestraCuotas) {
        lineas.push(`  ${c.mes.toString().padStart(3)} | ${fmt(c.cuota)} € | ${fmt(c.interes)} € | ${fmt(c.amortizacion)} € | ${fmt(c.pendiente)} €`);
      }

      lineas.push('', `✅ ${r.ventajas}`);

      return { content: [{ type: 'text', text: lineas.filter(l => l !== '').join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_compraventa_inmueble
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_compraventa_inmueble',
    'Calcula todos los gastos de compraventa de un inmueble en España con normativa 2025. ' +
    'Para el COMPRADOR: ITP (segunda mano, por CCAA 4%-10%) o IVA (obra nueva 10%/4% VPO/21% local), ' +
    'AJD, notaría, registro y gestoría. ' +
    'Para el VENDEDOR (opcional): plusvalía municipal IIVTNU con coeficientes oficiales 2025 ' +
    'e IRPF sobre la ganancia patrimonial con tramos 2025. ' +
    '⚠️ Estimación orientativa — notaría y registro dependen del arancel exacto.',
    {
      precioInmueble: z.number().positive()
        .describe('Precio de compraventa del inmueble en euros'),
      ccaa: z.enum([
        'madrid', 'andalucia', 'cataluna', 'valencia', 'galicia', 'castilla-leon',
        'castilla-mancha', 'aragon', 'baleares', 'canarias', 'cantabria', 'asturias',
        'extremadura', 'murcia', 'rioja', 'pais-vasco', 'navarra',
      ]).describe('Comunidad autónoma donde se ubica el inmueble (determina el tipo de ITP)'),
      tipoTransmision: z.enum(['segunda_mano', 'obra_nueva', 'vpo'])
        .describe('"segunda_mano" = ITP (impuesto transmisiones patrimoniales). "obra_nueva" = IVA 10% residencial o 21% local. "vpo" = IVA superreducido 4%.'),
      tipoInmueble: z.enum(['vivienda', 'garaje', 'local_comercial', 'terreno']).optional()
        .describe('Tipo de inmueble. Afecta al IVA en obra nueva: vivienda/garaje=10%, local_comercial/terreno=21%. Por defecto "vivienda".'),
      perfilComprador: z.enum(['general', 'joven', 'familia_numerosa', 'discapacidad']).optional()
        .describe('Perfil del comprador. Puede aplicar tipo reducido de ITP en algunas CCAA. Por defecto "general".'),
      precioCompraOriginal: z.number().positive().optional()
        .describe('Precio al que compró el inmueble el vendedor (para calcular la ganancia patrimonial y el IRPF del vendedor)'),
      aniosTenencia: z.number().int().min(0).max(50).optional()
        .describe('Años que ha tenido el inmueble el vendedor (para calcular la plusvalía municipal IIVTNU)'),
      valorCatastralSuelo: z.number().positive().optional()
        .describe('Valor catastral del suelo del inmueble en euros (figura en el recibo del IBI). Necesario para calcular la plusvalía municipal.'),
      vendedorMayor65: z.boolean().optional()
        .describe('Si el vendedor tiene más de 65 años. Relevante para la exención de IRPF en vivienda habitual.'),
      esViviendaHabitual: z.boolean().optional()
        .describe('Si el inmueble es la vivienda habitual del vendedor. Relevante para exenciones de IRPF.'),
      tipoMunicipalIIVTNU: z.number().min(0).max(30).optional()
        .describe('Tipo impositivo que aplica el Ayuntamiento en la plusvalía municipal (0%-30%). Por defecto 25% orientativo si no se conoce.'),
    },
    async ({ precioInmueble, ccaa, tipoTransmision, tipoInmueble, perfilComprador, precioCompraOriginal, aniosTenencia, valorCatastralSuelo, vendedorMayor65, esViviendaHabitual, tipoMunicipalIIVTNU }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_compraventa_inmueble', aiCaller);

      let r;
      try {
        r = calcularCompraventa({
          precioInmueble, ccaa,
          tipoTransmision: tipoTransmision as TipoTransmisionCompraventa,
          tipoInmueble: tipoInmueble as TipoInmuebleMCP | undefined,
          perfilComprador: perfilComprador as PerfilCompradorMCP | undefined,
          precioCompraOriginal, aniosTenencia, valorCatastralSuelo,
          vendedorMayor65, esViviendaHabitual, tipoMunicipalIIVTNU,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const c = r.comprador;

      const lineas = [
        `🏘️ **Gastos de Compraventa Inmobiliaria — ${r.ccaaNombre}**`,
        '',
        `💶 Precio del inmueble: **${fmt(c.precioInmueble)} €**`,
        '',
        `🧾 **GASTOS DEL COMPRADOR**`,
        `  📋 ${c.tipoImpuesto} (${c.porcentajeImpuesto}%): **${fmt(c.importeImpuesto)} €**`,
        `     ℹ️ ${c.notaITP}`,
        `  📝 AJD escritura: ${fmt(c.ajd)} €`,
        `  ✍️ Notaría (estimación): ${fmt(c.notaria)} €`,
        `  📚 Registro (estimación): ${fmt(c.registro)} €`,
        `  🗂️ Gestoría (estimación): ${fmt(c.gestoria)} €`,
        `  ─────────────────────────`,
        `  💰 **Total gastos comprador: ${fmt(c.totalGastos)} €** (${((c.totalGastos / c.precioInmueble) * 100).toFixed(1).replace('.', ',')}% del precio)`,
        `  🏠 **Total operación (precio + gastos): ${fmt(c.totalOperacion)} €**`,
      ];

      if (r.vendedor) {
        const v = r.vendedor;
        lineas.push('', `🏷️ **GASTOS DEL VENDEDOR**`);

        if (v.plusvaliaMunicipal !== null) {
          lineas.push(`  🏛️ Plusvalía municipal (IIVTNU): **${fmt(v.plusvaliaMunicipal)} €**`);
          lineas.push(`     ℹ️ ${v.metodoPlusvalia}`);
        }

        if (v.gananciaPatrimonial !== null) {
          lineas.push(`  📈 Ganancia patrimonial: ${fmt(v.gananciaPatrimonial)} €`);
          if (v.exentoIRPF) {
            lineas.push(`  ✅ IRPF: **EXENTO** — ${v.motivoExencion}`);
          } else {
            lineas.push(`  💸 IRPF sobre ganancia: **${fmt(v.irpfGananciaPatrimonial ?? 0)} €**`);
          }
        }

        lineas.push(`  ─────────────────────────`);
        lineas.push(`  💰 **Total gastos vendedor estimados: ${fmt(v.totalGastosVendedor)} €**`);
        lineas.push(``, `  ⚠️ *${v.nota}*`);
      }

      lineas.push(
        '',
        `📚 Fuente: ${r.fuenteDatos}`,
        `⚖️ *Estimación orientativa. Los aranceles de notaría y registro dependen de la operación exacta. Consulta con un gestor o notario antes de firmar.*`,
      );

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_amortizacion_anticipada
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_amortizacion_anticipada',
    'Calcula el efecto de una amortización anticipada de hipoteca o préstamo en España. ' +
    'Compara las dos opciones que ofrecen los bancos: reducir la cuota mensual (misma duración) ' +
    'o reducir el plazo (misma cuota, terminas antes). ' +
    'Muestra el ahorro en intereses de cada opción y recomienda la más ventajosa. ' +
    'Usa sistema de amortización francés (el estándar en España).',
    {
      capitalInicial: z.number().positive()
        .describe('Capital original del préstamo o hipoteca en euros'),
      plazoAnios: z.number().int().min(1).max(40)
        .describe('Plazo original del préstamo en años'),
      tin: z.number().min(0).max(30)
        .describe('Tipo de interés nominal anual (TIN) en porcentaje'),
      importeAmortizacion: z.number().positive()
        .describe('Importe que se amortiza anticipadamente en euros'),
      mesesTranscurridos: z.number().int().min(0).optional()
        .describe('Meses transcurridos desde el inicio del préstamo hasta el momento de la amortización. Alternativa a fechaInicio + fechaAmortizacion.'),
      fechaInicio: z.string().optional()
        .describe('Fecha de inicio del préstamo en formato YYYY-MM-DD (alternativa a mesesTranscurridos)'),
      fechaAmortizacion: z.string().optional()
        .describe('Fecha en que se hace la amortización anticipada en formato YYYY-MM-DD'),
    },
    async ({ capitalInicial, plazoAnios, tin, importeAmortizacion, mesesTranscurridos, fechaInicio, fechaAmortizacion }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_amortizacion_anticipada', aiCaller);

      let r;
      try {
        r = calcularAmortizacionAnticipada({ capitalInicial, plazoAnios, tin, importeAmortizacion, mesesTranscurridos, fechaInicio, fechaAmortizacion });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `🏦 **Amortización Anticipada — Análisis Comparativo**`,
        '',
        `💶 Capital original: ${fmt(r.capitalInicial)} € · TIN: ${tin}% · Plazo: ${plazoAnios} años`,
        `📅 Meses transcurridos: ${r.mesesTranscurridos} · Plazo restante: ${r.plazoRestanteMeses} meses`,
        `💰 Saldo antes de amortizar: ${fmt(r.saldoAntes)} €`,
        `➡️ Amortización: **${fmt(importeAmortizacion)} €** → Saldo nuevo: ${fmt(r.saldoDespues)} €`,
        `📊 Cuota actual: ${fmt(r.cuotaOriginal)} €/mes`,
        '',
        `**OPCIÓN 1 — Reducir cuota (mismo plazo restante)**`,
        `  📉 Nueva cuota: **${fmt(r.nuevaCuota)} €/mes** (ahorras ${fmt(r.reduccionCuota)} €/mes)`,
        `  💸 Ahorro en intereses: **${fmt(r.ahorroInteresesCuota)} €**`,
        '',
        `**OPCIÓN 2 — Reducir plazo (misma cuota)**`,
        `  ⏱️ Nuevo plazo: **${r.nuevoPlazoMeses} meses** (acortas ${r.reduccionMeses} meses = ${(r.reduccionMeses / 12).toFixed(1).replace('.', ',')} años)`,
        `  💸 Ahorro en intereses: **${fmt(r.ahorroInteresesPlazo)} €**`,
        '',
        `🏆 **Recomendación**: ${r.recomendacion}`,
        '',
        `ℹ️ Intereses totales sin amortizar: ${fmt(r.totalInteresesSinAmortizar)} €`,
        `⚖️ *Cálculo orientativo con sistema francés. Consulta con tu banco las condiciones exactas.*`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_brecha_jubilacion
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_brecha_jubilacion',
    'Calcula la brecha económica de jubilación: cuánto dinero perderás mensualmente al pasar ' +
    'de tu sueldo actual a la pensión pública. ' +
    'Calcula el capital total que necesitarías acumular y cuánto debes ahorrar mensualmente desde hoy ' +
    'para cubrirlo, usando interés compuesto.',
    {
      sueldoNetoMensual: z.number().positive()
        .describe('Sueldo neto mensual actual en euros'),
      pensionEstimadaMensual: z.number().min(0)
        .describe('Pensión mensual estimada al jubilarse en euros (puedes usar calcular_pension_publica para estimarla)'),
      edadActual: z.number().int().min(18).max(70)
        .describe('Edad actual en años'),
      edadJubilacion: z.number().int().min(60).max(75).optional()
        .describe('Edad prevista de jubilación. Por defecto 67 (edad ordinaria 2025 con <37 años cotizados).'),
      anosJubilado: z.number().int().min(1).max(40).optional()
        .describe('Años de jubilación previstos para cubrir. Por defecto 20.'),
      rentabilidadAnual: z.number().min(0).max(15).optional()
        .describe('Rentabilidad anual esperada del ahorro/inversión en %. Por defecto 4%.'),
    },
    async ({ sueldoNetoMensual, pensionEstimadaMensual, edadActual, edadJubilacion, anosJubilado, rentabilidadAnual }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_brecha_jubilacion', aiCaller);

      let r;
      try {
        r = calcularBrechaJubilacion({ sueldoNetoMensual, pensionEstimadaMensual, edadActual, edadJubilacion, anosJubilado, rentabilidadAnual });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `👴 **Brecha de Jubilación**`,
        '',
        `💼 Sueldo neto actual: **${fmt(sueldoNetoMensual)} €/mes**`,
        `🏛️ Pensión estimada: **${fmt(pensionEstimadaMensual)} €/mes** (${r.porcentajePensionSobreSueldo.toFixed(1).replace('.', ',')}% del sueldo)`,
        '',
        r.tieneBrecha
          ? `⚠️ **Brecha mensual: ${fmt(r.brechaMensual)} €** (lo que perderías al jubilarte)`
          : `✅ La pensión cubre el sueldo actual — sin brecha económica.`,
        r.tieneBrecha ? `📅 Brecha anual: ${fmt(r.brechaAnual)} €` : '',
        '',
        `📊 **Plan de ahorro para cubrir la brecha**`,
        `  ⏳ Años hasta jubilación (${r.edadJubilacion}): **${r.anosHastaJubilacion} años**`,
        `  💰 Capital necesario (${r.anosJubilado} años de jubilación): **${fmt(r.capitalNecesario)} €**`,
        `  📈 Rentabilidad anual asumida: ${rentabilidadAnual ?? 4}%`,
        `  💸 **Ahorro mensual necesario desde hoy: ${fmt(r.ahorroMensualNecesario)} €**`,
        '',
        `⚖️ *Estimación orientativa. La pensión real la calcula la Seguridad Social según tu historial de cotización.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_tir_van
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_tir_van',
    'Calcula el VAN (Valor Actual Neto) y la TIR (Tasa Interna de Retorno) de una inversión. ' +
    'Útil para analizar si un proyecto es rentable: un VAN positivo indica que la inversión crea valor; ' +
    'la TIR es la rentabilidad real anualizada del proyecto. ' +
    'También calcula el período de recuperación (payback) descontado.',
    {
      inversionInicial: z.number().positive()
        .describe('Inversión inicial en euros (valor positivo, representa la salida de caja en el año 0)'),
      tasaDescuento: z.number().min(0).max(100)
        .describe('Tasa de descuento anual en % (coste del capital o rentabilidad mínima exigida). Habitual: 8-12% para proyectos empresariales.'),
      flujosCaja: z.array(z.number()).min(1).max(30)
        .describe('Flujos de caja anuales en euros, del año 1 en adelante. Pueden ser positivos (ingresos) o negativos (pérdidas). Ejemplo: [10000, 15000, 20000] para 3 años.'),
    },
    async ({ inversionInicial, tasaDescuento, flujosCaja }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_tir_van', aiCaller);

      let r;
      try {
        r = calcularTIRVAN({ inversionInicial, tasaDescuento, flujosCaja });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const vanEmoji = r.van > 0 ? '✅' : r.van < 0 ? '❌' : '⚖️';
      const lineas = [
        `📈 **Análisis TIR y VAN**`,
        '',
        `💶 Inversión inicial: **${fmt(inversionInicial)} €**`,
        `📊 Tasa de descuento: ${tasaDescuento}%`,
        `📅 Período: ${flujosCaja.length} año(s)`,
        '',
        `${vanEmoji} **VAN: ${fmt(r.van)} €**`,
        r.tirEncontrada && r.tir !== null ? `📉 **TIR: ${r.tir.toFixed(2).replace('.', ',')}%**` : `📉 TIR: no converge (flujos inconsistentes)`,
        r.payback !== null ? `⏱️ Payback descontado: **${r.payback.toFixed(1).replace('.', ',')} años**` : `⏱️ Payback: no se recupera dentro del período`,
        '',
        `💡 ${r.interpretacion}`,
        '',
        `📋 **Flujos descontados (resumen)**`,
        ...r.flujosDescontados.map(f =>
          `  Año ${f.ano}: ${fmt(f.flujo)} € → descontado: ${fmt(f.flujoDescontado)} € | acumulado: ${fmt(f.acumulado)} €`
        ),
        '',
        `💰 Total retornos (sin descontar): ${fmt(r.totalRetornos)} € | Rentabilidad bruta: ${r.rentabilidadBruta.toFixed(1).replace('.', ',')}%`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_fire
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_fire',
    'Calcula el objetivo de independencia financiera (FIRE — Financial Independence, Retire Early). ' +
    'Determina el "número FIRE" (patrimonio necesario según la regla del 4%), ' +
    'los años necesarios para alcanzarlo con tu ahorro e inversión actual, ' +
    'y una proyección patrimonial año a año. ' +
    'Clasifica el objetivo en Lean FIRE (<20k€/año), FIRE normal (20-50k€) o Fat FIRE (>50k€).',
    {
      gastosAnuales: z.number().positive()
        .describe('Gastos anuales totales en euros (base del cálculo FIRE)'),
      ingresosAnuales: z.number().positive()
        .describe('Ingresos anuales netos en euros (para calcular el ahorro anual)'),
      patrimonioActual: z.number().min(0).optional()
        .describe('Patrimonio financiero ya invertido en euros (acciones, fondos, etc.). Por defecto 0.'),
      rentabilidadAnual: z.number().min(0).max(20).optional()
        .describe('Rentabilidad anual esperada de la cartera en %. Por defecto 7% (histórica renta variable diversificada).'),
      tasaRetiro: z.number().min(1).max(10).optional()
        .describe('Tasa de retiro segura anual en %. Por defecto 4% (regla del 4% de Trinity Study). Una tasa menor (3-3,5%) es más conservadora.'),
    },
    async ({ gastosAnuales, ingresosAnuales, patrimonioActual, rentabilidadAnual, tasaRetiro }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_fire', aiCaller);

      let r;
      try {
        r = calcularFIRE({ gastosAnuales, ingresosAnuales, patrimonioActual, rentabilidadAnual, tasaRetiro });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      const fmtDec = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fireEmoji = r.tipoFIRE === 'lean' ? '🥦' : r.tipoFIRE === 'fat' ? '🥂' : '⚡';
      const lineas = [
        `${fireEmoji} **FIRE — Independencia Financiera**`,
        '',
        `💸 Gastos anuales: **${fmt(gastosAnuales)} €/año** | Ingresos: ${fmt(ingresosAnuales)} €/año`,
        `💰 Ahorro anual: **${fmt(r.ahorroAnual)} €** (tasa de ahorro: ${r.tasaAhorro.toFixed(1).replace('.', ',')}%)`,
        '',
        `🎯 **Número FIRE (tasa retiro ${r.tasaRetiro}%): ${fmt(r.numeroFIRE)} €**`,
        `📊 Patrimonio actual: ${fmt(patrimonioActual ?? 0)} €`,
        `📈 Rentabilidad esperada: ${r.rentabilidadAnual}% anual`,
        '',
        r.tieneAhorroPositivo
          ? `⏱️ **Años para alcanzar FIRE: ${r.anosParaFIRE === Infinity ? '> 100 años (aumenta el ahorro)' : r.anosParaFIRE + ' años'}**`
          : `⚠️ El ahorro es negativo (gastas más de lo que ingresas). Imposible alcanzar FIRE con la situación actual.`,
        '',
        `🏷️ ${r.descripcionTipoFIRE}`,
        '',
        r.proyeccion.length > 1 ? `📋 **Proyección patrimonial (primeros ${Math.min(r.proyeccion.length - 1, 10)} años)**` : '',
        ...r.proyeccion.slice(1, 11).map(p => `  Año ${p.ano}: ${fmt(p.patrimonio)} €`),
        '',
        `⚖️ *Cálculo orientativo. La rentabilidad real varía. No incluye inflación ni impuestos sobre plusvalías.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_pension_viudedad
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_pension_viudedad',
    'Calcula de forma orientativa la pensión de viudedad en España según la LGSS (arts. 219-231). ' +
    'Determina la base reguladora, el porcentaje aplicable (52%, 60% o 70% según cargas e ingresos), ' +
    'la pensión mínima garantizada 2026 y la pensión final con tope máximo de la SS. ' +
    '⚠️ Estimación orientativa — la SS calcula la pensión real a partir del historial completo de cotización.',
    {
      situacionCausante: z.enum(['activo', 'jubilado', 'no-alta'])
        .describe('"activo" = en alta en SS al fallecer. "jubilado" = percibía pensión de jubilación. "no-alta" = no estaba de alta (requiere cotización mínima).'),
      baseCotizacionMedia: z.number().positive().optional()
        .describe('Base de cotización media mensual del causante en los últimos 2 años (€). Obligatoria si situacion es "activo" o "no-alta".'),
      pensionCausante: z.number().positive().optional()
        .describe('Pensión de jubilación mensual del causante en euros. Obligatoria si situacion es "jubilado".'),
      edadBeneficiario: z.number().int().min(0).max(100)
        .describe('Edad del beneficiario (viudo/a) en años. Afecta al porcentaje y a la pensión mínima garantizada.'),
      tieneCargas: z.boolean().optional()
        .describe('Si el beneficiario tiene cargas familiares (hijos menores de 26 o con discapacidad a cargo). Puede elevar el porcentaje al 70%.'),
      ingresosMensualesPropios: z.number().min(0).optional()
        .describe('Ingresos mensuales propios del beneficiario por trabajo o pensión (€). Determina acceso a los porcentajes del 60% y 70%.'),
    },
    async ({ situacionCausante, baseCotizacionMedia, pensionCausante, edadBeneficiario, tieneCargas, ingresosMensualesPropios }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_pension_viudedad', aiCaller);

      let r;
      try {
        r = calcularPensionViudedad({
          situacionCausante: situacionCausante as SituacionCausante,
          baseCotizacionMedia, pensionCausante, edadBeneficiario, tieneCargas, ingresosMensualesPropios,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `🕊️ **Pensión de Viudedad — Estimación Orientativa**`,
        '',
        `📊 Base reguladora: **${fmt(r.baseReguladora)} €/mes**`,
        `📏 Porcentaje aplicado: **${r.porcentajeAplicable}%** — ${r.razonPorcentaje}`,
        `💰 Pensión bruta calculada: ${fmt(r.pensionBruta)} €/mes`,
        `🛡️ Pensión mínima garantizada (2026): ${fmt(r.pensionMinima)} €/mes`,
        '',
        `🏦 **Pensión final estimada: ${fmt(r.pensionFinal)} €/mes** (${fmt(r.pensionFinal * 14)} €/año · 14 pagas)`,
        `💵 Estimación neta tras IRPF: ~${fmt(r.pensionNetaAprox)} €/mes`,
        '',
        ...r.notas.map(n => `ℹ️ ${n}`),
        '',
        `📚 ${r.fuenteDatos}`,
        `⚖️ *Estimación orientativa. La SS calcula la pensión real a partir del historial completo de cotización del causante.*`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_legitimas
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_legitimas',
    'Calcula la herencia forzosa (legítima) según el régimen de derecho civil aplicable en España. ' +
    'Cubre los 7 regímenes: Derecho Común (Madrid, Andalucía, Castilla...), Cataluña, Aragón, ' +
    'Galicia, Baleares, País Vasco y Navarra (que tiene legítima puramente formal = 0€). ' +
    'Determina la legítima total, la parte por hijo, el tercio de mejora y los derechos del cónyuge.',
    {
      patrimonioNeto: z.number().min(0)
        .describe('Patrimonio neto del causante en euros (activos - pasivos)'),
      regimen: z.enum(['comun', 'cataluna', 'aragon', 'galicia', 'baleares', 'pais-vasco', 'navarra'])
        .describe('"comun" = Madrid, Andalucía, Castilla, Extremadura, La Rioja, Cantabria, Asturias, Murcia, C.Valenciana, Canarias. El resto por su nombre.'),
      numHijos: z.number().int().min(0).max(20)
        .describe('Número de hijos o descendientes directos'),
      tieneConyuge: z.boolean().optional()
        .describe('Si hay cónyuge o pareja de hecho superviviente. Afecta al usufructo viudal.'),
    },
    async ({ patrimonioNeto, regimen, numHijos, tieneConyuge }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_legitimas', aiCaller);

      let r;
      try {
        r = calcularLegitimas({ patrimonioNeto, regimen: regimen as RegimenId, numHijos, tieneConyuge });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `⚖️ **Legítimas Hereditarias — ${r.nombreRegimen}**`,
        `📍 CCAA: ${r.ccaas}`,
        `📚 Normativa: ${r.fuenteNormativa}`,
        '',
        `💶 Patrimonio neto: **${fmt(patrimonioNeto)} €**`,
        `👨‍👩‍👧‍👦 Hijos: ${numHijos} | Cónyuge: ${tieneConyuge ? 'sí' : 'no'}`,
        '',
        r.esNavarra
          ? `🟢 **Legítima formal (simbólica): 0 €** — ${r.fraccionLegitima}`
          : `🔒 **Legítima total (herencia forzosa): ${fmt(r.legitimaTotal)} €** — ${r.fraccionLegitima}`,
        r.legitimaPorHijo !== null && numHijos > 0
          ? `  👤 Legítima individual por hijo: **${fmt(r.legitimaPorHijo)} €**`
          : r.esLegitivaColectiva ? `  👥 Legítima colectiva: distribución libre entre descendientes` : '',
        r.tercioMejora !== null ? `  🎯 Tercio de mejora (libre entre descendientes): ${fmt(r.tercioMejora)} €` : '',
        `  🟢 Parte de libre disposición: **${fmt(r.libreDisposicion)} €**`,
        '',
        tieneConyuge && r.derechoConyuge !== null
          ? `💑 **Derechos del cónyuge**: ${r.descripcionDerechoConyuge} (valor referencia: ${fmt(r.derechoConyuge)} €)`
          : '',
        ...r.notas.map(n => `ℹ️ ${n}`),
        '',
        `⚖️ *Estimación orientativa. Consulta con notaría para tu situación concreta.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_tarifa_freelance
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_tarifa_freelance',
    'Calcula la tarifa ideal (€/hora, €/día, €/semana) para un freelance o autónomo en España. ' +
    'Parte del ingreso neto deseado, suma los gastos deducibles, aplica IRPF, IVA y margen de beneficio, ' +
    'y ajusta por los días realmente facturables (descontando fines de semana, vacaciones, festivos y porcentaje de ocupación). ' +
    'Devuelve tarifas con y sin IVA y proyección anual.',
    {
      ingresoNetoMensual: z.number().positive()
        .describe('Ingreso neto mensual deseado en euros (lo que quieres llevarte a casa)'),
      horasSemanales: z.number().min(1).max(80).optional()
        .describe('Horas de trabajo por semana. Por defecto 40.'),
      diasVacaciones: z.number().int().min(0).max(60).optional()
        .describe('Días de vacaciones al año. Por defecto 22 (convenio estándar).'),
      diasFestivos: z.number().int().min(0).max(20).optional()
        .describe('Días festivos al año. Por defecto 14.'),
      diasEnfermedad: z.number().int().min(0).max(30).optional()
        .describe('Días de baja o enfermedad previstos al año. Por defecto 5.'),
      porcentajeOcupacion: z.number().min(10).max(100).optional()
        .describe('Porcentaje de días laborables que realmente se facturan (el resto es captación, admin, formación). Por defecto 70%.'),
      tipoIRPF: z.number().min(0).max(50).optional()
        .describe('Tipo de IRPF estimado en %. Por defecto 21% (retención autónomo estándar).'),
      tipoIVA: z.number().min(0).max(21).optional()
        .describe('Tipo de IVA que aplicas en tus facturas (%). Por defecto 21%. Algunos servicios exentos = 0.'),
      margenBeneficio: z.number().min(0).max(100).optional()
        .describe('Margen de beneficio adicional sobre costes en %. Por defecto 15%.'),
      totalGastosMensuales: z.number().min(0).optional()
        .describe('Total de gastos mensuales deducibles en euros (cuota autónomo, seguros, software, oficina, gestoría...). Si los conoces, úsalo directamente.'),
    },
    async ({ ingresoNetoMensual, horasSemanales, diasVacaciones, diasFestivos, diasEnfermedad, porcentajeOcupacion, tipoIRPF, tipoIVA, margenBeneficio, totalGastosMensuales }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_tarifa_freelance', aiCaller);

      let r;
      try {
        r = calcularTarifaFreelance({
          ingresoNetoMensual,
          horasSemanales, diasVacaciones, diasFestivos, diasEnfermedad,
          porcentajeOcupacion, tipoIRPF, tipoIVA, margenBeneficio,
          gastosFijos: totalGastosMensuales ? [{ concepto: 'Gastos totales', importe: totalGastosMensuales }] : [],
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `💼 **Tarifa Freelance / Autónomo**`,
        '',
        `📅 Días laborables al año: ${r.diasLaborablesAno} | Facturables: ${r.diasFacturablesAno.toFixed(1).replace('.', ',')} (${porcentajeOcupacion ?? 70}% ocupación)`,
        `⏰ Horas facturables: ${r.horasFacturablesAno.toFixed(0)} año · ${r.horasFacturablesMes.toFixed(1).replace('.', ',')} mes`,
        '',
        `💸 Gastos mensuales deducibles: ${fmt(r.totalGastosMensuales)} €`,
        `💰 Facturación mensual necesaria (sin IVA): ${fmt(r.facturacionMensualNecesaria)} €`,
        '',
        `🏷️ **TARIFAS SIN IVA (lo que cobras)**`,
        `  ⏱️ Por hora: **${fmt(r.tarifaHora)} €/h**`,
        `  📅 Por día: **${fmt(r.tarifaDia)} €/día**`,
        `  📆 Por semana: **${fmt(r.tarifaSemana)} €/semana**`,
        '',
        `🧾 **TARIFAS CON IVA (lo que paga el cliente)**`,
        `  ⏱️ Por hora: **${fmt(r.tarifaHoraConIVA)} €/h**`,
        `  📅 Por día: **${fmt(r.tarifaDiaConIVA)} €/día**`,
        `  📆 Por semana: **${fmt(r.tarifaSemanaConIVA)} €/semana**`,
        '',
        `📊 **Proyección anual**`,
        `  💰 Facturación anual (sin IVA): ${fmt(r.facturacionAnual)} €`,
        `  💸 Gastos anuales: ${fmt(r.gastosAnuales)} €`,
        `  🧾 IRPF estimado: ${fmt(r.irpfAnual)} €`,
        `  ✅ Beneficio neto anual: **${fmt(r.beneficioNetoAnual)} €**`,
        '',
        `⚖️ *Estimación orientativa. El tipo de IRPF real depende de tu renta total anual. Consulta con gestoría.*`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_break_even
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_break_even',
    'Calcula el punto de equilibrio (break-even) de un negocio o producto: ' +
    'las unidades y euros de ventas necesarios para cubrir todos los costes. ' +
    'Incluye análisis de situación actual (si se proporcionan ventas actuales), ' +
    'unidades para alcanzar un objetivo de ganancia y 4 escenarios what-if ' +
    '(+10% precio, -10% costes variables, -20% costes fijos, combinado).',
    {
      precioVenta: z.number().positive()
        .describe('Precio de venta por unidad en euros'),
      costoVariable: z.number().min(0)
        .describe('Coste variable por unidad en euros (materiales, comisiones, packaging, etc.)'),
      costosFijos: z.number().min(0)
        .describe('Costes fijos totales mensuales en euros (alquiler, nóminas fijas, seguros, amortizaciones...)'),
      ventasActuales: z.number().int().min(0).optional()
        .describe('Unidades vendidas actualmente al mes. Opcional — permite comparar la situación real con el break-even.'),
      objetivoGanancia: z.number().min(0).optional()
        .describe('Objetivo de ganancia mensual deseado en euros. Opcional — calcula las unidades necesarias para alcanzarlo.'),
    },
    async ({ precioVenta, costoVariable, costosFijos, ventasActuales, objetivoGanancia }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_break_even', aiCaller);

      let r;
      try {
        r = calcularBreakEven({ precioVenta, costoVariable, costosFijos, ventasActuales, objetivoGanancia });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `📊 **Punto de Equilibrio (Break-Even)**`,
        '',
        `💶 Precio: ${fmt(precioVenta)} €/ud · Coste variable: ${fmt(costoVariable)} €/ud · Costes fijos: ${fmt(costosFijos)} €/mes`,
        `📈 Margen de contribución: **${fmt(r.margenContribucion)} €/ud** (${r.margenContribucionPorcentaje.toFixed(1).replace('.', ',')}% del precio)`,
        '',
        `🎯 **Break-even: ${r.breakEvenUnidades} unidades/mes = ${fmt(r.breakEvenEuros)} €/mes en ventas**`,
        '',
        r.unidadesParaObjetivo !== null
          ? `💰 Para objetivo de ganancia (${fmt(objetivoGanancia ?? 0)} €/mes): **${r.unidadesParaObjetivo} unidades/mes**`
          : '',
        r.gananciaActual !== null
          ? [
            ``,
            `📋 **Situación actual (${ventasActuales} unidades/mes)**`,
            `  ${r.esRentable ? '✅' : '❌'} Ganancia/pérdida: **${fmt(r.gananciaActual)} €/mes**`,
            `  📊 Nivel vs break-even: ${r.porcentajeBreakEven?.toFixed(1).replace('.', ',')}%`,
            `  🛡️ Margen de seguridad: ${r.margenSeguridad} ud (${r.margenSeguridadPorcentaje?.toFixed(1).replace('.', ',')}%)`,
          ].join('\n')
          : '',
        '',
        `🔬 **Escenarios what-if**`,
        ...r.escenarios.map(e =>
          `  📌 ${e.descripcion}: break-even = **${e.breakEvenUnidades} ud** (${e.variacionVsActual !== null ? (e.variacionVsActual > 0 ? '+' : '') + e.variacionVsActual + '%' : 'base'})`
        ),
        '',
        `⚖️ *Cálculo mensual orientativo. Los costes variables y fijos son estimaciones — verifica con tu contabilidad.*`,
      ].filter(l => l !== '');
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
