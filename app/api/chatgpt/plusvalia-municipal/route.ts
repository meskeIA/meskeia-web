/**
 * API Route: Plusvalía Municipal (IIVTNU) para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/plusvalia-municipal
 *
 * Calcula el Impuesto sobre el Incremento del Valor de los Terrenos de
 * Naturaleza Urbana (plusvalía municipal) aplicando los dos métodos
 * vigentes tras la STC 182/2021: método objetivo y método real.
 * El contribuyente puede elegir el que resulte en menor cuota.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularIIVTNU } from '@/lib/calculadoras/iivtnuPlusvaliaMunicipal';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en TRLHL arts. 104-110 + RDL 26/2021. ' +
  'Cada ayuntamiento fija su propio tipo impositivo (máx. 30%) y puede aplicar coeficientes inferiores a los estatales. ' +
  'Consulta con tu ayuntamiento el tipo y coeficiente exactos antes de la transmisión. ' +
  'Fuente: meskeia.com/plusvalia-municipal';

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
      valorCatastralSuelo, valorCatastralTotal, aniosTenencia,
      precioAdquisicion, precioTransmision,
      tipoImpositivo, coeficienteMunicipal,
    } = body;

    if (typeof valorCatastralSuelo !== 'number' || valorCatastralSuelo <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo valorCatastralSuelo es obligatorio (€ del valor catastral del suelo, que figura en el recibo del IBI). ' +
            'Ejemplo: 40000 si el valor catastral del suelo es 40.000€.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof valorCatastralTotal !== 'number' || valorCatastralTotal <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo valorCatastralTotal es obligatorio (€ del valor catastral total del inmueble, que figura en el recibo del IBI). ' +
            'Ejemplo: 90000 si el valor catastral total es 90.000€.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof aniosTenencia !== 'number' || aniosTenencia < 0) {
      return NextResponse.json(
        {
          error:
            'El campo aniosTenencia es obligatorio (años completos entre la compra y la venta del inmueble). ' +
            'Ejemplo: 8 si han pasado 8 años desde que compraste.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularIIVTNU({
      valorCatastralSuelo,
      valorCatastralTotal,
      aniosTenencia,
      precioAdquisicion: typeof precioAdquisicion === 'number' ? precioAdquisicion : undefined,
      precioTransmision: typeof precioTransmision === 'number' ? precioTransmision : undefined,
      tipoImpositivo: typeof tipoImpositivo === 'number' ? tipoImpositivo : undefined,
      coeficienteMunicipal: typeof coeficienteMunicipal === 'number' ? coeficienteMunicipal : undefined,
    });

    registrarLlamadaChatGPT(aniosTenencia).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/plusvalia-municipal:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(aniosTenencia: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['plusvalia-municipal', timestamp, 'chatgpt', JSON.stringify({ aniosTenencia })],
  });
}
