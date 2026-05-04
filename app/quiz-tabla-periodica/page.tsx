'use client';
// @disclaimer: exempt

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QuizTablaPeriodica.module.css';

type Categoria = 'numero-atomico' | 'grupo-periodo' | 'propiedades' | 'familia' | 'curiosidad';
type Fase = 'inicio' | 'jugando' | 'resultado';

interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
  categoria: Categoria;
}

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  'numero-atomico': '⚛️ Número atómico',
  'grupo-periodo': '📊 Grupo y período',
  'propiedades': '🔬 Propiedades',
  'familia': '🧩 Familias',
  'curiosidad': '💡 Curiosidades',
};

const BANCO_PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    pregunta: '¿Cuál es el número atómico del Oro (Au)?',
    opciones: ['47', '79', '82', '29'],
    correcta: 1,
    explicacion: 'El Oro (Au) tiene número atómico 79. El 47 es la Plata (Ag), el 82 es el Plomo (Pb) y el 29 es el Cobre (Cu).',
    categoria: 'numero-atomico',
  },
  {
    id: 2,
    pregunta: '¿Qué elemento tiene número atómico 1?',
    opciones: ['Helio', 'Litio', 'Hidrógeno', 'Berilio'],
    correcta: 2,
    explicacion: 'El Hidrógeno (H) es el primer elemento de la tabla periódica. Es el más ligero y el más abundante del universo.',
    categoria: 'numero-atomico',
  },
  {
    id: 3,
    pregunta: '¿Cuál es el número atómico del Hierro (Fe)?',
    opciones: ['24', '26', '28', '30'],
    correcta: 1,
    explicacion: 'El Hierro (Fe, del latín "ferrum") tiene número atómico 26. Es el elemento más abundante en la Tierra por masa total.',
    categoria: 'numero-atomico',
  },
  {
    id: 4,
    pregunta: '¿Qué elemento tiene número atómico 6?',
    opciones: ['Nitrógeno', 'Oxígeno', 'Carbono', 'Boro'],
    correcta: 2,
    explicacion: 'El Carbono (C) tiene número atómico 6. Es la base de toda la química orgánica y puede formar millones de compuestos distintos.',
    categoria: 'numero-atomico',
  },
  {
    id: 5,
    pregunta: '¿Cuál es el número atómico del Uranio (U)?',
    opciones: ['88', '90', '92', '94'],
    correcta: 2,
    explicacion: 'El Uranio (U) tiene número atómico 92. Es el elemento natural más pesado en cantidades significativas en la Tierra.',
    categoria: 'numero-atomico',
  },
  {
    id: 6,
    pregunta: '¿Qué elemento tiene número atómico 8?',
    opciones: ['Flúor', 'Nitrógeno', 'Oxígeno', 'Azufre'],
    correcta: 2,
    explicacion: 'El Oxígeno (O) tiene número atómico 8. Constituye el 21% de la atmósfera terrestre y es esencial para la respiración.',
    categoria: 'numero-atomico',
  },
  {
    id: 7,
    pregunta: '¿Cuál es el número atómico del Sodio (Na)?',
    opciones: ['9', '11', '13', '15'],
    correcta: 1,
    explicacion: 'El Sodio (Na, del latín "Natrium") tiene número atómico 11. Es un metal alcalino muy reactivo que reacciona con el agua.',
    categoria: 'numero-atomico',
  },
  {
    id: 8,
    pregunta: '¿Qué elemento tiene número atómico 2?',
    opciones: ['Litio', 'Berilio', 'Hidrógeno', 'Helio'],
    correcta: 3,
    explicacion: 'El Helio (He) tiene número atómico 2. Es el segundo elemento más abundante del universo y el gas noble más ligero.',
    categoria: 'numero-atomico',
  },
  {
    id: 9,
    pregunta: '¿A qué grupo pertenece el Carbono (C)?',
    opciones: ['Grupo 12', 'Grupo 14', 'Grupo 16', 'Grupo 18'],
    correcta: 1,
    explicacion: 'El Carbono pertenece al Grupo 14. Comparte grupo con el Silicio (Si), Germanio (Ge), Estaño (Sn) y Plomo (Pb).',
    categoria: 'grupo-periodo',
  },
  {
    id: 10,
    pregunta: '¿En qué período se encuentra el Sodio (Na)?',
    opciones: ['Período 1', 'Período 2', 'Período 3', 'Período 4'],
    correcta: 2,
    explicacion: 'El Sodio está en el Período 3, junto al Magnesio, Aluminio, Silicio, Fósforo, Azufre, Cloro y Argón.',
    categoria: 'grupo-periodo',
  },
  {
    id: 11,
    pregunta: '¿A qué grupo pertenecen los Gases Nobles?',
    opciones: ['Grupo 1', 'Grupo 7', 'Grupo 17', 'Grupo 18'],
    correcta: 3,
    explicacion: 'Los Gases Nobles (He, Ne, Ar, Kr, Xe, Rn) pertenecen al Grupo 18. Tienen la capa de valencia completa, lo que los hace extremadamente poco reactivos.',
    categoria: 'grupo-periodo',
  },
  {
    id: 12,
    pregunta: '¿A qué grupo pertenecen los Halógenos?',
    opciones: ['Grupo 1', 'Grupo 7', 'Grupo 17', 'Grupo 18'],
    correcta: 2,
    explicacion: 'Los Halógenos (F, Cl, Br, I, At) pertenecen al Grupo 17. Son los no metales más reactivos y tienden a ganar un electrón.',
    categoria: 'grupo-periodo',
  },
  {
    id: 13,
    pregunta: '¿En qué período se encuentran los Lantánidos?',
    opciones: ['Período 4', 'Período 5', 'Período 6', 'Período 7'],
    correcta: 2,
    explicacion: 'Los Lantánidos (La al Lu, números atómicos 57-71) corresponden al Período 6, aunque se muestran separados al pie de la tabla por cuestiones de espacio.',
    categoria: 'grupo-periodo',
  },
  {
    id: 14,
    pregunta: '¿A qué grupo pertenecen los Metales Alcalinos?',
    opciones: ['Grupo 1', 'Grupo 2', 'Grupo 11', 'Grupo 17'],
    correcta: 0,
    explicacion: 'Los Metales Alcalinos (Li, Na, K, Rb, Cs, Fr) pertenecen al Grupo 1. Son los metales más reactivos y reaccionan violentamente con el agua.',
    categoria: 'grupo-periodo',
  },
  {
    id: 15,
    pregunta: '¿En qué período se encuentra el Hierro (Fe)?',
    opciones: ['Período 3', 'Período 4', 'Período 5', 'Período 6'],
    correcta: 1,
    explicacion: 'El Hierro está en el Período 4, junto a otros metales de transición importantes como el Cromo, Manganeso, Cobalto, Níquel y Cobre.',
    categoria: 'grupo-periodo',
  },
  {
    id: 16,
    pregunta: '¿Cuál es el metal más abundante en la corteza terrestre?',
    opciones: ['Hierro', 'Calcio', 'Aluminio', 'Sodio'],
    correcta: 2,
    explicacion: 'El Aluminio es el metal más abundante en la corteza terrestre (~8% en masa). El Oxígeno y Silicio son más abundantes pero no son metales.',
    categoria: 'propiedades',
  },
  {
    id: 17,
    pregunta: '¿Cuál es el elemento más electronegativo de la tabla periódica?',
    opciones: ['Oxígeno', 'Cloro', 'Nitrógeno', 'Flúor'],
    correcta: 3,
    explicacion: 'El Flúor (F) es el elemento más electronegativo (3,98 en la escala de Pauling). Esto lo hace extremadamente reactivo y oxidante.',
    categoria: 'propiedades',
  },
  {
    id: 18,
    pregunta: '¿Qué dos elementos son líquidos a temperatura ambiente (25°C)?',
    opciones: ['Mercurio y Galio', 'Mercurio y Bromo', 'Bromo y Cesio', 'Mercurio y Cesio'],
    correcta: 1,
    explicacion: 'Solo el Mercurio (metal) y el Bromo (no metal) son líquidos a 25°C. El Galio funde a 29,8°C y el Cesio a 28,5°C, muy cerca pero son sólidos.',
    categoria: 'propiedades',
  },
  {
    id: 19,
    pregunta: '¿Qué metal tiene el punto de fusión más alto de todos?',
    opciones: ['Platino', 'Osmio', 'Wolframio (Tungsteno)', 'Renio'],
    correcta: 2,
    explicacion: 'El Wolframio (W) tiene el punto de fusión más alto: 3.422°C. Por eso se usa en filamentos de bombillas incandescentes.',
    categoria: 'propiedades',
  },
  {
    id: 20,
    pregunta: '¿Cuál es el elemento más abundante en el universo?',
    opciones: ['Helio', 'Oxígeno', 'Hidrógeno', 'Carbono'],
    correcta: 2,
    explicacion: 'El Hidrógeno constituye aproximadamente el 75% de la masa del universo. Las estrellas como el Sol son principalmente Hidrógeno.',
    categoria: 'propiedades',
  },
  {
    id: 21,
    pregunta: '¿Cuál es el metal más ligero (menor densidad)?',
    opciones: ['Sodio', 'Potasio', 'Litio', 'Berilio'],
    correcta: 2,
    explicacion: 'El Litio (Li) es el metal más ligero con densidad 0,534 g/cm³, menor que la del agua. Puede flotar en agua y en aceite.',
    categoria: 'propiedades',
  },
  {
    id: 22,
    pregunta: '¿Cuál es el gas noble más abundante en la atmósfera terrestre?',
    opciones: ['Helio', 'Neón', 'Argón', 'Kriptón'],
    correcta: 2,
    explicacion: 'El Argón (Ar) constituye el 0,93% de la atmósfera. El Helio es muy escaso porque es tan ligero que acaba escapando al espacio.',
    categoria: 'propiedades',
  },
  {
    id: 23,
    pregunta: '¿Cuál de los siguientes NO es un Gas Noble?',
    opciones: ['Argón (Ar)', 'Kriptón (Kr)', 'Xenón (Xe)', 'Cloro (Cl)'],
    correcta: 3,
    explicacion: 'El Cloro (Cl) es un halógeno (Grupo 17), no un gas noble. Los gases nobles son He, Ne, Ar, Kr, Xe y Rn, todos en el Grupo 18.',
    categoria: 'familia',
  },
  {
    id: 24,
    pregunta: '¿Cuál de los siguientes es un Metaloide?',
    opciones: ['Sodio (Na)', 'Aluminio (Al)', 'Silicio (Si)', 'Cloro (Cl)'],
    correcta: 2,
    explicacion: 'El Silicio (Si) es un metaloide: propiedades intermedias entre metales y no metales. Es el fundamento de los semiconductores modernos.',
    categoria: 'familia',
  },
  {
    id: 25,
    pregunta: '¿Qué familia incluye al Flúor, Cloro, Bromo y Yodo?',
    opciones: ['Metales alcalinos', 'Gases nobles', 'Halógenos', 'Metales de transición'],
    correcta: 2,
    explicacion: 'Los Halógenos (Grupo 17) incluyen F, Cl, Br, I y At. "Halógeno" significa "productor de sal" porque reaccionan con metales para formarlas.',
    categoria: 'familia',
  },
  {
    id: 26,
    pregunta: '¿A qué familia pertenece el Hierro (Fe)?',
    opciones: ['Metales alcalinos', 'Metales alcalinotérreos', 'Metales de transición', 'Lantánidos'],
    correcta: 2,
    explicacion: 'El Hierro pertenece a los Metales de Transición (Grupos 3-12), junto al Cobre, Zinc, Plata, Oro y Platino, entre otros.',
    categoria: 'familia',
  },
  {
    id: 27,
    pregunta: '¿Cuál de estos elementos es un metal alcalinotérreo?',
    opciones: ['Potasio (K)', 'Calcio (Ca)', 'Aluminio (Al)', 'Manganeso (Mn)'],
    correcta: 1,
    explicacion: 'El Calcio (Ca) es un metal alcalinotérreo (Grupo 2). Los alcalinotérreos son Be, Mg, Ca, Sr, Ba y Ra.',
    categoria: 'familia',
  },
  {
    id: 28,
    pregunta: '¿Cuántos elementos forman el grupo de los Gases Nobles?',
    opciones: ['5', '6', '7', '8'],
    correcta: 1,
    explicacion: 'Los Gases Nobles son 6: Helio (He), Neón (Ne), Argón (Ar), Kriptón (Kr), Xenón (Xe) y Radón (Rn). El Oganesón (Og) es artificial.',
    categoria: 'familia',
  },
  {
    id: 29,
    pregunta: '¿Qué elemento da el color rojo a los fuegos artificiales?',
    opciones: ['Potasio', 'Estroncio', 'Bario', 'Cobre'],
    correcta: 1,
    explicacion: 'El Estroncio (Sr) produce llamas rojo brillante. El Bario produce verde, el Cobre azul-verde y el Potasio violeta.',
    categoria: 'curiosidad',
  },
  {
    id: 30,
    pregunta: '¿Cuál es el único metal líquido a temperatura ambiente estándar?',
    opciones: ['Galio', 'Cesio', 'Mercurio', 'Plomo'],
    correcta: 2,
    explicacion: 'El Mercurio (Hg) es el único metal líquido a 25°C. El Galio funde a 29,8°C y el Cesio a 28,5°C, muy cerca pero siguen siendo sólidos.',
    categoria: 'curiosidad',
  },
  {
    id: 31,
    pregunta: '¿Qué elemento es el principal componente de los chips modernos?',
    opciones: ['Germanio', 'Carbono', 'Silicio', 'Galio'],
    correcta: 2,
    explicacion: 'El Silicio (Si) es la base de la industria semiconductora. Los chips de ordenadores y teléfonos están fabricados con Silicio ultrapuro.',
    categoria: 'curiosidad',
  },
  {
    id: 32,
    pregunta: '¿Cuál fue el primer elemento sintético creado por el ser humano?',
    opciones: ['Plutonio', 'Tecnecio', 'Americio', 'Curio'],
    correcta: 1,
    explicacion: 'El Tecnecio (Tc, número atómico 43) fue el primer elemento creado artificialmente, en 1937. Su nombre viene del griego "technetos" (artificial).',
    categoria: 'curiosidad',
  },
  {
    id: 33,
    pregunta: '¿Qué elemento es esencial para la fotosíntesis y tiene símbolo Mg?',
    opciones: ['Manganeso', 'Molibdeno', 'Mercurio', 'Magnesio'],
    correcta: 3,
    explicacion: 'El Magnesio (Mg) es el átomo central de la molécula de clorofila. Sin él, las plantas no pueden captar energía solar para la fotosíntesis.',
    categoria: 'curiosidad',
  },
  {
    id: 34,
    pregunta: '¿Por qué el Wolframio tiene símbolo W?',
    opciones: [
      'Su nombre alemán es "Wolfram"',
      'Error histórico del IUPAC',
      'Abreviatura de "Wolfganium"',
      'Lo nombró el físico Wolfgang Pauli',
    ],
    correcta: 0,
    explicacion: 'El símbolo W viene del alemán "Wolfram", nombre con el que se conoce este elemento en Alemania y otros países. En inglés se llama Tungsten.',
    categoria: 'curiosidad',
  },
  {
    id: 35,
    pregunta: '¿Qué elemento da el color amarillo brillante a las llamas?',
    opciones: ['Potasio', 'Sodio', 'Litio', 'Calcio'],
    correcta: 1,
    explicacion: 'El Sodio (Na) produce llamas de color amarillo brillante e inconfundible. Esta es la base de las lámparas de vapor de sodio usadas en el alumbrado público.',
    categoria: 'curiosidad',
  },
  {
    id: 36,
    pregunta: '¿Qué gas se usa en los globos de helio de las fiestas?',
    opciones: ['Hidrógeno', 'Neón', 'Helio', 'Nitrógeno'],
    correcta: 2,
    explicacion: 'El Helio se usa en globos porque es más ligero que el aire y no inflamable. El Hidrógeno también elevaría los globos, pero es explosivo (desastre del Hindenburg, 1937).',
    categoria: 'curiosidad',
  },
  {
    id: 37,
    pregunta: '¿Cuál es el elemento más reactivo de todos?',
    opciones: ['Sodio', 'Potasio', 'Cesio', 'Flúor'],
    correcta: 3,
    explicacion: 'El Flúor (F) es el elemento más reactivo. Reacciona con casi cualquier sustancia, incluso con algunos gases nobles. Entre los metales, el Cesio y el Francio son los más reactivos.',
    categoria: 'curiosidad',
  },
  {
    id: 38,
    pregunta: '¿Qué elemento tiene el mayor número de isótopos estables?',
    opciones: ['Plomo', 'Estaño', 'Teluro', 'Xenón'],
    correcta: 1,
    explicacion: 'El Estaño (Sn) tiene 10 isótopos estables, más que cualquier otro elemento. Le sigue el Xenón con 9 isótopos estables.',
    categoria: 'curiosidad',
  },
  {
    id: 39,
    pregunta: '¿Cuál es el elemento con mayor punto de ebullición?',
    opciones: ['Platino', 'Renio', 'Wolframio (Tungsteno)', 'Osmio'],
    correcta: 2,
    explicacion: 'El Wolframio (W) tiene tanto el punto de fusión (3.422°C) como el de ebullición (5.555°C) más altos de todos los metales.',
    categoria: 'propiedades',
  },
  {
    id: 40,
    pregunta: '¿Qué elemento tiene mayor densidad de todos los sólidos?',
    opciones: ['Platino', 'Iridio', 'Osmio', 'Wolframio'],
    correcta: 2,
    explicacion: 'El Osmio (Os) tiene la mayor densidad de todos los elementos sólidos: 22,59 g/cm³. El Iridio es muy similar (22,56 g/cm³), ambos superan ampliamente al Plomo (11,3 g/cm³).',
    categoria: 'propiedades',
  },
];

const TOTAL_PREGUNTAS = 10;

function mezclarArray<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function QuizTablaPeriodicaPage() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState<boolean[]>([]);

  const pregunta = preguntas[indice];
  const haRespondido = seleccionada !== null;
  const totalAciertos = aciertos.filter(Boolean).length;

  function iniciarQuiz() {
    setPreguntas(mezclarArray(BANCO_PREGUNTAS).slice(0, TOTAL_PREGUNTAS));
    setIndice(0);
    setSeleccionada(null);
    setAciertos([]);
    setFase('jugando');
  }

  function responder(i: number) {
    if (haRespondido) return;
    setSeleccionada(i);
    setAciertos(prev => [...prev, i === pregunta.correcta]);
  }

  function siguiente() {
    if (indice + 1 >= TOTAL_PREGUNTAS) {
      setFase('resultado');
    } else {
      setIndice(p => p + 1);
      setSeleccionada(null);
    }
  }

  function getMensaje() {
    const pct = (totalAciertos / TOTAL_PREGUNTAS) * 100;
    if (pct >= 90) return { texto: '¡Experto en química!', emoji: '🏆' };
    if (pct >= 70) return { texto: '¡Muy buen nivel!', emoji: '🎯' };
    if (pct >= 50) return { texto: 'Buen intento, sigue practicando', emoji: '📚' };
    return { texto: 'La tabla periódica guarda muchos secretos', emoji: '🔬' };
  }

  const educativo = {
    intro: 'La tabla periódica organiza los 118 elementos conocidos según su número atómico, configuración electrónica y propiedades químicas recurrentes. Fue propuesta por Dmitri Mendeléiev en 1869 y hoy es la herramienta fundamental de toda la química.',
    tablaComparativa: [
      { aspecto: 'Grupos', descripcion: 'Columnas verticales (1-18). Elementos con propiedades similares y misma configuración de valencia.' },
      { aspecto: 'Períodos', descripcion: 'Filas horizontales (1-7). Elementos con el mismo número de capas electrónicas.' },
      { aspecto: 'Metales', descripcion: 'Conductores, brillantes, maleables. Ocupan la parte izquierda y central de la tabla.' },
      { aspecto: 'No metales', descripcion: 'Malos conductores, forman aniones. Parte superior derecha de la tabla.' },
      { aspecto: 'Metaloides', descripcion: 'Propiedades intermedias: B, Si, Ge, As, Sb, Te. Clave para semiconductores.' },
      { aspecto: 'Gases nobles', descripcion: 'Grupo 18. Capa de valencia completa, mínima reactividad.' },
    ],
    faq: [
      { pregunta: '¿Por qué algunos símbolos no coinciden con el nombre?', respuesta: 'Porque provienen del latín o del alemán, que eran las lenguas científicas cuando se descubrieron. Fe viene de "ferrum" (hierro en latín), Au de "aurum" (oro), Na de "Natrium" (sodio).' },
      { pregunta: '¿Cuántos elementos existen?', respuesta: 'Hay 118 elementos confirmados. Los 94 primeros se encuentran en la naturaleza (aunque algunos en cantidades ínfimas). Del 95 al 118 son sintéticos, creados en laboratorio.' },
      { pregunta: '¿Qué significa el número atómico?', respuesta: 'El número de protones en el núcleo del átomo. Es el identificador único de cada elemento: dos átomos con el mismo número atómico son siempre el mismo elemento.' },
      { pregunta: '¿Por qué los gases nobles son tan poco reactivos?', respuesta: 'Porque tienen la capa de valencia completa (8 electrones, o 2 en el caso del helio). No necesitan ganar ni perder electrones, así que no tienden a reaccionar.' },
      { pregunta: '¿Cuál es la diferencia entre un grupo y una familia?', respuesta: 'Son lo mismo: los elementos de un mismo grupo (columna) forman una familia química. Las familias más conocidas tienen nombre propio: alcalinos, alcalinotérreos, halógenos, gases nobles.' },
    ],
    pasos: [
      { titulo: 'Empieza por los grupos', descripcion: 'Aprende los 4 grupos con nombre propio: alcalinos (G1), alcalinotérreos (G2), halógenos (G17) y gases nobles (G18).' },
      { titulo: 'Aprende los símbolos irregulares', descripcion: 'Memoriza los que no coinciden con el nombre español: Fe, Au, Ag, Cu, Pb, Na, K, Hg, Sn, W.' },
      { titulo: 'Relaciona propiedades con posición', descripcion: 'Los metales están a la izquierda, los no metales a la derecha, los metaloides en la frontera. La reactividad aumenta hacia los extremos de cada período.' },
      { titulo: 'Usa la mnemotecnia', descripcion: 'Para los alcalinos (Li Na K Rb Cs Fr): "LiNa Conoce Rubios Con Frecuencia". Para los halógenos (F Cl Br I At): "Flor Clemente Brilla Intensamente".' },
      { titulo: 'Practica con contexto', descripcion: 'Asocia cada elemento con algo cotidiano: el Na de la sal, el Fe de las sartenes, el Si del móvil, el C de la vida, el O que respiras.' },
    ],
    tips: [
      { titulo: 'El número atómico es clave', descripcion: 'Si sabes el número atómico, sabes el elemento. Del 1 al 20, merece la pena memorizarlos todos.' },
      { titulo: 'Los períodos marcan las capas', descripcion: 'El período indica cuántas capas electrónicas tiene el átomo. Período 3 = 3 capas. Útil para entender el tamaño del átomo.' },
      { titulo: 'Tendencias periódicas', descripcion: 'La electronegatividad aumenta hacia arriba y hacia la derecha. El tamaño atómico aumenta hacia abajo y hacia la izquierda.' },
      { titulo: 'Los metales de transición son predecibles', descripcion: 'Son todos metales, buenos conductores, con propiedades similares entre sí. No hay que memorizar cada uno: el contexto ayuda.' },
    ],
    errores: [
      { error: 'Confundir grupo con período', consecuencia: 'Los grupos son las columnas (verticales), los períodos son las filas (horizontales).' },
      { error: 'Pensar que todos los sólidos son metales', consecuencia: 'El Azufre, el Yodo, el Carbono y el Fósforo son sólidos no metálicos a temperatura ambiente.' },
      { error: 'Confundir número atómico con masa atómica', consecuencia: 'El número atómico (Z) cuenta protones. La masa atómica también incluye neutrones y por eso siempre es mayor.' },
      { error: 'Asumir que los gases nobles nunca reaccionan', consecuencia: 'El Xenón y el Kriptón sí forman compuestos en condiciones extremas. Solo el Helio y el Neón son verdaderamente inertes.' },
    ],
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>⚗️ Quiz Tabla Periódica</h1>
        <p className={styles.heroSubtitle}>
          40+ preguntas sobre elementos, grupos, propiedades y curiosidades
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {fase === 'inicio' && (
          <div className={styles.inicio}>
            <div className={styles.inicioCard}>
              <div className={styles.inicioEmoji}>🧪</div>
              <h2 className={styles.inicioTitulo}>¿Cuánto sabes de química?</h2>
              <p className={styles.inicioDesc}>
                {TOTAL_PREGUNTAS} preguntas aleatorias de un banco de {BANCO_PREGUNTAS.length}.
                Categorías: números atómicos, grupos, períodos, familias y curiosidades.
              </p>
              <div className={styles.categoriasBadges}>
                {(Object.entries(ETIQUETAS_CATEGORIA) as [Categoria, string][]).map(([cat, etiqueta]) => (
                  <span key={cat} className={styles.badge}>{etiqueta}</span>
                ))}
              </div>
              <button className={styles.btnPrimario} onClick={iniciarQuiz}>
                Empezar quiz →
              </button>
            </div>
          </div>
        )}

        {fase === 'jugando' && pregunta && (
          <div className={styles.quizArea}>
            <div className={styles.progreso}>
              <div className={styles.progresoInfo}>
                <span>Pregunta {indice + 1} de {TOTAL_PREGUNTAS}</span>
                <span className={styles.aciertosProgreso}>✓ {totalAciertos} aciertos</span>
              </div>
              <div className={styles.barraProgreso}>
                <div
                  className={styles.barraRelleno}
                  style={{ width: `${(indice / TOTAL_PREGUNTAS) * 100}%` }}
                />
              </div>
            </div>

            <div className={styles.preguntaCard}>
              <span className={styles.categoriaBadge}>
                {ETIQUETAS_CATEGORIA[pregunta.categoria]}
              </span>
              <p className={styles.preguntaTexto}>{pregunta.pregunta}</p>

              <div className={styles.opcionesGrid}>
                {pregunta.opciones.map((opcion, i) => {
                  let clase = styles.opcion;
                  if (haRespondido) {
                    if (i === pregunta.correcta) clase = `${styles.opcion} ${styles.opcionCorrecta}`;
                    else if (i === seleccionada) clase = `${styles.opcion} ${styles.opcionIncorrecta}`;
                    else clase = `${styles.opcion} ${styles.opcionApagada}`;
                  }
                  return (
                    <button
                      key={i}
                      className={clase}
                      onClick={() => responder(i)}
                      disabled={haRespondido}
                    >
                      <span className={styles.opcionLetra}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      {opcion}
                    </button>
                  );
                })}
              </div>

              {haRespondido && (
                <div className={`${styles.feedback} ${seleccionada === pregunta.correcta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}>
                  <p className={styles.feedbackResultado}>
                    {seleccionada === pregunta.correcta ? '✓ ¡Correcto!' : '✗ Incorrecto'}
                  </p>
                  <p className={styles.explicacion}>{pregunta.explicacion}</p>
                  <button className={styles.btnSiguiente} onClick={siguiente}>
                    {indice + 1 >= TOTAL_PREGUNTAS ? 'Ver resultados →' : 'Siguiente pregunta →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {fase === 'resultado' && (
          <div className={styles.resultado}>
            <div className={styles.resultadoCard}>
              <div className={styles.puntuacionCirculo}>
                <span className={styles.puntuacionNumero}>{totalAciertos}</span>
                <span className={styles.puntuacionTotal}>/{TOTAL_PREGUNTAS}</span>
              </div>
              <div className={styles.mensajeFinal}>
                <span className={styles.mensajeEmoji}>{getMensaje().emoji}</span>
                <p className={styles.mensajeTexto}>{getMensaje().texto}</p>
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{totalAciertos}</span>
                  <span className={styles.statLabel}>Aciertos</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{TOTAL_PREGUNTAS - totalAciertos}</span>
                  <span className={styles.statLabel}>Errores</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{Math.round((totalAciertos / TOTAL_PREGUNTAS) * 100)}%</span>
                  <span className={styles.statLabel}>Puntuación</span>
                </div>
              </div>
              <button className={styles.btnPrimario} onClick={iniciarQuiz}>
                Jugar otra vez
              </button>
            </div>
          </div>
        )}
      </main>

      <EducationalSection title="Todo sobre la Tabla Periódica" subtitle="Grupos, familias, propiedades y curiosidades de los 118 elementos">
        <p>{educativo.intro}</p>

        <h3>Estructura de la tabla periódica</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {educativo.tablaComparativa.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.aspecto}</strong></td>
                  <td>{item.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>¿A quién le viene bien este quiz?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon}>🎓</span>
            <h4>Estudiante de secundaria</h4>
            <p>Repasa grupos, períodos y propiedades antes del examen. Identifica las familias más importantes y sus características.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon}>🏆</span>
            <h4>Aficionado a la ciencia</h4>
            <p>Descubre curiosidades sorprendentes sobre los elementos: cuáles son líquidos, cuáles tienen símbolos irregulares y por qué.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon}>📚</span>
            <h4>Preparación oposiciones</h4>
            <p>Cultura científica general para temarios de oposiciones de primaria, secundaria o acceso a ciclos formativos de química.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          {educativo.faq.slice(0, 4).map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <p className={styles.faqTip}><strong>{item.pregunta}</strong></p>
              <p>{item.respuesta}</p>
            </div>
          ))}
        </div>

        <h3>Cómo mejorar tu nivel en química</h3>
        <div className={styles.stepGuide}>
          {educativo.pasos.slice(0, 4).map((paso, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <div className={styles.stepContent}>
                <strong>{paso.titulo}</strong>
                <p>{paso.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        <h3>Trucos para memorizar</h3>
        <div className={styles.tipsGrid}>
          {educativo.tips.map((tip, i) => (
            <div key={i} className={styles.tipCard}>
              <span className={styles.tipIcon}>💡</span>
              <strong>{tip.titulo}</strong>
              <p>{tip.descripcion}</p>
            </div>
          ))}
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes al estudiar la tabla periódica</strong>
          </div>
          <ul className={styles.warningList}>
            {educativo.errores.map((e, i) => (
              <li key={i}><strong>{e.error}:</strong> {e.consecuencia}</li>
            ))}
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-tabla-periodica')} />
      <ShareCard appName="quiz-tabla-periodica" />
      <Footer appName="quiz-tabla-periodica" />
    </div>
  );
}
