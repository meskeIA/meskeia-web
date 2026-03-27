/**
 * API Route: Comparador de Formas de Adquisición de Vehículo para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/adquisicion-vehiculo
 *
 * Compara el coste total real de adquirir un vehículo al contado,
 * con financiación bancaria y con renting. Incluye cuota mensual,
 * intereses totales y recomendación según perfil.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Cálculo orientativo. Los costes reales de financiación y renting varían según entidad, perfil crediticio y negociación. ' +
  'Consulta con tu banco o concesionario. ' +
  'Fuente: meskeia.com/comparador-vehiculos';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://chat.openai.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, OpenAI-Conversation-Id',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      precioVehiculo,
      entrada = 0,
      tasaFinanciacion = 6.5,
      plazoMeses = 60,
      cuotaRentingMensual,
      plazoRentingMeses = 36,
    } = body;

    if (typeof precioVehiculo !== 'number' || precioVehiculo <= 0) {
      return NextResponse.json(
        { error: 'precioVehiculo es obligatorio (€ del precio del vehículo). Ejemplo: 22000.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // ── CONTADO ──────────────────────────────────────────────────
    const gastosMatriculacion = Math.round(precioVehiculo * 0.07); // ~7% ITP/IVA+gastos
    const contadoCosteTotal = precioVehiculo + gastosMatriculacion;

    // ── FINANCIACIÓN ─────────────────────────────────────────────
    const capitalFinanciado = precioVehiculo - entrada;
    const tasaMensual = tasaFinanciacion / 100 / 12;
    let cuotaMensual = 0;
    let financiacionCosteTotal = 0;
    let interesesTotales = 0;

    if (capitalFinanciado > 0 && tasaMensual > 0) {
      cuotaMensual = capitalFinanciado * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) /
        (Math.pow(1 + tasaMensual, plazoMeses) - 1);
      financiacionCosteTotal = Math.round(entrada + cuotaMensual * plazoMeses + gastosMatriculacion);
      interesesTotales = Math.round(cuotaMensual * plazoMeses - capitalFinanciado);
    }

    // ── RENTING ───────────────────────────────────────────────────
    // Si no se proporciona cuota, estimamos ~precio/meses + 30% (mantenimiento+seguro)
    const cuotaRenting = typeof cuotaRentingMensual === 'number'
      ? cuotaRentingMensual
      : Math.round((precioVehiculo / plazoRentingMeses) * 1.3);
    const rentingCostePeriodo = Math.round(cuotaRenting * plazoRentingMeses);

    // ── RECOMENDACIÓN ─────────────────────────────────────────────
    let recomendacion = '';
    if (entrada >= precioVehiculo * 0.3 && tasaFinanciacion <= 5) {
      recomendacion = 'Con una entrada significativa y tipo bajo, la financiación puede ser interesante si mantienes el capital libre para invertir.';
    } else if (tasaFinanciacion >= 7) {
      recomendacion = `Con un TAE del ${tasaFinanciacion}%, el contado ahorra ${interesesTotales.toLocaleString('es-ES')}€ en intereses. Salvo que necesites liquidez, el contado es mejor opción.`;
    } else {
      recomendacion = 'Compara según tu liquidez: el contado es el más barato en total, la financiación da flexibilidad mensual, el renting es ideal si prefieres cuota fija todo incluido sin ser propietario.';
    }

    registrarLlamada(precioVehiculo).catch(() => {});

    return NextResponse.json(
      {
        contado: {
          coste_total: contadoCosteTotal,
          gastos_matriculacion_estimados: gastosMatriculacion,
          descripcion: 'Pago único. El más barato en total. Requiere capital disponible.',
        },
        financiacion: {
          capital_financiado: Math.round(capitalFinanciado),
          cuota_mensual: Math.round(cuotaMensual),
          plazo_meses: plazoMeses,
          intereses_totales: interesesTotales,
          coste_total: financiacionCosteTotal,
          tae_aplicado: tasaFinanciacion,
          descripcion: 'Pagas el coche a plazos. Los intereses aumentan el coste total.',
        },
        renting: {
          cuota_mensual_estimada: cuotaRenting,
          plazo_meses: plazoRentingMeses,
          coste_periodo: rentingCostePeriodo,
          incluye: 'Mantenimiento, seguro e ITV habitualmente incluidos. No eres propietario.',
          descripcion: 'Alquiler a largo plazo. Cuota fija sin sorpresas. Sin valor residual al final.',
        },
        recomendacion,
        aviso_legal: AVISO_LEGAL,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/adquisicion-vehiculo:', error);
    return NextResponse.json(
      { error: 'Error interno al calcular la comparativa. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamada(precioVehiculo: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();
  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['adquisicion-vehiculo', timestamp, 'chatgpt', JSON.stringify({ precioVehiculo })],
  });
}
