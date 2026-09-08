// Medida de ángulos entre tres puntos — lógica pura
//
// El vértice y los dos brazos vienen en coordenadas de pantalla, donde el eje Y
// crece hacia ABAJO. Da igual: el ángulo entre dos vectores no depende de la
// orientación de los ejes, así que no hay que invertir nada. Lo que sí importa
// es que la medida se hace sobre la IMAGEN, y una imagen en perspectiva deforma
// los ángulos — de ahí que la app avise y acote su promesa a imágenes planas.

export interface Punto {
  x: number;
  y: number;
}

/** Cómo se nombra un ángulo por su amplitud, según la geometría elemental. */
export type TipoAngulo = 'nulo' | 'agudo' | 'recto' | 'obtuso' | 'llano';

/**
 * Ángulo que forman los segmentos vértice→a y vértice→b, en grados [0, 180].
 *
 * Devuelve `null` si alguno de los brazos tiene longitud cero: sin dirección no
 * hay ángulo que medir, y devolver 0 sería afirmar algo falso (un 0 legítimo
 * significa «los dos brazos apuntan al mismo sitio», que es otra cosa).
 */
export function anguloEntre(vertice: Punto, a: Punto, b: Punto): number | null {
  const ax = a.x - vertice.x;
  const ay = a.y - vertice.y;
  const bx = b.x - vertice.x;
  const by = b.y - vertice.y;

  const moduloA = Math.hypot(ax, ay);
  const moduloB = Math.hypot(bx, by);
  if (moduloA === 0 || moduloB === 0) return null;

  // atan2 del producto vectorial y el escalar en vez de acos del coseno: acos
  // pierde precisión cerca de 0° y 180°, justo donde caen el ángulo llano y el
  // nulo, y además puede salirse de [-1, 1] por redondeo y devolver NaN.
  const escalar = ax * bx + ay * by;
  const vectorial = ax * by - ay * bx;
  const radianes = Math.atan2(Math.abs(vectorial), escalar);
  return (radianes * 180) / Math.PI;
}

/**
 * El ángulo que queda por fuera, hasta completar la vuelta.
 *
 * Un transportador da siempre el menor de los dos, pero el que el usuario quiere
 * medir puede ser el otro: en un plano, la esquina entrante de una habitación es
 * el reflejo del que marcan los brazos.
 */
export function anguloReflejo(grados: number): number {
  return 360 - grados;
}

/** Lo que le falta para 90°, o `null` si ya lo pasa: un obtuso no complementa. */
export function complementario(grados: number): number | null {
  if (grados > 90) return null;
  return 90 - grados;
}

/** Lo que le falta para 180°, o `null` si ya lo pasa. */
export function suplementario(grados: number): number | null {
  if (grados > 180) return null;
  return 180 - grados;
}

/**
 * Nombre del ángulo por su amplitud.
 *
 * La tolerancia existe porque la medida sale de arrastrar tres puntos con el
 * dedo o el ratón: exigir 90,000° para decir «recto» no nombraría recto ningún
 * ángulo medido a mano, y el nombre es justo lo que se está consultando. Medio
 * grado es además el orden de precisión de un transportador de plástico.
 */
export const TOLERANCIA_GRADOS = 0.5;

export function clasificarAngulo(grados: number): TipoAngulo {
  if (grados <= TOLERANCIA_GRADOS) return 'nulo';
  if (Math.abs(grados - 90) <= TOLERANCIA_GRADOS) return 'recto';
  if (grados >= 180 - TOLERANCIA_GRADOS) return 'llano';
  if (grados < 90) return 'agudo';
  return 'obtuso';
}

/** Etiqueta en español de cada tipo, para pintar junto a la medida. */
export const NOMBRE_TIPO: Readonly<Record<TipoAngulo, string>> = {
  nulo: 'Ángulo nulo',
  agudo: 'Ángulo agudo',
  recto: 'Ángulo recto',
  obtuso: 'Ángulo obtuso',
  llano: 'Ángulo llano',
};

/**
 * Pasa una medida decimal a grados, minutos y segundos de arco.
 *
 * Los planos, la topografía y los enunciados de trigonometría usan esta
 * notación, y convertirla a mano es justo el paso donde se cuela el error.
 */
export interface GradosMinutosSegundos {
  grados: number;
  minutos: number;
  segundos: number;
}

export function aGradosMinutosSegundos(decimal: number): GradosMinutosSegundos {
  const grados = Math.floor(decimal);
  const restoMinutos = (decimal - grados) * 60;
  const minutos = Math.floor(restoMinutos);
  const segundos = Math.round((restoMinutos - minutos) * 60);

  // El redondeo de los segundos puede llegar a 60: se arrastra hacia arriba en
  // vez de escribir «12° 30' 60"», que no es una hora válida ni un ángulo válido.
  if (segundos === 60) {
    if (minutos === 59) return { grados: grados + 1, minutos: 0, segundos: 0 };
    return { grados, minutos: minutos + 1, segundos: 0 };
  }
  return { grados, minutos, segundos };
}
