'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QuizTiposPlantas.module.css';

// ============================================================================
// TIPOS
// ============================================================================

type GrupoPlanta = 'alga' | 'briofito' | 'pteridofito' | 'gimnosperma' | 'monocotiledonea' | 'dicotiledonea';
type Dificultad = 'facil' | 'medio' | 'dificil';
type EstadoQuiz = 'inicio' | 'jugando' | 'feedback' | 'resultados';
type ModoJuego = 'rapido' | 'completo' | GrupoPlanta;

interface PlantaQuiz {
  id: number;
  emoji: string;
  nombreComun: string;
  nombreCientifico: string;
  grupo: GrupoPlanta;
  pista: string;
  explicacion: string;
  dificultad: Dificultad;
}

interface EstadoJuego {
  estado: EstadoQuiz;
  modo: ModoJuego;
  preguntas: PlantaQuiz[];
  indiceActual: number;
  respuestaSeleccionada: string | null;
  respuestasCorrectas: number;
  errores: Array<{ planta: PlantaQuiz; respuestaUsuario: string }>;
}

// ============================================================================
// DATOS: GRUPOS
// ============================================================================

const GRUPOS: Record<GrupoPlanta, { label: string; color: string; emoji: string; descripcion: string }> = {
  alga: { label: 'Alga', color: '#2E86AB', emoji: '🌊', descripcion: 'Sin vasculatura ni tejidos diferenciados' },
  briofito: { label: 'Briófito', color: '#48A9A6', emoji: '🟢', descripcion: 'Sin vasculatura, gametofito dominante' },
  pteridofito: { label: 'Pteridófito', color: '#5BA05A', emoji: '🌿', descripcion: 'Con vasculatura, sin semilla' },
  gimnosperma: { label: 'Gimnosperma', color: '#8B5A2B', emoji: '🌲', descripcion: 'Semilla desnuda en conos' },
  monocotiledonea: { label: 'Monocotiledónea', color: '#C47D2A', emoji: '🌾', descripcion: 'Angiosperma con 1 cotiledón' },
  dicotiledonea: { label: 'Dicotiledónea', color: '#C0392B', emoji: '🌸', descripcion: 'Angiosperma con 2 cotiledones' },
} as const;

const TODOS_LOS_GRUPOS = Object.keys(GRUPOS) as GrupoPlanta[];

// ============================================================================
// DATOS: 40 PLANTAS
// ============================================================================

const PLANTAS: PlantaQuiz[] = [
  // ALGAS (6 verdaderas + 1 trampa)
  { id: 1, emoji: '🌊', nombreComun: 'Lechuga de mar', nombreCientifico: 'Ulva lactuca', grupo: 'alga', pista: 'Lámina verde brillante de 2 células de grosor, crece en rocas de la costa', explicacion: 'Alga verde (Chlorophyta): sin vasculatura, sin raíces, sin tejidos diferenciados. Fotosíntesis con clorofila a+b, igual que las plantas terrestres.', dificultad: 'facil' },
  { id: 2, emoji: '🌿', nombreComun: 'Espirulina', nombreCientifico: 'Arthrospira platensis', grupo: 'alga', pista: 'Filamentos en espiral azul-verdosos usados como suplemento alimenticio', explicacion: 'Cianobacteria (alga procariótica): organismo procariota fotosintético sin núcleo definido. Se clasifica con las algas en la enseñanza básica, aunque técnicamente es una bacteria.', dificultad: 'dificil' },
  { id: 3, emoji: '🟤', nombreComun: 'Kelp gigante', nombreCientifico: 'Macrocystis pyrifera', grupo: 'alga', pista: 'Forma bosques submarinos de hasta 45 metros en el Pacífico', explicacion: 'Alga parda (Phaeophyta): el alga más grande del mundo. Sin vasculatura verdadera, aunque tiene sifones conductores. Contiene alginatos usados en industria alimentaria.', dificultad: 'medio' },
  { id: 4, emoji: '🔴', nombreComun: 'Nori', nombreCientifico: 'Pyropia yezoensis', grupo: 'alga', pista: 'La lámina rojo-morada que envuelve el sushi', explicacion: 'Alga roja (Rhodophyta): pigmento ficoeritrina que le da color rojo y permite vivir en aguas profundas captando luz azul. Fuente de agar-agar.', dificultad: 'facil' },
  { id: 5, emoji: '🌿', nombreComun: 'Fucus', nombreCientifico: 'Fucus vesiculosus', grupo: 'alga', pista: 'Alga parda con vejiguitas de aire en sus frondes, muy común en costas atlánticas', explicacion: 'Alga parda (Phaeophyta): vejiguitas de flotación (aerocistos), sin vasculatura, ciclo de vida con alternancia de generaciones. Fuente de yodo.', dificultad: 'medio' },
  { id: 6, emoji: '💚', nombreComun: 'Chara', nombreCientifico: 'Chara vulgaris', grupo: 'alga', pista: 'Alga de agua dulce que parece una planta acuática, con nudos y "hojas" ramificadas', explicacion: 'Alga verde carófita: el grupo más emparentado con las plantas terrestres. Tiene plasmodesmatos y síntesis de celulosa igual que las plantas. Vive en aguas calcáreas.', dificultad: 'dificil' },
  // Trampa: posidonia
  { id: 7, emoji: '🌊', nombreComun: 'Posidonia', nombreCientifico: 'Posidonia oceanica', grupo: 'dicotiledonea', pista: 'Forma praderas submarinas en el Mediterráneo; parece un alga pero tiene flores y frutos', explicacion: '¡Trampa! Es una angiosperma dicotiledónea acuática marina. Tiene raíces, tallos, hojas y flores verdaderas. Las praderas de posidonia son ecosistemas protegidos y grandes productores de O₂.', dificultad: 'dificil' },

  // BRIÓFITOS (6)
  { id: 8, emoji: '🟢', nombreComun: 'Musgo de turbera', nombreCientifico: 'Sphagnum palustre', grupo: 'briofito', pista: 'Forma alfombras esponjosas en turberas; puede absorber hasta 20 veces su peso en agua', explicacion: 'Briófito (musgo): sin vasculatura, sin raíces verdaderas (rizoides), gametofito dominante. El Sphagnum forma turba al acumularse durante miles de años.', dificultad: 'facil' },
  { id: 9, emoji: '🌿', nombreComun: 'Musgo de pared', nombreCientifico: 'Tortula muralis', grupo: 'briofito', pista: 'Pequeñas almohadillas verdes que crecen en tapias y muros antiguos', explicacion: 'Briófito: absorbe agua y nutrientes por toda la superficie. Sin tejido vascular ni raíces. Indicador de humedad y baja contaminación del aire.', dificultad: 'facil' },
  { id: 10, emoji: '💚', nombreComun: 'Marchantia', nombreCientifico: 'Marchantia polymorpha', grupo: 'briofito', pista: 'Talosa aplanada con estructura en forma de hígado, crece en suelos húmedos tras incendios', explicacion: 'Briófito hepática talosa: cuerpo no diferenciado en tallo y hojas. Órganos especializados para reproducción asexual (gemarios) y sexual. Grupo de las hepáticas.', dificultad: 'medio' },
  { id: 11, emoji: '🟢', nombreComun: 'Politriquio', nombreCientifico: 'Polytrichum commune', grupo: 'briofito', pista: 'Musgo erecto de hasta 40 cm, con "hojas" dentadas; el más grande de los musgos europeos', explicacion: 'Briófito: a pesar de su tamaño, no tiene tejido vascular verdadero. Tiene hidroides (células conductoras primitivas) pero sin lignina. Gametofito dominante con esporófito en cápsulas.', dificultad: 'medio' },
  { id: 12, emoji: '💙', nombreComun: 'Antocerota', nombreCientifico: 'Anthoceros agrestis', grupo: 'briofito', pista: 'Cuerpo aplanado verde con esporófito que crece como un cuerno verde desde él', explicacion: 'Briófito antocerota: el esporófito (la "cuerna") es fotosintético e independiente, a diferencia de musgos y hepáticas. Un grupo puente evolutivo entre briófitos y plantas vasculares.', dificultad: 'dificil' },
  { id: 13, emoji: '🌿', nombreComun: 'Hepática acuática', nombreCientifico: 'Pellia epiphylla', grupo: 'briofito', pista: 'Talosa brillante que crece junto a arroyos de montaña, muy sensible a la contaminación', explicacion: 'Briófito hepática: bioindicador de calidad del agua. Sin vasculatura, sin cutícula bien desarrollada. Se reproduce por gemación y esporas.', dificultad: 'medio' },

  // PTERIDÓFITOS (7)
  { id: 14, emoji: '🌿', nombreComun: 'Helecho común', nombreCientifico: 'Pteridium aquilinum', grupo: 'pteridofito', pista: 'Frondas triangulares que cubren laderas en zonas templadas; los soros están en el borde del envés', explicacion: 'Pteridófito (helecho): primer grupo con vasculatura (xilema y floema). Sin semilla, se reproduce por esporas en soros. Esporófito dominante. Una de las plantas más extendidas del mundo.', dificultad: 'facil' },
  { id: 15, emoji: '🌿', nombreComun: 'Cola de caballo', nombreCientifico: 'Equisetum arvense', grupo: 'pteridofito', pista: 'Tallos articulados y acanalados que emergen como "cepillos" en suelos húmedos', explicacion: 'Pteridófito equiseto: único género superviviente de su clase. Tallo silicificado y articulado; en el Carbonífero eran árboles de 30 m. Sin semilla, esporas en estróbilos terminales.', dificultad: 'facil' },
  { id: 16, emoji: '🌱', nombreComun: 'Licopodio', nombreCientifico: 'Lycopodium clavatum', grupo: 'pteridofito', pista: 'Tallos rastreros con "hojas" en espiral, parece un pequeño abeto en miniatura en el suelo del bosque', explicacion: 'Pteridófito licopodio: micrófilos (una sola vena). El polvo de Lycopodium (esporas) era usado en fotografía antigua por ser altamente inflamable. Homospórico.', dificultad: 'dificil' },
  { id: 17, emoji: '🌿', nombreComun: 'Helecho árbol', nombreCientifico: 'Dicksonia antarctica', grupo: 'pteridofito', pista: 'Tronco de fibras marrones de hasta 5 metros con corona de frondas; parece una palmera prehistórica', explicacion: 'Pteridófito: a pesar de su porte arbóreo no es un árbol verdadero. Sin semilla ni flor; las frondas tienen soros en el envés. Superviviente de los bosques del Cretácico.', dificultad: 'medio' },
  { id: 18, emoji: '💚', nombreComun: 'Culantrillo', nombreCientifico: 'Adiantum capillus-veneris', grupo: 'pteridofito', pista: 'Frondas finamente divididas con pínnulas en forma de abanico; tallos negros brillantes', explicacion: 'Pteridófito helecho: soros marginales cubiertos por el repliegue de la hoja (falso indusio). Característico de paredes húmedas, fuentes y acantilados calizos.', dificultad: 'medio' },
  { id: 19, emoji: '🌿', nombreComun: 'Selaginella', nombreCientifico: 'Selaginella kraussiana', grupo: 'pteridofito', pista: 'Tapices verdes rastreros con "hojas" diminutas en 4 filas; parece un musgo pero tiene vasculatura', explicacion: 'Pteridófito heterospórico: produce microsporas (dan gametofito masculino) y megásporas (dan gametofito femenino). Clave evolutiva: fue el primer paso hacia la semilla.', dificultad: 'dificil' },
  { id: 20, emoji: '🌿', nombreComun: 'Asplenio negro', nombreCientifico: 'Asplenium adiantum-nigrum', grupo: 'pteridofito', pista: 'Frondas coriáceas divididas dos veces, siempreverde, en muros y grietas de roca', explicacion: 'Pteridófito helecho: soros lineales cubiertos por indusio lateral. Perennifolio porque sus hojas tienen cutícula bien desarrollada. Frecuente en muros antiguos de toda Europa.', dificultad: 'medio' },

  // GIMNOSPERMAS (7)
  { id: 21, emoji: '🌲', nombreComun: 'Pino silvestre', nombreCientifico: 'Pinus sylvestris', grupo: 'gimnosperma', pista: 'Árbol de corteza rojiza en la copa, hojas aciculares en parejas y piñas ovoides', explicacion: 'Gimnosperma conífera: semilla desnuda en escamas del cono femenino (piña). Sin flor ni fruto verdadero. Polinización anemófila (por viento). Resinas como defensa contra insectos.', dificultad: 'facil' },
  { id: 22, emoji: '🌲', nombreComun: 'Abeto blanco', nombreCientifico: 'Abies alba', grupo: 'gimnosperma', pista: 'Árbol de copa cónica perfecta con piñas erectas que se desintegran en el árbol; hojas con 2 líneas blancas', explicacion: 'Gimnosperma conífera: a diferencia del pino, las piñas del abeto son erectas y sus escamas caen solas. Sus hojas tienen estomas hundidos (líneas blancas) para reducir transpiración.', dificultad: 'medio' },
  { id: 23, emoji: '🌿', nombreComun: 'Cica', nombreCientifico: 'Cycas revoluta', grupo: 'gimnosperma', pista: 'Parece una palmera con tronco corto y hojas pinnadas en roseta; muy usada en jardines', explicacion: 'Gimnosperma cicadácea: una de las plantas más antiguas. Los óvulos están en hojas fértiles modificadas (no en conos cerrados). Dioica (plantas masculinas y femeninas separadas). Tóxica.', dificultad: 'medio' },
  { id: 24, emoji: '🍃', nombreComun: 'Ginkgo', nombreCientifico: 'Ginkgo biloba', grupo: 'gimnosperma', pista: 'Hoja en abanico con venación dicotómica, color amarillo dorado en otoño; árbol de ciudad', explicacion: 'Gimnosperma (división Ginkgophyta): fósil viviente sin cambios desde el Jurásico. Único superviviente de su línea. Los "frutos" malolientes son óvulos desnudos con carne, no frutos verdaderos.', dificultad: 'medio' },
  { id: 25, emoji: '🌲', nombreComun: 'Secuoya roja', nombreCientifico: 'Sequoia sempervirens', grupo: 'gimnosperma', pista: 'El árbol más alto del mundo (hasta 115 m), corteza rojiza esponjosa de 30 cm de grosor', explicacion: 'Gimnosperma conífera: piñas pequeñas a pesar del tamaño del árbol. La corteza tan gruesa la protege del fuego. Puede vivir más de 2.000 años. Endémica de la costa de California.', dificultad: 'medio' },
  { id: 26, emoji: '🌲', nombreComun: 'Ciprés mediterráneo', nombreCientifico: 'Cupressus sempervirens', grupo: 'gimnosperma', pista: 'Árbol columnar oscuro, siempreverde, símbolo del paisaje mediterráneo', explicacion: 'Gimnosperma conífera cupresácea: conos pequeños y redondeados (gálbulos). Hojas escamiformes (no aciculares). Altamente resistente a la sequía.', dificultad: 'facil' },
  { id: 27, emoji: '🌿', nombreComun: 'Welwitschia', nombreCientifico: 'Welwitschia mirabilis', grupo: 'gimnosperma', pista: 'Solo 2 hojas que crecen sin parar durante 1.000-2.000 años en el desierto de Namib; parece un pulpo', explicacion: 'Gimnosperma gnetofita: uno de los seres vivos más singulares. Solo produce 2 hojas en toda su vida que se fragmentan por el viento. Endémica del desierto de Namib. Resiste sequías extremas.', dificultad: 'dificil' },

  // MONOCOTILEDÓNEAS (7)
  { id: 28, emoji: '🌾', nombreComun: 'Trigo', nombreCientifico: 'Triticum aestivum', grupo: 'monocotiledonea', pista: 'Cereal de espiga con granos encerrados en glumas; base de la alimentación en muchas regiones del mundo', explicacion: 'Angiosperma monocotiledónea: 1 cotiledón, raíz fasciculada, hojas con nervación paralela, flores trímeras. Las gramíneas (Poaceae) son la familia más importante de monocotiledóneas.', dificultad: 'facil' },
  { id: 29, emoji: '🌴', nombreComun: 'Palmera datilera', nombreCientifico: 'Phoenix dactylifera', grupo: 'monocotiledonea', pista: 'Tronco sin ramificar con corona de hojas pinnadas; produce dátiles', explicacion: 'Monocotiledónea: sin crecimiento secundario (sin madera verdadera); el tronco crece en grosor por células del meristemo primario. Hojas pinnadas. Dioica.', dificultad: 'medio' },
  { id: 30, emoji: '🌺', nombreComun: 'Orquídea silvestre', nombreCientifico: 'Orchis mascula', grupo: 'monocotiledonea', pista: 'Flores simétricas con labelo; la familia vegetal más diversa (28.000 especies)', explicacion: 'Monocotiledónea: flores de simetría bilateral (zigomorfa), 3 pétalos (uno transformado en labelo), 3 sépalos. Raíces con velamen para absorber agua del aire.', dificultad: 'medio' },
  { id: 31, emoji: '🧅', nombreComun: 'Cebolla', nombreCientifico: 'Allium cepa', grupo: 'monocotiledonea', pista: 'Bulbo formado por catáfilos carnosos; hojas tubulares y flores en umbela esférica', explicacion: 'Monocotiledónea: bulbo como órgano de reserva. Hojas con nervación paralela. Flores trímeras en umbela. Familia Alliaceae.', dificultad: 'facil' },
  { id: 32, emoji: '🌷', nombreComun: 'Tulipán', nombreCientifico: 'Tulipa gesneriana', grupo: 'monocotiledonea', pista: 'Flor de 6 tépalos (3 pétalos + 3 sépalos iguales) en colores llamativos; bulbo subterráneo', explicacion: 'Monocotiledónea: los 6 tépalos son característica de las Liliaceae. Bulbo como almacén de energía para florecer en primavera. Nervación paralela en las hojas.', dificultad: 'facil' },
  { id: 33, emoji: '🎋', nombreComun: 'Bambú', nombreCientifico: 'Phyllostachys edulis', grupo: 'monocotiledonea', pista: 'Tallos huecos articulados, crecimiento de hasta 90 cm/día; el "árbol" de crecimiento más rápido', explicacion: 'Monocotiledónea gramínea: no es un árbol (no tiene madera verdadera). Tallo = culmo hueco leñoso. Sin crecimiento secundario. Florece solo una vez en su vida (cada 60-120 años) y luego muere.', dificultad: 'medio' },
  { id: 34, emoji: '🌿', nombreComun: 'Espadaña', nombreCientifico: 'Typha latifolia', grupo: 'monocotiledonea', pista: 'Tallos erectos con hojas planas largas y "salchicha" parda al final; crece en orillas de agua', explicacion: 'Monocotiledónea: la "salchicha" es la inflorescencia femenina (miles de flores diminutas). Hojas planas con nervación paralela. Raíz rizomatosa. Familia Typhaceae.', dificultad: 'medio' },

  // DICOTILEDÓNEAS (6)
  { id: 35, emoji: '🌹', nombreComun: 'Rosal silvestre', nombreCientifico: 'Rosa canina', grupo: 'dicotiledonea', pista: 'Arbusto con espinas curvas, flores de 5 pétalos y escaramujos rojos en otoño', explicacion: 'Dicotiledónea: 5 pétalos y 5 sépalos (pentámera), nervación reticulada en las hojas, raíz pivotante. Familia Rosaceae, una de las más importantes en agricultura.', dificultad: 'facil' },
  { id: 36, emoji: '🌻', nombreComun: 'Girasol', nombreCientifico: 'Helianthus annuus', grupo: 'dicotiledonea', pista: 'Lo que parece una única flor son en realidad miles de flores diminutas en un receptáculo', explicacion: 'Dicotiledónea compuesta (Asteraceae): el "capítulo" es una pseudoflor — flores marginales liguladas (decorativas) + flores del disco tubulosas (fértiles). Hojas anchas con nervación reticulada.', dificultad: 'facil' },
  { id: 37, emoji: '🍅', nombreComun: 'Tomate', nombreCientifico: 'Solanum lycopersicum', grupo: 'dicotiledonea', pista: 'Fruto baya con placentación axial; flor amarilla de 5 pétalos soldados en campana', explicacion: 'Dicotiledónea solanácea: el tomate es botanicamente una baya (fruto carnoso). 5 pétalos fusionados (simpétala). Hojas compuestas con nervación reticulada.', dificultad: 'facil' },
  { id: 38, emoji: '🌳', nombreComun: 'Roble', nombreCientifico: 'Quercus robur', grupo: 'dicotiledonea', pista: 'Árbol caducifolio con hojas lobuladas, bellotas en cúpula y madera durísima', explicacion: 'Dicotiledónea: las bellotas son frutos secos (aquenios) sobre una cúpula. Madera con anillos anuales (crecimiento secundario). Flores pequeñas anemófilas. Hojas con nervación pinnada reticulada.', dificultad: 'facil' },
  { id: 39, emoji: '💜', nombreComun: 'Lavanda', nombreCientifico: 'Lavandula angustifolia', grupo: 'dicotiledonea', pista: 'Arbusto aromático con flores violetas en espiga; hojas grises estrechas y fragantes', explicacion: 'Dicotiledónea lamiácea: flores zigomorfas (bilaterales) de 2 labios, muy características de la familia Lamiaceae. Hojas opuestas con nervación reticulada.', dificultad: 'medio' },
  { id: 40, emoji: '🥑', nombreComun: 'Aguacate', nombreCientifico: 'Persea americana', grupo: 'dicotiledonea', pista: 'Fruto-drupa con semilla enorme; árbol siempreverde de hoja grande y brillante, originario de México', explicacion: 'Dicotiledónea laurácea: el aguacate es una drupa (fruto carnoso con hueso). Flores pequeñas con 6 tépalos en 2 verticilos. Hojas alternadas con nervación pinnada.', dificultad: 'medio' },
];

// ============================================================================
// UTILIDADES
// ============================================================================

/** Mezcla un array (Fisher-Yates) y devuelve uno nuevo */
function mezclar<T>(array: T[]): T[] {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Devuelve 3 grupos distractores distintos del grupo correcto */
function obtenerDistractores(grupoCorecto: GrupoPlanta): GrupoPlanta[] {
  const otros = TODOS_LOS_GRUPOS.filter((g) => g !== grupoCorecto);
  return mezclar(otros).slice(0, 3);
}

/** Genera las opciones de respuesta mezcladas para una pregunta */
function generarOpciones(planta: PlantaQuiz): GrupoPlanta[] {
  const distractores = obtenerDistractores(planta.grupo);
  return mezclar([planta.grupo, ...distractores]);
}

/** Selecciona las preguntas según el modo */
function seleccionarPreguntas(modo: ModoJuego): PlantaQuiz[] {
  if (modo === 'rapido') {
    return mezclar(PLANTAS).slice(0, 20);
  }
  if (modo === 'completo') {
    return mezclar(PLANTAS);
  }
  // Modo por grupo
  const porGrupo = PLANTAS.filter((p) => p.grupo === modo);
  return mezclar(porGrupo);
}

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const ESTADO_INICIAL: EstadoJuego = {
  estado: 'inicio',
  modo: 'rapido',
  preguntas: [],
  indiceActual: 0,
  respuestaSeleccionada: null,
  respuestasCorrectas: 0,
  errores: [],
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function QuizTiposPlantas() {
  const [juego, setJuego] = useState<EstadoJuego>(ESTADO_INICIAL);

  // Opciones de la pregunta actual (re-generadas al cambiar de pregunta)
  const opcionesActuales = useMemo(() => {
    if (juego.estado !== 'jugando' && juego.estado !== 'feedback') return [];
    if (juego.preguntas.length === 0) return [];
    return generarOpciones(juego.preguntas[juego.indiceActual]);
  }, [juego.indiceActual, juego.preguntas, juego.estado]);

  const plantaActual = juego.preguntas[juego.indiceActual] ?? null;

  // --- Iniciar quiz ---
  const iniciarQuiz = useCallback((modo: ModoJuego) => {
    const preguntas = seleccionarPreguntas(modo);
    setJuego({
      estado: 'jugando',
      modo,
      preguntas,
      indiceActual: 0,
      respuestaSeleccionada: null,
      respuestasCorrectas: 0,
      errores: [],
    });
  }, []);

  // --- Seleccionar respuesta ---
  const seleccionarRespuesta = useCallback((respuesta: GrupoPlanta) => {
    if (juego.estado !== 'jugando' || !plantaActual) return;
    const esCorrecta = respuesta === plantaActual.grupo;
    setJuego((prev) => ({
      ...prev,
      estado: 'feedback',
      respuestaSeleccionada: respuesta,
      respuestasCorrectas: esCorrecta ? prev.respuestasCorrectas + 1 : prev.respuestasCorrectas,
      errores: esCorrecta
        ? prev.errores
        : [...prev.errores, { planta: plantaActual, respuestaUsuario: respuesta }],
    }));
  }, [juego.estado, plantaActual]);

  // --- Siguiente pregunta ---
  const siguientePregunta = useCallback(() => {
    setJuego((prev) => {
      const esUltima = prev.indiceActual >= prev.preguntas.length - 1;
      if (esUltima) {
        return { ...prev, estado: 'resultados' };
      }
      return {
        ...prev,
        estado: 'jugando',
        indiceActual: prev.indiceActual + 1,
        respuestaSeleccionada: null,
      };
    });
  }, []);

  // --- Reiniciar ---
  const reiniciar = useCallback(() => {
    setJuego(ESTADO_INICIAL);
  }, []);

  // ============================================================================
  // RENDERS SEGÚN ESTADO
  // ============================================================================

  const enJuego = juego.estado === 'jugando' || juego.estado === 'feedback';

  // Cuando está jugando: solo mostrar el quiz (sin header ni footer)
  if (enJuego && plantaActual) {
    const progreso = ((juego.indiceActual + 1) / juego.preguntas.length) * 100;
    const esFeedback = juego.estado === 'feedback';
    const esCorrecta = juego.respuestaSeleccionada === plantaActual.grupo;

    return (
      <div className={styles.quizWrapper}>
        {/* Barra de progreso */}
        <div className={styles.barraProgreso} role="progressbar" aria-valuenow={juego.indiceActual + 1} aria-valuemin={1} aria-valuemax={juego.preguntas.length}>
          <div className={styles.barraRelleno} style={{ width: `${progreso}%` }} />
        </div>

        {/* Cabecera del quiz */}
        <div className={styles.quizCabecera}>
          <span className={styles.contadorPregunta}>
            Pregunta {juego.indiceActual + 1} / {juego.preguntas.length}
          </span>
          <span className={styles.puntuacion}>
            <span aria-hidden="true">✅</span> {juego.respuestasCorrectas} correctas
          </span>
          <button type="button" className={styles.btnSalir} onClick={reiniciar} aria-label="Salir del quiz">
            ✕ Salir
          </button>
        </div>

        {/* Tarjeta de pregunta */}
        <div className={styles.tarjetaPregunta}>
          <div className={styles.plantaEmoji} aria-hidden="true">{plantaActual.emoji}</div>
          <h2 className={styles.plantaNombreComun}>{plantaActual.nombreComun}</h2>
          <p className={styles.plantaNombreCientifico}><em>{plantaActual.nombreCientifico}</em></p>
          <p className={styles.plantaPista}>{plantaActual.pista}</p>

          <p className={styles.preguntaTexto}>¿A qué grupo pertenece?</p>

          {/* Opciones */}
          <div className={styles.opcionesGrid}>
            {opcionesActuales.map((grupo) => {
              const info = GRUPOS[grupo];
              let claseBoton = styles.btnOpcion;
              if (esFeedback) {
                if (grupo === plantaActual.grupo) {
                  claseBoton = `${styles.btnOpcion} ${styles.btnCorrecto}`;
                } else if (grupo === juego.respuestaSeleccionada) {
                  claseBoton = `${styles.btnOpcion} ${styles.btnIncorrecto}`;
                } else {
                  claseBoton = `${styles.btnOpcion} ${styles.btnDesactivado}`;
                }
              }
              return (
                <button
                  key={grupo}
                  type="button"
                  className={claseBoton}
                  onClick={() => seleccionarRespuesta(grupo)}
                  disabled={esFeedback}
                  aria-pressed={juego.respuestaSeleccionada === grupo}
                  style={{ borderColor: esFeedback && grupo === plantaActual.grupo ? info.color : undefined }}
                >
                  <span className={styles.opcionEmoji} aria-hidden="true">{info.emoji}</span>
                  <span className={styles.opcionLabel}>{info.label}</span>
                  <span className={styles.opcionDescripcion}>{info.descripcion}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {esFeedback && (
          <div className={`${styles.feedbackPanel} ${esCorrecta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`} role="alert" aria-live="polite">
            <p className={styles.feedbackTitulo}>
              {esCorrecta
                ? <><span aria-hidden="true">✅</span> ¡Correcto!</>
                : <><span aria-hidden="true">❌</span> Era: <span aria-hidden="true">{GRUPOS[plantaActual.grupo].emoji}</span> {GRUPOS[plantaActual.grupo].label}</>}
            </p>
            <p className={styles.feedbackExplicacion}>{plantaActual.explicacion}</p>
            <button type="button" className={styles.btnSiguiente} onClick={siguientePregunta}>
              {juego.indiceActual >= juego.preguntas.length - 1 ? 'Ver resultados →' : 'Siguiente →'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Pantalla de resultados
  if (juego.estado === 'resultados') {
    const total = juego.preguntas.length;
    const correctas = juego.respuestasCorrectas;
    const porcentaje = Math.round((correctas / total) * 100);
    const emojiResultado = porcentaje >= 80 ? '🏆' : porcentaje >= 50 ? '👍' : '😅';

    // Estadísticas por grupo
    const statsPorGrupo = TODOS_LOS_GRUPOS.map((grupo) => {
      const preguntasGrupo = juego.preguntas.filter((p) => p.grupo === grupo);
      const erroresGrupo = juego.errores.filter((e) => e.planta.grupo === grupo);
      return {
        grupo,
        total: preguntasGrupo.length,
        correctas: preguntasGrupo.length - erroresGrupo.length,
      };
    }).filter((s) => s.total > 0);

    return (
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1>Quiz: Clasifica 40 Plantas</h1>
          <p>¿Musgo, Helecho o Angiosperma? Pon a prueba tu botánica</p>
        </header>
        <LegalNotice />

        <main className={styles.main}>
          {/* Panel de resultados */}
          <div className={styles.resultadosPanel}>
            <div className={styles.resultadoEmoji} aria-hidden="true">{emojiResultado}</div>
            <h2 className={styles.resultadoTitulo}>Resultado: {correctas}/{total}</h2>
            <p className={styles.resultadoPorcentaje}>{porcentaje}% de acierto</p>

            {/* Stats por grupo */}
            <div className={styles.statsGrupos}>
              {statsPorGrupo.map(({ grupo, total: t, correctas: c }) => (
                <div key={grupo} className={styles.statGrupo}>
                  <span className={styles.statEmoji} aria-hidden="true">{GRUPOS[grupo].emoji}</span>
                  <span className={styles.statLabel}>{GRUPOS[grupo].label}</span>
                  <span className={styles.statConteo}>{c}/{t}</span>
                  <div className={styles.statBarra}>
                    <div
                      className={styles.statBarraRelleno}
                      style={{ width: t > 0 ? `${(c / t) * 100}%` : '0%', backgroundColor: GRUPOS[grupo].color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Errores */}
            {juego.errores.length > 0 && (
              <div className={styles.errorList}>
                <h3 className={styles.errorListTitulo}>Repasa estos {juego.errores.length} errores:</h3>
                {juego.errores.map(({ planta, respuestaUsuario }) => (
                  <div key={planta.id} className={styles.errorItem}>
                    <span aria-hidden="true">{planta.emoji}</span>
                    <div>
                      <strong>{planta.nombreComun}</strong>{' '}
                      <em>({planta.nombreCientifico})</em>
                      <br />
                      <span className={styles.errorRespuestaUsuario}>
                        Tu respuesta: {GRUPOS[respuestaUsuario as GrupoPlanta]?.label ?? respuestaUsuario}
                      </span>{' '}
                      →{' '}
                      <span className={styles.errorRespuestaCorrecta}>
                        Correcto: {GRUPOS[planta.grupo].label}
                      </span>
                      <p className={styles.errorExplicacion}>{planta.explicacion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.resultadosBotones}>
              <button type="button" className={styles.btnPrimario} onClick={reiniciar}>
                <span aria-hidden="true">🔄</span> Volver a jugar
              </button>
            </div>
          </div>

          <EducationalSection
            title="Guía de Clasificación Botánica"
            subtitle="Criterios diagnósticos para identificar los 6 grupos del reino vegetal"
            icon="🌿"
          >
            <p className={styles.eduIntro}>
              Clasificar plantas es una habilidad fundamental en biología: los grupos taxonómicos no son solo nombres, son conjuntos de características que revelan la historia evolutiva de las plantas. La clave diagnóstica más útil es la secuencia: ¿vasculatura? → ¿semilla? → ¿flor y fruto? → ¿cuántos cotiledones?
            </p>

            <div className={styles.tablaComparativa}>
              <h4 className={styles.eduSubtitulo}>Los 6 grupos comparados</h4>
              {[
                { caracteristica: 'Algas', valor: 'Sin vasculatura', detalle: 'Sin raíces, tallos ni hojas verdaderas. El grupo ancestral de todas las plantas' },
                { caracteristica: 'Briófitos', valor: 'Sin vasculatura', detalle: 'Primeros en colonizar tierra. Necesitan agua para reproducirse. Gametofito dominante.' },
                { caracteristica: 'Pteridófitos', valor: 'Con vasculatura', detalle: 'Primera vasculatura (xilema+floema). Sin semilla: esporas en soros.' },
                { caracteristica: 'Gimnospermas', valor: 'Semilla desnuda', detalle: 'Semilla en conos, sin fruto envolvente. Polinización por viento.' },
                { caracteristica: 'Monocotiledóneas', valor: '1 cotiledón', detalle: 'Hojas paralelinervias, raíz fasciculada, flores trímeras.' },
                { caracteristica: 'Dicotiledóneas', valor: '2 cotiledones', detalle: 'Hojas reticuladas, raíz pivotante, flores 4-5-meras, madera.' },
              ].map((fila) => (
                <div key={fila.caracteristica} className={styles.filaTabla}>
                  <span className={styles.celdaCaracteristica}>{fila.caracteristica}</span>
                  <span className={styles.celdaValor}>{fila.valor}</span>
                  <span className={styles.celdaDetalle}>{fila.detalle}</span>
                </div>
              ))}
            </div>

            <div className={styles.pasos}>
              <h4 className={styles.eduSubtitulo}>Clave dicotómica rápida (5 pasos)</h4>
              {[
                { numero: 1, titulo: '¿Tiene vasculatura?', descripcion: 'Sin xilema ni floema → alga o briófito. Con sistema vascular → pteridófito o planta con semilla.' },
                { numero: 2, titulo: '¿Produce semilla?', descripcion: 'Sin semilla → alga, briófito o pteridófito (esporas). Con semilla → fanerógama (gimnosperma o angiosperma).' },
                { numero: 3, titulo: '¿La semilla está en un fruto?', descripcion: 'Semilla desnuda (en conos) → gimnosperma. Semilla cubierta por fruto → angiosperma.' },
                { numero: 4, titulo: '¿Cuántos cotiledones tiene la semilla?', descripcion: '1 cotiledón → monocotiledónea. 2 cotiledones → dicotiledónea.' },
                { numero: 5, titulo: '¿Cómo son las hojas?', descripcion: 'Pista adicional: nervación paralela → monocot. Nervación reticulada (red) → dicot.' },
              ].map((paso) => (
                <div key={paso.numero} className={styles.paso}>
                  <div className={styles.pasoNumero}>{paso.numero}</div>
                  <div>
                    <strong>{paso.titulo}</strong>
                    <p>{paso.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.escenarios}>
              <h4 className={styles.eduSubtitulo}>¿Para quién es este quiz?</h4>
              <div className={styles.escenariosGrid}>
                {[
                  { titulo: 'Preparar el examen de Biología', descripcion: 'Los grupos del reino vegetal son pregunta frecuente en exámenes de admisión universitaria. Practica con las 40 plantas para memorizar las características diagnósticas.', icono: '📚' },
                  { titulo: 'Aficionado a la botánica', descripcion: 'Aprende a clasificar las plantas que ves en el campo o el jardín. ¿Es ese árbol una gimnosperma o una angiosperma? ¿Monocot o dicot?', icono: '🌿' },
                  { titulo: 'Reto familiar o de grupo', descripcion: 'Modo rápido de 20 preguntas para jugar en familia. Los emojis y los nombres comunes hacen el quiz accesible para todos.', icono: '👨‍👩‍👧' },
                  { titulo: 'Docente', descripcion: 'Recurso para repasar clasificación vegetal en clase o como actividad de evaluación rápida.', icono: '👩‍🏫' },
                ].map((s) => (
                  <div key={s.titulo} className={styles.escenario}>
                    <span className={styles.escenarioIcono} aria-hidden="true">{s.icono}</span>
                    <strong>{s.titulo}</strong>
                    <p>{s.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.faq}>
              <h4 className={styles.eduSubtitulo}>Preguntas frecuentes</h4>
              {[
                { pregunta: '¿Los hongos son plantas?', respuesta: 'No. Los hongos tienen su propio reino (Fungi). No realizan fotosíntesis, tienen quitina en sus paredes (no celulosa) y obtienen nutrientes por absorción. Son más emparentados con los animales que con las plantas.' },
                { pregunta: '¿Cómo distingo monocotiledóneas de dicotiledóneas rápidamente?', respuesta: 'Mira las hojas: si las venas son paralelas → monocot. Si forman una red → dicot. También: flor con piezas en múltiplos de 3 → monocot; de 4 o 5 → dicot. El tronco leñoso (madera) indica casi siempre dicot.' },
                { pregunta: '¿Las algas son el grupo más antiguo?', respuesta: 'Son el más antiguo (surgieron hace unos 3.500 millones de años), pero no necesariamente el más simple: algunas algas pardas (kelp) tienen estructuras complejas. En biología evolutiva, "antiguo" no equivale a "simple".' },
                { pregunta: '¿La posidonia es un alga?', respuesta: '¡No! Es una trampa clásica. La posidonia es una angiosperma dicotiledónea que volvió al mar hace 65-100 millones de años. Tiene raíces, tallos, hojas y flores verdaderas. Sus praderas son ecosistemas cruciales del Mediterráneo.' },
              ].map((item) => (
                <details key={item.pregunta} className={styles.faqItem}>
                  <summary className={styles.faqPregunta}>{item.pregunta}</summary>
                  <p className={styles.faqRespuesta}>{item.respuesta}</p>
                </details>
              ))}
            </div>

            <div className={styles.tips}>
              <h4 className={styles.eduSubtitulo}>Trucos para no confundirse</h4>
              <ul className={styles.tipsList}>
                {[
                  'La posidonia del Mediterráneo es angiosperma, no alga — ¡la trampa más famosa de la botánica!',
                  'Todos los cereales (trigo, arroz, maíz) son monocotiledóneas; casi todas las frutas de hueso (melocotón, cereza) son dicotiledóneas.',
                  'Las coníferas no tienen flor ni fruto, pero sí producen semilla: son gimnospermas con "piñas" en lugar de frutos.',
                  'Si un "árbol" no tiene madera verdadera (bambú, palmera), probablemente es una monocotiledónea.',
                ].map((tip) => (
                  <li key={tip} className={styles.tip}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className={styles.erroresComunes}>
              <h4 className={styles.eduSubtitulo}>Errores comunes</h4>
              <ul className={styles.erroresList}>
                {[
                  'Clasificar la palmera como gimnosperma por su tronco sin ramas: es monocotiledónea angiosperma — produce flores y dátiles (frutos).',
                  'Confundir el Ginkgo con una dicotiledónea por sus hojas anchas: es gimnosperma, la única de la división Ginkgophyta.',
                  'Pensar que todos los árboles son dicotiledóneas: palmeras y bambúes son monocotiledóneas de gran porte.',
                  'Asumir que si algo vive en el agua es alga: la posidonia, el nenúfar y el jacinto de agua son angiospermas acuáticas.',
                ].map((error) => (
                  <li key={error} className={styles.errorComunItem}>{error}</li>
                ))}
              </ul>
            </div>

            {/* Elemento obligatorio v2.0 */}
            <div className={styles.warningBox} role="note">
              <strong>Nota pedagógica:</strong> La clasificación de los seis grupos presentada sigue la taxonomía tradicional usada en biología de secundaria. La sistemática moderna (APG IV) organiza las angiospermas de forma diferente; los términos monocotiledónea y dicotiledónea siguen siendo válidos pero las dicotiledóneas ya no se consideran un grupo natural (parafilético).
            </div>
          </EducationalSection>

          <RelatedApps apps={getRelatedApps('quiz-tipos-plantas')} />
          <ShareCard appName="quiz-tipos-plantas" />
        </main>
        <Footer appName="quiz-tipos-plantas" />
      </div>
    );
  }

  // ============================================================================
  // PANTALLA DE INICIO
  // ============================================================================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1>¿Musgo, Helecho o Angiosperma?</h1>
        <p>Clasifica 40 plantas en su grupo botánico correcto</p>
      </header>
      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de modo */}
        <section className={styles.selectorModo} aria-labelledby="titulo-modo">
          <h2 id="titulo-modo" className={styles.selectorTitulo}>Elige tu modo de juego</h2>

          <div className={styles.modosPrincipales}>
            <button
              type="button"
              className={styles.btnModo}
              onClick={() => iniciarQuiz('rapido')}
              aria-label="Modo rápido: 20 preguntas aleatorias"
            >
              <span className={styles.modoIcono} aria-hidden="true">⚡</span>
              <strong className={styles.modoNombre}>Modo Rápido</strong>
              <span className={styles.modoDetalle}>20 preguntas aleatorias</span>
            </button>

            <button
              type="button"
              className={`${styles.btnModo} ${styles.btnModoDestacado}`}
              onClick={() => iniciarQuiz('completo')}
              aria-label="Modo completo: las 40 plantas"
            >
              <span className={styles.modoIcono} aria-hidden="true">🌿</span>
              <strong className={styles.modoNombre}>Modo Completo</strong>
              <span className={styles.modoDetalle}>Las 40 plantas</span>
            </button>
          </div>

          <h3 className={styles.selectorSubtitulo}>Practicar por grupo</h3>
          <div className={styles.gruposGrid}>
            {TODOS_LOS_GRUPOS.map((grupo) => {
              const info = GRUPOS[grupo];
              const cuenta = PLANTAS.filter((p) => p.grupo === grupo).length;
              return (
                <button
                  key={grupo}
                  type="button"
                  className={styles.btnGrupo}
                  onClick={() => iniciarQuiz(grupo)}
                  style={{ '--grupo-color': info.color } as React.CSSProperties}
                  aria-label={`Practicar ${info.label}: ${cuenta} preguntas`}
                >
                  <span className={styles.grupoEmoji} aria-hidden="true">{info.emoji}</span>
                  <strong className={styles.grupoNombre}>{info.label}</strong>
                  <span className={styles.grupoDescripcion}>{info.descripcion}</span>
                  <span className={styles.grupoConteo}>{cuenta} plantas</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Vista previa de grupos */}
        <section className={styles.vistaGrupos} aria-label="Los 6 grupos del reino vegetal">
          <h2 className={styles.vistaGruposTitulo}>Los 6 grupos del reino vegetal</h2>
          <div className={styles.vistaGruposGrid}>
            {TODOS_LOS_GRUPOS.map((grupo) => {
              const info = GRUPOS[grupo];
              return (
                <div key={grupo} className={styles.vistaGrupoCard} style={{ borderTopColor: info.color }}>
                  <span className={styles.vistaGrupoEmoji} aria-hidden="true">{info.emoji}</span>
                  <strong>{info.label}</strong>
                  <span>{info.descripcion}</span>
                </div>
              );
            })}
          </div>
        </section>

        <EducationalSection
          title="Guía de Clasificación Botánica"
          subtitle="Criterios diagnósticos para identificar los 6 grupos del reino vegetal"
          icon="🌿"
        >
          <p className={styles.eduIntro}>
            Clasificar plantas es una habilidad fundamental en biología: los grupos taxonómicos no son solo nombres, son conjuntos de características que revelan la historia evolutiva de las plantas. La clave diagnóstica más útil es la secuencia: ¿vasculatura? → ¿semilla? → ¿flor y fruto? → ¿cuántos cotiledones?
          </p>

          <div className={styles.tablaComparativa}>
            <h4 className={styles.eduSubtitulo}>Los 6 grupos comparados</h4>
            {[
              { caracteristica: 'Algas', valor: 'Sin vasculatura', detalle: 'Sin raíces, tallos ni hojas verdaderas. El grupo ancestral de todas las plantas' },
              { caracteristica: 'Briófitos', valor: 'Sin vasculatura', detalle: 'Primeros en colonizar tierra. Necesitan agua para reproducirse. Gametofito dominante.' },
              { caracteristica: 'Pteridófitos', valor: 'Con vasculatura', detalle: 'Primera vasculatura (xilema+floema). Sin semilla: esporas en soros.' },
              { caracteristica: 'Gimnospermas', valor: 'Semilla desnuda', detalle: 'Semilla en conos, sin fruto envolvente. Polinización por viento.' },
              { caracteristica: 'Monocotiledóneas', valor: '1 cotiledón', detalle: 'Hojas paralelinervias, raíz fasciculada, flores trímeras.' },
              { caracteristica: 'Dicotiledóneas', valor: '2 cotiledones', detalle: 'Hojas reticuladas, raíz pivotante, flores 4-5-meras, madera.' },
            ].map((fila) => (
              <div key={fila.caracteristica} className={styles.filaTabla}>
                <span className={styles.celdaCaracteristica}>{fila.caracteristica}</span>
                <span className={styles.celdaValor}>{fila.valor}</span>
                <span className={styles.celdaDetalle}>{fila.detalle}</span>
              </div>
            ))}
          </div>

          <div className={styles.pasos}>
            <h4 className={styles.eduSubtitulo}>Clave dicotómica rápida (5 pasos)</h4>
            {[
              { numero: 1, titulo: '¿Tiene vasculatura?', descripcion: 'Sin xilema ni floema → alga o briófito. Con sistema vascular → pteridófito o planta con semilla.' },
              { numero: 2, titulo: '¿Produce semilla?', descripcion: 'Sin semilla → alga, briófito o pteridófito (esporas). Con semilla → fanerógama (gimnosperma o angiosperma).' },
              { numero: 3, titulo: '¿La semilla está en un fruto?', descripcion: 'Semilla desnuda (en conos) → gimnosperma. Semilla cubierta por fruto → angiosperma.' },
              { numero: 4, titulo: '¿Cuántos cotiledones tiene la semilla?', descripcion: '1 cotiledón → monocotiledónea. 2 cotiledones → dicotiledónea.' },
              { numero: 5, titulo: '¿Cómo son las hojas?', descripcion: 'Pista adicional: nervación paralela → monocot. Nervación reticulada (red) → dicot.' },
            ].map((paso) => (
              <div key={paso.numero} className={styles.paso}>
                <div className={styles.pasoNumero}>{paso.numero}</div>
                <div>
                  <strong>{paso.titulo}</strong>
                  <p>{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.escenarios}>
            <h4 className={styles.eduSubtitulo}>¿Para quién es este quiz?</h4>
            <div className={styles.escenariosGrid}>
              {[
                { titulo: 'Preparar el examen de Biología', descripcion: 'Los grupos del reino vegetal son pregunta frecuente en exámenes de admisión universitaria. Practica con las 40 plantas para memorizar las características diagnósticas.', icono: '📚' },
                { titulo: 'Aficionado a la botánica', descripcion: 'Aprende a clasificar las plantas que ves en el campo o el jardín. ¿Es ese árbol una gimnosperma o una angiosperma? ¿Monocot o dicot?', icono: '🌿' },
                { titulo: 'Reto familiar o de grupo', descripcion: 'Modo rápido de 20 preguntas para jugar en familia. Los emojis y los nombres comunes hacen el quiz accesible para todos.', icono: '👨‍👩‍👧' },
                { titulo: 'Docente', descripcion: 'Recurso para repasar clasificación vegetal en clase o como actividad de evaluación rápida.', icono: '👩‍🏫' },
              ].map((s) => (
                <div key={s.titulo} className={styles.escenario}>
                  <span className={styles.escenarioIcono} aria-hidden="true">{s.icono}</span>
                  <strong>{s.titulo}</strong>
                  <p>{s.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.faq}>
            <h4 className={styles.eduSubtitulo}>Preguntas frecuentes</h4>
            {[
              { pregunta: '¿Los hongos son plantas?', respuesta: 'No. Los hongos tienen su propio reino (Fungi). No realizan fotosíntesis, tienen quitina en sus paredes (no celulosa) y obtienen nutrientes por absorción. Son más emparentados con los animales que con las plantas.' },
              { pregunta: '¿Cómo distingo monocotiledóneas de dicotiledóneas rápidamente?', respuesta: 'Mira las hojas: si las venas son paralelas → monocot. Si forman una red → dicot. También: flor con piezas en múltiplos de 3 → monocot; de 4 o 5 → dicot. El tronco leñoso (madera) indica casi siempre dicot.' },
              { pregunta: '¿Las algas son el grupo más antiguo?', respuesta: 'Son el más antiguo (surgieron hace unos 3.500 millones de años), pero no necesariamente el más simple: algunas algas pardas (kelp) tienen estructuras complejas. En biología evolutiva, "antiguo" no equivale a "simple".' },
              { pregunta: '¿La posidonia es un alga?', respuesta: '¡No! Es una trampa clásica. La posidonia es una angiosperma dicotiledónea que volvió al mar hace 65-100 millones de años. Tiene raíces, tallos, hojas y flores verdaderas. Sus praderas son ecosistemas cruciales del Mediterráneo.' },
            ].map((item) => (
              <details key={item.pregunta} className={styles.faqItem}>
                <summary className={styles.faqPregunta}>{item.pregunta}</summary>
                <p className={styles.faqRespuesta}>{item.respuesta}</p>
              </details>
            ))}
          </div>

          <div className={styles.tips}>
            <h4 className={styles.eduSubtitulo}>Trucos para no confundirse</h4>
            <ul className={styles.tipsList}>
              {[
                'La posidonia del Mediterráneo es angiosperma, no alga — ¡la trampa más famosa de la botánica!',
                'Todos los cereales (trigo, arroz, maíz) son monocotiledóneas; casi todas las frutas de hueso (melocotón, cereza) son dicotiledóneas.',
                'Las coníferas no tienen flor ni fruto, pero sí producen semilla: son gimnospermas con "piñas" en lugar de frutos.',
                'Si un "árbol" no tiene madera verdadera (bambú, palmera), probablemente es una monocotiledónea.',
              ].map((tip) => (
                <li key={tip} className={styles.tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className={styles.erroresComunes}>
            <h4 className={styles.eduSubtitulo}>Errores comunes</h4>
            <ul className={styles.erroresList}>
              {[
                'Clasificar la palmera como gimnosperma por su tronco sin ramas: es monocotiledónea angiosperma — produce flores y dátiles (frutos).',
                'Confundir el Ginkgo con una dicotiledónea por sus hojas anchas: es gimnosperma, la única de la división Ginkgophyta.',
                'Pensar que todos los árboles son dicotiledóneas: palmeras y bambúes son monocotiledóneas de gran porte.',
                'Asumir que si algo vive en el agua es alga: la posidonia, el nenúfar y el jacinto de agua son angiospermas acuáticas.',
              ].map((error) => (
                <li key={error} className={styles.errorComunItem}>{error}</li>
              ))}
            </ul>
          </div>

          <div className={styles.warningBox} role="note">
            <strong>Nota pedagógica:</strong> La clasificación de los seis grupos presentada sigue la taxonomía tradicional usada en biología de secundaria. La sistemática moderna (APG IV) organiza las angiospermas de forma diferente; los términos monocotiledónea y dicotiledónea siguen siendo válidos pero las dicotiledóneas ya no se consideran un grupo natural (parafilético).
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('quiz-tipos-plantas')} />
        <ShareCard appName="quiz-tipos-plantas" />
      </main>
      <Footer appName="quiz-tipos-plantas" />
    </div>
  );
}
