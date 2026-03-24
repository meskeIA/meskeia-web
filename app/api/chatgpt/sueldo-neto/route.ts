/**
 * API Route: Sueldo Neto para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/sueldo-neto
 *
 * Calcula el sueldo neto mensual y anual a partir del bruto anual,
 * aplicando IRPF 2025 y cotizaciones SS cuenta ajena 2025.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularSueldoNeto } from '@/lib/calculadoras/sueldoNeto';
import type { SituacionFamiliar } from '@/lib/calculadoras/sueldoNeto';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en IRPF 2025 y SS cuenta ajena 2025. ' +
  'La retención real puede variar según tu situación personal. ' +
  'No constituye asesoramiento fiscal. ' +
  'Fuente: meskeia.com/sueldo-neto';

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
    const { brutoAnual, situacion, numHijos, hijosMenores3, pagas } = body;

    // Validación básica
    if (typeof brutoAnual !== 'number' || brutoAnual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo brutoAnual es obligatorio y debe ser un número positivo en euros/año. ' +
            'Ejemplo: 30000 para un salario bruto de 30.000€ anuales.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const situacionValida: SituacionFamiliar =
      situacion === 'casado_sin_ingresos' || situacion === 'casado_con_ingresos'
        ? situacion
        : 'soltero';

    const pagasValidas: 12 | 14 = pagas === 12 ? 12 : 14;

    // Calcular sueldo neto
    const resultado = calcularSueldoNeto({
      brutoAnual,
      situacion: situacionValida,
      numHijos: typeof numHijos === 'number' ? numHijos : 0,
      hijosMenores3: typeof hijosMenores3 === 'number' ? hijosMenores3 : 0,
      pagas: pagasValidas,
    });

    // Analytics (no bloquea la respuesta)
    registrarLlamadaChatGPT(brutoAnual, situacionValida).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/sueldo-neto:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(
  brutoAnual: number,
  situacion: string
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
      'sueldo-neto',
      timestamp,
      'chatgpt',
      JSON.stringify({ brutoAnual, situacion }),
    ],
  });
}
