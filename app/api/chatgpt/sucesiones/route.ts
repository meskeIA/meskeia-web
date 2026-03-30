import { NextRequest, NextResponse } from 'next/server';
import { calcularSucesion } from '@/lib/calculadoras/sucesiones';
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
    const resultado = calcularSucesion({
      baseImponible:    Number(body.baseImponible),
      ccaa:             String(body.ccaa),
      grupo:            body.grupo,
      edadHeredero:     body.edadHeredero !== undefined ? Number(body.edadHeredero) : undefined,
      discapacidad:     body.discapacidad ?? '0',
      patrimonioIdx:    body.patrimonioIdx !== undefined ? Number(body.patrimonioIdx) as 1 | 2 | 3 | 4 : 1,
      viviendaHabitual: body.viviendaHabitual !== undefined ? Number(body.viviendaHabitual) : undefined,
      seguroVida:       body.seguroVida !== undefined ? Number(body.seguroVida) : undefined,
      incluyeAjuar:     body.incluyeAjuar ?? false,
    });

    registrarLlamadaChatGPT().catch(() => {});

    return NextResponse.json(
      {
        ...resultado,
        aviso_legal: '⚠️ Resultado orientativo basado en Ley 29/1987 ISD y normativas autonómicas 2025. Las herencias requieren asesoramiento notarial y fiscal profesional. No constituye asesoramiento jurídico ni fiscal. Fuente: meskeia.com/estimador-impuesto-sucesiones',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}

async function registrarLlamadaChatGPT(): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();
  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo) VALUES (?, ?, ?)`,
    args: ['estimador-impuesto-sucesiones', timestamp, 'chatgpt'],
  });
}
