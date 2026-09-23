'use client';
// @disclaimer: NO — DisclaimerCard severity="critical" (fiscal España)

import { useState, useMemo } from 'react';
import styles from './SimuladorGarajeCompraventa.module.css';
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
import { formatCurrency, formatNumber, formatTipoNominal, parseSpanishNumber, parseSpanishNumberOr, registrarEventoInteraccion } from '@/lib';
import { veredictoIlegibles, enumerar, faltaOFaltan, noSePudoLeer, escritoIlegible, type Veredicto } from '@/lib/sondeoIlegibles';

/** Importe en euros SIN decimales, para los ejemplos del bloque educativo */
const eurosEnteros = (n: number) => `${formatNumber(n, 0)} €`;
import { IVA_INMUEBLES_2025, FISCAL_INMUEBLES_META, PLUSVALIA_MUNICIPAL_META, PLAZO_ITP, TRAMOS_GANANCIAS_PATRIMONIALES_2025, calcularGananciaInmueble } from '@/data/fiscal';
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
  // RANGO_ITP ya no se importa aquí: la única frase que lo usaba (la FAQ del ITP de segunda
  // mano) se compone ahora en `metadata.ts`, que sí lo lee, y la página la muestra tal cual.
  RANGO_AJD,
  TERRITORIOS_SIN_IVA,
  sumarLineasVisibles,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar, superaElTope } from '@/data/itp-ccaa';
import { ESCALA_RECARGO_EXTEMPORANEO } from '@/lib/calculadoras/recargoPresentacionTardia';
import {
  RESPUESTA_ITP_GARAJE_SEGUNDA_MANO,
  RESPUESTA_GARAJE_SIN_VIVIENDA,
  RESPUESTA_GARAJE_NUEVO_O_SEGUNDA_MANO,
  RESPUESTA_PLUSVALIA_GARAJE,
  RESPUESTA_TIPOS_REDUCIDOS_GARAJE,
} from './metadata';

/**
 * Los dos tipos de ITP que citan los ejemplos del bloque educativo, leídos de la ficha de su
 * comunidad en vez de tecleados (hallazgo 625 del Inspector, 07/09/2026: eran la única cifra
 * normativa de la página escrita a mano, y en 2026 se movieron Murcia —8 → 7,75 %— y Valencia
 * —10 → 9 %— sin que nadie avisara a los textos).
 *
 * `tipoGeneral` sale de `TIPOS_ITP_CCAA_2025` a través de `tipoGeneralDe()`; el reducido para
 * jóvenes se busca por nombre dentro de la ficha andaluza, con el más bajo que quede como
 * salvavidas si algún día cambiara de rótulo.
 *
 * ⚠️ Los IMPORTES en euros de esos mismos párrafos siguen siendo literales tomados de la app
 * con esa entrada exacta (los fija la regresión del 20/08/2026): si una comunidad mueve su
 * tipo, el porcentaje se actualiza solo, pero el importe de al lado hay que rehacerlo a mano.
 */
const ITP_GENERAL_MADRID = ITP_CCAA.madrid.tipoGeneral;
const ITP_GENERAL_ANDALUCIA = ITP_CCAA.andalucia.tipoGeneral;
const ITP_REDUCIDO_JOVENES_ANDALUCIA =
  ITP_CCAA.andalucia.tiposReducidos.find((r) => /j[óo]ven/i.test(r.nombre))?.tipo ??
  Math.min(...ITP_CCAA.andalucia.tiposReducidos.map((r) => r.tipo));

// ===== TIPOS =====
type TipoTransmision = 'segunda-mano' | 'primera-mano';
type TipoGaraje = 'vinculado' | 'independiente';
type PerfilComprador = 'general' | 'joven' | 'familia-numerosa' | 'discapacidad';

interface ResultadosComprador {
  precioGaraje: number;
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
   * La mitad del 1157 que no se propagó: el vendedor ya se abstiene y nombra, y aquí un
   * importe ilegible se leía como 0 y su tarjeta desaparecía por la guarda `> 0`.
   */
  gestoriaLegible: boolean;
  totalGastos: number;
  totalOperacion: number;
  /** null en primera mano (allí es IVA, no ITP) */
  tipoElegido: TipoElegido | null;
}

interface ResultadosVendedor {
  precioVenta: number;
  plusvaliaMunicipal: number;
  metodoPlusvalia: string;
  plusvaliaCalculada: boolean;
  /** Los campos concretos que faltan para poder calcular la plusvalía municipal */
  camposQueFaltan: string[];
  /** …separados en los que están VACÍOS y los escritos que no se leen (hallazgo 1254) */
  camposVacios: string[];
  camposIlegibles: string[];
  exentoPlusvalia: boolean;
  comisionInmobiliaria: number;
  gastosGestoria: number;
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
  /** false cuando el texto del campo no es un número: ese 0 tampoco es un cero (1157). */
  comisionLegible: boolean;
  gestoriaLegible: boolean;
  gastosAdquisicionLegible: boolean;
  /**
   * false cuando el valor catastral total no se puede leer y hay plusvalía que comparar.
   * Sin él la plusvalía se liquida por el método objetivo aunque el real sea más barato, y
   * el neto baja en silencio (hueco C1 del testigo de familia, visto en el estimador).
   */
  valorTotalLegible: boolean;
  /** Hacia dónde queda cada cifra real con los importes ilegibles, CALCULADO por sondeo */
  veredictoNeto: Veredicto;
  veredictoIrpf: Veredicto;
  veredictoGanancia: Veredicto;
}

// ===== CONSTANTES =====
/** Extremos de la escala del ahorro, derivados de data/fiscal (hallazgo 579) */
const TIPO_AHORRO_MIN = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
const TIPO_AHORRO_MAX = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo;

/**
 * El ejemplo de Ana, derivado del MISMO motor que ejecuta la app.
 *
 * Su contrafactual —«no los 1.330 € que saldrían de los 7.000 € brutos»— estaba calculado
 * a un 19 % PLANO, que es exactamente el error contra el que avisa la frase y contradice la
 * escala que ella misma enuncia dos palabras antes: con TRAMOS_GANANCIAS_PATRIMONIALES_2025
 * son 6.000 × 19 % + 1.000 × 21 % = 1.350,00 €, que es además lo que la tarjeta de al lado
 * de la calculadora marca para esos mismos datos (hallazgo 669 del Inspector).
 *
 * Derivarlo, y no solo corregir el número, evita que vuelva a desincronizarse cuando cambien
 * los tramos del ahorro.
 */
const EJEMPLO_ANA = { compra: 15000, venta: 22000, comisionPct: 3 };
const EJEMPLO_ANA_COMISION = EJEMPLO_ANA.venta * (EJEMPLO_ANA.comisionPct / 100);
const EJEMPLO_ANA_BRUTO = EJEMPLO_ANA.venta - EJEMPLO_ANA.compra;
/** Lo que de verdad tributa: el art. 35 LIRPF resta los gastos del valor de transmisión. */
const EJEMPLO_ANA_REAL = calcularGananciaInmueble({
  precioVenta: EJEMPLO_ANA.venta,
  precioCompra: EJEMPLO_ANA.compra,
  gastosTransmision: EJEMPLO_ANA_COMISION,
});
/** El error que el párrafo desmonta: tributar la diferencia bruta, sin restar gastos. */
const EJEMPLO_ANA_BRUTO_IRPF = calcularGananciaInmueble({
  precioVenta: EJEMPLO_ANA.venta,
  precioCompra: EJEMPLO_ANA.compra,
}).cuotaIRPF;

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

const PERFILES_COMPRADOR: { value: PerfilComprador; label: string }[] = [
  { value: 'general', label: 'General (sin bonificaciones)' },
  { value: 'joven', label: 'Joven (< 35 años)' },
  { value: 'familia-numerosa', label: 'Familia numerosa' },
  { value: 'discapacidad', label: 'Persona con discapacidad' },
];


// ===== CÁLCULO DEL VENDEDOR =====
/**
 * Los importes del vendedor ya leídos. Un importe ILEGIBLE entra como 0 (o `undefined` el
 * valor catastral total): es lo que publica la app, y el sondeo de abajo mide cuánto y hacia
 * dónde se movería cada cifra si ese importe tuviera el valor que el usuario quiso escribir.
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
}

/**
 * El cálculo del vendedor, puro, para poder ejecutarlo varias veces: una con lo que se lee y
 * otra por cada importe ilegible sondeado (hallazgos 1249-1253). La dirección de un aviso se
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

  // Ganancia patrimonial e IRPF (garaje: sin exención por vivienda habitual ni edad).
  // Motor único del art. 35 LIRPF: los impuestos y gastos de la compra suman al valor
  // de adquisición y la plusvalía municipal resta del valor de transmisión.
  const g = calcularGananciaInmueble({
    precioVenta: e.precioV,
    precioCompra: e.precioC > 0 ? e.precioC : 0,
    gastosAdquisicion: e.gastosAdquisicion,
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

// ===== COMPONENTE PRINCIPAL =====
export default function SimuladorGarajeCompraventaPage() {
  // Estado del formulario — comprador
  const [precioGaraje, setPrecioGaraje] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [tipoGaraje, setTipoGaraje] = useState<TipoGaraje>('vinculado');
  const [perfilComprador, setPerfilComprador] = useState<PerfilComprador>('general');
  const [gastosGestoria, setGastosGestoria] = useState('300');

  // Estado del formulario — vendedor
  const [precioCompraOriginal, setPrecioCompraOriginal] = useState('');
  const [gastosAdquisicion, setGastosAdquisicion] = useState('');
  const [aniosPropiedad, setAniosPropiedad] = useState('');
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState('');
  const [valorCatastralTotal, setValorCatastralTotal] = useState('');
  const [comisionInmobiliaria, setComisionInmobiliaria] = useState('3');
  // Gestoría del VENDEDOR, separada de la del comprador: el art. 35.1 LIRPF solo admite
  // los gastos «satisfechos por el transmitente», y un único campo compartido hacía que
  // los 300 € del comprador rebajaran el IRPF de la otra parte (Inspector 20/08/2026).
  const [gastosGestoriaVenta, setGastosGestoriaVenta] = useState('');

  // Pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState<'comprador' | 'vendedor'>('comprador');

  // ===== CÁLCULOS COMPRADOR =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioGaraje);
    if (!Number.isFinite(precio) || precio <= 0) return null;

    // Se acota aquí y no solo en el blur del NumberInput: mientras el campo tiene el foco,
    // un importe negativo se sumaba al total y su tarjeta ni se pintaba (guard > 0), así que
    // el total en pantalla no cuadraba con las líneas visibles.
    const gestoria = Math.max(0, parseSpanishNumberOr(gastosGestoria));
    /**
     * Y un importe ILEGIBLE tampoco es un cero (hallazgo 1199): `parseSpanishNumberOr`
     * devuelve 0 cuando el parser RECHAZA el texto, la tarjeta de gestoría se pinta con
     * guarda `> 0` y por tanto desaparecía, dejando el presupuesto por DEBAJO del real —la
     * dirección que el contrato de `elegirTipoITP` llama el error caro— sin una sola línea
     * que lo explicara. La pestaña del vendedor ya sabía abstenerse y nombrarlo desde el
     * 1157; esta se quedó fuera de aquella propagación.
     */
    const gestoriaLegible =
      gastosGestoria.trim() === '' || Number.isFinite(parseSpanishNumber(gastosGestoria));

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    let impuestoNoCalculado = false;
    /** Qué tipo de ITP se ha aplicado y cuáles NO se han podido comprobar */
    let elegido: TipoElegido | null = null;

    const territorioSinIva = TERRITORIOS_SIN_IVA[ccaa];

    if (tipoTransmision === 'primera-mano') {
      if (territorioSinIva) {
        // Allí no se devenga IVA sino IGIC o IPSI: se nombra el impuesto que corresponde
        // y no se inventa cifra, como ya hacen nave-industrial, solar y terreno-rústico.
        tipoImpuesto = territorioSinIva.impuesto;
        impuestoNoCalculado = true;
      } else {
        // Garaje nuevo: IVA reducido (10%) si va vinculado a la vivienda (máx. 2 plazas);
        // IVA general (21%) si es independiente o está en un edificio no residencial
        tipoImpuesto = 'IVA';
        porcentaje = tipoGaraje === 'vinculado' ? IVA_INMUEBLES_2025.anejoVinculado : IVA_INMUEBLES_2025.garaje;
        impuesto = precio * (porcentaje / 100);
      }
    } else {
      // Garaje segunda mano: ITP.
      // `viviendaHabitual: false` porque un garaje suelto NO lo es nunca, y esa condición
      // aparece en 53 de los tipos reducidos. Antes se aplicaba el primer reducido que
      // casara por nombre sin mirar sus condiciones, y en Madrid eso daba ITP del 0 %.
      elegido = elegirTipoITP(ccaa, perfilComprador, precio, { viviendaHabitual: false });
      impuesto = importeITP(precio, ccaa, elegido);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva el importe no es un porcentaje plano del
      // precio, asi que mostrar el tipo nominal contradiria a la cifra de al lado.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
    }

    // AJD solo aplica en primera mano (junto con IVA)
    const ajd = tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa) : 0;
    const notaria = estimarFacturaNotarial(precio);
    const notario = notaria.medio;
    const registro = calcularRegistro(precio);
    // Se suman las líneas YA redondeadas al céntimo, que es como las ve el usuario: el
    // total redondeaba la suma exacta y no cuadraba con el desglose de encima por un
    // céntimo, en ambos sentidos (hallazgo 594).
    const totalGastos = sumarLineasVisibles(impuesto, ajd, notario, registro, gestoria);

    return {
      precioGaraje: precio,
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
      tipoElegido: elegido,
    };
  }, [precioGaraje, ccaa, tipoTransmision, tipoGaraje, perfilComprador, gastosGestoria]);

  // ===== CÁLCULOS VENDEDOR =====
  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioGaraje);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    // Los años se leen del STRING, no del número: «0» es un dato VÁLIDO —el garaje
    // revendido antes de cumplir el año, que tributa con el coeficiente de «Menos de 1
    // año» de COEFICIENTES_IIVTNU_2025 (0,14, el tercero más alto de la tabla)— y lo que
    // impide calcular es el campo VACÍO. Con `parseInt(aniosPropiedad) || 0` los dos
    // valían 0: el 0 explícito desactivaba la plusvalía y, en cuanto el blur del
    // NumberInput reescribía el campo a «1» por su min={1}, se liquidaba con el
    // coeficiente del año 1 (0,13), es decir DE MENOS (hallazgo 668 del Inspector;
    // mismo patrón ya reparado en local-comercial y trastero).
    // Un año NEGATIVO no se acota a 0: se rechaza, como venía haciéndose. Acotarlo lo
    // convertiría en una reventa antes del año y liquidaría un impuesto a partir de un dato
    // imposible, que es justo lo que el CASO C de esta app exige que no pase.
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
     * Un valor ILEGIBLE no es un cero: es un dato que falta, y esta app ya sabe abstenerse y
     * nombrarlo. `parseSpanishNumberOr` devuelve su 0 por defecto cuando el parser RECHAZA el
     * texto, así que el NaN de «2.000.50» —el millar y el decimal a la estadounidense, un
     * copiar y pegar corriente— y un campo vacío eran la misma cosa para el motor (hallazgos
     * 773 y 1157, vistos en trastero).
     */
    const esLegible = (texto: string) =>
      texto.trim() === '' || Number.isFinite(parseSpanishNumber(texto));
    const comisionLegible = esLegible(comisionInmobiliaria);
    const gestoriaLegible = esLegible(gastosGestoriaVenta);
    const gastosAdquisicionLegible = esLegible(gastosAdquisicion);
    const valorTotalLegible = esLegible(valorCatastralTotal);

    // Se acota aquí y no solo en el blur del NumberInput: mientras el campo tiene el foco,
    // un importe negativo se restaba de totalGastos y su tarjeta ni se pintaba (hallazgo 474).
    const entrada: EntradaVendedor = {
      precioV,
      precioC,
      anios: aniosDisponibles ? anios : NaN,
      valorSuelo,
      valorTotal: valorTotal > 0 ? valorTotal : undefined,
      comisionPct: Math.max(0, parseSpanishNumberOr(comisionInmobiliaria)) / 100,
      gestoria: Math.max(0, parseSpanishNumberOr(gastosGestoriaVenta)),
      gastosAdquisicion: Math.max(0, parseSpanishNumberOr(gastosAdquisicion)),
    };
    const r = calcularVendedor(entrada);

    // El aviso nombra lo que de verdad falta. Antes decía siempre «falta valor catastral
    // del suelo», así que quien no había puesto el precio de compra o los años releía un
    // campo que ya tenía relleno (Inspector, hallazgo 437). Y separa lo que está VACÍO de lo
    // que está escrito pero no se lee, que no «falta»: el usuario lo ve (hallazgo 1254).
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
    const faltan = [...faltanVacios, ...faltanIlegibles];
    const porQueNoSeCalcula = [
      faltanVacios.length > 0 ? faltaOFaltan(faltanVacios) : null,
      faltanIlegibles.length > 0 ? noSePudoLeer(faltanIlegibles) : null,
    ].filter((x): x is string => x !== null).join('; ');

    let metodoPlusvalia = `No calculada (${porQueNoSeCalcula})`;
    const rp = r.resultadoPlusvalia;
    const exentoPlusvalia = rp ? rp.exento : false;
    if (rp) {
      metodoPlusvalia = rp.exento
        ? 'No sujeta (sin incremento de valor)'
        : rp.parCatastralImposible
          ? 'Método objetivo (el valor catastral del suelo no puede superar al total, que ya lo incluye: revisa los dos campos del recibo del IBI)'
          : !rp.metodoRealDisponible
            ? // «falta el valor catastral total» era falso cuando el usuario lo había
              // escrito y lo seguía viendo en el campo (hueco C1): no falta, no se lee.
              valorTotalLegible
              ? 'Método objetivo (falta el valor catastral total para comparar)'
              : 'Método objetivo, y puede salir más barata: el valor catastral total no se ha podido leer, así que no se compara con el método real. Escríbelo con coma decimal (1.234,56).'
            : rp.metodoReal < rp.metodoObjetivo
              ? 'Método real (más favorable)'
              : 'Método objetivo (más favorable)';
    }

    /**
     * El SONDEO de los importes ilegibles: se repite el cálculo con cada uno a un valor
     * pequeño y a uno grande, y `veredictoIlegibles` dice hacia dónde queda cada cifra real.
     * Antes la dirección se escribía a mano y fallaba justo donde nadie la había pensado: con
     * pérdida, sin IRPF que rebajar, prometía un neto MAYOR idéntico al publicado (1249); con
     * dos ilegibles opuestos concluía MAYOR cuando el real era menor (1250); y la tarjeta del
     * IRPF se publicaba como definitiva (1251).
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
    if (!valorTotalLegible && valorSuelo > 0) {
      // El total va del propio suelo (todo es suelo) a un múltiplo enorme (casi nada lo es).
      sondas.push({
        nombre: 'el valor catastral total',
        pequeno: { ...entrada, valorTotal: valorSuelo },
        grande: { ...entrada, valorTotal: valorSuelo * 1000 },
      });
    }
    const sondeadas = sondas.map((s) => ({
      nombre: s.nombre,
      pequeno: calcularVendedor(s.pequeno),
      grande: calcularVendedor(s.grande),
    }));
    const veredictoDe = (cifra: (x: ReturnType<typeof calcularVendedor>) => number): Veredicto =>
      veredictoIlegibles(
        cifra(r),
        sondeadas.map((s) => ({ nombre: s.nombre, pequeno: cifra(s.pequeno), grande: cifra(s.grande) })),
      );

    return {
      precioVenta: precioV,
      plusvaliaMunicipal: r.plusvalia,
      metodoPlusvalia,
      plusvaliaCalculada: rp !== null,
      /**
       * Los campos que de verdad faltan, para que el pie del neto no los vuelva a deducir
       * con un ternario de dos ramas que ignoraba la tercera causa: con los AÑOS DE
       * PROPIEDAD en blanco mandaba a rellenar el valor del suelo, ya relleno (hallazgo 576).
       */
      camposQueFaltan: faltan,
      camposVacios: faltanVacios,
      camposIlegibles: faltanIlegibles,
      exentoPlusvalia,
      comisionInmobiliaria: r.comision,
      gastosGestoria: entrada.gestoria,
      totalGastos: r.totalGastos,
      netoVendedor: r.neto,
      valorAdquisicion: r.hayDatosGanancia ? r.g.valorAdquisicion : 0,
      valorTransmision: r.g.valorTransmision,
      gananciaPatrimonial: r.ganancia,
      esPerdida: r.hayDatosGanancia && r.g.esPerdida,
      sinGananciaNiPerdida: r.hayDatosGanancia && r.g.sinGananciaNiPerdida,
      baseImponibleIRPF: r.hayDatosGanancia ? r.g.baseImponible : 0,
      irpfGanancia: r.irpf,
      irpfCalculado: r.hayDatosGanancia,
      comisionLegible,
      gestoriaLegible,
      gastosAdquisicionLegible,
      // Sin plusvalía liquidada (faltan datos o no hay incremento) no hay método que comparar.
      valorTotalLegible: rp === null || exentoPlusvalia || valorTotalLegible,
      veredictoNeto: veredictoDe((x) => x.neto),
      veredictoIrpf: veredictoDe((x) => x.irpf),
      veredictoGanancia: veredictoDe((x) => x.ganancia),
    };
  }, [precioGaraje, precioCompraOriginal, aniosPropiedad, valorCatastralSuelo, valorCatastralTotal, comisionInmobiliaria, gastosGestoriaVenta, gastosAdquisicion]);

  const datosCcaaActual = ITP_CCAA[ccaa];

  /**
   * Lo que el neto NO incluye por falta de datos, para que «IMPORTE NETO VENDEDOR» no se
   * presente como definitivo cuando en realidad hay una partida sin calcular (efecto familia
   * del hallazgo 483, ya reparado en estimador-compraventa-inmueble).
   */
  const faltanEnElNeto = resultadosVendedor
    ? [
        resultadosVendedor.plusvaliaCalculada ? null : 'la plusvalía municipal',
        resultadosVendedor.irpfCalculado ? null : 'el IRPF de la ganancia',
      ].filter((x): x is string => x !== null)
    : [];

  /**
   * C3 · la MAGNITUD de «falta descontar» (testigo de familia, propagado desde el estimador,
   * 0f70fdf8). La comisión y la gestoría de la venta son gastos de transmisión (art. 35.1
   * LIRPF): descontarlas baja también la ganancia y con ella el IRPF, así que el hueco real
   * es menor que su importe. Esa rebaja no puede superar el tipo MARGINAL del ahorro en la
   * base de ahora (la escala es progresiva y la base solo puede bajar), y ese tipo es una
   * cota que se puede publicar sin inventar nada (hallazgo 1252).
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
      return `${noSePudoLeer([...v.menor, ...v.mayor])}, y mueven el neto en sentidos contrarios (${enumerar(v.menor)} lo ${v.menor.length > 1 ? 'bajarían' : 'bajaría'}; ${enumerar(v.mayor)} lo ${v.mayor.length > 1 ? 'subirían' : 'subiría'}), así que no se puede saber si el neto real es mayor o menor que este`;
    }
    if (v.tipo === 'menor') {
      const deducibles = v.campos.filter((c) => c === 'la comisión inmobiliaria' || c === 'la gestoría de la venta');
      const matiz =
        deducibles.length === 0 || tipoMarginalAhorro === null
          ? ''
          : ` (${enumerar(deducibles)} ${deducibles.length > 1 ? 'rebajan' : 'rebaja'} también el IRPF al descontar${deducibles.length > 1 ? 'las' : 'la'}, hasta un ${formatNumber(tipoMarginalAhorro, 0)} % de su importe)`;
      return v.seguro
        ? `falta descontar ${enumerar(v.campos)}, que no se ${v.campos.length > 1 ? 'han' : 'ha'} podido leer${matiz}`
        : `${noSePudoLeer(v.campos)}: el neto real puede ser menor que este`;
    }
    const explica = v.campos.map((c) =>
      c === 'los impuestos y gastos de aquella compra'
        ? 'los impuestos y gastos de aquella compra (suman al valor de adquisición y REDUCEN el IRPF)'
        : c === 'el valor catastral total'
          ? 'el valor catastral total (con él la plusvalía puede salir más barata por el método real)'
          : c,
    );
    return `${noSePudoLeer(explica)}: el neto real ${v.seguro ? 'es' : 'puede ser'} MAYOR que este`;
  })();

  /**
   * Los campos concretos que hay que rellenar o corregir. Sale del motor (`camposQueFaltan`),
   * que ya los conoce uno a uno (hallazgo 576), y de los ilegibles que mueven alguna cifra.
   */
  const camposPendientes = resultadosVendedor
    ? Array.from(new Set([
        ...resultadosVendedor.camposVacios,
        ...(resultadosVendedor.irpfCalculado || resultadosVendedor.camposIlegibles.includes('el precio de compra original')
          ? []
          : ['el precio de compra original']),
      ]))
    : [];
  const hayIlegiblesQueCorregir =
    (resultadosVendedor?.camposIlegibles.length ?? 0) > 0 ||
    (resultadosVendedor !== null && resultadosVendedor.veredictoNeto.tipo !== 'ninguno');

  /** Texto de una tarjeta intermedia (IRPF, ganancia) cuando un ilegible la mueve. */
  const avisoTarjeta = (v: Veredicto, que: string): string | null => {
    if (v.tipo === 'ninguno') return null;
    if (v.tipo === 'mixto') {
      return `Sin cerrar: ${noSePudoLeer([...v.menor, ...v.mayor])} y mueven ${que} en sentidos contrarios. Escríbelos con coma decimal (1.234,56).`;
    }
    return v.tipo === 'menor'
      ? `TECHO: ${noSePudoLeer(v.campos)}, así que ${que} real ${v.seguro ? 'es' : 'puede ser'} menor. Escríbelo con coma decimal (1.234,56).`
      : `SUELO: ${noSePudoLeer(v.campos)}, así que ${que} real ${v.seguro ? 'es' : 'puede ser'} mayor. Escríbelo con coma decimal (1.234,56).`;
  };

  /** La pérdida es la ganancia con el signo cambiado: su dirección es la contraria. */
  const avisoPerdida = (v: Veredicto): string | null => {
    if (v.tipo === 'ninguno') return null;
    if (v.tipo === 'mixto') {
      return `Sin cerrar: ${noSePudoLeer([...v.menor, ...v.mayor])} y mueven la pérdida en sentidos contrarios. Escríbelos con coma decimal (1.234,56).`;
    }
    const mayorPerdida = v.tipo === 'menor';
    return `${noSePudoLeer(v.campos)}: la pérdida real ${v.seguro ? 'es' : 'puede ser'} ${mayorPerdida ? 'mayor' : 'menor'} que esta${mayorPerdida ? '' : ' (o puede haber ganancia)'}. Escríbelo con coma decimal (1.234,56).`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span aria-hidden="true" className={styles.heroIcon}>🚗</span>
        <h1 className={styles.title}>Simulador de Gastos de Compraventa de Garaje</h1>
        <p className={styles.subtitle}>
          Calcula el ITP, notaría, registro y plusvalía al comprar o vender una plaza de parking en España
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal - CRÍTICO (app fiscal España) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-garaje"
        collapsible={false}
      />
      <DataReference
        normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={FISCAL_INMUEBLES_META.nota}
      />
      {/* La pestaña Vendedor emite dos cifras normativas más, con vigencia y fecha de
          verificación propias: presentarlas bajo el sello de ITP/AJD/IVA daba por revisado
          en 2026 un coeficiente de 2025 que se actualiza cada Ley de Presupuestos. */}
      <DataReference
        normativa={`Plusvalía municipal (IIVTNU) ${PLUSVALIA_MUNICIPAL_META.vigencia}`}
        fuente={PLUSVALIA_MUNICIPAL_META.baseNormativa}
        verificado={PLUSVALIA_MUNICIPAL_META.verificado}
        urlOficial={PLUSVALIA_MUNICIPAL_META.urlReferencia}
        nota={`${PLUSVALIA_MUNICIPAL_META.nota} ${PLUSVALIA_MUNICIPAL_META.aviso} El IRPF de la ganancia usa los tramos del ahorro de 2025 (${TIPO_AHORRO_MIN} % a ${TIPO_AHORRO_MAX} %).`}
      />

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        {/* Panel izquierdo: datos */}
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos del garaje</h2>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            <span className={styles.label} id="rotulo-transmision">Tipo de transmisión</span>
            <div className={styles.transmisionGrid} role="group" aria-labelledby="rotulo-transmision">
              <button
                type="button"                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
                aria-pressed={tipoTransmision === 'segunda-mano'}
              >
                <span aria-hidden="true" className={styles.transmisionIcon}>🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP</span>
              </button>
              <button
                type="button"                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
                aria-pressed={tipoTransmision === 'primera-mano'}
              >
                <span aria-hidden="true" className={styles.transmisionIcon}>🆕</span>
                <span>Primera mano (obra nueva)</span>
                <span className={styles.transmisionSub}>Paga IVA</span>
              </button>
            </div>
          </div>

          {/* Tipo de garaje (solo primera mano: determina el tipo de IVA). Se oculta en
              Canarias, Ceuta y Melilla: allí no rige el IVA (IGIC/IPSI) y la elección
              vinculado/independiente no cambia el resultado en nada (hallazgo 475). */}
          {tipoTransmision === 'primera-mano' && !TERRITORIOS_SIN_IVA[ccaa] && (
            <div className={styles.inputGroup}>
              <span className={styles.label} id="rotulo-tipo-garaje">Tipo de garaje</span>
              <div className={styles.transmisionGrid} role="group" aria-labelledby="rotulo-tipo-garaje">
                <button
                  type="button"                  className={`${styles.transmisionBtn} ${tipoGaraje === 'vinculado' ? styles.active : ''}`}
                  onClick={() => setTipoGaraje('vinculado')}
                  aria-pressed={tipoGaraje === 'vinculado'}
                >
                  <span aria-hidden="true" className={styles.transmisionIcon}>🏠</span>
                  <span>Vinculado a vivienda</span>
                  <span className={styles.transmisionSub}>IVA {IVA_INMUEBLES_2025.anejoVinculado}%</span>
                </button>
                <button
                  type="button"                  className={`${styles.transmisionBtn} ${tipoGaraje === 'independiente' ? styles.active : ''}`}
                  onClick={() => setTipoGaraje('independiente')}
                  aria-pressed={tipoGaraje === 'independiente'}
                >
                  <span aria-hidden="true" className={styles.transmisionIcon}>🅿️</span>
                  <span>Independiente</span>
                  <span className={styles.transmisionSub}>IVA {IVA_INMUEBLES_2025.garaje}%</span>
                </button>
              </div>
              <p className={styles.infoCcaaNote}>
                Un garaje vinculado a la vivienda (máx. 2 plazas, mismo edificio y promotor) tributa al {IVA_INMUEBLES_2025.anejoVinculado}% de IVA. Un garaje independiente, comprado por separado o en un edificio de uso no residencial, tributa al {IVA_INMUEBLES_2025.garaje}%.
              </p>
            </div>
          )}

          {/* Precio del garaje */}
          <NumberInput
            value={precioGaraje}
            onChange={setPrecioGaraje}
            label="Precio del garaje / plaza de parking"
            placeholder="25000"
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
            <label className={styles.label} htmlFor="select-ccaa">
              Comunidad Autónoma (ubicación del garaje)
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

          <AvisoTerritorioSinIva ccaa={ccaa} aplica={tipoTransmision === 'primera-mano'} />

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span aria-hidden="true" className={styles.infoCcaaIcon}>📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                <span className={styles.infoCcaaValue}>{formatNumber(datosCcaaActual.tipoGeneral, 2)}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                {/* formatTipoNominal, igual que el ITP General de al lado. El hallazgo 685
                    lo levantó en nave-industrial y nombra a garaje como la otra app del
                    clúster que seguía forzando dos decimales a un tipo nominal. */}
                <span className={styles.infoCcaaValue}>{formatTipoNominal(datosCcaaActual.ajd)}%</span>
              </div>
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                Esta comunidad aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${formatTipoNominal(t.tipo)}%`).join(' → ')})
              </p>
            )}
            <p className={styles.infoCcaaNote}>{datosCcaaActual.notas}</p>
          </div>

          {/* Perfil del comprador (solo ITP segunda mano) */}
          {tipoTransmision === 'segunda-mano' && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="select-perfil">
                Perfil del comprador (tipos reducidos de ITP)
              </label>
              <select
                id="select-perfil"
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
                  {/*
                    «Tipos reducidos» contradecía a la nota de la ficha de Aragón dos líneas más
                    abajo —allí son bonificaciones sobre la CUOTA, no tipos reducidos— y quien
                    llamara a su oficina liquidadora pediría algo que no existe con ese nombre
                    (hallazgo 711). El rótulo nombra ahora lo que la lista contiene de verdad.
                  */}
                  <h3>Beneficios fiscales en {datosCcaaActual.nombre} (solo si se cumplen TODAS sus condiciones):</h3>
                  <ul>
                    {datosCcaaActual.tiposReducidos.map((tr, idx) => (
                      <li key={idx}>
                        <strong>{formatNumber(tr.tipo, 2)}%</strong> — {tr.nombre}
                        {tr.valorMaximo && (
                          <span className={styles.limite}> (máx. {formatCurrency(tr.valorMaximo)})</span>
                        )}
                        <span className={styles.limite}> · {tr.condiciones.join(', ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Gestoría comprador */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría del comprador (€)"
              placeholder="300"
              helperText="Típico: 200-400 € (tramitación de escrituras)"
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
              Consultar valor de referencia catastral en la Sede del Catastro
            </a>
          </div>
        </div>

        {/* Panel derecho: resultados */}
        <div className={styles.resultados}>
          {/* Pestañas */}
          {/* Solo se monta el panel de la pestaña activa, así que solo ella puede nombrarlo en
              aria-controls: la inactiva apuntaba a un id inexistente (hallazgo 1256). Las
              flechas cambian de pestaña, como pide el patrón de pestañas de la WAI-ARIA. */}
          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Resultados para"
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
              e.preventDefault();
              const siguiente =
                e.key === 'Home' ? 'comprador' : e.key === 'End' ? 'vendedor' : pestanaActiva === 'comprador' ? 'vendedor' : 'comprador';
              setPestanaActiva(siguiente);
              document.getElementById(`tab-${siguiente}`)?.focus();
            }}
          >
            <button
              type="button"
              role="tab"
              id="tab-comprador"
              aria-controls={pestanaActiva === 'comprador' ? 'panel-comprador' : undefined}
              aria-selected={pestanaActiva === 'comprador'}
              tabIndex={pestanaActiva === 'comprador' ? 0 : -1}
              className={`${styles.tab} ${pestanaActiva === 'comprador' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('comprador')}
            >
              Comprador
            </button>
            <button
              type="button"
              role="tab"
              id="tab-vendedor"
              aria-controls={pestanaActiva === 'vendedor' ? 'panel-vendedor' : undefined}
              aria-selected={pestanaActiva === 'vendedor'}
              tabIndex={pestanaActiva === 'vendedor' ? 0 : -1}
              className={`${styles.tab} ${pestanaActiva === 'vendedor' ? styles.active : ''}`}
              onClick={() => {
                setPestanaActiva('vendedor');
                // Medición abierta el 17/09/2026 para decidir si la pestaña Vendedor se replica
                // en solar y terreno rústico, que hoy solo sirven al comprador. Se emite una vez
                // por carga; el denominador es el uso normal de esta app. Ver lib/trackingEvento.ts.
                registrarEventoInteraccion('pestana-vendedor', 'simulador-gastos-compraventa-garaje');
              }}
            >
              Vendedor
            </button>
          </div>

          {/* Resultados Comprador */}
          {pestanaActiva === 'comprador' && (
            <div role="tabpanel" id="panel-comprador" aria-labelledby="tab-comprador">
              {resultadosComprador ? (
                <div className={styles.resultsInner}>
                  <ResultCard
                    title="Precio del garaje"
                    value={formatCurrency(resultadosComprador.precioGaraje)}
                    variant="default"
                    icon="🚗"
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
                        ? `En ${datosCcaaActual.nombre} no rige el IVA: la compra de obra nueva tributa por el ${resultadosComprador.tipoImpuesto}, que este simulador no calcula`
                        : undefined
                    }
                  />
                  {resultadosComprador.ajd > 0 && (
                    <ResultCard
                      // Tipo EFECTIVO, no el nominal de la tabla: en Ceuta y Melilla la cuota
                      // gradual se bonifica al 50 % (art. 57 bis TRLITPAJD) y el nominal
                      // desmentía el importe de al lado (hallazgo 473, efecto familia del 431).
                      title={`AJD (${formatNumber((resultadosComprador.ajd / resultadosComprador.precioGaraje) * 100, 2)}%)`}
                      value={formatCurrency(resultadosComprador.ajd)}
                      variant="warning"
                      icon="📄"
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
                    Con la guarda `> 0` a secas, un importe que el parser no puede leer valía 0
                    y la línea DESAPARECÍA del desglose: no quedaba ni un «0,00 €» que delatara
                    la pérdida (hallazgo 1199). Ahora la tarjeta se pinta igual y dice que el
                    dato está escrito pero no se ha podido leer, que es lo que la pestaña del
                    vendedor ya hacía con sus tres importes.
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
                  {/*
                    Las dos cifras de cierre se rotulaban «% sobre el precio» y «Precio + todos
                    los gastos» aunque faltara la gestoría por ilegible (1199). Son la misma
                    abstención que ya aplica `impuestoNoCalculado`, en la misma dirección
                    —presupuestar de menos—, así que se dicen igual: nombrando lo que falta.
                  */}
                  <ResultCard
                    title={resultadosComprador.impuestoNoCalculado ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales'}
                    value={formatCurrency(resultadosComprador.totalGastos)}
                    variant="info"
                    icon="➕"
                    description={
                      [
                        `${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioGaraje) * 100, 2)}% sobre el precio`,
                        resultadosComprador.impuestoNoCalculado
                          ? `SIN el ${resultadosComprador.tipoImpuesto}, que no está incluido`
                          : null,
                        resultadosComprador.gestoriaLegible
                          ? null
                          : 'SIN la gestoría, que no se ha podido leer',
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
                      (() => {
                        const sinCalcular = [
                          resultadosComprador.impuestoNoCalculado ? `el ${resultadosComprador.tipoImpuesto}` : null,
                          resultadosComprador.gestoriaLegible ? null : 'la gestoría, que no se ha podido leer',
                        ].filter((x): x is string => x !== null);
                        return sinCalcular.length === 0
                          ? 'Precio + todos los gastos'
                          : `No incluye ${sinCalcular.join(' ni ')}: el coste real será mayor`;
                      })()
                    }
                  />
                  {/*
                    Tipos reducidos que encajan con el perfil pero exigen requisitos que
                    esta herramienta no pregunta. NO se aplican al cálculo —presupuestar
                    de menos es el error caro— pero se enseñan, porque el comprador puede
                    cumplirlos y tiene derecho a saber que existen.
                  */}
                  {resultadosComprador.tipoElegido && resultadosComprador.tipoElegido.noComprobables.length > 0 && (
                    <div className={styles.avisoReducidos} role="note">
                      <p className={styles.avisoReducidosTitulo}>
                        <span aria-hidden="true">💡</span> Podrías pagar menos, pero depende de requisitos que no preguntamos
                      </p>
                      {/*
                        En una comunidad con escala progresiva, decir «el cálculo usa el tipo general
                        (8,00%)» invitaba a multiplicar el precio por ese porcentaje y salir por debajo
                        de lo que la tarjeta de al lado acaba de cobrar: 40.000 € frente a 40.750 € en
                        Aragón con 500.000 € (hallazgo 710). El importe era correcto; lo que fallaba
                        era la frase que lo explica. Se nombra el tipo EFECTIVO, que es el que sale de
                        dividir la cuota por el precio, igual que hace la tarjeta del ITP.
                      */}
                      <p className={styles.avisoReducidosTexto}>
                        El cálculo usa el tipo que te corresponde sin requisitos especiales
                        ({formatNumber(resultadosComprador.porcentajeImpuesto, 2)}% efectivo sobre el precio)
                        porque no podemos comprobar tu situación. En {datosCcaaActual.nombre} existe:
                      </p>
                      <ul className={styles.avisoReducidosLista}>
                        {resultadosComprador.tipoElegido.noComprobables.map(r => (
                          <li key={r.nombre}>
                            <strong>{formatNumber(r.tipo, 2)}% — {r.nombre}</strong>
                            <br />
                            Requisitos: {r.condiciones.join(' · ')}
                            {r.valorMaximo ? ` · Valor máximo ${formatCurrency(r.valorMaximo)}` : ''}
                            {/* El tope de valor SÍ se comprueba, así que la línea no puede
                                ofrecerse como rebaja al alcance cuando el precio la descarta
                                (hallazgo 765). Se enseña igualmente porque dice a partir de qué
                                precio existiría, que es lo que los hallazgos 721 y 741 exigen. */}
                            {superaElTope(r, resultadosComprador.precioGaraje) ? ' · ⚠️ tu precio supera ese límite: no podrías acogerte' : ''}
                          </li>
                        ))}
                      </ul>
                      <p className={styles.avisoReducidosTexto}>
                        Un garaje comprado por separado no es vivienda habitual, así que los tipos que
                        exigen esa condición no suelen aplicarse. Confírmalo con la oficina liquidadora
                        de tu comunidad antes de contar con la rebaja.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.placeholder}>
                  <span aria-hidden="true" className={styles.placeholderIcon}>🚗</span>
                  <p>
                    {escritoIlegible(precioGaraje, parseSpanishNumber)
                      ? `No se ha podido leer el precio «${precioGaraje.trim()}». Introduce el precio del garaje con coma decimal (25.000 o 25000,50) para ver el desglose de gastos del comprador`
                      : 'Introduce el precio del garaje para ver el desglose de gastos del comprador'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resultados Vendedor */}
          {pestanaActiva === 'vendedor' && (
            <div role="tabpanel" id="panel-vendedor" aria-labelledby="tab-vendedor">
              <div className={styles.formVendedor}>
                <h3 className={styles.formVendedorTitle}>Datos adicionales del vendedor</h3>
                <NumberInput
                  value={precioCompraOriginal}
                  onChange={setPrecioCompraOriginal}
                  label="Precio de compra original del garaje"
                  placeholder="18000"
                  helperText="Lo que pagaste cuando lo compraste"
                  min={0}
                />
                <NumberInput
                  value={gastosAdquisicion}
                  onChange={setGastosAdquisicion}
                  label="Impuestos y gastos que pagaste al comprarlo (€)"
                  placeholder="1800"
                  helperText="ITP o IVA, notaría, registro y gestoría de aquella compra: suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)"
                  min={0}
                />
                <NumberInput
                  value={aniosPropiedad}
                  onChange={setAniosPropiedad}
                  label="Años de propiedad"
                  placeholder="8"
                  helperText="Años completos desde la compra hasta la venta actual. Escribe 0 si vendes antes de cumplir el año: esa reventa también tributa, y con un coeficiente mayor."
                  // El blur NO acota este campo: su min es 0 y el 0 SIGNIFICA la reventa antes del
                  // año (coeficiente 0,14), así que reescribir un valor imposible al mínimo lo convertía
                  // en un supuesto fiscal válido y caro, y la app lo liquidaba como definitivo
                  // (hallazgos 822 y 844). Quien decide sobre un año negativo es la guarda de la app.
                  acotarAlSalir={false}
                  min={0}
                  max={50}
                />
                <NumberInput
                  value={valorCatastralSuelo}
                  onChange={setValorCatastralSuelo}
                  label="Valor catastral del suelo (€)"
                  placeholder="5000"
                  helperText="Figura en el recibo del IBI (solo la parte del suelo)"
                  min={0}
                />
                <NumberInput
                  value={valorCatastralTotal}
                  onChange={setValorCatastralTotal}
                  label="Valor catastral total (suelo + construcción) (€)"
                  placeholder="12000"
                  helperText="También en el recibo del IBI. Sin este dato no puede compararse el método real de la plusvalía y se aplica el objetivo"
                  min={0}
                />
                <NumberInput
                  value={comisionInmobiliaria}
                  onChange={setComisionInmobiliaria}
                  label="Comisión inmobiliaria del vendedor (%)"
                  placeholder="3"
                  helperText="Típico: 3-5%. La paga el vendedor"
                  min={0}
                  max={10}
                />
                <NumberInput
                  value={gastosGestoriaVenta}
                  onChange={setGastosGestoriaVenta}
                  label="Gestoría y certificados del vendedor (€)"
                  placeholder="0"
                  helperText="Solo lo que pagas TÚ al vender (certificado energético, cédula, gestoría propia). La gestoría del comprador no reduce tu ganancia: art. 35.1 LIRPF"
                  min={0}
                />
              </div>

              {resultadosVendedor ? (
                <div className={styles.resultsInner}>
                  <ResultCard
                    title="Precio de venta"
                    value={formatCurrency(resultadosVendedor.precioVenta)}
                    variant="default"
                    icon="🏷️"
                  />
                  <ResultCard
                    title="Plusvalía municipal"
                    // «Sin calcular» y no «0,00 €»: un cero se lee como «no pagas nada», y aquí
                    // significa «faltan datos». La partida tampoco se suma al total ni al neto.
                    value={
                      !resultadosVendedor.plusvaliaCalculada
                        ? 'Sin calcular'
                        : resultadosVendedor.exentoPlusvalia
                          // «NO SUJETA» y no «EXENTO»: no son sinónimos y la propia tarjeta lo
                          // decía bien dos líneas más abajo. La exención presupone un hecho
                          // imponible realizado; el art. 104.5 TRLRHL articula NO SUJECIÓN, o
                          // sea que el impuesto no llega a devengarse (hallazgo 901).
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
                    description={resultadosVendedor.metodoPlusvalia}
                  />
                  {resultadosVendedor.valorAdquisicion > 0 && (
                    <>
                      <ResultCard
                        title="Valor de adquisición"
                        value={formatCurrency(resultadosVendedor.valorAdquisicion)}
                        variant="default"
                        icon="📥"
                        // Con los gastos de aquella compra ilegibles, la descripción de siempre
                        // afirmaba que están sumados mientras el motor los había tomado como 0,
                        // y con el campo relleno a la vista (hallazgo 1197). Es la mitad de
                        // ae1358d6 que no llegó a esta app; trastero y local-comercial ya lo
                        // dicen así.
                        description={
                          resultadosVendedor.gastosAdquisicionLegible
                            ? 'Precio de compra + impuestos y gastos de aquella compra'
                            : 'Solo el precio de compra: los impuestos y gastos de aquella compra no se han podido leer'
                        }
                      />
                      <ResultCard
                        title="Valor de transmisión"
                        value={formatCurrency(resultadosVendedor.valorTransmision)}
                        variant="default"
                        icon="📤"
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
                  )}
                  {resultadosVendedor.sinGananciaNiPerdida ? (
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
                    resultadosVendedor.gananciaPatrimonial > 0 && (
                      <ResultCard
                        title="Ganancia patrimonial"
                        value={formatCurrency(resultadosVendedor.gananciaPatrimonial)}
                        variant="info"
                        icon="📈"
                        description={avisoTarjeta(resultadosVendedor.veredictoGanancia, 'la ganancia') ?? 'Base para IRPF'}
                      />
                    )
                  )}
                  <ResultCard
                    title="IRPF sobre ganancia"
                    // «Sin calcular» y no «SIN CUOTA» en verde cuando falta el precio de compra:
                    // ese 0 no es una exención, es un dato que falta (efecto familia del 483,
                    // reparado en estimador-compraventa-inmueble con el hallazgo 428).
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
                    icon="💸"
                    description={
                      !resultadosVendedor.irpfCalculado
                        ? resultadosVendedor.camposIlegibles.includes('el precio de compra original')
                          ? 'El precio de compra original no se ha podido leer: escríbelo con coma decimal (1.234,56). Este impuesto NO está incluido en el neto de abajo.'
                          : 'Falta el precio de compra original. Este impuesto NO está incluido en el neto de abajo.'
                        : (avisoTarjeta(resultadosVendedor.veredictoIrpf, 'la cuota') ??
                          `Tributación en base del ahorro (${TIPO_AHORRO_MIN}%-${TIPO_AHORRO_MAX}%)`)
                    }
                  />
                  {/* Un importe ilegible no hace desaparecer su línea: se ve «Sin leer» (hallazgo
                      1252, la forma del A3 de local-comercial y del 1191 del estimador). */}
                  {(resultadosVendedor.comisionInmobiliaria > 0 || !resultadosVendedor.comisionLegible) && (
                    <ResultCard
                      title={
                        resultadosVendedor.comisionLegible
                          ? `Comisión inmobiliaria (${formatTipoNominal(parseSpanishNumberOr(comisionInmobiliaria))}%)`
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
                  {(resultadosVendedor.gastosGestoria > 0 || !resultadosVendedor.gestoriaLegible) && (
                    <ResultCard
                      title="Gestoría y certificados del vendedor"
                      value={resultadosVendedor.gestoriaLegible ? formatCurrency(resultadosVendedor.gastosGestoria) : 'Sin leer'}
                      variant="default"
                      icon="📂"
                      description={
                        resultadosVendedor.gestoriaLegible
                          ? undefined
                          : 'El importe no se ha podido leer: escríbelo con coma decimal (1.234,56)'
                      }
                    />
                  )}
                  <div className={styles.separador} />
                  <ResultCard
                    title="Total gastos vendedor"
                    value={formatCurrency(resultadosVendedor.totalGastos)}
                    variant="warning"
                    icon="➖"
                    description={
                      faltanEnElNeto.length > 0 || avisoIlegiblesNeto
                        ? `Parcial: ${[
                            faltanEnElNeto.length > 0 ? `sin ${enumerar(faltanEnElNeto)}` : null,
                            avisoIlegiblesNeto ? 'con importes que no se han podido leer (ver el neto de abajo)' : null,
                          ]
                            .filter(Boolean)
                            .join('; ')}`
                        : undefined
                    }
                  />
                  <ResultCard
                    title="IMPORTE NETO VENDEDOR"
                    value={formatCurrency(resultadosVendedor.netoVendedor)}
                    variant="highlight"
                    icon="💰"
                    description={
                      (() => {
                        // La dirección de los importes ilegibles la da el sondeo del cálculo
                        // (avisoIlegiblesNeto); aquí solo se compone la frase.
                        const avisos: string[] = [];
                        if (faltanEnElNeto.length > 0) avisos.push(`falta descontar ${enumerar(faltanEnElNeto)}`);
                        if (resultadosVendedor.camposIlegibles.length > 0) {
                          avisos.push(noSePudoLeer(resultadosVendedor.camposIlegibles));
                        }
                        if (avisoIlegiblesNeto) avisos.push(avisoIlegiblesNeto);
                        if (avisos.length === 0) return 'Lo que realmente recibes tras gastos e impuestos';
                        const pedir = [
                          camposPendientes.length > 0 ? `Rellena ${enumerar(camposPendientes)}` : null,
                          hayIlegiblesQueCorregir ? 'escribe los importes con coma decimal (1.234,56)' : null,
                        ]
                          .filter(Boolean)
                          .join(' y ');
                        return `INCOMPLETO: ${avisos.join('; ')}. ${pedir.charAt(0).toUpperCase()}${pedir.slice(1)} para obtener el neto real.`;
                      })()
                    }
                  />
                </div>
              ) : (
                <div className={styles.placeholder}>
                  <span aria-hidden="true" className={styles.placeholderIcon}>📊</span>
                  <p>
                    {escritoIlegible(precioGaraje, parseSpanishNumber)
                      ? `No se ha podido leer el precio «${precioGaraje.trim()}». Introduce el precio de venta con coma decimal (25.000 o 25000,50) para calcular el neto del vendedor`
                      : 'Introduce el precio de venta y los datos adicionales para calcular el neto del vendedor'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="Todo lo que necesitas saber sobre la compraventa de garajes"
        subtitle="Diferencias fiscales con vivienda, cuándo pagar ITP o IVA, plusvalía municipal y consejos prácticos"
        icon="🚗"
      >
        {/* Tabla diferencias garaje vs vivienda */}
        <section className={styles.eduSection}>
          <h2>¿Qué diferencia fiscal hay entre un garaje y una vivienda?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Garaje / Plaza parking</th>
                  <th>Vivienda</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ITP segunda mano</td>
                  <td>Tipo general CCAA (igual)</td>
                  <td>Tipo general CCAA</td>
                </tr>
                {/* La celda del garaje distingue los dos tipos porque es lo que aplica el
                    motor (IVA_INMUEBLES_2025.garaje = 21). Decir «10 %» a secas infravaloraba
                    en 2.750 € un garaje de 25.000 €, y presupuestar de menos es el error caro. */}
                <tr>
                  <td>IVA obra nueva</td>
                  <td>{formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}% con la vivienda · {formatNumber(IVA_INMUEBLES_2025.garaje, 0)}% independiente<br /><small>(IGIC/IPSI en Canarias, Ceuta y Melilla)</small></td>
                  <td>{formatNumber(IVA_INMUEBLES_2025.obraNueva, 0)}% (residencial)</td>
                </tr>
                <tr>
                  <td>Tipos reducidos ITP</td>
                  <td>Sí (joven, discapacidad…)</td>
                  <td>Sí (joven, discapacidad…)</td>
                </tr>
                <tr>
                  <td>Plusvalía municipal vendedor</td>
                  <td>Sí (igual que vivienda)</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td>Exención IRPF mayor 65 años</td>
                  <td>NO (solo vivienda habitual)</td>
                  <td>Sí (vivienda habitual)</td>
                </tr>
                <tr>
                  <td>Reinversión vivienda habitual</td>
                  <td>NO aplica</td>
                  <td>Sí, puede eximir ganancia</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.notaTabla}>
            Nota: la exención de IRPF para mayores de 65 años solo se aplica a la vivienda habitual, NO a garajes o trasteros independientes.
          </p>
        </section>

        {/* Casos de uso */}
        <section className={styles.eduSection}>
          <h2>Casos habituales de compraventa de garaje</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span aria-hidden="true" className={styles.casoEmoji}>🚗</span>
                <span className={styles.casoTag}>Comprar garaje solo (segunda mano)</span>
              </div>
              {/* Cifras tomadas del propio simulador con esa misma entrada. Se han ajustado dos
                  veces y conviene saber por qué: primero se alineó el texto con el motor, que
                  daba el arancel puro (212,48 € de notaría); después se corrigió el motor, que
                  era el que estaba mal —el arancel cubre la matriz y una copia, no la factura—.
                  Curiosamente, los ~400 € que este ejemplo anunciaba al principio estaban más
                  cerca de la verdad que el número exacto que los sustituyó. Un ejemplo que no
                  cuadra con la calculadora de al lado enseña a desconfiar del resultado correcto,
                  así que si vuelve a cambiar el motor, esta cifra cambia con él. */}
              <p>Luis compra una plaza de parking en Madrid por 25.000 €. Paga el ITP general de Madrid ({formatTipoNominal(ITP_GENERAL_MADRID)}%) = 1.500 €, más notaría (371,84 €, dentro de una horquilla de 318,72 € a 424,96 €), registro (80,21 €) y gestoría (300 €). El coste total asciende a 27.252,05 €.</p>
              <div className={styles.casoResultado}>ITP + gastos = 9,01% del precio</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span aria-hidden="true" className={styles.casoEmoji}>🏗️</span>
                <span className={styles.casoTag}>Garaje de obra nueva con vivienda</span>
              </div>
              <p>Elena compra un piso nuevo con garaje incluido por 200.000 €. El conjunto tributa al {formatNumber(IVA_INMUEBLES_2025.obraNueva, 0)}% de IVA sobre el precio total. Si el garaje se escritura por separado (20.000 €) y está vinculado a la vivienda (máx. 2 plazas), el IVA del garaje es también el {formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}%. Si lo compra de forma independiente o en un edificio no residencial, el IVA sube al {formatNumber(IVA_INMUEBLES_2025.garaje, 0)}%.</p>
              <div className={styles.casoResultado}>IVA {formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}% (vinculado) o {formatNumber(IVA_INMUEBLES_2025.garaje, 0)}% (independiente) en garaje de obra nueva</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span aria-hidden="true" className={styles.casoEmoji}>💸</span>
                <span className={styles.casoTag}>Vender garaje con ganancia</span>
              </div>
              <p>Ana compró un garaje por {eurosEnteros(EJEMPLO_ANA.compra)} hace 10 años y lo vende por {eurosEnteros(EJEMPLO_ANA.venta)}. La diferencia bruta son {eurosEnteros(EJEMPLO_ANA_BRUTO)}, pero no es la base que tributa: el art. 35 LIRPF resta del valor de transmisión los gastos que paga el vendedor. Con la comisión del {formatTipoNominal(EJEMPLO_ANA.comisionPct)}% que trae el simulador ({eurosEnteros(EJEMPLO_ANA_COMISION)}), sin plusvalía municipal y sin declarar los gastos de aquella compra, la ganancia queda en {eurosEnteros(EJEMPLO_ANA_REAL.ganancia)} y el IRPF en {formatCurrency(EJEMPLO_ANA_REAL.cuotaIRPF)} ({formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo, 0)}% hasta {eurosEnteros(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].hasta)} y {formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[1].tipo, 0)}% sobre el resto), no los {formatCurrency(EJEMPLO_ANA_BRUTO_IRPF)} que saldrían de los {eurosEnteros(EJEMPLO_ANA_BRUTO)} brutos. Si además hay plusvalía municipal, o Ana declara los impuestos y gastos que pagó al comprarlo, la ganancia baja todavía más.</p>
              <div className={styles.casoResultado}>Ganancia tributa: IRPF ahorro + plusvalía municipal</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span aria-hidden="true" className={styles.casoEmoji}>🎯</span>
                <span className={styles.casoTag}>Tipos reducidos de ITP para garaje</span>
              </div>
              <p>Carlos, 28 años, compra un garaje suelto en Andalucía por 18.000 €. El tipo reducido para jóvenes ({formatTipoNominal(ITP_REDUCIDO_JOVENES_ANDALUCIA)}%) exige que sea su <strong>vivienda habitual</strong>, y un garaje suelto nunca lo es: el simulador liquida el tipo general ({formatNumber(ITP_GENERAL_ANDALUCIA, 2)}% = 1.260,00 €) y avisa de que el reducido no aplica, en vez de dar por buenos 630,00 €. Solo tributa como vivienda habitual si se compra vinculado a ella, en el mismo acto.</p>
              <div className={styles.casoResultado}>Tipos reducidos: NO aplican a un garaje suelto, solo vinculado a la vivienda habitual</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre compraventa de garaje</h2>
          <div className={styles.faqList}>
            {/* Primera de la lista a propósito: «escriturar» es como se teclea la pregunta,
                y hasta el 13/09/2026 el verbo no aparecía en ninguna de las seis apps. */}
            <div className={styles.faqItem}>
              <h3>{preguntaEscriturar(CASOS_ESCRITURAR.garaje.inmueble)}</h3>
              <p>{respuestaEscriturar(CASOS_ESCRITURAR.garaje)}</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Se puede comprar un garaje sin ser propietario de una vivienda?</h3>
              {/* Las cuatro respuestas que seguían duplicadas a mano pasan a la misma constante
                  que publica el FAQPage, y tres ya habían divergido (hallazgo 1200). */}
              <p>{RESPUESTA_GARAJE_SIN_VIVIENDA}</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué ITP paga un garaje de segunda mano?</h3>
              {/* Texto compartido con el FAQPage del JSON-LD: una sola constante para que la
                  respuesta visible y la estructurada no puedan volver a divergir (hallazgo 624). */}
              <p>{RESPUESTA_ITP_GARAJE_SEGUNDA_MANO}</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Garaje nuevo o de segunda mano: qué impuesto se paga?</h3>
              {/* La excepción territorial va aquí y no solo en el aviso condicional de la
                  calculadora: la reparación de los hallazgos 156 y 475 entró en el motor y en
                  el aviso, pero ni en el bloque educativo ni en el FAQPage, así que la página
                  afirmaba sin matiz que un garaje nuevo paga IVA mientras la tarjeta de arriba
                  contestaba «IGIC — No calculado» en Canarias (hallazgo 670). */}
              <p>{RESPUESTA_GARAJE_NUEVO_O_SEGUNDA_MANO}</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El vendedor de un garaje paga plusvalía municipal?</h3>
              <p>{RESPUESTA_PLUSVALIA_GARAJE}</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Existen tipos reducidos de ITP para garajes?</h3>
              <p>{RESPUESTA_TIPOS_REDUCIDOS_GARAJE}</p>
            </div>
          </div>
        </section>

        {/* Consejos */}
        <section className={styles.eduSection}>
          <h2>Consejos prácticos para la compraventa de un garaje</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcon}>🔍</span>
              <strong>Consulta el valor catastral antes de negociar</strong>
              <p>La base del ITP es el mayor entre el precio escriturado y el valor de referencia catastral. Si el catastral supera el precio de mercado, puedes pagar más ITP del esperado. Consulta en la Sede Electrónica del Catastro antes de firmar.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcon}>📋</span>
              <strong>Verifica si la plaza está registrada independientemente</strong>
              <p>Asegúrate de que el garaje tiene referencia catastral y número de finca registral propios. Si no está inscrito por separado, puede haber complicaciones en la escrituración y en el pago de impuestos.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcon}>📅</span>
              <strong>Liquida el ITP en el plazo legal</strong>
              <p>
                El ITP debe liquidarse en {PLAZO_ITP.dias} {PLAZO_ITP.unidad} desde la firma de la escritura
                ({PLAZO_ITP.baseNormativa}). <strong>{PLAZO_ITP.aviso}</strong> Presentarlo
                tarde por iniciativa propia, sin requerimiento de la Administración, genera recargo
                desde el primer día: un {ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase}% de partida más
                otro {ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes}% por cada mes completo de retraso,
                y el {ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses}% más intereses de demora una vez
                transcurridos {ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses{' '}
                ({ESCALA_RECARGO_EXTEMPORANEO.baseNormativa}). Si el recargo se paga en período
                voluntario se reduce un {ESCALA_RECARGO_EXTEMPORANEO.reduccionProntoPago}%. Planifica
                la liquidación desde el día de la firma.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcon}>👨‍💼</span>
              <strong>Consulta con asesor fiscal si hay ganancia significativa</strong>
              <p>Si la ganancia patrimonial al vender es importante, un asesor puede identificar gastos deducibles (reformas, mejoras documentadas) que reduzcan la base imponible del IRPF.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span aria-hidden="true" className={styles.warningIcon}>⚠️</span>
            <strong>Limitaciones de esta calculadora</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Estimaciones orientativas:</strong> Los importes reales pueden diferir según el valor de referencia catastral del inmueble, los coeficientes de plusvalía de cada municipio y los aranceles notariales concretos aplicados.</li>
            <li><strong>Sin exención IRPF por vivienda habitual:</strong> Esta calculadora no aplica la exención por reinversión en vivienda habitual ni la exención para mayores de 65 años, ya que estas exenciones aplican a vivienda, no a garajes independientes.</li>
            <li><strong>Tipos fiscales pueden cambiar:</strong> Los tipos de ITP, AJD e IVA corresponden a la normativa vigente indicada en el aviso de fuentes al inicio de la página. Verifica con tu comunidad autónoma antes de tomar decisiones.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-garaje')} />
      <ShareCard appName="simulador-gastos-compraventa-garaje" />
      <Footer appName="simulador-gastos-compraventa-garaje" />
    </div>
  );
}
