'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorViajeImpuestos.module.css';
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
import { jsonLd } from './metadata';
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Datos de los PGE 2025 (consolidados, millones €)
// Fuente: Ministerio de Hacienda — Presupuestos Generales del Estado 2025
// ─────────────────────────────────────────────

interface PartidaPGE {
  id: string;
  nombre: string;
  millones: number;
  icono: string;
  color: string;
  explicacion: string;
  detalle: string;
}

const TOTAL_PGE = 491420; // millones €

const PARTIDAS: PartidaPGE[] = [
  {
    id: 'pensiones',
    nombre: 'Pensiones',
    millones: 190687,
    icono: '👴',
    color: '#2E86AB',
    explicacion: 'La mayor partida del presupuesto. Cubre pensiones contributivas (jubilación, viudedad, incapacidad) y no contributivas.',
    detalle: 'Incluye pensiones de la Seguridad Social, clases pasivas del Estado y complementos a mínimos. La partida crece cada año por el envejecimiento de la población y la revalorización según IPC.',
  },
  {
    id: 'deuda',
    nombre: 'Deuda pública',
    millones: 37799,
    icono: '💳',
    color: '#e74c3c',
    explicacion: 'Pago de intereses de los bonos del Estado en circulación. El principal se refinancia continuamente emitiendo nuevos bonos cuando los antiguos vencen — práctica estándar de todos los Estados solventes. Esta partida sube cuando suben los tipos de interés (BCE) o cuando la prima de riesgo aumenta.',
    detalle: 'España debe más de 1,6 billones de euros. Esta partida solo cubre los intereses, no el capital. Cuando suben los tipos de interés (como en 2023-2024), esta partida crece automáticamente.',
  },
  {
    id: 'desempleo',
    nombre: 'Prestaciones por desempleo',
    millones: 26780,
    icono: '📋',
    color: '#e67e22',
    explicacion: 'Prestaciones contributivas (paro) y subsidios por desempleo, además de políticas activas de empleo.',
    detalle: 'Incluye el paro contributivo (máx. 24 meses), el subsidio de desempleo, la renta activa de inserción (RAI) y bonificaciones a la contratación.',
  },
  {
    id: 'sanidad',
    nombre: 'Sanidad',
    millones: 10380,
    icono: '🏥',
    color: '#27ae60',
    explicacion: 'Gasto del Estado central en sanidad. La mayor parte del gasto sanitario lo ejecutan las Comunidades Autónomas con sus propios presupuestos.',
    detalle: 'Los PGE solo reflejan la parte estatal: INGESA (Ceuta, Melilla), investigación sanitaria, y transferencias a las CCAA. El gasto sanitario real total de España supera los 90.000 millones contando todos los presupuestos autonómicos.',
  },
  {
    id: 'educacion',
    nombre: 'Educación',
    millones: 6216,
    icono: '🎓',
    color: '#48A9A6',
    explicacion: 'Gasto estatal en educación. Como en sanidad, la mayor parte del gasto educativo lo ejecutan las CCAA.',
    detalle: 'Incluye becas y ayudas al estudio (MEC), universidades públicas estatales, UNED, y programas educativos. El gasto educativo real total de España supera los 60.000 millones sumando CCAA.',
  },
  {
    id: 'infraestructuras',
    nombre: 'Infraestructuras y transporte',
    millones: 15420,
    icono: '🚄',
    color: '#9b59b6',
    explicacion: 'Inversión en carreteras, ferrocarril (AVE, Renfe), puertos, aeropuertos y transporte público.',
    detalle: 'Gran parte va a ADIF (gestión ferroviaria) y al Ministerio de Transportes. Incluye mantenimiento de la red viaria del Estado y nuevas infraestructuras.',
  },
  {
    id: 'defensa',
    nombre: 'Defensa',
    millones: 12839,
    icono: '🛡️',
    color: '#34495e',
    explicacion: 'Fuerzas Armadas, material militar, operaciones internacionales y contribución a la OTAN.',
    detalle: 'Incluye personal militar, adquisición de material (fragatas, aviones, vehículos), operaciones en el exterior y la contribución española a misiones de la OTAN y la UE.',
  },
  {
    id: 'seguridad',
    nombre: 'Seguridad ciudadana',
    millones: 11236,
    icono: '👮',
    color: '#1abc9c',
    explicacion: 'Policía Nacional, Guardia Civil, instituciones penitenciarias y emergencias (UME, protección civil).',
    detalle: 'Cubre los sueldos y medios de Policía y Guardia Civil, prisiones, y la gestión de emergencias. No incluye policías autonómicas (Mossos, Ertzaintza) que se financian con presupuestos propios.',
  },
  {
    id: 'industria',
    nombre: 'Industria, energía y turismo',
    millones: 18940,
    icono: '🏭',
    color: '#f39c12',
    explicacion: 'Política industrial, transición energética, subvenciones a renovables y promoción turística.',
    detalle: 'Incluye los fondos Next Generation EU destinados a la transición digital y ecológica, el IDAE, subvenciones a la rehabilitación energética de edificios y el ICEX.',
  },
  {
    id: 'otros',
    nombre: 'Otros gastos',
    millones: TOTAL_PGE - 190687 - 37799 - 26780 - 10380 - 6216 - 15420 - 12839 - 11236 - 18940,
    icono: '📦',
    color: '#95a5a6',
    explicacion: 'Resto de partidas: justicia, asuntos exteriores, agricultura, ciencia, cultura, vivienda, cooperación internacional, órganos constitucionales y otras.',
    detalle: 'Incluye decenas de partidas menores: I+D+i, PAC (política agraria), cooperación al desarrollo, Casa Real, Congreso, Senado, Tribunal Constitucional, Tribunal de Cuentas, etc.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorViajeImpuestosPage() {
  const [partidaActiva, setPartidaActiva] = useState<string | null>(null);
  const [irpfAnual, setIrpfAnual] = useState(5000);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const partidaSeleccionada = PARTIDAS.find(p => p.id === partidaActiva);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: PARTIDAS.map(p => p.nombre),
        datasets: [{
          data: PARTIDAS.map(p => p.millones),
          backgroundColor: PARTIDAS.map(p => p.color),
          borderWidth: 2,
          borderColor: 'white',
          hoverOffset: 12,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: { label?: string; parsed: number }) => {
                const pct = ((ctx.parsed / TOTAL_PGE) * 100).toFixed(1);
                return `${ctx.label}: ${formatNumber(ctx.parsed, 0)} M€ (${pct}%)`;
              },
            },
          },
        },
        onClick: (_event: unknown, elements: Array<{ index: number }>) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            setPartidaActiva(prev => prev === PARTIDAS[idx].id ? null : PARTIDAS[idx].id);
          }
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Viaje de tus Impuestos</h1>
          <p className={styles.subtitle}>¿A dónde va tu dinero? Visualiza el gasto público español partida a partida</p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <p className={styles.instruccion}>
          <span aria-hidden="true">👆</span> Haz clic en el gráfico o en las partidas para ver el desglose de cada una.
        </p>

        {/* Gráfico doughnut */}
        <div className={styles.chartContainer}>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label="Gráfico circular del reparto de los Presupuestos Generales del Estado 2025" />
          </div>
          <div className={styles.chartCentro}>
            <span className={styles.chartTotal}>{formatNumber(TOTAL_PGE, 0)} M€</span>
            <span className={styles.chartLabel}>PGE 2025</span>
          </div>
        </div>

        {/* Lista de partidas */}
        <div className={styles.partidasGrid}>
          {PARTIDAS.map(p => {
            const pct = (p.millones / TOTAL_PGE) * 100;
            const tuAportacion = irpfAnual * (p.millones / TOTAL_PGE);
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.partidaCard} ${partidaActiva === p.id ? styles.partidaActiva : ''}`}
                onClick={() => setPartidaActiva(prev => prev === p.id ? null : p.id)}
                aria-pressed={partidaActiva === p.id}
                style={{ borderLeftColor: p.color }}
              >
                <div className={styles.partidaTop}>
                  <span className={styles.partidaIcono} aria-hidden="true">{p.icono}</span>
                  <span className={styles.partidaNombre}>{p.nombre}</span>
                  <span className={styles.partidaPct}>{formatNumber(pct, 1)}%</span>
                </div>
                <div className={styles.partidaBottom}>
                  <span className={styles.partidaMillones}>{formatNumber(p.millones, 0)} M€</span>
                  <span className={styles.partidaTu}>Tu parte: {formatCurrency(tuAportacion)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle de partida seleccionada */}
        {partidaSeleccionada && (
          <div className={styles.detalle} role="region" aria-label={`Detalle de ${partidaSeleccionada.nombre}`}>
            <div className={styles.detalleHeader}>
              <span className={styles.detalleIcono} aria-hidden="true">{partidaSeleccionada.icono}</span>
              <h3 className={styles.detalleTitulo}>{partidaSeleccionada.nombre}</h3>
            </div>
            <p className={styles.detalleExplicacion}>{partidaSeleccionada.explicacion}</p>
            <p className={styles.detalleDetalle}>{partidaSeleccionada.detalle}</p>
          </div>
        )}

        {/* Calculadora personal */}
        <div className={styles.calculadora}>
          <h3 className={styles.calculadoraTitulo}>¿Cuánto aportas tú a cada partida?</h3>
          <p className={styles.calculadoraDesc}>Indica cuánto pagas de IRPF al año y te mostramos cómo se reparte tu aportación</p>
          <div className={styles.sliderZona}>
            <div className={styles.sliderHeader}>
              <label className={styles.sliderLabel}>Tu IRPF anual</label>
              <span className={styles.sliderValor}>{formatCurrency(irpfAnual)}</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min={500}
              max={50000}
              step={500}
              value={irpfAnual}
              onChange={(e) => setIrpfAnual(parseInt(e.target.value))}
              aria-label={`IRPF anual: ${formatCurrency(irpfAnual)}`}
            />
            <div className={styles.sliderExtremos}>
              <span>500 €</span>
              <span>50.000 €</span>
            </div>
          </div>

          <div className={styles.tuReparto}>
            {PARTIDAS.slice(0, 6).map(p => {
              const tuParte = irpfAnual * (p.millones / TOTAL_PGE);
              return (
                <div key={p.id} className={styles.tuRepartoItem}>
                  <span className={styles.tuRepartoIcono} aria-hidden="true">{p.icono}</span>
                  <span className={styles.tuRepartoNombre}>{p.nombre}</span>
                  <span className={styles.tuRepartoValor} style={{ color: p.color }}>{formatCurrency(tuParte)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            De cada <strong>100 € que recauda el Estado</strong>, aproximadamente {formatNumber((PARTIDAS[0].millones / TOTAL_PGE) * 100, 0)} € van a pensiones,
            {' '}{formatNumber((PARTIDAS[1].millones / TOTAL_PGE) * 100, 0)} € a pagar intereses de deuda
            y {formatNumber((PARTIDAS[2].millones / TOTAL_PGE) * 100, 0)} € a desempleo, y aproximadamente
            {' '}{formatNumber(((PARTIDAS[3].millones + PARTIDAS[4].millones) / TOTAL_PGE) * 100, 0)} € a sanidad y educación a nivel estatal — la mayor parte de estas dos partidas la ejecutan las CCAA con sus propios presupuestos (~90.000 M€ en sanidad y ~60.000 M€ en educación a nivel nacional consolidado).
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Calcula tus impuestos → <a href="/estimador-irpf/">Estimador IRPF</a> · <a href="/visualizador-sueldo-neto/">Tu Sueldo al Desnudo</a>
        </div>

        <EducationalSection
          title="Lo que los presupuestos revelan (y lo que esconden)"
          subtitle="Claves para entender el gasto público español"
          defaultOpen={false}
        >
          <h3>¿Por qué pensiones es tan grande?</h3>
          <p>
            España tiene 9 millones de pensionistas y una población envejecida. La pensión media ronda
            los 1.400 €/mes. Multiplica 9 millones × 14 pagas × 1.400 € y entenderás por qué es la
            partida dominante. Además, se revaloriza cada año según el IPC.
          </p>

          <h3>Sanidad y educación parecen pequeñas — ¿por qué?</h3>
          <p>
            Porque están transferidas a las Comunidades Autónomas. Los PGE solo reflejan el gasto
            del Estado central. El gasto sanitario real total de España supera los <strong>90.000 millones</strong>
            {' '}y el educativo los <strong>60.000 millones</strong> contando todos los presupuestos autonómicos.
          </p>

          <h3>La deuda y sus intereses</h3>
          <p>
            España paga ~38.000 millones al año en intereses de su deuda pública. La cifra crece cuando
            los tipos del BCE suben (como en 2023-2024) y se reduce cuando bajan. El principal no se
            amortiza neto: se refinancia con nuevas emisiones, igual que hacen Alemania, Francia, EE.UU.
            o Japón.
          </p>

          <h3>¿De dónde sale el dinero?</h3>
          <p>
            Los ingresos del Estado provienen de: IRPF (~43%), IVA (~33%), Impuesto de Sociedades (~12%),
            impuestos especiales (tabaco, alcohol, hidrocarburos ~7%) y otros (~5%). El IRPF es con
            diferencia la mayor fuente de ingresos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos son aproximados y se basan en los PGE 2025 consolidados.
            El gasto real ejecutado puede diferir del presupuestado. Las cifras de sanidad y educación
            solo reflejan la parte estatal, no la autonómica. Fuente: Ministerio de Hacienda.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-viaje-impuestos')} />
        <ShareCard appName="visualizador-viaje-impuestos" />
        <Footer appName="visualizador-viaje-impuestos" />
      </div>
    </>
  );
}
