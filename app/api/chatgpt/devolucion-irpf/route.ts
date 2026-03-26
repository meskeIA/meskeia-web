/**
 * API Route: Simulador Devolución / Pago IRPF para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/devolucion-irpf
 *
 * Estima si la declaración de la renta saldrá a devolver o a pagar,
 * comparando las retenciones practicadas durante el año con la cuota
 * calculada sobre la base imponible total.
 *
 * Fuente: LIRPF arts. 63-89 + RIRPF — Declaración Renta 2025 (año fiscal 2024)
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularDevolucionIRPF } from '@/lib/calculadoras/devolucionIRPF';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Estimación orientativa basada en LIRPF y tramos estatales 2025. ' +
  'No incluye deducciones autonómicas, por vivienda ni situaciones especiales. ' +
  'El resultado real puede variar. Consulta el borrador de la AEAT para la cifra exacta. ' +
  'Fuente: meskeia.com/devolucion-irpf';

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
      rendimientosTrabajoAnuales, retencionesTrabajoAnuales,
      rendimientosActividadesEconomicas, retencionesActividadesEconomicas, pagosFraccionados,
      rendimientosCapitalMobiliario, retencionesCapitalMobiliario,
      rendimientosCapitalInmobiliario, retencionesCapitalInmobiliario,
      gananciasPatrimoniales, retencionesGananciasPat,
      edad, numHijos, tieneHijoMenor3, ascendientes65, discapacidad,
      deduccionMaternidad,
    } = body;

    if (typeof rendimientosTrabajoAnuales !== 'number' || rendimientosTrabajoAnuales < 0) {
      return NextResponse.json(
        {
          error:
            'El campo rendimientosTrabajoAnuales es obligatorio (€ brutos anuales del trabajo, antes de retenciones y cotizaciones SS). ' +
            'Ejemplo: 30000 para un salario bruto de 30.000€/año.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularDevolucionIRPF({
      rendimientosTrabajoAnuales,
      retencionesTrabajoAnuales: typeof retencionesTrabajoAnuales === 'number' ? retencionesTrabajoAnuales : undefined,
      rendimientosActividadesEconomicas: typeof rendimientosActividadesEconomicas === 'number' ? rendimientosActividadesEconomicas : undefined,
      retencionesActividadesEconomicas: typeof retencionesActividadesEconomicas === 'number' ? retencionesActividadesEconomicas : undefined,
      pagosFraccionados: typeof pagosFraccionados === 'number' ? pagosFraccionados : undefined,
      rendimientosCapitalMobiliario: typeof rendimientosCapitalMobiliario === 'number' ? rendimientosCapitalMobiliario : undefined,
      retencionesCapitalMobiliario: typeof retencionesCapitalMobiliario === 'number' ? retencionesCapitalMobiliario : undefined,
      rendimientosCapitalInmobiliario: typeof rendimientosCapitalInmobiliario === 'number' ? rendimientosCapitalInmobiliario : undefined,
      retencionesCapitalInmobiliario: typeof retencionesCapitalInmobiliario === 'number' ? retencionesCapitalInmobiliario : undefined,
      gananciasPatrimoniales: typeof gananciasPatrimoniales === 'number' ? gananciasPatrimoniales : undefined,
      retencionesGananciasPat: typeof retencionesGananciasPat === 'number' ? retencionesGananciasPat : undefined,
      edad: typeof edad === 'number' ? edad : undefined,
      numHijos: typeof numHijos === 'number' ? numHijos : undefined,
      hijosMenures3: tieneHijoMenor3 === true,
      ascendientes65: typeof ascendientes65 === 'number' ? ascendientes65 : undefined,
      discapacidad: ['ninguna', 'moderada', 'severa'].includes(discapacidad) ? discapacidad : undefined,
      deduccionMaternidad: typeof deduccionMaternidad === 'number' ? deduccionMaternidad : undefined,
    });

    registrarLlamadaChatGPT(rendimientosTrabajoAnuales).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/devolucion-irpf:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(rendimientosTrabajoAnuales: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['devolucion-irpf', timestamp, 'chatgpt', JSON.stringify({ rendimientosTrabajoAnuales })],
  });
}
