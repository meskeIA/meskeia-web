'use client';

import { useMemo, useState } from 'react';
import styles from './CalculadoraLegibilidad.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatNumber } from '@/lib';
import {
  analizarTexto,
  marcarTexto,
  PALABRAS_FRASE_LARGA,
  PALABRAS_TROZO,
  SILABAS_PALABRA_MUY_LARGA,
  type Analisis,
} from './motor';
import { PREGUNTAS_FRECUENTES } from './metadata';

/**
 * Lo que se guarda de una versión del texto para compararla con la siguiente (S0218). El
 * ejercicio típico de legibilidad es reescribir y volver a medir: sin esto había que apuntar
 * la cifra anterior a mano.
 */
type VersionGuardada = Pick<
  Analisis,
  'fleschSzigriszt' | 'fernandezHuerta' | 'dificultad' | 'promedioPalabrasOracion' | 'promedioSilabasPalabra' | 'palabras'
> & { frasesLargas: number };

/** Diferencia con signo, para la columna de la comparación: «+5,8», «−2,0», «0,0». */
function conSigno(valor: number, decimales: number): string {
  const redondeado = Number(valor.toFixed(decimales));
  if (redondeado === 0) return formatNumber(0, decimales);
  return `${redondeado > 0 ? '+' : '−'}${formatNumber(Math.abs(redondeado), decimales)}`;
}

/** Las primeras palabras de una frase, para nombrarla en la lista. */
function arranque(frase: string, palabras = 8): string {
  const trozos = frase.trim().split(/\s+/);
  return trozos.length <= palabras ? frase.trim() : `${trozos.slice(0, palabras).join(' ')}…`;
}

export default function CalculadoraLegibilidadPage() {
  const [texto, setTexto] = useState('');
  const [guardada, setGuardada] = useState<VersionGuardada | null>(null);

  // Se analiza a partir de 20 caracteres, sin contar los blancos de los extremos. Era «> 20»
  // (21) con el aviso «al menos 20» y un contador que contaba los blancos (hallazgo 3598).
  const caracteres = texto.trim().length;
  const bastante = caracteres >= 20;
  const analisis = useMemo(
    () => (bastante ? analizarTexto(texto) : null),
    [texto, bastante],
  );
  const tramos = useMemo(
    () => (analisis ? marcarTexto(texto, analisis) : []),
    [texto, analisis],
  );

  const guardarVersion = () => {
    if (!analisis) return;
    setGuardada({
      fleschSzigriszt: analisis.fleschSzigriszt,
      fernandezHuerta: analisis.fernandezHuerta,
      dificultad: analisis.dificultad,
      promedioPalabrasOracion: analisis.promedioPalabrasOracion,
      promedioSilabasPalabra: analisis.promedioSilabasPalabra,
      palabras: analisis.palabras,
      frasesLargas: analisis.frasesLargas.length,
    });
  };

  // Colores por los tramos de la escala INFLESZ
  const getScoreColor = (score: number) => {
    if (score >= 65) return styles.facil;
    if (score >= 55) return styles.normal;
    if (score >= 40) return styles.dificil;
    return styles.muyDificil;
  };

  const textoEjemplo = `La inteligencia artificial está transformando nuestra vida diaria. Desde los asistentes virtuales hasta los coches autónomos, esta tecnología avanza a pasos agigantados.

Los expertos predicen que en los próximos años veremos cambios significativos. La automatización llegará a más sectores. Sin embargo, también surgen preocupaciones sobre el empleo y la privacidad.

Es importante que la sociedad se prepare para estos cambios. La educación debe adaptarse. Los gobiernos necesitan crear regulaciones adecuadas. Solo así podremos aprovechar los beneficios de la IA minimizando sus riesgos.`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Legibilidad</h1>
        <p className={styles.subtitle}>
          Analiza la facilidad de lectura de tus textos en español
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="calculadora-legibilidad-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle} id="titulo-tu-texto">Tu texto</h2>

          <div className={styles.inputGroup}>
            {/* Con nombre propio (hallazgo 3601): el del placeholder desaparece al escribir */}
            <textarea
              aria-labelledby="titulo-tu-texto"
              className={styles.textarea}
              placeholder="Pega aquí tu texto para analizar su legibilidad... (mínimo 20 caracteres)"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={12}
            />
            <div className={styles.charInfo}>
              <span>{caracteres} caracteres</span>
              <button
                type="button"
                className={styles.ejemploBtn}
                onClick={() => {
                  // No pisa sin preguntar lo que el usuario ha escrito: el valor lo pone React y
                  // Ctrl+Z no lo devuelve, y en el móvil no hay forma de deshacer (hallazgo 3597)
                  const propio = texto.trim() !== '' && texto !== textoEjemplo;
                  if (propio && !window.confirm('¿Sustituir tu texto por el ejemplo? Lo que has escrito se perderá.')) return;
                  setTexto(textoEjemplo);
                }}
              >
                Cargar ejemplo
              </button>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Análisis de legibilidad</h2>

          {analisis ? (
            <>
              {/* Score principal */}
              <div className={`${styles.mainScore} ${getScoreColor(analisis.fleschSzigriszt)}`}>
                <div className={styles.scoreCircle}>
                  {/* Truncada, no redondeada (hallazgo 3595): con 54,735 el círculo decía «55» al
                      lado de «Algo difícil» y «Por debajo de 55». Los tramos INFLESZ van en
                      enteros, así que la parte entera cae siempre en el mismo tramo que la cifra. */}
                  <span className={styles.scoreValue}>{Math.floor(analisis.fleschSzigriszt)}</span>
                </div>
                <div className={styles.scoreDetails}>
                  <span className={styles.scoreLabel}>{analisis.dificultad}</span>
                  <span className={styles.scoreNivel}>
                    {analisis.fleschSzigriszt >= 55
                      ? 'Supera 55, el umbral de la escala INFLESZ para textos dirigidos a pacientes'
                      : 'Por debajo de 55, el umbral de la escala INFLESZ para textos dirigidos a pacientes'}
                  </span>
                </div>
              </div>

              {/* Métricas básicas */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{analisis.palabras}</span>
                  <span className={styles.metricLabel}>Palabras</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{analisis.oraciones}</span>
                  <span className={styles.metricLabel}>Oraciones</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{analisis.silabas}</span>
                  <span className={styles.metricLabel}>Sílabas</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{formatNumber(analisis.promedioPalabrasOracion, 1)}</span>
                  <span className={styles.metricLabel}>Palabras/Oración</span>
                </div>
              </div>

              {/* Índices de legibilidad */}
              <div className={styles.indicesSection}>
                <h3>Índices de legibilidad</h3>

                <div className={styles.indiceItem}>
                  <div className={styles.indiceHeader}>
                    <span className={styles.indiceName}>Flesch-Szigriszt</span>
                    <span className={`${styles.indiceScore} ${getScoreColor(analisis.fleschSzigriszt)}`}>
                      {formatNumber(analisis.fleschSzigriszt, 1)}
                    </span>
                  </div>
                  <div className={styles.indiceBar}>
                    <div
                      className={`${styles.indiceProgress} ${getScoreColor(analisis.fleschSzigriszt)}`}
                      style={{ width: `${analisis.fleschSzigriszt}%` }}
                    />
                  </div>
                  <span className={styles.indiceDesc}>Adaptación española del índice Flesch</span>
                </div>

                <div className={styles.indiceItem}>
                  <div className={styles.indiceHeader}>
                    <span className={styles.indiceName}>Fernández Huerta</span>
                    {/* Sin los colores de INFLESZ (hallazgo 3604): esa escala es la de la
                        puntuación Flesch-Szigriszt, y en Fernández Huerta el azul de «Normal»
                        sugería haber pasado un umbral de 55 que no es el suyo. */}
                    <span className={`${styles.indiceScore} ${styles.sinEscala}`}>
                      {formatNumber(analisis.fernandezHuerta, 1)}
                    </span>
                  </div>
                  <div className={styles.indiceBar}>
                    <div
                      className={`${styles.indiceProgress} ${styles.sinEscala}`}
                      style={{ width: `${analisis.fernandezHuerta}%` }}
                    />
                  </div>
                  <span className={styles.indiceDesc}>Fórmula específica para español</span>
                </div>

                <div className={styles.indiceItem}>
                  <div className={styles.indiceHeader}>
                    <span className={styles.indiceName}>Escala INFLESZ</span>
                    <span className={`${styles.indiceScore} ${getScoreColor(analisis.fleschSzigriszt)}`}>
                      {analisis.dificultad}
                    </span>
                  </div>
                  <span className={styles.indiceDesc}>Grado de lectura de la puntuación Flesch-Szigriszt (no es otra fórmula)</span>
                </div>
              </div>

              {/* Análisis adicional */}
              <div className={styles.extraAnalysis}>
                <div className={styles.extraItem}>
                  <span className={styles.extraLabel}>Promedio sílabas/palabra</span>
                  <span className={styles.extraValue}>{formatNumber(analisis.promedioSilabasPalabra, 2)}</span>
                </div>
                <div className={styles.extraItem}>
                  <span className={styles.extraLabel}>Palabras largas (3+ sílabas)</span>
                  <span className={styles.extraValue}>
                    {analisis.palabrasLargas} ({formatNumber(analisis.porcentajeLargas, 1)}{' '}%)
                  </span>
                </div>
              </div>

              {/* Sugerencias */}
              <div className={styles.sugerencias}>
                <h4>Recomendaciones</h4>
                <ul>
                  {analisis.promedioPalabrasOracion > 25 && (
                    <li>Tus oraciones son largas (promedio {formatNumber(analisis.promedioPalabrasOracion, 0)}). Intenta dividirlas para mejorar la legibilidad.</li>
                  )}
                  {analisis.porcentajeLargas > 30 && (
                    <li>Tienes muchas palabras largas ({formatNumber(analisis.porcentajeLargas, 0)}{' '}%). Usa sinónimos más cortos cuando sea posible.</li>
                  )}
                  {analisis.fleschSzigriszt < 55 && (
                    <li>El texto puede ser difícil para lectores generales. Simplifica si tu audiencia no es especializada.</li>
                  )}
                  {analisis.fleschSzigriszt >= 65 && (
                    <li>Excelente legibilidad. Tu texto es accesible para la mayoría de lectores.</li>
                  )}
                  {/* En el tramo «Normal» (55-65), sin frases largas ni muchas palabras largas,
                      ninguna de las de arriba aplicaba y la caja salía vacía (hallazgo 3599) */}
                  {analisis.fleschSzigriszt >= 55 && analisis.fleschSzigriszt < 65 &&
                    analisis.promedioPalabrasOracion <= 25 && analisis.porcentajeLargas <= 30 && (
                    <li>El texto está en el tramo «Normal» de INFLESZ. Para acercarlo a «Bastante fácil», parte las frases más largas o cambia alguna palabra larga por otra más corta.</li>
                  )}
                </ul>
              </div>

              {/* Comparación entre dos versiones (S0218) */}
              <div className={styles.comparacion}>
                <h4>Comparar con otra versión</h4>
                {guardada ? (
                  <>
                    <div className={styles.tablaComparacionWrap}>
                      <table className={styles.tablaComparacion}>
                        <thead>
                          <tr>
                            <th scope="col">Medida</th>
                            <th scope="col">Guardada</th>
                            <th scope="col">Ahora</th>
                            <th scope="col">Cambio</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">Flesch-Szigriszt</th>
                            <td>{formatNumber(guardada.fleschSzigriszt, 1)}</td>
                            <td>{formatNumber(analisis.fleschSzigriszt, 1)}</td>
                            <td>{conSigno(analisis.fleschSzigriszt - guardada.fleschSzigriszt, 1)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Grado INFLESZ</th>
                            <td>{guardada.dificultad}</td>
                            <td>{analisis.dificultad}</td>
                            <td>{guardada.dificultad === analisis.dificultad ? 'igual' : 'cambia'}</td>
                          </tr>
                          <tr>
                            <th scope="row">Fernández Huerta</th>
                            <td>{formatNumber(guardada.fernandezHuerta, 1)}</td>
                            <td>{formatNumber(analisis.fernandezHuerta, 1)}</td>
                            <td>{conSigno(analisis.fernandezHuerta - guardada.fernandezHuerta, 1)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Palabras por frase</th>
                            <td>{formatNumber(guardada.promedioPalabrasOracion, 1)}</td>
                            <td>{formatNumber(analisis.promedioPalabrasOracion, 1)}</td>
                            <td>{conSigno(analisis.promedioPalabrasOracion - guardada.promedioPalabrasOracion, 1)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Sílabas por palabra</th>
                            <td>{formatNumber(guardada.promedioSilabasPalabra, 2)}</td>
                            <td>{formatNumber(analisis.promedioSilabasPalabra, 2)}</td>
                            <td>{conSigno(analisis.promedioSilabasPalabra - guardada.promedioSilabasPalabra, 2)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Frases de más de {PALABRAS_FRASE_LARGA} palabras</th>
                            <td>{guardada.frasesLargas}</td>
                            <td>{analisis.frasesLargas.length}</td>
                            <td>{conSigno(analisis.frasesLargas.length - guardada.frasesLargas, 0)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Palabras</th>
                            <td>{guardada.palabras}</td>
                            <td>{analisis.palabras}</td>
                            <td>{conSigno(analisis.palabras - guardada.palabras, 0)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className={styles.comparacionAcciones}>
                      <button type="button" className={styles.ejemploBtn} onClick={guardarVersion}>
                        Guardar esta versión en su lugar
                      </button>
                      <button type="button" className={styles.ejemploBtn} onClick={() => setGuardada(null)}>
                        Olvidar la guardada
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.comparacionTexto}>
                      Guarda esta versión, reescribe el texto en la caja y verás aquí las dos
                      puntuaciones lado a lado. La versión guardada no sale de tu navegador y se
                      pierde al recargar la página.
                    </p>
                    <button type="button" className={styles.ejemploBtn} onClick={guardarVersion}>
                      Guardar esta versión para comparar
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📖</span>
              {/* Un texto sin una letra (solo cifras o signos) no tiene nada que leer: la fórmula
                  daba más de 200, acotado a 100 «Muy fácil» (hallazgo 3596) */}
              <p>
                {bastante
                  ? 'El texto no tiene palabras que leer: la fórmula necesita letras, no solo cifras o signos'
                  : 'Escribe o pega un texto de al menos 20 caracteres'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dónde está la dificultad (S0218): la app señala, ya no solo cuenta */}
      {analisis && (
        <section className={styles.dificultadSection} aria-labelledby="titulo-dificultad">
          <h2 id="titulo-dificultad" className={styles.panelTitle}>Dónde está la dificultad</h2>

          {analisis.frasesLargas.length === 0 && analisis.palabrasMuyLargas.length === 0 ? (
            <p className={styles.dificultadVacia}>
              Ninguna frase pasa de {PALABRAS_FRASE_LARGA} palabras y no hay palabras de{' '}
              {SILABAS_PALABRA_MUY_LARGA} sílabas o más.
            </p>
          ) : (
            <>
              {analisis.frasesLargas.length > 0 && (
                <div className={styles.frasesLargas}>
                  <h3>
                    {analisis.frasesLargas.length === 1
                      ? `1 frase de más de ${PALABRAS_FRASE_LARGA} palabras`
                      : `${analisis.frasesLargas.length} frases de más de ${PALABRAS_FRASE_LARGA} palabras`}
                    , de la que más sube la puntuación al partirla a la que menos
                  </h3>
                  <ol>
                    {analisis.frasesLargas.map((f) => (
                      <li key={f.inicio}>
                        <span className={styles.fraseCita}>«{arranque(texto.slice(f.inicio, f.fin))}»</span>{' '}
                        <span className={styles.fraseDato}>
                          {f.palabras} palabras. Partida en {f.trozos} frases de {PALABRAS_TROZO} palabras
                          como mucho, la puntuación Flesch-Szigriszt del texto pasaría de{' '}
                          {formatNumber(analisis.fleschSzigriszt, 1)} a{' '}
                          {formatNumber(analisis.fleschSzigriszt + f.ganancia, 1)} ({conSigno(f.ganancia, 1)}).
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {analisis.palabrasMuyLargas.length > 0 && (
                <p className={styles.palabrasMuyLargasResumen}>
                  {analisis.palabrasMuyLargas.length === 1
                    ? `1 palabra de ${SILABAS_PALABRA_MUY_LARGA} sílabas o más`
                    : `${analisis.palabrasMuyLargas.length} palabras de ${SILABAS_PALABRA_MUY_LARGA} sílabas o más`}
                  : {[...new Set(analisis.palabrasMuyLargas.map((p) => texto.slice(p.inicio, p.fin).toLowerCase()))].join(', ')}.
                  Son las que más suben la media de sílabas por palabra; cambiarlas por una más corta,
                  si la hay, mejora la puntuación.
                </p>
              )}

              <div className={styles.leyenda} aria-hidden="true">
                <span><span className={styles.marcaFrase}>Frase larga</span></span>
                <span><span className={styles.marcaPalabra}>palabra muy larga</span></span>
              </div>
              <div className={styles.textoMarcado} data-testid="texto-marcado">
                {tramos.map((t, i) => (
                  <span
                    key={i}
                    className={[
                      t.enFraseLarga ? styles.marcaFrase : '',
                      t.palabraMuyLarga ? styles.marcaPalabra : '',
                    ].filter(Boolean).join(' ') || undefined}
                  >
                    {t.texto}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Guía de interpretación */}
      <div className={styles.guideSection}>
        <h3>Interpretación de la puntuación: escala INFLESZ</h3>
        <p className={styles.guideIntro}>
          Barrio-Cantalejo y otros (2008) midieron 210 publicaciones reales en español y propusieron
          estos cinco tramos para leer la puntuación Flesch-Szigriszt. Los textos sobre salud tienen
          más probabilidad de leerse y comprenderse si superan los 55 puntos.
        </p>
        <div className={styles.guideGrid}>
          <div className={`${styles.guideItem} ${styles.facil}`}>
            <span className={styles.guideRange}>80-100</span>
            <span className={styles.guideLabel}>Muy fácil</span>
            <span className={styles.guideDesc}>Lectura muy ligera</span>
          </div>
          <div className={`${styles.guideItem} ${styles.facil}`}>
            <span className={styles.guideRange}>65-79</span>
            <span className={styles.guideLabel}>Bastante fácil</span>
            <span className={styles.guideDesc}>Libros escolares: media 67,4</span>
          </div>
          <div className={`${styles.guideItem} ${styles.normal}`}>
            <span className={styles.guideRange}>55-64</span>
            <span className={styles.guideLabel}>Normal</span>
            <span className={styles.guideDesc}>Prensa de quiosco: media 60</span>
          </div>
          <div className={`${styles.guideItem} ${styles.dificil}`}>
            <span className={styles.guideRange}>40-54</span>
            <span className={styles.guideLabel}>Algo difícil</span>
            <span className={styles.guideDesc}>Bajo el umbral para pacientes</span>
          </div>
          <div className={`${styles.guideItem} ${styles.muyDificil}`}>
            <span className={styles.guideRange}>0-39</span>
            <span className={styles.guideLabel}>Muy difícil</span>
            <span className={styles.guideDesc}>Revistas científicas: media 37,9</span>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="Aprende sobre legibilidad y comprensión lectora"
        subtitle="Cómo medir y mejorar la claridad de tus textos"
      >
        <div className={styles.educationalContent}>

          {/* Sección original: qué es la legibilidad */}
          <section className={styles.eduSection}>
            <h2>¿Qué es la legibilidad?</h2>
            <p>
              La legibilidad mide lo fácil que resulta leer y comprender un texto.
              No se trata de simplificar el contenido, sino de presentarlo de forma
              clara y accesible para tu audiencia objetivo.
            </p>
            <p>
              Un texto con buena legibilidad reduce el esfuerzo cognitivo del lector,
              aumenta la comprensión y mejora la experiencia de lectura.
            </p>
          </section>

          {/* Sección original: fórmulas */}
          <section className={styles.eduSection}>
            <h2>Las fórmulas de legibilidad</h2>

            <div className={styles.formulaCard}>
              <h4>Índice Flesch-Szigriszt</h4>
              <p className={styles.formula}>
                IFSZ = 206,835 − 62,3 × (sílabas/palabras) − (palabras/oraciones)
              </p>
              <p>
                Adaptación al español de la fórmula original de Rudolf Flesch.
                Tiene en cuenta las características del español con sus palabras
                generalmente más largas que en inglés.
              </p>
            </div>

            <div className={styles.formulaCard}>
              <h4>Índice Fernández Huerta</h4>
              <p className={styles.formula}>
                P = 206,84 − 60 × (sílabas/palabras) − 1,02 × (palabras/oraciones)
              </p>
              <p>
                Desarrollado específicamente para el español por José Fernández Huerta.
                Ajusta los coeficientes para reflejar mejor las características
                de nuestro idioma.
              </p>
            </div>
          </section>

          {/* Sección original: consejos */}
          <section className={styles.eduSection}>
            <h2>Consejos para mejorar la legibilidad</h2>
            <ul className={styles.tipsList}>
              <li><strong>Oraciones cortas:</strong> Intenta que no superen las 20-25 palabras</li>
              <li><strong>Palabras sencillas:</strong> Usa sinónimos cortos cuando sea posible</li>
              <li><strong>Voz activa:</strong> &quot;El equipo ganó&quot; en vez de &quot;El partido fue ganado&quot;</li>
              <li><strong>Párrafos breves:</strong> 3-4 oraciones máximo por párrafo</li>
              <li><strong>Conectores:</strong> Usa palabras como &quot;además&quot;, &quot;sin embargo&quot;, &quot;por tanto&quot;</li>
              <li><strong>Evita jerga:</strong> Explica términos técnicos cuando los uses</li>
            </ul>
          </section>

          {/* Puntuaciones de referencia (hallazgo 3603). Esta tarjeta daba rangos por tipo de
              contenido sin fuente (Blog 60-70, Marketing 65-80 «Muy fácil», Legal / Médico 20-40)
              y con otra escala que la de la app: 65-80 es «Bastante fácil» y 20-40, «Muy difícil»,
              en la misma página que el umbral de 55 para salud. Ahora son las medias medidas en el
              estudio que validó INFLESZ (Barrio-Cantalejo y otros, 2008), las de la guía de arriba. */}
          <section className={styles.eduSection}>
            <h2>Puntuaciones medidas en textos reales en español</h2>
            <p>
              No hay una cifra oficial por tipo de texto. Como referencia, estas son las medias que
              midieron Barrio-Cantalejo y otros (2008) al validar la escala INFLESZ.
            </p>
            <div className={styles.contentTypeGrid}>
              <div className={styles.contentTypeCard}>
                <h4>Libros escolares</h4>
                <span className={styles.recommendedScore}>67,4</span>
                <p>Media del estudio · Bastante fácil</p>
              </div>
              <div className={styles.contentTypeCard}>
                <h4>Prensa de quiosco</h4>
                <span className={styles.recommendedScore}>60</span>
                <p>Media del estudio · Normal</p>
              </div>
              <div className={styles.contentTypeCard}>
                <h4>Revistas científicas</h4>
                <span className={styles.recommendedScore}>37,9</span>
                <p>Media del estudio · Muy difícil</p>
              </div>
              <div className={styles.contentTypeCard}>
                <h4>Textos de salud para pacientes</h4>
                <span className={styles.recommendedScore}>55 o más</span>
                <p>Umbral que proponen los autores</p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 1: Tabla Comparativa de índices */}
          <section className={styles.eduSection}>
            <h2>Comparativa de índices de legibilidad</h2>
            <p>Cada índice usa una fórmula diferente y está optimizado para distintos contextos. Esta tabla te ayuda a elegir el más adecuado para tu tipo de texto.</p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Índice</th>
                    <th>Fórmula base</th>
                    <th>Escala</th>
                    <th>Idioma optimizado</th>
                    <th>Uso recomendado</th>
                    <th>Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Flesch-Kincaid</strong></td>
                    <td>Sílabas + longitud de frase</td>
                    <td>0–100</td>
                    <td>Inglés</td>
                    <td>Contenido en inglés, documentos técnicos</td>
                    <td>60–70</td>
                  </tr>
                  <tr>
                    <td><strong>Flesch-Szigriszt</strong></td>
                    <td>Adaptación española de Flesch</td>
                    <td>0–100</td>
                    <td>Español</td>
                    <td>Textos web, blogs, noticias en español</td>
                    <td>Se lee con INFLESZ (55 para salud)</td>
                  </tr>
                  <tr>
                    <td><strong>Fernández-Huerta</strong></td>
                    <td>Específica para español (coef. 60)</td>
                    <td>0–100</td>
                    <td>Español</td>
                    <td>Artículos periodísticos, divulgación científica</td>
                    <td>Sin tramos propios en esta app</td>
                  </tr>
                  <tr>
                    <td><strong>INFLESZ</strong></td>
                    <td>Escala de lectura del Flesch-Szigriszt (no es otra fórmula)</td>
                    <td>5 tramos sobre 0–100</td>
                    <td>Español</td>
                    <td>Textos sanitarios, folletos médicos, normativa</td>
                    <td>Más de 55</td>
                  </tr>
                  <tr>
                    <td><strong>Gunning Fog</strong></td>
                    <td>Palabras difíciles (&gt;2 sílabas)</td>
                    <td>Años escolaridad</td>
                    <td>Inglés</td>
                    <td>Documentos corporativos, informes</td>
                    <td>8–10 (años)</td>
                  </tr>
                  <tr>
                    <td><strong>SMOG</strong></td>
                    <td>Cuenta palabras polisilábicas</td>
                    <td>Años escolaridad</td>
                    <td>Inglés / adaptable</td>
                    <td>Materiales educativos, instrucciones</td>
                    <td>8–9 (años)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN 2: Casos de Uso */}
          <section className={styles.eduSection}>
            <h2>Casos de uso: quién necesita medir la legibilidad</h2>
            <p>La legibilidad no es solo una métrica técnica. Para estos perfiles profesionales, optimizarla marca la diferencia entre un texto que conecta y uno que aleja al lector.</p>
            <div className={styles.escenariosGrid}>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
                  <h3>Redactor de contenido web</h3>
                </div>
                <p>Optimiza artículos de blog y páginas de producto para mejorar el SEO y reducir la tasa de rebote.</p>
                <div className={styles.escenarioExample}>
                  {/* Decía «un artículo con Flesch-Szigriszt de 65 retiene un 23% más de lectores
                      que uno de 40, según estudios de Nielsen Norman», sin título, año ni enlace,
                      y con un índice que Nielsen Norman no usa (hallazgo 3602, regla 1 de
                      neutralidad). La cifra que queda es del estudio de INFLESZ. */}
                  <strong>Ejemplo real:</strong> En el estudio que validó la escala INFLESZ, la prensa de quiosco puntuó de media 60 y los libros escolares, 67,4.
                </div>
                <div className={styles.escenarioTip}>
                  Meta: para público general, los tramos «Normal» (55-64) o «Bastante fácil» (65-79). Revisar primero las frases que la app señala.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">📰</span>
                  <h3>Periodista y comunicador</h3>
                </div>
                <p>Verifica que sus artículos son comprensibles para una audiencia amplia sin perder rigor informativo.</p>
                <div className={styles.escenarioExample}>
                  {/* Atribuía al Libro de Estilo de El País una cifra que no se pudo anclar
                      (hallazgo 3606). Este ejemplo sale de la propia fórmula: P/F resta tal cual. */}
                  <strong>Ejemplo:</strong> Con las mismas palabras, una noticia con frases de 15 palabras y otra con frases de 30 se separan 15 puntos de Flesch-Szigriszt: la longitud media de la frase resta tal cual.
                </div>
                <div className={styles.escenarioTip}>
                  Meta: revisar primero las frases que la app señala. Evitar subordinadas encadenadas.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                  <h3>Docente y creador de materiales educativos</h3>
                </div>
                <p>Adapta el nivel de dificultad de sus textos al curso y edad del alumnado para maximizar la comprensión.</p>
                <div className={styles.escenarioExample}>
                  <strong>Ejemplo real:</strong> En el estudio que validó la escala INFLESZ, los libros escolares puntuaron de media 67,4 y las revistas científicas, 37,9.
                </div>
                <div className={styles.escenarioTip}>
                  Meta: ajustar la puntuación al nivel educativo del alumno. Usar la escala INFLESZ como referencia.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🏥</span>
                  <h3>Empresa de salud y comunicación clara</h3>
                </div>
                <p>Cumple con las normativas de comunicación clara (Plain Language) en folletos, consentimientos y webs de pacientes.</p>
                <div className={styles.escenarioExample}>
                  <strong>Ejemplo real:</strong> Barrio-Cantalejo y otros (2008), al validar la escala INFLESZ, concluyen que los textos sobre salud tienen más probabilidad de leerse y comprenderse si superan los 55 puntos (tramo &quot;normal&quot;).
                </div>
                <div className={styles.escenarioTip}>
                  Meta: INFLESZ superior a 55. Nunca usar jerga médica sin explicación inmediata.
                </div>
              </div>

            </div>
          </section>

          {/* SECCIÓN 3: FAQ */}
          <section className={styles.eduSection}>
            <h2>Preguntas frecuentes sobre legibilidad</h2>
            <div className={styles.faqList} role="list">

              {/* Fuente única con el FAQPage: PREGUNTAS_FRECUENTES de metadata.ts (hallazgo 3605) */}
              {PREGUNTAS_FRECUENTES.map((f) => (
                <div key={f.question} className={styles.faqItem} role="listitem">
                  <p className={styles.faqQuestion}>{f.question}</p>
                  <p className={styles.faqAnswer}>{f.answer}</p>
                </div>
              ))}

            </div>
          </section>

          {/* SECCIÓN 4: Guía Paso a Paso */}
          <section className={styles.eduSection}>
            <h2>Guía paso a paso: cómo optimizar la legibilidad de un texto</h2>
            <p>Sigue este proceso de 7 pasos para llevar cualquier texto desde el borrador hasta una versión legible y publicable.</p>
            <ol className={styles.stepGuide}>

              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Análisis inicial: obtén tu línea base</strong>
                  <p>Pega el texto completo en esta calculadora y pulsa «Guardar esta versión para comparar»: la puntuación Flesch-Szigriszt, las palabras por frase y las sílabas por palabra de ese momento quedan como línea base, y al reescribir verás el cambio de cada una.</p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Identifica las frases más largas</strong>
                  <p>El bloque «Dónde está la dificultad» las resalta en el texto y las ordena por cuánto subiría la puntuación al partir cada una. Son las candidatas prioritarias a dividirse: una frase larga puede reescribirse en dos sin perder significado.</p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Sustituye palabras complejas por sinónimos más cortos</strong>
                  <p>Palabras como &quot;implementar&quot; → &quot;aplicar&quot;, &quot;utilizar&quot; → &quot;usar&quot;, &quot;realizar&quot; → &quot;hacer&quot;. El objetivo es que el 92{' '}% de las palabras tengan 2 sílabas o menos (límite Gunning Fog: máximo 8{' '}% de palabras difíciles).</p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Convierte voz pasiva en voz activa</strong>
                  <p>Detecta construcciones como &quot;fue aprobado por&quot;, &quot;es utilizado para&quot;, &quot;ha sido confirmado&quot; y cámbialas a sujeto + verbo activo. Esto acorta las frases y las hace más directas.</p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div className={styles.stepContent}>
                  <strong>Rompe los párrafos monolíticos</strong>
                  <p>Cualquier párrafo de más de 80 palabras (unas 5-6 líneas en pantalla) debe dividirse. Introduce un subtítulo cada 300 palabras para ayudar al lector a orientarse y al motor de búsqueda a indexar secciones.</p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNumber}>6</span>
                <div className={styles.stepContent}>
                  <strong>Vuelve a analizar y compara</strong>
                  <p>Pega la versión revisada en la calculadora. Compara la nueva puntuación con la línea base. Repite los pasos 2-5 hasta alcanzar tu puntuación objetivo (como referencia, 55 es el umbral de INFLESZ para textos de salud dirigidos a pacientes).</p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNumber}>7</span>
                <div className={styles.stepContent}>
                  <strong>Prueba con un lector real antes de publicar</strong>
                  <p>Pide a alguien del perfil de tu audiencia que lea el texto en voz alta. Las pausas, los tropiezos y las relecturas te indicarán dónde aún hay fricción. Las métricas son una guía, pero la prueba de usuario es definitiva.</p>
                </div>
              </li>

            </ol>
          </section>

          {/* SECCIÓN 5: Mejores Prácticas */}
          <section className={styles.eduSection}>
            <h2>Mejores prácticas para textos legibles en España</h2>
            <p>Estos 6 principios son accionables desde hoy. Cada uno tiene un impacto directo medible en la puntuación de legibilidad.</p>
            <div className={styles.tipsGrid}>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📏</span>
                <h3>Frases de 15-20 palabras</h3>
                <p>La frase ideal en español para web tiene entre 15 y 20 palabras. Por encima de 25, la comprensión empieza a caer. Por debajo de 10, el texto suena telegráfico. Mezcla longitudes para dar ritmo.</p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📦</span>
                <h3>Párrafos de 3-4 líneas</h3>
                <p>En desktop, un párrafo de 3-4 líneas (50-70 palabras) es el más cómodo de leer. En móvil, baja a 2-3 líneas. El espacio en blanco entre párrafos no es desperdicio: es oxígeno visual para el lector.</p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔤</span>
                <h3>Palabras cortas y simples</h3>
                <p>El español culto no es sinónimo de vocabulario rebuscado. &quot;Usar&quot; en lugar de &quot;implementar&quot;, &quot;hacer&quot; en lugar de &quot;realizar&quot;, &quot;dar&quot; en lugar de &quot;proporcionar&quot;. Reserva los términos complejos para cuando sean imprescindibles.</p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚡</span>
                <h3>Voz activa siempre que sea posible</h3>
                <p>La voz activa (sujeto + verbo + objeto) es más directa, más corta y más fácil de procesar. Reserva la voz pasiva para cuando el agente de la acción sea desconocido o irrelevante. Cada pasiva que eliminas reduce la longitud media de la frase.</p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔖</span>
                <h3>Subtítulo cada 300 palabras</h3>
                <p>Un subtítulo H2 o H3 cada 250-350 palabras mejora la navegación visual, facilita el escaneo rápido del contenido y crea anclajes semánticos que Google usa para entender la estructura del artículo. Es una de las mejoras con mayor retorno en legibilidad percibida.</p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔢</span>
                <h3>Datos concretos como referencia</h3>
                {/* El ejemplo aconsejaba escribir «3 de cada 4 usuarios abandona…», un dato sin
                    respaldo (hallazgo 3606): justo lo contrario de lo que pide la tarjeta. */}
                <p>En lugar de &quot;muchos estudios muestran que...&quot;, cita el dato con su origen: quién lo midió, cuándo y sobre qué. Un dato concreto con su fuente ancla el texto y le da credibilidad.</p>
              </div>

            </div>
          </section>

          {/* SECCIÓN 6: Warning Box — errores comunes */}
          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <h2>Errores comunes que destruyen la legibilidad</h2>
              </div>
              <p>Evita estos 6 errores frecuentes. Son los responsables de la mayoría de puntuaciones bajas en textos profesionales en español.</p>
              <ul className={styles.warningList}>
                <li>
                  <strong>Frases demasiado largas:</strong> Frases de más de 30 palabras bajan la puntuación Flesch en 10-15 puntos. Una sola frase de 50 palabras puede arrastrar todo el párrafo por debajo del umbral legible.
                </li>
                <li>
                  <strong>Párrafos monolíticos:</strong> Bloques de texto de más de 150 palabras sin punto y aparte se hacen muy pesados en el móvil, donde un bloque así ocupa varias pantallas.
                </li>
                <li>
                  <strong>Vocabulario técnico innecesario:</strong> Usar jerga especializada sin contexto es el error más común en webs corporativas. Si el término no es imprescindible, sustitúyelo. Si lo es, defínelo la primera vez que aparece.
                </li>
                <li>
                  <strong>Abuso de la voz pasiva:</strong> El español pasivo (&quot;fue aprobado&quot;, &quot;se ha procedido a&quot;) alarga las frases, difumina la responsabilidad y reduce la claridad. Las Administraciones Públicas españolas son el ejemplo clásico de este error.
                </li>
                <li>
                  <strong>Ignorar la legibilidad en móvil:</strong> Un texto con puntuación 65 en desktop puede sentirse como un 50 en móvil si los párrafos son largos y no hay subtítulos. Siempre previsualiza tu contenido en pantalla pequeña antes de publicar.
                </li>
                <li>
                  <strong>No adaptar el nivel al público objetivo:</strong> Un blog de finanzas personales para el gran público no puede tener la misma puntuación que un informe para analistas. Conoce a tu audiencia: la legibilidad correcta es la que funciona para tus lectores reales, no para los expertos del sector.
                </li>
              </ul>
            </div>
          </section>

        </div>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="calculadora-legibilidad" />
      <Footer appName="calculadora-legibilidad" />
    </div>
  );
}
