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
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

const AVISO_LEGAL =
  '⚠️ Resultado orientativo basado en LIRPF arts. 28-30 + DGT consultas vinculantes, vigente 2025. ' +
  'La deducibilidad real puede variar según tu caso concreto. ' +
  'Consulta con tu gestor fiscal. Fuente: meskeia.com/deduccion-autonomo-irpf';

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

    if (typeof ingresosBrutos !== 'number' || ingresosBrutos < 0) {
      return NextResponse.json(
        {
          error:
            'El campo ingresosBrutos es obligatorio (€ anuales de facturación). ' +
            'Ejemplo: 40000 si facturas 40.000€ brutos al año.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const resultado = calcularDeduccionAutonomoIRPF({
      modalidadEstimacion: modalidadEstimacion as ModalidadEstimacion,
      ingresosBrutos,
      cuotasSSAutonomo: typeof cuotasSSAutonomo === 'number' ? cuotasSSAutonomo : undefined,
      alquilerLocal: typeof alquilerLocal === 'number' ? alquilerLocal : undefined,
      gastosSupministrosHogar:
        typeof gastosSupministrosHogar === 'number' ? gastosSupministrosHogar : undefined,
      pctSuperficieActividadHogar:
        typeof pctSuperficieActividadHogar === 'number' ? pctSuperficieActividadHogar : undefined,
      gastosAsesoria: typeof gastosAsesoria === 'number' ? gastosAsesoria : undefined,
      gastosSeguros: typeof gastosSeguros === 'number' ? gastosSeguros : undefined,
      otrosGastos: typeof otrosGastos === 'number' ? otrosGastos : undefined,
      gastosDietas: typeof gastosDietas === 'number' ? gastosDietas : undefined,
      diasDietasEspaniaSinPernoctar:
        typeof diasDietasEspaniaSinPernoctar === 'number' ? diasDietasEspaniaSinPernoctar : undefined,
      diasDietasEspaniaPernoctando:
        typeof diasDietasEspaniaPernoctando === 'number' ? diasDietasEspaniaPernoctando : undefined,
      diasDietasExtranjeroSinPernoctar:
        typeof diasDietasExtranjeroSinPernoctar === 'number'
          ? diasDietasExtranjeroSinPernoctar
          : undefined,
      diasDietasExtranjeroPernoctando:
        typeof diasDietasExtranjeroPernoctando === 'number'
          ? diasDietasExtranjeroPernoctando
          : undefined,
      otrosGastosAcreditados:
        typeof otrosGastosAcreditados === 'number' ? otrosGastosAcreditados : undefined,
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
