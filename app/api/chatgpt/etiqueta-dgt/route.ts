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
import { datosLlamanteGpt } from '@/lib/analytics-gpt';
import { clasificar, type TipoCombustible, type TipoEtiqueta } from '@/app/etiqueta-dgt/motor';
import { CIUDADES_ZBE, type AccesoZBE } from '@/app/etiqueta-dgt/zbe';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Información orientativa. Las restricciones ZBE (horarios, episodios de contaminación) varían por ciudad y pueden cambiar. ' +
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

interface ZBEInfo {
  ciudad: string;
  acceso: AccesoZBE;
  detalle: string;
}

// ⚠️ 2026-10-04: esta ruta tenía su propia copia de la clasificación y de la tabla de ZBE, que
//    había divergido de la app: daba la CERO al gas (es ECO, y solo si cumple la C), la C a todo
//    diésel de 2015 (desde septiembre), la ECO a cualquier HEV, acceso libre a la C en Distrito
//    Centro y la B restringida en Barcelona (hallazgos 2842, 2843 y 2846). Ahora lee el motor y
//    la tabla de la app: app/etiqueta-dgt/motor.ts y app/etiqueta-dgt/zbe.ts.
const COMBUSTIBLE_MOTOR: Record<Combustible, TipoCombustible> = {
  electrico: 'bev',
  phev: 'phev',
  hibrido: 'hev',
  gnc_glp: 'gnc',
  gasolina: 'gasolina',
  diesel: 'diesel',
};

const NOMBRE_ETIQUETA: Record<TipoEtiqueta, Etiqueta> = {
  cero: 'CERO',
  eco: 'ECO',
  c: 'C',
  b: 'B',
  ninguna: 'Sin etiqueta',
};

const DESCRIPCIONES: Record<Etiqueta, string> = {
  'CERO': 'Eléctrico de batería, de autonomía extendida, de pila de combustible o híbrido enchufable con 40 km o más de autonomía eléctrica. Máxima categoría DGT.',
  'ECO': 'Híbrido no enchufable, híbrido enchufable con menos de 40 km de autonomía o vehículo de gas (GNC, GNL o GLP), que además cumpla los criterios de la C.',
  'C': 'Gasolina matriculado desde enero de 2006 (Euro 4+) o diésel desde septiembre de 2015 (Euro 6).',
  'B': 'Gasolina 2001-2005 (Euro 3) o diésel de 2006 a agosto de 2015 (Euro 4/5). Acceso limitado en algunas ZBE.',
  'Sin etiqueta': 'Gasolina anterior a 2001 o diésel anterior a 2006. Prohibido o restringido en las principales ZBE.',
};

const RECOMENDACIONES: Record<Etiqueta, string> = {
  'CERO': 'Tu vehículo tiene la máxima categoría ambiental. Accedes a todos los beneficios ZBE, carriles BUS+VAO y parking bonificado en muchos municipios.',
  'ECO': 'Buena etiqueta. Accedes a la mayoría de ZBE sin restricciones. Considera que las normativas tienden a endurecerse.',
  'C': 'Etiqueta válida en la mayoría de ZBE. En Madrid no puede atravesar la ZBEDEP Distrito Centro (solo entrar para aparcar), y en episodios de contaminación alta pueden activarse restricciones.',
  'B': 'Etiqueta limitada: en Madrid no puede atravesar la ZBEDEP Distrito Centro (solo entrar para aparcar). En Barcelona circula sin restricción por la ZBE Rondes. Las ordenanzas cambian: consulta cada municipio.',
  'Sin etiqueta': 'Tu vehículo ya no puede circular en las ZBE de las principales ciudades, y en Madrid en ninguna vía urbana del municipio. Si lo usas en zona urbana habitualmente, considera la renovación.',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { combustible, anioMatriculacion, autonomiaPhevKm = 0, mesMatriculacion } = body;

    const combustiblesValidos: Combustible[] = ['electrico', 'phev', 'hibrido', 'gnc_glp', 'gasolina', 'diesel'];
    if (!combustiblesValidos.includes(combustible)) {
      return NextResponse.json(
        { error: `combustible debe ser uno de: ${combustiblesValidos.join(', ')}.` },
        { status: 400, headers: corsHeaders() }
      );
    }

    const anioActual = new Date().getFullYear();
    if (typeof anioMatriculacion !== 'number' || anioMatriculacion < 1980 || anioMatriculacion > anioActual) {
      return NextResponse.json(
        { error: `anioMatriculacion debe ser un número entre 1980 y ${anioActual}. Ejemplo: 2018.` },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { etiqueta: tipo, matiz } = clasificar({
      combustible: COMBUSTIBLE_MOTOR[combustible as Combustible],
      anio: anioMatriculacion,
      // Solo el diésel de 2015 necesita el mes; sin él, el motor da la B y lo matiza.
      mes: typeof mesMatriculacion === 'number' ? mesMatriculacion : undefined,
      autonomiaPhev: Number(autonomiaPhevKm) >= 40 ? 'cuarentaOMas' : 'menos',
    });
    const etiqueta = NOMBRE_ETIQUETA[tipo];
    const zbeCiudades: ZBEInfo[] = CIUDADES_ZBE[tipo].map(z => ({ ciudad: z.nombre, acceso: z.acceso, detalle: z.detalle }));

    registrarLlamada(combustible, anioMatriculacion).catch(() => {});

    return NextResponse.json(
      {
        etiqueta,
        descripcion: DESCRIPCIONES[etiqueta],
        ...(matiz ? { matiz } : {}),
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
    args: ['etiqueta-dgt', timestamp, 'chatgpt', JSON.stringify({ combustible, anio, ...(await datosLlamanteGpt()) })],
  });
}
