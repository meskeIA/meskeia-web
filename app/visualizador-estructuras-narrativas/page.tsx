'use client';
// @disclaimer: exempt

import { useState } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorEstructurasNarrativas.module.css';

type EstructuraId = 'freytag' | 'tres-actos' | 'viaje-heroe' | 'kishotenketsu' | 'save-the-cat' | 'cinco-actos';

interface Etapa {
  nombre: string;
  descripcion: string;
  tension: number;
  color: string;
}

interface EjemploLiterario {
  obra: string;
  autor: string;
  descripcion: string;
}

interface Estructura {
  id: EstructuraId;
  nombre: string;
  icono: string;
  origen: string;
  descripcion: string;
  para: string;
  etapas: Etapa[];
  ejemplo: EjemploLiterario;
}

const ESTRUCTURAS: Estructura[] = [
  {
    id: 'freytag',
    nombre: 'Pirámide de Freytag',
    icono: '🏔️',
    origen: 'Gustav Freytag, Técnica del drama (1863)',
    descripcion: 'Modelo de 5 etapas extraído del análisis de la tragedia griega y el drama shakespeariano. Representa la tensión como una pirámide: asciende hasta el clímax y desciende hacia la resolución. Es el modelo más antiguo y el punto de partida de todos los demás.',
    para: 'Dramas, tragedias, novelas clásicas con un único arco central. Especialmente útil para historias con desenlace definitivo (muerte, pérdida, transformación irreversible).',
    etapas: [
      { nombre: 'Exposición', descripcion: 'Presentación del mundo ordinario, los personajes y la situación inicial. El lector conoce el statu quo que pronto se romperá. Incluye la situación antes del conflicto.', tension: 2, color: '#3498DB' },
      { nombre: 'Acción Ascendente', descripcion: 'Serie de complicaciones y conflictos que elevan la tensión de forma progresiva. El protagonista intenta resolver el problema central sin lograrlo completamente. Los obstáculos se acumulan.', tension: 6, color: '#2E86AB' },
      { nombre: 'Clímax', descripcion: 'El punto de máxima tensión: el momento decisivo en que el conflicto principal llega a su punto de no retorno. Todo cambia aquí. Es el giro más importante de la historia.', tension: 10, color: '#E74C3C' },
      { nombre: 'Acción Descendente', descripcion: 'Las consecuencias del clímax se desarrollan. Los hilos secundarios se resuelven, la tensión disminuye de forma gradual hacia la resolución final.', tension: 5, color: '#E67E22' },
      { nombre: 'Desenlace', descripcion: 'El conflicto queda resuelto para bien o para mal. El nuevo statu quo queda establecido. En la tragedia, suele incluir la catástrofe final y la purificación (catarsis).', tension: 2, color: '#27AE60' },
    ],
    ejemplo: {
      obra: 'Romeo y Julieta',
      autor: 'Shakespeare',
      descripcion: 'Exposición: las familias rivales en Verona, primer encuentro en el baile. Acción ascendente: romance secreto, matrimonio clandestino, muerte de Mercucio a manos de Teobaldo. Clímax: Romeo mata a Teobaldo y es desterrado — el punto de no retorno. Descenso: el plan del falso veneno, las cartas que no llegan. Desenlace: Romeo muere creyendo a Julieta muerta, ella se suicida, las familias se reconcilian ante los cadáveres.',
    },
  },
  {
    id: 'tres-actos',
    nombre: 'Estructura en 3 Actos',
    icono: '🎬',
    origen: 'Aristóteles (Poética, s. IV a.C.) → Hollywood (siglo XX)',
    descripcion: 'La estructura dominante en el cine y la narrativa popular contemporánea. Divide la historia en tres bloques con proporciones definidas (25-50-25%) y dos puntos de giro que redirigen la acción. El Punto Medio (50%) divide el largo Acto II en una fase reactiva y otra proactiva.',
    para: 'Guiones cinematográficos, novelas comerciales, thrillers, aventuras y comedias. El formato más versátil y reconocible del storytelling occidental moderno.',
    etapas: [
      { nombre: 'Acto I — Planteamiento (25%)', descripcion: 'Presenta el mundo ordinario del protagonista y su deseo/problema. El detonante irrumpe hacia el 10-12% y pone la historia en marcha. Al final del acto, el protagonista cruza el umbral hacia el conflicto principal.', tension: 3, color: '#3498DB' },
      { nombre: 'Punto de Giro 1', descripcion: 'Evento que fuerza al protagonista a entrar de lleno en el conflicto. Sucede al 25% del relato. No hay vuelta atrás: el protagonista debe comprometerse con la historia principal o perderlo todo.', tension: 7, color: '#E67E22' },
      { nombre: 'Acto II — Confrontación (50%)', descripcion: 'El más largo. El protagonista lucha, fracasa y aprende. El Punto Medio (50%) marca un cambio de actitud: de reactivo a proactivo. Los antagonistas se refuerzan hacia el final, empujando al protagonista al punto más bajo.', tension: 7, color: '#2E86AB' },
      { nombre: 'Punto de Giro 2', descripcion: 'Todo parece perdido. La situación del protagonista alcanza su punto más bajo: una pérdida, una traición o una derrota. Ocurre al 75%. Este es el detonante que empuja hacia la resolución final.', tension: 9, color: '#C0392B' },
      { nombre: 'Acto III — Resolución (25%)', descripcion: 'El protagonista usa todo lo aprendido para enfrentarse al conflicto central con una nueva perspectiva. El clímax resuelve la pregunta dramática principal. El desenlace muestra el nuevo statu quo.', tension: 10, color: '#27AE60' },
    ],
    ejemplo: {
      obra: 'El señor de los anillos',
      autor: 'J.R.R. Tolkien',
      descripcion: 'Acto I: La Comarca, la herencia del Anillo, Gandalf explica el peligro. Giro 1: la Compañía se forma en Rivendell — misión definida. Acto II: Moria, Lothlórien, la influencia corrupta del Anillo en los miembros del grupo. Giro 2: ruptura de la Compañía, muerte de Boromir, Frodo y Sam solos. Acto III: la guerra del Anillo, el Monte del Destino, la destrucción del Anillo y el regreso a casa.',
    },
  },
  {
    id: 'viaje-heroe',
    nombre: 'El Viaje del Héroe',
    icono: '⚔️',
    origen: 'Joseph Campbell, El héroe de las mil caras (1949)',
    descripcion: 'El monomito: Campbell identificó un patrón universal en mitos de culturas dispares. El héroe parte del mundo conocido, desciende a un mundo desconocido (el "vientre de la ballena"), supera una prueba suprema y regresa transformado. La estructura es cíclica: el héroe vuelve al punto de partida pero cambiado.',
    para: 'Épica, fantasía, aventura, mitología, distopías. También funciona en dramas de transformación personal, historias de aprendizaje y relatos de superación.',
    etapas: [
      { nombre: 'Mundo Ordinario', descripcion: 'El héroe en su vida cotidiana antes de la aventura. Establece el contraste con lo que vendrá y muestra qué dejará atrás. El lector ve quién era el héroe antes de ser transformado.', tension: 1, color: '#3498DB' },
      { nombre: 'La Llamada a la Aventura', descripcion: 'Un problema, desafío o acontecimiento interrumpe el equilibrio del héroe. Un mensajero, un accidente o un encuentro inesperado le presenta la aventura que no puede ignorar indefinidamente.', tension: 3, color: '#2980B9' },
      { nombre: 'El Rechazo y la Aceptación', descripcion: 'El héroe duda o rechaza la llamada por miedo, obligaciones o inseguridad. Finalmente acepta, a menudo tras una pérdida importante o un empujón del mentor. La aceptación es un compromiso sin vuelta atrás.', tension: 4, color: '#8E44AD' },
      { nombre: 'Encuentro con el Mentor', descripcion: 'Una figura sabia proporciona conocimiento, objetos mágicos o confianza al héroe. El mentor no puede vivir la aventura en su lugar: solo puede prepararlo para cruzar el umbral.', tension: 4, color: '#9B59B6' },
      { nombre: 'Cruzar el Umbral', descripcion: 'El héroe entra definitivamente en el mundo especial o desconocido. Es el punto de no retorno: el mundo ordinario queda atrás. Las reglas de este nuevo mundo son diferentes y el héroe aún no las conoce.', tension: 6, color: '#E67E22' },
      { nombre: 'Pruebas, Aliados y Enemigos', descripcion: 'Serie de desafíos que enseñan al héroe las reglas del mundo especial. Gana aliados, descubre enemigos, aprende sus propias capacidades y limitaciones. Período de aprendizaje y preparación para el enfrentamiento final.', tension: 6, color: '#E74C3C' },
      { nombre: 'La Prueba Suprema', descripcion: 'El enfrentamiento central: la "cueva más profunda". El héroe afronta su mayor miedo o adversario. Hay una "pequeña muerte" y renacimiento: el héroe que supera la prueba es distinto al que entró.', tension: 10, color: '#C0392B' },
      { nombre: 'La Recompensa', descripcion: 'Tras superar la prueba suprema, el héroe obtiene lo que buscaba: un objeto, un conocimiento, un aliado o una transformación interior. Momento de celebración breve antes del difícil camino de vuelta.', tension: 7, color: '#F39C12' },
      { nombre: 'El Camino de Vuelta', descripcion: 'El regreso al mundo ordinario puede ser tan peligroso como la ida. Persecuciones, tentaciones de quedarse en el mundo especial, el último obstáculo antes de cruzar de vuelta el umbral.', tension: 8, color: '#E67E22' },
      { nombre: 'El Retorno Transformado', descripcion: 'El héroe regresa al mundo ordinario cambiado. Trae el "elixir": conocimiento, objeto o transformación que puede compartir con su comunidad. El ciclo se cierra pero el héroe es diferente al que partió.', tension: 5, color: '#27AE60' },
    ],
    ejemplo: {
      obra: 'La Odisea',
      autor: 'Homero',
      descripcion: 'Mundo ordinario: Ítaca antes de la guerra de Troya. Llamada: la guerra convocada por el rapto de Helena. Mentor: Atenea, que protege y guía a Odiseo. Umbral: la caída de Troya y el inicio del regreso. Pruebas: el Cíclope, Circe, las Sirenas, Escila y Caribdis, el País de los Muertos. Prueba suprema: el regreso a Ítaca y la masacre de los pretendientes que han ocupado su hogar. Retorno: Odiseo recupera su trono, su esposa y su hijo; es un hombre que conoce el mundo entero.',
    },
  },
  {
    id: 'kishotenketsu',
    nombre: 'Kishōtenketsu',
    icono: '🌸',
    origen: 'Estructura narrativa de Asia Oriental (China, Japón, Corea)',
    descripcion: 'Estructura de 4 partes que no requiere conflicto como motor narrativo. En lugar de antagonismo, utiliza la sorpresa y la yuxtaposición: el giro (Ten) introduce un elemento inesperado que reencuadra todo lo establecido antes. El lector experimenta una "pequeña revelación" en lugar de una resolución de conflicto.',
    para: 'Cuentos cortos, manga, literatura contemplativa, poesía narrativa, historias infantiles. Alternativa al modelo occidental basado en conflicto. Ideal para explorar temas, no para resolver problemas.',
    etapas: [
      { nombre: 'Ki (起) — Introducción', descripcion: 'Presenta el mundo, los personajes y la situación inicial. No hay problema ni conflicto todavía: solo un estado de cosas claro y concreto que el lector toma como punto de partida. La calma antes del giro.', tension: 3, color: '#3498DB' },
      { nombre: 'Shō (承) — Desarrollo', descripcion: 'Continúa y profundiza lo establecido en Ki. Añade detalles, desarrolla personajes, amplía el mundo con matices. La situación evoluciona de forma natural y coherente, sin ruptura dramática aún.', tension: 4, color: '#48A9A6' },
      { nombre: 'Ten (転) — Giro', descripcion: 'El elemento disruptivo: algo inesperado que no tiene relación obvia con lo anterior. No es un "problema a resolver": es una yuxtaposición que reencuadra todo lo visto. La parte más difícil de dominar y la más poderosa del modelo.', tension: 9, color: '#E74C3C' },
      { nombre: 'Ketsu (結) — Conclusión', descripcion: 'Reconcilia Ki+Shō con Ten. Muestra cómo el giro inesperado se relaciona con lo establecido al inicio, creando un nuevo significado que antes no era posible. El lector siente que algo encaja de forma sorprendente.', tension: 5, color: '#27AE60' },
    ],
    ejemplo: {
      obra: 'El viaje de Chihiro',
      autor: 'Hayao Miyazaki',
      descripcion: 'Ki: Chihiro y sus padres viajan a su nueva casa; ella es una niña ordinaria, algo asustadiza. Shō: descubren el parque de atracciones abandonado, los padres empiezan a comer sin permiso. Ten: los padres se convierten en cerdos y el mundo se transforma en el reino de los espíritus — un giro radical sin un "villano" que lo cause intencionadamente. Ketsu: Chihiro trabaja en las termas del espíritu, aprende, crece y libera a sus padres; el giro no resolvió un conflicto sino que reveló quién podía ser Chihiro.',
    },
  },
  {
    id: 'save-the-cat',
    nombre: 'Save the Cat',
    icono: '🎥',
    origen: 'Blake Snyder, Save the Cat! (2005)',
    descripcion: 'Sistema de 15 beats para guiones cinematográficos, adoptado ampliamente en narrativa popular. El nombre viene de la técnica de mostrar al protagonista haciendo algo simpático al inicio (salvar a un gato) para ganarse la empatía del lector antes de que empiece el conflicto.',
    para: 'Guiones, novelas comerciales y de género, thrillers, aventuras. El sistema más prescriptivo de todos: muy útil para aprender estructura, puede resultar mecánico si se sigue al pie de la letra.',
    etapas: [
      { nombre: 'Imagen de apertura + Tema (1-5%)', descripcion: 'Primera imagen que captura el tono y el mundo de la historia. El tema se declara — a menudo a través de un personaje secundario — sin que el protagonista lo entienda todavía. Será la lección que aprenderá.', tension: 2, color: '#3498DB' },
      { nombre: 'Configuración (1-10%)', descripcion: 'El mundo ordinario del protagonista: su vida antes del catalizador. Se establece su necesidad interna (defecto psicológico) y externa (deseo concreto). El lector debe simpatizar con él antes de que la historia lo sacuda.', tension: 2, color: '#2980B9' },
      { nombre: 'Catalizador / Detonante (10%)', descripcion: 'El evento que sacude el mundo del protagonista y pone la historia en marcha. Una llamada, una muerte, un encuentro. El protagonista no toma decisiones todavía — solo reacciona ante lo que le ha ocurrido.', tension: 5, color: '#E67E22' },
      { nombre: 'Debate (10-20%)', descripcion: '¿Debería el protagonista cruzar el umbral? El período de duda, preparación y búsqueda de razones. La pregunta central del debate refleja el tema de la historia. Termina cuando el protagonista decide actuar.', tension: 4, color: '#F39C12' },
      { nombre: 'Ruptura al Acto II (20%)', descripcion: 'El protagonista decide actuar — no le ocurre algo, sino que elige. Empieza el "mundo al revés": el protagonista en terreno desconocido, donde las reglas son diferentes y debe aprender sobre la marcha.', tension: 6, color: '#9B59B6' },
      { nombre: 'Promesa de la Premisa (20-50%)', descripcion: 'El tramo más entretenido: el protagonista explora el nuevo mundo con curiosidad y primeros éxitos. El lector disfruta del concepto central de la historia. Es lo que hace única a esta historia específica.', tension: 6, color: '#8E44AD' },
      { nombre: 'Punto Medio (50%)', descripcion: 'Falsa victoria o falsa derrota. El protagonista cree haberlo logrado — o que todo está perdido — pero algo está a punto de cambiar. Divide el Acto II: antes era reactivo, ahora se vuelve proactivo.', tension: 7, color: '#E74C3C' },
      { nombre: 'Los Malos se Acercan (50-75%)', descripcion: 'Los antagonistas contraatacan con más fuerza. El protagonista, ahora más activo y seguro de sí, comete errores que empeoran la situación. Su equipo se fractura, sus aliados fallan o lo traicionan.', tension: 8, color: '#C0392B' },
      { nombre: 'Todo Está Perdido (75%)', descripcion: 'El punto más bajo del protagonista: una derrota total, una pérdida definitiva, una traición. A menudo incluye una "muerte" simbólica — del mentor, de la relación central, de la esperanza. Nada puede ser peor.', tension: 9, color: '#922B21' },
      { nombre: 'Noche Oscura del Alma (75-80%)', descripcion: 'El protagonista en su momento más oscuro, solo con sus pensamientos. ¿Quién soy? ¿Qué valoro realmente? ¿De dónde saco fuerzas? La respuesta a estas preguntas lleva a la solución del clímax.', tension: 8, color: '#E74C3C' },
      { nombre: 'Ruptura al Acto III + Clímax (80-100%)', descripcion: 'Nueva idea surgida de la noche oscura. El protagonista actúa con todo lo aprendido. El clímax resuelve los conflictos externo e interno. La imagen de cierre refleja la transformación respecto a la imagen de apertura.', tension: 10, color: '#27AE60' },
    ],
    ejemplo: {
      obra: 'El diablo viste de Prada',
      autor: 'Lauren Weisberger (película de David Frankel)',
      descripcion: 'Catalizador: Andy consigue el imposible trabajo como asistente de Miranda Priestly. Promesa: aprende las reglas del mundo de la moda con éxito creciente, se transforma físicamente. Punto medio: recibe el abrigo de Miranda — falsa victoria, parece haberlo logrado. Los malos se acercan: sacrifica su relación, sus amigos y sus valores por el trabajo. Todo perdido: traiciona a Nigel, su mentor y amigo. Noche oscura: ¿quién quiere ser? Clímax: abandona a Miranda en París y recupera su identidad y sus prioridades.',
    },
  },
  {
    id: 'cinco-actos',
    nombre: 'Estructura en 5 Actos',
    icono: '🎭',
    origen: 'Drama clásico (Séneca, Horacio) — sistematizada por Shakespeare',
    descripcion: 'La estructura del drama clásico occidental. Aunque la Pirámide de Freytag la analiza a posteriori, la estructura de 5 actos tiene una historia propia: cada acto tenía una función dramática específica en el teatro griego y romano, retomada y perfeccionada por el drama isabelino.',
    para: 'Teatro, dramas históricos, novelas de largo aliento con múltiples subtramas y grandes elencos de personajes. Útil también para analizar y entender los clásicos del siglo XIX.',
    etapas: [
      { nombre: 'Acto I — Exposición', descripcion: 'Presenta el mundo, los personajes principales y la situación inicial. Establece el conflicto latente y las relaciones de poder entre los personajes. El incidente desencadenante, al final del acto, rompe el equilibrio inicial.', tension: 2, color: '#3498DB' },
      { nombre: 'Acto II — Complicación', descripcion: 'El conflicto se desarrolla y se complica. Aparecen nuevos obstáculos, alianzas inesperadas y traiciones. Los personajes toman decisiones que empeoran la situación de forma progresiva. Termina con una crisis que eleva la apuesta.', tension: 5, color: '#2E86AB' },
      { nombre: 'Acto III — Clímax', descripcion: 'El punto de mayor tensión dramática. La crisis central alcanza su máxima intensidad: las decisiones del protagonista aquí determinan el desenlace de toda la obra. Es el "punto de no retorno" definitivo e irreversible.', tension: 10, color: '#E74C3C' },
      { nombre: 'Acto IV — Caída y Consecuencias', descripcion: 'Las consecuencias del clímax se desarrollan. En la tragedia, el héroe cae hacia la destrucción de forma irreversible. En la comedia, los enredos se multiplican antes de resolverse. La tensión sigue alta pero es de otro tipo: ya no hay incertidumbre sobre el destino, sino sobre cómo llegará.', tension: 7, color: '#E67E22' },
      { nombre: 'Acto V — Desenlace', descripcion: 'La resolución final. En la tragedia: la catástrofe (muertes, ruina, lamentación y catarsis). En la comedia: el matrimonio, la reconciliación y la celebración del nuevo orden. El mundo queda reconfigurado definitivamente.', tension: 4, color: '#27AE60' },
    ],
    ejemplo: {
      obra: 'Hamlet',
      autor: 'Shakespeare',
      descripcion: 'Acto I: el fantasma del padre de Hamlet revela que el tío Claudio lo asesinó para robarle el trono y a Gertrudis. Acto II: Hamlet finge locura, duda de la veracidad del fantasma y monta la obra de teatro para probar la culpa de Claudio. Acto III: "Ser o no ser", el monólogo central; Hamlet confirma la culpa de Claudio pero mata a Polonio por error — el punto de no retorno. Acto IV: las consecuencias se acumulan: Ofelia enloquece y muere, Laertes regresa con sed de venganza, Hamlet es enviado a Inglaterra para ser ejecutado. Acto V: el duelo final amañado; mueren Gertrudis, Laertes, Claudio y Hamlet. Fortimbrás toma el trono danés.',
    },
  },
];

export default function VisualizadorEstructurasNarrativasPage() {
  const [activa, setActiva] = useState<EstructuraId>('freytag');
  const estructura = ESTRUCTURAS.find((e) => e.id === activa)!;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Estructuras Narrativas</h1>
        <p className={styles.heroSubtitle}>
          6 modelos para arquitecturar tu historia: desde la Pirámide de Freytag hasta el Kishōtenketsu.
          Diagramas de tensión, etapas detalladas y ejemplos literarios.
        </p>
      </header>

      <LegalNotice />

      <nav className={styles.tabsNav} role="tablist" aria-label="Modelos de estructura narrativa">
        {ESTRUCTURAS.map((e) => (
          <button
            key={e.id}
            type="button"
            className={`${styles.tabBtn} ${activa === e.id ? styles.tabBtnActive : ''}`}
            onClick={() => setActiva(e.id)}
            role="tab"
            aria-selected={activa === e.id}
          >
            <span aria-hidden="true">{e.icono}</span>
            <span className={styles.tabBtnNombre}>{e.nombre}</span>
          </button>
        ))}
      </nav>

      <div className={styles.estructuraPanel} role="tabpanel">
        <div className={styles.estructuraHeader}>
          <div>
            <h2 className={styles.estructuraNombre}>
              <span aria-hidden="true">{estructura.icono}</span> {estructura.nombre}
            </h2>
            <p className={styles.estructuraOrigen}>{estructura.origen}</p>
          </div>
        </div>

        <p className={styles.estructuraDesc}>{estructura.descripcion}</p>

        <div className={styles.paraBox}>
          <span className={styles.paraLabel}>Ideal para:</span> {estructura.para}
        </div>

        {/* Diagrama de tensión */}
        <div className={styles.diagramaWrapper}>
          <div className={styles.diagramaEjeY} aria-hidden="true">Tensión</div>
          <div className={styles.diagrama} role="img" aria-label={`Diagrama de tensión de ${estructura.nombre}`}>
            {estructura.etapas.map((etapa, i) => (
              <div key={i} className={styles.diagramaCol}>
                <div
                  className={styles.diagramaBarra}
                  style={{ height: `${etapa.tension * 10}%`, backgroundColor: etapa.color }}
                  title={`${etapa.nombre}: tensión ${etapa.tension}/10`}
                />
                <span className={styles.diagramaLabel}>
                  {etapa.nombre.split('—')[0].split('(')[0].split('/')[0].trim().split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.diagramaEjeX} aria-hidden="true">Avance del relato →</div>
        </div>

        {/* Etapas */}
        <div className={styles.etapasLista}>
          {estructura.etapas.map((etapa, i) => (
            <div key={i} className={styles.etapaCard}>
              <div
                className={styles.etapaNumero}
                style={{ backgroundColor: etapa.color }}
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <div className={styles.etapaContenido}>
                <strong className={styles.etapaNombre}>{etapa.nombre}</strong>
                <p className={styles.etapaDesc}>{etapa.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ejemplo literario */}
        <div className={styles.ejemploBox}>
          <div className={styles.ejemploHeader}>
            <span className={styles.ejemploIcon} aria-hidden="true">📖</span>
            <strong>{estructura.ejemplo.obra}</strong>
            <span className={styles.ejemploAutor}>— {estructura.ejemplo.autor}</span>
          </div>
          <p className={styles.ejemploTexto}>{estructura.ejemplo.descripcion}</p>
        </div>
      </div>

      <EducationalSection
        title="Cómo elegir la estructura adecuada para tu historia"
        subtitle="Guía comparativa y práctica para escritores y analistas literarios"
      >
        <h3>Comparativa de los 6 modelos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Etapas</th>
                <th>Motor narrativo</th>
                <th>Mejor para</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Pirámide de Freytag</td><td>5</td><td>Conflicto + clímax central</td><td>Dramas clásicos, tragedias</td></tr>
              <tr><td>Estructura en 3 Actos</td><td>5 (con giros)</td><td>Dos puntos de giro + punto medio</td><td>Cine, novela comercial, thrillers</td></tr>
              <tr><td>Viaje del Héroe</td><td>10-12</td><td>Transformación del protagonista</td><td>Épica, fantasía, aventura</td></tr>
              <tr><td>Kishōtenketsu</td><td>4</td><td>Sorpresa y yuxtaposición (sin conflicto)</td><td>Cuentos cortos, manga, poesía narrativa</td></tr>
              <tr><td>Save the Cat</td><td>15 beats</td><td>Arco interno + externo sincronizados</td><td>Guiones, novela de género</td></tr>
              <tr><td>5 Actos</td><td>5</td><td>Conflicto trágico con consecuencias inevitables</td><td>Teatro, dramas históricos, clásicos</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Para qué tipo de escritor es cada modelo</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">✍️</span> Escritor primerizo</strong>
            <p>Empezar con la Estructura en 3 Actos o la Pirámide de Freytag. Son los modelos más extendidos en talleres y manuales, y ofrecen una andamiaje claro sin ser demasiado prescriptivos.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🎬</span> Guionista o escritor de género</strong>
            <p>Save the Cat proporciona una hoja de ruta detallada que funciona bien en narrativa comercial y de acción. Permite revisar y ajustar cada beat de forma sistemática.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">📚</span> Escritor literario o experimental</strong>
            <p>El Kishōtenketsu ofrece una alternativa al modelo de conflicto occidental. Útil para cuentos cortos, relatos contemplativos o historias que exploran temas en lugar de resolver problemas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🔍</span> Lector y analista literario</strong>
            <p>El Viaje del Héroe y la Estructura en 5 Actos son los más útiles para analizar obras clásicas. Campbell permite leer mitos y épicas con una lente universal.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes sobre estructuras narrativas</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Tengo que elegir una estructura y seguirla al pie de la letra?</strong>
            <p>No. Las estructuras son herramientas analíticas y de andamiaje, no reglas. Muchos autores las usan de forma intuitiva sin conocerlas por nombre. Conocerlas permite tomar decisiones conscientes, pero seguirlas mecánicamente puede producir historias formulaicas.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre el Viaje del Héroe y la estructura en 3 Actos?</strong>
            <p>El 3 Actos describe qué pasa en la trama (planteamiento, conflicto, resolución). El Viaje del Héroe describe la transformación interna del protagonista a través de un patrón universal. Son compatibles: una misma historia puede analizarse con ambas.</p>
            <div className={styles.faqTip}>El Señor de los Anillos funciona perfectamente con los dos modelos a la vez. No son mutuamente excluyentes.</div>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el Kishōtenketsu y por qué es especial?</strong>
            <p>Es el único modelo de esta lista que no requiere conflicto como motor. En lugar de antagonismo, usa la yuxtaposición y la sorpresa (el "Ten"). Es útil cuando quieres contar una historia cuyo propósito es explorar o revelar algo, no resolver un problema.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Save the Cat solo funciona para cine?</strong>
            <p>Se diseñó para guiones, pero muchos autores de novela lo usan con adaptaciones. Es especialmente útil en narrativa comercial de género (thriller, romance, aventura). Puede resultar demasiado prescriptivo para literatura más experimental.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puedo mezclar modelos?</strong>
            <p>Sí, y es habitual. Un escritor puede estructurar su historia con el 3 Actos y analizar el arco del protagonista con el Viaje del Héroe. Lo importante es entender qué pregunta responde cada modelo antes de aplicarlo.</p>
          </li>
        </ul>

        <h3>Cómo aplicar una estructura a tu historia</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el tipo de historia que quieres contar</strong>
              <p>¿Es una historia de transformación personal? (Viaje del Héroe). ¿Un thriller con golpes de efecto? (Save the Cat). ¿Una reflexión o exploración temática? (Kishōtenketsu). El tipo de historia orienta qué modelo se adapta mejor.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Empieza con el final, no con el principio</strong>
              <p>¿Cómo acaba tu historia? ¿Qué ha cambiado en el protagonista o el mundo? Conocer el destino ayuda a entender qué estructura lo sirve mejor y dónde colocar el clímax.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Mapea los momentos clave antes de escribir</strong>
              <p>Para el modelo elegido, identifica al menos sus puntos de inflexión más importantes (los giros, el clímax, el punto más bajo). No hace falta tenerlo todo: con 3-4 puntos ancla ya puedes orientarte al escribir.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Usa la estructura como diagnóstico, no solo como plan</strong>
              <p>Si tu borrador ya está escrito, aplica el modelo elegido para identificar dónde está la tensión, dónde cae y qué falta. A menudo la estructura es más útil en la revisión que en la planificación.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Ajusta las proporciones a tu historia específica</strong>
              <p>Los porcentajes son orientaciones, no reglas matemáticas. En una novela de 400 páginas, el Acto II puede durar 220 páginas sin problema si la tensión se mantiene. Adapta el modelo a tu historia, no al revés.</p>
            </div>
          </li>
        </ol>

        <h3>Lo que las estructuras no pueden hacer por ti</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💡</span>
            <strong>No generan ideas</strong>
            <p>Una estructura solo organiza material que ya tienes. Si no sabes qué historia quieres contar, ningún modelo te lo dirá. El punto de partida siempre es la idea o el personaje.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎭</span>
            <strong>No garantizan calidad</strong>
            <p>Una historia puede seguir perfectamente la estructura en 3 Actos y ser aburrida. La estructura es condición necesaria pero no suficiente: también necesitas personajes creíbles y prosa efectiva.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Pueden usarse retroactivamente</strong>
            <p>Muchos escritores de proceso libre (pantsers) escriben sin estructura y la aplican en la revisión para diagnosticar qué falta o sobra. La estructura también es una herramienta de revisión.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <strong>No todas las culturas usan el conflicto</strong>
            <p>El modelo de conflicto central es occidental. El Kishōtenketsu muestra que existen alternativas viables. Conocer varios modelos amplía el rango de historias que puedes contar y leer.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <strong>Son descriptivos, no prescriptivos</strong>
            <p>Los modelos fueron extraídos de obras ya escritas (Campbell analizó miles de mitos). Son herramientas descriptivas que se usan de forma prescriptiva: útil si se entiende esa distinción.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes al usar modelos estructurales
          </div>
          <ul className={styles.warningList}>
            <li><span aria-hidden="true">❌</span> Confundir el modelo con la historia: la estructura organiza eventos, pero la historia son los personajes y sus relaciones, no los beats.</li>
            <li><span aria-hidden="true">❌</span> Seguir los porcentajes de forma matemática: el 25% del Acto I en una novela de 600 páginas son 150 páginas, un inicio excesivamente largo si no hay acción.</li>
            <li><span aria-hidden="true">❌</span> Aplicar Save the Cat a todo tipo de historia: funciona bien en narrativa comercial, pero puede asfixiar una novela literaria o experimental.</li>
            <li><span aria-hidden="true">❌</span> Creer que el Kishōtenketsu no tiene estructura: tiene una estructura muy precisa, solo que basada en yuxtaposición en vez de conflicto. No es "escritura libre".</li>
            <li><span aria-hidden="true">❌</span> Ignorar el arco interno del protagonista: la mayoría de modelos tienen una dimensión externa (qué le pasa) y una interna (cómo cambia). Centrarse solo en los eventos externos produce historias planas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estructuras-narrativas')} />
      <ShareCard appName="visualizador-estructuras-narrativas" />
      <Footer appName="visualizador-estructuras-narrativas" />
    </div>
  );
}
