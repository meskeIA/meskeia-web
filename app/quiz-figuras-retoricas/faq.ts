import { figurasRetorica } from '@/data/figuras-retoricas';

/**
 * FAQ única del quiz: la pintan la página (FAQ visible) y metadata.ts (FAQPage), §1.ter.
 *
 * Hallazgo 3654: la pregunta de Selectividad estaba en las dos con respuestas distintas (otra lista
 * de figuras, «más de 200» frente a «más de 60» catalogadas, y la de metáfora y símil con otro
 * ejemplo). Hallazgo 3653: el FAQPage decía que el quiz cubre la sinestesia y el encabalgamiento,
 * que no están en el banco, y que sus ejemplos son «reales de textos literarios», cuando la mayoría
 * están escritos para el quiz. Las cifras salen del banco.
 */

const TOTAL = figurasRetorica.length;
const AVANZADO = figurasRetorica.filter((f) => f.nivel === 'avanzado').length;

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    pregunta: '¿Qué son las figuras retóricas y cuántas hay?',
    respuesta: `Son recursos del lenguaje que alteran el uso habitual de las palabras para conseguir un efecto expresivo o estético; se usan en literatura, publicidad y discursos para hacer el mensaje más vívido, persuasivo o memorable. Los tratados de retórica recogen muchas más de las que se estudian en clase, y en la práctica escolar se trabajan unas 20-30. Este quiz incluye ${TOTAL}, organizadas en seis grupos: imagen, repetición, contraste, énfasis, sintaxis y contigüidad.`,
  },
  {
    pregunta: '¿Cuáles caen más en Selectividad?',
    respuesta: 'En los comentarios de texto del examen de acceso a la universidad suelen aparecer la metáfora, el símil, la hipérbole, la personificación, la anáfora, la antítesis, el hipérbaton, el oxímoron y la ironía, y todas están en el quiz. También se piden recursos que el quiz no pregunta, como la sinestesia, el paralelismo o el encabalgamiento (este último es un recurso métrico). Más que una lista cerrada, en el examen cuenta identificar cada figura con su cita y explicar su efecto.',
  },
  {
    pregunta: '¿En qué se diferencia una metáfora de un símil?',
    respuesta: 'El símil (o comparación) establece la semejanza con un nexo explícito como «como», «cual», «igual que» o «semejante a»: «Sus ojos son como el mar». La metáfora suprime el nexo e identifica directamente las dos realidades: «Sus ojos son el mar». Por eso la metáfora resulta más intensa: funde ambas realidades en una sola expresión.',
  },
  {
    pregunta: '¿Qué diferencia hay entre metonimia y sinécdoque?',
    respuesta: 'Ambas son figuras de contigüidad, pero el mecanismo difiere. La metonimia sustituye por una relación lógica: causa y efecto («leer a Cervantes» es leer su obra), continente y contenido («beber una copa»), símbolo y simbolizado («la corona» es la monarquía). La sinécdoque opera por una relación de cantidad: la parte por el todo («cuatro bocas que alimentar» son cuatro personas) o el todo por la parte («España ganó el Mundial» es el equipo español).',
  },
  {
    pregunta: '¿Cómo identificar figuras retóricas en un texto?',
    respuesta: 'Sigue este orden: (1) lee el fragmento completo sin interrumpirte; (2) marca las palabras o frases que llamen la atención por su sonido, su estructura o su significado; (3) pregúntate si hay repetición de sonidos (fónica), de palabras o estructuras (sintáctica), comparación o identificación entre realidades distintas (semántica), o exageración, contradicción o juego de opuestos (pensamiento); (4) nombra la figura, cita el fragmento exacto y explica el efecto que produce en el lector.',
  },
  {
    pregunta: '¿Qué es exactamente el hipérbaton?',
    respuesta: 'El hipérbaton altera el orden sintáctico habitual del español (sujeto, verbo y complementos). Es frecuente en la poesía clásica por influencia del latín, donde el orden de las palabras era más libre. Ejemplo de Bécquer: «Del salón en el ángulo oscuro» (orden habitual: «En el ángulo oscuro del salón»). Al identificarlo en un examen, indica cuál sería el orden habitual y qué efecto rítmico o enfático produce la inversión.',
  },
  {
    pregunta: '¿Cuál es la diferencia entre ironía y sarcasmo?',
    respuesta: 'La ironía dice lo contrario de lo que se piensa con tono moderado, con intención crítica o humorística pero sin agresividad explícita. El sarcasmo es una ironía más mordaz o hiriente, dirigida normalmente a una persona concreta. En un comentario de texto conviene usar el término «ironía» salvo que el contexto justifique claramente el tono hiriente del sarcasmo.',
  },
  {
    pregunta: '¿Cómo analizar una figura retórica en un examen?',
    respuesta: 'Un análisis completo tiene cuatro elementos: (1) el nombre de la figura («encontramos una metáfora»); (2) la cita textual exacta entre comillas; (3) la explicación del mecanismo: qué se compara con qué, qué se repite, qué se exagera; (4) el efecto estético: qué sensación o significado añade al texto («intensifica la idea de…», «refuerza el tono melancólico de…»). Sin el cuarto, el análisis queda incompleto.',
  },
  {
    pregunta: '¿A partir de qué curso se estudian las figuras retóricas?',
    respuesta: 'Las figuras básicas (comparación, metáfora, hipérbole, personificación) se introducen habitualmente en 2.º y 3.º de la ESO (12-14 años). En Bachillerato se amplía el repertorio con figuras más complejas, como el oxímoron, el quiasmo o la sinestesia, que son las que suelen aparecer en Selectividad.',
  },
  {
    pregunta: '¿Cuántas preguntas tiene el quiz y cómo funciona?',
    respuesta: `Eliges el nivel (Básico, Intermedio, Avanzado o Todas) y una partida de 10, 15 o 20 preguntas, hasta el número de figuras del nivel: cada pregunta es una figura distinta, y el Avanzado tiene ${AVANZADO}. Cada pregunta muestra un ejemplo breve —la mayoría escritos para el quiz; algunos de autores como Rubén Darío, Garcilaso, Fray Luis de León o Santa Teresa— y cuatro opciones. Tras responder ves la definición, la diferencia con las figuras parecidas y otro ejemplo. Sin registro ni instalación.`,
  },
];
