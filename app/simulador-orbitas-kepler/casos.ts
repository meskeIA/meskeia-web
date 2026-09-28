/**
 * Casos para clase — la tarea asignable de `simulador-orbitas-kepler`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada de mecánica orbital se replica aquí: se importa de `./motor.ts`, que es lo que pinta el
 * panel de resultados del simulador. Periodo, distancias extremas, velocidad circular y
 * velocidades en los extremos salen del MISMO `calcularOrbita`, con las MISMAS constantes (G,
 * masas, radios, UA, día y año). Si divergieran, la app suspendería una respuesta que ella misma
 * imprime, que es el peor fallo posible en algo que corrige a un alumno.
 *
 * Las únicas cuentas que no pasan por el motor son las de PURA PROPORCIÓN (casos 1, 2 y 6:
 * tercera ley entre dos satélites del mismo cuerpo y v_esc = √2·v_c), que no dependen de
 * ninguna constante, y la inversión de la tercera ley para «pesar» un planeta (caso 12), que
 * usa la G del motor pero no puede llamar a `calcularOrbita` porque la masa es la incógnita.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **Distancias al CENTRO del cuerpo**, como el semieje y las distancias del panel. Solo los
 *    enunciados que dicen «altura» la miden desde la superficie (casos 4 y 9, y la práctica de
 *    periodo); ahí el paso a la distancia al centro, sumando el radio, es la mitad del ejercicio.
 *
 * ⚠️ **Las constantes son las de la app**, y cada enunciado que depende de una la DA:
 *    G = 6,674·10⁻¹¹ N·m²/kg², M_Tierra = 5,972·10²⁴ kg, R_Tierra = 6.371 km,
 *    M_Sol = 1,989·10³⁰ kg, 1 UA = 149.597.870,7 km, 1 día = 86.400 s, 1 año = 365,25 días.
 *    Por eso el caso 11 da 7,9991 años y no 8 exactos: la tercera ley con la Tierra como patrón
 *    (T² = a³ en años y UA) da 8, y el motor se separa un 0,01 % por los decimales de G·M_Sol
 *    y por el año juliano. Redondeado a dos decimales son 8,00 las dos vías, y la solución lo
 *    explica.
 *
 * ⚠️ **Periodo en la unidad que pide el enunciado**: minutos, horas o años, como los imprime el
 *    panel (`formatTiempo`: minutos con un decimal por debajo de 2 h, horas con dos por debajo
 *    de 2 días, años con dos). Velocidades en km/s (el panel da tres decimales) y distancias en
 *    km (el panel da unidades entre 1.000 y 10⁶ km). Así el alumno puede cargar el caso y
 *    comparar.
 *
 * ⚠️ **«Media orbital» (2πa/T) no se pregunta.** En una órbita excéntrica no es la velocidad
 *    media, y ningún caso depende de ella.
 *
 * ⚠️ **Caso 10 y el deslizador de excentricidad.** El deslizador va de 0,001 en 0,001 y la
 *    excentricidad de Mercurio es 0,2056. Se decidió que `configuracionSimulador` admita, además
 *    de la rejilla del deslizador, una coincidencia EXACTA con una órbita real (preset) del mismo
 *    cuerpo: la app ya carga así los presets (pone 0,2056 en el estado aunque el deslizador no
 *    pueda llegar), y `page.tsx` marca entonces el botón «Mercurio». Lo que se carga es
 *    exactamente lo que dice el enunciado.
 */

import { formatNumber } from '@/lib';
import { ANIO, DIA, G, PRESETS, UA, calcularOrbita, cuerpoPorId, type CuerpoCentral } from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** T_B a partir de T_A y de a_B/a_A (tercera ley como proporción). */
  | 'periodoProporcion'
  /** a_B/a_A a partir de T_B/T_A (tercera ley al revés). */
  | 'razonSemiejes'
  /** Periodo de una órbita con el motor de la app. */
  | 'periodo'
  /** Velocidad de una órbita circular de radio a, en km/s. */
  | 'velocidadCircular'
  /** Velocidad de escape a partir de la circular a la misma distancia (√2·v_c). */
  | 'escapeDesdeCircular'
  /** Distancia del punto más lejano al centro del cuerpo, en km. */
  | 'apoastro'
  /** Distancia del punto más cercano al centro del cuerpo, en km. */
  | 'periastro'
  /** Excentricidad a partir de las dos distancias extremas. */
  | 'excentricidad'
  /** Altura del punto más cercano sobre la superficie del cuerpo, en km. */
  | 'alturaPeriastro'
  /** v_peri / v_apo. */
  | 'razonVelocidadesExtremos'
  /** Masa del cuerpo central a partir de a y T de un satélite, en unidades de 10²⁷ kg. */
  | 'masaCentral';

export type UnidadTiempo = 'min' | 'h' | 'años';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Cuerpo central de la app: 'sol', 'tierra', 'marte' o 'jupiter'. */
  cuerpoId?: string;
  /** Semieje mayor en km, medido desde el centro del cuerpo. */
  semiejeKm?: number;
  /** Semieje mayor en UA (alternativa a `semiejeKm`). */
  semiejeUA?: number;
  /** Altura sobre la superficie de una órbita circular: a = R + h (alternativa a `semiejeKm`). */
  alturaKm?: number;
  /** Excentricidad. Por defecto 0 (órbita circular). */
  excentricidad?: number;
  /** Unidad en que se pide un periodo. */
  unidadTiempo?: UnidadTiempo;
  /** Periodo del satélite A, en horas (tercera ley como proporción). */
  periodoAHoras?: number;
  /** a_B / a_A. */
  razonSemiejes?: number;
  /** T_B / T_A. */
  razonPeriodos?: number;
  /** Velocidad circular conocida, en km/s. */
  velocidadCircularKms?: number;
  /** Distancia del punto más cercano al centro, en km. */
  periastroKm?: number;
  /** Distancia del punto más lejano al centro, en km. */
  apoastroKm?: number;
  /** Periodo en días (para «pesar» el cuerpo central). */
  periodoDias?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Formato ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (h, min, años, km/s, km, 10²⁷ kg o sin unidad). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «0,2546», «26.560». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

const SUPERINDICES: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/** Notación científica en formato español: «3,9856·10¹⁴». */
function cientifico(n: number, cifras = 4): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const exponente = Math.floor(Math.log10(Math.abs(n)));
  const mantisa = n / 10 ** exponente;
  const sup = String(exponente)
    .split('')
    .map((c) => SUPERINDICES[c] ?? c)
    .join('');
  return `${numero(mantisa, cifras)}·10${sup}`;
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** «a unidades», «a una décima», «a dos decimales»: lo mismo que dice el enunciado. */
function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  return `a ${decimales} decimales`;
}

/** Unidad en la que sale el resultado de cada magnitud ('' si no tiene). */
export function unidadDeMagnitud(datos: DatosCaso): string {
  switch (datos.magnitud) {
    case 'periodoProporcion':
      return 'h';
    case 'periodo':
      return datos.unidadTiempo ?? 'h';
    case 'velocidadCircular':
    case 'escapeDesdeCircular':
      return 'km/s';
    case 'apoastro':
    case 'periastro':
    case 'alturaPeriastro':
      return 'km';
    case 'masaCentral':
      return '10²⁷ kg';
    default:
      return '';
  }
}

/** Une cifra y unidad: «11,97 h», «1,90·10²⁷ kg» (una potencia de diez va pegada con «·»). */
function unirConUnidad(cifra: string, unidad: string): string {
  if (!unidad) return cifra;
  return unidad.startsWith('10') ? `${cifra}·${unidad}` : `${cifra} ${unidad}`;
}

/**
 * La unidad que declara una etiqueta «T en h» → «h». Las que dicen «(sin unidad)» no tienen.
 * Todas las etiquetas de este módulo siguen ese patrón y su unidad coincide con
 * `unidadDeMagnitud`, así que las dos vías imprimen lo mismo.
 */
export function unidadDe(etiqueta: string): string {
  if (etiqueta.includes('sin unidad')) return '';
  const corte = etiqueta.indexOf(' en ');
  return corte === -1 ? '' : etiqueta.slice(corte + 4);
}

/**
 * La respuesta con su unidad: «11,97 h», «0,71», «25.000 km». La unidad sale de los DATOS del
 * caso o de su etiqueta, nunca de un recorte hecho en la vista (hallazgo 830 de
 * `simulador-genetica`). Con datos, los decimales son los del caso; con etiqueta, el tercer
 * argumento (2 por defecto).
 */
export function textoRespuesta(valor: number, datosOEtiqueta: DatosCaso | string, decimales?: number): string {
  if (!Number.isFinite(valor)) return '—';
  if (typeof datosOEtiqueta === 'string') {
    return unirConUnidad(formatNumber(valor, decimales ?? 2), unidadDe(datosOEtiqueta));
  }
  return unirConUnidad(
    formatNumber(valor, decimales ?? datosOEtiqueta.decimales ?? 2),
    unidadDeMagnitud(datosOEtiqueta),
  );
}

/* ─────────────────────────── Resolución ─────────────────────────── */

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/** Falta un dato obligatorio: se responde con un error legible, nunca con una excepción. */
function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

/** «el Sol», «la Tierra», «Marte»… para los pasos. */
function conArticulo(cuerpo: CuerpoCentral): string {
  if (cuerpo.id === 'sol') return 'el Sol';
  if (cuerpo.id === 'tierra') return 'la Tierra';
  return cuerpo.nombre;
}

/** «del Sol», «de la Tierra», «de Marte»: evita el «de el Sol». */
function deCuerpo(cuerpo: CuerpoCentral): string {
  return cuerpo.id === 'sol' ? 'del Sol' : `de ${conArticulo(cuerpo)}`;
}

/**
 * El semieje mayor en km a partir de lo que dé el caso (km, UA o altura), con los pasos que lo
 * explican. `null` si el caso no da ninguno de los tres.
 */
function semiejeDe(datos: DatosCaso, cuerpo: CuerpoCentral, pasos: string[]): number | null {
  if (positivo(datos.semiejeKm)) return datos.semiejeKm;
  const radioKm = cuerpo.radio / 1000;
  if (positivo(datos.semiejeUA)) {
    const aKm = (datos.semiejeUA * UA) / 1000;
    pasos.push(
      `Semieje en km: a = ${numero(datos.semiejeUA)} UA × ${numero(UA / 1000, 1)} km/UA = ${numero(aKm, 1)} km.`,
    );
    return aKm;
  }
  if (typeof datos.alturaKm === 'number' && Number.isFinite(datos.alturaKm) && datos.alturaKm >= 0) {
    const aKm = radioKm + datos.alturaKm;
    pasos.push(
      `La distancia que entra en las fórmulas es al CENTRO ${deCuerpo(cuerpo)}, no a la superficie: a = R + h = ${numero(radioKm)} + ${numero(datos.alturaKm)} = ${numero(aKm)} km.`,
    );
    return aKm;
  }
  return null;
}

/** Paso con el parámetro gravitacional μ = G·M del cuerpo central. */
function pasoMu(cuerpo: CuerpoCentral): string {
  return `Parámetro gravitacional ${deCuerpo(cuerpo)}: μ = G·M = ${cientifico(G)} × ${cientifico(cuerpo.masa)} = ${cientifico(G * cuerpo.masa)} m³/s².`;
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

  switch (datos.magnitud) {
    case 'periodoProporcion': {
      if (!positivo(datos.periodoAHoras)) return falta('el periodo del satélite A', pasos);
      if (!positivo(datos.razonSemiejes)) return falta('la razón de semiejes', pasos);
      const k = datos.razonSemiejes;
      const factor = k * Math.sqrt(k); // k^1,5 sin pasar por Math.pow: 4 → 8 exacto
      pasos.push(
        'Tercera ley para dos satélites del MISMO cuerpo central: (T_B/T_A)² = (a_B/a_A)³. G y la masa del cuerpo se cancelan.',
      );
      pasos.push(
        `Despejando: T_B/T_A = (a_B/a_A)^1,5 = ${numero(k)}^1,5 = √(${numero(k)}³) = √${numero(k * k * k)} = ${numero(factor)}.`,
      );
      valor = datos.periodoAHoras * factor;
      pasos.push(`T_B = T_A × ${numero(factor)} = ${numero(datos.periodoAHoras)} × ${numero(factor)} = ${numero(valor)} h.`);
      break;
    }

    case 'razonSemiejes': {
      if (!positivo(datos.razonPeriodos)) return falta('la razón de periodos', pasos);
      const r = datos.razonPeriodos;
      pasos.push('Tercera ley al revés: (a_B/a_A)³ = (T_B/T_A)², así que a_B/a_A = (T_B/T_A)^(2/3).');
      valor = Math.cbrt(r * r); // ∛(8²) = ∛64 = 4 exacto
      pasos.push(`a_B/a_A = ∛(${numero(r)}²) = ∛${numero(r * r)} = ${numero(valor)}.`);
      break;
    }

    case 'periodo':
    case 'velocidadCircular':
    case 'apoastro':
    case 'periastro':
    case 'alturaPeriastro':
    case 'razonVelocidadesExtremos': {
      const cuerpo = cuerpoPorId(datos.cuerpoId ?? '');
      if (!cuerpo) return falta('el cuerpo central', pasos);
      const aKm = semiejeDe(datos, cuerpo, pasos);
      if (aKm === null) return falta('el semieje mayor', pasos);
      const e = datos.excentricidad ?? 0;
      if (!Number.isFinite(e) || e < 0 || e >= 1) return falta('una excentricidad entre 0 y 1', pasos);
      // El MISMO cálculo que el panel de resultados (la masa del satélite no interviene aquí).
      const orbita = calcularOrbita(aKm, e, cuerpo, 0);

      if (datos.magnitud === 'periodo') {
        pasos.push(pasoMu(cuerpo));
        pasos.push(`Semieje en metros: a = ${numero(aKm, 1)} km = ${cientifico(orbita.a, 5)} m.`);
        pasos.push(
          `Tercera ley de Kepler: T = 2π·√(a³/μ) = 2π·√(${cientifico(orbita.a * orbita.a * orbita.a)} / ${cientifico(G * cuerpo.masa)}) = ${numero(orbita.periodo, 1)} s.`,
        );
        const unidad = datos.unidadTiempo ?? 'h';
        if (unidad === 'min') {
          valor = orbita.periodo / 60;
          pasos.push(`En minutos: ${numero(orbita.periodo, 1)} s / 60 = ${numero(valor)} min.`);
        } else if (unidad === 'h') {
          valor = orbita.periodo / 3600;
          pasos.push(`En horas: ${numero(orbita.periodo, 1)} s / 3.600 = ${numero(valor)} h.`);
        } else {
          valor = orbita.periodo / ANIO;
          pasos.push(
            `En años: 1 año = 365,25 días × 86.400 s = ${numero(ANIO)} s, así que T = ${numero(orbita.periodo, 0)} / ${numero(ANIO)} = ${numero(valor)} años.`,
          );
          if (positivo(datos.semiejeUA) && cuerpo.id === 'sol') {
            const patron = datos.semiejeUA * Math.sqrt(datos.semiejeUA);
            pasos.push(
              `Comprobación con la Tierra como patrón (a = 1 UA, T = 1 año): T² = a³ da T = ${numero(datos.semiejeUA)}^1,5 = ${numero(patron)} años. El motor da ${numero(valor)} porque G y M_Sol llevan cuatro cifras y el año es juliano: la diferencia es del 0,01 % y desaparece al redondear.`,
            );
          }
        }
        break;
      }

      if (datos.magnitud === 'velocidadCircular') {
        pasos.push(pasoMu(cuerpo));
        pasos.push(`Radio de la órbita en metros: a = ${numero(aKm, 1)} km = ${cientifico(orbita.a, 5)} m.`);
        pasos.push(
          `Órbita circular: v = √(μ/a) = √(${cientifico(G * cuerpo.masa)} / ${cientifico(orbita.a, 5)}) = ${numero(orbita.vCircular, 1)} m/s.`,
        );
        valor = orbita.vCircular / 1000;
        pasos.push(`En km/s: ${numero(orbita.vCircular, 1)} / 1.000 = ${numero(valor)} km/s.`);
        break;
      }

      if (datos.magnitud === 'apoastro') {
        valor = orbita.rApo / 1000;
        pasos.push(
          `El punto más lejano (${cuerpo.apo.toLowerCase()}) está a r = a·(1 + e) del centro: ${numero(aKm)} × (1 + ${numero(e)}) = ${numero(aKm)} × ${numero(1 + e)} = ${numero(valor)} km.`,
        );
        break;
      }

      if (datos.magnitud === 'periastro') {
        valor = orbita.rPeri / 1000;
        pasos.push(
          `El punto más cercano (${cuerpo.peri.toLowerCase()}) está a r = a·(1 − e) del centro: ${numero(aKm)} × (1 − ${numero(e)}) = ${numero(aKm)} × ${numero(1 - e)} = ${numero(valor)} km.`,
        );
        break;
      }

      if (datos.magnitud === 'alturaPeriastro') {
        const rPeriKm = orbita.rPeri / 1000;
        const radioKm = cuerpo.radio / 1000;
        pasos.push(
          `Distancia del ${cuerpo.peri.toLowerCase()} al CENTRO: r = a·(1 − e) = ${numero(aKm)} × ${numero(1 - e)} = ${numero(rPeriKm)} km.`,
        );
        valor = rPeriKm - radioKm;
        pasos.push(
          `Altura sobre la superficie: h = r − R = ${numero(rPeriKm)} − ${numero(radioKm)} = ${numero(valor)} km.`,
        );
        if (valor <= 0) {
          return { ok: false, valor: NaN, pasos, error: 'La órbita corta la superficie: no hay altura que calcular.' };
        }
        break;
      }

      // razonVelocidadesExtremos
      pasos.push(
        'Segunda ley (conservación del momento angular): en los dos extremos la velocidad es perpendicular al radio, así que r_p·v_p = r_a·v_a.',
      );
      pasos.push(
        `v_p/v_a = r_a/r_p = a·(1 + e) / (a·(1 − e)) = (1 + e)/(1 − e) = ${numero(1 + e)} / ${numero(1 - e)} = ${numero((1 + e) / (1 - e))}. El semieje y la masa se cancelan.`,
      );
      valor = orbita.vPeri / orbita.vApo;
      pasos.push(
        `Con la vis-viva del simulador: v_p = ${numero(orbita.vPeri / 1000, 3)} km/s y v_a = ${numero(orbita.vApo / 1000, 3)} km/s, cuyo cociente es ${numero(valor)}.`,
      );
      break;
    }

    case 'escapeDesdeCircular': {
      if (!positivo(datos.velocidadCircularKms)) return falta('la velocidad circular', pasos);
      pasos.push(
        'A la misma distancia r: v_c = √(G·M/r) y v_esc = √(2·G·M/r). Dividiendo, v_esc/v_c = √2: la masa y la distancia se cancelan.',
      );
      valor = Math.SQRT2 * datos.velocidadCircularKms;
      pasos.push(
        `v_esc = √2 × ${numero(datos.velocidadCircularKms)} = ${numero(Math.SQRT2, 5)} × ${numero(datos.velocidadCircularKms)} = ${numero(valor)} km/s.`,
      );
      break;
    }

    case 'excentricidad': {
      if (!positivo(datos.periastroKm) || !positivo(datos.apoastroKm)) return falta('las dos distancias extremas', pasos);
      const rp = datos.periastroKm;
      const ra = datos.apoastroKm;
      if (ra < rp) return falta('un apoastro mayor que el periastro', pasos);
      const aKm = (rp + ra) / 2;
      valor = (ra - rp) / (ra + rp);
      pasos.push(`Semieje mayor: la media de las dos distancias, a = (${numero(rp)} + ${numero(ra)}) / 2 = ${numero(aKm)} km.`);
      pasos.push(
        `Excentricidad: e = (r_apo − r_peri)/(r_apo + r_peri) = (${numero(ra)} − ${numero(rp)}) / (${numero(ra)} + ${numero(rp)}) = ${numero(ra - rp)} / ${numero(ra + rp)} = ${numero(valor)}.`,
      );
      // Comprobación con el motor: con esos a y e, calcularOrbita devuelve las distancias del
      // enunciado. La geometría no depende de la masa, así que sirve cualquier cuerpo.
      const cuerpo = cuerpoPorId(datos.cuerpoId ?? 'tierra');
      if (cuerpo) {
        const orbita = calcularOrbita(aKm, valor, cuerpo, 0);
        pasos.push(
          `Comprobación: con a = ${numero(aKm)} km y e = ${numero(valor)}, r_peri = a·(1 − e) = ${numero(orbita.rPeri / 1000, 1)} km y r_apo = a·(1 + e) = ${numero(orbita.rApo / 1000, 1)} km, las del enunciado.`,
        );
      }
      break;
    }

    case 'masaCentral': {
      if (!positivo(datos.semiejeKm)) return falta('el radio de la órbita', pasos);
      if (!positivo(datos.periodoDias)) return falta('el periodo', pasos);
      const a = datos.semiejeKm * 1000;
      const T = datos.periodoDias * DIA;
      pasos.push(`Al SI: a = ${numero(datos.semiejeKm)} km = ${cientifico(a, 5)} m y T = ${numero(datos.periodoDias)} días × 86.400 s = ${numero(T)} s.`);
      pasos.push('Se despeja la masa de la tercera ley, T = 2π·√(a³/(G·M)):  M = 4π²·a³ / (G·T²).');
      const numerador = 4 * Math.PI * Math.PI * a * a * a;
      const denominador = G * T * T;
      const M = numerador / denominador;
      pasos.push(
        `M = 4π² × ${cientifico(a * a * a)} / (${cientifico(G)} × ${cientifico(T * T)}) = ${cientifico(numerador)} / ${numero(denominador, 4)} = ${cientifico(M)} kg.`,
      );
      valor = M / 1e27;
      pasos.push(`En unidades de 10²⁷ kg: ${cientifico(M)} / 10²⁷ = ${numero(valor)}.`);
      break;
    }

    default:
      return { ok: false, valor: NaN, pasos, error: 'Magnitud desconocida.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  // El último paso muestra la cifra con los MISMOS decimales que pide el enunciado.
  const redondeado = redondear(valor, decimales);
  const exacto = Math.abs(valor - redondeado) < 1e-9;
  pasos.push(
    exacto
      ? `Resultado: ${textoRespuesta(redondeado, datos)}.`
      : `Redondeando ${textoRedondeo(decimales)}: ${textoRespuesta(redondeado, datos)}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Corrige la respuesta del alumno. Nunca lanza. */
export function comprobarRespuesta(usuario: number, esperado: number): Veredicto {
  const tolerancia = toleranciaDe(esperado);

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
   * siete órdenes de magnitud por debajo de la tolerancia más pequeña (0,01).
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

/* ─────────────────────────── Cargar en el simulador ─────────────────────────── */

/** Lo que «Cargar en el simulador» pone en los controles de la app. */
export interface ConfiguracionSimulador {
  cuerpoId: string;
  semiejeKm: number;
  excentricidad: number;
}

/**
 * La configuración del simulador que reproduce un caso EXACTO, o `null` si no cabe en sus
 * controles. Nunca lanza.
 *
 * Cabe cuando el cuerpo es uno de los cuatro, el semieje es un número entero de km ≥ 1 (el
 * campo va de 1 en 1) y la excentricidad está en la rejilla del deslizador (0 a 0,95 de 0,001
 * en 0,001) o coincide EXACTAMENTE, junto con el semieje, con una órbita real del cuerpo
 * (caso 10, Mercurio con e = 0,2056: ver la cabecera).
 *
 * Un semieje dado en UA se redondea al km entero (4 UA = 598.391.482,8 km → 598.391.483 km):
 * son 0,2 km en 6·10⁸, un cambio relativo de 3·10⁻¹⁰ que no mueve ninguna cifra del panel.
 */
export function configuracionSimulador(datos: DatosCaso): ConfiguracionSimulador | null {
  switch (datos.magnitud) {
    case 'periodo':
    case 'velocidadCircular':
    case 'apoastro':
    case 'periastro':
    case 'alturaPeriastro':
    case 'razonVelocidadesExtremos':
      break;
    default:
      return null;
  }

  const cuerpo = cuerpoPorId(datos.cuerpoId ?? '');
  if (!cuerpo) return null;

  let semiejeKm: number;
  if (positivo(datos.semiejeKm)) {
    semiejeKm = datos.semiejeKm;
  } else if (positivo(datos.semiejeUA)) {
    semiejeKm = Math.round((datos.semiejeUA * UA) / 1000);
  } else if (typeof datos.alturaKm === 'number' && Number.isFinite(datos.alturaKm) && datos.alturaKm >= 0) {
    semiejeKm = cuerpo.radio / 1000 + datos.alturaKm;
  } else {
    return null;
  }
  if (!Number.isInteger(semiejeKm) || semiejeKm < 1) return null;

  const excentricidad = datos.excentricidad ?? 0;
  if (!Number.isFinite(excentricidad)) return null;
  const milesimas = excentricidad * 1000;
  const enRejilla =
    excentricidad >= 0 && excentricidad <= 0.95 + 1e-12 && Math.abs(milesimas - Math.round(milesimas)) < 1e-9;
  const esPreset = (PRESETS[cuerpo.id] ?? []).some(
    (p) => p.semiejeKm === semiejeKm && p.excentricidad === excentricidad,
  );
  if (!enRejilla && !esPreset) return null;

  return { cuerpoId: cuerpo.id, semiejeKm, excentricidad };
}

/** «Tierra, a = 26.560 km, e = 0»: lo que se ha cargado, para anunciarlo y para que se vea. */
export function describirConfiguracion(c: ConfiguracionSimulador): string {
  const cuerpo = cuerpoPorId(c.cuerpoId);
  const nombre = cuerpo ? cuerpo.nombre : c.cuerpoId;
  return `${nombre}, a = ${formatNumber(c.semiejeKm, 0)} km, e = ${numero(c.excentricidad)}`;
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
  /** Dónde ve el alumno la cifra en «Resultados» tras cargar el caso. Solo si el panel la da. */
  comoComprobar?: string;
}

const CONST_G = 'G = 6,674·10⁻¹¹ N·m²/kg²';
const CONST_TIERRA = 'M_Tierra = 5,972·10²⁴ kg';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'La tercera ley como proporción',
    enunciado:
      'Dos satélites giran alrededor del mismo planeta. El semieje mayor de la órbita del satélite B es 4 veces el del satélite A, y A tarda 3 horas en dar una vuelta. ¿Cuánto tarda B en dar una vuelta?',
    categoria: 'abstracto',
    datos: { magnitud: 'periodoProporcion', periodoAHoras: 3, razonSemiejes: 4, decimales: 0 },
    etiquetaRespuesta: 'T_B en h',
    pista:
      'Tercera ley entre dos órbitas del mismo cuerpo: (T_B/T_A)² = (a_B/a_A)³. No hace falta G ni la masa del planeta. Si te sale 12, has supuesto que el periodo crece igual que el semieje.',
  },
  {
    id: 2,
    titulo: 'La tercera ley al revés',
    enunciado:
      'Dos satélites giran alrededor del mismo planeta. El periodo del satélite B es 8 veces el del satélite A. ¿Cuántas veces mayor es el semieje mayor de la órbita de B que el de la de A?',
    categoria: 'abstracto',
    datos: { magnitud: 'razonSemiejes', razonPeriodos: 8, decimales: 0 },
    etiquetaRespuesta: 'a_B / a_A (sin unidad)',
    pista:
      'Despeja la razón de semiejes: a_B/a_A = (T_B/T_A)^(2/3), la raíz cúbica de 8². Si te sale 2, has hecho solo la raíz cúbica de 8.',
  },
  {
    id: 3,
    titulo: 'Un satélite de navegación',
    enunciado: `Un satélite de navegación sigue una órbita circular alrededor de la Tierra de radio a = 26.560 km, medido desde el centro de la Tierra. Con ${CONST_G} y ${CONST_TIERRA}, ¿cuánto tarda en dar una vuelta? Da el resultado en horas, redondeado a dos decimales.`,
    categoria: 'aplicado',
    datos: { magnitud: 'periodo', cuerpoId: 'tierra', semiejeKm: 26560, excentricidad: 0, unidadTiempo: 'h' },
    etiquetaRespuesta: 'T en h',
    pista:
      'T = 2π·√(a³/(G·M)), con a en METROS (26.560 km = 2,656·10⁷ m). El resultado sale en segundos: divide entre 3.600 para pasarlo a horas.',
    comoComprobar:
      'mira «Periodo orbital (T)» en el bloque «Geometría y periodo» de Resultados: el simulador lo da en horas con dos decimales.',
  },
  {
    id: 4,
    titulo: 'Una estación espacial en órbita baja',
    enunciado: `Una estación espacial gira alrededor de la Tierra en una órbita circular a 420 km de ALTURA sobre la superficie. Con ${CONST_G}, ${CONST_TIERRA} y un radio terrestre de 6.371 km, ¿cuánto tarda en dar una vuelta? Da el resultado en minutos, redondeado a una décima.`,
    categoria: 'aplicado',
    datos: { magnitud: 'periodo', cuerpoId: 'tierra', alturaKm: 420, excentricidad: 0, unidadTiempo: 'min', decimales: 1 },
    etiquetaRespuesta: 'T en min',
    pista:
      'La distancia de la fórmula es al CENTRO de la Tierra: a = 6.371 + 420 km. Si te sale minuto y medio, has usado solo los 420 km de altura.',
    comoComprobar:
      'mira «Periodo orbital (T)» en Resultados: por debajo de dos horas el simulador lo da en minutos con un decimal.',
  },
  {
    id: 5,
    titulo: 'La velocidad de un satélite geoestacionario',
    enunciado: `Un satélite geoestacionario sigue una órbita circular de radio a = 42.164 km, medido desde el centro de la Tierra. Con ${CONST_G} y ${CONST_TIERRA}, ¿a qué velocidad se mueve? Da el resultado en km/s, redondeado a dos decimales.`,
    categoria: 'aplicado',
    datos: { magnitud: 'velocidadCircular', cuerpoId: 'tierra', semiejeKm: 42164, excentricidad: 0 },
    etiquetaRespuesta: 'v en km/s',
    pista: 'En órbita circular, v = √(G·M/a), con a en metros. Sale en m/s: divide entre 1.000 para pasar a km/s.',
    comoComprobar:
      'mira «Circular a r = a» en el bloque «Velocidades» de Resultados: el simulador da tres decimales, redondéalo a dos.',
  },
  {
    id: 6,
    titulo: 'De la velocidad circular a la de escape',
    enunciado:
      'A cierta distancia del centro de un planeta, un satélite en órbita circular se mueve a 7,5 km/s. ¿Cuál es la velocidad de escape a esa misma distancia? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'escapeDesdeCircular', velocidadCircularKms: 7.5 },
    etiquetaRespuesta: 'v_esc en km/s',
    pista:
      'Compara v_esc = √(2·G·M/r) con v_c = √(G·M/r): a la misma distancia, v_esc = √2·v_c. No necesitas la masa del planeta ni la distancia.',
  },
  {
    id: 7,
    titulo: 'La distancia del apogeo',
    enunciado:
      'Un satélite gira alrededor de la Tierra en una órbita elíptica de semieje mayor a = 20.000 km y excentricidad e = 0,25. ¿A qué distancia del centro de la Tierra está cuando pasa por el apogeo, el punto más lejano? Da el resultado en km.',
    categoria: 'abstracto',
    datos: { magnitud: 'apoastro', cuerpoId: 'tierra', semiejeKm: 20000, excentricidad: 0.25, decimales: 0 },
    etiquetaRespuesta: 'r_apo en km',
    pista:
      'El apogeo está a r = a·(1 + e) del centro, y el perigeo a a·(1 − e). No confundas el semieje mayor con la distancia máxima: es la media de las dos extremas.',
    comoComprobar: 'mira la fila «Apogeo» del bloque «Geometría y periodo» de Resultados.',
  },
  {
    id: 8,
    titulo: 'La excentricidad desde las distancias extremas',
    enunciado:
      'Una órbita elíptica alrededor de la Tierra tiene el perigeo a 7.000 km y el apogeo a 42.000 km, las dos distancias medidas desde el centro de la Tierra. ¿Cuál es su excentricidad? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'excentricidad', cuerpoId: 'tierra', periastroKm: 7000, apoastroKm: 42000 },
    etiquetaRespuesta: 'e (sin unidad)',
    pista:
      'e = (r_apo − r_peri)/(r_apo + r_peri). Tiene que salir un número entre 0 y 1: si no, revisa el orden de la resta.',
  },
  {
    id: 9,
    titulo: 'Una órbita muy excéntrica',
    enunciado:
      'Un satélite de comunicaciones para latitudes altas sigue una órbita muy excéntrica alrededor de la Tierra, con semieje mayor a = 26.600 km y excentricidad e = 0,74. El radio terrestre es 6.371 km. ¿A qué ALTURA sobre la superficie pasa por el perigeo? Da el resultado en km, redondeado a unidades.',
    categoria: 'aplicado',
    datos: { magnitud: 'alturaPeriastro', cuerpoId: 'tierra', semiejeKm: 26600, excentricidad: 0.74, decimales: 0 },
    etiquetaRespuesta: 'altura en km',
    pista:
      'Primero el perigeo, r = a·(1 − e), que es la distancia al CENTRO de la Tierra. La altura es esa distancia menos el radio terrestre.',
    comoComprobar:
      'la fila «Perigeo» de Resultados da la distancia al CENTRO de la Tierra; réstale los 6.371 km del radio para obtener la altura.',
  },
  {
    id: 10,
    titulo: 'Más rápido cerca del Sol',
    enunciado:
      'Mercurio describe alrededor del Sol una elipse de excentricidad e = 0,2056. ¿Cuántas veces más rápido se mueve en el perihelio (el punto más cercano al Sol) que en el afelio (el más lejano)? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'razonVelocidadesExtremos', cuerpoId: 'sol', semiejeKm: 57_909_000, excentricidad: 0.2056 },
    etiquetaRespuesta: 'v_p / v_a (sin unidad)',
    pista:
      'Segunda ley (conservación del momento angular): r_p·v_p = r_a·v_a. Como r_a/r_p = (1 + e)/(1 − e), ese es también el cociente de velocidades. No necesitas ni el semieje ni la masa del Sol.',
    comoComprobar:
      'mira la nota bajo el bloque «Velocidades»: «v_p/v_a = (1+e)/(1−e)», con tres decimales. También puedes dividir la velocidad en el perihelio entre la del afelio.',
  },
  {
    id: 11,
    titulo: 'El periodo de un asteroide',
    enunciado: `Un asteroide gira alrededor del Sol con un semieje mayor de 4 UA. Con ${CONST_G}, M_Sol = 1,989·10³⁰ kg, 1 UA = 149.597.870,7 km y 1 año = 365,25 días, ¿cuál es su periodo? Da el resultado en años, redondeado a dos decimales.`,
    categoria: 'aplicado',
    datos: { magnitud: 'periodo', cuerpoId: 'sol', semiejeUA: 4, excentricidad: 0, unidadTiempo: 'años' },
    etiquetaRespuesta: 'T en años',
    pista:
      'Con la Tierra como patrón (a = 1 UA, T = 1 año), la tercera ley queda T² = a³ en años y UA. También puedes usar T = 2π·√(a³/(G·M)) con a en metros y dividir entre los segundos de un año.',
    comoComprobar:
      'mira «Periodo orbital (T)» en Resultados, que el simulador da en años con dos decimales; «Semieje mayor en UA» debe marcar 4,000.',
  },
  {
    id: 12,
    titulo: 'Pesar un planeta con su luna',
    enunciado: `Una luna da una vuelta a su planeta cada 1,77 días en una órbita casi circular de 421.800 km de radio, medido desde el centro del planeta. Con ${CONST_G} y 1 día = 86.400 s, ¿cuál es la masa del planeta? Da el resultado en unidades de 10²⁷ kg, redondeado a dos decimales.`,
    categoria: 'aplicado',
    datos: { magnitud: 'masaCentral', semiejeKm: 421_800, periodoDias: 1.77 },
    etiquetaRespuesta: 'M en 10²⁷ kg',
    pista:
      'Despeja la masa de la tercera ley: M = 4π²·a³/(G·T²), con a en metros y T en segundos. Después divide entre 10²⁷.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.datos),
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
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

/** Alturas de 300 a 1.500 km: el periodo queda por debajo de 2 h y el panel lo da en minutos. */
const ALTURAS = [300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500] as const;
const RAZONES_SEMIEJE = [4, 9, 16, 25] as const;
const PERIODOS_A = [1, 2, 3, 5] as const;
/** Semiejes desde 15.000 km: con e ≤ 0,5 el perigeo queda siempre fuera de la Tierra. */
const SEMIEJES_ELIPSE = [15000, 20000, 25000, 30000, 40000] as const;
const EXCENTRICIDADES = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5] as const;
const SEMIEJES_CIRCULARES = [7000, 8000, 10000, 15000, 20000, 30000, 42164] as const;
const PREGUNTAS = ['periodoAltura', 'proporcion', 'extremo', 'velocidadCircular'] as const;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/**
 * Ejercicio aleatorio. Usa EL MISMO `resolverCaso` que los doce fijos, y por tanto el mismo
 * motor que el panel: si divergieran, el alumno entrenaría con una regla y sería corregido con
 * otra. Salvo la proporción, todos caben en los controles y se pueden cargar en el simulador.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  const altura = elegir(ALTURAS, rnd);
  const razon = elegir(RAZONES_SEMIEJE, rnd);
  const periodoA = elegir(PERIODOS_A, rnd);
  const semiejeElipse = elegir(SEMIEJES_ELIPSE, rnd);
  const e = elegir(EXCENTRICIDADES, rnd);
  const semiejeCircular = elegir(SEMIEJES_CIRCULARES, rnd);
  const pideApogeo = rnd() < 0.5;

  let datos: DatosCaso;
  let enunciado: string;
  let etiqueta: string;

  if (pregunta === 'periodoAltura') {
    datos = { magnitud: 'periodo', cuerpoId: 'tierra', alturaKm: altura, excentricidad: 0, unidadTiempo: 'min', decimales: 1 };
    enunciado = `Un satélite gira alrededor de la Tierra en una órbita circular a ${numero(altura)} km de ALTURA sobre la superficie. Con ${CONST_G}, ${CONST_TIERRA} y un radio terrestre de 6.371 km, ¿cuánto tarda en dar una vuelta? Da el resultado en minutos, redondeado a una décima.`;
    etiqueta = 'T en min';
  } else if (pregunta === 'proporcion') {
    datos = { magnitud: 'periodoProporcion', periodoAHoras: periodoA, razonSemiejes: razon, decimales: 0 };
    enunciado = `Dos satélites giran alrededor del mismo planeta. El semieje mayor de la órbita de B es ${numero(razon)} veces el de A, y A tarda ${numero(periodoA)} ${periodoA === 1 ? 'hora' : 'horas'} en dar una vuelta. ¿Cuánto tarda B?`;
    etiqueta = 'T_B en h';
  } else if (pregunta === 'extremo') {
    datos = {
      magnitud: pideApogeo ? 'apoastro' : 'periastro',
      cuerpoId: 'tierra',
      semiejeKm: semiejeElipse,
      excentricidad: e,
      decimales: 0,
    };
    enunciado = `Un satélite gira alrededor de la Tierra en una órbita elíptica de semieje mayor a = ${numero(semiejeElipse)} km y excentricidad e = ${numero(e)}. ¿A qué distancia del centro de la Tierra está en el ${pideApogeo ? 'apogeo, el punto más lejano' : 'perigeo, el punto más cercano'}? Da el resultado en km.`;
    etiqueta = pideApogeo ? 'r_apo en km' : 'r_peri en km';
  } else {
    datos = { magnitud: 'velocidadCircular', cuerpoId: 'tierra', semiejeKm: semiejeCircular, excentricidad: 0 };
    enunciado = `Un satélite sigue una órbita circular alrededor de la Tierra de radio a = ${numero(semiejeCircular)} km, medido desde el centro de la Tierra. Con ${CONST_G} y ${CONST_TIERRA}, ¿a qué velocidad se mueve? Da el resultado en km/s, redondeado a dos decimales.`;
    etiqueta = 'v en km/s';
  }

  const r = resolverCaso(datos);
  return {
    enunciado,
    datos,
    respuesta: r.ok ? redondear(r.valor, datos.decimales ?? 2) : NaN,
    etiquetaRespuesta: etiqueta,
    pasos: r.pasos,
  };
}
