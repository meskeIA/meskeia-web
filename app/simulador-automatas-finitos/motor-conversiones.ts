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
  /** true si al AFD le faltaba alguna transición y se completó con el estado trampa implícito ∅ */
  sumideroImplicito: boolean;
  /** Estados dibujados que resultaron equivalentes a ∅: estados trampa (no llevan a ningún final) */
  trampa: string[];
}

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Alfabeto real del autómata: los símbolos que aparecen, sin ε y en orden estable. */
export function alfabetoDe(transiciones: TransicionMotor[]): string[] {
  return [...new Set(transiciones.map((t) => t.simbolo).filter((s) => s !== EPSILON))].sort();
}

/**
 * El alfabeto que declara quien usa la app, a partir del texto del campo «a,b».
 *
 * ⚠️ 27/09/2026 (hallazgo 2296) — el campo existía, pero no intervenía en nada: se pintaba y ya.
 * Declarado Σ = {a, b}, la cadena «1» salía ACEPTADA en un autómata dibujado sobre {0, 1}. Desde
 * entonces el alfabeto manda: una cadena con un símbolo fuera de Σ no es una entrada válida, y
 * una transición con un símbolo fuera de Σ se avisa. ε no es un símbolo del alfabeto (es la
 * cadena vacía), así que se ignora si alguien lo escribe en el campo.
 */
export function alfabetoDeclarado(texto: string): string[] {
  return [
    ...new Set(
      texto
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '' && s !== EPSILON),
    ),
  ];
}

/** Un motivo por el que el autómata no es determinista. */
export interface ConflictoDeterminismo {
  /** 'epsilon': transición vacía · 'duplicado': varias transiciones con el mismo origen y símbolo */
  tipo: 'epsilon' | 'duplicado';
  from: string;
  simbolo: string;
  /** Destinos implicados (ids de estado), sin repetir */
  destinos: string[];
}

/**
 * Qué impide que el autómata sea un AFD: transiciones ε y parejas (estado, símbolo) con más de
 * un destino. Vacío si es determinista (parcial o total: que falte una transición no lo impide).
 *
 * ⚠️ 27/09/2026 (hallazgo 2291) — en modo DFA el recorrido tomaba con `find` la PRIMERA
 * transición que casaba, así que el veredicto de un AFND dependía del orden en que se habían
 * dibujado las flechas («01» salía rechazada en «Contiene 01»). `minimizar` ya lo detectaba; el
 * recorrido y la vista, no.
 */
export function conflictosDeterminismo(transiciones: TransicionMotor[]): ConflictoDeterminismo[] {
  const conflictos: ConflictoDeterminismo[] = [];
  const porPareja = new Map<string, { from: string; simbolo: string; destinos: string[] }>();
  const conEpsilon = new Map<string, string[]>();
  for (const t of transiciones) {
    if (t.simbolo === EPSILON) {
      const lista = conEpsilon.get(t.from) ?? [];
      if (!lista.includes(t.to)) lista.push(t.to);
      conEpsilon.set(t.from, lista);
      continue;
    }
    const clave = `${t.from}|${t.simbolo}`;
    const par = porPareja.get(clave) ?? { from: t.from, simbolo: t.simbolo, destinos: [] };
    par.destinos.push(t.to);
    porPareja.set(clave, par);
  }
  for (const [from, destinos] of conEpsilon) {
    conflictos.push({ tipo: 'epsilon', from, simbolo: EPSILON, destinos });
  }
  for (const par of porPareja.values()) {
    // Dos flechas iguales (mismo origen, símbolo y destino) no son no determinismo: son una.
    const distintos = [...new Set(par.destinos)];
    if (distintos.length > 1) conflictos.push({ tipo: 'duplicado', from: par.from, simbolo: par.simbolo, destinos: distintos });
  }
  return conflictos;
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
  sumideroImplicito: false,
  trampa: [],
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
  // No determinista: dos transiciones con el mismo origen y símbolo hacia destinos DISTINTOS.
  //
  // ⚠️ 30/09/2026 (hallazgo 2472) — aquí se miraba solo origen|símbolo, así que una flecha
  // repetida idéntica (q0 -0→ q1 dibujada dos veces) hacía rechazar como AFND un AFD que la
  // validación y el aviso de la vista trataban, con razón, como determinista. Dos flechas
  // iguales no son no determinismo: son una. Se decide con el MISMO criterio que la vista,
  // `conflictosDeterminismo`, para que las dos no vuelvan a discrepar (las ε ya se han
  // rechazado arriba, así que aquí solo quedan los duplicados).
  if (conflictosDeterminismo(transiciones).some((c) => c.tipo === 'duplicado')) {
    return { ...VACIO_MIN, error: 'Hay más de una transición con el mismo origen y símbolo: esto es un AFND. Determinízalo primero.' };
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

  // 2) El AFD se completa con un estado trampa IMPLÍCITO, ∅, antes de particionar.
  //
  // ⚠️ 27/09/2026 (hallazgo 2290) — antes una transición ausente firmaba como «-» y una que
  // iba a un estado trampa dibujado firmaba con la clase de ese estado, así que no se
  // reconocían como lo que son, el mismo lenguaje vacío. En un AFD parcial con un estado
  // trampa (lo que la propia guía de la app aconseja dibujar) q1 ≡ q2 no se fusionaban y el
  // resumen decía «ya era mínimo». Completar con ∅ —no final, y de él no se sale— hace que
  // ∅ y cualquier estado muerto (desde el que no se llega a un final) caigan en la misma
  // clase, que es justo lo que dice la teoría.
  const destino = new Map<string, string>();
  for (const t of transiciones) destino.set(`${t.from}|${t.simbolo}`, t.to);

  const SUMIDERO = '\u0000∅';
  const parcial = vivos.some((e) => alfabeto.some((s) => !destino.has(`${e.id}|${s}`)));
  const destinoDe = (id: string, s: string): string =>
    id === SUMIDERO ? SUMIDERO : (destino.get(`${id}|${s}`) ?? SUMIDERO);
  const etqClase = (id: string) => (id === SUMIDERO ? '∅' : etq(id));
  const esFinalDe = new Map<string, boolean>(vivos.map((e) => [e.id, e.esFinal]));

  let clases: string[][] = [
    vivos.filter((e) => e.esFinal).map((e) => e.id),
    [...vivos.filter((e) => !e.esFinal).map((e) => e.id), ...(parcial ? [SUMIDERO] : [])],
  ].filter((c) => c.length > 0);

  const rondas: RondaParticion[] = [];
  const ordenar = (xs: string[]) => [...xs].sort((a, b) => a.localeCompare(b, 'es'));
  const comoEtiquetas = (cs: string[][]) => cs.map((c) => ordenar(c.map(etqClase)));

  rondas.push({
    numero: 0,
    clases: comoEtiquetas(clases),
    descripcion: parcial
      ? 'Partición inicial: por un lado los estados finales y por otro los no finales. Las transiciones que faltan van a un estado trampa implícito, ∅ (no final, y de él no se sale), que entra con los no finales.'
      : 'Partición inicial: por un lado los estados finales y por otro los no finales.',
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
      // Dos estados siguen juntos solo si, para CADA símbolo, van a la misma clase. Con el
      // AFD ya completado, no ir a ningún sitio es ir a ∅, y se firma con la clase de ∅.
      const porFirma = new Map<string, string[]>();
      for (const id of clase) {
        const firma = alfabeto.map((s) => String(claseDe.get(destinoDe(id, s)))).join(',');
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

  // 3) Construir el AFD mínimo. Cada clase es un estado, salvo la del ∅ implícito cuando no
  //    tiene ningún estado dibujado: esa se omite, igual que `determinizar` omite el conjunto
  //    vacío, y las transiciones que llevaban a ella siguen sin dibujarse. Si la clase de ∅ SÍ
  //    contiene estados dibujados (estados trampa), se conserva con ellos, y en el mínimo las
  //    transiciones que faltaban van a ella: es el mismo lenguaje, y el AFD queda completo.
  const indiceSumidero = clases.findIndex((c) => c.includes(SUMIDERO));
  const reales = clases.map((c) => c.filter((id) => id !== SUMIDERO));
  const trampa = indiceSumidero === -1 ? [] : ordenar(reales[indiceSumidero].map(etq));
  const omitida = indiceSumidero !== -1 && reales[indiceSumidero].length === 0 ? indiceSumidero : -1;

  const nombreDeClase = reales.map((c) => `{${ordenar(c.map(etq)).join(',')}}`);
  const indiceDe = new Map<string, number>();
  clases.forEach((c, i) => c.forEach((id) => indiceDe.set(id, i)));

  const estadosMin: EstadoMotor[] = [];
  reales.forEach((c, i) => {
    if (i === omitida) return;
    estadosMin.push({
      id: nombreDeClase[i],
      etiqueta: nombreDeClase[i],
      esInicial: c.includes(inicial.id),
      esFinal: c.some((id) => esFinalDe.get(id) ?? false),
    });
  });

  const transicionesMin: TransicionMotor[] = [];
  reales.forEach((c, i) => {
    if (i === omitida) return;
    // Todos los de una clase van a la misma clase con cada símbolo: basta un representante.
    const representante = c[0];
    for (const simbolo of alfabeto) {
      const j = indiceDe.get(destinoDe(representante, simbolo));
      if (j === undefined || j === omitida) continue;
      transicionesMin.push({ from: nombreDeClase[i], to: nombreDeClase[j], simbolo });
    }
  });

  const fusionados = reales.filter((c) => c.length > 1).map((c) => ordenar(c.map(etq)));

  return {
    ok: true,
    automata: { estados: estadosMin, transiciones: transicionesMin },
    alfabeto,
    rondas,
    inalcanzables,
    fusionados,
    sumideroImplicito: parcial,
    trampa,
  };
}

// ─────────────────────────────────────────────────────────────
// Recorrido de una cadena (simulación)
//
// Estaba duplicado: `page.tsx` tenía su propia copia de `epsilonClausura` y aquí había
// otra, así que la app podía recorrer una cadena con un convenio y los casos de clase
// corregirla con otro. Se subió aquí el 15/09/2026 para que haya UNA sola simulación:
// la vista, el lote de cadenas y la corrección de los casos llaman a estas mismas
// funciones. Si divergieran, la app suspendería una respuesta que ella misma produce.
// ─────────────────────────────────────────────────────────────

/** Cómo se recorre la cadena: un AFD sigue UNA rama, un AFND sigue todas a la vez. */
export type TipoAuto = 'dfa' | 'nfa';

/** Una fotografía del recorrido tras leer un símbolo. La vista la pinta paso a paso. */
export interface PasoValidacion {
  posicion: number;
  simbolo: string;
  estadosActivos: string[];
  descripcion: string;
}

export type ResultadoValidacion =
  | 'aceptada'
  | 'rechazada'
  | 'sin-transicion'
  | 'fuera-alfabeto'
  | 'pendiente';

/**
 * Cómo se recorre de verdad. Un autómata marcado como AFD que no es determinista se recorre
 * como AFND —siguiendo todas las ramas— y la vista lo avisa: tomar la primera flecha que casa
 * daba un veredicto que dependía del orden en que se dibujaron (hallazgo 2291).
 */
export function tipoDeRecorrido(tipo: TipoAuto, transiciones: TransicionMotor[]): TipoAuto {
  return tipo === 'dfa' && conflictosDeterminismo(transiciones).length > 0 ? 'nfa' : tipo;
}

/**
 * Recorre la cadena y devuelve el rastro completo más el veredicto.
 *
 * Nunca lanza: sin estado inicial devuelve un paso que lo dice y 'rechazada', porque un
 * `throw` en pleno render tumbaría la app entera.
 *
 * `alfabeto` es el declarado (ver `alfabetoDeclarado`). Si llega y no está vacío, una cadena
 * con algún símbolo fuera de él no es una entrada del autómata: se detiene en ese símbolo con
 * el veredicto 'fuera-alfabeto', sin recorrer nada (hallazgo 2296). Sin él no se comprueba,
 * que es lo que necesitan los casos de clase: su alfabeto es el de sus transiciones.
 */
export function generarPasosValidacion(
  cadena: string,
  tipoDeclarado: TipoAuto,
  estados: EstadoMotor[],
  transiciones: TransicionMotor[],
  alfabeto?: string[],
): { pasos: PasoValidacion[]; resultado: ResultadoValidacion } {
  const tipo = tipoDeRecorrido(tipoDeclarado, transiciones);
  const inicial = estados.find((e) => e.esInicial);
  if (!inicial) {
    return {
      pasos: [
        {
          posicion: -1,
          simbolo: '',
          estadosActivos: [],
          descripcion: 'No hay estado inicial definido',
        },
      ],
      resultado: 'rechazada',
    };
  }

  const pasos: PasoValidacion[] = [];
  let activos: string[];

  // La traza nombra cada estado por su ETIQUETA, la que se ve en el lienzo; `estadosActivos`
  // sigue llevando ids, que es lo que usa la vista para resaltar.
  //
  // ⚠️ 30/09/2026 (hallazgo 2473) — escribía el id. En lo dibujado a mano id y etiqueta
  // coinciden (q0, q1…), pero un AFD cargado desde «Determinizar» o «Minimizar» tiene ids s0,
  // s1… y etiquetas {q0,q1,q2}: la traza decía «Lee "b" → s1», un nombre que no aparece en
  // ninguna parte de la pantalla, y el anunciador del paso es lo único que llega a quien no ve
  // el lienzo.
  const etiquetaDe = new Map(estados.map((e) => [e.id, e.etiqueta]));
  const nombres = (ids: string[]): string => ids.map((id) => etiquetaDe.get(id) ?? id).join(', ');

  if (alfabeto && alfabeto.length > 0) {
    const permitidos = new Set(alfabeto);
    const i = Array.from(cadena).findIndex((c) => !permitidos.has(c));
    if (i !== -1) {
      const simbolo = Array.from(cadena)[i];
      pasos.push({
        posicion: 0,
        simbolo: '',
        estadosActivos: [inicial.id],
        descripcion: `Estado inicial: ${nombres([inicial.id])}`,
      });
      pasos.push({
        posicion: i + 1,
        simbolo,
        estadosActivos: [],
        descripcion: `"${simbolo}" no pertenece al alfabeto declarado {${alfabeto.join(', ')}}: la cadena no es una entrada válida`,
      });
      return { pasos, resultado: 'fuera-alfabeto' };
    }
  }

  if (tipo === 'nfa') {
    activos = epsilonClausura([inicial.id], transiciones);
  } else {
    activos = [inicial.id];
  }

  pasos.push({
    posicion: 0,
    simbolo: '',
    estadosActivos: [...activos],
    descripcion:
      tipo !== tipoDeclarado
        ? `No es determinista: se siguen todas las ramas a la vez, como en un AFND. Estado(s) inicial(es): ${nombres(activos)}`
        : `Estado(s) inicial(es): ${nombres(activos)}`,
  });

  for (let i = 0; i < cadena.length; i++) {
    const simbolo = cadena[i];
    let siguientes: string[] = [];

    if (tipo === 'dfa') {
      const t = transiciones.find(
        (tr) => tr.from === activos[0] && tr.simbolo === simbolo,
      );
      if (!t) {
        pasos.push({
          posicion: i + 1,
          simbolo,
          estadosActivos: [],
          descripcion: `Sin transición desde ${nombres([activos[0]])} con "${simbolo}"`,
        });
        return { pasos, resultado: 'sin-transicion' };
      }
      siguientes = [t.to];
    } else {
      const conjunto = new Set<string>();
      for (const id of activos) {
        for (const t of transiciones) {
          if (t.from === id && t.simbolo === simbolo) {
            conjunto.add(t.to);
          }
        }
      }
      siguientes = epsilonClausura([...conjunto], transiciones);
    }

    if (siguientes.length === 0) {
      pasos.push({
        posicion: i + 1,
        simbolo,
        estadosActivos: [],
        descripcion: `Sin transición disponible con "${simbolo}"`,
      });
      return { pasos, resultado: 'sin-transicion' };
    }

    activos = siguientes;
    pasos.push({
      posicion: i + 1,
      simbolo,
      estadosActivos: [...activos],
      descripcion: `Lee "${simbolo}" → ${nombres(activos)}`,
    });
  }

  // ¿Algún estado activo es final?
  const finales = new Set(estados.filter((e) => e.esFinal).map((e) => e.id));
  const aceptada = activos.some((id) => finales.has(id));

  return { pasos, resultado: aceptada ? 'aceptada' : 'rechazada' };
}

/** Solo el veredicto, sin el rastro. Lo usan el lote de cadenas y los casos de clase. */
export function validarRapido(
  cadena: string,
  tipo: TipoAuto,
  estados: EstadoMotor[],
  transiciones: TransicionMotor[],
  alfabeto?: string[],
): ResultadoValidacion {
  const { resultado } = generarPasosValidacion(cadena, tipo, estados, transiciones, alfabeto);
  return resultado;
}
