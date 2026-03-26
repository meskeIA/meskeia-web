/**
 * API Route: TIR y VAN para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/tir-van
 *
 * Calcula el Valor Actual Neto (VAN), la Tasa Interna de Retorno (TIR)
 * y el período de recuperación descontado (payback) para evaluar
 * la rentabilidad de una inversión de negocio.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularTIRVAN } from '@/lib/calculadoras/tirVan';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo. El VAN y la TIR dependen de la fiabilidad de los flujos de caja proyectados. ' +
  'Las proyecciones financieras son estimaciones sujetas a incertidumbre. ' +
  'Fuente: meskeia.com/calculadora-tir-van';

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
    const { inversionInicial, tasaDescuento, flujosCaja } = body;

    if (typeof inversionInicial !== 'number' || inversionInicial <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo inversionInicial es obligatorio (€, valor positivo). ' +
            'Ejemplo: 20000 si inviertes 20.000€ para arrancar el negocio.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof tasaDescuento !== 'number' || tasaDescuento < 0) {
      return NextResponse.json(
        {
          error:
            'El campo tasaDescuento es obligatorio (% anual de descuento para el VAN). ' +
            'Suele ser el coste de oportunidad o la rentabilidad mínima exigida. ' +
            'Ejemplo: 8 para una tasa del 8%.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!Array.isArray(flujosCaja) || flujosCaja.length === 0) {
      return NextResponse.json(
        {
          error:
            'El campo flujosCaja es obligatorio (array de flujos de caja anuales en €, pueden ser negativos). ' +
            'Ejemplo: [5000, 8000, 12000, 15000, 15000] para 5 años de ingresos netos.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (flujosCaja.some((f: unknown) => typeof f !== 'number')) {
      return NextResponse.json(
        { error: 'Todos los flujos de caja deben ser números en euros.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularTIRVAN({ inversionInicial, tasaDescuento, flujosCaja });

    // Omitir el detalle año a año para no sobrecargar el chat
    const { flujosDescontados: _flujosDescontados, ...resultadoResumen } = resultado;

    registrarLlamadaChatGPT(inversionInicial, flujosCaja.length).catch(() => {});

    return NextResponse.json(
      { ...resultadoResumen, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/tir-van:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(inversionInicial: number, anos: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['tir-van', timestamp, 'chatgpt', JSON.stringify({ inversionInicial, anos })],
  });
}
