/**
 * Motor de conversiones de autómatas finitos — determinización y minimización.
 *
 * Vive aparte de la vista y sin ninguna dependencia de React a propósito: el build no
 * puede ver si un algoritmo está mal, así que estos dos se comprueban con casos resueltos
 * a mano en tests/automatas-motor.spec.ts ANTES de que la pantalla los muestre. Un AFD mal
 * determinizado se ve perfectamente bien en pantalla y engaña a quien lo usa para estudiar.
 *
 * Hasta el 05/09/2026 la app SIMULABA autómatas y se limitaba a EXPLICAR en texto la
 * construcción de subconjuntos y la minimización, que son justo los dos ejercicios que se
 * piden en un examen de teoría de la computación.
 */

export interface EstadoMotor {
  id: string;
  etiqueta: string;
  esInicial: boolean;
  esFinal: boolean;
}

export interface TransicionMotor {
  from: string;
  to: string;
  simbolo: string;
}

export interface AutomataMotor {
  estados: EstadoMotor[];
  transiciones: TransicionMotor[];
}

/** Símbolo de transición vacía. La app lo escribe así en el lienzo. */
export const EPSILON = 'ε';

/** Una fila de la tabla de subconjuntos, que es como se resuelve el ejercicio a mano. */
export interface FilaSubconjuntos {
  /** Nombre del conjunto de partida, ya formateado: «{q0,q1}» */
  desde: string;
  simbolo: string;
  /** Nombre del conjunto de llegada, o null si no hay transición posible */
  hasta: string | null;
  /** true la primera vez que aparece un conjunto: es la fila que lo «descubre» */
  nuevo: boolean;
}

export interface ResultadoDeterminizacion {
  ok: boolean;
  /** Motivo por el que no se ha podido convertir (solo cuando ok es false) */
  error?: string;
  automata: AutomataMotor;
  alfabeto: string[];
  filas: FilaSubconjuntos[];
  /** Correspondencia AFD → conjunto de estados del AFND, para poder explicarla */
  correspondencia: { nombre: string; miembros: string[] }[];
  /** true si alguna transición moría en el conjunto vacío y se ha omitido */
  omitidoVacio: boolean;
}

/** Una ronda del refinamiento de particiones. */
export interface RondaParticion {
  numero: number;
  /** Cada clase, como lista de etiquetas de estado */
  clases: string[][];
  descripcion: string;
}

export interface ResultadoMinimizacion {
  ok: boolean;
  error?: string;
  automata: AutomataMotor;
  alfabeto: string[];
  rondas: RondaParticion[];
  /** Estados que no se alcanzan desde el inicial y se han descartado antes de empezar */
  inalcanzables: string[];
  /** Grupos de dos o más estados originales que resultaron equivalentes */
  fusionados: string[][];
}

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Alfabeto real del autómata: los símbolos que aparecen, sin ε y en orden estable. */
export function alfabetoDe(transiciones: TransicionMotor[]): string[] {
  return [...new Set(transiciones.map((t) => t.simbolo).filter((s) => s !== EPSILON))].sort();
}

/** Nombre canónico de un conjunto de estados: ordenado, para que {q1,q0} y {q0,q1} sean el mismo. */
function nombreConjunto(ids: string[], etiquetaDe: Map<string, string>): string {
  const etiquetas = ids.map((id) => etiquetaDe.get(id) ?? id).sort((a, b) => a.localeCompare(b, 'es'));
  return `{${etiquetas.join(',')}}`;
}

/** Clave de identidad de un conjunto, independiente de cómo se muestre. */
function claveConjunto(ids: string[]): string {
  return [...ids].sort().join('|');
}

/** ε-clausura: todo lo alcanzable con transiciones vacías, incluidos los de partida. */
export function epsilonClausura(ids: string[], transiciones: TransicionMotor[]): string[] {
  const vistos = new Set(ids);
  const cola = [...ids];
  while (cola.length > 0) {
    const actual = cola.shift() as string;
    for (const t of transiciones) {
      if (t.from === actual && t.simbolo === EPSILON && !vistos.has(t.to)) {
        vistos.add(t.to);
        cola.push(t.to);
      }
    }
  }
  return [...vistos];
}

// ─────────────────────────────────────────────────────────────
// Determinización: construcción de subconjuntos (AFND → AFD)
// ─────────────────────────────────────────────────────────────

const VACIO: ResultadoDeterminizacion = {
  ok: false,
  automata: { estados: [], transiciones: [] },
  alfabeto: [],
  filas: [],
  correspondencia: [],
  omitidoVacio: false,
};

export function determinizar(automata: AutomataMotor): ResultadoDeterminizacion {
  const { estados, transiciones } = automata;
  const inicial = estados.find((e) => e.esInicial);
  if (!inicial) {
    return { ...VACIO, error: 'El autómata no tiene estado inicial: no hay por dónde empezar.' };
  }
  const alfabeto = alfabetoDe(transiciones);
  if (alfabeto.length === 0) {
    return { ...VACIO, error: 'El autómata no tiene ninguna transición con símbolo: no hay nada que determinizar.' };
  }

  const etiquetaDe = new Map(estados.map((e) => [e.id, e.etiqueta]));
  const finales = new Set(estados.filter((e) => e.esFinal).map((e) => e.id));

  const arranque = epsilonClausura([inicial.id], transiciones);
  const porClave = new Map<string, { nombre: string; miembros: string[] }>();
  const registrar = (ids: string[]) => {
    const clave = claveConjunto(ids);
    if (!porClave.has(clave)) porClave.set(clave, { nombre: nombreConjunto(ids, etiquetaDe), miembros: [...ids] });
    return porClave.get(clave) as { nombre: string; miembros: string[] };
  };

  const inicio = registrar(arranque);
  const pendientes: string[][] = [arranque];
  const procesados = new Set<string>();
  const filas: FilaSubconjuntos[] = [];
  const transicionesAFD: TransicionMotor[] = [];
  let omitidoVacio = false;

  while (pendientes.length > 0) {
    const conjunto = pendientes.shift() as string[];
    const clave = claveConjunto(conjunto);
    if (procesados.has(clave)) continue;
    procesados.add(clave);
    const origen = registrar(conjunto);

    for (const simbolo of alfabeto) {
      const alcanzados = new Set<string>();
      for (const id of conjunto) {
        for (const t of transiciones) {
          if (t.from === id && t.simbolo === simbolo) alcanzados.add(t.to);
        }
      }
      // Sin destinos, la transición muere en el conjunto vacío. No se crea un estado
      // sumidero: la mayoría de manuales resuelve la tabla dejando el hueco, y añadirlo
      // metería en el resultado un estado que quien estudia no ha escrito en su papel.
      if (alcanzados.size === 0) {
        omitidoVacio = true;
        filas.push({ desde: origen.nombre, simbolo, hasta: null, nuevo: false });
        continue;
      }
      const destino = epsilonClausura([...alcanzados], transiciones);
      const claveDestino = claveConjunto(destino);
      const esNuevo = !porClave.has(claveDestino);
      const llegada = registrar(destino);
      filas.push({ desde: origen.nombre, simbolo, hasta: llegada.nombre, nuevo: esNuevo });
      transicionesAFD.push({ from: origen.nombre, to: llegada.nombre, simbolo });
      if (!procesados.has(claveDestino)) pendientes.push(destino);
    }
  }

  const conjuntos = [...porClave.values()];

  const correspondencia = conjuntos.map((c) => ({
    nombre: c.nombre,
    miembros: c.miembros.map((id) => etiquetaDe.get(id) ?? id).sort((a, b) => a.localeCompare(b, 'es')),
  }));

  const estadosAFD: EstadoMotor[] = conjuntos.map((c) => ({
    id: c.nombre,
    etiqueta: c.nombre,
    esInicial: c.nombre === inicio.nombre,
    // Un conjunto es final si contiene AL MENOS un estado final del original
    esFinal: c.miembros.some((id) => finales.has(id)),
  }));

  return {
    ok: true,
    automata: { estados: estadosAFD, transiciones: transicionesAFD },
    alfabeto,
    filas,
    correspondencia,
    omitidoVacio,
  };
}

// ─────────────────────────────────────────────────────────────
// Minimización: refinamiento de particiones (algoritmo de Moore)
// ─────────────────────────────────────────────────────────────

const VACIO_MIN: ResultadoMinimizacion = {
  ok: false,
  automata: { estados: [], transiciones: [] },
  alfabeto: [],
  rondas: [],
  inalcanzables: [],
  fusionados: [],
};

export function minimizar(automata: AutomataMotor): ResultadoMinimizacion {
  const { estados, transiciones } = automata;
  const inicial = estados.find((e) => e.esInicial);
  if (!inicial) {
    return { ...VACIO_MIN, error: 'El autómata no tiene estado inicial: no hay por dónde empezar.' };
  }
  if (transiciones.some((t) => t.simbolo === EPSILON)) {
    return { ...VACIO_MIN, error: 'Solo se minimiza un AFD, y este tiene transiciones ε. Determinízalo primero.' };
  }
  const alfabeto = alfabetoDe(transiciones);
  if (alfabeto.length === 0) {
    return { ...VACIO_MIN, error: 'El autómata no tiene ninguna transición con símbolo: no hay nada que minimizar.' };
  }
  // No determinista: dos transiciones con el mismo origen y símbolo
  const vistas = new Set<string>();
  for (const t of transiciones) {
    const k = `${t.from}|${t.simbolo}`;
    if (vistas.has(k)) {
      return { ...VACIO_MIN, error: 'Hay más de una transición con el mismo origen y símbolo: esto es un AFND. Determinízalo primero.' };
    }
    vistas.add(k);
  }

  const etiquetaDe = new Map(estados.map((e) => [e.id, e.etiqueta]));
  const etq = (id: string) => etiquetaDe.get(id) ?? id;

  // 1) Estados inalcanzables fuera: no cambian el lenguaje y ensucian las clases
  const alcanzables = new Set<string>([inicial.id]);
  const cola = [inicial.id];
  while (cola.length > 0) {
    const actual = cola.shift() as string;
    for (const t of transiciones) {
      if (t.from === actual && !alcanzables.has(t.to)) {
        alcanzables.add(t.to);
        cola.push(t.to);
      }
    }
  }
  const inalcanzables = estados.filter((e) => !alcanzables.has(e.id)).map((e) => etq(e.id)).sort((a, b) => a.localeCompare(b, 'es'));
  const vivos = estados.filter((e) => alcanzables.has(e.id));

  // 2) Partición inicial: finales frente a no finales
  const destino = new Map<string, string | undefined>();
  for (const t of transiciones) destino.set(`${t.from}|${t.simbolo}`, t.to);

  let clases: string[][] = [
    vivos.filter((e) => e.esFinal).map((e) => e.id),
    vivos.filter((e) => !e.esFinal).map((e) => e.id),
  ].filter((c) => c.length > 0);

  const rondas: RondaParticion[] = [];
  const comoEtiquetas = (cs: string[][]) =>
    cs.map((c) => c.map(etq).sort((a, b) => a.localeCompare(b, 'es')));

  rondas.push({
    numero: 0,
    clases: comoEtiquetas(clases),
    descripcion: 'Partición inicial: por un lado los estados finales y por otro los no finales.',
  });

  let ronda = 0;
  let cambiado = true;
  while (cambiado) {
    cambiado = false;
    ronda++;
    const claseDe = new Map<string, number>();
    clases.forEach((c, i) => c.forEach((id) => claseDe.set(id, i)));

    const nuevas: string[][] = [];
    for (const clase of clases) {
      // Dos estados siguen juntos solo si, para CADA símbolo, van a la misma clase.
      // Una transición ausente es también una firma: no es lo mismo que ir a algún sitio.
      const porFirma = new Map<string, string[]>();
      for (const id of clase) {
        const firma = alfabeto
          .map((s) => {
            const d = destino.get(`${id}|${s}`);
            return d === undefined ? '-' : String(claseDe.get(d) ?? '-');
          })
          .join(',');
        if (!porFirma.has(firma)) porFirma.set(firma, []);
        (porFirma.get(firma) as string[]).push(id);
      }
      if (porFirma.size > 1) cambiado = true;
      for (const grupo of porFirma.values()) nuevas.push(grupo);
    }

    if (cambiado) {
      clases = nuevas;
      rondas.push({
        numero: ronda,
        clases: comoEtiquetas(clases),
        descripcion: `Ronda ${ronda}: se separan los estados de una misma clase que, con algún símbolo, llevan a clases distintas.`,
      });
    }
  }

  rondas.push({
    numero: ronda,
    clases: comoEtiquetas(clases),
    descripcion: 'Ninguna clase se parte ya: cada clase es un estado del autómata mínimo.',
  });

  // 3) Construir el AFD mínimo. Cada clase es un estado.
  const nombreDeClase = clases.map((c) => `{${c.map(etq).sort((a, b) => a.localeCompare(b, 'es')).join(',')}}`);
  const indiceDe = new Map<string, number>();
  clases.forEach((c, i) => c.forEach((id) => indiceDe.set(id, i)));

  const estadosMin: EstadoMotor[] = clases.map((c, i) => ({
    id: nombreDeClase[i],
    etiqueta: nombreDeClase[i],
    esInicial: c.includes(inicial.id),
    esFinal: c.some((id) => vivos.find((e) => e.id === id)?.esFinal ?? false),
  }));

  const transicionesMin: TransicionMotor[] = [];
  const puestas = new Set<string>();
  clases.forEach((c, i) => {
    for (const simbolo of alfabeto) {
      const d = destino.get(`${c[0]}|${simbolo}`);
      if (d === undefined) continue;
      const j = indiceDe.get(d);
      if (j === undefined) continue;
      const clave = `${i}|${simbolo}`;
      if (puestas.has(clave)) continue;
      puestas.add(clave);
      transicionesMin.push({ from: nombreDeClase[i], to: nombreDeClase[j], simbolo });
    }
  });

  const fusionados = clases
    .filter((c) => c.length > 1)
    .map((c) => c.map(etq).sort((a, b) => a.localeCompare(b, 'es')));

  return {
    ok: true,
    automata: { estados: estadosMin, transiciones: transicionesMin },
    alfabeto,
    rondas,
    inalcanzables,
    fusionados,
  };
}
