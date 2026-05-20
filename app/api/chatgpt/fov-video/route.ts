import { NextRequest, NextResponse } from 'next/server';
import { calcularFOVVideo } from '@/lib/calculadoras/videografia';
import type { TipoSensor } from '@/lib/calculadoras/fotografia';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

const ALLOWED_ORIGINS = ['https://chat.openai.com', 'https://chatgpt.com'];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1];
  return { 'Access-Control-Allow-Origin': allowed, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const body = await req.json();
    const focal_mm: number = body.focal_mm;
    const sensor: TipoSensor = body.sensor ?? 'ff';

    if (!focal_mm)
      return NextResponse.json({ error: 'Falta el parámetro focal_mm.' }, { status: 400, headers: corsHeaders(origin) });

    const validSensors: TipoSensor[] = ['ff', 'apsc15', 'apsc16', 'm43'];
    if (!validSensors.includes(sensor))
      return NextResponse.json({ error: 'sensor debe ser: ff, apsc15, apsc16 o m43.' }, { status: 400, headers: corsHeaders(origin) });

    const r = calcularFOVVideo(focal_mm, sensor);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({ sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`, args: ['calculadora-fov-video', new Date().toISOString(), 'chatgpt'] });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      focal_mm,
      sensor: r.sensorNombre,
      factor_crop: r.factorCrop,
      focal_equivalente_ff: r.focalEquivalenteFF,
      fov_horizontal_deg: r.fov_horizontal_deg,
      fov_vertical_deg: r.fov_vertical_deg,
      fov_diagonal_deg: r.fov_diagonal_deg,
      clasificacion: r.clasificacion,
      comparativa_sensores: r.comparativa.map(c => ({
        sensor: c.nombre,
        fov_h: c.fov_h,
        focal_equiv_ff: c.focal_eq_ff,
      })),
    }, { headers: corsHeaders(origin) });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500, headers: corsHeaders(origin) });
  }
}
