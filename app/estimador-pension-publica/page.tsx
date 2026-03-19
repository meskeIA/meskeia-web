'use client';

import { useState } from 'react';
import styles from './EstimadorPensionPublica.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_PENSIONES_META,
  COTIZACION_MINIMA,
  TRAMOS_PORCENTAJE_PENSION_2025,
  LIMITES_PENSION_2025,
  BASE_REGULADORA,
  EDAD_JUBILACION_2025,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ResultadoPension {
  baseReguladora: number;
  porcentajeAplicable: number;
  pensionBrutaMensual: number;
  pensionBrutaAnual: number;
  limitada: boolean;
  edadOrdinaria: string;
  mesesParaCien: number;
  porcentajeSobreMaxima: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularPorcentajePension(mesesCotizados: number): number {
  if (mesesCotizados < COTIZACION_MINIMA.mesesMinimosAcceso) return 0;

  let porcentaje = 50; // Base: 15 años

  for (const tramo of TRAMOS_PORCENTAJE_PENSION_2025) {
    if (mesesCotizados <= tramo.mesesDesde) break;
    const mesesEnTramo = Math.min(mesesCotizados, tramo.mesesHasta) - tramo.mesesDesde;
    if (mesesEnTramo > 0) {
      porcentaje += mesesEnTramo * tramo.incrementoPorMes;
    }
  }

  return Math.min(100, porcentaje);
}

function calcularEdadOrdinaria(mesesCotizados: number): string {
  if (mesesCotizados >= EDAD_JUBILACION_2025.mesesCotizadosParaJubilacion65) {
    return '65 años';
  }
  return '66 años y 6 meses';
}

function estimarPension(
  baseMensualMedia: number,
  anosCotizados: number
): ResultadoPension {
  const mesesCotizados = Math.round(anosCotizados * 12);
  const baseReguladora = baseMensualMedia * BASE_REGULADORA.factor;
  const porcentajeAplicable = calcularPorcentajePension(mesesCotizados);
  const pensionBruta = baseReguladora * (porcentajeAplicable / 100);

  const pension = Math.max(
    LIMITES_PENSION_2025.minimaSinConyuge,
    Math.min(LIMITES_PENSION_2025.maximaMensual, pensionBruta)
  );
  const limitada = pension !== pensionBruta;

  return {
    baseReguladora,
    porcentajeAplicable,
    pensionBrutaMensual: pension,
    pensionBrutaAnual: pension * 14,
    limitada,
    edadOrdinaria: calcularEdadOrdinaria(mesesCotizados),
    mesesParaCien: COTIZACION_MINIMA.mesesParaCien,
    porcentajeSobreMaxima: (pension / LIMITES_PENSION_2025.maximaMensual) * 100,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorPensionPublica() {
  const [anosCotizados, setAnosCotizados] = useState('');
  const [baseMensual, setBaseMensual] = useState('');
  const [resultado, setResultado] = useState<ResultadoPension | null>(null);
  const [error, setError] = useState('');

  function calcular() {
    setError('');
    const anos = parseFloat(anosCotizados.replace(',', '.'));
    const base = parseFloat(baseMensual.replace(',', '.'));

    if (isNaN(anos) || anos < 1 || anos > 50) {
      setError('Introduce los años cotizados (entre 1 y 50).');
      return;
    }
    if (isNaN(base) || base < 100 || base > 20000) {
      setError('Introduce una base de cotización válida (entre 100 y 20.000 €).');
      return;
    }
    if (anos < COTIZACION_MINIMA.anosMinimosAcceso) {
      setError(`Se necesitan al menos ${COTIZACION_MINIMA.anosMinimosAcceso} años cotizados para acceder a pensión de jubilación.`);
      return;
    }

    setResultado(estimarPension(base, anos));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🌅</span>
        <h1 className={styles.title}>Estimador de Pensión Pública</h1>
        <p className={styles.subtitle}>Orientación sobre tu pensión de jubilación · Seguridad Social 2025</p>
      </header>

      <DisclaimerCard variant="financial"
        severity="critical">
        <span>
          Esta herramienta es SOLO orientativa e informativa sobre la pensión pública española.
          <br /><strong>No es</strong> asesoramiento previsional personalizado ni sustituye al simulador oficial de la SS.
          <br />La pensión real se calcula con tu historial completo de cotización. Datos SS vigentes en {FISCAL_PENSIONES_META.vigencia}.
          <br /><strong>Consulta tu vida laboral</strong> en la Sede Electrónica de la Seguridad Social antes de tomar decisiones.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tus datos de cotización</h2>

          <NumberInput
            value={anosCotizados}
            onChange={setAnosCotizados}
            label="Años cotizados (total)"
            placeholder="Ej: 30"
            helperText="Consúltalos en tu vida laboral en importass.seg-social.es"
            min={1}
            max={50}
          />

          <NumberInput
            value={baseMensual}
            onChange={setBaseMensual}
            label={`Base de cotización media mensual (€) — máx. ${formatCurrency(4720.50)}/mes`}
            placeholder="Ej: 2.500"
            helperText="Aproximación de tu salario bruto mensual medio de los últimos 25 años."
            min={100}
            max={20000}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Calcular estimación de pensión">
            Estimar mi pensión
          </button>

          <div className={styles.infoSS}>
            💡 Para mayor precisión, usa el <strong>simulador oficial</strong> de la SS con tu historial real de cotización.
          </div>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Estimación orientativa</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa &ldquo;Estimar mi pensión&rdquo; para ver los resultados.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                <span className={styles.resultLabel}>Pensión mensual estimada</span>
                <span className={styles.resultValueBig}>{formatCurrency(resultado.pensionBrutaMensual)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Pensión anual estimada (14 pagas)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.pensionBrutaAnual)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Base reguladora estimada</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.baseReguladora)}/mes</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Porcentaje aplicable por años cotizados</span>
                <span className={styles.resultValue}>{formatNumber(resultado.porcentajeAplicable, 2)}%</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Edad de jubilación ordinaria</span>
                <span className={styles.resultValue}>{resultado.edadOrdinaria}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Pensión máxima 2025</span>
                <span className={styles.resultValue}>{formatCurrency(LIMITES_PENSION_2025.maximaMensual)}/mes</span>
              </div>

              {resultado.limitada && (
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Nota</span>
                  <span className={styles.resultNote}>Resultado ajustado al límite mínimo/máximo de la SS</span>
                </div>
              )}

              {/* Barra de progreso sobre máxima */}
              <div className={styles.barraProgreso}>
                <div className={styles.barraLabel}>
                  <span>Sobre pensión máxima</span>
                  <span>{formatNumber(resultado.porcentajeSobreMaxima, 1)}%</span>
                </div>
                <div
                  className={styles.barra}
                  role="progressbar"
                  aria-label={`Pensión equivale al ${formatNumber(resultado.porcentajeSobreMaxima, 1)}% de la pensión máxima`}
                  aria-valuenow={Math.round(resultado.porcentajeSobreMaxima)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className={styles.barraFill} style={{ width: `${Math.min(100, resultado.porcentajeSobreMaxima)}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo se calcula la pensión pública?" subtitle="Fórmula orientativa de la Seguridad Social 2025">
        <p>La pensión de jubilación de la Seguridad Social se calcula con dos elementos principales:</p>
        <h3>1. Base Reguladora (BR)</h3>
        <p>Es el promedio de tus últimas 300 bases de cotización (25 años) dividido entre 350. El divisor 350 es mayor que 300 para compensar posibles meses sin cotización (lagunas).</p>
        <h3>2. Porcentaje por años cotizados</h3>
        <p>Con 15 años cotizados obtienes el 50% de la BR. El porcentaje aumenta hasta el 100%, que en 2025 se alcanza con aproximadamente 36 años y 9 meses de cotización.</p>
        <h3>3. Límites</h3>
        <p>La pensión resultante se sitúa entre la pensión mínima ({formatCurrency(LIMITES_PENSION_2025.minimaSinConyuge)}/mes) y la máxima ({formatCurrency(LIMITES_PENSION_2025.maximaMensual)}/mes) para 2025.</p>
        <h3>¿Por qué esta es solo una estimación?</h3>
        <p>La SS calcula tu pensión con tu historial real de cotización mes a mes, incluyendo actualizaciones de bases, períodos de desempleo y otras circunstancias. Este estimador usa una media simplificada.</p>

        {/* 1. TABLA COMPARATIVA */}
        <div className={styles.tableWrapper}>
          <h3>Comparativa: Tipos de Pensión Pública</h3>
          <table className={styles.comparativaTable}>
            <thead>
              <tr><th>Tipo</th><th>Requisitos cotización</th><th>Cuantía</th><th>Edad acceso</th></tr>
            </thead>
            <tbody>
              <tr><td>Jubilación ordinaria</td><td>15 años (2 últimos 10)</td><td>Base reguladora × %</td><td>65 o 66+2m/67</td></tr>
              <tr><td>Jubilación anticipada voluntaria</td><td>35 años cotizados</td><td>Con coeficientes reductores</td><td>2 años antes edad legal</td></tr>
              <tr><td>Jubilación anticipada involuntaria</td><td>33 años cotizados</td><td>Con coeficientes reductores</td><td>4 años antes edad legal</td></tr>
              <tr><td>Jubilación parcial</td><td>33 años (o 25 con relevo)</td><td>Proporcional a reducción jornada</td><td>Según modalidad</td></tr>
              <tr><td>Jubilación flexible</td><td>Igual que ordinaria</td><td>Proporcional a tiempo trabajado</td><td>Edad ordinaria</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👩‍💼</span>
              <strong>Empleada con carrera completa</strong>
            </div>
            <p className={styles.escenarioExample}>Ana, 62 años, 38 años cotizados, base reguladora 2.200 €/mes.</p>
            <p className={styles.escenarioTip}>Con 38 años al 100%, cobraría 2.200 €/mes. Esperar a los 65 le da pensión íntegra sin penalizaciones.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👨‍🔧</span>
              <strong>Autónomo con carrera irregular</strong>
            </div>
            <p className={styles.escenarioExample}>Carlos, 64 años, 28 años cotizados. Bases bajas en los primeros años.</p>
            <p className={styles.escenarioTip}>Con 28 años cotizados obtiene el 88,75%. Cotizar 2 años más sube al 96,75% de la base reguladora.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👩‍🍳</span>
              <strong>Trabajadora con lagunas</strong>
            </div>
            <p className={styles.escenarioExample}>María, 60 años, 22 años cotizados. Varios períodos sin cotizar por cuidado de hijos.</p>
            <p className={styles.escenarioTip}>Tiene 7 años para completar los 29 mínimos. Puede ampliar período de cálculo si sus mejores bases están en los últimos 25 años.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👨‍💻</span>
              <strong>Profesional con alta base</strong>
            </div>
            <p className={styles.escenarioExample}>Pedro, 65 años, 42 años cotizados, bases máximas los últimos 10 años.</p>
            <p className={styles.escenarioTip}>Con 42+ años al 100%, alcanza la pensión máxima 2025: 3.267,56 €/mes. Cotizar más no aumenta la pensión.</p>
          </div>
        </div>

        {/* 3. FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuántos años hay que cotizar para cobrar el 100%?</strong>
            <p>En 2025 se necesitan 36 años y 6 meses cotizados para acceder al 100% de la base reguladora. Este requisito aumenta gradualmente hasta los 37 años en 2027.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo se calcula la base reguladora?</strong>
            <p>Se calcula con las bases de cotización de los últimos 25 años (300 meses), divididas entre 350. Las lagunas se cubren con la base mínima (primeras 48) o el 50% (siguientes).</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué pasa si jubilo antes de la edad legal?</strong>
            <p>Se aplican coeficientes reductores permanentes entre 1,56% y 2,81% por trimestre adelantado. En anticipada voluntaria, con 35 años cotizados, la reducción máxima puede ser del 11,24%.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puedo seguir trabajando y cobrar pensión?</strong>
            <p>Sí, con jubilación activa (50% pensión) o jubilación flexible (proporcional a tiempo trabajado). Al cesar la actividad, se recalcula la pensión al 100%.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la pensión máxima en 2025?</strong>
            <p>La pensión máxima en 2025 es de 3.267,56 €/mes (14 pagas), equivalente a 45.745,84 €/año. Se actualiza anualmente según IPC.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Se puede mejorar la pensión tras jubilarse?</strong>
            <p>Con jubilación demorada (más allá de la edad ordinaria) se obtiene un complemento del 4% por cada año adicional cotizado. Es la única forma de superar el porcentaje máximo del 100%.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Los períodos de desempleo cuentan para la pensión?</strong>
            <p>El desempleo con prestación contributiva cotiza a la Seguridad Social y cuenta íntegramente. El paro sin prestación no cotiza y genera lagunas en el período de cálculo.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo afectan los hijos a la pensión?</strong>
            <p>Las mujeres con hijos pueden aplicar el complemento de brecha de género: entre 14 y 140 €/mes según número de hijos (1 a 3+), si sus ingresos son inferiores a cierto umbral.</p>
            <p className={styles.faqTip}>💡 Solicita tu informe de vida laboral en la Sede Electrónica de la SS para verificar tus años cotizados.</p>
          </li>
        </ul>

        {/* 4. GUÍA PASO A PASO */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Consulta tu vida laboral</strong>
              <p>Descarga el informe de vida laboral en la Sede Electrónica de la Seguridad Social (ss.seg-social.es). Verifica años cotizados y posibles lagunas.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Calcula tu base reguladora</strong>
              <p>Suma las bases de cotización de los últimos 25 años y divide entre 350. Usa el estimador para obtener una cifra orientativa antes de la resolución oficial.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Determina el porcentaje aplicable</strong>
              <p>Con menos de 15 años no hay derecho a pensión. De 15 a 36,5 años (2025), el porcentaje va del 50% al 100% de forma progresiva.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Decide la edad de jubilación</strong>
              <p>Compara jubilación ordinaria, anticipada o demorada. Calcula el punto de equilibrio: años de coeficientes reductores vs. años adicionales cobrando pensión.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Solicita la pensión con antelación</strong>
              <p>Presenta la solicitud con al menos 3 meses de antelación a la fecha deseada. Se puede hacer online, presencialmente o por correo en cualquier INSS.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <strong>Complementa con ahorro privado</strong>
              <p>Si la pensión estimada cubre menos del 70-80% de tu salario actual, planifica planes de pensiones, PPA o seguros de ahorro para completar la diferencia.</p>
            </div>
          </div>
        </div>

        {/* 5. MEJORES PRÁCTICAS */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📋</span>
            <strong>Revisa tu vida laboral anualmente</strong>
            <p>Solicita el informe cada año y corrige errores. Un año no cotizado mal registrado puede costar 1-2% de pensión vitalicia.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📅</span>
            <strong>Planifica con 10 años de antelación</strong>
            <p>A los 55 años ya puedes proyectar tu pensión con precisión. Es el momento ideal para ajustar estrategias de cotización y ahorro.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💡</span>
            <strong>Maximiza las bases en los últimos años</strong>
            <p>Los últimos 25 años definen tu base reguladora. Si puedes elegir, prioriza cotizar por bases altas en este período final.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⚖️</span>
            <strong>Evalúa el punto de equilibrio</strong>
            <p>Si te jubilas 2 años antes, necesitas ~15-20 años para compensar el dinero perdido por coeficientes. Compara con tu esperanza de vida.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔍</span>
            <strong>Verifica los convenios internacionales</strong>
            <p>Si has trabajado en el extranjero, los períodos cotizados en países con convenio bilateral con España pueden sumarse para alcanzar mínimos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📊</span>
            <strong>Usa herramientas de la SS</strong>
            <p>El simulador oficial &ldquo;Tu Seguridad Social&rdquo; en ss.seg-social.es ofrece estimaciones personalizadas más precisas que cualquier calculadora externa.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes al planificar la jubilación</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>No verificar la vida laboral:</strong> Muchas personas descubren lagunas o errores solo al solicitar la pensión, cuando ya no hay margen para corregirlos.</li>
            <li><strong>Confundir años cotizados con años trabajados:</strong> Solo cuentan los períodos con cotización efectiva. El paro sin prestación, períodos de economía informal o contratos irregulares generan lagunas.</li>
            <li><strong>Calcular sobre sueldo bruto, no sobre base de cotización:</strong> Las horas extra, complementos y variables no siempre cotizan igual que el salario base.</li>
            <li><strong>No considerar la pensión mínima garantizada:</strong> Si la pensión calculada está por debajo del mínimo (≈700-800 €/mes según situación), el sistema la complementa automáticamente con complementos a mínimos.</li>
            <li><strong>Asumir que la pensión cubrirá el 100% del salario:</strong> La tasa de sustitución media en España ronda el 75-80%, pero varía mucho según historial cotizatorio.</li>
            <li><strong>Ignorar el impacto del IRPF:</strong> Las pensiones tributan como rendimientos del trabajo. Dependiendo del importe, puede suponer retenciones del 8-15% que reducen el neto a percibir.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-pension-publica')} />
      <ShareCard appName="estimador-pension-publica" />
      <Footer appName="estimador-pension-publica" />
    </div>
  );
}
