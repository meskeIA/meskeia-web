import { NextRequest, NextResponse } from 'next/server';
import { calcularCompraventa } from '@/lib/calculadoras/compraventa';

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
    const resultado = calcularCompraventa({
      precioInmueble:       Number(body.precioInmueble),
      ccaa:                 String(body.ccaa),
      tipoTransmision:      body.tipoTransmision ?? 'segunda_mano',
      tipoInmueble:         body.tipoInmueble ?? 'vivienda',
      perfilComprador:      body.perfilComprador ?? 'general',
      precioCompraOriginal: body.precioCompraOriginal !== undefined ? Number(body.precioCompraOriginal) : undefined,
      aniosTenencia:        body.aniosTenencia !== undefined ? Number(body.aniosTenencia) : undefined,
      valorCatastralSuelo:  body.valorCatastralSuelo !== undefined ? Number(body.valorCatastralSuelo) : undefined,
      vendedorMayor65:      body.vendedorMayor65 ?? false,
      esViviendaHabitual:   body.esViviendaHabitual ?? false,
      tipoMunicipalIIVTNU:  body.tipoMunicipalIIVTNU !== undefined ? Number(body.tipoMunicipalIIVTNU) : undefined,
    });

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: 'gastos-compraventa', mode: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        ...resultado,
        aviso_legal: '⚠️ Resultado orientativo basado en tipos ITP/AJD 2025 por CCAA. Los gastos reales pueden variar según el notario, registro y gestoría elegidos. Consulta con un profesional inmobiliario. Fuente: meskeia.com/gastos-compraventa',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
