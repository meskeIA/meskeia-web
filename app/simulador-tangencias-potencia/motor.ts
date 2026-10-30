/**
 * Motor de potencia y tangencias — geometría pura, sin React ni DOM.
 *
 * Vive fuera de la vista porque el build compila la página sin comprobar si la geometría está
 * bien: una tangente que no toca o un eje radical desplazado se pintarían igual de bonitos. Lo
 * prueba `tests/apps/simulador-tangencias-potencia.spec.ts` con casos resueltos a mano.
 *
 * QUÉ HAY AQUÍ
 *   1. Primitivas (vectores, intersecciones, circuncentro).
 *   2. Magnitudes del tema: potencia, longitud de tangente, eje radical, tangentes comunes.
 *   3. Cinco construcciones con regla y compás, cada una como una lista de PASOS con sus trazos,
 *      para que la vista dibuje hasta el paso que elija el alumno. Las magnitudes que enseña el
 *      panel salen de las mismas funciones que corrigen los casos (`casos.ts` las importa).
 *
 * CONVENIOS (los que deciden un número)
 *   · Potencia de P respecto de una circunferencia de centro O y radio r: d² − r², con d = OP.
 *     Positiva fuera, cero sobre la circunferencia, negativa dentro. Es lo mismo que el producto
 *     CON SIGNO PA · PB de cualquier secante (negativo cuando P separa a A de B).
 *   · Coordenadas de pantalla: la y crece hacia abajo. Ninguna magnitud depende de eso.
 *   · Nada lanza: lo imposible devuelve NaN, null o un aviso, que la vista pinta.
 */

// ============================================
// 1. PRIMITIVAS
// ============================================

export interface Punto {
  x: number;
  y: number;
}

export interface Circunferencia {
  centro: Punto;
  radio: number;
}

/** Holgura para decidir «sobre» y «tangente»: los datos se mueven de 0,5 en 0,5. */
export const TOLERANCIA_POSICION = 1e-6;

export function sumar(a: Punto, b: Punto): Punto {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function restar(a: Punto, b: Punto): Punto {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function escalar(a: Punto, k: number): Punto {
  return { x: a.x * k, y: a.y * k };
}

export function productoEscalar(a: Punto, b: Punto): number {
  return a.x * b.x + a.y * b.y;
}

/** Componente z del producto vectorial: su signo dice a qué lado de `a` queda `b`. */
export function productoCruz(a: Punto, b: Punto): number {
  return a.x * b.y - a.y * b.x;
}

export function modulo(a: Punto): number {
  return Math.hypot(a.x, a.y);
}

export function distancia(a: Punto, b: Punto): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function puntoMedio(a: Punto, b: Punto): Punto {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function unitario(a: Punto): Punto | null {
  const m = modulo(a);
  return m < TOLERANCIA_POSICION ? null : { x: a.x / m, y: a.y / m };
}

/** El vector girado 90°. */
export function perpendicular(a: Punto): Punto {
  return { x: -a.y, y: a.x };
}

/** Intersección de la recta p + t·dir con la circunferencia, ordenada por t. */
export function cortesRectaCircunferencia(p: Punto, dir: Punto, c: Circunferencia): Punto[] {
  const u = unitario(dir);
  if (!u || !(c.radio > 0)) return [];
  const w = restar(p, c.centro);
  const b = productoEscalar(u, w);
  const discriminante = b * b - (productoEscalar(w, w) - c.radio * c.radio);
  if (discriminante < -TOLERANCIA_POSICION) return [];
  if (discriminante <= TOLERANCIA_POSICION) return [sumar(p, escalar(u, -b))];
  const raiz = Math.sqrt(discriminante);
  return [sumar(p, escalar(u, -b - raiz)), sumar(p, escalar(u, -b + raiz))];
}

/** Puntos de corte de dos circunferencias (0, 1 si son tangentes o 2). */
export function cortesCircunferencias(c1: Circunferencia, c2: Circunferencia): Punto[] {
  const d = distancia(c1.centro, c2.centro);
  if (d < TOLERANCIA_POSICION) return [];
  if (d > c1.radio + c2.radio + TOLERANCIA_POSICION) return [];
  if (d < Math.abs(c1.radio - c2.radio) - TOLERANCIA_POSICION) return [];
  const u = escalar(restar(c2.centro, c1.centro), 1 / d);
  // Distancia desde O₁ hasta la cuerda común: es la del eje radical.
  const a = (d * d + c1.radio * c1.radio - c2.radio * c2.radio) / (2 * d);
  const h2 = c1.radio * c1.radio - a * a;
  const base = sumar(c1.centro, escalar(u, a));
  if (h2 <= TOLERANCIA_POSICION) return [base];
  const h = Math.sqrt(h2);
  const v = perpendicular(u);
  return [sumar(base, escalar(v, h)), sumar(base, escalar(v, -h))];
}

/** Corte de dos rectas p + t·d. null si son paralelas. */
export function corteRectas(p1: Punto, d1: Punto, p2: Punto, d2: Punto): Punto | null {
  const denominador = productoCruz(d1, d2);
  if (Math.abs(denominador) < 1e-12 * Math.max(1, modulo(d1) * modulo(d2))) return null;
  const t = productoCruz(restar(p2, p1), d2) / denominador;
  return sumar(p1, escalar(d1, t));
}

/** Centro de la circunferencia que pasa por tres puntos. null si están alineados. */
export function circuncentro(a: Punto, b: Punto, c: Punto): Punto | null {
  return corteRectas(puntoMedio(a, b), perpendicular(restar(b, a)), puntoMedio(a, c), perpendicular(restar(c, a)));
}

/** Pie de la perpendicular desde p a la recta a + t·dir. */
export function proyectarSobreRecta(p: Punto, a: Punto, dir: Punto): Punto {
  const u = unitario(dir);
  if (!u) return a;
  return sumar(a, escalar(u, productoEscalar(restar(p, a), u)));
}

/** Distancia CON SIGNO de p a la recta a + t·dir (el signo dice el lado). */
export function distanciaConSigno(p: Punto, a: Punto, dir: Punto): number {
  const m = modulo(dir);
  return m < TOLERANCIA_POSICION ? NaN : productoCruz(dir, restar(p, a)) / m;
}

// ============================================
// 2. MAGNITUDES DEL TEMA
// ============================================

/** Potencia a partir de la distancia al centro y el radio: d² − r². */
export function potenciaDesdeDistancia(d: number, r: number): number {
  if (!Number.isFinite(d) || !Number.isFinite(r) || d < 0 || r <= 0) return NaN;
  return d * d - r * r;
}

export function potencia(p: Punto, c: Circunferencia): number {
  return potenciaDesdeDistancia(distancia(p, c.centro), c.radio);
}

export type PosicionPunto = 'exterior' | 'sobre' | 'interior';

export function posicionPunto(p: Punto, c: Circunferencia): PosicionPunto {
  const diferencia = distancia(p, c.centro) - c.radio;
  if (Math.abs(diferencia) <= TOLERANCIA_POSICION) return 'sobre';
  return diferencia > 0 ? 'exterior' : 'interior';
}

/** Longitud del segmento de tangencia PT desde un punto exterior: √(d² − r²). */
export function longitudTangente(d: number, r: number): number {
  const pot = potenciaDesdeDistancia(d, r);
  if (!Number.isFinite(pot) || pot < -TOLERANCIA_POSICION) return NaN;
  return Math.sqrt(Math.max(0, pot));
}

/** Ángulo que forman las dos tangentes desde un punto exterior, en grados: 2·arcsen(r/d). */
export function anguloEntreTangentes(d: number, r: number): number {
  if (!Number.isFinite(d) || !Number.isFinite(r) || r <= 0 || d <= r) return NaN;
  return (2 * Math.asin(r / d) * 180) / Math.PI;
}

/** Media proporcional √(a·b): la tangente desde M cuando una secante da MA y MB. */
export function mediaProporcional(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) return NaN;
  return Math.sqrt(a * b);
}

/**
 * Distancia desde el centro O₁ hasta el eje radical, medida hacia O₂: (d² + r₁² − r₂²) / (2d).
 * Sale de igualar las potencias x² − r₁² = (d − x)² − r₂².
 */
export function distanciaEjeRadical(d: number, r1: number, r2: number): number {
  if (!Number.isFinite(d) || d <= 0 || !(r1 > 0) || !(r2 > 0)) return NaN;
  return (d * d + r1 * r1 - r2 * r2) / (2 * d);
}

/** Tramo de la tangente común exterior entre los dos puntos de contacto: √(d² − (r₁ − r₂)²). */
export function tramoTangenteExterior(d: number, r1: number, r2: number): number {
  if (!Number.isFinite(d) || d < 0 || !(r1 > 0) || !(r2 > 0)) return NaN;
  const valor = d * d - (r1 - r2) * (r1 - r2);
  return valor < -TOLERANCIA_POSICION ? NaN : Math.sqrt(Math.max(0, valor));
}

/** Tramo de la tangente común interior (la que cruza entre las dos): √(d² − (r₁ + r₂)²). */
export function tramoTangenteInterior(d: number, r1: number, r2: number): number {
  if (!Number.isFinite(d) || d < 0 || !(r1 > 0) || !(r2 > 0)) return NaN;
  const valor = d * d - (r1 + r2) * (r1 + r2);
  return valor < -TOLERANCIA_POSICION ? NaN : Math.sqrt(Math.max(0, valor));
}

export type PosicionRelativa =
  | 'concentricas'
  | 'exteriores'
  | 'tangentes-exteriores'
  | 'secantes'
  | 'tangentes-interiores'
  | 'interiores';

export function posicionRelativa(c1: Circunferencia, c2: Circunferencia): PosicionRelativa {
  const d = distancia(c1.centro, c2.centro);
  const suma = c1.radio + c2.radio;
  const diferencia = Math.abs(c1.radio - c2.radio);
  if (d <= TOLERANCIA_POSICION) return 'concentricas';
  if (Math.abs(d - suma) <= TOLERANCIA_POSICION) return 'tangentes-exteriores';
  if (d > suma) return 'exteriores';
  if (Math.abs(d - diferencia) <= TOLERANCIA_POSICION) return 'tangentes-interiores';
  if (d > diferencia) return 'secantes';
  return 'interiores';
}

/** Cuántas tangentes comunes tienen dos circunferencias según su posición. */
export const NUMERO_TANGENTES_COMUNES: Record<PosicionRelativa, number> = {
  exteriores: 4,
  'tangentes-exteriores': 3,
  secantes: 2,
  'tangentes-interiores': 1,
  interiores: 0,
  concentricas: 0,
};

export const NOMBRE_POSICION_RELATIVA: Record<PosicionRelativa, string> = {
  exteriores: 'exteriores',
  'tangentes-exteriores': 'tangentes exteriores',
  secantes: 'secantes',
  'tangentes-interiores': 'tangentes interiores',
  interiores: 'una dentro de otra, sin tocarse',
  concentricas: 'concéntricas',
};

/** Puntos de tangencia desde P: la construcción del arco capaz de 90° (circunferencia de diámetro PO). */
export function puntosTangenciaDesde(p: Punto, c: Circunferencia): Punto[] {
  if (posicionPunto(p, c) !== 'exterior') return [];
  const m = puntoMedio(p, c.centro);
  return cortesCircunferencias(c, { centro: m, radio: distancia(p, c.centro) / 2 });
}

/** Eje radical como recta (punto y dirección). null si son concéntricas. */
export function ejeRadical(c1: Circunferencia, c2: Circunferencia): { punto: Punto; dir: Punto } | null {
  const d = distancia(c1.centro, c2.centro);
  const u = unitario(restar(c2.centro, c1.centro));
  if (!u) return null;
  const x = distanciaEjeRadical(d, c1.radio, c2.radio);
  return { punto: sumar(c1.centro, escalar(u, x)), dir: perpendicular(u) };
}

/** Centro radical de tres circunferencias. null si los centros están alineados (ejes paralelos). */
export function centroRadical(c1: Circunferencia, c2: Circunferencia, c3: Circunferencia): Punto | null {
  const e12 = ejeRadical(c1, c2);
  const e13 = ejeRadical(c1, c3);
  if (!e12 || !e13) return null;
  return corteRectas(e12.punto, e12.dir, e13.punto, e13.dir);
}

// ============================================
// 3. CONSTRUCCIONES PASO A PASO
// ============================================

/** auxiliar = trazo de compás que se borra · construccion = líneas de apoyo · resultado = la solución. */
export type EstiloTrazo = 'auxiliar' | 'construccion' | 'resultado';

export type Trazo =
  | { tipo: 'punto'; p: Punto; estilo: EstiloTrazo; etiqueta?: string }
  | { tipo: 'segmento'; a: Punto; b: Punto; estilo: EstiloTrazo; etiqueta?: string }
  | { tipo: 'recta'; p: Punto; dir: Punto; estilo: EstiloTrazo; etiqueta?: string }
  | { tipo: 'circunferencia'; c: Circunferencia; estilo: EstiloTrazo; etiqueta?: string };

export interface PasoConstruccion {
  titulo: string;
  texto: string;
  trazos: Trazo[];
}

export interface Medida {
  etiqueta: string;
  valor: number;
  unidad: string;
  /** Decimales con que se enseña. Por defecto, 2. */
  decimales?: number;
}

export interface Construccion {
  pasos: PasoConstruccion[];
  medidas: Medida[];
  /** Por qué la construcción se detiene o cambia (punto interior, concéntricas…). */
  aviso: string | null;
  soluciones: number;
}

/** Deja la recta lista para pintar aunque `dir` no sea unitaria. */
function recta(p: Punto, dir: Punto, estilo: EstiloTrazo, etiqueta?: string): Trazo {
  return { tipo: 'recta', p, dir: unitario(dir) ?? { x: 1, y: 0 }, estilo, etiqueta };
}

function punto(p: Punto, etiqueta: string, estilo: EstiloTrazo = 'construccion'): Trazo {
  return { tipo: 'punto', p, estilo, etiqueta };
}

// ── 3.1 Potencia de un punto ────────────────────────────────

/**
 * P es el punto; Q orienta una secante cualquiera que pasa por P. Lo que se enseña es que
 * PA · PB no depende de por dónde pase la secante: siempre es la potencia.
 */
export function construirPotencia(c: Circunferencia, p: Punto, q: Punto): Construccion {
  const O = c.centro;
  const d = distancia(p, O);
  const pot = potencia(p, c);
  const posicion = posicionPunto(p, c);
  const medidas: Medida[] = [
    { etiqueta: 'Distancia OP = d', valor: d, unidad: 'cm' },
    { etiqueta: 'Radio r', valor: c.radio, unidad: 'cm' },
    { etiqueta: 'Potencia d² − r²', valor: pot, unidad: 'cm²' },
  ];
  const pasos: PasoConstruccion[] = [
    {
      titulo: 'Une P con el centro O',
      texto: `El segmento OP mide d. La potencia de P solo depende de d y del radio: d² − r². Aquí P es ${
        posicion === 'exterior' ? 'exterior (potencia positiva)' : posicion === 'interior' ? 'interior (potencia negativa)' : 'un punto de la circunferencia (potencia 0)'
      }.`,
      trazos: [{ tipo: 'segmento', a: O, b: p, estilo: 'construccion', etiqueta: 'd' }],
    },
  ];

  const dirSecante = restar(q, p);
  const cortes = unitario(dirSecante) ? cortesRectaCircunferencia(p, dirSecante, c) : [];
  if (cortes.length === 2) {
    const [A, B] = cortes;
    const pa = distancia(p, A);
    const pb = distancia(p, B);
    // Con signo: si P queda entre A y B, los vectores PA y PB van en sentidos opuestos.
    const signo = productoEscalar(restar(A, p), restar(B, p)) < 0 ? -1 : 1;
    medidas.push(
      { etiqueta: 'PA', valor: pa, unidad: 'cm' },
      { etiqueta: 'PB', valor: pb, unidad: 'cm' },
      { etiqueta: 'PA · PB (con signo)', valor: signo * pa * pb, unidad: 'cm²' },
    );
    pasos.push({
      titulo: 'Traza una secante cualquiera por P',
      texto:
        'Corta a la circunferencia en A y B. Mueve el punto Q para girarla: PA y PB cambian, pero su producto no, y coincide con la potencia. Si P está dentro, P queda entre A y B y el producto lleva signo menos.',
      trazos: [
        recta(p, dirSecante, 'construccion'),
        punto(A, 'A', 'resultado'),
        punto(B, 'B', 'resultado'),
      ],
    });
  } else {
    pasos.push({
      titulo: 'Traza una secante cualquiera por P',
      texto: 'Esta recta no corta a la circunferencia: mueve el punto Q para que la atraviese y aparezcan A y B.',
      trazos: [recta(p, dirSecante, 'construccion')],
    });
  }

  if (posicion === 'exterior') {
    const M = puntoMedio(p, O);
    const tangencias = puntosTangenciaDesde(p, c);
    const pt = longitudTangente(d, c.radio);
    medidas.push({ etiqueta: 'Tangente PT = √potencia', valor: pt, unidad: 'cm' });
    if (tangencias.length > 0) {
      const T = tangencias[0];
      pasos.push(
        {
          titulo: 'Busca el punto de tangencia',
          texto: 'Halla el punto medio M de OP y traza el arco de centro M que pasa por O y por P. Donde corta a la circunferencia está T: el ángulo OTP es recto (arco capaz de 90°).',
          trazos: [
            punto(M, 'M'),
            { tipo: 'circunferencia', c: { centro: M, radio: d / 2 }, estilo: 'auxiliar' },
            punto(T, 'T', 'resultado'),
            { tipo: 'segmento', a: O, b: T, estilo: 'construccion' },
          ],
        },
        {
          titulo: 'La tangente mide la raíz de la potencia',
          texto: 'El triángulo OTP es rectángulo en T, así que PT² = d² − r²: el cuadrado de la tangente ES la potencia. Por eso PA · PB = PT² para cualquier secante.',
          trazos: [{ tipo: 'segmento', a: p, b: T, estilo: 'resultado', etiqueta: 'PT' }],
        },
      );
    }
  } else if (posicion === 'interior') {
    const u = unitario(restar(p, O));
    const dirCuerda = u ? perpendicular(u) : { x: 1, y: 0 };
    const extremos = cortesRectaCircunferencia(p, dirCuerda, c);
    const semicuerda = Math.sqrt(Math.max(0, -pot));
    medidas.push({ etiqueta: 'Semicuerda mínima √(r² − d²)', valor: semicuerda, unidad: 'cm' });
    if (extremos.length === 2) {
      pasos.push({
        titulo: 'La cuerda perpendicular a OP',
        texto: 'Dentro no hay tangentes. Su papel lo hace la cuerda perpendicular a OP por P, que P parte en dos mitades iguales: cada mitad al cuadrado, con signo menos, es la potencia.',
        trazos: [
          { tipo: 'segmento', a: extremos[0], b: extremos[1], estilo: 'resultado' },
          punto(extremos[0], 'E', 'resultado'),
          punto(extremos[1], 'F', 'resultado'),
        ],
      });
    }
  } else {
    pasos.push({
      titulo: 'P está sobre la circunferencia',
      texto: 'Su potencia es 0: uno de los dos cortes de cualquier secante es el propio P. Por P pasa una sola tangente, perpendicular al radio OP.',
      trazos: [recta(p, perpendicular(restar(p, O)), 'resultado')],
    });
  }

  return { pasos, medidas, aviso: null, soluciones: posicion === 'exterior' ? 2 : posicion === 'sobre' ? 1 : 0 };
}

// ── 3.2 Eje radical y centro radical ────────────────────────

/** Busca una circunferencia auxiliar con centro fuera de la línea de centros que corte a las dos. */
export function circunferenciaAuxiliarQueCorte(c1: Circunferencia, c2: Circunferencia): Circunferencia | null {
  const d = distancia(c1.centro, c2.centro);
  const u = unitario(restar(c2.centro, c1.centro));
  if (!u) return null;
  const v = perpendicular(u);
  const M = puntoMedio(c1.centro, c2.centro);
  const escala = Math.max(d, c1.radio, c2.radio);
  // Primero las auxiliares pequeñas y cercanas: son las que caben en el lienzo.
  for (const factor of [0.6, 0.9, 0.4, 1.3, 1.8, 2.5]) {
    for (const lado of [1, -1]) {
      const Q = sumar(M, escalar(v, lado * factor * escala));
      const d1 = distancia(Q, c1.centro);
      const d2 = distancia(Q, c2.centro);
      // R corta a cada una si |dᵢ − rᵢ| < R < dᵢ + rᵢ.
      const minimo = Math.max(Math.abs(d1 - c1.radio), Math.abs(d2 - c2.radio));
      const maximo = Math.min(d1 + c1.radio, d2 + c2.radio);
      if (maximo - minimo > 0.2) return { centro: Q, radio: (minimo + maximo) / 2 };
    }
  }
  return null;
}

export function construirEjeRadical(c1: Circunferencia, c2: Circunferencia, c3: Circunferencia | null): Construccion {
  const O1 = c1.centro;
  const O2 = c2.centro;
  const d = distancia(O1, O2);
  const posicion = posicionRelativa(c1, c2);
  const medidas: Medida[] = [
    { etiqueta: 'Distancia entre centros d', valor: d, unidad: 'cm' },
  ];
  if (posicion === 'concentricas') {
    return {
      pasos: [],
      medidas,
      aviso: 'Dos circunferencias concéntricas no tienen eje radical: ningún punto tiene la misma potencia respecto de las dos. Separa los centros.',
      soluciones: 0,
    };
  }
  const eje = ejeRadical(c1, c2);
  const x = distanciaEjeRadical(d, c1.radio, c2.radio);
  medidas.push({ etiqueta: 'Del centro O₁ al eje', valor: x, unidad: 'cm' });
  const dirCentros = restar(O2, O1);
  const pasos: PasoConstruccion[] = [
    {
      titulo: 'Une los centros O₁ y O₂',
      texto: 'El eje radical es siempre perpendicular a la línea de centros. Solo falta encontrar un punto suyo.',
      trazos: [recta(O1, dirCentros, 'construccion')],
    },
  ];

  if (!eje) return { pasos, medidas, aviso: null, soluciones: 0 };

  if (posicion === 'secantes') {
    const cortes = cortesCircunferencias(c1, c2);
    pasos.push({
      titulo: 'Las circunferencias se cortan: une los puntos de corte',
      texto: 'Cada punto de corte está sobre las dos circunferencias, así que su potencia es 0 respecto de ambas. La recta que los une es el eje radical (la cuerda común).',
      trazos: [
        ...cortes.map((p, i) => punto(p, i === 0 ? 'I₁' : 'I₂', 'resultado')),
        recta(eje.punto, eje.dir, 'resultado', 'eje'),
      ],
    });
  } else if (posicion === 'tangentes-exteriores' || posicion === 'tangentes-interiores') {
    pasos.push({
      titulo: 'Son tangentes: el eje es la tangente común',
      texto: 'El punto de contacto tiene potencia 0 respecto de las dos. El eje radical es la recta tangente común en ese punto, perpendicular a la línea de centros.',
      trazos: [punto(eje.punto, 'T', 'resultado'), recta(eje.punto, eje.dir, 'resultado', 'eje')],
    });
  } else {
    const auxiliar = circunferenciaAuxiliarQueCorte(c1, c2);
    if (auxiliar) {
      const cortes1 = cortesCircunferencias(auxiliar, c1);
      const cortes2 = cortesCircunferencias(auxiliar, c2);
      const e1 = ejeRadical(auxiliar, c1);
      const e2 = ejeRadical(auxiliar, c2);
      const R = e1 && e2 ? corteRectas(e1.punto, e1.dir, e2.punto, e2.dir) : null;
      pasos.push({
        titulo: 'Traza una circunferencia auxiliar que corte a las dos',
        texto: 'Cualquiera sirve, con tal de que corte a ambas y su centro no esté en la línea de centros.',
        trazos: [{ tipo: 'circunferencia', c: auxiliar, estilo: 'auxiliar' }],
      });
      if (e1 && e2 && cortes1.length === 2 && cortes2.length === 2) {
        pasos.push({
          titulo: 'Une los puntos de corte con cada una',
          texto: 'Salen dos cuerdas comunes: la de la auxiliar con la primera y la de la auxiliar con la segunda. Cada una es un eje radical.',
          trazos: [
            ...cortes1.map((p) => punto(p, '')),
            ...cortes2.map((p) => punto(p, '')),
            recta(e1.punto, e1.dir, 'construccion'),
            recta(e2.punto, e2.dir, 'construccion'),
          ],
        });
      }
      if (R) {
        pasos.push(
          {
            titulo: 'Las dos cuerdas se cortan en R',
            texto: 'R tiene la misma potencia respecto de la auxiliar y de la primera, y respecto de la auxiliar y de la segunda: luego también la misma respecto de las dos dadas. R es un punto del eje.',
            trazos: [punto(R, 'R', 'resultado')],
          },
          {
            titulo: 'Perpendicular a O₁O₂ por R: el eje radical',
            texto: 'Todos sus puntos tienen la misma potencia respecto de las dos circunferencias. Si están fuera de ellas, las tangentes trazadas desde cualquier punto del eje miden lo mismo.',
            trazos: [recta(eje.punto, eje.dir, 'resultado', 'eje')],
          },
        );
      }
    } else {
      pasos.push({
        titulo: 'El eje radical',
        texto: 'Perpendicular a la línea de centros, a la distancia (d² + r₁² − r₂²) / 2d del centro O₁.',
        trazos: [recta(eje.punto, eje.dir, 'resultado', 'eje')],
      });
    }
  }

  let aviso: string | null = null;
  let soluciones = 1;
  if (c3) {
    const e13 = ejeRadical(c1, c3);
    const e23 = ejeRadical(c2, c3);
    const CR = centroRadical(c1, c2, c3);
    if (!e13 || !e23) {
      aviso = 'La tercera circunferencia es concéntrica con otra: no hay centro radical.';
    } else {
      pasos.push({
        titulo: 'Repite con la tercera circunferencia',
        texto: 'Traza el eje radical de la 1.ª con la 3.ª y el de la 2.ª con la 3.ª (por el mismo método).',
        trazos: [recta(e13.punto, e13.dir, 'construccion'), recta(e23.punto, e23.dir, 'construccion')],
      });
      if (CR) {
        const potCR = potencia(CR, c1);
        medidas.push({ etiqueta: 'Potencia del centro radical', valor: potCR, unidad: 'cm²' });
        const trazos: Trazo[] = [punto(CR, 'CR', 'resultado')];
        let texto = 'Los tres ejes se cortan en un mismo punto, el centro radical: tiene la misma potencia respecto de las tres circunferencias.';
        if (potCR > TOLERANCIA_POSICION) {
          const radioOrtogonal = Math.sqrt(potCR);
          medidas.push({ etiqueta: 'Radio de la ortogonal (tangente desde CR)', valor: radioOrtogonal, unidad: 'cm' });
          trazos.push({ tipo: 'circunferencia', c: { centro: CR, radio: radioOrtogonal }, estilo: 'resultado' });
          texto += ' Como es exterior a las tres, las seis tangentes desde CR miden lo mismo: la circunferencia de centro CR y ese radio corta a las tres en ángulo recto (ortogonal).';
        }
        pasos.push({ titulo: 'El centro radical CR', texto, trazos });
      } else {
        aviso = 'Con los tres centros alineados, los tres ejes son paralelos y no hay centro radical. Saca un centro de la línea.';
        soluciones = 0;
      }
    }
  }

  return { pasos, medidas, aviso, soluciones };
}

// ── 3.3 Rectas tangentes desde un punto ─────────────────────

export function construirTangentesDesdePunto(c: Circunferencia, p: Punto): Construccion {
  const O = c.centro;
  const d = distancia(p, O);
  const posicion = posicionPunto(p, c);
  const medidas: Medida[] = [
    { etiqueta: 'Distancia OP = d', valor: d, unidad: 'cm' },
    { etiqueta: 'Radio r', valor: c.radio, unidad: 'cm' },
  ];
  if (posicion === 'interior') {
    return {
      pasos: [],
      medidas,
      aviso: 'P está dentro de la circunferencia: cualquier recta que pase por P la corta en dos puntos, así que no hay tangentes. Sácalo fuera.',
      soluciones: 0,
    };
  }
  if (posicion === 'sobre') {
    return {
      pasos: [
        {
          titulo: 'Une P con el centro O',
          texto: 'P está sobre la circunferencia, así que OP es un radio.',
          trazos: [{ tipo: 'segmento', a: O, b: p, estilo: 'construccion' }],
        },
        {
          titulo: 'Perpendicular al radio por P',
          texto: 'Hay una sola tangente: la perpendicular al radio OP en P.',
          trazos: [recta(p, perpendicular(restar(p, O)), 'resultado')],
        },
      ],
      medidas,
      aviso: null,
      soluciones: 1,
    };
  }
  const M = puntoMedio(p, O);
  const tangencias = puntosTangenciaDesde(p, c);
  medidas.push(
    { etiqueta: 'Tangente PT = √(d² − r²)', valor: longitudTangente(d, c.radio), unidad: 'cm' },
    { etiqueta: 'Ángulo entre las tangentes', valor: anguloEntreTangentes(d, c.radio), unidad: '°', decimales: 1 },
  );
  const pasos: PasoConstruccion[] = [
    {
      titulo: 'Une P con el centro O',
      texto: 'Es el segmento que vas a usar como diámetro.',
      trazos: [{ tipo: 'segmento', a: O, b: p, estilo: 'construccion' }],
    },
    {
      titulo: 'Traza la mediatriz de OP: punto medio M',
      texto: 'Con el compás, dos arcos de igual radio desde O y desde P; la recta que une sus cortes es la mediatriz y corta a OP en su punto medio M.',
      trazos: [recta(M, perpendicular(restar(p, O)), 'auxiliar'), punto(M, 'M')],
    },
    {
      titulo: 'Arco de centro M y radio MO',
      texto: 'Pasa por O y por P. Corta a la circunferencia en T₁ y T₂: desde ellos, el diámetro OP se ve en ángulo recto (arco capaz de 90°), así que OT ⊥ PT.',
      trazos: [
        { tipo: 'circunferencia', c: { centro: M, radio: d / 2 }, estilo: 'auxiliar' },
        ...tangencias.map((t, i) => punto(t, i === 0 ? 'T₁' : 'T₂', 'resultado')),
      ],
    },
    {
      titulo: 'Une P con T₁ y T₂: las dos tangentes',
      texto: 'Cada tangente es perpendicular al radio en su punto de contacto. Los dos tramos PT₁ y PT₂ miden lo mismo: la raíz de la potencia de P.',
      trazos: [
        ...tangencias.map((t): Trazo => ({ tipo: 'segmento', a: O, b: t, estilo: 'construccion' })),
        ...tangencias.map((t) => recta(p, restar(t, p), 'resultado')),
      ],
    },
  ];
  return { pasos, medidas, aviso: null, soluciones: tangencias.length };
}

// ── 3.4 Tangentes comunes a dos circunferencias ─────────────

export type FamiliaTangentes = 'exteriores' | 'interiores';

export interface TangenteComun {
  t1: Punto;
  t2: Punto;
}

/**
 * Las tangentes comunes de una familia, con sus puntos de contacto en cada circunferencia.
 * Se obtienen con la MISMA construcción que enseña la vista (auxiliar de radio R ∓ r).
 */
export function tangentesComunes(c1: Circunferencia, c2: Circunferencia, familia: FamiliaTangentes): TangenteComun[] {
  const d = distancia(c1.centro, c2.centro);
  if (d <= TOLERANCIA_POSICION) return [];
  const u = escalar(restar(c2.centro, c1.centro), 1 / d);
  const v = perpendicular(u);
  const radioAux = familia === 'exteriores' ? c1.radio - c2.radio : c1.radio + c2.radio;
  const coseno = radioAux / d;
  if (Math.abs(coseno) > 1 + TOLERANCIA_POSICION) return [];
  const seno = Math.sqrt(Math.max(0, 1 - coseno * coseno));
  const normales = seno <= TOLERANCIA_POSICION ? [u] : [sumar(escalar(u, coseno), escalar(v, seno)), sumar(escalar(u, coseno), escalar(v, -seno))];
  const signo2 = familia === 'exteriores' ? 1 : -1;
  return normales.map((n) => ({
    t1: sumar(c1.centro, escalar(n, c1.radio)),
    t2: sumar(c2.centro, escalar(n, signo2 * c2.radio)),
  }));
}

export function construirTangentesComunes(c1: Circunferencia, c2: Circunferencia, familia: FamiliaTangentes): Construccion {
  // La construcción parte de la MAYOR: se reordena por dentro y se rotula con los nombres del usuario.
  const mayorEsPrimera = c1.radio >= c2.radio;
  const G = mayorEsPrimera ? c1 : c2;
  const g = mayorEsPrimera ? c2 : c1;
  const nombreG = mayorEsPrimera ? 'O₁' : 'O₂';
  const nombreg = mayorEsPrimera ? 'O₂' : 'O₁';
  const d = distancia(c1.centro, c2.centro);
  const posicion = posicionRelativa(c1, c2);
  const medidas: Medida[] = [
    { etiqueta: 'Distancia entre centros d', valor: d, unidad: 'cm' },
    { etiqueta: 'Tangentes comunes en esta posición', valor: NUMERO_TANGENTES_COMUNES[posicion], unidad: '', decimales: 0 },
  ];
  const tramoExt = tramoTangenteExterior(d, c1.radio, c2.radio);
  const tramoInt = tramoTangenteInterior(d, c1.radio, c2.radio);
  if (Number.isFinite(tramoExt) && posicion !== 'concentricas') medidas.push({ etiqueta: 'Tramo exterior √(d² − (R − r)²)', valor: tramoExt, unidad: 'cm' });
  if (Number.isFinite(tramoInt)) medidas.push({ etiqueta: 'Tramo interior √(d² − (R + r)²)', valor: tramoInt, unidad: 'cm' });

  const tangentes = tangentesComunes(G, g, familia);
  const radioAux = familia === 'exteriores' ? G.radio - g.radio : G.radio + g.radio;
  const nombreFamilia = familia === 'exteriores' ? 'exteriores' : 'interiores';

  if (tangentes.length === 0) {
    const motivo =
      posicion === 'concentricas'
        ? 'Son concéntricas: no tienen ninguna tangente común.'
        : familia === 'exteriores'
          ? 'Una circunferencia está dentro de la otra: no hay tangentes exteriores.'
          : 'Las circunferencias se cortan o una está dentro de la otra: no hay tangentes interiores, que tendrían que pasar ENTRE las dos.';
    return { pasos: [], medidas, aviso: motivo, soluciones: 0 };
  }

  const pasos: PasoConstruccion[] = [
    {
      titulo: 'Une los centros',
      texto: `Llama R al radio de la mayor (centro ${nombreG}) y r al de la menor (centro ${nombreg}).`,
      trazos: [{ tipo: 'segmento', a: G.centro, b: g.centro, estilo: 'construccion' }],
    },
  ];

  if (familia === 'exteriores' && Math.abs(radioAux) <= TOLERANCIA_POSICION) {
    pasos.push({
      titulo: 'Radios iguales: perpendiculares a la línea de centros',
      texto: 'Con R = r las tangentes exteriores son paralelas a la línea de centros. Traza por cada centro la perpendicular a esa línea; corta a cada circunferencia en sus puntos de tangencia.',
      trazos: tangentes.flatMap((t) => [
        { tipo: 'segmento' as const, a: G.centro, b: t.t1, estilo: 'construccion' as const },
        { tipo: 'segmento' as const, a: g.centro, b: t.t2, estilo: 'construccion' as const },
        punto(t.t1, '', 'resultado'),
        punto(t.t2, '', 'resultado'),
      ]),
    });
  } else if (tangentes.length === 1) {
    pasos.push({
      titulo: 'Son tangentes: una sola recta',
      texto: `En esta posición las dos tangentes ${nombreFamilia} se funden en una: la tangente común en el punto de contacto.`,
      trazos: [punto(tangentes[0].t1, 'T', 'resultado')],
    });
  } else {
    const auxiliar: Circunferencia = { centro: G.centro, radio: radioAux };
    const A = puntosTangenciaDesde(g.centro, auxiliar);
    const M = puntoMedio(G.centro, g.centro);
    pasos.push(
      {
        titulo: familia === 'exteriores' ? 'Auxiliar de radio R − r' : 'Auxiliar de radio R + r',
        texto:
          familia === 'exteriores'
            ? `Concéntrica con la mayor, con radio la DIFERENCIA de radios. Es como si encogieras las dos en r: la menor se queda en su centro ${nombreg}.`
            : `Concéntrica con la mayor, con radio la SUMA de radios. Es como si la mayor creciera en r y la menor se quedara en su centro ${nombreg}.`,
        trazos: [{ tipo: 'circunferencia', c: auxiliar, estilo: 'auxiliar' }],
      },
      {
        titulo: `Tangentes desde ${nombreg} a la auxiliar`,
        texto: `Mediatriz del segmento de centros (punto medio M) y arco de centro M que pase por los dos centros: corta a la auxiliar en A₁ y A₂.`,
        trazos: [
          punto(M, 'M'),
          { tipo: 'circunferencia', c: { centro: M, radio: d / 2 }, estilo: 'auxiliar' },
          ...A.map((a, i) => punto(a, i === 0 ? 'A₁' : 'A₂')),
        ],
      },
      {
        titulo: 'Lleva los puntos a las circunferencias dadas',
        texto:
          familia === 'exteriores'
            ? `Prolonga ${nombreG}A hasta la mayor: es T, un punto de tangencia. Por ${nombreg} traza el radio paralelo a ${nombreG}T y en el MISMO sentido: su extremo es el punto de tangencia en la menor.`
            : `${nombreG}A corta a la mayor en T, un punto de tangencia. Por ${nombreg} traza el radio paralelo a ${nombreG}T pero en sentido CONTRARIO: su extremo es el punto de tangencia en la menor.`,
        // En las interiores el punto A de la auxiliar queda MÁS ALLÁ de T: el radio se prolonga hasta él.
        trazos: tangentes.flatMap((t) => [
          {
            tipo: 'segmento' as const,
            a: G.centro,
            b: familia === 'exteriores' ? t.t1 : sumar(G.centro, escalar(restar(t.t1, G.centro), radioAux / G.radio)),
            estilo: 'construccion' as const,
          },
          { tipo: 'segmento' as const, a: g.centro, b: t.t2, estilo: 'construccion' as const },
          punto(t.t1, '', 'resultado'),
          punto(t.t2, '', 'resultado'),
        ]),
      },
    );
  }

  pasos.push({
    titulo: `Las tangentes ${nombreFamilia}`,
    texto:
      familia === 'exteriores'
        ? 'Une cada pareja de puntos de tangencia. Las exteriores dejan las dos circunferencias al mismo lado: es el trazado de una correa abierta entre dos poleas.'
        : 'Une cada pareja de puntos de tangencia. Las interiores pasan entre las dos circunferencias y se cruzan en la línea de centros: es el trazado de una correa cruzada.',
    trazos: tangentes.map((t) =>
      distancia(t.t1, t.t2) <= TOLERANCIA_POSICION
        ? recta(t.t1, perpendicular(restar(t.t1, G.centro)), 'resultado')
        : recta(t.t1, restar(t.t2, t.t1), 'resultado'),
    ),
  });

  return { pasos, medidas, aviso: null, soluciones: tangentes.length };
}

// ── 3.5 Circunferencias tangentes por potencia (problemas de Apolonio) ─

export interface SolucionApolonio {
  centro: Punto;
  radio: number;
  tangencia: Punto;
}

/**
 * PPR — circunferencias que pasan por A y B y son tangentes a la recta r (que pasa por L1 y L2).
 * Método de la potencia: AB corta a r en el centro radical M, y MT² = MA · MB.
 */
export function construirPPR(a: Punto, b: Punto, l1: Punto, l2: Punto): Construccion & { circunferencias: SolucionApolonio[] } {
  const dirR = restar(l2, l1);
  const medidas: Medida[] = [];
  const vacio = (aviso: string) => ({ pasos: [], medidas, aviso, soluciones: 0, circunferencias: [] });
  if (!unitario(dirR)) return vacio('Separa los dos puntos que definen la recta r.');
  if (distancia(a, b) <= TOLERANCIA_POSICION) return vacio('A y B coinciden: separa los dos puntos.');
  const ladoA = distanciaConSigno(a, l1, dirR);
  const ladoB = distanciaConSigno(b, l1, dirR);
  if (Math.abs(ladoA) <= TOLERANCIA_POSICION && Math.abs(ladoB) <= TOLERANCIA_POSICION) {
    return vacio('A y B están los dos sobre la recta r: una circunferencia no puede cortarla en dos puntos y ser tangente a la vez.');
  }
  if (ladoA * ladoB < -TOLERANCIA_POSICION) {
    return vacio('A y B están a distinto lado de r: cualquier circunferencia que pase por los dos cruza la recta, así que no hay solución. Ponlos en el mismo lado.');
  }

  const mediatriz = { p: puntoMedio(a, b), dir: perpendicular(restar(b, a)) };
  const pasos: PasoConstruccion[] = [
    {
      titulo: 'Mediatriz de AB',
      texto: 'Toda circunferencia que pase por A y por B tiene su centro en la mediatriz del segmento AB.',
      trazos: [{ tipo: 'segmento', a, b, estilo: 'construccion' }, recta(mediatriz.p, mediatriz.dir, 'construccion')],
    },
  ];

  const soluciones: SolucionApolonio[] = [];
  // El centro equidista de A, B y T: el circuncentro. Con AB paralela a r la mediatriz ES la
  // perpendicular por T, y cortarlas daría null; el circuncentro no tiene ese problema.
  const centroDesdeTangencia = (t: Punto): SolucionApolonio | null => {
    const centro =
      distancia(t, a) <= TOLERANCIA_POSICION || distancia(t, b) <= TOLERANCIA_POSICION
        ? corteRectas(mediatriz.p, mediatriz.dir, t, perpendicular(dirR))
        : circuncentro(a, b, t);
    return centro ? { centro, radio: distancia(centro, t), tangencia: t } : null;
  };

  // Caso particular: uno de los dos puntos ya está sobre r → ese punto es el de tangencia.
  const enRecta = Math.abs(ladoA) <= TOLERANCIA_POSICION ? a : Math.abs(ladoB) <= TOLERANCIA_POSICION ? b : null;
  const ab = restar(b, a);
  if (enRecta) {
    const s = centroDesdeTangencia(enRecta);
    if (s) soluciones.push(s);
    pasos.push({
      titulo: 'Un punto está sobre r: es el de tangencia',
      texto: 'Si la circunferencia pasa por un punto de r y es tangente a r, la toca justo ahí. Su centro está en la perpendicular a r por ese punto y en la mediatriz de AB: hay una sola solución.',
      trazos: [recta(enRecta, perpendicular(dirR), 'construccion'), ...soluciones.map((s) => punto(s.centro, 'O₁', 'resultado'))],
    });
  } else if (Math.abs(productoCruz(dirR, ab)) <= 1e-9 * modulo(dirR) * modulo(ab)) {
    // AB paralela a r: el centro radical se va al infinito y el punto de tangencia es el pie de la mediatriz.
    const T = proyectarSobreRecta(mediatriz.p, l1, dirR);
    const s = centroDesdeTangencia(T);
    if (s) soluciones.push(s);
    pasos.push({
      titulo: 'AB es paralela a r: una sola solución',
      texto: 'La recta AB no corta a r (el centro radical se va al infinito). Por simetría, el punto de tangencia T es donde la mediatriz de AB corta a r.',
      trazos: [punto(T, 'T', 'resultado'), ...soluciones.map((s) => punto(s.centro, 'O₁', 'resultado'))],
    });
  } else {
    const M = corteRectas(a, ab, l1, dirR);
    if (!M) return vacio('No se ha podido hallar el corte de AB con r.');
    const ma = distancia(M, a);
    const mb = distancia(M, b);
    const mt = mediaProporcional(ma, mb);
    medidas.push(
      { etiqueta: 'MA', valor: ma, unidad: 'cm' },
      { etiqueta: 'MB', valor: mb, unidad: 'cm' },
      { etiqueta: 'MT = √(MA · MB)', valor: mt, unidad: 'cm' },
    );
    // Auxiliar cualquiera por A y B: centro en la mediatriz, desplazado medio AB.
    const u = unitario(mediatriz.dir) ?? { x: 0, y: 1 };
    const centroAux = sumar(mediatriz.p, escalar(u, distancia(a, b) * 0.6));
    const auxiliar: Circunferencia = { centro: centroAux, radio: distancia(centroAux, a) };
    const tangAux = puntosTangenciaDesde(M, auxiliar);
    const uR = unitario(dirR) ?? { x: 1, y: 0 };
    const T1 = sumar(M, escalar(uR, mt));
    const T2 = sumar(M, escalar(uR, -mt));
    for (const t of [T1, T2]) {
      const s = centroDesdeTangencia(t);
      if (s) soluciones.push(s);
    }
    pasos.push(
      {
        titulo: 'Prolonga AB hasta cortar a r en M',
        texto: 'AB es el eje radical de TODAS las circunferencias que pasan por A y B. Por eso M, que está en él, tiene la misma potencia respecto de todas ellas: MA · MB. También respecto de la solución.',
        trazos: [recta(a, ab, 'construccion'), punto(M, 'M', 'resultado')],
      },
      {
        titulo: 'Circunferencia auxiliar por A y B y tangente desde M',
        texto: 'Traza una circunferencia cualquiera que pase por A y B (centro en la mediatriz) y la tangente desde M: su longitud MT cumple MT² = MA · MB. Es la media proporcional entre MA y MB.',
        trazos: [
          { tipo: 'circunferencia', c: auxiliar, estilo: 'auxiliar' },
          ...tangAux.slice(0, 1).map((t): Trazo => ({ tipo: 'segmento', a: M, b: t, estilo: 'construccion', etiqueta: 'MT' })),
        ],
      },
      {
        titulo: 'Lleva MT sobre r con el compás',
        texto: 'Con centro en M y radio MT, corta a r a los dos lados de M: T₁ y T₂ son los puntos de tangencia, porque en la solución el tramo de M al punto de contacto ES la tangente desde M.',
        trazos: [
          { tipo: 'circunferencia', c: { centro: M, radio: mt }, estilo: 'auxiliar' },
          punto(T1, 'T₁', 'resultado'),
          punto(T2, 'T₂', 'resultado'),
        ],
      },
      {
        titulo: 'Centros: perpendicular a r por cada Tᵢ',
        texto: 'El radio es perpendicular a la tangente en el punto de contacto. Donde esas perpendiculares cortan a la mediatriz de AB están los centros O₁ y O₂.',
        trazos: [
          recta(T1, perpendicular(dirR), 'construccion'),
          recta(T2, perpendicular(dirR), 'construccion'),
          ...soluciones.map((s, i) => punto(s.centro, i === 0 ? 'O₁' : 'O₂', 'resultado')),
        ],
      },
    );
  }

  soluciones.forEach((s, i) => medidas.push({ etiqueta: `Radio de la solución ${i + 1}`, valor: s.radio, unidad: 'cm' }));
  pasos.push({
    titulo: soluciones.length === 1 ? 'La solución' : 'Las dos soluciones',
    texto: 'Cada circunferencia pasa por A y B y toca a r en un solo punto.',
    trazos: soluciones.map((s): Trazo => ({ tipo: 'circunferencia', c: { centro: s.centro, radio: s.radio }, estilo: 'resultado' })),
  });
  return { pasos, medidas, aviso: null, soluciones: soluciones.length, circunferencias: soluciones };
}

/** Busca una circunferencia que pase por A y B (centro en su mediatriz) y corte a c en dos puntos. */
export function auxiliarPorDosPuntosQueCorte(a: Punto, b: Punto, c: Circunferencia): Circunferencia | null {
  const m = puntoMedio(a, b);
  const u = unitario(perpendicular(restar(b, a)));
  if (!u) return null;
  const escala = Math.max(distancia(a, b), distancia(m, c.centro), c.radio);
  for (const t of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.5, -2.5, 4, -4]) {
    const centro = sumar(m, escalar(u, t * escala));
    const aux: Circunferencia = { centro, radio: distancia(centro, a) };
    if (cortesCircunferencias(aux, c).length === 2 && posicionRelativa(aux, c) === 'secantes') {
      // Que la cuerda común no sea paralela a AB; si lo es, prueba otra.
      const e = ejeRadical(aux, c);
      if (e && Math.abs(productoCruz(e.dir, restar(b, a))) > 1e-6 * modulo(restar(b, a))) return aux;
    }
  }
  return null;
}

/**
 * PPC — circunferencias que pasan por A y B y son tangentes a la circunferencia c.
 * Una auxiliar por A y B corta a c; la recta AB y la cuerda común se cortan en el centro
 * radical M, y las tangentes desde M a c dan los puntos de contacto.
 */
export function construirPPC(a: Punto, b: Punto, c: Circunferencia): Construccion & { circunferencias: SolucionApolonio[] } {
  const medidas: Medida[] = [];
  const vacio = (aviso: string) => ({ pasos: [], medidas, aviso, soluciones: 0, circunferencias: [] });
  if (distancia(a, b) <= TOLERANCIA_POSICION) return vacio('A y B coinciden: separa los dos puntos.');
  const posA = posicionPunto(a, c);
  const posB = posicionPunto(b, c);
  if (posA === 'sobre' || posB === 'sobre') {
    return vacio('Un punto está sobre la circunferencia dada: es un caso particular (ese punto sería el de tangencia). Muévelo un poco para ver el caso general.');
  }
  if (posA !== posB) {
    return vacio('Un punto está dentro de la circunferencia y el otro fuera: cualquier circunferencia que pase por los dos la corta, así que no hay solución.');
  }

  const ab = restar(b, a);
  const mediatriz = { p: puntoMedio(a, b), dir: perpendicular(ab) };
  const pasos: PasoConstruccion[] = [
    {
      titulo: 'Mediatriz de AB',
      texto: 'Los centros de todas las circunferencias que pasan por A y B están en esta recta.',
      trazos: [{ tipo: 'segmento', a, b, estilo: 'construccion' }, recta(mediatriz.p, mediatriz.dir, 'construccion')],
    },
  ];
  const soluciones: SolucionApolonio[] = [];
  const solucionPor = (t: Punto): SolucionApolonio | null => {
    const centro = circuncentro(a, b, t);
    return centro ? { centro, radio: distancia(centro, t), tangencia: t } : null;
  };

  // Mediatriz de AB por el centro de c: el centro radical se va al infinito y los contactos son
  // los cortes de la mediatriz con c (simetría).
  const mediatrizPorCentro = Math.abs(distanciaConSigno(c.centro, mediatriz.p, mediatriz.dir)) <= 1e-6;
  let tangencias: Punto[];
  if (mediatrizPorCentro) {
    tangencias = cortesRectaCircunferencia(mediatriz.p, mediatriz.dir, c);
    pasos.push({
      titulo: 'Caso simétrico',
      texto: 'La mediatriz de AB pasa por el centro de la circunferencia dada: el centro radical se va al infinito y, por simetría, los puntos de tangencia son los cortes de la mediatriz con la circunferencia.',
      trazos: tangencias.map((t, i) => punto(t, i === 0 ? 'T₁' : 'T₂', 'resultado')),
    });
  } else {
    const aux = auxiliarPorDosPuntosQueCorte(a, b, c);
    const cuerda = aux ? cortesCircunferencias(aux, c) : [];
    const eje = aux ? ejeRadical(aux, c) : null;
    const M = eje ? corteRectas(a, ab, eje.punto, eje.dir) : null;
    if (!aux || !eje || !M || cuerda.length < 2) return vacio('No se ha encontrado una circunferencia auxiliar válida: mueve un poco los puntos.');
    const potM = potencia(M, c);
    tangencias = puntosTangenciaDesde(M, c);
    medidas.push(
      { etiqueta: 'Potencia de M = MA · MB', valor: potM, unidad: 'cm²' },
      { etiqueta: 'MT = √potencia', valor: Math.sqrt(Math.max(0, potM)), unidad: 'cm' },
    );
    const MO = puntoMedio(M, c.centro);
    pasos.push(
      {
        titulo: 'Circunferencia auxiliar por A y B que corte a la dada',
        texto: 'Centro en la mediatriz. Corta a la circunferencia dada en C y D.',
        trazos: [
          { tipo: 'circunferencia', c: aux, estilo: 'auxiliar' },
          punto(cuerda[0], 'C'),
          punto(cuerda[1], 'D'),
        ],
      },
      {
        titulo: 'Las rectas AB y CD se cortan en M',
        texto: 'AB es el eje radical de la auxiliar con cualquier solución; CD, el de la auxiliar con la dada. M, donde se cortan, es el centro radical: tiene la misma potencia respecto de la dada y de las soluciones.',
        trazos: [recta(a, ab, 'construccion'), recta(eje.punto, eje.dir, 'construccion'), punto(M, 'M', 'resultado')],
      },
      {
        titulo: 'Tangentes desde M a la circunferencia dada',
        texto: 'Mediatriz de MO y arco de centro su punto medio (pestaña «Desde un punto»): los cortes T₁ y T₂ son los puntos de tangencia de las soluciones.',
        trazos: [
          { tipo: 'circunferencia', c: { centro: MO, radio: distancia(M, c.centro) / 2 }, estilo: 'auxiliar' },
          ...tangencias.map((t, i) => punto(t, i === 0 ? 'T₁' : 'T₂', 'resultado')),
          ...tangencias.map((t): Trazo => ({ tipo: 'segmento', a: M, b: t, estilo: 'construccion' })),
        ],
      },
    );
  }

  for (const t of tangencias) {
    const s = solucionPor(t);
    if (s) soluciones.push(s);
  }
  if (soluciones.length === 0) {
    return { pasos, medidas, aviso: 'Desde M no salen tangentes a la circunferencia dada en esta posición: mueve A o B.', soluciones: 0, circunferencias: [] };
  }
  pasos.push(
    {
      titulo: 'Centros: recta O–Tᵢ cortando a la mediatriz',
      texto: 'Dos circunferencias tangentes tienen el punto de contacto alineado con sus centros. Une el centro O de la dada con cada Tᵢ: donde esa recta corta a la mediatriz de AB está el centro de la solución.',
      trazos: [
        ...tangencias.map((t) => recta(c.centro, restar(t, c.centro), 'construccion')),
        ...soluciones.map((s, i) => punto(s.centro, i === 0 ? 'O₁' : 'O₂', 'resultado')),
      ],
    },
    {
      titulo: soluciones.length === 1 ? 'La solución' : 'Las dos soluciones',
      texto: 'Cada una pasa por A y B y toca a la circunferencia dada en un solo punto: una por fuera y otra envolviéndola, o las dos por fuera, según dónde estén A y B.',
      trazos: soluciones.map((s): Trazo => ({ tipo: 'circunferencia', c: { centro: s.centro, radio: s.radio }, estilo: 'resultado' })),
    },
  );
  soluciones.forEach((s, i) => medidas.push({ etiqueta: `Radio de la solución ${i + 1}`, valor: s.radio, unidad: 'cm' }));
  return { pasos, medidas, aviso: null, soluciones: soluciones.length, circunferencias: soluciones };
}
