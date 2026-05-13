'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect } from 'react';
import styles from './GeneradorAnagramas.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/**
 * Diccionario español basado en el Lemario General del Español
 * de Ismael Olea (dominio público): https://github.com/olea/lemarios
 * Procesado y servido como archivo estático desde /data/diccionario-es.txt
 */
const DICT_URL = '/data/diccionario-es.txt';
const DICT_CACHE_KEY = 'meskeia_dict_es_v1';

type DictStatus = 'loading' | 'ready' | 'error';

export default function GeneradorAnagramasPage() {
  const [letters, setLetters] = useState('');
  const [minLength, setMinLength] = useState(2);
  const [maxLength, setMaxLength] = useState(10);
  const [mustContain, setMustContain] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [dictStatus, setDictStatus] = useState<DictStatus>('loading');

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(DICT_CACHE_KEY) : null;
    if (cached) {
      setDictionary(cached.split('\n'));
      setDictStatus('ready');
      return;
    }

    fetch(DICT_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const words = text.split('\n').filter(Boolean);
        setDictionary(words);
        setDictStatus('ready');
        try {
          sessionStorage.setItem(DICT_CACHE_KEY, text);
        } catch {
          // sessionStorage lleno: silencioso, no es crítico
        }
      })
      .catch(() => {
        setDictStatus('error');
      });
  }, []);

  // Indexar diccionario por longitud para búsquedas más rápidas
  const wordsByLength = useMemo(() => {
    const index: { [key: number]: string[] } = {};
    for (const word of dictionary) {
      const len = word.length;
      if (!index[len]) index[len] = [];
      index[len].push(word);
    }
    return index;
  }, [dictionary]);

  const canFormWord = (word: string, availableLetters: string): boolean => {
    const letterCount: { [key: string]: number } = {};

    for (const letter of availableLetters.toLowerCase()) {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    for (const letter of word.toLowerCase()) {
      if (!letterCount[letter] || letterCount[letter] === 0) {
        return false;
      }
      letterCount[letter]--;
    }

    return true;
  };

  const findAnagrams = () => {
    setIsSearching(true);

    setTimeout(() => {
      const normalizedLetters = letters.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');

      if (normalizedLetters.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      const found: string[] = [];
      const mustContainLower = mustContain.toLowerCase();

      // Iterar solo sobre las longitudes válidas para acelerar
      for (let len = minLength; len <= maxLength; len++) {
        const bucket = wordsByLength[len];
        if (!bucket) continue;

        for (const word of bucket) {
          if (mustContainLower && !word.includes(mustContainLower)) continue;
          if (canFormWord(word, normalizedLetters)) {
            found.push(word);
          }
        }
      }

      found.sort((a, b) => {
        if (b.length !== a.length) return b.length - a.length;
        return a.localeCompare(b);
      });

      setResults(found);
      setIsSearching(false);
    }, 50);
  };

  const handleClear = () => {
    setLetters('');
    setMustContain('');
    setResults([]);
  };

  const groupedResults = useMemo(() => {
    const groups: { [key: number]: string[] } = {};
    for (const word of results) {
      const len = word.length;
      if (!groups[len]) groups[len] = [];
      groups[len].push(word);
    }
    return groups;
  }, [results]);

  const examples = [
    { letters: 'amor', label: 'amor' },
    { letters: 'mesa', label: 'mesa' },
    { letters: 'palabra', label: 'palabra' },
    { letters: 'corazon', label: 'corazon' },
  ];

  const formattedDictSize = useMemo(
    () => dictionary.length.toLocaleString('es-ES'),
    [dictionary.length]
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Anagramas</h1>
        <p className={styles.subtitle}>
          Encuentra todas las palabras que puedes formar con tus letras
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {dictStatus === 'loading' && (
          <div
            className={`${styles.dictStatus} ${styles.dictStatusLoading}`}
            role="status"
            aria-live="polite"
          >
            <span className={styles.dictSpinner} aria-hidden="true" />
            <span>Cargando diccionario español…</span>
          </div>
        )}
        {dictStatus === 'ready' && (
          <div className={`${styles.dictStatus} ${styles.dictStatusReady}`}>
            <span aria-hidden="true">✓</span>
            <span>Diccionario cargado: {formattedDictSize} palabras del español</span>
          </div>
        )}
        {dictStatus === 'error' && (
          <div
            className={`${styles.dictStatus} ${styles.dictStatusError}`}
            role="alert"
          >
            <span aria-hidden="true">⚠️</span>
            <span>No se pudo cargar el diccionario. Recarga la página para reintentar.</span>
          </div>
        )}

        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="anagram-letters">Introduce tus letras:</label>
          <input
            id="anagram-letters"
            type="text"
            className={styles.input}
            value={letters}
            onChange={(e) => setLetters(e.target.value)}
            placeholder="Ej: amorpls"
            maxLength={15}
            autoComplete="off"
            inputMode="text"
          />
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Probar:</span>
            {examples.map((ex) => (
              <button
                key={ex.letters}
                className={styles.exampleBtn}
                onClick={() => setLetters(ex.letters)}
                type="button"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="anagram-min">Longitud mínima:</label>
            <select
              id="anagram-min"
              className={styles.select}
              value={minLength}
              onChange={(e) => setMinLength(Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6, 7].map(n => (
                <option key={n} value={n}>{n} letras</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="anagram-max">Longitud máxima:</label>
            <select
              id="anagram-max"
              className={styles.select}
              value={maxLength}
              onChange={(e) => setMaxLength(Number(e.target.value))}
            >
              {[4, 5, 6, 7, 8, 9, 10, 12, 15].map(n => (
                <option key={n} value={n}>{n} letras</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="anagram-contain">Debe contener:</label>
            <input
              id="anagram-contain"
              type="text"
              className={styles.filterInput}
              value={mustContain}
              onChange={(e) => setMustContain(e.target.value)}
              placeholder="Opcional"
              maxLength={3}
              autoComplete="off"
            />
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button
            onClick={findAnagrams}
            className={styles.btnPrimary}
            disabled={letters.length < 2 || isSearching || dictStatus !== 'ready'}
            type="button"
          >
            {isSearching ? 'Buscando...' : 'Buscar palabras'}
          </button>
          <button onClick={handleClear} className={styles.btnSecondary} type="button">
            Limpiar
          </button>
        </div>

        {results.length > 0 && (
          <div className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <h3>Palabras encontradas: {results.length}</h3>
            </div>

            {Object.keys(groupedResults)
              .sort((a, b) => Number(b) - Number(a))
              .map(len => (
                <div key={len} className={styles.resultGroup}>
                  <h4 className={styles.groupTitle}>
                    {len} letras ({groupedResults[Number(len)].length})
                  </h4>
                  <div className={styles.wordsGrid}>
                    {groupedResults[Number(len)].map(word => (
                      <span key={word} className={styles.wordChip}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {results.length === 0 && letters.length >= 2 && !isSearching && dictStatus === 'ready' && (
          <div className={styles.noResults}>
            <p>No se encontraron palabras con esas letras.</p>
            <p className={styles.hint}>Prueba añadiendo más letras o reduciendo los filtros.</p>
          </div>
        )}
      </div>

      <EducationalSection
        title="Aprende sobre Anagramas y Lingüística"
        subtitle="Historia, matemáticas combinatorias y estrategias avanzadas para juegos de palabras"
        icon="🔤"
      >
        <section>
          <h3>🏛️ Historia y Tipos de Reorganización de Letras</h3>
          <p>Los anagramas forman parte de una familia más amplia de transformaciones lingüísticas con historia milenaria:</p>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Definición</th>
                  <th>Ejemplo</th>
                  <th>Uso histórico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Anagrama</strong></td>
                  <td>Reorganiza todas las letras formando otra palabra</td>
                  <td>AMOR → ROMA</td>
                  <td>Seudónimos literarios, criptografía</td>
                </tr>
                <tr>
                  <td><strong>Palíndromo</strong></td>
                  <td>Se lee igual al derecho y al revés</td>
                  <td>RECONOCER, ANA</td>
                  <td>Textos latinos clásicos (Sator)</td>
                </tr>
                <tr>
                  <td><strong>Transposición</strong></td>
                  <td>Subconjunto de letras reordenadas</td>
                  <td>AMOR → MAR, ORA</td>
                  <td>Juegos de palabras, Scrabble</td>
                </tr>
                <tr>
                  <td><strong>Acrónimo inverso</strong></td>
                  <td>Iniciales que forman otra palabra</td>
                  <td>NATO → OTAN</td>
                  <td>Denominaciones de organismos</td>
                </tr>
                <tr>
                  <td><strong>Heterograma</strong></td>
                  <td>Palabra sin letras repetidas</td>
                  <td>MURCIÉLAGO (12 letras únicas)</td>
                  <td>Tipografía, diseño de teclados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 Casos de Uso y Aplicaciones</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎮</span>
              <h4>Wordle y Wordle en Español</h4>
              <p>Introduce las letras que ya conoces (verdes y amarillas) y usa el filtro &quot;debe contener&quot; para encontrar palabras válidas de 5 letras que maximicen información en cada intento.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🃏</span>
              <h4>Scrabble y Palabras Cruzadas</h4>
              <p>Busca las palabras más largas posibles con las letras de tu atril. Las palabras de 7+ letras dan bingo (+50 puntos). Filtra por longitud mínima para encontrar jugadas de alto valor.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>📚</span>
              <h4>Aprendizaje de Vocabulario</h4>
              <p>Descubrir que AMOR y ROMA comparten letras, o que SALA y ALAS son anagramas, ayuda a fijar palabras en la memoria. Técnica usada en métodos de enseñanza de idiomas.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>✍️</span>
              <h4>Seudónimos y Creatividad</h4>
              <p>Muchos escritores usaron anagramas como seudónimos: Voltaire es anagrama de AROVET LI (latinización de su apellido). En criptografía renacentista se usaban para ocultar autoría.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas Frecuentes sobre Anagramas</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuántas palabras se pueden formar con N letras?</summary>
              <p className={styles.eduFaqAnswer}>El número máximo teórico de combinaciones con N letras distintas es N! (factorial). Con 5 letras distintas hay 120 combinaciones posibles, con 7 hay 5.040 y con 10 hay 3.628.800. En la práctica, solo una pequeña fracción forma palabras reales del diccionario. Con letras repetidas, el número se reduce: con &quot;AAAB&quot; hay 4!/3! = 4 permutaciones.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es un anagrama perfecto?</summary>
              <p className={styles.eduFaqAnswer}>Un <strong>anagrama perfecto</strong> usa exactamente todas las letras de la palabra original para formar otra palabra o frase con significado propio. Ejemplos famosos en español: ROMA/AMOR/MORA/RAMO/OMAR, SALTA/ATLAS/TALAS, PIEDRA/PARDIE. Los anagramas de frases completas son especialmente valorados: &quot;SALVADOR DALÍ&quot; → &quot;AVIDA DOLLARS&quot; (hecho por él mismo).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué letras son más valiosas en Scrabble español?</summary>
              <p className={styles.eduFaqAnswer}>En Scrabble español, las letras de mayor valor son: <strong>CH (5 pts), LL (8 pts), RR (8 pts), Ñ (8 pts)</strong> como fichas especiales, y entre las individuales: <strong>Q (8), X (8), Y (4), Z (10), J (8), K (8)</strong>. Las vocales solo valen 1 punto. La estrategia consiste en usar letras de alto valor en casillas premium (doble/triple letra o palabra).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cómo funciona el algoritmo de búsqueda de anagramas?</summary>
              <p className={styles.eduFaqAnswer}>El algoritmo más eficiente usa <strong>conteo de frecuencias de letras</strong>: para cada letra del diccionario, verifica si su frecuencia en la palabra candidata no supera la frecuencia disponible. Esta herramienta usa además un <strong>índice por longitud</strong> que evita revisar palabras fuera del rango de letras solicitado, lo que multiplica la velocidad de búsqueda sobre los ~87.000 lemas del diccionario.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué diccionario utiliza esta herramienta?</summary>
              <p className={styles.eduFaqAnswer}>Esta herramienta utiliza el <strong>Lemario General del Español</strong> de Ismael Olea (<a href="https://github.com/olea/lemarios" target="_blank" rel="noopener noreferrer">github.com/olea/lemarios</a>), publicado en dominio público. Contiene aproximadamente <strong>87.000 lemas</strong> del español estándar y se usa también en correctores ortográficos libres (LibreOffice, Firefox vía RLA-ES). Para uso competitivo en Scrabble, se recomienda complementar con el diccionario oficial de la FISE (Federación Internacional de Scrabble en Español).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Las tildes cuentan como letras diferentes?</summary>
              <p className={styles.eduFaqAnswer}>En español, las letras acentuadas (á, é, í, ó, ú, ü) son variantes ortográficas de las vocales base. En Scrabble oficial, <strong>sí cuentan como fichas distintas</strong>. En esta herramienta, el diccionario conserva las tildes originales, así que si una palabra lleva acento (por ejemplo &quot;árbol&quot;) deberás introducir las letras con tilde para que aparezca. La Ñ es una letra completamente independiente del abecedario español con su propia ficha en Scrabble.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es el &quot;bingo&quot; en Scrabble?</summary>
              <p className={styles.eduFaqAnswer}>El <strong>bingo</strong> (o &quot;scrabble&quot; en versión americana) consiste en usar las 7 fichas del atril en una sola jugada. Se obtiene un bonus de <strong>+50 puntos</strong> además del valor de la palabra. Los jugadores competitivos memorizan palabras de 7 letras que contienen letras frecuentes (S, R, N, T, A, E, I) para maximizar las posibilidades de bingo.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuál es la mejor estrategia inicial en Wordle?</summary>
              <p className={styles.eduFaqAnswer}>Los análisis matemáticos (teoría de la información, entropía de Shannon) señalan palabras como <strong>CRANE, SLATE, AUDIO</strong> (en inglés) o <strong>RATIO, CRANE</strong> como primeras palabras óptimas por cubrir las letras más frecuentes. En español, palabras como <strong>ORATE, AIREL, MARES</strong> cubren bien el espacio de letras frecuentes (A, E, R, S, T, O, N). El objetivo es maximizar la información obtenida en cada intento.</p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Cómo Sacar el Máximo Partido al Generador</h3>
          <ol className={styles.eduStepsList}>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>1</span>
              <div>
                <strong>Para Wordle: introduce letras conocidas</strong>
                <p>Después de un intento en Wordle, introduce todas las letras que aparecen en amarillo o verde. Usa el filtro &quot;debe contener&quot; para la letra verde de posición conocida. Filtra por longitud = 5 letras.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>2</span>
              <div>
                <strong>Para Scrabble: busca primero las más largas</strong>
                <p>Los resultados aparecen ordenados de mayor a menor longitud. Las palabras más largas dan más puntos base. Examina primero las de 7+ letras (potencial bingo) antes de conformarte con una corta.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>3</span>
              <div>
                <strong>Ajusta los filtros de longitud</strong>
                <p>Si obtienes demasiados resultados, sube la longitud mínima. Si no encuentras nada, baja la longitud mínima a 2 o 3 letras para ver qué palabras cortas son posibles con tus letras disponibles.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>4</span>
              <div>
                <strong>Usa el filtro &quot;debe contener&quot; estratégicamente</strong>
                <p>Este filtro es útil para encontrar palabras que incluyan una letra específica que necesitas colocar en el tablero, o para encontrar palabras que usen una letra de alto valor (X, Q, Z) que tengas en el atril.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>5</span>
              <div>
                <strong>Prueba los ejemplos para familiarizarte</strong>
                <p>Los botones de ejemplo (amor, mesa, palabra, corazon) muestran cómo funciona la herramienta. &quot;corazon&quot; con 7 letras genera docenas de palabras — es un buen punto de partida para explorar.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>6</span>
              <div>
                <strong>Amplía con más letras si los resultados son escasos</strong>
                <p>Si con 4 letras obtienes pocos resultados, añade una o dos letras más comunes (A, E, R, S). Cuantas más letras disponibles, más combinaciones posibles y más palabras encontrarás en el diccionario.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Consejos de Estrategia para Juegos de Palabras</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📊</span>
              <h4>Frecuencia de letras en español</h4>
              <p>Las letras más frecuentes en español son: E (13,7%), A (12,5%), O (8,7%), S (7,9%), R (6,9%), N (6,7%), I (6,2%), D (5,9%). Prioriza palabras que usen estas letras.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🎯</span>
              <h4>Memoriza palabras de 2-3 letras</h4>
              <p>En Scrabble, las palabras cortas son cruciales para crear jugadas paralelas. Válidas: AX, XI, QI (si se aceptan anglicismos), OI, ID, ET. Verificar siempre en el diccionario oficial.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🔄</span>
              <h4>Piensa en sufijos y prefijos</h4>
              <p>Si ves letras como -CIÓN, -MENTE, -ANDO, -ANDO en tu atril, busca raíces que las complementen. Los sufijos son predecibles y permiten planificar jugadas de alto valor.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🧠</span>
              <h4>Entrena la visualización mental</h4>
              <p>Los mejores jugadores de Scrabble practican reorganizar letras mentalmente sin ayuda. Dedica 5 minutos al día a intentar encontrar palabras antes de usar el generador como verificación.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📖</span>
              <h4>Amplía tu vocabulario pasivo</h4>
              <p>No necesitas saber el significado exacto de una palabra para usarla en Scrabble — solo necesitas saber que existe y es válida. Lista de palabras raras válidas: OHM, JOT, ZAG, QAT (si aceptadas).</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>⚡</span>
              <h4>Velocidad en Wordle competitivo</h4>
              <p>En Wordle competitivo contra el reloj, la segunda palabra debe eliminar el máximo de letras restantes. Si la primera palabra reveló A y R, elige una segunda que no las repita y cubra otras letras frecuentes.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcon}>⚠️</span>
            <div>
              <strong>Sobre el diccionario utilizado</strong>
              <ul>
                <li><strong>Fuente</strong>: Lemario General del Español de Ismael Olea (<a href="https://github.com/olea/lemarios" target="_blank" rel="noopener noreferrer">github.com/olea/lemarios</a>), distribuido en dominio público. Aproximadamente 87.000 lemas del español estándar.</li>
                <li><strong>Lemas, no flexiones completas</strong>: El diccionario contiene formas base y flexiones frecuentes, pero puede no incluir todas las conjugaciones verbales raras o regionalismos muy específicos.</li>
                <li><strong>No es árbitro oficial</strong>: Para partidas competitivas de Scrabble, usa siempre el diccionario oficial de la FISE. Este generador es una herramienta de práctica y aprendizaje.</li>
                <li><strong>Sensibilidad a tildes</strong>: El sistema distingue entre letras con y sin tilde. Si no encuentras una palabra, prueba con y sin acentos en las vocales.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-anagramas')} />

      <ShareCard appName="generador-anagramas" />
      <Footer appName="generador-anagramas" />
    </div>
  );
}
