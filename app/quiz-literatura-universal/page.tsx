'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QuizLiteraturaUniversal.module.css';

// ── Tipos ──────────────────────────────────────────────────────────────────

type Nivel = 'basico' | 'medio' | 'avanzado';
type Categoria = 'autores' | 'obras' | 'movimientos' | 'citas';
type Fase = 'seleccion' | 'quiz' | 'resultado';

interface Pregunta {
  id: string;
  nivel: Nivel;
  categoria: Categoria;
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

// ── Pool de preguntas ──────────────────────────────────────────────────────

const POOL: Pregunta[] = [
  // ── BÁSICO ──
  {
    id: 'b01', nivel: 'basico', categoria: 'autores',
    pregunta: '¿Quién escribió "Don Quijote de la Mancha"?',
    opciones: ['Francisco de Quevedo', 'Miguel de Cervantes', 'Lope de Vega', 'Tirso de Molina'],
    correcta: 1,
    explicacion: 'Cervantes publicó la primera parte en 1605 y la segunda en 1615. Es la novela más influyente de la literatura en lengua española.',
  },
  {
    id: 'b02', nivel: 'basico', categoria: 'citas',
    pregunta: '¿De qué novela es la primera frase «Llamadme Ismael»?',
    opciones: ['El viejo y el mar', 'Lord Jim', 'Moby Dick', 'La letra escarlata'],
    correcta: 2,
    explicacion: 'Moby Dick (1851) de Herman Melville comienza con la célebre «Call me Ishmael». Es la novela más influyente de la literatura norteamericana del siglo XIX.',
  },
  {
    id: 'b03', nivel: 'basico', categoria: 'autores',
    pregunta: '¿Quién escribió "Cien años de soledad"?',
    opciones: ['Mario Vargas Llosa', 'Julio Cortázar', 'Carlos Fuentes', 'Gabriel García Márquez'],
    correcta: 3,
    explicacion: 'García Márquez publicó esta obra en 1967. Ganó el Premio Nobel de Literatura en 1982 y es el libro más vendido en español después del Quijote.',
  },
  {
    id: 'b04', nivel: 'basico', categoria: 'movimientos',
    pregunta: '¿En qué movimiento literario se enmarca "Cien años de soledad"?',
    opciones: ['Romanticismo', 'Existencialismo', 'Realismo mágico', 'Naturalismo'],
    correcta: 2,
    explicacion: 'El realismo mágico narra hechos extraordinarios con la misma naturalidad que los cotidianos. García Márquez es su máximo exponente junto a Alejo Carpentier.',
  },
  {
    id: 'b05', nivel: 'basico', categoria: 'autores',
    pregunta: '¿Quién creó al detective Sherlock Holmes?',
    opciones: ['Edgar Allan Poe', 'Agatha Christie', 'Arthur Conan Doyle', 'G.K. Chesterton'],
    correcta: 2,
    explicacion: 'Doyle creó a Holmes en 1887 con "Estudio en escarlata". El personaje apareció en 4 novelas y 56 relatos cortos. Fue el primer detective moderno de la ficción.',
  },
  {
    id: 'b06', nivel: 'basico', categoria: 'obras',
    pregunta: '¿A qué obra pertenece el personaje de Emma Bovary?',
    opciones: ['Ana Karenina', 'La Regenta', 'Middlemarch', 'Madame Bovary'],
    correcta: 3,
    explicacion: 'Emma Bovary es el personaje central de la novela de Gustave Flaubert (1857). "Bovarismo" designa la inadaptación entre los sueños propios y la realidad.',
  },
  {
    id: 'b07', nivel: 'basico', categoria: 'autores',
    pregunta: '¿Quién escribió "Romeo y Julieta"?',
    opciones: ['Christopher Marlowe', 'Ben Jonson', 'William Shakespeare', 'John Milton'],
    correcta: 2,
    explicacion: 'Shakespeare escribió esta tragedia hacia 1594-1596. Es la historia de amor más representada y adaptada de todos los tiempos.',
  },
  {
    id: 'b08', nivel: 'basico', categoria: 'obras',
    pregunta: '¿Quién escribió "1984"?',
    opciones: ['Aldous Huxley', 'H.G. Wells', 'Ray Bradbury', 'George Orwell'],
    correcta: 3,
    explicacion: '"1984" (1949) es la distopía más influyente del siglo XX. Orwell creó conceptos como el "Gran Hermano", la "neolengua" o el "doblepensar" que perviven en el lenguaje cotidiano.',
  },
  {
    id: 'b09', nivel: 'basico', categoria: 'autores',
    pregunta: '¿De qué país procedía Homero, autor de "La Odisea"?',
    opciones: ['Roma', 'Egipto', 'Grecia', 'Persia'],
    correcta: 2,
    explicacion: 'Homero, poeta griego (s.VIII a.C.), es el autor atribuido de "La Ilíada" y "La Odisea", las dos epopeyas fundacionales de la literatura occidental.',
  },
  {
    id: 'b10', nivel: 'basico', categoria: 'obras',
    pregunta: '¿Quién escribió "La metamorfosis", en la que un hombre despierta convertido en insecto?',
    opciones: ['Thomas Mann', 'Stefan Zweig', 'Franz Kafka', 'Hermann Hesse'],
    correcta: 2,
    explicacion: '"La metamorfosis" (1915): Gregor Samsa amanece transformado. Kafka era de Praga y escribía en alemán. La obra cuestiona identidad, familia y trabajo.',
  },
  {
    id: 'b11', nivel: 'basico', categoria: 'autores',
    pregunta: '¿Quién escribió "Orgullo y prejuicio"?',
    opciones: ['Charlotte Brontë', 'Emily Brontë', 'Mary Shelley', 'Jane Austen'],
    correcta: 3,
    explicacion: 'Austen publicó "Orgullo y prejuicio" en 1813. Es una de las novelas más leídas en inglés y una exploración magistral de la ironía social.',
  },
  {
    id: 'b12', nivel: 'basico', categoria: 'autores',
    pregunta: '¿Quién escribió "El extranjero"?',
    opciones: ['Jean-Paul Sartre', 'Simone de Beauvoir', 'Albert Camus', 'Samuel Beckett'],
    correcta: 2,
    explicacion: '"El extranjero" (1942) es la obra más conocida de Camus. Su protagonista Meursault es el símbolo del absurdo existencial.',
  },
  {
    id: 'b13', nivel: 'basico', categoria: 'autores',
    pregunta: '¿De qué país es el escritor Jorge Luis Borges?',
    opciones: ['Chile', 'Uruguay', 'México', 'Argentina'],
    correcta: 3,
    explicacion: 'Borges (1899-1986) es el escritor argentino más influyente internacionalmente. Sus cuentos en "Ficciones" y "El Aleph" son pilares de la literatura universal.',
  },
  {
    id: 'b14', nivel: 'basico', categoria: 'citas',
    pregunta: '¿Qué novela comienza con «Era el mejor de los tiempos, era el peor de los tiempos»?',
    opciones: ['Oliver Twist', 'Grandes esperanzas', 'Historia de dos ciudades', 'David Copperfield'],
    correcta: 2,
    explicacion: '"Historia de dos ciudades" (1859) de Charles Dickens comienza con este famoso incipit que contrasta la Revolución Francesa con la tranquilidad inglesa.',
  },
  {
    id: 'b15', nivel: 'basico', categoria: 'movimientos',
    pregunta: '¿A qué movimiento pertenece la obra de Victor Hugo?',
    opciones: ['Neoclasicismo', 'Realismo', 'Naturalismo', 'Romanticismo'],
    correcta: 3,
    explicacion: 'Victor Hugo es el máximo representante del Romanticismo francés. "Los miserables" (1862) y "Nuestra Señora de París" (1831) son sus obras más conocidas.',
  },
  {
    id: 'b16', nivel: 'basico', categoria: 'obras',
    pregunta: '¿Qué protagonista de Dostoievski asesina a una vieja usurera?',
    opciones: ['Mitia Karamázov', 'Aliosha Karamázov', 'Rodion Raskólnikov', 'Nastasia Filípovna'],
    correcta: 2,
    explicacion: 'Raskólnikov comete el crimen al inicio de "Crimen y castigo" (1866) y pasa el resto de la novela luchando con su conciencia. Es la novela psicológica por excelencia.',
  },
  {
    id: 'b17', nivel: 'basico', categoria: 'autores',
    pregunta: '¿Qué escritor colombiano ganó el Nobel de Literatura en 1982?',
    opciones: ['Álvaro Mutis', 'Tomás González', 'Gabriel García Márquez', 'William Ospina'],
    correcta: 2,
    explicacion: 'García Márquez fue el cuarto latinoamericano en ganar el Nobel de Literatura, tras Gabriela Mistral, Miguel Ángel Asturias y Pablo Neruda.',
  },
  // ── MEDIO ──
  {
    id: 'm01', nivel: 'medio', categoria: 'movimientos',
    pregunta: '¿Qué técnica narrativa reproduce el flujo de pensamientos sin orden lógico?',
    opciones: ['Estilo indirecto libre', 'Omnisciencia selectiva', 'Narración en segunda persona', 'Flujo de conciencia'],
    correcta: 3,
    explicacion: 'El "stream of consciousness", desarrollado por James Joyce y Virginia Woolf, reproduce el pensamiento tal como ocurre: asociativo, discontinuo, sin jerarquía.',
  },
  {
    id: 'm02', nivel: 'medio', categoria: 'obras',
    pregunta: '¿En qué ciudad transcurre "Mrs. Dalloway" de Virginia Woolf?',
    opciones: ['Dublin', 'París', 'Edimburgo', 'Londres'],
    correcta: 3,
    explicacion: '"Mrs. Dalloway" (1925) transcurre en un solo día en Londres posguerra. El Big Ben marca el tiempo exterior mientras la conciencia de Clarissa marca el tiempo interior.',
  },
  {
    id: 'm03', nivel: 'medio', categoria: 'movimientos',
    pregunta: '¿A qué generación literaria española pertenece Federico García Lorca?',
    opciones: ['Generación del 98', 'Generación del 14', 'Generación del 27', 'Generación del 36'],
    correcta: 2,
    explicacion: 'La Generación del 27 agrupa a poetas como Lorca, Alberti, Cernuda y Aleixandre. Integraron las vanguardias europeas con la tradición poética española.',
  },
  {
    id: 'm04', nivel: 'medio', categoria: 'obras',
    pregunta: '¿Cuál de estas novelas de Proust es la primera de "En busca del tiempo perdido"?',
    opciones: ['A la sombra de las muchachas en flor', 'El tiempo recobrado', 'La prisionera', 'Por el camino de Swann'],
    correcta: 3,
    explicacion: '"Por el camino de Swann" (1913) es el primer volumen. La serie completa tiene 7 volúmenes y es la novela más larga de la literatura francesa.',
  },
  {
    id: 'm05', nivel: 'medio', categoria: 'movimientos',
    pregunta: '¿En qué consiste la «teoría del iceberg» de Hemingway?',
    opciones: [
      'Escribir desde el principio al final sin retroceder',
      'Lo importante permanece implícito bajo la superficie del texto',
      'Usar metáforas del frío y el invierno',
      'Estructurar la novela en tres actos rígidos',
    ],
    correcta: 1,
    explicacion: 'Hemingway: si el escritor conoce bien su material puede omitir mucho; el lector sentirá lo omitido igual que con la parte sumergida del iceberg. La emoción sale de lo no dicho.',
  },
  {
    id: 'm06', nivel: 'medio', categoria: 'movimientos',
    pregunta: '¿Qué movimiento literario surge en Latinoamérica en los años 60 con Cortázar, Fuentes y Vargas Llosa?',
    opciones: ['Negrismo', 'Criollismo', 'Boom Latinoamericano', 'Ultraísmo'],
    correcta: 2,
    explicacion: 'El Boom Latinoamericano (décadas de 1960-70) revolucionó la narrativa mundial. Estos autores experimentaron con el tiempo, el espacio y la perspectiva de maneras nunca vistas.',
  },
  {
    id: 'm07', nivel: 'medio', categoria: 'autores',
    pregunta: '¿Qué escritor chileno ganó el Nobel de Literatura en 1971?',
    opciones: ['José Donoso', 'Roberto Bolaño', 'Pablo Neruda', 'Gabriela Mistral'],
    correcta: 2,
    explicacion: 'Pablo Neruda ganó el Nobel en 1971. Gabriela Mistral fue la primera latinoamericana en ganarlo, en 1945.',
  },
  {
    id: 'm08', nivel: 'medio', categoria: 'obras',
    pregunta: '¿Qué obra de Umberto Eco está ambientada en un monasterio medieval con un misterio de fondo?',
    opciones: ['El péndulo de Foucault', 'La isla del día de antes', 'Baudolino', 'El nombre de la rosa'],
    correcta: 3,
    explicacion: '"El nombre de la rosa" (1980) es una novela de misterio ambientada en un monasterio benedictino del s.XIV. Combinó ficción, semiótica e historia con enorme éxito.',
  },
  {
    id: 'm09', nivel: 'medio', categoria: 'autores',
    pregunta: '¿Qué escritora escribió "La casa de los espíritus"?',
    opciones: ['Laura Esquivel', 'Gioconda Belli', 'Isabel Allende', 'Rosario Castellanos'],
    correcta: 2,
    explicacion: 'Isabel Allende publicó "La casa de los espíritus" en 1982, su primera y más conocida novela, con raíces en el realismo mágico y en la historia reciente de Chile.',
  },
  {
    id: 'm10', nivel: 'medio', categoria: 'movimientos',
    pregunta: '¿Qué técnica utilizó Flaubert para fusionar narrador y personaje sin marcas tipográficas?',
    opciones: ['Monólogo interior', 'Narración omnisciente', 'Flujo de conciencia', 'Estilo indirecto libre'],
    correcta: 3,
    explicacion: 'El estilo indirecto libre (FID) reproduce los pensamientos del personaje integrados en la narración del autor. "¿Por qué era tan infeliz?" puede ser del narrador o de Emma Bovary.',
  },
  {
    id: 'm11', nivel: 'medio', categoria: 'autores',
    pregunta: '¿Qué escritor ruso escribió "Ana Karenina"?',
    opciones: ['Fiódor Dostoievski', 'Antón Chéjov', 'Iván Turguénev', 'León Tolstói'],
    correcta: 3,
    explicacion: 'Tolstói publicó "Ana Karenina" entre 1877 y 1878. Junto con "Guerra y paz" representa la cúspide del realismo ruso del siglo XIX.',
  },
  {
    id: 'm12', nivel: 'medio', categoria: 'autores',
    pregunta: '¿Qué escritor peruano ganó el Premio Nobel de Literatura en 2010?',
    opciones: ['Julio Ramón Ribeyro', 'José María Arguedas', 'Alfredo Bryce Echenique', 'Mario Vargas Llosa'],
    correcta: 3,
    explicacion: 'Vargas Llosa recibió el Nobel en 2010. Es autor de "La ciudad y los perros", "Conversación en La Catedral" y "La fiesta del Chivo", entre otras.',
  },
  {
    id: 'm13', nivel: 'medio', categoria: 'obras',
    pregunta: '¿Qué novela de Dostoievski gira en torno al asesinato del padre Karamázov?',
    opciones: ['El idiota', 'Los demonios', 'El adolescente', 'Los hermanos Karamázov'],
    correcta: 3,
    explicacion: '"Los hermanos Karamázov" (1880), última novela de Dostoievski, es una de las cumbres de la novela psicológica y filosófica. Freud la llamó «la novela más grande jamás escrita».',
  },
  {
    id: 'm14', nivel: 'medio', categoria: 'movimientos',
    pregunta: '¿A qué movimiento literario pertenece la obra de Émile Zola?',
    opciones: ['Romanticismo', 'Modernismo', 'Naturalismo', 'Simbolismo'],
    correcta: 2,
    explicacion: 'Zola es el máximo representante del Naturalismo, que aplica el método científico a la literatura. Su serie "Los Rougon-Macquart" estudia el determinismo social y hereditario.',
  },
  {
    id: 'm15', nivel: 'medio', categoria: 'autores',
    pregunta: '¿Qué narrador protagoniza "El gran Gatsby" de F. Scott Fitzgerald?',
    opciones: ['Jay Gatsby', 'Tom Buchanan', 'Jordan Baker', 'Nick Carraway'],
    correcta: 3,
    explicacion: 'Nick Carraway es el narrador-testigo de esta novela de 1925, símbolo del Sueño Americano y la Generación Perdida. Gatsby es el protagonista, pero Nick cuenta.',
  },
  {
    id: 'm16', nivel: 'medio', categoria: 'citas',
    pregunta: '¿De qué obra es la apertura "Muchos años después, frente al pelotón de fusilamiento…"?',
    opciones: ['El coronel no tiene quien le escriba', 'Crónica de una muerte anunciada', 'El amor en los tiempos del cólera', 'Cien años de soledad'],
    correcta: 3,
    explicacion: 'Es la famosa primera frase de "Cien años de soledad" (1967). El tiempo narrativo colapsa: futuro, presente y pasado remoto simultáneos en una sola oración.',
  },
  // ── AVANZADO ──
  {
    id: 'a01', nivel: 'avanzado', categoria: 'movimientos',
    pregunta: '¿Qué concepto de Bajtín describe la coexistencia de múltiples voces autónomas en Dostoievski?',
    opciones: ['Intertextualidad', 'Defamiliarización', 'Novela polifónica', 'Dialéctica narrativa'],
    correcta: 2,
    explicacion: 'Bajtín describió en "Problemas de la poética de Dostoievski" (1929) cómo cada personaje tiene una voz autónoma con su propia verdad, sin que el narrador la subordine.',
  },
  {
    id: 'a02', nivel: 'avanzado', categoria: 'obras',
    pregunta: '¿En qué novela de Italo Calvino el «Lector» es el protagonista en segunda persona?',
    opciones: ['Las ciudades invisibles', 'El barón rampante', 'El caballero inexistente', 'Si una noche de invierno un viajero'],
    correcta: 3,
    explicacion: '"Si una noche de invierno un viajero" (1979) está narrada en segunda persona y el «Lector» es el protagonista. Es el experimento metaficcional más conocido de Calvino.',
  },
  {
    id: 'a03', nivel: 'avanzado', categoria: 'movimientos',
    pregunta: '¿Qué teórico ruso acuñó el término «ostranenie» (defamiliarización)?',
    opciones: ['Bajtín', 'Propp', 'Lotman', 'Víktor Shklovski'],
    correcta: 3,
    explicacion: 'Shklovski (1917) acuñó «ostranenie» para describir cómo el arte hace que lo familiar parezca extraño, obligando al receptor a percibir de manera nueva.',
  },
  {
    id: 'a04', nivel: 'avanzado', categoria: 'autores',
    pregunta: '¿Qué escritora brasileña escribió "La pasión según G.H."?',
    opciones: ['Rachel de Queiroz', 'Lygia Fagundes Telles', 'Nélida Piñón', 'Clarice Lispector'],
    correcta: 3,
    explicacion: 'Clarice Lispector (1920-1977) es la escritora más importante de la literatura brasileña del siglo XX. Su obra explora la conciencia desde un lenguaje radicalmente singular.',
  },
  {
    id: 'a05', nivel: 'avanzado', categoria: 'obras',
    pregunta: '¿En qué obra de Samuel Beckett dos personajes esperan eternamente a alguien que no llega?',
    opciones: ['Final de partida', 'Molloy', 'El innombrable', 'Esperando a Godot'],
    correcta: 3,
    explicacion: '"Esperando a Godot" (1952) es la obra cumbre del teatro del absurdo. Vladimiro y Estragón esperan a Godot, que nunca aparece. Nadie sabe quién es Godot.',
  },
  {
    id: 'a06', nivel: 'avanzado', categoria: 'obras',
    pregunta: '¿Qué novela de Juan Rulfo influyó decisivamente en García Márquez y el Boom?',
    opciones: ['El llano en llamas', 'La feria', 'Al filo del agua', 'Pedro Páramo'],
    correcta: 3,
    explicacion: '"Pedro Páramo" (1955) transcurre en el pueblo fantasmal de Comala, México. García Márquez la describió como el libro que lo hizo querer ser escritor.',
  },
  {
    id: 'a07', nivel: 'avanzado', categoria: 'movimientos',
    pregunta: '¿Qué movimiento narrativo francés de los años 50-60 rechazó la psicología de personajes y el argumento tradicional?',
    opciones: ['Existencialismo literario', 'Tel Quel', 'Nouveau Roman', 'Poesía concreta'],
    correcta: 2,
    explicacion: 'El Nouveau Roman (Robbe-Grillet, Sarraute, Butor, Duras) rechazó la omnisciencia narrativa, el personaje psicológico y la novela de tesis. Propuso la objetividad descriptiva.',
  },
  {
    id: 'a08', nivel: 'avanzado', categoria: 'autores',
    pregunta: '¿Qué escritor nigeriano escribió "El mundo se despedaza" (Things Fall Apart)?',
    opciones: ['Wole Soyinka', 'Ben Okri', 'Cyprian Ekwensi', 'Chinua Achebe'],
    correcta: 3,
    explicacion: 'Chinua Achebe (1930-2013) escribió "Things Fall Apart" (1958), la novela africana más leída del mundo. Describe el choque entre la cultura igbo y el colonialismo británico.',
  },
  {
    id: 'a09', nivel: 'avanzado', categoria: 'obras',
    pregunta: '¿Qué novela de Roberto Bolaño sigue a jóvenes poetas que buscan a la escritora Cesárea Tinajero?',
    opciones: ['2666', 'Estrella distante', 'Nocturno de Chile', 'Los detectives salvajes'],
    correcta: 3,
    explicacion: '"Los detectives salvajes" (1998) catapultó a Bolaño a la fama. Su ficticio movimiento «real visceralismo» parodia el estridentismo mexicano. Es la gran novela latinoamericana de los 90.',
  },
  {
    id: 'a10', nivel: 'avanzado', categoria: 'movimientos',
    pregunta: '¿Qué narradora propuso Genette como categoría para describir quién ve/percibe la historia?',
    opciones: ['Voz narrativa', 'Narrador heterodiegético', 'Focalización', 'Perspectiva autorial'],
    correcta: 2,
    explicacion: 'Genette en "Figuras III" (1972) distinguió entre «quién habla» (voz) y «quién ve» (focalización: cero=omnisciente, interna=personaje, externa=observador externo).',
  },
  {
    id: 'a11', nivel: 'avanzado', categoria: 'autores',
    pregunta: '¿Qué escritora austríaca ganó el Nobel de Literatura en 2004?',
    opciones: ['Ingeborg Bachmann', 'Christa Wolf', 'Anna Seghers', 'Elfriede Jelinek'],
    correcta: 3,
    explicacion: 'Elfriede Jelinek (Austria) ganó el Nobel en 2004. Sus novelas revelan, con gran fervor lingüístico, lo absurdo de los clichés sociales y la violencia de género.',
  },
  {
    id: 'a12', nivel: 'avanzado', categoria: 'obras',
    pregunta: '¿En qué año publicó Cervantes la segunda parte del Quijote?',
    opciones: ['1605', '1610', '1615', '1620'],
    correcta: 2,
    explicacion: 'La primera parte es de 1605. La segunda, de 1615, se publicó en parte para adelantarse a la versión apócrifa de Avellaneda (1614), que enfureció a Cervantes.',
  },
  {
    id: 'a13', nivel: 'avanzado', categoria: 'movimientos',
    pregunta: '¿Qué escritores conforman el llamado "trío del realismo mágico" más citado por la crítica?',
    opciones: [
      'García Márquez, Cortázar y Fuentes',
      'García Márquez, Rulfo y Carpentier',
      'Borges, García Márquez y Vargas Llosa',
      'Cortázar, Vargas Llosa y Donoso',
    ],
    correcta: 1,
    explicacion: 'Aunque el Boom fue más amplio, García Márquez, Juan Rulfo y Alejo Carpentier son los tres autores más asociados al realismo mágico como categoría estética específica.',
  },
];

const PREGUNTAS_POR_PARTIDA = 15;

const NIVEL_CONFIG: Record<Nivel, { label: string; emoji: string; color: string; desc: string }> = {
  basico: { label: 'Básico', emoji: '📗', color: '#27AE60', desc: 'Autores y obras conocidas' },
  medio: { label: 'Medio', emoji: '📘', color: '#2E86AB', desc: 'Contexto y técnicas literarias' },
  avanzado: { label: 'Avanzado', emoji: '📕', color: '#8B2635', desc: 'Teoría, movimientos y detalles' },
};

const CATEGORIA_LABEL: Record<Categoria, string> = {
  autores: '✒️ Autores',
  obras: '📖 Obras',
  movimientos: '🎭 Movimientos',
  citas: '💬 Citas',
};

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function seleccionarPreguntas(nivel: Nivel | 'todos'): Pregunta[] {
  const filtradas = nivel === 'todos' ? POOL : POOL.filter(p => p.nivel === nivel);
  return mezclar(filtradas).slice(0, PREGUNTAS_POR_PARTIDA);
}

function evaluacion(aciertos: number, total: number): { label: string; emoji: string; color: string } {
  const pct = aciertos / total;
  if (pct >= 0.9) return { label: '¡Excelente! Dominas la literatura.', emoji: '🏆', color: '#F39C12' };
  if (pct >= 0.7) return { label: 'Muy bien. Buen nivel literario.', emoji: '🌟', color: '#27AE60' };
  if (pct >= 0.5) return { label: 'Bien. Hay terreno por explorar.', emoji: '📚', color: '#2E86AB' };
  return { label: 'Sigue leyendo. El conocimiento llega con tiempo.', emoji: '🌱', color: '#7F8C8D' };
}

export default function QuizLiteraturaUniversal() {
  const [fase, setFase] = useState<Fase>('seleccion');
  const [nivelElegido, setNivelElegido] = useState<Nivel | 'todos'>('todos');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [aciertos, setAciertos] = useState(0);

  const preguntaActual = preguntas[indice] ?? null;

  const evalFinal = useMemo(
    () => (fase === 'resultado' ? evaluacion(aciertos, preguntas.length) : null),
    [fase, aciertos, preguntas.length]
  );

  const handleIniciar = useCallback(() => {
    setPreguntas(seleccionarPreguntas(nivelElegido));
    setIndice(0);
    setSeleccionada(null);
    setRespondida(false);
    setAciertos(0);
    setFase('quiz');
  }, [nivelElegido]);

  function handleRespuesta(idx: number) {
    if (respondida) return;
    setSeleccionada(idx);
    setRespondida(true);
    if (preguntaActual && idx === preguntaActual.correcta) {
      setAciertos(a => a + 1);
    }
  }

  function handleSiguiente() {
    if (indice + 1 >= preguntas.length) {
      setFase('resultado');
    } else {
      setIndice(i => i + 1);
      setSeleccionada(null);
      setRespondida(false);
    }
  }

  function handleReiniciar() {
    setFase('seleccion');
    setIndice(0);
    setSeleccionada(null);
    setRespondida(false);
    setAciertos(0);
  }

  const progreso = preguntas.length > 0 ? Math.round(((indice + (respondida ? 1 : 0)) / preguntas.length) * 100) : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Quiz de Literatura Universal</h1>
        <p className={styles.heroSubtitle}>
          Pon a prueba tus conocimientos literarios: autores, obras, movimientos y citas célebres.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── Pantalla de selección ── */}
        {fase === 'seleccion' && (
          <section className={styles.seleccionBox}>
            <h2 className={styles.seleccionTitle}>Elige el nivel de dificultad</h2>
            <div className={styles.nivelesGrid}>
              {(['basico', 'medio', 'avanzado'] as Nivel[]).map(n => (
                <button
                  key={n}
                  className={`${styles.nivelBtn} ${nivelElegido === n ? styles.nivelBtnActivo : ''}`}
                  style={nivelElegido === n ? { borderColor: NIVEL_CONFIG[n].color, background: NIVEL_CONFIG[n].color + '18' } : {}}
                  onClick={() => setNivelElegido(n)}
                  aria-pressed={nivelElegido === n}
                >
                  <span className={styles.nivelEmoji}>{NIVEL_CONFIG[n].emoji}</span>
                  <span className={styles.nivelLabel}>{NIVEL_CONFIG[n].label}</span>
                  <span className={styles.nivelDesc}>{NIVEL_CONFIG[n].desc}</span>
                </button>
              ))}
              <button
                className={`${styles.nivelBtn} ${nivelElegido === 'todos' ? styles.nivelBtnActivo : ''}`}
                style={nivelElegido === 'todos' ? { borderColor: '#7B5EA7', background: '#7B5EA714' } : {}}
                onClick={() => setNivelElegido('todos')}
                aria-pressed={nivelElegido === 'todos'}
              >
                <span className={styles.nivelEmoji}>🎲</span>
                <span className={styles.nivelLabel}>Mezcla</span>
                <span className={styles.nivelDesc}>Preguntas de todos los niveles</span>
              </button>
            </div>
            <p className={styles.seleccionInfo}>{PREGUNTAS_POR_PARTIDA} preguntas aleatorias · Explicación tras cada respuesta</p>
            <button className={styles.btnIniciar} onClick={handleIniciar}>
              Empezar el quiz →
            </button>
          </section>
        )}

        {/* ── Quiz ── */}
        {fase === 'quiz' && preguntaActual && (
          <section className={styles.quizBox}>
            {/* Cabecera */}
            <div className={styles.quizCabecera}>
              <div className={styles.quizProgreso}>
                <span className={styles.quizNumero}>{indice + 1}/{preguntas.length}</span>
                <div className={styles.progresoBar}>
                  <div className={styles.progresoFill} style={{ width: `${progreso}%` }} />
                </div>
              </div>
              <div className={styles.quizMeta}>
                <span className={styles.quizNivel} style={{ color: NIVEL_CONFIG[preguntaActual.nivel].color }}>
                  {NIVEL_CONFIG[preguntaActual.nivel].emoji} {NIVEL_CONFIG[preguntaActual.nivel].label}
                </span>
                <span className={styles.quizCategoria}>{CATEGORIA_LABEL[preguntaActual.categoria]}</span>
              </div>
            </div>

            {/* Pregunta */}
            <h2 className={styles.pregunta}>{preguntaActual.pregunta}</h2>

            {/* Opciones */}
            <div className={styles.opciones}>
              {preguntaActual.opciones.map((opcion, i) => {
                let estadoClass = '';
                if (respondida) {
                  if (i === preguntaActual.correcta) estadoClass = styles.opcionCorrecta;
                  else if (i === seleccionada) estadoClass = styles.opcionIncorrecta;
                } else if (seleccionada === i) {
                  estadoClass = styles.opcionSeleccionada;
                }
                return (
                  <button
                    key={i}
                    className={`${styles.opcion} ${estadoClass}`}
                    onClick={() => handleRespuesta(i)}
                    disabled={respondida}
                    aria-pressed={seleccionada === i}
                  >
                    <span className={styles.opcionLetra}>{String.fromCharCode(65 + i)}</span>
                    <span className={styles.opcionTexto}>{opcion}</span>
                    {respondida && i === preguntaActual.correcta && <span className={styles.opcionMarca}>✓</span>}
                    {respondida && i === seleccionada && i !== preguntaActual.correcta && <span className={styles.opcionMarca}>✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Explicación */}
            {respondida && (
              <div className={`${styles.explicacion} ${seleccionada === preguntaActual.correcta ? styles.explicacionBien : styles.explicacionMal}`}>
                <p className={styles.explicacionTexto}>{preguntaActual.explicacion}</p>
              </div>
            )}

            {respondida && (
              <button className={styles.btnSiguiente} onClick={handleSiguiente}>
                {indice + 1 < preguntas.length ? 'Siguiente →' : 'Ver resultado'}
              </button>
            )}
          </section>
        )}

        {/* ── Resultado ── */}
        {fase === 'resultado' && evalFinal && (
          <section className={styles.resultadoBox}>
            <div className={styles.resultadoCard}>
              <div className={styles.resultadoHeader} style={{ borderColor: evalFinal.color }}>
                <span className={styles.resultadoEmoji}>{evalFinal.emoji}</span>
                <div>
                  <p className={styles.resultadoPuntuacion}>
                    <strong>{aciertos}</strong> / {preguntas.length} correctas
                  </p>
                  <p className={styles.resultadoLabel}>{evalFinal.label}</p>
                </div>
              </div>

              <div className={styles.resultadoBarra}>
                <div
                  className={styles.resultadoBarraFill}
                  style={{
                    width: `${Math.round((aciertos / preguntas.length) * 100)}%`,
                    background: evalFinal.color,
                  }}
                />
              </div>

              <div className={styles.resultadoBotones}>
                <button className={styles.btnReiniciar} onClick={handleReiniciar}>
                  🔄 Jugar de nuevo
                </button>
              </div>
            </div>
          </section>
        )}

        <EducationalSection title="Literatura universal — guía de referencia" subtitle="Movimientos, autores y obras clave de la historia literaria">
          <div className={styles.guideSection}>
            <p>La literatura universal abarca miles de años de escritura en todas las lenguas. Este quiz cubre un muestreo representativo de las obras y autores que han definido la tradición literaria occidental y latinoamericana.</p>

            <h3>Niveles del quiz</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr><th>Nivel</th><th>Qué evalúa</th><th>Ejemplos de preguntas</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>📗 Básico</td>
                    <td>Autores y obras conocidos, primeras frases famosas</td>
                    <td>¿Quién escribió Cien años de soledad? ¿De qué obra es «Llamadme Ismael»?</td>
                  </tr>
                  <tr>
                    <td>📘 Medio</td>
                    <td>Contexto histórico, técnicas literarias, premios y generaciones</td>
                    <td>¿A qué generación pertenece Lorca? ¿Qué es el flujo de conciencia?</td>
                  </tr>
                  <tr>
                    <td>📕 Avanzado</td>
                    <td>Teoría literaria, crítica, movimientos menores, autores internacionales</td>
                    <td>¿Quién acuñó «defamiliarización»? ¿Qué es el Nouveau Roman?</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>¿Quién usa este quiz?</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>🎓</span>
                  <h4>Estudiante de bachillerato</h4>
                </div>
                <p>Repasa literatura española y universal para el examen. El nivel básico cubre los autores y obras más frecuentes en los temarios.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>📚</span>
                  <h4>Lector curioso</h4>
                </div>
                <p>Quiere saber si sus lecturas le dan una base cultural sólida. El nivel medio mide contexto y técnica, no solo títulos.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>✍️</span>
                  <h4>Escritor en formación</h4>
                </div>
                <p>Usa el quiz para identificar sus lagunas: qué movimientos conoce poco, qué autores debería leer antes de encontrar su voz.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>🏫</span>
                  <h4>Docente de Lengua</h4>
                </div>
                <p>Usa las preguntas como base para actividades de clase: «¿qué movimiento viene después del Romanticismo?».</p>
              </div>
            </div>

            <h3>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Puedo repetir el quiz con preguntas distintas?</h4>
                <p>Sí. Cada partida selecciona 15 preguntas aleatorias del pool. Con varios intentos verás preguntas diferentes, especialmente si juegas en modo «Mezcla».</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Las explicaciones son fuente suficiente para estudiar?</h4>
                <p>Son orientativas y correctas, pero breves. Para un examen, úsalas como recordatorio, no como material de estudio primario. Complementa con manuales de historia literaria.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Por qué hay más preguntas sobre literatura occidental?</h4>
                <p>El quiz refleja la tradición literaria más presente en los programas educativos hispanoamericanos. La literatura africana, asiática y de Oriente Medio tiene menor representación, no por valor literario sino por presencia curricular.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué nivel debo elegir si soy principiante?</h4>
                <p>Empieza por «Básico» para calibrar. Si aciertas más del 80%, sube a «Medio». Si en Medio superas el 70%, prueba «Avanzado». La «Mezcla» es el modo más desafiante.</p>
              </div>
            </div>

            <h3>Estrategia para mejorar</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Haz el nivel básico hasta superar el 85%</h4>
                  <p>Los autores y obras básicos son la base. Sin ellos, el contexto de las preguntas de nivel medio no se entiende.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Lee las explicaciones de los errores</h4>
                  <p>Cada pregunta fallada tiene una explicación concisa. Es el momento de aprendizaje más eficiente del quiz.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Conecta los autores con su movimiento</h4>
                  <p>Muchas preguntas de nivel medio te piden contexto. Memorizar qué autor pertenece a qué movimiento multiplica las respuestas correctas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Complementa con el Visualizador de Estilos Literarios</h4>
                  <p>Cada movimiento literario del visualizador corresponde a un bloque de preguntas del quiz. Úsalos en paralelo.</p>
                </div>
              </div>
            </div>

            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🗓️</span>
                <h4>Ordena por épocas</h4>
                <p>Neoclasicismo → Romanticismo → Realismo → Naturalismo → Modernismo → Vanguardias → Literatura actual.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🌍</span>
                <h4>Agrupa por países</h4>
                <p>Francia (Zola, Proust, Camus), Rusia (Tolstói, Dostoievski), España (Cervantes, Lorca), Latinoamérica (García Márquez, Borges, Rulfo).</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🏆</span>
                <h4>Nobel como referencia</h4>
                <p>Los premios Nobel son un buen mapa: Mistral (1945), Camus (1957), García Márquez (1982), Vargas Llosa (2010).</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>📝</span>
                <h4>Lleva cuenta de los errores</h4>
                <p>Anota qué categoría fallas más (autores, obras, movimientos, citas) y céntrate en esa en la siguiente partida.</p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcono}>⚠️</span>
                <h4>Errores frecuentes en preguntas de literatura</h4>
              </div>
              <ul className={styles.warningList}>
                <li>Confundir el autor de una obra con el narrador o protagonista de la misma.</li>
                <li>Asumir que el autor y su obra pertenecen al mismo país (Kafka era checo pero escribía en alemán).</li>
                <li>Confundir el Modernismo hispánico (Darío, Martí) con el High Modernism anglosajón (Woolf, Joyce).</li>
                <li>Creer que "Boom Latinoamericano" y "Realismo mágico" son sinónimos: el Boom es una generación, el realismo mágico es una técnica.</li>
                <li>Mezclar los libros de la misma saga o del mismo autor sin distinguir cuál es cuál.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('quiz-literatura-universal')} />
      <ShareCard appName="quiz-literatura-universal" />
      <Footer appName="quiz-literatura-universal" />
    </div>
  );
}
