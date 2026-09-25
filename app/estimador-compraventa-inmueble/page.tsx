'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorCompraventa.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, NumberInput, ResultCard, LegalNotice, DisclaimerCard, DataReference, ShareCard, RegionBadge,
  AvisoTerritorioSinIva,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, formatTipoNominal, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import { veredictoIlegibles, enumerar, faltaOFaltan, noSePudoLeer, mayuscula, enumerarNi, escritoIlegible, type Veredicto } from '@/lib/sondeoIlegibles';
import { IVA_INMUEBLES_2025, FISCAL_INMUEBLES_META, PLUSVALIA_MUNICIPAL_META, TRAMOS_GANANCIAS_PATRIMONIALES_2025, calcularGananciaInmueble, PLAZO_ITP, PORCENTAJES_IVA } from '@/data/fiscal';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  calcularNotario,
  estimarFacturaNotarial,
  calcularRegistro,
  calcularPlusvaliaMunicipal,
  elegirTipoITP,
  importeITP,
  TipoElegido,
  ENLACE_CATASTRO,
  // Dos rangos desde el 24/09/2026 (hallazgos 1582 y 1583): el País Vasco grava la vivienda al
  // 4 % y el resto al 7 %, y la exención del AJD es solo de la primera transmisión de vivienda.
  // Este estimador es de VIVIENDA, así que sus textos citan el rango de la vivienda.
  RANGO_ITP_VIVIENDA,
  RANGO_AJD_VIVIENDA,
  RANGO_AJD_OTROS,
  tipoGeneralITP,
  tipoAJD,
  describirSubidaITP,
  type ObjetoTransmision,
  BANDA_PRECIO_VIVIENDA,
  horquillaFedatarios,
  horquillaEdadJoven,
  notariaDeLibreAcuerdo,
  LIMITE_ARANCEL_NOTARIAL,
  TERRITORIOS_SIN_IVA,
  sumarLineasVisibles, superaElTope } from '@/data/itp-ccaa';
import { ESCALA_RECARGO_EXTEMPORANEO } from '@/lib/calculadoras/recargoPresentacionTardia';
import {
  HORQUILLA_GASTOS_COMPRAVENTA,
  GESTORIA_TIPICA,
  HORQUILLA_GESTORIA,
  PREGUNTA_NO_SUJECION,
  RESPUESTA_NO_SUJECION,
} from './metadata';

/**
 * La edad tope del tipo joven se LEE de la tabla, igual que en el FAQPage de metadata.ts.
 *
 * Es el dato que el 27/08/2026 se corrigió aquí y no en el <script> del JSON-LD, de modo que
 * la pantalla y la señal que leen los asistentes de IA llevaban desde entonces diciendo cosas
 * distintas (hallazgos 719 y 720). Ahora las dos bocas llaman a la misma función.
 */
const EDAD_JOVEN = horquillaEdadJoven();

// ===== TIPOS =====
type TipoInmueble = 'vivienda' | 'garaje' | 'trastero' | 'local' | 'nave' | 'terreno';
type TipoTransmision = 'segunda-mano' | 'primera-mano';
type PerfilComprador = 'general' | 'joven' | 'familia-numerosa' | 'discapacidad' | 'vpo';

/**
 * Extremos de la escala del ahorro y horquilla de fedatarios, DERIVADOS de data/fiscal y
 * del arancel. Los textos que los citaban a mano (hallazgos 581, 582 y 584) contradecían
 * al motor que la propia página ejecuta tres pantallas más arriba.
 */
const TIPO_AHORRO_MIN = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
const TIPO_AHORRO_MAX = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo;
const HORQUILLA_FEDATARIOS = horquillaFedatarios(BANDA_PRECIO_VIVIENDA.min, BANDA_PRECIO_VIVIENDA.max);
/** Importe en euros SIN decimales, para cifras orientativas y ejemplos del bloque educativo */
const eurosEnteros = (n: number) => `${formatNumber(n, 0)} €`;
/** Redondeo a la decena de euros: son cifras orientativas, no una factura */
const eurosOrientativos = (n: number) => eurosEnteros(Math.round(n / 10) * 10);
/**
 * El `%` separado de la cifra por un espacio DURO (CLAUDE.md global §2, desde el 25/09/2026),
 * también en los textos que llegan escritos de data/: las notas de cada comunidad, los nombres
 * de los reducidos («bonif. 10%») o la nota de DataReference los traen pegados, o con un espacio
 * normal que deja saltar el `%` solo a la línea siguiente (hallazgo 1800). Se corrige al
 * pintarlos, sin tocar los datos, que comparten otras apps.
 */
const separarPorcentajes = (texto: string): string => texto.replace(/(\d)[ \u00A0]?%/g, '$1\u00A0%');

/**
 * Ejemplo «Carlos» del bloque educativo (obra nueva). Su IVA y su AJD salen del mismo
 * motor que la calculadora, no de la memoria: el AJD iba tecleado —«1,5% de AJD
 * (2.700 €)»— pudiendo derivarse de `ITP_CCAA.valencia.ajd`, que esta misma página usa
 * tres pantallas más arriba (hallazgo 629). Hoy coincide, así que no había ninguna cifra
 * mal; lo que faltaba era el vínculo, y el ITP de Valencia ya se movió del 10 al 9 % el
 * 01/06/2026 sin que este bloque se enterase.
 */
const EJEMPLO_OBRA_NUEVA: { ccaa: ComunidadAutonoma; precio: number } = {
  ccaa: 'valencia',
  precio: 180000,
};
const EJEMPLO_OBRA_NUEVA_IVA = EJEMPLO_OBRA_NUEVA.precio * (IVA_INMUEBLES_2025.obraNueva / 100);
/**
 * El AJD de Carlos es el de la VIVIENDA sin la rebaja de la vivienda habitual: es lo que cobra
 * la calculadora, que no pregunta si lo será. Desde el 24/09/2026 Valencia tiene los dos tipos
 * (1,4 % general y 0,1 % en vivienda habitual, Ley 13/1997, art. 14) y el ejemplo nombra los dos.
 */
const EJEMPLO_OBRA_NUEVA_AJD_TIPO = tipoAJD(EJEMPLO_OBRA_NUEVA.ccaa, { objeto: 'vivienda' }).tipo;
const EJEMPLO_OBRA_NUEVA_AJD = calcularAJD(EJEMPLO_OBRA_NUEVA.precio, EJEMPLO_OBRA_NUEVA.ccaa, { objeto: 'vivienda' });
const EJEMPLO_OBRA_NUEVA_AJD_HABITUAL = tipoAJD(EJEMPLO_OBRA_NUEVA.ccaa, {
  objeto: 'vivienda',
  viviendaHabitual: true,
});

/** El tipo de ITP del País Vasco para lo que no es vivienda, leído de la tabla (hallazgo 1582). */
const ITP_PV_NO_VIVIENDA = tipoGeneralITP('pais-vasco', 'otro', 0);

/**
 * El caso de Marta, por la misma vía que el de Carlos: DEL MOTOR, no de la memoria.
 *
 * Sus tres partidas iban tecleadas a mano y el total no sumaba su propio desglose —«unos
 * 1.193 € en notaría (685 €), registro (209 €) y gestoría (300 €)», cuando 685 + 209 + 300
 * son 1.194 €—. Es la familia del hallazgo 594, que la calculadora ya cerró con
 * `sumarLineasVisibles` (cada línea se redondea ANTES de sumarse, que es como las ve el
 * usuario) y que no había llegado al bloque educativo. Al ir a mano, además, un cambio en
 * FACTURA_NOTARIAL o en REGISTRO_CONCEPTOS las dejaba obsoletas en silencio: el hallazgo
 * 584 otra vez (hallazgo 675 del Inspector).
 *
 * Aquí las líneas se redondean al EURO y no al céntimo como en `sumarLineasVisibles`,
 * porque este bloque las escribe con `eurosEnteros`: el principio es el mismo —el total
 * suma lo que el lector tiene delante— y la unidad es la que se enseña.
 */
const EJEMPLO_MARTA: { ccaa: ComunidadAutonoma; precio: number } = {
  ccaa: 'andalucia',
  precio: 140000,
};
const EJEMPLO_MARTA_NOTARIA = Math.round(calcularNotario(EJEMPLO_MARTA.precio));
const EJEMPLO_MARTA_REGISTRO = Math.round(calcularRegistro(EJEMPLO_MARTA.precio));
const EJEMPLO_MARTA_GESTORIA = Math.round(GESTORIA_TIPICA);
const EJEMPLO_MARTA_GASTOS =
  EJEMPLO_MARTA_NOTARIA + EJEMPLO_MARTA_REGISTRO + EJEMPLO_MARTA_GESTORIA;
/** El tipo de jóvenes y el general salen de ITP_CCAA, por el mismo motivo que el arancel. */
const EJEMPLO_MARTA_TIPO_GENERAL = ITP_CCAA[EJEMPLO_MARTA.ccaa].tipoGeneral;
/** Normaliza tildes para comparar nombres de tipos reducidos (ej: «Jóvenes» → «jovenes»). */
const normalizarTexto = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * La ficha ENTERA del reducido de jóvenes, no solo su tipo.
 *
 * El ejemplo derivaba el tipo, el importe y los gastos, pero tecleaba a mano los dos
 * requisitos que lo condicionan —la edad y el tope de valor— estando los dos en esta misma
 * entrada de la tabla (hallazgo 837, la familia de los 581, 584, 629 y 719/720).
 */
const EJEMPLO_MARTA_REDUCIDO_JOVEN = ITP_CCAA[EJEMPLO_MARTA.ccaa].tiposReducidos?.find(
  // Normalizado: es la forma exacta del hallazgo 526, que obligó a exportar `normaliza` desde
  // data/itp-ccaa.ts. Hoy acertaría igual porque Andalucía escribe «Jóvenes» con esa tilde,
  // pero si el nombre cambiara el find daría undefined, el ejemplo caería al tipo GENERAL y la
  // página publicaría «el tipo reducido del 7% en lugar del tipo general del 7%. Ahorra 0 €»
  // sin que nada avisara (hallazgo 723).
  (t) => normalizarTexto(t.nombre).includes('jovenes'),
);
/**
 * El reducido se elegía por NOMBRE sin comprobar su `valorMaximo`: si Andalucía bajara el
 * tope por debajo de los 140.000 € del ejemplo, la página seguiría publicando «se aplica el
 * tipo reducido del 3,5 %» para una compra que ya no podría acogerse, con el tope viejo
 * escrito al lado. Se comprueba con la misma función que usa el motor.
 */
const EJEMPLO_MARTA_JOVEN_APLICA =
  !!EJEMPLO_MARTA_REDUCIDO_JOVEN && !superaElTope(EJEMPLO_MARTA_REDUCIDO_JOVEN, EJEMPLO_MARTA.precio);
const EJEMPLO_MARTA_TIPO_JOVEN =
  EJEMPLO_MARTA_JOVEN_APLICA && EJEMPLO_MARTA_REDUCIDO_JOVEN
    ? EJEMPLO_MARTA_REDUCIDO_JOVEN.tipo
    : EJEMPLO_MARTA_TIPO_GENERAL;
/** Tope de valor de la ficha, para enunciar el requisito sin teclearlo. */
const EJEMPLO_MARTA_TOPE = EJEMPLO_MARTA_REDUCIDO_JOVEN?.valorMaximo ?? null;
/** Edad tope, leída de la condición de la misma ficha («Menor de 35 años» → 35). */
const EJEMPLO_MARTA_EDAD_TOPE = Number(
  EJEMPLO_MARTA_REDUCIDO_JOVEN?.condiciones
    .map((c) => c.match(/(\d{2})\s*a[nñ]os/i)?.[1])
    .find(Boolean) ?? 0,
);
/** Marta cabe holgadamente bajo ese tope, como hasta ahora (29 con el tope en 35). */
const EJEMPLO_MARTA_EDAD = EJEMPLO_MARTA_EDAD_TOPE > 6 ? EJEMPLO_MARTA_EDAD_TOPE - 6 : EJEMPLO_MARTA_EDAD_TOPE;
const EJEMPLO_MARTA_ITP = EJEMPLO_MARTA.precio * (EJEMPLO_MARTA_TIPO_JOVEN / 100);
const EJEMPLO_MARTA_AHORRO =
  EJEMPLO_MARTA.precio * ((EJEMPLO_MARTA_TIPO_GENERAL - EJEMPLO_MARTA_TIPO_JOVEN) / 100);

// Inmuebles que pueden optar a tipos reducidos de ITP (solo residenciales)
const INMUEBLES_RESIDENCIALES: TipoInmueble[] = ['vivienda', 'garaje', 'trastero'];

/**
 * Qué se transmite, a efectos del ITP y del AJD: el motor lo exige desde el 24/09/2026 porque
 * el País Vasco grava la vivienda al 4 % y el resto de inmuebles al 7 %, y exime del AJD solo
 * la primera transmisión de vivienda (hallazgos 1582 y 1583).
 *  · ITP de segunda mano: solo la VIVIENDA. El garaje y el trastero se calculan aquí con SU
 *    precio, es decir sueltos, que es la misma razón por la que no son vivienda habitual
 *    (hallazgo 833); y el local, la nave y el terreno no lo son nunca.
 *  · AJD de obra nueva: la vivienda y sus anejos, porque en primera mano esta app los trata como
 *    transmitidos CON la vivienda (IVA del anejo vinculado); la exención foral alcanza a hasta
 *    dos garajes y anexos del mismo edificio (NF 1/2011 de Bizkaia, art. 58.35).
 */
const objetoITPDe = (t: TipoInmueble): ObjetoTransmision => (t === 'vivienda' ? 'vivienda' : 'otro');
const objetoAJDDe = (t: TipoInmueble): ObjetoTransmision =>
  INMUEBLES_RESIDENCIALES.includes(t) ? 'vivienda' : 'otro';

/**
 * «la comisión inmobiliaria lo bajaría» · «las mejoras lo subirían»: el verbo concuerda con el
 * SUJETO, no con el número de campos (hallazgo 1555). Es la regla de `esPlural` de
 * lib/sondeoIlegibles.ts, que no se exporta.
 */
const sujetoPlural = (partes: readonly string[]): boolean =>
  partes.length > 1 || /^(los|las)\s/i.test(partes[0] ?? '');
/**
 * Cada campo una vez. `veredictoIlegibles` pone en las DOS listas de un veredicto mixto el
 * importe que mueve la cifra hacia un lado u otro según lo que valga, y `[...menor, ...mayor]`
 * lo nombraba dos veces seguidas (hallazgo 1798).
 */
const sinRepetir = (partes: readonly string[]): string[] => Array.from(new Set(partes));
/** «Escríbelo» detrás de un importe, «Escríbelos» detrás de dos o más (hallazgo 1555). */
const escribelo = (partes: readonly string[]): string => (partes.length > 1 ? 'Escríbelos' : 'Escríbelo');

/** Cada inmueble con su artículo, para las frases que lo nombran. */
const CON_ARTICULO: Record<TipoInmueble, string> = {
  vivienda: 'una vivienda',
  garaje: 'un garaje',
  trastero: 'un trastero',
  local: 'un local comercial',
  nave: 'una nave industrial',
  terreno: 'un terreno',
};

/** Los meses completos del periodo inferior a un año, para el prorrateo del art. 107.4 TRLRHL. */
const MESES_COMPLETOS = Array.from({ length: 12 }, (_, m) => m);

// Normaliza tildes para comparar nombres de tipos reducidos (ej: "Jóvenes" → "jovenes")

interface ResultadosComprador {
  precioInmueble: number;
  impuestoTransmision: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  /** En Canarias, Ceuta y Melilla no rige el IVA: se nombra el impuesto y no se inventa cifra */
  impuestoNoCalculado: boolean;
  ajd: number;
  gastosNotario: number;
  gastosNotarioMin: number;
  gastosNotarioMax: number;
  gastosRegistro: number;
  gastosGestoria: number;
  /**
   * false cuando el texto de «Gastos de gestoría del comprador» no es un número (1191).
   * Su ResultCard se pinta bajo la guarda `> 0`, así que un importe ilegible hacía
   * DESAPARECER la línea del desglose, en la dirección contra la que avisa por escrito el
   * contrato de `elegirTipoITP`: «quien presupuesta 0 y paga 12.000 tiene un problema».
   */
  gestoriaLegible: boolean;
  /**
   * Por encima de 6.010.121,04 € el arancel no fija cantidad: el exceso es de libre acuerdo
   * con el notario (RD 1426/1989, nº 2.1; hallazgo 1599). La notaría estimada solo cubre la
   * parte reglada, así que el coste total no es definitivo.
   */
  notariaLibre: boolean;
  totalGastos: number;
  totalOperacion: number;
  /** null en primera mano (allí es IVA, no ITP) */
  tipoElegido: TipoElegido | null;
}

interface ResultadosVendedor {
  precioVenta: number;
  plusvaliaMunicipal: number;
  metodoPlusvalia: string;
  exentoPlusvalia: boolean;
  /**
   * false cuando faltan datos para calcular la plusvalía municipal (valor catastral del
   * suelo, años de tenencia o precio de compra). Hay que distinguirlo de una plusvalía de
   * 0 €: sin este flag la tarjeta pintaba «0,00 €» y ese cero entraba callado en el total
   * de gastos y en el neto, así que el vendedor leía como cifra final un importe al que le
   * falta un impuesto que sí va a pagar.
   */
  plusvaliaCalculada: boolean;
  comisionInmobiliaria: number;
  otrosGastosVenta: number;
  totalGastos: number;
  netoVendedor: number;
  valorAdquisicion: number;
  valorTransmision: number;
  gananciaPatrimonial: number;
  esPerdida: boolean;

  /** Ni ganancia ni pérdida: se vende exactamente por el valor de adquisición. */

  sinGananciaNiPerdida: boolean;
  baseImponibleIRPF: number;
  irpfGanancia: number;
  /** false mientras falte el precio de compra: entonces el 0 no es una exención */
  irpfCalculado: boolean;
  exentoIRPF: boolean;
  motivoExencion: string | null;
  /** Campos concretos sin rellenar, para no confundir «falta este dato» con «este cálculo no se hizo» */
  faltaPrecioCompra: boolean;
  /**
   * El precio de compra está escrito, se lee y es 0 (o negativo mientras el campo tiene el foco,
   * que el blur reescribe a 0 por su min={0}): no «falta», no vale. Decía «Falta el precio de
   * compra original» y «Rellena…» con el 0 a la vista (patrón 5 de la familia, hallazgo 1799).
   */
  precioCompraNoValido: boolean;
  faltaValorSuelo: boolean;
  faltaAnios: boolean;
  /**
   * Los años están escritos y se leen, pero son negativos: no «faltan», son imposibles, y el
   * aviso tiene que decirlo así (patrón de familia 5, hallazgo 1552 y hermanos).
   */
  aniosNegativos: boolean;
  /** Años = 0 sin los meses completos elegidos: el coeficiente se prorratea por ellos (1560). */
  faltanMeses: boolean;
  /**
   * La plusvalía FALTA (no se ha podido calcular) y la ganancia sí: al calcularla restará del
   * valor de transmisión (art. 35.1 LIRPF), así que la ganancia y el IRPF publicados son un
   * MÁXIMO (patrón de familia 2).
   */
  plusvaliaPendiente: boolean;
  /**
   * Los importes cuyo TEXTO el parser no ha podido leer (hallazgo 1190, ALTO).
   *
   * `parseSpanishNumberOr` devuelve 0 tanto con el campo VACÍO —donde es correcto y está
   * documentado en `lib/formatters.ts`— como con un texto ILEGIBLE, donde el usuario sí
   * escribió un dato: «193.000.00», el millar y el decimal a la estadounidense, es NaN por
   * diseño desde el 24/08/2026. El blur del NumberInput no lo corrige (solo acota lo que sí
   * parsea), así que el texto se queda en pantalla y nada delata la pérdida.
   *
   * Se distinguen uno a uno porque NO van en la misma dirección: la comisión y los otros
   * gastos de la venta minoran el valor de transmisión —al desaparecer, el neto sube—,
   * mientras los gastos de aquella compra, las mejoras, la reinversión y la hipoteca
   * pendiente reducen la ganancia o eximen de ella, así que al desaparecer el neto BAJA.
   */
  comisionLegible: boolean;
  otrosVentaLegible: boolean;
  gastosAdquisicionLegible: boolean;
  mejorasLegible: boolean;
  /** Solo se mira cuando «Voy a reinvertir» está marcado: ahí se pierde la exención del art. 38 */
  reinversionLegible: boolean;
  hipotecaLegible: boolean;
  /**
   * El octavo importe (hueco C1 del testigo de familia). Ilegible entraba como `undefined`,
   * indistinguible del vacío, y la plusvalía se liquidaba por el método objetivo aunque el
   * real fuera más barato: −84,64 € de neto en silencio en el caso del testigo. Solo cuenta
   * cuando hay plusvalía que comparar.
   */
  valorTotalLegible: boolean;
  /** Los campos de la plusvalía y de la ganancia escritos pero ilegibles, que no «faltan» (1231) */
  camposIlegibles: string[];
  /** El par catastral es imposible (suelo > total): la plusvalía real puede ser menor (1232) */
  parCatastralImposible: boolean;
  /** La reinversión deja exenta PARTE de la ganancia (art. 41 RIRPF, proporcional) */
  exencionParcial: boolean;
  /** Hacia dónde queda cada cifra real con los importes ilegibles, CALCULADO por sondeo */
  veredictoNeto: Veredicto;
  veredictoIrpf: Veredicto;
  veredictoGanancia: Veredicto;
}

// ===== CÁLCULO DEL VENDEDOR =====
/**
 * Los importes del vendedor ya leídos. Un importe ILEGIBLE entra como 0 (o `undefined` el
 * valor catastral total): es lo que publica la app, y el sondeo mide cuánto y hacia dónde se
 * movería cada cifra si ese importe tuviera el valor que el usuario quiso escribir.
 */
interface EntradaVendedor {
  precioV: number;
  /** NaN si falta o no se lee */
  precioC: number;
  /** Años enteros ya validados; NaN si faltan, no se leen o son negativos */
  anios: number;
  /** Meses completos cuando los años son 0 (prorrateo del art. 107.4 TRLRHL); si no, undefined */
  meses: number | undefined;
  valorSuelo: number;
  valorTotal: number | undefined;
  comisionPct: number;
  otrosVenta: number;
  gastosAdquisicion: number;
  mejoras: number;
  exentoPorEdad: boolean;
  /** undefined si no hay reinversión que aplicar (casilla sin marcar, no habitual o exento) */
  reinversion: { importeReinvertido: number; principalPendiente: number } | undefined;
}

/**
 * El cálculo del vendedor, puro, para poder ejecutarlo varias veces: una con lo que se lee y
 * otra por cada importe ilegible sondeado (hallazgos 1226-1232). La dirección de un aviso se
 * CALCULA con esto, no se razona: la referencia del clúster la razonaba campo a campo y
 * fallaba donde nadie lo había pensado (exención, reinversión total, ilegibles opuestos).
 */
function calcularVendedor(e: EntradaVendedor) {
  const comision = e.precioV * e.comisionPct;
  /**
   * Vendiendo por el precio de compra o por debajo no hay incremento de valor, y la no sujeción
   * del art. 104.5 TRLRHL no depende del suelo ni de los años: el motor la decide con venta −
   * compra ≤ 0. Hasta el 24/09/2026 la plusvalía quedaba «Sin calcular» sin el suelo, el neto
   * salía «(PARCIAL)» y se mandaba al recibo del IBI a por un dato que no cambia nada (patrón de
   * familia 4, hallazgos 1548, 1564 y 1572).
   */
  const sinIncremento = e.precioC > 0 && e.precioV <= e.precioC;
  /** Con años = 0 hacen falta además los meses completos, para prorratear el coeficiente (1560). */
  const periodoCompleto = Number.isFinite(e.anios) && (e.anios >= 1 || e.meses !== undefined);
  const plusvaliaCalculable = e.precioC > 0 && (sinIncremento || (e.valorSuelo > 0 && periodoCompleto));
  const resultadoPlusvalia = plusvaliaCalculable
    ? calcularPlusvaliaMunicipal({
        // Sin incremento el suelo y los años no intervienen (sale no sujeta): se pasan a 0.
        valorCatastralSuelo: e.valorSuelo > 0 ? e.valorSuelo : 0,
        aniosPropiedad: Number.isFinite(e.anios) ? e.anios : 0,
        mesesCompletos: e.meses,
        precioCompra: e.precioC,
        precioVenta: e.precioV,
        valorCatastralTotal: e.valorTotal !== undefined && e.valorTotal > 0 ? e.valorTotal : undefined,
      })
    : null;
  const plusvalia = resultadoPlusvalia ? resultadoPlusvalia.recomendado : 0;

  // Ganancia patrimonial e IRPF: motor único del art. 35 LIRPF. La plusvalía municipal y los
  // gastos de venta minoran el valor de transmisión; los impuestos y gastos de la compra lo
  // suman al valor de adquisición. Sin la gestoría del comprador: el art. 35.1 LIRPF solo
  // descuenta los gastos «satisfechos por el transmitente» (Inspector, 20/08/2026).
  const g = calcularGananciaInmueble({
    precioVenta: e.precioV,
    precioCompra: e.precioC > 0 ? e.precioC : 0,
    gastosAdquisicion: e.gastosAdquisicion,
    mejoras: e.mejoras,
    gastosTransmision: comision + e.otrosVenta,
    plusvaliaMunicipal: plusvalia,
    exentoPorEdad: e.exentoPorEdad,
    reinversion: e.reinversion,
  });
  // Sin precio de compra no hay ganancia que calcular: el IRPF queda a 0, pero ese 0 NO es
  // una exención, es un dato que falta (hallazgo 428).
  const hayDatosGanancia = e.precioC > 0;
  const irpf = hayDatosGanancia ? g.cuotaIRPF : 0;
  const totalGastos = sumarLineasVisibles(plusvalia, comision, e.otrosVenta, irpf);
  return {
    comision,
    resultadoPlusvalia,
    plusvalia,
    g,
    hayDatosGanancia,
    irpf,
    totalGastos,
    neto: e.precioV - totalGastos,
    /** Con signo: negativa si hay pérdida. 0 sin precio de compra. */
    ganancia: hayDatosGanancia ? g.ganancia : 0,
  };
}

/**
 * El caso de Ana (bloque educativo), por el MISMO cálculo que la pestaña Vendedor.
 *
 * Afirmaba «su ganancia patrimonial es de 62.500 €» y dos frases después que Ana «además paga
 * la plusvalía municipal …, que también minora el valor de transmisión»: la ganancia es 62.500
 * MENOS esa plusvalía, y con esos datos la calculadora rotula 62.500 «Ganancia patrimonial
 * (máximo)» (hallazgo 1802, patrón 2 de la familia). Iba tecleada, que es la familia de los
 * hallazgos 629 y 675. Ahora el ejemplo trae el valor catastral del suelo que la plusvalía
 * necesita y todas sus cifras salen de `calcularVendedor`.
 */
const EJEMPLO_ANA = {
  precioVenta: 250000,
  precioCompra: 180000,
  anios: 8,
  valorSuelo: 60000,
  comisionPct: 3,
} as const;
const EJEMPLO_ANA_CALCULO = calcularVendedor({
  precioV: EJEMPLO_ANA.precioVenta,
  precioC: EJEMPLO_ANA.precioCompra,
  anios: EJEMPLO_ANA.anios,
  meses: undefined,
  valorSuelo: EJEMPLO_ANA.valorSuelo,
  valorTotal: undefined,
  comisionPct: EJEMPLO_ANA.comisionPct / 100,
  otrosVenta: 0,
  gastosAdquisicion: 0,
  mejoras: 0,
  exentoPorEdad: false,
  reinversion: undefined,
});

// ===== CONSTANTES =====
const COMUNIDADES: { value: ComunidadAutonoma; label: string }[] = [
  { value: 'andalucia', label: 'Andalucía' },
  { value: 'aragon', label: 'Aragón' },
  { value: 'asturias', label: 'Asturias' },
  { value: 'baleares', label: 'Islas Baleares' },
  { value: 'canarias', label: 'Canarias' },
  { value: 'cantabria', label: 'Cantabria' },
  { value: 'castilla-leon', label: 'Castilla y León' },
  { value: 'castilla-mancha', label: 'Castilla-La Mancha' },
  { value: 'cataluna', label: 'Cataluña' },
  { value: 'valencia', label: 'Comunidad Valenciana' },
  { value: 'extremadura', label: 'Extremadura' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'madrid', label: 'Comunidad de Madrid' },
  { value: 'murcia', label: 'Región de Murcia' },
  { value: 'navarra', label: 'Navarra' },
  { value: 'pais-vasco', label: 'País Vasco' },
  { value: 'rioja', label: 'La Rioja' },
  { value: 'ceuta', label: 'Ceuta' },
  { value: 'melilla', label: 'Melilla' },
];

// El grupo determina la jerarquía VISUAL del selector, no la fiscal: la vivienda es
// el caso principal de esta calculadora y ocupa su propio bloque; el resto se ofrece
// como alcance secundario con derivación a su app especializada.
const TIPOS_INMUEBLE: { value: TipoInmueble; label: string; icon: string; grupo: 'principal' | 'anejo' | 'comercial' }[] = [
  { value: 'vivienda', label: 'Vivienda (piso o casa)', icon: '🏠', grupo: 'principal' },
  // Anejos residenciales (IVA 10% si se transmiten con la vivienda)
  { value: 'garaje', label: 'Garaje/Parking', icon: '🚗', grupo: 'anejo' },
  { value: 'trastero', label: 'Trastero', icon: '📦', grupo: 'anejo' },
  // Comerciales/Industriales y suelo (IVA 21%)
  { value: 'local', label: 'Local comercial', icon: '🏪', grupo: 'comercial' },
  { value: 'nave', label: 'Nave industrial', icon: '🏭', grupo: 'comercial' },
  { value: 'terreno', label: 'Terreno', icon: '🌍', grupo: 'comercial' },
];

/**
 * Derivación a la calculadora especializada de cada tipo.
 *
 * Este estimador es el hub del clúster y cubre el caso general, pero cada tipo de
 * inmueble tiene ramas fiscales que aquí se simplifican (renuncia a la exención de
 * IVA, exención del suelo rústico, IVA del anejo independiente…). En lugar de
 * duplicar esas ramas, se avisa del matiz y se enlaza a la app que sí lo calcula.
 */
const DERIVACIONES: Partial<Record<TipoInmueble, { url: string; nombre: string; matiz: string }[]>> = {
  garaje: [{
    url: '/simulador-gastos-compraventa-garaje/',
    nombre: 'Simulador de gastos de compraventa de garaje',
    matiz: `en obra nueva distingue el garaje transmitido con la vivienda (IVA ${formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}\u00A0%, hasta 2 plazas) del garaje independiente (IVA ${formatNumber(PORCENTAJES_IVA.general, 0)}\u00A0%). Aquí se aplica siempre el ${formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}\u00A0%.`,
  }],
  trastero: [{
    url: '/simulador-gastos-compraventa-trastero/',
    nombre: 'Simulador de gastos de compraventa de trastero',
    matiz: `en obra nueva distingue el trastero transmitido con la vivienda (IVA ${formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}\u00A0%) del trastero independiente (IVA ${formatNumber(PORCENTAJES_IVA.general, 0)}\u00A0%). Aquí se aplica siempre el ${formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}\u00A0%.`,
  }],
  local: [{
    url: '/simulador-gastos-compraventa-local-comercial/',
    nombre: 'Simulador de gastos de compra de local comercial',
    matiz: 'contempla la renuncia a la exención de IVA con inversión del sujeto pasivo (art. 20.Dos LIVA) cuando comprador y vendedor son empresarios con derecho a deducción. Aquí la segunda mano se calcula siempre por ITP.',
  }],
  nave: [{
    url: '/simulador-gastos-compraventa-nave-industrial/',
    nombre: 'Simulador de gastos de compra de nave industrial',
    matiz: 'contempla la renuncia a la exención de IVA con inversión del sujeto pasivo (art. 20.Dos LIVA) entre empresarios. Aquí la segunda mano se calcula siempre por ITP.',
  }],
  terreno: [
    {
      url: '/simulador-gastos-compraventa-terreno-rustico/',
      nombre: 'Simulador de gastos de compra de finca rústica',
      matiz: 'el suelo rústico está exento de IVA (art. 20.Uno.20º LIVA): paga ITP incluso cuando el vendedor es un empresario, y no genera plusvalía municipal, porque el IIVTNU solo grava suelo urbano.',
    },
    {
      url: '/simulador-gastos-compraventa-solar/',
      nombre: 'Simulador de gastos de compra de solar',
      matiz: `en el suelo edificable el impuesto depende de quién vende: IVA ${formatNumber(PORCENTAJES_IVA.general, 0)}\u00A0% + AJD si vende un promotor o empresario, ITP si vende un particular.`,
    },
  ],
};

const PERFILES_COMPRADOR: { value: PerfilComprador; label: string }[] = [
  { value: 'general', label: 'General (sin bonificaciones)' },
  { value: 'joven', label: 'Joven (< 35 años)' },
  { value: 'familia-numerosa', label: 'Familia numerosa' },
  { value: 'discapacidad', label: 'Persona con discapacidad' },
  { value: 'vpo', label: 'Vivienda de Protección Oficial' },
];

export default function SimuladorCompraventaPage() {
  // Estado del formulario
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoInmueble, setTipoInmueble] = useState<TipoInmueble>('vivienda');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [perfilComprador, setPerfilComprador] = useState<PerfilComprador>('general');
  const [comisionInmobiliaria, setComisionInmobiliaria] = useState('3');
  // La gestoría por defecto es la MISMA que entra en HORQUILLA_GASTOS_COMPRAVENTA: si las
  // dos se separaran, la horquilla publicada dejaría de contener lo que la app suma.
  const [gastosGestoria, setGastosGestoria] = useState(String(GESTORIA_TIPICA));

  // Datos del vendedor (para plusvalía)
  const [precioCompraOriginal, setPrecioCompraOriginal] = useState('');
  const [aniosPropiedad, setAniosPropiedad] = useState('');
  /** Meses completos cuando se vende antes de cumplir el año ('' = sin elegir). */
  const [mesesCompletos, setMesesCompletos] = useState('');
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState('');
  const [valorCatastralTotal, setValorCatastralTotal] = useState('');
  const [vendedorMayor65, setVendedorMayor65] = useState(false);
  const [esViviendaHabitual, setEsViviendaHabitual] = useState(true);

  // Datos del vendedor que corrigen el valor de adquisición (art. 35.1 LIRPF)
  const [gastosAdquisicion, setGastosAdquisicion] = useState('');
  const [mejoras, setMejoras] = useState('');
  const [otrosGastosVenta, setOtrosGastosVenta] = useState('');
  /**
   * Cómo se pagó AQUELLA compra, para «Estimar por mí» (hallazgo 1794). El botón suponía
   * siempre segunda mano (ITP) y quien compró obra nueva pagó IVA + AJD: en 200.000 € en Madrid
   * son 9.500 € más de valor de adquisición, y quedarse corto ahí infla la ganancia y el IRPF.
   */
  const [regimenCompraOriginal, setRegimenCompraOriginal] = useState<TipoTransmision>('segunda-mano');

  // Exención por reinversión en vivienda habitual (art. 38 LIRPF)
  const [reinvierte, setReinvierte] = useState(false);
  const [importeReinversion, setImporteReinversion] = useState('');
  const [hipotecaPendiente, setHipotecaPendiente] = useState('');

  // Pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState<'comprador' | 'vendedor'>('comprador');

  /**
   * ¿El texto de un campo de dinero se puede LEER? (hallazgo 1190, ALTO)
   *
   * Vacío es legible —y vale 0, que es lo correcto y lo que documenta `lib/formatters.ts`—;
   * lo que no es un número, no. `parseSpanishNumberOr` no distingue los dos casos y devuelve
   * 0 en ambos, así que los siete campos de dinero de esta página descartaban en silencio un
   * dato que el usuario sí había escrito. Es el mismo helper que las hermanas del clúster
   * (garaje, trastero, local-comercial) tienen desde el hallazgo 773.
   */
  const esLegible = (texto: string) =>
    texto.trim() === '' || Number.isFinite(parseSpanishNumber(texto));

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    // Sobre el precio que se PINTA, al céntimo: «0,004» se pinta «0,00 €» y publicaba un desglose
    // entero sobre un precio que se ve como cero (hallazgo 1601, decisión común de la familia).
    if (!Number.isFinite(precio) || Math.round(precio * 100) <= 0) return null;

    // Se acota aquí y no solo en el blur del NumberInput: mientras el campo tiene el foco,
    // un importe negativo se sumaba al total y su tarjeta ni se pintaba (guard > 0).
    const gestoria = Math.max(0, parseSpanishNumberOr(gastosGestoria));
    /** Y un importe ILEGIBLE tampoco es un cero: es un dato que falta (hallazgo 1191). */
    const gestoriaLegible = esLegible(gastosGestoria);

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    let impuestoNoCalculado = false;
    /** Qué tipo de ITP se ha aplicado y cuáles NO se han podido comprobar */
    let tipoElegido: TipoElegido | null = null;

    // Determinar si es inmueble residencial (para IVA y tipos reducidos)
    const esResidencial = INMUEBLES_RESIDENCIALES.includes(tipoInmueble);
    /**
     * ¿La operación PUEDE ser la vivienda habitual del comprador?
     *
     * No es lo mismo que `esResidencial`: un garaje o un trastero SUELTOS son residenciales
     * a efectos del IVA del anejo vinculado (art. 91.Uno.1.7.º LIVA) y no son vivienda
     * habitual NUNCA. Mezclar las dos preguntas en la misma variable dejaba entrar a los dos
     * anejos en los tipos reducidos de ITP reservados a la vivienda habitual y la cuota
     * salía a la mitad (hallazgo 833: garaje en Andalucía con perfil Joven, 4.900 € en vez
     * de 9.800 €). Es lo que ya pasan las dos apps hermanas —`simulador-gastos-compraventa-
     * garaje` y `-trastero`— con el comentario «un garaje suelto NO lo es nunca».
     */
    const puedeSerViviendaHabitual = tipoInmueble === 'vivienda';

    const territorioSinIva = TERRITORIOS_SIN_IVA[ccaa];

    if (tipoTransmision === 'primera-mano') {
      if (territorioSinIva) {
        // Allí no se devenga IVA sino IGIC o IPSI: se nombra el impuesto que corresponde y
        // no se inventa cifra. El aviso ya estaba en pantalla desde c47189ca; lo que faltaba
        // era que el cálculo se enterase, y el total se sumaba el IVA que el aviso negaba.
        tipoImpuesto = territorioSinIva.impuesto;
        impuestoNoCalculado = true;
      } else {
        // IVA desde data/fiscal, no desde un literal: así un cambio de tipo llega aquí
        tipoImpuesto = 'IVA';
        // Cada rama lee SU constante, aunque hoy dos valgan lo mismo. La vivienda tributa
        // por `obraNueva` y el anejo —garaje de hasta dos plazas y trastero transmitidos
        // con ella— por `anejoVinculado` (art. 91.Uno.1.7º LIVA), que es la que ya usan las
        // apps de garaje y trastero y lib/calculadoras/gastosCompraInmueble.ts desde el
        // hallazgo 641. Aquí la rama del anejo se calculaba con la constante de la VIVIENDA:
        // ninguna cifra salía mal porque ambas valen 10, pero existen separadas justamente
        // para poder divergir, y el día que lo hicieran esta app se quedaba atrás sin que
        // nada avisara (hallazgo 674 del Inspector).
        porcentaje = tipoInmueble === 'vivienda'
          ? IVA_INMUEBLES_2025.obraNueva
          : esResidencial
            ? IVA_INMUEBLES_2025.anejoVinculado
            // El suelo edificable va al tipo GENERAL del art. 90 LIVA, no al del LOCAL
            // comercial: hoy los dos valen 21, pero son datos distintos (hallazgo 770).
            : PORCENTAJES_IVA.general;
        impuesto = precio * (porcentaje / 100);
      }
    } else {
      // ITP para segunda mano
      const datosCcaa = ITP_CCAA[ccaa];

      // Los tipos reducidos exigen condiciones que hay que comprobar una a una: antes se
      // aplicaba el primero que casara por nombre mirando solo su valorMaximo, y en Madrid
      // eso daba un ITP del 0 % por un tipo reservado a municipios de menos de 2.500
      // habitantes que la app no pregunta. `viviendaHabitual` solo se da por cierta cuando
      // el inmueble es una VIVIENDA; en garaje, trastero, local, nave o terreno esa
      // condición no se cumple nunca (ver `puedeSerViviendaHabitual` arriba).
      //
      // Y al motor NO se le pasa un perfil que el usuario no puede ver ni cambiar: el
      // selector de perfil solo se pinta con inmueble residencial (`esInmuebleResidencial`),
      // pero su estado sobrevivía al cambio de tipo de inmueble. Quien miraba una vivienda
      // como «Joven» y pasaba a «Local comercial» se llevaba el aviso «Podrías pagar menos»
      // ofreciéndole un tipo con el requisito «Vivienda habitual» impreso al lado —que un
      // local no cumple nunca— y sin ningún control en pantalla para deshacerlo (hallazgo
      // 627). `elegirTipoITP` ya descarta por `viviendaHabitual` la rama
      // `alAlcanceDeCualquiera`, pero no la de `candidatos → noComprobables`, que es
      // justo la que alimenta ese aviso: el filtro tiene que estar aquí.
      const perfilEfectivo: PerfilComprador = esResidencial ? perfilComprador : 'general';
      const elegido = elegirTipoITP(ccaa, perfilEfectivo, precio, {
        viviendaHabitual: puedeSerViviendaHabitual,
        objeto: objetoITPDe(tipoInmueble),
      });
      tipoElegido = elegido;
      impuesto = importeITP(precio, ccaa, elegido);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva el importe no es un porcentaje plano del
      // precio, así que mostrar el tipo nominal contradiría a la cifra de al lado.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
    }

    // AJD: Solo aplica en primera mano (junto con IVA). En segunda mano se paga ITP, no AJD
    // El AJD en segunda mano solo aplicaría sobre la escritura de hipoteca (no sobre la compraventa)
    // Sin `viviendaHabitual`: la app no pregunta si lo será, y Valencia la grava al 0,1 % frente
    // al 1,4 % general. Se cobra el general y la tarjeta del AJD enseña la rebaja (24/09/2026).
    const ajd =
      tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa, { objeto: objetoAJDDe(tipoInmueble) }) : 0;

    const notaria = estimarFacturaNotarial(precio);

    const notario = notaria.medio;
    const registro = calcularRegistro(precio);
    // Nota: La comisión inmobiliaria la paga el vendedor, no el comprador

    // Se suman las líneas YA redondeadas al céntimo, que es como las ve el usuario: el
    // total redondeaba la suma exacta y no cuadraba con el desglose de encima por un
    // céntimo, en ambos sentidos (hallazgo 594).
    const totalGastos = sumarLineasVisibles(impuesto, ajd, notario, registro, gestoria);

    return {
      precioInmueble: precio,
      impuestoTransmision: impuesto,
      tipoImpuesto,
      porcentajeImpuesto: porcentaje,
      impuestoNoCalculado,
      ajd,
      gastosNotario: notario,
      gastosNotarioMin: notaria.min,
      gastosNotarioMax: notaria.max,
      gastosRegistro: registro,
      gastosGestoria: gestoria,
      gestoriaLegible,
      notariaLibre: notariaDeLibreAcuerdo(precio),
      totalGastos,
      totalOperacion: sumarLineasVisibles(precio, totalGastos),
      tipoElegido,
    };
  }, [precioVenta, ccaa, tipoInmueble, tipoTransmision, perfilComprador, gastosGestoria]);

  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioVenta);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    // Los años se leen del STRING, no del número: «0» es un dato VÁLIDO —el inmueble
    // revendido antes de cumplir el año, que tributa con el coeficiente de «Menos de 1
    // año» de COEFICIENTES_IIVTNU_2025 prorrateado por meses completos (hallazgo 1560)— y lo
    // que impide calcular es el campo VACÍO. Con `parseInt(aniosPropiedad) || 0` los dos
    // valían 0: el 0 explícito dejaba la plusvalía «Sin calcular» y fuera del neto, y en
    // cuanto el blur del NumberInput reescribía el campo a «1» por su min={1} se liquidaba
    // con el coeficiente del año 1 (0,13), es decir DE MENOS. Los dos caminos infravaloran
    // un impuesto del vendedor (hallazgo 672 del Inspector; este hub del clúster se quedó
    // fuera de la reparación que ya tienen local-comercial, garaje y trastero).
    // Un año NEGATIVO no se acota a 0: se rechaza. Acotarlo lo convertiría en una reventa
    // antes del año y liquidaría un impuesto a partir de un dato imposible.
    const aniosTexto = aniosPropiedad.trim();
    /**
     * ⚠️ 13/09/2026 — la guarda era `Math.trunc(parseSpanishNumber(texto)) >= 0`, y
     * `Math.trunc(-0,5)` devuelve **-0**, con `-0 >= 0` igual a `true`: el entero «-1» se
     * rechazaba pero el decimal «-0,5» se aceptaba y liquidaba la plusvalía con el
     * coeficiente de «menos de 1 año» (0,14), presentando el neto como definitivo a partir
     * de un dato imposible. El mismo signo recibía dos tratamientos distintos (hallazgo 764).
     * Se decide sobre el valor SIN truncar, y `Object.is` es lo único que distingue -0 de 0.
     */
    const aniosBruto = aniosTexto === '' ? NaN : parseSpanishNumber(aniosTexto);
    const aniosNegativo = aniosBruto < 0 || Object.is(aniosBruto, -0);
    const anios = Math.trunc(aniosBruto);
    const aniosDisponibles = Number.isFinite(anios) && !aniosNegativo;
    /**
     * Por debajo del año el art. 107.4 TRLRHL prorratea el coeficiente anual por los meses
     * completos, así que con años = 0 hacen falta los meses: mientras no se elijan faltan, como
     * cualquier dato vacío (hallazgo 1560). Hasta el 24/09/2026 se aplicaba el coeficiente
     * ENTERO, por encima de lo que la ley permite para cualquier reventa dentro del año.
     */
    const meses = aniosDisponibles && anios === 0 && mesesCompletos !== '' ? Number(mesesCompletos) : undefined;
    const valorSuelo = parseSpanishNumber(valorCatastralSuelo);
    const valorTotal = parseSpanishNumber(valorCatastralTotal);

    // Al céntimo, como el comprador: un precio de venta que se pinta 0,00 € no es un precio (1601).
    if (!Number.isFinite(precioV) || Math.round(precioV * 100) <= 0) return null;

    // Se acota aquí y no solo en el blur del NumberInput: mientras el campo tiene el foco,
    // un importe negativo se restaba de totalGastos y su tarjeta ni se pintaba (guard > 0),
    // así que el neto del vendedor subía por encima del real sin ninguna línea que lo
    // explicara. Mismo defecto que d787b81b ya acotó en la gestoría del comprador arriba,
    // sin propagarlo a la partida gemela (hallazgos 476, 477).
    const comisionPct = Math.max(0, parseSpanishNumberOr(comisionInmobiliaria)) / 100;
    // Aquí se leía `const gestoria = parseSpanishNumberOr(gastosGestoria)` y no se usaba en
    // ningún punto: la gestoría de ese campo la paga el COMPRADOR y el art. 35.1 LIRPF no la
    // admite en la ganancia del vendedor (ver la llamada al motor). Se retiró el 23/09/2026
    // en vez de guardarla con `esLegible`: vigilar un importe que no mueve nada es ruido (C2).
    const otrosVenta = Math.max(0, parseSpanishNumberOr(otrosGastosVenta));
    /**
     * Los seis importes del vendedor que `parseSpanishNumberOr` convertía en 0 sin distinguir
     * el campo vacío del ilegible (hallazgo 1190). El caso caro es la reinversión: con el
     * importe no leído, `importeTotalObtenido` sale del lado malo de la guarda del motor y la
     * exención del art. 38 LIRPF se pierde ENTERA —8.910 € en el caso del acta— mientras el
     * neto se sigue rotulando «Lo que realmente recibes».
     */
    const comisionLegible = esLegible(comisionInmobiliaria);
    const otrosVentaLegible = esLegible(otrosGastosVenta);
    const gastosAdquisicionLegible = esLegible(gastosAdquisicion);
    const mejorasLegible = esLegible(mejoras);
    const reinversionLegible = esLegible(importeReinversion);
    const hipotecaLegible = esLegible(hipotecaPendiente);
    const valorTotalLegible = esLegible(valorCatastralTotal);

    /**
     * Las dos exenciones de la ganancia —mayores de 65 (art. 33.4.b LIRPF) y reinversión (art. 38
     * LIRPF)— son de la VIVIENDA habitual. Hasta el 24/09/2026 se aplicaban a un local, una nave
     * o un terreno, porque «Es mi vivienda habitual» venía marcada por defecto sea cual sea el
     * inmueble y aquí no se miraba el tipo: 19.534 € de IRPF de menos en el caso del acta
     * (hallazgo 1553, ALTO). Es lo que el comprador ya resolvía (`puedeSerViviendaHabitual`,
     * hallazgo 833), lo que las hermanas garaje, trastero y local no aplican nunca y lo que el
     * JSON-LD de esta página afirma. Las casillas ya solo se pintan con «Vivienda».
     */
    const puedeSerViviendaHabitual = tipoInmueble === 'vivienda';
    const exentoIRPF = puedeSerViviendaHabitual && vendedorMayor65 && esViviendaHabitual;
    const puedeReinvertir = puedeSerViviendaHabitual && esViviendaHabitual && reinvierte && !exentoIRPF;
    const entrada: EntradaVendedor = {
      precioV,
      precioC,
      anios: aniosDisponibles ? anios : NaN,
      meses,
      valorSuelo,
      valorTotal: valorTotal > 0 ? valorTotal : undefined,
      comisionPct,
      otrosVenta,
      gastosAdquisicion: Math.max(0, parseSpanishNumberOr(gastosAdquisicion)),
      mejoras: Math.max(0, parseSpanishNumberOr(mejoras)),
      exentoPorEdad: exentoIRPF,
      // parseSpanishNumberOr y no parseSpanishNumber: los dos campos son OPCIONALES y quien
      // vende sin hipoteca pendiente deja el segundo vacío. Con parseSpanishNumber eso daba
      // NaN y la exención del art. 38 LIRPF no se aplicaba (el último rincón del NaN que
      // 2067ddbe dio por barrido).
      reinversion: puedeReinvertir
        ? {
            importeReinvertido: Math.max(0, parseSpanishNumberOr(importeReinversion)),
            principalPendiente: Math.max(0, parseSpanishNumberOr(hipotecaPendiente)),
          }
        : undefined,
    };
    const r = calcularVendedor(entrada);
    const rp = r.resultadoPlusvalia;
    const plusvaliaCalculada = rp !== null;
    const exentoPlusvalia = rp ? rp.exento : false;
    let metodoPlusvalia = 'No calculada';
    if (rp) {
      metodoPlusvalia = rp.exento
        ? 'No sujeta (sin incremento de valor)'
        : rp.parCatastralImposible
          ? 'Método objetivo (el valor catastral del suelo no puede superar al total, que ya lo incluye: revisa los dos campos del recibo del IBI)'
          : !rp.metodoRealDisponible
            ? // «falta el valor catastral total» era falso cuando el usuario lo había escrito
              // y lo seguía viendo en el campo (hueco C1): no falta, no se ha podido leer.
              valorTotalLegible
              ? 'Método objetivo (falta el valor catastral total para comparar)'
              : 'Método objetivo, y puede salir más barata: el valor catastral total no se ha podido leer, así que no se compara con el método real. Escríbelo con coma decimal (1.234,56).'
            : rp.metodoReal < rp.metodoObjetivo
              ? 'Método real (más favorable)'
              : 'Método objetivo (más favorable)';
    }

    // Escrito pero ilegible no es «falta» (hallazgo 1231): se nombra aparte. Y con la plusvalía
    // ya resuelta (sin incremento no hace falta el suelo ni los años, patrón 4) esos dos campos
    // no bloquean nada: nombrarlos marcaría «(PARCIAL)» un neto que es definitivo.
    const plusvaliaResuelta = rp !== null;
    const ilegibleTexto = (t: string) => escritoIlegible(t, parseSpanishNumber);
    const camposIlegibles = [
      !plusvaliaResuelta && ilegibleTexto(valorCatastralSuelo) ? 'el valor catastral del suelo' : null,
      !plusvaliaResuelta && ilegibleTexto(aniosPropiedad) ? 'los años de tenencia' : null,
      ilegibleTexto(precioCompraOriginal) ? 'el precio de compra original' : null,
    ].filter((x): x is string => x !== null);

    /**
     * El SONDEO de los importes ilegibles: el cálculo se repite con cada uno a un valor
     * pequeño y a uno grande, y `veredictoIlegibles` dice hacia dónde queda cada cifra real.
     * Solo se sondea lo que entra en el cálculo: la reinversión y la hipoteca, con la casilla
     * marcada y sin exención por edad (antes la exención por edad publicaba un «TECHO» y un
     * neto MAYOR con una cuota que no podía moverse, hallazgo 1227).
     */
    const sondas: { nombre: string; pequeno: EntradaVendedor; grande: EntradaVendedor }[] = [];
    if (!comisionLegible) {
      sondas.push({
        nombre: 'la comisión inmobiliaria',
        pequeno: { ...entrada, comisionPct: 0.0001 },
        grande: { ...entrada, comisionPct: 0.1 },
      });
    }
    if (!otrosVentaLegible) {
      sondas.push({
        nombre: 'los otros gastos de la venta',
        pequeno: { ...entrada, otrosVenta: 1 },
        grande: { ...entrada, otrosVenta: precioV },
      });
    }
    if (!gastosAdquisicionLegible) {
      sondas.push({
        nombre: 'los impuestos y gastos de aquella compra',
        pequeno: { ...entrada, gastosAdquisicion: 1 },
        grande: { ...entrada, gastosAdquisicion: precioV * 10 },
      });
    }
    if (!mejorasLegible) {
      sondas.push({
        nombre: 'las mejoras',
        pequeno: { ...entrada, mejoras: 1 },
        grande: { ...entrada, mejoras: precioV * 10 },
      });
    }
    if (entrada.reinversion && !reinversionLegible) {
      const base = entrada.reinversion;
      sondas.push({
        nombre: 'el importe que reinviertes',
        pequeno: { ...entrada, reinversion: { ...base, importeReinvertido: 1 } },
        grande: { ...entrada, reinversion: { ...base, importeReinvertido: precioV * 10 } },
      });
    }
    if (entrada.reinversion && !hipotecaLegible) {
      const base = entrada.reinversion;
      sondas.push({
        nombre: 'el principal pendiente de la hipoteca',
        pequeno: { ...entrada, reinversion: { ...base, principalPendiente: 1 } },
        grande: { ...entrada, reinversion: { ...base, principalPendiente: precioV } },
      });
    }
    if (!valorTotalLegible && valorSuelo > 0) {
      sondas.push({
        nombre: 'el valor catastral total',
        pequeno: { ...entrada, valorTotal: valorSuelo },
        grande: { ...entrada, valorTotal: valorSuelo * 1000 },
      });
    }
    const sondeadas = sondas.map((sd) => ({
      nombre: sd.nombre,
      pequeno: calcularVendedor(sd.pequeno),
      grande: calcularVendedor(sd.grande),
    }));
    const veredictoDe = (cifra: (x: ReturnType<typeof calcularVendedor>) => number): Veredicto =>
      veredictoIlegibles(
        cifra(r),
        sondeadas.map((sd) => ({ nombre: sd.nombre, pequeno: cifra(sd.pequeno), grande: cifra(sd.grande) })),
      );

    const hayDatosGanancia = r.hayDatosGanancia;
    const g = r.g;
    return {
      precioVenta: precioV,
      plusvaliaMunicipal: r.plusvalia,
      metodoPlusvalia,
      exentoPlusvalia,
      plusvaliaCalculada,
      comisionInmobiliaria: r.comision,
      otrosGastosVenta: otrosVenta,
      totalGastos: r.totalGastos,
      netoVendedor: r.neto,
      valorAdquisicion: hayDatosGanancia ? g.valorAdquisicion : 0,
      valorTransmision: g.valorTransmision,
      gananciaPatrimonial: r.ganancia,
      esPerdida: hayDatosGanancia && g.esPerdida,

      sinGananciaNiPerdida: hayDatosGanancia && g.sinGananciaNiPerdida,
      baseImponibleIRPF: hayDatosGanancia ? g.baseImponible : 0,
      irpfGanancia: r.irpf,
      irpfCalculado: hayDatosGanancia,
      exentoIRPF,
      motivoExencion: hayDatosGanancia ? g.motivoExencion : null,
      // !(x > 0) y no «x <= 0»: con el campo vacío, parseSpanishNumber devuelve NaN, y
      // NaN <= 0 es false — el mismo bug que el propio hallazgo 512 venía a cerrar.
      faltaPrecioCompra: !(precioC > 0) && !(Number.isFinite(precioC) && precioC <= 0),
      precioCompraNoValido: Number.isFinite(precioC) && precioC <= 0,
      faltaValorSuelo: !plusvaliaResuelta && !(valorSuelo > 0),
      // Un año negativo no «falta»: está escrito y es imposible (patrón 5, hallazgo 1552).
      faltaAnios: !plusvaliaResuelta && !aniosDisponibles && !aniosNegativo,
      aniosNegativos: !plusvaliaResuelta && aniosNegativo,
      faltanMeses: !plusvaliaResuelta && aniosDisponibles && anios === 0 && meses === undefined,
      plusvaliaPendiente: !plusvaliaResuelta && hayDatosGanancia,
      comisionLegible,
      otrosVentaLegible,
      gastosAdquisicionLegible,
      mejorasLegible,
      // Solo cuenta cuando la casilla está marcada: con la reinversión desactivada el campo
      // no entra en el cálculo y su texto no puede falsear nada.
      reinversionLegible: !puedeReinvertir || reinversionLegible,
      hipotecaLegible: !puedeReinvertir || hipotecaLegible,
      // Sin plusvalía liquidada (faltan datos o no hay incremento) no hay método que comparar.
      valorTotalLegible: !plusvaliaCalculada || exentoPlusvalia || valorTotalLegible,
      camposIlegibles,
      parCatastralImposible: rp !== null && !rp.exento && rp.parCatastralImposible,
      exencionParcial:
        hayDatosGanancia && g.ganancia > 0 && g.baseImponible > 0 && g.baseImponible < g.ganancia,
      veredictoNeto: veredictoDe((x) => x.neto),
      veredictoIrpf: veredictoDe((x) => x.irpf),
      veredictoGanancia: veredictoDe((x) => x.ganancia),
    };
  }, [precioVenta, precioCompraOriginal, aniosPropiedad, mesesCompletos, valorCatastralSuelo, valorCatastralTotal, comisionInmobiliaria, otrosGastosVenta, gastosAdquisicion, mejoras, vendedorMayor65, esViviendaHabitual, reinvierte, importeReinversion, hipotecaPendiente, tipoInmueble]);

  /**
   * En Canarias, Ceuta y Melilla la obra nueva no pagó IVA sino IGIC o IPSI, que esta app no
   * calcula: ahí el botón no estima en vez de escribir una cifra sin el impuesto, que se quedaría
   * corta y, con ella, inflaría la ganancia (la misma dirección del hallazgo 1794).
   */
  const sinIvaCompraOriginal =
    regimenCompraOriginal === 'primera-mano' ? TERRITORIOS_SIN_IVA[ccaa] ?? null : null;
  /**
   * Estima los impuestos y gastos que el vendedor pagó al comprar el inmueble, para
   * que no tenga que buscarlos en una escritura de hace años. Usa el mismo motor que
   * la pestaña Comprador (ITP del tipo general de la CCAA, o IVA + AJD si aquella compra fue
   * de obra nueva, + notaría + registro + gestoría), aplicado sobre el precio de compra
   * original y con los tipos de HOY: el formulario lo dice junto al botón (hallazgo 1795).
   */
  const estimarGastosAdquisicion = () => {
    const precioC = parseSpanishNumber(precioCompraOriginal);
    // !(x > 0) y no «x <= 0»: con el campo vacío parseSpanishNumber devuelve NaN y
    // «NaN <= 0» es false, así que la guarda no cortaba y el botón escribía la CADENA
    // «No definido» dentro del campo de euros (hallazgo 580, familia del 512).
    if (!(precioC > 0) || sinIvaCompraOriginal) return;
    // SIN tercer argumento, que es lo que activa la escala progresiva. Pasando
    // `tipoGeneral` se cortocircuitaba la rama de tramos y las 7 CCAA con escala
    // (Aragón, Asturias, Baleares, Castilla y León, Cataluña, Extremadura y Valencia)
    // estimaban de menos; como esta cifra alimenta el valor de ADQUISICIÓN, quedarse
    // corto infla la ganancia y el IRPF. La misma página daba dos ITP distintos para
    // el mismo precio. No se aplican tipos reducidos a propósito: es una estimación de
    // lo que se pagó hace años, y el perfil del comprador de entonces no se pregunta.
    // Con el objeto del inmueble: en el País Vasco una vivienda pagó el 4 % y un local el 7 %.
    //
    // En OBRA NUEVA (hallazgo 1794) no hubo ITP: hubo IVA —el de la vivienda, el del anejo o el
    // general, con las mismas constantes que la pestaña Comprador— más el AJD de la comunidad.
    const impuestos =
      regimenCompraOriginal === 'primera-mano'
        ? precioC *
            ((tipoInmueble === 'vivienda'
              ? IVA_INMUEBLES_2025.obraNueva
              : INMUEBLES_RESIDENCIALES.includes(tipoInmueble)
                ? IVA_INMUEBLES_2025.anejoVinculado
                : PORCENTAJES_IVA.general) /
              100) +
          calcularAJD(precioC, ccaa, { objeto: objetoAJDDe(tipoInmueble) })
        : calcularITP(precioC, ccaa, objetoITPDe(tipoInmueble));
    // Las CUATRO partidas que enumera el rótulo del campo que se rellena («ITP o IVA,
    // notaría, registro y gestoría de aquella compra»). La gestoría faltaba: la pestaña
    // Comprador de esta misma app la suma para el mismo precio (GESTORIA_TIPICA), así que
    // el botón se quedaba corto en el valor de ADQUISICIÓN, y quedarse corto ahí infla la
    // ganancia y el IRPF — la dirección contra la que avisa la cabecera de
    // data/fiscal/ganancia-inmueble.ts (hallazgo 673 del Inspector).
    const estimado = impuestos + calcularNotario(precioC) + calcularRegistro(precioC) + GESTORIA_TIPICA;
    setGastosAdquisicion(formatNumber(estimado, 0));
  };

  const datosCcaaActual = ITP_CCAA[ccaa];
  const esInmuebleResidencial = INMUEBLES_RESIDENCIALES.includes(tipoInmueble);
  /** El precio escrito, para rotular el tipo que le toca (0 mientras no se lea). */
  const precioLeido = (() => {
    const p = parseSpanishNumber(precioVenta);
    return Number.isFinite(p) && p > 0 ? p : 0;
  })();
  /**
   * Cómo sube el tipo con el valor, en palabras del motor, que distingue la escala (cada tramo a
   * su tipo) del umbral de Valencia (el 11 % sobre TODO el valor): el recuadro decía «escala
   * progresiva (9 % → 11 %)» y describía justo el cálculo equivocado (hallazgos 1581 y 1602).
   */
  const subidaITP = (() => {
    const texto = describirSubidaITP(ccaa);
    if (texto === null) return null;
    return ITP_CCAA[ccaa].umbralTipoUnico ? `En esta comunidad, ${texto}.` : `Esta comunidad ${texto}.`;
  })();
  /** Años escritos que se leen como 0 (reventa antes del año): hay que preguntar los meses. */
  const aniosEnCero = (() => {
    const t = aniosPropiedad.trim();
    if (t === '') return false;
    const n = parseSpanishNumber(t);
    return Number.isFinite(n) && n >= 0 && !Object.is(n, -0) && Math.trunc(n) === 0;
  })();
  /** Al coste del comprador le falta algo: el IGIC/IPSI, la gestoría ilegible o la notaría libre. */
  const costeCompradorParcial =
    !!resultadosComprador &&
    (resultadosComprador.impuestoNoCalculado ||
      !resultadosComprador.gestoriaLegible ||
      resultadosComprador.notariaLibre);

  /**
   * Las partidas que el neto del vendedor NO está descontando porque faltan datos.
   * Se nombran las dos: el aviso solo hablaba de la plusvalía, así que con el precio de
   * compra en blanco el IRPF quedaba fuera del neto sin que nada lo dijera (hallazgo 428).
   * Los importes ilegibles ya no van aquí: su dirección la da el sondeo (avisoIlegiblesNeto).
   */
  const faltanEnElNeto = resultadosVendedor
    ? [
        resultadosVendedor.plusvaliaCalculada ? null : 'la plusvalía municipal',
        resultadosVendedor.irpfCalculado ? null : 'el IRPF de la ganancia',
      ].filter((x): x is string => x !== null)
    : [];

  /**
   * C3 · la MAGNITUD de «falta descontar» (testigo de familia, 23/09/2026). La comisión y los
   * otros gastos de la venta son gastos de transmisión (art. 35.1 LIRPF): descontarlos baja
   * también la ganancia y el IRPF. Sin reinversión, esa rebaja no supera el tipo MARGINAL del
   * ahorro en la base de ahora, y ese tipo es una cota publicable.
   *
   * ⚠️ Con reinversión PARCIAL no lo es (hallazgo 1226): el gasto baja también el importe
   * total obtenido del art. 41 RIRPF, que es el denominador de la proporción exenta, y cada
   * euro puede bajar la base en MÁS de un euro (28,51 % frente al 23 % publicado en el caso
   * del acta). Ahí se dice que rebaja el IRPF sin inventar cota.
   */
  const tipoMarginalAhorro =
    resultadosVendedor && resultadosVendedor.irpfGanancia > 0 && !resultadosVendedor.exencionParcial
      ? (TRAMOS_GANANCIAS_PATRIMONIALES_2025.find((t) => resultadosVendedor.baseImponibleIRPF <= t.hasta)
          ?.tipo ?? TIPO_AHORRO_MAX)
      : null;

  /**
   * Cómo se nombra, en el aviso del SUELO, cada importe que abarata el impuesto: el paréntesis
   * dice POR QUÉ leerlo sube el neto, igual que en las hermanas (redacción común, 24/09/2026).
   */
  const EXPLICA_SUELO: Record<string, string> = {
    'los impuestos y gastos de aquella compra':
      'los impuestos y gastos de aquella compra (suman al valor de adquisición y REDUCEN el IRPF)',
    'las mejoras': 'las mejoras (suman al valor de adquisición y REDUCEN el IRPF)',
    'el importe que reinviertes': 'el importe que reinviertes (con él, la ganancia puede quedar exenta por el art. 38 LIRPF)',
    'el valor catastral total': 'el valor catastral total (con él la plusvalía puede salir más barata por el método real)',
    // Más principal pendiente → menos importe obtenido (art. 41.1 RIRPF) → más proporción
    // exenta (art. 41.4) → menos IRPF: leerlo SUBE el neto (hallazgo 1798).
    'el principal pendiente de la hipoteca':
      'el principal pendiente de la hipoteca (se resta del importe obtenido, así que con él es mayor la parte exenta de la ganancia, art. 41 RIRPF)',
  };

  /** Lo que el aviso del neto dice de los importes ilegibles, calculado por el sondeo. */
  const avisoIlegiblesNeto = (() => {
    const v = resultadosVendedor?.veredictoNeto;
    if (!v || v.tipo === 'ninguno') return null;
    if (v.tipo === 'mixto') {
      // Con dos ilegibles opuestos no se puede afirmar una dirección (hallazgo 1229). El verbo
      // concuerda con el sujeto: «las mejoras lo subirían», no «lo subiría» (hallazgo 1555).
      // Un importe que mueve el neto en los DOS sentidos según lo que valga está en las dos
      // listas del veredicto: se nombra una vez y con su propia frase, no «X lo bajaría; X lo
      // subiría» (hallazgo 1798).
      const soloBajan = v.menor.filter((c) => !v.mayor.includes(c));
      const soloSuben = v.mayor.filter((c) => !v.menor.includes(c));
      const segun = v.menor.filter((c) => v.mayor.includes(c));
      const sentidos = [
        soloBajan.length > 0 ? `${enumerar(soloBajan)} lo ${sujetoPlural(soloBajan) ? 'bajarían' : 'bajaría'}` : null,
        soloSuben.length > 0 ? `${enumerar(soloSuben)} lo ${sujetoPlural(soloSuben) ? 'subirían' : 'subiría'}` : null,
        segun.length > 0
          ? `${enumerar(segun)} lo ${sujetoPlural(segun) ? 'subirían o bajarían según lo que valgan' : 'subiría o bajaría según lo que valga'}`
          : null,
      ].filter((x): x is string => x !== null);
      const todos = sinRepetir([...v.menor, ...v.mayor]);
      return `Sin cerrar: ${noSePudoLeer(todos)}, y ${sujetoPlural(todos) ? 'mueven' : 'mueve'} el neto en sentidos contrarios (${sentidos.join('; ')}): no se puede saber si el neto real es mayor o menor que este`;
    }
    if (v.tipo === 'mayor' && faltanEnElNeto.length > 0) {
      // Un ilegible que SUBIRÍA el neto no permite afirmar «el neto real es MAYOR» si a la vez
      // FALTA un impuesto que lo bajaría: el sondeo solo mide los ilegibles, y la dirección
      // segura era falsa en cuanto se rellenaba el dato vacío (hallazgo 1561).
      return `Sin cerrar: ${noSePudoLeer(v.campos)} y ${sujetoPlural(v.campos) ? 'lo subirían' : 'lo subiría'}, pero ${faltaOFaltan(faltanEnElNeto)}, que ${sujetoPlural(faltanEnElNeto) ? 'lo bajarían' : 'lo bajaría'}: no se puede saber si el neto real es mayor o menor que este`;
    }
    if (v.tipo === 'menor') {
      const deducibles = v.campos.filter(
        (c) => c === 'la comisión inmobiliaria' || c === 'los otros gastos de la venta',
      );
      const rebajan = deducibles.length > 1 || deducibles[0] === 'los otros gastos de la venta';
      const pron = deducibles.length === 1 && deducibles[0] === 'la comisión inmobiliaria' ? 'la' : 'los';
      const matiz =
        deducibles.length === 0 || !(resultadosVendedor && resultadosVendedor.irpfGanancia > 0)
          ? ''
          : tipoMarginalAhorro !== null
            ? ` (${enumerar(deducibles)} ${rebajan ? 'rebajan' : 'rebaja'} también el IRPF al descontar${pron}, hasta un ${formatNumber(tipoMarginalAhorro, 0)}\u00A0% de su importe)`
            : ` (${enumerar(deducibles)} ${rebajan ? 'rebajan' : 'rebaja'} también el IRPF al descontar${pron}, así que el neto real baja menos que su importe)`;
      return v.seguro
        ? `No descuenta ${enumerarNi(v.campos)}, que no se ${v.campos.length > 1 ? 'han' : 'ha'} podido leer${matiz}: el neto real es menor que este`
        : `${mayuscula(noSePudoLeer(v.campos))}: el neto real puede ser menor que este`;
    }
    const explica = v.campos.map((c) => EXPLICA_SUELO[c] ?? c);
    return `${mayuscula(noSePudoLeer(explica))}: el neto real ${v.seguro ? 'es' : 'puede ser'} MAYOR que este`;
  })();

  /**
   * ¿La plusvalía FALTA mientras la ganancia sí se calcula? Al calcularse restará del valor de
   * transmisión (art. 35.1 LIRPF): la ganancia y el IRPF publicados son un MÁXIMO, y la pérdida
   * un mínimo (patrón de familia 2, hallazgos 1546, 1562 y 1570).
   */
  const plusvaliaPendiente = resultadosVendedor?.plusvaliaPendiente ?? false;

  /**
   * Texto de una tarjeta intermedia (IRPF, ganancia) cuando un ilegible la mueve, o cuando falta
   * la plusvalía, que la bajaría (patrón 2). Si los dos tiran en sentidos contrarios la app no
   * puede saber hacia dónde queda la cifra real, y lo dice.
   */
  const avisoTarjeta = (v: Veredicto, que: string, cuentaPlusvalia = true): string | null => {
    const pendiente = cuentaPlusvalia && plusvaliaPendiente;
    const frasePlusvalia = `No resta la plusvalía municipal, que falta, así que ${que} real puede ser menor`;
    if (v.tipo === 'ninguno') return pendiente ? `${frasePlusvalia}.` : null;
    // El caso caro es la reinversión: sin leerla, el motor no aplica la exención del art. 38
    // LIRPF y cobra el IRPF entero de una ganancia que puede estar exenta al 100 % (1190).
    const reinversionSinLeer =
      (v.tipo === 'menor' && v.campos.includes('el importe que reinviertes')) ||
      (v.tipo === 'mixto' && v.menor.includes('el importe que reinviertes'));
    const art38 = reinversionSinLeer
      ? ' Sin el importe que reinviertes, esta cuota NO aplica la exención del art. 38 LIRPF: escríbelo para comprobar si la ganancia queda exenta.'
      : '';
    if (v.tipo === 'mixto' || (pendiente && v.tipo === 'mayor')) {
      const ilegibles = v.tipo === 'mixto' ? sinRepetir([...v.menor, ...v.mayor]) : v.campos;
      return `Sin cerrar: ${pendiente ? 'falta la plusvalía municipal, ' : ''}${noSePudoLeer(ilegibles)} y mueven ${que} en sentidos contrarios. ${escribelo(ilegibles)} con coma decimal (1.234,56).${art38}`;
    }
    // «Escríbelos» detrás de dos importes (hallazgo 1555).
    const ilegible = `${mayuscula(noSePudoLeer(v.campos))}, así que ${que} real ${v.seguro ? 'es' : 'puede ser'} ${v.tipo === 'menor' ? 'menor' : 'mayor'}. ${escribelo(v.campos)} con coma decimal (1.234,56).${v.tipo === 'menor' ? art38 : ''}`;
    return pendiente ? `${frasePlusvalia}. ${ilegible}` : ilegible;
  };

  /** La cifra es un MÁXIMO por la plusvalía que falta y ningún ilegible tira en contra. */
  const esMaximoPorPlusvalia = (v: Veredicto): boolean =>
    plusvaliaPendiente && (v.tipo === 'ninguno' || v.tipo === 'menor');

  /**
   * La pérdida es la ganancia con el signo cambiado: su dirección es la contraria. Abre en
   * mayúscula, como los demás avisos de la redacción común (hallazgo 1555).
   */
  const avisoPerdida = (v: Veredicto): string | null => {
    const frasePlusvalia = 'No resta la plusvalía municipal, que falta, así que la pérdida real puede ser mayor que esta';
    if (v.tipo === 'ninguno') return plusvaliaPendiente ? `${frasePlusvalia}.` : null;
    if (v.tipo === 'mixto' || (plusvaliaPendiente && v.tipo === 'mayor')) {
      const ilegibles = v.tipo === 'mixto' ? sinRepetir([...v.menor, ...v.mayor]) : v.campos;
      return `Sin cerrar: ${plusvaliaPendiente ? 'falta la plusvalía municipal, ' : ''}${noSePudoLeer(ilegibles)} y mueven la pérdida en sentidos contrarios. ${escribelo(ilegibles)} con coma decimal (1.234,56).`;
    }
    const mayorPerdida = v.tipo === 'menor';
    const ilegible = `${mayuscula(noSePudoLeer(v.campos))}: la pérdida real ${v.seguro ? 'es' : 'puede ser'} ${mayorPerdida ? 'mayor' : 'menor'} que esta${mayorPerdida ? '' : ' (o puede haber ganancia)'}. ${escribelo(v.campos)} con coma decimal (1.234,56).`;
    return plusvaliaPendiente ? `${frasePlusvalia}. ${ilegible}` : ilegible;
  };

  /**
   * «Sin ganancia ni pérdida» con un importe ilegible o con la plusvalía pendiente: ese cero no
   * es firme, y la tarjeta no puede negar una pérdida (o una ganancia) que la app sabe que puede
   * haber. Tenía texto fijo y no miraba el sondeo (patrón 6, hallazgos 1549, 1565 y 1575).
   */
  const avisoCero = (v: Veredicto): string | null => {
    const frasePlusvalia = 'No resta la plusvalía municipal, que falta: con ella puede haber una pérdida que se compensaría en la declaración';
    if (v.tipo === 'ninguno') return plusvaliaPendiente ? `${frasePlusvalia}.` : null;
    if (v.tipo === 'mixto' || (plusvaliaPendiente && v.tipo === 'mayor')) {
      const ilegibles = v.tipo === 'mixto' ? sinRepetir([...v.menor, ...v.mayor]) : v.campos;
      return `Sin cerrar: ${plusvaliaPendiente ? 'falta la plusvalía municipal, ' : ''}${noSePudoLeer(ilegibles)} y tiran en sentidos contrarios: puede haber ganancia o pérdida. ${escribelo(ilegibles)} con coma decimal (1.234,56).`;
    }
    const ilegible =
      v.tipo === 'menor'
        ? `${mayuscula(noSePudoLeer(v.campos))}, así que ${v.seguro ? 'hay' : 'puede haber'} una pérdida que se compensaría en la declaración. ${escribelo(v.campos)} con coma decimal (1.234,56).`
        : `${mayuscula(noSePudoLeer(v.campos))}, así que ${v.seguro ? 'hay' : 'puede haber'} una ganancia, y con ella IRPF. ${escribelo(v.campos)} con coma decimal (1.234,56).`;
    return plusvaliaPendiente ? `${frasePlusvalia}. ${ilegible}` : ilegible;
  };

  /**
   * Qué CAMPOS rellenar para que el neto se calcule entero. No se deduce de qué impuesto
   * quedó sin calcular (plusvaliaCalculada/irpfCalculado): los dos dependen del precio de
   * compra, así que con el suelo ya relleno y solo el precio en blanco, esa deducción pedía
   * rellenar el suelo dos veces y nunca decía qué campo faltaba de verdad (hallazgo 512).
   */
  const camposQueFaltan = resultadosVendedor
    ? [
        resultadosVendedor.faltaPrecioCompra && !resultadosVendedor.camposIlegibles.includes('el precio de compra original')
          ? 'el precio de compra original'
          : null,
        resultadosVendedor.faltaValorSuelo && !resultadosVendedor.camposIlegibles.includes('el valor catastral del suelo')
          ? 'el valor catastral del suelo'
          : null,
        resultadosVendedor.faltaAnios && !resultadosVendedor.camposIlegibles.includes('los años de tenencia')
          ? 'los años de tenencia'
          : null,
        // Con años = 0, los meses completos del prorrateo (hallazgo 1560).
        resultadosVendedor.faltanMeses ? 'los meses completos desde la compra' : null,
      ].filter((x): x is string => x !== null)
    : [];

  /**
   * El cero del IRPF es de una EXENCIÓN solo si hay ganancia que eximir: por edad, o por
   * reinversión total. Sin ganancia no hay nada exento ni nada que tribute (hallazgo 1554).
   */
  const irpfExento =
    !!resultadosVendedor &&
    resultadosVendedor.irpfCalculado &&
    resultadosVendedor.gananciaPatrimonial > 0 &&
    (resultadosVendedor.exentoIRPF || resultadosVendedor.baseImponibleIRPF === 0);

  /** Los años escritos en negativo: no faltan, son imposibles (patrón 5, hallazgo 1552). */
  const AVISO_ANIOS_NEGATIVOS = 'los años de tenencia no pueden ser negativos';
  /** El precio de compra escrito como 0 o negativo: no falta, no vale (patrón 5, hallazgo 1799). */
  const AVISO_PRECIO_COMPRA_NO_VALIDO = 'el precio de compra original tiene que ser mayor que 0';

  const netoParcial =
    faltanEnElNeto.length > 0 ||
    avisoIlegiblesNeto !== null ||
    (resultadosVendedor?.camposIlegibles.length ?? 0) > 0 ||
    (resultadosVendedor?.parCatastralImposible ?? false);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏠</span>
        <h1 className={styles.title}>Estimador de Gastos de Compraventa de Vivienda</h1>
        <p className={styles.subtitle}>
          Cuánto cuesta comprar o vender un piso o una casa en España: ITP o IVA por comunidad autónoma,
          notaría, registro, plusvalía municipal e IRPF del vendedor.
        </p>
        <p className={styles.subtitleSecundario}>
          También te orienta sobre garaje, trastero, local comercial, nave industrial y terreno, con enlace
          a la calculadora especializada de cada uno.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal - CRÍTICO */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="estimador-compraventa-inmueble"
        collapsible={false}
      />
      <DataReference
        normativa={`ITP/AJD ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={separarPorcentajes(FISCAL_INMUEBLES_META.nota)}
      />

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de inmueble */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de inmueble</label>
            <div className={styles.tipoInmuebleGrid}>
              {/* Caso principal: la vivienda, a ancho completo */}
              {TIPOS_INMUEBLE.filter(t => t.grupo === 'principal').map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  aria-pressed={tipoInmueble === tipo.value}
                  className={`${styles.tipoInmuebleBtn} ${styles.tipoPrincipal} ${tipoInmueble === tipo.value ? styles.active : ''}`}
                  onClick={() => setTipoInmueble(tipo.value)}
                >
                  <span className={styles.tipoIcon} aria-hidden="true">{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </button>
              ))}

              <span className={styles.tipoSeparador}>Anejos de la vivienda</span>
              {TIPOS_INMUEBLE.filter(t => t.grupo === 'anejo').map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  aria-pressed={tipoInmueble === tipo.value}
                  className={`${styles.tipoInmuebleBtn} ${styles.tipoAnejo} ${tipoInmueble === tipo.value ? styles.active : ''}`}
                  onClick={() => setTipoInmueble(tipo.value)}
                >
                  <span className={styles.tipoIcon} aria-hidden="true">{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </button>
              ))}

              <span className={styles.tipoSeparador}>Comercial, industrial y suelo</span>
              {TIPOS_INMUEBLE.filter(t => t.grupo === 'comercial').map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  aria-pressed={tipoInmueble === tipo.value}
                  className={`${styles.tipoInmuebleBtn} ${tipoInmueble === tipo.value ? styles.active : ''}`}
                  onClick={() => setTipoInmueble(tipo.value)}
                >
                  <span className={styles.tipoIcon} aria-hidden="true">{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </button>
              ))}
            </div>

            {/* Derivación a la calculadora especializada del tipo elegido */}
            {DERIVACIONES[tipoInmueble] && (
              <div className={styles.derivacionBox}>
                <p className={styles.derivacionTitulo}>
                  <span aria-hidden="true">🎯</span> Hay una calculadora específica para este caso
                </p>
                <ul className={styles.derivacionLista}>
                  {DERIVACIONES[tipoInmueble]!.map(d => (
                    <li key={d.url}>
                      <a href={d.url} className={styles.derivacionEnlace}>{d.nombre}</a>: {d.matiz}
                    </li>
                  ))}
                </ul>
                <p className={styles.derivacionPie}>
                  Este estimador te da el orden de magnitud del caso general. Para la operación
                  concreta, usa la calculadora especializada.
                </p>
              </div>
            )}
          </div>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de transmisión</label>
            <div className={styles.transmisionGrid}>
              <button
                type="button"
                aria-pressed={tipoTransmision === 'segunda-mano'}
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP</span>
              </button>
              <button
                type="button"
                aria-pressed={tipoTransmision === 'primera-mano'}
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🆕</span>
                <span>Primera mano</span>
                <span className={styles.transmisionSub}>Paga {TERRITORIOS_SIN_IVA[ccaa]?.impuesto ?? 'IVA'}</span>
              </button>
            </div>
          </div>

          {/* Precio de venta */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label={tipoInmueble === 'vivienda' ? 'Precio de la vivienda' : 'Precio del inmueble'}
            placeholder="200000"
            // La base del IVA es la contraprestación pactada (art. 78 Ley 37/1992); «el mayor»
            // con el valor de referencia catastral es la base mínima del ITP. Propagado del
            // hallazgo 1273 de solar: esta app también tiene régimen de IVA en primera mano.
            helperText={
              tipoTransmision === 'primera-mano' && !TERRITORIOS_SIN_IVA[ccaa]
                ? 'Precio pactado en la escritura (la base del IVA es la contraprestación, art. 78 Ley 37/1992)'
                : 'Precio escriturado o valor de referencia catastral (el mayor)'
            }
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="ccaa-inmueble">Comunidad Autónoma (ubicación del inmueble)</label>
            <select
              id="ccaa-inmueble"
              value={ccaa}
              onChange={(e) => setCcaa(e.target.value as ComunidadAutonoma)}
              className={styles.select}
            >
              {COMUNIDADES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <AvisoTerritorioSinIva ccaa={ccaa} aplica={tipoTransmision === 'primera-mano'} />

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span className={styles.infoCcaaIcon} aria-hidden="true">📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                {/* Del motor, con lo que se transmite y el precio: el País Vasco grava al 7 % lo
                    que no es vivienda, y Valencia pasa al 11 % por encima del millón (hallazgos
                    1581 y 1582). `datosCcaaActual.tipoGeneral` es solo el de la vivienda. */}
                <span className={styles.infoCcaaValue}>
                  {formatTipoNominal(tipoGeneralITP(ccaa, objetoITPDe(tipoInmueble), precioLeido))}&nbsp;%
                </span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                <span className={styles.infoCcaaValue}>
                  {formatTipoNominal(tipoAJD(ccaa, { objeto: objetoAJDDe(tipoInmueble) }).tipo)}&nbsp;%
                </span>
              </div>
            </div>
            {/* Escala o umbral, con las palabras de cada uno: Valencia no tiene escala, sino un
                11 % sobre TODO el valor por encima del millón (hallazgos 1581 y 1602). */}
            {subidaITP && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> {separarPorcentajes(subidaITP)}
              </p>
            )}
            <p className={styles.infoCcaaNote}>{separarPorcentajes(datosCcaaActual.notas)}</p>
          </div>

          {/* Perfil del comprador (solo para ITP y solo inmuebles residenciales) */}
          {tipoTransmision === 'segunda-mano' && esInmuebleResidencial && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="perfil-comprador">Perfil del comprador (para tipos reducidos)</label>
              <select
                id="perfil-comprador"
                value={perfilComprador}
                onChange={(e) => setPerfilComprador(e.target.value as PerfilComprador)}
                className={styles.select}
              >
                {PERFILES_COMPRADOR.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {perfilComprador !== 'general' && datosCcaaActual.tiposReducidos.length > 0 && (
                <div className={styles.tiposReducidosInfo}>
                  {/* «Beneficios fiscales» y no «tipos reducidos»: desde 7a02470c, Aragón
                      no tiene tipos reducidos sino bonificaciones sobre la cuota, y su propia
                      nota —impresa unos centímetros más arriba— lo dice. Quien llamara a la
                      oficina liquidadora pedía algo que allí no existe con ese nombre
                      (hallazgo 769; ya reparado así en la hermana garaje el 11/09). */}
                  <h4>Beneficios fiscales en {datosCcaaActual.nombre}, solo si se cumplen TODAS sus condiciones:</h4>
                  <ul>
                    {datosCcaaActual.tiposReducidos.map((tr, idx) => (
                      <li key={idx}>
                        {/* formatTipoNominal y no el número crudo: «3.5%» es formato US, y dos
                            dedos más abajo la misma página ya escribía «7,00%» bien (hallazgo 721) */}
                        <strong>{formatTipoNominal(tr.tipo)}&nbsp;%</strong> - {separarPorcentajes(tr.nombre)}
                        {tr.valorMaximo && <span className={styles.limite}> (máx. {formatCurrency(tr.valorMaximo)})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Gastos adicionales comprador */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría del comprador (€)"
              placeholder={String(GESTORIA_TIPICA)}
              helperText={`Típico: entre ${eurosEnteros(HORQUILLA_GESTORIA.min)} y ${eurosEnteros(HORQUILLA_GESTORIA.max)} (tramitación de escrituras)`}
              min={0}
            />
          </div>

          {/* Enlace a Catastro */}
          <div className={styles.enlaceCatastro}>
            <a href={ENLACE_CATASTRO} target="_blank" rel="noopener noreferrer" className={styles.catastroLink}>
              <span aria-hidden="true">🔗</span> Consultar valor de referencia catastral en la Sede del Catastro
            </a>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {/* Pestañas */}
          <div className={styles.tabs}>
            <button
              type="button"
              aria-pressed={pestanaActiva === 'comprador'}
              className={`${styles.tab} ${pestanaActiva === 'comprador' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('comprador')}
            >
              <span aria-hidden="true">🛒</span> Comprador
            </button>
            <button
              type="button"
              aria-pressed={pestanaActiva === 'vendedor'}
              className={`${styles.tab} ${pestanaActiva === 'vendedor' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('vendedor')}
            >
              <span aria-hidden="true">💰</span> Vendedor
            </button>
          </div>

          {/* Resultados Comprador */}
          {pestanaActiva === 'comprador' && (
            <div className={styles.resultados}>
              {resultadosComprador ? (
                <>
                  <ResultCard
                    title="Precio del inmueble"
                    value={formatCurrency(resultadosComprador.precioInmueble)}
                    variant="default"
                    icon="🏠"
                  />

                  <ResultCard
                    title={
                      resultadosComprador.impuestoNoCalculado
                        ? resultadosComprador.tipoImpuesto
                        : `${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 2)}\u00A0%)`
                    }
                    value={
                      resultadosComprador.impuestoNoCalculado
                        ? 'No calculado'
                        : formatCurrency(resultadosComprador.impuestoTransmision)
                    }
                    variant="warning"
                    icon="📋"
                    description={
                      resultadosComprador.impuestoNoCalculado
                        ? `En ${datosCcaaActual.nombre} no rige el IVA: la compra de obra nueva tributa por el ${resultadosComprador.tipoImpuesto}, que este simulador no calcula`
                        : undefined
                    }
                  />

                  {resultadosComprador.ajd > 0 && (
                    <ResultCard
                      // Tipo EFECTIVO, igual que el del ITP: en Ceuta y Melilla la cuota gradual
                      // se bonifica al 50 % (art. 57 bis TRLITPAJD) y el nominal de la tabla se
                      // desmentía con el importe de al lado (hallazgo 431).
                      title={`AJD (${formatNumber((resultadosComprador.ajd / resultadosComprador.precioInmueble) * 100, 2)}\u00A0%)`}
                      value={formatCurrency(resultadosComprador.ajd)}
                      variant="warning"
                      icon="📄"
                      description={(() => {
                        // Donde la vivienda habitual tiene un AJD propio (Valencia, 0,1 %, Ley
                        // 13/1997 art. 14), se cobra el general —la app no pregunta si lo será— y
                        // se enseña la rebaja, como los tipos reducidos del ITP (24/09/2026).
                        if (tipoInmueble !== 'vivienda') return undefined;
                        const habitual = tipoAJD(ccaa, { objeto: 'vivienda', viviendaHabitual: true });
                        if (habitual.motivo !== 'vivienda-habitual') return undefined;
                        return `Si va a ser tu vivienda habitual, en ${datosCcaaActual.nombre} el AJD baja al ${formatTipoNominal(habitual.tipo)}\u00A0%: serían ${formatCurrency(calcularAJD(resultadosComprador.precioInmueble, ccaa, { objeto: 'vivienda', viviendaHabitual: true }))}. No lo aplicamos porque no lo preguntamos.`;
                      })()}
                    />
                  )}

                  <ResultCard
                    title="Gastos de notaría (IVA incluido)"
                    value={formatCurrency(resultadosComprador.gastosNotario)}
                    description={`Factura estimada entre ${formatCurrency(resultadosComprador.gastosNotarioMin)} y ${formatCurrency(resultadosComprador.gastosNotarioMax)}. El arancel cubre la matriz y una copia; las copias adicionales y los folios se facturan aparte y dependen de la extensión de la escritura.${
                      resultadosComprador.notariaLibre
                        ? ` Por encima de ${formatCurrency(LIMITE_ARANCEL_NOTARIAL)} el arancel no fija cantidad: lo que excede se cobra según lo que acuerdes con el notario (RD 1426/1989, nº 2.1), y esta estimación no lo incluye.`
                        : ''
                    }`}
                    variant="default"
                    icon="📝"
                  />

                  <ResultCard
                    title="Registro de la Propiedad (IVA incluido)"
                    value={formatCurrency(resultadosComprador.gastosRegistro)}
                    variant="default"
                    icon="🏛️"
                  />

                  {/*
                    Con la guarda `> 0` a secas, un importe que el parser no puede leer valía 0
                    y la línea DESAPARECÍA del desglose: no quedaba ni un «0,00 €» que delatara
                    la pérdida (hallazgo 1191).
                  */}
                  {(resultadosComprador.gastosGestoria > 0 || !resultadosComprador.gestoriaLegible) && (
                    <ResultCard
                      title="Gastos de gestoría"
                      value={
                        resultadosComprador.gestoriaLegible
                          ? formatCurrency(resultadosComprador.gastosGestoria)
                          : 'Sin leer'
                      }
                      variant="default"
                      icon="📂"
                      description={
                        resultadosComprador.gestoriaLegible
                          ? undefined
                          : 'El importe escrito no se ha podido leer, así que NO está incluido en el total. Escríbelo con coma decimal (300,50).'
                      }
                    />
                  )}

                  <div className={styles.separador} />

                  {/* Las dos cifras de cierre se titulan «(PARCIAL)» con la MISMA condición que
                      ya las rotulaba así sin el IGIC/IPSI: les falta algo en la misma dirección.
                      La gestoría ilegible y la notaría de libre acuerdo se quedaban fuera, con la
                      descripción diciendo «será mayor» bajo un título de definitivo (patrón de
                      familia 1, hallazgo 1556; y el 1599 del arancel). */}
                  <ResultCard
                    title={costeCompradorParcial ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales'}
                    value={formatCurrency(resultadosComprador.totalGastos)}
                    variant="info"
                    icon="➕"
                    description={
                      [
                        `${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}\u00A0% sobre el precio`,
                        resultadosComprador.impuestoNoCalculado
                          ? `SIN el ${resultadosComprador.tipoImpuesto}, que no está incluido`
                          : null,
                        // Un importe que no se ha podido leer falta en el total igual que un
                        // impuesto sin calcular, y en la misma dirección (hallazgo 1191).
                        resultadosComprador.gestoriaLegible
                          ? null
                          : 'SIN la gestoría, que no se ha podido leer',
                        resultadosComprador.notariaLibre
                          ? 'SIN la parte de la notaría que es de libre acuerdo'
                          : null,
                      ]
                        .filter((x): x is string => x !== null)
                        .join(' — ')
                    }
                  />

                  <ResultCard
                    title={costeCompradorParcial ? 'COSTE TOTAL (PARCIAL)' : 'COSTE TOTAL DE ADQUISICIÓN'}
                    value={formatCurrency(resultadosComprador.totalOperacion)}
                    variant="highlight"
                    icon="💳"
                    description={
                      costeCompradorParcial
                        ? `No incluye ${[
                            resultadosComprador.impuestoNoCalculado
                              ? `el ${resultadosComprador.tipoImpuesto}`
                              : null,
                            resultadosComprador.gestoriaLegible
                              ? null
                              : 'la gestoría, que no se ha podido leer',
                            resultadosComprador.notariaLibre
                              ? `la parte de la notaría que excede de ${formatCurrency(LIMITE_ARANCEL_NOTARIAL)}, que es de libre acuerdo`
                              : null,
                          ]
                            .filter((x): x is string => x !== null)
                            .join(' ni ')}: ${resultadosComprador.gestoriaLegible ? 'el coste real puede ser mayor' : 'el coste real será mayor'}`
                        : 'Precio + todos los gastos'
                    }
                  />
                  {/*
                    En primera mano el selector de perfil no se pinta —el IVA no tiene tipos por
                    perfil del comprador— y con él desaparecía el ÚNICO mecanismo que la app tiene
                    para decir «podrías pagar menos». El IVA superreducido del 4 % de la VPO de
                    régimen especial o promoción pública existe (art. 91.Dos.1.6º LIVA) y la app no
                    lo aplica a propósito, porque exige una calificación que aquí no se pregunta:
                    lo que no puede hacer es callárselo (hallazgo 430).
                  */}
                  {tipoTransmision === 'primera-mano' && esInmuebleResidencial && !resultadosComprador.impuestoNoCalculado && (
                    <div className={styles.avisoReducidos} role="note">
                      <p className={styles.avisoReducidosTitulo}>
                        <span aria-hidden="true">💡</span> Podrías pagar menos, pero depende de requisitos que no preguntamos
                      </p>
                      <p className={styles.avisoReducidosTexto}>
                        El cálculo usa el IVA del {formatNumber(IVA_INMUEBLES_2025.obraNueva, 0)}&nbsp;%. Si la
                        vivienda está acogida a un régimen de <strong>protección oficial de régimen especial
                        o de promoción pública</strong>, el IVA baja al {formatNumber(IVA_INMUEBLES_2025.viviendaProtegida, 0)}&nbsp;%
                        (art. 91.Dos.1.6º LIVA): serían{' '}
                        {formatCurrency(resultadosComprador.precioInmueble * (IVA_INMUEBLES_2025.viviendaProtegida / 100))}{' '}
                        en vez de {formatCurrency(resultadosComprador.impuestoTransmision)}. No lo aplicamos
                        porque la calificación concreta de la vivienda no se puede deducir del precio:
                        compruébala en la escritura o con la promotora.
                      </p>
                    </div>
                  )}
                  {resultadosComprador.tipoElegido && resultadosComprador.tipoElegido.noComprobables.length > 0 && (
                    <div className={styles.avisoReducidos} role="note">
                      <p className={styles.avisoReducidosTitulo}>
                        <span aria-hidden="true">💡</span> Podrías pagar menos, pero depende de requisitos que no preguntamos
                      </p>
                      {/* ⚠️ 13/09/2026 — este texto era fijo y decía «usa el tipo general»
                          también cuando se había aplicado un REDUCIDO, así que el lector tenía
                          delante dos frases incompatibles sobre el mismo importe (hallazgo 768).
                          Ahora nombra el tipo que de verdad se ha cobrado. */}
                      <p className={styles.avisoReducidosTexto}>
                        {resultadosComprador.tipoElegido.esReducido ? (
                          <>
                            El cálculo aplica el{' '}
                            <strong>{formatNumber(resultadosComprador.tipoElegido.tipo, 2)}&nbsp;%</strong>
                            {resultadosComprador.tipoElegido.nombre
                              ? ` (${separarPorcentajes(resultadosComprador.tipoElegido.nombre)})`
                              : ''}
                            . En {datosCcaaActual.nombre} hay además tipos más bajos que dependen
                            de requisitos que no preguntamos:
                          </>
                        ) : (
                          <>
                            El cálculo usa el tipo general porque no podemos comprobar tu situación.
                            En {datosCcaaActual.nombre} existe:
                          </>
                        )}
                      </p>
                      <ul className={styles.avisoReducidosLista}>
                        {/* El límite de valor va UNA vez: cuando ya viaja en el nombre o en las
                            condiciones —lo normal en la tabla— repetirlo detrás formateado lo
                            escribía tres veces del mismo número (hallazgo 771). */}
                        {resultadosComprador.tipoElegido.noComprobables.map(r => {
                          /** «≤150.000€», «≤ 150.000 €» y «150.000,00 €» son el mismo número. */
                          const diceElTope = (texto: string) =>
                            !!r.valorMaximo && texto.replace(/[.\s]/g, '').includes(String(r.valorMaximo));
                          const topeEnNombre = diceElTope(r.nombre);
                          // Si el nombre ya lo lleva, la condición que solo repite ese mismo tope
                          // sobra: es la segunda de las tres escrituras del hallazgo 771.
                          const condiciones = r.condiciones.filter(
                            c => !(topeEnNombre && diceElTope(c) && /valor/i.test(c))
                          );
                          const topeYaDicho = !r.valorMaximo || topeEnNombre || condiciones.some(diceElTope);
                          return (
                            <li key={r.nombre}>
                              <strong>{formatNumber(r.tipo, 2)}&nbsp;% — {separarPorcentajes(r.nombre)}</strong>
                              <br />
                              Requisitos: {separarPorcentajes(condiciones.join(' · '))}
                              {topeYaDicho ? '' : ` · Valor máximo ${formatCurrency(r.valorMaximo ?? 0)}`}
                              {superaElTope(r, resultadosComprador.precioInmueble) ? ' · ⚠️ tu precio supera ese límite: no podrías acogerte' : ''}
                            </li>
                          );
                        })}
                      </ul>
                      <p className={styles.avisoReducidosTexto}>
                        Comprueba los requisitos con la oficina liquidadora de tu comunidad antes de contar con la rebaja: la mayoría exigen que sea tu vivienda habitual, y algunos añaden límites de renta, superficie o municipio.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
                  <p>
                    {escritoIlegible(precioVenta, parseSpanishNumber)
                      ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio del inmueble con coma decimal (200.000 o 200000,50) para ver el desglose de gastos del comprador`
                      : 'Introduce el precio del inmueble para ver el desglose de gastos del comprador'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resultados Vendedor */}
          {pestanaActiva === 'vendedor' && (
            <div className={styles.resultados}>
              {/* Formulario adicional vendedor */}
              <div className={styles.formVendedor}>
                <h3 className={styles.formVendedorTitle}>Datos para calcular plusvalía e IRPF</h3>

                {/* La plusvalía municipal (IIVTNU) solo grava el suelo urbano */}
                {tipoInmueble === 'terreno' && (
                  <p className={styles.derivacionPie} role="note">
                    <span aria-hidden="true">⚠️</span> La plusvalía municipal que se calcula aquí
                    solo procede si el terreno es <strong>suelo urbano o urbanizable</strong>. La
                    venta de una <strong>finca rústica no genera IIVTNU</strong>, aunque sí tributa
                    en el IRPF del vendedor. Para ese caso usa el{' '}
                    <a href="/simulador-gastos-compraventa-terreno-rustico/" className={styles.derivacionEnlace}>
                      simulador de finca rústica
                    </a>.
                  </p>
                )}

                <NumberInput
                  value={precioCompraOriginal}
                  onChange={setPrecioCompraOriginal}
                  label="Precio de compra original"
                  placeholder="150000"
                  helperText="Lo que pagaste cuando compraste"
                  min={0}
                />

                <NumberInput
                  value={aniosPropiedad}
                  onChange={setAniosPropiedad}
                  label="Años de propiedad"
                  placeholder="10"
                  // «con un coeficiente mayor» era falso: por debajo del año el coeficiente
                  // anual se PRORRATEA por meses completos (art. 107.4 TRLRHL), así que siempre
                  // es menor que el de un año entero (hallazgo 1560).
                  helperText="Años completos desde la compra hasta ahora. Escribe 0 si vendes antes de cumplir el año: esa reventa también tributa, y te preguntaremos los meses completos, porque el coeficiente se prorratea por ellos."
                  /*
                    SIN min={0} a propósito (hallazgo 722). El motor rechaza por escrito el año
                    negativo —acotarlo lo convertiría en una reventa antes del año y liquidaría un
                    impuesto a partir de un dato imposible—, pero el blur del NumberInput reescribía
                    el campo a «0», que desde bc437470 es un dato con significado fiscal propio: la
                    guarda quedaba inalcanzable y la app liquidaba 1.750 € sobre un valor que el
                    usuario nunca escribió. Sin min, el «-5» permanece en pantalla y la plusvalía
                    sigue diciendo «Sin calcular», que es lo que corresponde.
                  */
                  max={50}
                />

                {/* Con años = 0, los meses completos: el art. 107.4 TRLRHL prorratea el
                    coeficiente anual por ellos (hallazgo 1560). Un <select> y no un NumberInput:
                    son doce valores cerrados y no un importe que pueda escribirse mal. */}
                {aniosEnCero && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="meses-completos">
                      Meses completos desde la compra
                    </label>
                    <select
                      id="meses-completos"
                      value={mesesCompletos}
                      onChange={(e) => setMesesCompletos(e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Elige los meses</option>
                      {MESES_COMPLETOS.map((m) => (
                        <option key={m} value={String(m)}>
                          {m === 1 ? '1 mes' : `${m} meses`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.campoConAccion}>
                  <NumberInput
                    value={gastosAdquisicion}
                    onChange={setGastosAdquisicion}
                    label="Impuestos y gastos que pagaste al comprar"
                    placeholder="20000"
                    helperText="ITP o IVA, notaría, registro y gestoría de aquella compra. Suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)"
                    min={0}
                  />
                  {/* Cómo se pagó aquella compra (hallazgo 1794): la obra nueva no pagó ITP sino
                      IVA + AJD, y estimarla como segunda mano se quedaba corto en el valor de
                      adquisición. Un <select> y no dos botones: son dos valores cerrados, y así
                      no compiten por nombre con «Segunda mano»/«Primera mano» del comprador. */}
                  <label className={styles.labelEstimar} htmlFor="regimen-compra-original">
                    Para estimarlo, ¿aquella compra fue de segunda mano o de obra nueva?
                  </label>
                  <select
                    id="regimen-compra-original"
                    value={regimenCompraOriginal}
                    onChange={(e) => setRegimenCompraOriginal(e.target.value as TipoTransmision)}
                    className={styles.select}
                  >
                    <option value="segunda-mano">De segunda mano (pagaste ITP)</option>
                    <option value="primera-mano">Obra nueva, a la promotora (pagaste IVA + AJD)</option>
                  </select>
                  <button
                    type="button"
                    className={styles.btnEstimar}
                    onClick={estimarGastosAdquisicion}
                    disabled={!(parseSpanishNumber(precioCompraOriginal) > 0) || sinIvaCompraOriginal !== null}
                    aria-describedby="nota-estimar-gastos"
                  >
                    <span aria-hidden="true">✨</span> Estimar por mí
                  </button>
                  {/* Con qué tipos estima (hallazgo 1795): los de HOY y el general, no los del año
                      de aquella compra ni un reducido que se pudo pagar entonces. Visible siempre,
                      no solo tras pulsar: es lo que hay que saber ANTES de fiarse de la cifra. */}
                  <p id="nota-estimar-gastos" className={styles.notaEstimar}>
                    {sinIvaCompraOriginal
                      ? `En ${datosCcaaActual.nombre} la obra nueva no paga IVA sino ${sinIvaCompraOriginal.impuesto} (${sinIvaCompraOriginal.nombre}), que esta app no calcula: escribe lo que pagaste, que figura en tu escritura.`
                      : 'La estimación aplica los tipos generales vigentes hoy en la comunidad elegida, sin tipos reducidos: si aquella compra pagó otro tipo (el que regía en su año, o uno reducido por edad, familia numerosa o vivienda protegida), escribe lo que figura en tu escritura o en la autoliquidación del impuesto.'}
                  </p>
                </div>

                <NumberInput
                  value={mejoras}
                  onChange={setMejoras}
                  label="Inversiones y mejoras (opcional)"
                  placeholder="0"
                  helperText="Ampliaciones o instalaciones nuevas con factura. No cuentan pintura, sustituciones ni reparaciones de conservación"
                  min={0}
                />

                <NumberInput
                  value={valorCatastralSuelo}
                  onChange={setValorCatastralSuelo}
                  label="Valor catastral del suelo"
                  placeholder="50000"
                  helperText="Aparece en el recibo del IBI (solo la parte del suelo)"
                  min={0}
                />

                <NumberInput
                  value={valorCatastralTotal}
                  onChange={setValorCatastralTotal}
                  label="Valor catastral total (suelo + construcción)"
                  placeholder="120000"
                  helperText="También en el recibo del IBI. Sin este dato no se puede comparar el método real de la plusvalía y se aplica el objetivo"
                  min={0}
                />

                <NumberInput
                  value={comisionInmobiliaria}
                  onChange={setComisionInmobiliaria}
                  label="Comisión inmobiliaria (%)"
                  placeholder="3"
                  helperText={'Típico: entre el 3\u00A0% y el 5\u00A0%, aunque es de libre acuerdo y una tarifa mínima puede superarlo en un inmueble barato. La paga el vendedor'}
                  /*
                    SIN max a propósito (hallazgo 1796). Llevaba max={10}, y el blur del NumberInput
                    reescribía a «10» cualquier comisión mayor SIN decirlo: con el foco dentro se
                    publicaba el neto de lo escrito y al salir del campo el del 10 %. La comisión es
                    libre (una tarifa mínima sobre un garaje o un trastero supera el 10 % con
                    facilidad), así que se calcula lo escrito, como ya hacía local-comercial. Por
                    encima del 100 % no es una comisión: se avisa en el propio campo.
                  */
                  min={0}
                  error={
                    parseSpanishNumber(comisionInmobiliaria) > 100
                      ? 'La comisión no puede superar el 100\u00A0% del precio de venta: revisa el porcentaje'
                      : undefined
                  }
                />

                <NumberInput
                  value={otrosGastosVenta}
                  onChange={setOtrosGastosVenta}
                  label="Otros gastos de la venta (opcional)"
                  placeholder="0"
                  helperText="Lo que pagas TÚ al vender: certificado energético, cédula de habitabilidad, tu propia gestoría, cancelación registral de la hipoteca. La gestoría del comprador no cuenta (art. 35.1 LIRPF)"
                  min={0}
                />

                {/* Las dos exenciones de la ganancia son de la VIVIENDA habitual (arts. 33.4.b y
                    38 LIRPF): con otro inmueble las casillas no se ofrecen, en vez de venir
                    marcadas y eximir a un local, una nave o un terreno (hallazgo 1553, ALTO). */}
                {tipoInmueble === 'vivienda' ? (
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={esViviendaHabitual}
                        onChange={(e) => setEsViviendaHabitual(e.target.checked)}
                      />
                      <span>Es mi vivienda habitual</span>
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={vendedorMayor65}
                        onChange={(e) => setVendedorMayor65(e.target.checked)}
                      />
                      <span>Soy mayor de 65 años</span>
                    </label>
                    {esViviendaHabitual && !vendedorMayor65 && (
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={reinvierte}
                          onChange={(e) => setReinvierte(e.target.checked)}
                        />
                        <span>Voy a reinvertir en otra vivienda habitual</span>
                      </label>
                    )}
                  </div>
                ) : (
                  <p className={styles.derivacionPie} role="note">
                    La exención de los mayores de 65 años (art. 33.4.b LIRPF) y la de reinversión
                    (art. 38 LIRPF) son de la <strong>vivienda habitual</strong>: no se aplican a
                    la venta de {CON_ARTICULO[tipoInmueble]}, así que la ganancia tributa entera.
                  </p>
                )}

                {tipoInmueble === 'vivienda' && esViviendaHabitual && reinvierte && !vendedorMayor65 && (
                  <>
                    <NumberInput
                      value={importeReinversion}
                      onChange={setImporteReinversion}
                      label="Importe que reinviertes en la nueva vivienda"
                      placeholder="250000"
                      helperText="Tienes 2 años para hacerlo. Si reinviertes todo lo obtenido, la ganancia queda exenta por completo"
                      min={0}
                    />
                    <NumberInput
                      value={hipotecaPendiente}
                      onChange={setHipotecaPendiente}
                      label="Hipoteca pendiente de la vivienda que vendes"
                      placeholder="0"
                      helperText="Se resta del importe obtenido a efectos de la reinversión, así que reinvertir el resto ya basta para la exención total (art. 41 RIRPF)"
                      min={0}
                    />
                  </>
                )}
              </div>

              {resultadosVendedor ? (
                <>
                  <ResultCard
                    title="Precio de venta"
                    value={formatCurrency(resultadosVendedor.precioVenta)}
                    variant="default"
                    icon="🏷️"
                  />

                  {/* «Sin calcular» y no «0,00 €»: un cero se lee como «no pagas nada», y aquí
                      significa «faltan datos». La partida tampoco se suma al total ni al neto. */}
                  <ResultCard
                    title="Plusvalía municipal"
                    value={
                      !resultadosVendedor.plusvaliaCalculada
                        ? 'Sin calcular'
                        : resultadosVendedor.exentoPlusvalia
                          // «NO SUJETA» y no «EXENTO»: el art. 104.5 TRLRHL (RDL 26/2021)
                          // articula un supuesto de NO SUJECIÓN, o sea que el impuesto no
                          // llega a devengarse; la exención presupone un hecho imponible
                          // realizado. Hallazgo 901, encontrado en la app del garaje.
                          ? 'NO SUJETA'
                          : formatCurrency(resultadosVendedor.plusvaliaMunicipal)
                    }
                    variant={
                      !resultadosVendedor.plusvaliaCalculada
                        ? 'default'
                        : resultadosVendedor.exentoPlusvalia
                          ? 'success'
                          : 'warning'
                    }
                    icon="🏛️"
                    description={
                      resultadosVendedor.plusvaliaCalculada
                        ? resultadosVendedor.metodoPlusvalia
                        : `${[
                            camposQueFaltan.length > 0 ? faltaOFaltan(camposQueFaltan) : null,
                            resultadosVendedor.camposIlegibles.length > 0
                              ? noSePudoLeer(resultadosVendedor.camposIlegibles)
                              : null,
                            // Escrito, legible e imposible: ni «falta» ni «no se lee» (patrón 5).
                            resultadosVendedor.precioCompraNoValido ? AVISO_PRECIO_COMPRA_NO_VALIDO : null,
                            resultadosVendedor.aniosNegativos ? AVISO_ANIOS_NEGATIVOS : null,
                          ]
                            .filter((x): x is string => x !== null)
                            .join('; ')
                            .replace(/^./, (c) => c.toUpperCase())}. Este impuesto NO está incluido en el neto de abajo.`
                    }
                  />

                  {resultadosVendedor.valorAdquisicion > 0 && (
                    <ResultCard
                      title="Valor de adquisición"
                      value={formatCurrency(resultadosVendedor.valorAdquisicion)}
                      variant="default"
                      icon="📥"
                      // Afirmaba sumar lo que el motor tomó como 0 por ilegible (hallazgo 1230,
                      // el 1197 que ya estaba reparado en garaje, trastero y local-comercial).
                      description={
                        resultadosVendedor.gastosAdquisicionLegible && resultadosVendedor.mejorasLegible
                          ? 'Precio de compra + impuestos y gastos de aquella compra + mejoras'
                          : `Precio de compra y lo que se lee: ${noSePudoLeer([
                              ...(resultadosVendedor.gastosAdquisicionLegible ? [] : ['los impuestos y gastos de aquella compra']),
                              ...(resultadosVendedor.mejorasLegible ? [] : ['las mejoras']),
                            ])}, y no están sumados`
                      }
                    />
                  )}

                  {resultadosVendedor.valorAdquisicion > 0 && (
                    <ResultCard
                      title="Valor de transmisión"
                      value={formatCurrency(resultadosVendedor.valorTransmision)}
                      variant="default"
                      icon="📤"
                      // Sin la plusvalía calculada no puede decir que la resta: el motor la tomó
                      // como 0 y la ganancia y el IRPF de abajo son un máximo (patrón 2).
                      description={
                        resultadosVendedor.comisionLegible && resultadosVendedor.otrosVentaLegible
                          ? resultadosVendedor.plusvaliaCalculada
                            ? 'Precio de venta − comisión, otros gastos de la venta y plusvalía municipal'
                            : 'Precio de venta − comisión y otros gastos de la venta, sin la plusvalía municipal, que falta'
                          : `Precio de venta − ${resultadosVendedor.plusvaliaCalculada ? 'plusvalía municipal y ' : ''}los gastos que se leen${resultadosVendedor.plusvaliaCalculada ? '' : ' (sin la plusvalía municipal, que falta)'}: ${noSePudoLeer([
                              ...(resultadosVendedor.comisionLegible ? [] : ['la comisión']),
                              ...(resultadosVendedor.otrosVentaLegible ? [] : ['los otros gastos de la venta']),
                            ])}`
                      }
                    />
                  )}

                  {resultadosVendedor.sinGananciaNiPerdida ? (
                    /*
                      Ni ganancia ni pérdida: se vende EXACTAMENTE por el valor de adquisición.
                      Antes caía por la rama de la pérdida —`esPerdida` es `ganancia <= 0`— y la
                      app afirmaba dos cosas falsas a la vez: que se vendía por debajo del coste y
                      que había una pérdida compensable en la declaración (hallazgos 823 y 845).
                      Y el cero no es firme si un importe no se ha podido leer o falta la
                      plusvalía: lo dice el sondeo, no un texto fijo (patrón 6).
                    */
                    <ResultCard
                      title="Sin ganancia ni pérdida"
                      value={formatCurrency(0)}
                      variant="default"
                      icon="⚖️"
                      description={
                        avisoCero(resultadosVendedor.veredictoGanancia) ??
                        'Vendes exactamente por el valor de adquisición: no hay IRPF que pagar ni pérdida que compensar'
                      }
                    />
                  ) : resultadosVendedor.esPerdida ? (
                    <ResultCard
                      title="Pérdida patrimonial"
                      value={formatCurrency(Math.abs(resultadosVendedor.gananciaPatrimonial))}
                      variant="success"
                      icon="📉"
                      description={
                        avisoPerdida(resultadosVendedor.veredictoGanancia) ??
                        'Vendes por debajo del valor de adquisición: no hay IRPF que pagar y la pérdida se puede compensar en la declaración'
                      }
                    />
                  ) : (
                    resultadosVendedor.gananciaPatrimonial > 0 && (
                      <ResultCard
                        // Un MÁXIMO mientras falte la plusvalía, que resta del valor de
                        // transmisión al calcularse (patrón 2): se rotula como tal.
                        title={
                          esMaximoPorPlusvalia(resultadosVendedor.veredictoGanancia)
                            ? 'Ganancia patrimonial (máximo)'
                            : 'Ganancia patrimonial'
                        }
                        value={formatCurrency(resultadosVendedor.gananciaPatrimonial)}
                        variant="info"
                        icon="📈"
                        description={
                          avisoTarjeta(resultadosVendedor.veredictoGanancia, 'la ganancia') ??
                          (resultadosVendedor.baseImponibleIRPF < resultadosVendedor.gananciaPatrimonial
                            ? `Tributa ${formatCurrency(resultadosVendedor.baseImponibleIRPF)} tras aplicar la exención`
                            : 'Base para IRPF')
                        }
                      />
                    )
                  )}

                  <ResultCard
                    title={
                      resultadosVendedor.irpfGanancia > 0 && esMaximoPorPlusvalia(resultadosVendedor.veredictoIrpf)
                        ? 'IRPF sobre ganancia (máximo)'
                        : 'IRPF sobre ganancia'
                    }
                    // «EXENTO» solo cuando hay una ganancia que una exención deja sin cuota. Sin
                    // ganancia, o con pérdida, no hay nada exento: es ausencia de ganancia, y el cero
                    // salía «EXENTO · Tributación en base del ahorro» (hallazgo 1554, residuo del 724).
                    value={
                      !resultadosVendedor.irpfCalculado
                        ? 'Sin calcular'
                        : irpfExento
                          ? 'EXENTO'
                          : resultadosVendedor.irpfGanancia > 0
                            ? formatCurrency(resultadosVendedor.irpfGanancia)
                            : 'SIN CUOTA'
                    }
                    variant={
                      !resultadosVendedor.irpfCalculado
                        ? 'default'
                        : irpfExento || resultadosVendedor.irpfGanancia === 0
                          ? 'success'
                          : 'warning'
                    }
                    icon="💸"
                    description={
                      !resultadosVendedor.irpfCalculado
                        ? resultadosVendedor.camposIlegibles.includes('el precio de compra original')
                          ? 'El precio de compra original no se ha podido leer: escríbelo con coma decimal (1.234,56). Este impuesto NO está incluido en el neto de abajo.'
                          : resultadosVendedor.precioCompraNoValido
                            ? `${mayuscula(AVISO_PRECIO_COMPRA_NO_VALIDO)}: corrígelo. Este impuesto NO está incluido en el neto de abajo.`
                            : 'Falta el precio de compra original. Este impuesto NO está incluido en el neto de abajo.'
                        : // La dirección de los ilegibles la da el sondeo: una cuota exenta por edad
                          // no puede moverse y ya no se rotula «TECHO» borrando el motivo de la
                          // exención (1227); el total catastral la SUBE, no la baja (1228). La
                          // plusvalía que falta solo cuenta si hay cuota que bajar (patrón 2).
                          (avisoTarjeta(resultadosVendedor.veredictoIrpf, 'la cuota', resultadosVendedor.irpfGanancia > 0) ??
                          (irpfExento
                            ? resultadosVendedor.exentoIRPF
                              ? 'Mayor de 65 años + vivienda habitual'
                              : separarPorcentajes(resultadosVendedor.motivoExencion ?? 'Ganancia exenta')
                            : resultadosVendedor.gananciaPatrimonial < 0
                              // No es una exención, es ausencia de ganancia — y la diferencia importa:
                              // una pérdida se compensa en la declaración y una exención no (724).
                              ? 'No hay ganancia que gravar: la pérdida se compensa con otras ganancias del ahorro en tu declaración'
                              : resultadosVendedor.gananciaPatrimonial === 0
                                ? 'No hay ganancia que gravar, así que esta venta no tiene IRPF'
                                : separarPorcentajes(resultadosVendedor.motivoExencion ?? 'Tributación en base del ahorro')))
                    }
                  />

                  {/* Un porcentaje ilegible no hace desaparecer su línea (hallazgo 1230, el 1191 de
                      la gestoría del comprador de esta misma app). */}
                  {(resultadosVendedor.comisionInmobiliaria > 0 || !resultadosVendedor.comisionLegible) && (
                    <ResultCard
                      title={
                        resultadosVendedor.comisionLegible
                          ? // El número, formateado, y no la cadena tecleada: «3.5» se rotulaba
                            // «(3.5%)», con el punto estadounidense (hallazgo 1558).
                            `Comisión inmobiliaria (${formatTipoNominal(parseSpanishNumberOr(comisionInmobiliaria))}\u00A0%)`
                          : 'Comisión inmobiliaria'
                      }
                      value={resultadosVendedor.comisionLegible ? formatCurrency(resultadosVendedor.comisionInmobiliaria) : 'Sin leer'}
                      variant="default"
                      icon="🏪"
                      description={
                        resultadosVendedor.comisionLegible
                          ? undefined
                          : 'El porcentaje no se ha podido leer: escríbelo con coma decimal (3,5)'
                      }
                    />
                  )}


                  {(resultadosVendedor.otrosGastosVenta > 0 || !resultadosVendedor.otrosVentaLegible) && (
                    <ResultCard
                      title="Otros gastos de la venta"
                      value={resultadosVendedor.otrosVentaLegible ? formatCurrency(resultadosVendedor.otrosGastosVenta) : 'Sin leer'}
                      variant="default"
                      icon="📄"
                      description={
                        resultadosVendedor.otrosVentaLegible
                          ? undefined
                          : 'El importe no se ha podido leer: escríbelo con coma decimal (1.234,56)'
                      }
                    />
                  )}

                  <div className={styles.separador} />

                  {/* El aviso nombra TODAS las partidas que faltan, no solo la plusvalía: con el
                      precio de compra en blanco, el IRPF tampoco entra en el neto y el único
                      aviso que había daba a entender que el resto estaba completo. */}
                  {/* Redacción común de la familia (decidida el 24/09/2026, la de local-comercial):
                      el título dice «(PARCIAL)» y cada frase termina en la dirección del neto real. */}
                  <ResultCard
                    title={netoParcial ? 'Total gastos vendedor (parcial)' : 'Total gastos vendedor'}
                    value={formatCurrency(resultadosVendedor.totalGastos)}
                    variant="warning"
                    icon="➖"
                    description={
                      faltanEnElNeto.length > 0 || avisoIlegiblesNeto
                        ? [
                            faltanEnElNeto.length > 0
                              ? `SIN ${enumerarNi(faltanEnElNeto)}, que no se ${faltanEnElNeto.length > 1 ? 'incluyen' : 'incluye'}`
                              : null,
                            avisoIlegiblesNeto ? 'con importes que no se han podido leer (ver el neto de abajo)' : null,
                          ]
                            .filter(Boolean)
                            .join(' — ')
                        : undefined
                    }
                  />

                  <ResultCard
                    title={netoParcial ? 'IMPORTE NETO VENDEDOR (PARCIAL)' : 'IMPORTE NETO VENDEDOR'}
                    value={formatCurrency(resultadosVendedor.netoVendedor)}
                    variant="highlight"
                    icon="💰"
                    description={
                      (() => {
                        // La dirección de los importes ilegibles la da el sondeo del cálculo
                        // (avisoIlegiblesNeto); aquí solo se compone la frase.
                        const avisos: string[] = [];
                        // «puede ser», no «será»: un impuesto sin calcular también puede salir a cero.
                        if (faltanEnElNeto.length > 0) {
                          avisos.push(`No descuenta ${enumerarNi(faltanEnElNeto)}: el neto real puede ser menor que este`);
                        }
                        if (resultadosVendedor.camposIlegibles.length > 0) {
                          avisos.push(mayuscula(noSePudoLeer(resultadosVendedor.camposIlegibles)));
                        }
                        if (avisoIlegiblesNeto) avisos.push(avisoIlegiblesNeto);
                        // El par catastral imposible: la plusvalía se liquidó por el objetivo sin
                        // comparar con el real, que puede salir más barato (hallazgo 1232, el mismo
                        // mecanismo que el total ilegible de C1).
                        if (resultadosVendedor.parCatastralImposible) {
                          avisos.push(
                            'El valor catastral del suelo supera al total, y con el recibo del IBI bien leído la plusvalía puede salir más barata por el método real: el neto real puede ser MAYOR que este',
                          );
                        }
                        if (avisos.length === 0) return 'Lo que realmente recibes';
                        const rellenar = camposQueFaltan.filter((c) => c !== 'los meses completos desde la compra');
                        const pedir = [
                          rellenar.length > 0 ? `Rellena ${enumerar(rellenar)}` : null,
                          resultadosVendedor.faltanMeses ? 'elige los meses completos desde la compra' : null,
                          // Un año negativo no «falta»: se corrige (patrón 5, hallazgo 1552).
                          resultadosVendedor.aniosNegativos ? 'corrige los años de tenencia (no pueden ser negativos)' : null,
                          // Ni un precio de compra 0: está escrito y no vale (hallazgo 1799).
                          resultadosVendedor.precioCompraNoValido ? 'corrige el precio de compra original (tiene que ser mayor que 0)' : null,
                          resultadosVendedor.camposIlegibles.length > 0 || avisoIlegiblesNeto
                            ? 'escribe con coma decimal (1.234,56) lo que no se ha podido leer'
                            : null,
                          resultadosVendedor.parCatastralImposible ? 'revisa los dos valores catastrales del recibo del IBI' : null,
                        ].filter((x): x is string => x !== null);
                        const texto = pedir.join(' y ');
                        return `${avisos.join('. ')}. ${mayuscula(texto)} para obtenerlo.`;
                      })()
                    }
                  />
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
                  <p>
                    {escritoIlegible(precioVenta, parseSpanishNumber)
                      ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio de venta con coma decimal (200.000 o 200000,50) para calcular el neto del vendedor`
                      : 'Introduce el precio de venta y los datos adicionales para calcular el neto del vendedor'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer Educativo */}
      <div className={styles.disclaimer}>
        <h3><span aria-hidden="true">⚠️</span> Información Importante sobre Estimaciones</h3>
        <p>
          Esta calculadora proporciona <strong>estimaciones orientativas</strong>. Los importes reales pueden variar según:
        </p>
        <ul>
          <li>El <strong>valor de referencia catastral</strong> (base mínima imponible desde 2022)</li>
          <li>Condiciones específicas de tu situación personal</li>
          <li>Coeficientes de plusvalía de cada municipio</li>
          <li>Aranceles notariales que pueden variar según la complejidad</li>
        </ul>

        <h4><span aria-hidden="true">⚠️</span> Verificación de Datos Tributarios</h4>
        <p>
          Los tipos de <strong>ITP, AJD y aranceles notariales</strong> pueden haber cambiado desde la última verificación
          de esta herramienta (ver fecha en &quot;Datos de referencia&quot; más arriba). <strong>Verifica los tipos vigentes</strong> con tu comunidad autónoma
          antes de tomar decisiones.
        </p>

        <h4><span aria-hidden="true">⚠️</span> NO Sustituye Asesoramiento Profesional</h4>
        <p>
          Esta calculadora <strong>NO sustituye el asesoramiento</strong> de un notario, abogado o asesor fiscal.
          Usa los resultados como <strong>estimación orientativa</strong>, NO como base para decisiones legales
          o financieras definitivas.
        </p>

        <h4><span aria-hidden="true">📋</span> Fuentes Oficiales de Consulta</h4>
        <ul>
          <li><strong>ITP/IVA/AJD:</strong> Consulta la normativa tributaria de tu comunidad autónoma</li>
          <li><strong>Aranceles:</strong> Real Decreto 1426/1989 (notarías) y 1427/1989 (registros)</li>
          <li><strong>Valor de referencia:</strong> <a href={ENLACE_CATASTRO} target="_blank" rel="noopener noreferrer">Sede Electrónica del Catastro</a></li>
          <li><strong>Agencia Tributaria:</strong> <a href="https://www.agenciatributaria.es" target="_blank" rel="noopener noreferrer">www.agenciatributaria.es</a></li>
        </ul>

        <h4><span aria-hidden="true">💡</span> Exenciones y Bonificaciones</h4>
        <p>
          <strong>Plusvalía en IRPF:</strong> Los mayores de 65 años que venden su vivienda habitual
          están exentos de tributar por la ganancia patrimonial en IRPF. Existen otras bonificaciones
          autonómicas según perfil (jóvenes, familias numerosas, discapacidad). <strong>Consulta con tu asesor fiscal.</strong>
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor los gastos de comprar o vender una vivienda?"
        subtitle="Descubre qué impuestos se pagan, cómo funcionan los aranceles y las bonificaciones disponibles"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Impuestos en la compraventa inmobiliaria</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🔄</span> Segunda mano → ITP</h4>
              <p>
                El <strong>Impuesto de Transmisiones Patrimoniales</strong> grava las compras de inmuebles de segunda mano.
                Cada comunidad autónoma fija su propio tipo, que en la vivienda va del {formatNumber(RANGO_ITP_VIVIENDA.min, 0)}&nbsp;% (País Vasco) al {formatNumber(RANGO_ITP_VIVIENDA.max, 0)}&nbsp;% (el tramo más alto de las escalas progresivas de Baleares y Cataluña).
                En el País Vasco ese {formatNumber(RANGO_ITP_VIVIENDA.min, 0)}&nbsp;% es solo de la vivienda: un local, una nave, un terreno o un garaje comprado por separado pagan el {formatNumber(ITP_PV_NO_VIVIENDA, 0)}&nbsp;%.
              </p>
              <p>
                La base imponible es el <strong>mayor valor</strong> entre el precio escriturado y el valor de referencia catastral.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🆕</span> Primera mano → IVA + AJD</h4>
              <p>
                Las viviendas nuevas (primera transmisión del promotor) pagan <strong>IVA al {formatNumber(IVA_INMUEBLES_2025.obraNueva, 0)}&nbsp;%</strong>.
                Los locales comerciales y las naves industriales pagan <strong>IVA al {formatNumber(IVA_INMUEBLES_2025.local, 0)}&nbsp;%</strong>, y el suelo edificable, el tipo general del <strong>{formatNumber(PORCENTAJES_IVA.general, 0)}&nbsp;%</strong> (art. 90 LIVA), que es el que aplica la calculadora de arriba.
              </p>
              <p>
                Además, se paga <strong>AJD</strong> (Actos Jurídicos Documentados), que en la vivienda va del {formatNumber(RANGO_AJD_VIVIENDA.min, 0)}&nbsp;% al {formatNumber(RANGO_AJD_VIVIENDA.max, 1)}&nbsp;% según la comunidad: el País Vasco exime la primera transmisión de vivienda, por su régimen foral.
                En locales, naves y suelo va del {formatNumber(RANGO_AJD_OTROS.min, 1)}&nbsp;% al {formatNumber(RANGO_AJD_OTROS.max, 1)}&nbsp;%, también en el País Vasco.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🏛️</span> Plusvalía municipal</h4>
              <p>
                El vendedor debe pagar el <strong>Impuesto sobre el Incremento del Valor de los Terrenos</strong> (plusvalía municipal).
              </p>
              <p>
                Desde 2021, puede elegir entre el método <strong>objetivo</strong> (valor catastral del suelo × coeficiente
                según los años de tenencia) o el <strong>real</strong>, pagando el que resulte más favorable.
              </p>
              <p>
                En el método real, el incremento de la operación (venta menos compra) <strong>no tributa entero</strong>:
                solo la parte que corresponde al suelo, en la misma proporción que el suelo representa sobre el valor
                catastral total. Por eso hacen falta las dos cifras del recibo del IBI, no solo la del suelo.
              </p>
              <p>
                <strong>Si no hay incremento de valor, no se paga</strong> (sentencia del Tribunal Constitucional
                de 26 de octubre de 2021).
              </p>
              <p>
                Esta calculadora aplica un <strong>tipo del {formatNumber(PLUSVALIA_MUNICIPAL_META.tipoOrientativo, 0)}&nbsp;%</strong> como referencia orientativa habitual;
                cada ayuntamiento fija su propio tipo, con un <strong>máximo legal del {formatNumber(PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal, 0)}&nbsp;%</strong>.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">💰</span> IRPF del vendedor</h4>
              <p>
                La ganancia patrimonial tributa en la <strong>base del ahorro</strong> con tipos del {formatNumber(TIPO_AHORRO_MIN, 0)}&nbsp;% al {formatNumber(TIPO_AHORRO_MAX, 0)}&nbsp;%
                según el importe.
              </p>
              <p>
                No es la simple diferencia entre lo que pagaste y lo que cobras: al precio de compra se le suman
                los <strong>impuestos y gastos de aquella compra</strong> y las mejoras, y del precio de venta se
                restan la comisión, tu propia gestoría —la del comprador no cuenta, art. 35.1 LIRPF— y la
                <strong> plusvalía municipal</strong>. Declararlos puede rebajar la factura varios miles de euros.
              </p>
              <p>
                <strong>Exención total</strong> para mayores de 65 años que venden su vivienda habitual, y
                <strong> exención por reinversión</strong> —total o proporcional a lo reinvertido— para quien
                vende su vivienda habitual y compra otra en los 2 años siguientes.
              </p>
            </div>
          </div>

          <h2>Beneficios fiscales del ITP</h2>
          <p className={styles.introParagraph}>
            Muchas comunidades rebajan el ITP a determinados colectivos, unas con tipos reducidos y
            otras con bonificaciones sobre la cuota (Aragón, por ejemplo, solo con lo segundo):
          </p>
          <ul className={styles.listaReducidos}>
            <li><strong>Jóvenes</strong> (cada comunidad fija su propia edad tope, y no coinciden: el panel de beneficios fiscales de arriba muestra la de la comunidad elegida)</li>
            <li><strong>Familias numerosas</strong></li>
            <li><strong>Personas con discapacidad</strong> (≥33&nbsp;% o ≥65&nbsp;%)</li>
            <li><strong>VPO</strong> (Vivienda de Protección Oficial)</li>
            <li><strong>Municipios con despoblación</strong></li>
            <li><strong>Víctimas de violencia de género</strong></li>
          </ul>
          <p>
            Cada comunidad tiene sus propios requisitos y límites de valor del inmueble.
            Consulta la normativa específica de tu comunidad.
          </p>

          <h2>Gastos de notaría y registro</h2>
          <p className={styles.introParagraph}>
            Los aranceles están regulados por ley (Real Decreto 1426/1989 y 1427/1989) y se calculan
            según el valor del inmueble con una escala progresiva.
          </p>
          <ul>
            <li><strong>Notaría:</strong> entre {eurosOrientativos(HORQUILLA_FEDATARIOS.notaria.min)} y {eurosOrientativos(HORQUILLA_FEDATARIOS.notaria.max)} para viviendas de {eurosEnteros(BANDA_PRECIO_VIVIENDA.min)} a {eurosEnteros(BANDA_PRECIO_VIVIENDA.max)}, IVA incluido</li>
            <li><strong>Registro:</strong> entre {eurosOrientativos(HORQUILLA_FEDATARIOS.registro.min)} y {eurosOrientativos(HORQUILLA_FEDATARIOS.registro.max)} en esa misma banda, IVA incluido</li>
            <li><strong>Gestoría:</strong> Opcional, entre {eurosEnteros(HORQUILLA_GESTORIA.min)} y {eurosEnteros(HORQUILLA_GESTORIA.max)} (tramitación de documentos)</li>
          </ul>
        </section>

        {/* Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>Comparativa de impuestos en compraventa</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Vivienda nueva</th>
                  <th>Vivienda segunda mano</th>
                  <th>¿Quién paga?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IVA</td>
                  <td>{formatNumber(IVA_INMUEBLES_2025.obraNueva, 0)}&nbsp;% ({formatNumber(IVA_INMUEBLES_2025.local, 0)}&nbsp;% locales y naves · {formatNumber(PORCENTAJES_IVA.general, 0)}&nbsp;% terrenos)</td>
                  <td>No aplica</td>
                  <td>Comprador</td>
                </tr>
                <tr>
                  <td>ITP</td>
                  <td>No aplica</td>
                  <td>{formatNumber(RANGO_ITP_VIVIENDA.min, 0)}&nbsp;% – {formatNumber(RANGO_ITP_VIVIENDA.max, 0)}&nbsp;% (según CC.AA.)</td>
                  <td>Comprador</td>
                </tr>
                <tr>
                  <td>AJD</td>
                  <td>{formatNumber(RANGO_AJD_VIVIENDA.min, 0)}&nbsp;% – {formatNumber(RANGO_AJD_VIVIENDA.max, 1)}&nbsp;%</td>
                  <td>{formatNumber(RANGO_AJD_VIVIENDA.min, 0)}&nbsp;% – {formatNumber(RANGO_AJD_VIVIENDA.max, 1)}&nbsp;% (con hipoteca)</td>
                  <td>Comprador · con hipoteca, la entidad financiera (Ley 5/2019)</td>
                </tr>
                <tr>
                  <td>Plusvalía municipal</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Vendedor</td>
                </tr>
                <tr>
                  <td>IRPF ganancia patrimonial</td>
                  <td>{formatNumber(TIPO_AHORRO_MIN, 0)}&nbsp;% – {formatNumber(TIPO_AHORRO_MAX, 0)}&nbsp;%</td>
                  <td>{formatNumber(TIPO_AHORRO_MIN, 0)}&nbsp;% – {formatNumber(TIPO_AHORRO_MAX, 0)}&nbsp;%</td>
                  <td>Vendedor</td>
                </tr>
                <tr>
                  <td>Notaría</td>
                  <td>{eurosOrientativos(HORQUILLA_FEDATARIOS.notaria.min)} – {eurosOrientativos(HORQUILLA_FEDATARIOS.notaria.max)}</td>
                  <td>{eurosOrientativos(HORQUILLA_FEDATARIOS.notaria.min)} – {eurosOrientativos(HORQUILLA_FEDATARIOS.notaria.max)}</td>
                  <td>Comprador</td>
                </tr>
                <tr>
                  <td>Registro de la propiedad</td>
                  <td>{eurosOrientativos(HORQUILLA_FEDATARIOS.registro.min)} – {eurosOrientativos(HORQUILLA_FEDATARIOS.registro.max)}</td>
                  <td>{eurosOrientativos(HORQUILLA_FEDATARIOS.registro.min)} – {eurosOrientativos(HORQUILLA_FEDATARIOS.registro.max)}</td>
                  <td>Comprador</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.eduSection}>
          <h2>Casos de uso reales</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🏠</span>
                <span className={styles.casoTag}>Comprador primera vivienda</span>
              </div>
              <p>Marta, {EJEMPLO_MARTA_EDAD} años, compra su primera vivienda habitual de segunda mano en {ITP_CCAA[EJEMPLO_MARTA.ccaa].nombre} por
              {' '}{eurosEnteros(EJEMPLO_MARTA.precio)}. {EJEMPLO_MARTA_JOVEN_APLICA
                ? <>Al ser menor de {EJEMPLO_MARTA_EDAD_TOPE} años{EJEMPLO_MARTA_TOPE ? <> y no superar los {eurosEnteros(EJEMPLO_MARTA_TOPE)}</> : null}, se aplica el tipo
              reducido de ITP del {formatTipoNominal(EJEMPLO_MARTA_TIPO_JOVEN)}&nbsp;% ({eurosEnteros(EJEMPLO_MARTA_ITP)}) en lugar del tipo general
              del {formatTipoNominal(EJEMPLO_MARTA_TIPO_GENERAL)}&nbsp;%.</>
                : <>Aunque es menor de {EJEMPLO_MARTA_EDAD_TOPE} años, su compra supera el tope de {EJEMPLO_MARTA_TOPE ? eurosEnteros(EJEMPLO_MARTA_TOPE) : 'valor'} del tipo
              reducido, así que paga el tipo general del {formatTipoNominal(EJEMPLO_MARTA_TIPO_GENERAL)}&nbsp;% ({eurosEnteros(EJEMPLO_MARTA_ITP)}).</>} Además paga
              unos {eurosEnteros(EJEMPLO_MARTA_GASTOS)} en notaría ({eurosEnteros(EJEMPLO_MARTA_NOTARIA)}), registro ({eurosEnteros(EJEMPLO_MARTA_REGISTRO)}) y gestoría ({eurosEnteros(EJEMPLO_MARTA_GESTORIA)}).</p>
              <div className={styles.casoResultado}>{EJEMPLO_MARTA_JOVEN_APLICA
                ? <>Ahorra {eurosEnteros(EJEMPLO_MARTA_AHORRO)} frente al tipo general del {formatTipoNominal(EJEMPLO_MARTA_TIPO_GENERAL)}&nbsp;%</>
                : <>Sin ahorro: el tipo reducido de jóvenes no alcanza a este precio</>}</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🏗️</span>
                <span className={styles.casoTag}>Comprador obra nueva</span>
              </div>
              <p>Carlos compra un piso nuevo en Valencia por {eurosEnteros(EJEMPLO_OBRA_NUEVA.precio)}. Paga el {formatNumber(IVA_INMUEBLES_2025.obraNueva, 0)}&nbsp;% de IVA ({eurosEnteros(EJEMPLO_OBRA_NUEVA_IVA)})
              más el {formatTipoNominal(EJEMPLO_OBRA_NUEVA_AJD_TIPO)}&nbsp;% de AJD ({eurosEnteros(EJEMPLO_OBRA_NUEVA_AJD)}) al ser la primera transmisión del promotor.
              El total de impuestos asciende a {eurosEnteros(EJEMPLO_OBRA_NUEVA_IVA + EJEMPLO_OBRA_NUEVA_AJD)}.
              {EJEMPLO_OBRA_NUEVA_AJD_HABITUAL.motivo === 'vivienda-habitual'
                ? <> Si el piso va a ser su vivienda habitual, el AJD valenciano baja al {formatTipoNominal(EJEMPLO_OBRA_NUEVA_AJD_HABITUAL.tipo)}&nbsp;%.</>
                : null}</p>
              <div className={styles.casoResultado}>IVA + AJD frente a ITP en segunda mano</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">💸</span>
                <span className={styles.casoTag}>Vendedor con ganancia</span>
              </div>
              <p>Ana vende su piso por {eurosEnteros(EJEMPLO_ANA.precioVenta)}. Lo compró hace {EJEMPLO_ANA.anios} años
              por {eurosEnteros(EJEMPLO_ANA.precioCompra)}, y el valor catastral de su suelo es de {eurosEnteros(EJEMPLO_ANA.valorSuelo)}.
              Paga la comisión inmobiliaria ({formatTipoNominal(EJEMPLO_ANA.comisionPct)}&nbsp;%, {eurosEnteros(EJEMPLO_ANA_CALCULO.comision)})
              y la plusvalía municipal ({eurosEnteros(EJEMPLO_ANA_CALCULO.plusvalia)} por el método objetivo), y las dos
              minoran el valor de transmisión: su ganancia patrimonial es de {eurosEnteros(EJEMPLO_ANA_CALCULO.ganancia)},
              que tributa al {formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo, 0)}&nbsp;% los primeros {eurosEnteros(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].hasta)}, al {formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[1].tipo, 0)}&nbsp;% hasta {eurosEnteros(TRAMOS_GANANCIAS_PATRIMONIALES_2025[1].hasta)} y al {formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[2].tipo, 0)}&nbsp;% el resto: {formatCurrency(EJEMPLO_ANA_CALCULO.irpf)} de IRPF.
              La gestoría del comprador NO se resta: el art. 35.1 LIRPF solo admite los gastos
              satisfechos por quien transmite.</p>
              <div className={styles.casoResultado}>Ganancia patrimonial sujeta a IRPF del ahorro</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">👴</span>
                <span className={styles.casoTag}>Vendedor mayor de 65 años</span>
              </div>
              <p>Pedro, 67 años, vende su vivienda habitual por 300.000 €. Al ser mayor de 65 años
              y tratarse de la residencia habitual, está exento de tributar la ganancia patrimonial
              en IRPF. Solo debe abonar la plusvalía municipal.</p>
              <div className={styles.casoResultado}>Exención total de IRPF por edad y vivienda habitual</div>
            </div>
          </div>
        </section>

        {/* FAQ ampliado */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre gastos de compraventa</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre ITP e IVA en la compra de una vivienda?</h4>
              <p>El ITP se aplica a viviendas de segunda mano (transmisiones entre particulares), mientras que
              el IVA al {formatNumber(IVA_INMUEBLES_2025.obraNueva, 0)}&nbsp;% se paga en viviendas nuevas (primera entrega del promotor). No pueden coexistir
              en la misma operación: o se paga uno u otro, nunca ambos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo negociar quién paga cada gasto?</h4>
              <p>En principio, salvo los gastos del vendedor (plusvalía municipal, IRPF), el resto son del comprador
              por ley. Sin embargo, es posible pactar condiciones distintas en el contrato privado. Lo que no puede
              modificarse es la obligación tributaria frente a Hacienda.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el valor de referencia catastral y cómo afecta al ITP?</h4>
              <p>Desde 2022, la base imponible del ITP es el mayor valor entre el precio escriturado y el valor
              de referencia catastral (publicado por el Catastro). Si el valor de referencia supera el precio
              de compra, deberás pagar ITP sobre ese valor mayor, aunque hayas comprado más barato.</p>
            </div>
            <div className={styles.faqItem}>
              {/* «Quedar exento» era falso: el art. 104.5 TRLRHL (redacción del RDL 26/2021) articula
                  un supuesto de NO SUJECIÓN, que es lo que ya dice la tarjeta del vendedor (hallazgo
                  1557). La misma respuesta, en las dos bocas del JSON-LD de metadata.ts. */}
              <h4>{PREGUNTA_NO_SUJECION}</h4>
              <p>{RESPUESTA_NO_SUJECION}</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué gastos puede deducir el comprador en la declaración de la renta?</h4>
              <p>Si compras con hipoteca, los gastos financieros no son deducibles en IRPF desde 2013
              (solo para contratos anteriores). Sin embargo, los gastos de compraventa (notaría, registro, ITP)
              incrementan el valor de adquisición, reduciendo la ganancia patrimonial futura al vender.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué son los tipos reducidos de ITP y cómo acceder a ellos?</h4>
              <p>Muchas comunidades aplican tipos reducidos para jóvenes, familias numerosas,
              personas con discapacidad (≥33&nbsp;%), VPO o municipios en riesgo de despoblación. Los requisitos
              (edad, ingresos, valor máximo del inmueble) varían por comunidad: la edad tope del tipo joven
              va de los {EDAD_JOVEN.min} a los {EDAD_JOVEN.max} años según dónde compres, y el panel de beneficios fiscales de la
              calculadora muestra la que aplica en cada caso. Consulta la normativa de tu CC.AA.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿La gestoría es obligatoria en la compraventa?</h4>
              <p>No es obligatoria por ley, pero los bancos suelen exigirla cuando hay hipoteca para asegurarse
              de que la documentación se tramita correctamente. Su coste oscila entre {eurosEnteros(HORQUILLA_GESTORIA.min)} y {eurosEnteros(HORQUILLA_GESTORIA.max)}.
              Sin hipoteca, puedes presentar los impuestos directamente o contratar una gestoría por comodidad.</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo gestionar los gastos de una compraventa: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Calcula el presupuesto total antes de firmar</strong>
                <p>Suma al precio del inmueble entre un {formatNumber(HORQUILLA_GASTOS_COMPRAVENTA.min, 1)}&nbsp;% y un {formatNumber(HORQUILLA_GASTOS_COMPRAVENTA.max, 1)}&nbsp;% adicional
                para gastos e impuestos: el punto exacto dentro de esa horquilla depende de la comunidad, del
                precio y de si la compra es de obra nueva o de segunda mano. Usa el simulador para obtener la
                cifra de tu caso.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Comprueba si tienes derecho a tipos reducidos de ITP</strong>
                <p>Verifica los requisitos de tu comunidad autónoma: edad, ingresos, discapacidad, familia numerosa.
                Un tipo reducido puede suponerte miles de euros de ahorro en el impuesto principal.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Firma el contrato de arras con condiciones claras</strong>
                <p>En el contrato de arras, especifica quién asume cada gasto. Aunque los impuestos del comprador
                no son negociables frente a Hacienda, sí puedes acordar que el vendedor asuma ciertos gastos notariales.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Firma ante notario y recibe la escritura</strong>
                <p>En el momento de la firma, el notario calcula sus honorarios según los aranceles oficiales.
                La gestoría (o tú mismo) se encargará de tramitar los impuestos en los plazos legales.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Liquida los impuestos en el plazo establecido</strong>
                <p>El ITP o IVA+AJD debe liquidarse en un plazo de {PLAZO_ITP.dias} {PLAZO_ITP.unidad} desde
                la firma ({PLAZO_ITP.baseNormativa}). {PLAZO_ITP.aviso}
                El incumplimiento genera un recargo desde el primer día: un {ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase}&nbsp;%
                de partida más otro {ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes}&nbsp;% por cada mes completo de retraso,
                y el {ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses}&nbsp;% más intereses de demora una vez transcurridos
                {' '}{ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses ({ESCALA_RECARGO_EXTEMPORANEO.baseNormativa}).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Inscribe la propiedad en el Registro</strong>
                <p>Una vez pagados los impuestos, presenta la escritura en el Registro de la Propiedad.
                Guarda todos los justificantes de pago para futuras ventas, ya que incrementan el valor
                de adquisición y reducen la posible ganancia patrimonial tributable.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.eduSection}>
          <h2>Consejos para reducir los gastos de compraventa</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Verifica el valor de referencia catastral</strong>
              <p>Consulta el valor catastral antes de negociar el precio. Si supera el precio de mercado,
              prepara documentación para impugnar la base imponible del ITP.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <strong>Solicita varios presupuestos de notaría</strong>
              <p>Aunque los aranceles notariales están regulados, los complementos y servicios adicionales
              pueden variar. Compara y elige la notaría con mejor relación calidad-precio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Planifica los plazos fiscales</strong>
              <p>Liquida los impuestos en los {PLAZO_ITP.dias} {PLAZO_ITP.unidad} legales
              ({PLAZO_ITP.baseNormativa}); {PLAZO_ITP.aviso.charAt(0).toLowerCase() + PLAZO_ITP.aviso.slice(1)} Un retraso, aunque sea breve,
              genera recargos automáticos. Tenlo agendado desde el día de la firma.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏦</span>
              <strong>Negocia quién asume la gestoría</strong>
              <p>En operaciones con hipoteca bancaria, el banco a veces incluye la gestoría en sus servicios.
              Verifica si puedes elegir tu propia gestoría para reducir costes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📁</span>
              <strong>Guarda todos los justificantes</strong>
              <p>Conserva las facturas de notaría, registro, impuestos y reformas. Cuando vendas en el futuro,
              estos gastos incrementan el valor de adquisición y reducen la ganancia patrimonial tributable:
              es justo lo que recoge el campo &laquo;impuestos y gastos que pagaste al comprar&raquo; de la
              pestaña Vendedor.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👨‍💼</span>
              <strong>Consulta a un asesor fiscal</strong>
              <p>Este simulador aplica la exención por reinversión en vivienda habitual y la de mayores de 65 años,
              pero hay situaciones que no cubre: herencias, divorcios, no residentes, varios titulares y los
              coeficientes de abatimiento de las compras anteriores a 1995. Ahí un asesor fiscal sí marca la diferencia.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes al calcular los gastos de compraventa</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>No incluir el IVA de notaría y registro:</strong> Los honorarios de notaría y registro llevan IVA al {formatNumber(PORCENTAJES_IVA.general, 0)}&nbsp;%, que a menudo se olvida en el presupuesto inicial.</li>
            <li><strong>Ignorar el valor de referencia catastral:</strong> Si supera el precio escriturado, Hacienda aplicará ITP sobre ese valor mayor y podrás recibir una comprobación de valores.</li>
            <li><strong>Confundir ITP con AJD en segunda mano:</strong> En segunda mano solo se paga ITP; el AJD solo aplica en escrituras con hipoteca. No se duplican.</li>
            <li><strong>Olvidar los gastos del vendedor:</strong> La plusvalía municipal y la posible ganancia patrimonial en IRPF son cargas del vendedor que deben negociarse antes de fijar el precio final.</li>
            <li><strong>No comprobar bonificaciones autonómicas:</strong> Cada comunidad tiene tipos reducidos para ciertos colectivos. Ignorarlos puede costar miles de euros en impuestos innecesarios.</li>
            <li><strong>Liquidar fuera de plazo:</strong> El ITP o IVA+AJD debe pagarse en {PLAZO_ITP.dias} {PLAZO_ITP.unidad} desde la escritura ({PLAZO_ITP.baseNormativa}), y hay comunidades que fijan el suyo propio. Pasado ese plazo hay recargo automático
            desde el primer día: un {ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase}&nbsp;% de partida más otro {ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes}&nbsp;% por cada mes completo de retraso,
            y del {ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses}&nbsp;% más intereses una vez transcurridos {ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-compraventa-inmueble')} />
      <ShareCard appName="estimador-compraventa-inmueble" />
      <Footer appName="estimador-compraventa-inmueble" />
    </div>
  );
}
