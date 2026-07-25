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
  ShareCard,
  RegionBadge,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  calcularNotario,
  calcularRegistro,
  ENLACE_CATASTRO,
} from '@/data/itp-ccaa';

// ===== TIPOS =====
type TipoTransmision = 'segunda-mano' | 'primera-mano' | 'segunda-mano-renuncia';

interface ResultadosComprador {
  precioInmueble: number;
  impuestoTransmision: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  ajd: number;
  gastosNotario: number;
  gastosRegistro: number;
  gastosGestoria: number;
  totalGastos: number;
  totalOperacion: number;
  ivaRecuperable: boolean; // true si el impuesto principal es IVA (deducible si el comprador es sujeto pasivo)
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

// IVA local comercial: 21% (inmueble comercial, no residencial)
const IVA_LOCAL_COMERCIAL = 21;

export default function SimuladorLocalComercialPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  const esRenuncia = tipoTransmision === 'segunda-mano-renuncia';

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (precio <= 0) return null;

    const gestoria = parseSpanishNumber(gastosGestoria);

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    let ivaRecuperable = false;
    let ajd = 0;

    if (tipoTransmision === 'primera-mano') {
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
      impuesto = calcularITP(precio, ccaa, tipoAplicable);
      tipoImpuesto = 'ITP';
      porcentaje = tipoAplicable;
      ajd = 0;
    }

    const notario = calcularNotario(precio);
    const registro = calcularRegistro(precio);

    const totalGastos = impuesto + ajd + notario + registro + gestoria;

    return {
      precioInmueble: precio,
      impuestoTransmision: impuesto,
      tipoImpuesto,
      porcentajeImpuesto: porcentaje,
      ajd,
      gastosNotario: notario,
      gastosRegistro: registro,
      gastosGestoria: gestoria,
      totalGastos,
      totalOperacion: precio + totalGastos,
      ivaRecuperable,
    };
  }, [precioVenta, ccaa, tipoTransmision, gastosGestoria]);

  const datosCcaaActual = ITP_CCAA[ccaa];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span aria-hidden="true" className={styles.heroIcon}>🏪</span>
        <h1 className={styles.title}>Simulador de Gastos de Compra de Local Comercial</h1>
        <p className={styles.subtitle}>
          Calcula el IVA, ITP, AJD, notaría y registro al comprar un local comercial en España — incluida la
          renuncia a la exención de IVA con inversión del sujeto pasivo
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated="2025-01-15" />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-local-comercial"
        collapsible={false}
      />

      {/* Aviso IVA deducible */}
      <div className={styles.ivaAviso} role="note">
        <strong>💡 Si eres empresa o autónomo:</strong> el IVA soportado en la compra de un local comercial
        puede ser <strong>deducible</strong> si tu actividad está sujeta a IVA. Por eso, en segunda mano entre
        profesionales, muchas veces conviene <strong>renunciar a la exención de IVA</strong> para no pagar un ITP
        que no se recupera. Consulta con tu asesor fiscal antes de decidir.
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
                <span className={styles.transmisionSub}>IVA 21% (ISP) + AJD</span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
                aria-pressed={tipoTransmision === 'primera-mano'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🆕</span>
                <span>Obra nueva / Promotor</span>
                <span className={styles.transmisionSub}>Paga IVA 21% + AJD</span>
              </button>
            </div>
          </div>

          {esRenuncia && (
            <div className={styles.renunciaAviso} role="note">
              <strong>⚠️ Renuncia a la exención de IVA (Art. 20.Dos LIVA):</strong> solo es posible cuando
              comprador y vendedor son empresarios o profesionales con derecho a deducción. El IVA se autoliquida
              por <strong>inversión del sujeto pasivo</strong> (no se paga al vendedor) y es deducible si tienes
              derecho. A cambio, la escritura tributa por AJD, que <strong>muchas CCAA aplican a un tipo
              incrementado</strong> (a menudo 1,5%–2%) en caso de renuncia; este simulador usa el AJD general.
            </div>
          )}

          {/* Precio */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio de compra del local comercial"
            placeholder="200000"
            helperText="Precio escriturado o valor de referencia catastral (el mayor de ambos)"
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

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span className={styles.infoCcaaIcon} aria-hidden="true">📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                <span className={styles.infoCcaaValue}>{datosCcaaActual.tipoGeneral}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                <span className={styles.infoCcaaValue}>{datosCcaaActual.ajd}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>IVA (comercial)</span>
                <span className={styles.infoCcaaValue}>{IVA_LOCAL_COMERCIAL}%</span>
              </div>
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                ⚠️ Esta CCAA aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${t.tipo}%`).join(' → ')})
              </p>
            )}
            <p className={styles.infoCcaaNote}>
              Los locales comerciales tributan por el <strong>tipo general</strong> de ITP, sin tipos reducidos
              (los tipos reducidos solo aplican a la vivienda habitual).
            </p>
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
                title="Precio del local comercial"
                value={formatCurrency(resultadosComprador.precioInmueble)}
                variant="default"
                icon="🏪"
              />

              <ResultCard
                title={`${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 0)}%)`}
                value={formatCurrency(resultadosComprador.impuestoTransmision)}
                variant="warning"
                icon="📋"
                description={
                  esRenuncia
                    ? 'Autorrepercutido por inversión del sujeto pasivo — deducible si eres sujeto pasivo de IVA'
                    : resultadosComprador.ivaRecuperable
                      ? 'Potencialmente deducible si eres empresa/autónomo sujeto a IVA'
                      : 'Tipo general — los locales comerciales no tienen tipos reducidos'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  title={`AJD (${formatNumber(datosCcaaActual.ajd, 2)}%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
                  description={esRenuncia ? 'Algunas CCAA aplican un tipo de AJD incrementado en la renuncia' : undefined}
                />
              )}

              <ResultCard
                title="Gastos de notaría (+ IVA)"
                value={formatCurrency(resultadosComprador.gastosNotario)}
                variant="default"
                icon="📝"
              />

              <ResultCard
                title="Registro de la Propiedad (+ IVA)"
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
                title="Total gastos adicionales"
                value={formatCurrency(resultadosComprador.totalGastos)}
                variant="info"
                icon="➕"
                description={`${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}% sobre el precio de compra`}
              />

              <ResultCard
                title="COSTE TOTAL DE ADQUISICIÓN"
                value={formatCurrency(resultadosComprador.totalOperacion)}
                variant="highlight"
                icon="💳"
                description={
                  resultadosComprador.ivaRecuperable
                    ? 'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)'
                    : 'Precio + todos los gastos de la operación'
                }
              />
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>Introduce el precio del local comercial para ver el desglose de gastos</p>
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
                <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Escenario</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Impuesto principal</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>AJD</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>¿IVA deducible?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Obra nueva (promotor)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700, color: 'var(--primary)' }}>IVA 21%</td>
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
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>IVA 21% (ISP)</td>
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
                Paga IVA 21% + AJD. Si está dado de alta en una actividad sujeta a IVA, deduce el IVA
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
                La operación pasa a IVA 21% con inversión del sujeto pasivo: el comprador lo autoliquida y
                deduce, evitando un ITP que no recuperaría.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">📈</span> Vender el local con ganancia</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si vendes como persona física, la ganancia tributa en el IRPF del ahorro (19%-30%). Si vendes
                como empresa, tributa en el Impuesto de Sociedades. En ambos casos hay plusvalía municipal.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ específica local comercial */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Preguntas frecuentes — Compra de local comercial</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Se paga IVA o ITP al comprar un local comercial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                En obra nueva (primera entrega del promotor) se paga IVA al 21% más AJD. En segunda mano, por
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
                (Art. 20.Dos): la compra tributa por IVA 21% con inversión del sujeto pasivo en lugar de ITP.
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
                entre el 1,5% y el 2%) cuando existe renuncia a la exención de IVA, frente al tipo general
                (0,5%-1,5%). Este simulador aplica el AJD general de la CCAA; confirma el tipo incrementado
                exacto de tu comunidad antes de firmar.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Hay plusvalía municipal al vender un local comercial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Sí. La plusvalía municipal (IIVTNU) grava el incremento de valor del suelo durante el tiempo de
                propiedad, sea el inmueble residencial o comercial. Si no ha habido incremento real del valor
                del terreno, puede acreditarse la exención con las escrituras de compra y venta.
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
            <li>La renuncia a la exención de IVA solo es válida entre empresarios o profesionales con derecho a deducción; no todos los compradores pueden acogerse.</li>
            <li>En la renuncia, muchas CCAA aplican un tipo de AJD incrementado; este simulador usa el AJD general, así que el coste real de AJD puede ser mayor.</li>
            <li>El IVA solo es deducible si el comprador es sujeto pasivo de IVA con actividad sujeta y no exenta.</li>
            <li>El valor de referencia catastral puede ser la base imponible real del ITP si supera el precio escriturado.</li>
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
