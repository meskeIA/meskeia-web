'use client';

import { useMemo, useState } from 'react';
import styles from './ConversorBraille.module.css';
import impresion from '@/styles/impresion.module.css';
import TecladoBraille, { type Borrado } from './TecladoBraille';
import { puntosDeCelda } from './celdas';
import { formatNumber } from '@/lib';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';

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
  // ─── Signos auxiliares (B 2 § 6.2) ─────────────────────────────────────────
  // El apóstrofo comparte celda con el punto ortográfico (punto 3), igual que ¿ y ?
  // comparten la suya. Antes se trataba como carácter SIN celda y la app afirmaba que
  // el Código no se la asigna, que es lo contrario de lo que dice la fuente que ella
  // misma cita. Duele en catalán y valenciano —l'Hospitalet, d'Alacant—, que es justo
  // el público de un documento sobre lenguas cooficiales (Inspector, 20/08/2026).
  //
  // ⚠️ 22/09/2026 (hallazgo 1184) — aquella alta cubrió solo U+0027, el apóstrofo recto del
  // teclado, y el que llevan los textos reales es U+2019: Word, Google Docs, iOS y Android lo
  // sustituyen al escribir. Se descartaba, y encima con el aviso de que «puede que el Código
  // Braille Español sí les asigne celda fuera de la signografía básica que cubre esta app»
  // cuando la celda está en esta misma tabla — la misma forma del hallazgo del 20/08. Que era
  // descuido y no decisión se ve sin salir del fichero: dos líneas más arriba las comillas
  // tipográficas U+201C/D SÍ se normalizan, así que se contempló para la doble y no para la
  // simple. Y deja sin reparar justo el caso que aquella reparación nombraba: «l’Hospitalet».
  //
  // ⚠️ 19/10/2026 (hallazgo 3277) — el apóstrofo YA NO está en esta tabla: el § 6.2 da el punto 3
  // como apóstrofo solo «precedido y seguido de una letra», y en cualquier otro sitio el punto 3
  // es el punto ortográfico (§ 6.1). Al escribir ‘ ’ y ' siempre como punto 3, unas comillas
  // simples —‘encima’, como marca la RAE los significados— salían ⠄⠑⠝⠉⠊⠍⠁⠄, que la propia vuelta
  // de la app lee «.encima.». Lo decide `esApostrofo`, que mira las dos letras de alrededor.
};

/** Caracteres que, entre dos letras, son el apóstrofo del § 6.2 (punto 3). */
const APOSTROFOS = new Set(["'", '’']);
/** Las comillas simples, que no se escriben (ver `esApostrofo`) y tienen su propio aviso. */
const COMILLAS_SIMPLES = new Set(["'", '’', '‘']);
const CELDA_APOSTROFO = '⠄';
const ES_LETRA = /^\p{L}$/u;

/**
 * ¿Es el carácter `i` un apóstrofo? Solo ’ y ' entre dos letras («d’Alacant», «l'Hospitalet»).
 * ‘ (U+2018) nunca: abre unas comillas. Fuera de ese sitio son comillas simples, cuyo signo del
 * § 6.2 esta app no escribe: se omiten y se avisa, en vez de escribir un punto 3 que se lee punto.
 */
const esApostrofo = (caracteres: string[], i: number): boolean =>
  APOSTROFOS.has(caracteres[i]) &&
  ES_LETRA.test(caracteres[i - 1] ?? '') &&
  ES_LETRA.test(caracteres[i + 1] ?? '');

/**
 * ⚠️ 27/10/2026 (hallazgo 3553) — B 2 § 8.1, literal: «Como separador decimal se utiliza el punto
 * 2 […] independientemente de que en el original aparezca un punto o un apóstrofo», con el
 * ejemplo «73,81 73.81 73’81 → #gc,ha». La app solo daba el punto 2 a la coma: el punto entre
 * cifras salía siempre como punto 3, que dentro de un número es el de MILLAR, y el apóstrofo
 * partía el número en dos con el aviso de comillas.
 *
 * Es decimal el punto entre cifras que NO va seguido de un grupo de exactamente tres cifras (los
 * grupos de millar son de tres: «73.81» no puede ser millar, «1.234» sí), y el apóstrofo entre
 * cifras siempre. Lo que el texto en tinta no distingue —«1.234» decimal a la inglesa, o «18.56»
 * como hora, que el § 14.3 escribe de otra forma— se queda con la lectura española.
 */
const esSeparadorDecimal = (caracteres: string[], i: number): boolean => {
  const c = caracteres[i];
  const esCifra = (x: string | undefined) => x !== undefined && ES_CIFRA.test(x);
  if (!esCifra(caracteres[i - 1]) || !esCifra(caracteres[i + 1])) return false;
  if (APOSTROFOS.has(c)) return true;
  if (c !== '.') return false;
  let j = i + 1;
  while (esCifra(caracteres[j])) j++;
  return j - (i + 1) !== 3;
};

/**
 * Signos del B 2 § 6.2 que ocupan DOS celdas. Van aparte de `textToBraille` porque la
 * vuelta se resuelve mirando dos celdas seguidas, no una.
 */
const SIGNOS_COMPUESTOS: { [tinta: string]: string } = {
  '/': '⠠⠂',                                           // barra inclinada — 6, 2
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
  // El punto 3 sirve al punto ortográfico y al apóstrofo (B 2 § 6.1 y § 6.2). Vuelve
  // como PUNTO, que es incomparablemente más frecuente: al dar de alta el apóstrofo,
  // la tabla inversa se quedó con él y «hola.» volvía como «hola'».
  '⠄': '.',
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

/** Las dos celdas de un signo compuesto → el carácter en tinta que representan. */
const COMPUESTOS_INVERSO: { [celdas: string]: string } = Object.fromEntries(
  Object.entries(SIGNOS_COMPUESTOS).map(([tinta, celdas]) => [celdas, tinta]),
);


/*
 * Los puntos de cada celda que se dibuja —en la vista de celdas y en la hoja a escala real— salen
 * de su código Unicode con `puntosDeCelda` (./celdas.ts), no de una tabla.
 *
 * ⚠️ 24/10/2026 (hallazgo 3456) — salían de `brailleDots`, una tabla con las 50 celdas que la app
 * ESCRIBE, y `brailleDots[c] ?? []` dibujaba cualquier otra sin ningún punto: en la hoja, una
 * separación de palabra. Pasó tres veces: los indicadores (21/08), la ⠠ de la barra (hallazgo
 * 1183, 22/09) y, desde que una celda pegada pasa tal cual al resultado (3434, 23/10), 14 de las 64
 * celdas de seis puntos (⠈ ⠔ ⠘ ⠡ ⠩ ⠪ ⠫ ⠯ ⠰ ⠱ ⠴ ⠸ ⠹ ⠿). Con los bits del código no hay celda que
 * pueda faltar. `check:braille` exige que el dibujo siga saliendo de ahí.
 */

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
  ...new Set(
    Array.from(texto).filter(
      (c) =>
        !textToBraille[c.toLowerCase()] &&
        !SIGNOS_COMPUESTOS[c] &&
        // Las comillas simples llevan su propio aviso (`comillasSimplesOmitidas`)
        !COMILLAS_SIMPLES.has(c) &&
        // «…» se escribe como tres puntos (hallazgo 3418)
        c !== '…' &&
        // Una celda braille ya es braille: pasa tal cual (hallazgo 3434)
        !ES_CELDA_BRAILLE.test(c) &&
        // El salto de línea y los demás blancos sí se escriben: son separación de palabra
        !/\s/.test(c),
    ),
  ),
];

/**
 * ⚠️ 22/10/2026 (hallazgo 3416) — el espacio duro (U+00A0: el de casi cualquier texto copiado de
 * una web, y el del «15 %» del formato de meskeIA), el espacio fino (U+202F) y el tabulador no
 * estaban en la tabla y se DESCARTABAN, y con ellos la separación de palabra: «hola mundo» salía
 * como una sola palabra de nueve celdas, y «10 000» con ⠼ de más delante del segundo grupo y sin
 * nada que lo separase. Es el defecto del salto de línea (21/08/2026) con otro carácter. Cualquier
 * blanco que no sea salto de línea se escribe como el espacio normal: separación de palabra ⠀.
 */
const aEspacioNormal = (c: string): string =>
  c !== ' ' && c !== '\n' && c !== '\r' && /\s/.test(c) ? ' ' : c;

/**
 * ⚠️ 23/10/2026 (hallazgo 3440) — pero `\s` incluye también U+FEFF, el espacio de ancho cero NO
 * separable, que además es la marca de orden de bytes con la que empiezan algunos textos. No se ve
 * ni separa palabras, así que no puede salir como separación de palabra ⠀: se retira del texto
 * antes de convertir, sin aviso, porque no se pierde nada que el lector pudiera ver.
 */
const ANCHO_CERO_NO_SEPARABLE = /﻿/g;

/** Una celda del bloque braille de Unicode (U+2800-U+28FF), espacio braille incluido. */
const ES_CELDA_BRAILLE = /^[⠀-⣿]$/;

/**
 * ⚠️ 22/10/2026 (hallazgo 3418) — «...» (tres puntos del teclado) salía ⠄⠄⠄ y «…» (U+2026, el que
 * ponen Word, Google Docs e iOS al escribir tres puntos) se descartaba con el aviso de signo sin
 * celda: el mismo signo en tinta daba dos resultados según cómo se tecleara. Es la forma del 1184
 * (’ frente a '). «…» se escribe como los tres puntos. Qué celdas da el B 2 § 6.1 a los puntos
 * suspensivos sigue sin anclar (cabo C0238): esto solo hace que las dos grafías den lo mismo.
 */
const PUNTOS_SUSPENSIVOS_TECLADO = '...';

const ES_CIFRA = /^[0-9]$/;

/**
 * ⚠️ 27/10/2026 (hallazgo 3526) — B 2 § 8.1, literal: «Cuando se escriban números formados por más
 * de tres cifras con algún tipo de separación, debe utilizarse el punto 3 como separador de los
 * grupos de tres dígitos», con el ejemplo «501.439.678 · 501 439 678 → #eja.dci.fgh». Un blanco
 * entre grupos de tres cifras (la forma que recomienda la RAE, y la del formato de meskeIA con
 * espacio duro) partía el número en dos y repetía el ⠼: «10 000» salía ⠼⠁⠚⠀⠼⠚⠚⠚.
 *
 * La excepción del mismo apartado: los teléfonos «se transcriben sin espacios en blanco»
 * (999 999 999 → #iiiiiiiii). Desde el texto en tinta un teléfono y una cantidad de nueve cifras
 * tienen la misma forma, así que se toma por teléfono el de nueve cifras en grupos de tres que
 * empieza por 6, 7, 8 o 9 (los números de teléfono de España) y la app lo dice en un aviso, con
 * la forma de escribirlo si era una cantidad.
 *
 * ⚠️ 27/10/2026 (hallazgo 3552) — esa regla solo reconocía los nueve dígitos en grupos de tres, y
 * todo lo demás caía en la de millar: el ejemplo literal del mismo apartado, «+49 900 000 000 →
 * +#di#ijjjjjjjj», salía como la CANTIDAD 49.900.000.000. Ahora también son teléfono:
 * - los que llevan prefijo internacional con + («+49 900 000 000», «+34 600 123 456»): el prefijo
 *   es un número y el resto otro, con su propio signo de número y sin blancos (§ 8.1);
 * - el prefijo con guion delante de un teléfono de los de abajo («49-900 000 000 → #di#ijjjjjjjj»):
 *   el guion no se escribe;
 * - los nueve dígitos en grupos 2-3-2-2 o 3-2-2-2 que empiezan por 6-9 («91 123 45 67»), que no
 *   pueden ser una cantidad: los grupos de millar son de tres.
 * El + (235, § 12) no lo escribe la app: se omite con su aviso. Y «647.234.345», con puntos, se
 * queda como cantidad —con puntos es como se escribe una en español—, con un aviso de que podría
 * ser un teléfono (`posiblesTelefonos`).
 *
 * Devuelve las posiciones de los blancos que son separador de millar, las de los blancos y guiones
 * que se quitan por ser de un teléfono, las de los que separan el prefijo (se quitan y el resto
 * lleva otra vez el signo de número), y los teléfonos tal como venían en el texto.
 */
interface CifrasEnTinta {
  millar: Set<number>;
  telefono: Set<number>;
  reabrir: Set<number>;
  telefonos: string[];
}

/** Formas de un teléfono de España en tinta: longitudes de sus grupos de cifras. */
const FORMAS_TELEFONO = ['3,3,3', '2,3,2,2', '3,2,2,2'];

const blancosEntreCifras = (caracteres: string[]): CifrasEnTinta => {
  const millar = new Set<number>();
  const telefono = new Set<number>();
  const reabrir = new Set<number>();
  const telefonos: string[] = [];
  const esCifra = (c: string | undefined) => c !== undefined && ES_CIFRA.test(c);
  let i = 0;
  while (i < caracteres.length) {
    const conMas = caracteres[i] === '+' && esCifra(caracteres[i + 1]) && !esCifra(caracteres[i - 1]);
    if (!conMas && (!esCifra(caracteres[i]) || esCifra(caracteres[i - 1]))) {
      i++;
      continue;
    }
    // Grupos de cifras separados por UN blanco o UN guion
    const grupos: Array<{ desde: number; hasta: number }> = [];
    const separadores: number[] = [];
    let j = conMas ? i + 1 : i;
    for (;;) {
      let fin = j;
      while (esCifra(caracteres[fin])) fin++;
      grupos.push({ desde: j, hasta: fin });
      if ((caracteres[fin] === ' ' || caracteres[fin] === '-') && esCifra(caracteres[fin + 1])) {
        separadores.push(fin);
        j = fin + 1;
      } else break;
    }
    const longitudes = grupos.map((g) => g.hasta - g.desde);
    /** ¿Los grupos desde `k` son un teléfono de España, separados solo por blancos? */
    const esNacional = (k: number, todoJunto: boolean): boolean =>
      k < grupos.length &&
      separadores.slice(k).every((p) => caracteres[p] === ' ') &&
      (FORMAS_TELEFONO.includes(longitudes.slice(k).join(',')) ||
        (todoJunto && longitudes.length - k === 1 && longitudes[k] === 9)) &&
      /^[6-9]$/.test(caracteres[grupos[k].desde]);
    const cifrasDesde = (k: number) => longitudes.slice(k).reduce((a, b) => a + b, 0);

    let prefijo: boolean;
    let esTelefono: boolean;
    if (conMas) {
      prefijo = grupos.length >= 2 && longitudes[0] <= 3 && cifrasDesde(1) >= 7;
      esTelefono = prefijo;
    } else if (grupos.length >= 2 && longitudes[0] <= 3 && caracteres[separadores[0]] === '-' && esNacional(1, true)) {
      prefijo = true;
      esTelefono = true;
    } else {
      prefijo = false;
      esTelefono = esNacional(0, false);
    }

    if (esTelefono) {
      separadores.forEach((p, k) => (prefijo && k === 0 ? reabrir : telefono).add(p));
      telefonos.push(caracteres.slice(i, grupos[grupos.length - 1].hasta).join(''));
      i = grupos[grupos.length - 1].hasta;
      continue;
    }
    // Millar: blancos tras un primer grupo de hasta tres cifras, delante de grupos de tres
    let k = 1;
    while (longitudes[0] <= 3 && k < grupos.length && caracteres[separadores[k - 1]] === ' ' && longitudes[k] === 3) {
      millar.add(separadores[k - 1]);
      k++;
    }
    i = Math.max(grupos[k - 1].hasta, i + 1);
  }
  return { millar, telefono, reabrir, telefonos: [...new Set(telefonos)] };
};

/** Normalización común de la entrada de «Texto → Braille» (la usan la conversión y los avisos). */
const normalizarTinta = (texto: string): string[] =>
  Array.from(texto.replace(ANCHO_CERO_NO_SEPARABLE, '').replace(/…/g, PUNTOS_SUSPENSIVOS_TECLADO)).map(
    aEspacioNormal,
  );

/** Teléfonos que se han escrito sin blancos ni guiones (§ 8.1), tal como venían en el texto. */
const telefonosDelTexto = (texto: string): string[] => blancosEntreCifras(normalizarTinta(texto)).telefonos;

/**
 * Cantidades con puntos de millar que tienen la forma de un teléfono de España (hallazgo 3552):
 * «647.234.345». Se escriben como cantidad y se avisa de que, si es un teléfono, el § 8.1 lo
 * escribe sin puntos («647.234.345 → #fdgbcdcde»).
 */
const posiblesTelefonos = (texto: string): string[] => [
  ...new Set(normalizarTinta(texto).join('').match(/(?<![\d.,+])[6-9]\d{2}\.\d{3}\.\d{3}(?![\d]|[.,]\d)/g) ?? []),
];

/**
 * ⚠️ 27/10/2026 (hallazgo 3525) — signos a los que el B 2 da celda en la propia signografía
 * básica y que esta app aún no escribe. El aviso genérico decía que «puede que el Código Braille
 * Español sí le asigne celda fuera de la signografía básica que cubre esta app», y la signografía
 * básica ES el B 2. Citas literales del Inspector (26/10/2026): § 13 «456-15 € euro», § 12
 * «456-356 % tanto por ciento», § 6.2 «36-36 — raya de diálogo», «12356 [ abrir corchete»,
 * «23456 ] cerrar corchete», «35 * asterisco». No se escriben (eso es ampliar la tabla, decisión
 * del usuario): se avisa con la verdad. El resto de signos sin celda en la app siguen con el aviso
 * genérico, que ya no afirma dónde está su celda.
 *
 * ⚠️ 27/10/2026 (hallazgo 3556) — aquella alta cubrió solo los seis signos citados en el 3525, y los
 * demás de las mismas tablas seguían con el «puede que» genérico. Celdas según el Inspector
 * (27/10/2026): § 6.2 { 5-123, } 456-2, \ 5-3, | 456-0d · § 12 + 235, = 2356, @ 5, & 6-12346 ·
 * § 12.1 § 346 · § 13 $ 456-234, £ 5-2346, ¥ 456-13456 · § 14.1 ° 356. Tampoco se escriben.
 */
const SIGNOS_DEL_B2_SIN_ESCRIBIR = new Set([
  '€', '%', '—', '[', ']', '*',
  '{', '}', '\\', '|', '+', '=', '@', '&', '§', '$', '£', '¥', '°',
]);

/**
 * ⚠️ 27/10/2026 (hallazgo 3528) — celdas de ocho puntos (U+2840-U+28FF, puntos 7 u 8). Pasan tal
 * cual al resultado (hallazgo 3434), pero la vista y la hoja son rejillas de seis: ⡀ salía como una
 * celda en blanco y ⡁ (puntos 1 y 7) se punzaba como ⠁, la «a». Se avisa en los dos sentidos.
 */
const ES_CELDA_OCHO_PUNTOS = /^[⡀-⣿]$/;

/**
 * ⚠️ 27/10/2026 (hallazgo 3529) — B 2 § 7.2: el texto en mayúsculas como cambio tipográfico
 * («El incumplimiento de estas NORMAS es...») se escribe en minúscula entre los signos de escritura
 * especial del § 9.1 (35), y no como una sigla (§ 7.1, ⠨ delante de cada letra, que es lo que hace
 * la app). Desde la tinta no se distingue una sigla de un énfasis: la app sigue escribiendo la
 * sigla y avisa de las palabras de cuatro o más mayúsculas, que es donde la duda es razonable.
 */
/**
 * ⚠️ 27/10/2026 (hallazgo 3554) — B 2 § 7.1, literal: «no debe escribirse este signo de punto
 * después de cada una de las letras que forman la sigla, aunque aparezca así en el original», con
 * el ejemplo «O.N.U. → {o{n{u». La app escribía cada punto como punto 3. Son puntos de sigla los
 * que siguen a cada mayúscula de una serie de dos o más mayúsculas sueltas con punto («O.N.U.»,
 * «U.E.»); una abreviatura como «EE. UU.» o una inicial suelta («J. Pérez») no lo son.
 */
const puntosDeSigla = (caracteres: string[]): Set<number> => {
  const puntos = new Set<number>();
  const esMayuscula = (c: string | undefined) => c !== undefined && /^\p{Lu}$/u.test(c);
  for (let i = 0; i < caracteres.length; i++) {
    if (!esMayuscula(caracteres[i]) || ES_LETRA.test(caracteres[i - 1] ?? '') || caracteres[i - 1] === '.') continue;
    const serie: number[] = [];
    let j = i;
    while (esMayuscula(caracteres[j]) && caracteres[j + 1] === '.') {
      serie.push(j + 1);
      j += 2;
    }
    // «A.B.C» sin el último punto también es sigla; «O.N.Uno», no
    const tras = caracteres[j] ?? '';
    const cierra = !ES_LETRA.test(tras) || (esMayuscula(tras) && !ES_LETRA.test(caracteres[j + 1] ?? ''));
    if (serie.length >= 2 && cierra) serie.forEach((p) => puntos.add(p));
    i = Math.max(i, j - 1);
  }
  return puntos;
};

const palabrasEnMayusculas = (texto: string): string[] => [
  ...new Set((texto.match(/(?<!\p{L})\p{Lu}{4,}(?!\p{L})/gu) ?? []).filter((p) => !esNumeroRomano(p))),
];

/**
 * ⚠️ 27/10/2026 (hallazgo 3555) — B 2 § 8.5, literal: «bastará con utilizar el prefijo de mayúscula
 * 46 solamente al comienzo del número», con el ejemplo «M VIII → {m {viii». La app ponía ⠨ delante
 * de cada letra, y el aviso del 3529 llamaba «sigla» a «XVIII». Ahora un número romano bien formado
 * de dos o más letras lleva un solo ⠨ y tiene su propio aviso. Quedan fuera las siglas y palabras
 * corrientes que también son romanos bien formados («CV», «CD», «MI»…): desde la tinta no se
 * distinguen, y ahí la lectura más probable es la sigla. Una sigla que la app tome por romano se
 * escribe letra a letra poniéndole puntos («C.V.», § 7.1).
 */
const ROMANO = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const ROMANOS_QUE_SUELEN_SER_OTRA_COSA = new Set([
  'MI', 'DI', 'LI', 'CI', 'CD', 'CV', 'DC', 'XL', 'CC', 'CL', 'CM', 'DL', 'MD', 'MC', 'MIL', 'MIX', 'DIV',
]);

const esNumeroRomano = (palabra: string): boolean =>
  palabra.length >= 2 && ROMANO.test(palabra) && !ROMANOS_QUE_SUELEN_SER_OTRA_COSA.has(palabra);

/** Posiciones de las letras de un número romano que van sin ⠨ (todas menos la primera), y los romanos. */
const numerosRomanos = (caracteres: string[]): { sinMayuscula: Set<number>; romanos: string[] } => {
  const sinMayuscula = new Set<number>();
  const romanos: string[] = [];
  let i = 0;
  while (i < caracteres.length) {
    if (!ES_LETRA.test(caracteres[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j < caracteres.length && ES_LETRA.test(caracteres[j])) j++;
    const palabra = caracteres.slice(i, j).join('');
    if (esNumeroRomano(palabra)) {
      for (let k = i + 1; k < j; k++) sinMayuscula.add(k);
      romanos.push(palabra);
    }
    i = j;
  }
  return { sinMayuscula, romanos: [...new Set(romanos)] };
};

/**
 * ⚠️ 27/10/2026 (hallazgo 3530) — B 2 § 5.1 (catalán y valenciano): é = 123456 y ó = 246, mientras
 * la ⠮ (2346) y la ⠬ (346) que la app escribe para la é y la ó del castellano son, en catalán, la è
 * y la ò. Con un texto catalán la app escribía «és» con la é castellana, que un lector catalán lee
 * «ès», sin decirlo. No se cambia la celda (la app no sabe en qué lengua está cada palabra): se
 * nombran la é y la ó en el aviso de las letras catalanas.
 */
const VOCALES_AGUDAS_CATALANAS = new Set(['é', 'ó']);

/**
 * Letras propias del catalán y el valenciano que esta app aún no escribe (hallazgo 3415,
 * 22/10/2026). El aviso genérico decía que «puede que el Código Braille Español sí les asigne
 * celda fuera de la signografía básica que cubre esta app», y la FAQ dice que la app sigue el
 * B 2, «Signografía básica de las lenguas cooficiales españolas»: una letra de una lengua
 * cooficial está, por el título del documento, DENTRO de esa signografía. No se les inventa
 * celda (sale del documento, no de memoria): llevan su propio aviso, que dice la verdad.
 */
const LETRAS_COOFICIALES_SIN_ESCRIBIR = new Set(['à', 'è', 'ò', 'ï', 'ç', '·']);

const esLetraCooficialSinEscribir = (c: string): boolean =>
  LETRAS_COOFICIALES_SIN_ESCRIBIR.has(c.toLowerCase());

/** ¿Hay en el texto alguna comilla simple que no sea un apóstrofo entre dos letras? */
const comillasSimplesOmitidas = (texto: string): boolean => {
  const caracteres = Array.from(texto);
  return caracteres.some(
    (c, i) => COMILLAS_SIMPLES.has(c) && !esApostrofo(caracteres, i) && !esSeparadorDecimal(caracteres, i),
  );
};

/**
 * Cómo nombrar en el aviso un carácter que no se ve.
 *
 * El aviso existe para que el usuario sepa QUÉ se ha perdido, y con un carácter de
 * control dejaba un <strong> vacío y una frase que no decía nada (Inspector, 20/08/2026).
 */
const NOMBRE_VISIBLE: { [caracter: string]: string } = {
  // El tabulador y el espacio duro ya no llegan aqu\u00ed: se escriben como separaci\u00f3n de palabra
  // (hallazgo 3416). Quedan los invisibles que no son blancos para JavaScript.
  '\u200b': 'espacio de ancho cero',
  '\u00ad': 'guion de corte invisible',
};

const nombraCaracter = (c: string): string =>
  NOMBRE_VISIBLE[c] ?? (c.trim() === '' ? 'espacio en blanco' : c);

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

/**
 * Una medida de la norma en formato español (hallazgo 3439): `{norma.entreCeldas}` pintaba el
 * número de JavaScript, y con ADA salía «6.2 mm». Las enteras van sin decimales («6 mm»).
 */
const milimetros = (valor: number): string =>
  formatNumber(valor, Number.isInteger(valor) ? 0 : 1);

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
  /**
   * Convertir dio una cadena vacía con algo escrito en la caja (hallazgo 3434). Los avisos viven
   * dentro de la caja de resultado, que no se pinta sin resultado: sin esto, una caja de puros
   * caracteres sin celda (emojis, por ejemplo) no daba ni resultado ni aviso.
   */
  const [conversionVacia, setConversionVacia] = useState(false);

  const norma = NORMAS.find((n) => n.id === normaId) ?? NORMAS[0];

  /**
   * Lo que la conversión ha dejado fuera. Se calcula sobre el texto de entrada, no
   * sobre el resultado, porque el resultado ya no contiene rastro de lo omitido.
   */
  const omitidos = useMemo(
    () => (mode === 'textToBraille' && result ? caracteresSinCelda(input) : []),
    [mode, result, input],
  );
  /** Lo que no tiene celda en esta app y de lo que no consta celda en la signografía básica. */
  const sinCelda = omitidos.filter(
    (c) => !esLetraCooficialSinEscribir(c) && !SIGNOS_DEL_B2_SIN_ESCRIBIR.has(c),
  );
  /** Signos a los que el B 2 da celda y esta app aún no escribe (hallazgo 3525). */
  const signosDelB2 = omitidos.filter((c) => SIGNOS_DEL_B2_SIN_ESCRIBIR.has(c));
  /** Letras del catalán y el valenciano que el B 2 recoge y esta app aún no escribe. */
  const cooficialesOmitidas = omitidos.filter(esLetraCooficialSinEscribir);
  /** En un texto catalán, la é y la ó escritas con la celda del castellano (hallazgo 3530). */
  const agudasCatalanas =
    cooficialesOmitidas.length > 0
      ? [...new Set(Array.from(input.toLowerCase()).filter((c) => VOCALES_AGUDAS_CATALANAS.has(c)))]
      : [];
  /** Teléfonos escritos sin blancos (§ 8.1, hallazgo 3526). */
  const telefonos = mode === 'textToBraille' && result ? telefonosDelTexto(input) : [];
  /** Cantidades con puntos que tienen forma de teléfono (§ 8.1, hallazgo 3552). */
  const telefonosDudosos = mode === 'textToBraille' && result ? posiblesTelefonos(input) : [];
  /** Palabras en mayúsculas escritas como sigla, que podrían ser un énfasis (§ 7.2, hallazgo 3529). */
  const mayusculas = mode === 'textToBraille' && result ? palabrasEnMayusculas(input) : [];
  /** Números romanos escritos con un solo signo de mayúscula (§ 8.5, hallazgo 3555). */
  const romanosEscritos = mode === 'textToBraille' && result ? numerosRomanos(normalizarTinta(input)).romanos : [];
  /** Celdas de ocho puntos que la vista y la hoja no pueden dibujar enteras (hallazgo 3528). */
  const celdasOchoPuntos = result
    ? [
        ...new Set(
          Array.from(mode === 'textToBraille' ? result : input).filter((c) => ES_CELDA_OCHO_PUNTOS.test(c)),
        ),
      ]
    : [];

  const omiteComillasSimples = useMemo(
    () => mode === 'textToBraille' && result !== '' && comillasSimplesOmitidas(input),
    [mode, result, input],
  );

  /**
   * Celdas braille que esta app no sabe traducir a texto.
   *
   * En «Texto → Braille» la app avisaba de lo que no podía escribir, pero en la
   * dirección contraria una celda desconocida se colaba tal cual en la salida y nadie
   * lo advertía: el resultado dejaba de ser texto en español en silencio
   * (Inspector, 20/08/2026).
   */
  const celdasSinTexto = useMemo(() => {
    if (mode !== 'brailleToText' || !result) return [];
    const conocidas = new Set([CAPITAL_INDICATOR, LATIN_PREFIX, NUMBER_INDICATOR, '⠀']);
    /**
     * ⚠️ 19/10/2026 (hallazgo 3279) — antes se descartaba de antemano TODA celda que apareciera en
     * un signo compuesto, lo formara o no. ⠠ suelta no tiene equivalente (solo existe como primera
     * mitad de la barra ⠠⠂) y pasaba al texto sin aviso; y es el signo de mayúscula del braille
     * INGLÉS, así que la trae cualquier texto copiado de un traductor en inglés. Ahora una celda
     * solo se da por buena como parte de un compuesto cuando lo forma de verdad, leyendo de
     * izquierda a derecha igual que `convertBrailleToText`.
     */
    const celdas = Array.from(input);
    const formanCompuesto = new Set<number>();
    for (let i = 0; i < celdas.length - 1; i++) {
      if (COMPUESTOS_INVERSO[celdas[i] + celdas[i + 1]]) {
        formanCompuesto.add(i);
        formanCompuesto.add(i + 1);
        i++;
      }
    }
    return [
      ...new Set(
        celdas.filter(
          (c, i) =>
            /[\u2800-\u28FF]/.test(c) &&
            !conocidas.has(c) &&
            !formanCompuesto.has(i) &&
            !brailleToText[c],
        ),
      ),
    ];
  }, [mode, result, input]);

  /**
   * ¿La entrada de «Braille → Texto» no trae NI UNA celda braille? (hallazgo 1187)
   *
   * ⚠️ 22/09/2026 — `convertBrailleToText` hace `brailleToText[char] || char`, así que lo que no
   * reconoce lo copia tal cual. Para una celda braille desconocida eso quedó resuelto el
   * 21/08/2026 —pasa al resultado y la app lo dice—, pero `celdasSinTexto` filtra por el rango
   * Unicode del bloque braille, de modo que un texto en TINTA, que no tiene ni un carácter de
   * ese bloque, salía entero al cuadro de resultado con el aspecto de una conversión que había
   * ido bien.
   *
   * Es el error de manejo más probable de esta app: llegar, pegar y pulsar Convertir sin
   * reparar en que el selector está en el otro sentido. Y era el único caso en que devolvía algo
   * que PARECE una traducción y no lo es, mientras los otros tres modos de fallo sí avisan.
   */
  const entradaSinCeldas = useMemo(
    () =>
      mode === 'brailleToText' &&
      input.trim() !== '' &&
      !/[\u2800-\u28FF]/.test(input),
    [mode, input],
  );

  /**
   * ⚠️ 22/10/2026 (hallazgo 3417) — la otra mitad del 1187: la entrada trae celdas Y tinta. Pasa
   * con el teclado de seis puntos en cuanto la caja conserva el «Hola» del otro sentido: «Hola⠁»
   * volvía como «Holaa» sin aviso, y la hoja (que punza la entrada filtrada al bloque braille)
   * solo ⠁. Los caracteres en tinta se nombran: han pasado tal cual y no salen en la hoja.
   */
  const tintaEnBraille = useMemo(
    () =>
      mode === 'brailleToText' && result !== '' && !entradaSinCeldas
        ? [...new Set(Array.from(input).filter((c) => !/[⠀-⣿]/.test(c) && !/\s/.test(c)))]
        : [],
    [mode, result, input, entradaSinCeldas],
  );

  /** ¿Traía la caja de «Texto → Braille» celdas braille, que han pasado tal cual? (hallazgo 3434) */
  const celdasYaBraille = useMemo(
    () => mode === 'textToBraille' && result !== '' && /[⠀-⣿]/.test(input),
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
        const activos = puntosDeCelda(caracter);
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
    const caracteres = normalizarTinta(text);
    const blancos = blancosEntreCifras(caracteres);
    const sinPuntoDeSigla = puntosDeSigla(caracteres);
    const romanos = numerosRomanos(caracteres);

    for (let i = 0; i < caracteres.length; i++) {
      const original = caracteres[i];
      const char = original.toLowerCase();

      // B 2 § 8.1 (hallazgo 3526): el blanco entre grupos de tres cifras es el punto 3 de millar y
      // no cierra el número; en un teléfono, no se escribe.
      if (blancos.millar.has(i)) {
        result += textToBraille['.'];
        continue;
      }
      if (blancos.telefono.has(i)) continue;
      // Hallazgo 3552: tras el prefijo de un teléfono, el resto es otro número con su ⠼
      if (blancos.reabrir.has(i)) {
        enExpresionNumerica = false;
        continue;
      }
      // B 2 § 7.1 (hallazgo 3554): los puntos de una sigla no se escriben
      if (sinPuntoDeSigla.has(i)) continue;

      if (/[0-9]/.test(char)) {
        if (!enExpresionNumerica) {
          result += NUMBER_INDICATOR;
          enExpresionNumerica = true;
        }
        result += textToBraille[char];
        continue;
      }

      // B 2 § 8.1: el signo de número cubre el número ENTERO. El punto 2 es el
      // separador decimal y el punto 3 el de los grupos de tres dígitos, y ninguno
      // de los dos repite el prefijo. Antes cerraban la expresión, así que «501.439»
      // salía con un ⠼ de más delante de cada grupo (Inspector, 20/08/2026).
      // B 2 § 8.1 (hallazgo 3553): el punto decimal y el apóstrofo decimal son el punto 2.
      if (enExpresionNumerica && esSeparadorDecimal(caracteres, i)) {
        result += textToBraille[','];
        continue;
      }

      if (enExpresionNumerica && (char === ',' || char === '.')) {
        const siguiente = caracteres[i + 1];
        if (siguiente && /[0-9]/.test(siguiente)) {
          result += textToBraille[char];
          continue;
        }
        /**
         * ⚠️ 22/09/2026 (hallazgo 1186) — cuando el punto o la coma NO van seguidos de cifra, la
         * expresión se cerraba aquí y la letra siguiente salía sin el prefijo de latina minúscula
         * (punto 5, B 2 § 8.2). Para el lector no hay nada que le diga que la expresión terminó:
         * el punto 3 dentro de un número es el separador de MILLARES (§ 8.1), así que sigue en
         * modo número y lee la celda siguiente como la cifra 2. La demostración no necesita
         * fuente externa: la función inversa de esta misma app devolvía «3.2» de lo que ella
         * acababa de escribir para «3.b», y en cambio leía bien la versión con el prefijo.
         *
         * La expresión numérica se mantiene ABIERTA, y así la rama de la primera serie de más
         * abajo pone el prefijo donde hace falta —«3.b», «art. 2.a»—. Una letra de la segunda
         * mitad del alfabeto no colisiona con ningún dígito y sigue cerrándola sin prefijo, y un
         * espacio o cualquier otro signo también.
         */
        result += textToBraille[char];
        continue;
      }

      // Un salto de línea no tiene celda, pero tampoco puede desaparecer: sin
      // separación, «sal» y «pimienta» en dos líneas salían pegadas y la hoja
      // imprimible las punzaba como una sola palabra de 11 celdas.
      if (char === '\n' || char === '\r') {
        if (!result.endsWith('⠀')) result += '⠀';
        enExpresionNumerica = false;
        continue;
      }

      const compuesto = SIGNOS_COMPUESTOS[original];
      if (compuesto) {
        result += compuesto;
        enExpresionNumerica = false;
        continue;
      }

      /**
       * ⚠️ 23/10/2026 (hallazgo 3434) — una celda braille en la caja (escrita con el teclado de seis
       * puntos y traída al cambiar de sentido, o pegada) no estaba en la tabla de tinta y se
       * descartaba: Convertir no daba resultado ni aviso, y con tinta al lado el aviso decía que la
       * app «no escribe en braille» ⠓ · ⠕… Ya es braille: pasa tal cual y `celdasYaBraille` lo dice.
       */
      if (ES_CELDA_BRAILLE.test(original)) {
        result += original;
        enExpresionNumerica = false;
        continue;
      }

      // Hallazgo 3277: el apóstrofo solo entre dos letras; las comillas simples se omiten
      // (las nombra el aviso de `comillasSimplesOmitidas`).
      if (COMILLAS_SIMPLES.has(original)) {
        if (esApostrofo(caracteres, i)) result += CELDA_APOSTROFO;
        enExpresionNumerica = false;
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
        // sí mismo: es lo que hace el B 2 § 8.5 con los números romanos, que lo
        // llevan solo delante de la primera letra (hallazgo 3555).
        result += (romanos.sinMayuscula.has(i) ? '' : CAPITAL_INDICATOR) + celda;
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

    const celdas = Array.from(braille);

    for (let i = 0; i < celdas.length; i++) {
      const char = celdas[i];

      // Signos de dos celdas (B 2 § 6.2): se resuelven antes que la celda suelta,
      // porque «⠠⠂» es una barra inclinada y no un punto 6 seguido de una coma.
      const compuesto = COMPUESTOS_INVERSO[char + (celdas[i + 1] ?? '')];
      if (compuesto) {
        result += compuesto;
        enExpresionNumerica = false;
        i++;
        continue;
      }

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

      // B 2 § 8.1: dentro de un número, el punto 2 es la coma decimal y el punto 3 el
      // separador de millares, y NINGUNO cierra la expresión. Antes la cerraban, así
      // que «73,81» volvía como «73,ha» y «501.439.678» como «501.dci.fgh».
      if (enExpresionNumerica && (char === '⠂' || char === '⠄')) {
        const siguiente = celdas[i + 1];
        if (siguiente && brailleToText[siguiente] && PRIMERA_SERIE.test(brailleToText[siguiente])) {
          result += char === '⠂' ? ',' : '.';
          siguienteEsLatina = false;
          continue;
        }
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

  const convertir = (texto: string): string =>
    mode === 'textToBraille' ? convertTextToBraille(texto) : convertBrailleToText(texto);

  const handleConvert = () => {
    const salida = convertir(input);
    setResult(salida);
    setConversionVacia(salida === '' && input.trim() !== '');
  };

  /**
   * ⚠️ 19/10/2026 (hallazgo 3278) — la conversión solo corre al pulsar «Convertir», pero los
   * avisos se recalculan con la entrada ACTUAL. Al corregir el texto o cambiar de sentido sin
   * volver a convertir, el resultado y la hoja imprimible seguían siendo los del texto anterior
   * mientras el aviso hablaba del nuevo («El resto del texto sí está completo»). Quien punza la
   * hoja no lee braille y no podía verlo. Cualquier cambio de entrada o de sentido retira el
   * resultado: lo que queda en pantalla corresponde siempre a lo que hay en la caja.
   */
  const cambiarEntrada = (texto: string) => {
    setInput(texto);
    setResult('');
    setConversionVacia(false);
  };

  /**
   * ⚠️ 23/10/2026 (hallazgo 3435) — los ejemplos ponían «Hola», «España»… también en «Braille →
   * Texto», donde eso es tinta: el ejemplo de la propia app acababa en el aviso «Lo que has pegado
   * no contiene ninguna celda braille». En ese sentido el ejemplo llega ya escrito en braille.
   */
  const ponerEjemplo = (texto: string) => {
    cambiarEntrada(mode === 'brailleToText' ? convertTextToBraille(texto) : texto);
  };

  /**
   * Celdas que llegan del teclado de seis puntos (S0219). Al contrario que al teclear en la caja,
   * aquí el resultado se recalcula en el acto: quien copia un cartel celda a celda quiere ver la
   * lectura crecer. Sigue valiendo la regla del hallazgo 3278 —el resultado corresponde siempre a
   * lo que hay en la caja—, porque se calcula con la entrada NUEVA.
   */
  const anadirCelda = (celda: string) => {
    const nuevo = input + celda;
    setInput(nuevo);
    setResult(convertBrailleToText(nuevo));
    setConversionVacia(false);
  };

  /** Devuelve qué celda quitó y cuántas quedan, para que el teclado lo anuncie (hallazgo 3420). */
  const borrarCelda = (): Borrado => {
    const celdas = Array.from(input);
    if (celdas.length === 0) return { borrada: null, quedan: 0 };
    const nuevo = celdas.slice(0, -1).join('');
    setInput(nuevo);
    setResult(nuevo ? convertBrailleToText(nuevo) : '');
    setConversionVacia(false);
    return { borrada: celdas[celdas.length - 1], quedan: celdas.length - 1 };
  };

  const cambiarModo = (nuevo: 'textToBraille' | 'brailleToText') => {
    if (nuevo === mode) return;
    setMode(nuevo);
    setResult('');
    setConversionVacia(false);
  };

  /**
   * ⚠️ 23/10/2026 (hallazgo 3436) — ⇄ ponía en la caja el RESULTADO, y desde el hallazgo 3278
   * cualquier cambio de la entrada lo retira: escribir un texto y pulsar ⇄ sin Convertir cambiaba
   * de sentido y dejaba la caja vacía. Ahora, si no hay resultado, se convierte en el acto lo que
   * hay en la caja y es eso lo que pasa al otro sentido.
   */
  const handleSwap = () => {
    const salida = result !== '' ? result : input.trim() !== '' ? convertir(input) : '';
    setMode(mode === 'textToBraille' ? 'brailleToText' : 'textToBraille');
    setInput(salida);
    setResult('');
    setConversionVacia(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
    setConversionVacia(false);
  };

  const renderBrailleCell = (char: string) => {
    const dots = puntosDeCelda(char);
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
            onClick={() => cambiarModo('textToBraille')}
          >
            Texto → Braille
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'brailleToText' ? styles.active : ''}`}
            aria-pressed={mode === 'brailleToText'}
            onClick={() => cambiarModo('brailleToText')}
          >
            Braille → Texto
          </button>
        </div>

        <div className={styles.inputSection}>
          {/* Con htmlFor: sin él la caja tomaba por nombre su placeholder, que se va al escribir (hallazgo 3438) */}
          <label className={styles.label} htmlFor="entrada-conversor">
            {mode === 'textToBraille' ? 'Texto a convertir:' : 'Braille a convertir:'}
          </label>
          <textarea
            id="entrada-conversor"
            className={styles.textarea}
            value={input}
            onChange={(e) => cambiarEntrada(e.target.value)}
            placeholder={mode === 'textToBraille'
              ? 'Escribe el texto aquí...'
              : 'Pega el código Braille aquí (⠁⠃⠉...) o escríbelo con el teclado de seis puntos'}
            rows={4}
          />
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Ejemplos:</span>
            {examples.map((ex) => (
              <button
                key={ex.text}
                type="button"
                className={styles.exampleBtn}
                onClick={() => ponerEjemplo(ex.text)}
              >
                {ex.label}
              </button>
            ))}
          </div>
          {mode === 'brailleToText' && (
            <TecladoBraille onCelda={anadirCelda} onBorrar={borrarCelda} />
          )}
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

        {conversionVacia && (
          <p className={styles.avisoConversion} role="alert">
            <span aria-hidden="true">⚠️</span>{' '}
            {/* Cada rama en su <span key>: con la página traducida no cae (check:ternario-traducido) */}
            {mode === 'textToBraille' && caracteresSinCelda(input).length > 0 ? (
              <span key="sin-celda">
                La conversión no ha dado ningún resultado: esta herramienta no escribe en braille
                nada de lo que hay en la caja (
                <strong>{caracteresSinCelda(input).map(nombraCaracter).join(' · ')}</strong>).
              </span>
            ) : (
              <span key="nada">
                La conversión no ha dado ningún resultado: en la caja no hay nada que se pueda
                escribir con esta herramienta.
              </span>
            )}
          </p>
        )}

        {result && (
          <div className={styles.resultSection}>
            {/* No es un control: rótulo de la región, no <label> (hallazgo 3438) */}
            <span className={styles.label} id="etiqueta-resultado">Resultado:</span>
            <div className={styles.resultBox} role="status" aria-live="polite" aria-labelledby="etiqueta-resultado">
              {result}
            </div>

            {/* En estos avisos, la parte que cambia con el número va en su propio <span> como texto
                único: con la página traducida, un texto suelto entre otros se quedaba con el valor
                anterior (la forma del hallazgo 3527) */}
            {sinCelda.length > 0 && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span>{' '}
                <span>
                  {sinCelda.length === 1
                    ? 'Esta herramienta no escribe en braille este carácter:'
                    : 'Esta herramienta no escribe en braille estos caracteres:'}
                </span>{' '}
                <strong>{sinCelda.map(nombraCaracter).join(' · ')}</strong>. El resto del texto
                sí está completo.{' '}
                {/* Hallazgo 3459: concuerda con «este carácter / estos caracteres». Hallazgo 3525: ya
                    no dice que la celda estaría «fuera de la signografía básica», que es el B 2. */}
                <span>
                  {sinCelda.length === 1
                    ? 'Puede que el Código Braille Español sí le asigne celda: esta app no la escribe.'
                    : 'Puede que el Código Braille Español sí les asigne celda: esta app no la escribe.'}
                </span>
              </p>
            )}

            {signosDelB2.length > 0 && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span>{' '}
                <span>
                  {signosDelB2.length === 1
                    ? 'Esta herramienta aún no escribe en braille este signo, y no está en el resultado:'
                    : 'Esta herramienta aún no escribe en braille estos signos, y no están en el resultado:'}
                </span>{' '}
                <strong>{signosDelB2.join(' · ')}</strong>.{' '}
                <span>
                  {signosDelB2.length === 1
                    ? 'La signografía básica del Código Braille Español (Documento Técnico B 2) sí le da celda: un texto braille completo lo llevaría.'
                    : 'La signografía básica del Código Braille Español (Documento Técnico B 2) sí les da celda: un texto braille completo los llevaría.'}
                </span>
              </p>
            )}

            {cooficialesOmitidas.length > 0 && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span>{' '}
                <span>
                  {cooficialesOmitidas.length === 1
                    ? 'Esta herramienta aún no escribe en braille esta letra del catalán y el valenciano:'
                    : 'Esta herramienta aún no escribe en braille estas letras del catalán y el valenciano:'}
                </span>{' '}
                <strong>{cooficialesOmitidas.join(' · ')}</strong>,{' '}
                <span>
                  {cooficialesOmitidas.length === 1 ? 'y no está en el resultado.' : 'y no están en el resultado.'}
                </span>{' '}
                El Documento Técnico B 2 que sigue esta app recoge las lenguas cooficiales, pero
                por ahora solo escribe las letras del castellano.
              </p>
            )}

            {agudasCatalanas.length > 0 && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span>{' '}
                En catalán y valenciano la é y la ó tienen otra celda (B 2 § 5.1): esta app las ha
                escrito con la del castellano, que un lector catalán lee como è y ò:{' '}
                <strong>{agudasCatalanas.join(' · ')}</strong>.
              </p>
            )}

            {telefonos.length > 0 && (
              <p className={styles.avisoConversion} role="status">
                <span aria-hidden="true">ℹ️</span>{' '}
                <strong>{telefonos.join(' · ')}</strong>{' '}
                <span>
                  {telefonos.length === 1
                    ? 'se ha escrito como un número de teléfono, sin blancos ni guiones y con el prefijo, si lo hay, como un número aparte (B 2 § 8.1). Si era una cantidad, escríbela con puntos de millar (999.999.999) y saldrá con el punto 3 entre los grupos.'
                    : 'se han escrito como números de teléfono, sin blancos ni guiones y con el prefijo, si lo hay, como un número aparte (B 2 § 8.1). Si eran cantidades, escríbelas con puntos de millar (999.999.999) y saldrán con el punto 3 entre los grupos.'}
                </span>
              </p>
            )}

            {telefonosDudosos.length > 0 && (
              <p className={styles.avisoConversion} role="status">
                <span aria-hidden="true">ℹ️</span>{' '}
                <strong>{telefonosDudosos.join(' · ')}</strong>{' '}
                <span>
                  {telefonosDudosos.length === 1
                    ? 'se ha escrito como una cantidad, con el punto 3 entre los grupos (B 2 § 8.1). Si es un número de teléfono, el B 2 lo escribe sin puntos: escríbelo con blancos (999 999 999) o todo junto.'
                    : 'se han escrito como cantidades, con el punto 3 entre los grupos (B 2 § 8.1). Si son números de teléfono, el B 2 los escribe sin puntos: escríbelos con blancos (999 999 999) o todo junto.'}
                </span>
              </p>
            )}

            {mayusculas.length > 0 && (
              <p className={styles.avisoConversion} role="status">
                <span aria-hidden="true">ℹ️</span>{' '}
                <strong>{mayusculas.join(' · ')}</strong>{' '}
                <span>
                  {mayusculas.length === 1
                    ? 'se ha escrito como una sigla, con el signo de mayúscula delante de cada letra (B 2 § 7.1). Si las mayúsculas marcan énfasis y no una sigla, el B 2 § 7.2 la escribe en minúscula entre los signos de escritura especial del § 9.1 (⠔ al abrir y al cerrar), que esta app no pone.'
                    : 'se han escrito como siglas, con el signo de mayúscula delante de cada letra (B 2 § 7.1). Si las mayúsculas marcan énfasis y no una sigla, el B 2 § 7.2 las escribe en minúscula entre los signos de escritura especial del § 9.1 (⠔ al abrir y al cerrar), que esta app no pone.'}
                </span>
              </p>
            )}

            {romanosEscritos.length > 0 && (
              <p className={styles.avisoConversion} role="status">
                <span aria-hidden="true">ℹ️</span>{' '}
                <strong>{romanosEscritos.join(' · ')}</strong>{' '}
                <span>
                  {romanosEscritos.length === 1
                    ? 'se ha escrito como un número romano, con el signo de mayúscula solo delante de la primera letra (B 2 § 8.5). Si es una sigla, escríbela con un punto tras cada letra y saldrá con el signo delante de cada una (§ 7.1).'
                    : 'se han escrito como números romanos, con el signo de mayúscula solo delante de la primera letra (B 2 § 8.5). Si alguno es una sigla, escríbela con un punto tras cada letra y saldrá con el signo delante de cada una (§ 7.1).'}
                </span>
              </p>
            )}

            {celdasOchoPuntos.length > 0 && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span>{' '}
                <span>
                  {celdasOchoPuntos.length === 1
                    ? 'Esta celda es de braille de ocho puntos (lleva el punto 7 o el 8):'
                    : 'Estas celdas son de braille de ocho puntos (llevan el punto 7 o el 8):'}
                </span>{' '}
                <strong>{celdasOchoPuntos.join(' ')}</strong>.{' '}
                La vista de celdas y la hoja imprimible solo tienen seis puntos y no dibujan el 7
                ni el 8: en la hoja, una celda así puede punzarse como otra o quedar en blanco.
              </p>
            )}

            {omiteComillasSimples && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span> Las <strong>comillas simples</strong> (‘ ’)
                no se han escrito. El punto 3 solo es apóstrofo entre dos letras
                («d’Alacant»); al principio o al final de una palabra se lee como punto. El
                Código Braille Español les da un signo propio que esta app no escribe.
              </p>
            )}

            {entradaSinCeldas && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span> Lo que has pegado no contiene ninguna celda
                braille, así que ha salido tal cual: esto no es una traducción. Si querías pasar
                un texto a braille, cambia el sentido de la conversión ahí arriba.
              </p>
            )}

            {tintaEnBraille.length > 0 && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span>{' '}
                La caja mezcla celdas braille con texto en tinta:{' '}
                <strong>{tintaEnBraille.join(' · ')}</strong>{' '}
                {/* La parte que cambia con el número, en su propio <span> y como texto único: un
                    texto suelto entre otros se quedaba con el valor anterior en la página
                    traducida (hallazgo 3527) */}
                <span>
                  {tintaEnBraille.length === 1
                    ? 'ha pasado al resultado tal cual, sin traducir, y no sale en la hoja imprimible.'
                    : 'han pasado al resultado tal cual, sin traducir, y no salen en la hoja imprimible.'}
                </span>{' '}
                Si vas a escribir con el teclado de seis puntos, vacía antes la caja con «Limpiar».
              </p>
            )}

            {celdasSinTexto.length > 0 && (
              <p className={styles.avisoConversion} role="alert">
                <span aria-hidden="true">⚠️</span>{' '}
                <span>
                  {celdasSinTexto.length === 1
                    ? 'Esta celda no tiene equivalente en la signografía básica que cubre esta app y ha pasado al resultado sin traducir:'
                    : 'Estas celdas no tienen equivalente en la signografía básica que cubre esta app y han pasado al resultado sin traducir:'}
                </span>{' '}
                <strong>{celdasSinTexto.join(' ')}</strong>.
              </p>
            )}

            {celdasYaBraille && (
              <p className={styles.avisoConversion} role="status">
                <span aria-hidden="true">ℹ️</span> La caja ya traía{' '}
                <strong>celdas braille</strong>: han pasado al resultado tal cual, sin convertir.
                Si querías leerlas en texto, cambia el sentido a «Braille → Texto».
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
          {/* Cada rama con su key y el rótulo como texto único: con la página traducida, el
              <span> reutilizado y sus trece textos sueltos tumbaban la app al vaciarse la hoja
              (hallazgo 3524) o se quedaban con las medidas anteriores (hallazgo 3527) */}
          {hoja.numeroLineas === 0 ? (
            <span key="hoja-vacia" className={styles.hojaAviso} role="status">
              Convierte primero un texto: la hoja se genera con el resultado de arriba.
            </span>
          ) : (
            <span key="hoja-medidas" className={styles.hojaAviso} role="status">
              {`${hoja.numeroLineas} línea${hoja.numeroLineas === 1 ? '' : 's'} de ${hoja.celdasPorLinea} celdas · celda de ${milimetros(norma.entreCeldas)} mm · ${milimetros(norma.entreLineas)} mm entre líneas${hoja.recortada ? ' · texto recortado a 200 líneas' : ''}`}
            </span>
          )}
        </div>

        <div className={styles.hojaNota}>
          <p>
            <strong>Comprueba la escala antes de usarla.</strong> Los navegadores imprimen a menudo
            al 90&nbsp;% o ajustan al papel sin avisar, y una celda encogida deja de encajar en la
            regleta. La hoja lleva una regla de 100 mm: mídela con una regla de verdad y, si no da
            100 mm, pon la escala de impresión al 100&nbsp;% y desactiva &laquo;ajustar al área
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
            aria-label={`Hoja de ${hoja.numeroLineas} ${hoja.numeroLineas === 1 ? 'línea' : 'líneas'} en Braille a escala real, orientación ${
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
              Esta barra debe medir exactamente 100 mm. Si no, imprime al 100&nbsp;% de escala.
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
            <h3><span aria-hidden="true">📊</span> Comparativa: Grados y Tipos de Braille</h3>
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
                    {/* Hallazgo 3458: «25-40 % más rápida» sin fuente ni año (regla 1 de neutralidad). */}
                    <td>Más rápida (menos celdas por palabra)</td>
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
            <h3><span aria-hidden="true">🎯</span> El Braille en la Vida Real</h3>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">🎓</div>
                <h4>Educación Inclusiva</h4>
                <p>En España, la ONCE garantiza materiales educativos en Braille para estudiantes con discapacidad visual. Libros de texto, exámenes y apuntes se transcriben mediante embosadoras. El Braille es una herramienta de alfabetización plena, no una alternativa de segunda categoría.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">🏙️</div>
                <h4>Señalización y Entorno</h4>
                <p>El Braille aparece en la vida cotidiana: carteles de ascensores (planta, nombre), envases de medicamentos (nombre y dosis en UE es obligatorio por la Directiva 2004/27/CE), monedas de euro (el 2&nbsp;€ tiene el valor en Braille desde 2022) y tarjetas de visita.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">💻</div>
                <h4>Tecnología Asistiva</h4>
                <p>Las líneas Braille (refreshable Braille displays) son periféricos que traducen texto digital a Braille en tiempo real mediante celdas piezoeléctricas. Tienen 40-80 celdas y se conectan al ordenador o smartphone. Los lectores de pantalla (NVDA, JAWS, VoiceOver) las controlan para permitir el acceso completo al escritorio.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">📚</div>
                <h4>Cultura y Literatura</h4>
                {/* Hallazgo 3458: «la mayor colección… del mundo, con más de 50.000 títulos», sin fuente ni año. */}
                <p>La ONCE mantiene en España un fondo bibliográfico en Braille y transcribe libros bajo demanda. Un libro de 300 páginas en tinta puede ocupar 3-5 volúmenes en Braille. Los libros en relieve se fabrican en papel especial de 150 g/m² para que los puntos mantengan el relieve durante años de uso.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.eduFaqSection}>
            <h3><span aria-hidden="true">❓</span> Preguntas Frecuentes sobre el Braille</h3>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>¿Cuántas personas en el mundo usan Braille?</h4>
                <p>La OMS estimó que en 2010 había 285 millones de personas con discapacidad visual en el mundo, de las cuales 39 millones eran ciegas (estimaciones publicadas en 2012). Sin embargo, el porcentaje que utiliza Braille ha disminuido con la proliferación de lectores de pantalla de voz: en EE.&nbsp;UU., un informe de la Federación Nacional de Ciegos de 2009 estimaba que menos del 10&nbsp;% de las personas legalmente ciegas leían Braille. En España, la ONCE es la organización que agrupa a las personas con ceguera o deficiencia visual grave que se afilian a ella.</p>
                {/* Hallazgo 3457 (cabo C0389): se retiran «unos 70.000 afiliados» y «Los expertos
                    señalan… mayor tasa de empleo», sin año, fuente ni quién (regla 1 de neutralidad;
                    la idea del empleo ya la retiró el 3441 por lo mismo). */}
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué Louis Braille inventó el sistema con solo 15 años?</h4>
                <p>Louis Braille (1809-1852) perdió la vista a los 3 años por un accidente en el taller de su padre. Ingresó en el Institut National des Jeunes Aveugles de París, donde los libros se hacían con letras en relieve de gran tamaño (sistema Haüy), lentos e ineficientes. A los 12 años conoció el &quot;sonography&quot; del capitán Charles Barbier, un sistema militar de puntos en relieve para leer en la oscuridad. Braille adaptó ese sistema a solo 6 puntos (2×3) y a los 15 años tenía el primer borrador de su sistema, publicado oficialmente en 1829 y perfeccionado en 1837.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Es el Braille igual en todos los idiomas?</h4>
                <p>No exactamente. El sistema de 6 puntos es universal, pero cada idioma adapta los símbolos a sus necesidades. El español tiene celdas propias para ñ, á, é, í, ó, ú y ü. En cambio no tiene signos de apertura: ¿ y ? comparten el mismo signo (puntos 2-6), igual que ¡ y ! (puntos 2-3-5), de modo que la pregunta se marca al principio y al final con la misma celda. El árabe Braille va de derecha a izquierda igual que el árabe impreso. El japonés tiene un Braille basado en sílabas (kana) en lugar de letras. El chino Braille tiene variantes por dialectos (mandarín, cantonés). El UEB (Unified English Braille) de 2004 unificó los distintos sistemas del inglés en un estándar global.</p>
              </div>
              {/*
                ⚠️ 22/09/2026 (hallazgo 1185) — esta pregunta se titulaba «¿Qué es el Braille
                Unificado en Español (UEB)?» y respondía que el UEB «es un estándar internacional
                adaptado al español como UEB-Es», contradiciendo a la respuesta INMEDIATAMENTE
                ANTERIOR, que dice bien que el UEB de 2004 unificó los sistemas DEL INGLÉS. Dos
                párrafos seguidos afirmaban que el UEB es del inglés y que es un estándar
                internacional adaptado al español.

                Pesa más de lo normal aquí porque la diferencia entre el braille español y el
                inglés ES la promesa de la app —su metadata, su JSON-LD y su h1 la venden por
                eso—, y porque una FAQPage es la señal que ChatGPT, Perplexity y Bing Copilot
                usan para fundamentar respuestas.

                Ni «Braille Unificado en Español» ni la sigla «UEB-Es» aparecen en la fuente
                oficial: la página de la Comisión Braille Española (ONCE), consultada el
                22/09/2026, no nombra ningún estándar así. Tampoco he podido anclar el «aprobado
                por la ONCE en 2009», que además convivía sin explicación con el documento que
                esta app cita en su propio código. Las dos afirmaciones se retiran en vez de
                reescribirse: lo que no se puede sostener no se sustituye por otra versión, se
                quita. Queda la pregunta por lo que la app SÍ puede fundamentar, que es
                precisamente su fuente.
              */}
              <div className={styles.eduFaqItem}>
                <h4>¿Quién fija el Braille español y en qué se diferencia del inglés?</h4>
                <p>La <strong>Comisión Braille Española</strong> (CBE), órgano de la ONCE, es la
                máxima autoridad en España para la normativa del braille: aprueba las signografías
                oficiales y publica los documentos técnicos que las recogen. Esta app sigue el
                <strong> Documento Técnico B 2</strong>, «Signografía básica de las lenguas
                cooficiales españolas» (V4, 22/01/2026), que cubre castellano, catalán, gallego,
                euskera y valenciano, y escribe por ahora las letras del castellano: las propias
                del catalán y el valenciano (à, è, ò, ï, ç y el punto volado de «l·l») todavía no,
                y al convertir lo avisa. La diferencia con el braille inglés no es de matiz: en
                español la interrogación son los puntos 2-6 y las comillas los 2-3-6, mientras en
                inglés esos mismos 2-3-6 son la interrogación, así que un texto convertido con las
                tablas inglesas cambia de signos de puntuación sin avisar. El UEB, que unificó los
                sistemas del inglés en 2004, no se aplica al español.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Se puede escribir Braille con el ordenador o smartphone?</h4>
                <p>Sí, de varias formas. Las líneas Braille (displays de Braille) son periféricos USB/Bluetooth que muestran el texto del ordenador en celdas de Braille refrescables. También existen impresoras Braille (embosadoras) que producen papel en relieve. En smartphones, iOS y Android tienen soporte nativo para líneas Braille. Además, iOS permite escribir Braille directamente en la pantalla táctil activando la opción en VoiceOver, sin hardware adicional.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Cuánto tiempo tarda en aprenderse el Braille?</h4>
                <p>Una persona vidente aprende a reconocer visualmente el alfabeto Braille en pocas horas. Leer Braille táctilmente (con los dedos) requiere mucho más: meses de práctica regular para alcanzar una velocidad funcional, y el ritmo varía mucho de una persona a otra. Los niños ciegos de nacimiento aprenden más rápido que los adultos que pierden la vista tardíamente, ya que sus yemas de los dedos son más sensibles y su cerebro más plástico.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Qué diferencia hay entre Braille Grado 1 y Grado 2?</h4>
                <p>El Grado 1 es literal: cada letra se escribe con su celda correspondiente, sin abreviaciones. El Grado 2 incluye contracciones: combinaciones de celdas que representan palabras completas o sílabas frecuentes (en inglés, &quot;the&quot; tiene una sola celda; en español, palabras como &quot;que&quot;, &quot;con&quot;, &quot;para&quot; tienen abreviaturas). El Grado 2 ocupa menos espacio y permite leer más rápido. Este conversor implementa Grado 1 únicamente. Para Grado 2 en español se necesitan tablas de contracciones del Código Braille Español de la ONCE.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué los números Braille usan las mismas celdas que las letras A-J?</h4>
                <p>Con solo 64 combinaciones posibles en 6 puntos, el Braille debe reutilizar símbolos con indicadores de contexto. Los números del 1 al 9 usan los mismos patrones que las letras a-i, y el 0 usa el patrón de la j. El indicador numérico (⠼, puntos 3-4-5-6) activa el &quot;modo número&quot; y le indica al lector que los símbolos siguientes son dígitos, no letras. Este sistema fue diseñado por Braille para maximizar las combinaciones disponibles en una celda de solo 6 puntos.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Guía Paso a Paso */}
          <div className={styles.eduStepSection}>
            <h3><span aria-hidden="true">📚</span> Cómo Funciona el Sistema Braille: La Lógica Interna</h3>
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
                  <p>Para producir Braille físico se necesita una embosadora (impresora Braille). Las embosadoras de sobremesa (Index, Braillo) cuestan bastante más que una impresora de tinta. El papel especial (150 g/m²) mantiene los relieves durante años. El software de traducción (Braille2000, Duxbury DBT) convierte texto digital a Braille automáticamente, incluyendo Grado 2, tablas matemáticas y partituras. En España, la ONCE tiene un servicio gratuito de trascripción para material educativo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips */}
          <div className={styles.eduTipsSection}>
            <h3><span aria-hidden="true">✅</span> Claves para Entender y Usar el Braille</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🔢</span>
                <h4>Aprende la primera década y el resto fluye</h4>
                <p>Las letras a-j son la clave de todo el sistema. Memorizar esas 10 celdas + la regla de &quot;añadir punto 3 para la segunda década&quot; te da 20 de las 27 letras del alfabeto (el 74&nbsp;%) casi gratis.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">📐</span>
                <h4>La orientación de la celda es fija</h4>
                <p>Puntos 1-2-3 siempre en la columna izquierda de arriba a abajo, 4-5-6 en la derecha. Una celda girada 180° es un símbolo completamente diferente. La orientación del papel/línea es crítica para la lectura correcta.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">💡</span>
                <h4>Los caracteres Unicode no son táctiles</h4>
                <p>Los caracteres ⠁⠃⠉ en pantalla son representaciones visuales del Braille. Son útiles para aprendizaje y referencia, pero no activan ninguna celda táctil. Para Braille físico real se necesita hardware específico (embosadora o línea Braille).</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🏛️</span>
                <h4>La ONCE: referencia en España</h4>
                <p>La Organización Nacional de Ciegos Españoles (ONCE) es el organismo de referencia en España para todo lo relacionado con el Braille: transcripción, libros, formación y tecnología asistiva. Sus servicios de transcripción son gratuitos para material educativo.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">📱</span>
                <h4>Braille en smartphones sin hardware</h4>
                <p>iOS (VoiceOver) y Android (TalkBack) permiten escribir Braille directamente en la pantalla táctil usando 6 dedos simultáneos como si fueran los 6 puntos de una celda. Esta función, llamada &quot;Braille Screen Input&quot;, no requiere ningún accesorio adicional.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🌍</span>
                <h4>El Braille sobrevive a la tecnología de voz</h4>
                {/* Sin el «44 % más de probabilidad de estar empleadas»: no traía estudio ni año (hallazgo 3441) */}
                <p>Leer en Braille sigue siendo distinto de escuchar un texto: proporciona acceso a la ortografía, puntuación y formato textual que el audio no transmite.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Limitaciones y Errores Comunes al Usar Braille Digital</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong><span aria-hidden="true">❌</span>Este conversor es visual/educativo, no táctil:</strong> Los caracteres Braille Unicode en pantalla sirven para aprender y entender el sistema, pero no son equivalentes al Braille real en papel. Para producir Braille físico funcional (que una persona ciega pueda leer con los dedos) se necesita una embosadora Braille, no copiar y pegar caracteres Unicode.</li>
              <li><strong><span aria-hidden="true">❌</span>Solo implementa Grado 1 (sin contracciones):</strong> El uso diario real del Braille utiliza el Grado 2, que incluye contracciones para palabras y sílabas frecuentes. La transcripción literal letra a letra del Grado 1 ocupa bastante más espacio que el Grado 2 abreviado. Para materiales de lectura real, un software de transcripción profesional (Duxbury DBT, Braille2000) con tablas de Grado 2 es imprescindible.</li>
              <li><strong><span aria-hidden="true">❌</span>Las reglas de puntuación Braille varían por país y normativa:</strong> El braille español que fija la Comisión Braille Española (esta app sigue su Documento Técnico B 2, V4, 22/01/2026) puede diferir en detalles del sistema usado en México, Argentina u otros países hispanohablantes. La puntuación, indicadores y algunos caracteres especiales no son completamente universales entre las normas nacionales.</li>
              <li><strong><span aria-hidden="true">❌</span>Confundir &quot;leer Braille&quot; con &quot;reconocer caracteres Unicode&quot;:</strong> La habilidad real de leer Braille es táctil y requiere meses de entrenamiento. Reconocer visualmente que ⠁ es &quot;a&quot; es útil para diseñadores y educadores, pero no es leer Braille en el sentido funcional. Son circuitos cerebrales completamente distintos.</li>
              <li><strong><span aria-hidden="true">❌</span>Los números Braille necesitan el indicador ⠼:</strong> Si introduces números sin el indicador numérico, un lector Braille los interpretará como letras (1→a, 2→b, etc.). Este conversor añade automáticamente ⠼ antes de secuencias numéricas, pero al copiar Braille generado hay que asegurarse de no perder el indicador.</li>
              <li><strong><span aria-hidden="true">❌</span>No todos los caracteres especiales tienen equivalente en Braille Español:</strong> Emojis, símbolos matemáticos complejos, caracteres de otros alfabetos (cirílico, árabe, chino) no tienen representación en el Braille español estándar. Para esos contenidos existen sistemas Braille especializados (matemático, musical, informático) con sus propias tablas de conversión.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="conversor-braille" />
      <Footer appName="conversor-braille" />
      </div>
    </div>
  );
}
