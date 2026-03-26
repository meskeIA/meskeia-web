/**
 * API Route: Coste Real de un Empleado para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/coste-empleado
 *
 * Calcula el coste total para el empleador: salario bruto + cuotas SS
 * a cargo de la empresa (contingencias, desempleo, FP, FOGASA, AT/EP).
 * Datos SS 2025 (Orden PJC/51/2025).
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularCosteEmpleado } from '@/lib/calculadoras/costeEmpleado';
import type { TipoContrato, SectorActividad } from '@/lib/calculadoras/costeEmpleado';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en Orden PJC/51/2025 de cotización a la SS. ' +
  'El tipo AT/EP real depende de la actividad CNAE concreta. ' +
  'No incluye posibles bonificaciones por contratación. ' +
  'Fuente: meskeia.com/coste-empleado';

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
    const { salarioBrutoAnual, tipoContrato, sector, beneficiosExtra, pagas } = body;

    if (typeof salarioBrutoAnual !== 'number' || salarioBrutoAnual <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo salarioBrutoAnual es obligatorio (€ brutos anuales del empleado). ' +
            'Ejemplo: 24000 para un salario bruto de 24.000€/año.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tiposContrato: TipoContrato[] = ['indefinido', 'temporal'];
    const sectores: SectorActividad[] = ['oficina', 'comercio', 'industrial', 'construccion'];

    const resultado = calcularCosteEmpleado({
      salarioBrutoAnual,
      tipoContrato: tiposContrato.includes(tipoContrato) ? tipoContrato : 'indefinido',
      sector: sectores.includes(sector) ? sector : 'oficina',
      beneficiosExtra: typeof beneficiosExtra === 'number' ? beneficiosExtra : undefined,
      pagas: pagas === 12 ? 12 : 14,
    });

    registrarLlamadaChatGPT(salarioBrutoAnual).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/coste-empleado:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(salarioBrutoAnual: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['coste-empleado', timestamp, 'chatgpt', JSON.stringify({ salarioBrutoAnual })],
  });
}
