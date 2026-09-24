'use client';
// @disclaimer: DisclaimerCard severity="critical" — fiscal España estructural

import { useState, useMemo } from 'react';
import styles from './SimuladorTerrenoRustico.module.css';
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
  ENLACE_CATASTRO,
  RANGO_ITP_OTROS,
  TERRITORIOS_SIN_IVA,
  CIUDADES_CON_BONIFICACION,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  sumarLineasVisibles,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
} from '@/data/itp-ccaa';
import { FISCAL_INMUEBLES_META, TRAMOS_GANANCIAS_PATRIMONIALES_2025, PORCENTAJES_IVA } from '@/data/fiscal';

// ===== TIPOS =====
// Terreno rústico no edificable: exento de IVA → ITP (regla general).
// Excepción: renuncia a la exención de IVA entre profesionales → IVA 21% (ISP) + AJD.
type TipoOperacion = 'itp' | 'renuncia';

interface ResultadosComprador {
  precioInmueble: number;
  impuestoTransmision: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  /** En Canarias, Ceuta y Melilla no rige el IVA: no se inventa cifra. */
  impuestoNoCalculado: boolean;
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
  ivaRecuperable: boolean;
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

/**
 * IVA del terreno: el tipo GENERAL del art. 90 LIVA.
 *
 * ⚠️ 13/09/2026 — se leía de `IVA_INMUEBLES_2025.local`, que data/fiscal documenta como «IVA
 * local comercial», y un terreno no es un local (hallazgo 805 del Inspector). Hoy ambas valen
 * 21, así que ninguna cifra cambia: existen separadas precisamente para poder divergir, y el
 * día que se mueva el tipo del local sin moverse el general esta app seguiría al equivocado
 * sin que ningún candado lo avisara. Es la reparación que el 11/09 sí llegó a la hermana
 * `simulador-gastos-compraventa-solar`.
 */
const IVA_RENUNCIA = PORCENTAJES_IVA.general;

// Extremos de la base del ahorro del IRPF. Derivados de data/fiscal para que el bloque
// educativo no pueda contradecir a la escala el día que ésta se mueva (hallazgo 371).
const TIPO_AHORRO_MIN = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
const TIPO_AHORRO_MAX = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo;

/**
 * Dónde NO existe la renuncia a la exención (24/09/2026, con el hallazgo 1605 y la decisión del
 * 1584 de la hermana nave-industrial). Verificado en el BOE:
 *  · Canarias SÍ la tiene: la entrega de terrenos rústicos está exenta del IGIC (art. 50.Uno.20.º
 *    Ley canaria 4/2012, BOE-A-2012-9282) y esa exención es renunciable entre empresarios con
 *    derecho a deducir (art. 50.Cinco), con inversión del sujeto pasivo (art. 19.1.2.º g Ley
 *    20/1991, BOE-A-1991-14463) y sin TPO (art. 4.4 de esa misma ley). El recuadro decía que
 *    «ni la renuncia a la exención ni la inversión del sujeto pasivo» entraban en juego mientras
 *    la app calculaba justo su consecuencia (AJD en lugar de ITP).
 *  · Ceuta y Melilla NO: la Ley 8/1991 del IPSI (BOE-A-1991-7645) toma sus exenciones de la ley
 *    del IVA (art. 7) sin regular ninguna renuncia, y prohíbe deducir el IPSI soportado en la
 *    compra de inmuebles (art. 20.3), que es lo que la renuncia del art. 20.Dos LIVA exige. La
 *    finca exenta paga TPO (art. 3.c Ley 8/1991 y art. 7.5 TRLITPAJD), con la bonificación.
 */
const TERRITORIOS_SIN_RENUNCIA: readonly ComunidadAutonoma[] = ['ceuta', 'melilla'];

/** Las comunidades con tipo de AJD propio de la renuncia VERIFICADO en su norma (motor). */
const CCAA_CON_AJD_DE_RENUNCIA = Object.values(ITP_CCAA)
  .filter((c) => c.ajdRenuncia !== undefined)
  .map((c) => c.nombre);

/**
 * La nota del sello de datos, con el rango de lo que paga una FINCA RÚSTICA. El sello común
 * habla del ITP de la vivienda (del 4 % vasco hacia arriba), que no es el de esta app.
 */
const NOTA_DATOS = `El ITP de una finca rústica va del ${formatTipoNominal(RANGO_ITP_OTROS.min)}% al ${formatTipoNominal(RANGO_ITP_OTROS.max)}% según la comunidad autónoma, contando el tramo más alto de las que aplican escala progresiva; en Ceuta y Melilla la cuota se bonifica un ${formatTipoNominal(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)} % (art. 57 bis TRLITPAJD). Sin contar las reducciones agrarias, que no se calculan. Los tipos indicados son orientativos: consulta el de tu comunidad antes de firmar.`;

export default function SimuladorTerrenoRusticoPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion>('itp');
  const [gastosGestoria, setGastosGestoria] = useState('400');

  /**
   * La operación que se CALCULA. En Ceuta y Melilla la renuncia no existe (ver
   * TERRITORIOS_SIN_RENUNCIA): allí se calcula la compra habitual y el botón de la renuncia se
   * desactiva. Se deriva en lugar de reescribir el estado para no perder la elección del
   * usuario si vuelve a una comunidad donde la renuncia sí existe.
   */
  const renunciaImposible = TERRITORIOS_SIN_RENUNCIA.includes(ccaa);
  const operacion: TipoOperacion = tipoOperacion === 'renuncia' && renunciaImposible ? 'itp' : tipoOperacion;
  const esRenuncia = operacion === 'renuncia';

  /**
   * Un precio ESCRITO pero ilegible no es un precio vacío (grupo B del testigo de familia,
   * 23/09/2026). El panel se abstiene igual —no hay cifra que publicar—, pero el mensaje
   * pedía «Introduce el precio…» mientras el usuario veía su «2.000.50» escrito en el campo.
   */
  const precioIlegible =
    precioVenta.trim() !== '' && !Number.isFinite(parseSpanishNumber(precioVenta));

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    // Sobre el precio que se PINTA, al céntimo: «0,004» se pintaba «0,00 €» y publicaba un
    // desglose entero (forma del hallazgo 1601 de la hermana solar).
    if (!Number.isFinite(precio) || Math.round(precio * 100) <= 0) return null;

    // Un gasto no puede ser negativo: el min={0} de NumberInput solo corrige al salir del
    // campo, y hasta entonces la cifra entraba en el total contradiciendo a su desglose.
    const gestoria = Math.max(0, parseSpanishNumberOr(gastosGestoria));
    /** Un importe ILEGIBLE no es un cero: es un dato que falta (hallazgo 1199). */
    const gestoriaLegible =
      gastosGestoria.trim() === '' || Number.isFinite(parseSpanishNumber(gastosGestoria));

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    let ivaRecuperable = false;
    let ajd = 0;
    let impuestoNoCalculado = false;

    const territorioSinIva = TERRITORIOS_SIN_IVA[ccaa];

    // AJD de la escritura con renuncia: el tipo propio de la renuncia donde está verificado en
    // la norma (Valencia, 2 %: hallazgo 1603) y, si no, el general de lo que no es vivienda.
    const contextoAJD = { objeto: 'otro' as const, renunciaExencionIVA: true };

    if (operacion === 'renuncia') {
      if (territorioSinIva) {
        // Canarias (IGIC): allí el IVA no existe, así que no se liquida un 21 % inventado ni
        // se cierra el total como si estuviera completo. La renuncia es a la exención del IGIC
        // (art. 50.Cinco Ley 4/2012) y no hay TPO: el AJD sí se devenga y se sigue calculando.
        // Ceuta y Melilla no llegan aquí: el IPSI no tiene renuncia (TERRITORIOS_SIN_RENUNCIA).
        tipoImpuesto = territorioSinIva.impuesto;
        impuestoNoCalculado = true;
      } else {
        // Renuncia a la exención de IVA (Art. 20.Dos LIVA) → IVA 21% con inversión del sujeto pasivo + AJD
        tipoImpuesto = 'IVA (renuncia · ISP)';
        porcentaje = IVA_RENUNCIA;
        impuesto = precio * (porcentaje / 100);
        ivaRecuperable = true;
      }
      ajd = calcularAJD(precio, ccaa, contextoAJD);
    } else {
      // Regla general: terreno rústico exento de IVA → ITP tipo general de la CCAA.
      // Sin tipo forzado: así se aplica la escala progresiva o el umbral de la comunidad
      // (Valencia: el 11 % sobre TODO el valor por encima del millón, hallazgo 1602), y
      // `'otro'` le da el tipo de lo que no es vivienda (País Vasco: 7 %).
      impuesto = calcularITP(precio, ccaa, 'otro');
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
      ivaRecuperable,
    };
  }, [precioVenta, ccaa, operacion, gastosGestoria]);

  const datosCcaaActual = ITP_CCAA[ccaa];
  /** Ceuta y Melilla bonifican el 50 % de la cuota (art. 57 bis TRLITPAJD), y hay que decirlo. */
  const ciudadBonificada = CIUDADES_CON_BONIFICACION.includes(ccaa);
  /** Canarias, Ceuta y Melilla: allí no rige el IVA, sino el IGIC o el IPSI. */
  const territorioActualSinIva = TERRITORIOS_SIN_IVA[ccaa];
  /**
   * Única rama en la que el impuesto en pantalla es IVA (la renuncia fuera de Canarias, Ceuta y
   * Melilla) y, por tanto, su base es la contraprestación pactada (art. 78 Ley 37/1992), no «el
   * mayor» con el valor de referencia, que es la base mínima del ITP (forma del 1273 de solar).
   */
  const conIvaEnPantalla = esRenuncia && !territorioActualSinIva;
  /** El impuesto cuya exención se renuncia: el IVA, el IGIC en Canarias y, en Ceuta y Melilla, ninguno. */
  const impuestoDeLaRenuncia = territorioActualSinIva?.impuesto ?? 'IVA';
  /**
   * Los tipos del recuadro de la comunidad, del motor: el ITP de lo que no es vivienda al precio
   * escrito (el umbral valenciano lo cambia) y el AJD de la RENUNCIA, que es el único AJD que
   * esta app llega a cobrar (Valencia: 2 %, hallazgo 1603).
   */
  const precioLeido = parseSpanishNumber(precioVenta);
  const itpGeneralRotulo = tipoGeneralITP(
    ccaa,
    'otro',
    Number.isFinite(precioLeido) && precioLeido > 0 ? precioLeido : 0
  );
  const ajdRenunciaRotulo = tipoAJD(ccaa, { objeto: 'otro', renunciaExencionIVA: true });
  /** Escala progresiva o umbral, con las palabras de cada uno (hallazgo 1602). */
  const subidaITP = describirSubidaITP(ccaa);
  /**
   * A la cifra final le falta algo: el impuesto indirecto sin calcular, una gestoría ilegible
   * (hallazgo 1604) o la parte de la notaría de libre acuerdo (1599). Un solo criterio para los
   * dos títulos, con las mismas palabras que el caso del IGIC/IPSI (1277).
   */
  const cierreParcial =
    resultadosComprador !== null &&
    (resultadosComprador.impuestoNoCalculado ||
      !resultadosComprador.gestoriaLegible ||
      resultadosComprador.notariaLibre);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span aria-hidden="true" className={styles.heroIcon}>🌾</span>
        <h1 className={styles.title}>Simulador de Gastos de Compra de Finca Rústica</h1>
        <p className={styles.subtitle}>
          Calcula el ITP, la notaría y el registro al comprar una finca o terreno rústico en España — sin
          plusvalía municipal, con la excepción de la renuncia a la exención de IVA entre profesionales
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-terreno-rustico"
        collapsible={false}
      />

      <DataReference
        normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={NOTA_DATOS}
      />

      {/* Aviso clave: exención de IVA y sin plusvalía */}
      <div className={styles.ivaAviso} role="note">
        <strong><span aria-hidden="true">💡</span> Clave de la finca rústica:</strong> el terreno rústico no edificable está <strong>exento de
        IVA</strong>, así que por norma general se paga <strong>ITP</strong>, no IVA. Y al ser suelo rústico,
        el vendedor <strong>no paga plusvalía municipal</strong> (el IIVTNU solo grava suelo urbano).
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de operación */}
          <div className={styles.inputGroup}>
            {/* Sin htmlFor no hay control al que apuntar: son dos botones. Con
                role="group" + aria-labelledby el lector de pantalla dice de qué elección
                forman parte, que aquí es nada menos que el régimen fiscal. */}
            <span className={styles.label} id="etiqueta-operacion">Tipo de operación</span>
            <div className={styles.transmisionGrid} role="group" aria-labelledby="etiqueta-operacion">
              <button
                type="button"
                className={`${styles.transmisionBtn} ${operacion === 'itp' ? styles.active : ''}`}
                onClick={() => setTipoOperacion('itp')}
                aria-pressed={operacion === 'itp'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🔄</span>
                <span>Compra habitual</span>
                <span className={styles.transmisionSub}>Exenta de {impuestoDeLaRenuncia} → paga ITP</span>
              </button>
              {/* En Canarias la renuncia es a la exención del IGIC, y el botón lo dice (hallazgo
                  1605). En Ceuta y Melilla no existe (TERRITORIOS_SIN_RENUNCIA): se desactiva y
                  dice por qué, en vez de calcular una opción que la norma no tiene. */}
              <button
                type="button"
                className={`${styles.transmisionBtn} ${operacion === 'renuncia' ? styles.active : ''}`}
                onClick={() => setTipoOperacion('renuncia')}
                aria-pressed={operacion === 'renuncia'}
                disabled={renunciaImposible}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🤝</span>
                <span>Con renuncia a la exención {impuestoDeLaRenuncia}</span>
                {/* El subtítulo no puede prometer un IVA que allí no se liquida, ni escribir
                    su tipo a mano teniéndolo en data/fiscal (hallazgos 803 y 806). */}
                <span className={styles.transmisionSub}>
                  {renunciaImposible
                    ? 'No existe en el IPSI: paga ITP'
                    : territorioActualSinIva
                      ? `Paga ${territorioActualSinIva.impuesto} (ISP) + AJD`
                      : `IVA ${formatNumber(IVA_RENUNCIA, 0)}% (ISP) + AJD`}
                </span>
              </button>
            </div>
          </div>

          {/* En Ceuta y Melilla la opción está desactivada, y se dice por qué con la norma. */}
          {renunciaImposible && territorioActualSinIva && (
            <p className={styles.renunciaAviso} role="note">
              <span aria-hidden="true">ℹ️</span> En {datosCcaaActual.nombre} no rige el IVA, sino el{' '}
              {territorioActualSinIva.impuesto} ({territorioActualSinIva.nombre}), y en él{' '}
              <strong>no existe la renuncia a la exención</strong>: la Ley 8/1991 toma sus exenciones de la
              ley del IVA (art. 7) sin regular ninguna renuncia, y no deja deducir el{' '}
              {territorioActualSinIva.impuesto} soportado en la compra de un inmueble (art. 20.3), que es lo
              que la renuncia exige en la ley del IVA (art. 20.Dos). La finca paga siempre ITP, con la
              bonificación de la cuota.
            </p>
          )}

          {/*
            El recuadro afirmaba en Canarias, Ceuta y Melilla que «el IVA se autoliquida por
            inversión del sujeto pasivo», justo encima de <AvisoTerritorioSinIva> («no se aplica el
            IVA») y junto a la tarjeta «IGIC · No calculado» (hallazgo 1276). Y después, que «ni la
            renuncia a la exención ni la inversión del sujeto pasivo» entraban en juego en Canarias,
            con el título «Renuncia a la exención en Canarias» y la app calculando su consecuencia
            (hallazgo 1605): el IGIC tiene su propia renuncia, verificada en el BOE.
          */}
          {esRenuncia && (
            <div className={styles.renunciaAviso} role="note">
              {territorioActualSinIva ? (
                <>
                  <strong><span aria-hidden="true">⚠️</span> Renuncia a la exención del {territorioActualSinIva.impuesto} (art. 50.Cinco Ley canaria 4/2012):</strong>{' '}
                  en {datosCcaaActual.nombre} <strong>no se devenga IVA</strong> —rige el{' '}
                  {territorioActualSinIva.impuesto}—, pero la entrega de terrenos rústicos también está exenta
                  del {territorioActualSinIva.impuesto} (art. 50.Uno.20.º) y esa exención se puede renunciar
                  entre empresarios con derecho a deducción. El{' '}
                  {territorioActualSinIva.impuesto} lo autoliquida el comprador por{' '}
                  <strong>inversión del sujeto pasivo</strong> (art. 19.1.2.º g Ley 20/1991) y la operación deja
                  de pagar ITP (art. 4.4 de esa misma ley). Este simulador no cuantifica el{' '}
                  {territorioActualSinIva.impuesto}; sí el AJD de la escritura, con el tipo general de la
                  comunidad —algunas le aplican un <strong>tipo incrementado</strong> cuando hay renuncia—.
                </>
              ) : (
                <>
                  <strong><span aria-hidden="true">⚠️</span> Renuncia a la exención de IVA (Art. 20.Dos LIVA):</strong> solo es posible cuando
                  comprador y vendedor son empresarios o profesionales con derecho a deducción (por ejemplo, un
                  agricultor en régimen general que afecta la finca a su explotación). El IVA se autoliquida por
                  <strong> inversión del sujeto pasivo</strong> y es deducible si tienes derecho. A cambio, la
                  escritura tributa por AJD
                  {ajdRenunciaRotulo.motivo === 'renuncia' ? (
                    <>
                      , al <strong>tipo propio de la renuncia</strong> en {datosCcaaActual.nombre} (
                      {formatTipoNominal(ajdRenunciaRotulo.tipo)}%), que es el que se aplica aquí.
                    </>
                  ) : (
                    <>
                      , que <strong>muchas CCAA aplican a un tipo incrementado</strong> en la renuncia; este
                      simulador usa el AJD general.
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Precio */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio de compra de la finca rústica"
            placeholder="80000"
            helperText={
              conIvaEnPantalla
                ? 'Precio pactado en la escritura (la base del IVA es la contraprestación, art. 78 Ley 37/1992)'
                : 'Precio escriturado o valor de referencia catastral (el mayor de ambos)'
            }
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="select-ccaa">
              Comunidad Autónoma (ubicación de la finca)
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

          <AvisoTerritorioSinIva ccaa={ccaa} aplica={esRenuncia} />

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span className={styles.infoCcaaIcon} aria-hidden="true">📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                {/* El de lo que no es vivienda, al precio escrito: 7 % en el País Vasco y, en
                    Valencia, el 11 % si el precio pasa del millón (hallazgo 1602). */}
                <span className={styles.infoCcaaValue}>{formatTipoNominal(itpGeneralRotulo)}%</span>
              </div>
              {/*
                Sin esta casilla, el recuadro anunciaba «ITP General 6%» y la tarjeta cobraba el
                3%, sin que nada explicara el salto: la cuota era correcta y el usuario no podía
                reconstruirla (hallazgo 729).
              */}
              {ciudadBonificada && (
                <div className={styles.infoCcaaItem}>
                  <span className={styles.infoCcaaLabel}>Bonificación en cuota</span>
                  <span className={styles.infoCcaaValue}>
                    −{formatTipoNominal(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)}%
                  </span>
                </div>
              )}
              {/* El único AJD que esta app llega a cobrar es el de la renuncia, y se rotula
                  como tal: con el tipo propio donde está verificado (Valencia, 2 %: hallazgo
                  1603). En Ceuta y Melilla no hay renuncia, así que no hay AJD que cobrar. */}
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD (renuncia)</span>
                <span className={styles.infoCcaaValue}>
                  {renunciaImposible ? 'No aplica' : `${formatTipoNominal(ajdRenunciaRotulo.tipo)}%`}
                </span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>{impuestoDeLaRenuncia} (renuncia)</span>
                <span className={styles.infoCcaaValue}>
                  {renunciaImposible
                    ? 'No existe'
                    : territorioActualSinIva
                      ? 'No calculado'
                      : `${formatNumber(IVA_RENUNCIA, 0)}%`}
                </span>
              </div>
            </div>
            {/* Escala o umbral, con las palabras del motor: Valencia se anunciaba como «escala
                progresiva (9% → 11%)» y el 11 % grava TODO el valor, no el exceso (hallazgo 1602). */}
            {subidaITP && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> <strong>Tipo según el valor:</strong> {subidaITP}.
              </p>
            )}
            <p className={styles.infoCcaaNote}>
              Puede haber <strong>reducciones de ITP</strong> para explotaciones agrarias prioritarias y jóvenes
              agricultores (Ley 19/1995). Este simulador aplica el tipo general; confirma la reducción con tu CCAA.
            </p>
          </div>

          {/* Gestoría */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría (€)"
              placeholder="400"
              helperText="Típico en operaciones rústicas: 300-600 €"
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
                title="Precio de la finca rústica"
                value={formatCurrency(resultadosComprador.precioInmueble)}
                variant="default"
                icon="🌾"
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
                    ? `En ${datosCcaaActual.nombre} no rige el IVA: la operación tributa por el ${resultadosComprador.tipoImpuesto}, que este simulador no calcula`
                    : esRenuncia
                      ? 'Autorrepercutido por inversión del sujeto pasivo — deducible si eres sujeto pasivo de IVA'
                      : ciudadBonificada
                        ? `Tipo general del ${formatTipoNominal(itpGeneralRotulo)}% con la bonificación del ${formatTipoNominal(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)}% de la cuota ya aplicada (art. 57 bis TRLITPAJD). No incluye posibles reducciones agrarias`
                        : 'Tipo general de la CCAA (posibles reducciones agrarias no incluidas)'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  // Tipo EFECTIVO, no el nominal de la tabla: en Ceuta y Melilla la cuota
                  // gradual se bonifica al 50 % (art. 57 bis.1 TRLITPAJD) y el nominal
                  // desmentía por el doble al importe de al lado, mientras la tarjeta del ITP
                  // de la misma pantalla sí llevaba el efectivo (hallazgo 802; reparado así en
                  // garaje, trastero, local-comercial y nave-industrial por el 447).
                  title={`AJD (${formatNumber(
                    resultadosComprador.precioInmueble > 0
                      ? (resultadosComprador.ajd / resultadosComprador.precioInmueble) * 100
                      : resultadosComprador.ajdTipo.tipo,
                    2
                  )}%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
                  // Donde el tipo de la renuncia está verificado, se aplica y se dice; el aviso
                  // genérico queda para las comunidades en las que se usa el general (1603).
                  description={
                    resultadosComprador.ajdTipo.motivo === 'renuncia'
                      ? `Tipo propio de la renuncia a la exención en ${datosCcaaActual.nombre}`
                      : 'Tipo general de la comunidad: algunas CCAA aplican un tipo de AJD incrementado en la renuncia'
                  }
                />
              )}

              <ResultCard
                title="Gastos de notaría (IVA incluido)"
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
                // Le falta el mismo IGIC/IPSI que al coste total de debajo, que ya se rotula
                // parcial (hallazgo 1277; forma de d787b81b en las hermanas). Con el mismo
                // criterio, la gestoría ilegible (1604) y la notaría de libre acuerdo (1599).
                title={cierreParcial ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales'}
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
                    resultadosComprador.notariaLibre
                      ? `SIN la parte de la notaría de libre acuerdo (el valor que excede de ${formatCurrency(LIMITE_ARANCEL_NOTARIAL)})`
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
                  cierreParcial
                    ? `No incluye ${[
                        resultadosComprador.impuestoNoCalculado ? `el ${resultadosComprador.tipoImpuesto}` : null,
                        resultadosComprador.gestoriaLegible ? null : 'la gestoría, que no se ha podido leer',
                        resultadosComprador.notariaLibre ? 'la parte de la notaría de libre acuerdo' : null,
                      ]
                        .filter((x): x is string => x !== null)
                        .join(' ni ')}: ${resultadosComprador.gestoriaLegible ? 'el coste real puede ser mayor' : 'el coste real será mayor'}${
                        // El aviso del ilegible se SUMA a la salvedad del IVA deducible, no la
                        // reemplaza: sin ella, «será mayor» es falso para quien deduce el IVA
                        // (forma del hallazgo 1272 de solar).
                        resultadosComprador.ivaRecuperable
                          ? ' (precio + gastos antes de deducir el IVA si tienes derecho)'
                          : ''
                      }`
                    : resultadosComprador.ivaRecuperable
                      ? 'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)'
                      : 'Precio + todos los gastos de la operación'
                }
              />
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>
                {precioIlegible
                  ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio de la finca rústica para ver el desglose de gastos, con coma decimal (80.000 o 80000,50)`
                  : 'Introduce el precio de la finca rústica para ver el desglose de gastos'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía fiscal para la compra de una finca rústica"
        subtitle="Por qué se paga ITP y no IVA, y por qué no hay plusvalía municipal"
        icon="📚"
      >
        {/* Tabla comparativa rústico vs solar */}
        <section>
          <h2>Finca rústica frente a solar edificable</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                {/* El azul de marca con texto blanco da 4,11:1 a este tamaño; --hero-bg
                    (#1a5278), que es el azul marino de la misma paleta, da 8,59:1 (hallazgo 804). */}
                <tr style={{ background: 'var(--hero-bg)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Concepto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Finca rústica</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Solar edificable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Impuesto general</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700, color: 'var(--primary-texto)' }}>ITP</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>IVA (empresario) o ITP (particular)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>¿Sujeto a IVA por empresario?</td>
                  <td className={styles.celdaNo} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>No (exento)</td>
                  {/* El tipo sale de data/fiscal y la excepción territorial va con él, como en la
                      FAQ de esta misma página (hallazgos 1278 y 1279). */}
                  <td className={styles.celdaSi} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>
                    Sí ({formatNumber(IVA_RENUNCIA, 0)}% + AJD); IGIC o IPSI en Canarias, Ceuta y Melilla
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Plusvalía municipal</td>
                  {/* El color marca la RESPUESTA, no si conviene: hasta el 13/09/2026 el verde
                      señalaba «No aplica» en esta fila y el rojo «No (exento)» en la de arriba, de
                      modo que el mismo color decía cosas opuestas en filas contiguas (hallazgo 804). */}
                  <td className={styles.celdaNo} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700 }}>No aplica</td>
                  {/* Condicionada al incremento, como en la hermana solar (forma del hallazgo 1597). */}
                  <td className={styles.celdaSi} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>Sí, si hubo incremento real del valor del suelo (art. 104.5 TRLRHL)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px' }}>Renuncia a la exención de IVA</td>
                  {/* Canarias sí la tiene (del IGIC) y Ceuta y Melilla no (IPSI): hallazgo 1605. */}
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Posible entre profesionales (en Canarias, la del IGIC; el IPSI de Ceuta y Melilla no la admite)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>No procede (ya es IVA)</td>
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
              <strong><span aria-hidden="true">🌾</span> Particular compra tierra para uso propio</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Paga ITP al tipo general de su comunidad. Sin IVA y sin plusvalía municipal. Notaría y registro
                se calculan sobre el valor escriturado o el de referencia catastral, el mayor.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🚜</span> Agricultor amplía su explotación</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si es titular de explotación prioritaria o joven agricultor, puede acceder a reducciones de ITP
                (Ley 19/1995). Conviene verificar los requisitos y el porcentaje con la comunidad autónoma.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🤝</span> Empresa compra finca a otra empresa</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si ambas tienen derecho a deducción, el vendedor puede renunciar a la exención de IVA. La compra
                pasa a IVA {formatNumber(IVA_RENUNCIA, 0)}% con inversión del sujeto pasivo, que el comprador
                autoliquida y deduce. En Canarias no rige el IVA, pero la renuncia existe igual sobre la
                exención del IGIC, que esta calculadora no cifra; en Ceuta y Melilla el IPSI no la admite y la
                finca paga siempre ITP.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">📈</span> Vender la finca con ganancia</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                No hay plusvalía municipal, pero la ganancia patrimonial tributa en el IRPF del vendedor (base
                del ahorro, {formatNumber(TIPO_AHORRO_MIN, 0)}%-{formatNumber(TIPO_AHORRO_MAX, 0)}%) o en el
                Impuesto de Sociedades si vende una empresa.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Preguntas frecuentes — Compra de finca rústica</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Primera de la lista a propósito: «escriturar» es como se teclea la pregunta,
                y hasta el 13/09/2026 el verbo no aparecía en ninguna de las seis apps. */}
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>{preguntaEscriturar(CASOS_ESCRITURAR.rustica.inmueble)}</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                {respuestaEscriturar(CASOS_ESCRITURAR.rustica)}
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Se paga IVA o ITP al comprar una finca rústica?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Por regla general, ITP. El terreno rústico no edificable está exento de IVA (Art. 20.Uno.20º LIVA),
                incluso cuando lo vende un empresario. Solo se paga IVA si hay renuncia a la exención entre
                profesionales con derecho a deducción — y en Canarias, Ceuta y Melilla ni siquiera entonces:
                allí rige el IGIC o el IPSI. En Canarias la renuncia es a la exención del IGIC (art. 50.Cinco
                Ley canaria 4/2012), que esta calculadora no cifra; en Ceuta y Melilla el IPSI no la admite
                (Ley 8/1991, arts. 7 y 20.3), así que allí se paga siempre ITP.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Por qué no hay plusvalía municipal en una finca rústica?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Porque la plusvalía municipal (IIVTNU) solo grava el incremento de valor de los terrenos de
                naturaleza urbana. El suelo rústico queda fuera del hecho imponible, así que su transmisión no
                genera este impuesto para el vendedor.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Qué es la renuncia a la exención de IVA en tierras rústicas?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Es la opción (Art. 20.Dos LIVA) por la que el vendedor renuncia a la exención y la operación pasa
                a tributar por IVA al {formatNumber(IVA_RENUNCIA, 0)}% en lugar de ITP, con inversión del sujeto
                pasivo. Solo cabe entre empresarios o profesionales con derecho a deducir el IVA; interesa cuando
                el comprador puede deducirlo y así evita un ITP no recuperable. En Canarias, Ceuta y Melilla no
                hay IVA al que renunciar: allí la operación va por IGIC o IPSI. El IGIC tiene su propia renuncia,
                con las mismas condiciones (art. 50.Cinco Ley canaria 4/2012) y también con inversión del sujeto
                pasivo; el IPSI no tiene ninguna.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Qué reducciones de ITP existen para explotaciones agrarias?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                La Ley 19/1995 prevé reducciones para la adquisición de fincas por titulares de explotaciones
                prioritarias y por jóvenes agricultores en su primera instalación, y algunas comunidades tienen
                tipos reducidos propios. Los porcentajes y requisitos varían, así que conviene confirmarlos con
                la normativa de cada comunidad autónoma.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Sobre qué valor se calcula el ITP de una finca rústica?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Sobre el valor de referencia de la finca o el precio escriturado, el que sea mayor. Si no existe
                valor de referencia catastral para ese inmueble, se toma el valor de mercado. Conviene consultar
                el valor de referencia en la Sede del Catastro antes de firmar.
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
            <li>Aplica el tipo general de ITP: no calcula las reducciones para explotaciones agrarias prioritarias ni jóvenes agricultores, que pueden rebajar notablemente el impuesto.</li>
            <li>Válido para terreno rústico no edificable; si el suelo es urbanizable o edificable, la fiscalidad es la de un solar (IVA/ITP + plusvalía municipal).</li>
            <li>La renuncia a la exención de IVA solo es válida entre empresarios o profesionales con derecho a deducción, y muchas CCAA aplican un AJD incrementado: aquí se usa el tipo propio de la renuncia donde está verificado en su norma ({CCAA_CON_AJD_DE_RENUNCIA.join(', ')}) y el general en las demás. En Ceuta y Melilla el IPSI no admite la renuncia.</li>
            <li>El valor de referencia catastral puede ser la base imponible del ITP si supera el precio escriturado.</li>
            <li>Los tipos pueden variar; verifica la normativa vigente de tu comunidad autónoma y consulta con tu asesor antes de firmar.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-terreno-rustico')} />
      <ShareCard appName="simulador-gastos-compraventa-terreno-rustico" />
      <Footer appName="simulador-gastos-compraventa-terreno-rustico" />
    </div>
  );
}
