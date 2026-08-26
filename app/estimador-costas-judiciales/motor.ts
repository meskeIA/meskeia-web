/**
 * Motor de cálculo del estimador de costas judiciales.
 *
 * Vive aparte de la vista para poder comprobarse con casos resueltos a mano sin abrir el
 * navegador: `tests/costas-judiciales-motor.spec.ts`. La app de riesgo 1 no puede fiar la
 * corrección de sus cifras a que la página cargue.
 *
 * Lo normativo (arancel de la Procura, tasas, umbrales de la LEC, tipo de IVA) se importa
 * de `@/data/fiscal`. Lo que NO es normativo —los honorarios de abogado y el coste de un
 * perito— se declara aquí, porque no puede estar en un repositorio de datos normativos sin
 * mentir sobre su naturaleza: los honorarios de abogado son libres desde la Ley 25/2009 y
 * ninguna norma fija su importe.
 */

import { formatCurrency } from '@/lib';
import {
  ARANCEL_PROCURA,
  ARANCEL_PROCURA_ESCALA,
  PORCENTAJES_IVA,
  TASAS_JUDICIALES,
  TASAS_JUDICIALES_CUOTA_FIJA,
  UMBRALES_LEC,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TipoProcedimiento = 'ordinario' | 'verbal' | 'monitorio' | 'cambiario' | 'laboral' | 'contencioso';
export type TipoPersona = 'fisica' | 'juridica';

export interface Horquilla {
  min: number;
  max: number;
}

export interface DatosEstimacion {
  /** Cuantía del pleito en euros, o null si es indeterminada (art. 3 arancel, art. 394.3 LEC). */
  cuantia: number | null;
  tipo: TipoProcedimiento;
  persona: TipoPersona;
  incluirPerito: boolean;
}

export interface Resultado {
  /** Cuantía efectivamente usada: la tecleada, o la valoración legal si es indeterminada. */
  cuantiaAplicada: number;
  cuantiaIndeterminada: boolean;
  abogado: Horquilla;
  /** El abogado no es preceptivo: el mínimo de la horquilla puede ser 0 €. */
  abogadoOpcional: boolean;
  procurador: number;
  procuradorOpcional: boolean;
  tasas: number;
  perito: number;
  /** IVA al tipo general sobre abogado + procurador + perito. Las tasas no lo llevan. */
  iva: Horquilla;
  baseImponible: Horquilla;
  total: Horquilla;
  /** Tope del art. 394.3 LEC a lo que el condenado en costas paga de la contraria. */
  limiteCostas: number;
  /** El máximo estimado de abogado supera el tope del tercio. */
  limiteCostasMuerde: boolean;
  notas: string[];
}

export interface ProcedimientoInfo {
  label: string;
  descripcion: string;
  requiereProcurador: boolean;
  requiereAbogado: boolean;
  nota?: string;
}

// ─── Catálogo de procedimientos ───────────────────────────────────────────────

export const PROCEDIMIENTOS: Record<TipoProcedimiento, ProcedimientoInfo> = {
  ordinario: {
    label: 'Juicio ordinario (> 15.000 €)',
    descripcion: 'Reclamaciones civiles superiores a 15.000 €',
    requiereProcurador: true,
    requiereAbogado: true,
  },
  verbal: {
    label: 'Juicio verbal (≤ 15.000 €)',
    descripcion: 'Reclamaciones civiles hasta 15.000 €',
    requiereProcurador: false,
    requiereAbogado: false,
    nota: 'Abogado y procurador son obligatorios si la cuantía supera 2.000 € (arts. 23.2 y 31.2 LEC)',
  },
  monitorio: {
    label: 'Proceso monitorio',
    descripcion: 'Reclamación de deudas dinerarias documentadas',
    requiereProcurador: false,
    requiereAbogado: false,
    nota: 'La petición inicial no exige abogado ni procurador. Si el deudor se opone, se transforma en verbal u ordinario según la cuantía y entonces sí pueden ser preceptivos',
  },
  cambiario: {
    label: 'Juicio cambiario',
    descripcion: 'Reclamación de cheques, letras o pagarés',
    requiereProcurador: true,
    requiereAbogado: true,
  },
  laboral: {
    label: 'Procedimiento laboral',
    descripcion: 'Despidos, reclamación de cantidades, conflictos laborales',
    requiereProcurador: false,
    requiereAbogado: false,
    nota: 'No hay tasas en instancia. Puedes comparecer por ti mismo (art. 18 LRJS); el abogado es recomendable pero no obligatorio. Sin procurador',
  },
  contencioso: {
    label: 'Contencioso-administrativo',
    descripcion: 'Recursos contra la Administración',
    requiereProcurador: true,
    requiereAbogado: true,
  },
};

// ─── Honorarios de abogado: estimación de MERCADO, no dato normativo ──────────

/**
 * Puntos de anclaje de la horquilla de honorarios, interpolados linealmente entre sí.
 *
 * Por qué interpolar y no escalonar: hasta el 26/08/2026 estas mismas cifras eran escalones
 * planos, y un euro de cuantía movía la estimación un 61 % (600.000 € daba 9.000–23.000 € y
 * 600.001 €, 14.500–39.500 €). Un escalón es correcto en un arancel porque lo manda la norma;
 * en una estimación de mercado es sencillamente falso, porque ningún abogado sube su minuta
 * un 61 % por un euro más de reclamación.
 *
 * Por encima del último ancla se extrapola con el tipo marginal del último tramo cerrado.
 * Ese criterio reproduce por sí solo los 10.000–35.000 € que la app daba como plano para
 * «más de 600.000 €»: el mínimo llega a 10.000 € hacia 1.500.000 € de cuantía y el máximo a
 * 35.000 € hacia 1.443.750 €. La curva nueva no contradice a la vieja, la hace continua.
 */
type Ancla = { cuantia: number; min: number; max: number };

const ANCLAS_CIVIL: Ancla[] = [
  { cuantia: 2000, min: 400, max: 900 },
  { cuantia: 6000, min: 600, max: 1500 },
  { cuantia: 15000, min: 1000, max: 3000 },
  { cuantia: 30000, min: 1500, max: 4500 },
  { cuantia: 60000, min: 2500, max: 7000 },
  { cuantia: 150000, min: 4000, max: 12000 },
  { cuantia: 600000, min: 6000, max: 20000 },
];

const ANCLAS_LABORAL: Ancla[] = [
  { cuantia: 6000, min: 600, max: 1500 },
  { cuantia: 30000, min: 1200, max: 3000 },
  { cuantia: 120000, min: 2000, max: 5000 },
];

const ANCLAS_MONITORIO: Ancla[] = [
  { cuantia: 2000, min: 200, max: 500 },
  { cuantia: 6000, min: 400, max: 1000 },
  { cuantia: 30000, min: 800, max: 2000 },
];

/** Interpola la horquilla dentro de la tabla de anclas y extrapola por encima de la última. */
function interpolarHonorarios(cuantia: number, anclas: Ancla[]): Horquilla {
  const primera = anclas[0];
  if (cuantia <= primera.cuantia) return { min: primera.min, max: primera.max };

  for (let i = 1; i < anclas.length; i++) {
    const previa = anclas[i - 1];
    const actual = anclas[i];
    if (cuantia <= actual.cuantia) {
      const t = (cuantia - previa.cuantia) / (actual.cuantia - previa.cuantia);
      return {
        min: previa.min + t * (actual.min - previa.min),
        max: previa.max + t * (actual.max - previa.max),
      };
    }
  }

  // Extrapolación con el tipo marginal del último tramo cerrado.
  const ultima = anclas[anclas.length - 1];
  const penultima = anclas[anclas.length - 2];
  const tramo = ultima.cuantia - penultima.cuantia;
  const marginalMin = (ultima.min - penultima.min) / tramo;
  const marginalMax = (ultima.max - penultima.max) / tramo;
  const exceso = cuantia - ultima.cuantia;
  return {
    min: ultima.min + exceso * marginalMin,
    max: ultima.max + exceso * marginalMax,
  };
}

export function estimarHonorariosAbogado(cuantia: number, tipo: TipoProcedimiento): Horquilla {
  if (tipo === 'laboral') return interpolarHonorarios(cuantia, ANCLAS_LABORAL);
  if (tipo === 'monitorio') return interpolarHonorarios(cuantia, ANCLAS_MONITORIO);
  return interpolarHonorarios(cuantia, ANCLAS_CIVIL);
}

// ─── Peritaje: estimación de mercado, tampoco normativa ──────────────────────

const ANCLAS_PERITO: Ancla[] = [
  { cuantia: 15000, min: 600, max: 600 },
  { cuantia: 60000, min: 1200, max: 1200 },
  { cuantia: 150000, min: 2500, max: 2500 },
  { cuantia: 400000, min: 4000, max: 4000 },
];

export function estimarPerito(cuantia: number): number {
  return interpolarHonorarios(cuantia, ANCLAS_PERITO).min;
}

// ─── Arancel de la Procura (RD 434/2024) ─────────────────────────────────────

/**
 * Derechos MÁXIMOS del profesional de la Procura, según el art. 2 del arancel.
 * Devuelve el importe del escalón —la escala es plana, no progresiva— más el suplemento
 * por el exceso de 600.000 € del art. 2.2, con el tope global del art. 1.4.
 */
export function arancelBaseProcura(cuantia: number): number {
  const escalon = ARANCEL_PROCURA_ESCALA.find(t => cuantia <= t.hasta);
  if (escalon) return escalon.maximo;

  const tope = ARANCEL_PROCURA_ESCALA[ARANCEL_PROCURA_ESCALA.length - 1].maximo;
  const fracciones = Math.ceil((cuantia - ARANCEL_PROCURA.excesoSobre) / ARANCEL_PROCURA.fraccionExceso);
  return Math.min(
    tope + fracciones * ARANCEL_PROCURA.maximoPorFraccion,
    ARANCEL_PROCURA.topeGlobalPorAsunto,
  );
}

/** Derechos máximos de la Procura para un procedimiento concreto. */
export function estimarArancelesProcurador(
  cuantia: number,
  tipo: TipoProcedimiento,
  indeterminada: boolean,
): number {
  if (tipo === 'monitorio') return ARANCEL_PROCURA.monitorio;

  const base = indeterminada ? ARANCEL_PROCURA.cuantiaIndeterminada : arancelBaseProcura(cuantia);
  // Art. 18.d: el juicio ordinario devenga un 10 % más de lo que dan los arts. 2 o 3.
  const conRecargo = tipo === 'ordinario' ? base * (1 + ARANCEL_PROCURA.recargoJuicioOrdinario) : base;
  return Math.min(conRecargo, ARANCEL_PROCURA.topeGlobalPorAsunto);
}

// ─── Tasas judiciales (Ley 10/2012 tras la STC 140/2016) ─────────────────────

export function estimarTasas(cuantia: number, tipo: TipoProcedimiento, persona: TipoPersona): number {
  // Art. 4.2.a: exención subjetiva plena de las personas físicas desde el 01/03/2015.
  if (persona === 'fisica') return 0;
  // Orden social: sin tasa en instancia.
  if (tipo === 'laboral') return TASAS_JUDICIALES_CUOTA_FIJA.social.instancia;

  // Art. 4.1.c: exención objetiva del monitorio y del verbal de cantidad hasta 2.000 €.
  const exentoPorCuantia =
    (tipo === 'monitorio' || tipo === 'verbal') && cuantia <= TASAS_JUDICIALES.exencionObjetivaCuantiaHasta;
  if (exentoPorCuantia) return 0;

  if (tipo === 'contencioso') return TASAS_JUDICIALES_CUOTA_FIJA.contencioso.ordinario;

  const fijas = TASAS_JUDICIALES_CUOTA_FIJA.civil;
  const cuota = { verbal: fijas.verbal, ordinario: fijas.ordinario, monitorio: fijas.monitorio, cambiario: fijas.cambiario }[
    tipo as 'verbal' | 'ordinario' | 'monitorio' | 'cambiario'
  ];

  // La cuota variable del art. 7.2 NO se suma: es nula desde la STC 140/2016.
  return cuota;
}

// ─── Cálculo completo ─────────────────────────────────────────────────────────

export function calcular({ cuantia, tipo, persona, incluirPerito }: DatosEstimacion): Resultado {
  const indeterminada = cuantia === null;
  // Art. 394.3 LEC: a efectos del tope de costas, lo inestimable se valora en 24.000 €.
  const cuantiaAplicada = cuantia ?? UMBRALES_LEC.valorPretensionInestimable;

  const info = PROCEDIMIENTOS[tipo];
  const notas: string[] = [];

  // ── Abogado ──
  const honorarios = estimarHonorariosAbogado(cuantiaAplicada, tipo);
  // El abogado deja de ser preceptivo por debajo del umbral de la LEC en verbal y monitorio.
  const abogadoOpcional =
    !info.requiereAbogado &&
    (tipo === 'laboral' ||
      (!indeterminada && cuantiaAplicada <= UMBRALES_LEC.sinAbogadoNiProcuradorHasta));
  const abogado: Horquilla = {
    min: abogadoOpcional ? 0 : honorarios.min,
    max: honorarios.max,
  };
  if (abogadoOpcional) {
    notas.push(
      tipo === 'laboral'
        ? 'Puedes comparecer sin abogado (art. 18 LRJS): por eso el mínimo de la horquilla es 0 €. La estimación de arriba es lo que costaría contratarlo'
        : `Con esta cuantía el abogado no es preceptivo (arts. 23.2 y 31.2 LEC, hasta ${formatCurrency(UMBRALES_LEC.sinAbogadoNiProcuradorHasta)}): por eso el mínimo es 0 €`,
    );
  }

  // ── Procurador ──
  let procurador = 0;
  let procuradorOpcional = false;
  if (info.requiereProcurador) {
    procurador = estimarArancelesProcurador(cuantiaAplicada, tipo, indeterminada);
  } else if (
    (tipo === 'verbal' || tipo === 'monitorio') &&
    (indeterminada || cuantiaAplicada > UMBRALES_LEC.sinAbogadoNiProcuradorHasta)
  ) {
    procurador = estimarArancelesProcurador(cuantiaAplicada, tipo, indeterminada);
    if (tipo === 'verbal') {
      notas.push(
        `Cuantía superior a ${formatCurrency(UMBRALES_LEC.sinAbogadoNiProcuradorHasta)}: procurador obligatorio en juicio verbal (art. 23.2 LEC)`,
      );
    }
  } else if (tipo !== 'laboral') {
    procuradorOpcional = true;
  }

  // ── Tasas ──
  const tasas = indeterminada ? estimarTasas(0, tipo, persona) : estimarTasas(cuantiaAplicada, tipo, persona);
  if (persona === 'fisica' && tipo !== 'laboral') {
    notas.push('Las personas físicas están exentas de tasas judiciales desde 2015 (art. 4.2 Ley 10/2012)');
  }

  // ── Perito ──
  const perito = incluirPerito ? estimarPerito(cuantiaAplicada) : 0;

  // ── IVA: 21 % sobre servicios profesionales. Las tasas son un tributo y no lo llevan ──
  const tipoIVA = PORCENTAJES_IVA.general / 100;
  const baseImponible: Horquilla = {
    min: abogado.min + procurador + perito,
    max: abogado.max + procurador + perito,
  };
  const iva: Horquilla = { min: baseImponible.min * tipoIVA, max: baseImponible.max * tipoIVA };

  const total: Horquilla = {
    min: baseImponible.min + iva.min + tasas,
    max: baseImponible.max + iva.max + tasas,
  };

  if (persona === 'juridica') {
    notas.push('Si tu empresa puede deducirse el IVA soportado, el coste real es la base sin IVA');
  }

  // ── Límite del art. 394.3 LEC ──
  const limiteCostas = cuantiaAplicada * UMBRALES_LEC.limiteCostasFraccion;
  const limiteCostasMuerde = abogado.max > limiteCostas;

  if (info.nota) notas.push(info.nota);
  if (indeterminada) {
    notas.push(
      `Cuantía indeterminada: el arancel de la Procura fija ${formatCurrency(ARANCEL_PROCURA.cuantiaIndeterminada)} (art. 3 RD 434/2024) y el art. 394.3 LEC valora la pretensión en ${formatCurrency(UMBRALES_LEC.valorPretensionInestimable)} a efectos del límite de costas`,
    );
  }
  if (!indeterminada && tipo === 'verbal' && cuantiaAplicada > UMBRALES_LEC.juicioVerbalHasta) {
    notas.push(
      `Con más de ${formatCurrency(UMBRALES_LEC.juicioVerbalHasta)} el procedimiento sería un juicio ordinario, no un verbal (art. 250.2 LEC)`,
    );
  }

  return {
    cuantiaAplicada,
    cuantiaIndeterminada: indeterminada,
    abogado,
    abogadoOpcional,
    procurador,
    procuradorOpcional,
    tasas,
    perito,
    iva,
    baseImponible,
    total,
    limiteCostas,
    limiteCostasMuerde,
    notas,
  };
}
