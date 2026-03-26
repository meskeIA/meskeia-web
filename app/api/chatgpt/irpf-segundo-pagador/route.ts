/**
 * API Route: IRPF Segundo Pagador para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/irpf-segundo-pagador
 *
 * Determina si hay obligación de declarar la renta cuando se tienen dos o más
 * pagadores (dos empleos, empresa + SEPE, empresa + pensión...) y calcula
 * si las retenciones practicadas son suficientes o generarán una deuda.
 *
 * Regla clave (LIRPF art. 96.3):
 * - Si el 2º pagador supera 1.500€/año: el umbral baja de 22.000€ a 15.000€
 * - Cada empresa retiene solo sobre SU parte → infrarretención frecuente
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularIRPFSegundoPagador } from '@/lib/calculadoras/irpfSegundoPagador';
import type { PagadorInfo } from '@/lib/calculadoras/irpfSegundoPagador';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF art. 96 y tramos IRPF 2025. ' +
  'Si el resultado indica deuda con Hacienda, considera solicitar un aumento de retención ' +
  'en tu empresa principal mediante el modelo 146. ' +
  'Fuente: meskeia.com/irpf-segundo-pagador';

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
    const { pagadores } = body;

    if (!Array.isArray(pagadores) || pagadores.length < 1) {
      return NextResponse.json(
        {
          error:
            'El campo pagadores es obligatorio y debe ser un array con al menos un pagador. ' +
            'Cada pagador requiere: descripcion (string), importeBruto (€ brutos anuales), retencionesPracticadas (€ retenidos). ' +
            'Ejemplo: [{"descripcion":"Empresa principal","importeBruto":25000,"retencionesPracticadas":3200},' +
            '{"descripcion":"Segundo empleo","importeBruto":8000,"retencionesPracticadas":800}]',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (pagadores.length > 10) {
      return NextResponse.json(
        { error: 'Máximo 10 pagadores.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    for (const p of pagadores) {
      if (typeof p.descripcion !== 'string' || !p.descripcion.trim()) {
        return NextResponse.json(
          { error: 'Cada pagador debe tener un campo "descripcion" (string). Ejemplo: "Empresa A".' },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (typeof p.importeBruto !== 'number' || p.importeBruto < 0) {
        return NextResponse.json(
          { error: `Pagador "${p.descripcion}": el campo "importeBruto" debe ser un número >= 0 en euros.` },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (typeof p.retencionesPracticadas !== 'number' || p.retencionesPracticadas < 0) {
        return NextResponse.json(
          { error: `Pagador "${p.descripcion}": el campo "retencionesPracticadas" debe ser un número >= 0 en euros.` },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    const pagadoresValidados: PagadorInfo[] = pagadores.map((p: PagadorInfo) => ({
      descripcion: String(p.descripcion).trim(),
      importeBruto: Number(p.importeBruto),
      retencionesPracticadas: Number(p.retencionesPracticadas),
    }));

    const resultado = calcularIRPFSegundoPagador({ pagadores: pagadoresValidados });

    registrarLlamadaChatGPT(pagadores.length).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/irpf-segundo-pagador:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(numPagadores: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['irpf-segundo-pagador', timestamp, 'chatgpt', JSON.stringify({ numPagadores })],
  });
}
