/**
 * API Route: Interés Compuesto para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/interes-compuesto
 *
 * Simula el crecimiento de un capital inicial con aportaciones periódicas
 * a una tasa de interés compuesto. Responde a la pregunta más frecuente
 * del inversor español: "¿cuánto tendré si ahorro X€/mes al Y% durante Z años?"
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularInteresCompuesto } from '@/lib/calculadoras/interesCompuesto';
import type { FrecuenciaCapitalizacion } from '@/lib/calculadoras/interesCompuesto';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo. La rentabilidad histórica no garantiza rentabilidad futura. ' +
  'Las inversiones conllevan riesgo de pérdida de capital. ' +
  'Fuente: meskeia.com/interes-compuesto';

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
    const { capitalInicial, tasaAnual, anos, aportacionPeriodica, frecuenciaCapitalizacion } = body;

    if (typeof capitalInicial !== 'number' || capitalInicial < 0) {
      return NextResponse.json(
        {
          error:
            'El campo capitalInicial es obligatorio (€, valor >= 0). ' +
            'Ejemplo: 10000 si partes con 10.000€ ya ahorrados.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof tasaAnual !== 'number' || tasaAnual < 0 || tasaAnual > 100) {
      return NextResponse.json(
        {
          error:
            'El campo tasaAnual es obligatorio (% anual esperado, entre 0 y 100). ' +
            'Ejemplo: 7 para una rentabilidad histórica del MSCI World.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof anos !== 'number' || anos <= 0 || anos > 100) {
      return NextResponse.json(
        {
          error:
            'El campo anos es obligatorio (número de años de inversión, entre 1 y 100). ' +
            'Ejemplo: 20 para un horizonte de inversión de 20 años.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const frecuenciasValidas: FrecuenciaCapitalizacion[] = ['anual', 'semestral', 'trimestral', 'mensual'];
    const frecuencia: FrecuenciaCapitalizacion =
      frecuenciasValidas.includes(frecuenciaCapitalizacion) ? frecuenciaCapitalizacion : 'mensual';

    const resultado = calcularInteresCompuesto({
      capitalInicial,
      tasaAnual,
      anos,
      aportacionPeriodica: typeof aportacionPeriodica === 'number' ? aportacionPeriodica : 0,
      frecuenciaCapitalizacion: frecuencia,
    });

    registrarLlamadaChatGPT(capitalInicial, anos).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/interes-compuesto:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(capitalInicial: number, anos: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['interes-compuesto', timestamp, 'chatgpt', JSON.stringify({ capitalInicial, anos })],
  });
}
