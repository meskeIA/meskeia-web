'use client';

import { useEffect, useRef, useState } from 'react';
import { margenBarraLogo } from '@/lib';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
  RegionBadge,
} from '@/components';
import styles from './SelectorTipoGimnasio.module.css';

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────
type TipoGimnasio =
  | 'gimnasio_tradicional'
  | 'crossfit_funcional'
  | 'yoga_pilates'
  | 'casa'
  | 'aire_libre';

interface Opcion {
  texto: string;
  pesos: Partial<Record<TipoGimnasio, number>>;
}

interface Pregunta {
  texto: string;
  opciones: Opcion[];
}

interface Resultado {
  tipo: TipoGimnasio;
  nombre: string;
  icono: string;
  descripcion: string;
}

// ─────────────────────────────────────────────────────────────
// Datos de resultados
// ─────────────────────────────────────────────────────────────
const RESULTADOS: Record<TipoGimnasio, Resultado> = {
  gimnasio_tradicional: {
    tipo: 'gimnasio_tradicional',
    nombre: 'Gimnasio Tradicional',
    icono: '🏋️',
    descripcion:
      'Máquinas, pesas libres y clases dirigidas variadas; flexible en horarios y objetivos, para todos los niveles.',
  },
  crossfit_funcional: {
    tipo: 'crossfit_funcional',
    nombre: 'CrossFit / Entrenamiento Funcional',
    icono: '🔥',
    descripcion:
      'Sesiones intensas en grupo con movimientos funcionales; para quienes buscan retos, comunidad y resultados rápidos.',
  },
  yoga_pilates: {
    tipo: 'yoga_pilates',
    nombre: 'Yoga o Pilates',
    icono: '🧘',
    descripcion:
      'Trabajo de flexibilidad, equilibrio, postura y mente; ideal para estrés, lesiones o quienes buscan bienestar integral.',
  },
  casa: {
    tipo: 'casa',
    nombre: 'Entrenamiento en Casa',
    icono: '🏠',
    descripcion:
      'Máxima comodidad y ahorro; con o sin equipamiento básico, para quienes tienen poco tiempo o prefieren la privacidad.',
  },
  aire_libre: {
    tipo: 'aire_libre',
    nombre: 'Entrenamiento al Aire Libre',
    icono: '🌿',
    descripcion:
      'Running, calistenia, circuitos en parque o deporte en equipo; gratuito y con los beneficios del contacto con la naturaleza.',
  },
};

const NOMBRE_TIPOS: Record<TipoGimnasio, string> = {
  gimnasio_tradicional: 'Gimnasio Tradicional',
  crossfit_funcional: 'CrossFit / Funcional',
  yoga_pilates: 'Yoga / Pilates',
  casa: 'En Casa',
  aire_libre: 'Al Aire Libre',
};

/** Respuestas que descartan modalidades (índices de pregunta y de opción; hallazgos 3179 y 3182). */
const DESCARTES: { pregunta: number; opcion: number; tipos: TipoGimnasio[]; motivo: string }[] = [
  { pregunta: 3, opcion: 0, tipos: ['gimnasio_tradicional', 'crossfit_funcional', 'yoga_pilates'], motivo: 'prefieres opciones gratuitas' },
  { pregunta: 4, opcion: 3, tipos: ['casa'], motivo: 'no tienes espacio en casa' },
];

// ─────────────────────────────────────────────────────────────
// Preguntas
// ─────────────────────────────────────────────────────────────
const PREGUNTAS: Pregunta[] = [
  {
    texto: '¿Cuál es tu objetivo principal al entrenar?',
    opciones: [
      { texto: 'Ganar fuerza y masa muscular', pesos: { gimnasio_tradicional: 3, crossfit_funcional: 2 } },
      { texto: 'Perder peso y quemar calorías', pesos: { crossfit_funcional: 3, gimnasio_tradicional: 2, casa: 1 } },
      { texto: 'Mejorar flexibilidad y movilidad', pesos: { yoga_pilates: 3, aire_libre: 1 } },
      { texto: 'Reducir el estrés y mejorar el bienestar', pesos: { yoga_pilates: 3, aire_libre: 2 } },
      { texto: 'Aumentar la resistencia cardiovascular', pesos: { aire_libre: 3, crossfit_funcional: 2, gimnasio_tradicional: 1 } },
      { texto: 'Mantener mi forma física actual', pesos: { gimnasio_tradicional: 2, aire_libre: 2, casa: 2, yoga_pilates: 1 } },
      { texto: 'Diversión y socializar', pesos: { crossfit_funcional: 2, aire_libre: 2, gimnasio_tradicional: 1, yoga_pilates: 1 } },
    ],
  },
  {
    texto: '¿Cómo describirías tu nivel actual de condición física?',
    opciones: [
      { texto: 'Principiante absoluto', pesos: { gimnasio_tradicional: 2, yoga_pilates: 2, casa: 2 } },
      { texto: 'Básico, entreno de vez en cuando', pesos: { gimnasio_tradicional: 2, yoga_pilates: 1, aire_libre: 2 } },
      { texto: 'Intermedio, tengo algo de rutina', pesos: { gimnasio_tradicional: 2, crossfit_funcional: 2, casa: 1 } },
      { texto: 'Avanzado, entreno con regularidad', pesos: { crossfit_funcional: 3, gimnasio_tradicional: 2 } },
      { texto: 'Muy activo, busco superar mis límites', pesos: { crossfit_funcional: 3, aire_libre: 2 } },
    ],
  },
  {
    texto: '¿Prefieres entrenar en grupo o en solitario?',
    opciones: [
      { texto: 'Me encanta el ambiente grupal y la energía colectiva', pesos: { crossfit_funcional: 3, yoga_pilates: 1 } },
      { texto: 'Prefiero ir a mi ritmo pero estar rodeado de gente', pesos: { gimnasio_tradicional: 3 } },
      { texto: 'Disfruto de clases dirigidas con instructor', pesos: { yoga_pilates: 3, gimnasio_tradicional: 1 } },
      { texto: 'Prefiero entrenar completamente solo', pesos: { casa: 3, aire_libre: 2 } },
      { texto: 'Me da igual, me adapto a cualquier situación', pesos: { gimnasio_tradicional: 1, aire_libre: 1, casa: 1 } },
    ],
  },
  {
    texto: '¿Cuánto estás dispuesto a gastar al mes en tu entrenamiento?',
    opciones: [
      { texto: 'Nada, prefiero opciones gratuitas', pesos: { aire_libre: 3, casa: 2 } },
      { texto: 'Hasta 20 € al mes', pesos: { casa: 3, aire_libre: 2 } },
      { texto: 'Entre 20 € y 50 € al mes', pesos: { gimnasio_tradicional: 3, yoga_pilates: 1 } },
      { texto: 'Entre 50 € y 100 € al mes', pesos: { crossfit_funcional: 2, yoga_pilates: 3 } },
      { texto: 'Más de 100 € si los resultados lo merecen', pesos: { crossfit_funcional: 3, yoga_pilates: 2 } },
    ],
  },
  {
    texto: '¿Tienes espacio suficiente en casa para entrenar?',
    opciones: [
      { texto: 'Sí, tengo una habitación o zona dedicada', pesos: { casa: 3 } },
      { texto: 'Tengo espacio básico para estiramientos y algo más', pesos: { casa: 2, yoga_pilates: 1 } },
      { texto: 'Muy poco espacio, apenas puedo moverme', pesos: { aire_libre: 2, gimnasio_tradicional: 2 } },
      { texto: 'No tengo espacio en casa', pesos: { gimnasio_tradicional: 3, aire_libre: 2, crossfit_funcional: 1 } },
      { texto: 'No lo he considerado', pesos: { gimnasio_tradicional: 1, aire_libre: 1 } },
    ],
  },
  {
    texto: '¿Te motiva la competición, los retos y superar marcas?',
    opciones: [
      { texto: 'Sí, me encanta competir y medir mi rendimiento', pesos: { crossfit_funcional: 3, aire_libre: 2 } },
      { texto: 'Me gustan los retos pero sin presión competitiva', pesos: { crossfit_funcional: 2, gimnasio_tradicional: 2 } },
      { texto: 'Prefiero avanzar a mi propio ritmo sin comparaciones', pesos: { yoga_pilates: 3, casa: 2 } },
      { texto: 'La competición me estresa, busco tranquilidad', pesos: { yoga_pilates: 3, aire_libre: 1 } },
      { texto: 'Me motiva más el disfrute que los resultados', pesos: { aire_libre: 2, yoga_pilates: 1 } },
    ],
  },
  {
    texto: '¿Tienes alguna lesión o limitación física a tener en cuenta?',
    opciones: [
      { texto: 'Sí, tengo lesiones crónicas o limitaciones importantes', pesos: { yoga_pilates: 3, casa: 1 } },
      { texto: 'He tenido lesiones pero estoy recuperado', pesos: { yoga_pilates: 2, gimnasio_tradicional: 1 } },
      { texto: 'Alguna molestia leve pero nada que me limite mucho', pesos: { gimnasio_tradicional: 1, yoga_pilates: 1 } },
      { texto: 'Estoy en perfectas condiciones físicas', pesos: { crossfit_funcional: 2, gimnasio_tradicional: 1, aire_libre: 1 } },
      { texto: 'No lo sé, nunca me he evaluado físicamente', pesos: { yoga_pilates: 1, gimnasio_tradicional: 1 } },
    ],
  },
  {
    texto: '¿Cuándo prefieres entrenar?',
    opciones: [
      { texto: 'Por la mañana temprano antes del trabajo', pesos: { aire_libre: 3, gimnasio_tradicional: 1 } },
      { texto: 'A mediodía o en mi pausa del trabajo', pesos: { gimnasio_tradicional: 2, casa: 1 } },
      { texto: 'Por la tarde después del trabajo', pesos: { gimnasio_tradicional: 2, crossfit_funcional: 2 } },
      { texto: 'Por la noche', pesos: { casa: 3, gimnasio_tradicional: 1 } },
      { texto: 'Tengo horario flexible y variable', pesos: { casa: 2, aire_libre: 1 } },
    ],
  },
  {
    texto: '¿Qué te motiva más a la hora de entrenar?',
    opciones: [
      { texto: 'La variedad de ejercicios y nunca hacer lo mismo', pesos: { crossfit_funcional: 3, gimnasio_tradicional: 1 } },
      { texto: 'Una rutina estructurada con progresión clara', pesos: { gimnasio_tradicional: 3, yoga_pilates: 1 } },
      { texto: 'La conexión mente-cuerpo y la calma interior', pesos: { yoga_pilates: 3, aire_libre: 1 } },
      { texto: 'La libertad y el contacto con la naturaleza', pesos: { aire_libre: 3, casa: 0 } },
      { texto: 'La comodidad y poder entrenar sin desplazarme', pesos: { casa: 3 } },
    ],
  },
  {
    texto: '¿Prefieres entrenar en interior o al aire libre?',
    opciones: [
      { texto: 'Siempre en interior, me gusta el ambiente controlado', pesos: { gimnasio_tradicional: 3, casa: 2 } },
      { texto: 'Prefiero el exterior, el aire fresco me da energía', pesos: { aire_libre: 3 } },
      { texto: 'Me da igual, adapto según el tiempo y el día', pesos: { gimnasio_tradicional: 1, aire_libre: 1, casa: 1 } },
      { texto: 'Prefiero el interior pero cerca de la naturaleza', pesos: { yoga_pilates: 2, aire_libre: 1 } },
      { texto: 'En casa es lo más cómodo para mí', pesos: { casa: 3 } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export default function SelectorTipoGimnasio() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(Array(PREGUNTAS.length).fill(-1));
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // «Siguiente» se desactiva al llegar la pregunta nueva (sin respuesta), y «Ver mi resultado» y
  // «Repetir el test» sustituyen la pantalla entera: el foco caía a <body> y la vista se quedaba
  // donde estaba, con el enunciado o el nombre del resultado por encima del borde o bajo la barra
  // fija del logo (hallazgos 3184 y 3185; receta 1680/2657 de selector-smartphone). Se lleva el
  // foco al enunciado nuevo o al nombre del resultado y, si no están enteros a la vista y por
  // debajo de la barra, se suben a su sitio (el hueco lo da el scroll-padding del documento).
  // Solo tras una navegación: al cargar, el foco no se mueve.
  const enunciado = useRef<HTMLHeadingElement>(null);
  const nombreResultado = useRef<HTMLHeadingElement>(null);
  const navegado = useRef(false);
  useEffect(() => {
    if (!navegado.current) return;
    const destino = mostrarResultado ? nombreResultado.current : enunciado.current;
    if (!destino) return;
    const caja = destino.getBoundingClientRect();
    if (caja.top < margenBarraLogo() || caja.bottom > window.innerHeight) {
      destino.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    destino.focus({ preventScroll: true });
  }, [mostrarResultado, preguntaActual]);

  /**
   * Doble clic y dos toques seguidos (hallazgo 3183; receta `clicDeMas` de selector-smartphone,
   * 2659, con la guarda en captura sobre window de selector-alquiler-vs-compra, 3111). Las
   * preguntas tienen alturas distintas, la botonera se mueve bajo el dedo y el segundo toque
   * marcaba una opción de la pregunta nueva o caía en «Anterior». Un clic se ignora cuando es el
   * 2.º de una ráfaga (`detail` > 1, que el teclado no produce) Y el clic anterior de la app
   * cambió de pantalla. En captura sobre window, también alcanza los enlaces ajenos.
   */
  const ultimoCambioPantalla = useRef(false);
  useEffect(() => {
    function filtrar(e: MouseEvent) {
      if (e.detail > 1 && ultimoCambioPantalla.current) {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.detail <= 1) {
        ultimoCambioPantalla.current = false;
      }
    }
    window.addEventListener('click', filtrar, true);
    return () => window.removeEventListener('click', filtrar, true);
  }, []);
  const cambiaPantalla = () => {
    ultimoCambioPantalla.current = true;
    navegado.current = true;
  };

  const totalPreguntas = PREGUNTAS.length;
  const seleccionActual = respuestas[preguntaActual];

  // Calcular puntuaciones totales
  function calcularPuntuaciones(): Record<TipoGimnasio, number> {
    const puntos: Record<TipoGimnasio, number> = {
      gimnasio_tradicional: 0,
      crossfit_funcional: 0,
      yoga_pilates: 0,
      casa: 0,
      aire_libre: 0,
    };

    respuestas.forEach((idxOpcion, idxPregunta) => {
      if (idxOpcion < 0) return;
      const opcion = PREGUNTAS[idxPregunta].opciones[idxOpcion];
      (Object.keys(opcion.pesos) as TipoGimnasio[]).forEach((tipo) => {
        puntos[tipo] += opcion.pesos[tipo] ?? 0;
      });
    });

    return puntos;
  }

  /**
   * Ganadora entre las modalidades que lo declarado admite. Reparación del 11/10/2026:
   *   · «Nada, prefiero opciones gratuitas» y «No tengo espacio en casa» son imposibilidades, no
   *     preferencias: solo sumaban puntos, y el 42,3 % de quien no quería pagar acababa en una
   *     modalidad de pago (3179); a quien no tenía espacio se le recomendaba entrenar en casa
   *     (3182). Ahora descartan, y la tarjeta dice qué habría salido sin el filtro.
   *   · Lesiones crónicas o principiante absoluto con CrossFit: el FAQPage y la guía dicen que no
   *     es lo más adecuado, y la tarjeta callaba (3180). No descarta (lo decide quien entrena con
   *     su profesional sanitario), pero se dice en la tarjeta.
   *   · Un empate lo deshacía en silencio el orden de declaración (13,6 % de los perfiles, 3181):
   *     se sigue deshaciendo así, y se dice con quién empata.
   */
  function resolver(puntos: Record<TipoGimnasio, number>) {
    const todas = Object.keys(puntos) as TipoGimnasio[];
    const filtros = DESCARTES.filter((f) => respuestas[f.pregunta] === f.opcion);
    const descartadas = todas.filter((t) => filtros.some((f) => f.tipos.includes(t)));
    const admitidas = todas.filter((t) => !descartadas.includes(t));
    const maximo = Math.max(...admitidas.map((t) => puntos[t]));
    const enCabeza = admitidas.filter((t) => puntos[t] === maximo);
    const tipo = enCabeza[0];
    const notas: string[] = [];

    const sinFiltro = todas.reduce((a, b) => (puntos[a] >= puntos[b] ? a : b));
    if (descartadas.includes(sinFiltro)) {
      const motivos = filtros.map((f) => f.motivo).join(' y ');
      notas.push(
        `Has dicho que ${motivos}: por eso quedan fuera ${descartadas.map((t) => `«${NOMBRE_TIPOS[t]}»`).join(', ')}. ` +
        `Sin ese filtro habría salido «${RESULTADOS[sinFiltro].nombre}» (${puntos[sinFiltro]} puntos).`,
      );
    }
    if (respuestas[3] === 1 && (tipo === 'crossfit_funcional' || tipo === 'yoga_pilates')) {
      notas.push(
        `Has dicho que tu presupuesto es de hasta 20 € al mes, y «${RESULTADOS[tipo].nombre}» suele costar más: compara precios en tu zona antes de decidir.`,
      );
    }
    const lesion = respuestas[6] === 0;
    const principiante = respuestas[1] === 0;
    if (tipo === 'crossfit_funcional' && (lesion || principiante)) {
      const declarado = [principiante && 'eres principiante absoluto', lesion && 'tienes lesiones crónicas o limitaciones importantes'].filter(Boolean).join(' y ');
      notas.push(
        `Has dicho que ${declarado}: el CrossFit es de alta intensidad y no es lo más indicado para empezar sin base ni con lesiones. ` +
        'Si te atrae, habla antes con un profesional sanitario y busca un centro con sesiones de iniciación que adapten los ejercicios.',
      );
    }
    if (enCabeza.length > 1) {
      notas.push(
        `Empate: ${enCabeza.slice(1).map((t) => `«${RESULTADOS[t].nombre}»`).join(' y ')} ${enCabeza.length > 2 ? 'tienen' : 'tiene'} los mismos puntos (${maximo}). ` +
        `Sale en primer lugar solo por el orden de la lista, no por encajar mejor: mira también ${enCabeza.length > 2 ? 'las otras' : 'la otra'}.`,
      );
    }
    return { tipo, descartadas, notas };
  }

  // Handlers
  function seleccionarOpcion(idx: number) {
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = idx;
    setRespuestas(nuevas);
  }

  /**
   * Teclado del patrón de radios (WAI-ARIA APG, receta 1681 de selector-smartphone): las flechas
   * mueven el foco a la opción vecina y la marcan, con vuelta al principio, e Inicio/Fin van a los
   * extremos. El grupo es UNA parada de Tab (tabindex itinerante). Antes cada opción era una
   * parada y las flechas no hacían nada (hallazgo 3187, cabo C0016).
   */
  function teclaEnOpcion(e: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    const total = PREGUNTAS[preguntaActual].opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % total;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + total) % total;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = total - 1;
    else return;
    e.preventDefault();
    seleccionarOpcion(destino);
    const opciones = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    opciones?.[destino]?.focus();
  }

  function siguientePregunta() {
    if (seleccionActual < 0) return;
    cambiaPantalla();
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setMostrarResultado(true);
    }
  }

  function anteriorPregunta() {
    if (preguntaActual > 0) {
      cambiaPantalla();
      setPreguntaActual(preguntaActual - 1);
    }
  }

  function reiniciar() {
    cambiaPantalla();
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(-1));
    setMostrarResultado(false);
  }

  const esUltima = preguntaActual === totalPreguntas - 1;
  const progresoPct = Math.round(((preguntaActual + (seleccionActual >= 0 ? 1 : 0)) / totalPreguntas) * 100);

  // Aviso médico y guía, en las dos pantallas: dentro de la rama del resultado no llegaban al HTML
  // servido y quien no terminaba las 10 preguntas no los veía (hallazgo 3189; receta 2663 de
  // selector-smartphone). Sin precios ni «más populares» sin fuente (3193) y con las clases por su
  // característica, no por su marca (3192).
  const guia = (
    <>
      <DisclaimerCard variant="medical" severity="high" />

      <EducationalSection
        title="¿Cómo elegir el entrenamiento adecuado?"
        subtitle="Todo lo que debes saber para tomar la mejor decisión para tu salud y objetivos"
      >
        <h3>Los 5 tipos de entrenamiento de este test</h3>
        <p>
          Hay muchas formas de hacer ejercicio. Cada modalidad tiene sus puntos fuertes y se adapta
          mejor a perfiles distintos de persona. Conocer las diferencias te ayudará a elegir con criterio.
        </p>

        <h3>Gimnasio tradicional</h3>
        <p>
          Es la opción más versátil. Permite combinar máquinas de musculación, peso libre, cardio y
          clases colectivas (baile aeróbico, ciclo indoor, tonificación con barra...). La cuota cambia
          mucho según la ciudad y las instalaciones: compara las de tu zona. Es ideal si quieres
          flexibilidad horaria y variedad de opciones bajo un mismo techo.
        </p>

        <h3>CrossFit y entrenamiento funcional</h3>
        <p>
          El CrossFit combina levantamiento de pesas olímpico, movimientos gimnásticos y cardio de alta
          intensidad en sesiones de grupo llamadas WOD (Workout Of the Day). El entrenamiento funcional
          es similar pero menos estructurado en cuanto a metodología. Son ideales para personas con buena
          condición física que buscan retos constantes y comunidad. Al ser sesiones guiadas en grupos
          reducidos, la cuota suele ser más alta que la de un gimnasio de libre acceso.
        </p>

        <h3>Yoga y pilates</h3>
        <p>
          Aunque son disciplinas distintas, comparten el enfoque en el cuerpo y la mente. El yoga trabaja
          la flexibilidad, la respiración y la meditación. El pilates se centra en el core, la postura
          y el control muscular. Ambos son muy recomendados para personas con estrés, sedentarismo o
          lesiones de espalda. El precio depende del centro y de cuántas clases a la semana incluya.
        </p>

        <h3>Entrenamiento en casa</h3>
        <p>
          Con aplicaciones, vídeos y materiales básicos (esterilla, mancuernas, banda elástica) es posible
          entrenar eficazmente desde casa. Es la opción más económica y cómoda, aunque requiere mayor
          autodisciplina. Es una opción válida para personas con horarios complicados o poca movilidad.
        </p>

        <h3>Entrenamiento al aire libre</h3>
        <p>
          Correr, ciclismo, senderismo, calistenia en parques o deportes de equipo son formas muy
          completas de mantenerse activo. La exposición al sol y la naturaleza tiene beneficios adicionales
          para la salud mental. El clima de tu zona y la estación marcan cuánto puedes contar con esta
          opción a lo largo del año. Además, muchos parques cuentan con circuitos biosaludables gratuitos.
        </p>

        <h3>Factores clave para tomar la decisión</h3>
        <ul>
          <li><strong>Objetivo:</strong> fuerza, adelgazar, movilidad, bienestar o resistencia.</li>
          <li><strong>Presupuesto:</strong> desde gratis (aire libre, o en casa sin material) hasta la cuota de un centro con sesiones guiadas.</li>
          <li><strong>Tiempo disponible:</strong> desplazamiento al gimnasio vs. entrenar en casa.</li>
          <li><strong>Estado físico:</strong> algunos entrenamientos requieren una base previa.</li>
          <li><strong>Motivación:</strong> el ambiente grupal ayuda a muchas personas a ser constantes.</li>
        </ul>

        <h3>¿Cuánto ejercicio recomienda la OMS?</h3>
        <p>
          La Organización Mundial de la Salud recomienda para adultos al menos 150-300 minutos semanales
          de actividad aeróbica moderada o 75-150 minutos de actividad vigorosa, combinados con ejercicios
          de fortalecimiento muscular al menos 2 días por semana. Independientemente del tipo de entrenamiento
          que elijas, lo importante es la constancia.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>Importante:</strong> Antes de iniciar cualquier programa de entrenamiento intenso,
          especialmente si tienes más de 40 años, llevas tiempo sedentario o tienes alguna condición
          de salud, consulta con tu médico o un profesional de la actividad física.
        </div>
      </EducationalSection>
    </>
  );

  // Ámbito de los importes de la pregunta 4 (hallazgo 3193; forma del 949 de selector-smartphone).
  const ambito = (
    <RegionBadge
      variant="es-data"
      text="Presupuestos en euros, con España como referencia. El cuestionario sirve en cualquier país"
    />
  );

  // Resultado
  if (mostrarResultado) {
    const puntos = calcularPuntuaciones();
    const { tipo: tipoGanador, descartadas, notas } = resolver(puntos);
    const resultado = RESULTADOS[tipoGanador];
    const maxPuntos = Math.max(...Object.values(puntos));

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1>Tu resultado</h1>
          <p>Basado en tus respuestas, este es el tipo de entrenamiento que mejor se adapta a ti</p>
        </header>

        {ambito}

        <LegalNotice />

        <div className={styles.resultado}>
          <div className={styles.resultadoCard}>
            <div className={styles.resultadoIcono} aria-hidden="true">{resultado.icono}</div>
            {/* Recibe el foco al llegar al resultado (tabIndex=-1, hallazgo 3185). */}
            <h2 ref={nombreResultado} tabIndex={-1} className={styles.recibeFoco}>{resultado.nombre}</h2>
            <p>{resultado.descripcion}</p>

            {/* Lo declarado que descarta o que choca con la recomendación, y el empate (3179-3182). */}
            {notas.map((nota) => (
              <p key={nota} className={styles.nota} role="note">
                <span aria-hidden="true">⚠️</span> {nota}
              </p>
            ))}

            <div className={styles.marcador}>
              <h3>Compatibilidad con cada opción</h3>
              {(Object.keys(puntos) as TipoGimnasio[])
                .sort((a, b) => puntos[b] - puntos[a])
                .map((tipo) => (
                  <div key={tipo} className={styles.barraResultado}>
                    <span className={styles.barraLabel}>
                      {NOMBRE_TIPOS[tipo]}
                      {descartadas.includes(tipo) && <span className={styles.barraFuera}> (fuera por lo declarado)</span>}
                    </span>
                    {/* La barra solo dibuja los puntos de la fila: no es un progreso, y como
                        progressbar sin nombre se anunciaba «barra de progreso, 33 %» sin decir de
                        qué modalidad (hallazgo 3188). La fila se lee «Yoga / Pilates 21 puntos». */}
                    <div className={styles.barraFondo} aria-hidden="true">
                      <div
                        className={`${styles.barraRelleno} ${tipo === tipoGanador ? styles.ganador : ''}`}
                        style={{ width: maxPuntos > 0 ? `${Math.round((puntos[tipo] / maxPuntos) * 100)}%` : '0%' }}
                      />
                    </div>
                    <span className={styles.barraPuntos}>
                      {puntos[tipo]}<span className="sr-only"> puntos</span>
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.warningBox} role="note">
            <strong>Recuerda:</strong> Este test ofrece una orientación general. Si tienes lesiones, problemas de salud
            o llevas tiempo sin hacer ejercicio, consulta con un profesional sanitario o un entrenador personal
            antes de empezar cualquier programa de entrenamiento.
          </div>

          <button
            type="button"
            className={styles.btnReiniciar}
            onClick={reiniciar}
          >
            Repetir el test
          </button>
        </div>

        {guia}

        <RelatedApps />
        <ShareCard appName="selector-tipo-gimnasio" />
        <Footer key="pie" appName="selector-tipo-gimnasio" />
      </div>
    );
  }

  // Quiz en curso
  const pregunta = PREGUNTAS[preguntaActual];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>¿Qué tipo de gimnasio te conviene?</h1>
        <p>Responde 10 preguntas y descubre el entrenamiento que mejor se adapta a ti</p>
      </header>

      {ambito}

      <LegalNotice />

      <div className={styles.quiz}>
        {/* Progreso */}
        <div className={styles.progreso}>
          <div className={styles.progresoLabel}>
            <span>Pregunta {preguntaActual + 1} de {totalPreguntas}</span>
            {/* «%» con espacio duro (CLAUDE.md §2, hallazgo 3191). */}
            <span>{progresoPct}&nbsp;% completado</span>
          </div>
          {/* Con nombre: era un «progressbar» mudo (hallazgo 3188). */}
          <div
            className={styles.progresoBar}
            role="progressbar"
            aria-label="Progreso del test"
            aria-valuenow={progresoPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${progresoPct} % completado`}
          >
            <div className={styles.progresoFill} style={{ width: `${progresoPct}%` }} />
          </div>
        </div>

        {/* Pregunta */}
        <div className={styles.pregunta}>
          {/* Recibe el foco al cambiar de pregunta (tabIndex=-1, hallazgo 3184). */}
          <h2 ref={enunciado} tabIndex={-1} className={styles.recibeFoco}>{pregunta.texto}</h2>
          <div className={styles.opciones} role="radiogroup" aria-label={pregunta.texto}>
            {pregunta.opciones.map((opcion, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.opcion} ${seleccionActual === idx ? styles.seleccionada : ''}`}
                onClick={() => seleccionarOpcion(idx)}
                role="radio"
                aria-checked={seleccionActual === idx}
                // Tabindex itinerante: la marcada, o la primera si no hay ninguna (3187).
                tabIndex={seleccionActual >= 0 ? (seleccionActual === idx ? 0 : -1) : idx === 0 ? 0 : -1}
                onKeyDown={(e) => teclaEnOpcion(e, idx)}
              >
                {opcion.texto}
              </button>
            ))}
          </div>
        </div>

        {/* Navegación */}
        <div className={styles.navegacion}>
          <button
            type="button"
            className={styles.btnSecundario}
            onClick={anteriorPregunta}
            disabled={preguntaActual === 0}
            aria-label="Pregunta anterior"
          >
            ← Anterior
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={siguientePregunta}
            disabled={seleccionActual < 0}
            aria-label={esUltima ? 'Ver mi resultado' : 'Siguiente pregunta'}
          >
            {esUltima ? 'Ver mi resultado' : 'Siguiente →'}
          </button>
        </div>
      </div>

      {guia}

      <RelatedApps />
      <ShareCard appName="selector-tipo-gimnasio" />
      {/* key="pie" en los dos Footer: sin ella React lo remonta al pasar al resultado y el
          AnalyticsTracker registra otra visita (cabo C0042). */}
      <Footer key="pie" appName="selector-tipo-gimnasio" />
    </div>
  );
}
