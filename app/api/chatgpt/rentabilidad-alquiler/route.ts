/**
 * API Route: Rentabilidad de Alquiler para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/rentabilidad-alquiler
 *
 * Calcula la rentabilidad bruta, neta, cash flow mensual y período de
 * recuperación de una inversión inmobiliaria destinada al alquiler.
 * Incluye opción con hipoteca.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularRentabilidadAlquiler } from '@/lib/calculadoras/rentabilidadAlquiler';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en los datos introducidos. ' +
  'La rentabilidad real depende de la ocupación efectiva, derramas imprevistas y evolución del mercado. ' +
  'No incluye el impacto fiscal (IRPF sobre el alquiler). ' +
  'Fuente: meskeia.com/calculadora-rentabilidad-alquiler';

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
      precioCompra, alquilerMensual,
      porcentajeGastosCompra, reforma,
      tasaOcupacion, ibi, comunidad, seguro, mantenimiento,
      conHipoteca, capitalHipoteca, tasaHipoteca, aniosHipoteca,
    } = body;

    if (typeof precioCompra !== 'number' || precioCompra <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo precioCompra es obligatorio (€ del precio de compra del inmueble). ' +
            'Ejemplo: 150000 para un piso de 150.000€.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof alquilerMensual !== 'number' || alquilerMensual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo alquilerMensual es obligatorio (€/mes de renta de alquiler esperada). ' +
            'Ejemplo: 800 para un alquiler de 800€/mes.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularRentabilidadAlquiler({
      precioCompra,
      alquilerMensual,
      porcentajeGastosCompra: typeof porcentajeGastosCompra === 'number' ? porcentajeGastosCompra : undefined,
      reforma: typeof reforma === 'number' ? reforma : undefined,
      tasaOcupacion: typeof tasaOcupacion === 'number' ? tasaOcupacion : undefined,
      ibi: typeof ibi === 'number' ? ibi : undefined,
      comunidad: typeof comunidad === 'number' ? comunidad : undefined,
      seguro: typeof seguro === 'number' ? seguro : undefined,
      mantenimiento: typeof mantenimiento === 'number' ? mantenimiento : undefined,
      conHipoteca: conHipoteca === true,
      capitalHipoteca: typeof capitalHipoteca === 'number' ? capitalHipoteca : undefined,
      tasaHipoteca: typeof tasaHipoteca === 'number' ? tasaHipoteca : undefined,
      aniosHipoteca: typeof aniosHipoteca === 'number' ? aniosHipoteca : undefined,
    });

    registrarLlamadaChatGPT(precioCompra).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/rentabilidad-alquiler:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(precioCompra: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['rentabilidad-alquiler', timestamp, 'chatgpt', JSON.stringify({ precioCompra })],
  });
}
