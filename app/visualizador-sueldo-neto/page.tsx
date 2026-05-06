'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './VisualizadorSueldoNeto.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';
import {
  FISCAL_IRPF_META,
  TRAMOS_IRPF_2025,
  COTIZACIONES_SS_2025,
  BASES_SS_2025,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal';
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Lógica de cálculo
// ─────────────────────────────────────────────

interface DesgloseSueldo {
  brutoAnual: number;
  brutoMensual: number;
  // Cotizaciones SS
  ssContingencias: number;
  ssDesempleo: number;
  ssFormacion: number;
  ssMEI: number;
  totalSS: number;
  // IRPF
  baseImponible: number;
  retencionIRPF: number;
  tipoEfectivoIRPF: number;
  desgloseTramosIRPF: { tramo: string; base: number; tipo: number; cuota: number }[];
  // Resultado
  netoAnual: number;
  netoMensual: number;
  // Para visualización
  pctSS: number;
  pctIRPF: number;
  pctNeto: number;
}

function calcularSueldo(brutoAnual: number): DesgloseSueldo {
  const pagas = 14; // 12 meses + 2 extras
  const brutoMensual = brutoAnual / pagas;

  // 1. Cotizaciones SS (sobre base mensual, limitada a topes)
  const baseSS = Math.min(Math.max(brutoMensual, BASES_SS_2025.minima), BASES_SS_2025.maxima);
  const ssContingencias = baseSS * (COTIZACIONES_SS_2025.contingenciasComunes / 100) * pagas;
  const ssDesempleo = baseSS * (COTIZACIONES_SS_2025.desempleo / 100) * pagas;
  const ssFormacion = baseSS * (COTIZACIONES_SS_2025.formacionProfesional / 100) * pagas;
  const ssMEI = baseSS * (COTIZACIONES_SS_2025.mef / 100) * pagas;
  const totalSS = ssContingencias + ssDesempleo + ssFormacion + ssMEI;

  // 2. Base imponible IRPF
  const rendimientoNeto = brutoAnual - totalSS - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral;

  // Reducción por rendimientos del trabajo
  const red = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  let reduccion = 0;
  if (rendimientoNeto <= red.limite1) {
    reduccion = red.reduccion1;
  } else if (rendimientoNeto < red.limite2) {
    reduccion = red.reduccion1 - red.factorInterpolacion * (rendimientoNeto - red.limite1);
  } else {
    reduccion = red.reduccion2;
  }

  const baseImponible = Math.max(0, rendimientoNeto - reduccion);

  // Mínimo personal
  const minimoPersonal = MINIMOS_IRPF_2025.personal;

  // 3. IRPF por tramos
  const baseGravable = Math.max(0, baseImponible - minimoPersonal);
  const desgloseTramosIRPF: { tramo: string; base: number; tipo: number; cuota: number }[] = [];
  let restante = baseGravable;
  let prevLimite = 0;

  for (const tramo of TRAMOS_IRPF_2025) {
    if (restante <= 0) break;
    const anchoTramo = tramo.hasta === Infinity ? restante : tramo.hasta - prevLimite;
    const baseTramo = Math.min(restante, anchoTramo);
    const cuotaTramo = baseTramo * (tramo.tipo / 100);

    desgloseTramosIRPF.push({
      tramo: tramo.hasta === Infinity
        ? `Más de ${formatCurrency(prevLimite)}`
        : `${formatCurrency(prevLimite)} → ${formatCurrency(tramo.hasta)}`,
      base: baseTramo,
      tipo: tramo.tipo,
      cuota: cuotaTramo,
    });

    restante -= baseTramo;
    prevLimite = tramo.hasta === Infinity ? prevLimite : tramo.hasta;
  }

  const retencionIRPF = desgloseTramosIRPF.reduce((s, t) => s + t.cuota, 0);
  const tipoEfectivoIRPF = brutoAnual > 0 ? (retencionIRPF / brutoAnual) * 100 : 0;

  // 4. Neto
  const netoAnual = brutoAnual - totalSS - retencionIRPF;
  const netoMensual = netoAnual / 12;

  // Porcentajes
  const pctSS = brutoAnual > 0 ? (totalSS / brutoAnual) * 100 : 0;
  const pctIRPF = brutoAnual > 0 ? (retencionIRPF / brutoAnual) * 100 : 0;
  const pctNeto = brutoAnual > 0 ? (netoAnual / brutoAnual) * 100 : 0;

  return {
    brutoAnual, brutoMensual,
    ssContingencias, ssDesempleo, ssFormacion, ssMEI, totalSS,
    baseImponible, retencionIRPF, tipoEfectivoIRPF, desgloseTramosIRPF,
    netoAnual, netoMensual,
    pctSS, pctIRPF, pctNeto,
  };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSueldoNetoPage() {
  const [brutoAnual, setBrutoAnual] = useState(30000);
  const datos = useMemo(() => calcularSueldo(brutoAnual), [brutoAnual]);

  // Gráfico de barras apiladas para comparar varios sueldos
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const sueldosComparar = [20000, 30000, 45000, 60000, 80000, 120000];

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const datosComparativa = sueldosComparar.map(b => calcularSueldo(b));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sueldosComparar.map(b => formatCurrency(b)),
        datasets: [
          {
            label: 'Neto',
            data: datosComparativa.map(d => d.pctNeto),
            backgroundColor: '#2E86AB',
            borderRadius: 2,
          },
          {
            label: 'IRPF',
            data: datosComparativa.map(d => d.pctIRPF),
            backgroundColor: '#e74c3c',
            borderRadius: 2,
          },
          {
            label: 'Seguridad Social',
            data: datosComparativa.map(d => d.pctSS),
            backgroundColor: '#e67e22',
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
                `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y ?? 0, 1)}%`,
            },
          },
        },
        scales: {
          x: { stacked: true, title: { display: true, text: 'Sueldo bruto anual' } },
          y: {
            stacked: true,
            max: 100,
            ticks: { callback: (v: string | number) => `${v}%` },
            title: { display: true, text: '% del bruto' },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, []);

  // Colores para tramos IRPF
  const coloresTramos = ['#27ae60', '#48A9A6', '#2E86AB', '#e67e22', '#e74c3c', '#8e44ad'];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Tu Sueldo al Desnudo</h1>
          <p className={styles.subtitle}>Visualiza cómo se transforma tu bruto en neto — cada euro, paso a paso</p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />
        <DisclaimerCard variant="financial" severity="critical" />
        <DataReference
          normativa="IRPF + Seguridad Social 2025"
          fuente={FISCAL_IRPF_META.fuente}
          verificado={FISCAL_IRPF_META.verificado}
          urlOficial={FISCAL_IRPF_META.urlOficial}
        />

        {/* Slider de sueldo */}
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>Sueldo bruto anual</label>
            <span className={styles.sliderValor}>{formatCurrency(brutoAnual)}</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={15000}
            max={150000}
            step={1000}
            value={brutoAnual}
            onChange={(e) => setBrutoAnual(parseInt(e.target.value))}
            aria-label={`Sueldo bruto anual: ${formatCurrency(brutoAnual)}`}
          />
          <div className={styles.sliderExtremos}>
            <span>15.000 €</span>
            <span>150.000 €</span>
          </div>
        </div>

        {/* Cascada visual */}
        <div className={styles.cascada}>
          <div className={styles.cascadaItem}>
            <div className={styles.cascadaIcono} aria-hidden="true">💰</div>
            <div className={styles.cascadaInfo}>
              <span className={styles.cascadaLabel}>Sueldo bruto anual</span>
              <span className={styles.cascadaValorPrincipal}>{formatCurrency(datos.brutoAnual)}</span>
              <span className={styles.cascadaPct}>100%</span>
            </div>
          </div>

          <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

          <div className={`${styles.cascadaItem} ${styles.cascadaResta}`}>
            <div className={styles.cascadaIcono} aria-hidden="true">🏥</div>
            <div className={styles.cascadaInfo}>
              <span className={styles.cascadaLabel}>Seguridad Social</span>
              <span className={styles.cascadaValor}>− {formatCurrency(datos.totalSS)}</span>
              <span className={styles.cascadaPct}>{formatNumber(datos.pctSS, 1)}% del bruto</span>
            </div>
          </div>

          {/* Desglose SS */}
          <div className={styles.desgloseSS}>
            <div className={styles.desgloseItem}>
              <span>Contingencias comunes ({formatNumber(COTIZACIONES_SS_2025.contingenciasComunes, 2)}%)</span>
              <span>− {formatCurrency(datos.ssContingencias)}</span>
            </div>
            <div className={styles.desgloseItem}>
              <span>Desempleo ({formatNumber(COTIZACIONES_SS_2025.desempleo, 2)}%)</span>
              <span>− {formatCurrency(datos.ssDesempleo)}</span>
            </div>
            <div className={styles.desgloseItem}>
              <span>Formación profesional ({formatNumber(COTIZACIONES_SS_2025.formacionProfesional, 2)}%)</span>
              <span>− {formatCurrency(datos.ssFormacion)}</span>
            </div>
            <div className={styles.desgloseItem}>
              <span>MEI ({formatNumber(COTIZACIONES_SS_2025.mef, 2)}%)</span>
              <span>− {formatCurrency(datos.ssMEI)}</span>
            </div>
          </div>

          <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

          <div className={`${styles.cascadaItem} ${styles.cascadaResta}`}>
            <div className={styles.cascadaIcono} aria-hidden="true">🏛️</div>
            <div className={styles.cascadaInfo}>
              <span className={styles.cascadaLabel}>Retención IRPF</span>
              <span className={styles.cascadaValor}>− {formatCurrency(datos.retencionIRPF)}</span>
              <span className={styles.cascadaPct}>Tipo efectivo: {formatNumber(datos.tipoEfectivoIRPF, 1)}%</span>
            </div>
          </div>

          {/* Desglose tramos IRPF */}
          {datos.desgloseTramosIRPF.length > 0 && (
            <div className={styles.desgloseTramos}>
              <p className={styles.desgloseTramTitulo}>Desglose por tramos IRPF</p>
              {datos.desgloseTramosIRPF.map((t, i) => (
                <div key={i} className={styles.tramoItem}>
                  <div
                    className={styles.tramoColor}
                    style={{ backgroundColor: coloresTramos[i] || '#999' }}
                  />
                  <div className={styles.tramoInfo}>
                    <span className={styles.tramoRango}>{t.tramo}</span>
                    <span className={styles.tramoPct}>al {formatNumber(t.tipo, 0)}%</span>
                  </div>
                  <div className={styles.tramoValores}>
                    <span className={styles.tramoBase}>{formatCurrency(t.base)}</span>
                    <span className={styles.tramoCuota}>→ {formatCurrency(t.cuota)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

          <div className={`${styles.cascadaItem} ${styles.cascadaResultado}`}>
            <div className={styles.cascadaIcono} aria-hidden="true">✅</div>
            <div className={styles.cascadaInfo}>
              <span className={styles.cascadaLabel}>Tu sueldo neto anual</span>
              <span className={styles.cascadaValorPrincipal}>{formatCurrency(datos.netoAnual)}</span>
              <span className={styles.cascadaPct}>{formatNumber(datos.pctNeto, 1)}% del bruto → {formatCurrency(datos.netoMensual)}/mes (12 pagas)</span>
            </div>
          </div>
        </div>

        {/* Barra de reparto */}
        <div className={styles.barraReparto}>
          <div
            className={styles.barraNeto}
            style={{ width: `${datos.pctNeto}%` }}
          >
            <span className={styles.barraTexto}>Neto {formatNumber(datos.pctNeto, 0)}%</span>
          </div>
          <div
            className={styles.barraIRPF}
            style={{ width: `${datos.pctIRPF}%` }}
          >
            <span className={styles.barraTexto}>IRPF {formatNumber(datos.pctIRPF, 0)}%</span>
          </div>
          <div
            className={styles.barraSS}
            style={{ width: `${datos.pctSS}%` }}
          >
            <span className={styles.barraTexto}>SS {formatNumber(datos.pctSS, 0)}%</span>
          </div>
        </div>

        {/* Insight contextual */}
        <div className={styles.insight}>
          {brutoAnual <= 22000 && (
            <p>Con un sueldo de {formatCurrency(brutoAnual)}, <strong>la Seguridad Social pesa más que el IRPF</strong>. Las cotizaciones son un porcentaje fijo, mientras que el IRPF es muy bajo en estos tramos gracias al mínimo personal y la reducción por rendimientos del trabajo.</p>
          )}
          {brutoAnual > 22000 && brutoAnual <= 40000 && (
            <p>En el rango de {formatCurrency(brutoAnual)}, <strong>IRPF y Seguridad Social se reparten el peso casi a partes iguales</strong>. Cada euro extra de sueldo tributa al {formatNumber(datos.desgloseTramosIRPF[datos.desgloseTramosIRPF.length - 1]?.tipo ?? 0, 0)}% marginal.</p>
          )}
          {brutoAnual > 40000 && brutoAnual <= 80000 && (
            <p>A partir de {formatCurrency(brutoAnual)}, <strong>el IRPF ya pesa significativamente más que la SS</strong>. Tu tipo marginal es del {formatNumber(datos.desgloseTramosIRPF[datos.desgloseTramosIRPF.length - 1]?.tipo ?? 0, 0)}% — cada euro extra de subida solo te llega parcialmente.</p>
          )}
          {brutoAnual > 80000 && (
            <p>Con {formatCurrency(brutoAnual)} de bruto, <strong>te llevas menos del {formatNumber(datos.pctNeto, 0)}% a casa</strong>. La SS está topada (base máxima {formatCurrency(BASES_SS_2025.maxima * 14)}), pero el IRPF sigue creciendo con cada tramo.</p>
          )}
        </div>

        {/* Gráfico comparativo */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitulo}>Comparativa: ¿cómo cambia el reparto según el sueldo?</h3>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label="Gráfico de barras apiladas: neto, IRPF y SS por nivel salarial" />
          </div>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Calcula tu IRPF exacto → <a href="/estimador-irpf/">Estimador de IRPF</a> · <a href="/estimador-sueldo-neto/">Calculadora Sueldo Neto</a>
        </div>

        <EducationalSection
          title="Lo que tu nómina no te explica"
          subtitle="Entiende cada descuento de tu sueldo"
          defaultOpen={false}
        >
          <h3>Tipo marginal vs tipo efectivo</h3>
          <p>
            El tipo marginal es lo que pagas por el <strong>último euro</strong> que ganas. El tipo efectivo
            es el porcentaje real que pagas sobre el total. Un sueldo de 35.000 € tiene un tipo marginal del
            30%, pero un tipo efectivo mucho menor (~15%), porque los primeros euros tributan al 19%.
          </p>

          <h3>¿Por qué la SS pesa tanto en sueldos bajos?</h3>
          <p>
            Las cotizaciones a la Seguridad Social son un <strong>porcentaje fijo</strong> (6,47% del trabajador),
            sin tramos ni mínimos exentos. Por eso, en sueldos bajos, la SS puede superar al IRPF. Además,
            tu empresa paga otro ~30% adicional que no aparece en tu nómina.
          </p>

          <h3>Lo que tu empresa paga y tú no ves</h3>
          <p>
            Por cada 100 € de sueldo bruto que recibes, tu empresa paga aproximadamente 130 €. Esos 30 €
            extra cubren la cotización empresarial a la Seguridad Social: contingencias comunes (23,6%),
            desempleo (5,5%), formación (0,6%), FOGASA (0,2%) y accidentes de trabajo (variable).
          </p>

          <h3>Las pagas extras: ¿mejor prorrateadas?</h3>
          <p>
            A efectos fiscales, da igual: el IRPF se calcula sobre el total anual. Pero psicológicamente,
            cobrar 14 pagas te da dos &quot;extras&quot; al año. En 12 pagas, cada mensualidad es ~16% mayor.
            La elección no afecta a cuánto pagas de impuestos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este visualizador usa datos normativos 2025 y supone un contribuyente
            soltero sin hijos, con un solo pagador y sin deducciones adicionales. Tu caso real puede variar
            significativamente según CCAA, situación familiar y otras circunstancias.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sueldo-neto')} />
        <ShareCard appName="visualizador-sueldo-neto" />
        <Footer appName="visualizador-sueldo-neto" />
      </div>
    </>
  );
}
