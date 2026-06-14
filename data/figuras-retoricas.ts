export type GrupoFigura = 'imagen' | 'repeticion' | 'contraste' | 'enfasis' | 'sintaxis' | 'contigüidad';
export type NivelFigura = 'basico' | 'intermedio' | 'avanzado';

export interface FiguraRetorica {
  id: string;
  nombre: string;
  definicion: string;
  distincion: string;   // clave para no confundirla con figuras similares
  grupo: GrupoFigura;
  nivel: NivelFigura;
  ejemplos: string[];   // mínimo 3: el primero para la pregunta, los demás para el feedback
}

export const figurasRetorica: FiguraRetorica[] = [

  // ── BÁSICO — 10 figuras esenciales (ESO) ─────────────────────────────

  {
    id: 'metafora',
    nombre: 'Metáfora',
    definicion: 'Identifica o sustituye un término real por otro imaginario con el que comparte alguna cualidad, sin usar nexos comparativos.',
    distincion: 'Se diferencia del símil en que NO usa "como", "igual que" ni ningún nexo. "Tus ojos son estrellas" (metáfora) vs "Tus ojos son como estrellas" (símil).',
    grupo: 'imagen',
    nivel: 'basico',
    ejemplos: [
      'Tus ojos son dos luceros brillantes.',
      'La vida es un camino sin retorno.',
      'Sus palabras fueron un bálsamo para mi alma.',
      'El tiempo es oro.',
    ],
  },

  {
    id: 'simil',
    nombre: 'Símil',
    definicion: 'Establece una comparación explícita entre dos términos usando nexos como "como", "igual que", "tal como" o "semejante a".',
    distincion: 'A diferencia de la metáfora, el símil SIEMPRE incluye un nexo comparativo explícito. Si no aparece "como" o equivalente, es metáfora.',
    grupo: 'imagen',
    nivel: 'basico',
    ejemplos: [
      'Corres como el viento.',
      'Es valiente como un león.',
      'Sus manos eran suaves como la seda.',
      'Llegó silencioso como una sombra en la noche.',
    ],
  },

  {
    id: 'hiperbole',
    nombre: 'Hipérbole',
    definicion: 'Exageración desproporcionada de una realidad, ya sea por exceso o por defecto, para intensificar su expresión.',
    distincion: 'La clave es que la exageración es literalmente imposible o absurda. No confundir con un énfasis normal.',
    grupo: 'enfasis',
    nivel: 'basico',
    ejemplos: [
      'Te lo he dicho mil veces.',
      'Me muero de vergüenza.',
      'Tengo un hambre que me comería un toro entero.',
      'Lloré un río de lágrimas.',
    ],
  },

  {
    id: 'personificacion',
    nombre: 'Personificación',
    definicion: 'Atribuye cualidades, sentimientos o acciones propias de seres humanos a animales, objetos o ideas abstractas.',
    distincion: 'El sujeto siempre es un ser NO humano (un objeto, un animal, la naturaleza, un concepto) que actúa o siente como persona.',
    grupo: 'imagen',
    nivel: 'basico',
    ejemplos: [
      'El viento susurra secretos entre los árboles.',
      'La luna nos miraba con envidia desde lo alto.',
      'Los árboles lloraban bajo la lluvia incesante.',
      'El mar bramaba furioso contra las rocas.',
    ],
  },

  {
    id: 'anafora',
    nombre: 'Anáfora',
    definicion: 'Repetición de una o varias palabras al comienzo de frases o versos consecutivos para crear ritmo y énfasis.',
    distincion: 'La repetición es siempre al INICIO de cada verso o frase. Si la repetición es al final, sería epífora.',
    grupo: 'repeticion',
    nivel: 'basico',
    ejemplos: [
      'Eres mi sol, eres mi luna, eres mi todo.',
      'Temprano levantó la muerte el vuelo, / temprano madrugó la madrugada.',
      'No me mires así, no me hables así, no me trates así.',
      'Yo quiero ser libre. Yo quiero ser feliz. Yo quiero ser yo.',
    ],
  },

  {
    id: 'antitesis',
    nombre: 'Antítesis',
    definicion: 'Contraposición o contraste de dos ideas, palabras o frases de significado opuesto o contrario.',
    distincion: 'Las ideas opuestas están en términos o frases SEPARADAS. En el oxímoron, los contrarios se funden en una sola expresión ("silencio ensordecedor").',
    grupo: 'contraste',
    nivel: 'basico',
    ejemplos: [
      'Es tan corto el amor y tan largo el olvido.',
      'Cuando quiero llorar, no lloro; y a veces lloro sin querer.',
      'Ayer naciste, mañana morirás.',
      'Lo que hoy construyes, mañana destruyes.',
    ],
  },

  {
    id: 'ironia',
    nombre: 'Ironía',
    definicion: 'Expresar lo contrario de lo que se dice o se piensa, generalmente con intención crítica o humorística.',
    distincion: 'El contexto revela el significado real, opuesto al literal. Se detecta por la situación: el enunciado positivo describe algo claramente negativo.',
    grupo: 'contraste',
    nivel: 'basico',
    ejemplos: [
      '¡Vaya, llegaste puntualísimo! (dicho a quien llega tarde)',
      '¡Qué tiempo tan maravilloso! (dicho bajo una tormenta)',
      '¡Menuda genialidad! (ante una idea obvia o tonta)',
      'Con lo listo que eres, seguro que lo entiendes. (dicho con sarcasmo)',
    ],
  },

  {
    id: 'epiteto',
    nombre: 'Epíteto',
    definicion: 'Adjetivo o frase adjetiva que expresa una cualidad característica e inherente del sustantivo, sin añadir información nueva.',
    distincion: 'El adjetivo NO aporta información nueva: se refiere a una cualidad obvia del sustantivo. "La blanca nieve" (epíteto) vs "La nieve sucia" (adjetivo informativo).',
    grupo: 'enfasis',
    nivel: 'basico',
    ejemplos: [
      'La blanca nieve cubría el suelo.',
      'El feroz lobo acechaba en el oscuro bosque.',
      'La dulce miel de las colmenas.',
      'El rugiente trueno retumbó en el cielo.',
    ],
  },

  {
    id: 'aliteracion',
    nombre: 'Aliteración',
    definicion: 'Repetición de uno o varios sonidos (letras) a lo largo de un verso o frase para crear un efecto rítmico o expresivo.',
    distincion: 'La repetición es de SONIDOS, no de palabras completas. Diferente de la anáfora (que repite palabras al inicio de frases).',
    grupo: 'repeticion',
    nivel: 'basico',
    ejemplos: [
      'Con el ala aleve del leve abanico. (Rubén Darío)',
      'Tres tristes tigres tragaban trigo en un trigal.',
      'El susurro suave del sutil viento sur.',
      'El silbido del silencio silencioso.',
    ],
  },

  {
    id: 'hiperbaton',
    nombre: 'Hipérbaton',
    definicion: 'Alteración del orden gramatical natural de las palabras en una oración.',
    distincion: 'El orden "natural" en español es Sujeto-Verbo-Complemento. El hipérbaton lo altera, especialmente en poesía clásica. No altera el significado, solo el orden.',
    grupo: 'sintaxis',
    nivel: 'basico',
    ejemplos: [
      'Del monte en la ladera. (En la ladera del monte)',
      'A Dafne ya los brazos le crecían. (Ya le crecían los brazos a Dafne) — Garcilaso de la Vega, Soneto XIII',
      'De su patria el recuerdo le dolía. (El recuerdo de su patria le dolía)',
      'Aquel que de mi nombre se ha enterado. (Aquel que se ha enterado de mi nombre)',
    ],
  },

  // ── INTERMEDIO — 10 figuras habituales (Bachillerato) ─────────────────

  {
    id: 'oximoron',
    nombre: 'Oxímoron',
    definicion: 'Unión de dos palabras o expresiones de significado contradictorio en una misma frase, creando un nuevo sentido.',
    distincion: 'A diferencia de la antítesis, el oxímoron funde los contrarios en una ÚNICA expresión breve. "Silencio ensordecedor" (oxímoron) vs "el ruido y el silencio" (antítesis).',
    grupo: 'contraste',
    nivel: 'intermedio',
    ejemplos: [
      'Un silencio ensordecedor llenó la sala.',
      'Es una oscura claridad que cae de las estrellas.',
      'Una helada quemadura recorrió su piel.',
      'Vivir muriendo, morir viviendo.',
    ],
  },

  {
    id: 'paradoja',
    nombre: 'Paradoja',
    definicion: 'Aparente contradicción que, analizada en profundidad, encierra una verdad o reflexión profunda.',
    distincion: 'A diferencia del oxímoron (expresión brevísima), la paradoja es una idea más elaborada cuya contradicción revela una verdad. "Muero porque no muero" (Santa Teresa).',
    grupo: 'contraste',
    nivel: 'intermedio',
    ejemplos: [
      'Muero porque no muero. (Santa Teresa de Ávila)',
      'Cuanto más sé, más me doy cuenta de lo poco que sé.',
      'El cobarde muere mil veces; el valiente, solo una.',
      'Para encontrarte, tuve que perderme.',
    ],
  },

  {
    id: 'gradacion',
    nombre: 'Gradación',
    definicion: 'Ordenación de palabras o ideas en serie ascendente (clímax) o descendente (anticlímax) de intensidad o importancia.',
    distincion: 'Los elementos deben estar ordenados con una progresión clara de menor a mayor (o viceversa). Si no hay progresión, es una simple enumeración.',
    grupo: 'enfasis',
    nivel: 'intermedio',
    ejemplos: [
      'Vine, vi, vencí. (Julio César)',
      'Un suspiro, un llanto, un grito desgarrador.',
      'Acudo, me apresuro, corro, vuelo.',
      'Lo intenté, lo logré, lo superé todo.',
    ],
  },

  {
    id: 'elipsis',
    nombre: 'Elipsis',
    definicion: 'Supresión de uno o varios elementos de la frase que se sobreentienden por el contexto, para ganar brevedad o elegancia.',
    distincion: 'Lo omitido se sobreentiende claramente. No confundir con el asíndeton, que omite específicamente las conjunciones.',
    grupo: 'sintaxis',
    nivel: 'intermedio',
    ejemplos: [
      'Yo fui al cine; ella, al teatro. (fue omitido)',
      'Unos nacen con estrella; otros, estrellados.',
      'El niño quería helado de vainilla; su hermana, de chocolate.',
      'A buen entendedor, pocas palabras. (bastan, omitido)',
    ],
  },

  {
    id: 'polisindeton',
    nombre: 'Polisíndeton',
    definicion: 'Uso repetido y deliberado de conjunciones (generalmente "y", "ni", "o") para dar énfasis o sensación de acumulación.',
    distincion: 'Lo opuesto al asíndeton: ABUNDANCIA de conjunciones donde gramaticalmente no serían necesarias todas. Crea efecto de lentitud o enumeración densa.',
    grupo: 'repeticion',
    nivel: 'intermedio',
    ejemplos: [
      'Y ríe, y llora, y canta, y baila sin parar.',
      'Ni come, ni duerme, ni descansa, ni para.',
      'Había lluvia y viento y frío y niebla y oscuridad.',
      'Corrió y saltó y giró y cayó al suelo.',
    ],
  },

  {
    id: 'asindeton',
    nombre: 'Asíndeton',
    definicion: 'Omisión de conjunciones para dar rapidez, agilidad o intensidad a la enumeración.',
    distincion: 'Lo opuesto al polisíndeton: AUSENCIA de conjunciones donde gramaticalmente se usarían. Crea efecto de velocidad o urgencia.',
    grupo: 'sintaxis',
    nivel: 'intermedio',
    ejemplos: [
      'Llegué, vi, vencí.',
      'Acudieron médicos, enfermeras, bomberos, policías.',
      'Reía, lloraba, gritaba, corría sin control.',
      'Llueve, nieva, graniza, ventea.',
    ],
  },

  {
    id: 'eufemismo',
    nombre: 'Eufemismo',
    definicion: 'Sustitución de una expresión malsonante, tabú o desagradable por otra más suave o socialmente aceptable.',
    distincion: 'Siempre sustituye algo negativo o tabú por algo más positivo. La perífrasis puede tener otras motivaciones (elegancia, estilo) sin necesidad de suavizar algo negativo.',
    grupo: 'enfasis',
    nivel: 'intermedio',
    ejemplos: [
      'Pasó a mejor vida. (murió)',
      'Personas con diversidad funcional. (discapacitados)',
      'Conflicto bélico de baja intensidad. (guerra)',
      'Tuvo un altercado con la policía. (lo detuvo la policía)',
    ],
  },

  {
    id: 'perifrasis',
    nombre: 'Perífrasis',
    definicion: 'Expresión de algo mediante un rodeo de palabras cuando podría decirse con menos, por elegancia o para evitar nombrar algo directamente.',
    distincion: 'A diferencia del eufemismo, no siempre suaviza algo negativo: puede ser simplemente un rodeo estilístico para nombrar algo de forma más elaborada.',
    grupo: 'enfasis',
    nivel: 'intermedio',
    ejemplos: [
      'El astro rey se ocultó tras las nubes. (el sol)',
      'La ciudad condal celebró su fiesta mayor. (Barcelona)',
      'El rey de la selva rugió al amanecer. (el león)',
      'El autor del Quijote escribió también La Galatea. (Cervantes)',
    ],
  },

  {
    id: 'metonimia',
    nombre: 'Metonimia',
    definicion: 'Sustitución de un término por otro con el que tiene una relación de contigüidad: el continente por el contenido, el autor por la obra, el lugar por las personas...',
    distincion: 'La relación es de CONTIGÜIDAD real (no de semejanza como en la metáfora). Subcategoría: cuando es parte/todo, se llama sinécdoque.',
    grupo: 'contigüidad',
    nivel: 'intermedio',
    ejemplos: [
      'Bebió tres copas. (el contenido por el continente)',
      'Leer a Cervantes toda la tarde. (el autor por la obra)',
      'El Palacio no ha respondido todavía. (el lugar por las personas)',
      'Vivir de su pluma. (el instrumento por la actividad)',
    ],
  },

  {
    id: 'sinecdoque',
    nombre: 'Sinécdoque',
    definicion: 'Tipo especial de metonimia en que se usa la parte por el todo, el todo por la parte, lo singular por lo plural o viceversa.',
    distincion: 'Es una metonimia específica: la relación es siempre parte/todo o singular/plural. "Cuatro bocas que alimentar" = cuatro personas (la parte por el todo).',
    grupo: 'contigüidad',
    nivel: 'intermedio',
    ejemplos: [
      'Tiene un techo bajo el que cobijarse. (la parte—techo—por el todo—casa)',
      'El español es un pueblo trabajador. (lo singular por lo plural)',
      'Cuatro bocas que alimentar llegaron a casa.',
      'Necesitaba un par de manos para el trabajo. (las manos por las personas)',
    ],
  },

  // ── AVANZADO — 7 figuras complejas (Selectividad / Universidad) ────────

  {
    id: 'alegoria',
    nombre: 'Alegoría',
    definicion: 'Metáfora extendida y sostenida a lo largo de todo un texto o fragmento, donde los elementos representan un plano de significado diferente al literal.',
    distincion: 'Es una metáfora SOSTENIDA durante todo un texto, no una imagen aislada. Una metáfora puntual no es alegoría.',
    grupo: 'imagen',
    nivel: 'avanzado',
    ejemplos: [
      'La vida es un río: nace pequeño en la montaña, crece, supera obstáculos y al final desemboca en el mar (la muerte).',
      'La caverna de Platón: los prisioneros encadenados representan la ignorancia humana y las sombras representan las apariencias.',
      'El jardín abandonado a lo largo del poema representa el alma en pecado.',
      'El laberinto como metáfora de la mente humana, desarrollada en toda la novela.',
    ],
  },

  {
    id: 'apostrofe',
    nombre: 'Apóstrofe',
    definicion: 'Interrupción del discurso para dirigirse directamente a alguien ausente, a una abstracción o a un objeto inanimado.',
    distincion: 'Siempre hay un DESTINATARIO directo que no forma parte natural de la conversación: está ausente, es abstracto o es inanimado. Se usa la segunda persona ("tú", "vosotros").',
    grupo: 'enfasis',
    nivel: 'avanzado',
    ejemplos: [
      '¡Oh muerte, ven a mí con sigilo!',
      '¡Patria mía, cuánto has sufrido a lo largo de los siglos!',
      'Tú, Amor cruel, ¿por qué me abandonas cuando más te necesito?',
      '¡Oh tú, que tanto amé y ya no estás aquí!',
    ],
  },

  {
    id: 'litotes',
    nombre: 'Lítotes',
    definicion: 'Afirmar algo atenuado negando su contrario, para expresar con modestia, ironía o énfasis lo que podría decirse de forma directa.',
    distincion: 'Siempre hay una NEGACIÓN que implica lo contrario positivo. "No es mal estudiante" = es buen estudiante. No confundir con la simple negación.',
    grupo: 'enfasis',
    nivel: 'avanzado',
    ejemplos: [
      'No es mal estudiante. (es buen estudiante)',
      'No le falta valor. (es muy valiente)',
      'La propuesta no me disgusta. (me gusta)',
      'No estuvo del todo mal la actuación. (estuvo bien)',
    ],
  },

  {
    id: 'quiasmo',
    nombre: 'Quiasmo',
    definicion: 'Figura de construcción que repite elementos en orden inverso (estructura ABBA), creando una simetría cruzada.',
    distincion: 'La repetición es CRUZADA: lo que ocupa el primer lugar en la primera parte pasa al último en la segunda. "Come para vivir / no vivas para comer" (comer-vivir / vivir-comer).',
    grupo: 'sintaxis',
    nivel: 'avanzado',
    ejemplos: [
      'Come para vivir, no vivas para comer.',
      'Hay quienes trabajan para vivir y quienes viven para trabajar.',
      'Cuando quiero llorar no lloro, y a veces lloro sin querer. (Rubén Darío)',
      'El amor nace del dolor y el dolor nace del amor.',
    ],
  },

  {
    id: 'paronomasia',
    nombre: 'Paronomasia',
    definicion: 'Uso cercano de palabras de sonido similar pero significado diferente (palabras parónimas), creando un juego de palabras.',
    distincion: 'Las palabras se PARECEN en sonido pero tienen diferente significado. No es la repetición de la misma palabra (eso sería anadiplosis).',
    grupo: 'repeticion',
    nivel: 'avanzado',
    ejemplos: [
      'Amo a mi amo. (amar / amo=señor)',
      'Pobre porfiado saca mendrugo.',
      'Vino el amor con vino. (venir / vino=bebida)',
      'No hay mal que por bien no venga, ni bien que mal no cueste.',
    ],
  },

  {
    id: 'zeugma',
    nombre: 'Zeugma',
    definicion: 'Un solo elemento gramatical (verbo, adjetivo o sustantivo) sirve para dos o más partes de la frase, aunque semánticamente no concuerde igual con todas.',
    distincion: 'La clave es que UN elemento "hace el trabajo" de varios. Se diferencia de la elipsis en que el elemento repetido sería el mismo, pero aquí el significado varía.',
    grupo: 'sintaxis',
    nivel: 'avanzado',
    ejemplos: [
      'Ella entró con su sombrero de fiesta y su amiga, de trabajo.',
      'Cierra la puerta y tus esperanzas.',
      'Tenía el corazón y los bolsillos vacíos.',
      'Se llevó mi cartera y mis ilusiones.',
    ],
  },
];
