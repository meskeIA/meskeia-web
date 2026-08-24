'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef } from 'react';
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
type Modo = 'letras' | 'frase' | 'verificar';

// -------------------------------------------------------------------------------------------------
// Motor de ANAGRAMAS PERFECTOS (multi-palabra)
//
// Un anagrama perfecto consume TODAS las letras del texto de partida, repartiéndolas entre varias
// palabras del diccionario ("SALVADOR DALI" → "AVIDA DOLLARS"). Es un problema de reparto exacto
// de un multiconjunto, no una búsqueda de subcadenas: por eso lleva motor propio y no reutiliza
// la búsqueda de palabras formables del primer modo.
// -------------------------------------------------------------------------------------------------

const ALFABETO = 'abcdefghijklmnñopqrstuvwxyz';
const IDX_LETRA: Record<string, number> = {};
for (let i = 0; i < ALFABETO.length; i++) IDX_LETRA[ALFABETO[i]] = i;

// Las tildes son variantes ortográficas de la vocal base: para repartir letras estorban
// (nadie escribe "SALVADOR DALÍ" pensando en dónde cae la tilde del resultado).
const SIN_TILDE: Record<string, string> = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u',
  à: 'a', è: 'e', ì: 'i', ò: 'o', ù: 'u',
  â: 'a', ê: 'e', î: 'i', ô: 'o', û: 'u',
  ä: 'a', ë: 'e', ï: 'i', ö: 'o', ç: 'c',
};

/** Minúsculas, sin tildes y descartando todo lo que no sea letra del alfabeto español. */
function normalizarTexto(texto: string): string {
  let salida = '';
  for (const caracter of texto.toLowerCase()) {
    const base = SIN_TILDE[caracter] ?? caracter;
    if (IDX_LETRA[base] !== undefined) salida += base;
  }
  return salida;
}

/** Recuento de letras en 27 posiciones (a-z + ñ). */
function contarLetras(normalizado: string): Uint8Array {
  const cuenta = new Uint8Array(27);
  for (const caracter of normalizado) cuenta[IDX_LETRA[caracter]]++;
  return cuenta;
}

interface IndiceVocabulario {
  vocab: string[];      // formas normalizadas únicas
  firmas: Uint8Array;   // recuento de letras de cada palabra, plano (27 por palabra)
  letras: number[][];   // letras DISTINTAS de cada palabra (poda rápida)
}

/** Índice de reparto. Se construye una sola vez y solo si se usa el modo frase. */
function construirIndice(diccionario: string[]): IndiceVocabulario {
  const vistas = new Set<string>();
  const vocab: string[] = [];
  for (const palabra of diccionario) {
    const normalizada = normalizarTexto(palabra);
    if (normalizada.length < 2 || vistas.has(normalizada)) continue;
    vistas.add(normalizada);
    vocab.push(normalizada);
  }

  const firmas = new Uint8Array(vocab.length * 27);
  const letras: number[][] = new Array(vocab.length);
  for (let i = 0; i < vocab.length; i++) {
    const base = i * 27;
    const usadas: number[] = [];
    for (const caracter of vocab[i]) {
      const letra = IDX_LETRA[caracter];
      if (firmas[base + letra] === 0) usadas.push(letra);
      firmas[base + letra]++;
    }
    letras[i] = usadas;
  }
  return { vocab, firmas, letras };
}

type MotivoParada = 'completa' | 'tope' | 'tiempo';

interface ResultadoFrase {
  soluciones: string[][];
  motivo: MotivoParada;
  candidatas: number;   // palabras del diccionario que caben en esas letras
}

const MAX_SOLUCIONES = 300;
const MS_LIMITE = 4000;

/**
 * Reparte todas las letras de `objetivo` entre palabras del diccionario.
 *
 * La poda que lo hace viable: en cada paso se elige como pivote la letra pendiente con MENOS
 * palabras candidatas y se exige que la siguiente palabra la contenga. Así toda letra se consume
 * (nunca se explora una rama que deja letras imposibles) y el factor de ramificación se desploma.
 * Como una misma combinación puede alcanzarse por varios pivotes, se deduplica por clave ordenada.
 */
function buscarAnagramasPerfectos(
  objetivo: Uint8Array,
  indice: IndiceVocabulario,
  maxPalabras: number,
  minLongitud: number,
  claveTrivial: string
): ResultadoFrase {
  const { vocab, firmas, letras } = indice;

  // 1. Candidatas: palabras que caben enteras en las letras disponibles
  const candidatas: number[] = [];
  for (let i = 0; i < vocab.length; i++) {
    if (vocab[i].length < minLongitud) continue;
    const base = i * 27;
    let cabe = true;
    for (const letra of letras[i]) {
      if (firmas[base + letra] > objetivo[letra]) { cabe = false; break; }
    }
    if (cabe) candidatas.push(i);
  }

  // 2. Índice inverso letra → candidatas que la usan (las largas primero: mejores soluciones antes)
  const porLetra: number[][] = Array.from({ length: 27 }, () => []);
  for (const i of candidatas) for (const letra of letras[i]) porLetra[letra].push(i);
  for (const bucket of porLetra) bucket.sort((a, b) => vocab[b].length - vocab[a].length);

  const restante = Uint8Array.from(objetivo);
  const elegidas: number[] = [];
  const soluciones: string[][] = [];
  const vistas = new Set<string>();
  const inicio = Date.now();
  let motivo: MotivoParada = 'completa';

  const explorar = (): void => {
    // Pivote: letra pendiente más restrictiva
    let pivote = -1;
    let menos = Infinity;
    for (let letra = 0; letra < 27; letra++) {
      if (restante[letra] === 0) continue;
      const cuantas = porLetra[letra].length;
      if (cuantas < menos) { menos = cuantas; pivote = letra; }
    }

    if (pivote === -1) {
      // No quedan letras pendientes: reparto exacto encontrado
      const palabras = elegidas.map((i) => vocab[i]).sort();
      const clave = palabras.join('|');
      // El texto de partida es anagrama de sí mismo: cierto, y completamente inútil de mostrar
      if (clave !== claveTrivial && !vistas.has(clave)) { vistas.add(clave); soluciones.push(palabras); }
      return;
    }
    if (elegidas.length >= maxPalabras) return; // quedan letras y ya no hay cupo de palabras

    for (const i of porLetra[pivote]) {
      const base = i * 27;
      let cabe = true;
      for (const letra of letras[i]) {
        if (firmas[base + letra] > restante[letra]) { cabe = false; break; }
      }
      if (!cabe) continue;

      for (const letra of letras[i]) restante[letra] -= firmas[base + letra];
      elegidas.push(i);
      explorar();
      elegidas.pop();
      for (const letra of letras[i]) restante[letra] += firmas[base + letra];

      if (soluciones.length >= MAX_SOLUCIONES) { motivo = 'tope'; return; }
      if (Date.now() - inicio > MS_LIMITE) { motivo = 'tiempo'; return; }
    }
  };
  explorar();

  // Menos palabras primero (un anagrama de 2 palabras vale más que uno de 4), luego la más larga
  soluciones.sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    const largaA = Math.max(...a.map((p) => p.length));
    const largaB = Math.max(...b.map((p) => p.length));
    if (largaA !== largaB) return largaB - largaA;
    return a.join(' ').localeCompare(b.join(' '), 'es');
  });

  return { soluciones, motivo, candidatas: candidatas.length };
}

interface DiferenciaLetras {
  letra: string;
  cantidad: number;
}

interface Comparacion {
  iguales: boolean;
  sobranEnA: DiferenciaLetras[];
  sobranEnB: DiferenciaLetras[];
  totalA: number;
  totalB: number;
  /**
   * Ninguno de los dos textos contiene una sola letra («123» frente a «456»). No hay nada
   * que juzgar, y sin esto salía el ❌ con una explicación que no explicaba nada: «El
   * original tiene 0 letras y la propuesta 0», sin ninguna letra en las listas de sobrantes
   * (hallazgo 265 del Inspector).
   */
  sinLetras: boolean;
}

/** Comprueba si dos textos son anagramas exactos y, si no, qué letras sobran en cada lado. */
function compararTextos(textoA: string, textoB: string): Comparacion {
  const normA = normalizarTexto(textoA);
  const normB = normalizarTexto(textoB);
  const cuentaA = contarLetras(normA);
  const cuentaB = contarLetras(normB);

  const sobranEnA: DiferenciaLetras[] = [];
  const sobranEnB: DiferenciaLetras[] = [];
  for (let letra = 0; letra < 27; letra++) {
    const diferencia = cuentaA[letra] - cuentaB[letra];
    if (diferencia > 0) sobranEnA.push({ letra: ALFABETO[letra], cantidad: diferencia });
    else if (diferencia < 0) sobranEnB.push({ letra: ALFABETO[letra], cantidad: -diferencia });
  }

  return {
    iguales: sobranEnA.length === 0 && sobranEnB.length === 0 && normA.length > 0,
    sobranEnA,
    sobranEnB,
    totalA: normA.length,
    totalB: normB.length,
    sinLetras: normA.length === 0 && normB.length === 0,
  };
}

export default function GeneradorAnagramasPage() {
  const [letters, setLetters] = useState('');
  const [minLength, setMinLength] = useState(2);
  const [maxLength, setMaxLength] = useState(10);
  const [mustContain, setMustContain] = useState('');
  const [results, setResults] = useState<string[]>([]);
  /**
   * ¿Se ha pulsado «Buscar palabras» con las letras que hay ahora en el campo?
   *
   * El veredicto «No se encontraron palabras» se pintaba con results.length === 0 y dos
   * letras en el campo, así que aparecía ANTES de buscar: bastaba teclear «amor» para que la
   * app afirmara que no hay ninguna palabra, cuando al pulsar salen 16. Y al revés: tras una
   * búsqueda, editar las letras dejaba en pantalla los resultados viejos presentados como si
   * fueran los de las letras nuevas (hallazgos 194 y 195).
   */
  const [buscado, setBuscado] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [dictStatus, setDictStatus] = useState<DictStatus>('loading');

  // Modo frase (anagramas perfectos) y modo verificador
  const [modo, setModo] = useState<Modo>('letras');
  const [frase, setFrase] = useState('');
  const [maxPalabras, setMaxPalabras] = useState(3);
  const [minLongitud, setMinLongitud] = useState(3);
  const [resultadoFrase, setResultadoFrase] = useState<ResultadoFrase | null>(null);
  const [buscandoFrase, setBuscandoFrase] = useState(false);
  const [textoA, setTextoA] = useState('');
  const [textoB, setTextoB] = useState('');
  // El índice de reparto cuesta ~87.000 normalizaciones: se construye al primer uso del modo
  // frase, no en la carga, para no penalizar al modo de letras (el más usado).
  const indiceRef = useRef<IndiceVocabulario | null>(null);

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
  /** Las letras que de verdad quedan tras descartar cifras, signos y espacios. */
  const letrasUtiles = useMemo(() => normalizarTexto(letters), [letters]);

  /**
   * Diccionario indexado por longitud, con la forma NORMALIZADA al lado de la original.
   *
   * El modo de letras comparaba contra el texto crudo del lema mientras los modos de frase y
   * de verificación normalizaban: «á» y «a» eran letras distintas solo aquí. Medido sobre el
   * diccionario, 18.230 de los 86.973 lemas (el 21 %) resultaban inalcanzables si se tecleaba
   * sin tildes —«corazon» no encontraba «corazón»— y al teclear con tilde se perdía todo lo
   * demás. Afectaba de lleno al uso que la app promociona: un atril de Scrabble o de Wordle,
   * donde nadie teclea tildes (hallazgo 197).
   */
  const wordsByLength = useMemo(() => {
    const index: { [key: number]: { original: string; normalizada: string }[] } = {};
    for (const word of dictionary) {
      const normalizada = normalizarTexto(word);
      if (!normalizada) continue;
      const len = normalizada.length;
      if (!index[len]) index[len] = [];
      index[len].push({ original: word, normalizada });
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
      // Sin tildes, igual que los otros dos modos de la app
      const normalizedLetters = normalizarTexto(letters);

      if (normalizedLetters.length < 2) {
        setResults([]);
        setBuscado(true);
        setIsSearching(false);
        return;
      }

      const found: string[] = [];
      const mustContainNorm = normalizarTexto(mustContain);

      // Iterar solo sobre las longitudes válidas para acelerar
      for (let len = minLength; len <= maxLength; len++) {
        const bucket = wordsByLength[len];
        if (!bucket) continue;

        for (const { original, normalizada } of bucket) {
          if (mustContainNorm && !normalizada.includes(mustContainNorm)) continue;
          if (canFormWord(normalizada, normalizedLetters)) {
            found.push(original);
          }
        }
      }

      found.sort((a, b) => {
        if (b.length !== a.length) return b.length - a.length;
        return a.localeCompare(b);
      });

      setResults(found);
      setBuscado(true);
      setIsSearching(false);
    }, 50);
  };

  /**
   * Los dos selectores de longitud se arrastran el uno al otro para que el rango nunca sea
   * imposible. Con mínimo 7 y máximo 5, el bucle `for (len = minLength; len <= maxLength)`
   * no itera ni una vez y la app presentaba el vacío como si el problema fueran las letras
   * del usuario, empujando además en la dirección contraria («prueba añadiendo más
   * letras») — hallazgo 266 del Inspector. Se ajusta el otro extremo en vez de avisar:
   * el usuario ha dicho lo que quiere, y no hay ninguna lectura útil de un rango vacío.
   */
  const OPCIONES_MIN = [2, 3, 4, 5, 6, 7];
  const OPCIONES_MAX = [4, 5, 6, 7, 8, 9, 10, 12, 15];

  const cambiarMinimo = (valor: number) => {
    setMinLength(valor);
    if (valor > maxLength) {
      setMaxLength(OPCIONES_MAX.find((n) => n >= valor) ?? OPCIONES_MAX[OPCIONES_MAX.length - 1]);
    }
  };

  const cambiarMaximo = (valor: number) => {
    setMaxLength(valor);
    if (valor < minLength) {
      setMinLength([...OPCIONES_MIN].reverse().find((n) => n <= valor) ?? OPCIONES_MIN[0]);
    }
  };

  const handleClear = () => {
    setLetters('');
    setMustContain('');
    setResults([]);
    setBuscado(false);
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

  // --- Modo frase: anagramas perfectos --------------------------------------------------------
  const letrasFrase = useMemo(() => normalizarTexto(frase), [frase]);

  // Las palabras del propio texto, para no devolverlo como "anagrama" de sí mismo
  const claveTrivial = useMemo(
    () => frase.split(/\s+/).map(normalizarTexto).filter(Boolean).sort().join('|'),
    [frase]
  );

  const buscarFrase = () => {
    if (letrasFrase.length < 3 || dictStatus !== 'ready') return;
    setBuscandoFrase(true);
    setResultadoFrase(null);

    setTimeout(() => {
      if (!indiceRef.current) indiceRef.current = construirIndice(dictionary);
      setResultadoFrase(
        buscarAnagramasPerfectos(
          contarLetras(letrasFrase), indiceRef.current, maxPalabras, minLongitud, claveTrivial
        )
      );
      setBuscandoFrase(false);
    }, 50);
  };

  const limpiarFrase = () => {
    setFrase('');
    setResultadoFrase(null);
  };

  const ejemplosFrase = ['salvador dali', 'roma', 'ana maria', 'el mar'];

  // --- Modo verificador -----------------------------------------------------------------------
  const comparacion = useMemo(
    () => (textoA.trim() && textoB.trim() ? compararTextos(textoA, textoB) : null),
    [textoA, textoB]
  );

  const describirSobrantes = (diferencias: DiferenciaLetras[]): string =>
    diferencias
      .map((d) => (d.cantidad > 1 ? `${d.letra.toUpperCase()} ×${d.cantidad}` : d.letra.toUpperCase()))
      .join(', ');

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
          Palabras formables con tus letras, anagramas perfectos de una frase y verificador exacto
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.modeTabs} role="group" aria-label="Modo de trabajo">
          <button
            type="button"
            className={`${styles.modeTab} ${modo === 'letras' ? styles.modeTabActive : ''}`}
            aria-pressed={modo === 'letras'}
            onClick={() => setModo('letras')}
          >
            <span aria-hidden="true">🔡</span> Palabras con mis letras
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${modo === 'frase' ? styles.modeTabActive : ''}`}
            aria-pressed={modo === 'frase'}
            onClick={() => setModo('frase')}
          >
            <span aria-hidden="true">✨</span> Anagrama perfecto de una frase
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${modo === 'verificar' ? styles.modeTabActive : ''}`}
            aria-pressed={modo === 'verificar'}
            onClick={() => setModo('verificar')}
          >
            <span aria-hidden="true">⚖️</span> Verificar dos textos
          </button>
        </div>

        {modo !== 'verificar' && dictStatus === 'loading' && (
          <div
            className={`${styles.dictStatus} ${styles.dictStatusLoading}`}
            role="status"
            aria-live="polite"
          >
            <span className={styles.dictSpinner} aria-hidden="true" />
            <span>Cargando diccionario español…</span>
          </div>
        )}
        {modo !== 'verificar' && dictStatus === 'ready' && (
          <div className={`${styles.dictStatus} ${styles.dictStatusReady}`}>
            <span aria-hidden="true">✓</span>
            <span>Diccionario cargado: {formattedDictSize} palabras del español</span>
          </div>
        )}
        {modo !== 'verificar' && dictStatus === 'error' && (
          <div
            className={`${styles.dictStatus} ${styles.dictStatusError}`}
            role="alert"
          >
            <span aria-hidden="true">⚠️</span>
            <span>No se pudo cargar el diccionario. Recarga la página para reintentar.</span>
          </div>
        )}

        {modo === 'letras' && (
        <>
        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="anagram-letters">Introduce tus letras:</label>
          <input
            id="anagram-letters"
            type="text"
            className={styles.input}
            value={letters}
            onChange={(e) => { setLetters(e.target.value); setResults([]); setBuscado(false); }}
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
                onClick={() => { setLetters(ex.letters); setResults([]); setBuscado(false); }}
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
              onChange={(e) => cambiarMinimo(Number(e.target.value))}
            >
              {OPCIONES_MIN.map(n => (
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
              onChange={(e) => cambiarMaximo(Number(e.target.value))}
            >
              {OPCIONES_MAX.map(n => (
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
              onChange={(e) => { setMustContain(e.target.value); setResults([]); setBuscado(false); }}
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
            disabled={letrasUtiles.length < 2 || isSearching || dictStatus !== 'ready'}
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
            <div className={styles.resultsHeader} role="status" aria-live="polite">
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

        {buscado && results.length === 0 && !isSearching && dictStatus === 'ready' && (
          <div className={styles.noResults}>
            <p>No se encontraron palabras con esas letras.</p>
            <p className={styles.hint}>Prueba añadiendo más letras o reduciendo los filtros.</p>
          </div>
        )}
        </>
        )}

        {modo === 'frase' && (
        <>
        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="anagram-frase">
            Frase, nombre o palabra a transformar:
          </label>
          <p className={styles.modeHint}>
            Busca combinaciones de palabras del diccionario que usen <strong>exactamente todas</strong>{' '}
            tus letras, sin sobrar ni faltar ninguna. Las tildes y los espacios se ignoran. El
            diccionario es de español, así que anagramas célebres con palabras de otros idiomas
            (como el «AVIDA DOLLARS» de Dalí) no pueden aparecer aquí.
          </p>
          <input
            id="anagram-frase"
            type="text"
            className={styles.input}
            value={frase}
            onChange={(e) => setFrase(e.target.value)}
            placeholder="Ej: Salvador Dalí"
            maxLength={28}
            autoComplete="off"
            inputMode="text"
          />
          <div className={styles.contadorLetras} aria-live="polite">
            {letrasFrase.length} letras a repartir
            {letrasFrase.length > 20 && ' — con tantas letras la búsqueda puede quedarse a medias'}
          </div>
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Probar:</span>
            {ejemplosFrase.map((ejemplo) => (
              <button
                key={ejemplo}
                className={styles.exampleBtn}
                onClick={() => setFrase(ejemplo)}
                type="button"
              >
                {ejemplo}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="anagram-max-palabras">Máximo de palabras:</label>
            <select
              id="anagram-max-palabras"
              className={styles.select}
              value={maxPalabras}
              onChange={(e) => setMaxPalabras(Number(e.target.value))}
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} palabras</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="anagram-min-longitud">Palabras de al menos:</label>
            <select
              id="anagram-min-longitud"
              className={styles.select}
              value={minLongitud}
              onChange={(e) => setMinLongitud(Number(e.target.value))}
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} letras</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button
            onClick={buscarFrase}
            className={styles.btnPrimary}
            disabled={letrasFrase.length < 3 || buscandoFrase || dictStatus !== 'ready'}
            type="button"
          >
            {buscandoFrase ? 'Repartiendo letras...' : 'Buscar anagramas perfectos'}
          </button>
          <button onClick={limpiarFrase} className={styles.btnSecondary} type="button">
            Limpiar
          </button>
        </div>

        {resultadoFrase && resultadoFrase.soluciones.length > 0 && (
          <div className={styles.resultsSection}>
            <div className={styles.resultsHeader} role="status" aria-live="polite">
              <h3>Anagramas perfectos encontrados: {resultadoFrase.soluciones.length}</h3>
            </div>

            {resultadoFrase.motivo !== 'completa' && (
              <div className={styles.avisoParcial}>
                <span aria-hidden="true">⏱️</span>
                <span>
                  {resultadoFrase.motivo === 'tope'
                    ? `Se ha parado al llegar a ${MAX_SOLUCIONES} resultados: hay más combinaciones posibles.`
                    : 'Se ha agotado el tiempo de búsqueda: puede haber más combinaciones. Prueba a subir la longitud mínima de palabra o a bajar el máximo de palabras.'}
                </span>
              </div>
            )}

            <div className={styles.solucionesGrid}>
              {resultadoFrase.soluciones.map((solucion) => (
                <div key={solucion.join('|')} className={styles.solucionCard}>
                  {solucion.map((palabra) => (
                    <span key={palabra} className={styles.solucionPalabra}>{palabra}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {resultadoFrase && resultadoFrase.soluciones.length === 0 && !buscandoFrase && (
          <div className={styles.noResults}>
            <p>No hay ninguna forma de repartir esas letras con las condiciones actuales.</p>
            <p className={styles.hint}>
              {resultadoFrase.candidatas === 0
                ? 'Ninguna palabra del diccionario cabe en esas letras. Prueba con un texto más largo o baja la longitud mínima.'
                : `Había ${resultadoFrase.candidatas.toLocaleString('es-ES')} palabras que caben en tus letras, pero ninguna combinación las consume todas. Sube el máximo de palabras o baja la longitud mínima.`}
            </p>
          </div>
        )}
        </>
        )}

        {modo === 'verificar' && (
        <>
        <div className={styles.inputSection}>
          <p className={styles.label}>Comprobar si dos textos son anagramas exactos</p>
          <p className={styles.modeHint}>
            Compara letra a letra los dos textos y, si no coinciden, dice exactamente cuáles sobran
            en cada lado. Las tildes, los espacios y los signos de puntuación se ignoran.
          </p>
          <div className={styles.verificarGrid}>
            <div className={styles.verificarCampo}>
              <label className={styles.filterLabel} htmlFor="anagram-texto-a">Texto original:</label>
              <textarea
                id="anagram-texto-a"
                className={styles.textarea}
                value={textoA}
                onChange={(e) => setTextoA(e.target.value)}
                placeholder="Ej: Salvador Dalí"
                rows={3}
                autoComplete="off"
              />
            </div>
            <div className={styles.verificarCampo}>
              <label className={styles.filterLabel} htmlFor="anagram-texto-b">Anagrama propuesto:</label>
              <textarea
                id="anagram-texto-b"
                className={styles.textarea}
                value={textoB}
                onChange={(e) => setTextoB(e.target.value)}
                placeholder="Ej: Avida Dollars"
                rows={3}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {comparacion && (
          <div
            className={`${styles.veredicto} ${
              comparacion.sinLetras
                ? styles.veredictoAviso
                : comparacion.iguales
                  ? styles.veredictoOk
                  : styles.veredictoKo
            }`}
            role="status"
            aria-live="polite"
          >
            <span className={styles.veredictoIcono} aria-hidden="true">
              {comparacion.sinLetras ? '💬' : comparacion.iguales ? '✅' : '❌'}
            </span>
            <div>
              {comparacion.sinLetras ? (
                <>
                  <strong>Todavía no hay nada que comparar.</strong>
                  <p>
                    Ninguno de los dos textos contiene letras: los anagramas se hacen con letras,
                    así que las cifras y los signos no cuentan. Escribe una palabra o una frase en
                    cada campo.
                  </p>
                </>
              ) : comparacion.iguales ? (
                <>
                  <strong>Son anagramas exactos.</strong>
                  <p>
                    Ambos textos usan las mismas {comparacion.totalA} letras, sin sobrar ni faltar
                    ninguna.
                  </p>
                </>
              ) : (
                <>
                  <strong>No son anagramas exactos.</strong>
                  <p>
                    El original tiene {comparacion.totalA} letras y la propuesta {comparacion.totalB}.
                  </p>
                  <ul className={styles.sobranList}>
                    {comparacion.sobranEnA.length > 0 && (
                      <li>
                        Sobran en el <strong>original</strong> (faltan en la propuesta):{' '}
                        {describirSobrantes(comparacion.sobranEnA)}
                      </li>
                    )}
                    {comparacion.sobranEnB.length > 0 && (
                      <li>
                        Sobran en la <strong>propuesta</strong> (no están en el original):{' '}
                        {describirSobrantes(comparacion.sobranEnB)}
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </div>

      <EducationalSection
        title="Aprende sobre Anagramas y Lingüística"
        subtitle="Historia, matemáticas combinatorias y estrategias avanzadas para juegos de palabras"
        icon="🔤"
      >
        <section>
          <h3><span aria-hidden="true">🏛️</span> Historia y Tipos de Reorganización de Letras</h3>
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
                  <td>MURCIÉLAGO (10 letras únicas)</td>
                  <td>Tipografía, diseño de teclados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">🎯</span> Casos de Uso y Aplicaciones</h3>
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
          <h3><span aria-hidden="true">❓</span> Preguntas Frecuentes sobre Anagramas</h3>
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
              <p className={styles.eduFaqAnswer}>En la edición clásica de Scrabble en español, las letras de mayor valor son: <strong>CH (5 pts), LL (8 pts), RR (8 pts), Ñ (8 pts)</strong> como fichas especiales, y entre las individuales: <strong>Z (10), J (8), X (8), Q (5), Y (4)</strong>. Ojo: la edición española <strong>no tiene fichas K ni W</strong>, así que ninguna palabra que las lleve es jugable. Las vocales solo valen 1 punto. Otras variantes (como Apalabrados) pueden usar puntuaciones distintas. La estrategia consiste en usar letras de alto valor en casillas premium (doble/triple letra o palabra).</p>
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
              <p className={styles.eduFaqAnswer}>En español, las letras acentuadas (á, é, í, ó, ú, ü) son variantes ortográficas de las vocales base, y <strong>esta herramienta las trata como tales</strong>: da igual escribir las tildes o no, porque las letras se comparan sin ellas. Tecleando <strong>arbol</strong> aparece <strong>árbol</strong>, y al revés. En Scrabble tampoco existen fichas acentuadas: las vocales del juego van sin tilde. La Ñ sí es una letra independiente del abecedario español, con su propia ficha, y aquí también se cuenta aparte de la N.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es el &quot;bingo&quot; en Scrabble?</summary>
              <p className={styles.eduFaqAnswer}>El <strong>bingo</strong> (o &quot;scrabble&quot; en versión americana) consiste en usar las 7 fichas del atril en una sola jugada. Se obtiene un bonus de <strong>+50 puntos</strong> además del valor de la palabra. Los jugadores competitivos memorizan palabras de 7 letras que contienen letras frecuentes (S, R, N, T, A, E, I) para maximizar las posibilidades de bingo.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuál es la mejor estrategia inicial en Wordle?</summary>
              <p className={styles.eduFaqAnswer}>Los análisis matemáticos (teoría de la información, entropía de Shannon) señalan palabras como <strong>CRANE, SLATE, AUDIO</strong> como primeras palabras óptimas en inglés por cubrir las letras más frecuentes. En español, palabras como <strong>ORATE, NORTE, ANTES</strong> cubren bien el espacio de letras frecuentes (A, E, R, S, T, O, N). El objetivo es maximizar la información obtenida en cada intento.</p>
            </details>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">📋</span> Cómo Sacar el Máximo Partido al Generador</h3>
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
          <h3><span aria-hidden="true">💡</span> Consejos de Estrategia para Juegos de Palabras</h3>
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
                <li><strong>Tildes</strong>: da igual escribirlas o no. Las letras se comparan sin acentos en los tres modos, así que «corazon» encuentra «corazón» y al revés.</li>
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
