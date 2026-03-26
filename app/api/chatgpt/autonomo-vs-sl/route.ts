/**
 * API Route: Comparador Autónomo vs SL para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/autonomo-vs-sl
 *
 * Compara la carga fiscal total de operar como autónomo persona física
 * frente a constituir una Sociedad Limitada: SS + IRPF vs IS + dividendos.
 * Datos RETA 2026 + IRPF 2025 + IS 2025.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { compararAutonomoVsSL } from '@/lib/calculadoras/autonomoVsSL';
import type { TipoIS } from '@/lib/calculadoras/autonomoVsSL';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Comparativa orientativa basada en RETA 2026 + IRPF 2025 + IS 2025 (Ley 27/2014). ' +
  'La decisión autónomo/SL depende también de factores no fiscales (responsabilidad, imagen, financiación). ' +
  'Consulta con un asesor fiscal antes de decidir. Fuente: meskeia.com/autonomo-vs-sl';

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
    const { beneficioAnual, gastosDeducibles, tipoIS, repartirDividendos } = body;

    if (typeof beneficioAnual !== 'number' || beneficioAnual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo beneficioAnual es obligatorio (€ anuales de beneficio bruto de la actividad). ' +
            'Ejemplo: 65000 si facturas 65.000€ al año.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tiposISValidos: TipoIS[] = ['general', 'micropyme', 'nueva_creacion'];
    const tipoISValidado: TipoIS = tiposISValidos.includes(tipoIS) ? tipoIS : 'general';

    const resultado = compararAutonomoVsSL({
      beneficioAnual,
      gastosDeducibles: typeof gastosDeducibles === 'number' ? gastosDeducibles : undefined,
      tipoIS: tipoISValidado,
      repartirDividendos: repartirDividendos === true,
    });

    registrarLlamadaChatGPT(beneficioAnual).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/autonomo-vs-sl:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(beneficioAnual: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['autonomo-vs-sl', timestamp, 'chatgpt', JSON.stringify({ beneficioAnual })],
  });
}
