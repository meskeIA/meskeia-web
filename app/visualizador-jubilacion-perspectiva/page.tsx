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
import { getRelatedApps } from '@/data/app-relations';
import { FISCAL_PENSIONES_META } from '@/data/fiscal';
import Chart from 'chart.js/auto';
import {
  porcentajePension,
  pct,
  pctCompacto,
  aniosYMeses,
  MESES_ACCESO,
  ANIOS_ACCESO,
  MESES_PARA_CIEN,
  PCT_ACCESO,
  EDAD_ORDINARIA,
  EDAD_CON_CARRERA_LARGA,
  MESES_PARA_65,
  ANIOS_ANTICIPO_VOLUNTARIA,
  ANIOS_ANTICIPO_INVOLUNTARIA,
  COEF_TRIMESTRE_MIN,
  COEF_TRIMESTRE_MAX,
  EJEMPLO_ANTICIPADA,
  ejemploInicio,
  frenteAlCien,
} from './escala';

// El porcentaje de la pensión sale SIEMPRE del motor compartido (calcularPorcentajePension,
// lib/calculadoras/pensionPublica.ts), con la escala definitiva de 2027 (ver ./escala.ts). Hasta el
// 26/09/2026 aquí había una copia de la escala con el tramo del 0,21 % hasta el mes 276
// (hallazgo 2229): inflaba hasta 0,94 puntos las carreras de 20 a 36 años.

// ─────────────────────────────────────────────
// Hitos de la vida laboral (edades en meses, para no redondear los 36 años y 6 meses)
// ─────────────────────────────────────────────

interface Hito {
  edadMeses: number;
  icono: string;
  titulo: string;
  descripcion: string;
}

function getHitos(edadInicio: number): Hito[] {
  const inicioMeses = edadInicio * 12;
  const finMeses = EDAD_ORDINARIA * 12;
  const hitos: Hito[] = [];
  hitos.push({ edadMeses: inicioMeses, icono: '🎯', titulo: 'Inicio cotización', descripcion: 'Tu primer empleo que cotiza a la SS' });
  if (inicioMeses + MESES_ACCESO <= finMeses) {
    hitos.push({
      edadMeses: inicioMeses + MESES_ACCESO,
      icono: '🔓',
      titulo: `${aniosYMeses(MESES_ACCESO)} cotizados`,
      descripcion: `Mínimo para tener derecho a pensión (${pct(PCT_ACCESO, 0)})`,
    });
  }
  if (inicioMeses + MESES_PARA_CIEN <= finMeses) {
    hitos.push({
      edadMeses: inicioMeses + MESES_PARA_CIEN,
      icono: '💯',
      titulo: `${aniosYMeses(MESES_PARA_CIEN)} cotizados`,
      descripcion: `Alcanzas el ${pct(100, 0)} de la base reguladora`,
    });
  }
  hitos.push({
    edadMeses: EDAD_CON_CARRERA_LARGA * 12,
    icono: '🎂',
    titulo: 'Carrera larga',
    descripcion: `Jubilación si tienes ${aniosYMeses(MESES_PARA_65)} cotizados`,
  });
  hitos.push({ edadMeses: finMeses, icono: '🏁', titulo: 'Jubilación ordinaria', descripcion: 'Edad ordinaria de jubilación (definitiva desde 2027)' });
  return hitos.sort((a, b) => a.edadMeses - b.edadMeses);
}

/** Colores del gráfico, leídos de los tokens para que sigan al tema (hallazgo 2238). */
function coloresGrafico(el: HTMLElement) {
  const css = getComputedStyle(el);
  const v = (nombre: string, respaldo: string) => css.getPropertyValue(nombre).trim() || respaldo;
  return {
    texto: v('--text-secondary', '#666666'),
    rejilla: v('--border', '#E5E5E5'),
    linea: v('--primary-texto', '#26718F'),
  };
}

const EJEMPLO_30 = ejemploInicio(30);
const EJEMPLO_35 = ejemploInicio(35);

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorJubilacionPerspectivaPage() {
  const [edadInicio, setEdadInicio] = useState(23);
  const edadJubilacion = EDAD_ORDINARIA;

  const anosCotizados = Math.max(0, edadJubilacion - edadInicio);
  const mesesCotizados = anosCotizados * 12;
  const pctPension = useMemo(() => porcentajePension(mesesCotizados), [mesesCotizados]);
  const hitos = useMemo(() => getHitos(edadInicio), [edadInicio]);

  // Gráfico: porcentaje de pensión según años cotizados
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const lienzo = chartRef.current;
    if (!lienzo) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = lienzo.getContext('2d');
    if (!ctx) return;

    const anos = Array.from({ length: 46 }, (_, i) => i);
    const porcentajes = anos.map(a => porcentajePension(a * 12));
    const c = coloresGrafico(lienzo);

    const grafico = new Chart(ctx, {
      type: 'line',
      data: {
        labels: anos.map(a => `${a}`),
        datasets: [{
          label: '% de pensión',
          data: porcentajes,
          borderColor: c.linea,
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
        color: c.texto,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: { parsed: { x: number; y: number | null } }) =>
                `${ctx.parsed.x} años → ${pct(ctx.parsed.y ?? 0, 2)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: c.texto },
            grid: { color: c.rejilla },
            title: { display: true, text: 'Años cotizados', color: c.texto },
          },
          y: {
            min: 0, max: 105,
            ticks: { color: c.texto, callback: (v: string | number) => pct(Number(v), 0) },
            grid: { color: c.rejilla },
            title: { display: true, text: '% de la base reguladora', color: c.texto },
          },
        },
      },
    } as never);
    chartInstanceRef.current = grafico;

    // Al cambiar de tema se releen los tokens y se repinta (mismo patrón que visualizador-sueldo-neto).
    const repintar = () => {
      const n = coloresGrafico(lienzo);
      const o = grafico.options as unknown as {
        color: string;
        scales: Record<'x' | 'y', { ticks: { color: string }; grid: { color: string }; title: { color: string } }>;
      };
      o.color = n.texto;
      for (const eje of ['x', 'y'] as const) {
        o.scales[eje].ticks.color = n.texto;
        o.scales[eje].grid.color = n.rejilla;
        o.scales[eje].title.color = n.texto;
      }
      const serie = grafico.data.datasets[0] as unknown as { borderColor: string };
      serie.borderColor = n.linea;
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

  // Datos clave
  const tieneDerechoPension = mesesCotizados >= MESES_ACCESO;
  const tieneCompleto = mesesCotizados >= MESES_PARA_CIEN;
  const mesesQueFaltan = Math.max(0, MESES_PARA_CIEN - mesesCotizados);

  return (
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
            {/* Barra de vida total (16 a la edad ordinaria) */}
            <div
              className={styles.timelineBarraCotizacion}
              style={{
                left: `${((edadInicio - 16) / (EDAD_ORDINARIA - 16)) * 100}%`,
                width: `${(anosCotizados / (EDAD_ORDINARIA - 16)) * 100}%`,
              }}
            />
          </div>
          <div className={styles.timelineLabels}>
            <span>16</span>
            <span>25</span>
            <span>35</span>
            <span>45</span>
            <span>55</span>
            <span>{EDAD_ORDINARIA}</span>
          </div>
          <p className={styles.timelineResumen}>
            <strong>{anosCotizados} años cotizando</strong> (de {edadInicio} a {edadJubilacion} años)
          </p>
        </div>

        {/* Resultado principal */}
        <div className={styles.resultadoPrincipal}>
          <div className={styles.resultadoCirculo}>
            <span className={styles.resultadoPct}>{pct(pctPension, 1)}</span>
            <span className={styles.resultadoLabel}>de tu base reguladora</span>
          </div>
          <div className={styles.resultadoInfo}>
            {!tieneDerechoPension && (
              <p className={styles.resultadoAlerta}>
                Con {anosCotizados} años cotizados <strong>no tendrías derecho a pensión contributiva</strong>. Necesitas al menos {ANIOS_ACCESO} años.
              </p>
            )}
            {tieneDerechoPension && !tieneCompleto && (
              <p className={styles.resultadoTexto}>
                Con {anosCotizados} años, recibirías el <strong>{pct(pctPension, 2)}</strong> de tu base reguladora. Te faltan <strong>{aniosYMeses(mesesQueFaltan)}</strong> más para el {pct(100, 0)}.
              </p>
            )}
            {tieneCompleto && (
              <p className={styles.resultadoTexto}>
                Con {anosCotizados} años, alcanzas el <strong>{pct(100, 0)}</strong> de tu base reguladora. Empezar pronto te ha dado margen.
              </p>
            )}
          </div>
        </div>

        {/* Hitos de la vida laboral */}
        <div className={styles.hitosGrid}>
          {hitos.map((h, i) => (
            <div key={i} className={styles.hitoCard}>
              <span className={styles.hitoIcono} aria-hidden="true">{h.icono}</span>
              <span className={styles.hitoEdad}>{aniosYMeses(h.edadMeses)}</span>
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
          <p className={styles.chartNota}>
            El salto de {pct(0, 0)} a {pct(PCT_ACCESO, 0)} ocurre al cumplir {ANIOS_ACCESO} años. Después sube
            gradualmente hasta el {pct(100, 0)} a los {aniosYMeses(MESES_PARA_CIEN)}.
          </p>
        </div>

        <div className={styles.insight}>
          <p>
            El sistema de pensiones español tiene un diseño claro: <strong>los primeros {ANIOS_ACCESO} años te dan acceso</strong> ({pct(PCT_ACCESO, 0)}),
            y los siguientes {aniosYMeses(MESES_PARA_CIEN - MESES_ACCESO)} te llevan del {pct(PCT_ACCESO, 0)} al {pct(100, 0)}. Cada mes extra después de los {ANIOS_ACCESO} años
            cuenta — pero los primeros {ANIOS_ACCESO} son todo o nada.
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

          <h3>El truco de los {ANIOS_ACCESO} años mínimos</h3>
          <p>
            Con menos de {ANIOS_ACCESO} años cotizados no tienes pensión contributiva (aunque sí podrías optar a
            la no contributiva, mucho más baja). Al cumplir {ANIOS_ACCESO} años, saltas directamente al {pct(PCT_ACCESO, 0)}.
            Esto significa que <strong>cada mes cuenta si estás cerca de los {ANIOS_ACCESO} años</strong>.
          </p>

          <h3>Jubilación anticipada: puedes, pero con penalización</h3>
          <p>
            Puedes jubilarte hasta {ANIOS_ANTICIPO_VOLUNTARIA} años antes de la edad ordinaria por voluntad propia, o
            hasta {ANIOS_ANTICIPO_INVOLUNTARIA} años antes si la jubilación es involuntaria (por ejemplo, tras un despido
            colectivo o un cierre de empresa). Cada trimestre de anticipación reduce la pensión entre
            un {pctCompacto(COEF_TRIMESTRE_MIN)} y un {pctCompacto(COEF_TRIMESTRE_MAX)}, según los años cotizados y el tipo de jubilación.
            A los {EJEMPLO_ANTICIPADA.edad} años con {EJEMPLO_ANTICIPADA.aniosCotizados} años cotizados la edad ordinaria
            es {EJEMPLO_ANTICIPADA.edadOrdinaria}: son {EJEMPLO_ANTICIPADA.mesesAnticipo} meses de anticipo, más de los que
            admite la voluntaria, así que solo cabe la involuntaria, con una reducción
            de {EJEMPLO_ANTICIPADA.trimestres} trimestres × {pctCompacto(EJEMPLO_ANTICIPADA.coeficiente)} = {pctCompacto(EJEMPLO_ANTICIPADA.reduccion)}.
          </p>

          <h3>¿Y si empiezo tarde?</h3>
          <p>
            Si empiezas a cotizar a los 30, llegarás a los {EDAD_ORDINARIA} con {EJEMPLO_30.anios} años,{' '}
            {frenteAlCien(EJEMPLO_30.meses)} {aniosYMeses(MESES_PARA_CIEN)} que dan el {pct(100, 0)}.
            Si empiezas a los 35, llegarás con {EJEMPLO_35.anios} años cotizados, que dan el {pct(EJEMPLO_35.porcentaje, 2)}.
            Cada año que retrasas el inicio se nota en la pensión final.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este visualizador usa la edad de jubilación y la escala del porcentaje
            definitivas, las que rigen para quien se jubile desde 2027, y asume cotización
            continua sin lagunas. La realidad incluye periodos de desempleo, cambios de base, y posibles
            reformas futuras. Para un cálculo real, consulta tu vida laboral en la Seguridad Social.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-jubilacion-perspectiva')} />
        <ShareCard appName="visualizador-jubilacion-perspectiva" />
        <Footer appName="visualizador-jubilacion-perspectiva" />
    </div>
  );
}
