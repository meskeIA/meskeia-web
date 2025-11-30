'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorPalabrasClave.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import EducationalSection from '@/components/EducationalSection';

// Modificadores para generar variaciones
const MODIFICADORES = {
  preguntas: [
    'qué es', 'cómo', 'por qué', 'cuándo', 'dónde', 'quién',
    'cuál es el mejor', 'cuánto cuesta', 'cómo funciona', 'para qué sirve',
    'cómo hacer', 'cómo usar', 'cómo elegir', 'cómo saber',
  ],
  comparativas: [
    'vs', 'o', 'mejor que', 'diferencia entre', 'comparativa',
    'alternativas a', 'similar a', 'como',
  ],
  comerciales: [
    'comprar', 'precio', 'barato', 'oferta', 'descuento', 'mejor',
    'top', 'ranking', 'opiniones', 'reseñas', 'análisis',
  ],
  informacionales: [
    'guía', 'tutorial', 'curso', 'aprende', 'tipos de', 'ejemplos de',
    'definición de', 'significado de', 'historia de', 'beneficios de',
  ],
  locales: [
    'cerca de mí', 'en Madrid', 'en Barcelona', 'en España', 'online',
    'a domicilio', 'urgente', '24 horas',
  ],
  temporales: [
    '2025', '2024', 'este año', 'actualizado', 'nuevo', 'últimas tendencias',
  ],
  especificos: [
    'para principiantes', 'para profesionales', 'para empresas', 'gratis',
    'premium', 'paso a paso', 'fácil', 'rápido', 'sin experiencia',
  ],
};

const LETRAS = 'abcdefghijklmnopqrstuvwxyz'.split('');

interface KeywordGroup {
  categoria: string;
  icono: string;
  keywords: string[];
}

export default function GeneradorPalabrasClavePage() {
  const [semilla, setSemilla] = useState('');
  const [categorias, setCategorias] = useState({
    preguntas: true,
    comparativas: true,
    comerciales: true,
    informacionales: true,
    locales: false,
    temporales: true,
    especificos: true,
    alfabeto: true,
  });
  const [copiado, setCopiado] = useState(false);

  const keywords = useMemo((): KeywordGroup[] => {
    const s = semilla.trim().toLowerCase();
    if (!s) return [];

    const grupos: KeywordGroup[] = [];

    if (categorias.preguntas) {
      grupos.push({
        categoria: 'Preguntas',
        icono: '❓',
        keywords: MODIFICADORES.preguntas.map(m => `${m} ${s}`),
      });
    }

    if (categorias.comparativas) {
      grupos.push({
        categoria: 'Comparativas',
        icono: '⚖️',
        keywords: [
          `${s} vs`,
          `${s} o`,
          `mejor ${s}`,
          `${s} alternativas`,
          `comparativa ${s}`,
          `diferencia ${s}`,
        ],
      });
    }

    if (categorias.comerciales) {
      grupos.push({
        categoria: 'Comerciales / Transaccionales',
        icono: '🛒',
        keywords: MODIFICADORES.comerciales.map(m => `${m} ${s}`).concat(
          MODIFICADORES.comerciales.map(m => `${s} ${m}`)
        ),
      });
    }

    if (categorias.informacionales) {
      grupos.push({
        categoria: 'Informacionales',
        icono: '📚',
        keywords: MODIFICADORES.informacionales.map(m => `${m} ${s}`).concat(
          MODIFICADORES.informacionales.map(m => `${s} ${m}`)
        ),
      });
    }

    if (categorias.locales) {
      grupos.push({
        categoria: 'Búsquedas Locales',
        icono: '📍',
        keywords: MODIFICADORES.locales.map(m => `${s} ${m}`),
      });
    }

    if (categorias.temporales) {
      grupos.push({
        categoria: 'Temporales / Actualizadas',
        icono: '📅',
        keywords: MODIFICADORES.temporales.map(m => `${s} ${m}`).concat(
          MODIFICADORES.temporales.map(m => `${m} ${s}`)
        ),
      });
    }

    if (categorias.especificos) {
      grupos.push({
        categoria: 'Audiencia Específica',
        icono: '🎯',
        keywords: MODIFICADORES.especificos.map(m => `${s} ${m}`),
      });
    }

    if (categorias.alfabeto) {
      grupos.push({
        categoria: 'Autocompletado A-Z',
        icono: '🔤',
        keywords: LETRAS.map(letra => `${s} ${letra}`),
      });
    }

    return grupos;
  }, [semilla, categorias]);

  const totalKeywords = keywords.reduce((sum, g) => sum + g.keywords.length, 0);

  const copiarTodas = async () => {
    const todas = keywords.flatMap(g => g.keywords).join('\n');
    try {
      await navigator.clipboard.writeText(todas);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = todas;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const copiarGrupo = async (kws: string[]) => {
    try {
      await navigator.clipboard.writeText(kws.join('\n'));
      alert('✅ Keywords copiadas');
    } catch {
      alert('Error al copiar');
    }
  };

  const exportarCSV = () => {
    const todas = keywords.flatMap(g =>
      g.keywords.map(k => `"${k}","${g.categoria}"`)
    );
    const csv = 'Keyword,Categoría\n' + todas.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keywords-${semilla.replace(/\s+/g, '-')}.csv`;
    link.click();
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔑 Generador de Palabras Clave</h1>
        <p className={styles.subtitle}>
          Genera cientos de ideas de keywords long-tail para tu estrategia SEO
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>🌱 Palabra clave semilla</h2>

          <div className={styles.inputGroup}>
            <input
              type="text"
              value={semilla}
              onChange={(e) => setSemilla(e.target.value)}
              placeholder="ej: marketing digital, zapatillas running, SEO..."
              className={styles.inputLarge}
            />
          </div>

          <div className={styles.categoriesSection}>
            <label className={styles.sectionLabel}>Tipos de keywords a generar:</label>
            <div className={styles.categoriesGrid}>
              {Object.entries({
                preguntas: { label: 'Preguntas (qué, cómo, por qué...)', icon: '❓' },
                comparativas: { label: 'Comparativas (vs, mejor que...)', icon: '⚖️' },
                comerciales: { label: 'Comerciales (comprar, precio...)', icon: '🛒' },
                informacionales: { label: 'Informacionales (guía, tutorial...)', icon: '📚' },
                locales: { label: 'Locales (cerca de mí, en Madrid...)', icon: '📍' },
                temporales: { label: 'Temporales (2025, actualizado...)', icon: '📅' },
                especificos: { label: 'Audiencia (principiantes, gratis...)', icon: '🎯' },
                alfabeto: { label: 'Autocompletado A-Z', icon: '🔤' },
              }).map(([key, { label, icon }]) => (
                <label key={key} className={styles.categoryCheck}>
                  <input
                    type="checkbox"
                    checked={categorias[key as keyof typeof categorias]}
                    onChange={(e) => setCategorias({ ...categorias, [key]: e.target.checked })}
                  />
                  <span className={styles.categoryIcon}>{icon}</span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {totalKeywords > 0 && (
            <div className={styles.actions}>
              <button onClick={copiarTodas} className={styles.btnPrimary}>
                {copiado ? '✅ Copiadas!' : `📋 Copiar todas (${totalKeywords})`}
              </button>
              <button onClick={exportarCSV} className={styles.btnSecondary}>
                📥 Exportar CSV
              </button>
            </div>
          )}
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {keywords.length > 0 ? (
            <>
              <div className={styles.resultsHeader}>
                <h2 className={styles.panelTitle}>
                  🎯 {totalKeywords} keywords generadas
                </h2>
              </div>

              <div className={styles.keywordGroups}>
                {keywords.map((grupo) => (
                  <div key={grupo.categoria} className={styles.keywordGroup}>
                    <div className={styles.groupHeader}>
                      <span className={styles.groupIcon}>{grupo.icono}</span>
                      <span className={styles.groupTitle}>{grupo.categoria}</span>
                      <span className={styles.groupCount}>{grupo.keywords.length}</span>
                      <button
                        onClick={() => copiarGrupo(grupo.keywords)}
                        className={styles.copyGroupBtn}
                        title="Copiar grupo"
                      >
                        📋
                      </button>
                    </div>
                    <div className={styles.keywordsList}>
                      {grupo.keywords.map((kw) => (
                        <span key={kw} className={styles.keywordTag}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🔑</div>
              <p>Introduce una palabra clave semilla para generar ideas</p>
              <div className={styles.examples}>
                <span>Ejemplos:</span>
                <button onClick={() => setSemilla('marketing digital')}>marketing digital</button>
                <button onClick={() => setSemilla('recetas')}>recetas</button>
                <button onClick={() => setSemilla('inversiones')}>inversiones</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips rápidos */}
      <div className={styles.tipsSection}>
        <h3>💡 Cómo usar estas keywords</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📝</span>
            <h4>Crea contenido</h4>
            <p>Usa las preguntas como títulos de artículos o secciones FAQ</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔍</span>
            <h4>Valida en Google</h4>
            <p>Busca cada keyword y mira los resultados de autocompletado</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📊</span>
            <h4>Agrupa por intención</h4>
            <p>Separa informacionales, transaccionales y navegacionales</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <h4>Prioriza long-tail</h4>
            <p>Las keywords de 3+ palabras tienen menos competencia</p>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 Guía de Investigación de Palabras Clave"
        subtitle="Aprende a encontrar las mejores keywords para tu estrategia SEO"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Qué son las palabras clave long-tail?</h2>
            <p>
              Las palabras clave long-tail son frases de búsqueda más largas y específicas
              (normalmente 3+ palabras). Aunque tienen menor volumen de búsqueda individual,
              representan el 70% de todas las búsquedas y tienen mayor intención de conversión.
            </p>
            <div className={styles.comparisonTable}>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>
                  <strong>Short-tail:</strong> &quot;zapatillas&quot;
                </div>
                <div className={styles.comparisonCell}>
                  Alta competencia, baja conversión
                </div>
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>
                  <strong>Long-tail:</strong> &quot;zapatillas running pronador mujer&quot;
                </div>
                <div className={styles.comparisonCell}>
                  Baja competencia, alta conversión
                </div>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Tipos de intención de búsqueda</h2>
            <div className={styles.intentGrid}>
              <div className={styles.intentCard}>
                <h4>🔍 Informacional</h4>
                <p>&quot;qué es SEO&quot;, &quot;cómo hacer pan&quot;</p>
                <span className={styles.intentTag}>Aprenden</span>
              </div>
              <div className={styles.intentCard}>
                <h4>🧭 Navegacional</h4>
                <p>&quot;login facebook&quot;, &quot;amazon prime&quot;</p>
                <span className={styles.intentTag}>Buscan sitio</span>
              </div>
              <div className={styles.intentCard}>
                <h4>🛒 Transaccional</h4>
                <p>&quot;comprar iPhone 15&quot;, &quot;precio hosting&quot;</p>
                <span className={styles.intentTag}>Quieren comprar</span>
              </div>
              <div className={styles.intentCard}>
                <h4>🔬 Investigación comercial</h4>
                <p>&quot;mejor portátil 2025&quot;, &quot;opiniones X&quot;</p>
                <span className={styles.intentTag}>Comparando</span>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Pasos para una buena investigación</h2>
            <ol className={styles.stepsList}>
              <li><strong>Define tu tema semilla:</strong> El producto, servicio o temática principal</li>
              <li><strong>Genera variaciones:</strong> Usa esta herramienta para expandir ideas</li>
              <li><strong>Valida en Google:</strong> Mira autocompletado y búsquedas relacionadas</li>
              <li><strong>Analiza competencia:</strong> ¿Quién rankea? ¿Puedes competir?</li>
              <li><strong>Agrupa por intención:</strong> Organiza en clusters temáticos</li>
              <li><strong>Prioriza:</strong> Elige las de mejor ratio volumen/competencia</li>
            </ol>
          </section>
        </div>
      </EducationalSection>

      <Footer appName="generador-palabras-clave" />
    </div>
  );
}
