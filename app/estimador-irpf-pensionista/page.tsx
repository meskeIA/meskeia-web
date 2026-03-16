'use client';

import { useState } from 'react';
import styles from './EstimadorIrpfPensionista.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TramoEdad = 'menos65' | '65_74' | '75_mas';

interface ResultadoIrpfPensionista {
  rendimientosIntegros: number;
  gastosDeducibles: number;
  rendimientosNetos: number;
  reduccionRRT: number;
  rendimientosNetosReducidos: number;
  minimoPersonal: number;
  baseImponible: number;
  cuotaBase: number;
  cuotaMinimo: number;
  cuotaIRPF: number;
  tipoEfectivo: number;
  pensionNetaMensual: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularCuotaIRPF(base: number): number {
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= anterior) break;
    const enTramo = Math.min(base, tramo.hasta) - anterior;
    cuota += enTramo * tramo.tipo / 100;
    anterior = tramo.hasta;
  }
  return cuota;
}

function calcularReduccionRRT(rnt: number): number {
  const { limite1, reduccion1, limite2, reduccion2, factorInterpolacion } = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= limite1) return reduccion1;
  if (rnt >= limite2) return reduccion2;
  return reduccion1 - factorInterpolacion * (rnt - limite1);
}

function minimoPersonalPorEdad(tramo: TramoEdad): number {
  if (tramo === '75_mas') return MINIMOS_IRPF_2025.personal_75;
  if (tramo === '65_74') return MINIMOS_IRPF_2025.personal_65;
  return MINIMOS_IRPF_2025.personal;
}

function estimarIrpfPensionista(
  pensionMensual: number,
  rescatePP: number,
  otrosIngresos: number,
  tramo: TramoEdad
): ResultadoIrpfPensionista {
  // Pensión con 14 pagas para cálculo anual IRPF
  const pensionAnual = pensionMensual * 14;
  const rendimientosIntegros = pensionAnual + rescatePP + otrosIngresos;

  // Gastos deducibles generales
  const gastosDeducibles = GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral;

  // Rendimientos netos del trabajo
  const rendimientosNetos = Math.max(0, rendimientosIntegros - gastosDeducibles);

  // Reducción por rendimientos del trabajo (si son los únicos ingresos relevantes)
  const reduccionRRT = calcularReduccionRRT(rendimientosNetos);

  // Rendimientos netos reducidos = base imponible aproximada
  const rendimientosNetosReducidos = Math.max(0, rendimientosNetos - reduccionRRT);

  // Mínimo personal según edad
  const minimoPersonal = minimoPersonalPorEdad(tramo);

  // Base imponible
  const baseImponible = rendimientosNetosReducidos;

  // Cuota íntegra sobre base - cuota sobre mínimo personal
  const cuotaBase = calcularCuotaIRPF(baseImponible);
  const cuotaMinimo = calcularCuotaIRPF(minimoPersonal);
  const cuotaIRPF = Math.max(0, cuotaBase - cuotaMinimo);

  const tipoEfectivo = rendimientosIntegros > 0 ? (cuotaIRPF / rendimientosIntegros) * 100 : 0;

  // Pensión neta mensual (resta el IRPF anual dividido por 14 pagas)
  const irpfMensual = cuotaIRPF / 14;
  const pensionNetaMensual = Math.max(0, pensionMensual - irpfMensual);

  return {
    rendimientosIntegros,
    gastosDeducibles,
    rendimientosNetos,
    reduccionRRT,
    rendimientosNetosReducidos,
    minimoPersonal,
    baseImponible,
    cuotaBase,
    cuotaMinimo,
    cuotaIRPF,
    tipoEfectivo,
    pensionNetaMensual,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorIrpfPensionista() {
  const [pensionMensual, setPensionMensual] = useState('');
  const [rescatePP, setRescatePP] = useState('0');
  const [otrosIngresos, setOtrosIngresos] = useState('0');
  const [tramo, setTramo] = useState<TramoEdad>('65_74');
  const [resultado, setResultado] = useState<ResultadoIrpfPensionista | null>(null);
  const [error, setError] = useState('');

  function calcular() {
    setError('');
    const pension = parseFloat(pensionMensual.replace(',', '.'));
    const rescate = parseFloat(rescatePP.replace(',', '.')) || 0;
    const otros = parseFloat(otrosIngresos.replace(',', '.')) || 0;

    if (isNaN(pension) || pension < 100 || pension > 10000) { setError('Introduce tu pensión mensual bruta (entre 100 y 10.000 €).'); return; }
    if (rescate < 0 || rescate > 500000) { setError('El rescate de plan de pensiones debe estar entre 0 y 500.000 €.'); return; }
    if (otros < 0 || otros > 100000) { setError('Los otros ingresos anuales deben estar entre 0 y 100.000 €.'); return; }

    setResultado(estimarIrpfPensionista(pension, rescate, otros, tramo));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>Estimador IRPF Pensionista</h1>
        <p className={styles.subtitle}>Cuánto pagas de renta siendo jubilado y cuál es tu pensión neta real · 2025</p>
      </header>

      <DisclaimerCard variant="financial">
        <span>
          Esta herramienta es SOLO orientativa. El IRPF real depende de toda tu situación personal, familiar y de las deducciones autonómicas.
          <br /><strong>No es</strong> asesoramiento fiscal personalizado ni sustituye a la declaración de la renta.
          <br />Los cálculos aplican tramos estatales + autonómicos medios. Cada comunidad autónoma puede tener variaciones. Datos IRPF {FISCAL_IRPF_META.vigencia}.
          <br /><strong>Consulta con la Agencia Tributaria o un asesor fiscal</strong> antes de tomar decisiones.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tus datos</h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="tramoEdad">Tu edad</label>
            <select
              id="tramoEdad"
              className={styles.select}
              value={tramo}
              onChange={e => setTramo(e.target.value as TramoEdad)}
            >
              <option value="menos65">Menos de 65 años</option>
              <option value="65_74">Entre 65 y 74 años</option>
              <option value="75_mas">75 años o más</option>
            </select>
            <p className={styles.hint}>
              {tramo === '75_mas'
                ? `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal_75)}`
                : tramo === '65_74'
                  ? `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal_65)}`
                  : `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal)}`}
            </p>
          </div>

          <NumberInput
            value={pensionMensual}
            onChange={setPensionMensual}
            label="Pensión mensual bruta (€/mes)"
            placeholder="Ej: 1.400"
            helperText="El importe bruto mensual que recibes de la Seguridad Social (antes de IRPF)."
            min={100}
            max={10000}
          />

          <NumberInput
            value={rescatePP}
            onChange={setRescatePP}
            label="Rescate de plan de pensiones este año (€)"
            placeholder="0"
            helperText="Si rescatas un plan de pensiones, se suma como rendimiento del trabajo. Pon 0 si no aplica."
            min={0}
            max={500000}
          />

          <NumberInput
            value={otrosIngresos}
            onChange={setOtrosIngresos}
            label="Otros ingresos anuales sujetos a IRPF (€/año)"
            placeholder="0"
            helperText="Alquileres, trabajo parcial, pensión de viudedad u otros. Pon 0 si no aplica."
            min={0}
            max={100000}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Estimar IRPF pensionista">
            Estimar mi IRPF como pensionista
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Estimación orientativa IRPF</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa el botón para estimar tu IRPF como pensionista.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Rendimientos íntegros totales (anuales)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.rendimientosIntegros)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Gastos deducibles generales</span>
                <span className={styles.resultValue}>-{formatCurrency(resultado.gastosDeducibles)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Reducción por rendimientos del trabajo</span>
                <span className={styles.resultValue}>-{formatCurrency(resultado.reduccionRRT)}</span>
              </div>

              <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                <span className={styles.resultLabel}>Base imponible estimada</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.baseImponible)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Mínimo personal (edad)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.minimoPersonal)}</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Cuota IRPF estimada anual</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.cuotaIRPF)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Tipo efectivo estimado</span>
                <span className={styles.resultValue}>{formatNumber(resultado.tipoEfectivo, 1)}%</span>
              </div>

              <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                <span className={styles.resultLabel}>Pensión neta mensual estimada</span>
                <span className={styles.resultValueBig}>{formatCurrency(resultado.pensionNetaMensual)}/mes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo tributa la pensión en el IRPF?" subtitle="Rendimientos del trabajo, reducciones y mínimos para jubilados · 2025">
        <p>La pensión pública de jubilación tributa como <strong>rendimiento del trabajo</strong>, igual que un salario. Sin embargo, los pensionistas tienen ventajas fiscales específicas que reducen su factura.</p>
        <h3>Reducción por rendimientos del trabajo</h3>
        <p>Si tus únicos ingresos son la pensión, aplica una reducción en función de tu renta neta:</p>
        <ul>
          <li>Renta neta ≤ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)}: reducción de {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)}</li>
          <li>Entre {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)} y {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: reducción proporcional</li>
          <li>Renta neta &gt; {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: reducción de {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion2)}</li>
        </ul>
        <h3>Mínimo personal por edad</h3>
        <p>El mínimo personal genera una deducción efectiva sobre la cuota:</p>
        <ul>
          <li>General (hasta 65 años): {formatCurrency(MINIMOS_IRPF_2025.personal)}</li>
          <li>De 65 a 74 años: {formatCurrency(MINIMOS_IRPF_2025.personal_65)}</li>
          <li>75 años o más: {formatCurrency(MINIMOS_IRPF_2025.personal_75)}</li>
        </ul>
        <h3>Rescate del plan de pensiones</h3>
        <p>El rescate se suma íntegramente a los rendimientos del trabajo. Un rescate grande en forma de capital puede subir tu tipo marginal significativamente. Generalmente conviene rescatar en renta mensual para suavizar el impacto fiscal.</p>
        <h3>¿Quién está obligado a declarar?</h3>
        <p>Los pensionistas con única fuente de ingresos y pensión inferior a 22.000 €/año no están obligados a presentar declaración (salvo que tengan otras fuentes). Con varios pagadores, el límite baja a 15.000 €/año.</p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-irpf-pensionista')} />
      <ShareCard appName="estimador-irpf-pensionista" />
      <Footer appName="estimador-irpf-pensionista" />
    </div>
  );
}
