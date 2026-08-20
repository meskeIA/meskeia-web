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
  ShareCard,
  RegionBadge,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  calcularNotario,
  estimarFacturaNotarial,
  calcularRegistro,
  ENLACE_CATASTRO,
} from '@/data/itp-ccaa';

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
  ajd: number;
  gastosNotario: number;
  gastosNotarioMin: number;
  gastosNotarioMax: number;
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

// IVA solar / terreno edificable: 21%
const IVA_SOLAR = 21;

export default function SimuladorSolarPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoVendedor, setTipoVendedor] = useState<TipoVendedor>('particular');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  const esEmpresario = tipoVendedor === 'empresario';

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (!Number.isFinite(precio) || precio <= 0) return null;

    const gestoria = parseSpanishNumberOr(gastosGestoria);

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    let ivaRecuperable = false;
    let ajd = 0;

    if (tipoVendedor === 'empresario') {
      // Vendedor promotor/empresario: solar sujeto a IVA 21% + AJD
      tipoImpuesto = 'IVA';
      porcentaje = IVA_SOLAR;
      impuesto = precio * (porcentaje / 100);
      ajd = calcularAJD(precio, ccaa);
      ivaRecuperable = true;
    } else {
      // Vendedor particular: ITP tipo general de la CCAA
      const datosCcaa = ITP_CCAA[ccaa];
      const tipoAplicable = datosCcaa.tipoGeneral;
      // Sin tercer argumento: así se aplica la escala progresiva de las 7 CCAA
      // que la tienen, en vez del tipo plano del primer tramo.
      impuesto = calcularITP(precio, ccaa);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva el importe no es un porcentaje plano del
      // precio, asi que mostrar el tipo nominal contradiria a la cifra de al lado.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
      ajd = 0;
    }

    const notaria = estimarFacturaNotarial(precio);

    const notario = notaria.medio;
    const registro = calcularRegistro(precio);

    const totalGastos = impuesto + ajd + notario + registro + gestoria;

    return {
      precioInmueble: precio,
      impuestoTransmision: impuesto,
      tipoImpuesto,
      porcentajeImpuesto: porcentaje,
      ajd,
      gastosNotario: notario,
      gastosNotarioMin: notaria.min,
      gastosNotarioMax: notaria.max,
      gastosRegistro: registro,
      gastosGestoria: gestoria,
      totalGastos,
      totalOperacion: precio + totalGastos,
      ivaRecuperable,
    };
  }, [precioVenta, ccaa, tipoVendedor, gastosGestoria]);

  const datosCcaaActual = ITP_CCAA[ccaa];

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

      <LegalNotice lastUpdated="2025-01-15" />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-solar"
        collapsible={false}
      />

      {/* Aviso clave: quién vende decide el impuesto */}
      <div className={styles.ivaAviso} role="note">
        <strong><span aria-hidden="true">💡</span> Clave del solar:</strong> a diferencia del suelo rústico, el terreno edificable <strong>no
        está exento de IVA</strong>. Si lo vende un <strong>promotor o empresario</strong> pagas IVA 21% + AJD;
        si lo vende un <strong>particular</strong>, pagas ITP. En ambos casos, al ser suelo urbano, el vendedor
        paga <strong>plusvalía municipal</strong>.
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de vendedor */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>¿Quién vende el solar?</label>
            <div className={styles.transmisionGrid}>
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
                <span className={styles.transmisionSub}>Paga IVA 21% + AJD</span>
              </button>
            </div>
          </div>

          {esEmpresario && (
            <div className={styles.renunciaAviso} role="note">
              <strong><span aria-hidden="true">⚠️</span> Compra a promotor o empresa:</strong> el IVA del 21% es <strong>deducible</strong> si
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
            helperText="Precio escriturado o valor de referencia catastral (el mayor de ambos)"
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
                <span className={styles.infoCcaaLabel}>IVA (empresario)</span>
                <span className={styles.infoCcaaValue}>{IVA_SOLAR}%</span>
              </div>
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> Esta CCAA aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${t.tipo}%`).join(' → ')})
              </p>
            )}
            <p className={styles.infoCcaaNote}>
              Los solares tributan por el <strong>tipo general</strong> de ITP cuando vende un particular
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
                title={`${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 0)}%)`}
                value={formatCurrency(resultadosComprador.impuestoTransmision)}
                variant="warning"
                icon="📋"
                description={
                  esEmpresario
                    ? 'Deducible si eres empresa/autónomo sujeto a IVA; no deducible si autopromueves tu vivienda'
                    : 'Tipo general — los solares no tienen tipos reducidos de ITP'
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
                description={`Factura estimada entre ${formatCurrency(resultadosComprador.gastosNotarioMin)} y ${formatCurrency(resultadosComprador.gastosNotarioMax)}. El arancel cubre la matriz y una copia; las copias adicionales y los folios se facturan aparte y dependen de la extensión de la escritura.`}
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

              <div className={styles.renunciaAviso} role="note" style={{ marginTop: '0.25rem' }}>
                <strong>Recuerda:</strong> el solar es suelo urbano, así que el <strong>vendedor</strong> pagará
                además la <strong>plusvalía municipal</strong> (IIVTNU). No es un coste del comprador, pero puede
                influir en la negociación del precio.
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>Introduce el precio del solar para ver el desglose de gastos</p>
            </div>
          )}
        </div>
      </section>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía fiscal para la compra de un solar"
        subtitle="Quién vende decide el impuesto, y por qué el solar sí genera plusvalía municipal"
        icon="📚"
      >
        {/* Tabla comparativa según vendedor */}
        <section>
          <h2>El impuesto depende de quién venda</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Concepto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Vende promotor / empresa</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Vende particular</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Impuesto principal</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700, color: 'var(--primary)' }}>IVA 21%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700 }}>ITP (tipo general)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0' }}>AJD</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Sí (0,5%–1,5%)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>No</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>¿IVA deducible?</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', color: '#27ae60' }}>Sí (si actividad sujeta)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', color: '#c0392b' }}>No hay IVA</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px' }}>Plusvalía municipal (vendedor)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí (suelo urbano)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí (suelo urbano)</td>
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
              <strong><span aria-hidden="true">🏗️</span> Autopromotor compra parcela para su casa</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si compra a un promotor, paga IVA 21% + AJD y no lo deduce (es un particular). Si compra a un
                particular, paga ITP al tipo general. En ambos casos suma notaría y registro.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🏢</span> Promotora compra suelo para construir</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si compra a otro empresario, paga IVA 21% deducible en el modelo 303. Si compra a un particular,
                paga ITP, que no se recupera pero se incorpora al coste de la promoción.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🏛️</span> El vendedor y la plusvalía municipal</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Al ser suelo urbano, el vendedor paga plusvalía municipal por el incremento de valor del terreno.
                No es coste del comprador, pero conviene tenerlo en cuenta al negociar el precio.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
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
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Se paga IVA o ITP al comprar un solar?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Depende del vendedor. Si vende un promotor o empresario en el ejercicio de su actividad, la
                compra tributa por IVA al 21% más AJD. Si vende un particular, tributa por ITP al tipo general de
                la comunidad autónoma. Nunca se pagan IVA e ITP a la vez.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Por qué el solar no está exento de IVA como la finca rústica?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                La exención de IVA se aplica al terreno rústico y no edificable. Los solares y terrenos
                edificables quedan expresamente excluidos de esa exención, por lo que su entrega por un empresario
                está sujeta a IVA al 21%.
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
                incremento real, puede acreditarse la exención con las escrituras.
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
