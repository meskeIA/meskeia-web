/**
 * API Route: Rescate de Plan de Pensiones para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/rescate-plan-pensiones
 *
 * Calcula la tributación del rescate de un plan de pensiones en el IRPF.
 * Las prestaciones tributan como Rendimiento del Trabajo (base general).
 * Incluye la reducción del 40% por aportaciones anteriores a 31/12/2006
 * si el cobro es en forma de capital (DA 12.ª LIRPF).
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularRescatePlanPensiones } from '@/lib/calculadoras/rescatePlanPensiones';
import type { FormaRescate, ContingenciaRescate } from '@/lib/calculadoras/rescatePlanPensiones';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF art. 17.2.a + DA 12.ª — vigente 2025. ' +
  'El rescate en capital puede generar un salto de tramo IRPF significativo. ' +
  'Consulta con un asesor fiscal antes de rescatar, especialmente si tienes aportaciones pre-2007. ' +
  'Fuente: meskeia.com/rescate-plan-pensiones';

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
      formaRescate, contingencia, totalAcumulado,
      capitalPre2007, importeCapital, rentaAnual,
      anosDesdeContingencia, otrosRdtTrabajoEjercicio,
    } = body;

    const formasValidas: FormaRescate[] = ['capital', 'renta', 'mixta'];
    if (!formasValidas.includes(formaRescate)) {
      return NextResponse.json(
        {
          error:
            'El campo formaRescate es obligatorio. Valores posibles: ' +
            '"capital" (cobro único), "renta" (pagos periódicos), "mixta" (parte capital + parte renta).',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const contingenciasValidas: ContingenciaRescate[] = [
      'jubilacion', 'incapacidad', 'fallecimiento', 'dependencia',
      'desempleo_larga_duracion', 'enfermedad_grave', 'liquidez_excepcional_10anios',
    ];
    if (!contingenciasValidas.includes(contingencia)) {
      return NextResponse.json(
        {
          error:
            'El campo contingencia es obligatorio. Valores posibles: ' +
            '"jubilacion", "incapacidad", "fallecimiento", "dependencia", ' +
            '"desempleo_larga_duracion", "enfermedad_grave", "liquidez_excepcional_10anios".',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof totalAcumulado !== 'number' || totalAcumulado <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo totalAcumulado es obligatorio (€ totales acumulados en el plan de pensiones). ' +
            'Ejemplo: 80000 para un plan con 80.000€ acumulados.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularRescatePlanPensiones({
      formaRescate,
      contingencia,
      totalAcumulado,
      capitalPre2007: typeof capitalPre2007 === 'number' ? capitalPre2007 : undefined,
      importeCapital: typeof importeCapital === 'number' ? importeCapital : undefined,
      rentaAnual: typeof rentaAnual === 'number' ? rentaAnual : undefined,
      anosDesdeContingencia: typeof anosDesdeContingencia === 'number' ? anosDesdeContingencia : undefined,
      otrosRdtTrabajoEjercicio: typeof otrosRdtTrabajoEjercicio === 'number' ? otrosRdtTrabajoEjercicio : undefined,
    });

    registrarLlamadaChatGPT(totalAcumulado, formaRescate).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/rescate-plan-pensiones:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(totalAcumulado: number, formaRescate: string): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['rescate-plan-pensiones', timestamp, 'chatgpt', JSON.stringify({ totalAcumulado, formaRescate })],
  });
}
