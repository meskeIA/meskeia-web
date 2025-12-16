'use client';

import { useState, useMemo } from 'react';
import styles from './AnalizadorDensidadSeo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import EducationalSection from '@/components/EducationalSection';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// Stop words en español (palabras a ignorar)
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'a',
  'en', 'con', 'por', 'para', 'sin', 'sobre', 'entre', 'desde', 'hasta', 'hacia',
  'que', 'y', 'o', 'e', 'u', 'ni', 'pero', 'sino', 'aunque', 'porque', 'como',
  'si', 'no', 'más', 'menos', 'muy', 'tan', 'tanto', 'este', 'esta', 'estos',
  'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas',
  'mi', 'tu', 'su', 'mis', 'tus', 'sus', 'nuestro', 'nuestra', 'vuestro', 'vuestra',
  'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'me', 'te',
  'se', 'nos', 'os', 'le', 'les', 'lo', 'la', 'ser', 'estar', 'haber', 'tener',
  'hacer', 'poder', 'deber', 'ir', 'venir', 'hay', 'es', 'son', 'está', 'están',
  'ha', 'han', 'tiene', 'tienen', 'hace', 'hacen', 'puede', 'pueden', 'debe', 'deben',
  'va', 'van', 'fue', 'fueron', 'era', 'eran', 'sea', 'sean', 'sido', 'siendo',
  'cuando', 'donde', 'quien', 'cual', 'cuyo', 'todo', 'toda', 'todos', 'todas',
  'otro', 'otra', 'otros', 'otras', 'mismo', 'misma', 'mismos', 'mismas', 'ya',
  'aún', 'también', 'solo', 'sólo', 'siempre', 'nunca', 'aquí', 'ahí', 'allí',
  'así', 'bien', 'mal', 'mucho', 'poco', 'algo', 'nada', 'cada', 'algún', 'alguna',
  'algunos', 'algunas', 'ningún', 'ninguna', 'ningunos', 'ningunas',
]);

interface WordData {
  word: string;
  count: number;
  density: number;
}

interface PhraseData {
  phrase: string;
  count: number;
  density: number;
}

export default function AnalizadorDensidadSeoPage() {
  const [texto, setTexto] = useState('');
  const [keywordObjetivo, setKeywordObjetivo] = useState('');
  const [incluirStopWords, setIncluirStopWords] = useState(false);
  const [minCaracteres, setMinCaracteres] = useState(3);

  const analisis = useMemo(() => {
    if (!texto.trim()) return null;

    // Limpiar y tokenizar texto
    const textoLimpio = texto.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9áéíóúüñ\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const palabras = textoLimpio.split(' ').filter(p => p.length >= minCaracteres);
    const totalPalabras = palabras.length;

    if (totalPalabras === 0) return null;

    // Contar palabras individuales
    const conteo: Record<string, number> = {};
    palabras.forEach(palabra => {
      if (!incluirStopWords && STOP_WORDS.has(palabra)) return;
      conteo[palabra] = (conteo[palabra] || 0) + 1;
    });

    // Ordenar por frecuencia
    const palabrasOrdenadas: WordData[] = Object.entries(conteo)
      .map(([word, count]) => ({
        word,
        count,
        density: (count / totalPalabras) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Buscar frases de 2 palabras (bigramas)
    const bigramas: Record<string, number> = {};
    for (let i = 0; i < palabras.length - 1; i++) {
      const bigrama = `${palabras[i]} ${palabras[i + 1]}`;
      if (!incluirStopWords) {
        if (STOP_WORDS.has(palabras[i]) || STOP_WORDS.has(palabras[i + 1])) continue;
      }
      bigramas[bigrama] = (bigramas[bigrama] || 0) + 1;
    }

    const bigramasOrdenados: PhraseData[] = Object.entries(bigramas)
      .filter(([_, count]) => count >= 2)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: (count / (totalPalabras - 1)) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Buscar frases de 3 palabras (trigramas)
    const trigramas: Record<string, number> = {};
    for (let i = 0; i < palabras.length - 2; i++) {
      const trigrama = `${palabras[i]} ${palabras[i + 1]} ${palabras[i + 2]}`;
      if (!incluirStopWords) {
        if (STOP_WORDS.has(palabras[i]) || STOP_WORDS.has(palabras[i + 1]) || STOP_WORDS.has(palabras[i + 2])) continue;
      }
      trigramas[trigrama] = (trigramas[trigrama] || 0) + 1;
    }

    const trigramasOrdenados: PhraseData[] = Object.entries(trigramas)
      .filter(([_, count]) => count >= 2)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: (count / (totalPalabras - 2)) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Análisis de keyword objetivo
    let keywordAnalisis = null;
    if (keywordObjetivo.trim()) {
      const kwLimpia = keywordObjetivo.toLowerCase().trim();
      const kwPalabras = kwLimpia.split(' ');
      let kwConteo = 0;

      if (kwPalabras.length === 1) {
        kwConteo = conteo[kwLimpia] || 0;
      } else {
        // Buscar frase exacta
        const regex = new RegExp(kwLimpia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = textoLimpio.match(regex);
        kwConteo = matches ? matches.length : 0;
      }

      const kwDensidad = (kwConteo / totalPalabras) * 100;
      let estado: 'bajo' | 'optimo' | 'alto' = 'bajo';
      let recomendacion = '';

      if (kwDensidad < 0.5) {
        estado = 'bajo';
        recomendacion = 'Considera añadir más menciones de tu keyword objetivo';
      } else if (kwDensidad <= 2.5) {
        estado = 'optimo';
        recomendacion = '¡Densidad óptima! Tu keyword está bien distribuida';
      } else {
        estado = 'alto';
        recomendacion = 'Cuidado con la sobreoptimización. Reduce las menciones';
      }

      keywordAnalisis = {
        keyword: keywordObjetivo,
        conteo: kwConteo,
        densidad: kwDensidad,
        estado,
        recomendacion,
      };
    }

    // Estadísticas generales
    const caracteres = texto.length;
    const caracteresSinEspacios = texto.replace(/\s/g, '').length;
    const frases = texto.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const palabrasUnicas = Object.keys(conteo).length;

    return {
      totalPalabras,
      caracteres,
      caracteresSinEspacios,
      frases,
      palabrasUnicas,
      palabrasTop: palabrasOrdenadas.slice(0, 20),
      bigramas: bigramasOrdenados,
      trigramas: trigramasOrdenados,
      keywordAnalisis,
    };
  }, [texto, keywordObjetivo, incluirStopWords, minCaracteres]);

  const getDensityColor = (density: number) => {
    if (density < 0.5) return styles.densityLow;
    if (density <= 2.5) return styles.densityOptimal;
    return styles.densityHigh;
  };

  const getDensityBar = (density: number, maxDensity: number) => {
    const width = Math.min((density / maxDensity) * 100, 100);
    return width;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📊 Analizador de Densidad SEO</h1>
        <p className={styles.subtitle}>
          Analiza la frecuencia de palabras clave y optimiza tu contenido para SEO
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>✏️ Tu contenido</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Palabra clave objetivo (opcional)</label>
            <input
              type="text"
              value={keywordObjetivo}
              onChange={(e) => setKeywordObjetivo(e.target.value)}
              placeholder="ej: marketing digital"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Texto a analizar</label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Pega aquí el contenido de tu artículo, página web o texto que quieras analizar..."
              className={styles.textarea}
              rows={12}
            />
          </div>

          <div className={styles.options}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={incluirStopWords}
                onChange={(e) => setIncluirStopWords(e.target.checked)}
              />
              <span>Incluir stop words (el, la, de, que...)</span>
            </label>

            <div className={styles.minCharsOption}>
              <label>Mínimo caracteres:</label>
              <select
                value={minCaracteres}
                onChange={(e) => setMinCaracteres(Number(e.target.value))}
                className={styles.selectSmall}
              >
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={5}>5+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {analisis ? (
            <>
              {/* Estadísticas generales */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{analisis.totalPalabras}</div>
                  <div className={styles.statLabel}>Palabras</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{analisis.caracteres}</div>
                  <div className={styles.statLabel}>Caracteres</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{analisis.frases}</div>
                  <div className={styles.statLabel}>Frases</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{analisis.palabrasUnicas}</div>
                  <div className={styles.statLabel}>Únicas</div>
                </div>
              </div>

              {/* Análisis de keyword objetivo */}
              {analisis.keywordAnalisis && (
                <div className={`${styles.keywordAnalysis} ${styles[analisis.keywordAnalisis.estado]}`}>
                  <div className={styles.keywordHeader}>
                    <span className={styles.keywordLabel}>Keyword objetivo:</span>
                    <span className={styles.keywordText}>&quot;{analisis.keywordAnalisis.keyword}&quot;</span>
                  </div>
                  <div className={styles.keywordStats}>
                    <div className={styles.keywordStat}>
                      <span className={styles.keywordStatValue}>{analisis.keywordAnalisis.conteo}</span>
                      <span className={styles.keywordStatLabel}>apariciones</span>
                    </div>
                    <div className={styles.keywordStat}>
                      <span className={styles.keywordStatValue}>{formatNumber(analisis.keywordAnalisis.densidad, 2)}%</span>
                      <span className={styles.keywordStatLabel}>densidad</span>
                    </div>
                  </div>
                  <div className={styles.keywordRecommendation}>
                    {analisis.keywordAnalisis.estado === 'bajo' && '⚠️ '}
                    {analisis.keywordAnalisis.estado === 'optimo' && '✅ '}
                    {analisis.keywordAnalisis.estado === 'alto' && '🚨 '}
                    {analisis.keywordAnalisis.recomendacion}
                  </div>
                </div>
              )}

              {/* Top palabras */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>🔤 Top 20 Palabras</h3>
                <div className={styles.wordsList}>
                  {analisis.palabrasTop.map((item, index) => (
                    <div key={item.word} className={styles.wordItem}>
                      <span className={styles.wordRank}>#{index + 1}</span>
                      <span className={styles.wordText}>{item.word}</span>
                      <span className={styles.wordCount}>{item.count}x</span>
                      <div className={styles.wordBarContainer}>
                        <div
                          className={`${styles.wordBar} ${getDensityColor(item.density)}`}
                          style={{ width: `${getDensityBar(item.density, analisis.palabrasTop[0]?.density || 1)}%` }}
                        />
                      </div>
                      <span className={`${styles.wordDensity} ${getDensityColor(item.density)}`}>
                        {formatNumber(item.density, 2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frases de 2 palabras */}
              {analisis.bigramas.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>📝 Frases de 2 palabras</h3>
                  <div className={styles.phrasesList}>
                    {analisis.bigramas.map((item) => (
                      <div key={item.phrase} className={styles.phraseItem}>
                        <span className={styles.phraseText}>{item.phrase}</span>
                        <span className={styles.phraseCount}>{item.count}x</span>
                        <span className={styles.phraseDensity}>{formatNumber(item.density, 2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Frases de 3 palabras */}
              {analisis.trigramas.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>📄 Frases de 3 palabras</h3>
                  <div className={styles.phrasesList}>
                    {analisis.trigramas.map((item) => (
                      <div key={item.phrase} className={styles.phraseItem}>
                        <span className={styles.phraseText}>{item.phrase}</span>
                        <span className={styles.phraseCount}>{item.count}x</span>
                        <span className={styles.phraseDensity}>{formatNumber(item.density, 2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>📊</div>
              <p>Pega tu texto para analizar la densidad de palabras clave</p>
            </div>
          )}
        </div>
      </div>

      {/* Guía de densidad */}
      <div className={styles.densityGuide}>
        <h3>📏 Guía de Densidad de Keywords</h3>
        <div className={styles.guideItems}>
          <div className={styles.guideItem}>
            <span className={`${styles.guideIndicator} ${styles.densityLow}`}></span>
            <span>&lt; 0.5% - Baja (considera añadir más)</span>
          </div>
          <div className={styles.guideItem}>
            <span className={`${styles.guideIndicator} ${styles.densityOptimal}`}></span>
            <span>0.5% - 2.5% - Óptima (¡perfecto!)</span>
          </div>
          <div className={styles.guideItem}>
            <span className={`${styles.guideIndicator} ${styles.densityHigh}`}></span>
            <span>&gt; 2.5% - Alta (riesgo de penalización)</span>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 Guía de Densidad de Palabras Clave"
        subtitle="Todo lo que necesitas saber sobre keyword density y SEO on-page"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Qué es la densidad de palabras clave?</h2>
            <p>
              La densidad de palabras clave (keyword density) es el porcentaje de veces que una palabra
              o frase aparece en un texto en relación al número total de palabras. Se calcula con la fórmula:
            </p>
            <div className={styles.formula}>
              Densidad = (Nº de veces keyword / Total palabras) × 100
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>¿Cuál es la densidad óptima?</h2>
            <p>
              No existe un número mágico, pero la mayoría de expertos SEO recomiendan entre
              <strong> 0.5% y 2.5%</strong> para la keyword principal. Lo importante es que el texto
              suene natural y aporte valor al lector.
            </p>
            <div className={styles.rangeGuide}>
              <div className={styles.rangeItem}>
                <span className={styles.rangeLabel}>Muy baja</span>
                <span className={styles.rangeValue}>&lt; 0.5%</span>
                <span className={styles.rangeDesc}>Google puede no entender el tema principal</span>
              </div>
              <div className={styles.rangeItem}>
                <span className={styles.rangeLabel}>Óptima</span>
                <span className={styles.rangeValue}>0.5% - 2.5%</span>
                <span className={styles.rangeDesc}>Balance perfecto entre SEO y naturalidad</span>
              </div>
              <div className={styles.rangeItem}>
                <span className={styles.rangeLabel}>Alta</span>
                <span className={styles.rangeValue}>&gt; 2.5%</span>
                <span className={styles.rangeDesc}>Riesgo de keyword stuffing y penalización</span>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Mejores prácticas 2025</h2>
            <ul className={styles.tipsList}>
              <li><strong>Prioriza la experiencia del usuario:</strong> Google valora más la calidad que la densidad</li>
              <li><strong>Usa variaciones semánticas:</strong> Sinónimos, LSI keywords y términos relacionados</li>
              <li><strong>Distribución natural:</strong> No concentres keywords al principio, distribúyelas uniformemente</li>
              <li><strong>Encabezados estratégicos:</strong> Incluye keywords en H1, H2 y H3 de forma natural</li>
              <li><strong>Intención de búsqueda:</strong> Responde a lo que el usuario realmente busca</li>
            </ul>
          </section>

          <section className={styles.eduSection}>
            <h2>¿Qué es el keyword stuffing?</h2>
            <p>
              El keyword stuffing es la práctica de repetir excesivamente palabras clave con el objetivo
              de manipular los rankings de Google. Esta técnica está penalizada desde 2011 (actualización Panda)
              y puede resultar en una bajada drástica de posiciones o incluso desindexación.
            </p>
            <div className={styles.warningBox}>
              <strong>⚠️ Señales de alerta:</strong>
              <ul>
                <li>Densidad superior al 3%</li>
                <li>Texto que suena artificial o robótico</li>
                <li>Keywords en lugares forzados (footer, texto oculto)</li>
                <li>Repetición exacta sin variaciones</li>
              </ul>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('analizador-densidad-seo')} />
      <Footer appName="analizador-densidad-seo" />
    </div>
  );
}
