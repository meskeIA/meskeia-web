/**
 * API Route: Pensión Pública de Jubilación para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/pension-publica
 *
 * Estima la pensión pública de jubilación según la fórmula de la Seguridad
 * Social (LGSS RDL 8/2015 + Ley 21/2021): base reguladora × porcentaje por
 * años cotizados. Incluye pensión mínima y máxima SS 2025.
 *
 * Resultado ORIENTATIVO — la SS calcula la pensión real a partir del
 * historial completo de cotización. Siempre consultar la vida laboral oficial.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularPensionPublica } from '@/lib/calculadoras/pensionPublica';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Estimación orientativa basada en LGSS RDL 8/2015 + Ley 21/2021 y datos SS 2025. ' +
  'La Seguridad Social calcula la pensión real a partir de tu historial completo de cotización. ' +
  'Solicita tu vida laboral en sede.seg-social.gob.es para un cálculo preciso. ' +
  'Fuente: meskeia.com/pension-jubilacion';

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
    const { baseCotizacionMensual, anosCotizados, edadActual } = body;

    if (typeof baseCotizacionMensual !== 'number' || baseCotizacionMensual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo baseCotizacionMensual es obligatorio (€/mes de base de cotización media de los últimos 25 años). ' +
            'Si no la conoces con exactitud, usa el salario bruto mensual actual como aproximación. ' +
            'Ejemplo: 2200 para una base de cotización de 2.200€/mes.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof anosCotizados !== 'number' || anosCotizados < 0 || anosCotizados > 50) {
      return NextResponse.json(
        {
          error:
            'El campo anosCotizados es obligatorio (años totales cotizados a la Seguridad Social, entre 0 y 50). ' +
            'Ejemplo: 35 para alguien que lleva 35 años cotizando.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularPensionPublica({
      baseCotizacionMensual,
      anosCotizados,
      edadActual: typeof edadActual === 'number' ? edadActual : undefined,
    });

    registrarLlamadaChatGPT(anosCotizados).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/pension-publica:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(anosCotizados: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['pension-publica', timestamp, 'chatgpt', JSON.stringify({ anosCotizados })],
  });
}
