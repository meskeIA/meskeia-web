/**
 * Motor del autómata a pila (AFP / PDA) — aparte de la vista y sin dependencias de React.
 *
 * Un autómata a pila es no determinista por naturaleza: para una misma configuración puede
 * haber varias transiciones aplicables, y aceptar significa que EXISTE al menos un camino
 * que llega al final. Por eso aquí no se «ejecuta» el autómata, se EXPLORA su árbol de
 * configuraciones en anchura, y lo que se devuelve es el camino aceptante si lo hay.
 *
 * Los casos están resueltos a mano en tests/automata-pila-motor.spec.ts. Un explorador con
 * un fallo sutil (no restaurar la pila al desapilar, olvidar las transiciones ε) acepta
 * lenguajes que no debería y en pantalla no se distingue de uno correcto.
 */

/** Símbolo vacío, tanto en la entrada como en la pila. */
export const EPSILON = 'ε';

/** Marca de fondo de pila, la que casi todos los libros llaman Z₀. */
export const FONDO = 'Z';

export type CriterioAceptacion = 'estado-final' | 'pila-vacia';

export interface TransicionPila {
  id: string;
  desde: string;
  /** Símbolo de entrada que consume, o ε si no consume nada */
  entrada: string;
  /** Símbolo que debe estar en la cima para poder aplicarse */
  cima: string;
  hasta: string;
  /**
   * Lo que se apila en lugar de la cima, con el primer carácter como nueva cima.
   * «ε» significa desapilar sin poner nada.
   */
  apila: string;
}

export interface EstadoPila {
  id: string;
  esInicial: boolean;
  esFinal: boolean;
}

export interface AutomataPila {
  estados: EstadoPila[];
  transiciones: TransicionPila[];
}

/** Una configuración instantánea: dónde estoy, qué me queda por leer y cómo está la pila. */
export interface Configuracion {
  estado: string;
  /** Lo que queda de cadena por consumir */
  resto: string;
  /** Pila con la CIMA A LA IZQUIERDA, que es como se lee en clase */
  pila: string;
  /** Transición que trajo hasta aquí, para poder narrar el camino */
  porTransicion: TransicionPila | null;
  descripcion: string;
}

export interface ResultadoSimulacion {
  ok: boolean;
  error?: string;
  aceptada: boolean;
  /** El camino que acepta, o el más largo explorado si no acepta */
  camino: Configuracion[];
  /** Configuraciones distintas visitadas: mide cuánto se ha ramificado */
  visitadas: number;
  /** true si se alcanzó el tope de exploración y la respuesta NO es concluyente */
  truncada: boolean;
  motivo: string;
}

/** Tope de configuraciones exploradas. Sin él, un ciclo de ε cuelga el navegador. */
export const MAX_CONFIGURACIONES = 20000;

const claveDe = (c: { estado: string; resto: string; pila: string }) => `${c.estado}|${c.resto}|${c.pila}`;

const pilaLegible = (pila: string) => (pila === '' ? '(vacía)' : pila);

/**
 * Aplica una transición a una configuración, si es aplicable.
 * Devuelve null cuando no lo es, que es lo normal en la mayoría de combinaciones.
 */
function aplicar(config: Configuracion, t: TransicionPila): Configuracion | null {
  if (t.desde !== config.estado) return null;

  // El símbolo de entrada: o coincide con el siguiente carácter, o es ε y no consume
  const consume = t.entrada !== EPSILON;
  if (consume && config.resto[0] !== t.entrada) return null;

  // La cima: o coincide, o la transición no mira la pila (ε) y entonces no la toca
  const miraPila = t.cima !== EPSILON;
  if (miraPila && config.pila[0] !== t.cima) return null;

  const restoNuevo = consume ? config.resto.slice(1) : config.resto;
  const sinCima = miraPila ? config.pila.slice(1) : config.pila;
  const aApilar = t.apila === EPSILON ? '' : t.apila;
  const pilaNueva = aApilar + sinCima;

  const trozos: string[] = [];
  trozos.push(consume ? `lee «${t.entrada}»` : 'sin leer nada (ε)');
  if (miraPila) {
    trozos.push(aApilar === '' ? `desapila «${t.cima}»` : `cambia la cima «${t.cima}» por «${aApilar}»`);
  } else if (aApilar !== '') {
    trozos.push(`apila «${aApilar}»`);
  } else {
    trozos.push('no toca la pila');
  }

  return {
    estado: t.hasta,
    resto: restoNuevo,
    pila: pilaNueva,
    porTransicion: t,
    descripcion: `${config.estado} → ${t.hasta}: ${trozos.join(', ')}. Pila: ${pilaLegible(pilaNueva)}`,
  };
}

function esAceptante(config: Configuracion, automata: AutomataPila, criterio: CriterioAceptacion): boolean {
  if (config.resto !== '') return false;
  if (criterio === 'pila-vacia') return config.pila === '';
  return automata.estados.some((e) => e.id === config.estado && e.esFinal);
}

/**
 * Explora en ANCHURA el árbol de configuraciones. En anchura y no en profundidad a
 * propósito: con transiciones ε, la profundidad se va por una rama infinita y nunca
 * vuelve, mientras que la anchura encuentra el camino aceptante MÁS CORTO, que además
 * es el que se quiere enseñar.
 */
export function simular(
  automata: AutomataPila,
  cadena: string,
  criterio: CriterioAceptacion,
  simboloFondo: string = FONDO,
): ResultadoSimulacion {
  const inicial = automata.estados.find((e) => e.esInicial);
  const base: ResultadoSimulacion = {
    ok: false,
    aceptada: false,
    camino: [],
    visitadas: 0,
    truncada: false,
    motivo: '',
  };
  if (!inicial) return { ...base, error: 'El autómata no tiene estado inicial.' };
  if (criterio === 'estado-final' && !automata.estados.some((e) => e.esFinal)) {
    return { ...base, error: 'No hay ningún estado final, y el criterio elegido es aceptar por estado final.' };
  }

  const arranque: Configuracion = {
    estado: inicial.id,
    resto: cadena,
    pila: simboloFondo,
    porTransicion: null,
    descripcion: `Configuración inicial: estado ${inicial.id}, entrada «${cadena === '' ? 'ε' : cadena}», pila ${pilaLegible(simboloFondo)}`,
  };

  const cola: Configuracion[][] = [[arranque]];
  const vistas = new Set<string>([claveDe(arranque)]);
  let visitadas = 0;
  let masLargo: Configuracion[] = [arranque];

  while (cola.length > 0) {
    if (visitadas >= MAX_CONFIGURACIONES) {
      return {
        ok: true,
        aceptada: false,
        camino: masLargo,
        visitadas,
        truncada: true,
        motivo: `Exploración detenida en ${MAX_CONFIGURACIONES} configuraciones. La respuesta NO es concluyente: puede haber un ciclo de transiciones ε que no consume entrada.`,
      };
    }
    const camino = cola.shift() as Configuracion[];
    const actual = camino[camino.length - 1];
    visitadas++;
    if (camino.length > masLargo.length) masLargo = camino;

    if (esAceptante(actual, automata, criterio)) {
      return {
        ok: true,
        aceptada: true,
        camino,
        visitadas,
        truncada: false,
        motivo:
          criterio === 'pila-vacia'
            ? 'Se ha consumido toda la entrada y la pila ha quedado vacía.'
            : `Se ha consumido toda la entrada y ${actual.estado} es un estado final.`,
      };
    }

    for (const t of automata.transiciones) {
      const siguiente = aplicar(actual, t);
      if (!siguiente) continue;
      const k = claveDe(siguiente);
      if (vistas.has(k)) continue;
      vistas.add(k);
      cola.push([...camino, siguiente]);
    }
  }

  return {
    ok: true,
    aceptada: false,
    camino: masLargo,
    visitadas,
    truncada: false,
    motivo:
      'Se han agotado todos los caminos posibles sin que ninguno acepte la cadena. En un autómata no determinista eso sí es una respuesta firme: no basta con que falle un camino, tienen que fallar todos.',
  };
}

/** Comprobaciones de forma antes de simular, para avisar en vez de dar un rechazo engañoso. */
export function revisarAutomata(automata: AutomataPila): string[] {
  const avisos: string[] = [];
  const iniciales = automata.estados.filter((e) => e.esInicial);
  if (iniciales.length === 0) avisos.push('No hay estado inicial: no hay por dónde empezar.');
  if (iniciales.length > 1) avisos.push('Hay más de un estado inicial; se usará el primero.');
  if (automata.transiciones.length === 0) avisos.push('El autómata no tiene ninguna transición.');

  const ids = new Set(automata.estados.map((e) => e.id));
  for (const t of automata.transiciones) {
    if (!ids.has(t.desde) || !ids.has(t.hasta)) {
      avisos.push(`La transición ${t.desde} → ${t.hasta} apunta a un estado que no existe.`);
    }
  }
  return avisos;
}
