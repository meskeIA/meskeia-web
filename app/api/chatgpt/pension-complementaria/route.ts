/**
 * API Route: Pensión Complementaria para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/pension-complementaria
 *
 * Calcula cuánto capital privado necesitas acumular para complementar la
 * pensión pública y alcanzar la renta mensual deseada en jubilación,
 * y cuánto debes ahorrar mensualmente desde hoy para lograrlo.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularPensionComplementaria } from '@/lib/calculadoras/pensionComplementaria';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo. Las proyecciones a largo plazo son sensibles a la inflación, ' +
  'la evolución de la pensión pública y la rentabilidad real obtenida. ' +
  'Revisa el plan cada pocos años y ajusta las aportaciones. ' +
  'Fuente: meskeia.com/pension-complementaria';

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
      rentaDeseadaMensual, pensionPublicaEstimada, edadActual,
      edadJubilacion, esperanzaVida,
      rentabilidadAcumulacion, rentabilidadRetiro,
      capitalYaAcumulado, metodo,
    } = body;

    if (typeof rentaDeseadaMensual !== 'number' || rentaDeseadaMensual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo rentaDeseadaMensual es obligatorio (€ netos al mes que quieres tener en jubilación). ' +
            'Ejemplo: 2000 si quieres disponer de 2.000€/mes al jubilarte.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof pensionPublicaEstimada !== 'number' || pensionPublicaEstimada < 0) {
      return NextResponse.json(
        {
          error:
            'El campo pensionPublicaEstimada es obligatorio (€/mes de pensión pública estimada neta). ' +
            'Usa primero calcularPensionPublica para obtener este valor. ' +
            'Ejemplo: 1200 si estimas cobrar 1.200€/mes de pensión pública.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof edadActual !== 'number' || edadActual < 18 || edadActual > 80) {
      return NextResponse.json(
        {
          error:
            'El campo edadActual es obligatorio (edad actual en años, entre 18 y 80). ' +
            'Ejemplo: 45.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const metodosValidos = ['regla4', 'anualidad'];
    const resultado = calcularPensionComplementaria({
      rentaDeseadaMensual,
      pensionPublicaEstimada,
      edadActual,
      edadJubilacion: typeof edadJubilacion === 'number' ? edadJubilacion : undefined,
      esperanzaVida: typeof esperanzaVida === 'number' ? esperanzaVida : undefined,
      rentabilidadAcumulacion: typeof rentabilidadAcumulacion === 'number' ? rentabilidadAcumulacion : undefined,
      rentabilidadRetiro: typeof rentabilidadRetiro === 'number' ? rentabilidadRetiro : undefined,
      capitalYaAcumulado: typeof capitalYaAcumulado === 'number' ? capitalYaAcumulado : undefined,
      metodo: metodosValidos.includes(metodo) ? metodo : undefined,
    });

    registrarLlamadaChatGPT(edadActual, rentaDeseadaMensual).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/pension-complementaria:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(edadActual: number, rentaDeseadaMensual: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['pension-complementaria', timestamp, 'chatgpt', JSON.stringify({ edadActual, rentaDeseadaMensual })],
  });
}
