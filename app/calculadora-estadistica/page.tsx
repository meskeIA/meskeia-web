'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraEstadistica.module.css';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice lastUpdated="2026-02-02" />

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


      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="calculadora-estadistica">
        <p>Esta calculadora es una <strong>herramienta educativa</strong> para estadística descriptiva:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Verifica resultados en trabajos académicos</strong>: Especialmente en investigaciones o estudios que requieran precisión estadística</li>
          <li><strong>Consulta con tu profesor o estadístico</strong>: Para análisis complejos o interpretación de resultados en contextos profesionales</li>
        </ul>
      </DisclaimerCard>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Estadística Descriptiva?"
        subtitle="Descubre conceptos clave, fórmulas y cuándo usar cada medida"
      >
        {/* Conceptos Fundamentales */}
        <section className={styles.guideSection}>
          <h2>Medidas Estadísticas: Resumen Comparativo</h2>
          <p className={styles.introParagraph}>
            La estadística descriptiva organiza sus medidas en tres grandes grupos. Conocer cuándo
            aplicar cada una es clave para interpretar correctamente tus datos.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 Media Aritmética (x̄)</h4>
              <p>
                Suma de todos los valores dividida por n: x̄ = Σx / n.
                Intuitiva y fácil de calcular, pero sensible a valores extremos (outliers).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📍 Mediana</h4>
              <p>
                Valor central al ordenar los datos. Más robusta que la media ante outliers.
                Ideal para distribuciones asimétricas (salarios, precios inmobiliarios).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎯 Moda</h4>
              <p>
                Valor más frecuente. Puede haber varias modas (bimodal, multimodal)
                o ninguna si todos los valores son únicos.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📉 Desviación Estándar (s / σ)</h4>
              <p>
                Mide la dispersión de los datos respecto a la media. Es la raíz cuadrada
                de la varianza. Versión muestral (s) divide por n-1; poblacional (σ) por n.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📏 Rango Intercuartil (IQR)</h4>
              <p>
                Diferencia entre Q3 y Q1. Representa el 50% central de los datos.
                Es robusto ante outliers y se usa para detectar valores atípicos.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📐 Coeficiente de Variación (CV)</h4>
              <p>
                Desviación estándar expresada como porcentaje de la media: CV = (s / x̄) × 100.
                Permite comparar la dispersión relativa entre conjuntos de distinta escala.
              </p>
            </div>
          </div>
        </section>

        {/* Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa: ¿Qué medida usar?</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Medida</th>
                  <th>Categoría</th>
                  <th>Fórmula</th>
                  <th>Cuándo usarla</th>
                  <th>Limitación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Media</strong></td>
                  <td>Tendencia central</td>
                  <td>Σx / n</td>
                  <td>Datos simétricos sin outliers</td>
                  <td>Muy sensible a valores extremos</td>
                </tr>
                <tr>
                  <td><strong>Mediana</strong></td>
                  <td>Tendencia central</td>
                  <td>Valor central ordenado</td>
                  <td>Datos asimétricos o con outliers</td>
                  <td>No usa todos los valores</td>
                </tr>
                <tr>
                  <td><strong>Moda</strong></td>
                  <td>Tendencia central</td>
                  <td>Valor más frecuente</td>
                  <td>Datos categóricos o discretos</td>
                  <td>Puede no existir o haber varias</td>
                </tr>
                <tr>
                  <td><strong>Desv. Estándar</strong></td>
                  <td>Dispersión</td>
                  <td>√[Σ(x-x̄)² / (n-1)]</td>
                  <td>Cuantificar variabilidad</td>
                  <td>Misma unidad que los datos</td>
                </tr>
                <tr>
                  <td><strong>Varianza</strong></td>
                  <td>Dispersión</td>
                  <td>Σ(x-x̄)² / (n-1)</td>
                  <td>Base para otros cálculos</td>
                  <td>Unidades al cuadrado (difícil interpretar)</td>
                </tr>
                <tr>
                  <td><strong>IQR</strong></td>
                  <td>Dispersión</td>
                  <td>Q3 − Q1</td>
                  <td>Datos con outliers</td>
                  <td>No considera datos extremos</td>
                </tr>
                <tr>
                  <td><strong>Coef. Variación</strong></td>
                  <td>Dispersión relativa</td>
                  <td>(s / x̄) × 100%</td>
                  <td>Comparar grupos distintos</td>
                  <td>No válido si la media ≈ 0</td>
                </tr>
                <tr>
                  <td><strong>Cuartiles (Q1, Q3)</strong></td>
                  <td>Posición</td>
                  <td>Percentiles 25 y 75</td>
                  <td>Análisis de distribución</td>
                  <td>Sensibles al tamaño muestral pequeño</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>¿Para qué se usa la estadística descriptiva?</h2>
          <p className={styles.introParagraph}>
            La estadística descriptiva es una herramienta fundamental en múltiples disciplinas.
            Aquí algunos perfiles que la usan a diario:
          </p>
          <div className={styles.casosUsoGrid}>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon}>🎓</span>
              <div className={styles.casoTitle}>Estudiante</div>
              <div className={styles.casoSubtitle}>Bachillerato / Universidad</div>
              <p className={styles.casoDesc}>
                Analizar notas de clase, calcular la media del grupo, comparar la variabilidad
                entre asignaturas o verificar ejercicios de estadística.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon}>🔬</span>
              <div className={styles.casoTitle}>Investigador</div>
              <div className={styles.casoSubtitle}>Ciencias sociales / Salud</div>
              <p className={styles.casoDesc}>
                Describir los resultados de una encuesta o ensayo clínico: media de edades,
                desviación de respuestas, distribución de variables clínicas.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon}>📈</span>
              <div className={styles.casoTitle}>Analista de negocio</div>
              <div className={styles.casoSubtitle}>Empresa / Finanzas</div>
              <p className={styles.casoDesc}>
                Analizar KPIs de ventas, rendimiento de equipos, variabilidad en tiempos
                de entrega o márgenes de beneficio por producto.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon}>📐</span>
              <div className={styles.casoTitle}>Profesor de estadística</div>
              <div className={styles.casoSubtitle}>Educación</div>
              <p className={styles.casoDesc}>
                Preparar ejemplos didácticos, verificar soluciones de ejercicios y
                explicar el significado de cada estadístico con datos reales.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Estadística Descriptiva</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la diferencia entre media y mediana?</div>
              <div className={styles.faqRespuesta}>
                La <strong>media</strong> suma todos los valores y divide por n — es sensible a outliers. La <strong>mediana</strong>
                es el valor central al ordenar los datos — es robusta ante valores extremos. Si el sueldo medio es muy
                superior al mediano, hay pocos salarios muy altos que elevan la media. En esos casos, la mediana
                describe mejor la situación &quot;típica&quot;.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es un valor atípico (outlier) y cómo afecta?</div>
              <div className={styles.faqRespuesta}>
                Un <strong>outlier</strong> es un valor muy alejado del resto del conjunto. Se detecta con la regla IQR:
                son outliers los valores menores que Q1 − 1.5×IQR o mayores que Q3 + 1.5×IQR. Los outliers
                distorsionan la media y la desviación estándar, pero apenas afectan a la mediana y al IQR.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuándo usar la desviación muestral (s) y cuándo la poblacional (σ)?</div>
              <div className={styles.faqRespuesta}>
                Usa la <strong>muestral (s)</strong> cuando tienes una muestra y quieres inferir sobre una población mayor
                (divide por n-1, corrección de Bessel). Usa la <strong>poblacional (σ)</strong> cuando tienes todos los datos
                de la población completa (divide por n). En la práctica, casi siempre se trabaja con muestras,
                por lo que s es la más habitual.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué mide el coeficiente de variación (CV) y para qué sirve?</div>
              <div className={styles.faqRespuesta}>
                El <strong>CV = (s / x̄) × 100%</strong> expresa la desviación estándar como porcentaje de la media.
                Permite comparar la variabilidad de conjuntos con distintas escalas o unidades. Por ejemplo,
                si el sueldo tiene CV=20% y las temperaturas CV=5%, los sueldos son relativamente más variables.
                No es válido cuando la media es 0 o negativa.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué son los cuartiles y el rango intercuartil (IQR)?</div>
              <div className={styles.faqRespuesta}>
                Los <strong>cuartiles</strong> dividen los datos ordenados en cuatro partes iguales: Q1 (25%), Q2/mediana (50%)
                y Q3 (75%). El <strong>IQR = Q3 − Q1</strong> contiene el 50% central de los datos. Es una medida de
                dispersión robusta, muy utilizada en diagramas de caja (boxplots) y para detectar outliers.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es el error estándar y cómo se interpreta?</div>
              <div className={styles.faqRespuesta}>
                El <strong>error estándar (SE) = s / √n</strong> mide la precisión de la media muestral como estimador
                de la media poblacional. Cuanto mayor sea n (tamaño muestral), menor será el error estándar
                y más fiable será la estimación. Se usa para construir intervalos de confianza.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuándo tiene sentido calcular la moda?</div>
              <div className={styles.faqRespuesta}>
                La <strong>moda</strong> tiene más sentido con datos discretos o categóricos (talla más vendida, nota
                más frecuente, respuesta más común en una encuesta). En datos continuos con muchos decimales,
                casi nunca hay repeticiones, por lo que la moda carece de significado práctico.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué indica la suma de cuadrados Σ(x − x̄)²?</div>
              <div className={styles.faqRespuesta}>
                La <strong>suma de cuadrados</strong> mide la dispersión total de los datos respecto a la media.
                Es la base para calcular la varianza (dividiendo por n o n-1). También se usa en ANOVA
                y regresión lineal para descomponer la variabilidad total en partes explicadas y no explicadas.
              </div>
            </li>
          </ul>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Guía para analizar un conjunto de datos (6 pasos)</h2>
          <ol className={styles.pasosList}>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>1</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Recopilar y limpiar los datos</div>
                <p className={styles.pasoDesc}>
                  Introduce todos los valores. Detecta y decide cómo tratar los datos faltantes
                  o claramente erróneos antes de calcular cualquier estadístico.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>2</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Calcular medidas de tendencia central</div>
                <p className={styles.pasoDesc}>
                  Calcula la media, mediana y moda. Compáralas: si media ≠ mediana, hay asimetría
                  o posibles outliers. Elige la más representativa según el contexto.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>3</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Analizar la dispersión</div>
                <p className={styles.pasoDesc}>
                  Calcula la desviación estándar y la varianza. Con datos asimétricos o outliers,
                  usa el IQR en su lugar. Un CV alto (&gt;30%) indica alta variabilidad relativa.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>4</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Examinar los cuartiles y detectar outliers</div>
                <p className={styles.pasoDesc}>
                  Calcula Q1, Q2 y Q3. Usa la regla IQR para identificar valores atípicos:
                  outlier si x &lt; Q1 − 1.5×IQR o x &gt; Q3 + 1.5×IQR.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>5</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Evaluar la forma de la distribución</div>
                <p className={styles.pasoDesc}>
                  Compara media y mediana para estimar la asimetría (skewness).
                  Si media &gt; mediana, distribución sesgada a la derecha; si media &lt; mediana, a la izquierda.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>6</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Interpretar y comunicar los resultados</div>
                <p className={styles.pasoDesc}>
                  No presentes solo números: contextualiza cada estadístico. Especifica si usas
                  estadísticos muestrales o poblacionales y el tamaño de la muestra (n).
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Tips y Errores */}
        <section className={styles.guideSection}>
          <h2>Tips y errores frecuentes</h2>
          <div className={styles.tipsErrorsSection}>
            <div className={styles.tipsColumn}>
              <div className={styles.tipsHeader}>✓ Buenas prácticas</div>
              <div className={styles.tipItem}>Usa la mediana con datos asimétricos o cuando haya outliers.</div>
              <div className={styles.tipItem}>Especifica siempre si el estadístico es muestral (s) o poblacional (σ).</div>
              <div className={styles.tipItem}>Compara media y mediana para detectar asimetría antes de elegir.</div>
              <div className={styles.tipItem}>Usa el CV para comparar datasets de distinta escala o unidad.</div>
              <div className={styles.tipItem}>Reporta el tamaño muestral (n) junto a cualquier estadístico.</div>
              <div className={styles.tipItem}>Usa el IQR para detectar outliers en lugar del rango bruto.</div>
            </div>
            <div className={styles.errorsColumn}>
              <div className={styles.errorsHeader}>✗ Errores comunes</div>
              <div className={styles.errorItem}>Confundir la desviación muestral (s) con la poblacional (σ).</div>
              <div className={styles.errorItem}>Usar la media con datos muy asimétricos o con outliers extremos.</div>
              <div className={styles.errorItem}>Calcular la moda cuando todos los valores son únicos (no existe).</div>
              <div className={styles.errorItem}>Interpretar una desviación estándar alta como &quot;malo&quot; sin contexto.</div>
              <div className={styles.errorItem}>Sacar conclusiones estadísticas con muestras muy pequeñas (n &lt; 10).</div>
              <div className={styles.errorItem}>Ignorar los outliers en lugar de investigar su origen y decidir cómo tratarlos.</div>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-estadistica')} />

      <ShareCard appName="calculadora-estadistica" />
      <Footer appName="calculadora-estadistica" />
    </div>
  );
}
