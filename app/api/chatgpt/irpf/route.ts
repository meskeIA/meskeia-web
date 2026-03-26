/**
 * API Route: Estimador IRPF para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/irpf
 *
 * Calcula la cuota íntegra, la cuota diferencial y el tipo efectivo IRPF
 * para un trabajador o contribuyente en España. Aplica gastos deducibles,
 * reducción por rendimientos del trabajo (RNT) y mínimos personales/familiares.
 *
 * Datos fiscales: Ley 35/2006 IRPF + LPGE 2025 — tramos 2025.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularIRPF } from '@/lib/calculadoras/irpf';
import type { SituacionFamiliarIRPF } from '@/lib/calculadoras/irpf';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Estimación orientativa con tramos IRPF 2025 (Ley 35/2006 + LPGE 2025). ' +
  'No incluye deducciones autonómicas ni situaciones especiales. ' +
  'Para la liquidación exacta consulta a un asesor fiscal o usa el servicio Renta de la AEAT. ' +
  'Fuente: meskeia.com/calculadora-irpf';

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
    const {
      rendimientosTrabajo, rendimientosCapitalMobiliario, rendimientosCapitalInmobiliario,
      gananciasPLargo, gananciasPCorto, retenciones,
      situacion, numHijos, hijosMenores3,
    } = body;

    if (typeof rendimientosTrabajo !== 'number' || rendimientosTrabajo < 0) {
      return NextResponse.json(
        {
          error:
            'El campo rendimientosTrabajo es obligatorio (€ anuales netos de Seguridad Social, es decir: salario bruto anual menos las cotizaciones del trabajador a la SS). ' +
            'Ejemplo: si el salario bruto es 30.000€, resta aproximadamente 1.980€ de cuotas SS → rendimientosTrabajo = 28.020.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const situacionesFamiliares: SituacionFamiliarIRPF[] = [
      'soltero', 'casado_sin_ingresos', 'casado_con_ingresos',
    ];

    const resultado = calcularIRPF({
      rendimientosTrabajo,
      rendimientosCapitalMobiliario: typeof rendimientosCapitalMobiliario === 'number' ? rendimientosCapitalMobiliario : undefined,
      rendimientosCapitalInmobiliario: typeof rendimientosCapitalInmobiliario === 'number' ? rendimientosCapitalInmobiliario : undefined,
      gananciasPLargo: typeof gananciasPLargo === 'number' ? gananciasPLargo : undefined,
      gananciasPCorto: typeof gananciasPCorto === 'number' ? gananciasPCorto : undefined,
      retenciones: typeof retenciones === 'number' ? retenciones : undefined,
      situacion: situacionesFamiliares.includes(situacion) ? situacion : 'soltero',
      numHijos: typeof numHijos === 'number' ? numHijos : undefined,
      hijosMenores3: typeof hijosMenores3 === 'number' ? hijosMenores3 : undefined,
      esTrabajador: true,
    });

    registrarLlamadaChatGPT(rendimientosTrabajo).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/irpf:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(rendimientosTrabajo: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['irpf', timestamp, 'chatgpt', JSON.stringify({ rendimientosTrabajo })],
  });
}
