'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect } from 'react';
import styles from './BuscadorPalabrasPatron.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/**
 * Buscador de palabras por patrón. Usa el Lemario General del Español de
 * Ismael Olea (dominio público, ~87k lemas) servido como archivo estático.
 */
const DICT_URL = '/data/diccionario-es.txt';
const DICT_CACHE_KEY = 'meskeia_dict_es_v1';

type DictStatus = 'loading' | 'ready' | 'error';

const normalizar = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function BuscadorPalabrasPatronPage() {
  const [pattern, setPattern] = useState('');
  const [mustContain, setMustContain] = useState('');
  const [mustNotContain, setMustNotContain] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [dictStatus, setDictStatus] = useState<DictStatus>('loading');

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(DICT_CACHE_KEY) : null;
    if (cached) {
      setDictionary(cached.split('\n').filter(Boolean));
      setDictStatus('ready');
      return;
    }

    fetch(DICT_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setDictionary(text.split('\n').filter(Boolean));
        setDictStatus('ready');
        try { sessionStorage.setItem(DICT_CACHE_KEY, text); } catch { /* sessionStorage lleno */ }
      })
      .catch(() => setDictStatus('error'));
  }, []);

  // Índice precomputado: por longitud, pares [palabra_original, palabra_normalizada]
  const indexedByLength = useMemo(() => {
    const index: { [key: number]: Array<[string, string]> } = {};
    for (const word of dictionary) {
      const len = word.length;
      if (!index[len]) index[len] = [];
      index[len].push([word, normalizar(word)]);
    }
    return index;
  }, [dictionary]);

  const buscar = () => {
    setIsSearching(true);
    setSearched(true);

    setTimeout(() => {
      // Normalizar patrón: el usuario puede usar _ o ? como comodín
      const normalizedPattern = pattern
        .toLowerCase()
        .replace(/\?/g, '_')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

      // Validar: solo letras a-z, ñ y _
      if (!normalizedPattern || !/^[a-zñ_]+$/.test(normalizedPattern)) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      const longitud = normalizedPattern.length;
      const bucket = indexedByLength[longitud];
      if (!bucket) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      // Construir regex del patrón: _ → ., letras → letras literales
      const regexBody = normalizedPattern
        .split('')
        .map((c) => (c === '_' ? '.' : c))
        .join('');
      const regex = new RegExp(`^${regexBody}$`);

      // Filtros de contiene / no contiene
      const incluyeLetras = normalizar(mustContain).split('').filter((c) => /[a-zñ]/.test(c));
      const excluyeLetras = normalizar(mustNotContain).split('').filter((c) => /[a-zñ]/.test(c));

      const encontradas: string[] = [];
      for (const [original, normalizado] of bucket) {
        if (!regex.test(normalizado)) continue;
        if (incluyeLetras.length > 0 && !incluyeLetras.every((l) => normalizado.includes(l))) continue;
        if (excluyeLetras.length > 0 && excluyeLetras.some((l) => normalizado.includes(l))) continue;
        encontradas.push(original);
      }

      encontradas.sort((a, b) => a.localeCompare(b, 'es'));
      setResults(encontradas);
      setIsSearching(false);
    }, 50);
  };

  const handleClear = () => {
    setPattern('');
    setMustContain('');
    setMustNotContain('');
    setResults([]);
    setSearched(false);
  };

  const ejemplos = [
    { pattern: '_a_a_o', label: '_a_a_o' },
    { pattern: 'c_s_', label: 'c_s_' },
    { pattern: '_ie__o', label: '_ie__o' },
    { pattern: 'p_r__', label: 'p_r__' },
  ];

  const formattedDictSize = useMemo(
    () => dictionary.length.toLocaleString('es-ES'),
    [dictionary.length]
  );

  const longitudPatron = pattern.length;
  const huecosCount = (pattern.match(/[_?]/g) || []).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Buscador de Palabras por Patrón</h1>
        <p className={styles.subtitle}>
          Encuentra palabras que encajan en huecos. Usa <code className={styles.codeInline}>_</code> como comodín.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {dictStatus === 'loading' && (
          <div className={`${styles.dictStatus} ${styles.dictStatusLoading}`} role="status" aria-live="polite">
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
          <div className={`${styles.dictStatus} ${styles.dictStatusError}`} role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>No se pudo cargar el diccionario. Recarga la página para reintentar.</span>
          </div>
        )}

        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="pattern-input">Patrón de búsqueda:</label>
          <input
            id="pattern-input"
            type="text"
            className={styles.input}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Ej: _A_A_O"
            maxLength={20}
            autoComplete="off"
            inputMode="text"
            spellCheck={false}
          />
          <div className={styles.patternHelp}>
            <span className={styles.helpText}>
              Cada <code className={styles.codeInline}>_</code> representa una letra cualquiera.
              {longitudPatron > 0 && (
                <> Longitud: <strong>{longitudPatron} letras</strong> ({huecosCount} huecos)</>
              )}
            </span>
          </div>
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Probar:</span>
            {ejemplos.map((ex) => (
              <button
                key={ex.pattern}
                className={styles.exampleBtn}
                onClick={() => setPattern(ex.pattern.toUpperCase())}
                type="button"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="must-contain">Debe contener:</label>
            <input
              id="must-contain"
              type="text"
              className={styles.filterInput}
              value={mustContain}
              onChange={(e) => setMustContain(e.target.value)}
              placeholder="Opcional (ej. r,t)"
              maxLength={6}
              autoComplete="off"
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="must-not-contain">No debe contener:</label>
            <input
              id="must-not-contain"
              type="text"
              className={styles.filterInput}
              value={mustNotContain}
              onChange={(e) => setMustNotContain(e.target.value)}
              placeholder="Opcional"
              maxLength={6}
              autoComplete="off"
            />
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button
            onClick={buscar}
            className={styles.btnPrimary}
            disabled={pattern.length < 2 || isSearching || dictStatus !== 'ready'}
            type="button"
          >
            {isSearching ? 'Buscando...' : 'Buscar palabras'}
          </button>
          <button onClick={handleClear} className={styles.btnSecondary} type="button">
            Limpiar
          </button>
        </div>

        {results.length > 0 && (
          <div className={styles.resultsSection} role="status" aria-live="polite" aria-atomic="true">
            <div className={styles.resultsHeader}>
              <h3>Palabras encontradas: {results.length}</h3>
            </div>
            <div className={styles.wordsGrid}>
              {results.map((word) => (
                <span key={word} className={styles.wordChip}>{word}</span>
              ))}
            </div>
          </div>
        )}

        {searched && results.length === 0 && !isSearching && dictStatus === 'ready' && (
          <div className={styles.noResults}>
            <p>No se encontraron palabras que coincidan con ese patrón.</p>
            <p className={styles.hint}>
              Comprueba que el patrón solo contiene letras y guiones bajos, o relaja los filtros.
            </p>
          </div>
        )}
      </div>

      <EducationalSection
        title="Aprende a usar el Buscador de Palabras por Patrón"
        subtitle="Casos de uso reales, buenas prácticas y comparativa con otras herramientas de palabras"
        icon="🔍"
      >
        <section>
          <h3>📊 Comparativa con otras herramientas de palabras</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Herramienta</th>
                  <th>Qué resuelve</th>
                  <th>Cuándo usarla</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Buscador por patrón</strong></td>
                  <td>Sabes qué letras van en qué posición (con huecos)</td>
                  <td>Crucigramas, autodefinidos, Wordle con pistas verdes</td>
                </tr>
                <tr>
                  <td><a href="/generador-anagramas/">Generador de anagramas</a></td>
                  <td>Tienes letras sueltas, no sabes el orden</td>
                  <td>Scrabble, Apalabrados, encontrar palabras con un atril de letras</td>
                </tr>
                <tr>
                  <td><a href="/juego-wordle/">Wordle</a></td>
                  <td>Juego de adivinar la palabra del día</td>
                  <td>Pasatiempo diario; el buscador por patrón ayuda al introducir pistas</td>
                </tr>
                <tr>
                  <td><a href="/juego-ahorcado/">Ahorcado</a></td>
                  <td>Juego clásico de adivinanza por letras</td>
                  <td>Práctica de vocabulario, especialmente con niños</td>
                </tr>
                <tr>
                  <td><a href="/conjugador-verbos/">Conjugador de verbos</a></td>
                  <td>Formas verbales correctas</td>
                  <td>Cuando el hueco es claramente un verbo conjugado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 Casos de uso reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧩</span>
              <h4>Crucigramas y autodefinidos</h4>
              <p>
                Estás resolviendo un crucigrama y tienes <code>C_R_E_O</code> con definición “pequeño bote”.
                Introduce el patrón y verás CORREO, CARTERO, CIRUELO… filtra mentalmente la que encaja
                con la definición. Acelera enormemente los pasatiempos sin “hacer trampas” a las definiciones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <h4>Wordle con pistas verdes</h4>
              <p>
                Después de un intento en Wordle tienes letras verdes (posición correcta) y amarillas
                (presentes). Pon las verdes en su posición con <code>_</code> en el resto, las amarillas
                en “debe contener” y las grises en “no debe contener”. Filtra a 5 letras y verás las
                opciones reales que aún encajan.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📝</span>
              <h4>Redacción y diseño tipográfico</h4>
              <p>
                Necesitas una palabra de longitud exacta para un titular, un logotipo o un eslogan que
                cuadre con un patrón rítmico. Busca por longitud y forma de letras, no por significado.
                Después contrasta con un diccionario para elegir la que más te encaje.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
              <h4>Aprendizaje de vocabulario</h4>
              <p>
                Para estudiantes de español como segunda lengua o para reforzar ortografía: explorar
                palabras con un patrón concreto (por ejemplo, todas las que terminan en <code>__cion</code>)
                ayuda a fijar familias morfológicas y sufijos productivos.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Qué significa el guion bajo <code>_</code>?</summary>
              <p className={styles.faqAnswer}>
                Cada <code>_</code> representa una letra cualquiera. Si escribes <code>_A_A_O</code>,
                buscas palabras de 6 letras donde la 2ª es A, la 4ª es A y la 6ª es O. La 1ª, 3ª y 5ª
                pueden ser cualquier letra. También se acepta <code>?</code> como comodín.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Distingue entre mayúsculas y minúsculas?</summary>
              <p className={styles.faqAnswer}>
                No. Internamente todo se compara en minúsculas y sin tildes, así que <code>CASA</code>
                y <code>casa</code> se tratan igual, y un patrón <code>c_s_</code> encontrará también
                palabras con tildes como CAÍDA o CASÉ.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Por qué a veces no aparece una palabra que conozco?</summary>
              <p className={styles.faqAnswer}>
                El buscador utiliza el Lemario General del Español de Ismael Olea (≈87.000 lemas),
                que incluye lemas comunes pero <strong>no todas las conjugaciones verbales</strong>,
                regionalismos muy específicos ni todas las flexiones (plurales irregulares, formas
                verbales raras). El <a href="https://dle.rae.es/" target="_blank" rel="noopener noreferrer">DLE de la RAE</a>
                supera las 93.000 entradas, así que existe vocabulario adicional fuera del lemario.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Cómo combino el patrón con los filtros “debe” y “no debe contener”?</summary>
              <p className={styles.faqAnswer}>
                Los tres operadores se aplican simultáneamente. El patrón fija longitud y posiciones
                concretas; “debe contener” exige que las letras indicadas aparezcan en algún hueco
                (no fija dónde); “no debe contener” descarta cualquier palabra que use alguna de las
                letras vetadas. Es la combinación clásica para resolver Wordle con pistas.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Cuál es la longitud máxima del patrón?</summary>
              <p className={styles.faqAnswer}>
                20 caracteres. El lemario incluye palabras de hasta 23 letras pero por encima de 15
                hay muy pocas, y un patrón con tantos huecos rara vez es útil en pasatiempos. Si
                necesitas explorar palabras muy largas, baja la longitud mínima en filtros.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Sirve para Scrabble o Apalabrados?</summary>
              <p className={styles.faqAnswer}>
                Sí, sobre todo cuando ya tienes letras colocadas en el tablero. Si el atril te ofrece
                una jugada que extiende una palabra existente, el patrón te dice qué palabras encajan.
                Para partidas <em>oficiales</em> de Scrabble, recuerda que el diccionario válido es el
                de la FISE, que incluye más flexiones que este lemario.
              </p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Cómo sacar el máximo partido</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Cuenta los huecos correctos</strong>
                <p>
                  La longitud del patrón es exactamente la longitud de la palabra. Si el crucigrama
                  tiene 7 casillas, tu patrón debe tener 7 caracteres entre letras y guiones bajos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Empieza por las letras más seguras</strong>
                <p>
                  Si tienes dudas con alguna letra, déjala como <code>_</code>. Sumar muchas letras
                  conjeturales filtra demasiado y deja la búsqueda sin resultados.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Usa “debe contener” para pistas adicionales</strong>
                <p>
                  Si sabes que la palabra contiene una letra concreta pero no su posición (por
                  ejemplo, las pistas amarillas de Wordle), añádela en “debe contener”.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Excluye letras descartadas</strong>
                <p>
                  Si una letra ya está descartada (pista gris en Wordle, error confirmado), añádela en
                  “no debe contener”. Cada exclusión reduce considerablemente los resultados.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Si no aparece nada, relaja una letra</strong>
                <p>
                  Cuando no hay resultados, la causa habitual es que una de las letras del patrón es
                  errónea. Convierte la letra dudosa en <code>_</code> y vuelve a buscar.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Combínalo con el generador de anagramas</strong>
                <p>
                  Si tienes letras sueltas en el atril (Scrabble, Apalabrados), el <a href="/generador-anagramas/">generador
                  de anagramas</a> es la herramienta complementaria: te dice qué palabras puedes formar
                  con esas letras. Este buscador te dice qué palabras encajan en un hueco dado.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Empieza ancho y filtra</h4>
              <p>
                Es mejor obtener 50 resultados y refinarlos con filtros que empezar con un patrón
                hiperespecífico y no obtener nada. Si dudas, deja huecos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <h4>No te preocupes por las tildes</h4>
              <p>
                El sistema compara sin tildes, así que <code>c_s_</code> encuentra también CASÉ.
                Si necesitas la forma ortográfica exacta, mírala en la lista de resultados:
                se muestran con sus acentos correctos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧠</span>
              <h4>Memoriza patrones frecuentes</h4>
              <p>
                Sufijos como <code>__CION</code>, <code>__DAD</code> o <code>__MENTE</code> son
                súper productivos en español. Saber cuántas letras te quedan delante te ayuda a
                acotar rápido en crucigramas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📖</span>
              <h4>Verifica con un diccionario</h4>
              <p>
                El lemario garantiza que las palabras existen en español, pero no su significado.
                Antes de dar una respuesta como correcta en un crucigrama, comprueba la definición
                en el DLE de la RAE.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h4>Atajos rápidos en Wordle</h4>
              <p>
                Si Wordle te marca posición 1 como N y posición 4 como E, busca <code>N__E_</code>
                añadiendo en “debe contener” las amarillas. Suele dejarte 3-10 candidatos verificables.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes al usar el buscador</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir longitud</strong>: el patrón debe tener exactamente las mismas
                letras y guiones que la palabra buscada. Una letra de más o de menos cambia la búsqueda.
              </li>
              <li>
                <strong>Poner caracteres no válidos</strong>: solo se admiten letras, <code>_</code> y
                <code>?</code>. Espacios, números o signos de puntuación se descartan automáticamente.
              </li>
              <li>
                <strong>Esperar todas las conjugaciones verbales</strong>: el lemario incluye lemas
                e inflexiones frecuentes, pero no todas. Si buscas formas verbales muy específicas,
                el <a href="/conjugador-verbos/">conjugador de verbos</a> es más adecuado.
              </li>
              <li>
                <strong>Filtros “debe” y “no debe” contradictorios</strong>: si pones la misma letra
                en ambos filtros nunca habrá resultados. El sistema no avisa; simplemente devuelve
                una lista vacía.
              </li>
              <li>
                <strong>Letras del patrón duplicadas en “debe contener”</strong>: no hace falta repetir
                en “debe contener” las letras que ya pones en posiciones fijas del patrón; estas ya
                están exigidas por defecto.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('buscador-palabras-patron')} />

      <ShareCard appName="buscador-palabras-patron" />
      <Footer appName="buscador-palabras-patron" />
    </div>
  );
}
