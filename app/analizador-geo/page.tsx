'use client';

import { useState } from 'react';
import styles from './AnalizadorGeo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice />

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

        {/* ============================================
            SECCIÓN 1: TABLA COMPARATIVA
            ============================================ */}
        <section className={styles.guideSection}>
          <h2>GEO/AEO vs SEO Tradicional vs SEM: Tabla Comparativa</h2>
          <p>
            Entender las diferencias entre estos tres enfoques es esencial para
            construir una estrategia de visibilidad digital completa en el mercado
            hispanohablante de 2025.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>GEO / AEO</th>
                  <th>SEO Tradicional</th>
                  <th>SEM (Publicidad)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Objetivo principal</strong></td>
                  <td>Ser citado en respuestas de IAs generativas</td>
                  <td>Posicionar en primeras páginas de Google/Bing</td>
                  <td>Aparecer como anuncio en búsquedas de pago</td>
                </tr>
                <tr>
                  <td><strong>Audiencia</strong></td>
                  <td>Modelos de IA (ChatGPT, Perplexity, Gemini)</td>
                  <td>Algoritmo de Google + usuarios humanos</td>
                  <td>Usuarios humanos con intención de compra</td>
                </tr>
                <tr>
                  <td><strong>Métricas de éxito</strong></td>
                  <td>Citas en respuestas IA, menciones de marca</td>
                  <td>Posición media, tráfico orgánico, CTR</td>
                  <td>CPC, conversiones, ROAS, impresiones</td>
                </tr>
                <tr>
                  <td><strong>Tiempo para ver resultados</strong></td>
                  <td>3–6 meses (datos en modelos de IA)</td>
                  <td>4–12 meses (indexación + autoridad)</td>
                  <td>Inmediato (desde el primer euro invertido)</td>
                </tr>
                <tr>
                  <td><strong>Tipo de contenido óptimo</strong></td>
                  <td>Respuestas directas, datos verificables, E-E-A-T</td>
                  <td>Contenido largo, keywords, backlinks</td>
                  <td>Landing pages optimizadas para conversión</td>
                </tr>
                <tr>
                  <td><strong>Herramientas de medición</strong></td>
                  <td>Perplexity manual, Brand24, SparkToro</td>
                  <td>Google Search Console, Semrush, Ahrefs</td>
                  <td>Google Ads, Meta Ads Manager, Analytics</td>
                </tr>
                <tr>
                  <td><strong>Coste</strong></td>
                  <td>Solo tiempo y recursos de contenido</td>
                  <td>Bajo-medio (herramientas + redactores)</td>
                  <td>Alto (presupuesto publicitario continuo)</td>
                </tr>
                <tr>
                  <td><strong>Durabilidad</strong></td>
                  <td>Alta (si E-E-A-T es sólido)</td>
                  <td>Media (puede caer con actualizaciones)</td>
                  <td>Baja (desaparece al detener la inversión)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================
            SECCIÓN 2: CASOS DE USO
            ============================================ */}
        <section className={styles.guideSection}>
          <h2>¿Para Quién es GEO/AEO? Casos de Uso Reales</h2>
          <p>
            GEO y AEO no son solo para grandes empresas. Cualquier profesional o
            negocio que quiera ser visible cuando las IAs responden preguntas de
            sus potenciales clientes puede beneficiarse de estas técnicas.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔍</span>
                <strong>Consultor SEO / Agencia Digital</strong>
              </div>
              <p className={styles.escenarioExample}>
                <em>Situación:</em> Un consultor SEO en Madrid publica guías técnicas
                sobre posicionamiento pero no aparece cuando alguien pregunta a
                ChatGPT «¿qué agencia SEO recomiendas en España?» o a Perplexity
                «mejores expertos SEO hispanohablantes».
              </p>
              <p className={styles.escenarioTip}>
                <strong>Estrategia GEO:</strong> Publicar estudios de caso con datos
                propios, obtener menciones en medios como Xataka o Marketing4eCommerce,
                y estructurar contenido con respuestas directas a preguntas frecuentes
                del sector. El objetivo es que Perplexity y SearchGPT citen tu blog
                como fuente autorizada.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <strong>Empresa B2B (Software, Consultoría)</strong>
              </div>
              <p className={styles.escenarioExample}>
                <em>Situación:</em> Una empresa de software ERP para pymes españolas
                quiere aparecer en respuestas de IAs corporativas como Microsoft
                Copilot cuando un director financiero pregunta «¿qué ERP es mejor
                para una empresa de 50 empleados en España?».
              </p>
              <p className={styles.escenarioTip}>
                <strong>Estrategia GEO:</strong> Crear comparativas detalladas con
                datos propios, obtener reseñas en Capterra y G2, publicar whitepapers
                descargables con estadísticas del mercado español, e implementar
                Schema Organization y FAQ en la web corporativa.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <strong>Creador de Contenido Educativo</strong>
              </div>
              <p className={styles.escenarioExample}>
                <em>Situación:</em> Un profesor o creador de cursos online en español
                sobre programación, finanzas o idiomas quiere que Gemini y Claude
                recomienden sus recursos cuando los usuarios buscan «mejores cursos
                de Python en español» o «cómo aprender Excel desde cero».
              </p>
              <p className={styles.escenarioTip}>
                <strong>Estrategia GEO:</strong> Estructurar cada lección con
                definiciones claras (formato «concepto: definición en una frase»),
                publicar resúmenes con estadísticas de aprendizaje, y conseguir
                menciones en foros como Reddit en español, StackOverflow y comunidades
                de Discord especializadas.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛍️</span>
                <strong>Tienda Online / eCommerce</strong>
              </div>
              <p className={styles.escenarioExample}>
                <em>Situación:</em> Una tienda online española de material deportivo
                quiere que cuando alguien pregunte a Perplexity «¿cuál es la mejor
                zapatilla para correr menos de 100€?» o a ChatGPT «dónde comprar
                equipamiento de trail running en España», su marca aparezca como
                recomendación.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Estrategia GEO:</strong> Crear guías de compra con comparativas
                reales (con datos de rendimiento, no solo precios), obtener reviews
                en Google My Business y Trustpilot, implementar Schema Product y
                Review, y publicar contenido editorial con datos del mercado español
                de deportes (cifras de la industria, estadísticas de usuarios).
              </p>
            </div>
          </div>
        </section>

        {/* ============================================
            SECCIÓN 3: FAQ
            ============================================ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre GEO y AEO</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué es GEO y AEO, y cómo se diferencian entre sí?</h4>
              <p>
                <strong>GEO (Generative Engine Optimization)</strong> se centra en
                optimizar el contenido para que los modelos de IA generativa (ChatGPT,
                Claude, Gemini) lo citen en sus respuestas de texto libre.
                <strong> AEO (Answer Engine Optimization)</strong> se enfoca en los
                motores de respuesta directa como Perplexity AI, Google AI Overviews
                o SearchGPT, que responden preguntas concretas extrayendo fragmentos
                de fuentes web en tiempo real. La diferencia práctica: GEO trabaja con
                el conocimiento entrenado en el modelo, mientras que AEO trabaja con
                la recuperación en tiempo real.
              </p>
              <p className={styles.faqTip}>
                Dato: Perplexity realiza búsquedas web en tiempo real para cada consulta,
                lo que significa que un contenido publicado hoy puede aparecer como
                fuente mañana. Los modelos como GPT-4 tienen fecha de corte de
                conocimiento, por lo que el impacto es más a largo plazo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué las IAs citan ciertos sitios y no otros?</h4>
              <p>
                Las IAs priorizan fuentes que combinan tres factores: <strong>autoridad
                de dominio</strong> (sitios con muchos backlinks de calidad, como
                Wikipedia, publicaciones académicas o medios de referencia),
                <strong> relevancia temática</strong> (el contenido debe responder
                directamente a la pregunta formulada, con definiciones claras y datos
                concretos), y <strong>E-E-A-T</strong> (señales de experiencia,
                expertise, autoridad y confianza). Un estudio de BrightEdge de 2024
                reveló que el 79% de las fuentes citadas por AI Overviews de Google
                también aparecen en el top 10 de resultados orgánicos para esa misma
                consulta.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo sabe una IA qué fuentes son autoritativas?</h4>
              <p>
                Los modelos de lenguaje aprenden la autoridad de una fuente durante
                el entrenamiento: cuantas más veces un sitio es citado, enlazado o
                mencionado en el corpus de entrenamiento, más probabilidad tiene de
                aparecer como fuente. Para los modelos con búsqueda en tiempo real
                (Perplexity, SearchGPT), los factores son similares al SEO clásico:
                Domain Authority, backlinks de calidad, y señales de marca (menciones
                sin enlace en redes sociales, prensa, podcasts). En el mercado español,
                estar mencionado en El País, Xataka, El Confidencial o en rankings de
                LinkedIn Noticias aumenta significativamente la autoridad percibida.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo afecta GEO al tráfico orgánico de mi web?</h4>
              <p>
                El impacto es dual. Por un lado, las AI Overviews de Google están
                reduciendo el CTR orgánico en búsquedas informacionales: un estudio
                de Advanced Web Ranking de 2024 mostró una caída del 18-64% en clics
                cuando aparece un AI Overview. Por otro lado, si tu sitio es citado
                como fuente, recibes <strong>tráfico de alta intención</strong>: usuarios
                que ya leyeron la respuesta de la IA y quieren profundizar. En España,
                donde Google tiene más del 95% del mercado de búsqueda, optimizar para
                AI Overviews es especialmente crítico.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué tipo de contenido posiciona mejor en las IAs?</h4>
              <p>
                Según el estudio de Princeton/Georgia Tech/IIT Delhi (2023) sobre GEO,
                el contenido que más aumenta la visibilidad en sistemas RAG (Retrieval
                Augmented Generation) incluye: estadísticas y datos concretos (+40% de
                citaciones), citas de fuentes autorizadas (+47%), y lenguaje fluido y
                persuasivo (+17%). En la práctica: respuestas directas en el primer
                párrafo, listas numeradas o con viñetas, definiciones explícitas en
                formato «X es Y», tablas comparativas, y secciones FAQ estructuradas.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿En qué se diferencia GEO de los Featured Snippets de Google?</h4>
              <p>
                Los Featured Snippets (posición 0 de Google) son extracciones de texto
                de páginas web que responden una query concreta en el buscador
                tradicional. GEO/AEO va más allá: las IAs generan respuestas sintetizadas
                combinando múltiples fuentes. La diferencia clave es que en un Featured
                Snippet hay <strong>un solo ganador</strong>, mientras que en una
                respuesta de Perplexity o AI Overview pueden aparecer 3-5 fuentes
                simultáneamente. Además, GEO funciona también para consultas
                conversacionales complejas («¿cuál es la mejor estrategia para...?»)
                donde los Featured Snippets no existen.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo puedo medir si una IA me está citando?</h4>
              <p>
                Actualmente no existe una herramienta oficial para rastrear citas en
                IAs generativas. Las opciones disponibles son: (1) <strong>búsqueda
                manual</strong> en Perplexity, ChatGPT y Gemini con queries relevantes
                a tu sector; (2) <strong>Brand24 o Mention</strong> configurados para
                detectar menciones de tu marca o URL en foros donde se comparten
                conversaciones con IAs; (3) <strong>SparkToro</strong> para analizar
                qué fuentes lee tu audiencia objetivo; (4) monitorizar los referrers
                en Google Analytics 4 buscando tráfico proveniente de chat.openai.com,
                perplexity.ai o gemini.google.com.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuánto tiempo tarda GEO en dar resultados visibles?</h4>
              <p>
                Para motores con búsqueda en tiempo real como <strong>Perplexity</strong>,
                los resultados pueden verse en 2-4 semanas si el contenido nuevo se
                indexa correctamente. Para modelos con fecha de corte como
                <strong> GPT-4</strong> (abril 2023 para la versión base), el contenido
                publicado hoy entrará en futuros reentrenamientos, con un horizonte
                de 6-18 meses. Para <strong>Google AI Overviews</strong>, al usar el
                índice de Google en tiempo real, el plazo es similar al SEO orgánico:
                3-6 meses para contenido nuevo en sitios sin autoridad previa. La
                recomendación para el mercado español: empezar por optimizar para
                Perplexity (resultados más rápidos) mientras se trabaja la autoridad
                a largo plazo.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================
            SECCIÓN 4: GUÍA PASO A PASO
            ============================================ */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Optimiza tu Sitio para ser Citado por IAs</h2>
          <p>
            Sigue estos 7 pasos para transformar tu contenido existente y los nuevos
            artículos en fuentes que las IAs generativas quieran citar. Aplica estos
            pasos en orden: los primeros tienen mayor impacto a corto plazo.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Audita tu contenido actual con criterios GEO</h4>
                <p>
                  Identifica tus 10 páginas con más tráfico orgánico. Para cada una,
                  evalúa: ¿responde directamente una pregunta en los primeros 100
                  palabras? ¿Contiene al menos 3 estadísticas con fuente citada? ¿Tiene
                  sección FAQ? ¿Menciona el año actual? ¿Está firmada por un autor con
                  credenciales verificables? Usa la herramienta de análisis de esta
                  página para obtener una puntuación GEO inicial de cada URL.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Reescribe el primer párrafo con respuesta directa</h4>
                <p>
                  Las IAs extraen principalmente el primer bloque de texto que responde
                  la query. Técnica: empieza cada artículo con una definición o respuesta
                  en 2-3 frases («X es Y. Se usa para Z. El beneficio principal es W.»),
                  antes de cualquier introducción narrativa. Ejemplo: en lugar de «En
                  este artículo exploraremos el marketing de contenidos...», escribe
                  «El marketing de contenidos es una estrategia de atracción que consiste
                  en crear material valioso para atraer y retener clientes. Las empresas
                  que lo aplican generan 3 veces más leads que las que usan publicidad
                  de pago exclusivamente (HubSpot, 2024).»
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Añade datos verificables con fuentes primarias</h4>
                <p>
                  Cada claim importante debe ir acompañado de una fuente citada
                  explícitamente. Prioriza: informes de organismos oficiales (INE,
                  ONTSI, Comisión Europea), estudios de universidades españolas o
                  internacionales de prestigio, datos de empresas de referencia del
                  sector (Gartner, Forrester, Nielsen). Formato recomendado: «Según
                  el informe Digital Economy and Society Index 2024 de la Comisión
                  Europea, España ocupa el puesto 14 de 27 en digitalización empresarial.»
                  Esta cita explícita aumenta 47% la probabilidad de ser referenciado
                  por IAs (estudio GEO de Princeton, 2023).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Implementa Schema Markup FAQ y HowTo</h4>
                <p>
                  El marcado estructurado en JSON-LD ayuda tanto a Google AI Overviews
                  como a los scrapers de Perplexity a entender la estructura de tu
                  contenido. Implementa <strong>FAQPage Schema</strong> en todas las
                  páginas con preguntas y respuestas, y <strong>HowTo Schema</strong>
                  en guías paso a paso. Para Spain, añade también <strong>LocalBusiness
                  Schema</strong> con datos en español e idioma «es-ES». Usa Google
                  Search Console para verificar que el marcado se detecta correctamente.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Construye autoridad temática (E-E-A-T)</h4>
                <p>
                  Crea una página «Sobre el autor» o «Sobre el equipo» con credenciales
                  verificables: LinkedIn, publicaciones, años de experiencia, certificaciones.
                  Añade la firma del autor con datos estructurados en cada artículo.
                  Consigue menciones editoriales en medios españoles de referencia
                  (Xataka, Marketing4eCommerce, El Referente, El Español Tecnología).
                  Participa activamente en foros especializados como la comunidad SEO
                  Sistrix en español o el Slack de Ahrefs en castellano, donde tus
                  comentarios pueden ser indexados y citados por IAs.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Actualiza el contenido regularmente con marca de fecha</h4>
                <p>
                  Las IAs priorizan fuentes frescas. Añade la fecha de última actualización
                  visible en el artículo («Actualizado: marzo 2026») y en los metadatos
                  con Schema <em>dateModified</em>. Establece un calendario de revisión
                  trimestral para tus 20 páginas principales: actualiza estadísticas,
                  añade referencias al año en curso, y elimina datos obsoletos. En el
                  mercado español, los contenidos sobre legislación (LOPD, normativa
                  fiscal), estadísticas del INE, y rankings de herramientas deben
                  actualizarse como mínimo dos veces al año.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Mide y ajusta: busca manualmente en las IAs de referencia</h4>
                <p>
                  Establece un proceso de monitorización mensual: busca 10-15 queries
                  relevantes para tu sector en Perplexity, ChatGPT (con búsqueda
                  activada) y Gemini con Google Search activo. Registra en una hoja de
                  cálculo si tu dominio aparece como fuente citada, en qué posición
                  y con qué fragmento de texto. Si en 3 meses no apareces, revisa la
                  autoridad del dominio (DA en Moz, DR en Ahrefs) y analiza qué sitios
                  sí son citados para entender qué les diferencia. Este benchmark
                  competitivo es el equivalente GEO del análisis de SERP en SEO clásico.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECCIÓN 5: MEJORES PRÁCTICAS
            ============================================ */}
        <section className={styles.guideSection}>
          <h2>6 Mejores Prácticas de GEO para el Mercado Hispanohablante</h2>
          <p>
            Estas prácticas están validadas por estudios sobre comportamiento de IAs
            generativas y adaptadas a la realidad del mercado digital en español,
            donde la competencia en GEO todavía es baja comparada con el mercado
            anglófono.
          </p>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💬</span>
              <h4>Respuesta directa antes que introducción</h4>
              <p>
                Las IAs extraen el primer bloque relevante. Coloca la respuesta completa
                a la pregunta principal en los primeros 150 palabras, usando el formato:
                «[Término] es [definición]. Se caracteriza por [X, Y, Z]. El beneficio
                clave para [audiencia] es [beneficio medible].» Evita las introducciones
                que «anuncian» lo que se va a explicar: ve al grano desde la primera
                frase.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h4>Datos verificables con fuentes citadas explícitamente</h4>
              <p>
                No basta con decir «los estudios demuestran». Cita la fuente con nombre,
                año y, si es posible, URL: «Según el Informe sobre el Estado Digital en
                España 2025 de IAB Spain, el 78% de los usuarios de entre 16 y 65 años
                utiliza asistentes de voz o IAs conversacionales al menos una vez al mes.»
                Las fuentes primarias (INE, Eurostat, organismos oficiales) tienen mayor
                peso que las secundarias.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏆</span>
              <h4>E-E-A-T: Demuestra experiencia, no solo conocimiento</h4>
              <p>
                Google definió E-E-A-T (Experience, Expertise, Authoritativeness,
                Trustworthiness) y las IAs han adoptado criterios similares. La «E» de
                Experience es la más nueva y diferenciadora: incluye casos reales propios,
                resultados de clientes anonimizados, errores cometidos y aprendizajes.
                En el mercado español, el contenido firmado por autores con perfiles
                verificables en LinkedIn con +500 conexiones del sector tiene
                significativamente mayor autoridad percibida.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏷️</span>
              <h4>Schema FAQ y HowTo en todas las páginas clave</h4>
              <p>
                El marcado Schema.org no solo ayuda a Google: Perplexity y otros motores
                AEO usan el HTML semántico para entender la estructura del contenido.
                Implementa FAQPage Schema en páginas de servicio y producto, HowTo en
                guías, y Article con <em>author</em> y <em>dateModified</em> en todos los
                posts del blog. En WordPress, usa RankMath o Yoast SEO Premium para
                gestionar el Schema sin editar código. En sitios custom, añade el
                JSON-LD en el <code>&lt;head&gt;</code> de cada página.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔗</span>
              <h4>Cita fuentes primarias y enlaza a ellas</h4>
              <p>
                Los sitios que enlazan a fuentes primarias de autoridad (estudios
                universitarios, informes de organismos oficiales, publicaciones científicas)
                tienen mayor credibilidad para las IAs. Añade entre 3-5 enlaces externos
                a fuentes de autoridad por cada 1.000 palabras. Para el mercado español:
                INE, Banco de España, CNMV, ONTSI, Ministerios, y publicaciones de
                universidades públicas españolas (UCM, UAB, UPV). Este hábito también
                mejora el SEO orgánico.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h4>Formato «pregunta → respuesta corta → desarrollo»</h4>
              <p>
                Estructura cada sección importante siguiendo este patrón de tres capas:
                (1) la pregunta como título H2 o H3 (ej: «¿Cuánto tarda el SEO en dar
                resultados?»), (2) una respuesta directa en 1-2 frases en el primer
                párrafo (ej: «El SEO tarda entre 4 y 12 meses en mostrar resultados
                significativos»), y (3) el desarrollo detallado con matices, excepciones
                y ejemplos. Este formato es exactamente lo que los sistemas RAG de
                Perplexity, AI Overviews y SearchGPT buscan para extraer fragmentos.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================
            SECCIÓN 6: WARNING BOX
            ============================================ */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>6 Errores Comunes que Impiden ser Citado por las IAs</h3>
            </div>
            <p>
              Evita estos errores frecuentes que detectamos en sitios web españoles
              analizados. Son las razones más habituales por las que un contenido
              de calidad sigue sin aparecer como fuente en las respuestas de IAs.
            </p>
            <ul className={styles.warningList}>
              <li>
                <strong>Contenido genérico sin datos únicos:</strong> Artículos que
                repiten información disponible en cientos de sitios sin aportar datos
                propios, perspectivas originales o experiencias reales. Las IAs prefieren
                fuentes con información que no pueden obtener en otro sitio. Si tu
                contenido podría estar escrito por cualquiera, no tiene ventaja competitiva
                para ser citado.
              </li>
              <li>
                <strong>No tener autoridad temática en el dominio:</strong> Publicar
                un artículo excelente sobre SEO en un blog de recetas tiene muy baja
                probabilidad de ser citado por una IA para consultas sobre marketing
                digital. La coherencia temática del dominio (todos los artículos del
                mismo campo) es una señal de autoridad que los modelos valoran, al
                igual que Google con el concepto de «topical authority».
              </li>
              <li>
                <strong>Ignorar la estructura de respuesta directa:</strong> Contenido
                bien escrito pero sin respuestas explícitas a preguntas concretas.
                Las IAs necesitan extraer un fragmento que responda la query; si el
                contenido es narrativo o ensayístico sin respuestas directas, el modelo
                no puede usarlo eficientemente como fuente.
              </li>
              <li>
                <strong>No actualizar el contenido ni marcar la fecha de revisión:</strong>
                Un artículo sin fecha visible o con la última actualización hace más de
                2 años es penalizado por las IAs en favor de fuentes más recientes.
                Especialmente crítico en sectores de rápida evolución como tecnología,
                marketing digital, fiscalidad o legislación española.
              </li>
              <li>
                <strong>Copiar o parafrasear contenido de otras fuentes:</strong> El
                contenido que es esencialmente una reformulación de otros artículos
                no aporta valor único. Los modelos de lenguaje son capaces de detectar
                la originalidad del contenido durante el entrenamiento. La copia de
                contenido también viola las directrices de calidad de Google y reduce
                la probabilidad de indexación por AI Overviews.
              </li>
              <li>
                <strong>No tener presencia de marca consistente en múltiples fuentes:</strong>
                Si tu nombre de marca o URL solo aparece en tu propio sitio, las IAs no
                tienen señales externas de autoridad. Las menciones en foros (Forocoches
                para temas de consumo, InfoJobs para RRHH, Rankia para finanzas personales),
                redes sociales, directorios sectoriales y notas de prensa son señales de
                existencia y autoridad que los modelos incorporan durante el entrenamiento.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('analizador-geo')} />
      <ShareCard appName="analizador-geo" />
      <Footer appName="analizador-geo" />
    </div>
  );
}
