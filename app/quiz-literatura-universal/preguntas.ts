/**
 * Banco de preguntas del quiz de literatura universal.
 *
 * Vive fuera de `page.tsx` desde el 25/08/2026 por dos razones que salen de la inspección:
 *
 *  1. La metadata anunciaba «50 preguntas» y en el banco había 46 (hallazgo 299). La cifra
 *     estaba escrita a mano en cinco sitios, uno de ellos el `faqJsonLd`, que es lo que leen
 *     Bing Copilot y ChatGPT. Con el banco en un módulo propio, `metadata.ts` importa
 *     `TOTAL_PREGUNTAS` y la cifra no puede volver a divergir.
 *
 *  2. La respuesta correcta estaba 0 veces en A, 3 en B, 19 en C y 24 en D, y las opciones
 *     no se barajaban al pintarlas (hallazgo 300): responder siempre «D» sacaba 24/46 sin
 *     saber nada de literatura, y responder siempre «A» sacaba cero garantizado. El sesgo se
 *     corrige barajando en la partida, pero eso solo se puede COMPROBAR contando sobre el
 *     banco, y para contarlo hay que poder importarlo (`tests/quiz-literatura-banco.spec.ts`).
 *
 * Al mover el banco se corrigieron además las imprecisiones de los hallazgos 301, 302, 306,
 * 307 y 308, y se añadieron 10 preguntas para cerrar el 309: un quiz titulado «literatura
 * universal» tenía CERO preguntas de Asia, Oriente Medio o India, y una sola africana.
 */

export type Nivel = 'basico' | 'medio' | 'avanzado';
export type Categoria = 'autores' | 'obras' | 'movimientos' | 'citas';

export interface Pregunta {
  id: string;
  nivel: Nivel;
  categoria: Categoria;
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

export const POOL: Pregunta[] = [
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
    explicacion: 'El realismo mágico narra hechos extraordinarios con la misma naturalidad que los cotidianos. García Márquez es su nombre más asociado, junto a Juan Rulfo.',
  },
  {
    id: 'b05', nivel: 'basico', categoria: 'autores',
    pregunta: '¿Quién creó al detective Sherlock Holmes?',
    opciones: ['Edgar Allan Poe', 'Agatha Christie', 'Arthur Conan Doyle', 'G.K. Chesterton'],
    correcta: 2,
    // Hallazgo 301: la explicación decía que Holmes «fue el primer detective moderno de la
    // ficción», y Poe —que figura como distractor en esta misma pregunta— le precede en 46
    // años con Auguste Dupin. La app desmentía a quien dudaba por el motivo correcto.
    explicacion: 'Doyle creó a Holmes en 1887 con "Estudio en escarlata". El personaje apareció en 4 novelas y 56 relatos cortos. No fue el primer detective de la ficción: le precede el Auguste Dupin de Edgar Allan Poe ("Los crímenes de la calle Morgue", 1841), a quien la crítica sitúa como el modelo del género.',
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
    // Hallazgo 306: se rotulaba «Obras» siendo una pregunta de autor idéntica en forma a b01.
    id: 'b08', nivel: 'basico', categoria: 'autores',
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
    // Hallazgo 306: misma forma que b03 y b08 — pregunta por el autor, no por la obra.
    id: 'b10', nivel: 'basico', categoria: 'autores',
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
  {
    // Hallazgo 309 — literatura de Asia
    id: 'b18', nivel: 'basico', categoria: 'obras',
    pregunta: '¿Qué obra japonesa del siglo XI, escrita por Murasaki Shikibu, se cita a menudo como una de las primeras novelas de la literatura universal?',
    opciones: ['La historia de Genji', 'El libro de la almohada', 'Cuentos de Ise', 'Heike monogatari'],
    correcta: 0,
    explicacion: '"La historia de Genji" (Genji monogatari) la escribió hacia 1010 Murasaki Shikibu, dama de la corte Heian. Con más de mil páginas y decenas de personajes con vida psicológica propia, muchos críticos la consideran la primera novela del mundo. "El libro de la almohada", de Sei Shōnagon, es de la misma corte y los mismos años, pero no es una novela.',
  },
  {
    // Hallazgo 309 — literatura árabe
    id: 'b19', nivel: 'basico', categoria: 'obras',
    pregunta: '¿De qué colección proceden los relatos de Simbad, Aladino y Alí Babá?',
    opciones: ['Las mil y una noches', 'El Panchatantra', 'El Decamerón', 'Calila y Dimna'],
    correcta: 0,
    explicacion: 'Sherezade cuenta un relato cada noche para aplazar su ejecución. El núcleo árabe-persa se fue formando desde el siglo IX. Aladino y Alí Babá, en cambio, no están en los manuscritos árabes conocidos: los añadió el traductor francés Antoine Galland a principios del siglo XVIII.',
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
    // Hallazgo 308: decía «entre 1877 y 1878». La serialización empezó en 1875.
    explicacion: 'Tolstói la publicó por entregas en El Mensajero Ruso desde 1875, y en volumen en 1878. Junto con "Guerra y paz" representa la cúspide del realismo ruso del siglo XIX.',
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
    // Hallazgo 306: pregunta por un PERSONAJE, no por un autor.
    id: 'm15', nivel: 'medio', categoria: 'obras',
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
  {
    // Hallazgo 309 — literatura de la India
    id: 'm17', nivel: 'medio', categoria: 'autores',
    pregunta: '¿Qué poeta indio, autor de "Gitanjali", fue el primer no europeo en recibir el Nobel de Literatura?',
    opciones: ['Rabindranath Tagore', 'R. K. Narayan', 'Muhammad Iqbal', 'Premchand'],
    correcta: 0,
    explicacion: 'Tagore lo recibió en 1913 por "Gitanjali", que él mismo tradujo del bengalí al inglés. Escribió además las letras de los himnos nacionales de India y de Bangladés.',
  },
  {
    // Hallazgo 309 — literatura árabe contemporánea
    id: 'm18', nivel: 'medio', categoria: 'autores',
    pregunta: '¿Qué escritor egipcio, autor de la "Trilogía de El Cairo", ganó el Nobel de Literatura en 1988?',
    opciones: ['Naguib Mahfuz', 'Taha Husein', 'Tawfiq al-Hakim', 'Yusuf Idris'],
    correcta: 0,
    explicacion: 'Mahfuz es el único escritor en lengua árabe que ha ganado el Nobel. La "Trilogía de El Cairo" (1956-1957) sigue a tres generaciones de una familia entre las dos guerras mundiales.',
  },
  {
    // Hallazgo 309 — poética japonesa
    id: 'm19', nivel: 'medio', categoria: 'movimientos',
    pregunta: '¿Qué forma poética japonesa de tres versos y 17 moras llevó a su cumbre Matsuo Bashō en el siglo XVII?',
    opciones: ['El haiku', 'El tanka', 'El renga', 'El kanshi'],
    correcta: 0,
    explicacion: 'Bashō elevó a género autónomo el hokku, el terceto de 5-7-5 que abría un renga encadenado; el nombre «haiku» se generalizó después, con Masaoka Shiki, a finales del XIX. El tanka tiene cinco versos (5-7-5-7-7).',
  },
  // ── AVANZADO ──
  {
    id: 'a01', nivel: 'avanzado', categoria: 'movimientos',
    pregunta: '¿Qué concepto de Bajtín describe la coexistencia de múltiples voces autónomas en Dostoievski?',
    opciones: ['Intertextualidad', 'Defamiliarización', 'Novela polifónica', 'Dialéctica narrativa'],
    correcta: 2,
    // Hallazgo 308: «Problemas de la poética de Dostoievski» es el título de la segunda
    // edición, de 1963; la de 1929 se llamó «Problemas de la obra de Dostoievski».
    explicacion: 'Bajtín lo formuló en 1929, en el libro que entonces se llamó "Problemas de la obra de Dostoievski" y que en su edición revisada de 1963 pasó a titularse "Problemas de la poética de Dostoievski": cada personaje tiene una voz autónoma con su propia verdad, sin que el narrador la subordine.',
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
    // Hallazgo 308: el «real visceralismo» remite al infrarrealismo que Bolaño cofundó, no
    // al estridentismo, que es el estrato de los años 20 al que pertenece Cesárea Tinajero.
    explicacion: '"Los detectives salvajes" (1998) catapultó a Bolaño a la fama. Su «real visceralismo» transfigura el infrarrealismo que el propio Bolaño cofundó en el México de los años 70; el estridentismo, en cambio, es la vanguardia de los años 20 a la que pertenece la Cesárea Tinajero que los personajes buscan.',
  },
  {
    // Hallazgo 307: el enunciado decía «¿Qué narradora propuso Genette…?», que pide una
    // persona, mientras la clave da un concepto.
    id: 'a10', nivel: 'avanzado', categoria: 'movimientos',
    pregunta: '¿Qué categoría propuso Genette para describir quién ve o percibe la historia, frente a quién la cuenta?',
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
    // Hallazgo 302: la pregunta anterior daba por hecho un «trío del realismo mágico más
    // citado por la crítica» que no existe como consenso, y encima Carpentier acuñó «lo real
    // maravilloso» precisamente para separarse de esa etiqueta. Se sustituye por el dato
    // verificable del que sale toda la discusión: de dónde viene el término.
    id: 'a13', nivel: 'avanzado', categoria: 'movimientos',
    pregunta: '¿Quién acuñó el término «realismo mágico» en 1925, y a propósito de qué arte?',
    opciones: [
      'Franz Roh, a propósito de la pintura',
      'Ángel Flores, a propósito de la narrativa',
      'Alejo Carpentier, a propósito de la música',
      'Arturo Uslar Pietri, a propósito de la poesía',
    ],
    correcta: 0,
    explicacion: 'El crítico de arte alemán Franz Roh lo usó en 1925 para la pintura postexpresionista alemana. Solo décadas después pasó a la crítica literaria hispanoamericana, con Ángel Flores (1955) y Luis Leal (1967). Alejo Carpentier, por su parte, prefirió hablar de «lo real maravilloso» para marcar distancias con la etiqueta europea.',
  },
  {
    // Hallazgo 309 — narrativa clásica china
    id: 'a14', nivel: 'avanzado', categoria: 'obras',
    pregunta: '¿Qué novela china del siglo XVIII, atribuida a Cao Xueqin, retrata la decadencia de una familia aristocrática?',
    opciones: ['Sueño en el pabellón rojo', 'Viaje al Oeste', 'A la orilla del agua', 'Jin Ping Mei'],
    correcta: 0,
    explicacion: 'Es una de las cuatro grandes novelas clásicas chinas, y la que sostiene una disciplina académica propia, la «redología». Cao Xueqin murió hacia 1763 dejándola inconclusa: los últimos cuarenta capítulos de la edición impresa de 1791 son de otra mano.',
  },
  {
    // Hallazgo 309 — narrativa china contemporánea
    id: 'a15', nivel: 'avanzado', categoria: 'autores',
    pregunta: '¿Qué escritor recibió el Nobel de Literatura en 2012 por una obra que «funde cuentos populares, historia y contemporaneidad»?',
    opciones: ['Mo Yan', 'Yu Hua', 'Yan Lianke', 'Su Tong'],
    correcta: 0,
    explicacion: 'Mo Yan («no hables», seudónimo de Guan Moye) es el primer escritor de nacionalidad china que gana el Nobel. Gao Xingjian lo había recibido en 2000, ya como ciudadano francés.',
  },
  {
    // Hallazgo 309 — poesía persa
    id: 'a16', nivel: 'avanzado', categoria: 'autores',
    pregunta: '¿Qué poeta persa del siglo XIII es autor del "Masnavi", una de las obras centrales del sufismo?',
    opciones: ['Yalal ad-Din Rumi', 'Hafez de Shiraz', 'Omar Jayam', 'Saadi'],
    correcta: 0,
    explicacion: 'Rumi (1207-1273) compuso en Konya los más de 25.000 dísticos del "Masnavi-ye Ma\'navi". Jayam es el de las "Rubaiyat", del siglo XI-XII; Hafez y Saadi son ambos de Shiraz y posteriores a Rumi.',
  },
  {
    // Hallazgo 309 — narrativa coreana contemporánea
    id: 'a17', nivel: 'avanzado', categoria: 'autores',
    pregunta: '¿Qué autora surcoreana ganó el Premio Booker Internacional en 2016 por "La vegetariana"?',
    opciones: ['Han Kang', 'Bae Suah', 'Kyung-sook Shin', 'Hwang Sok-yong'],
    correcta: 0,
    explicacion: 'Han Kang lo ganó junto a su traductora Deborah Smith, como marca el reglamento del premio. En 2024 recibió además el Nobel de Literatura, la primera escritora asiática en lograrlo.',
  },
  {
    // Hallazgo 298 — el nivel avanzado tenía 13 preguntas y la partida prometía 15, así que
    // siempre servía el nivel entero y no variaba nunca entre partidas.
    id: 'a18', nivel: 'avanzado', categoria: 'citas',
    pregunta: '¿Qué novela empieza con «Todas las familias felices se parecen; cada familia infeliz lo es a su manera»?',
    opciones: ['Ana Karenina', 'Guerra y paz', 'Padres e hijos', 'Oblómov'],
    correcta: 0,
    explicacion: 'Es el arranque de "Ana Karenina" (1875-1878) de Tolstói, tan citado que se le conoce como «el principio de Ana Karenina»: se usa fuera de la literatura para describir los procesos en los que el éxito exige que no falle ninguna condición y el fracaso solo necesita que falle una.',
  },
];

/** Cifra viva del banco. La usa la metadata para no volver a prometer preguntas que no hay. */
export const TOTAL_PREGUNTAS = POOL.length;

/** Cuántas preguntas tiene cada nivel. Lo que la pantalla de selección debe anunciar. */
export function preguntasDeNivel(nivel: Nivel | 'todos'): Pregunta[] {
  return nivel === 'todos' ? POOL : POOL.filter(p => p.nivel === nivel);
}
