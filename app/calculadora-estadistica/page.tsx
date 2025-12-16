'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraEstadistica.module.css';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

export default function CalculadoraEstadisticaPage() {
  const [datos, setDatos] = useState('');
  const [historial, setHistorial] = useState<string[]>([]);

  const valores = useMemo(() => {
    if (!datos.trim()) return [];
    // Acepta separadores: coma, punto y coma, espacio, salto de línea
    return datos
      .split(/[,;\s\n]+/)
      .map(v => parseFloat(v.replace(',', '.')))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b);
  }, [datos]);

  const estadisticas = useMemo(() => {
    if (valores.length === 0) return null;

    const n = valores.length;
    const suma = valores.reduce((a, b) => a + b, 0);
    const media = suma / n;

    // Mediana
    const mediana = n % 2 === 0
      ? (valores[n / 2 - 1] + valores[n / 2]) / 2
      : valores[Math.floor(n / 2)];

    // Moda
    const frecuencias: Record<number, number> = {};
    valores.forEach(v => { frecuencias[v] = (frecuencias[v] || 0) + 1; });
    const maxFrec = Math.max(...Object.values(frecuencias));
    const modas = Object.entries(frecuencias)
      .filter(([, f]) => f === maxFrec && f > 1)
      .map(([v]) => parseFloat(v));

    // Varianza y Desviación Estándar (muestral)
    const varianzaMuestral = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1);
    const desviacionMuestral = Math.sqrt(varianzaMuestral);

    // Varianza y Desviación Estándar (poblacional)
    const varianzaPoblacional = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / n;
    const desviacionPoblacional = Math.sqrt(varianzaPoblacional);

    // Rango
    const minimo = valores[0];
    const maximo = valores[n - 1];
    const rango = maximo - minimo;

    // Cuartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = valores[q1Index];
    const q3 = valores[q3Index];
    const iqr = q3 - q1;

    // Coeficiente de variación
    const coefVariacion = (desviacionMuestral / media) * 100;

    // Error estándar
    const errorEstandar = desviacionMuestral / Math.sqrt(n);

    // Suma de cuadrados
    const sumaCuadrados = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0);

    return {
      n,
      suma,
      media,
      mediana,
      modas,
      maxFrec,
      varianzaMuestral,
      varianzaPoblacional,
      desviacionMuestral,
      desviacionPoblacional,
      minimo,
      maximo,
      rango,
      q1,
      q3,
      iqr,
      coefVariacion,
      errorEstandar,
      sumaCuadrados
    };
  }, [valores]);

  const cargarEjemplo = (tipo: string) => {
    const ejemplos: Record<string, string> = {
      notas: '5, 7, 8, 6, 9, 7, 8, 6, 7, 8, 9, 5, 6, 7, 8',
      edades: '25, 30, 35, 28, 42, 38, 29, 33, 45, 27, 31, 36, 40, 32, 29',
      temperaturas: '15.5, 18.2, 20.1, 17.8, 22.5, 19.3, 21.0, 16.7, 23.1, 18.9',
      precios: '12.99, 15.50, 9.99, 18.75, 11.25, 14.00, 16.50, 10.99, 13.75, 17.25'
    };
    setDatos(ejemplos[tipo] || '');
  };

  const guardarEnHistorial = () => {
    if (datos.trim() && !historial.includes(datos)) {
      setHistorial(prev => [...prev.slice(-4), datos]);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📊 Calculadora Estadística</h1>
        <p className={styles.subtitle}>
          Análisis estadístico completo: media, mediana, moda, varianza, desviación y más
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>Datos</h2>

          <div className={styles.ejemplosRow}>
            <span>Ejemplos:</span>
            <button onClick={() => cargarEjemplo('notas')} className={styles.btnEjemplo}>
              Notas
            </button>
            <button onClick={() => cargarEjemplo('edades')} className={styles.btnEjemplo}>
              Edades
            </button>
            <button onClick={() => cargarEjemplo('temperaturas')} className={styles.btnEjemplo}>
              Temperaturas
            </button>
            <button onClick={() => cargarEjemplo('precios')} className={styles.btnEjemplo}>
              Precios
            </button>
          </div>

          <textarea
            className={styles.textareaDatos}
            value={datos}
            onChange={(e) => setDatos(e.target.value)}
            placeholder="Introduce los datos separados por comas, espacios o saltos de línea...

Ejemplo: 5, 7, 8, 6, 9, 7, 8"
            rows={6}
          />

          <div className={styles.datosInfo}>
            <span>Valores detectados: <strong>{valores.length}</strong></span>
            {valores.length > 0 && (
              <span>Ordenados: {valores.slice(0, 5).map(v => formatNumber(v, 2)).join(', ')}{valores.length > 5 ? '...' : ''}</span>
            )}
          </div>

          <div className={styles.btnRow}>
            <button onClick={() => setDatos('')} className={styles.btnSecundario}>
              Limpiar
            </button>
            <button onClick={guardarEnHistorial} className={styles.btnPrimario}>
              Guardar en Historial
            </button>
          </div>

          {historial.length > 0 && (
            <div className={styles.historialSection}>
              <h3>Historial</h3>
              <div className={styles.historialLista}>
                {historial.map((h, i) => (
                  <button
                    key={i}
                    className={styles.historialItem}
                    onClick={() => setDatos(h)}
                  >
                    {h.substring(0, 30)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!estadisticas ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📈</span>
              <p>Introduce datos para ver el análisis estadístico</p>
            </div>
          ) : (
            <>
              <div className={styles.statsCategory}>
                <h3>Medidas de Tendencia Central</h3>
                <div className={styles.resultsGrid}>
                  <ResultCard
                    title="Media (Promedio)"
                    value={formatNumber(estadisticas.media, 4)}
                    variant="highlight"
                    icon="📊"
                  />
                  <ResultCard
                    title="Mediana"
                    value={formatNumber(estadisticas.mediana, 4)}
                    variant="info"
                    icon="📍"
                  />
                  <ResultCard
                    title="Moda"
                    value={estadisticas.modas.length > 0
                      ? estadisticas.modas.map(m => formatNumber(m, 2)).join(', ')
                      : 'Sin moda'}
                    variant="default"
                    icon="🎯"
                    description={estadisticas.modas.length > 0 ? `Frecuencia: ${estadisticas.maxFrec}` : 'Todos los valores son únicos'}
                  />
                </div>
              </div>

              <div className={styles.statsCategory}>
                <h3>Medidas de Dispersión</h3>
                <div className={styles.resultsGrid}>
                  <ResultCard
                    title="Desviación Estándar (s)"
                    value={formatNumber(estadisticas.desviacionMuestral, 4)}
                    variant="highlight"
                    icon="📉"
                    description="Muestral"
                  />
                  <ResultCard
                    title="Varianza (s²)"
                    value={formatNumber(estadisticas.varianzaMuestral, 4)}
                    variant="default"
                    icon="📐"
                    description="Muestral"
                  />
                  <ResultCard
                    title="Rango"
                    value={formatNumber(estadisticas.rango, 4)}
                    variant="default"
                    icon="↔️"
                    description={`${formatNumber(estadisticas.minimo, 2)} - ${formatNumber(estadisticas.maximo, 2)}`}
                  />
                  <ResultCard
                    title="Coef. Variación"
                    value={formatNumber(estadisticas.coefVariacion, 2)}
                    unit="%"
                    variant="info"
                    icon="📊"
                  />
                </div>
              </div>

              <div className={styles.statsCategory}>
                <h3>Cuartiles y Percentiles</h3>
                <div className={styles.resultsGrid}>
                  <ResultCard
                    title="Q1 (25%)"
                    value={formatNumber(estadisticas.q1, 4)}
                    variant="default"
                    icon="📊"
                  />
                  <ResultCard
                    title="Q2 (50%)"
                    value={formatNumber(estadisticas.mediana, 4)}
                    variant="default"
                    icon="📊"
                  />
                  <ResultCard
                    title="Q3 (75%)"
                    value={formatNumber(estadisticas.q3, 4)}
                    variant="default"
                    icon="📊"
                  />
                  <ResultCard
                    title="IQR (Rango Intercuartil)"
                    value={formatNumber(estadisticas.iqr, 4)}
                    variant="info"
                    icon="📏"
                    description="Q3 - Q1"
                  />
                </div>
              </div>

              <div className={styles.statsCategory}>
                <h3>Datos Adicionales</h3>
                <div className={styles.resultsGrid}>
                  <ResultCard
                    title="n (Tamaño muestra)"
                    value={estadisticas.n.toString()}
                    variant="default"
                    icon="📋"
                  />
                  <ResultCard
                    title="Suma total"
                    value={formatNumber(estadisticas.suma, 4)}
                    variant="default"
                    icon="➕"
                  />
                  <ResultCard
                    title="Error Estándar"
                    value={formatNumber(estadisticas.errorEstandar, 6)}
                    variant="default"
                    icon="⚠️"
                    description="s / √n"
                  />
                  <ResultCard
                    title="Suma de Cuadrados"
                    value={formatNumber(estadisticas.sumaCuadrados, 4)}
                    variant="default"
                    icon="²"
                    description="Σ(x - x̄)²"
                  />
                </div>
              </div>

              <div className={styles.tablaDatos}>
                <h3>Resumen de Datos</h3>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Estadístico</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Mínimo</td><td>{formatNumber(estadisticas.minimo, 4)}</td></tr>
                    <tr><td>Máximo</td><td>{formatNumber(estadisticas.maximo, 4)}</td></tr>
                    <tr><td>Media</td><td>{formatNumber(estadisticas.media, 4)}</td></tr>
                    <tr><td>Mediana</td><td>{formatNumber(estadisticas.mediana, 4)}</td></tr>
                    <tr><td>Desv. Est. (muestral)</td><td>{formatNumber(estadisticas.desviacionMuestral, 4)}</td></tr>
                    <tr><td>Desv. Est. (poblacional)</td><td>{formatNumber(estadisticas.desviacionPoblacional, 4)}</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Estadística Descriptiva?"
        subtitle="Descubre conceptos clave, fórmulas y cuándo usar cada medida"
      >
        <section className={styles.guideSection}>
          <h2>Estadística Descriptiva: Conceptos Fundamentales</h2>
          <p className={styles.introParagraph}>
            La estadística descriptiva nos permite resumir y describir las características principales
            de un conjunto de datos mediante medidas numéricas y representaciones gráficas.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Media Aritmética</h4>
              <p>
                Suma de todos los valores dividida por el número de datos: x̄ = Σx / n.
                Es sensible a valores extremos (outliers).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Mediana</h4>
              <p>
                Valor central cuando los datos están ordenados. Más robusta que la media
                ante valores extremos. Ideal para distribuciones asimétricas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Moda</h4>
              <p>
                Valor más frecuente en el conjunto de datos. Puede haber varias modas
                (bimodal, multimodal) o ninguna si todos los valores son únicos.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Desviación Estándar</h4>
              <p>
                Mide la dispersión de los datos respecto a la media. A mayor desviación,
                más dispersos están los datos. Es la raíz cuadrada de la varianza.
              </p>
            </div>
          </div>

          <h3>¿Muestral vs Poblacional?</h3>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Estadísticos Muestrales</h4>
              <p>
                Se dividen por (n-1) para corregir el sesgo. Usamos estos cuando
                trabajamos con una muestra de una población mayor.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Estadísticos Poblacionales</h4>
              <p>
                Se dividen por n. Usamos estos cuando tenemos todos los datos
                de la población completa.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-estadistica')} />

      <Footer appName="calculadora-estadistica" />
    </div>
  );
}
