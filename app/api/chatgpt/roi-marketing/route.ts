/**
 * API Route: ROI de Marketing para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/roi-marketing
 *
 * Calcula el retorno de inversión por canal de marketing:
 * ROI, beneficio, CAC (coste por cliente), ROAS y ratio CLV/CAC.
 * Admite hasta 15 canales simultáneos.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularROIMarketing } from '@/lib/calculadoras/roiMarketing';
import type { CanalMarketing } from '@/lib/calculadoras/roiMarketing';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en los datos proporcionados. ' +
  'El ROI real puede variar por factores cualitativos (marca, fidelización) no incluidos en el cálculo. ' +
  'Fuente: meskeia.com/estimador-roi-marketing';

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
    const { canales, valorVidaCliente } = body;

    if (!Array.isArray(canales) || canales.length === 0) {
      return NextResponse.json(
        {
          error:
            'El campo canales es obligatorio y debe ser un array con al menos un canal. ' +
            'Cada canal requiere: nombre (string), inversion (€), clientes (número), ingresoPorCliente (€). ' +
            'Ejemplo: [{"nombre":"Google Ads","inversion":500,"clientes":20,"ingresoPorCliente":150}]',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (canales.length > 15) {
      return NextResponse.json(
        { error: 'Máximo 15 canales por cálculo.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validar cada canal
    for (const canal of canales) {
      if (typeof canal.nombre !== 'string' || !canal.nombre.trim()) {
        return NextResponse.json(
          { error: 'Cada canal debe tener un campo "nombre" (string).' },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (typeof canal.inversion !== 'number' || canal.inversion < 0) {
        return NextResponse.json(
          { error: `Canal "${canal.nombre}": el campo "inversion" debe ser un número positivo en euros.` },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (typeof canal.clientes !== 'number' || canal.clientes < 0) {
        return NextResponse.json(
          { error: `Canal "${canal.nombre}": el campo "clientes" debe ser un número positivo.` },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (typeof canal.ingresoPorCliente !== 'number' || canal.ingresoPorCliente < 0) {
        return NextResponse.json(
          { error: `Canal "${canal.nombre}": el campo "ingresoPorCliente" debe ser un número positivo en euros.` },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    const canalesValidados: CanalMarketing[] = canales.map((c: CanalMarketing) => ({
      nombre: String(c.nombre).trim(),
      inversion: Number(c.inversion),
      clientes: Number(c.clientes),
      ingresoPorCliente: Number(c.ingresoPorCliente),
    }));

    const resultado = calcularROIMarketing(
      canalesValidados,
      typeof valorVidaCliente === 'number' ? valorVidaCliente : undefined
    );

    registrarLlamadaChatGPT(canales.length).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/roi-marketing:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(numCanales: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['roi-marketing', timestamp, 'chatgpt', JSON.stringify({ numCanales })],
  });
}
