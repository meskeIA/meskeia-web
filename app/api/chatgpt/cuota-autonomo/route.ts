/**
 * API Route: Cuota Autónomo para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/cuota-autonomo
 *
 * Diseñado para ser consumido como "Action" de un Custom GPT en ChatGPT.
 * Calcula la cuota mensual RETA 2026 a partir del rendimiento neto mensual.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso (sin datos de usuario).
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularCuotaAutonomo } from '@/lib/calculadoras/cuotaAutonomo';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en datos RETA 2026 (RDL 16/2025). ' +
  'No constituye asesoramiento fiscal ni laboral. ' +
  'Consulta con un gestor o asesor antes de tomar decisiones. ' +
  'Fuente oficial: meskeia.com/cuota-autonomo';

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
    const { rendimientoNetoMensual, esNuevoAutonomo, baseElegida } = body;

    // Validación básica
    if (typeof rendimientoNetoMensual !== 'number' || rendimientoNetoMensual < 0) {
      return NextResponse.json(
        {
          error:
            'El campo rendimientoNetoMensual es obligatorio y debe ser un número positivo en euros/mes. ' +
            'Ejemplo: si ingresas 2.000€ y tienes 400€ de gastos deducibles, el valor es 1600.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Calcular cuota
    const resultado = calcularCuotaAutonomo({
      rendimientoNetoMensual,
      esNuevoAutonomo: esNuevoAutonomo === true,
      baseElegida: baseElegida === 'maxima' ? 'maxima' : 'minima',
    });

    // Analytics: registrar llamada de ChatGPT en Turso (no bloquea la respuesta)
    registrarLlamadaChatGPT(rendimientoNetoMensual, esNuevoAutonomo === true).catch(() => {
      // Silencioso: el analytics nunca debe interrumpir el servicio
    });

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/cuota-autonomo:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/** Registra la llamada en Turso con modo='chatgpt' para diferenciarlo del tráfico web */
async function registrarLlamadaChatGPT(
  rendimientoNetoMensual: number,
  esNuevoAutonomo: boolean
): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones
          (aplicacion, timestamp, modo, datos_adicionales)
          VALUES (?, ?, ?, ?)`,
    args: [
      'cuota-autonomo',
      timestamp,
      'chatgpt',
      JSON.stringify({ rendimientoNetoMensual, esNuevoAutonomo }),
    ],
  });
}
