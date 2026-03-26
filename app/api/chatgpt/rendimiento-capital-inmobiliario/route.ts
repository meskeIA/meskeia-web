/**
 * API Route: Rendimiento Capital Inmobiliario (IRPF Alquiler) para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/rendimiento-capital-inmobiliario
 *
 * Calcula el rendimiento neto del capital inmobiliario declarable en el IRPF
 * por ingresos de arrendamiento: deduce todos los gastos permitidos (IBI,
 * intereses, seguros, amortización, comunidad...) y aplica las reducciones
 * de la Ley de Vivienda 2023 (50-90% según tipo de arrendamiento).
 *
 * Los gastos se reciben aplanados en parámetros individuales y se
 * reconstruyen internamente en el objeto GastosDeduciblesRCI.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularRendimientoCapitalInmobiliario } from '@/lib/calculadoras/rendimientoCapitalInmobiliario';
import type { TipoInmuebleRCI } from '@/lib/calculadoras/rendimientoCapitalInmobiliario';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF arts. 22-24 + Ley 12/2023 — vigente 2025. ' +
  'Las reducciones del 60-90% requieren cumplir requisitos específicos de zona tensionada. ' +
  'Consulta con un asesor fiscal para verificar la reducción aplicable en tu caso. ' +
  'Fuente: meskeia.com/irpf-alquiler';

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
      tipoInmueble, ingresosIntegros,
      interesesPrestamo, gastosFinanciacion,
      ibiYTributos, seguros, reparacionConservacion,
      comunidad, administracion, otros,
      valorConstruccion, amortizacionDirecta,
      excesoGastosPendientesAniosAnt,
    } = body;

    const tiposValidos: TipoInmuebleRCI[] = [
      'vivienda_habitual_arrendatario',
      'vivienda_zona_tensionada_nueva',
      'vivienda_rehabilitada',
      'vivienda_tension_reduccion_5pct',
      'no_vivienda',
    ];

    if (!tiposValidos.includes(tipoInmueble)) {
      return NextResponse.json(
        {
          error:
            'El campo tipoInmueble es obligatorio. Valores posibles: ' +
            '"vivienda_habitual_arrendatario" (vivienda habitual del inquilino — reducción 50%), ' +
            '"vivienda_zona_tensionada_nueva" (zona tensionada, primer contrato o arrendatario vulnerable — 70%), ' +
            '"vivienda_rehabilitada" (obras de rehabilitación en los 2 años anteriores — 60%), ' +
            '"vivienda_tension_reduccion_5pct" (zona tensionada + reducción ≥5% respecto al contrato anterior — 90%), ' +
            '"no_vivienda" (local, garaje, trastero — sin reducción).',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof ingresosIntegros !== 'number' || ingresosIntegros <= 0) {
      return NextResponse.json(
        {
          error:
            'El campo ingresosIntegros es obligatorio (€ anuales de ingresos brutos por el alquiler). ' +
            'Ejemplo: 9600 si cobras 800€/mes × 12 meses.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularRendimientoCapitalInmobiliario({
      tipoInmueble,
      ingresosIntegros,
      gastos: {
        interesesPrestamo: typeof interesesPrestamo === 'number' ? interesesPrestamo : undefined,
        gastosFinanciacion: typeof gastosFinanciacion === 'number' ? gastosFinanciacion : undefined,
        ibiYTributos: typeof ibiYTributos === 'number' ? ibiYTributos : undefined,
        seguros: typeof seguros === 'number' ? seguros : undefined,
        reparacionConservacion: typeof reparacionConservacion === 'number' ? reparacionConservacion : undefined,
        comunidad: typeof comunidad === 'number' ? comunidad : undefined,
        administracion: typeof administracion === 'number' ? administracion : undefined,
        otros: typeof otros === 'number' ? otros : undefined,
        valorConstruccion: typeof valorConstruccion === 'number' ? valorConstruccion : undefined,
        amortizacionDirecta: typeof amortizacionDirecta === 'number' ? amortizacionDirecta : undefined,
      },
      excesoGastosPendientesAniosAnt: typeof excesoGastosPendientesAniosAnt === 'number'
        ? excesoGastosPendientesAniosAnt
        : undefined,
    });

    registrarLlamadaChatGPT(ingresosIntegros).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/rendimiento-capital-inmobiliario:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(ingresosIntegros: number): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: ['rendimiento-capital-inmobiliario', timestamp, 'chatgpt', JSON.stringify({ ingresosIntegros })],
  });
}
