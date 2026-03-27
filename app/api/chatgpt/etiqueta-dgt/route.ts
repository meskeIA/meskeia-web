/**
 * API Route: Etiqueta DGT y acceso ZBE para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/etiqueta-dgt
 *
 * Calcula la etiqueta medioambiental DGT (CERO, ECO, C, B o Sin etiqueta)
 * según el tipo de combustible y año de matriculación, e informa del acceso
 * a las principales ZBE de España (Madrid, Barcelona, Valencia, Sevilla,
 * Zaragoza, Valladolid y Bilbao).
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Información orientativa a 2025. Las restricciones ZBE (horarios, episodios de contaminación) varían por ciudad y pueden cambiar. ' +
  'Consulta el portal oficial de tu municipio. ' +
  'Fuente: meskeia.com/etiqueta-dgt';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://chat.openai.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, OpenAI-Conversation-Id',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

type Combustible = 'electrico' | 'phev' | 'hibrido' | 'gnc_glp' | 'gasolina' | 'diesel';
type Etiqueta = 'CERO' | 'ECO' | 'C' | 'B' | 'Sin etiqueta';
type AccesoZBE = 'libre' | 'restriccion' | 'prohibido';

interface ZBEInfo {
  ciudad: string;
  acceso: AccesoZBE;
  detalle: string;
}

const ZBE_POR_ETIQUETA: Record<Etiqueta, ZBEInfo[]> = {
  'CERO': [
    { ciudad: 'Madrid', acceso: 'libre', detalle: 'Acceso libre a ZBE Distrito Centro y ZBE 30.' },
    { ciudad: 'Barcelona', acceso: 'libre', detalle: 'Acceso libre a la ZBE Rondes.' },
    { ciudad: 'Valencia', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Sevilla', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Zaragoza', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Valladolid', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Bilbao', acceso: 'libre', detalle: 'Acceso libre.' },
  ],
  'ECO': [
    { ciudad: 'Madrid', acceso: 'libre', detalle: 'Acceso libre a ZBE Distrito Centro y ZBE 30.' },
    { ciudad: 'Barcelona', acceso: 'libre', detalle: 'Acceso libre a la ZBE Rondes.' },
    { ciudad: 'Valencia', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Sevilla', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Zaragoza', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Valladolid', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Bilbao', acceso: 'libre', detalle: 'Acceso libre.' },
  ],
  'C': [
    { ciudad: 'Madrid', acceso: 'restriccion', detalle: 'Acceso libre salvo episodios de alta contaminación (nivel 2 o 3).' },
    { ciudad: 'Barcelona', acceso: 'libre', detalle: 'Acceso libre a la ZBE Rondes.' },
    { ciudad: 'Valencia', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Sevilla', acceso: 'libre', detalle: 'ZBE en implantación. Acceso libre de momento.' },
    { ciudad: 'Zaragoza', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Valladolid', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Bilbao', acceso: 'libre', detalle: 'Acceso libre.' },
  ],
  'B': [
    { ciudad: 'Madrid', acceso: 'restriccion', detalle: 'Solo residentes en ZBE Distrito Centro. Restricciones en episodios desde nivel 1.' },
    { ciudad: 'Barcelona', acceso: 'restriccion', detalle: 'Restringido en la ZBE Rondes (lunes a viernes 7h-20h).' },
    { ciudad: 'Valencia', acceso: 'restriccion', detalle: 'Acceso con restricciones en horario punta.' },
    { ciudad: 'Sevilla', acceso: 'libre', detalle: 'Acceso libre de momento (ZBE en implantación).' },
    { ciudad: 'Zaragoza', acceso: 'restriccion', detalle: 'Restringido en horario punta según ordenanza.' },
    { ciudad: 'Valladolid', acceso: 'libre', detalle: 'Acceso libre.' },
    { ciudad: 'Bilbao', acceso: 'restriccion', detalle: 'Restricciones en zona ZBE de Bilbao La Vieja y Centro.' },
  ],
  'Sin etiqueta': [
    { ciudad: 'Madrid', acceso: 'prohibido', detalle: 'Prohibido circular en ZBE Distrito Centro. Multas de 90-500€.' },
    { ciudad: 'Barcelona', acceso: 'prohibido', detalle: 'Prohibido en ZBE Rondes. Control automático por cámaras.' },
    { ciudad: 'Valencia', acceso: 'prohibido', detalle: 'Prohibido en zona ZBE.' },
    { ciudad: 'Sevilla', acceso: 'restriccion', detalle: 'Restricciones progresivas en implantación.' },
    { ciudad: 'Zaragoza', acceso: 'prohibido', detalle: 'Prohibido en ZBE centro.' },
    { ciudad: 'Valladolid', acceso: 'restriccion', detalle: 'Restricciones en horario punta.' },
    { ciudad: 'Bilbao', acceso: 'prohibido', detalle: 'Prohibido en la ZBE de Bilbao.' },
  ],
};

const DESCRIPCIONES: Record<Etiqueta, string> = {
  'CERO': 'Vehículo cero emisiones (eléctrico puro, hidrógeno, PHEV ≥40km eléctricos, GNC/GLP). Máxima categoría DGT.',
  'ECO': 'Híbrido convencional o PHEV con autonomía <40km. Segunda categoría, acceso sin restricciones en la mayoría de ZBE.',
  'C': 'Gasolina desde 2006 (Euro 4+) o diésel desde 2015 (Euro 6). Acceso libre en la mayoría de ciudades.',
  'B': 'Gasolina 2001-2005 (Euro 3) o diésel 2006-2014 (Euro 4/5). Acceso limitado en algunas ZBE.',
  'Sin etiqueta': 'Gasolina anterior a 2001 o diésel anterior a 2006. Ya restringido o prohibido en las principales ZBE.',
};

const RECOMENDACIONES: Record<Etiqueta, string> = {
  'CERO': 'Tu vehículo tiene la máxima categoría ambiental. Accedes a todos los beneficios ZBE, carriles BUS+VAO y parking bonificado en muchos municipios.',
  'ECO': 'Buena etiqueta. Accedes a la mayoría de ZBE sin restricciones. Considera que las normativas tienden a endurecerse.',
  'C': 'Etiqueta válida. En episodios de contaminación alta pueden activarse restricciones adicionales en algunas ciudades.',
  'B': 'Etiqueta limitada. Las normativas se están endureciendo: en 2025-2026 la etiqueta B podría quedar restringida en horario punta en más ciudades.',
  'Sin etiqueta': 'Tu vehículo ya no puede circular en las ZBE de las principales ciudades. Si lo usas en zona urbana habitualmente, considera la renovación.',
};

function calcularEtiqueta(combustible: Combustible, anio: number, autonomiaPhev: number): Etiqueta {
  if (combustible === 'electrico' || combustible === 'gnc_glp') return 'CERO';
  if (combustible === 'phev') return autonomiaPhev >= 40 ? 'CERO' : 'ECO';
  if (combustible === 'hibrido') return 'ECO';
  if (combustible === 'gasolina') {
    if (anio >= 2006) return 'C';
    if (anio >= 2001) return 'B';
    return 'Sin etiqueta';
  }
  if (combustible === 'diesel') {
    if (anio >= 2015) return 'C';
    if (anio >= 2006) return 'B';
    return 'Sin etiqueta';
  }
  return 'Sin etiqueta';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { combustible, anioMatriculacion, autonomiaPhevKm = 0 } = body;

    const combustiblesValidos: Combustible[] = ['electrico', 'phev', 'hibrido', 'gnc_glp', 'gasolina', 'diesel'];
    if (!combustiblesValidos.includes(combustible)) {
      return NextResponse.json(
        { error: `combustible debe ser uno de: ${combustiblesValidos.join(', ')}.` },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof anioMatriculacion !== 'number' || anioMatriculacion < 1980 || anioMatriculacion > 2025) {
      return NextResponse.json(
        { error: 'anioMatriculacion debe ser un número entre 1980 y 2025. Ejemplo: 2018.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const etiqueta = calcularEtiqueta(combustible as Combustible, anioMatriculacion, autonomiaPhevKm);
    const zbeCiudades = ZBE_POR_ETIQUETA[etiqueta];

    registrarLlamada(combustible, anioMatriculacion).catch(() => {});

    return NextResponse.json(
      {
        etiqueta,
        descripcion: DESCRIPCIONES[etiqueta],
        recomendacion: RECOMENDACIONES[etiqueta],
        acceso_zbe: zbeCiudades,
        ciudades_libres: zbeCiudades.filter(z => z.acceso === 'libre').map(z => z.ciudad),
        ciudades_restriccion: zbeCiudades.filter(z => z.acceso === 'restriccion').map(z => z.ciudad),
        ciudades_prohibido: zbeCiudades.filter(z => z.acceso === 'prohibido').map(z => z.ciudad),
        aviso_legal: AVISO_LEGAL,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/etiqueta-dgt:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar la etiqueta DGT. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamada(combustible: string, anio: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();
  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['etiqueta-dgt', timestamp, 'chatgpt', JSON.stringify({ combustible, anio })],
  });
}
