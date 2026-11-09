/**
 * Listas precargadas del Bingo Personalizado (S0263, 09/11/2026).
 *
 * Criterios con los que se escribieron, para no deshacerlos al ampliar:
 *  · Español neutro: fuera las palabras que cambian de un país a otro (plátano/banana,
 *    fresa/frutilla, piña/ananá, palomitas/pochoclo, patata/papa, mariquita/catarina…). Si una
 *    casilla obliga a pensar «¿esto qué es?», el juego se para.
 *  · Navidad SIN nieve ni invierno, porque en Argentina, Chile o Uruguay cae en verano, y sin
 *    bebidas alcohólicas.
 *  · Sin capitales discutidas: Bolivia (Sucre o La Paz), Israel, Sudáfrica (tres capitales).
 *  · Inglés sin «gris» (gray/grey) para no elegir entre la variante británica y la americana.
 *  · Los símbolos químicos salen del catálogo compartido (data/elementos-quimicos), el mismo de
 *    quiz-simbolos-quimicos: un solo nombre para cada elemento en todo meskeIA.
 *
 * Las listas de cálculo (tablas, sumas y restas) no se escriben aquí: las genera el motor.
 */
import { ELEMENTOS } from '@/data/elementos-quimicos';
import { generarSumasRestas, generarTablas, type Elemento } from './motor';

export type FamiliaLista = 'aula' | 'ocio';

export interface ListaPrecargada {
  id: string;
  nombre: string;
  icono: string;
  familia: FamiliaLista;
  /** Qué canta el bombo y qué lleva el cartón, en una frase */
  ejemplo: string;
}

export const LISTAS: ListaPrecargada[] = [
  { id: 'tablas', nombre: 'Tablas de multiplicar', icono: '✖️', familia: 'aula', ejemplo: 'El bombo canta «7 × 8» y en el cartón está el 56' },
  { id: 'sumas20', nombre: 'Sumas y restas hasta 20', icono: '➕', familia: 'aula', ejemplo: 'El bombo canta «15 − 7» y en el cartón está el 8' },
  { id: 'sumas100', nombre: 'Sumas y restas hasta 100', icono: '🔢', familia: 'aula', ejemplo: 'El bombo canta «38 + 19» y en el cartón está el 57' },
  { id: 'ingles', nombre: 'Inglés: animales, colores, números y días', icono: '🇬🇧', familia: 'aula', ejemplo: 'El bombo canta «gato» y en el cartón está «cat»' },
  { id: 'capitales', nombre: 'Países y capitales', icono: '🌎', familia: 'aula', ejemplo: 'El bombo canta «Perú» y en el cartón está «Lima»' },
  { id: 'quimica', nombre: 'Símbolos químicos', icono: '⚗️', familia: 'aula', ejemplo: 'El bombo canta «Fe» y en el cartón está «hierro»' },
  { id: 'animales', nombre: 'Animales', icono: '🐶', familia: 'ocio', ejemplo: 'El bombo canta «jirafa» y se tacha la jirafa' },
  { id: 'comida', nombre: 'Frutas y comida', icono: '🍎', familia: 'ocio', ejemplo: 'El bombo canta «sandía» y se tacha la sandía' },
  { id: 'navidad', nombre: 'Navidad', icono: '🎄', familia: 'ocio', ejemplo: 'El bombo canta «campana» y se tacha la campana' },
];

export const TABLAS_DISPONIBLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const TABLAS_POR_DEFECTO = [2, 3, 4, 5, 6, 7, 8, 9];

/** Ocio: se canta lo mismo que está en el cartón. */
const ocio = (pares: readonly (readonly [string, string])[]): Elemento[] =>
  pares.map(([emoji, palabra]) => ({ canta: palabra, carton: palabra, emoji }));

/** Clase: el bombo canta lo primero y el cartón lleva lo segundo. */
const aula = (pares: readonly (readonly [string, string])[]): Elemento[] =>
  pares.map(([canta, carton]) => ({ canta, carton }));

const INGLES = aula([
  ['perro', 'dog'], ['gato', 'cat'], ['caballo', 'horse'], ['vaca', 'cow'], ['cerdo', 'pig'],
  ['oveja', 'sheep'], ['gallina', 'hen'], ['pato', 'duck'], ['conejo', 'rabbit'], ['ratón', 'mouse'],
  ['pájaro', 'bird'], ['pez', 'fish'], ['oso', 'bear'], ['león', 'lion'], ['tigre', 'tiger'],
  ['elefante', 'elephant'], ['mono', 'monkey'], ['serpiente', 'snake'], ['rana', 'frog'], ['tortuga', 'turtle'],
  ['rojo', 'red'], ['azul', 'blue'], ['verde', 'green'], ['amarillo', 'yellow'], ['negro', 'black'],
  ['blanco', 'white'], ['rosa (color)', 'pink'], ['morado', 'purple'], ['marrón o café', 'brown'], ['naranja (color)', 'orange'],
  ['once', 'eleven'], ['doce', 'twelve'], ['trece', 'thirteen'], ['catorce', 'fourteen'], ['quince', 'fifteen'],
  ['dieciséis', 'sixteen'], ['diecisiete', 'seventeen'], ['dieciocho', 'eighteen'], ['diecinueve', 'nineteen'], ['veinte', 'twenty'],
  ['lunes', 'Monday'], ['martes', 'Tuesday'], ['miércoles', 'Wednesday'], ['jueves', 'Thursday'], ['viernes', 'Friday'],
  ['sábado', 'Saturday'], ['domingo', 'Sunday'],
]);

const CAPITALES = aula([
  ['Argentina', 'Buenos Aires'], ['Brasil', 'Brasilia'], ['Chile', 'Santiago'], ['Colombia', 'Bogotá'],
  ['Costa Rica', 'San José'], ['Cuba', 'La Habana'], ['Ecuador', 'Quito'], ['El Salvador', 'San Salvador'],
  ['Guatemala', 'Ciudad de Guatemala'], ['Honduras', 'Tegucigalpa'], ['México', 'Ciudad de México'], ['Nicaragua', 'Managua'],
  ['Panamá', 'Ciudad de Panamá'], ['Paraguay', 'Asunción'], ['Perú', 'Lima'], ['República Dominicana', 'Santo Domingo'],
  ['Uruguay', 'Montevideo'], ['Venezuela', 'Caracas'], ['Estados Unidos', 'Washington'], ['Canadá', 'Ottawa'],
  ['España', 'Madrid'], ['Portugal', 'Lisboa'], ['Francia', 'París'], ['Italia', 'Roma'],
  ['Alemania', 'Berlín'], ['Reino Unido', 'Londres'], ['Irlanda', 'Dublín'], ['Países Bajos', 'Ámsterdam'],
  ['Bélgica', 'Bruselas'], ['Suiza', 'Berna'], ['Austria', 'Viena'], ['Grecia', 'Atenas'],
  ['Polonia', 'Varsovia'], ['Suecia', 'Estocolmo'], ['Noruega', 'Oslo'], ['Dinamarca', 'Copenhague'],
  ['Finlandia', 'Helsinki'], ['Hungría', 'Budapest'], ['Chequia', 'Praga'], ['Rusia', 'Moscú'],
  ['Turquía', 'Ankara'], ['Egipto', 'El Cairo'], ['Marruecos', 'Rabat'], ['Argelia', 'Argel'],
  ['Kenia', 'Nairobi'], ['China', 'Pekín'], ['Japón', 'Tokio'], ['India', 'Nueva Delhi'],
  ['Corea del Sur', 'Seúl'], ['Filipinas', 'Manila'], ['Australia', 'Canberra'],
]);

const QUIMICA: Elemento[] = ELEMENTOS.filter((e) => e.categoria !== 'avanzado').map((e) => ({
  canta: e.simbolo,
  carton: e.nombre.toLowerCase(),
}));

const ANIMALES = ocio([
  ['🐶', 'perro'], ['🐱', 'gato'], ['🐭', 'ratón'], ['🐹', 'hámster'], ['🐰', 'conejo'],
  ['🦊', 'zorro'], ['🐻', 'oso'], ['🐼', 'panda'], ['🐨', 'koala'], ['🐯', 'tigre'],
  ['🦁', 'león'], ['🐮', 'vaca'], ['🐷', 'cerdo'], ['🐸', 'rana'], ['🐵', 'mono'],
  ['🐔', 'gallina'], ['🐧', 'pingüino'], ['🐦', 'pájaro'], ['🦆', 'pato'], ['🦅', 'águila'],
  ['🦉', 'búho'], ['🦇', 'murciélago'], ['🐺', 'lobo'], ['🐴', 'caballo'], ['🐝', 'abeja'],
  ['🦋', 'mariposa'], ['🐌', 'caracol'], ['🐢', 'tortuga'], ['🐍', 'serpiente'], ['🐙', 'pulpo'],
  ['🦀', 'cangrejo'], ['🐟', 'pez'], ['🐬', 'delfín'], ['🐳', 'ballena'], ['🦈', 'tiburón'],
  ['🐊', 'cocodrilo'], ['🦒', 'jirafa'], ['🐘', 'elefante'], ['🐫', 'camello'], ['🦓', 'cebra'],
  ['🦘', 'canguro'], ['🦍', 'gorila'], ['🐜', 'hormiga'], ['🕷️', 'araña'],
]);

const COMIDA = ocio([
  ['🍎', 'manzana'], ['🍐', 'pera'], ['🍊', 'naranja'], ['🍋', 'limón'], ['🍇', 'uvas'],
  ['🍉', 'sandía'], ['🍈', 'melón'], ['🍒', 'cereza'], ['🥝', 'kiwi'], ['🥥', 'coco'],
  ['🥭', 'mango'], ['🫐', 'arándanos'], ['🍅', 'tomate'], ['🥕', 'zanahoria'], ['🥦', 'brócoli'],
  ['🥒', 'pepino'], ['🍆', 'berenjena'], ['🧄', 'ajo'], ['🧅', 'cebolla'], ['🫒', 'aceituna'],
  ['🌰', 'castaña'], ['🥗', 'ensalada'], ['🍞', 'pan'], ['🧀', 'queso'], ['🥚', 'huevo'],
  ['🍗', 'pollo'], ['🍚', 'arroz'], ['🍝', 'espaguetis'], ['🍕', 'pizza'], ['🍔', 'hamburguesa'],
  ['🌮', 'taco'], ['🌯', 'burrito'], ['🥪', 'sándwich'], ['🍪', 'galleta'], ['🍦', 'helado'],
  ['🍫', 'chocolate'], ['🍬', 'caramelo'], ['🍯', 'miel'], ['🥛', 'leche'],
]);

const NAVIDAD = ocio([
  ['🎄', 'árbol de Navidad'], ['⭐', 'estrella'], ['🎁', 'regalo'], ['🔔', 'campana'], ['🕯️', 'vela'],
  ['🦌', 'reno'], ['🎅', 'Papá Noel'], ['🤶', 'Mamá Noel'], ['👼', 'ángel'], ['🍪', 'galleta'],
  ['🧦', 'calcetín'], ['🎀', 'lazo'], ['🎶', 'música'], ['🌠', 'estrella fugaz'], ['🎆', 'fuegos artificiales'],
  ['🎇', 'bengala'], ['🎈', 'globo'], ['🎊', 'confeti'], ['🥁', 'tambor'], ['🎺', 'trompeta'],
  ['🪅', 'piñata'], ['🍇', 'uvas'], ['🕛', 'reloj'], ['👑', 'corona'], ['💌', 'tarjeta'],
  ['🍬', 'dulces'], ['🍫', 'chocolate'], ['💡', 'luces'], ['👪', 'familia'], ['🍽️', 'cena'],
  ['🦃', 'pavo'], ['🫂', 'abrazo'],
]);

/** Los elementos de una lista precargada. `tablas` solo cuenta para la de multiplicar. */
export function elementosDeLista(id: string, tablas: readonly number[]): Elemento[] {
  switch (id) {
    case 'tablas':
      return generarTablas([...tablas].sort((a, b) => a - b));
    case 'sumas20':
      return generarSumasRestas(20, 1);
    case 'sumas100':
      return generarSumasRestas(100, 2);
    case 'ingles':
      return INGLES;
    case 'capitales':
      return CAPITALES;
    case 'quimica':
      return QUIMICA;
    case 'animales':
      return ANIMALES;
    case 'comida':
      return COMIDA;
    case 'navidad':
      return NAVIDAD;
    default:
      return [];
  }
}
