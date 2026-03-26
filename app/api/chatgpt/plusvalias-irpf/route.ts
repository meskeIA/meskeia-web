/**
 * API Route: Plusvalías IRPF para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/plusvalias-irpf
 *
 * Calcula el impacto fiscal de la venta de acciones, fondos u otros activos
 * según los tramos del ahorro IRPF 2025 (19%/21%/23%/27%/30%).
 * Incluye compensación de pérdidas patrimoniales pendientes.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularPlusvaliasIRPF } from '@/lib/calculadoras/plusvaliasIRPF';
import type { TipoActivo } from '@/lib/calculadoras/plusvaliasIRPF';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en tramos del ahorro IRPF 2025 (Ley 35/2006 + LPGE 2025). ' +
  'La tributación real puede variar según otras rentas del ahorro del ejercicio y CCAA. ' +
  'Consulta con un asesor fiscal para operaciones relevantes. ' +
  'Fuente: meskeia.com/plusvalias-irpf';

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
      precioCompra, gastosCompra,
      precioVenta, gastosVenta,
      fechaCompra, fechaVenta,
      tipoActivo, saldoCompensacion,
    } = body;

    if (typeof precioCompra !== 'number' || precioCompra <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo precioCompra es obligatorio (€ pagados al comprar el activo). ' +
            'Ejemplo: 5000 si compraste acciones por 5.000€.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof precioVenta !== 'number' || precioVenta <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo precioVenta es obligatorio (€ recibidos al vender el activo). ' +
            'Ejemplo: 8000 si vendiste las acciones por 8.000€.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof fechaCompra !== 'string' || !fechaCompra.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json(
        {
          error:
            'El campo fechaCompra es obligatorio en formato YYYY-MM-DD. ' +
            'Ejemplo: "2020-03-15" para el 15 de marzo de 2020.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof fechaVenta !== 'string' || !fechaVenta.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json(
        {
          error:
            'El campo fechaVenta es obligatorio en formato YYYY-MM-DD. ' +
            'Ejemplo: "2025-06-10" para el 10 de junio de 2025.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tiposActivo: TipoActivo[] = ['acciones', 'fondos', 'inmueble', 'otro'];
    const resultado = calcularPlusvaliasIRPF({
      precioCompra,
      gastosCompra: typeof gastosCompra === 'number' ? gastosCompra : 0,
      precioVenta,
      gastosVenta: typeof gastosVenta === 'number' ? gastosVenta : 0,
      fechaCompra,
      fechaVenta,
      tipoActivo: tiposActivo.includes(tipoActivo) ? tipoActivo : 'acciones',
      saldoCompensacion: typeof saldoCompensacion === 'number' ? saldoCompensacion : 0,
    });

    registrarLlamadaChatGPT(precioVenta).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/plusvalias-irpf:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(precioVenta: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['plusvalias-irpf', timestamp, 'chatgpt', JSON.stringify({ precioVenta })],
  });
}
