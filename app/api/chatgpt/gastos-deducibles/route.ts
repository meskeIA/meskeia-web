/**
 * API Route: Gastos Deducibles IRPF Autónomo para ChatGPT Actions
 * Endpoint: POST /api/chatgpt/gastos-deducibles
 *
 * Calcula los gastos deducibles en el IRPF para autónomos en
 * estimación directa simplificada (EDS) o normal (EDN).
 * Incluye cuotas SS, suministros hogar, dietas, asesoría y más.
 *
 * Analytics: registra cada llamada con modo='chatgpt' en Turso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calcularDeduccionAutonomoIRPF } from '@/lib/calculadoras/deduccionAutonomoIRPF';
import type { ModalidadEstimacion } from '@/lib/calculadoras/deduccionAutonomoIRPF';
import { FISCAL_IRPF_META } from '@/data/fiscal';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

// La vigencia se deriva de data/fiscal (lo único que el Vigía Normativo re-sella):
// el texto decía «vigente 2025» en septiembre de 2026 y no hay app que lo corrija
// con <DataReference>, porque este endpoint solo lo lee un LLM.
// La URL apuntaba a meskeia.com/deduccion-autonomo-irpf, que NO existe (404): la
// página real del tema es /orientador-gastos-deducibles/.
const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF arts. 28-30 + DGT consultas vinculantes. ' +
  `Datos de la escala IRPF con vigencia ${FISCAL_IRPF_META.vigencia}, verificados el ${FISCAL_IRPF_META.verificado}. ` +
  'La deducibilidad real puede variar según tu caso concreto. ' +
  'Consulta con tu gestor fiscal. Fuente: meskeia.com/orientador-gastos-deducibles/';

/** Solo pasan números finitos: `NaN` es `typeof 'number'` y `NaN < 0` es `false`, así que
 *  atravesaba las dos guardas y salía como `null` en el JSON, con HTTP 200 y sin error. */
function numeroFinito(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

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
      modalidadEstimacion,
      ingresosBrutos,
      cuotasSSAutonomo,
      alquilerLocal,
      gastosSupministrosHogar,
      pctSuperficieActividadHogar,
      gastosAsesoria,
      gastosSeguros,
      otrosGastos,
      gastosDietas,
      diasDietasEspaniaSinPernoctar,
      diasDietasEspaniaPernoctando,
      diasDietasExtranjeroSinPernoctar,
      diasDietasExtranjeroPernoctando,
      otrosGastosAcreditados,
    } = body;

    const modalidadesValidas: ModalidadEstimacion[] = ['simplificada', 'directa_normal'];
    if (!modalidadesValidas.includes(modalidadEstimacion)) {
      return NextResponse.json(
        {
          error:
            'El campo modalidadEstimacion es obligatorio. Valores válidos: "simplificada" o "directa_normal". ' +
            'La mayoría de autónomos usa "simplificada" (facturación < 600.000€/año).',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (typeof ingresosBrutos !== 'number' || !Number.isFinite(ingresosBrutos) || ingresosBrutos < 0) {
      return NextResponse.json(
        {
          error:
            'El campo ingresosBrutos es obligatorio y debe ser un número finito no negativo ' +
            '(€ anuales de facturación). Ejemplo: 40000 si facturas 40.000€ brutos al año.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularDeduccionAutonomoIRPF({
      modalidadEstimacion: modalidadEstimacion as ModalidadEstimacion,
      ingresosBrutos,
      cuotasSSAutonomo: numeroFinito(cuotasSSAutonomo),
      alquilerLocal: numeroFinito(alquilerLocal),
      gastosSupministrosHogar: numeroFinito(gastosSupministrosHogar),
      pctSuperficieActividadHogar: numeroFinito(pctSuperficieActividadHogar),
      gastosAsesoria: numeroFinito(gastosAsesoria),
      gastosSeguros: numeroFinito(gastosSeguros),
      otrosGastos: numeroFinito(otrosGastos),
      gastosDietas: numeroFinito(gastosDietas),
      diasDietasEspaniaSinPernoctar: numeroFinito(diasDietasEspaniaSinPernoctar),
      diasDietasEspaniaPernoctando: numeroFinito(diasDietasEspaniaPernoctando),
      diasDietasExtranjeroSinPernoctar: numeroFinito(diasDietasExtranjeroSinPernoctar),
      diasDietasExtranjeroPernoctando: numeroFinito(diasDietasExtranjeroPernoctando),
      otrosGastosAcreditados: numeroFinito(otrosGastosAcreditados),
    });

    registrarLlamadaChatGPT(ingresosBrutos, modalidadEstimacion).catch(() => {});

    return NextResponse.json(
      { ...resultado, aviso_legal: AVISO_LEGAL },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error en /api/chatgpt/gastos-deducibles:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el cálculo. Inténtalo de nuevo.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function registrarLlamadaChatGPT(
  ingresosBrutos: number,
  modalidadEstimacion: string
): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();

  const timestamp = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  await client.execute({
    sql: `INSERT INTO uso_aplicaciones (aplicacion, timestamp, modo, datos_adicionales) VALUES (?, ?, ?, ?)`,
    args: [
      'gastos-deducibles',
      timestamp,
      'chatgpt',
      JSON.stringify({ ingresosBrutos, modalidadEstimacion }),
    ],
  });
}
