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

      <DisclaimerCard variant="financial">
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-pension-publica')} />
      <ShareCard appName="estimador-pension-publica" />
      <Footer appName="estimador-pension-publica" />
    </div>
  );
}
