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
// Terreno rústico no edificable: exento de IVA → ITP (regla general).
// Excepción: renuncia a la exención de IVA entre profesionales → IVA 21% (ISP) + AJD.
type TipoOperacion = 'itp' | 'renuncia';

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

const IVA_RENUNCIA = 21;

export default function SimuladorTerrenoRusticoPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion>('itp');
  const [gastosGestoria, setGastosGestoria] = useState('400');

  const esRenuncia = tipoOperacion === 'renuncia';

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

    if (tipoOperacion === 'renuncia') {
      // Renuncia a la exención de IVA (Art. 20.Dos LIVA) → IVA 21% con inversión del sujeto pasivo + AJD
      tipoImpuesto = 'IVA (renuncia · ISP)';
      porcentaje = IVA_RENUNCIA;
      impuesto = precio * (porcentaje / 100);
      ajd = calcularAJD(precio, ccaa);
      ivaRecuperable = true;
    } else {
      // Regla general: terreno rústico exento de IVA → ITP tipo general de la CCAA
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
  }, [precioVenta, ccaa, tipoOperacion, gastosGestoria]);

  const datosCcaaActual = ITP_CCAA[ccaa];

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

      <LegalNotice lastUpdated="2025-01-15" />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-terreno-rustico"
        collapsible={false}
      />

      {/* Aviso clave: exención de IVA y sin plusvalía */}
      <div className={styles.ivaAviso} role="note">
        <strong>💡 Clave de la finca rústica:</strong> el terreno rústico no edificable está <strong>exento de
        IVA</strong>, así que por norma general se paga <strong>ITP</strong>, no IVA. Y al ser suelo rústico,
        el vendedor <strong>no paga plusvalía municipal</strong> (el IIVTNU solo grava suelo urbano).
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de operación */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de operación</label>
            <div className={styles.transmisionGrid}>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoOperacion === 'itp' ? styles.active : ''}`}
                onClick={() => setTipoOperacion('itp')}
                aria-pressed={tipoOperacion === 'itp'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🔄</span>
                <span>Compra habitual</span>
                <span className={styles.transmisionSub}>Exenta de IVA → paga ITP</span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoOperacion === 'renuncia' ? styles.active : ''}`}
                onClick={() => setTipoOperacion('renuncia')}
                aria-pressed={tipoOperacion === 'renuncia'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🤝</span>
                <span>Con renuncia a la exención IVA</span>
                <span className={styles.transmisionSub}>IVA 21% (ISP) + AJD</span>
              </button>
            </div>
          </div>

          {esRenuncia && (
            <div className={styles.renunciaAviso} role="note">
              <strong>⚠️ Renuncia a la exención de IVA (Art. 20.Dos LIVA):</strong> solo es posible cuando
              comprador y vendedor son empresarios o profesionales con derecho a deducción (por ejemplo, un
              agricultor en régimen general que afecta la finca a su explotación). El IVA se autoliquida por
              <strong> inversión del sujeto pasivo</strong> y es deducible si tienes derecho. A cambio, la
              escritura tributa por AJD, que <strong>muchas CCAA aplican a un tipo incrementado</strong> en la
              renuncia; este simulador usa el AJD general.
            </div>
          )}

          {/* Precio */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio de compra de la finca rústica"
            placeholder="80000"
            helperText="Precio escriturado o valor de referencia catastral (el mayor de ambos)"
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
                <span className={styles.infoCcaaLabel}>IVA (renuncia)</span>
                <span className={styles.infoCcaaValue}>{IVA_RENUNCIA}%</span>
              </div>
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                ⚠️ Esta CCAA aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${t.tipo}%`).join(' → ')})
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
                title={`${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 0)}%)`}
                value={formatCurrency(resultadosComprador.impuestoTransmision)}
                variant="warning"
                icon="📋"
                description={
                  esRenuncia
                    ? 'Autorrepercutido por inversión del sujeto pasivo — deducible si eres sujeto pasivo de IVA'
                    : 'Tipo general de la CCAA (posibles reducciones agrarias no incluidas)'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  title={`AJD (${formatNumber(datosCcaaActual.ajd, 2)}%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
                  description="Algunas CCAA aplican un tipo de AJD incrementado en la renuncia"
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
              <p>Introduce el precio de la finca rústica para ver el desglose de gastos</p>
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
                <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Concepto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Finca rústica</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Solar edificable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Impuesto general</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700, color: 'var(--primary)' }}>ITP</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>IVA (empresario) o ITP (particular)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0' }}>¿Sujeto a IVA por empresario?</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', color: '#c0392b' }}>No (exento)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', color: '#27ae60' }}>Sí (21% + AJD)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Plusvalía municipal</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', color: '#27ae60', fontWeight: 700 }}>No aplica</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', color: '#c0392b' }}>Sí (suelo urbano)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px' }}>Renuncia a la exención de IVA</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Posible entre profesionales</td>
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
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🌾</span> Particular compra tierra para uso propio</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Paga ITP al tipo general de su comunidad. Sin IVA y sin plusvalía municipal. Notaría y registro
                se calculan sobre el valor escriturado o el de referencia catastral, el mayor.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🚜</span> Agricultor amplía su explotación</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si es titular de explotación prioritaria o joven agricultor, puede acceder a reducciones de ITP
                (Ley 19/1995). Conviene verificar los requisitos y el porcentaje con la comunidad autónoma.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🤝</span> Empresa compra finca a otra empresa</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si ambas tienen derecho a deducción, el vendedor puede renunciar a la exención de IVA. La compra
                pasa a IVA 21% con inversión del sujeto pasivo, que el comprador autoliquida y deduce.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">📈</span> Vender la finca con ganancia</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                No hay plusvalía municipal, pero la ganancia patrimonial tributa en el IRPF del vendedor (base
                del ahorro, 19%-30%) o en el Impuesto de Sociedades si vende una empresa.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Preguntas frecuentes — Compra de finca rústica</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Se paga IVA o ITP al comprar una finca rústica?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Por regla general, ITP. El terreno rústico no edificable está exento de IVA (Art. 20.Uno.20º LIVA),
                incluso cuando lo vende un empresario. Solo se paga IVA si hay renuncia a la exención entre
                profesionales con derecho a deducción.
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
                a tributar por IVA al 21% en lugar de ITP, con inversión del sujeto pasivo. Solo cabe entre
                empresarios o profesionales con derecho a deducir el IVA; interesa cuando el comprador puede
                deducirlo y así evita un ITP no recuperable.
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
            <li>La renuncia a la exención de IVA solo es válida entre empresarios o profesionales con derecho a deducción, y muchas CCAA aplican un AJD incrementado (aquí se usa el general).</li>
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
