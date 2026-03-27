/**
 * API Route: Break-even Eléctrico vs Gasolina para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/breakeven-electrico
 *
 * Calcula el año en que un coche eléctrico empieza a ser más barato que
 * uno de gasolina equivalente, considerando diferencia de precio, MOVES III,
 * consumos y coste de cargador doméstico.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Cálculo orientativo. No incluye depreciación diferencial, financiación ni carga en puntos públicos (0,45-0,65 €/kWh). ' +
  'El subsidio MOVES III puede cambiar. ' +
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

    // Costes anuales de energía
    const costeEnergiaEV = (kmAnuales / 100) * consumoElectrico * precioLuz;
    const costeEnergiaGas = (kmAnuales / 100) * consumoGasolina * precioGasolinaLitro;

    // Ahorro de mantenimiento EV vs gasolina (~200€/año)
    const ahorroMantAnual = 200;
    const ahorroAnual = (costeEnergiaGas - costeEnergiaEV) + ahorroMantAnual;

    // Inversión neta extra del EV
    const inversionNetaExtra = (precioElectrico - subsidioMoves) - precioGasolina;

    // Cargador amortizado en 10 años
    const cargadorAnual = costeCargador / 10;

    // Break-even: año en que el ahorro acumulado supera la inversión extra
    let anioBreakEven: number | null = null;
    let ahorroAcumulado = 0;
    for (let anio = 1; anio <= 15; anio++) {
      ahorroAcumulado += ahorroAnual - cargadorAnual;
      if (ahorroAcumulado >= inversionNetaExtra && anioBreakEven === null) {
        anioBreakEven = anio;
        break;
      }
    }

    const costePorKmEV = costeEnergiaEV / kmAnuales + 0.005; // +mant. variable
    const costePorKmGas = costeEnergiaGas / kmAnuales + 0.008;

    registrarLlamada(kmAnuales, precioElectrico).catch(() => {});

    return NextResponse.json(
      {
        anio_breakeven: anioBreakEven,
        mensaje_breakeven: anioBreakEven
          ? `El eléctrico empieza a ser más barato a partir del año ${anioBreakEven}.`
          : 'No se alcanza el punto de equilibrio en 15 años con estos datos.',
        ahorro_anual_estimado: Math.round(ahorroAnual),
        inversion_neta_extra: Math.round(inversionNetaExtra),
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
    args: ['breakeven-electrico', timestamp, 'chatgpt', JSON.stringify({ kmAnuales, precioElectrico })],
  });
}
