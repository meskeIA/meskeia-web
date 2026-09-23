/**
 * Casos para clase del Simulador de Ecosistema — tarea de tipo C: PREDICCIÓN ANTES DE MOVER.
 *
 * El alumno se compromete con una predicción («¿qué les pasa a los productores si se caza a
 * los carnívoros?») ANTES de tocar el simulador, y solo después lo carga y ve la cascada.
 * Ese compromiso previo es todo el valor pedagógico: mover un deslizador y mirar unas barras
 * no enseña nada si no había una hipótesis que confirmar o romper.
 *
 * Vive fuera de la vista porque el build compila la página sin comprobar si la ecología está
 * bien. Y NO calcula nada por su cuenta: la respuesta de cada caso sale de ejecutar
 * `aplicarEvento`, el MISMO motor (`motor.ts`) con el que el simulador pinta sus barras. Si
 * no hubiera una sola implementación, la app podría suspender una predicción que ella misma
 * enseña en pantalla.
 *
 * EL CONVENIO DE ESTA APP (lo que decide qué respuesta es la correcta)
 * ────────────────────────────────────────────────────────────────────
 * 1. SE EVALÚA LO QUE SE VE, NO EL MODELO. La app pinta `Math.round(poblacion)`, así que la
 *    dirección correcta es el signo de `Math.round(nuevo) − original`. En unas pocas
 *    combinaciones el modelo cambia y la pantalla no (bosque + sequía al 50 %: los
 *    superdepredadores van de 4 a 3,59, que se pinta «4»). Un caso así pediría «baja» y el
 *    alumno, al cargarlo, vería que no cambia: `escenarioSinTrampaDeRedondeo` los descarta,
 *    en los doce fijos y en el modo práctica.
 * 2. SOLO INTENSIDADES DE 0,5 Y 0,7. Con la caza al 100 % los carnívoros tocan el suelo de 5
 *    en los cuatro ecosistemas y la cascada deja de ser la del mecanismo: se recorta.
 * 3. LOS PORCENTAJES SON LOS DEL PANEL «¿Qué está pasando?»: `Math.round(|nuevo − viejo| /
 *    viejo × 100)` sobre la población SIN redondear, que es exactamente lo que imprime la app.
 *    Una comparación solo vale si los dos niveles difieren en 2 puntos o más y si, calculado
 *    con las cifras enteras de las barras, el orden sale igual.
 * 4. EL ECOSISTEMA NO CAMBIA LOS PORCENTAJES (las poblaciones de partida son proporcionales),
 *    así que nunca se pregunta «¿en qué ecosistema cae más…?».
 * 5. NADA DE MAGNITUDES CON LA CONTAMINACIÓN: su descripción dice que diezma a productores y
 *    herbívoros, pero el modelo solo golpea directamente a los productores. La DIRECCIÓN sale
 *    igual por los dos caminos; la magnitud no.
 *
 * «No cambia» nunca es correcta con intensidad > 0 en este modelo, pero se ofrece siempre como
 * opción: es el error típico («los productores no se enteran de que se caza a los
 * carnívoros»), y quitarla regalaría la mitad de la respuesta.
 *
 * Los 12 casos son DETERMINISTAS y universales: el caso 3 es el mismo para todo el mundo, hoy
 * y dentro de un año. Es lo único que hace que «haz los casos 3, 7 y 11» funcione en clase.
 *
 * Nada lanza excepciones: un dato inválido sale como `{ ok: false, error }`.
 */

import { formatNumber } from '@/lib';
import {
  ATENUACION,
  ECOSISTEMAS,
  EVENTOS,
  aplicarEvento,
  type Ecosistema,
  type Evento,
  type TipoEvento,
} from './motor';

// ============================================================
// TIPOS
// ============================================================

/** 0 = productores · 1 = herbívoros · 2 = carnívoros · 3 = superdepredadores. */
export type IndiceNivel = 0 | 1 | 2 | 3;

/** Las perturbaciones sobre las que se pregunta: todas menos «sin perturbación». */
export type PerturbacionCaso = Exclude<TipoEvento, 'ninguno'>;

export type RespuestaDireccion = 'sube' | 'baja' | 'no-cambia';
export type RespuestaComparacion = 'a' | 'b' | 'igual';
export type Respuesta = RespuestaDireccion | RespuestaComparacion;

interface DatosComunes {
  ecosistemaId: string;
  eventoId: PerturbacionCaso;
  /** Solo 0,5 o 0,7 (ver el convenio, punto 2). */
  intensidad: number;
}

/** «¿Qué le pasa a este nivel?» */
export interface DatosDireccion extends DatosComunes {
  clase: 'direccion';
  nivel: IndiceNivel;
}

/** «¿Qué nivel cambia más, en porcentaje: A o B?» */
export interface DatosComparacion extends DatosComunes {
  clase: 'comparacion';
  nivelA: IndiceNivel;
  nivelB: IndiceNivel;
}

export type DatosCaso = DatosDireccion | DatosComparacion;

export interface OpcionRespuesta {
  valor: Respuesta;
  texto: string;
}

/** Lo que se pregunta y cómo se corrige, igual para un caso fijo y para uno de práctica. */
export interface Pregunta {
  enunciado: string;
  /** El rótulo del grupo de opciones (la `legend`). Nunca vacío. */
  etiquetaRespuesta: string;
  /** Siempre tres, siempre en el mismo orden. */
  opciones: readonly OpcionRespuesta[];
  /** Calculada ejecutando el motor. `null` solo si los datos no son válidos. */
  respuesta: Respuesta | null;
  respuestaTexto: string;
  /** Aquí los «pasos» son la explicación del MECANISMO, con las cifras que pinta la app. */
  pasos: readonly string[];
}

export interface CasoAula extends Pregunta {
  id: number;
  titulo: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  pista: string;
}

export interface Ejercicio extends Pregunta {
  semilla: number;
  datos: DatosDireccion;
}

export interface Escenario {
  ok: boolean;
  /** Poblaciones de partida (enteras en los cuatro ecosistemas). */
  antes: readonly number[];
  /** Lo que devuelve el modelo, sin redondear. */
  modelo: readonly number[];
  /** Lo que pinta la app: `Math.round` de lo anterior. */
  visibles: readonly number[];
  /** Los porcentajes del panel «¿Qué está pasando?». */
  porcentajes: readonly number[];
  error: string | null;
}

export interface ResultadoCaso {
  ok: boolean;
  respuesta: Respuesta | null;
  antes: readonly number[];
  despues: readonly number[];
  porcentajes: readonly number[];
  pasos: readonly string[];
  error: string | null;
}

export interface Comprobacion {
  correcto: boolean;
  motivo: 'acierto' | 'fallo' | 'vacia' | 'no-disponible';
}

// ============================================================
// CONSTANTES DEL CONVENIO
// ============================================================

/** Las únicas intensidades con las que se pregunta (ver el convenio, punto 2). */
export const INTENSIDADES_CASO: readonly number[] = [0.5, 0.7];

/** Puntos de porcentaje que deben separar a dos niveles para que una comparación valga. */
export const DIFERENCIA_MINIMA_PUNTOS = 2;

export const OPCIONES_DIRECCION: readonly OpcionRespuesta[] = [
  { valor: 'sube', texto: 'Sube' },
  { valor: 'baja', texto: 'Baja' },
  { valor: 'no-cambia', texto: 'No cambia' },
];

// ============================================================
// UTILIDADES
// ============================================================

function ecosistemaDe(id: string): Ecosistema | null {
  return ECOSISTEMAS.find(e => e.id === id) ?? null;
}

function eventoDe(id: TipoEvento): Evento | null {
  return EVENTOS.find(e => e.id === id) ?? null;
}

function esIntensidadDeCaso(intensidad: number): boolean {
  return INTENSIDADES_CASO.some(k => Math.abs(k - intensidad) < 1e-9);
}

function entero(valor: number): string {
  return formatNumber(valor, 0);
}

/** Nombre del nivel en minúscula, tal como lo rotula el ecosistema. */
function nombreNivel(ecosistema: Ecosistema, nivel: IndiceNivel): string {
  return ecosistema.niveles[nivel].nombre.toLowerCase();
}

/** Mismo cálculo que `generarExplicacion` en page.tsx: el porcentaje que ve el alumno. */
function porcentajeDelPanel(nuevo: number, viejo: number): number {
  return Math.round(Math.abs((nuevo - viejo) / viejo * 100));
}

function signo(valor: number): -1 | 0 | 1 {
  return valor > 0 ? 1 : valor < 0 ? -1 : 0;
}

function primeraMinuscula(texto: string): string {
  return texto.length === 0 ? texto : texto.charAt(0).toLowerCase() + texto.slice(1);
}

// ============================================================
// EJECUTAR EL MODELO
// ============================================================

/**
 * Ejecuta `aplicarEvento` —el mismo que usa el simulador— y devuelve el escenario en las tres
 * formas que importan: el modelo, lo que se pinta y los porcentajes del panel.
 */
export function simularEscenario(
  ecosistemaId: string,
  eventoId: PerturbacionCaso,
  intensidad: number
): Escenario {
  const fallo = (error: string): Escenario => ({
    ok: false,
    antes: [],
    modelo: [],
    visibles: [],
    porcentajes: [],
    error,
  });
  const ecosistema = ecosistemaDe(ecosistemaId);
  if (ecosistema === null) return fallo('Ese ecosistema no existe');
  const evento = eventoDe(eventoId);
  if (evento === null || evento.id === 'ninguno') return fallo('Esa perturbación no existe');
  if (!Number.isFinite(intensidad)) return fallo('La intensidad no es un número');

  const niveles = aplicarEvento(ecosistema.niveles, evento, intensidad);
  const antes = ecosistema.niveles.map(n => n.poblacion);
  const modelo = niveles.map(n => n.poblacion);
  if (modelo.some(v => !Number.isFinite(v))) return fallo('El modelo no devolvió un número');
  return {
    ok: true,
    antes,
    modelo,
    visibles: modelo.map(v => Math.round(v)),
    porcentajes: modelo.map((v, i) => porcentajeDelPanel(v, antes[i])),
    error: null,
  };
}

/**
 * La dirección que VE el alumno en un nivel: signo de `Math.round(nuevo) − original`.
 * Es la que se corrige (convenio, punto 1).
 */
export function direccionVisible(original: number, nuevo: number): RespuestaDireccion {
  const s = signo(Math.round(nuevo) - original);
  return s > 0 ? 'sube' : s < 0 ? 'baja' : 'no-cambia';
}

/**
 * TRAMPA 1 — ¿el redondeo de la pantalla esconde algún cambio del modelo?
 *
 * Devuelve `true` solo si, en LOS CUATRO niveles, el signo del cambio del modelo coincide con
 * el del cambio que se pinta. Se exige en los cuatro y no solo en el nivel preguntado porque
 * la explicación del mecanismo recorre la cadena con las cifras visibles, y una cifra que «no
 * cambia» a mitad de la cascada rompería el razonamiento que se enseña.
 */
export function escenarioSinTrampaDeRedondeo(
  ecosistemaId: string,
  eventoId: PerturbacionCaso,
  intensidad: number
): boolean {
  const escenario = simularEscenario(ecosistemaId, eventoId, intensidad);
  if (!escenario.ok) return false;
  return escenario.modelo.every(
    (v, i) => signo(v - escenario.antes[i]) === signo(escenario.visibles[i] - escenario.antes[i])
  );
}

/**
 * ¿Una comparación entre dos niveles tiene respuesta inequívoca? Exige que los porcentajes del
 * panel difieran en `DIFERENCIA_MINIMA_PUNTOS` o más y que, calculados con las cifras enteras
 * de las barras, den el MISMO orden: así no se puede acertar mirando una vista y fallar por la
 * otra.
 */
export function comparacionDiscrimina(escenario: Escenario, a: IndiceNivel, b: IndiceNivel): boolean {
  if (!escenario.ok || a === b) return false;
  const pa = escenario.porcentajes[a];
  const pb = escenario.porcentajes[b];
  if (Math.abs(pa - pb) < DIFERENCIA_MINIMA_PUNTOS) return false;
  const va = Math.abs(escenario.visibles[a] - escenario.antes[a]) / escenario.antes[a];
  const vb = Math.abs(escenario.visibles[b] - escenario.antes[b]) / escenario.antes[b];
  return signo(pa - pb) === signo(va - vb);
}

/** Por qué unos datos no sirven para un caso, o `null` si sirven. */
export function motivoDatosInvalidos(datos: DatosCaso): string | null {
  if (ecosistemaDe(datos.ecosistemaId) === null) return 'Ese ecosistema no existe';
  const evento = eventoDe(datos.eventoId);
  if (evento === null || evento.id === 'ninguno') return 'Esa perturbación no existe';
  if (!esIntensidadDeCaso(datos.intensidad)) return 'Los casos solo usan intensidades del 50 % y del 70 %';
  if (!escenarioSinTrampaDeRedondeo(datos.ecosistemaId, datos.eventoId, datos.intensidad))
    return 'En este escenario el redondeo de la pantalla esconde un cambio del modelo';
  if (datos.clase === 'comparacion') {
    if (datos.eventoId === 'contaminacion')
      return 'Con la contaminación no se comparan magnitudes: el modelo solo golpea a los productores';
    const escenario = simularEscenario(datos.ecosistemaId, datos.eventoId, datos.intensidad);
    if (!comparacionDiscrimina(escenario, datos.nivelA, datos.nivelB))
      return 'Los dos niveles cambian casi lo mismo: la comparación no tiene respuesta inequívoca';
  }
  return null;
}

// ============================================================
// LA EXPLICACIÓN DEL MECANISMO
// ============================================================

const ACCION_DIRECTA: Record<PerturbacionCaso, string> = {
  sequia: 'La sequía golpea directamente a',
  'caza-depredador': 'La caza golpea directamente a',
  'plaga-herbivoro': 'La plaga dispara directamente a',
  contaminacion: 'En este modelo, la contaminación golpea directamente a',
};

/** Un paso de la cascada: cómo le llega el cambio al nivel `i` desde su vecino `j`. */
function fraseDePaso(ecosistema: Ecosistema, escenario: Escenario, i: IndiceNivel, j: IndiceNivel): string {
  const ni = nombreNivel(ecosistema, i);
  const nj = nombreNivel(ecosistema, j);
  const de = entero(escenario.antes[i]);
  const a = entero(escenario.visibles[i]);
  const verbo = escenario.visibles[i] > escenario.antes[i] ? 'suben' : 'bajan';
  const vecinoSube = escenario.visibles[j] > escenario.antes[j];
  if (j < i) {
    // Hacia arriba: el vecino es su PRESA, y el nivel copia su dirección.
    return vecinoSube
      ? `Los ${ni} se alimentan de los ${nj}: con más alimento, ${verbo} de ${de} a ${a}.`
      : `Los ${ni} se alimentan de los ${nj}: con menos alimento, ${verbo} de ${de} a ${a}.`;
  }
  // Hacia abajo: el vecino es quien se lo COME, y el nivel va en dirección contraria. «El
  // alimento de», y no «la presa de», porque vale también para los productores.
  return vecinoSube
    ? `Los ${ni} son el alimento de los ${nj}: con más ${nj} comiéndoselos, ${verbo} de ${de} a ${a}.`
    : `Los ${ni} son el alimento de los ${nj}: con menos ${nj} comiéndoselos, ${verbo} de ${de} a ${a}.`;
}

/** Los pasos de la cascada desde el nivel golpeado hasta cubrir todos los niveles pedidos. */
function recorrido(
  ecosistema: Ecosistema,
  eventoId: PerturbacionCaso,
  evento: Evento,
  escenario: Escenario,
  pedidos: readonly IndiceNivel[]
): string[] {
  const idx = evento.nivelAfectado;
  const directo = `${ACCION_DIRECTA[eventoId]} los ${nombreNivel(ecosistema, idx)}: pasan de ${entero(escenario.antes[idx])} a ${entero(escenario.visibles[idx])}.`;
  const pasos = [directo];
  const alto = Math.max(idx, ...pedidos);
  const bajo = Math.min(idx, ...pedidos);
  for (let i = idx + 1; i <= alto; i++) {
    pasos.push(fraseDePaso(ecosistema, escenario, i as IndiceNivel, (i - 1) as IndiceNivel));
  }
  for (let i = idx - 1; i >= bajo; i--) {
    pasos.push(fraseDePaso(ecosistema, escenario, i as IndiceNivel, (i + 1) as IndiceNivel));
  }
  return pasos;
}

// ============================================================
// RESOLVER UN CASO — ejecutando el motor, nunca de una tabla
// ============================================================

/**
 * Recalcula la respuesta de un caso desde sus `datos`, sin mirar la declarada.
 *
 * La respuesta sale de `aplicarEvento`: la dirección, del signo de lo que se pinta; la
 * comparación, de los porcentajes del panel. Nada está escrito a mano.
 */
export function resolverCaso(datos: DatosCaso): ResultadoCaso {
  const fallo = (error: string): ResultadoCaso => ({
    ok: false,
    respuesta: null,
    antes: [],
    despues: [],
    porcentajes: [],
    pasos: [],
    error,
  });

  const motivo = motivoDatosInvalidos(datos);
  if (motivo !== null) return fallo(motivo);
  const ecosistema = ecosistemaDe(datos.ecosistemaId);
  const evento = eventoDe(datos.eventoId);
  if (ecosistema === null || evento === null) return fallo('Datos incompletos');
  const escenario = simularEscenario(datos.ecosistemaId, datos.eventoId, datos.intensidad);
  if (!escenario.ok) return fallo(escenario.error ?? 'El modelo no respondió');

  const comun = {
    ok: true,
    antes: escenario.antes,
    despues: escenario.visibles,
    porcentajes: escenario.porcentajes,
    error: null,
  };

  if (datos.clase === 'direccion') {
    const n = datos.nivel;
    const respuesta = direccionVisible(escenario.antes[n], escenario.modelo[n]);
    const pasos = recorrido(ecosistema, datos.eventoId, evento, escenario, [n]);
    if (n !== evento.nivelAfectado) {
      pasos.push(
        `Aunque la perturbación no toca directamente a los ${nombreNivel(ecosistema, n)}, el cambio les llega por la cadena: «no cambia» solo sería cierto si los niveles no dependieran unos de otros.`
      );
    }
    pasos.push(
      `Conclusión: los ${nombreNivel(ecosistema, n)} ${respuesta === 'sube' ? 'suben' : respuesta === 'baja' ? 'bajan' : 'no cambian'} (de ${entero(escenario.antes[n])} a ${entero(escenario.visibles[n])}).`
    );
    return { ...comun, respuesta, pasos };
  }

  const { nivelA: a, nivelB: b } = datos;
  const pa = escenario.porcentajes[a];
  const pb = escenario.porcentajes[b];
  const respuesta: RespuestaComparacion = pa > pb ? 'a' : pb > pa ? 'b' : 'igual';
  const pasos = recorrido(ecosistema, datos.eventoId, evento, escenario, [a, b]);
  const na = nombreNivel(ecosistema, a);
  const nb = nombreNivel(ecosistema, b);
  pasos.push(
    `En porcentaje respecto a su población de partida (el que da el panel «¿Qué está pasando?»): los ${na} cambian un ${entero(pa)} % y los ${nb}, un ${entero(pb)} %.`
  );

  // El porcentaje del panel se calcula con la población SIN redondear. Si con las cifras
  // enteras de las barras sale otro, se dice: un alumno que lo calcule a mano lo notará.
  const discrepancias: string[] = [];
  for (const nivel of [a, b]) {
    const conEnteros = porcentajeDelPanel(escenario.visibles[nivel], escenario.antes[nivel]);
    if (conEnteros !== escenario.porcentajes[nivel]) {
      discrepancias.push(`${entero(conEnteros)} % para los ${nombreNivel(ecosistema, nivel)}`);
    }
  }
  if (discrepancias.length > 0) {
    pasos.push(
      `Si lo calculas con las cifras enteras de las barras te sale ${discrepancias.join(' y ')}: el panel usa la población sin redondear, por eso difiere un poco. El orden entre los dos niveles es el mismo.`
    );
  }

  const idx = evento.nivelAfectado;
  const distA = Math.abs(a - idx);
  const distB = Math.abs(b - idx);
  const atenuacion = `${entero(ATENUACION * 100)} %`;
  if (distA !== distB) {
    const [cerca, lejos, pasosCerca, pasosLejos]: [string, string, number, number] =
      distA < distB ? [na, nb, distA, distB] : [nb, na, distB, distA];
    const pasosTexto = (d: number): string => (d === 0 ? 'en el propio nivel golpeado' : d === 1 ? 'a 1 paso' : `a ${d} pasos`);
    pasos.push(
      `Cada paso de la cascada transmite solo el ${atenuacion} del cambio relativo del nivel vecino, así que el efecto se apaga al alejarse del nivel golpeado: los ${cerca} están ${pasosTexto(pasosCerca)} y los ${lejos}, ${pasosTexto(pasosLejos)}.`
    );
  } else {
    pasos.push(
      `Cada paso de la cascada transmite solo el ${atenuacion} del cambio relativo del nivel vecino, así que el efecto se apaga al alejarse del nivel golpeado.`
    );
  }
  pasos.push(
    respuesta === 'igual'
      ? 'Conclusión: los dos niveles cambian lo mismo.'
      : `Conclusión: cambian más los ${respuesta === 'a' ? na : nb}.`
  );
  return { ...comun, respuesta, pasos };
}

// ============================================================
// CONSTRUIR LA PREGUNTA (la misma para los fijos y la práctica)
// ============================================================

function escenarioTexto(ecosistema: Ecosistema, evento: Evento, intensidad: number): string {
  return `En el ecosistema ${ecosistema.nombre} se aplica la perturbación «${evento.nombre}» con una intensidad del ${entero(intensidad * 100)} % (${primeraMinuscula(evento.descripcion)}).`;
}

/** Enunciado, opciones y respuesta de unos datos. La respuesta sale de `resolverCaso`. */
export function construirPregunta(datos: DatosCaso): Pregunta {
  const ecosistema = ecosistemaDe(datos.ecosistemaId) ?? ECOSISTEMAS[0];
  const evento = eventoDe(datos.eventoId) ?? EVENTOS[0];
  const resultado = resolverCaso(datos);
  const escenario = escenarioTexto(ecosistema, evento, datos.intensidad);

  let enunciado: string;
  let etiquetaRespuesta: string;
  let opciones: readonly OpcionRespuesta[];
  if (datos.clase === 'direccion') {
    const n = nombreNivel(ecosistema, datos.nivel);
    enunciado = `${escenario} Antes de tocar el simulador, predice: ¿qué les pasa a los ${n}?`;
    etiquetaRespuesta = `¿Qué les pasa a los ${n}?`;
    opciones = OPCIONES_DIRECCION;
  } else {
    const na = nombreNivel(ecosistema, datos.nivelA);
    const nb = nombreNivel(ecosistema, datos.nivelB);
    enunciado = `${escenario} Antes de tocar el simulador, predice: ¿qué nivel cambia más en porcentaje respecto a su población de partida, los ${na} o los ${nb}?`;
    etiquetaRespuesta = '¿Qué nivel cambia más, en porcentaje?';
    opciones = [
      { valor: 'a', texto: `Los ${na}` },
      { valor: 'b', texto: `Los ${nb}` },
      { valor: 'igual', texto: 'Cambian lo mismo' },
    ];
  }

  const elegida = opciones.find(o => o.valor === resultado.respuesta);
  return {
    enunciado,
    etiquetaRespuesta,
    opciones,
    respuesta: resultado.respuesta,
    respuestaTexto: elegida?.texto ?? 'Caso no disponible',
    pasos: resultado.ok ? resultado.pasos : [resultado.error ?? 'Caso no disponible'],
  };
}

/** Compara la opción elegida con la que da el modelo. */
export function comprobarPrediccion(eleccion: Respuesta | null, esperada: Respuesta | null): Comprobacion {
  if (esperada === null) return { correcto: false, motivo: 'no-disponible' };
  if (eleccion === null) return { correcto: false, motivo: 'vacia' };
  return eleccion === esperada
    ? { correcto: true, motivo: 'acierto' }
    : { correcto: false, motivo: 'fallo' };
}

// ============================================================
// LOS 12 CASOS
// ============================================================

interface Definicion {
  titulo: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  pista: string;
}

/**
 * Solo se escriben a mano el título, los datos y la pista. El enunciado, las opciones, la
 * respuesta y la explicación salen de `construirPregunta`, que ejecuta el motor.
 */
const DEFINICIONES: readonly Definicion[] = [
  // ── Dirección: de abajo arriba ──
  {
    titulo: 'La sequía llega a los carnívoros',
    categoria: 'aplicado',
    datos: { clase: 'direccion', ecosistemaId: 'oceano', eventoId: 'sequia', intensidad: 0.5, nivel: 2 },
    pista: 'La sequía no toca a los carnívoros. Pregúntate de qué comen sus presas.',
  },
  {
    titulo: 'La contaminación sube por la cadena',
    categoria: 'aplicado',
    datos: { clase: 'direccion', ecosistemaId: 'pradera', eventoId: 'contaminacion', intensidad: 0.7, nivel: 3 },
    pista: 'Los superdepredadores están tres niveles por encima del golpe. Sigue la comida hacia arriba, nivel a nivel.',
  },
  // ── Dirección: de arriba abajo (cascada descendente) ──
  {
    titulo: 'Menos cazadores, más presas',
    categoria: 'aplicado',
    datos: { clase: 'direccion', ecosistemaId: 'pradera', eventoId: 'caza-depredador', intensidad: 0.5, nivel: 1 },
    pista: 'Los herbívoros son la presa de los carnívoros. ¿Qué pasa con una presa cuando su depredador escasea?',
  },
  {
    titulo: 'Los productores y la caza',
    categoria: 'aplicado',
    datos: { clase: 'direccion', ecosistemaId: 'oceano', eventoId: 'caza-depredador', intensidad: 0.5, nivel: 0 },
    pista: 'Nadie caza a los productores, pero entre ellos y los carnívoros hay un nivel intermedio. Resuélvelo primero.',
  },
  {
    titulo: 'Los superdepredadores y la caza',
    categoria: 'aplicado',
    datos: { clase: 'direccion', ecosistemaId: 'bosque', eventoId: 'caza-depredador', intensidad: 0.7, nivel: 3 },
    pista: 'A los superdepredadores no los caza nadie en este escenario. ¿Qué comen?',
  },
  // ── Dirección: la plaga, en los dos sentidos ──
  {
    titulo: 'Una plaga que alimenta la cúspide',
    categoria: 'aplicado',
    datos: { clase: 'direccion', ecosistemaId: 'sabana', eventoId: 'plaga-herbivoro', intensidad: 0.5, nivel: 3 },
    pista: 'Los herbívoros SUBEN. Sigue la comida hacia arriba dos niveles.',
  },
  {
    titulo: 'Una plaga y la vegetación',
    categoria: 'aplicado',
    datos: { clase: 'direccion', ecosistemaId: 'sabana', eventoId: 'plaga-herbivoro', intensidad: 0.7, nivel: 0 },
    pista: 'Los productores son la presa de los herbívoros. ¿Qué le pasa a una presa cuando su depredador se multiplica?',
  },
  {
    titulo: 'Más presas para los carnívoros',
    categoria: 'aplicado',
    datos: { clase: 'direccion', ecosistemaId: 'oceano', eventoId: 'plaga-herbivoro', intensidad: 0.7, nivel: 2 },
    pista: 'Los carnívoros se alimentan de los herbívoros. Hacia arriba, cada nivel sigue la dirección de su presa.',
  },
  // ── Comparación: la atenuación de la cascada ──
  {
    titulo: 'La sequía se apaga al subir',
    categoria: 'abstracto',
    datos: { clase: 'comparacion', ecosistemaId: 'pradera', eventoId: 'sequia', intensidad: 0.5, nivelA: 1, nivelB: 2 },
    pista: 'Cuenta a cuántos pasos está cada nivel de los productores, que es donde golpea la sequía.',
  },
  {
    titulo: 'La caza se apaga al bajar',
    categoria: 'abstracto',
    datos: { clase: 'comparacion', ecosistemaId: 'oceano', eventoId: 'caza-depredador', intensidad: 0.7, nivelA: 0, nivelB: 1 },
    pista: 'La cascada también pierde fuerza cuando baja. ¿Cuál de los dos está más cerca de los carnívoros?',
  },
  {
    titulo: 'La plaga, cada vez más débil',
    categoria: 'abstracto',
    datos: { clase: 'comparacion', ecosistemaId: 'sabana', eventoId: 'plaga-herbivoro', intensidad: 0.5, nivelA: 2, nivelB: 3 },
    pista: 'Los dos suben. Lo que se pregunta es cuánto, en proporción a lo que había.',
  },
  {
    titulo: 'Arriba o abajo: manda la distancia',
    categoria: 'abstracto',
    datos: { clase: 'comparacion', ecosistemaId: 'bosque', eventoId: 'plaga-herbivoro', intensidad: 0.7, nivelA: 3, nivelB: 0 },
    pista: 'Uno está por encima de los herbívoros y otro por debajo. No importa el sentido: cuenta los pasos.',
  },
];

function construirCaso(definicion: Definicion, indice: number): CasoAula {
  return {
    id: indice + 1,
    titulo: definicion.titulo,
    categoria: definicion.categoria,
    datos: definicion.datos,
    pista: definicion.pista,
    ...construirPregunta(definicion.datos),
  };
}

/** Los 12 casos fijos, con ids 1..12 sin huecos. */
export const CASOS: readonly CasoAula[] = DEFINICIONES.map(construirCaso);

export const TOTAL_CASOS = CASOS.length;

// ============================================================
// MODO PRÁCTICA (aleatorio, reproducible por semilla)
// ============================================================

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente
 * con 1, 2, 3… los primeros valores salen diminutos y parecidos, y `Math.floor(rnd() * n)`
 * devuelve el índice 0 para todas las semillas pequeñas: en `simulador-genetica` (14/09/2026)
 * el «aleatorio» daba SIEMPRE el mismo ejercicio y pasaba la prueba de reproducibilidad,
 * porque reproducible no es variado.
 */
function aleatorioCon(semilla: number): () => number {
  let estado = (semilla >>> 0) || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x100000000;
  };
}

const PERTURBACIONES_PRACTICA: readonly PerturbacionCaso[] = [
  'sequia',
  'caza-depredador',
  'plaga-herbivoro',
  'contaminacion',
];

/** Escenario de reserva si el sorteo no diera con uno válido (no ocurre con 64 intentos). */
const RESERVA_PRACTICA: DatosDireccion = {
  clase: 'direccion',
  ecosistemaId: 'pradera',
  eventoId: 'caza-depredador',
  intensidad: 0.5,
  nivel: 1,
};

/**
 * Ejercicio de dirección al azar: ecosistema, perturbación, intensidad (0,5 o 0,7) y un nivel
 * NO golpeado directamente, que es donde está el aprendizaje. Descarta los escenarios de la
 * trampa 1 y usa EL MISMO `resolverCaso` que los doce fijos: si divergieran, el alumno
 * entrenaría con una regla y sería corregido con otra.
 *
 * Solo pregunta dirección, así que las respuestas correctas posibles son dos (sube / baja):
 * la variedad se mide sobre la terna (ecosistema, perturbación, nivel), no sobre la respuesta.
 */
export function generarEjercicioAleatorio(semilla: number = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  let datos: DatosDireccion = RESERVA_PRACTICA;
  for (let intento = 0; intento < 64; intento++) {
    const ecosistema = ECOSISTEMAS[Math.floor(rnd() * ECOSISTEMAS.length)] ?? ECOSISTEMAS[0];
    const eventoId = PERTURBACIONES_PRACTICA[Math.floor(rnd() * PERTURBACIONES_PRACTICA.length)] ?? 'sequia';
    const intensidad = INTENSIDADES_CASO[Math.floor(rnd() * INTENSIDADES_CASO.length)] ?? 0.5;
    const evento = eventoDe(eventoId);
    if (evento === null) continue;
    const candidatos = ([0, 1, 2, 3] as const).filter(n => n !== evento.nivelAfectado);
    const nivel = candidatos[Math.floor(rnd() * candidatos.length)] ?? candidatos[0];
    const candidato: DatosDireccion = { clase: 'direccion', ecosistemaId: ecosistema.id, eventoId, intensidad, nivel };
    if (motivoDatosInvalidos(candidato) === null) {
      datos = candidato;
      break;
    }
  }
  return { semilla, datos, ...construirPregunta(datos) };
}
