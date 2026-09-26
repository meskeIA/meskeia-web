'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './TestPerfilInversor.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, RegionBadge } from '@/components';
import { formatNumber, formatPercentage } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

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
    options: [
      { text: 'Menos del 20\u00A0% - Solo una pequeña parte', points: 1 },
      { text: '20\u00A0% a 40\u00A0% - Una parte moderada', points: 2 },
      { text: '40\u00A0% a 60\u00A0% - Una parte significativa', points: 3 },
      { text: 'Más del 60\u00A0% - La mayor parte de mis ahorros', points: 4 },
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

const PROFILES: Record<ProfileType, Profile> = {
  conservador: {
    name: 'Conservador',
    icon: '🛡️',
    range: [10, 16],
    description: 'Priorizas la seguridad sobre la rentabilidad. Prefieres evitar pérdidas aunque eso signifique menores ganancias. Ideal para horizontes cortos o personas cercanas a la jubilación.',
    traits: {
      riesgo: 'Muy bajo',
      horizonte: '< 3 años',
      volatilidad: '5-8\u00A0%',
      objetivo: 'Preservar capital',
    },
    allocation: { rv: 15, rf: 60, liq: 20, alt: 5 },
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
    description: 'Buscas un equilibrio entre seguridad y crecimiento. Aceptas algo de volatilidad pero sin excesos. Perfil común para quienes empiezan a invertir con prudencia.',
    traits: {
      riesgo: 'Bajo',
      horizonte: '3-5 años',
      volatilidad: '8-12\u00A0%',
      objetivo: 'Batir inflación',
    },
    allocation: { rv: 30, rf: 50, liq: 15, alt: 5 },
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
    description: 'Buscas crecimiento a largo plazo aceptando volatilidad moderada. Entiendes que las caídas son temporales y mantienes la calma. Perfil más común entre inversores experimentados.',
    traits: {
      riesgo: 'Medio',
      horizonte: '5-10 años',
      volatilidad: '12-15\u00A0%',
      objetivo: 'Crecimiento sostenido',
    },
    allocation: { rv: 50, rf: 35, liq: 10, alt: 5 },
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
    description: 'Priorizas el crecimiento y toleras bien la volatilidad. Las caídas no te asustan y sabes que son oportunidades. Horizonte largo y capacidad de aguantar malos años.',
    traits: {
      riesgo: 'Alto',
      horizonte: '10-15 años',
      volatilidad: '15-20\u00A0%',
      objetivo: 'Maximizar crecimiento',
    },
    allocation: { rv: 70, rf: 20, liq: 5, alt: 5 },
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
    description: 'Buscas máxima rentabilidad asumiendo alto riesgo. Tienes experiencia, horizonte muy largo y capacidad de no vender en pánico durante crisis. Perfil para inversores experimentados.',
    traits: {
      riesgo: 'Muy alto',
      horizonte: '> 15 años',
      volatilidad: '20-25\u00A0%',
      objetivo: 'Máxima rentabilidad',
    },
    allocation: { rv: 90, rf: 5, liq: 0, alt: 5 },
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

/**
 * Posición de la flecha en la barra de cinco segmentos (0-100 %).
 *
 * El mapeo lineal 10-40 → 0-100 dejaba los topes de tramo (16, 22, 28 y 34) clavados en
 * 20 %, 40 %, 60 % y 80 %, es decir sobre la línea divisoria con el tramo siguiente:
 * con `translateX(-50%)` la punta quedaba repartida entre los dos colores mientras el
 * texto anunciaba el de abajo (Inspector, 20/08/2026). Se separa medio punto de cada
 * frontera para que la flecha caiga siempre DENTRO del segmento que se ha nombrado.
 */
function getBarPosition(score: number): number {
  // El segmento se deriva del PERFIL, no de un mapeo lineal: con 10-40 → 0-100 los topes
  // de tramo caían clavados en las fronteras (22 → 40 %), y redondearlos hacia dentro con
  // Math.floor los mandaba al segmento de al lado, que es el error contrario.
  const orden: ProfileType[] = ['conservador', 'moderado', 'equilibrado', 'dinamico', 'agresivo'];
  const tipo = getProfile(score);
  const indice = Math.max(0, orden.indexOf(tipo));
  const [min, max] = PROFILES[tipo].range;
  const anchoSegmento = 100 / orden.length;
  const margen = 2;
  const proporcion = max > min ? (score - min) / (max - min) : 0.5;
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
}

/**
 * Borra la sesión guardada. Fuera del componente porque `leerSesion` también la necesita:
 * una sesión que no se puede interpretar hay que RETIRARLA, no solo ignorarla (1213).
 */
function borrarSesion(): void {
  try {
    sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Nada que limpiar si no había dónde guardar.
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

    const { currentQuestion, answers } = datos as Partial<EstadoGuardado>;

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

    return { currentQuestion, answers: limpias };
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
   */
  const [sesionRecuperada, setSesionRecuperada] = useState(false);
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
   * llegada —donde empieza su contenido, con `scroll-margin-top` para que la barra fija del
   * logo no lo tape— y un encabezado que recibe el foco, para que quien usa lector de pantalla
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

  /** Recupera el test a medio hacer tras un F5. Solo en el primer render del cliente. */
  useEffect(() => {
    const guardado = leerSesion();
    if (!guardado || Object.keys(guardado.answers).length === 0) return;
    setAnswers(guardado.answers);
    setCurrentQuestion(guardado.currentQuestion);
    setPhase('questions');
    setSesionRecuperada(true);
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
      tarjetaPregunta.current?.focus();
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

  /** Cambio de fase pedido por la persona: además de cambiarla, lleva la vista a ella (2177). */
  const irAFase = (fase: Fase) => {
    llevarVistaAFase.current = true;
    setPhase(fase);
  };

  const handleStart = () => {
    irAFase('questions');
    setCurrentQuestion(0);
    setAnswers({});
    setSesionRecuperada(false);
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
      // El cuestionario ya está terminado: lo que se guardaba era el test A MEDIAS, para
      // que un F5 no lo borrase. Conservarlo después haría que quien vuelve a entrar
      // aterrizara en la última pregunta en vez de en la portada.
      olvidarSesion();
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
    setSesionRecuperada(false);
    olvidarSesion();
  };

  // Calcular puntuación total
  const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
  const profileType = getProfile(totalScore);
  const profile = PROFILES[profileType];

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
  const enBordeDeTramo =
    (totalScore === profile.range[0] && totalScore > PUNTUACION_MINIMA) ||
    (totalScore === profile.range[1] && totalScore < PUNTUACION_MAXIMA);

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
            ante el riesgo. Al final recibirás tu perfil personalizado con recomendaciones
            de inversión adaptadas a ti.
          </p>

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
              <span>Recomendaciones personalizadas</span>
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

          <button type="button" className={styles.startButton} onClick={handleStart}>
            Comenzar Test →
          </button>
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
          {sesionRecuperada && (
            <div className={styles.avisoRecuperado} role="status">
              <p>
                <span aria-hidden="true">↩️</span> Hemos recuperado el test que dejaste a medias en
                esta pestaña, con {Object.keys(answers).length} de {QUESTIONS.length} respuestas.
              </p>
              <button type="button" className={styles.reiniciarButton} onClick={handleRestart}>
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
                  onClick={() => handleAnswer(question.id, option.points)}
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
                onClick={handlePrev}
                disabled={currentQuestion === 0}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className={`${styles.navButton} ${styles.next}`}
                onClick={handleNext}
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
              Tu perfil es:
            </h2>
            <p className={styles.resultProfile}>{profile.name}</p>
            {/* La app entera se apoya en la puntuación —su propia FAQ pregunta qué pasa si
                las respuestas quedan en el límite entre dos perfiles— y no la enseñaba
                nunca: no había forma de saberse en el borde ni de rehacer la cuenta. */}
            <p className={styles.resultScore}>
              {formatNumber(totalScore, 0)} puntos · tramo {formatNumber(profile.range[0], 0)}–{formatNumber(profile.range[1], 0)}
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
              style={{ left: `${getBarPosition(totalScore)}%` }}
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
          <div className={styles.profileLabels}>
            <span>Conservador</span>
            <span>Moderado</span>
            <span>Equilibrado</span>
            <span>Dinámico</span>
            <span>Agresivo</span>
          </div>

          {/* Descripción */}
          <div className={styles.profileDescription}>
            <h4>Descripción de tu perfil</h4>
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
            <h4>
              <span aria-hidden="true">📊</span> Distribución de activos de ejemplo para este perfil
            </h4>
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
            <h4><span aria-hidden="true">💡</span> Ideas que suelen asociarse a este perfil</h4>
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
              onClick={handleRevisar}
              className={`${styles.actionButton} ${styles.secondary}`}
            >
              <span aria-hidden="true">✏️</span> Revisar mis respuestas
            </button>
            <button type="button" onClick={handleRestart} className={`${styles.actionButton} ${styles.secondary}`}>
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

      <RelatedApps apps={getRelatedApps('test-perfil-inversor')} />

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
              puedes ajustar según tu intuición personal y experiencia previa.
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
                <td><strong>Rentabilidad histórica orientativa</strong></td>
                <td>1–3&nbsp;%</td>
                <td>2–4&nbsp;%</td>
                <td>3–6&nbsp;%</td>
                <td>4–7&nbsp;%</td>
                <td>5–9&nbsp;%</td>
              </tr>
              <tr>
                <td colSpan={6} style={{ fontSize: '0.85em', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  Rentabilidades históricas nominales medias antes de inflación, comisiones e impuestos. Pasadas, no futuras.
                </td>
              </tr>
              <tr>
                <td><strong>Volatilidad máxima</strong></td>
                <td>5–8&nbsp;%</td>
                <td>8–12&nbsp;%</td>
                <td>12–15&nbsp;%</td>
                <td>15–20&nbsp;%</td>
                <td>20–25&nbsp;%+</td>
              </tr>
              <tr>
                <td><strong>Renta variable (%)</strong></td>
                <td>15&nbsp;%</td>
                <td>30&nbsp;%</td>
                <td>50&nbsp;%</td>
                <td>70&nbsp;%</td>
                <td>90&nbsp;%</td>
              </tr>
              <tr>
                <td><strong>Horizonte mínimo</strong></td>
                <td>1–3 años</td>
                <td>3–5 años</td>
                <td>5–10 años</td>
                <td>10–15 años</td>
                <td>+15 años</td>
              </tr>
              <tr>
                <td><strong>Activos típicos</strong></td>
                <td>Depósitos, bonos corto</td>
                <td>Mixtos conservadores</td>
                <td>ETFs globales 60/40</td>
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
              <strong>Perfil recomendado: Equilibrado o Dinámico.</strong> Tienen obligaciones financieras
              fijas y no pueden permitirse grandes caídas en el corto plazo, pero el dinero de la jubilación
              no se toca en 20–25 años, y ese horizonte es el de los perfiles Equilibrado (5–10 años) y
              Dinámico (10–15). Cosa distinta es el colchón de emergencia, que va aparte y en liquidez.
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
              Sí, y de hecho es lo más inteligente. Puedes ser <strong>conservador para tu fondo de emergencia</strong>
              (3–6 meses de gastos en cuenta remunerada) y <strong>dinámico para la jubilación</strong>
              (que queda a 30+ años). Cada objetivo tiene su propio horizonte temporal y tolerancia al riesgo.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Técnica &quot;bucket&quot;: Divide tu capital en cubos: corto plazo (conservador), medio plazo (equilibrado)
              y largo plazo (agresivo).
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Cómo afecta la inflación a mi elección de perfil?</h3>
            <p>
              La inflación es el &quot;riesgo invisible&quot; que erosiona el poder adquisitivo del dinero parado.
              Con una inflación del 3&nbsp;%, un perfil <strong>demasiado conservador puede perder poder adquisitivo</strong>
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
              otro nombre. Ese test a veces está sesgado hacia productos propios o hacia perfiles más
              conservadores para reducir reclamaciones.
              <strong>El perfil del banco es orientativo</strong>; el de este test busca darte una imagen más
              objetiva de tu situación real.
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Con qué frecuencia debo revisar mi perfil?</h3>
            <p>
              Se recomienda revisar el perfil <strong>al menos una vez al año</strong> y siempre que ocurra
              un cambio vital significativo: nuevo trabajo, matrimonio, nacimiento de hijos, herencia,
              compra de vivienda o jubilación próxima. Los mercados también cambian tu exposición real:
              si la bolsa sube mucho, tu porcentaje en renta variable aumenta automáticamente.
            </p>
          </div>

          <div className={styles.faqSectionItem}>
            <h3>¿Existe un perfil &quot;perfecto&quot; para todos?</h3>
            <p>
              No. El perfil óptimo es personal y depende de factores únicos: tu edad, ingresos, deudas,
              dependientes a cargo, experiencia inversora y, sobre todo, cómo reaccionas emocionalmente
              ante pérdidas. <strong>El mejor perfil es el que puedes mantener sin vender en pánico</strong>
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
              <p>
                Regla general: si necesitas el dinero en <strong>menos de 3 años → conservador</strong>;
                en 3–7 años → moderado/equilibrado; en más de 10 años → dinámico/agresivo.
                El horizonte temporal es el factor más objetivo para definir tu perfil.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Evalúa tu tolerancia emocional honestamente</h3>
              <p>
                Imagina que tu cartera de 10.000&nbsp;€ vale 6.000&nbsp;€ mañana. <strong>¿Vendes, mantienes o compras más?</strong>
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
            no se da ninguna (§1.quinquies: una cifra popular sin fuente es una cifra inventada).
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
