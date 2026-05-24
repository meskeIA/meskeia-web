'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './VisualizadorGenerosNovela.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

type FiltroBusco = 'todos' | 'suspense' | 'mundos' | 'personajes' | 'ideas' | 'emocion' | 'historia';

interface AutorObra {
  nombre: string;
  obra: string;
}

interface LecturaEntrada {
  titulo: string;
  autor: string;
  por: string;
}

interface GeneroNovela {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  tagline: string;
  descripcion: string;
  queBusca: FiltroBusco[];
  caracteristicas: string[];
  autores: AutorObra[];
  lecturasEntrada: LecturaEntrada[];
  subgeneros: string[];
  atmosfera: string;
}

const GENEROS: GeneroNovela[] = [
  {
    id: 'novela-negra',
    nombre: 'Novela Negra',
    emoji: '🔍',
    color: '#2C3E50',
    tagline: 'Para el lector que disfruta de crímenes, ambientes urbanos y personajes al límite moral',
    descripcion: 'Nacida en la América de entreguerras, la novela negra sitúa el crimen en un mundo social corrupto y realista, lejos de los acertijos elegantes del relato policial clásico. El detective suele ser un antihéroe cínico que navega entre la violencia y la moral ambigua de una sociedad que falla.',
    queBusca: ['suspense', 'personajes'],
    caracteristicas: [
      'Ambiente urbano oscuro y atmósfera opresiva',
      'Detective o investigador como protagonista moralmente ambiguo',
      'Crítica social implícita o explícita',
      'Crimen como síntoma de un sistema corrupto',
      'Ritmo ágil y diálogos secos y directos',
    ],
    autores: [
      { nombre: 'Raymond Chandler', obra: 'El largo adiós' },
      { nombre: 'Dashiell Hammett', obra: 'El halcón maltés' },
      { nombre: 'James Ellroy', obra: 'L.A. Confidential' },
      { nombre: 'Stieg Larsson', obra: 'Los hombres que no amaban a las mujeres' },
    ],
    lecturasEntrada: [
      { titulo: 'El largo adiós', autor: 'Raymond Chandler', por: 'La escritura más elegante del género y el detective Marlowe en estado puro' },
      { titulo: 'La chica del tren', autor: 'Paula Hawkins', por: 'Entrada accesible al thriller negro contemporáneo con narrador poco fiable' },
      { titulo: 'Sin novedad en el frente del crimen', autor: 'Maj Sjöwall y Per Wahlöö', por: 'La trilogía que inventó el nórdico negro' },
    ],
    subgeneros: ['Nórdico negro', 'Noir francés', 'Procedimiento policial', 'Crime fiction femenino'],
    atmosfera: 'Lluvia sobre asfalto, humo de cigarrillo y verdades incómodas',
  },
  {
    id: 'terror',
    nombre: 'Terror',
    emoji: '👻',
    color: '#7B241C',
    tagline: 'Para el lector que busca el miedo controlado, la tensión y lo inexplicable',
    descripcion: 'El terror explora los miedos más profundos de la experiencia humana: la muerte, la pérdida de control, lo desconocido y la amenaza a lo familiar. Puede ser sobrenatural o psicológico, pero su objetivo siempre es provocar una respuesta física en el lector: el corazón acelerado, el pelo de punta.',
    queBusca: ['suspense', 'emocion'],
    caracteristicas: [
      'Construcción deliberada de tensión y atmósfera opresiva',
      'Amenaza que desestabiliza el mundo ordinario del protagonista',
      'Uso del miedo como herramienta de exploración psicológica',
      'Lo sobrenatural como metáfora de traumas o ansiedades reales',
      'Clímax de alta intensidad emocional',
    ],
    autores: [
      { nombre: 'Stephen King', obra: 'El resplandor' },
      { nombre: 'H.P. Lovecraft', obra: 'La llamada de Cthulhu' },
      { nombre: 'Shirley Jackson', obra: 'La maldición de Hill House' },
      { nombre: 'Ito Junji', obra: 'Uzumaki (manga de terror)' },
    ],
    lecturasEntrada: [
      { titulo: 'El resplandor', autor: 'Stephen King', por: 'Terror psicológico puro que define el género moderno' },
      { titulo: 'La maldición de Hill House', autor: 'Shirley Jackson', por: 'Terror literario con una prosa extraordinaria, más inquietante que violenta' },
      { titulo: 'Drácula', autor: 'Bram Stoker', por: 'El origen del terror gótico moderno, narrado mediante cartas y diarios' },
    ],
    subgeneros: ['Terror psicológico', 'Horror cósmico', 'Terror sobrenatural', 'Slasher literario', 'Gothic horror'],
    atmosfera: 'La oscuridad que se mueve, el ruido que no debería estar ahí',
  },
  {
    id: 'ciencia-ficcion',
    nombre: 'Ciencia Ficción',
    emoji: '🚀',
    color: '#1A5276',
    tagline: 'Para el lector que quiere explorar futuros posibles y preguntas sobre la humanidad',
    descripcion: 'La ciencia ficción usa la especulación tecnológica o científica como punto de partida para explorar qué significa ser humano, cómo funcionan las sociedades y hacia dónde vamos. Las mejores obras del género no son predicciones del futuro: son espejos del presente.',
    queBusca: ['ideas', 'mundos'],
    caracteristicas: [
      'Extrapolación de ciencia o tecnología real o plausible',
      'Mundo construido con lógica interna coherente',
      'Exploración de consecuencias sociales o éticas de la tecnología',
      'Sentido de la maravilla (sense of wonder) ante lo desconocido',
      'El ser humano frente a fuerzas más grandes que él',
    ],
    autores: [
      { nombre: 'Isaac Asimov', obra: 'Fundación' },
      { nombre: 'Philip K. Dick', obra: '¿Sueñan los androides con ovejas eléctricas?' },
      { nombre: 'Ursula K. Le Guin', obra: 'La mano izquierda de la oscuridad' },
      { nombre: 'Arthur C. Clarke', obra: '2001: Una odisea espacial' },
    ],
    lecturasEntrada: [
      { titulo: 'Fundación', autor: 'Isaac Asimov', por: 'La saga que define la space opera y la caída de civilizaciones' },
      { titulo: 'El marciano', autor: 'Andy Weir', por: 'Ciencia ficción hard accesible, tensa y con gran humor' },
      { titulo: 'La mano izquierda de la oscuridad', autor: 'Ursula K. Le Guin', por: 'Sci-fi social que explora el género y la identidad con una prosa luminosa' },
    ],
    subgeneros: ['Space opera', 'Cyberpunk', 'Hard sci-fi', 'Sci-fi social', 'Biopunk', 'Solarpunk'],
    atmosfera: 'El universo como pregunta abierta, la tecnología como espejo',
  },
  {
    id: 'fantasia-epica',
    nombre: 'Fantasía Épica',
    emoji: '🐉',
    color: '#6C3483',
    tagline: 'Para el lector que quiere perderse en mundos enteros con historia, magia y conflicto heroico',
    descripcion: 'La fantasía épica construye mundos secundarios completos con su propia geografía, historia, razas y sistemas de magia. El conflicto suele ser de escala titánica (el bien contra el mal, la caída de un reino) y el viaje del héroe estructura la narrativa. El placer del lector es habitar ese mundo tanto como seguir la trama.',
    queBusca: ['mundos', 'emocion'],
    caracteristicas: [
      'Mundo secundario construido con gran detalle y coherencia interna',
      'Sistema de magia con reglas propias',
      'Conflicto de escala épica o civilizacional',
      'Elenco coral de personajes con arcos largos',
      'Viaje físico y moral del protagonista',
    ],
    autores: [
      { nombre: 'J.R.R. Tolkien', obra: 'El señor de los anillos' },
      { nombre: 'George R.R. Martin', obra: 'Canción de hielo y fuego' },
      { nombre: 'Brandon Sanderson', obra: 'El camino de los reyes' },
      { nombre: 'Ursula K. Le Guin', obra: 'Un mago de Terramar' },
    ],
    lecturasEntrada: [
      { titulo: 'El hobbit', autor: 'J.R.R. Tolkien', por: 'La puerta de entrada más amable al mundo de Tolkien y a la fantasía épica' },
      { titulo: 'El nombre del viento', autor: 'Patrick Rothfuss', por: 'Protagonista carismático, prosa elegante y sistema de magia brillante' },
      { titulo: 'Un mago de Terramar', autor: 'Ursula K. Le Guin', por: 'Fantasía concisa, filosófica y emocionalmente profunda' },
    ],
    subgeneros: ['Alta fantasía', 'Fantasía oscura', 'Sword & sorcery', 'Grimdark', 'Progression fantasy'],
    atmosfera: 'Mapas en las primeras páginas, mundos que huelen a pino y acero',
  },
  {
    id: 'thriller-psicologico',
    nombre: 'Thriller Psicológico',
    emoji: '🧠',
    color: '#1A6B4A',
    tagline: 'Para el lector que disfruta de narradoras poco fiables, giros y tensión mental',
    descripcion: 'El thriller psicológico desplaza el peligro del exterior al interior: la amenaza principal es la mente, la percepción distorsionada o la manipulación entre personajes. El lector nunca está seguro de qué es real, quién miente o cuánto se puede fiar del narrador.',
    queBusca: ['suspense', 'personajes'],
    caracteristicas: [
      'Narrador subjetivo o poco fiable que crea incertidumbre',
      'Tensión construida mediante información que se retiene al lector',
      'Personajes con motivaciones ocultas o psicología perturbada',
      'Giros de trama que reconfiguran todo lo anterior',
      'Más énfasis en la mente que en la acción física',
    ],
    autores: [
      { nombre: 'Gillian Flynn', obra: 'Perdida' },
      { nombre: 'Paula Hawkins', obra: 'La chica del tren' },
      { nombre: 'Tana French', obra: 'En los bosques' },
      { nombre: 'Patricia Highsmith', obra: 'El talento de Mr. Ripley' },
    ],
    lecturasEntrada: [
      { titulo: 'Perdida', autor: 'Gillian Flynn', por: 'El thriller psicológico más influyente de la última década, con dos narradores en guerra' },
      { titulo: 'El talento de Mr. Ripley', autor: 'Patricia Highsmith', por: 'La psicología de un asesino sin remordimientos narrada con elegancia perturbadora' },
      { titulo: 'Antes de que te vayas', autor: 'Clare Mackintosh', por: 'Thriller de narrador no fiable accesible y muy bien construido' },
    ],
    subgeneros: ['Domestic noir', 'Thriller de narrador no fiable', 'Thriller legal', 'Suspense romántico'],
    atmosfera: 'La duda instalada en cada página, el giro que cambia todo',
  },
  {
    id: 'novela-historica',
    nombre: 'Novela Histórica',
    emoji: '📜',
    color: '#784212',
    tagline: 'Para el lector que quiere vivir otras épocas desde dentro, con rigor y emoción',
    descripcion: 'La novela histórica reconstruye un período del pasado con voluntad de verosimilitud, mezclando personajes ficticios con figuras reales y hechos documentados. En las mejores obras, la historia no es decorado sino motor de la trama: las circunstancias históricas determinan la vida y las decisiones de los protagonistas.',
    queBusca: ['historia', 'personajes'],
    caracteristicas: [
      'Ambientación en un período histórico documentado con detalle',
      'Personajes ficticios que conviven con figuras históricas reales',
      'Los hechos históricos condicionan la trama y los personajes',
      'Investigación histórica visible pero no abrumadora',
      'Tensión entre lo que el lector sabe del pasado y lo que ignoran los personajes',
    ],
    autores: [
      { nombre: 'Hilary Mantel', obra: 'Wolf Hall' },
      { nombre: 'Ken Follett', obra: 'Los pilares de la tierra' },
      { nombre: 'Umberto Eco', obra: 'El nombre de la rosa' },
      { nombre: 'Patrick O\'Brian', obra: 'Master and Commander' },
    ],
    lecturasEntrada: [
      { titulo: 'Los pilares de la tierra', autor: 'Ken Follett', por: 'La gran novela histórica popular: medieval, épica y perfectamente construida' },
      { titulo: 'El nombre de la rosa', autor: 'Umberto Eco', por: 'Misterio medieval con una erudición que nunca aplasta la trama' },
      { titulo: 'La ladrona de libros', autor: 'Markus Zusak', por: 'Segunda Guerra Mundial narrada por la Muerte, emotiva y memorable' },
    ],
    subgeneros: ['Medieval', 'Renacimiento y Siglo de Oro', 'Victoriana', 'Segunda Guerra Mundial', 'Antigua Roma y Grecia'],
    atmosfera: 'El pasado que se hace tangible, la historia que huele a pergamino',
  },
  {
    id: 'distopia',
    nombre: 'Distopía',
    emoji: '⚡',
    color: '#1C2833',
    tagline: 'Para el lector que quiere entender el presente a través de futuros oscuros y sociedades de control',
    descripcion: 'La distopía imagina sociedades futuras en que algo ha salido radicalmente mal: el totalitarismo ha triunfado, la tecnología ha alienado a las personas o el medioambiente ha colapsado. A diferencia de la ciencia ficción especulativa, la distopía es ante todo una crítica política y social del presente disfrazada de futuro.',
    queBusca: ['ideas', 'suspense'],
    caracteristicas: [
      'Sociedad futura opresiva, controlada o degradada',
      'Protagonista que se enfrenta o resiste al sistema',
      'Crítica política o social del presente enmascarada en el futuro',
      'Atmósfera claustrofóbica y sensación de que no hay salida',
      'El lenguaje, la historia o la verdad como campos de batalla',
    ],
    autores: [
      { nombre: 'George Orwell', obra: '1984' },
      { nombre: 'Aldous Huxley', obra: 'Un mundo feliz' },
      { nombre: 'Margaret Atwood', obra: 'El cuento de la criada' },
      { nombre: 'Yevgeny Zamyatin', obra: 'Nosotros' },
    ],
    lecturasEntrada: [
      { titulo: '1984', autor: 'George Orwell', por: 'El texto fundacional del género: totalitarismo, vigilancia y la destrucción del lenguaje' },
      { titulo: 'El cuento de la criada', autor: 'Margaret Atwood', por: 'Distopía teocrática y patriarcal narrada desde dentro con una voz devastadora' },
      { titulo: 'Un mundo feliz', autor: 'Aldous Huxley', por: 'La distopía del placer y el confort como herramienta de control, más incómoda que 1984' },
    ],
    subgeneros: ['Distopía política', 'Distopía tecnológica', 'Postapocalíptica', 'Young Adult distópico', 'Cli-fi (cambio climático)'],
    atmosfera: 'El futuro como advertencia, el presente como diagnóstico',
  },
  {
    id: 'aventura',
    nombre: 'Aventura y Acción',
    emoji: '⚔️',
    color: '#1F618D',
    tagline: 'Para el lector que quiere movimiento, peligro y protagonistas que actúan',
    descripcion: 'La novela de aventuras pone el énfasis en la acción, el movimiento y el peligro físico. Sus protagonistas viajan, se enfrentan a adversidades y superan obstáculos. La trama avanza a ritmo rápido y el placer lector es la emoción del viaje, la superación y el sentido de la empresa compartida.',
    queBusca: ['emocion', 'suspense'],
    caracteristicas: [
      'Acción y movimiento como motor principal de la trama',
      'Protagonista activo que toma decisiones y afronta peligros físicos',
      'Escenarios variados y viajes como estructura narrativa',
      'Ritmo rápido con capítulos cortos y cliffhangers frecuentes',
      'Sentido de empresa o misión compartida',
    ],
    autores: [
      { nombre: 'Alexandre Dumas', obra: 'Los tres mosqueteros' },
      { nombre: 'Jules Verne', obra: 'La vuelta al mundo en 80 días' },
      { nombre: 'Robert Louis Stevenson', obra: 'La isla del tesoro' },
      { nombre: 'Wilbur Smith', obra: 'Cuando el león bebe' },
    ],
    lecturasEntrada: [
      { titulo: 'Los tres mosqueteros', autor: 'Alexandre Dumas', por: 'El arquetipo perfecto de la novela de aventuras, trepidante y sin desperdicios' },
      { titulo: 'El código Da Vinci', autor: 'Dan Brown', por: 'Aventura moderna de acción rápida, ideal para iniciarse en el género' },
      { titulo: 'La isla del tesoro', autor: 'Robert Louis Stevenson', por: 'Breve, perfecta en su estructura y apasionante para cualquier edad' },
    ],
    subgeneros: ['Aventura histórica', 'Thriller de acción', 'Espionaje', 'Supervivencia', 'Aventura marítima'],
    atmosfera: 'El mundo como campo de acción, el peligro como combustible',
  },
  {
    id: 'realismo-literario',
    nombre: 'Realismo Literario',
    emoji: '📚',
    color: '#2E4057',
    tagline: 'Para el lector que busca personajes complejos, verdad emocional y prosa que deja huella',
    descripcion: 'El realismo literario no tiene género en sentido estricto: es una categoría de ambición y calidad. Trata el mundo cotidiano, las relaciones humanas y la condición humana con profundidad psicológica y cuidado formal. Puede ser contemporáneo o moderno, pero siempre prioriza la verdad sobre el entretenimiento.',
    queBusca: ['personajes', 'ideas'],
    caracteristicas: [
      'Mundo contemporáneo o moderno sin elementos fantásticos',
      'Profundidad psicológica en los personajes y sus motivaciones',
      'Prosa trabajada con ambición estética',
      'Exploración de relaciones humanas, familia, identidad o pérdida',
      'El conflicto interno supera en importancia al conflicto externo',
    ],
    autores: [
      { nombre: 'Gustave Flaubert', obra: 'Madame Bovary' },
      { nombre: 'Elena Ferrante', obra: 'La amiga estupenda' },
      { nombre: 'Jonathan Franzen', obra: 'Las correcciones' },
      { nombre: 'Sally Rooney', obra: 'Normal People' },
    ],
    lecturasEntrada: [
      { titulo: 'La amiga estupenda', autor: 'Elena Ferrante', por: 'Retrato de una amistad femenina durante décadas, narrado con una honestidad brutal' },
      { titulo: 'Normal People', autor: 'Sally Rooney', por: 'Realismo contemporáneo sobre amor y clase social con diálogos extraordinarios' },
      { titulo: 'Las correcciones', autor: 'Jonathan Franzen', por: 'La gran novela familiar americana: ambiciosa, oscura y completamente humana' },
    ],
    subgeneros: ['Autoficción', 'Novela de campus', 'Novela de formación', 'Realismo mágico', 'Ficción latinoamericana contemporánea'],
    atmosfera: 'La vida tal como es, narrada con la intensidad que merece',
  },
  {
    id: 'romantica',
    nombre: 'Novela Romántica',
    emoji: '💕',
    color: '#A93226',
    tagline: 'Para el lector que busca la tensión del amor, la conexión emocional y el final satisfactorio',
    descripcion: 'La novela romántica tiene un pacto claro con el lector: el amor es el centro de la trama y el final será satisfactorio. Dentro de esa convención, el género abarca desde la comedia ligera hasta el drama de época o el romance paranormal. Su fortaleza es la tensión emocional entre los protagonistas.',
    queBusca: ['emocion', 'personajes'],
    caracteristicas: [
      'La relación romántica como eje central de la trama',
      'Final satisfactorio: HEA (Happily Ever After) o HFN (Happy For Now)',
      'Tensión sexual o emocional construida con cuidado',
      'Desarrollo de los protagonistas a través de la relación',
      'Subtrama secundaria que enriquece el conflicto romántico',
    ],
    autores: [
      { nombre: 'Jane Austen', obra: 'Orgullo y prejuicio' },
      { nombre: 'Nicholas Sparks', obra: 'El cuaderno de Noah' },
      { nombre: 'Colleen Hoover', obra: 'Romper el círculo' },
      { nombre: 'Helen Fielding', obra: 'El diario de Bridget Jones' },
    ],
    lecturasEntrada: [
      { titulo: 'Orgullo y prejuicio', autor: 'Jane Austen', por: 'La novela romántica más influyente de la historia, con humor e ironía insuperables' },
      { titulo: 'El cuaderno de Noah', autor: 'Nicholas Sparks', por: 'Romance sentimental clásico, accesible y emocionalmente poderoso' },
      { titulo: 'Romper el círculo', autor: 'Colleen Hoover', por: 'El fenómeno BookTok: romance oscuro contemporáneo de lectura compulsiva' },
    ],
    subgeneros: ['Romance de época', 'Romance contemporáneo', 'Romance paranormal', 'Dark romance', 'Comedia romántica'],
    atmosfera: 'La anticipación del encuentro, la tensión del "¿acabarán juntos?"',
  },
  {
    id: 'gotica',
    nombre: 'Novela Gótica',
    emoji: '🦇',
    color: '#4A235A',
    tagline: 'Para el lector que busca atmósfera densa, misterio ancestral y lo sublime perturbador',
    descripcion: 'La novela gótica nació en el siglo XVIII como reacción al racionalismo de la Ilustración. Sus elementos son la atmósfera siniestra, los escenarios decadentes (castillos, mansiones, páramos), los secretos familiares y la tensión entre lo racional y lo sobrenatural. Es el antepasado del terror moderno y del realismo mágico.',
    queBusca: ['suspense', 'mundos', 'emocion'],
    caracteristicas: [
      'Atmósfera densa, opresiva y llena de presagios',
      'Escenarios arquitectónicos cargados de significado (castillos, casas malditas)',
      'Secretos familiares, herencias oscuras y pasados que vuelven',
      'Tensión entre lo racional y lo sobrenatural sin resolución clara',
      'Protagonistas femeninas atrapadas en situaciones de amenaza',
    ],
    autores: [
      { nombre: 'Mary Shelley', obra: 'Frankenstein' },
      { nombre: 'Bram Stoker', obra: 'Drácula' },
      { nombre: 'Charlotte Brontë', obra: 'Jane Eyre' },
      { nombre: 'Daphne du Maurier', obra: 'Rebeca' },
    ],
    lecturasEntrada: [
      { titulo: 'Rebeca', autor: 'Daphne du Maurier', por: 'El gótico moderno más perfecto: narrador sin nombre, mansión siniestra y una muerta que lo domina todo' },
      { titulo: 'Frankenstein', autor: 'Mary Shelley', por: 'La primera novela gótica de ciencia ficción y uno de los mitos modernos más poderosos' },
      { titulo: 'Jane Eyre', autor: 'Charlotte Brontë', por: 'Gótico romántico con una protagonista extraordinariamente moderna' },
    ],
    subgeneros: ['Gótico victoriano', 'Southern Gothic', 'Gótico contemporáneo', 'Gótico romántico', 'Neo-gótico'],
    atmosfera: 'Niebla sobre piedra antigua, secretos emparedados en las paredes',
  },
];

const FILTROS_BUSCO: { id: FiltroBusco; label: string; emoji: string }[] = [
  { id: 'todos',      label: 'Todos los géneros', emoji: '📚' },
  { id: 'suspense',   label: 'Suspense y tensión', emoji: '⚡' },
  { id: 'mundos',     label: 'Mundos y worldbuilding', emoji: '🌍' },
  { id: 'personajes', label: 'Personajes profundos', emoji: '🧠' },
  { id: 'ideas',      label: 'Ideas y reflexión', emoji: '💡' },
  { id: 'emocion',    label: 'Emoción intensa', emoji: '❤️' },
  { id: 'historia',   label: 'Historia y época', emoji: '📜' },
];

interface ParConfundidoGenero {
  generoA: string;
  generoB: string;
  diferencia: string;
  claveA: string;
  claveB: string;
}

const PARES_CONFUNDIDOS: ParConfundidoGenero[] = [
  {
    generoA: 'Novela Negra',
    generoB: 'Thriller Psicológico',
    diferencia: 'La novela negra sitúa el peligro en el mundo exterior corrupto (crimen, sociedad). El thriller psicológico lo sitúa en la mente: la percepción distorsionada, el narrador no fiable y la manipulación entre personajes.',
    claveA: 'El crimen como síntoma social, el detective como antihéroe',
    claveB: 'La mente como campo de batalla, los giros que reconfiguran todo',
  },
  {
    generoA: 'Ciencia Ficción',
    generoB: 'Fantasía Épica',
    diferencia: 'La ciencia ficción extrapola ciencia y tecnología plausible para explorar consecuencias. La fantasía épica construye mundos secundarios con magia que no pretende explicación racional. La pregunta es: ¿podría esto ocurrir? (sci-fi) vs ¿qué pasaría si existiera? (fantasía).',
    claveA: 'Tecnología y ciencia como punto de partida, mundos posibles',
    claveB: 'Magia con reglas propias, mundos secundarios completos',
  },
  {
    generoA: 'Terror',
    generoB: 'Novela Gótica',
    diferencia: 'La novela gótica es el ancestro del terror moderno, pero su foco es la atmósfera, los secretos familiares y la tensión entre lo racional y lo sobrenatural. El terror moderno busca una respuesta física más directa: el miedo como sensación, no como atmósfera.',
    claveA: 'Miedo como respuesta física, amenaza concreta y violenta',
    claveB: 'Atmósfera densa, secretos ancestrales, lo sublime oscuro',
  },
  {
    generoA: 'Distopía',
    generoB: 'Ciencia Ficción',
    diferencia: 'La distopía es un subgénero de la ciencia ficción, pero con una agenda política y social explícita: es ante todo una crítica del presente disfrazada de futuro. La ciencia ficción general puede ser optimista o neutral; la distopía siempre advierte.',
    claveA: 'Crítica social y política, sociedad opresiva, advertencia',
    claveB: 'Especulación tecnológica, sentido de la maravilla, exploración',
  },
];

export default function VisualizadorGenerosNovelaPage() {
  const [filtroBusco, setFiltroBusco] = useState<FiltroBusco>('todos');
  const [generoActivo, setGeneroActivo] = useState<GeneroNovela | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const generosFiltrados = useMemo(() => {
    return GENEROS.filter(g => {
      const coincideFiltro = filtroBusco === 'todos' || g.queBusca.includes(filtroBusco);
      const coincideBusqueda = g.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return coincideFiltro && coincideBusqueda;
    });
  }, [filtroBusco, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Grandes Géneros de la Novela</h1>
        <p className={styles.heroSubtitle}>
          Qué esperar de cada género, sus autores fundacionales y por dónde empezar — desde la perspectiva del lector
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Filtros ── */}
        <div className={styles.filtrosBox}>
          <p className={styles.filtrosPregunta}>¿Qué buscas en tu próxima lectura?</p>
          <div className={styles.filtrosBotones}>
            {FILTROS_BUSCO.map(f => (
              <button
                key={f.id}
                className={`${styles.filtroBtn} ${filtroBusco === f.id ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltroBusco(f.id)}
              >
                <span aria-hidden="true">{f.emoji}</span> {f.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            className={styles.buscador}
            placeholder="Buscar género..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            aria-label="Buscar género"
          />
          {filtroBusco !== 'todos' && (
            <p className={styles.filtrosResultado}>
              {generosFiltrados.length} género{generosFiltrados.length !== 1 ? 's' : ''} encontrado{generosFiltrados.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* ── Grid de géneros ── */}
        {generosFiltrados.length > 0 ? (
          <div className={styles.generosGrid}>
            {generosFiltrados.map(genero => (
              <button
                key={genero.id}
                className={styles.generoCard}
                onClick={() => setGeneroActivo(genero)}
                aria-label={`Ver detalle de ${genero.nombre}`}
                style={{ borderTopColor: genero.color }}
              >
                <div className={styles.generoEmoji} aria-hidden="true">{genero.emoji}</div>
                <h2 className={styles.generoNombre} style={{ color: genero.color }}>{genero.nombre}</h2>
                <p className={styles.generoTagline}>{genero.tagline}</p>
                <p className={styles.generoAtmosfera}><em>"{genero.atmosfera}"</em></p>
                <div className={styles.generoSubgeneros}>
                  {genero.subgeneros.slice(0, 3).map(s => (
                    <span key={s} className={styles.subgeneroTag} style={{ borderColor: genero.color, color: genero.color }}>{s}</span>
                  ))}
                </div>
                <span className={styles.generoVerMas}>Ver autores y lecturas →</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.sinResultados}>
            <p>No se encontraron géneros con ese criterio.</p>
            <button className={styles.btnReset} onClick={() => { setBusqueda(''); setFiltroBusco('todos'); }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {/* ── Modal de detalle ── */}
        {generoActivo && (
          <div className={styles.modalOverlay} onClick={() => setGeneroActivo(null)} role="dialog" aria-modal="true" aria-label={`Detalle de ${generoActivo.nombre}`}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.modalCerrar} onClick={() => setGeneroActivo(null)} aria-label="Cerrar detalle">✕</button>

              <div className={styles.modalHeader} style={{ background: generoActivo.color }}>
                <span className={styles.modalEmoji} aria-hidden="true">{generoActivo.emoji}</span>
                <div>
                  <h2 className={styles.modalNombre}>{generoActivo.nombre}</h2>
                  <p className={styles.modalTagline}>{generoActivo.tagline}</p>
                </div>
              </div>

              <div className={styles.modalBody}>
                <p className={styles.modalDescripcion}>{generoActivo.descripcion}</p>

                <section className={styles.modalSeccion}>
                  <h3 className={styles.modalSeccionTitle}>Características definitorias</h3>
                  <ul className={styles.caracteristicasList}>
                    {generoActivo.caracteristicas.map((c, i) => (
                      <li key={i} className={styles.caracteristicaItem} style={{ borderLeftColor: generoActivo.color }}>{c}</li>
                    ))}
                  </ul>
                </section>

                <section className={styles.modalSeccion}>
                  <h3 className={styles.modalSeccionTitle}>Autores fundacionales</h3>
                  <div className={styles.autoresGrid}>
                    {generoActivo.autores.map((a, i) => (
                      <div key={i} className={styles.autorCard} style={{ borderTopColor: generoActivo.color }}>
                        <span className={styles.autorNombre}>{a.nombre}</span>
                        <span className={styles.autorObra}>"{a.obra}"</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.modalSeccion}>
                  <h3 className={styles.modalSeccionTitle}>Por dónde empezar</h3>
                  <div className={styles.lecturasGrid}>
                    {generoActivo.lecturasEntrada.map((l, i) => (
                      <div key={i} className={styles.lecturaCard} style={{ borderLeftColor: generoActivo.color }}>
                        <p className={styles.lecturaTitulo}>{l.titulo}</p>
                        <p className={styles.lecturaAutor}>{l.autor}</p>
                        <p className={styles.lecturaPor}>{l.por}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.modalSeccion}>
                  <h3 className={styles.modalSeccionTitle}>Subgéneros</h3>
                  <div className={styles.subgenerosWrap}>
                    {generoActivo.subgeneros.map(s => (
                      <span key={s} className={styles.subgeneroTagModal} style={{ borderColor: generoActivo.color, color: generoActivo.color }}>{s}</span>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* ── Pares confundidos ── */}
        <section className={styles.paresSection}>
          <h2 className={styles.paresTitulo}>Géneros frecuentemente confundidos</h2>
          <p className={styles.paresSubtitulo}>Las diferencias clave entre géneros que se parecen pero no son lo mismo</p>
          <div className={styles.paresGrid}>
            {PARES_CONFUNDIDOS.map((par, i) => (
              <div key={i} className={styles.parCard}>
                <div className={styles.parHeader}>
                  <span className={styles.parNombre}>{par.generoA}</span>
                  <span className={styles.parVs}>vs</span>
                  <span className={styles.parNombre}>{par.generoB}</span>
                </div>
                <p className={styles.parDiferencia}>{par.diferencia}</p>
                <div className={styles.parClaves}>
                  <div className={styles.parClave}>
                    <span className={styles.parClaveLabel}>{par.generoA}:</span>
                    <span className={styles.parClaveTexto}>{par.claveA}</span>
                  </div>
                  <div className={styles.parClave}>
                    <span className={styles.parClaveLabel}>{par.generoB}:</span>
                    <span className={styles.parClaveTexto}>{par.claveB}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Test tipo lector ── */}
        <div className={styles.ctaBox}>
          <div className={styles.ctaTexto}>
            <h2 className={styles.ctaTitulo}>¿No sabes qué género es el tuyo?</h2>
            <p className={styles.ctaDesc}>El test de tipo de lector te ayuda a descubrir tu arquetipo y los géneros que más encajan contigo</p>
          </div>
          <a href="/test-tipo-lector/" className={styles.ctaBtn}>
            Hacer el test →
          </a>
        </div>

        {/* ── Educational Section ── */}
        <EducationalSection
          title="Sobre los géneros narrativos"
          subtitle="Cómo funcionan, por qué importan y cómo elegir el género que más te conviene"
        >
          <div className={styles.guideSection}>

            <h3>¿Qué es un género narrativo y para qué sirve?</h3>
            <p>Un género no es una etiqueta de librería sino un contrato entre el autor y el lector: una serie de expectativas sobre qué tipo de experiencia ofrece el libro. Conocer los géneros no limita la lectura, la amplía: permite al lector elegir con más criterio, entender qué le gusta y por qué, y descubrir géneros que aún no ha explorado.</p>

            {/* Tabla comparativa */}
            <h3>Resumen comparativo de los 11 géneros</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Género</th>
                    <th>Motor principal</th>
                    <th>Qué ofrece al lector</th>
                    <th>Ritmo habitual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>🔍 Novela Negra</td><td>Crimen y sociedad</td><td>Tensión, crítica social, personajes al límite</td><td>Ágil</td></tr>
                  <tr><td>👻 Terror</td><td>Miedo y amenaza</td><td>Adrenalina, exploración psicológica del miedo</td><td>Variable (lento→rápido)</td></tr>
                  <tr><td>🚀 Ciencia ficción</td><td>Extrapolación tecnológica</td><td>Sentido de la maravilla, reflexión sobre el futuro</td><td>Variable</td></tr>
                  <tr><td>🐉 Fantasía épica</td><td>Mundo secundario y conflicto épico</td><td>Inmersión total, aventura y worldbuilding</td><td>Denso, largo</td></tr>
                  <tr><td>🧠 Thriller psicológico</td><td>La mente y el engaño</td><td>Giros, incertidumbre, narrador no fiable</td><td>Muy rápido</td></tr>
                  <tr><td>📜 Novela histórica</td><td>El pasado como escenario</td><td>Inmersión en otra época, contexto y emoción</td><td>Denso</td></tr>
                  <tr><td>⚡ Distopía</td><td>Sociedad opresiva futura</td><td>Crítica política, atmósfera claustrofóbica</td><td>Medio</td></tr>
                  <tr><td>⚔️ Aventura</td><td>Acción y movimiento</td><td>Emoción, viaje, superación de obstáculos</td><td>Muy rápido</td></tr>
                  <tr><td>📚 Realismo literario</td><td>La condición humana</td><td>Verdad emocional, personajes complejos, prosa</td><td>Lento o medio</td></tr>
                  <tr><td>💕 Novela romántica</td><td>La relación amorosa</td><td>Tensión emocional, final satisfactorio</td><td>Rápido</td></tr>
                  <tr><td>🦇 Novela Gótica</td><td>Atmósfera y secretos</td><td>Lo sublime oscuro, misterio ancestral</td><td>Lento, denso</td></tr>
                </tbody>
              </table>
            </div>

            {/* Casos de uso */}
            <h3>Perfiles de lector y géneros recomendados</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>⚡</span>
                  <h4>Lector de ritmo rápido</h4>
                </div>
                <p>Si te aburres si no pasa nada en 50 páginas, empieza por el thriller psicológico, la aventura o la novela negra. Capítulos cortos, giros frecuentes y tramas que avanzan sin parar.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>🌍</span>
                  <h4>Lector de mundos</h4>
                </div>
                <p>Si disfrutas perderte en un universo con su propia lógica, prueba la fantasía épica o la ciencia ficción. El worldbuilding es el placer principal: quieres habitar ese mundo, no solo seguir la trama.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>🧠</span>
                  <h4>Lector de ideas</h4>
                </div>
                <p>Si quieres que un libro te deje pensando días después, busca en la distopía, la ciencia ficción social o el realismo literario. El género es el vehículo; las ideas, el destino.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>❤️</span>
                  <h4>Lector de emociones</h4>
                </div>
                <p>Si quieres que un libro te haga llorar, reír o sentir con los personajes, el romanticismo, el realismo literario o incluso el gótico pueden darte una intensidad emocional que otros géneros no alcanzan.</p>
              </div>
            </div>

            {/* FAQ */}
            <h3>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Los géneros son compartimentos estancos?</h4>
                <p>No. La mayoría de las grandes novelas mezclan géneros: una novela histórica puede ser también un thriller (El nombre de la rosa), una ciencia ficción puede ser distopía y romance (El cuento de la criada). Los géneros son puntos de partida, no jaulas.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿La "literatura seria" es un género aparte?</h4>
                <p>La distinción entre "literatura" y "género" es una convención cultural más que una diferencia real de calidad. Hay novelas negras con prosa extraordinaria (Chandler, Highsmith) y "literatura seria" mediocre. Un mejor criterio: ¿qué prioriza la novela, el entretenimiento inmediato o la ambición formal?</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cómo sé cuál es mi género?</h4>
                <p>Piensa en los últimos libros que has disfrutado y en qué tenían en común: ¿el ritmo, los personajes, la atmósfera, las ideas? Eso suele apuntar a tu género natural. También puedes hacer el test de tipo de lector para una aproximación más estructurada.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Por qué los libros del mismo género varían tanto?</h4>
                <p>Porque dentro de cada género hay un espectro enorme. En la ciencia ficción caben desde space opera de pura acción (Asimov) hasta reflexión filosófica densa (Le Guin). Conocer los subgéneros ayuda a afinar dentro del género.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Los clásicos pertenecen a un género?</h4>
                <p>Sí, aunque cuando se escribieron a menudo no existían las etiquetas actuales. Don Quijote es novela de aventuras y parodia; Frankenstein es ciencia ficción y gótica; Crime and Punishment es realismo literario con thriller. Los clásicos suelen fundarlo todo.</p>
              </div>
            </div>

            {/* Guía paso a paso */}
            <h3>Cómo encontrar tu próximo libro</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Identifica qué buscas ahora</h4>
                  <p>No siempre buscamos lo mismo. A veces queremos escapar (fantasía, aventura), a veces reflexionar (distopía, realismo), a veces solo pasar un buen rato (thriller, romantica). El estado de ánimo importa más que el género preferido abstracto.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Elige por la obra de entrada, no por el género</h4>
                  <p>Las mejores obras de entrada de cada género están pensadas para lectores nuevos: son accesibles, representativas y tienen una recompensa rápida. No empieces un género por sus obras más difíciles o largas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Explora los subgéneros</h4>
                  <p>Si un género te ha gustado pero quieres más especificidad, mira los subgéneros. El nórdico negro y el noir americano son muy distintos dentro de la novela negra. El hard sci-fi y la space opera tienen públicos casi diferentes.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Lee los autores fundacionales</h4>
                  <p>Para entender un género de verdad, conviene leer a quien lo inventó o lo definió: Chandler para la novela negra, Tolkien para la fantasía épica, Orwell para la distopía. Son la referencia contra la que todo lo demás se mide.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Mezcla géneros conscientemente</h4>
                  <p>Una vez que conoces varios géneros, busca obras que los crucen de forma interesante. Las mejores novelas de los últimos años suelen ser híbridas: thriller histórico, sci-fi romántica, gótico contemporáneo.</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <h3>Claves para disfrutar más de la lectura</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🎯</span>
                <h4>Abandona sin culpa</h4>
                <p>Si un libro no te engancha en las primeras 50-100 páginas, no es obligatorio terminarlo. La vida es corta y hay demasiados libros buenos.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🌱</span>
                <h4>Prueba un género nuevo al año</h4>
                <p>Si siempre lees el mismo género, te pierdes experiencias que podrían sorprenderte. Una obra de entrada bien elegida puede abrirte un mundo entero.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🔄</span>
                <h4>Alterna ritmos</h4>
                <p>Después de un libro muy denso (realismo, novela histórica), un thriller ágil puede ser el descanso perfecto. El contraste mejora la experiencia de ambos.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>📖</span>
                <h4>Lee los prólogos e introducciones</h4>
                <p>Especialmente en clásicos y obras de género: contextualizan el libro en su tiempo, explican convenciones del género y preparan la lectura.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>💬</span>
                <h4>Busca comunidades lectoras</h4>
                <p>Los clubes de lectura online (BookTok, Goodreads, grupos específicos por género) son la forma más eficiente de descubrir recomendaciones dentro de tus géneros favoritos.</p>
              </div>
            </div>

            {/* Warning box */}
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcono}>⚠️</span>
                <h4>Errores frecuentes al elegir lecturas</h4>
              </div>
              <ul className={styles.warningList}>
                <li>Empezar por la obra más larga o densa de un género nuevo (p. ej., La rueda del tiempo como primera fantasía épica).</li>
                <li>Descartár un género entero por una mala experiencia con una sola obra poco representativa.</li>
                <li>Confundir "novela negra" con "thriller" o "policiaca clásica": son géneros con lógicas y propósitos distintos.</li>
                <li>Pensar que la ciencia ficción es solo de "naves y robots": el género abarca desde la reflexión filosófica hasta el romance especulativo.</li>
                <li>Leer a contracorriente del ritmo del libro: la fantasía épica requiere paciencia para el worldbuilding inicial; el thriller exige no parar.</li>
                <li>Ignorar los subgéneros: dentro de la romantica hay diferencias enormes entre romance histórico, dark romance y comedia romántica.</li>
              </ul>
            </div>

          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-generos-novela')} />
        <ShareCard appName="visualizador-generos-novela" />
      </main>

      <Footer appName="visualizador-generos-novela" />
    </div>
  );
}
