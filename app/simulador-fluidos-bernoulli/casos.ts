/**
 * Casos para clase — la tarea asignable de `simulador-fluidos-bernoulli`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada de continuidad ni de Bernoulli se replica aquí: se importa de `./motor.ts`, que es lo
 * que pinta la tabla de secciones del simulador. Los casos de presión montan la tubería con el
 * MISMO `getSecciones` y la resuelven con el MISMO `calcularSecciones`, así que la corrección y
 * la tabla no pueden divergir — si divergieran, la app suspendería una respuesta que ella misma
 * imprime, que es el peor fallo posible en algo que corrige a un alumno.
 *
 *     Continuidad:  Q = A·v,  A = π·(D/2)²           →  A₁·v₁ = A₂·v₂
 *     Bernoulli:    P + ½·ρ·v² + ρ·g·h = constante  →  P₂ = P₁ + ½·ρ·(v₁² − v₂²) + ρ·g·(h₁ − h₂)
 *     Caudal másico: ṁ = ρ·Q
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **Presión ABSOLUTA, no manométrica.** La app trabaja en absoluta: la entrada arranca en
 *    1 atm = 101.325 Pa y su aviso de cavitación habla de «presión absoluta negativa». Es el
 *    convenio que más confunde en este tema, así que:
 *      · los casos que piden una PRESIÓN (5 y 9) dicen «absoluta» en el enunciado y en la
 *        etiqueta, y dan la presión de entrada también como absoluta;
 *      · los que piden una DIFERENCIA (4, 6, 8 y 11) la piden como P₂ − P₁ (o P₃ − P₁), con el
 *        mismo signo que la tarjeta grande del simulador; una diferencia vale lo mismo en
 *        absoluta que en manométrica, porque la atmósfera se cancela.
 *
 * ⚠️ **g = 9,81 m/s²**, el valor de la app (no 9,8 ni 10). Solo influye donde hay desnivel, y
 *    solo esos casos (8 y 9) lo declaran: se comprobó EJECUTANDO con g = 10 que en los otros
 *    diez la respuesta no cambia, porque en un tubo horizontal el término ρ·g·(h₁ − h₂) vale 0.
 *
 * ⚠️ **Unidades como las muestra la app.** Caudal en L/s (1 L/s = 0,001 m³/s), diámetros en cm,
 *    densidades las de su tabla de fluidos (agua 1000, aceite 920, sangre 1060, aire 1,225 kg/m³)
 *    y presiones como las imprime `fmtPresion`: en Pa sin decimales por debajo de 10.000 Pa y en
 *    kPa con dos decimales por encima. Así el alumno puede cargar el caso y comparar.
 *
 * ⚠️ **Por qué los casos de presión ABSOLUTA tienen caídas grandes.** La tolerancia es el 1 %
 *    del valor, y el 1 % de 101 kPa es 1 kPa: en el Venturi de fábrica (caída de 0,49 kPa) quien
 *    no aplicara Bernoulli en absoluto acertaría. Por eso el caso 5 usa D₂/D₁ = 0,4 y 10 L/s
 *    (caída de 30,85 kPa) y el 9, 5 m de desnivel (45,13 kPa): ahí olvidar el término de v₁², el
 *    ½, la densidad correcta o usar g = 10 da una respuesta FUERA de la tolerancia.
 *
 * ⚠️ **Ningún dato da presión absoluta negativa ni cavitación.** La mínima de los doce es la
 *    del caso 9 (56,20 kPa), muy por encima de la presión de vapor del agua (2,3 kPa).
 */

import { formatNumber } from '@/lib';
import {
  DIAMETRO_NOMINAL,
  G,
  P_ATMOSFERICA,
  areaCircular,
  calcularSecciones,
  caudalMasico,
  fluidoPorId,
  getSecciones,
  litrosPorSegundoAM3s,
  velocidadMedia,
  type FluidoId,
  type GeomId,
  type SeccionCalculada,
} from './motor';

export { G, P_ATMOSFERICA } from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** v = Q/A en un tubo de diámetro dado. */
  | 'velocidad'
  /** v₂ a partir de v₁ y de los dos diámetros (continuidad). */
  | 'velocidadContinuidad'
  /** El diámetro que hace falta para pasar de v₁ a v₂ (continuidad al revés). */
  | 'diametroContinuidad'
  /** La velocidad en una sección de la tubería del simulador. */
  | 'velocidadSeccion'
  /** P_sección − P₁ en la tubería del simulador (el signo de su tarjeta grande). */
  | 'diferenciaPresion'
  /** La presión ABSOLUTA en una sección de la tubería del simulador. */
  | 'presionAbsoluta'
  /** v₂/v₁ entre el estrechamiento y la entrada. */
  | 'razonVelocidades'
  /** ṁ = ρ·Q. */
  | 'caudalMasico'
  /** El caudal que marca un medidor Venturi a partir de su caída de presión. */
  | 'caudalVenturi';

export type UnidadPresion = 'Pa' | 'kPa';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Geometría del simulador. Solo en las magnitudes que montan su tubería. */
  geometria?: GeomId;
  /** Fluido de la tabla de la app. Por defecto, agua. */
  fluido?: FluidoId;
  /** Caudal volumétrico, en L/s (como el deslizador de la app). */
  caudalLs?: number;
  /** D₂/D₁ del estrechamiento (Venturi y estenosis). */
  ratio?: number;
  /** Desnivel entre la sección inferior y la superior, en metros. */
  desnivel?: number;
  /** Presión ABSOLUTA en la sección 1, en Pa. Por defecto 1 atm (101.325 Pa). */
  presionEntrada?: number;
  /** Sección por la que se pregunta en la tubería del simulador (1-3). Por defecto la 2. */
  seccion?: 2 | 3;
  /** Diámetro de la parte ancha (o del único tubo), en cm. */
  diametro1Cm?: number;
  /** Diámetro de la parte estrecha, en cm. */
  diametro2Cm?: number;
  /** Velocidad en la parte ancha, en m/s. */
  velocidad1?: number;
  /** Velocidad que se quiere en la parte estrecha, en m/s. */
  velocidad2?: number;
  /** Caída de presión P₁ − P₂ medida por un manómetro diferencial, en Pa (positiva). */
  caidaPresion?: number;
  /** Unidad en que se pide una presión. Por defecto Pa. */
  unidadPresion?: UnidadPresion;
  /** Gravedad, en m/s². Por defecto la de la app (9,81). */
  g?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (m/s, cm, Pa o kPa, kg/s, L/s o sin unidad). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «0,2546», «29.430». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
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

/** Falta un dato obligatorio: se responde con un error legible, nunca con una excepción. */
function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/** Unidad en la que sale el resultado de cada magnitud. */
export function unidadDeMagnitud(datos: DatosCaso): string {
  switch (datos.magnitud) {
    case 'velocidad':
    case 'velocidadContinuidad':
    case 'velocidadSeccion':
      return 'm/s';
    case 'diametroContinuidad':
      return 'cm';
    case 'diferenciaPresion':
    case 'presionAbsoluta':
      return datos.unidadPresion ?? 'Pa';
    case 'razonVelocidades':
      return '';
    case 'caudalMasico':
      return 'kg/s';
    case 'caudalVenturi':
      return 'L/s';
    default:
      return '';
  }
}

/** «0,25 m/s», «6,25» (sin unidad), «−486 Pa». Con los decimales que pide el caso. */
export function textoConUnidad(valor: number, datos: DatosCaso): string {
  if (!Number.isFinite(valor)) return '—';
  const unidad = unidadDeMagnitud(datos);
  const cifra = formatNumber(valor, datos.decimales ?? 2);
  return unidad ? `${cifra} ${unidad}` : cifra;
}

/**
 * Monta la tubería del simulador para los datos dados y la resuelve con el motor de la app.
 * Devuelve las secciones calculadas o un error; nunca lanza.
 */
function tuberiaDelSimulador(
  datos: DatosCaso,
  pasos: string[],
): { ok: true; secciones: SeccionCalculada[]; rho: number; nombreFluido: string } | Resolucion {
  const geometria = datos.geometria;
  if (!geometria) return falta('la geometría', pasos);
  if (!positivo(datos.caudalLs)) return falta('el caudal', pasos);
  const g = datos.g ?? G;
  if (!positivo(g)) return falta('la gravedad', pasos);
  const P1 = datos.presionEntrada ?? P_ATMOSFERICA;
  if (!Number.isFinite(P1)) return falta('la presión de entrada', pasos);

  let ratio = 1;
  let desnivel = 0;
  if (geometria === 'desnivel') {
    if (typeof datos.desnivel !== 'number' || !Number.isFinite(datos.desnivel) || datos.desnivel < 0) {
      return falta('el desnivel', pasos);
    }
    desnivel = datos.desnivel;
  } else {
    if (!positivo(datos.ratio) || (datos.ratio as number) > 1) return falta('la razón D₂/D₁', pasos);
    ratio = datos.ratio as number;
  }

  const fluido = fluidoPorId(datos.fluido ?? 'agua');
  const secciones = calcularSecciones(
    getSecciones(geometria, ratio, desnivel),
    litrosPorSegundoAM3s(datos.caudalLs),
    fluido.rho,
    P1,
    g,
  );
  return { ok: true, secciones, rho: fluido.rho, nombreFluido: fluido.nombre.toLowerCase() };
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
    case 'velocidad': {
      if (!positivo(datos.caudalLs)) return falta('el caudal', pasos);
      if (!positivo(datos.diametro1Cm)) return falta('el diámetro', pasos);
      const Q = litrosPorSegundoAM3s(datos.caudalLs);
      const D = datos.diametro1Cm / 100;
      const A = areaCircular(D);
      pasos.push(`Caudal en el SI: Q = ${numero(datos.caudalLs)} L/s = ${numero(Q, 5)} m³/s.`);
      pasos.push(
        `Área de la sección: A = π·(D/2)² = π·(${numero(D)}/2)² = ${numero(A, 6)} m² (el diámetro, en metros).`,
      );
      valor = velocidadMedia(Q, A);
      pasos.push(`Velocidad media: v = Q/A = ${numero(Q, 5)}/${numero(A, 6)} = ${numero(valor)} m/s.`);
      break;
    }

    case 'velocidadContinuidad': {
      if (!positivo(datos.diametro1Cm) || !positivo(datos.diametro2Cm)) return falta('los dos diámetros', pasos);
      if (!positivo(datos.velocidad1)) return falta('la velocidad en la parte ancha', pasos);
      const A1 = areaCircular(datos.diametro1Cm / 100);
      const A2 = areaCircular(datos.diametro2Cm / 100);
      pasos.push('Continuidad: el caudal es el mismo en todo el tubo, así que A₁·v₁ = A₂·v₂.');
      pasos.push(
        `A₁/A₂ = (D₁/D₂)² = (${numero(datos.diametro1Cm)}/${numero(datos.diametro2Cm)})² = ${numero(A1 / A2)}: el área va con el CUADRADO del diámetro.`,
      );
      valor = velocidadMedia(A1 * datos.velocidad1, A2);
      pasos.push(`v₂ = v₁·A₁/A₂ = ${numero(datos.velocidad1)}·${numero(A1 / A2)} = ${numero(valor)} m/s.`);
      break;
    }

    case 'diametroContinuidad': {
      if (!positivo(datos.diametro1Cm)) return falta('el diámetro de partida', pasos);
      if (!positivo(datos.velocidad1) || !positivo(datos.velocidad2)) return falta('las dos velocidades', pasos);
      const A1 = areaCircular(datos.diametro1Cm / 100);
      pasos.push('Continuidad: A₁·v₁ = A₂·v₂, así que A₂ = A₁·v₁/v₂.');
      const A2 = (A1 * datos.velocidad1) / datos.velocidad2;
      pasos.push(
        `A₁ = π·(${numero(datos.diametro1Cm / 100)}/2)² = ${numero(A1, 7)} m² → A₂ = ${numero(A1, 7)}·${numero(datos.velocidad1)}/${numero(datos.velocidad2)} = ${numero(A2, 7)} m².`,
      );
      // De A = π·(D/2)² se despeja D = 2·√(A/π).
      const D2 = 2 * Math.sqrt(A2 / Math.PI);
      pasos.push(`De A = π·(D/2)² se despeja D₂ = 2·√(A₂/π) = ${numero(D2, 5)} m.`);
      valor = D2 * 100;
      pasos.push(
        `En centímetros, D₂ = ${numero(valor)} cm. Atajo: D₂ = D₁·√(v₁/v₂) = ${numero(datos.diametro1Cm)}·√(${numero(datos.velocidad1)}/${numero(datos.velocidad2)}).`,
      );
      break;
    }

    case 'velocidadSeccion':
    case 'diferenciaPresion':
    case 'presionAbsoluta':
    case 'razonVelocidades': {
      const t = tuberiaDelSimulador(datos, pasos);
      if (!('secciones' in t)) return t;
      const g = datos.g ?? G;
      const idx = (datos.seccion ?? 2) - 1;
      const s1 = t.secciones[0];
      const si = t.secciones[idx];
      if (!s1 || !si) return falta('la sección', pasos);
      const Q = litrosPorSegundoAM3s(datos.caudalLs as number);
      const sub = idx + 1 === 2 ? '₂' : '₃';

      pasos.push(`Caudal en el SI: Q = ${numero(datos.caudalLs as number)} L/s = ${numero(Q, 5)} m³/s.`);
      pasos.push(
        `${s1.nombre} (sección 1): D₁ = ${numero(s1.ancho * 100)} cm → A₁ = π·(D₁/2)² = ${numero(s1.A, 6)} m² → v₁ = Q/A₁ = ${numero(s1.v)} m/s.`,
      );
      if (Math.abs(si.ancho - s1.ancho) < 1e-12) {
        pasos.push(
          `${si.nombre} (sección ${idx + 1}): el diámetro es el mismo, así que por continuidad v${sub} = v₁ = ${numero(si.v)} m/s.`,
        );
      } else {
        pasos.push(
          `${si.nombre} (sección ${idx + 1}): D${sub} = ${numero(si.ancho * 100)} cm → A${sub} = ${numero(si.A, 6)} m² → v${sub} = Q/A${sub} = ${numero(si.v)} m/s.`,
        );
      }

      if (datos.magnitud === 'velocidadSeccion') {
        valor = si.v;
        break;
      }
      if (datos.magnitud === 'razonVelocidades') {
        valor = si.v / s1.v;
        pasos.push(
          `v${sub}/v₁ = A₁/A${sub} = (D₁/D${sub})² = ${numero(valor)}. El caudal se cancela: la razón solo depende de la geometría.`,
        );
        break;
      }

      // Bernoulli entre la sección 1 y la pedida, con los dos términos por separado.
      const termCinetico = 0.5 * t.rho * (s1.v * s1.v - si.v * si.v);
      const termAltura = t.rho * g * (s1.altura - si.altura);
      pasos.push(
        `Bernoulli: P${sub} − P₁ = ½·ρ·(v₁² − v${sub}²) + ρ·g·(h₁ − h${sub}), con ρ = ${numero(t.rho)} kg/m³ (${t.nombreFluido}).`,
      );
      pasos.push(
        `Término de velocidad: ½·${numero(t.rho)}·(${numero(s1.v)}² − ${numero(si.v)}²) = ${numero(termCinetico, 2)} Pa.`,
      );
      if (s1.altura === si.altura) {
        pasos.push('Término de altura: el tubo es horizontal (h₁ = h₂), así que ρ·g·Δh vale 0.');
      } else {
        pasos.push(
          `Término de altura: ${numero(t.rho)}·${numero(g)}·(${numero(s1.altura)} − ${numero(si.altura)}) = ${numero(termAltura, 2)} Pa.`,
        );
      }
      const diferencia = si.P - s1.P;
      pasos.push(`P${sub} − P₁ = ${numero(diferencia, 2)} Pa.`);

      const enKPa = (datos.unidadPresion ?? 'Pa') === 'kPa';
      if (datos.magnitud === 'diferenciaPresion') {
        valor = enKPa ? diferencia / 1000 : diferencia;
        if (enKPa) pasos.push(`En kilopascales: ${numero(diferencia, 2)} Pa = ${numero(valor)} kPa.`);
        pasos.push(
          diferencia < 0
            ? 'El signo negativo dice que la presión CAE: la energía se ha ido a velocidad o a altura.'
            : 'El signo positivo dice que la presión sube.',
        );
        break;
      }

      // presionAbsoluta
      pasos.push(
        `Presión absoluta: P${sub} = P₁ + (P${sub} − P₁) = ${numero(s1.P, 2)} + (${numero(diferencia, 2)}) = ${numero(si.P, 2)} Pa. La atmósfera ya va dentro de P₁: no se suma otra vez.`,
      );
      valor = enKPa ? si.P / 1000 : si.P;
      if (enKPa) pasos.push(`En kilopascales: ${numero(si.P, 2)} Pa = ${numero(valor)} kPa.`);
      if (si.P < 0) {
        return { ok: false, valor: NaN, pasos, error: 'Sale una presión absoluta negativa: el modelo ideal no vale.' };
      }
      break;
    }

    case 'caudalMasico': {
      if (!positivo(datos.caudalLs)) return falta('el caudal', pasos);
      const fluido = fluidoPorId(datos.fluido ?? 'agua');
      const Q = litrosPorSegundoAM3s(datos.caudalLs);
      pasos.push(`Caudal en el SI: Q = ${numero(datos.caudalLs)} L/s = ${numero(Q, 5)} m³/s.`);
      valor = caudalMasico(Q, fluido.rho);
      pasos.push(
        `Caudal másico: ṁ = ρ·Q = ${numero(fluido.rho)}·${numero(Q, 5)} = ${numero(valor)} kg/s (${fluido.nombre.toLowerCase()}).`,
      );
      break;
    }

    case 'caudalVenturi': {
      if (!positivo(datos.diametro1Cm) || !positivo(datos.diametro2Cm)) return falta('los dos diámetros', pasos);
      if (!positivo(datos.caidaPresion)) return falta('la caída de presión', pasos);
      if (datos.diametro2Cm >= datos.diametro1Cm) return falta('un estrechamiento (D₂ < D₁)', pasos);
      const fluido = fluidoPorId(datos.fluido ?? 'agua');
      const A1 = areaCircular(datos.diametro1Cm / 100);
      const A2 = areaCircular(datos.diametro2Cm / 100);
      const k = A1 / A2;
      pasos.push(`Continuidad: v₂ = v₁·A₁/A₂ = v₁·(D₁/D₂)² = ${numero(k)}·v₁.`);
      pasos.push(
        `Bernoulli en horizontal: P₁ − P₂ = ½·ρ·(v₂² − v₁²) = ½·ρ·v₁²·(${numero(k)}² − 1) = ½·ρ·v₁²·${numero(k * k - 1)}.`,
      );
      const v1 = Math.sqrt((2 * datos.caidaPresion) / (fluido.rho * (k * k - 1)));
      pasos.push(
        `Se despeja v₁ = √(2·ΔP/(ρ·${numero(k * k - 1)})) = √(2·${numero(datos.caidaPresion)}/(${numero(fluido.rho)}·${numero(k * k - 1)})) = ${numero(v1)} m/s.`,
      );
      const Q = A1 * v1;
      valor = Q * 1000;
      pasos.push(`Q = A₁·v₁ = ${numero(A1, 6)}·${numero(v1)} = ${numero(Q, 6)} m³/s = ${numero(valor)} L/s.`);
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
      ? `Resultado: ${textoConUnidad(redondeado, datos)}.`
      : `Redondeando ${textoRedondeo(decimales)}: ${textoConUnidad(redondeado, datos)}.`,
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
      motivo: 'Escribe un número (puedes usar la coma decimal y el signo menos).',
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

  // Un fallo de signo en una diferencia de presión merece su propio aviso: es EL error del tema.
  if (esperado !== 0 && Math.abs(usuario + esperado) <= tolerancia + RUIDO_BINARIO) {
    return {
      correcto: false,
      motivo: 'El valor es correcto pero el signo no: ¿la presión sube o baja entre esas dos secciones?',
      diferencia,
      tolerancia,
    };
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
  geometria: GeomId;
  fluido: FluidoId;
  caudalLs: number;
  ratio?: number;
  desnivel?: number;
  presionEntrada: number;
}

/**
 * Rejilla de los deslizadores de `page.tsx`. Es un ESPEJO de sus atributos min/max/step:
 * si un caso cae fuera, el navegador lo sanearía a otro valor y el simulador mostraría una
 * tubería distinta de la del enunciado, así que el botón no se ofrece.
 */
const REJILLA = {
  caudal: { min: 0.1, max: 10, paso: 0.1 },
  ratio: { min: 0.25, max: 1, paso: 0.05 },
  desnivel: { min: 0, max: 10, paso: 0.5 },
  presion: { min: P_ATMOSFERICA - 51 * 1000, max: P_ATMOSFERICA + 198 * 1000, paso: 1000 },
} as const;

function enRejilla(valor: number, r: { min: number; max: number; paso: number }): boolean {
  if (!Number.isFinite(valor) || valor < r.min - 1e-9 || valor > r.max + 1e-9) return false;
  const pasos = (valor - r.min) / r.paso;
  return Math.abs(pasos - Math.round(pasos)) < 1e-6;
}

/**
 * La configuración del simulador que reproduce un caso, o `null` si el caso no cabe en sus
 * controles (otro diámetro de entrada, un caudal fuera de rejilla…). Nunca lanza.
 */
export function configuracionSimulador(datos: DatosCaso): ConfiguracionSimulador | null {
  let c: ConfiguracionSimulador | null = null;
  const caudalLs = datos.caudalLs ?? NaN;
  const presionEntrada = datos.presionEntrada ?? P_ATMOSFERICA;

  switch (datos.magnitud) {
    case 'velocidadSeccion':
    case 'diferenciaPresion':
    case 'presionAbsoluta':
    case 'razonVelocidades':
      if (!datos.geometria) return null;
      c =
        datos.geometria === 'desnivel'
          ? { geometria: 'desnivel', fluido: datos.fluido ?? 'agua', caudalLs, desnivel: datos.desnivel ?? NaN, presionEntrada }
          : { geometria: datos.geometria, fluido: datos.fluido ?? 'agua', caudalLs, ratio: datos.ratio ?? NaN, presionEntrada };
      break;
    case 'velocidad':
      // Solo si el tubo es el de la app (10 cm): su sección de entrada lo muestra.
      if (Math.abs((datos.diametro1Cm ?? NaN) - DIAMETRO_NOMINAL * 100) > 1e-9) return null;
      c = { geometria: 'venturi', fluido: 'agua', caudalLs, ratio: 0.5, presionEntrada };
      break;
    case 'caudalMasico':
      c = { geometria: 'venturi', fluido: datos.fluido ?? 'agua', caudalLs, ratio: 0.5, presionEntrada };
      break;
    default:
      return null;
  }

  if (!c) return null;
  // La app calcula siempre con g = 9,81: un caso con otra gravedad no se reproduce en ella.
  if (datos.g !== undefined && datos.g !== G) return null;
  if (!enRejilla(c.caudalLs, REJILLA.caudal)) return null;
  if (!enRejilla(c.presionEntrada, REJILLA.presion)) return null;
  if (c.ratio !== undefined && !enRejilla(c.ratio, REJILLA.ratio)) return null;
  if (c.desnivel !== undefined && !enRejilla(c.desnivel, REJILLA.desnivel)) return null;
  return c;
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
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'Velocidad a partir del caudal',
    enunciado:
      'Por una tubería de 10 cm de diámetro circula agua con un caudal de 2 L/s. ¿Cuál es la velocidad media del agua? Recuerda que 1 L/s = 0,001 m³/s. Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'velocidad', caudalLs: 2, diametro1Cm: 10 },
    etiquetaRespuesta: 'v en m/s',
    pista: 'Primero el área de la sección, A = π·(D/2)², con el diámetro en METROS. Después v = Q/A, con Q en m³/s.',
  },
  {
    id: 2,
    titulo: 'Continuidad en un estrechamiento',
    enunciado:
      'Un tubo pasa de 10 cm a 5 cm de diámetro. En la parte ancha el líquido avanza a 1,5 m/s. ¿A qué velocidad avanza en la parte estrecha?',
    categoria: 'abstracto',
    datos: { magnitud: 'velocidadContinuidad', diametro1Cm: 10, diametro2Cm: 5, velocidad1: 1.5, decimales: 0 },
    etiquetaRespuesta: 'v₂ en m/s',
    pista: 'A₁·v₁ = A₂·v₂. Y ojo: el área va con el CUADRADO del diámetro, así que la mitad de diámetro no es la mitad de área. Si te sale 3, has olvidado el cuadrado.',
  },
  {
    id: 3,
    titulo: 'La boquilla de una manguera',
    enunciado:
      'El agua sale de una manguera de 2 cm de diámetro a 1,5 m/s. Se le quiere poner una boquilla para que salga a 6 m/s con el mismo caudal. ¿Qué diámetro debe tener la boquilla?',
    categoria: 'aplicado',
    datos: { magnitud: 'diametroContinuidad', diametro1Cm: 2, velocidad1: 1.5, velocidad2: 6, decimales: 0 },
    etiquetaRespuesta: 'D₂ en cm',
    pista: 'Si la velocidad se multiplica por 4, el área tiene que dividirse entre 4. ¿Por cuánto se divide entonces el diámetro?',
  },
  {
    id: 4,
    titulo: 'La caída de presión en un Venturi',
    enunciado:
      'Un tubo de Venturi horizontal tiene 10 cm de diámetro en la entrada y 5 cm en la garganta (D₂/D₁ = 0,5). Circula agua (ρ = 1000 kg/m³) con un caudal de 2 L/s. ¿Cuánto vale la diferencia de presión P₂ − P₁ entre la garganta y la entrada? Trabaja sin redondear los pasos intermedios y da el resultado en Pa, redondeado a unidades.',
    categoria: 'abstracto',
    datos: { magnitud: 'diferenciaPresion', geometria: 'venturi', fluido: 'agua', caudalLs: 2, ratio: 0.5, decimales: 0 },
    etiquetaRespuesta: 'P₂ − P₁ en Pa',
    pista: 'Calcula v₁ y v₂ por continuidad y aplica P₂ − P₁ = ½·ρ·(v₁² − v₂²). Si la velocidad sube, la presión baja: fíjate en el signo.',
  },
  {
    id: 5,
    titulo: 'Presión absoluta en la garganta',
    enunciado:
      'Un Venturi horizontal por el que circula agua (ρ = 1000 kg/m³) pasa de 10 cm de diámetro en la entrada a 4 cm en la garganta (D₂/D₁ = 0,4), con un caudal de 10 L/s. La presión ABSOLUTA en la entrada es 101.325 Pa (1 atm). ¿Cuál es la presión absoluta en la garganta? Trabaja sin redondear los pasos intermedios y da el resultado en kPa con dos decimales.',
    categoria: 'abstracto',
    datos: {
      magnitud: 'presionAbsoluta',
      geometria: 'venturi',
      fluido: 'agua',
      caudalLs: 10,
      ratio: 0.4,
      presionEntrada: P_ATMOSFERICA,
      unidadPresion: 'kPa',
    },
    etiquetaRespuesta: 'P₂ absoluta en kPa',
    pista: 'P₂ = P₁ + ½·ρ·(v₁² − v₂²). La presión de entrada ya es absoluta (ya incluye la atmósfera): no la sumes otra vez. Y no olvides el v₁², que aquí sí se nota.',
  },
  {
    id: 6,
    titulo: 'El mismo Venturi con aire',
    enunciado:
      'Por el Venturi del caso 5 (horizontal, de 10 cm a 4 cm de diámetro, 10 L/s) circula ahora aire (ρ = 1,225 kg/m³) en lugar de agua. ¿Cuánto vale la diferencia de presión P₂ − P₁ entre la garganta y la entrada? Da el resultado en Pa, redondeado a unidades.',
    categoria: 'abstracto',
    datos: { magnitud: 'diferenciaPresion', geometria: 'venturi', fluido: 'aire', caudalLs: 10, ratio: 0.4, decimales: 0 },
    etiquetaRespuesta: 'P₂ − P₁ en Pa',
    pista: 'Las velocidades son las mismas que con agua: solo dependen del caudal y de los diámetros. Lo único que cambia es ρ, y la caída de presión es proporcional a ella.',
  },
  {
    id: 7,
    titulo: 'Cuántos kilos pasan cada segundo',
    enunciado:
      'Una bomba mueve aceite (ρ = 920 kg/m³) por una tubería con un caudal de 2,5 L/s. ¿Cuántos kilogramos de aceite pasan por la tubería cada segundo?',
    categoria: 'aplicado',
    datos: { magnitud: 'caudalMasico', fluido: 'aceite', caudalLs: 2.5, decimales: 1 },
    etiquetaRespuesta: 'caudal másico en kg/s',
    pista: 'Pasa los litros a metros cúbicos y multiplica por la densidad: ṁ = ρ·Q.',
  },
  {
    id: 8,
    titulo: 'Subir cuesta presión',
    enunciado:
      'Una tubería de diámetro constante (10 cm) lleva agua (ρ = 1000 kg/m³) con un caudal de 2 L/s y sube 3 m desde la sección inferior (1) hasta la superior (3). Con g = 9,81 m/s², ¿cuánto vale la diferencia de presión P₃ − P₁ entre la sección superior y la inferior? Da el resultado en kPa con dos decimales.',
    categoria: 'abstracto',
    datos: {
      magnitud: 'diferenciaPresion',
      geometria: 'desnivel',
      fluido: 'agua',
      caudalLs: 2,
      desnivel: 3,
      seccion: 3,
      unidadPresion: 'kPa',
    },
    etiquetaRespuesta: 'P₃ − P₁ en kPa',
    pista: 'El diámetro no cambia, así que por continuidad la velocidad tampoco: el término ½·ρ·v² se anula y solo queda ρ·g·(h₁ − h₃). Si lo cargas en el simulador, compáralo con la TABLA: la tarjeta grande mide hasta la sección intermedia, a media altura.',
  },
  {
    id: 9,
    titulo: 'Aceite cuesta arriba',
    enunciado:
      'En una planta de envasado, una tubería de 10 cm de diámetro lleva aceite (ρ = 920 kg/m³) con un caudal de 3 L/s y sube 5 m entre dos máquinas. En la parte baja la presión ABSOLUTA es 101.325 Pa. Con g = 9,81 m/s² y sin pérdidas por rozamiento, ¿cuál es la presión absoluta en la parte alta? Da el resultado en kPa con dos decimales.',
    categoria: 'aplicado',
    datos: {
      magnitud: 'presionAbsoluta',
      geometria: 'desnivel',
      fluido: 'aceite',
      caudalLs: 3,
      desnivel: 5,
      seccion: 3,
      presionEntrada: P_ATMOSFERICA,
      unidadPresion: 'kPa',
    },
    etiquetaRespuesta: 'P₃ absoluta en kPa',
    pista: 'Mismo diámetro arriba y abajo: la velocidad no cambia. Resta a la presión de abajo el término ρ·g·Δh con la densidad del ACEITE, no la del agua.',
  },
  {
    id: 10,
    titulo: 'Una estenosis: cuánto se acelera el flujo',
    enunciado:
      'Un modelo de vaso sanguíneo es un tubo por el que circula sangre (ρ = 1060 kg/m³) a 1 L/s. En un tramo, el diámetro se reduce al 40 % del original (D₂/D₁ = 0,4), como en una estenosis. ¿Cuántas veces más rápido va la sangre en el estrechamiento que antes de él?',
    categoria: 'aplicado',
    datos: { magnitud: 'razonVelocidades', geometria: 'estenosis', fluido: 'sangre', caudalLs: 1, ratio: 0.4 },
    etiquetaRespuesta: 'v₂/v₁ (sin unidad)',
    pista: 'El caudal y la densidad no hacen falta: v₂/v₁ = A₁/A₂ = (D₁/D₂)².',
  },
  {
    id: 11,
    titulo: 'La caída de presión en la estenosis',
    enunciado:
      'En el mismo modelo, un tramo horizontal de 10 cm de diámetro se estrecha a 5 cm (D₂/D₁ = 0,5) y la sangre (ρ = 1060 kg/m³) circula a 2 L/s. ¿Cuánto vale la diferencia de presión P₂ − P₁ entre la estenosis y el tramo anterior? Trabaja sin redondear los pasos intermedios y da el resultado en Pa, redondeado a unidades.',
    categoria: 'aplicado',
    datos: { magnitud: 'diferenciaPresion', geometria: 'estenosis', fluido: 'sangre', caudalLs: 2, ratio: 0.5, decimales: 0 },
    etiquetaRespuesta: 'P₂ − P₁ en Pa',
    pista: 'Es el Venturi del caso 4 con otro fluido: mismas velocidades, y la caída se multiplica por 1060/1000.',
  },
  {
    id: 12,
    titulo: 'Un medidor Venturi',
    enunciado:
      'Un medidor Venturi horizontal para agua (ρ = 1000 kg/m³) tiene 10 cm de diámetro en la entrada y 5 cm en la garganta. Su manómetro diferencial marca una caída de presión P₁ − P₂ = 7500 Pa. ¿Qué caudal circula? Da el resultado en L/s con dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'caudalVenturi', fluido: 'agua', diametro1Cm: 10, diametro2Cm: 5, caidaPresion: 7500 },
    etiquetaRespuesta: 'Q en L/s',
    pista: 'Por continuidad, v₂ = 4·v₁. Mételo en P₁ − P₂ = ½·ρ·(v₂² − v₁²) y queda una sola incógnita, v₁. Al final, Q = A₁·v₁.',
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «0,25 m/s». Se deriva de los
 * DATOS del caso y no recortando la etiqueta, para no imprimir un número suelto junto a media
 * frase (hallazgo 830 de `simulador-genetica`).
 */
export function textoRespuesta(valor: number, datos: DatosCaso): string {
  return textoConUnidad(valor, datos);
}

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

/** El aire queda fuera: con sus 1,225 kg/m³ las caídas salen de décimas de pascal. */
const FLUIDOS_PRACTICA = ['agua', 'aceite', 'sangre'] as const;
const CAUDALES = [2, 3, 4, 5, 6, 8, 10] as const;
const RATIOS = [0.4, 0.5, 0.6] as const;
const DESNIVELES = [1, 2, 3, 4, 5, 6, 8] as const;
const PREGUNTAS = ['velocidadGarganta', 'caidaVenturi', 'caidaDesnivel', 'caudalMasico'] as const;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/**
 * Ejercicio aleatorio sobre la tubería del simulador. Usa EL MISMO `resolverCaso` que los doce
 * fijos, y por tanto el mismo motor que la tabla: si divergieran, el alumno entrenaría con una
 * regla y sería corregido con otra. Todos sus datos caben en los deslizadores, así que también
 * se pueden cargar en el simulador.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  const fluido = elegir(FLUIDOS_PRACTICA, rnd);
  const caudalLs = elegir(CAUDALES, rnd);
  const ratio = elegir(RATIOS, rnd);
  const desnivel = elegir(DESNIVELES, rnd);
  const geometria: GeomId = rnd() < 0.5 ? 'venturi' : 'estenosis';

  const rho = fluidoPorId(fluido).rho;
  const nombre = fluidoPorId(fluido).nombre.toLowerCase();
  const tramo =
    geometria === 'venturi'
      ? `Un Venturi horizontal pasa de 10 cm de diámetro en la entrada a ${numero(ratio * 10)} cm en la garganta (D₂/D₁ = ${numero(ratio)})`
      : `Un tubo horizontal de 10 cm de diámetro tiene una estenosis de ${numero(ratio * 10)} cm (D₂/D₁ = ${numero(ratio)})`;
  const circula = `Circula ${nombre} (ρ = ${numero(rho)} kg/m³) con un caudal de ${numero(caudalLs)} L/s.`;

  let datos: DatosCaso;
  let enunciado: string;
  let etiqueta: string;

  if (pregunta === 'velocidadGarganta') {
    datos = { magnitud: 'velocidadSeccion', geometria, fluido, caudalLs, ratio };
    enunciado = `${tramo}. ${circula} ¿A qué velocidad pasa por la parte estrecha? Redondea a dos decimales.`;
    etiqueta = 'v₂ en m/s';
  } else if (pregunta === 'caidaVenturi') {
    // Misma regla que la app para elegir la unidad: kPa desde 10.000 Pa, Pa por debajo.
    const previa = resolverCaso({ magnitud: 'diferenciaPresion', geometria, fluido, caudalLs, ratio });
    const enKPa = previa.ok && Math.abs(previa.valor) >= 10000;
    datos = enKPa
      ? { magnitud: 'diferenciaPresion', geometria, fluido, caudalLs, ratio, unidadPresion: 'kPa' }
      : { magnitud: 'diferenciaPresion', geometria, fluido, caudalLs, ratio, decimales: 0 };
    enunciado = `${tramo}. ${circula} ¿Cuánto vale la diferencia de presión P₂ − P₁ entre la parte estrecha y la entrada? Trabaja sin redondear los pasos intermedios y da el resultado ${enKPa ? 'en kPa con dos decimales' : 'en Pa, redondeado a unidades'}.`;
    etiqueta = enKPa ? 'P₂ − P₁ en kPa' : 'P₂ − P₁ en Pa';
  } else if (pregunta === 'caidaDesnivel') {
    datos = {
      magnitud: 'diferenciaPresion',
      geometria: 'desnivel',
      fluido,
      caudalLs,
      desnivel,
      seccion: 3,
      unidadPresion: 'kPa',
    };
    enunciado = `Una tubería de diámetro constante (10 cm) lleva ${nombre} (ρ = ${numero(rho)} kg/m³) con un caudal de ${numero(caudalLs)} L/s y sube ${numero(desnivel)} m desde la sección inferior (1) hasta la superior (3). Con g = 9,81 m/s², ¿cuánto vale P₃ − P₁? Da el resultado en kPa con dos decimales.`;
    etiqueta = 'P₃ − P₁ en kPa';
  } else {
    datos = { magnitud: 'caudalMasico', fluido, caudalLs };
    enunciado = `Por una tubería circula ${nombre} (ρ = ${numero(rho)} kg/m³) con un caudal de ${numero(caudalLs)} L/s. ¿Cuántos kilogramos pasan cada segundo? Redondea a dos decimales.`;
    etiqueta = 'caudal másico en kg/s';
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
