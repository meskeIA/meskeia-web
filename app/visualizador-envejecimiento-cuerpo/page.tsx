'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorEnvejecimientoCuerpo.module.css';
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
// Datos por década
// ─────────────────────────────────────────────

interface Indicador {
  nombre: string;
  icono: string;
  color: string;
  unidad: string;
}

const INDICADORES: Indicador[] = [
  { nombre: 'Metabolismo basal', icono: '🔥', color: '#e74c3c', unidad: '%' },
  { nombre: 'Masa muscular', icono: '💪', color: '#2E86AB', unidad: '%' },
  { nombre: 'Densidad ósea', icono: '🦴', color: '#f39c12', unidad: '%' },
  { nombre: 'Capacidad cardíaca', icono: '❤️', color: '#e74c3c', unidad: '%' },
  { nombre: 'Capacidad pulmonar', icono: '🫁', color: '#48A9A6', unidad: '%' },
  { nombre: 'Agudeza visual', icono: '👁️', color: '#9b59b6', unidad: '%' },
  { nombre: 'Velocidad de recuperación', icono: '🩹', color: '#27ae60', unidad: '%' },
];

// Valores relativos al pico (100% = máximo en la vida, generalmente 25-30 años)
interface DatosDecada {
  rango: string;
  etiqueta: string;
  valores: number[]; // Un valor por indicador
  resumen: string;
  consejo: string;
}

const DECADAS: DatosDecada[] = [
  {
    rango: '20s',
    etiqueta: '20-29 años',
    valores: [100, 100, 100, 100, 100, 100, 100],
    resumen: 'Tu cuerpo está en su pico fisiológico. Máxima masa muscular, metabolismo activo, huesos densos y recuperación rápida.',
    consejo: 'Es el mejor momento para construir hábitos: ejercicio regular y buena alimentación ahora pagan dividendos para toda la vida.',
  },
  {
    rango: '30s',
    etiqueta: '30-39 años',
    valores: [95, 95, 97, 97, 96, 98, 90],
    resumen: 'Los cambios son sutiles pero reales. El metabolismo empieza a ralentizarse (~3-5%) y la recuperación tras esfuerzos es un poco más lenta.',
    consejo: 'Mantener ejercicio de fuerza es clave. La sarcopenia (pérdida muscular) empieza silenciosamente si no se entrena.',
  },
  {
    rango: '40s',
    etiqueta: '40-49 años',
    valores: [88, 85, 90, 92, 88, 85, 78],
    resumen: 'Los cambios se hacen más notorios. Pérdida de masa muscular acelerada (~1%/año), presbicia frecuente, y el metabolismo cae de forma más visible.',
    consejo: 'Revisiones médicas periódicas, ejercicio de fuerza 2-3 veces/semana, y empezar a cuidar la salud ósea con calcio y vitamina D.',
  },
  {
    rango: '50s',
    etiqueta: '50-59 años',
    valores: [80, 75, 80, 85, 78, 72, 65],
    resumen: 'La menopausia (mujeres) acelera la pérdida ósea. La capacidad cardiovascular desciende si no se entrena. La vista y el oído necesitan más atención.',
    consejo: 'El ejercicio aeróbico protege el corazón. Las densitometrías óseas son importantes. La dieta rica en proteínas ayuda a preservar músculo.',
  },
  {
    rango: '60s',
    etiqueta: '60-69 años',
    valores: [72, 65, 70, 75, 68, 60, 55],
    resumen: 'La pérdida de equilibrio y fuerza aumenta el riesgo de caídas. La recuperación es significativamente más lenta. La sarcopenia es visible.',
    consejo: 'Ejercicios de equilibrio y fuerza son críticos para prevenir caídas. Mantener vida social activa protege la salud cognitiva.',
  },
  {
    rango: '70+',
    etiqueta: '70+ años',
    valores: [62, 55, 58, 65, 58, 50, 42],
    resumen: 'Todos los indicadores descienden de forma notable. Pero hay una enorme variabilidad: personas activas de 75 pueden superar a sedentarias de 55.',
    consejo: 'El ejercicio sigue siendo beneficioso a cualquier edad. Caminar, ejercicios suaves de fuerza y estiramientos mantienen la independencia funcional.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEnvejecimientoCuerpoPage() {
  const [decadaIdx, setDecadaIdx] = useState(0);
  const decada = DECADAS[decadaIdx];

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Gráfico de líneas: evolución de cada indicador
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = DECADAS.map(d => d.rango);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: INDICADORES.map((ind, i) => ({
          label: ind.nombre,
          data: DECADAS.map(d => d.valores[i]),
          borderColor: ind.color,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, padding: 10, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
                `${ctx.dataset.label}: ${ctx.parsed.y}%`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Década de vida' } },
          y: { min: 30, max: 105, ticks: { callback: (v: string | number) => `${v}%` } },
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
          <h1 className={styles.title}>Cómo Envejece tu Cuerpo</h1>
          <p className={styles.subtitle}>Visualiza qué cambia en tu cuerpo década a década — y qué puedes hacer al respecto</p>
        </header>

        <LegalNotice />

        <div
          role="note"
          style={{
            background: 'var(--bg-card)',
            border: '2px solid #f39c12',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            margin: '1rem 0',
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
          }}
        >
          <strong>⚠️ Aviso:</strong> Las cifras son aproximaciones ilustrativas para visualizar tendencias generales. Los valores reales varían enormemente entre individuos y no proceden de un estudio único.
        </div>

        {/* Selector de década */}
        <div className={styles.decadaNav}>
          {DECADAS.map((d, i) => (
            <button
              key={d.rango}
              type="button"
              className={`${styles.decadaBtn} ${decadaIdx === i ? styles.decadaActiva : ''}`}
              onClick={() => setDecadaIdx(i)}
              aria-pressed={decadaIdx === i}
            >
              {d.rango}
            </button>
          ))}
        </div>

        <h2 className={styles.decadaTitulo}>{decada.etiqueta}</h2>

        {/* Barras de indicadores */}
        <div className={styles.indicadoresGrid}>
          {INDICADORES.map((ind, i) => (
            <div key={ind.nombre} className={styles.indicadorItem}>
              <div className={styles.indicadorHeader}>
                <span className={styles.indicadorIcono} aria-hidden="true">{ind.icono}</span>
                <span className={styles.indicadorNombre}>{ind.nombre}</span>
                <span className={styles.indicadorValor} style={{ color: ind.color }}>
                  {decada.valores[i]}%
                </span>
              </div>
              <div className={styles.indicadorBarraFondo}>
                <div
                  className={styles.indicadorBarra}
                  style={{
                    width: `${decada.valores[i]}%`,
                    backgroundColor: ind.color,
                  }}
                  role="progressbar"
                  aria-valuenow={decada.valores[i]}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${ind.nombre}: ${decada.valores[i]}%`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Resumen y consejo */}
        <div className={styles.resumenCard}>
          <p className={styles.resumenTexto}>{decada.resumen}</p>
        </div>

        <div className={styles.consejoCard}>
          <span className={styles.consejoIcono} aria-hidden="true">💡</span>
          <p className={styles.consejoTexto}>{decada.consejo}</p>
        </div>

        {/* Gráfico de evolución */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitulo}>Evolución de capacidades a lo largo de la vida</h3>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label="Gráfico de líneas: evolución de 7 indicadores fisiológicos por década" />
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            El mensaje más importante: <strong>la variabilidad individual es enorme</strong>. Una persona
            activa de 65 puede tener mejores indicadores que una sedentaria de 40. El ejercicio regular,
            una buena alimentación y el descanso adecuado ralentizan el descenso en todas las curvas.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Evalúa tu estado → <a href="/orientador-imc/">Calculadora IMC</a> · <a href="/test-fragilidad/">Test de Fragilidad</a> · <a href="/calculadora-macros/">Calculadora de Macros</a>
        </div>

        <EducationalSection
          title="La ciencia del envejecimiento"
          subtitle="Lo que la investigación nos dice sobre cómo envejecemos"
          defaultOpen={false}
        >
          <h3>Sarcopenia: el enemigo silencioso</h3>
          <p>
            A partir de los 30, perdemos entre un 3% y un 8% de masa muscular por década si no
            entrenamos fuerza. A los 50, la pérdida se acelera. La sarcopenia es la principal
            causa de fragilidad en personas mayores y está directamente ligada a caídas y pérdida
            de independencia. <strong>El entrenamiento de fuerza es la intervención más efectiva</strong>
            a cualquier edad.
          </p>

          <h3>¿Por qué engordamos con la edad?</h3>
          <p>
            No es inevitable. El metabolismo basal baja porque perdemos músculo (que quema calorías
            en reposo) y porque nos movemos menos. Si mantienes tu masa muscular y tu nivel de
            actividad, el aumento de peso no es una sentencia automática.
          </p>

          <h3>El cerebro también envejece (pero se puede entrenar)</h3>
          <p>
            La velocidad de procesamiento y la memoria de trabajo declinan con la edad, pero el
            vocabulario y el conocimiento general siguen creciendo. El ejercicio aeróbico, el
            aprendizaje continuo y la vida social activa son los tres pilares de la salud cognitiva.
          </p>

          <h3>Huesos: se construyen antes de los 30, se protegen después</h3>
          <p>
            El pico de masa ósea se alcanza alrededor de los 25-30 años. Después, la densidad baja
            gradualmente. En mujeres, la menopausia acelera la pérdida. Calcio, vitamina D,
            ejercicio de impacto (caminar, correr, saltar) y evitar tabaco y alcohol protegen los huesos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los porcentajes son valores medios orientativos basados en literatura
            médica general. La variabilidad individual es muy grande y depende de genética, estilo de vida,
            alimentación y ejercicio. No sustituyen una valoración médica profesional.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-envejecimiento-cuerpo')} />
        <ShareCard appName="visualizador-envejecimiento-cuerpo" />
        <Footer appName="visualizador-envejecimiento-cuerpo" />
      </div>
    </>
  );
}
