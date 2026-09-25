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
import { veredictoIlegibles, enumerar, faltaOFaltan, noSePudoLeer, mayuscula, enumerarNi, escritoIlegible, type Veredicto } from '@/lib/sondeoIlegibles';

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
  // Dos rangos de AJD desde el 24/09/2026 (hallazgos 1583 y 1592): el País Vasco exime la
  // primera transmisión de VIVIENDA —con sus anejos— y no la del trastero independiente.
  RANGO_AJD_VIVIENDA,
  RANGO_AJD_OTROS,
  tipoGeneralITP,
  tipoAJD,
  describirSubidaITP,
  notariaDeLibreAcuerdo,
  LIMITE_ARANCEL_NOTARIAL,
  RANGO_ITP_OTROS,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  type ObjetoTransmision,
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

/**
 * Qué se transmite, a efectos del ITP y del AJD (obligatorio en el motor desde el 24/09/2026).
 *  · ITP de segunda mano: el trastero SUELTO, que es lo que esta app calcula con su precio y la
 *    misma razón por la que no es vivienda habitual (`viviendaHabitual: false`). En el País Vasco
 *    paga el 7 %; el 4 % es de la vivienda y de los anexos transmitidos CON ella (hallazgo 1582).
 *  · AJD de obra nueva: el vinculado va con la vivienda (IVA del anejo, 10 %) y comparte su
 *    exención foral de primera transmisión (NF 1/2011 de Bizkaia, art. 58.35); el independiente no.
 */
const OBJETO_ITP: ObjetoTransmision = 'otro';
const objetoAJDDe = (m: ModalidadTrastero): ObjetoTransmision => (m === 'vinculado' ? 'vivienda' : 'otro');
/** El País Vasco es la única comunidad que grava distinto la vivienda y el trastero suelto. */
const ITP_PV_VIVIENDA = tipoGeneralITP('pais-vasco', 'vivienda', 0);
const ITP_PV_SUELTO = tipoGeneralITP('pais-vasco', 'otro', 0);

/**
 * «la gestoría de la venta lo bajaría» · «los impuestos y gastos de aquella compra lo subirían»:
 * el verbo concuerda con el SUJETO, no con el número de campos (hallazgo 1568). Es la regla de
 * `esPlural` de lib/sondeoIlegibles.ts, que no se exporta.
 */
const sujetoPlural = (partes: readonly string[]): boolean =>
  partes.length > 1 || /^(los|las)\s/i.test(partes[0] ?? '');
/** «Escríbelo» detrás de un importe, «Escríbelos» detrás de dos o más (hallazgo 1568). */
const escribelo = (partes: readonly string[]): string => (partes.length > 1 ? 'Escríbelos' : 'Escríbelo');

/** Los meses completos del periodo inferior a un año, para el prorrateo del art. 107.4 TRLRHL. */
const MESES_COMPLETOS = Array.from({ length: 12 }, (_, m) => m);

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
  /**
   * Por encima de 6.010.121,04 € el arancel no fija cantidad: el exceso es de libre acuerdo con
   * el notario (RD 1426/1989, nº 2.1; hallazgo 1599), y la estimación solo cubre la parte reglada.
   */
  notariaLibre: boolean;
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
  /** Años escritos y legibles pero negativos: no «faltan», son imposibles (patrón 5, 1566). */
  aniosNegativos: boolean;
  /** Años = 0 sin los meses completos elegidos: el coeficiente se prorratea por ellos (1560). */
  faltanMeses: boolean;
  /** El suelo supera al total: la plusvalía real puede ser menor y el neto MAYOR (1563). */
  parCatastralImposible: boolean;
  /**
   * La plusvalía FALTA y la ganancia sí se calcula: al calcularse restará del valor de
   * transmisión (art. 35.1 LIRPF), así que la ganancia y el IRPF son un MÁXIMO (patrón 2, 1562).
   */
  plusvaliaPendiente: boolean;
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
  const nuevoAjd = calcularAJD(nuevoPrecio, 'madrid', { objeto: 'vivienda' });

  // 2 - Segunda mano en Cataluna: trastero independiente de 18.000 EUR
  const usadoPrecio = 18000;
  const usadoItp = importeITP(
    usadoPrecio,
    'cataluna',
    elegirTipoITP('cataluna', 'general', usadoPrecio, { viviendaHabitual: false, objeto: OBJETO_ITP }),
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
  const galiciaElegido = elegirTipoITP('galicia', 'joven', galiciaPrecio, { viviendaHabitual: false, objeto: OBJETO_ITP });
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
  /** Meses completos cuando los años son 0 (prorrateo del art. 107.4 TRLRHL); si no, undefined */
  meses: number | undefined;
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
  /**
   * Vendiendo por el precio de compra o por debajo no hay incremento de valor, y la no sujeción
   * del art. 104.5 TRLRHL no depende del suelo ni de los años: el motor la decide con venta −
   * compra ≤ 0. Sin el suelo la plusvalía quedaba «Sin calcular», el neto «(PARCIAL)» y se
   * mandaba al recibo del IBI a por un dato que no cambia nada (patrón 4, hallazgo 1564).
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

/**
 * La nota del sello de datos, con el rango de lo que paga un trastero comprado por separado. La común
 * (`FISCAL_INMUEBLES_META.nota`) habla del ITP de la VIVIENDA, del 4 % vasco hacia arriba, y aquí
 * el País Vasco cobra el 7 % (hallazgo 1582); la bonificación de Ceuta y Melilla sale del motor.
 * Decisión común de la familia con nave, solar y terreno (24/09/2026).
 */
const NOTA_DATOS = `El ITP de un trastero comprado por separado va del ${formatTipoNominal(RANGO_ITP_OTROS.min)}% al ${formatTipoNominal(RANGO_ITP_OTROS.max)}% según la comunidad autónoma, contando el tramo más alto de las que aplican escala progresiva; en Ceuta y Melilla la cuota se bonifica un ${formatTipoNominal(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)} % (art. 57 bis TRLITPAJD). Los tipos indicados son orientativos: consulta el de tu comunidad antes de firmar.`;

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
  /** Meses completos cuando se vende antes de cumplir el año ('' = sin elegir). */
  const [mesesCompletos, setMesesCompletos] = useState('');
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
    // Sobre el precio que se PINTA, al céntimo: «0,004» se pinta «0,00 €» y publicaba un desglose
    // entero sobre un precio que se ve como cero (hallazgo 1601, decisión común de la familia).
    if (!Number.isFinite(precio) || Math.round(precio * 100) <= 0) return null;

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
      elegido = elegirTipoITP(ccaa, perfilComprador, precio, { viviendaHabitual: false, objeto: OBJETO_ITP });
      impuesto = importeITP(precio, ccaa, elegido);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva el importe no es un porcentaje plano del
      // precio, asi que mostrar el tipo nominal contradiria a la cifra de al lado.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
    }

    // AJD solo aplica en primera mano
    const ajd =
      tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa, { objeto: objetoAJDDe(modalidadTrastero) }) : 0;

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
      tipoElegido: elegido,
    };
  }, [precioVenta, ccaa, tipoTransmision, perfilComprador, gastosGestoria, modalidadTrastero]);

  // ===== CÁLCULOS VENDEDOR =====
  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioVenta);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    // Los años se leen del STRING, no del número: «0» es un dato VÁLIDO —el trastero
    // revendido antes de cumplir el año, que tributa con el coeficiente de «Menos de 1
    // año» de COEFICIENTES_IIVTNU_2025, prorrateado por meses completos (hallazgo 1560)— y lo
    // que impide calcular es el campo VACÍO. Con `parseInt(aniosPropiedad) || 0` los dos
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
      meses,
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
    const rp = r.resultadoPlusvalia;
    /**
     * Con la plusvalía ya resuelta (sin incremento no hace falta el suelo ni los años, patrón 4)
     * esos dos campos no bloquean nada: nombrarlos marcaría «(PARCIAL)» un neto definitivo.
     */
    const plusvaliaResuelta = rp !== null;
    // Un año negativo no «falta»: está escrito, se lee y es imposible (patrón 5, hallazgo 1566).
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
    const faltan = [...faltanVacios, ...faltanIlegibles];
    const porQueNoSeCalcula = [
      faltanVacios.length > 0 ? faltaOFaltan(faltanVacios) : null,
      faltanIlegibles.length > 0 ? noSePudoLeer(faltanIlegibles) : null,
      aniosNegativos ? 'los años de propiedad no pueden ser negativos' : null,
    ].filter((x): x is string => x !== null).join('; ');

    let metodoPlusvalia = `No calculada (${porQueNoSeCalcula})`;
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
      aniosNegativos,
      faltanMeses,
      parCatastralImposible: rp !== null && !rp.exento && rp.parCatastralImposible,
      plusvaliaPendiente: !plusvaliaResuelta && r.hayDatosGanancia,
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
  }, [precioVenta, precioCompraOriginal, aniosPropiedad, mesesCompletos, valorCatastralSuelo, valorCatastralTotal, comisionInmobiliaria, gastosGestoriaVenta, gastosAdquisicion]);

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
   * Lo que el aviso del neto dice de los importes ilegibles, calculado por el sondeo, en la
   * redacción común de la familia (24/09/2026; hasta entonces esta app decía «Techo:»/«Suelo:»):
   * cada frase termina en la dirección del neto real, y «Sin cerrar» si se mueven en sentidos
   * contrarios, que es cuando la app no puede saberlo (hallazgo 1282).
   */
  const avisoIlegiblesNeto = (() => {
    const v = resultadosVendedor?.veredictoNeto;
    if (!v || v.tipo === 'ninguno') return null;
    if (v.tipo === 'mixto') {
      // El verbo concuerda con el sujeto: «los impuestos y gastos de aquella compra lo
      // subirían», no «lo subiría» (redacción común, hallazgos 1555 y 1568).
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
      return v.seguro
        ? `No descuenta ${enumerarNi(v.campos)}, que no se ${v.campos.length > 1 ? 'han' : 'ha'} podido leer${matiz}: el neto real es menor que este`
        : `${mayuscula(noSePudoLeer(v.campos))}: el neto real puede ser menor que este`;
    }
    const explica = v.campos.map((c) =>
      c === 'los impuestos y gastos de aquella compra'
        ? 'los impuestos y gastos de aquella compra (suman al valor de adquisición y REDUCEN el IRPF)'
        : c === 'el valor catastral total'
          ? 'el valor catastral total (con él la plusvalía puede salir más barata por el método real)'
          : c,
    );
    return `${mayuscula(noSePudoLeer(explica))}: el neto real ${v.seguro ? 'es' : 'puede ser'} MAYOR que este`;
  })();

  /**
   * Los campos concretos que hay que rellenar o corregir. Sale del motor (`camposQueFaltan`),
   * que ya los conoce uno a uno (hallazgo 576), y de los ilegibles que mueven alguna cifra.
   */
  const camposPendientes = resultadosVendedor
    ? Array.from(new Set([
        ...resultadosVendedor.camposVacios.filter((c) => c !== 'los meses completos desde la compra'),
        ...(resultadosVendedor.irpfCalculado || resultadosVendedor.camposIlegibles.includes('el precio de compra original')
          ? []
          : ['el precio de compra original']),
      ]))
    : [];
  const hayIlegiblesQueCorregir =
    (resultadosVendedor?.camposIlegibles.length ?? 0) > 0 ||
    (resultadosVendedor !== null && resultadosVendedor.veredictoNeto.tipo !== 'ninguno');

  /**
   * El par catastral imposible (suelo mayor que total) también deja el neto sin cerrar: la
   * plusvalía se liquidó por el objetivo sin compararla con el real, que puede ser más barato.
   * Es lo que la referencia hace desde 70cce469/85c9c9fe (patrón 3, hallazgo 1563).
   */
  const netoParcial =
    faltanEnElNeto.length > 0 ||
    avisoIlegiblesNeto !== null ||
    (resultadosVendedor?.camposIlegibles.length ?? 0) > 0 ||
    (resultadosVendedor?.parCatastralImposible ?? false);

  /**
   * ¿La plusvalía FALTA mientras la ganancia sí se calcula? Al calcularse restará del valor de
   * transmisión (art. 35.1 LIRPF): la ganancia y el IRPF publicados son un MÁXIMO, y la pérdida
   * un mínimo (patrón de familia 2, hallazgo 1562).
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
    // «Escríbelos» detrás de dos importes (redacción común, hallazgos 1555 y 1568).
    const ilegible = `${mayuscula(noSePudoLeer(v.campos))}, así que ${que} real ${v.seguro ? 'es' : 'puede ser'} ${v.tipo === 'menor' ? 'menor' : 'mayor'}. ${escribelo(v.campos)} con coma decimal (1.234,56).`;
    return pendiente ? `${frasePlusvalia}. ${ilegible}` : ilegible;
  };

  /** La cifra es un MÁXIMO por la plusvalía que falta y ningún ilegible tira en contra. */
  const esMaximoPorPlusvalia = (v: Veredicto): boolean =>
    plusvaliaPendiente && (v.tipo === 'ninguno' || v.tipo === 'menor');

  /**
   * La pérdida es la ganancia con el signo cambiado: su dirección es la contraria. Abre en
   * mayúscula, como los demás avisos de la redacción común (hallazgo 1568).
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
   * haber. Tenía texto fijo y no miraba el sondeo (patrón 6, hallazgo 1565).
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

  const datosCcaaActual = ITP_CCAA[ccaa];
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
        nota={NOTA_DATOS}
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
          paga IVA sino IGIC o IPSI (ver aviso abajo). En segunda mano paga el mismo ITP que el vinculado,
          salvo en el País Vasco: allí el trastero comprado por separado paga el {formatNumber(ITP_PV_SUELTO, 0)}% y
          no el {formatNumber(ITP_PV_VIVIENDA, 0)}% de la vivienda.
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
                {/* Del motor, para un trastero suelto y con el precio escrito: el País Vasco lo
                    grava al 7 % y no al 4 % de la vivienda, y Valencia pasa al 11 % por encima
                    del millón (hallazgos 1581 y 1582). */}
                <span className={styles.infoCcaaValue}>{formatTipoNominal(tipoGeneralITP(ccaa, OBJETO_ITP, precioLeido))}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                <span className={styles.infoCcaaValue}>
                  {formatTipoNominal(tipoAJD(ccaa, { objeto: objetoAJDDe(modalidadTrastero) }).tipo)}%
                </span>
              </div>
            </div>
            {/* Escala o umbral, con sus palabras: Valencia no tiene escala (hallazgos 1581 y 1602). */}
            {subidaITP && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> {subidaITP}
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

                  {/* Las dos cifras de cierre se titulan «(PARCIAL)» con la MISMA condición que
                      ya las rotulaba así sin el IGIC/IPSI: la gestoría ilegible y la notaría de
                      libre acuerdo les quitan algo en la misma dirección (patrón de familia 1,
                      hallazgo 1567; y el 1599 del arancel). */}
                  <ResultCard
                    title={costeCompradorParcial ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales'}
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
                      (() => {
                        // El rótulo «todos los gastos» era falso en cuanto un importe no se
                        // podía leer, y esta es la misma abstención que ya aplica
                        // `impuestoNoCalculado` y en la misma dirección (hallazgo 1201).
                        const sinCalcular = [
                          resultadosComprador.impuestoNoCalculado ? `el ${resultadosComprador.tipoImpuesto}` : null,
                          resultadosComprador.gestoriaLegible ? null : 'la gestoría, que no se ha podido leer',
                          resultadosComprador.notariaLibre
                            ? `la parte de la notaría que excede de ${formatCurrency(LIMITE_ARANCEL_NOTARIAL)}, que es de libre acuerdo`
                            : null,
                        ].filter((x): x is string => x !== null);
                        return sinCalcular.length === 0
                          ? 'Precio del trastero + todos los gastos'
                          : `No incluye ${sinCalcular.join(' ni ')}: ${resultadosComprador.gestoriaLegible ? 'el coste real puede ser mayor' : 'el coste real será mayor'}`;
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
                  // «con un coeficiente mayor» era falso: por debajo del año el coeficiente anual se
                  // PRORRATEA por meses completos (art. 107.4 TRLRHL), y siempre es menor (1560).
                  helperText="Años completos desde la compra hasta ahora. Escribe 0 si vendes antes de cumplir el año: esa reventa también tributa, y te preguntaremos los meses completos, porque el coeficiente se prorratea por ellos."
                  // El blur NO acota este campo: su min es 0 y el 0 SIGNIFICA la reventa antes del
                  // año (coeficiente de «menos de 1 año»), así que reescribir un valor imposible al mínimo lo convertía
                  // en un supuesto fiscal válido y caro, y la app lo liquidaba como definitivo
                  // (hallazgos 822 y 844). Quien decide sobre un año negativo es la guarda de la app.
                  acotarAlSalir={false}
                  min={0}
                  max={50}
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
                  helperText={'Típico: entre el 3\u00A0% y el 5\u00A0%, aunque es de libre acuerdo y en un trastero barato una tarifa mínima puede superarlo. La paga el vendedor'}
                  /*
                    SIN max a propósito (hallazgo 1796 de estimador-compraventa-inmueble, la app de
                    referencia de la familia). Llevaba max={10}, y el blur del NumberInput
                    reescribía a «10» cualquier comisión mayor SIN decirlo: con el foco dentro se
                    publicaba el neto de lo escrito y al salir del campo el del 10 %. La comisión
                    es libre y aquí, con importes bajos, una tarifa mínima supera el 10 % con
                    facilidad: se calcula lo escrito, como ya hacía local-comercial. Por encima del
                    100 % no es una comisión, y se avisa en el propio campo.
                  */
                  min={0}
                  error={
                    parseSpanishNumber(comisionInmobiliaria) > 100
                      ? 'La comisión no puede superar el 100\u00A0% del precio de venta: revisa el porcentaje'
                      : undefined
                  }
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
                        // Sin la plusvalía calculada no puede decir que la resta: el motor la tomó
                        // como 0, y la ganancia y el IRPF de abajo son un máximo (patrón 2, 1562).
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
                      // El cero no es firme con un importe ilegible o sin la plusvalía: lo dice el
                      // sondeo, no un texto fijo (patrón 6, hallazgo 1565).
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
                    resultadosVendedor.gananciaPatrimonial > 0 && (
                      <ResultCard
                        // Un MÁXIMO mientras falte la plusvalía (patrón 2, hallazgo 1562).
                        title={
                          esMaximoPorPlusvalia(resultadosVendedor.veredictoGanancia)
                            ? 'Ganancia patrimonial (máximo)'
                            : 'Ganancia patrimonial'
                        }
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
                    title={
                      resultadosVendedor.irpfGanancia > 0 && esMaximoPorPlusvalia(resultadosVendedor.veredictoIrpf)
                        ? 'IRPF sobre ganancia (máximo)'
                        : 'IRPF sobre ganancia'
                    }
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
                        : // Sin ganancia no hay nada que tribute: «SIN CUOTA · Tributación en base
                          // del ahorro» era la forma del hallazgo 1554 de la referencia.
                          (avisoTarjeta(resultadosVendedor.veredictoIrpf, 'la cuota', resultadosVendedor.irpfGanancia > 0) ??
                          (resultadosVendedor.gananciaPatrimonial < 0
                            ? 'No hay ganancia que gravar: la pérdida se compensa con otras ganancias del ahorro en tu declaración'
                            : resultadosVendedor.gananciaPatrimonial === 0
                              ? 'No hay ganancia que gravar, así que esta venta no tiene IRPF'
                              : `Tributación en base del ahorro (${TIPO_AHORRO_MIN}%-${TIPO_AHORRO_MAX}%)`))
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
                      // Los CONCEPTOS que faltan (plusvalía, IRPF) van por un lado y los CAMPOS que
                      // hay que rellenar por otro, sin repetirlos (hallazgo 639). La dirección de
                      // los importes ilegibles la da el sondeo del cálculo (avisoIlegiblesNeto).
                      // «puede ser», no «será»: un impuesto sin calcular también puede salir a cero.
                      (() => {
                        const frases: string[] = [];
                        if (faltanEnElNeto.length > 0) {
                          frases.push(`No descuenta ${enumerarNi(faltanEnElNeto)}: el neto real puede ser menor que este`);
                        }
                        if (resultadosVendedor.camposIlegibles.length > 0) {
                          frases.push(mayuscula(noSePudoLeer(resultadosVendedor.camposIlegibles)));
                        }
                        if (avisoIlegiblesNeto) frases.push(avisoIlegiblesNeto);
                        // El par catastral imposible: la plusvalía se liquidó por el objetivo sin
                        // compararla con el real, que puede salir más barato (patrón 3, 1563).
                        if (resultadosVendedor.parCatastralImposible) {
                          frases.push(
                            'El valor catastral del suelo supera al total, y con el recibo del IBI bien leído la plusvalía puede salir más barata por el método real: el neto real puede ser MAYOR que este',
                          );
                        }
                        if (frases.length === 0) return 'Lo que realmente recibes tras los gastos';
                        const pedir = [
                          camposPendientes.length > 0 ? `rellena ${enumerar(camposPendientes)}` : null,
                          resultadosVendedor.faltanMeses ? 'elige los meses completos desde la compra' : null,
                          // Un año negativo no «falta»: se corrige (patrón 5, hallazgo 1566).
                          resultadosVendedor.aniosNegativos ? 'corrige los años de propiedad (no pueden ser negativos)' : null,
                          hayIlegiblesQueCorregir ? 'escribe con coma decimal (1.234,56) lo que no se ha podido leer' : null,
                          resultadosVendedor.parCatastralImposible ? 'revisa los dos valores catastrales del recibo del IBI' : null,
                        ]
                          .filter(Boolean)
                          .join(' y ');
                        return `${frases.join('. ')}. ${mayuscula(pedir)} para obtenerlo.`;
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
                  {/* Salvo en el País Vasco, que grava al 4 % la vivienda y los anejos
                      transmitidos con ella, y al 7 % el trastero o el garaje sueltos (hallazgo
                      1582, NF 1/2011 de Bizkaia, art. 13). */}
                  <td>ITP en segunda mano</td>
                  <td>Tipo general de la comunidad (en el País Vasco, el {formatNumber(ITP_PV_VIVIENDA, 0)}% de la vivienda si se transmite con ella)</td>
                  <td>Tipo general de la comunidad (en el País Vasco, {formatNumber(ITP_PV_SUELTO, 0)}%)</td>
                  <td>Tipo general de la comunidad (en el País Vasco, {formatNumber(ITP_PV_SUELTO, 0)}% si se compra por separado)</td>
                </tr>
                <tr>
                  <td>Tipos reducidos ITP</td>
                  <td>Según CCAA (anejo residencial)</td>
                  <td>Según CCAA, pero casi todos exigen vivienda habitual</td>
                  <td>Según CCAA (anejo residencial)</td>
                </tr>
                <tr>
                  {/* Dos rangos: el País Vasco exime la primera transmisión de la vivienda y de
                      sus anejos, no la del trastero o el garaje independientes (hallazgo 1583). */}
                  <td>AJD en primera mano</td>
                  <td>{formatNumber(RANGO_AJD_VIVIENDA.min, 0)}% – {formatNumber(RANGO_AJD_VIVIENDA.max, 1)}% según CCAA</td>
                  <td>{formatNumber(RANGO_AJD_OTROS.min, 1)}% – {formatNumber(RANGO_AJD_OTROS.max, 1)}% según CCAA</td>
                  <td>{formatNumber(RANGO_AJD_VIVIENDA.min, 0)}% – {formatNumber(RANGO_AJD_VIVIENDA.max, 1)}% con la vivienda · {formatNumber(RANGO_AJD_OTROS.min, 1)}% – {formatNumber(RANGO_AJD_OTROS.max, 1)}% independiente</td>
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
