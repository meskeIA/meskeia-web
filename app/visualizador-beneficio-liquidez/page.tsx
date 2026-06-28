'use client';
// @disclaimer: exempt

import { useState, useRef, useEffect, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import styles from './VisualizadorBeneficioLiquidez.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Parametros {
  ventasMensuales: number;
  costosPct: number;
  pmcMeses: number;
  pmpMeses: number;
  mesesStock: number;
  capex: number;
}

interface MesDato {
  mes: number;
  beneficioMes: number;
  beneficioCumulado: number;
  cobroMes: number;
  pagoMes: number;
  flujoMes: number;
  cajaCumulada: number;
}

// ─── Escenarios predefinidos ──────────────────────────────────────────────────

const ESCENARIOS = {
  saludable: {
    label: 'Empresa saludable',
    emoji: '🟢',
    params: { ventasMensuales: 50000, costosPct: 60, pmcMeses: 1, pmpMeses: 2, mesesStock: 1, capex: 0 },
  },
  riesgo: {
    label: 'Empresa en riesgo',
    emoji: '🟡',
    params: { ventasMensuales: 50000, costosPct: 70, pmcMeses: 3, pmpMeses: 1, mesesStock: 2, capex: 0 },
  },
  crisis: {
    label: 'Crisis de caja',
    emoji: '🔴',
    params: { ventasMensuales: 50000, costosPct: 65, pmcMeses: 3, pmpMeses: 1, mesesStock: 3, capex: 80000 },
  },
} as const;

// ─── Simulación ───────────────────────────────────────────────────────────────

function calcularSimulacion(p: Parametros): MesDato[] {
  const cogs = p.ventasMensuales * p.costosPct / 100;
  const beneficioMensual = p.ventasMensuales - cogs;

  let cajaCumulada = -(p.mesesStock * cogs) - p.capex;
  let beneficioCumulado = 0;

  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    beneficioCumulado += beneficioMensual;

    const cobroMes = mes > p.pmcMeses ? p.ventasMensuales : 0;
    const pagoMes = mes > p.pmpMeses ? cogs : 0;
    const flujoMes = cobroMes - pagoMes;
    cajaCumulada += flujoMes;

    return { mes, beneficioMes: beneficioMensual, beneficioCumulado, cobroMes, pagoMes, flujoMes, cajaCumulada };
  });
}

const fmt = (n: number) => formatNumber(n, 0);
const fmtEur = (n: number) => `${formatNumber(n, 0)} €`;

const DIAS_LABEL: Record<number, string> = { 0: 'Contado', 1: '30 días', 2: '60 días', 3: '90 días' };
const STOCK_LABEL: Record<number, string> = { 0: 'Sin stock', 1: '1 mes', 2: '2 meses', 3: '3 meses' };

// ─── Componente selector de botones ──────────────────────────────────────────

interface SelectorProps {
  opciones: Record<number, string>;
  valor: number;
  onChange: (v: number) => void;
  id: string;
}

function SelectorBotones({ opciones, valor, onChange, id }: SelectorProps) {
  return (
    <div className={styles.selectorGrupo} role="group" aria-labelledby={id}>
      {Object.entries(opciones).map(([k, label]) => {
        const num = Number(k);
        return (
          <button
            key={k}
            type="button"
            className={`${styles.btnSelector} ${num === valor ? styles.btnSelectorActivo : ''}`}
            aria-pressed={num === valor}
            onClick={() => onChange(num)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function VisualizadorBeneficioLiquidezPage() {
  const [params, setParams] = useState<Parametros>(ESCENARIOS.riesgo.params);
  const [ventasStr, setVentasStr] = useState('50.000');
  const [capexStr, setCapexStr] = useState('');
  const [ventasEnfocado, setVentasEnfocado] = useState(false);
  const [capexEnfocado, setCapexEnfocado] = useState(false);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<Chart | null>(null);

  const datos = calcularSimulacion(params);

  const aplicarEscenario = (key: keyof typeof ESCENARIOS) => {
    const p = ESCENARIOS[key].params;
    setParams(p);
    setVentasStr(formatNumber(p.ventasMensuales, 0));
    setCapexStr(p.capex > 0 ? formatNumber(p.capex, 0) : '');
  };

  const actualizarVentas = useCallback((raw: string) => {
    const n = parseSpanishNumber(raw) || 0;
    setParams(prev => ({ ...prev, ventasMensuales: n }));
    setVentasStr(formatNumber(n, 0));
  }, []);

  const actualizarCapex = useCallback((raw: string) => {
    const n = parseSpanishNumber(raw) || 0;
    setParams(prev => ({ ...prev, capex: n }));
    setCapexStr(n > 0 ? formatNumber(n, 0) : '');
  }, []);

  // ── Gráfico ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return;
    chartInst.current?.destroy();
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = datos.map(d => `Mes ${d.mes}`);
    const beneficios = datos.map(d => d.beneficioCumulado);
    const cajas = datos.map(d => d.cajaCumulada);

    chartInst.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Beneficio acumulado',
            data: beneficios,
            borderColor: '#48A9A6',
            backgroundColor: 'rgba(72, 169, 166, 0.08)',
            borderWidth: 2,
            borderDash: [7, 4],
            pointRadius: 5,
            pointBackgroundColor: '#48A9A6',
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Caja acumulada',
            data: cajas,
            borderColor: '#2E86AB',
            backgroundColor: 'rgba(46, 134, 171, 0.06)',
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: cajas.map(v => v < 0 ? '#dc2626' : '#2E86AB'),
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Referencia 0 €',
            data: new Array(12).fill(0),
            borderColor: 'rgba(150,150,150,0.4)',
            borderWidth: 1,
            borderDash: [3, 3],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              filter: item => item.text !== 'Referencia 0 €',
              padding: 16,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.label === 'Referencia 0 €') return '';
                const val = ctx.parsed.y ?? 0;
                return ` ${ctx.dataset.label}: ${fmtEur(val)}`;
              },
              afterBody: (items) => {
                const b = items[0]?.parsed.y ?? 0;
                const c = items[1]?.parsed.y ?? 0;
                const brecha = b - c;
                return brecha > 0 ? [`  Brecha: ${fmtEur(brecha)}`] : [];
              },
            },
          },
        },
        scales: {
          y: {
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: {
              callback: (val) => {
                const n = val as number;
                if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M €`;
                if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(0)}k €`;
                return `${n} €`;
              },
            },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => { chartInst.current?.destroy(); };
  }, [datos]);

  // ── Métricas ───────────────────────────────────────────────────────────────
  const beneficioFinal = datos[11].beneficioCumulado;
  const cajaFinal = datos[11].cajaCumulada;
  const mesMinCaja = datos.reduce((min, d) => d.cajaCumulada < min.cajaCumulada ? d : min);
  const brechaMax = Math.max(...datos.map(d => d.beneficioCumulado - d.cajaCumulada));
  const mesesNegativos = datos.filter(d => d.cajaCumulada < 0).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">💸</span> Beneficio vs Liquidez
        </h1>
        <p className={styles.subtitle}>
          Descubre por qué una empresa puede tener beneficios y quedarse sin dinero en el banco
        </p>
      </header>

      <LegalNotice />

      {/* ── Panel de configuración ── */}
      <section className={styles.configSection} aria-label="Configuración de la empresa simulada">
        <div className={styles.configHeader}>
          <h2 className={styles.configTitulo}>Configura tu empresa</h2>
          <div className={styles.escenariosBtns}>
            {(Object.keys(ESCENARIOS) as Array<keyof typeof ESCENARIOS>).map(key => (
              <button
                key={key}
                type="button"
                className={`${styles.btnEscenario} ${styles[`btnEscenario_${key}`]}`}
                onClick={() => aplicarEscenario(key)}
              >
                <span aria-hidden="true">{ESCENARIOS[key].emoji}</span> {ESCENARIOS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.configGrid}>
          {/* Ventas */}
          <div className={styles.campoConfig}>
            <label className={styles.campoLabel} htmlFor="input-ventas">Ventas mensuales</label>
            <div className={styles.inputEurWrapper}>
              <span className={styles.inputEurSufijo}>€</span>
              <input
                id="input-ventas"
                type="text"
                inputMode="numeric"
                className={styles.inputEurField}
                value={ventasEnfocado ? ventasStr : (params.ventasMensuales > 0 ? fmt(params.ventasMensuales) : '')}
                placeholder="50.000"
                onFocus={() => { setVentasEnfocado(true); setVentasStr(params.ventasMensuales > 0 ? String(params.ventasMensuales) : ''); }}
                onBlur={(e) => { setVentasEnfocado(false); actualizarVentas(e.target.value); }}
                onChange={e => setVentasStr(e.target.value)}
              />
            </div>
          </div>

          {/* Costos */}
          <div className={styles.campoConfig}>
            <label className={styles.campoLabel} htmlFor="slider-costos">
              Costos (% ventas)
              <span className={styles.sliderValor}>{params.costosPct} %</span>
            </label>
            <input
              id="slider-costos"
              type="range"
              min={30} max={90} step={5}
              value={params.costosPct}
              className={styles.slider}
              onChange={e => setParams(prev => ({ ...prev, costosPct: Number(e.target.value) }))}
            />
            <div className={styles.sliderEtiquetas}>
              <span>30 %</span>
              <span className={styles.sliderMargen}>Margen: {100 - params.costosPct} %</span>
              <span>90 %</span>
            </div>
          </div>

          {/* PMC */}
          <div className={styles.campoConfig}>
            <span className={styles.campoLabel} id="pmc-label">Cobro a clientes (PMC)</span>
            <SelectorBotones opciones={DIAS_LABEL} valor={params.pmcMeses} onChange={v => setParams(prev => ({ ...prev, pmcMeses: v }))} id="pmc-label" />
          </div>

          {/* PMP */}
          <div className={styles.campoConfig}>
            <span className={styles.campoLabel} id="pmp-label">Pago a proveedores (PMP)</span>
            <SelectorBotones opciones={DIAS_LABEL} valor={params.pmpMeses} onChange={v => setParams(prev => ({ ...prev, pmpMeses: v }))} id="pmp-label" />
          </div>

          {/* Stock */}
          <div className={styles.campoConfig}>
            <span className={styles.campoLabel} id="stock-label">Stock inicial</span>
            <SelectorBotones opciones={STOCK_LABEL} valor={params.mesesStock} onChange={v => setParams(prev => ({ ...prev, mesesStock: v }))} id="stock-label" />
          </div>

          {/* Capex */}
          <div className={styles.campoConfig}>
            <label className={styles.campoLabel} htmlFor="input-capex">Inversión inicial (capex)</label>
            <div className={styles.inputEurWrapper}>
              <span className={styles.inputEurSufijo}>€</span>
              <input
                id="input-capex"
                type="text"
                inputMode="numeric"
                className={styles.inputEurField}
                value={capexEnfocado ? capexStr : (params.capex > 0 ? fmt(params.capex) : '')}
                placeholder="0"
                onFocus={() => { setCapexEnfocado(true); setCapexStr(params.capex > 0 ? String(params.capex) : ''); }}
                onBlur={(e) => { setCapexEnfocado(false); actualizarCapex(e.target.value); }}
                onChange={e => setCapexStr(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Alerta de caja negativa ── */}
      {mesesNegativos > 0 && (
        <div className={styles.alertaCaja} role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>
            Esta empresa tiene <strong>caja negativa durante {mesesNegativos} {mesesNegativos === 1 ? 'mes' : 'meses'}</strong>.
            Con estos parámetros, sin financiación externa no podría atender todos sus pagos.
          </span>
        </div>
      )}

      {/* ── Métricas ── */}
      <div className={styles.metricasGrid}>
        <div className={styles.metricaCard}>
          <div className={styles.metricaValor} style={{ color: '#48A9A6' }}>{fmtEur(beneficioFinal)}</div>
          <div className={styles.metricaLabel}>Beneficio acumulado (mes 12)</div>
        </div>
        <div className={`${styles.metricaCard} ${cajaFinal < 0 ? styles.metricaCritica : ''}`}>
          <div className={styles.metricaValor} style={{ color: cajaFinal < 0 ? '#dc2626' : '#2E86AB' }}>{fmtEur(cajaFinal)}</div>
          <div className={styles.metricaLabel}>Caja acumulada (mes 12)</div>
        </div>
        <div className={styles.metricaCard}>
          <div className={styles.metricaValor} style={{ color: '#d97706' }}>{fmtEur(brechaMax)}</div>
          <div className={styles.metricaLabel}>Brecha máxima beneficio − caja</div>
        </div>
        <div className={`${styles.metricaCard} ${mesesNegativos > 0 ? styles.metricaCritica : ''}`}>
          <div className={styles.metricaValor} style={{ color: mesesNegativos > 0 ? '#dc2626' : '#16a34a' }}>
            {mesesNegativos > 0 ? `${mesesNegativos} meses` : '✓ Ninguno'}
          </div>
          <div className={styles.metricaLabel}>Meses con caja negativa</div>
        </div>
      </div>

      {/* ── Gráfico ── */}
      <section className={styles.chartSection} aria-label="Gráfico beneficio vs caja 12 meses">
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitulo}>Evolución a 12 meses</h2>
          <div className={styles.chartLeyenda}>
            <span className={styles.leyendaBeneficio}>— — Beneficio acumulado</span>
            <span className={styles.leyendaCaja}>—— Caja acumulada</span>
          </div>
        </div>
        <div className={styles.chartWrapper}>
          <canvas ref={chartRef} />
        </div>
        <p className={styles.chartNota}>
          La distancia vertical entre las dos líneas es la <strong>brecha de liquidez</strong>: el dinero que contablemente existe pero todavía no ha llegado a la cuenta bancaria.
        </p>
      </section>

      {/* ── Tabla mensual ── */}
      <section className={styles.tablaSection} aria-label="Tabla mensual de cobros, pagos y caja">
        <h2 className={styles.tablaTitulo}>Detalle mensual</h2>
        <div className={styles.tablaScroll}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Cobros</th>
                <th>Pagos</th>
                <th>Flujo mes</th>
                <th>Caja acum.</th>
                <th>Beneficio acum.</th>
                <th>Brecha</th>
              </tr>
            </thead>
            <tbody>
              {datos.map(d => {
                const brecha = d.beneficioCumulado - d.cajaCumulada;
                const negativo = d.cajaCumulada < 0;
                return (
                  <tr key={d.mes} className={negativo ? styles.filaNegativa : ''}>
                    <td className={styles.tdMes}>{d.mes}</td>
                    <td>{d.cobroMes > 0 ? fmtEur(d.cobroMes) : '—'}</td>
                    <td>{d.pagoMes > 0 ? fmtEur(d.pagoMes) : '—'}</td>
                    <td className={d.flujoMes >= 0 ? styles.tdPositivo : styles.tdNegativo}>
                      {d.flujoMes >= 0 ? '+' : ''}{fmtEur(d.flujoMes)}
                    </td>
                    <td className={negativo ? styles.tdNegativo : styles.tdPositivo}>
                      <strong>{fmtEur(d.cajaCumulada)}</strong>
                    </td>
                    <td className={styles.tdBeneficio}>{fmtEur(d.beneficioCumulado)}</td>
                    <td className={styles.tdBrecha}>{brecha > 0 ? fmtEur(brecha) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {mesMinCaja.cajaCumulada < 0 && (
          <p className={styles.tablaNota}>
            <span aria-hidden="true">📍</span> Punto más crítico: mes {mesMinCaja.mes} con {fmtEur(mesMinCaja.cajaCumulada)} en caja.
          </p>
        )}
      </section>

      {/* ── Por qué surge la brecha ── */}
      <section className={styles.causasSection} aria-label="Causas de la brecha de liquidez">
        <h2 className={styles.causasTitulo}>¿Qué causa la brecha?</h2>
        <div className={styles.causasGrid}>
          <div className={styles.causaCard}>
            <span className={styles.causaIcono} aria-hidden="true">🕐</span>
            <h3>Cobro tardío (PMC alto)</h3>
            <p>Cada día que tarda un cliente en pagar es un día que la empresa financia su negocio de su propio bolsillo. Con PMC de 90 días, el primer trimestre de ventas no llega en efectivo hasta el segundo.</p>
          </div>
          <div className={styles.causaCard}>
            <span className={styles.causaIcono} aria-hidden="true">📦</span>
            <h3>Stock elevado</h3>
            <p>Comprar mercancía antes de venderla inmoviliza dinero en almacén. Ese cash no aparece como gasto hasta que se vende, pero ya ha salido de la caja desde el momento de la compra.</p>
          </div>
          <div className={styles.causaCard}>
            <span className={styles.causaIcono} aria-hidden="true">⚡</span>
            <h3>Pago rápido a proveedores</h3>
            <p>Si se paga a proveedores en 30 días pero se cobra a clientes en 90, la empresa tiene 60 días en los que ha pagado sin haber cobrado. Esa diferencia hay que financiarla con caja propia.</p>
          </div>
          <div className={styles.causaCard}>
            <span className={styles.causaIcono} aria-hidden="true">🏭</span>
            <h3>Inversiones (capex)</h3>
            <p>Comprar maquinaria o equipos supone salida inmediata de caja. Sin embargo, el gasto en la cuenta de resultados se distribuye en años mediante amortizaciones, creando una gran brecha inicial.</p>
          </div>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Guía: Beneficio contable vs liquidez real"
        subtitle="Entiende por qué estos dos conceptos no son lo mismo y cómo gestionarlos"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Operaciones que separan beneficio de caja</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Operación</th>
                  <th>Efecto en beneficio</th>
                  <th>Efecto en caja</th>
                  <th>¿Cuándo divergen?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Venta a crédito</td>
                  <td>+Ingreso inmediato</td>
                  <td>+Cobro en PMC días</td>
                  <td>Siempre que PMC &gt; 0</td>
                </tr>
                <tr>
                  <td>Compra de stock</td>
                  <td>−Coste al vender</td>
                  <td>−Pago al comprar</td>
                  <td>Mientras haya stock sin vender</td>
                </tr>
                <tr>
                  <td>Amortización anual</td>
                  <td>−Gasto anual</td>
                  <td>Sin efecto (ya pagado)</td>
                  <td>Durante toda la vida útil</td>
                </tr>
                <tr>
                  <td>Compra de equipo</td>
                  <td>Sin efecto inmediato (activo)</td>
                  <td>−Importe total al comprar</td>
                  <td>En el año de compra</td>
                </tr>
                <tr>
                  <td>Pago diferido a proveedores</td>
                  <td>−Coste inmediato</td>
                  <td>−Pago en PMP días</td>
                  <td>Mientras PMP &gt; 0 (beneficia caja)</td>
                </tr>
                <tr>
                  <td>Anticipo de cliente</td>
                  <td>Sin efecto (pasivo)</td>
                  <td>+Cobro anticipado</td>
                  <td>Hasta que se entrega el bien</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>Quién sufre más la brecha de liquidez</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏗️</span>
              <h3>Empresa B2B industrial</h3>
              <p>Fabrica bajo pedido con materiales pagados a 30 días y facturas cobradas a 90 días. El ciclo de producción puede ser de 2-3 meses, creando una brecha estructural que debe financiarse.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
              <h3>Empresa en crecimiento</h3>
              <p>Al crecer rápido necesita más stock, más material y más personal antes de que lleguen los cobros. El éxito comercial puede provocar una crisis de caja si no hay capital de trabajo suficiente.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌾</span>
              <h3>Negocio estacional</h3>
              <p>Concentra el 60 % de las ventas en 4 meses pero tiene costes fijos todo el año. En temporada baja, la caja cae aunque el beneficio anual sea positivo. La planificación mensual es crítica.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
              <h3>Exportador</h3>
              <p>Cobra en divisas con plazos de 90-120 días y riesgo de tipo de cambio. La diferencia entre la fecha de facturación y la de cobro efectivo puede abarcar un trimestre completo.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Es posible quebrar siendo rentable?</dt>
              <dd>
                Sí, y es más frecuente de lo que parece. Se llama insolvencia técnica: la empresa tiene más activos que deudas (es solvente a largo plazo y rentable) pero no puede atender un vencimiento a corto plazo. Las estadísticas señalan que la falta de liquidez es la principal causa de cierre empresarial, por encima de la falta de rentabilidad.
                <span className={styles.faqTip}>Ejemplo clásico: empresa constructora que tiene obra contratada y facturada pero el promotor paga a la entrega. Mientras tanto, hay que pagar a operarios y proveedores cada mes.</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el ciclo de maduración de una empresa?</dt>
              <dd>
                Es el tiempo que transcurre desde que se paga la materia prima hasta que se cobra la venta del producto terminado. Incluye el tiempo de almacén de materias primas, el tiempo de fabricación, el tiempo en almacén de producto terminado y el plazo de cobro a clientes. Cuanto más largo sea este ciclo, más capital de trabajo necesita la empresa.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo se financia la brecha de liquidez?</dt>
              <dd>
                Las herramientas habituales son: líneas de crédito bancarias (pólizas de crédito), factoring (anticipar el cobro de facturas a clientes), confirming (gestión de pagos a proveedores con opción de anticipo), y préstamos de campaña (para negocios estacionales). También se puede actuar sobre el propio ciclo: reducir stock, acortar plazos de cobro y ampliar plazos de pago.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué el stock consume tanta caja?</dt>
              <dd>
                Porque el stock se paga cuando se compra (o a muy corto plazo) pero el coste solo aparece en la cuenta de resultados cuando se vende. Si tienes 3 meses de stock en almacén, tienes pagado el equivalente a 3 meses de coste de ventas sin haber recibido ningún ingreso por ello. Es capital inmovilizado que no genera rendimiento hasta que se vende.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es un presupuesto de tesorería y cómo se elabora?</dt>
              <dd>
                Es una proyección mensual de cobros y pagos reales (no de ingresos y gastos devengados). Se construye mes a mes desplazando las ventas por el PMC (para obtener cobros) y los costes por el PMP (para obtener pagos), añadiendo pagos extraordinarios como impuestos, nóminas, alquileres e inversiones. Con 3 meses de horizonte ya se detectan la mayoría de tensiones a tiempo de actuar.
              </dd>
            </div>
          </dl>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo gestionar la liquidez en 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Calcula tu PMC real</strong>
                <p>Divide el saldo de clientes entre las ventas anuales y multiplica por 365. Compara con el plazo contractual: la diferencia revela el retraso real de cobro.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Negocia plazos con proveedores</strong>
                <p>Ampliar el PMP de 30 a 60 días libera el equivalente a un mes de coste de ventas. Es financiación gratuita que no aparece en ninguna cuenta de préstamos.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Ajusta el nivel de stock</strong>
                <p>Define el stock de seguridad mínimo necesario y evita comprar más. Cada unidad de stock por encima del mínimo es capital inmovilizado que no renta.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Planifica las inversiones en periodos de alta caja</strong>
                <p>Un capex en el peor momento del ciclo puede llevar a la empresa a números rojos. Usa el simulador para ver el impacto antes de comprometerte.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Mantén un presupuesto de tesorería a 3 meses</strong>
                <p>Actualízalo semanalmente. Si detectas que en 6 semanas vas a tener tensión de caja, tienes tiempo de reaccionar: acelerar cobros, retrasar pagos o abrir una póliza de crédito.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>Buenas prácticas de gestión de caja</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <p><strong>Factura el mismo día que entregues:</strong> cada día que tardas en emitir la factura retrasa el cobro. Muchas empresas pierden días o semanas por no facturar en el momento.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔔</span>
              <p><strong>Pide confirmación de recepción de factura:</strong> el plazo de cobro empieza cuando el cliente recibe la factura, no cuando tú la envías. Un acuse de recibo evita sorpresas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💳</span>
              <p><strong>Ofrece descuento por pronto pago:</strong> un descuento del 1-2 % por pago a 10 días puede valer más que el coste de un crédito bancario. Calcula el coste anualizado antes de decidir.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <p><strong>Mantén una reserva de caja mínima:</strong> define un umbral mínimo de caja (ej. un mes de costes fijos) por debajo del cual activas el protocolo de alerta: paralizar pagos no urgentes y acelerar cobros.</p>
            </div>
          </div>
        </section>

        {/* Warning box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Señales de alerta de una crisis de liquidez próxima</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>El saldo de clientes crece más rápido que las ventas:</strong> indica que los cobros se están retrasando. Si vendes un 20 % más pero cobras un 40 % más tarde, la caja empeora aunque el negocio vaya bien.</li>
              <li><strong>Pagas a proveedores con retraso habitual:</strong> si sistemáticamente pagas tarde, es síntoma de que la caja no llega. A corto plazo puede funcionar, pero deteriora las condiciones y la confianza del proveedor.</li>
              <li><strong>El banco exige más garantías o reduce el límite de la póliza:</strong> suele ocurrir justo cuando más se necesita financiación. No esperes a ese momento para preparar la documentación.</li>
              <li><strong>Confundir la facturación de diciembre con el cobro de diciembre:</strong> cerrar el año con cifras de ventas récord pero olvidar que muchas se cobrarán en febrero puede generar una crisis de enero que nadie esperaba.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-beneficio-liquidez')} />
      <ShareCard appName="visualizador-beneficio-liquidez" />
      <Footer appName="visualizador-beneficio-liquidez" />
    </div>
  );
}
