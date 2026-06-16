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
type TipoTransmision = 'segunda-mano' | 'primera-mano';

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

// IVA nave industrial: 21% (inmueble comercial/industrial, no residencial)
const IVA_NAVE_INDUSTRIAL = 21;

export default function SimuladorNaveIndustrialPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (precio <= 0) return null;

    const gestoria = parseSpanishNumber(gastosGestoria);

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;

    if (tipoTransmision === 'primera-mano') {
      // Nave industrial: IVA 21% (inmueble comercial)
      tipoImpuesto = 'IVA';
      porcentaje = IVA_NAVE_INDUSTRIAL;
      impuesto = precio * (porcentaje / 100);
    } else {
      // ITP segunda mano — tipo general de la CCAA (sin tipos reducidos: nave industrial es comercial)
      const datosCcaa = ITP_CCAA[ccaa];
      const tipoAplicable = datosCcaa.tipoGeneral;
      impuesto = calcularITP(precio, ccaa, tipoAplicable);
      tipoImpuesto = 'ITP';
      porcentaje = tipoAplicable;
    }

    // AJD solo aplica en primera mano (IVA + AJD)
    const ajd = tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa) : 0;

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
    };
  }, [precioVenta, ccaa, tipoTransmision, gastosGestoria]);

  const datosCcaaActual = ITP_CCAA[ccaa];

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

      <LegalNotice lastUpdated="2024-12-20" />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-nave-industrial"
        collapsible={false}
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
                <span className={styles.infoCcaaValue}>{datosCcaaActual.tipoGeneral}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                <span className={styles.infoCcaaValue}>{datosCcaaActual.ajd}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>IVA (obra nueva)</span>
                <span className={styles.infoCcaaValue}>{IVA_NAVE_INDUSTRIAL}%</span>
              </div>
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                ⚠️ Esta CCAA aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${t.tipo}%`).join(' → ')})
              </p>
            )}
            <p className={styles.infoCcaaNote}>
              Las naves industriales tributan por el <strong>tipo general</strong> de ITP, sin tipos reducidos
              (los tipos reducidos solo aplican a inmuebles residenciales).
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
                title="Precio de la nave industrial"
                value={formatCurrency(resultadosComprador.precioInmueble)}
                variant="default"
                icon="🏭"
              />

              <ResultCard
                title={`${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 0)}%)`}
                value={formatCurrency(resultadosComprador.impuestoTransmision)}
                variant="warning"
                icon="📋"
                description={
                  resultadosComprador.tipoImpuesto === 'IVA'
                    ? 'Potencialmente deducible si eres empresa/autónomo sujeto a IVA'
                    : 'Tipo general — naves industriales no tienen tipos reducidos'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  title={`AJD (${formatNumber(datosCcaaActual.ajd, 2)}%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
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
                description="Precio + todos los gastos (antes de deducir IVA si aplica)"
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
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí (0,5% – 1,5%)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí (0,5% – 1,5%)</td>
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
                se paga IVA al 21%. Si es de segunda mano (entre particulares o empresas ya usadas),
                se paga ITP al tipo general de la comunidad autónoma. Nunca se pagan los dos a la vez.
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
                inmuebles residenciales. Para naves industriales y locales comerciales, siempre aplica el
                tipo general de la CCAA, que oscila entre el 4% (País Vasco) y el 10-11% (Cataluña, Valencia).
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
