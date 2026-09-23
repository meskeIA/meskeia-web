/**
 * Casos para clase — la tarea asignable de `simulador-campo-electrico`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien: un lienzo con flechas plausibles pasa cualquier compilación
 * ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA FÍSICA NO SE REPLICA AQUÍ ──────────────────────────────────────────────
 *
 * Todo número sale de `./motor.ts`, el MISMO módulo con el que el panel de la sonda calcula
 * sus seis filas: `calcularCampoEnPunto` (superposición de Coulomb con la guardia de
 * singularidad), `modulo`, `fuerzaSobreCarga` (F = q₀·E) y `energiaPotencial` (U = q₀·V).
 * Si la corrección y el panel calculasen cada uno a su manera, la app podría suspender una
 * respuesta que ella misma acaba de mostrar.
 *
 * ── EL CONVENIO DE ESTA APP (fijado por escrito) ──────────────────────────────
 *
 * · k = 8,99·10⁹ N·m²/C², que es el de la app (`K_COULOMB`). Muchos libros usan 9·10⁹: la
 *   diferencia es del 0,11 % y cabe en la tolerancia del 1 %, pero CADA ENUNCIADO QUE USA k
 *   LO DECLARA. El único que no lo declara es el del punto de campo nulo, donde k se cancela
 *   y la respuesta no depende de ella.
 * · Cargas en nC y distancias en metros, como el simulador. Coordenadas (x; y) en metros,
 *   con punto y coma porque la coma es el separador decimal.
 * · E es un VECTOR: cada caso pide o el MÓDULO |E| o UNA COMPONENTE concreta (Eₓ, Eᵧ), nunca
 *   «el campo» a secas. Igual con F. Las componentes llevan signo: negativo es hacia −x o −y.
 * · Unidades de respuesta, las que muestra el panel: E en N/C y V en voltios. F y U, que en
 *   el panel salen en notación científica (4,50 × 10⁻⁸ N), se piden en nN y nJ para que
 *   ninguna respuesta haya que teclearla con exponente (`parseSpanishNumber` devuelve NaN con
 *   «1e-7»). Con q₀ en nC y E en N/C, F sale directamente en nN, y U = q₀·V en nJ.
 * · Ningún punto pedido está a menos de RADIO_SINGULARIDAD (5 cm) de una carga, y todos caen
 *   dentro del lienzo (|x| ≤ 4 m, |y| ≤ 2,5 m), así que «Cargar en el simulador» los
 *   reproduce tal cual.
 *
 * Nada lanza excepciones: un `throw` dentro de un render tumba la app entera; aquí los datos
 * imposibles devuelven `{ ok: false, error }` y un NaN.
 */

import { formatNumber } from '@/lib';
import {
  RADIO_SINGULARIDAD,
  calcularCampoEnPunto,
  energiaPotencial,
  fuerzaSobreCarga,
  modulo,
  type CargaPuntual,
} from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export interface PuntoPlano {
  x: number;
  y: number;
}

/**
 * Qué se pide. Las componentes y los escalares (V, U) llevan signo; los módulos no.
 * `x-campo-nulo` es la coordenada x, entre dos cargas del mismo signo alineadas en
 * horizontal, donde el campo total se anula.
 */
export type Magnitud =
  | 'modulo-E'
  | 'Ex'
  | 'Ey'
  | 'V'
  | 'modulo-F'
  | 'Fx'
  | 'Fy'
  | 'U'
  | 'x-campo-nulo';

export interface DatosCaso {
  /** Cargas fuente, en nC y metros. */
  cargas: readonly CargaPuntual[];
  /** Punto donde se mide. No hace falta para `x-campo-nulo`. */
  punto?: PuntoPlano;
  magnitud: Magnitud;
  /** Carga de prueba en nC, con signo. Obligatoria para F y U. */
  qPrueba?: number;
  /** Decimales de la respuesta. Por defecto 2. */
  decimales?: number;
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/* ─────────────────────────── Formato ─────────────────────────── */

/** 1 nano = 10⁻⁹: pasa N a nN y J a nJ. */
const NANO = 1e-9;

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * Cifra en formato español con los decimales que de verdad tiene, hasta `maxDecimales`.
 * Pasa por `formatNumber`, que fija los decimales exactos; aquí solo se elige cuántos, para
 * que un paso intermedio no diga «8,9900». El ruido binario por debajo de 10⁻⁹ se lee como 0
 * (una superposición simétrica deja Eᵧ = 3·10⁻¹⁵, que es un cero).
 */
function cifra(n: number, maxDecimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  const v = Math.abs(n) < 1e-9 ? 0 : n;
  let d = 0;
  while (d < maxDecimales && Math.abs(redondear(v, d) - v) > 1e-9 * Math.max(1, Math.abs(v))) {
    d += 1;
  }
  return formatNumber(v, d);
}

/** Carga con su signo explícito y el menos tipográfico: «+5 nC», «−4 nC». */
function textoCarga(q: number): string {
  return `${q < 0 ? '−' : '+'}${cifra(Math.abs(q))} nC`;
}

/** Coordenadas en metros con el menos tipográfico, como en los enunciados: «(−1,5; 0)». */
function textoPunto(p: PuntoPlano): string {
  const coord = (n: number) => cifra(n).replace(/^-/, "−");
  return `(${coord(p.x)}; ${coord(p.y)})`;
}

const SUPERINDICES = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

/** Notación científica con superíndices reales, como la escribe el panel: «4,3152 × 10⁻⁷». */
function cientifica(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mantisa = n / 10 ** exp;
  const signo = exp < 0 ? '⁻' : '';
  const sup = String(Math.abs(exp))
    .split('')
    .map((d) => SUPERINDICES[Number(d)])
    .join('');
  return `${cifra(mantisa)} × 10${signo}${sup}`;
}

const NOMBRE: Record<Magnitud, string> = {
  'modulo-E': '|E|',
  Ex: 'Eₓ',
  Ey: 'Eᵧ',
  V: 'V',
  'modulo-F': '|F|',
  Fx: 'Fₓ',
  Fy: 'Fᵧ',
  U: 'U',
  'x-campo-nulo': 'x',
};

/** Unidad en que se pide y se da la respuesta. */
export function unidadDe(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'modulo-E':
    case 'Ex':
    case 'Ey':
      return 'N/C';
    case 'V':
      return 'V';
    case 'modulo-F':
    case 'Fx':
    case 'Fy':
      return 'nN';
    case 'U':
      return 'nJ';
    case 'x-campo-nulo':
      return 'm';
    default:
      return '';
  }
}

/**
 * Lo que se escribe en la casilla, con unidad. Se deriva de la magnitud y no se escribe a
 * mano, para que los doce casos y el modo práctica lo digan exactamente igual.
 */
export function etiquetaDe(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'modulo-E':
      return '|E| en N/C';
    case 'Ex':
      return 'Eₓ en N/C, con su signo';
    case 'Ey':
      return 'Eᵧ en N/C, con su signo';
    case 'V':
      return 'V en voltios, con su signo';
    case 'modulo-F':
      return '|F| en nN (1 nN = 10⁻⁹ N)';
    case 'Fx':
      return 'Fₓ en nN, con su signo (1 nN = 10⁻⁹ N)';
    case 'Fy':
      return 'Fᵧ en nN, con su signo (1 nN = 10⁻⁹ N)';
    case 'U':
      return 'U en nJ, con su signo (1 nJ = 10⁻⁹ J)';
    case 'x-campo-nulo':
      return 'x en metros';
    default:
      return 'sin unidad';
  }
}

/** El resultado con su unidad y los decimales pedidos: «11,24 N/C». */
export function textoRespuesta(valor: number, unidad: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  return `${formatNumber(valor, decimales)} ${unidad}`;
}

/** true si la cifra exacta tiene más decimales de los que se piden: el enunciado debe decirlo. */
export function exigeRedondeo(valor: number, decimales: number): boolean {
  if (!Number.isFinite(valor)) return false;
  return Math.abs(redondear(valor, decimales) - valor) > 1e-9 * Math.max(1, Math.abs(valor));
}

/* ─────────────────────────── Resolución ─────────────────────────── */

function cargasValidas(cargas: readonly CargaPuntual[]): boolean {
  return (
    cargas.length > 0 &&
    cargas.every(
      (c) => Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.q) && c.q !== 0,
    )
  );
}

/** Explica el campo de UNA carga en el punto, con los números del propio motor. */
function pasoCampoDeUnaCarga(c: CargaPuntual, p: PuntoPlano, indice: number, varias: boolean): string {
  const r = modulo(p.x - c.x, p.y - c.y);
  const parcial = calcularCampoEnPunto(p.x, p.y, [c]);
  const e = modulo(parcial.Ex, parcial.Ey);
  const quien = varias ? `Carga ${indice + 1} (${textoCarga(c.q)} en ${textoPunto(c)})` : `La carga ${textoCarga(c.q)} en ${textoPunto(c)}`;
  const sentido =
    c.q > 0 ? 'y, como es positiva, el campo se ALEJA de ella' : 'y, como es negativa, el campo apunta HACIA ella';
  return `${quien}: está a r = ${cifra(r)} m del punto. Su campo vale k·|q|/r² = 8,99·10⁹ · ${cifra(Math.abs(c.q))}·10⁻⁹ / ${cifra(r)}² = ${cifra(e)} N/C, ${sentido}: Eₓ = ${cifra(parcial.Ex)} N/C y Eᵧ = ${cifra(parcial.Ey)} N/C.`;
}

/** Explica el potencial de UNA carga en el punto. */
function pasoPotencialDeUnaCarga(c: CargaPuntual, p: PuntoPlano, indice: number, varias: boolean): string {
  const r = modulo(p.x - c.x, p.y - c.y);
  const parcial = calcularCampoEnPunto(p.x, p.y, [c]);
  const quien = varias ? `Carga ${indice + 1} (${textoCarga(c.q)} en ${textoPunto(c)})` : `La carga ${textoCarga(c.q)} en ${textoPunto(c)}`;
  const q = `${c.q < 0 ? '(−' : ''}${cifra(Math.abs(c.q))}·10⁻⁹${c.q < 0 ? ')' : ''}`;
  return `${quien}: está a r = ${cifra(r)} m. V = k·q/r = 8,99·10⁹ · ${q} / ${cifra(r)} = ${cifra(parcial.V)} V. El signo de la carga se conserva.`;
}

/** Punto entre dos cargas del mismo signo, alineadas en horizontal, donde el campo se anula. */
function resolverCampoNulo(datos: DatosCaso): Resolucion {
  const pasos: string[] = [];
  if (datos.cargas.length !== 2) {
    return { ok: false, valor: NaN, pasos, error: 'El punto de campo nulo se plantea con exactamente dos cargas.' };
  }
  const [a, b] = datos.cargas[0].x <= datos.cargas[1].x ? datos.cargas : [datos.cargas[1], datos.cargas[0]];
  if (Math.abs(a.y - b.y) > 1e-12 || a.x === b.x) {
    return { ok: false, valor: NaN, pasos, error: 'Las dos cargas tienen que estar en una misma recta horizontal.' };
  }
  if (Math.sign(a.q) !== Math.sign(b.q)) {
    return {
      ok: false,
      valor: NaN,
      pasos,
      error: 'Con cargas de signo contrario el campo no se anula entre ellas: ahí los dos apuntan hacia el mismo lado.',
    };
  }

  const D = b.x - a.x;
  const s1 = Math.sqrt(Math.abs(a.q));
  const s2 = Math.sqrt(Math.abs(b.q));
  const d = (D * s1) / (s1 + s2);
  const x = a.x + d;

  pasos.push(
    `Entre dos cargas del mismo signo sus campos apuntan en sentidos OPUESTOS, así que en algún punto del segmento que las une se anulan. Fuera del segmento no: allí apuntan hacia el mismo lado.`,
  );
  pasos.push(
    `Las cargas están a D = ${cifra(D)} m una de otra. Llamando d a la distancia desde la de la izquierda (${textoCarga(a.q)}), el campo es nulo cuando k·${cifra(Math.abs(a.q))}/d² = k·${cifra(Math.abs(b.q))}/(${cifra(D)} − d)². La k se cancela, y también el 10⁻⁹ del nC: la respuesta no depende de ellos.`,
  );
  pasos.push(
    `Sacando la raíz cuadrada: √${cifra(Math.abs(a.q))}/d = √${cifra(Math.abs(b.q))}/(${cifra(D)} − d), de donde d = D·√q₁/(√q₁ + √q₂) = ${cifra(D)}·${cifra(s1)}/(${cifra(s1)} + ${cifra(s2)}) = ${cifra(d)} m.${Math.abs(a.q) !== Math.abs(b.q) ? " Queda más cerca de la carga PEQUEÑA, como debe ser." : " Con cargas iguales es el punto medio."}`,
  );
  pasos.push(`La coordenada es x = ${cifra(a.x)} + ${cifra(d)} = ${cifra(x)} m.`);

  const comprobacion = calcularCampoEnPunto(x, a.y, datos.cargas);
  pasos.push(
    `Comprobación con el motor del simulador: en ${textoPunto({ x, y: a.y })} sale Eₓ = ${cifra(comprobacion.Ex)} N/C y Eᵧ = ${cifra(comprobacion.Ey)} N/C.`,
  );

  if (!Number.isFinite(x)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }
  return { ok: true, valor: x, pasos };
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: los datos imposibles devuelven `{ ok: false, error }`.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  const { cargas, magnitud } = datos;

  if (!cargasValidas(cargas)) {
    return { ok: false, valor: NaN, pasos, error: 'Hace falta al menos una carga, distinta de cero y con posición.' };
  }

  if (magnitud === 'x-campo-nulo') {
    const r = resolverCampoNulo(datos);
    if (r.ok) r.pasos.push(pasoFinal(r.valor, magnitud, decimales));
    return r;
  }

  const p = datos.punto;
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
    return { ok: false, valor: NaN, pasos, error: 'Falta el punto donde se mide.' };
  }

  const total = calcularCampoEnPunto(p.x, p.y, cargas);
  if (total.singular) {
    return {
      ok: false,
      valor: NaN,
      pasos,
      error: `El punto está a menos de ${cifra(RADIO_SINGULARIDAD * 100)} cm de una carga: ahí el campo diverge y no hay cifra que dar.`,
    };
  }

  const necesitaPrueba = magnitud === 'modulo-F' || magnitud === 'Fx' || magnitud === 'Fy' || magnitud === 'U';
  const q0 = datos.qPrueba;
  if (necesitaPrueba && (q0 === undefined || !Number.isFinite(q0) || q0 === 0)) {
    return { ok: false, valor: NaN, pasos, error: 'Para la fuerza o la energía hace falta la carga de prueba.' };
  }

  const varias = cargas.length > 1;
  let valor: number;

  if (magnitud === 'V' || magnitud === 'U') {
    cargas.forEach((c, i) => pasos.push(pasoPotencialDeUnaCarga(c, p, i, varias)));
    if (varias) {
      const parciales = cargas.map((c) => calcularCampoEnPunto(p.x, p.y, [c]).V);
      pasos.push(
        `El potencial es un ESCALAR: se suman los números con su signo, sin componentes. V = ${parciales
          .map((v, i) => (i > 0 && v < 0 ? `(${cifra(v)})` : cifra(v)))
          .join(' + ')} = ${cifra(total.V)} V.`,
      );
    }
    if (magnitud === 'V') {
      valor = total.V;
    } else {
      const qp = q0 as number;
      const U = energiaPotencial(qp, total.V);
      valor = U / NANO;
      pasos.push(
        `U = q₀·V = (${textoCarga(qp)})·(${cifra(total.V)} V). Con q₀ en nC y V en voltios, U sale directamente en nJ: U = ${cifra(valor)} nJ, es decir, ${cientifica(U)} J.`,
      );
      if (qp * total.V < 0) {
        pasos.push('Sale negativa porque la carga de prueba y el potencial tienen signos contrarios.');
      }
    }
  } else {
    cargas.forEach((c, i) => pasos.push(pasoCampoDeUnaCarga(c, p, i, varias)));
    if (varias) {
      const parciales = cargas.map((c) => calcularCampoEnPunto(p.x, p.y, [c]));
      const suma = (xs: number[]) =>
        xs.map((v, i) => (i > 0 && v < 0 ? `(${cifra(v)})` : cifra(v))).join(' + ');
      pasos.push(
        `El campo es un VECTOR: se suman las componentes por separado. Eₓ = ${suma(parciales.map((e) => e.Ex))} = ${cifra(total.Ex)} N/C; Eᵧ = ${suma(parciales.map((e) => e.Ey))} = ${cifra(total.Ey)} N/C.`,
      );
    }
    const E = modulo(total.Ex, total.Ey);

    switch (magnitud) {
      case 'modulo-E':
        valor = E;
        if (varias || (Math.abs(total.Ex) > 1e-9 && Math.abs(total.Ey) > 1e-9)) {
          pasos.push(`|E| = √(Eₓ² + Eᵧ²) = √(${cifra(total.Ex)}² + ${cifra(total.Ey)}²) = ${cifra(E)} N/C.`);
        } else {
          pasos.push(`El módulo es el de esa única contribución: |E| = ${cifra(E)} N/C.`);
        }
        break;
      case 'Ex':
        valor = total.Ex;
        pasos.push(
          `Se pide la componente x: Eₓ = ${cifra(valor)} N/C. ${valor < 0 ? 'El signo menos dice que apunta hacia −x (a la izquierda).' : 'Positiva: apunta hacia +x (a la derecha).'}`,
        );
        break;
      case 'Ey':
        valor = total.Ey;
        pasos.push(
          `Se pide la componente y: Eᵧ = ${cifra(valor)} N/C. ${valor < 0 ? 'El signo menos dice que apunta hacia −y (hacia abajo).' : 'Positiva: apunta hacia +y (hacia arriba).'}`,
        );
        break;
      case 'modulo-F':
      case 'Fx':
      case 'Fy': {
        const qp = q0 as number;
        const f = fuerzaSobreCarga(qp, total.Ex, total.Ey);
        const enN = magnitud === 'modulo-F' ? f.F : magnitud === 'Fx' ? f.Fx : f.Fy;
        valor = enN / NANO;
        if (magnitud === 'modulo-F') {
          pasos.push(
            `|F| = |q₀|·|E| = ${cifra(Math.abs(qp))} nC · ${cifra(E)} N/C. Con q₀ en nC y E en N/C, la fuerza sale directamente en nN: |F| = ${cifra(valor)} nN, es decir, ${cientifica(enN)} N.`,
          );
        } else {
          const comp = magnitud === 'Fx' ? total.Ex : total.Ey;
          const eje = magnitud === 'Fx' ? 'x' : 'y';
          pasos.push(
            `F${magnitud === 'Fx' ? 'ₓ' : 'ᵧ'} = q₀·E${magnitud === 'Fx' ? 'ₓ' : 'ᵧ'} = (${textoCarga(qp)})·(${cifra(comp)} N/C) = ${cifra(valor)} nN, es decir, ${cientifica(enN)} N.`,
          );
          pasos.push(
            qp < 0
              ? `Como q₀ es negativa, la fuerza va en sentido CONTRARIO al campo: el signo de la componente ${eje} se invierte.`
              : `Como q₀ es positiva, la fuerza va en el mismo sentido que el campo.`,
          );
        }
        break;
      }
      default:
        return { ok: false, valor: NaN, pasos, error: 'Magnitud desconocida.' };
    }
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }
  pasos.push(pasoFinal(valor, magnitud, decimales));
  return { ok: true, valor, pasos };
}

/**
 * El último paso muestra la cifra con LOS MISMOS decimales que `respuestaTexto`: si el
 * enunciado pide redondear a dos, aquí salen dos, no cuatro.
 */
function pasoFinal(valor: number, magnitud: Magnitud, decimales: number): string {
  const texto = textoRespuesta(redondear(valor, decimales), unidadDe(magnitud), decimales);
  return exigeRedondeo(valor, decimales)
    ? `Redondeando a ${decimales} decimales: ${NOMBRE[magnitud]} = ${texto}.`
    : `Resultado: ${NOMBRE[magnitud]} = ${texto}.`;
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor: así un 0,1 no se corrige a ciegas. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde con
 * un veredicto, no con una excepción que tumbaría el render.
 *
 * El 1 % de tolerancia es también lo que absorbe la k = 9·10⁹ de muchos libros (0,11 % de
 * diferencia con la 8,99·10⁹ de la app).
 */
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
   * Margen de 1e-9 sobre la tolerancia: en el borde exacto la resta en binario decide por
   * ±1 ulp, y la misma desviación se aceptaría por arriba y se rechazaría por abajo (hallazgo
   * 1211 de `simulador-movimiento-circular`).
   */
  const RUIDO_BINARIO = 1e-9;
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  // Una respuesta con el signo cambiado es el error típico del tema: se dice, no se esconde.
  if (esperado !== 0 && Math.abs(usuario + esperado) <= tolerancia + RUIDO_BINARIO) {
    return {
      correcto: false,
      motivo: 'El valor es correcto, pero el SIGNO no: revisa hacia dónde apunta o qué signo tiene la carga.',
      diferencia,
      tolerancia,
    };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${cifra(diferencia, 2)} de la respuesta.`,
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
  /** Unidad de la respuesta, sola: «N/C», «nN»… */
  unidad: string;
  /** Calculada por el motor desde `datos` y redondeada a los decimales pedidos. */
  respuesta: number;
  respuestaTexto: string;
  /** true si la cifra exacta tiene más decimales de los pedidos: el enunciado lo dice. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

const K_TEXTO = 'Usa k = 8,99·10⁹ N·m²/C².';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países, gentilicios ni monedas: el público de este canal es sobre todo
 * latinoamericano, y un enunciado anclado a un lugar excluye a la mayor parte.
 *
 * ⚠️ Ningún TÍTULO lleva las palabras de los botones de la app («dipolo», «cuadrupolo»,
 * «eliminar», «limpiar todo», «carga puntual aislada»…): el título entra en el nombre
 * accesible del botón de cada caso, y el acta del Inspector localiza esos botones por
 * nombre parcial.
 */
const DEFINICIONES: ReadonlyArray<
  Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'unidad' | 'etiquetaRespuesta' | 'requiereRedondeo'>
> = [
  {
    id: 1,
    titulo: 'El campo de una sola carga',
    enunciado: `Una carga de +5 nC está en el origen (0; 0). ¿Cuál es el módulo del campo eléctrico en el punto P (1; 0), con las coordenadas en metros? ${K_TEXTO}`,
    categoria: 'abstracto',
    datos: { cargas: [{ x: 0, y: 0, q: 5 }], punto: { x: 1, y: 0 }, magnitud: 'modulo-E' },
    pista: 'E = k·|q|/r². No olvides pasar los nC a culombios: 5 nC = 5·10⁻⁹ C.',
  },
  {
    id: 2,
    titulo: 'El doble de lejos, la cuarta parte',
    enunciado: `Un sensor de campo se coloca a 2 m de una pequeña esfera cargada con +5 nC: la esfera está en (0; 0) y el sensor en (0; 2), en metros. ¿Qué módulo del campo eléctrico mide el sensor? ${K_TEXTO} Redondea a dos decimales.`,
    categoria: 'aplicado',
    datos: { cargas: [{ x: 0, y: 0, q: 5 }], punto: { x: 0, y: 2 }, magnitud: 'modulo-E' },
    pista: 'La distancia va al CUADRADO: al doble de distancia que en el caso 1 el campo no se divide entre 2, sino entre 4.',
  },
  {
    id: 3,
    titulo: 'Carga negativa: el campo apunta hacia ella',
    enunciado: `Una carga de −4 nC está en el origen. ¿Cuánto vale la componente Eₓ del campo eléctrico en el punto (2; 0), en metros? Da el resultado con su signo. ${K_TEXTO}`,
    categoria: 'abstracto',
    datos: { cargas: [{ x: 0, y: 0, q: -4 }], punto: { x: 2, y: 0 }, magnitud: 'Ex' },
    pista: 'El campo de una carga negativa apunta HACIA la carga. El punto está a su derecha, así que el campo apunta a la izquierda.',
  },
  {
    id: 4,
    titulo: 'El potencial conserva el signo',
    enunciado: `Una carga de −3 nC está en el origen. ¿Cuál es el potencial eléctrico en el punto (0; 1,5), en metros? Da el resultado con su signo. ${K_TEXTO}`,
    categoria: 'abstracto',
    datos: { cargas: [{ x: 0, y: 0, q: -3 }], punto: { x: 0, y: 1.5 }, magnitud: 'V' },
    pista: 'V = k·q/r, con la carga CON su signo y la distancia sin elevar al cuadrado.',
  },
  {
    id: 5,
    titulo: 'Dos cargas opuestas: los campos se refuerzan',
    enunciado: `Una carga de +2 nC está en (−1; 0) y otra de −2 nC en (1; 0), en metros. ¿Cuánto vale la componente Eₓ del campo eléctrico en el punto medio (0; 0)? Da el resultado con su signo. ${K_TEXTO}`,
    categoria: 'abstracto',
    datos: {
      cargas: [
        { x: -1, y: 0, q: 2 },
        { x: 1, y: 0, q: -2 },
      ],
      punto: { x: 0, y: 0 },
      magnitud: 'Ex',
    },
    pista: 'La positiva empuja hacia la derecha (se aleja de ella) y la negativa tira hacia la derecha (apunta hacia ella): los dos campos van en el MISMO sentido y se suman.',
  },
  {
    id: 6,
    titulo: 'Dos cargas en ángulo recto',
    enunciado: `Una carga de +6 nC está en (−1; 0) y otra de +8 nC en (0; −1), en metros. ¿Cuál es el módulo del campo eléctrico total en el origen (0; 0)? ${K_TEXTO}`,
    categoria: 'abstracto',
    datos: {
      cargas: [
        { x: -1, y: 0, q: 6 },
        { x: 0, y: -1, q: 8 },
      ],
      punto: { x: 0, y: 0 },
      magnitud: 'modulo-E',
    },
    pista: 'Un campo sale horizontal y el otro vertical. No sumes los módulos: calcula cada componente y aplica Pitágoras.',
  },
  {
    id: 7,
    titulo: 'Dos bolitas de un péndulo eléctrico',
    enunciado: `Una esfera fija con carga +4 nC está en (0; 0). A 0,5 m, en el punto (0,5; 0), cuelga una bolita ligera con carga +3 nC. ¿Cuál es el módulo de la fuerza eléctrica sobre la bolita, en nanonewtons? ${K_TEXTO}`,
    categoria: 'aplicado',
    datos: { cargas: [{ x: 0, y: 0, q: 4 }], punto: { x: 0.5, y: 0 }, magnitud: 'modulo-F', qPrueba: 3 },
    pista: 'Primero el campo de la esfera en la posición de la bolita; después F = q₀·E. Con q₀ en nC y E en N/C, F sale en nN.',
  },
  {
    id: 8,
    titulo: 'Energía de una partícula de polvo',
    enunciado: `Una partícula de polvo con carga −2 nC flota en el punto (3; 0), en metros, cerca de una superficie que se comporta como una carga puntual de +6 nC situada en (0; 0). ¿Cuál es la energía potencial eléctrica de la partícula, en nanojulios? Da el resultado con su signo. ${K_TEXTO}`,
    categoria: 'aplicado',
    datos: { cargas: [{ x: 0, y: 0, q: 6 }], punto: { x: 3, y: 0 }, magnitud: 'U', qPrueba: -2 },
    pista: 'Primero el potencial que crea la carga de +6 nC en la partícula; después U = q₀·V. Con q₀ en nC y V en voltios, U sale en nJ.',
  },
  {
    id: 9,
    titulo: 'Dónde queda en equilibrio una tercera bolita',
    enunciado:
      'Dos esferas cargadas están fijas sobre una recta horizontal: una de +4 nC en (−1,5; 0) y otra de +1 nC en (1,5; 0), en metros. Queremos colocar una tercera bolita cargada entre ellas, sobre esa recta, en el punto donde el campo total es nulo, para que no sienta ninguna fuerza. ¿Cuál es la coordenada x de ese punto?',
    categoria: 'aplicado',
    datos: {
      cargas: [
        { x: -1.5, y: 0, q: 4 },
        { x: 1.5, y: 0, q: 1 },
      ],
      magnitud: 'x-campo-nulo',
    },
    pista: 'Iguala los módulos de los dos campos: k·q₁/d² = k·q₂/(D − d)². La k se cancela. El punto queda más cerca de la carga pequeña.',
  },
  {
    id: 10,
    titulo: 'El potencial de dos cargas se suma con signo',
    enunciado: `Una carga de +6 nC está en el origen (0; 0) y otra de −5 nC en (1,5; 0), en metros. ¿Cuál es el potencial eléctrico total en el punto (0; 2)? ${K_TEXTO}`,
    categoria: 'abstracto',
    datos: {
      cargas: [
        { x: 0, y: 0, q: 6 },
        { x: 1.5, y: 0, q: -5 },
      ],
      punto: { x: 0, y: 2 },
      magnitud: 'V',
    },
    pista: 'La distancia a la segunda carga es la hipotenusa de un triángulo de catetos 1,5 m y 2 m. El potencial no tiene componentes: suma los dos valores con su signo.',
  },
  {
    id: 11,
    titulo: 'Una barra frotada atrae a una bolita',
    enunciado: `Una barra de plástico frotada se comporta, a efectos de cálculo, como una carga puntual de −6 nC situada en (0; 0). Una bolita de corcho con carga +2 nC está en (1; 0), en metros. ¿Cuánto vale la componente Fₓ de la fuerza sobre la bolita, en nanonewtons? Da el resultado con su signo. ${K_TEXTO}`,
    categoria: 'aplicado',
    datos: { cargas: [{ x: 0, y: 0, q: -6 }], punto: { x: 1, y: 0 }, magnitud: 'Fx', qPrueba: 2 },
    pista: 'Cargas de signo contrario se atraen: la bolita es empujada hacia la barra, que está a su izquierda. ¿Qué signo tiene entonces Fₓ?',
  },
  {
    id: 12,
    titulo: 'Una gota de pintura atraída hacia la pieza',
    enunciado: `En una cabina de pintura electrostática, una gota de pintura con carga −2 nC está en el origen (0; 0). La pieza que hay que pintar está justo encima, a 0,5 m, y a efectos de cálculo se comporta como una carga puntual de +5 nC en (0; 0,5). ¿Cuánto vale la componente vertical Fᵧ de la fuerza sobre la gota, en nanonewtons? Da el resultado con su signo. ${K_TEXTO}`,
    categoria: 'aplicado',
    datos: { cargas: [{ x: 0, y: 0.5, q: 5 }], punto: { x: 0, y: 0 }, magnitud: 'Fy', qPrueba: -2 },
    pista: 'El campo de la pieza positiva, en la gota, apunta hacia ABAJO (se aleja de la pieza). Pero la gota es negativa: la fuerza va al revés que el campo.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  const unidad = unidadDe(def.datos.magnitud);
  return {
    ...def,
    etiquetaRespuesta: etiquetaDe(def.datos.magnitud),
    unidad,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, unidad, decimales),
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, decimales) : false,
    pasos: r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'],
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente
 * con 1, 2, 3… los primeros valores salen diminutos y muy parecidos, así que
 * `Math.floor(rnd() * n)` devuelve el índice 0 para todas las semillas pequeñas y el
 * «aleatorio» acaba dando SIEMPRE el mismo ejercicio. Pasó en `simulador-genetica` el
 * 14/09/2026 y pasó la prueba de reproducibilidad, porque reproducible no es variado.
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
  etiquetaRespuesta: string;
  unidad: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

function elegir<T>(rnd: () => number, opciones: readonly T[]): T {
  return opciones[Math.min(opciones.length - 1, Math.floor(rnd() * opciones.length))];
}

/** Valores enteros de carga, en nC: dentro del rango del deslizador de la app (0,1–10). */
const CARGAS_NC = [1, 2, 3, 4, 5, 6, 8] as const;
const CARGAS_PRUEBA_NC = [1, 2, 3, 4, 5] as const;
/** Distancias en metros. Con 1 y 0,5 las respuestas salen con dos decimales como mucho. */
const DISTANCIAS = [0.5, 1, 1.5, 2] as const;
const TIPOS = ['modulo-E', 'Ex', 'V', 'modulo-F', 'U'] as const;

function conSigno(rnd: () => number, q: number): number {
  return rnd() < 0.5 ? -q : q;
}

function describirCargas(cargas: readonly CargaPuntual[]): string {
  if (cargas.length === 1) {
    const c = cargas[0];
    return `Una carga de ${textoCarga(c.q)} está en ${textoPunto(c)}`;
  }
  return `Una carga de ${textoCarga(cargas[0].q)} está en ${textoPunto(cargas[0])} y otra de ${textoCarga(cargas[1].q)} en ${textoPunto(cargas[1])}`;
}

/**
 * Ejercicio aleatorio de campo, potencial, fuerza o energía. Usa EL MISMO `resolverCaso` que
 * los doce fijos: si divergieran, el alumno entrenaría con una regla y sería corregido con
 * otra. Si la cifra exacta tiene más de dos decimales, el enunciado lo dice.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const tipo = elegir(rnd, TIPOS);
  const q1 = conSigno(rnd, elegir(rnd, CARGAS_NC));
  const q2 = conSigno(rnd, elegir(rnd, CARGAS_NC));
  const r1 = elegir(rnd, DISTANCIAS);
  const r2 = elegir(rnd, DISTANCIAS);
  const qPrueba = conSigno(rnd, elegir(rnd, CARGAS_PRUEBA_NC));
  const vertical = rnd() < 0.5;

  let datos: DatosCaso;
  let pregunta: string;
  const punto: PuntoPlano = { x: 0, y: 0 };

  switch (tipo) {
    case 'Ex':
      // Dos cargas a izquierda y derecha del origen: superposición en línea.
      datos = {
        cargas: [
          { x: -r1, y: 0, q: q1 },
          { x: r2, y: 0, q: q2 },
        ],
        punto,
        magnitud: 'Ex',
      };
      pregunta = '¿Cuánto vale la componente Eₓ del campo eléctrico en el origen (0; 0)? Da el resultado con su signo.';
      break;
    case 'V':
      datos = {
        cargas: [
          { x: -r1, y: 0, q: q1 },
          { x: r2, y: 0, q: q2 },
        ],
        punto,
        magnitud: 'V',
      };
      pregunta = '¿Cuál es el potencial eléctrico total en el origen (0; 0)? Da el resultado con su signo.';
      break;
    case 'modulo-F':
    case 'U':
    case 'modulo-E':
    default: {
      // Una sola carga en el origen y el punto a una distancia r1, en horizontal o en vertical.
      const p: PuntoPlano = vertical ? { x: 0, y: r1 } : { x: r1, y: 0 };
      if (tipo === 'modulo-F') {
        datos = { cargas: [{ x: 0, y: 0, q: q1 }], punto: p, magnitud: 'modulo-F', qPrueba };
        pregunta = `Se coloca allí una carga de prueba de ${textoCarga(qPrueba)}. ¿Cuál es el módulo de la fuerza eléctrica sobre ella, en nanonewtons?`;
      } else if (tipo === 'U') {
        datos = { cargas: [{ x: 0, y: 0, q: q1 }], punto: p, magnitud: 'U', qPrueba };
        pregunta = `Se coloca allí una carga de prueba de ${textoCarga(qPrueba)}. ¿Cuál es su energía potencial eléctrica, en nanojulios? Da el resultado con su signo.`;
      } else {
        datos = { cargas: [{ x: 0, y: 0, q: q1 }], punto: p, magnitud: 'modulo-E' };
        pregunta = '¿Cuál es el módulo del campo eléctrico en ese punto?';
      }
      const r = resolverCaso(datos);
      const redondeo = r.ok && exigeRedondeo(r.valor, 2) ? ' Redondea a dos decimales.' : '';
      return construirEjercicio(
        semilla,
        `${describirCargas(datos.cargas)}. Considera el punto ${textoPunto(p)}, en metros. ${pregunta} ${K_TEXTO}${redondeo}`,
        datos,
        r,
      );
    }
  }

  const r = resolverCaso(datos);
  const redondeo = r.ok && exigeRedondeo(r.valor, 2) ? ' Redondea a dos decimales.' : '';
  return construirEjercicio(
    semilla,
    `${describirCargas(datos.cargas)}, con las coordenadas en metros. ${pregunta} ${K_TEXTO}${redondeo}`,
    datos,
    r,
  );
}

function construirEjercicio(semilla: number, enunciado: string, datos: DatosCaso, r: Resolucion): Ejercicio {
  const unidad = unidadDe(datos.magnitud);
  return {
    semilla,
    enunciado,
    datos,
    respuesta: r.ok ? redondear(r.valor, 2) : NaN,
    etiquetaRespuesta: etiquetaDe(datos.magnitud),
    unidad,
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, 2) : false,
    pasos: r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'],
  };
}

