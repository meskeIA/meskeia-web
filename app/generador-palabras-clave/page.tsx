'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorPalabrasClave.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice />

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

          {/* SECCIÓN 1: Tabla Comparativa de tipos de palabras clave */}
          <section className={styles.eduSection}>
            <h2>Comparativa de tipos de palabras clave</h2>
            <p>
              No todas las keywords son iguales. Conocer sus características te ayuda a elegir
              las adecuadas según el estado de madurez de tu web y tus objetivos de negocio.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Volumen típico</th>
                    <th>Dificultad</th>
                    <th>Intención</th>
                    <th>Tasa conversión</th>
                    <th>Cuándo usarlas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Head terms (1 palabra)</strong></td>
                    <td>10.000 – 1M+/mes</td>
                    <td>Muy alta (KD 70-100)</td>
                    <td>Ambigua</td>
                    <td>0,5 – 1%</td>
                    <td>Webs con mucha autoridad (DA 50+)</td>
                  </tr>
                  <tr>
                    <td><strong>Long-tail (3+ palabras)</strong></td>
                    <td>10 – 2.000/mes</td>
                    <td>Baja (KD 0-30)</td>
                    <td>Muy específica</td>
                    <td>3 – 8%</td>
                    <td>Sitios nuevos o de nicho</td>
                  </tr>
                  <tr>
                    <td><strong>De marca</strong></td>
                    <td>Variable</td>
                    <td>Prácticamente 0</td>
                    <td>Navegacional</td>
                    <td>10 – 25%</td>
                    <td>Siempre; capturar tráfico propio</td>
                  </tr>
                  <tr>
                    <td><strong>Locales</strong></td>
                    <td>100 – 5.000/mes</td>
                    <td>Media-baja</td>
                    <td>Transaccional local</td>
                    <td>5 – 15%</td>
                    <td>Negocios físicos o con cobertura geográfica</td>
                  </tr>
                  <tr>
                    <td><strong>Transaccionales</strong></td>
                    <td>500 – 50.000/mes</td>
                    <td>Alta (KD 40-80)</td>
                    <td>Comprar / contratar</td>
                    <td>4 – 10%</td>
                    <td>Páginas de producto, landing de venta</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN 2: Casos de Uso por perfil */}
          <section className={styles.eduSection}>
            <h2>Casos de uso según tu perfil</h2>
            <p>
              La estrategia de keywords varía mucho según el tipo de proyecto. Aquí tienes
              una guía práctica para los cuatro perfiles más habituales en el mercado hispanohablante.
            </p>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🛒</span>
                  <h4>Tienda online / E-commerce</h4>
                </div>
                <p>Prioriza keywords transaccionales y de producto con modificadores de compra.</p>
                <div className={styles.escenarioExample}>
                  <strong>Ejemplos:</strong> &quot;comprar zapatillas running baratas&quot;,
                  &quot;precio iPhone 16 Pro España&quot;, &quot;ofertas colchón viscoelástico&quot;
                </div>
                <div className={styles.escenarioTip}>
                  Enfócate en keywords con intención de compra clara. El CTR medio en posición 1 para
                  términos transaccionales es del 27,6% (Backlinko 2024).
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>✍️</span>
                  <h4>Blog de contenidos</h4>
                </div>
                <p>Apuesta por keywords informacionales long-tail para artículos de fondo (pillar content).</p>
                <div className={styles.escenarioExample}>
                  <strong>Ejemplos:</strong> &quot;cómo hacer SEO paso a paso&quot;,
                  &quot;qué es el marketing de contenidos para principiantes&quot;, &quot;guía inversión bolsa 2025&quot;
                </div>
                <div className={styles.escenarioTip}>
                  Un artículo bien optimizado para long-tail puede atraer tráfico cualificado sin
                  apenas competencia. El 92% de las keywords reciben menos de 10 búsquedas/mes
                  pero sumadas representan más tráfico que las head terms.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>📍</span>
                  <h4>Negocio local</h4>
                </div>
                <p>Combina keywords de servicio + ciudad. Google My Business potencia estas búsquedas.</p>
                <div className={styles.escenarioExample}>
                  <strong>Ejemplos:</strong> &quot;fontanero urgente Madrid&quot;,
                  &quot;clínica dental en Barcelona zona Gracia&quot;, &quot;abogado laboral Sevilla&quot;
                </div>
                <div className={styles.escenarioTip}>
                  El 46% de las búsquedas en Google tienen intención local. Las búsquedas con
                  &quot;cerca de mí&quot; crecieron un 900% en los últimos 5 años en España.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>💼</span>
                  <h4>Freelancer / Consultor</h4>
                </div>
                <p>Combina tu especialidad + tipo de cliente + resultado esperado. Menos volumen, más calidad.</p>
                <div className={styles.escenarioExample}>
                  <strong>Ejemplos:</strong> &quot;consultor SEO para e-commerce&quot;,
                  &quot;diseñador web freelance startups&quot;, &quot;copywriter para páginas de venta&quot;
                </div>
                <div className={styles.escenarioTip}>
                  Las keywords de servicio con modificador de nicho (ej. &quot;para startups&quot;)
                  tienen una tasa de conversión 3-4x mayor que las genéricas, aunque con menor volumen.
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: FAQ */}
          <section className={styles.eduSection}>
            <h2>Preguntas frecuentes sobre keyword research</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Cuál es la diferencia entre volumen de búsqueda y dificultad de keyword?</h4>
                <p>
                  El <strong>volumen de búsqueda</strong> indica cuántas veces se busca una keyword
                  al mes (dato de herramientas como Ahrefs, Semrush o Google Keyword Planner).
                  La <strong>dificultad de keyword</strong> (KD) mide cuánta autoridad y enlaces
                  necesita una página para posicionarse en el top 10. Una keyword puede tener
                  alto volumen y baja dificultad: esas son las &quot;oportunidades de oro&quot;.
                </p>
                <div className={styles.faqTip}>Regla práctica: para sitios nuevos, busca KD menor de 30 y volumen mínimo de 100/mes.</div>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué es la intención de búsqueda y por qué es tan importante?</h4>
                <p>
                  La intención de búsqueda (o <em>search intent</em>) es el objetivo real del usuario
                  detrás de una consulta. Google analiza los primeros 10 resultados de cada keyword
                  para determinar qué tipo de contenido prefieren los usuarios. Si publicas un artículo
                  informacional para una keyword con intención transaccional, Google nunca lo posicionará
                  bien, independientemente de cuántos enlaces tengas.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Cuántas palabras clave debo usar por página?</h4>
                <p>
                  La práctica recomendada es <strong>1 keyword principal por página</strong>, más
                  3-5 keywords secundarias o LSI (semánticamente relacionadas). Intentar posicionar
                  10 keywords distintas en la misma página suele resultar en canibalización y peor
                  rendimiento. La densidad de keywords recomendada está entre el 0,5% y el 2%
                  del texto total.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué diferencia hay entre keyword principal y keywords LSI?</h4>
                <p>
                  La <strong>keyword principal</strong> es el término central que quieres que
                  posicione la página (aparece en título H1, URL y meta descripción).
                  Las <strong>keywords LSI</strong> (Latent Semantic Indexing) son variaciones
                  y sinónimos relacionados que ayudan a Google a entender el contexto: si tu
                  keyword principal es &quot;hipoteca variable&quot;, las LSI podrían ser
                  &quot;euríbor&quot;, &quot;tipo de interés&quot; o &quot;amortización anticipada&quot;.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué son exactamente las keywords de cola larga?</h4>
                <p>
                  Son consultas de 3 o más palabras con bajo volumen individual pero alta especificidad.
                  El 70% de todas las búsquedas en Google son long-tail. Su ventaja principal es
                  que tienen menos competencia y mayor intención de compra: alguien que busca
                  &quot;zapatillas running mujer pronación severa trail&quot; sabe exactamente
                  lo que quiere, frente a quien busca solo &quot;zapatillas&quot;.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Cómo usar Google Search Console para encontrar nuevas keywords?</h4>
                <p>
                  En Search Console, ve a <em>Rendimiento &gt; Resultados de búsqueda</em> y
                  activa las columnas de Impresiones y Posición media. Filtra por páginas que
                  tienen posición entre 8 y 20: esas keywords ya te traen tráfico pero están
                  al borde del top 10. Con pequeñas mejoras de contenido puedes escalarlas
                  al top 5 y multiplicar el tráfico. También identifica keywords con muchas
                  impresiones pero CTR bajo: el título o meta descripción no es atractivo.
                </p>
                <div className={styles.faqTip}>GSC es gratuito y muestra datos reales de tu sitio: es la mejor fuente de keyword research para webs ya existentes.</div>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué es la canibalización de keywords y cómo evitarla?</h4>
                <p>
                  Ocurre cuando dos o más páginas de tu sitio compiten por la misma keyword.
                  Google no sabe cuál mostrar y puede penalizar ambas. Se detecta buscando
                  en Google <code>site:tudominio.com &quot;tu keyword&quot;</code>. La solución
                  es consolidar el contenido en una sola página (301 redirect) o diferenciar
                  claramente la intención de búsqueda de cada una.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Cómo estimar el tráfico potencial de una keyword?</h4>
                <p>
                  Multiplica el volumen mensual por el CTR esperado según la posición:
                  posición 1 recibe aprox. el 27,6% de los clics, posición 2 el 15,8%,
                  posición 3 el 11%, posición 5 el 6,3%. Ejemplo: una keyword con 1.000
                  búsquedas/mes en posición 1 genera ~276 visitas/mes. Estas cifras varían
                  si hay featured snippets, anuncios o shopping results en los resultados.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: Guía Paso a Paso */}
          <section className={styles.eduSection}>
            <h2>Guía paso a paso: encuentra y selecciona tus mejores keywords</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Define tu objetivo y audiencia</h4>
                  <p>
                    Antes de buscar keywords, responde: ¿qué quieres conseguir (ventas, suscriptores,
                    visibilidad local)? ¿Quién es tu cliente ideal y cómo habla? En España,
                    los términos coloquiales de cada región pueden tener volúmenes muy distintos:
                    &quot;piso&quot; vs &quot;apartamento&quot; vs &quot;departamento&quot;.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Genera una lista amplia de keywords semilla</h4>
                  <p>
                    Usa esta herramienta con 5-10 palabras semilla relacionadas con tu negocio.
                    Anota también cómo describen tu producto tus clientes actuales: sus palabras
                    exactas suelen ser keywords con alta intención de compra.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Valida volumen y dificultad con herramientas</h4>
                  <p>
                    Introduce tus keywords en Google Keyword Planner (gratuito), Ahrefs o Semrush
                    para ver volumen mensual y KD. Para el mercado hispanohablante, filtra siempre
                    por España + Latinoamérica por separado: las variantes léxicas cambian mucho.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Analiza la intención de búsqueda de cada keyword</h4>
                  <p>
                    Busca cada keyword en Google en modo incógnito y observa los primeros 5
                    resultados: ¿son artículos de blog, páginas de producto, vídeos o comparativas?
                    Eso te dice qué tipo de contenido necesitas crear para competir.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Agrupa por clusters temáticos</h4>
                  <p>
                    Organiza las keywords en grupos semánticamente relacionados. Cada cluster
                    corresponderá a una página o artículo. Un cluster típico tiene 1 keyword
                    principal + 5-10 secundarias. Esta estructura ayuda a Google a entender
                    la arquitectura de tu sitio (topic authority).
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <h4>Prioriza por ratio oportunidad / esfuerzo</h4>
                  <p>
                    Crea una hoja de cálculo con: volumen, KD, intención y potencial de negocio.
                    Empieza por keywords con KD bajo, volumen medio y alta intención comercial.
                    Para sitios nuevos (DA menor de 20), KD menor de 20 es lo ideal.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>7</div>
                <div className={styles.stepContent}>
                  <h4>Publica, mide y ajusta con Google Search Console</h4>
                  <p>
                    Tras publicar, espera 3-6 meses y revisa en GSC las posiciones reales.
                    Identifica keywords que están en posición 8-20 para optimizar ese contenido
                    con más detalles, ejemplos o datos. El keyword research no es un proceso
                    puntual, sino continuo.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5: Mejores Prácticas */}
          <section className={styles.eduSection}>
            <h2>Mejores prácticas con datos concretos</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📊</span>
                <h4>Apunta a posición 1-3</h4>
                <p>
                  El CTR cae drásticamente: posición 1 capta el 27,6% de los clics,
                  posición 3 el 11% y posición 10 apenas el 2,4%. Mejor posicionar
                  bien 10 páginas que mal 100.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🎯</span>
                <h4>Long-tail primero</h4>
                <p>
                  El 70% de las búsquedas son long-tail. Una keyword de 4 palabras
                  con 200 búsquedas/mes puede generar 55 visitas reales si llegas
                  al top 1, con una tasa de conversión 5x mayor que las head terms.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>✍️</span>
                <h4>Densidad entre 0,5% y 2%</h4>
                <p>
                  Un artículo de 1.500 palabras debe mencionar la keyword principal
                  entre 7 y 30 veces. Por debajo es poco relevante; por encima
                  es keyword stuffing y Google lo penaliza.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔗</span>
                <h4>Internal linking con anchor text</h4>
                <p>
                  Enlaza internamente usando la keyword exacta como anchor text. Las
                  páginas con más enlaces internos tienen 40% más probabilidades de
                  aparecer en featured snippets según estudios de Semrush.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📱</span>
                <h4>Mobile-first en búsquedas locales</h4>
                <p>
                  El 61% de las búsquedas locales en España se realizan desde móvil.
                  Para keywords con intención local, asegúrate de que tu web carga
                  en menos de 3 segundos en dispositivos móviles.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔄</span>
                <h4>Actualiza tu research cada 6 meses</h4>
                <p>
                  Los volúmenes de búsqueda cambian con tendencias, estacionalidad
                  y eventos. Keywords con pico estacional (ej: &quot;declaración renta&quot;)
                  pueden multiplicar su volumen por 10 en temporada alta.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 6: Warning Box — errores comunes */}
          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon}>⚠️</span>
                <h3>Errores comunes en keyword research que debes evitar</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Keyword stuffing:</strong> Repetir la keyword en exceso
                  (más del 3% de densidad) activa filtros de spam de Google y puede
                  resultar en penalización manual. Usa sinónimos y variantes LSI naturalmente.
                </li>
                <li>
                  <strong>Ignorar la intención de búsqueda:</strong> Crear una landing page
                  de venta para una keyword informacional (o viceversa) garantiza un mal
                  posicionamiento. Google prioriza el match entre contenido e intención.
                </li>
                <li>
                  <strong>No analizar a la competencia:</strong> Antes de crear contenido,
                  revisa quién ocupa las posiciones 1-3. Si son dominios con DA 80+ y cientos
                  de backlinks, esa keyword no es realista para un sitio nuevo.
                </li>
                <li>
                  <strong>Canibalización de keywords:</strong> Tener dos páginas optimizadas
                  para la misma keyword divide la autoridad y confunde a Google. Consolida
                  o diferencia claramente la intención de cada URL.
                </li>
                <li>
                  <strong>Ir a por keywords muy competidas siendo sitio nuevo:</strong> Un dominio
                  reciente (menos de 1 año) con DA bajo de 20 no puede competir con head terms.
                  Empieza con KD menor de 20 y construye autoridad con contenidos long-tail.
                </li>
                <li>
                  <strong>No actualizar el research periódicamente:</strong> El mercado cambia.
                  Keywords que funcionaban en 2022 pueden estar saturadas hoy, y nuevas
                  oportunidades surgen con cada tendencia. Revisa tu estrategia cada 6 meses.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-palabras-clave')} />

      <ShareCard appName="generador-palabras-clave" />
      <Footer appName="generador-palabras-clave" />
    </div>
  );
}
