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
  COSTAS_LJCA,
  PORCENTAJES_IVA,
  TASAS_JUDICIALES,
  TASAS_JUDICIALES_CUOTA_FIJA,
  UMBRALES_LEC,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TipoProcedimiento = 'ordinario' | 'verbal' | 'monitorio' | 'cambiario' | 'laboral' | 'contencioso';
export type TipoPersona = 'fisica' | 'juridica';
/**
 * Qué ley pone el techo a las costas del vencido. No es siempre la LEC (hallazgo 2553):
 *   · 'lec'  — art. 394.3 LEC: tercio de la cuantía, solo abogado y profesionales sin arancel
 *   · 'ljca' — art. 139.4 LJCA: tercio de la cuantía, pero de TODAS las costas (procurador dentro)
 *   · 'lrjs' — en la instancia social no hay condena por vencimiento (art. 97.3 LRJS): no hay tope
 */
export type RegimenCostas = 'lec' | 'ljca' | 'lrjs';

export interface Horquilla {
  min: number;
  max: number;
}

export interface DatosEstimacion {
  /** Cuantía del pleito en euros, o null si es indeterminada. */
  cuantia: number | null;
  tipo: TipoProcedimiento;
  persona: TipoPersona;
  incluirPerito: boolean;
}

export interface Resultado {
  /**
   * Cuantía efectivamente usada: la tecleada o, si es indeterminada, la valoración legal del
   * orden a efectos del tope de costas (18.000 € en el contencioso por el art. 139.4 LJCA;
   * 24.000 € en lo civil por el art. 394.3 LEC). En lo social, donde la ley no valora nada,
   * los 24.000 € son solo la referencia para estimar los honorarios.
   */
  cuantiaAplicada: number;
  cuantiaIndeterminada: boolean;
  abogado: Horquilla;
  /** El abogado no es preceptivo: el mínimo de la horquilla puede ser 0 €. */
  abogadoOpcional: boolean;
  procurador: number;
  procuradorOpcional: boolean;
  /** Se estima, pero ante un Juzgado de lo Contencioso no es obligatorio (art. 23.1 LJCA). */
  procuradorPotestativo: boolean;
  tasas: number;
  perito: number;
  /** IVA al tipo general sobre abogado + procurador + perito. Las tasas no lo llevan. */
  iva: Horquilla;
  baseImponible: Horquilla;
  total: Horquilla;
  /** La ley que fija el tope de las costas del vencido en este procedimiento. */
  regimenCostas: RegimenCostas;
  /**
   * Tope a lo que el condenado en costas paga de la contraria: art. 394.3 LEC o art. 139.4
   * LJCA. `null` en lo social, donde en la instancia no hay condena por vencimiento.
   */
  limiteCostas: number | null;
  /**
   * Lo que el tope alcanza, con los máximos estimados: abogado y perito (profesionales «no
   * sujetos a tarifa o arancel», art. 394.3 LEC) o, en el contencioso, también el procurador
   * («una cantidad total», art. 139.4 LJCA). Sin IVA, como el resto de la comparación.
   */
  sujetoAlTope: number;
  /** Lo sujeto al tope lo supera: el tope recorta lo que pagaría el vencido. */
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
    nota: 'Abogado y procurador son obligatorios si la cuantía supera 2.000 € o no está determinada (arts. 23.2.1.º y 31.2.1.º LEC)',
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
    nota: 'No hay tasas judiciales en el orden social. Puedes comparecer por ti mismo (art. 18 LRJS); el abogado es recomendable pero no obligatorio en la instancia (art. 21.1). Sin procurador',
  },
  contencioso: {
    label: 'Contencioso-administrativo',
    descripcion: 'Recursos contra la Administración',
    // Se estima siempre, pero ante un Juzgado es potestativo (art. 23.1 LJCA): ver `calcular`.
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

/**
 * Derechos máximos de la Procura para un procedimiento concreto, SI interviene un procurador.
 * Que sea preceptivo lo decide `calcular`: en el monitorio, por ejemplo, no lo es nunca para
 * la petición inicial, pero si se contrata cobra como máximo el art. 24.1.
 */
export function estimarArancelesProcurador(
  cuantia: number,
  tipo: TipoProcedimiento,
  indeterminada: boolean,
): number {
  if (tipo === 'monitorio') return ARANCEL_PROCURA.monitorio;

  // Art. 69.2: el contencioso inestimable tiene concepto propio y el art. 3 es supletorio
  // (hallazgo 2555). Se toma el del Juzgado, que es el órgano de la primera instancia más
  // común; la nota de `calcular` da los de las Salas.
  if (tipo === 'contencioso' && indeterminada) return ARANCEL_PROCURA.contenciosoInestimable.juzgados;

  const base = indeterminada ? ARANCEL_PROCURA.cuantiaIndeterminada : arancelBaseProcura(cuantia);
  // Art. 18.d: el juicio ordinario devenga un 10 % más de lo que dan los arts. 2 o 3.
  const conRecargo = tipo === 'ordinario' ? base * (1 + ARANCEL_PROCURA.recargoJuicioOrdinario) : base;
  return Math.min(conRecargo, ARANCEL_PROCURA.topeGlobalPorAsunto);
}

// ─── Tasas judiciales (Ley 10/2012 tras la STC 140/2016) ─────────────────────

/**
 * Tasa judicial de la persona jurídica. `cuantia` es la base imponible del art. 6: la del
 * pleito o, si es indeterminada, los 18.000 € del art. 6.2 (nunca 0, que la colaría en la
 * exención de los 2.000 €: hallazgo 2551).
 */
export function estimarTasas(cuantia: number, tipo: TipoProcedimiento, persona: TipoPersona): number {
  // Art. 4.2.a: exención subjetiva plena de las personas físicas desde el 01/03/2015.
  if (persona === 'fisica') return 0;
  // Orden social: la instancia nunca tuvo tasa y las de los recursos las anuló la STC 140/2016.
  if (tipo === 'laboral') return TASAS_JUDICIALES_CUOTA_FIJA.social.instancia;
  // Contencioso: la STC 140/2016 anuló sus cuatro cuotas, también las de instancia (hallazgo 2550).
  if (tipo === 'contencioso') return TASAS_JUDICIALES_CUOTA_FIJA.contencioso.instancia;

  // Art. 4.1.c: exención objetiva del monitorio y del verbal de cantidad hasta 2.000 €.
  const exentoPorCuantia =
    (tipo === 'monitorio' || tipo === 'verbal') && cuantia <= TASAS_JUDICIALES.exencionObjetivaCuantiaHasta;
  if (exentoPorCuantia) return 0;

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
  const regimenCostas: RegimenCostas =
    tipo === 'contencioso' ? 'ljca' : tipo === 'laboral' ? 'lrjs' : 'lec';
  // Lo indeterminado se valora como lo valora la ley del orden: 18.000 € en el contencioso
  // (art. 139.4 LJCA) y 24.000 € en lo civil (art. 394.3 LEC). La LRJS no valora nada: en lo
  // social los 24.000 € son solo la referencia de los honorarios.
  const cuantiaAplicada =
    cuantia ??
    (regimenCostas === 'ljca' ? COSTAS_LJCA.valorCuantiaIndeterminada : UMBRALES_LEC.valorPretensionInestimable);

  const info = PROCEDIMIENTOS[tipo];
  const notas: string[] = [];
  const umbral = formatCurrency(UMBRALES_LEC.sinAbogadoNiProcuradorHasta);

  // ── Abogado ──
  const honorarios = estimarHonorariosAbogado(cuantiaAplicada, tipo);
  // Arts. 23.2.1.º y 31.2.1.º LEC: sin abogado ni procurador en el verbal DETERMINADO por la
  // cuantía hasta 2.000 € y en la petición inicial del monitorio, ésta SIN límite de cuantía
  // (hallazgo 2552: el umbral es solo del verbal). Art. 21.1 LRJS: facultativo en la instancia.
  const abogadoOpcional =
    tipo === 'laboral' ||
    tipo === 'monitorio' ||
    (tipo === 'verbal' && !indeterminada && cuantiaAplicada <= UMBRALES_LEC.sinAbogadoNiProcuradorHasta);
  const abogado: Horquilla = {
    min: abogadoOpcional ? 0 : honorarios.min,
    max: honorarios.max,
  };
  if (abogadoOpcional) {
    notas.push(
      tipo === 'laboral'
        ? 'Puedes comparecer sin abogado (art. 18 LRJS): por eso el mínimo de la horquilla es 0 €. La estimación de arriba es lo que costaría contratarlo'
        : tipo === 'monitorio'
          ? 'La petición inicial del monitorio no exige abogado, sea cual sea la cuantía (art. 31.2.1.º LEC): por eso el mínimo es 0 €. La estimación de arriba es lo que costaría contratarlo'
          : `Con esta cuantía el abogado no es preceptivo (arts. 23.2 y 31.2 LEC, hasta ${umbral}): por eso el mínimo es 0 €`,
    );
  }

  // ── Procurador ──
  let procurador = 0;
  let procuradorOpcional = false;
  const procuradorPotestativo = tipo === 'contencioso' && COSTAS_LJCA.procuradorPotestativoAnteJuzgados;
  if (info.requiereProcurador) {
    procurador = estimarArancelesProcurador(cuantiaAplicada, tipo, indeterminada);
  } else if (tipo === 'verbal' && (indeterminada || cuantiaAplicada > UMBRALES_LEC.sinAbogadoNiProcuradorHasta)) {
    procurador = estimarArancelesProcurador(cuantiaAplicada, tipo, indeterminada);
    notas.push(
      indeterminada
        // Sin cuantía no se puede afirmar que «supera 2.000 €» (hallazgo 2551): lo que manda es
        // que la excepción es solo del verbal determinado por razón de la cuantía.
        ? `Con cuantía indeterminada, abogado y procurador son obligatorios en juicio verbal: la excepción de los arts. 23.2.1.º y 31.2.1.º LEC es solo para el verbal determinado por la cuantía hasta ${umbral}`
        : `Cuantía superior a ${umbral}: procurador obligatorio en juicio verbal (art. 23.2 LEC)`,
    );
  } else if (tipo !== 'laboral') {
    // Verbal hasta 2.000 € y petición inicial del monitorio: se puede ir sin procurador.
    procuradorOpcional = true;
  }
  if (procuradorPotestativo) {
    notas.push(
      'Ante un Juzgado de lo Contencioso (órgano unipersonal) el procurador es potestativo: puedes conferir la representación a tu abogado (art. 23.1 LJCA). Ante las Salas (TSJ, Audiencia Nacional, Supremo) es obligatorio (art. 23.2). La estimación lo incluye',
    );
  }

  // ── Tasas ──
  // Base imponible del art. 6 Ley 10/2012: lo indeterminado vale 18.000 € (art. 6.2), no 0.
  const baseTasa = indeterminada ? TASAS_JUDICIALES.valorCuantiaIndeterminada : cuantiaAplicada;
  const tasas = estimarTasas(baseTasa, tipo, persona);
  if (persona === 'fisica' && tipo !== 'laboral') {
    notas.push('Las personas físicas están exentas de tasas judiciales desde 2015 (art. 4.2 Ley 10/2012)');
  }
  if (persona === 'juridica' && tipo === 'contencioso') {
    notas.push(
      'En el contencioso-administrativo no hay tasa judicial: la STC 140/2016 anuló todas sus cuotas, también las de primera instancia',
    );
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

  // ── Tope de las costas del vencido ──
  // LEC 394.3: abogado y demás profesionales «no sujetos a tarifa o arancel» → el perito
  // también (hallazgo 2556). LJCA 139.4: «una cantidad total» → también el procurador.
  let limiteCostas: number | null = null;
  let sujetoAlTope = 0;
  if (regimenCostas === 'lec') {
    limiteCostas = cuantiaAplicada * UMBRALES_LEC.limiteCostasFraccion;
    sujetoAlTope = abogado.max + perito;
  } else if (regimenCostas === 'ljca') {
    limiteCostas = cuantiaAplicada * COSTAS_LJCA.limiteCostasFraccion;
    sujetoAlTope = abogado.max + procurador + perito;
  }
  const limiteCostasMuerde = limiteCostas !== null && sujetoAlTope > limiteCostas;

  if (info.nota) notas.push(info.nota);
  if (indeterminada) {
    if (regimenCostas === 'ljca') {
      const inestimable = ARANCEL_PROCURA.contenciosoInestimable;
      notas.push(
        `Cuantía indeterminada: el arancel de la Procura fija ${formatCurrency(inestimable.juzgados)} ante los Juzgados de lo Contencioso (art. 69.2 RD 434/2024; ${formatCurrency(inestimable.juzgadosCentralesAudienciaNacionalTSJ)} ante los TSJ y la Audiencia Nacional y ${formatCurrency(inestimable.tribunalSupremo)} ante el Supremo), y el art. 139.4 LJCA valora la pretensión en ${formatCurrency(COSTAS_LJCA.valorCuantiaIndeterminada)} a efectos del límite de costas`,
      );
    } else if (regimenCostas === 'lrjs') {
      notas.push(
        `Cuantía indeterminada: la LRJS no le da un valor legal; la horquilla del abogado se estima sobre ${formatCurrency(cuantiaAplicada)} solo como referencia`,
      );
    } else {
      const arancel = tipo === 'monitorio'
        ? ''
        : `el arancel de la Procura fija ${formatCurrency(ARANCEL_PROCURA.cuantiaIndeterminada)} (art. 3 RD 434/2024)${tipo === 'ordinario' ? ', más el 10 % del juicio ordinario (art. 18.d)' : ''} y `;
      notas.push(
        `Cuantía indeterminada: ${arancel}el art. 394.3 LEC valora la pretensión en ${formatCurrency(UMBRALES_LEC.valorPretensionInestimable)} a efectos del límite de costas`,
      );
    }
  }
  if (!indeterminada && tipo === 'verbal' && cuantiaAplicada > UMBRALES_LEC.juicioVerbalHasta) {
    // Art. 250.1 LEC: hay materias que van a verbal «cualquiera que sea su cuantía» (hallazgo 2557).
    notas.push(
      `Con más de ${formatCurrency(UMBRALES_LEC.juicioVerbalHasta)} el procedimiento sería un juicio ordinario, no un verbal (art. 250.2 LEC), salvo que la demanda sea de las que el art. 250.1 LEC lleva al verbal sea cual sea su cuantía: impago de rentas y desahucio, reclamaciones de cantidad de la comunidad de propietarios, precario, alimentos o división de cosa común, entre otras`,
    );
  }

  return {
    cuantiaAplicada,
    cuantiaIndeterminada: indeterminada,
    abogado,
    abogadoOpcional,
    procurador,
    procuradorOpcional,
    procuradorPotestativo,
    tasas,
    perito,
    iva,
    baseImponible,
    total,
    regimenCostas,
    limiteCostas,
    sujetoAlTope,
    limiteCostasMuerde,
    notas,
  };
}
