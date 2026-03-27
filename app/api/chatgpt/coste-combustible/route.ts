/**
 * API Route: Calculadora de Coste de Combustible para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/coste-combustible
 *
 * Calcula el coste anual de combustible/energía para un vehículo según
 * el tipo de motor, km anuales y consumo. Incluye comparativa entre
 * todos los tipos de motorización para los mismos km.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Cálculo orientativo basado en precios medios 2025 en España. ' +
  'El consumo real varía según conducción, tráfico y temperatura. ' +
  'Fuente: meskeia.com/calculadora-combustible';

// Precios de referencia 2025
const PRECIOS_REF = {
  gasolina: 1.65,   // €/L
  diesel: 1.55,     // €/L
  electricidad: 0.18, // €/kWh doméstica
};

// Consumos medios de referencia
const CONSUMOS_REF: Record<string, { valor: number; unidad: string }> = {
  gasolina:  { valor: 7.0,  unidad: 'L/100km' },
  diesel:    { valor: 5.8,  unidad: 'L/100km' },
  hibrido:   { valor: 5.0,  unidad: 'L/100km' },
  electrico: { valor: 16.0, unidad: 'kWh/100km' },
};

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
      kmAnuales,
      tipoCombustible,
      consumo,
      precioUnitario,
    } = body;

    if (typeof kmAnuales !== 'number' || kmAnuales <= 0) {
      return NextResponse.json(
        { error: 'kmAnuales es obligatorio (km anuales recorridos). Ejemplo: 15000.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tiposValidos = ['gasolina', 'diesel', 'hibrido', 'electrico'];
    const tipo: string = tiposValidos.includes(tipoCombustible) ? tipoCombustible : 'gasolina';

    // Consumo: usar el proporcionado o el de referencia
    const consumoFinal = typeof consumo === 'number' && consumo > 0
      ? consumo
      : CONSUMOS_REF[tipo].valor;

    // Precio unitario: usar el proporcionado o el de referencia
    let precioFinal: number;
    if (typeof precioUnitario === 'number' && precioUnitario > 0) {
      precioFinal = precioUnitario;
    } else {
      precioFinal = tipo === 'electrico' ? PRECIOS_REF.electricidad
        : tipo === 'diesel' ? PRECIOS_REF.diesel
        : PRECIOS_REF.gasolina;
    }

    const costeAnual = Math.round((kmAnuales / 100) * consumoFinal * precioFinal);
    const costePorKm = parseFloat(((consumoFinal / 100) * precioFinal).toFixed(4));

    // Comparativa con todos los tipos a los mismos km
    const comparativa = tiposValidos.map(t => {
      const c = CONSUMOS_REF[t].valor;
      const p = t === 'electrico' ? PRECIOS_REF.electricidad
        : t === 'diesel' ? PRECIOS_REF.diesel
        : PRECIOS_REF.gasolina;
      return {
        tipo: t,
        consumo_referencia: `${c} ${CONSUMOS_REF[t].unidad}`,
        coste_anual: Math.round((kmAnuales / 100) * c * p),
        coste_km: parseFloat(((c / 100) * p).toFixed(4)),
      };
    });

    // Emisiones estimadas CO2 g/km
    const emisionesGKm: Record<string, number> = {
      gasolina: Math.round(consumoFinal * 23.5),
      diesel: Math.round(consumoFinal * 26.4),
      hibrido: Math.round(consumoFinal * 23.5 * 0.55),
      electrico: 0,
    };

    registrarLlamada(kmAnuales, tipo).catch(() => {});

    return NextResponse.json(
      {
        tipo_combustible: tipo,
        km_anuales: kmAnuales,
        consumo_usado: `${consumoFinal} ${CONSUMOS_REF[tipo]?.unidad ?? 'L/100km'}`,
        precio_unitario_usado: precioFinal,
        coste_combustible_anual: costeAnual,
        coste_por_km: costePorKm,
        emisiones_co2_g_km: emisionesGKm[tipo] ?? 0,
        comparativa_tipos: comparativa,
        nota_comparativa: 'La comparativa usa consumos y precios medios de referencia 2025 en España.',
        aviso_legal: AVISO_LEGAL,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/coste-combustible:', error);
    return NextResponse.json(
      { error: 'Error interno al calcular el coste de combustible. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamada(kmAnuales: number, tipo: string): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();
  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['coste-combustible', timestamp, 'chatgpt', JSON.stringify({ kmAnuales, tipo })],
  });
}
