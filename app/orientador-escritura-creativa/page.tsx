'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './OrientadorEscrituraCreativa.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos ──────────────────────────────────────────────────────────────────

type GeneroId = 'novela' | 'cuento' | 'historica' | 'poesia' | 'memorias' | 'ensayo';
type PerspectivaId = 'primera' | 'tercera-omnisciente' | 'tercera-limitada' | 'segunda';
type Paso = 1 | 2 | 3;

interface Genero {
  id: GeneroId;
  nombre: string;
  icono: string;
  descripcion: string;
  ejemplo: string;
  extension: string;
  dificultad: string;
}

interface Perspectiva {
  id: PerspectivaId;
  nombre: string;
  forma: string;
  icono: string;
  descripcion: string;
  ventajas: string[];
  ideal: string;
  ejemploFamoso: string;
}

interface EstructuraPaso {
  titulo: string;
  descripcion: string;
}

interface PreguntaKit {
  pregunta: string;
  placeholder: string;
}

interface GuiaGenero {
  estructura: EstructuraPaso[];
  preguntasKit: PreguntaKit[];
  erroresFrecuentes: string[];
  consejoClave: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────

const GENEROS_CON_PERSPECTIVA: GeneroId[] = ['novela', 'cuento', 'historica', 'memorias'];

const generos: Genero[] = [
  {
    id: 'novela',
    nombre: 'Novela',
    icono: '📖',
    descripcion: 'Historia larga con personajes complejos, tramas y subtramas que se desarrollan a lo largo de varios capítulos.',
    ejemplo: 'El Quijote, Harry Potter, El nombre de la rosa',
    extension: '50.000 – 120.000+ palabras',
    dificultad: 'Intermedia',
  },
  {
    id: 'cuento',
    nombre: 'Cuento corto',
    icono: '✨',
    descripcion: 'Historia breve centrada en un único evento o personaje, con gran economía de palabras y un impacto emocional concentrado.',
    ejemplo: 'La gallina degollada (Quiroga), El aleph (Borges)',
    extension: '500 – 10.000 palabras',
    dificultad: 'Ideal para empezar',
  },
  {
    id: 'historica',
    nombre: 'Novela histórica',
    icono: '🏰',
    descripcion: 'Ficción ambientada en un período histórico real, combinando hechos documentados con personajes y tramas inventados.',
    ejemplo: 'Los pilares de la tierra (Follett), El médico (Gordon)',
    extension: '80.000 – 150.000+ palabras',
    dificultad: 'Avanzada',
  },
  {
    id: 'poesia',
    nombre: 'Poesía',
    icono: '🎭',
    descripcion: 'Expresión artística a través del verso, el ritmo y la metáfora. Puede ser rimada, libre, visual o experimental.',
    ejemplo: 'Neruda, García Lorca, Benedetti',
    extension: 'Libre (desde 1 verso)',
    dificultad: 'Ideal para empezar',
  },
  {
    id: 'memorias',
    nombre: 'Memorias',
    icono: '📔',
    descripcion: 'Narración de experiencias propias con valor literario, centrada en períodos o episodios concretos con perspectiva adulta.',
    ejemplo: 'En el camino (Kerouac), La casa de los espíritus (Allende)',
    extension: '40.000 – 100.000 palabras',
    dificultad: 'Intermedia',
  },
  {
    id: 'ensayo',
    nombre: 'Ensayo / Crónica',
    icono: '✍️',
    descripcion: 'Reflexión personal sobre un tema, expresada con estilo propio. La crónica narra hechos reales con voz literaria.',
    ejemplo: 'Montaigne, Savater, Martínez Estrada',
    extension: '1.000 – 30.000 palabras',
    dificultad: 'Intermedia',
  },
];

const perspectivas: Perspectiva[] = [
  {
    id: 'primera',
    nombre: '1.ª persona',
    forma: '"Yo caminé hacia la puerta..."',
    icono: '👤',
    descripcion: 'El narrador es el protagonista o testigo de la historia. La voz es íntima y directa, pero tiene acceso limitado al interior de otros personajes.',
    ventajas: ['Conexión emocional inmediata', 'Voz auténtica y personal', 'Natural para memorias y thrillers'],
    ideal: 'Historias íntimas, thrillers psicológicos, coming-of-age',
    ejemploFamoso: 'El guardián entre el centeno — J.D. Salinger',
  },
  {
    id: 'tercera-omnisciente',
    nombre: '3.ª persona omnisciente',
    forma: '"Ella sabía lo que él pensaba..."',
    icono: '🌍',
    descripcion: 'El narrador lo sabe todo: pensamientos y sentimientos de todos los personajes, eventos pasados y futuros. Máxima flexibilidad.',
    ventajas: ['Acceso a todos los personajes', 'Múltiples puntos de vista', 'Clásico de la narrativa épica'],
    ideal: 'Novelas épicas, sagas, ficción histórica, realismo mágico',
    ejemploFamoso: 'Cien años de soledad — Gabriel García Márquez',
  },
  {
    id: 'tercera-limitada',
    nombre: '3.ª persona limitada',
    forma: '"Ella escuchó el ruido y se asustó..."',
    icono: '🔍',
    descripcion: 'El narrador sigue a un personaje concreto y solo accede a sus pensamientos. Es la perspectiva más usada en la ficción contemporánea.',
    ventajas: ['Tensión y misterio naturales', 'Más empático que la omnisciente', 'Fácil de mantener sin confundir'],
    ideal: 'Novela contemporánea, thrillers, fantasía, ciencia ficción',
    ejemploFamoso: 'Harry Potter — J.K. Rowling',
  },
  {
    id: 'segunda',
    nombre: '2.ª persona (experimental)',
    forma: '"Tú cruzas la puerta y ves..."',
    icono: '🎮',
    descripcion: 'El narrador se dirige al lector como "tú". Muy poco frecuente; crea un efecto inmersivo o de juego interactivo. No apto para principiantes.',
    ventajas: ['Efecto inmersivo y experimental', 'Memorable por su rareza', 'Impacto en cuentos cortos'],
    ideal: 'Cuentos experimentales, literatura metaficcional',
    ejemploFamoso: 'Si una noche de invierno un viajero — Italo Calvino',
  },
];

const guiasPorGenero: Record<GeneroId, GuiaGenero> = {
  novela: {
    estructura: [
      { titulo: '1. Presentación (Acto I)', descripcion: 'Introduce al protagonista, el mundo donde vive y la situación inicial. Termina con el "incidente desencadenante" que rompe el equilibrio.' },
      { titulo: '2. Conflicto creciente (Acto II-A)', descripcion: 'El protagonista persigue su objetivo pero encuentra obstáculos progresivos. Las apuestas aumentan y las subtramas se entrelazan.' },
      { titulo: '3. Punto de no retorno (Midpoint)', descripcion: 'Evento central que cambia la dirección de la historia. El protagonista ya no puede volver al estado inicial.' },
      { titulo: '4. Crisis y oscuridad (Acto II-B)', descripcion: 'Todo parece perdido. El protagonista llega a su punto más bajo, justo antes del clímax.' },
      { titulo: '5. Clímax (Acto III)', descripcion: 'La confrontación definitiva con el conflicto principal. El protagonista debe usar todo lo aprendido durante el camino.' },
      { titulo: '6. Desenlace', descripcion: 'Resolución y nuevo equilibrio. Las subtramas se cierran. El lector ve en qué ha cambiado el protagonista.' },
    ],
    preguntasKit: [
      { pregunta: '¿Quién es tu protagonista?', placeholder: 'Nombre, edad, profesión, rasgo principal...' },
      { pregunta: '¿Qué quiere con urgencia?', placeholder: 'Su objetivo externo (lo que busca conseguir)...' },
      { pregunta: '¿Qué le impide conseguirlo?', placeholder: 'El obstáculo o antagonista principal...' },
      { pregunta: '¿Qué necesita aprender (arco interno)?', placeholder: 'Su transformación emocional o moral...' },
      { pregunta: '¿Cuándo y dónde transcurre?', placeholder: 'Época, lugar, atmósfera...' },
      { pregunta: '¿Cuál es el clímax en una frase?', placeholder: 'El momento de mayor tensión...' },
    ],
    erroresFrecuentes: [
      'Empezar con el protagonista mirándose al espejo o con el despertador sonando',
      'Prólogos largos que no añaden nada que no se pueda contar después',
      'Flashbacks extensos en los primeros capítulos en lugar de mostrar el presente',
      'Personajes sin defectos ni contradicciones (el "héroe perfecto")',
      'Diálogos que no suenan naturales: nadie habla en párrafos perfectos',
      'Abandonar el proyecto tras el primer capítulo porque "no es perfecto"',
    ],
    consejoClave: 'Escribe el primer borrador sin releerlo. La perfección llega en la revisión, no en la primera escritura.',
  },
  cuento: {
    estructura: [
      { titulo: '1. Arranque in medias res', descripcion: 'Empieza en plena acción o en un momento de tensión. No hay tiempo para presentaciones largas.' },
      { titulo: '2. Situación inicial + personaje', descripcion: 'Con muy pocos trazos, define quién es el protagonista y qué está en juego para él.' },
      { titulo: '3. Punto de giro', descripcion: 'El evento o revelación que cambia todo. En el cuento, suele ser único y definitivo.' },
      { titulo: '4. Clímax condensado', descripcion: 'La confrontación o decisión clave. Debe ser breve pero contundente.' },
      { titulo: '5. Final resonante', descripcion: 'Los buenos cuentos terminan con una imagen, una frase o una pregunta que resuena en el lector mucho después.' },
    ],
    preguntasKit: [
      { pregunta: '¿Cuál es el único evento central?', placeholder: 'El incidente que da sentido al relato...' },
      { pregunta: '¿Cómo empieza in medias res?', placeholder: 'La primera frase o escena de acción...' },
      { pregunta: '¿Cuál es el giro o revelación?', placeholder: 'El momento que cambia la perspectiva del lector...' },
      { pregunta: '¿Con qué imagen o frase termina?', placeholder: 'El remate que dejará huella...' },
    ],
    erroresFrecuentes: [
      'Demasiados personajes para la extensión del relato',
      'Comenzar con contexto histórico o descripción del lugar en lugar de acción',
      'Finales explicativos que no dejan nada a la imaginación del lector',
      'Subtexto ausente: lo que no se dice es tan importante como lo que se dice',
      'Extenderse más allá del punto de equilibrio natural del relato',
    ],
    consejoClave: 'El cuento es un iceberg: 9/10 partes sumergidas. Cada palabra visible lleva el peso de todo lo que no se dice.',
  },
  historica: {
    estructura: [
      { titulo: '1. Inmersión en el período', descripcion: 'Los primeros capítulos establecen el mundo histórico con detalles sensoriales precisos, sin caer en el "apunte de enciclopedia".' },
      { titulo: '2. Personajes ficticios en eventos reales', descripcion: 'Protagonistas inventados que interactúan con personajes históricos o están directamente afectados por los grandes eventos.' },
      { titulo: '3. Tensión entre Historia e historia', descripcion: 'La trama personal del protagonista debe estar entrelazada con los eventos históricos de forma orgánica, no forzada.' },
      { titulo: '4. Documentación visible pero no invasiva', descripcion: 'El lector aprende historia sin darse cuenta. Los datos históricos fluyen a través de los ojos del personaje.' },
      { titulo: '5. Resolución coherente con el período', descripcion: 'El desenlace debe ser creíble para la época, sin imponer valores actuales a personajes del pasado.' },
    ],
    preguntasKit: [
      { pregunta: '¿Qué período histórico?', placeholder: 'Época, lugar, eventos históricos que enmarcan la historia...' },
      { pregunta: '¿Cuánto has investigado ya?', placeholder: 'Fuentes consultadas, libros de referencia, documentos...' },
      { pregunta: '¿Cuál es el conflicto personal del protagonista?', placeholder: 'La historia individual dentro de la Historia grande...' },
      { pregunta: '¿Qué evento histórico real marca el clímax?', placeholder: 'El hecho documentado que sirve de punto de inflexión...' },
    ],
    erroresFrecuentes: [
      'Personajes que piensan y hablan con mentalidad del siglo XXI en un contexto histórico',
      'Abusar del "como todos saben en el año 1347..." para exponer información',
      'Investigar durante años sin escribir nunca (parálisis por perfeccionismo)',
      'Inventar datos históricos sin marcarlos claramente como ficción en el epílogo',
      'Ignorar la vida cotidiana del período para centrarse solo en grandes eventos',
    ],
    consejoClave: 'Investiga lo suficiente para escribir con confianza, no para convertirte en historiador. La ficción tiene sus propias reglas.',
  },
  poesia: {
    estructura: [
      { titulo: '1. La imagen central', descripcion: 'Toda buena poesía parte de una imagen concreta (visual, sensorial, emocional) que contiene el significado del poema.' },
      { titulo: '2. El verso', descripcion: 'Unidad mínima. Puede tener medida (7, 11, 14 sílabas) o ser libre. Cada salto de línea crea un efecto de pausa y ritmo.' },
      { titulo: '3. La estrofa', descripcion: 'Agrupación de versos. Desde el pareado (2 versos) hasta el soneto (14). O sin estructura fija en verso libre.' },
      { titulo: '4. Tono y musicalidad', descripcion: 'La musicalidad no requiere rima. La repetición de sonidos, palabras y estructuras (anáfora) crea ritmo interno.' },
      { titulo: '5. El final abierto', descripcion: 'El poema termina cuando la imagen llega a su punto de máxima tensión. No se explica: se sugiere.' },
    ],
    preguntasKit: [
      { pregunta: '¿Qué emoción o imagen quieres transmitir?', placeholder: 'La sensación central del poema...' },
      { pregunta: '¿Métrica libre o clásica?', placeholder: '¿Verso libre, soneto, haiku, romance, silva...?' },
      { pregunta: '¿Cuál es la metáfora central?', placeholder: 'La imagen que lleva el peso del significado...' },
      { pregunta: '¿Qué palabra o frase repites para crear ritmo?', placeholder: 'La repetición (anáfora, estribillo) que estructura el poema...' },
    ],
    erroresFrecuentes: [
      'Confundir "rima" con "poesía": la rima forzada destruye el significado',
      'Decir en lugar de mostrar: "estoy triste" vs. "la lluvia sobre el cristal sin limpiar"',
      'Palabras abstractas sin anclaje sensorial: amor, paz, vida, muerte (sin imagen concreta)',
      'Puntuación idéntica a la prosa: el verso tiene sus propias pausas y respiraciones',
      'Imitar en lugar de buscar tu voz propia — el estilo emerge leyendo y escribiendo',
    ],
    consejoClave: 'Lee 10 poemas por cada uno que escribas. La poesía se aprende leyendo, escuchando y viviendo con los ojos abiertos.',
  },
  memorias: {
    estructura: [
      { titulo: '1. El narrador adulto en el presente', descripcion: 'Las memorias tienen dos voces: el "yo" que vivió los hechos y el "yo" que los narra con perspectiva desde hoy.' },
      { titulo: '2. Selección de momentos', descripcion: 'No se narra toda la vida. Se eligen los episodios con mayor carga emocional o que más contribuyen al relato global.' },
      { titulo: '3. Honestidad e invención', descripcion: 'Nadie recuerda con exactitud. Las memorias son interpretación del pasado. La honestidad emocional vale más que la precisión factual.' },
      { titulo: '4. El arco de transformación', descripcion: 'El lector debe sentir que el narrador ha cambiado. ¿Qué aprendiste? ¿Cómo eres diferente gracias a lo que viviste?' },
      { titulo: '5. El cierre reflexivo', descripcion: 'Las memorias terminan con reflexión, no necesariamente con resolución. Las heridas que no se cierran también son literariamente honestas.' },
    ],
    preguntasKit: [
      { pregunta: '¿Qué período o experiencia quieres narrar?', placeholder: 'Infancia, una relación, un viaje, un trabajo, una pérdida...' },
      { pregunta: '¿Quién eres tú como narrador hoy?', placeholder: 'Tu perspectiva actual sobre esos hechos pasados...' },
      { pregunta: '¿Qué escenas concretas te vienen a la mente?', placeholder: 'Las imágenes más vívidas del período...' },
      { pregunta: '¿Qué aprendiste o cómo cambiaste?', placeholder: 'El arco de transformación personal...' },
    ],
    erroresFrecuentes: [
      'Confundir memorias con diario: las memorias tienen forma literaria, no solo registro cronológico',
      'Incluir todos los detalles "por si acaso": la selección rigurosa es el arte de las memorias',
      'Olvidar la voz narrativa adulta que observa al "yo" del pasado con distancia',
      'Ajustar cuentas de forma agresiva con otras personas (riesgo legal y ético real)',
      'Esperar a "tener suficiente perspectiva": nunca hay un momento perfecto para escribirlas',
    ],
    consejoClave: 'Escribe para entenderte a ti mismo, no para justificarte ante los demás. La honestidad es lo que convierte un recuerdo en literatura.',
  },
  ensayo: {
    estructura: [
      { titulo: '1. Tesis o pregunta inicial', descripcion: 'El ensayo parte de una afirmación (que se va a demostrar) o una pregunta (que se va a explorar). Debe ser concisa y provocadora.' },
      { titulo: '2. Desarrollo argumentativo', descripcion: 'Cada párrafo es un argumento. Idea principal + evidencia o ejemplo + conexión con la tesis central.' },
      { titulo: '3. La voz personal', descripcion: 'A diferencia del artículo académico, el ensayo lleva la marca del autor. La primera persona es bienvenida.' },
      { titulo: '4. Los contraargumentos', descripcion: 'Un buen ensayista reconoce las objeciones y las responde. Ignorarlas debilita el argumento en lugar de fortalecerlo.' },
      { titulo: '5. Conclusión abierta', descripcion: 'El ensayo puede terminar con más preguntas que respuestas. Lo importante es dejar al lector con ganas de pensar.' },
    ],
    preguntasKit: [
      { pregunta: '¿Cuál es tu tesis en una frase?', placeholder: 'La afirmación central que defiendes o exploras...' },
      { pregunta: '¿Qué evidencia tienes para sostenerla?', placeholder: 'Ejemplos, datos, experiencias propias, fuentes...' },
      { pregunta: '¿Cuál es el mejor contraargumento?', placeholder: 'La objeción más sólida que deberás responder...' },
      { pregunta: '¿A quién le hablas? ¿Quién es tu lector ideal?', placeholder: 'El público al que diriges el ensayo...' },
    ],
    erroresFrecuentes: [
      'Empezar sin tesis clara: el ensayo sin punto de vista es solo un resumen informativo',
      'Mezclar demasiados temas (el ensayo de cinco páginas sobre "todo")',
      'Citar sin pensar: las fuentes apoyan, no reemplazan, tu argumento',
      'Escribir en jerga académica cuando el ensayo literario pide claridad y elegancia',
      'No revisar la coherencia entre párrafos: cada uno debe llevar al siguiente con lógica',
    ],
    consejoClave: 'El ensayo es un pensamiento en movimiento. Escribe para descubrir lo que piensas, no para demostrar lo que ya sabes.',
  },
};

// ── Componente ─────────────────────────────────────────────────────────────

export default function OrientadorEscrituraCreativaPage() {
  const [paso, setPaso] = useState<Paso>(1);
  const [generoId, setGeneroId] = useState<GeneroId | null>(null);
  const [perspectivaId, setPerspectivaId] = useState<PerspectivaId | null>(null);
  const [respuestasKit, setRespuestasKit] = useState<Record<string, string>>({});
  const [mostrarHojaRuta, setMostrarHojaRuta] = useState(false);

  const generoSeleccionado = generoId ? generos.find(g => g.id === generoId) ?? null : null;
  const perspectivaSeleccionada = perspectivaId ? perspectivas.find(p => p.id === perspectivaId) ?? null : null;
  const guia = generoId ? guiasPorGenero[generoId] : null;
  const necesitaPerspectiva = generoId !== null && GENEROS_CON_PERSPECTIVA.includes(generoId);

  const handleGeneroSelect = (id: GeneroId) => {
    setGeneroId(id);
    setPerspectivaId(null);
    setRespuestasKit({});
    setMostrarHojaRuta(false);
  };

  const handleSiguiente = () => {
    if (paso === 1 && generoId) {
      setPaso(necesitaPerspectiva ? 2 : 3);
    } else if (paso === 2) {
      setPaso(3);
    }
  };

  const handleAtras = () => {
    if (paso === 3) {
      setPaso(necesitaPerspectiva ? 2 : 1);
    } else if (paso === 2) {
      setPaso(1);
    }
  };

  const handleRespuestaKit = (pregunta: string, valor: string) => {
    setRespuestasKit(prev => ({ ...prev, [pregunta]: valor }));
  };

  const reiniciar = () => {
    setPaso(1);
    setGeneroId(null);
    setPerspectivaId(null);
    setRespuestasKit({});
    setMostrarHojaRuta(false);
  };

  const pasoActualLabel = paso === 1 ? 'Género' : paso === 2 ? 'Perspectiva' : 'Tu guía';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>✍️ Orientador de Escritura Creativa</h1>
        <p className={styles.subtitle}>Tu guía personalizada para empezar a escribir con confianza</p>
      </header>

      <LegalNotice />

      {/* Indicador de progreso */}
      <nav className={styles.progressBar} aria-label={`Paso actual: ${pasoActualLabel}`}>
        {[1, 2, 3].map(n => {
          const labels = ['Género', 'Perspectiva', 'Tu guía'];
          const isActive = paso >= n;
          const isSkipped = n === 2 && !necesitaPerspectiva && paso >= 3;
          return (
            <div
              key={n}
              className={[
                styles.progressStep,
                isActive ? styles.progressStepActive : '',
                isSkipped ? styles.progressStepSkipped : '',
              ].join(' ')}
              aria-current={paso === n ? 'step' : undefined}
            >
              <span className={styles.progressNum}>{n}</span>
              <span className={styles.progressLabel}>{labels[n - 1]}</span>
            </div>
          );
        })}
      </nav>

      {/* PASO 1: Selección de género */}
      {paso === 1 && (
        <section className={styles.stepPanel}>
          <h2 className={styles.stepTitle}>¿Qué quieres escribir?</h2>
          <p className={styles.stepSubtitle}>Elige el tipo de texto que mejor se ajusta a tu idea o curiosidad</p>
          <div className={styles.generosGrid}>
            {generos.map(genero => (
              <button
                key={genero.id}
                className={[styles.generoCard, generoId === genero.id ? styles.generoCardSelected : ''].join(' ')}
                onClick={() => handleGeneroSelect(genero.id)}
                aria-pressed={generoId === genero.id}
                type="button"
              >
                <span className={styles.generoIcono} aria-hidden="true">{genero.icono}</span>
                <h3 className={styles.generoNombre}>{genero.nombre}</h3>
                <p className={styles.generoDesc}>{genero.descripcion}</p>
                <div className={styles.generoMeta}>
                  <span className={styles.generoExtension}>📏 {genero.extension}</span>
                  <span className={[
                    styles.generoDificultad,
                    genero.dificultad === 'Ideal para empezar' ? styles.dificultadFacil :
                    genero.dificultad === 'Avanzada' ? styles.dificultadAvanzada : '',
                  ].join(' ')}>{genero.dificultad}</span>
                </div>
                <p className={styles.generoEjemplos}>✨ {genero.ejemplo}</p>
              </button>
            ))}
          </div>
          <div className={styles.stepNav}>
            <button
              className={styles.btnPrimary}
              onClick={handleSiguiente}
              disabled={!generoId}
              type="button"
            >
              Siguiente →
            </button>
          </div>
        </section>
      )}

      {/* PASO 2: Selección de perspectiva */}
      {paso === 2 && generoSeleccionado && (
        <section className={styles.stepPanel}>
          <h2 className={styles.stepTitle}>¿Desde qué perspectiva narras?</h2>
          <p className={styles.stepSubtitle}>
            Has elegido <strong>{generoSeleccionado.icono} {generoSeleccionado.nombre}</strong>. ¿Quién cuenta la historia?
          </p>
          <div className={styles.perspectivGrid}>
            {perspectivas.map(p => (
              <button
                key={p.id}
                className={[styles.perspectivaCard, perspectivaId === p.id ? styles.perspectivaCardSelected : ''].join(' ')}
                onClick={() => setPerspectivaId(p.id)}
                aria-pressed={perspectivaId === p.id}
                type="button"
              >
                <div className={styles.perspectivHeader}>
                  <span className={styles.perspectivIcono} aria-hidden="true">{p.icono}</span>
                  <div>
                    <h3 className={styles.perspectivNombre}>{p.nombre}</h3>
                    <code className={styles.perspectivForma}>{p.forma}</code>
                  </div>
                </div>
                <p className={styles.perspectivDesc}>{p.descripcion}</p>
                <div className={styles.perspectivVentajas}>
                  {p.ventajas.map((v, i) => (
                    <span key={i} className={styles.ventajaBadge}>✓ {v}</span>
                  ))}
                </div>
                <p className={styles.perspectivIdeal}>🎯 Ideal para: {p.ideal}</p>
                <p className={styles.perspectivEjemplo}>📚 {p.ejemploFamoso}</p>
              </button>
            ))}
          </div>
          <div className={styles.stepNav}>
            <button className={styles.btnSecundario} onClick={handleAtras} type="button">← Atrás</button>
            <button
              className={styles.btnPrimary}
              onClick={handleSiguiente}
              disabled={!perspectivaId}
              type="button"
            >
              Ver mi guía →
            </button>
          </div>
        </section>
      )}

      {/* PASO 3: Guía personalizada */}
      {paso === 3 && generoSeleccionado && guia && (
        <section className={styles.stepPanel}>
          <div className={styles.resultBadge}>
            <span className={styles.resultBadgeIcono} aria-hidden="true">{generoSeleccionado.icono}</span>
            <div>
              <h2 className={styles.resultTitle}>{generoSeleccionado.nombre}</h2>
              {perspectivaSeleccionada && (
                <p className={styles.resultSubtitle}>{perspectivaSeleccionada.icono} {perspectivaSeleccionada.nombre}</p>
              )}
            </div>
          </div>

          {/* Estructura */}
          <div className={styles.guiaSection}>
            <h3 className={styles.guiaSectionTitle}>📐 Estructura básica</h3>
            <div className={styles.estructuraList}>
              {guia.estructura.map((e, i) => (
                <div key={i} className={styles.estructuraPaso}>
                  <div className={styles.estructuraNum} aria-hidden="true">{i + 1}</div>
                  <div className={styles.estructuraContent}>
                    <strong>{e.titulo}</strong>
                    <p>{e.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kit de arranque */}
          <div className={styles.guiaSection}>
            <h3 className={styles.guiaSectionTitle}>🚀 Kit de arranque</h3>
            <p className={styles.guiaSectionDesc}>
              Responde estas preguntas antes de escribir la primera línea. Cuanto más concretas sean tus respuestas, más fácil será empezar.
            </p>
            <div className={styles.kitPreguntas}>
              {guia.preguntasKit.map((q, i) => (
                <div key={i} className={styles.kitPregunta}>
                  <label htmlFor={`kit-${i}`} className={styles.kitLabel}>
                    <span className={styles.kitNum} aria-hidden="true">{i + 1}</span>
                    {q.pregunta}
                  </label>
                  <textarea
                    id={`kit-${i}`}
                    className={styles.kitInput}
                    placeholder={q.placeholder}
                    value={respuestasKit[q.pregunta] ?? ''}
                    onChange={e => handleRespuestaKit(q.pregunta, e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
            </div>
            <button
              className={styles.btnHojaRuta}
              onClick={() => setMostrarHojaRuta(true)}
              type="button"
            >
              📄 Generar mi Hoja de Ruta
            </button>
          </div>

          {/* Errores frecuentes */}
          <div className={styles.guiaSection}>
            <h3 className={styles.guiaSectionTitle}>⚠️ Errores frecuentes en {generoSeleccionado.nombre.toLowerCase()}</h3>
            <ul className={styles.erroresList}>
              {guia.erroresFrecuentes.map((error, i) => (
                <li key={i} className={styles.errorItem}>
                  <span className={styles.errorIcono} aria-hidden="true">❌</span>
                  {error}
                </li>
              ))}
            </ul>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcono} aria-hidden="true">💡</span>
              <p><strong>Consejo clave:</strong> {guia.consejoClave}</p>
            </div>
          </div>

          {/* Hoja de Ruta */}
          {mostrarHojaRuta && (
            <div className={styles.hojaRuta} role="region" aria-label="Hoja de ruta personalizada">
              <h3 className={styles.hojaRutaTitle}>📄 Mi Hoja de Ruta</h3>
              <div className={styles.hojaRutaGrid}>
                <div className={styles.hojaRutaItem}>
                  <span className={styles.hojaRutaLabel}>Género</span>
                  <span className={styles.hojaRutaValor}>{generoSeleccionado.icono} {generoSeleccionado.nombre}</span>
                </div>
                {perspectivaSeleccionada && (
                  <div className={styles.hojaRutaItem}>
                    <span className={styles.hojaRutaLabel}>Perspectiva</span>
                    <span className={styles.hojaRutaValor}>{perspectivaSeleccionada.icono} {perspectivaSeleccionada.nombre}</span>
                  </div>
                )}
                <div className={styles.hojaRutaItem}>
                  <span className={styles.hojaRutaLabel}>Extensión estimada</span>
                  <span className={styles.hojaRutaValor}>{generoSeleccionado.extension}</span>
                </div>
              </div>
              {guia.preguntasKit.some(q => respuestasKit[q.pregunta]?.trim()) && (
                <div className={styles.hojaRutaRespuestas}>
                  <h4 className={styles.hojaRutaRespuestasTitle}>Tus respuestas:</h4>
                  {guia.preguntasKit.map((q, i) =>
                    respuestasKit[q.pregunta]?.trim() ? (
                      <div key={i} className={styles.hojaRutaRespuesta}>
                        <strong>{q.pregunta}</strong>
                        <p>{respuestasKit[q.pregunta]}</p>
                      </div>
                    ) : null
                  )}
                </div>
              )}
              <p className={styles.hojaRutaConsejo}>
                <strong>Próximo paso:</strong> {guia.consejoClave}
              </p>
            </div>
          )}

          <div className={styles.stepNav}>
            <button className={styles.btnSecundario} onClick={handleAtras} type="button">
              ← Cambiar {necesitaPerspectiva ? 'perspectiva' : 'género'}
            </button>
            <button className={styles.btnSecundario} onClick={reiniciar} type="button">
              🔄 Empezar de nuevo
            </button>
          </div>
        </section>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Todo lo que necesitas saber antes de escribir"
        subtitle="Guía completa para el escritor que empieza desde cero"
      >
        {/* 1. Tabla Comparativa: los 6 géneros */}
        <section className={styles.guideSection}>
          <h2>Comparativa de géneros literarios</h2>
          <p>¿Todavía dudas entre géneros? Esta tabla te ayuda a decidir de un vistazo.</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Género</th>
                  <th>Extensión típica</th>
                  <th>Tiempo para terminarlo</th>
                  <th>Dificultad</th>
                  <th>Ideal si...</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>📖 Novela</strong></td>
                  <td>50.000–120.000 palabras</td>
                  <td>1–3 años</td>
                  <td>⚡⚡⚡</td>
                  <td>Tienes una historia larga con varios personajes</td>
                </tr>
                <tr>
                  <td><strong>✨ Cuento corto</strong></td>
                  <td>500–10.000 palabras</td>
                  <td>1 día–1 mes</td>
                  <td>⚡</td>
                  <td>Quieres empezar hoy y terminar pronto</td>
                </tr>
                <tr>
                  <td><strong>🏰 Novela histórica</strong></td>
                  <td>80.000–150.000 palabras</td>
                  <td>2–5 años</td>
                  <td>⚡⚡⚡⚡</td>
                  <td>Te apasiona un período histórico y quieres investigarlo</td>
                </tr>
                <tr>
                  <td><strong>🎭 Poesía</strong></td>
                  <td>1 verso – poemario</td>
                  <td>1 hora–6 meses</td>
                  <td>⚡</td>
                  <td>Tienes una imagen o emoción que quieres fijar en palabras</td>
                </tr>
                <tr>
                  <td><strong>📔 Memorias</strong></td>
                  <td>40.000–100.000 palabras</td>
                  <td>6 meses–2 años</td>
                  <td>⚡⚡</td>
                  <td>Quieres narrar tu propia historia con forma literaria</td>
                </tr>
                <tr>
                  <td><strong>✍️ Ensayo</strong></td>
                  <td>1.000–30.000 palabras</td>
                  <td>1 semana–6 meses</td>
                  <td>⚡⚡</td>
                  <td>Tienes una tesis o reflexión que quieres desarrollar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso: 4 perfiles de escritor principiante */}
        <section className={styles.guideSection}>
          <h2>¿Con qué perfil te identificas?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🌱</span>
                <h3>El que siempre lo quiso pero nunca empezó</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Llevas años diciendo "algún día escribiré un libro". La idea existe, pero el primer capítulo no.</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Recomendación:</strong> Empieza por el cuento corto. Una historia terminada, aunque sea breve, vale más que una novela a medias. El cuento te enseñará a estructurar, crear tensión y cerrar historias — todo en unas pocas páginas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">📓</span>
                <h3>El que lleva un diario y quiere ir más lejos</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Escribir ya es parte de tu vida. Tienes cuadernos llenos de reflexiones, recuerdos y observaciones.</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Recomendación:</strong> Las memorias o el ensayo son tu camino natural. Ya tienes el material: lo que necesitas es estructura literaria. La diferencia entre un diario y unas memorias está en la selección, la voz narrativa y el arco de transformación.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🎲</span>
                <h3>El que tiene LA historia en la cabeza</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Tienes un mundo, unos personajes y una trama que llevan años cocinándose en tu cabeza.</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Recomendación:</strong> La novela te espera, pero no la empieces por el capítulo 1. Empieza por responder el Kit de Arranque: protagonista, objetivo, obstáculo, arco. Cuando tengas esas 6 preguntas respondidas, el primer capítulo llegará solo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🔬</span>
                <h3>El apasionado de la historia o la ciencia</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Dominas un período histórico o campo científico y quieres hacerlo accesible al gran público.</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Recomendación:</strong> La novela histórica o el ensayo divulgativo son tu formato. Antes de escribir, decide: ¿quieres contar una historia (novela histórica) o quieres explicar y argumentar (ensayo)? Son habilidades distintas aunque compartan el material de fondo.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes del escritor principiante</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Necesito un plan detallado antes de escribir o puedo ir improvisando?</h4>
              <p>
                Depende de tu forma de pensar, no del género. Los escritores se dividen en <em>plotters</em> (planifican todo) y <em>pantsers</em> (escriben "a la intuición"). Ambos producen buena literatura. La recomendación para principiantes es el punto medio: responde el Kit de Arranque (protagonista, objetivo, obstáculo, clímax) pero deja que los detalles emerjan durante la escritura.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Si te bloqueas improvisando, escribe una frase resumen de cada capítulo antes de escribirlo. Si te bloqueas con el plan, escribe la escena más emocionante primero, aunque no sea la primera.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuántas palabras debería escribir al día?</h4>
              <p>
                No existe una respuesta correcta. Stephen King recomienda 2.000 palabras diarias; muchos escritores profesionales producen 500. Lo que importa es la regularidad: escribir 300 palabras todos los días produce 109.500 palabras al año — suficientes para dos novelas. La constancia supera a la intensidad, especialmente cuando se empieza.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Elige un número alcanzable y cúmplelo el 90% de los días. Es mejor 200 palabras diarias reales que 2.000 teóricas que rara vez suceden.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Primera persona o tercera persona: cuál es mejor para empezar?</h4>
              <p>
                La primera persona es más natural al principio porque es la voz de tu vida diaria. La tercera persona limitada (la más usada en la ficción contemporánea) da más flexibilidad sin la complejidad de la omnisciente. Evita la segunda persona ("tú") hasta que tengas varios proyectos terminados — es técnicamente muy exigente.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Escribe la primera escena en primera persona y luego en tercera limitada. Léelas en voz alta y elige la que suene más natural para esa historia específica.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué hago cuando me bloqueo y no sé cómo continuar?</h4>
              <p>
                El bloqueo del escritor rara vez es falta de inspiración: casi siempre es una señal de que algo no funciona en la historia. Pregúntate: ¿Mi personaje actuaría así realmente? ¿He resuelto el conflicto demasiado pronto? ¿Me he ido por las ramas en una subtrama? El bloqueo apunta al problema antes de que lo identifiques conscientemente.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Cuando te bloquees, escribe la escena desde el punto de vista del antagonista o de un personaje secundario. A menudo eso desbloquea el problema principal.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo sé que mi primer borrador está listo para ser revisado?</h4>
              <p>
                Cuando está terminado, aunque sea imperfecto. El error más común es revisar capítulo a capítulo mientras escribes: destruye el impulso y hace que reescribas sin conocer el final. Termina el borrador completo primero, luego espera al menos dos semanas antes de revisarlo. La distancia temporal es el mejor corrector de estilo.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> En el primer borrador, permítete todo: escenas malas, diálogos planos, inconsistencias. Escribe "[arreglar esto]" en el manuscrito y sigue adelante. El momentum importa más que la perfección.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Necesito leer mucho para escribir bien?</h4>
              <p>
                Sí, sin excepciones. Stephen King lo resume mejor que nadie: "Si no tienes tiempo para leer, no tienes el tiempo (ni las herramientas) para escribir." Leer en tu género te enseña estructuras, ritmos y convenciones. Leer fuera de tu género te da perspectiva y rompe clichés. Leer ficción mala te enseña exactamente qué no hacer.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Lee activamente: subraya frases que funcionan, anota qué hace el autor en los momentos de tensión, cómo construye los diálogos, cómo termina los capítulos. Léelo como escritor, no solo como lector.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo sé si mi historia tiene potencial?</h4>
              <p>
                Haz la prueba del "¿y qué?": después de cada frase importante de tu sinopsis, pregúntate "¿y qué?". Si la historia responde con más tensión, consecuencias o preguntas, tiene potencial. Si se detiene o la respuesta es obvia, necesita más conflicto. Una historia con potencial siempre tiene en juego algo que el protagonista no puede perder.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Cuéntale el argumento a alguien de confianza en dos minutos. Si hace preguntas al final ("¿y qué pasa después?"), la historia tiene gancho. Si asiente cortésmente y cambia de tema, revisa el conflicto central.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Debería mostrar mi texto mientras lo escribo o esperar a terminarlo?</h4>
              <p>
                No muestres el trabajo en progreso hasta tener al menos un borrador completo o una sección terminada. Las opiniones tempranas, aunque bienintencionadas, pueden desviar o bloquear el proceso. Sí puedes compartir la sinopsis o el concepto general para recibir feedback sobre la premisa antes de invertir meses en el desarrollo.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Encuentra un lector de confianza (beta reader) que no sea pareja ni familia cercana. La objetividad es más valiosa que el apoyo incondicional en esta etapa.</p>
            </div>
          </div>
        </section>

        {/* 4. Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: del impulso a las primeras páginas</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>Elige el género que resuena contigo ahora</h4>
                <p>No el género que "debería" escribirse ni el que está de moda. El que tienes genuinas ganas de leer. Si no lees el género que quieres escribir, el texto sonará falso. La pasión por el material es el único motor real en un proyecto de meses o años.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>Responde el Kit de Arranque antes de abrir el documento</h4>
                <p>Dedica 30–60 minutos a las preguntas del kit: protagonista, objetivo, obstáculo, arco, escenario, clímax. No necesitas que las respuestas sean perfectas; necesitas que sean concretas. "Una mujer en los años 40 que quiere recuperar a su hijo perdido en la guerra" es mejor punto de partida que "una historia de amor y guerra".</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>Escribe la primera escena "in medias res"</h4>
                <p>No empieces por el nacimiento del protagonista ni por una descripción del mundo. Empieza en el momento en que algo cambia. Tu primera escena debe responder (aunque sea implícitamente): ¿quién es? ¿qué quiere? ¿qué amenaza eso? Tienes las primeras 500 palabras para captar la atención del lector.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>Establece una rutina de escritura sostenible</h4>
                <p>Fija una hora, un lugar y un tiempo mínimo. 25 minutos diarios (una sesión Pomodoro) producen resultados visibles en semanas. Lo más importante no es la duración sino la regularidad: el cerebro entrena la creatividad igual que el cuerpo entrena la resistencia. La inspiración es resultado de escribir, no su prerrequisito.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>Completa el primer borrador sin revisar</h4>
                <p>Esta es la regla más difícil de seguir y la más importante. Escribe hasta el final aunque detestes lo que escribes. Un borrador imperfecto terminado es infinitamente más útil que 20 capítulos brillantemente pulidos sin final. La revisión transforma el borrador; la perfección prematura lo mata.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <h4>Descansa y vuelve con ojos frescos</h4>
                <p>Guarda el manuscrito al menos dos semanas antes de revisarlo. Durante ese tiempo, lee el género que estás escribiendo. Cuando vuelvas al texto, verás problemas que eran invisibles mientras escribías: inconsistencias de personaje, tramas que no resuelven, ritmo lento en ciertas escenas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">7</div>
              <div className={styles.stepContent}>
                <h4>Revisa por capas, no de una sola vez</h4>
                <p>Primera revisión: estructura y trama (¿funciona el arco narrativo?). Segunda: personajes y coherencia (¿actúan de forma creíble?). Tercera: ritmo y diálogos (¿suena natural en voz alta?). Cuarta: prosa y estilo (¿cada frase gana su lugar?). Mezclar todas las revisiones en una sola pasada es la causa más común de segundos borradores peores que los primeros.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Las 6 reglas que distinguen al escritor que termina al que no</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Escribe primero, edita después</h4>
              <p>La revisión y la escritura creativa usan diferentes partes del cerebro. Activarlas simultáneamente produce parálisis. Escribe con la puerta cerrada; edita con la puerta abierta (Stephen King).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Lee en voz alta antes de dar por terminado</h4>
              <p>Si tropiezas al leer, el lector también lo hará. La lectura en voz alta revela ritmos rotos, repeticiones y diálogos artificiales que el ojo pasa por alto. Herramienta gratuita: lee cada escena terminada antes de continuar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Muestra, no expliques (Show, don't tell)</h4>
              <p>En lugar de "Estaba nervioso", escribe "Tamborileaba los dedos en la mesa y miraba el reloj por cuarta vez". El lector infiere la emoción; tú no la declaras. La emoción declarada es información; la emoción mostrada es experiencia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Corta los adverbios en -mente</h4>
              <p>"Dijo nerviosamente" es más débil que "dijo" + una acción que muestre el nerviosismo. Los adverbios suelen ser parches para verbos débiles. Sustitúyelos por verbos más precisos: "murmuró", "espetó", "susurró" en lugar de "dijo + adverbio".</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Termina cada sesión en mitad de una escena</h4>
              <p>No termines cuando acabas un capítulo o una escena. Para en mitad de algo emocionante. El cerebro sigue trabajando inconscientemente y al día siguiente sabes exactamente cómo continuar — sin la terrible pantalla en blanco del principio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Protege el tiempo de escritura como una cita médica</h4>
              <p>No como "tiempo libre" que se puede cancelar. La escritura requiere un estado mental específico que tarda en activarse. Interrumpirlo para responder mensajes o revisar redes sociales no es solo una pérdida de tiempo: destruye la concentración profunda que necesitas.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <h3>Errores que matan el proyecto antes de empezar</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>❌ Esperar a la inspiración para escribir:</strong> La inspiración no precede a la escritura — la escritura genera la inspiración. Sentarse a escribir aunque no "tengas ganas" es la única forma de activar el estado creativo de forma consistente.
            </li>
            <li>
              <strong>❌ Empezar por el capítulo 1 antes de conocer el final:</strong> Sin saber adónde vas, la historia se bifurca, pierde tensión y muere en el capítulo 3. Conoce el destino (aunque cambies el camino) antes de salir.
            </li>
            <li>
              <strong>❌ Revisar el capítulo 1 hasta la perfección antes de seguir:</strong> El capítulo 1 cambiará cuando escribas el capítulo 20. Revisarlo 40 veces antes de tener un borrador completo es una forma segura de no terminar nunca el libro.
            </li>
            <li>
              <strong>❌ Compartir el borrador demasiado pronto:</strong> Las opiniones externas antes de que el texto esté maduro generan inseguridad y confusión. El escritor principiante necesita terminar primero; recibir feedback después.
            </li>
            <li>
              <strong>❌ Compararse con escritores publicados:</strong> Compares tu primer borrador con la décima novela de un autor consolidado. Eso paraliza. Compárate solo con tu versión de hace seis meses.
            </li>
            <li>
              <strong>❌ Cambiar de proyecto cada vez que la historia se complica:</strong> La "segunda novela brillante" que aparece cuando la primera se atora suele ser una fantasía. La complicación que quieres evitar es exactamente el problema que necesitas aprender a resolver.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-escritura-creativa')} />
      <ShareCard appName="orientador-escritura-creativa" />
      <Footer appName="orientador-escritura-creativa" />
    </div>
  );
}
