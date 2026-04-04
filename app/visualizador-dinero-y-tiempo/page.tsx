'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import styles from './VisualizadorDineroYTiempo.module.css';
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
// Tipos
// ─────────────────────────────────────────────

type Seccion = 'hipoteca' | 'compuesto' | 'inflacion' | 'amortizar';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'hipoteca', titulo: 'Tu cuota de hipoteca', icono: '🏠', subtitulo: 'Intereses vs capital mes a mes' },
  { id: 'compuesto', titulo: 'El interés compuesto', icono: '📈', subtitulo: 'La fuerza más poderosa de las finanzas' },
  { id: 'inflacion', titulo: 'La inflación invisible', icono: '💸', subtitulo: 'Cómo se evapora tu dinero sin tocarlo' },
  { id: 'amortizar', titulo: 'Amortizar vs invertir', icono: '⚖️', subtitulo: '¿Qué hago con el dinero extra?' },
];

// ─────────────────────────────────────────────
// Sección 1: Hipoteca — reparto intereses/capital
// ─────────────────────────────────────────────

function SeccionHipoteca() {
  const capital = 180000;
  const tipoAnual = 3.0;
  const plazoAnios = 25;
  const numCuotas = plazoAnios * 12;
  const r = tipoAnual / 100 / 12;
  const cuota = capital * (r * Math.pow(1 + r, numCuotas)) / (Math.pow(1 + r, numCuotas) - 1);

  const [mes, setMes] = useState(1);

  const datos = useMemo(() => {
    let pendiente = capital;
    const resultado: { interes: number; amortizacion: number; pendiente: number }[] = [];
    for (let i = 0; i < numCuotas; i++) {
      const interesMes = pendiente * r;
      const amortMes = cuota - interesMes;
      pendiente = Math.max(0, pendiente - amortMes);
      resultado.push({ interes: interesMes, amortizacion: amortMes, pendiente });
    }
    return resultado;
  }, []);

  const actual = datos[mes - 1];
  const pctInteres = (actual.interes / cuota) * 100;
  const pctCapital = (actual.amortizacion / cuota) * 100;

  // Datos por año para el gráfico
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const anios: number[] = [];
    const interesesAnuales: number[] = [];
    const capitalAnual: number[] = [];

    for (let a = 0; a < plazoAnios; a++) {
      anios.push(a + 1);
      let intAnio = 0;
      let capAnio = 0;
      for (let m = 0; m < 12; m++) {
        const idx = a * 12 + m;
        if (idx < datos.length) {
          intAnio += datos[idx].interes;
          capAnio += datos[idx].amortizacion;
        }
      }
      interesesAnuales.push(intAnio);
      capitalAnual.push(capAnio);
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: anios.map(a => `${a}`),
        datasets: [
          {
            label: 'Intereses',
            data: interesesAnuales,
            backgroundColor: '#e74c3c',
            borderRadius: 2,
          },
          {
            label: 'Capital amortizado',
            data: capitalAnual,
            backgroundColor: '#2E86AB',
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
              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          x: { stacked: true, title: { display: true, text: 'Año' } },
          y: {
            stacked: true,
            ticks: { callback: (v: string | number) => formatCurrency(Number(v)) },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [datos]);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Hipoteca de ejemplo: <strong>{formatCurrency(capital)}</strong> a <strong>{plazoAnios} años</strong> al <strong>{formatNumber(tipoAnual, 1)}% fijo</strong></p>
        <p className={styles.contextoDetalle}>Cuota mensual: <strong>{formatCurrency(cuota)}</strong> (siempre la misma)</p>
      </div>

      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Mes de la hipoteca</label>
          <span className={styles.sliderValor}>Mes {mes} de {numCuotas} <span className={styles.sliderAnio}>(año {Math.ceil(mes / 12)})</span></span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={1}
          max={numCuotas}
          value={mes}
          onChange={(e) => setMes(parseInt(e.target.value))}
          aria-label={`Mes ${mes} de la hipoteca`}
        />
        <div className={styles.sliderExtremos}>
          <span>Mes 1</span>
          <span>Mes {numCuotas}</span>
        </div>
      </div>

      {/* Barra visual de reparto */}
      <div className={styles.barraReparto}>
        <div
          className={styles.barraIntereses}
          style={{ width: `${pctInteres}%` }}
          aria-label={`Intereses: ${formatNumber(pctInteres, 1)}%`}
        >
          <span className={styles.barraTexto}>{formatNumber(pctInteres, 0)}% intereses</span>
        </div>
        <div
          className={styles.barraCapital}
          style={{ width: `${pctCapital}%` }}
          aria-label={`Capital: ${formatNumber(pctCapital, 1)}%`}
        >
          <span className={styles.barraTexto}>{formatNumber(pctCapital, 0)}% capital</span>
        </div>
      </div>

      <div className={styles.detalleGrid}>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Pagas de intereses</span>
          <span className={`${styles.detalleValor} ${styles.rojo}`}>{formatCurrency(actual.interes)}</span>
        </div>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Amortizas de deuda</span>
          <span className={`${styles.detalleValor} ${styles.azul}`}>{formatCurrency(actual.amortizacion)}</span>
        </div>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Deuda pendiente</span>
          <span className={styles.detalleValor}>{formatCurrency(actual.pendiente)}</span>
        </div>
      </div>

      <div className={styles.insight}>
        {mes <= 60 && (
          <p>En los primeros 5 años, <strong>más de la mitad de cada cuota son intereses</strong>. Estás pagando al banco antes que a ti mismo.</p>
        )}
        {mes > 60 && mes <= 180 && (
          <p>A partir del año 5, la proporción empieza a equilibrarse. Cada mes amortizas un poco más de deuda real.</p>
        )}
        {mes > 180 && (
          <p>En los últimos años, <strong>casi toda la cuota reduce tu deuda</strong>. Los intereses ya pesan muy poco.</p>
        )}
      </div>

      {/* Gráfico anual */}
      <div className={styles.chartContainer}>
        <h4 className={styles.chartTitulo}>Reparto anual: intereses vs capital</h4>
        <div className={styles.chartWrap}>
          <canvas ref={chartRef} aria-label="Gráfico de barras apiladas: intereses vs capital por año de hipoteca" />
        </div>
      </div>

      <div className={styles.enlaceApp}>
        <span aria-hidden="true">🔗</span> ¿Quieres calcular con tus datos reales? → <a href="/estimador-hipoteca/">Estimador de Hipoteca</a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Interés compuesto
// ─────────────────────────────────────────────

function SeccionCompuesto() {
  const capitalInicial = 10000;
  const aportacionMensual = 200;
  const [anios, setAnios] = useState(20);
  const tasaAnual = 7; // Rentabilidad media histórica renta variable

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const datos = useMemo(() => {
    const sinInteres: number[] = [];
    const simple: number[] = [];
    const compuesto: number[] = [];
    const aportado: number[] = [];

    for (let a = 1; a <= anios; a++) {
      const totalAportado = capitalInicial + aportacionMensual * 12 * a;
      aportado.push(totalAportado);

      // Sin interés
      sinInteres.push(totalAportado);

      // Interés simple: solo sobre el capital inicial
      const gananciaSimple = capitalInicial * (tasaAnual / 100) * a;
      simple.push(totalAportado + gananciaSimple);

      // Interés compuesto: sobre todo el capital acumulado
      let acumulado = capitalInicial;
      const rMensual = tasaAnual / 100 / 12;
      for (let m = 0; m < a * 12; m++) {
        acumulado = acumulado * (1 + rMensual) + aportacionMensual;
      }
      compuesto.push(acumulado);
    }

    return { sinInteres, simple, compuesto, aportado };
  }, [anios]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = Array.from({ length: anios }, (_, i) => `${i + 1}`);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Interés compuesto (7%)',
            data: datos.compuesto,
            borderColor: '#2E86AB',
            backgroundColor: 'rgba(46, 134, 171, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 3,
          },
          {
            label: 'Interés simple (7%)',
            data: datos.simple,
            borderColor: '#48A9A6',
            backgroundColor: 'transparent',
            borderDash: [6, 4],
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2,
          },
          {
            label: 'Solo lo aportado (0%)',
            data: datos.sinInteres,
            borderColor: '#999999',
            backgroundColor: 'transparent',
            borderDash: [3, 3],
            tension: 0,
            pointRadius: 0,
            borderWidth: 1.5,
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
              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Años' } },
          y: {
            ticks: { callback: (v: string | number) => formatCurrency(Number(v)) },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [datos, anios]);

  const totalAportado = capitalInicial + aportacionMensual * 12 * anios;
  const totalCompuesto = datos.compuesto[anios - 1];
  const gananciaCompuesto = totalCompuesto - totalAportado;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Ejemplo: <strong>{formatCurrency(capitalInicial)}</strong> iniciales + <strong>{formatCurrency(aportacionMensual)}/mes</strong> de aportación al <strong>{tasaAnual}% anual</strong></p>
      </div>

      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Horizonte temporal</label>
          <span className={styles.sliderValor}>{anios} años</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={5}
          max={40}
          value={anios}
          onChange={(e) => setAnios(parseInt(e.target.value))}
          aria-label={`Horizonte de ${anios} años`}
        />
        <div className={styles.sliderExtremos}>
          <span>5 años</span>
          <span>40 años</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartWrap}>
          <canvas ref={chartRef} aria-label="Gráfico comparativo: interés compuesto vs simple vs sin interés" />
        </div>
      </div>

      <div className={styles.detalleGrid}>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Has aportado</span>
          <span className={styles.detalleValor}>{formatCurrency(totalAportado)}</span>
        </div>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Tienes acumulado</span>
          <span className={`${styles.detalleValor} ${styles.azul}`}>{formatCurrency(totalCompuesto)}</span>
        </div>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Ganancia por interés compuesto</span>
          <span className={`${styles.detalleValor} ${styles.verde}`}>{formatCurrency(gananciaCompuesto)}</span>
        </div>
      </div>

      <div className={styles.insight}>
        {anios <= 10 && (
          <p>En los primeros años, la diferencia es pequeña. El interés compuesto <strong>necesita tiempo para despegar</strong>.</p>
        )}
        {anios > 10 && anios <= 25 && (
          <p>Aquí se empieza a notar: los intereses generan sus propios intereses. <strong>Tu dinero trabaja para ti.</strong></p>
        )}
        {anios > 25 && (
          <p>A largo plazo, <strong>la ganancia supera con creces lo aportado</strong>. Este es el efecto &quot;bola de nieve&quot; del interés compuesto.</p>
        )}
      </div>

      <div className={styles.enlaceApp}>
        <span aria-hidden="true">🔗</span> Calcula con tus datos → <a href="/estimador-interes-compuesto/">Estimador de Interés Compuesto</a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Inflación
// ─────────────────────────────────────────────

function SeccionInflacion() {
  const dineroInicial = 1000;
  const [anios, setAnios] = useState(15);

  const datos = useMemo(() => {
    const tasas = [
      { nombre: 'Inflación baja (2%)', tasa: 2, color: '#48A9A6' },
      { nombre: 'Inflación media (3,5%)', tasa: 3.5, color: '#e67e22' },
      { nombre: 'Inflación alta (6%)', tasa: 6, color: '#e74c3c' },
    ];

    return tasas.map(t => ({
      ...t,
      valores: Array.from({ length: anios }, (_, i) =>
        dineroInicial / Math.pow(1 + t.tasa / 100, i + 1)
      ),
    }));
  }, [anios]);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = Array.from({ length: anios }, (_, i) => `${i + 1}`);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datos.map(d => ({
          label: d.nombre,
          data: d.valores,
          borderColor: d.color,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2,
          borderWidth: 2.5,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)} de poder real`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Años' } },
          y: {
            min: 0,
            max: dineroInicial,
            ticks: { callback: (v: string | number) => `${formatNumber(Number(v), 0)} €` },
            title: { display: true, text: 'Poder adquisitivo real' },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [datos, anios]);

  // Barras visuales de "billetes que se desvanecen"
  const poderReal2pct = datos[0].valores[anios - 1];
  const poderReal3pct = datos[1].valores[anios - 1];
  const poderReal6pct = datos[2].valores[anios - 1];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Imagina que guardas <strong>{formatCurrency(dineroInicial)}</strong> debajo del colchón hoy. ¿Cuánto podrás comprar con ese dinero en el futuro?</p>
      </div>

      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Años en el futuro</label>
          <span className={styles.sliderValor}>{anios} años</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={5}
          max={30}
          value={anios}
          onChange={(e) => setAnios(parseInt(e.target.value))}
          aria-label={`${anios} años en el futuro`}
        />
        <div className={styles.sliderExtremos}>
          <span>5 años</span>
          <span>30 años</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartWrap}>
          <canvas ref={chartRef} aria-label="Gráfico de erosión del poder adquisitivo por inflación" />
        </div>
      </div>

      {/* Resumen visual */}
      <p className={styles.inflacionResumen}>Tus {formatCurrency(dineroInicial)} de hoy equivaldrán a:</p>
      <div className={styles.inflacionGrid}>
        <div className={styles.inflacionCard}>
          <span className={styles.inflacionTasa}>Al 2%</span>
          <span className={styles.inflacionValor} style={{ color: '#48A9A6' }}>{formatCurrency(poderReal2pct)}</span>
          <span className={styles.inflacionPerdida}>Pierdes {formatNumber(100 - (poderReal2pct / dineroInicial) * 100, 0)}%</span>
        </div>
        <div className={styles.inflacionCard}>
          <span className={styles.inflacionTasa}>Al 3,5%</span>
          <span className={styles.inflacionValor} style={{ color: '#e67e22' }}>{formatCurrency(poderReal3pct)}</span>
          <span className={styles.inflacionPerdida}>Pierdes {formatNumber(100 - (poderReal3pct / dineroInicial) * 100, 0)}%</span>
        </div>
        <div className={styles.inflacionCard}>
          <span className={styles.inflacionTasa}>Al 6%</span>
          <span className={styles.inflacionValor} style={{ color: '#e74c3c' }}>{formatCurrency(poderReal6pct)}</span>
          <span className={styles.inflacionPerdida}>Pierdes {formatNumber(100 - (poderReal6pct / dineroInicial) * 100, 0)}%</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>La inflación no te quita dinero del bolsillo — <strong>te quita lo que puedes comprar con él</strong>. A un 3,5% anual, en {anios} años tus {formatCurrency(dineroInicial)} comprarán lo que hoy comprarías con {formatCurrency(poderReal3pct)}.</p>
      </div>

      <div className={styles.enlaceApp}>
        <span aria-hidden="true">🔗</span> Datos históricos del IPC → <a href="/estimador-inflacion/">Estimador de Inflación</a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Amortizar vs invertir
// ─────────────────────────────────────────────

function SeccionAmortizar() {
  const deudaPendiente = 150000;
  const tipoHipoteca = 3.0;
  const plazoRestante = 20;
  const extraMensual = 300;
  const [rentabilidadInversion, setRentabilidadInversion] = useState(6);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const datos = useMemo(() => {
    const r = tipoHipoteca / 100 / 12;
    const numCuotas = plazoRestante * 12;
    const cuota = deudaPendiente * (r * Math.pow(1 + r, numCuotas)) / (Math.pow(1 + r, numCuotas) - 1);

    // Escenario A: amortizar hipoteca (reducir plazo)
    const amortizar: { anio: number; ahorroIntereses: number; deudaPendiente: number }[] = [];
    let pendienteAmort = deudaPendiente;
    let ahorroInteresesAcumulado = 0;

    // Escenario B: invertir ese dinero
    const invertir: { anio: number; capitalInvertido: number }[] = [];
    let capitalInvertido = 0;
    const rInv = rentabilidadInversion / 100 / 12;

    // Escenario base: no hacer nada
    let pendienteBase = deudaPendiente;

    for (let a = 1; a <= plazoRestante; a++) {
      for (let m = 0; m < 12; m++) {
        // Base
        const interesBase = pendienteBase * r;
        const capitalBase = cuota - interesBase;
        pendienteBase = Math.max(0, pendienteBase - capitalBase);

        // Amortizar
        const interesAmort = pendienteAmort * r;
        const capitalAmort = cuota - interesAmort + extraMensual;
        const interesAhorrado = (pendienteAmort - pendienteBase > 0) ? 0 : interesBase - interesAmort;
        ahorroInteresesAcumulado += Math.max(0, interesBase - interesAmort);
        pendienteAmort = Math.max(0, pendienteAmort - capitalAmort);

        // Invertir
        capitalInvertido = (capitalInvertido + extraMensual) * (1 + rInv);
      }

      amortizar.push({ anio: a, ahorroIntereses: ahorroInteresesAcumulado, deudaPendiente: pendienteAmort });
      invertir.push({ anio: a, capitalInvertido });
    }

    return { amortizar, invertir, cuota };
  }, [rentabilidadInversion]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = datos.amortizar.map(d => `${d.anio}`);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Invertir al ${rentabilidadInversion}%`,
            data: datos.invertir.map(d => d.capitalInvertido),
            borderColor: '#2E86AB',
            backgroundColor: 'rgba(46, 134, 171, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2.5,
          },
          {
            label: 'Ahorro en intereses amortizando',
            data: datos.amortizar.map(d => d.ahorroIntereses),
            borderColor: '#48A9A6',
            backgroundColor: 'rgba(72, 169, 166, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2.5,
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
              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Años' } },
          y: {
            ticks: { callback: (v: string | number) => formatCurrency(Number(v)) },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [datos, rentabilidadInversion]);

  const capitalFinalInvertido = datos.invertir[datos.invertir.length - 1]?.capitalInvertido ?? 0;
  const ahorroFinalAmortizando = datos.amortizar[datos.amortizar.length - 1]?.ahorroIntereses ?? 0;
  const diferencia = capitalFinalInvertido - ahorroFinalAmortizando;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Ejemplo: hipoteca de <strong>{formatCurrency(deudaPendiente)}</strong> al <strong>{formatNumber(tipoHipoteca, 1)}%</strong>, te sobran <strong>{formatCurrency(extraMensual)}/mes</strong></p>
        <p className={styles.contextoDetalle}>¿Amortizar hipoteca anticipadamente o invertir ese dinero?</p>
      </div>

      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Rentabilidad esperada de la inversión</label>
          <span className={styles.sliderValor}>{formatNumber(rentabilidadInversion, 1)}% anual</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={1}
          max={12}
          step={0.5}
          value={rentabilidadInversion}
          onChange={(e) => setRentabilidadInversion(parseFloat(e.target.value))}
          aria-label={`Rentabilidad del ${rentabilidadInversion}%`}
        />
        <div className={styles.sliderExtremos}>
          <span>1% (depósito)</span>
          <span>12% (renta variable)</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartWrap}>
          <canvas ref={chartRef} aria-label="Gráfico comparativo: invertir vs amortizar hipoteca" />
        </div>
      </div>

      <div className={styles.detalleGrid}>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Si inviertes ({rentabilidadInversion}%)</span>
          <span className={`${styles.detalleValor} ${styles.azul}`}>{formatCurrency(capitalFinalInvertido)}</span>
        </div>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Si amortizas hipoteca</span>
          <span className={`${styles.detalleValor} ${styles.verde}`}>{formatCurrency(ahorroFinalAmortizando)}</span>
        </div>
        <div className={styles.detalleCard}>
          <span className={styles.detalleLabel}>Diferencia en {plazoRestante} años</span>
          <span className={`${styles.detalleValor} ${diferencia > 0 ? styles.azul : styles.verde}`}>
            {diferencia > 0 ? '+' : ''}{formatCurrency(diferencia)} {diferencia > 0 ? '(invertir)' : '(amortizar)'}
          </span>
        </div>
      </div>

      <div className={styles.insight}>
        {rentabilidadInversion > tipoHipoteca + 1 ? (
          <p>Si consigues un {formatNumber(rentabilidadInversion, 1)}% de rentabilidad, <strong>invertir genera más riqueza</strong>. Pero ojo: la rentabilidad de la inversión no está garantizada; el ahorro en intereses de la hipoteca, sí.</p>
        ) : rentabilidadInversion > tipoHipoteca ? (
          <p>Con rentabilidades cercanas al tipo de tu hipoteca, <strong>la diferencia es mínima</strong>. La decisión depende más de tu tolerancia al riesgo y tu tranquilidad personal.</p>
        ) : (
          <p>Si la rentabilidad esperada está <strong>por debajo del tipo de tu hipoteca</strong>, amortizar es la mejor opción: es un ahorro garantizado y sin riesgo.</p>
        )}
      </div>

      <div className={styles.enlaceApp}>
        <span aria-hidden="true">🔗</span> Simula tu amortización → <a href="/amortizacion-hipoteca/">Amortización Anticipada Hipoteca</a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorDineroYTiempoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('hipoteca');

  const renderSeccion = useCallback(() => {
    switch (seccionActiva) {
      case 'hipoteca': return <SeccionHipoteca />;
      case 'compuesto': return <SeccionCompuesto />;
      case 'inflacion': return <SeccionInflacion />;
      case 'amortizar': return <SeccionAmortizar />;
    }
  }, [seccionActiva]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Dinero y el Tiempo</h1>
          <p className={styles.subtitle}>Explicador visual interactivo — 4 conceptos financieros que todo el mundo debería entender</p>
        </header>

        <LegalNotice />

        {/* Navegación de secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de la sección activa */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {/* Contenido de la sección */}
        {renderSeccion()}

        {/* Sección educativa */}
        <EducationalSection
          title="El tiempo es tu mayor aliado financiero"
          subtitle="Lo que estos gráficos revelan sobre el dinero"
          defaultOpen={false}
        >
          <h3>La regla del 72</h3>
          <p>
            Divide 72 entre el tipo de interés y obtendrás los años que tarda tu dinero en duplicarse.
            Al 7%, se duplica en ~10 años. Al 3%, en ~24 años. Esta regla rápida te permite evaluar
            cualquier inversión o deuda en segundos.
          </p>

          <h3>Por qué el tiempo importa más que la cantidad</h3>
          <p>
            Una persona que invierte 200 €/mes desde los 25 hasta los 65 años al 7% acumula
            aproximadamente 528.000 €. Alguien que empieza a los 35 con la misma aportación y
            rentabilidad acumula ~243.000 €. Diez años menos = <strong>la mitad del resultado</strong>.
            No es el dinero que metes — es el tiempo que le das para crecer.
          </p>

          <h3>La inflación: el impuesto invisible</h3>
          <p>
            A diferencia de los impuestos, la inflación no aparece en ningún recibo. Pero es real:
            con un IPC medio del 3%, algo que hoy cuesta 100 € costará 134 € en 10 años y 181 € en 20.
            Guardar dinero en la cuenta corriente no es &quot;no arriesgarse&quot; — es perder poder adquisitivo
            de forma garantizada.
          </p>

          <h3>Amortizar vs invertir: no hay respuesta universal</h3>
          <p>
            La matemática es clara: si la rentabilidad esperada de tu inversión es mayor que el tipo
            de tu hipoteca, invertir genera más riqueza. Pero la matemática ignora dos factores
            psicológicos importantes: la <strong>tranquilidad</strong> de tener menos deuda y el
            <strong> riesgo</strong> de que la rentabilidad no se materialice. No hay respuesta
            correcta — hay respuesta adecuada para cada persona.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota importante:</strong> todos los ejemplos de esta página usan datos ficticios
            con fines educativos. Las rentabilidades pasadas no garantizan resultados futuros.
            Para decisiones financieras reales, consulta con un profesional.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-dinero-y-tiempo')} />
        <ShareCard appName="visualizador-dinero-y-tiempo" />
        <Footer appName="visualizador-dinero-y-tiempo" />
      </div>
    </>
  );
}
