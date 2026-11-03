/**
 * Motor de pronombres-ingles: la tabla de los pronombres, el banco de ejercicios numerados y el
 * corrector de lo que escribe un alumno.
 *
 * Sin React ni navegador: lo prueban los casos escritos a mano de
 * `tests/pronombres-ingles-motor.spec.ts` (en `npm run test:calc`). La vista solo pinta.
 *
 * Fuentes: Cambridge Grammar (Cambridge Dictionary, «Pronouns»: personal, possessive,
 * reflexive; «Its or it's?»; «They, them, their used as singular») y Oxford Learner's
 * Dictionaries (entradas de cada pronombre). Donde un caso admitía dos lecturas sin un contexto
 * que decida, el ejercicio lleva una pista en español o se ha dejado fuera.
 */

// ─── Tabla de los pronombres ──────────────────────────────────────────────────

export type Tipo = 'sujeto' | 'objeto' | 'adjetivoPosesivo' | 'pronombrePosesivo' | 'reflexivo';

export const TIPOS: Tipo[] = ['sujeto', 'objeto', 'adjetivoPosesivo', 'pronombrePosesivo', 'reflexivo'];

/** Nombre de cada tipo, para las columnas de la tabla y los botones. */
export const NOMBRE_TIPO: Record<Tipo, string> = {
  sujeto: 'Personal de sujeto',
  objeto: 'Personal de objeto',
  adjetivoPosesivo: 'Adjetivo posesivo',
  pronombrePosesivo: 'Pronombre posesivo',
  reflexivo: 'Reflexivo',
};

/** Para qué sirve cada tipo, en una línea. */
export const USO_TIPO: Record<Tipo, string> = {
  sujeto: 'Hace la acción del verbo. En inglés nunca se omite.',
  objeto: 'Recibe la acción o va detrás de una preposición.',
  adjetivoPosesivo: 'Va delante de un sustantivo: my book, her car.',
  pronombrePosesivo: 'Sustituye al sustantivo: the book is mine.',
  reflexivo: 'El sujeto y el objeto son la misma persona, o se subraya quién lo hace.',
};

export type Persona = 'I' | 'you' | 'he' | 'she' | 'it' | 'we' | 'they';

export const PERSONAS: Persona[] = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];

export interface Celda {
  /** La forma inglesa. */
  forma: string;
  /** Traducción corta, para la celda. */
  traduccion: string;
  /** Una frase de ejemplo en inglés. */
  ejemplo: string;
  /** Su traducción. */
  ejemploEs: string;
  /** Aviso de uso, cuando la forma tiene alguna trampa. */
  nota?: string;
}

export interface FilaPronombres {
  persona: Persona;
  /** Persona gramatical en español. */
  descripcion: string;
  celdas: Record<Tipo, Celda>;
}

export const PRONOMBRES: FilaPronombres[] = [
  {
    persona: 'I',
    descripcion: '1.ª persona del singular',
    celdas: {
      sujeto: { forma: 'I', traduccion: 'yo', ejemplo: 'I live in Lima.', ejemploEs: 'Vivo en Lima.', nota: 'Se escribe siempre con mayúscula, también en mitad de la frase.' },
      objeto: { forma: 'me', traduccion: 'me, mí', ejemplo: 'Can you help me?', ejemploEs: '¿Me puedes ayudar?' },
      adjetivoPosesivo: { forma: 'my', traduccion: 'mi, mis', ejemplo: 'This is my bike.', ejemploEs: 'Esta es mi bici.' },
      pronombrePosesivo: { forma: 'mine', traduccion: 'mío, mía', ejemplo: 'The blue bike is mine.', ejemploEs: 'La bici azul es mía.' },
      reflexivo: { forma: 'myself', traduccion: 'me, yo mismo/a', ejemplo: 'I hurt myself playing football.', ejemploEs: 'Me lastimé jugando al fútbol.' },
    },
  },
  {
    persona: 'you',
    descripcion: '2.ª persona, del singular y del plural',
    celdas: {
      sujeto: { forma: 'you', traduccion: 'tú, usted, ustedes, vosotros', ejemplo: 'You are very kind.', ejemploEs: 'Eres muy amable. / Son muy amables.', nota: 'La misma forma sirve para una persona y para varias.' },
      objeto: { forma: 'you', traduccion: 'te, ti, os, a usted(es)', ejemplo: "I'll call you tonight.", ejemploEs: 'Te llamo esta noche.' },
      adjetivoPosesivo: { forma: 'your', traduccion: 'tu, su, vuestro', ejemplo: 'Is this your phone?', ejemploEs: '¿Este es tu teléfono?' },
      pronombrePosesivo: { forma: 'yours', traduccion: 'tuyo, suyo, vuestro', ejemplo: 'Is this phone yours?', ejemploEs: '¿Este teléfono es tuyo?' },
      reflexivo: { forma: 'yourself / yourselves', traduccion: 'tú mismo / ustedes mismos', ejemplo: 'Help yourself! · Help yourselves!', ejemploEs: '¡Sírvete! (a una persona) · ¡Sírvanse! (a varias)', nota: 'Es el único que cambia: yourself para una persona y yourselves para varias.' },
    },
  },
  {
    persona: 'he',
    descripcion: '3.ª persona del singular, masculino',
    celdas: {
      sujeto: { forma: 'he', traduccion: 'él', ejemplo: 'He works in a hospital.', ejemploEs: 'Trabaja en un hospital.' },
      objeto: { forma: 'him', traduccion: 'lo, le, él', ejemplo: 'I saw him yesterday.', ejemploEs: 'Lo vi ayer.' },
      adjetivoPosesivo: { forma: 'his', traduccion: 'su, sus (de él)', ejemplo: 'His car is red.', ejemploEs: 'Su coche (carro) es rojo.' },
      pronombrePosesivo: { forma: 'his', traduccion: 'suyo (de él)', ejemplo: 'The red car is his.', ejemploEs: 'El coche (carro) rojo es suyo.', nota: 'His es igual como adjetivo y como pronombre.' },
      reflexivo: { forma: 'himself', traduccion: 'se, él mismo', ejemplo: 'He taught himself to play the guitar.', ejemploEs: 'Aprendió a tocar la guitarra él solo.', nota: '«Hisself» no existe en el inglés estándar.' },
    },
  },
  {
    persona: 'she',
    descripcion: '3.ª persona del singular, femenino',
    celdas: {
      sujeto: { forma: 'she', traduccion: 'ella', ejemplo: 'She speaks three languages.', ejemploEs: 'Habla tres idiomas.' },
      objeto: { forma: 'her', traduccion: 'la, le, ella', ejemplo: 'We invited her to the party.', ejemploEs: 'La invitamos a la fiesta.' },
      adjetivoPosesivo: { forma: 'her', traduccion: 'su, sus (de ella)', ejemplo: 'Her brother lives in Bogotá.', ejemploEs: 'Su hermano vive en Bogotá.' },
      pronombrePosesivo: { forma: 'hers', traduccion: 'suyo (de ella)', ejemplo: 'This seat is hers.', ejemploEs: 'Este asiento es suyo.', nota: 'Hers no lleva apóstrofo: «her\'s» es un error.' },
      reflexivo: { forma: 'herself', traduccion: 'se, ella misma', ejemplo: 'She looked at herself in the mirror.', ejemploEs: 'Se miró en el espejo.' },
    },
  },
  {
    persona: 'it',
    descripcion: '3.ª persona del singular, cosas y animales',
    celdas: {
      sujeto: { forma: 'it', traduccion: 'él, ella, ello (cosa o animal)', ejemplo: 'It is raining.', ejemploEs: 'Está lloviendo.', nota: 'Es obligatorio aunque en español no haya sujeto: it is raining, it is late.' },
      objeto: { forma: 'it', traduccion: 'lo, la', ejemplo: 'I love this song. I listen to it every day.', ejemploEs: 'Me encanta esta canción. La escucho cada día.' },
      adjetivoPosesivo: { forma: 'its', traduccion: 'su, sus (de una cosa o animal)', ejemplo: 'The tree is losing its leaves.', ejemploEs: 'El árbol está perdiendo sus hojas.', nota: 'Its sin apóstrofo; it\'s significa it is o it has.' },
      pronombrePosesivo: { forma: 'its', traduccion: 'suyo (poco usado)', ejemplo: "The bed is the dog's.", ejemploEs: 'La cama es del perro.', nota: 'Como pronombre casi no se usa: en vez de «the bed is its», se repite el nombre.' },
      reflexivo: { forma: 'itself', traduccion: 'se, sí mismo', ejemplo: 'The door closed by itself.', ejemploEs: 'La puerta se cerró sola.' },
    },
  },
  {
    persona: 'we',
    descripcion: '1.ª persona del plural',
    celdas: {
      sujeto: { forma: 'we', traduccion: 'nosotros, nosotras', ejemplo: 'We are classmates.', ejemploEs: 'Somos compañeros de clase.' },
      objeto: { forma: 'us', traduccion: 'nos, nosotros', ejemplo: 'They visited us last summer.', ejemploEs: 'Nos visitaron el verano pasado.' },
      adjetivoPosesivo: { forma: 'our', traduccion: 'nuestro, nuestra', ejemplo: 'Our house is small.', ejemploEs: 'Nuestra casa es pequeña.' },
      pronombrePosesivo: { forma: 'ours', traduccion: 'el nuestro, la nuestra', ejemplo: 'The decision is ours.', ejemploEs: 'La decisión es nuestra.' },
      reflexivo: { forma: 'ourselves', traduccion: 'nos, nosotros mismos', ejemplo: 'We enjoyed ourselves at the party.', ejemploEs: 'Nos divertimos en la fiesta.' },
    },
  },
  {
    persona: 'they',
    descripcion: '3.ª persona del plural',
    celdas: {
      sujeto: { forma: 'they', traduccion: 'ellos, ellas', ejemplo: 'They live in Quito.', ejemploEs: 'Viven en Quito.' },
      objeto: { forma: 'them', traduccion: 'los, las, les, ellos', ejemplo: "I don't know them.", ejemploEs: 'No los conozco.' },
      adjetivoPosesivo: { forma: 'their', traduccion: 'su, sus (de ellos)', ejemplo: 'Their children go to the same school.', ejemploEs: 'Sus hijos van al mismo colegio.', nota: 'No confundir con there (allí) ni con they\'re (they are).' },
      pronombrePosesivo: { forma: 'theirs', traduccion: 'suyo (de ellos)', ejemplo: 'Those seats are theirs.', ejemploEs: 'Esos asientos son suyos.' },
      reflexivo: { forma: 'themselves', traduccion: 'se, ellos mismos', ejemplo: 'They built the house themselves.', ejemploEs: 'Construyeron la casa ellos mismos.', nota: '«Theirselves» no existe en el inglés estándar.' },
    },
  },
];

// ─── Ejercicios numerados ─────────────────────────────────────────────────────

export type Categoria = Tipo | 'trampas';

export const CATEGORIAS: Categoria[] = [...TIPOS, 'trampas'];

export const NOMBRE_CATEGORIA: Record<Categoria, string> = {
  sujeto: 'Personales de sujeto',
  objeto: 'Personales de objeto',
  adjetivoPosesivo: 'Adjetivos posesivos',
  pronombrePosesivo: 'Pronombres posesivos',
  reflexivo: 'Reflexivos',
  trampas: 'Trampas típicas',
};

export const EJEMPLO_CATEGORIA: Record<Categoria, string> = {
  sujeto: 'I, he, she, they',
  objeto: 'me, him, her, them',
  adjetivoPosesivo: 'my, his, its, their',
  pronombrePosesivo: 'mine, hers, ours',
  reflexivo: 'myself, yourselves',
  trampas: "its / it's, their / there",
};

/** Marca del hueco en el enunciado: hay exactamente una por ejercicio. */
export const HUECO = '___';

export interface Ejercicio {
  /** Número estable, el que ve el alumno y el que asigna el profesor. */
  numero: number;
  categoria: Categoria;
  /** Frase en inglés con un hueco (`___`). */
  enunciado: string;
  /** Contexto en español que decide la forma cuando la frase sola no basta. */
  pista?: string;
  /** Respuestas correctas, la primera es la que se enseña. Escritas a mano. */
  admitidas: string[];
  /** Las otras tres opciones del modo elegir: ninguna es correcta. */
  distractores: [string, string, string];
  /** La regla aplicada a ESTE caso. */
  regla: string;
}

export const EJERCICIOS: Ejercicio[] = [
  // ── Personales de sujeto ──
  {
    numero: 1, categoria: 'sujeto',
    enunciado: 'Ana is my cousin. ___ lives in Montevideo.',
    admitidas: ['She'], distractores: ['Her', 'He', 'It'],
    regla: 'Ana es una mujer y aquí hace de sujeto del verbo lives: el sujeto femenino singular es she. Her solo puede ser objeto (I know her) o posesivo (her house).',
  },
  {
    numero: 2, categoria: 'sujeto',
    enunciado: 'My brother and I play football. ___ train every Saturday.',
    admitidas: ['We'], distractores: ['Us', 'They', 'Our'],
    regla: '«My brother and I» incluye a quien habla: es la primera persona del plural. Como sujeto de train, la forma es we; us es la de objeto.',
  },
  {
    numero: 3, categoria: 'sujeto',
    enunciado: 'Look at that building! ___ is huge.',
    admitidas: ['It'], distractores: ['He', 'Its', 'They'],
    regla: 'Un edificio es una cosa: en inglés las cosas son it, nunca he ni she como en español («él» o «ella»). Its es el posesivo, no el sujeto.',
  },
  {
    numero: 4, categoria: 'sujeto',
    enunciado: 'Carlos and Lucía are from Chile. ___ are doctors.',
    admitidas: ['They'], distractores: ['Them', 'We', 'Their'],
    regla: 'Carlos y Lucía son dos personas de las que se habla (tercera persona del plural) y hacen de sujeto de are: they. Them es objeto y their, posesivo.',
  },
  {
    numero: 5, categoria: 'sujeto',
    enunciado: 'Hi, my name is Kenji. ___ am twenty years old.',
    admitidas: ['I'], distractores: ['Me', 'My', 'Mine'],
    regla: 'Con am el sujeto solo puede ser I. Es obligatorio aunque en español digamos «tengo veinte años» sin «yo», y se escribe siempre con mayúscula.',
  },
  {
    numero: 6, categoria: 'sujeto',
    enunciado: 'Mr. Pérez is our teacher. ___ is very patient.',
    admitidas: ['He'], distractores: ['Him', 'His', 'She'],
    regla: 'Mr. Pérez es un hombre y hace de sujeto de is: he. Him es la forma de objeto y his, la de posesivo.',
  },
  {
    numero: 7, categoria: 'sujeto',
    enunciado: 'Excuse me, are ___ the new manager?',
    admitidas: ['you'], distractores: ['your', 'yours', 'yourself'],
    regla: 'Se pregunta a otra persona y el hueco es el sujeto de are: you. En español basta con «¿es usted…?» o «¿eres…?», pero en inglés el sujeto no se omite ni en las preguntas.',
  },
  // ── Personales de objeto ──
  {
    numero: 8, categoria: 'objeto',
    enunciado: "I can't find my keys. Have you seen ___?",
    admitidas: ['them'], distractores: ['they', 'their', 'it'],
    regla: 'Keys es plural y recibe la acción de seen: el objeto plural es them. They es la forma de sujeto, y it no vale porque las llaves son varias.',
  },
  {
    numero: 9, categoria: 'objeto',
    enunciado: "Sofía called me yesterday, but I didn't answer ___.",
    admitidas: ['her'], distractores: ['she', 'hers', 'him'],
    regla: 'Sofía es una mujer y recibe la acción de answer: el objeto femenino es her («no le contesté»). She es la forma de sujeto.',
  },
  {
    numero: 10, categoria: 'objeto',
    enunciado: 'This is a secret between you and ___.',
    admitidas: ['me'], distractores: ['I', 'my', 'mine'],
    regla: 'Detrás de una preposición (between) va siempre la forma de objeto: between you and me. «Between you and I» se oye, pero las gramáticas lo consideran incorrecto.',
  },
  {
    numero: 11, categoria: 'objeto',
    enunciado: 'Our grandparents live far away, so we visit ___ every summer.',
    admitidas: ['them'], distractores: ['they', 'their', 'us'],
    regla: 'Los abuelos reciben la visita: objeto de tercera persona del plural, them. Us sería «a nosotros», y los visitados no somos nosotros sino ellos.',
  },
  {
    numero: 12, categoria: 'objeto',
    enunciado: 'My father is a great cook. I learned a lot from ___.',
    admitidas: ['him'], distractores: ['he', 'his', 'them'],
    regla: 'Detrás de la preposición from va la forma de objeto, y el padre es un hombre: him. He solo puede ser sujeto.',
  },
  {
    numero: 13, categoria: 'objeto',
    enunciado: "Can you help ___? We're lost.",
    admitidas: ['us'], distractores: ['we', 'our', 'ours'],
    regla: 'Quienes piden ayuda son «nosotros» (we\'re lost) y reciben la acción de help: el objeto es us. We es la forma de sujeto.',
  },
  {
    numero: 14, categoria: 'objeto',
    enunciado: "I bought a new phone, but I don't like ___ very much.",
    admitidas: ['it'], distractores: ['its', 'them', 'him'],
    regla: 'El teléfono es una cosa en singular y recibe la acción de like: it. Its es el posesivo («su»), no el objeto.',
  },
  // ── Adjetivos posesivos ──
  {
    numero: 15, categoria: 'adjetivoPosesivo',
    enunciado: 'We love ___ new apartment.',
    admitidas: ['our'], distractores: ['ours', 'us', 'we'],
    regla: 'Delante de un sustantivo (apartment) va el adjetivo posesivo, y el dueño es «nosotros»: our. Ours se usa sin sustantivo detrás (the apartment is ours).',
  },
  {
    numero: 16, categoria: 'adjetivoPosesivo',
    enunciado: 'They forgot ___ umbrellas at the restaurant.',
    admitidas: ['their'], distractores: ["they're", 'there', 'theirs'],
    regla: 'Los paraguas son de ellos y van detrás: adjetivo posesivo their. They\'re es they are, there significa «allí» y theirs va sin sustantivo detrás.',
  },
  {
    numero: 17, categoria: 'adjetivoPosesivo',
    enunciado: 'I brush ___ teeth twice a day.',
    admitidas: ['my'], distractores: ['mine', 'me', 'the'],
    regla: 'En inglés las partes del cuerpo llevan posesivo, no artículo: I brush my teeth, aunque en español digamos «me lavo los dientes».',
  },
  {
    numero: 18, categoria: 'adjetivoPosesivo',
    enunciado: 'Is this ___ bag, Marta?',
    admitidas: ['your'], distractores: ["you're", 'yours', 'you'],
    regla: 'Se le pregunta a Marta por una bolsa que va detrás: adjetivo posesivo your. You\'re es you are, y yours se usa sin sustantivo (is this bag yours?).',
  },
  {
    numero: 19, categoria: 'adjetivoPosesivo',
    enunciado: 'The tree is losing ___ leaves.',
    admitidas: ['its'], distractores: ["it's", 'his', 'their'],
    regla: 'Las hojas son del árbol, una cosa: el posesivo es its, sin apóstrofo. It\'s significa it is o it has («the tree is losing it is leaves» no tiene sentido).',
  },
  {
    numero: 20, categoria: 'adjetivoPosesivo',
    enunciado: 'Lucía and I are in the same class. ___ teacher is from Peru.',
    admitidas: ['Our'], distractores: ['Ours', 'We', 'Us'],
    regla: '«Lucía and I» incluye a quien habla (primera persona del plural) y el sustantivo teacher va detrás: adjetivo posesivo our. Ours no puede ir delante de un sustantivo.',
  },
  {
    numero: 21, categoria: 'adjetivoPosesivo',
    enunciado: 'Rosa called ___ mother this morning.',
    pista: 'la madre de Rosa',
    admitidas: ['her'], distractores: ['his', 'she', 'hers'],
    regla: 'La madre es de Rosa, una mujer: her. En inglés el posesivo de tercera persona lo decide quien posee (Rosa), no lo poseído.',
  },
  {
    numero: 22, categoria: 'adjetivoPosesivo',
    enunciado: 'Mr. and Mrs. Ito sold ___ car last week.',
    pista: 'el coche (carro) de los dos',
    admitidas: ['their'], distractores: ['his', 'theirs', 'they'],
    regla: 'El coche es de los dos, poseedor plural, y va detrás el sustantivo: their. Theirs se usa sin sustantivo (the car was theirs).',
  },
  // ── Pronombres posesivos ──
  {
    numero: 23, categoria: 'pronombrePosesivo',
    enunciado: 'This book belongs to her. → This book is ___.',
    admitidas: ['hers'], distractores: ['her', "her's", 'she'],
    regla: 'Sin sustantivo detrás, el posesivo es pronombre: hers («es suyo, de ella»). Her necesitaría un sustantivo (her book) y «her\'s», con apóstrofo, no existe.',
  },
  {
    numero: 24, categoria: 'pronombrePosesivo',
    enunciado: "That isn't my pen. ___ is blue.",
    admitidas: ['Mine'], distractores: ['My', 'Me', 'I'],
    regla: 'El hueco sustituye a «my pen» y no lleva sustantivo detrás: pronombre posesivo mine («el mío es azul»). My necesitaría el sustantivo (my pen is blue).',
  },
  {
    numero: 25, categoria: 'pronombrePosesivo',
    enunciado: 'These seats belong to us. → These seats are ___.',
    admitidas: ['ours'], distractores: ['our', "our's", 'us'],
    regla: 'Los asientos son de «nosotros» y no hay sustantivo detrás: ours. Los pronombres posesivos no llevan nunca apóstrofo.',
  },
  {
    numero: 26, categoria: 'pronombrePosesivo',
    enunciado: 'Is this jacket ___, Pablo?',
    admitidas: ['yours'], distractores: ['your', "your's", 'you'],
    regla: 'Se pregunta a Pablo si la chaqueta es suya y no hay sustantivo detrás: yours («¿es tuya?»). Your necesitaría el sustantivo (your jacket).',
  },
  {
    numero: 27, categoria: 'pronombrePosesivo',
    enunciado: 'The black car belongs to my parents. → The black car is ___.',
    admitidas: ['theirs'], distractores: ['their', "their's", 'them'],
    regla: 'El coche es de los padres, poseedor plural, y no hay sustantivo detrás: theirs. Their necesitaría el sustantivo (their car).',
  },
  {
    numero: 28, categoria: 'pronombrePosesivo',
    enunciado: 'Whose keys are these? Are they ___?',
    pista: 'de Tomás',
    admitidas: ['his'], distractores: ['him', "he's", 'hers'],
    regla: 'Las llaves son de Tomás, un hombre: his. His es igual como adjetivo (his keys) y como pronombre (they are his); «he\'s» es he is.',
  },
  {
    numero: 29, categoria: 'pronombrePosesivo',
    enunciado: 'My phone is old, but ___ is new.',
    pista: 'el de ella',
    admitidas: ['hers'], distractores: ['her', 'she', "her's"],
    regla: 'El hueco sustituye a «her phone» («el de ella»), sin sustantivo detrás: hers. Her solo, sin phone, no vale como sujeto.',
  },
  {
    numero: 30, categoria: 'pronombrePosesivo',
    enunciado: 'A friend of ___ lives in Rosario.',
    pista: 'un amigo mío',
    admitidas: ['mine'], distractores: ['my', 'me', 'I'],
    regla: '«Un amigo mío» se dice a friend of mine: tras of va el pronombre posesivo, no el adjetivo ni el objeto (a friend of me es un error).',
  },
  // ── Reflexivos ──
  {
    numero: 31, categoria: 'reflexivo',
    enunciado: "Be careful with the knife! Don't cut ___.",
    pista: 'se lo dices a un niño',
    admitidas: ['yourself'], distractores: ['yourselves', 'you', 'your'],
    regla: 'Quien se puede cortar es la misma persona a la que hablas, y es una sola: yourself. Con varias sería yourselves.',
  },
  {
    numero: 32, categoria: 'reflexivo',
    enunciado: 'Children, help ___ to the cake!',
    admitidas: ['yourselves'], distractores: ['yourself', 'you', 'yourselfs'],
    regla: 'Se habla a varios niños («children») y son ellos mismos quienes se sirven: reflexivo plural yourselves, con -ves. «Yourselfs» no existe.',
  },
  {
    numero: 33, categoria: 'reflexivo',
    enunciado: 'Pedro lives by ___.',
    admitidas: ['himself'], distractores: ['hisself', 'him', 'his'],
    regla: 'By + reflexivo significa «solo, sin compañía». Pedro es un hombre: himself. «Hisself» no existe en el inglés estándar.',
  },
  {
    numero: 34, categoria: 'reflexivo',
    enunciado: 'My sister taught ___ to play the piano.',
    admitidas: ['herself'], distractores: ['her', 'hers', 'himself'],
    regla: 'Quien enseña y quien aprende es la misma persona, la hermana: reflexivo femenino herself («aprendió sola»). Con her se entendería que enseñó a otra mujer.',
  },
  {
    numero: 35, categoria: 'reflexivo',
    enunciado: 'We enjoyed ___ at the beach.',
    admitidas: ['ourselves'], distractores: ['us', 'our', 'themselves'],
    regla: 'Enjoy necesita un objeto, y aquí es el propio sujeto (we): ourselves («nos divertimos»). «We enjoyed us» es un error.',
  },
  {
    numero: 36, categoria: 'reflexivo',
    enunciado: 'My parents painted the house ___.',
    admitidas: ['themselves'], distractores: ['theirselves', 'them', 'their'],
    regla: 'El reflexivo subraya que lo hicieron ellos, sin ayuda: themselves («ellos mismos»). «Theirselves» no existe en el inglés estándar.',
  },
  {
    numero: 37, categoria: 'reflexivo',
    enunciado: 'The door opened by ___.',
    admitidas: ['itself'], distractores: ['it', 'its', 'himself'],
    regla: 'La puerta es una cosa y nadie la abrió: by itself («sola»). El reflexivo de it es itself.',
  },
  {
    numero: 38, categoria: 'reflexivo',
    enunciado: 'I looked at ___ in the mirror.',
    admitidas: ['myself'], distractores: ['me', 'my', 'mine'],
    regla: 'Quien mira y quien es mirado son la misma persona, I: myself («me miré»). Con me se entendería que es otra persona la que mira.',
  },
  // ── Trampas típicas ──
  {
    numero: 39, categoria: 'trampas',
    enunciado: 'This city is famous for ___ beaches.',
    admitidas: ['its'], distractores: ["it's", 'it', 'their'],
    regla: 'Las playas son de la ciudad: posesivo its, sin apóstrofo. It\'s es la contracción de it is o it has, y «famous for it is beaches» no tiene sentido.',
  },
  {
    numero: 40, categoria: 'trampas',
    enunciado: '___ is raining again.',
    admitidas: ['It'], distractores: ['Its', "It's", 'He'],
    regla: 'El inglés no admite un verbo sin sujeto: con el tiempo, la hora o la distancia se pone it (it is raining), aunque en español digamos solo «está lloviendo». It\'s ya lleva el is dentro.',
  },
  {
    numero: 41, categoria: 'trampas',
    enunciado: 'What time is it? ___ half past seven.',
    admitidas: ["It's", 'It is'], distractores: ['Its', 'Is', 'It'],
    regla: 'Hace falta el sujeto it y el verbo is: it\'s (o it is) half past seven. Its, sin apóstrofo, es el posesivo, y «Is half past seven» no tiene sujeto.',
  },
  {
    numero: 42, categoria: 'trampas',
    enunciado: 'Ana and Luis are moving. ___ house is for sale.',
    admitidas: ['Their'], distractores: ["They're", 'There', 'Theirs'],
    regla: 'La casa es de Ana y Luis, y va detrás: posesivo their. They\'re es they are y there significa «allí»: suenan igual, pero se escriben distinto.',
  },
  {
    numero: 43, categoria: 'trampas',
    enunciado: "Where are Ana and Luis? I think ___ in the garden.",
    admitidas: ["they're", 'they are'], distractores: ['their', 'there', 'theirs'],
    regla: 'Hace falta sujeto y verbo: they\'re (they are) in the garden. Their es posesivo y there, «allí»: suenan igual.',
  },
  {
    numero: 44, categoria: 'trampas',
    enunciado: 'Look! Your keys are over ___.',
    admitidas: ['there'], distractores: ['their', "they're", 'theirs'],
    regla: 'Over there significa «por allí»: es un lugar, there. Their (de ellos) y they\'re (they are) suenan igual pero no indican lugar.',
  },
  {
    numero: 45, categoria: 'trampas',
    enunciado: 'María is talking to ___ brother.',
    pista: 'el hermano de María',
    admitidas: ['her'], distractores: ['his', 'she', 'hers'],
    regla: 'El hermano es de María, una mujer: her brother. El posesivo lo decide quien posee, no lo poseído: aunque brother sea masculino, no es his.',
  },
  {
    numero: 46, categoria: 'trampas',
    enunciado: 'Tomás is visiting ___ grandmother.',
    pista: 'la abuela de Tomás',
    admitidas: ['his'], distractores: ['her', 'he', 'him'],
    regla: 'La abuela es de Tomás, un hombre: his grandmother. Aunque grandmother sea femenino, manda el poseedor, así que no es her.',
  },
  {
    numero: 47, categoria: 'trampas',
    enunciado: 'Someone left ___ umbrella in the classroom.',
    pista: 'no se sabe si es un hombre o una mujer',
    admitidas: ['their', 'his or her', 'his/her', 'her or his'], distractores: ['there', "they're", 'its'],
    regla: 'Con someone, everyone o nobody, cuando no se sabe si es hombre o mujer, el inglés usa their: es el they singular, un uso que Cambridge recoge como aceptado. También vale his or her, más formal.',
  },
  {
    numero: 48, categoria: 'trampas',
    enunciado: 'You and your brother should be proud of ___.',
    admitidas: ['yourselves'], distractores: ['yourself', 'you', 'your'],
    regla: '«You and your brother» son dos personas, y el orgullo es de sí mismos: reflexivo plural yourselves. Yourself es para una sola persona.',
  },
  {
    numero: 49, categoria: 'trampas',
    enunciado: 'Paula, did you make this cake ___?',
    admitidas: ['yourself'], distractores: ['yourselves', 'you', 'your'],
    regla: 'Se habla solo a Paula y se subraya que lo hizo ella: yourself («tú misma»). Yourselves sería para varias personas.',
  },
  {
    numero: 50, categoria: 'trampas',
    enunciado: 'Sara and ___ went to the cinema.',
    pista: 'Sara y yo',
    admitidas: ['I'], distractores: ['me', 'my', 'mine'],
    regla: '«Sara and I» es el sujeto de went: va la forma de sujeto, I. «Sara and me went» se oye en la conversación, pero en un examen se corrige. Truco: quita a Sara y mira si suena bien (I went, no me went).',
  },
];

// ─── Corrector ────────────────────────────────────────────────────────────────

/**
 * Deja lo escrito en una forma comparable: minúsculas, apóstrofos tipográficos (’ ‘ ´ `) como
 * el recto, espacios de más fuera, sin la puntuación final y con la barra sin espacios
 * («his / her» = «his/her»).
 */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/[’‘´`]/g, "'")
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?,;:]+$/, '')
    .trim();
}

/** ¿Es correcta la respuesta? Vale cualquiera de las admitidas, escrita como sea. */
export function corregir(ejercicio: Ejercicio, respuesta: string): boolean {
  const r = normalizar(respuesta);
  if (r === '') return false;
  return ejercicio.admitidas.some((a) => normalizar(a) === r);
}

/** La regla que explica la respuesta, aplicada a este ejercicio. */
export function explicacion(ejercicio: Ejercicio): string {
  return ejercicio.regla;
}

/** El enunciado con el hueco relleno con la respuesta que se enseña. */
export function fraseResuelta(ejercicio: Ejercicio): string {
  return ejercicio.enunciado.replace(HUECO, ejercicio.admitidas[0]);
}

/** El enunciado partido por el hueco: lo de antes y lo de después. */
export function partesDelEnunciado(ejercicio: Ejercicio): [string, string] {
  const i = ejercicio.enunciado.indexOf(HUECO);
  return [ejercicio.enunciado.slice(0, i), ejercicio.enunciado.slice(i + HUECO.length)];
}

/** Las cuatro opciones del modo elegir, sin barajar: la correcta primero. */
export function opcionesDe(ejercicio: Ejercicio): string[] {
  return [ejercicio.admitidas[0], ...ejercicio.distractores];
}

export function buscarEjercicio(numero: number): Ejercicio | undefined {
  return EJERCICIOS.find((e) => e.numero === numero);
}

export function ejerciciosDe(categorias: Categoria[]): Ejercicio[] {
  const set = new Set(categorias);
  return EJERCICIOS.filter((e) => set.has(e.categoria));
}

// ─── Ejercicios por número ────────────────────────────────────────────────────

export type LecturaNumeros = { ok: true; numeros: number[] } | { ok: false; error: string };

const RANGO = /^(\d+)-(\d+)$/;
const ENTERO = /^\d+$/;

/**
 * Lee lo que escribe un profesor o un alumno para elegir ejercicios: «3, 7, 11», «5-9» o una
 * mezcla («1-3, 8»). Separa por comas, punto y coma o espacios; el guion (también – y —) marca
 * un rango, que puede venir al revés («9-5»). Respeta el orden escrito y quita los repetidos.
 */
export function leerNumeros(texto: string, total: number): LecturaNumeros {
  const limpio = texto.replace(/[–—]/g, '-').replace(/\s*-\s*/g, '-').trim();
  if (limpio === '') return { ok: false, error: 'Escribe al menos un número de ejercicio, por ejemplo «3, 7, 11» o «5-9».' };
  const trozos = limpio.split(/[\s,;]+/).filter(Boolean);
  const numeros: number[] = [];
  const fuera: number[] = [];
  for (const t of trozos) {
    const rango = t.match(RANGO);
    let lista: number[];
    if (rango) {
      const a = Number(rango[1]);
      const b = Number(rango[2]);
      const [ini, fin] = a <= b ? [a, b] : [b, a];
      if (fin - ini > total) return { ok: false, error: `El rango «${t}» no cabe: hay ejercicios del 1 al ${total}.` };
      lista = [];
      for (let n = ini; n <= fin; n++) lista.push(n);
    } else if (ENTERO.test(t)) {
      lista = [Number(t)];
    } else {
      return { ok: false, error: `«${t}» no es un número de ejercicio. Escribe números separados por comas o un rango, como «5-9».` };
    }
    for (const n of lista) {
      if (n < 1 || n > total) { if (!fuera.includes(n)) fuera.push(n); continue; }
      if (!numeros.includes(n)) numeros.push(n);
    }
  }
  if (fuera.length === 1) return { ok: false, error: `El ejercicio ${fuera[0]} no existe: hay del 1 al ${total}.` };
  if (fuera.length > 1) return { ok: false, error: `Los ejercicios ${fuera.join(', ')} no existen: hay del 1 al ${total}.` };
  return { ok: true, numeros };
}
