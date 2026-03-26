/**
 * API Route: Jubilación Anticipada para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/jubilacion-anticipada
 *
 * Calcula si es posible jubilarse antes de la edad ordinaria y cuánto se
 * reduce la pensión. Dos modalidades LGSS arts. 207-208:
 * - Voluntaria: hasta 2 años antes, requiere ≥ 35 años cotizados
 * - Involuntaria: hasta 4 años antes, requiere ≥ 33 años cotizados (despido, ERTE...)
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularJubilacionAnticipada } from '@/lib/calculadoras/jubilacionAnticipada';
import type { TipoJubilacionAnticipada } from '@/lib/calculadoras/jubilacionAnticipada';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LGSS arts. 207-208 y coeficientes reductores SS 2025. ' +
  'La reducción por jubilación anticipada es PERMANENTE e irreversible. ' +
  'Verifica los requisitos exactos en tu oficina de la Seguridad Social antes de solicitar la jubilación. ' +
  'Fuente: meskeia.com/jubilacion-anticipada';

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
    const { anosCotizados, mesesAnticipacion, tipo, pensionOrdinaria } = body;

    if (typeof anosCotizados !== 'number' || anosCotizados < 0 || anosCotizados > 50) {
      return NextResponse.json(
        {
          error:
            'El campo anosCotizados es obligatorio (años cotizados a la SS, entre 0 y 50). ' +
            'Ejemplo: 36 para alguien con 36 años de cotización.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof mesesAnticipacion !== 'number' || mesesAnticipacion <= 0 || mesesAnticipacion > 48) {
      return NextResponse.json(
        {
          error:
            'El campo mesesAnticipacion es obligatorio (meses de anticipación respecto a la edad ordinaria de jubilación, entre 1 y 48). ' +
            'Ejemplo: 24 para jubilarse 2 años antes.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof pensionOrdinaria !== 'number' || pensionOrdinaria <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo pensionOrdinaria es obligatorio (€/mes de pensión estimada a la edad ordinaria de jubilación). ' +
            'Usa primero calcularPensionPublica para obtener este valor. ' +
            'Ejemplo: 1800 si tu pensión ordinaria estimada es de 1.800€/mes.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tiposValidos: TipoJubilacionAnticipada[] = ['voluntaria', 'involuntaria'];
    const tipoFinal: TipoJubilacionAnticipada =
      tiposValidos.includes(tipo) ? tipo : 'voluntaria';

    const resultado = calcularJubilacionAnticipada({
      anosCotizados,
      mesesAnticipacion,
      tipo: tipoFinal,
      pensionOrdinaria,
    });

    registrarLlamadaChatGPT(mesesAnticipacion, tipoFinal).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/jubilacion-anticipada:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(mesesAnticipacion: number, tipo: string): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['jubilacion-anticipada', timestamp, 'chatgpt', JSON.stringify({ mesesAnticipacion, tipo })],
  });
}
