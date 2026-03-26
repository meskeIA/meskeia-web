/**
 * API Route: Tarifa Freelance para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/tarifa-freelance
 *
 * Calcula la tarifa hora/día ideal para un autónomo español,
 * considerando ingreso neto deseado, gastos fijos, IRPF, IVA,
 * vacaciones y porcentaje de ocupación real.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularTarifaFreelance } from '@/lib/calculadoras/tarifaFreelance';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo. La tarifa real depende de tu situación fiscal, sector y mercado. ' +
  'No constituye asesoramiento fiscal ni laboral. ' +
  'Fuente: meskeia.com/orientador-tarifa-freelance';

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
      ingresoNetoMensual,
      horasSemanales,
      diasVacaciones,
      porcentajeOcupacion,
      tipoIRPF,
      tipoIVA,
      gastosFijosMensuales,
      gastosVariablesMensuales,
    } = body;

    if (typeof ingresoNetoMensual !== 'number' || ingresoNetoMensual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo ingresoNetoMensual es obligatorio y debe ser un número positivo en euros/mes. ' +
            'Ejemplo: 2500 si quieres llevarte 2.500€ netos al mes.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularTarifaFreelance({
      ingresoNetoMensual,
      horasSemanales: typeof horasSemanales === 'number' ? horasSemanales : undefined,
      diasVacaciones: typeof diasVacaciones === 'number' ? diasVacaciones : undefined,
      porcentajeOcupacion: typeof porcentajeOcupacion === 'number' ? porcentajeOcupacion : undefined,
      tipoIRPF: typeof tipoIRPF === 'number' ? tipoIRPF : undefined,
      tipoIVA: typeof tipoIVA === 'number' ? tipoIVA : undefined,
      gastosFijos:
        typeof gastosFijosMensuales === 'number' && gastosFijosMensuales > 0
          ? [{ concepto: 'Gastos fijos mensuales (cuota autónomo, seguros, software...)', importe: gastosFijosMensuales }]
          : [],
      gastosVariables:
        typeof gastosVariablesMensuales === 'number' && gastosVariablesMensuales > 0
          ? [{ concepto: 'Gastos variables mensuales (formación, materiales, viajes...)', importe: gastosVariablesMensuales }]
          : [],
    });

    registrarLlamadaChatGPT(ingresoNetoMensual).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/tarifa-freelance:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(ingresoNetoMensual: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['tarifa-freelance', timestamp, 'chatgpt', JSON.stringify({ ingresoNetoMensual })],
  });
}
