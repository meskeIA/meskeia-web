'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './VisualizadorMapaTiempo.module.css';
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
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Actividades y datos
// ─────────────────────────────────────────────

interface Actividad {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  horasDiarias: number; // media adulto
  explicacion: string;
}

const ACTIVIDADES: Actividad[] = [
  { id: 'dormir', nombre: 'Dormir', icono: '😴', color: '#5B5EA6', horasDiarias: 7.5, explicacion: 'Pasamos un tercio de la vida durmiendo. Con 80 años son ~26 años dormidos. El sueño no es tiempo perdido: consolida memoria, repara tejidos y regula hormonas.' },
  { id: 'trabajar', nombre: 'Trabajar', icono: '💼', color: '#2E86AB', horasDiarias: 4.6, explicacion: 'Incluye empleo, desplazamientos laborales y tareas relacionadas. De los 18 a los 67 son ~49 años, pero la media diaria sobre toda la vida baja al incluir infancia, jubilación y fines de semana.' },
  { id: 'pantallas', nombre: 'Pantallas', icono: '📱', color: '#e74c3c', horasDiarias: 3.5, explicacion: 'Móvil, TV, ordenador personal, redes sociales y streaming fuera del trabajo. La media en España supera las 3 horas diarias solo de móvil. Con TV suma más de 5 en muchos casos.' },
  { id: 'comer', nombre: 'Comer y cocinar', icono: '🍽️', color: '#e67e22', horasDiarias: 1.8, explicacion: 'Comprar, preparar, comer y recoger. En España la comida es un acto social: dedicamos más tiempo que la media europea. ~1,5 horas solo comiendo + 0,3 preparando.' },
  { id: 'higiene', nombre: 'Higiene y cuidado', icono: '🚿', color: '#48A9A6', horasDiarias: 1.0, explicacion: 'Ducha, aseo, vestirse, cuidado personal. Parece poco al día, pero a lo largo de una vida son ~3 años completos.' },
  { id: 'transporte', nombre: 'Transporte', icono: '🚗', color: '#95a5a6', horasDiarias: 1.0, explicacion: 'Desplazamientos no laborales: compras, gestiones, ocio, llevar a hijos. En ciudades grandes sube a 1,5h. En toda una vida, el equivalente a ~3 años en movimiento.' },
  { id: 'tareas', nombre: 'Tareas del hogar', icono: '🏠', color: '#f39c12', horasDiarias: 1.2, explicacion: 'Limpieza, compras, gestiones, mantenimiento. Las encuestas de uso del tiempo del INE sitúan la media en ~1,2h, con diferencias significativas por género.' },
  { id: 'social', nombre: 'Vida social y familia', icono: '👨‍👩‍👧', color: '#27ae60', horasDiarias: 1.5, explicacion: 'Tiempo con pareja, hijos, amigos, llamadas. Es el tiempo que más se reduce con la edad y el que más impacta en la percepción de felicidad.' },
  { id: 'ocio', nombre: 'Ocio activo', icono: '🎯', color: '#9b59b6', horasDiarias: 1.0, explicacion: 'Deporte, lectura, hobbies, paseos, juegos. El tiempo que realmente eliges. Con trabajo, familia y obligaciones, queda sorprendentemente poco.' },
  { id: 'otros', nombre: 'Esperas y otros', icono: '⏳', color: '#bdc3c7', horasDiarias: 0.9, explicacion: 'Esperas (médico, colas, tráfico), tiempo muerto, gestiones administrativas. Invisible pero acumulativo: ~2,5 años en toda una vida.' },
];

const TOTAL_HORAS_DIA = ACTIVIDADES.reduce((s, a) => s + a.horasDiarias, 0); // Debería sumar ~24

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMapaTiempoPage() {
  const [esperanzaVida, setEsperanzaVida] = useState(82);
  const [actividadActiva, setActividadActiva] = useState<string | null>(null);

  const totalHorasVida = esperanzaVida * 365.25 * 24;

  const datosActividades = useMemo(() => {
    return ACTIVIDADES.map(a => {
      const horasVida = a.horasDiarias * 365.25 * esperanzaVida;
      const anosVida = horasVida / (365.25 * 24);
      const pct = (a.horasDiarias / TOTAL_HORAS_DIA) * 100;
      return { ...a, horasVida, anosVida, pct };
    });
  }, [esperanzaVida]);

  const actividadSeleccionada = datosActividades.find(a => a.id === actividadActiva);

  // Gráfico de barras horizontales
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datosActividades.map(a => a.nombre),
        datasets: [{
          label: 'Años de vida',
          data: datosActividades.map(a => a.anosVida),
          backgroundColor: datosActividades.map(a => a.color),
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: { parsed: { x: number | null } }) =>
                `${formatNumber(ctx.parsed.x ?? 0, 1)} años`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Años de vida' },
            ticks: { callback: (v: string | number) => `${v} años` },
          },
          y: { ticks: { font: { size: 12 } } },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [datosActividades]);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Mapa de tu Tiempo</h1>
          <p className={styles.subtitle}>¿En qué gastas las {formatNumber(totalHorasVida, 0)} horas de tu vida?</p>
        </header>

        <LegalNotice />

        {/* Slider esperanza de vida */}
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>Esperanza de vida</label>
            <span className={styles.sliderValor}>{esperanzaVida} años</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={60}
            max={100}
            value={esperanzaVida}
            onChange={(e) => setEsperanzaVida(parseInt(e.target.value))}
            aria-label={`Esperanza de vida: ${esperanzaVida} años`}
          />
          <div className={styles.sliderExtremos}>
            <span>60 años</span>
            <span>100 años</span>
          </div>
        </div>

        {/* Bloques visuales */}
        <div className={styles.bloquesGrid}>
          {datosActividades.map(a => (
            <button
              key={a.id}
              type="button"
              className={`${styles.bloqueCard} ${actividadActiva === a.id ? styles.bloqueActivo : ''}`}
              onClick={() => setActividadActiva(prev => prev === a.id ? null : a.id)}
              style={{ borderTopColor: a.color }}
              aria-pressed={actividadActiva === a.id}
            >
              <span className={styles.bloqueIcono} aria-hidden="true">{a.icono}</span>
              <span className={styles.bloqueNombre}>{a.nombre}</span>
              <span className={styles.bloqueAnos} style={{ color: a.color }}>
                {formatNumber(a.anosVida, 1)} años
              </span>
              <span className={styles.bloquePct}>{formatNumber(a.pct, 0)}%</span>
            </button>
          ))}
        </div>

        {/* Explicación de actividad seleccionada */}
        {actividadSeleccionada && (
          <div className={styles.detalle} style={{ borderLeftColor: actividadSeleccionada.color }}>
            <div className={styles.detalleHeader}>
              <span aria-hidden="true">{actividadSeleccionada.icono}</span>
              <strong>{actividadSeleccionada.nombre}</strong>:
              {' '}{formatNumber(actividadSeleccionada.anosVida, 1)} años
              ({formatNumber(actividadSeleccionada.horasVida, 0)} horas)
            </div>
            <p className={styles.detalleTexto}>{actividadSeleccionada.explicacion}</p>
          </div>
        )}

        {/* Gráfico */}
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitulo}>Tu vida en años, por actividad</h3>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label="Gráfico de barras horizontales: años de vida dedicados a cada actividad" />
          </div>
        </div>

        {/* Barra de reparto */}
        <div className={styles.barraReparto} aria-label="Distribución visual de tu tiempo">
          {datosActividades.map(a => (
            <div
              key={a.id}
              className={styles.barraSegmento}
              style={{ width: `${a.pct}%`, backgroundColor: a.color }}
              title={`${a.nombre}: ${formatNumber(a.pct, 0)}%`}
            />
          ))}
        </div>

        <div className={styles.insight}>
          <p>
            El dato más revelador: el <strong>tiempo que realmente eliges</strong> (ocio activo + vida social)
            suma apenas {formatNumber(datosActividades.find(a => a.id === 'ocio')!.anosVida + datosActividades.find(a => a.id === 'social')!.anosVida, 0)} años
            de {esperanzaVida}. El resto es necesidad (dormir, comer, higiene), obligación (trabajar, tareas)
            o inercia (pantallas, esperas).
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Optimiza tu tiempo → <a href="/temporizador-pomodoro/">Pomodoro</a> · <a href="/time-tracker/">Time Tracker</a> · <a href="/visualizador-precio-real-cosas/">El Precio Real de las Cosas</a>
        </div>

        <EducationalSection
          title="El recurso más escaso que tienes"
          subtitle="Lo que los datos sobre el uso del tiempo revelan"
          defaultOpen={false}
        >
          <h3>Las pantallas: el gran devorador</h3>
          <p>
            Según el INE y estudios de uso digital en España, la media supera las 3 horas diarias
            de pantalla personal (sin contar trabajo). Es más tiempo del que dedicamos a vida social,
            ocio activo, o ejercicio físico. A lo largo de una vida, equivale a más de
            {' '}{formatNumber(3.5 * 365.25 * 82 / (365.25 * 24), 0)} años mirando una pantalla.
          </p>

          <h3>El tiempo social se encoge con la edad</h3>
          <p>
            A los 20, dedicamos ~3 horas al día a amigos y vida social. A los 40, baja a ~1,5h.
            A los 60, menos de 1h. El trabajo, la familia y las obligaciones comprimen el tiempo
            social gradualmente. Las investigaciones muestran que este tiempo es el que más
            correlaciona con percepción de felicidad.
          </p>

          <h3>Dormir no es negociable</h3>
          <p>
            Parece tentador &quot;ganar&quot; horas reduciendo el sueño, pero la ciencia es clara:
            dormir menos de 7 horas tiene efectos acumulativos sobre memoria, sistema inmune,
            metabolismo y expectativa de vida. Las 26 años que pasas durmiendo no son negociables
            — son una inversión en los otros 56.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos son medias orientativas basadas en encuestas de uso
            del tiempo (INE, Eurostat) y estudios de hábitos digitales. La variabilidad individual
            es enorme — tu mapa puede ser muy diferente del promedio.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-mapa-tiempo')} />
        <ShareCard appName="visualizador-mapa-tiempo" />
        <Footer appName="visualizador-mapa-tiempo" />
    </div>
  );
}
