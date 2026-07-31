/**
 * Minimización booleana por Quine-McCluskey — lógica pura sin React ni DOM
 * Usada por: app/calculadora-algebra-booleana
 *
 * Obtiene la forma MÍNIMA (no solo una forma correcta) de una función booleana:
 *   1. Calcula todos los implicantes primos por combinación iterativa (Quine-McCluskey).
 *   2. Detecta los implicantes primos ESENCIALES (únicos que cubren algún mintérmino).
 *   3. Resuelve la cobertura del resto por búsqueda exacta de tamaño creciente,
 *      minimizando primero el nº de términos y después el nº de literales.
 *
 * Un implicante se representa como patrón de longitud n sobre {'0','1','-'},
 * donde '-' marca una variable eliminada por la agrupación. El bit más
 * significativo del patrón es la primera variable (A).
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

/** Valor de una celda de la tabla de verdad */
export type ValorCelda = 0 | 1 | 'X';

/** Forma de salida: suma de productos o producto de sumas */
export type ModoSalida = 'sop' | 'pos';

export interface Implicante {
  /** Patrón sobre {'0','1','-'} — p. ej. "1-0" */
  patron: string;
  /** Celdas del mapa que cubre (incluidas las don't care) */
  celdas: number[];
  /** Número de literales del término (variables no eliminadas) */
  literales: number;
  /** true si es el único implicante primo que cubre algún mintérmino requerido */
  esencial: boolean;
}

export interface ResultadoMinimizacion {
  /** Implicantes seleccionados para la expresión mínima */
  grupos: Implicante[];
  /** Todos los implicantes primos de la función (material didáctico) */
  primos: Implicante[];
  /** Celdas que la expresión debe cubrir (mintérminos o maxtérminos, sin don't cares) */
  requeridos: number[];
  /** Don't cares aprovechados en algún grupo seleccionado */
  dontCaresUsados: number[];
  /** true si la función es constante (0 o 1) y no admite agrupación */
  constante: null | 0 | 1;
}

// ─── Utilidades de patrones ────────────────────────────────────────────────────

/** Patrón binario de una celda: 5 con 4 variables → "0101" */
function patronDeCelda(celda: number, numVars: number): string {
  return celda.toString(2).padStart(numVars, '0');
}

/** Expande un patrón a las celdas que cubre: "1-0" → [4, 6] */
export function celdasDePatron(patron: string): number[] {
  const posicionesLibres: number[] = [];
  for (let i = 0; i < patron.length; i++) {
    if (patron[i] === '-') posicionesLibres.push(i);
  }
  const celdas: number[] = [];
  const total = Math.pow(2, posicionesLibres.length);
  for (let combinacion = 0; combinacion < total; combinacion++) {
    const bits = patron.split('');
    posicionesLibres.forEach((pos, i) => {
      bits[pos] = ((combinacion >> i) & 1).toString();
    });
    celdas.push(parseInt(bits.join(''), 2));
  }
  return celdas.sort((a, b) => a - b);
}

/** Combina dos patrones que difieren en exactamente una posición fija: "100"+"110" → "1-0" */
function combinarPatrones(a: string, b: string): string | null {
  let diferencias = 0;
  let posicionDiferente = -1;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      // Un '-' frente a un bit fijo no es combinable
      if (a[i] === '-' || b[i] === '-') return null;
      diferencias++;
      posicionDiferente = i;
      if (diferencias > 1) return null;
    }
  }
  if (diferencias !== 1) return null;
  return a.substring(0, posicionDiferente) + '-' + a.substring(posicionDiferente + 1);
}

/** Número de literales de un patrón (variables que sobreviven) */
function literalesDePatron(patron: string): number {
  return patron.split('').filter(c => c !== '-').length;
}

// ─── Paso 1: implicantes primos (Quine-McCluskey) ──────────────────────────────

/**
 * Calcula los implicantes primos de un conjunto de celdas (unos + don't cares).
 * Combina por niveles hasta que ningún par más se puede fusionar; lo que queda
 * sin combinar en cada nivel es primo.
 */
export function implicantesPrimos(celdas: number[], numVars: number): string[] {
  const unicas = [...new Set(celdas)].sort((a, b) => a - b);
  if (unicas.length === 0) return [];

  let nivel = unicas.map(c => patronDeCelda(c, numVars));
  const primos = new Set<string>();

  while (nivel.length > 0) {
    const combinado = new Array(nivel.length).fill(false);
    const siguiente = new Set<string>();

    for (let i = 0; i < nivel.length; i++) {
      for (let j = i + 1; j < nivel.length; j++) {
        const fusion = combinarPatrones(nivel[i], nivel[j]);
        if (fusion !== null) {
          combinado[i] = true;
          combinado[j] = true;
          siguiente.add(fusion);
        }
      }
    }

    nivel.forEach((patron, i) => {
      if (!combinado[i]) primos.add(patron);
    });

    nivel = [...siguiente];
  }

  return [...primos];
}

// ─── Paso 2: cobertura mínima exacta ───────────────────────────────────────────

/** Combinaciones de k elementos entre n índices */
function combinaciones(n: number, k: number): number[][] {
  const resultado: number[][] = [];
  const construir = (inicio: number, actual: number[]) => {
    if (actual.length === k) {
      resultado.push([...actual]);
      return;
    }
    for (let i = inicio; i < n; i++) {
      actual.push(i);
      construir(i + 1, actual);
      actual.pop();
    }
  };
  construir(0, []);
  return resultado;
}

/**
 * Tope de seguridad de la búsqueda exacta. Con 4 variables nunca se alcanza
 * (el máximo de implicantes primos es de una veintena); actúa de red por si el
 * motor se reutiliza con más variables.
 */
const MAX_COMBINACIONES = 300_000;

/** Cobertura greedy de respaldo: correcta, aunque no garantiza mínima */
function coberturaGreedy(candidatos: string[], porCubrir: number[]): string[] {
  const pendientes = new Set(porCubrir);
  const elegidos: string[] = [];
  const restantes = [...candidatos];

  while (pendientes.size > 0 && restantes.length > 0) {
    let mejorIdx = -1;
    let mejorCobertura = -1;
    let mejorLiterales = Infinity;

    restantes.forEach((patron, i) => {
      const cubre = celdasDePatron(patron).filter(c => pendientes.has(c)).length;
      const lits = literalesDePatron(patron);
      if (cubre > mejorCobertura || (cubre === mejorCobertura && lits < mejorLiterales)) {
        mejorIdx = i;
        mejorCobertura = cubre;
        mejorLiterales = lits;
      }
    });

    if (mejorIdx === -1 || mejorCobertura <= 0) break;
    const elegido = restantes.splice(mejorIdx, 1)[0];
    elegidos.push(elegido);
    celdasDePatron(elegido).forEach(c => pendientes.delete(c));
  }

  return elegidos;
}

/**
 * Selecciona el subconjunto mínimo de implicantes primos que cubre todos los
 * mintérminos requeridos: primero los esenciales, luego búsqueda exacta por
 * tamaño creciente sobre el resto.
 */
function seleccionarCobertura(
  primos: string[],
  requeridos: number[]
): { elegidos: string[]; esenciales: Set<string> } {
  const esenciales = new Set<string>();
  if (requeridos.length === 0) return { elegidos: [], esenciales };

  const cubrePor = new Map<number, string[]>();
  for (const celda of requeridos) {
    cubrePor.set(celda, primos.filter(p => celdasDePatron(p).includes(celda)));
  }

  // Implicantes primos esenciales: únicos que cubren algún mintérmino
  for (const [, cubridores] of cubrePor) {
    if (cubridores.length === 1) esenciales.add(cubridores[0]);
  }

  const cubiertos = new Set<number>();
  esenciales.forEach(p => celdasDePatron(p).forEach(c => cubiertos.add(c)));

  const porCubrir = requeridos.filter(c => !cubiertos.has(c));
  if (porCubrir.length === 0) {
    return { elegidos: [...esenciales], esenciales };
  }

  // Solo interesan los primos que aportan algo a lo que falta
  const candidatos = primos.filter(
    p => !esenciales.has(p) && celdasDePatron(p).some(c => porCubrir.includes(c))
  );

  for (let k = 1; k <= candidatos.length; k++) {
    const combos = combinaciones(candidatos.length, k);
    if (combos.length > MAX_COMBINACIONES) break;

    let mejor: string[] | null = null;
    let mejorLiterales = Infinity;

    for (const combo of combos) {
      const seleccion = combo.map(i => candidatos[i]);
      const cubiertosCombo = new Set<number>();
      seleccion.forEach(p => celdasDePatron(p).forEach(c => cubiertosCombo.add(c)));
      if (!porCubrir.every(c => cubiertosCombo.has(c))) continue;

      const literales = seleccion.reduce((acc, p) => acc + literalesDePatron(p), 0);
      if (literales < mejorLiterales) {
        mejorLiterales = literales;
        mejor = seleccion;
      }
    }

    if (mejor !== null) {
      return { elegidos: [...esenciales, ...mejor], esenciales };
    }
  }

  // Red de seguridad: nunca se alcanza con 2-4 variables
  return { elegidos: [...esenciales, ...coberturaGreedy(candidatos, porCubrir)], esenciales };
}

// ─── API pública ───────────────────────────────────────────────────────────────

/**
 * Minimiza una función booleana dada su tabla de verdad.
 *
 * @param tablaVerdad valores 0 | 1 | 'X' indexados por número de celda
 * @param numVars     número de variables (2, 3 o 4 en la app; el motor no lo limita)
 * @param modo        'sop' agrupa los unos · 'pos' agrupa los ceros (De Morgan)
 */
export function minimizar(
  tablaVerdad: ValorCelda[],
  numVars: number,
  modo: ModoSalida
): ResultadoMinimizacion {
  const totalCeldas = Math.pow(2, numVars);
  const dontCares: number[] = [];
  const unos: number[] = [];
  const ceros: number[] = [];

  for (let i = 0; i < totalCeldas; i++) {
    const v = tablaVerdad[i];
    if (v === 'X') dontCares.push(i);
    else if (v === 1) unos.push(i);
    else ceros.push(i);
  }

  // En POS se agrupan los ceros y el término resultante se escribe complementado
  const requeridos = modo === 'sop' ? unos : ceros;
  const vacio: ResultadoMinimizacion = {
    grupos: [],
    primos: [],
    requeridos,
    dontCaresUsados: [],
    constante: null,
  };

  // Función constante: sin celdas que cubrir
  if (requeridos.length === 0) {
    return { ...vacio, constante: modo === 'sop' ? 0 : 1 };
  }

  // Los requeridos + don't cares llenan el mapa: la expresión se reduce a una constante
  if (requeridos.length + dontCares.length === totalCeldas) {
    return { ...vacio, constante: modo === 'sop' ? 1 : 0 };
  }

  const primosPatrones = implicantesPrimos([...requeridos, ...dontCares], numVars);
  const { elegidos, esenciales } = seleccionarCobertura(primosPatrones, requeridos);

  const construir = (patron: string): Implicante => ({
    patron,
    celdas: celdasDePatron(patron),
    literales: literalesDePatron(patron),
    esencial: esenciales.has(patron),
  });

  // Orden estable: primero los esenciales, luego por tamaño de grupo descendente
  const grupos = elegidos
    .map(construir)
    .sort((a, b) =>
      a.esencial === b.esencial ? a.literales - b.literales : a.esencial ? -1 : 1
    );

  const usados = new Set<number>();
  grupos.forEach(g => g.celdas.forEach(c => { if (dontCares.includes(c)) usados.add(c); }));

  return {
    grupos,
    primos: primosPatrones.map(construir).sort((a, b) => a.literales - b.literales),
    requeridos,
    dontCaresUsados: [...usados].sort((a, b) => a - b),
    constante: null,
  };
}

/**
 * Escribe el término algebraico de un implicante.
 * SOP → producto de literales (AB'C) · POS → suma de literales complementados (A + B' + C)
 */
export function terminoDeImplicante(
  patron: string,
  nombresVariables: string[],
  modo: ModoSalida
): string {
  const literales: string[] = [];

  for (let i = 0; i < patron.length; i++) {
    if (patron[i] === '-') continue;
    const nombre = nombresVariables[i];
    if (modo === 'sop') {
      literales.push(patron[i] === '1' ? nombre : `${nombre}'`);
    } else {
      // De Morgan: el grupo de ceros se escribe como suma con literales invertidos
      literales.push(patron[i] === '0' ? nombre : `${nombre}'`);
    }
  }

  if (literales.length === 0) return modo === 'sop' ? '1' : '0';
  if (modo === 'sop') return literales.join('');
  // Un único literal no necesita paréntesis: A(B + C) se lee mejor que (A)(B + C)
  return literales.length === 1 ? literales[0] : `(${literales.join(' + ')})`;
}

/** Expresión completa a partir del resultado de minimizar() */
export function expresionMinima(
  resultado: ResultadoMinimizacion,
  nombresVariables: string[],
  modo: ModoSalida
): string {
  if (resultado.constante !== null) return `F = ${resultado.constante}`;
  const terminos = resultado.grupos.map(g => terminoDeImplicante(g.patron, nombresVariables, modo));
  return modo === 'sop' ? `F = ${terminos.join(' + ')}` : `F = ${terminos.join('')}`;
}

/** Cuenta total de literales de la expresión (métrica de coste del circuito) */
export function totalLiterales(resultado: ResultadoMinimizacion): number {
  return resultado.grupos.reduce((acc, g) => acc + g.literales, 0);
}
