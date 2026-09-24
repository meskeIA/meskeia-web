'use client';
// @disclaimer: DisclaimerCard severity="critical" — fiscal España estructural

import { useState, useMemo } from 'react';
import styles from './SimuladorLocalComercial.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  NumberInput,
  ResultCard,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  ShareCard,
  RegionBadge,
  AvisoTerritorioSinIva,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, formatTipoNominal, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import { veredictoIlegibles, enumerar, faltaOFaltan, noSePudoLeer, mayuscula, enumerarNi, escritoIlegible, type Veredicto } from '@/lib/sondeoIlegibles';
import {
  calcularGananciaInmueble,
  IVA_INMUEBLES_2025,
  FISCAL_INMUEBLES_META,
  PLUSVALIA_MUNICIPAL_META,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  COEFICIENTES_IIVTNU_2025,
  GANANCIAS_PATRIMONIALES_META,
} from '@/data/fiscal';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  calcularNotario,
  estimarFacturaNotarial,
  calcularRegistro,
  calcularPlusvaliaMunicipal,
  ENLACE_CATASTRO,
  TERRITORIOS_SIN_IVA,
  CIUDADES_CON_BONIFICACION,
  // Los rangos de lo que no es vivienda (un local nunca lo es): el AJD de la FAQ visible y el
  // ITP del sello de datos.
  RANGO_AJD_OTROS,
  tipoGeneralITP,
  tipoAJD,
  describirSubidaITP,
  notariaDeLibreAcuerdo,
  LIMITE_ARANCEL_NOTARIAL,
  RANGO_ITP_OTROS,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  type ObjetoTransmision,
  sumarLineasVisibles,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
} from '@/data/itp-ccaa';

// ===== TIPOS =====
type TipoTransmision = 'segunda-mano' | 'primera-mano' | 'segunda-mano-renuncia';
type PerfilVendedor = 'particular' | 'afecto-actividad';

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
   * false cuando el texto de «Gastos de gestoría del comprador» no es un número (1199).
   * Homónimo del flag del vendedor y por la misma razón: `parseSpanishNumberOr` devuelve 0
   * tanto con el campo vacío como con lo que no puede leer, y la tarjeta se pinta con guarda
   * `> 0`, así que el importe desaparecía del desglose y el coste total bajaba en silencio.
   */
  gestoriaLegible: boolean;
  /**
   * Por encima de 6.010.121,04 € el arancel no fija cantidad: el exceso es de libre acuerdo con
   * el notario (RD 1426/1989, nº 2.1; hallazgo 1599), y la estimación solo cubre la parte reglada.
   */
  notariaLibre: boolean;
  totalGastos: number;
  totalOperacion: number;
  ivaRecuperable: boolean; // true si el impuesto principal es IVA (deducible si el comprador es sujeto pasivo)
  /** Cierto cuando se ha aplicado la bonificación del 50 % de Ceuta y Melilla (art. 57 bis TRLITPAJD) */
  bonificado: boolean;
}

interface ResultadosVendedor {
  precioVenta: number;
  plusvaliaMunicipal: number;
  metodoPlusvalia: string;
  /** Falso cuando falta algún dato para liquidar el IIVTNU: entonces el 0 NO es un cero real */
  plusvaliaCalculada: boolean;
  /** Los campos concretos que faltan, para que el aviso del neto no los adivine */
  camposQueFaltan: string[];
  /** …separados en los VACÍOS y los escritos que no se leen, que no «faltan» (hallazgo 1265) */
  camposVacios: string[];
  camposIlegibles: string[];
  /** Años escritos y legibles pero negativos: no «faltan», son imposibles (patrón 5, 1578). */
  aniosNegativos: boolean;
  /** Años = 0 sin los meses completos elegidos: el coeficiente se prorratea por ellos (1560). */
  faltanMeses: boolean;
  /** El suelo supera al total: la plusvalía real puede ser menor y el neto MAYOR (1571). */
  parCatastralImposible: boolean;
  /**
   * La plusvalía FALTA y la ganancia sí se calcula: al calcularse restará del valor de
   * transmisión (art. 35.1 LIRPF), así que la ganancia y el IRPF son un MÁXIMO (patrón 2, 1570).
   */
  plusvaliaPendiente: boolean;
  /**
   * Las amortizaciones superan el precio de compra y los gastos de aquella compra no se han
   * podido leer: la app no puede decir que sean imposibles (hallazgo 1573), pero sí cuánto
   * tendrían que sumar esos gastos para que cuadren. 0 si no es el caso.
   */
  excesoSobrePrecio: number;
  exentoPlusvalia: boolean;
  comisionInmobiliaria: number;
  gastosGestoria: number;
  valorAdquisicionCorregido: number;
  valorTransmision: number;
  amortizacionesRestadas: number;
  gananciaPatrimonial: number;
  esPerdida: boolean;
  /** Ni ganancia ni pérdida: se vende exactamente por el valor de adquisición. */
  sinGananciaNiPerdida: boolean;
  baseImponibleIRPF: number;
  irpfGanancia: number;
  /**
   * Las amortizaciones superan todo el coste de adquisición (precio + gastos de aquella
   * compra): la del art. 40 RIRPF recae sobre la construcción y no puede superarlo, así que
   * es un dato imposible y la app no liquida con él (hallazgo 1261, como el par catastral
   * imposible del 900).
   */
  amortizacionesImposibles: boolean;
  /** Coste de adquisición (precio + gastos de aquella compra) con el que se compara */
  costeAdquisicion: number;
  /**
   * false mientras falte el precio de compra original: entonces el 0 del IRPF no es una
   * exención, es un impuesto que no se ha podido calcular (hallazgo 1159, ALTO). Es el mismo
   * campo con el que garaje, trastero y estimador-compraventa-inmueble cierran el «efecto
   * familia del 483».
   */
  irpfCalculado: boolean;
  /** false cuando el texto del campo no es un número: ese 0 tampoco es un cero (1157). */
  comisionLegible: boolean;
  gestoriaLegible: boolean;
  gastosAdquisicionLegible: boolean;
  /**
   * false cuando las amortizaciones no se pueden leer, y solo con el perfil «Local afecto a
   * actividad», que es el único en el que el campo existe. Es el campo EXCLUSIVO de esta app
   * y por eso la reparación en lote del clúster (`cfe091a7`) no lo vio: las otras seis
   * hermanas no lo tienen (hueco A2 del testigo de familia).
   */
  amortizacionesLegible: boolean;
  /**
   * false cuando el valor catastral total no se puede leer y hay plusvalía que comparar.
   * Sin él la plusvalía se liquida por el método objetivo aunque el real sea más barato, y
   * el neto baja en silencio (hueco C1 del testigo de familia, visto en el estimador).
   */
  valorTotalLegible: boolean;
  totalGastos: number;
  netoVendedor: number;
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
  gestoria: number;
  gastosAdquisicion: number;
  /** 0 fuera del perfil «Local afecto a actividad» */
  amortizaciones: number;
}

/**
 * El cálculo del vendedor, puro, para poder ejecutarlo varias veces: una con lo que se lee y
 * otra por cada importe ilegible sondeado (hallazgos 1257-1264). La dirección de un aviso se
 * CALCULA con esto, no se razona.
 */
function calcularVendedor(e: EntradaVendedor) {
  const comision = e.precioV * e.comisionPct;
  /**
   * Vendiendo por el precio de compra o por debajo no hay incremento de valor, y la no sujeción
   * del art. 104.5 TRLRHL no depende del suelo ni de los años: el motor la decide con venta −
   * compra ≤ 0. Sin el suelo la plusvalía quedaba «Sin calcular», el neto «(PARCIAL)» y se
   * mandaba al recibo del IBI a por un dato que no cambia nada, contra el propio bloque
   * educativo, que dice «si vendes con pérdida no hay impuesto» (patrón 4, hallazgo 1572).
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

  // Si el local estuvo afecto a actividad, la amortización deducida MINORA el valor de
  // adquisición (art. 40 RIRPF) y aumenta la ganancia; los impuestos y gastos de la
  // compra lo aumentan y la reducen (art. 35.1 LIRPF). Ambos van al motor compartido.
  const g = calcularGananciaInmueble({
    precioVenta: e.precioV,
    precioCompra: e.precioC > 0 ? e.precioC : 0,
    gastosAdquisicion: e.gastosAdquisicion,
    amortizacionesDeducidas: e.amortizaciones,
    gastosTransmision: comision + e.gestoria,
    plusvaliaMunicipal: plusvalia,
  });
  const hayDatosGanancia = e.precioC > 0;
  const irpf = hayDatosGanancia ? g.cuotaIRPF : 0;
  const totalGastos = sumarLineasVisibles(plusvalia, comision, e.gestoria, irpf);
  return {
    comision,
    resultadoPlusvalia,
    plusvalia,
    g,
    hayDatosGanancia,
    irpf,
    totalGastos,
    neto: e.precioV - totalGastos,
    /**
     * El neto sin el IRPF, que es el que se publica cuando las amortizaciones son imposibles y el
     * IRPF no se liquida: el sondeo tiene que medir ESE, o apaga los ilegibles que sí lo mueven
     * (hallazgo 1574).
     */
    netoSinIrpf: e.precioV - sumarLineasVisibles(plusvalia, comision, e.gestoria),
    /** Con signo: negativa si hay pérdida. 0 sin precio de compra. */
    ganancia: hayDatosGanancia ? g.ganancia : 0,
  };
}

/**
 * La ayuda del campo de los años, derivada de COEFICIENTES_IIVTNU_2025 (hallazgo 1266): el
 * tope de años y el coeficiente de la reventa antes del año los fija una norma con rango de ley,
 * y escritos a mano quedaban falsos en silencio al cambiar la tabla.
 *
 * ⚠️ 24/09/2026 (hallazgo 1560): comparaba el coeficiente de «menos de 1 año» con el del primer
 * año como si se aplicara entero, y el art. 107.4 TRLRHL lo PRORRATEA por meses completos: la
 * reventa dentro del año paga siempre menos que un año entero. Ahora la app pregunta los meses.
 */
const COEF_MENOS_DE_UN_ANIO = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)?.coeficiente ?? 0;
const ANIOS_TOPE_IIVTNU = Math.max(...COEFICIENTES_IIVTNU_2025.map((c) => c.anios));
const AYUDA_ANIOS_PROPIEDAD =
  `Años completos desde la compra (la plusvalía municipal cuenta como máximo ${ANIOS_TOPE_IIVTNU}). ` +
  `Escribe 0 si revendes antes de cumplir el año: esa reventa también tributa, y te preguntaremos los ` +
  `meses completos, porque el coeficiente anual (${formatNumber(COEF_MENOS_DE_UN_ANIO, 2)}) se prorratea por ellos.`;

/** Lo que se transmite, a efectos del ITP y del AJD: un local nunca es vivienda (hallazgo 1582). */
const OBJETO: ObjetoTransmision = 'otro';

/**
 * «la gestoría de la venta lo bajaría» · «los impuestos y gastos de aquella compra lo subirían»:
 * el verbo concuerda con el SUJETO, no con el número de campos (hallazgo 1577 y hermanos). Es la
 * regla de `esPlural` de lib/sondeoIlegibles.ts, que no se exporta.
 */
const sujetoPlural = (partes: readonly string[]): boolean =>
  partes.length > 1 || /^(los|las)\s/i.test(partes[0] ?? '');
/** «Escríbelo» detrás de un importe, «Escríbelos» detrás de dos o más. */
const escribelo = (partes: readonly string[]): string => (partes.length > 1 ? 'Escríbelos' : 'Escríbelo');

/** Los meses completos del periodo inferior a un año, para el prorrateo del art. 107.4 TRLRHL. */
const MESES_COMPLETOS = Array.from({ length: 12 }, (_, m) => m);

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

// IVA local comercial: 21% (inmueble comercial, no residencial)
// Tipo de IVA de inmueble no residencial. Sale de data/fiscal para no divergir en
// silencio cuando cambie allí (hallazgo 163 del Inspector, del clúster entero).
const IVA_LOCAL_COMERCIAL = IVA_INMUEBLES_2025.local;

// Extremos de la base del ahorro DERIVADOS de la misma tabla con la que la app calcula
// (`calcularGananciaInmueble` recorre TRAMOS_GANANCIAS_PATRIMONIALES_2025). Estaban
// escritos a mano en tres rótulos y en el FAQPage: hoy coincidían, pero un cambio de los
// tramos no habría llegado nunca al texto (hallazgo 667, misma forma que el 622 del AJD).
const TIPO_AHORRO_MIN = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
const TIPO_AHORRO_MAX = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo;

/**
 * Dónde NO existe la renuncia a la exención de la segunda entrega. En Ceuta y Melilla la Ley
 * 8/1991 del IPSI toma sus exenciones de la ley del IVA (art. 7) sin regular ninguna renuncia, y
 * no deja deducir el IPSI soportado en la compra de inmuebles (art. 20.3), que es lo que la
 * renuncia del art. 20.Dos LIVA exige. Canarias no está: el IGIC sí la tiene (art. 50.Cinco Ley
 * canaria 4/2012). Decisión común de la familia, verificada en el BOE por nave-industrial
 * (hallazgo 1584, 24/09/2026); aquí la app calculaba la renuncia en los tres territorios.
 */
const TERRITORIOS_SIN_RENUNCIA: readonly ComunidadAutonoma[] = ['ceuta', 'melilla'];

/** Enumera en español: «a», «a y b», «a, b y c». */
function enumerarEnEspanol(partes: string[]): string {
  if (partes.length <= 1) return partes[0] ?? '';
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

/**
 * La nota del sello de datos, con el rango de lo que paga un local comercial. La común
 * (`FISCAL_INMUEBLES_META.nota`) habla del ITP de la VIVIENDA, del 4 % vasco hacia arriba, y aquí
 * el País Vasco cobra el 7 % (hallazgo 1582); la bonificación de Ceuta y Melilla sale del motor.
 * Decisión común de la familia con nave, solar y terreno (24/09/2026).
 */
const NOTA_DATOS = `El ITP de un local comercial va del ${formatTipoNominal(RANGO_ITP_OTROS.min)}% al ${formatTipoNominal(RANGO_ITP_OTROS.max)}% según la comunidad autónoma, contando el tramo más alto de las que aplican escala progresiva; en Ceuta y Melilla la cuota se bonifica un ${formatTipoNominal(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)} % (art. 57 bis TRLITPAJD). Los tipos indicados son orientativos: consulta el de tu comunidad antes de firmar.`;

export default function SimuladorLocalComercialPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  // Datos del vendedor
  const [precioCompraOriginal, setPrecioCompraOriginal] = useState('');
  const [gastosAdquisicion, setGastosAdquisicion] = useState('');
  const [aniosPropiedad, setAniosPropiedad] = useState('');
  /** Meses completos cuando se vende antes de cumplir el año ('' = sin elegir). */
  const [mesesCompletos, setMesesCompletos] = useState('');
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState('');
  const [valorCatastralTotal, setValorCatastralTotal] = useState('');
  const [comisionInmobiliaria, setComisionInmobiliaria] = useState('3');
  // Gestoria del VENDEDOR, separada de la del comprador: el art. 35.1 LIRPF solo admite
  // los gastos «satisfechos por el transmitente», y un unico campo compartido hacia que
  // la gestoria del comprador rebajara el IRPF de la otra parte (Inspector, 20/08/2026).
  const [gastosGestoriaVenta, setGastosGestoriaVenta] = useState('');
  const [perfilVendedor, setPerfilVendedor] = useState<PerfilVendedor>('particular');
  const [amortizacionesAcumuladas, setAmortizacionesAcumuladas] = useState('');

  const [pestanaActiva, setPestanaActiva] = useState<'comprador' | 'vendedor'>('comprador');

  /**
   * La transmisión que se CALCULA. En Ceuta y Melilla la renuncia no existe (ver
   * TERRITORIOS_SIN_RENUNCIA): allí se calcula la segunda mano y el botón de la renuncia se
   * desactiva. Se deriva en lugar de reescribir el estado para no perder la elección si se vuelve
   * a una comunidad donde la renuncia sí existe (la misma decisión que nave-industrial, 1584).
   */
  const renunciaImposible = TERRITORIOS_SIN_RENUNCIA.includes(ccaa);
  const transmision: TipoTransmision =
    tipoTransmision === 'segunda-mano-renuncia' && renunciaImposible ? 'segunda-mano' : tipoTransmision;
  const esRenuncia = transmision === 'segunda-mano-renuncia';
  /** Las dos ramas en las que el impuesto es IVA y, por tanto, la base es la contraprestación */
  const conIvaEnPantalla =
    (transmision === 'primera-mano' || esRenuncia) && !TERRITORIOS_SIN_IVA[ccaa];
  /** El impuesto cuya exención se renuncia: el IVA, o el IGIC en Canarias. */
  const impuestoDeLaRenuncia = TERRITORIOS_SIN_IVA[ccaa]?.impuesto ?? 'IVA';

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    // Sobre el precio que se PINTA, al céntimo: «0,004» se pinta «0,00 €» y publicaba un desglose
    // entero sobre un precio que se ve como cero (hallazgo 1601, decisión común de la familia).
    if (!Number.isFinite(precio) || Math.round(precio * 100) <= 0) return null;

    // Se acota aquí y no solo en el blur del NumberInput: mientras el campo tiene el foco,
    // un importe negativo se sumaba al total y su tarjeta ni se pintaba (guard > 0), así que
    // el total en pantalla no cuadraba con las líneas visibles.
    const gestoria = Math.max(0, parseSpanishNumberOr(gastosGestoria));
    /** Un importe ILEGIBLE no es un cero: es un dato que falta (hallazgo 1199). */
    const gestoriaLegible =
      gastosGestoria.trim() === '' || Number.isFinite(parseSpanishNumber(gastosGestoria));

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    let ivaRecuperable = false;
    let impuestoNoCalculado = false;
    let ajd = 0;

    const territorioSinIva = TERRITORIOS_SIN_IVA[ccaa];
    // En Ceuta y Melilla `calcularITP` y `calcularAJD` descuentan solos el 50 % de la cuota
    // (art. 57 bis TRLITPAJD). La pantalla tiene que decirlo: imprimía el tipo NOMINAL
    // sobre un importe ya bonificado (hallazgos 619 y 623).
    const bonificado = CIUDADES_CON_BONIFICACION.includes(ccaa);
    const conIva = transmision === 'primera-mano' || transmision === 'segunda-mano-renuncia';

    if (conIva && territorioSinIva) {
      // Allí no se devenga IVA sino IGIC o IPSI: se nombra el impuesto que corresponde y no
      // se inventa cifra, como ya hacen nave-industrial, solar y terreno-rústico. La cuota
      // gradual de AJD sí se devenga, porque la operación va sujeta al impuesto indirecto
      // canario o ceutí y no exenta.
      tipoImpuesto = territorioSinIva.impuesto;
      impuestoNoCalculado = true;
      // Con renuncia solo se llega aquí en Canarias (IGIC, art. 50.Cinco Ley 4/2012); la tabla
      // no tiene allí tipo de AJD propio de la renuncia, así que sale el general del sitio.
      ajd = calcularAJD(precio, ccaa, { objeto: OBJETO, renunciaExencionIVA: transmision === 'segunda-mano-renuncia' });
      ivaRecuperable = true;
    } else if (transmision === 'primera-mano') {
      // Obra nueva del promotor: IVA 21% + AJD
      tipoImpuesto = 'IVA';
      porcentaje = IVA_LOCAL_COMERCIAL;
      impuesto = precio * (porcentaje / 100);
      // Un local no es vivienda: en el País Vasco paga el 0,5 %, sin la exención de la
      // primera transmisión de vivienda (hallazgos 1583 y 1592).
      ajd = calcularAJD(precio, ccaa, { objeto: OBJETO });
      ivaRecuperable = true;
    } else if (transmision === 'segunda-mano-renuncia') {
      // Segunda mano con renuncia a la exención de IVA (Art. 20.Dos LIVA)
      // → IVA 21% con inversión del sujeto pasivo + AJD, al tipo de la renuncia donde la
      // comunidad lo tiene y está verificado (Valencia, 2 %: Ley 13/1997, art. 14.Dos; 1603).
      tipoImpuesto = 'IVA (renuncia · ISP)';
      porcentaje = IVA_LOCAL_COMERCIAL;
      impuesto = precio * (porcentaje / 100);
      ajd = calcularAJD(precio, ccaa, { objeto: OBJETO, renunciaExencionIVA: true });
      ivaRecuperable = true;
    } else {
      // Segunda mano sin renuncia → exenta de IVA → ITP tipo general de la CCAA
      // Sin tipo forzado: así se aplica la escala progresiva de las CCAA que la tienen, el
      // umbral de Valencia y el tipo de lo que no es vivienda (País Vasco, 7 %; hallazgo 1582).
      impuesto = calcularITP(precio, ccaa, OBJETO);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva el importe no es un porcentaje plano del
      // precio, asi que mostrar el tipo nominal contradiria a la cifra de al lado.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
      ajd = 0;
    }

    const notaria = estimarFacturaNotarial(precio);

    const notario = notaria.medio;
    const registro = calcularRegistro(precio);

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
      ivaRecuperable,
      bonificado,
    };
  }, [precioVenta, ccaa, transmision, gastosGestoria]);

  // ===== CÁLCULOS VENDEDOR =====
  // El vendedor de un local paga plusvalía municipal (es suelo urbano) e IRPF sobre la
  // ganancia patrimonial. La diferencia con la vivienda: no hay exención por reinversión
  // ni por mayores de 65 años, y si el local estuvo AFECTO a una actividad económica hay
  // que minorar el valor de adquisición en las amortizaciones deducidas (art. 40 RIRPF).
  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioVenta);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    // Los años se leen del STRING, no del número: «0» es un dato VÁLIDO —el local
    // revendido antes de cumplir el año, que tributa con el coeficiente de «Menos de 1
    // año» de COEFICIENTES_IIVTNU_2025, prorrateado por meses completos (hallazgo 1560)— y lo
    // que impide calcular es el campo VACÍO. Con `parseInt(aniosPropiedad) || 0` los dos
    // valían 0, así que el 0 explícito desactivaba la plusvalía y ese 0 se propagaba como
    // un cero real: no minoraba el valor de transmisión, subía la ganancia y el neto se
    // daba por firme (hallazgo 666 del Inspector, 07/09/2026).
    // Un año NEGATIVO se rechaza, no se acota a 0: acotarlo lo convertiría en una reventa
    // antes del año y liquidaría un impuesto a partir de un dato imposible. Aquí se acotaba
    // con Math.max(0, …), que era inofensivo mientras el 0 desactivaba la plusvalía y dejó
    // de serlo en cuanto el 0 pasó a ser un dato válido (10/09/2026, al propagar esta misma
    // reparación a garaje, trastero y al hub del clúster, donde sus tests sí lo exigían).
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
     * completos: con años = 0 hacen falta los meses, y mientras no se elijan faltan, como
     * cualquier dato vacío (hallazgo 1560). Hasta el 24/09/2026 se aplicaba el coeficiente ENTERO.
     */
    const meses = aniosDisponibles && anios === 0 && mesesCompletos !== '' ? Number(mesesCompletos) : undefined;
    const valorSuelo = parseSpanishNumber(valorCatastralSuelo);
    const valorTotal = parseSpanishNumber(valorCatastralTotal);

    // Al céntimo, como el comprador: un precio de venta que se pinta 0,00 € no es un precio (1601).
    if (!Number.isFinite(precioV) || Math.round(precioV * 100) <= 0) return null;

    /**
      * ⚠️ 13/09/2026 — estos dos eran los ÚNICOS importes del panel sin acotar mientras el
      * campo tiene el foco, y en negativo la pantalla se partía en dos mitades que usaban
      * valores distintos del mismo dato: el «Total gastos» y el «NETO QUE RECIBES»
      * descontaban un gasto negativo (el neto SUBÍA), mientras `calcularGananciaInmueble` sí
      * lo acota y dejaba `gastosTransmision` en 0, así que el IRPF salía de una venta SIN
      * NINGÚN gasto. La misma pantalla cobraba el IRPF de una venta sin gastos y descontaba
      * del neto un gasto que cobraba (hallazgo 785). Al salir del campo, el min=0 del
      * NumberInput lo dejaba en 0 y todo volvía a cuadrar: el defecto vivía en esa ventana.
      */
    /**
     * Un valor ILEGIBLE no es un cero: es un dato que falta. `parseSpanishNumberOr` devuelve
     * su 0 por defecto cuando el parser RECHAZA el texto, así que el NaN de «2.000.50» —el
     * millar y el decimal a la estadounidense— y un campo vacío eran indistinguibles para el
     * motor. Los tres son partidas del art. 35.1 LIRPF: al desaparecer suben el neto, la
     * ganancia y el IRPF. Salió del hallazgo 773 en trastero y el 1157 encontró allí los dos
     * campos que aquella reparación no cubrió; aquí faltaban los tres.
     */
    const esLegible = (texto: string) =>
      texto.trim() === '' || Number.isFinite(parseSpanishNumber(texto));
    const comisionLegible = esLegible(comisionInmobiliaria);
    const gestoriaLegible = esLegible(gastosGestoriaVenta);
    const gastosAdquisicionLegible = esLegible(gastosAdquisicion);
    const valorTotalLegible = esLegible(valorCatastralTotal);
    const afecto = perfilVendedor === 'afecto-actividad';
    // Ilegibles valían 0, y con ellas a 0 el valor de adquisición sube, la ganancia baja y el
    // neto se publicaba +4.200,00 € por encima del real como si fuera definitivo (hueco A2).
    const amortizacionesLegible = !afecto || esLegible(amortizacionesAcumuladas);

    const entrada: EntradaVendedor = {
      precioV,
      precioC,
      anios: aniosDisponibles ? anios : NaN,
      meses,
      valorSuelo,
      valorTotal: valorTotal > 0 ? valorTotal : undefined,
      comisionPct: Math.max(0, parseSpanishNumberOr(comisionInmobiliaria)) / 100,
      gestoria: Math.max(0, parseSpanishNumberOr(gastosGestoriaVenta)),
      gastosAdquisicion: Math.max(0, parseSpanishNumberOr(gastosAdquisicion)),
      amortizaciones: afecto ? Math.max(0, parseSpanishNumberOr(amortizacionesAcumuladas)) : 0,
    };

    /**
     * CASO 28 (hallazgo 1261): unas amortizaciones MAYORES que todo el coste de adquisición no
     * pueden existir —la del art. 40 RIRPF recae sobre la construcción, que es parte de ese
     * coste— y el motor las acotaba en silencio a un valor de adquisición 0: descartaba el
     * exceso y liquidaba un IRPF enorme como definitivo. Se rechaza como el par catastral
     * imposible (hallazgo 900): la app nombra el dato y no liquida el IRPF con él.
     */
    /**
     * ⚠️ 24/09/2026 (hallazgo 1573): con los gastos de aquella compra ILEGIBLES el coste de
     * adquisición no se conoce —el ilegible entraba aquí como 0— y la regla declaraba imposibles
     * unas amortizaciones posibles, mandaba revisar un dato correcto y callaba el que no se había
     * podido leer. Solo se afirma la imposibilidad con los gastos leídos; si no, el IRPF se liquida
     * y el sondeo de los gastos dice hacia dónde queda, como con cualquier otro ilegible.
     */
    const costeAdquisicion = precioC > 0 ? precioC + entrada.gastosAdquisicion : 0;
    const amortizacionesImposibles =
      precioC > 0 && gastosAdquisicionLegible && entrada.amortizaciones > costeAdquisicion;
    /** Lo que tendrían que sumar los gastos ilegibles para que las amortizaciones cuadren. */
    const excesoSobrePrecio =
      precioC > 0 && !gastosAdquisicionLegible && entrada.amortizaciones > precioC
        ? entrada.amortizaciones - precioC
        : 0;
    const r = calcularVendedor(entrada);
    const irpfPublicable = r.hayDatosGanancia && !amortizacionesImposibles;
    const irpf = irpfPublicable ? r.irpf : 0;
    const totalGastos = irpfPublicable ? r.totalGastos : sumarLineasVisibles(r.plusvalia, r.comision, entrada.gestoria);

    // El aviso nombra SOLO lo que de verdad falta, y concuerda el verbo (hallazgo 666). Y
    // separa lo VACÍO de lo escrito que no se lee, que no «falta»: el usuario lo ve (1265).
    const ilegibleTexto = (t: string) => escritoIlegible(t, parseSpanishNumber);
    const rp = r.resultadoPlusvalia;
    /**
     * Con la plusvalía ya resuelta (sin incremento no hace falta el suelo ni los años, patrón 4)
     * esos dos campos no bloquean nada: nombrarlos marcaría «(PARCIAL)» un neto definitivo.
     */
    const plusvaliaResuelta = rp !== null;
    // Un año negativo no «falta»: está escrito, se lee y es imposible (patrón 5, hallazgo 1578).
    const aniosNegativos = !plusvaliaResuelta && aniosNegativo;
    const faltanMeses = !plusvaliaResuelta && aniosDisponibles && anios === 0 && meses === undefined;
    const faltanVacios = [
      plusvaliaResuelta || valorSuelo > 0 || ilegibleTexto(valorCatastralSuelo) ? null : 'el valor catastral del suelo',
      plusvaliaResuelta || aniosDisponibles || aniosNegativo || ilegibleTexto(aniosPropiedad) ? null : 'los años de propiedad',
      faltanMeses ? 'los meses completos desde la compra' : null,
      precioC > 0 || ilegibleTexto(precioCompraOriginal) ? null : 'el precio de compra original',
    ].filter((x): x is string => x !== null);
    const faltanIlegibles = [
      !plusvaliaResuelta && ilegibleTexto(valorCatastralSuelo) ? 'el valor catastral del suelo' : null,
      !plusvaliaResuelta && ilegibleTexto(aniosPropiedad) ? 'los años de propiedad' : null,
      ilegibleTexto(precioCompraOriginal) ? 'el precio de compra original' : null,
    ].filter((x): x is string => x !== null);
    const camposQueFaltan = [...faltanVacios, ...faltanIlegibles];
    const porQueNoSeCalcula = [
      faltanVacios.length > 0 ? faltaOFaltan(faltanVacios) : null,
      faltanIlegibles.length > 0 ? noSePudoLeer(faltanIlegibles) : null,
      aniosNegativos ? 'los años de propiedad no pueden ser negativos' : null,
    ].filter((x): x is string => x !== null).join('; ');

    let metodoPlusvalia = `No calculada (${porQueNoSeCalcula})`;
    const exentoPlusvalia = rp ? rp.exento : false;
    if (rp) {
      /**
       * ⚠️ 13/09/2026 — la cuota no se podía reconstruir con lo que la página decía: se
       * liquida con el tipo ORIENTATIVO del 25 %, y ese 25 % no aparecía en ningún sitio del
       * DOM (hallazgo 786). Las tres hermanas ya imprimían las dos, derivadas de la constante.
       */
      const tipoMunicipal = `tipo municipal orientativo del ${formatNumber(
        PLUSVALIA_MUNICIPAL_META.tipoOrientativo,
        0
      )} %`;
      metodoPlusvalia = rp.exento
        ? 'No sujeta (sin incremento de valor)'
        : rp.parCatastralImposible
          ? `Método objetivo, ${tipoMunicipal} (el valor catastral del suelo no puede superar al total, que ya lo incluye: revisa los dos campos del recibo del IBI)`
          : !rp.metodoRealDisponible
          ? // «falta el valor catastral total» era falso cuando el usuario lo había
            // escrito y lo seguía viendo en el campo (hueco C1): no falta, no se lee.
            valorTotalLegible
            ? `Método objetivo, ${tipoMunicipal} (falta el valor catastral total para comparar)`
            : `Método objetivo, ${tipoMunicipal}, y puede salir más barata: el valor catastral total no se ha podido leer, así que no se compara con el método real. Escríbelo con coma decimal (1.234,56).`
          : rp.metodoReal < rp.metodoObjetivo
            ? `Método real (más favorable), ${tipoMunicipal}`
            : `Método objetivo (más favorable), ${tipoMunicipal}`;
    }

    /**
     * El SONDEO de los importes ilegibles: el cálculo se repite con cada uno a un valor
     * pequeño y a uno grande, y `veredictoIlegibles` dice hacia dónde queda cada cifra real.
     * La dirección escrita a mano afirmaba «menor» y «MAYOR» a la vez con dos ilegibles
     * opuestos (1257), «será menor» con pérdida y sin IRPF posible (1258), y dejaba como
     * definitivas la pérdida (1259) y la cuota (1260).
     */
    const sondas: { nombre: string; pequeno: EntradaVendedor; grande: EntradaVendedor }[] = [];
    if (!comisionLegible) {
      sondas.push({
        nombre: 'la comisión inmobiliaria',
        pequeno: { ...entrada, comisionPct: 0.0001 },
        grande: { ...entrada, comisionPct: 0.1 },
      });
    }
    if (!gestoriaLegible) {
      sondas.push({
        nombre: 'la gestoría de la venta',
        pequeno: { ...entrada, gestoria: 1 },
        grande: { ...entrada, gestoria: precioV },
      });
    }
    if (!gastosAdquisicionLegible) {
      sondas.push({
        nombre: 'los impuestos y gastos de aquella compra',
        pequeno: { ...entrada, gastosAdquisicion: 1 },
        grande: { ...entrada, gastosAdquisicion: precioV * 10 },
      });
    }
    if (!amortizacionesLegible) {
      // Hasta el coste de adquisición: más allá sería el dato imposible del CASO 28.
      sondas.push({
        nombre: 'las amortizaciones deducidas',
        pequeno: { ...entrada, amortizaciones: 1 },
        grande: { ...entrada, amortizaciones: Math.max(1, costeAdquisicion) },
      });
    }
    if (!valorTotalLegible && valorSuelo > 0) {
      sondas.push({
        nombre: 'el valor catastral total',
        pequeno: { ...entrada, valorTotal: valorSuelo },
        grande: { ...entrada, valorTotal: valorSuelo * 1000 },
      });
    }
    /**
     * ⚠️ 24/09/2026 (hallazgo 1574): con las amortizaciones imposibles el sondeo se apagaba
     * ENTERO, y una comisión o una gestoría de la venta ilegibles desaparecían del aviso del neto
     * aunque lo movieran. Ahora se sondea siempre; lo que cambia es la cifra que se mide: el neto
     * que se publica, que en ese caso no lleva IRPF (abajo, `netoPublicado`).
     */
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

    return {
      precioVenta: precioV,
      plusvaliaMunicipal: r.plusvalia,
      metodoPlusvalia,
      plusvaliaCalculada: rp !== null,
      camposQueFaltan,
      camposVacios: faltanVacios,
      camposIlegibles: faltanIlegibles,
      aniosNegativos,
      faltanMeses,
      parCatastralImposible: rp !== null && !rp.exento && rp.parCatastralImposible,
      plusvaliaPendiente: !plusvaliaResuelta && irpfPublicable,
      excesoSobrePrecio,
      exentoPlusvalia,
      comisionInmobiliaria: r.comision,
      gastosGestoria: entrada.gestoria,
      valorAdquisicionCorregido: r.hayDatosGanancia ? r.g.valorAdquisicion : 0,
      valorTransmision: r.g.valorTransmision,
      amortizacionesRestadas: entrada.amortizaciones,
      gananciaPatrimonial: r.ganancia,
      esPerdida: r.hayDatosGanancia && r.g.esPerdida,
      sinGananciaNiPerdida: r.hayDatosGanancia && r.g.sinGananciaNiPerdida,
      baseImponibleIRPF: r.hayDatosGanancia ? r.g.baseImponible : 0,
      irpfGanancia: irpf,
      amortizacionesImposibles,
      costeAdquisicion,
      irpfCalculado: irpfPublicable,
      comisionLegible,
      gestoriaLegible,
      gastosAdquisicionLegible,
      amortizacionesLegible,
      // Sin plusvalía liquidada (faltan datos o no hay incremento) no hay método que comparar.
      valorTotalLegible: rp === null || exentoPlusvalia || valorTotalLegible,
      totalGastos,
      netoVendedor: precioV - totalGastos,
      // Sin IRPF publicable (amortizaciones imposibles) el neto publicado es el que no lo lleva,
      // y la cuota y la ganancia no se enseñan: nada que sondear en ellas (hallazgo 1574).
      veredictoNeto: veredictoDe((x) => (amortizacionesImposibles ? x.netoSinIrpf : x.neto)),
      veredictoIrpf: amortizacionesImposibles ? { tipo: 'ninguno' } : veredictoDe((x) => x.irpf),
      veredictoGanancia: amortizacionesImposibles ? { tipo: 'ninguno' } : veredictoDe((x) => x.ganancia),
    };
  }, [
    precioVenta, precioCompraOriginal, gastosAdquisicion, aniosPropiedad, mesesCompletos,
    valorCatastralSuelo, valorCatastralTotal,
    // gastosGestoriaVenta, NO gastosGestoria: la del comprador no entra en el IRPF del
    // vendedor (art. 35.1 LIRPF). El campo se separó el 20/08/2026 pero solo en el valor,
    // así que lo que el vendedor escribía no se recalculaba hasta tocar otro campo, y el
    // que lo despertaba era justo la gestoría del comprador (hallazgo 330, ALTO).
    comisionInmobiliaria, gastosGestoriaVenta, perfilVendedor, amortizacionesAcumuladas,
  ]);

  const datosCcaaActual = ITP_CCAA[ccaa];
  const territorioActualSinIva = TERRITORIOS_SIN_IVA[ccaa];
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
  /**
   * El AJD de la operación elegida, del motor: el de un local, y con renuncia el de la renuncia
   * donde la comunidad lo tiene y está verificado (Valencia, 2 %; hallazgo 1603). En Ceuta y
   * Melilla la renuncia no existe (`transmision` ya la ha convertido en segunda mano); en
   * Canarias es a la exención del IGIC, y su AJD es el general.
   */
  const ajdRenuncia = tipoAJD(ccaa, { objeto: OBJETO, renunciaExencionIVA: esRenuncia });
  const ajdRenunciaPropio = ajdRenuncia.motivo === 'renuncia';
  /** Al coste del comprador le falta algo: el IGIC/IPSI, la gestoría ilegible o la notaría libre. */
  const costeCompradorParcial =
    !!resultadosComprador &&
    (resultadosComprador.impuestoNoCalculado ||
      !resultadosComprador.gestoriaLegible ||
      resultadosComprador.notariaLibre);
  /** Años escritos que se leen como 0 (reventa antes del año): hay que preguntar los meses. */
  const aniosEnCero = (() => {
    const t = aniosPropiedad.trim();
    if (t === '') return false;
    const n = parseSpanishNumber(t);
    return Number.isFinite(n) && n >= 0 && !Object.is(n, -0) && Math.trunc(n) === 0;
  })();

  /**
   * Lo que el neto NO descuenta por falta de datos. Solo se miraba la plusvalía, así que con
   * el precio de compra en blanco el aviso nombraba «la plusvalía municipal» y callaba justo
   * el otro impuesto que faltaba, el IRPF (hallazgo 1159). Los importes ilegibles ya no van
   * aquí: su dirección la da el sondeo (avisoIlegiblesNeto).
   */
  const faltanEnElNeto = resultadosVendedor
    ? [
        resultadosVendedor.plusvaliaCalculada ? null : 'la plusvalía municipal',
        resultadosVendedor.irpfCalculado ? null : 'el IRPF de la ganancia',
      ].filter((x): x is string => x !== null)
    : [];

  /**
   * C3 · la MAGNITUD de «No descuenta…» (propagado desde el estimador, 0f70fdf8; hallazgo
   * 1262): la comisión y la gestoría de la venta son gastos de transmisión (art. 35.1 LIRPF),
   * así que descontarlas baja también el IRPF. Esa rebaja no supera el tipo MARGINAL del
   * ahorro en la base de ahora, que es una cota publicable sin inventar nada.
   */
  const tipoMarginalAhorro =
    resultadosVendedor && resultadosVendedor.irpfGanancia > 0
      ? (TRAMOS_GANANCIAS_PATRIMONIALES_2025.find((t) => resultadosVendedor.baseImponibleIRPF <= t.hasta)
          ?.tipo ?? TIPO_AHORRO_MAX)
      : null;

  /** Lo que el aviso del neto dice de los importes ilegibles, calculado por el sondeo. */
  const avisoIlegiblesNeto = (() => {
    const v = resultadosVendedor?.veredictoNeto;
    if (!v || v.tipo === 'ninguno') return null;
    if (v.tipo === 'mixto') {
      // El verbo concuerda con el sujeto: «los impuestos y gastos de aquella compra lo
      // subirían», no «lo subiría» (redacción común, hallazgos 1555, 1568 y 1577).
      return `Sin cerrar: ${noSePudoLeer([...v.menor, ...v.mayor])}, y mueven el neto en sentidos contrarios (${enumerar(v.menor)} lo ${sujetoPlural(v.menor) ? 'bajarían' : 'bajaría'}; ${enumerar(v.mayor)} lo ${sujetoPlural(v.mayor) ? 'subirían' : 'subiría'}): no se puede saber si el neto real es mayor o menor que este`;
    }
    if (v.tipo === 'mayor' && faltanEnElNeto.length > 0) {
      // Un ilegible que SUBIRÍA el neto no permite afirmar «el neto real es MAYOR» si a la vez
      // FALTA un impuesto que lo bajaría: el sondeo solo mide los ilegibles, y la dirección
      // segura era falsa en cuanto se rellenaba el dato vacío (hallazgo 1561).
      return `Sin cerrar: ${noSePudoLeer(v.campos)} y ${sujetoPlural(v.campos) ? 'lo subirían' : 'lo subiría'}, pero ${faltaOFaltan(faltanEnElNeto)}, que ${sujetoPlural(faltanEnElNeto) ? 'lo bajarían' : 'lo bajaría'}: no se puede saber si el neto real es mayor o menor que este`;
    }
    if (v.tipo === 'menor') {
      const deducibles = v.campos.filter((c) => c === 'la comisión inmobiliaria' || c === 'la gestoría de la venta');
      const matiz =
        deducibles.length === 0 || tipoMarginalAhorro === null
          ? ''
          : ` (${enumerar(deducibles)} ${deducibles.length > 1 ? 'rebajan' : 'rebaja'} también el IRPF al descontar${deducibles.length > 1 ? 'las' : 'la'}, hasta un ${formatNumber(tipoMarginalAhorro, 0)} % de su importe)`;
      const nombres = v.campos.map((c) =>
        c === 'las amortizaciones deducidas' ? 'el IRPF que añaden las amortizaciones deducidas' : c,
      );
      return v.seguro
        ? `No descuenta ${enumerarNi(nombres)}, que no se ${v.campos.length > 1 ? 'han' : 'ha'} podido leer${matiz}: el neto real es menor que este`
        : `${mayuscula(noSePudoLeer(v.campos))}: el neto real puede ser menor que este`;
    }
    const explica = v.campos.map((c) =>
      c === 'los impuestos y gastos de aquella compra'
        ? 'los impuestos y gastos de aquella compra (suman al valor de adquisición y REDUCEN el impuesto)'
        : c === 'el valor catastral total'
          ? 'el valor catastral total (puede abaratar la plusvalía por el método real)'
          : c,
    );
    const frase = noSePudoLeer(explica);
    return `${frase.charAt(0).toUpperCase()}${frase.slice(1)}: el neto real ${v.seguro ? 'es' : 'puede ser'} MAYOR que este`;
  })();

  /** Los campos concretos que hay que rellenar, sin repetir el precio de compra original. */
  const camposPendientes = resultadosVendedor
    ? Array.from(
        new Set([
          ...resultadosVendedor.camposVacios.filter((c) => c !== 'los meses completos desde la compra'),
          ...(resultadosVendedor.irpfCalculado ||
          resultadosVendedor.amortizacionesImposibles ||
          resultadosVendedor.camposIlegibles.includes('el precio de compra original')
            ? []
            : ['el precio de compra original']),
        ])
      )
    : [];
  const hayIlegiblesQueCorregir =
    (resultadosVendedor?.camposIlegibles.length ?? 0) > 0 || avisoIlegiblesNeto !== null;

  /**
   * El par catastral imposible (suelo mayor que total) también deja el neto sin cerrar: la
   * plusvalía se liquidó por el objetivo sin compararla con el real, que puede ser más barato.
   * Es lo que la referencia hace desde 70cce469/85c9c9fe (patrón 3, hallazgo 1571).
   */
  const netoParcial =
    faltanEnElNeto.length > 0 ||
    avisoIlegiblesNeto !== null ||
    (resultadosVendedor?.camposIlegibles.length ?? 0) > 0 ||
    (resultadosVendedor?.parCatastralImposible ?? false);

  /**
   * ¿La plusvalía FALTA mientras la ganancia sí se calcula? Al calcularse restará del valor de
   * transmisión (art. 35.1 LIRPF): la ganancia y el IRPF publicados son un MÁXIMO, y la pérdida
   * un mínimo (patrón de familia 2, hallazgo 1570).
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
    if (v.tipo === 'mixto' || (pendiente && v.tipo === 'mayor')) {
      const ilegibles = v.tipo === 'mixto' ? [...v.menor, ...v.mayor] : v.campos;
      return `Sin cerrar: ${pendiente ? 'falta la plusvalía municipal, ' : ''}${noSePudoLeer(ilegibles)} y mueven ${que} en sentidos contrarios. ${escribelo(ilegibles)} con coma decimal (1.234,56).`;
    }
    // «Escríbelos» detrás de dos importes (redacción común, hallazgos 1555 y 1577).
    const ilegible = `${mayuscula(noSePudoLeer(v.campos))}, así que ${que} real ${v.seguro ? 'es' : 'puede ser'} ${v.tipo === 'menor' ? 'menor' : 'mayor'}. ${escribelo(v.campos)} con coma decimal (1.234,56).`;
    return pendiente ? `${frasePlusvalia}. ${ilegible}` : ilegible;
  };

  /** La cifra es un MÁXIMO por la plusvalía que falta y ningún ilegible tira en contra. */
  const esMaximoPorPlusvalia = (v: Veredicto): boolean =>
    plusvaliaPendiente && (v.tipo === 'ninguno' || v.tipo === 'menor');

  /**
   * La pérdida es la ganancia con el signo cambiado: su dirección es la contraria. Abre en
   * mayúscula, como los demás avisos de la redacción común (hallazgo 1577).
   */
  const avisoPerdida = (v: Veredicto): string | null => {
    const frasePlusvalia = 'No resta la plusvalía municipal, que falta, así que la pérdida real puede ser mayor que esta';
    if (v.tipo === 'ninguno') return plusvaliaPendiente ? `${frasePlusvalia}.` : null;
    if (v.tipo === 'mixto' || (plusvaliaPendiente && v.tipo === 'mayor')) {
      const ilegibles = v.tipo === 'mixto' ? [...v.menor, ...v.mayor] : v.campos;
      return `Sin cerrar: ${plusvaliaPendiente ? 'falta la plusvalía municipal, ' : ''}${noSePudoLeer(ilegibles)} y mueven la pérdida en sentidos contrarios. ${escribelo(ilegibles)} con coma decimal (1.234,56).`;
    }
    const mayorPerdida = v.tipo === 'menor';
    const ilegible = `${mayuscula(noSePudoLeer(v.campos))}: la pérdida real ${v.seguro ? 'es' : 'puede ser'} ${mayorPerdida ? 'mayor' : 'menor'} que esta${mayorPerdida ? '' : ' (o puede haber ganancia)'}. ${escribelo(v.campos)} con coma decimal (1.234,56).`;
    return plusvaliaPendiente ? `${frasePlusvalia}. ${ilegible}` : ilegible;
  };

  /**
   * «Sin ganancia ni pérdida» con un importe ilegible o con la plusvalía pendiente: ese cero no
   * es firme, y la tarjeta no puede negar una pérdida (o una ganancia) que la app sabe que puede
   * haber. Tenía texto fijo y no miraba el sondeo (patrón 6, hallazgo 1575).
   */
  const avisoCero = (v: Veredicto): string | null => {
    const frasePlusvalia = 'No resta la plusvalía municipal, que falta: con ella puede haber una pérdida que se compensaría en la declaración';
    if (v.tipo === 'ninguno') return plusvaliaPendiente ? `${frasePlusvalia}.` : null;
    if (v.tipo === 'mixto' || (plusvaliaPendiente && v.tipo === 'mayor')) {
      const ilegibles = v.tipo === 'mixto' ? [...v.menor, ...v.mayor] : v.campos;
      return `Sin cerrar: ${plusvaliaPendiente ? 'falta la plusvalía municipal, ' : ''}${noSePudoLeer(ilegibles)} y tiran en sentidos contrarios: puede haber ganancia o pérdida. ${escribelo(ilegibles)} con coma decimal (1.234,56).`;
    }
    const ilegible =
      v.tipo === 'menor'
        ? `${mayuscula(noSePudoLeer(v.campos))}, así que ${v.seguro ? 'hay' : 'puede haber'} una pérdida que se compensaría en la declaración. ${escribelo(v.campos)} con coma decimal (1.234,56).`
        : `${mayuscula(noSePudoLeer(v.campos))}, así que ${v.seguro ? 'hay' : 'puede haber'} una ganancia, y con ella IRPF. ${escribelo(v.campos)} con coma decimal (1.234,56).`;
    return plusvaliaPendiente ? `${frasePlusvalia}. ${ilegible}` : ilegible;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span aria-hidden="true" className={styles.heroIcon}>🏪</span>
        <h1 className={styles.title}>Simulador de Gastos de Compraventa de Local Comercial</h1>
        <p className={styles.subtitle}>
          Si compras: IVA, ITP, AJD, notaría y registro, incluida la renuncia a la exención de IVA con
          inversión del sujeto pasivo. Si vendes: plusvalía municipal, IRPF de la ganancia y neto que recibes
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-local-comercial"
        collapsible={false}
      />

      {/* DOS sellos, uno por mitad. Con uno solo, el «verificado 2026-06-17» de la compra
          cubría también los coeficientes de plusvalía, que están sellados en 2025 y se
          actualizan cada año por Ley de Presupuestos (hallazgo 332). */}
      <DataReference
        normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia} · lo que paga quien compra`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={NOTA_DATOS}
      />

      {/* Y un sello por tributo en la mitad del vendedor: el IRPF de la ganancia se publicaba
          bajo la fuente y la fecha de la PLUSVALÍA, que no son las de la escala del ahorro con
          la que la app lo calcula. Es la reparación del hallazgo 781 de simulador-heredar-
          vivienda, que no había llegado aquí (hallazgo 1579). */}
      <DataReference
        normativa={`Plusvalía municipal (IIVTNU) ${PLUSVALIA_MUNICIPAL_META.vigencia} · lo que paga quien vende`}
        fuente={PLUSVALIA_MUNICIPAL_META.baseNormativa}
        verificado={PLUSVALIA_MUNICIPAL_META.verificado}
        urlOficial={PLUSVALIA_MUNICIPAL_META.urlReferencia}
        nota={`${PLUSVALIA_MUNICIPAL_META.aviso} ${PLUSVALIA_MUNICIPAL_META.nota}`}
      />
      <DataReference
        normativa={`IRPF de la ganancia ${GANANCIAS_PATRIMONIALES_META.vigencia} · lo que paga quien vende`}
        fuente={GANANCIAS_PATRIMONIALES_META.fuente}
        verificado={GANANCIAS_PATRIMONIALES_META.verificado}
        urlOficial={GANANCIAS_PATRIMONIALES_META.urlOficial}
        nota={GANANCIAS_PATRIMONIALES_META.nota}
      />

      {/* Aviso IVA deducible */}
      {/* El aviso de cabecera es el primero que se lee y era texto FIJO: prometía un IVA
          —y una renuncia a su exención— en Canarias, Ceuta y Melilla, donde la propia app
          responde «IGIC/IPSI · No calculado» unas tarjetas más abajo. Es el mismo defecto que
          el hallazgo 1177 destapó en la hermana nave-industrial, y que allí ya habían cerrado
          los dos avisos del selector de transmisión con el hallazgo 647. */}
      <div className={styles.ivaAviso} role="note">
        {territorioActualSinIva ? (
          <>
            <strong><span aria-hidden="true">💡</span> Si eres empresa o autónomo:</strong> en{' '}
            {datosCcaaActual.nombre} no rige el IVA, sino el {territorioActualSinIva.impuesto}{' '}
            ({territorioActualSinIva.nombre}), que esta calculadora no cifra. El impuesto soportado
            también puede ser <strong>deducible</strong>, pero con las reglas del{' '}
            {territorioActualSinIva.impuesto}.{' '}
            {/* Decía que la renuncia «no existe allí» en los tres territorios, y en Canarias sí:
                es a la exención del IGIC (art. 50.Cinco Ley canaria 4/2012). En Ceuta y Melilla el
                IPSI no la regula (Ley 8/1991, arts. 7 y 20.3). Decisión común de la familia con
                nave-industrial (hallazgo 1584). */}
            {renunciaImposible ? (
              <>La <strong>renuncia a la exención</strong> no existe en el {territorioActualSinIva.impuesto}: la segunda mano paga siempre ITP.</>
            ) : (
              <>En segunda mano entre empresarios con derecho a deducción se puede <strong>renunciar a la exención del {territorioActualSinIva.impuesto}</strong> (art. 50.Cinco Ley canaria 4/2012).</>
            )}{' '}
            Consúltalo con tu asesor fiscal antes de decidir.
          </>
        ) : (
          <>
            <strong><span aria-hidden="true">💡</span> Si eres empresa o autónomo:</strong> el IVA soportado en la compra de un local comercial
            puede ser <strong>deducible</strong> si tu actividad está sujeta a IVA. Por eso, en segunda mano entre
            profesionales, muchas veces conviene <strong>renunciar a la exención de IVA</strong> para no pagar un ITP
            que no se recupera. Consulta con tu asesor fiscal antes de decidir.
          </>
        )}
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de transmisión</label>
            <div className={styles.transmisionGrid}>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${transmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
                aria-pressed={transmision === 'segunda-mano'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP (tipo general)</span>
              </button>
              {/* En Ceuta y Melilla la renuncia no existe (TERRITORIOS_SIN_RENUNCIA): el botón se
                  desactiva y dice por qué, en vez de calcular una opción que la ley no tiene. En
                  Canarias la renuncia es a la exención del IGIC. */}
              <button
                type="button"
                className={`${styles.transmisionBtn} ${transmision === 'segunda-mano-renuncia' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano-renuncia')}
                aria-pressed={transmision === 'segunda-mano-renuncia'}
                disabled={renunciaImposible}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🤝</span>
                <span>2ª mano con renuncia {impuestoDeLaRenuncia}</span>
                {/* En Canarias, Ceuta y Melilla no rige el IVA (IGIC/IPSI): el rótulo no puede
                    prometer un IVA que el recuadro de abajo desmiente, y el tipo se lee de
                    data/fiscal en vez de teclearse (hallazgos 620 y 621). */}
                <span className={styles.transmisionSub}>
                  {renunciaImposible
                    ? `No existe en el ${territorioActualSinIva?.impuesto ?? 'IPSI'}: paga ITP`
                    : territorioActualSinIva
                      ? `Paga ${territorioActualSinIva.impuesto} (ISP) + AJD`
                      : `IVA ${formatNumber(IVA_LOCAL_COMERCIAL, 0)}% (ISP) + AJD`}
                </span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${transmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
                aria-pressed={transmision === 'primera-mano'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🆕</span>
                <span>Obra nueva / Promotor</span>
                <span className={styles.transmisionSub}>
                  {territorioActualSinIva
                    ? `Paga ${territorioActualSinIva.impuesto} + AJD`
                    : `Paga IVA ${formatNumber(IVA_LOCAL_COMERCIAL, 0)}% + AJD`}
                </span>
              </button>
            </div>
          </div>

          {/*
            El aviso se pintaba con `esRenuncia` a secas: en Canarias, Ceuta y Melilla afirmaba que
            hay un IVA que autoliquidar donde rige el IGIC o el IPSI, y quedaba contradicho por el
            <AvisoTerritorioSinIva> de debajo, que se lee a la vez (hallazgo 727). nave-industrial
            ya condicionaba este texto por territorio.
          */}
          {esRenuncia && (
            <div className={styles.renunciaAviso} role="note">
              {territorioActualSinIva ? (
                // Solo se llega aquí en Canarias: en Ceuta y Melilla la renuncia no existe y
                // `transmision` ya es la segunda mano. Decía que «ni la renuncia ni la inversión
                // del sujeto pasivo entran en juego», y en el IGIC entran las dos.
                <>
                  <strong><span aria-hidden="true">⚠️</span> Renuncia a la exención del {territorioActualSinIva.impuesto}:</strong> en{' '}
                  {datosCcaaActual.nombre} no se devenga IVA, sino el <strong>{territorioActualSinIva.impuesto}</strong>, y la
                  renuncia es a su exención (art. 50.Cinco Ley canaria 4/2012), entre empresarios con derecho a
                  deducción. Ese {territorioActualSinIva.impuesto} lo <strong>autoliquida el comprador</strong> por inversión
                  del sujeto pasivo, la operación deja de pagar ITP y la escritura paga AJD. Esta calculadora no
                  cifra el {territorioActualSinIva.impuesto}; el AJD sí, con el tipo general de la comunidad.
                </>
              ) : (
                <>
                  <strong><span aria-hidden="true">⚠️</span> Renuncia a la exención de IVA (Art. 20.Dos LIVA):</strong> solo es posible cuando
                  comprador y vendedor son empresarios o profesionales con derecho a deducción. El IVA se autoliquida
                  por <strong>inversión del sujeto pasivo</strong> (no se paga al vendedor) y es deducible si tienes
                  derecho. A cambio, la escritura tributa por AJD, que <strong>algunas comunidades aplican a un tipo
                  incrementado</strong> en caso de renuncia.{' '}
                  {/* El «(a menudo 1,5%–2%)» que iba aquí no tenía fuente. El tipo de la renuncia
                      solo está verificado en Valencia (Ley 13/1997, art. 14.Dos: 2 %, hallazgo 1603),
                      y ahí el simulador lo aplica; en el resto usa el general y lo dice. */}
                  {ajdRenunciaPropio
                    ? <>En {datosCcaaActual.nombre} es del {formatTipoNominal(ajdRenuncia.tipo)}%, y es el que aplica este simulador.</>
                    : <>Este simulador usa el AJD general de {datosCcaaActual.nombre}: si tu comunidad tiene un tipo propio para la renuncia, el coste real de AJD puede ser mayor.</>}
                </>
              )}
            </div>
          )}

          {/* Precio. La base del IVA es la contraprestación pactada (art. 78 LIVA); el valor
              de referencia catastral es la base MÍNIMA del ITP/AJD, no del IVA. Mandar a poner
              «el mayor de ambos» en la rama de IVA infla el impuesto sobre una base que la ley
              del IVA no reconoce (hallazgo 618). */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio del local comercial"
            placeholder="200000"
            helperText={
              conIvaEnPantalla
                ? 'Contraprestación pactada en la escritura (base del IVA, art. 78 LIVA)'
                : 'Precio escriturado o valor de referencia catastral (el mayor de ambos)'
            }
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="select-ccaa">
              Comunidad Autónoma (ubicación del local)
            </label>
            <select
              id="select-ccaa"
              value={ccaa}
              onChange={(e) => setCcaa(e.target.value as ComunidadAutonoma)}
              className={styles.select}
            >
              {COMUNIDADES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <AvisoTerritorioSinIva ccaa={ccaa} aplica={transmision === 'primera-mano' || esRenuncia} />

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span className={styles.infoCcaaIcon} aria-hidden="true">📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                {/* Del motor, para un local y con el precio escrito: el País Vasco grava al 7 % lo
                    que no es vivienda, y Valencia pasa al 11 % por encima del millón (hallazgos
                    1581 y 1582). `datosCcaaActual.tipoGeneral` es el de la vivienda. */}
                <span className={styles.infoCcaaValue}>{formatTipoNominal(tipoGeneralITP(ccaa, OBJETO, precioLeido))}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                {/* El de un local (el País Vasco ya no sale a 0 %) y, con renuncia, el de la
                    renuncia donde está verificado (hallazgos 1583 y 1603). */}
                <span className={styles.infoCcaaValue}>{formatTipoNominal(ajdRenuncia.tipo)}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
{/*
                La casilla se imprimía incondicional, también en Canarias, Ceuta y Melilla, donde
                no rige el IVA y la propia app responde «IGIC/IPSI · No calculado» dos tarjetas más
                allá. La hermana nave-industrial ya lo condiciona así (hallazgo 725). El tipo pasa
                además por formatTipoNominal, como el resto del panel.
              */}
                <span className={styles.infoCcaaLabel}>
                  {TERRITORIOS_SIN_IVA[ccaa]
                    ? `${TERRITORIOS_SIN_IVA[ccaa].impuesto} (obra nueva)`
                    : 'IVA (comercial)'}
                </span>
                <span className={styles.infoCcaaValue}>
                  {/* El sufijo «%» se quedó fuera del ternario al condicionar la línea por
                      territorio, y la casilla publicaba un «21» desnudo entre dos porcentajes
                      —«ITP General 9%» y «AJD 1,5%»— desde el 11/09 (hallazgo 1161). */}
                  {TERRITORIOS_SIN_IVA[ccaa] ? 'No calculado' : `${formatTipoNominal(IVA_LOCAL_COMERCIAL)}%`}
                </span>
              </div>
            </div>
            {/* Escala o umbral, con sus palabras: Valencia no tiene escala (hallazgos 1581 y 1602). */}
            {subidaITP && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> {subidaITP}
              </p>
            )}
            <p className={styles.infoCcaaNote}>
              Un local comercial tributa por el <strong>tipo general</strong> de ITP: los tipos reducidos por
              perfil del comprador (jóvenes, familia numerosa, discapacidad) exigen que el inmueble sea la
              vivienda habitual, y un local no lo es. Eso no agota los beneficios posibles — alguna comunidad
              tiene tipos propios ligados a la ACTIVIDAD, no a la vivienda, y esta calculadora no los aplica.
            </p>
            {/*
              El aviso de la ficha de la comunidad, que es donde vive ese matiz. Sin él, la nota de
              arriba descartaba de plano un tipo que la propia `data/itp-ccaa.ts` documenta: el 1 %
              del art. 121-11 de Aragón por adquirir un inmueble para INICIAR UNA ACTIVIDAD
              ECONÓMICA, que es justo el supuesto de quien compra un local para abrir un negocio
              (hallazgo 726). Las hermanas garaje, trastero y estimador-compraventa-inmueble ya
              pintan este mismo campo; esta app era la única que no.
            */}
            {datosCcaaActual.notas && (
              <p className={styles.infoCcaaNote}>
                <strong>{datosCcaaActual.nombre}:</strong> {datosCcaaActual.notas}
              </p>
            )}
          </div>

          {/* Gestoría */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría del comprador (€)"
              placeholder="500"
              helperText="Típico en operaciones comerciales: 400-800 €. Solo afecta al presupuesto del comprador"
              min={0}
            />
          </div>

          {/* Enlace Catastro */}
          <div className={styles.enlaceCatastro}>
            <a
              href={ENLACE_CATASTRO}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.catastroLink}
            >
              <span aria-hidden="true">🔗</span> Consultar valor de referencia catastral en la Sede del Catastro
            </a>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultados}>
          {/* Pestañas comprador / vendedor */}
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

          {pestanaActiva === 'comprador' && (resultadosComprador ? (
            <div className={styles.resultsInner}>
              <ResultCard
                title="Precio del local comercial"
                value={formatCurrency(resultadosComprador.precioInmueble)}
                variant="default"
                icon="🏪"
              />

              <ResultCard
                title={
                  resultadosComprador.impuestoNoCalculado
                    ? resultadosComprador.tipoImpuesto
                    : `${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 2)}%)`
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
                    // El texto nombra la operación ELEGIDA, no siempre la obra nueva: es el
                    // hallazgo 451 de la app hermana de la nave industrial.
                    ? `En ${datosCcaaActual.nombre} no rige el IVA: ${esRenuncia ? 'la renuncia a la exención' : 'la compra de obra nueva'} tributa por el ${resultadosComprador.tipoImpuesto}, que este simulador no calcula`
                    : esRenuncia
                      ? 'Autorrepercutido por inversión del sujeto pasivo — deducible si eres sujeto pasivo de IVA'
                      : resultadosComprador.ivaRecuperable
                        ? 'Potencialmente deducible si eres empresa/autónomo sujeto a IVA'
                        : resultadosComprador.bonificado
                          ? 'Tipo general con la bonificación del 50 % de la cuota ya aplicada (art. 57 bis.3.a TRLITPAJD)'
                          : 'Tipo general — los locales no tienen los reducidos de vivienda, pero alguna comunidad sí tiene tipos ligados a la ACTIVIDAD'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  // Tipo EFECTIVO, no el nominal de la tabla: en Ceuta y Melilla la cuota
                  // gradual se bonifica al 50 % (art. 57 bis.1 TRLITPAJD), así que el nominal
                  // se desmentía con el importe de al lado (hallazgo 619, ya reparado en la
                  // app hermana de la nave industrial como hallazgo 447).
                  title={`AJD (${formatNumber((resultadosComprador.ajd / resultadosComprador.precioInmueble) * 100, 2)}%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
                  description={
                    resultadosComprador.bonificado
                      ? 'Con la bonificación del 50 % de Ceuta y Melilla aplicada'
                      : esRenuncia
                        ? ajdRenunciaPropio
                          ? `Tipo propio de la renuncia a la exención del IVA en ${datosCcaaActual.nombre}`
                          : `AJD general de ${datosCcaaActual.nombre}: algunas comunidades aplican un tipo incrementado en la renuncia`
                        : undefined
                  }
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
                Con la guarda `> 0` a secas, un importe que el parser no puede leer valía 0 y la
                línea DESAPARECÍA del desglose (hallazgo 1199). Ahora se pinta igual y dice que el
                dato está escrito pero no se ha podido leer.
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

              {/* Las dos cifras de cierre se titulan «(PARCIAL)» con la MISMA condición que ya
                  las rotulaba así sin el IGIC/IPSI: la gestoría ilegible y la notaría de libre
                  acuerdo les quitan algo en la misma dirección (patrón de familia 1, hallazgo
                  1576; y el 1599 del arancel). */}
              <ResultCard
                title={costeCompradorParcial ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales'}
                value={formatCurrency(resultadosComprador.totalGastos)}
                variant="info"
                icon="➕"
                description={
                  [
                    `${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}% sobre el precio de compra`,
                    resultadosComprador.impuestoNoCalculado
                      ? `SIN el ${resultadosComprador.tipoImpuesto}, que no está incluido`
                      : null,
                    // Un importe que no se ha podido leer falta en el total igual que un impuesto
                    // sin calcular, y en la misma dirección (hallazgo 1199).
                    resultadosComprador.gestoriaLegible ? null : 'SIN la gestoría, que no se ha podido leer',
                    resultadosComprador.notariaLibre ? 'SIN la parte de la notaría que es de libre acuerdo' : null,
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
                        resultadosComprador.impuestoNoCalculado ? `el ${resultadosComprador.tipoImpuesto}` : null,
                        resultadosComprador.gestoriaLegible ? null : 'la gestoría, que no se ha podido leer',
                        resultadosComprador.notariaLibre
                          ? `la parte de la notaría que excede de ${formatCurrency(LIMITE_ARANCEL_NOTARIAL)}, que es de libre acuerdo`
                          : null,
                      ]
                        .filter((x): x is string => x !== null)
                        .join(' ni ')}: ${resultadosComprador.gestoriaLegible ? 'el coste real puede ser mayor' : 'el coste real será mayor'}`
                    : resultadosComprador.ivaRecuperable
                      ? 'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)'
                      : 'Precio + todos los gastos de la operación'
                }
              />
            </div>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>
                {escritoIlegible(precioVenta, parseSpanishNumber)
                  ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio del local comercial con coma decimal (200.000 o 200000,50) para ver el desglose de gastos`
                  : 'Introduce el precio del local comercial para ver el desglose de gastos'}
              </p>
            </div>
          ))}

          {/* ===== VENDEDOR ===== */}
          {pestanaActiva === 'vendedor' && (
            <div className={styles.resultsInner}>
              <div className={styles.formVendedor}>
                <h3 className={styles.formVendedorTitle}>Datos para calcular plusvalía e IRPF</h3>

                <div className={styles.perfilGrid}>
                  <button
                    type="button"
                    aria-pressed={perfilVendedor === 'particular'}
                    className={`${styles.transmisionBtn} ${perfilVendedor === 'particular' ? styles.active : ''}`}
                    onClick={() => setPerfilVendedor('particular')}
                  >
                    <span className={styles.transmisionIcon} aria-hidden="true">🙋</span>
                    <span>Local no afecto</span>
                    <span className={styles.transmisionSub}>Patrimonio particular</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={perfilVendedor === 'afecto-actividad'}
                    className={`${styles.transmisionBtn} ${perfilVendedor === 'afecto-actividad' ? styles.active : ''}`}
                    onClick={() => setPerfilVendedor('afecto-actividad')}
                  >
                    <span className={styles.transmisionIcon} aria-hidden="true">🏪</span>
                    <span>Local afecto a actividad</span>
                    <span className={styles.transmisionSub}>Con amortizaciones</span>
                  </button>
                </div>

                <NumberInput
                  value={precioCompraOriginal}
                  onChange={setPrecioCompraOriginal}
                  label="Precio de compra original"
                  placeholder="150000"
                  helperText="Precio escriturado al adquirir el local, sin los gastos (van en el campo siguiente)"
                  min={0}
                />

                <NumberInput
                  value={gastosAdquisicion}
                  onChange={setGastosAdquisicion}
                  label="Impuestos y gastos que pagaste al comprarlo (€)"
                  placeholder="15000"
                  helperText="ITP o IVA no deducible, notaría, registro y gestoría de aquella compra: suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)"
                  min={0}
                />

                {perfilVendedor === 'afecto-actividad' && (
                  <NumberInput
                    value={amortizacionesAcumuladas}
                    onChange={setAmortizacionesAcumuladas}
                    label="Amortizaciones acumuladas deducidas (€)"
                    placeholder="20000"
                    helperText="Suma de la amortización deducida en tu actividad. Se resta del valor de adquisición y aumenta la ganancia."
                    min={0}
                  />
                )}

                <NumberInput
                  value={aniosPropiedad}
                  onChange={setAniosPropiedad}
                  label="Años de propiedad"
                  placeholder="10"
                  helperText={AYUDA_ANIOS_PROPIEDAD}
                  min={0}
                  // El blur NO acota este campo: su min es 0 y el 0 SIGNIFICA la reventa antes
                  // del año (el coeficiente anual prorrateado por meses completos, art. 107.4
                  // TRLRHL; hasta el 24/09/2026, un 0,14 fijo), así que
                  // reescribir al mínimo un valor imposible lo convertía en un supuesto fiscal
                  // válido y caro —2.800 € de IIVTNU a partir del «−1» que la propia app
                  // acababa de rechazar— y el neto se presentaba como definitivo (hallazgo
                  // 1160; es el 822/844 que garaje y trastero repararon así el 15/09). Quien
                  // decide sobre un año negativo es la guarda `aniosNegativo` del useMemo.
                  acotarAlSalir={false}
                />

                {/* Con años = 0, los meses completos del prorrateo (hallazgo 1560). Un <select>
                    y no un NumberInput: son doce valores cerrados, no un importe que se escriba mal. */}
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

                <NumberInput
                  value={valorCatastralSuelo}
                  onChange={setValorCatastralSuelo}
                  label="Valor catastral del suelo (€)"
                  placeholder="40000"
                  helperText="Solo la parte de suelo, no la construcción. Aparece en el recibo del IBI."
                  min={0}
                />

                <NumberInput
                  value={valorCatastralTotal}
                  onChange={setValorCatastralTotal}
                  label="Valor catastral total (suelo + construcción) (€)"
                  placeholder="100000"
                  helperText="También en el recibo del IBI. Sin este dato no puede compararse el método real de la plusvalía y se aplica el objetivo"
                  min={0}
                />

                <NumberInput
                  value={comisionInmobiliaria}
                  onChange={setComisionInmobiliaria}
                  label="Comisión de la inmobiliaria (%)"
                  placeholder="3"
                  helperText="Habitual en locales: 3-5% del precio de venta"
                  min={0}
                />

                <NumberInput
                  value={gastosGestoriaVenta}
                  onChange={setGastosGestoriaVenta}
                  label="Gestoría y certificados del vendedor (€)"
                  placeholder="0"
                  helperText="Solo lo que pagas TÚ al vender (certificado energético, gestoría propia). La gestoría del comprador no reduce tu ganancia: art. 35.1 LIRPF"
                  min={0}
                />

                <div className={styles.enlaceCatastro}>
                  <a href={ENLACE_CATASTRO} target="_blank" rel="noopener noreferrer" className={styles.catastroLink}>
                    <span aria-hidden="true">🔗</span> Consultar el valor catastral del suelo en la Sede del Catastro
                  </a>
                </div>
              </div>

              {resultadosVendedor ? (
                <>
                  <ResultCard
                    title="Precio de venta"
                    value={formatCurrency(resultadosVendedor.precioVenta)}
                    variant="default"
                    icon="🏪"
                  />

                  <ResultCard
                    title="Plusvalía municipal (IIVTNU)"
                    // «Sin calcular» y no «0,00 €»: un cero se lee como «no pagas nada», y
                    // aquí significa «faltan datos». La partida tampoco se suma al total ni
                    // se descuenta del neto, y por eso ambos van rotulados como parciales.
                    value={
                      resultadosVendedor.plusvaliaCalculada
                        ? formatCurrency(resultadosVendedor.plusvaliaMunicipal)
                        : 'Sin calcular'
                    }
                    variant={
                      !resultadosVendedor.plusvaliaCalculada
                        ? 'default'
                        : resultadosVendedor.exentoPlusvalia
                          ? 'info'
                          : 'warning'
                    }
                    icon="🏛️"
                    description={resultadosVendedor.metodoPlusvalia}
                  />

                  {/* Con precio de compra, aunque las amortizaciones dejen el valor corregido en 0:
                      la guarda `> 0` era para «falta el precio de compra» y escondía las dos
                      tarjetas justo en el caso que hay que explicar (hallazgo 1261). */}
                  {resultadosVendedor.valorAdquisicionCorregido > 0 || resultadosVendedor.costeAdquisicion > 0 ? (
                    <>
                      <ResultCard
                        title="Valor de adquisición"
                        value={formatCurrency(resultadosVendedor.valorAdquisicionCorregido)}
                        variant="default"
                        icon="📥"
                        // Con los gastos de aquella compra ilegibles, el rótulo afirmaba que están
                        // sumados mientras el motor los había tomado como 0 (hueco A1 del testigo
                        // de familia; garaje y trastero ya lo decían así).
                        description={
                          (resultadosVendedor.gastosAdquisicionLegible
                            ? 'Precio de compra + impuestos y gastos de aquella compra'
                            : 'Precio de compra') +
                          (resultadosVendedor.amortizacionesRestadas > 0
                            ? ` − ${formatCurrency(resultadosVendedor.amortizacionesRestadas)} de amortizaciones deducidas`
                            : '') +
                          (resultadosVendedor.gastosAdquisicionLegible
                            ? ''
                            : '. Los impuestos y gastos de aquella compra no se han podido leer y no están sumados') +
                          (resultadosVendedor.amortizacionesLegible
                            ? ''
                            : '. Las amortizaciones deducidas no se han podido leer y no están restadas') +
                          (resultadosVendedor.amortizacionesImposibles
                            ? `. Atención: las amortizaciones superan todo el coste de adquisición (${formatCurrency(resultadosVendedor.costeAdquisicion)}): no puede ser, porque se amortiza solo la construcción. Revisa el dato`
                            : '') +
                          // Con los gastos ilegibles no se puede afirmar que sean imposibles
                          // (hallazgo 1573): se dice qué tendrían que sumar para cuadrar.
                          (resultadosVendedor.excesoSobrePrecio > 0
                            ? `. Las amortizaciones superan el precio de compra: solo cuadran si los impuestos y gastos de aquella compra, que no se han podido leer, suman al menos ${formatCurrency(resultadosVendedor.excesoSobrePrecio)}`
                            : '')
                        }
                      />
                      <ResultCard
                        title="Valor de transmisión"
                        value={formatCurrency(resultadosVendedor.valorTransmision)}
                        variant="default"
                        icon="📤"
                        // Afirmaba restar una comisión que el motor había tomado como 0 por
                        // ilegible (hallazgo 1260, la gemela del 1197).
                        // Sin la plusvalía calculada no puede decir que la resta: el motor la tomó
                        // como 0, y la ganancia y el IRPF de abajo son un máximo (patrón 2, 1570).
                        description={
                          resultadosVendedor.comisionLegible && resultadosVendedor.gestoriaLegible
                            ? resultadosVendedor.plusvaliaCalculada
                              ? 'Precio de venta − comisión, gestoría y plusvalía municipal'
                              : 'Precio de venta − comisión y gestoría, sin la plusvalía municipal, que falta'
                            : `Precio de venta − ${resultadosVendedor.plusvaliaCalculada ? 'plusvalía municipal y ' : ''}los gastos que se leen${resultadosVendedor.plusvaliaCalculada ? '' : ' (sin la plusvalía municipal, que falta)'}: ${noSePudoLeer([
                                ...(resultadosVendedor.comisionLegible ? [] : ['la comisión']),
                                ...(resultadosVendedor.gestoriaLegible ? [] : ['la gestoría de la venta']),
                              ])}`
                        }
                      />
                    </>
                  ) : null}

                  {resultadosVendedor.amortizacionesImposibles ? null : resultadosVendedor.sinGananciaNiPerdida ? (
                    /*
                      Ni ganancia ni pérdida: se vende EXACTAMENTE por el valor de adquisición.
                      Antes caía por la rama de la pérdida —`esPerdida` es `ganancia <= 0`— y la
                      app afirmaba dos cosas falsas a la vez: que se vendía por debajo del coste y
                      que había una pérdida compensable en la declaración (hallazgos 823 y 845).
                    */
                    <ResultCard
                      title="Sin ganancia ni pérdida"
                      value={formatCurrency(0)}
                      variant="default"
                      icon="⚖️"
                      // El cero no es firme con un importe ilegible o sin la plusvalía: lo dice el
                      // sondeo, no un texto fijo (patrón 6, hallazgo 1575).
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
                        'Vendes por debajo del valor de adquisición: no hay IRPF y la pérdida se puede compensar en la declaración'
                      }
                    />
                  ) : (
                    /* Sin el precio de compra original no hay ganancia que enseñar: la que
                       salía era un «0,00 €» que no es cero, es desconocido (hallazgo 1159). */
                    resultadosVendedor.gananciaPatrimonial > 0 && (
                      <ResultCard
                        // Un MÁXIMO mientras falte la plusvalía (patrón 2, hallazgo 1570).
                        title={
                          esMaximoPorPlusvalia(resultadosVendedor.veredictoGanancia)
                            ? 'Ganancia patrimonial (máximo)'
                            : 'Ganancia patrimonial'
                        }
                        value={formatCurrency(resultadosVendedor.gananciaPatrimonial)}
                        variant="default"
                        icon="📈"
                        description={
                          avisoTarjeta(resultadosVendedor.veredictoGanancia, 'la ganancia') ??
                          'Valor de transmisión menos valor de adquisición'
                        }
                      />
                    )
                  )}

                  <ResultCard
                    title={
                      resultadosVendedor.irpfGanancia > 0 && esMaximoPorPlusvalia(resultadosVendedor.veredictoIrpf)
                        ? 'IRPF sobre la ganancia (máximo)'
                        : 'IRPF sobre la ganancia'
                    }
                    // «Sin calcular» en gris, y no «SIN CUOTA» en verde, cuando falta el precio
                    // de compra: ese 0 no es una exención, es un dato que falta. Es el efecto
                    // familia del 483 que garaje, trastero y el hub ya cerraban (hallazgo 1159).
                    value={
                      !resultadosVendedor.irpfCalculado
                        ? 'Sin calcular'
                        : resultadosVendedor.irpfGanancia > 0
                          ? formatCurrency(resultadosVendedor.irpfGanancia)
                          : 'SIN CUOTA'
                    }
                    variant={
                      !resultadosVendedor.irpfCalculado
                        ? 'default'
                        : resultadosVendedor.irpfGanancia > 0
                          ? 'warning'
                          : 'success'
                    }
                    icon="🧾"
                    description={
                      resultadosVendedor.amortizacionesImposibles
                        ? `Sin calcular: las amortizaciones deducidas superan todo el coste de adquisición (${formatCurrency(resultadosVendedor.costeAdquisicion)}), y eso no puede ser porque solo se amortiza la construcción. Revisa el dato. Este impuesto NO está incluido en el neto de abajo.`
                        : !resultadosVendedor.irpfCalculado
                          ? resultadosVendedor.camposIlegibles.includes('el precio de compra original')
                            ? 'El precio de compra original no se ha podido leer: escríbelo con coma decimal (1.234,56). Este impuesto NO está incluido en el neto de abajo.'
                            : 'Falta el precio de compra original. Este impuesto NO está incluido en el neto de abajo.'
                          : // Se dice aquí, donde se lee la cuota, y no solo en el neto; la
                            // dirección la da el sondeo (hallazgo 1260).
                            // Sin ganancia no hay nada que tribute (la forma del hallazgo 1554).
                            (avisoTarjeta(resultadosVendedor.veredictoIrpf, 'la cuota', resultadosVendedor.irpfGanancia > 0) ??
                            (resultadosVendedor.gananciaPatrimonial < 0
                              ? 'No hay ganancia que gravar: la pérdida se compensa con otras ganancias del ahorro en tu declaración'
                              : resultadosVendedor.gananciaPatrimonial === 0
                                ? 'No hay ganancia que gravar, así que esta venta no tiene IRPF'
                                : `Base del ahorro (${formatNumber(TIPO_AHORRO_MIN, 0)}–${formatNumber(TIPO_AHORRO_MAX, 0)} %). Un local no tiene exención por reinversión ni por edad.`))
                    }
                  />

                  {/* Un porcentaje ilegible valía 0 y la tarjeta publicaba «0,00 €», un cero
                      falso al lado de un neto que ya avisaba de lo contrario (hueco A3). Se
                      pinta «Sin leer», como la gestoría del comprador de esta misma app. */}
                  <ResultCard
                    title="Comisión de la inmobiliaria"
                    value={
                      resultadosVendedor.comisionLegible
                        ? formatCurrency(resultadosVendedor.comisionInmobiliaria)
                        : 'Sin leer'
                    }
                    variant="default"
                    icon="🤝"
                    description={
                      resultadosVendedor.comisionLegible
                        ? undefined
                        : 'El porcentaje escrito no se ha podido leer, así que NO está descontado del neto. Escríbelo con coma decimal (3,5).'
                    }
                  />

                  <div className={styles.separador} />

                  {/* El total lleva dentro el mismo IRPF y la misma plusvalía que el neto: si el
                      neto es parcial, el total también (hallazgo 1264). */}
                  <ResultCard
                    title={netoParcial ? 'Total gastos de la venta (parcial)' : 'Total gastos de la venta'}
                    value={formatCurrency(resultadosVendedor.totalGastos)}
                    variant="info"
                    icon="➖"
                    description={
                      `${formatNumber((resultadosVendedor.totalGastos / resultadosVendedor.precioVenta) * 100, 2)}% sobre el precio de venta` +
                      (faltanEnElNeto.length > 0
                        ? ` — SIN ${enumerarNi(faltanEnElNeto)}, que no se ${faltanEnElNeto.length > 1 ? 'incluyen' : 'incluye'}`
                        : '') +
                      (avisoIlegiblesNeto ? ' — con importes que no se han podido leer (ver el neto de abajo)' : '')
                    }
                  />

                  {/* El neto del vendedor no puede darse por firme cuando le falta un
                      impuesto, igual que el panel del comprador rotula «COSTE TOTAL
                      (PARCIAL)» donde no calcula el IGIC/IPSI (hallazgo 666). */}
                  <ResultCard
                    title={netoParcial ? 'NETO QUE RECIBES (PARCIAL)' : 'NETO QUE RECIBES'}
                    value={formatCurrency(resultadosVendedor.netoVendedor)}
                    variant="highlight"
                    icon="💰"
                    description={
                      (() => {
                        const avisos: string[] = [];
                        // «puede ser», no «será»: un impuesto sin calcular también puede salir a cero —
                        // vendiendo con pérdida no hay IRPF ni plusvalía—, y entonces el neto real es igual.
                        if (faltanEnElNeto.length > 0) {
                          avisos.push(`No descuenta ${enumerarNi(faltanEnElNeto)}: el neto real puede ser menor que este`);
                        }
                        if (resultadosVendedor.camposIlegibles.length > 0) {
                          const f = noSePudoLeer(resultadosVendedor.camposIlegibles);
                          avisos.push(`${f.charAt(0).toUpperCase()}${f.slice(1)}`);
                        }
                        if (avisoIlegiblesNeto) avisos.push(avisoIlegiblesNeto);
                        // El par catastral imposible: la plusvalía se liquidó por el objetivo sin
                        // compararla con el real, que puede salir más barato. `netoParcial` no lo
                        // miraba (patrón 3, hallazgo 1571, lo que la referencia hace desde 85c9c9fe).
                        if (resultadosVendedor.parCatastralImposible) {
                          avisos.push(
                            'El valor catastral del suelo supera al total, y con el recibo del IBI bien leído la plusvalía puede salir más barata por el método real: el neto real puede ser MAYOR que este',
                          );
                        }
                        if (avisos.length === 0) return 'Precio de venta menos impuestos, comisión y gestoría';
                        const pedir = [
                          camposPendientes.length > 0 ? `Rellena ${enumerarEnEspanol(camposPendientes)}` : null,
                          resultadosVendedor.faltanMeses ? 'elige los meses completos desde la compra' : null,
                          // Un año negativo no «falta»: se corrige (patrón 5, hallazgo 1578).
                          resultadosVendedor.aniosNegativos ? 'corrige los años de propiedad (no pueden ser negativos)' : null,
                          hayIlegiblesQueCorregir ? 'escribe con coma decimal (1.234,56) lo que no se ha podido leer' : null,
                          resultadosVendedor.amortizacionesImposibles ? 'revisa las amortizaciones deducidas' : null,
                          resultadosVendedor.parCatastralImposible ? 'revisa los dos valores catastrales del recibo del IBI' : null,
                        ].filter((x): x is string => x !== null);
                        const texto = pedir.join(' y ');
                        return `${avisos.join('. ')}. ${texto.charAt(0).toUpperCase()}${texto.slice(1)} para obtenerlo.`;
                      })()
                    }
                  />

                  <p className={styles.notaVendedor}>
                    Si el vendedor es una <strong>sociedad</strong>, la ganancia no tributa en el IRPF sino
                    en el <strong>Impuesto sobre Sociedades</strong>. Y si el local se vende con{' '}
                    <strong>renuncia a la exención de IVA</strong>, el vendedor no repercute el impuesto:
                    lo autoliquida el comprador por inversión del sujeto pasivo.
                  </p>
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
                  <p>
                    {escritoIlegible(precioVenta, parseSpanishNumber)
                      ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio de venta del local con coma decimal (200.000 o 200000,50) para ver lo que te queda tras impuestos`
                      : 'Introduce el precio de venta del local para ver lo que te queda tras impuestos'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía fiscal para la compra de un local comercial"
        subtitle="IVA, ITP y la clave que las diferencia: la renuncia a la exención de IVA"
        icon="📚"
      >
        {/* Tabla comparativa de escenarios */}
        <section>
          <h2>Los tres escenarios fiscales de un local comercial</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.tablaEscenarios} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary-boton)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Escenario</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Impuesto principal</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>AJD</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>¿IVA deducible?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Obra nueva (promotor)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700, color: 'var(--primary)' }}>IVA {formatNumber(IVA_LOCAL_COMERCIAL, 0)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>Sí</td>
                  {/* Colores de la tabla con variante oscura (hallazgo 1580): el #27ae60 literal
                      daba 2,64:1 en claro, y el #c0392b de abajo 3,20:1 en oscuro. */}
                  <td className={styles.celdaFavorable} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>Sí (si sujeto pasivo)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0' }}>Segunda mano (regla general)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', fontWeight: 700 }}>ITP (tipo general)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>No</td>
                  <td className={styles.celdaDesfavorable} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>No (ITP no se recupera)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px' }}>Segunda mano con renuncia a la exención</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>IVA {formatNumber(IVA_LOCAL_COMERCIAL, 0)}% (ISP)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí (incrementado en algunas comunidades)</td>
                  <td className={styles.celdaFavorable} style={{ padding: '8px 10px', textAlign: 'center' }}>Sí (si sujeto pasivo)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Casos de uso habituales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🆕</span> Autónomo compra local nuevo al promotor</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Paga IVA {formatNumber(IVA_LOCAL_COMERCIAL, 0)}% + AJD. Si está dado de alta en una actividad sujeta a IVA, deduce el IVA
                soportado en la declaración trimestral (modelo 303).
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🔄</span> Particular compra local para invertir</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Al no ser sujeto pasivo de IVA, la operación de segunda mano está exenta de IVA y paga ITP
                al tipo general de su CCAA. El ITP no se recupera, pero se añade al valor de adquisición.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🤝</span> Empresa compra local usado a otra empresa</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si ambas partes tienen derecho a deducción, el vendedor puede renunciar a la exención de IVA.
                La operación pasa a IVA {formatNumber(IVA_LOCAL_COMERCIAL, 0)}% con inversión del sujeto pasivo: el comprador lo autoliquida y
                deduce, evitando un ITP que no recuperaría.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">📈</span> Vender el local con ganancia</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si vendes como persona física, la ganancia tributa en el IRPF del ahorro
                ({formatNumber(TIPO_AHORRO_MIN, 0)}%-{formatNumber(TIPO_AHORRO_MAX, 0)}%). Si vendes
                como empresa, tributa en el Impuesto de Sociedades. En ambos casos hay plusvalía municipal.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ específica local comercial */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Preguntas frecuentes — Compra de local comercial</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Primera de la lista a propósito: «escriturar» es como se teclea la pregunta,
                y hasta el 13/09/2026 el verbo no aparecía en ninguna de las seis apps. */}
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>{preguntaEscriturar(CASOS_ESCRITURAR.local.inmueble)}</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                {respuestaEscriturar(CASOS_ESCRITURAR.local)}
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Se paga IVA o ITP al comprar un local comercial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                En obra nueva (primera entrega del promotor) se paga IVA al {formatNumber(IVA_LOCAL_COMERCIAL, 0)}% más AJD. En segunda mano, por
                regla general la operación está exenta de IVA y se paga ITP al tipo general de la comunidad
                autónoma. La excepción es la renuncia a la exención de IVA entre empresarios. Nunca se pagan
                IVA e ITP a la vez.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Qué es la renuncia a la exención de IVA y a quién le interesa?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                La segunda transmisión de un inmueble está exenta de IVA (Art. 20.Uno.22º LIVA). Si comprador y
                vendedor son empresarios con derecho a deducción, el vendedor puede renunciar a esa exención
                (Art. 20.Dos): la compra tributa por IVA {formatNumber(IVA_LOCAL_COMERCIAL, 0)}% con inversión del sujeto pasivo en lugar de ITP.
                Interesa al comprador que puede deducir el IVA, porque el ITP es un coste no recuperable.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Qué es la inversión del sujeto pasivo en la compra de un local?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Cuando hay renuncia a la exención de IVA, el comprador no paga el IVA al vendedor: lo declara él
                mismo como IVA devengado y, a la vez, como IVA soportado deducible en el modelo 303. Si tiene
                derecho a deducción plena, el efecto en caja es cercano a cero. Es un mecanismo antifraude.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Cuánto AJD se paga si hay renuncia a la exención de IVA?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                {/* Sin la horquilla «habitualmente entre el 1,5% y el 2%», que no tenía fuente, y
                    sin «el País Vasco no lo cobra»: allí un local paga el 0,5 % (hallazgos 1583 y
                    1603). El tipo de la renuncia de Valencia sale de la tabla. */}
                La escritura tributa por AJD, y algunas comunidades aplican un tipo incrementado cuando existe
                renuncia a la exención de IVA —la Comunitat Valenciana, el {formatTipoNominal(ITP_CCAA.valencia.ajdRenuncia ?? ITP_CCAA.valencia.ajd)}% (Ley 13/1997, art. 14)—,
                frente al tipo general, que para un local va del {formatNumber(RANGO_AJD_OTROS.min, 1)}% al {formatNumber(RANGO_AJD_OTROS.max, 1)}% según la
                comunidad; en Ceuta y Melilla se descuenta el 50% de la cuota. Este simulador aplica el tipo de la
                renuncia donde está verificado y el AJD general en el resto; confirma el de tu comunidad antes de firmar.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Hay plusvalía municipal al vender un local comercial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Sí. La plusvalía municipal (IIVTNU) grava el incremento de valor del suelo durante el tiempo de
                propiedad, sea el inmueble residencial o comercial. Si no ha habido incremento real del valor
                del terreno, la transmisión NO está sujeta (art. 104.5 TRLRHL): se acredita con las escrituras de compra y venta.
              </p>
            </div>
          </div>
        </section>

        {/* Qué paga el vendedor */}
        <section>
          <h2>Si eres tú quien vende: lo que se lleva Hacienda</h2>
          <p>
            La compra y la venta de un local son dos operaciones fiscales distintas. El comprador
            soporta IVA o ITP; el vendedor responde de otros dos impuestos y, a diferencia de la
            vivienda habitual, sin ninguna de sus exenciones.
          </p>
          <ul>
            <li>
              <strong>Plusvalía municipal (IIVTNU).</strong> El local está sobre suelo urbano, así que
              la transmisión sí genera este impuesto. Puedes elegir entre el método objetivo (coeficientes
              sobre el valor catastral del suelo) y el real (ganancia efectiva del suelo): se aplica el
              que salga menor, y si vendes con pérdida no hay impuesto.
            </li>
            <li>
              <strong>IRPF de la ganancia patrimonial.</strong> Tributa en la base del ahorro con los
              tramos del {formatNumber(TIPO_AHORRO_MIN, 0)}% al {formatNumber(TIPO_AHORRO_MAX, 0)}% de 2025.{' '}
              <strong>No hay exención por reinversión ni por tener más
              de 65 años</strong>: esas dos ventajas son exclusivas de la vivienda habitual.
            </li>
            <li>
              <strong>Amortizaciones si el local estuvo afecto a una actividad.</strong> Si lo usaste en
              tu negocio o lo tuviste alquilado y deduciste amortización, el valor de adquisición se
              minora en la amortización deducida —o en la mínima, aunque no la dedujeras— según el
              artículo 40 del Reglamento del IRPF. La ganancia sube, y con ella el impuesto.
            </li>
            <li>
              <strong>Si el vendedor es una sociedad</strong>, la ganancia no va al IRPF sino al
              Impuesto sobre Sociedades, integrada en la base imponible del ejercicio.
            </li>
          </ul>
          <p>
            Un matiz frecuente: cuando la venta se hace con <strong>renuncia a la exención de IVA</strong>,
            el vendedor no repercute ni ingresa ese IVA. Lo autoliquida el comprador por inversión del
            sujeto pasivo, de modo que para el vendedor no supone ni coste ni cobro.
          </p>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">⚠️</span>
            <strong>Limitaciones de este simulador</strong>
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column' as const, gap: '0.4rem' }}>
            <li>La renuncia a la exención de IVA solo es válida entre empresarios o profesionales con derecho a deducción; no todos los compradores pueden acogerse.</li>
            <li>En la renuncia, algunas comunidades aplican un tipo de AJD incrementado; este simulador solo lo aplica donde está verificado (Comunitat Valenciana) y en el resto usa el AJD general, así que el coste real de AJD puede ser mayor.</li>
            <li>El IVA solo es deducible si el comprador es sujeto pasivo de IVA con actividad sujeta y no exenta.</li>
            <li>El valor de referencia catastral puede ser la base imponible real del ITP si supera el precio escriturado.</li>
            <li>En la pestaña de vendedor, el tipo municipal del IIVTNU se estima con un valor orientativo: cada ayuntamiento fija el suyo, así que confirma el de tu municipio.</li>
            <li>Si el local estuvo afecto a una actividad, la amortización que debe restarse es la deducida o la mínima, aunque no se hubiera deducido; el simulador usa la cifra que introduzcas.</li>
            <li>Los tipos de ITP y AJD pueden variar; verifica la normativa vigente de tu comunidad autónoma y consulta con tu asesor fiscal antes de cerrar la operación.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-local-comercial')} />
      <ShareCard appName="simulador-gastos-compraventa-local-comercial" />
      <Footer appName="simulador-gastos-compraventa-local-comercial" />
    </div>
  );
}
