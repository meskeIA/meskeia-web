/**
 * Calculadora de Herencia Conjunta — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_herencia_conjunta)
 *
 * Divide una masa hereditaria entre varios herederos y calcula
 * el Impuesto de Sucesiones de cada uno.
 *
 * Soporta: igualdad entre descendientes (intestada) y distribución personalizada.
 * Para el cálculo del impuesto usa la misma lógica que calcular_sucesiones.
 *
 * Fuente: Ley 29/1987 del ISD + normativa autonómica
 */

import { calcularSucesion } from '@/lib/calculadoras/sucesiones';
import type { GrupoParentescoIS, NivelDiscapacidadIS, IndicePatrimonioIS } from '@/lib/calculadoras/sucesiones';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type CcaaIS =
  | 'madrid' | 'andalucia' | 'galicia' | 'murcia' | 'valencia' | 'extremadura'
  | 'canarias' | 'castilla-leon' | 'rioja' | 'castilla-mancha' | 'cantabria'
  | 'aragon' | 'baleares' | 'asturias' | 'cataluna' | 'pais-vasco' | 'navarra';

export interface HerederoInput {
  /** Nombre o referencia del heredero (ej: "Hijo 1") */
  nombre: string;
  /** Grupo de parentesco */
  grupo: GrupoParentescoIS;
  /** CCAA del causante (determina el impuesto) */
  ccaa: CcaaIS;
  /** Porcentaje de la masa hereditaria que recibe (0-100). Si no se indica, se reparte igual. */
  porcentaje?: number;
  /** Edad del heredero (relevante para grupo I descendientes < 21 años) */
  edadHeredero?: number;
  /** Nivel de discapacidad */
  discapacidad?: NivelDiscapacidadIS;
  /** Índice de patrimonio preexistente (1-4) */
  patrimonioIdx?: IndicePatrimonioIS;
  /** Valor de la vivienda habitual incluida en su parte (€) para reducción 95% */
  viviendaHabitual?: number;
}

export interface ResultadoHeredero {
  nombre: string;
  grupo: GrupoParentescoIS;
  ccaa: CcaaIS;
  porcentaje: number;
  /** Valor bruto de la herencia recibida (€) */
  cuotaHereditaria: number;
  /** Reducción aplicada (parentesco, discapacidad, etc.) */
  reduccion: number;
  /** Base imponible tras reducciones */
  baseImponible: number;
  /** Impuesto de Sucesiones a pagar (€) */
  impuesto: number;
  /** Tipo efectivo del impuesto (%) */
  tipoEfectivo: number;
  /** Neto recibido tras impuestos */
  netoRecibido: number;
}

export interface ResultadoHerenciaConjunta {
  /** Masa hereditaria total (activo - pasivo) */
  masaHereditaria: number;
  /** Número de herederos */
  numHerederos: number;
  /** Resultados por heredero */
  herederos: ResultadoHeredero[];
  /** Total impuesto de sucesiones pagado por todos */
  totalImpuesto: number;
  /** Total neto distribuido entre todos los herederos */
  totalNetoDistribuido: number;
  /** % de la masa que se va en impuestos */
  cargaFiscalTotal: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularHerenciaConjunta(
  masaHereditaria: number,
  herederos: HerederoInput[]
): ResultadoHerenciaConjunta {
  if (masaHereditaria <= 0) throw new Error('La masa hereditaria debe ser mayor que cero.');
  if (herederos.length === 0) throw new Error('Debe haber al menos un heredero.');
  if (herederos.length > 20) throw new Error('Máximo 20 herederos por cálculo.');

  const r = (n: number) => Math.round(n * 100) / 100;

  // Calcular porcentajes (si no se especifican, reparto igualitario)
  const todosConPorcentaje = herederos.every(h => h.porcentaje !== undefined);
  let porcentajes: number[];

  if (todosConPorcentaje) {
    const suma = herederos.reduce((s, h) => s + (h.porcentaje ?? 0), 0);
    if (Math.abs(suma - 100) > 0.1) {
      throw new Error(`Los porcentajes suman ${suma.toFixed(1)}%, deben sumar 100%.`);
    }
    porcentajes = herederos.map(h => h.porcentaje ?? 0);
  } else {
    // Reparto igualitario
    const pct = 100 / herederos.length;
    porcentajes = herederos.map(() => pct);
  }

  // Calcular impuesto de cada heredero
  const resultadosHerederos: ResultadoHeredero[] = herederos.map((h, i) => {
    const cuotaHereditaria = r(masaHereditaria * (porcentajes[i] / 100));

    let resultado;
    try {
      resultado = calcularSucesion({
        baseImponible: cuotaHereditaria,
        ccaa: h.ccaa,
        grupo: h.grupo,
        edadHeredero: h.edadHeredero,
        discapacidad: h.discapacidad,
        patrimonioIdx: h.patrimonioIdx,
        viviendaHabitual: h.viviendaHabitual,
      });
    } catch {
      resultado = null;
    }

    const cuotaFinal = resultado ? resultado.cuotaFinal : 0;
    const totalReducciones = resultado ? resultado.totalReducciones : 0;
    const baseLiquidable = resultado ? resultado.baseLiquidable : cuotaHereditaria;

    const impuesto = r(cuotaFinal);
    const tipoEfectivo = cuotaHereditaria > 0 ? r((impuesto / cuotaHereditaria) * 100) : 0;
    const netoRecibido = r(cuotaHereditaria - impuesto);

    return {
      nombre: h.nombre,
      grupo: h.grupo,
      ccaa: h.ccaa,
      porcentaje: r(porcentajes[i]),
      cuotaHereditaria,
      reduccion: r(totalReducciones),
      baseImponible: r(baseLiquidable),
      impuesto,
      tipoEfectivo,
      netoRecibido,
    };
  });

  const totalImpuesto = r(resultadosHerederos.reduce((s, h) => s + h.impuesto, 0));
  const totalNetoDistribuido = r(resultadosHerederos.reduce((s, h) => s + h.netoRecibido, 0));
  const cargaFiscalTotal = masaHereditaria > 0 ? r((totalImpuesto / masaHereditaria) * 100) : 0;

  return {
    masaHereditaria: r(masaHereditaria),
    numHerederos: herederos.length,
    herederos: resultadosHerederos,
    totalImpuesto,
    totalNetoDistribuido,
    cargaFiscalTotal,
    fuenteDatos: 'Ley 29/1987 del Impuesto sobre Sucesiones y Donaciones + normativa autonómica',
  };
}
