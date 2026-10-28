/**
 * Calculadora del Impuesto de Sucesiones (ISD) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_sucesiones)
 *
 * Fuente: Ley 29/1987 ISD + normativas autonómicas 2025
 * Cubre: 17 CCAA, tarifa estatal (art. 21.2 LISD, 16 tramos), tarifas propias de Cataluña y
 *        Andalucía, coeficientes multiplicadores, reducciones y bonificaciones autonómicas.
 *
 * Nota: Solo calcula el impuesto sobre la herencia del beneficiario individual,
 * no el reparto de la masa hereditaria ni las legitimas.
 */

import {
  TARIFA_ESTATAL_IS,
  TARIFA_CATALUNA_IS,
  COEFICIENTES_IS,
  COEFICIENTES_CATALUNA_IS,
  cuotaTributariaConCorreccionIS,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCIONES_PARENTESCO_CATALUNA_IS,
  REDUCCION_DISCAPACIDAD_33_IS,
  REDUCCION_DISCAPACIDAD_65_IS,
  REDUCCION_EDAD_MENOR_21_IS,
  REDUCCION_EDAD_MENOR_21_MAX_IS,
  REDUCCION_SEGURO_VIDA_MAX_IS,
  REDUCCION_VIVIENDA_PORC_IS,
  REDUCCION_VIVIENDA_MAX_IS,
  REDUCCION_EDAD_MENOR_21_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS,
  REDUCCION_VIVIENDA_MAX_CATALUNA_IS,
  REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS,
  REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS,
  PORC_AJUAR_DOMESTICO_IS,
  BONIFICACIONES_CCAA_IS,
  MEJORAS_REDUCCIONES_CCAA_IS,
  TARIFAS_PROPIAS_CCAA_ISD,
  FISCAL_SUCESIONES_META,
  FISCAL_SUCESIONES_CATALUNA_META,
  type TramoTarifaIS,
  type BonificacionGrupoIS,
  type TramoEscalaBonificacionIS,
} from '@/data/fiscal';
import { formatPercentage } from '@/lib/formatters';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

/**
 * `II` es el HIJO de 21 años o más, y `II-descendiente` el resto de descendientes de esa edad
 * (nieto, bisnieto). El régimen común no los distingue —el art. 20.2.a LISD les da lo mismo a
 * los dos—, pero Cataluña sí: 100.000 € al hijo y 50.000 € al nieto. Hasta el 08/09/2026 no
 * había manera de decírselo al motor y todos entraban por 'II' cobrando lo del nieto.
 */
export type GrupoParentescoIS =
  | 'I-conyuge'
  | 'I-descendiente'
  | 'II'
  | 'II-descendiente'
  | 'II-ascendiente'
  | 'III'
  | 'IV';

/**
 * Grado de discapacidad del heredero: '33' es del 33 % al 49 %, '50' del 50 % al 64 % y '65' del
 * 65 % o más. La reducción estatal (art. 20.2.a LISD) no distingue '33' de '50' —47.858,59 € del
 * 33 % al 64 %—, pero Extremadura sí (art. 18 DLeg 1/2018: 60.000 / 120.000 / 180.000 €). Hasta el
 * 22/10/2026 el tipo solo tenía '33' y '65' (C0371); quien siga pasando '33' para un grado del 50 %
 * al 64 % recibe en Extremadura la reducción del tramo inferior, nunca una de más.
 */
export type NivelDiscapacidadIS = '0' | '33' | '50' | '65';

/** 1–4: ninguno/bajo/medio/alto (rangos de patrimonio preexistente) */
export type IndicePatrimonioIS = 1 | 2 | 3 | 4;

export interface ParametrosSucesiones {
  /** Valor neto de la herencia recibida por este beneficiario (en euros) */
  baseImponible: number;
  /** Comunidad autónoma del causante (clave de BONIFICACIONES_CCAA_IS) */
  ccaa: string;
  /** Grupo de parentesco del heredero */
  grupo: GrupoParentescoIS;
  /** Edad del heredero (relevante si es menor de 21 para reducción adicional) */
  edadHeredero?: number;
  /** Grado de discapacidad del heredero */
  discapacidad?: NivelDiscapacidadIS;
  /**
   * Índice de patrimonio preexistente del heredero:
   * 1 = 0–402.678 €, 2 = 402.678–2.007.380 €,
   * 3 = 2.007.380–4.020.770 €, 4 = más de 4.020.770 €
   *
   * Con el índice solo se conoce el tramo, no cuánto pasa el patrimonio de su límite inferior,
   * así que la corrección del salto del art. 22.2 LISD no se puede aplicar: se usa el
   * coeficiente entero del tramo. Quien conozca el importe debe pasar `patrimonioPreexistente`.
   */
  patrimonioIdx?: IndicePatrimonioIS;
  /**
   * Importe del patrimonio preexistente del heredero, en euros. Si se pasa, MANDA sobre
   * `patrimonioIdx`: fija el tramo y permite aplicar la corrección del salto de coeficiente del
   * art. 22.2 LISD (hallazgo 2483, 30/09/2026).
   */
  patrimonioPreexistente?: number;
  /** Valor de la vivienda habitual incluida en la herencia (para reducción 95%) */
  viviendaHabitual?: number;
  /**
   * ¿El heredero convivió con el causante los dos años anteriores al fallecimiento?
   *
   * Solo importa para el pariente COLATERAL (Grupo III), a quien el art. 20.2.c LISD le
   * exige además tener 65 años o más. Hasta el 27/08/2026 este motor concedía la reducción
   * a todo el Grupo III sin condición, mientras `simulador-heredar-vivienda` sí la
   * comprobaba desde la reparación del hallazgo 204: la misma herencia de un hermano de 40
   * años valía 14.741,88 € en la web y 4.883,57 € por MCP (hallazgo 462).
   */
  convivenciaDosAnios?: boolean;
  /**
   * Importe del seguro de vida cobrado como beneficiario, APARTE de `baseImponible`: se acumula
   * a la porción hereditaria (art. 9.1.c LISD) y sobre él se aplica la reducción del art. 20.2.b
   * (100 %, tope 9.195,49 €, cónyuge, ascendientes y descendientes). No entra en el ajuar, que
   * es un porcentaje del caudal relicto (art. 15 LISD; hallazgo 1824).
   *
   * Hasta el 12/10/2026 solo se restaba la reducción sin sumar el seguro a la base: quien lo
   * pasaba aparte —el MCP y la API lo piden en un campo propio— se reducía algo que no tributaba
   * (cabo C0027). Ningún consumidor lo pasaba incluido en la base: solo lo usan esos dos.
   */
  seguroVida?: number;
  /** Si se incluye el ajuar doméstico en la base (3% masa hereditaria) */
  incluyeAjuar?: boolean;
  /**
   * Cataluña: tope individual de la reducción por vivienda ya prorrateado. Solo lo pasa quien
   * conoce el valor conjunto de la vivienda y el reparto (`calcularHerenciaConjunta`); en las
   * apps individuales se deja vacío y rige el tope conjunto de 500.000 €.
   */
  limiteViviendaCataluna?: number;
  /**
   * Heredero de los Grupos III o IV que la comunidad equipara a los Grupos I y II por especial
   * vinculación (hoy solo Extremadura, arts. 20 ter y 20 quater DLeg 1/2018, con inscripción en
   * su Registro). Recibe la bonificación del Grupo II (C0146) y la mejora autonómica de la
   * reducción por parentesco de los Grupos I y II, que sustituye a la estatal de su grupo (C0374).
   * El coeficiente del art. 22 LISD sigue siendo el de su grupo. En otra comunidad o grupo no
   * hace nada.
   */
  especialVinculacion?: boolean;
}

/**
 * Clave de bonificación con la que se liquida a un heredero: la suya, o la del Grupo II si su
 * comunidad lo equipara por especial vinculación. La comparten este motor y las apps que llevan
 * su propia aritmética (estimador-impuesto-sucesiones).
 */
export function claveBonificacionEfectiva(
  grupo: string,
  ccaa: string,
  especialVinculacion: boolean | undefined,
): { clave: string; equiparado: boolean } {
  const propia = grupo === 'II-descendiente' ? 'II' : grupo;
  const equiparado =
    !!especialVinculacion && (grupo === 'III' || grupo === 'IV') && !!BONIFICACIONES_CCAA_IS[ccaa]?.especialVinculacion;
  return { clave: equiparado ? 'II' : propia, equiparado };
}

export interface ResultadoSucesiones {
  baseImponible: number;
  ajuarDomestico: number;
  baseImponibleConAjuar: number;
  reduccionParentesco: number;
  reduccionEdadMenor21: number;
  reduccionDiscapacidad: number;
  reduccionVivienda: number;
  /**
   * Por qué NO se ha aplicado la reducción por vivienda habitual, cuando se declaró una y
   * el resultado es cero. `null` si se aplicó o si no había vivienda que reducir. Quien
   * presenta el resultado —la web o el MCP— tiene que poder decirlo: un cero sin motivo se
   * lee como «no te corresponde» cuando muchas veces significa «falta un requisito».
   */
  reduccionViviendaNoAplicada: string | null;
  reduccionSeguroVida: number;
  /** Reducción autonómica aplicada sobre la BASE, antes de la tarifa (Asturias) */
  reduccionAutonomicaBase: number;
  totalReducciones: number;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficienteMultiplicador: number;
  /** Lo que la corrección del salto del art. 22.2 LISD resta de la cuota (0 si no procede o no se conoce el importe). */
  correccionSaltoCoeficiente: number;
  cuotaTributaria: number;
  bonificacionCcaa: number;
  porcentajeBonificacion: number;
  detalleBonificacion: string;
  cuotaFinal: number;
  tipoEfectivo: number;
  ccaaNombre: string;
  esForal: boolean;
  tarifaAplicada: string;
  notasCcaa: string;
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Cuota íntegra de una base liquidable según una tarifa del ISD.
 *
 * Aplica la tabla tal como la publica la ley: la CUOTA ÍNTEGRA declarada para el tramo
 * anterior, más el tipo marginal sobre el resto. Manda la tabla, que es la ley, aunque su
 * columna `cuota` arrastre los redondeos a céntimo con los que el BOE la imprime.
 *
 * ⚠️ Hasta el 11/09/2026 este comentario afirmaba que las dos lecturas —la columna `cuota` y
 * acumular los marginales a mano— divergían en euros a partir de 31.956,87 € de base
 * (+0,49 € en el tramo del 9,35 %, −1,84 € en el del 10,20 %, +12,96 € en el del 21,25 %…).
 * Esas divergencias no eran de la ley: salían de que `TARIFA_ESTATAL_IS` tenía entonces siete
 * tramos con la cuota y el tipo emparejados con umbrales que no les correspondían (hallazgo
 * 735). Con la escala del art. 21.2 bien transcrita, las dos lecturas coinciden salvo 0,0045 €
 * en el peor tramo, que es exactamente el redondeo del BOE. La función sigue valiendo por lo
 * mismo que antes —hay UNA sola forma de leer la tabla y todas las apps usan ésta (hallazgo
 * 277)—, pero no por la razón que aquí estaba escrita.
 *
 * Es público desde el 24/08/2026 porque `simulador-heredar-vivienda` tenía su propia
 * versión acumulando marginales, y dos apps fiscales de meskeIA daban cuotas íntegras
 * distintas para la misma base liquidable (hallazgo 277 del Inspector).
 */
export function calcularCuotaIntegraIS(base: number, tarifa: TramoTarifaIS[]): number {
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

/** La tarifa y los coeficientes con que se liquida una herencia en una comunidad. */
export interface TarifaYCoeficientesIS {
  tarifa: TramoTarifaIS[];
  coeficientes: Record<string, number[]>;
  /** Rótulo con la norma y el rango de tipos, para el desglose */
  tarifaAplicada: string;
  /** `true` si no es la estatal del art. 21.2 LISD */
  propia: boolean;
}

/**
 * Tarifa y coeficientes de una comunidad — FUENTE ÚNICA de la elección desde el 28/10/2026.
 *
 * Hasta esa fecha la elección era «Cataluña o la estatal», escrita igual en este motor, en
 * `estimador-impuesto-sucesiones` y en `simulador-heredar-vivienda`, y Andalucía, que tiene
 * tarifa propia (art. 37 Ley 5/2021, del 7 % al 26 %) y coeficientes propios (art. 38: 1,0 ·
 * 1,5 · 1,9), liquidaba con la estatal en las tres (cabos C0023 y C0495). Una comunidad nueva con
 * tarifa propia se declara UNA vez, en `TARIFAS_PROPIAS_CCAA_ISD` de `data/fiscal`.
 */
export function tarifaYCoeficientesIS(ccaa: string): TarifaYCoeficientesIS {
  if (ccaa === 'cataluna') {
    return {
      tarifa: TARIFA_CATALUNA_IS,
      coeficientes: COEFICIENTES_CATALUNA_IS,
      tarifaAplicada: 'Tarifa propia Cataluña (7 %–32 %)',
      propia: true,
    };
  }
  const propia = TARIFAS_PROPIAS_CCAA_ISD[ccaa];
  if (propia) {
    const tipo = (n: number) => `${n.toLocaleString('es-ES')} %`;
    const nombre = BONIFICACIONES_CCAA_IS[ccaa]?.nombre ?? ccaa;
    return {
      tarifa: propia.tarifa,
      coeficientes: propia.coeficientes,
      tarifaAplicada: `Tarifa propia de ${nombre}, ${propia.normaTarifa} (${tipo(propia.tarifa[0].tipo)}–${tipo(propia.tarifa[propia.tarifa.length - 1].tipo)})`,
      propia: true,
    };
  }
  return {
    tarifa: TARIFA_ESTATAL_IS,
    coeficientes: COEFICIENTES_IS,
    tarifaAplicada: 'Tarifa estatal régimen común, art. 21.2 LISD (7,65 %–34 %)',
    propia: false,
  };
}

function getGrupoBase(grupo: GrupoParentescoIS): 'I' | 'II' | 'III' | 'IV' {
  if (grupo === 'I-conyuge' || grupo === 'I-descendiente') return 'I';
  if (grupo === 'II' || grupo === 'II-descendiente' || grupo === 'II-ascendiente') return 'II';
  if (grupo === 'III') return 'III';
  return 'IV';
}

/**
 * Clave con la que buscar el grupo en `BONIFICACIONES_CCAA_IS`.
 *
 * `II-descendiente` (nieto ≥21) existe solo porque Cataluña le da una reducción distinta al
 * hijo; para las bonificaciones en cuota NINGUNA comunidad los distingue, así que se colapsa
 * sobre `II`. Sin esto, las 17 comunidades habrían tenido que declarar una clave más cada una,
 * y la que se olvidara dejaría al nieto sin la bonificación del 99 % —convertir un error de
 * miles de euros en otro— por el camino silencioso de `bonificaciones[grupo] === undefined`.
 */
function claveBonificacion(grupo: GrupoParentescoIS): GrupoParentescoIS {
  return grupo === 'II-descendiente' ? 'II' : grupo;
}

/**
 * Porcentaje MEDIO PONDERADO de una escala marginal de bonificación (art. 58 bis Ley 19/2010),
 * en tanto por uno.
 *
 * Cada tramo bonifica solo la porción de base imponible que le corresponde, y el resultado es
 * el conjunto dividido por la base. Por eso el porcentaje que sale casi nunca coincide con
 * ninguno de los de la tabla: una base de 250.000 € del Grupo II da 56,00 %, que es
 * (100.000 × 60 % + 100.000 × 55 % + 50.000 × 50 %) / 250.000.
 *
 * ⚠️ Va sobre la BASE IMPONIBLE, no sobre la liquidable. La ley construye la escala sobre lo
 * que se hereda, no sobre lo que queda tras las reducciones, y la diferencia no es pequeña:
 * un hijo con 250.000 € y la vivienda habitual reducida tiene 29.000 € de base liquidable, que
 * bonificarían al 60 % en vez del 56 % que le toca.
 *
 * Es público para que las apps que llevan su propia aritmética —`estimador-impuesto-sucesiones`
 * y `simulador-heredar-vivienda`— lean la misma regla que el MCP en vez de copiarla, que es de
 * donde salieron los hallazgos 277, 461 y 462.
 */
export function porcentajeBonificacionPonderada(
  baseImponible: number,
  escala: TramoEscalaBonificacionIS[],
): number {
  if (baseImponible <= 0) return 0;
  let previo = 0;
  let bonificadoPonderado = 0;
  for (const tramo of escala) {
    const anchura = Math.min(baseImponible, tramo.hasta) - previo;
    if (anchura > 0) bonificadoPonderado += anchura * (tramo.marginal / 100);
    if (baseImponible <= tramo.hasta) break;
    previo = tramo.hasta;
  }
  return bonificadoPonderado / baseImponible;
}

function aplicarBonificacionIS(
  cuotaTributaria: number,
  baseLiquidable: number,
  grupo: GrupoParentescoIS,
  ccaa: string,
  baseImponible: number,
  especialVinculacion?: boolean,
): { bonificacion: number; porcentaje: number; detalle: string } {
  const config = BONIFICACIONES_CCAA_IS[ccaa];
  if (!config) return { bonificacion: 0, porcentaje: 0, detalle: 'CCAA no configurada' };

  const { clave, equiparado } = claveBonificacionEfectiva(grupo, ccaa, especialVinculacion);
  const bGrupo: BonificacionGrupoIS | undefined = config.bonificaciones[clave];
  if (!bGrupo) return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación para este grupo' };
  if (equiparado && config.especialVinculacion) {
    const r = aplicarBonificacionIS(cuotaTributaria, baseLiquidable, 'II', ccaa, baseImponible);
    return { ...r, detalle: `${r.detalle}, como Grupos I y II por especial vinculación (${config.especialVinculacion.norma})` };
  }

  /**
   * Reducción adicional en BASE (Asturias). Aquí solo se rotula: restarla es cosa del paso 6.bis
   * de `calcularSucesion`, porque una reducción en base entra antes de la tarifa.
   *
   * Hasta el 24/08/2026 esta rama era el ÚNICO sitio donde `reduccionBase` se leía en todo el
   * calculador, así que la respuesta imprimía «Reducción adicional en base: 300.000 €» y acto
   * seguido liquidaba sobre una base en la que esos 300.000 € seguían dentro: se contradecía a
   * sí misma. La app web sí la aplicaba desde el hallazgo 200, de modo que la misma herencia
   * daba 0,00 € en meskeia.com y 10.346,13 € por MCP (hallazgo 276 del Inspector).
   */
  if (bGrupo.reduccionBase !== undefined && bGrupo.reduccionBase > 0) {
    return { bonificacion: 0, porcentaje: 0, detalle: `Reducción adicional de ${bGrupo.reduccionBase.toLocaleString('es-ES')} € en la base (${config.nombre}), ya aplicada antes de la tarifa. Sin bonificación en cuota.` };
  }

  /**
   * Escala PONDERADA sobre la base imponible (Cataluña, art. 58 bis). Va antes que el resto
   * de ramas porque es la única que no mira la base liquidable, y confundirla con `escalonado`
   * —que sí es de tramos planos— daría un porcentaje de la tabla en vez del medio ponderado.
   */
  if (bGrupo.escalaPonderada && bGrupo.escalaPonderada.length > 0) {
    const pct = porcentajeBonificacionPonderada(baseImponible, bGrupo.escalaPonderada);
    return {
      bonificacion: cuotaTributaria * pct,
      porcentaje: pct * 100,
      detalle: `Bonificación ${formatPercentage(pct, 2)} por escala del art. 58 bis (${config.nombre})`,
    };
  }

  // Bonificación escalonada (Castilla-La Mancha, Cantabria)
  if (bGrupo.escalonado && bGrupo.escalonado.length > 0) {
    let pct = 0;
    for (const tramo of bGrupo.escalonado) {
      if (tramo.hasta !== undefined && baseLiquidable <= tramo.hasta) { pct = tramo.porcentaje; break; }
      if (tramo.desde !== undefined && baseLiquidable > tramo.desde) { pct = tramo.porcentaje; }
    }
    const bonif = cuotaTributaria * pct;
    return { bonificacion: bonif, porcentaje: pct * 100, detalle: `Bonificación escalonada ${formatPercentage(pct, 0)} (${config.nombre})` };
  }

  // Exención total por importe (Galicia: base < 1.000.000 €; Andalucía no la tiene, cabo C0495)
  if (bGrupo.exencion !== undefined && baseLiquidable < bGrupo.exencion) {
    return { bonificacion: cuotaTributaria, porcentaje: 100, detalle: `Exención total (base liquidable < ${bGrupo.exencion.toLocaleString('es-ES')} €)` };
  }

  // Exención con límite máximo (Aragón: hasta 3M€)
  if (bGrupo.porcentaje === 1 && bGrupo.limite !== null && bGrupo.limite !== undefined) {
    if (baseLiquidable <= bGrupo.limite) {
      return { bonificacion: cuotaTributaria, porcentaje: 100, detalle: `Exención total hasta ${bGrupo.limite.toLocaleString('es-ES')} € (${config.nombre})` };
    }
    return { bonificacion: 0, porcentaje: 0, detalle: `Sin bonificación (base liquidable supera el límite de ${bGrupo.limite.toLocaleString('es-ES')} €) (${config.nombre})` };
  }

  // Bonificación con tope de base (La Rioja)
  if (bGrupo.tope !== undefined && bGrupo.porcentajeMayor !== undefined) {
    const pct = baseLiquidable <= bGrupo.tope ? (bGrupo.porcentaje ?? 0) : bGrupo.porcentajeMayor;
    const bonif = cuotaTributaria * pct;
    return { bonificacion: bonif, porcentaje: pct * 100, detalle: `Bonificación ${formatPercentage(pct, 0)} (${config.nombre})` };
  }

  // Bonificación fija. Con un decimal cuando lo tiene: con `toFixed(0)` el 99,9 % de Canarias
  // se rotulaba «100%» y parecía una exención (visto al separar el `%`, 25/09/2026).
  if (bGrupo.porcentaje !== undefined && bGrupo.porcentaje > 0) {
    const bonif = cuotaTributaria * bGrupo.porcentaje;
    return { bonificacion: bonif, porcentaje: bGrupo.porcentaje * 100, detalle: `Bonificación ${formatPercentage(bGrupo.porcentaje, Math.round(bGrupo.porcentaje * 1000) % 10 === 0 ? 0 : 1)} (${config.nombre})` };
  }

  return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación autonómica para este grupo' };
}

export interface ReduccionesPersonalesIS {
  /** Reducción por parentesco: la estatal, la catalana o la mejora autonómica que la sustituye. */
  parentesco: number;
  /** Incremento por cada año por debajo de 21 (0 si una mejora autonómica sustituye la estatal). */
  edadMenor21: number;
  discapacidad: number;
  /** Norma de la mejora autonómica aplicada a la de parentesco, o `null` si rige la estatal. */
  mejoraParentesco: string | null;
  /** Norma de la mejora autonómica aplicada a la de discapacidad, o `null`. */
  mejoraDiscapacidad: string | null;
}

/**
 * Reducciones por parentesco, por edad y por discapacidad del art. 20.2.a LISD, con la tabla
 * catalana o la MEJORA autonómica que las sustituye (`MEJORAS_REDUCCIONES_CCAA_IS`) — FUENTE
 * ÚNICA desde el 22/10/2026.
 *
 * Vivía escrita tres veces —este motor, `estimador-impuesto-sucesiones` y
 * `simulador-heredar-vivienda`—, y por eso modelar las mejoras de Extremadura (arts. 17 y 18 DLeg
 * 1/2018, cabo C0371) exigía tocarla en tres sitios: se saca aquí para que la siguiente comunidad
 * que mejore una reducción se declare UNA vez, en `data/fiscal`.
 *
 * ⚠️ Una mejora SUSTITUYE a la estatal (art. 48.1.a Ley 22/2009): en Extremadura el menor de 21
 * años no suma los 3.990,72 € por año a los 500.000 €. No es una reducción propia como la de
 * Asturias, que se suma y se lee de `reduccionBase`.
 *
 * Con especial vinculación (Extremadura, arts. 20 ter y 20 quater DLeg 1/2018), el heredero de
 * los Grupos III o IV recibe la mejora de los Grupos I y II, que sustituye a la reducción estatal
 * de su grupo. El art. 20 quater.1 extiende «los beneficios fiscales que se encuentren vigentes en
 * la normativa autonómica para los grupos I y II de parentesco», sin limitarlo a la bonificación
 * (BOE-A-2018-8159, consolidado, leído el 23/10/2026). Hasta esa fecha solo se le extendía la
 * bonificación del 99 %, y un sobrino inscrito con 100.000 € pagaba 184,37 € en vez de 0
 * (cabo C0374, decisión del usuario del 23/10/2026). La escala por discapacidad del art. 18 no
 * depende del grupo, y la reducción del seguro de vida (art. 20.2.b LISD) es estatal: no cambian.
 */
export function reduccionesPersonalesIS(p: {
  ccaa: string;
  grupo: GrupoParentescoIS;
  edadHeredero?: number;
  discapacidad?: NivelDiscapacidadIS;
  /** Inscrito como persona con especial vinculación (solo surte efecto donde la comunidad la prevé). */
  especialVinculacion?: boolean;
}): ReduccionesPersonalesIS {
  const esCataluna = p.ccaa === 'cataluna';
  const mejora = MEJORAS_REDUCCIONES_CCAA_IS[p.ccaa];
  const r = (n: number) => Math.round(n * 100) / 100;

  let parentesco: number;
  let edadMenor21 = 0;
  let mejoraParentesco: string | null = null;
  const { equiparado } = claveBonificacionEfectiva(p.grupo, p.ccaa, p.especialVinculacion);
  const mejorada = mejora?.parentesco.importes[equiparado ? 'II' : p.grupo];
  if (mejora && mejorada !== undefined) {
    parentesco = mejorada;
    mejoraParentesco = equiparado ? `${mejora.parentesco.norma}, por especial vinculación` : mejora.parentesco.norma;
  } else {
    parentesco = esCataluna
      ? (REDUCCIONES_PARENTESCO_CATALUNA_IS[p.grupo] ?? 0)
      : (REDUCCIONES_PARENTESCO_IS[p.grupo] ?? 0);
    // Menor de 21 años: solo descendientes/adoptados, art. 20.2.a LISD. Cataluña tiene la misma
    // figura con importes propios —12.000 € por año con tope de 196.000 €, art. 2 Ley 19/2010—,
    // y hasta el 08/09/2026 se la saltaba entera: un nieto huérfano de 5 años perdía los
    // 192.000 € de incremento que la ley catalana le da. El tope es del TOTAL.
    const edad = p.edadHeredero;
    if (edad !== undefined && Number.isFinite(edad) && edad < 21 && p.grupo === 'I-descendiente') {
      const porAnio = esCataluna ? REDUCCION_EDAD_MENOR_21_CATALUNA_IS : REDUCCION_EDAD_MENOR_21_IS;
      const tope = esCataluna ? REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS : REDUCCION_EDAD_MENOR_21_MAX_IS;
      edadMenor21 = Math.max(0, r(Math.min(parentesco + (21 - edad) * porAnio, tope) - parentesco));
    }
  }

  const nivel = p.discapacidad ?? '0';
  let discapacidad = 0;
  let mejoraDiscapacidad: string | null = null;
  if (nivel !== '0') {
    if (mejora) {
      discapacidad = mejora.discapacidad[nivel];
      mejoraDiscapacidad = mejora.discapacidad.norma;
    } else {
      discapacidad = nivel === '65' ? REDUCCION_DISCAPACIDAD_65_IS : REDUCCION_DISCAPACIDAD_33_IS;
    }
  }

  return { parentesco, edadMenor21, discapacidad, mejoraParentesco, mejoraDiscapacidad };
}

/** Edad mínima del colateral (Grupo III) para la reducción por vivienda, art. 20.2.c LISD */
export const EDAD_MIN_COLATERAL_VIVIENDA_IS = 65;

/**
 * Reducción del art. 20.2.c LISD por vivienda habitual del causante — FUENTE ÚNICA.
 *
 * ── Por qué es pública (27/08/2026, hallazgos 461 y 462) ──────────────────────
 * La misma regla vivía escrita dos veces: aquí y en `simulador-heredar-vivienda`. Cada
 * copia envejeció por su lado y las dos daban resultados distintos para la MISMA herencia,
 * según se preguntara por la web o por la tool `calcular_sucesiones` del MCP Delegum:
 *
 *   · hermano de 40 años, Madrid, 200.000 € de vivienda habitual → 14.741,88 € en la web
 *     (que sí comprueba el art. 20.2.c) y 4.883,57 € por MCP (que se la concedía a todo el
 *     Grupo III sin mirar edad ni convivencia). Aquí acertaba la web.
 *   · cónyuge, Cataluña, 350.000 € → 12.013,29 € en la web (aplicaba la reducción ESTATAL)
 *     y 31.500,00 € por MCP (no aplicaba ninguna). Aquí no acertaba ninguno de los dos.
 *
 * ⚠️ Cataluña tiene régimen PROPIO (Ley 19/2010, arts. 17 y 19): mismo 95 %, pero el tope no
 * es el estatal de 122.606,47 € sino 500.000 € sobre el valor CONJUNTO de la vivienda, y el
 * mantenimiento es de 5 años en vez de 10.
 *
 * Hasta el 08/09/2026 esa rama devolvía 0 y lo decía —«no se calcula, y se DICE», como el
 * IGIC—, pero el aviso iba debajo de una cifra que se quedaba 23.000 € por encima de la real
 * en el caso de un hijo que hereda 250.000 € con vivienda de 180.000 €. Un aviso al pie de un
 * número falso no protege a quien se queda con el número, que es lo que hace casi todo el
 * mundo: la web tiene 93 usos con 94 s de media y nadie va a contrastarlo con la Agència
 * Tributària. Se modela con el tope catalán, que son tres cifras publicadas, no un régimen.
 */
export function evaluarReduccionVivienda(p: {
  valorVivienda?: number;
  grupo: GrupoParentescoIS;
  ccaa: string;
  edadHeredero?: number;
  convivenciaDosAnios?: boolean;
  /**
   * Cataluña: tope individual ya prorrateado, cuando quien llama conoce el valor conjunto de
   * la vivienda y el reparto entre herederos (`calcularHerenciaConjunta`). Por defecto se usa
   * el tope conjunto de 500.000 €, que es lo correcto para el heredero que se queda la
   * vivienda entera — el caso que preguntan las apps individuales.
   */
  limiteViviendaCataluna?: number;
}): { reduccion: number; noAplicada: string | null } {
  if (!p.valorVivienda || p.valorVivienda <= 0) return { reduccion: 0, noAplicada: null };

  if (p.ccaa === 'cataluna') {
    // Grupo IV y colateral no cualificado quedan fuera también aquí: el art. 17 de la Ley
    // 19/2010 enumera cónyuge, pareja estable, descendientes, ascendientes y el colateral de
    // 65 años o más que hubiera convivido los 2 años anteriores.
    if (p.grupo === 'IV') {
      return { reduccion: 0, noAplicada: 'sin parentesco: el art. 17 de la Ley 19/2010 no la contempla' };
    }
    if (p.grupo === 'III') {
      if (p.edadHeredero === undefined || p.edadHeredero < EDAD_MIN_COLATERAL_VIVIENDA_IS) {
        return { reduccion: 0, noAplicada: `pariente colateral menor de ${EDAD_MIN_COLATERAL_VIVIENDA_IS} años` };
      }
      if (!p.convivenciaDosAnios) {
        return { reduccion: 0, noAplicada: 'pariente colateral que no convivió los 2 años anteriores' };
      }
    }
    const limite = p.limiteViviendaCataluna ?? REDUCCION_VIVIENDA_MAX_CATALUNA_IS;
    return {
      reduccion: Math.min(p.valorVivienda * REDUCCION_VIVIENDA_PORC_IS, limite),
      noAplicada: null,
    };
  }

  if (p.grupo === 'IV') {
    return { reduccion: 0, noAplicada: 'sin parentesco: el art. 20.2.c LISD no la contempla' };
  }

  if (p.grupo === 'III') {
    // El colateral solo tiene derecho si además es mayor de 65 años y convivió con el
    // causante los dos años anteriores al fallecimiento (art. 20.2.c LISD).
    if (p.edadHeredero === undefined || p.edadHeredero < EDAD_MIN_COLATERAL_VIVIENDA_IS) {
      return {
        reduccion: 0,
        noAplicada: `pariente colateral menor de ${EDAD_MIN_COLATERAL_VIVIENDA_IS} años`,
      };
    }
    if (!p.convivenciaDosAnios) {
      return { reduccion: 0, noAplicada: 'pariente colateral que no convivió los 2 años anteriores' };
    }
  }

  return {
    reduccion: Math.min(p.valorVivienda * REDUCCION_VIVIENDA_PORC_IS, REDUCCION_VIVIENDA_MAX_IS),
    noAplicada: null,
  };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularSucesion(p: ParametrosSucesiones): ResultadoSucesiones {
  if (p.baseImponible <= 0) throw new Error('La base imponible debe ser mayor que cero.');
  if (!BONIFICACIONES_CCAA_IS[p.ccaa]) {
    throw new Error(`CCAA no reconocida: "${p.ccaa}". Valores válidos: ${Object.keys(BONIFICACIONES_CCAA_IS).join(', ')}`);
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const esCataluna = p.ccaa === 'cataluna';
  const ccaaInfo = BONIFICACIONES_CCAA_IS[p.ccaa];
  const esForal = ccaaInfo.regimen === 'foral';
  const grupoBase = getGrupoBase(p.grupo);
  const discapacidad = p.discapacidad ?? '0';
  const patrimonioIdx = Math.min(4, Math.max(1, p.patrimonioIdx ?? 1)) - 1;
  const patrimonioConocido =
    typeof p.patrimonioPreexistente === 'number' && Number.isFinite(p.patrimonioPreexistente) && p.patrimonioPreexistente >= 0
      ? p.patrimonioPreexistente
      : null;
  const edad = p.edadHeredero;

  // 1. Ajuar doméstico (3% de la base si se incluye)
  const ajuarDomestico = p.incluyeAjuar ? r(p.baseImponible * PORC_AJUAR_DOMESTICO_IS) : 0;
  // El seguro de vida se acumula a la porción hereditaria (art. 9.1.c LISD), fuera del ajuar
  const seguroAcumulado = p.seguroVida && p.seguroVida > 0 ? r(p.seguroVida) : 0;
  const baseConAjuar = r(p.baseImponible + ajuarDomestico + seguroAcumulado);

  // 2-4. Reducciones por parentesco, por edad (menor de 21) y por discapacidad, con la tabla
  // catalana o la mejora autonómica que sustituye a la estatal: `reduccionesPersonalesIS`.
  const personales = reduccionesPersonalesIS({
    ccaa: p.ccaa, grupo: p.grupo, edadHeredero: edad, discapacidad, especialVinculacion: p.especialVinculacion,
  });
  const reduccionParentesco = personales.parentesco;
  const reduccionEdadMenor21 = personales.edadMenor21;
  const reduccionDiscapacidad = personales.discapacidad;

  // 5. Reducción vivienda habitual — ver `evaluarReduccionVivienda`, que es la fuente única
  // de esta regla desde el 27/08/2026 y la comparten este motor y la app.
  const vivienda = evaluarReduccionVivienda({
    valorVivienda: p.viviendaHabitual,
    grupo: p.grupo,
    ccaa: p.ccaa,
    edadHeredero: edad,
    convivenciaDosAnios: p.convivenciaDosAnios,
    limiteViviendaCataluna: p.limiteViviendaCataluna,
  });
  const reduccionVivienda = r(vivienda.reduccion);

  // 6. Reducción seguro de vida (100% cónyuge/descendientes/ascendientes, tope 9.195,49 €)
  let reduccionSeguroVida = 0;
  if (seguroAcumulado > 0 && (grupoBase === 'I' || grupoBase === 'II')) {
    reduccionSeguroVida = r(Math.min(seguroAcumulado, REDUCCION_SEGURO_VIDA_MAX_IS));
  }

  // 6.bis Reducción autonómica sobre la BASE (hoy solo Asturias: 300.000 € para los Grupos I
  // y II, 50.000 € para el III). Es el único beneficio del catálogo modelado como reducción
  // en base en vez de como bonificación en cuota, y entra aquí porque va antes de la tarifa.
  //
  // La clave se colapsa con `claveBonificacion`, igual que en `aplicarBonificacionIS`: sin
  // ella, `bonificaciones['II-descendiente']` no existe en ninguna comunidad —el grupo se
  // separó solo para la escala catalana— y el NIETO de 21 o más años perdía en Asturias los
  // 300.000 € que las notas de esa misma ficha le reconocen («Grupos I y II»). Con 150.000 €
  // heredados pagaba 12.651,99 € en vez de 0 €, y con 600.000 €, 56.926,11 € de más. El
  // defecto llegaba a la tool `calcular_sucesiones` del MCP y a /api/chatgpt/sucesiones.
  // Detectado el 09/09/2026 al reparar la tanda del Inspector del 07/09, no por el Inspector:
  // sus actas cubren apps, y este motor solo se mira desde la app que lo llama.
  const reduccionAutonomicaBase = ccaaInfo.bonificaciones[claveBonificacion(p.grupo)]?.reduccionBase ?? 0;

  const totalReducciones = r(reduccionParentesco + reduccionEdadMenor21 + reduccionDiscapacidad + reduccionVivienda + reduccionSeguroVida + reduccionAutonomicaBase);
  const baseLiquidable = r(Math.max(0, baseConAjuar - totalReducciones));

  // 7. Tarifa (estatal, catalana o propia de la comunidad: `tarifaYCoeficientesIS`)
  const { tarifa, coeficientes: coefs, tarifaAplicada } = tarifaYCoeficientesIS(p.ccaa);

  const cuotaIntegra = r(calcularCuotaIntegraIS(baseLiquidable, tarifa));

  // 8. Coeficiente multiplicador
  const filaCoefs = coefs[grupoBase] ?? [1, 1, 1, 1];
  // Con el importe, el tramo sale de él y se aplica la corrección del salto del art. 22.2 LISD
  // (la cuota no puede superar la del coeficiente inferior más lo que el patrimonio pasa del
  // límite). Con solo el índice, el coeficiente entero del tramo, como hasta el 30/09/2026.
  const { coeficiente: coeficienteMultiplicador, cuotaTributaria, correccionSalto } = patrimonioConocido !== null
    ? cuotaTributariaConCorreccionIS(cuotaIntegra, filaCoefs, patrimonioConocido)
    : {
        coeficiente: filaCoefs[patrimonioIdx] ?? 1,
        cuotaTributaria: r(cuotaIntegra * (filaCoefs[patrimonioIdx] ?? 1)),
        correccionSalto: 0,
      };

  // 9. Bonificación autonómica
  // `baseConAjuar` es la base IMPONIBLE, que es sobre la que la escala catalana del art. 58 bis
  // construye su porcentaje. Las demás comunidades siguen decidiendo por la base liquidable.
  const { bonificacion, porcentaje, detalle } = aplicarBonificacionIS(cuotaTributaria, baseLiquidable, p.grupo, p.ccaa, baseConAjuar, p.especialVinculacion);
  // Se resta la bonificación REDONDEADA, que es la que se publica en `bonificacionCcaa` y la
  // que el usuario ve escrita. Restando la de dentro, el desglose no cuadraba consigo mismo por
  // un céntimo en el 0,9 % de los casos: cuota tributaria − bonificación publicada daba un
  // número distinto de la cuota final publicada. Mismo origen que el de arriba: 09/09/2026,
  // reparando en `simulador-heredar-vivienda` el desglose que no cuadraba consigo mismo.
  const bonificacionPublicada = r(bonificacion);
  const cuotaFinal = r(Math.max(0, cuotaTributaria - bonificacionPublicada));
  /**
   * ⚠️ 22/09/2026 (hallazgo 1194) — el denominador era `p.baseImponible`, que es el PARÁMETRO de
   * entrada (el valor de los bienes), no la base imponible del impuesto: el ajuar doméstico se
   * adiciona al caudal y forma parte de lo que se grava, y es lo que este mismo motor publica
   * en `baseImponibleConAjuar`. Con 80.000 € en cuentas heredados por un sobrino asturiano
   * salía un 4,13 % que no corresponde a ninguna división real —la cuota es 3306,55 € y la
   * base 82.400 €, o sea 4,01 %—, y así la tarjeta del bloque educativo de
   * `estimador-impuesto-sucesiones` publicaba un tipo distinto del que el panel de la propia
   * herramienta imprime para los mismos datos, que sí divide por la base con ajuar.
   *
   * Sin ajuar (`incluyeAjuar` ausente o false) ni seguro de vida `baseConAjuar` vale lo mismo que
   * `p.baseImponible`, así que el resto de consumidores no se mueve.
   */
  const tipoEfectivo = r(baseConAjuar > 0 ? (cuotaFinal / baseConAjuar) * 100 : 0);

  return {
    baseImponible:            r(p.baseImponible),
    ajuarDomestico,
    baseImponibleConAjuar:    baseConAjuar,
    reduccionParentesco:      r(reduccionParentesco),
    reduccionEdadMenor21:     r(reduccionEdadMenor21),
    reduccionDiscapacidad:    r(reduccionDiscapacidad),
    reduccionVivienda,
    reduccionViviendaNoAplicada: vivienda.noAplicada,
    reduccionSeguroVida,
    reduccionAutonomicaBase: r(reduccionAutonomicaBase),
    totalReducciones,
    baseLiquidable,
    cuotaIntegra,
    coeficienteMultiplicador,
    correccionSaltoCoeficiente: correccionSalto,
    cuotaTributaria,
    bonificacionCcaa:         bonificacionPublicada,
    porcentajeBonificacion:   r(porcentaje),
    detalleBonificacion:      detalle,
    cuotaFinal,
    tipoEfectivo,
    ccaaNombre:               ccaaInfo.nombre,
    esForal,
    tarifaAplicada,
    notasCcaa:                esCataluna ? `${ccaaInfo.notas} ${FISCAL_SUCESIONES_CATALUNA_META.nota}` : ccaaInfo.notas,
    // La rama catalana tiene su propio sello: se verificó el 08/09/2026 y las otras 16
    // comunidades siguen con el del módulo, que es de enero de 2025. Decirlo por separado
    // evita que un cálculo catalán presuma de una revisión que solo cubre a Cataluña.
    fuenteDatos:              esCataluna
      ? `${FISCAL_SUCESIONES_CATALUNA_META.fuente} — verificado ${FISCAL_SUCESIONES_CATALUNA_META.verificado}`
      : `${FISCAL_SUCESIONES_META.fuente} — verificado ${FISCAL_SUCESIONES_META.verificado}`,
  };
}
