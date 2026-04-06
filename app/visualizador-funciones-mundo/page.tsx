'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './VisualizadorFuncionesMundo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Funciones
// ─────────────────────────────────────────────

type FuncionId = 'lineal' | 'exponencial' | 'logaritmica' | 'cuadratica';

interface FuncionInfo {
  id: FuncionId;
  nombre: string;
  icono: string;
  color: string;
  formula: string;
  ejemploReal: string;
  explicacion: string;
  datoSorprendente: string;
}

const FUNCIONES: FuncionInfo[] = [
  {
    id: 'lineal',
    nombre: 'Lineal',
    icono: '📏',
    color: '#2E86AB',
    formula: 'y = mx + b',
    ejemploReal: 'Tu sueldo crece 1.500 €/año → lineal. Si ganas 25.000 € hoy, en 10 años ganarás 40.000 €. Crecimiento constante, predecible.',
    explicacion: 'Crece siempre al mismo ritmo. Cada unidad de x añade la misma cantidad de y. Es la función más intuitiva: "tanto más trabajo, tanto más gano".',
    datoSorprendente: 'El crecimiento lineal es lo que esperamos intuitivamente. Pero en la naturaleza y la economía, los crecimientos realmente importantes son exponenciales — por eso nos pillan desprevenidos.',
  },
  {
    id: 'exponencial',
    nombre: 'Exponencial',
    icono: '🚀',
    color: '#e74c3c',
    formula: 'y = a · bˣ',
    ejemploReal: 'Un virus con R=2: 1 persona infecta a 2, que infectan a 4, que infectan a 8... En 30 ciclos: más de 1.000 millones. Así empezó el COVID.',
    explicacion: 'Crece cada vez más rápido. Al principio parece lento (1, 2, 4, 8) pero de repente explota (512, 1.024, 2.048). El interés compuesto y las pandemias siguen este patrón.',
    datoSorprendente: 'Si doblas un papel 42 veces (imposible físicamente, pero como ejercicio), su grosor llegaría de la Tierra a la Luna. Eso es crecimiento exponencial.',
  },
  {
    id: 'logaritmica',
    nombre: 'Logarítmica',
    icono: '🔊',
    color: '#27ae60',
    formula: 'y = log(x)',
    ejemploReal: 'La escala Richter de terremotos: un sismo de magnitud 6 es 10× más potente que uno de 5, y 100× más que uno de 4. Lo mismo con los decibelios del sonido.',
    explicacion: 'Lo contrario de la exponencial: crece mucho al principio y luego se estanca. Es la función de "rendimientos decrecientes" — cada mejora cuesta más esfuerzo.',
    datoSorprendente: 'Si el oído humano no fuera logarítmico, el sonido de un concierto de rock te parecería solo 2-3 veces más fuerte que una conversación normal, cuando en realidad es un millón de veces más intenso.',
  },
  {
    id: 'cuadratica',
    nombre: 'Cuadrática',
    icono: '🏀',
    color: '#9b59b6',
    formula: 'y = ax² + bx + c',
    ejemploReal: 'La trayectoria de un balón: sube, alcanza el punto máximo y baja. La distancia de frenado de un coche: a doble velocidad, 4 veces más distancia.',
    explicacion: 'Forma de parábola (U o U invertida). Aparece en física (caída libre, trayectorias), en el frenado de vehículos, y en la relación entre esfuerzo y resultado cuando hay un punto óptimo.',
    datoSorprendente: 'A 120 km/h necesitas 4 veces más distancia para frenar que a 60 km/h (no el doble). Por eso los límites de velocidad importan tanto — la relación es cuadrática.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFuncionesMundoPage() {
  const [funcionActiva, setFuncionActiva] = useState<FuncionId>('lineal');
  const [parametro, setParametro] = useState(5);

  const funcion = FUNCIONES.find(f => f.id === funcionActiva)!;

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const datosGrafico = useMemo(() => {
    const xs = Array.from({ length: 51 }, (_, i) => i * 0.4); // 0 a 20
    const calcular = (x: number): number => {
      switch (funcionActiva) {
        case 'lineal': return parametro * x;
        case 'exponencial': return Math.pow(1 + parametro / 10, x);
        case 'logaritmica': return parametro * Math.log(x + 1);
        case 'cuadratica': return parametro * 0.1 * x * x;
      }
    };
    return { xs, ys: xs.map(calcular) };
  }, [funcionActiva, parametro]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datosGrafico.xs.map(x => formatNumber(x, 1)),
        datasets: [{
          label: funcion.nombre,
          data: datosGrafico.ys,
          borderColor: funcion.color,
          backgroundColor: `${funcion.color}15`,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: { parsed: { x: number | null; y: number | null } }) =>
                `x=${formatNumber(ctx.parsed.x ?? 0, 1)} → y=${formatNumber(ctx.parsed.y ?? 0, 1)}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'x' }, ticks: { maxTicksLimit: 10 } },
          y: { title: { display: true, text: 'y' }, beginAtZero: true },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [datosGrafico, funcion]);

  // Parámetro labels según función
  const paramLabel = funcionActiva === 'lineal' ? 'Pendiente (m)' :
    funcionActiva === 'exponencial' ? 'Tasa de crecimiento' :
    funcionActiva === 'logaritmica' ? 'Factor de escala' : 'Coeficiente (a)';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.title}>Funciones que Gobiernan el Mundo</h1>
          <p className={styles.subtitle}>4 funciones matemáticas que explican casi todo lo que te rodea</p>
        </header>
        <LegalNotice />

        {/* Selector de función */}
        <div className={styles.funcionesNav}>
          {FUNCIONES.map(f => (
            <button key={f.id} type="button"
              className={`${styles.funcionBtn} ${funcionActiva === f.id ? styles.funcionActiva : ''}`}
              onClick={() => setFuncionActiva(f.id)}
              style={{ borderColor: funcionActiva === f.id ? f.color : undefined }}
              aria-pressed={funcionActiva === f.id}>
              <span className={styles.funcionIcono} aria-hidden="true">{f.icono}</span>
              <span className={styles.funcionNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>

        {/* Info de la función */}
        <div className={styles.funcionInfo} style={{ borderLeftColor: funcion.color }}>
          <div className={styles.formulaCard}>
            <span className={styles.formulaTexto}>{funcion.formula}</span>
          </div>
          <p className={styles.funcionExplicacion}>{funcion.explicacion}</p>
        </div>

        {/* Slider de parámetro */}
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>{paramLabel}</label>
            <span className={styles.sliderValor}>{parametro}</span>
          </div>
          <input type="range" className={styles.slider}
            min={1} max={10} value={parametro}
            onChange={(e) => setParametro(parseInt(e.target.value))}
            aria-label={`${paramLabel}: ${parametro}`} />
        </div>

        {/* Gráfico */}
        <div className={styles.chartContainer}>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label={`Gráfico de función ${funcion.nombre}`} />
          </div>
        </div>

        {/* Ejemplo real */}
        <div className={styles.ejemploReal}>
          <h3 className={styles.ejemploTitulo}>En el mundo real</h3>
          <p className={styles.ejemploTexto}>{funcion.ejemploReal}</p>
        </div>

        <div className={styles.datoSorprendente}>
          <span className={styles.datoLabel}>Dato sorprendente</span>
          <p>{funcion.datoSorprendente}</p>
        </div>

        {/* Comparativa */}
        <div className={styles.comparativaCard}>
          <h3 className={styles.comparativaTitulo}>¿Cuál crece más rápido?</h3>
          <p className={styles.comparativaTexto}>
            Al principio, lineal y exponencial se parecen. Pero a largo plazo, <strong>la exponencial siempre gana</strong>.
            Si x=10: lineal(10)=50, cuadrática(10)=100, exponencial(10)=~1.594. A x=20 la exponencial vale ~190.000.
            La logarítmica es la más &quot;tranquila&quot;: log(20)≈15.
          </p>
          <div className={styles.comparativaGrid}>
            {FUNCIONES.map(f => (
              <div key={f.id} className={styles.comparativaItem} style={{ borderTopColor: f.color }}>
                <span className={styles.comparativaIcono} aria-hidden="true">{f.icono}</span>
                <span className={styles.comparativaNombre}>{f.nombre}</span>
                <span className={styles.comparativaCrece}>{
                  f.id === 'lineal' ? 'Constante' :
                  f.id === 'exponencial' ? 'Cada vez más rápido' :
                  f.id === 'logaritmica' ? 'Cada vez más lento' :
                  'Acelerado (parábola)'
                }</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más matemáticas → <a href="/visualizador-probabilidad/">Probabilidad</a> · <a href="/visualizador-dinero-y-tiempo/">El Dinero y el Tiempo</a> · <a href="/algebra-ecuaciones/">Álgebra y Ecuaciones</a>
        </div>

        <EducationalSection title="Funciones en tu día a día" subtitle="Dónde aparecen sin que lo sepas" defaultOpen={false}>
          <h3>La exponencial que no vimos: COVID-19</h3>
          <p>En enero de 2020, había 500 casos de COVID en el mundo. En marzo, 500.000. En mayo, 5 millones. El crecimiento exponencial es contraintuitivo: cuando los números son pequeños, parece &quot;controlable&quot;. Cuando se nota, ya es tarde.</p>
          <h3>Rendimientos decrecientes (logarítmica)</h3>
          <p>La primera hora de estudio rinde mucho. La cuarta hora, mucho menos. La octava, casi nada. Esto es una función logarítmica aplicada al aprendizaje. Por eso es mejor estudiar 1h durante 4 días que 4h de golpe.</p>
          <h3>La parábola del precio perfecto</h3>
          <p>Si un producto es demasiado barato, no se vende (la gente desconfía). Si es demasiado caro, tampoco. Hay un precio óptimo que maximiza ingresos — una parábola invertida. Encontrarlo es uno de los grandes retos del marketing.</p>
          <div className={styles.warningBox}><strong>Nota:</strong> las funciones aquí presentadas están simplificadas con fines educativos. En la realidad, los fenómenos suelen seguir combinaciones de funciones o tener condiciones de contorno que modifican su comportamiento.</div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-funciones-mundo')} />
        <ShareCard appName="visualizador-funciones-mundo" />
        <Footer appName="visualizador-funciones-mundo" />
      </div>
    </>
  );
}
