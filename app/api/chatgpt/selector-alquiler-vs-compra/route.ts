import { NextRequest, NextResponse } from 'next/server';
import { recomendarAlquilerVsCompra, PerfilAlquilerVsCompra } from '@/lib/calculadoras/selectorAlquilerVsCompra';

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

    const perfil: PerfilAlquilerVsCompra = {
      horizonte_ciudad:     body.horizonte_ciudad,
      estabilidad_laboral:  body.estabilidad_laboral,
      capital_entrada:      body.capital_entrada,
      esfuerzo_hipotecario: body.esfuerzo_hipotecario,
      flexibilidad_vital:   body.flexibilidad_vital,
      ratio_coste:          body.ratio_coste,
      tolerancia_deuda:     body.tolerancia_deuda,
      perspectiva_zona:     body.perspectiva_zona,
      situacion_familiar:   body.situacion_familiar,
      prioridad_vital:      body.prioridad_vital,
    };

    const resultado = recomendarAlquilerVsCompra(perfil);

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion: 'selector-alquiler-vs-compra', modo: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        decision:                resultado.decision,
        titulo:                  resultado.titulo,
        subtitulo:               resultado.subtitulo,
        descripcion:             resultado.descripcion,
        argumentos_favor:        resultado.argumentos_favor,
        aspectos_a_considerar:   resultado.aspectos_a_considerar,
        perfil:                  resultado.perfil,
        aviso_legal: '⚠️ Orientación basada en el perfil declarado, no en cifras concretas. La decisión de comprar o alquilar depende de tu situación personal y financiera específica. Consulta con un asesor hipotecario o financiero antes de tomar una decisión definitiva. Fuente: meskeia.com/alquiler-vs-compra',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
