/**
 * API Route: Retención e IRPF sobre Dividendos para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/retencion-dividendos
 *
 * Calcula la retención a cuenta (19%), la cuota IRPF real según tramos del ahorro
 * y si aplica la exención IS art. 21 para sociedades con participación >= 5%.
 * Válido para personas físicas residentes, sociedades y no residentes.
 *
 * Para el dividendo de fuente EXTRANJERA percibido por una persona física residente
 * acepta `origenDividendo`, `retencionOrigen` y `tipoMaximoCDIOrigen`, y devuelve la
 * deducción por doble imposición internacional (art. 80 LIRPF).
 *
 * ⚠️ Todo parámetro fuera de rango se rechaza con un 400 que EXPLICA qué esperaba el
 * campo. El motor lanza `ErrorParametroDividendos` y aquí se traduce: un porcentaje
 * imposible no puede salir por la puerta convertido en un dividendo neto negativo, ni
 * un NaN convertido en `null` con el aviso legal intacto.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calcularRetencionDividendos,
  ErrorParametroDividendos,
} from '@/lib/calculadoras/retencionDividendos';
import type {
  TipoReceptorDividendo,
  OrigenDividendo,
} from '@/lib/calculadoras/retencionDividendos';
import { FISCAL_IRPF_META } from '@/data/fiscal';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

// La fuente y la fecha NO se escriben a mano: salen de data/fiscal, que es lo que
// re-sella el triaje fiscal mensual. La URL anterior (meskeia.com/retencion-dividendos)
// daba 404 —no existe esa app— justo en el único sitio donde se invita a verificar.
const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF art. 25.1 + LIS art. 21 + LIRNR. ' +
  'Los tipos CDI varían según el convenio de doble imposición aplicable. ' +
  `Fuente: ${FISCAL_IRPF_META.fuente} — verificado ${FISCAL_IRPF_META.verificado}. ` +
  `Contrástalo en la Agencia Tributaria: ${FISCAL_IRPF_META.urlOficial}`;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://chat.openai.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, OpenAI-Conversation-Id',
  };
}

/** Un número solo se acepta si existe de verdad: NaN e Infinity no son datos. */
function numeroFinitoOUndefined(valor: unknown): number | undefined {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : undefined;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      dividendoBruto, tipoReceptor, origenDividendo,
      gastosAdministracion, otrosRdtoAhorroEjercicio,
      porcentajeParticipacion, mesesTenencia, tipoCDI,
      retencionOrigen, tipoMaximoCDIOrigen,
    } = body;

    // `typeof NaN === 'number'` y `NaN <= 0` es false: sin Number.isFinite, un NaN
    // atravesaba esta puerta y salía como {"dividendoBruto":null,...} con las
    // advertencias completas, o sea con toda la apariencia de una respuesta buena.
    if (typeof dividendoBruto !== 'number' || !Number.isFinite(dividendoBruto) || dividendoBruto <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo dividendoBruto es obligatorio y debe ser un número real mayor que cero ' +
            '(€ brutos del dividendo acordado). Ejemplo: 1000 si la empresa reparte 1.000€ de dividendo.',
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

    const origenesValidos: OrigenDividendo[] = ['espana', 'extranjero'];
    if (origenDividendo !== undefined && !origenesValidos.includes(origenDividendo)) {
      return NextResponse.json(
        {
          error:
            'El campo origenDividendo solo admite "espana" (la sociedad que reparte es española) ' +
            'o "extranjero" (acciones de una sociedad de otro país, que retiene su propio impuesto ' +
            'antes de pagar). Si se omite, se asume "espana".',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularRetencionDividendos({
      dividendoBruto,
      tipoReceptor,
      origenDividendo: origenDividendo as OrigenDividendo | undefined,
      gastosAdministracion: numeroFinitoOUndefined(gastosAdministracion),
      otrosRdtoAhorroEjercicio: numeroFinitoOUndefined(otrosRdtoAhorroEjercicio),
      porcentajeParticipacion: numeroFinitoOUndefined(porcentajeParticipacion),
      mesesTenencia: numeroFinitoOUndefined(mesesTenencia),
      tipoCDI: numeroFinitoOUndefined(tipoCDI),
      retencionOrigen: numeroFinitoOUndefined(retencionOrigen),
      tipoMaximoCDIOrigen: numeroFinitoOUndefined(tipoMaximoCDIOrigen),
    });

    registrarLlamadaChatGPT(dividendoBruto).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    // Un parámetro imposible es culpa de la petición, no del servidor: 400 con el
    // motivo, para que quien llama pueda corregirlo en vez de leer «error interno».
    if (error instanceof ErrorParametroDividendos) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders() }
      );
    }
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
