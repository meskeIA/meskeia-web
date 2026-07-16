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
import { AsyncLocalStorage } from 'node:async_hooks';
import { z } from 'zod';
import { calcularPropina, obtenerPorcentajePais, PROPINAS_POR_PAIS } from '@/lib/calculadoras/propinas';
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
import { calcularGastoEnergetico, type Electrodomestico } from '@/lib/calculadoras/gastoEnergetico';
import { convertirEdadMascota, type TipoMascota, type TamanoPerro } from '@/lib/calculadoras/edadMascota';
import { calcularReglaTres, type TipoRegla, type TipoRelacion } from '@/lib/calculadoras/reglaTres';
import { convertirUnidades, type CategoriaUnidad } from '@/lib/calculadoras/conversorUnidades';
import { calcularMacros, type SexoBiologico, type NivelActividad, type ObjetivoNutricional } from '@/lib/calculadoras/macros';
import { calcularInflacion } from '@/lib/calculadoras/inflacion';
import { calcularMcdMcm } from '@/lib/calculadoras/mcdMcm';
import { calcularKilometraje, type PerfilKilometraje } from '@/lib/calculadoras/kilometraje';
import { calcularEstadisticas } from '@/lib/calculadoras/estadisticas';
// ── Lote P:
// ── Lote Q:
// ── Lote R:
// ── Lote S:
// ── Lote T:
// ── Fotografía:
import { calcularProfundidadCampo, calcularAstrofoto, calcularExposicionEquivalente, type TipoSensor, type ParametroFijo } from '@/lib/calculadoras/fotografia';
// ── Deporte:
import { calcularPrediccionRunning, calcularZonasCardiacas, calcular1RM, calcularPotenciaCiclismo, calcularPaceRunning, calcularSWOLF } from '@/lib/calculadoras/deporte';
// ── Videografía:
import { calcularRegla180, calcularCamaraLenta, calcularFiltroNDVideo, calcularBitrateVideo, calcularFOVVideo, type TipoResolucionVideo, type TipoCodecVideo } from '@/lib/calculadoras/videografia';
// ── Cocina Técnica:
import {
  calcularBakersPercentage,
  calcularHidratacionPan,
  calcularSustitucionMasaMadre,
  calcularDDT,
  calcularPuntosAzucar,
  calcularSustitucionGelatina,
  calcularGanache,
  escalarReceta,
  type ModoHidratacion,
  type TipoLevaduraOrigen,
  type TipoAmasadora,
  type TipoGelatina,
  type TipoChocolate,
  type TexturaGanache,
  type CategoriaIngrediente,
} from '@/lib/calculadoras/cocina';

// ---------------------------------------------------------------------------
// Analytics: reutilizamos el mismo sistema que usan las apps web
// ---------------------------------------------------------------------------
// Contexto por petición con los datos del CLIENTE real (User-Agent, IP
// anonimizada, país). El fetch interno de analytics sale con la IP de la
// propia función Vercel (AWS us-east-1), así que sin este contexto es
// imposible saber quién llama al MCP. AsyncLocalStorage propaga el dato
// hasta las tools sin cambiar sus firmas y es seguro con concurrencia.
interface ClienteMcp {
  ua: string | null;
  ip: string | null;
  pais: string | null;
}
const contextoCliente = new AsyncLocalStorage<ClienteMcp>();

// RGPD: truncar último octeto (IPv4) o últimos 80 bits (IPv6),
// mismo criterio que /api/analytics/track.
function anonimizarIpCliente(ip: string): string {
  if (ip.includes('.') && !ip.includes(':')) {
    const partes = ip.split('.');
    if (partes.length === 4) {
      partes[3] = '0';
      return partes.join('.');
    }
  }
  if (ip.includes(':')) {
    const partes = ip.split(':');
    if (partes.length >= 4) return partes.slice(0, 3).join(':') + '::';
  }
  return 'anonymous';
}

function extraerCliente(req: Request): ClienteMcp {
  const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  return {
    ua: req.headers.get('user-agent')?.slice(0, 200) ?? null,
    pais: req.headers.get('x-vercel-ip-country'),
    ip: rawIp ? anonimizarIpCliente(rawIp) : null,
  };
}

async function registrarUsoMCP(tool: string, aiCaller: string): Promise<void> {
  try {
    // Usamos el dominio canónico — VERCEL_URL devuelve la URL del deployment, no el custom domain
    const baseUrl = 'https://meskeia.com';

    const cliente = contextoCliente.getStore();
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
        datos_adicionales: {
          aiCaller,
          uaCliente: cliente?.ua ?? null,
          ipCliente: cliente?.ip ?? null,
          paisCliente: cliente?.pais ?? null,
        },
      }),
    });
  } catch {
    // Los errores de analytics no deben interrumpir el cálculo
  }
}

// ---------------------------------------------------------------------------
// Avisos legales — se añaden al final de respuestas según categoría de riesgo
// ---------------------------------------------------------------------------
const AVISO_FISCAL =
  '\n\n---\n⚠️ *Aviso legal: resultado orientativo generado automáticamente. Datos normativos: ejercicio fiscal 2025 — verificar vigencia antes de actuar. ' +
  'No constituye asesoramiento fiscal ni jurídico. meskeIA no asume responsabilidad ' +
  'por decisiones tomadas en base a estos datos. Consulte a un asesor fiscal colegiado ' +
  'o a la Agencia Tributaria (aeat.es) para su caso concreto.*';

const AVISO_FINANCIERO =
  '\n\n---\n⚠️ *Aviso legal: resultado orientativo generado automáticamente. ' +
  'No constituye asesoramiento financiero ni de inversión. meskeIA no asume ' +
  'responsabilidad por decisiones económicas tomadas en base a estos datos. ' +
  'Consulte a un profesional financiero antes de actuar.*';

const AVISO_SALUD =
  '\n\n---\n⚠️ *Aviso legal: resultado orientativo generado automáticamente. ' +
  'No constituye diagnóstico ni consejo médico. meskeIA no asume responsabilidad ' +
  'por decisiones de salud tomadas en base a estos datos. ' +
  'Consulte a un profesional sanitario para su caso concreto.*';

const AVISO_TECNICO =
  '\n\n---\n📷 *Resultado calculado con fórmulas técnicas estándar. ' +
  'Los valores reales pueden variar según tolerancias de fabricación, ' +
  'condiciones de captura y calibración del equipo.*';

function conAviso(texto: string, aviso: string) {
  return { content: [{ type: 'text' as const, text: texto + aviso }] };
}

// Instrucciones a nivel de servidor: la IA cliente las recibe en `initialize`.
// Refuerzan que el aviso legal de cada respuesta se muestre SIEMPRE en pantalla,
// ya que el disclaimer viaja en el payload pero su presentación la decide el cliente.
const INSTRUCCIONES_MESKEIA =
  'meskeIA ofrece herramientas de cálculo para el día a día: cocina y repostería, deporte y ' +
  'entrenamiento, salud y nutrición, fotografía y vídeo, mascotas, vehículos y movilidad, y ' +
  'utilidades cotidianas (unidades, porcentajes, fechas, estadística básica). ' +
  'Para consultas de fiscalidad, derecho laboral, finanzas, pensiones o herencias en España, ' +
  'meskeIA NO es el servidor adecuado: existe un servicio especializado (Delegum) para esos temas. ' +
  'Algunas respuestas de salud incluyen un AVISO (marcado con ⚠️) al final; cuando aparezca, ' +
  'muéstralo SIEMPRE de forma visible y literal, sin resumirlo ni omitirlo. Los resultados son ' +
  'orientativos y no sustituyen el criterio de un profesional cuando la decisión lo requiera ' +
  '(por ejemplo, salud o nutrición).';

// ---------------------------------------------------------------------------
// Función para crear el servidor MCP con todas sus herramientas
// ---------------------------------------------------------------------------
function crearServidorMCP(): McpServer {
  const servidor = new McpServer(
    {
      name: 'meskeIA',
      version: '1.0.0',
    },
    {
      instructions: INSTRUCCIONES_MESKEIA,
    },
  );

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
    { title: 'Calcula la propina de una cuenta de restaurante y la divide entre', readOnlyHint: true },
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
    { title: 'Realiza cálculos con porcentajes. Cinco modos disponibles', readOnlyHint: true },
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
    { title: 'Calculadora de combustible con dos modos', readOnlyHint: true },
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
    { title: 'Calcula el Índice de Masa Corporal (IMC) a partir del peso y la altura', readOnlyHint: true },
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

      return conAviso(lineas.join('\n'), AVISO_SALUD);
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
    { title: 'Calcula cuánto tiempo hay entre dos fechas', readOnlyHint: true },
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
    { title: 'Suma o resta días, semanas, meses o años a una fecha para obtener', readOnlyHint: true },
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
    { title: 'Dice qué día de la semana (lunes, martes...) cae una fecha concreta', readOnlyHint: true },
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
    { title: 'Calcula la edad exacta en años, meses y días a partir de una', readOnlyHint: true },
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
  // TOOL: calcular_gasto_energetico
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_gasto_energetico',
    'Calcula el consumo eléctrico mensual del hogar y la factura estimada. ' +
    'A partir de los electrodomésticos (potencia, horas de uso, días al mes) ' +
    'calcula los kWh totales y desglosa la factura con todos los conceptos: ' +
    'coste de energía, término de potencia, impuesto eléctrico (5.113%) e IVA (21%).',
    {
      electrodomesticos: z.array(z.object({
        nombre: z.string().describe('Nombre del electrodoméstico (ej: "Nevera", "TV salón")'),
        potenciaW: z.number().min(0).describe('Potencia en Watios (W). Ejemplos: nevera 150W, TV 100W, lavadora 2000W, aire acondicionado 1500W'),
        horasDia: z.number().min(0).max(24).describe('Horas de uso al día'),
        diasMes: z.number().int().min(1).max(31).optional().describe('Días de uso al mes. Por defecto 30.'),
        cantidad: z.number().int().min(1).optional().describe('Número de unidades. Por defecto 1.'),
      })).min(1).max(30)
        .describe('Lista de electrodomésticos con su potencia y uso'),
      preciokWh: z.number().min(0).optional()
        .describe('Precio del kWh en euros. Por defecto 0.15 €/kWh (mercado libre orientativo). PVPC media ~0.13 €/kWh.'),
      potenciaContratadaKW: z.number().min(0).optional()
        .describe('Potencia contratada en kW. Habitual: 3.45, 4.6, 5.75, 6.9, 8.05 kW. Por defecto 4.6 kW.'),
    },
    { title: 'Calcula el consumo eléctrico mensual del hogar y la factura estimada', readOnlyHint: true },
    async ({ electrodomesticos, preciokWh, potenciaContratadaKW }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_gasto_energetico', aiCaller);

      let r;
      try {
        r = calcularGastoEnergetico({ electrodomesticos: electrodomesticos as Electrodomestico[], preciokWh, potenciaContratadaKW });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const top3 = [...r.detalle].sort((a, b) => b.consumoMensualKWh - a.consumoMensualKWh).slice(0, 3);
      const lineas = [
        `⚡ **Gasto Energético del Hogar**`,
        '',
        `📊 Consumo total: **${r.consumoTotalKWh.toFixed(2).replace('.', ',')} kWh/mes** | Precio: ${r.preciokWh.toFixed(4).replace('.', ',')} €/kWh`,
        `🔌 Potencia contratada: ${r.potenciaContratadaKW} kW`,
        '',
        `🧾 **Desglose de la factura**`,
        `  ⚡ Energía consumida: ${fmt(r.costeEnergia)} €`,
        `  🔌 Término de potencia: ${fmt(r.terminoPotencia)} €`,
        `  ─────────────────────`,
        `  Subtotal: ${fmt(r.subtotal)} €`,
        `  🏛️ Impuesto eléctrico (5,113%): ${fmt(r.impuestoElectricidad)} €`,
        `  🧾 IVA (21%): ${fmt(r.iva)} €`,
        `  ─────────────────────`,
        `  💰 **Total mensual estimado: ${fmt(r.totalMensual)} €**`,
        `  📅 Coste anual estimado: ${fmt(r.totalAnual)} €`,
        '',
        `🏆 **Top consumidores**`,
        ...top3.map(e => `  📌 ${e.nombre}: ${e.consumoMensualKWh.toFixed(2).replace('.', ',')} kWh/mes → ${fmt(e.costeMensual)} €`),
        '',
        `⚖️ *Estimación orientativa. La factura real varía según tarifa y discriminación horaria.*`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: convertir_edad_mascota
  // ------------------------------------------------------------------
  servidor.tool(
    'convertir_edad_mascota',
    'Convierte la edad de un perro o gato a años humanos equivalentes ' +
    'y determina su etapa de vida con recomendaciones de cuidado. ' +
    'Para perros usa factores por tamaño (pequeño, mediano, grande, gigante). ' +
    'Para gatos: primer año = 15 años humanos, segundo = 9, resto × 4.',
    {
      edadMascota: z.number().min(0).max(30)
        .describe('Edad de la mascota en años. Puede tener decimales (ej: 0.5 = 6 meses, 1.5 = 1 año y medio).'),
      tipoMascota: z.enum(['perro', 'gato'])
        .describe('Tipo de mascota'),
      tamanoPerro: z.enum(['pequeno', 'mediano', 'grande', 'gigante']).optional()
        .describe('Tamaño del perro (solo si tipoMascota="perro"): "pequeno" <10kg, "mediano" 10-25kg, "grande" 25-45kg, "gigante" >45kg. Por defecto "mediano".'),
    },
    { title: 'Convierte la edad de un perro o gato a años humanos equivalentes', readOnlyHint: true },
    async ({ edadMascota, tipoMascota, tamanoPerro }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('convertir_edad_mascota', aiCaller);

      let r;
      try {
        r = convertirEdadMascota({
          edadMascota,
          tipoMascota: tipoMascota as TipoMascota,
          tamanoPerro: tamanoPerro as TamanoPerro | undefined,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const mascotaEmoji = tipoMascota === 'perro' ? '🐶' : '🐱';
      const lineas = [
        `${mascotaEmoji} **Edad en Años Humanos**`,
        '',
        `Tu ${tipoMascota} tiene **${edadMascota} año(s)** ${tipoMascota === 'perro' && tamanoPerro ? `(talla ${tamanoPerro})` : ''}`,
        `➡️ Equivale a **${r.edadHumana} años humanos**`,
        '',
        `🏷️ Etapa: **${r.etapaVida}** — ${r.descripcion}`,
        `📅 Expectativa de vida: ${r.expectativaVida}`,
        '',
        `💡 **Recomendaciones de cuidado**`,
        ...r.recomendaciones.map(rec => `  ✅ ${rec}`),
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_regla_tres
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_regla_tres',
    'Resuelve reglas de tres simples (directa e inversa) y compuestas. ' +
    'La regla de tres directa: si A→B entonces C→X (X = B×C/A). ' +
    'La inversa: si A×B = C×X (X = A×B/C). ' +
    'La compuesta maneja dos variables simultáneas con cualquier combinación directa/inversa. ' +
    'Muestra la fórmula y los pasos de resolución.',
    {
      tipo: z.enum(['simple-directa', 'simple-inversa', 'compuesta'])
        .describe('"simple-directa": proporción directa (más de A → más de B). "simple-inversa": proporción inversa (más de A → menos de B). "compuesta": dos variables simultáneas.'),
      a: z.number().describe('Valor A (referencia 1 de la variable principal)'),
      b: z.number().describe('Valor B (resultado 1 de la variable principal)'),
      c: z.number().describe('Valor C (referencia 2 de la variable principal, para la que buscamos X)'),
      d: z.number().optional().describe('Valor D (referencia 1 de la segunda variable). Solo para tipo "compuesta".'),
      e: z.number().optional().describe('Valor E (referencia 2 de la segunda variable). Solo para tipo "compuesta".'),
      relacionSegundaVariable: z.enum(['directa', 'inversa']).optional()
        .describe('Relación de la segunda variable: "directa" (más D → más X) o "inversa" (más D → menos X). Solo para tipo "compuesta".'),
    },
    { title: 'Resuelve reglas de tres simples (directa e inversa) y compuestas', readOnlyHint: true },
    async ({ tipo, a, b, c, d, e, relacionSegundaVariable }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_regla_tres', aiCaller);

      let r;
      try {
        r = calcularReglaTres({
          tipo: tipo as TipoRegla,
          a, b, c, d, e,
          relacionSegundaVariable: relacionSegundaVariable as TipoRelacion | undefined,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const xFormateado = Number.isInteger(r.valorX) ? r.valorX.toString() : r.valorX.toLocaleString('es-ES', { maximumFractionDigits: 6 });
      const lineas = [
        `🔢 **Regla de Tres — ${tipo === 'simple-directa' ? 'Simple Directa' : tipo === 'simple-inversa' ? 'Simple Inversa' : 'Compuesta'}**`,
        '',
        `📐 Fórmula: \`${r.formula}\``,
        '',
        `📋 **Resolución paso a paso**`,
        ...r.pasos.map(p => `  ${p}`),
        '',
        `✅ **X = ${xFormateado}**`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: convertir_unidades
  // ------------------------------------------------------------------
  servidor.tool(
    'convertir_unidades',
    'Convierte entre unidades de medida en 12 categorías: ' +
    'longitud (m, km, cm, mm, mi, yd, ft, in, nmi, au, ly), ' +
    'masa (kg, g, mg, t, lb, oz, st), ' +
    'temperatura (C, F, K, R), ' +
    'area (m2, km2, cm2, ha, acre, ft2), ' +
    'volumen (l, ml, m3, gal, qt, pt), ' +
    'tiempo (s, min, h, d, semana, mes, ano), ' +
    'velocidad (ms, kmh, mph, kn, mach), ' +
    'datos (b, B, KB, MB, GB, TB, Kb, Mb, Gb), ' +
    'presion (Pa, kPa, bar, atm, psi, mmHg), ' +
    'energia (J, kJ, cal, kcal, Wh, kWh, BTU, eV), ' +
    'fuerza (N, kN, lbf, kgf), ' +
    'potencia (W, kW, MW, hp, cv).',
    {
      valor: z.number()
        .describe('Valor numérico a convertir'),
      categoria: z.enum([
        'longitud', 'masa', 'temperatura', 'area', 'volumen',
        'tiempo', 'velocidad', 'datos', 'presion', 'energia', 'fuerza', 'potencia',
      ]).describe('Categoría de la conversión'),
      unidadOrigen: z.string()
        .describe('Unidad de origen (ver listado en la descripción). Ejemplos: "km", "lb", "C", "ha", "kWh"'),
      unidadDestino: z.string()
        .describe('Unidad destino. Ejemplos: "mi", "kg", "F", "acre", "BTU"'),
    },
    { title: 'Convierte entre unidades de medida en 12 categorías', readOnlyHint: true },
    async ({ valor, categoria, unidadOrigen, unidadDestino }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('convertir_unidades', aiCaller);

      let r;
      try {
        r = convertirUnidades({ valor, categoria: categoria as CategoriaUnidad, unidadOrigen, unidadDestino });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmtNum = (n: number) => {
        if (Math.abs(n) === 0) return '0';
        if (Math.abs(n) >= 0.001 && Math.abs(n) < 1e9) {
          return n.toLocaleString('es-ES', { maximumSignificantDigits: 8 });
        }
        return n.toExponential(4);
      };

      const lineas = [
        `📐 **Conversión de ${r.categoria}**`,
        '',
        `**${fmtNum(r.valorOrigen)} ${r.unidadOrigen} = ${fmtNum(r.valorDestino)} ${r.unidadDestino}**`,
        '',
        r.factorConversion !== 0 ? `🔢 Factor de conversión: ${fmtNum(r.factorConversion)}` : '',
        `📌 ${r.formula}`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_macros
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_macros',
    'Calcula las necesidades calóricas diarias y la distribución óptima de macronutrientes. ' +
    'Usa la fórmula Mifflin-St Jeor para la TMB (Tasa Metabólica Basal) ' +
    'y multiplica por el factor de actividad para obtener el TDEE. ' +
    'Ajusta las calorías según el objetivo (definición -500 kcal, mantenimiento 0, volumen +400 kcal) ' +
    'y distribuye en proteínas, carbohidratos y grasas. ' +
    '⚠️ Orientativo — consultar con dietista-nutricionista titulado para planes personalizados.',
    {
      peso: z.number().positive().max(300)
        .describe('Peso corporal en kilogramos'),
      altura: z.number().positive().max(250)
        .describe('Altura en centímetros'),
      edad: z.number().int().positive().max(120)
        .describe('Edad en años'),
      sexo: z.enum(['hombre', 'mujer'])
        .describe('Sexo biológico (determina la constante de la fórmula Mifflin-St Jeor)'),
      nivelActividad: z.enum(['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'])
        .describe(
          '"sedentario" (sin ejercicio), "ligero" (1-3 días/semana), "moderado" (3-5 días), ' +
          '"activo" (6-7 días), "muy_activo" (ejercicio intenso diario o 2x/día)'
        ),
      objetivo: z.enum(['definicion', 'mantenimiento', 'volumen'])
        .describe(
          '"definicion" (déficit -500 kcal, 30P/40C/30G%), "mantenimiento" (0 kcal, 25P/50C/25G%), ' +
          '"volumen" (superávit +400 kcal, 25P/50C/25G%)'
        ),
    },
    { title: 'Calcula las necesidades calóricas diarias y la distribución', readOnlyHint: true },
    async ({ peso, altura, edad, sexo, nivelActividad, objetivo }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_macros', aiCaller);

      let r;
      try {
        r = calcularMacros({
          peso, altura, edad,
          sexo: sexo as SexoBiologico,
          nivelActividad: nivelActividad as NivelActividad,
          objetivo: objetivo as ObjetivoNutricional,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const objLabel: Record<string, string> = {
        definicion: '🔥 Definición (déficit)',
        mantenimiento: '⚖️ Mantenimiento',
        volumen: '💪 Volumen (superávit)',
      };
      const actLabel: Record<string, string> = {
        sedentario: 'Sedentario (×1,2)',
        ligero: 'Actividad ligera (×1,375)',
        moderado: 'Actividad moderada (×1,55)',
        activo: 'Activo (×1,725)',
        muy_activo: 'Muy activo (×1,9)',
      };
      const lineas = [
        `🥗 **Calculadora de Macros — ${objLabel[objetivo]}**`,
        '',
        `📊 TMB (Mifflin-St Jeor): **${r.tmb} kcal/día**`,
        `🏃 ${actLabel[nivelActividad]} → TDEE: **${r.tdee} kcal/día**`,
        `🎯 Calorías objetivo: **${r.caloriasObjetivo} kcal/día** (${r.ajusteKcal >= 0 ? '+' : ''}${r.ajusteKcal} kcal)`,
        '',
        `🍗 Proteínas (${r.ratios.proteinas}%): **${r.macros.proteinas} g/día** (${r.macros.caloriasProteinas} kcal)`,
        `🍞 Carbohidratos (${r.ratios.carbohidratos}%): **${r.macros.carbohidratos} g/día** (${r.macros.caloriasCarbohidratos} kcal)`,
        `🥑 Grasas (${r.ratios.grasas}%): **${r.macros.grasas} g/día** (${r.macros.caloriasGrasas} kcal)`,
        '',
        `📏 IMC aproximado: **${r.imc}**`,
        '',
        `⚠️ *Estimación orientativa basada en datos promedio. Consultar con dietista-nutricionista para un plan personalizado.*`,
      ];
      return conAviso(lineas.join('\n'), AVISO_SALUD);
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_inflacion
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_inflacion',
    'Calcula el equivalente en poder adquisitivo de una cantidad monetaria ' +
    'entre dos años cualquiera de la historia de España (1961-2025). ' +
    'Usa el IPC histórico del INE (base 2021 = 100) para determinar: ' +
    'el valor equivalente en el año destino, la inflación acumulada en el período ' +
    'y la inflación media anual (CAGR). ' +
    'Útil para comparar salarios, precios o inversiones entre épocas diferentes.',
    {
      cantidad: z.number().positive()
        .describe('Cantidad monetaria en euros (o pesetas históricas, el resultado será proporcional)'),
      anoOrigen: z.number().int().min(1961).max(2025)
        .describe('Año de la cantidad original (1961-2025)'),
      anoDestino: z.number().int().min(1961).max(2025)
        .describe('Año al que se quiere convertir (1961-2025). Puede ser anterior al año origen para calcular hacia atrás.'),
    },
    { title: 'Calcula el equivalente en poder adquisitivo de una cantidad', readOnlyHint: true },
    async ({ cantidad, anoOrigen, anoDestino }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_inflacion', aiCaller);

      let r;
      try {
        r = calcularInflacion({ cantidad, anoOrigen, anoDestino });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const signo = r.inflacionAcumulada >= 0 ? '📈' : '📉';
      const haciaDonde = anoDestino > anoOrigen ? 'hacia el futuro' : 'hacia el pasado';
      const lineas = [
        `📊 **Calculadora de Inflación España (IPC INE)**`,
        '',
        `💶 ${fmt(cantidad)} € en **${anoOrigen}** equivalen a **${fmt(r.valorEquivalente)} €** en **${anoDestino}**`,
        `(Conversión ${haciaDonde}, ${r.anos} año${r.anos !== 1 ? 's' : ''})`,
        '',
        `${signo} Inflación acumulada: **${r.inflacionAcumulada >= 0 ? '+' : ''}${r.inflacionAcumulada.toFixed(2).replace('.', ',')}%**`,
        r.anos > 0 ? `📅 Inflación media anual (CAGR): **${r.inflacionMediaAnual >= 0 ? '+' : ''}${r.inflacionMediaAnual.toFixed(2).replace('.', ',')}%/año**` : '',
        `📈 IPC ${anoOrigen}: ${r.ipcOrigen} | IPC ${anoDestino}: ${r.ipcDestino} (base 2021=100)`,
        '',
        anoDestino > anoOrigen
          ? `💡 Lo que valía ${fmt(cantidad)} € en ${anoOrigen} ahora costaría **${fmt(r.valorEquivalente)} €** (diferencia: ${fmt(Math.abs(r.diferencia))} €)`
          : `💡 Lo que vale ${fmt(cantidad)} € hoy, en ${anoDestino} valía **${fmt(r.valorEquivalente)} €**`,
        '',
        `📚 ${r.fuenteDatos}`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_kilometraje
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_kilometraje',
    'Calcula la compensación o deducción fiscal por uso de vehículo propio en actividades económicas. ' +
    'Para empleados: exención IRPF hasta 0,26 €/km (RIRPF art. 9.B.2 — módulo AEAT 2025). ' +
    'Para autónomos: deducción en IRPF e IVA según exclusividad del uso del vehículo. ' +
    'Encadenable con calcular_irpf, calcular_cuota_autonomo, comparar_autonomo_vs_sl. ' +
    'Ideal para: "¿Cuánto me puedo deducir por usar el coche en el trabajo?" o ' +
    '"Mi empresa me paga 0,20€/km, ¿es correcto?"',
    {
      perfil: z.enum(['empleado', 'autonomo']).describe('"empleado" = trabajador por cuenta ajena. "autonomo" = autónomo o profesional.'),
      kmProfesionalesAnuales: z.number().min(0)
        .describe('Kilómetros profesionales anuales (desplazamientos laborales o de la actividad económica).'),
      compensacionRecibidaPorKm: z.number().min(0).optional()
        .describe('Para empleados: compensación que paga la empresa por km en euros. Por defecto 0.'),
      costeRealPorKm: z.number().min(0).optional()
        .describe('Coste real del vehículo por km (combustible, amortización, seguro, etc.) en euros. Por defecto 0,20 €/km.'),
      totalGastosVehiculo: z.number().min(0).optional()
        .describe('Para autónomos: total de gastos del vehículo en el año (combustible, seguro, reparaciones, amortización) en euros.'),
      usoExclusivoActividad: z.boolean().optional()
        .describe('Para autónomos: ¿el vehículo está afecto exclusivamente a la actividad? (difícil de acreditar para turismos). Por defecto false.'),
      tipoMarginalIRPF: z.number().min(0).max(50).optional()
        .describe('Tipo marginal IRPF para calcular el ahorro fiscal en porcentaje. Por defecto 30%.'),
    },
    { title: 'Calcula la compensación o deducción fiscal por uso de vehículo', readOnlyHint: true },
    async ({ perfil, kmProfesionalesAnuales, compensacionRecibidaPorKm, costeRealPorKm, totalGastosVehiculo, usoExclusivoActividad, tipoMarginalIRPF }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_kilometraje', aiCaller);

      let r;
      try {
        r = calcularKilometraje({ perfil: perfil as PerfilKilometraje, kmProfesionalesAnuales, compensacionRecibidaPorKm, costeRealPorKm, totalGastosVehiculo, usoExclusivoActividad, tipoMarginalIRPF });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const res = r.resultado;
      let texto: string;

      if (res.tipo === 'empleado') {
        texto = [
          `🚗 **Kilometraje Profesional — Empleado**`,
          '',
          `📍 ${kmProfesionalesAnuales.toLocaleString('es-ES')} km profesionales/año | Módulo AEAT 2025: ${res.moduloKm.toFixed(2).replace('.', ',')} €/km`,
          '',
          `💶 Compensación máxima exenta de IRPF: **${fmt(res.compensacionMaximaExenta)} €/año**`,
          compensacionRecibidaPorKm ? `  Compensación recibida: ${fmt(res.compensacionRecibida)} €/año` : '',
          res.importeSujetoIRPF > 0 ? `  ⚠️ Exceso sobre el límite sujeto a IRPF: ${fmt(res.importeSujetoIRPF)} €` : '',
          costeRealPorKm ? `  Coste real del desplazamiento: ${fmt(res.costeRealDesplazamiento)} €/año` : '',
          res.diferenciaSinCubrir > 0 ? `  Coste no cubierto por la empresa: ${fmt(res.diferenciaSinCubrir)} €/año` : '',
          '',
          `📚 Fuente: RIRPF art. 9.B.2 — módulo 0,26 €/km (2025)`,
        ].filter(l => l !== '').join('\n');
      } else {
        const ra = res as import('@/lib/calculadoras/kilometraje').ResultadoAutonomo;
        texto = [
          `🚗 **Kilometraje Profesional — Autónomo**`,
          '',
          `📍 ${kmProfesionalesAnuales.toLocaleString('es-ES')} km profesionales/año | Deducción: ${ra.pctDeduccion}% ${ra.usoExclusivo ? '(uso exclusivo)' : '(uso parcial — criterio general Hacienda)'}`,
          '',
          `💶 Gastos deducibles IRPF: **${fmt(ra.gastosDeduciblesIRPF)} €**`,
          `💶 IVA deducible: **${fmt(ra.ivaDeducible)} €**`,
          `💚 Ahorro fiscal IRPF estimado: **${fmt(ra.ahorroFiscalIRPF)} €**`,
          `💚 Ahorro IVA: **${fmt(ra.ahorroIVA)} €**`,
          `💚 **Ahorro total: ${fmt(ra.ahorroTotal)} €**`,
          '',
          `⚠️ ${ra.advertencia}`,
        ].filter(l => l !== '').join('\n');
      }

      return conAviso(texto, AVISO_FISCAL);
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_estadisticas
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_estadisticas',
    'Calcula los principales descriptores estadísticos de un conjunto de datos numéricos: ' +
    'media, mediana, moda, varianza, desviación típica, percentiles (Q1/Q2/Q3), ' +
    'rango intercuartílico, coeficiente de variación y asimetría de Fisher. ' +
    'Muy útil para analizar rendimientos de inversiones, precios, gastos, ingresos, etc. ' +
    'Encadenable con cualquier tool que devuelva series de valores numéricos. ' +
    'Ideal para: "Analiza estas rentabilidades mensuales de mi cartera: [2.3, -1.1, 3.4, ...]"',
    {
      valores: z.array(z.number()).min(2).max(1000)
        .describe('Lista de valores numéricos a analizar (mínimo 2, máximo 1.000). Ejemplos: rendimientos mensuales, precios, gastos.'),
      nombre: z.string().optional()
        .describe('Nombre descriptivo del conjunto de datos (ej: "Rendimientos cartera 2024").'),
      decimales: z.number().int().min(0).max(6).optional()
        .describe('Número de decimales para los resultados. Por defecto 4.'),
    },
    { title: 'Calcula los principales descriptores estadísticos de un conjunto', readOnlyHint: true },
    async ({ valores, nombre, decimales }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_estadisticas', aiCaller);

      let r;
      try {
        r = calcularEstadisticas({ valores, nombre, decimales });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => Number.isInteger(n) ? String(n) : n.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
      const asim = r.asimetria > 0.5 ? 'asimetría positiva (cola derecha)' : r.asimetria < -0.5 ? 'asimetría negativa (cola izquierda)' : 'distribución aproximadamente simétrica';
      const lineas = [
        `📊 **Estadísticas${nombre ? `: ${nombre}` : ''}**`,
        '',
        `📈 **Descriptores centrales (n=${r.n}):**`,
        `  Media: **${fmt(r.media)}**`,
        `  Mediana: **${fmt(r.mediana)}**`,
        r.moda ? `  Moda: **${r.moda.join(', ')}**` : '  Moda: no hay (todos los valores son únicos)',
        '',
        `📉 **Dispersión:**`,
        `  Mínimo: ${fmt(r.minimo)} | Máximo: ${fmt(r.maximo)} | Rango: ${fmt(r.rango)}`,
        `  Desviación típica (muestral): **${fmt(r.desviacionTipicaMuestral)}**`,
        `  Varianza muestral: ${fmt(r.varianzaMuestral)}`,
        `  Coeficiente de variación: **${r.coeficienteVariacion.toFixed(2).replace('.', ',')}%**`,
        '',
        `📦 **Percentiles:**`,
        `  Q1 (25%): ${fmt(r.q1)}`,
        `  Q2 (50%): ${fmt(r.q2)}`,
        `  Q3 (75%): ${fmt(r.q3)}`,
        `  Rango intercuartílico (IQR): ${fmt(r.ric)}`,
        '',
        `🔀 **Forma:** Asimetría Fisher = ${fmt(r.asimetria)} → ${asim}`,
        `📋 Suma total: ${fmt(r.suma)}`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_mcd_mcm
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_mcd_mcm',
    'Calcula el Máximo Común Divisor (MCD) y el Mínimo Común Múltiplo (MCM) ' +
    'de dos o más números enteros positivos. ' +
    'Incluye: algoritmo de Euclides paso a paso (si son 2 números), ' +
    'factorización en números primos de cada número, ' +
    'factores del MCD (primos comunes con exponente mínimo) y del MCM (exponente máximo), ' +
    'y lista de todos los divisores comunes.',
    {
      numeros: z.array(z.number().int().positive().max(1e12)).min(2).max(10)
        .describe('Lista de 2 a 10 números enteros positivos. Ejemplo: [12, 18, 24]'),
    },
    { title: 'Calcula el Máximo Común Divisor (MCD) y el Mínimo Común Múltiplo', readOnlyHint: true },
    async ({ numeros }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_mcd_mcm', aiCaller);

      let r;
      try {
        r = calcularMcdMcm({ numeros });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmtFactores = (f: Record<number, number>) =>
        Object.entries(f).map(([p, e]) => e === 1 ? p : `${p}^${e}`).join(' × ') || '1';

      const lineas = [
        `🔢 **MCD y MCM** de [${numeros.join(', ')}]`,
        '',
        `✅ **MCD = ${r.mcd}** (Máximo Común Divisor)`,
        `✅ **MCM = ${r.mcm}** (Mínimo Común Múltiplo)`,
        '',
        `📊 Factorización en primos:`,
        ...numeros.map(n => `  ${n} = ${fmtFactores(r.factorizaciones[n])}`),
        '',
        `🔍 Factores MCD: ${fmtFactores(r.factoresMcd)}`,
        `🔍 Factores MCM: ${fmtFactores(r.factoresMcm)}`,
        '',
        `📋 Divisores comunes: ${r.divisoresComunes.join(', ')}`,
        '',
        r.pasosEuclides ? `📐 **Algoritmo de Euclides:**` : '',
        ...(r.pasosEuclides ?? []).map(p => `  ${p}`),
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ── Lote S: rendimiento capital inmobiliario, pension alimenticia, deduccion maternidad, familia numerosa, intangibles, operaciones vinculadas, impuesto plasticos, startups ──

  // ── Lote R: ITF, inversion sujeto pasivo IVA, TFI, simplificado IVA, modelo 111, cese actividad, MSCT, complemento brecha genero ──

  // ── Lote Q: impatriados, recargo equivalencia, irregulares IRPF, reinversion vivienda, jubilacion parcial, movilidad geografica, derechos autor, abatimiento ──

  // ── Lote P: criptomonedas, bonificacion contratacion, I+D+i, prorrata IVA, modelo 347, empresa familiar ISD, retribucion especie, grandes fortunas ──

  // ── Lote O: AJD, renta vitalicia, plan pensión empresa, despido objetivo, ERTE, dietas, descuento efectos, provisión insolvencias ──

  // ── Lote N: IIVTNU, arrendamiento, maternidad, ITP, imputación, vivienda CCAA, módulos, nocturnidad rotativa ──

  // ── Lote T: reduccion plan pensiones IRPF, compensacion BINs IS, gastos deducibles autonomo, retencion dividendos, IBI, modelo 720, rescate plan pensiones, doble imposicion IS ──

  // TOOL: recomendar_vehiculo
  // ------------------------------------------------------------------
  servidor.tool(
    'recomendar_vehiculo',
    'Recomienda el segmento (urbano, compacto, SUV, familiar) y la motorización (gasolina, diésel, híbrido, eléctrico) más adecuados según el perfil del usuario. ' +
    'Necesita al menos los km anuales. Opcionales: uso principal, pasajeros, presupuesto, zona y si hay ZBE. ' +
    'Devuelve segmento recomendado, motorización, razón principal, coste anual estimado y alertas contextuales.',
    {
      kmAnuales: z.number().positive()
        .describe('Kilómetros que conduce al año (ej: 15000)'),
      usoPrincipal: z.enum(['urbano', 'mixto', 'carretera']).optional()
        .describe('urbano = mayoría en ciudad | mixto = ciudad+carretera | carretera = mayoría autopista. Por defecto: mixto'),
      pasajeros: z.number().int().min(2).max(9).optional()
        .describe('Número habitual de ocupantes incluyendo el conductor. Por defecto: 4'),
      presupuesto: z.enum(['menos15k', '15k_25k', '25k_40k', 'mas40k']).optional()
        .describe('Presupuesto disponible para la compra. Por defecto: 15k_25k'),
      carga: z.enum(['poca', 'normal', 'mucha']).optional()
        .describe('Necesidad de maletero: poca/normal/mucha. Por defecto: normal'),
      zona: z.enum(['ciudad', 'suburbio', 'pueblo']).optional()
        .describe('Zona principal de uso del vehículo. Por defecto: ciudad'),
      zbe: z.boolean().optional()
        .describe('true si la ciudad tiene Zona de Bajas Emisiones activa (Madrid, Barcelona, Valencia...). Por defecto: false'),
    },
    { title: 'Recomienda el segmento (urbano, compacto, SUV, familiar) y la', readOnlyHint: true },
    async ({ kmAnuales, usoPrincipal, pasajeros, presupuesto, carga, zona, zbe }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('recomendar_vehiculo', aiCaller);

      const uso = usoPrincipal ?? 'mixto';
      const pax = pasajeros ?? 4;
      const budget = presupuesto ?? '15k_25k';
      const cargaV = carga ?? 'normal';
      const zbeV = zbe ?? false;

      // Segmento
      let segmento = 'Compacto';
      if (pax >= 5 || cargaV === 'mucha') {
        segmento = budget === 'menos15k' ? 'Monovolumen' : 'Familiar / Berlina';
      } else if (uso === 'carretera' || (uso === 'mixto' && budget !== 'menos15k')) {
        segmento = 'SUV / Crossover';
      } else if (uso === 'urbano' && budget === 'menos15k') {
        segmento = 'Urbano';
      }

      // Motorización
      let motor = 'Gasolina';
      if (budget === 'mas40k' && kmAnuales < 20000) motor = 'Eléctrico';
      else if (kmAnuales >= 20000 && uso === 'carretera') motor = 'Diésel';
      else if (kmAnuales >= 12000 && budget !== 'menos15k') motor = 'Híbrido';
      else if (uso === 'urbano' && budget === 'mas40k') motor = 'Eléctrico';

      // Alertas
      const alertas: string[] = [];
      if (zbeV && (motor === 'Diésel' || motor === 'Gasolina')) {
        alertas.push('⚠️ Tu ciudad tiene ZBE activa. Valora etiqueta ECO o CERO para circular sin restricciones.');
      }
      if (kmAnuales < 8000 && motor === 'Diésel') {
        alertas.push('⚠️ Con menos de 8.000 km/año el diésel raramente compensa. Considera gasolina o híbrido.');
      }
      if (motor === 'Eléctrico' && (zona ?? 'ciudad') === 'pueblo') {
        alertas.push('⚠️ En zona rural verifica disponibilidad de puntos de carga antes de optar por eléctrico puro.');
      }

      // Coste anual estimado
      const bases: Record<string, number> = { Gasolina: 3800, Diésel: 3600, Híbrido: 3200, Eléctrico: 2800 };
      const costeAnual = Math.round((bases[motor] ?? 3800) * (kmAnuales / 15000));

      const razonUso = uso === 'urbano' ? 'uso principalmente urbano' : uso === 'carretera' ? 'uso principalmente en carretera' : 'uso mixto ciudad/carretera';
      const lineas = [
        `🚗 **Recomendación de vehículo para tu perfil**`,
        ``,
        `📐 **Segmento**: ${segmento}`,
        `⚙️ **Motorización**: ${motor}`,
        ``,
        `💡 **Por qué**: Con ${kmAnuales.toLocaleString('es-ES')} km/año, ${razonUso} y ${pax} ocupantes habituales, el ${segmento} ${motor} ofrece el mejor equilibrio entre coste y funcionalidad.`,
        ``,
        `💶 **Coste operativo anual estimado**: ${costeAnual.toLocaleString('es-ES')} € (combustible + mantenimiento + fijos)`,
        alertas.length > 0 ? `\n${alertas.join('\n')}` : '',
        ``,
        `⚠️ Recomendación orientativa. La decisión final debe considerar pruebas de conducción y tus necesidades específicas.`,
      ].filter(l => l !== null);
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // TOOL: calcular_breakeven_electrico
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_breakeven_electrico',
    'Calcula el año en que un coche eléctrico empieza a ser más barato que uno de gasolina equivalente (punto de equilibrio). ' +
    'Necesita los precios de ambos coches y los km anuales. ' +
    'Opcionales: subsidio MOVES III (0/4500/7000€), consumos, precio luz y gasolina, coste cargador. ' +
    'Devuelve año de break-even, ahorro anual estimado, inversión neta extra y coste por km de cada opción.',
    {
      precioElectrico: z.number().positive()
        .describe('Precio del coche eléctrico en euros (ej: 32000)'),
      precioGasolina: z.number().positive()
        .describe('Precio del coche de gasolina equivalente en euros (ej: 22000)'),
      kmAnuales: z.number().positive()
        .describe('Kilómetros que se conducen al año (ej: 15000)'),
      subsidioMoves: z.number().min(0).optional()
        .describe('Subsidio MOVES III aplicable: 0 (sin subsidio), 4500 (sin achatarramiento) o 7000 (con achatarramiento). Por defecto: 0'),
      consumoElectrico: z.number().positive().optional()
        .describe('Consumo del eléctrico en kWh/100km. Por defecto: 16'),
      consumoGasolina: z.number().positive().optional()
        .describe('Consumo del gasolina en L/100km. Por defecto: 7'),
      precioLuz: z.number().positive().optional()
        .describe('Precio de la electricidad doméstica en €/kWh. Por defecto: 0,18'),
      precioGasolinaLitro: z.number().positive().optional()
        .describe('Precio de la gasolina en €/L. Por defecto: 1,65'),
      costeCargador: z.number().min(0).optional()
        .describe('Coste de instalación del cargador doméstico en euros. Por defecto: 800'),
    },
    { title: 'Calcula el año en que un coche eléctrico empieza a ser más barato', readOnlyHint: true },
    async ({ precioElectrico, precioGasolina, kmAnuales, subsidioMoves, consumoElectrico, consumoGasolina, precioLuz, precioGasolinaLitro, costeCargador }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_breakeven_electrico', aiCaller);

      const consEV = consumoElectrico ?? 16;
      const consGas = consumoGasolina ?? 7;
      const pLuz = precioLuz ?? 0.18;
      const pGas = precioGasolinaLitro ?? 1.65;
      const subsidio = subsidioMoves ?? 0;
      const cargador = costeCargador ?? 800;

      const costeEnergiaEV = (kmAnuales / 100) * consEV * pLuz;
      const costeEnergiaGas = (kmAnuales / 100) * consGas * pGas;
      const ahorroAnual = (costeEnergiaGas - costeEnergiaEV) + 200; // +200€ ahorro mantenimiento EV
      const inversionNeta = (precioElectrico - subsidio) - precioGasolina;
      const cargadorAnual = cargador / 10;

      let breakEvenAnio: number | null = null;
      let acumulado = 0;
      for (let a = 1; a <= 15; a++) {
        acumulado += ahorroAnual - cargadorAnual;
        if (acumulado >= inversionNeta && breakEvenAnio === null) { breakEvenAnio = a; break; }
      }

      const costePorKmEV = parseFloat(((consEV / 100) * pLuz).toFixed(4));
      const costePorKmGas = parseFloat(((consGas / 100) * pGas).toFixed(4));

      const lineas = [
        `⚡ **Break-even: Eléctrico vs Gasolina**`,
        ``,
        `💰 Diferencia de precio: ${precioElectrico.toLocaleString('es-ES')} € (EV) vs ${precioGasolina.toLocaleString('es-ES')} € (gasolina)`,
        subsidio > 0 ? `🎁 Subsidio MOVES III: -${subsidio.toLocaleString('es-ES')} €` : '',
        `📊 Inversión neta extra del eléctrico: **${Math.round(inversionNeta).toLocaleString('es-ES')} €**`,
        ``,
        `⛽ Ahorro anual estimado: **${Math.round(ahorroAnual).toLocaleString('es-ES')} €/año**`,
        `   (energía + mantenimiento diferencial)`,
        ``,
        breakEvenAnio
          ? `✅ **Punto de equilibrio: año ${breakEvenAnio}** — A partir de ese año el eléctrico es más barato en total.`
          : `❌ **No se alcanza el break-even en 15 años** con estos datos. El eléctrico no compensa económicamente en este horizonte.`,
        ``,
        `🔑 Coste por km — EV: ${costePorKmEV} €/km | Gasolina: ${costePorKmGas} €/km`,
        ``,
        `⚠️ Cálculo orientativo. No incluye depreciación diferencial ni carga en puntos públicos (0,45-0,65 €/kWh). El subsidio MOVES III tiene fondos limitados, verificar disponibilidad.`,
      ].filter(l => l !== null && l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // TOOL: consultar_etiqueta_dgt
  // ------------------------------------------------------------------
  servidor.tool(
    'consultar_etiqueta_dgt',
    'Calcula la etiqueta medioambiental DGT (CERO, ECO, C, B o Sin etiqueta) de un vehículo según su combustible y año de matriculación. ' +
    'También informa del acceso a las Zonas de Bajas Emisiones (ZBE) de Madrid, Barcelona, Valencia, Sevilla, Zaragoza, Valladolid y Bilbao. ' +
    'Encadenable con recomendar_vehiculo para completar el perfil de un vehículo en consideración.',
    {
      combustible: z.enum(['electrico', 'phev', 'hibrido', 'gnc_glp', 'gasolina', 'diesel'])
        .describe('electrico = BEV | phev = híbrido enchufable | hibrido = híbrido convencional HEV | gnc_glp = gas natural/propano | gasolina | diesel'),
      anioMatriculacion: z.number().int().min(1980).max(2025)
        .describe('Año de primera matriculación del vehículo (ej: 2018)'),
      autonomiaPhevKm: z.number().min(0).optional()
        .describe('Solo para PHEV: autonomía eléctrica en km. ≥40km → etiqueta CERO, <40km → ECO. Por defecto: 0'),
    },
    { title: 'Calcula la etiqueta medioambiental DGT (CERO, ECO, C, B o Sin', readOnlyHint: true },
    async ({ combustible, anioMatriculacion, autonomiaPhevKm }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('consultar_etiqueta_dgt', aiCaller);

      const autPhev = autonomiaPhevKm ?? 0;

      // Calcular etiqueta
      let etiqueta = 'Sin etiqueta';
      if (combustible === 'electrico' || combustible === 'gnc_glp') etiqueta = 'CERO';
      else if (combustible === 'phev') etiqueta = autPhev >= 40 ? 'CERO' : 'ECO';
      else if (combustible === 'hibrido') etiqueta = 'ECO';
      else if (combustible === 'gasolina') {
        if (anioMatriculacion >= 2006) etiqueta = 'C';
        else if (anioMatriculacion >= 2001) etiqueta = 'B';
      } else if (combustible === 'diesel') {
        if (anioMatriculacion >= 2015) etiqueta = 'C';
        else if (anioMatriculacion >= 2006) etiqueta = 'B';
      }

      // Acceso ZBE por etiqueta
      const zbeData: Record<string, { madrid: string; barcelona: string; otras: string }> = {
        'CERO':        { madrid: '✅ Libre', barcelona: '✅ Libre', otras: '✅ Libre en todas' },
        'ECO':         { madrid: '✅ Libre', barcelona: '✅ Libre', otras: '✅ Libre en todas' },
        'C':           { madrid: '⚠️ Libre salvo episodios contaminación', barcelona: '✅ Libre', otras: '✅ Libre en la mayoría' },
        'B':           { madrid: '⚠️ Solo residentes en Distrito Centro', barcelona: '⚠️ Restringido L-V 7h-20h', otras: '⚠️ Restricciones en Zaragoza y Bilbao' },
        'Sin etiqueta':{ madrid: '❌ Prohibido (multa 90-500€)', barcelona: '❌ Prohibido (cámaras automáticas)', otras: '❌ Prohibido en Zaragoza y Bilbao' },
      };

      const recomendaciones: Record<string, string> = {
        'CERO': 'Máxima categoría. Accedes a todos los beneficios ZBE, carril BUS+VAO y aparcamiento bonificado en muchos municipios.',
        'ECO': 'Buena etiqueta. Acceso sin restricciones en la mayoría de ZBE. Considera que las normativas se van endureciendo.',
        'C': 'Etiqueta válida. En episodios de contaminación alta pueden activarse restricciones adicionales en Madrid.',
        'B': 'Etiqueta limitada. Las ZBE se están endureciendo: en 2025-2026 la B puede quedar restringida en horario punta en más ciudades.',
        'Sin etiqueta': 'Tu vehículo ya no puede circular en las ZBE de las principales ciudades. Si lo usas habitualmente en zona urbana, valora la renovación.',
      };

      const iconos: Record<string, string> = { 'CERO': '🟢', 'ECO': '🔵', 'C': '🟡', 'B': '🟩', 'Sin etiqueta': '⬛' };
      const zbe = zbeData[etiqueta];

      const lineas = [
        `🏷️ **Etiqueta DGT: ${iconos[etiqueta]} ${etiqueta}**`,
        `   Vehículo: ${combustible} · Año matriculación: ${anioMatriculacion}`,
        ``,
        `🏙️ **Acceso a Zonas de Bajas Emisiones**`,
        `   • Madrid: ${zbe.madrid}`,
        `   • Barcelona: ${zbe.barcelona}`,
        `   • Valencia, Sevilla, Valladolid: ${zbe.otras}`,
        ``,
        `💡 ${recomendaciones[etiqueta]}`,
        ``,
        `⚠️ Normativa orientativa a 2025. Las restricciones concretas (horarios, episodios) varían por ciudad. Consulta el portal oficial de tu municipio.`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_profundidad_campo
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_profundidad_campo',
    'Calcula la profundidad de campo (DoF) para una combinación de focal, apertura, distancia y tipo de sensor. ' +
    'Devuelve la distancia hiperfocal, los límites near/far de enfoque nítido y una clasificación del bokeh. ' +
    'Útil para saber cuánto fondo quedará desenfocado o qué apertura usar en paisaje para máxima nitidez.',
    {
      focal_mm: z.number().positive()
        .describe('Focal de la lente en milímetros (ej. 50 para un 50mm, 85 para un 85mm)'),
      apertura: z.number().positive()
        .describe('Apertura del diafragma en valor f (ej. 2.8 para f/2.8, 8 para f/8)'),
      distancia_m: z.number().positive()
        .describe('Distancia de enfoque en metros (ej. 3 para 3 metros, 0.5 para 50 cm)'),
      sensor: z.enum(['ff', 'apsc15', 'apsc16', 'm43'])
        .describe(
          'Tipo de sensor: ' +
          'ff = Full Frame (35mm), ' +
          'apsc15 = APS-C Nikon/Sony (factor ×1,5), ' +
          'apsc16 = APS-C Canon (factor ×1,6), ' +
          'm43 = Micro 4/3 (factor ×2,0)'
        ),
    },
    { title: 'Calcula la profundidad de campo (DoF) para una combinación de', readOnlyHint: true },
    async ({ focal_mm, apertura, distancia_m, sensor }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_profundidad_campo', aiCaller);

      const r = calcularProfundidadCampo(focal_mm, apertura, distancia_m, sensor as TipoSensor);

      const dfTexto = r.dfEsInfinito ? 'infinito ∞' : `${r.dfM!.toFixed(2)} m`;
      const dofTexto = r.dfEsInfinito ? 'infinito ∞' : `${r.dofM!.toFixed(2)} m`;

      const texto = [
        `📷 **Profundidad de campo — ${focal_mm}mm f/${apertura} a ${distancia_m}m**`,
        ``,
        `📏 **Plano más cercano nítido:** ${r.dnM.toFixed(2)} m`,
        `📏 **Plano más lejano nítido:** ${dfTexto}`,
        `📐 **Profundidad de campo total:** ${dofTexto}`,
        `🔭 **Distancia hiperfocal:** ${r.hiperfocalM.toFixed(1)} m`,
        ``,
        `🎯 **Clasificación:** ${r.clasificacion}`,
      ].join('\n');

      return conAviso(texto, AVISO_TECNICO);
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_astrofoto_exposicion
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_astrofoto_exposicion',
    'Calcula el tiempo máximo de exposición sin estelas de estrellas para astrofotografía. ' +
    'Usa la fórmula NPF (precisa, tiene en cuenta pixel pitch y declinación) y la regla 500/300. ' +
    'Evalúa si el tiempo elegido producirá estrellas puntuales, microestelas o star trails.',
    {
      focal_mm: z.number().positive()
        .describe('Focal de la lente en milímetros (ej. 14 para un gran angular de 14mm)'),
      apertura: z.number().positive()
        .describe('Apertura del diafragma en valor f (ej. 2.8 para f/2.8)'),
      sensor: z.enum(['ff', 'apsc15', 'apsc16', 'm43'])
        .describe(
          'Tipo de sensor: ' +
          'ff = Full Frame, ' +
          'apsc15 = APS-C Nikon/Sony (×1,5), ' +
          'apsc16 = APS-C Canon (×1,6), ' +
          'm43 = Micro 4/3 (×2,0)'
        ),
      megapixeles: z.number().positive()
        .describe('Resolución del sensor en megapíxeles (ej. 24 para 24 MP, 45 para 45 MP)'),
      declinacion_grados: z.number().min(0).max(90)
        .describe(
          'Declinación de la zona del cielo en grados (0 = ecuador celeste, 90 = polo celeste). ' +
          'Para la Vía Láctea usa entre 0-30. Para Polaris usa ~89.'
        ),
      tiempo_elegido_s: z.number().positive()
        .describe('Tiempo de exposición que quieres evaluar, en segundos (ej. 20 para 20 segundos)'),
    },
    { title: 'Calcula el tiempo máximo de exposición sin estelas de estrellas', readOnlyHint: true },
    async ({ focal_mm, apertura, sensor, megapixeles, declinacion_grados, tiempo_elegido_s }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_astrofoto_exposicion', aiCaller);

      const r = calcularAstrofoto(focal_mm, apertura, sensor as TipoSensor, megapixeles, declinacion_grados, tiempo_elegido_s);

      const npfTexto = r.tiempoNPF_s !== null
        ? `${r.tiempoNPF_s.toFixed(1)} s`
        : 'N/A (zona polar — la declinación hace cos≈0)';

      const texto = [
        `🌟 **Astrofotografía — ${focal_mm}mm f/${apertura} · ${megapixeles} MP · Dec ${declinacion_grados}°**`,
        ``,
        `⏱️ **Tiempo máximo sin estelas (NPF):** ${npfTexto}`,
        `⏱️ **Regla 500:** ${r.tiempo500_s.toFixed(1)} s`,
        `⏱️ **Regla 300 (conservadora):** ${r.tiempo300_s.toFixed(1)} s`,
        ``,
        `🔍 **Pixel pitch:** ${r.pixelPitchUm.toFixed(2)} µm`,
        `📐 **Focal equivalente FF:** ${r.focalEquivalenteFF.toFixed(0)} mm`,
        ``,
        `📸 **Evaluación de ${tiempo_elegido_s}s:** ${r.descripcionVeredicto}`,
      ].join('\n');

      return conAviso(texto, AVISO_TECNICO);
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_exposicion_equivalente
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_exposicion_equivalente',
    'Calcula exposiciones fotográficas equivalentes variando uno de los tres parámetros del triángulo de exposición ' +
    '(ISO, apertura o velocidad de obturación) manteniendo el mismo valor de exposición (EV). ' +
    'Útil para adaptar la exposición a trípode, movimiento, ruido o bokeh sin cambiar la luz registrada.',
    {
      iso_base: z.number().positive()
        .describe('ISO de la exposición original (ej. 100, 400, 1600, 3200)'),
      apertura_base: z.number().positive()
        .describe('Apertura original en valor f (ej. 2.8 para f/2.8, 8 para f/8)'),
      obturador_base_s: z.number().positive()
        .describe(
          'Velocidad de obturación original en segundos ' +
          '(ej. 0.01 para 1/100s, 0.004 para 1/250s, 2 para 2 segundos)'
        ),
      parametro_fijo: z.enum(['iso', 'apertura', 'obturador'])
        .describe(
          'Parámetro que cambias tú manualmente (el sistema ajusta los otros para mantener EV): ' +
          'iso = cambias el ISO, ' +
          'apertura = cambias el diafragma, ' +
          'obturador = cambias la velocidad'
        ),
      nuevo_valor: z.number().positive()
        .describe(
          'Nuevo valor del parámetro elegido, en las mismas unidades: ' +
          'ISO sin unidades (ej. 800), f-number para apertura (ej. 5.6), segundos para obturador (ej. 0.002)'
        ),
    },
    { title: 'Calcula exposiciones fotográficas equivalentes variando uno de', readOnlyHint: true },
    async ({ iso_base, apertura_base, obturador_base_s, parametro_fijo, nuevo_valor }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_exposicion_equivalente', aiCaller);

      const r = calcularExposicionEquivalente(
        iso_base,
        apertura_base,
        obturador_base_s,
        parametro_fijo as ParametroFijo,
        nuevo_valor,
      );

      const obturadorBaseTexto = obturador_base_s < 1
        ? `1/${Math.round(1 / obturador_base_s)}s`
        : `${obturador_base_s}s`;

      const texto = [
        `📷 **Triángulo de exposición — Exposición equivalente**`,
        ``,
        `📊 **Exposición original:** ISO ${iso_base} · f/${apertura_base} · ${obturadorBaseTexto}`,
        ``,
        `✅ **Exposición equivalente:**`,
        `   • ISO: ${r.iso}`,
        `   • Apertura: f/${r.apertura}`,
        `   • Obturador: ${r.obturador_fraccion}`,
        ``,
        `📐 **Valor de Exposición (EV):** ${r.ev}`,
      ].join('\n');

      return conAviso(texto, AVISO_TECNICO);
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_prediccion_running
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_prediccion_running',
    'Predice el tiempo de carrera en cualquier distancia usando la fórmula Riegel (T2 = T1 × (D2/D1)^1.06). ' +
    'Devuelve el tiempo estimado, pace, velocidad y predicciones estándar para 5K, 10K, media maratón y maratón.',
    {
      distancia_base_km: z.number().positive()
        .describe('Distancia de referencia conocida en kilómetros (ej. 5 para un 5K, 10 para un 10K)'),
      tiempo_base_s: z.number().positive()
        .describe('Tiempo real en esa distancia en segundos (ej. 1500 para 25 minutos)'),
      distancia_objetivo_km: z.number().positive()
        .describe('Distancia para la que se quiere predecir el tiempo en kilómetros (ej. 42.195 para maratón)'),
    },
    { title: 'Predice el tiempo de carrera en cualquier distancia usando la', readOnlyHint: true },
    async ({ distancia_base_km, tiempo_base_s, distancia_objetivo_km }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_prediccion_running', aiCaller);

      const r = calcularPrediccionRunning(distancia_base_km, tiempo_base_s, distancia_objetivo_km);

      const lineas = [
        `🏃 **Predictor de Tiempos de Running — Fórmula Riegel**`,
        ``,
        `📊 **Referencia:** ${distancia_base_km} km en ${Math.floor(tiempo_base_s/60)}min ${tiempo_base_s%60}s`,
        ``,
        `🎯 **Estimación para ${distancia_objetivo_km} km:**`,
        `   • Tiempo: **${r.tiempoFormateado}**`,
        `   • Pace: **${r.paceFormateado}**`,
        `   • Velocidad: ${r.velocidad_km_h} km/h`,
        ``,
        `📈 **Predicciones para distancias estándar:**`,
        ...r.prediccionesEstandar.map(p => `   • ${p.nombre}: ${p.tiempoFormateado} (${p.paceFormateado})`),
      ];
      if (r.advertencia) lineas.push(``, `⚠️ ${r.advertencia}`);

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_zonas_cardiacas
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_zonas_cardiacas',
    'Calcula las 5 zonas de frecuencia cardíaca personalizadas con la fórmula de Karvonen. ' +
    'Más precisa que el simple % FCmáx porque tiene en cuenta la FC en reposo. ' +
    'Devuelve los rangos de pulsaciones para cada zona y su beneficio de entrenamiento.',
    {
      edad: z.number().positive()
        .describe('Edad en años'),
      fc_reposo: z.number().positive()
        .describe('Frecuencia cardíaca en reposo en ppm (medida por la mañana antes de levantarse)'),
      fc_maxima: z.number().positive().optional()
        .describe('FCmáx medida en un test de esfuerzo en ppm. Opcional: si no se indica, se estima con 220−edad'),
    },
    { title: 'Calcula las 5 zonas de frecuencia cardíaca personalizadas con la', readOnlyHint: true },
    async ({ edad, fc_reposo, fc_maxima }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_zonas_cardiacas', aiCaller);

      const r = calcularZonasCardiacas(edad, fc_reposo, fc_maxima);

      const fcNote = r.fcMaxEstimada
        ? `FCmáx ${r.fcMax} ppm (estimada con 220−${edad} — ±10-20 ppm, medir en test para mayor precisión)`
        : `FCmáx ${r.fcMax} ppm (valor introducido)`;

      const lineas = [
        `💓 **Zonas Cardíacas — Karvonen · ${edad} años · FC reposo ${fc_reposo} ppm**`,
        ``,
        `📊 ${fcNote}`,
        `📊 FC reserva: ${r.fcReserva} ppm`,
        ``,
        `🎯 **Tus 5 zonas de entrenamiento:**`,
        ...r.zonas.map(z =>
          `   Z${z.zona} ${z.nombre}: **${z.fcMin}–${z.fcMax} ppm** (${z.porcentajeMin}–${z.porcentajeMax}%) — ${z.beneficioPrincipal}`
        ),
      ];

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_1rm_gimnasio
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_1rm_gimnasio',
    'Calcula la repetición máxima (1RM) en cualquier ejercicio de fuerza usando las fórmulas Epley y Brzycki. ' +
    'Devuelve el 1RM estimado y una tabla de cargas de entrenamiento por porcentaje.',
    {
      peso_kg: z.number().positive()
        .describe('Peso levantado en kilogramos'),
      repeticiones: z.number().int().positive()
        .describe('Número de repeticiones completadas con ese peso (idealmente 1-12 para mayor precisión)'),
    },
    { title: 'Calcula la repetición máxima (1RM) en cualquier ejercicio de', readOnlyHint: true },
    async ({ peso_kg, repeticiones }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_1rm_gimnasio', aiCaller);

      const r = calcular1RM(peso_kg, repeticiones);

      const lineas = [
        `🏋️ **1RM (Repetición Máxima) — ${peso_kg} kg × ${repeticiones} reps**`,
        ``,
        `📊 **Estimaciones:**`,
        `   • Epley:  ${r.epley} kg`,
        `   • Brzycki: ${r.brzycki} kg`,
        `   • **Media: ${r.media} kg** ← referencia recomendada`,
        ``,
        `📈 **Tabla de cargas de entrenamiento:**`,
        ...r.tablaPorcentajes.map(t =>
          `   ${t.porcentaje}% → **${t.peso_kg} kg** (~${t.repsAproximadas} reps)`
        ),
      ];
      if (r.advertencia) lineas.push(``, `⚠️ ${r.advertencia}`);

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_potencia_ciclismo
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_potencia_ciclismo',
    'Analiza el rendimiento en ciclismo: ratio W/kg con nivel, 6 zonas de entrenamiento basadas en FTP ' +
    'y opcionalmente VAM (velocidad ascensional media) para subidas cronometradas.',
    {
      peso_kg: z.number().positive()
        .describe('Peso del ciclista en kilogramos'),
      ftp_w: z.number().positive()
        .describe('FTP (Functional Threshold Power) en vatios: potencia máxima sostenible durante 1 hora'),
      desnivel_m: z.number().positive().optional()
        .describe('Desnivel positivo de una subida en metros (para calcular VAM). Opcional'),
      tiempo_min: z.number().positive().optional()
        .describe('Tiempo empleado en subir ese desnivel en minutos (para calcular VAM). Opcional'),
    },
    { title: 'Analiza el rendimiento en ciclismo', readOnlyHint: true },
    async ({ peso_kg, ftp_w, desnivel_m, tiempo_min }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_potencia_ciclismo', aiCaller);

      const r = calcularPotenciaCiclismo(peso_kg, ftp_w, desnivel_m, tiempo_min);

      const lineas = [
        `🚴 **Potencia en Ciclismo — ${ftp_w} W · ${peso_kg} kg**`,
        ``,
        `⚡ **Ratio W/kg: ${r.wattsKg}** → ${r.nivelWattsKg} (${r.descripcionNivel})`,
      ];

      if (r.vam !== null) {
        lineas.push(`🏔️ **VAM: ${r.vam} m/h** → ${r.nivelVam}`);
      }

      lineas.push(``, `📊 **Zonas de entrenamiento (basadas en FTP ${ftp_w} W):**`);
      r.zonasPotencia.forEach(z => {
        lineas.push(`   ${z.zona} ${z.nombre}: ${z.wattsMin}–${z.wattsMax} W (${z.porcentajeFTP})`);
      });

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_pace_running
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_pace_running',
    'Calcula el pace (ritmo por kilómetro), velocidad media, splits por km y proyecciones para ' +
    '5K, 10K, media maratón y maratón a ese mismo ritmo.',
    {
      distancia_km: z.number().positive()
        .describe('Distancia recorrida en kilómetros (ej. 10 para un 10K)'),
      tiempo_s: z.number().positive()
        .describe('Tiempo empleado en segundos (ej. 3000 para 50 minutos)'),
    },
    { title: 'Calcula el pace (ritmo por kilómetro), velocidad media, splits', readOnlyHint: true },
    async ({ distancia_km, tiempo_s }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_pace_running', aiCaller);

      const r = calcularPaceRunning(distancia_km, tiempo_s);
      const totalMin = Math.floor(tiempo_s / 60);
      const totalSec = tiempo_s % 60;

      const lineas = [
        `⏱️ **Pace de Running — ${distancia_km} km en ${totalMin}min ${totalSec}s**`,
        ``,
        `🏃 **Pace: ${r.paceFormateado}**`,
        `⚡ Velocidad: ${r.velocidad_km_h} km/h`,
        ``,
        `📊 **Proyecciones a este ritmo:**`,
        ...r.proyecciones.map(p => `   • ${p.nombre}: ${p.tiempoFormateado}`),
      ];

      if (r.splits.length > 0) {
        const splitsMostrar = r.splits.slice(0, Math.min(5, r.splits.length));
        lineas.push(``, `📈 **Primeros splits (tiempo acumulado):**`);
        splitsMostrar.forEach(s => lineas.push(`   • Km ${s.km}: ${s.tiempoFormateado}`));
        if (r.splits.length > 5) lineas.push(`   ... (${r.splits.length} splits totales disponibles en la app)`);
      }

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_swolf_natacion
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_swolf_natacion',
    'Calcula el índice SWOLF (segundos + brazadas por largo) como medida de eficiencia en natación. ' +
    'Clasifica el nivel del nadador y proporciona consejo de mejora técnica. Compatible con piscinas de 25m y 50m.',
    {
      tiempo_s_largo: z.number().positive()
        .describe('Tiempo por largo en segundos (ej. 20 para nadar 25m en 20 segundos)'),
      brazadas_largo: z.number().int().positive()
        .describe('Número de brazadas por largo'),
      metros_largo: z.number().int().optional()
        .describe('Longitud del largo en metros: 25 (defecto) o 50'),
    },
    { title: 'Calcula el índice SWOLF (segundos + brazadas por largo) como', readOnlyHint: true },
    async ({ tiempo_s_largo, brazadas_largo, metros_largo }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_swolf_natacion', aiCaller);

      const metrosPiscina = metros_largo ?? 25;
      const r = calcularSWOLF(tiempo_s_largo, brazadas_largo, metrosPiscina);

      const nivelEmoji: Record<string, string> = {
        elite: '🥇', avanzado: '🥈', intermedio: '🥉', principiante: '🎽',
      };

      const lineas = [
        `🏊 **SWOLF — Eficiencia en Natación (piscina ${metrosPiscina}m)**`,
        ``,
        `📊 **${tiempo_s_largo}s + ${brazadas_largo} brazadas = SWOLF ${r.swolf}**`,
        `${nivelEmoji[r.nivel]} **Nivel: ${r.eficiencia}** — ${r.descripcionNivel}`,
        `⚡ Velocidad: ${r.velocidadMedia_min100m}`,
        ``,
        `💡 **Consejo:** ${r.consejo}`,
      ];

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_regla_180_video
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_regla_180_video',
    'Calcula la velocidad de obturación correcta para vídeo según la regla de los 180°. ' +
    'El obturador debe ser el doble del frame rate para conseguir motion blur natural. ' +
    'Devuelve el obturador recomendado y una tabla con todos los fps comunes.',
    {
      fps: z.number().positive()
        .describe('Frame rate de grabación (ej. 24, 25, 30, 50, 60, 120, 240)'),
    },
    { title: 'Calcula la velocidad de obturación correcta para vídeo según la', readOnlyHint: true },
    async ({ fps }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_regla_180_video', aiCaller);

      const r = calcularRegla180(fps);
      const tabla = r.fps_alternativos.slice(0, 8).map(f => `   ${f.fps} fps → ${f.obturador}`).join('\n');

      const texto = [
        `🎬 **Regla de los 180° — ${fps} fps**`,
        ``,
        `✅ **Obturador recomendado: ${r.obturadorFormateado}**`,
        ``,
        r.descripcion,
        ``,
        `📊 **Referencia rápida:**`,
        tabla,
      ].join('\n');

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_camara_lenta
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_camara_lenta',
    'Calcula el factor de ralentización de un vídeo slow motion a partir de los fps de grabación y reproducción. ' +
    'Devuelve el multiplicador (ej. 4×), el obturador correcto según la regla 180° y la duración del clip ralentizado.',
    {
      fps_grabacion: z.number().positive()
        .describe('FPS a los que se graba (ej. 60, 120, 240, 960)'),
      fps_reproduccion: z.number().positive()
        .describe('FPS a los que se reproducirá (ej. 24, 25, 30)'),
      duracion_grabacion_s: z.number().positive().optional()
        .describe('Duración del clip grabado en segundos. Opcional: si se indica, calcula la duración ralentizada'),
    },
    { title: 'Calcula el factor de ralentización de un vídeo slow motion a', readOnlyHint: true },
    async ({ fps_grabacion, fps_reproduccion, duracion_grabacion_s }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_camara_lenta', aiCaller);

      const r = calcularCamaraLenta(fps_grabacion, fps_reproduccion, duracion_grabacion_s);

      const lineas = [
        `🐢 **Slow Motion — ${fps_grabacion} fps grabación → ${fps_reproduccion} fps reproducción**`,
        ``,
        `🎯 **Factor de ralentización: ${r.factor_lentitud}×** — ${r.nivel}`,
        `📷 Obturador durante la grabación: **${r.obturador_grabacion}** (regla 180°)`,
      ];
      if (r.duracion_resultado_s !== null) {
        lineas.push(`⏱️ Duración resultado: **${r.duracion_resultado_s}s** (${duracion_grabacion_s}s grabados × ${r.factor_lentitud})`);
      }
      lineas.push(``, r.descripcion);

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_filtro_nd_video
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_filtro_nd_video',
    'Calcula qué filtro ND necesitas para cumplir la regla de los 180° en exteriores. ' +
    'Introduce el frame rate y la velocidad de obturación actual para obtener las paradas exactas ' +
    'y el filtro recomendado de la gama ND2–ND1000.',
    {
      fps: z.number().positive()
        .describe('Frame rate de grabación (ej. 25, 30, 60)'),
      obturador_actual_s: z.number().positive()
        .describe('Velocidad de obturación actual en segundos (ej. 0.002 para 1/500, 0.004 para 1/250)'),
    },
    { title: 'Calcula qué filtro ND necesitas para cumplir la regla de los 180°', readOnlyHint: true },
    async ({ fps, obturador_actual_s }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_filtro_nd_video', aiCaller);

      const r = calcularFiltroNDVideo(fps, obturador_actual_s);

      const lineas = [
        `🔲 **Filtro ND para Vídeo — ${fps} fps · obturador actual ${r.obturadorActual}**`,
        ``,
        `🎯 Obturador objetivo (regla 180°): **${r.obturadorObjetivo}**`,
        ``,
        r.recomendacion,
      ];

      if (r.necesitaND) {
        lineas.push(``, `📊 **Opciones disponibles:**`);
        r.opciones.forEach(o => {
          const marca = o.recomendado ? ' ★ RECOMENDADO' : '';
          lineas.push(`   ${o.denominacion} (${o.paradas} stops) → ${o.obturadorResultante}${marca}`);
        });
      }

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_bitrate_video
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_bitrate_video',
    'Estima el bitrate necesario y el tamaño de archivo de un vídeo según resolución, fps, duración y códec. ' +
    'Incluye comparativa entre H.264, H.265, ProRes 422 y RAW.',
    {
      resolucion: z.enum(['480p', '720p', '1080p', '2k', '4k', '8k'])
        .describe('Resolución del vídeo'),
      fps: z.number().positive()
        .describe('Frame rate (ej. 24, 30, 60, 120)'),
      duracion_min: z.number().positive()
        .describe('Duración del vídeo en minutos'),
      codec: z.enum(['h264', 'h265', 'prores422', 'raw']).optional()
        .describe('Códec de vídeo. Por defecto h264'),
    },
    { title: 'Estima el bitrate necesario y el tamaño de archivo de un vídeo', readOnlyHint: true },
    async ({ resolucion, fps, duracion_min, codec }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_bitrate_video', aiCaller);

      const codecUsado = (codec ?? 'h264') as TipoCodecVideo;
      const r = calcularBitrateVideo(resolucion as TipoResolucionVideo, fps, duracion_min, codecUsado);

      const codecs: TipoCodecVideo[] = ['h264', 'h265', 'prores422', 'raw'];
      const comparativa = codecs.map(c => {
        const rc = calcularBitrateVideo(resolucion as TipoResolucionVideo, fps, duracion_min, c);
        return `   ${c.toUpperCase().padEnd(10)} ${rc.bitrate_mbps} Mbps → ${rc.tamano_formateado}`;
      });

      const texto = [
        `💾 **Bitrate y Tamaño de Vídeo — ${resolucion} · ${fps} fps · ${duracion_min} min**`,
        ``,
        `📊 **${codecUsado.toUpperCase()}: ${r.bitrate_mbps} Mbps → ${r.tamano_formateado}**`,
        ``,
        `📈 **Comparativa de códecs:**`,
        ...comparativa,
      ].join('\n');

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_fov_video
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_fov_video',
    'Calcula el ángulo de campo (FOV) horizontal, vertical y diagonal para una focal y sensor dados. ' +
    'Incluye comparativa entre Full Frame, APS-C y Micro 4/3 con el focal equivalente en 35mm.',
    {
      focal_mm: z.number().positive()
        .describe('Focal del objetivo en milímetros (ej. 24, 35, 50, 85)'),
      sensor: z.enum(['ff', 'apsc15', 'apsc16', 'm43']).optional()
        .describe('Tipo de sensor: ff = Full Frame, apsc15 = APS-C Nikon/Sony, apsc16 = APS-C Canon, m43 = Micro 4/3. Por defecto ff'),
    },
    { title: 'Calcula el ángulo de campo (FOV) horizontal, vertical y diagonal', readOnlyHint: true },
    async ({ focal_mm, sensor }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_fov_video', aiCaller);

      const sensorUsado = (sensor ?? 'ff') as TipoSensor;
      const r = calcularFOVVideo(focal_mm, sensorUsado);

      const lineas = [
        `📐 **Ángulo de Campo (FOV) — ${focal_mm}mm en ${r.sensorNombre}**`,
        ``,
        `🎯 **FOV horizontal: ${r.fov_horizontal_deg}°** — ${r.clasificacion}`,
        `   FOV vertical: ${r.fov_vertical_deg}° · Diagonal: ${r.fov_diagonal_deg}°`,
        `   Focal equivalente FF: ${r.focalEquivalenteFF}mm`,
        ``,
        `📊 **Comparativa de sensores con ${focal_mm}mm:**`,
        ...r.comparativa.map(c => `   ${c.nombre.padEnd(28)} ${c.fov_h}° horizontal (equiv. ${c.focal_eq_ff}mm FF)`),
      ].join('\n');

      return { content: [{ type: 'text', text: lineas }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOLS: Cocina Técnica
  // ------------------------------------------------------------------

  // TOOL: calcular_porcentaje_panadero
  servidor.tool(
    'calcular_porcentaje_panadero',
    "Calcula el porcentaje del panadero (baker's percentage) para una receta. " +
    'La harina siempre es 100%; cada ingrediente se expresa como % de su peso. ' +
    'Detecta el agua automáticamente para calcular la hidratación.',
    {
      harina_g: z.number().positive()
        .describe('Peso de la harina en gramos (siempre 100% en el sistema del panadero).'),
      ingredientes: z.array(z.object({
        nombre: z.string().describe('Nombre del ingrediente (agua, sal, levadura, mantequilla...).'),
        gramos: z.number().positive().describe('Peso del ingrediente en gramos.'),
      })).describe('Lista de ingredientes además de la harina.'),
      peso_porcion_g: z.number().positive().optional()
        .describe('Peso de cada pieza/porción en gramos. Opcional: calcula el número de porciones.'),
    },
    { title: 'calcular_porcentaje_panadero', readOnlyHint: true },
    async ({ harina_g, ingredientes, peso_porcion_g }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_porcentaje_panadero', aiCaller);

      const r = calcularBakersPercentage(harina_g, ingredientes, peso_porcion_g);

      const lineas = [
        `🥖 **Porcentaje del Panadero — ${harina_g}g harina (100%)**`,
        ``,
        `📊 **Ingredientes:**`,
        ...r.ingredientes.map(i => `   ${i.nombre.padEnd(22)} ${i.gramos}g = **${i.porcentajePanadero}%**`),
        ``,
        `💧 **Hidratación: ${r.hidratacion_pct}%** (agua/harina)`,
        `⚖️ Peso total de masa: ${r.pesoMasa_g}g`,
        ...(r.rendimiento_porciones !== undefined ? [`🍞 Porciones (~${peso_porcion_g}g/ud.): **${r.rendimiento_porciones}**`] : []),
        ``,
        `ℹ️ El % del panadero siempre usa la harina como 100% — no el peso total de la masa.`,
      ].join('\n');

      return { content: [{ type: 'text', text: lineas }] };
    }
  );

  // TOOL: calcular_hidratacion_pan
  servidor.tool(
    'calcular_hidratacion_pan',
    'Calcula la hidratación de una masa de pan o los gramos de agua necesarios para una hidratación objetivo. ' +
    'Bidireccional: agua→% o %→agua. Clasifica la hidratación y da ejemplos de panes típicos.',
    {
      modo: z.enum(['calcular_porcentaje', 'calcular_agua']).optional()
        .describe('calcular_porcentaje: da harina_g + agua_g → devuelve %. calcular_agua: da harina_g + hidratacion_pct → devuelve gramos de agua. Por defecto calcular_porcentaje.'),
      harina_g: z.number().positive().describe('Peso de la harina en gramos.'),
      agua_g: z.number().positive().optional().describe('Gramos de agua. Requerido si modo=calcular_porcentaje.'),
      hidratacion_pct: z.number().positive().optional().describe('Porcentaje de hidratación objetivo. Requerido si modo=calcular_agua.'),
    },
    { title: 'Calcula la hidratación de una masa de pan o los gramos de agua', readOnlyHint: true },
    async ({ modo, harina_g, agua_g, hidratacion_pct }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_hidratacion_pan', aiCaller);

      const modoEfectivo: ModoHidratacion = modo ?? 'calcular_porcentaje';
      const valorInput = modoEfectivo === 'calcular_porcentaje' ? (agua_g ?? 0) : (hidratacion_pct ?? 0);
      const r = calcularHidratacionPan(modoEfectivo, harina_g, valorInput);

      const lineas = [
        `💧 **Hidratación del Pan**`,
        ``,
        `🌾 Harina: ${r.harina_g}g | 💦 Agua: **${r.agua_g}g** | Hidratación: **${r.hidratacion_pct}%**`,
        ``,
        `📊 **Clasificación: ${r.clasificacion}**`,
        `   ${r.descripcion}`,
        ``,
        `🍞 Panes típicos: ${r.ejemplos.join(' · ')}`,
      ].join('\n');

      return { content: [{ type: 'text', text: lineas }] };
    }
  );

  // TOOL: calcular_sustitucion_masa_madre
  servidor.tool(
    'calcular_sustitucion_masa_madre',
    'Calcula cuánta masa madre activa usar para sustituir levadura fresca, seca o instantánea. ' +
    'Incluye el ajuste de harina y agua que hay que restar de la receta para compensar lo que aporta la masa madre.',
    {
      tipo_levadura: z.enum(['fresca', 'seca', 'instantanea']).optional()
        .describe('Tipo de levadura de la receta original. Por defecto seca.'),
      levadura_g: z.number().positive().describe('Gramos de levadura que pide la receta.'),
      hidratacion_mm_pct: z.number().positive().optional()
        .describe('Hidratación de tu masa madre en % (agua/harina × 100). Por defecto 100 (igual de harina que agua).'),
    },
    { title: 'Calcula cuánta masa madre activa usar para sustituir levadura', readOnlyHint: true },
    async ({ tipo_levadura, levadura_g, hidratacion_mm_pct }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_sustitucion_masa_madre', aiCaller);

      const tipo: TipoLevaduraOrigen = tipo_levadura ?? 'seca';
      const r = calcularSustitucionMasaMadre(tipo, levadura_g, hidratacion_mm_pct ?? 100);

      const lineas = [
        `🦠 **Sustitución de Levadura por Masa Madre**`,
        ``,
        `🔄 Levadura original: ${r.levadura_original_g}g (${r.levadura_original_tipo})`,
        `→ **Masa madre necesaria: ${r.masa_madre_g}g** (hidratación ${r.hidratacion_mm_pct}%)`,
        ``,
        `📋 **Ajuste de receta:**`,
        `   Restar harina: ${r.harina_restar_g}g`,
        `   Restar agua: ${r.agua_restar_g}g`,
        ``,
        `⏱️ **Fermentación**: ${r.tiempo_fermentacion}`,
      ].join('\n');

      return { content: [{ type: 'text', text: lineas }] };
    }
  );

  // TOOL: calcular_temperatura_masa
  servidor.tool(
    'calcular_temperatura_masa',
    'Calcula la temperatura exacta del agua de amasado para alcanzar la DDT (Desired Dough Temperature). ' +
    'Usa la fórmula T_agua = DDT×3 − T_ambiente − T_harina − T_fricción, con variante de 4 factores si hay preferment.',
    {
      ddt_objetivo_c: z.number().optional()
        .describe('Temperatura final deseada de la masa en °C. Típico: 23-25°C para masa madre, 26-28°C para levadura comercial. Por defecto 24°C.'),
      t_ambiente_c: z.number()
        .describe('Temperatura ambiente de la cocina en °C.'),
      t_harina_c: z.number().optional()
        .describe('Temperatura de la harina en °C. Si no se indica, se asume igual a la temperatura ambiente.'),
      tipo_amasadora: z.enum(['manual', 'kitchen_aid', 'amasadora_espiral', 'thermomix']).optional()
        .describe('Tipo de amasado (cada uno genera distinta fricción). Por defecto manual.'),
      t_preferment_c: z.number().optional()
        .describe('Temperatura del preferment (poolish, levain, biga) si la receta lo usa. Activa la fórmula de 4 factores.'),
    },
    { title: 'Calcula la temperatura exacta del agua de amasado para alcanzar', readOnlyHint: true },
    async ({ ddt_objetivo_c, t_ambiente_c, t_harina_c, tipo_amasadora, t_preferment_c }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_temperatura_masa', aiCaller);

      const ddt = ddt_objetivo_c ?? 24;
      const tHarina = t_harina_c ?? t_ambiente_c;
      const tipoAmas: TipoAmasadora = tipo_amasadora ?? 'manual';
      const r = calcularDDT(ddt, t_ambiente_c, tHarina, tipoAmas, t_preferment_c);

      const lineas = [
        `🌡️ **DDT — Temperatura de la Masa**`,
        ``,
        `🎯 Temperatura objetivo de la masa: ${r.ddt_objetivo_c}°C`,
        `🔧 Amasadora: ${r.factorFricion_descripcion} (+${r.t_friccion_c}°C fricción)`,
        ``,
        `💧 **Temperatura del agua recomendada: ${r.temperatura_agua_c}°C (${r.temperatura_agua_f}°F)**`,
        ``,
        `💡 ${r.interpretacion}`,
        ...(r.advertencia ? [`⚠️ ${r.advertencia}`] : []),
      ].join('\n');

      return { content: [{ type: 'text', text: lineas }] };
    }
  );

  // TOOL: calcular_puntos_azucar
  servidor.tool(
    'calcular_puntos_azucar',
    'Identifica la fase de cocción del azúcar según la temperatura en °C: almíbar ligero, bola blanda, ' +
    'bola firme, bola dura, caramelo blando, caramelo duro, caramelo rubio, caramelo oscuro. ' +
    'Incluye usos típicos y prueba del vaso de agua fría.',
    {
      temperatura_c: z.number()
        .describe('Temperatura del almíbar en °C medida con termómetro de cocina. Rango útil: 100–200°C.'),
    },
    { title: 'Identifica la fase de cocción del azúcar según la temperatura en', readOnlyHint: true },
    async ({ temperatura_c }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_puntos_azucar', aiCaller);

      const r = calcularPuntosAzucar(temperatura_c);

      const lineas = r.fase ? [
        `🍬 **Puntos del Azúcar — ${temperatura_c}°C (${r.temperatura_f}°F)**`,
        ``,
        `✅ **Fase actual: ${r.fase.nombre}** (${r.fase.nombre_en})`,
        `   Rango: ${r.fase.temp_min_c}–${r.fase.temp_max_c}°C`,
        `   ${r.fase.descripcion}`,
        ``,
        `🍴 Usos típicos: ${r.fase.usosTipicos.join(', ')}`,
        `🧪 Prueba agua fría: ${r.fase.prueba_agua_fria}`,
        ...(r.fase_siguiente ? [``, `⏭️ Siguiente: ${r.fase_siguiente.nombre} (desde ${r.fase_siguiente.temp_min_c}°C)`] : []),
        ...(r.advertencia ? [``, `⚠️ ${r.advertencia}`] : []),
      ] : [
        `🍬 **${temperatura_c}°C** — Temperatura entre fases`,
        ...(r.fase_anterior ? [`⬅️ Fase anterior: ${r.fase_anterior.nombre} (hasta ${r.fase_anterior.temp_max_c}°C)`] : []),
        ...(r.fase_siguiente ? [`➡️ Siguiente fase: ${r.fase_siguiente.nombre} (desde ${r.fase_siguiente.temp_min_c}°C)`] : []),
        ...(r.advertencia ? [``, `⚠️ ${r.advertencia}`] : []),
      ];

      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // TOOL: calcular_sustitucion_gelatina
  servidor.tool(
    'calcular_sustitucion_gelatina',
    'Convierte entre tipos de gelatina según el bloom strength: hojas de bronce (120), plata (160), ' +
    'oro (200, estándar europeo), platino (250), gelatina en polvo 200/250 bloom y agar-agar. ' +
    'Devuelve la tabla completa de equivalencias en gramos y hojas.',
    {
      tipo_origen: z.enum(['hoja_bronce', 'hoja_plata', 'hoja_oro', 'hoja_platino', 'polvo_200', 'polvo_250', 'agar_agar'])
        .describe('Tipo de gelatina que tienes o que indica la receta. hoja_oro es la más común en supermercados.'),
      cantidad: z.number().positive()
        .describe('Cantidad a convertir (en gramos u hojas según la unidad).'),
      unidad: z.enum(['gramos', 'hojas']).optional()
        .describe('Unidad de medida. hojas solo aplica para tipos hoja_*. Por defecto gramos.'),
    },
    { title: 'Convierte entre tipos de gelatina según el bloom strength', readOnlyHint: true },
    async ({ tipo_origen, cantidad, unidad }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_sustitucion_gelatina', aiCaller);

      const tipoG: TipoGelatina = tipo_origen;
      const r = calcularSustitucionGelatina(tipoG, cantidad, unidad ?? 'gramos');

      const origen = r.origen.hojas
        ? `${r.origen.hojas} hojas (${r.origen.cantidad_g}g)`
        : `${r.origen.cantidad_g}g`;

      const lineas = [
        `🟡 **Sustitución de Gelatina — ${origen} de ${r.origen.nombre}**`,
        ``,
        `📊 **Equivalencias:**`,
        ...r.equivalentes.map(e => {
          const cant = e.hojas ? `${e.hojas} hojas (${e.cantidad_g}g)` : `${e.cantidad_g}g`;
          return `   ${e.nombre.padEnd(35)} → **${cant}**`;
        }),
        ...(r.advertencia_agar ? [``, `⚠️ ${r.advertencia_agar}`] : []),
      ].join('\n');

      return { content: [{ type: 'text', text: lineas }] };
    }
  );

  // TOOL: calcular_ganache
  servidor.tool(
    'calcular_ganache',
    'Calcula las proporciones exactas de chocolate y nata para un ganache según el tipo de chocolate ' +
    '(negro extra/negro/semi-fondant/con leche/blanco) y la textura deseada (glaseado/trufa/firme). ' +
    'El ratio se ajusta automáticamente al porcentaje de cacao.',
    {
      tipo_chocolate: z.enum(['negro_extra', 'negro', 'semi_fondant', 'con_leche', 'blanco']).optional()
        .describe('negro_extra >70% | negro 55-70% | semi_fondant 40-55% | con_leche 28-40% | blanco 0% cacao. Por defecto negro.'),
      textura: z.enum(['glaseado', 'trufa', 'firme']).optional()
        .describe('glaseado: fluido para tartas/eclairs | trufa: para bolear trufas y rellenar bombones | firme: muy denso para modelar. Por defecto trufa.'),
      total_g: z.number().positive().optional()
        .describe('Gramos totales de ganache a preparar. Por defecto 200g.'),
    },
    { title: 'Calcula las proporciones exactas de chocolate y nata para un', readOnlyHint: true },
    async ({ tipo_chocolate, textura, total_g }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_ganache', aiCaller);

      const tipoChoc: TipoChocolate = tipo_chocolate ?? 'negro';
      const tex: TexturaGanache = textura ?? 'trufa';
      const r = calcularGanache(tipoChoc, tex, total_g ?? 200);

      const lineas = [
        `🍫 **Ganache de Chocolate — ${r.total_g}g total (${r.textura})**`,
        ``,
        `🍫 Tipo: ${r.tipo_chocolate.replace('_', ' ')} (${r.porcentaje_cacao})`,
        ``,
        `📊 **Proporciones:**`,
        `   🍫 Chocolate: **${r.chocolate_g}g**`,
        `   🥛 Nata: **${r.nata_g}g**`,
        `   📐 ${r.ratio_texto}`,
        ``,
        `🌡️ Temperatura de trabajo: ${r.temperatura_trabajo_c}`,
        ``,
        `✨ Usos: ${r.usos.join(' · ')}`,
        `📝 Nota: ${r.nota}`,
      ].join('\n');

      return { content: [{ type: 'text', text: lineas }] };
    }
  );

  // TOOL: escalar_receta
  servidor.tool(
    'escalar_receta',
    'Escala una receta a más o menos raciones. Aplica factor no lineal para levadura, ' +
    'polvo de hornear y especias. Redondea cantidades de forma práctica según la unidad. ' +
    'La temperatura del horno no cambia; indica si el tiempo necesita ajuste.',
    {
      raciones_original: z.number().positive()
        .describe('Número de raciones/porciones de la receta original.'),
      raciones_nueva: z.number().positive()
        .describe('Número de raciones/porciones que quieres obtener.'),
      ingredientes: z.array(z.object({
        nombre: z.string().describe('Nombre del ingrediente.'),
        cantidad: z.number().positive().describe('Cantidad en la receta original.'),
        unidad: z.string().describe('Unidad: g, kg, ml, l, cucharada, cucharadita, etc.'),
        categoria: z.enum(['normal', 'levadura', 'impulsores', 'sal', 'especias']).optional()
          .describe('Categoría para escala: levadura e impulsores no escalan linealmente. Por defecto normal.'),
      })).describe('Lista de ingredientes de la receta original.'),
    },
    { title: 'Escala una receta a más o menos raciones', readOnlyHint: true },
    async ({ raciones_original, raciones_nueva, ingredientes }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('escalar_receta', aiCaller);

      const ings = ingredientes.map(i => ({
        nombre: i.nombre,
        cantidad: i.cantidad,
        unidad: i.unidad,
        categoria: i.categoria as CategoriaIngrediente | undefined,
      }));
      const r = escalarReceta(raciones_original, raciones_nueva, ings);

      const lineas = [
        `⚖️ **Escalador de Recetas — ${raciones_original} → ${raciones_nueva} raciones (×${r.factor_escala})**`,
        ``,
        `📋 **Ingredientes ajustados:**`,
        ...r.ingredientes.map(i => {
          const ajuste = i.nota ? ' ⚠️' : '';
          return `   ${i.nombre.padEnd(22)} ${i.cantidad_original}${i.unidad} → **${i.cantidad_redondeada}**${ajuste}`;
        }),
        ``,
        `🔥 ${r.nota_horno}`,
        ...(r.advertencias.length > 0 ? [``, ...r.advertencias.map(a => `⚠️ ${a}`)] : []),
        ...(r.ingredientes.some(i => i.nota) ? [``, `📝 Notas de ajuste:`, ...r.ingredientes.filter(i => i.nota).map(i => `   • ${i.nombre}: ${i.nota}`)] : []),
      ].join('\n');

      return { content: [{ type: 'text', text: lineas }] };
    }
  );

  return servidor;
}

// ---------------------------------------------------------------------------
// Handler Next.js App Router — stateless (una instancia por petición)
// ---------------------------------------------------------------------------
async function handler(req: Request): Promise<Response> {
  // El contexto del cliente queda disponible para registrarUsoMCP
  // durante toda la ejecución de la petición (incluidas las tools).
  return contextoCliente.run(extraerCliente(req), async () => {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless: sin gestión de sesión
      enableJsonResponse: true,      // respuesta JSON simple (sin SSE)
    });

    const servidor = crearServidorMCP();
    await servidor.connect(transport);

    return transport.handleRequest(req);
  });
}

// GET abre SSE stream — incompatible con Vercel serverless (timeout). Devolver 405
// per spec MCP: servidores PUEDEN no soportar GET. Clientes deben usar POST.
export const GET = async () => new Response(
  JSON.stringify({ error: 'SSE not supported. Use POST for all MCP requests.' }),
  { status: 405, headers: { 'Content-Type': 'application/json', 'Allow': 'POST, DELETE, OPTIONS' } }
);
export const POST    = handler;
export const DELETE  = handler;
export const OPTIONS = async () => new Response(null, { status: 204 });
