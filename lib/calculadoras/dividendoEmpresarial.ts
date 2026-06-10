/**
 * Calculadora de Retribución en SL: Salario vs Dividendo — lógica pura
 * Usada por: MCP server (calcular_dividendo_empresarial)
 *
 * Compara las tres vías de retribución del socio-administrador de una SL:
 * A) Salario: deducible en IS, tributa como rendimiento del trabajo en IRPF
 * B) Dividendo: NO deducible en IS, tributa como renta del ahorro en IRPF (19-28%)
 * C) Combinación óptima: maximiza el neto final del socio
 *
 * La clave: el dividendo tributa a tipos del ahorro (más bajos), pero la empresa
 * paga IS sobre el beneficio antes de distribuirlo. El salario reduce el IS
 * pero tributa a tipos de la tarifa general (más altos).
 *
 * Fuente: LIRPF + LIS + LGSS — verificado 2025
 *
 * Encadenable con: comparar_autonomo_vs_sl, calcular_irpf, calcular_cuota_autonomo
 */

import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
} from '@/data/fiscal';
import {
  TIPOS_IS_2025,
  RETENCIONES_IS_2025,
  AUTONOMO_SOCIETARIO_2025,
  FISCAL_SOCIEDADES_META,
  calcularCuotaISMicropyme,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoIS_Dividendo = 'general' | 'micropyme' | 'nueva_creacion';

export interface ParametrosDividendoEmpresarial {
  /** Beneficio antes de impuestos de la SL (€/año) */
  beneficioAntesIS: number;
  /** Salario bruto anual que se plantea pagar al socio-administrador (€). Por defecto 0. */
  salarioBrutoSocio?: number;
  /** Tipo del IS aplicable. Por defecto 'general' (25%). */
  tipoIS?: TipoIS_Dividendo;
  /** Porcentaje de participación del socio en la SL (%). Por defecto 100. */
  participacionPct?: number;
  /** ¿El socio-administrador tiene control (≥25%)? Determina si cotiza como autónomo societario. Por defecto true. */
  tieneControl?: boolean;
  /** Otros rendimientos del trabajo del socio fuera de la SL (€). Por defecto 0. */
  otrosRendimientosTrabajo?: number;
  /** Número de hijos menores de 25 años a cargo (para mínimo familiar IRPF). Por defecto 0. */
  numHijos?: number;
}

export interface EscenarioRetribucion {
  /** Nombre del escenario */
  nombre: string;
  /** Salario bruto pagado por la SL (€) */
  salarioBruto: number;
  /** Cuota SS autónomo societario (€/año) */
  cuotaSSAutonomo: number;
  /** IS pagado por la SL sobre el beneficio restante (€) */
  isPagado: number;
  /** Beneficio neto SL tras IS (€) */
  beneficioNetoSL: number;
  /** Dividendo bruto recibido por el socio (€) */
  dividendoBruto: number;
  /** Retención sobre dividendos (19%) (€) */
  retencionDividendo: number;
  /** IRPF del socio por rendimientos del trabajo/salario (€) */
  irpfSalario: number;
  /** IRPF del socio por dividendos (tarifa ahorro) (€) */
  irpfDividendo: number;
  /** IRPF total del socio (€) */
  irpfTotal: number;
  /** Neto disponible para el socio (salario neto + dividendo neto) (€) */
  netoDisponibleSocio: number;
  /** Tipo efectivo total sobre el beneficio bruto (%) */
  tipoEfectivoTotal: number;
}

export interface ResultadoDividendoEmpresarial {
  /** Beneficio antes de IS (€) */
  beneficioAntesIS: number;
  /** Tipo IS aplicado (%) */
  tipoISAplicado: number;
  /** Escenario A: solo dividendo (salario 0) */
  escenarioSoloDividendo: EscenarioRetribucion;
  /** Escenario B: solo salario (sin dividendo) */
  escenarioSoloSalario: EscenarioRetribucion;
  /** Escenario C: con el salario indicado + dividendo del resto */
  escenarioCombinado: EscenarioRetribucion;
  /** Escenario más eficiente (mayor neto para el socio) */
  escenarioOptimo: string;
  /** Ventaja del óptimo sobre el peor (€) */
  ventajaOptimo: number;
  /** Advertencia legal */
  advertencia: string;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cuotaIRPFGeneral(rendimientoNeto: number, hijos: number): number {
  if (rendimientoNeto <= 0) return 0;

  // Reducción rendimientos del trabajo (simplificada)
  let reduccion = 0;
  if (rendimientoNeto <= 14047.5) reduccion = 7302;
  else if (rendimientoNeto <= 19747.5) reduccion = 7302 - 1.75 * (rendimientoNeto - 14047.5);
  else reduccion = 2364;

  const baseLiquidable = Math.max(0, rendimientoNeto - reduccion);

  // Mínimo personal y familiar
  let minimoPersonal = MINIMOS_IRPF_2025.personal;
  if (hijos >= 1) minimoPersonal += MINIMOS_IRPF_2025.hijo_1;
  if (hijos >= 2) minimoPersonal += MINIMOS_IRPF_2025.hijo_2;
  if (hijos >= 3) minimoPersonal += MINIMOS_IRPF_2025.hijo_3;

  const cuotaBase = aplicarTarifaGeneral(baseLiquidable);
  const cuotaMinimo = aplicarTarifaGeneral(Math.min(minimoPersonal, baseLiquidable));
  return Math.max(0, cuotaBase - cuotaMinimo);
}

function aplicarTarifaGeneral(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= anterior) break;
    const baseTramo = Math.min(base, tramo.hasta) - anterior;
    cuota += baseTramo * (tramo.tipo / 100);
    anterior = tramo.hasta;
  }
  return cuota;
}

const TRAMOS_AHORRO = [
  { hasta: 6000,     tipo: 19 },
  { hasta: 50000,    tipo: 21 },
  { hasta: 200000,   tipo: 23 },
  { hasta: 300000,   tipo: 27 },
  { hasta: Infinity, tipo: 28 },
];

function cuotaIRPFAhorro(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_AHORRO) {
    if (base <= anterior) break;
    const baseTramo = Math.min(base, tramo.hasta) - anterior;
    cuota += baseTramo * (tramo.tipo / 100);
    anterior = tramo.hasta;
  }
  return cuota;
}

// Cuota de IS según el tipo de SL: las micropymes tributan por la escala
// progresiva de la Ley 7/2024 (19%/21% en 2026), no por un tipo plano.
function calcularCuotaIS(baseImponible: number, tipoIS: TipoIS_Dividendo): number {
  if (tipoIS === 'micropyme') return calcularCuotaISMicropyme(baseImponible);
  if (tipoIS === 'nueva_creacion') return baseImponible * (TIPOS_IS_2025.nuevaCreacion / 100);
  return baseImponible * (TIPOS_IS_2025.general / 100);
}

function calcularEscenario(
  nombre: string,
  beneficioAntesIS: number,
  salarioBruto: number,
  tipoIS: TipoIS_Dividendo,
  participacionPct: number,
  tieneControl: boolean,
  otrosRendimientos: number,
  hijos: number,
): EscenarioRetribucion {
  const r = (n: number) => Math.round(n * 100) / 100;

  // Cuota SS autónomo societario (si tiene control, base mínima obligatoria)
  const cuotaSSAutonomo = tieneControl && salarioBruto > 0
    ? r(AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual * 12)
    : 0;

  // Base IS = beneficio - salario (el salario es gasto deducible)
  const baseIS = Math.max(0, beneficioAntesIS - salarioBruto);
  const isPagado = r(calcularCuotaIS(baseIS, tipoIS));
  const beneficioNetoSL = r(baseIS - isPagado);

  // Dividendo proporcional a la participación
  const dividendoBruto = r(beneficioNetoSL * participacionPct / 100);
  const retencionDividendo = r(dividendoBruto * RETENCIONES_IS_2025.dividendos / 100);

  // IRPF del socio: rendimientos del trabajo = salario bruto + otros
  const totalRendimientosTrabajo = salarioBruto + otrosRendimientos - cuotaSSAutonomo;
  const irpfSalario = r(cuotaIRPFGeneral(totalRendimientosTrabajo, hijos));

  // IRPF dividendo (tarifa del ahorro)
  const irpfDividendo = r(cuotaIRPFAhorro(dividendoBruto));

  const irpfTotal = r(irpfSalario + irpfDividendo);
  const netoSalario = r(salarioBruto - irpfSalario - cuotaSSAutonomo);
  const netoDividendo = r(dividendoBruto - irpfDividendo);
  const netoDisponibleSocio = r(netoSalario + netoDividendo);
  const tipoEfectivoTotal = r((isPagado + irpfTotal + cuotaSSAutonomo) / beneficioAntesIS * 100);

  return {
    nombre,
    salarioBruto: r(salarioBruto),
    cuotaSSAutonomo,
    isPagado,
    beneficioNetoSL,
    dividendoBruto,
    retencionDividendo,
    irpfSalario,
    irpfDividendo,
    irpfTotal,
    netoDisponibleSocio,
    tipoEfectivoTotal,
  };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularDividendoEmpresarial(p: ParametrosDividendoEmpresarial): ResultadoDividendoEmpresarial {
  if (p.beneficioAntesIS <= 0) throw new Error('El beneficio antes de IS debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const salarioBruto = p.salarioBrutoSocio ?? 0;
  const tipoISKey = p.tipoIS ?? 'general';
  const participacion = p.participacionPct ?? 100;
  const tieneControl = p.tieneControl ?? true;
  const otrosRendimientos = p.otrosRendimientosTrabajo ?? 0;
  const hijos = p.numHijos ?? 0;

  if (salarioBruto > p.beneficioAntesIS) throw new Error('El salario no puede superar el beneficio antes de IS.');
  if (participacion <= 0 || participacion > 100) throw new Error('La participación debe estar entre 1% y 100%.');

  const escenarioSoloDividendo = calcularEscenario('Solo dividendo (salario 0)', p.beneficioAntesIS, 0, tipoISKey, participacion, tieneControl, otrosRendimientos, hijos);
  const escenarioSoloSalario   = calcularEscenario('Solo salario', p.beneficioAntesIS, p.beneficioAntesIS, tipoISKey, participacion, tieneControl, otrosRendimientos, hijos);
  const escenarioCombinado     = calcularEscenario(`Combinado (salario ${salarioBruto.toLocaleString('es-ES')} €)`, p.beneficioAntesIS, salarioBruto, tipoISKey, participacion, tieneControl, otrosRendimientos, hijos);

  const escenarios = [escenarioSoloDividendo, escenarioSoloSalario, escenarioCombinado];
  const maxNeto = Math.max(...escenarios.map(e => e.netoDisponibleSocio));
  const minNeto = Math.min(...escenarios.map(e => e.netoDisponibleSocio));
  const optimo = escenarios.find(e => e.netoDisponibleSocio === maxNeto)!;

  // Tipo efectivo de IS (informativo) sobre el beneficio total, tomando como
  // referencia el escenario sin salario (base IS = beneficio antes de IS).
  // Para 'micropyme' es el tipo medio resultante de la escala progresiva.
  const tipoISAplicado = p.beneficioAntesIS > 0
    ? r((escenarioSoloDividendo.isPagado / p.beneficioAntesIS) * 100)
    : 0;

  return {
    beneficioAntesIS: p.beneficioAntesIS,
    tipoISAplicado,
    escenarioSoloDividendo,
    escenarioSoloSalario,
    escenarioCombinado,
    escenarioOptimo: optimo.nombre,
    ventajaOptimo: Math.round((maxNeto - minNeto) * 100) / 100,
    advertencia: 'El salario del administrador debe estar establecido en los estatutos sociales para ser gasto deducible en IS. La vía más eficiente depende del nivel de ingresos totales del socio y puede cambiar cada año. Consultar con asesor fiscal.',
    fuenteDatos: `${FISCAL_SOCIEDADES_META.fuente} + LIRPF art. 25 (dividendos) — verificado ${FISCAL_SOCIEDADES_META.verificado}`,
  };
}
