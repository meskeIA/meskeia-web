/**
 * Casos para clase — la tarea asignable de `simulador-circuitos-electricos`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y nada lanza excepciones.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Ninguna fórmula de circuitos se reescribe aquí: todo se calcula con `./motor.ts`
 * (`resolverOhm`, `resolverSerie`, `resolverParalelo` y `resolverPotencia`), que son los
 * cuerpos de `calcOhm`, `calcSerie`, `calcParalelo` y `calcPotencia` trasladados tal cual. Si
 * la corrección y el panel calcularan distinto, la app suspendería una respuesta que ella misma
 * imprime.
 *
 * Las únicas cuentas propias de este fichero son CONVERSIONES de presentación (A ↔ mA,
 * kΩ ↔ Ω) y las cifras intermedias que se escriben en el paso a paso (1/R de cada rama), que no
 * deciden ninguna respuesta.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 *   · Ohm con los tres despejes: V = I·R · I = V/R · R = V/I.
 *   · Serie: Req = ΣR. Paralelo: Req = 1/Σ(1/R).
 *   · P = V·I (si falta V o I, se despeja antes con la ley de Ohm, como la pestaña Potencia).
 *   · Energía en kWh = P/1000 · horas · días. Coste = kWh · tarifa.
 *   · ⚠️ Nada de «€» en los enunciados: la tarifa va en «unidades monetarias por kWh». El
 *     público de este canal es sobre todo latinoamericano; la pestaña Potencia rotula su campo
 *     en €/kWh, y `comoComprobar` avisa de que la cuenta vale para cualquier moneda.
 *   · Las corrientes se piden en la unidad que dice la casilla (A o mA), y la solución usa esa
 *     misma unidad.
 *
 * ⚠️ Ningún TÍTULO ni ETIQUETA lleva las palabras de los controles de la app («Calcular»,
 * «Aumentar», «Reducir», «Tensión de fuente (V)», «Corriente I (A)»…): el título entra en el
 * nombre accesible del botón de cada caso y la etiqueta en el de la casilla, y el acta del
 * Inspector (`tests/apps/simulador-circuitos-electricos.spec.ts`) localiza esos controles por
 * nombre PARCIAL.
 */

import { formatNumber } from '@/lib';
import { resolverOhm, resolverParalelo, resolverPotencia, resolverSerie, type Incognita } from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta =
  /** Ley de Ohm: la magnitud `incognita` a partir de las otras dos. */
  | 'ohm'
  /** Serie: la resistencia equivalente. */
  | 'serieEquivalente'
  /** Serie: la corriente del circuito (la misma en todas las resistencias). */
  | 'serieCorriente'
  /** Serie: la tensión en la resistencia `rama`. */
  | 'serieTension'
  /** Paralelo: la resistencia equivalente. */
  | 'paraleloEquivalente'
  /** Paralelo: la corriente total que entrega la fuente. */
  | 'paraleloCorrienteTotal'
  /** Paralelo: la corriente por la resistencia `rama`. */
  | 'paraleloCorrienteRama'
  /** Potencia P = V·I (despejando antes lo que falte). */
  | 'potencia'
  /** Energía del periodo en kWh. */
  | 'energia'
  /** Coste del periodo en unidades monetarias. */
  | 'coste';

export interface DatosCaso {
  pregunta: Pregunta;
  /** Solo en `ohm`: la magnitud que se despeja. */
  incognita?: Incognita;
  /** Tensión en V (la de la fuente, en serie y paralelo). */
  V?: number;
  /** Corriente en A. */
  I?: number;
  /** Resistencia en Ω. */
  R?: number;
  /** Serie y paralelo: las resistencias, en Ω. */
  resistencias?: readonly number[];
  /** Serie y paralelo: índice (desde 0) de la resistencia por la que se pregunta. */
  rama?: number;
  /** Potencia: horas de uso al día, días del periodo y tarifa (unidades monetarias por kWh). */
  horas?: number;
  dias?: number;
  tarifa?: number;
  /** La corriente que se PIDE va en mA (por defecto, en A). */
  enMiliamperios?: boolean;
  /** El enunciado da la corriente en mA: el paso a paso la convierte a A. */
  corrienteDadaEnMa?: boolean;
  /** El enunciado da las resistencias en kΩ: el paso a paso las convierte a Ω. */
  resistenciasDadasEnKiloohmios?: boolean;
  /** Decimales de la respuesta. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Utilidades ─────────────────────────── */

/** Cifra intermedia en formato español, sin ceros de relleno: «0,0025532», «4700». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

export function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** true si la cifra exacta tiene más decimales de los que se muestran: el enunciado lo dice. */
export function exigeRedondeo(valor: number, decimales: number): boolean {
  if (!Number.isFinite(valor)) return false;
  return Math.abs(redondear(valor, decimales) - valor) > 1e-9 * Math.max(1, Math.abs(valor));
}

/** «a unidades», «a una décima», «a dos decimales»: lo mismo que dice el enunciado. */
function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  return `a ${decimales} decimales`;
}

const SUBINDICES = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** «R₂» para el índice 1: el nombre con el que el enunciado llama a cada resistencia. */
function nombreR(indice: number): string {
  return `R${String(indice + 1)
    .split('')
    .map((d) => SUBINDICES[Number(d)])
    .join('')}`;
}

/** «R₁ + R₂ + R₃» o «1/R₁ + 1/R₂». */
function listaNombres(n: number, inverso: boolean): string {
  return Array.from({ length: n }, (_, i) => (inverso ? `1/${nombreR(i)}` : nombreR(i))).join(' + ');
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/** Unidad en la que sale la respuesta de cada pregunta. */
export function unidadDe(datos: DatosCaso): string {
  switch (datos.pregunta) {
    case 'ohm':
      if (datos.incognita === 'V') return 'V';
      if (datos.incognita === 'R') return 'Ω';
      return datos.enMiliamperios ? 'mA' : 'A';
    case 'serieEquivalente':
    case 'paraleloEquivalente':
      return 'Ω';
    case 'serieCorriente':
    case 'paraleloCorrienteTotal':
    case 'paraleloCorrienteRama':
      return datos.enMiliamperios ? 'mA' : 'A';
    case 'serieTension':
      return 'V';
    case 'potencia':
      return 'W';
    case 'energia':
      return 'kWh';
    case 'coste':
      return 'unidades monetarias';
    default:
      return '';
  }
}

/** «5,62 V», «500 mA», «3,00 unidades monetarias»: la cifra con sus decimales y su unidad. */
export function textoConUnidad(valor: number, unidad: string, decimales: number): string {
  if (!Number.isFinite(valor)) return '—';
  const cifra = formatNumber(valor, decimales);
  return unidad ? `${cifra} ${unidad}` : cifra;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (V, A o mA, Ω, W, kWh o unidades monetarias). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Falta un dato obligatorio: se responde con un error legible, nunca con una excepción. */
function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

/** Si la corriente se pide en mA, el paso que la convierte; si no, la misma cifra en A. */
function corrienteEnSuUnidad(amperios: number, datos: DatosCaso, pasos: string[]): number {
  if (!datos.enMiliamperios) return amperios;
  const ma = amperios * 1000;
  pasos.push(`En miliamperios (1 A = 1000 mA): ${numero(amperios, 6)} A = ${numero(ma, 4)} mA.`);
  return ma;
}

/** Las resistencias tal como las da el enunciado, con el paso que las pasa a ohmios si venían en kΩ. */
function resistenciasDelCaso(datos: DatosCaso, pasos: string[]): number[] | null {
  const rs = datos.resistencias;
  if (!rs || rs.length < 1 || !rs.every((r) => positivo(r))) return null;
  if (datos.resistenciasDadasEnKiloohmios) {
    pasos.push(
      `Primero, las resistencias en ohmios (1 kΩ = 1000 Ω): ${rs
        .map((r, i) => `${nombreR(i)} = ${numero(r / 1000)} kΩ = ${numero(r)} Ω`)
        .join(', ')}.`,
    );
  }
  return [...rs];
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  let valor: number;

  switch (datos.pregunta) {
    /* ── Ley de Ohm ────────────────────────────────────────────────────── */
    case 'ohm': {
      if (datos.incognita === 'V') {
        if (!positivo(datos.I)) return falta('la corriente', pasos);
        if (!positivo(datos.R)) return falta('la resistencia', pasos);
        if (datos.corrienteDadaEnMa) {
          pasos.push(`Primero, la corriente en amperios (1 A = 1000 mA): ${numero(datos.I * 1000)} mA = ${numero(datos.I)} A.`);
        }
        const r = resolverOhm('V', datos.I, datos.R);
        if (!r) return falta('valores dentro de rango', pasos);
        pasos.push(`Ley de Ohm: V = I·R = ${numero(datos.I)}·${numero(datos.R)} = ${numero(r.V)} V.`);
        valor = r.V;
      } else if (datos.incognita === 'I') {
        if (!positivo(datos.V)) return falta('la tensión', pasos);
        if (!positivo(datos.R)) return falta('la resistencia', pasos);
        const r = resolverOhm('I', datos.V, datos.R);
        if (!r) return falta('valores dentro de rango', pasos);
        pasos.push(`Ley de Ohm despejando la corriente: I = V/R = ${numero(datos.V)}/${numero(datos.R)} = ${numero(r.I, 6)} A.`);
        valor = corrienteEnSuUnidad(r.I, datos, pasos);
      } else if (datos.incognita === 'R') {
        if (!positivo(datos.V)) return falta('la tensión', pasos);
        if (!positivo(datos.I)) return falta('la corriente', pasos);
        const r = resolverOhm('R', datos.V, datos.I);
        if (!r) return falta('valores dentro de rango', pasos);
        pasos.push(`Ley de Ohm despejando la resistencia: R = V/I = ${numero(datos.V)}/${numero(datos.I)} = ${numero(r.R)} Ω.`);
        valor = r.R;
      } else {
        return { ok: false, valor: NaN, pasos, error: 'Falta la magnitud que se despeja.' };
      }
      break;
    }

    /* ── Serie ─────────────────────────────────────────────────────────── */
    case 'serieEquivalente':
    case 'serieCorriente':
    case 'serieTension': {
      const rs = resistenciasDelCaso(datos, pasos);
      if (!rs) return falta('resistencias positivas', pasos);
      if (!positivo(datos.V)) return falta('la tensión de la fuente', pasos);
      const s = resolverSerie(datos.V, rs);
      pasos.push(
        `En serie las resistencias se suman: Req = ${listaNombres(rs.length, false)} = ${rs.map((r) => numero(r)).join(' + ')} = ${numero(s.Req)} Ω.`,
      );
      if (datos.pregunta === 'serieEquivalente') {
        pasos.push('La tensión de la fuente no influye en la resistencia equivalente: solo depende de las resistencias.');
        valor = s.Req;
        break;
      }
      pasos.push(
        `La corriente es la misma en todo el circuito: I = V/Req = ${numero(datos.V)}/${numero(s.Req)} = ${numero(s.I, 7)} A.`,
      );
      if (datos.pregunta === 'serieCorriente') {
        valor = corrienteEnSuUnidad(s.I, datos, pasos);
        break;
      }
      const k = datos.rama ?? -1;
      if (k < 0 || k >= rs.length) return falta('la resistencia por la que se pregunta', pasos);
      valor = s.tensiones[k];
      pasos.push(
        `Tensión en ${nombreR(k)}: V${SUBINDICES[k + 1] ?? ''} = I·${nombreR(k)} = ${numero(s.I, 7)}·${numero(rs[k])} = ${numero(valor)} V.`,
      );
      pasos.push(
        `Comprobación: la suma de las caídas de tensión de todas las resistencias vuelve a dar los ${numero(datos.V)} V de la fuente.`,
      );
      break;
    }

    /* ── Paralelo ──────────────────────────────────────────────────────── */
    case 'paraleloEquivalente':
    case 'paraleloCorrienteTotal':
    case 'paraleloCorrienteRama': {
      const rs = resistenciasDelCaso(datos, pasos);
      if (!rs) return falta('resistencias positivas', pasos);
      if (!positivo(datos.V)) return falta('la tensión de la fuente', pasos);
      const p = resolverParalelo(datos.V, rs);
      if (datos.pregunta === 'paraleloEquivalente') {
        pasos.push(
          `En paralelo se suman los inversos: 1/Req = ${listaNombres(rs.length, true)} = ${rs.map((r) => `1/${numero(r)}`).join(' + ')} = ${numero(1 / p.Req, 6)}.`,
        );
        valor = p.Req;
        pasos.push(`Req = 1/${numero(1 / p.Req, 6)} = ${numero(valor)} Ω, menor que la más pequeña de las resistencias.`);
        break;
      }
      pasos.push(`En paralelo todas las ramas reciben la misma tensión: la de la fuente, ${numero(datos.V)} V.`);
      if (datos.pregunta === 'paraleloCorrienteTotal') {
        pasos.push(
          `Corriente de cada rama, I = V/R: ${rs.map((r, i) => `${nombreR(i)}: ${numero(datos.V ?? NaN)}/${numero(r)} = ${numero(p.corrientes[i], 6)} A`).join(' · ')}.`,
        );
        pasos.push(
          `La corriente total es la suma de las de las ramas: I = ${p.corrientes.map((c) => numero(c, 6)).join(' + ')} = ${numero(p.Itotal, 6)} A.`,
        );
        pasos.push(
          `Atajo: Req = ${numero(p.Req)} Ω, así que I = V/Req = ${numero(datos.V)}/${numero(p.Req)}, lo mismo.`,
        );
        valor = corrienteEnSuUnidad(p.Itotal, datos, pasos);
        break;
      }
      const k = datos.rama ?? -1;
      if (k < 0 || k >= rs.length) return falta('la rama por la que se pregunta', pasos);
      pasos.push(
        `Corriente por ${nombreR(k)}: I = V/${nombreR(k)} = ${numero(datos.V)}/${numero(rs[k])} = ${numero(p.corrientes[k], 6)} A. Las demás ramas no influyen en ella.`,
      );
      valor = corrienteEnSuUnidad(p.corrientes[k], datos, pasos);
      break;
    }

    /* ── Potencia, energía y coste ─────────────────────────────────────── */
    case 'potencia':
    case 'energia':
    case 'coste': {
      const V = positivo(datos.V) ? datos.V : NaN;
      const I = positivo(datos.I) ? datos.I : NaN;
      const R = positivo(datos.R) ? datos.R : NaN;
      const dados = [V, I, R].filter((x) => !Number.isNaN(x)).length;
      if (dados < 2) return falta('dos de las tres magnitudes V, I y R', pasos);
      const horas = datos.horas ?? 0;
      const dias = datos.dias ?? 0;
      const tarifa = datos.tarifa ?? 0;
      if (datos.pregunta !== 'potencia' && (!positivo(datos.horas) || !positivo(datos.dias))) {
        return falta('las horas al día y los días', pasos);
      }
      if (datos.pregunta === 'coste' && !positivo(datos.tarifa)) return falta('la tarifa', pasos);
      const r = resolverPotencia(V, I, R, horas, dias, tarifa);
      if (!r.ok) {
        return {
          ok: false,
          valor: NaN,
          pasos,
          error: r.motivo === 'incoherente' ? 'V, I y R no cumplen la ley de Ohm.' : 'No se puede calcular la potencia.',
        };
      }
      const res = r.resultado;
      if (Number.isNaN(V)) {
        pasos.push(`Falta la tensión: se despeja con la ley de Ohm, V = I·R = ${numero(I)}·${numero(R)} = ${numero(res.V)} V.`);
      } else if (Number.isNaN(I)) {
        pasos.push(`Falta la corriente: se despeja con la ley de Ohm, I = V/R = ${numero(V)}/${numero(R)} = ${numero(res.I, 6)} A.`);
      }
      pasos.push(`Potencia: P = V·I = ${numero(res.V)}·${numero(res.I, 6)} = ${numero(res.P)} W.`);
      if (Number.isNaN(V)) {
        pasos.push(`Es lo mismo que P = I²·R = ${numero(I)}²·${numero(R)}.`);
      } else if (Number.isNaN(I)) {
        pasos.push(`Es lo mismo que P = V²/R = ${numero(V)}²/${numero(R)}.`);
      }
      if (datos.pregunta === 'potencia') {
        valor = res.P;
        break;
      }
      pasos.push(
        `Energía: la potencia en kilovatios por las horas de uso. E = P/1000 · horas · días = ${numero(res.P / 1000, 6)}·${numero(horas)}·${numero(dias)} = ${numero(res.energiaKwh)} kWh.`,
      );
      if (datos.pregunta === 'energia') {
        valor = res.energiaKwh;
        break;
      }
      valor = res.costeEuros;
      pasos.push(`Coste: energía por tarifa = ${numero(res.energiaKwh)}·${numero(tarifa)} = ${numero(valor)} unidades monetarias.`);
      break;
    }

    default:
      return { ok: false, valor: NaN, pasos, error: 'Pregunta desconocida.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  // El último paso muestra la cifra con los MISMOS decimales que pide el enunciado, y es la
  // misma cadena que `respuestaTexto` (invariante 5.bis).
  const texto = textoConUnidad(redondear(valor, decimales), unidadDe(datos), decimales);
  pasos.push(exigeRedondeo(valor, decimales) ? `Redondeando ${textoRedondeo(decimales)}: ${texto}.` : `Resultado: ${texto}.`);
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * La tolerancia de un caso la da la PREGUNTA, no el tamaño de la cifra (hallazgo 2518,
 * 30/09/2026). Es el error de lectura de los datos propagado a la respuesta más media unidad del
 * redondeo pedido; aquí los datos son EXACTOS (no hay tabla ni gráfica que leer), así que solo
 * queda el redondeo:
 *
 *   · si la cifra exacta tiene más decimales de los que se piden, media unidad del último
 *     decimal pedido: se acepta todo lo que redondea a la respuesta (5,615 a 5,625 en el caso 5,
 *     que incluye el 5,617 que imprime el panel);
 *   · si la cifra es exacta, no hay redondeo que tolerar: solo vale ella (0,3 A, 500 mA, 132 kWh).
 *
 * Antes era el mayor entre 0,01 y el 1 % de la respuesta, y el 1 % de una cifra no es la escala
 * de su error: el de 500 mA son 5 mA y el de 132 kWh, 1,32 kWh, así que pasaban 505 y 133, que
 * ninguna cuenta produce; y por debajo de 1 el suelo de 0,01 era un 3,3 % de 0,3 A. Es la forma
 * que se reparó en simulador-distribucion-normal (afdef86f) y simulador-fotografia (794ace00).
 *
 * ⚠️ Redondear un paso intermedio saca la respuesta del margen: en el caso 5, I = 2,55 mA da
 * 5,61 V, y en el 12, I = 0,45 A da 2,97. Por eso la pista del caso 5 y la intro lo avisan.
 */
export function toleranciaDe(datos: DatosCaso): number {
  const decimales = datos.decimales ?? 2;
  const r = resolverCaso(datos);
  if (!r.ok) return 0;
  return exigeRedondeo(r.valor, decimales) ? 10 ** -decimales / 2 : 0;
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza. Recibe los `datos` del caso porque la
 * tolerancia depende de la pregunta (ver `toleranciaDe`), no de la cifra.
 */
export function comprobarRespuesta(usuario: number, esperado: number, datos: DatosCaso): Veredicto {
  const tolerancia = toleranciaDe(datos);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  /**
   * Margen de ruido binario (hallazgo 1211 de `simulador-conservacion-energia`): en el borde
   * EXACTO de la tolerancia la resta en coma flotante decide por ±1 ulp, así que la misma
   * desviación se aceptaba por arriba y se rechazaba por abajo. 1e-9 absorbe ese ruido y queda
   * seis órdenes de magnitud por debajo de la menor tolerancia no nula (0,005); con una
   * respuesta exacta (tolerancia 0) es lo único que separa 0,3 de 0,30000000000000004.
   */
  const RUIDO_BINARIO = 1e-9;
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia, 2)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  /** Qué se escribe en la casilla, con la unidad detrás de « en ». Nunca vacía. */
  etiquetaRespuesta: string;
  /** Calculada por el motor desde `datos` y redondeada a los decimales pedidos. */
  respuesta: number;
  respuestaTexto: string;
  /** true si la cifra exacta tiene más decimales de los mostrados: el enunciado lo pide. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
  /**
   * Qué teclear, y en qué pestaña, para ver la cifra en el simulador. Solo donde es VERDAD con
   * los controles actuales, y con los decimales que imprime el panel.
   */
  comoComprobar?: string;
}

/** La pestaña Potencia rotula la tarifa en €: la cuenta es la misma en cualquier moneda. */
const NOTA_MONEDA = 'La pestaña rotula la tarifa y el coste en €, pero la cuenta es la misma en cualquier moneda.';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas nacionales, y sin tensiones de red atadas a un país: «una
 * red de 220 V», sin decir dónde.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo'>> = [
  /* ── Ley de Ohm ── */
  {
    id: 1,
    titulo: 'La tensión con la corriente en miliamperios',
    enunciado:
      'Por una resistencia de 470 Ω circula una corriente de 20 mA. ¿Qué tensión hay entre sus extremos? Da el resultado en voltios.',
    categoria: 'abstracto',
    datos: { pregunta: 'ohm', incognita: 'V', I: 0.02, R: 470, corrienteDadaEnMa: true, decimales: 1 },
    etiquetaRespuesta: 'Tensión en V',
    pista: 'V = I·R, pero con la corriente en AMPERIOS: 20 mA son 0,02 A. Si te sale 9400, has usado los miliamperios.',
    comoComprobar:
      'En la pestaña «Ley de Ohm», pulsa «Calcular Tensión (V)» y escribe una corriente de 0,02 y una resistencia de 470: la Tensión sale 9,4000 V.',
  },
  {
    id: 2,
    titulo: 'La corriente de una linterna',
    enunciado:
      'La bombilla de una linterna tiene una resistencia de 15 Ω y funciona con una pila de 4,5 V. ¿Qué corriente pasa por la bombilla? Da el resultado en amperios.',
    categoria: 'aplicado',
    datos: { pregunta: 'ohm', incognita: 'I', V: 4.5, R: 15, decimales: 1 },
    etiquetaRespuesta: 'Corriente en A',
    pista: 'Despeja la corriente de la ley de Ohm: I = V/R.',
    comoComprobar:
      'En la pestaña «Ley de Ohm», pulsa «Calcular Corriente (I)» y escribe una tensión de 4,5 y una resistencia de 15: la Corriente sale 0,3000 A — 300,00 mA.',
  },
  {
    id: 3,
    titulo: 'La resistencia de una tostadora',
    enunciado:
      'Una tostadora conectada a una red de 220 V deja pasar una corriente de 4 A. ¿Cuál es la resistencia de su elemento calefactor? Da el resultado en ohmios.',
    categoria: 'aplicado',
    datos: { pregunta: 'ohm', incognita: 'R', V: 220, I: 4, decimales: 0 },
    etiquetaRespuesta: 'Resistencia en Ω',
    pista: 'Despeja la resistencia de la ley de Ohm: R = V/I.',
    comoComprobar:
      'En la pestaña «Ley de Ohm», pulsa «Calcular Resistencia (R)» y escribe una tensión de 220 y una corriente de 4: la Resistencia sale 55,0000 Ω.',
  },

  /* ── Serie ── */
  {
    id: 4,
    titulo: 'Tres resistencias en fila',
    enunciado:
      'Tres resistencias de 10 Ω, 22 Ω y 47 Ω se conectan en serie a una pila de 9 V. ¿Cuál es la resistencia equivalente del circuito, en ohmios?',
    categoria: 'abstracto',
    datos: { pregunta: 'serieEquivalente', V: 9, resistencias: [10, 22, 47], decimales: 0 },
    etiquetaRespuesta: 'Req en Ω',
    pista: 'En serie, la resistencia equivalente es la suma de todas. La pila no influye.',
    comoComprobar:
      'En la pestaña «Serie», con 3 resistencias, escribe 10, 22 y 47 y una tensión de 9: la Resistencia equivalente sale 79,000 Ω.',
  },
  {
    id: 5,
    titulo: 'La caída de tensión en una resistencia',
    enunciado:
      'Un circuito en serie tiene R₁ = 1 kΩ, R₂ = 2,2 kΩ y R₃ = 1,5 kΩ, alimentadas por una fuente de 12 V. ¿Qué tensión hay entre los extremos de R₂, en voltios? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: {
      pregunta: 'serieTension',
      V: 12,
      resistencias: [1000, 2200, 1500],
      rama: 1,
      resistenciasDadasEnKiloohmios: true,
      decimales: 2,
    },
    etiquetaRespuesta: 'Tensión en V',
    pista:
      'Pasa los kΩ a ohmios, suma las tres para tener Req, calcula la corriente del circuito (I = V/Req) y multiplícala por R₂, sin redondear la corriente: con I = 2,55 mA saldría 5,61 V. La resistencia más grande se queda con la mayor parte de la tensión.',
    comoComprobar:
      'En la pestaña «Serie», con 3 resistencias, escribe 1000, 2200 y 1500 y una tensión de 12: en la fila R2, la columna «V caída» sale 5,6170 V.',
  },
  {
    id: 6,
    titulo: 'Una guirnalda de luces',
    enunciado:
      'Una guirnalda tiene 6 lucecitas iguales conectadas en serie, cada una con una resistencia de 4 Ω, y se alimenta con 12 V. ¿Qué corriente circula por la guirnalda? Da el resultado en amperios.',
    categoria: 'aplicado',
    datos: { pregunta: 'serieCorriente', V: 12, resistencias: [4, 4, 4, 4, 4, 4], decimales: 1 },
    etiquetaRespuesta: 'Corriente en A',
    pista:
      'En serie la corriente es la misma en todas las luces: calcula la resistencia equivalente y aplica I = V/Req. Por eso, si una luz se funde, se apagan todas.',
    comoComprobar:
      'En la pestaña «Serie», pulsa «+» tres veces para tener 6 resistencias, escribe 4 en todas y una tensión de 12: la Corriente total sale 0,5000 A (500,00 mA).',
  },

  /* ── Paralelo ── */
  {
    id: 7,
    titulo: 'Dos resistencias en paralelo',
    enunciado:
      'Dos resistencias de 6 Ω y 3 Ω se conectan en paralelo a una fuente de 12 V. ¿Cuál es la resistencia equivalente, en ohmios?',
    categoria: 'abstracto',
    datos: { pregunta: 'paraleloEquivalente', V: 12, resistencias: [6, 3], decimales: 0 },
    etiquetaRespuesta: 'Req en Ω',
    pista: 'En paralelo se suman los INVERSOS: 1/Req = 1/6 + 1/3. No olvides dar la vuelta al final. Tiene que salir menos de 3 Ω.',
    comoComprobar:
      'En la pestaña «Paralelo», pulsa «−» una vez para tener 2 resistencias, escribe 6 y 3 y una tensión de 12: la Resistencia equivalente sale 2,0000 Ω.',
  },
  {
    id: 8,
    titulo: 'La corriente que sale de la fuente',
    enunciado:
      'Tres resistencias de 12 Ω, 12 Ω y 6 Ω están conectadas en paralelo a una fuente de 12 V. ¿Qué corriente total entrega la fuente? Da el resultado en amperios.',
    categoria: 'abstracto',
    datos: { pregunta: 'paraleloCorrienteTotal', V: 12, resistencias: [12, 12, 6], decimales: 0 },
    etiquetaRespuesta: 'Corriente en A',
    pista: 'Cada rama recibe los 12 V completos: calcula la corriente de cada una (I = V/R) y súmalas. O calcula Req y haz V/Req.',
    comoComprobar:
      'En la pestaña «Paralelo», con 3 resistencias, escribe 12, 12 y 6 y una tensión de 12: la Corriente total (fuente) sale 4,0000 A.',
  },
  {
    id: 9,
    titulo: 'Dos aparatos en la misma regleta',
    enunciado:
      'Los enchufes de una casa están conectados en paralelo. En una regleta de una red de 220 V hay enchufados un hervidor de agua de 44 Ω y una lámpara de 440 Ω. ¿Qué corriente pasa por la lámpara? Da el resultado en miliamperios.',
    categoria: 'aplicado',
    datos: { pregunta: 'paraleloCorrienteRama', V: 220, resistencias: [44, 440], rama: 1, enMiliamperios: true, decimales: 0 },
    etiquetaRespuesta: 'Corriente en mA',
    pista:
      'En paralelo cada aparato recibe la tensión completa de la red, esté o no encendido el otro: I = V/R solo con la resistencia de la lámpara. Después pasa de A a mA.',
    comoComprobar:
      'En la pestaña «Paralelo», pulsa «−» una vez para tener 2 resistencias, escribe 44 y 440 y una tensión de 220: en la fila R2, la columna «I rama (A)» sale 0,5000 A. Pásalo a mA.',
  },

  /* ── Potencia, energía y coste ── */
  {
    id: 10,
    titulo: 'El calor que disipa una resistencia',
    enunciado:
      'Por una resistencia de 100 Ω circula una corriente de 0,2 A. ¿Qué potencia disipa en forma de calor? Da el resultado en vatios.',
    categoria: 'abstracto',
    datos: { pregunta: 'potencia', I: 0.2, R: 100, decimales: 0 },
    etiquetaRespuesta: 'Potencia en W',
    pista: 'Calcula primero la tensión con V = I·R y después P = V·I. Es lo mismo que P = I²·R.',
    comoComprobar:
      'En la pestaña «Potencia», deja vacía la tensión y escribe una corriente de 0,2 y una resistencia de 100: la Potencia sale 4,00 W.',
  },
  {
    id: 11,
    titulo: 'El consumo de un calentador',
    enunciado:
      'Un calentador de agua eléctrico conectado a una red de 220 V deja pasar 10 A. Si está encendido 2 horas al día durante 30 días, ¿cuánta energía consume en ese tiempo? Da el resultado en kWh.',
    categoria: 'aplicado',
    datos: { pregunta: 'energia', V: 220, I: 10, horas: 2, dias: 30, decimales: 0 },
    etiquetaRespuesta: 'Energía en kWh',
    pista: 'Calcula la potencia (P = V·I), pásala a kilovatios dividiendo entre 1000 y multiplícala por el total de horas encendido.',
    comoComprobar:
      'En la pestaña «Potencia», escribe una tensión de 220 y una corriente de 10, deja vacía la resistencia y pon 2 horas y 30 días: el Consumo del periodo sale 132,0000 kWh.',
  },
  {
    id: 12,
    titulo: 'Lo que cuesta una bombilla',
    enunciado:
      'Una bombilla incandescente tiene una resistencia de 484 Ω cuando está encendida y se conecta a una red de 220 V. Está encendida 5 horas al día durante 30 días, y la electricidad cuesta 0,20 unidades monetarias por kWh. ¿Cuánto cuesta tenerla encendida ese tiempo?',
    categoria: 'aplicado',
    datos: { pregunta: 'coste', V: 220, R: 484, horas: 5, dias: 30, tarifa: 0.2, decimales: 2 },
    etiquetaRespuesta: 'Coste en unidades monetarias',
    pista:
      'Primero la potencia: I = V/R y P = V·I (o directamente P = V²/R). Después la energía en kWh y, por último, multiplica por la tarifa. Una bombilla LED que alumbra parecido consume mucho menos: repite la cuenta con su potencia y compara.',
    comoComprobar: `En la pestaña «Potencia», escribe una tensión de 220 y una resistencia de 484, deja vacía la corriente y pon 5 horas, 30 días y una tarifa de 0,20: el Coste estimado sale 3,0000. ${NOTA_MONEDA}`,
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «5,62 V». La unidad es lo que
 * va detrás de « en » en la etiqueta («Corriente en mA» → «mA»), así que no se imprime nunca un
 * número suelto junto a media frase (hallazgo 830 de `simulador-genetica`).
 */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  const corte = etiqueta.indexOf(' en ');
  const unidad = corte === -1 ? '' : etiqueta.slice(corte + 4);
  return textoConUnidad(valor, unidad, decimales);
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta, decimales),
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, decimales) : false,
    pasos: r.pasos,
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd()*n)`
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio
 * y aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
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

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  etiquetaRespuesta: string;
  pasos: string[];
}

/** Listas «amables»: cifras que se teclean sin error y dan resultados razonables. */
const CORRIENTES_OHM = [0.5, 1, 1.5, 2, 2.5, 3] as const;
const RESISTENCIAS_OHM = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20] as const;
const TENSIONES = [6, 9, 12, 24, 48] as const;
const RESISTENCIAS_SERIE = [2, 3, 4, 5, 6, 8, 10, 12, 22, 47] as const;
/** Grupos en paralelo con resistencia equivalente limpia (2, 4, 3, 5…). */
const GRUPOS_PARALELO: ReadonlyArray<readonly number[]> = [
  [6, 3],
  [12, 6],
  [20, 5],
  [12, 4],
  [10, 10],
  [30, 15],
  [60, 20],
  [12, 12, 6],
  [6, 6, 6],
  [20, 20, 10],
  [30, 15, 10],
];
const TENSIONES_PARALELO = [6, 12, 24] as const;
/** Corrientes de aparatos conectados a una red de 220 V: de 110 W a 2200 W. */
const CORRIENTES_APARATO = [0.5, 1, 2, 5, 10] as const;
const HORAS = [1, 2, 3, 4, 5, 8] as const;
const DIAS = [7, 10, 30] as const;
const TARIFAS = [0.1, 0.15, 0.2, 0.25] as const;
const RED = 220;

const PREGUNTAS = [
  'ohmV',
  'ohmI',
  'ohmR',
  'serieEquivalente',
  'serieCorriente',
  'serieTension',
  'paraleloEquivalente',
  'paraleloCorrienteTotal',
  'paraleloCorrienteRama',
  'potencia',
  'energia',
  'coste',
] as const;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/** 2 o 3 resistencias en serie, con repeticiones permitidas. */
function elegirSerie(rnd: () => number): number[] {
  const n = rnd() < 0.5 ? 2 : 3;
  return Array.from({ length: n }, () => elegir(RESISTENCIAS_SERIE, rnd));
}

/** «a, b y c». */
function enumerar(partes: readonly string[]): string {
  return partes.length <= 1 ? partes.join('') : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

/** «Tres resistencias de 10 Ω, 22 Ω y 47 Ω». */
function resistenciasDe(rs: readonly number[]): string {
  const cuantas = rs.length === 2 ? 'Dos' : rs.length === 3 ? 'Tres' : String(rs.length);
  return `${cuantas} resistencias de ${enumerar(rs.map((r) => `${numero(r)} Ω`))}`;
}

/** «R₁ = 12 Ω, R₂ = 12 Ω y R₃ = 2 Ω». */
function resistenciasConNombre(rs: readonly number[]): string {
  return enumerar(rs.map((r, i) => `${nombreR(i)} = ${numero(r)} Ω`));
}

/** Corriente por debajo de 1 A: se pide en mA, que es la unidad en la que se habla de ella. */
function pedirEnMa(amperios: number): boolean {
  return Number.isFinite(amperios) && amperios < 1;
}

/**
 * Ejercicio aleatorio de Ohm, serie, paralelo o potencia. Usa EL MISMO `resolverCaso` que los
 * doce fijos, y por tanto el mismo motor que las pestañas: si divergieran, el alumno entrenaría
 * con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  const redondeo = 'Redondea a dos decimales.';

  let datos: DatosCaso;
  let enunciado: string;
  let etiqueta: string;

  if (pregunta === 'ohmV') {
    const I = elegir(CORRIENTES_OHM, rnd);
    const R = elegir(RESISTENCIAS_OHM, rnd);
    datos = { pregunta: 'ohm', incognita: 'V', I, R };
    enunciado = `Por una resistencia de ${numero(R)} Ω circula una corriente de ${numero(I)} A. ¿Qué tensión hay entre sus extremos, en voltios? ${redondeo}`;
    etiqueta = 'Tensión en V';
  } else if (pregunta === 'ohmI') {
    const V = elegir(TENSIONES, rnd);
    const R = elegir(RESISTENCIAS_OHM, rnd);
    const enMiliamperios = pedirEnMa(V / R);
    datos = { pregunta: 'ohm', incognita: 'I', V, R, enMiliamperios };
    enunciado = `Una resistencia de ${numero(R)} Ω se conecta a ${numero(V)} V. ¿Qué corriente pasa por ella, en ${enMiliamperios ? 'miliamperios' : 'amperios'}? ${redondeo}`;
    etiqueta = enMiliamperios ? 'Corriente en mA' : 'Corriente en A';
  } else if (pregunta === 'ohmR') {
    const V = elegir(TENSIONES, rnd);
    const I = elegir(CORRIENTES_OHM, rnd);
    datos = { pregunta: 'ohm', incognita: 'R', V, I };
    enunciado = `Un componente conectado a ${numero(V)} V deja pasar ${numero(I)} A. ¿Cuál es su resistencia, en ohmios? ${redondeo}`;
    etiqueta = 'Resistencia en Ω';
  } else if (pregunta === 'serieEquivalente') {
    const rs = elegirSerie(rnd);
    const V = elegir(TENSIONES, rnd);
    datos = { pregunta: 'serieEquivalente', V, resistencias: rs };
    enunciado = `${resistenciasDe(rs)} se conectan en serie a ${numero(V)} V. ¿Cuál es la resistencia equivalente, en ohmios? ${redondeo}`;
    etiqueta = 'Req en Ω';
  } else if (pregunta === 'serieCorriente') {
    const rs = elegirSerie(rnd);
    const V = elegir(TENSIONES, rnd);
    const suma = rs.reduce((a, r) => a + r, 0);
    const enMiliamperios = pedirEnMa(V / suma);
    datos = { pregunta: 'serieCorriente', V, resistencias: rs, enMiliamperios };
    enunciado = `${resistenciasDe(rs)} se conectan en serie a ${numero(V)} V. ¿Qué corriente circula por el circuito, en ${enMiliamperios ? 'miliamperios' : 'amperios'}? ${redondeo}`;
    etiqueta = enMiliamperios ? 'Corriente en mA' : 'Corriente en A';
  } else if (pregunta === 'serieTension') {
    // Se descartan las caídas de menos de 1 V (una R pequeña al lado de otras grandes): con dos
    // decimales quedarían una o dos cifras significativas, poco para comprobar nada. La caída
    // se mide con el MISMO motor. Número de intentos acotado, con un circuito fijo de reserva.
    const caida = (vs: number, lista: number[], k: number) => resolverSerie(vs, lista).tensiones[k];
    let rs = elegirSerie(rnd);
    let V: number = elegir(TENSIONES, rnd);
    let rama = Math.min(rs.length - 1, Math.floor(rnd() * rs.length));
    let intentos = 0;
    while (!(caida(V, rs, rama) >= 1) && intentos < 20) {
      rs = elegirSerie(rnd);
      V = elegir(TENSIONES, rnd);
      rama = Math.min(rs.length - 1, Math.floor(rnd() * rs.length));
      intentos += 1;
    }
    if (!(caida(V, rs, rama) >= 1)) [rs, V, rama] = [[10, 20, 30], 12, 1];
    datos = { pregunta: 'serieTension', V, resistencias: rs, rama };
    enunciado = `Un circuito en serie tiene ${resistenciasConNombre(rs)}, alimentadas con ${numero(V)} V. ¿Qué tensión hay entre los extremos de ${nombreR(rama)}, en voltios? ${redondeo}`;
    etiqueta = 'Tensión en V';
  } else if (pregunta === 'paraleloEquivalente') {
    const rs = elegir(GRUPOS_PARALELO, rnd);
    const V = elegir(TENSIONES_PARALELO, rnd);
    datos = { pregunta: 'paraleloEquivalente', V, resistencias: rs };
    enunciado = `${resistenciasDe(rs)} se conectan en paralelo a ${numero(V)} V. ¿Cuál es la resistencia equivalente, en ohmios? ${redondeo}`;
    etiqueta = 'Req en Ω';
  } else if (pregunta === 'paraleloCorrienteTotal') {
    const rs = elegir(GRUPOS_PARALELO, rnd);
    const V = elegir(TENSIONES_PARALELO, rnd);
    const total = rs.reduce((a, r) => a + V / r, 0);
    const enMiliamperios = pedirEnMa(total);
    datos = { pregunta: 'paraleloCorrienteTotal', V, resistencias: rs, enMiliamperios };
    enunciado = `${resistenciasDe(rs)} se conectan en paralelo a ${numero(V)} V. ¿Qué corriente total entrega la fuente, en ${enMiliamperios ? 'miliamperios' : 'amperios'}? ${redondeo}`;
    etiqueta = enMiliamperios ? 'Corriente en mA' : 'Corriente en A';
  } else if (pregunta === 'paraleloCorrienteRama') {
    const rs = elegir(GRUPOS_PARALELO, rnd);
    const V = elegir(TENSIONES_PARALELO, rnd);
    const rama = Math.min(rs.length - 1, Math.floor(rnd() * rs.length));
    const enMiliamperios = pedirEnMa(V / rs[rama]);
    datos = { pregunta: 'paraleloCorrienteRama', V, resistencias: rs, rama, enMiliamperios };
    enunciado = `En paralelo, a ${numero(V)} V, hay ${resistenciasConNombre(rs)}. ¿Qué corriente pasa por ${nombreR(rama)}, en ${enMiliamperios ? 'miliamperios' : 'amperios'}? ${redondeo}`;
    etiqueta = enMiliamperios ? 'Corriente en mA' : 'Corriente en A';
  } else if (pregunta === 'potencia') {
    const modo = elegir(['VI', 'IR', 'VR'] as const, rnd);
    if (modo === 'VI') {
      const V = elegir(TENSIONES, rnd);
      const I = elegir(CORRIENTES_OHM, rnd);
      datos = { pregunta: 'potencia', V, I };
      enunciado = `Un aparato conectado a ${numero(V)} V deja pasar ${numero(I)} A. ¿Qué potencia consume, en vatios? ${redondeo}`;
    } else if (modo === 'IR') {
      const I = elegir(CORRIENTES_OHM, rnd);
      const R = elegir(RESISTENCIAS_OHM, rnd);
      datos = { pregunta: 'potencia', I, R };
      enunciado = `Por una resistencia de ${numero(R)} Ω circula una corriente de ${numero(I)} A. ¿Qué potencia disipa, en vatios? ${redondeo}`;
    } else {
      const V = elegir(TENSIONES, rnd);
      const R = elegir(RESISTENCIAS_OHM, rnd);
      datos = { pregunta: 'potencia', V, R };
      enunciado = `Una resistencia de ${numero(R)} Ω se conecta a ${numero(V)} V. ¿Qué potencia disipa, en vatios? ${redondeo}`;
    }
    etiqueta = 'Potencia en W';
  } else {
    // Energía o coste de un aparato de la red. Se descartan los consumos diminutos (menos de
    // 1 kWh, o de 1 unidad monetaria): con dos decimales quedarían una o dos cifras
    // significativas. Número de intentos acotado, con un valor fijo de reserva.
    const esCoste = pregunta === 'coste';
    const cuenta = (i: number, h: number, d: number, t: number) => ((RED * i) / 1000) * h * d * (esCoste ? t : 1);
    let I: number = elegir(CORRIENTES_APARATO, rnd);
    let horas: number = elegir(HORAS, rnd);
    let dias: number = elegir(DIAS, rnd);
    let tarifa: number = elegir(TARIFAS, rnd);
    let intentos = 0;
    while (cuenta(I, horas, dias, tarifa) < 1 && intentos < 20) {
      I = elegir(CORRIENTES_APARATO, rnd);
      horas = elegir(HORAS, rnd);
      dias = elegir(DIAS, rnd);
      tarifa = elegir(TARIFAS, rnd);
      intentos += 1;
    }
    if (!(cuenta(I, horas, dias, tarifa) >= 1)) [I, horas, dias, tarifa] = [5, 2, 30, 0.2];
    const uso = `Está encendido ${numero(horas)} ${horas === 1 ? 'hora' : 'horas'} al día durante ${numero(dias)} días.`;
    if (esCoste) {
      datos = { pregunta: 'coste', V: RED, I, horas, dias, tarifa };
      enunciado = `Un aparato conectado a una red de ${RED} V deja pasar ${numero(I)} A. ${uso} Si la electricidad cuesta ${numero(tarifa)} unidades monetarias por kWh, ¿cuánto cuesta ese consumo? ${redondeo}`;
      etiqueta = 'Coste en unidades monetarias';
    } else {
      datos = { pregunta: 'energia', V: RED, I, horas, dias };
      enunciado = `Un aparato conectado a una red de ${RED} V deja pasar ${numero(I)} A. ${uso} ¿Cuánta energía consume en ese tiempo, en kWh? ${redondeo}`;
      etiqueta = 'Energía en kWh';
    }
  }

  const r = resolverCaso(datos);
  const respuesta = r.ok ? redondear(r.valor, datos.decimales ?? 2) : NaN;
  return {
    semilla,
    enunciado,
    datos,
    respuesta,
    respuestaTexto: textoRespuesta(respuesta, etiqueta, datos.decimales ?? 2),
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, datos.decimales ?? 2) : false,
    etiquetaRespuesta: etiqueta,
    pasos: r.pasos,
  };
}
