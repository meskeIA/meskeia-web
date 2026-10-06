/**
 * Casos para clase — la tarea asignable de `simulador-flotabilidad`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada del principio de Arquímedes se reescribe aquí: se calcula con `calcularFlotabilidad` de
 * `./motor.ts`, el MISMO módulo con el que el dibujo, el veredicto y las tarjetas pintan sus
 * cifras. Si la corrección y el panel calcularan distinto, la app suspendería una respuesta que
 * ella misma imprime.
 *
 *   · masa, peso, empuje máximo                   → `calcularFlotabilidad(…).masa/peso/empujeMaximo`.
 *   · empuje en la situación final (P si flota)   → `.empuje`.
 *   · fracción sumergida y emergida               → `.fraccionSumergida` / `.fraccionEmergida`.
 *   · peso aparente (solo si se hunde)            → `.pesoAparente`.
 *   · fuerza para hundirlo entero (solo si flota) → `.fuerzaParaHundir`.
 *   · flota / se hunde                            → `.veredicto` (el de `veredictoPorDensidades`).
 *
 * Las densidades de las sustancias con nombre (hielo, agua de mar, mercurio…) salen de
 * `./materiales.ts` por id, la MISMA lista de los botones: el enunciado no puede decir una cifra
 * y el botón otra.
 *
 * Las ÚNICAS cuentas propias son las INVERSIONES que el motor no despeja:
 *
 *   · densidad desde la fracción sumergida (caso 10):  ρc = f·ρl;
 *   · densidad desde el peso en el aire y el aparente sumergido (caso 11):
 *     ρc = ρl·P/(P − P_ap), y el volumen V = (P − P_ap)/(ρl·g) que hace falta para comprobarla;
 *   · densidad media de un casco hueco (caso 12):     ρ = m/V.
 *
 * Para que no se aparten del motor, cada resultado se devuelve a `calcularFlotabilidad` y se
 * exige que reproduzca el dato del enunciado (la fracción, los dos pesos o la masa) con holgura
 * relativa 1e-9; si no cuadra, la resolución sale con `{ ok: false }` en vez de con una cifra.
 * Lo que queda fuera del motor es aritmética de unidades (cm³ → m³, m³ → L, fracción → %) y el
 * producto V_sumergido = f·V del caso 12, que es la definición de f.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **g = 9,81 m/s²**, el `G` del motor. `resolverCaso(datos, g)` acepta otra g para que el spec
 *    compruebe qué casos dependen de ella: esos, y SOLO esos, dicen «g = 9,81 m/s²» en el
 *    enunciado. Las fracciones y las densidades despejadas no dependen de g.
 * ⚠️ **Volumen en cm³**, como el campo de la app (1 m³ = 1.000.000 cm³); densidades en kg/m³;
 *    fuerzas en N.
 * ⚠️ **Si FLOTA, el empuje es igual al PESO**, no al empuje máximo ρl·V·g (que es el de tenerlo
 *    entero bajo el líquido). Si se hunde, el empuje es el máximo.
 * ⚠️ **El peso aparente solo existe si se hunde**: si flota, el motor da null y ningún caso lo
 *    pregunta. **La fuerza para hundirlo entero, solo si flota.** El equilibrio indiferente
 *    (ρc = ρl) nunca es la respuesta de un caso.
 * ⚠️ **Las fracciones se piden en %**, y f = ρc/ρl no depende ni de g ni del volumen: el empuje
 *    ρl·V_s·g iguala al peso ρc·V·g y se simplifican.
 *
 * ── DATOS QUE DISCRIMINAN (hallazgo 2628, 02/10/2026) ───────────────────────
 *
 * Un caso no sirve si su error conceptual típico da la misma cifra que la clave. Por eso no hay
 * ningún cuerpo de 1000 cm³ en agua dulce (con ρ = 1000 la masa en kg y el volumen en litros
 * coinciden, y E = g), el empuje de un cuerpo que flota nunca vale la mitad de un número redondo
 * que se confunda con E_max, y la lancha del caso 12 flota en agua de MAR: en agua dulce, «410 kg
 * desalojan 410 L» daría la clave sin pensar. Los errores que separa cada caso, con la cifra que
 * darían, están anotados en su definición.
 */

import { formatNumber } from '@/lib';
import { calcularFlotabilidad, CM3_POR_M3, G, type ResultadoFlotabilidad } from './motor';
import { LIQUIDOS, MATERIALES } from './materiales';

/** Holgura relativa con la que una inversión tiene que reproducir el dato del enunciado. */
const HOLGURA_INVERSION = 1e-9;

/**
 * Volumen con el que se llama al motor cuando la pregunta no depende de él (fracciones y
 * densidades despejadas de una fracción). Cualquiera vale: f = ρc/ρl no lleva V.
 */
const VOLUMEN_REFERENCIA = 1000;

/** Litros en un metro cúbico. */
const LITROS_POR_M3 = 1000;

/** Espacio duro antes del %: que el signo no salte solo de línea (Ortografía de la RAE, 2010). */
const NBSP = ' ';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** P = ρc·V·g, en N. */
  | 'peso'
  /** El empuje en la situación final, en N: P si flota, ρl·V·g si se hunde. */
  | 'empuje'
  /** f = ρc/ρl si flota (100 si se hunde), en %. */
  | 'porcentajeSumergido'
  /** 1 − f, en %. Solo tiene sentido si flota. */
  | 'porcentajeEmergido'
  /** P − E_max, en N. Solo si se hunde. */
  | 'pesoAparente'
  /** E_max − P, en N. Solo si flota. */
  | 'fuerzaParaHundir'
  /** ρc = f·ρl, despejada de la fracción sumergida (o emergida), en kg/m³. */
  | 'densidadDesdeFraccion'
  /** ρc = ρl·P/(P − P_ap), despejada del peso en el aire y del aparente sumergido, en kg/m³. */
  | 'densidadDesdePesos'
  /** V_s = f·V con la densidad media ρ = m/V de un casco hueco, en L. */
  | 'volumenSumergidoDesdeMasa';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Id de un material de `MATERIALES` (`'hielo'`, `'hierro'`…). Si está, manda sobre `densidadCuerpo`. */
  cuerpo?: string;
  /** Densidad «de problema» del cuerpo, sin nombre de material, en kg/m³. */
  densidadCuerpo?: number;
  /** Id de un líquido de `LIQUIDOS` (`'agua'`, `'mar'`…). Si está, manda sobre `densidadLiquido`. */
  liquido?: string;
  /** Densidad «de problema» del líquido, en kg/m³. */
  densidadLiquido?: number;
  /** Volumen del cuerpo, en cm³ (en el caso 12, el volumen total del casco). */
  volumen?: number;
  /** Masa total, en kg (caso del casco hueco). */
  masa?: number;
  /** Fracción del volumen bajo el líquido, de 0 a 1 (dato de una inversión). */
  fraccionSumergida?: number;
  /** Fracción del volumen fuera del líquido, de 0 a 1 (dato de una inversión). */
  fraccionEmergida?: number;
  /** Lo que marca el dinamómetro en el aire, en N. */
  pesoAire?: number;
  /** Lo que marca con el cuerpo sumergido entero, en N. */
  pesoAparente?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (N, %, kg/m³ o L). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «0,008», «13.534», «264,87». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

/** Porcentaje intermedio con el espacio duro: «91,7 %». */
function porcentaje(fraccion: number, decimales = 2): string {
  return `${numero(fraccion * 100, decimales)}${NBSP}%`;
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * ¿La cifra exacta tiene más decimales de los que se piden? Holgura RELATIVA: 264,87 y 0,5 se
 * juzgan con la misma vara (una absoluta de 1e-9 trataría distinto una cifra grande).
 */
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

/** Falta un dato obligatorio: se responde con un error legible, nunca con una excepción. */
function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

function fallo(error: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error };
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/** ¿Reproduce `obtenido` el dato del enunciado con holgura relativa 1e-9? */
function cuadra(obtenido: number | null, dato: number): boolean {
  if (obtenido === null || !Number.isFinite(obtenido)) return false;
  return Math.abs(obtenido - dato) <= HOLGURA_INVERSION * Math.max(Math.abs(dato), 1e-12);
}

/** Densidad del cuerpo: la de la lista si nombra un material, la «de problema» si no. */
function densidadDelCuerpo(datos: DatosCaso): number {
  if (datos.cuerpo !== undefined) {
    return MATERIALES.find((m) => m.id === datos.cuerpo)?.densidad ?? NaN;
  }
  return datos.densidadCuerpo ?? NaN;
}

/** Densidad del líquido: la de la lista si lo nombra, la «de problema» si no. */
function densidadDelLiquido(datos: DatosCaso): number {
  if (datos.liquido !== undefined) {
    return LIQUIDOS.find((l) => l.id === datos.liquido)?.densidad ?? NaN;
  }
  return datos.densidadLiquido ?? NaN;
}

/** Unidad en la que sale el resultado de cada magnitud. */
export function unidadDeMagnitud(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'peso':
    case 'empuje':
    case 'pesoAparente':
    case 'fuerzaParaHundir':
      return 'N';
    case 'porcentajeSumergido':
    case 'porcentajeEmergido':
      return '%';
    case 'densidadDesdeFraccion':
    case 'densidadDesdePesos':
      return 'kg/m³';
    case 'volumenSumergidoDesdeMasa':
      return 'L';
    default:
      return '';
  }
}

/** Cifra y unidad, con espacio duro antes del %. */
function cifraConUnidad(cifra: string, unidad: string): string {
  if (!unidad) return cifra;
  return `${cifra}${unidad === '%' ? NBSP : ' '}${unidad}`;
}

function conUnidad(valor: number, datos: DatosCaso): string {
  return cifraConUnidad(formatNumber(valor, datos.decimales ?? 2), unidadDeMagnitud(datos.magnitud));
}

/** «ρc = 917 kg/m³ < ρl = 1000 kg/m³: flota», con el veredicto que da el MOTOR. */
function comparacion(rc: number, rl: number, r: ResultadoFlotabilidad): string {
  if (r.veredicto === 'flota') {
    return `Compara densidades: ρc = ${numero(rc)} kg/m³ es menor que ρl = ${numero(rl)} kg/m³, así que el cuerpo flota.`;
  }
  if (r.veredicto === 'se-hunde') {
    return `Compara densidades: ρc = ${numero(rc)} kg/m³ es mayor que ρl = ${numero(rl)} kg/m³, así que el cuerpo se hunde.`;
  }
  return `Compara densidades: ρc = ρl = ${numero(rl)} kg/m³, equilibrio indiferente.`;
}

/** «V = 8000 cm³ = 0,008 m³». */
function pasoVolumen(volumenCm3: number, r: ResultadoFlotabilidad): string {
  return `Pasa el volumen a m³: V = ${numero(volumenCm3)} cm³ ÷ 1.000.000 = ${numero(r.volumen, 8)} m³.`;
}

/** «P = ρc·V·g = 500·0,008·9,81 = 39,24 N». */
function pasoPeso(rc: number, r: ResultadoFlotabilidad, g: number): string {
  return `Peso: P = ρc·V·g = ${numero(rc)}·${numero(r.volumen, 8)}·${numero(g)} = ${numero(r.peso)} N (la masa es m = ρc·V = ${numero(r.masa)} kg).`;
}

/** «E_max = ρl·V·g = …». */
function pasoEmpujeMaximo(rl: number, r: ResultadoFlotabilidad, g: number): string {
  return `Empuje con el cuerpo entero bajo el líquido: E_max = ρl·V·g = ${numero(rl)}·${numero(r.volumen, 8)}·${numero(g)} = ${numero(r.empujeMaximo)} N.`;
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 *
 * @param g gravedad en m/s², la del motor por defecto. Solo la cambia el spec, para saber qué
 *          casos dependen de ella.
 */
export function resolverCaso(datos: DatosCaso, g: number = G): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  let valor: number;

  if (!positivo(g)) return fallo('La gravedad tiene que ser un número positivo.', pasos);

  const rl = densidadDelLiquido(datos);

  switch (datos.magnitud) {
    /* ── Lo que sale directamente de calcularFlotabilidad ───────────────── */
    case 'peso': {
      const rc = densidadDelCuerpo(datos);
      if (!positivo(rc)) return falta('la densidad del cuerpo', pasos);
      if (!positivo(datos.volumen)) return falta('el volumen', pasos);
      // El peso no depende del líquido: sin líquido en el enunciado, el motor se llama con agua.
      const r = calcularFlotabilidad(rc, datos.volumen, positivo(rl) ? rl : LIQUIDOS[0].densidad, g);
      if (!r) return fallo('El motor no puede calcular con esos datos.', pasos);
      pasos.push(pasoVolumen(datos.volumen, r));
      pasos.push(`Masa: m = ρc·V = ${numero(rc)}·${numero(r.volumen, 8)} = ${numero(r.masa)} kg.`);
      valor = r.peso;
      pasos.push(`Peso: P = m·g = ${numero(r.masa)}·${numero(g)} = ${numero(valor)} N.`);
      pasos.push('La masa va en kg y el peso, que es una fuerza, en newtons: no son la misma magnitud.');
      break;
    }

    case 'empuje': {
      const rc = densidadDelCuerpo(datos);
      if (!positivo(rc)) return falta('la densidad del cuerpo', pasos);
      if (!positivo(rl)) return falta('la densidad del líquido', pasos);
      if (!positivo(datos.volumen)) return falta('el volumen', pasos);
      const r = calcularFlotabilidad(rc, datos.volumen, rl, g);
      if (!r) return fallo('El motor no puede calcular con esos datos.', pasos);
      if (r.veredicto === 'indiferente') return fallo('Con densidades iguales el caso no tiene una única lectura.', pasos);
      pasos.push(comparacion(rc, rl, r));
      pasos.push(pasoVolumen(datos.volumen, r));
      valor = r.empuje;
      if (r.veredicto === 'flota') {
        pasos.push(
          `Como flota, sube hasta quedar en equilibrio: el empuje iguala al peso. E = P = ρc·V·g = ${numero(rc)}·${numero(r.volumen, 8)}·${numero(g)} = ${numero(valor)} N.`,
        );
        pasos.push(
          `Ojo: ρl·V·g = ${numero(r.empujeMaximo)} N es el empuje MÁXIMO, el que recibiría sumergido entero. Flotando solo desaloja la parte sumergida.`,
        );
      } else {
        pasos.push(
          `Como se hunde, queda entero bajo el líquido y desaloja todo su volumen: E = ρl·V·g = ${numero(rl)}·${numero(r.volumen, 8)}·${numero(g)} = ${numero(valor)} N.`,
        );
        pasos.push(
          `El peso, P = ρc·V·g = ${numero(r.peso)} N, es mayor que el empuje: por eso va al fondo. El empuje usa ρl (el líquido desalojado), no ρc.`,
        );
      }
      break;
    }

    case 'porcentajeSumergido':
    case 'porcentajeEmergido': {
      const rc = densidadDelCuerpo(datos);
      if (!positivo(rc)) return falta('la densidad del cuerpo', pasos);
      if (!positivo(rl)) return falta('la densidad del líquido', pasos);
      const r = calcularFlotabilidad(rc, positivo(datos.volumen) ? datos.volumen : VOLUMEN_REFERENCIA, rl, g);
      if (!r) return fallo('El motor no puede calcular con esos datos.', pasos);
      if (r.veredicto === 'indiferente') return fallo('Con densidades iguales el cuerpo se queda entre dos aguas.', pasos);
      pasos.push(comparacion(rc, rl, r));
      if (r.veredicto === 'se-hunde') {
        if (datos.magnitud === 'porcentajeEmergido') {
          return fallo('Un cuerpo que se hunde no asoma: la pregunta no tiene sentido.', pasos);
        }
        valor = r.fraccionSumergida * 100;
        pasos.push(
          `Como se hunde, va al fondo con todo su volumen bajo la superficie: queda sumergido el ${porcentaje(r.fraccionSumergida, 0)}.`,
        );
        pasos.push(
          `Si hubieras dividido ρc/ρl = ${numero(rc)}/${numero(rl)} = ${porcentaje(rc / rl, 1)}, saldría más del 100${NBSP}%, que es imposible: es la señal de que no flota.`,
        );
        break;
      }
      pasos.push(
        `Si flota, el empuje iguala al peso: ρl·V_sumergido·g = ρc·V·g. La g y el volumen se simplifican y queda f = V_sumergido/V = ρc/ρl, que no depende ni de g ni del tamaño del cuerpo.`,
      );
      pasos.push(
        `f = ρc/ρl = ${numero(rc)}/${numero(rl)} = ${numero(r.fraccionSumergida)}, es decir, queda sumergido el ${porcentaje(r.fraccionSumergida)}.`,
      );
      if (datos.magnitud === 'porcentajeEmergido') {
        valor = r.fraccionEmergida * 100;
        pasos.push(`Lo que asoma es el resto: 1 − f = 1 − ${numero(r.fraccionSumergida)} = ${numero(r.fraccionEmergida)}, el ${porcentaje(r.fraccionEmergida)}.`);
      } else {
        valor = r.fraccionSumergida * 100;
      }
      break;
    }

    case 'pesoAparente': {
      const rc = densidadDelCuerpo(datos);
      if (!positivo(rc)) return falta('la densidad del cuerpo', pasos);
      if (!positivo(rl)) return falta('la densidad del líquido', pasos);
      if (!positivo(datos.volumen)) return falta('el volumen', pasos);
      const r = calcularFlotabilidad(rc, datos.volumen, rl, g);
      if (!r) return fallo('El motor no puede calcular con esos datos.', pasos);
      pasos.push(comparacion(rc, rl, r));
      if (r.veredicto !== 'se-hunde' || r.pesoAparente === null) {
        return fallo('Si el cuerpo no se hunde no hay peso aparente: el líquido lo sostiene solo.', pasos);
      }
      pasos.push(pasoVolumen(datos.volumen, r));
      pasos.push(pasoPeso(rc, r, g));
      pasos.push(pasoEmpujeMaximo(rl, r, g));
      valor = r.pesoAparente;
      pasos.push(
        `El dinamómetro sostiene lo que el empuje no compensa: P_aparente = P − E = ${numero(r.peso)} − ${numero(r.empujeMaximo)} = ${numero(valor)} N.`,
      );
      break;
    }

    case 'fuerzaParaHundir': {
      const rc = densidadDelCuerpo(datos);
      if (!positivo(rc)) return falta('la densidad del cuerpo', pasos);
      if (!positivo(rl)) return falta('la densidad del líquido', pasos);
      if (!positivo(datos.volumen)) return falta('el volumen', pasos);
      const r = calcularFlotabilidad(rc, datos.volumen, rl, g);
      if (!r) return fallo('El motor no puede calcular con esos datos.', pasos);
      pasos.push(comparacion(rc, rl, r));
      if (r.veredicto !== 'flota' || r.fuerzaParaHundir === null) {
        return fallo('Solo hay que empujar hacia abajo un cuerpo que flota.', pasos);
      }
      pasos.push(pasoVolumen(datos.volumen, r));
      pasos.push(pasoPeso(rc, r, g));
      pasos.push(pasoEmpujeMaximo(rl, r, g));
      valor = r.fuerzaParaHundir;
      pasos.push(
        `Sumergido entero, el empuje supera al peso; la mano pone la diferencia: F = E_max − P = ${numero(r.empujeMaximo)} − ${numero(r.peso)} = ${numero(valor)} N, hacia abajo.`,
      );
      break;
    }

    /* ── Las inversiones, contrastadas de vuelta con el motor ───────────── */
    case 'densidadDesdeFraccion': {
      if (!positivo(rl)) return falta('la densidad del líquido', pasos);
      let f = datos.fraccionSumergida;
      if (f === undefined && datos.fraccionEmergida !== undefined) {
        f = 1 - datos.fraccionEmergida;
        pasos.push(
          `Si asoma el ${porcentaje(datos.fraccionEmergida, 1)}, bajo el líquido queda el resto: f = 1 − ${numero(datos.fraccionEmergida)} = ${numero(f)}.`,
        );
      }
      if (!positivo(f) || f >= 1) return falta('una fracción sumergida entre 0 y 1', pasos);
      pasos.push(
        'Si flota, el empuje iguala al peso: ρl·V_sumergido·g = ρc·V·g, así que f = V_sumergido/V = ρc/ρl. Ni g ni el volumen hacen falta.',
      );
      valor = f * rl;
      pasos.push(`Se despeja ρc = f·ρl = ${numero(f)}·${numero(rl)} = ${numero(valor)} kg/m³.`);
      const r = calcularFlotabilidad(valor, VOLUMEN_REFERENCIA, rl, g);
      if (!r || r.veredicto !== 'flota' || !cuadra(r.fraccionSumergida, f)) {
        return fallo('La densidad despejada no reproduce la fracción sumergida.', pasos);
      }
      pasos.push(
        `Comprobación: con ρc = ${numero(valor)} kg/m³, f = ρc/ρl = ${porcentaje(r.fraccionSumergida, 1)} sumergido y ${porcentaje(r.fraccionEmergida, 1)} fuera.`,
      );
      break;
    }

    case 'densidadDesdePesos': {
      if (!positivo(rl)) return falta('la densidad del líquido', pasos);
      const P = datos.pesoAire;
      const Pap = datos.pesoAparente;
      if (!positivo(P)) return falta('el peso en el aire', pasos);
      if (!positivo(Pap)) return falta('el peso aparente sumergido', pasos);
      if (Pap >= P) return fallo('Sumergido, un cuerpo que se hunde pesa MENOS que en el aire.', pasos);
      const E = P - Pap;
      pasos.push(`Lo que el dinamómetro deja de marcar es el empuje: E = P − P_aparente = ${numero(P)} − ${numero(Pap)} = ${numero(E)} N.`);
      pasos.push(
        'Divide el peso entre el empuje: P/E = (ρc·V·g)/(ρl·V·g) = ρc/ρl. El volumen y g se van: no hace falta conocerlos.',
      );
      valor = (rl * P) / E;
      pasos.push(`ρc = ρl·P/E = ${numero(rl)}·${numero(P)}/${numero(E)} = ${numero(valor)} kg/m³.`);
      // Para devolverla al motor hace falta un volumen: el que da ese empuje, V = E/(ρl·g).
      const volumenCm3 = (E / (rl * g)) * CM3_POR_M3;
      const r = calcularFlotabilidad(valor, volumenCm3, rl, g);
      if (!r || r.veredicto !== 'se-hunde' || !cuadra(r.peso, P) || !cuadra(r.pesoAparente, Pap)) {
        return fallo('La densidad despejada no reproduce los dos pesos.', pasos);
      }
      pasos.push(
        `Comprobación: un cuerpo de ${numero(valor)} kg/m³ y ${numero(volumenCm3, 2)} cm³ pesa ${numero(r.peso)} N en el aire y ${numero(r.pesoAparente ?? NaN)} N sumergido.`,
      );
      break;
    }

    case 'volumenSumergidoDesdeMasa': {
      if (!positivo(rl)) return falta('la densidad del líquido', pasos);
      if (!positivo(datos.masa)) return falta('la masa', pasos);
      if (!positivo(datos.volumen)) return falta('el volumen total', pasos);
      const volumenM3 = datos.volumen / CM3_POR_M3;
      const rMedia = datos.masa / volumenM3;
      pasos.push(
        `Densidad media, contando el aire de dentro: ρ = m/V = ${numero(datos.masa)}/${numero(volumenM3, 8)} = ${numero(rMedia)} kg/m³. Es la que decide, no la del material del casco.`,
      );
      const r = calcularFlotabilidad(rMedia, datos.volumen, rl, g);
      if (!r || !cuadra(r.masa, datos.masa)) {
        return fallo('La densidad media no reproduce la masa.', pasos);
      }
      pasos.push(comparacion(rMedia, rl, r));
      if (r.veredicto !== 'flota') return fallo('Con esa masa no flota: se hundiría entero.', pasos);
      pasos.push(`f = ρ/ρl = ${numero(rMedia)}/${numero(rl)} = ${numero(r.fraccionSumergida)} del casco queda bajo el agua.`);
      valor = r.fraccionSumergida * r.volumen * LITROS_POR_M3;
      pasos.push(
        `V_sumergido = f·V = ${numero(r.fraccionSumergida)}·${numero(r.volumen, 8)} m³ = ${numero(r.fraccionSumergida * r.volumen, 8)} m³ = ${numero(valor)} L (1 m³ = 1000 L).`,
      );
      pasos.push(
        `Así el agua desalojada pesa lo mismo que la lancha: ${numero(r.fraccionSumergida * r.volumen, 8)} m³ · ${numero(rl)} kg/m³ = ${numero(r.masa)} kg de agua.`,
      );
      break;
    }

    default:
      return fallo('Magnitud desconocida.', pasos);
  }

  if (!Number.isFinite(valor)) {
    return fallo('El resultado no es un número finito.', pasos);
  }

  // El último paso muestra la cifra con los MISMOS decimales que pide el enunciado.
  const redondeado = redondear(valor, decimales);
  pasos.push(
    exigeRedondeo(valor, decimales)
      ? `Redondeando ${textoRedondeo(decimales)}: ${conUnidad(redondeado, datos)}.`
      : `Resultado: ${conUnidad(redondeado, datos)}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * La tolerancia de un caso la da la PREGUNTA, no el tamaño de la cifra (hallazgo 2626,
 * 02/10/2026). Es el error de lectura de los datos propagado a la respuesta más media unidad del
 * redondeo pedido; aquí los datos son EXACTOS (nada se lee de una tabla ni de una gráfica), así
 * que solo queda el redondeo:
 *
 *   · si la cifra exacta tiene más decimales de los que se piden, media unidad del último
 *     decimal pedido: entra todo lo que redondea a la clave (de 10,45 a 10,55 en el caso 4);
 *   · si la cifra es exacta, no hay redondeo que tolerar: solo vale ella (264,87 N en el caso 1,
 *     15.000 kg/m³ en el 11).
 *
 * Es la forma reparada en simulador-mas-resorte, simulador-circuitos-electricos (060c1e94),
 * simulador-distribucion-normal (afdef86f) y simulador-fotografia (794ace00).
 *
 * ⚠️ Redondear un paso intermedio puede sacar la respuesta del margen; la intro lo avisa.
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
   * respuesta exacta (tolerancia 0) es lo único que separa 91,7 de 91,69999999999999.
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
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
  /**
   * La respuesta exacta tiene más decimales de los que se piden, así que el enunciado dice
   * «redondea». Se CALCULA desde el motor, no se declara a mano: no puede mentir.
   */
  requiereRedondeo: boolean;
  /**
   * Qué pulsar y escribir en el simulador para ver la cifra o confirmarla. Solo donde es VERDAD
   * con los controles actuales (seis materiales, seis líquidos, «Otra densidad» y el campo
   * Volumen de 1 a 10.000 cm³), y con el formato de las tarjetas: fuerzas con cuatro cifras
   * significativas, porcentajes con un decimal.
   */
  comoComprobar?: string;
}

/** «917 kg/m³»: la densidad de la lista, tal como la escribe el enunciado. */
function densidadMaterial(id: string): string {
  const s = MATERIALES.find((m) => m.id === id);
  return s ? `${numero(s.densidad)} kg/m³` : '—';
}

function densidadLiquidoTexto(id: string): string {
  const s = LIQUIDOS.find((l) => l.id === id);
  return s ? `${numero(s.densidad)} kg/m³` : '—';
}

const GRAVEDAD = `g = ${numero(G)} m/s²`;

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible. Las densidades con nombre se
 * escriben desde `materiales.ts`, igual que las lee `resolverCaso`.
 *
 * Sin ciudades, países ni monedas: el canal aula es sobre todo de fuera de España. Donde la
 * cifra exacta tiene más decimales de los pedidos, el enunciado pide el redondeo y el caso lo
 * marca con `requiereRedondeo`, que se calcula comparando la respuesta exacta con la redondeada.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'Lo que pesa un bloque de aluminio',
    enunciado: `Un bloque macizo de aluminio (${densidadMaterial('aluminio')}) tiene un volumen de 10.000 cm³. ¿Cuánto pesa, en newtons? Toma ${GRAVEDAD}.`,
    categoria: 'abstracto',
    // m = 2700·0,01 = 27 kg; P = 27·9,81 = 264,87 N. Errores: dar la masa, 27 · g = 10, 270 ·
    // no pasar cm³ a m³, 264.870.000 · tomar 1 L = 1 m³ (V = 10 m³), 264.870.
    datos: { magnitud: 'peso', cuerpo: 'aluminio', volumen: 10000, decimales: 2 },
    etiquetaRespuesta: 'P en N',
    pista: 'Pasa el volumen a m³ (divide entre 1.000.000), calcula la masa m = ρc·V y después el peso P = m·g.',
    comoComprobar:
      'Pulsa Aluminio y escribe 10000 en Volumen: la tarjeta «Masa m = ρc·V» marca 27 kg y «Peso P = ρc·V·g», 264,9 N (las tarjetas redondean a cuatro cifras significativas).',
  },
  {
    id: 2,
    titulo: 'Cuánto se hunde un cubito de hielo',
    enunciado: `Un cubito de hielo (${densidadMaterial('hielo')}) se echa en un vaso de agua dulce (${densidadLiquidoTexto('agua')}). ¿Qué porcentaje de su volumen queda bajo la superficie?`,
    categoria: 'abstracto',
    // f = 917/1000 = 91,7 %. Errores: ρl/ρc, 109,1 % (más del 100 %: imposible) · dar lo que
    // asoma, 8,3 % · usar agua de mar, 89,5 %.
    datos: { magnitud: 'porcentajeSumergido', cuerpo: 'hielo', liquido: 'agua', decimales: 1 },
    etiquetaRespuesta: 'Sumergido en %',
    pista: 'Compara densidades. Si flota, el empuje iguala al peso: ρl·V_sumergido·g = ρc·V·g. Despeja V_sumergido/V.',
    comoComprobar:
      'Pulsa Hielo y Agua dulce: la tarjeta «Sumergido f = ρc/ρl» marca 91,7 %, y no cambia aunque cambies el volumen.',
  },
  {
    id: 3,
    titulo: 'El mismo cubito en alcohol',
    enunciado: `El mismo cubito de hielo (${densidadMaterial('hielo')}) se echa ahora en un vaso de alcohol etílico (${densidadLiquidoTexto('alcohol')}). ¿Qué porcentaje de su volumen queda bajo la superficie del alcohol?`,
    categoria: 'aplicado',
    // Se hunde (917 > 789): 100 %. Es el veredicto, pedido como cifra. Errores: dividir sin
    // comparar, 917/789 = 116,2 % · al revés, 789/917 = 86,0 % · copiar el caso 2, 91,7 %.
    datos: { magnitud: 'porcentajeSumergido', cuerpo: 'hielo', liquido: 'alcohol', decimales: 0 },
    etiquetaRespuesta: 'Sumergido en %',
    pista: 'Antes de dividir, compara las dos densidades: ¿puede flotar el hielo en alcohol?',
    comoComprobar:
      'Pulsa Hielo y Alcohol etílico: el veredicto dice «Se hunde» (ρc = 917 > ρl = 789 kg/m³) y el dibujo deja el bloque en el fondo, entero bajo la superficie.',
  },
  {
    id: 4,
    titulo: 'La punta del iceberg',
    enunciado: `Un iceberg de hielo (${densidadMaterial('hielo')}) flota en agua de mar (${densidadLiquidoTexto('mar')}). ¿Qué porcentaje de su volumen asoma por encima del agua? Redondea a una décima.`,
    categoria: 'aplicado',
    // 1 − 917/1025 = 0,10537 → 10,5 %. Errores: dar lo sumergido, 89,5 % · usar agua dulce,
    // 8,3 % · 1 − ρl/ρc, −11,8 %.
    datos: { magnitud: 'porcentajeEmergido', cuerpo: 'hielo', liquido: 'mar', decimales: 1 },
    etiquetaRespuesta: 'Asoma en %',
    pista: 'Calcula primero la fracción sumergida, f = ρc/ρl. Lo que asoma es el resto, 1 − f.',
    comoComprobar: 'Pulsa Hielo y Agua de mar: la tarjeta «Sobresale 1 − f» marca 10,5 %.',
  },
  {
    id: 5,
    titulo: 'El empuje sobre un bloque que flota',
    enunciado: `Un bloque de madera de pino (${densidadMaterial('pino')}) de 8000 cm³ se deja en agua dulce (${densidadLiquidoTexto('agua')}). ¿Qué empuje recibe del agua cuando queda en reposo, en newtons? Toma ${GRAVEDAD}.`,
    categoria: 'abstracto',
    // Flota: E = P = 500·0,008·9,81 = 39,24 N. Errores: el empuje máximo ρl·V·g, 78,48 N ·
    // dar la masa, 4 · g = 10, 40.
    datos: { magnitud: 'empuje', cuerpo: 'pino', liquido: 'agua', volumen: 8000, decimales: 2 },
    etiquetaRespuesta: 'E en N',
    pista: 'Compara densidades. Si flota, está en equilibrio: el empuje vale lo mismo que el peso, no ρl·V·g con todo el volumen.',
    comoComprobar:
      'Pulsa Madera de pino y Agua dulce y escribe 8000 en Volumen: la tarjeta «Empuje en equilibrio (E = P)» marca 39,24 N.',
  },
  {
    id: 6,
    titulo: 'El empuje sobre una pieza que se hunde',
    enunciado: `Una pieza de hierro (${densidadMaterial('hierro')}) de 2000 cm³ se suelta dentro de un recipiente con agua dulce (${densidadLiquidoTexto('agua')}). ¿Qué empuje recibe del agua, en newtons? Toma ${GRAVEDAD}.`,
    categoria: 'abstracto',
    // Se hunde: E = ρl·V·g = 1000·0,002·9,81 = 19,62 N. Errores: E = P como si flotara,
    // 154,41 N · ρc en lugar de ρl, la misma 154,41 · g = 10, 20.
    datos: { magnitud: 'empuje', cuerpo: 'hierro', liquido: 'agua', volumen: 2000, decimales: 2 },
    etiquetaRespuesta: 'E en N',
    pista: 'Compara densidades. Si se hunde, queda entero bajo el agua y desaloja todo su volumen: E = ρl·V·g.',
    comoComprobar:
      'Pulsa Hierro y Agua dulce y escribe 2000 en Volumen: la tarjeta «Empuje E = ρl·V·g» marca 19,62 N.',
  },
  {
    id: 7,
    titulo: 'La misma pieza de hierro en mercurio',
    enunciado: `La misma pieza de hierro (${densidadMaterial('hierro')}, 2000 cm³) se suelta ahora en mercurio (${densidadLiquidoTexto('mercurio')}). ¿Qué empuje recibe del mercurio cuando queda en reposo, en newtons? Toma ${GRAVEDAD} y redondea a dos decimales.`,
    categoria: 'abstracto',
    // Flota (7870 < 13.534): E = P = 7870·0,002·9,81 = 154,4094 → 154,41 N. Errores: el empuje
    // máximo ρl·V·g, 265,54 N · copiar el caso 6, 19,62 · g = 10, 157,4.
    datos: { magnitud: 'empuje', cuerpo: 'hierro', liquido: 'mercurio', volumen: 2000, decimales: 2 },
    etiquetaRespuesta: 'E en N',
    pista: 'En mercurio, ¿el hierro flota o se hunde? Si flota, el empuje no es ρl·V·g.',
    comoComprobar:
      'Pulsa Hierro y Mercurio y escribe 2000 en Volumen: la tarjeta «Empuje en equilibrio (E = P)» marca 154,4 N (cuatro cifras significativas).',
  },
  {
    id: 8,
    titulo: 'Una pieza colgada de un dinamómetro',
    enunciado: `Una pieza de aluminio (${densidadMaterial('aluminio')}) de 500 cm³ cuelga de un dinamómetro y se sumerge entera en agua dulce (${densidadLiquidoTexto('agua')}), sin tocar el fondo. ¿Qué marca el dinamómetro, en newtons? Toma ${GRAVEDAD} y redondea a dos decimales.`,
    categoria: 'aplicado',
    // P = 13,2435 N, E = 4,905 N, P − E = 8,3385 → 8,34 N. Errores: el peso, 13,24 · el
    // empuje, 4,91 · sumarlos, 18,15 · g = 10, 8,5.
    datos: { magnitud: 'pesoAparente', cuerpo: 'aluminio', liquido: 'agua', volumen: 500, decimales: 2 },
    etiquetaRespuesta: 'Lectura del dinamómetro en N',
    pista: 'El dinamómetro marca el peso aparente: el peso menos el empuje del agua con la pieza entera dentro.',
    comoComprobar:
      'Pulsa Aluminio y Agua dulce y escribe 500 en Volumen: la tarjeta «Peso aparente P − E (dinamómetro)» marca 8,339 N (cuatro cifras significativas).',
  },
  {
    id: 9,
    titulo: 'Hundir un flotador de corcho',
    enunciado: `Un flotador de corcho (${densidadMaterial('corcho')}) de 5000 cm³ flota en agua de mar (${densidadLiquidoTexto('mar')}). ¿Qué fuerza hacia abajo hay que hacer para mantenerlo sumergido entero, en newtons? Toma ${GRAVEDAD} y redondea a dos decimales.`,
    categoria: 'aplicado',
    // E_max − P = (1025 − 240)·0,005·9,81 = 38,50425 → 38,50 N. Errores: el peso, 11,77 · el
    // empuje máximo, 50,27 · agua dulce, 37,28 · g = 10, 39,25.
    datos: { magnitud: 'fuerzaParaHundir', cuerpo: 'corcho', liquido: 'mar', volumen: 5000, decimales: 2 },
    etiquetaRespuesta: 'F para hundirlo en N',
    pista: 'Sumergido entero recibe el empuje máximo ρl·V·g, mayor que su peso. Tu mano pone la diferencia.',
    comoComprobar:
      'Pulsa Corcho y Agua de mar y escribe 5000 en Volumen: la tarjeta «Fuerza para hundirlo entero (E_max − P)» marca 38,5 N (cuatro cifras significativas).',
  },
  {
    id: 10,
    titulo: 'La densidad de un tronco',
    enunciado: `Un tronco de una madera desconocida flota en agua de mar (${densidadLiquidoTexto('mar')}) con el 40${NBSP}% de su volumen fuera del agua. ¿Cuál es la densidad de esa madera, en kg/m³?`,
    categoria: 'aplicado',
    // f = 0,6 → ρc = 0,6·1025 = 615 kg/m³. Errores: usar lo que asoma, 0,4·1025 = 410 · tomar
    // agua dulce, 600 · ρl/f, 1708.
    datos: { magnitud: 'densidadDesdeFraccion', liquido: 'mar', fraccionEmergida: 0.4, decimales: 0 },
    etiquetaRespuesta: 'Densidad en kg/m³',
    pista: 'Lo sumergido es el 60 %. Y si flota, la fracción sumergida es f = ρc/ρl: despeja ρc.',
    comoComprobar:
      'En Material pulsa «Otra densidad», escribe tu resultado en «Densidad del cuerpo» y pulsa Agua de mar: si es correcto, la tarjeta «Sobresale 1 − f» marca 40,0 %.',
  },
  {
    id: 11,
    titulo: 'La corona de Arquímedes',
    enunciado: `Para saber si una corona es de oro puro (${densidadMaterial('oro')}), se cuelga de un dinamómetro: marca 15 N en el aire y 14 N con la corona sumergida entera en agua dulce (${densidadLiquidoTexto('agua')}). ¿Cuál es la densidad media de la corona, en kg/m³?`,
    categoria: 'aplicado',
    // E = 1 N; ρc = 1000·15/1 = 15.000 kg/m³ (no es oro puro). Errores: el aparente arriba,
    // 1000·14/1 = 14.000 · dividir entre el aparente, 1000·15/14 = 1071 · E/P, 67.
    datos: { magnitud: 'densidadDesdePesos', liquido: 'agua', pesoAire: 15, pesoAparente: 14, decimales: 0 },
    etiquetaRespuesta: 'Densidad en kg/m³',
    pista: 'La diferencia entre las dos lecturas es el empuje, E = ρl·V·g. Divide el peso (ρc·V·g) entre el empuje: V y g se van.',
    comoComprobar:
      'En Material pulsa «Otra densidad», escribe tu resultado en «Densidad del cuerpo» y deja Agua dulce: si es correcto, la tarjeta «Pierde de su peso (E/P = ρl/ρc)» marca 6,7 %, que es lo que pierde la corona (1 N de 15 N).',
  },
  {
    id: 12,
    titulo: 'Cuánto se hunde una lancha',
    enunciado: `El casco de una lancha encierra en total 1 m³, contando el aire de dentro, y la lancha con su carga tiene una masa de 410 kg. Flota en agua de mar (${densidadLiquidoTexto('mar')}). ¿Qué volumen del casco queda bajo el agua, en litros?`,
    categoria: 'aplicado',
    // ρ media = 410 kg/m³; f = 410/1025 = 0,4; V_s = 0,4 m³ = 400 L. Errores: «1 kg desaloja
    // 1 L» (agua dulce), 410 L · dar lo que asoma, 600 L · ρl/ρ, 2500 L.
    datos: { magnitud: 'volumenSumergidoDesdeMasa', liquido: 'mar', masa: 410, volumen: 1_000_000, decimales: 0 },
    etiquetaRespuesta: 'V sumergido en L',
    pista: 'Calcula la densidad media de la lancha (su masa entre su volumen total, aire incluido) y la fracción sumergida f = ρ/ρl.',
    comoComprobar:
      'El metro cúbico no cabe en el campo Volumen, pero la fracción no depende del volumen: en Material pulsa «Otra densidad», escribe la densidad media de la lancha y pulsa Agua de mar. La tarjeta «Sumergido f = ρc/ρl» te da la fracción; aplicada a 1000 L, es tu respuesta.',
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «8,34 N», «10,5 %». La unidad es
 * lo que va detrás de « en » en la etiqueta («Lectura del dinamómetro en N» → «N»), así que no
 * se imprime nunca un número suelto junto a media frase (hallazgo 830 de `simulador-genetica`).
 */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  const corte = etiqueta.indexOf(' en ');
  const unidad = corte === -1 ? '' : etiqueta.slice(corte + 4);
  return cifraConUnidad(formatNumber(valor, decimales), unidad);
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
    pasos: r.pasos,
    requiereRedondeo: r.ok && exigeRedondeo(r.valor, decimales),
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
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

/**
 * Listas «amables»: densidades «de problema» sin nombre de material (ninguna se hace pasar por
 * una sustancia real) y volúmenes redondos dentro del rango del campo Volumen. Los cuerpos
 * ligeros son siempre menos densos que el líquido más ligero (800), así que flotan en todos;
 * los pesados, más densos que el más denso (1250), así que se hunden en todos.
 */
const DENSIDADES_LIGERAS = [200, 250, 400, 500, 600, 750] as const;
const DENSIDADES_PESADAS = [1500, 2000, 2500, 3000, 4000, 5000, 8000] as const;
const DENSIDADES_LIQUIDO = [800, 1000, 1200, 1250] as const;
const VOLUMENES = [200, 250, 400, 500, 800, 1500, 2000, 2500, 4000, 5000] as const;
const PREGUNTAS = ['porcentajeSumergido', 'peso', 'empuje', 'pesoAparente', 'fuerzaParaHundir'] as const;
type Pregunta = (typeof PREGUNTAS)[number];

/**
 * Respuesta mínima: con dos decimales, una fuerza de 0,04 N dejaría una o dos cifras
 * significativas, poco para comprobar nada. Por debajo de 0,5 se vuelven a tirar los datos.
 */
const RESPUESTA_MINIMA = 0.5;
const MAX_INTENTOS = 30;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

const ETIQUETAS: Record<Pregunta, string> = {
  porcentajeSumergido: 'Sumergido en %',
  peso: 'P en N',
  empuje: 'E en N',
  pesoAparente: 'Lectura del dinamómetro en N',
  fuerzaParaHundir: 'F para hundirlo en N',
};

function enunciadoPractica(pregunta: Pregunta, d: DatosCaso): string {
  const rc = `${numero(d.densidadCuerpo ?? NaN)} kg/m³`;
  const rl = `${numero(d.densidadLiquido ?? NaN)} kg/m³`;
  const V = `${numero(d.volumen ?? NaN)} cm³`;
  const fuerzas = `Toma ${GRAVEDAD} y redondea a dos decimales.`;
  switch (pregunta) {
    case 'porcentajeSumergido':
      return `Un cuerpo de ${rc} se deja en un líquido de ${rl}. ¿Qué porcentaje de su volumen queda bajo la superficie? Redondea a una décima.`;
    case 'peso':
      return `Un cuerpo de ${rc} tiene un volumen de ${V}. ¿Cuánto pesa, en newtons? ${fuerzas}`;
    case 'empuje':
      return `Un cuerpo de ${rc} y ${V} se suelta en un líquido de ${rl}. ¿Qué empuje recibe cuando queda en reposo, en newtons? ${fuerzas}`;
    case 'pesoAparente':
      return `Un cuerpo de ${rc} y ${V} cuelga de un dinamómetro, sumergido entero en un líquido de ${rl}. ¿Qué marca el dinamómetro, en newtons? ${fuerzas}`;
    case 'fuerzaParaHundir':
    default:
      return `Un cuerpo de ${rc} y ${V} flota en un líquido de ${rl}. ¿Qué fuerza hacia abajo hay que hacer para mantenerlo sumergido entero, en newtons? ${fuerzas}`;
  }
}

/**
 * Ejercicio aleatorio de flotabilidad. Usa EL MISMO `resolverCaso` que los doce fijos, y por
 * tanto el mismo motor que el panel: si divergieran, el alumno entrenaría con una regla y sería
 * corregido con otra. El peso aparente solo se pregunta con cuerpos que se hunden y la fuerza
 * para hundir y el porcentaje sumergido, con cuerpos que flotan.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  const decimales = pregunta === 'porcentajeSumergido' ? 1 : 2;

  const tirar = (): DatosCaso => {
    let densidadCuerpo: number;
    if (pregunta === 'pesoAparente') densidadCuerpo = elegir(DENSIDADES_PESADAS, rnd);
    else if (pregunta === 'porcentajeSumergido' || pregunta === 'fuerzaParaHundir') {
      densidadCuerpo = elegir(DENSIDADES_LIGERAS, rnd);
    } else {
      densidadCuerpo = rnd() < 0.5 ? elegir(DENSIDADES_LIGERAS, rnd) : elegir(DENSIDADES_PESADAS, rnd);
    }
    return {
      magnitud: pregunta,
      densidadCuerpo,
      densidadLiquido: elegir(DENSIDADES_LIQUIDO, rnd),
      volumen: elegir(VOLUMENES, rnd),
      decimales,
    };
  };

  let datos = tirar();
  let r = resolverCaso(datos);
  let intentos = 0;
  while (!(r.ok && r.valor >= RESPUESTA_MINIMA) && intentos < MAX_INTENTOS) {
    datos = tirar();
    r = resolverCaso(datos);
    intentos += 1;
  }
  if (!(r.ok && r.valor >= RESPUESTA_MINIMA)) {
    // Salida segura, que cumple el mínimo para cualquier pregunta: 2000 cm³ en un líquido de
    // 1000 kg/m³, con un cuerpo que flota o se hunde según lo que pida la pregunta.
    datos = {
      magnitud: pregunta,
      densidadCuerpo: pregunta === 'pesoAparente' ? 3000 : 400,
      densidadLiquido: 1000,
      volumen: 2000,
      decimales,
    };
    r = resolverCaso(datos);
  }

  return {
    enunciado: enunciadoPractica(pregunta, datos),
    datos,
    respuesta: r.ok ? redondear(r.valor, decimales) : NaN,
    etiquetaRespuesta: ETIQUETAS[pregunta],
    pasos: r.pasos,
  };
}
