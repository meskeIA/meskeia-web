import { NextRequest, NextResponse } from 'next/server';
import { recomendarInversion, PerfilInversion } from '@/lib/calculadoras/selectorInversiones';

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

    const perfil: PerfilInversion = {
      horizonte_temporal:    body.horizonte_temporal,
      reaccion_caida:        body.reaccion_caida,
      conocimiento_financiero: body.conocimiento_financiero,
      capital_disponible:    body.capital_disponible,
      importancia_liquidez:  body.importancia_liquidez,
      ventaja_fiscal:        body.ventaja_fiscal,
      gestion_activa:        body.gestion_activa,
      interes_inmobiliario:  body.interes_inmobiliario,
      preocupacion_inflacion: body.preocupacion_inflacion,
      fondo_emergencia:      body.fondo_emergencia,
    };

    const resultado = recomendarInversion(perfil);

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion: 'selector-inversiones', modo: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        inversion_recomendada: resultado.inversion_recomendada,
        titulo:                resultado.titulo,
        subtitulo:             resultado.subtitulo,
        descripcion:           resultado.descripcion,
        ventajas:              resultado.ventajas,
        riesgos:               resultado.riesgos,
        perfil:                resultado.perfil,
        segunda_opcion:        resultado.segunda_opcion,
        puntuaciones:          resultado.puntuaciones,
        aviso_legal: '⚠️ Orientación basada en el perfil declarado. La inversión implica riesgos, incluida la posible pérdida del capital. Consulta siempre con un asesor financiero independiente antes de tomar decisiones de inversión. Fuente: meskeia.com/selector-inversiones',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
