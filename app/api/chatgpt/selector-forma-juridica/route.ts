import { NextRequest, NextResponse } from 'next/server';
import { recomendarFormaJuridica, PerfilFormaJuridica } from '@/lib/calculadoras/selectorFormaJuridica';

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

    const perfil: PerfilFormaJuridica = {
      ingresos_esperados:    body.ingresos_esperados,
      socios:                body.socios,
      riesgo_patrimonial:    body.riesgo_patrimonial,
      tipo_clientes:         body.tipo_clientes,
      separacion_patrimonio: body.separacion_patrimonio,
      carga_administrativa:  body.carga_administrativa,
      proyeccion:            body.proyeccion,
      necesita_inversores:   body.necesita_inversores,
      capital_inicial:       body.capital_inicial,
      experiencia:           body.experiencia,
    };

    const resultado = recomendarFormaJuridica(perfil);

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion: 'selector-forma-juridica', modo: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        forma_recomendada: resultado.forma_recomendada,
        titulo:            resultado.titulo,
        subtitulo:         resultado.subtitulo,
        descripcion:       resultado.descripcion,
        ventajas:          resultado.ventajas,
        inconvenientes:    resultado.inconvenientes,
        aviso_legal: '⚠️ Orientación basada en el perfil declarado. La elección de forma jurídica tiene implicaciones fiscales y legales importantes. Consulta siempre con un asesor fiscal o gestor antes de tomar la decisión definitiva. Fuente: meskeia.com/selector-forma-juridica',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
