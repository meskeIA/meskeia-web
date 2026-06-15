'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './FalsosAmigosIngles.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Categoria = 'cotidiano' | 'emociones' | 'profesional' | 'acciones' | 'identicos';
type Nivel = 'basico' | 'medio' | 'avanzado';
type Tab = 'catalogo' | 'practica';
type FasePractica = 'inicio' | 'jugando' | 'revelado' | 'fin';

interface FalsoAmigo {
  id: number;
  ingles: string;
  significadoIngles: string;
  espanol: string;
  significadoEspanol: string;
  ejemplo: string;
  categoria: Categoria;
  nivel: Nivel;
}

const FALSOS_AMIGOS: FalsoAmigo[] = [
  // ── BÁSICO ──────────────────────────────────────────────────────────────
  { id: 1,  ingles: 'embarrassed',    significadoIngles: 'avergonzado/a',         espanol: 'embarazada',    significadoEspanol: 'pregnant',                    ejemplo: '"I was so embarrassed." → Estaba muy avergonzado.',              categoria: 'emociones',   nivel: 'basico' },
  { id: 2,  ingles: 'actually',       significadoIngles: 'en realidad / de hecho', espanol: 'actualmente',   significadoEspanol: 'currently / nowadays',         ejemplo: '"Actually, I disagree." → En realidad, no estoy de acuerdo.',   categoria: 'cotidiano',   nivel: 'basico' },
  { id: 3,  ingles: 'library',        significadoIngles: 'biblioteca',             espanol: 'librería',      significadoEspanol: 'bookstore',                    ejemplo: '"I borrowed it from the library." → Lo saqué de la biblioteca.', categoria: 'cotidiano',   nivel: 'basico' },
  { id: 4,  ingles: 'carpet',         significadoIngles: 'alfombra',               espanol: 'carpeta',       significadoEspanol: 'folder / binder',              ejemplo: '"The carpet is dirty." → La alfombra está sucia.',               categoria: 'cotidiano',   nivel: 'basico' },
  { id: 5,  ingles: 'constipated',    significadoIngles: 'estreñido/a',            espanol: 'constipado',    significadoEspanol: 'having a cold',                ejemplo: '"I\'m constipated." → Estoy estreñido.',                         categoria: 'cotidiano',   nivel: 'basico' },
  { id: 6,  ingles: 'soap',           significadoIngles: 'jabón',                  espanol: 'sopa',          significadoEspanol: 'soup',                         ejemplo: '"Wash your hands with soap." → Lávate las manos con jabón.',     categoria: 'cotidiano',   nivel: 'basico' },
  { id: 7,  ingles: 'large',          significadoIngles: 'grande',                 espanol: 'largo',         significadoEspanol: 'long',                         ejemplo: '"A large house." → Una casa grande.',                            categoria: 'cotidiano',   nivel: 'basico' },
  { id: 8,  ingles: 'exit',           significadoIngles: 'salida',                 espanol: 'éxito',         significadoEspanol: 'success',                      ejemplo: '"Where is the exit?" → ¿Dónde está la salida?',                  categoria: 'cotidiano',   nivel: 'basico' },
  { id: 9,  ingles: 'sensible',       significadoIngles: 'razonable / sensato',    espanol: 'sensible',      significadoEspanol: 'sensitive',                    ejemplo: '"That\'s a sensible choice." → Es una elección razonable.',      categoria: 'emociones',   nivel: 'basico' },
  { id: 10, ingles: 'record',         significadoIngles: 'grabar / registrar',     espanol: 'recordar',      significadoEspanol: 'to remember',                  ejemplo: '"Record the meeting." → Graba la reunión.',                      categoria: 'acciones',    nivel: 'basico' },
  { id: 11, ingles: 'realize',        significadoIngles: 'darse cuenta de',        espanol: 'realizar',      significadoEspanol: 'to carry out / accomplish',    ejemplo: '"I didn\'t realize." → No me di cuenta.',                        categoria: 'acciones',    nivel: 'basico' },
  { id: 12, ingles: 'attend',         significadoIngles: 'asistir a / ir a',       espanol: 'atender',       significadoEspanol: 'to serve / to care for',       ejemplo: '"Did you attend the class?" → ¿Asististe a la clase?',           categoria: 'acciones',    nivel: 'basico' },
  { id: 13, ingles: 'assist',         significadoIngles: 'ayudar',                 espanol: 'asistir',       significadoEspanol: 'to attend / go to',            ejemplo: '"Can you assist me?" → ¿Puedes ayudarme?',                       categoria: 'acciones',    nivel: 'basico' },
  { id: 14, ingles: 'success',        significadoIngles: 'éxito',                  espanol: 'suceso',        significadoEspanol: 'event / incident',             ejemplo: '"The show was a great success." → El espectáculo fue un gran éxito.', categoria: 'cotidiano', nivel: 'basico' },
  { id: 15, ingles: 'deception',      significadoIngles: 'engaño / trampa',        espanol: 'decepción',     significadoEspanol: 'disappointment',               ejemplo: '"It was a deception." → Fue un engaño.',                         categoria: 'emociones',   nivel: 'basico' },
  { id: 16, ingles: 'terrific',       significadoIngles: 'estupendo / fantástico', espanol: 'terrorífico',   significadoEspanol: 'terrifying',                   ejemplo: '"That\'s a terrific idea!" → ¡Es una idea estupenda!',           categoria: 'emociones',   nivel: 'basico' },
  { id: 17, ingles: 'fabric',         significadoIngles: 'tela / tejido',          espanol: 'fábrica',       significadoEspanol: 'factory',                      ejemplo: '"I need more fabric." → Necesito más tela.',                     categoria: 'cotidiano',   nivel: 'basico' },
  { id: 18, ingles: 'college',        significadoIngles: 'universidad / facultad', espanol: 'colegio',       significadoEspanol: 'school (primary/secondary)',   ejemplo: '"She\'s in college." → Está en la universidad.',                 categoria: 'profesional', nivel: 'basico' },
  { id: 19, ingles: 'lecture',        significadoIngles: 'conferencia / clase',    espanol: 'lectura',       significadoEspanol: 'reading',                      ejemplo: '"The lecture starts at 9." → La clase empieza a las 9.',         categoria: 'profesional', nivel: 'basico' },
  { id: 20, ingles: 'resume',         significadoIngles: 'reanudar / retomar',     espanol: 'resumir',       significadoEspanol: 'to summarize',                 ejemplo: '"Let\'s resume tomorrow." → Reanudemos mañana.',                 categoria: 'acciones',    nivel: 'basico' },
  // ── MEDIO ───────────────────────────────────────────────────────────────
  { id: 21, ingles: 'argument',       significadoIngles: 'discusión / debate',     espanol: 'argumento',     significadoEspanol: 'plot / reasoning / argument',  ejemplo: '"They had an argument." → Tuvieron una discusión.',              categoria: 'cotidiano',   nivel: 'medio' },
  { id: 22, ingles: 'notice',         significadoIngles: 'darse cuenta de',        espanol: 'noticia',       significadoEspanol: 'news item',                    ejemplo: '"Did you notice the sign?" → ¿Te fijaste en el letrero?',        categoria: 'acciones',    nivel: 'medio' },
  { id: 23, ingles: 'introduce',      significadoIngles: 'presentar a alguien',    espanol: 'introducir',    significadoEspanol: 'to insert / to put in',        ejemplo: '"Let me introduce you." → Déjame presentarte.',                  categoria: 'acciones',    nivel: 'medio' },
  { id: 24, ingles: 'pretend',        significadoIngles: 'fingir / hacer como si', espanol: 'pretender',     significadoEspanol: 'to aim to / to intend',        ejemplo: '"She pretended not to hear." → Fingió no escuchar.',             categoria: 'acciones',    nivel: 'medio' },
  { id: 25, ingles: 'conductor',      significadoIngles: 'director (orquesta)',    espanol: 'conductor',     significadoEspanol: 'driver',                       ejemplo: '"The conductor raised his baton." → El director levantó la batuta.', categoria: 'profesional', nivel: 'medio' },
  { id: 26, ingles: 'mayor',          significadoIngles: 'alcalde/sa',             espanol: 'mayor',         significadoEspanol: 'bigger / older',               ejemplo: '"The mayor opened the event." → El alcalde inauguró el acto.',    categoria: 'profesional', nivel: 'medio' },
  { id: 27, ingles: 'collar',         significadoIngles: 'cuello (de ropa)',        espanol: 'collar',        significadoEspanol: 'necklace',                     ejemplo: '"Unbutton your collar." → Desabróchate el cuello.',               categoria: 'cotidiano',   nivel: 'medio' },
  { id: 28, ingles: 'eventually',     significadoIngles: 'finalmente / al final',  espanol: 'eventualmente', significadoEspanol: 'possibly / occasionally',      ejemplo: '"He eventually agreed." → Al final aceptó.',                     categoria: 'cotidiano',   nivel: 'medio' },
  { id: 29, ingles: 'eventual',       significadoIngles: 'definitivo / final',     espanol: 'eventual',      significadoEspanol: 'temporary / occasional',       ejemplo: '"The eventual winner." → El ganador final.',                     categoria: 'cotidiano',   nivel: 'medio' },
  { id: 30, ingles: 'actual',         significadoIngles: 'real / verdadero',       espanol: 'actual',        significadoEspanol: 'current / present-day',        ejemplo: '"The actual cost is higher." → El coste real es mayor.',          categoria: 'cotidiano',   nivel: 'medio' },
  { id: 31, ingles: 'educated',       significadoIngles: 'culto / instruido',      espanol: 'educado',       significadoEspanol: 'polite / well-mannered',       ejemplo: '"She\'s very educated." → Es muy instruida.',                    categoria: 'emociones',   nivel: 'medio' },
  { id: 32, ingles: 'disgrace',       significadoIngles: 'deshonra / vergüenza',   espanol: 'desgracia',     significadoEspanol: 'misfortune / tragedy',         ejemplo: '"It\'s a disgrace." → Es una deshonra.',                         categoria: 'emociones',   nivel: 'medio' },
  { id: 33, ingles: 'rude',           significadoIngles: 'grosero / maleducado',   espanol: 'rudo',          significadoEspanol: 'rough / harsh',                ejemplo: '"That was rude." → Eso fue una grosería.',                       categoria: 'emociones',   nivel: 'medio' },
  { id: 34, ingles: 'comprehensive',  significadoIngles: 'exhaustivo / completo',  espanol: 'comprensivo',   significadoEspanol: 'understanding / tolerant',     ejemplo: '"A comprehensive report." → Un informe exhaustivo.',             categoria: 'profesional', nivel: 'medio' },
  { id: 35, ingles: 'sympathetic',    significadoIngles: 'compasivo / comprensivo',espanol: 'simpático',     significadoEspanol: 'friendly / likable',           ejemplo: '"She was sympathetic about my loss." → Fue comprensiva con mi pérdida.', categoria: 'emociones', nivel: 'medio' },
  { id: 36, ingles: 'molest',         significadoIngles: 'acosar (sexualmente)',   espanol: 'molestar',      significadoEspanol: 'to bother / annoy',            ejemplo: 'Cuidado: "molest" implica acoso sexual, no simple molestia.',    categoria: 'acciones',    nivel: 'medio' },
  { id: 37, ingles: 'contest',        significadoIngles: 'concurso / competición', espanol: 'contestar',     significadoEspanol: 'to answer / reply',            ejemplo: '"Enter the contest." → Participa en el concurso.',               categoria: 'cotidiano',   nivel: 'medio' },
  { id: 38, ingles: 'topic',          significadoIngles: 'tema / asunto',          espanol: 'tópico',        significadoEspanol: 'cliché / commonplace',         ejemplo: '"Let\'s change the topic." → Cambiemos de tema.',                categoria: 'cotidiano',   nivel: 'medio' },
  { id: 39, ingles: 'support',        significadoIngles: 'apoyar',                 espanol: 'soportar',      significadoEspanol: 'to tolerate / put up with',    ejemplo: '"I support your decision." → Apoyo tu decisión.',                categoria: 'acciones',    nivel: 'medio' },
  { id: 40, ingles: 'reunion',        significadoIngles: 'reencuentro',            espanol: 'reunión',       significadoEspanol: 'meeting / gathering',          ejemplo: '"A family reunion." → Un reencuentro familiar.',                 categoria: 'cotidiano',   nivel: 'medio' },
  { id: 41, ingles: 'brave',          significadoIngles: 'valiente',               espanol: 'bravo',         significadoEspanol: 'fierce / also: bravo!',        ejemplo: '"She was brave." → Fue valiente.',                               categoria: 'emociones',   nivel: 'medio' },
  { id: 42, ingles: 'sane',           significadoIngles: 'cuerdo (mentalmente)',   espanol: 'sano',          significadoEspanol: 'healthy (physically)',          ejemplo: '"Is he sane?" → ¿Está en su sano juicio?',                       categoria: 'cotidiano',   nivel: 'medio' },
  { id: 43, ingles: 'convenient',     significadoIngles: 'práctico / cómodo',      espanol: 'conveniente',   significadoEspanol: 'advisable / appropriate',      ejemplo: '"Is tomorrow convenient?" → ¿Te viene bien mañana?',             categoria: 'cotidiano',   nivel: 'medio' },
  { id: 44, ingles: 'consistent',     significadoIngles: 'coherente / constante',  espanol: 'consistente',   significadoEspanol: 'thick / substantial',          ejemplo: '"Be consistent in your work." → Sé constante en tu trabajo.',    categoria: 'profesional', nivel: 'medio' },
  { id: 45, ingles: 'diversion',      significadoIngles: 'desvío / distracción',   espanol: 'diversión',     significadoEspanol: 'fun / entertainment',          ejemplo: '"Road diversion ahead." → Desvío de tráfico más adelante.',      categoria: 'cotidiano',   nivel: 'medio' },
  { id: 46, ingles: 'policy',         significadoIngles: 'norma / política (empresa)',espanol: 'policía',     significadoEspanol: 'police (corps)',               ejemplo: '"Company policy." → Política de empresa.',                       categoria: 'profesional', nivel: 'medio' },
  { id: 47, ingles: 'compromise',     significadoIngles: 'acuerdo / pacto',        espanol: 'comprometer',   significadoEspanol: 'to commit / to put at risk',   ejemplo: '"Let\'s reach a compromise." → Lleguemos a un acuerdo.',         categoria: 'acciones',    nivel: 'medio' },
  { id: 48, ingles: 'embarrassment',  significadoIngles: 'vergüenza / bochorno',   espanol: 'embarazo',      significadoEspanol: 'pregnancy',                    ejemplo: '"What an embarrassment!" → ¡Qué vergüenza!',                     categoria: 'emociones',   nivel: 'medio' },
  { id: 49, ingles: 'grade',          significadoIngles: 'calificación / nota',    espanol: 'grado',         significadoEspanol: 'degree / rank',                ejemplo: '"What grade did you get?" → ¿Qué nota sacaste?',                 categoria: 'profesional', nivel: 'medio' },
  { id: 50, ingles: 'once',           significadoIngles: 'una vez',                espanol: 'once',          significadoEspanol: 'eleven',                       ejemplo: '"Once upon a time." → Érase una vez.',                           categoria: 'identicos',   nivel: 'medio' },
  // ── AVANZADO ────────────────────────────────────────────────────────────
  { id: 51, ingles: 'confident',      significadoIngles: 'seguro de sí mismo',     espanol: 'confidente',    significadoEspanol: 'informant / spy / confidant',  ejemplo: '"She felt confident." → Se sentía segura de sí misma.',          categoria: 'emociones',   nivel: 'avanzado' },
  { id: 52, ingles: 'ingenious',      significadoIngles: 'ingenioso / inteligente',espanol: 'ingenuo',       significadoEspanol: 'naive / gullible',             ejemplo: '"An ingenious solution." → Una solución ingeniosa.',             categoria: 'emociones',   nivel: 'avanzado' },
  { id: 53, ingles: 'casual',         significadoIngles: 'informal / desenfadado', espanol: 'casual',        significadoEspanol: 'coincidental / by chance',     ejemplo: '"Casual dress code." → Código de vestimenta informal.',           categoria: 'cotidiano',   nivel: 'avanzado' },
  { id: 54, ingles: 'complexion',     significadoIngles: 'tez / cutis',            espanol: 'complexión',    significadoEspanol: 'physical build / constitution', ejemplo: '"She has a fair complexion." → Tiene la tez clara.',              categoria: 'cotidiano',   nivel: 'avanzado' },
  { id: 55, ingles: 'vulgar',         significadoIngles: 'grosero / ordinario',    espanol: 'vulgar',        significadoEspanol: 'common / ordinary / popular',  ejemplo: '"That joke is vulgar." → Ese chiste es grosero.',                categoria: 'emociones',   nivel: 'avanzado' },
  { id: 56, ingles: 'bizarre',        significadoIngles: 'extraño / raro',         espanol: 'bizarro',       significadoEspanol: 'brave / gallant (literary)',   ejemplo: '"What a bizarre situation!" → ¡Qué situación tan extraña!',       categoria: 'cotidiano',   nivel: 'avanzado' },
  { id: 57, ingles: 'proper',         significadoIngles: 'apropiado / correcto',   espanol: 'propio',        significadoEspanol: 'own / belonging to oneself',   ejemplo: '"Proper behavior." → Comportamiento apropiado.',                 categoria: 'cotidiano',   nivel: 'avanzado' },
  { id: 58, ingles: 'miserable',      significadoIngles: 'muy infeliz / desdichado',espanol: 'miserable',    significadoEspanol: 'contemptible / wretched person',ejemplo: '"I feel miserable." → Me siento muy mal.',                       categoria: 'emociones',   nivel: 'avanzado' },
  { id: 59, ingles: 'commodity',      significadoIngles: 'materia prima / recurso básico',espanol: 'comodidad',significadoEspanol: 'comfort / convenience',      ejemplo: '"Oil is a key commodity." → El petróleo es una materia prima clave.', categoria: 'profesional', nivel: 'avanzado' },
  { id: 60, ingles: 'pretense',       significadoIngles: 'fingimiento / farsa',    espanol: 'pretensión',    significadoEspanol: 'aspiration / claim',           ejemplo: '"Under false pretenses." → Bajo pretextos falsos.',               categoria: 'acciones',    nivel: 'avanzado' },
  { id: 61, ingles: 'signature',      significadoIngles: 'firma',                  espanol: 'signatura',     significadoEspanol: 'library catalog code',         ejemplo: '"Add your signature here." → Añade tu firma aquí.',               categoria: 'profesional', nivel: 'avanzado' },
  { id: 62, ingles: 'gracious',       significadoIngles: 'amable / cortés',        espanol: 'gracioso',      significadoEspanol: 'funny / comical',              ejemplo: '"A gracious host." → Un anfitrión muy amable.',                   categoria: 'emociones',   nivel: 'avanzado' },
  { id: 63, ingles: 'notorious',      significadoIngles: 'famoso por algo malo',   espanol: 'notorio',       significadoEspanol: 'obvious / well-known',         ejemplo: '"A notorious criminal." → Un criminal de mala fama.',            categoria: 'cotidiano',   nivel: 'avanzado' },
  { id: 64, ingles: 'propaganda',     significadoIngles: 'propaganda (política)',  espanol: 'propaganda',    significadoEspanol: 'advertising / flyers / leaflets',ejemplo: '"State propaganda." → Propaganda estatal.',                     categoria: 'profesional', nivel: 'avanzado' },
  { id: 65, ingles: 'sin',            significadoIngles: 'pecado / transgresión',  espanol: 'sin',           significadoEspanol: 'without',                      ejemplo: '"It\'s a sin to waste food." → Es un pecado desperdiciar comida.', categoria: 'identicos',  nivel: 'avanzado' },
  { id: 66, ingles: 'red',            significadoIngles: 'rojo',                   espanol: 'red',           significadoEspanol: 'network / web / net',           ejemplo: '"Paint it red." → Píntalo de rojo.',                             categoria: 'identicos',   nivel: 'avanzado' },
  { id: 67, ingles: 'pie',            significadoIngles: 'pastel / tarta',         espanol: 'pie',           significadoEspanol: 'foot',                         ejemplo: '"Apple pie." → Tarta de manzana.',                               categoria: 'identicos',   nivel: 'avanzado' },
  { id: 68, ingles: 'hay',            significadoIngles: 'heno',                   espanol: 'hay',           significadoEspanol: 'there is / there are',         ejemplo: '"Hay fever." → Fiebre del heno.',                                categoria: 'identicos',   nivel: 'avanzado' },
  { id: 69, ingles: 'pan',            significadoIngles: 'sartén',                 espanol: 'pan',           significadoEspanol: 'bread',                        ejemplo: '"Fry it in the pan." → Fríelo en la sartén.',                    categoria: 'identicos',   nivel: 'avanzado' },
  { id: 70, ingles: 'rope',           significadoIngles: 'cuerda / soga',          espanol: 'ropa',          significadoEspanol: 'clothes / clothing',           ejemplo: '"Grab the rope!" → ¡Agarra la cuerda!',                          categoria: 'identicos',   nivel: 'avanzado' },
  { id: 71, ingles: 'sympathize',     significadoIngles: 'compadecerse / sentir empatía', espanol: 'simpatizar', significadoEspanol: 'to like / get along with', ejemplo: '"I sympathize with your situation." → Me compadezco de tu situación.', categoria: 'emociones', nivel: 'avanzado' },
  { id: 72, ingles: 'formation',      significadoIngles: 'formación (militar/geológica)', espanol: 'formación', significadoEspanol: 'training / education',      ejemplo: '"Rock formation." → Formación rocosa.',                          categoria: 'profesional', nivel: 'avanzado' },
  { id: 73, ingles: 'editor',         significadoIngles: 'redactor / editor',      espanol: 'editor',        significadoEspanol: 'publisher (in some contexts)', ejemplo: '"The editor reviewed the article." → El redactor revisó el artículo.', categoria: 'profesional', nivel: 'avanzado' },
  { id: 74, ingles: 'curious',        significadoIngles: 'curioso / llamativo (también)',espanol: 'curioso',  significadoEspanol: 'curious / nosy',              ejemplo: '"A curious case." → Un caso llamativo / extraño.',                categoria: 'emociones',   nivel: 'avanzado' },
  { id: 75, ingles: 'crime',          significadoIngles: 'delito / crimen',        espanol: 'crimen',        significadoEspanol: 'only very serious crimes',     ejemplo: '"Petty crime." → Delito menor. (En español "crimen" solo para los más graves)', categoria: 'profesional', nivel: 'avanzado' },
];

const CATEGORIAS: Record<Categoria, { nombre: string; emoji: string }> = {
  cotidiano:   { nombre: 'Vida cotidiana', emoji: '🏠' },
  emociones:   { nombre: 'Emociones y carácter', emoji: '💬' },
  profesional: { nombre: 'Trabajo y academia', emoji: '💼' },
  acciones:    { nombre: 'Verbos y acciones', emoji: '⚡' },
  identicos:   { nombre: 'Idénticos, distintos', emoji: '🔤' },
};

const NIVELES: Record<Nivel, { nombre: string; emoji: string; color: string }> = {
  basico:    { nombre: 'Básico',    emoji: '🌱', color: '#22c55e' },
  medio:     { nombre: 'Medio',     emoji: '📚', color: '#f59e0b' },
  avanzado:  { nombre: 'Avanzado',  emoji: '🏆', color: '#ef4444' },
};

const PUNTACIONES = [
  { min: 18, emoji: '🌟', titulo: 'Experto/a', desc: 'Los falsos amigos casi no te engañan. Excelente dominio del vocabulario.' },
  { min: 14, emoji: '📚', titulo: 'Avanzado/a', desc: 'Buen nivel. Conoces la mayoría de las trampas del vocabulario.' },
  { min: 10, emoji: '🎯', titulo: 'Intermedio/a', desc: 'Sólido. Algunos pares clásicos todavía te sorprenden.' },
  { min: 5,  emoji: '📝', titulo: 'Aprendiz',  desc: 'Los falsos amigos te atrapan con frecuencia. ¡El catálogo es para ti!' },
  { min: 0,  emoji: '🌱', titulo: 'Principiante', desc: 'Muchos pares nuevos. Revisa el catálogo antes de practicar.' },
];

const N_PRACTICA = 20;

function mezclar<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function generarOpciones(pregunta: FalsoAmigo, todas: FalsoAmigo[]): string[] {
  const correcta = pregunta.significadoIngles;
  const trampa = pregunta.significadoEspanol;
  const pool = todas
    .filter(fa => fa.id !== pregunta.id && fa.significadoIngles !== correcta && fa.significadoIngles !== trampa)
    .map(fa => fa.significadoIngles);
  const distractor = pool[Math.floor(Math.random() * pool.length)];
  return mezclar([correcta, trampa, distractor]);
}

export default function FalsosAmigosIngles() {
  // CATÁLOGO state
  const [tab, setTab] = useState<Tab>('catalogo');
  const [busqueda, setBusqueda] = useState('');
  const [catFiltro, setCatFiltro] = useState<Categoria | 'todas'>('todas');
  const [nivelFiltro, setNivelFiltro] = useState<Nivel | 'todos'>('todos');

  // PRÁCTICA state
  const [fasePractica, setFasePractica] = useState<FasePractica>('inicio');
  const [preguntas, setPreguntas] = useState<FalsoAmigo[]>([]);
  const [opciones, setOpciones] = useState<string[]>([]);
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);

  // Catálogo filtrado
  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return FALSOS_AMIGOS.filter(fa => {
      const matchTexto = !q ||
        fa.ingles.toLowerCase().includes(q) ||
        fa.espanol.toLowerCase().includes(q) ||
        fa.significadoIngles.toLowerCase().includes(q) ||
        fa.significadoEspanol.toLowerCase().includes(q);
      const matchCat = catFiltro === 'todas' || fa.categoria === catFiltro;
      const matchNivel = nivelFiltro === 'todos' || fa.nivel === nivelFiltro;
      return matchTexto && matchCat && matchNivel;
    });
  }, [busqueda, catFiltro, nivelFiltro]);

  // Práctica: iniciar
  function iniciarPractica() {
    const seleccionadas = mezclar(FALSOS_AMIGOS).slice(0, N_PRACTICA);
    const opts = generarOpciones(seleccionadas[0], FALSOS_AMIGOS);
    setPreguntas(seleccionadas);
    setOpciones(opts);
    setIndice(0);
    setSeleccion(null);
    setAciertos(0);
    setFasePractica('jugando');
  }

  function responder(opcion: string) {
    if (fasePractica === 'revelado') return;
    setSeleccion(opcion);
    if (opcion === preguntas[indice].significadoIngles) setAciertos(a => a + 1);
    setFasePractica('revelado');
  }

  function siguiente() {
    const siguiente = indice + 1;
    if (siguiente >= preguntas.length) {
      setFasePractica('fin');
    } else {
      setIndice(siguiente);
      setOpciones(generarOpciones(preguntas[siguiente], FALSOS_AMIGOS));
      setSeleccion(null);
      setFasePractica('jugando');
    }
  }

  const nivelResultado = PUNTACIONES.find(p => aciertos >= p.min) ?? PUNTACIONES[PUNTACIONES.length - 1];
  const preguntaActual = preguntas[indice];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon}>🇬🇧</div>
        <h1>Falsos Amigos Español-Inglés</h1>
        <p>75 pares que engañan — catálogo buscable y práctica interactiva</p>
      </header>

      <LegalNotice />

      {/* PESTAÑAS */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === 'catalogo' ? styles.tabActivo : ''}`}
            aria-pressed={tab === 'catalogo'}
            onClick={() => setTab('catalogo')}
          >
            📖 Catálogo
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === 'practica' ? styles.tabActivo : ''}`}
            aria-pressed={tab === 'practica'}
            onClick={() => setTab('practica')}
          >
            🎯 Práctica
          </button>
        </div>

        {/* ════════════════════════════ CATÁLOGO ════════════════════════════ */}
        {tab === 'catalogo' && (
          <div className={styles.catalogoPanel}>
            {/* Buscador */}
            <div className={styles.buscadorWrapper}>
              <span className={styles.buscadorIcon} aria-hidden="true">🔍</span>
              <input
                type="search"
                className={styles.buscador}
                placeholder="Buscar en inglés o español..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                aria-label="Buscar falsos amigos"
              />
              {busqueda && (
                <button type="button" className={styles.btnLimpiar} onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">✕</button>
              )}
            </div>

            {/* Filtros */}
            <div className={styles.filtros}>
              <div className={styles.filtroGrupo}>
                <span className={styles.filtroLabel}>Categoría:</span>
                <div className={styles.chips}>
                  <button type="button" className={`${styles.chip} ${catFiltro === 'todas' ? styles.chipActivo : ''}`} aria-pressed={catFiltro === 'todas'} onClick={() => setCatFiltro('todas')}>Todas</button>
                  {(Object.keys(CATEGORIAS) as Categoria[]).map(c => (
                    <button key={c} type="button" className={`${styles.chip} ${catFiltro === c ? styles.chipActivo : ''}`} aria-pressed={catFiltro === c} onClick={() => setCatFiltro(c)}>
                      {CATEGORIAS[c].emoji} {CATEGORIAS[c].nombre}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.filtroGrupo}>
                <span className={styles.filtroLabel}>Nivel:</span>
                <div className={styles.chips}>
                  <button type="button" className={`${styles.chip} ${nivelFiltro === 'todos' ? styles.chipActivo : ''}`} aria-pressed={nivelFiltro === 'todos'} onClick={() => setNivelFiltro('todos')}>Todos</button>
                  {(Object.keys(NIVELES) as Nivel[]).map(n => (
                    <button key={n} type="button" className={`${styles.chip} ${nivelFiltro === n ? styles.chipActivo : ''}`} aria-pressed={nivelFiltro === n} onClick={() => setNivelFiltro(n)}>
                      {NIVELES[n].emoji} {NIVELES[n].nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contador */}
            <div className={styles.contadorResultados}>
              {filtrados.length === FALSOS_AMIGOS.length
                ? `${FALSOS_AMIGOS.length} pares`
                : `${filtrados.length} de ${FALSOS_AMIGOS.length} pares`}
            </div>

            {/* Grid de tarjetas */}
            {filtrados.length === 0 ? (
              <div className={styles.sinResultados}>No hay resultados para &ldquo;{busqueda}&rdquo;</div>
            ) : (
              <div className={styles.grid}>
                {filtrados.map(fa => (
                  <div key={fa.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardIngles}>{fa.ingles}</span>
                      <span className={styles.nivelBadge} style={{ background: NIVELES[fa.nivel].color }}>{NIVELES[fa.nivel].emoji}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.flagEn} aria-label="inglés">🇬🇧</span>
                      <span className={styles.rowLabel}>Significa:</span>
                      <span className={styles.rowValor}>{fa.significadoIngles}</span>
                    </div>
                    <div className={`${styles.cardRow} ${styles.cardRowTrampa}`}>
                      <span className={styles.flagEs} aria-label="español">🇪🇸</span>
                      <span className={styles.rowLabel}>No es:</span>
                      <span className={styles.rowValor}><strong>{fa.espanol}</strong> = {fa.significadoEspanol}</span>
                    </div>
                    <div className={styles.cardEjemplo}>{fa.ejemplo}</div>
                    <span className={styles.catTag}>{CATEGORIAS[fa.categoria].emoji} {CATEGORIAS[fa.categoria].nombre}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════ PRÁCTICA ════════════════════════════ */}
        {tab === 'practica' && (
          <div className={styles.practicaPanel}>

            {/* Inicio */}
            {fasePractica === 'inicio' && (
              <div className={styles.practicaInicio}>
                <div className={styles.practicaInicioIcon} aria-hidden="true">🎯</div>
                <h2>Pon a prueba tu inglés</h2>
                <p>{N_PRACTICA} palabras aleatorias. Para cada una, elige el significado REAL en inglés.</p>
                <div className={styles.practicaStats}>
                  <div><strong>{N_PRACTICA}</strong> preguntas</div>
                  <div><strong>3</strong> opciones</div>
                  <div><strong>~3</strong> min</div>
                </div>
                <button type="button" className={styles.btnIniciarPractica} onClick={iniciarPractica}>
                  Empezar práctica
                </button>
              </div>
            )}

            {/* Jugando / Revelado */}
            {(fasePractica === 'jugando' || fasePractica === 'revelado') && preguntaActual && (
              <div className={styles.practicaJuego}>
                {/* Progreso */}
                <div className={styles.practicaProgreso}>
                  <div className={styles.practicaProgresoBar}>
                    <div className={styles.practicaProgresoFill} style={{ width: `${(indice / N_PRACTICA) * 100}%` }} />
                  </div>
                  <span className={styles.practicaProgresoNum}>{indice + 1} / {N_PRACTICA}</span>
                </div>

                {/* Pregunta */}
                <div className={styles.preguntaBox}>
                  <p className={styles.preguntaLabel}>¿Qué significa en inglés?</p>
                  <p className={styles.preguntaPalabra}>&ldquo;{preguntaActual.ingles}&rdquo;</p>
                </div>

                {/* Opciones */}
                <div className={styles.opcionesGrid}>
                  {opciones.map((op, i) => {
                    let estadoClase = '';
                    if (fasePractica === 'revelado') {
                      if (op === preguntaActual.significadoIngles) estadoClase = styles.opcionCorrecta;
                      else if (op === seleccion) estadoClase = styles.opcionIncorrecta;
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`${styles.opcion} ${estadoClase}`}
                        onClick={() => responder(op)}
                        disabled={fasePractica === 'revelado'}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                {fasePractica === 'revelado' && (
                  <div className={`${styles.feedback} ${seleccion === preguntaActual.significadoIngles ? styles.feedbackOk : styles.feedbackFail}`}>
                    <div className={styles.feedbackTitulo}>
                      {seleccion === preguntaActual.significadoIngles ? '✓ Correcto' : '✗ Incorrecto'}
                    </div>
                    <p className={styles.feedbackTexto}>
                      <strong>&ldquo;{preguntaActual.ingles}&rdquo;</strong> = <strong>{preguntaActual.significadoIngles}</strong>.
                      {' '}No confundir con <strong>{preguntaActual.espanol}</strong> (español), que significa <em>{preguntaActual.significadoEspanol}</em>.
                    </p>
                    <p className={styles.feedbackEjemplo}>{preguntaActual.ejemplo}</p>
                    <button type="button" className={styles.btnSiguiente} onClick={siguiente}>
                      {indice + 1 < N_PRACTICA ? 'Siguiente →' : 'Ver resultados'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Fin */}
            {fasePractica === 'fin' && (
              <div className={styles.practicaFin}>
                <div className={styles.finEmoji} aria-hidden="true">{nivelResultado.emoji}</div>
                <h2 className={styles.finTitulo}>{nivelResultado.titulo}</h2>
                <p className={styles.finDesc}>{nivelResultado.desc}</p>
                <div className={styles.finPuntuacion}>
                  <span className={styles.finNum}>{aciertos}</span>
                  <span className={styles.finTotal}>/ {N_PRACTICA}</span>
                  <span className={styles.finPct}>{Math.round((aciertos / N_PRACTICA) * 100)}%</span>
                </div>
                <div className={styles.finBotones}>
                  <button type="button" className={styles.btnRepetir} onClick={iniciarPractica}>Repetir práctica</button>
                  <button type="button" className={styles.btnVerCatalogo} onClick={() => setTab('catalogo')}>Ver catálogo</button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <EducationalSection
        title="Por qué los falsos amigos son la trampa más frecuente del inglés"
        subtitle="Cómo identificarlos, ejemplos habituales y estrategias para no caer en ellos"
      >
        <p>
          Los falsos amigos (<em>false friends</em> o <em>faux amis</em>) son palabras que se parecen
          en forma pero difieren en significado entre dos lenguas. Para hispanohablantes que aprenden inglés,
          son especialmente traicioneros porque activan el significado español automáticamente antes de que
          el aprendiz pueda corregirlo. La mayoría provienen del latín o del francés, que influenciaron
          ambas lenguas pero evolucionaron en direcciones distintas.
        </p>

        {/* TABLA COMPARATIVA */}
        <h3>Los pares más problemáticos por categoría</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Palabra inglesa</th>
                <th>Significa en inglés</th>
                <th>Falso amigo en español</th>
                <th>El error típico</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>embarrassed</strong></td><td>avergonzado/a</td><td>embarazada</td><td>"I was so embarrassed" → "Estaba tan embarazada" ❌</td></tr>
              <tr><td><strong>actually</strong></td><td>en realidad / de hecho</td><td>actualmente</td><td>"Actually I work here" → "Actualmente trabajo aquí" ❌</td></tr>
              <tr><td><strong>sensible</strong></td><td>razonable / sensato</td><td>sensible (sensitive)</td><td>"Be sensible!" → "¡Sé sensible!" ❌</td></tr>
              <tr><td><strong>realize</strong></td><td>darse cuenta de</td><td>realizar (to do/accomplish)</td><td>"I realized the mistake" → "Realicé el error" ❌</td></tr>
              <tr><td><strong>fabric</strong></td><td>tela / tejido</td><td>fábrica (factory)</td><td>"Beautiful fabric" → "Hermosa fábrica" ❌</td></tr>
              <tr><td><strong>eventually</strong></td><td>finalmente / al final</td><td>eventualmente (possibly)</td><td>"He eventually came" → "Eventualmente vino" ❌</td></tr>
            </tbody>
          </table>
        </div>

        {/* ESCENARIOS */}
        <h3>¿Para quién es esta herramienta?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <h4>Estudiantes de inglés</h4>
            <p>Ideal para evitar los errores clásicos en exámenes, redacciones y conversaciones. Los falsos amigos son una fuente constante de puntos perdidos y malentendidos.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>💼</span>
            <h4>Profesionales en entornos bilingües</h4>
            <p>En correos, reuniones y presentaciones en inglés, un falso amigo en el momento incorrecto puede resultar cómico o malinterpretarse. El catálogo de nivel avanzado es especialmente útil.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>✈️</span>
            <h4>Viajeros hispanohablantes</h4>
            <p>Muchos falsos amigos básicos (constipated, embarrassed, molest) pueden generar situaciones muy incómodas fuera del país. Conviene aprenderlos antes de viajar.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>🧑‍🏫</span>
            <h4>Docentes de inglés</h4>
            <p>Un banco curado de 75 pares clasificados por nivel (básico/medio/avanzado) y categoría, listo para usar como material de clase, dictado o ejercicio de vocabulario.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas frecuentes sobre falsos amigos</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué existen los falsos amigos entre inglés y español?</h4>
            <p>La mayoría tienen raíz latina o francesa común: cuando los romanos conquistaron la Península Ibérica y cuando los normandos conquistaron Inglaterra (1066), introdujeron vocabulario similar. Pero durante siglos las lenguas evolucionaron de forma independiente, y muchas palabras compartidas bifurcaron su significado. <em>Deception</em> y <em>decepción</em> comparten el latín <em>deceptio</em> pero hoy significan cosas distintas.</p>
            <div className={styles.faqTip}>El 30% del vocabulario inglés tiene origen latino o francés directo, lo que explica la gran cantidad de pares de falsos amigos con el español.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuáles son los falsos amigos más peligrosos en una conversación real?</h4>
            <p><strong>Molest</strong> encabeza la lista: en inglés implica acoso sexual, no simple molestia. <strong>Constipated</strong> (estreñido, no acatarrado) puede generar confusión médica. <strong>Embarrassed</strong> (avergonzado, no embarazada) es uno de los más memorables. <strong>Deception</strong> (engaño, no decepción) puede ofender innecesariamente a alguien.</p>
            <div className={styles.faqTip}>En situaciones formales o de salud, un falso amigo puede cambiar completamente el sentido de un mensaje. Los pares de la categoría "Trabajo y academia" son especialmente importantes para entornos profesionales.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué son los falsos amigos "idénticos" de esta herramienta?</h4>
            <p>La categoría "Idénticos, distintos" recoge palabras que se escriben igual en inglés y español pero significan cosas completamente distintas. <em>Once</em> en inglés = "una vez"; en español = "eleven". <em>Red</em> en inglés = el color rojo; en español = network, web. <em>Pan</em> en inglés = frying pan, sartén; en español = bread. Son los más sorprendentes porque la identidad visual es total.</p>
            <div className={styles.faqTip}>El par más llamativo: <em>sin</em> en inglés significa "pecado/transgresión"; en español significa "without". Frases como "sin miedo" (without fear) o "a cup of sin" (una taza de pecado) ilustran el choque.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Hay palabras que son falsos amigos en una dirección pero no en la otra?</h4>
            <p>Sí. <em>Actual</em> (real/verdadero en inglés) no corresponde a "actual" en español (current/present). Pero <em>actually</em> (en realidad) sí se confunde con "actualmente" (currently). <em>Success</em> = éxito en español, y "éxito" en español = success en inglés: aquí los dos lados del par coinciden en concepto pero las confusiones surgen porque <em>exit</em> (salida) parece más parecido a "éxito" visualmente.</p>
            <div className={styles.faqTip}>La bidireccionalidad de los falsos amigos es un campo de estudio en lingüística. No siempre el error va en la misma dirección para hablantes nativos de ambas lenguas.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se aprenden mejor los falsos amigos?</h4>
            <p>La investigación en adquisición de lenguas señala tres estrategias eficaces: (1) exposición en contexto real, no solo definición aislada; (2) práctica de recuperación espaciada (usar la herramienta varias veces con días de diferencia); (3) asociar el par con una imagen mental o anécdota memorable. El modo práctica de esta app aplica la segunda estrategia directamente.</p>
            <div className={styles.faqTip}>Un truco mnemónico clásico para "embarrassed vs embarazada": en inglés hay dos letras R y dos S, igual que en "embarrassed" — más "carga" tipográfica, más vergüenza. No es exacto pero es memorable.</div>
          </div>
        </div>

        {/* PASOS */}
        <h3>Cómo usar esta herramienta de forma efectiva</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Empieza por los básicos aunque ya conozcas inglés</h4>
              <p>Los falsos amigos de nivel básico son los más frecuentes y los que más errores causan en la práctica real. Aunque ya los conozcas, recorrer el catálogo filtrando por "Básico" es un buen punto de partida para confirmar qué tienes interiorizado.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Usa el buscador para revisar palabras específicas</h4>
              <p>Cuando en una lectura, serie o conversación encuentres una palabra que te confunda, búscala directamente. El buscador funciona en inglés y en español simultáneamente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Practica en modo flashcard regularmente</h4>
              <p>El modo práctica selecciona 20 pares aleatorios cada vez. Hacerlo varias veces en días distintos (práctica espaciada) consolida el vocabulario de forma mucho más eficaz que estudiar todos de golpe.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Presta atención a los ejemplos, no solo a las definiciones</h4>
              <p>El ejemplo de uso en contexto es la parte más valiosa de cada tarjeta: el cerebro recuerda mejor las palabras en frases reales que en listas de vocabulario aislado.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Filtra por categorías según tu contexto</h4>
              <p>Si preparas una entrevista en inglés, filtra por "Trabajo y academia". Si viajas, prioriza "Vida cotidiana". Si eres docente, la categoría "Idénticos, distintos" suele sorprender más a los estudiantes y genera mejor debate en clase.</p>
            </div>
          </div>
        </div>

        {/* TIPS */}
        <h3>Curiosidades sobre los falsos amigos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔤</span>
            <p><strong>Pan, once, red, pie, sin:</strong> cinco palabras que se escriben igual en inglés y en español pero no comparten ningún significado. La coincidencia es puramente gráfica, no histórica — llegaron al mismo resultado por caminos distintos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📜</span>
            <p>La conquista normanda de Inglaterra en 1066 introdujo decenas de miles de palabras de origen francés-latino al inglés antiguo. Muchas de estas palabras también existían en castellano medieval, creando el caldo de cultivo para cientos de falsos amigos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚠️</span>
            <p><strong>Molest</strong> es el falso amigo más peligroso: en inglés implica acoso o abuso sexual, no mera molestia. Usar "he molested me" para decir "me molestó" en una conversación en inglés puede causar un malentendido muy serio.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>Los falsos amigos no son exclusivos del inglés y el español. Existen entre casi todos los pares de lenguas con raíz común: <em>gift</em> significa "veneno" en alemán pero "regalo" en inglés y en contextos informales en español. Las lenguas comparten palabras pero no siempre comparten significados.</p>
          </div>
        </div>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores comunes al trabajar con falsos amigos
          </div>
          <ul className={styles.warningList}>
            <li><strong>Memorizar la lista sin usar el contexto:</strong> aprender "sensible = razonable" sin una frase real hace que el cerebro no reemplace automáticamente el significado incorrecto. El ejemplo de uso en cada tarjeta es fundamental.</li>
            <li><strong>Confundir el nivel de formalidad:</strong> algunos falsos amigos son inofensivos en registros informales pero problemáticos en contextos formales. "Molest", "deception" y "miserable" requieren especial cuidado en entornos profesionales o médicos.</li>
            <li><strong>Asumir que los cognados siempre son seguros:</strong> palabras como "actual", "eventual" y "comprehensive" parecen cognatos inofensivos pero son falsos amigos clásicos de nivel medio.</li>
            <li><strong>Ignorar los "idénticos" por considerarlos coincidencia:</strong> que "once" sea "una vez" en inglés y "once" sea "eleven" en español no es una rareza: en exámenes de comprensión lectora y conversación pueden causar errores que el estudiante ni siquiera detecta.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('falsos-amigos-ingles')} />
      <ShareCard appName="falsos-amigos-ingles" />
      <Footer appName="falsos-amigos-ingles" />
    </div>
  );
}
