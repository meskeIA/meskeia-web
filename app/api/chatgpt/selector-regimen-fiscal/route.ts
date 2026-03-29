import { NextRequest, NextResponse } from 'next/server';
import { recomendarRegimenFiscal, PerfilRegimenFiscal } from '@/lib/calculadoras/selectorRegimenFiscal';

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

    const perfil: PerfilRegimenFiscal = {
      actividad_en_modulos:      body.actividad_en_modulos,
      facturacion_anual:         body.facturacion_anual,
      nivel_gastos:              body.nivel_gastos,
      clientes_con_retencion:    body.clientes_con_retencion,
      empleados:                 body.empleados,
      crecimiento_previsto:      body.crecimiento_previsto,
      proteccion_patrimonio:     body.proteccion_patrimonio,
      clientes_internacionales:  body.clientes_internacionales,
      complejidad_aceptable:     body.complejidad_aceptable,
      limite_modulos:            body.limite_modulos,
    };

    const resultado = recomendarRegimenFiscal(perfil);

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion: 'selector-regimen-fiscal-autonomo', modo: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        regimen_recomendado:  resultado.regimen_recomendado,
        titulo:               resultado.titulo,
        subtitulo:            resultado.subtitulo,
        descripcion:          resultado.descripcion,
        ventajas:             resultado.ventajas,
        consideraciones:      resultado.consideraciones,
        segunda_opcion:       resultado.segunda_opcion,
        aviso_legal: '⚠️ Orientación basada en el perfil declarado. El régimen fiscal óptimo depende de tu situación concreta, actividad, CCAA y circunstancias personales. Consulta siempre con un gestor o asesor fiscal antes de tomar ninguna decisión. Fuente: meskeia.com/selector-regimen-fiscal-autonomo',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
