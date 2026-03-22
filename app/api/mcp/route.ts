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
import { calcularCosteAplazado } from '@/lib/calculadoras/costeAplazado';
import { calcularROIMarketing, type CanalMarketing } from '@/lib/calculadoras/roiMarketing';
import { calcularGastoEnergetico, type Electrodomestico } from '@/lib/calculadoras/gastoEnergetico';
import { convertirEdadMascota, type TipoMascota, type TamanoPerro } from '@/lib/calculadoras/edadMascota';
import { calcularReglaTres, type TipoRegla, type TipoRelacion } from '@/lib/calculadoras/reglaTres';
import { compararAlquilerVsCompra } from '@/lib/calculadoras/alquilerVsCompra';
import { calcularJubilacionAnticipada, type TipoJubilacionAnticipada } from '@/lib/calculadoras/jubilacionAnticipada';
import { calcularSueldoNeto, type SituacionFamiliar } from '@/lib/calculadoras/sueldoNeto';
import { calcularIRPF, type SituacionFamiliarIRPF } from '@/lib/calculadoras/irpf';
import { calcularCuotaAutonomo } from '@/lib/calculadoras/cuotaAutonomo';
import { calcularPlusvaliasIRPF, type TipoActivo } from '@/lib/calculadoras/plusvaliasIRPF';
import { convertirUnidades, type CategoriaUnidad } from '@/lib/calculadoras/conversorUnidades';
import { calcularMacros, type SexoBiologico, type NivelActividad, type ObjetivoNutricional } from '@/lib/calculadoras/macros';
import { calcularInflacion } from '@/lib/calculadoras/inflacion';
import { calcularMcdMcm } from '@/lib/calculadoras/mcdMcm';
import { calcularCosteEmpleado, type TipoContrato, type SectorActividad } from '@/lib/calculadoras/costeEmpleado';
import { calcularFiniquito, type MotivoFiniquito } from '@/lib/calculadoras/finiquito';
import { calcularPensionDesempleo } from '@/lib/calculadoras/pensionDesempleo';
import { calcularVentaInmueble } from '@/lib/calculadoras/ventaInmueble';
import { calcularHerenciaConjunta, type HerederoInput } from '@/lib/calculadoras/herenciaConjunta';
import { calcularSeguroVida } from '@/lib/calculadoras/seguroVida';
import { compararAutonomoVsSL, type TipoIS as TipoISSL } from '@/lib/calculadoras/autonomoVsSL';
import { calcularDeclaracionConjunta } from '@/lib/calculadoras/declaracionConjunta';
import { calcularSubidaSalarial } from '@/lib/calculadoras/subidaSalarial';
import { calcularPagoFraccionado, type Trimestre } from '@/lib/calculadoras/pagoFraccionado';
import { calcularBajaMedica, type TipoBaja } from '@/lib/calculadoras/bajaMedica';
import { calcularPeriodoCarencia, type TipoCarencia } from '@/lib/calculadoras/periodoCarencia';
import { calcularKilometraje, type PerfilKilometraje } from '@/lib/calculadoras/kilometraje';
import { calcularValorPresente, type ModoValorPresente, type TipoRenta, type Periodicidad } from '@/lib/calculadoras/valorPresente';
import { calcularPlanPensiones } from '@/lib/calculadoras/planPensiones';
import { calcularLeasing, type TipoFiscal as TipoFiscalLeasing } from '@/lib/calculadoras/leasing';
import { calcularRentabilidadAlquiler } from '@/lib/calculadoras/rentabilidadAlquiler';
import { calcularEstrategiaDeuda, type DeudaInput } from '@/lib/calculadoras/estrategiaDeuda';
import { calcularCapacidadHipoteca } from '@/lib/calculadoras/capacidadHipoteca';
import { calcularObjetivoAhorro } from '@/lib/calculadoras/objetivoAhorro';
import { calcularRegla72 } from '@/lib/calculadoras/regla72';
import { calcularEstadisticas } from '@/lib/calculadoras/estadisticas';
import { calcularPensionComplementaria } from '@/lib/calculadoras/pensionComplementaria';
import { calcularRetencionAlquiler } from '@/lib/calculadoras/retencionAlquiler';

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
  // TOOL: calcular_coste_aplazado
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_coste_aplazado',
    'Calcula el coste real de financiar una compra a plazos: cuánto pagas de más respecto ' +
    'al precio al contado y la TAE implícita. ' +
    'Útil para decidir si vale la pena pagar a plazos o si es mejor esperar y pagar al contado, ' +
    'y para comparar ofertas de financiación.',
    {
      precioContado: z.number().positive()
        .describe('Precio del producto al contado en euros'),
      cuotaMensual: z.number().positive()
        .describe('Cuota mensual a pagar en euros'),
      numeroCuotas: z.number().int().min(1).max(600)
        .describe('Número de cuotas mensuales'),
      entradaInicial: z.number().min(0).optional()
        .describe('Pago inicial o entrada en euros. Por defecto 0.'),
    },
    async ({ precioContado, cuotaMensual, numeroCuotas, entradaInicial }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_coste_aplazado', aiCaller);

      let r;
      try {
        r = calcularCosteAplazado({ precioContado, cuotaMensual, numeroCuotas, entradaInicial });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const valoracion = r.taeAproximada < 5 ? '✅ Financiación razonable' : r.taeAproximada < 15 ? '⚠️ Coste moderado' : '❌ Financiación cara';
      const lineas = [
        `💳 **Coste de Compra a Plazos**`,
        '',
        `🏷️ Precio al contado: **${fmt(precioContado)} €**`,
        r.entradaInicial > 0 ? `💵 Entrada inicial: ${fmt(r.entradaInicial)} €` : '',
        `📊 ${numeroCuotas} cuotas × ${fmt(cuotaMensual)} €/mes`,
        '',
        `💰 **Total pagado a plazos: ${fmt(r.totalPlazos)} €**`,
        `📈 Coste de la financiación: **${fmt(r.costeFinanciacion)} €** (+${r.porcentajeExtra.toFixed(1).replace('.', ',')}%)`,
        `📉 Importe financiado: ${fmt(r.importeFinanciado)} €`,
        `📊 **TAE implícita: ${r.taeAproximada.toFixed(2).replace('.', ',')}%** — ${valoracion}`,
        '',
        `💡 Por cada 100 € de precio, pagas **${(100 + r.porcentajeExtra).toFixed(1).replace('.', ',')} €** a plazos.`,
        `⚖️ *La TAE es aproximada. Compara siempre la TAE oficial que debe indicar el vendedor/financiador.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_roi_marketing
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_roi_marketing',
    'Calcula el ROI (Retorno sobre la Inversión) por canal de marketing: ' +
    'Google Ads, Facebook, email marketing, SEO, influencers, etc. ' +
    'Para cada canal devuelve beneficio, ROI%, CAC (coste de adquisición de cliente), ' +
    'ROAS (multiplicador de retorno) y una recomendación de acción. ' +
    'También compara los canales y determina cuál es el más rentable.',
    {
      canales: z.array(z.object({
        nombre: z.string().describe('Nombre del canal (ej: "Google Ads", "Email Marketing")'),
        inversion: z.number().min(0).describe('Inversión en el canal en euros'),
        clientes: z.number().min(0).describe('Número de clientes captados'),
        ingresoPorCliente: z.number().min(0).describe('Ingreso medio por cliente en euros'),
      })).min(1).max(15)
        .describe('Lista de canales con su inversión y resultados'),
      valorVidaCliente: z.number().min(0).optional()
        .describe('Valor de vida del cliente (CLV) en euros. Si se proporciona, calcula el ratio CLV/CAC para evaluar si el coste de adquisición es sostenible.'),
    },
    async ({ canales, valorVidaCliente }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_roi_marketing', aiCaller);

      let r;
      try {
        r = calcularROIMarketing(canales as CanalMarketing[], valorVidaCliente);
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const emojiRec: Record<string, string> = { excelente: '🚀', bueno: '✅', revisar: '⚠️', pausar: '🛑' };
      const lineas = [
        `📊 **ROI de Marketing — ${r.canales.length} canal(es)**`,
        '',
        `💰 Inversión total: ${fmt(r.inversionTotal)} € → Ingresos: ${fmt(r.ingresosTotal)} € → Beneficio: **${fmt(r.beneficioTotal)} €**`,
        `📈 **ROI total: ${r.roiTotal.toFixed(1).replace('.', ',')}%** | CAC medio: ${fmt(r.cacPromedio)} €/cliente | Clientes: ${r.clientesTotal}`,
        '',
        `📋 **Por canal**`,
        ...r.canales.filter(c => c.inversion > 0).map(c =>
          `  ${emojiRec[c.tipoRecomendacion]} **${c.nombre}**: ROI ${c.roi.toFixed(0)}% | Beneficio ${fmt(c.beneficio)} € | CAC ${fmt(c.cac)} € | ROAS ${c.roas.toFixed(1).replace('.', ',')}x → *${c.recomendacion}*`
        ),
        '',
        r.mejorCanal ? `🏆 Mejor canal: **${r.mejorCanal}**` : '',
        r.peorCanal && r.peorCanal !== r.mejorCanal ? `⚠️ Canal a revisar: **${r.peorCanal}**` : '',
        '',
        `⚖️ *ROI = (Beneficio / Inversión) × 100. ROAS = Ingresos / Inversión. CAC = Inversión / Clientes captados.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
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
  // TOOL: comparar_alquiler_compra
  // ------------------------------------------------------------------
  servidor.tool(
    'comparar_alquiler_compra',
    'Compara financieramente alquilar vs comprar una vivienda en España a lo largo del tiempo. ' +
    'Calcula el patrimonio acumulado en ambos escenarios teniendo en cuenta: hipoteca (sistema francés), ' +
    'gastos de compra (~10%), IBI, comunidad, seguro, mantenimiento, revalorización de la vivienda ' +
    'y la rentabilidad de invertir la entrada en el escenario alquiler. ' +
    'Determina qué opción genera más patrimonio y el punto de equilibrio.',
    {
      precioVivienda: z.number().positive()
        .describe('Precio de la vivienda en euros'),
      entrada: z.number().min(0)
        .describe('Ahorros aportados como entrada (€). Recomendado ≥ 20% del precio.'),
      tipoInteres: z.number().min(0).max(20)
        .describe('Tipo de interés de la hipoteca en %. Ejemplo: 3.5 para tipo fijo actual.'),
      alquilerMensual: z.number().positive()
        .describe('Alquiler mensual equivalente en euros'),
      plazoHipoteca: z.number().int().min(5).max(40).optional()
        .describe('Plazo de la hipoteca en años. Por defecto 25.'),
      ibi: z.number().min(0).optional()
        .describe('IBI anual en euros. Por defecto 400 €.'),
      comunidadMensual: z.number().min(0).optional()
        .describe('Cuota de comunidad mensual en euros. Por defecto 80 €.'),
      seguroAnual: z.number().min(0).optional()
        .describe('Seguro de hogar anual en euros. Por defecto 300 €.'),
      mantenimientoPct: z.number().min(0).max(5).optional()
        .describe('Gastos de mantenimiento anuales como % del valor de la vivienda. Por defecto 0.5%.'),
      incrementoAlquilerPct: z.number().min(0).max(10).optional()
        .describe('Incremento anual del alquiler en %. Por defecto 3%.'),
      rentabilidadInversionPct: z.number().min(0).max(15).optional()
        .describe('Rentabilidad anual de la inversión alternativa (donde invertiría la entrada el inquilino) en %. Por defecto 5%.'),
      revalorizacionPct: z.number().min(-5).max(15).optional()
        .describe('Revalorización anual esperada de la vivienda en %. Por defecto 3%.'),
      anos: z.number().int().min(1).max(40).optional()
        .describe('Horizonte temporal de comparación en años. Por defecto 15.'),
    },
    async ({ precioVivienda, entrada, tipoInteres, alquilerMensual, plazoHipoteca, ibi, comunidadMensual, seguroAnual, mantenimientoPct, incrementoAlquilerPct, rentabilidadInversionPct, revalorizacionPct, anos }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('comparar_alquiler_compra', aiCaller);

      let r;
      try {
        r = compararAlquilerVsCompra({ precioVivienda, entrada, tipoInteres, alquilerMensual, plazoHipoteca, ibi, comunidadMensual, seguroAnual, mantenimientoPct, incrementoAlquilerPct, rentabilidadInversionPct, revalorizacionPct, anos });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      const fmtDec = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const horizonte = anos ?? 15;
      const ganador = r.mejorOpcion === 'comprar' ? '🏠 **COMPRAR sale mejor**' : '🔑 **ALQUILAR sale mejor**';
      const lineas = [
        `🏠🔑 **Comparativa Alquiler vs Compra** (${horizonte} años)`,
        '',
        `💶 Precio: ${fmt(precioVivienda)} € | Entrada: ${fmt(entrada)} € | Hipoteca: ${tipoInteres}% a ${plazoHipoteca ?? 25} años`,
        `📊 Cuota hipoteca: **${fmtDec(r.cuotaHipoteca)} €/mes** | Gasto total compra: ${fmtDec(r.gastoMensualCompra)} €/mes`,
        `🔑 Alquiler: ${fmtDec(alquilerMensual)} €/mes`,
        `🏦 Gastos de compra iniciales (~10%): ${fmt(r.gastosCompra)} €`,
        '',
        `📈 **Patrimonio al cabo de ${horizonte} años**`,
        `  🏠 Comprando: **${fmt(r.patrimonioFinalCompra)} €** (vivienda: ${fmt(r.valorFinalVivienda)} €)`,
        `  🔑 Alquilando e invirtiendo: **${fmt(r.patrimonioFinalAlquiler)} €**`,
        `  📊 Diferencia: ${fmt(Math.abs(r.diferencia))} € a favor de ${r.mejorOpcion === 'comprar' ? 'comprar' : 'alquilar'}`,
        '',
        r.puntoEquilibrio > 0
          ? `⏱️ Punto de equilibrio: comprar supera a alquilar en el **año ${r.puntoEquilibrio}**`
          : `⏱️ Comprar no supera a alquilar dentro del horizonte de ${horizonte} años`,
        '',
        `${ganador} en el horizonte de ${horizonte} años`,
        '',
        `⚖️ *Estimación orientativa. Resultado muy sensible a la revalorización de la vivienda (${revalorizacionPct ?? 3}%) y la rentabilidad de la inversión alternativa (${rentabilidadInversionPct ?? 5}%). Ajusta estos parámetros a tu situación.*`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_jubilacion_anticipada
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_jubilacion_anticipada',
    'Calcula el impacto económico de jubilarse anticipadamente en España. ' +
    'Determina si es posible (según años cotizados y modalidad), ' +
    'el coeficiente reductor acumulado trimestre a trimestre ' +
    'y la pensión resultante tras la reducción. ' +
    '⚠️ Modalidad voluntaria: hasta 2 años antes, necesita ≥ 35 años cotizados. ' +
    'Modalidad involuntaria (despido, ERTE): hasta 4 años antes, necesita ≥ 33 años. ' +
    'Normativa: LGSS arts. 207-208 + Ley 21/2021.',
    {
      anosCotizados: z.number().min(0).max(50)
        .describe('Años cotizados a la Seguridad Social'),
      mesesAnticipacion: z.number().int().min(1).max(48)
        .describe('Meses de anticipación respecto a la edad ordinaria de jubilación (66 años y 6 meses con <37 años y 3 meses cotizados; 65 años con ≥37 años y 3 meses)'),
      tipo: z.enum(['voluntaria', 'involuntaria'])
        .describe('"voluntaria": el trabajador decide jubilarse antes. "involuntaria": causas ajenas al trabajador (despido colectivo, ERTE, cierre empresa). La involuntaria tiene coeficientes reductores menores.'),
      pensionOrdinaria: z.number().positive()
        .describe('Pensión mensual estimada si te jubilaras a la edad ordinaria (€/mes). Puedes estimarla con calcular_pension_publica.'),
    },
    async ({ anosCotizados, mesesAnticipacion, tipo, pensionOrdinaria }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_jubilacion_anticipada', aiCaller);

      let r;
      try {
        r = calcularJubilacionAnticipada({
          anosCotizados, mesesAnticipacion,
          tipo: tipo as TipoJubilacionAnticipada,
          pensionOrdinaria,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `👴 **Jubilación Anticipada — Modalidad ${tipo === 'voluntaria' ? 'Voluntaria' : 'Involuntaria'}**`,
        '',
        `📊 Años cotizados: ${anosCotizados} | Anticipación: ${mesesAnticipacion} meses (${r.trimestreAnticipacion} trimestres)`,
        `🎯 Edad ordinaria según cotización: ${r.edadOrdinaria}`,
        '',
        r.posible
          ? `✅ **Jubilación anticipada POSIBLE**`
          : `❌ **No es posible**: ${r.motivoImpedimento}`,
        r.posible ? '' : `  ℹ️ Mínimo requerido: ${r.anosMinimosRequeridos} años cotizados | Máximo: ${r.maxMesesPermitidos} meses anticipación`,
        '',
        r.posible ? `📉 **Reducción total: ${r.reduccionTotal.toFixed(2).replace('.', ',')}%**` : '',
        r.posible
          ? [
            `  💰 Pensión ordinaria: ${fmt(pensionOrdinaria)} €/mes`,
            `  📉 Pensión con reducción: **${fmt(r.pensionConReduccion)} €/mes**`,
            `  ⚠️ Pérdida mensual: **${fmt(r.perdidaMensual)} €** | Pérdida anual (14 pagas): **${fmt(r.perdidaAnual)} €**`,
          ].join('\n')
          : '',
        r.posible && r.desglosePorTrimestre.length > 0
          ? [
            '',
            `📋 **Desglose por trimestre**`,
            ...r.desglosePorTrimestre.map(d => `  Trimestre ${d.trimestre}: -${d.reduccion.toFixed(2).replace('.', ',')}%`),
          ].join('\n')
          : '',
        '',
        `📚 ${r.fuenteDatos}`,
        `⚖️ *La reducción es permanente y vitalicia. La SS calculará el resultado real a partir de tu historial exacto.*`,
      ].filter(l => l !== '');
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

  // ------------------------------------------------------------------
  // TOOL: calcular_sueldo_neto
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_sueldo_neto',
    'Estima el sueldo neto mensual/anual a partir del salario bruto anual. ' +
    'Calcula: cotización SS empleado (contingencias + desempleo + FP + MEI), ' +
    'reducción por rendimientos del trabajo (hasta 6.498 €/año), ' +
    'mínimo personal y familiar (hijos, situación), cuota IRPF estimada y tipo de retención. ' +
    '⚠️ Estimación orientativa con tipo estatal + autonómico medio. ' +
    'El tipo real depende de la CCAA del contribuyente y de otras deducciones específicas.',
    {
      brutoAnual: z.number().positive()
        .describe('Salario bruto anual en euros'),
      situacion: z.enum(['soltero', 'casado_sin_ingresos', 'casado_con_ingresos']).optional()
        .describe('Situación familiar. Por defecto "soltero".'),
      numHijos: z.number().int().min(0).max(20).optional()
        .describe('Número total de hijos a cargo. Por defecto 0.'),
      hijosMenores3: z.number().int().min(0).max(10).optional()
        .describe('Número de hijos menores de 3 años (añade 2.800 €/hijo al mínimo familiar). Por defecto 0.'),
      pagas: z.union([z.literal(12), z.literal(14)]).optional()
        .describe('Número de pagas al año: 12 o 14. Por defecto 14.'),
    },
    async ({ brutoAnual, situacion, numHijos, hijosMenores3, pagas }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_sueldo_neto', aiCaller);

      let r;
      try {
        r = calcularSueldoNeto({ brutoAnual, situacion: situacion as SituacionFamiliar, numHijos, hijosMenores3, pagas });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `💶 **Sueldo Neto Estimado 2025**`,
        '',
        `📊 Bruto anual: **${fmt(r.brutoAnual)} €**`,
        `🏛️ Cotización SS (${((r.cuotaSSAnual / r.brutoAnual) * 100).toFixed(2).replace('.', ',')}%): ${fmt(r.cuotaSSAnual)} €`,
        `📉 Reducción rendimientos trabajo: ${fmt(r.reduccionRNT)} €`,
        `👨‍👩‍👧 Mínimo personal y familiar: ${fmt(r.minimoPersonalFamiliar)} €`,
        `📋 Base liquidable: ${fmt(r.baseLiquidable)} €`,
        '',
        `📄 IRPF (tipo retención: **${r.tipoRetencion.toFixed(2).replace('.', ',')}%**): ${fmt(r.cuotaIRPF)} €`,
        '',
        `✅ **Neto anual: ${fmt(r.netoAnual)} €**`,
        `✅ **Neto mensual (÷${r.pagas}): ${fmt(r.netoMensual)} €**`,
        '',
        `⚠️ *Estimación orientativa. El tipo real varía según CCAA, deducciones específicas y modelo 145. Verificar en la Agencia Tributaria.*`,
        `📚 ${r.fuenteDatos}`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_irpf
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_irpf',
    'Estima la cuota diferencial del IRPF (a pagar o a devolver) integrando ' +
    'rendimientos del trabajo, capital mobiliario, capital inmobiliario ' +
    'y ganancias/pérdidas patrimoniales. ' +
    'Aplica gastos deducibles, reducción RNT (hasta 6.498 €), mínimo personal y familiar, ' +
    'tramos de la base general (19-47%) y del ahorro (19-30%). ' +
    '⚠️ Estimación orientativa con tipos estatales + autonómico medio. ' +
    'La declaración real incluye deducciones autonómicas y circunstancias específicas.',
    {
      rendimientosTrabajo: z.number().min(0)
        .describe('Rendimientos brutos del trabajo antes de SS (salario bruto). En euros.'),
      rendimientosCapitalMobiliario: z.number().min(0).optional()
        .describe('Dividendos, intereses de cuentas, bonos, etc. (€). Por defecto 0.'),
      rendimientosCapitalInmobiliario: z.number().min(0).optional()
        .describe('Rendimientos de alquiler (ya netos de gastos deducibles) (€). Por defecto 0.'),
      gananciasPLargo: z.number().optional()
        .describe('Ganancias patrimoniales a largo plazo (>12 meses): venta de acciones, fondos, inmuebles (€). Puede ser negativo si hay pérdidas.'),
      gananciasPCorto: z.number().optional()
        .describe('Ganancias patrimoniales a corto plazo (≤12 meses) (€). Tributan en base general.'),
      retenciones: z.number().min(0).optional()
        .describe('Total de retenciones ya practicadas a cuenta (nómina, dividendos, alquiler, etc.) (€). Por defecto 0.'),
      situacion: z.enum(['soltero', 'casado_sin_ingresos', 'casado_con_ingresos']).optional()
        .describe('Situación familiar. Por defecto "soltero".'),
      numHijos: z.number().int().min(0).max(20).optional()
        .describe('Número de hijos. Por defecto 0.'),
      hijosMenores3: z.number().int().min(0).max(10).optional()
        .describe('Hijos menores de 3 años. Por defecto 0.'),
      esTrabajador: z.boolean().optional()
        .describe('¿Tiene rendimientos del trabajo? Para aplicar gastos deducibles (2.000 €) y reducción RNT. Por defecto true.'),
    },
    async ({ rendimientosTrabajo, rendimientosCapitalMobiliario, rendimientosCapitalInmobiliario, gananciasPLargo, gananciasPCorto, retenciones, situacion, numHijos, hijosMenores3, esTrabajador }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_irpf', aiCaller);

      let r;
      try {
        r = calcularIRPF({
          rendimientosTrabajo, rendimientosCapitalMobiliario, rendimientosCapitalInmobiliario,
          gananciasPLargo, gananciasPCorto, retenciones, situacion: situacion as SituacionFamiliarIRPF,
          numHijos, hijosMenores3, esTrabajador,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const signo = r.cuotaDiferencial >= 0 ? '📤 A PAGAR' : '📥 A DEVOLVER';
      const lineas = [
        `📊 **Estimación IRPF 2025**`,
        '',
        `📋 Base imponible general: ${fmt(r.baseImponibleGeneral)} € | Base ahorro: ${fmt(r.baseImponibleAhorro)} €`,
        `📉 Reducción RNT: ${fmt(r.reduccionRNT)} € | Mínimo personal/familiar: ${fmt(r.minimoPersonalFamiliar)} €`,
        `📋 Base liquidable general: ${fmt(r.baseLiquidableGeneral)} €`,
        '',
        `💶 Cuota general (${r.tipoEfectivoGeneral.toFixed(2).replace('.', ',')}% efectivo): ${fmt(r.cuotaIntegraGeneral)} €`,
        r.baseImponibleAhorro > 0 ? `💹 Cuota ahorro: ${fmt(r.cuotaIntegralAhorro)} €` : '',
        `🏛️ Cuota íntegra total: **${fmt(r.cuotaIntegra)} €**`,
        `✂️ Retenciones practicadas: ${fmt(r.retenciones)} €`,
        '',
        `**${signo}: ${fmt(Math.abs(r.cuotaDiferencial))} €**`,
        '',
        r.desgloseGeneral.length > 0 ? `📊 Desglose tramos generales:` : '',
        ...r.desgloseGeneral.map(t => `  ${fmt(t.desde)}–${t.hasta === Infinity ? '∞' : fmt(t.hasta)} €: ${t.tipo}% → ${fmt(t.cuota)} €`),
        '',
        `⚠️ *Estimación con tipos estatal + autonómico medio. La declaración real incluye deducciones autonómicas y circunstancias adicionales.*`,
        `📚 ${r.fuenteDatos}`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_cuota_autonomo
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_cuota_autonomo',
    'Calcula la cuota mensual de la Seguridad Social para autónomos según ' +
    'el sistema de cotización por ingresos reales (Real Decreto-ley 13/2022). ' +
    'Determina el tramo correspondiente (1-15), la base mínima y máxima del tramo, ' +
    'la cuota a pagar y si aplica la tarifa plana de 80 €/mes para nuevos autónomos. ' +
    '⚠️ La tabla de tramos está congelada para 2026 por RDL 16/2025. El tipo sube al 31,50% (MEI 0,90%).',
    {
      rendimientoNetoMensual: z.number().min(0)
        .describe('Rendimiento neto mensual estimado (ingresos - gastos deducibles, sin descontar la cuota SS) en euros'),
      esNuevoAutonomo: z.boolean().optional()
        .describe('¿Dado de alta por primera vez como autónomo? Aplica tarifa plana de 80 €/mes durante 12 meses. Por defecto false.'),
      baseElegida: z.enum(['minima', 'maxima']).optional()
        .describe('"minima" (por defecto) o "maxima" — puedes elegir cualquier base dentro del rango del tramo, pero esta tool calcula para los extremos.'),
    },
    async ({ rendimientoNetoMensual, esNuevoAutonomo, baseElegida }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_cuota_autonomo', aiCaller);

      let r;
      try {
        r = calcularCuotaAutonomo({ rendimientoNetoMensual, esNuevoAutonomo, baseElegida });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `🧾 **Cuota Autónomo (RETA) 2026**`,
        '',
        `💶 Rendimiento neto mensual: **${fmt(r.rendimientoNetoMensual)} €**`,
        `📊 Tramo: **${r.tramo}/15** | Base mínima: ${fmt(r.baseMinima)} € | Base máxima: ${fmt(r.baseMaxima)} €`,
        `🔢 Base de cotización elegida: **${fmt(r.baseCotizacion)} €/mes**`,
        `📈 Tipo de cotización: ${r.tipoCotizacion.toFixed(2).replace('.', ',')}% (RDL 16/2025)`,
        '',
        r.aplicaTarifaPlana
          ? [
            `🎉 **Tarifa plana (nuevo autónomo):** ${fmt(r.cuotaConTarifaPlana!)} €/mes (en lugar de ${fmt(r.cuotaMensualGeneral)} €/mes)`,
            `📅 Vigente durante los primeros 12 meses desde el alta`,
          ].join('\n')
          : `💰 **Cuota mensual: ${fmt(r.cuotaMensualGeneral)} €/mes**`,
        '',
        `📅 Cuota anual estimada: **${fmt(r.cuotaAnual)} €/año**`,
        '',
        `⚠️ *El rendimiento neto real se calcula anualmente y puede requerir regularización al cierre del año. Verificar en la Sede Electrónica de la SS.*`,
        `📚 ${r.fuenteDatos}`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_plusvalias_irpf
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_plusvalias_irpf',
    'Calcula el impuesto IRPF sobre la ganancia patrimonial por venta de activos ' +
    '(acciones, fondos de inversión, inmuebles, etc.). ' +
    'Determina: ganancia neta (precio transmisión - precio adquisición con gastos), ' +
    'si es a largo plazo (>12 meses), tributación en la base del ahorro (tramos 19-30%), ' +
    'tipo efectivo y ganancia neta después de impuestos. ' +
    'Permite compensar saldos negativos de ejercicios anteriores.',
    {
      precioCompra: z.number().positive()
        .describe('Precio de compra del activo en euros'),
      gastosCompra: z.number().min(0).optional()
        .describe('Gastos de compra: comisiones de broker, notaría (inmuebles), etc. (€). Por defecto 0.'),
      precioVenta: z.number().positive()
        .describe('Precio de venta del activo en euros'),
      gastosVenta: z.number().min(0).optional()
        .describe('Gastos de venta: comisiones de broker, notaría (inmuebles), etc. (€). Por defecto 0.'),
      fechaCompra: z.string()
        .describe('Fecha de compra en formato YYYY-MM-DD (ej: "2020-03-15")'),
      fechaVenta: z.string()
        .describe('Fecha de venta en formato YYYY-MM-DD (ej: "2025-06-01")'),
      tipoActivo: z.enum(['acciones', 'fondos', 'inmueble', 'otro']).optional()
        .describe('Tipo de activo vendido. Solo informativo.'),
      saldoCompensacion: z.number().min(0).optional()
        .describe('Pérdidas patrimoniales de ejercicios anteriores pendientes de compensar (€). Reducen la base imponible. Por defecto 0.'),
    },
    async ({ precioCompra, gastosCompra, precioVenta, gastosVenta, fechaCompra, fechaVenta, tipoActivo, saldoCompensacion }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_plusvalias_irpf', aiCaller);

      let r;
      try {
        r = calcularPlusvaliasIRPF({ precioCompra, gastosCompra, precioVenta, gastosVenta, fechaCompra, fechaVenta, tipoActivo: tipoActivo as TipoActivo, saldoCompensacion });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const plazo = r.esLargoPlazo ? 'largo plazo (>12 meses)' : 'corto plazo (≤12 meses)';
      const signoGanancia = r.esGanancia ? '📈 Ganancia' : '📉 Pérdida';
      const lineas = [
        `💹 **Plusvalías IRPF 2025** — ${tipoActivo ?? 'activo'}`,
        '',
        `📅 Días transcurridos: **${r.diasTranscurridos}** (${plazo})`,
        `💶 Precio adquisición (+ gastos): ${fmt(r.precioAdquisicion)} €`,
        `💰 Precio transmisión (- gastos): ${fmt(r.precioTransmision)} €`,
        '',
        `${signoGanancia} patrimonial neta: **${fmt(Math.abs(r.gananciaNeta))} €**`,
        r.saldoCompensado > 0 ? `✂️ Saldo compensado: ${fmt(r.saldoCompensado)} €` : '',
        r.esGanancia ? `📋 Base liquidable: ${fmt(r.baseLiquidable)} €` : '',
        '',
        r.esGanancia ? [
          `🏛️ IRPF (tipo efectivo: **${r.tipoEfectivo.toFixed(2).replace('.', ',')}%**): ${fmt(r.cuotaIRPF)} €`,
          `✅ **Ganancia neta después de impuestos: ${fmt(r.gananciaNeta_DI)} €**`,
          `📊 Rentabilidad neta (sobre precio adquisición): ${r.rentabilidadNetaImpuestos.toFixed(2).replace('.', ',')}%`,
        ].join('\n') : `✅ La pérdida patrimonial puede compensarse con ganancias de los próximos 4 ejercicios.`,
        '',
        r.desglose.length > 0 ? `📊 Desglose tramos del ahorro:` : '',
        ...r.desglose.map(t => `  ${fmt(t.desde)}–${t.hasta >= 1e10 ? '∞' : fmt(t.hasta)} €: ${t.tipo}% → ${fmt(t.cuota)} €`),
        '',
        `⚠️ *Estimación orientativa. No incluye ajustes por homogeneización, coeficientes de abatimiento (acciones adquiridas antes de 1994) ni deducciones autonómicas.*`,
        `📚 ${r.fuenteDatos}`,
      ].filter(l => l !== '');
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
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
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
  // TOOL: calcular_coste_empleado
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_coste_empleado',
    'Calcula el coste real total de contratar un empleado en España. ' +
    'Suma al salario bruto las cuotas de Seguridad Social a cargo de la empresa: ' +
    'contingencias comunes (23,60%), desempleo (5,50% indefinido / 6,70% temporal), ' +
    'Formación Profesional (0,60%), FOGASA (0,20%) y Accidentes de Trabajo (según sector). ' +
    'También puede incluir beneficios extra (seguro médico, tickets, etc.). ' +
    'Útil para presupuestar el coste laboral real y calcular el break-even de contratar.',
    {
      salarioBrutoAnual: z.number().positive()
        .describe('Salario bruto anual del empleado en euros'),
      tipoContrato: z.enum(['indefinido', 'temporal']).optional()
        .describe('"indefinido" (por defecto) o "temporal". El tipo de contrato afecta al tipo de desempleo de la empresa.'),
      sector: z.enum(['oficina', 'comercio', 'industrial', 'construccion']).optional()
        .describe('Sector de actividad para el tipo de AT/EP. Por defecto "oficina" (1,50%). "construccion" tiene el tipo más alto (6,70%).'),
      beneficiosExtra: z.number().min(0).optional()
        .describe('Beneficios extra anuales en euros: seguro médico, tickets restaurante, formación, etc. Por defecto 0.'),
    },
    async ({ salarioBrutoAnual, tipoContrato, sector, beneficiosExtra }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_coste_empleado', aiCaller);

      let r;
      try {
        r = calcularCosteEmpleado({
          salarioBrutoAnual,
          tipoContrato: tipoContrato as TipoContrato,
          sector: sector as SectorActividad,
          beneficiosExtra,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `💼 **Coste Real de Contratar un Empleado 2025**`,
        '',
        `💶 Salario bruto anual: **${fmt(r.salarioBrutoAnual)} €**`,
        `💶 Salario bruto mensual: ${fmt(r.salarioBrutoMensual)} €`,
        `🏛️ Base de cotización: ${fmt(r.baseCotizacion)} €/mes`,
        '',
        `📊 **Cuotas SS empresa (tipo total: ${r.tipos.totalSS.toFixed(2).replace('.', ',')}%)**`,
        `  Contingencias comunes (${r.tipos.contingenciasComunes}%): ${fmt(r.cuotas.contingenciasComunes)} €/año`,
        `  Desempleo (${r.tipos.desempleo}%): ${fmt(r.cuotas.desempleo)} €/año`,
        `  Formación Profesional (${r.tipos.formacionProfesional}%): ${fmt(r.cuotas.formacionProfesional)} €/año`,
        `  FOGASA (${r.tipos.fogasa}%): ${fmt(r.cuotas.fogasa)} €/año`,
        `  AT/EP sector ${sector ?? 'oficina'} (${r.tipos.accidentesTrabajo}%): ${fmt(r.cuotas.accidentesTrabajo)} €/año`,
        `  **Total SS empresa: ${fmt(r.cuotas.total)} €/año**`,
        r.beneficiosExtra > 0 ? `🎁 Beneficios extra: ${fmt(r.beneficiosExtra)} €/año` : '',
        '',
        `✅ **Coste total para la empresa: ${fmt(r.costeTotalAnual)} €/año**`,
        `✅ **Coste total mensual: ${fmt(r.costeTotalMensual)} €/mes**`,
        `📈 Sobrecoste sobre el bruto: **${r.sobrecoste.toFixed(2).replace('.', ',')}%**`,
        '',
        `💡 Por cada €1 de salario bruto, la empresa paga €${(r.costeTotalAnual / r.salarioBrutoAnual).toFixed(2).replace('.', ',')} en total.`,
        '',
        `📚 ${r.fuenteDatos}`,
        `⚠️ *Estimación orientativa. El tipo exacto de AT/EP depende del CNAE de la empresa. No incluye otros costes variables (formación, EPI, dietas, etc.).*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_finiquito
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_finiquito',
    'Calcula los conceptos del finiquito al terminar una relación laboral: ' +
    'indemnización por despido (si aplica), vacaciones no disfrutadas, ' +
    'parte proporcional de pagas extras y salarios pendientes del mes en curso. ' +
    'Modalidades: despido improcedente (33 días/año, máx 24 mensualidades), ' +
    'despido por causas objetivas (20 días/año, máx 12 mensualidades), ' +
    'fin de contrato temporal (12 días/año), baja voluntaria (0€). ' +
    'La indemnización por despido improcedente y objetivo está EXENTA de IRPF hasta 180.000€.',
    {
      salarioBrutoMensual: z.number().positive()
        .describe('Salario bruto mensual del empleado en euros (última nómina completa)'),
      motivoFiniquito: z.enum([
        'despido_improcedente', 'despido_objetivo', 'despido_disciplinario',
        'fin_contrato_temporal', 'baja_voluntaria', 'mutuo_acuerdo',
      ]).describe(
        '"despido_improcedente": 33 días/año · "despido_objetivo": 20 días/año (ETOP, art.52 ET) · ' +
        '"despido_disciplinario": 0€ (si es procedente) · "fin_contrato_temporal": 12 días/año · ' +
        '"baja_voluntaria": 0€ indemnización · "mutuo_acuerdo": lo que acuerden las partes'
      ),
      fechaInicio: z.string()
        .describe('Fecha de inicio del contrato (YYYY-MM-DD, ej: "2019-03-01")'),
      fechaBaja: z.string()
        .describe('Fecha del último día trabajado / baja (YYYY-MM-DD, ej: "2025-06-30")'),
      diasVacacionesAnuales: z.number().int().min(22).max(35).optional()
        .describe('Días de vacaciones anuales según convenio (mínimo legal 22 días laborables). Por defecto 22.'),
      diasVacacionesDisfrutados: z.number().int().min(0).optional()
        .describe('Días de vacaciones ya disfrutados en el año actual. Por defecto 0.'),
      pagas: z.number().int().min(12).max(14).optional()
        .describe('Número de pagas totales al año: 12, 13 o 14. Por defecto 14.'),
    },
    async ({ salarioBrutoMensual, motivoFiniquito, fechaInicio, fechaBaja, diasVacacionesAnuales, diasVacacionesDisfrutados, pagas }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_finiquito', aiCaller);

      let r;
      try {
        r = calcularFiniquito({
          salarioBrutoMensual,
          motivoFiniquito: motivoFiniquito as MotivoFiniquito,
          fechaInicio,
          fechaBaja,
          diasVacacionesAnuales,
          diasVacacionesDisfrutados,
          pagas,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `📋 **Cálculo de Finiquito**`,
        '',
        `👷 Antigüedad: **${r.antiguedadAnios} años y ${Math.round(r.antiguedadDias)} días**`,
        `💶 Salario mensual bruto: ${fmt(salarioBrutoMensual)} € | Salario diario: ${fmt(salarioBrutoMensual / 30)} €`,
        '',
        r.indemnizacion > 0 ? [
          `💰 **Indemnización (${r.diasIndemnizacionPorAnio} días/año):**`,
          `   ${fmt(r.indemnizacion)} €${r.limitadoPorMensualidades ? ` (limitada a ${r.maxMensualidades} mensualidades)` : ''}`,
        ].join('\n') : `ℹ️ Indemnización: 0 € (${motivoFiniquito.replace(/_/g, ' ')})`,
        `🌴 Vacaciones no disfrutadas (${r.diasVacacionesPendientes.toFixed(1)} días): ${fmt(r.vacacionesPendientes)} €`,
        `📅 Pagas extra proporcionales: ${fmt(r.pagasExtrasProporcionales)} €`,
        `💳 Salarios pendientes mes en curso: ${fmt(r.salariosAtrasados)} €`,
        '',
        `✅ **TOTAL FINIQUITO BRUTO: ${fmt(r.totalFiniquitoBruto)} €**`,
        '',
        `⚖️ ${r.notaTributacion}`,
        `📚 ${r.fuenteDatos}`,
        `⚠️ *Cálculo orientativo. El finiquito exacto depende del convenio colectivo, pactos individuales y sentencia judicial si hay conflicto. Consultar con asesor laboral.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_pension_desempleo
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_pension_desempleo',
    'Calcula la cuantía y duración de la prestación contributiva por desempleo (paro) en España. ' +
    'Determina los días de prestación según días cotizados (mín. 360 días en los últimos 6 años), ' +
    'la cuantía mensual (70% base reguladora los primeros 6 meses, 50% el resto) ' +
    'y aplica los topes máximos y mínimos del IPREM 2025 según número de hijos. ' +
    '⚠️ La base reguladora es el promedio de las bases de cotización de los 180 días anteriores al desempleo — ' +
    'si no se sabe exactamente, usar el salario bruto mensual como aproximación.',
    {
      diasCotizados: z.number().int().min(0)
        .describe('Días cotizados a desempleo en los últimos 6 años. Mínimo 360 días para acceder a la prestación.'),
      baseReguladoraMensual: z.number().positive()
        .describe('Base reguladora mensual en euros = promedio de las bases de cotización de los últimos 180 días. Aproximar con el salario bruto mensual si no se conoce el dato exacto.'),
      numHijos: z.number().int().min(0).max(10).optional()
        .describe('Número de hijos a cargo (afecta a los topes mínimos y máximos). Por defecto 0.'),
    },
    async ({ diasCotizados, baseReguladoraMensual, numHijos }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_pension_desempleo', aiCaller);

      let r;
      try {
        r = calcularPensionDesempleo({ diasCotizados, baseReguladoraMensual, numHijos });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      if (!r.tieneDerechoPrestacion) {
        return { content: [{ type: 'text', text: `❌ **Sin derecho a prestación contributiva**\n\n${r.motivoSinDerecho}\n\n💡 Con menos de 360 días puedes acceder al **subsidio por desempleo** si cumples los requisitos (agotamiento de prestación, rentas insuficientes, etc.). Consultar con el SEPE.` }] };
      }

      const lineas = [
        `📋 **Prestación por Desempleo (Paro) 2025**`,
        '',
        `📅 Días cotizados: **${r.diasCotizados}**`,
        `⏱️ Duración de la prestación: **${r.diasPrestacion} días (${r.mesesPrestacion} meses)**`,
        `💶 Base reguladora: ${fmt(r.baseReguladora)} €/mes`,
        '',
        `💰 **Cuantías mensuales:**`,
        `  Primeros 180 días (70% BR): ${fmt(r.cuantiaPrimeros6Meses)} €`,
        `  A partir del día 181 (50% BR): ${fmt(r.cuantiaResto)} €`,
        '',
        `🎯 **Cuantía efectiva (tras topes IPREM):**`,
        `  Primeros 6 meses: **${fmt(r.cuantiaEfectivaPrimeros6)} €/mes**`,
        `  Resto: **${fmt(r.cuantiaEfectivaResto)} €/mes**`,
        r.aplicaTopeMaximo ? `  ⬇️ Se aplica tope máximo (${fmt(r.topeMaximo)} €/mes)` : '',
        r.aplicaTopeMinimo ? `  ⬆️ Se aplica tope mínimo (${fmt(r.topeMinimo)} €/mes)` : '',
        '',
        `💵 **Total prestación bruta estimada: ${fmt(r.totalPrestacionBruta)} €**`,
        '',
        `📚 ${r.fuenteDatos}`,
        `⚠️ *La prestación tributa como rendimiento del trabajo en el IRPF. El SEPE calcula la cuantía exacta a partir de tu historial de cotización. Solicitar en el SEPE en los 15 días hábiles siguientes al cese.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_venta_inmueble
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_venta_inmueble',
    'Calcula todos los costes e impuestos del VENDEDOR al vender un inmueble en España. ' +
    'Incluye: Plusvalía Municipal (IIVTNU) por ambos métodos (objetivo y real, el más favorable), ' +
    'IRPF sobre la ganancia patrimonial (tramos base del ahorro 19-30%), ' +
    'comisión inmobiliaria y gestorías. ' +
    'Calcula el neto real que recibe el vendedor y la rentabilidad neta de la inversión. ' +
    'Exenciones: mayores de 65 años con vivienda habitual, y reinversión en vivienda habitual. ' +
    '⚠️ Esta tool calcula los costes del VENDEDOR. Para costes del COMPRADOR, usar calcular_compraventa_inmueble.',
    {
      precioVenta: z.number().positive()
        .describe('Precio de venta del inmueble en euros'),
      precioCompra: z.number().positive()
        .describe('Precio de compra original del inmueble en euros'),
      gastosCompraOriginal: z.number().min(0).optional()
        .describe('Gastos de compra en su día (ITP/IVA + notaría + registro + gestoría) en euros. Mejoran el valor de adquisición y reducen la ganancia patrimonial. Por defecto 0.'),
      aniosTenencia: z.number().min(0).max(60)
        .describe('Años de tenencia del inmueble (enteros). Se usa para calcular la plusvalía municipal.'),
      valorCatastralSuelo: z.number().min(0).optional()
        .describe('Valor catastral del suelo en euros (aparece en el recibo del IBI, en la sección "Suelo"). Necesario para calcular la plusvalía municipal. Si no se proporciona, la plusvalía no se calculará.'),
      tipoMunicipalIIVTNU: z.number().min(0).max(30).optional()
        .describe('Tipo impositivo que aplica el ayuntamiento a la plusvalía municipal (0-30%). Por defecto 25% orientativo. Consultar con el ayuntamiento el tipo exacto.'),
      comisionInmobiliaria: z.number().min(0).max(10).optional()
        .describe('Comisión de la agencia inmobiliaria en %. Por defecto 3%.'),
      gastosGestoria: z.number().min(0).optional()
        .describe('Gastos de gestoría, cancelación hipoteca y otros en euros. Por defecto 300€.'),
      vendedorMayor65: z.boolean().optional()
        .describe('¿El vendedor tiene más de 65 años? Si es vivienda habitual, la ganancia está exenta de IRPF. Por defecto false.'),
      esViviendaHabitual: z.boolean().optional()
        .describe('¿Es la vivienda habitual del vendedor? Relevante para la exención de mayores de 65 años. Por defecto false.'),
      reinvierteTotalEnVivienda: z.boolean().optional()
        .describe('¿El vendedor va a reinvertir el importe en una nueva vivienda habitual? Exención total o parcial del IRPF (art. 38 LIRPF, plazo de 2 años). Por defecto false.'),
    },
    async ({ precioVenta, precioCompra, gastosCompraOriginal, aniosTenencia, valorCatastralSuelo, tipoMunicipalIIVTNU, comisionInmobiliaria, gastosGestoria, vendedorMayor65, esViviendaHabitual, reinvierteTotalEnVivienda }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_venta_inmueble', aiCaller);

      let r;
      try {
        r = calcularVentaInmueble({
          precioVenta, precioCompra, gastosCompraOriginal, aniosTenencia,
          valorCatastralSuelo, tipoMunicipalIIVTNU, comisionInmobiliaria,
          gastosGestoria, vendedorMayor65, esViviendaHabitual, reinvierteTotalEnVivienda,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const gananciaLabel = r.hayGanancia ? `📈 Ganancia patrimonial` : `📉 Pérdida patrimonial`;
      const lineas = [
        `🏠 **Costes de Venta de Inmueble (vendedor)**`,
        '',
        `💶 Precio de venta: **${fmt(r.precioVenta)} €**`,
        `📋 Valor adquisición (compra + gastos): ${fmt(r.valorAdquisicion)} €`,
        `📋 Valor transmisión (venta - comisión - gestoría): ${fmt(r.valorTransmision)} €`,
        `${gananciaLabel}: **${fmt(Math.abs(r.gananciaPatrimonial))} €**`,
        '',
        `📊 **Gastos del vendedor:**`,
        `  🏡 Comisión inmobiliaria: ${fmt(r.comisionInmobiliaria)} €`,
        `  📝 Gestoría y otros: ${fmt(r.gastosGestoria)} €`,
        r.iivtnuCalculable
          ? `  🏛️ Plusvalía municipal (IIVTNU): ${fmt(r.plusvaliaMunicipal)} € (${r.metodoPlusvalia})`
          : `  ℹ️ Plusvalía municipal: no calculada (proporcionar valor catastral del suelo)`,
        r.exentoIRPF
          ? `  ✅ IRPF: EXENTO — ${r.motivoExencion}`
          : `  💸 IRPF ganancia (${r.tipoEfectivoIRPF.toFixed(2).replace('.', ',')}% efectivo): ${fmt(r.irpfGanancia)} €`,
        '',
        `💰 **Total gastos e impuestos: ${fmt(r.totalGastosVendedor)} €**`,
        `✅ **Neto recibido: ${fmt(r.netoVendedor)} €**`,
        `📊 Rentabilidad neta sobre la inversión: **${r.rentabilidadNeta >= 0 ? '+' : ''}${r.rentabilidadNeta.toFixed(2).replace('.', ',')}%**`,
        r.desgloseIRPF.length > 0 ? '' : '',
        r.desgloseIRPF.length > 0 ? `📊 Desglose IRPF (base del ahorro):` : '',
        ...r.desgloseIRPF.map(t => `  ${fmt(t.desde)}–${t.hasta >= 1e10 ? '∞' : fmt(t.hasta)} €: ${t.tipo}% → ${fmt(t.cuota)} €`),
        '',
        `📚 ${r.fuenteDatos}`,
        `⚠️ *La plusvalía municipal usa el tipo máximo orientativo del 25%. Consultar con tu Ayuntamiento el tipo exacto. El IRPF puede variar si tienes pérdidas patrimoniales a compensar.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_herencia_conjunta
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_herencia_conjunta',
    'Divide una masa hereditaria entre varios herederos y calcula el Impuesto de Sucesiones ' +
    'de cada uno según su CCAA, grupo de parentesco, edad y patrimonio previo. ' +
    'Soporta reparto igualitario (automático) o porcentajes personalizados. ' +
    'Aplica todas las reducciones, coeficientes multiplicadores y bonificaciones autonómicas ' +
    'de las 17 CCAA, igual que la tool calcular_sucesiones. ' +
    'Ideal para comparar el impacto fiscal de diferentes repartos o CCAA.',
    {
      masaHereditaria: z.number().positive()
        .describe('Masa hereditaria neta total en euros (activo: bienes y derechos - pasivo: deudas y cargas)'),
      herederos: z.array(z.object({
        nombre: z.string().describe('Nombre o referencia del heredero (ej: "Hijo 1", "Cónyuge")'),
        grupo: z.enum(['I-conyuge', 'I-descendiente', 'II', 'II-ascendiente', 'III', 'IV'])
          .describe('Grupo de parentesco: I-conyuge (cónyuge/pareja), I-descendiente (hijo/nieto), II (hermanos, tíos, sobrinos), II-ascendiente (padres/abuelos), III (primos, colaterales 4º), IV (extraños)'),
        ccaa: z.enum([
          'madrid', 'andalucia', 'galicia', 'murcia', 'valencia', 'extremadura',
          'canarias', 'castilla-leon', 'rioja', 'castilla-mancha', 'cantabria',
          'aragon', 'baleares', 'asturias', 'cataluna', 'pais-vasco', 'navarra',
        ]).describe('CCAA del causante (el fallecido). Determina el impuesto de sucesiones aplicable.'),
        porcentaje: z.number().min(0).max(100).optional()
          .describe('% de la masa hereditaria que recibe. Si no se indica para ningún heredero, se hace reparto igualitario.'),
        edad: z.number().int().min(0).max(120).optional()
          .describe('Edad del heredero (relevante para grupo I-descendiente < 21 años: reducción adicional de 3.990€ por año menos de 21).'),
        discapacidad: z.enum(['ninguna', '33-65', '65-mas']).optional()
          .describe('"ninguna" (por defecto), "33-65" (33-65%), "65-mas" (≥65% discapacidad).'),
        patrimonioPrevio: z.enum(['hasta-402k', '402k-2M', '2M-4M', 'mas-4M']).optional()
          .describe('Patrimonio preexistente del heredero (afecta al coeficiente multiplicador del impuesto). Por defecto "hasta-402k".'),
        incluyeViviendaHabitual: z.boolean().optional()
          .describe('¿Su parte incluye la vivienda habitual del causante? Aplicaría reducción del 95% (máx 122.606€ por heredero).'),
        valorViviendaHabitual: z.number().min(0).optional()
          .describe('Valor de la vivienda habitual incluida en su cuota hereditaria (€).'),
      })).min(1).max(10)
        .describe('Lista de herederos con sus datos. Mínimo 1, máximo 10.'),
    },
    async ({ masaHereditaria, herederos }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_herencia_conjunta', aiCaller);

      let r;
      try {
        r = calcularHerenciaConjunta(masaHereditaria, herederos as HerederoInput[]);
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `⚖️ **Reparto de Herencia — ${r.numHerederos} herederos**`,
        '',
        `💰 Masa hereditaria total: **${fmt(r.masaHereditaria)} €**`,
        '',
        `📋 **Resultado por heredero:**`,
        ...r.herederos.map(h =>
          [
            ``,
            `👤 **${h.nombre}** (${h.grupo}, ${h.ccaa}) — ${h.porcentaje.toFixed(2).replace('.', ',')}%`,
            `  💶 Cuota hereditaria: ${fmt(h.cuotaHereditaria)} €`,
            h.reduccion > 0 ? `  ✂️ Reducción: ${fmt(h.reduccion)} €` : '',
            h.reduccion > 0 ? `  📋 Base imponible: ${fmt(h.baseImponible)} €` : '',
            `  🏛️ Impuesto sucesiones: **${fmt(h.impuesto)} €** (tipo efectivo: ${h.tipoEfectivo.toFixed(2).replace('.', ',')}%)`,
            `  ✅ **Neto recibido: ${fmt(h.netoRecibido)} €**`,
          ].filter(l => l !== '').join('\n')
        ),
        '',
        `📊 **Totales:**`,
        `  🏛️ Total impuesto pagado: **${fmt(r.totalImpuesto)} €** (${r.cargaFiscalTotal.toFixed(2).replace('.', ',')}% de la masa)`,
        `  ✅ Total neto distribuido: **${fmt(r.totalNetoDistribuido)} €**`,
        '',
        `📚 ${r.fuenteDatos}`,
        `⚠️ *Estimación orientativa. No incluye la plusvalía municipal sobre inmuebles (usar calcular_venta_inmueble para eso). El reparto real debe hacerse con notario/abogado. El impuesto se liquida en la CCAA del causante.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_seguro_vida
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_seguro_vida',
    'Calcula el capital de seguro de vida necesario para proteger adecuadamente a la familia. ' +
    'Determina tres niveles: capital mínimo (solo deudas + emergencias), ' +
    'capital recomendado (sustitución de ingresos + deudas + educación de hijos + funerario + colchón) ' +
    'y capital óptimo (+20% por inflación). ' +
    'Evalúa si el seguro actual es suficiente y el gap a cubrir.',
    {
      edad: z.number().int().min(18).max(80)
        .describe('Edad actual del asegurado en años'),
      ingresoAnual: z.number().positive()
        .describe('Ingreso anual bruto del asegurado en euros'),
      edadJubilacion: z.number().int().min(55).max(75).optional()
        .describe('Edad de jubilación objetivo. Por defecto 67 años.'),
      ingresoConyuge: z.number().min(0).optional()
        .describe('Ingreso anual del cónyuge/pareja en euros. Por defecto 0.'),
      hipotecaPendiente: z.number().min(0).optional()
        .describe('Capital pendiente de la hipoteca en euros. Por defecto 0.'),
      otrasDeudas: z.number().min(0).optional()
        .describe('Otras deudas: préstamos personales, coches, etc. en euros. Por defecto 0.'),
      numHijos: z.number().int().min(0).max(10).optional()
        .describe('Número de hijos a cargo. Por defecto 0.'),
      edadHijoMenor: z.number().int().min(0).max(22).optional()
        .describe('Edad del hijo más joven (para calcular años de educación hasta los 23). Por defecto 0.'),
      ahorrosActuales: z.number().min(0).optional()
        .describe('Ahorros e inversiones actuales del hogar en euros (reducen el capital necesario). Por defecto 0.'),
      seguroVidaActual: z.number().min(0).optional()
        .describe('Capital de seguros de vida existentes en euros. Por defecto 0.'),
    },
    async ({ edad, ingresoAnual, edadJubilacion, ingresoConyuge, hipotecaPendiente, otrasDeudas, numHijos, edadHijoMenor, ahorrosActuales, seguroVidaActual }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_seguro_vida', aiCaller);

      let r;
      try {
        r = calcularSeguroVida({
          edad, ingresoAnual, edadJubilacion, ingresoConyuge,
          hipotecaPendiente, otrasDeudas, numHijos, edadHijoMenor,
          ahorrosActuales, seguroVidaActual,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      const suficiencia = r.seguroActualSuficiente
        ? '✅ Tu seguro actual es suficiente'
        : `❌ Gap: necesitas ${fmt(r.capitalRecomendado - (seguroVidaActual ?? 0))} € más de cobertura`;

      const lineas = [
        `🛡️ **Capital de Seguro de Vida Necesario**`,
        '',
        `👤 ${edad} años | Ingresos: ${fmt(ingresoAnual)} €/año | ${r.anosCobertura} años hasta jubilación`,
        '',
        `📊 **Desglose de necesidades:**`,
        `  💼 Sustitución de ingresos (${Math.min(r.anosCobertura, 15)} años × 70%): ${fmt(r.desglose.sustitucionIngresos)} €`,
        r.desglose.hipoteca > 0 ? `  🏠 Hipoteca pendiente: ${fmt(r.desglose.hipoteca)} €` : '',
        r.desglose.otrasDeudas > 0 ? `  💳 Otras deudas: ${fmt(r.desglose.otrasDeudas)} €` : '',
        r.desglose.educacionHijos > 0 ? `  🎓 Educación hijos: ${fmt(r.desglose.educacionHijos)} €` : '',
        `  ⚰️ Gastos funerarios: ${fmt(r.desglose.gastosFunerarios)} €`,
        `  🛟 Colchón emergencia (6 meses): ${fmt(r.desglose.colchonEmergencia)} €`,
        `  📉 Recursos disponibles: -${fmt(r.desglose.recursosDisponibles)} €`,
        '',
        `🎯 **Capital mínimo:** ${fmt(r.capitalMinimo)} €`,
        `🎯 **Capital recomendado: ${fmt(r.capitalRecomendado)} €**`,
        `🎯 Capital óptimo (+20% inflación): ${fmt(r.capitalOptimo)} €`,
        '',
        r.coberturaActualPct > 0 ? `📊 Cobertura actual: ${r.coberturaActualPct}% del recomendado` : '',
        suficiencia,
        '',
        `⚠️ *Estimación metodología DINK ajustada. El capital real depende de tu situación familiar, gastos reales y expectativa de vida. Consultar con un corredor de seguros.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: comparar_autonomo_vs_sl
  // ------------------------------------------------------------------
  servidor.tool(
    'comparar_autonomo_vs_sl',
    'Compara la carga fiscal total de operar como autónomo persona física frente a ' +
    'constituir una Sociedad Limitada (SL). ' +
    'Calcula para el autónomo: RETA por ingresos reales + IRPF. ' +
    'Calcula para la SL: IS (15%/23%/25%) + cotización autónomo societario (514,99€/mes) + IRPF sobre dividendos. ' +
    'Determina qué opción es más eficiente fiscalmente y a partir de qué nivel de beneficio conviene la SL. ' +
    '⚠️ La SL tiene costes de constitución (~3.000-5.000€), obligaciones contables y de gestión adicionales.',
    {
      beneficioAnual: z.number().positive()
        .describe('Beneficio bruto anual de la actividad en euros (ingresos totales antes de gastos)'),
      gastosDeducibles: z.number().min(0).optional()
        .describe('Gastos deducibles anuales en euros (suministros, material, vehículo, etc.). Por defecto 0.'),
      tipoIS: z.enum(['general', 'micropyme', 'nueva_creacion']).optional()
        .describe('"general" (25%, tipo estándar), "micropyme" (23%, si facturación < 1M€), "nueva_creacion" (15%, primeros 2 años con beneficio). Por defecto "general".'),
      repartirDividendos: z.boolean().optional()
        .describe('¿La SL va a repartir dividendos al socio? Si es false, el beneficio queda acumulado en la SL. Por defecto true.'),
    },
    async ({ beneficioAnual, gastosDeducibles, tipoIS, repartirDividendos }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('comparar_autonomo_vs_sl', aiCaller);

      let r;
      try {
        r = compararAutonomoVsSL({
          beneficioAnual,
          gastosDeducibles,
          tipoIS: tipoIS as TipoISSL,
          repartirDividendos,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const ganador = r.convieneSL ? '🏆 **Fiscalmente conviene más la SL**' : '🏆 **Fiscalmente conviene más el autónomo**';
      const lineas = [
        `⚖️ **Autónomo vs SL — Comparativa Fiscal 2025**`,
        '',
        `💶 Beneficio bruto: **${fmt(beneficioAnual)} €** | Gastos deducibles: ${fmt(gastosDeducibles ?? 0)} € | IS aplicado: ${r.tipoISAplicado}%`,
        '',
        `👷 **AUTÓNOMO PERSONA FÍSICA**`,
        `  🏛️ Cuota RETA: ${fmt(r.autonomo.cuotaSSAnual)} €/año`,
        `  📄 IRPF: ${fmt(r.autonomo.cuotaImpuesto)} €`,
        `  💰 Total cargas: **${fmt(r.autonomo.totalCargas)} €** (tipo efectivo: ${r.autonomo.tipoEfectivoTotal.toFixed(2).replace('.', ',')}%)`,
        `  ✅ **Neto anual: ${fmt(r.autonomo.netoAnual)} €**`,
        '',
        `🏢 **SOCIEDAD LIMITADA**`,
        `  🏛️ Cotización autónomo societario: ${fmt(r.sl.cuotaSSAnual)} €/año`,
        `  📄 IS (${r.tipoISAplicado}%): ${fmt(r.sl.cuotaImpuesto)} €`,
        r.sl.irpfDividendos > 0 ? `  💹 IRPF sobre dividendos: ${fmt(r.sl.irpfDividendos)} €` : `  ℹ️ Sin reparto de dividendos (quedan en la SL)`,
        `  💰 Total cargas: **${fmt(r.sl.totalCargas)} €** (tipo efectivo: ${r.sl.tipoEfectivoTotal.toFixed(2).replace('.', ',')}%)`,
        `  ✅ **Neto anual: ${fmt(r.sl.netoAnual)} €**`,
        '',
        ganador,
        r.convieneSL
          ? `💡 La SL ahorra **${fmt(r.ahorroCargasSL)} €/año** en cargas fiscales`
          : `💡 El autónomo paga **${fmt(Math.abs(r.ahorroCargasSL))} €/año menos** en cargas fiscales`,
        r.umbralSL > 0
          ? `📊 La SL empieza a ser más eficiente a partir de ~${fmt(r.umbralSL)} €/año de beneficio`
          : '',
        '',
        `⚠️ *La SL tiene costes adicionales: constitución (~3.000-5.000 €), contabilidad obligatoria (~1.500-3.000 €/año), modelo 200, etc. El umbral real de rentabilidad es mayor que el fiscal.*`,
        `📚 ${r.fuenteDatos}`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_declaracion_conjunta
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_declaracion_conjunta',
    'Compara el IRPF total entre presentar la declaración de forma individual ' +
    '(cada cónyuge por separado) o conjunta (unidad familiar con reducción especial de 3.400€). ' +
    'Calcula cuál opción resulta más favorable y el ahorro o coste adicional. ' +
    'Generalmente la conjunta conviene cuando un cónyuge tiene ingresos bajos o nulos. ' +
    '⚠️ Estimación con tipos estatal + autonómico medio. No incluye deducciones específicas de cada CCAA.',
    {
      salarioBruto1: z.number().min(0)
        .describe('Salario bruto anual del cónyuge 1 (el de más ingresos, normalmente) en euros'),
      salarioBruto2: z.number().min(0)
        .describe('Salario bruto anual del cónyuge 2 en euros. Puede ser 0 si no trabaja.'),
      retenciones1: z.number().min(0).optional()
        .describe('Retenciones practicadas al cónyuge 1 en euros. Por defecto 0.'),
      retenciones2: z.number().min(0).optional()
        .describe('Retenciones practicadas al cónyuge 2 en euros. Por defecto 0.'),
      otrosRendimientos1: z.number().min(0).optional()
        .describe('Otros rendimientos netos del cónyuge 1 (alquiler, dividendos, etc.) en euros. Por defecto 0.'),
      otrosRendimientos2: z.number().min(0).optional()
        .describe('Otros rendimientos netos del cónyuge 2 en euros. Por defecto 0.'),
      numHijos: z.number().int().min(0).max(10).optional()
        .describe('Número de hijos a cargo. Por defecto 0.'),
      hijosMenores3: z.number().int().min(0).max(5).optional()
        .describe('Número de hijos menores de 3 años. Por defecto 0.'),
    },
    async ({ salarioBruto1, salarioBruto2, retenciones1, retenciones2, otrosRendimientos1, otrosRendimientos2, numHijos, hijosMenores3 }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_declaracion_conjunta', aiCaller);

      let r;
      try {
        r = calcularDeclaracionConjunta({
          conyuge1: { salarioBruto: salarioBruto1, retenciones: retenciones1, otrosRendimientos: otrosRendimientos1 },
          conyuge2: { salarioBruto: salarioBruto2, retenciones: retenciones2, otrosRendimientos: otrosRendimientos2 },
          numHijos,
          hijosMenores3,
        });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtDif = (n: number) => `${n >= 0 ? '+' : ''}${fmt(n)}`;
      const ganador = r.convieneConjunta ? '✅ **CONVIENE declaración CONJUNTA**' : '✅ **CONVIENE declaración INDIVIDUAL**';
      const lineas = [
        `📊 **IRPF: Individual vs Conjunta**`,
        '',
        `💶 Cónyuge 1: ${fmt(salarioBruto1)} € bruto | Cónyuge 2: ${fmt(salarioBruto2)} € bruto`,
        '',
        `📋 **INDIVIDUAL (suma de ambas declaraciones)**`,
        `  Base imponible: ${fmt(r.individual.baseImponible1 + r.individual.baseImponible2)} €`,
        `  Base liquidable: ${fmt(r.individual.baseLiquidable)} €`,
        `  Cuota IRPF total: **${fmt(r.individual.cuotaIRPF)} €**`,
        `  Retenciones: ${fmt(r.individual.retenciones)} €`,
        `  Cuota diferencial: ${fmtDif(r.individual.cuotaDiferencial)} € ${r.individual.cuotaDiferencial >= 0 ? '(a pagar)' : '(a devolver)'}`,
        `  Tipo efectivo: ${r.individual.tipoEfectivo.toFixed(2).replace('.', ',')}%`,
        '',
        `📋 **CONJUNTA (unidad familiar)**`,
        `  Base imponible: ${fmt(r.conjunta.baseImponible1 + r.conjunta.baseImponible2)} €`,
        `  Reducción conjunta (art. 84): -3.400 €`,
        `  Base liquidable: ${fmt(r.conjunta.baseLiquidable)} €`,
        `  Cuota IRPF total: **${fmt(r.conjunta.cuotaIRPF)} €**`,
        `  Retenciones: ${fmt(r.conjunta.retenciones)} €`,
        `  Cuota diferencial: ${fmtDif(r.conjunta.cuotaDiferencial)} € ${r.conjunta.cuotaDiferencial >= 0 ? '(a pagar)' : '(a devolver)'}`,
        `  Tipo efectivo: ${r.conjunta.tipoEfectivo.toFixed(2).replace('.', ',')}%`,
        '',
        `${ganador}`,
        `💡 ${r.convieneConjunta ? 'Ahorro' : 'Coste adicional'} de la conjunta: **${fmt(r.ahorroCojunta)} €/año**`,
        '',
        `📚 ${r.fuenteDatos}`,
        `⚠️ *Estimación con tipos estatal + autonómico medio. No incluye deducciones autonómicas ni circunstancias específicas. Verificar con Renta Web de la AEAT.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_subida_salarial
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_subida_salarial',
    'Calcula el impacto real en el salario neto de una subida salarial bruta, ' +
    'teniendo en cuenta la progresividad del IRPF y las cotizaciones a la Seguridad Social. ' +
    'Devuelve cuánto sube el neto, qué porcentaje de la subida bruta llega al bolsillo ' +
    'y cuánto se queda en IRPF y SS. ' +
    'Encadenable con calcular_sueldo_neto, calcular_irpf. ' +
    'Ideal para: "Me suben el sueldo 3.000€ brutos, ¿cuánto me sube el neto?"',
    {
      salarioBrutoActual: z.number().positive().describe('Salario bruto anual actual en euros.'),
      salarioBrutoNuevo: z.number().positive().optional()
        .describe('Salario bruto anual nuevo en euros. Indica este o subirBruto.'),
      subirBruto: z.number().positive().optional()
        .describe('Incremento del salario bruto en euros. Indica este o salarioBrutoNuevo.'),
      pagas: z.number().int().min(12).max(14).optional()
        .describe('Número de pagas al año (12 o 14). Por defecto 14.'),
    },
    async ({ salarioBrutoActual, salarioBrutoNuevo, subirBruto, pagas }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_subida_salarial', aiCaller);

      let r;
      try {
        r = calcularSubidaSalarial({ salarioBrutoActual, salarioBrutoNuevo, subirBruto, pagas });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `💼 **Impacto de la Subida Salarial**`,
        '',
        `📊 **Situación actual → Nueva:**`,
        `  Bruto anual: ${fmt(r.actual.brutoAnual)} € → **${fmt(r.nuevo.brutoAnual)} €** (+${fmt(r.incrementoBruto)} €)`,
        `  SS trabajador: ${fmt(r.actual.cuotaSSAnual)} € → ${fmt(r.nuevo.cuotaSSAnual)} €`,
        `  IRPF: ${fmt(r.actual.cuotaIRPF)} € (${r.actual.tipoEfectivoIRPF.toFixed(2).replace('.', ',')}%) → ${fmt(r.nuevo.cuotaIRPF)} € (${r.nuevo.tipoEfectivoIRPF.toFixed(2).replace('.', ',')}%)`,
        `  **Neto anual: ${fmt(r.actual.netoAnual)} € → ${fmt(r.nuevo.netoAnual)} €**`,
        `  **Neto mensual: ${fmt(r.actual.netoMensual)} € → ${fmt(r.nuevo.netoMensual)} €**`,
        '',
        `💡 **Subida de ${fmt(r.incrementoBruto)} € brutos:**`,
        `  Sube el neto en: **+${fmt(r.incrementoNetoAnual)} €/año (+${fmt(r.incrementoNetoMensual)} €/mes)**`,
        `  Se queda en SS: ${fmt(r.retenciones.ssAdicional)} € | En IRPF: ${fmt(r.retenciones.irpfAdicional)} €`,
        `  → De cada 100 € de subida bruta, **${r.pctSubidaEfectiva.toFixed(1).replace('.', ',')} € llegan al neto** (${r.pctRetenidoFisco.toFixed(1).replace('.', ',')}% al fisco)`,
        '',
        `⚠️ *Estimación con tramos estatales + autonómicos medios sin deducciones personales.*`,
      ];
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_pago_fraccionado
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_pago_fraccionado',
    'Calcula el pago fraccionado trimestral del IRPF para autónomos en estimación directa ' +
    '(Modelo 130 AEAT). Fórmula: 20% × (ingresos - gastos - cuotas SS) - retenciones soportadas - pagos anteriores. ' +
    'Devuelve el importe a ingresar o el saldo negativo a compensar en el siguiente trimestre. ' +
    'Encadenable con calcular_cuota_autonomo, calcular_irpf. ' +
    'Ideal para: "Soy autónomo, ¿cuánto tengo que pagar en el modelo 130 del segundo trimestre?"',
    {
      trimestre: z.number().int().min(1).max(4).describe('Trimestre a calcular (1, 2, 3 o 4).'),
      ingresosAcumulados: z.number().min(0)
        .describe('Ingresos brutos acumulados desde el 1 de enero hasta el fin del trimestre en euros.'),
      gastosDeduciblesAcumulados: z.number().min(0)
        .describe('Gastos deducibles acumulados desde el 1 de enero (sin incluir cuotas SS) en euros.'),
      cuotasSSAcumuladas: z.number().min(0)
        .describe('Cuotas RETA (SS) pagadas y acumuladas desde el 1 de enero en euros.'),
      retencionesSoportadasAcumuladas: z.number().min(0).optional()
        .describe('Retenciones soportadas acumuladas (facturas emitidas con retención 7% o 15%) en euros. Por defecto 0.'),
      pagosFraccionadosAnteriores: z.number().min(0).optional()
        .describe('Suma de pagos fraccionados ya ingresados en trimestres anteriores del mismo año en euros. Por defecto 0.'),
      actividadAgricola: z.boolean().optional()
        .describe('¿Actividad agrícola, ganadera, forestal o pesquera? Aplica 2% en lugar del 20%. Por defecto false.'),
    },
    async ({ trimestre, ingresosAcumulados, gastosDeduciblesAcumulados, cuotasSSAcumuladas, retencionesSoportadasAcumuladas, pagosFraccionadosAnteriores, actividadAgricola }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_pago_fraccionado', aiCaller);

      let r;
      try {
        r = calcularPagoFraccionado({ trimestre: trimestre as Trimestre, ingresosAcumulados, gastosDeduciblesAcumulados, cuotasSSAcumuladas, retencionesSoportadasAcumuladas, pagosFraccionadosAnteriores, actividadAgricola });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `📋 **Modelo 130 — ${r.trimestre}T IRPF Autónomos**`,
        '',
        `📊 **Acumulado enero → fin ${r.trimestre}T:**`,
        `  Ingresos: ${fmt(ingresosAcumulados)} €`,
        `  Gastos deducibles: -${fmt(gastosDeduciblesAcumulados)} €`,
        `  Cuotas SS (RETA): -${fmt(cuotasSSAcumuladas)} €`,
        `  **Rendimiento neto acumulado: ${fmt(r.rendimientoNetoAcumulado)} €**`,
        '',
        `🧮 **Cálculo del pago:**`,
        `  ${r.porcentajeAplicado}% × ${fmt(r.baseCalculo)} € = ${fmt(r.cuotaPrevia)} €`,
        r.retencionesSoportadas > 0 ? `  - Retenciones soportadas: -${fmt(r.retencionesSoportadas)} €` : '',
        r.pagosFraccionadosAnteriores > 0 ? `  - Pagos anteriores (${r.trimestre > 1 ? `T${r.trimestre - 1} acumulado` : '—'}): -${fmt(r.pagosFraccionadosAnteriores)} €` : '',
        '',
        r.pagoAIngresar > 0
          ? `💶 **A ingresar en Hacienda: ${fmt(r.pagoAIngresar)} €**`
          : `✅ **Resultado: 0 € a ingresar** ${r.resultadoNegativo ? `(saldo negativo de ${fmt(r.saldoACompensarSiguienteT)} € a compensar en ${r.trimestre < 4 ? `T${r.trimestre + 1}` : 'la declaración anual'})` : ''}`,
        '',
        `📅 Fecha límite de presentación: **${r.fechaLimite}**`,
        `📚 Fuente: LIRPF art. 99 + RD 439/2007 art. 110 — Modelo 130 AEAT`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_baja_medica
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_baja_medica',
    'Calcula el subsidio por incapacidad temporal (baja médica) para trabajadores por cuenta ajena. ' +
    'Cubre contingencia común (60% BC días 4-20, 75% día 21+) y accidente laboral (75% desde día 1). ' +
    'Devuelve el subsidio diario, mensual y total para los días de baja, y la pérdida respecto al salario habitual. ' +
    'Encadenable con calcular_sueldo_neto, calcular_pension_desempleo. ' +
    'Ideal para: "¿Cuánto cobro si me pongo de baja 30 días?" o "¿Qué pierdo mensualmente si tengo un accidente?"',
    {
      salarioBrutoMensual: z.number().positive()
        .describe('Salario bruto mensual del trabajador en euros.'),
      tipoBaja: z.enum(['comun', 'accidente_laboral'])
        .describe('"comun" = enfermedad común o accidente no laboral. "accidente_laboral" = accidente de trabajo o enfermedad profesional.'),
      diasBaja: z.number().int().min(1).max(730).optional()
        .describe('Número de días de baja a simular. Por defecto 30.'),
      empresaPagaDiasEspera: z.boolean().optional()
        .describe('¿La empresa cubre los 3 días de espera según convenio colectivo? Por defecto false.'),
    },
    async ({ salarioBrutoMensual, tipoBaja, diasBaja, empresaPagaDiasEspera }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_baja_medica', aiCaller);

      let r;
      try {
        r = calcularBajaMedica({ salarioBrutoMensual, tipoBaja: tipoBaja as TipoBaja, diasBaja, empresaPagaDiasEspera });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const tipoTexto = tipoBaja === 'accidente_laboral' ? 'Accidente Laboral / EP' : 'Contingencia Común';
      const lineas = [
        `🏥 **Subsidio por Baja Médica — ${tipoTexto}**`,
        '',
        `💼 Salario bruto mensual: ${fmt(salarioBrutoMensual)} € | Base cotización diaria: ${fmt(r.baseCotizacionDiaria)} €`,
        `📅 Días de baja simulados: ${r.diasBaja} días`,
        '',
        `📊 **Subsidio por período:**`,
        ...r.desglose.map(d => d.pct === 0
          ? `  ${d.periodo}: **sin subsidio** (${d.dias} días)`
          : `  ${d.periodo}: ${fmt(d.importeDiario)} €/día × ${d.dias} días = **${fmt(d.total)} €**`
        ),
        '',
        `💶 **Total subsidio en ${r.diasBaja} días: ${fmt(r.totalSubsidio)} €**`,
        `📆 Subsidio mensual equivalente: ${fmt(r.subsidioMensualEquivalente)} €`,
        `📉 Pérdida respecto al salario habitual: **${fmt(r.perdidaEstimada)} €/mes**`,
        '',
        `⚠️ *El subsidio no está sujeto a cotización SS durante la baja, pero sí tributa en el IRPF.*`,
        `📚 Fuente: LGSS arts. 169-176`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_periodo_carencia
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_periodo_carencia',
    'Calcula el impacto económico de un período de carencia en una hipoteca o préstamo. ' +
    'Tipos: carencia total (solo pago de intereses, sin amortizar capital) o parcial (cuota reducida). ' +
    'Devuelve: cuota durante la carencia, nueva cuota tras reincorporarse, sobrecoste total ' +
    'y comparativa con/sin carencia. ' +
    'Encadenable con calcular_hipoteca, calcular_prestamo. ' +
    'Ideal para: "¿Cuánto me cuesta pedir 6 meses de carencia en la hipoteca?"',
    {
      capitalPendiente: z.number().positive().describe('Capital pendiente del préstamo o hipoteca en euros.'),
      tasaAnual: z.number().min(0).describe('Tipo de interés anual en porcentaje.'),
      plazoRestanteMeses: z.number().int().positive().describe('Plazo restante del préstamo en meses.'),
      mesesCarencia: z.number().int().min(1).describe('Duración del período de carencia en meses.'),
      tipoCarencia: z.enum(['total', 'parcial']).optional()
        .describe('"total" = solo intereses durante la carencia. "parcial" = cuota reducida acordada con el banco. Por defecto "total".'),
      cuotaCarenciaParcial: z.number().positive().optional()
        .describe('Cuota mensual acordada durante la carencia parcial en euros. Solo para tipo "parcial".'),
    },
    async ({ capitalPendiente, tasaAnual, plazoRestanteMeses, mesesCarencia, tipoCarencia, cuotaCarenciaParcial }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_periodo_carencia', aiCaller);

      let r;
      try {
        r = calcularPeriodoCarencia({ capitalPendiente, tasaAnual, plazoRestanteMeses, mesesCarencia, tipoCarencia: tipoCarencia as TipoCarencia | undefined, cuotaCarenciaParcial });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const tipoTexto = r.tipoCarencia === 'total' ? 'Carencia Total (solo intereses)' : 'Carencia Parcial';
      const lineas = [
        `⏸️ **Período de Carencia — ${tipoTexto}**`,
        '',
        `💰 Capital pendiente: ${fmt(r.capitalPendiente)} € | Tasa: ${tasaAnual}% | Plazo restante: ${plazoRestanteMeses} meses`,
        '',
        `📊 **Durante la carencia (${r.mesesCarencia} meses):**`,
        `  Cuota mensual: **${fmt(r.cuotaDuranteCarencia)} €** (solo intereses${r.tipoCarencia === 'total' ? '' : ' + amortización parcial'})`,
        `  Intereses pagados: ${fmt(r.interesesCarencia)} €`,
        `  Capital amortizado: ${fmt(r.capitalAmortizadoCarencia)} €`,
        `  Capital pendiente al terminar la carencia: ${fmt(r.capitalTrasCarencia)} €`,
        '',
        `📊 **Tras la carencia (${r.plazoTrasCarencia} meses restantes):**`,
        `  Nueva cuota mensual: **${fmt(r.nuevaCuotaTrasCarencia)} €**`,
        `  Cuota sin carencia habría sido: ${fmt(r.cuotaSinCarencia)} €`,
        '',
        `💸 **Comparativa de costes:**`,
        `  Total pagado SIN carencia: ${fmt(r.totalSinCarencia)} €`,
        `  Total pagado CON carencia: ${fmt(r.totalConCarencia)} €`,
        `  **Sobrecoste de la carencia: +${fmt(r.sobrecostCarencia)} €**`,
        '',
        `⚠️ *La carencia alivia la carga a corto plazo pero incrementa el coste total del préstamo.*`,
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

      return { content: [{ type: 'text', text: texto }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_valor_presente
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_valor_presente',
    'Calcula el valor presente (valor actual) de: ' +
    'A) Un capital futuro único (¿cuánto vale hoy 100.000€ recibidos en 10 años?), ' +
    'B) Una renta periódica (anualidad ordinaria o anticipada), ' +
    'C) Una perpetuidad (renta infinita). ' +
    'También calcula el valor futuro dado un capital presente. ' +
    'Encadenable con calcular_tir_van, calcular_interes_compuesto, calcular_regla_72. ' +
    'Ideal para: "¿Cuánto vale hoy una renta de 500€/mes durante 20 años al 5%?"',
    {
      modo: z.enum(['capital_futuro', 'renta', 'perpetuidad'])
        .describe('"capital_futuro" = descuenta un capital único. "renta" = valor presente de pagos periódicos. "perpetuidad" = renta infinita.'),
      tasaAnual: z.number().min(0).describe('Tasa de descuento o interés anual en porcentaje.'),
      importe: z.number().positive()
        .describe('Para "capital_futuro": importe del capital futuro. Para "renta" o "perpetuidad": importe del pago periódico. En euros.'),
      periodos: z.number().positive().optional()
        .describe('Número de períodos. Para "capital_futuro": años. Para "renta": número de pagos. Obligatorio excepto para "perpetuidad".'),
      periodicidad: z.enum(['mensual', 'trimestral', 'semestral', 'anual']).optional()
        .describe('Frecuencia de los pagos para "renta" o "perpetuidad". Por defecto "anual".'),
      tipoRenta: z.enum(['ordinaria', 'anticipada']).optional()
        .describe('Para modo "renta": "ordinaria" = pagos al final del período. "anticipada" = pagos al inicio. Por defecto "ordinaria".'),
      valorPresenteConocido: z.number().positive().optional()
        .describe('Para calcular el valor futuro: capital presente conocido en euros.'),
    },
    async ({ modo, tasaAnual, importe, periodos, periodicidad, tipoRenta, valorPresenteConocido }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_valor_presente', aiCaller);

      let r;
      try {
        r = calcularValorPresente({ modo: modo as ModoValorPresente, tasaAnual, importe, periodos, periodicidad: periodicidad as Periodicidad | undefined, tipoRenta: tipoRenta as TipoRenta | undefined, valorPresenteConocido });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `📐 **Valor Presente / Valor Actual**`,
        '',
        r.interpretacion,
        '',
        `💶 **Valor presente: ${fmt(r.valorPresente)} €**`,
        r.totalNominal ? `📊 Total nominal (sin descontar): ${fmt(r.totalNominal)} €` : '',
        r.descuentoTotal ? `📉 Descuento total aplicado: ${fmt(r.descuentoTotal)} €` : '',
        r.tasaPorPeriodo !== r.tasaAnual ? `📈 Tasa por período (${r.periodicidad}): ${r.tasaPorPeriodo.toFixed(4).replace('.', ',')}%` : '',
        valorPresenteConocido && r.valorFuturo ? `\n🔮 Valor futuro de ${fmt(valorPresenteConocido)} € en ${periodos} años: **${fmt(r.valorFuturo)} €**` : '',
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_plan_pensiones
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_plan_pensiones',
    'Calcula el ahorro fiscal anual por aportaciones a plan de pensiones privado y la proyección ' +
    'del capital acumulado hasta la jubilación. ' +
    'Aplica los límites 2025: máximo 1.500€ individual + 8.500€ empresarial deducibles (art. 51 LIRPF). ' +
    'Incluye advertencia sobre la tributación del rescate como rendimiento del trabajo. ' +
    'Encadenable con calcular_pension_complementaria, calcular_irpf, calcular_pension_publica. ' +
    'Ideal para: "Si aporto 1.000€/año al plan de pensiones, ¿cuánto me ahorro en la declaración?"',
    {
      rendimientosNetos: z.number().positive()
        .describe('Rendimientos netos del trabajo y actividades económicas en euros/año (base para el tipo marginal y límite porcentual).'),
      aportacionIndividual: z.number().min(0)
        .describe('Aportación individual anual al plan de pensiones en euros (límite deducible 1.500€).'),
      aportacionEmpresarial: z.number().min(0).optional()
        .describe('Aportación de la empresa al plan de pensiones del trabajador en euros/año (límite adicional 8.500€). Por defecto 0.'),
      edadActual: z.number().int().min(18).max(70).describe('Edad actual del partícipe.'),
      edadJubilacion: z.number().int().min(55).max(75).optional()
        .describe('Edad prevista de jubilación. Por defecto 67.'),
      rentabilidadAnual: z.number().min(0).max(15).optional()
        .describe('Rentabilidad anual esperada del plan en porcentaje. Por defecto 4%.'),
      capitalActual: z.number().min(0).optional()
        .describe('Capital ya acumulado en el plan en euros. Por defecto 0.'),
    },
    async ({ rendimientosNetos, aportacionIndividual, aportacionEmpresarial, edadActual, edadJubilacion, rentabilidadAnual, capitalActual }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_plan_pensiones', aiCaller);

      let r;
      try {
        r = calcularPlanPensiones({ rendimientosNetos, aportacionIndividual, aportacionEmpresarial, edadActual, edadJubilacion, rentabilidadAnual, capitalActual });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtK = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(2).replace('.', ',')} M€` : `${Math.round(n).toLocaleString('es-ES')} €`;
      const lineas = [
        `🏦 **Plan de Pensiones — Ahorro Fiscal 2025**`,
        '',
        `💶 Aportación individual: ${fmt(r.aportacionIndividual)} € | Empresarial: ${fmt(r.aportacionEmpresarial)} €`,
        `📊 Límite deducible: **${fmt(r.limiteDeducible)} €** | Base reducible efectiva: ${fmt(r.baseReducible)} €`,
        r.superaLimite ? `⚠️ Exceso no deducible: ${fmt(r.excesoNoDeducible)} €` : '',
        '',
        `💚 **Ahorro fiscal anual: ${fmt(r.ahorroFiscalAnual)} €** (tipo marginal ${r.tipoMarginal}%)`,
        `💸 Coste neto real de la aportación: **${fmt(r.costeNetoAnual)} €**`,
        `   (aportas ${fmt(r.aportacionTotal)} € pero te cuesta ${fmt(r.costeNetoAnual)} € tras la deducción)`,
        '',
        `📈 **Proyección hasta jubilación (${r.anosAhorro} años, ${rentabilidadAnual ?? 4}% anual):**`,
        `  Capital estimado: **${fmtK(r.capitalEstimadoJubilacion)}**`,
        `  Renta mensual estimada (4% perpetuo): **${fmt(r.rentaMensualEstimada)} €/mes**`,
        '',
        `⚠️ ${r.advertenciaRescate}`,
        `📚 ${r.fuenteDatos}`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_leasing
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_leasing',
    'Compara el coste total de adquirir un vehículo mediante leasing financiero, renting operativo ' +
    'o compra (al contado o con préstamo). Calcula la cuota mensual, el total pagado, el valor final ' +
    'del vehículo y el ahorro fiscal para autónomos y empresas. ' +
    'Encadenable con calcular_kilometraje, comparar_autonomo_vs_sl, calcular_prestamo. ' +
    'Ideal para: "¿Me conviene más el leasing o la compra del coche para mi empresa?"',
    {
      precioVehiculo: z.number().positive().describe('Precio del vehículo en euros.'),
      mesesContrato: z.number().int().min(12).max(72).optional()
        .describe('Duración del contrato de leasing o renting en meses. Por defecto 48.'),
      cuotaLeasingMensual: z.number().positive().optional()
        .describe('Cuota mensual del leasing financiero en euros (si tienes oferta concreta).'),
      valorResidual: z.number().min(0).optional()
        .describe('Valor residual del leasing al final del contrato en euros. Por defecto 15% del precio.'),
      cuotaRentingMensual: z.number().positive().optional()
        .describe('Cuota mensual del renting operativo en euros (todo incluido: seguro, mantenimiento, etc.).'),
      entradaCompra: z.number().min(0).optional()
        .describe('Entrada o pago inicial en la compra en euros. Por defecto 0.'),
      tasaPrestamoCompra: z.number().min(0).optional()
        .describe('Tipo de interés anual del préstamo de compra en porcentaje. Por defecto 6%.'),
      tipoFiscal: z.enum(['particular', 'autonomo', 'empresa']).optional()
        .describe('Perfil fiscal para calcular deducciones. Por defecto "particular".'),
      tipoImpuesto: z.number().min(0).max(50).optional()
        .describe('Tipo del IS o tipo marginal IRPF del autónomo en porcentaje para calcular ahorro fiscal. Por defecto 25%.'),
      usoExclusivoActividad: z.boolean().optional()
        .describe('¿El vehículo es de uso exclusivo para la actividad? Afecta al IVA deducible. Por defecto false.'),
    },
    async ({ precioVehiculo, mesesContrato, cuotaLeasingMensual, valorResidual, cuotaRentingMensual, entradaCompra, tasaPrestamoCompra, tipoFiscal, tipoImpuesto, usoExclusivoActividad }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_leasing', aiCaller);

      let r;
      try {
        r = calcularLeasing({ precioVehiculo, mesesContrato, cuotaLeasingMensual, valorResidual, cuotaRentingMensual, entradaCompra, tasaPrestamoCompra, tipoFiscal: tipoFiscal as TipoFiscalLeasing | undefined, tipoImpuesto, usoExclusivoActividad });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fila = (m: typeof r.leasing) => m.disponible
        ? `  ${m.nombre}: cuota ${fmt(m.cuotaMensual)} €/mes | total ${fmt(m.totalPagado)} € | valor final ${fmt(m.valorFinalVehiculo)} € | coste neto **${fmt(m.costeNeto)} €**${m.ahorroFiscal > 0 ? ` (ahorro fiscal: ${fmt(m.ahorroFiscal)} €)` : ''}${m.incluyeServicios ? ' ✅ todo incluido' : ''}`
        : `  ${m.nombre}: no disponible (${m.razonNoDisponible})`;

      const lineas = [
        `🚗 **Leasing vs Renting vs Compra**`,
        '',
        `💶 Vehículo: ${fmt(precioVehiculo)} € | Duración: ${r.mesesContrato} meses | Perfil: ${r.tipoFiscal}`,
        '',
        fila(r.leasing),
        fila(r.renting),
        fila(r.compra),
        '',
        `✅ **Modalidad más económica: ${r.modalidadMasEconomica}**`,
        r.diferenciaCosteMasBarata > 0 ? `   (Ahorra ${fmt(r.diferenciaCosteMasBarata)} € vs la opción más cara)` : '',
        '',
        `⚠️ *El renting incluye seguro y mantenimiento (comparación no directa). Coste neto para autónomos/empresas incluye ahorro fiscal estimado (IVA + IS/IRPF).*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_rentabilidad_alquiler
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_rentabilidad_alquiler',
    'Calcula la rentabilidad bruta, neta, cash flow mensual y payback de una inversión inmobiliaria en alquiler. ' +
    'Encadenable con calcular_hipoteca, calcular_retencion_alquiler, calcular_irpf. ' +
    'Ideal para responder: "¿Vale la pena comprar este piso para alquilarlo?" o ' +
    '"¿Cuánto dinero saco neto cada mes de un alquiler?"',
    {
      precioCompra: z.number().positive().describe('Precio de compra del inmueble en euros.'),
      alquilerMensual: z.number().positive().describe('Alquiler mensual esperado en euros.'),
      porcentajeGastosCompra: z.number().min(0).max(20).optional()
        .describe('Porcentaje de gastos de compra (ITP/AJD, notaría, registro). Por defecto 10%.'),
      reforma: z.number().min(0).optional().describe('Coste de reforma e inversión inicial adicional en euros. Por defecto 0.'),
      tasaOcupacion: z.number().min(0).max(100).optional()
        .describe('Tasa de ocupación esperada en porcentaje (días alquilados vs total). Por defecto 95%.'),
      ibi: z.number().min(0).optional().describe('IBI anual en euros. Por defecto 0.'),
      comunidad: z.number().min(0).optional().describe('Gastos de comunidad anuales en euros. Por defecto 0.'),
      seguro: z.number().min(0).optional().describe('Seguro de hogar anual en euros. Por defecto 0.'),
      mantenimiento: z.number().min(0).optional().describe('Mantenimiento y reparaciones anuales estimados en euros. Por defecto 0.'),
      conHipoteca: z.boolean().optional().describe('¿El inmueble tiene hipoteca? Por defecto false.'),
      capitalHipoteca: z.number().positive().optional().describe('Capital hipotecario en euros.'),
      tasaHipoteca: z.number().positive().optional().describe('Tipo de interés anual de la hipoteca en porcentaje. Por defecto 3.5%.'),
      aniosHipoteca: z.number().positive().optional().describe('Plazo de la hipoteca en años. Por defecto 25.'),
    },
    async ({ precioCompra, alquilerMensual, porcentajeGastosCompra, reforma, tasaOcupacion, ibi, comunidad, seguro, mantenimiento, conHipoteca, capitalHipoteca, tasaHipoteca, aniosHipoteca }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_rentabilidad_alquiler', aiCaller);

      let r;
      try {
        r = calcularRentabilidadAlquiler({ precioCompra, alquilerMensual, porcentajeGastosCompra, reforma, tasaOcupacion, ibi, comunidad, seguro, mantenimiento, conHipoteca, capitalHipoteca, tasaHipoteca, aniosHipoteca });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const semaforo = r.valoracion === 'excelente' ? '🟢' : r.valoracion === 'aceptable' ? '🟡' : r.valoracion === 'baja' ? '🟠' : '🔴';
      const lineas = [
        `🏠 **Rentabilidad de Alquiler**`,
        '',
        `💰 Inversión total: **${fmt(r.inversionTotal)} €** (precio + ${fmt(r.gastosCompra)} € gastos + reforma)`,
        `📅 Alquiler bruto anual (${tasaOcupacion ?? 95}% ocupación): ${fmt(r.alquilerBrutoAnual)} €`,
        `📉 Gastos anuales totales: ${fmt(r.gastosTotalesAnual)} €`,
        conHipoteca ? `  └ Hipoteca: ${fmt(r.cuotaHipotecaMensual)} €/mes (${fmt(r.cuotaHipotecaMensual * 12)} €/año)` : '',
        '',
        `📊 **Resultados:**`,
        `  Rentabilidad bruta: **${r.rentabilidadBruta.toFixed(2).replace('.', ',')}%**`,
        `  Rentabilidad neta: **${r.rentabilidadNeta.toFixed(2).replace('.', ',')}%**`,
        `  Cash flow mensual: **${r.cashFlowMensual >= 0 ? '+' : ''}${fmt(r.cashFlowMensual)} €/mes**`,
        `  Payback: **${r.paybackAnios >= 9999 ? 'Nunca (cash flow negativo)' : `${r.paybackAnios.toFixed(1).replace('.', ',')} años`}**`,
        '',
        `${semaforo} **${r.valoracion === 'excelente' ? 'Excelente inversión (≥7% neto)' : r.valoracion === 'aceptable' ? 'Inversión aceptable (4-7% neto, media del mercado español)' : r.valoracion === 'baja' ? 'Rentabilidad baja (1-4% neto)' : 'Cash flow negativo — los gastos superan los ingresos'}**`,
        '',
        `⚠️ *Rentabilidad antes de IRPF. Usa calcular_retencion_alquiler para el impacto fiscal.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_estrategia_deuda
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_estrategia_deuda',
    'Compara los métodos Avalancha (mayor interés primero) y Bola de Nieve (menor saldo primero) ' +
    'para pagar múltiples deudas, con soporte para pagos extra mensuales. ' +
    'Devuelve: total intereses pagados, meses hasta liquidar, ahorro vs pagar solo mínimos y método recomendado. ' +
    'Encadenable con calcular_prestamo, calcular_break_even. ' +
    'Ideal para: "Tengo 3 préstamos, ¿cómo pago menos intereses?"',
    {
      deudas: z.array(z.object({
        nombre: z.string().describe('Nombre identificativo de la deuda.'),
        saldo: z.number().positive().describe('Saldo pendiente actual en euros.'),
        tasaInteres: z.number().min(0).describe('Tipo de interés anual en porcentaje.'),
        pagoMinimo: z.number().positive().describe('Pago mínimo mensual en euros.'),
      })).min(1).max(10).describe('Lista de deudas a analizar (máximo 10).'),
      pagoExtraMensual: z.number().min(0).optional()
        .describe('Pago extra mensual adicional sobre los mínimos en euros. Por defecto 0.'),
    },
    async ({ deudas, pagoExtraMensual }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_estrategia_deuda', aiCaller);

      let r;
      try {
        r = calcularEstrategiaDeuda({ deudas: deudas as DeudaInput[], pagoExtraMensual });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const mesesAAnios = (m: number) => `${Math.floor(m / 12)} años ${m % 12} meses`;
      const lineas = [
        `💳 **Estrategia de Pago de Deudas**`,
        '',
        `📊 Total deuda: **${fmt(r.totalDeuda)} €** | Pago mínimo total: ${fmt(r.pagoMinimoTotal)} €/mes${pagoExtraMensual ? ` + ${fmt(pagoExtraMensual)} € extra` : ''}`,
        '',
        `🏔️ **Método Avalancha** (mayor interés primero):`,
        `  Total intereses: **${fmt(r.avalancha.totalIntereses)} €**`,
        `  Tiempo para liquidar: **${mesesAAnios(r.avalancha.mesesTotales)}**`,
        `  Ahorro vs solo mínimos: **${fmt(r.avalancha.ahorroVsMinimo)} €**`,
        '',
        `⛄ **Método Bola de Nieve** (menor saldo primero):`,
        `  Total intereses: **${fmt(r.bolaNieve.totalIntereses)} €**`,
        `  Tiempo para liquidar: **${mesesAAnios(r.bolaNieve.mesesTotales)}**`,
        `  Ahorro vs solo mínimos: **${fmt(r.bolaNieve.ahorroVsMinimo)} €**`,
        '',
        `🐢 **Solo mínimos** (sin pago extra):`,
        `  Total intereses: **${fmt(r.soloMinimos.totalIntereses)} €**`,
        `  Tiempo: **${mesesAAnios(r.soloMinimos.mesesTotales)}**`,
        '',
        `✅ **Método recomendado: ${r.metodoRecomendado}** (ahorra ${fmt(r.diferenciaEntreMetodos)} € vs el otro método)`,
        '',
        `💡 Ambos métodos con ${pagoExtraMensual ? `${fmt(pagoExtraMensual)} € de pago extra` : 'el pago mínimo'} ahorran ${fmt(Math.min(r.avalancha.ahorroVsMinimo, r.bolaNieve.ahorroVsMinimo))} €+ en intereses vs pagar solo los mínimos.`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_capacidad_hipoteca
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_capacidad_hipoteca',
    'Estima el máximo préstamo hipotecario que un hogar puede asumir de forma sostenible, ' +
    'aplicando la regla de esfuerzo hipotecario del Banco de España (cuota ≤ 30-35% ingresos netos). ' +
    'Devuelve: capital máximo financiable, precio máximo de vivienda, entrada disponible, ' +
    'porcentaje de financiación y advertencias. ' +
    'Encadenable con calcular_hipoteca, calcular_sueldo_neto. ' +
    'Ideal para: "Con mi sueldo, ¿cuánta hipoteca puedo pedir?" o "¿Puedo comprar una casa de X euros?"',
    {
      ingresosMensualesNetos: z.number().positive()
        .describe('Ingresos netos mensuales del hogar (todos los miembros) en euros.'),
      ahorrosDisponibles: z.number().min(0)
        .describe('Ahorros disponibles para la entrada en euros.'),
      otrasDeudasMensuales: z.number().min(0).optional()
        .describe('Otras cuotas de deuda ya existentes (préstamo coche, personal, etc.) en euros/mes. Por defecto 0.'),
      tasaInteres: z.number().positive().optional()
        .describe('Tipo de interés a aplicar en la simulación en porcentaje. Por defecto 3.5%.'),
      plazo: z.number().int().positive().optional()
        .describe('Plazo de la hipoteca en años. Por defecto 30.'),
      umbralEsfuerzo: z.number().min(20).max(40).optional()
        .describe('Umbral máximo de esfuerzo hipotecario en porcentaje (Banco de España recomienda ≤30%). Por defecto 30%.'),
      porcentajeGastosCompra: z.number().min(5).max(15).optional()
        .describe('Porcentaje de gastos de compra a reservar de los ahorros (notaría, impuestos, registro). Por defecto 10%.'),
    },
    async ({ ingresosMensualesNetos, ahorrosDisponibles, otrasDeudasMensuales, tasaInteres, plazo, umbralEsfuerzo, porcentajeGastosCompra }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_capacidad_hipoteca', aiCaller);

      let r;
      try {
        r = calcularCapacidadHipoteca({ ingresosMensualesNetos, ahorrosDisponibles, otrasDeudasMensuales, tasaInteres, plazo, umbralEsfuerzo, porcentajeGastosCompra });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      const fmt2 = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `🏦 **Capacidad Hipotecaria**`,
        '',
        `💼 Ingresos netos: ${fmt2(ingresosMensualesNetos)} €/mes | Ahorros: ${fmt(ahorrosDisponibles)} €`,
        otrasDeudasMensuales ? `📋 Otras deudas: ${fmt2(otrasDeudasMensuales)} €/mes` : '',
        '',
        `📊 **Resultados (esfuerzo ≤${umbralEsfuerzo ?? 30}%, tasa ${tasaInteres ?? 3.5}%, ${plazo ?? 30} años):**`,
        `  Cuota máxima sostenible: **${fmt2(r.cuotaMaximaMensual)} €/mes**`,
        `  Cuota disponible tras otras deudas: **${fmt2(r.cuotaDisponible)} €/mes**`,
        `  Capital máximo financiable: **${fmt(r.capitalMaximo)} €**`,
        '',
        `🏠 **Vivienda:**`,
        `  Entrada disponible: ${fmt(r.entradaDisponible)} €`,
        `  Gastos compra reservados: ${fmt(r.gastosCompraReservados)} €`,
        `  Precio máximo vivienda: **${fmt(r.precioMaximoVivienda)} €**`,
        `  Financiación: ${r.porcentajeFinanciacion.toFixed(0)}% del precio`,
        `  Esfuerzo hipotecario real: ${r.esfuerzoHipotecario.toFixed(1).replace('.', ',')}% ${r.cumpleRecomendacionBDE ? '✅ (cumple BDE ≤30%)' : '⚠️ (supera recomendación BDE)'}`,
        r.advertencias.length > 0 ? '' : '',
        ...r.advertencias.map(a => `⚠️ ${a}`),
        '',
        `📚 Fuente: Banco de España — Guía de acceso al crédito hipotecario`,
        `⚠️ *Capacidad estimada. Los bancos aplican sus propios criterios de concesión.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_objetivo_ahorro
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_objetivo_ahorro',
    'Responde dos preguntas complementarias sobre objetivos de ahorro: ' +
    'A) ¿Cuántos meses/años necesito para ahorrar X euros dado un ahorro mensual? ' +
    'B) ¿Cuánto debo ahorrar mensualmente para alcanzar X euros en N meses? ' +
    'Considera rentabilidad del ahorro (cuenta remunerada, fondo indexado, etc.) ' +
    'Encadenable con calcular_interes_compuesto, calcular_fire, calcular_pension_complementaria. ' +
    'Ideal para: "¿Cuánto tiempo tardaré en ahorrar 30.000€ para una entrada de piso?"',
    {
      objetivoEuros: z.number().positive().describe('Objetivo de ahorro a alcanzar en euros.'),
      ahorroMensual: z.number().positive().optional()
        .describe('Ahorro mensual disponible en euros. Proporciona este campo para calcular el plazo necesario.'),
      mesesObjetivo: z.number().int().positive().optional()
        .describe('Número de meses para alcanzar el objetivo. Proporciona este campo para calcular la cuota mensual necesaria.'),
      rentabilidadAnual: z.number().min(0).optional()
        .describe('Rentabilidad anual del ahorro en porcentaje (ej: 3 para cuenta remunerada al 3%). Por defecto 0%.'),
      capitalInicial: z.number().min(0).optional()
        .describe('Capital inicial ya disponible para el objetivo en euros. Por defecto 0.'),
    },
    async ({ objetivoEuros, ahorroMensual, mesesObjetivo, rentabilidadAnual, capitalInicial }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_objetivo_ahorro', aiCaller);

      let r;
      try {
        r = calcularObjetivoAhorro({ objetivoEuros, ahorroMensual, mesesObjetivo, rentabilidadAnual, capitalInicial });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const plazoTexto = r.anios > 0
        ? `${r.anios} año${r.anios !== 1 ? 's' : ''} y ${r.mesesRestantes} mes${r.mesesRestantes !== 1 ? 'es' : ''}`
        : `${r.mesesRestantes} mes${r.mesesRestantes !== 1 ? 'es' : ''}`;
      const lineas = [
        `💰 **Objetivo de Ahorro: ${fmt(r.objetivoEuros)} €**`,
        '',
        r.capitalInicial > 0 ? `🏦 Capital inicial: ${fmt(r.capitalInicial)} € | Capital a acumular: ${fmt(r.capitalAcumular)} €` : '',
        r.rentabilidadAnual > 0 ? `📈 Rentabilidad: ${r.rentabilidadAnual}% anual` : '',
        '',
        r.meses === 0
          ? `✅ **¡El capital inicial ya cubre el objetivo!**`
          : r.modo === 'plazo'
            ? [
              `💶 Ahorrando **${fmt(r.ahorroMensual)} €/mes**`,
              `⏳ Tiempo necesario: **${plazoTexto}** (${r.meses} meses)`,
              `📊 Total aportado: ${fmt(r.totalAportado)} €`,
              r.rentabilidadAnual > 0 ? `💹 Rentabilidad generada: ${fmt(r.rentabilidadGenerada)} €` : '',
            ].join('\n')
            : [
              `⏳ Para alcanzarlo en **${plazoTexto}** (${r.meses} meses):`,
              `💶 Ahorro mensual necesario: **${fmt(r.ahorroMensual)} €/mes**`,
              `📊 Total aportado: ${fmt(r.totalAportado)} €`,
              r.rentabilidadAnual > 0 ? `💹 Rentabilidad generada: ${fmt(r.rentabilidadGenerada)} €` : '',
            ].join('\n'),
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_regla_72
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_regla_72',
    'Aplica la Regla del 72, la heurística financiera más conocida: ' +
    'A) Dado un tipo de interés anual, ¿en cuántos años se dobla el capital? ' +
    'B) Dado un plazo en años, ¿qué rentabilidad necesito para doblar el capital? ' +
    'Incluye el cálculo exacto logarítmico para comparar la aproximación, ' +
    'tabla de dobles sucesivos (2x, 4x, 8x...) y comparativa con tipos habituales de inversión. ' +
    'Encadenable con calcular_interes_compuesto, calcular_fire. ' +
    'Ideal para: "¿Cuánto tarda en doblarse mi inversión al 7% anual?"',
    {
      tipoInteres: z.number().positive().optional()
        .describe('Tipo de interés anual en porcentaje. Proporciona este campo para calcular los años necesarios para doblar.'),
      aniosParaDoblar: z.number().positive().optional()
        .describe('Años deseados para doblar el capital. Proporciona este campo para calcular el tipo de interés necesario.'),
      capitalInicial: z.number().positive().optional()
        .describe('Capital inicial en euros (opcional, para mostrar importes absolutos en la tabla de dobles).'),
    },
    async ({ tipoInteres, aniosParaDoblar, capitalInicial }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_regla_72', aiCaller);

      let r;
      try {
        r = calcularRegla72({ tipoInteres, aniosParaDoblar, capitalInicial });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtK = (n: number) => n >= 1000000
        ? `${(n / 1000000).toFixed(2).replace('.', ',')} M€`
        : n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',')} k€` : `${fmt(n)} €`;
      const lineas = [
        `⚖️ **Regla del 72**`,
        '',
        r.modo === 'anios'
          ? `📈 Con un **${r.tipoInteres.toFixed(2).replace('.', ',')}% anual**, el capital se dobla en:`
          : `⏳ Para doblar el capital en **${r.aniosRegla72} años**, necesitas:`,
        '',
        r.modo === 'anios'
          ? [
            `  Regla del 72: **≈ ${r.aniosRegla72} años**`,
            `  Cálculo exacto: **${r.aniosExacto} años**`,
            `  (Error de la aproximación: ${r.errorAproximacion.toFixed(2).replace('.', ',')}%)`,
          ].join('\n')
          : `  Tipo de interés necesario: **${r.tipoInteres.toFixed(2).replace('.', ',')}% anual**`,
        capitalInicial ? `\n💶 ${fmtK(capitalInicial)} → **${fmtK(capitalInicial * 2)}** en ${r.aniosExacto} años` : '',
        '',
        `📊 **Tabla de dobles** (${r.tipoInteres.toFixed(2).replace('.', ',')}% anual):`,
        ...r.tablaDobles.slice(0, 6).map((d, i) =>
          `  ${i + 1}x → **${d.anios.toFixed(1).replace('.', ',')} años**${d.capitalFinal ? ` → ${fmtK(d.capitalFinal)}` : ''}`
        ),
        '',
        `📋 **Comparativa tipos habituales:**`,
        ...r.comparativa.slice(0, 5).map(c =>
          `  ${c.tipo}% — ${c.anios.toFixed(1).replace('.', ',')} años (${c.descripcion})`
        ),
        '',
        `⚠️ *Rentabilidades históricas no garantizan rendimientos futuros.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
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
  // TOOL: calcular_pension_complementaria
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_pension_complementaria',
    'Calcula cuánto capital privado necesitas acumular y cuánto debes ahorrar mensualmente ' +
    'para complementar la pensión pública hasta el nivel de renta deseado en jubilación. ' +
    'Usa la Regla del 4% o el método de anualidad para estimar el capital necesario. ' +
    'Encadenable con calcular_pension_publica, calcular_brecha_jubilacion, ' +
    'calcular_interes_compuesto, calcular_fire. ' +
    'Ideal para: "Si mi pensión será de 1.200€ y quiero 2.000€, ¿cuánto debo ahorrar?"',
    {
      rentaDeseadaMensual: z.number().positive()
        .describe('Renta mensual neta deseada en la jubilación en euros.'),
      pensionPublicaEstimada: z.number().min(0)
        .describe('Pensión pública estimada (neta mensual) en euros. Usa calcular_pension_publica si no la conoces.'),
      edadActual: z.number().int().min(18).max(70)
        .describe('Edad actual en años.'),
      edadJubilacion: z.number().int().min(55).max(75).optional()
        .describe('Edad de jubilación objetivo en años. Por defecto 67.'),
      esperanzaVida: z.number().int().min(65).max(100).optional()
        .describe('Esperanza de vida estimada en años. Por defecto 85.'),
      rentabilidadAcumulacion: z.number().min(0).max(15).optional()
        .describe('Rentabilidad anual esperada durante la fase de ahorro en porcentaje. Por defecto 5%.'),
      rentabilidadRetiro: z.number().min(0).max(10).optional()
        .describe('Rentabilidad anual esperada durante la fase de retiro en porcentaje. Por defecto 3%.'),
      capitalYaAcumulado: z.number().min(0).optional()
        .describe('Capital privado ya acumulado para jubilación (planes de pensiones, fondos, etc.) en euros. Por defecto 0.'),
      metodo: z.enum(['regla4', 'anualidad']).optional()
        .describe('Método de estimación del capital: "regla4" (capital = gasto_anual/4%) o "anualidad" (valor presente de renta). Por defecto "anualidad".'),
    },
    async ({ rentaDeseadaMensual, pensionPublicaEstimada, edadActual, edadJubilacion, esperanzaVida, rentabilidadAcumulacion, rentabilidadRetiro, capitalYaAcumulado, metodo }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_pension_complementaria', aiCaller);

      let r;
      try {
        r = calcularPensionComplementaria({ rentaDeseadaMensual, pensionPublicaEstimada, edadActual, edadJubilacion, esperanzaVida, rentabilidadAcumulacion, rentabilidadRetiro, capitalYaAcumulado, metodo });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtK = (n: number) => n >= 1000000
        ? `${(n / 1000000).toFixed(2).replace('.', ',')} M€`
        : `${Math.round(n).toLocaleString('es-ES')} €`;

      if (r.pensionSuficiente) {
        return { content: [{ type: 'text', text: `✅ **La pensión pública ya cubre la renta deseada.** No necesitas ahorro complementario.\n\nPensión pública: ${fmt(r.pensionPublicaEstimada)} €/mes ≥ Renta deseada: ${fmt(r.rentaDeseadaMensual)} €/mes` }] };
      }

      const lineas = [
        `🎯 **Pensión Complementaria Necesaria**`,
        '',
        `💶 Renta deseada: ${fmt(r.rentaDeseadaMensual)} €/mes | Pensión pública: ${fmt(r.pensionPublicaEstimada)} €/mes`,
        `📉 Brecha mensual: **${fmt(r.brechaMensual)} €/mes** (${fmt(r.brechaAnual)} €/año)`,
        '',
        `📊 **Plan de acumulación (${r.anosAhorro} años de ahorro | ${r.anosJubilacion} años de jubilación):**`,
        `  Capital necesario en la jubilación: **${fmtK(r.capitalNecesario)}** (método: ${r.metodo === 'regla4' ? 'Regla del 4%' : 'Anualidad'})`,
        capitalYaAcumulado ? `  Capital ya acumulado: ${fmtK(r.capitalYaAcumulado)}` : '',
        `  Capital adicional a acumular: **${fmtK(r.capitalPorAcumular)}**`,
        '',
        `💰 **Ahorro mensual necesario: ${fmt(r.ahorroMensualNecesario)} €/mes**`,
        `  (con rentabilidad ${rentabilidadAcumulacion ?? 5}% anual durante ${r.anosAhorro} años)`,
        '',
        `⚠️ *Estimación orientativa. Consulta con un asesor financiero para un plan personalizado.*`,
      ].filter(l => l !== '');
      return { content: [{ type: 'text', text: lineas.join('\n') }] };
    }
  );

  // ------------------------------------------------------------------
  // TOOL: calcular_retencion_alquiler
  // ------------------------------------------------------------------
  servidor.tool(
    'calcular_retencion_alquiler',
    'Calcula el rendimiento neto del capital inmobiliario, los gastos deducibles y el impacto en el IRPF ' +
    'del arrendador de un inmueble residencial. ' +
    'Aplica la reducción del 60% por arrendamiento de vivienda habitual (art. 23.2 LIRPF) ' +
    'y la retención del 19% cuando el arrendatario es empresa o profesional (art. 101.4 LIRPF). ' +
    'Encadenable con calcular_rentabilidad_alquiler, calcular_irpf, calcular_hipoteca. ' +
    'Ideal para: "¿Cuánto IRPF pago por alquilar mi piso?" o "¿Qué gastos puedo deducir del alquiler?"',
    {
      alquilerMensual: z.number().positive().describe('Alquiler mensual bruto en euros.'),
      mesesAlquilados: z.number().int().min(1).max(12).optional()
        .describe('Número de meses alquilados al año. Por defecto 12.'),
      precioCompra: z.number().min(0).optional()
        .describe('Precio de compra del inmueble en euros. Se usa para calcular la amortización (3% del 70% del valor de compra). Por defecto 0.'),
      valorCatastral: z.number().min(0).optional()
        .describe('Valor catastral del inmueble en euros. Se usa como alternativa para calcular amortización. Por defecto 0.'),
      ibi: z.number().min(0).optional().describe('IBI anual en euros. Por defecto 0.'),
      comunidad: z.number().min(0).optional().describe('Gastos de comunidad anuales en euros. Por defecto 0.'),
      seguro: z.number().min(0).optional().describe('Seguro de hogar anual en euros. Por defecto 0.'),
      reparaciones: z.number().min(0).optional().describe('Gastos de reparación y conservación anuales en euros. Por defecto 0.'),
      interesesHipoteca: z.number().min(0).optional().describe('Intereses de hipoteca pagados en el año en euros. Por defecto 0.'),
      otrosGastos: z.number().min(0).optional().describe('Otros gastos deducibles (gestoría, publicidad, etc.) en euros. Por defecto 0.'),
      arrendatarioEmpresa: z.boolean().optional()
        .describe('¿El arrendatario es empresa o profesional? Si es true, aplica retención del 19%. Por defecto false.'),
      otrosIngresos: z.number().min(0).optional()
        .describe('Otros ingresos anuales del contribuyente en euros (para calcular tipo marginal). Por defecto 0.'),
    },
    async ({ alquilerMensual, mesesAlquilados, precioCompra, valorCatastral, ibi, comunidad, seguro, reparaciones, interesesHipoteca, otrosGastos, arrendatarioEmpresa, otrosIngresos }, extra) => {
      const aiCaller = (extra as { _meta?: { userAgent?: string } })?._meta?.userAgent ?? 'desconocido';
      await registrarUsoMCP('calcular_retencion_alquiler', aiCaller);

      let r;
      try {
        r = calcularRetencionAlquiler({ alquilerMensual, mesesAlquilados, precioCompra, valorCatastral, ibi, comunidad, seguro, reparaciones, interesesHipoteca, otrosGastos, arrendatarioEmpresa, otrosIngresos });
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }] };
      }

      const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lineas = [
        `🏠 **IRPF del Alquiler — Rendimiento Capital Inmobiliario**`,
        '',
        `💶 Alquiler bruto: ${fmt(r.ingresosIntegros)} €/año (${fmt(alquilerMensual)} €/mes × ${mesesAlquilados ?? 12} meses)`,
        '',
        `📉 **Gastos deducibles:**`,
        r.gastos.ibi > 0 ? `  IBI: ${fmt(r.gastos.ibi)} €` : '',
        r.gastos.comunidad > 0 ? `  Comunidad: ${fmt(r.gastos.comunidad)} €` : '',
        r.gastos.seguro > 0 ? `  Seguro: ${fmt(r.gastos.seguro)} €` : '',
        r.gastos.reparaciones > 0 ? `  Reparaciones: ${fmt(r.gastos.reparaciones)} €` : '',
        r.gastos.interesesHipoteca > 0 ? `  Intereses hipoteca: ${fmt(r.gastos.interesesHipoteca)} €` : '',
        r.gastos.amortizacion > 0 ? `  Amortización (3% construcción): ${fmt(r.gastos.amortizacion)} €` : '',
        r.gastos.otrosGastos > 0 ? `  Otros gastos: ${fmt(r.gastos.otrosGastos)} €` : '',
        `  **Total gastos: ${fmt(r.gastos.total)} €**`,
        '',
        `📊 **Rendimiento neto: ${fmt(r.rendimientoNeto)} €**`,
        r.reduccionViviendaHabitual
          ? `  Reducción 60% vivienda habitual: -${fmt(r.reduccion60pct)} €`
          : '  (sin reducción 60% — aplicar solo si es arrendamiento de vivienda habitual del inquilino)',
        `  **Rendimiento neto reducido (base IRPF): ${fmt(r.rendimientoNetoReducido)} €**`,
        '',
        `💰 **IRPF estimado:** ${fmt(r.cuotaIRPFEstimada)} € (tipo marginal aprox. ${r.tipoMarginal}%)`,
        arrendatarioEmpresa
          ? `🏢 Retención 19% (arrendatario empresa): ${fmt(r.retencionAnual)} €/año (${fmt(r.retencionMensual)} €/mes)`
          : '👤 Sin retención (arrendatario persona física)',
        `🔄 Cuota diferencial: **${r.cuotaDiferencial >= 0 ? '+' : ''}${fmt(r.cuotaDiferencial)} €** ${r.aDevolver ? '(a devolver)' : '(a pagar en IRPF)'}`,
        '',
        `📚 ${r.fuenteDatos}`,
        `⚠️ *Estimación con tramos estatales + autonómicos medios. No incluye deducciones autonómicas ni otras fuentes de renta complejas.*`,
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
