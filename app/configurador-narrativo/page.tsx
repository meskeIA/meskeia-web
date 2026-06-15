'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './ConfiguradorNarrativo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

type Persona = '1a' | '3a' | '2a';
type TipoNarrador = 'protagonista' | 'testigo' | 'no-fiable' | 'omnisciente' | 'limitado' | 'objetivo' | 'participante';
type TiempoVerbal = 'pasado' | 'presente';
type Frecuencia = 'muy-comun' | 'comun' | 'clasico' | 'poco-frecuente' | 'experimental';

interface EjemploComb {
  titulo: string;
  autor: string;
  nota: string;
}

interface Combinacion {
  id: string;
  persona: Persona;
  narrador: TipoNarrador;
  tiempo: TiempoVerbal;
  nombre: string;
  frecuencia: Frecuencia;
  descripcion: string;
  efectoLector: string;
  cuandoUsar: string[];
  cuandoEvitar: string[];
  ejemplos: EjemploComb[];
  fortaleza: string;
  debilidad: string;
}

interface NarradorOpcion {
  id: TipoNarrador;
  nombre: string;
  descripcion: string;
  emoji: string;
}

const PERSONA_CONFIG: Record<Persona, { label: string; pronombre: string; color: string; desc: string }> = {
  '1a': { label: '1ª Persona', pronombre: 'yo', color: '#2E86AB', desc: 'El narrador habla de sí mismo usando "yo"' },
  '3a': { label: '3ª Persona', pronombre: 'él/ella', color: '#7B2D8B', desc: 'El narrador habla de los personajes desde fuera' },
  '2a': { label: '2ª Persona', pronombre: 'tú', color: '#C67C3A', desc: 'El narrador habla al lector o al protagonista usando "tú"' },
};

const NARRADOR_OPCIONES: Record<Persona, NarradorOpcion[]> = {
  '1a': [
    { id: 'protagonista', nombre: 'Protagonista', descripcion: 'Narrador y protagonista son la misma persona', emoji: '👤' },
    { id: 'testigo', nombre: 'Testigo', descripcion: 'El yo narra la historia de otro personaje', emoji: '👁️' },
    { id: 'no-fiable', nombre: 'No fiable', descripcion: 'El yo miente, se engaña o percibe la realidad de forma distorsionada', emoji: '🎭' },
  ],
  '3a': [
    { id: 'omnisciente', nombre: 'Omnisciente', descripcion: 'Accede a los pensamientos de todos los personajes', emoji: '🌐' },
    { id: 'limitado', nombre: 'Limitado', descripcion: 'Sigue la perspectiva interna de un único personaje', emoji: '🔭' },
    { id: 'objetivo', nombre: 'Objetivo', descripcion: 'Solo describe acciones y diálogos, sin acceder a mentes', emoji: '📹' },
  ],
  '2a': [
    { id: 'participante', nombre: 'Participante', descripcion: 'El "tú" convierte al lector en el protagonista', emoji: '🫵' },
  ],
};

const FRECUENCIA_CONFIG: Record<Frecuencia, { label: string; color: string }> = {
  'muy-comun':      { label: 'Muy común',      color: '#27AE60' },
  'comun':          { label: 'Común',           color: '#2E86AB' },
  'clasico':        { label: 'Clásico',         color: '#8E44AD' },
  'poco-frecuente': { label: 'Poco frecuente',  color: '#E67E22' },
  'experimental':   { label: 'Experimental',    color: '#E74C3C' },
};

const COMBINACIONES: Combinacion[] = [
  {
    id: '1a-protagonista-pasado',
    persona: '1a', narrador: 'protagonista', tiempo: 'pasado',
    nombre: 'El protagonista recuerda',
    frecuencia: 'muy-comun',
    descripcion: 'El narrador y el protagonista son la misma persona. Narra hechos pasados, generalmente desde un punto posterior con mayor perspectiva. Es la voz narrativa más usada en la literatura moderna.',
    efectoLector: 'Intimidad máxima con el protagonista. El lector accede directamente a sus pensamientos, miedos y contradicciones. La distancia temporal permite al narrador juzgar su yo pasado con ironía o nostalgia, creando una tensión entre quien era y quien es ahora.',
    cuandoUsar: [
      'Cuando la voz del protagonista es el corazón de la novela',
      'En coming-of-age, memorias ficcionalizadas y novelas de formación',
      'Cuando el contraste entre el yo pasado y el yo presente aporta profundidad',
      'Cuando quieres que el lector confíe (o no) en una voz muy específica',
    ],
    cuandoEvitar: [
      'Si necesitas mostrar escenas en las que el protagonista no estaba presente',
      'Si la trama requiere múltiples perspectivas de peso equivalente',
      'Si la historia gana con la distancia emocional del narrador externo',
    ],
    ejemplos: [
      { titulo: 'El guardián entre el centeno', autor: 'J.D. Salinger', nota: 'Holden narra desde un hospital lo que ocurrió meses atrás; la voz adolescente es inseparable de la novela' },
      { titulo: 'Matar un ruiseñor', autor: 'Harper Lee', nota: 'Scout adulta mira con ternura e ironía a su yo de 8 años durante el juicio de Tom Robinson' },
      { titulo: 'En el camino', autor: 'Jack Kerouac', nota: 'Sal Paradise recuerda el viaje; la voz beat define el tono desde la primera línea' },
    ],
    fortaleza: 'Voz inconfundible y conexión emocional inmediata',
    debilidad: 'Acceso limitado a lo que el protagonista no puede saber o no quiere reconocer',
  },
  {
    id: '1a-protagonista-presente',
    persona: '1a', narrador: 'protagonista', tiempo: 'presente',
    nombre: 'El protagonista en tiempo real',
    frecuencia: 'comun',
    descripcion: 'El yo narra mientras los hechos ocurren, sin distancia temporal. El lector vive cada momento con el narrador sin saber qué pasará después. Crea una sensación de urgencia e inmediatez que el pasado no puede igualar.',
    efectoLector: 'Inmediatez radical: el lector no sabe más que el narrador. Cada decisión parece real y con consecuencias abiertas. La tensión es máxima porque la voz narradora también ignora el futuro. El presente elimina la sensación de que todo ya está resuelto.',
    cuandoUsar: [
      'Cuando quieres que el lector sienta que el destino del protagonista es incierto',
      'En thrillers y relatos de supervivencia donde cada momento importa',
      'Cuando la experiencia sensorial del momento presente es central',
      'En novelas juveniles y de acción donde el ritmo rápido es prioritario',
    ],
    cuandoEvitar: [
      'Si la novela requiere reflexión retrospectiva o perspectiva del tiempo',
      'En historias largas o complejas: el presente sostenido puede cansar',
      'Cuando la distancia irónica del narrador adulto mirando al yo joven es necesaria',
    ],
    ejemplos: [
      { titulo: 'Los juegos del hambre', autor: 'Suzanne Collins', nota: 'Katniss narra en presente, cada capítulo termina en cliffhanger; el lector no sabe si sobrevivirá' },
      { titulo: 'La historia de una nueva apellido', autor: 'Elena Ferrante', nota: 'Algunos tramos en presente para intensificar los momentos de mayor tensión emocional' },
      { titulo: 'Belleza americana', autor: 'Alan Ball (adaptación)', nota: 'El presente en voz en off del protagonista crea una ironía brutal desde el inicio' },
    ],
    fortaleza: 'Urgencia e inmediatez; el lector no puede anticipar el desenlace',
    debilidad: 'Difícil de mantener en novelas largas; puede resultar agotador',
  },
  {
    id: '1a-testigo-pasado',
    persona: '1a', narrador: 'testigo', tiempo: 'pasado',
    nombre: 'El testigo que narra a otro',
    frecuencia: 'clasico',
    descripcion: 'El yo no es el protagonista sino un observador que narra la historia de otro personaje fascinante. El narrador-testigo tiene acceso privilegiado a los hechos pero no puede leer la mente del protagonista real, solo interpretar sus actos y palabras.',
    efectoLector: 'El personaje central se vuelve enigmático y magnético porque el lector solo lo ve desde fuera, filtrado por la subjetividad del testigo. Crea una distancia que paradójicamente aumenta el misterio y la fascinación. El narrador-testigo también tiene su propio arco que se revela a través de lo que elige contar.',
    cuandoUsar: [
      'Cuando el protagonista real es demasiado extraordinario o misterioso para explicarse a sí mismo',
      'Cuando la perspectiva del observador aporta una capa de significado que el protagonista no puede dar',
      'Para mantener el misterio sobre la psicología del personaje central',
    ],
    cuandoEvitar: [
      'Si la historia gana con el acceso directo a la mente del protagonista',
      'Si el testigo resulta irrelevante o plano comparado con quien observa',
    ],
    ejemplos: [
      { titulo: 'El gran Gatsby', autor: 'F. Scott Fitzgerald', nota: 'Nick Carraway observa a Gatsby desde fuera; el misterio de Gatsby nunca se resuelve del todo' },
      { titulo: 'Las aventuras de Sherlock Holmes', autor: 'Arthur Conan Doyle', nota: 'Watson narra la genialidad de Holmes; sin Watson, Holmes perdería su dimensión humana' },
      { titulo: 'Beloved', autor: 'Toni Morrison', nota: 'Múltiples testigos construyen la historia de Sethe desde ángulos parciales' },
    ],
    fortaleza: 'El misterio del protagonista real se sostiene sin artificios',
    debilidad: 'El testigo puede parecer un personaje funcional si no tiene su propio arco',
  },
  {
    id: '1a-testigo-presente',
    persona: '1a', narrador: 'testigo', tiempo: 'presente',
    nombre: 'El testigo en tiempo real',
    frecuencia: 'poco-frecuente',
    descripcion: 'El narrador-testigo observa y narra en presente, sin distancia temporal. Combina el misterio del testigo externo con la urgencia del presente. Poco frecuente pero eficaz en relatos cortos y novelas de tensión concentrada.',
    efectoLector: 'Urgencia e incertidumbre dobles: el testigo no puede leer la mente del protagonista real y tampoco sabe qué ocurrirá. El lector está en la misma posición de ignorancia que el narrador, creando una tensión sostenida.',
    cuandoUsar: [
      'En relatos cortos donde la concentración de tiempo y perspectiva es una virtud',
      'Cuando la confusión del narrador ante lo que observa es parte del efecto',
      'En escenas de crisis o clímax donde la velocidad del presente es necesaria',
    ],
    cuandoEvitar: [
      'En novelas largas: la combinación es difícil de sostener sin recursos técnicos sofisticados',
      'Cuando el lector necesita orientación temporal clara para seguir la trama',
    ],
    ejemplos: [
      { titulo: 'Algunos relatos de Raymond Carver', autor: 'Raymond Carver', nota: 'Testigo en presente que no entiende del todo lo que ocurre; la comprensión parcial es el tema' },
      { titulo: 'Historias de cronopios y de famas', autor: 'Julio Cortázar', nota: 'Testigos extravagantes en presente que narran sin comprender del todo' },
    ],
    fortaleza: 'Tensión doble: misterio del protagonista + incertidumbre temporal',
    debilidad: 'Técnicamente exigente, difícil de mantener en textos largos',
  },
  {
    id: '1a-no-fiable-pasado',
    persona: '1a', narrador: 'no-fiable', tiempo: 'pasado',
    nombre: 'El narrador que miente (o se engaña)',
    frecuencia: 'comun',
    descripcion: 'El yo narra hechos pasados pero su versión es parcial, distorsionada o directamente falsa. El lector debe descifrar qué es verdad leyendo entre líneas: los silencios, las contradicciones y lo que el narrador evita decir revelan tanto como lo que cuenta.',
    efectoLector: 'Implicación activa del lector: debe interrogar cada afirmación del narrador y construir su propia versión de los hechos. La relectura revela nuevas capas. Es la mecánica central del thriller psicológico moderno y produce una satisfacción intelectual única cuando el engaño se descubre.',
    cuandoUsar: [
      'En thrillers psicológicos donde el giro depende de que el narrador engañe al lector',
      'En retratos de personajes con autoengaño o psicología perturbada',
      'Cuando la distancia entre lo que el narrador cree y la realidad es el tema de la novela',
      'Siempre que la relectura deba revelar algo que pasó inadvertido la primera vez',
    ],
    cuandoEvitar: [
      'Si el engaño no tiene propósito narrativo claro más allá de la sorpresa',
      'En novelas donde la confianza del lector en el narrador es necesaria para la emoción',
      'Si el lector descubre el engaño demasiado pronto y pierde el interés',
    ],
    ejemplos: [
      { titulo: 'Lolita', autor: 'Vladimir Nabokov', nota: 'Humbert Humbert construye una narración que intenta justificar lo injustificable; el lector debe ver más allá de su elocuencia' },
      { titulo: 'El talento de Mr. Ripley', autor: 'Patricia Highsmith', nota: 'Ripley narra sus crímenes sin remordimiento; el horror proviene de lo que no dice' },
      { titulo: 'Perdida', autor: 'Gillian Flynn', nota: 'Las secciones de diario de Amy son un narrador no fiable construyendo una historia para ser encontrada' },
    ],
    fortaleza: 'Implicación intelectual máxima del lector; relectura con nuevos ojos',
    debilidad: 'Si el engaño se detecta demasiado pronto, la novela pierde su motor',
  },
  {
    id: '1a-no-fiable-presente',
    persona: '1a', narrador: 'no-fiable', tiempo: 'presente',
    nombre: 'El narrador que se engaña ahora mismo',
    frecuencia: 'experimental',
    descripcion: 'El yo narra en presente distorsionando la realidad en tiempo real, sin la coartada de la memoria. Puede ser resultado de psicosis, disociación, obsesión o una percepción radicalmente subjetiva. Es la forma más extrema del narrador no fiable.',
    efectoLector: 'Desorientación controlada: el lector no puede fiarse de ningún dato del mundo diegético. La realidad de la novela se vuelve inestable. Muy eficaz para representar estados mentales alterados, trauma o perspectivas no neuronormativas.',
    cuandoUsar: [
      'Para representar psicosis, disociación o estados mentales alterados',
      'En literatura experimental donde la inestabilidad narrativa es el tema',
      'Cuando quieres que el lector experimente la confusión del protagonista desde dentro',
    ],
    cuandoEvitar: [
      'Si el lector necesita un ancla de realidad para orientarse en la trama',
      'En novelas de género que requieren una trama claramente comprensible',
    ],
    ejemplos: [
      { titulo: 'La campana de cristal', autor: 'Sylvia Plath', nota: 'Esther Greenwood narra su descenso en el presente de su experiencia; la fiabilidad se erosiona gradualmente' },
      { titulo: 'El sonido y la furia (sección de Benjy)', autor: 'William Faulkner', nota: 'Un narrador con discapacidad cognitiva narra en presente sin jerarquía temporal: el resultado es completamente desorientador' },
    ],
    fortaleza: 'Representación más auténtica de estados mentales alterados',
    debilidad: 'Puede alienar al lector si no se gestiona con precisión quirúrgica',
  },
  {
    id: '3a-omnisciente-pasado',
    persona: '3a', narrador: 'omnisciente', tiempo: 'pasado',
    nombre: 'El narrador que lo sabe todo',
    frecuencia: 'clasico',
    descripcion: 'El narrador externo conoce los pensamientos, emociones e intenciones de todos los personajes. Puede moverse libremente entre mentes, épocas y lugares. Es la forma narrativa de la gran novela del siglo XIX y de géneros como la fantasía épica y el realismo mágico.',
    efectoLector: 'Visión panorámica y profundidad coral. El lector puede comparar lo que distintos personajes piensan sobre el mismo hecho, acceder a ironías que los personajes ignoran y sentir el peso de una historia que trasciende a cualquier individuo. Produce una sensación de mundo completo y habitado.',
    cuandoUsar: [
      'En sagas familiares, épicas y novelas corales con múltiples arcos equivalentes',
      'Cuando la ironía dramática (el lector sabe más que los personajes) es central',
      'En mundos ficticios complejos que necesitan ser explicados desde fuera',
      'Cuando la historia trasciende a los personajes individuales',
    ],
    cuandoEvitar: [
      'Si saltar entre mentes resulta confuso o dispersa el foco emocional',
      'En thrillers donde el misterio depende de la limitación del punto de vista',
      'Cuando la cercanía íntima con un único personaje es más importante',
    ],
    ejemplos: [
      { titulo: 'Guerra y paz', autor: 'León Tolstói', nota: 'El narrador se mueve entre cientos de personajes y reflexiona directamente sobre la historia; es el omnisciente en su máxima expresión' },
      { titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', nota: 'Un omnisciente que narra el futuro con la misma naturalidad que el pasado' },
      { titulo: 'Middlemarch', autor: 'George Eliot', nota: 'La narradora interrumpe la ficción para reflexionar sobre la condición humana; máxima autoridad moral' },
    ],
    fortaleza: 'Visión total del mundo ficcional; ironía dramática ilimitada',
    debilidad: 'Puede crear distancia emocional; el salto entre mentes puede dispersar',
  },
  {
    id: '3a-omnisciente-presente',
    persona: '3a', narrador: 'omnisciente', tiempo: 'presente',
    nombre: 'El narrador total en presente',
    frecuencia: 'experimental',
    descripcion: 'Un narrador que lo sabe todo pero narra en presente, como si los hechos ocurrieran mientras se cuentan. Rompe la convención del omnisciente clásico (casi siempre en pasado) y produce un efecto de simultaneidad entre narración y acción.',
    efectoLector: 'Extrañeza productiva: el omnisciente en presente parece contradictorio (¿cómo puede saber todo si ocurre ahora?) y esa tensión puede ser fructífera. Crea una sensación de fábula, mito o narración performativa.',
    cuandoUsar: [
      'En fábulas, mitos modernos y narraciones de tono elevado o alegórico',
      'Cuando quieres que la narración misma sea visible como acto performativo',
      'En textos experimentales que cuestionan las convenciones narrativas',
    ],
    cuandoEvitar: [
      'En novelas realistas donde la coherencia temporal es necesaria',
      'Si el lector puede confundirse sobre si el narrador "ya sabe" lo que ocurrirá',
    ],
    ejemplos: [
      { titulo: 'El almuerzo desnudo', autor: 'William S. Burroughs', nota: 'Fragmentos en presente omnisciente que desestabilizan la coherencia temporal deliberadamente' },
      { titulo: 'Algunos cuentos de Borges', autor: 'Jorge Luis Borges', nota: 'El narrador borgesiano en presente sabe más de lo que debería ser posible' },
    ],
    fortaleza: 'Efecto de mito, fábula o narración performativa',
    debilidad: 'Difícil de justificar en narrativa realista; puede resultar incoherente',
  },
  {
    id: '3a-limitado-pasado',
    persona: '3a', narrador: 'limitado', tiempo: 'pasado',
    nombre: 'Cerca de uno, fuera de todos los demás',
    frecuencia: 'muy-comun',
    descripcion: 'El narrador externo sigue la perspectiva interna de un único personaje: ve el mundo como ese personaje lo ve, siente lo que siente, pero habla de él en tercera persona. Es el modo dominante de la ficción contemporánea.',
    efectoLector: 'El mejor equilibrio entre intimidad y flexibilidad. El lector se identifica profundamente con el personaje focalizado pero el narrador externo puede controlar el ritmo, la distancia y el tono mejor que el yo. Los otros personajes son tan misteriosos como lo serían para el protagonista en la vida real.',
    cuandoUsar: [
      'En casi cualquier novela donde un personaje es el centro emocional claro',
      'Cuando quieres intimidad psicológica sin los límites del yo',
      'En thrillers y misterios donde el lector debe descubrir con el protagonista',
      'Cuando el narrador necesita cierta distancia irónica respecto al personaje',
    ],
    cuandoEvitar: [
      'Si necesitas acceder a las mentes de varios personajes de forma equivalente',
      'En narraciones corales donde ningún personaje es claramente el protagonista',
    ],
    ejemplos: [
      { titulo: 'Madame Bovary', autor: 'Gustave Flaubert', nota: 'El narrador sigue a Emma con una empatía e ironía simultáneas que solo el limitado puede sostener' },
      { titulo: 'Harry Potter', autor: 'J.K. Rowling', nota: 'Todo el mundo de Hogwarts filtrado exclusivamente por lo que Harry observa y siente' },
      { titulo: 'El señor de los anillos', autor: 'J.R.R. Tolkien', nota: 'El foco narrativo se mueve entre personajes del grupo, pero siempre limitado a quien está en escena' },
    ],
    fortaleza: 'Equilibrio ideal entre intimidad y control narrativo',
    debilidad: 'Limita el acceso a lo que el personaje focalizado no sabe',
  },
  {
    id: '3a-limitado-presente',
    persona: '3a', narrador: 'limitado', tiempo: 'presente',
    nombre: 'Cerca de uno, ahora mismo',
    frecuencia: 'comun',
    descripcion: 'Tercera persona limitada con el tiempo verbal en presente: el narrador sigue al personaje en tiempo real, sin distancia temporal. Muy habitual en la ficción literaria contemporánea desde los años 2000.',
    efectoLector: 'Intimidad del limitado más urgencia del presente. El lector siente que habita el cuerpo y la mente del personaje momento a momento, sin la mediación de la memoria. El mundo externo se percibe a través de los sentidos del personaje de forma muy inmediata.',
    cuandoUsar: [
      'En ficción literaria contemporánea que busca inmersión sensorial',
      'Cuando la experiencia corporal y perceptiva del personaje es central',
      'En novelas de relaciones donde cada interacción importa en tiempo real',
    ],
    cuandoEvitar: [
      'En sagas largas o novelas históricas donde la perspectiva retrospectiva aporta valor',
      'Cuando el narrador necesita comentar o reflexionar sobre los hechos desde la distancia',
    ],
    ejemplos: [
      { titulo: 'Normal People', autor: 'Sally Rooney', nota: 'El presente limitado captura cada conversación y silencio entre Connell y Marianne con intensidad clínica' },
      { titulo: 'Una pequeña vida', autor: 'Hanya Yanagihara', nota: 'El presente limitado hace el trauma de Jude casi insoportablemente inmediato' },
      { titulo: 'La decisión de Sophie', autor: 'William Styron', nota: 'Alterna presente limitado con retrospectiva para calibrar la distancia emocional' },
    ],
    fortaleza: 'Inmersión sensorial máxima en el momento presente del personaje',
    debilidad: 'La ausencia de retrospectiva puede limitar la profundidad reflexiva',
  },
  {
    id: '3a-objetivo-pasado',
    nombre: 'La cámara que no opina',
    persona: '3a', narrador: 'objetivo', tiempo: 'pasado',
    frecuencia: 'clasico',
    descripcion: 'El narrador solo describe lo que podría captar una cámara: acciones externas, diálogos, gestos. No accede a ninguna mente ni interpreta emociones. Lo que los personajes sienten debe deducirse de lo que hacen y dicen. Es la técnica del minimalismo narrativo.',
    efectoLector: 'El lector se convierte en intérprete activo: debe inferir la psicología desde el comportamiento externo, como en la vida real. Los silencios y las elipsis son tan significativos como los diálogos. Produce una sensación de frialdad, contención y realismo duro que puede resultar muy poderosa.',
    cuandoUsar: [
      'Cuando quieres que el lector trabaje activamente para descifrar la psicología',
      'En retratos de violencia o trauma donde la descripción directa sería excesiva',
      'En relatos cortos donde la elipsis y el subtexto son la técnica central',
      'Para crear distancia irónica ante situaciones cargadas emocionalmente',
    ],
    cuandoEvitar: [
      'En novelas largas: la austeridad sostenida puede agotar al lector',
      'Cuando la psicología interna de los personajes es el tema central',
      'En historias que requieren empatía directa, no inferida',
    ],
    ejemplos: [
      { titulo: 'Colinas como elefantes blancos', autor: 'Ernest Hemingway', nota: 'Solo diálogo y descripción externa; la conversación sobre el aborto nunca se nombra directamente' },
      { titulo: 'Los asesinos', autor: 'Ernest Hemingway', nota: 'El lector sabe tan poco como los personajes; la amenaza se construye solo con acciones' },
      { titulo: 'Catedral', autor: 'Raymond Carver', nota: 'Un narrador que no entiende del todo lo que ocurre; el lector entiende más que él' },
    ],
    fortaleza: 'Máxima implicación del lector; el subtexto es protagonista',
    debilidad: 'Difícil de sostener en textos largos; puede resultar frío o hermético',
  },
  {
    id: '3a-objetivo-presente',
    persona: '3a', narrador: 'objetivo', tiempo: 'presente',
    nombre: 'La cámara en tiempo real',
    frecuencia: 'experimental',
    descripcion: 'El narrador objetivo en presente narra acciones y diálogos sin acceder a ninguna mente, como si fuera un documental en directo. La combinación más austera posible: sin subjetividad y sin distancia temporal.',
    efectoLector: 'Máxima frialdad y urgencia simultáneas. El mundo se presenta sin mediación psicológica y en tiempo real, como si la escritura intentara capturar la superficie pura de los hechos. Muy eficaz en relatos cortos, casi imposible de sostener en novelas largas.',
    cuandoUsar: [
      'En relatos muy cortos o escenas de alta tensión donde la frialdad es deliberada',
      'En experimentos narrativos que cuestionan la subjetividad como condición narrativa',
    ],
    cuandoEvitar: [
      'Como modo narrativo principal de una novela larga',
      'Cuando el lector necesita un ancla emocional o psicológica para seguir la historia',
    ],
    ejemplos: [
      { titulo: 'Algunos experimentos de Alain Robbe-Grillet', autor: 'Alain Robbe-Grillet', nota: 'El nouveau roman francés lleva el objetivismo al extremo; la descripción geométrica de superficies es el método' },
      { titulo: 'Escritura de secuencias fílmicas en guion', autor: '(técnica de guion)', nota: 'El guion cinematográfico es objetivismo puro en presente; ninguna emoción puede escribirse, solo mostrarse' },
    ],
    fortaleza: 'Máxima implicación del lector como intérprete; frialdad expresiva',
    debilidad: 'Prácticamente insostenible en novelas largas; muy exigente técnicamente',
  },
  {
    id: '2a-participante-presente',
    persona: '2a', narrador: 'participante', tiempo: 'presente',
    nombre: 'El lector como protagonista',
    frecuencia: 'experimental',
    descripcion: 'El narrador habla al protagonista (o al lector) usando "tú", convirtiendo la lectura en una experiencia de segunda persona. En presente, el efecto es inmersivo e hipnótico. Rompe la distancia entre lector y texto de forma radical.',
    efectoLector: 'El lector se siente interpelado directamente: "tú entras en la habitación", "tú no sabes qué decir". Crea una intimidad extraña e inestable que puede ser muy poderosa pero también alienante si el lector no se identifica con el "tú". El presente refuerza la sensación de instrucción o destino inevitable.',
    cuandoUsar: [
      'En novelas que quieren implicar al lector como agente activo de la historia',
      'En relatos de juego, videojuego literario o narrativa interactiva',
      'Cuando la experiencia de leer el libro debe parecerse a vivir los hechos',
      'En algunos pasajes de novelas en primera o tercera persona para crear un efecto de disociación',
    ],
    cuandoEvitar: [
      'En novelas largas realistas: el "tú" sostenido puede resultar agotador o artificial',
      'Si el protagonista tiene características muy específicas que el lector no puede asumir',
    ],
    ejemplos: [
      { titulo: 'Si una noche de invierno un viajero', autor: 'Italo Calvino', nota: 'El "tú" es el lector comprando un libro de Calvino; la novela habla de la experiencia de leer' },
      { titulo: 'Bright Lights, Big City', autor: 'Jay McInerney', nota: 'Toda la novela en segunda persona del singular; el "tú" eres un joven en Nueva York de los 80' },
      { titulo: 'Half-Life 2 (guion)', autor: 'Valve', nota: 'El protagonista mudo convierte al jugador/lector en el "tú" sin necesidad de palabras' },
    ],
    fortaleza: 'Implicación directa e inmersiva del lector; efecto único y memorable',
    debilidad: 'Difícil de sostener; puede resultar artificial o alienante',
  },
  {
    id: '2a-participante-pasado',
    persona: '2a', narrador: 'participante', tiempo: 'pasado',
    nombre: 'Lo que tú hiciste',
    frecuencia: 'poco-frecuente',
    descripcion: 'El narrador habla al protagonista en segunda persona sobre hechos ya ocurridos. Menos común que el presente, pero produce un efecto de ajuste de cuentas o rememoranza acusadora: "lo que hiciste", "lo que sentiste".',
    efectoLector: 'La segunda persona en pasado puede sonar como un reproche o una confesión dirigida al protagonista sobre sí mismo. Produce una extrañeza que puede ser muy poderosa en contextos de trauma, culpa o memoria.',
    cuandoUsar: [
      'En pasajes de novelas donde un personaje se reprocha o recuerda a su yo pasado',
      'En contextos de trauma o disociación donde el narrador se distancia de sí mismo',
      'En relatos cortos muy específicos donde el efecto es deliberado',
    ],
    cuandoEvitar: [
      'Como modo narrativo principal de una novela larga',
      'Si el lector no puede identificar claramente a quién se dirige el "tú"',
    ],
    ejemplos: [
      { titulo: 'Algunos pasajes de Atonement', autor: 'Ian McEwan', nota: 'Briony se dirige a sí misma en segundo plano: la disociación del yo culpable' },
      { titulo: 'On Earth We\'re Briefly Gorgeous', autor: 'Ocean Vuong', nota: 'El "tú" es el destinatario de una carta del narrador a su madre; el pasado en segunda persona como acto de amor y ajuste de cuentas' },
    ],
    fortaleza: 'Efecto de reproche, confesión o disociación muy específico',
    debilidad: 'Muy limitado en alcance; difícil de justificar en textos largos',
  },
];

interface AutorReferencia {
  autor: string;
  obra: string;
  persona: Persona;
  narrador: TipoNarrador;
  tiempo: TiempoVerbal;
  nota: string;
}

const AUTORES_REFERENCIA: AutorReferencia[] = [
  { autor: 'León Tolstói', obra: 'Guerra y paz', persona: '3a', narrador: 'omnisciente', tiempo: 'pasado', nota: 'El narrador omnisciente más ambicioso de la historia: reflexiona sobre el libre albedrío y la historia' },
  { autor: 'Ernest Hemingway', obra: 'Fiesta / El sol también sale', persona: '3a', narrador: 'objetivo', tiempo: 'pasado', nota: 'El iceberg: 90% de la emoción debajo de la superficie, nunca nombrada directamente' },
  { autor: 'Virginia Woolf', obra: 'Mrs. Dalloway', persona: '3a', narrador: 'limitado', tiempo: 'pasado', nota: 'Limitado con flujo de conciencia: la voz narrativa se funde con la mente del personaje' },
  { autor: 'F. Scott Fitzgerald', obra: 'El gran Gatsby', persona: '1a', narrador: 'testigo', tiempo: 'pasado', nota: 'Nick observa a Gatsby con fascinación e incomprensión; el misterio del otro es el tema' },
  { autor: 'Vladimir Nabokov', obra: 'Lolita', persona: '1a', narrador: 'no-fiable', tiempo: 'pasado', nota: 'La elocuencia de Humbert intenta seducir al lector; el horror exige resistir esa seducción' },
  { autor: 'J.D. Salinger', obra: 'El guardián entre el centeno', persona: '1a', narrador: 'protagonista', tiempo: 'pasado', nota: 'Holden habla al lector directamente; la voz adolescente como sistema de valores y de distancia' },
  { autor: 'Gabriel García Márquez', obra: 'Cien años de soledad', persona: '3a', narrador: 'omnisciente', tiempo: 'pasado', nota: 'El omnisciente narra el futuro con la misma naturalidad que el pasado; el tiempo es cíclico' },
  { autor: 'Gustave Flaubert', obra: 'Madame Bovary', persona: '3a', narrador: 'limitado', tiempo: 'pasado', nota: 'Flaubert inventa el estilo indirecto libre: los pensamientos de Emma sin marcas de atribución' },
  { autor: 'Sally Rooney', obra: 'Normal People', persona: '3a', narrador: 'limitado', tiempo: 'presente', nota: 'El presente limitado captura cada interacción con una precisión casi dolorosa' },
  { autor: 'Italo Calvino', obra: 'Si una noche de invierno un viajero', persona: '2a', narrador: 'participante', tiempo: 'presente', nota: 'El "tú" eres el lector; la novela reflexiona sobre el acto mismo de leer' },
];

export default function ConfiguradorNarrativoPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [narrador, setNarrador] = useState<TipoNarrador | null>(null);
  const [tiempo, setTiempo] = useState<TiempoVerbal | null>(null);

  const narradorOpciones = useMemo(() => {
    if (!persona) return [];
    return NARRADOR_OPCIONES[persona];
  }, [persona]);

  const combinacion = useMemo(() => {
    if (!persona || !narrador || !tiempo) return null;
    const id = `${persona}-${narrador}-${tiempo}`;
    return COMBINACIONES.find(c => c.id === id) ?? null;
  }, [persona, narrador, tiempo]);

  function seleccionarPersona(p: Persona) {
    setPersona(p);
    setNarrador(null);
    setTiempo(null);
    if (p === '2a') setNarrador('participante');
  }

  const colorPersona = persona ? PERSONA_CONFIG[persona].color : 'var(--primary)';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Configurador Narrativo</h1>
        <p className={styles.heroSubtitle}>
          Elige persona, narrador y tiempo verbal — descubre qué efecto produce en el lector y qué autores lo usan
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Paso 1: Persona ── */}
        <div className={styles.pasoBox}>
          <div className={styles.pasoHeader}>
            <span className={styles.pasoNum} style={persona ? { background: colorPersona } : {}}>1</span>
            <h2 className={styles.pasoTitulo}>Persona narrativa</h2>
          </div>
          <div className={styles.personaGrid}>
            {(Object.entries(PERSONA_CONFIG) as [Persona, typeof PERSONA_CONFIG['1a']][]).map(([id, cfg]) => (
              <button
                key={id}
                type="button"
                className={`${styles.personaBtn} ${persona === id ? styles.personaBtnActivo : ''}`}
                onClick={() => seleccionarPersona(id)}
                aria-pressed={persona === id}
                style={persona === id ? { background: cfg.color, borderColor: cfg.color } : { borderColor: cfg.color + '55' }}
              >
                <span className={styles.personaLabel}>{cfg.label}</span>
                <span className={styles.personaPronombre} style={{ color: persona === id ? 'rgba(255,255,255,0.85)' : cfg.color }}>«{cfg.pronombre}»</span>
                <span className={styles.personaDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Paso 2: Narrador ── */}
        {persona && persona !== '2a' && (
          <div className={styles.pasoBox}>
            <div className={styles.pasoHeader}>
              <span className={styles.pasoNum} style={narrador ? { background: colorPersona } : {}}>2</span>
              <h2 className={styles.pasoTitulo}>Tipo de narrador</h2>
            </div>
            <div className={styles.narradorGrid}>
              {narradorOpciones.map(op => (
                <button
                  key={op.id}
                  type="button"
                  className={`${styles.narradorBtn} ${narrador === op.id ? styles.narradorBtnActivo : ''}`}
                  onClick={() => { setNarrador(op.id); setTiempo(null); }}
                  aria-pressed={narrador === op.id}
                  style={narrador === op.id ? { borderColor: colorPersona, background: colorPersona + '15' } : {}}
                >
                  <span className={styles.narradorEmoji} aria-hidden="true">{op.emoji}</span>
                  <span className={styles.narradorNombre} style={narrador === op.id ? { color: colorPersona } : {}}>{op.nombre}</span>
                  <span className={styles.narradorDesc}>{op.descripcion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {persona === '2a' && (
          <div className={styles.pasoBox}>
            <div className={styles.pasoHeader}>
              <span className={styles.pasoNum} style={{ background: colorPersona }}>2</span>
              <h2 className={styles.pasoTitulo}>Tipo de narrador</h2>
            </div>
            <div className={styles.infoBox} style={{ borderColor: colorPersona }}>
              <span className={styles.infoEmoji} aria-hidden="true">🫵</span>
              <p>En la 2ª persona solo existe un tipo de narrador: el <strong>participante</strong>, donde el "tú" convierte al lector en el protagonista. No hay otras opciones válidas.</p>
            </div>
          </div>
        )}

        {/* ── Paso 3: Tiempo ── */}
        {narrador && (
          <div className={styles.pasoBox}>
            <div className={styles.pasoHeader}>
              <span className={styles.pasoNum} style={tiempo ? { background: colorPersona } : {}}>3</span>
              <h2 className={styles.pasoTitulo}>Tiempo verbal</h2>
            </div>
            <div className={styles.tiempoGrid}>
              <button
                type="button"
                className={`${styles.tiempoBtn} ${tiempo === 'pasado' ? styles.tiempoBtnActivo : ''}`}
                onClick={() => setTiempo('pasado')}
                aria-pressed={tiempo === 'pasado'}
                style={tiempo === 'pasado' ? { borderColor: colorPersona, background: colorPersona + '15' } : {}}
              >
                <span className={styles.tiempoLabel} style={tiempo === 'pasado' ? { color: colorPersona } : {}}>Pasado</span>
                <span className={styles.tiempoEjemplo}>«Ella entró en la habitación»</span>
                <span className={styles.tiempoDesc}>La forma más habitual. Distancia temporal que permite perspectiva y reflexión.</span>
              </button>
              <button
                type="button"
                className={`${styles.tiempoBtn} ${tiempo === 'presente' ? styles.tiempoBtnActivo : ''}`}
                onClick={() => setTiempo('presente')}
                aria-pressed={tiempo === 'presente'}
                style={tiempo === 'presente' ? { borderColor: colorPersona, background: colorPersona + '15' } : {}}
              >
                <span className={styles.tiempoLabel} style={tiempo === 'presente' ? { color: colorPersona } : {}}>Presente</span>
                <span className={styles.tiempoEjemplo}>«Ella entra en la habitación»</span>
                <span className={styles.tiempoDesc}>Inmediatez y urgencia. El narrador no sabe más que el lector sobre el futuro.</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Resultado ── */}
        {combinacion && (
          <div className={styles.resultadoBox} style={{ borderColor: colorPersona }} role="status" aria-live="polite" aria-atomic="true">
            <div className={styles.resultadoHeader} style={{ background: colorPersona }}>
              <div className={styles.resultadoTitulo}>
                <h2 className={styles.resultadoNombre}>{combinacion.nombre}</h2>
                <div className={styles.resultadoBadges}>
                  <span className={styles.badge}>{PERSONA_CONFIG[combinacion.persona].label}</span>
                  <span className={styles.badge}>{narradorOpciones.find(n => n.id === combinacion.narrador)?.nombre ?? NARRADOR_OPCIONES['2a'][0].nombre}</span>
                  <span className={styles.badge}>{combinacion.tiempo === 'pasado' ? 'Pasado' : 'Presente'}</span>
                  <span className={styles.badgeFrecuencia} style={{ background: FRECUENCIA_CONFIG[combinacion.frecuencia].color }}>
                    {FRECUENCIA_CONFIG[combinacion.frecuencia].label}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.resultadoBody}>
              <p className={styles.resultadoDescripcion}>{combinacion.descripcion}</p>

              <div className={styles.resultadoDual}>
                <div className={styles.resultadoBloque}>
                  <h3 className={styles.resultadoBloqueTitle}>Efecto en el lector</h3>
                  <p className={styles.resultadoTexto}>{combinacion.efectoLector}</p>
                </div>
                <div className={styles.resultadoBloque}>
                  <div className={styles.fortalezaDebilidad}>
                    <div className={styles.fortaleza}>
                      <span className={styles.fortalezaLabel}>✅ Fortaleza principal</span>
                      <p>{combinacion.fortaleza}</p>
                    </div>
                    <div className={styles.debilidad}>
                      <span className={styles.debilidadLabel}>⚠️ Debilidad principal</span>
                      <p>{combinacion.debilidad}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.resultadoDual}>
                <div className={styles.resultadoBloque}>
                  <h3 className={styles.resultadoBloqueTitle}><span aria-hidden="true">✅</span> Cuándo usarla</h3>
                  <ul className={styles.listaCheck}>
                    {combinacion.cuandoUsar.map((item, i) => (
                      <li key={i} style={{ borderLeftColor: colorPersona }}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.resultadoBloque}>
                  <h3 className={styles.resultadoBloqueTitle}><span aria-hidden="true">❌</span> Cuándo evitarla</h3>
                  <ul className={styles.listaEvitar}>
                    {combinacion.cuandoEvitar.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.ejemplosSeccion}>
                <h3 className={styles.resultadoBloqueTitle}>Novelas que la usan</h3>
                <div className={styles.ejemplosGrid}>
                  {combinacion.ejemplos.map((ej, i) => (
                    <div key={i} className={styles.ejemploCard} style={{ borderTopColor: colorPersona }}>
                      <span className={styles.ejemploTitulo}>{ej.titulo}</span>
                      <span className={styles.ejemploAutor}>{ej.autor}</span>
                      <span className={styles.ejemploNota}>{ej.nota}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabla de referencia de autores ── */}
        <section className={styles.autoresSection}>
          <h2 className={styles.autoresTitulo}>Grandes autores y su elección narrativa</h2>
          <p className={styles.autoresSubtitulo}>Haz clic en cualquier fila para cargar esa configuración en el configurador</p>
          <div className={styles.tableWrapper}>
            <table className={styles.autoresTable}>
              <thead>
                <tr>
                  <th>Autor</th>
                  <th>Obra</th>
                  <th>Persona</th>
                  <th>Narrador</th>
                  <th>Tiempo</th>
                  <th>Por qué funciona</th>
                </tr>
              </thead>
              <tbody>
                {AUTORES_REFERENCIA.map((a, i) => (
                  <tr
                    key={i}
                    className={styles.autoresTableRow}
                    onClick={() => {
                      seleccionarPersona(a.persona);
                      setNarrador(a.narrador);
                      setTiempo(a.tiempo);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <td className={styles.tdAutor}>{a.autor}</td>
                    <td className={styles.tdObra}><em>{a.obra}</em></td>
                    <td><span className={styles.tdBadge} style={{ background: PERSONA_CONFIG[a.persona].color }}>{PERSONA_CONFIG[a.persona].label}</span></td>
                    <td className={styles.tdNarrador}>{a.narrador}</td>
                    <td className={styles.tdTiempo}>{a.tiempo}</td>
                    <td className={styles.tdNota}>{a.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CTA orientador ── */}
        <div className={styles.ctaBox}>
          <div className={styles.ctaTexto}>
            <h2 className={styles.ctaTitulo}>¿Aún eligiendo tu género?</h2>
            <p className={styles.ctaDesc}>El orientador de escritura creativa te ayuda a elegir género, perspectiva y estructura paso a paso</p>
          </div>
          <a href="/orientador-escritura-creativa/" className={styles.ctaBtn}>Ver orientador →</a>
        </div>

        {/* ── Educational Section ── */}
        <EducationalSection
          title="Sobre la técnica narrativa"
          subtitle="Cómo funcionan las combinaciones de persona, narrador y tiempo, y por qué importan"
        >
          <div className={styles.guideSection}>

            <h3>Las tres dimensiones de la voz narrativa</h3>
            <p>Toda novela toma tres decisiones técnicas fundamentales: quién habla (persona narrativa), qué sabe (tipo de narrador) y cuándo habla respecto a los hechos (tiempo verbal). Estas tres dimensiones se combinan para crear la voz de la novela, y cada combinación produce efectos distintos y precisos en el lector. No hay combinaciones "correctas" ni "incorrectas", solo combinaciones más o menos adecuadas para cada historia.</p>

            {/* Tabla comparativa */}
            <h3>Las 14 combinaciones válidas de un vistazo</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Persona</th>
                    <th>Narrador</th>
                    <th>Tiempo</th>
                    <th>Frecuencia</th>
                    <th>Efecto clave</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1ª</td><td>Protagonista</td><td>Pasado</td><td style={{ color: '#27AE60', fontWeight: 700 }}>Muy común</td><td>Intimidad + perspectiva retrospectiva</td></tr>
                  <tr><td>1ª</td><td>Protagonista</td><td>Presente</td><td style={{ color: '#2E86AB', fontWeight: 700 }}>Común</td><td>Intimidad + urgencia radical</td></tr>
                  <tr><td>1ª</td><td>Testigo</td><td>Pasado</td><td style={{ color: '#8E44AD', fontWeight: 700 }}>Clásico</td><td>Misterio del protagonista observado</td></tr>
                  <tr><td>1ª</td><td>Testigo</td><td>Presente</td><td style={{ color: '#E67E22', fontWeight: 700 }}>Poco frecuente</td><td>Misterio + urgencia doble</td></tr>
                  <tr><td>1ª</td><td>No fiable</td><td>Pasado</td><td style={{ color: '#2E86AB', fontWeight: 700 }}>Común</td><td>El lector interroga cada afirmación</td></tr>
                  <tr><td>1ª</td><td>No fiable</td><td>Presente</td><td style={{ color: '#E74C3C', fontWeight: 700 }}>Experimental</td><td>Estados mentales alterados en tiempo real</td></tr>
                  <tr><td>3ª</td><td>Omnisciente</td><td>Pasado</td><td style={{ color: '#8E44AD', fontWeight: 700 }}>Clásico</td><td>Visión total, ironía dramática ilimitada</td></tr>
                  <tr><td>3ª</td><td>Omnisciente</td><td>Presente</td><td style={{ color: '#E74C3C', fontWeight: 700 }}>Experimental</td><td>Efecto de mito o fábula performativa</td></tr>
                  <tr><td>3ª</td><td>Limitado</td><td>Pasado</td><td style={{ color: '#27AE60', fontWeight: 700 }}>Muy común</td><td>Intimidad + flexibilidad narrativa</td></tr>
                  <tr><td>3ª</td><td>Limitado</td><td>Presente</td><td style={{ color: '#2E86AB', fontWeight: 700 }}>Común</td><td>Inmersión sensorial máxima</td></tr>
                  <tr><td>3ª</td><td>Objetivo</td><td>Pasado</td><td style={{ color: '#8E44AD', fontWeight: 700 }}>Clásico</td><td>El lector como intérprete, subtexto central</td></tr>
                  <tr><td>3ª</td><td>Objetivo</td><td>Presente</td><td style={{ color: '#E74C3C', fontWeight: 700 }}>Experimental</td><td>Frialdad + urgencia, superficie pura</td></tr>
                  <tr><td>2ª</td><td>Participante</td><td>Presente</td><td style={{ color: '#E74C3C', fontWeight: 700 }}>Experimental</td><td>El lector como protagonista en tiempo real</td></tr>
                  <tr><td>2ª</td><td>Participante</td><td>Pasado</td><td style={{ color: '#E67E22', fontWeight: 700 }}>Poco frecuente</td><td>Reproche, confesión o disociación del yo</td></tr>
                </tbody>
              </table>
            </div>

            {/* Casos de uso */}
            <h3>Perfiles de escritor y combinaciones recomendadas</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">🔍</span>
                  <h4>Escritor de thriller</h4>
                </div>
                <p>Las combinaciones más eficaces son 1ª + No fiable + Pasado (giro basado en el engaño del narrador) y 3ª + Limitado + Pasado o Presente (el lector descubre con el protagonista). Evita el omnisciente: destruye el misterio.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">🐉</span>
                  <h4>Escritor de fantasía épica</h4>
                </div>
                <p>El 3ª + Omnisciente + Pasado permite el worldbuilding coral y los arcos múltiples. El 3ª + Limitado + Pasado da intimidad a personajes concretos. Muchas novelas épicas alternan entre ambos según la escena.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">💕</span>
                  <h4>Escritor de ficción literaria</h4>
                </div>
                <p>El 3ª + Limitado (pasado o presente) es el estándar de la ficción literaria contemporánea. El 1ª + Protagonista + Pasado funciona cuando la voz del narrador es tan específica que se convierte en el tema de la novela.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">🧪</span>
                  <h4>Escritor experimental</h4>
                </div>
                <p>Las combinaciones con presente (3ª + Objetivo + Presente, 1ª + No fiable + Presente, 2ª + Participante + Presente) son las más inusuales y pueden producir efectos únicos si se dominan con precisión.</p>
              </div>
            </div>

            {/* FAQ */}
            <h3>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Se puede cambiar de combinación dentro de una misma novela?</h4>
                <p>Sí, aunque requiere habilidad. Muchas novelas alternan el punto de vista entre personajes (manteniendo el mismo tiempo) o mezclan tiempos (presente para el ahora, pasado para la memoria). El riesgo es la incoherencia; la ventaja es la flexibilidad expresiva. Perdida de Flynn alterna 1ª + Protagonista (Nick) con 1ª + No fiable (Amy en el diario).</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cuál es la combinación más usada en la ficción contemporánea?</h4>
                <p>3ª persona + Limitado + Pasado es con diferencia la más frecuente. Ofrece el mejor equilibrio entre intimidad psicológica y control narrativo. En la ficción literaria más reciente, 3ª + Limitado + Presente está ganando terreno (Rooney, Yanagihara, Oyeyemi).</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿El estilo indirecto libre es una combinación narrativa?</h4>
                <p>El estilo indirecto libre no es una combinación de persona/narrador/tiempo sino una técnica que se aplica sobre combinaciones existentes, principalmente en 3ª + Limitado. Consiste en reproducir los pensamientos del personaje sin marcas de atribución ("Era tarde. ¿Por qué no habría llegado todavía?"). Flaubert lo inventó; es la técnica dominante en la ficción literaria moderna.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Tiene sentido elegir la combinación antes de escribir?</h4>
                <p>No necesariamente. Muchos escritores descubren la voz narrativa mientras escriben el primer borrador y solo entonces la fijan. Lo importante es identificar la combinación que estás usando para poder ser consecuente con ella. Este configurador es útil tanto para decidir antes como para analizar lo que ya estás haciendo.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Por qué el narrador omnisciente perdió popularidad en el siglo XX?</h4>
                <p>La epistemología del siglo XX cuestionó la posibilidad de un punto de vista "total" y objetivo. El modernismo (Woolf, Joyce, Faulkner) impuso la subjetividad como única perspectiva auténtica. El omnisciente se asoció con la novela victoriana y con una autoridad moral que el siglo XX rechazó. Hoy vuelve en el fantástico y el realismo mágico, donde su omnisciencia tiene una justificación estética diferente.</p>
              </div>
            </div>

            {/* Guía paso a paso */}
            <h3>Cómo elegir tu combinación narrativa</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Pregúntate: ¿quién tiene la voz más interesante?</h4>
                  <p>Si tu protagonista tiene una voz única e inconfundible, la 1ª persona te ayudará a expresarla. Si el protagonista es más interesante visto desde fuera, la 3ª persona te da esa distancia.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Decide cuánto quieres que el lector sepa</h4>
                  <p>El omnisciente puede contarlo todo; el limitado o el testigo crean misterio al limitar el acceso. Si el suspense depende de la ignorancia del lector, evita el omnisciente.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Elige el tiempo según la relación con los hechos</h4>
                  <p>¿Quieres que el narrador haya procesado los hechos (pasado) o que los viva en tiempo real (presente)? El pasado permite ironía y perspectiva; el presente, urgencia e inmediatez.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Escribe dos o tres páginas con distintas combinaciones</h4>
                  <p>La prueba definitiva es práctica: escribe la misma escena en 1ª pasado, 3ª limitado presente y 3ª omnisciente pasado. La combinación que más se parece a lo que imaginas es la tuya.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Lee novelas que usen esa combinación</h4>
                  <p>Una vez elegida, lee con atención técnica novelas que usen la misma configuración. Analiza cómo gestionan los saltos temporales, el acceso a la mente de los personajes y los momentos de máxima intimidad o distancia.</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <h3>Claves para dominar la voz narrativa</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🎯</span>
                <h4>Sé coherente</h4>
                <p>El mayor error es mezclar combinaciones sin conciencia. Si estás en 3ª limitada, no accedas de pronto a la mente de otro personaje sin justificarlo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🔭</span>
                <h4>Controla la distancia</h4>
                <p>Dentro de una misma combinación puedes acercarte o alejarte del personaje. El estilo indirecto libre es la herramienta para acercarse al máximo en 3ª limitada.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">📖</span>
                <h4>Lee en voz alta</h4>
                <p>Los problemas de voz narrativa se detectan mejor al oído que a la vista. Si algo suena raro o incoherente, probablemente hay un cambio no intencional de persona o modo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">✏️</span>
                <h4>Anota las excepciones</h4>
                <p>Si cambias de combinación en algún pasaje (flashback en pasado dentro de una novela en presente), anótalo como decisión consciente con su justificación.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🧩</span>
                <h4>Adapta la combinación al género</h4>
                <p>El thriller tiene sus convenciones narrativas, la fantasía las suyas. Romperlas puede ser genial, pero primero asegúrate de que lo haces con conciencia, no por error.</p>
              </div>
            </div>

            {/* Warning box */}
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
                <h4>Errores frecuentes en la voz narrativa</h4>
              </div>
              <ul className={styles.warningList}>
                <li>Cambiar de persona narrativa dentro de un mismo capítulo sin señal clara: el lector se desorienta y pierde la confianza en el narrador.</li>
                <li>Usar el omnisciente en una escena y el limitado en la siguiente sin transición: produce una incoherencia de punto de vista muy visible.</li>
                <li>El narrador en 1ª que sabe cosas que no podría saber (narrador omnisciente disfrazado de yo).</li>
                <li>Confundir narrador no fiable con narrador ignorante: el no fiable sabe la verdad y la oculta o distorsiona; el ignorante simplemente no tiene información.</li>
                <li>Usar el presente en toda la novela y cambiar al pasado en un flashback sin marcar la transición: el lector puede perder el hilo temporal.</li>
                <li>El narrador testigo que de pronto accede a la mente del protagonista que observa: rompe el pacto narrativo establecido.</li>
              </ul>
            </div>

          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('configurador-narrativo')} />
        <ShareCard appName="configurador-narrativo" />
      </main>

      <Footer appName="configurador-narrativo" />
    </div>
  );
}
