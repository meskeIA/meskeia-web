/**
 * API Route: Plan de Pensiones para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/plan-pensiones
 *
 * Calcula el ahorro fiscal por aportaciones a plan de pensiones privado
 * y estima el capital acumulado al momento de la jubilación.
 * Límites 2025: individual 1.500€/año, empresarial 8.500€/año.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularPlanPensiones } from '@/lib/calculadoras/planPensiones';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en límites LIRPF art. 51 (Ley 12/2022). ' +
  'El ahorro fiscal real depende del tipo marginal efectivo y de otras reducciones aplicadas. ' +
  'El rescate del plan tributa como rendimiento del trabajo en IRPF. ' +
  'Fuente: meskeia.com/plan-pensiones';

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
      rendimientosNetos, aportacionIndividual, edadActual,
      aportacionEmpresarial, edadJubilacion, rentabilidadAnual, capitalActual,
    } = body;

    if (typeof rendimientosNetos !== 'number' || rendimientosNetos <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo rendimientosNetos es obligatorio (€ brutos anuales del trabajo o actividad económica). ' +
            'Ejemplo: 35000 para un sueldo bruto de 35.000€/año.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof aportacionIndividual !== 'number' || aportacionIndividual < 0) {
      return NextResponse.json(
        {
          error:
            'El campo aportacionIndividual es obligatorio (€/año aportados al plan de pensiones). ' +
            'El límite deducible en 2025 es 1.500€/año. Ejemplo: 1500.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof edadActual !== 'number' || edadActual < 18 || edadActual > 70) {
      return NextResponse.json(
        {
          error:
            'El campo edadActual es obligatorio (edad del partícipe, entre 18 y 70 años). ' +
            'Ejemplo: 40.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularPlanPensiones({
      rendimientosNetos,
      aportacionIndividual,
      edadActual,
      aportacionEmpresarial: typeof aportacionEmpresarial === 'number' ? aportacionEmpresarial : 0,
      edadJubilacion: typeof edadJubilacion === 'number' ? edadJubilacion : 67,
      rentabilidadAnual: typeof rentabilidadAnual === 'number' ? rentabilidadAnual : 4,
      capitalActual: typeof capitalActual === 'number' ? capitalActual : 0,
    });

    registrarLlamadaChatGPT(rendimientosNetos, aportacionIndividual).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/plan-pensiones:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(rendimientosNetos: number, aportacionIndividual: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['plan-pensiones', timestamp, 'chatgpt', JSON.stringify({ rendimientosNetos, aportacionIndividual })],
  });
}
