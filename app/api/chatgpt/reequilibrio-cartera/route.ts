/**
 * API Route: Reequilibrio de Cartera para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/reequilibrio-cartera
 *
 * Calcula cómo rebalancear una cartera de inversión cuando los pesos actuales
 * han divergido de los pesos objetivo. Soporta dos estrategias:
 * - comprar_vender: compra y venta para ajuste exacto
 * - solo_comprar: aportación de nuevo capital sin vender (evita fiscalidad)
 *
 * Máximo 20 activos por cartera.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularReequilibrioCartera } from '@/lib/calculadoras/reequilibrioCartera';
import type { ActivoCartera, EstrategiaReequilibrio } from '@/lib/calculadoras/reequilibrioCartera';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo. Las operaciones de venta pueden generar plusvalías sujetas a IRPF. ' +
  'Considera el impacto fiscal antes de ejecutar el reequilibrio. ' +
  'Fuente: meskeia.com/reequilibrio-cartera';

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
    const { activos, estrategia, nuevoCapital, umbralDesviacion } = body;

    if (!Array.isArray(activos) || activos.length === 0) {
      return NextResponse.json(
        {
          error:
            'El campo activos es obligatorio y debe ser un array con al menos un activo. ' +
            'Cada activo requiere: nombre (string), valorActual (€), pesoObjetivoPct (%). ' +
            'Los pesos objetivo deben sumar 100. ' +
            'Ejemplo: [{"nombre":"Renta Variable Global","valorActual":8000,"pesoObjetivoPct":80},' +
            '{"nombre":"Renta Fija","valorActual":1500,"pesoObjetivoPct":20}]',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (activos.length > 20) {
      return NextResponse.json(
        { error: 'Máximo 20 activos por cartera.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    for (const activo of activos) {
      if (typeof activo.nombre !== 'string' || !activo.nombre.trim()) {
        return NextResponse.json(
          { error: 'Cada activo debe tener un campo "nombre" (string).' },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (typeof activo.valorActual !== 'number' || activo.valorActual < 0) {
        return NextResponse.json(
          { error: `Activo "${activo.nombre}": el campo "valorActual" debe ser un número >= 0 en euros.` },
          { status: 400, headers: corsHeaders() }
        );
      }
      if (typeof activo.pesoObjetivoPct !== 'number' || activo.pesoObjetivoPct < 0) {
        return NextResponse.json(
          { error: `Activo "${activo.nombre}": el campo "pesoObjetivoPct" debe ser un número >= 0 (porcentaje).` },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    const estrategiasValidas: EstrategiaReequilibrio[] = ['comprar_vender', 'solo_comprar'];
    const estrategiaFinal: EstrategiaReequilibrio =
      estrategiasValidas.includes(estrategia) ? estrategia : 'comprar_vender';

    const activosValidados: ActivoCartera[] = activos.map((a: ActivoCartera) => ({
      nombre: String(a.nombre).trim(),
      valorActual: Number(a.valorActual),
      pesoObjetivoPct: Number(a.pesoObjetivoPct),
      costeMedio: typeof a.costeMedio === 'number' ? a.costeMedio : undefined,
    }));

    const resultado = calcularReequilibrioCartera({
      activos: activosValidados,
      estrategia: estrategiaFinal,
      nuevoCapital: typeof nuevoCapital === 'number' ? nuevoCapital : 0,
      umbralDesviacion: typeof umbralDesviacion === 'number' ? umbralDesviacion : 5,
    });

    registrarLlamadaChatGPT(activos.length).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/reequilibrio-cartera:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(numActivos: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['reequilibrio-cartera', timestamp, 'chatgpt', JSON.stringify({ numActivos })],
  });
}
