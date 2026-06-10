/**
 * API Route: Impuesto sobre Sociedades para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/impuesto-sociedades
 *
 * Calcula la cuota del IS para sociedades españolas con los tipos vigentes 2026:
 * 15% nueva empresa, 25% general, y escala progresiva 19%/21% (Ley 7/2024)
 * para microempresa/PYME (cifra de negocio < 1M€).
 * Incluye reserva de capitalización y nivelación.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularImpuestoSociedades } from '@/lib/calculadoras/impuestoSociedades';
import type { RegimenIS } from '@/lib/calculadoras/impuestoSociedades';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIS (Ley 27/2014), modificada por Ley 7/2024, vigente 2026. ' +
  'La base imponible real puede diferir del resultado contable por ajustes extracontables. ' +
  'Consulta con tu asesor fiscal. Fuente: meskeia.com/impuesto-sociedades';

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
      regimenFiscal,
      baseImponible,
      cifraNegociosAnterior,
      esNuevaEmpresa,
      gastosIDi,
      mediaGastosIDiAnteriores,
      gastosInnovacion,
      trabajadoresDiscapacidadContratados,
      incrementoFondosPropios,
      bonificacionesPendientes,
      retencionesYPagosFraccionados,
    } = body;

    const regimenesValidos: RegimenIS[] = [
      'general', 'pyme', 'nueva_empresa', 'microempresa',
      'cooperativa', 'sin_animo_lucro', 'credito_hidrocarburos',
    ];

    if (!regimenesValidos.includes(regimenFiscal)) {
      return NextResponse.json(
        {
          error:
            'El campo regimenFiscal es obligatorio. Valores válidos: ' +
            '"general" (25%), "pyme" o "microempresa" (escala progresiva 19%/21% en 2026, CN<1M€, Ley 7/2024 — ambos valores son equivalentes), ' +
            '"nueva_empresa" (15%, primeros 2 años), "cooperativa" (20%), ' +
            '"sin_animo_lucro" (10%), "credito_hidrocarburos" (30%).',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof baseImponible !== 'number') {
      return NextResponse.json(
        {
          error:
            'El campo baseImponible es obligatorio (€ de resultado contable del ejercicio, antes de ajustes). ' +
            'Puede ser negativo si hay pérdidas. Ejemplo: 40000 si el beneficio contable es 40.000€.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularImpuestoSociedades({
      regimenFiscal: regimenFiscal as RegimenIS,
      baseImponible,
      cifraNegociosAnterior:
        typeof cifraNegociosAnterior === 'number' ? cifraNegociosAnterior : undefined,
      esNuevaEmpresa: esNuevaEmpresa === true,
      gastosIDi: typeof gastosIDi === 'number' ? gastosIDi : undefined,
      mediaGastosIDiAnteriores:
        typeof mediaGastosIDiAnteriores === 'number' ? mediaGastosIDiAnteriores : undefined,
      gastosInnovacion: typeof gastosInnovacion === 'number' ? gastosInnovacion : undefined,
      trabajadoresDiscapacidadContratados:
        typeof trabajadoresDiscapacidadContratados === 'number'
          ? trabajadoresDiscapacidadContratados
          : undefined,
      incrementoFondosPropios:
        typeof incrementoFondosPropios === 'number' ? incrementoFondosPropios : undefined,
      bonificacionesPendientes:
        typeof bonificacionesPendientes === 'number' ? bonificacionesPendientes : undefined,
      retencionesYPagosFraccionados:
        typeof retencionesYPagosFraccionados === 'number'
          ? retencionesYPagosFraccionados
          : undefined,
    });

    registrarLlamadaChatGPT(baseImponible, regimenFiscal).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/impuesto-sociedades:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(baseImponible: number, regimenFiscal: string): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['impuesto-sociedades', timestamp, 'chatgpt', JSON.stringify({ baseImponible, regimenFiscal })],
  });
}
