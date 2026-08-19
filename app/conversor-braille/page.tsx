'use client';

import { useMemo, useState } from 'react';
import styles from './ConversorBraille.module.css';
import impresion from '@/styles/impresion.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Alfabeto Braille español (Unicode)
const textToBraille: { [key: string]: string } = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
  'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'ñ': '⠻',
  'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎',
  't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
  'y': '⠽', 'z': '⠵',
  // Vocales acentuadas español
  'á': '⠷', 'é': '⠮', 'í': '⠌', 'ó': '⠬', 'ú': '⠾',
  'ü': '⠳',
  // Números (precedidos por indicador numérico ⠼)
  '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙',
  '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊',
  // ─── Puntuación ────────────────────────────────────────────────────────────
  // Fuente: Documento Técnico B 2 de la Comisión Braille Española (ONCE),
  // «Signografía básica de las lenguas cooficiales españolas», V4 (22/01/2026), § 6.1.
  //
  // El braille español NO distingue apertura de cierre: ¿ y ? comparten celda, igual
  // que ¡ y !, y que las comillas de entrada y de salida. Antes esta tabla traía la
  // puntuación del braille INGLÉS —punto 2-5-6 e interrogación 2-3-6—, y esos 2-3-6
  // son en español las comillas, así que el punto y la interrogación de un texto
  // español real se descodificaban mal.
  ' ': '⠀',
  '.': '⠄',                                            // punto ortográfico — punto 3
  ',': '⠂',                                            // coma — punto 2
  ';': '⠆',                                            // punto y coma — puntos 2-3
  ':': '⠒',                                            // dos puntos — puntos 2-5
  '¿': '⠢', '?': '⠢',                                  // interrogación — puntos 2-6
  '¡': '⠖', '!': '⠖',                                  // exclamación — puntos 2-3-5
  '"': '⠦', '«': '⠦', '»': '⠦', '“': '⠦', '”': '⠦',    // comillas — puntos 2-3-6
  '-': '⠤',                                            // guion — puntos 3-6
  '(': '⠣', ')': '⠜',                                  // paréntesis — 1-2-6 / 3-4-5
};

/**
 * Qué carácter en tinta devuelve una celda que sirve a varios signos.
 *
 * Como el braille español abre y cierra con el mismo signo (§ 6.1 del B 2), la vuelta
 * NO puede recuperar el original: «¿Qué?» vuelve como «?Qué?». Es una propiedad del
 * sistema, no un defecto de la app, y por eso se advierte en pantalla en vez de
 * disimularla. Sin esta tabla la preferencia la decidía el orden de inserción del
 * objeto, que es un detalle de implementación.
 */
const PREFERENCIA_INVERSA: { [celda: string]: string } = {
  '⠢': '?',
  '⠖': '!',
  '⠦': '"',
};

// Invertir para Braille a texto
const brailleToText: { [key: string]: string } = {};
Object.entries(textToBraille).forEach(([text, braille]) => {
  // Los dígitos 0-9 comparten celda con las letras a-j (indicador numérico ⠼
  // aparte); en Braille → Texto priorizamos la letra y convertBrailleToText
  // la transforma a dígito si el indicador numérico está activo.
  if (/[0-9]/.test(text)) return;
  if (!brailleToText[braille] || text.length === 1) {
    brailleToText[braille] = text;
  }
});
Object.entries(PREFERENCIA_INVERSA).forEach(([celda, tinta]) => {
  brailleToText[celda] = tinta;
});

/**
 * El apóstrofo NO está en la tabla a propósito. El B 2 lo define como signo compuesto
 * y la tabla del documento no permite fijarlo con certeza, así que se trata como
 * carácter sin celda y la app lo dice, en vez de asignarle el punto 3 —que es el punto
 * ortográfico— como hacía antes.
 */

// Patrón de puntos para visualización
const brailleDots: { [key: string]: number[] } = {
  '⠁': [1], '⠃': [1,2], '⠉': [1,4], '⠙': [1,4,5], '⠑': [1,5],
  '⠋': [1,2,4], '⠛': [1,2,4,5], '⠓': [1,2,5], '⠊': [2,4], '⠚': [2,4,5],
  '⠅': [1,3], '⠇': [1,2,3], '⠍': [1,3,4], '⠝': [1,3,4,5], '⠻': [1,2,4,5,6],
  '⠕': [1,3,5], '⠏': [1,2,3,4], '⠟': [1,2,3,4,5], '⠗': [1,2,3,5], '⠎': [2,3,4],
  '⠞': [2,3,4,5], '⠥': [1,3,6], '⠧': [1,2,3,6], '⠺': [2,4,5,6], '⠭': [1,3,4,6],
  '⠽': [1,3,4,5,6], '⠵': [1,3,5,6],
  '⠷': [1,2,3,5,6], '⠮': [2,3,4,6], '⠌': [3,4], '⠬': [3,4,6], '⠾': [2,3,4,5,6],
  '⠳': [1,2,5,6],
  '⠀': [], '⠲': [2,5,6], '⠂': [2], '⠆': [2,3], '⠒': [2,5],
  '⠦': [2,3,6], '⠖': [2,3,5], '⠶': [2,3,5,6], '⠄': [3], '⠤': [3,6],
  '⠣': [1,2,6], '⠜': [3,4,5], '⠼': [3,4,5,6],
  '⠢': [2,6],
  // Los tres indicadores. Faltaban, y brailleDots[c] ?? [] devolvía una celda sin
  // ningún punto: en la hoja a escala real eso es un espacio, no un indicador.
  '⠨': [4,6],   // signo de mayúscula (B 2 § 7)
  '⠐': [5],     // prefijo de latina minúscula (B 2 § 8.2)
};

const NUMBER_INDICATOR = '⠼';   // puntos 3-4-5-6 — signo de número (B 2 § 8.1)
const CAPITAL_INDICATOR = '⠨';  // puntos 4-6 — signo de mayúscula (B 2 § 7)
/**
 * Punto 5 — «prefijo de latina minúscula» (B 2 § 8.2).
 *
 * Existe exactamente para el caso de «24h»: una minúscula de la primera serie (a-j)
 * pegada a una cifra se leería como cifra, porque comparten celda. El prefijo la
 * separa. El documento es explícito en que, si hay varias contiguas, cada una lleva
 * el suyo: «234ae» → signo de número, b, c, d, prefijo, a, prefijo, e.
 */
const LATIN_PREFIX = '⠐';

/** Las diez primeras letras minúsculas, que son las que colisionan con los dígitos. */
const PRIMERA_SERIE = /^[a-j]$/;

/**
 * Caracteres del texto que esta app no sabe escribir en braille.
 *
 * Antes se colaban dentro de la cadena braille tal cual, y en la hoja imprimible
 * desaparecían sin avisar, porque el SVG filtra todo lo que no sea U+2800-U+28FF:
 * el usuario veía una hoja coherente a la que le faltaban caracteres.
 */
const caracteresSinCelda = (texto: string): string[] => [
  ...new Set(Array.from(texto).filter((c) => !textToBraille[c.toLowerCase()])),
];

// ─────────────────────────────────────────────────────────────────────────────
// Hoja imprimible a escala real
//
// El Braille es un sistema físico: sus medidas están normalizadas en milímetros
// y una celda impresa a otro tamaño deja de ser legible al tacto y de encajar en
// una regleta. Por eso la hoja se dibuja en SVG con unidades en mm (nunca en px)
// y lleva su propia regla de calibración: el navegador escala al imprimir con
// mucha más frecuencia de lo que la gente supone.
// ─────────────────────────────────────────────────────────────────────────────

interface NormaBraille {
  id: string;
  nombre: string;
  /** Diámetro de la base del punto (mm) */
  diametroPunto: number;
  /** Distancia entre centros de dos puntos contiguos de la MISMA celda (mm) */
  entrePuntos: number;
  /** Distancia entre centros del punto 1 de dos celdas contiguas (mm) */
  entreCeldas: number;
  /** Distancia entre centros del punto 1 de dos líneas contiguas (mm) */
  entreLineas: number;
  fuente: string;
}

const NORMAS: NormaBraille[] = [
  {
    id: 'marburg',
    nombre: 'Marburg Medium',
    diametroPunto: 1.5,
    entrePuntos: 2.5,
    entreCeldas: 6.0,
    entreLineas: 10.0,
    fuente: 'Medida de referencia en Europa y la usada por la ONCE en España.',
  },
  {
    id: 'ada',
    nombre: 'ADA 703.3 (EE. UU.)',
    diametroPunto: 1.5,
    entrePuntos: 2.4,
    entreCeldas: 6.2,
    entreLineas: 10.2,
    fuente:
      'Norma de señalización estadounidense (2010 ADA Standards): celdas algo más separadas.',
  },
];

/** Ancho útil considerado para la hoja: A4 (210 mm) menos márgenes de página e interior. */
const ANCHO_UTIL_MM = 172;

/** Espejo horizontal de la celda: al escribir con punzón, la columna izquierda pasa a ser la derecha. */
const PUNTO_ESPEJO: Record<number, number> = { 1: 4, 2: 5, 3: 6, 4: 1, 5: 2, 6: 3 };

/** Posición del punto dentro de la celda: columna (0 izquierda, 1 derecha) y fila (0 arriba). */
const POSICION_PUNTO: Record<number, { columna: number; fila: number }> = {
  1: { columna: 0, fila: 0 },
  2: { columna: 0, fila: 1 },
  3: { columna: 0, fila: 2 },
  4: { columna: 1, fila: 0 },
  5: { columna: 1, fila: 1 },
  6: { columna: 1, fila: 2 },
};

export default function ConversorBraillePage() {
  const [mode, setMode] = useState<'textToBraille' | 'brailleToText'>('textToBraille');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [showVisual, setShowVisual] = useState(true);
  const [normaId, setNormaId] = useState('marburg');
  const [modoEspejo, setModoEspejo] = useState(false);
  const [mostrarGuia, setMostrarGuia] = useState(true);
  const [tituloHoja, setTituloHoja] = useState('');

  const norma = NORMAS.find((n) => n.id === normaId) ?? NORMAS[0];

  /**
   * Lo que la conversión ha dejado fuera. Se calcula sobre el texto de entrada, no
   * sobre el resultado, porque el resultado ya no contiene rastro de lo omitido.
   */
  const sinCelda = useMemo(
    () => (mode === 'textToBraille' && result ? caracteresSinCelda(input) : []),
    [mode, result, input],
  );

  /** ¿Lleva el resultado algún signo que en español abre y cierra igual? */
  const llevaSignoAmbiguo = useMemo(
    () => (mode === 'textToBraille' ? /[⠢⠖⠦]/.test(result) : false),
    [mode, result],
  );

  /**
   * Reparte el Braille en líneas del ancho de la página y calcula la posición en
   * milímetros de cada punto. En modo espejo el orden de las celdas se invierte y
   * cada celda se refleja: así se punza con la regleta por el reverso y, al dar la
   * vuelta a la hoja, el texto se lee del derecho.
   */
  const hoja = useMemo(() => {
    // Solo celdas Braille (bloque Unicode U+2800–U+28FF): un carácter sin equivalente
    // dibujaría una celda fantasma en la hoja
    const origen = (mode === 'textToBraille' ? result : input).replace(/[^⠀-⣿]/g, '');
    const celdasPorLinea = Math.max(
      8,
      Math.floor((ANCHO_UTIL_MM - norma.entrePuntos - norma.diametroPunto) / norma.entreCeldas) + 1,
    );

    // Reparto por palabras; una palabra más larga que la línea se parte
    const lineas: string[][] = [];
    let actual: string[] = [];
    const palabras = origen.split('⠀').filter((p) => p.length > 0);

    for (const palabra of palabras) {
      let restante = [...palabra];
      while (restante.length > 0) {
        const hueco = celdasPorLinea - actual.length - (actual.length > 0 ? 1 : 0);
        if (hueco <= 0) {
          lineas.push(actual);
          actual = [];
          continue;
        }
        if (actual.length > 0 && restante.length <= hueco) actual.push('⠀');
        const trozo = restante.slice(0, Math.max(1, Math.min(restante.length, hueco)));
        if (restante.length > hueco && actual.length > 0) {
          lineas.push(actual);
          actual = [];
          continue;
        }
        actual.push(...trozo);
        restante = restante.slice(trozo.length);
        if (restante.length > 0) {
          lineas.push(actual);
          actual = [];
        }
      }
    }
    if (actual.length > 0) lineas.push(actual);

    const lineasLimitadas = lineas.slice(0, 200);
    const puntos: { x: number; y: number; activo: boolean }[] = [];
    const radio = norma.diametroPunto / 2;

    lineasLimitadas.forEach((linea, indiceLinea) => {
      const celdas = modoEspejo ? [...linea].reverse() : linea;
      // En espejo la línea se alinea a la derecha: al voltear la hoja queda a la izquierda
      const desplazamiento = modoEspejo ? (celdasPorLinea - linea.length) * norma.entreCeldas : 0;

      celdas.forEach((caracter, indiceCelda) => {
        const activos = brailleDots[caracter] ?? [];
        const activosFinales = modoEspejo ? activos.map((p) => PUNTO_ESPEJO[p]) : activos;
        for (let punto = 1; punto <= 6; punto++) {
          const { columna, fila } = POSICION_PUNTO[punto];
          puntos.push({
            x:
              desplazamiento +
              indiceCelda * norma.entreCeldas +
              columna * norma.entrePuntos +
              radio,
            y: indiceLinea * norma.entreLineas + fila * norma.entrePuntos + radio,
            activo: activosFinales.includes(punto),
          });
        }
      });
    });

    const ancho = (celdasPorLinea - 1) * norma.entreCeldas + norma.entrePuntos + norma.diametroPunto;
    const alto =
      lineasLimitadas.length > 0
        ? (lineasLimitadas.length - 1) * norma.entreLineas + 2 * norma.entrePuntos + norma.diametroPunto
        : 0;

    return {
      puntos,
      radio,
      ancho: Number(ancho.toFixed(2)),
      alto: Number(alto.toFixed(2)),
      numeroLineas: lineasLimitadas.length,
      celdasPorLinea,
      recortada: lineas.length > lineasLimitadas.length,
    };
  }, [input, mode, modoEspejo, norma, result]);

  const convertTextToBraille = (text: string): string => {
    let result = '';
    /** Dentro de una expresión numérica las letras a-j se leerían como cifras. */
    let enExpresionNumerica = false;

    // Por code points, no por índices UTF-16: un emoji ocupa dos unidades y
    // recorrerlo a pares partía el carácter en dos mitades sin celda.
    for (const original of Array.from(text)) {
      const char = original.toLowerCase();

      if (/[0-9]/.test(char)) {
        if (!enExpresionNumerica) {
          result += NUMBER_INDICATOR;
          enExpresionNumerica = true;
        }
        result += textToBraille[char];
        continue;
      }

      const celda = textToBraille[char];
      if (!celda) {
        // Sin celda no se escribe nada: meter el carácter en tinta dentro de la
        // cadena braille producía una hoja a la que le faltaban caracteres en
        // silencio. Los recoge caracteresSinCelda() para avisar en pantalla.
        enExpresionNumerica = false;
        continue;
      }

      const esMayuscula = original !== char && /[A-ZÁÉÍÓÚÜÑ]/.test(original);
      if (esMayuscula) {
        // El signo de mayúscula (4-6) no es ninguna cifra, así que desambigua por
        // sí mismo: es lo que hace el B 2 § 8.5 con los números romanos.
        result += CAPITAL_INDICATOR + celda;
        enExpresionNumerica = false;
        continue;
      }

      if (enExpresionNumerica && PRIMERA_SERIE.test(char)) {
        // B 2 § 8.2. Se sigue DENTRO de la expresión numérica a propósito: «234a5»
        // es legal, y cada minúscula de la primera serie lleva su propio prefijo.
        result += LATIN_PREFIX + celda;
        continue;
      }

      enExpresionNumerica = false;
      result += celda;
    }

    return result;
  };

  const convertBrailleToText = (braille: string): string => {
    let result = '';
    let nextIsCapital = false;
    /** Puesto por el prefijo de latina: la celda siguiente es letra, no cifra. */
    let siguienteEsLatina = false;
    let enExpresionNumerica = false;

    for (const char of braille) {
      if (char === CAPITAL_INDICATOR) {
        nextIsCapital = true;
        // Una mayúscula cierra la expresión numérica: el signo 4-6 no es cifra, y
        // sin esto «Espana 3D» volvía como «Espana 34».
        enExpresionNumerica = false;
        continue;
      }

      if (char === LATIN_PREFIX) {
        // El prefijo NO cierra la expresión: solo exime a la celda siguiente.
        siguienteEsLatina = true;
        continue;
      }

      if (char === NUMBER_INDICATOR) {
        enExpresionNumerica = true;
        continue;
      }

      if (char === '⠀') { // Espacio Braille
        enExpresionNumerica = false;
        result += ' ';
        continue;
      }

      let converted = brailleToText[char] || char;

      if (enExpresionNumerica && !siguienteEsLatina && PRIMERA_SERIE.test(converted)) {
        const numMap: { [key: string]: string } = {
          'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5',
          'f': '6', 'g': '7', 'h': '8', 'i': '9', 'j': '0'
        };
        converted = numMap[converted] || converted;
      } else if (!PRIMERA_SERIE.test(converted) && converted !== ' ') {
        // Cualquier otra celda —una letra de la segunda serie, un signo— termina la
        // expresión numérica, igual que el espacio.
        enExpresionNumerica = false;
      }
      siguienteEsLatina = false;

      if (nextIsCapital) {
        converted = converted.toUpperCase();
        nextIsCapital = false;
      }

      result += converted;
    }

    return result;
  };

  const handleConvert = () => {
    if (mode === 'textToBraille') {
      setResult(convertTextToBraille(input));
    } else {
      setResult(convertBrailleToText(input));
    }
  };

  const handleSwap = () => {
    setMode(mode === 'textToBraille' ? 'brailleToText' : 'textToBraille');
    setInput(result);
    setResult('');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const renderBrailleCell = (char: string) => {
    const dots = brailleDots[char] || [];
    return (
      <div className={styles.brailleCell}>
        <div className={styles.brailleGrid} aria-hidden="true">
          {[1, 4, 2, 5, 3, 6].map((dot) => (
            <div
              key={dot}
              className={`${styles.brailleDot} ${dots.includes(dot) ? styles.filled : ''}`}
            />
          ))}
        </div>
        <span className={styles.brailleChar}>{char}</span>
      </div>
    );
  };

  // Alfabeto para referencia
  const alphabet = [
    { letter: 'A', braille: '⠁' }, { letter: 'B', braille: '⠃' },
    { letter: 'C', braille: '⠉' }, { letter: 'D', braille: '⠙' },
    { letter: 'E', braille: '⠑' }, { letter: 'F', braille: '⠋' },
    { letter: 'G', braille: '⠛' }, { letter: 'H', braille: '⠓' },
    { letter: 'I', braille: '⠊' }, { letter: 'J', braille: '⠚' },
    { letter: 'K', braille: '⠅' }, { letter: 'L', braille: '⠇' },
    { letter: 'M', braille: '⠍' }, { letter: 'N', braille: '⠝' },
    { letter: 'Ñ', braille: '⠻' }, { letter: 'O', braille: '⠕' },
    { letter: 'P', braille: '⠏' }, { letter: 'Q', braille: '⠟' },
    { letter: 'R', braille: '⠗' }, { letter: 'S', braille: '⠎' },
    { letter: 'T', braille: '⠞' }, { letter: 'U', braille: '⠥' },
    { letter: 'V', braille: '⠧' }, { letter: 'W', braille: '⠺' },
    { letter: 'X', braille: '⠭' }, { letter: 'Y', braille: '⠽' },
    { letter: 'Z', braille: '⠵' },
  ];

  const accents = [
    { letter: 'Á', braille: '⠷' }, { letter: 'É', braille: '⠮' },
    { letter: 'Í', braille: '⠌' }, { letter: 'Ó', braille: '⠬' },
    { letter: 'Ú', braille: '⠾' }, { letter: 'Ü', braille: '⠳' },
  ];

  const numbers = [
    { num: '1', braille: '⠼⠁' }, { num: '2', braille: '⠼⠃' },
    { num: '3', braille: '⠼⠉' }, { num: '4', braille: '⠼⠙' },
    { num: '5', braille: '⠼⠑' }, { num: '6', braille: '⠼⠋' },
    { num: '7', braille: '⠼⠛' }, { num: '8', braille: '⠼⠓' },
    { num: '9', braille: '⠼⠊' }, { num: '0', braille: '⠼⠚' },
  ];

  const examples = [
    { text: 'Hola', label: 'Saludo' },
    { text: 'España', label: 'Con ñ' },
    { text: 'Música', label: 'Con acento' },
    { text: '2024', label: 'Números' },
  ];

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Código Braille</h1>
        <p className={styles.subtitle}>
          Convierte texto a Braille español y viceversa con visualización interactiva
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="educational"
        severity="medium"
        collapsible={true}
        context="conversor-braille-disclaimer"
      />

      <div className={styles.mainContent}>
        <div className={styles.modeSelector}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'textToBraille' ? styles.active : ''}`}
            aria-pressed={mode === 'textToBraille'}
            onClick={() => setMode('textToBraille')}
          >
            Texto → Braille
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'brailleToText' ? styles.active : ''}`}
            aria-pressed={mode === 'brailleToText'}
            onClick={() => setMode('brailleToText')}
          >
            Braille → Texto
          </button>
        </div>

        <div className={styles.inputSection}>
          <label className={styles.label}>
            {mode === 'textToBraille' ? 'Texto a convertir:' : 'Braille a convertir:'}
          </label>
          <textarea
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'textToBraille'
              ? 'Escribe el texto aquí...'
              : 'Pega el código Braille aquí (⠁⠃⠉...)'}
            rows={4}
          />
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Ejemplos:</span>
            {examples.map((ex) => (
              <button
                key={ex.text}
                type="button"
                className={styles.exampleBtn}
                onClick={() => setInput(ex.text)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button type="button" onClick={handleConvert} className={styles.btnPrimary}>
            Convertir
          </button>
          <button type="button" onClick={handleSwap} className={styles.btnSwap} title="Intercambiar" aria-label="Intercambiar dirección de conversión">
            <span aria-hidden="true">⇄</span>
          </button>
          <button type="button" onClick={handleClear} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {result && (
          <div className={styles.resultSection}>
            <label className={styles.label}>Resultado:</label>
            <div className={styles.resultBox} role="status" aria-live="polite">
              {result}
            </div>

            {sinCelda.length > 0 && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span>{' '}
                No se ha escrito en braille {sinCelda.length === 1 ? 'este carácter' : 'estos caracteres'},
                porque el Código Braille Español no le{sinCelda.length === 1 ? '' : 's'} asigna
                celda en signografía básica:{' '}
                <strong>{sinCelda.join(' ')}</strong>. El resto del texto sí está completo.
              </p>
            )}

            {llevaSignoAmbiguo && (
              <p className={styles.avisoConversion} role="status">
                <span aria-hidden="true">ℹ️</span>{' '}
                En braille español la interrogación, la exclamación y las comillas se
                abren y se cierran con el <strong>mismo signo</strong>. Al volver a
                texto, «¿Qué?» sale como «?Qué?»: es así en el sistema, no un fallo de
                la conversión.
              </p>
            )}

            {mode === 'textToBraille' && (
              <div className={styles.visualSection}>
                <div className={styles.visualHeader}>
                  <span>Vista con celdas Braille:</span>
                  {/* El botón vive fuera del bloque que oculta: dentro, al ocultar
                      desaparecía con él y no había forma de volver a mostrar la vista */}
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    aria-expanded={showVisual}
                    onClick={() => setShowVisual(!showVisual)}
                  >
                    {showVisual ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {showVisual && (
                  <div className={styles.visualGrid}>
                    {result.split('').map((char, i) => (
                      <div key={i}>
                        {renderBrailleCell(char)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button type="button" onClick={handleCopy} className={styles.btnCopy}>
              Copiar resultado
            </button>
          </div>
        )}
      </div>

      {/* ── Hoja imprimible a escala real ───────────────────────────────── */}
      <section className={styles.hojaSection} aria-labelledby="titulo-hoja">
        <h2 id="titulo-hoja">
          <span aria-hidden="true">🖨️</span> Hoja imprimible a escala real
        </h2>
        <p className={styles.hojaIntro}>
          El Braille no es un tipo de letra: es un sistema de medidas físicas. Esta hoja dibuja el
          texto convertido con las distancias normalizadas en milímetros, de modo que cada celda
          coincide con la de una regleta y con la de un texto embosado. Sirve como plantilla para
          punzón, como material de aula y como guía para colocar pegatinas de relieve.
        </p>

        <div className={styles.hojaControles}>
          <div className={styles.hojaCampo}>
            <label className={styles.hojaEtiqueta} htmlFor="titulo-de-la-hoja">
              Título de la hoja (opcional)
            </label>
            <input
              id="titulo-de-la-hoja"
              type="text"
              className={styles.hojaInput}
              value={tituloHoja}
              onChange={(e) => setTituloHoja(e.target.value)}
              maxLength={60}
              placeholder="Ej.: Etiquetas de la cocina"
            />
          </div>

          <div className={styles.hojaCampo}>
            <span className={styles.hojaEtiqueta} id="etiqueta-norma">
              Medidas
            </span>
            <div className={styles.hojaGrupo} role="group" aria-labelledby="etiqueta-norma">
              {NORMAS.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`${styles.hojaBtn} ${normaId === n.id ? styles.hojaBtnActivo : ''}`}
                  aria-pressed={normaId === n.id}
                  onClick={() => setNormaId(n.id)}
                >
                  {n.nombre}
                </button>
              ))}
            </div>
            <span className={styles.hojaAyuda}>{norma.fuente}</span>
          </div>

          <div className={styles.hojaCampo}>
            <span className={styles.hojaEtiqueta} id="etiqueta-modo">
              Orientación
            </span>
            <div className={styles.hojaGrupo} role="group" aria-labelledby="etiqueta-modo">
              <button
                type="button"
                className={`${styles.hojaBtn} ${!modoEspejo ? styles.hojaBtnActivo : ''}`}
                aria-pressed={!modoEspejo}
                onClick={() => setModoEspejo(false)}
              >
                Lectura
              </button>
              <button
                type="button"
                className={`${styles.hojaBtn} ${modoEspejo ? styles.hojaBtnActivo : ''}`}
                aria-pressed={modoEspejo}
                onClick={() => setModoEspejo(true)}
              >
                Espejo (regleta y punzón)
              </button>
            </div>
            <span className={styles.hojaAyuda}>
              {modoEspejo
                ? 'Cada línea va de derecha a izquierda y las celdas están reflejadas: se punza por el reverso y, al dar la vuelta a la hoja, el texto se lee del derecho.'
                : 'Los puntos aparecen tal como se leen. Es la orientación para material de aula, para calcar o para pegar puntos en relieve.'}
            </span>
          </div>

          <div className={styles.hojaCampo}>
            <span className={styles.hojaEtiqueta} id="etiqueta-guia">
              Puntos vacíos
            </span>
            <div className={styles.hojaGrupo} role="group" aria-labelledby="etiqueta-guia">
              <button
                type="button"
                className={`${styles.hojaBtn} ${mostrarGuia ? styles.hojaBtnActivo : ''}`}
                aria-pressed={mostrarGuia}
                onClick={() => setMostrarGuia(true)}
              >
                Mostrar retícula
              </button>
              <button
                type="button"
                className={`${styles.hojaBtn} ${!mostrarGuia ? styles.hojaBtnActivo : ''}`}
                aria-pressed={!mostrarGuia}
                onClick={() => setMostrarGuia(false)}
              >
                Solo puntos activos
              </button>
            </div>
            <span className={styles.hojaAyuda}>
              La retícula dibuja en gris los seis puntos de cada celda. Ayuda a situar el punzón y a
              aprender la posición, pero gasta más tinta.
            </span>
          </div>
        </div>

        <div className={styles.hojaAccion}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => window.print()}
            disabled={hoja.numeroLineas === 0}
          >
            <span aria-hidden="true">🖨️</span> Imprimir la hoja
          </button>
          {hoja.numeroLineas === 0 ? (
            <span className={styles.hojaAviso} role="status">
              Convierte primero un texto: la hoja se genera con el resultado de arriba.
            </span>
          ) : (
            <span className={styles.hojaAviso} role="status">
              {hoja.numeroLineas} línea{hoja.numeroLineas === 1 ? '' : 's'} de{' '}
              {hoja.celdasPorLinea} celdas · celda de {norma.entreCeldas} mm ·{' '}
              {norma.entreLineas} mm entre líneas
              {hoja.recortada ? ' · texto recortado a 200 líneas' : ''}
            </span>
          )}
        </div>

        <div className={styles.hojaNota}>
          <p>
            <strong>Comprueba la escala antes de usarla.</strong> Los navegadores imprimen a menudo
            al 90 % o ajustan al papel sin avisar, y una celda encogida deja de encajar en la
            regleta. La hoja lleva una regla de 100 mm: mídela con una regla de verdad y, si no da
            100 mm, pon la escala de impresión al 100 % y desactiva &laquo;ajustar al área
            imprimible&raquo;.
          </p>
          <p>
            <strong>El papel corriente no da relieve.</strong> Esta hoja es una plantilla, no
            Braille legible al tacto: para eso hacen falta una embosadora, o una regleta y un punzón
            sobre papel de unos 150 g/m². Como material didáctico para videntes, en cambio, funciona
            tal cual.
          </p>
        </div>
      </section>
      </div>

      {/* Única parte que sale por la impresora (ver styles/impresion.module.css) */}
      {hoja.numeroLineas > 0 && (
        <div className={`${styles.hojaPapel} ${impresion.hoja} ${impresion.bloque}`}>
          {tituloHoja.trim() !== '' && <h3 className={styles.hojaPapelTitulo}>{tituloHoja}</h3>}

          <svg
            className={`${styles.hojaSvg} ${impresion.relleno}`}
            width={`${hoja.ancho}mm`}
            height={`${hoja.alto}mm`}
            viewBox={`0 0 ${hoja.ancho} ${hoja.alto}`}
            role="img"
            aria-label={`Hoja de ${hoja.numeroLineas} líneas en Braille a escala real, orientación ${
              modoEspejo ? 'en espejo para regleta y punzón' : 'de lectura'
            }`}
          >
            {hoja.puntos.map((punto, i) =>
              punto.activo ? (
                <circle key={i} cx={punto.x} cy={punto.y} r={hoja.radio} fill="#000000" />
              ) : mostrarGuia ? (
                <circle
                  key={i}
                  cx={punto.x}
                  cy={punto.y}
                  r={hoja.radio}
                  fill="none"
                  stroke="#bbbbbb"
                  strokeWidth={0.15}
                />
              ) : null,
            )}
          </svg>

          {/* Regla de calibración: el único modo honesto de garantizar la escala real */}
          <div className={styles.hojaRegla}>
            <svg
              className={impresion.relleno}
              width="100mm"
              height="8mm"
              viewBox="0 0 100 8"
              role="img"
              aria-label="Regla de calibración de 100 milímetros"
            >
              <line x1="0.25" y1="6" x2="99.75" y2="6" stroke="#000000" strokeWidth="0.4" />
              {Array.from({ length: 11 }, (_, i) => i * 10).map((mm) => (
                <line
                  key={mm}
                  x1={mm === 0 ? 0.25 : mm === 100 ? 99.75 : mm}
                  y1={mm % 50 === 0 ? 1 : 3}
                  x2={mm === 0 ? 0.25 : mm === 100 ? 99.75 : mm}
                  y2="6"
                  stroke="#000000"
                  strokeWidth="0.4"
                />
              ))}
            </svg>
            <span className={styles.hojaReglaTexto}>
              Esta barra debe medir exactamente 100 mm. Si no, imprime al 100 % de escala.
            </span>
          </div>
        </div>
      )}

      <div className={impresion.noImprimir}>
      <div className={styles.alphabetSection}>
        <h2>Alfabeto Braille Español</h2>

        <h3 className={styles.sectionSubtitle}>Letras</h3>
        <div className={styles.alphabetGrid}>
          {alphabet.map(({ letter, braille }) => (
            <div key={letter} className={styles.alphabetItem}>
              <span className={styles.alphabetLetter}>{letter}</span>
              <span className={styles.alphabetBraille}>{braille}</span>
              <div className={styles.miniCell}>
                {renderBrailleCell(braille)}
              </div>
            </div>
          ))}
        </div>

        <h3 className={styles.sectionSubtitle}>Vocales Acentuadas</h3>
        <div className={styles.alphabetGrid}>
          {accents.map(({ letter, braille }) => (
            <div key={letter} className={styles.alphabetItem}>
              <span className={styles.alphabetLetter}>{letter}</span>
              <span className={styles.alphabetBraille}>{braille}</span>
            </div>
          ))}
        </div>

        <h3 className={styles.sectionSubtitle}>Números (con indicador ⠼)</h3>
        <div className={styles.alphabetGrid}>
          {numbers.map(({ num, braille }) => (
            <div key={num} className={styles.alphabetItem}>
              <span className={styles.alphabetLetter}>{num}</span>
              <span className={styles.alphabetBraille}>{braille}</span>
            </div>
          ))}
        </div>
      </div>

      <EducationalSection title="Aprende sobre el Sistema Braille" subtitle="Historia, tecnología y uso real del sistema de lectoescritura táctil" defaultOpen={false}>
        <section>
          {/* CONTENIDO EXISTENTE: los 3 infoCard */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>Historia</h3>
              <p>Louis Braille, ciego desde niño, ideó un primer borrador de este sistema en 1824 (con solo 15 años) y lo publicó oficialmente en 1829. Se basa en celdas de 6 puntos que permiten 64 combinaciones.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Braille Español</h3>
              <p>El español añade caracteres especiales: la Ñ (⠻) y las vocales acentuadas (á, é, í, ó, ú) tienen símbolos propios.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Indicadores</h3>
              <p>Los números usan el indicador ⠼ antes. Las mayúsculas usan ⠨. Esto permite reutilizar los mismos símbolos de las letras.</p>
            </div>
          </div>

          {/* SECCIÓN 1: Tabla Comparativa */}
          <div className={styles.eduComparativaSection}>
            <h3>📊 Comparativa: Grados y Tipos de Braille</h3>
            <div className={styles.eduTablaWrapper}>
              <table className={styles.eduTablaComparativa}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Velocidad</th>
                    <th>Uso principal</th>
                    <th>Estándar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Braille Grado 1</strong></td>
                    <td>Letra por letra, sin contracciones</td>
                    <td>Lenta</td>
                    <td>Aprendizaje, principiantes</td>
                    <td>UEB / Nacional</td>
                  </tr>
                  <tr>
                    <td><strong>Braille Grado 2</strong></td>
                    <td>Con contracciones de palabras comunes</td>
                    <td>25-40% más rápida</td>
                    <td>Lectura diaria, libros</td>
                    <td>UEB / Nacional</td>
                  </tr>
                  <tr>
                    <td>Braille Matemático (Nemeth)</td>
                    <td>Notación matemática y científica</td>
                    <td>Especializada</td>
                    <td>Ciencias, matemáticas</td>
                    <td>Nemeth (EE.UU.)</td>
                  </tr>
                  <tr>
                    <td>Braille Musical</td>
                    <td>Notación para partituras musicales</td>
                    <td>Especializada</td>
                    <td>Música, conservatorio</td>
                    <td>Internacional MBC</td>
                  </tr>
                  <tr>
                    <td>Braille Informático</td>
                    <td>Caracteres ASCII y programación</td>
                    <td>Especializada</td>
                    <td>Código, terminal</td>
                    <td>NABCC / EE.UU.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 2: Casos de Uso */}
          <div className={styles.eduEscenariosSection}>
            <h3>🎯 El Braille en la Vida Real</h3>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>🎓</div>
                <h4>Educación Inclusiva</h4>
                <p>En España, la ONCE garantiza materiales educativos en Braille para estudiantes con discapacidad visual. Libros de texto, exámenes y apuntes se transcriben mediante embosadoras. El Braille es una herramienta de alfabetización plena, no una alternativa de segunda categoría.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>🏙️</div>
                <h4>Señalización y Entorno</h4>
                <p>El Braille aparece en la vida cotidiana: carteles de ascensores (planta, nombre), envases de medicamentos (nombre y dosis en UE es obligatorio por la Directiva 2004/27/CE), monedas de euro (el 2€ tiene el valor en Braille desde 2022) y tarjetas de visita.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>💻</div>
                <h4>Tecnología Asistiva</h4>
                <p>Las líneas Braille (refreshable Braille displays) son periféricos que traducen texto digital a Braille en tiempo real mediante celdas piezoeléctricas. Tienen 40-80 celdas y se conectan al ordenador o smartphone. Los lectores de pantalla (NVDA, JAWS, VoiceOver) las controlan para permitir el acceso completo al escritorio.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>📚</div>
                <h4>Cultura y Literatura</h4>
                <p>La Biblioteca de la ONCE gestiona la mayor colección de libros en Braille en español del mundo, con más de 50.000 títulos. Un libro de 300 páginas en tinta puede ocupar 3-5 volúmenes en Braille. Los libros en relieve se fabrican en papel especial de 150 g/m² para que los puntos mantengan el relieve durante años de uso.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.eduFaqSection}>
            <h3>❓ Preguntas Frecuentes sobre el Braille</h3>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>¿Cuántas personas en el mundo usan Braille?</h4>
                <p>La OMS estima que 285 millones de personas tienen discapacidad visual en el mundo, de las cuales 39 millones son ciegas. Sin embargo, el porcentaje que utiliza Braille ha disminuido con la proliferación de lectores de pantalla de voz: en EE.UU. se estima que solo el 10% de las personas ciegas son lectoras activas de Braille. En España, la ONCE atiende a unos 70.000 afiliados con discapacidad visual severa. Los expertos señalan que quienes aprenden Braille tienen mayor tasa de empleo y autonomía que quienes solo usan tecnología de voz.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué Louis Braille inventó el sistema con solo 15 años?</h4>
                <p>Louis Braille (1809-1852) perdió la vista a los 3 años por un accidente en el taller de su padre. Ingresó en el Institut National des Jeunes Aveugles de París, donde los libros se hacían con letras en relieve de gran tamaño (sistema Haüy), lentos e ineficientes. A los 12 años conoció el &quot;sonography&quot; del capitán Charles Barbier, un sistema militar de puntos en relieve para leer en la oscuridad. Braille adaptó ese sistema a solo 6 puntos (2×3) y a los 15 años tenía el primer borrador de su sistema, publicado oficialmente en 1829 y perfeccionado en 1837.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Es el Braille igual en todos los idiomas?</h4>
                <p>No exactamente. El sistema de 6 puntos es universal, pero cada idioma adapta los símbolos a sus necesidades. El español tiene celdas propias para ñ, á, é, í, ó, ú y ü. En cambio no tiene signos de apertura: ¿ y ? comparten el mismo signo (puntos 2-6), igual que ¡ y ! (puntos 2-3-5), de modo que la pregunta se marca al principio y al final con la misma celda. El árabe Braille va de derecha a izquierda igual que el árabe impreso. El japonés tiene un Braille basado en silabas (kana) en lugar de letras. El chino Braille tiene variantes por dialectos (mandarín, cantonés). El UEB (Unified English Braille) de 2004 unificó los distintos sistemas del inglés en un estándar global.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Qué es el Braille Unificado en Español (UEB)?</h4>
                <p>El UEB (Unified English Braille, adaptado al español como UEB-Es) es un estándar internacional que busca unificar las variantes nacionales del Braille. En España, la ONCE utiliza el &quot;Braille español&quot; que ha evolucionado de forma independiente. La transición hacia estándares más unificados facilita el intercambio de materiales entre países hispanohablantes. El Código Braille Español vigente fue aprobado por la ONCE en 2009 e incluye símbolos específicos para el castellano, catalán, gallego, euskera y valenciano.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Se puede escribir Braille con el ordenador o smartphone?</h4>
                <p>Sí, de varias formas. Las líneas Braille (displays de Braille) son periféricos USB/Bluetooth que muestran el texto del ordenador en celdas de Braille refrescables. También existen impresoras Braille (embosadoras) que producen papel en relieve. En smartphones, iOS y Android tienen soporte nativo para líneas Braille. Además, iOS permite escribir Braille directamente en la pantalla táctil activando la opción en VoiceOver, sin hardware adicional.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Cuánto tiempo tarda en aprenderse el Braille?</h4>
                <p>Una persona vidente aprende a reconocer visualmente el alfabeto Braille en pocas horas. Leer Braille táctilmente (con los dedos) requiere mucho más: típicamente 6-12 meses de práctica diaria para alcanzar una velocidad funcional (80-100 palabras por minuto). Un lector experto llega a 200 WPM táctilmente, comparable a la lectura visual normal. Los niños ciegos de nacimiento aprenden más rápido que los adultos que pierden la vista tardíamente, ya que sus yemas de los dedos son más sensibles y su cerebro más plástico.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Qué diferencia hay entre Braille Grado 1 y Grado 2?</h4>
                <p>El Grado 1 es literal: cada letra se escribe con su celda correspondiente, sin abreviaciones. El Grado 2 incluye contracciones: combinaciones de celdas que representan palabras completas o sílabas frecuentes (en inglés, &quot;the&quot; tiene una sola celda; en español, palabras como &quot;que&quot;, &quot;con&quot;, &quot;para&quot; tienen abreviaturas). El Grado 2 ocupa un 25-30% menos espacio y permite leer más rápido. Este conversor implementa Grado 1 únicamente. Para Grado 2 en español se necesitan tablas de contracciones del Código Braille Español de la ONCE.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué los números Braille usan las mismas celdas que las letras A-J?</h4>
                <p>Con solo 64 combinaciones posibles en 6 puntos, el Braille debe reutilizar símbolos con indicadores de contexto. Los números del 1 al 9 usan los mismos patrones que las letras a-i, y el 0 usa el patrón de la j. El indicador numérico (⠼, puntos 3-4-5-6) activa el &quot;modo número&quot; y le indica al lector que los símbolos siguientes son dígitos, no letras. Este sistema fue diseñado por Braille para maximizar las combinaciones disponibles en una celda de solo 6 puntos.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Guía Paso a Paso */}
          <div className={styles.eduStepSection}>
            <h3>📚 Cómo Funciona el Sistema Braille: La Lógica Interna</h3>
            <div className={styles.eduStepList}>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>1</div>
                <div className={styles.eduStepContent}>
                  <h4>La celda básica: 6 puntos, 64 combinaciones</h4>
                  <p>Una celda Braille tiene 2 columnas y 3 filas. Los puntos se numeran: columna izquierda 1-2-3 (de arriba a abajo), columna derecha 4-5-6 (de arriba a abajo). Con 6 posiciones binarias (punto presente o ausente), hay 2⁶ = 64 combinaciones posibles. La celda vacía (sin puntos) es el espacio entre palabras. Esto le da al sistema Braille la misma capacidad de representación que el ASCII de 6 bits.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>2</div>
                <div className={styles.eduStepContent}>
                  <h4>La primera década: letras A-J</h4>
                  <p>Las letras a-j usan solo los 4 puntos superiores (1, 2, 4, 5). La &quot;a&quot; es solo el punto 1. La &quot;b&quot; añade el punto 2. La &quot;c&quot; añade el 4. Cada letra añade o quita puntos de la zona superior. Esta primera década es la base de todo el sistema: los demás grupos se derivan añadiendo sistemáticamente los puntos 3 y/o 6 de la zona inferior.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>3</div>
                <div className={styles.eduStepContent}>
                  <h4>Segunda y tercera décadas: K-T y U-Z</h4>
                  <p>Las letras k-t son exactamente iguales a a-j pero con el punto 3 añadido. La &quot;k&quot; = &quot;a&quot; + punto 3. La &quot;l&quot; = &quot;b&quot; + punto 3. Las letras u-z añaden el punto 6 a las de k-t (con excepción de la &quot;w&quot;, que es especial porque el francés, idioma de Braille, no tiene &quot;w&quot;). Esta estructura sistemática facilita memorizar el alfabeto completo aprendiendo solo la primera década.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>4</div>
                <div className={styles.eduStepContent}>
                  <h4>Los indicadores de contexto</h4>
                  <p>El indicador numérico (⠼, puntos 3-4-5-6) activa el modo número: los siguientes símbolos se leen como dígitos en lugar de letras. El indicador de mayúscula (⠨, puntos 4-6) convierte la siguiente celda en mayúscula. Y cuando una letra de la primera década (a-j) va pegada a una cifra, se intercala el prefijo de latina minúscula (⠐, punto 5) para que no se lea como número: por eso «24h» se escribe ⠼⠃⠙⠐⠓ y no ⠼⠃⠙⠓, que se leería «248». Estos prefijos permiten que el sistema de 64 símbolos represente letras, números y mayúsculas sin ambigüedad.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>5</div>
                <div className={styles.eduStepContent}>
                  <h4>La lectura táctil: yemas e índices</h4>
                  <p>El Braille en papel se lee con las yemas de los dedos índice (a veces también el medio). La mano derecha lee el final de la línea mientras la izquierda ya busca el inicio de la siguiente (técnica de &quot;tracking&quot;). La sensibilidad táctil necesaria equivale a detectar relieves de solo 0,5 mm de altura. Los lectores expertos mueven los dedos de izquierda a derecha a la misma velocidad que un lector visual mueve los ojos. La lectura Braille en pantalla (este conversor) es visual y educativa, no táctil.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>6</div>
                <div className={styles.eduStepContent}>
                  <h4>Del texto digital al Braille físico</h4>
                  <p>Para producir Braille físico se necesita una embosadora (impresora Braille). Las embosadoras de sobremesa (Index, Braillo) cuestan 3.000-8.000 €. El papel especial (150 g/m²) mantiene los relieves durante años. El software de traducción (Braille2000, Duxbury DBT) convierte texto digital a Braille automáticamente, incluyendo Grado 2, tablas matemáticas y partituras. En España, la ONCE tiene un servicio gratuito de trascripción para material educativo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips */}
          <div className={styles.eduTipsSection}>
            <h3>✅ Claves para Entender y Usar el Braille</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔢</span>
                <h4>Aprende la primera década y el resto fluye</h4>
                <p>Las letras a-j son la clave de todo el sistema. Memorizar esas 10 celdas + la regla de &quot;añadir punto 3 para la segunda década&quot; te da el 90% del alfabeto casi gratis.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📐</span>
                <h4>La orientación de la celda es fija</h4>
                <p>Puntos 1-2-3 siempre en la columna izquierda de arriba a abajo, 4-5-6 en la derecha. Una celda girada 180° es un símbolo completamente diferente. La orientación del papel/línea es crítica para la lectura correcta.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>💡</span>
                <h4>Los caracteres Unicode no son táctiles</h4>
                <p>Los caracteres ⠁⠃⠉ en pantalla son representaciones visuales del Braille. Son útiles para aprendizaje y referencia, pero no activan ninguna celda táctil. Para Braille físico real se necesita hardware específico (embosadora o línea Braille).</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🏛️</span>
                <h4>La ONCE: referencia en España</h4>
                <p>La Organización Nacional de Ciegos Españoles (ONCE) es el organismo de referencia en España para todo lo relacionado con el Braille: transcripción, libros, formación y tecnología asistiva. Sus servicios de transcripción son gratuitos para material educativo.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📱</span>
                <h4>Braille en smartphones sin hardware</h4>
                <p>iOS (VoiceOver) y Android (TalkBack) permiten escribir Braille directamente en la pantalla táctil usando 6 dedos simultáneos como si fueran los 6 puntos de una celda. Esta función, llamada &quot;Braille Screen Input&quot;, no requiere ningún accesorio adicional.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🌍</span>
                <h4>El Braille sobrevive a la tecnología de voz</h4>
                <p>Los estudios muestran que las personas ciegas alfabetizadas en Braille tienen un 44% más de probabilidad de estar empleadas que las que usan solo tecnología de voz. El Braille proporciona acceso a la ortografía, puntuación y formato textual que el audio no transmite.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Limitaciones y Errores Comunes al Usar Braille Digital</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ Este conversor es visual/educativo, no táctil:</strong> Los caracteres Braille Unicode en pantalla sirven para aprender y entender el sistema, pero no son equivalentes al Braille real en papel. Para producir Braille físico funcional (que una persona ciega pueda leer con los dedos) se necesita una embosadora Braille, no copiar y pegar caracteres Unicode.</li>
              <li><strong>❌ Solo implementa Grado 1 (sin contracciones):</strong> El uso diario real del Braille utiliza el Grado 2, que incluye contracciones para palabras y sílabas frecuentes. La transcripción literal letra a letra del Grado 1 ocupa un 25-30% más de espacio. Para materiales de lectura real, un software de transcripción profesional (Duxbury DBT, Braille2000) con tablas de Grado 2 es imprescindible.</li>
              <li><strong>❌ Las reglas de puntuación Braille varían por país y normativa:</strong> El Código Braille Español (ONCE, 2009) puede diferir en detalles del sistema usado en México, Argentina u otros países hispanohablantes. La puntuación, indicadores y algunos caracteres especiales no son completamente universales entre las normas nacionales.</li>
              <li><strong>❌ Confundir &quot;leer Braille&quot; con &quot;reconocer caracteres Unicode&quot;:</strong> La habilidad real de leer Braille es táctil y requiere meses de entrenamiento. Reconocer visualmente que ⠁ es &quot;a&quot; es útil para diseñadores y educadores, pero no es leer Braille en el sentido funcional. Son circuitos cerebrales completamente distintos.</li>
              <li><strong>❌ Los números Braille necesitan el indicador ⠼:</strong> Si introduces números sin el indicador numérico, un lector Braille los interpretará como letras (1→a, 2→b, etc.). Este conversor añade automáticamente ⠼ antes de secuencias numéricas, pero al copiar Braille generado hay que asegurarse de no perder el indicador.</li>
              <li><strong>❌ No todos los caracteres especiales tienen equivalente en Braille Español:</strong> Emojis, símbolos matemáticos complejos, caracteres de otros alfabetos (cirílico, árabe, chino) no tienen representación en el Braille español estándar. Para esos contenidos existen sistemas Braille especializados (matemático, musical, informático) con sus propias tablas de conversión.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-braille')} />

      <ShareCard appName="conversor-braille" />
      <Footer appName="conversor-braille" />
      </div>
    </div>
  );
}
