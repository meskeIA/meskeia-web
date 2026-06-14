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

        {/* SECCIÓN 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa de Medidas Estadísticas</h2>
          <p className={styles.introParagraph}>
            Cada medida estadística responde a una pregunta diferente. Esta tabla compara las
            principales medidas de tendencia central y dispersión con ejemplos numéricos reales
            usando el conjunto de datos: <strong>salarios mensuales (€): 1.200, 1.400, 1.400, 1.600, 1.800, 1.800, 1.800, 2.100, 2.500, 8.000</strong>.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Medida</th>
                  <th>Definición</th>
                  <th>Fórmula</th>
                  <th>Cuándo usar</th>
                  <th>Sensibilidad outliers</th>
                  <th>Ejemplo (salarios)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Media</strong></td>
                  <td>Promedio aritmético de todos los valores</td>
                  <td>x̄ = Σx / n</td>
                  <td>Datos simétricos sin valores extremos</td>
                  <td><span className={styles.sensibilidadAlta}>Alta</span></td>
                  <td>2.360 € (distorsionada por 8.000 €)</td>
                </tr>
                <tr>
                  <td><strong>Mediana</strong></td>
                  <td>Valor central al ordenar los datos</td>
                  <td>Valor en posición (n+1)/2</td>
                  <td>Datos asimétricos, ingresos, precios</td>
                  <td><span className={styles.sensibilidadBaja}>Baja</span></td>
                  <td>1.800 € (representa mejor al trabajador típico)</td>
                </tr>
                <tr>
                  <td><strong>Moda</strong></td>
                  <td>Valor que aparece con mayor frecuencia</td>
                  <td>argmax(frecuencia)</td>
                  <td>Datos discretos o categóricos</td>
                  <td><span className={styles.sensibilidadBaja}>Baja</span></td>
                  <td>1.800 € (aparece 3 veces)</td>
                </tr>
                <tr>
                  <td><strong>Varianza (s²)</strong></td>
                  <td>Promedio de desviaciones al cuadrado respecto a la media</td>
                  <td>Σ(x−x̄)² / (n−1)</td>
                  <td>Base para otros cálculos estadísticos</td>
                  <td><span className={styles.sensibilidadAlta}>Alta</span></td>
                  <td>4.067.111 €² (unidades al cuadrado, difícil de interpretar)</td>
                </tr>
                <tr>
                  <td><strong>Desv. Estándar (s)</strong></td>
                  <td>Raíz cuadrada de la varianza; dispersión en las mismas unidades que los datos</td>
                  <td>√[Σ(x−x̄)² / (n−1)]</td>
                  <td>Cuantificar variabilidad; reportar junto a la media</td>
                  <td><span className={styles.sensibilidadAlta}>Alta</span></td>
                  <td>2.016,71 € — indica dispersión muy elevada</td>
                </tr>
                <tr>
                  <td><strong>Rango</strong></td>
                  <td>Diferencia entre el valor máximo y el mínimo</td>
                  <td>máx − mín</td>
                  <td>Primera inspección rápida de la amplitud</td>
                  <td><span className={styles.sensibilidadAlta}>Muy alta</span></td>
                  <td>6.800 € (de 1.200 € a 8.000 €)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso Reales: 4 Perfiles</h2>
          <p className={styles.introParagraph}>
            La estadística descriptiva se aplica en contextos muy distintos. Estos cuatro perfiles
            muestran cómo las mismas herramientas resuelven problemas reales y concretos.
          </p>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <div>
                  <strong>Estudiante de Bachillerato</strong>
                  <div className={styles.escenarioSubtitle}>Análisis de encuesta de clase</div>
                </div>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Ha encuestado a 25 compañeros sobre horas de estudio semanales:
                2, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 10, 10, 11, 12, 14, 15, 15, 18, 20, 22, 30.
                Media = 10,4 h, mediana = 8 h.
              </p>
              <p className={styles.escenarioTip}>
                La mediana (8 h) describe mejor al estudiante típico; la media sube por los valores extremos (22, 30 h).
                La desviación estándar de 6,8 h indica alta variabilidad entre compañeros.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👥</span>
                <div>
                  <strong>Analista de RRHH</strong>
                  <div className={styles.escenarioSubtitle}>Comparación de salarios por departamento</div>
                </div>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Salarios del departamento de ventas (n=8): 1.800, 1.900, 2.000, 2.100, 2.200, 2.300, 2.400, 5.500 €.
                Media = 2.525 €, mediana = 2.150 €, desv. típica = 1.182 €, CV = 46,8%.
              </p>
              <p className={styles.escenarioTip}>
                El CV de 46,8% alerta sobre alta desigualdad interna. El salario del director (5.500 €) infla la media;
                la mediana de 2.150 € es el indicador justo para negociación colectiva.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏥</span>
                <div>
                  <strong>Médico Investigador</strong>
                  <div className={styles.escenarioSubtitle}>Interpretación de ensayo clínico</div>
                </div>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Reducción de presión arterial (mmHg) en 10 pacientes tras tratamiento:
                8, 10, 12, 12, 14, 14, 15, 16, 18, 21. Media = 14,0, mediana = 14,0, desv. típica = 3,62, error estándar = 1,14.
              </p>
              <p className={styles.escenarioTip}>
                La coincidencia de media y mediana indica distribución simétrica — buena señal de normalidad.
                El error estándar de 1,14 permite construir un intervalo de confianza del 95%: 14,0 ± 2,3 mmHg.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛍️</span>
                <div>
                  <strong>Comercio Local</strong>
                  <div className={styles.escenarioSubtitle}>Análisis de ventas mensuales</div>
                </div>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Ventas diarias en euros durante enero (n=31): media = 847 €,
                mediana = 720 €, moda = 680 € (10 días), desv. típica = 312 €, máximo = 2.100 € (reyes).
              </p>
              <p className={styles.escenarioTip}>
                La moda de 680 € marca el nivel de ventas habitual. La desviación de 312 € indica variabilidad
                manejable. El máximo de 2.100 € es un outlier (Reyes Magos) que no debe usarse para proyecciones.
              </p>
            </div>

          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Estadística Descriptiva</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuándo es mejor usar la mediana que la media?</div>
              <div className={styles.faqRespuesta}>
                Usa la <strong>mediana</strong> cuando los datos están sesgados o contienen outliers. Ejemplo clásico:
                si 9 personas ganan 1.500 € y 1 gana 15.000 €, la media es 3.000 € pero la mediana es 1.500 €.
                La mediana describe mejor la realidad de las 9 personas. Regla práctica: si media &gt; mediana en más
                de un 10%, usa la mediana como medida de centro.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué significa una desviación típica alta?</div>
              <div className={styles.faqRespuesta}>
                Una <strong>desviación típica alta</strong> significa que los datos están muy dispersos respecto a la media.
                Por ejemplo, si la temperatura media de una ciudad es 15 °C con s=2 °C, casi todos los días
                están entre 13 y 17 °C. Pero con s=8 °C, hay días de 7 °C y días de 23 °C. El <strong>coeficiente de
                variación</strong> (CV = s/media × 100) es más útil que s en solitario: CV &lt; 15% = baja variabilidad,
                CV 15-30% = moderada, CV &gt; 30% = alta.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo identificar outliers con la regla IQR?</div>
              <div className={styles.faqRespuesta}>
                Calcula Q1 y Q3. Un dato es <strong>outlier leve</strong> si está fuera de [Q1 − 1,5·IQR, Q3 + 1,5·IQR]
                y <strong>outlier extremo</strong> si supera [Q1 − 3·IQR, Q3 + 3·IQR]. Ejemplo: notas del grupo Q1=5, Q3=8, IQR=3.
                Límites = [5 − 4,5, 8 + 4,5] = [0,5, 12,5]. En notas de 0-10 no hay outliers. Si hubiera un 0,2 o un
                10,0 repetido en otro contexto, sería sospechoso. Siempre investiga el origen antes de eliminar un dato.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es el coeficiente de variación y cuándo se usa?</div>
              <div className={styles.faqRespuesta}>
                El <strong>CV = (s / x̄) × 100%</strong> es la desviación típica expresada como porcentaje de la media.
                Permite comparar la variabilidad de series con distintas unidades o escalas. Ejemplo: comparas dos
                inversiones — Fondo A (media 1.000 €, s=50 €, CV=5%) vs Fondo B (media 50.000 €, s=3.000 €, CV=6%).
                Aunque s del Fondo B es mayor, ambos tienen variabilidad relativa similar. No es válido si la
                media es 0 o negativa (como temperaturas en °C que cruzan el 0).
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Diferencia entre varianza poblacional y muestral?</div>
              <div className={styles.faqRespuesta}>
                La <strong>varianza poblacional (σ²)</strong> divide por N (todos los individuos) y la
                <strong> muestral (s²)</strong> divide por n−1. Esta diferencia se llama corrección de Bessel
                y sirve para que s² sea un estimador insesgado de σ². Ejemplo: notas de 5 alumnos: 6, 7, 8, 7, 7.
                Media = 7. Varianza poblacional = 0,4 (divide por 5). Varianza muestral = 0,5 (divide por 4).
                Usa muestral si son una muestra de un grupo mayor; usa poblacional si tienes todos los datos del universo.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es una distribución sesgada y cómo reconocerla?</div>
              <div className={styles.faqRespuesta}>
                Una distribución está <strong>sesgada a la derecha</strong> (positiva) cuando hay pocos valores muy altos
                que estiran la cola derecha — típico en salarios, precios de vivienda o rentas. Se reconoce porque
                media &gt; mediana. Está <strong>sesgada a la izquierda</strong> (negativa) cuando hay pocos valores muy
                bajos — media &lt; mediana. Con sesgo fuerte, la media engaña: un informe debe incluir siempre
                mediana y rango intercuartil junto a la media.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo interpretar un histograma de datos?</div>
              <div className={styles.faqRespuesta}>
                Un <strong>histograma</strong> muestra cómo se distribuyen los valores agrupados en intervalos (barras).
                Busca: (1) <strong>simetría</strong> — si las barras son simétricas alrededor del centro, la distribución es
                aproximadamente normal; (2) <strong>colas largas</strong> — barra aislada a la derecha o izquierda indica sesgo
                o outlier; (3) <strong>bimodalidad</strong> — dos picos sugieren dos subgrupos mezclados (ej. hombres y mujeres
                en datos de altura). Los picos del histograma coinciden aproximadamente con la moda.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuántos datos necesito para que la media sea fiable?</div>
              <div className={styles.faqRespuesta}>
                No hay un número mágico, pero como referencia: con <strong>n ≥ 30</strong> la media muestral tiende a
                distribuirse normalmente (teorema central del límite) independientemente de la distribución original.
                Con n &lt; 10 la media es muy inestable — un solo dato atípico puede cambiarla drásticamente. El
                <strong> error estándar (s/√n)</strong> cuantifica esta incertidumbre: con n=10, s=5 → SE=1,58; con n=100 → SE=0,5.
                Duplicar el tamaño muestral reduce el error a la mitad.
              </div>
            </li>
          </ul>
          <p className={styles.faqTip}>
            Consejo: para datos de ingresos, precios o cualquier variable con distribución asimétrica,
            reporta siempre mediana + IQR en lugar de media + desviación típica.
          </p>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Analizar un Conjunto de Datos (7 Pasos)</h2>
          <p className={styles.introParagraph}>
            Sigue este proceso completo para cualquier análisis estadístico descriptivo, desde la
            recogida de datos hasta la comunicación de resultados. Ejemplo práctico: <strong>notas
            de matemáticas de 20 alumnos</strong>.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Recolectar y organizar los datos</strong>
                <p>
                  Escribe o importa todos los valores. Verifica que no haya errores tipográficos
                  ni datos duplicados involuntarios. Ejemplo: 4, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 4, 3, 9, 8.
                  <strong> n = 20 alumnos.</strong>
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Detectar y gestionar datos faltantes o erróneos</strong>
                <p>
                  Revisa valores imposibles (nota 11/10, edad negativa). Decide si imputar, eliminar
                  o marcar los datos problemáticos. Documenta siempre las decisiones tomadas.
                  En este ejemplo: todos los valores están entre 0-10, no hay anomalías.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Calcular medidas de tendencia central</strong>
                <p>
                  Media = 7,3; Mediana = 8; Moda = 8 (aparece 5 veces). La mediana y la moda coinciden
                  en 8 y la media es 7,3 — hay ligero sesgo a la izquierda por los suspensos (3, 4, 4, 5).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Calcular medidas de dispersión</strong>
                <p>
                  Desv. estándar muestral s = 1,92; Varianza s² = 3,69; Rango = 7 (de 3 a 10);
                  IQR = Q3 − Q1 = 9 − 6,5 = 2,5. CV = (1,92 / 7,3) × 100 = 26,3% — variabilidad moderada-alta.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Identificar outliers con la regla IQR</strong>
                <p>
                  Límite inferior = Q1 − 1,5 × IQR = 6,5 − 3,75 = 2,75. Límite superior = Q3 + 1,5 × IQR = 9 + 3,75 = 12,75.
                  Ningún dato cae fuera de [2,75, 12,75] en el rango 0-10. No hay outliers en este conjunto.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Evaluar la forma de la distribución</strong>
                <p>
                  Media (7,3) &lt; Mediana (8) indica ligero sesgo negativo (cola izquierda por los suspensos).
                  Los datos se concentran entre 7 y 9, con pocos valores bajos que arrastran la media hacia abajo.
                  La distribución no es estrictamente normal pero tampoco está muy sesgada.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Interpretar y comunicar los resultados</strong>
                <p>
                  Redacta las conclusiones en lenguaje claro: &quot;El grupo obtuvo una nota mediana de 8 con una
                  variabilidad moderada (s=1,92). La mayoría de alumnos (15 de 20) aprobaron. Los 4 suspensos
                  arrastran la media a 7,3, por lo que la mediana es el indicador más representativo del grupo.&quot;
                  Incluye siempre n, la medida elegida y su justificación.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>6 Mejores Prácticas para Análisis Estadístico</h2>
          <p className={styles.introParagraph}>
            Estos seis consejos accionables mejorarán la calidad y la honestidad de cualquier
            análisis estadístico descriptivo.
          </p>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Visualiza siempre primero</strong>
              <p>
                Antes de interpretar cualquier estadístico, representa los datos en un histograma
                o diagrama de caja. Un CV=30% puede deberse a datos normalmente dispersos o a
                dos grupos mezclados — solo el gráfico lo revela.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <strong>Comprueba outliers antes de calcular la media</strong>
              <p>
                Aplica la regla IQR como primer paso. Si hay outliers, decide conscientemente
                si incluirlos (y justificarlo) o usar mediana + IQR como alternativa robusta.
                Nunca elimines outliers sin documentar el motivo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💶</span>
              <strong>Usa mediana para ingresos y precios</strong>
              <p>
                Los datos de salarios, precios inmobiliarios, rentas o tiempos de espera suelen
                tener distribuciones asimétricas. La mediana es siempre más honesta que la media
                en estos contextos. El INE y Eurostat la usan por defecto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <strong>Reporta media + desviación típica juntas</strong>
              <p>
                Una media sin su desviación típica no dice nada. Escribe siempre: &quot;Media = 7,3
                (s = 1,92, n = 20)&quot;. Esto permite calcular intervalos de confianza y comparar
                grupos con rigor estadístico.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <strong>Usa el CV para comparar series distintas</strong>
              <p>
                Si comparas la variabilidad de salarios (en euros) con la de temperaturas (en °C),
                el CV elimina el problema de escala. Dos series son comparables en variabilidad
                relativa aunque sus unidades sean completamente distintas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Distingue muestra de población</strong>
              <p>
                Si tus datos son una muestra de un grupo mayor, usa s (divide por n−1) y menciona
                el error estándar. Si tienes todos los datos del universo (ej. todos los empleados
                de una empresa), usa σ (divide por n). Confundirlos lleva a estimaciones sesgadas.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box — Errores Clásicos */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>6 Errores Clásicos que Debes Evitar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Usar la media con datos sesgados.</strong> Los salarios, precios de vivienda
                y tiempos de respuesta casi siempre tienen distribuciones asimétricas. Presentar solo
                la media sin la mediana genera una imagen distorsionada de la realidad.
              </li>
              <li>
                <strong>Dividir por n en vez de n−1 al calcular la varianza muestral.</strong> Este error
                subestima la variabilidad real de la población. La corrección de Bessel (÷ n−1) es obligatoria
                cuando trabajas con una muestra y quieres inferir sobre la población.
              </li>
              <li>
                <strong>Confundir error estándar con desviación típica.</strong> La desviación típica mide
                la dispersión de los datos individuales. El error estándar (s/√n) mide la incertidumbre
                de la media como estimador. Con n=100, el error estándar es 10 veces menor que s.
              </li>
              <li>
                <strong>Ignorar outliers sin justificación.</strong> Eliminar un valor extremo porque
                &quot;molesta&quot; al análisis es manipulación estadística. Si decides excluirlo, documenta
                el criterio (ej. regla IQR×1,5) y presenta el análisis con y sin él.
              </li>
              <li>
                <strong>Sacar conclusiones con n pequeño.</strong> Con n &lt; 10, los estadísticos son
                muy inestables — un solo dato diferente puede cambiar la media un 20% o la desviación
                típica un 50%. Siempre indica n junto a cada estadístico y sé cauto con muestras pequeñas.
              </li>
              <li>
                <strong>Presentar la varianza como medida de dispersión final.</strong> La varianza está
                en unidades al cuadrado (€², cm², etc.), lo que la hace difícil de interpretar directamente.
                Usa siempre la desviación típica (raíz de la varianza) para comunicar resultados al público general.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-estadistica')} />

      <ShareCard appName="calculadora-estadistica" />
      <Footer appName="calculadora-estadistica" />
    </div>
  );
}
