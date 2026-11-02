/**
 * Motor del Cifrado César — la aritmética de `simulador-cifrado-cesar`, sin React ni DOM.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la matemática está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]), y porque la usan a la vez la herramienta y
 * los «Casos para clase» (`./casos.ts`): si cada una cifrara a su manera, la corrección
 * suspendería un mensaje que la propia rueda produce.
 *
 * ── LO QUE SE TRASLADÓ DE page.tsx (02/11/2026), SIN CAMBIAR SU CUERPO ──────────
 *   `ALFABETO`, `FREQS_ES` (con su fuente), `SUMA_FREQS_ES`, `cifrarLetra`, `procesarTexto`,
 *   `calcularFrecuencias` y `detectarDesplazamiento`. La página los importa de aquí: hay UNA
 *   sola implementación. Su acta (`tests/apps/simulador-cifrado-cesar.spec.ts`) los mide a
 *   través de la página y no cambia.
 *
 * ── LO AÑADIDO PARA LOS CASOS ─────────────────────────────────────────────────
 *   `reducirClave`, `normalizarMensaje`, `claveEntre`, y la variante de 27 letras con Ñ
 *   (`ALFABETO_27`, `cifrarConAlfabeto27`, `claveEntre27`), que NO usa la app: sirve para
 *   reconocer el error de quien cuenta la Ñ y para decidir qué enunciados deben avisar de que
 *   la rueda tiene 26 letras.
 *
 * Nada lanza: lo que no tiene respuesta devuelve NaN.
 */

// ============================================================
// Constantes
// ============================================================
export const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Frecuencias relativas de las letras en español (%), según Fletcher Pratt, «Secret and
// Urgent: the Story of Codes and Ciphers» (Blue Ribbon Books, 1939), pp. 254-255: la tabla
// que recoge Wikipedia en «Frecuencia de aparición de letras». La Ñ (0,31 %) no entra: está
// fuera del alfabeto de 26 que cifra la app. Antes había aquí una tabla sin fuente, con la E
// al 14,7 %, que sumaba 102 % y que el ataque ni siquiera usaba (hallazgos 1623 y 1624).
export const FREQS_ES: Record<string, number> = {
  A: 12.53, B: 1.42, C: 4.68, D: 5.86, E: 13.68, F: 0.69, G: 1.01, H: 0.7,
  I: 6.25, J: 0.44, K: 0.02, L: 4.97, M: 3.15, N: 6.71, O: 8.68, P: 2.51,
  Q: 0.88, R: 6.87, S: 7.98, T: 4.63, U: 3.93, V: 0.9, W: 0.01, X: 0.22,
  Y: 0.9, Z: 0.52,
};
export const SUMA_FREQS_ES = Object.values(FREQS_ES).reduce((a, b) => a + b, 0);

// ============================================================
// Lógica de cifrado
// ============================================================
export function cifrarLetra(letra: string, desplazamiento: number): string {
  const esUpper = letra === letra.toUpperCase();
  const base = esUpper ? 65 : 97;
  const code = letra.charCodeAt(0) - base;
  const cifrado = ((code + desplazamiento) % 26 + 26) % 26;
  return String.fromCharCode(cifrado + base);
}

export function procesarTexto(texto: string, desplazamiento: number, descifrar: boolean): string {
  const desp = descifrar ? (26 - desplazamiento) % 26 : desplazamiento;
  return texto
    .split('')
    .map((c) => {
      const upper = c.toUpperCase();
      if (upper >= 'A' && upper <= 'Z') return cifrarLetra(c, desp);
      return c;
    })
    .join('');
}

export function calcularFrecuencias(texto: string): Record<string, number> {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const ch of texto.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      counts[ch] = (counts[ch] ?? 0) + 1;
      total++;
    }
  }
  const freqs: Record<string, number> = {};
  for (const letra of ALFABETO) {
    freqs[letra] = total > 0 ? ((counts[letra] ?? 0) / total) * 100 : 0;
  }
  return freqs;
}

/**
 * Detecta la clave comparando el histograma del criptograma con la distribución del español:
 * para cada k posible se «descifra» el recuento y se mide su distancia χ² a FREQS_ES; gana la
 * k con menor χ². Suponer que la letra más frecuente es la E falla en cuanto la A la supera,
 * como en el preset «Párrafo largo» (39 A frente a 31 E: daba k = 25 en vez de 3, hallazgo 1623).
 */
export function detectarDesplazamiento(textoCifrado: string): number {
  const counts = Array<number>(26).fill(0);
  let total = 0;
  for (const ch of textoCifrado.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      counts[ch.charCodeAt(0) - 65]++;
      total++;
    }
  }
  if (total === 0) return 0;
  let mejorK = 0;
  let mejorChi = Infinity;
  for (let k = 0; k < 26; k++) {
    let chi = 0;
    for (let i = 0; i < 26; i++) {
      const esperado = (total * FREQS_ES[ALFABETO[i]]) / SUMA_FREQS_ES;
      const observado = counts[(i + k) % 26];
      chi += ((observado - esperado) ** 2) / esperado;
    }
    if (chi < mejorChi) {
      mejorChi = chi;
      mejorK = k;
    }
  }
  return mejorK;
}

// ============================================================
// Añadido para los «Casos para clase»
// ============================================================

/** La clave llevada a 0..25, como la entiende la rueda: 29 es 3 y −3 es 23. NaN si no es entera. */
export function reducirClave(k: number): number {
  if (!Number.isInteger(k)) return NaN;
  return ((k % 26) + 26) % 26;
}

/**
 * Un mensaje en su forma comparable: solo sus LETRAS, en mayúsculas y seguidas. Las vocales con
 * tilde o diéresis pierden la tilde (Á → A, Ü → U), pero la Ñ se conserva distinta de la N: un
 * `normalize('NFD')` a ciegas la partiría en N + tilde y aceptaría «LUNA» por «LUÑA». Se descartan
 * espacios, signos y cifras, así que «KROD», «krod» y «K R O D» valen lo mismo.
 */
export function normalizarMensaje(texto: string): string {
  let salida = '';
  // NFC primero: una Ñ tecleada como N + tilde combinante vuelve a ser una sola Ñ.
  for (const ch of (texto ?? '').normalize('NFC').toUpperCase()) {
    if (ch === 'Ñ') {
      salida += ch;
      continue;
    }
    const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (/^[A-Z]$/.test(base)) salida += base;
  }
  return salida;
}

/**
 * La clave k (0..25) que lleva `claro` a `cifrado` con el alfabeto de 26 letras, o NaN si no hay
 * una sola: distinto número de letras, una Ñ por medio o letras desplazadas cada una a su manera.
 */
export function claveEntre(claro: string, cifrado: string): number {
  const a = normalizarMensaje(claro);
  const b = normalizarMensaje(cifrado);
  if (a.length === 0 || a.length !== b.length) return NaN;
  let k = NaN;
  for (let i = 0; i < a.length; i++) {
    const p = ALFABETO.indexOf(a[i]);
    const c = ALFABETO.indexOf(b[i]);
    if (p < 0 || c < 0) return NaN;
    const d = (c - p + 26) % 26;
    if (Number.isNaN(k)) k = d;
    else if (d !== k) return NaN;
  }
  return k;
}

/** El alfabeto de 27 letras, con Ñ, que usan muchas aulas hispanas. La rueda de la app NO lo usa. */
export const ALFABETO_27 = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/**
 * El César con el alfabeto de 27 letras: avanza k posiciones contando la Ñ entre la N y la O, con
 * la vuelta de la Z a la A. Conserva mayúsculas y minúsculas; lo que no es letra de ese alfabeto
 * (tildes incluidas) pasa sin cifrar, igual que en la app. Para descifrar, k negativa o 27 − k.
 *
 * Sirve para reconocer el error de quien cuenta la Ñ y para saber qué enunciados cambian de
 * respuesta con ese alfabeto, que son los que deben avisar de que la rueda tiene 26.
 */
export function cifrarConAlfabeto27(texto: string, k: number): string {
  if (!Number.isInteger(k)) return '';
  const d = ((k % 27) + 27) % 27;
  let salida = '';
  for (const ch of (texto ?? '').normalize('NFC')) {
    const mayus = ch.toUpperCase();
    const i = ALFABETO_27.indexOf(mayus);
    if (i < 0 || mayus.length !== 1) {
      salida += ch;
      continue;
    }
    const nueva = ALFABETO_27[(i + d) % 27];
    salida += ch === mayus ? nueva : nueva.toLowerCase();
  }
  return salida;
}

/**
 * La clave (0..26) que lleva `claro` a `cifrado` contando con el alfabeto de 27 letras, o NaN si
 * no hay una sola. Con `soloPrimera`, la de la primera pareja de letras: lo que calcularía quien
 * cuenta la Ñ mirando solo la primera letra.
 */
export function claveEntre27(claro: string, cifrado: string, soloPrimera = false): number {
  const a = normalizarMensaje(claro);
  const b = normalizarMensaje(cifrado);
  if (a.length === 0 || a.length !== b.length) return NaN;
  let k = NaN;
  const hasta = soloPrimera ? 1 : a.length;
  for (let i = 0; i < hasta; i++) {
    const p = ALFABETO_27.indexOf(a[i]);
    const c = ALFABETO_27.indexOf(b[i]);
    if (p < 0 || c < 0) return NaN;
    const d = (c - p + 27) % 27;
    if (Number.isNaN(k)) k = d;
    else if (d !== k) return NaN;
  }
  return k;
}
