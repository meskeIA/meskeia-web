/**
 * API Route: Asesor de Tipo de Vehículo para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/recomendar-vehiculo
 *
 * Recomienda el segmento (urbano, compacto, SUV, familiar) y la motorización
 * (gasolina, diésel, híbrido, eléctrico) más adecuados según el perfil del usuario.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Recomendación orientativa basada en el perfil introducido. ' +
  'La decisión final debe considerar tus necesidades específicas, pruebas de conducción y asesoramiento profesional. ' +
  'Fuente: meskeia.com/asesor-vehiculo';

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

type UsoPrincipal = 'urbano' | 'mixto' | 'carretera';
type Presupuesto = 'menos15k' | '15k_25k' | '25k_40k' | 'mas40k';
type Carga = 'poca' | 'normal' | 'mucha';
type Zona = 'ciudad' | 'suburbio' | 'pueblo';

function recomendar(
  kmAnuales: number,
  uso: UsoPrincipal,
  pasajeros: number,
  presupuesto: Presupuesto,
  carga: Carga,
  zona: Zona,
  zbe: boolean
): {
  segmento: string;
  motorizacion: string;
  razon_principal: string;
  coste_anual_estimado: number;
  alertas: string[];
} {
  const alertas: string[] = [];

  // Segmento
  let segmento = 'Compacto';
  if (pasajeros >= 5 || carga === 'mucha') {
    segmento = presupuesto === 'menos15k' ? 'Monovolumen' : 'Familiar/Berlina';
  } else if (uso === 'carretera' || (uso === 'mixto' && presupuesto !== 'menos15k')) {
    segmento = 'SUV / Crossover';
  } else if (uso === 'urbano' && presupuesto === 'menos15k') {
    segmento = 'Urbano';
  }

  // Motorización
  let motorizacion = 'Gasolina';
  if (presupuesto === 'mas40k' && kmAnuales < 20000) {
    motorizacion = 'Eléctrico';
  } else if (kmAnuales >= 20000 && uso === 'carretera') {
    motorizacion = 'Diésel';
  } else if (kmAnuales >= 12000 && presupuesto !== 'menos15k') {
    motorizacion = 'Híbrido';
  } else if (uso === 'urbano' && presupuesto === 'mas40k') {
    motorizacion = 'Eléctrico';
  }

  // Alertas
  if (zbe && (motorizacion === 'Diésel' || motorizacion === 'Gasolina')) {
    alertas.push('⚠️ Tu ciudad tiene ZBE activa. Valora motorización ECO o CERO para circular sin restricciones.');
  }
  if (kmAnuales < 8000 && motorizacion === 'Diésel') {
    alertas.push('⚠️ Con menos de 8.000 km/año el diésel raramente compensa. El gasolina o híbrido es mejor opción.');
  }
  if (motorizacion === 'Eléctrico' && zona === 'pueblo') {
    alertas.push('⚠️ En zonas rurales verifica la disponibilidad de puntos de carga antes de optar por eléctrico puro.');
  }

  // Coste anual estimado (combustible + mantenimiento + fijos orientativos)
  const kmFactor = kmAnuales / 15000;
  const costesBase: Record<string, number> = {
    Gasolina: 3800,
    Diésel: 3600,
    Híbrido: 3200,
    Eléctrico: 2800,
  };
  const coste_anual_estimado = Math.round((costesBase[motorizacion] ?? 3800) * kmFactor);

  const razon_principal =
    `Con ${kmAnuales.toLocaleString('es-ES')} km/año, uso ${uso} y ${pasajeros} plazas, ` +
    `el ${segmento} ${motorizacion} ofrece el mejor equilibrio entre coste y funcionalidad.`;

  return { segmento, motorizacion, razon_principal, coste_anual_estimado, alertas };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      kmAnuales, usoPrincipal, pasajeros,
      presupuesto, carga, zona, zbe,
    } = body;

    if (typeof kmAnuales !== 'number' || kmAnuales <= 0) {
      return NextResponse.json(
        { error: 'kmAnuales es obligatorio (km que conduces al año). Ejemplo: 15000.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const uso: UsoPrincipal = ['urbano', 'mixto', 'carretera'].includes(usoPrincipal)
      ? usoPrincipal : 'mixto';
    const pax = typeof pasajeros === 'number' ? Math.max(2, Math.min(9, pasajeros)) : 4;
    const budget: Presupuesto = ['menos15k', '15k_25k', '25k_40k', 'mas40k'].includes(presupuesto)
      ? presupuesto : '15k_25k';
    const cargaV: Carga = ['poca', 'normal', 'mucha'].includes(carga) ? carga : 'normal';
    const zonaV: Zona = ['ciudad', 'suburbio', 'pueblo'].includes(zona) ? zona : 'ciudad';
    const zbeV = zbe === true;

    const resultado = recomendar(kmAnuales, uso, pax, budget, cargaV, zonaV, zbeV);

    registrarLlamada(kmAnuales, uso).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/recomendar-vehiculo:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la recomendación. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamada(kmAnuales: number, uso: string): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();
  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['recomendar-vehiculo', timestamp, 'chatgpt', JSON.stringify({ kmAnuales, uso })],
  });
}
