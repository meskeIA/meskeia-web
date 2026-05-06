'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './VisualizadorJubilacionPerspectiva.module.css';
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
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';
import { FISCAL_PENSIONES_META, COTIZACION_MINIMA } from '@/data/fiscal';
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Lógica de porcentaje de pensión
// ─────────────────────────────────────────────

function calcularPorcentajePension(anosCotizados: number): number {
  if (anosCotizados < 15) return 0;
  const meses = Math.round(anosCotizados * 12);
  if (meses <= 180) return 50;
  let pct = 50;
  const mesesExtra = meses - 180;
  // Tramo 1: meses 181-276 → +0.21%/mes
  const mesesTramo1 = Math.min(mesesExtra, 96);
  pct += mesesTramo1 * 0.21;
  // Tramo 2: meses 277+ → +0.19%/mes
  if (mesesExtra > 96) {
    const mesesTramo2 = mesesExtra - 96;
    pct += mesesTramo2 * 0.19;
  }
  return Math.min(pct, 100);
}

// ───────────────────────────��─────────────────
// Hitos de la vida laboral
// ─────────────────────────────────────────────

interface Hito {
  edad: number;
  icono: string;
  titulo: string;
  descripcion: string;
}

function getHitos(edadInicio: number): Hito[] {
  const hitos: Hito[] = [];
  hitos.push({ edad: edadInicio, icono: '🎯', titulo: 'Inicio cotización', descripcion: 'Tu primer empleo que cotiza a la SS' });
  if (edadInicio + 15 <= 67) {
    hitos.push({ edad: edadInicio + 15, icono: '🔓', titulo: '15 años cotizados', descripcion: 'Mínimo para tener derecho a pensión (50%)' });
  }
  const edadCompleto = edadInicio + Math.ceil(COTIZACION_MINIMA.anosParaCien);
  if (edadCompleto <= 67) {
    hitos.push({ edad: edadCompleto, icono: '💯', titulo: `${formatNumber(COTIZACION_MINIMA.anosParaCien, 0)} años cotizados`, descripcion: 'Alcanzas el 100% de la base reguladora' });
  }
  hitos.push({ edad: 65, icono: '🎂', titulo: '65 años', descripcion: 'Jubilación si tienes +38 años cotizados' });
  hitos.push({ edad: 67, icono: '🏁', titulo: '67 años', descripcion: 'Edad ordinaria de jubilación (definitiva desde 2027)' });
  return hitos.sort((a, b) => a.edad - b.edad);
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorJubilacionPerspectivaPage() {
  const [edadInicio, setEdadInicio] = useState(23);
  const edadJubilacion = 67;

  const anosCotizados = Math.max(0, edadJubilacion - edadInicio);
  const pctPension = useMemo(() => calcularPorcentajePension(anosCotizados), [anosCotizados]);
  const hitos = useMemo(() => getHitos(edadInicio), [edadInicio]);

  // Gráfico: porcentaje de pensión según años cotizados
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const anos = Array.from({ length: 46 }, (_, i) => i);
    const porcentajes = anos.map(a => calcularPorcentajePension(a));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: anos.map(a => `${a}`),
        datasets: [{
          label: '% de pensión',
          data: porcentajes,
          borderColor: '#2E86AB',
          backgroundColor: 'rgba(46, 134, 171, 0.1)',
          fill: true,
          tension: 0.2,
          pointRadius: 0,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: { parsed: { x: number; y: number | null } }) =>
                `${ctx.parsed.x} años → ${formatNumber(ctx.parsed.y ?? 0, 1)}%`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Años cotizados' } },
          y: {
            min: 0, max: 105,
            ticks: { callback: (v: string | number) => `${v}%` },
            title: { display: true, text: '% de la base reguladora' },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, []);

  // Datos clave
  const tieneDerechoPension = anosCotizados >= 15;
  const tieneCompleto = pctPension >= 100;
  const anosParaCompleto = Math.ceil(COTIZACION_MINIMA.anosParaCien);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Tu Jubilación en Perspectiva</h1>
          <p className={styles.subtitle}>Visualiza tu vida laboral y cómo se traduce en pensión — año a año</p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />
        <DisclaimerCard variant="financial" severity="critical" />
        <DataReference
          normativa="Pensiones SS 2025-2026"
          fuente={FISCAL_PENSIONES_META.fuente}
          verificado={FISCAL_PENSIONES_META.verificado}
          urlOficial={FISCAL_PENSIONES_META.urlOficial}
        />

        {/* Slider edad inicio */}
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>¿A qué edad empezaste a cotizar?</label>
            <span className={styles.sliderValor}>{edadInicio} años</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={16}
            max={40}
            value={edadInicio}
            onChange={(e) => setEdadInicio(parseInt(e.target.value))}
            aria-label={`Edad de inicio de cotización: ${edadInicio} años`}
          />
          <div className={styles.sliderExtremos}>
            <span>16 años</span>
            <span>40 años</span>
          </div>
        </div>

        {/* Timeline visual */}
        <div className={styles.timeline}>
          <div className={styles.timelineBarraFondo}>
            {/* Barra de vida total (16 a 67) */}
            <div
              className={styles.timelineBarraCotizacion}
              style={{
                left: `${((edadInicio - 16) / (67 - 16)) * 100}%`,
                width: `${(anosCotizados / (67 - 16)) * 100}%`,
              }}
            />
          </div>
          <div className={styles.timelineLabels}>
            <span>16</span>
            <span>25</span>
            <span>35</span>
            <span>45</span>
            <span>55</span>
            <span>67</span>
          </div>
          <p className={styles.timelineResumen}>
            <strong>{anosCotizados} años cotizando</strong> (de {edadInicio} a {edadJubilacion} años)
          </p>
        </div>

        {/* Resultado principal */}
        <div className={styles.resultadoPrincipal}>
          <div className={styles.resultadoCirculo}>
            <span className={styles.resultadoPct}>{formatNumber(pctPension, 1)}%</span>
            <span className={styles.resultadoLabel}>de tu base reguladora</span>
          </div>
          <div className={styles.resultadoInfo}>
            {!tieneDerechoPension && (
              <p className={styles.resultadoAlerta}>
                Con {anosCotizados} años cotizados <strong>no tendrías derecho a pensión contributiva</strong>. Necesitas al menos 15 años.
              </p>
            )}
            {tieneDerechoPension && !tieneCompleto && (
              <p className={styles.resultadoTexto}>
                Con {anosCotizados} años, recibirías el <strong>{formatNumber(pctPension, 1)}%</strong> de tu base reguladora. Te faltan <strong>{anosParaCompleto - anosCotizados} años</strong> más para el 100%.
              </p>
            )}
            {tieneCompleto && (
              <p className={styles.resultadoTexto}>
                Con {anosCotizados} años, alcanzas el <strong>100%</strong> de tu base reguladora. Empezar pronto te ha dado margen.
              </p>
            )}
          </div>
        </div>

        {/* Hitos de la vida laboral */}
        <div className={styles.hitosGrid}>
          {hitos.map((h, i) => (
            <div key={i} className={`${styles.hitoCard} ${h.edad <= edadInicio || h.edad > edadJubilacion ? styles.hitoFuturo : ''}`}>
              <span className={styles.hitoIcono} aria-hidden="true">{h.icono}</span>
              <span className={styles.hitoEdad}>{h.edad} años</span>
              <span className={styles.hitoTitulo}>{h.titulo}</span>
              <span className={styles.hitoDesc}>{h.descripcion}</span>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitulo}>Porcentaje de pensión según años cotizados</h3>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label="Gráfico: porcentaje de pensión según años cotizados a la Seguridad Social" />
          </div>
          <p className={styles.chartNota}>El salto de 0% a 50% ocurre al cumplir 15 años. Después sube gradualmente hasta el 100% a los ~37 años.</p>
        </div>

        <div className={styles.insight}>
          <p>
            El sistema de pensiones español tiene un diseño claro: <strong>los primeros 15 años te dan acceso</strong> (50%),
            y los siguientes ~22 años te llevan del 50% al 100%. Cada año extra después de los 15 cuenta — pero
            los primeros 15 son todo o nada.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Simula tu pensión real → <a href="/simulador-jubilacion-publica/">Simulador Jubilación</a> · <a href="/planificador-ahorro-jubilacion/">Planificador Ahorro Jubilación</a>
        </div>

        <EducationalSection
          title="Lo que deberías saber sobre tu jubilación"
          subtitle="Claves del sistema de pensiones español"
          defaultOpen={false}
        >
          <h3>La base reguladora: de qué depende tu pensión</h3>
          <p>
            Tu pensión no se calcula sobre tu último sueldo, sino sobre la <strong>base reguladora</strong>:
            la media de tus bases de cotización de los últimos 25 años. Si tuviste periodos de bajos
            ingresos, bajan la media. Los periodos sin cotizar (lagunas) se rellenan con la base mínima.
          </p>

          <h3>El truco de los 15 años mínimos</h3>
          <p>
            Con menos de 15 años cotizados no tienes pensión contributiva (aunque sí podrías optar a
            la no contributiva, mucho más baja). Al cumplir 15 años, saltas directamente al 50%.
            Esto significa que <strong>cada mes cuenta si estás cerca de los 15 años</strong>.
          </p>

          <h3>Jubilación anticipada: puedes, pero con penalización</h3>
          <p>
            Puedes jubilarte hasta 2 años antes de la edad ordinaria (voluntaria) o 4 años antes
            si te despiden (forzosa). Pero cada trimestre de anticipación reduce tu pensión entre
            un 1,5% y un 2%. A los 63 años con 38 años cotizados, la penalización puede ser del 12-16%.
          </p>

          <h3>¿Y si empiezo tarde?</h3>
          <p>
            Si empiezas a cotizar a los 30, llegarás a los 67 con 37 años — justo para el 100%.
            Si empiezas a los 35, llegarás con 32 años — aproximadamente un 88%. Cada año que
            retrasas el inicio se nota en la pensión final.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este visualizador usa datos normativos 2025-2026 y asume cotización
            continua sin lagunas. La realidad incluye periodos de desempleo, cambios de base, y posibles
            reformas futuras. Para un cálculo real, consulta tu vida laboral en la Seguridad Social.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-jubilacion-perspectiva')} />
        <ShareCard appName="visualizador-jubilacion-perspectiva" />
        <Footer appName="visualizador-jubilacion-perspectiva" />
      </div>
    </>
  );
}
