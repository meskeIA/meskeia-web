/**
 * Casos para clase — la tarea asignable de `visualizador-geometria-analitica` (26/10/2026,
 * semilla S0228).
 *
 * Doce ejercicios del tipo que se ponen en clase y en los exámenes de admisión: una ecuación
 * general Ax² + Cy² + Dx + Ey + F = 0 y un elemento que hallar (radio, centro, foco, directriz,
 * excentricidad, asíntotas). Vive fuera de `page.tsx` porque el build compila la vista sin
 * comprobar si la matemática está bien ([[feedback_motor_calculo_aparte_y_probado]]).
 *
 * ── LA ARITMÉTICA NO SE REPLICA ───────────────────────────────────────────────
 *
 * Toda la geometría está en `./motor.ts`: la respuesta de cada caso sale de `analizarConica`,
 * la MISMA función que pinta el modo «Desde la ecuación general» de la página. El alumno que
 * escribe la ecuación del caso en ese modo ve exactamente la cifra que el corrector espera.
 *
 * ── LOS CONVENIOS (cabecera de motor.ts) ──────────────────────────────────────
 *
 * Ningún caso pide «p» ni «a» a secas: unos libros llaman p a la distancia del vértice al foco
 * y otros a la del foco a la directriz, y unos llaman a al semieje bajo la x y otros al mayor.
 * Se preguntan solo cosas que salen igual con cualquier libro: coordenadas del foco y del
 * centro, la directriz, distancias y excentricidad. El test lo vigila.
 *
 * ── TOLERANCIA ─────────────────────────────────────────────────────────────────
 *
 * Las respuestas exactas (5, −2, 0,6…) no admiten margen: 0,61 no es 0,6. Las que llevan una
 * raíz no exacta se piden redondeadas a dos decimales y se corrigen con la tolerancia RELATIVA
 * (el mayor entre 0,01 y el 1 %): quien redondea √5 a 2,24 antes de doblarlo escribe 4,48 en vez
 * de 4,47, y ese es un redondeo intermedio legítimo, no un error.
 *
 * Nada lanza excepciones: un `throw` dentro de un render tumba la app entera.
 */

import { formatNumber } from '@/lib';
import {
  corregirNumero,
  dentroDeTolerancia,
  exigeRedondeo,
  redondearA,
  textoDesviacion,
  toleranciaRelativa,
  type Magnitud,
} from '@/lib/calculadoras/correctorCasosAula';
import {
  analizarConica,
  cifra,
  escribirGeneral,
  expandir,
  type Analisis,
  type Coeficientes,
  type Tipo,
} from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta =
  | 'radio'
  | 'r2'
  | 'centro-x'
  | 'centro-y'
  | 'excentricidad'
  | 'distancia-focos'
  | 'foco-mayor'
  | 'foco'
  | 'directriz'
  | 'distancia-vertice-foco'
  | 'pendiente-asintota';

export interface DatosCaso {
  ecuacion: Coeficientes;
  pregunta: Pregunta;
  /** Unidad de longitud de los ejes en los casos aplicados («dm», «m»…). */
  unidad?: string;
}

/** Qué cónicas admite cada pregunta: fuera de ellas, `resolverCaso` no da cifra. */
const ADMITE: Record<Pregunta, readonly Tipo[]> = {
  radio: ['circunferencia'],
  r2: ['circunferencia', 'punto', 'vacia'],
  'centro-x': ['circunferencia', 'elipse', 'hiperbola'],
  'centro-y': ['circunferencia', 'elipse', 'hiperbola'],
  excentricidad: ['circunferencia', 'elipse', 'hiperbola', 'parabola'],
  'distancia-focos': ['elipse', 'hiperbola'],
  'foco-mayor': ['elipse', 'hiperbola'],
  foco: ['parabola'],
  directriz: ['parabola'],
  'distancia-vertice-foco': ['parabola'],
  'pendiente-asintota': ['hiperbola'],
};

/** Las preguntas cuya respuesta es una longitud: llevan la unidad del caso, si la tiene. */
const ES_LONGITUD: Record<Pregunta, boolean> = {
  radio: true,
  r2: false,
  'centro-x': false,
  'centro-y': false,
  excentricidad: false,
  'distancia-focos': true,
  'foco-mayor': false,
  foco: false,
  directriz: false,
  'distancia-vertice-foco': true,
  'pendiente-asintota': false,
};

/** Las que no pueden ser negativas: un radio, una distancia, una excentricidad, una pendiente positiva. */
const NO_NEGATIVA: Record<Pregunta, boolean> = {
  ...ES_LONGITUD,
  excentricidad: true,
  'pendiente-asintota': true,
};

export const DECIMALES = 2;

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  analisis: Analisis | null;
  error?: string;
}

/* ─────────────────────────── Textos ─────────────────────────── */

/** Lo que se pide, en minúscula, para la frase final de la solución. */
function queSePide(p: Pregunta, an: Analisis): string {
  switch (p) {
    case 'radio': return 'el radio';
    case 'r2': return 'el número que queda a la derecha';
    case 'centro-x': return 'la abscisa del centro, h';
    case 'centro-y': return 'la ordenada del centro, k';
    case 'excentricidad': return 'la excentricidad';
    case 'distancia-focos': return 'la distancia entre los dos focos, 2c';
    case 'foco-mayor': return an.eje === 'vertical' ? 'la ordenada del foco de arriba' : 'la abscisa del foco de la derecha';
    case 'foco': return an.eje === 'vertical' ? 'la ordenada del foco' : 'la abscisa del foco';
    case 'directriz': return `el número de la directriz, ${an.directriz?.eje ?? 'x'} = …`;
    case 'distancia-vertice-foco': return 'la distancia del vértice al foco, |p|';
    case 'pendiente-asintota': return 'la pendiente positiva de las asíntotas';
  }
}

/** La unidad de la respuesta: la del caso si es una longitud, y nada si no. */
export function unidadDe(d: DatosCaso): string {
  return ES_LONGITUD[d.pregunta] && d.unidad ? d.unidad : '';
}

/** Lo que se escribe sobre la casilla. Nunca vacío. */
export function etiquetaDe(d: DatosCaso): string {
  const an = analizarConica(d.ecuacion);
  const unidad = unidadDe(d);
  const base: Record<Pregunta, string> = {
    radio: 'Radio',
    r2: 'Número que queda a la derecha (sin unidad)',
    'centro-x': 'Abscisa del centro, h',
    'centro-y': 'Ordenada del centro, k',
    excentricidad: 'Excentricidad (sin unidad)',
    'distancia-focos': 'Distancia entre los focos',
    'foco-mayor': an.eje === 'vertical' ? 'Ordenada del foco de arriba' : 'Abscisa del foco de la derecha',
    foco: an.eje === 'vertical' ? 'Ordenada del foco' : 'Abscisa del foco',
    directriz: `Directriz: ${an.directriz?.eje ?? 'x'} = …`,
    'distancia-vertice-foco': 'Distancia del vértice al foco',
    'pendiente-asintota': 'Pendiente positiva de las asíntotas (sin unidad)',
  };
  return unidad ? `${base[d.pregunta]}, en ${unidad}` : base[d.pregunta];
}

/**
 * La respuesta con su unidad: «4,47», «−2», «10 m». Con DOS decimales justos si hubo que
 * redondear —así lo pide el enunciado— y, si es exacta, con los que tenga. Signo menos
 * tipográfico, como en los pasos. Espacio duro antes de la unidad (CLAUDE.md global §2).
 */
export function textoRespuesta(valor: number, unidad: string, redondeada: boolean): string {
  if (!Number.isFinite(valor)) return '—';
  const numero = redondeada ? formatNumber(valor, DECIMALES).replace(/^-/, '−') : cifra(valor, DECIMALES);
  return unidad ? `${numero} ${unidad}` : numero;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

/** El valor que pide la pregunta, sacado del análisis del motor. NaN si no aplica. */
function valorDe(p: Pregunta, an: Analisis): number {
  switch (p) {
    case 'radio': return an.radio;
    case 'r2': return an.rCuadrado;
    case 'centro-x': return an.centro?.x ?? NaN;
    case 'centro-y': return an.centro?.y ?? NaN;
    case 'excentricidad': return an.excentricidad;
    case 'distancia-focos': return 2 * an.c;
    case 'foco-mayor':
      return an.eje === 'vertical'
        ? Math.max(...an.focos.map((f) => f.y))
        : Math.max(...an.focos.map((f) => f.x));
    case 'foco':
      return an.focos.length === 1 ? (an.eje === 'vertical' ? an.focos[0].y : an.focos[0].x) : NaN;
    case 'directriz': return an.directriz?.valor ?? NaN;
    case 'distancia-vertice-foco': return Math.abs(an.p);
    case 'pendiente-asintota': return an.pendienteAsintota;
  }
}

/** La última línea de la solución: lo que se pide y su cifra (la de la casilla). */
function pasoFinal(d: DatosCaso, an: Analisis, exacto: number): string {
  const unidad = unidadDe(d);
  const redondea = exigeRedondeo(exacto, DECIMALES);
  const casilla = textoRespuesta(redondearA(exacto, DECIMALES), unidad, redondea);
  const cuenta = d.pregunta === 'distancia-focos' ? `2 × ${cifra(an.c)} = ` : '';
  const valor = redondea ? `${cuenta}${cifra(exacto)} ≈ ${casilla}` : `${cuenta}${casilla}`;
  return `Se pide ${queSePide(d.pregunta, an)}: ${valor}.`;
}

/** Resuelve el caso desde sus datos, sin mirar la respuesta declarada. */
export function resolverCaso(d: DatosCaso): Resolucion {
  const an = analizarConica(d.ecuacion);
  if (!an.ok || !an.tipo) return { ok: false, valor: NaN, pasos: an.pasos, analisis: an, error: an.error };
  if (!ADMITE[d.pregunta].includes(an.tipo)) {
    return { ok: false, valor: NaN, pasos: an.pasos, analisis: an, error: `La pregunta no se aplica a esta cónica (${an.nombre.toLowerCase()}).` };
  }
  const valor = valorDe(d.pregunta, an);
  if (!Number.isFinite(valor)) return { ok: false, valor: NaN, pasos: an.pasos, analisis: an, error: 'La pregunta no tiene respuesta para esta ecuación.' };
  return { ok: true, valor, pasos: [...an.pasos, pasoFinal(d, an, valor)], analisis: an };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** Coordenadas, distancias, excentricidades: números reales. Lo negativo imposible se dice aparte. */
export function magnitudDe(): Magnitud {
  return 'real';
}

/** 0 si la respuesta es exacta; la relativa si lleva una raíz que hay que redondear (cabecera). */
export function toleranciaDe(d: DatosCaso): number {
  const r = resolverCaso(d);
  if (!r.ok) return 0;
  return exigeRedondeo(r.valor, DECIMALES) ? toleranciaRelativa(r.valor) : 0;
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Los errores típicos de cada pregunta, con el valor que producen y lo que hay que decirle al
 * alumno. Se calculan desde el análisis del motor, igual que la respuesta.
 */
export function erroresTipicos(d: DatosCaso): { valor: number; motivo: string }[] {
  const r = resolverCaso(d);
  if (!r.ok || !r.analisis) return [];
  const an = r.analisis;
  const v = r.valor;
  const e: { valor: number; motivo: string }[] = [];
  const { a, b, c } = an;
  switch (d.pregunta) {
    case 'radio':
      e.push({ valor: v * v, motivo: 'Eso es r², no el radio: falta sacar la raíz cuadrada.' });
      if (!Number.isNaN(an.rCuadrado) && Math.abs(d.ecuacion.A - 1) > 1e-9) {
        e.push({
          valor: Math.sqrt(an.rCuadrado * d.ecuacion.A),
          motivo: `Te has saltado dividir entre ${cifra(d.ecuacion.A)}: el radio sale cuando x² e y² tienen coeficiente 1.`,
        });
      }
      break;
    case 'r2':
      e.push({
        valor: -v,
        motivo: 'Revisa el signo: al pasar los números al otro lado, súmalos con su signo. Un resultado negativo quiere decir que ningún punto cumple la ecuación.',
      });
      break;
    case 'centro-x':
    case 'centro-y':
      e.push({
        valor: -v,
        motivo: `El signo va al revés: ${d.pregunta === 'centro-x' ? '(x + 2)² corresponde a h = −2' : '(y + 2)² corresponde a k = −2'}, y (· − 2)² a +2.`,
      });
      break;
    case 'excentricidad':
      if (an.tipo === 'elipse') {
        e.push({ valor: Math.sqrt(a * a + b * b) / a, motivo: 'Has sumado a² y b²: en la elipse c² = a² − b² (se suman en la hipérbola).' });
        e.push({ valor: c / b, motivo: 'Has dividido entre el semieje menor: la excentricidad es c/a, con a el semieje MAYOR.' });
      }
      if (an.tipo === 'hiperbola') {
        if (a > b) e.push({ valor: Math.sqrt(a * a - b * b) / a, motivo: 'Has restado a² y b²: en la hipérbola c² = a² + b² (se restan en la elipse).' });
        e.push({ valor: c / b, motivo: 'Has dividido entre el semieje equivocado: a es la raíz del denominador del término POSITIVO, y e = c/a.' });
      }
      break;
    case 'distancia-focos':
      e.push({ valor: c, motivo: 'Eso es c, la distancia del centro a cada foco: entre los dos focos hay 2c.' });
      if (an.tipo === 'elipse') e.push({ valor: 2 * Math.sqrt(a * a + b * b), motivo: 'Has sumado a² y b²: en la elipse c² = a² − b².' });
      if (an.tipo === 'hiperbola' && a > b) e.push({ valor: 2 * Math.sqrt(a * a - b * b), motivo: 'Has restado a² y b²: en la hipérbola c² = a² + b².' });
      break;
    case 'foco-mayor': {
      const centro = an.centro;
      if (centro) {
        const otroEje = an.eje === 'vertical' ? centro.y : centro.x;
        e.push({
          valor: otroEje,
          motivo: `Esa es la coordenada del centro: el foco está a c del centro sobre el eje ${an.tipo === 'elipse' ? 'mayor' : 'real'}, que aquí es ${an.eje}.`,
        });
        const alReves = an.eje === 'vertical' ? centro.x + c : centro.y + c;
        e.push({
          valor: alReves,
          motivo: `Has puesto los focos en el eje ${an.eje === 'vertical' ? 'horizontal' : 'vertical'}. ${an.tipo === 'elipse' ? 'En la elipse el eje mayor va bajo el denominador MAYOR' : 'En la hipérbola el eje real va con el término POSITIVO'}, y aquí es la ${an.eje === 'vertical' ? 'y' : 'x'}.`,
        });
      }
      break;
    }
    case 'foco':
    case 'directriz': {
      const vert = an.vertice;
      if (vert) {
        const vw = an.eje === 'vertical' ? vert.y : vert.x;
        e.push({ valor: vw, motivo: 'Esa es la coordenada del vértice: el foco y la directriz están a la distancia |p| del vértice, uno a cada lado.' });
        e.push({
          valor: d.pregunta === 'foco' ? vw + 4 * an.p : vw - 4 * an.p,
          motivo: 'Has usado 4p como distancia: 4p es el coeficiente de la ecuación, y la distancia del vértice al foco es p, su cuarta parte.',
        });
        if (d.pregunta === 'directriz') {
          e.push({ valor: vw + an.p, motivo: 'Esa es la coordenada del foco: la directriz está al otro lado del vértice, a la misma distancia.' });
        } else {
          e.push({ valor: vw - an.p, motivo: 'Has ido hacia el lado contrario: si 4p es positivo el foco queda por encima (o a la derecha) del vértice, y si es negativo, por debajo (o a la izquierda).' });
        }
      }
      break;
    }
    case 'distancia-vertice-foco':
      e.push({ valor: 4 * v, motivo: 'Eso es 4p, el coeficiente de la ecuación: la distancia del vértice al foco es p = 4p ÷ 4.' });
      e.push({ valor: 2 * v, motivo: 'Esa es la distancia del foco a la directriz (algunos libros la llaman p): la del vértice al foco es la mitad.' });
      break;
    case 'pendiente-asintota':
      e.push({ valor: 1 / v, motivo: `Has invertido el cociente: con el eje real ${an.eje}, la pendiente es ${an.eje === 'vertical' ? 'a/b' : 'b/a'}.` });
      break;
  }
  return e.filter((x) => Number.isFinite(x.valor));
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde con
 * un veredicto, no con una excepción que tumbaría el render.
 */
export function comprobarRespuesta(usuario: number, esperado: number, d: DatosCaso): Veredicto {
  const tolerancia = toleranciaDe(d);
  const c = corregirNumero(usuario, esperado, { tolerancia, magnitud: magnitudDe() });
  const { diferencia } = c;

  if (c.estado === 'no-numerico') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal y el signo menos, por ejemplo −2 o 4,47).', diferencia: NaN, tolerancia };
  }
  if (c.motivoImposible) return { correcto: false, motivo: c.motivoImposible, diferencia, tolerancia };
  if (c.estado === 'acierto') return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  if (NO_NEGATIVA[d.pregunta] && usuario < 0) {
    return { correcto: false, motivo: 'No es correcto: un radio, una distancia, una excentricidad o la pendiente positiva no pueden ser negativos.', diferencia, tolerancia };
  }

  for (const e of erroresTipicos(d)) {
    if (!dentroDeTolerancia(e.valor, esperado, tolerancia) && dentroDeTolerancia(usuario, e.valor, toleranciaRelativa(e.valor))) {
      return { correcto: false, motivo: e.motivo, diferencia, tolerancia };
    }
  }

  const unidad = unidadDe(d);
  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${textoDesviacion(diferencia, DECIMALES, formatNumber)}${unidad ? ` ${unidad}` : ''} de la respuesta.`,
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
  unidad: string;
  /** Calculada por el motor desde `datos` y redondeada a dos decimales. */
  respuesta: number;
  respuestaTexto: string;
  /** true si la cifra exacta tiene más de dos decimales: el enunciado lo dice. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** « Redondea a dos decimales.» o nada, según lo decida `exigeRedondeo` sobre la cifra exacta. */
function fraseRedondeo(d: DatosCaso): string {
  const r = resolverCaso(d);
  return r.ok && exigeRedondeo(r.valor, DECIMALES) ? ' Redondea a dos decimales.' : '';
}

type DefinicionCaso = Pick<Caso, 'id' | 'titulo' | 'categoria' | 'datos' | 'pista'> & {
  /** El enunciado con `{ec}` donde va la ecuación, que se escribe desde los datos. */
  plantilla: string;
};

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'El radio de una circunferencia',
    plantilla: 'Completa cuadrados en {ec} y halla el radio de la circunferencia.',
    categoria: 'abstracto',
    datos: { ecuacion: { A: 1, C: 1, D: -4, E: 6, F: -12 }, pregunta: 'radio' },
    pista: 'Agrupa (x² − 4x) y (y² + 6y) y suma a cada grupo el cuadrado de la mitad de su coeficiente: 4 y 9.',
  },
  {
    id: 2,
    titulo: 'Cuando x² no va sola',
    plantilla: 'Halla la abscisa del centro (la h) de la circunferencia {ec}.',
    categoria: 'abstracto',
    datos: { ecuacion: { A: 2, C: 2, D: 8, E: -4, F: -8 }, pregunta: 'centro-x' },
    pista: 'Antes de completar cuadrados, divide toda la ecuación entre 2. Y cuidado con el signo: (x + 2)² quiere decir h = −2.',
  },
  {
    id: 3,
    titulo: '¿Es de verdad una circunferencia?',
    plantilla:
      'Completa cuadrados en {ec} hasta dejarla como (x − h)² + (y − k)² = número. ¿Qué número queda a la derecha? ¿Representa una circunferencia?',
    categoria: 'abstracto',
    datos: { ecuacion: { A: 1, C: 1, D: 6, E: -8, F: 30 }, pregunta: 'r2' },
    pista: 'Al pasar los números al otro lado queda −30 + 9 + 16. Si sale negativo, ningún punto cumple la ecuación: un cuadrado nunca es negativo.',
  },
  {
    id: 4,
    titulo: 'La órbita de un satélite',
    plantilla:
      'La órbita de un satélite alrededor de un planeta es la elipse {ec}, con los ejes en miles de kilómetros y el planeta en uno de sus focos. ¿Cuál es la excentricidad de la órbita?',
    categoria: 'aplicado',
    datos: { ecuacion: { A: 16, C: 25, D: 0, E: 0, F: -400 }, pregunta: 'excentricidad' },
    pista: 'Pasa el 400 al otro lado y divide entre él para que quede «= 1». En la elipse c² = a² − b², y e = c/a.',
  },
  {
    id: 5,
    titulo: 'La distancia entre los focos',
    plantilla: 'Halla la distancia entre los dos focos de la elipse {ec}.',
    categoria: 'abstracto',
    datos: { ecuacion: { A: 4, C: 9, D: -16, E: 18, F: -11 }, pregunta: 'distancia-focos' },
    pista: 'Saca factor común 4 en los términos de la x y 9 en los de la y antes de completar cuadrados. Entre los dos focos hay 2c, no c.',
  },
  {
    id: 6,
    titulo: 'Una elipse de eje vertical',
    plantilla: 'Halla la ordenada del foco de arriba de la elipse {ec}.',
    categoria: 'abstracto',
    datos: { ecuacion: { A: 25, C: 16, D: 100, E: -96, F: -156 }, pregunta: 'foco-mayor' },
    pista: 'Mira bajo qué variable queda el denominador mayor: ahí está el eje mayor, y sobre él los focos.',
  },
  {
    id: 7,
    titulo: 'El foco de una parábola',
    plantilla: 'Halla la ordenada del foco de la parábola {ec}.',
    categoria: 'abstracto',
    datos: { ecuacion: { A: 1, C: 0, D: -4, E: -8, F: 28 }, pregunta: 'foco' },
    pista: 'Deja la x a un lado, completa el cuadrado y llega a (x − h)² = 4p(y − k). El foco está a p del vértice.',
  },
  {
    id: 8,
    titulo: 'La directriz de una parábola',
    plantilla: 'La parábola {ec} tiene una directriz vertical, x = número. ¿Qué número?',
    categoria: 'abstracto',
    datos: { ecuacion: { A: 0, C: 1, D: 12, E: 6, F: -15 }, pregunta: 'directriz' },
    pista: 'Llega a (y − k)² = 4p(x − h). Si 4p es negativo, la parábola abre hacia la izquierda y la directriz queda a la derecha del vértice.',
  },
  {
    id: 9,
    titulo: 'La excentricidad de una hipérbola',
    plantilla: 'Halla la excentricidad de la hipérbola {ec}.',
    categoria: 'abstracto',
    datos: { ecuacion: { A: -9, C: 16, D: 0, E: 0, F: -144 }, pregunta: 'excentricidad' },
    pista: 'El término positivo es el de la y: a es la raíz de SU denominador. En la hipérbola c² = a² + b².',
  },
  {
    id: 10,
    titulo: 'Las asíntotas de una hipérbola',
    plantilla: 'Halla la pendiente positiva de las asíntotas de la hipérbola {ec}.',
    categoria: 'abstracto',
    datos: { ecuacion: { A: 4, C: -1, D: -8, E: -4, F: -4 }, pregunta: 'pendiente-asintota' },
    pista: 'Ojo al sacar factor común −1 en los términos de la y: −(y² + 4y). Con el eje real horizontal, la pendiente es b/a.',
  },
  {
    id: 11,
    titulo: 'El receptor de una antena',
    plantilla:
      'El corte de una antena parabólica, con los ejes en decímetros, tiene la ecuación {ec}. El receptor va en el foco. ¿A qué distancia del vértice (el fondo de la antena) hay que colocarlo?',
    categoria: 'aplicado',
    datos: { ecuacion: { A: 1, C: 0, D: -6, E: -12, F: 9 }, pregunta: 'distancia-vertice-foco', unidad: 'dm' },
    pista: 'x² − 6x + 9 ya es un cuadrado perfecto. Compara con (x − h)² = 4p(y − k): la distancia es p, no 4p.',
  },
  {
    id: 12,
    titulo: 'La sala de los susurros',
    plantilla:
      'Una sala tiene la planta elíptica {ec}, con los ejes en metros. Lo que se susurra en un foco se oye con claridad en el otro. ¿A qué distancia están los dos focos?',
    categoria: 'aplicado',
    datos: { ecuacion: { A: 144, C: 169, D: 0, E: 0, F: -24336 }, pregunta: 'distancia-focos', unidad: 'm' },
    pista: '24.336 = 144 × 169. Divide entre ese número para que quede «= 1», saca a² y b², y recuerda que entre los focos hay 2c.',
  },
];

/** Los pasos del motor y, si hubo que redondear, ya acaban en la cifra de la casilla (5.bis). */
function pasosDe(r: Resolucion): string[] {
  return r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'];
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map(({ plantilla, ...def }) => {
  const r = resolverCaso(def.datos);
  const unidad = unidadDe(def.datos);
  const requiereRedondeo = r.ok ? exigeRedondeo(r.valor, DECIMALES) : false;
  const valor = r.ok ? redondearA(r.valor, DECIMALES) : NaN;
  return {
    ...def,
    enunciado: plantilla.replace('{ec}', escribirGeneral(def.datos.ecuacion)) + fraseRedondeo(def.datos),
    etiquetaRespuesta: etiquetaDe(def.datos),
    unidad,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, unidad, requiereRedondeo),
    requiereRedondeo,
    pasos: pasosDe(r),
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * 1, 2, 3… los primeros valores salen diminutos y muy parecidos, y el «aleatorio» acaba dando
 * SIEMPRE el mismo ejercicio (simulador-genetica, 14/09/2026): reproducible no es variado.
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

function elegir<T>(rnd: () => number, opciones: readonly T[]): T {
  return opciones[Math.min(opciones.length - 1, Math.floor(rnd() * opciones.length))];
}

/** La forma con que se generó el ejercicio: el test calcula con ella su propia respuesta. */
export type Forma = Parameters<typeof expandir>[0];

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  forma: Forma;
  respuesta: number;
  etiquetaRespuesta: string;
  unidad: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

const CENTROS = [-3, -2, -1, 0, 1, 2, 3] as const;
const RADIOS = [1, 2, 3, 4, 5, 6] as const;
/** Semiejes (a, b) de la elipse, con a > b: unos con c exacto y otros no. */
const SEMIEJES_ELIPSE = [[5, 3], [5, 4], [3, 2], [4, 2], [4, 3], [6, 2], [10, 6]] as const;
/** Semiejes (a, b) de la hipérbola: a puede ser menor que b. */
const SEMIEJES_HIPERBOLA = [[4, 3], [3, 4], [1, 2], [2, 1], [3, 2], [2, 3], [6, 8]] as const;
const PARAMETROS_P = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3] as const;

const PREGUNTAS: Record<'circunferencia' | 'elipse' | 'hiperbola' | 'parabola', readonly Pregunta[]> = {
  circunferencia: ['radio', 'radio', 'centro-x', 'centro-y'],
  elipse: ['excentricidad', 'distancia-focos', 'foco-mayor', 'centro-y'],
  hiperbola: ['excentricidad', 'distancia-focos', 'foco-mayor', 'pendiente-asintota'],
  parabola: ['foco', 'directriz', 'distancia-vertice-foco'],
};

/** El enunciado de una pregunta del modo práctica sobre la ecuación ya escrita. */
function enunciadoPractica(p: Pregunta, ec: string, an: Analisis): string {
  const nombre = an.nombre.toLowerCase();
  switch (p) {
    case 'radio': return `Halla el radio de la circunferencia ${ec}.`;
    case 'r2': return `Completa cuadrados en ${ec}. ¿Qué número queda a la derecha?`;
    case 'centro-x': return `Halla la abscisa del centro (la h) de la ${nombre} ${ec}.`;
    case 'centro-y': return `Halla la ordenada del centro (la k) de la ${nombre} ${ec}.`;
    case 'excentricidad': return `Halla la excentricidad de la ${nombre} ${ec}.`;
    case 'distancia-focos': return `Halla la distancia entre los dos focos de la ${nombre} ${ec}.`;
    case 'foco-mayor':
      return `Halla la ${an.eje === 'vertical' ? 'ordenada del foco de arriba' : 'abscisa del foco de la derecha'} de la ${nombre} ${ec}.`;
    case 'foco': return `Halla la ${an.eje === 'vertical' ? 'ordenada' : 'abscisa'} del foco de la parábola ${ec}.`;
    case 'directriz':
      return `La parábola ${ec} tiene una directriz ${an.directriz?.eje === 'y' ? 'horizontal, y' : 'vertical, x'} = número. ¿Qué número?`;
    case 'distancia-vertice-foco': return `¿A qué distancia del vértice está el foco de la parábola ${ec}?`;
    case 'pendiente-asintota': return `Halla la pendiente positiva de las asíntotas de la hipérbola ${ec}.`;
  }
}

function formaAleatoria(rnd: () => number): { forma: Forma; m: number } {
  const tipo = elegir(rnd, ['circunferencia', 'elipse', 'elipse', 'hiperbola', 'hiperbola', 'parabola', 'parabola'] as const);
  const h = elegir(rnd, CENTROS);
  const k = elegir(rnd, CENTROS);
  const eje = elegir(rnd, ['horizontal', 'vertical'] as const);
  switch (tipo) {
    case 'circunferencia':
      return { forma: { tipo, h, k, r: elegir(rnd, RADIOS) }, m: elegir(rnd, [1, 1, 2, 3] as const) };
    case 'elipse': {
      const [a, b] = elegir(rnd, SEMIEJES_ELIPSE);
      return { forma: { tipo, h, k, a, b, eje }, m: 1 };
    }
    case 'hiperbola': {
      const [a, b] = elegir(rnd, SEMIEJES_HIPERBOLA);
      return { forma: { tipo, h, k, a, b, eje }, m: 1 };
    }
    case 'parabola':
      return { forma: { tipo, h, k, p: elegir(rnd, PARAMETROS_P), eje }, m: elegir(rnd, [1, 1, 2] as const) };
  }
}

/** Si en 200 intentos no sale nada válido (no pasa con estas listas), el caso 1. */
const RESERVA = { forma: { tipo: 'circunferencia', h: 2, k: -3, r: 5 } as Forma, pregunta: 'radio' as Pregunta, m: 1 };

/** Un ejercicio de práctica, con la MISMA resolución (`resolverCaso`) que los doce fijos. */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  let elegido: { forma: Forma; pregunta: Pregunta; m: number } | null = null;
  for (let i = 0; i < 200 && !elegido; i++) {
    const { forma, m } = formaAleatoria(rnd);
    const pregunta = elegir(rnd, PREGUNTAS[forma.tipo]);
    const r = resolverCaso({ ecuacion: expandir(forma, m), pregunta });
    if (r.ok && Math.abs(r.valor) < 1000) elegido = { forma, pregunta, m };
  }
  const { forma, pregunta, m } = elegido ?? RESERVA;
  const datos: DatosCaso = { ecuacion: expandir(forma, m), pregunta };
  const r = resolverCaso(datos);
  const an = r.analisis ?? analizarConica(datos.ecuacion);
  const requiereRedondeo = r.ok ? exigeRedondeo(r.valor, DECIMALES) : false;
  return {
    semilla,
    enunciado: enunciadoPractica(pregunta, escribirGeneral(datos.ecuacion), an) + fraseRedondeo(datos),
    datos,
    forma,
    respuesta: r.ok ? redondearA(r.valor, DECIMALES) : NaN,
    etiquetaRespuesta: etiquetaDe(datos),
    unidad: unidadDe(datos),
    requiereRedondeo,
    pasos: pasosDe(r),
  };
}
