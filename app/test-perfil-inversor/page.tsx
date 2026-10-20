'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import styles from './TestPerfilInversor.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, RegionBadge } from '@/components';
import { formatNumber, formatPercentage } from '@/lib';
import { PREGUNTA_REVISAR_PERFIL, RESPUESTA_REVISAR_PERFIL } from './metadata';
import { CARTERAS_PERFIL, calcularParametrosCartera, type PerfilInversor } from '@/lib/calculadoras/carteraPerfiles';

// Definición de preguntas con puntuaciones
interface Option {
  text: string;
  points: number;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: '¿Cuál es tu horizonte temporal de inversión?',
    options: [
      { text: 'Menos de 2 años - Necesitaré el dinero pronto', points: 1 },
      { text: '2 a 5 años - Plazo medio', points: 2 },
      { text: '5 a 10 años - Largo plazo', points: 3 },
      { text: 'Más de 10 años - No tengo prisa', points: 4 },
    ],
  },
  {
    id: 2,
    text: 'Si tu cartera perdiera un 20\u00A0% de su valor en un mes, ¿qué harías?',
    options: [
      { text: 'Vendería todo inmediatamente para evitar más pérdidas', points: 1 },
      { text: 'Vendería una parte para reducir el riesgo', points: 2 },
      { text: 'Mantendría la posición y esperaría la recuperación', points: 3 },
      { text: 'Aprovecharía para comprar más a precios más bajos', points: 4 },
    ],
  },
  {
    id: 3,
    text: '¿Cuánta experiencia tienes invirtiendo en bolsa o fondos de inversión?',
    options: [
      { text: 'Ninguna - Soy completamente nuevo/a', points: 1 },
      { text: 'Poca - He invertido alguna vez pero sin seguimiento', points: 2 },
      { text: 'Moderada - Invierto regularmente desde hace años', points: 3 },
      { text: 'Amplia - Llevo más de 10 años invirtiendo activamente', points: 4 },
    ],
  },
  {
    id: 4,
    text: '¿Qué porcentaje de tus ahorros totales vas a destinar a inversiones?',
    // Hallazgo 3376 (20/10/2026; decidido por el usuario): puntuaba al revés que la 8 la misma
    // situación, y poner en juego la mayor parte del ahorro SUBÍA el perfil, contra la propia guía
    // («si dependes de esta inversión, sé más conservador»). Ahora cuanto más ahorro en juego,
    // menos puntos; el orden de las opciones sigue la convención de las demás (A = 1 punto).
    options: [
      { text: 'Más del 60\u00A0% - La mayor parte de mis ahorros', points: 1 },
      { text: '40\u00A0% a 60\u00A0% - Una parte significativa', points: 2 },
      { text: '20\u00A0% a 40\u00A0% - Una parte moderada', points: 3 },
      { text: 'Menos del 20\u00A0% - Solo una pequeña parte', points: 4 },
    ],
  },
  {
    id: 5,
    text: '¿Cuál es tu situación laboral y estabilidad de ingresos?',
    options: [
      { text: 'Ingresos variables o inestables', points: 1 },
      { text: 'Empleo estable pero sin grandes ahorros aún', points: 2 },
      { text: 'Empleo estable con buen colchón de emergencia', points: 3 },
      { text: 'Múltiples fuentes de ingresos o patrimonio consolidado', points: 4 },
    ],
  },
  {
    id: 6,
    text: '¿Cómo te sentirías si tu inversión cayera un 30\u00A0% en un año?',
    options: [
      { text: 'Muy preocupado/a - No podría dormir tranquilo/a', points: 1 },
      { text: 'Preocupado/a - Me generaría ansiedad', points: 2 },
      { text: 'Algo inquieto/a pero entendería que es normal', points: 3 },
      { text: 'Tranquilo/a - Es parte del juego a largo plazo', points: 4 },
    ],
  },
  {
    id: 7,
    text: '¿Cuál es tu objetivo principal al invertir?',
    options: [
      { text: 'Preservar mi capital - No perder dinero', points: 1 },
      { text: 'Obtener algo más que la inflación', points: 2 },
      { text: 'Hacer crecer mi patrimonio a largo plazo', points: 3 },
      { text: 'Maximizar rentabilidad aunque implique más riesgo', points: 4 },
    ],
  },
  {
    id: 8,
    text: '¿Tienes otros ahorros o inversiones además de lo que vas a invertir ahora?',
    options: [
      { text: 'No, este es todo mi ahorro', points: 1 },
      { text: 'Tengo un pequeño fondo de emergencia', points: 2 },
      { text: 'Tengo fondo de emergencia + otras inversiones', points: 3 },
      { text: 'Tengo un patrimonio diversificado (inmuebles, fondos, etc.)', points: 4 },
    ],
  },
  {
    id: 9,
    text: '¿Cómo reaccionas normalmente ante noticias económicas negativas?',
    options: [
      { text: 'Me alarmo y pienso en proteger lo que tengo', points: 1 },
      { text: 'Me preocupo pero intento mantener la calma', points: 2 },
      { text: 'Las sigo pero no cambio mi estrategia', points: 3 },
      { text: 'Las veo como potenciales oportunidades', points: 4 },
    ],
  },
  {
    id: 10,
    text: '¿Qué afirmación te representa mejor?',
    options: [
      { text: '"Prefiero ganar poco pero seguro a arriesgarme a perder"', points: 1 },
      { text: '"Acepto algo de riesgo si la posible ganancia lo justifica"', points: 2 },
      { text: '"Estoy dispuesto a asumir volatilidad por mayores rendimientos"', points: 3 },
      { text: '"No me importa perder temporalmente si a largo plazo gano más"', points: 4 },
    ],
  },
];

// Perfiles de inversor
type ProfileType = 'conservador' | 'moderado' | 'equilibrado' | 'dinamico' | 'agresivo';

interface Profile {
  name: string;
  icon: string;
  range: [number, number];
  description: string;
  traits: {
    riesgo: string;
    horizonte: string;
    volatilidad: string;
    objetivo: string;
  };
  allocation: {
    rv: number;
    rf: number;
    liq: number;
    alt: number;
  };
  recommendations: string[];
}

/**
 * Hallazgo 3227 (cabo C0158, 20/10/2026; decidido por el usuario): la volatilidad de cada perfil
 * estaba tecleada sin fuente (5–8 … 20–25 %) y el estimador al que lleva «Simular esta Cartera»
 * calculaba otra para la misma cartera (4,53 … 14,72 %). Ahora la cartera, la volatilidad y la
 * rentabilidad salen del motor del estimador, con sus hipótesis.
 */
const parametrosDe = (perfil: PerfilInversor) => calcularParametrosCartera(CARTERAS_PERFIL[perfil]);
// Con dos decimales, como el estimador: con uno, su 11,75 % salía aquí 11,7 % (11,748 redondeado).
const volatilidadDe = (perfil: PerfilInversor) => formatPercentage(parametrosDe(perfil).volatilidad, 2);

const PROFILES: Record<ProfileType, Profile> = {
  conservador: {
    name: 'Conservador',
    icon: '🛡️',
    range: [10, 16],
    // 3312 — las cinco descripciones describen el PERFIL, no a la persona: «Tienes experiencia»
    // se leía tras haber contestado «Ninguna» en la 3 (decidido por el usuario, 15/10/2026).
    description: 'Prioriza la seguridad sobre la rentabilidad: busca evitar pérdidas aunque eso suponga ganar menos. Pensado para horizontes cortos o para quien está cerca de necesitar el dinero, por ejemplo al jubilarse.',
    traits: {
      riesgo: 'Muy bajo',
      horizonte: '< 3 años',
      volatilidad: volatilidadDe('conservador'),
      objetivo: 'Preservar capital',
    },
    allocation: CARTERAS_PERFIL.conservador,
    recommendations: [
      'Fondos monetarios y depósitos a plazo',
      'Bonos gubernamentales de corto plazo',
      'ETFs de renta fija de alta calidad',
      'Mantener un colchón de emergencia amplio',
    ],
  },
  moderado: {
    name: 'Moderado',
    icon: '⚖️',
    range: [17, 22],
    description: 'Busca un equilibrio entre seguridad y crecimiento: acepta algo de volatilidad, sin excesos. Es un perfil habitual para empezar a invertir con prudencia.',
    traits: {
      riesgo: 'Bajo',
      horizonte: '3-5 años',
      volatilidad: volatilidadDe('moderado'),
      objetivo: 'Batir inflación',
    },
    allocation: CARTERAS_PERFIL.moderado,
    recommendations: [
      'Fondos mixtos conservadores',
      'Combinación de ETFs de renta fija y variable',
      'Planes de pensiones conservadores',
      'Diversificación geográfica moderada',
    ],
  },
  equilibrado: {
    name: 'Equilibrado',
    icon: '📊',
    range: [23, 28],
    description: 'Busca crecimiento a largo plazo aceptando una volatilidad moderada. Pensado para quien asume que las caídas suelen ser temporales y puede mantener la calma durante ellas.',
    traits: {
      riesgo: 'Medio',
      horizonte: '5-10 años',
      volatilidad: volatilidadDe('equilibrado'),
      objetivo: 'Crecimiento sostenido',
    },
    allocation: CARTERAS_PERFIL.equilibrado,
    recommendations: [
      'Fondos indexados de renta variable global, ampliamente diversificados',
      'Vehículos de acumulación, que reinvierten los dividendos',
      'Reparto equilibrado entre renta variable y renta fija',
      'Aportaciones periódicas de importe fijo',
    ],
  },
  dinamico: {
    name: 'Dinámico',
    icon: '📈',
    range: [29, 34],
    description: 'Prioriza el crecimiento y tolera bien la volatilidad. Pensado para quien tiene un horizonte largo, ve las caídas como parte del camino y puede aguantar varios años malos.',
    traits: {
      riesgo: 'Alto',
      horizonte: '10-15 años',
      volatilidad: volatilidadDe('dinamico'),
      objetivo: 'Maximizar crecimiento',
    },
    allocation: CARTERAS_PERFIL.dinamico,
    recommendations: [
      'ETFs de renta variable global',
      'Fondos indexados de mercados desarrollados',
      'Exposición a mercados emergentes',
      'Empresas de pequeña capitalización, de mayor recorrido y mayor riesgo',
    ],
  },
  agresivo: {
    name: 'Agresivo',
    icon: '🚀',
    range: [35, 40],
    description: 'Busca la máxima rentabilidad asumiendo un riesgo alto. Pensado para quien tiene experiencia, un horizonte muy largo y capacidad de no vender en pánico durante una crisis.',
    traits: {
      riesgo: 'Muy alto',
      horizonte: '> 15 años',
      volatilidad: volatilidadDe('agresivo'),
      objetivo: 'Máxima rentabilidad',
    },
    allocation: CARTERAS_PERFIL.agresivo,
    recommendations: [
      'ETFs 100\u00A0% renta variable global',
      'Exposición significativa a mercados emergentes',
      'Estrategias que sobreponderan algún factor (tamaño, valor, momento)',
      'Mantener disciplina de aportación periódica incluso en mercados volátiles.',
    ],
  },
};

// Determinar perfil según puntuación
function getProfile(score: number): ProfileType {
  if (score <= 16) return 'conservador';
  if (score <= 22) return 'moderado';
  if (score <= 28) return 'equilibrado';
  if (score <= 34) return 'dinamico';
  return 'agresivo';
}

/** Los cinco perfiles de menos a más riesgo: el orden de la barra y el del tope por horizonte. */
const ORDEN_PERFILES: ProfileType[] = ['conservador', 'moderado', 'equilibrado', 'dinamico', 'agresivo'];

/**
 * ⚠️ 15/10/2026 (hallazgo 3312, decidido por el usuario) — tope del perfil por el HORIZONTE.
 *
 * La puntuación es una suma sin topes: «Menos de 2 años - Necesitaré el dinero pronto» en la 1
 * y D en las demás daba 37 → Agresivo, «Horizonte ideal > 15 años» y 90 % de renta variable,
 * contra la propia guía (paso 3: «si necesitas el dinero en menos de 3 años → conservador […] El
 * horizonte temporal es el factor más objetivo para definir tu perfil»). Ahora la respuesta de la
 * pregunta 1 fija el perfil MÁXIMO, y cuando el tope actúa el resultado lo dice. Sin tope por
 * experiencia: eso lo cubren las descripciones, que describen el perfil y no a la persona.
 * La clave es la puntuación de la opción de la pregunta 1 (A = 1 … D = 4).
 */
const TOPE_POR_HORIZONTE: Record<number, { perfil: ProfileType; plazo: string }> = {
  1: { perfil: 'conservador', plazo: 'menos de 2 años' },
  2: { perfil: 'moderado', plazo: 'entre 2 y 5 años' },
  3: { perfil: 'equilibrado', plazo: 'entre 5 y 10 años' },
};

/** El perfil que da la puntuación, rebajado al tope del horizonte si lo supera. */
function perfilConTope(score: number, puntosHorizonte: number | undefined): {
  tipo: ProfileType;
  porPuntos: ProfileType;
  tope: { perfil: ProfileType; plazo: string } | null;
} {
  const porPuntos = getProfile(score);
  const tope = puntosHorizonte !== undefined ? TOPE_POR_HORIZONTE[puntosHorizonte] : undefined;
  if (tope && ORDEN_PERFILES.indexOf(tope.perfil) < ORDEN_PERFILES.indexOf(porPuntos)) {
    return { tipo: tope.perfil, porPuntos, tope };
  }
  return { tipo: porPuntos, porPuntos, tope: null };
}

/**
 * Posición de la flecha en la barra de cinco segmentos (0-100 %).
 *
 * El mapeo lineal 10-40 → 0-100 dejaba los topes de tramo (16, 22, 28 y 34) clavados en
 * 20 %, 40 %, 60 % y 80 %, es decir sobre la línea divisoria con el tramo siguiente:
 * con `translateX(-50%)` la punta quedaba repartida entre los dos colores mientras el
 * texto anunciaba el de abajo (Inspector, 20/08/2026). Se separa medio punto de cada
 * frontera para que la flecha caiga siempre DENTRO del segmento que se ha nombrado.
 */
function getBarPosition(score: number, tipo: ProfileType = getProfile(score)): number {
  // El segmento se deriva del PERFIL, no de un mapeo lineal: con 10-40 → 0-100 los topes
  // de tramo caían clavados en las fronteras (22 → 40 %), y redondearlos hacia dentro con
  // Math.floor los mandaba al segmento de al lado, que es el error contrario.
  // Con el tope por horizonte (3312) el perfil puede ser más bajo que el de la puntuación: la
  // flecha va al segmento del perfil NOMBRADO, en su extremo alto.
  const indice = Math.max(0, ORDEN_PERFILES.indexOf(tipo));
  const [min, max] = PROFILES[tipo].range;
  const anchoSegmento = 100 / ORDEN_PERFILES.length;
  const margen = 2;
  const enTramo = Math.min(max, Math.max(min, score));
  const proporcion = max > min ? (enTramo - min) / (max - min) : 0.5;
  return indice * anchoSegmento + margen + proporcion * (anchoSegmento - 2 * margen);
}

/**
 * Dónde se guarda el test a medio hacer.
 *
 * Vivía solo en `useState`: recargar a mitad del cuestionario borraba las respuestas sin
 * previo aviso y devolvía a la portada (Inspector, 20/08/2026). Va a `sessionStorage`
 * —no a `localStorage`— porque es un test de una sentada: sobrevive a un F5 accidental,
 * y no reaparece semanas después con respuestas que ya no son las de esa persona.
 */
const CLAVE_SESION = 'meskeia:test-perfil-inversor:v1';

interface EstadoGuardado {
  currentQuestion: number;
  answers: Record<number, number>;
  /**
   * 15/10/2026 (hallazgo 3313) — `'result'` si el test se TERMINÓ. «Ver Resultado» borraba la
   * sesión y el resultado vivía solo en el estado de React: volver con «Atrás» desde «Simular
   * esta Cartera» o pulsar F5 devolvía a la portada y había que repetir las diez preguntas.
   * Sin el campo (sesiones de antes), es un test a medias.
   */
  fase?: 'questions' | 'result';
}

/**
 * Borra la sesión guardada. Fuera del componente porque `leerSesion` también la necesita:
 * una sesión que no se puede interpretar hay que RETIRARLA, no solo ignorarla (1213).
 */
function borrarSesion(): void {
  try {
    sessionStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_VISTA);
  } catch {
    // Nada que limpiar si no había dónde guardar.
  }
}

/**
 * ⚠️ 18/10/2026 (hallazgo 3366) — DÓNDE estaba la vista al irse, medida desde el principio de la
 * fase. 58544660 (3323, 3324) daba por hecho que tras un F5 o un «Atrás» «la fase recuperada es lo
 * que se estaba mirando» y la traía si quedaba en la mitad baja de la ventana: quien recargaba
 * arriba del todo (aviso legal a la vista, resultado a 663 px) o leyendo el disclaimer de debajo
 * aterrizaba en el principio del resultado, en scrollY 597. Ahora se apunta al irse (`pagehide`)
 * a qué altura de la ventana quedaba el principio de la fase, y al volver se deja ahí: la vista
 * vuelve a lo que se miraba, sea la fase, lo de encima o lo de debajo.
 */
const CLAVE_VISTA = 'meskeia:test-perfil-inversor:vista:v1';

interface VistaGuardada {
  fase: 'questions' | 'result';
  /** `getBoundingClientRect().top` del principio de la fase al irse, en px de la ventana. */
  arriba: number;
}

function guardarVista(vista: VistaGuardada): void {
  try {
    sessionStorage.setItem(CLAVE_VISTA, JSON.stringify(vista));
  } catch {
    // Sin almacenamiento, la vista se corrige como antes de 3366.
  }
}

/** Lee la vista guardada para `fase` y la retira: sirve una vez, la de la carga que la sigue. */
function tomarVista(fase: 'questions' | 'result'): number | null {
  try {
    const bruto = sessionStorage.getItem(CLAVE_VISTA);
    sessionStorage.removeItem(CLAVE_VISTA);
    if (!bruto) return null;
    const datos = JSON.parse(bruto) as Partial<VistaGuardada> | null;
    if (!datos || datos.fase !== fase || typeof datos.arriba !== 'number' || !Number.isFinite(datos.arriba)) return null;
    return datos.arriba;
  } catch {
    return null;
  }
}

/**
 * ⚠️ 22/09/2026 (hallazgo 1213) — validaba solo la FORMA, y encima mal.
 *
 * `typeof datos.answers === 'object'` es true para `null`, así que `answers: null` pasaba el
 * filtro y `Object.keys(null)` reventaba dentro del useEffect de recuperación; y del índice de
 * pregunta no se comprobaba el rango, así que un `currentQuestion: 42` dejaba `QUESTIONS[42]`
 * en undefined y `question.id` tumbaba el render. Las dos variantes daban «Algo salió mal».
 *
 * Y lo peor no era la caída sino que se quedaba PEGADA: al no borrarse la clave, cada recarga
 * de esa pestaña volvía a caer en la misma piedra y «Intentar de nuevo» no servía de nada. El
 * comentario del catch prometía justo lo contrario —«se empieza de cero»—, que es lo que ahora
 * hace de verdad: lo que no se puede interpretar se retira.
 */
function leerSesion(): EstadoGuardado | null {
  let bruto: string | null;
  try {
    bruto = sessionStorage.getItem(CLAVE_SESION);
  } catch {
    // Ventana privada o almacenamiento bloqueado: se empieza de cero, y no hay qué borrar.
    return null;
  }
  if (!bruto) return null;

  try {
    const datos = JSON.parse(bruto) as unknown;
    if (!datos || typeof datos !== 'object') throw new Error('la sesión no es un objeto');

    const { currentQuestion, answers, fase } = datos as Partial<EstadoGuardado>;

    if (fase !== undefined && fase !== 'questions' && fase !== 'result') {
      throw new Error('fase desconocida');
    }

    // El índice tiene que apuntar a una pregunta que existe: entero y dentro del cuestionario.
    if (
      typeof currentQuestion !== 'number' ||
      !Number.isInteger(currentQuestion) ||
      currentQuestion < 0 ||
      currentQuestion >= QUESTIONS.length
    ) {
      throw new Error('índice de pregunta fuera del cuestionario');
    }

    // `typeof null === 'object'`, y un array tampoco es un mapa de respuestas.
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      throw new Error('las respuestas no son un mapa');
    }

    // Cada entrada tiene que ser una respuesta REAL de su pregunta: la puntuación decide el
    // perfil, así que un valor inventado emitiría un juicio sobre una escala que no existe.
    const limpias: Record<number, number> = {};
    for (const [clave, valor] of Object.entries(answers)) {
      const id = Number(clave);
      const pregunta = QUESTIONS.find((q) => q.id === id);
      if (!pregunta) throw new Error(`la pregunta ${clave} no existe`);
      if (typeof valor !== 'number' || !pregunta.options.some((o) => o.points === valor)) {
        throw new Error(`la respuesta de la pregunta ${clave} no es una de sus opciones`);
      }
      limpias[id] = valor;
    }

    // Un resultado solo se restaura con las diez respuestas: es el mismo listón que el 1214.
    if (fase === 'result' && !QUESTIONS.every((q) => limpias[q.id] !== undefined)) {
      throw new Error('resultado guardado sin todas las respuestas');
    }

    return { currentQuestion, answers: limpias, fase: fase ?? 'questions' };
  } catch {
    // JSON corrupto o contenido que no se puede interpretar: se empieza de cero, y la clave se
    // RETIRA para que la siguiente carga no vuelva a tropezar con ella.
    borrarSesion();
    return null;
  }
}

type Fase = 'start' | 'questions' | 'result';

/**
 * Los cuatro bloques de la cartera de ejemplo, en el orden de la barra y de la leyenda.
 * La clase CSS de cada segmento lleva el mismo nombre que la clave de `allocation`.
 */
const BLOQUES_CARTERA: Array<{ clave: keyof Profile['allocation']; etiqueta: string }> = [
  { clave: 'rv', etiqueta: 'Renta Variable' },
  { clave: 'rf', etiqueta: 'Renta Fija' },
  { clave: 'liq', etiqueta: 'Liquidez' },
  { clave: 'alt', etiqueta: 'Alternativos' },
];

/** Cifra de la cartera como porcentaje español: `30` → «30 %», con espacio duro. */
function porcentajeCartera(valor: number): string {
  return formatPercentage(valor / 100, 0);
}

export default function TestPerfilInversorPage() {
  const [phase, setPhase] = useState<Fase>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  /**
   * Si la fase «questions» viene de una sesión RECUPERADA y no de pulsar «Comenzar» (1221).
   *
   * Quien abandonaba a mitad, se iba a la home por el logo y volvía, aterrizaba en medio de un
   * cuestionario sin una palabra que lo explicara, y en esa fase los únicos botones son las
   * cuatro opciones, «Anterior» y «Siguiente»: la portada quedaba inalcanzable en esa pestaña
   * hasta terminar el test.
   *
   * 15/10/2026 (hallazgo 3311) — guarda CUÁNTAS respuestas se recuperaron, no un sí/no: la cifra
   * del aviso era `Object.keys(answers).length`, que subía con cada respuesta nueva (y el
   * role="status" lo releía cada vez), y el aviso seguía tras terminar, presentando como «a
   * medias» un test de 10 de 10. Ahora dice lo recuperado y se retira al ver el resultado.
   */
  const [respuestasRecuperadas, setRespuestasRecuperadas] = useState<number | null>(null);
  /**
   * La tarjeta de la pregunta, para devolverle el foco al avanzar (1215).
   *
   * «Siguiente» se deshabilita en cuanto se pasa de pregunta —la nueva aún no tiene respuesta—
   * y el navegador suelta el foco al body, así que el siguiente Tab aterrizaba en el pie y
   * había que volver con Shift+Tab, diez veces por test.
   */
  const tarjetaPregunta = useRef<HTMLDivElement>(null);
  /** Primer render de la fase de preguntas: ahí el foco no se roba, lo tiene «Comenzar». */
  const preguntaAnterior = useRef<number | null>(null);

  /**
   * ⚠️ 26/09/2026 (hallazgo 2177) — a dónde se lleva la vista y el foco al cambiar de fase.
   *
   * La portada es mucho más larga que el cuestionario, y el navegador conservaba el scroll de
   * la fase anterior: en un móvil de 360×740, tras «Comenzar Test» solo se veían la opción D,
   * «Anterior», «Siguiente» y el pie (el enunciado quedaba en top −351 px); tras «Revisar», en
   * −644 px, y tras «Repetir», «Comenzar Test» en −948 px. Cada fase tiene ahora un punto de
   * llegada —donde empieza su contenido, y el scroll-padding de globals.css evita que la barra
   * fija del logo lo tape— y un encabezado que recibe el foco, para que quien usa lector de pantalla
   * o teclado sepa dónde ha caído.
   */
  const destinoPortada = useRef<HTMLHeadingElement>(null);
  const destinoCuestionario = useRef<HTMLDivElement>(null);
  const encabezadoPregunta = useRef<HTMLHeadingElement>(null);
  const destinoResultado = useRef<HTMLDivElement>(null);
  const encabezadoResultado = useRef<HTMLHeadingElement>(null);
  /**
   * Solo los cambios de fase que PIDE la persona mueven la vista. La recuperación de sesión
   * también cambia de fase (de «start» a «questions» tras el primer render), pero ahí la página
   * acaba de cargarse arriba del todo y robarle el foco sería un salto que nadie ha pedido.
   */
  const llevarVistaAFase = useRef(false);
  /**
   * ⚠️ 17/10/2026 (hallazgos 3323 y 3324) — lo de arriba («la página acaba de cargarse arriba del
   * todo») no es verdad tras un «Atrás» o un F5: el navegador ya ha restaurado el desplazamiento
   * sobre la PORTADA que sirve el servidor cuando este efecto monta la fase recuperada, y el anclaje
   * de desplazamiento deja la vista tanto más abajo como mide la fase de más (a 360×740, 1.608 px:
   * se aterrizaba en «Apps relacionadas» con el resultado entero por encima; tras un F5 a mitad, con
   * el aviso de recuperado y el enunciado por encima). Tras recuperar, si el principio de la fase
   * ha quedado POR ENCIMA de la ventana, la vista vuelve a él; si está a la vista o por debajo
   * (una llegada normal, arriba del todo), no se mueve. El foco no se toca.
   */
  const corregirVistaTrasRecuperar = useRef(false);

  /** Recupera el test a medio hacer, o el resultado, tras un F5 o un «Atrás». Solo en el primer render del cliente. */
  useEffect(() => {
    const guardado = leerSesion();
    if (!guardado || Object.keys(guardado.answers).length === 0) return;
    corregirVistaTrasRecuperar.current = true;
    setAnswers(guardado.answers);
    setCurrentQuestion(guardado.currentQuestion);
    if (guardado.fase === 'result') {
      // Un test terminado no es un test «a medias»: sin aviso de recuperado (3311, 3313).
      setPhase('result');
      return;
    }
    setPhase('questions');
    // Con las diez contestadas es un test terminado que se estaba REVISANDO, no uno a medias:
    // «Ver Resultado» ya es la salida, y el aviso diría «a medias» de un 10 de 10 (3311).
    const recuperadas = Object.keys(guardado.answers).length;
    if (recuperadas < QUESTIONS.length) setRespuestasRecuperadas(recuperadas);
  }, []);

  /** Lleva la vista al principio de la fase nueva y el foco a su encabezado (2177). */
  useEffect(() => {
    if (!llevarVistaAFase.current) return;
    llevarVistaAFase.current = false;
    const destinos: Record<Fase, [HTMLElement | null, HTMLElement | null]> = {
      start: [destinoPortada.current, destinoPortada.current],
      questions: [destinoCuestionario.current, encabezadoPregunta.current],
      result: [destinoResultado.current, encabezadoResultado.current],
    };
    const [vista, foco] = destinos[phase];
    vista?.scrollIntoView({ block: 'start' });
    foco?.focus({ preventScroll: true });
  }, [phase]);

  /** Tras recuperar la sesión, devuelve la vista al principio de la fase si quedó por encima (3323, 3324). */
  useEffect(() => {
    if (!corregirVistaTrasRecuperar.current || phase === 'start') return;
    corregirVistaTrasRecuperar.current = false;
    const destino = phase === 'result' ? destinoResultado.current : destinoCuestionario.current;
    if (!destino) return;
    // En una recarga o un «Atrás» del documento entero, la fase recuperada es lo que se estaba
    // mirando: si quedó en la mitad baja de la ventana o más abajo, también se trae (el navegador
    // puede restaurar el desplazamiento DESPUÉS del montaje: medido en la suite, nombre del perfil
    // a 827 px en una ventana de 800). En una llegada normal no se mueve nada que esté por debajo.
    const navegacion = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const volvio = navegacion?.type === 'reload' || navegacion?.type === 'back_forward';
    // Si al irse se apuntó dónde quedaba la fase (3366), se vuelve EXACTAMENTE ahí: la fase, lo de
    // encima o lo de debajo, lo que se estuviera mirando. Lo de abajo es el respaldo sin ese dato.
    const arribaAlIrse = volvio ? tomarVista(phase) : null;
    const corregir = () => {
      const margenArriba = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const arriba = destino.getBoundingClientRect().top;
      if (arribaAlIrse !== null) {
        if (Math.abs(arriba - arribaAlIrse) > 1) window.scrollBy(0, arriba - arribaAlIrse);
        return;
      }
      if (arriba < margenArriba - 1 || (volvio && arriba > window.innerHeight / 2)) {
        destino.scrollIntoView({ block: 'start' });
      }
    };
    // Dos fotogramas: el anclaje de desplazamiento ajusta la vista en el layout que sigue al montaje.
    let segundo = 0;
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(corregir);
    });
    // Y otra vez al terminar la carga, por si el navegador restaura el desplazamiento entonces.
    const alCargar = () => requestAnimationFrame(corregir);
    if (document.readyState !== 'complete') window.addEventListener('load', alCargar, { once: true });
    return () => {
      cancelAnimationFrame(primero);
      cancelAnimationFrame(segundo);
      window.removeEventListener('load', alCargar);
    };
  }, [phase]);

  /** Al irse (F5, enlace, cerrar), apunta dónde quedaba el principio de la fase en la ventana (3366). */
  useEffect(() => {
    if (phase === 'start') return;
    const alIrse = () => {
      const destino = phase === 'result' ? destinoResultado.current : destinoCuestionario.current;
      if (destino) guardarVista({ fase: phase, arriba: destino.getBoundingClientRect().top });
    };
    window.addEventListener('pagehide', alIrse);
    return () => window.removeEventListener('pagehide', alIrse);
  }, [phase]);

  /**
   * Al cambiar de pregunta, el foco vuelve a la tarjeta y el cambio se anuncia (1215).
   *
   * El foco va al contenedor con `tabIndex={-1}`, no a la primera opción: enfocar un botón de
   * respuesta lo deja con el anillo de foco puesto y parece elegido.
   */
  useEffect(() => {
    if (phase !== 'questions') {
      preguntaAnterior.current = null;
      return;
    }
    if (preguntaAnterior.current !== null && preguntaAnterior.current !== currentQuestion) {
      /*
       * 14/10/2026 (hallazgo 3285) — en un móvil pequeño «Siguiente» queda bajo el pliegue y, al
       * tocarlo, la pregunta nueva aparecía con la vista abajo: se veían sus opciones y no su
       * enunciado ni «Pregunta N de 10». El foco a la tarjeta no la movía porque la tarjeta es
       * más alta que la pantalla. Si el progreso o el enunciado no se ven enteros, la vista va al
       * principio del cuestionario, como en los cambios de fase (2177); si se ven, no se mueve.
       */
      const destino = destinoCuestionario.current;
      const enunciado = encabezadoPregunta.current;
      if (destino && enunciado) {
        const estilo = getComputedStyle(document.documentElement);
        const margenArriba = parseFloat(estilo.scrollPaddingTop) || 0;
        const margenAbajo = parseFloat(estilo.scrollPaddingBottom) || 0;
        const fueraDeVista =
          destino.getBoundingClientRect().top < margenArriba - 1 ||
          enunciado.getBoundingClientRect().bottom > window.innerHeight - margenAbajo;
        if (fueraDeVista) destino.scrollIntoView({ block: 'start' });
      }
      tarjetaPregunta.current?.focus({ preventScroll: true });
    }
    preguntaAnterior.current = currentQuestion;
  }, [phase, currentQuestion]);

  /** Guarda lo contestado mientras se está respondiendo. */
  useEffect(() => {
    if (phase !== 'questions') return;
    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ currentQuestion, answers }));
    } catch {
      // Almacenamiento no disponible: el test sigue funcionando, solo no sobrevive al F5.
    }
  }, [phase, currentQuestion, answers]);

  const olvidarSesion = borrarSesion;

  /**
   * ⚠️ 15/10/2026 (hallazgos 3299 y 3233) — la segunda mitad de un doble clic o doble toque.
   *
   * «Comenzar Test», «Siguiente →» y «← Anterior» cambian lo que hay bajo el puntero: la vista
   * se recoloca (2177, 3285) o la tarjeta cambia de alto. Con dos activaciones seguidas, la
   * segunda caía sobre lo que acababa de aparecer allí: marcaba una opción de la pregunta nueva
   * sin que nadie la eligiera (a 250 ms con ratón, a 90 ms con el dedo) o pulsaba «← Anterior» y
   * devolvía a la pregunta de antes.
   *
   * Se absorbe una activación con PUNTERO que llega poco después, en el mismo punto, sobre OTRO
   * control y SIN que la página se haya desplazado desde que la app recolocó la vista: es la
   * segunda mitad de la misma intención. Si la persona desplaza la página para buscar una opción
   * y la toca, eso es elegirla, aunque caiga donde estaba el botón. Con teclado (`detail === 0`)
   * no hay puntero que se quede encima, y pulsar dos veces el MISMO botón («Siguiente» repasando
   * respuestas) sigue valiendo.
   */
  const ultimaActivacion = useRef<{
    control: string;
    x: number;
    y: number;
    t: number;
    /** Desplazamiento tras recolocar la vista; null hasta el siguiente fotograma. */
    scrollY: number | null;
  } | null>(null);
  const VENTANA_DOBLE_ACTIVACION_MS = 450;
  const RADIO_DOBLE_ACTIVACION_PX = 12;

  const esSegundaActivacion = (control: string, e: MouseEvent): boolean => {
    const previa = ultimaActivacion.current;
    if (!previa || e.detail === 0 || previa.control === control) return false;
    const sinDesplazarse = previa.scrollY === null || Math.abs(window.scrollY - previa.scrollY) < 2;
    return (
      sinDesplazarse &&
      e.timeStamp - previa.t < VENTANA_DOBLE_ACTIVACION_MS &&
      Math.hypot(e.clientX - previa.x, e.clientY - previa.y) <= RADIO_DOBLE_ACTIVACION_PX
    );
  };

  /** Anota la activación que acaba de cambiar lo que hay bajo el puntero. */
  const anotarActivacion = (control: string, e: MouseEvent): void => {
    if (e.detail === 0) {
      ultimaActivacion.current = null;
      return;
    }
    const registro = { control, x: e.clientX, y: e.clientY, t: e.timeStamp, scrollY: null };
    ultimaActivacion.current = registro;
    // Los efectos que recolocan la vista (2177, 3285) ya han corrido en el fotograma siguiente
    requestAnimationFrame(() => {
      if (ultimaActivacion.current === registro) {
        ultimaActivacion.current = { ...registro, scrollY: window.scrollY };
      }
    });
  };

  /** Cambio de fase pedido por la persona: además de cambiarla, lleva la vista a ella (2177). */
  const irAFase = (fase: Fase) => {
    llevarVistaAFase.current = true;
    setPhase(fase);
  };

  const handleStart = () => {
    irAFase('questions');
    setCurrentQuestion(0);
    setAnswers({});
    setRespuestasRecuperadas(null);
    olvidarSesion();
  };

  const handleAnswer = (questionId: number, points: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: points }));
  };

  /** Vuelve a la última pregunta CONSERVANDO lo contestado. */
  const handleRevisar = () => {
    irAFase('questions');
    setCurrentQuestion(QUESTIONS.length - 1);
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else if (!respuestasCompletas) {
      /**
       * 1214 — Con una sesión restaurada se podía llegar a la última pregunta sin haber
       * contestado las anteriores, y el resultado salía con una puntuación imposible en su propia
       * escala (3 puntos sobre un mínimo de 10). En vez de emitir ese juicio se va a la primera
       * pregunta sin respuesta, que es lo que el flujo normal garantiza deshabilitando el botón.
       */
      const primeraSinRespuesta = QUESTIONS.findIndex((q) => answers[q.id] === undefined);
      if (primeraSinRespuesta >= 0) setCurrentQuestion(primeraSinRespuesta);
    } else {
      irAFase('result');
      // Terminado, ya no es un test «a medias»: el aviso no vuelve al «Revisar» (3311).
      setRespuestasRecuperadas(null);
      // Se guarda como RESULTADO (3313), no como test a medias: quien vuelve con «Atrás» desde
      // el estimador o pulsa F5 aterriza en su resultado, y no en la pregunta 10 (que era lo que
      // evitaba el olvidarSesion de antes) ni en la portada. Aquí y no en un efecto, para que
      // restaurarlo no lo reescriba. «Repetir Test» lo borra.
      try {
        sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ currentQuestion, answers, fase: 'result' }));
      } catch {
        // Almacenamiento no disponible: el resultado se ve igual, solo no sobrevive al F5.
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    irAFase('start');
    setCurrentQuestion(0);
    setAnswers({});
    setRespuestasRecuperadas(null);
    olvidarSesion();
  };

  // Calcular puntuación total
  const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
  const resultadoPerfil = perfilConTope(totalScore, answers[1]);
  const profileType = resultadoPerfil.tipo;
  const profile = PROFILES[profileType];
  /** El tramo que da la PUNTUACIÓN, que con el tope por horizonte no es el del perfil nombrado. */
  const tramoPorPuntos = PROFILES[resultadoPerfil.porPuntos].range;

  /**
   * Los extremos de la escala, derivados del cuestionario y no tecleados (hallazgo 1220): con
   * diez preguntas de 1 a 4 puntos, 10 y 40. Por debajo del mínimo y por encima del máximo no
   * hay «perfil de al lado» al que pasarse, así que ahí el aviso de borde no se pinta.
   */
  const PUNTUACION_MINIMA = QUESTIONS.reduce(
    (suma, q) => suma + Math.min(...q.options.map((o) => o.points)),
    0,
  );
  const PUNTUACION_MAXIMA = QUESTIONS.reduce(
    (suma, q) => suma + Math.max(...q.options.map((o) => o.points)),
    0,
  );
  // Con el tope actuando, un punto más o menos no cambia el perfil: el aviso de borde mentiría.
  // Tampoco en el TECHO del perfil máximo que admite el horizonte (hallazgo 3325): con la 1 en
  // «5 a 10 años» y 28 puntos, un punto más deja el mismo Equilibrado, porque el tope lo impide.
  // En el suelo sí hay perfil de al lado: un punto menos baja de verdad.
  const perfilMaximoPorHorizonte =
    answers[1] !== undefined ? TOPE_POR_HORIZONTE[answers[1]]?.perfil : undefined;
  const enBordeDeTramo =
    resultadoPerfil.tope === null &&
    ((totalScore === profile.range[0] && totalScore > PUNTUACION_MINIMA) ||
      (totalScore === profile.range[1] &&
        totalScore < PUNTUACION_MAXIMA &&
        perfilMaximoPorHorizonte !== profileType));

  /**
   * ⚠️ 22/09/2026 (hallazgo 1214) — el resultado no comprobaba que hubiera diez respuestas.
   *
   * El flujo normal no deja llegar —«Ver Resultado» está deshabilitado sin contestar—, pero una
   * sesión restaurada sí: con dos respuestas guardadas y la décima contestada, la app emitía un
   * juicio con 3 puntos en una escala que empieza en 10 y se contradecía en la misma línea
   * («Conservador · 3 puntos · tramo 10–16»), con la flecha de la barra en left: −16,67 %.
   * `leerSesion` ya no admite respuestas inventadas (1213), pero eso no cubre las que FALTAN.
   */
  const respuestasCompletas = QUESTIONS.every((q) => answers[q.id] !== undefined);

  // `currentQuestion` ya viene acotado por `leerSesion` y por los manejadores; el `??` solo
  // cubre el tipo, porque el índice de un array puede ser undefined.
  const question = QUESTIONS[currentQuestion] ?? QUESTIONS[0];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const selectedAnswer = answers[question.id];

  const hero: Record<Fase, { icono: string; titulo: string; subtitulo: string }> = {
    start: {
      icono: '🎯',
      titulo: 'Test de Perfil Inversor',
      subtitulo: 'Descubre tu tolerancia al riesgo en 5 minutos',
    },
    questions: {
      icono: '🎯',
      titulo: 'Test de Perfil Inversor',
      subtitulo: 'Responde con sinceridad para obtener resultados precisos',
    },
    result: {
      icono: '🎉',
      titulo: '¡Test Completado!',
      subtitulo: 'Aquí está tu perfil de inversor personalizado',
    },
  };

  /*
    ⚠️ 26/09/2026 (hallazgos 2175 y 2176) — UN solo árbol para las tres fases.

    Portada, cuestionario y resultado eran tres `return` distintos, cada uno con su
    `<Footer appName="test-perfil-inversor" />` en otra posición del `.container` (índices 9, 7
    y 5). React no reconcilia un componente que cambia de sitio: lo DESMONTA y lo vuelve a
    montar, y con el Footer su AnalyticsTracker, cuyo efecto de montaje registra una VISITA.
    Cada cambio de fase contaba como una visita nueva (una carga con Comenzar → Ver Resultado
    → Revisar → Ver Resultado → Repetir daba 6), y la recuperación de sesión, que pasa de
    «start» a «questions» justo después del primer render, daba 2 en una sola carga. Eso
    fabricaba la firma de rotura del Analytics (82 % de visitas «cortas», 50 % de «recargas»)
    y dejaba en NULL la duración de las filas intermedias.

    Ahora hay un único `return`: lo común (logo, hero, RegionBadge, LegalNotice, disclaimer,
    guía, RelatedApps, ShareCard y Footer) ocupa siempre la misma posición, y lo que cambia
    con la fase va DENTRO de su hueco condicionado (`{phase === 'x' && …}`), que conserva el
    índice aunque valga `false`. No mover el Footer a un bloque condicionado ni partir este
    `return` en varios: el testigo es `tests/apps/test-perfil-inversor.spec.ts`, que cuenta
    los montajes del tracker a lo largo del recorrido completo.
  */
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">{hero[phase].icono}</span> {hero[phase].titulo}
        </h1>
        <p className={styles.subtitle}>{hero[phase].subtitulo}</p>
      </header>

      {/*
        ⚠️ 22/09/2026 (hallazgo 1217) — app financiera que daba España por supuesta sin decirlo
        (CLAUDE.md §1.bis): no montaba ningún RegionBadge. Los ocho importes de ejemplo van en €,
        aparecen «pensión pública» y «cuenta remunerada», y la guía menciona el test de idoneidad
        de la UE. La metodología —horizonte, experiencia y tolerancia— es universal, así que el
        badge es `es-data` y no `es-only`.
      */}
      <RegionBadge variant="es-data" />

      <LegalNotice lastUpdated="2026-02-02" />

      {/* ─────────────── Portada ─────────────── */}
      {phase === 'start' && (
        <div className={styles.startScreen}>
          <div className={styles.startIcon} aria-hidden="true">📊</div>
          <h2
            className={`${styles.startTitle} ${styles.destinoDeFase}`}
            ref={destinoPortada}
            tabIndex={-1}
          >
            ¿Qué tipo de inversor eres?
          </h2>
          <p className={styles.startDescription}>
            Responde 10 preguntas sobre tu situación financiera, experiencia y actitud
            ante el riesgo. Al final verás cuál de los cinco perfiles de inversor te
            corresponde y ejemplos ilustrativos de lo que suele asociarse a él.
          </p>

          {/*
            Cabo C0251 (decidido en el parte del 17/10/2026): el botón va justo tras el párrafo y
            la lista de ventajas DEBAJO. Detrás de la lista quedaba en 1.369 px a 360×740 (1,94
            pantallas), 1.276 a 412×915 y 1.017 a 1280×800: en ninguna se veía al cargar.
          */}
          <button
            type="button"
            className={styles.startButton}
            onClick={(e) => {
              if (esSegundaActivacion('comenzar', e)) return;
              anotarActivacion('comenzar', e);
              handleStart();
            }}
          >
            Comenzar Test →
          </button>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon} aria-hidden="true">✓</span>
              <span>10 preguntas sencillas</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon} aria-hidden="true">✓</span>
              <span>5 minutos para completar</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon} aria-hidden="true">✓</span>
              <span>Resultado inmediato</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon} aria-hidden="true">✓</span>
              {/* Prometía «Recomendaciones personalizadas», lo que el propio resultado niega:
                  da ejemplos ilustrativos por tramo, no asesoramiento (hallazgo 3286). */}
              <span>Ejemplos según tu perfil</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon} aria-hidden="true">✓</span>
              <span>100&nbsp;% gratuito y privado</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon} aria-hidden="true">✓</span>
              <span>No requiere registro</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── Cuestionario ─────────────── */}
      {phase === 'questions' && (
        <div>
          <div className={styles.destinoDeFase} ref={destinoCuestionario}>
            <div className={styles.progressText}>
              Pregunta {currentQuestion + 1} de {QUESTIONS.length}
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/*
            1221 — Quien vuelve a la URL en la misma pestaña aterrizaba en medio del cuestionario
            sin explicación y sin forma de volver a la portada: en esta fase no hay «Comenzar
            Test» ni «Repetir Test». Es el reverso de la reparación del 20/08/2026, que curó la
            pérdida de estado y no dejó salida.
          */}
          {respuestasRecuperadas !== null && (
            <div className={styles.avisoRecuperado} role="status">
              <p>
                <span aria-hidden="true">↩️</span> Hemos recuperado el test que dejaste a medias en
                esta pestaña, con {respuestasRecuperadas} de {QUESTIONS.length} respuestas.
              </p>
              <button
                type="button"
                className={styles.reiniciarButton}
                onClick={(e) => {
                  // 15/10/2026 (hallazgo 3310) — era el único botón sin la guarda, y el único que
                  // BORRA: tras recolocar la vista queda bajo el dedo que acaba de tocar «Siguiente»
                  // o «Revisar», y el segundo toque de un doble toque vaciaba el test.
                  if (esSegundaActivacion('reiniciar', e)) return;
                  anotarActivacion('reiniciar', e);
                  handleRestart();
                }}
              >
                Empezar de cero
              </button>
            </div>
          )}

          {/*
            1215 — `tabIndex={-1}` para poder recibir el foco por programa sin entrar en el orden
            de tabulación, y el `aria-live` para que el cambio de pregunta se anuncie: el único
            [aria-live] de esta fase era el anunciador de rutas de Next, que es de Next.
          */}
          <div
            className={styles.questionCard}
            ref={tarjetaPregunta}
            tabIndex={-1}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={styles.questionNumber}>Pregunta {question.id}</span>
            <h2
              className={`${styles.questionText} ${styles.focoDeFase}`}
              ref={encabezadoPregunta}
              tabIndex={-1}
            >
              {question.text}
            </h2>

            <div className={styles.optionsGrid}>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  // La respuesta elegida solo se comunicaba por la clase CSS «selected», así
                  // que quien no ve la pantalla no podía saber qué tenía marcado.
                  aria-pressed={selectedAnswer === option.points}
                  className={`${styles.optionButton} ${selectedAnswer === option.points ? styles.selected : ''}`}
                  onClick={(e) => {
                    if (esSegundaActivacion('opcion', e)) return;
                    handleAnswer(question.id, option.points);
                  }}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={styles.optionText}>{option.text}</span>
                </button>
              ))}
            </div>

            <div className={styles.navigation}>
              <button
                type="button"
                className={`${styles.navButton} ${styles.prev}`}
                onClick={(e) => {
                  if (esSegundaActivacion('anterior', e)) return;
                  anotarActivacion('anterior', e);
                  handlePrev();
                }}
                disabled={currentQuestion === 0}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className={`${styles.navButton} ${styles.next}`}
                onClick={(e) => {
                  if (esSegundaActivacion('siguiente', e)) return;
                  anotarActivacion('siguiente', e);
                  handleNext();
                }}
                disabled={selectedAnswer === undefined}
              >
                {/*
                  Solo cambia de rótulo cuando el botón está HABILITADO y aun así faltan
                  respuestas, que es el caso patológico del 1214 (llegar a la última desde una
                  sesión restaurada incompleta): ahí prometer «Ver Resultado» y no darlo sería la
                  mitad mala de la reparación. Deshabilitado por no haber contestado ESTA
                  pregunta, «Ver Resultado» sigue siendo lo correcto y lo que dice desde siempre.
                */}
                {currentQuestion === QUESTIONS.length - 1
                  ? respuestasCompletas || selectedAnswer === undefined
                    ? 'Ver Resultado'
                    : 'Completar las que faltan →'
                  : 'Siguiente →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── Resultado ─────────────── */}
      {phase === 'result' && (
        <div
          className={`${styles.resultScreen} ${styles.destinoDeFase}`}
          ref={destinoResultado}
        >
          <div className={styles.resultHeader}>
            <div className={styles.resultIcon} aria-hidden="true">{profile.icon}</div>
            <h2
              className={`${styles.resultTitle} ${styles.focoDeFase}`}
              ref={encabezadoResultado}
              tabIndex={-1}
            >
              {/* Hallazgo 3367: el perfil va dentro del encabezado, que es lo que anuncia el lector
                  de pantalla al recibir el foco y lo que sale en la lista de encabezados. */}
              Tu perfil es:{' '}
              <span className={styles.resultProfile}>{profile.name}</span>
            </h2>
            {/* La app entera se apoya en la puntuación —su propia FAQ pregunta qué pasa si
                las respuestas quedan en el límite entre dos perfiles— y no la enseñaba
                nunca: no había forma de saberse en el borde ni de rehacer la cuenta. */}
            <p className={styles.resultScore}>
              {formatNumber(totalScore, 0)} puntos · tramo {formatNumber(tramoPorPuntos[0], 0)}–{formatNumber(tramoPorPuntos[1], 0)}
              {/*
                ⚠️ 22/09/2026 (hallazgo 1220) — la condición era `totalScore === range[0] ||
                totalScore === range[1]` a secas, sin excluir el suelo y el techo de la ESCALA, así
                que en 10 y en 40 avisaba de un «perfil de al lado» que no existe: ni el 9 ni el 41
                son puntuaciones posibles con diez preguntas de 1 a 4 puntos.
              */}
              {enBordeDeTramo ? (
                <span className={styles.resultScoreBorde}>
                  {' '}— estás justo en el borde del tramo: con un punto de diferencia el
                  resultado sería el perfil de al lado
                </span>
              ) : null}
            </p>
            {/* 3312 — cuando el horizonte rebaja el perfil, se dice: la puntuación y su tramo
                apuntan a otro, y sin esta línea el resultado parecería contradecirse. */}
            {resultadoPerfil.tope ? (
              <p className={styles.resultTope}>
                Tu horizonte de {resultadoPerfil.tope.plazo} limita el perfil a{' '}
                {PROFILES[resultadoPerfil.tope.perfil].name}; el resto de tus respuestas apuntaba
                a {PROFILES[resultadoPerfil.porPuntos].name}.
              </p>
            ) : null}
          </div>

          {/* Barra visual de perfil */}
          <div className={styles.profileBar}>
            <div className={`${styles.profileSegment} ${styles.conservador}`} style={{ width: '20%' }} />
            <div className={`${styles.profileSegment} ${styles.moderado}`} style={{ width: '20%' }} />
            <div className={`${styles.profileSegment} ${styles.equilibrado}`} style={{ width: '20%' }} />
            <div className={`${styles.profileSegment} ${styles.dinamico}`} style={{ width: '20%' }} />
            <div className={`${styles.profileSegment} ${styles.agresivo}`} style={{ width: '20%' }} />
          </div>
          <div className={styles.profileMarker}>
            <span
              className={styles.profileArrow}
              style={{ left: `${getBarPosition(totalScore, profileType)}%` }}
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
          {/* Hallazgo 3228: una columna por segmento, con guion blando para el móvil. */}
          <div className={styles.profileLabels}>
            <span>Conser{'­'}vador</span>
            <span>Mode{'­'}rado</span>
            <span>Equili{'­'}brado</span>
            <span>Diná{'­'}mico</span>
            <span>Agre{'­'}sivo</span>
          </div>

          {/* Descripción */}
          <div className={styles.profileDescription}>
            <h3>Descripción de tu perfil</h3>
            <p>{profile.description}</p>
          </div>

          {/* Características */}
          <div className={styles.profileTraits}>
            <div className={styles.traitCard}>
              <div className={styles.traitIcon} aria-hidden="true">⚠️</div>
              <span className={styles.traitLabel}>Nivel de riesgo</span>
              <span className={styles.traitValue}>{profile.traits.riesgo}</span>
            </div>
            <div className={styles.traitCard}>
              <div className={styles.traitIcon} aria-hidden="true">📅</div>
              <span className={styles.traitLabel}>Horizonte ideal</span>
              <span className={styles.traitValue}>{profile.traits.horizonte}</span>
            </div>
            <div className={styles.traitCard}>
              <div className={styles.traitIcon} aria-hidden="true">📊</div>
              <span className={styles.traitLabel}>Volatilidad esperada</span>
              <span className={styles.traitValue}>{profile.traits.volatilidad}</span>
            </div>
            <div className={styles.traitCard}>
              <div className={styles.traitIcon} aria-hidden="true">🎯</div>
              <span className={styles.traitLabel}>Objetivo principal</span>
              <span className={styles.traitValue}>{profile.traits.objetivo}</span>
            </div>
          </div>

          {/* Distribución recomendada */}
          <div className={styles.allocationSection}>
            <h3>
              <span aria-hidden="true">📊</span> Distribución de activos de ejemplo para este perfil
            </h3>
            {/*
              ⚠️ 26/09/2026 (hallazgo 2178) — las cifras iban en blanco sobre los cuatro colores de
              marca y ninguna llegaba a 4,5:1 (4,11 · 2,80 · 2,26 · 1,81). El azul pasa a
              --primary-boton (blanco encima: 5,47:1) y los tres claros llevan texto oscuro; la
              cifra se oculta sola en el segmento que no la cabe (consulta de contenedor en el CSS),
              porque la leyenda de debajo repite los cuatro valores.
            */}
            <div className={styles.allocationBar}>
              {BLOQUES_CARTERA.filter(({ clave }) => profile.allocation[clave] > 0).map(({ clave }) => (
                <div
                  key={clave}
                  className={`${styles.allocationSegment} ${styles[clave]}`}
                  style={{ width: `${profile.allocation[clave]}%` }}
                >
                  <span className={styles.allocationCifra}>
                    {porcentajeCartera(profile.allocation[clave])}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.allocationLegend}>
              {BLOQUES_CARTERA.map(({ clave, etiqueta }) => (
                <div className={styles.legendItem} key={clave}>
                  <div className={`${styles.legendColor} ${styles[clave]}`} />
                  <span>
                    {etiqueta} ({porcentajeCartera(profile.allocation[clave])})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones */}
          <div className={styles.profileDescription}>
            <h3><span aria-hidden="true">💡</span> Ideas que suelen asociarse a este perfil</h3>
            <p className={styles.recomendacionesNota}>
              Son <strong>ejemplos ilustrativos</strong>, no una recomendación de inversión ni
              de producto: los nombres concretos que aparecen sirven para reconocer categorías,
              y proceden en buena parte de la literatura financiera anglosajona, que no siempre
              encaja con la fiscalidad ni con la oferta de cada país.
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
              {profile.recommendations.map((rec, index) => (
                <li key={index} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Acciones */}
          <div className={styles.resultActions}>
            <Link
              href={`/estimador-cartera-inversion/?perfil=${profileType}`}
              className={`${styles.actionButton} ${styles.primary}`}
            >
              <span aria-hidden="true">📊</span> Simular esta Cartera
            </Link>
            <Link href="/estimador-inversiones/" className={`${styles.actionButton} ${styles.secondary}`}>
              <span aria-hidden="true">💼</span> Estimador de Inversiones
            </Link>
            <button
              type="button"
              onClick={(e) => {
                if (esSegundaActivacion('revisar', e)) return;
                anotarActivacion('revisar', e);
                handleRevisar();
              }}
              className={`${styles.actionButton} ${styles.secondary}`}
            >
              <span aria-hidden="true">✏️</span> Revisar mis respuestas
            </button>
            <button
              type="button"
              onClick={(e) => {
                if (esSegundaActivacion('repetir', e)) return;
                anotarActivacion('repetir', e);
                handleRestart();
              }}
              className={`${styles.actionButton} ${styles.secondary}`}
            >
              <span aria-hidden="true">🔄</span> Repetir Test
            </button>
          </div>
        </div>
      )}

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="test-perfil-inversor"
        collapsible={false}
      />

      <EducationalSection
        title="¿Quieres aprender más sobre perfiles de inversor?"
        subtitle="Descubre qué significan los perfiles, cómo influyen en tu estrategia y conceptos clave"
      >
        <GuiaPerfilInversor />
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="test-perfil-inversor" />

      <Footer appName="test-perfil-inversor" />
    </div>
  );
}

/**
 * Contenido de la guía educativa. Aparte del componente principal solo para que su `return`
 * se lea: va dentro de <EducationalSection>, que ocupa siempre la misma posición del árbol.
 */
function GuiaPerfilInversor() {
  return (
    <>
      <section className={styles.guideSection}>
        <h2>Conceptos Clave</h2>
        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <h4><span aria-hidden="true">🎯</span> ¿Qué es el perfil inversor?</h4>
            <p>
              Es una clasificación que combina tu tolerancia al riesgo, horizonte temporal,
              situación financiera y objetivos. Determina qué tipo de inversiones son
              más adecuadas para ti y cómo distribuir tu cartera.
            </p>
          </div>
          <div className={styles.contentCard}>
            <h4><span aria-hidden="true">📊</span> Renta Variable vs Renta Fija</h4>
            <p>
              La renta variable (acciones, fondos) tiene mayor potencial de rentabilidad
              pero más volatilidad. La renta fija (bonos, depósitos) es más estable pero
              con menor rentabilidad esperada. Tu perfil determina la proporción ideal.
            </p>
          </div>
          <div className={styles.contentCard}>
            <h4><span aria-hidden="true">⏰</span> Horizonte temporal</h4>
            <p>
              El tiempo que puedes mantener la inversión es crucial. A más largo plazo,
              puedes asumir más riesgo porque tienes tiempo de recuperarte de caídas.
              A corto plazo, necesitas inversiones más conservadoras.
            </p>
          </div>
          <div className={styles.contentCard}>
            <h4><span aria-hidden="true">💰</span> Diversificación</h4>
            <p>
              No pongas todos los huevos en la misma cesta. Diversificar entre diferentes
              tipos de activos, sectores y geografías reduce el riesgo global de tu
              cartera sin sacrificar necesariamente la rentabilidad esperada.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.guideSection}>
        <h2>Preguntas Frecuentes</h2>
        <div className={styles.faqGrid}>
          <details className={styles.faqItem}>
            <summary>¿Puede cambiar mi perfil inversor con el tiempo?</summary>
            <p>
              Sí, es normal que cambie. A medida que te acercas a la jubilación, sueles
              volverte más conservador. También puede cambiar por eventos vitales (herencia,
              pérdida de empleo, matrimonio) o simplemente por más experiencia invirtiendo.
              Se recomienda revisar el perfil anualmente.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Es malo ser conservador?</summary>
            <p>
              No existe un perfil &quot;mejor&quot; o &quot;peor&quot;. Lo importante es que se ajuste a tu
              situación real. Un perfil conservador es perfectamente válido si tienes
              horizonte corto, baja tolerancia a pérdidas, o necesitas preservar capital.
              Lo malo sería invertir de forma agresiva cuando no puedes permitirte perder.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Debo invertir todo según mi perfil?</summary>
            <p>
              El perfil es una guía, no una regla absoluta. Puedes tener una parte más
              conservadora (fondo de emergencia, metas a corto plazo) y otra más agresiva
              (jubilación lejana). Lo importante es entender por qué tomas cada decisión.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Qué pasa si mis respuestas están en el límite entre dos perfiles?</summary>
            <p>
              Es normal. Los perfiles son un espectro, no categorías rígidas. Si estás entre
              &quot;moderado&quot; y &quot;equilibrado&quot;, puedes elegir una distribución intermedia. Además,
              puedes ajustar según tu intuición personal y experiencia previa. La excepción es el
              horizonte: tu respuesta a la pregunta 1 fija el perfil más alto al que llega el test, y
              el de encima de ese no es una opción intermedia para tu plazo.
              {/* Hallazgo 3325: sin esta frase, la FAQ animaba a subir un escalón que el tope no admite. */}
            </p>
          </details>
        </div>
      </section>

      {/* Tabla Comparativa de Perfiles */}
      <section className={styles.comparativaSection}>
        <h2>Comparativa de Perfiles de Inversor</h2>
        <p className={styles.comparativaSubtitle}>
          Compara los 5 perfiles en los criterios más relevantes para elegir la estrategia adecuada
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Criterio</th>
                <th><span aria-hidden="true">🛡️</span> Conservador</th>
                <th><span aria-hidden="true">⚖️</span> Moderado</th>
                <th><span aria-hidden="true">📊</span> Equilibrado</th>
                <th><span aria-hidden="true">📈</span> Dinámico</th>
                <th><span aria-hidden="true">🚀</span> Agresivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Hallazgo 3227 (20/10/2026): eran tramos «históricos» tecleados sin fuente que no
                    cuadraban con el estimador; ahora es lo que calcula su motor para la cartera. */}
                <td><strong>Rentabilidad esperada</strong></td>
                {(Object.keys(PROFILES) as ProfileType[]).map((tipo) => (
                  <td key={tipo}>{formatPercentage(parametrosDe(tipo).rentabilidad, 2)}</td>
                ))}
              </tr>
              <tr>
                <td colSpan={6} style={{ fontSize: '0.85em', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  Rentabilidad nominal media anual (antes de inflación, comisiones e impuestos) y volatilidad anual que
                  calcula el simulador de cartera al que lleva «Simular esta Cartera», con sus hipótesis para cada clase
                  de activo. Son supuestos del modelo, no datos medidos ni una promesa.
                </td>
              </tr>
              {/* Hallazgo 3232 (20/10/2026): la tabla llamaba «Volatilidad máxima» y «Horizonte
                  mínimo» a las mismas cifras que el resultado rotula «esperada» e «ideal», y las
                  tecleaba aparte. Ahora las lee de PROFILES, con el rótulo del resultado. */}
              <tr>
                <td><strong>Volatilidad esperada</strong></td>
                {Object.values(PROFILES).map((p) => (
                  <td key={p.name}>{p.traits.volatilidad.replace('-', '–')}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Renta variable (%)</strong></td>
                {Object.values(PROFILES).map((p) => (
                  <td key={p.name}>{p.allocation.rv}&nbsp;%</td>
                ))}
              </tr>
              <tr>
                <td><strong>Horizonte ideal</strong></td>
                {Object.values(PROFILES).map((p) => (
                  <td key={p.name}>{p.traits.horizonte.replace('-', '–')}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Activos típicos</strong></td>
                <td>Depósitos, bonos corto</td>
                <td>Mixtos conservadores</td>
                <td>Mixto global {PROFILES.equilibrado.allocation.rv}/{PROFILES.equilibrado.allocation.rf}/{PROFILES.equilibrado.allocation.liq}/{PROFILES.equilibrado.allocation.alt}</td>
                <td>ETFs renta variable</td>
                <td>100&nbsp;% acciones globales</td>
              </tr>
              <tr>
                <td><strong>Pérdida máxima soportable</strong></td>
                <td>–5&nbsp;%</td>
                <td>–10&nbsp;%</td>
                <td>–20&nbsp;%</td>
                <td>–30&nbsp;%</td>
                <td>–50&nbsp;%+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Casos de Uso Reales */}
      <section className={styles.escenariosSection}>
        <h2>Perfiles en la Vida Real</h2>
        <p className={styles.escenariosSubtitle}>
          Ejemplos concretos de qué perfil corresponde a cada situación vital
        </p>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👤</span>
              <h3>Joven de 25 años</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              {/* 1219 — «Puede ahorrar 200€/mes» fijaba una capacidad de ahorro concreta en un
                  ejemplo que se lee como el caso típico. Lo que define el escenario es el
                  HORIZONTE, no la cifra. */}
              <code>Primer empleo estable. Sin hijos. Puede reservar una cantidad fija cada mes. No necesita el dinero hasta los 40+.</code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Perfil recomendado: Dinámico o Agresivo.</strong> El tiempo es su mayor aliado.
              Puede soportar mercados bajistas de 2–3 años. Un crash a los 30 no importa si invierte hasta los 60.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
              <h3>Familia con hipoteca</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              <code>Pareja de 40 años, 2 hijos. Hipoteca de 1.000&nbsp;€/mes. Quieren complementar la jubilación.</code>
            </div>
            <p className={styles.escenarioTip}>
              {/* 3302 — decía que 20–25 años «es el horizonte de» Equilibrado (5–10) y Dinámico
                  (10–15), que no lo contienen: por horizonte solo, sería el del Agresivo (> 15).
                  Lo que baja el perfil son las obligaciones fijas, y así se dice. */}
              <strong>Perfil recomendado: Equilibrado o Dinámico.</strong> El dinero de la jubilación no
              se toca en 20–25 años, un horizonte que por sí solo admitiría incluso el Agresivo (más de 15
              años). Lo que lo modera son las obligaciones financieras fijas: con una hipoteca y dos hijos,
              una caída grande en el corto plazo pesa más, y por eso se quedan un escalón o dos por debajo.
              Cosa distinta es el colchón de emergencia, que va aparte y en liquidez.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
              <h3>Pre-jubilado de 55 años</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              <code>10 años para jubilarse. 100.000&nbsp;€ ahorrados. Necesitará el dinero a partir de los 65.</code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Perfil recomendado: Moderado o Equilibrado.</strong> Un desplome a los 60 años sería
              difícil de recuperar y la preservación del capital pesa mucho, pero quedan 10 años hasta el
              primer reintegro y el dinero se irá retirando poco a poco después: el horizonte declarado del
              Conservador (menos de 3 años) es más corto que el de esta situación.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
              <h3>Empresario con excedente</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              <code>45 años. Ingresos variables pero altos. 200.000&nbsp;€ para invertir. Ya tiene inmuebles y negocio.</code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Perfil recomendado: Equilibrado o Dinámico.</strong> Patrimonio diversificado reduce el riesgo global.
              Los 200.000&nbsp;€ son solo una parte. Puede asumir más riesgo en este capital específico.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Avanzado */}
      <section className={styles.faqSection}>
        <h2>Preguntas Frecuentes Avanzadas</h2>
        <div className={styles.faqList}>
          <div className={styles.faqSectionItem}>
            <h3>¿Qué diferencia hay entre el perfil moderado y el equilibrado?</h3>
            <p>
              La diferencia principal está en el <strong>porcentaje de renta variable</strong>: el moderado tiene
              un 30&nbsp;% en bolsa frente al 50&nbsp;% del equilibrado. El moderado prefiere más bonos y estabilidad,
              mientras que el equilibrado acepta más volatilidad a cambio de mayor crecimiento potencial.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Si dudas entre ambos, elige el moderado. Es más fácil ser más agresivo en el futuro que
              recuperarse de una pérdida que no soportas emocionalmente.
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Puedo tener dos perfiles diferentes para distintos objetivos?</h3>
            <p>
              {/* 3301 — un salto de línea pegado a una etiqueta se come el espacio en JSX: los {' '}
                  de este bloque y de la guía no sobran. 3302 — la jubilación a 30+ años es un
                  horizonte de más de 15, el del Agresivo en el resultado y en el consejo de abajo. */}
              Sí, y de hecho es lo más inteligente. Puedes ser <strong>conservador para tu fondo de emergencia</strong>{' '}
              (3–6 meses de gastos en cuenta remunerada) y <strong>dinámico o agresivo para la jubilación</strong>{' '}
              (que queda a 30+ años). Cada objetivo tiene su propio horizonte temporal y tolerancia al riesgo.
            </p>
            <p className={styles.faqTip}>
              {/* Hallazgo 3326: los cubos siguen los plazos de la pregunta 1 y el tope del resultado
                  (medio plazo, de 2 a 5 años → moderado; largo plazo, de 5 a 10 → equilibrado). */}
              <span aria-hidden="true">💡</span> Técnica &quot;bucket&quot;: Divide tu capital en cubos: corto plazo (conservador), medio plazo
              (moderado), largo plazo (equilibrado) y el dinero que no necesitarás en más de 10 años
              (dinámico o agresivo).
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Cómo afecta la inflación a mi elección de perfil?</h3>
            <p>
              La inflación es el &quot;riesgo invisible&quot; que erosiona el poder adquisitivo del dinero parado.
              Con una inflación del 3&nbsp;%, un perfil <strong>demasiado conservador puede perder poder adquisitivo</strong>{' '}
              en términos reales aunque no pierda dinero nominalmente. Por eso, incluso los más conservadores
              deben buscar algo por encima de la inflación.
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Debería ser más agresivo por ser joven?</h3>
            <p>
              El tiempo es la variable más importante. <strong>A los 25 años, un crash del 50&nbsp;% tiene 35 años
              para recuperarse</strong>; a los 60 años, puede ser catastrófico. Sin embargo, ser joven no es
              suficiente: también necesitas la estabilidad financiera para no vender en pánico durante caídas.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> La regla orientativa anglosajona de &quot;110 menos edad&quot; es una heurística simplificada,
              no el resultado de un test de idoneidad. Tu porcentaje real depende de tu situación completa:
              la pensión pública que te corresponda en tu país, patrimonio inmobiliario, ingresos y
              tolerancia emocional al riesgo.
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Qué pasa si el banco me asigna un perfil diferente?</h3>
            <p>
              {/* 1217 — MiFID II es una norma de la UE y se afirmaba de «los bancos» en
                  general, ante un público que es hispanohablante, no solo europeo. */}
              En la Unión Europea, los bancos y las gestoras tienen que hacer un test de idoneidad
              (MiFID II) por obligación legal, y en otros países existen exigencias equivalentes con
              otro nombre. {/* Hallazgo 3229 (20/10/2026; decidido por el usuario): atribuía al test
              del banco un sesgo sin fuente y presentaba este, sin validar, como «más objetivo». */}
              Esa evaluación la exige la norma y tiene en cuenta datos que este test no pide;{' '}
              <strong>este test es orientativo</strong>. Si los dos resultados difieren, pregunta al
              banco en qué se basa el suyo.
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            {/* Hallazgo 3230: la misma constante que el FAQPage de metadata.ts. */}
            <h3>{PREGUNTA_REVISAR_PERFIL}</h3>
            <p>{RESPUESTA_REVISAR_PERFIL}</p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Existe un perfil &quot;perfecto&quot; para todos?</h3>
            <p>
              No. El perfil óptimo es personal y depende de factores únicos: tu edad, ingresos, deudas,
              dependientes a cargo, experiencia inversora y, sobre todo, cómo reaccionas emocionalmente
              ante pérdidas. <strong>El mejor perfil es el que puedes mantener sin vender en pánico</strong>{' '}
              durante una crisis de mercado.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Warren Buffett: &quot;Nunca inviertas en algo que no puedas entender&quot;. Con tus inversiones:
              nunca asumas un riesgo que no puedas soportar emocionalmente.
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Qué es la aversión al riesgo conductual?</h3>
            <p>
              Es la tendencia humana a sentir las pérdidas el doble de intensamente que las ganancias
              equivalentes (teoría de la perspectiva de Kahneman y Tversky). Esto lleva a <strong>vender en el peor
              momento</strong> (en crisis) y comprar tarde (en euforia). Conocer tu perfil te ayuda a
              tomar decisiones más racionales y menos emocionales.
            </p>
          </div>
        </div>
      </section>

      {/* Guía Paso a Paso */}
      <section className={styles.stepGuideSection}>
        <h2>Cómo Determinar tu Perfil Real en 7 Pasos</h2>
        <div className={styles.stepGuide}>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Calcula tu colchón de emergencia</h3>
              {/* 1219 — lo ponía como requisito previo y en imperativo. La cifra de 3-6 meses
                  es una referencia habitual, no un umbral que todo el mundo pueda alcanzar
                  antes de empezar: §1.quinquies punto 2 nombra expresamente este caso. */}
              <p>
                Cuanto mayor sea el colchón de gastos fijos que puedas reservar en una cuenta de
                fácil acceso, menos probable es que un imprevisto te fuerce a vender inversiones
                en el peor momento. Como referencia se citan a menudo <strong>3–6 meses</strong>,
                pero eso depende de la estabilidad de tus ingresos y de tus gastos: con un
                colchón pequeño lo prudente es invertir menos, no dejar de empezar.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Identifica para qué inviertes</h3>
              <p>
                Define un objetivo concreto: <strong>jubilación, comprar casa en 10 años, educación de hijos
                o independencia financiera</strong>. Cada objetivo tiene un horizonte temporal diferente,
                lo que determinará cuánto riesgo puedes asumir en esa parte de tu patrimonio.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Determina cuándo necesitarás el dinero</h3>
              {/* Hallazgos 3326 y 3232 (paso 3): la regla era «menos de 3 años → conservador; 3–7 →
                  moderado/equilibrado; más de 10 → dinámico/agresivo», que chocaba con el tope que
                  aplica el resultado (3312) y dejaba sin perfil de 7 a 10 años. Ahora sale de
                  TOPE_POR_HORIZONTE, la misma tabla que usa el resultado. */}
              <p>
                Es la regla que aplica este test, según cuándo necesitarás el dinero:{' '}
                {Object.values(TOPE_POR_HORIZONTE).map((t, i) => (
                  <span key={t.plazo}>
                    {i > 0 ? '; ' : ''}
                    <strong>
                      {t.plazo} → como mucho {PROFILES[t.perfil].name.toLowerCase()}
                    </strong>
                  </span>
                ))}
                . Con más de 10 años el plazo no limita, y deciden el resto de tus respuestas
                (dinámico o agresivo si las sostienen). El horizonte temporal es el factor más
                objetivo para definir tu perfil.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Evalúa tu tolerancia emocional honestamente</h3>
              <p>
                Imagina que tu cartera de 10.000&nbsp;€ vale 6.000&nbsp;€ mañana. <strong>¿Vendes, mantienes o compras más?</strong>{' '}
                Tu respuesta honesta vale más que cualquier teoría financiera. Muchos inversores creen ser
                agresivos hasta que experimentan su primer mercado bajista real.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Completa el test con sinceridad absoluta</h3>
              <p>
                Responde lo que <strong>harías de verdad</strong>, no lo que &quot;deberías&quot; hacer.
                El test mide tu situación real, no tu conocimiento financiero teórico. Engañarse a uno mismo
                conduce a tomar un perfil inadecuado y arrepentirse en la primera caída seria del mercado.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Ajusta la distribución a tu situación concreta</h3>
              <p>
                El resultado del test es un <strong>punto de partida, no una sentencia</strong>.
                Si tienes deudas de alto interés, págalas primero. Si tienes múltiples fuentes de ingresos,
                puedes ser más agresivo. Si dependes de esta inversión para algo concreto, sé más conservador.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Empieza con pequeñas aportaciones periódicas</h3>
              <p>
                La <strong>aportación periódica</strong> (o DCA) permite probar la tolerancia real al
                riesgo con importes pequeños: una cantidad que puedas sostener cada mes, durante
                unos meses, antes de comprometer sumas mayores. Lo que se está midiendo no es el
                importe, sino cómo llevas verlo bajar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mejores Prácticas */}
      <section className={styles.tipsSection}>
        <h2>6 Reglas de Oro del Inversor Inteligente</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧘</span>
            <h3>No cambies de perfil en crisis</h3>
            <p>
              Vender en pánico durante una caída es el error más costoso. Tu perfil se elige en calma;
              mantenlo en tormenta.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <h3>Revisa tu perfil cada año</h3>
            <p>
              Tu situación cambia: ingresos, dependientes, horizonte temporal. Un perfil correcto hoy
              puede no serlo en 5 años.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏦</span>
            <h3>Separa el fondo de emergencia</h3>
            <p>
              El dinero de emergencias nunca debe invertirse. Tenerlo separado evita vender
              inversiones en el peor momento.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <h3>Diversifica globalmente</h3>
            {/*
              ⚠️ 22/09/2026 (hallazgo 1218) — la reparación de neutralidad del 21/08/2026
              quitó «MSCI World» y el «60/40» del bloque de RESULTADO y dejó intacta esta
              guía, en la misma página: aquí seguían el índice concreto —nombre comercial de
              un proveedor— y una cifra de composición sin fuente ni año (decía «más de
              1.500 empresas»; hoy ronda las 1.300, y cambia cada revisión del índice). El
              «No concentres en España ni en Europa» presupone además dónde vive el lector.
            */}
            <p>
              Concentrar la cartera en un solo país o una sola región añade un riesgo que la
              diversificación geográfica reparte. Los fondos indexados de renta variable
              global cubren cientos o miles de empresas de decenas de países en un solo
              producto; su composición exacta la publica cada proveedor y cambia con el
              tiempo, así que conviene mirarla antes de invertir.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <h3>Entiende lo que tienes</h3>
            <p>
              No inviertas en lo que no entiendes. Si no sabes qué hay dentro de tu fondo,
              investiga antes de poner dinero real.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏳</span>
            <h3>Invierte solo lo que no necesitas</h3>
            <p>
              Solo invierte dinero que no vayas a necesitar en el horizonte definido.
              La necesidad urgente de liquidez provoca los peores errores inversores.
            </p>
          </div>
        </div>
      </section>

      {/* Errores Comunes */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <h3>Errores Comunes al Elegir tu Perfil Inversor</h3>
        </div>
        <ul className={styles.warningList}>
          <li>
            <strong>Mentirse a uno mismo en el test:</strong> Responder lo que &quot;debería&quot; hacer en vez de
            lo que harías de verdad lleva a un perfil inadecuado. Sé brutalmente honesto contigo mismo.
          </li>
          <li>
            <strong>Cambiar a conservador en cada caída:</strong> intentar acertar el momento de
            entrar y salir del mercado («market timing») suele restar rentabilidad: quien vende en
            una caída y vuelve más tarde se pierde parte de la recuperación. La cifra concreta de
            cuánto resta depende del estudio, del periodo y del mercado que se mire, así que aquí
            no se da ninguna.
            {/* Sin cifra a propósito: una cifra popular sin fuente es una cifra inventada
                (CLAUDE.md §1.quinquies). La referencia estaba en el texto visible (hallazgo 3287). */}
          </li>
          <li>
            <strong>Invertir el fondo de emergencia:</strong> Mezclar el colchón de seguridad con inversiones
            es el error más peligroso. Te obliga a vender cuando el mercado está bajo para cubrir imprevistos.
          </li>
          <li>
            <strong>Elegir perfil agresivo por euforia del mercado:</strong> Muchos inversores se vuelven
            &quot;agresivos&quot; cuando la bolsa lleva 3 años subiendo y se arrepienten en el siguiente crash.
            El perfil debe reflejar tolerancia real al riesgo, no optimismo del momento.
          </li>
          <li>
            <strong>Compararse con otros inversores:</strong> El vecino que ganó 30&nbsp;% con criptomonedas tiene
            un horizonte, situación y tolerancia al riesgo distinta a la tuya. Tu perfil es personal e
            intransferible.
          </li>
          <li>
            <strong>No revisar el perfil tras cambios vitales:</strong> Casarse, tener hijos, cambiar de trabajo
            o acercarse a la jubilación cambian tu perfil óptimo. Un perfil agresivo a los 30 puede ser
            inadecuado a los 55.
          </li>
        </ul>
      </div>
    </>
  );
}
