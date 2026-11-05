/**
 * Casos para clase — la tarea asignable de `codigo-colores-resistencias`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la cuenta está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Funciones puras, sin React ni DOM.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 * Toda respuesta sale de `lib/calculadoras/codigoColoresResistencias.ts`, el mismo motor con
 * el que la calculadora pinta sus cifras: `decodificar` (valor, tolerancia, mínimo, máximo y
 * coeficiente de temperatura), `codificar` (el multiplicador de un valor) y `leerValor` (la
 * notación de esquema 4k7, 4M7). La única cuenta propia es la variación por temperatura
 * (valor · ppm · ΔT / 10⁶), que la app enseña por grado y aquí se pide para un salto de ΔT.
 *
 * ── EL CONVENIO, Y CÓMO SE NEUTRALIZA ─────────────────────────────────────────
 *  · El SENTIDO DE LECTURA: cada enunciado dice que la banda de tolerancia va a la derecha y da
 *    los colores en orden. Ningún caso de 5 bandas admite lectura al revés.
 *  · La UNIDAD: Ω, kΩ o MΩ, siempre en la etiqueta. Escribirlo en otra unidad (mil veces más o
 *    menos) se rechaza con nombre propio.
 *  · Las TOLERANCIAS que no coinciden entre ediciones de la norma (naranja, amarillo, gris)
 *    no aparecen: solo marrón, rojo, dorado, plateado y la implícita del 20 % sin banda.
 *  · Todas las respuestas son exactas con a lo sumo tres decimales, así que la tolerancia del
 *    corrector es la de redondeo, que para una cifra exacta es 0.
 *
 * Errores con nombre propio: la unidad cambiada (×1.000 o ÷1.000), el multiplicador leído como
 * una cifra más (rojo-rojo-rojo como 222 Ω) y el máximo por el mínimo (o al revés).
 */

import { formatNumber } from '@/lib';
import {
  codificar,
  color,
  decodificar,
  leerValor,
  type ClaveColor,
  type NumeroBandas,
} from '@/lib/calculadoras/codigoColoresResistencias';
import { corregirNumero, dentroDeTolerancia, toleranciaDeRedondeo, type Magnitud } from '@/lib/calculadoras/correctorCasosAula';

const NBSP = ' ';

export type Unidad = 'Ω' | 'kΩ' | 'MΩ';
const FACTOR: Record<Unidad, number> = { Ω: 1, kΩ: 1e3, MΩ: 1e6 };

export type TipoPregunta = 'valor' | 'minimo' | 'maximo' | 'tolerancia' | 'variacion' | 'ceros' | 'esquema';

export interface DatosCaso {
  tipo: TipoPregunta;
  /** Bandas de la resistencia (valor, mínimo, máximo, tolerancia, variación). */
  n?: NumeroBandas;
  claves?: ClaveColor[];
  /** Unidad en que se pide la respuesta (no en tolerancia ni en ceros). */
  unidad?: Unidad;
  /** Salto de temperatura en °C (variación). */
  incrementoTemperatura?: number;
  /** El valor que hay que escribir con colores (ceros). */
  ohmios?: number;
  /** Lo que pone el esquema (esquema): «4M7». */
  esquema?: string;
}

/** Qué cosa es la respuesta: lo decide la pregunta, y una pregunta nueva no compila sin decidirlo. */
const MAGNITUD: Record<TipoPregunta, Magnitud> = {
  valor: 'real',
  minimo: 'real',
  maximo: 'real',
  variacion: 'real',
  esquema: 'real',
  tolerancia: 'porcentaje',
  ceros: { entero: true, minimo: 0, maximo: 9, que: 'el número de ceros' },
};

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error: string;
}

// ─── Textos ────────────────────────────────────────────────────────────────

/** Decimales justos de una cifra exacta (0 a 3); 4 si necesitaría más. */
export function decimalesDe(valor: number): number {
  for (let d = 0; d <= 3; d += 1) {
    if (Math.abs(Math.round(valor * 10 ** d) - valor * 10 ** d) < 1e-6) return d;
  }
  return 4;
}

function cifra(valor: number): string {
  return formatNumber(valor, Math.min(decimalesDe(valor), 3));
}

function enUnidad(ohmios: number, unidad: Unidad): number {
  return Number((ohmios / FACTOR[unidad]).toPrecision(12));
}

function textoOhmios(ohmios: number, unidad: Unidad = 'Ω'): string {
  return `${cifra(enUnidad(ohmios, unidad))}${NBSP}${unidad}`;
}

function textoPorcentaje(p: number): string {
  return `${cifra(p)}${NBSP}%`;
}

function listaColores(claves: ClaveColor[]): string {
  const nombres = claves.map((k) => color(k).nombre.toLowerCase());
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}

function textoMultiplicador(exponente: number): string {
  if (exponente === -1) return '×0,1';
  if (exponente === -2) return '×0,01';
  return `×${formatNumber(10 ** exponente, 0)}`;
}

/** «amarillo (4), violeta (7), rojo (×100) y dorado (±5 %)». */
function bandasExplicadas(n: NumeroBandas, claves: ClaveColor[]): string {
  const cifras = n <= 4 ? 2 : 3;
  const partes = claves.map((k, i) => {
    const c = color(k);
    if (i < cifras) return `${c.nombre.toLowerCase()} (${c.cifra})`;
    if (i === cifras) return `${c.nombre.toLowerCase()} (${textoMultiplicador(c.exponente as number)})`;
    if (i === cifras + 1) return `${c.nombre.toLowerCase()} (±${textoPorcentaje(c.tolerancia as number)})`;
    return `${c.nombre.toLowerCase()} (${c.coefTemperatura}${NBSP}ppm/K)`;
  });
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

export const ETIQUETAS: Record<TipoPregunta, (u?: Unidad) => string> = {
  valor: (u) => `Valor nominal, en ${u}`,
  minimo: (u) => `Valor mínimo, en ${u}`,
  maximo: (u) => `Valor máximo, en ${u}`,
  tolerancia: () => 'Tolerancia, en %',
  variacion: (u) => `Variación del valor, en ${u}`,
  ceros: () => 'Número de ceros que añade el multiplicador (sin unidad)',
  esquema: (u) => `Valor, en ${u}`,
};

export function etiquetaDe(datos: DatosCaso): string {
  return ETIQUETAS[datos.tipo](datos.unidad);
}

// ─── Resolver ──────────────────────────────────────────────────────────────

const MAL: Resolucion = { ok: false, valor: NaN, pasos: [], error: 'Datos incompletos.' };

/** Recalcula la respuesta desde los datos, sin mirar la que trae el caso. Nunca lanza. */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const u = datos.unidad ?? 'Ω';

  if (datos.tipo === 'esquema') {
    const ohmios = datos.esquema ? leerValor(datos.esquema) : null;
    if (ohmios === null) return { ...MAL, error: 'El esquema no es un valor.' };
    const letra = datos.esquema!.replace(/\d/g, '');
    const nombre = letra.toLowerCase() === 'k' ? 'kilo (×1.000)' : letra.toLowerCase() === 'm' ? 'mega (×1.000.000)' : 'ohmios (×1)';
    return {
      ok: true,
      valor: enUnidad(ohmios, u),
      error: '',
      pasos: [
        `En ${datos.esquema} la letra ${letra} es el multiplicador y hace de coma: ${letra} = ${nombre}.`,
        `${datos.esquema} = ${datos.esquema!.replace(letra, ',')} ${letra === 'R' ? 'Ω' : letra === 'k' ? 'kΩ' : 'MΩ'} = ${textoOhmios(ohmios)}.`,
        `En ${u}: ${textoOhmios(ohmios)} ÷ ${formatNumber(FACTOR[u], 0)} = ${textoOhmios(ohmios, u)}.`,
      ],
    };
  }

  if (datos.tipo === 'ceros') {
    if (!datos.ohmios) return MAL;
    const c = codificar(datos.ohmios, 4, 'dorado');
    if (!c || !c.exacto) return { ...MAL, error: 'Ese valor no se escribe con dos cifras.' };
    const mult = color(c.claves[2]);
    const exponente = mult.exponente as number;
    if (exponente < 0) return { ...MAL, error: 'El multiplicador divide, no añade ceros.' };
    const cifras = `${color(c.claves[0]).cifra}${color(c.claves[1]).cifra}`;
    return {
      ok: true,
      valor: exponente,
      error: '',
      pasos: [
        `${textoOhmios(datos.ohmios)} se escribe con dos cifras significativas: ${cifras} (${color(c.claves[0]).nombre.toLowerCase()} y ${color(c.claves[1]).nombre.toLowerCase()}).`,
        `${cifras} × ${formatNumber(10 ** exponente, 0)} = ${formatNumber(datos.ohmios, 0)}: hay que añadir ${exponente} ${exponente === 1 ? 'cero' : 'ceros'}.`,
        `La tercera banda es la del color de la cifra ${exponente}: ${mult.nombre.toLowerCase()}. Los colores completos: ${listaColores(c.claves)}.`,
      ],
    };
  }

  if (!datos.n || !datos.claves) return MAL;
  const r = decodificar(datos.n, datos.claves);
  if (!r) return { ...MAL, error: 'Esos colores no forman una resistencia.' };
  const cifras = datos.n <= 4 ? 2 : 3;
  const numero = datos.claves.slice(0, cifras).map((k) => color(k).cifra).join('');
  const mult = color(datos.claves[cifras]).exponente as number;
  const pasoBandas = `Bandas: ${bandasExplicadas(datos.n, datos.claves)}.`;
  const pasoValor = `Las cifras forman ${numero}; por el multiplicador: ${numero} × ${textoMultiplicador(mult).slice(1)} = ${textoOhmios(r.ohmios)}.`;
  const pasoUnidad = (ohmios: number) =>
    u === 'Ω' ? [] : [`En ${u}: ${textoOhmios(ohmios)} ÷ ${formatNumber(FACTOR[u], 0)} = ${textoOhmios(ohmios, u)}.`];
  const pasoTolerancia = r.toleranciaImplicita
    ? `No hay banda de tolerancia: se supone ±${textoPorcentaje(r.tolerancia)}.`
    : `Tolerancia ±${textoPorcentaje(r.tolerancia)}: el ${textoPorcentaje(r.tolerancia)} de ${textoOhmios(r.ohmios)} es ${textoOhmios(Number((r.ohmios * r.tolerancia / 100).toPrecision(12)))}.`;

  switch (datos.tipo) {
    case 'valor':
      return { ok: true, valor: enUnidad(r.ohmios, u), error: '', pasos: [pasoBandas, pasoValor, ...pasoUnidad(r.ohmios)] };
    case 'tolerancia':
      return { ok: true, valor: r.tolerancia, error: '', pasos: [pasoBandas, pasoTolerancia] };
    case 'minimo':
    case 'maximo': {
      const limite = datos.tipo === 'minimo' ? r.minimo : r.maximo;
      const desviacion = Number((r.ohmios * r.tolerancia / 100).toPrecision(12));
      const signo = datos.tipo === 'minimo' ? '−' : '+';
      return {
        ok: true,
        valor: enUnidad(limite, u),
        error: '',
        pasos: [
          pasoBandas,
          pasoValor,
          `Tolerancia ±${textoPorcentaje(r.tolerancia)}: el ${textoPorcentaje(r.tolerancia)} de ${textoOhmios(r.ohmios)} es ${textoOhmios(desviacion)}.`,
          `${datos.tipo === 'minimo' ? 'Mínimo' : 'Máximo'}: ${textoOhmios(r.ohmios)} ${signo} ${textoOhmios(desviacion)} = ${textoOhmios(limite)}.`,
          ...pasoUnidad(limite),
        ],
      };
    }
    case 'variacion': {
      if (r.coefTemperatura === null || !datos.incrementoTemperatura) return { ...MAL, error: 'Hace falta la sexta banda y un salto de temperatura.' };
      const porGrado = Number((r.ohmios * r.coefTemperatura / 1e6).toPrecision(12));
      const total = Number((porGrado * datos.incrementoTemperatura).toPrecision(12));
      return {
        ok: true,
        valor: enUnidad(total, u),
        error: '',
        pasos: [
          pasoBandas,
          pasoValor,
          `${r.coefTemperatura} ppm/K son ${r.coefTemperatura} millonésimas del valor por cada grado: ${textoOhmios(r.ohmios)} × ${r.coefTemperatura} ÷ 1.000.000 = ${textoOhmios(porGrado)} por grado.`,
          `En ${datos.incrementoTemperatura} °C: ${textoOhmios(porGrado)} × ${datos.incrementoTemperatura} = ${textoOhmios(total)}.`,
          ...pasoUnidad(total),
        ],
      };
    }
    default:
      return MAL;
  }
}

// ─── Los 12 casos ──────────────────────────────────────────────────────────

const LEIDA = 'leída con la banda de tolerancia a la derecha';

interface DefinicionCaso {
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  pista: string;
}

const DEFINICIONES: DefinicionCaso[] = [
  {
    titulo: 'Cuatro bandas en ohmios',
    enunciado: `Una resistencia de 4 bandas, ${LEIDA}, tiene los colores marrón, negro, rojo y dorado. ¿Cuál es su valor nominal en ohmios?`,
    categoria: 'abstracto',
    datos: { tipo: 'valor', n: 4, claves: ['marron', 'negro', 'rojo', 'dorado'], unidad: 'Ω' },
    pista: 'Marrón es 1, negro es 0 y el rojo, como multiplicador, añade dos ceros.',
  },
  {
    titulo: 'El valor en kiloohmios',
    enunciado: `Una resistencia de 4 bandas, ${LEIDA}, es amarillo, violeta, rojo y dorado. ¿Cuál es su valor nominal en kiloohmios?`,
    categoria: 'abstracto',
    datos: { tipo: 'valor', n: 4, claves: ['amarillo', 'violeta', 'rojo', 'dorado'], unidad: 'kΩ' },
    pista: 'Calcula primero en ohmios y divide entre 1.000.',
  },
  {
    titulo: 'Tres bandas iguales',
    enunciado: `Una resistencia de 4 bandas, ${LEIDA}, tiene las tres primeras rojas y la cuarta dorada. ¿Cuál es su valor nominal en ohmios?`,
    categoria: 'abstracto',
    datos: { tipo: 'valor', n: 4, claves: ['rojo', 'rojo', 'rojo', 'dorado'], unidad: 'Ω' },
    pista: 'La tercera banda no es una cifra: es el número de ceros.',
  },
  {
    titulo: 'Multiplicador dorado',
    enunciado: `Una resistencia de 4 bandas, ${LEIDA}, es amarillo, violeta, dorado y dorado. ¿Cuál es su valor nominal en ohmios?`,
    categoria: 'abstracto',
    datos: { tipo: 'valor', n: 4, claves: ['amarillo', 'violeta', 'dorado', 'dorado'], unidad: 'Ω' },
    pista: 'Un multiplicador dorado no añade ceros: divide entre 10.',
  },
  {
    titulo: 'Una resistencia de tres bandas',
    enunciado: 'Una resistencia antigua solo tiene tres bandas: marrón, negro y amarillo. ¿Cuál es su valor nominal en kiloohmios?',
    categoria: 'aplicado',
    datos: { tipo: 'valor', n: 3, claves: ['marron', 'negro', 'amarillo'], unidad: 'kΩ' },
    pista: 'Con tres bandas son dos cifras y el multiplicador. El amarillo añade cuatro ceros.',
  },
  {
    titulo: 'Sin banda de tolerancia',
    enunciado: 'Una resistencia tiene solo tres bandas: rojo, violeta y naranja. ¿Qué tolerancia hay que suponerle, en porcentaje?',
    categoria: 'abstracto',
    datos: { tipo: 'tolerancia', n: 3, claves: ['rojo', 'violeta', 'naranja'] },
    pista: 'Cuando falta la banda de tolerancia, la norma supone la más amplia.',
  },
  {
    titulo: 'Lo mínimo que puede medir',
    enunciado: `Mides con el multímetro una resistencia de 4 bandas marrón, negro, rojo y dorado (${LEIDA}). ¿Cuál es el valor más bajo que puede dar y seguir dentro de su tolerancia, en ohmios?`,
    categoria: 'aplicado',
    datos: { tipo: 'minimo', n: 4, claves: ['marron', 'negro', 'rojo', 'dorado'], unidad: 'Ω' },
    pista: 'Calcula el 5 % del valor nominal y réstaselo.',
  },
  {
    titulo: 'Lo máximo que puede medir',
    enunciado: `Una resistencia de 4 bandas, ${LEIDA}, es naranja, naranja, marrón y plateado. ¿Cuál es el valor más alto que puede medir sin salirse de su tolerancia, en ohmios?`,
    categoria: 'aplicado',
    datos: { tipo: 'maximo', n: 4, claves: ['naranja', 'naranja', 'marron', 'plateado'], unidad: 'Ω' },
    pista: 'La banda plateada es una tolerancia del 10 %.',
  },
  {
    titulo: 'Cinco bandas de precisión',
    enunciado: `Una resistencia de precisión de 5 bandas, ${LEIDA}, es amarillo, blanco, blanco, marrón y marrón. ¿Cuál es su valor nominal en kiloohmios?`,
    categoria: 'abstracto',
    datos: { tipo: 'valor', n: 5, claves: ['amarillo', 'blanco', 'blanco', 'marron', 'marron'], unidad: 'kΩ' },
    pista: 'Con cinco bandas hay tres cifras antes del multiplicador.',
  },
  {
    titulo: 'La sexta banda',
    enunciado: `Un sensor lleva una resistencia de 6 bandas, ${LEIDA}: naranja, naranja, negro, marrón, marrón y rojo. Si se calienta 40 °C, ¿cuánto cambia su valor, en ohmios?`,
    categoria: 'aplicado',
    datos: { tipo: 'variacion', n: 6, claves: ['naranja', 'naranja', 'negro', 'marron', 'marron', 'rojo'], unidad: 'Ω', incrementoTemperatura: 40 },
    pista: 'La sexta banda roja son 50 ppm/K: 50 millonésimas del valor por cada grado.',
  },
  {
    titulo: 'Buscarla en la caja',
    enunciado: 'Un montaje pide una resistencia de 47.000 Ω y vas a buscarla en una caja de resistencias de 4 bandas. ¿Cuántos ceros añade su tercera banda, la del multiplicador?',
    categoria: 'aplicado',
    datos: { tipo: 'ceros', ohmios: 47000 },
    pista: 'Escribe el valor con dos cifras significativas y cuenta los ceros que siguen.',
  },
  {
    titulo: 'La notación de los esquemas',
    enunciado: 'En el esquema de un circuito, junto a una resistencia, pone 4M7. ¿Cuál es su valor en kiloohmios?',
    categoria: 'aplicado',
    datos: { tipo: 'esquema', esquema: '4M7', unidad: 'kΩ' },
    pista: 'La M es mega (un millón) y ocupa el lugar de la coma.',
  },
];

export const CASOS: readonly Caso[] = DEFINICIONES.map((d, i) => {
  const r = resolverCaso(d.datos);
  const etiqueta = etiquetaDe(d.datos);
  return {
    id: i + 1,
    titulo: d.titulo,
    enunciado: d.enunciado,
    categoria: d.categoria,
    datos: d.datos,
    etiquetaRespuesta: etiqueta,
    respuesta: r.valor,
    respuestaTexto: textoRespuesta(r.valor, d.datos),
    pasos: r.pasos,
    pista: d.pista,
  };
});

export const TOTAL_CASOS = CASOS.length;

export function textoRespuesta(valor: number, datos: DatosCaso): string {
  if (!Number.isFinite(valor)) return '—';
  if (datos.tipo === 'tolerancia') return `±${textoPorcentaje(valor)}`;
  if (datos.tipo === 'ceros') return `${formatNumber(valor, 0)} ${valor === 1 ? 'cero' : 'ceros'}`;
  return `${cifra(valor)}${NBSP}${datos.unidad ?? 'Ω'}`;
}

// ─── Corrector ─────────────────────────────────────────────────────────────

export function toleranciaDe(esperado: number): number {
  return toleranciaDeRedondeo(esperado, Math.min(decimalesDe(esperado), 3));
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Lo que daría quien lee el multiplicador como una cifra más (rojo-rojo-rojo → 222 Ω). */
function multiplicadorComoCifra(datos: DatosCaso): number | null {
  if (datos.tipo !== 'valor' || !datos.n || !datos.claves) return null;
  const cifras = datos.n <= 4 ? 2 : 3;
  const mult = color(datos.claves[cifras]);
  if (mult.cifra === null) return null;
  const numero = Number(datos.claves.slice(0, cifras + 1).map((k) => color(k).cifra).join(''));
  return enUnidad(numero, datos.unidad ?? 'Ω');
}

export function comprobarRespuesta(usuario: number, esperado: number, datos: DatosCaso): Veredicto {
  const tolerancia = toleranciaDe(esperado);
  const c = corregirNumero(usuario, esperado, { tolerancia, magnitud: MAGNITUD[datos.tipo] });
  const base = { diferencia: c.diferencia, tolerancia };

  if (c.estado === 'no-numerico') {
    return { ...base, correcto: false, motivo: 'Escribe un número (puedes usar coma decimal, como 4,7), sin la unidad.' };
  }
  if (c.estado === 'imposible') return { ...base, correcto: false, motivo: c.motivoImposible ?? 'Ese valor no es posible.' };
  if (c.estado === 'acierto') {
    return { ...base, correcto: true, motivo: `Correcto: ${textoRespuesta(esperado, datos)}.` };
  }

  const u = datos.unidad;
  if (u && datos.tipo !== 'tolerancia' && datos.tipo !== 'ceros' && esperado !== 0) {
    if (dentroDeTolerancia(usuario, esperado * 1000, tolerancia * 1000)) {
      const otra = u === 'kΩ' ? 'Ω' : u === 'MΩ' ? 'kΩ' : 'mΩ';
      return { ...base, correcto: false, motivo: `Parece que lo has escrito en ${otra}: se pide en ${u}. Divide entre 1.000.` };
    }
    if (dentroDeTolerancia(usuario, esperado / 1000, tolerancia / 1000)) {
      const otra = u === 'Ω' ? 'kΩ' : u === 'kΩ' ? 'MΩ' : 'GΩ';
      return { ...base, correcto: false, motivo: `Parece que lo has escrito en ${otra}: se pide en ${u}. Multiplica por 1.000.` };
    }
  }
  const comoCifra = multiplicadorComoCifra(datos);
  if (comoCifra !== null && dentroDeTolerancia(usuario, comoCifra, tolerancia)) {
    return { ...base, correcto: false, motivo: 'Has leído el multiplicador como una cifra más: la tercera banda dice cuántos ceros añadir.' };
  }
  if ((datos.tipo === 'minimo' || datos.tipo === 'maximo') && datos.n && datos.claves) {
    const r = decodificar(datos.n, datos.claves);
    if (r) {
      const opuesto = enUnidad(datos.tipo === 'minimo' ? r.maximo : r.minimo, u ?? 'Ω');
      if (dentroDeTolerancia(usuario, opuesto, tolerancia)) {
        return { ...base, correcto: false, motivo: `Ese es el valor ${datos.tipo === 'minimo' ? 'máximo' : 'mínimo'}: se pide el ${datos.tipo === 'minimo' ? 'mínimo' : 'máximo'}.` };
      }
    }
  }
  return { ...base, correcto: false, motivo: 'No es correcto. Repasa los pasos o mira la pista.' };
}

// ─── Práctica ──────────────────────────────────────────────────────────────

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

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.floor(rnd() * lista.length)];
}

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

const CIFRA_A_CLAVE: ClaveColor[] = ['negro', 'marron', 'rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta', 'gris', 'blanco'];
const PARES_E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
const TOLERANCIAS_PRACTICA: ClaveColor[] = ['dorado', 'plateado', 'marron', 'rojo'];
const TIPOS_PRACTICA: TipoPregunta[] = ['valor', 'minimo', 'maximo', 'ceros'];

function unidadNatural(ohmios: number): Unidad {
  return ohmios >= 1e6 ? 'MΩ' : ohmios >= 1e3 ? 'kΩ' : 'Ω';
}

/**
 * Un ejercicio con valores de la serie E12 en 4 bandas. Usa el MISMO `resolverCaso` que los
 * casos fijos; la semilla se mezcla (splitmix32) para que semillas pequeñas no den siempre lo
 * mismo. Solo se aceptan respuestas exactas con hasta tres decimales.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  for (let intento = 0; intento < 30; intento += 1) {
    const tipo = elegir(TIPOS_PRACTICA, rnd);
    const par = elegir(PARES_E12, rnd);
    const exponente = 1 + Math.floor(rnd() * 5); // ×10 a ×100.000: de 100 Ω a 8,2 MΩ
    const ohmios = par * 10 ** exponente;

    let datos: DatosCaso;
    let enunciado: string;
    if (tipo === 'ceros') {
      datos = { tipo, ohmios };
      enunciado = `Necesitas una resistencia de ${formatNumber(ohmios, 0)} Ω de 4 bandas. ¿Cuántos ceros añade su banda del multiplicador?`;
    } else {
      const tolerancia = elegir(TOLERANCIAS_PRACTICA, rnd);
      const claves: ClaveColor[] = [CIFRA_A_CLAVE[Math.floor(par / 10)], CIFRA_A_CLAVE[par % 10], CIFRA_A_CLAVE[exponente], tolerancia];
      const unidad = unidadNatural(ohmios);
      datos = { tipo, n: 4, claves, unidad };
      const pregunta = tipo === 'valor' ? 'su valor nominal' : tipo === 'minimo' ? 'el valor más bajo que admite su tolerancia' : 'el valor más alto que admite su tolerancia';
      const nombreUnidad = unidad === 'Ω' ? 'ohmios' : unidad === 'kΩ' ? 'kiloohmios' : 'megaohmios';
      enunciado = `Una resistencia de 4 bandas, ${LEIDA}, es ${listaColores(claves)}. ¿Cuál es ${pregunta}, en ${nombreUnidad}?`;
    }
    const r = resolverCaso(datos);
    if (r.ok && Number.isFinite(r.valor) && decimalesDe(r.valor) <= 3) {
      return { enunciado, datos, respuesta: r.valor, etiquetaRespuesta: etiquetaDe(datos), pasos: r.pasos };
    }
  }
  // Salida segura: 4,7 kΩ ±5 %
  const datos: DatosCaso = { tipo: 'valor', n: 4, claves: ['amarillo', 'violeta', 'rojo', 'dorado'], unidad: 'kΩ' };
  const r = resolverCaso(datos);
  return {
    enunciado: `Una resistencia de 4 bandas, ${LEIDA}, es amarillo, violeta, rojo y dorado. ¿Cuál es su valor nominal, en kiloohmios?`,
    datos,
    respuesta: r.valor,
    etiquetaRespuesta: etiquetaDe(datos),
    pasos: r.pasos,
  };
}
