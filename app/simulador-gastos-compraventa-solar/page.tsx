'use client';
// @disclaimer: DisclaimerCard severity="critical" — fiscal España estructural

import { useState, useMemo } from 'react';
import styles from './SimuladorSolar.module.css';
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
  RANGO_AJD_OTROS,
  RANGO_ITP_OTROS,
  TERRITORIOS_SIN_IVA,
  CIUDADES_CON_BONIFICACION,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  sumarLineasVisibles,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
} from '@/data/itp-ccaa';
import { FISCAL_INMUEBLES_META, PORCENTAJES_IVA } from '@/data/fiscal';

// ===== TIPOS =====
// Solar / terreno edificable (suelo urbano):
//  - vendedor empresario/promotor → IVA 21% + AJD
//  - vendedor particular → ITP tipo general
type TipoVendedor = 'particular' | 'empresario';

interface ResultadosComprador {
  precioInmueble: number;
  impuestoTransmision: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  /** En Canarias, Ceuta y Melilla no rige el IVA: no se inventa cifra. */
  impuestoNoCalculado: boolean;
  /** Se ha aplicado la bonificación del 50 % de Ceuta y Melilla (art. 57 bis TRLITPAJD). */
  bonificado: boolean;
  ajd: number;
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
 * IVA del solar: el tipo GENERAL del art. 90 LIVA.
 *
 * Sale de data/fiscal para no divergir en silencio cuando cambie allí (hallazgo 163). Y sale
 * de `PORCENTAJES_IVA.general` y no de `IVA_INMUEBLES_2025.local` —que es el IVA del LOCAL
 * COMERCIAL— porque un solar no es un local: hoy ambas valen 21, así que el importe en pantalla
 * no cambia, pero dos constantes para un único dato existen precisamente para poder divergir, y
 * el día que se mueva el tipo del local sin moverse el general el solar habría seguido al
 * equivocado sin que ningún candado lo avisara (hallazgo 734, misma forma que el 641).
 */
const IVA_SOLAR = PORCENTAJES_IVA.general;

/** El 50 % del art. 57 bis TRLITPAJD, derivado de la constante que aplica el motor. */
const BONIFICACION_CIUDADES = `${formatTipoNominal(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)} %`;

/**
 * La nota del sello de datos, con el rango de lo que paga un SOLAR. El sello común habla del
 * ITP de la vivienda (del 4 % vasco hacia arriba), que no es el de esta app, y callaba la
 * bonificación que la app sí aplica en Ceuta y Melilla: el suelo publicado quedaba por encima
 * del 3 % efectivo que se cobra allí (hallazgo 1593).
 */
const NOTA_DATOS = `El ITP de un solar va del ${formatTipoNominal(RANGO_ITP_OTROS.min)}% al ${formatTipoNominal(RANGO_ITP_OTROS.max)}% según la comunidad autónoma, contando el tramo más alto de las que aplican escala progresiva; en Ceuta y Melilla la cuota se bonifica un ${BONIFICACION_CIUDADES} (art. 57 bis TRLITPAJD). Los tipos indicados son orientativos: consulta el de tu comunidad antes de firmar.`;

export default function SimuladorSolarPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoVendedor, setTipoVendedor] = useState<TipoVendedor>('particular');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  const esEmpresario = tipoVendedor === 'empresario';

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
    // La guarda mira el precio que se PINTA, al céntimo (hallazgo 1601): «0,004» pasaba el
    // `precio <= 0`, se pintaba «0,00 €» y publicaba un desglose entero con un 18.272.250 %
    // sobre el precio, cuando el «0» escrito devuelve el marcador.
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

    if (tipoVendedor === 'empresario') {
      if (territorioSinIva) {
        // Canarias (IGIC), Ceuta y Melilla (IPSI): allí el IVA no existe, así que no se
        // liquida un 21 % inventado ni se cierra un total como si fuera completo. El AJD
        // sí se devenga, y por eso se sigue calculando.
        tipoImpuesto = territorioSinIva.impuesto;
        impuestoNoCalculado = true;
      } else {
        // Vendedor promotor/empresario: solar sujeto a IVA 21% + AJD
        tipoImpuesto = 'IVA';
        porcentaje = IVA_SOLAR;
        impuesto = precio * (porcentaje / 100);
        ivaRecuperable = true;
      }
      // El solar edificable no está exento de IVA: no hay renuncia, así que el AJD es el
      // general del objeto `'otro'` (País Vasco, 0,5 %: la exención foral es solo de la primera
      // vivienda, hallazgo 1592).
      ajd = calcularAJD(precio, ccaa, { objeto: 'otro' });
    } else {
      // Vendedor particular: ITP tipo general de la CCAA.
      // Sin tipo forzado: así se aplica la escala progresiva o el umbral de la comunidad, y
      // `'otro'` le da el tipo de lo que no es vivienda (País Vasco: 7 %, no el 4 %).
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
      bonificado: tipoVendedor === 'particular' && CIUDADES_CON_BONIFICACION.includes(ccaa),
      ajd,
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
  }, [precioVenta, ccaa, tipoVendedor, gastosGestoria]);

  const datosCcaaActual = ITP_CCAA[ccaa];
  /** Canarias, Ceuta y Melilla: allí no rige el IVA, sino el IGIC o el IPSI. */
  const territorioActualSinIva = TERRITORIOS_SIN_IVA[ccaa];
  /**
   * Única rama en la que el impuesto en pantalla es IVA y, por tanto, su base es la
   * contraprestación pactada (art. 78 Ley 37/1992), no «el mayor» con el valor de referencia,
   * que es la base mínima del ITP (hallazgo 1273; misma forma que el 601 de nave-industrial).
   */
  const conIvaEnPantalla = esEmpresario && !territorioActualSinIva;
  /** Ceuta y Melilla bonifican el 50 % de la cuota (art. 57 bis TRLITPAJD), y hay que decirlo. */
  const ciudadBonificada = CIUDADES_CON_BONIFICACION.includes(ccaa);
  /**
   * Los tipos del recuadro de la comunidad, del motor: el ITP de lo que no es vivienda al precio
   * escrito (el umbral valenciano lo cambia; el País Vasco cobra el 7 %) y el AJD general de un
   * solar (el País Vasco, 0,5 %: hallazgo 1592).
   */
  const precioLeido = parseSpanishNumber(precioVenta);
  const itpGeneralRotulo = tipoGeneralITP(
    ccaa,
    'otro',
    Number.isFinite(precioLeido) && precioLeido > 0 ? precioLeido : 0
  );
  const ajdRotulo = tipoAJD(ccaa, { objeto: 'otro' }).tipo;
  /** Escala progresiva o umbral, con las palabras de cada uno (forma de los hallazgos 1581/1602). */
  const subidaITP = describirSubidaITP(ccaa);
  /**
   * A la cifra final le falta algo: el impuesto indirecto sin calcular, una gestoría ilegible
   * (hallazgo 1595) o la parte de la notaría de libre acuerdo (1599). Un solo criterio para los
   * dos títulos, con las mismas palabras que el caso del IGIC/IPSI.
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
        <span aria-hidden="true" className={styles.heroIcon}>🏗️</span>
        <h1 className={styles.title}>Simulador de Gastos de Compra de Solar</h1>
        <p className={styles.subtitle}>
          Calcula el IVA o el ITP, el AJD, la notaría y el registro al comprar un solar o terreno edificable en
          España — el impuesto depende de si vende un promotor o un particular
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-solar"
        collapsible={false}
      />

      <DataReference
        normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={NOTA_DATOS}
      />

      {/* Aviso clave: quién vende decide el impuesto */}
      <div className={styles.ivaAviso} role="note">
        <strong><span aria-hidden="true">💡</span> Clave del solar:</strong> a diferencia del suelo rústico, el terreno edificable <strong>no
        está exento de IVA</strong>. Si lo vende un <strong>promotor o empresario</strong> pagas IVA {formatNumber(IVA_SOLAR, 0)}% + AJD;
        si lo vende un <strong>particular</strong>, pagas ITP. En <strong>Canarias, Ceuta y Melilla</strong> no
        rige el IVA: allí la operación va por <strong>IGIC</strong> o <strong>IPSI</strong>, que esta calculadora
        no cifra. En todos los casos, al ser suelo urbano, el vendedor paga <strong>plusvalía municipal</strong> si
        hubo incremento real del valor del terreno (sin incremento, la transmisión no está sujeta: art. 104.5 TRLRHL).
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de vendedor */}
          <div className={styles.inputGroup}>
            {/* Sin htmlFor no hay control al que apuntar: son dos botones. Con
                role="group" + aria-labelledby el lector de pantalla dice de qué elección
                forman parte, que aquí es nada menos que el régimen fiscal. */}
            <span className={styles.label} id="etiqueta-vendedor">¿Quién vende el solar?</span>
            <div className={styles.transmisionGrid} role="group" aria-labelledby="etiqueta-vendedor">
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoVendedor === 'particular' ? styles.active : ''}`}
                onClick={() => setTipoVendedor('particular')}
                aria-pressed={tipoVendedor === 'particular'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">👤</span>
                <span>Un particular</span>
                <span className={styles.transmisionSub}>Paga ITP (tipo general)</span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoVendedor === 'empresario' ? styles.active : ''}`}
                onClick={() => setTipoVendedor('empresario')}
                aria-pressed={tipoVendedor === 'empresario'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🏢</span>
                <span>Promotor / Empresa</span>
                {/* El rótulo no puede prometer un IVA que en Canarias, Ceuta y Melilla no se
                    liquida, ni escribir su tipo a mano teniéndolo en data/fiscal (hallazgos
                    1270 y 1275; forma de los 803 y 806 de terreno-rústico). */}
                <span className={styles.transmisionSub}>
                  {territorioActualSinIva
                    ? `Paga ${territorioActualSinIva.impuesto} + AJD`
                    : `Paga IVA ${formatNumber(IVA_SOLAR, 0)}% + AJD`}
                </span>
              </button>
            </div>
          </div>

{/*
            El aviso se pintaba con la sola condición `esEmpresario`, sin mirar el territorio, así
            que en Canarias, Ceuta y Melilla salía JUNTO a <AvisoTerritorioSinIva> —que dice «no se
            aplica el IVA»— y explicaba cómo deducir un IVA que el aviso de al lado declaraba
            inexistente. Dos role="note" consecutivos diciendo lo contrario (hallazgo 732).
          */}
          {esEmpresario && !TERRITORIOS_SIN_IVA[ccaa] && (
            <div className={styles.renunciaAviso} role="note">
              <strong><span aria-hidden="true">⚠️</span> Compra a promotor o empresa:</strong> el IVA del {formatNumber(IVA_SOLAR, 0)}% es <strong>deducible</strong> si
              eres empresario o autónomo y afectas el solar a una actividad sujeta a IVA (se recupera en el
              modelo 303). Si eres un <strong>particular que autopromueve su vivienda</strong>, el IVA no se
              deduce y es un mayor coste de la parcela.
            </div>
          )}

          {/* Precio */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio de compra del solar"
            placeholder="120000"
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
              Comunidad Autónoma (ubicación del solar)
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

          <AvisoTerritorioSinIva ccaa={ccaa} aplica={tipoVendedor === 'empresario'} />

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span className={styles.infoCcaaIcon} aria-hidden="true">📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                <span className={styles.infoCcaaValue}>{formatTipoNominal(itpGeneralRotulo)}%</span>
              </div>
              {/*
                Sin esta casilla, el recuadro anunciaba «ITP General 6%» y la tarjeta cobraba el
                3 %, sin que nada nombrara la bonificación (hallazgo 1593; la forma que resolvió
                el 729 en la hermana terreno-rústico).
              */}
              {ciudadBonificada && (
                <div className={styles.infoCcaaItem}>
                  <span className={styles.infoCcaaLabel}>Bonificación en cuota</span>
                  <span className={styles.infoCcaaValue}>
                    −{formatTipoNominal(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)}%
                  </span>
                </div>
              )}
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                <span className={styles.infoCcaaValue}>{formatTipoNominal(ajdRotulo)}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>
                  {territorioActualSinIva ? `${territorioActualSinIva.impuesto} (empresario)` : 'IVA (empresario)'}
                </span>
                <span className={styles.infoCcaaValue}>
                  {territorioActualSinIva ? 'No calculado' : `${formatNumber(IVA_SOLAR, 0)}%`}
                </span>
              </div>
            </div>
            {/* Escala o umbral, con las palabras del motor: Valencia se anunciaba como «escala
                progresiva (9% → 11%)» y el 11 % grava TODO el valor, no el exceso. */}
            {subidaITP && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> <strong>Tipo según el valor:</strong> {subidaITP}.
              </p>
            )}
            {/* En Ceuta y Melilla la nota negaba una rebaja que la app sí aplica: la
                bonificación no es un tipo reducido de vivienda sino del SITIO (hallazgo 1593). */}
            {ciudadBonificada ? (
              <p className={styles.infoCcaaNote}>
                Los solares tributan por el <strong>tipo general</strong> de ITP cuando vende un particular,
                pero en {datosCcaaActual.nombre} se aplica además la{' '}
                <strong>bonificación del {BONIFICACION_CIUDADES} de la cuota</strong> del artículo 57 bis
                del TRLITPAJD, que corresponde a los inmuebles situados en la ciudad sea cual sea su uso.
                El simulador ya la descuenta.
              </p>
            ) : (
              <p className={styles.infoCcaaNote}>
                Los solares tributan por el <strong>tipo general</strong> de ITP cuando vende un particular
                (los tipos reducidos solo aplican a la vivienda habitual).
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
              helperText="Típico en compra de solar: 400-800 €"
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
                title="Precio del solar"
                value={formatCurrency(resultadosComprador.precioInmueble)}
                variant="default"
                icon="🏗️"
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
                    ? `En ${datosCcaaActual.nombre} no rige el IVA: la compra al promotor tributa por el ${resultadosComprador.tipoImpuesto}, que este simulador no calcula`
                    : esEmpresario
                      ? 'Deducible si eres empresa/autónomo sujeto a IVA; no deducible si autopromueves tu vivienda'
                      // La bonificación se NOMBRA donde se aplica: «no tienen tipos reducidos»
                      // bajo un 3,00 % negaba la rebaja que la cifra ya lleva (hallazgo 1593).
                      : resultadosComprador.bonificado
                        ? `Tipo general con la bonificación del ${BONIFICACION_CIUDADES} de la cuota ya aplicada (art. 57 bis.3.a TRLITPAJD)`
                        : 'Tipo general — los solares no tienen tipos reducidos de ITP'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  // Tipo EFECTIVO, no el nominal de la tabla: en Ceuta y Melilla la cuota
                  // gradual se bonifica al 50 % (art. 57 bis.1 TRLITPAJD) y el nominal
                  // desmentía por el doble al importe de al lado (hallazgo 1269; forma de los
                  // 447 y 802 de las otras seis hermanas).
                  title={`AJD (${formatNumber(
                    resultadosComprador.precioInmueble > 0
                      ? (resultadosComprador.ajd / resultadosComprador.precioInmueble) * 100
                      : ajdRotulo,
                    2
                  )}%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
                  description={
                    ciudadBonificada
                      ? `Con la bonificación del ${BONIFICACION_CIUDADES} de Ceuta y Melilla aplicada (art. 57 bis.1 TRLITPAJD)`
                      : undefined
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
                // parcial (hallazgo 1271; forma de d787b81b en las hermanas). Y con el mismo
                // criterio, la gestoría ilegible (1595) y la notaría de libre acuerdo (1599).
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
                        // (hallazgo 1272).
                        resultadosComprador.ivaRecuperable
                          ? ' (precio + gastos antes de deducir el IVA si tienes derecho)'
                          : ''
                      }`
                    : resultadosComprador.ivaRecuperable
                      ? 'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)'
                      : 'Precio + todos los gastos de la operación'
                }
              />

              <div className={styles.renunciaAviso} role="note" style={{ marginTop: '0.25rem' }}>
                <strong>Recuerda:</strong> el solar es suelo urbano, así que el <strong>vendedor</strong> pagará
                además la <strong>plusvalía municipal</strong> (IIVTNU) si hubo incremento real del valor del
                terreno; sin incremento, la transmisión no está sujeta (art. 104.5 TRLRHL). No es un coste del
                comprador, pero puede influir en la negociación del precio.
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>
                {precioIlegible
                  ? `No se ha podido leer el precio «${precioVenta.trim()}». Introduce el precio del solar para ver el desglose de gastos, con coma decimal (120.000 o 120000,50)`
                  : 'Introduce el precio del solar para ver el desglose de gastos'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía fiscal para la compra de un solar"
        subtitle="Quién vende decide el impuesto, y por qué el solar, a diferencia de la finca rústica, puede pagar plusvalía municipal"
        icon="📚"
      >
        {/* Tabla comparativa según vendedor */}
        <section>
          <h2>El impuesto depende de quién venda</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary-boton)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Concepto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Vende promotor / empresa</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Vende particular</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Impuesto principal</td>
                  {/* La excepción territorial va con el tipo, como en la FAQ y en el botón: la
                      tabla afirmaba el IVA sin excepción (hallazgo 1596; forma de la hermana
                      terreno-rústico). */}
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700, color: 'var(--primary-texto)' }}>
                    IVA {formatNumber(IVA_SOLAR, 0)}%; IGIC o IPSI en Canarias, Ceuta y Melilla
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700 }}>ITP (tipo general)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>AJD</td>
                  {/* El rango de lo que NO es vivienda: el 0 % vasco era la exención de la
                      primera vivienda, y un solar paga allí el 0,5 % (hallazgo 1592). */}
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Sí ({formatTipoNominal(RANGO_AJD_OTROS.min)}%–{formatTipoNominal(RANGO_AJD_OTROS.max)}%)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>No</td>
                </tr>
                {/* Las celdas de respuesta van por clase (.celdaSi / .celdaNo), con variante
                    oscura: los dos hexadecimales en línea no tenían tema y daban 2,64:1 y 2,43:1
                    (hallazgo 1594; la forma del 648 de nave-industrial). La respuesta la lleva la
                    PALABRA, no el color. */}
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>¿IVA deducible?</td>
                  <td className={styles.celdaSi} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>Sí (si actividad sujeta)</td>
                  <td className={styles.celdaNo} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>No hay IVA</td>
                </tr>
                {/* Sin la condición del incremento, la fila afirmaba la plusvalía que la FAQ y
                    el aviso de arriba ya condicionan (hallazgo 1597, lo que dejó el 1274). */}
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px' }}>Plusvalía municipal (vendedor)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí, si hubo incremento real del valor del suelo (art. 104.5 TRLRHL)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí, si hubo incremento real del valor del suelo (art. 104.5 TRLRHL)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Casos de uso habituales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Las dos primeras tarjetas afirmaban el IVA sin la excepción de Canarias, Ceuta y
                Melilla que la FAQ, la cabecera y el botón ya llevan (hallazgo 1596). */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🏗️</span> Autopromotor compra parcela para su casa</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si compra a un promotor, paga IVA {formatNumber(IVA_SOLAR, 0)}% + AJD y no lo deduce (es un particular);
                en Canarias, Ceuta y Melilla, IGIC o IPSI en lugar del IVA. Si compra a un
                particular, paga ITP al tipo general. En ambos casos suma notaría y registro.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🏢</span> Promotora compra suelo para construir</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si compra a otro empresario, paga IVA {formatNumber(IVA_SOLAR, 0)}% deducible en el modelo 303 (en
                Canarias, Ceuta y Melilla, IGIC o IPSI, con sus propias reglas, que esta calculadora no cifra). Si
                compra a un particular, paga ITP, que no se recupera pero se incorpora al coste de la promoción.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🏛️</span> El vendedor y la plusvalía municipal</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Al ser suelo urbano, el vendedor paga plusvalía municipal si hubo incremento real del valor
                del terreno; sin incremento, la transmisión no está sujeta (art. 104.5 TRLRHL). No es coste
                del comprador, pero conviene tenerlo en cuenta al negociar el precio.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">📐</span> Verifica la calificación urbanística</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Confirma en el ayuntamiento que la parcela es suelo urbano consolidado y edificable, con las
                condiciones de edificabilidad, retranqueos y usos que necesitas antes de comprar.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Preguntas frecuentes — Compra de solar</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Primera de la lista a propósito: «escriturar» es como se teclea la pregunta,
                y hasta el 13/09/2026 el verbo no aparecía en ninguna de las seis apps. */}
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>{preguntaEscriturar(CASOS_ESCRITURAR.solar.inmueble)}</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                {respuestaEscriturar(CASOS_ESCRITURAR.solar)}
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Se paga IVA o ITP al comprar un solar?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Depende del vendedor. Si vende un promotor o empresario en el ejercicio de su actividad, la
                compra tributa por IVA al {formatNumber(IVA_SOLAR, 0)}% más AJD. Si vende un particular, tributa
                por ITP al tipo general de la comunidad autónoma. Nunca se pagan IVA e ITP a la vez. En Canarias,
                Ceuta y Melilla no rige el IVA: la operación tributa por IGIC o IPSI, con sus propios tipos.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Por qué el solar no está exento de IVA como la finca rústica?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                La exención de IVA se aplica al terreno rústico y no edificable. Los solares y terrenos
                edificables quedan expresamente excluidos de esa exención, por lo que su entrega por un empresario
                está sujeta a IVA al {formatNumber(IVA_SOLAR, 0)}% — o al IGIC o el IPSI en Canarias, Ceuta y
                Melilla, donde el IVA no se aplica.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿El autopromotor de su vivienda puede deducir el IVA del solar?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                No. Un particular que compra un solar para construir su vivienda no actúa como empresario, así que
                el IVA soportado no es deducible y se convierte en un mayor coste. Solo deducen el IVA quienes
                afectan el solar a una actividad económica sujeta a IVA.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Hay plusvalía municipal en la compra de un solar?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Sí, pero la paga el vendedor, no el comprador. Al ser suelo de naturaleza urbana, la transmisión
                genera plusvalía municipal (IIVTNU) sobre el incremento de valor del terreno. Si no hubo
                incremento real, la transmisión NO está sujeta (art. 104.5 TRLRHL): se acredita con las escrituras.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Sobre qué valor se calcula el impuesto de un solar?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                El IVA se calcula sobre el precio pactado; el ITP, sobre el valor de referencia del inmueble o el
                precio escriturado, el que sea mayor. Conviene comprobar el valor de referencia catastral en la
                Sede del Catastro antes de firmar la escritura.
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
            <li>Válido para solar o terreno edificable (suelo urbano). Si el terreno es rústico no edificable, la fiscalidad es distinta (exento de IVA, sin plusvalía municipal).</li>
            <li>El IVA solo es deducible si el comprador es sujeto pasivo de IVA con actividad sujeta y no exenta; el autopromotor particular no lo deduce.</li>
            <li>No calcula la plusvalía municipal, que corresponde al vendedor; se muestra solo como recordatorio.</li>
            <li>El valor de referencia catastral puede ser la base imponible del ITP si supera el precio escriturado.</li>
            <li>Los tipos de ITP y AJD pueden variar; verifica la normativa vigente de tu comunidad autónoma y consulta con tu asesor antes de firmar.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-solar')} />
      <ShareCard appName="simulador-gastos-compraventa-solar" />
      <Footer appName="simulador-gastos-compraventa-solar" />
    </div>
  );
}
