'use client';
// @disclaimer: exempt

import { useState } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorNarratologia.module.css';

type TabId = 'historia-relato' | 'tiempo' | 'voz-focalizacion' | 'actancial';

interface Concepto {
  id: string;
  nombre: string;
  etiqueta?: string;
  definicion: string;
  ejemplo: string;
  nota?: string;
}

interface Tab {
  id: TabId;
  titulo: string;
  icono: string;
  resumen: string;
  conceptos: Concepto[];
}

const TABS: Tab[] = [
  {
    id: 'historia-relato',
    titulo: 'Historia, Relato y Narración',
    icono: '📖',
    resumen: 'Genette distingue tres niveles en todo texto narrativo. Confundirlos es el error más frecuente en el análisis literario.',
    conceptos: [
      {
        id: 'historia',
        nombre: 'Historia',
        etiqueta: 'qué pasa',
        definicion: 'La secuencia cronológica de los eventos tal como habrían ocurrido en el mundo de los personajes. Es el material de base, independientemente de cómo se cuente.',
        ejemplo: 'En Cien años de soledad: la fundación de Macondo, las guerras del coronel Aureliano, la decadencia de los Buendía, la destrucción final del pueblo. En ese orden cronológico.',
        nota: 'La historia nunca aparece directamente en el texto: la reconstruimos a partir del relato.',
      },
      {
        id: 'relato',
        nombre: 'Relato',
        etiqueta: 'cómo se cuenta',
        definicion: 'El texto narrativo tal como existe: con su orden de presentación, sus elipsis, sus repeticiones, sus énfasis. El relato puede invertir, comprimir o expandir la historia.',
        ejemplo: 'Cien años de soledad comienza con el coronel Aureliano frente al pelotón de fusilamiento recordando el hielo de su infancia — una prolepsis seguida de analepsis. La historia empieza mucho antes, pero el relato elige este punto de entrada.',
        nota: 'El relato es lo que el escritor construye; la historia es lo que el lector reconstruye.',
      },
      {
        id: 'narracion',
        nombre: 'Narración',
        etiqueta: 'quién cuenta y cuándo',
        definicion: 'El acto de narrar en sí: quién narra, desde qué posición temporal respecto a los eventos, con qué actitud. Es el nivel de la producción del relato.',
        ejemplo: 'En El extranjero, el narrador es Meursault (homodiegético y autodiegético). Narra en pasado pero sin distancia emocional, como si contara hechos objetivos. Esa frialdad es una decisión de narración que crea el efecto central de la novela.',
        nota: 'Muchos "fallos de perspectiva" son en realidad incoherencias en el nivel de la narración.',
      },
    ],
  },
  {
    id: 'tiempo',
    titulo: 'Tiempo Narrativo',
    icono: '⏱️',
    resumen: 'Genette analiza la relación entre el tiempo de la historia y el tiempo del relato en tres dimensiones: orden, duración y frecuencia.',
    conceptos: [
      {
        id: 'analepsis',
        nombre: 'Analepsis (flashback)',
        etiqueta: 'Orden — hacia atrás',
        definicion: 'El relato vuelve a un tiempo anterior al punto en que se encuentra la narración. Puede ser externa (antes del inicio del relato) o interna (dentro del período del relato).',
        ejemplo: 'Madame Bovary: la historia de Emma con Charles se interrumpe para contar el pasado de Charles en el colegio. El lector entiende quién es Charles antes de verlo actuar.',
      },
      {
        id: 'prolepsis',
        nombre: 'Prolepsis (flashforward)',
        etiqueta: 'Orden — hacia adelante',
        definicion: 'El relato anticipa eventos que ocurrirán más tarde en la historia. Puede crear suspense inverso: el lector sabe el desenlace y sigue leyendo para ver cómo se llega a él.',
        ejemplo: '"Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar..." — García Márquez anticipa un momento que ocurrirá mucho más tarde en la historia.',
      },
      {
        id: 'in-medias-res',
        nombre: 'In medias res',
        etiqueta: 'Orden — en medio de la acción',
        definicion: 'El relato comienza en mitad de la acción, sin presentación previa de personajes o contexto. La historia previa se reconstruye después mediante analepsis o diálogos.',
        ejemplo: 'La Odisea comienza con Telémaco buscando a Odiseo, cuando la historia empezó diez años antes con la caída de Troya. Homero construye el pasado de Odiseo a través de relatos dentro del relato.',
      },
      {
        id: 'escena',
        nombre: 'Escena',
        etiqueta: 'Duración — tiempo = tiempo',
        definicion: 'El tiempo del relato es aproximadamente igual al tiempo de la historia. Los diálogos y las secuencias de acción dramatizadas son el ejemplo más puro.',
        ejemplo: 'Una conversación de diez minutos narrada en el espacio que ocupa ese diálogo en el texto. El lector lee a una velocidad parecida a la que la conversación habría durado.',
      },
      {
        id: 'sumario',
        nombre: 'Sumario',
        etiqueta: 'Duración — relato < historia',
        definicion: 'El relato resume en pocas palabras eventos que abarcan mucho tiempo en la historia. Años, meses o semanas comprimidos en un párrafo.',
        ejemplo: '"Pasaron cinco años." / "Durante ese período, Aureliano aprendió a fabricar pescaditos de oro." El tiempo de la historia se condensa enormemente en el relato.',
      },
      {
        id: 'pausa',
        nombre: 'Pausa',
        etiqueta: 'Duración — historia se detiene',
        definicion: 'El tiempo de la historia se detiene mientras el relato continúa con descripciones, reflexiones o digresiones. El mundo ficticio no avanza mientras el narrador describe o reflexiona.',
        ejemplo: 'Las largas descripciones de la catedral en Notre-Dame de París: la historia se detiene mientras el narrador analiza la arquitectura durante páginas enteras.',
      },
      {
        id: 'elipsis',
        nombre: 'Elipsis',
        etiqueta: 'Duración — relato en silencio',
        definicion: 'El relato guarda silencio mientras la historia avanza. Tiempo que pasa sin ser narrado. Puede ser explícita ("tres años después") o implícita (el lector infiere el salto).',
        ejemplo: '"Tres años más tarde, cuando volvió a la ciudad..." — el relato salta directamente, sin narrar lo ocurrido en esos tres años.',
      },
      {
        id: 'singulativo',
        nombre: 'Frecuencia singulativa',
        etiqueta: 'Frecuencia — lo normal',
        definicion: 'Un evento que ocurre N veces es narrado N veces. El modo narrativo predeterminado: "El martes fue al mercado" (ocurrió una vez, se narra una vez).',
        ejemplo: 'La mayoría de escenas en cualquier novela: cada evento singular narrado una vez.',
      },
      {
        id: 'iterativo',
        nombre: 'Frecuencia iterativa',
        etiqueta: 'Frecuencia — lo habitual',
        definicion: 'Eventos que ocurrieron muchas veces son narrados una sola vez. El uso del imperfecto habitual: "Cada mañana bajaba al bar, pedía un café y leía el periódico."',
        ejemplo: 'En À la recherche du temps perdu, Proust usa el iterativo constantemente para construir la rutina de la infancia del narrador antes de narrar eventos singulares que la interrumpen.',
      },
      {
        id: 'repetitivo',
        nombre: 'Frecuencia repetitiva',
        etiqueta: 'Frecuencia — Rashomon',
        definicion: 'Un evento que ocurre una sola vez es narrado múltiples veces, desde perspectivas o con énfasis diferentes. Técnica del multiperspectivismo.',
        ejemplo: 'Rashomon (Akutagawa): el mismo asesinato narrado cuatro veces por cuatro personajes distintos. Cada versión es incompatible con las demás.',
      },
    ],
  },
  {
    id: 'voz-focalizacion',
    titulo: 'Voz y Focalización',
    icono: '👁️',
    resumen: 'Genette distingue dos preguntas que se confunden habitualmente: ¿quién habla? (voz) y ¿quién percibe? (focalización). Son dimensiones independientes.',
    conceptos: [
      {
        id: 'heterodiegetico',
        nombre: 'Narrador heterodiegético',
        etiqueta: 'Voz — fuera de la historia',
        definicion: 'El narrador no forma parte de la historia que cuenta. Habla en tercera persona y existe fuera del mundo diegético.',
        ejemplo: 'La mayoría de novelas del siglo XIX: el narrador de Ana Karénina, de Madame Bovary, de El señor de los anillos. No es un personaje; es una instancia narrativa externa.',
      },
      {
        id: 'homodiegetico',
        nombre: 'Narrador homodiegético',
        etiqueta: 'Voz — dentro de la historia',
        definicion: 'El narrador es un personaje que existe en el mundo que narra. Puede ser el protagonista (autodiegético) o un personaje secundario que observa.',
        ejemplo: 'Nick Carraway en El gran Gatsby: narrador homodiegético secundario. Observa y narra la historia de Gatsby sin ser el protagonista.',
      },
      {
        id: 'autodiegetico',
        nombre: 'Narrador autodiegético',
        etiqueta: 'Voz — el protagonista narra',
        definicion: 'Caso especial del narrador homodiegético: el narrador es el protagonista de su propia historia. El "yo" que cuenta es el mismo que vivió los eventos.',
        ejemplo: 'El guardián entre el centeno (Salinger): Holden Caulfield narra su propia historia. La voz y el protagonista son la misma entidad.',
        nota: 'El narrador no fiable es casi siempre autodiegético: la limitación de su perspectiva es su propia psicología.',
      },
      {
        id: 'focalizacion-cero',
        nombre: 'Focalización cero',
        etiqueta: 'Focalización — omnisciente',
        definicion: 'El narrador sabe más que cualquier personaje: conoce pensamientos, sentimientos, pasado y futuro de todos. No hay restricción de información.',
        ejemplo: 'Ana Karénina: Tolstói entra en la mente de Anna, de Levin, de Oblonsky en la misma novela. Sabe todo sobre todos sin restricción.',
        nota: 'Combinada casi siempre con voz heterodiegética, pero no necesariamente.',
      },
      {
        id: 'focalizacion-interna',
        nombre: 'Focalización interna',
        etiqueta: 'Focalización — un personaje percibe',
        definicion: 'El relato está filtrado por la percepción de un personaje concreto. Solo se narra lo que ese personaje ve, siente, piensa o puede inferir. El narrador no sabe más que el personaje focalizador.',
        ejemplo: 'Madame Bovary: aunque el narrador es heterodiegético, el relato está filtrado en gran parte por la percepción de Emma. La realidad aparece como Emma la ve, no como "realmente es".',
      },
      {
        id: 'focalizacion-externa',
        nombre: 'Focalización externa',
        etiqueta: 'Focalización — conductista',
        definicion: 'El narrador sabe menos que los personajes: solo describe comportamiento observable (acciones, palabras, gestos) sin acceso a pensamientos o emociones. Estilo behaviorista o "cámara".',
        ejemplo: 'Las colinas como elefantes blancos (Hemingway): el narrador solo transcribe lo que los personajes dicen y hacen. El lector infiere todo lo que sienten a partir del diálogo.',
      },
      {
        id: 'estilo-indirecto-libre',
        nombre: 'Estilo indirecto libre',
        etiqueta: 'Distancia — fusión de voces',
        definicion: 'Técnica que fusiona la voz del narrador con la del personaje sin marcar formalmente el paso. El narrador adopta la perspectiva y el idioma del personaje sin que haya verbos de habla o pensamiento explícitos.',
        ejemplo: '"¿Por qué la había engañado? ¿Por qué era tan cruel? Nunca lo entendería." — ¿Son pensamientos de Emma narrados por el narrador, o el narrador temporalmente es Emma? El estilo indirecto libre borra esa frontera.',
      },
    ],
  },
  {
    id: 'actancial',
    titulo: 'Modelo Actancial',
    icono: '⚙️',
    resumen: 'Greimas propone que toda narrativa puede describirse mediante seis actantes organizados en tres ejes. Los actantes son roles funcionales, no personajes: un personaje puede ocupar varios actantes.',
    conceptos: [
      {
        id: 'sujeto',
        nombre: 'Sujeto',
        etiqueta: 'Eje del deseo — polo activo',
        definicion: 'El actante que desea o busca algo. El protagonista en la mayoría de relatos, aunque puede ser colectivo o una institución.',
        ejemplo: 'Romeo en Romeo y Julieta. Frodo en El señor de los anillos. La humanidad en muchas distopías.',
      },
      {
        id: 'objeto',
        nombre: 'Objeto',
        etiqueta: 'Eje del deseo — lo buscado',
        definicion: 'Lo que el sujeto desea, busca o quiere conseguir. Puede ser tangible (el antídoto, el tesoro) o abstracto (el amor, la justicia, la identidad).',
        ejemplo: 'En Romeo y Julieta, el Objeto es el amor y la unión con Julieta. En El señor de los anillos, destruir el Anillo y salvar la Tierra Media.',
      },
      {
        id: 'destinador',
        nombre: 'Destinador',
        etiqueta: 'Eje de la comunicación — origen',
        definicion: 'La fuerza, persona o principio que envía al Sujeto a buscar el Objeto. Puede ser un personaje, una ley moral, el destino, una institución o una motivación abstracta.',
        ejemplo: 'En Romeo y Julieta, el Destinador es el amor mismo / el destino trágico. En El señor de los anillos, el Destinador es Gandalf y el imperativo moral de salvar el mundo.',
      },
      {
        id: 'destinatario',
        nombre: 'Destinatario',
        etiqueta: 'Eje de la comunicación — beneficiario',
        definicion: 'Quien se beneficiará de la consecución del Objeto. Puede coincidir con el Sujeto (busca algo para sí mismo) o ser otro personaje o colectividad.',
        ejemplo: 'En El señor de los anillos, el Destinatario es la Tierra Media y todos sus habitantes. En Romeo y Julieta, los Destinatarios son los propios amantes.',
      },
      {
        id: 'ayudante',
        nombre: 'Ayudante',
        etiqueta: 'Eje del poder — a favor',
        definicion: 'Actante que ayuda al Sujeto a conseguir el Objeto. Puede ser un personaje, un objeto mágico, una habilidad o una circunstancia favorable.',
        ejemplo: 'Fray Lorenzo y la nodriza en Romeo y Julieta. Sam, Aragorn y los elfos en El señor de los anillos.',
      },
      {
        id: 'oponente',
        nombre: 'Oponente',
        etiqueta: 'Eje del poder — en contra',
        definicion: 'Actante que obstaculiza al Sujeto. No tiene que ser un villano: puede ser una circunstancia, una ley, un malentendido o la propia psicología del Sujeto.',
        ejemplo: 'Las familias Montesco y Capuleto en Romeo y Julieta. Sauron, Saruman y Gollum en El señor de los anillos. La sociedad en muchas novelas realistas.',
        nota: 'Un mismo personaje puede ser Ayudante y Oponente en distintos momentos (Gollum guía y traiciona).',
      },
    ],
  },
];

const TAB_COLORES: Record<TabId, string> = {
  'historia-relato':  '#2E86AB',
  'tiempo':           '#48A9A6',
  'voz-focalizacion': '#9B59B6',
  'actancial':        '#E67E22',
};

export default function VisualizadorNarratologiaPage() {
  const [tabActivo, setTabActivo] = useState<TabId>('historia-relato');

  const tabData = TABS.find((t) => t.id === tabActivo)!;
  const colorActivo = TAB_COLORES[tabActivo];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Narratología Visual</h1>
        <p className={styles.heroSubtitle}>
          Los conceptos fundamentales de Genette y Greimas explicados con ejemplos reales.
          Historia, relato, tiempo narrativo, voz, focalización y modelo actancial.
        </p>
      </header>

      <LegalNotice />

      <nav className={styles.tabsNav} role="tablist" aria-label="Secciones de narratología">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${tabActivo === tab.id ? styles.tabBtnActive : ''}`}
            style={tabActivo === tab.id ? { borderBottomColor: TAB_COLORES[tab.id], color: TAB_COLORES[tab.id] } : {}}
            onClick={() => setTabActivo(tab.id)}
            role="tab"
            aria-selected={tabActivo === tab.id}
          >
            <span aria-hidden="true">{tab.icono}</span> {tab.titulo}
          </button>
        ))}
      </nav>

      <div className={styles.tabContent} role="tabpanel">
        <p className={styles.tabResumen}>{tabData.resumen}</p>

        {tabActivo === 'actancial' && (
          <div className={styles.actancialDiagrama}>
            <div className={styles.actancialEje} style={{ gridArea: 'eje-deseo' }}>
              <span className={styles.actancialEjeLabel}>Eje del deseo</span>
            </div>
            <div className={styles.actancialCell} style={{ gridArea: 'destinador', borderColor: colorActivo }}>
              <strong>Destinador</strong>
              <span>Origen del mandato</span>
            </div>
            <div className={styles.actancialArrow} style={{ gridArea: 'flecha1' }}>→</div>
            <div className={styles.actancialCell} style={{ gridArea: 'sujeto', backgroundColor: `${colorActivo}15`, borderColor: colorActivo }}>
              <strong>Sujeto</strong>
              <span>Quien busca</span>
            </div>
            <div className={styles.actancialArrow} style={{ gridArea: 'flecha2' }}>→</div>
            <div className={styles.actancialCell} style={{ gridArea: 'objeto', borderColor: colorActivo }}>
              <strong>Objeto</strong>
              <span>Lo que se busca</span>
            </div>
            <div className={styles.actancialArrow} style={{ gridArea: 'flecha3' }}>→</div>
            <div className={styles.actancialCell} style={{ gridArea: 'destinatario', borderColor: colorActivo }}>
              <strong>Destinatario</strong>
              <span>Beneficiario</span>
            </div>
            <div className={styles.actancialEje} style={{ gridArea: 'eje-poder' }}>
              <span className={styles.actancialEjeLabel}>Eje del poder</span>
            </div>
            <div className={styles.actancialCell} style={{ gridArea: 'ayudante', borderColor: '#27AE60' }}>
              <strong style={{ color: '#27AE60' }}>Ayudante</strong>
              <span>Facilita el camino</span>
            </div>
            <div className={styles.actancialCell} style={{ gridArea: 'oponente', borderColor: '#C0392B' }}>
              <strong style={{ color: '#C0392B' }}>Oponente</strong>
              <span>Obstaculiza</span>
            </div>
          </div>
        )}

        <div className={styles.conceptosGrid}>
          {tabData.conceptos.map((concepto) => (
            <article
              key={concepto.id}
              className={styles.conceptoCard}
              style={{ borderLeftColor: colorActivo }}
            >
              {concepto.etiqueta && (
                <span
                  className={styles.conceptoEtiqueta}
                  style={{ backgroundColor: `${colorActivo}18`, color: colorActivo }}
                >
                  {concepto.etiqueta}
                </span>
              )}
              <h2 className={styles.conceptoNombre}>{concepto.nombre}</h2>
              <p className={styles.conceptoDefinicion}>{concepto.definicion}</p>
              <div className={styles.conceptoEjemplo}>
                <span className={styles.conceptoEjemploLabel}>Ejemplo literario</span>
                <p>{concepto.ejemplo}</p>
              </div>
              {concepto.nota && (
                <p className={styles.conceptoNota}>{concepto.nota}</p>
              )}
            </article>
          ))}
        </div>
      </div>

      <EducationalSection
        title="Narratología aplicada: más allá de los conceptos"
        subtitle="Cómo usar estas herramientas para analizar y mejorar tu escritura"
      >
        <h3>Las principales escuelas de narratología</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Escuela</th>
                <th>Representantes clave</th>
                <th>Foco principal</th>
                <th>Período</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Estructuralismo francés</td><td>Genette, Greimas, Todorov</td><td>Estructura formal del relato</td><td>1960–1980</td></tr>
              <tr><td>Narratología cognitiva</td><td>Fludernik, Herman</td><td>Cómo procesa el lector las historias</td><td>1990–presente</td></tr>
              <tr><td>Narratología feminista</td><td>Lanser, Warhol</td><td>Género, voz y poder en el relato</td><td>1980–presente</td></tr>
              <tr><td>Narratología postclásica</td><td>Richardson, Alber</td><td>Narradores no convencionales</td><td>2000–presente</td></tr>
              <tr><td>Narratología transmedial</td><td>Ryan</td><td>Narrativa en múltiples medios</td><td>2000–presente</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Para qué tipo de lector es esta guía</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🎓 Estudiante de literatura</strong>
            <p>Usar los modelos de Genette y Greimas para analizar textos en exámenes y trabajos. La terminología precisa distingue el análisis superficial del riguroso.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>✍️ Escritor creativo</strong>
            <p>Entender qué decides cuando eliges un POV, un orden narrativo o una frecuencia. Las decisiones técnicas inconscientes se vuelven conscientes y controlables.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📖 Lector avanzado</strong>
            <p>Entender por qué ciertos relatos funcionan a un nivel que va más allá de "está bien escrito". Los conceptos narratológicos dan vocabulario a intuiciones ya existentes.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🏫 Docente</strong>
            <p>Los modelos de Genette y Greimas son herramientas pedagógicas probadas para enseñar análisis narrativo en secundaria y universidad.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes sobre narratología</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Hay que conocer narratología para ser un buen escritor?</strong>
            <p>No necesariamente. Muchos grandes escritores nunca usaron esta terminología. Pero conocerla convierte las decisiones intuitivas en decisiones conscientes, lo que facilita la revisión y el análisis de los propios errores.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre voz y focalización?</strong>
            <p>Voz responde a "¿quién habla?"; focalización responde a "¿quién percibe?". Un narrador heterodiegético (fuera de la historia) puede usar focalización interna (percibir a través de un personaje). Son independientes.</p>
            <div className={styles.faqTip}>Madame Bovary: narrador heterodiegético + focalización interna de Emma. El narrador está fuera, pero "ve" con los ojos de Emma.</div>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo sé qué tipo de focalización usa un texto?</strong>
            <p>Pregúntate: ¿el narrador sabe cosas que el personaje no sabe? (cero). ¿Solo sabe lo que sabe un personaje concreto? (interna). ¿Solo describe conducta observable sin acceso a pensamientos? (externa).</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El modelo actancial de Greimas funciona en todo tipo de relatos?</strong>
            <p>Funciona bien en narrativas de estructura clásica (búsqueda, conflicto, resolución). En relatos polifónicos, experimentales o sin trama clara, el modelo puede resultar forzado. Es una herramienta, no una ley.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Un personaje puede ocupar varios actantes a la vez?</strong>
            <p>Sí. Gollum en El señor de los anillos es simultáneamente Ayudante (guía el camino) y Oponente (intenta robar el Anillo). El modelo actancial describe roles funcionales, no personajes.</p>
          </li>
        </ul>

        <h3>Cómo aplicar el análisis narratológico a un texto</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica al narrador (voz)</strong>
              <p>¿Está dentro o fuera de la historia? ¿Habla en 1.ª o 3.ª persona? ¿Es el protagonista o un personaje secundario? Determina si es homodiegético, heterodiegético o autodiegético.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Determina la focalización</strong>
              <p>¿Qué sabe el narrador que los personajes no saben? ¿Está limitado a la percepción de uno o varios personajes? ¿Solo describe comportamiento observable? Cero, interna o externa.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Analiza el tiempo narrativo</strong>
              <p>¿El relato sigue el orden cronológico de la historia? ¿Hay analepsis o prolepsis? ¿Qué velocidad tiene el relato (escenas, sumarios, elipsis)? ¿Hay eventos narrados en iterativo?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Mapea los actantes (Greimas)</strong>
              <p>¿Quién es el Sujeto y qué busca (Objeto)? ¿Qué lo impulsa (Destinador)? ¿Quién se beneficia (Destinatario)? ¿Quién ayuda y quién obstaculiza?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Relaciona las decisiones con el efecto</strong>
              <p>¿Por qué el autor eligió esta voz y no otra? ¿Qué habría cambiado con focalización cero en lugar de interna? El análisis narratológico no solo describe: también explica el efecto.</p>
            </div>
          </li>
        </ol>

        <h3>Lo que la narratología no puede hacer</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔧</span>
            <strong>Es una herramienta, no un juicio</strong>
            <p>La narratología describe cómo funciona un relato, no si es bueno o malo. Un texto puede usar focalización interna de forma brillante o torpe.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <strong>Usa la herramienta que responde tu pregunta</strong>
            <p>Genette es mejor para análisis de relato literario. Greimas, para estructura argumental. No apliques todos los modelos a la vez.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>La focalización puede cambiar</strong>
            <p>Muchos textos alternan entre tipos de focalización. No es incoherencia si el cambio es controlado y tiene un efecto narrativo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <strong>Los modelos son del siglo XX</strong>
            <p>Funcionan bien en relato realista y modernista. En narrativas posmodernas, experimentales o transmediáticas, pueden necesitar adaptación.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👁️</span>
            <strong>El lector también importa</strong>
            <p>La narratología cognitiva recuerda que el significado no está solo en el texto: también en cómo el lector procesa y completa la información que le da el relato.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Confusiones frecuentes que conviene evitar
          </div>
          <ul className={styles.warningList}>
            <li><span aria-hidden="true">❌</span> Confundir al autor con el narrador — el narrador es siempre una construcción textual, no la persona que escribió.</li>
            <li><span aria-hidden="true">❌</span> Confundir voz con focalización — quién habla y quién percibe son preguntas independientes.</li>
            <li><span aria-hidden="true">❌</span> Aplicar el modelo actancial de forma rígida — un personaje puede ocupar varios actantes a la vez.</li>
            <li><span aria-hidden="true">❌</span> Creer que "focalización cero" = "narrador heterodiegético" — son dimensiones distintas que pueden combinarse de formas diversas.</li>
            <li><span aria-hidden="true">❌</span> Usar la narratología para emitir juicios de valor — describe cómo funciona un relato, no si funciona bien.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-narratologia')} />
      <ShareCard appName="visualizador-narratologia" />
      <Footer appName="visualizador-narratologia" />
    </div>
  );
}
