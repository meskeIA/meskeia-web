'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './PlanificadorTrimestresFreelance.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ============================================================================
// DATOS ESTÁTICOS — Trimestres fiscales del autónomo español
// ============================================================================

interface TrimestreInfo {
  id: string;
  nombre: string;
  meses: string[];
  mesesAbrev: string[];
  fechaModelo: string;
  modelos: string[];
  alerta: string | null;
}

const TRIMESTRES: TrimestreInfo[] = [
  {
    id: 'Q1',
    nombre: '1er Trimestre',
    meses: ['Enero', 'Febrero', 'Marzo'],
    mesesAbrev: ['Ene', 'Feb', 'Mar'],
    fechaModelo: '20 de abril',
    modelos: ['Modelo 303 (IVA)', 'Modelo 130 (IRPF)'],
    alerta: null,
  },
  {
    id: 'Q2',
    nombre: '2do Trimestre',
    meses: ['Abril', 'Mayo', 'Junio'],
    mesesAbrev: ['Abr', 'May', 'Jun'],
    fechaModelo: '20 de julio',
    modelos: ['Modelo 303 (IVA)', 'Modelo 130 (IRPF)'],
    alerta: null,
  },
  {
    id: 'Q3',
    nombre: '3er Trimestre',
    meses: ['Julio', 'Agosto', 'Septiembre'],
    mesesAbrev: ['Jul', 'Ago', 'Sep'],
    fechaModelo: '20 de octubre',
    modelos: ['Modelo 303 (IVA)', 'Modelo 130 (IRPF)'],
    alerta: '⚠️ Agosto: baja actividad habitual. Planifica con antelación.',
  },
  {
    id: 'Q4',
    nombre: '4to Trimestre',
    meses: ['Octubre', 'Noviembre', 'Diciembre'],
    mesesAbrev: ['Oct', 'Nov', 'Dic'],
    fechaModelo: '30 de enero (año siguiente)',
    modelos: [
      'Modelo 303 (IVA)',
      'Modelo 130 (IRPF)',
      'Modelo 390 (resumen anual IVA)',
      'Modelo 190 (resumen retenciones)',
    ],
    alerta: '⚠️ Diciembre: cierre fiscal. Revisa gastos deducibles antes de fin de año.',
  },
];

// Meses con presentación de modelos y meses de alerta
const MESES_FISCALES = new Set([3, 6, 9]); // abril=3, julio=6, octubre=9 (0-indexed)
const MES_FISCAL_Q4 = 0; // enero siguiente
const MESES_ALERTA = new Set([7, 11]); // agosto=7, diciembre=11

// ============================================================================
// TIPOS
// ============================================================================

interface TrimestreData {
  ingresos: string;
  gastosExtras: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PlanificadorTrimestresFreelancePage() {
  // Estado: objetivos globales
  const [objetivoAnual, setObjetivoAnual] = useState('36000');
  const [gastosFijosMensuales, setGastosFijosMensuales] = useState('1500');

  // Estado: datos por trimestre
  const [trimestresData, setTrimestresData] = useState<TrimestreData[]>([
    { ingresos: '', gastosExtras: '0' },
    { ingresos: '', gastosExtras: '0' },
    { ingresos: '', gastosExtras: '0' },
    { ingresos: '', gastosExtras: '0' },
  ]);

  // Parsear valores numéricos
  const parseVal = useCallback((val: string): number => {
    const cleaned = val.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }, []);

  const objetivo = parseVal(objetivoAnual);
  const gastosFijos = parseVal(gastosFijosMensuales);
  const objetivoTrimestral = objetivo / 4;
  const objetivoMensual = objetivo / 12;

  // Actualizar trimestre
  const updateTrimestre = useCallback(
    (index: number, field: keyof TrimestreData, value: string) => {
      setTrimestresData((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  // Repartir equitativamente
  const repartirEquitativo = useCallback(() => {
    const porTrimestre = formatNumber(objetivo / 4, 0);
    setTrimestresData((prev) =>
      prev.map((t) => ({ ...t, ingresos: porTrimestre }))
    );
  }, [objetivo]);

  // Cálculos por trimestre
  const trimestresCalc = useMemo(() => {
    return trimestresData.map((data, i) => {
      const ingresos = parseVal(data.ingresos);
      const gastosExtras = parseVal(data.gastosExtras);
      const gastosFijosTri = gastosFijos * 3;
      const totalGastos = gastosFijosTri + gastosExtras;
      const beneficio = ingresos - totalGastos;
      const porcentaje = objetivoTrimestral > 0 ? (ingresos / objetivoTrimestral) * 100 : 0;
      const semaforo: 'green' | 'yellow' | 'red' =
        porcentaje >= 100 ? 'green' : porcentaje >= 80 ? 'yellow' : 'red';

      return {
        ...TRIMESTRES[i],
        ingresos,
        gastosExtras,
        gastosFijosTri,
        totalGastos,
        beneficio,
        porcentaje,
        semaforo,
      };
    });
  }, [trimestresData, gastosFijos, objetivoTrimestral, parseVal]);

  // Datos mensuales para la vista anual (reparte proporcionalmente por trimestre)
  const mesesData = useMemo(() => {
    return trimestresCalc.flatMap((tri, qi) =>
      [0, 1, 2].map((mi) => {
        const ingresoMensual = tri.ingresos / 3;
        return {
          nombre: TRIMESTRES[qi].mesesAbrev[mi],
          ingresos: ingresoMensual,
          trimestre: qi,
          esFiscal:
            qi < 3
              ? MESES_FISCALES.has(qi * 3 + mi)
              : mi === 2
                ? false
                : qi === 3 && mi === 2
                  ? false
                  : false,
          esAlerta: MESES_ALERTA.has(qi * 3 + mi),
        };
      })
    );
  }, [trimestresCalc]);

  // Marcar meses de presentación fiscal correctamente
  const mesesConFiscal = useMemo(() => {
    // abril (3), julio (6), octubre (9) → presentación modelos Q anterior
    // enero (0) → presentación Q4
    return mesesData.map((m, idx) => ({
      ...m,
      esFiscal: idx === 3 || idx === 6 || idx === 9 || idx === 0,
    }));
  }, [mesesData]);

  // Resumen anual
  const resumen = useMemo(() => {
    const totalIngresos = trimestresCalc.reduce((s, t) => s + t.ingresos, 0);
    const totalGastos = trimestresCalc.reduce((s, t) => s + t.totalGastos, 0);
    const beneficioBruto = totalIngresos - totalGastos;
    const porcentajeObj = objetivo > 0 ? (totalIngresos / objetivo) * 100 : 0;
    return { totalIngresos, totalGastos, beneficioBruto, porcentajeObj };
  }, [trimestresCalc, objetivo]);

  // Altura máxima para barras
  const maxIngreso = useMemo(() => {
    const maxMes = Math.max(...mesesConFiscal.map((m) => m.ingresos), objetivoMensual);
    return maxMes > 0 ? maxMes : 1;
  }, [mesesConFiscal, objetivoMensual]);

  const semaforoIcono = (s: 'green' | 'yellow' | 'red') =>
    s === 'green' ? '🟢' : s === 'yellow' ? '🟡' : '🔴';

  const barColorClass = (qi: number) =>
    qi === 0
      ? styles.monthBarQ1
      : qi === 1
        ? styles.monthBarQ2
        : qi === 2
          ? styles.monthBarQ3
          : styles.monthBarQ4;

  const progressColorClass = (s: 'green' | 'yellow' | 'red') =>
    s === 'green'
      ? styles.progressGreen
      : s === 'yellow'
        ? styles.progressYellow
        : styles.progressRed;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}>📅 Planificador Trimestral Freelance</h1>
          <p className={styles.subtitle}>
            Planifica tus 4 trimestres: ingresos, gastos, modelos fiscales y meses críticos
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        {/* Objetivos globales */}
        <section className={styles.objectivesSection}>
          <h2 className={styles.objectivesTitle}>
            <span aria-hidden="true">🎯</span> Objetivos anuales
          </h2>
          <div className={styles.objectivesGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="objetivo-anual">Objetivo de facturación anual (€)</label>
              <input
                id="objetivo-anual"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={objetivoAnual}
                onChange={(e) => setObjetivoAnual(e.target.value)}
                placeholder="36.000"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="gastos-fijos">Gastos fijos mensuales (€)</label>
              <input
                id="gastos-fijos"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={gastosFijosMensuales}
                onChange={(e) => setGastosFijosMensuales(e.target.value)}
                placeholder="1.500"
              />
            </div>
          </div>
          <button
            type="button"
            className={styles.btnEqualize}
            onClick={repartirEquitativo}
            aria-label="Repartir el objetivo equitativamente entre los 4 trimestres"
          >
            <span aria-hidden="true">⚖️</span> Repartir equitativamente
          </button>
        </section>

        {/* Inputs por trimestre */}
        <div className={styles.trimestresInputs}>
          {TRIMESTRES.map((tri, i) => (
            <div key={tri.id} className={styles.trimestreInput}>
              <div className={styles.trimestreInputTitle}>{tri.nombre}</div>
              <div className={styles.trimestreMeses}>{tri.meses.join(' · ')}</div>
              <div className={styles.inputGroup}>
                <label htmlFor={`ingresos-${tri.id}`}>Ingresos previstos (€)</label>
                <input
                  id={`ingresos-${tri.id}`}
                  type="text"
                  inputMode="decimal"
                  className={styles.inputField}
                  value={trimestresData[i].ingresos}
                  onChange={(e) => updateTrimestre(i, 'ingresos', e.target.value)}
                  placeholder={formatNumber(objetivoTrimestral, 0)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor={`gastos-${tri.id}`}>Gastos extras (€)</label>
                <input
                  id={`gastos-${tri.id}`}
                  type="text"
                  inputMode="decimal"
                  className={styles.inputField}
                  value={trimestresData[i].gastosExtras}
                  onChange={(e) => updateTrimestre(i, 'gastosExtras', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Vista anual — barras por mes */}
        <section className={styles.annualView}>
          <h2 className={styles.annualViewTitle}>
            <span aria-hidden="true">📊</span> Vista anual
          </h2>
          <div className={styles.monthsGrid}>
            {/* Línea de objetivo mensual */}
            {objetivoMensual > 0 && (
              <div
                className={styles.objectiveLine}
                style={{
                  bottom: `${(objetivoMensual / maxIngreso) * 160}px`,
                }}
              >
                <span className={styles.objectiveLabel}>
                  Objetivo: {formatCurrency(objetivoMensual)}
                </span>
              </div>
            )}

            {mesesConFiscal.map((mes, idx) => {
              const heightPx = maxIngreso > 0 ? (mes.ingresos / maxIngreso) * 160 : 4;
              return (
                <div key={idx} className={styles.monthColumn}>
                  <div className={styles.monthIcons}>
                    {mes.esFiscal && (
                      <span aria-hidden="true" title="Mes de presentación de modelos fiscales">📅</span>
                    )}
                    {mes.esAlerta && <span aria-hidden="true" title="Mes crítico">⚠️</span>}
                  </div>
                  <div className={styles.monthAmount}>
                    {mes.ingresos > 0 ? formatNumber(mes.ingresos / 1000, 1) + 'k' : '—'}
                  </div>
                  <div
                    className={`${styles.monthBar} ${barColorClass(mes.trimestre)}`}
                    style={{ height: `${Math.max(heightPx, 4)}px` }}
                    title={`${mes.nombre}: ${formatCurrency(mes.ingresos)}`}
                  />
                  <div className={styles.monthLabel}>{mes.nombre}</div>
                </div>
              );
            })}
          </div>

          <div className={styles.annualLegend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendQ1}`} />
              Q1
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendQ2}`} />
              Q2
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendQ3}`} />
              Q3
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendQ4}`} />
              Q4
            </div>
            <div className={styles.legendItem}>
              <span aria-hidden="true">📅</span> Presentación modelos
            </div>
            <div className={styles.legendItem}>
              <span aria-hidden="true">⚠️</span> Mes crítico
            </div>
          </div>
        </section>

        {/* Tarjetas por trimestre */}
        <div className={styles.trimestresCards}>
          {trimestresCalc.map((tri, i) => (
            <article key={tri.id} className={styles.trimestreCard}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardTitle}>{tri.nombre}</div>
                  <div className={styles.cardMeses}>{tri.meses.join(' · ')}</div>
                </div>
                <div className={styles.semaforo} aria-label={`Estado: ${tri.semaforo === 'green' ? 'cumplido' : tri.semaforo === 'yellow' ? 'casi cumplido' : 'por debajo'}`}>
                  {semaforoIcono(tri.semaforo)}
                </div>
              </div>

              {/* Barra de progreso */}
              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  <span>Ingresos vs objetivo</span>
                  <span>{formatNumber(Math.min(tri.porcentaje, 100), 0)}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${progressColorClass(tri.semaforo)}`}
                    style={{ width: `${Math.min(tri.porcentaje, 100)}%` }}
                  />
                </div>
              </div>

              {/* Estadísticas */}
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Ingresos</span>
                  <span className={styles.statValue}>{formatCurrency(tri.ingresos)}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Objetivo</span>
                  <span className={styles.statValue}>{formatCurrency(objetivoTrimestral)}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Gastos totales</span>
                  <span className={styles.statValue}>{formatCurrency(tri.totalGastos)}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Beneficio</span>
                  <span
                    className={`${styles.statValue} ${tri.beneficio >= 0 ? styles.statPositive : styles.statNegative}`}
                  >
                    {formatCurrency(tri.beneficio)}
                  </span>
                </div>
              </div>

              {/* Info fiscal */}
              <div className={styles.cardFiscal}>
                <div className={styles.fiscalDate}>
                  <span aria-hidden="true">📅</span>{' '}Presentación: {tri.fechaModelo}
                </div>
                <ul className={styles.fiscalModelos}>
                  {tri.modelos.map((modelo) => (
                    <li key={modelo}>{modelo}</li>
                  ))}
                </ul>
              </div>

              {/* Alerta si aplica */}
              {tri.alerta && (
                <div className={styles.cardAlert} role="alert">
                  {tri.alerta}
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Panel resumen anual */}
        <section className={styles.summaryPanel}>
          <h2 className={styles.summaryTitle}>
            <span aria-hidden="true">📋</span> Resumen anual
          </h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryItemLabel}>Total ingresos</div>
              <div className={styles.summaryItemValue}>
                {formatCurrency(resumen.totalIngresos)}
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryItemLabel}>Total gastos</div>
              <div className={styles.summaryItemValue}>
                {formatCurrency(resumen.totalGastos)}
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryItemLabel}>Beneficio bruto</div>
              <div
                className={styles.summaryItemValue}
                style={{
                  color: resumen.beneficioBruto >= 0 ? 'var(--color-green)' : 'var(--color-red)',
                }}
              >
                {formatCurrency(resumen.beneficioBruto)}
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryItemLabel}>% objetivo cubierto</div>
              <div className={styles.summaryItemValue}>
                {formatNumber(Math.min(resumen.porcentajeObj, 999), 1)}%
              </div>
            </div>
          </div>

          <div className={styles.summaryProgressContainer}>
            <div className={styles.summaryProgressLabel}>
              <span>Progreso hacia el objetivo anual</span>
              <span>
                {formatCurrency(resumen.totalIngresos)} / {formatCurrency(objetivo)}
              </span>
            </div>
            <div className={styles.summaryProgressBar}>
              <div
                className={styles.summaryProgressFill}
                style={{
                  width: `${Math.min(resumen.porcentajeObj, 100)}%`,
                  background:
                    resumen.porcentajeObj >= 100
                      ? 'var(--color-green)'
                      : resumen.porcentajeObj >= 80
                        ? 'var(--color-yellow)'
                        : 'var(--color-red)',
                }}
              />
            </div>
          </div>
        </section>

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 Todo sobre los trimestres fiscales del autónomo"
          subtitle="Modelos, plazos y consejos prácticos"
        >
          <section className={styles.guideSection}>
            <h2>Los 4 trimestres fiscales del autónomo español</h2>
            <p>
              Como autónomo en España, tu año fiscal se divide en 4 trimestres. Al final de cada
              uno, debes presentar los modelos correspondientes ante la Agencia Tributaria. Es
              fundamental planificar tus ingresos y gastos para no llevarte sorpresas.
            </p>

            <h3>Calendario de presentación</h3>
            <ul>
              <li>
                <strong>Q1 (enero-marzo)</strong>: presentación hasta el 20 de abril
              </li>
              <li>
                <strong>Q2 (abril-junio)</strong>: presentación hasta el 20 de julio
              </li>
              <li>
                <strong>Q3 (julio-septiembre)</strong>: presentación hasta el 20 de octubre
              </li>
              <li>
                <strong>Q4 (octubre-diciembre)</strong>: presentación hasta el 30 de enero del año
                siguiente (incluye resúmenes anuales)
              </li>
            </ul>

            <h2>Modelos fiscales: qué es cada uno</h2>
            <table className={styles.modelosTable}>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Qué es</th>
                  <th>Quién lo presenta</th>
                  <th>Periodicidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>303</strong></td>
                  <td>Autoliquidación de IVA</td>
                  <td>Todos los autónomos con actividad sujeta a IVA</td>
                  <td>Trimestral</td>
                </tr>
                <tr>
                  <td><strong>130</strong></td>
                  <td>Pago fraccionado del IRPF (estimación directa)</td>
                  <td>Autónomos en estimación directa sin retención en &gt;70% de facturas</td>
                  <td>Trimestral</td>
                </tr>
                <tr>
                  <td><strong>390</strong></td>
                  <td>Resumen anual de IVA</td>
                  <td>Todos los que presentan el 303</td>
                  <td>Anual (enero)</td>
                </tr>
                <tr>
                  <td><strong>190</strong></td>
                  <td>Resumen anual de retenciones e ingresos a cuenta</td>
                  <td>Autónomos que aplican retenciones a terceros</td>
                  <td>Anual (enero)</td>
                </tr>
              </tbody>
            </table>

            <h2>Preguntas frecuentes</h2>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                ¿Qué pasa si presento fuera de plazo?
              </div>
              <div className={styles.faqAnswer}>
                Hacienda aplica recargos por presentación extemporánea: 1% por cada mes de retraso
                (sin requerimiento previo). Si hay requerimiento, las sanciones pueden ir del 50% al
                150% de la cuota. Es mucho más barato presentar a tiempo, incluso si el resultado es
                cero.
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                ¿Puedo compensar IVA entre trimestres?
              </div>
              <div className={styles.faqAnswer}>
                Sí. Si en un trimestre el IVA soportado (gastos) supera al IVA repercutido
                (ingresos), puedes compensar ese saldo negativo en los trimestres siguientes del
                mismo año. También puedes solicitar la devolución en la declaración anual (modelo
                390).
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                ¿Cuándo pago la renta anual (IRPF)?
              </div>
              <div className={styles.faqAnswer}>
                La declaración de la renta se presenta entre abril y junio del año siguiente. Los
                pagos fraccionados trimestrales (modelo 130) son anticipos a cuenta de esa
                declaración final. Por eso es importante planificar: si has pagado poco con los 130,
                la renta anual puede suponer un pago importante.
              </div>
            </div>

            <h2>Consejos prácticos</h2>
            <ul className={styles.tipsList}>
              <li>
                <strong>Provisiona el 25-30% de tus ingresos para impuestos</strong>. Es la forma
                más segura de no quedarte sin liquidez cuando toque pagar IVA e IRPF.
              </li>
              <li>
                <strong>No gastes el IVA cobrado</strong>. El IVA que cobras a tus clientes no es
                tuyo: es de Hacienda. Sepáralo en una cuenta aparte o al menos no cuentes con él.
              </li>
              <li>
                <strong>Revisa gastos deducibles en Q4</strong>. Antes de que acabe el año, revisa
                si hay gastos deducibles que puedas adelantar (formación, material, seguros) para
                reducir la base imponible.
              </li>
              <li>
                <strong>Agosto y diciembre son meses trampa</strong>. En agosto la actividad baja
                pero los gastos fijos siguen. En diciembre llega el cierre fiscal con prisas.
                Planifica ambos con antelación.
              </li>
            </ul>

            <div className={styles.warningBox}>
              <p>
                <strong>Importante:</strong> No confundas facturación con beneficio. Facturar
                36.000 € al año no significa ganar 36.000 €: hay que descontar gastos fijos, gastos
                variables, IVA e IRPF. Además, en Q4 debes presentar los modelos 390 y 190
                (resúmenes anuales), que muchos autónomos olvidan.
              </p>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('planificador-trimestres-freelance')} />

        <ShareCard appName="planificador-trimestres-freelance" />

        <Footer appName="planificador-trimestres-freelance" />
    </div>
  );
}
