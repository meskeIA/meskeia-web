'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './VisualizadorMapaDineroMensual.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Categorías de gasto (% medio España, INE EPF 2023)
// ─────────────────────────────────────────────

interface CategoriaGasto {
  id: string;
  nombre: string;
  icono: string;
  pct: number;
  color: string;
  explicacion: string;
  consejo: string;
}

const GASTOS: CategoriaGasto[] = [
  { id: 'vivienda', nombre: 'Vivienda', icono: '🏠', pct: 32, color: '#2E86AB', explicacion: 'Alquiler o hipoteca + comunidad + IBI + seguro hogar. Es el gasto más grande para la mayoría de hogares. En Madrid y Barcelona puede superar el 40%.', consejo: 'La regla de oro: que la vivienda no supere el 35% de tus ingresos netos. Si lo supera, tu margen financiero se reduce peligrosamente.' },
  { id: 'alimentacion', nombre: 'Alimentación', icono: '🛒', pct: 16, color: '#27ae60', explicacion: 'Supermercado + productos frescos. No incluye restaurantes (eso es ocio). La inflación alimentaria ha encarecido esta partida un ~20% desde 2021.', consejo: 'Planificar menús semanales y hacer lista de compra reduce el gasto un 15-20%. Las marcas blancas ahorran ~30% sin perder calidad en la mayoría de productos.' },
  { id: 'transporte', nombre: 'Transporte', icono: '🚗', pct: 12, color: '#e67e22', explicacion: 'Coche (cuotas, seguro, combustible, mantenimiento, ITV, aparcamiento) o transporte público. El coche medio cuesta ~4.000-6.000 €/año en total.', consejo: 'El coste real de un coche incluye depreciación (~1.500 €/año), seguro, combustible, mantenimiento e impuestos. Muchos propietarios subestiman el coste real en un 40%.' },
  { id: 'suministros', nombre: 'Suministros', icono: '💡', pct: 7, color: '#f39c12', explicacion: 'Luz, gas, agua, internet, móvil. Los suministros básicos son costes semi-fijos que varían poco con el sueldo pero sí con la época del año.', consejo: 'Revisar contratos de luz y gas una vez al año puede ahorrar 200-400 €. Muchas familias pagan de más por inercia (sesgo del status quo).' },
  { id: 'ocio', nombre: 'Ocio y restaurantes', icono: '🎭', pct: 10, color: '#9b59b6', explicacion: 'Restaurantes, bares, cine, streaming, viajes, suscripciones, cultura. En España la vida social gira mucho en torno a comer y beber fuera.', consejo: 'No se trata de eliminar el ocio — se trata de que sea consciente. Un café diario a 1,80 € son 650 €/año. ¿Merece la pena? Solo tú puedes decidirlo.' },
  { id: 'ropa', nombre: 'Ropa y calzado', icono: '👕', pct: 5, color: '#1abc9c', explicacion: 'Ropa, calzado y complementos para toda la familia. La moda rápida ha reducido los precios pero aumentado la cantidad comprada.', consejo: 'El coste por uso es más revelador que el precio: una prenda de 80 € que usas 100 veces cuesta 0,80 €/uso. Una de 15 € que usas 3 veces cuesta 5 €/uso.' },
  { id: 'salud', nombre: 'Salud', icono: '🏥', pct: 4, color: '#e74c3c', explicacion: 'Medicamentos, dentista, óptica, copagos, seguro médico privado (si aplica). España tiene sanidad pública pero dentista y óptica no están cubiertos.', consejo: 'Un seguro dental puede merecer la pena si necesitas tratamientos (empastes, limpiezas). El coste medio es ~15-30 €/mes vs 300-1.000 € por tratamiento.' },
  { id: 'educacion', nombre: 'Educación y formación', icono: '📚', pct: 3, color: '#34495e', explicacion: 'Colegios, libros, cursos, extraescolares, material. Variable: 0 € en pública sin extras a 500-800 €/mes por hijo en privada.', consejo: 'La formación continua es la mejor inversión a largo plazo. Un curso de 200 € que te sube el sueldo 100 €/mes se amortiza en 2 meses.' },
  { id: 'seguros', nombre: 'Seguros y banca', icono: '🛡️', pct: 4, color: '#7f8c8d', explicacion: 'Seguros (vida, hogar, coche ya incluido en transporte), comisiones bancarias, productos financieros. Muchos hogares pagan comisiones innecesarias.', consejo: 'Revisa las comisiones de tu cuenta bancaria. Muchos bancos online ofrecen cuentas sin comisiones. La diferencia puede ser 100-200 €/año.' },
  { id: 'ahorro', nombre: 'Ahorro / resto', icono: '🐷', pct: 7, color: '#48A9A6', explicacion: 'Lo que sobra después de todos los gastos. La tasa de ahorro media en España ronda el 7% — significativamente por debajo de la media europea (~13%).', consejo: 'Págate primero: aparta el ahorro al principio del mes, no al final. Automatizar una transferencia el día 1 es la técnica más efectiva.' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMapaDineroMensualPage() {
  const [sueldoNeto, setSueldoNeto] = useState(1800);
  const [gastoActivo, setGastoActivo] = useState<string | null>(null);

  const gastosCalculados = useMemo(() => {
    return GASTOS.map(g => ({
      ...g,
      importe: sueldoNeto * (g.pct / 100),
    }));
  }, [sueldoNeto]);

  const gastoSeleccionado = gastosCalculados.find(g => g.id === gastoActivo);

  // Gráfico doughnut
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: gastosCalculados.map(g => g.nombre),
        datasets: [{
          data: gastosCalculados.map(g => g.importe),
          backgroundColor: gastosCalculados.map(g => g.color),
          borderWidth: 2,
          borderColor: 'white',
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: { label?: string; parsed: number }) => {
                const pct = ((ctx.parsed / sueldoNeto) * 100).toFixed(0);
                return `${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
              },
            },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [gastosCalculados, sueldoNeto]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Mapa de tu Dinero Mensual</h1>
          <p className={styles.subtitle}>¿Adónde va tu sueldo cada mes? Visualiza el reparto real del dinero en España</p>
        </header>

        <LegalNotice />

        {/* Slider sueldo */}
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>Tu sueldo neto mensual</label>
            <span className={styles.sliderValor}>{formatCurrency(sueldoNeto)}</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={1000}
            max={5000}
            step={50}
            value={sueldoNeto}
            onChange={(e) => setSueldoNeto(parseInt(e.target.value))}
            aria-label={`Sueldo neto: ${formatCurrency(sueldoNeto)}`}
          />
          <div className={styles.sliderExtremos}>
            <span>1.000 €</span>
            <span>5.000 €</span>
          </div>
        </div>

        {/* Gráfico + barra */}
        <div className={styles.chartContainer}>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label="Gráfico circular del reparto mensual del sueldo" />
          </div>
          <div className={styles.chartCentro}>
            <span className={styles.chartTotal}>{formatCurrency(sueldoNeto)}</span>
            <span className={styles.chartLabel}>neto/mes</span>
          </div>
        </div>

        {/* Barra de reparto */}
        <div className={styles.barraReparto}>
          {gastosCalculados.map(g => (
            <div
              key={g.id}
              className={styles.barraSegmento}
              style={{ width: `${g.pct}%`, backgroundColor: g.color }}
              title={`${g.nombre}: ${g.pct}%`}
            />
          ))}
        </div>

        {/* Bloques de gastos */}
        <div className={styles.gastosGrid}>
          {gastosCalculados.map(g => (
            <button
              key={g.id}
              type="button"
              className={`${styles.gastoCard} ${gastoActivo === g.id ? styles.gastoActivo : ''}`}
              onClick={() => setGastoActivo(prev => prev === g.id ? null : g.id)}
              style={{ borderTopColor: g.color }}
              aria-pressed={gastoActivo === g.id}
            >
              <span className={styles.gastoIcono} aria-hidden="true">{g.icono}</span>
              <span className={styles.gastoNombre}>{g.nombre}</span>
              <span className={styles.gastoImporte} style={{ color: g.color }}>{formatCurrency(g.importe)}</span>
              <span className={styles.gastoPct}>{g.pct}%</span>
            </button>
          ))}
        </div>

        {/* Detalle del gasto seleccionado */}
        {gastoSeleccionado && (
          <div className={styles.detalle} style={{ borderLeftColor: gastoSeleccionado.color }}>
            <p className={styles.detalleExplicacion}>{gastoSeleccionado.explicacion}</p>
            <p className={styles.detalleConsejo}><strong>Consejo:</strong> {gastoSeleccionado.consejo}</p>
          </div>
        )}

        <div className={styles.insight}>
          <p>
            <strong>Solo el {GASTOS.find(g => g.id === 'ocio')!.pct + GASTOS.find(g => g.id === 'ropa')!.pct}% de tu sueldo
            va a gastos realmente discrecionales</strong> (ocio + ropa). El resto son necesidades o semi-obligaciones.
            Por eso la sensación de &quot;no llego a fin de mes&quot; es tan común — el margen real de maniobra es mucho
            menor de lo que parece.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Gestiona tu dinero → <a href="/control-gastos/">Control de Gastos</a> · <a href="/visualizador-precio-real-cosas/">El Precio Real de las Cosas</a> · <a href="/visualizador-sueldo-neto/">Tu Sueldo al Desnudo</a>
        </div>

        <EducationalSection
          title="Lo que los datos del INE revelan"
          subtitle="Cómo gastan los hogares españoles"
          defaultOpen={false}
        >
          <h3>La vivienda se come el sueldo</h3>
          <p>
            El gasto medio en vivienda ha crecido del 25% al 32% en la última década. En grandes
            ciudades supera el 40%. Esto comprime todas las demás partidas y explica por qué
            la tasa de ahorro española es de las más bajas de Europa.
          </p>

          <h3>El efecto &quot;lifestyle inflation&quot;</h3>
          <p>
            Cuando sube el sueldo, tienden a subir los gastos proporcionalmente: mejor coche,
            más restaurantes, ropa más cara. El resultado es que el porcentaje de ahorro no mejora.
            Los hogares que más ahorran no son los que más ganan — son los que mantienen gastos
            estables cuando suben ingresos.
          </p>

          <h3>Los gastos invisibles</h3>
          <p>
            Suscripciones olvidadas, comisiones bancarias, seguros que no se revisan, la cuota
            del gimnasio que no usas. Sumados, estos &quot;gastos fantasma&quot; pueden suponer
            100-300 €/mes. Una revisión anual de todos los cargos recurrentes es el ejercicio
            financiero más rentable que existe.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los porcentajes son medias orientativas basadas en la Encuesta
            de Presupuestos Familiares del INE (2023). El reparto real varía enormemente según
            ingresos, ciudad, composición familiar y estilo de vida.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-mapa-dinero-mensual')} />
        <ShareCard appName="visualizador-mapa-dinero-mensual" />
        <Footer appName="visualizador-mapa-dinero-mensual" />
      </div>
    </>
  );
}
