/**
 * Motor del modo «Retos» del simulador de puertas lógicas.
 *
 * Vive fuera de page.tsx a propósito: el build compila la vista sin mirar si la lógica
 * booleana está bien, así que el evaluador y el corrector se prueban solos, en
 * tests/apps/simulador-puertas-logicas.spec.ts, con tablas escritas a mano.
 *
 * El parser es recursivo descendente y no evalúa código dinámico: además de ser
 * verificable paso a paso, no depende de que la CSP permita 'unsafe-eval'.
 *
 * CRITERIO DE CONTEO — se cuentan OPERADORES de la expresión, no puertas físicas.
 * En un circuito real una señal intermedia se reparte a varias entradas y hacen falta
 * menos puertas: el XOR con NAND se escribe con 5 operadores y se construye con 4
 * puertas. La diferencia se explica en la propia app; aquí solo se cuentan nodos.
 */

export type OperadorBinario = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR';

/** Nodo del árbol sintáctico de una expresión booleana. */
export type Nodo =
  | { tipo: 'variable'; nombre: string }
  | { tipo: 'constante'; valor: boolean }
  | { tipo: 'not'; hijo: Nodo }
  | { tipo: 'binario'; operador: OperadorBinario; izquierda: Nodo; derecha: Nodo };

interface Token {
  tipo: 'variable' | 'operador' | 'not' | 'abre' | 'cierra' | 'constante' | 'prima';
  valor: string;
}

// ============================================
// TOKENIZADOR
// ============================================

/** Palabras clave, de más larga a más corta: NAND debe leerse antes que AND. */
const PALABRAS: { texto: string; token: Token }[] = [
  { texto: 'XNOR', token: { tipo: 'operador', valor: 'XNOR' } },
  { texto: 'NAND', token: { tipo: 'operador', valor: 'NAND' } },
  { texto: 'XOR', token: { tipo: 'operador', valor: 'XOR' } },
  { texto: 'NOR', token: { tipo: 'operador', valor: 'NOR' } },
  { texto: 'NOT', token: { tipo: 'not', valor: 'NOT' } },
  { texto: 'AND', token: { tipo: 'operador', valor: 'AND' } },
  { texto: 'OR', token: { tipo: 'operador', valor: 'OR' } },
];

const SIMBOLOS: Record<string, Token> = {
  '!': { tipo: 'not', valor: 'NOT' },
  '¬': { tipo: 'not', valor: 'NOT' },
  '~': { tipo: 'not', valor: 'NOT' },
  '·': { tipo: 'operador', valor: 'AND' },
  '*': { tipo: 'operador', valor: 'AND' },
  '&': { tipo: 'operador', valor: 'AND' },
  '∧': { tipo: 'operador', valor: 'AND' },
  '+': { tipo: 'operador', valor: 'OR' },
  '|': { tipo: 'operador', valor: 'OR' },
  '∨': { tipo: 'operador', valor: 'OR' },
  '^': { tipo: 'operador', valor: 'XOR' },
  '⊕': { tipo: 'operador', valor: 'XOR' },
  '⊼': { tipo: 'operador', valor: 'NAND' },
  '⊽': { tipo: 'operador', valor: 'NOR' },
  '⊙': { tipo: 'operador', valor: 'XNOR' },
  '(': { tipo: 'abre', valor: '(' },
  ')': { tipo: 'cierra', valor: ')' },
  "'": { tipo: 'prima', valor: "'" },
  '’': { tipo: 'prima', valor: "'" },
};

class ErrorSintaxis extends Error {}

function tokenizar(entrada: string): Token[] {
  const texto = entrada.toUpperCase();
  const tokens: Token[] = [];
  let i = 0;

  while (i < texto.length) {
    const c = texto[i];

    if (c === ' ' || c === '\t' || c === '\n') {
      i++;
      continue;
    }

    // Palabras clave antes que variables sueltas: si no, «AND» se leería A·N·D.
    const palabra = PALABRAS.find((p) => texto.startsWith(p.texto, i));
    if (palabra) {
      tokens.push(palabra.token);
      i += palabra.texto.length;
      continue;
    }

    if (c === '0' || c === '1') {
      tokens.push({ tipo: 'constante', valor: c });
      i++;
      continue;
    }

    if (c >= 'A' && c <= 'Z') {
      tokens.push({ tipo: 'variable', valor: c });
      i++;
      continue;
    }

    const simbolo = SIMBOLOS[c];
    if (simbolo) {
      tokens.push(simbolo);
      i++;
      continue;
    }

    throw new ErrorSintaxis(`Carácter no reconocido: «${entrada[i]}»`);
  }

  return tokens;
}

// ============================================
// PARSER
// ============================================
// Precedencia, de más fuerte a más débil:
//   NOT  >  AND / NAND  >  XOR / XNOR  >  OR / NOR
// El producto implícito (AB, A(B+C)) se trata como AND, que es la notación habitual
// del álgebra de Boole.

class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  private actual(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consumir(): Token {
    const t = this.tokens[this.pos];
    if (!t) throw new ErrorSintaxis('La expresión termina antes de tiempo');
    this.pos++;
    return t;
  }

  private esOperador(...valores: string[]): boolean {
    const t = this.actual();
    return t !== undefined && t.tipo === 'operador' && valores.includes(t.valor);
  }

  /** Un primario puede empezar aquí: hace falta para detectar el AND implícito. */
  private empiezaPrimario(): boolean {
    const t = this.actual();
    if (!t) return false;
    return t.tipo === 'variable' || t.tipo === 'constante' || t.tipo === 'abre' || t.tipo === 'not';
  }

  parse(): Nodo {
    const nodo = this.parseOr();
    if (this.pos < this.tokens.length) {
      throw new ErrorSintaxis('Sobra algo al final de la expresión');
    }
    return nodo;
  }

  private parseOr(): Nodo {
    let izquierda = this.parseXor();
    while (this.esOperador('OR', 'NOR')) {
      const operador = this.consumir().valor as OperadorBinario;
      izquierda = { tipo: 'binario', operador, izquierda, derecha: this.parseXor() };
    }
    return izquierda;
  }

  private parseXor(): Nodo {
    let izquierda = this.parseAnd();
    while (this.esOperador('XOR', 'XNOR')) {
      const operador = this.consumir().valor as OperadorBinario;
      izquierda = { tipo: 'binario', operador, izquierda, derecha: this.parseAnd() };
    }
    return izquierda;
  }

  private parseAnd(): Nodo {
    let izquierda = this.parseUnario();
    for (;;) {
      if (this.esOperador('AND', 'NAND')) {
        const operador = this.consumir().valor as OperadorBinario;
        izquierda = { tipo: 'binario', operador, izquierda, derecha: this.parseUnario() };
      } else if (this.empiezaPrimario()) {
        // AND implícito: AB, A(B+C), A NOT B
        izquierda = { tipo: 'binario', operador: 'AND', izquierda, derecha: this.parseUnario() };
      } else {
        return izquierda;
      }
    }
  }

  private parseUnario(): Nodo {
    const t = this.actual();
    if (t && t.tipo === 'not') {
      this.consumir();
      return { tipo: 'not', hijo: this.parseUnario() };
    }
    return this.parsePrimario();
  }

  private parsePrimario(): Nodo {
    const t = this.consumir();
    let nodo: Nodo;

    if (t.tipo === 'variable') {
      nodo = { tipo: 'variable', nombre: t.valor };
    } else if (t.tipo === 'constante') {
      nodo = { tipo: 'constante', valor: t.valor === '1' };
    } else if (t.tipo === 'abre') {
      nodo = this.parseOr();
      const cierre = this.actual();
      if (!cierre || cierre.tipo !== 'cierra') throw new ErrorSintaxis('Falta un paréntesis de cierre');
      this.consumir();
    } else {
      throw new ErrorSintaxis(`No se esperaba «${t.valor}» aquí`);
    }

    // Negación postfija: A' equivale a NOT A
    while (this.actual()?.tipo === 'prima') {
      this.consumir();
      nodo = { tipo: 'not', hijo: nodo };
    }

    return nodo;
  }
}

/** Convierte una expresión booleana en árbol. Lanza Error con mensaje en español. */
export function analizar(expresion: string): Nodo {
  if (!expresion.trim()) throw new ErrorSintaxis('Escribe una expresión');
  return new Parser(tokenizar(expresion)).parse();
}

// ============================================
// EVALUACIÓN Y MEDIDA
// ============================================

const aplicar = (operador: OperadorBinario, a: boolean, b: boolean): boolean => {
  switch (operador) {
    case 'AND': return a && b;
    case 'OR': return a || b;
    case 'XOR': return a !== b;
    case 'NAND': return !(a && b);
    case 'NOR': return !(a || b);
    case 'XNOR': return a === b;
  }
};

/** Evalúa el árbol con unos valores dados. Variable no declarada → error. */
export function evaluar(nodo: Nodo, valores: Record<string, boolean>): boolean {
  switch (nodo.tipo) {
    case 'constante':
      return nodo.valor;
    case 'variable': {
      if (!(nodo.nombre in valores)) {
        throw new ErrorSintaxis(`La variable «${nodo.nombre}» no es de este reto`);
      }
      return valores[nodo.nombre];
    }
    case 'not':
      return !evaluar(nodo.hijo, valores);
    case 'binario':
      return aplicar(nodo.operador, evaluar(nodo.izquierda, valores), evaluar(nodo.derecha, valores));
  }
}

/** Cuenta operadores del árbol (cada NOT y cada operador binario suma 1). */
export function contarOperadores(nodo: Nodo): number {
  switch (nodo.tipo) {
    case 'constante':
    case 'variable':
      return 0;
    case 'not':
      return 1 + contarOperadores(nodo.hijo);
    case 'binario':
      return 1 + contarOperadores(nodo.izquierda) + contarOperadores(nodo.derecha);
  }
}

/** Operadores distintos que aparecen en el árbol, para validar los retos restringidos. */
export function operadoresUsados(nodo: Nodo): Set<string> {
  const usados = new Set<string>();
  const recorrer = (n: Nodo): void => {
    if (n.tipo === 'not') {
      usados.add('NOT');
      recorrer(n.hijo);
    } else if (n.tipo === 'binario') {
      usados.add(n.operador);
      recorrer(n.izquierda);
      recorrer(n.derecha);
    }
  };
  recorrer(nodo);
  return usados;
}

/**
 * Combinación de entradas de la fila `indice`.
 * La primera variable es el bit más significativo, igual que en el resto del simulador.
 */
export function filaDeIndice(variables: string[], indice: number): boolean[] {
  return variables.map((_, j) => Boolean((indice >> (variables.length - 1 - j)) & 1));
}

/** Tabla de verdad completa de un árbol para unas variables dadas. */
export function tablaDeVerdad(nodo: Nodo, variables: string[]): boolean[] {
  const filas = 2 ** variables.length;
  const salidas: boolean[] = [];
  for (let i = 0; i < filas; i++) {
    const entradas = filaDeIndice(variables, i);
    const valores: Record<string, boolean> = {};
    variables.forEach((v, j) => { valores[v] = entradas[j]; });
    salidas.push(evaluar(nodo, valores));
  }
  return salidas;
}

// ============================================
// CATÁLOGO DE RETOS
// ============================================

export interface Reto {
  id: string;
  nombre: string;
  enunciado: string;
  variables: string[];
  /** Salida esperada de cada fila, en orden binario ascendente. */
  salidas: boolean[];
  /** Si está, solo pueden usarse estos operadores. */
  permitidos?: string[];
  /** Solución conocida y su número de operadores. No se afirma que sea el mínimo. */
  referencia: string;
  operadoresReferencia: number;
  pista: string;
}

export const RETOS: Reto[] = [
  {
    id: 'not-con-nand',
    nombre: 'Invertir con una sola NAND',
    enunciado: 'Consigue un inversor (NOT) usando únicamente puertas NAND.',
    variables: ['A'],
    salidas: [true, false],
    permitidos: ['NAND'],
    referencia: 'A NAND A',
    operadoresReferencia: 1,
    pista: 'Una NAND con las dos entradas unidas al mismo cable se comporta como un NOT.',
  },
  {
    id: 'and-con-nand',
    nombre: 'AND usando solo NAND',
    enunciado: 'Reproduce la tabla de la puerta AND sin usar AND: solo NAND.',
    variables: ['A', 'B'],
    salidas: [false, false, false, true],
    permitidos: ['NAND'],
    referencia: '(A NAND B) NAND (A NAND B)',
    operadoresReferencia: 3,
    pista: 'NAND es AND negada. Si vuelves a negar el resultado, recuperas la AND.',
  },
  {
    id: 'or-con-nor',
    nombre: 'OR usando solo NOR',
    enunciado: 'Reproduce la tabla de la puerta OR sin usar OR: solo NOR.',
    variables: ['A', 'B'],
    salidas: [false, true, true, true],
    permitidos: ['NOR'],
    referencia: '(A NOR B) NOR (A NOR B)',
    operadoresReferencia: 3,
    pista: 'Mismo truco que con la NAND, pero al otro lado del espejo.',
  },
  {
    id: 'implicacion',
    nombre: 'Implicación A → B',
    enunciado: 'Salida 0 únicamente cuando A vale 1 y B vale 0. Es el «si A, entonces B» de la lógica.',
    variables: ['A', 'B'],
    salidas: [true, true, false, true],
    referencia: 'NOT A OR B',
    operadoresReferencia: 2,
    pista: 'Una promesa solo se incumple si la premisa se cumple y la conclusión no.',
  },
  {
    id: 'comparador-mayor',
    nombre: 'Comparador A > B',
    enunciado: 'Salida 1 solo cuando A es estrictamente mayor que B (un bit cada uno).',
    variables: ['A', 'B'],
    salidas: [false, false, true, false],
    referencia: 'A AND NOT B',
    operadoresReferencia: 2,
    pista: 'Con un bit por lado, «mayor» significa que uno está a 1 y el otro a 0.',
  },
  {
    id: 'xor-con-nand',
    nombre: 'XOR usando solo NAND',
    enunciado: 'El clásico de la lógica digital: consigue un XOR con puertas NAND y nada más.',
    variables: ['A', 'B'],
    salidas: [false, true, true, false],
    permitidos: ['NAND'],
    referencia: '(A NAND (A NAND B)) NAND (B NAND (A NAND B))',
    operadoresReferencia: 5,
    pista: 'Calcula primero A NAND B y reutilízalo como entrada de otras dos NAND.',
  },
  {
    id: 'multiplexor',
    nombre: 'Multiplexor 2 a 1',
    enunciado: 'La salida copia A cuando S vale 0, y copia B cuando S vale 1.',
    variables: ['S', 'A', 'B'],
    salidas: [false, false, true, true, false, true, false, true],
    referencia: '(NOT S AND A) OR (S AND B)',
    operadoresReferencia: 4,
    pista: 'Deja pasar cada entrada por su propia puerta y une las dos ramas al final.',
  },
  {
    id: 'mayoria-3',
    nombre: 'Votación por mayoría',
    enunciado: 'Tres votos, salida 1 cuando al menos dos son 1.',
    variables: ['A', 'B', 'C'],
    salidas: [false, false, false, true, false, true, true, true],
    referencia: '(A AND B) OR (A AND C) OR (B AND C)',
    operadoresReferencia: 5,
    pista: 'Basta con detectar cada pareja que coincide en 1.',
  },
  {
    id: 'paridad-impar',
    nombre: 'Paridad impar de 3 bits',
    enunciado: 'Salida 1 cuando el número de entradas a 1 es impar. Es el bit de paridad de las comunicaciones.',
    variables: ['A', 'B', 'C'],
    salidas: [false, true, true, false, true, false, false, true],
    referencia: 'A XOR B XOR C',
    operadoresReferencia: 2,
    pista: 'Hay una puerta que ya responde «las entradas son distintas». Encadénala.',
  },
];

// ============================================
// CORRECCIÓN DEL INTENTO
// ============================================

export interface FilaCorregida {
  entradas: boolean[];
  esperado: boolean;
  obtenido: boolean;
  acierta: boolean;
}

export interface Correccion {
  valida: boolean;
  error?: string;
  filas: FilaCorregida[];
  aciertos: number;
  total: number;
  resuelto: boolean;
  operadores: number;
  /** Resuelto con el número de operadores de la referencia, o menos. */
  optimo: boolean;
}

/** Corrige un intento contra un reto. Nunca lanza: los errores viajan en `error`. */
export function corregirIntento(expresion: string, reto: Reto): Correccion {
  const vacia: Correccion = {
    valida: false,
    filas: [],
    aciertos: 0,
    total: reto.salidas.length,
    resuelto: false,
    operadores: 0,
    optimo: false,
  };

  let arbol: Nodo;
  try {
    arbol = analizar(expresion);
  } catch (e) {
    return { ...vacia, error: e instanceof Error ? e.message : 'Expresión no válida' };
  }

  if (reto.permitidos) {
    const permitidos = reto.permitidos;
    const prohibidos = [...operadoresUsados(arbol)].filter((op) => !permitidos.includes(op));
    if (prohibidos.length > 0) {
      return {
        ...vacia,
        error: `Este reto solo admite ${permitidos.join(', ')}. Has usado: ${prohibidos.join(', ')}.`,
      };
    }
  }

  let obtenidas: boolean[];
  try {
    obtenidas = tablaDeVerdad(arbol, reto.variables);
  } catch (e) {
    return { ...vacia, error: e instanceof Error ? e.message : 'No se ha podido evaluar' };
  }

  const filas: FilaCorregida[] = obtenidas.map((obtenido, i) => ({
    entradas: filaDeIndice(reto.variables, i),
    esperado: reto.salidas[i],
    obtenido,
    acierta: obtenido === reto.salidas[i],
  }));

  const aciertos = filas.filter((f) => f.acierta).length;
  const resuelto = aciertos === filas.length;
  const operadores = contarOperadores(arbol);

  return {
    valida: true,
    filas,
    aciertos,
    total: filas.length,
    resuelto,
    operadores,
    optimo: resuelto && operadores <= reto.operadoresReferencia,
  };
}
