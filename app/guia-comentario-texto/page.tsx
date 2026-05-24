'use client';
// @disclaimer: exempt

import { useState } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaComentarioTexto.module.css';

type TabId = 'metodologia' | 'poesia' | 'prosa' | 'vocabulario' | 'plantillas';

const TABS: { id: TabId; icono: string; titulo: string }[] = [
  { id: 'metodologia', icono: '🗺️', titulo: 'Metodología' },
  { id: 'poesia',      icono: '🌹', titulo: 'Poesía' },
  { id: 'prosa',       icono: '📖', titulo: 'Prosa narrativa' },
  { id: 'vocabulario', icono: '📚', titulo: 'Vocabulario técnico' },
  { id: 'plantillas',  icono: '📋', titulo: 'Plantillas' },
];

// ─────────────────────────────────────────────
// Datos: vocabulario técnico
// ─────────────────────────────────────────────
interface VocTermino { termino: string; def: string; }
interface VocCategoria { titulo: string; icono: string; terminos: VocTermino[]; }

const VOCABULARIO: VocCategoria[] = [
  {
    titulo: 'Métrica y versificación', icono: '📏',
    terminos: [
      { termino: 'Sinalefa', def: 'Unión de la vocal final de una palabra con la vocal inicial de la siguiente en el recuento silábico.' },
      { termino: 'Arte menor / mayor', def: 'Versos de hasta 8 sílabas (menor) o de 9 o más (mayor).' },
      { termino: 'Rima consonante', def: 'Coinciden vocal y consonantes desde la última vocal tónica.' },
      { termino: 'Rima asonante', def: 'Coinciden solo las vocales desde la última vocal tónica.' },
      { termino: 'Hemistiquio', def: 'Cada mitad de un verso con cesura, especialmente en el alejandrino (7+7).' },
      { termino: 'Verso blanco', def: 'Verso con metro regular pero sin rima.' },
      { termino: 'Verso libre', def: 'Verso sin metro regular ni rima fijos.' },
    ],
  },
  {
    titulo: 'Estrofas y formas', icono: '🏛️',
    terminos: [
      { termino: 'Redondilla', def: 'Cuatro octosílabos con rima abrazada abba.' },
      { termino: 'Cuarteto / Serventesio', def: 'Cuatro endecasílabos: ABBA (cuarteto) o ABAB (serventesio).' },
      { termino: 'Terceto encadenado', def: 'Tres endecasílabos con rima ABA BCB CDC: la terza rima de Dante.' },
      { termino: 'Décima / Espinela', def: 'Diez octosílabos con esquema abbaaccddc y pausa tras el cuarto verso.' },
      { termino: 'Soneto', def: 'Catorce endecasílabos: dos cuartetos (ABBA ABBA) y dos tercetos.' },
      { termino: 'Romance', def: 'Serie indefinida de octosílabos con rima asonante en los pares.' },
      { termino: 'Silva', def: 'Combinación libre de endecasílabos y heptasílabos sin esquema fijo.' },
    ],
  },
  {
    titulo: 'Figuras retóricas', icono: '🎭',
    terminos: [
      { termino: 'Metáfora', def: 'Identificación de dos realidades por semejanza sin nexo comparativo.' },
      { termino: 'Símil / Comparación', def: 'Comparación explícita con nexo: como, cual, semejante a…' },
      { termino: 'Personificación', def: 'Atribución de cualidades humanas a seres inanimados o abstractos.' },
      { termino: 'Anáfora', def: 'Repetición de una o varias palabras al inicio de versos o frases consecutivas.' },
      { termino: 'Antítesis', def: 'Contraposición de dos ideas o palabras de sentido contrario.' },
      { termino: 'Hipérbole', def: 'Exageración desmedida con intención expresiva o estética.' },
      { termino: 'Hipérbaton', def: 'Alteración del orden sintáctico habitual de la oración.' },
      { termino: 'Aliteración', def: 'Repetición de sonidos iguales o similares en versos contiguos.' },
      { termino: 'Paradoja', def: 'Afirmación aparentemente contradictoria que encierra una verdad.' },
      { termino: 'Sinestesia', def: 'Mezcla de sensaciones de sentidos distintos: «el olor del azul».' },
    ],
  },
  {
    titulo: 'Narratología', icono: '🧭',
    terminos: [
      { termino: 'Narrador homodiegético', def: 'Narrador que participa en la historia que cuenta (primera persona).' },
      { termino: 'Narrador heterodiegético', def: 'Narrador externo a la historia, no participa en ella.' },
      { termino: 'Narrador omnisciente', def: 'Narrador que conoce los pensamientos y sentimientos de todos los personajes.' },
      { termino: 'Focalización interna', def: 'El relato se filtra por la perspectiva de un personaje.' },
      { termino: 'Focalización cero', def: 'El narrador sabe más que cualquier personaje (omnisciencia).' },
      { termino: 'Analepsis / Flashback', def: 'Salto retrospectivo al pasado dentro del relato.' },
      { termino: 'Prolepsis / Flash-forward', def: 'Anticipación de hechos futuros en el relato.' },
      { termino: 'In medias res', def: 'Inicio de la narración en un punto intermedio de la acción.' },
    ],
  },
  {
    titulo: 'Movimientos literarios', icono: '📜',
    terminos: [
      { termino: 'Renacimiento (s. XVI)', def: 'Recuperación de los ideales grecolatinos. Lírica petrarquista, endecasílabo, soneto. Garcilaso, Fray Luis.' },
      { termino: 'Barroco (s. XVII)', def: 'Contraste, dificultad conceptual y formal. Culteranismo (Góngora) vs. conceptismo (Quevedo).' },
      { termino: 'Ilustración / Neoclasicismo (s. XVIII)', def: 'Razón, orden y utilidad. Teatro didáctico, fábulas morales. Jovellanos, Iriarte.' },
      { termino: 'Romanticismo (s. XIX)', def: 'Sentimiento, individualismo, rebeldía. Espronceda, Bécquer, Zorrilla.' },
      { termino: 'Realismo / Naturalismo (s. XIX)', def: 'Descripción objetiva de la realidad social. Galdós, Clarín, Pardo Bazán.' },
      { termino: 'Modernismo (fin s. XIX–s. XX)', def: 'Esteticismo, musicalidad, alejandrino. Rubén Darío, Machado (etapa inicial).' },
      { termino: 'Generación del 98', def: 'Reflexión sobre España tras el 98. Unamuno, Baroja, Azorín, Machado.' },
      { termino: 'Generación del 27', def: 'Fusión vanguardia y tradición. Lorca, Alberti, Guillén, Salinas, Cernuda.' },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: plantillas de frases
// ─────────────────────────────────────────────
interface Plantilla { seccion: string; icono: string; frases: string[]; }

const PLANTILLAS: Plantilla[] = [
  {
    seccion: 'Localización', icono: '📍',
    frases: [
      'El texto que vamos a comentar es un fragmento de [obra], escrita por [autor] en [año/período].',
      'Pertenece al movimiento literario del [movimiento], caracterizado por [rasgo principal].',
      'El autor es una figura representativa de [generación/escuela] debido a [motivo].',
      'El fragmento corresponde a [parte de la obra] y se inscribe en [contexto argumental/temático].',
    ],
  },
  {
    seccion: 'Tema', icono: '🎯',
    frases: [
      'El tema central del texto es [tema sintetizado en sustantivo + complemento].',
      'El poema / fragmento gira en torno a [tema], que el autor aborda desde [perspectiva].',
      'Junto al tema principal, se aprecian temas secundarios como [tema 2] y [tema 3].',
      'El autor presenta [tema] de forma [directa / velada / irónica / lírica].',
    ],
  },
  {
    seccion: 'Estructura externa', icono: '🏗️',
    frases: [
      'Externamente, el poema consta de [número] estrofas de [tipo], con un total de [número] versos.',
      'El poema está escrito en [tipo de verso], de arte [menor/mayor], con rima [consonante/asonante] de esquema [esquema].',
      'El texto en prosa se divide en [número] párrafos que conforman [número] bloques temáticos.',
      'La estructura externa responde a la forma del [soneto / romance / silva…], lo que determina [efecto rítmico].',
    ],
  },
  {
    seccion: 'Estructura interna', icono: '🧩',
    frases: [
      'Internamente, el texto puede dividirse en [número] partes: [descripción de cada parte].',
      'La primera parte ([versos/líneas]) presenta [idea o situación inicial].',
      'La segunda parte desarrolla [conflicto o avance temático], mientras que la tercera [resolución o conclusión].',
      'El texto sigue una estructura [lineal / circular / en contrapunto / de tesis-antítesis-síntesis].',
    ],
  },
  {
    seccion: 'Recursos estilísticos', icono: '🎨',
    frases: [
      'El autor utiliza [figura] en [cita textual], lo que [efecto que produce].',
      'Destaca el uso de la [figura], como se aprecia en [cita], que intensifica la idea de [concepto].',
      'La [figura] de [cita] crea una sensación de [efecto] y refuerza el tono [adjetivo] del texto.',
      'En el plano fónico, la aliteración de [sonido] en [cita] imita [efecto sonoro o ambiental].',
      'El hipérbaton de [cita] invierte el orden lógico para enfatizar [elemento desplazado].',
    ],
  },
  {
    seccion: 'Conclusión', icono: '✅',
    frases: [
      'En conclusión, el texto es una [valoración: reflexión, elegía, proclama…] sobre [tema central].',
      'A través de [recursos principales], el autor logra [efecto global sobre el lector].',
      'Este poema / fragmento ejemplifica bien los rasgos del [movimiento]: [característica 1] y [característica 2].',
      'En mi opinión, el aspecto más destacado del texto es [elemento], porque [justificación].',
      'El texto mantiene su vigencia porque [motivo de universalidad o actualidad].',
    ],
  },
];

export default function GuiaComentarioTextoPage() {
  const [tab, setTab] = useState<TabId>('metodologia');
  const [copiado, setCopiado] = useState<string | null>(null);

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(id);
      setTimeout(() => setCopiado(null), 1800);
    });
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Comentario de Texto Literario</h1>
        <p className={styles.heroSubtitle}>
          Metodología completa, ejemplos trabajados y plantillas listas
          para el análisis de poesía y prosa · Bachillerato y Selectividad
        </p>
      </header>

      <LegalNotice />

      <nav className={styles.tabsNav} role="tablist" aria-label="Secciones de la guía">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
          >
            <span aria-hidden="true">{t.icono}</span>
            <span className={styles.tabNombre}>{t.titulo}</span>
          </button>
        ))}
      </nav>

      <div className={styles.tabContent} role="tabpanel">

        {/* ── TAB 1: METODOLOGÍA ── */}
        {tab === 'metodologia' && (
          <div className={styles.seccion}>
            <p className={styles.seccionIntro}>
              El comentario de texto literario sigue un protocolo de 7 pasos aplicable tanto a poesía como a prosa. Dominar esta estructura te permite organizar el análisis de forma sistemática y no dejar ningún aspecto sin cubrir en un examen.
            </p>

            <div className={styles.pasosList}>
              <div className={styles.pasoItem}>
                <div className={styles.pasoNum}>1</div>
                <div className={styles.pasoBody}>
                  <h3 className={styles.pasoNombre}>Lectura atenta y primera impresión</h3>
                  <p className={styles.pasoDesc}>
                    Lee el texto dos veces antes de escribir nada. La primera lectura es global: identifica el género, el tono general y el tema aproximado. La segunda es analítica: marca las palabras clave, los recursos que llaman la atención y las posibles divisiones internas.
                  </p>
                  <div className={styles.pasoEjemplo}>
                    <strong>En el examen:</strong> No empieces a escribir tras la primera lectura. Dos minutos de segunda lectura atenta evitan errores de interpretación que luego son difíciles de corregir.
                  </div>
                </div>
              </div>

              <div className={styles.pasoItem}>
                <div className={styles.pasoNum}>2</div>
                <div className={styles.pasoBody}>
                  <h3 className={styles.pasoNombre}>Localización</h3>
                  <p className={styles.pasoDesc}>
                    Sitúa el texto en su contexto: autor, obra, fecha o período, y movimiento literario. Si no recuerdas la fecha exacta, indica el siglo y el movimiento. No inventes datos: es mejor decir «posiblemente del Romanticismo por…» que afirmar algo incorrecto.
                  </p>
                  <div className={styles.pasoEjemplo}>
                    <strong>Incluye:</strong> autor + obra + movimiento + rasgos del movimiento que se aprecian en el texto.
                  </div>
                </div>
              </div>

              <div className={styles.pasoItem}>
                <div className={styles.pasoNum}>3</div>
                <div className={styles.pasoBody}>
                  <h3 className={styles.pasoNombre}>Tema</h3>
                  <p className={styles.pasoDesc}>
                    Sintetiza el tema central en una frase nominal: no un resumen del argumento, sino la idea abstracta que el texto desarrolla. Distingue el tema principal de los secundarios. Usa sustantivos abstractos: el amor, la muerte, el paso del tiempo, la identidad, la libertad…
                  </p>
                  <div className={styles.pasoEjemplo}>
                    <strong>Fórmula:</strong> «[sustantivo abstracto] + [complemento que matiza]». Ej.: «La fugacidad de la belleza frente a la eternidad del arte».
                  </div>
                </div>
              </div>

              <div className={styles.pasoItem}>
                <div className={styles.pasoNum}>4</div>
                <div className={styles.pasoBody}>
                  <h3 className={styles.pasoNombre}>Estructura</h3>
                  <p className={styles.pasoDesc}>
                    Distingue estructura externa (organización visual: estrofas, párrafos, versos) e interna (organización del contenido: partes lógicas o temáticas). En poesía, la estructura interna no coincide necesariamente con las estrofas.
                  </p>
                  <div className={styles.pasoEjemplo}>
                    <strong>Tipos habituales:</strong> estructura lineal, circular (el final retoma el inicio), en contrapunto (alternancia de ideas opuestas), encuadre (marco narrativo + historia interior).
                  </div>
                </div>
              </div>

              <div className={styles.pasoItem}>
                <div className={styles.pasoNum}>5</div>
                <div className={styles.pasoBody}>
                  <h3 className={styles.pasoNombre}>Análisis métrico (poesía) / Análisis narrativo (prosa)</h3>
                  <p className={styles.pasoDesc}>
                    En poesía: tipo de verso (con número de sílabas), tipo de estrofa, esquema de rima (consonante o asonante). En prosa: tipo de narrador, focalización, tratamiento del tiempo (orden, duración, frecuencia) y del espacio.
                  </p>
                  <div className={styles.pasoEjemplo}>
                    <strong>Error frecuente:</strong> limitarse a decir «está escrito en endecasílabos» sin señalar el tipo de estrofa ni el esquema de rima. Un análisis completo incluye los tres elementos.
                  </div>
                </div>
              </div>

              <div className={styles.pasoItem}>
                <div className={styles.pasoNum}>6</div>
                <div className={styles.pasoBody}>
                  <h3 className={styles.pasoNombre}>Recursos estilísticos</h3>
                  <p className={styles.pasoDesc}>
                    Identifica las figuras retóricas más relevantes y, para cada una, explica: el mecanismo (qué hace), la cita textual exacta y el efecto que produce en el lector o en el significado del texto. No te limites a nombrar la figura.
                  </p>
                  <div className={styles.pasoEjemplo}>
                    <strong>Estructura para cada figura:</strong> Nombre + cita entre comillas + mecanismo + efecto. Ej.: «La anáfora de "mientras" en los versos 5, 7 y 9 crea un ritmo acumulativo que intensifica la idea de continuidad y permanencia de la poesía».
                  </div>
                </div>
              </div>

              <div className={styles.pasoItem}>
                <div className={styles.pasoNum}>7</div>
                <div className={styles.pasoBody}>
                  <h3 className={styles.pasoNombre}>Conclusión y valoración personal</h3>
                  <p className={styles.pasoDesc}>
                    Cierra el comentario sintetizando los aspectos más destacados y añadiendo una valoración personal razonada. En selectividad, la valoración personal suma en la calificación si está argumentada. Evita juicios vacíos («es un poema muy bonito»).
                  </p>
                  <div className={styles.pasoEjemplo}>
                    <strong>Incluye:</strong> síntesis del tema + recursos principales + valoración personal con argumento + posible vigencia actual del texto.
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.destacadoBox}>
              <span className={styles.destacadoIcono} aria-hidden="true">💡</span>
              <div>
                <strong>Orden flexible según la prueba</strong>
                <p>Algunas pruebas de acceso universitario piden el comentario libre; otras tienen preguntas específicas. Adapta este esquema a las instrucciones concretas del examen, pero nunca omitas tema, estructura y recursos estilísticos: son los tres núcleos irrenunciables de cualquier análisis literario.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: POESÍA ── */}
        {tab === 'poesia' && (
          <div className={styles.seccion}>
            <p className={styles.seccionIntro}>
              El comentario de un poema añade al esquema general el análisis métrico completo. A continuación se desarrolla cada sección y se aplica a un ejemplo real: la Rima IV de Gustavo Adolfo Bécquer.
            </p>

            {/* Poema de ejemplo */}
            <div className={styles.poemaBox}>
              <div className={styles.poemaVersos}>
                <p>No digáis que, agotado su tesoro,</p>
                <p>de asuntos falta, enmudeció la lira:</p>
                <p>podrá no haber poetas; pero siempre</p>
                <p>habrá poesía.</p>
                <p>&nbsp;</p>
                <p>Mientras las ondas de la luz al beso</p>
                <p>palpiten encendidas,</p>
                <p>mientras el sol las desgarradas nubes</p>
                <p>de fuego y oro vista,</p>
                <p>&nbsp;</p>
                <p>mientras el aire en su regazo lleve</p>
                <p>perfumes y armonías,</p>
                <p>mientras haya en el mundo primavera,</p>
                <p>¡habrá poesía!</p>
              </div>
              <span className={styles.poemaAtrib}>Gustavo Adolfo Bécquer · <cite>Rima IV</cite></span>
            </div>

            {/* Análisis paso a paso */}
            <div className={styles.analisisList}>
              <div className={styles.analisisBloque}>
                <h3 className={styles.analisisTitulo}><span aria-hidden="true">📍</span> 1. Localización</h3>
                <div className={styles.analisisContenido}>
                  <p>Gustavo Adolfo Bécquer (1836-1870) es la figura central del Romanticismo tardío español. La Rima IV pertenece a las <em>Rimas</em>, publicadas póstumamente en 1871. Este poema forma parte del primer grupo temático de las Rimas, dedicado a la reflexión sobre la propia poesía.</p>
                  <p>Bécquer escribe en la segunda mitad del siglo XIX, en una época en que el Romanticismo europeo ya ha pasado su apogeo pero en España mantiene su vigencia en la lírica intimista y en la exploración del mundo interior.</p>
                </div>
              </div>

              <div className={styles.analisisBloque}>
                <h3 className={styles.analisisTitulo}><span aria-hidden="true">🎯</span> 2. Tema</h3>
                <div className={styles.analisisContenido}>
                  <p><strong>Tema central:</strong> la eternidad de la poesía como esencia del mundo, independiente de la existencia de poetas.</p>
                  <p><strong>Temas secundarios:</strong> la naturaleza como fuente de belleza permanente; la distinción entre el poeta (contingente) y la poesía (eterna).</p>
                  <div className={styles.analisisNota}>El tema se formula en dos afirmaciones antitéticas: «podrá no haber poetas» (lo contingente) / «pero siempre habrá poesía» (lo eterno). Esta tensión estructura el poema.</div>
                </div>
              </div>

              <div className={styles.analisisBloque}>
                <h3 className={styles.analisisTitulo}><span aria-hidden="true">🏗️</span> 3. Estructura</h3>
                <div className={styles.analisisContenido}>
                  <p><strong>Estructura externa:</strong> tres estrofas de 4 versos cada una (4+4+4), con alternancia de versos largos y cortos.</p>
                  <p><strong>Estructura interna:</strong> dos partes lógicas:</p>
                  <ul className={styles.analisisLista}>
                    <li><strong>Primera estrofa (tesis):</strong> afirmación directa del tema — la poesía es eterna aunque no haya poetas que la creen.</li>
                    <li><strong>Segunda y tercera estrofa (argumentación):</strong> serie de imágenes naturales que demuestran la permanencia de la poesía en el mundo.</li>
                  </ul>
                  <p>La estructura sigue el esquema <strong>tesis + desarrollo acumulativo</strong>, reforzado por la anáfora.</p>
                </div>
              </div>

              <div className={styles.analisisBloque}>
                <h3 className={styles.analisisTitulo}><span aria-hidden="true">📏</span> 4. Análisis métrico</h3>
                <div className={styles.analisisContenido}>
                  <p><strong>Tipo de verso:</strong> combinación de endecasílabos (11 sílabas) y heptasílabos (7 sílabas). Esta mezcla libre se asemeja a la <strong>silva</strong>.</p>
                  <p><strong>Rima:</strong> asonante en i-a en los versos pares. Los versos impares quedan libres.</p>
                  <div className={styles.metricaEjemplo}>
                    <div className={styles.metricaFila}>
                      <code className={styles.metricaVerso}>«podrá no haber poetas; pero siempre»</code>
                      <span className={styles.metricaSilabas}>11 sílabas · sin rima</span>
                    </div>
                    <div className={styles.metricaFila}>
                      <code className={styles.metricaVerso}>«habrá poesía»</code>
                      <span className={styles.metricaSilabas}>6+1=7 sílabas · rima en -ía (asonante i-a)</span>
                    </div>
                  </div>
                  <p>El contraste entre los versos largos (endecasílabos) y los cortos (heptasílabos) al final de cada estrofa produce un efecto de <strong>conclusión rotunda</strong>: la sentencia breve cierra cada argumento.</p>
                </div>
              </div>

              <div className={styles.analisisBloque}>
                <h3 className={styles.analisisTitulo}><span aria-hidden="true">🎨</span> 5. Recursos estilísticos</h3>
                <div className={styles.analisisContenido}>
                  <div className={styles.recursoItem}>
                    <strong>Anáfora</strong>
                    <p>«mientras» (vv. 5, 7, 9, 11). La repetición al inicio de los versos crea un ritmo acumulativo e hipnótico. Cada «mientras» añade un nuevo argumento a la permanencia de la poesía, produciendo el efecto de una letanía o un canto.</p>
                  </div>
                  <div className={styles.recursoItem}>
                    <strong>Antítesis</strong>
                    <p>«podrá no haber poetas» / «pero siempre habrá poesía». La contraposición entre la existencia contingente del poeta y la eternidad de la poesía es el eje semántico del poema.</p>
                  </div>
                  <div className={styles.recursoItem}>
                    <strong>Metáfora</strong>
                    <p>«las ondas de la luz» (luz ondulada como el agua), «de fuego y oro vista» (el sol viste las nubes como una tela luminosa). Las metáforas visuales convierten el mundo natural en una galería de imágenes poéticas.</p>
                  </div>
                  <div className={styles.recursoItem}>
                    <strong>Personificación</strong>
                    <p>«el sol las desgarradas nubes de fuego y oro vista» (el sol viste, acción humana). La naturaleza actúa como agente creador, reforzando la idea de que la belleza poética es inherente al mundo.</p>
                  </div>
                </div>
              </div>

              <div className={styles.analisisBloque}>
                <h3 className={styles.analisisTitulo}><span aria-hidden="true">✅</span> 6. Conclusión</h3>
                <div className={styles.analisisContenido}>
                  <p>La Rima IV es una declaración de principios poéticos: Bécquer defiende que la poesía no es una creación humana sino una propiedad esencial de la realidad. Los poetas solo la transcriben; la belleza del mundo la genera. Esta idea —romántica en su esencia pero de resonancias platónicas— conecta con la tradición de la poesía como descubrimiento más que como invención.</p>
                  <p>El poema mantiene su vigencia porque toca una pregunta universal: ¿qué es la poesía y dónde reside? La respuesta de Bécquer —en la naturaleza, en el movimiento, en la luz— es una de las más líricas y sostenidas de la literatura española.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PROSA ── */}
        {tab === 'prosa' && (
          <div className={styles.seccion}>
            <p className={styles.seccionIntro}>
              El comentario de un texto en prosa narrativa comparte la estructura general de 7 pasos, pero el análisis formal (paso 5) se centra en los elementos narrativos en lugar de la métrica.
            </p>

            <div className={styles.prosaSecciones}>

              <div className={styles.prosaBloque}>
                <h3 className={styles.prosaTitulo}>El narrador: quién y cómo cuenta</h3>
                <div className={styles.prosaGrid}>
                  <div className={styles.prosaCard}>
                    <strong>Narrador heterodiegético (3.ª persona)</strong>
                    <p>No participa en la historia. Puede ser omnisciente (conoce todos los pensamientos), observador (solo describe lo exterior) o con focalización interna (filtra el relato por un personaje).</p>
                  </div>
                  <div className={styles.prosaCard}>
                    <strong>Narrador homodiegético (1.ª persona)</strong>
                    <p>Participa en la historia. Si es el protagonista se llama autodiegético; si es testigo, solo homodiegético. Crea mayor intimidad y subjetividad, pero limita la información.</p>
                  </div>
                  <div className={styles.prosaCard}>
                    <strong>Narrador en 2.ª persona</strong>
                    <p>Poco frecuente; crea distanciamiento o complicidad según el uso. Experimental: el narrador se dirige al lector o al propio protagonista como «tú».</p>
                  </div>
                  <div className={styles.prosaCard}>
                    <strong>Distancia narrativa</strong>
                    <p>¿El narrador comenta, juzga, ironiza? ¿O se limita a mostrar sin opinar? La distancia afecta al tono del relato. Un narrador irónico transforma el mismo hecho en crítica o humor.</p>
                  </div>
                </div>
              </div>

              <div className={styles.prosaBloque}>
                <h3 className={styles.prosaTitulo}>El tiempo narrativo</h3>
                <div className={styles.prosaTablaWrapper}>
                  <table className={styles.prosaTabla}>
                    <thead>
                      <tr><th>Aspecto</th><th>Concepto</th><th>Efecto</th></tr>
                    </thead>
                    <tbody>
                      <tr><td><strong>Orden</strong></td><td>Analepsis (flashback), prolepsis (anticipación), in medias res</td><td>Suspense, nostalgia, ironía dramática</td></tr>
                      <tr><td><strong>Duración</strong></td><td>Escena (tiempo igual), resumen (aceleración), elipsis (omisión), pausa (descripción)</td><td>Ritmo narrativo lento o rápido</td></tr>
                      <tr><td><strong>Frecuencia</strong></td><td>Singulativo (1 vez), iterativo (repetición resumida), múltiple (misma historia n veces)</td><td>Énfasis, rutina, perspectiva múltiple</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.prosaBloque}>
                <h3 className={styles.prosaTitulo}>El espacio y los personajes</h3>
                <div className={styles.prosaGrid}>
                  <div className={styles.prosaCard}>
                    <strong>Espacio físico</strong>
                    <p>¿Dónde transcurre la acción? El espacio puede ser simbólico (el mar = libertad/muerte; la casa = encierro/seguridad), realista (nombre de ciudad real) o indeterminado (espacio mítico o universal).</p>
                  </div>
                  <div className={styles.prosaCard}>
                    <strong>Espacio social</strong>
                    <p>El entorno de clase, profesión y cultura de los personajes. En el Realismo, el espacio social es determinante: los personajes son producto de su medio (determinismo naturalista).</p>
                  </div>
                  <div className={styles.prosaCard}>
                    <strong>Personaje redondo</strong>
                    <p>Personaje complejo, con contradicciones y evolución a lo largo del relato. Se opone al personaje plano, que actúa como tipo o función (el avaro, el héroe, la víctima).</p>
                  </div>
                  <div className={styles.prosaCard}>
                    <strong>Técnicas de caracterización</strong>
                    <p>Directa (el narrador describe al personaje), indirecta (el personaje se revela por sus acciones, diálogos y pensamientos). La segunda es más sofisticada literariamente.</p>
                  </div>
                </div>
              </div>

              <div className={styles.prosaBloque}>
                <h3 className={styles.prosaTitulo}>Recursos estilísticos en prosa</h3>
                <div className={styles.recursosProsaLista}>
                  <div className={styles.recursoProsa}>
                    <strong>Estilo directo / indirecto / libre</strong>
                    <p>El estilo directo reproduce las palabras del personaje con comillas o raya. El indirecto las integra en el discurso del narrador. El estilo indirecto libre funde narrador y personaje sin marca formal, creando ambigüedad deliberada.</p>
                  </div>
                  <div className={styles.recursoProsa}>
                    <strong>Monólogo interior / fluir de la consciencia</strong>
                    <p>Representación del pensamiento sin filtro narrativo. Técnica propia del siglo XX (Joyce, Woolf, Faulkner). En español: Martín Santos en <em>Tiempo de silencio</em>.</p>
                  </div>
                  <div className={styles.recursoProsa}>
                    <strong>Descripción y ritmo</strong>
                    <p>La acumulación de detalles descriptivos ralentiza el ritmo y crea atmósfera. La enumeración sin conectores (asíndeton) acelera la acción; la acumulación con conectores (polisíndeton) la carga de intensidad emocional.</p>
                  </div>
                  <div className={styles.recursoProsa}>
                    <strong>Ironía narrativa</strong>
                    <p>El narrador dice una cosa pero da a entender otra. Habitual en el Realismo crítico (Clarín, Galdós). La ironía puede ser verbal (lo que dice el narrador) o situacional (lo que le ocurre al personaje contrasta con sus expectativas).</p>
                  </div>
                </div>
              </div>

              <div className={styles.destacadoBox}>
                <span className={styles.destacadoIcono} aria-hidden="true">📌</span>
                <div>
                  <strong>Diferencia clave: comentario de poesía vs. prosa</strong>
                  <p>En poesía, el análisis formal se centra en la métrica (verso, estrofa, rima) y los recursos fónicos. En prosa, el análisis formal examina la instancia narrativa (quién cuenta, cómo, desde dónde) y la arquitectura temporal y espacial del relato. En ambos casos, los recursos estilísticos se analizan igual: nombre + cita + mecanismo + efecto.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: VOCABULARIO ── */}
        {tab === 'vocabulario' && (
          <div className={styles.seccion}>
            <p className={styles.seccionIntro}>
              Glosario de términos técnicos ordenados por categoría. Conocer el vocabulario preciso marca la diferencia entre un comentario mediocre y uno riguroso.
            </p>
            <div className={styles.vocabularioLista}>
              {VOCABULARIO.map((cat) => (
                <div key={cat.titulo} className={styles.vocCategoria}>
                  <h3 className={styles.vocCatTitulo}>
                    <span aria-hidden="true">{cat.icono}</span> {cat.titulo}
                  </h3>
                  <div className={styles.vocGrid}>
                    {cat.terminos.map((t) => (
                      <div key={t.termino} className={styles.vocItem}>
                        <span className={styles.vocTermino}>{t.termino}</span>
                        <span className={styles.vocDef}>{t.def}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: PLANTILLAS ── */}
        {tab === 'plantillas' && (
          <div className={styles.seccion}>
            <p className={styles.seccionIntro}>
              Frases modelo para cada sección del comentario. Cópialas, adapta los corchetes a tu texto y úsalas como punto de partida. Las partes entre <code>[corchetes]</code> deben sustituirse por el contenido concreto del texto que analizas.
            </p>
            <div className={styles.plantillasLista}>
              {PLANTILLAS.map((p) => (
                <div key={p.seccion} className={styles.plantillaBloque}>
                  <h3 className={styles.plantillaTitulo}>
                    <span aria-hidden="true">{p.icono}</span> {p.seccion}
                  </h3>
                  <div className={styles.plantillaFrases}>
                    {p.frases.map((frase, i) => (
                      <div key={i} className={styles.plantillaFrase}>
                        <p className={styles.plantillaTexto}>{frase}</p>
                        <button
                          className={`${styles.copyBtn} ${copiado === `${p.seccion}-${i}` ? styles.copyBtnOk : ''}`}
                          onClick={() => copiar(frase, `${p.seccion}-${i}`)}
                          aria-label={`Copiar frase de ${p.seccion}`}
                        >
                          {copiado === `${p.seccion}-${i}` ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EducationalSection
        title="El comentario de texto en contexto académico"
        subtitle="Por qué es la prueba más importante de Lengua y cómo prepararla sistemáticamente"
      >
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Comentario de poesía</th>
                <th>Comentario de prosa</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Análisis formal</td><td>Métrica: verso, estrofa, rima, licencias</td><td>Narrador, focalización, tiempo, espacio</td></tr>
              <tr><td>Recursos centrales</td><td>Fónicos (aliteración), sintácticos (anáfora, hipérbaton), semánticos (metáfora)</td><td>Estilo directo/indirecto/libre, monólogo interior, descripción</td></tr>
              <tr><td>Extensión habitual</td><td>Texto breve (1-30 versos); análisis denso</td><td>Fragmento más largo; análisis más selectivo</td></tr>
              <tr><td>Trampa frecuente</td><td>Contar sílabas mal o no identificar la estrofa</td><td>No identificar el tipo de narrador con precisión</td></tr>
              <tr><td>Lo que más puntúa</td><td>Análisis métrico correcto + recursos con efecto</td><td>Tipo de narrador + recursos estilísticos con efecto</td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🎓 Estudiante de 2.º Bachillerato</strong>
            <p>El comentario de texto es obligatorio en la EBAU/PAES de Lengua Castellana. Puede suponer hasta 4 puntos sobre 10. Practicar con textos reales de exámenes anteriores es la mejor preparación. Usa la pestaña de Plantillas para acelerar la redacción en el examen.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📚 Estudiante de Filología o Humanidades</strong>
            <p>En los primeros cursos universitarios, los comentarios de texto son la base del análisis literario. La metodología de esta guía es compatible con el enfoque más riguroso exigido en la universidad: solo necesitas ampliar el marco teórico (narratología, estilística).</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>✏️ Opositor a Secundaria</strong>
            <p>Las oposiciones de Lengua y Literatura incluyen pruebas de análisis literario. Dominar el vocabulario técnico completo (pestaña de Vocabulario) y la metodología es imprescindible para las pruebas escritas y la programación didáctica.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📖 Lector que quiere entender mejor</strong>
            <p>El comentario de texto no es solo una herramienta de examen. Aplicar su metodología a cualquier poema o fragmento que te emocione transforma la experiencia lectora: convierte la intuición en comprensión articulada.</p>
          </div>
        </div>

        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuánto tiempo dedico a cada sección en un examen?</strong>
            <p>En una prueba de 1 hora para un poema de 14 versos, una distribución razonable es: lectura (5 min), localización (5 min), tema y estructura (10 min), análisis métrico (10 min), recursos (15 min), conclusión (10 min), revisión (5 min). El análisis de recursos suele necesitar más tiempo que la localización.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué hago si no reconozco al autor ni la obra?</strong>
            <p>No inventes datos. Usa los indicios del texto: el vocabulario, los temas, las referencias históricas y el estilo te permitirán situar el texto en un movimiento y un siglo con razonable seguridad. Formula así: «Por los rasgos de [característica], el texto podría pertenecer al [movimiento] del siglo [X]». Reconocer que no sabes algo y razonarlo honestamente puntúa más que inventar datos incorrectos.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿La valoración personal es obligatoria?</strong>
            <p>Depende de la prueba. En muchas CCAA la valoración personal es una sección puntuada (0,5-1 punto). Si es opcional, inclúyela igualmente: es la parte más fácil de escribir con fluidez y puede compensar errores técnicos. Solo exige que sea argumentada, no que sea «correcta».</p>
            <div className={styles.faqTip}>Evita valoraciones vacías: «es un poema muy bonito». Di qué produce en ti y por qué un recurso concreto lo genera. Eso sí es valoración razonada.</div>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuántas figuras retóricas debo identificar?</strong>
            <p>Calidad sobre cantidad. Tres o cuatro figuras bien analizadas (mecanismo + efecto) puntúan más que diez figuras solo nombradas. Prioriza las que sean más relevantes para el tema o más características del estilo del autor.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puedo citar el texto entre comillas durante el análisis?</strong>
            <p>No solo puedes: debes. Citar el texto es la base del análisis literario. Un comentario sin citas textuales es abstracto e inverificable. Cada recurso que identifies debe ir acompañado de su cita textual exacta entre comillas.</p>
          </li>
        </ul>

        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Practica con exámenes reales anteriores</strong>
              <p>Los textos de exámenes EBAU/PAES se publican en las webs de las universidades. Practica con textos de los últimos 5 años de tu comunidad autónoma: los patrones de selección de textos son previsibles (Generación del 27, Romanticismo, Modernismo, Realismo).</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Construye un banco de ejemplos por figura</strong>
              <p>Para cada figura retórica importante, ten memorizado un verso canónico de un autor reconocido. Citarlo en el comentario demuestra cultura literaria y añade valor al análisis.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Practica el análisis métrico por separado</strong>
              <p>La métrica es la parte más mecánica del comentario. Practica el recuento silábico con 10 versos distintos hasta que sea automático. Un error métrico básico puede restar credibilidad a todo el análisis.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Aprende la plantilla de análisis de recursos</strong>
              <p>Nombre + cita + mecanismo + efecto. Repite esta estructura para cada figura hasta que sea natural. En el examen, si se te olvida el nombre de una figura pero describes correctamente su mecanismo y efecto, sigues puntuando.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Cronometra tus prácticas</strong>
              <p>Hacer un comentario sin límite de tiempo es mucho más fácil que hacerlo en 60 minutos. Practica con cronómetro desde el principio: la presión temporal es parte del examen y hay que acostumbrarse a ella.</p>
            </div>
          </li>
        </ol>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✍️</span>
            <strong>Escribe el tema en una frase nominal</strong>
            <p>«La fugacidad de la juventud» es un tema. «El poema habla de que los jóvenes son fugaces» no lo es: es un resumen. La diferencia está en el nivel de abstracción.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <strong>Distingue fondo y forma en la estructura</strong>
            <p>La estructura externa (estrofas, párrafos) es visible; la interna (partes de contenido) hay que deducirla. No siempre coinciden: un soneto de 14 versos puede tener 2 o 3 partes internas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📌</span>
            <strong>Conecta los recursos con el tema</strong>
            <p>El mejor comentario no solo identifica recursos: muestra cómo sirven al tema. Una anáfora no es un adorno; es el mecanismo que construye la insistencia que refuerza el argumento central del poema.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>La conclusión debe añadir, no repetir</strong>
            <p>Un error frecuente es la conclusión que resume lo ya dicho. La conclusión debe añadir: valoración personal, conexión con otros textos del autor, vigencia actual o reflexión sobre el significado global.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes que restan puntos en el comentario de texto
          </div>
          <ul className={styles.warningList}>
            <li><span aria-hidden="true">❌</span> Escribir el resumen del texto en lugar del tema. El tema es una abstracción; el resumen es una narración. Son cosas distintas.</li>
            <li><span aria-hidden="true">❌</span> Nombrar figuras retóricas sin citar el texto. Sin cita textual, el análisis es indemostrable.</li>
            <li><span aria-hidden="true">❌</span> Analizar la forma sin conectarla con el fondo. La métrica y los recursos son herramientas al servicio del significado, no datos aislados.</li>
            <li><span aria-hidden="true">❌</span> Confundir estructura interna con argumento. La estructura interna son las partes lógicas del texto; el argumento es lo que ocurre. En poesía lírica, muchas veces no hay argumento.</li>
            <li><span aria-hidden="true">❌</span> Inventar datos de localización. Si no recuerdas el año exacto, da el siglo y el movimiento. Un dato inventado que resulta incorrecto resta credibilidad al comentario entero.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-comentario-texto')} />
      <ShareCard appName="guia-comentario-texto" />
      <Footer appName="guia-comentario-texto" />
    </div>
  );
}
