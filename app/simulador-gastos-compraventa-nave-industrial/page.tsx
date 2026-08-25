'use client';
// @disclaimer: DisclaimerCard severity="critical" — fiscal España estructural

import { useState, useMemo } from 'react';
import styles from './SimuladorNaveIndustrial.module.css';
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
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, formatTipoNominal, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  calcularNotario,
  estimarFacturaNotarial,
  calcularRegistro,
  ENLACE_CATASTRO,
  RANGO_AJD,
  RANGO_ITP,
  TERRITORIOS_SIN_IVA,
  CIUDADES_CON_BONIFICACION,
} from '@/data/itp-ccaa';
import { IVA_INMUEBLES_2025, FISCAL_INMUEBLES_META } from '@/data/fiscal';

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
  gastosNotario: number;
  gastosNotarioMin: number;
  gastosNotarioMax: number;
  gastosRegistro: number;
  gastosGestoria: number;
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

// El helper `tipoNominal` que vivía aquí subió a `lib/formatters.ts` como
// `formatTipoNominal` el 25/08/2026: el mismo defecto estaba en las otras seis apps del
// clúster, cada una con un número de decimales distinto (hallazgos 331 y 333).

export default function SimuladorNaveIndustrialPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (!Number.isFinite(precio) || precio <= 0) return null;

    // Se acota aquí y no solo en el blur del NumberInput: mientras el campo tiene el foco,
    // un importe negativo se sumaba al total y su tarjeta ni se pintaba (guard > 0), así que
    // el total en pantalla no cuadraba con las líneas visibles.
    const gestoria = Math.max(0, parseSpanishNumberOr(gastosGestoria));

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
    const conIva = tipoTransmision === 'primera-mano' || tipoTransmision === 'segunda-mano-renuncia';

    if (conIva) {
      if (territorioSinIva) {
        // Allí no se devenga IVA: se nombra el impuesto que corresponde y no se inventa cifra
        tipoImpuesto = territorioSinIva.impuesto;
        impuestoNoCalculado = true;
      } else {
        // Nave industrial: IVA de local comercial (inmueble no residencial)
        tipoImpuesto = tipoTransmision === 'segunda-mano-renuncia' ? 'IVA (renuncia · ISP)' : 'IVA';
        porcentaje = IVA_NAVE_INDUSTRIAL;
        impuesto = precio * (porcentaje / 100);
      }
    } else {
      // ITP segunda mano — tipo general de la CCAA (sin tipos reducidos: nave industrial es comercial)
      // Sin tercer argumento: así se aplica la escala progresiva de las 7 CCAA
      // que la tienen, en vez del tipo plano del primer tramo.
      impuesto = calcularITP(precio, ccaa);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva —o con la bonificación aplicada— el importe no
      // es un porcentaje plano del precio, así que el tipo nominal contradiría a la cifra.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
    }

    // AJD solo aplica en primera mano (IVA + AJD). En Ceuta y Melilla la cuota gradual de
    // documentos notariales también se bonifica al 50 % (art. 57 bis.1 TRLITPAJD).
    const ajd = conIva ? calcularAJD(precio, ccaa) : 0;

    const notaria = estimarFacturaNotarial(precio);

    const notario = notaria.medio;
    const registro = calcularRegistro(precio);

    const totalGastos = impuesto + ajd + notario + registro + gestoria;

    return {
      precioInmueble: precio,
      impuestoTransmision: impuesto,
      tipoImpuesto,
      porcentajeImpuesto: porcentaje,
      impuestoNoCalculado,
      bonificado,
      ajd,
      gastosNotario: notario,
      gastosNotarioMin: notaria.min,
      gastosNotarioMax: notaria.max,
      gastosRegistro: registro,
      gastosGestoria: gestoria,
      totalGastos,
      totalOperacion: precio + totalGastos,
    };
  }, [precioVenta, ccaa, tipoTransmision, gastosGestoria]);

  const datosCcaaActual = ITP_CCAA[ccaa];
  const territorioActualSinIva = TERRITORIOS_SIN_IVA[ccaa];
  const esCiudadBonificada = CIUDADES_CON_BONIFICACION.includes(ccaa);

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

      <DataReference
        normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={FISCAL_INMUEBLES_META.nota}
      />

      {/* Aviso IVA deducible */}
      <div className={styles.ivaAviso} role="note">
        <strong>💡 Si eres empresa o autónomo:</strong> el IVA soportado en la compra de una nave industrial
        puede ser <strong>deducible</strong> si tu actividad está sujeta a IVA. Consulta con tu asesor fiscal
        antes de tomar decisiones.
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
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
                aria-pressed={tipoTransmision === 'segunda-mano'}
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
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
                aria-pressed={tipoTransmision === 'primera-mano'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🆕</span>
                <span>Obra nueva / Promotor</span>
                <span className={styles.transmisionSub}>Paga IVA {formatNumber(IVA_NAVE_INDUSTRIAL, 0)}% + AJD</span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano-renuncia' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano-renuncia')}
                aria-pressed={tipoTransmision === 'segunda-mano-renuncia'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🤝</span>
                <span>2ª mano con renuncia al IVA</span>
                <span className={styles.transmisionSub}>IVA {formatNumber(IVA_NAVE_INDUSTRIAL, 0)}% (ISP) + AJD</span>
              </button>
            </div>
            {tipoTransmision === 'segunda-mano' && (
              <p className={styles.avisoRenuncia} role="note">
                <span aria-hidden="true">ℹ️</span> Entre empresarios con derecho a deducción es habitual{' '}
                <strong>renunciar a la exención de IVA</strong> en la segunda transmisión: la operación
                vuelve al IVA, lo autoliquida el comprador (inversión del sujeto pasivo) y no se paga ITP.
                Si es tu caso, usa la tercera opción.
              </p>
            )}
            {tipoTransmision === 'segunda-mano-renuncia' && (
              <p className={styles.avisoRenuncia} role="note">
                <span aria-hidden="true">ℹ️</span> Con renuncia a la exención el IVA no se paga al vendedor:
                lo <strong>autoliquida el comprador</strong> (inversión del sujeto pasivo), y suele ser
                deducible si tu actividad está sujeta a IVA. Ojo al AJD: varias comunidades le aplican un{' '}
                <strong>tipo incrementado</strong> cuando hay renuncia, y aquí se calcula con el tipo
                general de la tabla — consúltalo en tu comunidad.
              </p>
            )}
          </div>

          {/* Precio */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio de compra de la nave industrial"
            placeholder="500000"
            helperText="Precio escriturado o valor de referencia catastral (el mayor de ambos)"
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
                <span className={styles.infoCcaaValue}>{formatTipoNominal(datosCcaaActual.tipoGeneral)}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                <span className={styles.infoCcaaValue}>{formatNumber(datosCcaaActual.ajd, 2)}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>
                  {territorioActualSinIva ? `${territorioActualSinIva.impuesto} (obra nueva)` : 'IVA (obra nueva)'}
                </span>
                <span className={styles.infoCcaaValue}>
                  {territorioActualSinIva ? 'No calculado' : `${formatTipoNominal(IVA_NAVE_INDUSTRIAL)}%`}
                </span>
              </div>
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> Esta CCAA aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${formatTipoNominal(t.tipo)}%`).join(' → ')})
              </p>
            )}
            {esCiudadBonificada ? (
              <p className={styles.infoCcaaNote}>
                Las naves industriales tributan por el <strong>tipo general</strong> de ITP, pero en{' '}
                {datosCcaaActual.nombre} se aplica además la <strong>bonificación del 50 % de la cuota</strong>{' '}
                del artículo 57 bis del TRLITPAJD, que corresponde a los inmuebles situados en la ciudad
                sea cual sea su uso. El simulador ya la descuenta.
              </p>
            ) : (
              <p className={styles.infoCcaaNote}>
                Las naves industriales tributan por el <strong>tipo general</strong> de ITP, sin tipos reducidos
                (los tipos reducidos solo aplican a inmuebles residenciales).
              </p>
            )}
            {territorioActualSinIva && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> En {datosCcaaActual.nombre} <strong>no se aplica el IVA</strong>:
                la obra nueva tributa por el {territorioActualSinIva.impuesto} ({territorioActualSinIva.nombre}),
                con sus propios tipos. Este simulador no lo calcula — consúltalo en la administración tributaria
                de {datosCcaaActual.nombre}.
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
                    : resultadosComprador.tipoImpuesto === 'IVA'
                      ? 'Potencialmente deducible si eres empresa/autónomo sujeto a IVA'
                      : resultadosComprador.bonificado
                        ? 'Tipo general con la bonificación del 50 % de la cuota ya aplicada (art. 57 bis TRLITPAJD)'
                        : 'Tipo general — naves industriales no tienen tipos reducidos'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  title={`AJD (${formatNumber(datosCcaaActual.ajd, 2)}%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
                  description={resultadosComprador.bonificado ? 'Con la bonificación del 50 % de Ceuta y Melilla aplicada' : undefined}
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

              {resultadosComprador.gastosGestoria > 0 && (
                <ResultCard
                  title="Gastos de gestoría"
                  value={formatCurrency(resultadosComprador.gastosGestoria)}
                  variant="default"
                  icon="📂"
                />
              )}

              <div className={styles.separador} />

              <ResultCard
                title={resultadosComprador.impuestoNoCalculado ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales'}
                value={formatCurrency(resultadosComprador.totalGastos)}
                variant="info"
                icon="➕"
                description={
                  resultadosComprador.impuestoNoCalculado
                    ? `${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}% sobre el precio — SIN el ${resultadosComprador.tipoImpuesto}, que no está incluido`
                    : `${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}% sobre el precio de compra`
                }
              />

              <ResultCard
                title={resultadosComprador.impuestoNoCalculado ? 'COSTE TOTAL (PARCIAL)' : 'COSTE TOTAL DE ADQUISICIÓN'}
                value={formatCurrency(resultadosComprador.totalOperacion)}
                variant="highlight"
                icon="💳"
                description={
                  resultadosComprador.impuestoNoCalculado
                    ? `No incluye el ${resultadosComprador.tipoImpuesto}: el coste real será mayor`
                    : 'Precio + todos los gastos (antes de deducir IVA si aplica)'
                }
              />
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>Introduce el precio de la nave industrial para ver el desglose de gastos</p>
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
                <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Concepto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Nave industrial</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Vivienda</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>IVA obra nueva</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700, color: 'var(--primary)' }}>21%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>10%</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0' }}>ITP segunda mano</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Tipo general CCAA</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>General o reducido</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Tipos reducidos ITP</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', color: '#c0392b' }}>No aplican</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', color: '#27ae60' }}>Sí (jóvenes, familia numerosa, etc.)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0' }}>IVA deducible</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', color: '#27ae60', fontWeight: 700 }}>Sí (si actividad sujeta a IVA)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', color: '#c0392b' }}>No</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px' }}>AJD obra nueva</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí ({formatNumber(RANGO_AJD.min, 0)}% – {formatNumber(RANGO_AJD.max, 1)}%)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí ({formatNumber(RANGO_AJD.min, 0)}% – {formatNumber(RANGO_AJD.max, 1)}%)</td>
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
              <strong><span aria-hidden="true">🏭</span> Empresa compra nave nueva al promotor</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Paga IVA 21% + AJD. Si la empresa está dada de alta en actividades sujetas a IVA,
                puede deducir el IVA en la declaración trimestral (modelo 303).
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🔄</span> Autónomo compra nave de segunda mano</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Paga ITP al tipo general de su CCAA (no hay bonificaciones para naves industriales).
                El ITP no es deducible como IVA, pero sí se añade al valor de adquisición del activo.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">💡</span> IVA deducible: cuándo y cómo</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Solo si el comprador es sujeto pasivo de IVA y la nave se destina a la actividad económica.
                El IVA se recupera en la declaración trimestral, reduciendo el coste real de adquisición.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">📈</span> Vender nave con ganancia patrimonial</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si vendes la nave como persona física, la ganancia tributa en el IRPF base del ahorro
                (19-30%). Si vendes como empresa (IS), tributa en el Impuesto de Sociedades.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ específica nave industrial */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Preguntas frecuentes — Compra de nave industrial</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Se paga IVA o ITP al comprar una nave industrial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Depende del tipo de transmisión. Si es la primera entrega del promotor (obra nueva),
                se paga IVA al {formatNumber(IVA_NAVE_INDUSTRIAL, 0)}%. Si es de segunda mano, se paga ITP
                al tipo general de la comunidad autónoma. Nunca se pagan los dos a la vez.
              </p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                <strong>Con una salvedad que en naves industriales es frecuente:</strong> la segunda
                transmisión está exenta de IVA, pero cuando comprador y vendedor son empresarios con derecho
                a deducción es habitual <strong>renunciar a esa exención</strong>. Entonces la operación vuelve
                al IVA (con inversión del sujeto pasivo: lo declara el comprador) y no se paga ITP, aunque el
                AJD suele ir a un tipo incrementado en muchas comunidades. El simulador lo
                contempla en su tercera opción, «2ª mano con renuncia al IVA»; lo que no ajusta es el tipo
                incrementado de AJD que varias comunidades aplican en ese supuesto, así que conviene
                contrastarlo con tu asesor.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Es deducible el IVA en la compra de una nave industrial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Sí, siempre que el comprador sea un sujeto pasivo de IVA (empresa o autónomo) y la nave
                se destine a una actividad económica sujeta y no exenta de IVA. El IVA se deduce en el
                modelo 303. Si la actividad está exenta de IVA (ej. médico, educación), no es deducible.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Qué tipos de ITP aplican a una nave industrial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Los tipos reducidos de ITP (jóvenes, familias numerosas, discapacidad) son exclusivos de
                inmuebles residenciales. Para naves industriales y locales comerciales aplica el tipo general
                de la comunidad, que hoy va del {formatNumber(RANGO_ITP.min, 2)}% al {formatNumber(RANGO_ITP.max, 2)}%
                — el techo corresponde al tramo más alto de las comunidades con escala progresiva, así que una
                nave cara puede pagar un tipo efectivo superior al nominal de su comunidad. La excepción no es
                un tipo reducido sino una bonificación de cuota: en Ceuta y Melilla se descuenta el 50 %
                (art. 57 bis del TRLITPAJD), y ahí sí entra cualquier inmueble, también una nave.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Hay AJD en la compra de una nave industrial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                El AJD aplica en la compra de nave nueva (primera transmisión) junto con el IVA, igual que en
                cualquier otro inmueble. En segunda mano, el AJD solo se pagaría sobre la escritura de hipoteca,
                no sobre la compraventa en sí.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Hay plusvalía municipal al vender una nave industrial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Sí. La plusvalía municipal (IIVTNU) se aplica al incremento del valor del suelo durante el
                tiempo de propiedad, independientemente de si el inmueble es residencial o industrial.
                Si no hay ganancia real en el valor del terreno, puede acreditarse la exención.
              </p>
            </div>
          </div>
        </section>

        {/* Consejos para compradores de naves */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Consejos para compradores de naves industriales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">🔍</span>
              <strong>Verifica la calificación urbanística</strong>
              <p style={{ fontSize: '0.9rem' }}>
                Confirma que la nave tiene licencia de actividad compatible con tu uso previsto.
                Un cambio de uso puede implicar costes adicionales en obras y licencias.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📑</span>
              <strong>Consulta el régimen de IVA antes de comprar</strong>
              <p style={{ fontSize: '0.9rem' }}>
                Si tu actividad está sujeta a IVA, comprar en primera mano (IVA 21%) puede ser más
                ventajoso que segunda mano (ITP no deducible), especialmente en naves de alto valor.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">💼</span>
              <strong>Compra con empresa o a título personal</strong>
              <p style={{ fontSize: '0.9rem' }}>
                Comprar con sociedad puede facilitar la deducción de gastos (amortización, IBI, seguros).
                Comprar a título personal puede ser más sencillo pero menos eficiente fiscalmente.
                Analiza con tu asesor cuál te conviene.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📋</span>
              <strong>Guarda todos los justificantes</strong>
              <p style={{ fontSize: '0.9rem' }}>
                Conserva facturas de ITP/IVA, notaría, registro y reformas. Al vender, estos gastos
                incrementan el valor de adquisición y reducen la ganancia patrimonial o el beneficio
                en el Impuesto de Sociedades.
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
            <li>El IVA del 21% solo es deducible si el comprador es sujeto pasivo de IVA con actividad sujeta y no exenta.</li>
            <li>Los tipos de ITP y AJD pueden variar; verifica la normativa vigente de tu comunidad autónoma.</li>
            <li>El valor de referencia catastral puede ser la base imponible real del ITP si supera el precio escriturado.</li>
            <li>Esta calculadora no contempla situaciones especiales (renuncia a la exención de IVA en segunda mano, operaciones vinculadas, etc.).</li>
            <li>Consulta siempre con tu asesor fiscal antes de cerrar la operación.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-nave-industrial')} />
      <ShareCard appName="simulador-gastos-compraventa-nave-industrial" />
      <Footer appName="simulador-gastos-compraventa-nave-industrial" />
    </div>
  );
}
