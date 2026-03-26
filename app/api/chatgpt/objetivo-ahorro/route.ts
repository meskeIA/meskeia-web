/**
 * API Route: Objetivo de Ahorro para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/objetivo-ahorro
 *
 * Responde dos preguntas complementarias:
 * A) Dado un ahorro mensual → ¿cuántos meses necesito para llegar a mi objetivo?
 * B) Dado un plazo en meses → ¿cuánto debo ahorrar al mes para llegar a mi objetivo?
 * Considera rentabilidad del ahorro (cuenta remunerada, fondo monetario, etc.)
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularObjetivoAhorro } from '@/lib/calculadoras/objetivoAhorro';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo. El plazo real depende de la constancia de las aportaciones ' +
  'y de la rentabilidad efectiva obtenida. ' +
  'Fuente: meskeia.com/objetivo-ahorro';

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
    const { objetivoEuros, ahorroMensual, mesesObjetivo, rentabilidadAnual, capitalInicial } = body;

    if (typeof objetivoEuros !== 'number' || objetivoEuros <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo objetivoEuros es obligatorio (€, valor positivo). ' +
            'Ejemplo: 20000 para ahorrar 20.000€ para un coche.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tieneAhorro = typeof ahorroMensual === 'number';
    const tienePlazo = typeof mesesObjetivo === 'number';

    if (!tieneAhorro && !tienePlazo) {
      return NextResponse.json(
        {
          error:
            'Debes indicar exactamente uno de los dos campos: ' +
            'ahorroMensual (para calcular cuántos meses tardas) o ' +
            'mesesObjetivo (para calcular cuánto debes ahorrar al mes). No ambos.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (tieneAhorro && tienePlazo) {
      return NextResponse.json(
        {
          error:
            'Indica solo uno: ahorroMensual (para calcular el plazo) o ' +
            'mesesObjetivo (para calcular la cuota mensual necesaria). No los dos a la vez.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularObjetivoAhorro({
      objetivoEuros,
      ahorroMensual: tieneAhorro ? ahorroMensual : undefined,
      mesesObjetivo: tienePlazo ? mesesObjetivo : undefined,
      rentabilidadAnual: typeof rentabilidadAnual === 'number' ? rentabilidadAnual : 0,
      capitalInicial: typeof capitalInicial === 'number' ? capitalInicial : 0,
    });

    registrarLlamadaChatGPT(objetivoEuros).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/objetivo-ahorro:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(objetivoEuros: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['objetivo-ahorro', timestamp, 'chatgpt', JSON.stringify({ objetivoEuros })],
  });
}
