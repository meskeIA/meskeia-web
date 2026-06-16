'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorSMI.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  ResultCard,
  ShareCard, RegionBadge
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber } from '@/lib';
import {
  FISCAL_SMI_META,
  SMI_2026,
  SMI_2025,
  SALARIOS_PROVINCIA_2023,
  SALARIO_MEDIO_NACIONAL_2023,
  COTIZACIONES_SS_2026,
  BASES_SS_2026,
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  calcularDeduccionRentasBajas,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal';

// ──────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────

type Tab = 'neto' | 'atrasos' | 'provincias';

type SortField = 'provincia' | 'salario' | 'ratio';
type SortDir = 'asc' | 'desc';

// ──────────────────────────────────────────
// CÁLCULOS SMI → NETO
// ──────────────────────────────────────────

function calcularSSMensual(brutoMensual: number): number {
  const base = Math.max(BASES_SS_2026.minima, Math.min(brutoMensual, BASES_SS_2026.maxima));
  const tipo = COTIZACIONES_SS_2026.contingenciasComunes
    + COTIZACIONES_SS_2026.desempleo
    + COTIZACIONES_SS_2026.formacionProfesional
    + COTIZACIONES_SS_2026.mef;
  return base * (tipo / 100);
}

function calcularIRPFAnual(brutoAnual: number): number {
  const ssMensual = calcularSSMensual(brutoAnual / 12);
  const ssAnual = ssMensual * 12;
  const rnt = Math.max(0, brutoAnual - ssAnual - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);

  // Reducción por rendimientos del trabajo (art. 20)
  const rd = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  let reduccion: number;
  if (rnt <= rd.limite1) reduccion = rd.reduccion1;
  else if (rnt < rd.limite2) reduccion = rd.reduccion1 - rd.factorInterpolacion * (rnt - rd.limite1);
  else reduccion = rd.reduccion2;

  const baseImponible = Math.max(0, rnt - reduccion);
  const baseLiquidable = Math.max(0, baseImponible - MINIMOS_IRPF_2025.personal);

  // Cuota por tramos
  let cuota = 0;
  let restante = baseLiquidable;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    const base = Math.min(restante, tramo.hasta - anterior);
    if (base <= 0) break;
    cuota += base * (tramo.tipo / 100);
    restante -= base;
    anterior = tramo.hasta;
  }

  // Deducción rentas bajas (art. 80 bis)
  const deduccion = calcularDeduccionRentasBajas(rnt, 0);
  return Math.max(0, cuota - deduccion);
}

function calcularNetoSMI(pagas: 12 | 14) {
  const brutoAnual = SMI_2026.anual;
  const ssMensual = calcularSSMensual(brutoAnual / 12);
  const ssAnual = ssMensual * 12;
  const irpfAnual = calcularIRPFAnual(brutoAnual);
  const netoAnual = brutoAnual - ssAnual - irpfAnual;
  const netoMensual = netoAnual / pagas;

  // RNT para mostrar deducción
  const rnt = Math.max(0, brutoAnual - ssAnual - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);
  const deduccionRentasBajas = calcularDeduccionRentasBajas(rnt, 0);

  return {
    brutoAnual,
    brutoMensual: brutoAnual / pagas,
    ssAnual,
    ssMensual,
    irpfAnual,
    irpfPct: brutoAnual > 0 ? (irpfAnual / brutoAnual) * 100 : 0,
    netoAnual,
    netoMensual,
    deduccionRentasBajas,
  };
}

// ──────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function EstimadorSMIPage() {
  const [tab, setTab] = useState<Tab>('neto');
  const [pagas, setPagas] = useState<12 | 14>(14);
  const [mesCobro, setMesCobro] = useState(3); // Abril (0-indexed: 3)
  const [busqueda, setBusqueda] = useState('');
  const [sortField, setSortField] = useState<SortField>('ratio');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Tab 1: Neto
  const neto = useMemo(() => calcularNetoSMI(pagas), [pagas]);

  // Tab 2: Atrasos
  const atrasos = useMemo(() => {
    const diferenciaMensual14 = SMI_2026.mensual14 - SMI_2025.mensual14;
    const mesesRetroactivos = mesCobro + 1; // De enero al mes seleccionado (inclusive)
    const totalAtrasos = diferenciaMensual14 * mesesRetroactivos;
    return {
      diferenciaMensual14,
      mesesRetroactivos,
      totalAtrasos,
      smiAnterior: SMI_2025.mensual14,
      smiNuevo: SMI_2026.mensual14,
    };
  }, [mesCobro]);

  // Tab 3: Provincias
  const provinciasOrdenadas = useMemo(() => {
    const smiAnual = SMI_2026.anual;
    const datos = SALARIOS_PROVINCIA_2023.map(p => ({
      ...p,
      ratio: (smiAnual / p.salarioMedio) * 100,
    }));

    // Filtrar
    const filtradas = busqueda
      ? datos.filter(p =>
          p.provincia.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.ccaa.toLowerCase().includes(busqueda.toLowerCase())
        )
      : datos;

    // Ordenar
    return filtradas.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'provincia') cmp = a.provincia.localeCompare(b.provincia);
      else if (sortField === 'salario') cmp = a.salarioMedio - b.salarioMedio;
      else cmp = a.ratio - b.ratio;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [busqueda, sortField, sortDir]);

  const provinciasSupera60 = useMemo(() => {
    const smiAnual = SMI_2026.anual;
    return SALARIOS_PROVINCIA_2023.filter(p => (smiAnual / p.salarioMedio) * 100 >= 60).length;
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'provincia' ? 'asc' : 'desc');
    }
  };

  const ratioNacional = (SMI_2026.anual / SALARIO_MEDIO_NACIONAL_2023) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">💶</span> Estimador SMI 2026
          </h1>
          <p className={styles.subtitle}>
            Salario Mínimo Interprofesional: neto, atrasos y comparativa provincial
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{formatCurrency(SMI_2026.mensual14).replace(',00', '')}</span>
              <span className={styles.heroStatLabel}>brutos/mes (14 pagas)</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{formatCurrency(SMI_2026.anual).replace(',00', '')}</span>
              <span className={styles.heroStatLabel}>brutos/año</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>+{formatNumber(SMI_2026.incrementoPct, 1)}%</span>
              <span className={styles.heroStatLabel}>vs 2025</span>
            </div>
          </div>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical" context="estimador-smi" />
        <DataReference
          normativa="SMI 2026 + Salarios provinciales AEAT 2023"
          fuente={FISCAL_SMI_META.fuente}
          verificado={FISCAL_SMI_META.verificado}
          urlOficial={FISCAL_SMI_META.urlOficial}
        />

        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Secciones del estimador SMI">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'neto'}
            className={`${styles.tab} ${tab === 'neto' ? styles.tabActive : ''}`}
            onClick={() => setTab('neto')}
          >
            <span aria-hidden="true">💰</span> Tu neto
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'atrasos'}
            className={`${styles.tab} ${tab === 'atrasos' ? styles.tabActive : ''}`}
            onClick={() => setTab('atrasos')}
          >
            <span aria-hidden="true">📅</span> Atrasos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'provincias'}
            className={`${styles.tab} ${tab === 'provincias' ? styles.tabActive : ''}`}
            onClick={() => setTab('provincias')}
          >
            <span aria-hidden="true">📊</span> Por provincia
          </button>
        </div>

        {/* ─── TAB 1: NETO ─── */}
        {tab === 'neto' && (
          <>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span aria-hidden="true">💰</span> ¿Cuánto cobras neto con el SMI 2026?
              </h2>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="pagas">Número de pagas</label>
                <select
                  id="pagas"
                  className={styles.select}
                  value={pagas}
                  onChange={e => setPagas(parseInt(e.target.value) as 12 | 14)}
                >
                  <option value={14}>14 pagas (estándar)</option>
                  <option value={12}>12 pagas (prorrateadas)</option>
                </select>
              </div>
            </div>

            <div className={styles.resultsGrid}>
              <ResultCard
                title="Neto mensual"
                value={formatNumber(neto.netoMensual, 2)}
                unit="€"
                variant="highlight"
                icon="✅"
                description={`En ${pagas} pagas`}
              />
              <ResultCard
                title="Neto anual"
                value={formatNumber(neto.netoAnual, 2)}
                unit="€"
                variant="success"
                icon="💶"
              />
              <ResultCard
                title="Bruto mensual"
                value={formatNumber(neto.brutoMensual, 2)}
                unit="€"
                variant="default"
                icon="💼"
                description={`En ${pagas} pagas`}
              />
              <ResultCard
                title="IRPF efectivo"
                value={formatNumber(neto.irpfPct, 2)}
                unit="%"
                variant="info"
                icon="📊"
              />
            </div>

            <div className={styles.desglose}>
              <h3 className={styles.desgloseTitle}><span aria-hidden="true">📋</span> Desglose anual</h3>
              <div className={styles.desgloseRow}>
                <span>Salario bruto anual</span>
                <span className={styles.desgloseValue}>{formatCurrency(neto.brutoAnual)}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span>Seguridad Social (trabajador)</span>
                <span className={styles.desgloseValue}>-{formatCurrency(neto.ssAnual)}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span>IRPF</span>
                <span className={styles.desgloseValue}>-{formatCurrency(neto.irpfAnual)}</span>
              </div>
              {neto.deduccionRentasBajas > 0 && (
                <div className={styles.desgloseRow}>
                  <span>Deducción rentas bajas (art. 80 bis)</span>
                  <span className={styles.desgloseValue} style={{ color: '#27ae60' }}>
                    +{formatCurrency(neto.deduccionRentasBajas)}
                  </span>
                </div>
              )}
              <div className={styles.desgloseRow}>
                <span><strong>Salario neto anual</strong></span>
                <span className={`${styles.desgloseValue} ${styles.desgloseHighlight}`}>
                  {formatCurrency(neto.netoAnual)}
                </span>
              </div>
            </div>

            <div className={styles.tipBox}>
              <p>
                <strong>Dato:</strong> Con el SMI 2026 y sin hijos a cargo, un trabajador soltero
                cobra aproximadamente <strong>{formatCurrency(neto.netoMensual)}</strong> netos al mes
                en {pagas} pagas. El IRPF aplicable es muy bajo ({formatNumber(neto.irpfPct, 2)}%)
                gracias a las reducciones por rendimientos del trabajo y la deducción por rentas bajas.
              </p>
            </div>
          </>
        )}

        {/* ─── TAB 2: ATRASOS ─── */}
        {tab === 'atrasos' && (
          <>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span aria-hidden="true">📅</span> ¿Cuánto te deben de atrasos?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
                El SMI 2026 es retroactivo desde el 1 de enero. Si tu empresa aún te paga con el SMI 2025,
                te debe la diferencia acumulada hasta que actualice tu nómina.
              </p>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="mesCobro">¿En qué mes te actualizan la nómina?</label>
                <select
                  id="mesCobro"
                  className={styles.select}
                  value={mesCobro}
                  onChange={e => setMesCobro(parseInt(e.target.value))}
                >
                  {MESES.map((mes, i) => (
                    <option key={i} value={i}>{mes} 2026</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.atrasosResultado} role="status" aria-live="polite">
                <div className={styles.atrasosImporte}>
                  {formatCurrency(atrasos.totalAtrasos)}
                </div>
                <p className={styles.atrasosDetalle}>
                  Atrasos brutos acumulados de enero a {MESES[mesCobro].toLowerCase()} 2026
                </p>
              </div>
            </div>

            <div className={styles.desglose}>
              <h3 className={styles.desgloseTitle}><span aria-hidden="true">🔍</span> Detalle del cálculo</h3>
              <div className={styles.desgloseRow}>
                <span>SMI 2025 (14 pagas)</span>
                <span className={styles.desgloseValue}>{formatCurrency(atrasos.smiAnterior)}/mes</span>
              </div>
              <div className={styles.desgloseRow}>
                <span>SMI 2026 (14 pagas)</span>
                <span className={styles.desgloseValue}>{formatCurrency(atrasos.smiNuevo)}/mes</span>
              </div>
              <div className={styles.desgloseRow}>
                <span>Diferencia mensual</span>
                <span className={styles.desgloseValue} style={{ color: '#27ae60' }}>
                  +{formatCurrency(atrasos.diferenciaMensual14)}
                </span>
              </div>
              <div className={styles.desgloseRow}>
                <span>Meses acumulados</span>
                <span className={styles.desgloseValue}>{atrasos.mesesRetroactivos}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span><strong>Total atrasos brutos</strong></span>
                <span className={`${styles.desgloseValue} ${styles.desgloseHighlight}`}>
                  {formatCurrency(atrasos.totalAtrasos)}
                </span>
              </div>
            </div>

            <div className={styles.tipBox}>
              <p>
                <strong>Importante:</strong> Los atrasos mostrados son en bruto. Al cobrarlos,
                se aplicará retención de IRPF y Seguridad Social. Tu empresa está obligada a
                pagarte la diferencia retroactiva desde el 1 de enero de 2026.
              </p>
            </div>
          </>
        )}

        {/* ─── TAB 3: PROVINCIAS ─── */}
        {tab === 'provincias' && (
          <>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span aria-hidden="true">📊</span> SMI vs salario medio por provincia
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
                El SMI 2026 ({formatCurrency(SMI_2026.anual).replace(',00', '')}/año) supera el 60% del salario medio
                en <strong>{provinciasSupera60} de 52 provincias</strong>. La media nacional
                es {formatCurrency(SALARIO_MEDIO_NACIONAL_2023).replace(',00', '')} (ratio: {formatNumber(ratioNacional, 1)}%).
              </p>

              <input
                type="text"
                className={styles.provinciaSearch}
                placeholder="Buscar provincia o comunidad..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                aria-label="Buscar provincia o comunidad autónoma"
              />
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.provinciaTable}>
                <thead>
                  <tr>
                    <th>
                      <button type="button" className={styles.sortBtn} onClick={() => toggleSort('provincia')} aria-pressed={sortField === 'provincia'}>
                        Provincia {sortField === 'provincia' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </button>
                    </th>
                    <th>
                      <button type="button" className={styles.sortBtn} onClick={() => toggleSort('salario')} aria-pressed={sortField === 'salario'}>
                        Salario medio {sortField === 'salario' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </button>
                    </th>
                    <th>
                      <button type="button" className={styles.sortBtn} onClick={() => toggleSort('ratio')} aria-pressed={sortField === 'ratio'}>
                        SMI/Salario {sortField === 'ratio' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {provinciasOrdenadas.map(p => {
                    const barClass = p.ratio >= 80 ? styles.ratioBarHigh
                      : p.ratio >= 60 ? styles.ratioBarMedium
                      : styles.ratioBarLow;
                    return (
                      <tr key={p.provincia}>
                        <td>{p.provincia}</td>
                        <td>{formatCurrency(p.salarioMedio).replace(',00', '')}</td>
                        <td>
                          <div className={styles.ratioBar}>
                            <div className={styles.ratioBarTrack}>
                              <div
                                className={`${styles.ratioBarFill} ${barClass}`}
                                style={{ width: `${Math.min(p.ratio, 100)}%` }}
                              />
                            </div>
                            <span className={styles.ratioText}>{formatNumber(p.ratio, 1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.tipBox}>
              <p>
                <strong>Nota metodológica:</strong> Los salarios provinciales son la media AEAT 2023
                (incluye contratos parciales). País Vasco y Navarra usan dato autonómico INE EAES 2023.
                Un ratio alto significa que el SMI representa un porcentaje mayor del sueldo medio local.
              </p>
            </div>
          </>
        )}

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="📚 Todo sobre el SMI 2026"
          subtitle="Datos, derechos y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">📊</span> Evolución reciente del SMI</h2>
            <ul>
              <li><strong>2024:</strong> 1.134 €/mes (15.876 €/año)</li>
              <li><strong>2025:</strong> 1.184 €/mes (16.576 €/año) — +4,4%</li>
              <li><strong>2026:</strong> 1.221 €/mes (17.094 €/año) — +3,1%</li>
            </ul>
            <p>El objetivo del Gobierno es que el SMI alcance el 60% del salario medio, como recomienda la Carta Social Europea.</p>

            <h2><span aria-hidden="true">🎯</span> 4 situaciones frecuentes</h2>

            <h3>1. Me pagan el SMI en 12 pagas</h3>
            <p>Si tu convenio distribuye el salario en 12 pagas (con extras prorrateadas), tu bruto mensual es {formatCurrency(SMI_2026.mensual12)} en lugar de {formatCurrency(SMI_2026.mensual14)}. El total anual es el mismo: {formatCurrency(SMI_2026.anual)}.</p>

            <h3>2. Trabajo a tiempo parcial</h3>
            <p>El SMI se aplica de forma proporcional a la jornada. Si trabajas al 50%, tu SMI mínimo es la mitad: {formatCurrency(SMI_2026.mensual14 / 2)}/mes en 14 pagas.</p>

            <h3>3. Empleada del hogar</h3>
            <p>El SMI por hora para empleados del hogar es de {formatCurrency(SMI_2026.hogarHora)}/hora en 2026. Incluye la parte proporcional de pagas extras y vacaciones.</p>

            <h3>4. Mi empresa no me ha subido el sueldo</h3>
            <p>La subida del SMI es retroactiva desde el 1 de enero de 2026. Tu empresa está obligada a pagarte la diferencia acumulada. Si no lo hace, puedes reclamar ante la Inspección de Trabajo.</p>

            <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>

            <h3>¿El SMI es bruto o neto?</h3>
            <p>Siempre bruto. El neto depende de tu situación personal (IRPF, Seguridad Social). Para trabajadores sin hijos con el SMI, el IRPF es muy bajo.</p>

            <h3>¿Puedo cobrar menos del SMI?</h3>
            <p>No, si trabajas a jornada completa. Es el mínimo legal inderogable. Si tu convenio fija un salario base inferior al SMI, se aplica el SMI como suelo.</p>

            <h3>¿El SMI incluye pagas extras?</h3>
            <p>Sí. Los {formatCurrency(SMI_2026.anual)} anuales incluyen las 2 pagas extras. En 14 pagas son {formatCurrency(SMI_2026.mensual14)}/mes; en 12 son {formatCurrency(SMI_2026.mensual12)}/mes.</p>

            <h3>¿Afecta el SMI a mi prestación por desempleo?</h3>
            <p>Indirectamente. El tope mínimo de la prestación contributiva está vinculado al IPREM, no al SMI. Pero las bases de cotización sí se actualizan.</p>

            <h3>¿Cuándo se publicó el SMI 2026?</h3>
            <p>El Real Decreto 126/2026 se publicó en el BOE el 19 de febrero de 2026, con efectos retroactivos desde el 1 de enero de 2026.</p>

            <h3>¿El SMI se embarga?</h3>
            <p>El SMI es inembargable en su totalidad. Solo se pueden embargar las cantidades que excedan del SMI, según la escala del art. 607 LEC.</p>

            <h3>¿Afecta el SMI a los autónomos?</h3>
            <p>No directamente. Los autónomos cotizan por tramos según sus ingresos reales (sistema RETA 2023+). El SMI solo aplica a trabajadores por cuenta ajena y empleados del hogar.</p>

            <h3>¿Qué pasa si cobro complementos además del SMI?</h3>
            <p>Los complementos salariales (antigüedad, nocturnidad, peligrosidad) se suman al SMI. Tu salario total será el SMI más los complementos que fije tu convenio.</p>

            <h2><span aria-hidden="true">📝</span> Cómo reclamar atrasos del SMI</h2>
            <ol>
              <li><strong>Comprueba tu nómina:</strong> Verifica que tu salario base de enero en adelante ya refleja los {formatCurrency(SMI_2026.mensual14)} (14 pagas) o {formatCurrency(SMI_2026.mensual12)} (12 pagas).</li>
              <li><strong>Habla con tu empresa:</strong> La mayoría de empresas regularizan los atrasos en la primera nómina tras la publicación del BOE.</li>
              <li><strong>Plazo:</strong> Si en 1-2 meses no te pagan la diferencia, reclama por escrito.</li>
              <li><strong>Inspección de Trabajo:</strong> Si la empresa se niega, denuncia ante la Inspección de Trabajo y Seguridad Social.</li>
              <li><strong>Demanda laboral:</strong> Como último recurso, demanda ante el Juzgado de lo Social. No necesitas abogado ni procurador.</li>
              <li><strong>Prescripción:</strong> Tienes 1 año para reclamar diferencias salariales (art. 59.1 ET).</li>
            </ol>

            <h2><span aria-hidden="true">💡</span> Datos clave del SMI</h2>
            <ul>
              <li>El SMI se fija anualmente por Real Decreto del Gobierno, previa consulta con los sindicatos y la patronal.</li>
              <li>En 2026 afecta a unos 2,5 millones de trabajadores directamente.</li>
              <li>El SMI es referencia para becas, ayudas públicas y umbrales de acceso a prestaciones.</li>
              <li>El salario medio en España (AEAT 2023) es de {formatCurrency(SALARIO_MEDIO_NACIONAL_2023)} — el SMI representa el {formatNumber(ratioNacional, 1)}%.</li>
              <li>El objetivo de la UE (Directiva 2022/2041) es que el salario mínimo sea al menos el 60% del salario mediano.</li>
              <li>España tiene el 5.º SMI más alto de la UE en términos absolutos (tras Luxemburgo, Irlanda, Alemania y Países Bajos).</li>
            </ul>

            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> Errores frecuentes</h3>
              <ul>
                <li>Confundir el SMI bruto con el neto — el bruto siempre es mayor</li>
                <li>Creer que el SMI en 12 pagas es menor que en 14 — el total anual es idéntico</li>
                <li>Pensar que los complementos absorben el SMI — el SMI es el salario base mínimo</li>
                <li>No reclamar atrasos por desconocimiento — la retroactividad es obligatoria</li>
                <li>Confundir SMI con IPREM — son indicadores distintos con usos diferentes</li>
                <li>Asumir que los autónomos cobran el SMI — no aplica a trabajadores por cuenta propia</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('estimador-smi')} />
        <ShareCard appName="estimador-smi" />
        <Footer appName="estimador-smi" />
    </div>
  );
}
