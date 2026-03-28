'use client';

import React, { useState } from 'react';
import styles from './SelectorEstiloDecoracion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type EstiloKey = 'moderno_minimalista' | 'clasico_tradicional' | 'industrial' | 'nordico' | 'mediterraneo';
type Pantalla = 'inicio' | 'test' | 'resultado';

interface PesosOpcion {
  moderno_minimalista: number;
  clasico_tradicional: number;
  industrial: number;
  nordico: number;
  mediterraneo: number;
}

interface OpcionPregunta {
  valor: string;
  etiqueta: string;
  descripcion: string;
  pesos: PesosOpcion;
}

interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: OpcionPregunta[];
}

interface EstiloInfo {
  icono: string;
  nombre: string;
  perfil: string;
  descripcion: string;
  ambiente: string;
  presupuesto: string;
  mantenimiento: string;
  elementosClave: string[];
  evitar: string[];
  consejos: string[];
}

interface ResultadoCalculo {
  estilo: EstiloKey;
  puntos: Record<EstiloKey, number>;
}

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 'paleta_colores',
    categoria: 'Paleta de Colores',
    icono: '🎨',
    texto: '¿Qué paleta de colores te atrae más para tu hogar?',
    opciones: [
      { valor: 'neutros', etiqueta: 'Blancos, grises y beiges puros', descripcion: 'Sobriedad, amplitud y luz', pesos: { moderno_minimalista: 3, clasico_tradicional: 1, industrial: 2, nordico: 3, mediterraneo: 0 } },
      { valor: 'calidos', etiqueta: 'Tonos cálidos: terracota, ocre, arena', descripcion: 'Calidez y conexión con la tierra', pesos: { moderno_minimalista: 0, clasico_tradicional: 2, industrial: 1, nordico: 1, mediterraneo: 3 } },
      { valor: 'oscuros', etiqueta: 'Colores oscuros y metálicos: negro, gris acero', descripcion: 'Carácter, contraste y modernidad urbana', pesos: { moderno_minimalista: 2, clasico_tradicional: 0, industrial: 3, nordico: 1, mediterraneo: 0 } },
      { valor: 'mediterraneos', etiqueta: 'Azul marino, blanco y toques de azulejo', descripcion: 'Frescura, luz y brisa mediterránea', pesos: { moderno_minimalista: 1, clasico_tradicional: 1, industrial: 0, nordico: 2, mediterraneo: 3 } },
    ],
  },
  {
    id: 'materiales',
    categoria: 'Materiales Favoritos',
    icono: '🪵',
    texto: '¿Qué materiales te gustan más en el mobiliario y la decoración?',
    opciones: [
      { valor: 'madera_clara', etiqueta: 'Madera clara, lacados y vidrio', descripcion: 'Ligero, funcional y natural', pesos: { moderno_minimalista: 2, clasico_tradicional: 1, industrial: 0, nordico: 3, mediterraneo: 1 } },
      { valor: 'madera_oscura', etiqueta: 'Madera oscura, mármol y tejidos ricos', descripcion: 'Elegancia, solidez y tradición', pesos: { moderno_minimalista: 0, clasico_tradicional: 3, industrial: 0, nordico: 0, mediterraneo: 1 } },
      { valor: 'metal_cemento', etiqueta: 'Metal, cemento y madera recuperada', descripcion: 'Textura cruda y aspecto urbano', pesos: { moderno_minimalista: 1, clasico_tradicional: 0, industrial: 3, nordico: 1, mediterraneo: 0 } },
      { valor: 'ceramica_natural', etiqueta: 'Cerámica artesanal, ratán y fibras naturales', descripcion: 'Artesanía, calidez y autenticidad', pesos: { moderno_minimalista: 0, clasico_tradicional: 2, industrial: 0, nordico: 1, mediterraneo: 3 } },
    ],
  },
  {
    id: 'orden_minimalismo',
    categoria: 'Orden y Minimalismo',
    icono: '🧹',
    texto: '¿Cómo te sientes respecto al orden y los objetos en casa?',
    opciones: [
      { valor: 'minimalista', etiqueta: 'Cuanto menos, mejor: cada objeto debe tener función', descripcion: 'Solo lo esencial, sin distracciones', pesos: { moderno_minimalista: 3, clasico_tradicional: 0, industrial: 2, nordico: 2, mediterraneo: 0 } },
      { valor: 'ordenado_funcional', etiqueta: 'Me gusta el orden pero con calidez y comodidad', descripcion: 'Funcional y acogedor a la vez', pesos: { moderno_minimalista: 1, clasico_tradicional: 1, industrial: 1, nordico: 3, mediterraneo: 1 } },
      { valor: 'muchos_detalles', etiqueta: 'Me gustan los detalles, colecciones y objetos con historia', descripcion: 'Cada rincón cuenta una historia', pesos: { moderno_minimalista: 0, clasico_tradicional: 3, industrial: 0, nordico: 0, mediterraneo: 2 } },
      { valor: 'natural_vivido', etiqueta: 'Me siento cómodo con un aspecto vivido y natural', descripcion: 'La imperfección tiene su encanto', pesos: { moderno_minimalista: 0, clasico_tradicional: 1, industrial: 1, nordico: 1, mediterraneo: 3 } },
    ],
  },
  {
    id: 'plantas_naturaleza',
    categoria: 'Naturaleza en Casa',
    icono: '🌿',
    texto: '¿Qué papel juegan las plantas y los elementos naturales en tu hogar ideal?',
    opciones: [
      { valor: 'protagonistas', etiqueta: 'Son protagonistas: muchas plantas, luz y vida', descripcion: 'La naturaleza integrada en cada espacio', pesos: { moderno_minimalista: 1, clasico_tradicional: 1, industrial: 0, nordico: 2, mediterraneo: 3 } },
      { valor: 'puntuales', etiqueta: 'Alguna planta de acento, sin exagerar', descripcion: 'Toques naturales bien situados', pesos: { moderno_minimalista: 2, clasico_tradicional: 2, industrial: 1, nordico: 3, mediterraneo: 2 } },
      { valor: 'flores_arreglos', etiqueta: 'Prefiero flores naturales y arreglos florales clásicos', descripcion: 'Tradición y elegancia floral', pesos: { moderno_minimalista: 0, clasico_tradicional: 3, industrial: 0, nordico: 1, mediterraneo: 2 } },
      { valor: 'sin_plantas', etiqueta: 'Prefiero prescindir de plantas, me complican el mantenimiento', descripcion: 'Simplicidad total', pesos: { moderno_minimalista: 2, clasico_tradicional: 0, industrial: 3, nordico: 0, mediterraneo: 0 } },
    ],
  },
  {
    id: 'iluminacion',
    categoria: 'Tipo de Iluminación',
    icono: '💡',
    texto: '¿Qué tipo de iluminación prefieres en tu hogar?',
    opciones: [
      { valor: 'tenue_calida', etiqueta: 'Luz tenue, cálida y envolvente con muchos puntos', descripcion: 'Atmósfera acogedora y hogareña', pesos: { moderno_minimalista: 1, clasico_tradicional: 2, industrial: 1, nordico: 3, mediterraneo: 2 } },
      { valor: 'natural_maxima', etiqueta: 'Máxima luz natural: ventanas grandes y espacios luminosos', descripcion: 'Claridad, apertura y frescor', pesos: { moderno_minimalista: 3, clasico_tradicional: 0, industrial: 1, nordico: 2, mediterraneo: 3 } },
      { valor: 'lamparas_diseno', etiqueta: 'Lámparas de diseño como elemento decorativo protagonista', descripcion: 'La lámpara como pieza de arte', pesos: { moderno_minimalista: 2, clasico_tradicional: 1, industrial: 3, nordico: 2, mediterraneo: 0 } },
      { valor: 'aranas_clasicas', etiqueta: 'Arañas y lámparas clásicas con ornamentos', descripcion: 'Grandiosidad y tradición luminosa', pesos: { moderno_minimalista: 0, clasico_tradicional: 3, industrial: 0, nordico: 0, mediterraneo: 1 } },
    ],
  },
  {
    id: 'contrastes',
    categoria: 'Contrastes y Carácter',
    icono: '⚡',
    texto: '¿Te gustan los contrastes fuertes y los espacios con carácter visual?',
    opciones: [
      { valor: 'contrastes_fuertes', etiqueta: 'Sí, me gustan los contrastes llamativos y la personalidad', descripcion: 'Negro sobre blanco, metal sobre madera rústica', pesos: { moderno_minimalista: 1, clasico_tradicional: 0, industrial: 3, nordico: 1, mediterraneo: 1 } },
      { valor: 'armonia_suave', etiqueta: 'Prefiero la armonía: tonos que se complementan suavemente', descripcion: 'Cohesión visual y serenidad', pesos: { moderno_minimalista: 2, clasico_tradicional: 2, industrial: 0, nordico: 3, mediterraneo: 2 } },
      { valor: 'color_vibrante', etiqueta: 'Me gustan los colores vivos en detalles puntuales', descripcion: 'Cojines, cerámica o azulejos con color', pesos: { moderno_minimalista: 0, clasico_tradicional: 1, industrial: 0, nordico: 0, mediterraneo: 3 } },
      { valor: 'dorados_ornamentos', etiqueta: 'Me atraen los dorados, molduras y ornamentos elegantes', descripcion: 'Lujo clásico con detalles recargados', pesos: { moderno_minimalista: 0, clasico_tradicional: 3, industrial: 0, nordico: 0, mediterraneo: 1 } },
    ],
  },
  {
    id: 'antiguedades_moderno',
    categoria: 'Antigüedades vs Diseño Moderno',
    icono: '🏺',
    texto: '¿Prefieres antigüedades y piezas con historia o mobiliario moderno y de diseño?',
    opciones: [
      { valor: 'disenio_puro', etiqueta: 'Mobiliario de diseño contemporáneo y líneas actuales', descripcion: 'Modernidad, innovación y tendencia', pesos: { moderno_minimalista: 3, clasico_tradicional: 0, industrial: 2, nordico: 3, mediterraneo: 0 } },
      { valor: 'antiguedades', etiqueta: 'Antigüedades, muebles heredados y piezas únicas con historia', descripcion: 'Herencia, alma y autenticidad', pesos: { moderno_minimalista: 0, clasico_tradicional: 3, industrial: 1, nordico: 0, mediterraneo: 2 } },
      { valor: 'industrial_recuperado', etiqueta: 'Piezas industriales y materiales recuperados o vintage', descripcion: 'Reciclado, carácter urbano y originalidad', pesos: { moderno_minimalista: 1, clasico_tradicional: 0, industrial: 3, nordico: 1, mediterraneo: 0 } },
      { valor: 'artesania', etiqueta: 'Artesanía local, cerámica pintada a mano y tejidos tradicionales', descripcion: 'Raíces, cultura y calidez artesanal', pesos: { moderno_minimalista: 0, clasico_tradicional: 2, industrial: 0, nordico: 1, mediterraneo: 3 } },
    ],
  },
  {
    id: 'tipo_vivienda',
    categoria: 'Tipo de Vivienda',
    icono: '🏠',
    texto: '¿Cuál de estos describe mejor tu vivienda o tu hogar ideal?',
    opciones: [
      { valor: 'piso_urbano', etiqueta: 'Piso urbano en ciudad, práctico y optimizado', descripcion: 'Eficiencia en cada metro cuadrado', pesos: { moderno_minimalista: 3, clasico_tradicional: 0, industrial: 3, nordico: 2, mediterraneo: 0 } },
      { valor: 'casa_campo', etiqueta: 'Casa de campo o pueblo con jardín y espacio', descripcion: 'Amplitud, naturaleza y tranquilidad', pesos: { moderno_minimalista: 0, clasico_tradicional: 2, industrial: 0, nordico: 1, mediterraneo: 3 } },
      { valor: 'atico_moderno', etiqueta: 'Ático o loft con techos altos y vistas', descripcion: 'Apertura, luz y altura como valor', pesos: { moderno_minimalista: 2, clasico_tradicional: 0, industrial: 3, nordico: 2, mediterraneo: 1 } },
      { valor: 'casa_clasica', etiqueta: 'Casa clásica con molduras, parqué y techos altos', descripcion: 'Arquitectura con historia y elegancia', pesos: { moderno_minimalista: 0, clasico_tradicional: 3, industrial: 0, nordico: 0, mediterraneo: 1 } },
    ],
  },
  {
    id: 'referencias_culturales',
    categoria: 'Referencias Culturales',
    icono: '✈️',
    texto: '¿Qué referencias culturales o de viajes te inspiran más?',
    opciones: [
      { valor: 'escandinavia', etiqueta: 'Escandinavia: diseño funcional, naturaleza y silencio', descripcion: 'Hygge, sostenibilidad y simplicidad nórdica', pesos: { moderno_minimalista: 2, clasico_tradicional: 0, industrial: 0, nordico: 3, mediterraneo: 0 } },
      { valor: 'mediterraneo_sur', etiqueta: 'Sur de Europa: Grecia, Italia, costa española', descripcion: 'Colores, sol, cerámica y vida al aire libre', pesos: { moderno_minimalista: 0, clasico_tradicional: 1, industrial: 0, nordico: 0, mediterraneo: 3 } },
      { valor: 'new_york_chicago', etiqueta: 'Nueva York o Chicago: loft industrial, ciudad que nunca duerme', descripcion: 'Energía urbana, acero y ladrillos', pesos: { moderno_minimalista: 1, clasico_tradicional: 0, industrial: 3, nordico: 0, mediterraneo: 0 } },
      { valor: 'paris_clasico', etiqueta: 'París o ciudades europeas clásicas: moldings y elegancia', descripcion: 'Haussmann, antigüedades y refinamiento', pesos: { moderno_minimalista: 1, clasico_tradicional: 3, industrial: 0, nordico: 1, mediterraneo: 1 } },
    ],
  },
  {
    id: 'funcionalidad_estetica',
    categoria: 'Funcionalidad vs Estética',
    icono: '⚖️',
    texto: '¿Qué priorizas más a la hora de decorar?',
    opciones: [
      { valor: 'funcionalidad_primero', etiqueta: 'La funcionalidad ante todo: si no sirve, no entra', descripcion: 'Practicidad máxima y cero despilfarro espacial', pesos: { moderno_minimalista: 3, clasico_tradicional: 0, industrial: 2, nordico: 3, mediterraneo: 0 } },
      { valor: 'estetica_primero', etiqueta: 'La estética manda: prefiero algo bonito aunque sea incómodo', descripcion: 'La belleza visual como prioridad absoluta', pesos: { moderno_minimalista: 2, clasico_tradicional: 3, industrial: 1, nordico: 0, mediterraneo: 1 } },
      { valor: 'equilibrio', etiqueta: 'Busco el equilibrio: funcional Y bonito al mismo tiempo', descripcion: 'La forma debe seguir a la función con gracia', pesos: { moderno_minimalista: 2, clasico_tradicional: 2, industrial: 2, nordico: 3, mediterraneo: 2 } },
      { valor: 'confort_sensaciones', etiqueta: 'El confort y las sensaciones: que me haga sentir bien', descripcion: 'Bienestar emocional y atmósfera acogedora', pesos: { moderno_minimalista: 0, clasico_tradicional: 1, industrial: 0, nordico: 3, mediterraneo: 3 } },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos de estilos decorativos
// ─────────────────────────────────────────────

const ESTILOS: Record<EstiloKey, EstiloInfo> = {
  moderno_minimalista: {
    icono: '⬜',
    nombre: 'Moderno / Minimalista',
    perfil: 'Limpio · Funcional · Sofisticado',
    descripcion: 'Tu hogar es tu santuario de orden y claridad. Apuestas por líneas limpias, materiales de calidad y un mobiliario cuidadosamente seleccionado. Cada pieza justifica su presencia y la luz juega un papel protagonista.',
    ambiente: 'Espacioso, luminoso y sereno',
    presupuesto: 'Medio-alto — calidad sobre cantidad',
    mantenimiento: 'Fácil — pocos objetos, fácil de limpiar',
    elementosClave: ['Mobiliario de diseño con líneas rectas y materiales nobles', 'Paleta neutra: blancos, grises y madera lacada', 'Almacenaje oculto y soluciones integradas', 'Una pieza de arte o escultura como foco visual', 'Tejidos de calidad: lino, algodón o lana en tonos naturales', 'Iluminación minimalista con LEDs empotrados o lámparas de diseño'],
    evitar: ['Recargos decorativos y objetos sin función', 'Alfombras con estampados llamativos', 'Colores saturados en paredes', 'Muebles con ornamentos o tallas'],
    consejos: ['Invierte en una sola pieza de mobiliario de alta calidad antes que en muchas baratas', 'Usa el principio "uno entra, uno sale" para mantener el orden', 'El almacenaje oculto es tu mejor aliado — haz que desaparezca el caos', 'Juega con texturas dentro de la misma gama de color para dar profundidad', 'Una planta solitaria y bien elegida añade vida sin romper la armonía'],
  },
  clasico_tradicional: {
    icono: '🏛️',
    nombre: 'Clásico / Tradicional',
    perfil: 'Elegante · Atemporal · Con historia',
    descripcion: 'Valoras la herencia, la calidad artesanal y la decoración con alma. Los muebles de madera maciza, los tejidos ricos y los detalles ornamentales crean un hogar que parece tener vidas anteriores y que mejora con el tiempo.',
    ambiente: 'Cálido, sofisticado y acogedor con historia',
    presupuesto: 'Variable — inversión en piezas duraderas',
    mantenimiento: 'Moderado — los materiales nobles requieren cuidado',
    elementosClave: ['Muebles de madera oscura con detalles tallados', 'Tejidos ricos: terciopelo, damasco, seda o lana', 'Alfombras persas o con estampados clásicos', 'Espejos con marcos dorados o de madera labrada', 'Porcelana, cristalería y objetos decorativos con historia', 'Lámparas con pantallas y arañas de cristal'],
    evitar: ['Materiales industriales como el metal crudo', 'Paredes de hormigón o ladrillo visto', 'Mobiliario escandinavo o de líneas muy rectas', 'Colores fríos como azul acero o gris cemento'],
    consejos: ['Mezcla generaciones: un mueble heredado con tapicería nueva es un tesoro', 'Los libros son parte de la decoración — invierte en una librería protagonista', 'Las velas y los portavelas añaden calidez sin coste', 'El papel pintado con motivos clásicos en un solo paramento transforma la habitación', 'Las antigüedades de mercado de segunda mano son tesoros accesibles'],
  },
  industrial: {
    icono: '🏭',
    nombre: 'Industrial / Urbano',
    perfil: 'Auténtico · Urbano · Contrastado',
    descripcion: 'Tu estilo refleja carácter y originalidad. El ladrillo visto, el metal negro, la madera recuperada y los espacios abiertos crean una atmósfera urbana y auténtica donde cada imperfección es un detalle de diseño.',
    ambiente: 'Dinámico, con carácter y espacios abiertos',
    presupuesto: 'Medio — los materiales en bruto son accesibles',
    mantenimiento: 'Bajo — las marcas y el desgaste se integran en el estilo',
    elementosClave: ['Ladrillo visto o faux brique en algún paramento', 'Estructura metálica negra en estanterías, mesas y marcos', 'Madera recuperada o envejecida con veta pronunciada', 'Techos altos con vigas o conductos de climatización vistos', 'Iluminación colgante tipo filamento Edison o bombillas vintage', 'Cuero, lona y materiales rugosos en el tapizado'],
    evitar: ['Colores pastel o paletas demasiado suaves', 'Mobiliario recargado o con ornamentos dorados', 'Tejidos demasiado delicados: seda, organza o encaje', 'Decoración excesivamente femenina o romántica'],
    consejos: ['Una pared de ladrillo visto o pintada en gris oscuro es el punto de partida perfecto', 'Las lámparas de techo colgantes con bombillas Edison son baratas y muy efectivas', 'Mezcla metal negro con madera clara para equilibrar la dureza', 'Las plantas de gran tamaño contrastan perfectamente con la estética industrial', 'Un sofá Chester en cuero añade un toque de lujo controlado'],
  },
  nordico: {
    icono: '🌲',
    nombre: 'Nórdico / Escandinavo',
    perfil: 'Funcional · Acogedor · Natural',
    descripcion: 'Tu hogar busca el equilibrio perfecto entre funcionalidad y calidez. Inspirado en el concepto nórdico de "hygge", cada espacio está pensado para ser cómodo, práctico y acogedor, con materiales naturales y una luz perfectamente estudiada.',
    ambiente: 'Acogedor, sereno y funcionalmente bello',
    presupuesto: 'Accesible — diseño democrático y duradero',
    mantenimiento: 'Muy fácil — materiales resistentes y fáciles de limpiar',
    elementosClave: ['Madera clara: roble, fresno o pino en suelos y mobiliario', 'Paleta de blancos, grises suaves y tonos naturales', 'Textiles cálidos: mantas de lana, cojines de pelo y alfombras gruesas', 'Velas y puntos de luz cálida en invierno', 'Plantas en macetas blancas o de cerámica simple', 'Muebles multifunción con almacenaje integrado'],
    evitar: ['Colores saturados en grandes superficies', 'Ornamentos excesivos y objetos sin función', 'Materiales industriales puros como el metal crudo y el cemento', 'Iluminación fría o fluorescente'],
    consejos: ['El concepto "hygge" va más allá de la estética: es crear momentos de bienestar', 'Una manta bien colocada en el sofá es el toque nórdico más sencillo', 'Invierte en una buena alfombra — define el espacio y aporta calidez acústica', 'Los marcos de fotos en serie con imágenes de naturaleza son low cost y efectivos', 'La madera en suelos y techos es la inversión que más transforma un espacio'],
  },
  mediterraneo: {
    icono: '🌊',
    nombre: 'Mediterráneo',
    perfil: 'Cálido · Colorido · Vital y natural',
    descripcion: 'Tu hogar es una celebración de la vida al sur. Colores vivos, cerámica artesanal, tejidos de lino y algodón, plantas generosas y una luz natural abundante crean un ambiente que invita a vivir hacia afuera y a disfrutar de cada momento.',
    ambiente: 'Vital, luminoso y lleno de color y textura',
    presupuesto: 'Accesible — la artesanía local es abundante y económica',
    mantenimiento: 'Fácil — materiales naturales resistentes',
    elementosClave: ['Azulejos de colores o con motivos tradicionales en cocina y baño', 'Cerámica pintada a mano en vajillas, jarrones y macetas', 'Tejidos de lino, algodón y esparto en blanco, azul y terracota', 'Plantas abundantes: buganvilla, geranios, lavanda y oliveras', 'Ventanas grandes con contraventanas de madera pintadas en color', 'Mesas y sillas de exterior con hierro forjado o madera pintada'],
    evitar: ['Paletas demasiado frías o monocromáticas', 'Materiales sintéticos en abundancia', 'Espacios cerrados sin conexión con el exterior', 'Decoración demasiado minimalista o aséptica'],
    consejos: ['Los azulejos de colores en un solo paramento transforman cualquier cocina o baño', 'Una maceta grande con una planta mediterránea junto a la entrada define el carácter del hogar', 'Los tejidos en azul y blanco nunca fallan — cojines, toallas o mantelería', 'La iluminación cálida y abundante velas crean el ambiente de una noche de verano', 'Compra en mercados de artesanía local: cada pieza única cuenta una historia'],
  },
};

// ─────────────────────────────────────────────
// Función de cálculo
// ─────────────────────────────────────────────

function calcularEstilo(respuestas: Record<string, string>): ResultadoCalculo {
  const puntos: Record<EstiloKey, number> = {
    moderno_minimalista: 0,
    clasico_tradicional: 0,
    industrial: 0,
    nordico: 0,
    mediterraneo: 0,
  };

  PREGUNTAS.forEach((pregunta) => {
    const valorSeleccionado = respuestas[pregunta.id];
    if (!valorSeleccionado) return;
    const opcion = pregunta.opciones.find((o) => o.valor === valorSeleccionado);
    if (!opcion) return;
    (Object.keys(opcion.pesos) as EstiloKey[]).forEach((estilo) => {
      puntos[estilo] += opcion.pesos[estilo];
    });
  });

  const estiloGanador = (Object.keys(puntos) as EstiloKey[]).reduce((a, b) =>
    puntos[a] >= puntos[b] ? a : b
  );

  return { estilo: estiloGanador, puntos };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorEstiloDecoracion() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaActual = respuestas[pregunta?.id] ?? '';

  function iniciarTest() {
    setRespuestas({});
    setPreguntaActual(0);
    setResultado(null);
    setPantalla('test');
  }

  function seleccionarOpcion(valor: string) {
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: valor }));
  }

  function irAnterior() {
    if (preguntaActual > 0) setPreguntaActual((p) => p - 1);
    else setPantalla('inicio');
  }

  function irSiguiente() {
    if (!respuestaActual) return;
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((p) => p + 1);
    } else {
      const calc = calcularEstilo(respuestas);
      setResultado(calc);
      setPantalla('resultado');
    }
  }

  const estiloInfo = resultado ? ESTILOS[resultado.estilo] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ───────────────────────────────────────────────── */}
      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>Selector de Estilo de Decoración</h1>
          <p className={styles.heroSubtitle}>
            Descubre qué estilo decorativo se adapta mejor a tu personalidad en 10 preguntas
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu Estilo Decorativo</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tus respuestas</p>
        </header>
      )}

      <LegalNotice />

      {/* ── Pantalla: inicio ───────────────────────────────────── */}
      {pantalla === 'inicio' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid}>
              <span className={styles.introIcon} aria-hidden="true">⬜</span>
              <span className={styles.introIcon} aria-hidden="true">🏛️</span>
              <span className={styles.introIcon} aria-hidden="true">🌲</span>
              <span className={styles.introIcon} aria-hidden="true">🌊</span>
            </div>
            <h2 className={styles.introTitulo}>¿Qué estilo decorativo es el tuyo?</h2>
            <p className={styles.introDesc}>
              Responde 10 preguntas sobre tus preferencias de color, materiales, orden y referencias
              culturales para descubrir si tu hogar ideal es moderno minimalista, clásico tradicional,
              industrial, nórdico o mediterráneo.
            </p>
            <ul className={styles.introFeatures}>
              <li><span>🎨</span>Paleta de colores y materiales preferidos</li>
              <li><span>🧹</span>Actitud ante el orden y el minimalismo</li>
              <li><span>💡</span>Tipo de iluminación y ambiente</li>
              <li><span>✈️</span>Referencias culturales que te inspiran</li>
              <li><span>⚖️</span>Funcionalidad vs. estética</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={iniciarTest}>
              Comenzar el test — 10 preguntas
            </button>
          </div>
        </div>
      )}

      {/* ── Pantalla: test ─────────────────────────────────────── */}
      {pantalla === 'test' && pregunta && (
        <div className={styles.quiz}>
          {/* Progreso */}
          <div className={styles.progresoWrap} role="progressbar" aria-valuenow={preguntaActual + 1} aria-valuemin={1} aria-valuemax={totalPreguntas}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {preguntaActual + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{pregunta.categoria}</span>
            </div>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoRelleno}
                style={{ width: `${((preguntaActual + 1) / totalPreguntas) * 100}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <span className={styles.preguntaIcon} aria-hidden="true">{pregunta.icono}</span>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>
            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
              {pregunta.opciones.map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  className={`${styles.opcion}${respuestaActual === opcion.valor ? ` ${styles.seleccionada}` : ''}`}
                  onClick={() => seleccionarOpcion(opcion.valor)}
                  aria-pressed={respuestaActual === opcion.valor}
                >
                  <span className={styles.opcionEtiqueta}>{opcion.etiqueta}</span>
                  <span className={styles.opcionDesc}>{opcion.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={irAnterior}>
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={irSiguiente}
              disabled={!respuestaActual}
            >
              {preguntaActual < totalPreguntas - 1 ? 'Siguiente →' : 'Ver mi estilo →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Pantalla: resultado ────────────────────────────────── */}
      {pantalla === 'resultado' && resultado && estiloInfo && (
        <div className={styles.resultado}>
          {/* Tarjeta principal */}
          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcon} aria-hidden="true">{estiloInfo.icono}</span>
            <p className={styles.resultadoLabel}>Tu estilo decorativo ideal</p>
            <h2 className={styles.resultadoNombre}>{estiloInfo.nombre}</h2>
            <p className={styles.resultadoPerfil}>{estiloInfo.perfil}</p>
            <p className={styles.resultadoDesc}>{estiloInfo.descripcion}</p>
          </div>

          {/* Stats: ambiente, presupuesto, mantenimiento */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Ambiente</p>
              <p className={styles.statValor}>{estiloInfo.ambiente}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Presupuesto</p>
              <p className={styles.statValor}>{estiloInfo.presupuesto}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Mantenimiento</p>
              <p className={styles.statValor}>{estiloInfo.mantenimiento}</p>
            </div>
          </div>

          {/* Elementos clave */}
          <div className={styles.elementosSection}>
            <p className={styles.elementosTitulo}>Elementos clave de tu estilo</p>
            {estiloInfo.elementosClave.map((elemento, i) => (
              <p key={i} className={styles.elementoItem}>{elemento}</p>
            ))}
          </div>

          {/* Evitar */}
          <div className={styles.evitarSection}>
            <p className={styles.evitarTitulo}>Elementos que no encajan con tu estilo</p>
            {estiloInfo.evitar.map((item, i) => (
              <p key={i} className={styles.evitarItem}>{item}</p>
            ))}
          </div>

          {/* Consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>💡 Consejos para empezar</p>
            {estiloInfo.consejos.map((consejo, i) => (
              <p key={i} className={styles.consejoItem}>{consejo}</p>
            ))}
          </div>

          {/* Warning box (indicador v2.0) */}
          <div className={styles.warningBox} role="note">
            <strong>Nota:</strong> Este selector es una orientación basada en tus preferencias declaradas. El estilo decorativo ideal depende también de la arquitectura de tu vivienda, tu presupuesto real y las posibilidades de reforma. Consulta con un interiorista antes de tomar decisiones de reforma importantes.
          </div>

          <button type="button" className={styles.btnRepetir} onClick={iniciarTest}>
            Repetir el test
          </button>
        </div>
      )}

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <DisclaimerCard variant="general" severity="low" />

      {/* ── Contenido educativo ────────────────────────────────── */}
      <EducationalSection
        title="Guía de Estilos Decorativos"
        subtitle="Aprende a identificar y mezclar estilos en tu hogar"
      >
        <h3>Los 5 grandes estilos de decoración de interiores</h3>
        <p>
          La decoración de interiores no sigue reglas fijas, pero existen corrientes que han definido
          tendencias duraderas. Conocer los pilares de cada estilo te ayuda a tomar decisiones más
          coherentes y a evitar resultados inconsistentes.
        </p>

        <h4>Moderno / Minimalista</h4>
        <p>
          Nace a principios del siglo XX con el movimiento Bauhaus alemán y el lema "less is more" de
          Mies van der Rohe. Prioriza la función, elimina el ornamento y confía en la calidad de los
          materiales y la proporción de los espacios. La paleta es neutra, los muebles son escasos pero
          elegidos con criterio, y la luz natural es el elemento decorativo principal.
        </p>

        <h4>Clásico / Tradicional</h4>
        <p>
          Inspirado en los grandes periodos del diseño europeo (Luis XIV, Regencia, Victoriano, Biedermeier),
          el estilo clásico apuesta por la permanencia, la artesanía y los materiales nobles. Los muebles
          de madera maciza, las telas ricas y los objetos decorativos con historia crean espacios que
          parecen haber existido siempre.
        </p>

        <h4>Industrial / Urbano</h4>
        <p>
          Surge en los años 70 y 80 cuando artistas y creativos de Nueva York comenzaron a habitar
          antiguos almacenes y fábricas. El ladrillo visto, los conductos de ventilación a la vista, el
          metal negro y la madera recuperada son sus señas de identidad. La imperfección y la autenticidad
          de los materiales son valores, no defectos.
        </p>

        <h4>Nórdico / Escandinavo</h4>
        <p>
          El diseño escandinavo nació de la necesidad: los largos y oscuros inviernos del norte exigen
          interiores que compensen con calidez, luz y funcionalidad. El concepto danés "hygge" —bienestar,
          comodidad y momentos compartidos— es su filosofía de fondo. Madera clara, textiles cálidos,
          velas y un diseño democrático son sus pilares.
        </p>

        <h4>Mediterráneo</h4>
        <p>
          El estilo mediterráneo celebra la vida al aire libre, los colores naturales del mar y la tierra,
          y la artesanía local. Azulejos pintados a mano, cerámica de Talavera o provenzal, plantas generosas,
          telas de lino y algodón, y una luz natural abundante crean un ambiente vital y acogedor que
          conecta el interior con el exterior.
        </p>

        <h3>¿Se pueden mezclar estilos?</h3>
        <p>
          Absolutamente. Los interioristas profesionales raramente aplican un estilo puro: mezclan
          elementos de diferentes corrientes con coherencia. La clave es establecer un estilo dominante
          (70%) y añadir elementos de otro estilo como contraste o acento (30%). Por ejemplo, un fondo
          nórdico con algún elemento industrial o una base clásica con toques mediterráneos.
        </p>

        <h3>Cómo empezar a decorar sin cometer errores</h3>
        <p>
          La principal causa de interiores inconsistentes es comprar sin plan. Antes de adquirir cualquier
          mueble o elemento decorativo, define tu paleta de colores (máximo 3 tonos principales), elige
          los materiales dominantes de tu espacio y decide la proporción entre funcionalidad y ornamento.
          Con ese marco claro, cada compra tendrá criterio.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-estilo-decoracion')} />
      <ShareCard appName="selector-estilo-decoracion" />
      <Footer appName="selector-estilo-decoracion" />
    </div>
  );
}
