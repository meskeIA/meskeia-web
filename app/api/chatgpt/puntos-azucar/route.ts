import { NextRequest, NextResponse } from 'next/server';
import { calcularPuntosAzucar } from '@/lib/calculadoras/cocina';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

const ALLOWED_ORIGINS = ['https://chat.openai.com', 'https://chatgpt.com'];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const body = await req.json();
    const temperatura_c: number = body.temperatura_c;

    if (temperatura_c === undefined) {
      return NextResponse.json(
        { error: 'Parámetro requerido: temperatura_c (temperatura del almíbar en °C, medida con termómetro de cocina).' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularPuntosAzucar(temperatura_c);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-puntos-azucar', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      temperatura_c: r.temperatura_c,
      temperatura_f: r.temperatura_f,
      fase_actual: r.fase ? {
        nombre: r.fase.nombre,
        nombre_en: r.fase.nombre_en,
        rango_c: `${r.fase.temp_min_c}–${r.fase.temp_max_c}°C`,
        descripcion: r.fase.descripcion,
        usos_tipicos: r.fase.usosTipicos,
        prueba_agua_fria: r.fase.prueba_agua_fria,
      } : null,
      fase_anterior: r.fase_anterior ? { nombre: r.fase_anterior.nombre, hasta_c: r.fase_anterior.temp_max_c } : null,
      fase_siguiente: r.fase_siguiente ? { nombre: r.fase_siguiente.nombre, desde_c: r.fase_siguiente.temp_min_c } : null,
      advertencia: r.advertencia,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
