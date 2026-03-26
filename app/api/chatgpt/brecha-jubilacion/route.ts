/**
 * API Route: Brecha de Jubilación para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/brecha-jubilacion
 *
 * Calcula la diferencia entre el sueldo neto actual y la pensión estimada,
 * el capital necesario para cubrir esa brecha y el ahorro mensual requerido
 * desde hoy para acumularlo antes de jubilarse.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularBrechaJubilacion } from '@/lib/calculadoras/brechaJubilacion';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo. El capital necesario real depende de la inflación, ' +
  'la evolución de la pensión pública y la rentabilidad efectiva del ahorro. ' +
  'Usa calcularPensionPublica para estimar la pensión si no la conoces. ' +
  'Fuente: meskeia.com/brecha-jubilacion';

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
      sueldoNetoMensual, pensionEstimadaMensual, edadActual,
      edadJubilacion, anosJubilado, rentabilidadAnual,
    } = body;

    if (typeof sueldoNetoMensual !== 'number' || sueldoNetoMensual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo sueldoNetoMensual es obligatorio (€ netos que recibes al mes actualmente). ' +
            'Ejemplo: 1800 para un sueldo neto de 1.800€/mes.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof pensionEstimadaMensual !== 'number' || pensionEstimadaMensual < 0) {
      return NextResponse.json(
        {
          error:
            'El campo pensionEstimadaMensual es obligatorio (€/mes de pensión pública estimada). ' +
            'Usa primero calcularPensionPublica para obtener este valor. ' +
            'Ejemplo: 1200 si estimas cobrar 1.200€/mes de pensión.',
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

    const resultado = calcularBrechaJubilacion({
      sueldoNetoMensual,
      pensionEstimadaMensual,
      edadActual,
      edadJubilacion: typeof edadJubilacion === 'number' ? edadJubilacion : undefined,
      anosJubilado: typeof anosJubilado === 'number' ? anosJubilado : undefined,
      rentabilidadAnual: typeof rentabilidadAnual === 'number' ? rentabilidadAnual : undefined,
    });

    registrarLlamadaChatGPT(edadActual).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/brecha-jubilacion:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(edadActual: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['brecha-jubilacion', timestamp, 'chatgpt', JSON.stringify({ edadActual })],
  });
}
