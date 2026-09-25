/**
 * Calculadora del Impuesto de Donaciones (ISD) — lógica pura sin React ni DOM
 * Usada por: el estimador de la web (app/estimador-impuesto-donaciones), el MCP de Delegum
 * (calcular_donaciones), el GPT (api/chatgpt/donaciones) y comparacionDonacionHerencia.
 *
 * Fuente: Ley 29/1987 ISD + normativas autonómicas 2025
 * Cubre: 17 CCAA, tarifa estatal (16 tramos), tarifa propia Cataluña,
 *        coeficientes multiplicadores y bonificaciones autonómicas.
 *
 * ── 25/09/2026: un solo motor, y sin las reducciones de las herencias ─────────────────
 * Hasta esa fecha el estimador de la web repetía esta aritmética en su page.tsx, y las dos
 * copias compartían el mismo defecto (hallazgo 1862 del Inspector): restaban de la base las
 * reducciones por parentesco (15.956,87 / 7.993,46 €) y por discapacidad (47.858,59 /
 * 150.253,03 €) del art. 20.2.a LISD, que la ley reserva a las adquisiciones «mortis causa».
 * En una donación, si la comunidad no ha regulado reducciones propias, «la base liquidable
 * coincidirá, en todo caso, con la imponible» (art. 20.5 LISD). Ahora la web llama a este
 * motor, y las reducciones propias de cada comunidad para donaciones NO se modelan: la cifra
 * es la de la base sin reducir.
 *
 * Los campos `reduccionParentesco` y `reduccionDiscapacidad` se conservan (valen 0) porque
 * los devuelve el GPT en su JSON y retirarlos rompería a quien los lea.
 */

import {
  TARIFA_ESTATAL_ID,
  TARIFA_CATALUNA_ID_GENERAL,
  TARIFA_CATALUNA_ID_REDUCIDA,
  COEFICIENTES_ID,
  COEFICIENTES_CATALUNA_ID,
  BONIFICACIONES_CCAA_ID,
  type TramoTarifaID,
  type BonificacionGrupoID,
} from '@/data/fiscal';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

/**
 * Claves de parentesco de los módulos de datos. OJO: la clave 'I-conyuge' es histórica; el
 * art. 20.2.a LISD pone al cónyuge en el GRUPO II («descendientes y adoptados de veintiuno o
 * más años, cónyuges, ascendientes y adoptantes»), y así lo trata `grupoLegal()`.
 */
export type GrupoParentesco =
  | 'I-conyuge'
  | 'I-descendiente'
  | 'II'
  | 'II-ascendiente'
  | 'III'
  | 'IV';

export type NivelDiscapacidad = '0' | '33' | '65';

/** 1–4: ninguno/bajo/medio/alto (rangos de patrimonio preexistente) */
export type IndicePatrimonio = 1 | 2 | 3 | 4;

export interface ParametrosDonaciones {
  /** Valor de la donación en euros */
  valorDonacion: number;
  /**
   * Comunidad cuya normativa se aplica (clave de BONIFICACIONES_CCAA_ID). NO es siempre la del
   * donatario: la donación de un INMUEBLE tributa donde este radica (art. 32.2.b Ley 22/2009);
   * la residencia habitual del donatario manda en los demás bienes (art. 32.2.c).
   */
  ccaa: string;
  /** Grupo de parentesco del donatario */
  grupo: GrupoParentesco;
  /** Cargas deducibles en euros (art. 9.1.b LISD). Negativas o no finitas: error. */
  cargas?: number;
  /** Si la donación se formaliza en escritura pública (relevante en Cataluña y C-LM) */
  escrituraPublica?: boolean;
  /** Grado de discapacidad del donatario (solo lo usan las comunidades que lo tienen cotejado) */
  discapacidad?: NivelDiscapacidad;
  /**
   * Índice de patrimonio preexistente del donatario:
   * 1 = 0–402.678 €, 2 = 402.678–2.007.380 €,
   * 3 = 2.007.380–4.020.770 €, 4 = más de 4.020.770 €
   */
  patrimonioIdx?: IndicePatrimonio;
}

/** Una bonificación en cuota, tal como se aplicó (van en orden: cada una sobre lo que deja la anterior). */
export interface BonificacionAplicada {
  concepto: string;
  /** Porcentaje nominal (0–100) */
  porcentaje: number;
  importe: number;
}

export interface ResultadoDonaciones {
  /** Valor bruto de la donación (nombre histórico: la base imponible legal es el valor NETO) */
  baseImponible: number;
  /** Cargas deducidas */
  cargas: number;
  /**
   * Valor neto (valor − cargas): la base imponible del art. 9.1.b LISD, que en una donación es
   * también la base liquidable (art. 20.5 LISD) salvo reducciones autonómicas propias.
   */
  baseLiquidable: number;
  /** Siempre 0: la reducción por parentesco del art. 20.2.a LISD es solo mortis causa */
  reduccionParentesco: number;
  /** Siempre 0: la reducción por discapacidad del art. 20.2.a LISD es solo mortis causa */
  reduccionDiscapacidad: number;
  /** Base sobre la que se aplica la tarifa (= baseLiquidable) */
  baseNetaReducida: number;
  /** Cuota antes del coeficiente multiplicador */
  cuotaIntegra: number;
  /** Coeficiente multiplicador aplicado */
  coeficienteMultiplicador: number;
  /** cuotaIntegra × coeficienteMultiplicador */
  cuotaTributaria: number;
  /** Importe total de las bonificaciones autonómicas */
  bonificacionCcaa: number;
  /** Porcentaje total bonificado sobre la cuota tributaria (0–100) */
  porcentajeBonificacion: number;
  /** Descripción textual de la bonificación aplicada */
  detalleBonificacion: string;
  /** Cada bonificación aplicada, en orden */
  bonificaciones: BonificacionAplicada[];
  /** Cuota a pagar (cuotaTributaria - bonificacionCcaa) */
  cuotaFinal: number;
  /** Tipo efectivo sobre el valor total de la donación (%) */
  tipoEfectivo: number;
  /** Nombre de la CCAA */
  ccaaNombre: string;
  /** Si la CCAA tiene régimen foral (estimación aproximada) */
  esForal: boolean;
  /** Tarifa utilizada para el cálculo */
  tarifaAplicada: string;
  /** Notas de la CCAA (advertencias sobre regímenes forales, requisitos, etc.) */
  notasCcaa: string;
  /** Grupo del art. 20.2.a LISD en el que cae el donatario */
  grupoLegal: 'I' | 'II' | 'III' | 'IV';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESPACIO_DURO = ' ';

/** 0,95 → «95 %»; 0,999 → «99,9 %» (con espacio duro, formato español) */
function textoPorcentaje(fraccion: number): string {
  return (fraccion * 100).toLocaleString('es-ES', { maximumFractionDigits: 2 }) + ESPACIO_DURO + '%';
}

function calcularTarifa(base: number, tarifa: TramoTarifaID[]): number {
  if (base <= 0) return 0;
  let prevHasta = 0;
  for (const tramo of tarifa) {
    if (base <= tramo.hasta) {
      return tramo.cuota + (base - prevHasta) * (tramo.tipo / 100);
    }
    prevHasta = tramo.hasta;
  }
  return 0;
}

/** Grupo legal del art. 20.2.a LISD. El cónyuge es Grupo II, aunque su clave diga 'I-conyuge'. */
export function grupoLegal(grupo: GrupoParentesco): 'I' | 'II' | 'III' | 'IV' {
  if (grupo === 'I-descendiente') return 'I';
  if (grupo === 'I-conyuge' || grupo === 'II' || grupo === 'II-ascendiente') return 'II';
  if (grupo === 'III') return 'III';
  return 'IV';
}

/** Porcentaje (fracción) que corresponde a una base en una bonificación escalonada. `hasta` es exclusivo. */
function porcentajeEscalonado(b: BonificacionGrupoID, base: number): number {
  const tramo = (b.escalonado ?? []).find(
    (t) => (t.desde === undefined || base >= t.desde) && (t.hasta === undefined || base < t.hasta),
  );
  return tramo?.porcentaje ?? 0;
}

function aplicarBonificaciones(
  cuotaTributaria: number,
  baseLiquidable: number,
  grupo: GrupoParentesco,
  ccaa: string,
  escrituraPublica: boolean,
  discapacidad: NivelDiscapacidad,
): { bonificaciones: BonificacionAplicada[]; sinBonificacion: string } {
  const config = BONIFICACIONES_CCAA_ID[ccaa];
  if (!config) return { bonificaciones: [], sinBonificacion: 'CCAA no configurada' };

  const bonificaciones: BonificacionAplicada[] = [];
  const bGrupo: BonificacionGrupoID | undefined = config.bonificaciones[grupo];
  const bDisc = config.bonificacionDiscapacidad;
  const gradoDisc = discapacidad === '65' ? 65 : discapacidad === '33' ? 33 : 0;
  const aplicaDisc = !!bDisc && gradoDisc >= bDisc.gradoMinimo;
  const tieneAlguna =
    aplicaDisc ||
    (bGrupo !== undefined &&
      ((bGrupo.porcentaje ?? 0) > 0 || bGrupo.exencion !== undefined || (bGrupo.escalonado?.length ?? 0) > 0));

  if (!tieneAlguna) {
    return { bonificaciones, sinBonificacion: 'Sin bonificación autonómica para este grupo' };
  }

  // Castilla-La Mancha: todas sus bonificaciones inter vivos exigen escritura pública (art. 18.3.a Ley 8/2013)
  if (config.requiereEscritura && !escrituraPublica) {
    return { bonificaciones, sinBonificacion: 'Sin bonificación: requiere escritura pública notarial' };
  }

  let restante = cuotaTributaria;
  const norma = config.normaBonificacion ? `, ${config.normaBonificacion}` : '';

  if (bGrupo) {
    if (bGrupo.exencion !== undefined && baseLiquidable <= bGrupo.exencion) {
      // Exención total por importe (Andalucía)
      bonificaciones.push({
        concepto: `Exención total (base liquidable ≤ ${bGrupo.exencion.toLocaleString('es-ES')} €, ${config.nombre})`,
        porcentaje: 100,
        importe: restante,
      });
      restante = 0;
    } else {
      const fraccion = bGrupo.escalonado?.length
        ? porcentajeEscalonado(bGrupo, baseLiquidable)
        : (bGrupo.porcentaje ?? 0);
      if (fraccion > 0) {
        const importe = restante * fraccion;
        bonificaciones.push({
          concepto: `Bonificación ${textoPorcentaje(fraccion)} (${config.nombre}${norma})`,
          porcentaje: fraccion * 100,
          importe,
        });
        restante -= importe;
      }
    }
  }

  // Discapacidad: se aplica después, sobre lo que deja la de parentesco (art. 17 bis.2 CLM)
  if (aplicaDisc && bDisc && restante > 0) {
    const importe = restante * bDisc.porcentaje;
    bonificaciones.push({
      concepto: `Bonificación por discapacidad ${textoPorcentaje(bDisc.porcentaje)} (${bDisc.norma})`,
      porcentaje: bDisc.porcentaje * 100,
      importe,
    });
    restante -= importe;
  }

  return { bonificaciones, sinBonificacion: 'Sin bonificación autonómica para este grupo' };
}

// ─── Función principal ────────────────────────────────────────────────────────

export function calcularDonacion(p: ParametrosDonaciones): ResultadoDonaciones {
  if (!Number.isFinite(p.valorDonacion) || p.valorDonacion <= 0) {
    throw new Error('El valor de la donación debe ser mayor que cero.');
  }
  if (!BONIFICACIONES_CCAA_ID[p.ccaa]) throw new Error(`CCAA no reconocida: "${p.ccaa}". Valores válidos: ${Object.keys(BONIFICACIONES_CCAA_ID).join(', ')}`);

  const cargasNum = p.cargas ?? 0;
  // Unas cargas negativas SUMARÍAN a la base: antes se recortaban a 0 en silencio (y la web
  // las restaba con su signo). Un dato así es un error de entrada, no una carga (hallazgo 1879).
  if (!Number.isFinite(cargasNum) || cargasNum < 0) {
    throw new Error('Las cargas deducibles no pueden ser negativas.');
  }
  const escrituraPublica = p.escrituraPublica ?? true;
  const discapacidad = p.discapacidad ?? '0';
  const patrimonioIdx = Math.min(4, Math.max(1, p.patrimonioIdx ?? 1)) - 1; // 0-based

  const ccaaInfo = BONIFICACIONES_CCAA_ID[p.ccaa];
  const esCataluna = p.ccaa === 'cataluna';
  const esForal = ccaaInfo.regimen === 'foral';
  const grupoBase = grupoLegal(p.grupo);

  // 1. Valor bruto
  const baseImponible = p.valorDonacion;

  // 2. Valor neto = base imponible (art. 9.1.b LISD) = base liquidable (art. 20.5 LISD)
  const baseLiquidable = Math.max(0, baseImponible - cargasNum);

  // 3. Sin reducciones: las del art. 20.2.a LISD son mortis causa (ver cabecera)
  const reduccionParentesco = 0;
  const reduccionDiscapacidad = 0;
  const baseNetaReducida = baseLiquidable;

  // 4. Tarifa aplicable
  let tarifa: TramoTarifaID[];
  let tarifaAplicada: string;

  if (esCataluna) {
    const esGrupoReducido = grupoBase === 'I' || grupoBase === 'II';
    if (esGrupoReducido && escrituraPublica) {
      tarifa = TARIFA_CATALUNA_ID_REDUCIDA;
      tarifaAplicada = `Tarifa reducida de Cataluña (del 5${ESPACIO_DURO}% al 9${ESPACIO_DURO}%, Grupos I y II con escritura pública)`;
    } else {
      tarifa = TARIFA_CATALUNA_ID_GENERAL;
      tarifaAplicada = `Tarifa general de Cataluña (del 7${ESPACIO_DURO}% al 32${ESPACIO_DURO}%)`;
    }
  } else {
    tarifa = TARIFA_ESTATAL_ID;
    tarifaAplicada = `Tarifa estatal (art. 21.2 LISD, del 7,65${ESPACIO_DURO}% al 34${ESPACIO_DURO}%)`;
  }

  const cuotaIntegra = calcularTarifa(baseNetaReducida, tarifa);

  // 5. Coeficiente multiplicador por patrimonio preexistente (art. 22.2 LISD)
  const coefs = esCataluna ? COEFICIENTES_CATALUNA_ID : COEFICIENTES_ID;
  const coeficienteMultiplicador = coefs[grupoBase]?.[patrimonioIdx] ?? 1;

  const cuotaTributaria = cuotaIntegra * coeficienteMultiplicador;

  // 6. Bonificaciones autonómicas en cuota
  const { bonificaciones, sinBonificacion } = aplicarBonificaciones(
    cuotaTributaria, baseLiquidable, p.grupo, p.ccaa, escrituraPublica, discapacidad,
  );
  const bonificacion = bonificaciones.reduce((s, b) => s + b.importe, 0);
  // Porcentaje total: 1 − Π(1 − pᵢ). Con una sola bonificación, su porcentaje nominal.
  const porcentaje = (1 - bonificaciones.reduce((r, b) => r * (1 - b.porcentaje / 100), 1)) * 100;
  const detalle = bonificaciones.length ? bonificaciones.map((b) => b.concepto).join(' + ') : sinBonificacion;

  const cuotaFinal = Math.max(0, cuotaTributaria - bonificacion);
  const tipoEfectivo = baseImponible > 0 ? (cuotaFinal / baseImponible) * 100 : 0;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    baseImponible: r2(baseImponible),
    cargas: r2(cargasNum),
    baseLiquidable: r2(baseLiquidable),
    reduccionParentesco,
    reduccionDiscapacidad,
    baseNetaReducida: r2(baseNetaReducida),
    cuotaIntegra: r2(cuotaIntegra),
    coeficienteMultiplicador,
    cuotaTributaria: r2(cuotaTributaria),
    bonificacionCcaa: r2(bonificacion),
    porcentajeBonificacion: r2(porcentaje),
    detalleBonificacion: detalle,
    bonificaciones: bonificaciones.map((b) => ({ ...b, importe: r2(b.importe) })),
    cuotaFinal: r2(cuotaFinal),
    tipoEfectivo: r2(tipoEfectivo),
    ccaaNombre: ccaaInfo.nombre,
    esForal,
    tarifaAplicada,
    notasCcaa: ccaaInfo.notas,
    grupoLegal: grupoBase,
  };
}
