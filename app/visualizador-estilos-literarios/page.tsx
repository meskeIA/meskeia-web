'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './VisualizadorEstilosLiterarios.module.css';
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

interface Autor {
  nombre: string;
  pais: string;
  obras: string[];
  rasgo: string;
}

interface Movimiento {
  id: string;
  nombre: string;
  icono: string;
  periodo: string;
  siglos: string;
  regiones: string[];
  filtroRegion: 'europa' | 'latam' | 'eeuu' | 'universal';
  filtroPeriodo: 'clasico' | 'sxix' | 'sxx' | 'contemporaneo';
  color: string;
  descripcion: string;
  caracteristicas: string[];
  autores: Autor[];
  fragmento: {
    texto: string;
    obra: string;
    autor: string;
    anio: string;
  };
}

type FiltroPeriodo = 'todos' | 'clasico' | 'sxix' | 'sxx' | 'contemporaneo';
type FiltroRegion = 'todas' | 'europa' | 'latam' | 'eeuu' | 'universal';

// ── Datos ──────────────────────────────────────────────────────────────────

const movimientos: Movimiento[] = [
  {
    id: 'clasicismo',
    nombre: 'Neoclasicismo',
    icono: '🏛️',
    periodo: 'Siglos XVII–XVIII',
    siglos: 's.XVII–XVIII',
    regiones: ['Europa'],
    filtroRegion: 'europa',
    filtroPeriodo: 'clasico',
    color: '#8B7355',
    descripcion: 'Movimiento que recupera los ideales estéticos de la Antigüedad greco-latina: orden, razón, equilibrio y propósito moral. La literatura debe enseñar deleitando.',
    caracteristicas: [
      'Predominio de la razón sobre la pasión',
      'Imitación de modelos clásicos grecolatinos',
      'Unidades dramáticas: tiempo, lugar y acción',
      'Propósito didáctico y moral explícito',
      'Claridad, orden y elegancia formal',
      'Géneros jerarquizados: tragedia sobre comedia',
    ],
    autores: [
      { nombre: 'Molière', pais: 'Francia', obras: ['El enfermo imaginario', 'El avaro', 'Tartufo'], rasgo: 'Comedia de costumbres con crítica social aguda' },
      { nombre: 'Voltaire', pais: 'Francia', obras: ['Cándido', 'Zadig', 'Diccionario filosófico'], rasgo: 'Ironía como arma filosófica y política' },
      { nombre: 'Jean Racine', pais: 'Francia', obras: ['Fedra', 'Andrómaca', 'Británico'], rasgo: 'Tragedia clásica con psicología apasionada' },
      { nombre: 'Jonathan Swift', pais: 'Irlanda/Gran Bretaña', obras: ['Los viajes de Gulliver', 'Una modesta proposición'], rasgo: 'Sátira política y social de filo cortante' },
    ],
    fragmento: {
      texto: '«Todo va bien en el mejor de los mundos posibles», decía el doctor Pangloss, y Cándido lo escuchaba con la fe sencilla de quien aún no ha visto demasiado del mundo.',
      obra: 'Cándido',
      autor: 'Voltaire',
      anio: '1759',
    },
  },
  {
    id: 'romanticismo',
    nombre: 'Romanticismo',
    icono: '🌹',
    periodo: 'Finales XVIII – mediados XIX',
    siglos: 's.XVIII–XIX',
    regiones: ['Europa', 'América'],
    filtroRegion: 'europa',
    filtroPeriodo: 'sxix',
    color: '#8B2635',
    descripcion: 'Reacción contra el racionalismo ilustrado. Prima el sentimiento individual, la naturaleza como espejo del alma, la melancolía, el héroe rebelde y el interés por lo medieval y lo exótico.',
    caracteristicas: [
      'Primacía de la emoción y la subjetividad',
      'Idealización de la naturaleza y el paisaje',
      'El héroe romántico: rebelde, solitario, incomprendido',
      'Interés por lo medieval, lo gótico y lo legendario',
      'Melancolía, nostalgia y el mal du siècle',
      'Nacionalismo literario y rescate del folclore',
    ],
    autores: [
      { nombre: 'Victor Hugo', pais: 'Francia', obras: ['Los Miserables', 'Notre-Dame de París', 'Hernani'], rasgo: 'Grandiosidad épica y denuncia social romántica' },
      { nombre: 'Lord Byron', pais: 'Gran Bretaña', obras: ['Don Juan', 'Childe Harold', 'Manfred'], rasgo: 'Encarnación del héroe byroniano: bello y maldito' },
      { nombre: 'G.A. Bécquer', pais: 'España', obras: ['Rimas y Leyendas', 'Cartas desde mi celda'], rasgo: 'Lirismo íntimo y espiritual en verso y prosa' },
      { nombre: 'Edgar Allan Poe', pais: 'EEUU', obras: ['El cuervo', 'El pozo y el péndulo', 'Berenice'], rasgo: 'Gótico psicológico, terror y lo sublime oscuro' },
    ],
    fragmento: {
      texto: '«Podrá nublarse el sol eternamente; podrá secarse en un instante el mar; podrá romperse el eje de la tierra como un débil cristal. ¡Todo sucederá! Pero yo… ¡yo nunca te olvidaré!»',
      obra: 'Rimas',
      autor: 'Gustavo Adolfo Bécquer',
      anio: '1871',
    },
  },
  {
    id: 'realismo',
    nombre: 'Realismo',
    icono: '🔭',
    periodo: 'Mediados – finales del XIX',
    siglos: 's.XIX',
    regiones: ['Europa'],
    filtroRegion: 'europa',
    filtroPeriodo: 'sxix',
    color: '#4A6741',
    descripcion: 'Observación minuciosa y fiel de la realidad social. Retrato de todas las clases sociales, psicología de los personajes y crítica implícita de las convenciones burguesas.',
    caracteristicas: [
      'Representación objetiva y detallada de la realidad',
      'Crítica social de la burguesía y sus hipocresías',
      'Personajes complejos psicológicamente',
      'Narrador omnisciente con distancia irónica',
      'Ambientes urbanos y cotidianos',
      'La novela como documento social',
    ],
    autores: [
      { nombre: 'Gustave Flaubert', pais: 'Francia', obras: ['Madame Bovary', 'La educación sentimental', 'Salammbô'], rasgo: 'El «mot juste»: cada palabra elegida con exactitud quirúrgica' },
      { nombre: 'León Tolstói', pais: 'Rusia', obras: ['Anna Karénina', 'Guerra y Paz', 'La muerte de Iván Ilich'], rasgo: 'Magnitud épica y profundidad moral en la novela rusa' },
      { nombre: 'Benito Pérez Galdós', pais: 'España', obras: ['Fortunata y Jacinta', 'Misericordia', 'Doña Perfecta'], rasgo: 'Crónica de la sociedad española del XIX' },
      { nombre: 'Charles Dickens', pais: 'Gran Bretaña', obras: ['Oliver Twist', 'David Copperfield', 'Grandes esperanzas'], rasgo: 'La pobreza victoriana narrada con humor y compasión' },
    ],
    fragmento: {
      texto: '«Emma no era feliz, no lo había sido nunca. ¿De dónde venía esa insuficiencia de la vida, esa instantánea podredumbre de las cosas en que se apoyaba?»',
      obra: 'Madame Bovary',
      autor: 'Gustave Flaubert',
      anio: '1857',
    },
  },
  {
    id: 'naturalismo',
    nombre: 'Naturalismo',
    icono: '🔬',
    periodo: 'Últimas décadas del XIX',
    siglos: 's.XIX',
    regiones: ['Europa', 'EEUU'],
    filtroRegion: 'europa',
    filtroPeriodo: 'sxix',
    color: '#5D5C5C',
    descripcion: 'Radicalización del Realismo aplicando el método científico a la literatura. El ser humano está determinado por la herencia genética y el entorno social. Temas antes tabú: pobreza extrema, enfermedad, alcoholismo.',
    caracteristicas: [
      'Determinismo: herencia genética + entorno social',
      'Método científico aplicado a la narración',
      'Temas tabú: miseria, alcoholismo, prostitución',
      'Personajes sin libre albedrío ante las fuerzas naturales',
      'Pesimismo sobre la condición humana',
      'Documentación exhaustiva antes de escribir',
    ],
    autores: [
      { nombre: 'Émile Zola', pais: 'Francia', obras: ['Germinal', 'Naná', 'La taberna', 'La bestia humana'], rasgo: 'El ciclo Rougon-Macquart: una familia bajo el determinismo' },
      { nombre: 'Emilia Pardo Bazán', pais: 'España', obras: ['Los Pazos de Ulloa', 'La madre naturaleza'], rasgo: 'Naturalismo con visión crítica y feminista en España' },
      { nombre: 'Thomas Hardy', pais: 'Gran Bretaña', obras: ['Tess de los d\'Urberville', 'Jude el Oscuro'], rasgo: 'El fatalismo rural en la Inglaterra victoriana' },
      { nombre: 'Guy de Maupassant', pais: 'Francia', obras: ['Bola de sebo', 'Una vida', 'El Horla'], rasgo: 'Maestro del cuento con visión desesperanzada' },
    ],
    fragmento: {
      texto: '«Germinal brotaba, como si la tierra entera hubiera sido fecundada por esa semilla de hombres aplastados, y que un día, tal vez, haría reventar la tierra.»',
      obra: 'Germinal',
      autor: 'Émile Zola',
      anio: '1885',
    },
  },
  {
    id: 'modernismo',
    nombre: 'Modernismo',
    icono: '✨',
    periodo: '1880–1920',
    siglos: 's.XIX–XX',
    regiones: ['América Latina', 'España'],
    filtroRegion: 'latam',
    filtroPeriodo: 'sxx',
    color: '#7B5EA7',
    descripcion: 'Movimiento de renovación estética nacido en Hispanoamérica. Prioriza la musicalidad, el simbolismo, la belleza formal y el cosmopolitismo como reacción contra el prosaísmo burgués.',
    caracteristicas: [
      'Refinamiento y musicalidad del verso',
      'Simbolismo: objetos y colores con significado profundo',
      'Cosmopolitismo y exotismo (Oriente, Versalles, Grecia)',
      'Influencia del Simbolismo y Parnasianismo franceses',
      'El poeta como artista frente al mundo industrial',
      'Innovación métrica y riqueza léxica',
    ],
    autores: [
      { nombre: 'Rubén Darío', pais: 'Nicaragua', obras: ['Azul', 'Prosas Profanas', 'Cantos de Vida y Esperanza'], rasgo: 'Fundador del Modernismo hispanoamericano, renovó la poesía en español' },
      { nombre: 'José Martí', pais: 'Cuba', obras: ['Ismaelillo', 'Versos Sencillos', 'Versos Libres'], rasgo: 'Precursor del Modernismo con hondura ética y política' },
      { nombre: 'Antonio Machado', pais: 'España', obras: ['Soledades', 'Campos de Castilla', 'Nuevas canciones'], rasgo: 'Modernismo íntimo que evoluciona hacia la poesía del pueblo' },
      { nombre: 'Juan Ramón Jiménez', pais: 'España', obras: ['Platero y yo', 'Sonetos espirituales', 'Diario de un poeta recién casado'], rasgo: 'Búsqueda de la poesía pura y la belleza absoluta' },
    ],
    fragmento: {
      texto: '«Yo soy aquel que ayer no más decía / el verso azul y la canción profana, / en cuya noche un ruiseñor había / que era alondra de luz por la mañana.»',
      obra: 'Cantos de Vida y Esperanza',
      autor: 'Rubén Darío',
      anio: '1905',
    },
  },
  {
    id: 'vanguardias',
    nombre: 'Vanguardias',
    icono: '🎨',
    periodo: '1910–1940',
    siglos: 's.XX',
    regiones: ['Europa', 'América'],
    filtroRegion: 'europa',
    filtroPeriodo: 'sxx',
    color: '#E8663D',
    descripcion: 'Conjunto de movimientos rupturistas que cuestionan toda tradición literaria y artística. Múltiples «ismos»: Surrealismo, Futurismo, Dadaísmo, Ultraísmo, Creacionismo.',
    caracteristicas: [
      'Ruptura radical con la tradición y el pasado',
      'Experimentación formal: verso libre, tipografía, collage',
      'Irracionalismo: el sueño y el inconsciente como fuente',
      'Imagen como unidad poética autónoma',
      'Manifiestos programáticos de cada corriente',
      'Internacionalismo y diálogo entre artes',
    ],
    autores: [
      { nombre: 'André Breton', pais: 'Francia', obras: ['Manifiesto Surrealista', 'Nadja', 'El amor loco'], rasgo: 'Fundador del Surrealismo: escritura automática y el inconsciente' },
      { nombre: 'Federico García Lorca', pais: 'España', obras: ['Poeta en Nueva York', 'Romancero gitano', 'La casa de Bernarda Alba'], rasgo: 'Surrealismo andaluz que funde imagen poética y tradición popular' },
      { nombre: 'Vicente Huidobro', pais: 'Chile', obras: ['Altazor', 'El espejo de agua', 'Ecuatorial'], rasgo: 'Fundador del Creacionismo: el poeta crea realidad, no la imita' },
      { nombre: 'Pablo Neruda', pais: 'Chile', obras: ['Residencia en la Tierra', 'Veinte poemas de amor', 'Canto General'], rasgo: 'Del Surrealismo hermético a la poesía popular de alcance universal' },
    ],
    fragmento: {
      texto: '«Altazor ¿por qué perdiste tu primera serenidad? / ¿Qué ángel malo se paró en la puerta de tu sonrisa / con la espada en la mano?»',
      obra: 'Altazor',
      autor: 'Vicente Huidobro',
      anio: '1931',
    },
  },
  {
    id: 'existencialismo',
    nombre: 'Existencialismo',
    icono: '🌑',
    periodo: '1930–1960',
    siglos: 's.XX',
    regiones: ['Europa'],
    filtroRegion: 'europa',
    filtroPeriodo: 'sxx',
    color: '#2C3E50',
    descripcion: 'La existencia precede a la esencia: el ser humano no nace con un propósito dado, debe crearlo. Temas centrales: libertad, angustia, responsabilidad, lo absurdo y la autenticidad.',
    caracteristicas: [
      'La existencia precede a la esencia (Sartre)',
      'Libertad radical y responsabilidad total',
      'Lo absurdo: el mundo carece de sentido intrínseco',
      'Angustia ante la libertad y la muerte',
      'Autenticidad vs. mala fe (vivir según los otros)',
      'El otro como problema: «el infierno son los otros»',
    ],
    autores: [
      { nombre: 'Albert Camus', pais: 'Francia/Argelia', obras: ['El extranjero', 'La peste', 'El mito de Sísifo'], rasgo: 'El absurdo como condición humana que hay que abrazar, no negar' },
      { nombre: 'Jean-Paul Sartre', pais: 'Francia', obras: ['La náusea', 'El ser y la nada', 'A puerta cerrada'], rasgo: 'La libertad como condena: estamos obligados a elegir' },
      { nombre: 'Franz Kafka', pais: 'Bohemia/Imperio austrohúngaro', obras: ['La metamorfosis', 'El proceso', 'El castillo'], rasgo: 'Precursor: el individuo atrapado en sistemas incomprensibles' },
      { nombre: 'Simone de Beauvoir', pais: 'Francia', obras: ['El segundo sexo', 'La invitada', 'Los mandarines'], rasgo: 'Existencialismo y feminismo: la mujer construida, no nacida' },
    ],
    fragmento: {
      texto: '«Hoy ha muerto mamá. O quizás ayer. No lo sé. Recibí un telegrama del asilo: "Falleció su madre. Entierro mañana. Sentidas condolencias." Esto no quiere decir nada.»',
      obra: 'El extranjero',
      autor: 'Albert Camus',
      anio: '1942',
    },
  },
  {
    id: 'boom',
    nombre: 'Boom Latinoamericano',
    icono: '🌿',
    periodo: '1960–1975',
    siglos: 's.XX',
    regiones: ['América Latina'],
    filtroRegion: 'latam',
    filtroPeriodo: 'sxx',
    color: '#C0392B',
    descripcion: 'Explosión narrativa de la literatura latinoamericana que conquistó el mundo. Renovación radical de la novela: tiempo no lineal, múltiples narradores, realismo mágico, crítica política.',
    caracteristicas: [
      'Renovación técnica total: tiempo circular, voces múltiples',
      'Realismo mágico: lo sobrenatural como parte de lo real',
      'Dimensión mítica y legendaria de América Latina',
      'Crítica política y social implícita',
      'Proyección internacional desde editoriales españolas',
      'Diálogo con Faulkner, Borges y la vanguardia europea',
    ],
    autores: [
      { nombre: 'Gabriel García Márquez', pais: 'Colombia', obras: ['Cien años de soledad', 'El coronel no tiene quien le escriba', 'El amor en los tiempos del cólera'], rasgo: 'Realismo mágico: Macondo como metáfora de América Latina' },
      { nombre: 'Julio Cortázar', pais: 'Argentina', obras: ['Rayuela', 'Bestiario', 'Final del juego'], rasgo: 'Novela lúdica que cuestiona las convenciones de la lectura' },
      { nombre: 'Carlos Fuentes', pais: 'México', obras: ['La muerte de Artemio Cruz', 'Terra Nostra', 'Aura'], rasgo: 'La historia de México como espejo del presente latinoamericano' },
      { nombre: 'Mario Vargas Llosa', pais: 'Perú', obras: ['La ciudad y los perros', 'Conversación en La Catedral', 'La casa verde'], rasgo: 'Estructura novelesca compleja y crítica del poder' },
    ],
    fragmento: {
      texto: '«Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.»',
      obra: 'Cien años de soledad',
      autor: 'Gabriel García Márquez',
      anio: '1967',
    },
  },
  {
    id: 'beat',
    nombre: 'Generación Beat',
    icono: '🎷',
    periodo: '1950–1960',
    siglos: 's.XX',
    regiones: ['EEUU'],
    filtroRegion: 'eeuu',
    filtroPeriodo: 'sxx',
    color: '#1A3A4A',
    descripcion: 'Movimiento contracultural estadounidense que rechaza los valores burgueses de posguerra. Itinerancia, jazz, espiritualidad oriental, drogas y una prosa urgente como extensión del ritmo musical.',
    caracteristicas: [
      'Rechazo del «american dream» y la conformidad burguesa',
      'Escritura espontánea inspirada en el jazz de Charlie Parker',
      'Itinerancia como modo de vida y búsqueda espiritual',
      'Influencia del budismo zen y el misticismo oriental',
      'Lenguaje coloquial, urgente, sin filtros académicos',
      'Comunidad de amigos que se leen, critican y publican',
    ],
    autores: [
      { nombre: 'Jack Kerouac', pais: 'EEUU', obras: ['En el camino', 'Los subterráneos', 'El dharma de los vagabundos'], rasgo: 'El «prosa espontánea»: rollo de papel y escritura sin parar' },
      { nombre: 'Allen Ginsberg', pais: 'EEUU', obras: ['Aullido', 'Kaddish', 'América'], rasgo: 'Largo aliento whitmaniano contra la hipocresía de la sociedad' },
      { nombre: 'William S. Burroughs', pais: 'EEUU', obras: ['El almuerzo desnudo', 'Nova Express', 'Queer'], rasgo: 'Cut-up: texto fragmentado que desintegra la narrativa lineal' },
      { nombre: 'Lawrence Ferlinghetti', pais: 'EEUU', obras: ['Un jardín de luz solar', 'Una mirada coney island de la mente'], rasgo: 'Editor, poeta y motor del movimiento desde la City Lights' },
    ],
    fragmento: {
      texto: '«Vi las mejores mentes de mi generación destruidas por la locura, hambrientas histéricas desnudas, arrastrándose por las calles de los negros al amanecer buscando una dosis furiosa.»',
      obra: 'Aullido',
      autor: 'Allen Ginsberg',
      anio: '1956',
    },
  },
  {
    id: 'posmodernismo',
    nombre: 'Literatura Posmoderna',
    icono: '🪞',
    periodo: '1970–presente',
    siglos: 's.XX–XXI',
    regiones: ['Universal'],
    filtroRegion: 'universal',
    filtroPeriodo: 'contemporaneo',
    color: '#16A085',
    descripcion: 'La literatura como juego de espejos: metaficción, intertextualidad, ironía y relativismo. Cuestiona la autoría, el canon y las grandes narrativas. Mezcla géneros y niveles de cultura.',
    caracteristicas: [
      'Metaficción: la obra habla de sí misma como construcción',
      'Intertextualidad: diálogo consciente con otros textos',
      'Ironía y parodia de los géneros establecidos',
      'Relativismo: no hay verdades absolutas ni voces únicas',
      'Mezcla de cultura alta y popular',
      'Cuestionamiento de la autoría y el narrador fiable',
    ],
    autores: [
      { nombre: 'Italo Calvino', pais: 'Italia', obras: ['Si una noche de invierno un viajero', 'Las ciudades invisibles', 'El barón rampante'], rasgo: 'Metaficción lúdica: el lector como personaje de la novela' },
      { nombre: 'Umberto Eco', pais: 'Italia', obras: ['El nombre de la rosa', 'El péndulo de Foucault', 'El cementerio de Praga'], rasgo: 'Novela histórica intelectual como laberinto intertextual' },
      { nombre: 'Jorge Luis Borges', pais: 'Argentina', obras: ['Ficciones', 'El Aleph', 'El libro de arena'], rasgo: 'Precursor y maestro: el cuento como argumento filosófico' },
      { nombre: 'Paul Auster', pais: 'EEUU', obras: ['Trilogía de Nueva York', 'El libro de las ilusiones', 'La música del azar'], rasgo: 'Identidad, azar y narración en la ciudad contemporánea' },
    ],
    fragmento: {
      texto: '«Estás a punto de empezar a leer la nueva novela de Italo Calvino, Si una noche de invierno un viajero. Relájate. Concéntrate. Aleja de ti todos los demás pensamientos.»',
      obra: 'Si una noche de invierno un viajero',
      autor: 'Italo Calvino',
      anio: '1979',
    },
  },
];

const FILTROS_PERIODO: { id: FiltroPeriodo; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'clasico', label: 'S.XVII–XVIII' },
  { id: 'sxix', label: 'S.XIX' },
  { id: 'sxx', label: 'S.XX' },
  { id: 'contemporaneo', label: 'Contemporáneo' },
];

const FILTROS_REGION: { id: FiltroRegion; label: string }[] = [
  { id: 'todas', label: 'Todas las regiones' },
  { id: 'europa', label: 'Europa' },
  { id: 'latam', label: 'América Latina' },
  { id: 'eeuu', label: 'EEUU' },
  { id: 'universal', label: 'Universal' },
];

// ── Componente ─────────────────────────────────────────────────────────────

export default function VisualizadorEstilosLiterariosPage() {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('todos');
  const [filtroRegion, setFiltroRegion] = useState<FiltroRegion>('todas');

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter(m => {
      const okPeriodo = filtroPeriodo === 'todos' || m.filtroPeriodo === filtroPeriodo;
      const okRegion = filtroRegion === 'todas' || m.filtroRegion === filtroRegion;
      return okPeriodo && okRegion;
    });
  }, [filtroPeriodo, filtroRegion]);

  const movimientoActual = seleccionado
    ? movimientos.find(m => m.id === seleccionado) ?? null
    : null;

  const handleVolver = () => setSeleccionado(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📚 Estilos y Movimientos Literarios</h1>
        <p className={styles.subtitle}>De la Ilustración al Posmodernismo — autores, obras y fragmentos</p>
      </header>

      <LegalNotice />

      {/* ── Vista detalle ── */}
      {movimientoActual && (
        <div className={styles.detalle}>
          <button className={styles.btnVolver} onClick={handleVolver} type="button" aria-label="Volver al listado">
            ← Todos los movimientos
          </button>

          <div className={styles.detalleHeader} style={{ background: movimientoActual.color }}>
            <span className={styles.detalleIcono} aria-hidden="true">{movimientoActual.icono}</span>
            <div>
              <h2 className={styles.detalleNombre}>{movimientoActual.nombre}</h2>
              <div className={styles.detalleMeta}>
                <span className={styles.detallePeriodo}>🕰️ {movimientoActual.periodo}</span>
                {movimientoActual.regiones.map(r => (
                  <span key={r} className={styles.detalleRegion}>🌍 {r}</span>
                ))}
              </div>
            </div>
          </div>

          <p className={styles.detalleDescripcion}>{movimientoActual.descripcion}</p>

          <div className={styles.detalleGrid}>
            {/* Características */}
            <div className={styles.detalleCard}>
              <h3 className={styles.detalleCardTitle}>📌 Características</h3>
              <ul className={styles.caracteristicasList}>
                {movimientoActual.caracteristicas.map((c, i) => (
                  <li key={i} className={styles.caracteristicaItem}>
                    <span style={{ color: movimientoActual.color }} aria-hidden="true">▸</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fragmento */}
            <div className={styles.detalleCard}>
              <h3 className={styles.detalleCardTitle}>💬 Fragmento representativo</h3>
              <blockquote className={styles.fragmento} style={{ borderColor: movimientoActual.color }}>
                <p className={styles.fragmentoTexto}>{movimientoActual.fragmento.texto}</p>
                <footer className={styles.fragmentoAtribucion}>
                  — <cite>{movimientoActual.fragmento.autor}</cite>,{' '}
                  <em>{movimientoActual.fragmento.obra}</em>{' '}
                  ({movimientoActual.fragmento.anio})
                </footer>
              </blockquote>
            </div>
          </div>

          {/* Autores */}
          <div className={styles.autoresSection}>
            <h3 className={styles.detalleCardTitle}>✍️ Autores representativos</h3>
            <div className={styles.autoresGrid}>
              {movimientoActual.autores.map(autor => (
                <div key={autor.nombre} className={styles.autorCard} style={{ borderTopColor: movimientoActual.color }}>
                  <div className={styles.autorHeader}>
                    <strong className={styles.autorNombre}>{autor.nombre}</strong>
                    <span className={styles.autorPais}>{autor.pais}</span>
                  </div>
                  <p className={styles.autorRasgo}>{autor.rasgo}</p>
                  <div className={styles.autorObras}>
                    {autor.obras.map((o, i) => (
                      <span key={i} className={styles.obraTag}>📖 {o}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className={styles.btnVolverBottom} onClick={handleVolver} type="button">
            ← Volver al listado
          </button>
        </div>
      )}

      {/* ── Vista listado ── */}
      {!movimientoActual && (
        <>
          {/* Filtros */}
          <div className={styles.filtros}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Período:</span>
              <div className={styles.filtroBotones} role="group" aria-label="Filtrar por período">
                {FILTROS_PERIODO.map(f => (
                  <button
                    key={f.id}
                    className={[styles.filtroBtn, filtroPeriodo === f.id ? styles.filtroBtnActivo : ''].join(' ')}
                    onClick={() => setFiltroPeriodo(f.id)}
                    aria-pressed={filtroPeriodo === f.id}
                    type="button"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Región:</span>
              <div className={styles.filtroBotones} role="group" aria-label="Filtrar por región">
                {FILTROS_REGION.map(f => (
                  <button
                    key={f.id}
                    className={[styles.filtroBtn, filtroRegion === f.id ? styles.filtroBtnActivo : ''].join(' ')}
                    onClick={() => setFiltroRegion(f.id)}
                    aria-pressed={filtroRegion === f.id}
                    type="button"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {movimientosFiltrados.length === 0 && (
            <p className={styles.sinResultados}>No hay movimientos para esta combinación de filtros.</p>
          )}

          {/* Grid de tarjetas */}
          <div className={styles.movimientosGrid}>
            {movimientosFiltrados.map(m => (
              <button
                key={m.id}
                className={styles.movimientoCard}
                onClick={() => setSeleccionado(m.id)}
                type="button"
                style={{ borderTopColor: m.color }}
                aria-label={`Ver ${m.nombre}`}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcono} aria-hidden="true">{m.icono}</span>
                  <div>
                    <h2 className={styles.cardNombre}>{m.nombre}</h2>
                    <p className={styles.cardPeriodo}>{m.siglos}</p>
                  </div>
                </div>
                <p className={styles.cardDesc}>{m.descripcion}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.cardRegiones}>
                    {m.regiones.map(r => (
                      <span key={r} className={styles.regionBadge}>{r}</span>
                    ))}
                  </div>
                  <span className={styles.cardAutores}>{m.autores.length} autores →</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection
        title="📖 Guía completa de la literatura universal"
        subtitle="Todo lo que necesitas saber para acercarte a los grandes movimientos"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Los 10 movimientos de un vistazo</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Movimiento</th>
                  <th>Período</th>
                  <th>Origen</th>
                  <th>Clave estética</th>
                  <th>Primera lectura</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🏛️ Neoclasicismo</strong></td>
                  <td>S.XVII–XVIII</td>
                  <td>Europa</td>
                  <td>Razón, orden, didáctica</td>
                  <td><em>Cándido</em> — Voltaire</td>
                </tr>
                <tr>
                  <td><strong>🌹 Romanticismo</strong></td>
                  <td>S.XVIII–XIX</td>
                  <td>Europa</td>
                  <td>Emoción, naturaleza, rebeldía</td>
                  <td><em>Rimas y Leyendas</em> — Bécquer</td>
                </tr>
                <tr>
                  <td><strong>🔭 Realismo</strong></td>
                  <td>S.XIX</td>
                  <td>Europa</td>
                  <td>Observación, crítica social</td>
                  <td><em>Madame Bovary</em> — Flaubert</td>
                </tr>
                <tr>
                  <td><strong>🔬 Naturalismo</strong></td>
                  <td>S.XIX</td>
                  <td>Europa</td>
                  <td>Determinismo, tabú, método científico</td>
                  <td><em>Germinal</em> — Zola</td>
                </tr>
                <tr>
                  <td><strong>✨ Modernismo</strong></td>
                  <td>1880–1920</td>
                  <td>Hispanoamérica</td>
                  <td>Musicalidad, simbolismo, belleza</td>
                  <td><em>Versos Sencillos</em> — Martí</td>
                </tr>
                <tr>
                  <td><strong>🎨 Vanguardias</strong></td>
                  <td>1910–1940</td>
                  <td>Europa/América</td>
                  <td>Ruptura, experimento, inconsciente</td>
                  <td><em>Poeta en Nueva York</em> — Lorca</td>
                </tr>
                <tr>
                  <td><strong>🌑 Existencialismo</strong></td>
                  <td>1930–1960</td>
                  <td>Europa</td>
                  <td>Absurdo, libertad, angustia</td>
                  <td><em>El extranjero</em> — Camus</td>
                </tr>
                <tr>
                  <td><strong>🌿 Boom Latinoam.</strong></td>
                  <td>1960–1975</td>
                  <td>América Latina</td>
                  <td>Realismo mágico, innovación total</td>
                  <td><em>El coronel no tiene quien le escriba</em> — García Márquez</td>
                </tr>
                <tr>
                  <td><strong>🎷 Generación Beat</strong></td>
                  <td>1950–1960</td>
                  <td>EEUU</td>
                  <td>Espontaneidad, jazz, contracultura</td>
                  <td><em>En el camino</em> — Kerouac</td>
                </tr>
                <tr>
                  <td><strong>🪞 Posmodernismo</strong></td>
                  <td>1970–hoy</td>
                  <td>Universal</td>
                  <td>Metaficción, ironía, intertextualidad</td>
                  <td><em>El nombre de la rosa</em> — Eco</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa esta guía y para qué?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
                <h3>Estudiante de bachillerato o selectividad</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Necesidad:</strong> entender el contexto de un texto de comentario antes del examen.</p>
              </div>
              <p className={styles.escenarioTip}><strong>Cómo usar esta guía:</strong> identifica el movimiento por fecha y región, lee las características y comprueba que el texto encaja. Realismo (segunda mitad del XIX, Europa, crítica social) suele ser el más frecuente en selectividad española.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">📖</span>
                <h3>Lector curioso que quiere ampliar horizontes</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Necesidad:</strong> ha leído un par de libros y quiere entender qué leer a continuación.</p>
              </div>
              <p className={styles.escenarioTip}><strong>Cómo usar esta guía:</strong> si te gustó <em>Cien años de soledad</em>, el Boom Latinoamericano te llevará a Cortázar y Fuentes. Si te atrapó <em>El extranjero</em>, el Existencialismo te abrirá a Sartre y Kafka.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">✍️</span>
                <h3>Escritor en formación</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Necesidad:</strong> busca influencias conscientes para su propia voz narrativa.</p>
              </div>
              <p className={styles.escenarioTip}><strong>Cómo usar esta guía:</strong> estudia los rasgos estilísticos del movimiento que más resuena contigo (Flaubert para la precisión, Kerouac para la urgencia rítmica, Calvino para la estructura experimental). Luego lee un libro completo del representante principal.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">👩‍🏫</span>
                <h3>Docente o guía de lectura</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Necesidad:</strong> explicar el contexto de una obra a un grupo sin conocimiento previo.</p>
              </div>
              <p className={styles.escenarioTip}><strong>Cómo usar esta guía:</strong> usa el fragmento representativo como punto de entrada en el aula. La primera frase de <em>El extranjero</em> o la apertura de <em>Cien años de soledad</em> son puertas perfectas para discutir el estilo antes de leer la obra completa.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre movimientos literarios</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿El «Modernismo» en español es lo mismo que el «Modernism» en inglés?</h4>
              <p>No, y es una de las confusiones más frecuentes. El <strong>Modernismo hispanoamericano</strong> (Rubén Darío, 1888–1920) es un movimiento de refinamiento estético que nace en América Latina y se centra en la musicalidad y el simbolismo. El <strong>Modernism anglosajón</strong> (Joyce, Woolf, Eliot, 1910–1940) es una corriente de experimentación narrativa y concienciación social. Son contemporáneos, comparten algunas influencias simbolistas, pero son movimientos distintos con estéticas muy diferentes.</p>
              <p className={styles.faqTip}>💡 En exámenes españoles, «Modernismo» siempre se refiere al hispanoamericano de Darío. En bibliografía anglosajona, «Modernism» es Joyce y Woolf.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuál es la diferencia entre Realismo y Naturalismo?</h4>
              <p>El Naturalismo es una radicalización del Realismo. Comparten la observación minuciosa de la realidad y la crítica social, pero el Naturalismo añade el <strong>determinismo</strong>: los personajes no tienen libre albedrío, están atrapados por su herencia genética y su entorno. Mientras Flaubert observa a Emma Bovary con distancia irónica (Realismo), Zola convierte a sus personajes en casos científicos que no pueden escapar de sus condiciones (Naturalismo). El tono también cambia: el Realismo puede ser mordaz pero esperanzador; el Naturalismo tiende al pesimismo sin salida.</p>
              <p className={styles.faqTip}>💡 Pregunta clave: ¿puede el protagonista cambiar su destino? Sí → probablemente Realismo. No → probablemente Naturalismo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Borges es posmoderno, surrealista o un movimiento aparte?</h4>
              <p>Borges es un caso único que no encaja perfectamente en ninguna etiqueta. Escribió su obra central (Ficciones, El Aleph) entre los 1940 y 1960, antes de que el Posmodernismo se definiera como movimiento. Sin embargo, sus temas — metaficción, laberintos de sentido, intertextualidad, cuestionamiento de la autoría — son tan fundacionales del Posmodernismo que se le considera su principal precursor. Al mismo tiempo, su dominio del lenguaje y su clasicismo formal lo alejan del Surrealismo. Lo más honesto es considerarlo una categoría en sí mismo: borgesiano.</p>
              <p className={styles.faqTip}>💡 Regla práctica: si un texto trata el universo como biblioteca o el tiempo como laberinto, Borges está en el árbol genealógico.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿El Realismo Mágico es solo latinoamericano?</h4>
              <p>El término fue acuñado por el crítico alemán Franz Roh (1925) para describir la pintura europea, y el escritor venezolano Arturo Uslar Pietri lo aplicó a la literatura latinoamericana en 1948. Aunque García Márquez, Carpentier y Asturias son sus exponentes más conocidos, hay tradiciones similares en la literatura africana (Amos Tutuola), india (Salman Rushdie), checa (Milan Kundera) y japonesa (Haruki Murakami). Lo que hace específico el Realismo Mágico latinoamericano es que lo sobrenatural no se explica ni se justifica — simplemente sucede, integrado en la realidad cotidiana de los personajes.</p>
              <p className={styles.faqTip}>💡 Diferencia clave con la fantasía: en la fantasía existe un mundo alternativo; en el Realismo Mágico, lo maravilloso convive sin tensión con lo cotidiano.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Kafka es existencialista?</h4>
              <p>Kafka (1883–1924) murió antes de que el Existencialismo se definiera como movimiento filosófico (Sartre publica <em>El ser y la nada</em> en 1943). Sin embargo, sus temas — el individuo atrapado en sistemas incomprensibles, la culpa sin causa, la alienación — anticipan tan perfectamente las preocupaciones existencialistas que Sartre y Camus lo reivindicaron como precursor. Lo más preciso es decir que Kafka es un autor proto-existencialista o que pertenece al expresionismo alemán — y que su influencia sobre el Existencialismo literario fue determinante.</p>
              <p className={styles.faqTip}>💡 Si quieres entender el Existencialismo, lee primero <em>La metamorfosis</em> de Kafka (40 páginas). Funciona como portal perfecto.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Los movimientos literarios tienen fechas de inicio y fin precisas?</h4>
              <p>No. Las fechas que usamos son convenciones académicas, no fronteras reales. Los movimientos se solapan, conviven y evolucionan. Flaubert (Realismo) se publicó al mismo tiempo que los últimos románticos. El Boom Latinoamericano tiene raíces en Borges (1940s) y sigue influyendo hoy. Muchos autores pertenecen a varios movimientos según la época de su obra (el Neruda surrealista de <em>Residencia en la Tierra</em> es muy diferente al Neruda popular de <em>Odas Elementales</em>). Las etiquetas son herramientas para orientarse, no jaulas.</p>
              <p className={styles.faqTip}>💡 Mejor pregunta que «¿de qué movimiento es este libro?»: «¿qué características de este movimiento reconozco en este texto?»</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por dónde empezar si nunca he leído literatura «clásica»?</h4>
              <p>La entrada más accesible depende de lo que te interese. Para el XIX: <em>El coronel no tiene quien le escriba</em> (García Márquez, 100 páginas, perfección narrativa). Para el XIX europeo: <em>Madame Bovary</em> o <em>La muerte de Iván Ilich</em> (Tolstói, 80 páginas). Para el siglo XX europeo: <em>El extranjero</em> (Camus, 130 páginas). Para la poesía: los <em>Veinte poemas de amor</em> (Neruda) o las <em>Rimas</em> (Bécquer). La clave es empezar con obras cortas de autores reconocidos — la extensión no es virtud literaria.</p>
              <p className={styles.faqTip}>💡 Regla: si tras 50 páginas un libro no te engancha, no es obligatorio terminarlo. Hay miles de libros excelentes; la vida es corta.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia a la Generación Beat del hippismo?</h4>
              <p>La Generación Beat (1950s) es un fenómeno literario e intelectual de escritores con formación universitaria (Kerouac estudió en Columbia, Ginsberg también) que rechazaban la conformidad americana de posguerra. El hippismo (1960s) fue un movimiento social masivo y de masas que bebió de los Beat pero los transformó en cultura popular. Los Beat eran escritores que vivían en los márgenes; los hippies fueron un fenómeno político y contracultural más amplio. Kerouac, paradójicamente, era políticamente conservador y rechazó ser considerado padre del movimiento hippie.</p>
              <p className={styles.faqTip}>💡 Los Beat son a los hippies lo que Nietzsche al nazismo: una influencia que los sucesores malinterpretaron o simplificaron.</p>
            </div>
          </div>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo acercarte a un movimiento que no conoces</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>Lee las características antes de leer la obra</h4>
                <p>Saber de antemano que el Naturalismo aplica el determinismo o que las Vanguardias rompen con la lógica te prepara para recibir el texto sin confusión. Lo que sin contexto parece arbitrario, con contexto se vuelve intencional.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>Empieza por la obra más corta o accesible del movimiento</h4>
                <p>No empieces el Realismo por <em>Guerra y Paz</em> (1.200 páginas). Empieza por <em>La muerte de Iván Ilich</em> (80 páginas, Tolstói) o <em>Boule de Suif</em> (Maupassant, cuento). La extensión no es profundidad — las obras breves suelen condensar el estilo con más precisión.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>Lee activamente: anota lo que reconoces</h4>
                <p>Mientras lees, subraya o anota frases que encajen con las características del movimiento. «Esta descripción de la miseria es determinista» (Naturalismo). «Este narrador no sabe lo que piensan otros personajes» (3.ª limitada, Realismo). La lectura analítica acelera la comprensión del estilo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>Lee sobre el contexto histórico después (no antes)</h4>
                <p>Leer el texto primero y la historia después evita que el contexto sustituya a la experiencia literaria. Una vez has leído <em>Germinal</em>, investigar la Revolución Industrial y las huelgas mineras del siglo XIX te enriquece la obra — no al revés.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>Compara con otro movimiento que ya conozcas</h4>
                <p>El conocimiento literario es relacional. Si ya conoces el Romanticismo y lees el Realismo, notarás el contraste: el héroe romántico exaltado se convierte en el burgués mediocre. La distancia entre movimientos es donde se revela la evolución de la literatura como arte.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <h4>Lee un segundo autor del mismo movimiento</h4>
                <p>Un movimiento no es un autor. Leer solo a Zola del Naturalismo es como juzgar el jazz escuchando solo a Miles Davis. El segundo autor del mismo movimiento revela la variedad interna: Pardo Bazán es naturalista, pero su feminismo y su catolicismo crean un Naturalismo muy diferente al de Zola.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Tips */}
        <section className={styles.guideSection}>
          <h2>6 claves para leer mejor la literatura universal</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Confía en el fragmento antes que en el resumen</h4>
              <p>Leer 3 páginas de un libro te dice más sobre su estilo que 10 páginas de resumen. Las primeras líneas de una novela son el carnet de identidad del autor.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Las etiquetas son mapas, no territorios</h4>
              <p>Ningún gran autor cabe del todo en una categoría. Usa los movimientos como punto de entrada, no como destino final. Lo interesante es siempre lo que se escapa de la etiqueta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Lee traducciones buenas, no cualquiera</h4>
              <p>Proust mal traducido no es Proust. Antes de comprar una traducción, busca quién la tradujo y lee reseñas específicas de esa edición. En español hay excelentes traductores: las diferencias son enormes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>La dificultad disminuye con la familiaridad</h4>
              <p>Kafka parece hermético la primera vez; al tercer relato, su lógica se vuelve natural. Los estilos difíciles tienen una curva de aprendizaje real que vale la pena superar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Lee en voz alta los fragmentos de poesía</h4>
              <p>El Modernismo de Darío o las Vanguardias de Lorca fueron escritos para ser escuchados. La musicalidad se pierde en la lectura silenciosa. Leer en voz alta una estrofa revela su arquitectura sonora.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">✅</span>
              <h4>Mezcla épocas en tu lista de lecturas</h4>
              <p>Una lista de lecturas solo contemporánea priva de perspectiva histórica. Una lista solo clásica puede resultar árida sin el contraste moderno. El diálogo entre autores de distintas épocas enriquece la comprensión de ambos.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <h3>Errores frecuentes al estudiar literatura</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>❌ Confundir al autor con el narrador:</strong> Flaubert no es Emma Bovary, y Camus no es Meursault. El autor construye el narrador; el narrador no habla por el autor. Interpretarlo literalmente lleva a errores de análisis graves.
            </li>
            <li>
              <strong>❌ Memorizar fechas y no leer los textos:</strong> saber que el Realismo es 1850–1900 sin haber leído una página de Flaubert o Galdós es conocimiento decorativo. Las fechas son esqueleto; los textos son la carne.
            </li>
            <li>
              <strong>❌ Asumir que «difícil» significa «mejor»:</strong> Proust es más difícil que Hemingway, pero no es mejor. La dificultad es una característica estilística, no un criterio de valor. Grandes obras de la literatura universal son de lectura fluida.
            </li>
            <li>
              <strong>❌ Ignorar la literatura en español por el sesgo anglosajón:</strong> García Márquez, Borges, Lorca, Cervantes y Sor Juana Inés de la Cruz son literatura universal de primer nivel. El canon anglófono no es el único canon.
            </li>
            <li>
              <strong>❌ Leer el resumen en lugar del libro:</strong> los resúmenes destruyen el ritmo, la voz y el estilo — que son la literatura. Un resumen de <em>Madame Bovary</em> es «mujer infeliz se suicida». El libro es otra cosa completamente.
            </li>
            <li>
              <strong>❌ Creer que los movimientos son estancos y sucesivos:</strong> en 1890 coexistían en París: naturalistas (Zola), simbolistas (Mallarmé), modernistas hispanoamericanos (Darío) e impresionistas. La historia literaria no es lineal, es simultánea y geográficamente diversa.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estilos-literarios')} />
      <ShareCard appName="visualizador-estilos-literarios" />
      <Footer appName="visualizador-estilos-literarios" />
    </div>
  );
}
