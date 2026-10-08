'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import styles from './TestTipoLector.module.css';

// ── Tipos ──────────────────────────────────────────────────────────────────

type ArquetipoId = 'detective' | 'explorador' | 'empatico' | 'esteta' | 'pensador';

interface Opcion {
  texto: string;
  arquetipo: ArquetipoId;
}

interface Pregunta {
  texto: string;
  opciones: Opcion[];
}

interface Arquetipo {
  id: ArquetipoId;
  nombre: string;
  emoji: string;
  descripcion: string;
  rasgos: string[];
  generos: string[];
  autores: string[];
  lecturas: { titulo: string; autor: string }[];
  consejo: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    texto: '¿Qué te atrapa en las primeras páginas de un libro?',
    opciones: [
      { texto: 'La tensión o un misterio que necesito resolver', arquetipo: 'detective' },
      { texto: 'Un mundo completamente diferente al mío', arquetipo: 'explorador' },
      { texto: 'Un personaje en quien me reconozco o que me fascina', arquetipo: 'empatico' },
      { texto: 'Una frase tan bien escrita que tengo que releerla', arquetipo: 'esteta' },
      { texto: 'Una idea o premisa que nunca había considerado', arquetipo: 'pensador' },
    ],
  },
  {
    texto: '¿Qué te molesta más en un libro que no funciona?',
    opciones: [
      { texto: 'Que pueda predecir el final desde el principio', arquetipo: 'detective' },
      { texto: 'Que todo ocurra en entornos mundanos sin ninguna inventiva', arquetipo: 'explorador' },
      { texto: 'Que los personajes sean arquetipos sin matices', arquetipo: 'empatico' },
      { texto: 'Que la prosa sea descuidada o mecánica', arquetipo: 'esteta' },
      { texto: 'Que no haya nada nuevo que aprender o cuestionar', arquetipo: 'pensador' },
    ],
  },
  {
    texto: 'Un libro que recuerdas con cariño es aquel que…',
    opciones: [
      { texto: 'Me tuvo en tensión hasta la última página', arquetipo: 'detective' },
      { texto: 'Me transportó a un mundo que no quería abandonar', arquetipo: 'explorador' },
      { texto: 'Me hizo sentir algo muy intensamente, quizás llorar', arquetipo: 'empatico' },
      { texto: 'Tiene pasajes que subrayé o que sigo recordando', arquetipo: 'esteta' },
      { texto: 'Cambió algo en mi manera de ver el mundo', arquetipo: 'pensador' },
    ],
  },
  {
    texto: '¿Cómo sueles elegir tu próxima lectura?',
    opciones: [
      { texto: 'Por la sinopsis: si la trama me engancha, lo cojo', arquetipo: 'detective' },
      { texto: 'Por el género o el universo que propone', arquetipo: 'explorador' },
      { texto: 'Por lo que me ha emocionado a alguien de confianza', arquetipo: 'empatico' },
      { texto: 'Por premios literarios o reseñas en prensa cultural', arquetipo: 'esteta' },
      { texto: 'Por los temas que trata o las ideas del autor', arquetipo: 'pensador' },
    ],
  },
  {
    texto: 'Si el libro se ralentiza en el tramo central, tú…',
    opciones: [
      { texto: 'Sigo buscando la siguiente pista o giro', arquetipo: 'detective' },
      { texto: 'Me detengo en los detalles del mundo narrado', arquetipo: 'explorador' },
      { texto: 'Continúo porque me importa saber qué les pasa a los personajes', arquetipo: 'empatico' },
      { texto: 'Aprecio el ritmo lento si la escritura lo justifica', arquetipo: 'esteta' },
      { texto: 'Me pierdo en las reflexiones aunque ralenticen la acción', arquetipo: 'pensador' },
    ],
  },
  {
    texto: '¿Qué tipo de final te satisface más?',
    opciones: [
      { texto: 'Resolutivo: todo encaja y el caso queda cerrado', arquetipo: 'detective' },
      { texto: 'Épico o que cierra el arco del mundo construido', arquetipo: 'explorador' },
      { texto: 'Emocionalmente verdadero, aunque sea doloroso', arquetipo: 'empatico' },
      { texto: 'Con una última frase que se queda resonando por cómo está escrita', arquetipo: 'esteta' },
      { texto: 'Abierto o ambiguo: con una idea que me deja dando vueltas días después', arquetipo: 'pensador' },
    ],
  },
  {
    texto: '¿Qué sueles hacer al terminar un libro que te ha gustado mucho?',
    opciones: [
      { texto: 'Busco inmediatamente otro del mismo género o autor', arquetipo: 'detective' },
      { texto: 'Me quedo imaginando qué pasó después en ese universo', arquetipo: 'explorador' },
      { texto: 'Necesito hablar con alguien sobre lo que sentí', arquetipo: 'empatico' },
      { texto: 'Vuelvo a leer los pasajes favoritos', arquetipo: 'esteta' },
      { texto: 'Busco más información sobre los temas o el autor', arquetipo: 'pensador' },
    ],
  },
  {
    texto: '¿Con cuál de estas frases te identificas más?',
    opciones: [
      { texto: '«Me importa quién lo hizo y por qué.»', arquetipo: 'detective' },
      { texto: '«Prefiero lo extraordinario a lo cotidiano.»', arquetipo: 'explorador' },
      { texto: '«Me importan las personas, no las tramas.»', arquetipo: 'empatico' },
      { texto: '«La forma de contar importa tanto como lo que se cuenta.»', arquetipo: 'esteta' },
      { texto: '«Los mejores libros me cambian algo.»', arquetipo: 'pensador' },
    ],
  },
];

const ARQUETIPOS: Record<ArquetipoId, Arquetipo> = {
  detective: {
    id: 'detective',
    nombre: 'El Detective',
    emoji: '🔍',
    descripcion: 'Lees para resolver algo. La tensión narrativa, los giros inesperados y las revelaciones son tu motor. Un libro sin suspense no es un libro: es un texto. Eres el lector más difícil de engañar y el que más sufre cuando adivina el final demasiado pronto.',
    rasgos: [
      'Lees rápido cuando la trama aprieta',
      'La primera pregunta que haces es «¿quién lo hizo?»',
      'Tienes memoria de elefante para los detalles que luego importan',
      'Sufres con los finales abiertos',
      'Coleccionas autores de género con devoción',
    ],
    generos: ['Thriller', 'Novela negra', 'Misterio', 'Suspense psicológico', 'Policiaco'],
    autores: ['Agatha Christie', 'Stieg Larsson', 'Gillian Flynn', 'Donna Leon', 'Jo Nesbø'],
    lecturas: [
      { titulo: 'El nombre de la rosa', autor: 'Umberto Eco' },
      { titulo: 'Millennium', autor: 'Stieg Larsson' },
      { titulo: 'La chica del tren', autor: 'Paula Hawkins' },
      { titulo: 'Y no quedó ninguno', autor: 'Agatha Christie' },
    ],
    consejo: 'Prueba "El nombre de la rosa" de Eco: la arquitectura del misterio medieval te tiene resolviendo pistas hasta la última página, pero la escritura te sorprenderá.',
  },
  explorador: {
    id: 'explorador',
    nombre: 'El Explorador',
    emoji: '🌌',
    descripcion: 'Necesitas salir del mundo real cuando abres un libro. La ambientación, el worldbuilding y los universos creados son para ti tan importantes como la trama. La realidad cotidiana es demasiado estrecha: buscas épocas remotas, futuros imposibles y tierras que no existen en ningún mapa.',
    rasgos: [
      'Lees con mapas, glosarios e índices de personajes a mano',
      'Sufres el "síndrome del libro huérfano" al terminar una saga',
      'La ambientación falla → el libro falla',
      'Tienes tolerancia infinita a las páginas de descripción de mundos',
      'Eres experto en recomendar "punto de entrada" a sagas largas',
    ],
    generos: ['Fantasía épica', 'Ciencia ficción', 'Novela histórica', 'Distopía', 'Space opera'],
    autores: ['J.R.R. Tolkien', 'Ursula K. Le Guin', 'Ken Follett', 'George R.R. Martin', 'Hilary Mantel'],
    lecturas: [
      { titulo: 'La mano izquierda de la oscuridad', autor: 'Ursula K. Le Guin' },
      { titulo: 'Los pilares de la tierra', autor: 'Ken Follett' },
      { titulo: '1984', autor: 'George Orwell' },
      { titulo: 'El nombre del viento', autor: 'Patrick Rothfuss' },
    ],
    consejo: 'Si no has leído a Le Guin, empieza por "La mano izquierda de la oscuridad": worldbuilding sin igual, ciencia ficción como herramienta para pensar sobre género e identidad.',
  },
  empatico: {
    id: 'empatico',
    nombre: 'El Empático',
    emoji: '❤️',
    descripcion: 'Un libro tiene éxito si sus personajes te importan de verdad. Puedes perdonar una trama floja si los personajes son complejos y verdaderos. Cuando un libro te emociona, necesitas hablar de ello. Eres el lector que sufre cuando un personaje que quieres muere y que guarda cuentas con los autores crueles.',
    rasgos: [
      'Te identificas o te opones intensamente a los personajes',
      'Recuerdas los libros por cómo te hicieron sentir',
      'Puedes defender a un personaje en una conversación como si fuera real',
      'Necesitas recomendaciones de personas que te conocen bien',
      'Eres el amigo que hace leer libros que "no son para todo el mundo"',
    ],
    generos: ['Novela contemporánea', 'Drama familiar', 'Coming-of-age', 'Realismo íntimo', 'Autoficción'],
    autores: ['Elena Ferrante', 'Sally Rooney', 'Jhumpa Lahiri', 'Alice Munro', 'Chimamanda Ngozi Adichie'],
    lecturas: [
      { titulo: 'La amiga estupenda', autor: 'Elena Ferrante' },
      { titulo: 'Gente normal', autor: 'Sally Rooney' },
      { titulo: 'El guardián entre el centeno', autor: 'J.D. Salinger' },
      { titulo: 'La tregua', autor: 'Mario Benedetti' },
    ],
    consejo: 'Empieza la saga napolitana de Ferrante: "La amiga estupenda". Los personajes de Elena y Lila te van a perseguir semanas después de terminarla.',
  },
  esteta: {
    id: 'esteta',
    nombre: 'El Esteta',
    emoji: '✒️',
    descripcion: 'La forma de contar importa tanto como lo que se cuenta. Lees en busca de la frase perfecta, el párrafo que te deja sin respiración. Un libro con trama mediocre pero escritura extraordinaria te puede gustar más que un bestseller ágil. Subrayas, anotas, vuelves a las páginas. Eres el lector más exigente con el oficio.',
    rasgos: [
      'Lees más despacio que la media porque te detienes a releer',
      'Tu libro más querido está lleno de anotaciones',
      'Valoras las traducciones literarias y sabes quién tradujo a quién',
      'Distingues entre un autor que "escribe bien" y uno que simplemente "cuenta bien"',
      'Te alegra que un libro sea difícil si la dificultad tiene sentido',
    ],
    generos: ['Novela literaria', 'Modernismo', 'Autoficción', 'Poesía en prosa', 'Prosa de ideas'],
    autores: ['Vladimir Nabokov', 'Virginia Woolf', 'Jorge Luis Borges', 'Marguerite Yourcenar', 'Clarice Lispector'],
    lecturas: [
      { titulo: 'Mrs. Dalloway', autor: 'Virginia Woolf' },
      { titulo: 'Lolita', autor: 'Vladimir Nabokov' },
      { titulo: 'Memorias de Adriano', autor: 'Marguerite Yourcenar' },
      { titulo: 'La pasión según G.H.', autor: 'Clarice Lispector' },
    ],
    consejo: 'Lee "Memorias de Adriano" de Yourcenar: un emperador romano reconstruye su vida con una prosa que es, en sí misma, el argumento del libro.',
  },
  pensador: {
    id: 'pensador',
    nombre: 'El Pensador',
    emoji: '💡',
    descripcion: 'Un libro tiene éxito si te ha dejado pensando más de lo que esperabas. Buscas libros que te confronten, que desafíen lo que creías saber, que te dejen una pregunta sin resolver. Eres el lector más propenso a releer en momentos distintos de la vida, porque el libro cambia según quién lo lee.',
    rasgos: [
      'Lees la bibliografía de los libros que te gustan para seguir tirando del hilo',
      'Mezclas sin problema ficción y ensayo en tu lista de lectura',
      'Un final sin respuestas es un regalo, no una frustración',
      'Eres el amigo que recomienda libros "que tienes que leer, aunque al principio cueste"',
      'Llevas siempre una libreta (física o mental) para las ideas que encuentras leyendo',
    ],
    generos: ['Ficción filosófica', 'Ensayo literario', 'Novela de ideas', 'Distopía intelectual', 'Literatura existencial'],
    autores: ['Fiódor Dostoievski', 'Albert Camus', 'José Saramago', 'W.G. Sebald', 'Milan Kundera'],
    lecturas: [
      { titulo: 'Crimen y castigo', autor: 'Fiódor Dostoievski' },
      { titulo: 'Ensayo sobre la ceguera', autor: 'José Saramago' },
      { titulo: 'La insoportable levedad del ser', autor: 'Milan Kundera' },
      { titulo: 'Los anillos de Saturno', autor: 'W.G. Sebald' },
    ],
    consejo: 'Empieza por Kundera: "La insoportable levedad del ser" mezcla filosofía, amor y política de una manera que te engancha antes de que te des cuenta de lo que está haciendo.',
  },
};

// ── Componente ─────────────────────────────────────────────────────────────

type Puntos = Record<ArquetipoId, number>;

/** Orden fijo de los perfiles: el de las opciones A-E y el del reparto de puntos. */
const ORDEN_ARQUETIPOS: ArquetipoId[] = ['detective', 'explorador', 'empatico', 'esteta', 'pensador'];

/** Puntos máximos posibles: cada respuesta suma 2 al perfil elegido. */
const PUNTOS_MAXIMOS = PREGUNTAS.length * 2;

/**
 * Clase de color de cada perfil (hallazgo 2620). Antes era un color en línea pensado para fondo
 * claro, que en oscuro dejaba las etiquetas de género entre 1,58:1 y 3,32:1. Ahora cada clase
 * define `--perfil-acento` con su variante oscura en el CSS, medida ≥ 4,5:1 en los dos temas.
 */
const CLASE_PERFIL: Record<ArquetipoId, string> = {
  detective: styles.perfilDetective,
  explorador: styles.perfilExplorador,
  empatico: styles.perfilEmpatico,
  esteta: styles.perfilEsteta,
  pensador: styles.perfilPensador,
};

function puntuacionInicial(): Puntos {
  return { detective: 0, explorador: 0, empatico: 0, esteta: 0, pensador: 0 };
}

/** «El Detective», «El Detective y El Pensador», «A, B y C». */
function unirNombres(nombres: string[]): string {
  if (nombres.length <= 1) return nombres.join('');
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}

export default function TestTipoLector() {
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState<Puntos>(puntuacionInicial());
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [fase, setFase] = useState<'test' | 'resultado'>('test');
  // En un empate, el perfil cuya ficha se está viendo (null = el primero de los empatados).
  const [perfilElegido, setPerfilElegido] = useState<ArquetipoId | null>(null);

  const enunciadoRef = useRef<HTMLHeadingElement>(null);
  const tituloResultadoRef = useRef<HTMLHeadingElement>(null);
  const seccionResultadoRef = useRef<HTMLElement>(null);
  // El foco solo se mueve tras una acción del usuario, nunca al cargar la página.
  const huboInteraccionRef = useRef(false);

  /**
   * Perfiles con la puntuación máxima (hallazgo 2616). Antes un `reduce` con `>` estricto
   * deshacía los empates en silencio por el orden de declaración: el 29,21 % de las
   * combinaciones empata en cabeza y el resultado nombraba un único perfil (el Detective ganaba
   * el 29,71 % con respuestas al azar y el Pensador ningún empate). Ahora, si hay empate, el
   * resultado lo dice —perfil mixto— y deja ver la ficha de cada perfil empatado.
   */
  const ganadores = useMemo<ArquetipoId[]>(() => {
    if (fase !== 'resultado') return [];
    const maximo = Math.max(...ORDEN_ARQUETIPOS.map((id) => puntos[id]));
    return ORDEN_ARQUETIPOS.filter((id) => puntos[id] === maximo);
  }, [fase, puntos]);

  const resultado: Arquetipo | null =
    ganadores.length === 0
      ? null
      : ARQUETIPOS[perfilElegido && ganadores.includes(perfilElegido) ? perfilElegido : ganadores[0]];

  const esMixto = ganadores.length > 1;

  /** Reparto de puntos de mayor a menor (a igualdad, en el orden fijo de los perfiles). */
  const reparto = useMemo<{ id: ArquetipoId; puntos: number }[]>(
    () =>
      ORDEN_ARQUETIPOS.map((id) => ({ id, puntos: puntos[id] })).sort((a, b) => b.puntos - a.puntos),
    [puntos]
  );

  /**
   * Foco y desplazamiento al cambiar de pantalla (hallazgos 2617 y 2618). «Siguiente» se
   * desactiva en la pregunta nueva, y «Ver mi resultado» y «Repetir el test» se desmontan: el foco
   * caía a <body>, el lector de pantalla no anunciaba nada y el siguiente Tab salía del test. Se
   * lleva al enunciado de la pregunta nueva o al encabezado del resultado. Además, al mostrar el
   * resultado, el anclaje de desplazamiento del navegador dejaba en pantalla lo que había DEBAJO
   * del cuestionario y el perfil quedaba hasta 1.400 px por encima: se lleva la vista a la
   * tarjeta. `scroll-margin-top` (CSS) deja libres los 80 px de la barra fija del logo.
   */
  useEffect(() => {
    if (!huboInteraccionRef.current) return;
    if (fase === 'resultado') {
      const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      tituloResultadoRef.current?.focus({ preventScroll: true });
      seccionResultadoRef.current?.scrollIntoView({
        block: 'start',
        behavior: reducirMovimiento ? 'auto' : 'smooth',
      });
    } else {
      enunciadoRef.current?.focus();
    }
  }, [fase, indice]);

  function handleOpcion(idx: number) {
    setSeleccionada(idx);
  }

  function handleSiguiente() {
    if (seleccionada === null) return;
    huboInteraccionRef.current = true;
    const arquetipo = PREGUNTAS[indice].opciones[seleccionada].arquetipo;
    const nuevos = { ...puntos, [arquetipo]: puntos[arquetipo] + 2 };
    setPuntos(nuevos);
    setSeleccionada(null);
    setPerfilElegido(null);

    if (indice + 1 >= PREGUNTAS.length) {
      setFase('resultado');
    } else {
      setIndice(indice + 1);
    }
  }

  function handleReiniciar() {
    huboInteraccionRef.current = true;
    setIndice(0);
    setPuntos(puntuacionInicial());
    setSeleccionada(null);
    setPerfilElegido(null);
    setFase('test');
  }

  const progreso = Math.round(((indice) / PREGUNTAS.length) * 100);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué tipo de lector eres?</h1>
        <p className={styles.heroSubtitle}>
          8 preguntas para descubrir tu arquetipo lector — géneros, autores y lecturas a tu medida.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {fase === 'test' && (
          <section className={styles.testBox}>
            {/* Progreso */}
            <div className={styles.progreso}>
              <div className={styles.progresoInfo}>
                <span className={styles.progresoLabel}>Pregunta {indice + 1} de {PREGUNTAS.length}</span>
                {/* Espacio duro U+00A0 antes del % (CLAUDE.md global §2, hallazgo 2621). */}
                <span className={styles.progresoLabel}>{progreso}{' '}%</span>
              </div>
              <div className={styles.progresoBar}>
                <div className={styles.progresoFill} style={{ width: `${progreso}%` }} />
              </div>
            </div>

            {/* Pregunta */}
            <h2 className={styles.pregunta} ref={enunciadoRef} tabIndex={-1}>{PREGUNTAS[indice].texto}</h2>

            {/* Opciones */}
            <div className={styles.opciones}>
              {PREGUNTAS[indice].opciones.map((opcion, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.opcion} ${seleccionada === i ? styles.opcionSeleccionada : ''}`}
                  onClick={() => handleOpcion(i)}
                  aria-pressed={seleccionada === i}
                >
                  <span className={styles.opcionLetra}>{String.fromCharCode(65 + i)}</span>
                  <span className={styles.opcionTexto}>{opcion.texto}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={handleSiguiente}
              disabled={seleccionada === null}
            >
              {indice + 1 < PREGUNTAS.length ? 'Siguiente →' : 'Ver mi resultado'}
            </button>
          </section>
        )}

        {fase === 'resultado' && resultado && (
          <section className={styles.resultado} ref={seccionResultadoRef}>
            <div className={`${styles.resultadoCard} ${CLASE_PERFIL[resultado.id]}`}>
              <div className={`${styles.resultadoHeader} ${esMixto ? styles.resultadoHeaderMixto : ''}`}>
                <span className={styles.resultadoEmoji} aria-hidden="true">
                  {ganadores.map((id) => ARQUETIPOS[id].emoji).join('')}
                </span>
                <div>
                  <p className={styles.resultadoEtiqueta}>
                    {esMixto ? 'Tu perfil lector es mixto' : 'Tu perfil lector es'}
                  </p>
                  <h2 className={styles.resultadoNombre} ref={tituloResultadoRef} tabIndex={-1}>
                    {unirNombres(ganadores.map((id) => ARQUETIPOS[id].nombre))}
                  </h2>
                </div>
              </div>

              <div className={styles.resultadoBody}>
                {esMixto && (
                  <div className={styles.empateBox}>
                    <p className={styles.empateTexto}>
                      Tus respuestas dan los mismos puntos ({puntos[ganadores[0]]} de {PUNTOS_MAXIMOS}) a{' '}
                      {ganadores.length} perfiles, así que ninguno domina: lees con los motores de todos ellos.
                      Elige cuál quieres ver en detalle.
                    </p>
                    <div className={styles.empateBotones} role="group" aria-label="Perfil empatado que se muestra">
                      {ganadores.map((id) => (
                        <button
                          key={id}
                          type="button"
                          className={`${styles.btnEmpate} ${resultado.id === id ? styles.btnEmpateActivo : ''}`}
                          aria-pressed={resultado.id === id}
                          onClick={() => setPerfilElegido(id)}
                        >
                          <span aria-hidden="true">{ARQUETIPOS[id].emoji}</span> {ARQUETIPOS[id].nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {esMixto && <h3 className={styles.fichaTitulo}>{resultado.nombre}</h3>}
                <p className={styles.resultadoDesc}>{resultado.descripcion}</p>

                <div className={styles.resultadoGrid}>
                  {/* Rasgos */}
                  <div className={styles.resultadoBloque}>
                    <h3 className={styles.resultadoBloqueTitle}><span aria-hidden="true">📌</span> Te reconocerás en esto</h3>
                    <ul className={styles.rasgosList}>
                      {resultado.rasgos.map(r => (
                        <li key={r} className={styles.rasgoItem}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Géneros */}
                  <div className={styles.resultadoBloque}>
                    <h3 className={styles.resultadoBloqueTitle}><span aria-hidden="true">📚</span> Tus géneros</h3>
                    <div className={styles.generosWrap}>
                      {resultado.generos.map(g => (
                        <span key={g} className={styles.generoTag}>{g}</span>
                      ))}
                    </div>

                    <h3 className={styles.resultadoBloqueTitle} style={{ marginTop: '1.25rem' }}><span aria-hidden="true">✒️</span> Autores que te gustarán</h3>
                    <div className={styles.autoresList}>
                      {resultado.autores.map(a => (
                        <span key={a} className={styles.autorItem}>{a}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lecturas */}
                <div className={styles.lecturasBloque}>
                  <h3 className={styles.resultadoBloqueTitle}><span aria-hidden="true">📖</span> Lecturas recomendadas para ti</h3>
                  <div className={styles.lecturasGrid}>
                    {resultado.lecturas.map(l => (
                      <div key={l.titulo} className={styles.lecturaCard}>
                        <p className={styles.lecturaTitulo}>{l.titulo}</p>
                        <p className={styles.lecturaAutor}>{l.autor}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consejo */}
                <div className={styles.consejoBox}>
                  <span className={styles.consejoIcono} aria-hidden="true">💬</span>
                  <p className={styles.consejoTexto}>{resultado.consejo}</p>
                </div>

                {/* Reparto: hace visible el criterio (la suma de las 8 respuestas) */}
                <div className={styles.repartoBloque}>
                  <h3 className={styles.resultadoBloqueTitle}><span aria-hidden="true">📊</span> Tu reparto de puntos</h3>
                  <ul className={styles.repartoLista}>
                    {reparto.map(({ id, puntos: p }) => (
                      <li key={id} className={`${styles.repartoFila} ${CLASE_PERFIL[id]}`}>
                        <span className={styles.repartoNombre}>{ARQUETIPOS[id].nombre}</span>
                        <span className={styles.repartoBarra} aria-hidden="true">
                          <span className={styles.repartoRelleno} style={{ width: `${(p / PUNTOS_MAXIMOS) * 100}%` }} />
                        </span>
                        <span className={styles.repartoCifra}>{p} de {PUNTOS_MAXIMOS}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button type="button" className={styles.btnReiniciar} onClick={handleReiniciar}>
                  <span aria-hidden="true">🔄</span> Repetir el test
                </button>
              </div>
            </div>
          </section>
        )}

        <EducationalSection title="Los 5 perfiles de lector" subtitle="Conoce todos los arquetipos y lo que los define">
          <div className={styles.guideSection}>
            <p>No hay un tipo de lector mejor que otro: cada perfil responde a una relación distinta con la literatura. La mayoría de los lectores son una mezcla de arquetipos, con uno dominante que varía según el momento vital.</p>

            {/* Tabla comparativa */}
            <h3>Los 5 arquetipos de un vistazo</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Arquetipo</th>
                    <th>Motor de lectura</th>
                    <th>Géneros favoritos</th>
                    <th>Peor pesadilla</th>
                    <th>Autores emblema</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><span aria-hidden="true">🔍</span> El Detective</td><td>Resolver la trama</td><td>Thriller, negro, misterio</td><td>Final predecible</td><td>Christie, Larsson, Flynn</td></tr>
                  <tr><td><span aria-hidden="true">🌌</span> El Explorador</td><td>Salir del mundo real</td><td>Fantasía, sci-fi, histórica</td><td>Ambientación pobre</td><td>Tolkien, Le Guin, Follett</td></tr>
                  <tr><td><span aria-hidden="true">❤️</span> El Empático</td><td>Personajes verdaderos</td><td>Novela contemporánea, drama</td><td>Personajes planos</td><td>Ferrante, Rooney, Munro</td></tr>
                  <tr><td><span aria-hidden="true">✒️</span> El Esteta</td><td>La belleza del lenguaje</td><td>Novela literaria, modernismo</td><td>Prosa descuidada</td><td>Nabokov, Woolf, Borges</td></tr>
                  <tr><td><span aria-hidden="true">💡</span> El Pensador</td><td>Ideas transformadoras</td><td>Ficción filosófica, ensayo</td><td>Sin profundidad</td><td>Dostoievski, Camus, Kundera</td></tr>
                </tbody>
              </table>
            </div>

            {/* Escenarios */}
            <h3>¿Cómo lees según tu perfil?</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">🔍</span>
                  <h4>El Detective elige un libro</h4>
                </div>
                <p>Lee la contraportada buscando el gancho de la trama. Si hay un crimen, una conspiración o un secreto, ya está convencido.</p>
                <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Prueba a leer un clásico literario como si fuera un thriller: siempre hay un secreto que descubrir.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">🌌</span>
                  <h4>El Explorador elige un libro</h4>
                </div>
                <p>Busca el mapa al principio. Si hay un glosario de términos inventados, mejor. La sinopsis le interesa menos que el mundo que promete.</p>
                <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> La novela histórica rigurosa puede darte mundos tan ricos como la mejor fantasía.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">❤️</span>
                  <h4>El Empático elige un libro</h4>
                </div>
                <p>Pregunta a alguien de confianza: «¿Este libro te ha emocionado?». Si la respuesta es sí, y si conoce a quién le pregunta, el libro es suyo.</p>
                <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Los personajes más complejos están en la novela literaria: merece la pena salir del género de confort.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">✒️</span>
                  <h4>El Esteta elige un libro</h4>
                </div>
                <p>Abre el libro por una página cualquiera y lee un párrafo. Si la frase no le retiene, la sinopsis da igual. Antes de decidir, mira quién firma la traducción.</p>
                <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> El relato breve y la poesía en prosa concentran mucha escritura en pocas páginas: buen atajo para descubrir autores.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">💡</span>
                  <h4>El Pensador elige un libro</h4>
                </div>
                <p>Lee el índice, el prólogo, las últimas líneas. Quiere saber si hay algo que no sabía antes de empezar. La promesa de una idea nueva basta.</p>
                <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> La mejor ficción filosófica es también un thriller de ideas: Dostoievski, Kafka, Saramago.</p>
              </div>
            </div>

            {/* FAQ */}
            <h3>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Puedo ser una mezcla de varios arquetipos?</h4>
                <p>Sí, y es lo más habitual. El test suma tus respuestas y te da el perfil con más puntos; si dos o más empatan, te lo dice como perfil mixto y te deja ver la ficha de cada uno. En cualquier caso, la mayoría de lectores tienen rasgos de dos o tres arquetipos. Un Detective que también es Pensador suele leer mucho noir filosófico (Camus, Ellroy). Un Explorador con alma de Esteta busca worldbuilding con prosa trabajada (Le Guin, Peake).</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Los perfiles cambian con el tiempo?</h4>
                <p>Sí. Es muy común empezar siendo Explorador en la adolescencia (fantasía, sci-fi) y migrar hacia el Empático o el Pensador en la madurez. El perfil lector evoluciona con la persona.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Hay perfiles «más cultos» que otros?</h4>
                <p>No. El Esteta y el Pensador no son más lectores que el Detective o el Explorador: simplemente priorizan distinto. Un lector de género negro que lee 30 libros al año sabe más sobre su tradición que un lector ocasional de premios Nobel.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Para qué sirve conocer mi perfil?</h4>
                <p>Para elegir mejor: cuando conoces tu motor de lectura, reconoces más rápidamente qué libros te van a funcionar. También sirve para salir de la zona de confort de manera informada: un Empático que quiere explorar el noir puede empezar por autores con personajes muy humanos (Donna Leon, Martin Beck de Sjöwall y Wahlöö).</p>
              </div>
            </div>

            {/* Guía */}
            <h3>Cómo usar tu resultado</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Reconoce tu motor de lectura</h4>
                  <p>Saber qué te engancha te permite filtrar rápidamente: si eres Detective, prioriza la sinopsis; si eres Esteta, mira quién tradujo.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Explora los autores emblema de tu arquetipo</h4>
                  <p>Si no conoces ninguno, empieza por el que aparece primero en la lista: suele ser el más accesible del grupo.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Amplía hacia el arquetipo adyacente</h4>
                  <p>Detective → Pensador (noir filosófico); Explorador → Empático (fantasía de personajes); Esteta → Pensador (prosa de ideas).</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Repite el test en 6 meses</h4>
                  <p>El perfil lector cambia. Si estás leyendo mucho o pasando por un momento vital intenso, el resultado puede sorprenderte.</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <h3>Consejos por arquetipo</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🔍</span>
                <h4>Detective</h4>
                <p>Prueba el thriller histórico (Arturo Pérez-Reverte) o el noir escandinavo: más psicología, menos acción.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🌌</span>
                <h4>Explorador</h4>
                <p>La novela histórica rigurosa puede darte mundos tan ricos como la mejor fantasía épica.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">❤️</span>
                <h4>Empático</h4>
                <p>Lee autoficción: las narraciones en primera persona de Ferrante, Knausgård o Ernaux te darán personajes sin filtro.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">✒️</span>
                <h4>Esteta</h4>
                <p>Colecciona traducciones: la misma obra puede sonar completamente diferente según el traductor.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">💡</span>
                <h4>Pensador</h4>
                <p>Alterna ficción y ensayo: leer "La náusea" de Sartre y su ensayo "El existencialismo es un humanismo" en paralelo dobla el efecto.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">📚</span>
                <h4>Todos</h4>
                <p>El mejor libro siempre es el que te da algo que los del mismo género no te dan. Sal del perfil una vez al año.</p>
              </div>
            </div>

            {/* Warning box */}
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
                <h4>Errores frecuentes al elegir lecturas</h4>
              </div>
              <ul className={styles.warningList}>
                <li>Confundir "libro difícil" con "libro bueno": la dificultad tiene que servir a algo.</li>
                <li>Abandonar un género por un mal ejemplo: cada género tiene sus cumbres y sus mediocridades.</li>
                <li>Creer que leer clásicos es obligatorio: los clásicos merecen leerse, pero en el momento adecuado.</li>
                <li>Dejar que otros decidan que un libro "no es para ti" antes de probarlo.</li>
                <li>Terminar libros que no te gustan solo por obligación: la vida es corta y los libros, muchos.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps />
      <ShareCard appName="test-tipo-lector" />
      <Footer appName="test-tipo-lector" />
    </div>
  );
}
