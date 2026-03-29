import { NextRequest, NextResponse } from 'next/server';
import { recomendarTipoHipoteca, PerfilHipoteca } from '@/lib/calculadoras/selectorHipoteca';

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

    const perfil: PerfilHipoteca = {
      tolerancia_euribor:            body.tolerancia_euribor,
      plazo_anos:                    Number(body.plazo_anos),
      situacion_laboral:             body.situacion_laboral,
      vivienda_eficiente:            Boolean(body.vivienda_eficiente),
      puede_amortizar_regularmente:  Boolean(body.puede_amortizar_regularmente),
      vende_antes_10_anos:           body.vende_antes_10_anos === null ? null : Boolean(body.vende_antes_10_anos),
      preferencia_cuota:             body.preferencia_cuota,
      ratio_prestamo_ingresos:       body.ratio_prestamo_ingresos,
      tipo_vivienda:                 body.tipo_vivienda,
      titulares_con_ingresos:        Number(body.titulares_con_ingresos) as 1 | 2,
    };

    const resultado = recomendarTipoHipoteca(perfil);

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion: 'selector-tipo-hipoteca', modo: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        tipo_recomendado:  resultado.tipo_recomendado,
        titulo:            resultado.titulo,
        subtitulo:         resultado.subtitulo,
        descripcion:       resultado.descripcion,
        caracteristicas:   resultado.caracteristicas,
        alertas:           resultado.alertas,
        segunda_opcion:    resultado.segunda_opcion,
        aviso_legal: '⚠️ Orientación basada en el perfil declarado. Las condiciones reales dependen de cada entidad bancaria. Consulta con un asesor hipotecario antes de decidir. Fuente: meskeia.com/selector-tipo-hipoteca',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
