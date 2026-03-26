/**
 * API Route: Break-Even Freelance para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/break-even
 *
 * Calcula el punto de equilibrio (break-even) para un freelance:
 * cuántos ingresos/proyectos necesita para cubrir todos sus costes fijos.
 * Incluye análisis de escenarios what-if.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularBreakEven } from '@/lib/calculadoras/breakEven';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en los datos introducidos. ' +
  'El break-even real depende de la variabilidad de tus ingresos y costes. ' +
  'Fuente: meskeia.com/estimador-break-even';

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
      precioVenta,
      costoVariable,
      costosFijos,
      ventasActuales,
      objetivoGanancia,
    } = body;

    if (typeof precioVenta !== 'number' || precioVenta <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo precioVenta es obligatorio (€ por proyecto/unidad/hora). ' +
            'Ejemplo: 1500 si cobras 1.500€ por proyecto o 75 si cobras 75€/hora.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof costoVariable !== 'number' || costoVariable < 0) {
      return NextResponse.json(
        {
          error:
            'El campo costoVariable es obligatorio (€ de coste directo por proyecto/unidad). ' +
            'Para servicios freelance sin coste material suele ser 0 o muy bajo. ' +
            'Ejemplo: 50 si cada proyecto te cuesta 50€ en materiales o subcontratación.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof costosFijos !== 'number' || costosFijos < 0) {
      return NextResponse.json(
        {
          error:
            'El campo costosFijos es obligatorio (€/mes en costes fijos totales). ' +
            'Incluye: cuota autónomo + alquiler/oficina + software + seguros + otros fijos. ' +
            'Ejemplo: 800 si tienes 800€/mes de costes fijos.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (costoVariable >= precioVenta) {
      return NextResponse.json(
        {
          error:
            'El coste variable por unidad no puede ser mayor o igual al precio de venta. ' +
            'El margen de contribución debe ser positivo para poder calcular el break-even.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularBreakEven({
      precioVenta,
      costoVariable,
      costosFijos,
      ventasActuales: typeof ventasActuales === 'number' ? ventasActuales : undefined,
      objetivoGanancia: typeof objetivoGanancia === 'number' ? objetivoGanancia : undefined,
    });

    // Omitir escenarios en la respuesta para no sobrecargar el chat
    const { escenarios: _escenarios, ...resultadoResumen } = resultado;

    registrarLlamadaChatGPT(costosFijos, precioVenta).catch(() => {});

    return NextResponse.json(
      { ...resultadoResumen, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/break-even:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(costosFijos: number, precioVenta: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['break-even', timestamp, 'chatgpt', JSON.stringify({ costosFijos, precioVenta })],
  });
}
