/**
 * API Route: Retención e IRPF sobre Dividendos para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/retencion-dividendos
 *
 * Calcula la retención a cuenta (19%), la cuota IRPF real según tramos del ahorro 2025
 * y si aplica la exención IS art. 21 para sociedades con participación >= 5%.
 * Válido para personas físicas residentes, sociedades y no residentes.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularRetencionDividendos } from '@/lib/calculadoras/retencionDividendos';
import type { TipoReceptorDividendo } from '@/lib/calculadoras/retencionDividendos';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF art. 25.1 + LIS art. 21 + LIRNR — vigente 2025. ' +
  'Los tipos CDI pueden variar por convenio de doble imposición aplicable. ' +
  'Fuente: meskeia.com/retencion-dividendos';

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
      dividendoBruto, tipoReceptor,
      gastosAdministracion, otrosRdtoAhorroEjercicio,
      porcentajeParticipacion, mesesTenencia, tipoCDI,
    } = body;

    if (typeof dividendoBruto !== 'number' || dividendoBruto <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo dividendoBruto es obligatorio (€ brutos del dividendo acordado). ' +
            'Ejemplo: 1000 si la empresa reparte 1.000€ de dividendo.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tiposReceptor: TipoReceptorDividendo[] = [
      'persona_fisica_residente',
      'sociedad_residente',
      'no_residente',
    ];

    if (!tiposReceptor.includes(tipoReceptor)) {
      return NextResponse.json(
        {
          error:
            'El campo tipoReceptor es obligatorio. Valores posibles: ' +
            '"persona_fisica_residente" (inversor particular en España), ' +
            '"sociedad_residente" (empresa española que recibe el dividendo), ' +
            '"no_residente" (persona o entidad fuera de España).',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularRetencionDividendos({
      dividendoBruto,
      tipoReceptor,
      gastosAdministracion: typeof gastosAdministracion === 'number' ? gastosAdministracion : undefined,
      otrosRdtoAhorroEjercicio: typeof otrosRdtoAhorroEjercicio === 'number' ? otrosRdtoAhorroEjercicio : undefined,
      porcentajeParticipacion: typeof porcentajeParticipacion === 'number' ? porcentajeParticipacion : undefined,
      mesesTenencia: typeof mesesTenencia === 'number' ? mesesTenencia : undefined,
      tipoCDI: typeof tipoCDI === 'number' ? tipoCDI : undefined,
    });

    registrarLlamadaChatGPT(dividendoBruto).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/retencion-dividendos:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(dividendoBruto: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['retencion-dividendos', timestamp, 'chatgpt', JSON.stringify({ dividendoBruto })],
  });
}
