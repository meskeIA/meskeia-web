'use client';

import { useMemo, useState } from 'react';
import styles from './CalculadoraTamanoAdultoPerro.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

type TamanoRaza = 'mini' | 'pequeno' | 'mediano' | 'grande' | 'gigante';

interface RazaReferencia {
  nombre: string;
  tamano: TamanoRaza;
  pesoAdulto: string;
  maduracion: string;
}

const razasReferencia: RazaReferencia[] = [
  // Mini
  { nombre: 'Chihuahua', tamano: 'mini', pesoAdulto: '1,5-3 kg', maduracion: '8-10 meses' },
  { nombre: 'Yorkshire Terrier', tamano: 'mini', pesoAdulto: '2-3,5 kg', maduracion: '8-10 meses' },
  { nombre: 'Pomerania', tamano: 'mini', pesoAdulto: '1,5-3 kg', maduracion: '8-10 meses' },
  { nombre: 'Maltés', tamano: 'mini', pesoAdulto: '3-4 kg', maduracion: '9-12 meses' },
  // Pequeño
  { nombre: 'Bichón Frisé', tamano: 'pequeno', pesoAdulto: '5-10 kg', maduracion: '10-12 meses' },
  { nombre: 'Cavalier King Charles', tamano: 'pequeno', pesoAdulto: '5,5-8 kg', maduracion: '10-12 meses' },
  { nombre: 'Jack Russell', tamano: 'pequeno', pesoAdulto: '6-8 kg', maduracion: '10-12 meses' },
  { nombre: 'Shih Tzu', tamano: 'pequeno', pesoAdulto: '4-7 kg', maduracion: '10-12 meses' },
  { nombre: 'Teckel', tamano: 'pequeno', pesoAdulto: '7-15 kg', maduracion: '10-12 meses' },
  // Mediano
  { nombre: 'Beagle', tamano: 'mediano', pesoAdulto: '9-11 kg', maduracion: '12-15 meses' },
  { nombre: 'Cocker Spaniel', tamano: 'mediano', pesoAdulto: '12-15 kg', maduracion: '12-15 meses' },
  { nombre: 'Bulldog Francés', tamano: 'mediano', pesoAdulto: '8-14 kg', maduracion: '12-14 meses' },
  { nombre: 'Border Collie', tamano: 'mediano', pesoAdulto: '14-20 kg', maduracion: '12-15 meses' },
  { nombre: 'Schnauzer Mediano', tamano: 'mediano', pesoAdulto: '14-20 kg', maduracion: '12-15 meses' },
  // Grande
  { nombre: 'Labrador Retriever', tamano: 'grande', pesoAdulto: '25-36 kg', maduracion: '18-24 meses' },
  { nombre: 'Golden Retriever', tamano: 'grande', pesoAdulto: '25-34 kg', maduracion: '18-24 meses' },
  { nombre: 'Pastor Alemán', tamano: 'grande', pesoAdulto: '22-40 kg', maduracion: '18-24 meses' },
  { nombre: 'Boxer', tamano: 'grande', pesoAdulto: '25-32 kg', maduracion: '18-24 meses' },
  { nombre: 'Husky Siberiano', tamano: 'grande', pesoAdulto: '16-27 kg', maduracion: '15-18 meses' },
  // Gigante
  { nombre: 'Pastor Bernés', tamano: 'gigante', pesoAdulto: '35-55 kg', maduracion: '24-36 meses' },
  { nombre: 'Gran Danés', tamano: 'gigante', pesoAdulto: '45-90 kg', maduracion: '24-36 meses' },
  { nombre: 'San Bernardo', tamano: 'gigante', pesoAdulto: '50-90 kg', maduracion: '24-36 meses' },
  { nombre: 'Mastín', tamano: 'gigante', pesoAdulto: '50-70 kg', maduracion: '24-36 meses' },
  { nombre: 'Terranova', tamano: 'gigante', pesoAdulto: '45-70 kg', maduracion: '24-36 meses' },
  { nombre: 'Rottweiler', tamano: 'gigante', pesoAdulto: '35-60 kg', maduracion: '18-24 meses' },
  { nombre: 'Dogo Alemán', tamano: 'gigante', pesoAdulto: '45-90 kg', maduracion: '24-36 meses' },
  { nombre: 'Leonberger', tamano: 'gigante', pesoAdulto: '45-77 kg', maduracion: '24-36 meses' },
];

// Factores de crecimiento por edad (semanas) y tamaño
const curvasCrecimiento: Record<TamanoRaza, Record<number, number>> = {
  mini: {
    8: 0.35, 12: 0.50, 16: 0.65, 20: 0.80, 24: 0.90, 28: 0.95, 32: 0.98, 40: 1.0,
  },
  pequeno: {
    8: 0.30, 12: 0.45, 16: 0.58, 20: 0.70, 24: 0.80, 28: 0.88, 32: 0.94, 40: 0.98, 48: 1.0,
  },
  mediano: {
    8: 0.25, 12: 0.38, 16: 0.50, 20: 0.60, 24: 0.70, 28: 0.78, 32: 0.85, 40: 0.92, 52: 0.98, 60: 1.0,
  },
  grande: {
    8: 0.20, 12: 0.30, 16: 0.40, 20: 0.48, 24: 0.55, 28: 0.62, 32: 0.68, 40: 0.78, 52: 0.88, 72: 0.96, 96: 1.0,
  },
  gigante: {
    8: 0.15, 12: 0.22, 16: 0.30, 20: 0.37, 24: 0.43, 28: 0.50, 32: 0.55, 40: 0.65, 52: 0.75, 72: 0.85, 96: 0.95, 144: 1.0,
  },
};

// Peso adulto típico de cada categoría, en kg. Sirve para contrastar la proyección
// con la categoría elegida: la estimación sale del propio peso del cachorro, así que
// sin una referencia externa como esta el resultado nunca se puede contradecir.
const rangosTipicos: Record<TamanoRaza, { min: number; max: number; etiqueta: string }> = {
  mini: { min: 1, max: 5, etiqueta: 'menos de 5 kg' },
  pequeno: { min: 5, max: 10, etiqueta: '5-10 kg' },
  mediano: { min: 10, max: 25, etiqueta: '10-25 kg' },
  grande: { min: 25, max: 45, etiqueta: '25-45 kg' },
  gigante: { min: 45, max: 100, etiqueta: 'más de 45 kg' },
};

// Hitos que se etiquetan en la curva y en la tabla, en meses
const hitosMeses = [2, 3, 4, 6, 9, 12, 18, 24, 36];

const etiquetasTamano: Record<TamanoRaza, string> = {
  mini: 'Mini',
  pequeno: 'Pequeño',
  mediano: 'Mediano',
  grande: 'Grande',
  gigante: 'Gigante',
};

const obtenerPorcentajeCrecimiento = (edad: number, tamano: TamanoRaza): number => {
  const curva = curvasCrecimiento[tamano];
  const edades = Object.keys(curva).map(Number).sort((a, b) => a - b);

  // Si la edad está por debajo del mínimo
  if (edad <= edades[0]) {
    return curva[edades[0]];
  }

  // Si la edad está por encima del máximo
  if (edad >= edades[edades.length - 1]) {
    return 1.0;
  }

  // Interpolación lineal entre los dos puntos más cercanos
  for (let i = 0; i < edades.length - 1; i++) {
    if (edad >= edades[i] && edad < edades[i + 1]) {
      const x0 = edades[i];
      const x1 = edades[i + 1];
      const y0 = curva[x0];
      const y1 = curva[x1];
      return y0 + (y1 - y0) * ((edad - x0) / (x1 - x0));
    }
  }

  return 1.0;
};

// Semana en la que la curva del tamaño llega al 100 % (fin del crecimiento)
const semanaMadurez = (tamano: TamanoRaza): number => {
  const edades = Object.keys(curvasCrecimiento[tamano]).map(Number).sort((a, b) => a - b);
  return edades[edades.length - 1];
};

interface PuntoCurva {
  semanas: number;
  meses: number;
  peso: number;
  porcentaje: number;
}

// Geometría del gráfico (viewBox fijo: el SVG escala con el ancho disponible)
const VB_W = 640;
const VB_H = 260;
const M = { top: 18, right: 20, bottom: 38, left: 52 };
const plotW = VB_W - M.left - M.right;
const plotH = VB_H - M.top - M.bottom;

export default function CalculadoraTamanoAdultoPerroPage() {
  const [pesoActual, setPesoActual] = useState('');
  const [edadSemanas, setEdadSemanas] = useState('');
  const [tamanoRaza, setTamanoRaza] = useState<TamanoRaza>('mediano');
  const [filtroRaza, setFiltroRaza] = useState<TamanoRaza | 'todas'>('todas');
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    pesoAdultoMin: number;
    pesoAdultoMax: number;
    pesoAdultoEstimado: number;
    porcentajeCrecimiento: number;
    edadMaduracion: string;
    tamano: TamanoRaza;
    edad: number;
    peso: number;
  } | null>(null);

  const calcular = () => {
    const peso = parseFloat(pesoActual.replace(',', '.'));
    const edad = parseFloat(edadSemanas);

    if (isNaN(peso) || peso <= 0 || peso > 50) {
      setError('Introduce un peso actual válido, entre 0 y 50 kg.');
      setResultado(null);
      return;
    }
    if (isNaN(edad) || edad < 4 || edad > 150) {
      setError('Introduce una edad válida, entre 4 y 150 semanas.');
      setResultado(null);
      return;
    }

    setError(null);
    const porcentaje = obtenerPorcentajeCrecimiento(edad, tamanoRaza);

    // Peso adulto estimado
    const pesoEstimado = peso / porcentaje;

    // Rango con margen de error del 15%
    const pesoMin = pesoEstimado * 0.85;
    const pesoMax = pesoEstimado * 1.15;

    // Edad de maduración según tamaño
    const edadesMaduracion: Record<TamanoRaza, string> = {
      mini: '8-10 meses',
      pequeno: '10-12 meses',
      mediano: '12-15 meses',
      grande: '18-24 meses',
      gigante: '24-36 meses',
    };

    setResultado({
      pesoAdultoMin: pesoMin,
      pesoAdultoMax: pesoMax,
      pesoAdultoEstimado: pesoEstimado,
      porcentajeCrecimiento: porcentaje * 100,
      edadMaduracion: edadesMaduracion[tamanoRaza],
      tamano: tamanoRaza,
      edad,
      peso,
    });
  };

  const limpiar = () => {
    setPesoActual('');
    setEdadSemanas('');
    setResultado(null);
    setError(null);
  };

  const razasFiltradas = filtroRaza === 'todas'
    ? razasReferencia
    : razasReferencia.filter(r => r.tamano === filtroRaza);

  // Trayectoria de crecimiento: la misma curva que ya usa el cálculo, pero recorrida
  // entera en vez de en un solo punto. Responde "¿cuánto pesará por el camino?" dentro
  // de la propia consulta, sin pedir al usuario que vuelva a pesar y anotar.
  const curva = useMemo(() => {
    if (!resultado) return null;

    const finSemanas = semanaMadurez(resultado.tamano);
    const puntos: PuntoCurva[] = [];
    const paso = finSemanas / 60;
    for (let s = 4; s <= finSemanas + 0.001; s += paso) {
      const pct = obtenerPorcentajeCrecimiento(s, resultado.tamano);
      puntos.push({ semanas: s, meses: s / 4.33, peso: resultado.pesoAdultoEstimado * pct, porcentaje: pct });
    }

    const hitos: PuntoCurva[] = hitosMeses
      .map((m) => m * 4.33)
      .filter((s) => s >= 4 && s <= finSemanas)
      .map((s) => {
        const pct = obtenerPorcentajeCrecimiento(s, resultado.tamano);
        return { semanas: s, meses: s / 4.33, peso: resultado.pesoAdultoEstimado * pct, porcentaje: pct };
      });

    // Contraste con el peso adulto típico de la categoría elegida
    const rango = rangosTipicos[resultado.tamano];
    const coherencia: 'dentro' | 'porEncima' | 'porDebajo' =
      resultado.pesoAdultoEstimado > rango.max ? 'porEncima'
        : resultado.pesoAdultoEstimado < rango.min ? 'porDebajo'
          : 'dentro';

    return { puntos, hitos, finSemanas, rango, coherencia };
  }, [resultado]);

  const grafico = useMemo(() => {
    if (!resultado || !curva) return null;

    const yMax = resultado.pesoAdultoEstimado * 1.15;
    const escalaX = (s: number) => M.left + ((s - 4) / (curva.finSemanas - 4)) * plotW;
    const escalaY = (kg: number) => M.top + plotH - (kg / yMax) * plotH;

    const linea = curva.puntos
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${escalaX(p.semanas).toFixed(1)},${escalaY(p.peso).toFixed(1)}`)
      .join(' ');

    // Banda de incertidumbre: el mismo ±15 % que ya declara el rango probable
    const banda = [
      ...curva.puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${escalaX(p.semanas).toFixed(1)},${escalaY(p.peso * 1.15).toFixed(1)}`),
      ...[...curva.puntos].reverse().map((p) => `L${escalaX(p.semanas).toFixed(1)},${escalaY(p.peso * 0.85).toFixed(1)}`),
      'Z',
    ].join(' ');

    const ticksY = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ kg: yMax * f, y: escalaY(yMax * f) }));

    return {
      linea,
      banda,
      ticksY,
      yAdulto: escalaY(resultado.pesoAdultoEstimado),
      cachorro: { x: escalaX(Math.min(resultado.edad, curva.finSemanas)), y: escalaY(resultado.peso) },
      escalaX,
      escalaY,
    };
  }, [resultado, curva]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📏 Predictor de Tamaño Adulto</h1>
        <p className={styles.subtitle}>
          Calcula cuánto pesará tu cachorro cuando sea adulto
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h3>Datos de tu cachorro</h3>

          {/* Peso actual */}
          <div className={styles.inputGroup}>
            <label htmlFor="peso-actual">Peso actual</label>
            <div className={styles.inputConUnidad}>
              <input
                id="peso-actual"
                type="text"
                inputMode="decimal"
                value={pesoActual}
                onChange={(e) => setPesoActual(e.target.value)}
                placeholder="5"
                className={styles.input}
              />
              <span className={styles.unidad}>kg</span>
            </div>
          </div>

          {/* Edad en semanas */}
          <div className={styles.inputGroup}>
            <label htmlFor="edad-cachorro">Edad del cachorro</label>
            <div className={styles.inputConUnidad}>
              <input
                id="edad-cachorro"
                type="text"
                inputMode="numeric"
                value={edadSemanas}
                onChange={(e) => setEdadSemanas(e.target.value)}
                placeholder="16"
                className={styles.input}
              />
              <span className={styles.unidad}>semanas</span>
            </div>
            <span className={styles.hint}>
              {edadSemanas && !isNaN(parseFloat(edadSemanas)) ?
                `≈ ${formatNumber(parseFloat(edadSemanas) / 4.33, 1)} meses` : ''}
            </span>
          </div>

          {/* Tamaño de raza */}
          <div className={styles.inputGroup}>
            <span className={styles.grupoLabel} id="etiqueta-tamano-raza">Tamaño esperado de la raza</span>
            <div className={styles.tamanoGrid} role="group" aria-labelledby="etiqueta-tamano-raza">
              {[
                { id: 'mini' as TamanoRaza, label: 'Mini', peso: '<5 kg' },
                { id: 'pequeno' as TamanoRaza, label: 'Pequeño', peso: '5-10 kg' },
                { id: 'mediano' as TamanoRaza, label: 'Mediano', peso: '10-25 kg' },
                { id: 'grande' as TamanoRaza, label: 'Grande', peso: '25-45 kg' },
                { id: 'gigante' as TamanoRaza, label: 'Gigante', peso: '>45 kg' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`${styles.tamanoBtn} ${tamanoRaza === t.id ? styles.active : ''}`}
                  onClick={() => setTamanoRaza(t.id)}
                  aria-pressed={tamanoRaza === t.id}
                >
                  <span className={styles.tamanoLabel}>{t.label}</span>
                  <span className={styles.tamanoPeso}>{t.peso}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.botones}>
            <button type="button" onClick={calcular} className={styles.btnPrimary}>
              Calcular Peso Adulto
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>

          {error && (
            <p className={styles.errorMsg} role="alert">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}
        </div>

        <div className={styles.resultsPanel} role="status" aria-live="polite">
          {resultado ? (
            <>
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoIcon}>🐕</span>
                <div className={styles.resultadoValor}>
                  {formatNumber(resultado.pesoAdultoEstimado, 1)} kg
                </div>
                <div className={styles.resultadoLabel}>
                  Peso adulto estimado
                </div>
              </div>

              <div className={styles.rangoBox}>
                <div className={styles.rangoLabel}>Rango probable:</div>
                <div className={styles.rangoValor}>
                  {formatNumber(resultado.pesoAdultoMin, 1)} - {formatNumber(resultado.pesoAdultoMax, 1)} kg
                </div>
              </div>

              <div className={styles.detallesGrid}>
                <div className={styles.detalleCard}>
                  <span className={styles.detalleIcon}>📊</span>
                  <span className={styles.detalleValor}>{formatNumber(resultado.porcentajeCrecimiento, 0)}%</span>
                  <span className={styles.detalleLabel}>Crecimiento actual</span>
                </div>
                <div className={styles.detalleCard}>
                  <span className={styles.detalleIcon}>🎯</span>
                  <span className={styles.detalleValor}>{resultado.edadMaduracion}</span>
                  <span className={styles.detalleLabel}>Maduración</span>
                </div>
              </div>

              <div className={styles.barraProgreso}>
                <div className={styles.barraFondo}>
                  <div
                    className={styles.barraRelleno}
                    style={{ width: `${Math.min(resultado.porcentajeCrecimiento, 100)}%` }}
                  />
                </div>
                <div className={styles.barraLabels}>
                  <span>Nacimiento</span>
                  <span>Tamaño adulto</span>
                </div>
              </div>

              <div className={styles.notaInfo}>
                💡 La precisión es mayor con cachorros de más de 14 semanas.
                Los mestizos pueden variar más que las razas puras.
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🐾</span>
              <p>Introduce los datos de tu cachorro para predecir su tamaño adulto</p>
            </div>
          )}
        </div>
      </div>

      {/* Trayectoria de crecimiento */}
      {resultado && curva && grafico && (
        <section className={styles.curvaContainer} aria-labelledby="tituloCurva">
          <h2 id="tituloCurva">
            <span aria-hidden="true">📈</span> Cuánto pesará por el camino
          </h2>
          <p className={styles.curvaIntro}>
            Peso esperado de un perro de tamaño <strong>{etiquetasTamano[resultado.tamano].toLowerCase()}</strong> desde
            las 4 semanas hasta que deja de crecer, partiendo de los {formatNumber(resultado.pesoAdultoEstimado, 1)} kg
            adultos estimados. La banda alrededor de la línea es el mismo margen de ±15 % del rango probable.
          </p>

          <div className={styles.graficoWrap}>
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className={styles.grafico}
              role="img"
              aria-label={`Curva de crecimiento: de ${formatNumber(curva.puntos[0].peso, 1)} kg a las 4 semanas hasta ${formatNumber(resultado.pesoAdultoEstimado, 1)} kg a los ${formatNumber(curva.finSemanas / 4.33, 0)} meses. Los valores exactos están en la tabla siguiente.`}
            >
              {/* Retícula horizontal, deliberadamente tenue */}
              {grafico.ticksY.map((t) => (
                <g key={t.kg}>
                  <line
                    x1={M.left}
                    x2={VB_W - M.right}
                    y1={t.y}
                    y2={t.y}
                    className={styles.gridLine}
                  />
                  <text x={M.left - 8} y={t.y + 4} textAnchor="end" className={styles.ejeTexto}>
                    {formatNumber(t.kg, t.kg < 10 ? 1 : 0)}
                  </text>
                </g>
              ))}
              <text
                x={14}
                y={M.top + plotH / 2}
                textAnchor="middle"
                className={styles.ejeTitulo}
                transform={`rotate(-90 14 ${M.top + plotH / 2})`}
              >
                kg
              </text>

              {/* Banda de incertidumbre ±15 % */}
              <path d={grafico.banda} className={styles.banda} />

              {/* Peso adulto estimado */}
              <line
                x1={M.left}
                x2={VB_W - M.right}
                y1={grafico.yAdulto}
                y2={grafico.yAdulto}
                className={styles.lineaAdulto}
              />
              <text x={VB_W - M.right} y={grafico.yAdulto - 7} textAnchor="end" className={styles.etiquetaAdulto}>
                adulto ≈ {formatNumber(resultado.pesoAdultoEstimado, 1)} kg
              </text>

              {/* Curva */}
              <path d={grafico.linea} className={styles.lineaCurva} />

              {/* Hitos: eje X en meses */}
              {curva.hitos.map((h) => (
                <g key={h.semanas}>
                  <circle
                    cx={grafico.escalaX(h.semanas)}
                    cy={grafico.escalaY(h.peso)}
                    r={4.5}
                    className={styles.puntoHito}
                  >
                    <title>
                      {formatNumber(h.meses, 0)} meses: {formatNumber(h.peso, 1)} kg (
                      {formatNumber(h.porcentaje * 100, 0)} % de su peso adulto)
                    </title>
                  </circle>
                  <text
                    x={grafico.escalaX(h.semanas)}
                    y={VB_H - M.bottom + 18}
                    textAnchor="middle"
                    className={styles.ejeTexto}
                  >
                    {formatNumber(h.meses, 0)}
                  </text>
                </g>
              ))}
              <text x={VB_W - M.right} y={VB_H - 6} textAnchor="end" className={styles.ejeTitulo}>
                meses
              </text>

              {/* Tu cachorro, con anillo del color de la superficie para despegarlo de la línea */}
              <circle cx={grafico.cachorro.x} cy={grafico.cachorro.y} r={7} className={styles.puntoCachorro}>
                <title>
                  Tu cachorro: {formatNumber(resultado.peso, 1)} kg a las {formatNumber(resultado.edad, 0)} semanas
                </title>
              </circle>
              <text
                x={grafico.cachorro.x + (grafico.cachorro.x > VB_W * 0.65 ? -12 : 12)}
                y={grafico.cachorro.y - 12}
                textAnchor={grafico.cachorro.x > VB_W * 0.65 ? 'end' : 'start'}
                className={styles.etiquetaCachorro}
              >
                Tu cachorro · {formatNumber(resultado.peso, 1)} kg
              </text>
            </svg>
          </div>

          {/* La misma información en tabla: es la vista accesible del gráfico */}
          <div className={styles.tablaHitosWrap}>
            <table className={styles.tablaHitos}>
              <caption className={styles.tablaCaption}>Peso esperado en cada hito</caption>
              <thead>
                <tr>
                  <th scope="col">Edad</th>
                  <th scope="col">Peso esperado</th>
                  <th scope="col">% del adulto</th>
                </tr>
              </thead>
              <tbody>
                {curva.hitos.map((h) => (
                  <tr key={h.semanas} className={Math.abs(h.semanas - resultado.edad) < 2.2 ? styles.filaActual : undefined}>
                    <th scope="row">{formatNumber(h.meses, 0)} meses</th>
                    <td>{formatNumber(h.peso, 1)} kg</td>
                    <td>{formatNumber(h.porcentaje * 100, 0)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contraste con el peso típico de la categoría elegida */}
          {curva.coherencia === 'dentro' ? (
            <p className={styles.coherenciaOk}>
              <span aria-hidden="true">✅</span> La proyección encaja con la categoría{' '}
              <strong>{etiquetasTamano[resultado.tamano].toLowerCase()}</strong>, cuyo peso adulto habitual es{' '}
              {curva.rango.etiqueta}.
            </p>
          ) : (
            <p className={styles.coherenciaAviso} role="status">
              <span aria-hidden="true">⚠️</span> La proyección ({formatNumber(resultado.pesoAdultoEstimado, 1)} kg) queda{' '}
              {curva.coherencia === 'porEncima' ? 'por encima' : 'por debajo'} del peso adulto habitual de la categoría{' '}
              <strong>{etiquetasTamano[resultado.tamano].toLowerCase()}</strong> ({curva.rango.etiqueta}). Suele
              significar que la categoría elegida no es la que corresponde a la raza —prueba con la de al lado—; si estás
              seguro de ella, coméntalo en la siguiente revisión veterinaria.
            </p>
          )}
        </section>
      )}

      {/* Tabla de razas */}
      <div className={styles.razasContainer}>
        <h2>📋 Tabla de Razas de Referencia</h2>

        <div className={styles.filtrosRaza}>
          <button
            type="button"
            className={`${styles.filtroBtn} ${filtroRaza === 'todas' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('todas')}
            aria-pressed={filtroRaza === 'todas'}
          >
            Todas
          </button>
          <button
            type="button"
            className={`${styles.filtroBtn} ${filtroRaza === 'mini' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('mini')}
            aria-pressed={filtroRaza === 'mini'}
          >
            Mini
          </button>
          <button
            type="button"
            className={`${styles.filtroBtn} ${filtroRaza === 'pequeno' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('pequeno')}
            aria-pressed={filtroRaza === 'pequeno'}
          >
            Pequeño
          </button>
          <button
            type="button"
            className={`${styles.filtroBtn} ${filtroRaza === 'mediano' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('mediano')}
            aria-pressed={filtroRaza === 'mediano'}
          >
            Mediano
          </button>
          <button
            type="button"
            className={`${styles.filtroBtn} ${filtroRaza === 'grande' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('grande')}
            aria-pressed={filtroRaza === 'grande'}
          >
            Grande
          </button>
          <button
            type="button"
            className={`${styles.filtroBtn} ${filtroRaza === 'gigante' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('gigante')}
            aria-pressed={filtroRaza === 'gigante'}
          >
            Gigante
          </button>
        </div>

        <div className={styles.razasGrid}>
          {razasFiltradas.map((raza, index) => (
            <div key={index} className={`${styles.razaCard} ${styles[raza.tamano]}`}>
              <div className={styles.razaNombre}>{raza.nombre}</div>
              <div className={styles.razaInfo}>
                <span className={styles.razaPeso}>⚖️ {raza.pesoAdulto}</span>
                <span className={styles.razaMaduracion}>📅 {raza.maduracion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DisclaimerCard variant="medical" severity="high" collapsible={false} context="calculadora-tamano-adulto-perro">
        <p>Esta calculadora usa curvas de crecimiento promedio. <strong>Limitaciones:</strong></p>
        <ul className={styles.disclaimerList}>
          <li><strong>En mestizos la predicción es menos precisa</strong>: Depende de las razas parentales y su proporción genética</li>
          <li><strong>Factores individuales influyen</strong>: Alimentación, esterilización temprana, enfermedades y genética pueden alterar el crecimiento</li>
        </ul>
        <p className={styles.highlight}><strong>🐾 Solo orientativo. Consulta con tu veterinario sobre el desarrollo y peso ideal de tu cachorro.</strong></p>
      </DisclaimerCard>

      <RelatedApps
        apps={getRelatedApps('calculadora-tamano-adulto-perro')}
        title="Más herramientas para tu mascota"
        icon="🐾"
      />

      <EducationalSection
        title="¿Cómo crecen los cachorros?"
        subtitle="Información sobre las fases de crecimiento y factores que influyen"
      >
        <section className={styles.guideSection}>
          <h2>📈 Fases de Crecimiento</h2>
          <div className={styles.fasesGrid}>
            <div className={styles.faseCard}>
              <h4>🍼 Fase neonatal (0-2 semanas)</h4>
              <p>Los cachorros nacen ciegos y sordos. Dependen totalmente de la madre. Duplican su peso en la primera semana.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>👀 Fase de transición (2-4 semanas)</h4>
              <p>Abren los ojos y empiezan a oír. Comienzan a dar sus primeros pasos. Empiezan a interactuar con sus hermanos.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>🐕 Fase de socialización (4-12 semanas)</h4>
              <p>Período crítico para el desarrollo social. Empiezan a comer alimento sólido. Crecimiento muy rápido.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>💪 Fase juvenil (3-6 meses)</h4>
              <p>El crecimiento continúa fuerte. Cambio de dientes de leche a permanentes. Mucha energía y curiosidad.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>🎯 Adolescencia (6-18 meses)</h4>
              <p>El crecimiento se ralentiza gradualmente. Maduración sexual. Los perros grandes aún siguen creciendo.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>✨ Madurez (1-3 años)</h4>
              <p>Alcanzan su tamaño adulto completo. Los gigantes pueden seguir &quot;rellenando&quot; músculo hasta los 3 años.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes</h2>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Es cierto que puedo predecir el tamaño por las patas?</summary>
              <p>Es un mito parcial. Las patas grandes pueden indicar un perro grande, pero no es un método preciso. La genética y la raza son mejores indicadores.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Los mestizos crecen igual que las razas puras?</summary>
              <p>Los mestizos siguen patrones de crecimiento similares, pero con más variabilidad. Si conoces las razas parentales, puedes hacer mejor estimación promediando sus tamaños.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿La esterilización afecta al crecimiento?</summary>
              <p>Puede influir ligeramente. La esterilización temprana puede permitir que los huesos crezcan un poco más, resultando en perros ligeramente más altos pero no más pesados.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cómo sé qué tamaño de raza seleccionar?</summary>
              <p>Si conoces la raza, consulta la tabla. Para mestizos, estima según el tamaño de los padres si los conoces, o consulta con tu veterinario.</p>
            </details>
          </div>
        </section>

        {/* SECCIÓN 1 — Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>📊 Clasificación de Perros por Tamaño Adulto</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Peso adulto</th>
                  <th>Ejemplos de razas</th>
                  <th>Esp. de vida</th>
                  <th>Madurez</th>
                  <th>Cambio a adulto</th>
                  <th>Ejercicio diario</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Toy / Mini</strong></td>
                  <td>&lt; 4 kg</td>
                  <td>Chihuahua, Yorkshire, Pomerania</td>
                  <td>14-16 años</td>
                  <td>8-10 meses</td>
                  <td>9-10 meses</td>
                  <td>30 min</td>
                </tr>
                <tr>
                  <td><strong>Pequeño</strong></td>
                  <td>4-10 kg</td>
                  <td>Jack Russell, Shih Tzu, Bichón</td>
                  <td>12-15 años</td>
                  <td>10-12 meses</td>
                  <td>12 meses</td>
                  <td>45 min</td>
                </tr>
                <tr>
                  <td><strong>Mediano</strong></td>
                  <td>10-25 kg</td>
                  <td>Beagle, Border Collie, Cocker</td>
                  <td>10-13 años</td>
                  <td>12-15 meses</td>
                  <td>12-15 meses</td>
                  <td>60-90 min</td>
                </tr>
                <tr>
                  <td><strong>Grande</strong></td>
                  <td>25-45 kg</td>
                  <td>Labrador, Pastor Alemán, Golden</td>
                  <td>9-11 años</td>
                  <td>18-24 meses</td>
                  <td>15-18 meses</td>
                  <td>90-120 min</td>
                </tr>
                <tr>
                  <td><strong>Gigante</strong></td>
                  <td>&gt; 45 kg</td>
                  <td>Gran Danés, Mastín, San Bernardo</td>
                  <td>7-9 años</td>
                  <td>24-36 meses</td>
                  <td>18-24 meses</td>
                  <td>60-90 min*</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.faqTip}>* Los perros gigantes necesitan ejercicio moderado para proteger sus articulaciones durante el crecimiento.</p>
        </section>

        {/* SECCIÓN 2 — Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>👤 ¿Para quién es esta calculadora?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <strong>Adoptante con mestizo</strong>
              </div>
              <p className={styles.escenarioExample}>
                Has adoptado un cachorro mestizo de 3 meses y quieres saber si cabrá en tu piso de 60 m².
              </p>
              <p className={styles.escenarioTip}>
                Introduce su peso actual, selecciona el tamaño más probable según su morfología y obtén un rango estimado para planificar espacio y equipamiento.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🐾</span>
                <strong>Criador que evalúa una camada</strong>
              </div>
              <p className={styles.escenarioExample}>
                Tienes una camada de 8 semanas y quieres comprobar si el desarrollo de cada cachorro está dentro del rango esperado para la raza.
              </p>
              <p className={styles.escenarioTip}>
                Pesa a cada cachorro y compara con la estimación. Una desviación superior al 20% del rango puede indicar problemas de salud o nutrición.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🩺</span>
                <strong>Veterinario que ajusta dosis</strong>
              </div>
              <p className={styles.escenarioExample}>
                Necesitas calcular la dosis de un antiparasitario preventivo para un cachorro de 10 semanas en función de su peso adulto estimado.
              </p>
              <p className={styles.escenarioTip}>
                La calculadora proporciona el rango de peso adulto probable, útil para planificar protocolos de desparasitación y vacunación adaptados al tamaño final.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
                <strong>Familia que elige raza</strong>
              </div>
              <p className={styles.escenarioExample}>
                Estás entre un Labrador y un Cocker Spaniel y quieres entender la diferencia real de tamaño adulto y sus implicaciones prácticas.
              </p>
              <p className={styles.escenarioTip}>
                Consulta la tabla comparativa para ver diferencias en peso, esperanza de vida, ejercicio y momento de cambio de pienso antes de tomar la decisión.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3 — FAQ ampliada */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes (v2)</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿A qué edad deja de crecer un perro?</strong>
              <p>Depende del tamaño: los perros mini terminan de crecer hacia los 8-10 meses, los medianos hacia los 12-15 meses y los gigantes pueden no alcanzar su tamaño adulto completo hasta los 3 años.</p>
              <p className={styles.faqTip}>Regla práctica: cuanto mayor es el perro, más tarde madura.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo predigo el tamaño adulto de un mestizo?</strong>
              <p>Si conoces las razas parentales, promedia sus pesos adultos típicos. Si no las conoces, el tamaño de las patas y la morfología del cráneo dan pistas, aunque con menos precisión que la genética conocida.</p>
              <p className={styles.faqTip}>Un test de ADN canino puede identificar las razas predominantes y mejorar la estimación.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Influye la alimentación en el tamaño final?</strong>
              <p>La alimentación no puede hacer que un perro supere su potencial genético, pero una dieta deficiente sí puede impedir que lo alcance. La sobrealimentación en cachorros de razas grandes es especialmente perjudicial para el desarrollo óseo.</p>
              <p className={styles.faqTip}>El objetivo no es maximizar el crecimiento, sino que sea gradual y constante.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuándo cambiar de pienso junior a adulto?</strong>
              <p>Cuando el cachorro alcanza aproximadamente el 80-90% de su tamaño adulto estimado. Para razas mini, hacia los 9-10 meses; para razas grandes, entre los 15-18 meses; para gigantes, no antes de los 18-24 meses.</p>
              <p className={styles.faqTip}>Cambia de forma gradual (7-10 días mezclando ambos piensos) para evitar problemas digestivos.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Los perros grandes envejecen antes?</strong>
              <p>Sí. Los perros de razas gigantes tienen una esperanza de vida de 7-9 años frente a los 14-16 años de las razas toy. Se consideran geriátricos a partir de los 5-6 años, mientras que un chihuahua no entra en esa categoría hasta los 10-11 años.</p>
              <p className={styles.faqTip}>Esto tiene implicaciones directas en cuándo iniciar revisiones geriátricas y ajustar la dieta a &quot;senior&quot;.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué razas crecen más de lo esperado?</strong>
              <p>El Teckel puede variar entre 7-15 kg según su variedad (estándar o miniatura). El Husky Siberiano y el Malamute pueden confundirse en la etapa cachorro. Los mestizos con genes de razas gigantes a menudo sorprenden superando las expectativas iniciales.</p>
              <p className={styles.faqTip}>Si el cachorro supera el rango estimado, consulta con el veterinario para ajustar la alimentación.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo afecta la esterilización temprana al crecimiento?</strong>
              <p>La esterilización antes de la madurez sexual elimina las hormonas que señalizan el cierre de las placas de crecimiento. El resultado puede ser un perro ligeramente más alto pero con huesos menos densos, lo que aumenta el riesgo de displasia en razas grandes.</p>
              <p className={styles.faqTip}>En razas grandes y gigantes se recomienda esperar a que el perro haya alcanzado la madurez sexual antes de esterilizar.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuándo está un perro completamente desarrollado?</strong>
              <p>El desarrollo físico (tamaño) se completa antes que el desarrollo mental (comportamiento). Un Pastor Alemán puede tener tamaño adulto a los 18 meses pero seguir con comportamiento de cachorro hasta los 2-3 años. El desarrollo cognitivo completo se alcanza entre los 2-4 años según la raza.</p>
              <p className={styles.faqTip}>No confundas madurez física con madurez conductual: el adiestramiento debe adaptarse a ambas.</p>
            </li>
          </ul>
        </section>

        {/* SECCIÓN 4 — Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>🗺️ Cómo estimar el tamaño adulto y adaptar los cuidados</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Pesa al cachorro con precisión</strong>
                <p>Usa una báscula de cocina o pediátrica para cachorros pequeños (&lt; 5 kg). Para cachorros más grandes, pésate tú primero con el cachorro en brazos y luego solo, y resta la diferencia. Registra el peso junto con la fecha.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Determina la edad exacta en semanas</strong>
                <p>Si tienes la fecha de nacimiento, calcula las semanas exactas. Si es un mestizo adoptado sin historial, el veterinario puede estimar la edad por el estado de la dentición y el desarrollo general.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Selecciona la categoría de tamaño correcta</strong>
                <p>Si conoces la raza, consulta la tabla de razas de referencia. Para mestizos, usa el tamaño de los padres si los conoces, o la categoría que mejor se corresponda con la morfología actual (tamaño de cabeza, longitud de patas, anchura de tórax).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Interpreta el rango estimado</strong>
                <p>El resultado muestra un peso central estimado y un rango de ±15%. Considera el extremo superior si la raza tiene alta variabilidad genética o si el cachorro ya está en el percentil alto de su camada.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Ajusta la alimentación a la etapa actual</strong>
                <p>Usa el peso adulto estimado (no el actual) para calcular la ración diaria con pienso de cachorro. Esto evita la sobrealimentación en razas grandes, que puede provocar un crecimiento demasiado rápido y problemas articulares.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Planifica el ejercicio según el tamaño</strong>
                <p>Antes de los 12-18 meses (razas grandes) o 18-24 meses (gigantes), evita saltos, carreras largas y superficies duras. Las placas de crecimiento son cartilaginosas y vulnerables a lesiones por sobrecarga.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Haz un seguimiento mensual</strong>
                <p>Pesa al cachorro cada 2-4 semanas y recalcula la estimación. Una curva de crecimiento uniforme es señal de buen desarrollo. Crecimientos muy rápidos o estancamientos merecen consulta veterinaria.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5 — Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores Prácticas en el Seguimiento del Crecimiento</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <strong>Pesa con regularidad</strong>
              <p>Hasta los 4 meses, pesa al cachorro cada 2 semanas. Después, una vez al mes hasta alcanzar el tamaño adulto. Anota siempre el peso y la fecha para detectar cambios bruscos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍖</span>
              <strong>Alimenta según el peso adulto estimado</strong>
              <p>Los fabricantes de pienso indican las raciones en función del peso adulto previsto, no del peso actual. Usar el peso actual lleva a subalimentación o sobrealimentación según la etapa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏋️</span>
              <strong>Pienso específico para razas gigantes</strong>
              <p>Las razas de más de 45 kg necesitan pienso con niveles más bajos de calcio y fósforo que promueven un crecimiento más lento y controlado. El exceso de calcio en cachorros gigantes está asociado a displasia de cadera y codo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚶</span>
              <strong>Ejercicio proporcional a la edad</strong>
              <p>Una regla práctica: 5 minutos de ejercicio por mes de vida, dos veces al día, hasta la madurez física. Un cachorro de 4 meses soporta bien 20 minutos de paseo suave, pero no carreras ni saltos repetidos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>No adelantes el cambio a pienso adulto</strong>
              <p>El pienso de cachorro tiene más energía y nutrientes para el crecimiento activo. Cambiar demasiado pronto, especialmente en razas grandes, priva al perro de nutrientes clave justo cuando más los necesita.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🩺</span>
              <strong>Controles veterinarios cada 3-4 meses</strong>
              <p>Durante el crecimiento activo, las revisiones frecuentes permiten detectar problemas de desarrollo óseo, parasitosis que afecten a la absorción de nutrientes y ajustar el calendario de vacunaciones y desparasitaciones.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6 — Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes que afectan al desarrollo del cachorro</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Sobrealimentar pensando que &quot;engordará bien&quot;:</strong> Un cachorro gordo no es un cachorro sano. El exceso de peso durante el crecimiento ejerce presión sobre articulaciones y placas de crecimiento, aumentando el riesgo de displasia y osteoartritis prematura.
              </li>
              <li>
                <strong>Cambiar a pienso adulto demasiado pronto en razas grandes:</strong> Los cachorros de razas grandes y gigantes necesitan la formulación específica de cachorro durante más tiempo (hasta 15-24 meses). Un cambio prematuro puede resultar en déficits nutricionales en la fase de mayor demanda.
              </li>
              <li>
                <strong>Ejercicio excesivo en cachorros de razas gigantes antes de los 18 meses:</strong> Las placas de crecimiento (epífisis) no se cierran hasta los 18-24 meses en razas grandes y hasta los 36 meses en algunas gigantes. Correr en superficies duras, saltar vallas o hacer senderismo de larga distancia puede causar microfracturas y deformidades óseas permanentes.
              </li>
              <li>
                <strong>No ajustar la ración cuando alcanza el peso adulto:</strong> Una vez que el perro deja de crecer, sus necesidades calóricas disminuyen. Mantener la ración de cachorro lleva a obesidad. La transición a pienso adulto debe ir acompañada de una reducción de la cantidad diaria.
              </li>
              <li>
                <strong>Usar la misma tabla de referencia para mestizos que para razas puras:</strong> Los mestizos tienen mayor variabilidad genética. Una estimación de tamaño basada únicamente en el peso a las 8 semanas puede tener un margen de error del 30-40% en mestizos frente al 10-15% en razas puras.
              </li>
              <li>
                <strong>Ignorar un crecimiento asimétrico:</strong> Si un cachorro crece de forma desigual (una pata más que otra, un lado del cuerpo más desarrollado), no lo atribuyas a &quot;la postura&quot;. Puede ser señal de displasia, luxación de rótula o deformidades angulares que requieren intervención temprana.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <ShareCard appName="calculadora-tamano-adulto-perro" />
      <Footer appName="calculadora-tamano-adulto-perro" />
    </div>
  );
}
