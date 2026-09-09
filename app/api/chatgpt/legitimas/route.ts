import { NextRequest, NextResponse } from 'next/server';
import { calcularLegitimas, esRegimenValido, REGIMENES_VALIDOS } from '@/lib/calculadoras/legitimas';
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

// ─── Validación de entrada ─────────────────────────────────────────────────────
// El cuerpo llega de un LLM, que puede mandar cadenas donde se esperan números o booleanos,
// omitir campos o inventarse un régimen. Antes esto se pasaba en crudo al motor y salía un
// HTTP 200 con "legitimaTotal": null, que un LLM lee como «no corresponde legítima».

/** Convierte a número admitiendo la cadena numérica; rechaza NaN, Infinity y basura. */
function aNumero(valor: unknown, campo: string): number {
  if (typeof valor === 'number') {
    if (!Number.isFinite(valor)) throw new Error(`El campo "${campo}" debe ser un número finito.`);
    return valor;
  }
  if (typeof valor === 'string' && valor.trim() !== '') {
    const n = Number(valor.trim());
    if (Number.isFinite(n)) return n;
  }
  throw new Error(`El campo "${campo}" debe ser un número. Recibido: ${JSON.stringify(valor)}.`);
}

/** Acepta booleano o las cadenas "true"/"false"; `undefined` se propaga como tal. */
function aBooleanoOpcional(valor: unknown, campo: string): boolean | undefined {
  if (valor === undefined || valor === null) return undefined;
  if (typeof valor === 'boolean') return valor;
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  throw new Error(`El campo "${campo}" debe ser true o false. Recibido: ${JSON.stringify(valor)}.`);
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new Error('El cuerpo de la petición debe ser un JSON válido.');
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new Error('El cuerpo de la petición debe ser un objeto JSON.');
    }
    const datos = body as Record<string, unknown>;
    const regimen: unknown = datos.regimen;

    if (!esRegimenValido(regimen)) {
      throw new Error(
        `El campo "regimen" debe ser uno de: ${REGIMENES_VALIDOS.join(', ')}. ` +
        `Recibido: ${JSON.stringify(regimen)}.`
      );
    }

    const resultado = calcularLegitimas({
      patrimonioNeto:    aNumero(datos.patrimonioNeto, 'patrimonioNeto'),
      regimen,
      numHijos:          aNumero(datos.numHijos, 'numHijos'),
      tieneConyuge:      aBooleanoOpcional(datos.tieneConyuge, 'tieneConyuge') ?? false,
      tieneAscendientes: aBooleanoOpcional(datos.tieneAscendientes, 'tieneAscendientes'),
    });

    registrarLlamadaChatGPT().catch(() => {});

    return NextResponse.json(
      {
        ...resultado,
        aviso_legal: '⚠️ Resultado orientativo basado en normativa civil española 2025. Las legítimas dependen de múltiples factores y requieren asesoramiento notarial profesional. No constituye asesoramiento jurídico. Fuente: meskeia.com/orientacion-tramitacion-herencias',
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
    args: ['orientacion-tramitacion-herencias', timestamp, 'chatgpt'],
  });
}
