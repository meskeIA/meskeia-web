/**
 * API Route: Modelo 130 para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/modelo130
 *
 * Calcula el pago fraccionado trimestral del IRPF para autónomos
 * en estimación directa (Modelo 130), conforme al art. 110 RIRPF.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularModelo130 } from '@/lib/calculadoras/modelo130';
import type { TrimestreModelo130 } from '@/lib/calculadoras/modelo130';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF art. 99 + RIRPF art. 110, vigente 2025. ' +
  'No constituye asesoramiento fiscal. Consulta con tu gestor antes de presentar el modelo. ' +
  'Fuente: meskeia.com/modelo-130';

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
      trimestre,
      ingresosAcumulados,
      gastosDeduciblesAcumulados,
      retencionesAcumuladas,
      pagosFraccionadosAnteriores,
      masDeL70PctConRetencion,
      anioEjercicio,
    } = body;

    const trimestresValidos: TrimestreModelo130[] = ['T1', 'T2', 'T3', 'T4'];
    if (!trimestresValidos.includes(trimestre)) {
      return NextResponse.json(
        {
          error:
            'El campo trimestre es obligatorio. Valores válidos: "T1", "T2", "T3", "T4". ' +
            'T1 = enero-marzo, T2 = abril-junio, T3 = julio-septiembre, T4 = octubre-diciembre.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof ingresosAcumulados !== 'number' || ingresosAcumulados < 0) {
      return NextResponse.json(
        {
          error:
            'El campo ingresosAcumulados es obligatorio (€ totales desde el 1 de enero hasta fin del trimestre). ' +
            'Ejemplo: si en T2 llevas facturados 18.000€ desde enero, el valor es 18000.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof gastosDeduciblesAcumulados !== 'number' || gastosDeduciblesAcumulados < 0) {
      return NextResponse.json(
        {
          error:
            'El campo gastosDeduciblesAcumulados es obligatorio (€ totales desde el 1 de enero). ' +
            'Incluye cuotas SS autónomo, alquiler, suministros, asesoría, materiales, etc.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularModelo130({
      trimestre: trimestre as TrimestreModelo130,
      ingresosAcumulados,
      gastosDeduciblesAcumulados,
      retencionesAcumuladas: typeof retencionesAcumuladas === 'number' ? retencionesAcumuladas : 0,
      pagosFraccionadosAnteriores:
        typeof pagosFraccionadosAnteriores === 'number' ? pagosFraccionadosAnteriores : 0,
      masDeL70PctConRetencion: masDeL70PctConRetencion === true,
      anioEjercicio: typeof anioEjercicio === 'number' ? anioEjercicio : new Date().getFullYear(),
    });

    registrarLlamadaChatGPT(trimestre, ingresosAcumulados).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/modelo130:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(trimestre: string, ingresosAcumulados: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['modelo130', timestamp, 'chatgpt', JSON.stringify({ trimestre, ingresosAcumulados })],
  });
}
