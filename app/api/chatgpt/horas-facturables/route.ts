/**
 * API Route: Horas Facturables Freelance para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/horas-facturables
 *
 * Calcula las horas realmente facturables al año y al mes para un freelance,
 * descontando vacaciones, festivos, bajas y horas no facturables
 * (administración, reuniones comerciales, formación...).
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularHorasEfectivas } from '@/lib/calculadoras/horasEfectivas';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en convenios laborales y promedio español. ' +
  'Las horas reales dependen de tu actividad, sector y acuerdos con clientes. ' +
  'Fuente: meskeia.com/calculadora-productividad';

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
      facturacionAnual,
      horasPorDia,
      diasVacaciones,
      diasBaja,
      diasFormacion,
      horasNoFacturablesSemanales,
      pctTiempoSinFacturar,
    } = body;

    if (typeof facturacionAnual !== 'number' || facturacionAnual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo facturacionAnual es obligatorio y debe ser un número positivo en euros/año. ' +
            'Ejemplo: 36000 si facturas 3.000€ al mes.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularHorasEfectivas({
      perfil: 'freelance',
      salarioBrutoAnual: facturacionAnual,
      horasPorDia: typeof horasPorDia === 'number' ? horasPorDia : undefined,
      diasVacaciones: typeof diasVacaciones === 'number' ? diasVacaciones : undefined,
      diasBaja: typeof diasBaja === 'number' ? diasBaja : undefined,
      diasFormacion: typeof diasFormacion === 'number' ? diasFormacion : undefined,
      horasNoFacturablesSemanales:
        typeof horasNoFacturablesSemanales === 'number' ? horasNoFacturablesSemanales : undefined,
      pctTiempoSinFacturar:
        typeof pctTiempoSinFacturar === 'number' ? pctTiempoSinFacturar : undefined,
    });

    registrarLlamadaChatGPT(facturacionAnual).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/horas-facturables:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(facturacionAnual: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['horas-facturables', timestamp, 'chatgpt', JSON.stringify({ facturacionAnual })],
  });
}
