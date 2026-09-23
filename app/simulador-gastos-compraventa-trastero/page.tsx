'use client';
// @disclaimer: fiscal-critical

import {
  RESPUESTA_IVA_TRASTERO_NUEVO,
  RESPUESTA_PLUSVALIA_TRASTERO,
  RESPUESTA_VINCULADO_VS_INDEPENDIENTE,
  RESPUESTA_COMPRAR_SIN_VIVIENDA,
  RESPUESTA_TIPOS_REDUCIDOS_TRASTERO,
} from './metadata';
import { useState, useMemo } from 'react';
import styles from './SimuladorTrasteroCompraventa.module.css';
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
import { veredictoIlegibles, enumerar, faltaOFaltan, noSePudoLeer, escritoIlegible, type Veredicto } from '@/lib/sondeoIlegibles';

/** Importe en euros SIN decimales, para los ejemplos del bloque educativo */
const eurosEnteros = (n: number) => `${formatNumber(n, 0)} €`;
import { PLAZO_ITP, IVA_INMUEBLES_2025, calcularGananciaInmueble, FISCAL_INMUEBLES_META, PLUSVALIA_MUNICIPAL_META, TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '@/data/fiscal';
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
  RANGO_AJD,
  TERRITORIOS_SIN_IVA,
  normaliza,
  sumarLineasVisibles,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar, superaElTope } from '@/data/itp-ccaa';
import { ESCALA_RECARGO_EXTEMPORANEO } from '@/lib/calculadoras/recargoPresentacionTardia';

// ===== TIPOS =====
type TipoTransmision = 'segunda-mano' | 'primera-mano';
type PerfilComprador = 'general' | 'joven' | 'familia-numerosa' | 'discapacidad';
type ModalidadTrastero = 'vinculado' | 'independiente';

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
   * false cuando el texto de «Gastos de gestoría del comprador» no es un número (1201).
   * Es el hueco que la reparación del 1157 dejó abierto EN SU PROPIA APP DE ORIGEN: aquel
   * cierre cubrió los TRES importes del vendedor y este se quedó fuera.
   */
  gestoriaLegible: boolean;
  totalGastos: number;
  totalOperacion: number;
  /** null en primera mano (allí es IVA, no ITP) */
  tipoElegido: TipoElegido | null;
}

/** Extremos de la escala del ahorro, derivados de data/fiscal (hallazgo 592) */
const TIPO_AHORRO_MIN = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
const TIPO_AHORRO_MAX = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo;

// La concordancia de «falta/faltan» (hallazgo 638) y la enumeración de campos viven desde
// el 23/09/2026 en lib/sondeoIlegibles.ts (`faltaOFaltan`, `enumerar`), compartidas con las
// hermanas: el mismo defecto de concordancia reapareció en garaje (hallazgo 1255).

interface ResultadosVendedor {
  precioVenta: number;
  plusvaliaMunicipal: number;
  metodoPlusvalia: string;
  exentoPlusvalia: boolean;
  /** Falso cuando faltan años de propiedad o valor catastral del suelo: entonces la
   *  plusvalía no es 0 €, es desconocida, y el neto que se muestra es un techo. */
  plusvaliaCalculada: boolean;
  /** false cuando el texto del campo de comisión no es un número (hallazgo 773). */
  comisionLegible: boolean;
  /** false cuando «Impuestos y gastos que pagaste al comprarlo» no es un número (1157). */
  gastosAdquisicionLegible: boolean;
  /** false cuando «Gestoría y certificados del vendedor» no es un número (1157). */
  gestoriaLegible: boolean;
  /**
   * false cuando el valor catastral total no se puede leer y hay plusvalía que comparar.
   * Sin él la plusvalía se liquida por el método objetivo aunque el real sea más barato, y
   * el neto baja en silencio (hueco C1 del testigo de familia, visto en el estimador).
   */
  valorTotalLegible: boolean;
  /** Los campos concretos que faltan para calcularla, para nombrarlos en el aviso */
  camposQueFaltan: string[];
  /** …separados en los VACÍOS y los escritos que no se leen, que no «faltan» (hallazgo 1285) */
  camposVacios: string[];
  camposIlegibles: string[];
  comisionInmobiliaria: number;
  gastosGestoria: number;
  totalGastos: number;
  netoVendedor: number;
  valorAdquisicion: number;
  valorTransmision: number;
  esPerdida: boolean;
  /** Ni ganancia ni pérdida: se vende exactamente por el valor de adquisición. */
  sinGananciaNiPerdida: boolean;
  gananciaPatrimonial: number;
  baseImponibleIRPF: number;
  irpfGanancia: number;
  /** false mientras falte el precio de compra: entonces el 0 no es una exención (hallazgo 483) */
  irpfCalculado: boolean;
  /** Hacia dónde queda cada cifra real con los importes ilegibles, CALCULADO por sondeo */
  veredictoNeto: Veredicto;
  veredictoIrpf: Veredicto;
  veredictoGanancia: Veredicto;
}

/**
 * Cifras de los ejemplos del bloque educativo, DERIVADAS del mismo motor que usa la
 * calculadora. Estaban escritas a mano y habian divergido: la tarjeta de segunda mano
 * seguia anunciando ~160 EUR de notaria cuando la app ya calculaba 305,14 EUR, y la de
 * la venta prometia 1.330 EUR de IRPF donde el motor da 1.255,50 EUR (Inspector,
 * 20/08/2026). Derivarlas es lo unico que impide que la reparacion de hoy vuelva a
 * envejecer sola: en cuanto cambie un arancel o el ITP de una comunidad, el ejemplo
 * cambia con el.
 */
const EJEMPLOS = (() => {
  // 1 - Obra nueva en Madrid: trastero de 12.000 EUR transmitido junto a la vivienda
  const nuevoPrecio = 12000;
  const nuevoIva = nuevoPrecio * (IVA_INMUEBLES_2025.anejoVinculado / 100);
  const nuevoAjd = calcularAJD(nuevoPrecio, 'madrid');

  // 2 - Segunda mano en Cataluna: trastero independiente de 18.000 EUR
  const usadoPrecio = 18000;
  const usadoItp = importeITP(
    usadoPrecio,
    'cataluna',
    elegirTipoITP('cataluna', 'general', usadoPrecio, { viviendaHabitual: false }),
  );
  const usadoNotaria = estimarFacturaNotarial(usadoPrecio).medio;
  const usadoRegistro = calcularRegistro(usadoPrecio);

  // 3 - Venta por 15.000 EUR de lo comprado por 8.000 EUR, con la comision del 3 % que
  //     trae el simulador por defecto y sin gastos propios de gestoria del vendedor
  const ventaComision = 15000 * 0.03;
  const venta = calcularGananciaInmueble({
    precioVenta: 15000,
    precioCompra: 8000,
    gastosTransmision: ventaComision,
  });

  // 4 - Galicia, comprador joven: el reducido del 3 % exige vivienda habitual y un
  //     trastero suelto nunca lo es, asi que la app aplica el tipo general
  const galiciaPrecio = 12000;
  const galiciaElegido = elegirTipoITP('galicia', 'joven', galiciaPrecio, { viviendaHabitual: false });
  const galiciaItp = importeITP(galiciaPrecio, 'galicia', galiciaElegido);
  const galiciaReducido = ITP_CCAA['galicia'].tiposReducidos.find(r => normaliza(r.nombre).includes('joven'));

  return {
    nuevoPrecio,
    nuevoIva,
    nuevoAjd,
    nuevoTotal: nuevoIva + nuevoAjd,
    usadoPrecio,
    usadoItp,
    usadoNotaria,
    usadoRegistro,
    usadoTotal: usadoItp + usadoNotaria + usadoRegistro,
    ventaComision,
    ventaGanancia: venta.ganancia,
    ventaIrpf: venta.cuotaIRPF,
    galiciaPrecio,
    galiciaItp,
    galiciaTipoGeneral: ITP_CCAA['galicia'].tipoGeneral,
    galiciaTipoReducido: galiciaReducido?.tipo ?? 0,
  };
})();

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
 * otra por cada importe ilegible sondeado (hallazgos 1280-1285). La dirección de un aviso se
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

  // Ganancia patrimonial e IRPF (trastero: sin exención por vivienda habitual ni edad).
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

export default function SimuladorTrasteroCompraventaPage() {
  // Estado del formulario
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [modalidadTrastero, setModalidadTrastero] = useState<ModalidadTrastero>('vinculado');
  const [perfilComprador, setPerfilComprador] = useState<PerfilComprador>('general');
  const [gastosGestoria, setGastosGestoria] = useState('300');

  // Datos del vendedor (para plusvalía)
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
    const precio = parseSpanishNumber(precioVenta);
    if (!Number.isFinite(precio) || precio <= 0) return null;

    // Se acota aquí y no solo en el blur del NumberInput: mientras el campo tiene el foco,
    // un importe negativo se sumaba al total y su tarjeta ni se pintaba (guard > 0), así que
    // el total en pantalla no cuadraba con las líneas visibles (hallazgo 457, la misma
    // reparación que el 165 de nave-industrial).
    const gestoria = Math.max(0, parseSpanishNumberOr(gastosGestoria));
    /**
     * Y un importe ILEGIBLE tampoco es un cero (hallazgo 1201). `parseSpanishNumberOr`
     * devuelve 0 cuando el parser RECHAZA el texto —«2.000.50» es NaN por diseño desde el
     * 24/08/2026—, la tarjeta se pinta con guarda `> 0` y desaparecía, de modo que el coste
     * total bajaba sin una línea que lo explicara y bajo el rótulo «todos los gastos». Es
     * la dirección mala para quien presupuesta una compra: creerla más barata de lo que es.
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
        // Trastero nuevo: IVA reducido (10%) solo si se transmite CONJUNTAMENTE con la
        // vivienda como anejo (art. 91.Uno.1.7º LIVA). El trastero independiente —finca
        // registral propia, comprado por separado— tributa al tipo general del 21%.
        tipoImpuesto = 'IVA';
        porcentaje = modalidadTrastero === 'vinculado'
          ? IVA_INMUEBLES_2025.anejoVinculado
          : IVA_INMUEBLES_2025.garaje;
        impuesto = precio * (porcentaje / 100);
      }
    } else {
      // ITP para segunda mano
      const datosCcaa = ITP_CCAA[ccaa];

      // `viviendaHabitual: false`: un trastero suelto no lo es nunca, y esa condición
      // aparece en 53 de los tipos reducidos. Antes se aplicaba el primer reducido que
      // casara por nombre sin mirar sus condiciones, y en Madrid eso daba ITP del 0 %.
      elegido = elegirTipoITP(ccaa, perfilComprador, precio, { viviendaHabitual: false });
      impuesto = importeITP(precio, ccaa, elegido);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva el importe no es un porcentaje plano del
      // precio, asi que mostrar el tipo nominal contradiria a la cifra de al lado.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
    }

    // AJD solo aplica en primera mano
    const ajd = tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa) : 0;

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
      tipoElegido: elegido,
    };
  }, [precioVenta, ccaa, tipoTransmision, perfilComprador, gastosGestoria, modalidadTrastero]);

  // ===== CÁLCULOS VENDEDOR =====
  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioVenta);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    // Los años se leen del STRING, no del número: «0» es un dato VÁLIDO —el trastero
    // revendido antes de cumplir el año, que tributa con el coeficiente de «Menos de 1
    // año» de COEFICIENTES_IIVTNU_2025 (0,14, el tercero más alto de la tabla)— y lo que
    // impide calcular es el campo VACÍO. Con `parseInt(aniosPropiedad) || 0` los dos
    // valían 0: el 0 explícito desactivaba la plusvalía y, en cuanto el blur del
    // NumberInput reescribía el campo a «1» por su min={1}, se liquidaba con el
    // coeficiente del año 1 (0,13), es decir DE MENOS (hallazgo 682 del Inspector).
    // Un año NEGATIVO no se acota a 0: se rechaza, como venía haciéndose. Acotarlo lo
    // convertiría en una reventa antes del año y liquidaría un impuesto a partir de un dato
    // imposible (CASO 19 de esta app).
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
    // campo que ya tenía relleno (hallazgo 590). Y separa lo que está VACÍO de lo que está
    // escrito pero no se lee, que no «falta»: el usuario lo ve (hallazgo 1285).
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
     * Antes la dirección se escribía a mano y fallaba donde nadie la había pensado: la tarjeta
     * del IRPF se publicaba como definitiva (1280); con pérdida, sin IRPF que rebajar, prometía
     * que el neto subiría (1281); y con dos ilegibles opuestos decía «Techo» y «Suelo» a la vez
     * (1282).
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
  }, [precioVenta, precioCompraOriginal, aniosPropiedad, valorCatastralSuelo, valorCatastralTotal, comisionInmobiliaria, gastosGestoriaVenta, gastosAdquisicion]);

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
   * cota que se puede publicar sin inventar nada (hallazgo 1283).
   */
  const tipoMarginalAhorro =
    resultadosVendedor && resultadosVendedor.irpfGanancia > 0
      ? (TRAMOS_GANANCIAS_PATRIMONIALES_2025.find((t) => resultadosVendedor.baseImponibleIRPF <= t.hasta)
          ?.tipo ?? TIPO_AHORRO_MAX)
      : null;

  /**
   * Lo que el aviso del neto dice de los importes ilegibles, calculado por el sondeo, en el
   * dialecto de esta app: «Techo:» si la cifra real es menor, «Suelo:» si es mayor, y ninguno
   * de los dos si se mueven en sentidos contrarios, que es cuando la app no puede saberlo
   * (hallazgo 1282: con los dos a la vez, solo serían ciertos si la cifra fuese la correcta).
   */
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
      return v.seguro
        ? `Techo: aún NO incluye ${enumerar(v.campos)}, que no se ${v.campos.length > 1 ? 'han' : 'ha'} podido leer${matiz}`
        : `Techo: ${noSePudoLeer(v.campos)}, y el neto real puede ser menor que este`;
    }
    const explica = v.campos.map((c) =>
      c === 'los impuestos y gastos de aquella compra'
        ? 'los impuestos y gastos de aquella compra, que al sumarse al valor de adquisición REDUCEN el IRPF'
        : c === 'el valor catastral total'
          ? 'el valor catastral total, y con él la plusvalía puede salir más barata por el método real'
          : c,
    );
    return `Suelo: ${noSePudoLeer(explica)}: el neto real ${v.seguro ? 'es' : 'puede ser'} mayor que este`;
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

  const datosCcaaActual = ITP_CCAA[ccaa];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📦</span>
        <h1 className={styles.title}>Simulador de Gastos de Compraventa de Trastero</h1>
        <p className={styles.subtitle}>
          Calcula el ITP, notaría, registro y gastos al comprar o vender un trastero en España
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal - CRÍTICO */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-trastero"
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
          en 2026 un coeficiente de 2025 que se actualiza cada Ley de Presupuestos. Es lo
          que la app hermana del garaje cerró con el hallazgo 35 y aquí faltaba.
          El rango del ahorro de la nota se DERIVA, como las otras tres veces que aparece en
          la página: tecleado a mano, el sello se quedaría atrás el día que se mueva un tramo,
          que es lo único que un sello de verificación no puede hacer (hallazgo 640). */}
      <DataReference
        normativa={`Plusvalía municipal (IIVTNU) ${PLUSVALIA_MUNICIPAL_META.vigencia}`}
        fuente={PLUSVALIA_MUNICIPAL_META.baseNormativa}
        verificado={PLUSVALIA_MUNICIPAL_META.verificado}
        urlOficial={PLUSVALIA_MUNICIPAL_META.urlReferencia}
        nota={`${PLUSVALIA_MUNICIPAL_META.nota} ${PLUSVALIA_MUNICIPAL_META.aviso} El IRPF de la ganancia usa los tramos del ahorro de 2025 (${formatNumber(TIPO_AHORRO_MIN, 0)} % a ${formatNumber(TIPO_AHORRO_MAX, 0)} %).`}
      />

      {/* Nota informativa sobre trastero */}
      <div className={styles.trasteroNote}>
        <span className={styles.trasteroNoteIcon} aria-hidden="true">ℹ️</span>
        <p>
          <strong>Trastero vinculado a vivienda:</strong> tributa como anejo residencial (IVA {formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}% en obra nueva,
          ITP residencial en segunda mano). <strong>Trastero vendido de forma independiente:</strong> en obra nueva
          pierde el tipo reducido y paga el IVA general del {formatNumber(IVA_INMUEBLES_2025.garaje, 0)}% (art. 91.Uno.1.7º LIVA) en el territorio donde
          rige el IVA, sin distinción por comunidad autónoma — salvo en Canarias, Ceuta y Melilla, donde no se
          paga IVA sino IGIC o IPSI (ver aviso abajo). En segunda mano paga el mismo ITP que el vinculado.
        </p>
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            <span className={styles.label} id="rotulo-transmision">Tipo de transmisión</span>
            <div className={styles.transmisionGrid} role="group" aria-labelledby="rotulo-transmision">
              <button
                type="button"
                aria-pressed={tipoTransmision === 'segunda-mano'}
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
              >
                <span aria-hidden="true" className={styles.transmisionIcon}>🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP</span>
              </button>
              <button
                type="button"
                aria-pressed={tipoTransmision === 'primera-mano'}
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
              >
                <span aria-hidden="true" className={styles.transmisionIcon}>🆕</span>
                <span>Primera mano</span>
                <span className={styles.transmisionSub}>
                  {/* En Canarias, Ceuta y Melilla no rige el IVA (IGIC/IPSI), y la modalidad
                      vinculado/independiente no cambia el resultado en nada (hallazgo 485). */}
                  {TERRITORIOS_SIN_IVA[ccaa]
                    ? `Paga ${TERRITORIOS_SIN_IVA[ccaa].impuesto}`
                    : `Paga IVA ${modalidadTrastero === 'vinculado' ? IVA_INMUEBLES_2025.anejoVinculado : IVA_INMUEBLES_2025.garaje}%`}
                </span>
              </button>
            </div>
          </div>

          {/* Modalidad de trastero: solo en primera mano, que es donde decide el tipo de
              IVA. En segunda mano no entra en el cálculo —ambas modalidades liquidan el ITP
              general de la comunidad— y aun así se mostraba, con un aviso sobre el IVA de
              obra nueva encima de una operación de segunda mano (hallazgo 595). Se oculta
              también en Canarias, Ceuta y Melilla, donde no rige el IVA sino IGIC/IPSI: es
              el mismo criterio que la app hermana garaje aplicó en el hallazgo 475. */}
          {tipoTransmision === 'primera-mano' && !TERRITORIOS_SIN_IVA[ccaa] && (
          <div className={styles.inputGroup}>
            <span className={styles.label} id="rotulo-modalidad">Modalidad del trastero</span>
            <div className={styles.transmisionGrid} role="group" aria-labelledby="rotulo-modalidad">
              <button
                type="button"
                aria-pressed={modalidadTrastero === 'vinculado'}
                className={`${styles.transmisionBtn} ${modalidadTrastero === 'vinculado' ? styles.active : ''}`}
                onClick={() => setModalidadTrastero('vinculado')}
              >
                <span aria-hidden="true" className={styles.transmisionIcon}>🏠</span>
                <span>Vinculado a vivienda</span>
                <span className={styles.transmisionSub}>Anejo residencial</span>
              </button>
              <button
                type="button"
                aria-pressed={modalidadTrastero === 'independiente'}
                className={`${styles.transmisionBtn} ${modalidadTrastero === 'independiente' ? styles.active : ''}`}
                onClick={() => setModalidadTrastero('independiente')}
              >
                <span aria-hidden="true" className={styles.transmisionIcon}>📦</span>
                <span>Independiente</span>
                <span className={styles.transmisionSub}>Finca registral propia</span>
              </button>
            </div>
            {/* El selector ya solo se pinta en primera mano y fuera de IGIC/IPSI, así que
                aquí no hace falta la rama de territorios sin IVA: el aviso habla del tipo
                que de verdad se está aplicando en pantalla.
                Sin color literal: el `color: '#856404'` que llevaba este párrafo ganaba al
                token del `.infoCcaaNote` y en modo oscuro dejaba el aviso —el que separa el
                21 % del 10 %— en 2,61:1 de contraste (hallazgo 637). */}
            {modalidadTrastero === 'independiente' && (
              <p className={styles.infoCcaaNote} style={{ marginTop: '0.5rem' }}>
                <span aria-hidden="true">⚠️</span>{' '}
                En obra nueva, el trastero independiente tributa al <strong>IVA general del {formatNumber(IVA_INMUEBLES_2025.garaje, 0)}%</strong>, no al
                {' '}{formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}%: el tipo reducido solo se aplica a los anejos transmitidos junto con la vivienda.
                Confirma tu caso con un asesor fiscal.
              </p>
            )}
          </div>
          )}

          {/* Precio de venta */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio del trastero"
            placeholder="15000"
            helperText="Precio escriturado o valor de referencia catastral (el mayor)"
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="select-ccaa">Comunidad Autónoma (ubicación del trastero)</label>
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
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> Esta comunidad aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${formatTipoNominal(t.tipo)}%`).join(' → ')})
              </p>
            )}
            <p className={styles.infoCcaaNote}>{datosCcaaActual.notas}</p>
          </div>

          {/* Perfil del comprador (solo para ITP) */}
          {tipoTransmision === 'segunda-mano' && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="select-perfil">Perfil del comprador (para tipos reducidos)</label>
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
              <p className={styles.infoCcaaNote} style={{ marginTop: '0.4rem' }}>
                Los tipos reducidos aplican si la CCAA los reconoce para anejos residenciales
              </p>
            </div>
          )}

          {/* Gastos de gestoría */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría del comprador (€)"
              placeholder="300"
              helperText="Típico: 200-400 € (tramitación de escrituras). Solo afecta al presupuesto del comprador"
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
                    title="Precio del trastero"
                    value={formatCurrency(resultadosComprador.precioInmueble)}
                    variant="default"
                    icon="📦"
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
                        ? `En ${datosCcaaActual.nombre} no rige el IVA: la obra nueva tributa por el ${resultadosComprador.tipoImpuesto}, que este simulador no calcula`
                        : tipoTransmision === 'primera-mano'
                          ? (modalidadTrastero === 'vinculado'
                              ? `IVA ${formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}% — anejo transmitido con la vivienda (obra nueva)`
                              : `IVA ${formatNumber(IVA_INMUEBLES_2025.garaje, 0)}% — trastero independiente (obra nueva)`)
                          : `ITP ${datosCcaaActual.nombre}`
                    }
                  />

                  {resultadosComprador.ajd > 0 && (
                    <ResultCard
                      // Tipo EFECTIVO, no el nominal de la tabla: en Ceuta y Melilla la cuota
                      // gradual se bonifica al 50 % (art. 57 bis TRLITPAJD) y el nominal
                      // desmentía el importe de al lado (hallazgo 484, efecto familia del 431).
                      title={`AJD (${formatNumber((resultadosComprador.ajd / resultadosComprador.precioInmueble) * 100, 2)}%)`}
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
                    y la línea DESAPARECÍA del desglose (hallazgo 1201). Ahora se pinta igual y
                    dice que el dato está escrito pero no se ha podido leer.
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
                        `${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}% sobre el precio`,
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
                        // El rótulo «todos los gastos» era falso en cuanto un importe no se
                        // podía leer, y esta es la misma abstención que ya aplica
                        // `impuestoNoCalculado` y en la misma dirección (hallazgo 1201).
                        const sinCalcular = [
                          resultadosComprador.impuestoNoCalculado ? `el ${resultadosComprador.tipoImpuesto}` : null,
                          resultadosComprador.gestoriaLegible ? null : 'la gestoría, que no se ha podido leer',
                        ].filter((x): x is string => x !== null);
                        return sinCalcular.length === 0
                          ? 'Precio del trastero + todos los gastos'
                          : `No incluye ${sinCalcular.join(' ni ')}: el coste real será mayor`;
                      })()
                    }
                  />
                  {resultadosComprador.tipoElegido && resultadosComprador.tipoElegido.noComprobables.length > 0 && (
                    <div className={styles.avisoReducidos} role="note">
                      <p className={styles.avisoReducidosTitulo}>
                        <span aria-hidden="true">💡</span> Podrías pagar menos, pero depende de requisitos que no preguntamos
                      </p>
                      <p className={styles.avisoReducidosTexto}>
                        El cálculo usa el tipo general porque no podemos comprobar tu situación.
                        En {datosCcaaActual.nombre} existe:
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
                            {superaElTope(r, resultadosComprador.precioInmueble) ? ' · ⚠️ tu precio supera ese límite: no podrías acogerte' : ''}
                          </li>
                        ))}
                      </ul>
                      <p className={styles.avisoReducidosTexto}>
                        Un trastero comprado por separado no es vivienda habitual, así que los tipos que exigen esa condición no suelen aplicarse. Confírmalo con la oficina liquidadora de tu comunidad antes de contar con la rebaja.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
                  <p>
                    {escritoIlegible(precioVenta, parseSpanishNumber)
                      ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio del trastero con coma decimal (15.000 o 15000,50) para ver el desglose de gastos del comprador`
                      : 'Introduce el precio del trastero para ver el desglose de gastos del comprador'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resultados Vendedor */}
          {pestanaActiva === 'vendedor' && (
            <div className={styles.resultados}>
              <div className={styles.formVendedor}>
                <h3 className={styles.formVendedorTitle}>Datos para calcular plusvalía e IRPF</h3>

                <NumberInput
                  value={precioCompraOriginal}
                  onChange={setPrecioCompraOriginal}
                  label="Precio de compra original"
                  placeholder="10000"
                  helperText="Lo que pagaste cuando compraste el trastero"
                  min={0}
                />

                <NumberInput
                  value={gastosAdquisicion}
                  onChange={setGastosAdquisicion}
                  label="Impuestos y gastos que pagaste al comprarlo"
                  placeholder="1000"
                  helperText="ITP o IVA, notaría, registro y gestoría de aquella compra: suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)"
                  min={0}
                />

                <NumberInput
                  value={aniosPropiedad}
                  onChange={setAniosPropiedad}
                  label="Años de propiedad"
                  placeholder="5"
                  helperText="Años completos desde la compra hasta ahora. Escribe 0 si vendes antes de cumplir el año: esa reventa también tributa, y con un coeficiente mayor."
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
                  label="Valor catastral del suelo"
                  placeholder="4000"
                  helperText="Solo la parte del suelo (en el recibo del IBI o en Catastro)"
                  min={0}
                />

                <NumberInput
                  value={valorCatastralTotal}
                  onChange={setValorCatastralTotal}
                  label="Valor catastral total (suelo + construcción)"
                  placeholder="9000"
                  helperText="También en el recibo del IBI. Sin este dato no puede compararse el método real de la plusvalía y se aplica el objetivo"
                  min={0}
                />

                <NumberInput
                  value={comisionInmobiliaria}
                  onChange={setComisionInmobiliaria}
                  label="Comisión inmobiliaria (%)"
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
                <>
                  <ResultCard
                    title="Precio de venta"
                    value={formatCurrency(resultadosVendedor.precioVenta)}
                    variant="default"
                    icon="🏷️"
                  />

                  <ResultCard
                    title="Plusvalía municipal"
                    value={
                      resultadosVendedor.exentoPlusvalia
                        // «NO SUJETA» y no «EXENTO»: el art. 104.5 TRLRHL (RDL 26/2021)
                        // articula un supuesto de NO SUJECIÓN. Hallazgo 901, del garaje.
                        ? 'NO SUJETA'
                        : resultadosVendedor.plusvaliaCalculada
                          ? formatCurrency(resultadosVendedor.plusvaliaMunicipal)
                          : 'SIN CALCULAR'
                    }
                    variant={resultadosVendedor.exentoPlusvalia ? 'success' : 'warning'}
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
                        // afirma que están sumados cuando el motor los ha tomado como 0, que es
                        // el agravante que el acta del 1157 señala.
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
                        // Afirmaba restar una comisión o una gestoría que el motor había tomado
                        // como 0 por ilegibles (hallazgo 1284, la gemela del 1157).
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
                        description={
                          avisoTarjeta(resultadosVendedor.veredictoGanancia, 'la ganancia') ?? 'Base para IRPF (base del ahorro)'
                        }
                      />
                    )
                  )}

                  <ResultCard
                    title="IRPF sobre ganancia"
                    // «Sin calcular» y no «SIN CUOTA» en verde cuando falta el precio de compra:
                    // ese 0 no es una exención, es un dato que falta (hallazgo 483).
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

                  {/* Un importe ilegible no hace desaparecer su línea: se ve «Sin leer» (la forma
                      del A3 de local-comercial y del 1191 del estimador). */}
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
                      title="Gastos de gestoría"
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
                      // Los CONCEPTOS que faltan (plusvalía, IRPF) van por un lado y los CAMPOS que
                      // hay que rellenar por otro, sin repetirlos (hallazgo 639). La dirección de
                      // los importes ilegibles la da el sondeo del cálculo (avisoIlegiblesNeto).
                      (() => {
                        const frases: string[] = [];
                        if (faltanEnElNeto.length > 0) frases.push(`Techo: aún NO incluye ${faltanEnElNeto.join(' ni ')}`);
                        if (resultadosVendedor.camposIlegibles.length > 0) {
                          frases.push(`${noSePudoLeer(resultadosVendedor.camposIlegibles).replace(/^./, (c) => c.toUpperCase())}`);
                        }
                        if (avisoIlegiblesNeto) frases.push(avisoIlegiblesNeto);
                        if (frases.length === 0) return 'Lo que realmente recibes tras los gastos';
                        const pedir = [
                          camposPendientes.length > 0 ? `añade ${enumerar(camposPendientes)}` : null,
                          hayIlegiblesQueCorregir ? 'escribe con coma decimal, como 1.234,56, lo que no se ha podido leer' : null,
                        ]
                          .filter(Boolean)
                          .join(' y ');
                        return `${frases.join('. ')} (${pedir})`;
                      })()
                    }
                  />
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
                  <p>
                    {escritoIlegible(precioVenta, parseSpanishNumber)
                      ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio de venta con coma decimal (15.000 o 15000,50) para calcular el neto del vendedor`
                      : 'Introduce el precio de venta y los datos adicionales para calcular el neto del vendedor'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contenido educativo */}
      <EducationalSection
        title="Todo sobre los gastos de compraventa de trastero"
        subtitle="Fiscalidad del trastero: ITP, IVA, plusvalía municipal y diferencias según la modalidad"
        icon="📚"
      >
        {/* Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>Comparativa fiscal: trastero vinculado vs independiente vs garaje</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Trastero vinculado a vivienda</th>
                  <th>Trastero independiente</th>
                  <th>Garaje / Plaza de parking</th>
                </tr>
              </thead>
              <tbody>
                {/* Las dos celdas del anejo transmitido con la vivienda —el trastero
                    vinculado y el garaje de hasta dos plazas— leen la MISMA constante que
                    usa el motor, `anejoVinculado` (art. 91.Uno.1.7º LIVA).
                    La fila del trastero vinculado anunciaba `obraNueva` mientras el cálculo
                    usaba la otra: dos constantes para un solo dato (hallazgo 641). */}
                <tr>
                  <td>IVA en obra nueva</td>
                  <td>{formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}% (anejo de la vivienda)</td>
                  <td>{formatNumber(IVA_INMUEBLES_2025.garaje, 0)}% (tipo general)</td>
                  <td>{formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}% con la vivienda (máx. 2 plazas) · {formatNumber(IVA_INMUEBLES_2025.garaje, 0)}% independiente</td>
                </tr>
                <tr>
                  {/* En segunda mano la modalidad NO entra en el cálculo: las tres columnas
                       liquidan el tipo general de la comunidad. La celda del independiente
                       decía «puede variar» y desmentía al motor y a la propia FAQ (hallazgo 593). */}
                  <td>ITP en segunda mano</td>
                  <td>Tipo general CCAA (residencial)</td>
                  <td>Tipo general CCAA (residencial)</td>
                  <td>Tipo general CCAA (residencial)</td>
                </tr>
                <tr>
                  <td>Tipos reducidos ITP</td>
                  <td>Según CCAA (anejo residencial)</td>
                  <td>Según CCAA, pero casi todos exigen vivienda habitual</td>
                  <td>Según CCAA (anejo residencial)</td>
                </tr>
                <tr>
                  <td>AJD en primera mano</td>
                  <td>{formatNumber(RANGO_AJD.min, 0)}% – {formatNumber(RANGO_AJD.max, 1)}% según CCAA</td>
                  <td>{formatNumber(RANGO_AJD.min, 0)}% – {formatNumber(RANGO_AJD.max, 1)}% según CCAA</td>
                  <td>{formatNumber(RANGO_AJD.min, 0)}% – {formatNumber(RANGO_AJD.max, 1)}% según CCAA</td>
                </tr>
                <tr>
                  <td>Plusvalía municipal</td>
                  <td>Sí (parte proporcional del suelo)</td>
                  <td>Sí (suelo del trastero)</td>
                  <td>Sí (parte proporcional del suelo)</td>
                </tr>
                <tr>
                  <td>IRPF ganancia patrimonial</td>
                  <td>{formatNumber(TIPO_AHORRO_MIN, 0)}% – {formatNumber(TIPO_AHORRO_MAX, 0)}%</td>
                  <td>{formatNumber(TIPO_AHORRO_MIN, 0)}% – {formatNumber(TIPO_AHORRO_MAX, 0)}%</td>
                  <td>{formatNumber(TIPO_AHORRO_MIN, 0)}% – {formatNumber(TIPO_AHORRO_MAX, 0)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.eduSection}>
          <h2>Casos de uso habituales</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🏗️</span>
                <span className={styles.casoTag}>Trastero con vivienda nueva</span>
              </div>
              <p>Al comprar un piso de obra nueva en Madrid por 280.000 € con trastero incluido por {formatCurrency(EJEMPLOS.nuevoPrecio)},
              el trastero tributa al {formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}% de IVA ({formatCurrency(EJEMPLOS.nuevoIva)}) más AJD
              al {formatNumber(ITP_CCAA['madrid'].ajd, 2)}% ({formatCurrency(EJEMPLOS.nuevoAjd)}). El promotor lo vende
              como anejo de la vivienda, por lo que se aplica el mismo tipo reducido.</p>
              <div className={styles.casoResultado}>IVA + AJD: {formatCurrency(EJEMPLOS.nuevoTotal)} de gastos fiscales</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🔄</span>
                <span className={styles.casoTag}>Trastero de segunda mano</span>
              </div>
              <p>Una persona compra un trastero independiente en Cataluña por {formatCurrency(EJEMPLOS.usadoPrecio)}. Al ser segunda mano,
              paga ITP por {formatCurrency(EJEMPLOS.usadoItp)} (primer tramo de la escala progresiva catalana),
              más notaría ({formatCurrency(EJEMPLOS.usadoNotaria)}) y registro ({formatCurrency(EJEMPLOS.usadoRegistro)}), ambos con el IVA ya incluido.</p>
              <div className={styles.casoResultado}>ITP + notaría + registro: {formatCurrency(EJEMPLOS.usadoTotal)} en gastos</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">💰</span>
                <span className={styles.casoTag}>Vender un trastero</span>
              </div>
              <p>El vendedor debe calcular la plusvalía municipal (si la hay) y la posible ganancia patrimonial
              en IRPF. Si compró el trastero por 8.000 € y lo vende por 15.000 €, la diferencia bruta son 7.000 €,
              pero el art. 35 LIRPF descuenta antes los gastos de la venta: con la comisión del 3% que trae el
              simulador ({formatCurrency(EJEMPLOS.ventaComision)}) la ganancia queda en {formatCurrency(EJEMPLOS.ventaGanancia)} y
              el IRPF en {formatCurrency(EJEMPLOS.ventaIrpf)}, porque la base del ahorro no es plana: {formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo, 0)}% hasta {eurosEnteros(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].hasta)} y {formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[1].tipo, 0)}% sobre el resto.</p>
              <div className={styles.casoResultado}>Ganancia de {formatCurrency(EJEMPLOS.ventaGanancia)} → {formatCurrency(EJEMPLOS.ventaIrpf)} de IRPF</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🎯</span>
                <span className={styles.casoTag}>Tipos reducidos de ITP</span>
              </div>
              <p>Un joven de 30 años que compra un trastero en Galicia por {formatCurrency(EJEMPLOS.galiciaPrecio)} paga
              el tipo general del {formatNumber(EJEMPLOS.galiciaTipoGeneral, 0)}% ({formatCurrency(EJEMPLOS.galiciaItp)}), y no
              el reducido del {formatNumber(EJEMPLOS.galiciaTipoReducido, 0)}% para jóvenes: la Xunta lo condiciona a que el inmueble sea
              <strong> vivienda habitual</strong>, y un trastero comprado por separado nunca lo es. El reducido sí entra si el
              trastero se adquiere como anejo de la vivienda en la misma escritura.</p>
              <div className={styles.casoResultado}>Trastero independiente: tipo general del {formatNumber(EJEMPLOS.galiciaTipoGeneral, 0)}%, sin reducción por edad</div>
            </div>
          </div>
        </section>

        {/* FAQ específica de trastero */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre el trastero</h2>
          <div className={styles.faqList}>
            {/* Primera de la lista a propósito: «escriturar» es como se teclea la pregunta,
                y hasta el 13/09/2026 el verbo no aparecía en ninguna de las seis apps. */}
            <div className={styles.faqItem}>
              <h4>{preguntaEscriturar(CASOS_ESCRITURAR.trastero.inmueble)}</h4>
              <p>{respuestaEscriturar(CASOS_ESCRITURAR.trastero)}</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué IVA paga un trastero nuevo?</h4>
              {/* Texto compartido con las dos bocas del JSON-LD: una sola constante para que la
                  respuesta visible y la estructurada no puedan volver a divergir. La cabecera de
                  metadata.ts ya afirmaba que esta FAQ la importaba, y no era cierto (hallazgo
                  774; es el mecanismo que la hermana garaje tiene desde el 624). */}
              <p>{RESPUESTA_IVA_TRASTERO_NUEVO}</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre trastero vinculado y trastero independiente?</h4>
              {/* Las tres respuestas que quedaban duplicadas a mano pasan a la misma constante
                  que publica el FAQPage, que es lo que el hallazgo 774 hizo con las otras dos y
                  lo que el 1158 pedía cerrar: dos de las tres ya habían divergido. */}
              <p>{RESPUESTA_VINCULADO_VS_INDEPENDIENTE}</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se puede comprar un trastero sin comprar también la vivienda?</h4>
              <p>{RESPUESTA_COMPRAR_SIN_VIVIENDA}</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se paga plusvalía municipal al vender un trastero?</h4>
              {/* Misma constante que el FAQPage y el faqJsonLd (hallazgo 774). */}
              <p>{RESPUESTA_PLUSVALIA_TRASTERO}</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Tienen tipos reducidos de ITP los trasteros?</h4>
              <p>{RESPUESTA_TIPOS_REDUCIDOS_TRASTERO}</p>
            </div>
          </div>
        </section>

        {/* Consejos específicos */}
        <section className={styles.eduSection}>
          <h2>Consejos para comprar o vender un trastero</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <strong>Comprueba el tipo de finca</strong>
              <p>Antes de comprar, consulta en el Registro de la Propiedad si el trastero tiene finca propia
              o está vinculado a otra. Esto afecta a la operación y a los impuestos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <strong>Consulta el valor catastral</strong>
              <p>El ITP se calcula sobre el mayor valor entre el precio escriturado y el valor de referencia
              catastral. Compruébalo en la Sede Electrónica del Catastro antes de acordar el precio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Liquida los impuestos a tiempo</strong>
              <p>
                El ITP o el IVA+AJD debe liquidarse en {PLAZO_ITP.dias} {PLAZO_ITP.unidad} desde la
                firma de la escritura ({PLAZO_ITP.baseNormativa}). <strong>{PLAZO_ITP.aviso}</strong>
                Presentarlo tarde por iniciativa propia, sin requerimiento de la Administración, genera
                recargo desde el primer día: un {ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase}% de partida
                más otro {ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes}% por cada mes completo de retraso,
                y el {ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses}% más intereses de demora una vez
                transcurridos {ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses{' '}
                ({ESCALA_RECARGO_EXTEMPORANEO.baseNormativa}); se reduce un{' '}
                {ESCALA_RECARGO_EXTEMPORANEO.reduccionProntoPago}% si el recargo se paga en período voluntario.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📁</span>
              <strong>Guarda todos los justificantes</strong>
              <p>Conserva la escritura, el ITP pagado y los gastos de notaría. Si en el futuro vendes,
              estos gastos se suman al valor de adquisición y reducen la ganancia patrimonial en IRPF.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Limitaciones de esta calculadora de gastos de trastero</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>La vinculación a la vivienda puede cambiar la fiscalidad:</strong> Si el trastero se vende vinculado a la vivienda en una misma operación, la operación conjunta puede tributar de forma distinta. Consulta con un notario o asesor fiscal.</li>
            <li><strong>Los tipos reducidos de ITP no están garantizados para trasteros:</strong> Muchas bonificaciones autonómicas aplican solo a vivienda habitual. Para trasteros, verifica la normativa específica de tu comunidad.</li>
            <li><strong>La plusvalía municipal varía por municipio:</strong> Los coeficientes reales de cada municipio pueden diferir de los estimados en esta calculadora. El resultado es orientativo.</li>
            <li><strong>Los aranceles de notaría y registro son orientativos:</strong> Pueden variar según la complejidad de la operación, el número de folios o copias adicionales.</li>
            <li><strong>Esta herramienta no sustituye el asesoramiento profesional:</strong> Consulta con un notario, abogado o asesor fiscal antes de tomar decisiones en una operación inmobiliaria.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-trastero')} />
      <ShareCard appName="simulador-gastos-compraventa-trastero" />
      <Footer appName="simulador-gastos-compraventa-trastero" />
    </div>
  );
}
