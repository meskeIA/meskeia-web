/**
 * Casos para clase del Simulador VSEPR — tarea de tipo C: PREDICCIÓN ANTES DE MOVER.
 *
 * El alumno parte de una molécula real (X pares enlazantes y E pares libres en su átomo
 * central), lee UN cambio —añadir o quitar un par en un deslizador, o cargar otra molécula— y
 * se compromete con una predicción ANTES de tocar el simulador. Solo después carga el punto de
 * partida, hace él mismo el cambio y lo comprueba. Ese compromiso previo es todo el valor
 * pedagógico: mover un deslizador y mirar la molécula girar no enseña nada si no había una
 * hipótesis que confirmar o romper.
 *
 * Vive fuera de la vista porque el build compila la página sin comprobar si la química está
 * bien. Y NO decide nada por su cuenta: el estado final sale de `aplicarCambioEnlaces` /
 * `aplicarCambioLibres` (el mismo tope X + E ≤ 6 que aplican los deslizadores) y la geometría,
 * de `geometriaDe` sobre `TABLA_VSEPR`, la misma tabla con la que el simulador pinta su
 * resultado. Todo vive en `motor.ts`.
 *
 * EL CONVENIO DE ESTA APP (lo que decide qué respuesta es la correcta)
 * ────────────────────────────────────────────────────────────────────
 * 1. SE EVALÚA LO QUE SE VE. Las opciones son los textos exactos que pinta la app en las filas
 *    «Geometría electrónica» y «Geometría molecular» (p. ej. «Balancín (sube y baja)»).
 * 2. REJILLA (`recorrerRejilla`). Se ejecuta el modelo sobre los 24 estados de los deslizadores
 *    (X 1-6 × E 0-3) y sus 4 movimientos de un par, y se excluye:
 *      a) el movimiento en que el tope X + E ≤ 6 altera el OTRO deslizador: el alumno vería
 *         algo distinto de lo que se le pidió;
 *      b) el estado inicial o final que no está en la tabla: la app enseña «Combinación poco
 *         común» y no hay geometría que predecir;
 *      además del movimiento imposible (subir un deslizador que ya está en su tope).
 *    Los casos fijos y el modo práctica pasan los mismos filtros.
 * 3. EL ÁTOMO CENTRAL NO SE PREGUNTA: `geometriaDe` ni siquiera lo recibe. VSEPR solo cuenta
 *    dominios, así que una pregunta sobre el átomo no tendría una respuesta que moviera el
 *    modelo. Por eso un caso puede cargar el carbono del CO₂ y añadirle un par libre: la
 *    explicación lo dice («el átomo central no interviene»).
 * 4. SOLO MOVIMIENTOS DE UN PAR en los deslizadores (±1): es lo que se hace con una pulsación
 *    de flecha y no pasa por estados intermedios.
 *
 * Los 12 casos son DETERMINISTAS y universales: el caso 3 es el mismo para todo el mundo, hoy y
 * dentro de un año. Es lo único que hace que «haz los casos 3, 7 y 11» funcione en clase.
 *
 * Nada lanza excepciones: un dato inválido sale como `{ ok: false, error }` o `null`.
 */

import {
  ATOMOS,
  MAX_ENLACES,
  MAX_LIBRES,
  MIN_ENLACES,
  MIN_LIBRES,
  MOLECULAS_PRESET,
  TABLA_VSEPR,
  aplicarCambioEnlaces,
  aplicarCambioLibres,
  claveVsepr,
  geometriaDe,
  type GeometriaInfo,
  type MoleculaPreset,
  type ParesVsepr,
} from './motor';

// ============================================================
// TIPOS
// ============================================================

/** Lo que se pregunta: la forma de los átomos, la de todos los dominios, o si esta cambia. */
export type TipoPregunta = 'molecular' | 'electronica' | 'cambia-electronica';

/** El valor de una opción: un texto de la tabla VSEPR, o `SIN_CAMBIO`. */
export type Respuesta = string;

/** La opción «No cambia» de las preguntas `cambia-electronica`. */
export const SIN_CAMBIO: Respuesta = 'sin-cambio';

/** El punto de partida: una molécula real con su átomo central. */
export interface EstadoInicial {
  /** Fórmula con subíndices, tal como se lee: «SiCl₄». */
  molecula: string;
  /** Símbolo del átomo central; debe existir en `ATOMOS`. */
  atomo: string;
  enlaces: number;
  libres: number;
}

/** UN cambio: un par en un deslizador, o cargar una de las «moléculas famosas». */
export type Cambio =
  | { tipo: 'enlaces'; delta: 1 | -1 }
  | { tipo: 'libres'; delta: 1 | -1 }
  /** `formula` es la ASCII de `MOLECULAS_PRESET` («NH3»). */
  | { tipo: 'molecula'; formula: string };

export interface DatosCaso {
  inicio: EstadoInicial;
  cambio: Cambio;
  pregunta: TipoPregunta;
  /** 3-4 valores distintos que el motor puede devolver; la respuesta correcta debe estar. */
  opciones: readonly Respuesta[];
}

export interface OpcionRespuesta {
  valor: Respuesta;
  texto: string;
}

/** Lo que se pregunta y cómo se corrige, igual para un caso fijo y para uno de práctica. */
export interface Pregunta {
  enunciado: string;
  /** El rótulo del grupo de opciones (la `legend`). Nunca vacío. */
  etiquetaRespuesta: string;
  opciones: readonly OpcionRespuesta[];
  /** Calculada ejecutando el motor. `null` solo si los datos no son válidos. */
  respuesta: Respuesta | null;
  respuestaTexto: string;
  /** Qué hacer en el simulador una vez cargado el punto de partida. */
  instruccion: string;
  /** Qué fila del simulador mirar para comprobarlo. */
  filaQueMirar: string;
  /** Aquí los «pasos» son la explicación del MECANISMO, no un desarrollo. */
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
  datos: DatosCaso;
}

/** Por qué un escenario (inicio + cambio) queda fuera. */
export type MotivoExclusion =
  | 'atomo-desconocido'
  | 'inicio-fuera-de-tabla'
  | 'fuera-del-deslizador'
  | 'tope'
  | 'molecula-desconocida'
  | 'sin-cambio'
  | 'final-fuera-de-tabla';

export interface EstadoTrasCambio {
  ok: boolean;
  /** Estado de los deslizadores (y del átomo) después del cambio. */
  final: (ParesVsepr & { atomo: string }) | null;
  motivo: MotivoExclusion | null;
}

export interface ResultadoCaso {
  ok: boolean;
  respuesta: Respuesta | null;
  antes: GeometriaInfo | null;
  despues: GeometriaInfo | null;
  final: ParesVsepr | null;
  pasos: readonly string[];
  error: string | null;
}

export interface Comprobacion {
  correcto: boolean;
  motivo: 'acierto' | 'fallo' | 'vacia' | 'no-disponible';
}

/** Un escenario de la rejilla: punto de partida y movimiento de un par. */
export interface Escenario {
  inicio: EstadoInicial;
  cambio: Cambio;
}

export interface InformeRejilla {
  /** Movimientos examinados: 24 estados × 4 movimientos. */
  examinados: number;
  excluidos: Readonly<Record<MotivoExclusion, number>>;
  validos: readonly Escenario[];
}

// ============================================================
// DATOS DE APOYO (texto, nunca respuestas)
// ============================================================

/**
 * Una molécula real por cada combinación de la tabla, con su átomo central. Solo da NOMBRE al
 * estado («la misma combinación que el xenón en el XeF₂»); la geometría la da siempre el motor.
 */
export const MOLECULA_DE_REFERENCIA: Readonly<Record<string, { molecula: string; atomo: string }>> = {
  '2-0': { molecula: 'CO₂', atomo: 'C' },
  '3-0': { molecula: 'BF₃', atomo: 'B' },
  '2-1': { molecula: 'SO₂', atomo: 'S' },
  '4-0': { molecula: 'CH₄', atomo: 'C' },
  '3-1': { molecula: 'NH₃', atomo: 'N' },
  '2-2': { molecula: 'H₂O', atomo: 'O' },
  '5-0': { molecula: 'PCl₅', atomo: 'P' },
  '4-1': { molecula: 'SF₄', atomo: 'S' },
  '3-2': { molecula: 'ClF₃', atomo: 'Cl' },
  '2-3': { molecula: 'XeF₂', atomo: 'Xe' },
  '6-0': { molecula: 'SF₆', atomo: 'S' },
  '5-1': { molecula: 'BrF₅', atomo: 'Br' },
  '4-2': { molecula: 'XeF₄', atomo: 'Xe' },
};

/**
 * Cómo se colocan los pares en cada combinación: el MECANISMO que explica la forma. Es texto
 * para la explicación; la respuesta no sale de aquí, sino de `geometriaDe`.
 */
const MECANISMO: Readonly<Record<string, string>> = {
  '2-0': 'Sin pares libres, los 2 átomos se colocan en lados opuestos, a 180°: la forma molecular coincide con la electrónica.',
  '3-0': 'Sin pares libres, los 3 átomos se reparten en un triángulo plano, a 120°: la forma molecular coincide con la electrónica.',
  '2-1': 'Uno de los 3 vértices del triángulo lo ocupa el par libre; los 2 átomos que quedan forman un ángulo algo menor de 120°, porque el par libre empuja más que un enlace.',
  '4-0': 'Sin pares libres, los 4 átomos ocupan los 4 vértices de un tetraedro, a 109,5°: la forma molecular coincide con la electrónica.',
  '3-1': 'El par libre ocupa uno de los 4 vértices del tetraedro; los 3 átomos quedan formando una pirámide de base triangular. El par libre empuja más que un enlace y cierra el ángulo a unos 107°.',
  '2-2': 'Los 2 pares libres ocupan 2 vértices del tetraedro; los 2 átomos que quedan forman un ángulo de unos 104,5°.',
  '5-0': 'Sin pares libres, los 5 átomos ocupan la bipirámide trigonal: 3 en el ecuador, a 120° entre sí, y 2 en los polos, a 90° del ecuador.',
  '4-1': 'En la bipirámide trigonal el par libre va a una posición ECUATORIAL: allí solo tiene 2 vecinos a 90° (en un polo tendría 3), así que se repelen menos. Los 4 átomos que quedan dibujan un balancín.',
  '3-2': 'Los 2 pares libres van a posiciones ECUATORIALES, las de menos repulsión. Quedan 2 átomos en los polos y 1 en el ecuador: una forma de T.',
  '2-3': 'Los 3 pares libres ocupan las 3 posiciones ECUATORIALES, a 120° entre sí. A los 2 átomos solo les quedan los dos polos, en línea recta a 180°: lineal, aunque haya 3 pares libres.',
  '6-0': 'Sin pares libres, los 6 átomos ocupan los 6 vértices del octaedro, todos a 90° de sus vecinos: la forma molecular coincide con la electrónica.',
  '5-1': 'El par libre ocupa un vértice del octaedro; los 5 átomos que quedan forman una pirámide de base cuadrada.',
  '4-2': 'Los 2 pares libres se colocan en vértices OPUESTOS del octaedro, a 180°, lo más lejos posible uno del otro. Los 4 átomos quedan en un mismo plano, formando un cuadrado.',
};

const TIPOS_PREGUNTA: readonly TipoPregunta[] = ['molecular', 'electronica', 'cambia-electronica'];

// ============================================================
// UTILIDADES
// ============================================================

function esEntero(n: number): boolean {
  return Number.isInteger(n);
}

function nombreAtomo(simbolo: string): string | null {
  const atomo = ATOMOS.find(a => a.simbolo === simbolo);
  return atomo ? atomo.nombre.toLowerCase() : null;
}

function presetDe(formula: string): MoleculaPreset | null {
  return MOLECULAS_PRESET.find(m => m.formula === formula) ?? null;
}

function sinDuplicados(valores: readonly string[]): string[] {
  return valores.filter((v, i) => valores.indexOf(v) === i);
}

/** Los textos de la tabla en su orden de aparición: el orden canónico de las opciones. */
const ORDEN_MOLECULAR: readonly string[] = sinDuplicados(Object.values(TABLA_VSEPR).map(g => g.geomMolecular));
const ORDEN_ELECTRONICA: readonly string[] = sinDuplicados(Object.values(TABLA_VSEPR).map(g => g.geomElectronica));

/** La geometría electrónica de un total de dominios, leída de la propia tabla. */
export function electronicaDeTotal(total: number): string | null {
  for (const [clave, info] of Object.entries(TABLA_VSEPR)) {
    const [x, e] = clave.split('-').map(Number);
    if (x + e === total) return info.geomElectronica;
  }
  return null;
}

function textoPares(n: number, tipo: 'enlazante' | 'libre'): string {
  if (tipo === 'libre' && n === 0) return 'ningún par libre';
  if (n === 1) return `1 par ${tipo}`;
  return `${n} pares ${tipo}s`;
}

/** Primera letra en minúscula, saltando un «¿» inicial. */
function minuscula(texto: string): string {
  const i = texto.startsWith('¿') ? 1 : 0;
  return texto.length <= i ? texto : texto.slice(0, i) + texto.charAt(i).toLowerCase() + texto.slice(i + 1);
}

// ============================================================
// EJECUTAR EL CAMBIO — con las mismas funciones que los deslizadores
// ============================================================

/**
 * Aplica el cambio al punto de partida con `aplicarCambioEnlaces` / `aplicarCambioLibres` (el
 * tope de la app) o cargando la molécula famosa, y dice si el escenario vale (convenio, punto 2).
 */
export function estadoTrasCambio(inicio: EstadoInicial, cambio: Cambio): EstadoTrasCambio {
  const fallo = (motivo: MotivoExclusion): EstadoTrasCambio => ({ ok: false, final: null, motivo });
  if (nombreAtomo(inicio.atomo) === null) return fallo('atomo-desconocido');
  if (
    !esEntero(inicio.enlaces) ||
    !esEntero(inicio.libres) ||
    inicio.enlaces < MIN_ENLACES ||
    inicio.enlaces > MAX_ENLACES ||
    inicio.libres < MIN_LIBRES ||
    inicio.libres > MAX_LIBRES ||
    geometriaDe(inicio.enlaces, inicio.libres) === null
  ) {
    return fallo('inicio-fuera-de-tabla');
  }

  let final: ParesVsepr & { atomo: string };
  if (cambio.tipo === 'molecula') {
    const preset = presetDe(cambio.formula);
    if (preset === null) return fallo('molecula-desconocida');
    if (preset.enlaces === inicio.enlaces && preset.libres === inicio.libres) return fallo('sin-cambio');
    // «Moléculas famosas» fija los dos deslizadores de golpe: no pasa por el tope.
    final = { enlaces: preset.enlaces, libres: preset.libres, atomo: preset.atomo };
  } else if (cambio.tipo === 'enlaces') {
    const pedido = inicio.enlaces + cambio.delta;
    if (pedido < MIN_ENLACES || pedido > MAX_ENLACES) return fallo('fuera-del-deslizador');
    const r = aplicarCambioEnlaces(inicio.enlaces, inicio.libres, pedido);
    if (r.libres !== inicio.libres) return fallo('tope');
    final = { ...r, atomo: inicio.atomo };
  } else {
    const pedido = inicio.libres + cambio.delta;
    if (pedido < MIN_LIBRES || pedido > MAX_LIBRES) return fallo('fuera-del-deslizador');
    const r = aplicarCambioLibres(inicio.enlaces, inicio.libres, pedido);
    if (r.enlaces !== inicio.enlaces) return fallo('tope');
    final = { ...r, atomo: inicio.atomo };
  }
  if (geometriaDe(final.enlaces, final.libres) === null) return fallo('final-fuera-de-tabla');
  return { ok: true, final, motivo: null };
}

/** La respuesta correcta, sacada de la geometría antes y después. */
function respuestaDelModelo(pregunta: TipoPregunta, antes: GeometriaInfo, despues: GeometriaInfo): Respuesta {
  if (pregunta === 'molecular') return despues.geomMolecular;
  if (pregunta === 'electronica') return despues.geomElectronica;
  return despues.geomElectronica === antes.geomElectronica ? SIN_CAMBIO : despues.geomElectronica;
}

/** Los valores que el motor puede devolver para esa pregunta desde ese punto de partida. */
export function valoresPosibles(pregunta: TipoPregunta, antes: GeometriaInfo): readonly Respuesta[] {
  if (pregunta === 'molecular') return ORDEN_MOLECULAR;
  if (pregunta === 'electronica') return ORDEN_ELECTRONICA;
  return [SIN_CAMBIO, ...ORDEN_ELECTRONICA.filter(g => g !== antes.geomElectronica)];
}

function textoOpcion(pregunta: TipoPregunta, valor: Respuesta): string {
  if (pregunta !== 'cambia-electronica') return valor;
  return valor === SIN_CAMBIO ? 'No cambia' : `Sí: pasa a ${minuscula(valor)}`;
}

const MENSAJE_EXCLUSION: Readonly<Record<MotivoExclusion, string>> = {
  'atomo-desconocido': 'Ese átomo central no está en el simulador',
  'inicio-fuera-de-tabla': 'El punto de partida no está en la tabla VSEPR del simulador',
  'fuera-del-deslizador': 'Ese movimiento se sale del deslizador',
  tope: 'Con ese movimiento el tope X + E ≤ 6 cambiaría también el otro deslizador',
  'molecula-desconocida': 'Esa molécula no está en «Moléculas famosas»',
  'sin-cambio': 'Esa molécula tiene los mismos pares que el punto de partida',
  'final-fuera-de-tabla': 'El estado final no está en la tabla VSEPR del simulador',
};

/** Por qué unos datos no sirven para un caso, o `null` si sirven. */
export function motivoDatosInvalidos(datos: DatosCaso): string | null {
  if (!TIPOS_PREGUNTA.includes(datos.pregunta)) return 'Tipo de pregunta desconocido';
  const tras = estadoTrasCambio(datos.inicio, datos.cambio);
  if (!tras.ok || tras.final === null) return MENSAJE_EXCLUSION[tras.motivo ?? 'inicio-fuera-de-tabla'];
  const antes = geometriaDe(datos.inicio.enlaces, datos.inicio.libres);
  const despues = geometriaDe(tras.final.enlaces, tras.final.libres);
  if (antes === null || despues === null) return 'Geometría no disponible';

  const opciones = datos.opciones;
  if (opciones.length < 3 || opciones.length > 4) return 'Cada caso lleva entre 3 y 4 opciones';
  if (sinDuplicados(opciones).length !== opciones.length) return 'Hay opciones repetidas';
  const posibles = valoresPosibles(datos.pregunta, antes);
  if (opciones.some(o => !posibles.includes(o))) return 'Hay una opción que el simulador no puede mostrar';
  if (!opciones.includes(respuestaDelModelo(datos.pregunta, antes, despues)))
    return 'La respuesta correcta no está entre las opciones';
  return null;
}

// ============================================================
// LA EXPLICACIÓN DEL MECANISMO
// ============================================================

function notacionYPares(pares: ParesVsepr, info: GeometriaInfo): string {
  return `X = ${pares.enlaces} y E = ${pares.libres} (${info.notacion})`;
}

function explicar(
  datos: DatosCaso,
  final: ParesVsepr,
  antes: GeometriaInfo,
  despues: GeometriaInfo,
  respuesta: Respuesta
): string[] {
  const inicio = datos.inicio;
  const totalAntes = inicio.enlaces + inicio.libres;
  const totalDespues = final.enlaces + final.libres;
  const pasos: string[] = [];

  pasos.push(
    `Punto de partida: ${notacionYPares(inicio, antes)}. Son ${totalAntes} dominios electrónicos alrededor del átomo central: geometría electrónica «${antes.geomElectronica}» y molecular «${antes.geomMolecular}».`
  );
  pasos.push(
    `Después del cambio: ${notacionYPares(final, despues)}. ${
      totalDespues === totalAntes ? `Siguen siendo ${totalDespues} dominios.` : `Ahora son ${totalDespues} dominios.`
    }`
  );
  pasos.push(
    totalDespues === totalAntes
      ? `La geometría electrónica solo depende del TOTAL de dominios (X + E): un par libre ocupa espacio y cuenta igual que un enlace. Como el total no cambia, sigue siendo «${despues.geomElectronica}».`
      : `La geometría electrónica solo depende del TOTAL de dominios (X + E): un par libre ocupa espacio y cuenta igual que un enlace. Con ${totalDespues} dominios pasa de «${antes.geomElectronica}» a «${despues.geomElectronica}».`
  );
  pasos.push(
    `La geometría molecular describe solo dónde quedan los ÁTOMOS: los pares libres empujan, pero no se ven en la forma. ${
      MECANISMO[claveVsepr(final.enlaces, final.libres)] ?? ''
    } Ángulo de enlace ideal: ${despues.anguloIdeal}.`.replace('  ', ' ')
  );

  if (datos.pregunta === 'molecular') {
    pasos.push(
      despues.geomMolecular === antes.geomMolecular
        ? `Conclusión: la geometría molecular NO cambia, sigue siendo «${despues.geomMolecular}», aunque la electrónica pase de «${antes.geomElectronica}» a «${despues.geomElectronica}».`
        : `Conclusión: la geometría molecular pasa de «${antes.geomMolecular}» a «${despues.geomMolecular}».`
    );
  } else if (datos.pregunta === 'electronica') {
    pasos.push(
      `Conclusión: la geometría electrónica es «${despues.geomElectronica}» (${totalDespues} dominios), y la molecular, «${despues.geomMolecular}».`
    );
  } else {
    pasos.push(
      respuesta === SIN_CAMBIO
        ? `Conclusión: la geometría electrónica no cambia, sigue siendo «${despues.geomElectronica}». Lo que cambia es la molecular: de «${antes.geomMolecular}» a «${despues.geomMolecular}».`
        : `Conclusión: sí cambia, pasa de «${antes.geomElectronica}» a «${despues.geomElectronica}».`
    );
  }

  const referencia = MOLECULA_DE_REFERENCIA[claveVsepr(final.enlaces, final.libres)];
  const atomoRef = referencia ? nombreAtomo(referencia.atomo) : null;
  pasos.push(
    referencia && atomoRef
      ? `El átomo central no interviene: VSEPR solo cuenta dominios, y X = ${final.enlaces} con E = ${final.libres} da la misma forma con cualquier átomo. En una molécula real es, por ejemplo, el ${atomoRef} del ${referencia.molecula}.`
      : `El átomo central no interviene: VSEPR solo cuenta dominios.`
  );
  return pasos;
}

// ============================================================
// RESOLVER UN CASO — ejecutando el motor, nunca de una tabla de respuestas
// ============================================================

/**
 * Recalcula la respuesta de un caso desde sus `datos`, sin mirar la declarada: aplica el cambio
 * con las funciones de tope de la app y lee la geometría con `geometriaDe`.
 */
export function resolverCaso(datos: DatosCaso): ResultadoCaso {
  const fallo = (error: string): ResultadoCaso => ({
    ok: false,
    respuesta: null,
    antes: null,
    despues: null,
    final: null,
    pasos: [],
    error,
  });
  const motivo = motivoDatosInvalidos(datos);
  if (motivo !== null) return fallo(motivo);
  const tras = estadoTrasCambio(datos.inicio, datos.cambio);
  if (tras.final === null) return fallo('Estado final no disponible');
  const final: ParesVsepr = { enlaces: tras.final.enlaces, libres: tras.final.libres };
  const antes = geometriaDe(datos.inicio.enlaces, datos.inicio.libres);
  const despues = geometriaDe(final.enlaces, final.libres);
  if (antes === null || despues === null) return fallo('Geometría no disponible');
  const respuesta = respuestaDelModelo(datos.pregunta, antes, despues);
  return {
    ok: true,
    respuesta,
    antes,
    despues,
    final,
    pasos: explicar(datos, final, antes, despues, respuesta),
    error: null,
  };
}

// ============================================================
// CONSTRUIR LA PREGUNTA (la misma para los fijos y la práctica)
// ============================================================

function textoCambio(inicio: EstadoInicial, cambio: Cambio): { enunciado: string; instruccion: string } {
  if (cambio.tipo === 'molecula') {
    const preset = presetDe(cambio.formula);
    const nombre = preset?.nombre ?? cambio.formula;
    const atomo = preset ? nombreAtomo(preset.atomo) : null;
    const detalle = preset && atomo ? `, que tiene X = ${preset.enlaces} y E = ${preset.libres} en su átomo central, el ${atomo}` : '';
    return {
      enunciado: `Cambio: carga el ${nombre} desde «Moléculas famosas»${detalle}.`,
      instruccion: `pulsa «${nombre}» en «Moléculas famosas»`,
    };
  }
  const esEnlace = cambio.tipo === 'enlaces';
  const desde = esEnlace ? inicio.enlaces : inicio.libres;
  const hasta = desde + cambio.delta;
  const deslizador = esEnlace ? '«Pares enlazantes (X)»' : '«Pares libres (E)»';
  const accion = cambio.delta > 0 ? 'añade' : 'quita';
  const que = esEnlace ? 'UN par enlazante (un átomo unido al central)' : 'UN par libre al átomo central';
  const referencia = MOLECULA_DE_REFERENCIA[claveVsepr(esEnlace ? hasta : inicio.enlaces, esEnlace ? inicio.libres : hasta)];
  const atomoRef = referencia ? nombreAtomo(referencia.atomo) : null;
  const queda =
    referencia && atomoRef
      ? ` Quedarían X = ${esEnlace ? hasta : inicio.enlaces} y E = ${esEnlace ? inicio.libres : hasta}: la misma combinación que el ${atomoRef} en el ${referencia.molecula}.`
      : '';
  return {
    enunciado: `Cambio: ${accion} ${que}, moviendo el deslizador ${deslizador} de ${desde} a ${hasta}.${queda}`,
    instruccion: `${cambio.delta > 0 ? 'sube' : 'baja'} el deslizador ${deslizador} de ${desde} a ${hasta}`,
  };
}

const ETIQUETA: Readonly<Record<TipoPregunta, string>> = {
  molecular: '¿Qué geometría molecular tendrá?',
  electronica: '¿Qué geometría electrónica tendrá?',
  'cambia-electronica': '¿Cambia la geometría electrónica?',
};

const FILA: Readonly<Record<TipoPregunta, string>> = {
  molecular: '«Geometría molecular»',
  electronica: '«Geometría electrónica»',
  'cambia-electronica': '«Geometría electrónica»',
};

/** Enunciado, opciones y respuesta de unos datos. La respuesta sale de `resolverCaso`. */
export function construirPregunta(datos: DatosCaso): Pregunta {
  const inicio = datos.inicio;
  const resultado = resolverCaso(datos);
  const atomo = nombreAtomo(inicio.atomo) ?? inicio.atomo;
  const cambio = textoCambio(inicio, datos.cambio);
  const partida = `El ${inicio.molecula} tiene ${textoPares(inicio.enlaces, 'enlazante')} y ${textoPares(inicio.libres, 'libre')} en su átomo central, el ${atomo}.`;
  const enunciado = `${partida} ${cambio.enunciado} Antes de mover nada en el simulador, predice: ${minuscula(ETIQUETA[datos.pregunta])}`;
  const opciones: OpcionRespuesta[] = datos.opciones.map(valor => ({
    valor,
    texto: textoOpcion(datos.pregunta, valor),
  }));
  const elegida = opciones.find(o => o.valor === resultado.respuesta);
  return {
    enunciado,
    etiquetaRespuesta: ETIQUETA[datos.pregunta],
    opciones,
    respuesta: resultado.respuesta,
    respuestaTexto: elegida?.texto ?? 'Caso no disponible',
    instruccion: cambio.instruccion,
    filaQueMirar: FILA[datos.pregunta],
    pasos: resultado.ok ? resultado.pasos : [resultado.error ?? 'Caso no disponible'],
  };
}

/** Compara la opción elegida con la que da el modelo. */
export function comprobarPrediccion(eleccion: Respuesta | null, esperada: Respuesta | null): Comprobacion {
  if (esperada === null) return { correcto: false, motivo: 'no-disponible' };
  if (eleccion === null) return { correcto: false, motivo: 'vacia' };
  return eleccion === esperada ? { correcto: true, motivo: 'acierto' } : { correcto: false, motivo: 'fallo' };
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
 * Solo se escriben a mano el título, los datos (con las opciones que se ofrecen) y la pista. La
 * respuesta, el enunciado y la explicación salen de `construirPregunta`, que ejecuta el motor.
 */
const DEFINICIONES: readonly Definicion[] = [
  // ── La serie CH₄ → NH₃ → H₂O: la electrónica se queda, la molecular cambia ──
  {
    titulo: 'Del metano al amoniaco',
    categoria: 'aplicado',
    datos: {
      inicio: { molecula: 'CH₄', atomo: 'C', enlaces: 4, libres: 0 },
      cambio: { tipo: 'molecula', formula: 'NH3' },
      pregunta: 'molecular',
      opciones: ['Tetraédrica', 'Pirámide trigonal', 'Trigonal plana', 'Angular'],
    },
    pista: 'El NH₃ sigue teniendo 4 dominios alrededor del átomo central. ¿Cuántos de ellos son átomos?',
  },
  {
    titulo: 'Del amoniaco al agua',
    categoria: 'abstracto',
    datos: {
      inicio: { molecula: 'NH₃', atomo: 'N', enlaces: 3, libres: 1 },
      cambio: { tipo: 'molecula', formula: 'H2O' },
      pregunta: 'cambia-electronica',
      opciones: [SIN_CAMBIO, 'Lineal', 'Trigonal plana'],
    },
    pista: 'Suma X + E en el NH₃ y en el H₂O.',
  },
  {
    titulo: 'El amoniaco sin su par libre',
    categoria: 'abstracto',
    datos: {
      inicio: { molecula: 'NH₃', atomo: 'N', enlaces: 3, libres: 1 },
      cambio: { tipo: 'libres', delta: -1 },
      pregunta: 'molecular',
      opciones: ['Trigonal plana', 'Tetraédrica', 'Pirámide trigonal', 'Forma T'],
    },
    pista: 'Si desaparece el par libre, ¿cuántos dominios quedan para repartirse el espacio?',
  },
  {
    titulo: 'Un átomo más para el boro',
    categoria: 'aplicado',
    datos: {
      inicio: { molecula: 'BF₃', atomo: 'B', enlaces: 3, libres: 0 },
      cambio: { tipo: 'enlaces', delta: 1 },
      pregunta: 'molecular',
      opciones: ['Trigonal plana', 'Tetraédrica', 'Pirámide trigonal', 'Cuadrada plana'],
    },
    pista: 'Con 4 dominios, ¿dónde quedan más separados: en un plano o en el espacio?',
  },
  // ── Tres dominios: SO₂ angular, con geometría electrónica trigonal plana ──
  {
    titulo: 'Un par libre para el CO₂',
    categoria: 'abstracto',
    datos: {
      inicio: { molecula: 'CO₂', atomo: 'C', enlaces: 2, libres: 0 },
      cambio: { tipo: 'libres', delta: 1 },
      pregunta: 'electronica',
      opciones: ['Lineal', 'Trigonal plana', 'Tetraédrica'],
    },
    pista: 'La geometría electrónica cuenta TODOS los dominios, también los pares libres.',
  },
  {
    titulo: 'El agua con un par libre menos',
    categoria: 'abstracto',
    datos: {
      inicio: { molecula: 'H₂O', atomo: 'O', enlaces: 2, libres: 2 },
      cambio: { tipo: 'libres', delta: -1 },
      pregunta: 'molecular',
      opciones: ['Lineal', 'Angular', 'Trigonal plana', 'Tetraédrica'],
    },
    pista: 'Aunque haya un par libre menos, ¿sigue quedando alguno que empuje a los átomos?',
  },
  // ── Cinco dominios: la bipirámide trigonal y las posiciones ecuatoriales ──
  {
    titulo: 'Hacia el SF₄',
    categoria: 'aplicado',
    datos: {
      inicio: { molecula: 'SiCl₄', atomo: 'Si', enlaces: 4, libres: 0 },
      cambio: { tipo: 'libres', delta: 1 },
      pregunta: 'molecular',
      opciones: ['Tetraédrica', 'Bipirámide trigonal', 'Balancín (sube y baja)', 'Pirámide cuadrada'],
    },
    pista: 'Son 5 dominios. En la bipirámide, ¿qué posición deja más sitio al par libre: la del ecuador o la del polo?',
  },
  {
    titulo: 'Hacia el ClF₃',
    categoria: 'aplicado',
    datos: {
      inicio: { molecula: 'PCl₃', atomo: 'P', enlaces: 3, libres: 1 },
      cambio: { tipo: 'libres', delta: 1 },
      pregunta: 'molecular',
      opciones: ['Trigonal plana', 'Pirámide trigonal', 'Balancín (sube y baja)', 'Forma T'],
    },
    pista: 'Los pares libres buscan las posiciones del ecuador. ¿Dónde quedan entonces los 3 átomos?',
  },
  {
    titulo: 'Hacia el XeF₂',
    categoria: 'aplicado',
    datos: {
      inicio: { molecula: 'H₂S', atomo: 'S', enlaces: 2, libres: 2 },
      cambio: { tipo: 'libres', delta: 1 },
      pregunta: 'molecular',
      opciones: ['Lineal', 'Trigonal plana', 'Angular', 'Forma T'],
    },
    pista: 'Si los 3 pares libres ocupan todo el ecuador, ¿qué posiciones les quedan a los 2 átomos?',
  },
  // ── Seis dominios: el octaedro ──
  {
    titulo: 'Del SF₄ al XeF₄',
    categoria: 'aplicado',
    datos: {
      inicio: { molecula: 'SF₄', atomo: 'S', enlaces: 4, libres: 1 },
      cambio: { tipo: 'libres', delta: 1 },
      pregunta: 'molecular',
      opciones: ['Tetraédrica', 'Balancín (sube y baja)', 'Pirámide cuadrada', 'Cuadrada plana'],
    },
    pista: 'Son 6 dominios. ¿Dónde se colocan dos pares libres para quedar lo más lejos posible uno del otro?',
  },
  {
    titulo: 'Del SF₄ al BrF₅',
    categoria: 'aplicado',
    datos: {
      inicio: { molecula: 'SF₄', atomo: 'S', enlaces: 4, libres: 1 },
      cambio: { tipo: 'enlaces', delta: 1 },
      pregunta: 'molecular',
      opciones: ['Bipirámide trigonal', 'Balancín (sube y baja)', 'Octaédrica', 'Pirámide cuadrada'],
    },
    pista: 'Son 6 dominios y solo uno es un par libre: quítale un vértice al octaedro.',
  },
  {
    titulo: 'Del SF₆ al XeF₄',
    categoria: 'abstracto',
    datos: {
      inicio: { molecula: 'SF₆', atomo: 'S', enlaces: 6, libres: 0 },
      cambio: { tipo: 'molecula', formula: 'XeF4' },
      pregunta: 'cambia-electronica',
      opciones: [SIN_CAMBIO, 'Tetraédrica', 'Bipirámide trigonal'],
    },
    pista: 'Suma X + E en el SF₆ y en el XeF₄.',
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
// LA REJILLA (convenio, punto 2)
// ============================================================

const MOVIMIENTOS: readonly Cambio[] = [
  { tipo: 'enlaces', delta: 1 },
  { tipo: 'enlaces', delta: -1 },
  { tipo: 'libres', delta: 1 },
  { tipo: 'libres', delta: -1 },
];

/**
 * Ejecuta el modelo sobre los 24 estados de los deslizadores y sus 4 movimientos de un par, y
 * cuenta por qué se excluye cada uno. Los válidos son los escenarios del modo práctica. El punto
 * de partida de cada uno es la molécula de referencia de su combinación.
 */
export function recorrerRejilla(): InformeRejilla {
  const excluidos: Record<MotivoExclusion, number> = {
    'atomo-desconocido': 0,
    'inicio-fuera-de-tabla': 0,
    'fuera-del-deslizador': 0,
    tope: 0,
    'molecula-desconocida': 0,
    'sin-cambio': 0,
    'final-fuera-de-tabla': 0,
  };
  const validos: Escenario[] = [];
  let examinados = 0;
  for (let enlaces = MIN_ENLACES; enlaces <= MAX_ENLACES; enlaces++) {
    for (let libres = MIN_LIBRES; libres <= MAX_LIBRES; libres++) {
      const referencia = MOLECULA_DE_REFERENCIA[claveVsepr(enlaces, libres)];
      const inicio: EstadoInicial = referencia
        ? { molecula: referencia.molecula, atomo: referencia.atomo, enlaces, libres }
        : { molecula: '', atomo: 'C', enlaces, libres };
      for (const cambio of MOVIMIENTOS) {
        examinados++;
        const tras = estadoTrasCambio(inicio, cambio);
        if (tras.ok) validos.push({ inicio, cambio });
        else excluidos[tras.motivo ?? 'inicio-fuera-de-tabla']++;
      }
    }
  }
  return { examinados, excluidos, validos };
}

/** Los escenarios válidos de la rejilla, en orden fijo. */
export const ESCENARIOS_PRACTICA: readonly Escenario[] = recorrerRejilla().validos;

// ============================================================
// MODO PRÁCTICA (aleatorio, reproducible por semilla)
// ============================================================

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * 1, 2, 3… los primeros valores salen diminutos y parecidos, y `Math.floor(rnd() * n)` devuelve
 * el índice 0 para todas las semillas pequeñas: en `simulador-genetica` (14/09/2026) el
 * «aleatorio» daba SIEMPRE el mismo ejercicio, y pasaba la prueba de reproducibilidad porque
 * reproducible no es variado.
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

/** Baraja determinista (Fisher-Yates) con el generador dado. */
function barajar<T>(valores: readonly T[], rnd: () => number): T[] {
  const copia = [...valores];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Las opciones de un ejercicio de práctica: la correcta, los distractores más tentadores (la
 * geometría de partida, la de un dominio más o menos) y, si faltan, otros de la tabla al azar.
 * Todas son valores que el motor puede devolver, y salen en el orden de la tabla para que la
 * correcta no ocupe siempre el mismo sitio.
 */
function opcionesDePractica(
  pregunta: TipoPregunta,
  antes: GeometriaInfo,
  despues: GeometriaInfo,
  final: ParesVsepr,
  rnd: () => number
): Respuesta[] {
  const correcta = respuestaDelModelo(pregunta, antes, despues);
  const total = final.enlaces + final.libres;
  const posibles = valoresPosibles(pregunta, antes);
  const cuantas = pregunta === 'molecular' ? 4 : 3;
  const tentadoras: (string | null)[] =
    pregunta === 'molecular'
      ? [antes.geomMolecular, despues.geomElectronica, geometriaDe(final.enlaces, final.libres - 1)?.geomMolecular ?? null]
      : pregunta === 'electronica'
        ? [antes.geomElectronica, electronicaDeTotal(total - 1), electronicaDeTotal(total + 1)]
        : [SIN_CAMBIO, despues.geomElectronica, electronicaDeTotal(total + 1), electronicaDeTotal(total - 1)];
  const candidatas = sinDuplicados([
    correcta,
    ...tentadoras.filter((v): v is string => v !== null && posibles.includes(v)),
    ...barajar(posibles, rnd),
  ]).slice(0, cuantas);
  const orden = pregunta === 'molecular' ? ORDEN_MOLECULAR : pregunta === 'electronica' ? ORDEN_ELECTRONICA : posibles;
  return candidatas.sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
}

/**
 * Ejercicio al azar sobre un escenario válido de la rejilla (movimiento de un par que ni choca
 * con el tope ni sale de la tabla) y una de las tres preguntas. Usa EL MISMO `resolverCaso` que
 * los doce fijos: si divergieran, el alumno entrenaría con una regla y sería corregido con otra.
 * La variedad se mide sobre el ESCENARIO (inicio, cambio, pregunta), no sobre la respuesta.
 */
export function generarEjercicioAleatorio(semilla: number = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const escenario = ESCENARIOS_PRACTICA[Math.floor(rnd() * ESCENARIOS_PRACTICA.length)] ?? CASOS[2].datos;
  const pregunta = TIPOS_PREGUNTA[Math.floor(rnd() * TIPOS_PREGUNTA.length)] ?? 'molecular';
  const tras = estadoTrasCambio(escenario.inicio, escenario.cambio);
  const antes = geometriaDe(escenario.inicio.enlaces, escenario.inicio.libres);
  const despues = tras.final ? geometriaDe(tras.final.enlaces, tras.final.libres) : null;
  let datos: DatosCaso = CASOS[2].datos;
  if (tras.final !== null && antes !== null && despues !== null) {
    const candidato: DatosCaso = {
      inicio: escenario.inicio,
      cambio: escenario.cambio,
      pregunta,
      opciones: opcionesDePractica(pregunta, antes, despues, tras.final, rnd),
    };
    if (motivoDatosInvalidos(candidato) === null) datos = candidato;
  }
  return { semilla, datos, ...construirPregunta(datos) };
}
