/**
 * Evaluador de expresiones booleanas — simulador-puertas-logicas
 *
 * DE DÓNDE SALE (2026-08-23)
 * ──────────────────────────
 * El Inspector encontró el 21/08 (hallazgo 135) que cualquier expresión con la palabra XOR
 * devolvía toda la columna a 0, sin ningún aviso. La causa era el orden de los reemplazos:
 * se aplicaba `.replace(/OR/gi,'|')` ANTES que `.replace(/XOR/gi,'^')`, así que «XOR» se
 * convertía en «X|», la X suelta reventaba al evaluar y el `catch { return false }` se
 * tragaba el error. El símbolo ⊕ sí funcionaba, lo que confirmaba el diagnóstico.
 *
 * Y no era solo el XOR (hallazgo 136): NAND, NOR y XNOR tampoco se entendían. «A NAND B»
 * extraía la N y la D de la propia palabra como si fueran variables y pintaba una tabla de
 * 16 filas con la salida a 0; «A NOR B» avisaba de «Máximo 4 variables (A-D)» cuando la
 * expresión tiene dos. La app ofrece las siete puertas en su <h1>, en el modo Tablas y en su
 * comparativa educativa, así que teclearlas ahí es lo natural.
 *
 * POR QUÉ UN MOTOR Y NO OTRA CADENA DE REEMPLAZOS
 * ──────────────────────────────────────────────
 * Encadenar `.replace()` sobre el texto del usuario y evaluar el resultado como código es
 * exactamente lo que produjo el defecto: lo que sale depende del ORDEN de las sustituciones,
 * nadie puede verlo leyendo el código, y un fallo se convierte en un `false` silencioso en
 * vez de en un mensaje. Aquí se tokeniza y se analiza con precedencia explícita, **sin
 * evaluar código en tiempo de ejecución**, y los errores se devuelven: si algo no se
 * entiende, se dice cuál es el problema en vez de pintar una tabla de ceros que parece un
 * resultado.
 *
 * PRECEDENCIA (la convencional en álgebra de Boole, de más fuerte a más débil)
 *   NOT  >  AND / NAND  >  XOR / XNOR  >  OR / NOR
 * Con paréntesis para lo demás. Se admiten los operadores en palabra y sus símbolos.
 */

export type ResultadoExpresion =
  | { ok: true; valor: boolean }
  | { ok: false; error: string };

export type ResultadoVariables =
  | { ok: true; variables: string[] }
  | { ok: false; error: string };

/** Variables admitidas: las que la app ofrece en su interfaz */
export const VARIABLES_VALIDAS = ['A', 'B', 'C', 'D'] as const;
export const MAX_VARIABLES = VARIABLES_VALIDAS.length;

type NombreOperador = 'NOT' | 'AND' | 'NAND' | 'OR' | 'NOR' | 'XOR' | 'XNOR';

type Token =
  | { tipo: 'var'; nombre: string }
  | { tipo: 'const'; valor: boolean }
  | { tipo: 'op'; nombre: NombreOperador }
  | { tipo: 'abre' }
  | { tipo: 'cierra' }
  | { tipo: 'prima' };

/**
 * Los operadores en palabra se prueban de MÁS LARGO a más corto: si «NAND» se probara
 * después de «AND», el prefijo «N» quedaría suelto. Es la misma trampa del defecto original,
 * resuelta aquí de una vez y en un solo sitio.
 */
const OPERADORES_PALABRA: { texto: string; nombre: NombreOperador }[] = [
  { texto: 'XNOR', nombre: 'XNOR' },
  { texto: 'NAND', nombre: 'NAND' },
  { texto: 'XOR', nombre: 'XOR' },
  { texto: 'NOR', nombre: 'NOR' },
  { texto: 'AND', nombre: 'AND' },
  { texto: 'NOT', nombre: 'NOT' },
  { texto: 'OR', nombre: 'OR' },
];

const SIMBOLOS: Record<string, Token> = {
  '!': { tipo: 'op', nombre: 'NOT' },
  '¬': { tipo: 'op', nombre: 'NOT' },
  '~': { tipo: 'op', nombre: 'NOT' },
  '&': { tipo: 'op', nombre: 'AND' },
  '·': { tipo: 'op', nombre: 'AND' },
  '*': { tipo: 'op', nombre: 'AND' },
  '∧': { tipo: 'op', nombre: 'AND' },
  '|': { tipo: 'op', nombre: 'OR' },
  '+': { tipo: 'op', nombre: 'OR' },
  '∨': { tipo: 'op', nombre: 'OR' },
  '^': { tipo: 'op', nombre: 'XOR' },
  '⊕': { tipo: 'op', nombre: 'XOR' },
  '⊼': { tipo: 'op', nombre: 'NAND' },
  '⊽': { tipo: 'op', nombre: 'NOR' },
  '⊙': { tipo: 'op', nombre: 'XNOR' },
  '(': { tipo: 'abre' },
  ')': { tipo: 'cierra' },
  "'": { tipo: 'prima' },
  '’': { tipo: 'prima' },
};

function tokenizar(expr: string): { ok: true; tokens: Token[] } | { ok: false; error: string } {
  const t = expr.toUpperCase().replace(/\s+/g, '');
  const tokens: Token[] = [];
  let i = 0;

  while (i < t.length) {
    const resto = t.slice(i);

    const palabra = OPERADORES_PALABRA.find((op) => resto.startsWith(op.texto));
    if (palabra) {
      tokens.push({ tipo: 'op', nombre: palabra.nombre });
      i += palabra.texto.length;
      continue;
    }

    const c = t[i];
    if (SIMBOLOS[c]) {
      tokens.push(SIMBOLOS[c]);
      i++;
      continue;
    }
    if (c === '0' || c === '1') {
      tokens.push({ tipo: 'const', valor: c === '1' });
      i++;
      continue;
    }
    if (/[A-Z]/.test(c)) {
      if (!(VARIABLES_VALIDAS as readonly string[]).includes(c)) {
        return { ok: false, error: `«${c}» no es una variable válida. Usa A, B, C o D.` };
      }
      tokens.push({ tipo: 'var', nombre: c });
      i++;
      continue;
    }
    return { ok: false, error: `No entiendo el carácter «${c}».` };
  }

  if (!tokens.length) return { ok: false, error: 'Escribe una expresión.' };
  return { ok: true, tokens };
}

/** Análisis con precedencia explícita. Devuelve el valor o el primer error encontrado. */
function analizar(tokens: Token[], vars: Record<string, boolean>): ResultadoExpresion {
  let pos = 0;
  let fallo: string | null = null;

  const mirar = () => tokens[pos];
  const consumir = () => tokens[pos++];

  /** Variable, constante o paréntesis, seguido de cualquier número de primas postfijas
   *  (A' equivale a NOT A, como en motor-retos.ts — hallazgo 534). */
  const primario = (): boolean => {
    const tk = mirar();
    if (!tk) { fallo ??= 'La expresión termina antes de tiempo.'; return false; }

    let v: boolean;
    if (tk.tipo === 'abre') {
      consumir();
      v = or();
      const cierre = mirar();
      if (!cierre || cierre.tipo !== 'cierra') { fallo ??= 'Falta cerrar un paréntesis.'; return v; }
      consumir();
    } else if (tk.tipo === 'var') {
      consumir();
      v = Boolean(vars[tk.nombre]);
    } else if (tk.tipo === 'const') {
      consumir();
      v = tk.valor;
    } else {
      fallo ??= `Falta un operando antes de «${tk.tipo === 'op' ? tk.nombre : tk.tipo === 'cierra' ? ')' : "'"}».`;
      consumir();
      return false;
    }

    while (mirar()?.tipo === 'prima') { consumir(); v = !v; }
    return v;
  };

  /** NOT prefijo: lo que se ata más fuerte, junto a la prima postfija de `primario`. */
  const unario = (): boolean => {
    const tk = mirar();
    if (tk && tk.tipo === 'op' && tk.nombre === 'NOT') { consumir(); return !unario(); }
    return primario();
  };

  /** ¿El siguiente token puede empezar un `unario`? Hace falta para el AND implícito
   *  (AB, A(B+C), A NOT B), que motor-retos.ts ya admite y este no (hallazgo 534). */
  const empiezaUnario = (): boolean => {
    const tk = mirar();
    if (!tk) return false;
    return tk.tipo === 'var' || tk.tipo === 'const' || tk.tipo === 'abre' || (tk.tipo === 'op' && tk.nombre === 'NOT');
  };

  const and = (): boolean => {
    let v = unario();
    for (;;) {
      const tk = mirar();
      if (tk?.tipo === 'op' && (tk.nombre === 'AND' || tk.nombre === 'NAND')) {
        consumir();
        const d = unario();
        v = tk.nombre === 'AND' ? v && d : !(v && d);
        continue;
      }
      // `unario()` se llama SIEMPRE, nunca dentro de `v && ...`: con v ya en false, el
      // cortocircuito de && no llamaba a unario(), el token no se consumía y el bucle se
      // quedaba girando sobre el mismo token para siempre (bug propio, cazado al probar
      // «AB» con A=false: colgaba el hilo de JS sin lanzar ningún error).
      if (empiezaUnario()) { const d = unario(); v = v && d; continue; }
      return v;
    }
  };

  const xor = (): boolean => {
    let v = and();
    for (;;) {
      const tk = mirar();
      if (tk?.tipo !== 'op' || (tk.nombre !== 'XOR' && tk.nombre !== 'XNOR')) return v;
      consumir();
      const d = and();
      v = tk.nombre === 'XOR' ? v !== d : v === d;
    }
  };

  const or = (): boolean => {
    let v = xor();
    for (;;) {
      const tk = mirar();
      if (tk?.tipo !== 'op' || (tk.nombre !== 'OR' && tk.nombre !== 'NOR')) return v;
      consumir();
      const d = xor();
      v = tk.nombre === 'OR' ? v || d : !(v || d);
    }
  };

  const valor = or();
  if (fallo) return { ok: false, error: fallo };
  if (pos < tokens.length) {
    const sobra = tokens[pos];
    return {
      ok: false,
      error: sobra.tipo === 'cierra'
        ? 'Hay un paréntesis que se cierra sin haberse abierto.'
        : 'Falta un operador entre dos términos.',
    };
  }
  return { ok: true, valor };
}

/** Evalúa la expresión con los valores dados a cada variable. */
export function evaluarExpresion(expr: string, variables: Record<string, boolean>): ResultadoExpresion {
  const tk = tokenizar(expr);
  if (!tk.ok) return { ok: false, error: tk.error };
  return analizar(tk.tokens, variables);
}

/**
 * Variables que usa la expresión, en orden alfabético.
 *
 * Tokeniza en vez de rascar letras sueltas con una regex: así «A NAND B» son dos variables
 * y no cuatro (A, B, D, N), que es lo que pasaba antes.
 */
export function extraerVariables(expr: string): ResultadoVariables {
  const tk = tokenizar(expr);
  if (!tk.ok) return { ok: false, error: tk.error };

  const nombres = new Set<string>();
  for (const t of tk.tokens) if (t.tipo === 'var') nombres.add(t.nombre);

  const variables = [...nombres].sort();
  if (variables.length > MAX_VARIABLES) {
    return { ok: false, error: `Máximo ${MAX_VARIABLES} variables (A-D).` };
  }
  return { ok: true, variables };
}
