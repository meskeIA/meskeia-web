'use client';

import { useState } from 'react';
import styles from './AnalizadorGeo.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';

// Tipos
interface AnalysisResult {
  score: number;
  categories: {
    estructura: CategoryScore;
    citabilidad: CategoryScore;
    entidades: CategoryScore;
    eeat: CategoryScore;
    frescura: CategoryScore;
    formato: CategoryScore;
  };
  recommendations: string[];
  strengths: string[];
}

interface CategoryScore {
  score: number;
  maxScore: number;
  details: string[];
}

// Patrones de análisis
const QUESTION_PATTERNS = [
  /^¿.+\?$/gm,
  /^(qué|cómo|cuándo|dónde|por qué|cuál|quién|cuánto)/gim,
  /\?$/gm
];

const STATISTIC_PATTERNS = [
  /\d+%/g,
  /\d+\s*(millones?|miles?|billones?)/gi,
  /\d{4}/g, // años
  /\d+[.,]\d+/g, // decimales
  /según\s+(un\s+)?estudio/gi,
  /investigación|encuesta|análisis/gi
];

const ENTITY_PATTERNS = [
  /[A-Z][a-záéíóú]+(?:\s+[A-Z][a-záéíóú]+)*/g, // Nombres propios
  /"[^"]+"/g, // Texto entre comillas
  /\b(Google|ChatGPT|OpenAI|Microsoft|Apple|Amazon|Meta|Facebook|Twitter|LinkedIn|YouTube|Instagram|TikTok)\b/gi,
];

const AUTHORITY_SIGNALS = [
  /según\s+/gi,
  /de acuerdo con/gi,
  /experto|especialista|profesional/gi,
  /universidad|instituto|organización/gi,
  /estudio|investigación|informe/gi,
  /años?\s+de\s+experiencia/gi,
  /certificado|acreditado/gi
];

const LIST_PATTERNS = [
  /^[-•*]\s+/gm,
  /^\d+[.)]\s+/gm,
  /^[a-z][.)]\s+/gm
];

function analyzeContent(
  content: string,
  title: string,
  metaDescription: string
): AnalysisResult {
  const recommendations: string[] = [];
  const strengths: string[] = [];

  // ========================================
  // 1. ANÁLISIS DE ESTRUCTURA (25 puntos)
  // ========================================
  let estructuraScore = 0;
  const estructuraDetails: string[] = [];

  // Headings (H2, H3 simulados por líneas cortas en mayúsculas o con ##)
  const headingMatches = content.match(/^#{1,3}\s+.+$|^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{5,50}$/gm) || [];
  const headingCount = headingMatches.length;
  if (headingCount >= 3) {
    estructuraScore += 8;
    estructuraDetails.push(`${headingCount} secciones/títulos detectados`);
    strengths.push('Buena estructura con múltiples secciones');
  } else if (headingCount >= 1) {
    estructuraScore += 4;
    estructuraDetails.push(`Solo ${headingCount} sección(es) detectada(s)`);
    recommendations.push('Añade más subtítulos (H2, H3) para estructurar mejor el contenido');
  } else {
    estructuraDetails.push('Sin estructura de títulos clara');
    recommendations.push('Estructura tu contenido con títulos y subtítulos claros');
  }

  // Párrafos
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
  if (paragraphs.length >= 5) {
    estructuraScore += 5;
    estructuraDetails.push(`${paragraphs.length} párrafos bien definidos`);
  } else if (paragraphs.length >= 3) {
    estructuraScore += 3;
    estructuraDetails.push(`${paragraphs.length} párrafos`);
  } else {
    recommendations.push('Divide el contenido en más párrafos para facilitar la lectura');
  }

  // Listas
  const listItems = content.match(/^[-•*]\s+.+$|^\d+[.)]\s+.+$/gm) || [];
  if (listItems.length >= 5) {
    estructuraScore += 7;
    estructuraDetails.push(`${listItems.length} elementos en listas`);
    strengths.push('Uso efectivo de listas - formato preferido por IAs');
  } else if (listItems.length >= 2) {
    estructuraScore += 4;
    estructuraDetails.push(`${listItems.length} elementos en listas`);
  } else {
    recommendations.push('Añade listas con viñetas o numeradas - las IAs las citan 32% más');
  }

  // Longitud óptima (1500-3000 palabras ideal)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 1500 && wordCount <= 3500) {
    estructuraScore += 5;
    estructuraDetails.push(`Longitud óptima: ${wordCount} palabras`);
    strengths.push('Longitud ideal para cobertura completa del tema');
  } else if (wordCount >= 800) {
    estructuraScore += 3;
    estructuraDetails.push(`${wordCount} palabras (recomendado: 1500-3000)`);
  } else {
    estructuraDetails.push(`Solo ${wordCount} palabras`);
    recommendations.push('Amplía el contenido a al menos 1500 palabras para mejor cobertura');
  }

  // ========================================
  // 2. ANÁLISIS DE CITABILIDAD (25 puntos)
  // ========================================
  let citabilidadScore = 0;
  const citabilidadDetails: string[] = [];

  // Estadísticas y datos concretos
  let statsCount = 0;
  STATISTIC_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern) || [];
    statsCount += matches.length;
  });

  if (statsCount >= 5) {
    citabilidadScore += 10;
    citabilidadDetails.push(`${statsCount} datos/estadísticas detectados`);
    strengths.push('Rico en datos concretos - muy citable por IAs');
  } else if (statsCount >= 2) {
    citabilidadScore += 5;
    citabilidadDetails.push(`${statsCount} datos/estadísticas`);
    recommendations.push('Añade más estadísticas, porcentajes y datos concretos');
  } else {
    citabilidadDetails.push('Pocos datos concretos');
    recommendations.push('Incluye estadísticas y datos específicos - las IAs prefieren citar hechos');
  }

  // Preguntas y respuestas directas
  let questionCount = 0;
  QUESTION_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern) || [];
    questionCount += matches.length;
  });

  if (questionCount >= 3) {
    citabilidadScore += 8;
    citabilidadDetails.push(`${questionCount} preguntas/respuestas detectadas`);
    strengths.push('Formato Q&A - excelente para respuestas directas');
  } else if (questionCount >= 1) {
    citabilidadScore += 4;
    citabilidadDetails.push(`${questionCount} pregunta(s)`);
  } else {
    recommendations.push('Incluye preguntas frecuentes (FAQ) con respuestas directas');
  }

  // Definiciones claras ("X es...", "Se define como...")
  const definitionPatterns = /\b(es|son|se define como|significa|consiste en|se refiere a)\b/gi;
  const definitions = content.match(definitionPatterns) || [];
  if (definitions.length >= 3) {
    citabilidadScore += 7;
    citabilidadDetails.push('Contiene definiciones claras');
    strengths.push('Definiciones explícitas - fácil de extraer por IAs');
  } else if (definitions.length >= 1) {
    citabilidadScore += 3;
    citabilidadDetails.push('Algunas definiciones');
  } else {
    recommendations.push('Define claramente los conceptos clave ("X es...", "Se define como...")');
  }

  // ========================================
  // 3. ANÁLISIS DE ENTIDADES (15 puntos)
  // ========================================
  let entidadesScore = 0;
  const entidadesDetails: string[] = [];

  // Entidades nombradas
  let entityCount = 0;
  const foundEntities = new Set<string>();
  ENTITY_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern) || [];
    matches.forEach(m => {
      if (m.length > 3 && m.length < 50) {
        foundEntities.add(m);
      }
    });
  });
  entityCount = foundEntities.size;

  if (entityCount >= 10) {
    entidadesScore += 10;
    entidadesDetails.push(`${entityCount} entidades reconocibles`);
    strengths.push('Rico en entidades - ayuda a las IAs a contextualizar');
  } else if (entityCount >= 5) {
    entidadesScore += 6;
    entidadesDetails.push(`${entityCount} entidades`);
  } else {
    entidadesDetails.push('Pocas entidades nombradas');
    recommendations.push('Menciona marcas, personas, organizaciones o conceptos específicos');
  }

  // Menciones de marca/autor en título o meta
  const brandInTitle = title.length > 0;
  if (brandInTitle) {
    entidadesScore += 5;
    entidadesDetails.push('Título presente');
  } else {
    recommendations.push('Añade un título claro y descriptivo');
  }

  // ========================================
  // 4. ANÁLISIS E-E-A-T (20 puntos)
  // ========================================
  let eeatScore = 0;
  const eeatDetails: string[] = [];

  // Señales de autoridad
  let authorityCount = 0;
  AUTHORITY_SIGNALS.forEach(pattern => {
    const matches = content.match(pattern) || [];
    authorityCount += matches.length;
  });

  if (authorityCount >= 5) {
    eeatScore += 10;
    eeatDetails.push(`${authorityCount} señales de autoridad`);
    strengths.push('Fuerte señalización de expertise y autoridad');
  } else if (authorityCount >= 2) {
    eeatScore += 5;
    eeatDetails.push(`${authorityCount} señales de autoridad`);
    recommendations.push('Cita más fuentes autorizadas y menciona credenciales');
  } else {
    eeatDetails.push('Pocas señales de autoridad');
    recommendations.push('Añade referencias a estudios, expertos o fuentes autorizadas');
  }

  // Experiencia (primera persona, casos prácticos)
  const experiencePatterns = /\b(he trabajado|mi experiencia|en mi caso|personalmente|hemos implementado|nuestro equipo)\b/gi;
  const experienceMatches = content.match(experiencePatterns) || [];
  if (experienceMatches.length >= 2) {
    eeatScore += 5;
    eeatDetails.push('Demuestra experiencia personal');
    strengths.push('Transmite experiencia práctica real');
  } else {
    recommendations.push('Añade experiencias personales o casos prácticos propios');
  }

  // Meta description
  if (metaDescription.length >= 120 && metaDescription.length <= 160) {
    eeatScore += 5;
    eeatDetails.push('Meta description óptima');
  } else if (metaDescription.length > 0) {
    eeatScore += 2;
    eeatDetails.push(`Meta description: ${metaDescription.length} caracteres`);
    recommendations.push('Ajusta la meta description a 120-160 caracteres');
  } else {
    recommendations.push('Añade una meta description descriptiva (120-160 caracteres)');
  }

  // ========================================
  // 5. ANÁLISIS DE FRESCURA (10 puntos)
  // ========================================
  let frescuraScore = 0;
  const frescuraDetails: string[] = [];

  // Año actual o reciente
  const currentYear = new Date().getFullYear();
  const yearPattern = new RegExp(`(${currentYear}|${currentYear - 1})`, 'g');
  const yearMatches = content.match(yearPattern) || [];

  if (yearMatches.length >= 2) {
    frescuraScore += 7;
    frescuraDetails.push(`Menciona año ${currentYear}/${currentYear - 1}`);
    strengths.push('Contenido actualizado - las IAs priorizan frescura');
  } else if (yearMatches.length >= 1) {
    frescuraScore += 4;
    frescuraDetails.push('Alguna referencia temporal reciente');
  } else {
    frescuraDetails.push('Sin referencias temporales actuales');
    recommendations.push(`Incluye referencias al año actual (${currentYear}) en título y contenido`);
  }

  // Palabras que indican actualidad
  const freshnessWords = /\b(actual|actualizado|reciente|nuevo|últim[oa]s?|2024|2025)\b/gi;
  const freshnessMatches = content.match(freshnessWords) || [];
  if (freshnessMatches.length >= 2) {
    frescuraScore += 3;
    frescuraDetails.push('Vocabulario de actualidad');
  }

  // ========================================
  // 6. ANÁLISIS DE FORMATO (5 puntos)
  // ========================================
  let formatoScore = 0;
  const formatoDetails: string[] = [];

  // Tablas (simuladas con | o tabulaciones)
  const tablePattern = /\|.+\|/g;
  const tables = content.match(tablePattern) || [];
  if (tables.length >= 3) {
    formatoScore += 2;
    formatoDetails.push('Contiene tablas');
    strengths.push('Uso de tablas - formato estructurado');
  }

  // Texto en negrita/énfasis (simulado con **)
  const boldPattern = /\*\*[^*]+\*\*/g;
  const boldMatches = content.match(boldPattern) || [];
  if (boldMatches.length >= 3) {
    formatoScore += 2;
    formatoDetails.push('Uso de énfasis/negrita');
  }

  // Párrafos no muy largos (< 150 palabras por párrafo)
  const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 150);
  if (longParagraphs.length === 0) {
    formatoScore += 1;
    formatoDetails.push('Párrafos de longitud adecuada');
  } else {
    recommendations.push('Divide los párrafos muy largos (máx. 150 palabras)');
  }

  // ========================================
  // CÁLCULO FINAL
  // ========================================
  const totalScore = Math.min(100, Math.round(
    (estructuraScore / 25 * 25) +
    (citabilidadScore / 25 * 25) +
    (entidadesScore / 15 * 15) +
    (eeatScore / 20 * 20) +
    (frescuraScore / 10 * 10) +
    (formatoScore / 5 * 5)
  ));

  return {
    score: totalScore,
    categories: {
      estructura: { score: estructuraScore, maxScore: 25, details: estructuraDetails },
      citabilidad: { score: citabilidadScore, maxScore: 25, details: citabilidadDetails },
      entidades: { score: entidadesScore, maxScore: 15, details: entidadesDetails },
      eeat: { score: eeatScore, maxScore: 20, details: eeatDetails },
      frescura: { score: frescuraScore, maxScore: 10, details: frescuraDetails },
      formato: { score: formatoScore, maxScore: 5, details: formatoDetails },
    },
    recommendations: recommendations.slice(0, 8), // Máximo 8 recomendaciones
    strengths: strengths.slice(0, 5), // Máximo 5 fortalezas
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--warning)';
  if (score >= 40) return '#f59e0b';
  return 'var(--danger)';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Mejorable';
  return 'Necesita trabajo';
}

export default function AnalizadorGeoPage() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    // Simulamos un pequeño delay para UX
    setTimeout(() => {
      const analysis = analyzeContent(content, title, metaDescription);
      setResult(analysis);
      setIsAnalyzing(false);
    }, 500);
  };

  const handleClear = () => {
    setContent('');
    setTitle('');
    setMetaDescription('');
    setResult(null);
  };

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🤖</span>
        <h1 className={styles.title}>Analizador GEO/AEO</h1>
        <p className={styles.subtitle}>
          Optimiza tu contenido para ser citado por ChatGPT, Perplexity, Gemini y Google AI Overviews
        </p>
      </header>

      {/* Plataformas */}
      <div className={styles.platformsBar}>
        <span className={styles.platformBadge}>ChatGPT</span>
        <span className={styles.platformBadge}>Perplexity</span>
        <span className={styles.platformBadge}>Gemini</span>
        <span className={styles.platformBadge}>AI Overviews</span>
        <span className={styles.platformBadge}>Claude</span>
        <span className={styles.platformBadge}>Copilot</span>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Título del contenido <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Guía Completa de Marketing Digital 2025"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Meta description <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Descripción de 120-160 caracteres..."
              className={styles.input}
              maxLength={200}
            />
            <span className={styles.charCount}>{metaDescription.length}/160</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Contenido a analizar <span className={styles.required}>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pega aquí el contenido de tu artículo, página web o documento...

Tip: Incluye los títulos, subtítulos, listas y todo el texto que quieras analizar."
              className={styles.textarea}
              rows={15}
            />
            <div className={styles.textareaFooter}>
              <span className={styles.wordCount}>{wordCount} palabras</span>
              {wordCount < 500 && wordCount > 0 && (
                <span className={styles.wordWarning}>Recomendado: +1500 palabras</span>
              )}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={handleAnalyze}
              disabled={!content.trim() || isAnalyzing}
              className={styles.btnPrimary}
            >
              {isAnalyzing ? 'Analizando...' : '🔍 Analizar Contenido'}
            </button>
            <button onClick={handleClear} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        {result && (
          <div className={styles.resultsPanel}>
            {/* Puntuación principal */}
            <div className={styles.scoreCard}>
              <div
                className={styles.scoreCircle}
                style={{ borderColor: getScoreColor(result.score) }}
              >
                <span className={styles.scoreNumber} style={{ color: getScoreColor(result.score) }}>
                  {result.score}
                </span>
                <span className={styles.scoreMax}>/100</span>
              </div>
              <div className={styles.scoreInfo}>
                <h2 className={styles.scoreLabel} style={{ color: getScoreColor(result.score) }}>
                  {getScoreLabel(result.score)}
                </h2>
                <p className={styles.scoreDesc}>Puntuación GEO</p>
              </div>
            </div>

            {/* Desglose por categorías */}
            <div className={styles.categoriesGrid}>
              {Object.entries(result.categories).map(([key, cat]) => (
                <div key={key} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryIcon}>
                      {key === 'estructura' && '📐'}
                      {key === 'citabilidad' && '📌'}
                      {key === 'entidades' && '🏷️'}
                      {key === 'eeat' && '🏆'}
                      {key === 'frescura' && '📅'}
                      {key === 'formato' && '✨'}
                    </span>
                    <span className={styles.categoryName}>
                      {key === 'estructura' && 'Estructura'}
                      {key === 'citabilidad' && 'Citabilidad'}
                      {key === 'entidades' && 'Entidades'}
                      {key === 'eeat' && 'E-E-A-T'}
                      {key === 'frescura' && 'Frescura'}
                      {key === 'formato' && 'Formato'}
                    </span>
                    <span className={styles.categoryScore}>
                      {cat.score}/{cat.maxScore}
                    </span>
                  </div>
                  <div className={styles.categoryBar}>
                    <div
                      className={styles.categoryProgress}
                      style={{
                        width: `${(cat.score / cat.maxScore) * 100}%`,
                        backgroundColor: getScoreColor((cat.score / cat.maxScore) * 100)
                      }}
                    />
                  </div>
                  <ul className={styles.categoryDetails}>
                    {cat.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Fortalezas */}
            {result.strengths.length > 0 && (
              <div className={styles.strengthsCard}>
                <h3 className={styles.sectionTitle}>✅ Fortalezas</h3>
                <ul className={styles.strengthsList}>
                  {result.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recomendaciones */}
            {result.recommendations.length > 0 && (
              <div className={styles.recommendationsCard}>
                <h3 className={styles.sectionTitle}>💡 Recomendaciones de Mejora</h3>
                <ul className={styles.recommendationsList}>
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Qué es GEO/AEO y por qué importa?"
        subtitle="Aprende a optimizar tu contenido para la nueva era de búsquedas con IA"
      >
        <section className={styles.guideSection}>
          <h2>El Cambio de Paradigma: De SEO a GEO</h2>
          <p>
            En 2025, más del 25% del tráfico web proviene de respuestas generadas por IA.
            ChatGPT procesa 72 mil millones de mensajes al mes, y Google AI Overviews
            aparece en el 13% de todas las búsquedas.
          </p>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>🎯 GEO (Generative Engine Optimization)</h4>
              <p>Optimizar para que las IAs generativas (ChatGPT, Claude, Gemini) citen tu contenido en sus respuestas.</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>💬 AEO (Answer Engine Optimization)</h4>
              <p>Estructurar contenido para que motores de respuesta (Perplexity, AI Overviews) lo extraigan como fuente.</p>
            </div>
          </div>

          <h3>Las 6 Categorías que Analizamos</h3>

          <div className={styles.categoryExplainer}>
            <div className={styles.explainerItem}>
              <span className={styles.explainerIcon}>📐</span>
              <div>
                <strong>Estructura (25%)</strong>
                <p>Títulos, subtítulos, listas, párrafos. Las IAs prefieren contenido bien organizado y escaneable.</p>
              </div>
            </div>

            <div className={styles.explainerItem}>
              <span className={styles.explainerIcon}>📌</span>
              <div>
                <strong>Citabilidad (25%)</strong>
                <p>Datos concretos, estadísticas, definiciones claras. Lo que las IAs pueden extraer y citar directamente.</p>
              </div>
            </div>

            <div className={styles.explainerItem}>
              <span className={styles.explainerIcon}>🏷️</span>
              <div>
                <strong>Entidades (15%)</strong>
                <p>Nombres propios, marcas, conceptos reconocibles. Ayudan a las IAs a contextualizar tu contenido.</p>
              </div>
            </div>

            <div className={styles.explainerItem}>
              <span className={styles.explainerIcon}>🏆</span>
              <div>
                <strong>E-E-A-T (20%)</strong>
                <p>Experience, Expertise, Authoritativeness, Trust. Señales de que el contenido proviene de una fuente confiable.</p>
              </div>
            </div>

            <div className={styles.explainerItem}>
              <span className={styles.explainerIcon}>📅</span>
              <div>
                <strong>Frescura (10%)</strong>
                <p>Referencias temporales actuales. Las IAs priorizan contenido actualizado sobre información antigua.</p>
              </div>
            </div>

            <div className={styles.explainerItem}>
              <span className={styles.explainerIcon}>✨</span>
              <div>
                <strong>Formato (5%)</strong>
                <p>Tablas, énfasis, longitud de párrafos. Elementos que facilitan la extracción de información.</p>
              </div>
            </div>
          </div>

          <h3>Datos Clave sobre Búsquedas con IA (2025)</h3>
          <ul>
            <li><strong>ChatGPT:</strong> 400M usuarios semanales, 72B mensajes/mes</li>
            <li><strong>Perplexity:</strong> 6-10x mayor CTR que búsqueda tradicional</li>
            <li><strong>AI Overviews:</strong> 13% de todas las búsquedas en Google</li>
            <li><strong>Listicles:</strong> 32% de todas las citaciones de IAs son listas</li>
            <li><strong>Predicción:</strong> 25% del tráfico orgánico migrará a IAs para 2026</li>
          </ul>
        </section>
      </EducationalSection>

      <Footer appName="analizador-geo" />
    </div>
  );
}
