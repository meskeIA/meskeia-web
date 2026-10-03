/**
 * Motor de cálculo del estimador de costes de divorcio.
 *
 * Vive aparte de la vista para que la página, las FAQ visibles y el FAQPage de `metadata.ts`
 * saquen sus cifras de UN solo sitio: hasta el 03/10/2026 las FAQ daban duraciones y precios
 * que el cálculo no producía (hallazgo 2799 del Inspector).
 *
 * Qué es normativo y qué no
 * ─────────────────────────
 *   · PROCURADOR — arancel de MÁXIMOS del RD 434/2024, art. 22 (procesos matrimoniales), con
 *     la escala del art. 2 y el art. 6.1. Se importa de `@/data/fiscal`. Antes eran 250, 500 y
 *     800 € escritos a mano, por encima del máximo legal (hallazgos 2792 y 2793).
 *   · NOTARIO — arancel del RD 1426/1989 (escala del nº 2 en `data/itp-ccaa.ts`). Antes, un fijo
 *     de 150/250 € (hallazgo 2795).
 *   · REGISTRO CIVIL — sin coste: lo inscribe de oficio la Oficina General con la comunicación
 *     del notario o del juzgado (Ley 20/2011, art. 61). Había una partida de 50 € (hallazgo 2794).
 *   · TASAS JUDICIALES — personas físicas exentas (Ley 10/2012, art. 4.2.a).
 *   · ABOGADO — NO es normativo: los honorarios son libres desde la Ley 25/2009, que prohibió a
 *     los Colegios publicar baremos. La horquilla de abajo es un SUPUESTO de esta herramienta, sin
 *     muestra publicada detrás, y la página lo dice junto a la cifra y deja poner el presupuesto
 *     real (hallazgo 2796).
 *
 * El arancel notarial sin cuantía y los umbrales de justicia gratuita viven en
 * `data/fiscal/costas-judiciales.ts` (mudados allí el mismo 03/10/2026).
 */

import {
  ARANCEL_PROCURA,
  ARANCEL_PROCURA_ESCALA,
  ARANCEL_PROCURA_FAMILIA,
  ARANCEL_NOTARIAL_DIVORCIO,
  IPREM_2026,
  PORCENTAJES_IVA,
  UMBRALES_JUSTICIA_GRATUITA,
} from '@/data/fiscal';
import { ARANCELES_NOTARIO, LIMITE_ARANCEL_NOTARIAL } from '@/data/itp-ccaa';
import { formatCurrency, formatPercentage } from '@/lib';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TipoDivorcio = 'mutuo_acuerdo_judicial' | 'mutuo_acuerdo_notarial' | 'contencioso';
export type ComplejidadBienes = 'sin_bienes' | 'bienes_simples' | 'bienes_complejos';

export interface Entrada {
  tipo: TipoDivorcio;
  /** Hijos menores no emancipados, o mayores con medidas judiciales de apoyo atribuidas a los progenitores. */
  hijos: boolean;
  complejidad: ComplejidadBienes;
  /** Activo de los bienes comunes que se liquidan (sin restar deudas). 0 sin bienes. */
  valorBienes: number;
  /** Pensiones que se fijan (alimentos + compensatoria), en € al mes. 0 si no hay. */
  pensionMensual: number;
  /** Presupuesto del abogado, si el usuario ya lo tiene. Sustituye a la horquilla. */
  presupuestoAbogado: number | null;
}

export interface Concepto {
  texto: string;
  /** Sin IVA. */
  importe: number;
}

export interface PartidaArancel {
  conceptos: Concepto[];
  /** Art. 6.1 RD 434/2024: un procurador para los dos cónyuges. */
  recargo: { texto: string; factor: number } | null;
  baseSinIva: number;
  iva: number;
  /** Con IVA, redondeado al céntimo: es lo que entra en el total. */
  total: number;
}

export interface Resultado {
  tipo: TipoDivorcio;
  /** En el contencioso cada cónyuge paga lo suyo: los importes son por cónyuge. */
  porConyuge: boolean;
  abogado: { min: number; max: number; esPresupuesto: boolean };
  procurador: PartidaArancel | null;
  notario: PartidaArancel | null;
  total: { min: number; max: number };
  duracionMeses: { min: number; max: number };
  notas: string[];
}

// ─── Supuestos que NO son normativos ──────────────────────────────────────────

/**
 * Horquilla de honorarios de abogado que usa esta herramienta cuando no hay presupuesto. NO es
 * una tarifa (no existe: Ley 25/2009) ni sale de una muestra publicada: es el supuesto de la
 * herramienta desde su creación, y la página lo presenta así. En el contencioso, por cónyuge.
 */
export const HONORARIOS_ABOGADO_SUPUESTOS: Record<
  TipoDivorcio,
  Record<ComplejidadBienes, { sinHijos: { min: number; max: number }; conHijos: { min: number; max: number } }>
> = {
  mutuo_acuerdo_notarial: {
    // Sin hijos por definición (CC arts. 82.2 y 87): las dos columnas son iguales.
    sin_bienes: { sinHijos: { min: 500, max: 1000 }, conHijos: { min: 500, max: 1000 } },
    bienes_simples: { sinHijos: { min: 700, max: 1500 }, conHijos: { min: 700, max: 1500 } },
    bienes_complejos: { sinHijos: { min: 1000, max: 2500 }, conHijos: { min: 1000, max: 2500 } },
  },
  mutuo_acuerdo_judicial: {
    sin_bienes: { sinHijos: { min: 500, max: 1200 }, conHijos: { min: 700, max: 1500 } },
    bienes_simples: { sinHijos: { min: 800, max: 1800 }, conHijos: { min: 1000, max: 2000 } },
    bienes_complejos: { sinHijos: { min: 1200, max: 3000 }, conHijos: { min: 1500, max: 3500 } },
  },
  contencioso: {
    sin_bienes: { sinHijos: { min: 1500, max: 4000 }, conHijos: { min: 2000, max: 5000 } },
    bienes_simples: { sinHijos: { min: 2500, max: 6000 }, conHijos: { min: 3000, max: 7000 } },
    bienes_complejos: { sinHijos: { min: 3500, max: 10000 }, conHijos: { min: 4000, max: 12000 } },
  },
};

/** Duraciones orientativas (meses), las mismas en el resultado, la comparativa y las FAQ. */
export const DURACIONES: {
  notarial: { min: number; max: number };
  mutuoAcuerdoJudicial: { min: number; max: number };
  contenciosoSinHijos: { min: number; max: number };
  contenciosoConHijos: { min: number; max: number };
} = {
  notarial: { min: 1, max: 2 },
  mutuoAcuerdoJudicial: { min: 2, max: 4 },
  contenciosoSinHijos: { min: 4, max: 12 },
  contenciosoConHijos: { min: 6, max: 18 },
};

// ─── Aranceles ────────────────────────────────────────────────────────────────

const IVA = PORCENTAJES_IVA.general / 100;
const centimos = (x: number): number => Math.round(x * 100) / 100;
const pct = (fraccion: number): string => formatPercentage(fraccion, 0);

/** Escala del art. 2 RD 434/2024 (escalón plano; art. 2.2 por encima de 600.000 €; tope del art. 1.4). */
export function escalaProcura(cuantia: number): number {
  const escalon = ARANCEL_PROCURA_ESCALA.find((t) => cuantia <= t.hasta);
  if (escalon) return escalon.maximo;
  const tope = ARANCEL_PROCURA_ESCALA[ARANCEL_PROCURA_ESCALA.length - 1].maximo;
  const fracciones = Math.ceil((cuantia - ARANCEL_PROCURA.excesoSobre) / ARANCEL_PROCURA.fraccionExceso);
  return Math.min(tope + fracciones * ARANCEL_PROCURA.maximoPorFraccion, ARANCEL_PROCURA.topeGlobalPorAsunto);
}

/** Escala del nº 2.1 RD 1426/1989 sobre un valor, con la rebaja del 5 %, sin IVA. */
export function escalaNotarial(valor: number): number {
  const reglado = Math.min(valor, LIMITE_ARANCEL_NOTARIAL);
  let total = 0;
  let limiteAnterior = 0;
  for (const tramo of ARANCELES_NOTARIO) {
    if (reglado <= limiteAnterior) break;
    if (limiteAnterior === 0) total = tramo.base;
    else total += (Math.min(reglado, tramo.hasta) - limiteAnterior) * (tramo.exceso / 100);
    limiteAnterior = tramo.hasta;
  }
  return total * (1 - ARANCEL_NOTARIAL_DIVORCIO.rebajaEscala);
}

function cerrarPartida(conceptos: Concepto[], recargo: PartidaArancel['recargo']): PartidaArancel {
  const suma = conceptos.reduce((s, c) => s + c.importe, 0);
  const baseSinIva = suma * (recargo ? recargo.factor : 1);
  const iva = baseSinIva * IVA;
  return { conceptos, recargo, baseSinIva, iva, total: centimos(baseSinIva + iva) };
}

const conBienes = (e: Entrada): boolean => e.complejidad !== 'sin_bienes' && e.valorBienes > 0;

/** Derechos máximos del procurador (RD 434/2024, art. 22). En el contencioso, los de UN cónyuge. */
export function procuradorMaximo(e: Entrada): PartidaArancel | null {
  if (e.tipo === 'mutuo_acuerdo_notarial') return null; // CC art. 82.1: basta letrado
  const anualidad = e.pensionMensual * 12;
  const conceptos: Concepto[] = [];

  if (e.tipo === 'mutuo_acuerdo_judicial') {
    conceptos.push({ texto: 'Divorcio de mutuo acuerdo (art. 22.1.a)', importe: ARANCEL_PROCURA_FAMILIA.mutuoAcuerdo });
    if (anualidad > 0) {
      conceptos.push({ texto: 'Pensiones: escala del art. 2 sobre una anualidad (art. 22.1.b)', importe: escalaProcura(anualidad) });
    }
    if (conBienes(e)) {
      conceptos.push({
        texto: `Liquidación de los bienes: ${pct(ARANCEL_PROCURA_FAMILIA.liquidacionMutuoAcuerdo)} de la escala del art. 2 sobre el activo (art. 22.1.c)`,
        importe: ARANCEL_PROCURA_FAMILIA.liquidacionMutuoAcuerdo * escalaProcura(e.valorBienes),
      });
    }
    // Art. 6.1: una sola cuenta + 10 % por cada uno de los dos representados.
    const factor = 1 + 2 * ARANCEL_PROCURA_FAMILIA.recargoPorRepresentado;
    return cerrarPartida(conceptos, { texto: `Un procurador para los dos: +${pct(ARANCEL_PROCURA_FAMILIA.recargoPorRepresentado)} por cónyuge (art. 6.1)`, factor });
  }

  conceptos.push({ texto: 'Divorcio contencioso (art. 22.3.a)', importe: ARANCEL_PROCURA_FAMILIA.contencioso });
  conceptos.push({ texto: 'Medidas provisionales (art. 22.2)', importe: ARANCEL_PROCURA_FAMILIA.medidasProvisionales });
  if (anualidad > 0) {
    conceptos.push({ texto: 'Pensiones: escala del art. 2 sobre una anualidad (art. 22.3.b)', importe: escalaProcura(anualidad) });
  }
  if (conBienes(e)) {
    const escala = escalaProcura(e.valorBienes);
    conceptos.push({
      texto: `Disolución de los gananciales: ${pct(ARANCEL_PROCURA_FAMILIA.disolucionGananciales)} de la escala del art. 2 sobre el activo (art. 22.3.c)`,
      importe: ARANCEL_PROCURA_FAMILIA.disolucionGananciales * escala,
    });
    conceptos.push({
      texto: `Liquidación judicial: ${pct(ARANCEL_PROCURA_FAMILIA.liquidacionContencioso)} de la escala del art. 2 sobre el activo (art. 22.3.d)`,
      importe: ARANCEL_PROCURA_FAMILIA.liquidacionContencioso * escala,
    });
  }
  return cerrarPartida(conceptos, null);
}

/** Arancel del notario por la escritura de divorcio (RD 1426/1989), entre los dos cónyuges. */
export function notarioArancel(e: Entrada): PartidaArancel | null {
  if (e.tipo !== 'mutuo_acuerdo_notarial') return null;
  const conceptos: Concepto[] = [
    { texto: 'Escritura de divorcio, documento sin cuantía (nº 1.1.h)', importe: ARANCEL_NOTARIAL_DIVORCIO.documentoSinCuantia },
  ];
  if (conBienes(e)) {
    // Norma general 4.ª.3: la escala se aplica a CADA cónyuge por lo que se le adjudica.
    const porConyuge = escalaNotarial(e.valorBienes / 2);
    const rebaja = pct(ARANCEL_NOTARIAL_DIVORCIO.rebajaEscala);
    for (const n of [1, 2]) {
      conceptos.push({
        texto: `Liquidación de gananciales, cónyuge ${n}: escala del nº 2 sobre la mitad (${formatCurrency(e.valorBienes / 2)}), con la rebaja del ${rebaja}`,
        importe: porConyuge,
      });
    }
  }
  return cerrarPartida(conceptos, null);
}

export function duracion(tipo: TipoDivorcio, hijos: boolean): { min: number; max: number } {
  if (tipo === 'mutuo_acuerdo_notarial') return DURACIONES.notarial;
  if (tipo === 'mutuo_acuerdo_judicial') return DURACIONES.mutuoAcuerdoJudicial;
  return hijos ? DURACIONES.contenciosoConHijos : DURACIONES.contenciosoSinHijos;
}

/** El notarial no cabe con hijos menores no emancipados o con medidas de apoyo (CC arts. 82.2 y 87). */
export const tipoPosible = (tipo: TipoDivorcio, hijos: boolean): boolean => !(tipo === 'mutuo_acuerdo_notarial' && hijos);

// ─── Cálculo completo ─────────────────────────────────────────────────────────

export function calcular(e: Entrada): Resultado {
  const hijos = e.tipo === 'mutuo_acuerdo_notarial' ? false : e.hijos;
  const supuesto = HONORARIOS_ABOGADO_SUPUESTOS[e.tipo][e.complejidad][hijos ? 'conHijos' : 'sinHijos'];
  const abogado =
    e.presupuestoAbogado !== null
      ? { min: e.presupuestoAbogado, max: e.presupuestoAbogado, esPresupuesto: true }
      : { ...supuesto, esPresupuesto: false };
  const procurador = procuradorMaximo({ ...e, hijos });
  const notario = notarioArancel({ ...e, hijos });
  const fijo = (procurador?.total ?? 0) + (notario?.total ?? 0);
  const notas: string[] = [];

  if (e.tipo === 'mutuo_acuerdo_notarial') {
    notas.push('Solo cabe sin hijos menores no emancipados ni hijos mayores con medidas judiciales de apoyo atribuidas a los progenitores (Código Civil, arts. 82.2 y 87, tras la Ley 8/2021). Un hijo mayor con discapacidad sin esas medidas no lo impide');
    notas.push('Si hay hijos mayores o menores emancipados sin ingresos propios que viven en el domicilio familiar, deben dar su consentimiento ante el notario a las medidas que les afecten (art. 82.1)');
    notas.push('Un solo abogado para ambos cónyuges (coste compartido)');
    notas.push('El arancel notarial no incluye los folios de la matriz desde el quinto ni las copias (nº 4 y 7), que dependen de la extensión de la escritura');
    notas.push('La escritura notarial tiene la misma validez que una sentencia judicial');
  } else if (e.tipo === 'mutuo_acuerdo_judicial') {
    notas.push('Un solo abogado y procurador para ambos (coste compartido)');
    if (hijos) {
      notas.push('Se necesita convenio regulador con medidas sobre custodia, alimentos y uso de vivienda');
      notas.push('El Ministerio Fiscal revisará el convenio por haber hijos menores o con medidas de apoyo');
    }
  } else {
    notas.push('Cada cónyuge necesita su propio abogado y procurador');
    notas.push('Los importes mostrados son por cónyuge — el coste total familiar sería el doble');
    notas.push(`El procurador incluye las medidas provisionales (art. 22.2), que suelen pedirse con la demanda; sin ellas, el máximo baja ${formatCurrency(ARANCEL_PROCURA_FAMILIA.medidasProvisionales)} más IVA`);
    if (hijos) notas.push('Posibles informes periciales psicosociales si hay disputa sobre custodia');
  }
  if (e.tipo !== 'mutuo_acuerdo_notarial' && e.pensionMensual <= 0) {
    notas.push('Si se fijan pensión de alimentos o compensatoria, el procurador suma la escala del art. 2 del arancel sobre una anualidad: indícala para incluirla');
  }
  if (conBienes(e)) notas.push('Se supone régimen de gananciales y un reparto a partes iguales');
  notas.push('En Canarias, Ceuta y Melilla no se aplica el IVA sino el IGIC o el IPSI, que esta herramienta no calcula: ahí los importes con IVA no son los tuyos');
  notas.push('La inscripción en el Registro Civil no tiene coste: la comunica de oficio el notario o el juzgado (Ley 20/2011, art. 61)');
  notas.push('Las personas físicas están exentas de tasas judiciales desde 2015');

  return {
    tipo: e.tipo,
    porConyuge: e.tipo === 'contencioso',
    abogado,
    procurador,
    notario,
    total: { min: centimos(abogado.min + fijo), max: centimos(abogado.max + fijo) },
    duracionMeses: duracion(e.tipo, hijos),
    notas,
  };
}

/** Los umbrales de justicia gratuita en euros (IPREM anual en 12 y en 14 pagas). */
export function umbralesJusticiaGratuita(): { multiplo: number; anual12: number; anual14: number }[] {
  return [
    UMBRALES_JUSTICIA_GRATUITA.sinUnidadFamiliar,
    UMBRALES_JUSTICIA_GRATUITA.unidadMenosDeCuatro,
    UMBRALES_JUSTICIA_GRATUITA.unidadCuatroOMas,
  ].map((multiplo) => ({ multiplo, anual12: multiplo * IPREM_2026.anual12, anual14: multiplo * IPREM_2026.anual14 }));
}
