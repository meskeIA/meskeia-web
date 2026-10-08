'use client';
// @disclaimer: DisclaimerCard severity="critical" — fiscal España estructural

import { useState, useMemo } from 'react';
import styles from './SimuladorNaveIndustrial.module.css';
import {
  PREGUNTA_IMPUESTO_COMPRA,
  RESPUESTA_IMPUESTO_COMPRA,
  PREGUNTA_IVA_DEDUCIBLE,
  RESPUESTA_IVA_DEDUCIBLE,
} from './metadata';
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
} from '@/components';
import { formatCurrency, formatNumber, formatTipoNominal, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  tipoAJD,
  tipoGeneralITP,
  describirSubidaITP,
  estimarFacturaNotarial,
  notariaDeLibreAcuerdo,
  LIMITE_ARANCEL_NOTARIAL,
  calcularRegistro,
  honorariosLlevanIVA,
  FACTURA_NOTARIAL,
  REGISTRO_CONCEPTOS,
  ENLACE_CATASTRO,
  RANGO_AJD_OTROS,
  RANGO_AJD_VIVIENDA,
  RANGO_ITP_OTROS,
  TERRITORIOS_SIN_IVA,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  CIUDADES_CON_BONIFICACION,
  sumarLineasVisibles,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
  nombreEnFrase,
  deNombreCcaa,
} from '@/data/itp-ccaa';
import {
  IVA_INMUEBLES_2025,
  FISCAL_INMUEBLES_META,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  GANANCIAS_PATRIMONIALES_META,
} from '@/data/fiscal';

// ===== TIPOS =====
type TipoTransmision = 'segunda-mano' | 'primera-mano' | 'segunda-mano-renuncia';

interface ResultadosComprador {
  precioInmueble: number;
  impuestoTransmision: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  /** Cierto cuando el impuesto indirecto no se ha podido calcular (IGIC / IPSI) */
  impuestoNoCalculado: boolean;
  /** Cierto cuando se ha aplicado la bonificación del 50 % de Ceuta y Melilla */
  bonificado: boolean;
  ajd: number;
  /** Tipo nominal del AJD y por qué es ese (general, o el propio de la renuncia). */
  ajdTipo: ReturnType<typeof tipoAJD>;
  gastosNotario: number;
  gastosNotarioMin: number;
  gastosNotarioMax: number;
  /**
   * El valor supera LIMITE_ARANCEL_NOTARIAL: lo que excede no tiene arancel y sus honorarios
   * son de libre acuerdo (RD 1426/1989, número 2). La cifra de notaría es la del arancel hasta
   * ese límite, así que la factura real PUEDE ser mayor (hallazgo 1599).
   */
  notariaLibre: boolean;
  gastosRegistro: number;
  gastosGestoria: number;
  /**
   * false cuando el texto de «Gastos de gestoría del comprador» no es un número (1199).
   * `parseSpanishNumberOr` devuelve 0 tanto con el campo vacío como con lo que no puede
   * leer, y la tarjeta se pinta con guarda `> 0`: el importe desaparecía del desglose y el
   * coste total bajaba en silencio bajo el rótulo «todos los gastos». La pestaña del
   * vendedor ya sabía abstenerse y nombrarlo; esta se quedó fuera de aquella propagación.
   */
  gestoriaLegible: boolean;
  totalGastos: number;
  totalOperacion: number;
}

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

// IVA nave industrial: el de local comercial/industrial, no el de vivienda. Sale de
// data/fiscal para que no divergir en silencio cuando allí cambie (hallazgo 163).
const IVA_NAVE_INDUSTRIAL = IVA_INMUEBLES_2025.local;

// La bonificación del 50 % de Ceuta y Melilla (art. 57 bis TRLITPAJD) y la lista de
// territorios sin IVA viven en el motor: se cumplen por el SITIO del inmueble, así que las
// aplica calcularITP/calcularAJD y ninguna app tiene que acordarse de ellas.
//
// Su porcentaje tampoco se teclea: se DERIVA de la misma constante que aplica el motor. Iba
// escrito a mano cinco veces en esta página y dos en metadata.ts, con la divergencia en
// silencio garantizada para el día que la cifra cambie (hallazgo 650, mismo patrón que el
// hallazgo D del 27/08/2026 con el 21 % y el 19-30 %).
const BONIFICACION_CIUDADES = `${formatTipoNominal(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)}\u00A0%`;

/**
 * `separarPorcentajes`, como en la referencia: los textos que llegan escritos de data/ (las notas
 * de cada comunidad) pegan el «%» a la cifra, y la regla del catálogo pide un espacio duro.
 */
const separarPorcentajes = (texto: string): string => texto.replace(/(\d)[ \u00A0]?%/g, '$1\u00A0%');

/**
 * La base del AJD no puede ser inferior al valor de referencia (art. 30.1 TRLITPAJD, redacción de
 * la Ley 11/2021), aunque la del IVA sea la contraprestación pactada (art. 78 Ley 37/1992). La app
 * tiene un solo precio y calcula los dos sobre él, así que lo dice allí donde publica el AJD: la
 * tarjeta, el total, la ayuda del precio y las limitaciones (hallazgo 2209 de la hermana solar,
 * llevado a las tres apps de comprador, que tienen el mismo único precio).
 */
const AVISO_BASE_AJD =
  'El AJD va calculado sobre el precio escrito, pero su base no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD): si ese valor es mayor, el AJD se liquida sobre él';

/**
 * Dónde NO existe la renuncia a la exención de la segunda entrega (hallazgo 1584, 24/09/2026).
 *
 * En Ceuta y Melilla la página decía a la vez que la renuncia «no se aplica aquí» y la
 * calculaba (quitaba el ITP y liquidaba AJD): 17.600 € de diferencia en una nave de 640.000 €
 * por elegir una opción que la propia página negaba. Se decidió con la norma, leída en el BOE
 * (BOE-A-1991-7645, Ley 8/1991 del IPSI, texto consolidado):
 *  · el art. 7 declara exentas las entregas de inmuebles que lo estén «en la legislación común
 *    del Impuesto sobre el Valor Añadido», y la ley no regula ninguna renuncia a esa exención
 *    (ni la palabra aparece en el texto);
 *  · el art. 20.3 prohíbe deducir el IPSI soportado en la compra de inmuebles, y la renuncia
 *    del art. 20.Dos LIVA exige justo lo contrario: un adquirente con derecho a deducir;
 *  · el art. 3.c) remite la incompatibilidad con las TPO a «las normas de la legislación
 *    común», y el art. 7.5 TRLITPAJD sujeta a TPO la entrega exenta de un inmueble.
 * Así que allí la segunda mano de una nave paga SIEMPRE ITP (bonificado, art. 57 bis.3.a).
 *
 * Canarias no está en la lista: el IGIC sí tiene la renuncia (art. 50.Cinco Ley canaria
 * 4/2012, sobre la exención del 50.Uno.22.º), con inversión del sujeto pasivo (art. 19.1.2.º g
 * Ley 20/1991) y sin TPO (art. 4.4 de esa misma ley).
 */
const TERRITORIOS_SIN_RENUNCIA: readonly ComunidadAutonoma[] = ['ceuta', 'melilla'];


/**
 * La nota del sello de datos, con el rango de lo que paga una NAVE. El sello común habla del ITP
 * de la vivienda (del 4 % vasco hacia arriba), que no es el de esta app: una nave paga el 7 % en
 * el País Vasco (hallazgo 1582) y, con la bonificación, el 3 % efectivo en Ceuta y Melilla.
 */
const NOTA_DATOS = `El ITP de una nave va del ${formatTipoNominal(RANGO_ITP_OTROS.min)}\u00A0% al ${formatTipoNominal(RANGO_ITP_OTROS.max)}\u00A0% según la comunidad autónoma, contando el tramo más alto de las que aplican escala progresiva; en Ceuta y Melilla la cuota se bonifica un ${BONIFICACION_CIUDADES} (art. 57 bis TRLITPAJD). Los tipos indicados son orientativos: consulta el de tu comunidad antes de firmar.`;

// El helper `tipoNominal` que vivía aquí subió a `lib/formatters.ts` como
// `formatTipoNominal` el 25/08/2026: el mismo defecto estaba en las otras seis apps del
// clúster, cada una con un número de decimales distinto (hallazgos 331 y 333).

export default function SimuladorNaveIndustrialPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  /**
   * Un precio ESCRITO pero ilegible no es un precio vacío (grupo B del testigo de familia,
   * 23/09/2026). El panel se abstiene igual —no hay cifra que publicar—, pero el mensaje
   * pedía «Introduce el precio…» mientras el usuario veía su «2.000.50» escrito en el campo.
   */
  const precioIlegible =
    precioVenta.trim() !== '' && !Number.isFinite(parseSpanishNumber(precioVenta));

  /**
   * La transmisión que se CALCULA. En Ceuta y Melilla la renuncia no existe (ver
   * TERRITORIOS_SIN_RENUNCIA): allí se calcula la segunda mano y el botón de la renuncia se
   * desactiva. Se deriva en lugar de reescribir el estado para no perder la elección del
   * usuario si vuelve a una comunidad donde la renuncia sí existe.
   */
  const renunciaImposible = TERRITORIOS_SIN_RENUNCIA.includes(ccaa);
  const transmision: TipoTransmision =
    tipoTransmision === 'segunda-mano-renuncia' && renunciaImposible ? 'segunda-mano' : tipoTransmision;

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    // Sobre el precio que se PINTA, al céntimo: «0,004» se pintaba «0,00 €» y publicaba un
    // desglose entero con un porcentaje sobre el precio de millones por ciento (forma del
    // hallazgo 1601 de la hermana solar). Un precio que se ve como cero es el cero.
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
    let impuestoNoCalculado = false;
    const bonificado = CIUDADES_CON_BONIFICACION.includes(ccaa);

    const territorioSinIva = TERRITORIOS_SIN_IVA[ccaa];

    // La segunda transmisión de una nave está EXENTA de IVA, pero entre empresarios con
    // derecho a deducción es habitual renunciar a la exención (art. 20.Dos LIVA): entonces
    // vuelve a haber IVA —lo autoliquida el comprador, inversión del sujeto pasivo— y no se
    // paga ITP. Para el público que declara la app (empresas y autónomos) es el caso
    // frecuente, no el raro, y hasta el 23/08/2026 no se podía ni elegir. La hermana del
    // local comercial ya lo modelaba así.
    const conIva = transmision === 'primera-mano' || transmision === 'segunda-mano-renuncia';
    const conRenuncia = transmision === 'segunda-mano-renuncia';

    if (conIva) {
      if (territorioSinIva) {
        // Allí no se devenga IVA: se nombra el impuesto que corresponde y no se inventa cifra.
        // Con renuncia solo se llega aquí en Canarias (IGIC, art. 50.Cinco Ley 4/2012).
        tipoImpuesto = territorioSinIva.impuesto;
        impuestoNoCalculado = true;
      } else {
        // Nave industrial: IVA de local comercial (inmueble no residencial)
        tipoImpuesto = conRenuncia ? 'IVA (renuncia · ISP)' : 'IVA';
        porcentaje = IVA_NAVE_INDUSTRIAL;
        impuesto = precio * (porcentaje / 100);
      }
    } else {
      // ITP segunda mano — tipo general de la CCAA (sin tipos reducidos: nave industrial es comercial).
      // Sin tipo forzado: así se aplica la escala progresiva o el umbral de la comunidad, y
      // `'otro'` le da el tipo de los inmuebles que no son vivienda (País Vasco: 7 %, no el 4 %
      // de la vivienda, hallazgo 1582).
      impuesto = calcularITP(precio, ccaa, 'otro');
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva —o con la bonificación aplicada— el importe no
      // es un porcentaje plano del precio, así que el tipo nominal contradiría a la cifra.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
    }

    // AJD solo aplica cuando la operación va por IVA/IGIC/IPSI (obra nueva o renuncia). En
    // Ceuta y Melilla la cuota gradual de documentos notariales también se bonifica al 50 %
    // (art. 57 bis.1 TRLITPAJD). Con renuncia, el tipo propio de la comunidad donde está
    // verificado (Valencia, 2 %: hallazgo 1603 de la hermana terreno-rústico).
    const contextoAJD = { objeto: 'otro' as const, renunciaExencionIVA: conRenuncia };
    const ajd = conIva ? calcularAJD(precio, ccaa, contextoAJD) : 0;

    // Con la comunidad: en Canarias, Ceuta y Melilla la factura del notario y la del registro
    // no llevan IVA sino IGIC o IPSI, que el catálogo no calcula (hallazgo 2214).
    const notaria = estimarFacturaNotarial(precio, ccaa);

    const notario = notaria.medio;
    const registro = calcularRegistro(precio, ccaa);

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
      bonificado,
      ajd,
      ajdTipo: tipoAJD(ccaa, contextoAJD),
      gastosNotario: notario,
      gastosNotarioMin: notaria.min,
      gastosNotarioMax: notaria.max,
      notariaLibre: notariaDeLibreAcuerdo(precio),
      gastosRegistro: registro,
      gastosGestoria: gestoria,
      gestoriaLegible,
      totalGastos,
      totalOperacion: sumarLineasVisibles(precio, totalGastos),
    };
  }, [precioVenta, ccaa, transmision, gastosGestoria]);

  const datosCcaaActual = ITP_CCAA[ccaa];
  const territorioActualSinIva = TERRITORIOS_SIN_IVA[ccaa];
  const esCiudadBonificada = CIUDADES_CON_BONIFICACION.includes(ccaa);
  /** Las dos ramas en las que el impuesto es IVA y, por tanto, la base es la contraprestación */
  const conIvaEnPantalla =
    (transmision === 'primera-mano' || transmision === 'segunda-mano-renuncia') &&
    !territorioActualSinIva;
  /** El impuesto cuya exención se renuncia: el IVA, o el IGIC en Canarias. */
  const impuestoDeLaRenuncia = territorioActualSinIva?.impuesto ?? 'IVA';
  /**
   * Los tipos del recuadro de la comunidad, del motor y para ESTA operación: el ITP de una nave
   * (no el de la vivienda) al precio escrito —el umbral valenciano lo cambia—, y el AJD que
   * corresponde a la transmisión elegida.
   */
  const precioLeido = parseSpanishNumber(precioVenta);
  const itpGeneralRotulo = tipoGeneralITP(
    ccaa,
    'otro',
    Number.isFinite(precioLeido) && precioLeido > 0 ? precioLeido : 0
  );
  const ajdRotulo = tipoAJD(ccaa, {
    objeto: 'otro',
    renunciaExencionIVA: transmision === 'segunda-mano-renuncia',
  });
  /** Escala progresiva o umbral, con las palabras de cada uno (hallazgo 1581). */
  const subidaITP = describirSubidaITP(ccaa);
  /**
   * A la cifra final le falta algo: el impuesto indirecto sin calcular, una gestoría ilegible
   * (hallazgo 1585) o la parte de la notaría que es de libre acuerdo (hallazgo 1599). Un solo
   * criterio para los dos títulos, con las mismas palabras que el caso del IGIC/IPSI.
   */
  const faltaEnCosteSinHonorarios =
    resultadosComprador !== null &&
    (resultadosComprador.impuestoNoCalculado ||
      !resultadosComprador.gestoriaLegible ||
      resultadosComprador.notariaLibre);

  /**
   * Notaría y registro sin IVA donde no rige (hallazgo 2214, 26/09/2026). El motor, con la
   * comunidad, devuelve el arancel sin impuesto indirecto en Canarias, Ceuta y Melilla: allí esas
   * facturas llevan IGIC o IPSI, que el catálogo no calcula. La tarjeta no puede decir «IVA
   * incluido» y, junto al total, hay que nombrar el impuesto que le falta.
   */
  const territorioHonorarios = honorariosLlevanIVA(ccaa) ? undefined : TERRITORIOS_SIN_IVA[ccaa];
  const rotuloHonorarios = territorioHonorarios ? `(sin ${territorioHonorarios.impuesto})` : '(IVA incluido)';
  /**
   * El cierre es parcial también cuando SOLO faltan esos honorarios (una compra por ITP en
   * Canarias, Ceuta o Melilla): la cifra lleva la notaría y el registro sin su IGIC o IPSI, y
   * se rotulaba «COSTE TOTAL DE ADQUISICIÓN» con la nota de debajo diciendo que cuestan más. Es
   * el criterio del estimador, el garaje y el trastero. El aviso del impuesto de la OPERACIÓN no
   * cambia: con IGIC/IPSI sin calcular sigue diciendo «puede ser mayor» (testigo de familia).
   */
  const cierreParcial =
    faltaEnCosteSinHonorarios || (resultadosComprador !== null && territorioHonorarios !== undefined);

  /**
   * Un precio ESCRITO, legible e imposible —un 0, un negativo mientras el campo tiene el foco o
   * un importe que se pinta 0,00 €— no es un precio que falta: es uno que no vale (patrón 5 de la
   * familia, «no falta, no vale»; hallazgo 1799 en la referencia). El marcador lo dice así, en
   * lugar de pedir que se introduzca un precio que el usuario ve escrito en el campo.
   */
  const precioNoValido =
    !precioIlegible && precioVenta.trim() !== '' && Math.round(precioLeido * 100) <= 0;
  const mensajePrecioNoValido = `El precio escrito («${precioVenta.trim()}»)${
    precioLeido > 0 ? ' se queda en 0,00 € al céntimo, y' : ''
  } tiene que ser mayor que 0: corrígelo para ver el desglose de gastos de la nave industrial.`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span aria-hidden="true" className={styles.heroIcon}>🏭</span>
        <h1 className={styles.title}>Simulador de Gastos de Compra de Nave Industrial</h1>
        <p className={styles.subtitle}>
          Calcula el IVA, ITP, notaría y registro al comprar una nave industrial o local de uso industrial en España
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-nave-industrial"
        collapsible={false}
      />

      {/* Un sello por módulo cuyos datos publica la página, cada uno con su fuente y su fecha
          (forma «a» de la familia, hallazgo 2205; el modelo es local-comercial). El de inmuebles
          lleva una fuente PROPIA: el genérico cita la Ley 35/2006 y el RDL 26/2021, y esta app no
          calcula ni el IRPF ni la plusvalía municipal. */}
      <DataReference
        normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente="Real Decreto Legislativo 1/1993 (ITP y AJD) + Ley 37/1992 IVA"
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={NOTA_DATOS}
      />
      <DataReference
        normativa="Arancel notarial"
        fuente={FACTURA_NOTARIAL.baseNormativa}
        verificado={FACTURA_NOTARIAL.verificado}
        urlOficial={FACTURA_NOTARIAL.urlOficial}
        nota={FACTURA_NOTARIAL.nota}
      />
      <DataReference
        normativa="Arancel registral"
        fuente={REGISTRO_CONCEPTOS.baseNormativa}
        verificado={REGISTRO_CONCEPTOS.verificado}
        urlOficial={REGISTRO_CONCEPTOS.urlOficial}
      />
      {/* La escala del ahorro que publica la guía («Vender nave con ganancia patrimonial»). */}
      <DataReference
        normativa={`IRPF de la ganancia ${GANANCIAS_PATRIMONIALES_META.vigencia} · lo que paga quien vende`}
        fuente={GANANCIAS_PATRIMONIALES_META.fuente}
        verificado={GANANCIAS_PATRIMONIALES_META.verificado}
        urlOficial={GANANCIAS_PATRIMONIALES_META.urlOficial}
        nota={GANANCIAS_PATRIMONIALES_META.nota}
      />

      {/* Aviso IVA deducible — es el TERCERO de los avisos que explicaban un IVA que la propia
          app niega dos tarjetas más allá, y el único que quedó fuera de la reparación del
          hallazgo 647 por estar más arriba, antes del selector. Es además el primero que se lee
          (hallazgo 1177). */}
      <div className={styles.ivaAviso} role="note">
        {territorioActualSinIva ? (
          <>
            <strong><span aria-hidden="true">💡</span> Si eres empresa o autónomo:</strong> en{' '}
            {nombreEnFrase(ccaa)} no rige el IVA, sino el {territorioActualSinIva.impuesto}{' '}
            ({territorioActualSinIva.nombre}), que esta calculadora no cifra. El impuesto soportado
            también puede ser <strong>deducible</strong>, pero con las reglas del{' '}
            {territorioActualSinIva.impuesto}: consúltalas en la administración tributaria{' '}
            {deNombreCcaa(ccaa)} y con tu asesor fiscal antes de tomar decisiones.
          </>
        ) : (
          <>
            <strong><span aria-hidden="true">💡</span> Si eres empresa o autónomo:</strong> el IVA soportado en la compra de una nave industrial
            puede ser <strong>deducible</strong> si tu actividad está sujeta a IVA. Consulta con tu asesor fiscal
            antes de tomar decisiones.
          </>
        )}
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            {/* No es un <label>: no gobierna un control, sino un grupo de dos botones. Con
                role="group" + aria-labelledby el lector de pantalla dice de qué elección
                forman parte, que es lo que un <label> suelto no llegaba a decir. */}
            <span className={styles.label} id="etiqueta-transmision">Tipo de transmisión</span>
            <div className={styles.transmisionGrid} role="group" aria-labelledby="etiqueta-transmision">
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
              {/* El aviso va aquí, en la herramienta, y no solo en el recuadro de limitaciones
                  del final: para el público que la app declara —empresas y autónomos— la renuncia
                  a la exención es el caso frecuente, no el raro. */}
              <button
                type="button"
                className={`${styles.transmisionBtn} ${transmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
                aria-pressed={transmision === 'primera-mano'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🆕</span>
                <span>Obra nueva / Promotor</span>
                {/* En Canarias, Ceuta y Melilla no rige el IVA (IGIC/IPSI): el rótulo no puede
                    prometer un IVA que el recuadro de abajo desmiente (hallazgo 490). */}
                <span className={styles.transmisionSub}>
                  {territorioActualSinIva
                    ? `Paga ${territorioActualSinIva.impuesto} + AJD`
                    : `Paga IVA ${formatNumber(IVA_NAVE_INDUSTRIAL, 0)}\u00A0% + AJD`}
                </span>
              </button>
              {/* En Ceuta y Melilla la renuncia no existe (TERRITORIOS_SIN_RENUNCIA, hallazgo
                  1584): el botón se desactiva y dice por qué, en vez de calcular una opción que
                  el aviso de debajo niega. En Canarias la renuncia es a la exención del IGIC. */}
              <button
                type="button"
                className={`${styles.transmisionBtn} ${transmision === 'segunda-mano-renuncia' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano-renuncia')}
                aria-pressed={transmision === 'segunda-mano-renuncia'}
                disabled={renunciaImposible}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🤝</span>
                <span>2ª mano con renuncia al {impuestoDeLaRenuncia}</span>
                <span className={styles.transmisionSub}>
                  {renunciaImposible
                    ? 'No existe en el IPSI: paga ITP'
                    : territorioActualSinIva
                      ? `Paga ${territorioActualSinIva.impuesto} (ISP) + AJD`
                      : `IVA ${formatNumber(IVA_NAVE_INDUSTRIAL, 0)}\u00A0% (ISP) + AJD`}
                </span>
              </button>
            </div>
            {/* Los dos avisos miran el territorio, igual que el rótulo del botón desde la
                reparación del hallazgo 490. Desde el 24/09/2026 (hallazgo 1584) distinguen además
                Canarias, donde la renuncia EXISTE —a la exención del IGIC—, de Ceuta y Melilla,
                donde el IPSI no la tiene: antes los tres decían que «no se aplica aquí» mientras
                la app la calculaba. */}
            {transmision === 'segunda-mano' && (
              <p className={styles.avisoRenuncia} role="note">
                <span aria-hidden="true">ℹ️</span>{' '}
                {renunciaImposible && territorioActualSinIva ? (
                  <>
                    En {nombreEnFrase(ccaa)} no rige el IVA, sino el {territorioActualSinIva.impuesto}{' '}
                    ({territorioActualSinIva.nombre}), y en él <strong>no existe la renuncia a la
                    exención</strong>: la Ley 8/1991 toma sus exenciones de la ley del IVA (art. 7) sin
                    regular ninguna renuncia, y no deja deducir el {territorioActualSinIva.impuesto}{' '}
                    soportado en la compra de un inmueble (art. 20.3), que es lo que la renuncia exige en
                    la ley del IVA (art. 20.Dos). La segunda mano de una nave paga siempre ITP, así que la
                    tercera opción no se puede elegir aquí.
                  </>
                ) : territorioActualSinIva ? (
                  <>
                    En {nombreEnFrase(ccaa)} no rige el IVA, sino el {territorioActualSinIva.impuesto}{' '}
                    ({territorioActualSinIva.nombre}). También en él la segunda entrega de una nave está
                    exenta y, entre empresarios con derecho a deducción, se puede{' '}
                    <strong>renunciar a esa exención</strong> (art. 50.Cinco Ley canaria 4/2012): la
                    operación pasa al {territorioActualSinIva.impuesto}, que autoliquida el comprador
                    (inversión del sujeto pasivo), y no se paga ITP. Si es tu caso, usa la tercera opción;
                    el {territorioActualSinIva.impuesto} no lo cifra este simulador.
                  </>
                ) : (
                  <>
                    Entre empresarios con derecho a deducción es habitual{' '}
                    <strong>renunciar a la exención de IVA</strong> en la segunda transmisión: la operación
                    vuelve al IVA, lo autoliquida el comprador (inversión del sujeto pasivo) y no se paga
                    ITP. Si es tu caso, usa la tercera opción.
                  </>
                )}
              </p>
            )}
            {transmision === 'segunda-mano-renuncia' && (
              <p className={styles.avisoRenuncia} role="note">
                <span aria-hidden="true">ℹ️</span>{' '}
                {territorioActualSinIva ? (
                  <>
                    En {nombreEnFrase(ccaa)} <strong>no se devenga IVA</strong>: la renuncia es a la
                    exención del {territorioActualSinIva.impuesto} (art. 50.Cinco Ley canaria 4/2012), y
                    ese {territorioActualSinIva.impuesto} lo <strong>autoliquida el comprador</strong> por
                    inversión del sujeto pasivo (art. 19.1.2.º g Ley 20/1991). Con la renuncia la
                    operación deja de pagar ITP (art. 4.4 de esa misma ley) y la escritura paga AJD. Este
                    simulador no cuantifica el {territorioActualSinIva.impuesto}; el AJD sí, con el tipo
                    general de la comunidad —algunas le aplican un <strong>tipo incrementado</strong>{' '}
                    cuando hay renuncia—.
                  </>
                ) : ajdRotulo.motivo === 'renuncia' ? (
                  <>
                    Con renuncia a la exención el IVA no se paga al vendedor: lo{' '}
                    <strong>autoliquida el comprador</strong> (inversión del sujeto pasivo), y suele ser
                    deducible si tu actividad está sujeta a IVA. El AJD de la escritura va al{' '}
                    <strong>tipo propio de la renuncia</strong> en {nombreEnFrase(ccaa)} (
                    {formatTipoNominal(ajdRotulo.tipo)}&nbsp;%), que es el que se aplica aquí.
                  </>
                ) : (
                  <>
                    Con renuncia a la exención el IVA no se paga al vendedor: lo{' '}
                    <strong>autoliquida el comprador</strong> (inversión del sujeto pasivo), y suele ser
                    deducible si tu actividad está sujeta a IVA. Ojo al AJD: varias comunidades le aplican
                    un <strong>tipo incrementado</strong> cuando hay renuncia, y aquí se calcula con el
                    tipo general de la tabla — consúltalo en tu comunidad.
                  </>
                )}
              </p>
            )}
          </div>

          {/* Precio. La base del IVA es la contraprestación pactada (art. 78 Ley 37/1992); el
              valor de referencia catastral es la base MÍNIMA del ITP/AJD. En obra nueva y en la
              renuncia, seguir «el mayor de ambos» infla el impuesto sobre una base que la ley
              del IVA no reconoce, y contradice al recuadro de limitaciones de esta misma
              página, que sí acota el valor de referencia «al ITP» (hallazgo 601). */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio de compra de la nave industrial"
            placeholder="500000"
            helperText={
              conIvaEnPantalla
                ? 'Contraprestación pactada en la escritura (base del IVA, art. 78 Ley 37/1992). La base del AJD no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD)'
                : 'Precio escriturado o valor de referencia catastral (el mayor de ambos)'
            }
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="select-ccaa">
              Comunidad Autónoma (ubicación de la nave)
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

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span className={styles.infoCcaaIcon} aria-hidden="true">📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                {/* El de una nave, no el de la vivienda: en el País Vasco, 7 % y no 4 %
                    (hallazgo 1582); en Valencia, el 11 % si el precio pasa del millón (1581). */}
                <span className={styles.infoCcaaValue}>{formatTipoNominal(itpGeneralRotulo)}&nbsp;%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                {/* formatTipoNominal, como el ITP General de la línea de al lado desde el
                    hallazgo 331 y como el bloque educativo desde el 651: un tipo NOMINAL no
                    lleva los decimales que no tiene. Este era el último de la página al que
                    se le forzaban dos, mientras la tabla comparativa de la misma página ya
                    escribía ese rango sin ellos (hallazgo 685). */}
                {/* Del motor y para esta operación: el País Vasco cobra el 0,5 % a una nave
                    (hallazgo 1583) y Valencia el 2 % con renuncia (1603). */}
                <span className={styles.infoCcaaValue}>{formatTipoNominal(ajdRotulo.tipo)}&nbsp;%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>
                  {territorioActualSinIva ? `${territorioActualSinIva.impuesto} (obra nueva)` : 'IVA (obra nueva)'}
                </span>
                <span className={styles.infoCcaaValue}>
                  {territorioActualSinIva ? 'No calculado' : `${formatTipoNominal(IVA_NAVE_INDUSTRIAL)}\u00A0%`}
                </span>
              </div>
            </div>
            {/* Escala o umbral, con las palabras del motor: Valencia se anunciaba como «escala
                progresiva (9% → 11%)» y el 11 % grava TODO el valor, no el exceso (hallazgo 1581). */}
            {subidaITP && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> <strong>Tipo según el valor:</strong> {subidaITP}.
              </p>
            )}
            {esCiudadBonificada ? (
              <p className={styles.infoCcaaNote}>
                Las naves industriales tributan por el <strong>tipo general</strong> de ITP, pero en{' '}
                {nombreEnFrase(ccaa)} se aplica además la{' '}
                <strong>bonificación del {BONIFICACION_CIUDADES} de la cuota</strong>{' '}
                del artículo 57 bis del TRLITPAJD, que corresponde a los inmuebles situados en la ciudad
                sea cual sea su uso. El simulador ya la descuenta.
              </p>
            ) : (
              <p className={styles.infoCcaaNote}>
                Una nave industrial tributa por el <strong>tipo general</strong> de ITP: los tipos reducidos por
                perfil del comprador (jóvenes, familia numerosa, discapacidad) exigen que el inmueble sea la
                vivienda habitual, y una nave no lo es. Eso no agota los beneficios posibles: alguna comunidad
                tiene tipos propios ligados a la ACTIVIDAD, no a la vivienda, y esta calculadora no los aplica.
              </p>
            )}
            {/* La ficha de la comunidad, que es donde vive ese matiz: la nota de arriba negaba de
                plano un tipo que data/itp-ccaa.ts documenta —el 1 % del art. 121-11 de Aragón por
                adquirir un inmueble para iniciar una actividad económica, que es el caso de quien
                compra una nave para montar un negocio—. Es la reparación del hallazgo 726
                (local-comercial) y del 2208 (solar), llevada aquí, donde tampoco se pintaba. */}
            {datosCcaaActual.notas && (
              <p className={styles.infoCcaaNote}>
                <strong>{datosCcaaActual.nombre}:</strong> {separarPorcentajes(datosCcaaActual.notas)}
              </p>
            )}
            {territorioActualSinIva && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> En {nombreEnFrase(ccaa)} <strong>no se aplica el IVA</strong>:
                la obra nueva tributa por el {territorioActualSinIva.impuesto} ({territorioActualSinIva.nombre}),
                con sus propios tipos. Este simulador no lo calcula — consúltalo en la administración tributaria
                {deNombreCcaa(ccaa)}.
              </p>
            )}
          </div>

          {/* Gestoría */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría (€)"
              placeholder="500"
              helperText="Típico en operaciones comerciales: 400-800 €"
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
          {resultadosComprador ? (
            <>
              <ResultCard
                title="Precio de la nave industrial"
                value={formatCurrency(resultadosComprador.precioInmueble)}
                variant="default"
                icon="🏭"
              />

              <ResultCard
                title={
                  resultadosComprador.impuestoNoCalculado
                    ? resultadosComprador.tipoImpuesto
                    // Dos decimales: a cero, un 6,50 % se rotulaba «7%» junto a un importe
                    // que es el 6,5 % del precio, y las dos cifras se desmentían en pantalla.
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
                    ? `En ${nombreEnFrase(ccaa)} no rige el IVA: ${transmision === 'segunda-mano-renuncia' ? `la renuncia a la exención del ${resultadosComprador.tipoImpuesto}` : 'la obra nueva'} tributa por el ${resultadosComprador.tipoImpuesto}, que este simulador no calcula`
                    // startsWith y no igualdad estricta: con renuncia el rótulo es
                    // «IVA (renuncia · ISP)» y caía al ramal del ITP, así que bajo un IVA de
                    // 105.000 € se leía «naves industriales no tienen tipos reducidos», que
                    // es del impuesto que en esa operación NO se paga (hallazgo 600).
                    : resultadosComprador.tipoImpuesto.startsWith('IVA')
                      ? transmision === 'segunda-mano-renuncia'
                        ? 'Lo autoliquida el comprador por inversión del sujeto pasivo (no se paga al vendedor) y es deducible si tienes derecho'
                        : 'Potencialmente deducible si eres empresa/autónomo sujeto a IVA'
                      : resultadosComprador.bonificado
                        ? `Tipo general con la bonificación del ${BONIFICACION_CIUDADES} de la cuota ya aplicada (art. 57 bis TRLITPAJD)`
                        : 'Tipo general — las naves no tienen los reducidos de vivienda, pero alguna comunidad sí tiene tipos ligados a la ACTIVIDAD'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  // Tipo EFECTIVO, igual que el del ITP: en Ceuta y Melilla la cuota gradual
                  // se bonifica al 50 % (art. 57 bis.1 TRLITPAJD) y el nominal de la tabla se
                  // desmentía con el importe de al lado (hallazgo 447).
                  title={`AJD (${formatNumber((resultadosComprador.ajd / resultadosComprador.precioInmueble) * 100, 2)}\u00A0%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
                  description={[
                    resultadosComprador.bonificado
                      ? `Con la bonificación del ${BONIFICACION_CIUDADES} de Ceuta y Melilla aplicada`
                      : resultadosComprador.ajdTipo.motivo === 'renuncia'
                        ? `Tipo propio de la renuncia a la exención en ${nombreEnFrase(ccaa)}`
                        : transmision === 'segunda-mano-renuncia'
                          ? 'Tipo general de la comunidad: algunas aplican uno incrementado cuando hay renuncia'
                          : null,
                    AVISO_BASE_AJD,
                  ]
                    .filter((x): x is string => x !== null)
                    .join('. ')}
                />
              )}

              <ResultCard
                title={`Gastos de notaría ${rotuloHonorarios}`}
                value={formatCurrency(resultadosComprador.gastosNotario)}
                description={
                  resultadosComprador.notariaLibre
                    // Por encima del límite el arancel no fija cantidad (hallazgo 1599): la cifra
                    // es la del tramo reglado y lo que excede se pacta con el notario.
                    ? `Arancel hasta ${formatCurrency(LIMITE_ARANCEL_NOTARIAL)}: factura estimada entre ${formatCurrency(resultadosComprador.gastosNotarioMin)} y ${formatCurrency(resultadosComprador.gastosNotarioMax)}. Lo que excede de ese valor no tiene arancel: sus honorarios son de libre acuerdo con el notario (RD 1426/1989, número 2), así que la factura real puede ser mayor.`
                    : `Factura estimada entre ${formatCurrency(resultadosComprador.gastosNotarioMin)} y ${formatCurrency(resultadosComprador.gastosNotarioMax)}. El arancel cubre la matriz y una copia; las copias adicionales y los folios se facturan aparte y dependen de la extensión de la escritura.`
                }
                variant="default"
                icon="📝"
              />

              <ResultCard
                title={`Registro de la Propiedad ${rotuloHonorarios}`}
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

              {/* «(parcial)» con el mismo criterio que el caso del IGIC/IPSI: la gestoría ilegible
                  (hallazgo 1585) y la notaría de libre acuerdo (1599) también dejan fuera algo,
                  y la descripción ya lo decía bajo un título de cifra definitiva. */}
              <ResultCard
                title={cierreParcial ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales'}
                value={formatCurrency(resultadosComprador.totalGastos)}
                variant="info"
                icon="➕"
                description={
                  [
                    `${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}\u00A0% sobre el precio de compra`,
                    resultadosComprador.impuestoNoCalculado
                      ? `SIN el ${resultadosComprador.tipoImpuesto}, que no está incluido`
                      : null,
                    // Un importe que no se ha podido leer falta en el total igual que un impuesto
                    // sin calcular, y en la misma dirección (hallazgo 1199).
                    resultadosComprador.gestoriaLegible ? null : 'SIN la gestoría, que no se ha podido leer',
                    resultadosComprador.notariaLibre
                      ? `SIN la parte de la notaría de libre acuerdo (el valor que excede de ${formatCurrency(LIMITE_ARANCEL_NOTARIAL)})`
                      : null,
                    territorioHonorarios
                      ? `SIN el ${territorioHonorarios.impuesto} de las facturas de notaría y registro, que tampoco se calcula`
                      : null,
                  ]
                    .filter((x): x is string => x !== null)
                    .join(' — ')
                }
              />

              <ResultCard
                title={cierreParcial ? 'COSTE TOTAL (PARCIAL)' : 'COSTE TOTAL DE ADQUISICIÓN'}
                value={formatCurrency(resultadosComprador.totalOperacion)}
                variant="highlight"
                icon="💳"
                description={
                  `${
                  faltaEnCosteSinHonorarios
                    ? `No incluye ${[
                        resultadosComprador.impuestoNoCalculado ? `el ${resultadosComprador.tipoImpuesto}` : null,
                        resultadosComprador.gestoriaLegible ? null : `la gestoría, que no se ha podido leer${resultadosComprador.notariaLibre ? ',' : ''}`,
                        resultadosComprador.notariaLibre ? 'la parte de la notaría de libre acuerdo' : null,
                      ]
                        .filter((x): x is string => x !== null)
                        .join(' ni ')}: ${resultadosComprador.gestoriaLegible ? 'el coste real puede ser mayor' : 'el coste real será mayor'}${
                        // Con IVA en pantalla (obra nueva o renuncia, fuera de Canarias, Ceuta y
                        // Melilla) el aviso del ilegible se SUMA a la salvedad del IVA deducible,
                        // no la reemplaza (forma del hallazgo 1272 de solar).
                        conIvaEnPantalla
                          ? ' (precio + gastos antes de deducir el IVA si tienes derecho)'
                          : ''
                      }`
                    : territorioHonorarios
                      // Solo faltan los honorarios: lo explica la nota de debajo (forma del estimador).
                      ? `Precio + los gastos calculados, sin el ${territorioHonorarios.impuesto} de las facturas de notaría y registro (ver la nota de abajo)`
                    : 'Precio + todos los gastos (antes de deducir IVA si aplica)'
                  }${
                    // Con AJD en el desglose, su base mínima (art. 30.1 TRLITPAJD): el total no se
                    // presenta como definitivo sin esa salvedad (hallazgo 2209).
                    resultadosComprador.ajd > 0 ? `. ${AVISO_BASE_AJD}` : ''
                  }`
                }
              />

              {/* Lo que el motor ya no suma en Canarias, Ceuta y Melilla (hallazgo 2214): el IGIC o el
                  IPSI de las facturas de notaría y registro. Va fuera de la tarjeta a propósito: el aviso
                  del total habla del impuesto de la OPERACIÓN, que puede ser cero; este no lo es, y por eso
                  esta nota no habla del «coste real» (redacción común de las siete hermanas). */}
              {territorioHonorarios && (
                <p className={styles.avisoHonorarios} role="note">
                  <span aria-hidden="true">ℹ️</span> Las facturas de notaría y registro llevan además{' '}
                  {territorioHonorarios.impuesto}, que esta herramienta no calcula, así que cuestan más de lo
                  que se muestra.
                </p>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>
                {precioIlegible
                  ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio de la nave industrial para ver el desglose de gastos, con coma decimal (500.000 o 500000,50)`
                  : precioNoValido
                    ? mensajePrecioNoValido
                    : 'Introduce el precio de la nave industrial para ver el desglose de gastos'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía fiscal para la compra de naves industriales"
        subtitle="Diferencias clave respecto a la compra de vivienda y cómo funciona el IVA deducible"
        icon="📚"
      >
        {/* Tabla comparativa nave vs vivienda */}
        <section>
          <h2>Diferencias fiscales: nave industrial vs vivienda</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                {/* La cabecera va por clase y con `--primary-boton`, que es el token para un
                    fondo con texto blanco encima (5,47:1 en los dos temas). Con `--primary` en
                    línea fallaba en AMBOS —4,11:1 en claro y 2,79:1 en oscuro, donde el tono
                    aclara— y ningún token del módulo podía alcanzarlo. Es la tercera vuelta
                    sobre esta misma tabla: las celdas de respuesta se repararon con el hallazgo
                    648 y la de la cifra con el 684; las tres veces se midió el TEXTO de las
                    celdas y la fila del `<thead>` nunca se midió, porque su color no está en el
                    texto sino en el FONDO (hallazgo 1175). */}
                <tr className={styles.cabeceraTabla}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Concepto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Nave industrial</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Vivienda</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>IVA obra nueva</td>
                  <td className={styles.celdaCifra} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>{formatNumber(IVA_INMUEBLES_2025.local, 0)}&nbsp;%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>{formatNumber(IVA_INMUEBLES_2025.obraNueva, 0)}&nbsp;%</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>ITP segunda mano</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Tipo general CCAA</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>General o reducido</td>
                </tr>
                {/* Las celdas de respuesta van por clase (.celdaSi / .celdaNo) y no con el color
                    en línea: los dos hexadecimales de antes no tenían variante de tema y ninguno
                    llegaba al 4,5:1 donde le tocaba perder (hallazgo 648). El dato lo lleva la
                    PALABRA —«Sí …» / «No aplican»—, no el color. */}
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Tipos reducidos ITP</td>
                  {/* Ni «No aplican» de plano: Aragón tiene el 1 % del art. 121-11 para el inmueble con
                      el que se inicia una actividad, que el recuadro ya pinta (hallazgo 2914). */}
                  <td className={styles.celdaNo} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>No por perfil del comprador; alguna comunidad los liga a la actividad (Aragón)</td>
                  <td className={styles.celdaSi} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>Sí (jóvenes, familia numerosa, etc.)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>IVA deducible</td>
                  <td className={styles.celdaSi} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Sí (si actividad sujeta a IVA)</td>
                  <td className={styles.celdaNo} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>No</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px' }}>AJD obra nueva</td>
                  {/* Un rango por objeto: el 0 % es la exención foral de la primera VIVIENDA y una
                      nave paga allí el 0,5 % (hallazgo 1583). */}
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí ({formatTipoNominal(RANGO_AJD_OTROS.min)}&nbsp;% – {formatTipoNominal(RANGO_AJD_OTROS.max)}&nbsp;%; en Ceuta y Melilla, la mitad por la bonificación del {BONIFICACION_CIUDADES}, art. 57 bis.1 TRLITPAJD)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí ({formatTipoNominal(RANGO_AJD_VIVIENDA.min)}&nbsp;% – {formatTipoNominal(RANGO_AJD_VIVIENDA.max)}&nbsp;%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Casos de uso habituales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🏭</span> Empresa compra nave nueva al promotor</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Paga IVA {formatNumber(IVA_NAVE_INDUSTRIAL, 0)}&nbsp;% + AJD. Si la empresa está dada de alta en
                actividades sujetas a IVA, puede deducir el IVA en la declaración trimestral (modelo 303).
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🔄</span> Autónomo compra nave de segunda mano</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Paga ITP al tipo general de su CCAA — salvo en Ceuta y Melilla, donde la cuota se bonifica
                un {BONIFICACION_CIUDADES} (art. 57 bis TRLITPAJD) para cualquier inmueble, también una
                nave, y en las comunidades con un tipo reducido para el inmueble con el que se inicia una
                actividad, como Aragón (lo indica el recuadro de la comunidad). El ITP no es
                deducible como IVA, pero sí se añade al valor de adquisición del activo.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">💡</span> IVA deducible: cuándo y cómo</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Solo si el comprador es sujeto pasivo de IVA y la nave se destina a la actividad económica.
                El IVA se recupera en la declaración trimestral, reduciendo el coste real de adquisición.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">📈</span> Vender nave con ganancia patrimonial</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si vendes la nave como persona física, la ganancia tributa en el IRPF base del ahorro
                ({formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo, 0)}-{formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo, 0)}&nbsp;%). Si vendes como empresa (IS), tributa en el Impuesto de Sociedades.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ específica nave industrial */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Preguntas frecuentes — Compra de nave industrial</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Primera de la lista a propósito: «escriturar» es como se teclea la pregunta,
                y hasta el 13/09/2026 el verbo no aparecía en ninguna de las seis apps. */}
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>{preguntaEscriturar(CASOS_ESCRITURAR.nave.inmueble)}</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                {respuestaEscriturar(CASOS_ESCRITURAR.nave)}
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>{PREGUNTA_IMPUESTO_COMPRA}</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>{RESPUESTA_IMPUESTO_COMPRA}</p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>{PREGUNTA_IVA_DEDUCIBLE}</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>{RESPUESTA_IVA_DEDUCIBLE}</p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Qué tipos de ITP aplican a una nave industrial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Los tipos reducidos de ITP por perfil del comprador (jóvenes, familias numerosas,
                discapacidad) son exclusivos de la vivienda. Para naves industriales y locales comerciales
                aplica el tipo general de la comunidad, que hoy va del {formatTipoNominal(RANGO_ITP_OTROS.min)}&nbsp;% al {formatTipoNominal(RANGO_ITP_OTROS.max)}&nbsp;%
                — el techo corresponde al tramo más alto de las comunidades con escala progresiva, así que una
                nave cara puede pagar un tipo efectivo superior al nominal de su comunidad. Hay dos salvedades.
                Alguna comunidad tiene tipos propios ligados a la actividad económica y no a la vivienda —en
                Aragón, por adquirir un inmueble para iniciar una actividad—, que esta calculadora no aplica:
                la nota de tu comunidad, en el recuadro de la calculadora, lo dice. Y en Ceuta y Melilla la
                cuota se bonifica un {BONIFICACION_CIUDADES} (art. 57 bis del TRLITPAJD), y ahí sí entra
                cualquier inmueble, también una nave.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Hay AJD en la compra de una nave industrial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                El AJD aplica en la compra de nave nueva (primera transmisión) junto con el IVA, igual que en
                cualquier otro inmueble. En segunda mano sin renunciar a la exención se paga ITP y no AJD —ahí
                el AJD solo se pagaría sobre la escritura de hipoteca, si la hay—. Pero si el comprador y el
                vendedor renuncian a la exención (tercera opción de «Tipo de transmisión»), la operación
                vuelve al IVA y sí devenga AJD sobre la propia compraventa, con varias comunidades aplicándole
                un tipo incrementado. El País Vasco, que exime del AJD la primera transmisión de una
                vivienda, sí lo cobra a una nave, y en Ceuta y Melilla se paga la mitad (bonificación del{' '}
                {BONIFICACION_CIUDADES} de la cuota, art. 57 bis.1 TRLITPAJD). Su base no es solo el precio:
                aunque el IVA se calcula sobre la contraprestación pactada, la base del AJD no puede ser
                inferior al valor de referencia catastral (art. 30.1 TRLITPAJD, redacción de la Ley 11/2021).
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Hay plusvalía municipal al vender una nave industrial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Sí. La plusvalía municipal (IIVTNU) se aplica al incremento del valor del suelo durante el
                tiempo de propiedad, independientemente de si el inmueble es residencial o industrial.
                Si no hay incremento real en el valor del terreno se produce un supuesto de no sujeción, no una exención (art. 104.5 TRLRHL, redacción del RDL 26/2021): el impuesto no llega a devengarse, pero hay que declararlo y acreditarlo con las escrituras de compra y venta.
              </p>
            </div>
          </div>
        </section>

        {/* Consejos para compradores de naves */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Consejos para compradores de naves industriales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">🔍</span>
              <strong>Verifica la calificación urbanística</strong>
              <p style={{ fontSize: '0.9rem' }}>
                Confirma que la nave tiene licencia de actividad compatible con tu uso previsto.
                Un cambio de uso puede implicar costes adicionales en obras y licencias.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📑</span>
              <strong>Consulta el régimen de IVA antes de comprar</strong>
              <p style={{ fontSize: '0.9rem' }}>
                {/* La segunda mano no es siempre ITP: entre empresarios cabe la renuncia a la
                    exención, que la app calcula en su tercera opción (hallazgo 1268; forma del
                    hallazgo B del 27/08/2026). */}
                Si tu actividad está sujeta a IVA y no exenta, el IVA de la primera mano ({formatNumber(IVA_NAVE_INDUSTRIAL, 0)}&nbsp;%)
                es deducible, y en segunda mano entre empresarios con derecho a deducción cabe la{' '}
                <strong>renuncia a la exención</strong>: la operación vuelve al IVA, que autoliquida el comprador
                (inversión del sujeto pasivo) y también es deducible. Sin renuncia, la segunda mano paga ITP, que no es
                deducible: una diferencia que pesa más en naves de alto valor. La renuncia es la
                tercera opción del selector.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">💼</span>
              <strong>Compra con empresa o a título personal</strong>
              <p style={{ fontSize: '0.9rem' }}>
                Comprar con sociedad puede facilitar la deducción de gastos (amortización, IBI, seguros).
                Comprar a título personal puede ser más sencillo pero menos eficiente fiscalmente.
                Analiza con tu asesor cuál te conviene.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📋</span>
              <strong>Guarda todos los justificantes</strong>
              {/* El IVA DEDUCIDO no puede ir en esta lista, y esta es justo la app cuyo público
                  declarado lo deduce: el art. 35.1.b) LIRPF admite los tributos «inherentes a la
                  adquisición» SATISFECHOS por el adquirente, y la norma de registro y valoración
                  2ª del PGC excluye del precio de adquisición los impuestos indirectos
                  «recuperables de la Hacienda Pública», que es lo que decide el beneficio en el
                  Impuesto de Sociedades que la frase menciona. Deducirlo en el 303 y volver a
                  restarlo de la ganancia lo cuenta dos veces e INFRAVALORA la ganancia. Dos
                  secciones más arriba la propia tarjeta «IVA deducible» ya dice que el IVA se
                  recupera (hallazgo 1176). */}
              <p style={{ fontSize: '0.9rem' }}>
                Conserva facturas de ITP, notaría, registro y reformas. Al vender, estos gastos
                incrementan el valor de adquisición y reducen la ganancia patrimonial o el beneficio
                en el Impuesto de Sociedades. El <strong>IVA soportado que te hayas deducido</strong>{' '}
                no cuenta aquí: al recuperarlo deja de ser un coste, y sumarlo otra vez al valor de
                adquisición lo contaría dos veces. Guarda igualmente sus facturas, que es lo que
                sostiene la deducción.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">⚠️</span>
            <strong>Limitaciones de este simulador</strong>
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column' as const, gap: '0.4rem' }}>
            <li>El IVA del {formatNumber(IVA_NAVE_INDUSTRIAL, 0)}&nbsp;% solo es deducible si el comprador es sujeto pasivo de IVA con actividad sujeta y no exenta.</li>
            <li>Los tipos de ITP y AJD pueden variar; verifica la normativa vigente de tu comunidad autónoma.</li>
            <li>El valor de referencia catastral puede ser la base imponible real del ITP si supera el precio escriturado, y también la del AJD de la obra nueva o de la renuncia: aunque el IVA se calcula sobre la contraprestación pactada, la base del AJD no puede ser inferior a ese valor (art. 30.1 TRLITPAJD, redacción de la Ley 11/2021). Aquí el AJD se calcula sobre el precio escrito.</li>
            <li>La renuncia a la exención de IVA en segunda mano SÍ se calcula, en la tercera opción de «Tipo de transmisión» (en Canarias, la del IGIC; en Ceuta y Melilla el IPSI no la admite y la opción se desactiva). Lo que esta calculadora no contempla son otras situaciones especiales: operaciones vinculadas, permutas, aportaciones no dinerarias a sociedades o transmisiones de unidad económica autónoma.</li>
            <li>Consulta siempre con tu asesor fiscal antes de cerrar la operación.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="simulador-gastos-compraventa-nave-industrial" />
      <Footer appName="simulador-gastos-compraventa-nave-industrial" />
    </div>
  );
}
