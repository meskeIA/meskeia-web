'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef, type FormEvent } from 'react';
import styles from './BuscadorPalabrasPatron.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';

/**
 * Buscador de palabras por patrón. Usa el Lemario General del Español de
 * Ismael Olea (dominio público, 86.973 lemas) servido como archivo estático.
 */
const DICT_URL = '/data/diccionario-es.txt';
const DICT_CACHE_KEY = 'meskeia_dict_es_v1';

type DictStatus = 'loading' | 'ready' | 'error';

/**
 * Minúsculas y sin tildes (á→a, ü→u…), pero con la ñ INTACTA.
 *
 * Quitaba todo el rango U+0300–U+036F tras NFD, y ese rango incluye U+0303, la tilde de la ñ:
 * la ñ salía convertida en n en el patrón, en el diccionario y en los dos filtros (hallazgo
 * 2431). La ñ es una letra propia del alfabeto, no una n con tilde, y la app hermana
 * generador-anagramas ya la distingue. Se recompone antes de quitar las demás marcas.
 */
const normalizar = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/ñ/g, 'ñ')
    .replace(/[̀-ͯ]/g, '');

/** Caracteres que admite el patrón ya normalizado: letras, ñ y el comodín «_». */
const CARACTER_VALIDO = /^[a-zñ_]$/;

interface PatronPreparado {
  /** Patrón normalizado, sin espacios en los extremos y con «?» convertido en «_» */
  patron: string;
  /** Caracteres que no son letras ni comodines (sin repetir), en el orden en que aparecen */
  invalidos: string[];
}

/**
 * Prepara lo tecleado para buscar. Los espacios de los extremos (un pegado, el autocompletado
 * del teclado) se descartan; cualquier otro carácter que no sea letra ni comodín NO se descarta:
 * quitarlo cambiaría la longitud y se buscaría otra palabra. Se señala y no se busca
 * (hallazgo 2435, que prometía descartarlos todos y respondía «No se encontraron palabras»).
 */
function prepararPatron(texto: string): PatronPreparado {
  const patron = normalizar(texto.trim()).replace(/\?/g, '_');
  const invalidos = Array.from(new Set(Array.from(patron).filter((c) => !CARACTER_VALIDO.test(c))));
  return { patron, invalidos };
}

/** Nombre legible de un carácter no válido para el aviso. */
const nombrarCaracter = (c: string): string => (/\s/.test(c) ? 'un espacio' : `«${c}»`);

/**
 * En pantallas táctiles, al buscar desde la tecla de acción del teclado se cierra el teclado:
 * si no, tapa justo los resultados que se acaban de pedir. Con ratón no se toca el foco.
 * Devuelve si lo ha cerrado, para que quien llama lleve después la vista a los resultados.
 * (Misma receta que generador-anagramas, hallazgo 2278.)
 */
function cerrarTecladoTactil(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia('(pointer: coarse)').matches) {
    return false;
  }
  const activo = document.activeElement;
  if (activo instanceof HTMLElement) activo.blur();
  return true;
}

export default function BuscadorPalabrasPatronPage() {
  const [pattern, setPattern] = useState('');
  const [mustContain, setMustContain] = useState('');
  const [mustNotContain, setMustNotContain] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  /** Caracteres no válidos del patrón de la última búsqueda pedida (vacío si era válido) */
  const [invalidos, setInvalidos] = useState<string[]>([]);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [dictStatus, setDictStatus] = useState<DictStatus>('loading');

  /**
   * Número de la búsqueda vigente. Editar cualquier campo lo incrementa, así que una búsqueda
   * que aún no había terminado (va en un setTimeout) no pinta sus resultados bajo el patrón
   * nuevo (hallazgo 2430).
   */
  const busquedaVigente = useRef(0);

  /** Tras buscar desde el teclado táctil, lleva la vista a los resultados (ver cerrarTecladoTactil) */
  const desplazarAResultados = useRef(false);
  const anclaResultados = useRef<HTMLDivElement>(null);

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

  /** Longitud del lema más largo del diccionario cargado (0 mientras no ha cargado). */
  const longitudMaximaLema = useMemo(() => {
    const longitudes = Object.keys(indexedByLength).map(Number);
    return longitudes.length > 0 ? Math.max(...longitudes) : 0;
  }, [indexedByLength]);

  const preparado = useMemo(() => prepararPatron(pattern), [pattern]);
  const longitudPatron = Array.from(preparado.patron).length;
  const huecosCount = Array.from(preparado.patron).filter((c) => c === '_').length;

  const puedeBuscar = longitudPatron >= 2 && !isSearching && dictStatus === 'ready';

  /**
   * Lo que hay en pantalla deja de valer en cuanto se edita un campo: los chips o el «No se
   * encontraron» de antes se presentaban como del patrón nuevo (hallazgo 2430, la forma de los
   * 194 y 195 de generador-anagramas).
   */
  const invalidarResultados = () => {
    busquedaVigente.current += 1;
    setResults([]);
    setSearched(false);
    setInvalidos([]);
    setIsSearching(false);
  };

  const buscar = () => {
    const id = ++busquedaVigente.current;
    const { patron, invalidos: noValidos } = preparado;
    setIsSearching(true);
    setSearched(true);
    setInvalidos(noValidos);

    setTimeout(() => {
      // Se editó algún campo mientras tanto: esta búsqueda ya no corresponde a lo tecleado
      if (id !== busquedaVigente.current) return;

      if (!patron || noValidos.length > 0) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      const caracteres = Array.from(patron);
      const bucket = indexedByLength[caracteres.length];
      if (!bucket) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      // Construir regex del patrón: _ → ., letras → letras literales (ya validadas)
      const regex = new RegExp(`^${caracteres.map((c) => (c === '_' ? '.' : c)).join('')}$`);

      // Filtros de contiene / no contiene: se toman solo las letras (admiten «r,t», «r t»…)
      const incluyeLetras = Array.from(normalizar(mustContain)).filter((c) => /[a-zñ]/.test(c));
      const excluyeLetras = Array.from(normalizar(mustNotContain)).filter((c) => /[a-zñ]/.test(c));

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

  /** La tecla de acción del teclado («Buscar», «Ir», Intro) busca igual que el botón (hallazgo 2429). */
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!puedeBuscar) return;
    if (cerrarTecladoTactil()) desplazarAResultados.current = true;
    buscar();
  };

  // Lleva la vista a los resultados cuando llegan, si el envío lo pidió (ver desplazarAResultados)
  useEffect(() => {
    if (!desplazarAResultados.current || !searched || isSearching) return;
    desplazarAResultados.current = false;
    anclaResultados.current?.scrollIntoView({ block: 'start' });
  }, [searched, isSearching, results]);

  const handleClear = () => {
    setPattern('');
    setMustContain('');
    setMustNotContain('');
    invalidarResultados();
  };

  const ejemplos = [
    { pattern: '_a_a_o', label: '_a_a_o' },
    { pattern: 'c_s_', label: 'c_s_' },
    { pattern: '_ie__o', label: '_ie__o' },
    { pattern: 'p_r__', label: 'p_r__' },
  ];

  const formattedDictSize = useMemo(
    () => formatNumber(dictionary.length, 0),
    [dictionary.length]
  );

  const mostrarInvalido = searched && !isSearching && invalidos.length > 0;
  const mostrarVacio =
    searched && !isSearching && invalidos.length === 0 && results.length === 0 && dictStatus === 'ready';

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

        {/*
          * Un <form> de verdad para que la tecla de acción del teclado («Buscar», «Ir», Intro)
          * busque: sin él no hacía nada, y en un Pixel 7 el botón queda 335 px por debajo del
          * campo, detrás del teclado abierto (hallazgo 2429, la forma del 2278).
          */}
        <form onSubmit={enviar} noValidate>
        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="pattern-input">Patrón de búsqueda:</label>
          {/*
            * Sin maxLength: recortaba en silencio lo pegado («electroencefalografía», 21 letras,
            * se quedaba en 20 y no se encontraba; hallazgo 2436, la forma del 2279). El patrón
            * admite la longitud que tenga la palabra.
            */}
          <input
            id="pattern-input"
            type="text"
            className={styles.input}
            value={pattern}
            onChange={(e) => { setPattern(e.target.value); invalidarResultados(); }}
            placeholder="Ej: _A_A_O"
            autoComplete="off"
            inputMode="text"
            enterKeyHint="search"
            spellCheck={false}
            aria-describedby="pattern-help"
          />
          <div className={styles.patternHelp}>
            <span className={styles.helpText} id="pattern-help">
              Cada <code className={styles.codeInline}>_</code> (o <code className={styles.codeInline}>?</code>) representa una letra cualquiera.
              {longitudPatron > 0 && (
                <>
                  {' '}Longitud: <strong>{longitudPatron} {longitudPatron === 1 ? 'letra' : 'letras'}</strong>{' '}
                  ({huecosCount} {huecosCount === 1 ? 'hueco' : 'huecos'})
                </>
              )}
            </span>
          </div>
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Probar:</span>
            {ejemplos.map((ex) => (
              <button
                key={ex.pattern}
                className={styles.exampleBtn}
                onClick={() => { setPattern(ex.pattern.toUpperCase()); invalidarResultados(); }}
                type="button"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sin maxLength (recortaba en silencio las letras grises de Wordle pegadas con comas) */}
        <div className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="must-contain">Debe contener:</label>
            <input
              id="must-contain"
              type="text"
              className={styles.filterInput}
              value={mustContain}
              onChange={(e) => { setMustContain(e.target.value); invalidarResultados(); }}
              placeholder="Opcional (ej. r,t)"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="must-not-contain">No debe contener:</label>
            <input
              id="must-not-contain"
              type="text"
              className={styles.filterInput}
              value={mustNotContain}
              onChange={(e) => { setMustNotContain(e.target.value); invalidarResultados(); }}
              placeholder="Opcional"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
        </div>

        <div className={styles.buttonRow}>
          {/* type="submit": el botón por defecto del <form>, el que dispara la tecla Intro */}
          <button
            className={styles.btnPrimary}
            disabled={!puedeBuscar}
            type="submit"
          >
            {isSearching ? 'Buscando...' : 'Buscar palabras'}
          </button>
          <button onClick={handleClear} className={styles.btnSecondary} type="button">
            Limpiar
          </button>
        </div>
        </form>
        <div ref={anclaResultados} className={styles.anclaResultados} aria-hidden="true" />

        <div className={results.length > 0 ? styles.resultsSection : undefined}>
          {/*
            * La región viva está siempre montada y solo lleva el veredicto: el recuento o el
            * aviso de cero resultados. Antes envolvía también la rejilla (14.103 palabras con
            * «________») y el aviso de cero no se anunciaba (hallazgo 2432).
            */}
          <div role="status" aria-live="polite" aria-atomic="true">
            {results.length > 0 && (
              <div className={styles.resultsHeader}>
                <h3>Palabras encontradas: {formatNumber(results.length, 0)}</h3>
              </div>
            )}

            {mostrarInvalido && (
              <div className={styles.noResults}>
                <p>
                  No se ha buscado: el patrón lleva {invalidos.map(nombrarCaracter).join(', ')}, que no{' '}
                  {invalidos.length === 1 ? 'es una letra ni un comodín' : 'son letras ni comodines'}.
                </p>
                <p className={styles.hint}>
                  Comprueba que el patrón solo contiene letras y guiones bajos (o <code>?</code>).
                </p>
              </div>
            )}

            {mostrarVacio && (
              <div className={styles.noResults}>
                <p>No se encontraron palabras que coincidan con ese patrón.</p>
                <p className={styles.hint}>
                  {longitudMaximaLema > 0 && longitudPatron > longitudMaximaLema
                    ? `La palabra más larga del diccionario tiene ${longitudMaximaLema} letras y el patrón tiene ${longitudPatron}.`
                    : 'Convierte en _ alguna letra dudosa del patrón, o relaja los filtros.'}
                </p>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className={styles.wordsGrid}>
              {results.map((word) => (
                <span key={word} className={styles.wordChip}>{word}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="Aprende a usar el Buscador de Palabras por Patrón"
        subtitle="Casos de uso reales, buenas prácticas y comparativa con otras herramientas de palabras"
        icon="🔍"
      >
        <section>
          <h3><span aria-hidden="true">📊</span> Comparativa con otras herramientas de palabras</h3>
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
          <h3><span aria-hidden="true">🎯</span> Casos de uso reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧩</span>
              <h4>Crucigramas y autodefinidos</h4>
              <p>
                Estás resolviendo un crucigrama y tienes <code>C_R_E_O</code> con definición “cría de la oveja”.
                Introduce el patrón y verás CARNERO, CARTERO, CIRUELO, CORDERO… filtra mentalmente la que
                encaja con la definición (CORDERO). Acelera los pasatiempos sin “hacer trampas” a las definiciones.
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
          <h3><span aria-hidden="true">❓</span> Preguntas frecuentes</h3>
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
                y <code>casa</code> se tratan igual, y un patrón <code>_rbol</code> encuentra ÁRBOL
                aunque no escribas la tilde. La ñ, en cambio, es una letra propia y no una n con tilde:
                <code>_año</code> da BAÑO o PAÑO, pero no MANO.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Por qué a veces no aparece una palabra que conozco?</summary>
              <p className={styles.faqAnswer}>
                El buscador utiliza el Lemario General del Español de Ismael Olea (86.973 lemas):
                solo recoge <strong>lemas</strong>, es decir, la forma de diccionario de cada palabra
                (el singular, el infinitivo). <strong>No incluye plurales ni formas conjugadas</strong>:
                CASA sí, CASAS no; COMER sí, COMIÓ no. Tampoco regionalismos muy específicos. El <a href="https://dle.rae.es/" target="_blank" rel="noopener noreferrer">DLE de la RAE</a>
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
                El campo no tiene tope: el patrón puede ser tan largo como la palabra que buscas. La
                más larga del lemario tiene 23 letras, y por encima de 15 hay muy pocas (976 de las
                86.973). Recuerda que la longitud del patrón es exactamente la de la palabra: no hay
                búsqueda por longitud mínima, así que cada longitud se busca con su propio patrón.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Sirve para Scrabble o Apalabrados?</summary>
              <p className={styles.faqAnswer}>
                Sí, sobre todo cuando ya tienes letras colocadas en el tablero. Si el atril te ofrece
                una jugada que extiende una palabra existente, el patrón te dice qué palabras encajan.
                Para partidas <em>oficiales</em> de Scrabble, recuerda que el diccionario válido es el
                de la FISE, que admite plurales y formas conjugadas; este lemario no las trae.
              </p>
            </details>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">📋</span> Cómo sacar el máximo partido</h3>
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
          <h3><span aria-hidden="true">💡</span> Mejores prácticas</h3>
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
                El sistema compara sin tildes, así que <code>cancion</code> encuentra CANCIÓN.
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
                {' '}<code>?</code>. Los espacios al principio o al final se ignoran; un número, un signo
                o un espacio en medio no se quitan (cambiaría la longitud): la app te dice cuál es y no busca.
              </li>
              <li>
                <strong>Esperar plurales o formas conjugadas</strong>: el lemario solo trae la forma de
                diccionario (CASA, COMER), no CASAS ni COMIÓ. Busca el singular o el infinitivo; para
                las formas verbales, el <a href="/conjugador-verbos/">conjugador de verbos</a> es más adecuado.
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

      <RelatedApps />

      <ShareCard appName="buscador-palabras-patron" />
      <Footer appName="buscador-palabras-patron" />
    </div>
  );
}
