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
  RANGO_AJD,
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
  const plusvaliaCalculable = e.valorSuelo > 0 && Number.isFinite(e.anios) && e.precioC > 0;
  const resultadoPlusvalia = plusvaliaCalculable
    ? calcularPlusvaliaMunicipal({
        valorCatastralSuelo: e.valorSuelo,
        aniosPropiedad: e.anios,
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
    /** Con signo: negativa si hay pérdida. 0 sin precio de compra. */
    ganancia: hayDatosGanancia ? g.ganancia : 0,
  };
}

/**
 * La ayuda del campo de los años, derivada de COEFICIENTES_IIVTNU_2025 (hallazgo 1266): el
 * tope de años y la comparación del coeficiente de la reventa antes del año los fija la Ley de
 * Presupuestos cada año, y escritos a mano quedaban falsos en silencio al cambiar la tabla.
 */
const COEF_MENOS_DE_UN_ANIO = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)?.coeficiente ?? 0;
const COEF_UN_ANIO = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 1)?.coeficiente ?? 0;
const ANIOS_TOPE_IIVTNU = Math.max(...COEFICIENTES_IIVTNU_2025.map((c) => c.anios));
const AYUDA_ANIOS_PROPIEDAD =
  `Años completos desde la compra (la plusvalía municipal cuenta como máximo ${ANIOS_TOPE_IIVTNU}). ` +
  `Escribe 0 si revendes antes de cumplir el año: esa reventa también tributa, con un coeficiente de ` +
  `${formatNumber(COEF_MENOS_DE_UN_ANIO, 2)}` +
  (COEF_MENOS_DE_UN_ANIO > COEF_UN_ANIO
    ? ` (mayor que el ${formatNumber(COEF_UN_ANIO, 2)} del primer año).`
    : COEF_MENOS_DE_UN_ANIO < COEF_UN_ANIO
      ? ` (menor que el ${formatNumber(COEF_UN_ANIO, 2)} del primer año).`
      : ' (el mismo que el del primer año).');

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

/** Enumera en español: «a», «a y b», «a, b y c». */
function enumerarEnEspanol(partes: string[]): string {
  if (partes.length <= 1) return partes[0] ?? '';
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

export default function SimuladorLocalComercialPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  // Datos del vendedor
  const [precioCompraOriginal, setPrecioCompraOriginal] = useState('');
  const [gastosAdquisicion, setGastosAdquisicion] = useState('');
  const [aniosPropiedad, setAniosPropiedad] = useState('');
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

  const esRenuncia = tipoTransmision === 'segunda-mano-renuncia';
  /** Las dos ramas en las que el impuesto es IVA y, por tanto, la base es la contraprestación */
  const conIvaEnPantalla =
    (tipoTransmision === 'primera-mano' || esRenuncia) && !TERRITORIOS_SIN_IVA[ccaa];

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (!Number.isFinite(precio) || precio <= 0) return null;

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
    const conIva = tipoTransmision === 'primera-mano' || tipoTransmision === 'segunda-mano-renuncia';

    if (conIva && territorioSinIva) {
      // Allí no se devenga IVA sino IGIC o IPSI: se nombra el impuesto que corresponde y no
      // se inventa cifra, como ya hacen nave-industrial, solar y terreno-rústico. La cuota
      // gradual de AJD sí se devenga, porque la operación va sujeta al impuesto indirecto
      // canario o ceutí y no exenta.
      tipoImpuesto = territorioSinIva.impuesto;
      impuestoNoCalculado = true;
      ajd = calcularAJD(precio, ccaa);
      ivaRecuperable = true;
    } else if (tipoTransmision === 'primera-mano') {
      // Obra nueva del promotor: IVA 21% + AJD
      tipoImpuesto = 'IVA';
      porcentaje = IVA_LOCAL_COMERCIAL;
      impuesto = precio * (porcentaje / 100);
      ajd = calcularAJD(precio, ccaa);
      ivaRecuperable = true;
    } else if (tipoTransmision === 'segunda-mano-renuncia') {
      // Segunda mano con renuncia a la exención de IVA (Art. 20.Dos LIVA)
      // → IVA 21% con inversión del sujeto pasivo + AJD (a menudo a tipo incrementado según CCAA)
      tipoImpuesto = 'IVA (renuncia · ISP)';
      porcentaje = IVA_LOCAL_COMERCIAL;
      impuesto = precio * (porcentaje / 100);
      ajd = calcularAJD(precio, ccaa);
      ivaRecuperable = true;
    } else {
      // Segunda mano sin renuncia → exenta de IVA → ITP tipo general de la CCAA
      const datosCcaa = ITP_CCAA[ccaa];
      const tipoAplicable = datosCcaa.tipoGeneral;
      // Sin tercer argumento: así se aplica la escala progresiva de las 7 CCAA
      // que la tienen, en vez del tipo plano del primer tramo.
      impuesto = calcularITP(precio, ccaa);
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
      totalGastos,
      totalOperacion: sumarLineasVisibles(precio, totalGastos),
      ivaRecuperable,
      bonificado,
    };
  }, [precioVenta, ccaa, tipoTransmision, gastosGestoria]);

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
    // año» de COEFICIENTES_IIVTNU_2025 (0,14, el tercero más alto de la tabla)— y lo que
    // impide calcular es el campo VACÍO. Con `parseInt(aniosPropiedad) || 0` los dos
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
    const valorSuelo = parseSpanishNumber(valorCatastralSuelo);
    const valorTotal = parseSpanishNumber(valorCatastralTotal);

    if (!Number.isFinite(precioV) || precioV <= 0) return null;

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
    const costeAdquisicion = precioC > 0 ? precioC + entrada.gastosAdquisicion : 0;
    const amortizacionesImposibles = precioC > 0 && entrada.amortizaciones > costeAdquisicion;
    const r = calcularVendedor(entrada);
    const irpfPublicable = r.hayDatosGanancia && !amortizacionesImposibles;
    const irpf = irpfPublicable ? r.irpf : 0;
    const totalGastos = irpfPublicable ? r.totalGastos : sumarLineasVisibles(r.plusvalia, r.comision, entrada.gestoria);

    // El aviso nombra SOLO lo que de verdad falta, y concuerda el verbo (hallazgo 666). Y
    // separa lo VACÍO de lo escrito que no se lee, que no «falta»: el usuario lo ve (1265).
    const ilegibleTexto = (t: string) => escritoIlegible(t, parseSpanishNumber);
    const faltanVacios = [
      valorSuelo > 0 || ilegibleTexto(valorCatastralSuelo) ? null : 'el valor catastral del suelo',
      aniosDisponibles || ilegibleTexto(aniosPropiedad) ? null : 'los años de propiedad',
      precioC > 0 || ilegibleTexto(precioCompraOriginal) ? null : 'el precio de compra original',
    ].filter((x): x is string => x !== null);
    const faltanIlegibles = [
      ilegibleTexto(valorCatastralSuelo) ? 'el valor catastral del suelo' : null,
      ilegibleTexto(aniosPropiedad) ? 'los años de propiedad' : null,
      ilegibleTexto(precioCompraOriginal) ? 'el precio de compra original' : null,
    ].filter((x): x is string => x !== null);
    const camposQueFaltan = [...faltanVacios, ...faltanIlegibles];
    const porQueNoSeCalcula = [
      faltanVacios.length > 0 ? faltaOFaltan(faltanVacios) : null,
      faltanIlegibles.length > 0 ? noSePudoLeer(faltanIlegibles) : null,
    ].filter((x): x is string => x !== null).join('; ');

    let metodoPlusvalia = `No calculada (${porQueNoSeCalcula})`;
    const rp = r.resultadoPlusvalia;
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
    const sondeadas = amortizacionesImposibles
      ? []
      : sondas.map((sd) => ({
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
      veredictoNeto: veredictoDe((x) => x.neto),
      veredictoIrpf: veredictoDe((x) => x.irpf),
      veredictoGanancia: veredictoDe((x) => x.ganancia),
    };
  }, [
    precioVenta, precioCompraOriginal, gastosAdquisicion, aniosPropiedad,
    valorCatastralSuelo, valorCatastralTotal,
    // gastosGestoriaVenta, NO gastosGestoria: la del comprador no entra en el IRPF del
    // vendedor (art. 35.1 LIRPF). El campo se separó el 20/08/2026 pero solo en el valor,
    // así que lo que el vendedor escribía no se recalculaba hasta tocar otro campo, y el
    // que lo despertaba era justo la gestoría del comprador (hallazgo 330, ALTO).
    comisionInmobiliaria, gastosGestoriaVenta, perfilVendedor, amortizacionesAcumuladas,
  ]);

  const datosCcaaActual = ITP_CCAA[ccaa];
  const territorioActualSinIva = TERRITORIOS_SIN_IVA[ccaa];

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
      return `Sin cerrar: ${noSePudoLeer([...v.menor, ...v.mayor])}, y mueven el neto en sentidos contrarios (${enumerar(v.menor)} lo ${v.menor.length > 1 ? 'bajarían' : 'bajaría'}; ${enumerar(v.mayor)} lo ${v.mayor.length > 1 ? 'subirían' : 'subiría'}): no se puede saber si el neto real es mayor o menor que este`;
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
          ...resultadosVendedor.camposVacios,
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

  /** Texto de una tarjeta intermedia (IRPF, ganancia) cuando un ilegible la mueve. */
  const avisoTarjeta = (v: Veredicto, que: string): string | null => {
    if (v.tipo === 'ninguno') return null;
    if (v.tipo === 'mixto') {
      return `Sin cerrar: ${noSePudoLeer([...v.menor, ...v.mayor])} y mueven ${que} en sentidos contrarios. Escríbelos con coma decimal (1.234,56).`;
    }
    return `${mayuscula(noSePudoLeer(v.campos))}, así que ${que} real ${v.seguro ? 'es' : 'puede ser'} ${v.tipo === 'menor' ? 'menor' : 'mayor'}. Escríbelo con coma decimal (1.234,56).`;
  };

  /** La pérdida es la ganancia con el signo cambiado: su dirección es la contraria (1259). */
  const avisoPerdida = (v: Veredicto): string | null => {
    if (v.tipo === 'ninguno') return null;
    if (v.tipo === 'mixto') {
      return `Sin cerrar: ${noSePudoLeer([...v.menor, ...v.mayor])} y mueven la pérdida en sentidos contrarios. Escríbelos con coma decimal (1.234,56).`;
    }
    const mayorPerdida = v.tipo === 'menor';
    return `${noSePudoLeer(v.campos)}: la pérdida real ${v.seguro ? 'es' : 'puede ser'} ${mayorPerdida ? 'mayor' : 'menor'} que esta${mayorPerdida ? '' : ' (o puede haber ganancia)'}. Escríbelo con coma decimal (1.234,56).`;
  };

  const netoParcial = faltanEnElNeto.length > 0 || avisoIlegiblesNeto !== null || (resultadosVendedor?.camposIlegibles.length ?? 0) > 0;

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
        nota={FISCAL_INMUEBLES_META.nota}
      />

      <DataReference
        normativa={`Plusvalía municipal (IIVTNU) e IRPF de la ganancia ${PLUSVALIA_MUNICIPAL_META.vigencia} · lo que paga quien vende`}
        fuente={PLUSVALIA_MUNICIPAL_META.baseNormativa}
        verificado={PLUSVALIA_MUNICIPAL_META.verificado}
        urlOficial={PLUSVALIA_MUNICIPAL_META.urlReferencia}
        nota={`${PLUSVALIA_MUNICIPAL_META.aviso} ${PLUSVALIA_MUNICIPAL_META.nota}`}
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
            {territorioActualSinIva.impuesto}, y la <strong>renuncia a la exención de IVA</strong> no
            existe allí. Consúltalo con tu asesor fiscal antes de decidir.
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
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
                aria-pressed={tipoTransmision === 'segunda-mano'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP (tipo general)</span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano-renuncia' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano-renuncia')}
                aria-pressed={tipoTransmision === 'segunda-mano-renuncia'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🤝</span>
                <span>2ª mano con renuncia IVA</span>
                {/* En Canarias, Ceuta y Melilla no rige el IVA (IGIC/IPSI): el rótulo no puede
                    prometer un IVA que el recuadro de abajo desmiente, y el tipo se lee de
                    data/fiscal en vez de teclearse (hallazgos 620 y 621). */}
                <span className={styles.transmisionSub}>
                  {territorioActualSinIva
                    ? `Paga ${territorioActualSinIva.impuesto} + AJD`
                    : `IVA ${formatNumber(IVA_LOCAL_COMERCIAL, 0)}% (ISP) + AJD`}
                </span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
                aria-pressed={tipoTransmision === 'primera-mano'}
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
                <>
                  <strong><span aria-hidden="true">⚠️</span> Aquí no hay IVA al que renunciar:</strong> en {datosCcaaActual.nombre} rige
                  el <strong>{territorioActualSinIva.impuesto}</strong>, no el IVA, así que ni la renuncia a la
                  exención del art. 20.Dos LIVA ni la inversión del sujeto pasivo entran en juego. Esta
                  calculadora no cifra ese impuesto: consulta sus tipos y su mecánica propia.
                </>
              ) : (
                <>
                  <strong><span aria-hidden="true">⚠️</span> Renuncia a la exención de IVA (Art. 20.Dos LIVA):</strong> solo es posible cuando
                  comprador y vendedor son empresarios o profesionales con derecho a deducción. El IVA se autoliquida
                  por <strong>inversión del sujeto pasivo</strong> (no se paga al vendedor) y es deducible si tienes
                  derecho. A cambio, la escritura tributa por AJD, que <strong>muchas CCAA aplican a un tipo
                  incrementado</strong> (a menudo 1,5%–2%) en caso de renuncia; este simulador usa el AJD general.
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

          <AvisoTerritorioSinIva ccaa={ccaa} aplica={tipoTransmision === 'primera-mano' || esRenuncia} />

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span className={styles.infoCcaaIcon} aria-hidden="true">📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                <span className={styles.infoCcaaValue}>{formatTipoNominal(datosCcaaActual.tipoGeneral)}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                <span className={styles.infoCcaaValue}>{formatTipoNominal(datosCcaaActual.ajd)}%</span>
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
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> Esta CCAA aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${formatTipoNominal(t.tipo)}%`).join(' → ')})
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
                        ? 'Algunas CCAA aplican un tipo de AJD incrementado en la renuncia'
                        : undefined
                  }
                />
              )}

              <ResultCard
                title="Gastos de notaría (IVA incluido)"
                value={formatCurrency(resultadosComprador.gastosNotario)}
                description={`Factura estimada entre ${formatCurrency(resultadosComprador.gastosNotarioMin)} y ${formatCurrency(resultadosComprador.gastosNotarioMax)}. El arancel cubre la matriz y una copia; las copias adicionales y los folios se facturan aparte y dependen de la extensión de la escritura.`}
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

              <ResultCard
                title={resultadosComprador.impuestoNoCalculado ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales'}
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
                  ]
                    .filter((x): x is string => x !== null)
                    .join(' — ')
                }
              />

              <ResultCard
                title={resultadosComprador.impuestoNoCalculado ? 'COSTE TOTAL (PARCIAL)' : 'COSTE TOTAL DE ADQUISICIÓN'}
                value={formatCurrency(resultadosComprador.totalOperacion)}
                variant="highlight"
                icon="💳"
                description={
                  resultadosComprador.impuestoNoCalculado || !resultadosComprador.gestoriaLegible
                    ? `No incluye ${[
                        resultadosComprador.impuestoNoCalculado ? `el ${resultadosComprador.tipoImpuesto}` : null,
                        resultadosComprador.gestoriaLegible ? null : 'la gestoría, que no se ha podido leer',
                      ]
                        .filter((x): x is string => x !== null)
                        .join(' ni ')}: el coste real será mayor`
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
                  // del año (coeficiente 0,14, el tercero más alto de la tabla), así que
                  // reescribir al mínimo un valor imposible lo convertía en un supuesto fiscal
                  // válido y caro —2.800 € de IIVTNU a partir del «−1» que la propia app
                  // acababa de rechazar— y el neto se presentaba como definitivo (hallazgo
                  // 1160; es el 822/844 que garaje y trastero repararon así el 15/09). Quien
                  // decide sobre un año negativo es la guarda `aniosNegativo` del useMemo.
                  acotarAlSalir={false}
                />

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
                        description={
                          resultadosVendedor.comisionLegible && resultadosVendedor.gestoriaLegible
                            ? 'Precio de venta − comisión, gestoría y plusvalía municipal'
                            : `Precio de venta − plusvalía municipal y los gastos que se leen: ${noSePudoLeer([
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
                      description="Vendes exactamente por el valor de adquisición: no hay IRPF que pagar ni pérdida que compensar"
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
                        title="Ganancia patrimonial"
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
                    title="IRPF sobre la ganancia"
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
                            (avisoTarjeta(resultadosVendedor.veredictoIrpf, 'la cuota') ??
                            `Base del ahorro (${formatNumber(TIPO_AHORRO_MIN, 0)}–${formatNumber(TIPO_AHORRO_MAX, 0)} %). Un local no tiene exención por reinversión ni por edad.`)
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
                        if (avisos.length === 0) return 'Precio de venta menos impuestos, comisión y gestoría';
                        const pedir = [
                          camposPendientes.length > 0 ? `Rellena ${enumerarEnEspanol(camposPendientes)}` : null,
                          hayIlegiblesQueCorregir ? 'escribe con coma decimal (1.234,56) lo que no se ha podido leer' : null,
                          resultadosVendedor.amortizacionesImposibles ? 'revisa las amortizaciones deducidas' : null,
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
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
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', color: '#27ae60' }}>Sí (si sujeto pasivo)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0' }}>Segunda mano (regla general)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', fontWeight: 700 }}>ITP (tipo general)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>No</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', color: '#c0392b' }}>No (ITP no se recupera)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px' }}>Segunda mano con renuncia a la exención</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>IVA {formatNumber(IVA_LOCAL_COMERCIAL, 0)}% (ISP)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí (a menudo incrementado)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#27ae60' }}>Sí (si sujeto pasivo)</td>
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
                La escritura tributa por AJD y muchas comunidades aplican un tipo incrementado (habitualmente
                entre el 1,5% y el 2%) cuando existe renuncia a la exención de IVA, frente al tipo general,
                que va del {formatNumber(RANGO_AJD.min, 0)}% al {formatNumber(RANGO_AJD.max, 1)}% según la comunidad: el País Vasco no lo cobra, por su
                régimen foral, y en Ceuta y Melilla se descuenta el 50% de la cuota. Este simulador aplica el
                AJD general de la CCAA; confirma el tipo incrementado exacto de tu comunidad antes de firmar.
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
            <li>En la renuncia, muchas CCAA aplican un tipo de AJD incrementado; este simulador usa el AJD general, así que el coste real de AJD puede ser mayor.</li>
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
