import { NextRequest, NextResponse } from 'next/server';
import { calcularProfundidadCampo, SENSORES, TipoSensor } from '@/lib/calculadoras/fotografia';
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
    const focalMM: number = body.focal_mm;
    const apertura: number = body.apertura;
    const distanciaM: number = body.distancia_m;
    const sensor: TipoSensor = body.sensor ?? 'ff';

    if (!focalMM || !apertura || !distanciaM) {
      return NextResponse.json(
        { error: 'Faltan parámetros: focal_mm, apertura, distancia_m son obligatorios.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    if (!['ff', 'apsc15', 'apsc16', 'm43'].includes(sensor)) {
      return NextResponse.json(
        { error: 'sensor debe ser: ff, apsc15, apsc16 o m43.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularProfundidadCampo(focalMM, apertura, distanciaM, sensor);
    const s = SENSORES[sensor];

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-profundidad-campo', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      sensor_usado: s.nombre,
      coc_mm: s.coc,
      focal_mm: focalMM,
      apertura: `f/${apertura}`,
      distancia_m: distanciaM,
      hiperfocal_m: Math.round(r.hiperfocalM * 100) / 100,
      dn_m: Math.round(r.dnM * 100) / 100,
      df_m: r.dfM === null ? 'infinito' : Math.round(r.dfM * 100) / 100,
      dof_m: r.dofM === null ? 'infinito' : Math.round(r.dofM * 100) / 100,
      clasificacion: r.clasificacion,
      aviso: 'Cálculo orientativo. El CoC exacto varía por cámara y condiciones de visualización.',
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
