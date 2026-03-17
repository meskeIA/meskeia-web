'use client';

import { useState } from 'react';
import styles from './DetectorIdioma.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Patrones de palabras frecuentes por idioma
const PATRONES_IDIOMAS: Record<string, { palabras: string[]; nombre: string; bandera: string }> = {
  es: {
    nombre: 'Español',
    bandera: '🇪🇸',
    palabras: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'los', 'las', 'por', 'con', 'para', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'este', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'haber', 'esta', 'estaba', 'estamos', 'algunas', 'algo', 'nosotros']
  },
  en: {
    nombre: 'Inglés',
    bandera: '🇬🇧',
    palabras: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us']
  },
  fr: {
    nombre: 'Francés',
    bandera: '🇫🇷',
    palabras: ['le', 'la', 'de', 'et', 'est', 'en', 'un', 'une', 'que', 'les', 'du', 'des', 'à', 'ce', 'il', 'pas', 'je', 'ne', 'se', 'qui', 'pour', 'dans', 'au', 'son', 'sur', 'par', 'mais', 'avec', 'elle', 'ou', 'on', 'sa', 'si', 'nous', 'ses', 'plus', 'lui', 'être', 'tout', 'faire', 'comme', 'leur', 'bien', 'aussi', 'où', 'ces', 'fait', 'vous', 'encore', 'sans', 'peut', 'même', 'donc', 'très', 'entre', 'quand', 'sous', 'rien', 'autre', 'après', 'tous', 'leurs', 'cette', 'peu', 'ainsi', 'toujours', 'dont', 'chez', 'moins', 'alors', 'avoir', 'ils', 'été', 'sont', 'aux', 'mes', 'nos', 'était', 'ont', 'mon', 'été', 'avant']
  },
  de: {
    nombre: 'Alemán',
    bandera: '🇩🇪',
    palabras: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'kann', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'dann', 'wir', 'sehr', 'zwischen', 'ob', 'ohne', 'nach', 'schon', 'mir', 'mich', 'wenn', 'immer', 'alle', 'mein', 'gibt', 'ihre']
  },
  it: {
    nombre: 'Italiano',
    bandera: '🇮🇹',
    palabras: ['di', 'che', 'è', 'e', 'la', 'il', 'un', 'a', 'per', 'in', 'una', 'mi', 'sono', 'ho', 'non', 'lo', 'ma', 'ti', 'si', 'le', 'con', 'cosa', 'se', 'io', 'come', 'da', 'ci', 'questo', 'qui', 'hai', 'bene', 'sei', 'del', 'tu', 'solo', 'al', 'me', 'era', 'tutto', 'della', 'più', 'lei', 'suo', 'sì', 'mio', 'fare', 'so', 'lui', 'stato', 'nella', 'sulla', 'quella', 'proprio', 'quando', 'tutti', 'essere', 'fatto', 'sua', 'gli', 'perché', 'noi', 'sempre', 'questa', 'hanno', 'quello', 'anche', 'fra', 'molto', 'poi', 'nel', 'cui', 'prima', 'ora', 'volta', 'mai']
  },
  pt: {
    nombre: 'Portugués',
    bandera: '🇵🇹',
    palabras: ['de', 'que', 'e', 'o', 'a', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia']
  },
  nl: {
    nombre: 'Neerlandés',
    bandera: '🇳🇱',
    palabras: ['de', 'het', 'een', 'van', 'en', 'in', 'is', 'op', 'te', 'dat', 'die', 'voor', 'zijn', 'met', 'niet', 'aan', 'om', 'ook', 'als', 'maar', 'er', 'nog', 'worden', 'door', 'over', 'bij', 'werd', 'naar', 'uit', 'dan', 'tot', 'heeft', 'ze', 'kan', 'of', 'meer', 'al', 'zo', 'geen', 'zou', 'nu', 'wel', 'hun', 'jaar', 'deze', 'hebben', 'was', 'na', 'waar', 'tegen', 'onder', 'veel', 'twee', 'eerste', 'nieuwe', 'moet', 'komen', 'maken', 'zal', 'ging']
  },
  pl: {
    nombre: 'Polaco',
    bandera: '🇵🇱',
    palabras: ['i', 'w', 'nie', 'na', 'do', 'że', 'to', 'jest', 'się', 'z', 'co', 'jak', 'ale', 'po', 'tak', 'o', 'za', 'od', 'a', 'czy', 'są', 'by', 'już', 'był', 'przez', 'tylko', 'może', 'być', 'ze', 'mi', 'go', 'tego', 'tu', 'też', 'dla', 'ma', 'bo', 'je', 'jeszcze', 'mu', 'jej', 'my', 'będzie', 'jego', 'teraz', 'kiedy', 'tam', 'mnie', 'pan', 'bardzo', 'było', 'sobie', 'wszystko', 'jako', 'przed']
  },
  ru: {
    nombre: 'Ruso',
    bandera: '🇷🇺',
    palabras: ['и', 'в', 'не', 'на', 'я', 'что', 'он', 'с', 'как', 'а', 'то', 'все', 'она', 'так', 'его', 'но', 'за', 'к', 'у', 'же', 'вы', 'по', 'мне', 'это', 'ты', 'из', 'мы', 'от', 'был', 'еще', 'бы', 'было', 'ее', 'только', 'о', 'до', 'уже', 'для', 'ему', 'если', 'их', 'себя', 'который', 'когда', 'чтобы', 'ни', 'быть', 'есть', 'ли', 'при', 'нас', 'даже', 'вот', 'во', 'раз', 'после', 'об', 'может', 'между', 'там', 'над', 'под', 'чем']
  },
  ca: {
    nombre: 'Catalán',
    bandera: '🏴󠁥󠁳󠁣󠁴󠁿',
    palabras: ['de', 'i', 'el', 'la', 'que', 'a', 'en', 'un', 'és', 'per', 'amb', 'no', 'una', 'les', 'del', 'dels', 'com', 'més', 'es', 'els', 'al', 'ha', 'però', 'se', 'ser', 'va', 'tot', 'són', 'ja', 'si', 'als', 'hi', 'seu', 'quan', 'aquesta', 'molt', 'entre', 'havia', 'només', 'sobre', 'també', 'fer', 'aquest', 'seva', 'té', 'tots', 'era', 'fins', 'anys', 'altres', 'sense', 'part', 'dos', 'què', 'qual', 'forma', 'van', 'encara', 'molt', 'segons', 'tres', 'després', 'on', 'primer', 'són', 'sota']
  }
};

interface ResultadoDeteccion {
  idioma: string;
  codigo: string;
  bandera: string;
  confianza: number;
  coincidencias: number;
}

export default function DetectorIdiomaPage() {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState<ResultadoDeteccion[]>([]);
  const [analizado, setAnalizado] = useState(false);

  const detectarIdioma = () => {
    if (!texto.trim()) return;

    const palabrasTexto = texto.toLowerCase()
      .replace(/[^\p{L}\s]/gu, '')
      .split(/\s+/)
      .filter(p => p.length > 1);

    const totalPalabras = palabrasTexto.length;
    if (totalPalabras === 0) return;

    const puntuaciones: ResultadoDeteccion[] = [];

    for (const [codigo, { palabras, nombre, bandera }] of Object.entries(PATRONES_IDIOMAS)) {
      let coincidencias = 0;
      for (const palabra of palabrasTexto) {
        if (palabras.includes(palabra)) {
          coincidencias++;
        }
      }

      const confianza = Math.min(100, Math.round((coincidencias / totalPalabras) * 100 * 2));

      if (coincidencias > 0) {
        puntuaciones.push({
          idioma: nombre,
          codigo,
          bandera,
          confianza,
          coincidencias
        });
      }
    }

    puntuaciones.sort((a, b) => b.confianza - a.confianza);
    setResultados(puntuaciones.slice(0, 5));
    setAnalizado(true);
  };

  const limpiar = () => {
    setTexto('');
    setResultados([]);
    setAnalizado(false);
  };

  const cargarEjemplo = (ejemplo: string) => {
    setTexto(ejemplo);
    setResultados([]);
    setAnalizado(false);
  };

  const ejemplos = [
    { texto: 'Hola, ¿cómo estás? Espero que todo esté bien contigo.', idioma: 'Español' },
    { texto: 'Hello, how are you? I hope everything is going well.', idioma: 'Inglés' },
    { texto: 'Bonjour, comment allez-vous? J\'espère que tout va bien.', idioma: 'Francés' },
    { texto: 'Guten Tag, wie geht es Ihnen? Ich hoffe, alles ist gut.', idioma: 'Alemán' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Detector de Idioma</h1>
        <p className={styles.subtitle}>
          Pega cualquier texto y descubre en qué idioma está escrito
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.inputSection}>
          <label className={styles.label}>Texto a analizar</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pega aquí el texto del que quieres saber el idioma..."
            className={styles.textarea}
            rows={6}
          />
          <div className={styles.charCount}>
            {texto.length} caracteres · {texto.split(/\s+/).filter(p => p).length} palabras
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button onClick={detectarIdioma} className={styles.btnPrimary} disabled={!texto.trim()}>
            🔍 Detectar Idioma
          </button>
          <button onClick={limpiar} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {analizado && (
          <div className={styles.resultsSection}>
            <h3>Resultados del análisis</h3>
            {resultados.length > 0 ? (
              <div className={styles.resultsList}>
                {resultados.map((r, i) => (
                  <div key={r.codigo} className={`${styles.resultItem} ${i === 0 ? styles.topResult : ''}`}>
                    <div className={styles.resultMain}>
                      <span className={styles.resultFlag}>{r.bandera}</span>
                      <span className={styles.resultName}>{r.idioma}</span>
                      {i === 0 && <span className={styles.topBadge}>Más probable</span>}
                    </div>
                    <div className={styles.resultBar}>
                      <div
                        className={styles.resultFill}
                        style={{ width: `${r.confianza}%` }}
                      />
                    </div>
                    <span className={styles.resultPercent}>{r.confianza}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                No se pudo identificar el idioma. Prueba con un texto más largo.
              </div>
            )}
          </div>
        )}

        <div className={styles.examplesSection}>
          <h4>Probar con ejemplos:</h4>
          <div className={styles.examplesGrid}>
            {ejemplos.map((ej, i) => (
              <button
                key={i}
                onClick={() => cargarEjemplo(ej.texto)}
                className={styles.exampleBtn}
              >
                {ej.idioma}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.languagesSection}>
        <h2>Idiomas Detectables</h2>
        <div className={styles.languagesGrid}>
          {Object.entries(PATRONES_IDIOMAS).map(([codigo, { nombre, bandera }]) => (
            <div key={codigo} className={styles.languageCard}>
              <span className={styles.langFlag}>{bandera}</span>
              <span className={styles.langName}>{nombre}</span>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection
        title="Guía de Detección de Idiomas"
        subtitle="Cómo funciona el análisis automático de lenguas y sus aplicaciones"
        icon="🌍"
      >
        {/* 1. TABLA COMPARATIVA — familias de idiomas */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Familia Lingüística</th>
                <th>Idiomas principales</th>
                <th>Hablantes nativos</th>
                <th>Características distintivas</th>
                <th>Facilidad de detección</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Indoeuropea (Romance)</td><td>Español, Francés, Italiano, Portugués</td><td>~900M</td><td>Artículos, conjugaciones, vocales abiertas</td><td>✅ Alta</td></tr>
              <tr><td>Indoeuropea (Germánica)</td><td>Inglés, Alemán, Holandés, Sueco</td><td>~500M</td><td>Compuestos, consonantes, th/sch</td><td>✅ Alta</td></tr>
              <tr><td>Sino-Tibetana</td><td>Chino mandarín, Cantonés</td><td>~1.200M</td><td>Tonal, caracteres, sin espacios</td><td>✅ Muy alta (script único)</td></tr>
              <tr><td>Semítica</td><td>Árabe, Hebreo</td><td>~400M</td><td>RTL, consonántica, raíces trilíteras</td><td>✅ Muy alta (script único)</td></tr>
              <tr><td>Altaica / Urálica</td><td>Turco, Finés, Húngaro</td><td>~200M</td><td>Aglutinante, armonía vocálica</td><td>🟡 Media</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🌐</span>
              <strong>Desarrollador Web</strong>
            </div>
            <p>Detecta el idioma del contenido enviado por usuarios para redirigir automáticamente a la versión localizada del sitio o aplicar el diccionario de corrección correcto.</p>
            <div className={styles.escenarioTip}>Tip: Combina detección automática con el header HTTP Accept-Language como señal de respaldo.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📚</span>
              <strong>Docente / Investigador</strong>
            </div>
            <p>Analiza corpus de textos multilingüe para clasificar documentos, identificar mezclas de idiomas (code-switching) o verificar la coherencia lingüística de traducciones.</p>
            <div className={styles.escenarioTip}>Tip: Textos de al menos 50 palabras dan resultados de detección mucho más fiables que frases cortas.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>💬</span>
              <strong>Community Manager</strong>
            </div>
            <p>Clasifica comentarios y menciones en redes sociales por idioma para derivarlos al equipo de atención al cliente correcto o gestionar campañas segmentadas geográficamente.</p>
            <div className={styles.escenarioTip}>Tip: El emoji y los hashtags no aportan señal de idioma; filtra el texto puro antes de detectar.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🔍</span>
              <strong>Analista de Datos</strong>
            </div>
            <p>Preprocesa datasets de texto para etiquetarlos por idioma antes de aplicar modelos de NLP específicos (sentiment analysis, NER) que requieren un idioma concreto.</p>
            <div className={styles.escenarioTip}>Tip: El n-gram a nivel de carácter (trigramas) es el método más robusto para detección en textos cortos y ruidosos.</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <details className={styles.faqList}>
          <summary className={styles.faqItem} style={{listStyle:'none', cursor:'pointer', fontWeight:600, fontSize:'1.1rem', padding:'0.75rem 0'}}>❓ Preguntas Frecuentes sobre Detección de Idiomas</summary>
          <div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuántos caracteres son necesarios para detectar el idioma con fiabilidad?</div>
              <div className={styles.faqRespuesta}>Con 20-30 caracteres los algoritmos de n-gram ya obtienen resultados razonables. Por debajo de 10 caracteres el margen de error aumenta significativamente. Para máxima fiabilidad, usar párrafos completos de al menos 100 caracteres.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Por qué se confunde el español con el portugués o el italiano?</div>
              <div className={styles.faqRespuesta}>Son lenguas romances muy próximas con vocabulario y gramática similares. Los algoritmos necesitan buscar palabras función (artículos, preposiciones, conjunciones) que difieren entre ellas, como &quot;el/la/los&quot; (español), &quot;o/a/os&quot; (portugués) o &quot;il/la/gli&quot; (italiano).</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Funciona la detección con textos que mezclan varios idiomas?</div>
              <div className={styles.faqRespuesta}>Depende del algoritmo. Los basados en n-gram detectan el idioma mayoritario. Para textos con code-switching real (mezcla intencional) se necesitan modelos de detección por segmentos como LangDetect multilabel o modelos Transformer especializados.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Los textos con muchos errores ortográficos afectan la detección?</div>
              <div className={styles.faqRespuesta}>Los errores tipográficos menores afectan poco, pero los textos con errores masivos o transliteraciones (árabe en letras latinas) pueden reducir la precisión. Los algoritmos robustos como fastText mantienen hasta 95% de precisión con un 30% de errores.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué diferencia hay entre detección de idioma y detección de dialecto?</div>
              <div className={styles.faqRespuesta}>La detección de idioma distingue lenguas diferentes (español vs portugués). La detección de dialecto es mucho más difícil y distingue variantes de una misma lengua (español de España vs México vs Argentina). Requiere modelos entrenados específicamente con datos dialectales.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo se detectan idiomas con scripts no latinos (chino, árabe, japonés)?</div>
              <div className={styles.faqRespuesta}>Los scripts únicos son triviales de detectar por rangos Unicode: árabe (U+0600–U+06FF), chino (U+4E00–U+9FFF), japonés (hiragana U+3040–U+309F, katakana U+30A0–U+30FF). La complejidad aparece al distinguir chino simplificado de tradicional o japonés de chino.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es el método más preciso de detección de idioma?</div>
              <div className={styles.faqRespuesta}>Los modelos basados en Transformers (como xlm-roberta o fastText de Meta) logran &gt;99% de precisión en 176+ idiomas. Para uso ligero en cliente/servidor sin GPU, los algoritmos de trigramas (CLD3 de Google, langdetect) logran 95-98% con mínimo coste computacional.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Puede detectarse el idioma de programación (código fuente)?</div>
              <div className={styles.faqRespuesta}>No es lo mismo que detectar lengua natural, pero sí existe. Herramientas como Linguist (GitHub), highlight.js o Pygments identifican el lenguaje de programación por sintaxis y palabras reservadas. Los algoritmos de lengua natural pueden confundir código con idiomas inventados.</div>
            </div>
          </div>
        </details>

        {/* 4. GUÍA PASO A PASO */}
        <ol className={styles.pasosList}>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>1</span>
            <div><strong>Prepara el texto</strong> — Elimina elementos que puedan confundir el detector: URLs, emojis, menciones (@usuario), hashtags y código HTML. Cuanto más limpio sea el texto, mayor precisión.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>2</span>
            <div><strong>Pega el texto en el detector</strong> — Usa al menos 3-4 oraciones completas para obtener un resultado fiable. Textos de una sola palabra o acrónimos tienen alta tasa de error.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>3</span>
            <div><strong>Revisa el idioma detectado y la confianza</strong> — Un nivel de confianza por debajo del 70% indica que el texto es ambiguo, muy corto o mezcla idiomas. Considera revisar manualmente.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>4</span>
            <div><strong>Verifica los idiomas alternativos</strong> — Los buenos detectores muestran los 3-5 idiomas más probables con su probabilidad. Si el idioma correcto no está primero pero sí en el top-3, el texto puede tener características ambiguas.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>5</span>
            <div><strong>Aplica el resultado</strong> — Usa el código ISO 639-1 devuelto (es, en, fr, de...) para configurar correctores ortográficos, aplicar el traductor adecuado o etiquetar el documento en tu sistema.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>6</span>
            <div><strong>Documenta los casos de baja confianza</strong> — Si usas la detección en un proceso automatizado, registra los casos con confianza &lt;80% para revisión humana o para mejorar el preprocesado del texto.</div>
          </li>
        </ol>

        {/* 5. TIPS GRID */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📏</span>
            <strong>Longitud mínima</strong>
            <p>Para resultados fiables usa siempre textos de más de 50 palabras. Con menos de 20 palabras el margen de error se multiplica.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🧹</span>
            <strong>Limpia antes de detectar</strong>
            <p>Elimina URLs, código, emojis y caracteres especiales. El texto limpio mejora la precisión hasta un 15% en textos cortos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔢</span>
            <strong>Los números no ayudan</strong>
            <p>Los dígitos y cifras no aportan señal de idioma. Textos muy numéricos (tablas, datos) son difíciles de detectar correctamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🌐</span>
            <strong>Nombres propios</strong>
            <p>Los nombres de personas y lugares pueden &quot;contaminar&quot; la detección. Un texto en alemán con muchos nombres en español puede confundir el algoritmo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔤</span>
            <strong>Mayúsculas y minúsculas</strong>
            <p>Los algoritmos modernos son case-insensitive, pero el uso de ALL CAPS reduce la información morfológica disponible para la detección.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🎯</span>
            <strong>Umbral de confianza</strong>
            <p>En automatizaciones, establece un umbral mínimo de confianza del 85% antes de actuar. Por debajo, deriva a revisión manual.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono}>⚠️</span>
            <strong>Limitaciones importantes de la detección automática</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Textos muy cortos (&lt;20 palabras)</strong> — La precisión cae drásticamente. Una frase corta en español puede detectarse como italiano o portugués.</li>
            <li><strong>Nombres propios y código mezclado</strong> — Los nombres en otro idioma, URLs o fragmentos de código pueden sesgar el resultado hacia el idioma equivocado.</li>
            <li><strong>Idiomas minoritarios o dialectos</strong> — El vasco, el gallego o el asturiano pueden confundirse con español. Los modelos con menos datos de entrenamiento son menos precisos.</li>
            <li><strong>Transliteraciones</strong> — El árabe o el chino escrito en caracteres latinos (romanización) no se detecta correctamente como árabe o chino.</li>
            <li><strong>Confianza ≠ Certeza</strong> — Un 99% de confianza no significa que sea correcto. Es una probabilidad estimada, no una garantía.</li>
            <li><strong>Uso en decisiones automáticas críticas</strong> — No uses la detección automática sin revisión humana en contextos donde un error tenga consecuencias importantes (documentos legales, comunicaciones médicas).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('detector-idioma')} />

      <ShareCard appName="detector-idioma" />
      <Footer appName="detector-idioma" />
    </div>
  );
}
