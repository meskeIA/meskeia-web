/**
 * API Route: Imputación de Rentas Inmobiliarias para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/imputacion-rentas
 *
 * Calcula la renta que debe declararse en el IRPF por ser propietario de
 * inmuebles urbanos que no son vivienda habitual y no están alquilados
 * (segunda vivienda vacía, garaje sin usar, etc.).
 * Aplica el 1,1% o el 2% del valor catastral según si fue revisado en los
 * últimos 10 años. Máximo 10 inmuebles.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularImputacionRentasInmuebles } from '@/lib/calculadoras/imputacionRentasInmuebles';
import type { InmuebleImputacion, SituacionCatastralIRI } from '@/lib/calculadoras/imputacionRentasInmuebles';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF art. 85 — vigente 2025. ' +
  'La renta imputada se integra en la base imponible general y tributa al tipo marginal del contribuyente. ' +
  'Fuente: meskeia.com/imputacion-rentas-inmobiliarias';

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
    const { inmuebles, tipoMarginalIRPF } = body;

    if (!Array.isArray(inmuebles) || inmuebles.length === 0) {
      return NextResponse.json(
        {
          error:
            'El campo inmuebles es obligatorio (array con al menos un inmueble). ' +
            'Cada inmueble requiere: situacionCatastral ("revisado_reciente", "no_revisado" o "sin_valor_catastral") ' +
            'y valorCatastral (€, excepto si es "sin_valor_catastral" que requiere valorAdquisicion). ' +
            'Ejemplo: [{"situacionCatastral":"revisado_reciente","valorCatastral":80000}]',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (inmuebles.length > 10) {
      return NextResponse.json(
        { error: 'Máximo 10 inmuebles por cálculo.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const situacionesValidas: SituacionCatastralIRI[] = [
      'revisado_reciente', 'no_revisado', 'sin_valor_catastral',
    ];

    for (const inmueble of inmuebles) {
      if (!situacionesValidas.includes(inmueble.situacionCatastral)) {
        return NextResponse.json(
          {
            error:
              'Cada inmueble debe tener situacionCatastral con valor: ' +
              '"revisado_reciente" (valor catastral revisado en los últimos 10 años → 1,1%), ' +
              '"no_revisado" (no revisado en los últimos 10 años → 2%), ' +
              '"sin_valor_catastral" (sin valor catastral asignado → requiere valorAdquisicion).',
          },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (inmueble.situacionCatastral !== 'sin_valor_catastral' &&
          (typeof inmueble.valorCatastral !== 'number' || inmueble.valorCatastral <= 0)) {
        return NextResponse.json(
          { error: 'Los inmuebles con valor catastral asignado deben incluir el campo valorCatastral (€ > 0).' },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (inmueble.situacionCatastral === 'sin_valor_catastral' &&
          (typeof inmueble.valorAdquisicion !== 'number' || inmueble.valorAdquisicion <= 0)) {
        return NextResponse.json(
          { error: 'Los inmuebles sin valor catastral deben incluir el campo valorAdquisicion (€ precio de compra).' },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    const inmueblesValidados: InmuebleImputacion[] = inmuebles.map((i: InmuebleImputacion) => ({
      descripcion: typeof i.descripcion === 'string' ? i.descripcion : undefined,
      situacionCatastral: i.situacionCatastral,
      valorCatastral: typeof i.valorCatastral === 'number' ? i.valorCatastral : undefined,
      valorAdquisicion: typeof i.valorAdquisicion === 'number' ? i.valorAdquisicion : undefined,
      pctTitularidad: typeof i.pctTitularidad === 'number' ? i.pctTitularidad : undefined,
      diasImputacion: typeof i.diasImputacion === 'number' ? i.diasImputacion : undefined,
    }));

    const resultado = calcularImputacionRentasInmuebles({
      inmuebles: inmueblesValidados,
      tipoMarginalIRPF: typeof tipoMarginalIRPF === 'number' ? tipoMarginalIRPF : undefined,
    });

    registrarLlamadaChatGPT(inmuebles.length).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/imputacion-rentas:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(numInmuebles: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['imputacion-rentas', timestamp, 'chatgpt', JSON.stringify({ numInmuebles })],
  });
}
