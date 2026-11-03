/**
 * Motor de preposiciones-ingles: el banco de ejercicios numerados de in, on, at (y los casos sin
 * preposición), el corrector de lo que escribe un alumno y la explicación de cada caso.
 *
 * Sin React ni navegador: lo prueban los casos resueltos a mano de
 * `tests/preposiciones-ingles-motor.spec.ts` (en `npm run test:calc`).
 *
 * Criterio del banco. Cada frase tiene UNA lectura natural y su conjunto de respuestas admitidas
 * escrito a mano. Donde dos preposiciones valen con el MISMO sentido porque cambia la variedad
 * (at the weekend británico / on the weekend americano; in the street / on the street; in Main
 * Street / on Main Street), se admiten las dos. Donde dos preposiciones dan frases correctas con
 * sentidos DISTINTOS (at the park / in the park; at the corner / on the corner; in the night de
 * una noche concreta / at night en general), la frase no entra o lleva contexto que deja una sola.
 *
 * Fuentes: Cambridge Grammar (English Grammar Today: «at, in and on: time», «at, in and on:
 * place», «at, in and on: addresses») y Oxford Learner's Dictionaries (entradas at, in, on,
 * weekend y street, con sus notas de uso británico y americano).
 */

export type Preposicion = 'in' | 'on' | 'at' | 'ninguna';

export const PREPOSICIONES: Preposicion[] = ['in', 'on', 'at', 'ninguna'];

export type Categoria = 'tiempo' | 'lugar' | 'sin';

export const CATEGORIAS: Categoria[] = ['tiempo', 'lugar', 'sin'];

export type IdRegla =
  | 'hora'
  | 'momento'
  | 'fin-de-semana'
  | 'dias'
  | 'dia-con-parte'
  | 'partes-dia'
  | 'periodos'
  | 'plazo'
  | 'punto'
  | 'actividad'
  | 'direccion'
  | 'interior'
  | 'zona'
  | 'superficie'
  | 'transporte'
  | 'coche'
  | 'planta'
  | 'calle'
  | 'calle-nombre'
  | 'lado'
  | 'medios'
  | 'sin-tiempo'
  | 'home';

export interface Ejercicio {
  /** Número estable, el que se ve en pantalla y el que asigna un profesor. */
  numero: number;
  categoria: Categoria;
  /** Frase en inglés con el hueco escrito «___». */
  frase: string;
  /** Lo que dice la frase, en español. */
  traduccion: string;
  /** Respuestas que se dan por buenas, escritas a mano. */
  admitidas: Preposicion[];
  regla: IdRegla;
  /** Lo que decide la preposición en esta frase («8 o'clock», «the bus»), para la explicación. */
  clave: string;
}

/** El hueco de las frases. */
export const HUECO = '___';

/**
 * El banco. Del 1 al 20, tiempo; del 21 al 41, lugar; del 42 al 50, sin preposición. Los números
 * no se reutilizan: si una frase sale del banco, su número queda libre y no se corre el resto,
 * porque un profesor puede tener asignados «los ejercicios 3, 7 y 11».
 */
export const EJERCICIOS: Ejercicio[] = [
  // ── Tiempo ────────────────────────────────────────────────────────────────
  { numero: 1, categoria: 'tiempo', frase: "The film starts ___ 8 o'clock.", traduccion: 'La película empieza a las 8.', admitidas: ['at'], regla: 'hora', clave: "8 o'clock" },
  { numero: 2, categoria: 'tiempo', frase: 'The train leaves ___ half past six.', traduccion: 'El tren sale a las seis y media.', admitidas: ['at'], regla: 'hora', clave: 'half past six' },
  { numero: 3, categoria: 'tiempo', frase: 'I usually go to bed ___ midnight.', traduccion: 'Normalmente me acuesto a medianoche.', admitidas: ['at'], regla: 'momento', clave: 'midnight' },
  { numero: 4, categoria: 'tiempo', frase: 'Owls hunt ___ night.', traduccion: 'Los búhos cazan de noche.', admitidas: ['at'], regla: 'momento', clave: 'night' },
  { numero: 5, categoria: 'tiempo', frase: 'The shop closes ___ noon.', traduccion: 'La tienda cierra a mediodía.', admitidas: ['at'], regla: 'momento', clave: 'noon' },
  { numero: 6, categoria: 'tiempo', frase: "I'll see you ___ lunchtime.", traduccion: 'Te veo a la hora del almuerzo.', admitidas: ['at'], regla: 'momento', clave: 'lunchtime' },
  { numero: 7, categoria: 'tiempo', frase: 'What are you doing ___ the weekend?', traduccion: '¿Qué haces el fin de semana?', admitidas: ['at', 'on'], regla: 'fin-de-semana', clave: 'the weekend' },
  { numero: 8, categoria: 'tiempo', frase: 'The concert is ___ Friday.', traduccion: 'El concierto es el viernes.', admitidas: ['on'], regla: 'dias', clave: 'Friday' },
  { numero: 9, categoria: 'tiempo', frase: 'We met ___ my birthday.', traduccion: 'Nos conocimos el día de mi cumpleaños.', admitidas: ['on'], regla: 'dias', clave: 'my birthday' },
  { numero: 10, categoria: 'tiempo', frase: 'Classes start ___ 2 September.', traduccion: 'Las clases empiezan el 2 de septiembre.', admitidas: ['on'], regla: 'dias', clave: '2 September' },
  { numero: 11, categoria: 'tiempo', frase: 'Many shops are closed ___ Christmas Day.', traduccion: 'Muchas tiendas cierran el día de Navidad.', admitidas: ['on'], regla: 'dias', clave: 'Christmas Day' },
  { numero: 12, categoria: 'tiempo', frase: 'We have an exam ___ Monday morning.', traduccion: 'Tenemos un examen el lunes por la mañana.', admitidas: ['on'], regla: 'dia-con-parte', clave: 'Monday morning' },
  { numero: 13, categoria: 'tiempo', frase: 'I go jogging ___ the morning.', traduccion: 'Salgo a correr por la mañana.', admitidas: ['in'], regla: 'partes-dia', clave: 'the morning' },
  { numero: 14, categoria: 'tiempo', frase: 'We play tennis ___ the afternoon.', traduccion: 'Jugamos al tenis por la tarde.', admitidas: ['in'], regla: 'partes-dia', clave: 'the afternoon' },
  { numero: 15, categoria: 'tiempo', frase: 'She was born ___ 2010.', traduccion: 'Nació en 2010.', admitidas: ['in'], regla: 'periodos', clave: '2010' },
  { numero: 16, categoria: 'tiempo', frase: "My sister's wedding is ___ June.", traduccion: 'La boda de mi hermana es en junio.', admitidas: ['in'], regla: 'periodos', clave: 'June' },
  { numero: 17, categoria: 'tiempo', frase: 'We go to the beach ___ summer.', traduccion: 'Vamos a la playa en verano.', admitidas: ['in'], regla: 'periodos', clave: 'summer' },
  { numero: 18, categoria: 'tiempo', frase: 'The internet became popular ___ the 1990s.', traduccion: 'Internet se popularizó en los años noventa.', admitidas: ['in'], regla: 'periodos', clave: 'the 1990s' },
  { numero: 19, categoria: 'tiempo', frase: 'Tenochtitlan was founded ___ the 14th century.', traduccion: 'Tenochtitlan, hoy Ciudad de México, se fundó en el siglo XIV.', admitidas: ['in'], regla: 'periodos', clave: 'the 14th century' },
  { numero: 20, categoria: 'tiempo', frase: 'The bus will be here ___ ten minutes.', traduccion: 'El bus llega dentro de diez minutos.', admitidas: ['in'], regla: 'plazo', clave: 'ten minutes' },

  // ── Lugar ─────────────────────────────────────────────────────────────────
  { numero: 21, categoria: 'lugar', frase: 'Wait for me ___ the bus stop.', traduccion: 'Espérame en la parada del bus.', admitidas: ['at'], regla: 'punto', clave: 'the bus stop' },
  { numero: 22, categoria: 'lugar', frase: 'Turn left ___ the traffic lights.', traduccion: 'Gira a la izquierda en el semáforo.', admitidas: ['at'], regla: 'punto', clave: 'the traffic lights' },
  { numero: 23, categoria: 'lugar', frase: 'I left my phone ___ home.', traduccion: 'Me dejé el teléfono en casa.', admitidas: ['at'], regla: 'actividad', clave: 'home' },
  { numero: 24, categoria: 'lugar', frase: 'My parents are ___ work right now.', traduccion: 'Mis padres están en el trabajo ahora mismo.', admitidas: ['at'], regla: 'actividad', clave: 'work' },
  { numero: 25, categoria: 'lugar', frase: 'We met ___ a party.', traduccion: 'Nos conocimos en una fiesta.', admitidas: ['at'], regla: 'actividad', clave: 'a party' },
  { numero: 26, categoria: 'lugar', frase: 'They live ___ 42 Elm Street.', traduccion: 'Viven en el número 42 de Elm Street.', admitidas: ['at'], regla: 'direccion', clave: '42 Elm Street' },
  { numero: 27, categoria: 'lugar', frase: 'I put the toys back ___ the box and closed the lid.', traduccion: 'Volví a meter los juguetes en la caja y cerré la tapa.', admitidas: ['in'], regla: 'interior', clave: 'the box' },
  { numero: 28, categoria: 'lugar', frase: "There's some cold milk ___ the fridge.", traduccion: 'Hay leche fría en el refrigerador.', admitidas: ['in'], regla: 'interior', clave: 'the fridge' },
  { numero: 29, categoria: 'lugar', frase: 'Dad is cooking ___ the kitchen.', traduccion: 'Papá está cocinando en la cocina.', admitidas: ['in'], regla: 'interior', clave: 'the kitchen' },
  { numero: 30, categoria: 'lugar', frase: 'My cousin lives ___ Peru.', traduccion: 'Mi primo vive en Perú.', admitidas: ['in'], regla: 'zona', clave: 'Peru' },
  { numero: 31, categoria: 'lugar', frase: 'She grew up ___ a small town.', traduccion: 'Creció en un pueblo pequeño.', admitidas: ['in'], regla: 'zona', clave: 'a small town' },
  { numero: 32, categoria: 'lugar', frase: "There's a beautiful painting ___ the wall.", traduccion: 'Hay un cuadro precioso en la pared.', admitidas: ['on'], regla: 'superficie', clave: 'the wall' },
  { numero: 33, categoria: 'lugar', frase: 'Your glasses are ___ the table.', traduccion: 'Tus lentes están en la mesa.', admitidas: ['on'], regla: 'superficie', clave: 'the table' },
  { numero: 34, categoria: 'lugar', frase: 'I always read ___ the train.', traduccion: 'Siempre leo en el tren.', admitidas: ['on'], regla: 'transporte', clave: 'the train' },
  { numero: 35, categoria: 'lugar', frase: 'There were 200 people ___ the plane.', traduccion: 'Había 200 personas en el avión.', admitidas: ['on'], regla: 'transporte', clave: 'the plane' },
  { numero: 36, categoria: 'lugar', frase: 'She left her umbrella ___ the taxi.', traduccion: 'Se dejó el paraguas en el taxi.', admitidas: ['in'], regla: 'coche', clave: 'the taxi' },
  { numero: 37, categoria: 'lugar', frase: 'Our office is ___ the third floor.', traduccion: 'Nuestra oficina está en el tercer piso.', admitidas: ['on'], regla: 'planta', clave: 'the third floor' },
  { numero: 38, categoria: 'lugar', frase: 'The children were playing ___ the street.', traduccion: 'Los niños jugaban en la calle.', admitidas: ['in', 'on'], regla: 'calle', clave: 'the street' },
  { numero: 39, categoria: 'lugar', frase: 'The bank is ___ Main Street.', traduccion: 'El banco está en Main Street.', admitidas: ['on', 'in'], regla: 'calle-nombre', clave: 'Main Street' },
  { numero: 40, categoria: 'lugar', frase: 'The bathroom is ___ the left.', traduccion: 'El baño está a la izquierda.', admitidas: ['on'], regla: 'lado', clave: 'the left' },
  { numero: 41, categoria: 'lugar', frase: 'I saw the news ___ TV.', traduccion: 'Vi las noticias en la tele.', admitidas: ['on'], regla: 'medios', clave: 'TV' },

  // ── Sin preposición ───────────────────────────────────────────────────────
  { numero: 42, categoria: 'sin', frase: "I'll call you ___ next week.", traduccion: 'Te llamo la semana que viene.', admitidas: ['ninguna'], regla: 'sin-tiempo', clave: 'next week' },
  { numero: 43, categoria: 'sin', frase: 'We went to the cinema ___ last Friday.', traduccion: 'Fuimos al cine el viernes pasado.', admitidas: ['ninguna'], regla: 'sin-tiempo', clave: 'last Friday' },
  { numero: 44, categoria: 'sin', frase: 'I go to the gym ___ every day.', traduccion: 'Voy al gimnasio todos los días.', admitidas: ['ninguna'], regla: 'sin-tiempo', clave: 'every day' },
  { numero: 45, categoria: 'sin', frase: 'I saw him ___ this morning.', traduccion: 'Lo vi esta mañana.', admitidas: ['ninguna'], regla: 'sin-tiempo', clave: 'this morning' },
  { numero: 46, categoria: 'sin', frase: "Let's go to the beach ___ tomorrow.", traduccion: 'Vamos a la playa mañana.', admitidas: ['ninguna'], regla: 'sin-tiempo', clave: 'tomorrow' },
  { numero: 47, categoria: 'sin', frase: 'What are you doing ___ tonight?', traduccion: '¿Qué haces esta noche?', admitidas: ['ninguna'], regla: 'sin-tiempo', clave: 'tonight' },
  { numero: 48, categoria: 'sin', frase: 'My grandparents visit us ___ every summer.', traduccion: 'Mis abuelos nos visitan cada verano.', admitidas: ['ninguna'], regla: 'sin-tiempo', clave: 'every summer' },
  { numero: 49, categoria: 'sin', frase: 'We moved here ___ last year.', traduccion: 'Nos mudamos aquí el año pasado.', admitidas: ['ninguna'], regla: 'sin-tiempo', clave: 'last year' },
  { numero: 50, categoria: 'sin', frase: "It's late. Let's go ___ home.", traduccion: 'Es tarde. Vámonos a casa.', admitidas: ['ninguna'], regla: 'home', clave: 'home' },
];

export const TOTAL_EJERCICIOS = EJERCICIOS.length;

const POR_NUMERO = new Map(EJERCICIOS.map((e) => [e.numero, e]));

export function ejercicioPorNumero(numero: number): Ejercicio | undefined {
  return POR_NUMERO.get(numero);
}

export function ejerciciosDe(categorias: Categoria[]): Ejercicio[] {
  const elegidas = new Set(categorias);
  return EJERCICIOS.filter((e) => elegidas.has(e.categoria));
}

/** Primer y último número de una categoría, para decirlo en pantalla sin escribirlo a mano. */
export function rangoDe(categoria: Categoria): string {
  const numeros = ejerciciosDe([categoria]).map((e) => e.numero);
  return `del ${Math.min(...numeros)} al ${Math.max(...numeros)}`;
}

// ─── Reglas ──────────────────────────────────────────────────────────────────

/**
 * La regla de cada caso, aplicada a la palabra que decide (la `clave` del ejercicio). Cada texto
 * dice por qué va esa preposición y qué cambiaría si la frase cambiara.
 */
const REGLAS: Record<IdRegla, (clave: string) => string> = {
  hora: (c) => `«${c}» es una hora exacta, un punto del reloj: con las horas se usa at (at ${c}).`,
  momento: (c) =>
    `«${c}» es un momento puntual del día y va con at: at night, at noon, at midnight, at lunchtime. Por eso at ${c}. Ojo: es at night, sin artículo; «in the night» solo se dice de una noche concreta (I woke up in the night).`,
  'fin-de-semana': () =>
    'Las dos valen: at the weekend es la forma británica y on the weekend la americana. «in the weekend» no se usa en ninguna de las dos.',
  dias: (c) =>
    `«${c}» es un día o una fecha: con los días de la semana, las fechas y los días señalados se usa on (on ${c}). En inglés americano informal a veces se omite, pero en un examen se escribe on.`,
  'dia-con-parte': (c) =>
    `«${c}» nombra el día, y cuando hay día manda el día: on ${c}. Sin el día sería in the morning.`,
  'partes-dia': (c) =>
    `«${c}» es una parte del día: in the morning, in the afternoon, in the evening. Si delante va el día, pasa a on (on Monday morning); la noche es la excepción: at night.`,
  periodos: (c) =>
    `«${c}» es un periodo largo —mes, año, estación, década o siglo— y va con in: in ${c}.`,
  plazo: (c) =>
    `Para decir «dentro de» un plazo se usa in: in ${c} es «dentro de» ese tiempo, contado desde ahora.`,
  punto: (c) =>
    `«${c}» se ve como un punto, un sitio donde se está o se para, no como un espacio por dentro: at ${c}.`,
  actividad: (c) =>
    `Con los sitios a los que se va a hacer algo —home, work, school, una fiesta, un concierto— se usa at: at ${c}.`,
  direccion: (c) =>
    `Con una dirección completa, con número, se usa at: at ${c}. Solo con el nombre de la calle sería on (o in, en británico).`,
  interior: (c) =>
    `«${c}» es un espacio cerrado, algo que tiene dentro: lo que está dentro va con in (in ${c}).`,
  zona: (c) =>
    `«${c}» es una ciudad, un país o una zona con límites: se usa in (in ${c}).`,
  superficie: (c) =>
    `«${c}» es una superficie: lo que está encima o pegado a ella va con on (on ${c}).`,
  transporte: (c) =>
    `En los transportes en los que se puede ir de pie o caminar —bus, tren, avión, barco— y en la bici o la moto se usa on: on ${c}. En el coche (carro o auto) y el taxi, in.`,
  coche: (c) =>
    `En un coche (carro o auto) o un taxi no se puede ir de pie: se usa in (in ${c}). En el bus, el tren o el avión, on.`,
  planta: (c) =>
    `Las plantas de un edificio son superficies, una encima de otra: on ${c}.`,
  calle: () =>
    'Las dos valen: in the street es la forma británica y on the street la americana. Con at no: at se reserva para una dirección con número.',
  'calle-nombre': (c) =>
    `Con el nombre de una calle, on ${c} vale en inglés americano y británico; el británico también dice in ${c}. Con número sería at (at 42 ${c}).`,
  lado: (c) => `Para los lados se usa on: on ${c}, on the right.`,
  medios: (c) =>
    `Con los medios —TV, la radio, internet, el teléfono— se usa on: on ${c}, on the radio, on the phone.`,
  'sin-tiempo': (c) =>
    `Con next, last, this y every, y con today, tomorrow, yesterday y tonight, no se pone preposición: «${c}», no «on ${c}» ni «in ${c}».`,
  home: () =>
    'Con verbos de movimiento, home no lleva preposición: go home, come home, get home. Para estar en casa sí: at home.',
};

/** La regla que explica el ejercicio, aplicada a su caso. */
export function explicacion(ejercicio: Ejercicio): string {
  return REGLAS[ejercicio.regla](ejercicio.clave);
}

// ─── Formas y corrector ──────────────────────────────────────────────────────

/** Cómo se nombra una respuesta en pantalla. */
export function etiqueta(p: Preposicion): string {
  return p === 'ninguna' ? '— (sin preposición)' : p;
}

/** La frase con el hueco rellenado. Sin preposición, el hueco desaparece con su espacio. */
export function fraseCompleta(ejercicio: Ejercicio, respuesta: Preposicion | Preposicion[]): string {
  const lista = Array.isArray(respuesta) ? respuesta : [respuesta];
  const texto = lista.filter((p) => p !== 'ninguna').join(' / ');
  return ejercicio.frase.replace(HUECO, texto).replace(/\s{2,}/g, ' ').replace(/\s+([?.!,])/g, '$1');
}

/** La forma correcta, con todas las admitidas: «What are you doing at / on the weekend?». */
export function formaCorrecta(ejercicio: Ejercicio): string {
  return fraseCompleta(ejercicio, ejercicio.admitidas);
}

/**
 * Pasa a minúsculas, quita comillas y la puntuación del final o de alrededor, y deja un solo
 * espacio entre palabras. Los guiones se conservan: «-» es la forma de escribir «sin preposición».
 */
export function normalizar(entrada: string): string {
  return entrada
    .toLowerCase()
    .normalize('NFC')
    .replace(/[.!?¡¿"«»“”‘’'`()]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lo que un alumno escribe para decir «aquí no va ninguna». */
const SIN_PREPOSICION = new Set(['-', '—', '–', '--', 'ninguna', 'ninguno', 'nada', 'none', 'nothing', 'ø', '∅', 'x']);

/** Expresiones de varias palabras que significan lo mismo. */
const SIN_PREPOSICION_FRASES = /(sin preposici[oó]n|no preposition|no lleva|ninguna preposici[oó]n)/g;

/** Palabras de enlace entre dos respuestas («at o on», «in / on»). */
const ENLACES = new Set(['o', 'or', 'y', 'and', 'u']);

/**
 * Lee lo que se ha escrito. Devuelve las preposiciones que contiene, o `null` si hay algo que
 * no es ninguna de las cuatro respuestas posibles (una palabra cualquiera, «into», «to»…).
 */
export function interpretar(entrada: string): Preposicion[] | null {
  const limpia = normalizar(entrada).replace(SIN_PREPOSICION_FRASES, ' — ');
  const tokens = limpia.split(/[\s/,;|]+/).filter((t) => t !== '' && !ENLACES.has(t));
  if (tokens.length === 0) return null;
  const formas: Preposicion[] = [];
  for (const t of tokens) {
    let p: Preposicion | null = null;
    if (t === 'in' || t === 'on' || t === 'at') p = t;
    else if (SIN_PREPOSICION.has(t)) p = 'ninguna';
    if (p === null) return null;
    if (!formas.includes(p)) formas.push(p);
  }
  return formas;
}

export interface Correccion {
  correcta: boolean;
  /** Lo que se ha entendido de la respuesta; `null` si no es ninguna de las cuatro posibles. */
  formas: Preposicion[] | null;
}

/**
 * Corrige una respuesta. Es correcta si dice AL MENOS una preposición y TODAS las que dice son
 * admitidas: «at / on» vale para el fin de semana, pero no para el viernes, porque dar por buena
 * la respuesta cuando una de las dos acierta sería premiar escribirlas todas.
 */
export function corregir(ejercicio: Ejercicio, respuesta: string): Correccion {
  const formas = interpretar(respuesta);
  const correcta = formas !== null && formas.every((f) => ejercicio.admitidas.includes(f));
  return { correcta, formas };
}

// ─── Selección por números ───────────────────────────────────────────────────

export type Seleccion = { ok: true; numeros: number[] } | { ok: false; error: string };

const RANGO = /^(\d+)-(\d+)$/;
const ENTERO = /^\d+$/;

/**
 * Lee «3, 7, 11», «5-9», «3 7 11» o «2, 5-8 y 12». Conserva el orden en que se escriben y quita
 * los repetidos. Un número que no existe, o algo que no es un número, da un error que lo nombra.
 * Son números de ejercicio, enteros sin separador de miles: no pasan por el parser decimal.
 */
export function leerSeleccion(texto: string, existentes: number[] = EJERCICIOS.map((e) => e.numero)): Seleccion {
  const validos = new Set(existentes);
  const minimo = Math.min(...existentes);
  const maximo = Math.max(...existentes);
  const limpio = texto.trim().replace(/\s*[-–—]\s*/g, '-');
  if (limpio === '') return { ok: false, error: 'Escribe los números de los ejercicios, por ejemplo «3, 7, 11» o «5-9».' };
  const trozos = limpio.split(/[\s,;]+/).filter((t) => t !== '' && t !== 'y' && t !== 'e');
  const numeros: number[] = [];
  const inexistentes: number[] = [];
  for (const trozo of trozos) {
    const rango = trozo.match(RANGO);
    let lista: number[];
    if (rango) {
      const a = Number(rango[1]);
      const b = Number(rango[2]);
      const [desde, hasta] = a <= b ? [a, b] : [b, a];
      if (hasta - desde > existentes.length) {
        return { ok: false, error: `El rango «${trozo}» es más largo que el banco, que va del ${minimo} al ${maximo}.` };
      }
      lista = [];
      for (let n = desde; n <= hasta; n++) lista.push(n);
    } else if (ENTERO.test(trozo)) {
      lista = [Number(trozo)];
    } else {
      return { ok: false, error: `«${trozo}» no es un número de ejercicio. Escribe números sueltos o rangos: «3, 7, 11» o «5-9».` };
    }
    for (const n of lista) {
      if (!validos.has(n)) {
        if (!inexistentes.includes(n)) inexistentes.push(n);
      } else if (!numeros.includes(n)) {
        numeros.push(n);
      }
    }
  }
  if (inexistentes.length > 0) {
    const lista = inexistentes.join(', ');
    const sujeto = inexistentes.length === 1 ? `El ejercicio ${lista} no existe` : `Los ejercicios ${lista} no existen`;
    return { ok: false, error: `${sujeto}: el banco va del ${minimo} al ${maximo}.` };
  }
  return { ok: true, numeros };
}
