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
import { formatCurrency, formatNumber, formatPercentage } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  FISCAL_SS_CUENTA_AJENA_META,
  COTIZACIONES_SS_2026,
  BASES_SS_2026,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal';
import {
  calcularSueldo,
  brutoDondeIrpfSuperaSS,
  BRUTO_TOPE_SS,
  TIPO_SS_TRABAJADOR,
  type TramoDesglose,
} from './motor';
import Chart from 'chart.js/auto';

/** Ejercicio de los datos que se aplican (hallazgo 1895: se anunciaba 2025 y se calculaba 2026). */
const EJERCICIO = FISCAL_IRPF_META.vigencia;

/** Porcentaje en escala 0-100, con espacio duro antes del % (CLAUDE.md global §2). */
const pct = (n: number, decimales = 1) => formatPercentage(n / 100, decimales);

const rangoTramo = (t: TramoDesglose) =>
  t.hasta === null
    ? `Más de ${formatCurrency(t.desde)}`
    : `${formatCurrency(t.desde)} → ${formatCurrency(t.hasta)}`;

// Cifras de la guía, calculadas con el MISMO motor que la cascada (hallazgo 1896: la guía daba
// un tipo efectivo «~15%» para 35.000 € que salía del modelo anterior a las reparaciones).
const BRUTO_EJEMPLO_GUIA = 35000;
const EJEMPLO_GUIA = calcularSueldo(BRUTO_EJEMPLO_GUIA);
const BRUTO_CRUCE_SS_IRPF = brutoDondeIrpfSuperaSS();
/** Cuánto mayor es cada mensualidad en 12 pagas que en 14 (sospecha del 25/09: decía «~16%»). */
const AUMENTO_12_PAGAS = (14 / 12 - 1) * 100;

const SUELDOS_COMPARAR = [20000, 30000, 45000, 60000, 80000, 120000];
const COMPARATIVA = SUELDOS_COMPARAR.map((b) => calcularSueldo(b));

/** Colores del gráfico, leídos de los tokens del módulo para que sigan al tema. */
function coloresGrafico(el: HTMLElement) {
  const css = getComputedStyle(el);
  const v = (nombre: string, respaldo: string) => css.getPropertyValue(nombre).trim() || respaldo;
  return {
    texto: v('--text-secondary', '#666666'),
    rejilla: v('--border', '#E5E5E5'),
    neto: v('--primary-boton', '#26718F'),
    irpf: v('--rojo-fondo', '#C0392B'),
    ss: v('--naranja-fondo', '#A84300'),
  };
}

export default function VisualizadorSueldoNetoPage() {
  const [brutoAnual, setBrutoAnual] = useState(30000);
  const datos = useMemo(() => calcularSueldo(brutoAnual), [brutoAnual]);

  // Gráfico de barras apiladas para comparar varios sueldos
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const lienzo = chartRef.current;
    if (!lienzo) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = lienzo.getContext('2d');
    if (!ctx) return;

    const c = coloresGrafico(lienzo);
    const grafico = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: SUELDOS_COMPARAR.map(b => formatCurrency(b)),
        datasets: [
          { label: 'Neto', data: COMPARATIVA.map(d => d.pctNeto), backgroundColor: c.neto, borderRadius: 2 },
          { label: 'IRPF', data: COMPARATIVA.map(d => d.pctIRPF), backgroundColor: c.irpf, borderRadius: 2 },
          { label: 'Seguridad Social', data: COMPARATIVA.map(d => d.pctSS), backgroundColor: c.ss, borderRadius: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: c.texto,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, color: c.texto } },
          tooltip: {
            callbacks: {
              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
                `${ctx.dataset.label}: ${pct(ctx.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: c.texto },
            grid: { color: c.rejilla },
            title: { display: true, text: 'Sueldo bruto anual', color: c.texto },
          },
          y: {
            stacked: true,
            max: 100,
            ticks: { color: c.texto, callback: (v: string | number) => pct(Number(v), 0) },
            grid: { color: c.rejilla },
            title: { display: true, text: '% del bruto', color: c.texto },
          },
        },
      },
    } as never);
    chartInstanceRef.current = grafico;

    // Hallazgo 1903: Chart.js escribía ejes y leyenda en su #666 por defecto, también en oscuro.
    // Al cambiar de tema se releen los tokens y se repinta.
    const repintar = () => {
      const n = coloresGrafico(lienzo);
      const o = grafico.options as unknown as {
        color: string;
        plugins: { legend: { labels: { color: string } } };
        scales: Record<'x' | 'y', { ticks: { color: string }; grid: { color: string }; title: { color: string } }>;
      };
      o.color = n.texto;
      o.plugins.legend.labels.color = n.texto;
      for (const eje of ['x', 'y'] as const) {
        o.scales[eje].ticks.color = n.texto;
        o.scales[eje].grid.color = n.rejilla;
        o.scales[eje].title.color = n.texto;
      }
      grafico.update('none');
    };
    const observador = new MutationObserver(repintar);
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      observador.disconnect();
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  // Colores para tramos IRPF (marca de color junto al texto, no texto)
  const coloresTramos = ['#27ae60', '#48A9A6', '#2E86AB', '#e67e22', '#e74c3c', '#8e44ad'];

  // Recuadro de conclusión (hallazgos 1896 y 1897): sale de las cifras de la cascada, no de
  // rangos de bruto escritos a mano, que se quedaron con el modelo anterior a las reparaciones.
  const conclusion = (() => {
    if (datos.irpfAnual === 0) {
      return (
        <p>
          Con {formatCurrency(brutoAnual)} de bruto, <strong>el IRPF del año queda en cero</strong>:
          la deducción por obtención de rendimientos del trabajo ({formatCurrency(datos.deduccionDA61)})
          cubre toda la cuota. Lo único que se descuenta es la Seguridad Social.
        </p>
      );
    }
    if (datos.totalSS >= datos.irpfAnual) {
      return (
        <p>
          Con {formatCurrency(brutoAnual)} de bruto, <strong>la Seguridad Social ({formatCurrency(datos.totalSS)})
          pesa más que el IRPF ({formatCurrency(datos.irpfAnual)})</strong>. La cotización es un
          porcentaje de la base desde el primer euro, mientras que el IRPF todavía queda rebajado por
          el mínimo personal, la reducción del art. 20 y la deducción de la DA 61.ª.
        </p>
      );
    }
    return (
      <p>
        Con {formatCurrency(brutoAnual)} de bruto, <strong>el IRPF ({formatCurrency(datos.irpfAnual)})
        pesa {formatNumber(datos.irpfAnual / datos.totalSS, 1)} veces lo que la Seguridad Social
        ({formatCurrency(datos.totalSS)})</strong>. La última parte de tu base tributa al{' '}
        {pct(datos.tipoMarginal, 0)} (tipo marginal), aunque sobre el total pagas un{' '}
        {pct(datos.tipoEfectivoIRPF)} (tipo efectivo).
      </p>
    );
  })();

  const minimoCapado = datos.minimoAplicado < datos.minimoPersonal;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Tu Sueldo Bruto a Neto, Paso a Paso</h1>
          <p className={styles.subtitle}>Visualiza cómo se transforma tu bruto en neto — cada euro, paso a paso</p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />
        <DisclaimerCard variant="financial" severity="critical" />
        {/* Hallazgo 1895: dos fuentes, como la hermana estimador-sueldo-neto — el IRPF (con la
            DA 61.ª de 2026) y la cotización de la Seguridad Social (Orden PJC/297/2026). */}
        <DataReference
          normativa={`IRPF ${EJERCICIO}`}
          fuente={FISCAL_IRPF_META.fuente}
          verificado={FISCAL_IRPF_META.verificado}
          urlOficial={FISCAL_IRPF_META.urlOficial}
          nota={`La deducción por obtención de rendimientos del trabajo sigue la DA 61.ª LIRPF en la redacción del art. 28 del Real Decreto-ley 5/2026 (cuantías de ${EJERCICIO}). ${FISCAL_IRPF_META.nota}`}
        />
        <DataReference
          normativa={`Cotizaciones del trabajador ${FISCAL_SS_CUENTA_AJENA_META.vigencia}`}
          fuente={FISCAL_SS_CUENTA_AJENA_META.fuente}
          verificado={FISCAL_SS_CUENTA_AJENA_META.verificado}
          urlOficial={FISCAL_SS_CUENTA_AJENA_META.urlOficial}
          nota={FISCAL_SS_CUENTA_AJENA_META.nota}
        />

        {/* Slider de sueldo */}
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel} htmlFor="bruto-anual">Sueldo bruto anual</label>
            <span className={styles.sliderValor}>{formatCurrency(brutoAnual)}</span>
          </div>
          <input
            id="bruto-anual"
            type="range"
            className={styles.slider}
            min={15000}
            max={150000}
            step={1000}
            value={brutoAnual}
            onChange={(e) => setBrutoAnual(parseInt(e.target.value, 10))}
            aria-valuetext={formatCurrency(brutoAnual)}
          />
          <div className={styles.sliderExtremos}>
            <span>{formatCurrency(15000)}</span>
            <span>{formatCurrency(150000)}</span>
          </div>
        </div>

        {/* Hallazgo 1899: el supuesto del cálculo, a la vista y junto al resultado. Es un
            visualizador de un solo mando; la situación familiar la pregunta la hermana. */}
        <div className={styles.supuesto}>
          <p>
            <strong>Para quién vale este neto:</strong> contribuyente soltero/a, sin hijos ni
            ascendientes a cargo, menor de 65 años y sin discapacidad (mínimo personal de{' '}
            {formatCurrency(datos.minimoPersonal)}), con un solo pagador y contrato indefinido, y la
            escala general del IRPF con un tipo autonómico medio. Si tienes hijos, estás casado/a o
            quieres elegir 12 o 14 pagas, usa la{' '}
            <a href="/estimador-sueldo-neto/">calculadora de sueldo neto</a>, que pregunta tu situación
            familiar.
          </p>
        </div>

        {/* Cascada visual */}
        <div className={styles.cascada}>
          <div className={styles.cascadaItem}>
            <div className={styles.cascadaIcono} aria-hidden="true">💰</div>
            <div className={styles.cascadaInfo}>
              <span className={styles.cascadaLabel}>Sueldo bruto anual</span>
              <span className={styles.cascadaValorPrincipal}>{formatCurrency(datos.brutoAnual)}</span>
              <span className={styles.cascadaPct}>{pct(100, 0)}</span>
            </div>
          </div>

          <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

          <div className={`${styles.cascadaItem} ${styles.cascadaResta}`}>
            <div className={styles.cascadaIcono} aria-hidden="true">🏥</div>
            <div className={styles.cascadaInfo}>
              <span className={styles.cascadaLabel}>Seguridad Social</span>
              <span className={styles.cascadaValor}>− {formatCurrency(datos.totalSS)}</span>
              <span className={styles.cascadaPct}>{pct(datos.pctSS)} del bruto</span>
            </div>
          </div>

          {/* Desglose SS */}
          <div className={styles.desgloseSS}>
            <div className={styles.desgloseItem}>
              <span>Contingencias comunes ({pct(COTIZACIONES_SS_2026.contingenciasComunes, 2)})</span>
              <span>− {formatCurrency(datos.ssContingencias)}</span>
            </div>
            <div className={styles.desgloseItem}>
              <span>Desempleo ({pct(COTIZACIONES_SS_2026.desempleo, 2)})</span>
              <span>− {formatCurrency(datos.ssDesempleo)}</span>
            </div>
            <div className={styles.desgloseItem}>
              <span>Formación profesional ({pct(COTIZACIONES_SS_2026.formacionProfesional, 2)})</span>
              <span>− {formatCurrency(datos.ssFormacion)}</span>
            </div>
            <div className={styles.desgloseItem}>
              <span>MEI ({pct(COTIZACIONES_SS_2026.mef, 2)})</span>
              <span>− {formatCurrency(datos.ssMEI)}</span>
            </div>
            {datos.baseSSTopada && (
              <p className={styles.desgloseNotaSS}>
                Tu base mensual ({formatCurrency(datos.brutoMensual)}) pasa del tope de{' '}
                {formatCurrency(BASES_SS_2026.maxima)}: se cotiza solo por el tope.
              </p>
            )}
          </div>

          <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

          <div className={`${styles.cascadaItem} ${styles.cascadaResta}`}>
            <div className={styles.cascadaIcono} aria-hidden="true">🏛️</div>
            <div className={styles.cascadaInfo}>
              <span className={styles.cascadaLabel}>IRPF anual (cuota estimada)</span>
              <span className={styles.cascadaValor}>− {formatCurrency(datos.irpfAnual)}</span>
              <span className={styles.cascadaPct}>Tipo efectivo: {pct(datos.tipoEfectivoIRPF)}</span>
            </div>
          </div>

          {/* Hallazgo 1898: el paso a paso del IRPF entero, para poder seguirlo a mano —
              base (arts. 19 y 20), escala y mínimo (art. 63.1.2.º), y deducción (DA 61.ª). */}
          <div className={styles.desgloseTramos}>
            <p className={styles.desgloseTramTitulo}>De tu bruto a la base del IRPF</p>
            <div className={styles.pasoFila}>
              <span>Bruto − Seguridad Social</span>
              <span>{formatCurrency(datos.rendimientoPrevio)}</span>
            </div>
            <div className={styles.pasoFila}>
              <span>− Gastos generales (art. 19.2.f LIRPF)</span>
              <span>− {formatCurrency(datos.gastosGenerales)}</span>
            </div>
            <div className={styles.pasoFila}>
              <span>− Reducción por rendimientos del trabajo (art. 20 LIRPF)</span>
              <span>− {formatCurrency(datos.reduccionArt20)}</span>
            </div>
            <div className={`${styles.pasoFila} ${styles.pasoTotal}`}>
              <span>= Base liquidable</span>
              <span>{formatCurrency(datos.baseLiquidable)}</span>
            </div>
            <p className={styles.desgloseTramNota}>
              La reducción del art. 20 se mide sobre bruto − Seguridad Social (
              {formatCurrency(datos.rendimientoPrevio)}), antes de restar los gastos generales, y se
              agota cuando esa cifra llega a{' '}
              {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}.
            </p>
          </div>

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
                    <span className={styles.tramoRango}>{rangoTramo(t)}</span>
                    <span className={styles.tramoPct}>al {pct(t.tipo, 0)}</span>
                  </div>
                  <div className={styles.tramoValores}>
                    <span className={styles.tramoBase}>{formatCurrency(t.base)}</span>
                    <span className={styles.tramoCuota}>→ {formatCurrency(t.cuota)}</span>
                  </div>
                </div>
              ))}
              <p className={styles.desgloseTramNota}>
                Los tramos se aplican a la base <strong>entera</strong> ({formatCurrency(datos.baseLiquidable)})
                y suman {formatCurrency(datos.cuotaEscalaIRPF)}. De ahí se resta la misma escala aplicada
                al mínimo personal de {formatCurrency(datos.minimoPersonal)}
                {minimoCapado && (
                  <>, que no puede superar la base y aquí se limita a {formatCurrency(datos.minimoAplicado)}</>
                )}{' '}—{formatCurrency(datos.cuotaMinimoIRPF)}—, que es la forma en que la ley lo grava
                a tipo cero (art. 63.1.2.º LIRPF). Cuota íntegra:{' '}
                {formatCurrency(datos.cuotaIntegraIRPF)}.
              </p>
            </div>
          )}

          <div className={styles.desgloseTramos}>
            <p className={styles.desgloseTramTitulo}>De la cuota íntegra al IRPF del año</p>
            <div className={styles.pasoFila}>
              <span>Cuota íntegra</span>
              <span>{formatCurrency(datos.cuotaIntegraIRPF)}</span>
            </div>
            <div className={styles.pasoFila}>
              <span>− Deducción por obtención de rendimientos del trabajo (DA 61.ª LIRPF)</span>
              <span>− {formatCurrency(datos.deduccionDA61)}</span>
            </div>
            <div className={`${styles.pasoFila} ${styles.pasoTotal}`}>
              <span>= IRPF anual</span>
              <span>{formatCurrency(datos.irpfAnual)}</span>
            </div>
            <p className={styles.desgloseTramNota}>
              Es el IRPF que corresponde en el año, el que saldría en la declaración de la renta. La
              retención de cada nómina la calcula la empresa con el procedimiento del Reglamento del
              IRPF (arts. 80 a 86) y puede ser algo distinta: la diferencia se regulariza al presentar
              la declaración.
            </p>
          </div>

          <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

          <div className={`${styles.cascadaItem} ${styles.cascadaResultado}`}>
            <div className={styles.cascadaIcono} aria-hidden="true">✅</div>
            <div className={styles.cascadaInfo}>
              <span className={styles.cascadaLabel}>Tu sueldo neto anual</span>
              <span className={styles.cascadaValorPrincipal}>{formatCurrency(datos.netoAnual)}</span>
              <span className={styles.cascadaPct}>{pct(datos.pctNeto)} del bruto → {formatCurrency(datos.netoMensual)}/mes (12 pagas)</span>
            </div>
          </div>
        </div>

        {/* Barra de reparto (los anchos CSS no son texto: van sin espacio) */}
        <div className={styles.barraReparto}>
          <div
            className={styles.barraNeto}
            style={{ width: `${datos.pctNeto}%` }}
          >
            <span className={styles.barraTexto}>Neto {pct(datos.pctNeto, 0)}</span>
          </div>
          <div
            className={styles.barraIRPF}
            style={{ width: `${datos.pctIRPF}%` }}
          >
            <span className={styles.barraTexto}>IRPF {pct(datos.pctIRPF, 0)}</span>
          </div>
          <div
            className={styles.barraSS}
            style={{ width: `${datos.pctSS}%` }}
          >
            <span className={styles.barraTexto}>SS {pct(datos.pctSS, 0)}</span>
          </div>
        </div>

        {/* Insight contextual */}
        <div className={styles.insight}>
          {conclusion}
          {datos.baseSSTopada && (
            <p>
              Te llevas a casa el {pct(datos.pctNeto)} del bruto. La SS <strong>deja de crecer</strong> a
              partir de {formatCurrency(BRUTO_TOPE_SS)} de bruto anual, porque la base mensual se topa en{' '}
              {formatCurrency(BASES_SS_2026.maxima)}; el IRPF, en cambio, sigue creciendo con cada tramo.
            </p>
          )}
        </div>

        {/* Hallazgo 1905: el destino, sin valorar la carga fiscal (§1.quinquies). */}
        <div className={styles.insight}>
          <p>
            Las cotizaciones a la Seguridad Social financian pensiones, prestaciones por desempleo, baja por
            enfermedad y formación profesional. El IRPF financia sanidad, educación, infraestructuras y el
            resto de servicios públicos.
          </p>
        </div>

        {/* Gráfico comparativo */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitulo}>Comparativa: ¿cómo cambia el reparto según el sueldo?</h3>
          <div className={styles.chartWrap}>
            <canvas
              ref={chartRef}
              role="img"
              aria-label="Gráfico de barras apiladas: neto, IRPF y SS por nivel salarial. Los datos están en la tabla que sigue."
            />
          </div>
          <details className={styles.chartDatos}>
            <summary>Ver los datos del gráfico</summary>
            <table className={styles.tablaDatos}>
              <caption>Reparto del bruto por nivel salarial (mismo supuesto que la cascada)</caption>
              <thead>
                <tr>
                  <th scope="col">Bruto anual</th>
                  <th scope="col">Neto</th>
                  <th scope="col">IRPF</th>
                  <th scope="col">Seguridad Social</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((d) => (
                  <tr key={d.brutoAnual}>
                    <th scope="row">{formatCurrency(d.brutoAnual)}</th>
                    <td>{pct(d.pctNeto)}</td>
                    <td>{pct(d.pctIRPF)}</td>
                    <td>{pct(d.pctSS)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Calcula tu IRPF exacto → <a href="/estimador-irpf/">Estimador de IRPF</a> · <a href="/estimador-sueldo-neto/">Calculadora Sueldo Neto</a>
        </div>

        <EducationalSection
          title="Lo que conviene saber sobre tu nómina"
          subtitle="Entiende cada descuento de tu sueldo"
          defaultOpen={false}
        >
          <h3>Tipo marginal vs tipo efectivo</h3>
          <p>
            El tipo marginal es lo que pagas por el <strong>último euro</strong> de tu base. El tipo efectivo
            es el porcentaje real que pagas sobre el total. Con este visualizador, un sueldo de{' '}
            {formatCurrency(BRUTO_EJEMPLO_GUIA)} tiene un tipo marginal del{' '}
            {pct(EJEMPLO_GUIA.tipoMarginal, 0)}, pero un tipo efectivo del{' '}
            {pct(EJEMPLO_GUIA.tipoEfectivoIRPF)} sobre el bruto, porque los primeros euros de la base
            tributan al {pct(EJEMPLO_GUIA.desgloseTramosIRPF[0]?.tipo ?? 0, 0)} y el mínimo personal
            se grava a tipo cero.
          </p>

          <h3>¿Por qué la SS pesa tanto en sueldos bajos?</h3>
          <p>
            Las cotizaciones a la Seguridad Social son un <strong>porcentaje de la base de cotización</strong>{' '}
            ({pct(TIPO_SS_TRABAJADOR, 2)} a cargo del trabajador) desde el primer euro, sin mínimo exento.
            Solo tienen techo: la base mensual se topa en {formatCurrency(BASES_SS_2026.maxima)}, así que
            a partir de {formatCurrency(BRUTO_TOPE_SS)} de bruto anual la cotización deja de crecer. El
            IRPF, en cambio, queda muy rebajado en sueldos bajos por el mínimo personal, la reducción
            del art. 20 y la deducción de la DA 61.ª
            {BRUTO_CRUCE_SS_IRPF !== null && (
              <>: con el supuesto de esta página, la SS pesa más que el IRPF por debajo de unos{' '}
              {formatCurrency(BRUTO_CRUCE_SS_IRPF)} de bruto</>
            )}
            .
          </p>

          <h3>Lo que tu empresa paga y tú no ves</h3>
          <p>
            Además de tu bruto, la empresa ingresa en la Seguridad Social su propia cotización por ti:
            contingencias comunes, desempleo, formación profesional, FOGASA, su parte del Mecanismo de
            Equidad Intergeneracional (MEI) y la de accidentes de trabajo y enfermedades profesionales,
            cuyo tipo depende de la actividad. En un contrato indefinido, la suma pasa del 30{' '}%
            de la base de cotización. Esta cotización forma parte del coste laboral total y no aparece
            como descuento en tu nómina.
          </p>

          <h3>Las pagas extras: ¿mejor prorrateadas?</h3>
          <p>
            A efectos fiscales, da igual: el IRPF se calcula sobre el total anual, y la cotización
            también, porque la base mensual ya incluye la parte proporcional de las extras. En 12
            pagas, cada mensualidad es un {pct(AUMENTO_12_PAGAS)} mayor que en 14 (14 ÷ 12); en 14,
            cobras dos pagas extra al año. La elección no afecta a cuánto pagas de impuestos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este visualizador usa datos normativos de {EJERCICIO} y supone un
            contribuyente soltero sin hijos, con un solo pagador y sin deducciones adicionales. Tu caso
            real puede variar significativamente según tu comunidad autónoma, tu situación familiar y
            otras circunstancias.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sueldo-neto')} />
        <ShareCard appName="visualizador-sueldo-neto" />
        <Footer appName="visualizador-sueldo-neto" />
    </div>
  );
}
