'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './QuizMitosCiencia.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Categoria = 'cuerpo' | 'animales' | 'fisica' | 'historia' | 'biologia';
type Fase = 'inicio' | 'jugando' | 'revelado' | 'fin';

interface Pregunta {
  id: number;
  afirmacion: string;
  esVerdad: boolean;
  explicacion: string;
  categoria: Categoria;
  emoji: string;
}

const PREGUNTAS: Pregunta[] = [
  // CUERPO HUMANO
  {
    id: 1,
    afirmacion: 'Los seres humanos usamos solo el 10% de nuestro cerebro',
    esVerdad: false,
    explicacion: 'Completamente falso. Las técnicas de neuroimagen muestran que prácticamente todas las regiones cerebrales tienen actividad a lo largo del día. El cerebro consume el 20% de la energía del cuerpo pese a representar solo el 2% del peso: un órgano tan costoso metabólicamente no podría haber evolucionado dejando el 90% inactivo.',
    categoria: 'cuerpo',
    emoji: '🧠',
  },
  {
    id: 2,
    afirmacion: 'La sangre venosa (la que vuelve al corazón) es de color azul',
    esVerdad: false,
    explicacion: 'La sangre siempre es roja, tanto arterial como venosa. La venosa es rojo oscuro (burdeos), no azul. La confusión surge porque el tejido subcutáneo absorbe la luz roja y refleja más la azul, haciendo que las venas parezcan azuladas aunque la sangre dentro sea roja oscura.',
    categoria: 'cuerpo',
    emoji: '💉',
  },
  {
    id: 3,
    afirmacion: 'Las uñas y el pelo siguen creciendo después de la muerte',
    esVerdad: false,
    explicacion: 'Es una ilusión óptica. Tras la muerte, la piel se deshidrata y se retrae, haciendo que las uñas y el pelo parezcan más largos. En realidad ambos requieren metabolismo celular activo para crecer, y ese proceso cesa de inmediato tras la muerte.',
    categoria: 'cuerpo',
    emoji: '💅',
  },
  {
    id: 4,
    afirmacion: 'Leer con poca luz daña la vista de forma permanente',
    esVerdad: false,
    explicacion: 'Leer con poca luz causa fatiga ocular temporal —los músculos ciliares trabajan más— pero no produce daño estructural permanente. La fatiga desaparece tras descansar. Los oftalmólogos han confirmado repetidamente que la luz insuficiente no causa miopía ni ninguna patología ocular crónica.',
    categoria: 'cuerpo',
    emoji: '👁️',
  },
  {
    id: 5,
    afirmacion: 'Los seres humanos tenemos solo 5 sentidos',
    esVerdad: false,
    explicacion: 'La lista de 5 sentidos data de Aristóteles y es una simplificación. Los neurocientíficos actuales identifican al menos 9 sentidos: propiocepción (posición del cuerpo), equilibrio (sistema vestibular), termocepción (temperatura), nocicepción (dolor) e interocepción (estado interno del cuerpo), entre otros.',
    categoria: 'cuerpo',
    emoji: '🤲',
  },
  {
    id: 6,
    afirmacion: 'La lengua humana tiene zonas específicas para cada sabor',
    esVerdad: false,
    explicacion: 'El "mapa de la lengua" proviene de una mala traducción de un estudio alemán del siglo XIX. En realidad, los receptores de los cinco sabores básicos (dulce, salado, ácido, amargo y umami) están distribuidos por toda la lengua, el paladar y la faringe. Cualquier zona puede detectar cualquier sabor.',
    categoria: 'cuerpo',
    emoji: '👅',
  },
  {
    id: 7,
    afirmacion: 'Los huesos humanos son más resistentes que el hormigón en proporción a su peso',
    esVerdad: true,
    explicacion: 'El hueso compacto soporta cargas de compresión de hasta 170 MPa, frente a los 20-40 MPa del hormigón estructural. Además tiene cierta elasticidad gracias a la combinación de colágeno (flexibilidad) y mineral (dureza). Un diseño que los ingenieros de materiales todavía estudian para mejorar compuestos sintéticos.',
    categoria: 'cuerpo',
    emoji: '🦴',
  },
  // ANIMALES
  {
    id: 8,
    afirmacion: 'Los peces tienen una memoria de solo 3 segundos',
    esVerdad: false,
    explicacion: 'Los peces tienen memoria que dura semanas, meses e incluso años según la especie. Experimentos con carpas y peces koi demuestran que recuerdan rutas de alimentación durante meses. Los peces de acuario reconocen a sus cuidadores y aprenden comportamientos condicionados que retienen durante semanas.',
    categoria: 'animales',
    emoji: '🐠',
  },
  {
    id: 9,
    afirmacion: 'Los avestruces entierran la cabeza en la arena cuando tienen miedo',
    esVerdad: false,
    explicacion: 'Los avestruces nunca hacen esto: enterrar la cabeza implicaría no poder respirar. El comportamiento observado es que inclinan la cabeza al suelo para dar la vuelta a sus huevos o buscar vegetación. También se agazapan pegando el cuello al suelo para camuflarse, lo que a distancia puede parecer que "entierran la cabeza".',
    categoria: 'animales',
    emoji: '🦚',
  },
  {
    id: 10,
    afirmacion: 'Los murciélagos son ciegos',
    esVerdad: false,
    explicacion: 'Los murciélagos tienen ojos funcionales y ven bien, especialmente con poca luz. Además usan ecolocalización (emiten ultrasonidos y analizan los ecos) para navegar en oscuridad total. Los murciélagos frugívoros tienen vista excelente. "Ciego como un murciélago" es una de las metáforas más inexactas del idioma.',
    categoria: 'animales',
    emoji: '🦇',
  },
  {
    id: 11,
    afirmacion: 'Los camellos almacenan agua en sus jorobas',
    esVerdad: false,
    explicacion: 'Las jorobas almacenan grasa, no agua. Esa grasa se metaboliza para obtener energía en períodos de escasez. El camello tolera la deshidratación de forma excepcional —puede perder hasta el 25% de su peso en agua sin daño grave— gracias a adaptaciones en riñones, glóbulos rojos y vasos sanguíneos, no a ningún "depósito de agua" en la joroba.',
    categoria: 'animales',
    emoji: '🐪',
  },
  {
    id: 12,
    afirmacion: 'El color rojo provoca la reacción agresiva de los toros',
    esVerdad: false,
    explicacion: 'Los toros son daltónicos para el rojo y el verde, como la mayoría de los mamíferos. Lo que provoca la carga es el movimiento de la muleta, no su color. Si fuera azul o verde y se agitara igual, el toro reaccionaría idénticamente. El rojo se eligió históricamente para disimular las manchas de sangre.',
    categoria: 'animales',
    emoji: '🐂',
  },
  {
    id: 13,
    afirmacion: 'Los pulpos tienen tres corazones',
    esVerdad: true,
    explicacion: 'Los pulpos tienen dos corazones branquiales (uno por branquia, que bombean sangre a las branquias) y un corazón sistémico (que distribuye la sangre oxigenada al cuerpo). Además, su sangre es azul porque usa hemocianina —con cobre en lugar de hierro— para transportar oxígeno. El corazón sistémico se detiene cuando el pulpo nada activamente.',
    categoria: 'animales',
    emoji: '🐙',
  },
  {
    id: 14,
    afirmacion: 'Los delfines duermen con solo la mitad del cerebro activa',
    esVerdad: true,
    explicacion: 'Los delfines practican el sueño unihemisférico: una mitad del cerebro duerme mientras la otra permanece activa para controlar la respiración consciente, el movimiento y la vigilancia del entorno. Los hemisferios se alternan cada pocas horas. Este mecanismo también aparece en otros cetáceos y en aves migratorias.',
    categoria: 'animales',
    emoji: '🐬',
  },
  {
    id: 15,
    afirmacion: 'Las huellas dactilares de los koalas son prácticamente indistinguibles de las humanas',
    esVerdad: true,
    explicacion: 'Las huellas de los koalas presentan patrones de arcos, bucles y espirales casi idénticos a los humanos, tan similares que peritos forenses han necesitado análisis detallados para distinguirlas. Es un caso de evolución convergente: dos especies sin parentesco cercano desarrollaron la misma solución para mejorar el agarre de forma completamente independiente.',
    categoria: 'animales',
    emoji: '🐨',
  },
  // FÍSICA Y COSMOS
  {
    id: 16,
    afirmacion: 'Los rayos nunca caen dos veces en el mismo lugar',
    esVerdad: false,
    explicacion: 'Es exactamente lo contrario: los rayos tienden a caer repetidamente en los mismos puntos altos o conductores. El Empire State Building recibe unos 23 impactos al año. Los pararrayos funcionan precisamente porque atraen los rayos de forma predecible hacia el mismo punto, protegiéndose a sí mismos y al edificio.',
    categoria: 'fisica',
    emoji: '⚡',
  },
  {
    id: 17,
    afirmacion: 'Los átomos son partículas sólidas y compactas',
    esVerdad: false,
    explicacion: 'Un átomo es casi todo espacio vacío. Si el núcleo de un átomo de hidrógeno tuviera el tamaño de una naranja, su único electrón estaría a unos 2 kilómetros de distancia. La materia sólida que percibimos lo es por las fuerzas electromagnéticas entre átomos, no porque los átomos sean bloques compactos.',
    categoria: 'fisica',
    emoji: '⚛️',
  },
  {
    id: 18,
    afirmacion: 'El Sol es una estrella de tamaño mediano comparada con otras estrellas',
    esVerdad: true,
    explicacion: 'Aunque el Sol parece inmenso (su diámetro es 109 veces el de la Tierra), es una estrella de tamaño medio en el contexto del universo. Estrellas como Betelgeuse tienen un diámetro unas 700 veces mayor; si estuviera en el lugar del Sol, englobaría la órbita de Júpiter. La mayoría de las estrellas brillantes a ojo desnudo son gigantes o supergigantes mucho mayores.',
    categoria: 'fisica',
    emoji: '☀️',
  },
  {
    id: 19,
    afirmacion: 'El sonido no puede propagarse en el vacío del espacio exterior',
    esVerdad: true,
    explicacion: 'El sonido es una onda mecánica de presión: necesita un medio material para propagarse. En el vacío del espacio exterior, sin moléculas que transmitan las vibraciones, el sonido sencillamente no existe. Las explosiones en el espacio son completamente silenciosas para un observador en el vacío, por espectaculares que parezcan en las películas.',
    categoria: 'fisica',
    emoji: '🌌',
  },
  // HISTORIA
  {
    id: 20,
    afirmacion: 'Napoleón Bonaparte era un hombre excepcionalmente bajo',
    esVerdad: false,
    explicacion: 'Napoleón medía aproximadamente 1,68-1,70 m, la altura media o ligeramente por encima de la media en la Francia de finales del siglo XVIII (altura media masculina ~1,64 m). El mito surgió de una confusión entre medidas francesas e inglesas de la época, y fue amplificado deliberadamente por la propaganda caricaturesca británica.',
    categoria: 'historia',
    emoji: '🎖️',
  },
  {
    id: 21,
    afirmacion: 'La Gran Muralla China se ve a simple vista desde el espacio',
    esVerdad: false,
    explicacion: 'Yang Liwei, el primer taikonauta chino, confirmó en 2003 que no pudo verla desde la órbita. Con 4-8 metros de anchura, es demasiado estrecha para distinguirse a ojo desnudo desde los 400 km de altitud de la órbita baja. Equivaldría a intentar ver un cabello humano desde 2 km de distancia.',
    categoria: 'historia',
    emoji: '🏯',
  },
  // BIOLOGÍA
  {
    id: 22,
    afirmacion: 'Los seres humanos descendemos de los chimpancés actuales',
    esVerdad: false,
    explicacion: 'Humanos y chimpancés compartimos un ancestro común de hace unos 6-7 millones de años, pero no descendemos de los chimpancés actuales. Los chimpancés han evolucionado durante los mismos millones de años que el linaje humano. Es como decir que eres el padre de tu primo: misma familia, mismo abuelo, pero ninguno desciende del otro.',
    categoria: 'biologia',
    emoji: '🧬',
  },
  {
    id: 23,
    afirmacion: 'El azúcar causa hiperactividad en los niños',
    esVerdad: false,
    explicacion: 'Más de una docena de estudios controlados con doble ciego, incluyendo metaanálisis publicados en JAMA, han demostrado de forma consistente que el azúcar no causa hiperactividad. El efecto es puramente psicológico: los padres que creen que sus hijos consumieron azúcar los perciben como más activos, aunque hayan tomado un placebo.',
    categoria: 'biologia',
    emoji: '🍬',
  },
  {
    id: 24,
    afirmacion: 'Tragarse un chicle tarda 7 años en digerirse',
    esVerdad: false,
    explicacion: 'La base del chicle no se digiere, pero el cuerpo la trata como cualquier fibra indigerible: avanza por el sistema digestivo mediante los movimientos peristálticos y se elimina normalmente en pocos días. Solo cantidades muy grandes han causado obstrucciones en casos pediátricos raros. No se queda décadas adherida al intestino.',
    categoria: 'biologia',
    emoji: '🫧',
  },
  {
    id: 25,
    afirmacion: 'La miel correctamente almacenada puede durar miles de años sin estropearse',
    esVerdad: true,
    explicacion: 'La miel tiene un pH muy bajo, una concentración de azúcar extremadamente alta (que deshidrata las bacterias por ósmosis) y pequeñas cantidades de peróxido de hidrógeno: condiciones que impiden el crecimiento de microorganismos. En tumbas egipcias de más de 3.000 años se ha encontrado miel todavía comestible. La clave es que esté herméticamente sellada.',
    categoria: 'biologia',
    emoji: '🍯',
  },
];

const CATEGORIAS: Record<Categoria, { nombre: string; emoji: string }> = {
  cuerpo:   { nombre: 'Cuerpo Humano', emoji: '🧠' },
  animales: { nombre: 'Animales', emoji: '🦁' },
  fisica:   { nombre: 'Física y Cosmos', emoji: '⚛️' },
  historia: { nombre: 'Historia', emoji: '🏛️' },
  biologia: { nombre: 'Biología', emoji: '🧬' },
};

const NIVELES = [
  { min: 23, emoji: '🔬', nombre: 'Científico/a', descripcion: 'Dominas los hechos científicos con rigor. Muy pocos mitos populares te engañan.' },
  { min: 18, emoji: '📚', nombre: 'Investigador/a', descripcion: 'Buen conocimiento científico. Separas la mayoría de los mitos de la realidad.' },
  { min: 13, emoji: '🧪', nombre: 'Curioso/a', descripcion: 'Conocimiento sólido, con algunos mitos que todavía te sorprenden.' },
  { min: 8,  emoji: '📝', nombre: 'Aprendiz', descripcion: 'Los mitos populares te atrapan con frecuencia. ¡Este quiz es perfecto para ti!' },
  { min: 0,  emoji: '🌱', nombre: 'Principiante', descripcion: 'Los mitos populares son muy convincentes. Lee las explicaciones: aprenderás mucho.' },
];

export default function QuizMitosCiencia() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [indice, setIndice] = useState(0);
  const [aciertos, setAciertos] = useState<boolean[]>([]);
  const [seleccion, setSeleccion] = useState<boolean | null>(null);

  const pregunta = PREGUNTAS[indice];
  const puntuacion = aciertos.filter(Boolean).length;
  const porcentaje = Math.round((puntuacion / PREGUNTAS.length) * 100);
  const nivel = NIVELES.find(n => puntuacion >= n.min) ?? NIVELES[NIVELES.length - 1];

  function iniciar() {
    setFase('jugando');
    setIndice(0);
    setAciertos([]);
    setSeleccion(null);
  }

  function responder(esVerdad: boolean) {
    if (fase === 'revelado') return;
    const correcto = esVerdad === pregunta.esVerdad;
    setSeleccion(esVerdad);
    setAciertos(prev => [...prev, correcto]);
    setFase('revelado');
  }

  function siguiente() {
    if (indice + 1 >= PREGUNTAS.length) {
      setFase('fin');
    } else {
      setIndice(indice + 1);
      setSeleccion(null);
      setFase('jugando');
    }
  }

  const aciertosCategoria = Object.keys(CATEGORIAS).reduce<Record<string, { total: number; correctas: number }>>((acc, cat) => {
    const pregsCategoria = PREGUNTAS.filter(p => p.categoria === cat);
    const correctas = pregsCategoria.filter((p, i) => {
      const idxGlobal = PREGUNTAS.indexOf(p);
      return aciertos[idxGlobal] === true;
    }).length;
    acc[cat] = { total: pregsCategoria.length, correctas };
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon}>🔬</div>
        <h1>Mitos y Realidades de la Ciencia</h1>
        <p>25 afirmaciones para separar la ciencia del mito popular</p>
      </header>

      <LegalNotice />

      <section className={styles.quizSection}>

        {/* PANTALLA DE INICIO */}
        {fase === 'inicio' && (
          <div className={styles.inicioPanel}>
            <div className={styles.inicioStats}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>25</span>
                <span className={styles.statLabel}>afirmaciones</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>5</span>
                <span className={styles.statLabel}>categorías</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>~5</span>
                <span className={styles.statLabel}>minutos</span>
              </div>
            </div>
            <div className={styles.categoriasPreview}>
              {Object.entries(CATEGORIAS).map(([key, cat]) => (
                <span key={key} className={styles.categoriaTag}>
                  {cat.emoji} {cat.nombre}
                </span>
              ))}
            </div>
            <p className={styles.inicioDesc}>
              Para cada afirmación, decide si es <strong>Verdad</strong> o <strong>Mito</strong>.
              Después de responder verás la explicación científica.
            </p>
            <button className={styles.btnIniciar} onClick={iniciar}>
              Comenzar quiz
            </button>
          </div>
        )}

        {/* PANTALLA DE PREGUNTA */}
        {(fase === 'jugando' || fase === 'revelado') && (
          <div className={styles.preguntaWrapper}>
            {/* Progreso */}
            <div className={styles.progressArea}>
              <div className={styles.progressInfo}>
                <span className={styles.progCategoria}>
                  {CATEGORIAS[pregunta.categoria].emoji} {CATEGORIAS[pregunta.categoria].nombre}
                </span>
                <span className={styles.progNum}>{indice + 1} / {PREGUNTAS.length}</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${((indice) / PREGUNTAS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Tarjeta de afirmación */}
            <div className={`${styles.preguntaCard} ${fase === 'revelado' ? (seleccion === pregunta.esVerdad ? styles.correcto : styles.incorrecto) : ''}`}>
              <div className={styles.preguntaEmoji}>{pregunta.emoji}</div>
              <p className={styles.afirmacion}>&ldquo;{pregunta.afirmacion}&rdquo;</p>
            </div>

            {/* Botones de respuesta */}
            {fase === 'jugando' && (
              <div className={styles.botonesRespuesta}>
                <button className={styles.btnVerdad} onClick={() => responder(true)}>
                  <span className={styles.btnIcon}>✓</span>
                  <span>Verdad</span>
                </button>
                <button className={styles.btnMito} onClick={() => responder(false)}>
                  <span className={styles.btnIcon}>✗</span>
                  <span>Mito</span>
                </button>
              </div>
            )}

            {/* Revelación */}
            {fase === 'revelado' && (
              <div className={styles.revelacion}>
                <div className={`${styles.resultadoBadge} ${seleccion === pregunta.esVerdad ? styles.badgeCorrecto : styles.badgeIncorrecto}`}>
                  {seleccion === pregunta.esVerdad ? '✓ ¡Correcto!' : '✗ Incorrecto'}
                  <span className={styles.respuestaCorrecta}>
                    Era un {pregunta.esVerdad ? 'VERDAD' : 'MITO'}
                  </span>
                </div>
                <div className={styles.explicacionBox}>
                  <p className={styles.explicacion}>{pregunta.explicacion}</p>
                </div>
                <button className={styles.btnSiguiente} onClick={siguiente}>
                  {indice + 1 < PREGUNTAS.length ? 'Siguiente →' : 'Ver resultados'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA DE RESULTADOS */}
        {fase === 'fin' && (
          <div className={styles.finPanel}>
            <div className={styles.nivelEmoji}>{nivel.emoji}</div>
            <h2 className={styles.nivelNombre}>{nivel.nombre}</h2>
            <p className={styles.nivelDesc}>{nivel.descripcion}</p>

            <div className={styles.puntuacionBig}>
              <span className={styles.puntNum}>{puntuacion}</span>
              <span className={styles.puntTotal}>/ {PREGUNTAS.length}</span>
              <span className={styles.puntPct}>{porcentaje}%</span>
            </div>

            <div className={styles.categoriaResultados}>
              <h3>Resultados por categoría</h3>
              <div className={styles.catGrid}>
                {Object.entries(CATEGORIAS).map(([key, cat]) => {
                  const datos = aciertosCategoria[key];
                  const pct = datos.total > 0 ? Math.round((datos.correctas / datos.total) * 100) : 0;
                  return (
                    <div key={key} className={styles.catResultItem}>
                      <div className={styles.catResultHeader}>
                        <span>{cat.emoji} {cat.nombre}</span>
                        <span className={styles.catScore}>{datos.correctas}/{datos.total}</span>
                      </div>
                      <div className={styles.catBar}>
                        <div className={styles.catBarFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button className={styles.btnRepetir} onClick={iniciar}>
              Repetir quiz
            </button>
          </div>
        )}
      </section>

      <EducationalSection title="¿Por qué los mitos científicos son tan difíciles de erradicar?">
        <p>
          Los mitos científicos persisten porque suelen contener un grano de verdad distorsionado,
          son fáciles de recordar y se transmiten de generación en generación antes de que la ciencia
          pueda desmentirlos formalmente. Muchos de los 25 mitos de este quiz llevan décadas
          circulando en libros de texto, medios de comunicación y conversaciones cotidianas.
        </p>
        <p>
          La divulgación científica —quizzes, libros, podcasts, vídeos— es la herramienta más
          eficaz para sustituir un mito por un hecho: no basta con decir &quot;eso es falso&quot;,
          hay que ofrecer la explicación correcta que pueda ocupar el lugar del mito en la memoria.
          Por eso cada respuesta de este quiz incluye la explicación científica real.
        </p>

        {/* TABLA COMPARATIVA */}
        <h3>Los mitos más frecuentes por categoría</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Mito típico</th>
                <th>Por qué persiste</th>
                <th>Dato real</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🧠 Cuerpo humano</td>
                <td>Usamos solo el 10% del cerebro</td>
                <td>Malinterpretación de estudios de neurología del siglo XIX</td>
                <td>Usamos prácticamente todo el cerebro; consume el 20% de la energía corporal</td>
              </tr>
              <tr>
                <td>🦁 Animales</td>
                <td>Los peces tienen 3 segundos de memoria</td>
                <td>Justificación popular para mantener peces en espacios pequeños</td>
                <td>Su memoria puede durar semanas, meses o años según la especie</td>
              </tr>
              <tr>
                <td>⚛️ Física</td>
                <td>Los rayos no caen dos veces en el mismo sitio</td>
                <td>Generalización intuitiva pero incorrecta de la física de los rayos</td>
                <td>Los pararrayos los atraen repetidamente; el Empire State recibe ~23 al año</td>
              </tr>
              <tr>
                <td>🏛️ Historia</td>
                <td>Napoleón era excepcionalmente bajo</td>
                <td>Confusión de medidas + propaganda caricaturesca británica</td>
                <td>Medía ~1,69 m: altura media o superior en la Francia de su época</td>
              </tr>
              <tr>
                <td>🧬 Biología</td>
                <td>El azúcar causa hiperactividad en niños</td>
                <td>Efecto nocebo: los padres perciben lo que esperan percibir</td>
                <td>Más de 12 estudios con doble ciego en JAMA lo desmienten consistentemente</td>
              </tr>
              <tr>
                <td>🐙 Sorpresas</td>
                <td>Los pulpos tienen solo un corazón</td>
                <td>Generalización de la anatomía humana a todos los animales</td>
                <td>Tienen tres corazones y sangre azul (hemocianina con cobre, no hierro)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ESCENARIOS */}
        <h3>¿Para quién es este quiz?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <h4>Estudiantes y curiosos</h4>
            <p>Ideal para afianzar conocimiento científico real frente a las creencias populares que circulan en clase, en redes y en conversaciones cotidianas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>👨‍👩‍👧</span>
            <h4>Familias y educación informal</h4>
            <p>Perfecto para hacer en familia o grupo: las respuestas generan debate y las explicaciones abren conversaciones educativas sin que parezca una clase.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>📱</span>
            <h4>Divulgadores y creadores</h4>
            <p>Un banco de mitos verificados con explicaciones rigorosas, útil como punto de partida para contenido de divulgación científica en cualquier formato.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>🧑‍🏫</span>
            <h4>Docentes</h4>
            <p>Una forma de empezar una clase de ciencias naturales, biología o física cuestionando creencias previas del alumnado con base en evidencia.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas frecuentes sobre los mitos científicos</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué creemos tantos mitos sobre el cuerpo humano?</h4>
            <p>El cuerpo humano es opaco: no podemos ver lo que ocurre dentro. Esa invisibilidad crea un espacio fértil para explicaciones intuitivas pero incorrectas. Además, muchos mitos del cuerpo humano se originaron en teorías médicas del siglo XVIII-XIX que quedaron desactualizadas pero siguieron circulando.</p>
            <div className={styles.faqTip}>La sangre &quot;azul&quot; apareció en modelos anatómicos que pintaban venas de azul para distinguirlas visualmente de las arterias rojas en los diagramas impresos, no por ninguna propiedad real de la sangre.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Hay algún mito en este quiz que sea parcialmente verdadero?</h4>
            <p>La mayoría son directamente falsos, pero algunos tienen un núcleo de verdad distorsionado. &quot;Leer con poca luz daña la vista&quot; es falso en cuanto al daño permanente, pero es cierto que causa fatiga ocular temporal real. &quot;El chicle tarda 7 años en digerirse&quot; contiene el hecho real de que la goma no se digiere, distorsionado con una cifra inventada.</p>
            <div className={styles.faqTip}>Los mejores mitos siempre tienen ese 10% de verdad que los hace convincentes: son más difíciles de desmentir precisamente porque no son completamente absurdos.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Los mitos sobre animales son los más sorprendentes?</h4>
            <p>La categoría de animales contiene tanto los mitos más extendidos (peces con 3 segundos de memoria, avestruces enterrando la cabeza) como las verdades más sorprendentes (pulpos con 3 corazones, delfines con medio cerebro durmiendo, huellas de koalas indistinguibles de las humanas). Es la categoría que más sorpresas depara, sean mitos o verdades.</p>
            <div className={styles.faqTip}>El mito de los avestruces está tan extendido que incluso aparece en diccionarios como expresión idiomática, lo que demuestra que los mitos pueden sobrevivir al lenguaje mucho después de ser desmentidos.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Son igual de difíciles las preguntas de verdad que las de mito?</h4>
            <p>Las verdades sorprendentes (pulpos con 3 corazones, Sol de tamaño mediano, miel que dura miles de años) suelen ser las más difíciles porque el instinto es marcarlas como &quot;mito&quot; por lo extraordinarias que parecen. Las verdades científicas a veces superan en sorpresa a los propios mitos.</p>
            <div className={styles.faqTip}>El truco cognitivo del quiz: lo que parece absurdo puede ser verdad, y lo que parece obvio puede ser completamente falso. La ciencia desafía ambas direcciones.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué puntuación es buena en este quiz?</h4>
            <p>Superar el 80% (20/25) es una señal sólida de pensamiento científico. Por encima del 88% (22/25) se accede al nivel &quot;Científico/a&quot;. La media esperada en población general es de 14-16/25: los mitos populares son muy convincentes y muchos llevan décadas en circulación.</p>
            <div className={styles.faqTip}>Equivocarse en alguna pregunta no indica ignorancia: indica que un mito fue bien diseñado. Lo importante es salir del quiz con el dato real corregido.</div>
          </div>
        </div>

        {/* PASOS */}
        <h3>Cómo sacar el máximo partido al quiz</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Responde desde la intuición, no desde la lógica</h4>
              <p>La primera respuesta instintiva suele ser la más interesante: revela qué mitos tienes más interiorizados. Razonar demasiado desvirtúa el diagnóstico personal que hace el quiz.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Lee siempre la explicación, aunque hayas acertado</h4>
              <p>Acertar por intuición sin conocer el motivo es diferente a acertar con comprensión. La explicación convierte el acierto casual en conocimiento real que no se olvida fácilmente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Presta atención a los patrones en tus errores</h4>
              <p>Si fallas en la mayoría de preguntas de &quot;Animales&quot; pero aciertas en &quot;Física&quot;, el desglose de resultados te señala qué áreas merecen más exploración educativa.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Repite el quiz en otro momento</h4>
              <p>Los estudios sobre aprendizaje muestran que el espaciado temporal (repetir con días de diferencia) es mucho más efectivo para consolidar conocimiento que repasar inmediatamente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Comparte y compara con otras personas</h4>
              <p>Los mitos más difíciles son los que prácticamente todo el mundo falla. Compartir el quiz y comparar resultados revela qué creencias colectivas persisten en tu entorno.</p>
            </div>
          </div>
        </div>

        {/* TIPS */}
        <h3>Datos científicos que sorprenden</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔬</span>
            <p>La neuroimagen funcional (fMRI) puede detectar qué zona del cerebro está activa en tiempo real. Ningún estudio ha mostrado jamás que el 90% permanezca inactivo: incluso dormidos usamos amplias regiones cerebrales.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🐨</span>
            <p>Las huellas de koalas son tan similares a las humanas por evolución convergente: dos ramas del árbol de la vida muy distantes llegaron a la misma solución (huellas para mejorar el agarre en superficies) de forma completamente independiente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🍯</span>
            <p>La miel de tumba egipcia de 3.300 años fue analizada y resultó todavía comestible. La concentración de azúcar deshidrata las bacterias por ósmosis: sin agua, no pueden sobrevivir ni reproducirse.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⚛️</span>
            <p>Si un átomo de hidrógeno tuviera el tamaño de un estadio de fútbol, su núcleo sería una canica en el centro y su electrón estaría orbitando en las gradas exteriores. Todo lo demás sería vacío absoluto.</p>
          </div>
        </div>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            Errores conceptuales frecuentes al hablar de ciencia
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir correlación con causalidad:</strong> el azúcar y la hiperactividad se correlacionan en la percepción de los padres, pero los experimentos controlados eliminan ese efecto. La ciencia requiere controles, no observaciones informales.</li>
            <li><strong>Generalizar anatomía humana a todos los animales:</strong> los pulpos con 3 corazones, los delfines con sueño unihemisférico y los koalas con huellas similares demuestran que la biología tiene soluciones muy diversas para los mismos problemas.</li>
            <li><strong>Confiar en la intuición para fenómenos físicos:</strong> la física cuántica (átomos casi vacíos) y la astronomía (el Sol como estrella mediana) producen resultados que violan completamente la intuición cotidiana.</li>
            <li><strong>Tomar por buenas las metáforas visuales:</strong> las venas &quot;azules&quot; en diagramas anatómicos, las arterias &quot;rojas&quot; y las &quot;zonas de sabor&quot; en mapas de la lengua son convenciones visuales, no descripciones anatómicas reales.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-mitos-ciencia')} />
      <ShareCard appName="quiz-mitos-ciencia" />
      <Footer appName="quiz-mitos-ciencia" />
    </div>
  );
}
