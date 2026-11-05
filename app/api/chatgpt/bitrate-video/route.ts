import { NextRequest, NextResponse } from 'next/server';
import { calcularBitrateVideo, validarParametrosBitrate, CODECS_VIDEO } from '@/lib/calculadoras/videografia';
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
    const body: unknown = await req.json();
    // La validación vive en el motor para poder probarla sin llamar a la ruta (cabo C0626)
    const v = validarParametrosBitrate(body);
    if (!v.ok)
      return NextResponse.json({ error: v.error }, { status: 400, headers: corsHeaders(origin) });
    const { resolucion, fps, duracion_min, codec } = v;

    const r = calcularBitrateVideo(resolucion, fps, duracion_min, codec);
    const comparativa = CODECS_VIDEO.map(c => {
      const rc = calcularBitrateVideo(resolucion, fps, duracion_min, c);
      return { codec: c, bitrate_mbps: rc.bitrate_mbps, tamano: rc.tamano_formateado };
    });

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({ sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`, args: ['calculadora-bitrate-video', new Date().toISOString(), 'chatgpt'] });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      resolucion, fps, codec, duracion_min,
      bitrate_mbps: r.bitrate_mbps,
      tamano: r.tamano_formateado,
      descripcion: r.descripcion,
      comparativa_codecs: comparativa,
    }, { headers: corsHeaders(origin) });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500, headers: corsHeaders(origin) });
  }
}
