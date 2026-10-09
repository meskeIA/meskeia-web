/**
 * API Route: Break-even Eléctrico vs Gasolina para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/breakeven-electrico
 *
 * Calcula el año en que un coche eléctrico empieza a ser más barato que
 * uno de gasolina equivalente, considerando diferencia de precio, ayuda a la compra
 * (Programa Auto+ desde 2026; el MOVES III terminó en 2025), consumos y cargador doméstico.
 * El cálculo es el del motor de la app comparador-electrico (el cargador entra entero al comprar).
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';
import { datosLlamanteGpt } from '@/lib/analytics-gpt';
import { calcularComparador } from '@/app/comparador-electrico/motor';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Cálculo orientativo. No incluye depreciación diferencial, financiación ni la carga en puntos públicos, más cara que la doméstica. ' +
  'La ayuda del Programa Auto+ (RD 609/2026) depende del vehículo y de la convocatoria. ' +
  'Fuente: meskeia.com/comparador-electrico';

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
      precioElectrico,
      precioGasolina,
      kmAnuales,
      subsidioMoves = 0,
      consumoElectrico = 16,
      consumoGasolina = 7,
      precioLuz = 0.18,
      precioGasolinaLitro = 1.65,
      costeCargador = 800,
    } = body;

    if (typeof precioElectrico !== 'number' || precioElectrico <= 0) {
      return NextResponse.json(
        { error: 'precioElectrico es obligatorio (€ del coche eléctrico). Ejemplo: 32000.' },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (typeof precioGasolina !== 'number' || precioGasolina <= 0) {
      return NextResponse.json(
        { error: 'precioGasolina es obligatorio (€ del coche de gasolina equivalente). Ejemplo: 22000.' },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (typeof kmAnuales !== 'number' || kmAnuales <= 0) {
      return NextResponse.json(
        { error: 'kmAnuales es obligatorio (km que conduces al año). Ejemplo: 15000.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Motor de la app (hallazgos 1995 y 1998): el cargador se paga al comprar, no cargador/10
    // al año. Mantenimiento: el diferencial de ~200 €/año de antes.
    const r = calcularComparador({
      precioElectrico, precioGasolina, ayuda: subsidioMoves, kmAnuales,
      consumoElectrico, consumoGasolina, precioLuz, precioGasolinaLitro,
      cargador: costeCargador, mantElectrico: 0, mantGasolina: 200, anios: 15,
    });
    const anioBreakEven = r.tipo === 'equilibrio' ? r.anioEquilibrio : null;
    const mensajes = {
      'equilibrio': `El eléctrico empieza a ser más barato a partir del año ${r.anioEquilibrio}.`,
      'fuera-horizonte': `No se alcanza el punto de equilibrio en 15 años (llegaría en el año ${r.anioEquilibrio}).`,
      'desde-compra': 'El eléctrico es más barato desde la compra y su uso no cuesta más.',
      'ventaja-se-agota': `El eléctrico es más barato de comprar pero más caro de usar: su ventaja se agota en el año ${r.anioCruce}.`,
      'nunca': 'No se alcanza nunca el punto de equilibrio: el eléctrico cuesta más de comprar y su uso no es más barato.',
    };

    const costePorKmEV = r.energiaEV / kmAnuales + 0.005; // +mant. variable
    const costePorKmGas = r.energiaGas / kmAnuales + 0.008;

    registrarLlamada(kmAnuales, precioElectrico).catch(() => {});

    return NextResponse.json(
      {
        anio_breakeven: anioBreakEven,
        mensaje_breakeven: mensajes[r.tipo],
        ahorro_anual_estimado: Math.round(r.ahorroAnual),
        inversion_neta_extra: Math.round(r.inversionInicialExtra),
        coste_km_electrico: parseFloat(costePorKmEV.toFixed(3)),
        coste_km_gasolina: parseFloat(costePorKmGas.toFixed(3)),
        aviso_legal: AVISO_LEGAL,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/breakeven-electrico:', error);
    return NextResponse.json(
      { error: 'Error interno al calcular el break-even. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamada(kmAnuales: number, precioElectrico: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();
  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['breakeven-electrico', timestamp, 'chatgpt', JSON.stringify({ kmAnuales, precioElectrico, ...(await datosLlamanteGpt()) })],
  });
}
