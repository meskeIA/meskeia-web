/**
 * API Route: IVA Factura para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/iva-factura
 *
 * Calcula el desglose de IVA en facturas para autónomos y empresas:
 * añadir IVA a una base imponible o extraer la base de un total con IVA.
 * Tipos vigentes España 2025: 21%, 10%, 4%, 0%.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularIVA } from '@/lib/calculadoras/iva';
import type { TipoIVA, ModoIVA } from '@/lib/calculadoras/iva';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Tipos IVA vigentes España 2025 (Ley 37/1992). ' +
  'Algunos bienes/servicios pueden tener tipos especiales o estar exentos. ' +
  'Fuente: meskeia.com/calculadora-iva';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { importe, tipoIVA, modo } = body;

    if (typeof importe !== 'number' || importe <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo importe es obligatorio y debe ser un número positivo en euros. ' +
            'Ejemplo: 1000 para calcular el IVA de 1.000€.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tiposValidos: TipoIVA[] = [21, 10, 4, 0];
    if (!tiposValidos.includes(tipoIVA)) {
      return NextResponse.json(
        {
          error:
            'El campo tipoIVA es obligatorio. Valores válidos: 21, 10, 4 o 0. ' +
            '21% = general (servicios profesionales). 10% = reducido. 4% = superreducido. 0% = exento.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const modosValidos: ModoIVA[] = ['anadir', 'quitar'];
    if (!modosValidos.includes(modo)) {
      return NextResponse.json(
        {
          error:
            'El campo modo es obligatorio. Valores válidos: "anadir" (el importe es sin IVA, calcular total) ' +
            'o "quitar" (el importe ya incluye IVA, extraer la base imponible).',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularIVA({
      importe,
      tipoIVA: tipoIVA as TipoIVA,
      modo: modo as ModoIVA,
    });

    registrarLlamadaChatGPT(importe, tipoIVA).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/iva-factura:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(importe: number, tipoIVA: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['iva-factura', timestamp, 'chatgpt', JSON.stringify({ importe, tipoIVA })],
  });
}
