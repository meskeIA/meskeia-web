'use client';
// @disclaimer: exempt
import React, { useState } from 'react';
import { metadata, jsonLd } from './metadata';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorReinoVegetal.module.css';

// Suprimir advertencia de metadata no usada en client component
void metadata;

// ============================================================================
// TIPOS
// ============================================================================

interface GrupoVegetal {
  id: string;
  nombre: string;
  nombreCientifico: string;
  emoji: string;
  colorHex: string;
  vasculatura: boolean;
  semilla: boolean | 'desnuda' | 'cubierta';
  flor: boolean | string;
  fruto: boolean;
  reproduccion: string;
  especiesAprox: string;
  caracteristicas: string[];
  habitats: string[];
  importancia: string;
  ejemplos: { comun: string; cientifico: string }[];
  parentId: string;
}

interface SeccionPrincipal {
  id: string;
  nombre: string;
  descripcion: string;
  colorHex: string;
  subgrupos: string[];
}

// ============================================================================
// DATOS: grupos vegetales
// ============================================================================

const SECCIONES: SeccionPrincipal[] = [
  {
    id: 'criptogamas',
    nombre: 'Criptógamas',
    descripcion: 'Sin semilla',
    colorHex: '#2E86AB',
    subgrupos: ['algas-verdes', 'algas-rojas', 'algas-pardas', 'musgos', 'hepaticas', 'antocerotas', 'helechos', 'equisetos', 'licopodios', 'liquenes'],
  },
  {
    id: 'fanerogamas',
    nombre: 'Fanerógamas',
    descripcion: 'Con semilla',
    colorHex: '#C0392B',
    subgrupos: ['coniferas', 'cicadaceas', 'ginkgo', 'gnetofitas', 'monocotiledoneas', 'dicotiledoneas'],
  },
];

const GRUPOS: GrupoVegetal[] = [
  // --- ALGAS ---
  {
    id: 'algas-verdes',
    nombre: 'Algas verdes',
    nombreCientifico: 'Chlorophyta',
    emoji: '🟢',
    colorHex: '#2E86AB',
    vasculatura: false,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Sexual y asexual (esporas, gametos)',
    especiesAprox: '~7.000',
    caracteristicas: [
      'Fotosíntesis con clorofila a + b (igual que plantas terrestres)',
      'Muchas especies unicelulares o coloniales',
      'Ancestros directos de las plantas terrestres',
      'Pared celular de celulosa',
    ],
    habitats: ['Agua dulce', 'Agua marina', 'Suelo húmedo', 'Nieve y hielo'],
    importancia: 'Base de cadenas tróficas acuáticas; producen gran parte del oxígeno terrestre; ancestros evolutivos de las plantas.',
    ejemplos: [
      { comun: 'Lechuga de mar', cientifico: 'Ulva lactuca' },
      { comun: 'Caulerpa', cientifico: 'Caulerpa taxifolia' },
      { comun: 'Cara de agua', cientifico: 'Chara vulgaris' },
      { comun: 'Spirogyra', cientifico: 'Spirogyra sp.' },
    ],
    parentId: 'criptogamas',
  },
  {
    id: 'algas-rojas',
    nombre: 'Algas rojas',
    nombreCientifico: 'Rhodophyta',
    emoji: '🔴',
    colorHex: '#2E86AB',
    vasculatura: false,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Sexual (sin flagelos) y asexual',
    especiesAprox: '~7.000',
    caracteristicas: [
      'Pigmento ficoeritrina: captan luz azul a grandes profundidades',
      'Fuente natural de agar-agar y carragenanos',
      'Casi exclusivamente marinas',
      'Sin flagelos en ninguna fase del ciclo',
    ],
    habitats: ['Océanos tropicales y templados', 'Zonas intermareales y submareales profundas'],
    importancia: 'Industria alimentaria (agar, nori), farmacia (carragenanos), arrecifes de coral coralinos.',
    ejemplos: [
      { comun: 'Nori', cientifico: 'Porphyra umbilicalis' },
      { comun: 'Gracilaria', cientifico: 'Gracilaria gracilis' },
      { comun: 'Gelidio', cientifico: 'Gelidium corneum' },
      { comun: 'Coralina', cientifico: 'Corallina officinalis' },
    ],
    parentId: 'criptogamas',
  },
  {
    id: 'algas-pardas',
    nombre: 'Algas pardas',
    nombreCientifico: 'Phaeophyta',
    emoji: '🟤',
    colorHex: '#2E86AB',
    vasculatura: false,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Sexual (alternancia de generaciones) y asexual',
    especiesAprox: '~1.500',
    caracteristicas: [
      'Las más grandes: kelp gigante hasta 45 m de longitud',
      'Pigmento fucoxantina (color pardo)',
      'Alginatos industriales (espesantes, gelificantes)',
      'Forman bosques submarinos altamente productivos',
    ],
    habitats: ['Aguas frías y templadas', 'Costas rocosas intermareales', 'Océano abierto (Sargassum)'],
    importancia: 'Ecosistemas de kelp (refugio para peces); alginatos en alimentación, farmacia y cosmética; fertilizantes.',
    ejemplos: [
      { comun: 'Kelp gigante', cientifico: 'Macrocystis pyrifera' },
      { comun: 'Fucus', cientifico: 'Fucus vesiculosus' },
      { comun: 'Sargaso', cientifico: 'Sargassum fluitans' },
      { comun: 'Laminaria', cientifico: 'Laminaria digitata' },
    ],
    parentId: 'criptogamas',
  },
  // --- BRIÓFITOS ---
  {
    id: 'musgos',
    nombre: 'Musgos',
    nombreCientifico: 'Musci (Bryophyta)',
    emoji: '🌱',
    colorHex: '#48A9A6',
    vasculatura: false,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Esporas; reproducción sexual necesita agua',
    especiesAprox: '~12.000',
    caracteristicas: [
      'Primeras plantas en colonizar la tierra firme',
      'Sin raíces verdaderas: rizoides para anclaje',
      'Absorben agua y nutrientes por toda la superficie',
      'Gametofito dominante; esporófito dependiente',
    ],
    habitats: ['Bosques húmedos', 'Turberas', 'Rocas', 'Troncos caídos'],
    importancia: 'Sphagnum retiene hasta 20× su peso en agua; forma turberas; almacena carbono; indicador de calidad ambiental.',
    ejemplos: [
      { comun: 'Musgo de turbera', cientifico: 'Sphagnum palustre' },
      { comun: 'Politriquio', cientifico: 'Polytrichum commune' },
      { comun: 'Musgo de roca', cientifico: 'Grimmia pulvinata' },
      { comun: 'Funaria', cientifico: 'Funaria hygrometrica' },
    ],
    parentId: 'criptogamas',
  },
  {
    id: 'hepaticas',
    nombre: 'Hepáticas',
    nombreCientifico: 'Marchantiophyta',
    emoji: '🫁',
    colorHex: '#48A9A6',
    vasculatura: false,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Esporas y reproducción vegetativa (propágulos)',
    especiesAprox: '~6.000',
    caracteristicas: [
      'Talosa (aplanada) o foliosa (con hojitas en dos filas)',
      'Sin cutícula bien desarrollada',
      'Indicadoras de humedad y calidad del aire',
      'Gametofito dominante',
    ],
    habitats: ['Suelos húmedos', 'Rocas mojadas', 'Orillas de arroyos', 'Troncos'],
    importancia: 'Bioindicadoras de ecosistemas saludables; participan en la formación de suelo.',
    ejemplos: [
      { comun: 'Marchantia', cientifico: 'Marchantia polymorpha' },
      { comun: 'Pellia', cientifico: 'Pellia epiphylla' },
      { comun: 'Conocephalum', cientifico: 'Conocephalum conicum' },
      { comun: 'Lophocolea', cientifico: 'Lophocolea bidentata' },
    ],
    parentId: 'criptogamas',
  },
  {
    id: 'antocerotas',
    nombre: 'Antocerotas',
    nombreCientifico: 'Anthocerotophyta',
    emoji: '🌿',
    colorHex: '#48A9A6',
    vasculatura: false,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Esporas; sexual con agua',
    especiesAprox: '~400',
    caracteristicas: [
      'Cloroplasto único grande con pirenoide (fija CO₂)',
      'Esporófito fotosintético e independiente (único entre briófitos)',
      'Talo plano con cavidades de cianobacterias (fijación de N₂)',
      'Esporangios alargados que se abren desde el ápice',
    ],
    habitats: ['Suelos húmedos', 'Bordes de caminos', 'Campos de cultivo húmedos'],
    importancia: 'Fijación de nitrógeno atmosférico en simbiosis con cianobacterias; interés evolutivo.',
    ejemplos: [
      { comun: 'Anthoceros', cientifico: 'Anthoceros punctatus' },
      { comun: 'Phaeoceros', cientifico: 'Phaeoceros laevis' },
    ],
    parentId: 'criptogamas',
  },
  // --- PTERIDÓFITOS ---
  {
    id: 'helechos',
    nombre: 'Helechos',
    nombreCientifico: 'Polypodiopsida',
    emoji: '🌿',
    colorHex: '#5BA05A',
    vasculatura: true,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Esporas (soros en envés de frondas); sexual necesita agua',
    especiesAprox: '~10.500',
    caracteristicas: [
      'Primera vasculatura: xilema y floema para transporte a larga distancia',
      'Hojas = frondas; esporas en soros en el envés',
      'Esporófito dominante; prótalo (gametofito) libre y fotosintético',
      'Necesitan agua para la fecundación (anterozoides flagelados)',
    ],
    habitats: ['Bosques húmedos y sombríos', 'Bordes de arroyos', 'Regiones tropicales'],
    importancia: 'Carbón vegetal del Carbonífero; helecho común invasor en pastos; uso ornamental; bioindicadores.',
    ejemplos: [
      { comun: 'Helecho común', cientifico: 'Pteridium aquilinum' },
      { comun: 'Dryóptero', cientifico: 'Dryopteris filix-mas' },
      { comun: 'Culantrillo', cientifico: 'Adiantum capillus-veneris' },
      { comun: 'Helecho real', cientifico: 'Osmunda regalis' },
    ],
    parentId: 'criptogamas',
  },
  {
    id: 'equisetos',
    nombre: 'Equisetos',
    nombreCientifico: 'Equisetopsida',
    emoji: '🪨',
    colorHex: '#5BA05A',
    vasculatura: true,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Esporas; esporangios en estróbilos terminales',
    especiesAprox: '~15',
    caracteristicas: [
      'Tallo articulado impregnado de sílice (abrasivo)',
      'Hojas reducidas en verticilos en los nudos',
      'Solo queda el género Equisetum',
      'En el Carbonífero eran árboles de hasta 30 m',
    ],
    habitats: ['Bordes de ríos y arroyos', 'Suelos húmedos', 'Zonas pantanosas'],
    importancia: 'Fósil viviente; en el pasado formaron gran parte del carbón mineral; el tallo fue usado para limpiar utensilios.',
    ejemplos: [
      { comun: 'Cola de caballo', cientifico: 'Equisetum arvense' },
      { comun: 'Equiseto de río', cientifico: 'Equisetum fluviatile' },
      { comun: 'Equiseto de ciénaga', cientifico: 'Equisetum palustre' },
    ],
    parentId: 'criptogamas',
  },
  {
    id: 'licopodios',
    nombre: 'Licopodios',
    nombreCientifico: 'Lycopodiopsida',
    emoji: '🔗',
    colorHex: '#5BA05A',
    vasculatura: true,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Esporas homospóricas o heterospóricas (micro y megásporas)',
    especiesAprox: '~1.200',
    caracteristicas: [
      'Micrófilos: hoja con una sola vena (carácter primitivo)',
      'Selaginella: heterosporia, clave en la evolución de la semilla',
      'En el Carbonífero eran lepidodendros de 40 m',
      'Raíces dicotómicas',
    ],
    habitats: ['Bosques de montaña', 'Turberas', 'Ambientes tropicales'],
    importancia: 'Interés evolutivo: Selaginella muestra el paso hacia la semilla; esporas de Lycopodium usadas en fuegos artificiales.',
    ejemplos: [
      { comun: 'Licopodio', cientifico: 'Lycopodium clavatum' },
      { comun: 'Selaginela', cientifico: 'Selaginella martensii' },
      { comun: 'Isoetes', cientifico: 'Isoetes lacustris' },
    ],
    parentId: 'criptogamas',
  },
  // --- LÍQUENES ---
  {
    id: 'liquenes',
    nombre: 'Líquenes',
    nombreCientifico: 'Lichenes (simbiosis)',
    emoji: '🪨',
    colorHex: '#A0906A',
    vasculatura: false,
    semilla: false,
    flor: false,
    fruto: false,
    reproduccion: 'Fragmentación, soredios, isidios; sexual en el micobionte',
    especiesAprox: '~20.000',
    caracteristicas: [
      'Simbiosis: hongo (micobionte) + alga o cianobacteria (fotobionte)',
      'No son plantas; se estudian junto a ellas por razones históricas',
      'Pioneros en suelos desnudos y rocas',
      'Liquenometría: dating de superficies geológicas',
    ],
    habitats: ['Rocas árticas y alpinas', 'Corteza de árboles', 'Suelos desérticos', 'Tundra'],
    importancia: 'Bioindicadores de contaminación atmosférica; fuente de colorantes (orceína, tornasol); alimento de renos.',
    ejemplos: [
      { comun: 'Xantoria', cientifico: 'Xanthoria parietina' },
      { comun: 'Liquen islandés', cientifico: 'Cetraria islandica' },
      { comun: 'Parmélia', cientifico: 'Parmelia sulcata' },
      { comun: 'Barba de viejo', cientifico: 'Usnea barbata' },
    ],
    parentId: 'criptogamas',
  },
  // --- GIMNOSPERMAS ---
  {
    id: 'coniferas',
    nombre: 'Coníferas',
    nombreCientifico: 'Pinophyta / Coniferales',
    emoji: '🌲',
    colorHex: '#8B5A2B',
    vasculatura: true,
    semilla: 'desnuda',
    flor: false,
    fruto: false,
    reproduccion: 'Semillas en conos (estróbilos); polinización por viento',
    especiesAprox: '~615',
    caracteristicas: [
      'Hoja acicular o escamosa con cutícula gruesa',
      'Canales resiníferos (terpenoides protectores)',
      'Conos masculinos y femeninos en la misma planta',
      'Madera de traqueidas (madera blanda)',
    ],
    habitats: ['Bosques boreales (taiga)', 'Zonas de montaña', 'Mediterráneo'],
    importancia: 'Madera de construcción; papel; resinas; turismo (parques de secuoyas); captación de carbono en taiga.',
    ejemplos: [
      { comun: 'Pino silvestre', cientifico: 'Pinus sylvestris' },
      { comun: 'Abeto blanco', cientifico: 'Abies alba' },
      { comun: 'Secuoya gigante', cientifico: 'Sequoiadendron giganteum' },
      { comun: 'Ciprés mediterráneo', cientifico: 'Cupressus sempervirens' },
    ],
    parentId: 'fanerogamas',
  },
  {
    id: 'cicadaceas',
    nombre: 'Cicadáceas',
    nombreCientifico: 'Cycadophyta',
    emoji: '🌴',
    colorHex: '#8B5A2B',
    vasculatura: true,
    semilla: 'desnuda',
    flor: false,
    fruto: false,
    reproduccion: 'Semillas en conos; anterozoides flagelados (primitivo)',
    especiesAprox: '~350',
    caracteristicas: [
      'Aspecto de palmera pero son gimnospermas',
      'Conos separados en planta masculina y femenina (dioicas)',
      'Óvulos visibles en hojas fértiles modificadas (megasporófilos)',
      'Crecimiento muy lento; algunas viven 1.000 años',
    ],
    habitats: ['Regiones tropicales y subtropicales', 'Sabanas', 'Bosques abiertos'],
    importancia: 'Ornamentales; interés evolutivo (primitivas); algunas tóxicas (cicasina); alimento para fauna en trópicos.',
    ejemplos: [
      { comun: 'Cica', cientifico: 'Cycas revoluta' },
      { comun: 'Zamia', cientifico: 'Zamia pumila' },
      { comun: 'Encéfalo', cientifico: 'Encephalartos altensteinii' },
    ],
    parentId: 'fanerogamas',
  },
  {
    id: 'ginkgo',
    nombre: 'Ginkgo',
    nombreCientifico: 'Ginkgophyta',
    emoji: '🍃',
    colorHex: '#8B5A2B',
    vasculatura: true,
    semilla: 'desnuda',
    flor: false,
    fruto: false,
    reproduccion: 'Semillas; anterozoides flagelados; polinización por viento',
    especiesAprox: '1',
    caracteristicas: [
      'Fósil viviente: sin cambios morfológicos desde el Jurásico (~200 Ma)',
      'Único superviviente de la división Ginkgophyta',
      'Dioico: planta masculina y femenina separadas',
      'Hoja en abanico con venación dicotómica',
    ],
    habitats: ['Originario de China', 'Cultivado en todo el mundo como ornamental'],
    importancia: 'Ornamental muy resistente a contaminación y plagas; extractos con posibles efectos neuroprotectores (investigación en curso); las semillas producen ácido butírico al madurar.',
    ejemplos: [
      { comun: 'Ginkgo biloba', cientifico: 'Ginkgo biloba' },
    ],
    parentId: 'fanerogamas',
  },
  {
    id: 'gnetofitas',
    nombre: 'Gnetofitas',
    nombreCientifico: 'Gnetophyta',
    emoji: '🌵',
    colorHex: '#8B5A2B',
    vasculatura: true,
    semilla: 'desnuda',
    flor: 'Falsa (estructuras parecidas)',
    fruto: false,
    reproduccion: 'Semillas; polinización por viento y algunos insectos',
    especiesAprox: '~90',
    caracteristicas: [
      'Tres géneros muy diferentes: Welwitschia, Ephedra, Gnetum',
      'Estructuras florales más complejas que otras gimnospermas',
      'Welwitschia: solo 2 hojas durante toda su vida (hasta 1.500 años)',
      'Algunas tienen vasos en xilema (como angiospermas)',
    ],
    habitats: ['Desiertos (Welwitschia)', 'Zonas áridas (Ephedra)', 'Bosques tropicales (Gnetum)'],
    importancia: 'Ephedra fuente de efedrina; Welwitschia símbolo de Namibia; interés evolutivo (posible enlace con angiospermas).',
    ejemplos: [
      { comun: 'Welwitschia', cientifico: 'Welwitschia mirabilis' },
      { comun: 'Ephedra', cientifico: 'Ephedra fragilis' },
      { comun: 'Gnetum', cientifico: 'Gnetum gnemon' },
    ],
    parentId: 'fanerogamas',
  },
  // --- ANGIOSPERMAS ---
  {
    id: 'monocotiledoneas',
    nombre: 'Monocotiledóneas',
    nombreCientifico: 'Liliopsida',
    emoji: '🌾',
    colorHex: '#C0392B',
    vasculatura: true,
    semilla: 'cubierta',
    flor: 'Trímera (piezas en múltiplos de 3)',
    fruto: true,
    reproduccion: 'Semillas con fruto; polinización por viento (gramíneas) o insectos',
    especiesAprox: '~60.000',
    caracteristicas: [
      '1 cotiledón (hoja embrionaria)',
      'Hojas paralelinervias (nervios paralelos)',
      'Raíz fasciculada (muchas raíces finas)',
      'Sin crecimiento secundario: no producen madera',
    ],
    habitats: ['Todos los ecosistemas terrestres', 'Cultivos (cereales, arroz)', 'Zonas tropicales (palmeras, orquídeas)'],
    importancia: 'Cereales: base alimentaria mundial (trigo, arroz, maíz); caña de azúcar; bamb; palmeras para aceite y cocos.',
    ejemplos: [
      { comun: 'Trigo', cientifico: 'Triticum aestivum' },
      { comun: 'Orquídea', cientifico: 'Orchis mascula' },
      { comun: 'Palmera datilera', cientifico: 'Phoenix dactylifera' },
      { comun: 'Lirio', cientifico: 'Iris germanica' },
      { comun: 'Maíz', cientifico: 'Zea mays' },
    ],
    parentId: 'fanerogamas',
  },
  {
    id: 'dicotiledoneas',
    nombre: 'Dicotiledóneas',
    nombreCientifico: 'Magnoliopsida (Eudicots)',
    emoji: '🌹',
    colorHex: '#C0392B',
    vasculatura: true,
    semilla: 'cubierta',
    flor: 'Tetrámera o pentámera (4-5 piezas)',
    fruto: true,
    reproduccion: 'Semillas con fruto; polinización por insectos, aves, viento',
    especiesAprox: '~175.000',
    caracteristicas: [
      '2 cotiledones (hojas embrionarias)',
      'Hojas penninervias o palminervias',
      'Raíz pivotante (raíz principal gruesa)',
      'Crecimiento secundario: producen madera (leñosas) o no (herbáceas)',
    ],
    habitats: ['Todos los ecosistemas terrestres', 'Bosques templados y tropicales', 'Cultivos (legumbres, frutas, hortalizas)'],
    importancia: 'El grupo más diverso: árboles forestales, frutas, hortalizas, legumbres, flores ornamentales, plantas medicinales.',
    ejemplos: [
      { comun: 'Roble', cientifico: 'Quercus robur' },
      { comun: 'Rosa', cientifico: 'Rosa gallica' },
      { comun: 'Tomate', cientifico: 'Solanum lycopersicum' },
      { comun: 'Girasol', cientifico: 'Helianthus annuus' },
      { comun: 'Manzano', cientifico: 'Malus domestica' },
    ],
    parentId: 'fanerogamas',
  },
];

// ============================================================================
// DATOS: tabla comparativa
// ============================================================================

interface FilaComparativa {
  grupo: string;
  vasculatura: string;
  semilla: string;
  flor: string;
  fruto: string;
  reproduccion: string;
  nEspecies: string;
  ejemploIconico: string;
  color: string;
}

const TABLA_COMPARATIVA: FilaComparativa[] = [
  { grupo: 'Algas', vasculatura: '❌', semilla: '❌', flor: '❌', fruto: '❌', reproduccion: 'Esporas/gametos', nEspecies: '~72.500', ejemploIconico: 'Kelp gigante', color: '#2E86AB' },
  { grupo: 'Briófitos', vasculatura: '❌', semilla: '❌', flor: '❌', fruto: '❌', reproduccion: 'Esporas', nEspecies: '~20.000', ejemploIconico: 'Sphagnum', color: '#48A9A6' },
  { grupo: 'Pteridófitos', vasculatura: '✅', semilla: '❌', flor: '❌', fruto: '❌', reproduccion: 'Esporas', nEspecies: '~12.000', ejemploIconico: 'Helecho común', color: '#5BA05A' },
  { grupo: 'Líquenes', vasculatura: '❌', semilla: '❌', flor: '❌', fruto: '❌', reproduccion: 'Fragmentación', nEspecies: '~20.000', ejemploIconico: 'Xanthoria', color: '#A0906A' },
  { grupo: 'Gimnospermas', vasculatura: '✅', semilla: '✅ desnuda', flor: '❌ (cono)', fruto: '❌', reproduccion: 'Semillas', nEspecies: '~1.000', ejemploIconico: 'Pino silvestre', color: '#8B5A2B' },
  { grupo: 'Monocotiledóneas', vasculatura: '✅', semilla: '✅ cubierta', flor: '✅ trímera', fruto: '✅', reproduccion: 'Semillas', nEspecies: '~60.000', ejemploIconico: 'Orquídea', color: '#C0392B' },
  { grupo: 'Dicotiledóneas', vasculatura: '✅', semilla: '✅ cubierta', flor: '✅ 4-5 pétalos', fruto: '✅', reproduccion: 'Semillas', nEspecies: '~175.000', ejemploIconico: 'Rosa', color: '#8E1B2B' },
];

// ============================================================================
// DATOS: ciclos de vida
// ============================================================================

interface CicloVida {
  id: string;
  titulo: string;
  subtitulo: string;
  emoji: string;
  colorHex: string;
  pasos: string[];
  ventajaEvolutiva: string;
}

const CICLOS: CicloVida[] = [
  {
    id: 'briofitos',
    titulo: 'Patrón 1: Briófitos',
    subtitulo: 'Gametofito dominante',
    emoji: '🌱',
    colorHex: '#48A9A6',
    pasos: [
      'Gametofito (planta verde que vemos) produce gametos',
      'Fecundación: necesita película de agua para los anterozoides flagelados',
      'Esporófito pequeño crece sobre el gametofito (dependiente de él)',
      'Esporangios liberan esporas',
      'Esporas germinan → nuevo gametofito',
    ],
    ventajaEvolutiva: 'Limitación: dependen del agua para reproducirse. No pueden colonizar ambientes secos.',
  },
  {
    id: 'pteridofitos',
    titulo: 'Patrón 2: Pteridófitos',
    subtitulo: 'Esporófito dominante; gametofito libre',
    emoji: '🌿',
    colorHex: '#5BA05A',
    pasos: [
      'Esporófito dominante (el helecho grande) produce esporas en soros',
      'Esporas dispersadas por el viento germinan → prótalo (gametofito pequeño, libre)',
      'Prótalo produce gametos (anterozoides y oosfera)',
      'Fecundación: sigue necesitando agua (anterozoides flagelados)',
      'Nuevo esporófito surge del cigoto → crece independiente',
    ],
    ventajaEvolutiva: 'Avance: esporófito más complejo con vasculatura. Desventaja: sigue necesitando agua para fecundación.',
  },
  {
    id: 'fanerogamas',
    titulo: 'Patrón 3: Fanerógamas',
    subtitulo: 'Independencia del agua — la gran innovación evolutiva',
    emoji: '🌸',
    colorHex: '#C0392B',
    pasos: [
      'Esporófito dominante: el árbol, arbusto o hierba que vemos',
      'Gametofito reducido al mínimo: dentro del cono (gimnospermas) o la flor (angiospermas)',
      'Polinización por viento, insectos o aves — sin necesidad de agua',
      'Tubo polínico lleva los gametos masculinos hasta el óvulo',
      'Semilla protege el embrión; fruto (angiospermas) dispersa las semillas',
    ],
    ventajaEvolutiva: 'Revolucionario: independencia total del agua para reproducirse. Permite colonizar ambientes áridos y ser el grupo dominante en tierra.',
  },
];

// ============================================================================
// SUBCOMPONENTE: árbol de clasificación
// ============================================================================

interface ArbolGrupoProps {
  seccion: SeccionPrincipal;
  grupos: GrupoVegetal[];
  grupoSeleccionado: string | null;
  onSeleccionar: (id: string) => void;
}

function ArbolGrupo({ seccion, grupos, grupoSeleccionado, onSeleccionar }: ArbolGrupoProps) {
  const [expandida, setExpandida] = useState(true);
  const gruposSeccion = grupos.filter(g => g.parentId === seccion.id);

  return (
    <div className={styles.arbolSeccion}>
      <button
        type="button"
        className={styles.arbolSeccionBtn}
        style={{ borderLeftColor: seccion.colorHex }}
        onClick={() => setExpandida(!expandida)}
        aria-expanded={expandida}
        aria-pressed={expandida}
      >
        <span className={styles.arbolToggle} aria-hidden="true">{expandida ? '▼' : '▶'}</span>
        <span className={styles.arbolSeccionNombre}>{seccion.nombre}</span>
        <span className={styles.arbolSeccionDesc}>{seccion.descripcion}</span>
      </button>

      {expandida && (
        <div className={styles.arbolSubgrupos}>
          {gruposSeccion.map(grupo => (
            <button
              key={grupo.id}
              type="button"
              className={`${styles.arbolGrupoBtn} ${grupoSeleccionado === grupo.id ? styles.arbolGrupoBtnActivo : ''}`}
              style={{ borderLeftColor: grupo.colorHex }}
              onClick={() => onSeleccionar(grupo.id)}
              aria-pressed={grupoSeleccionado === grupo.id}
            >
              <span className={styles.arbolGrupoEmoji} aria-hidden="true">{grupo.emoji}</span>
              <span className={styles.arbolGrupoNombre}>{grupo.nombre}</span>
              <span className={styles.arbolGrupoCientifico}>{grupo.nombreCientifico}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTE: panel de detalle
// ============================================================================

interface PanelDetalleProps {
  grupoId: string | null;
  grupos: GrupoVegetal[];
}

function PanelDetalle({ grupoId, grupos }: PanelDetalleProps) {
  const grupo = grupoId ? grupos.find(g => g.id === grupoId) : null;

  if (!grupo) {
    return (
      <div className={styles.detalleVacio}>
        <span className={styles.detalleVacioIcono} aria-hidden="true">🌿</span>
        <p>← Selecciona un grupo en el árbol de clasificación</p>
        <p className={styles.detalleVacioSub}>Aparecerán aquí sus características, reproducción y ejemplos</p>
      </div>
    );
  }

  const formatSemilla = (): string => {
    if (grupo.semilla === false) return '❌';
    if (grupo.semilla === 'desnuda') return '✅ desnuda (cono)';
    if (grupo.semilla === 'cubierta') return '✅ cubierta (fruto)';
    return '✅';
  };

  const formatFlor = (): string => {
    if (grupo.flor === false) return '❌';
    if (typeof grupo.flor === 'string') return `✅ ${grupo.flor}`;
    return '✅';
  };

  return (
    <div className={styles.detalle}>
      <div className={styles.detalleHeader} style={{ borderLeftColor: grupo.colorHex }}>
        <span className={styles.detalleEmoji} aria-hidden="true">{grupo.emoji}</span>
        <div>
          <h2 className={styles.detalleNombre}>{grupo.nombre}</h2>
          <p className={styles.detalleCientifico}><em>{grupo.nombreCientifico}</em></p>
        </div>
      </div>

      <div className={styles.detalleBadges}>
        <span className={`${styles.badge} ${grupo.vasculatura ? styles.badgeSi : styles.badgeNo}`}>
          {grupo.vasculatura ? '✅ Con vasculatura' : '❌ Sin vasculatura'}
        </span>
        <span className={`${styles.badge} ${grupo.semilla ? styles.badgeSi : styles.badgeNo}`}>
          Semilla: {formatSemilla()}
        </span>
        <span className={`${styles.badge} ${grupo.flor ? styles.badgeSi : styles.badgeNo}`}>
          Flor: {formatFlor()}
        </span>
        <span className={`${styles.badge} ${grupo.fruto ? styles.badgeSi : styles.badgeNo}`}>
          {grupo.fruto ? '✅ Con fruto' : '❌ Sin fruto'}
        </span>
      </div>

      <div className={styles.detalleGrid}>
        <div className={styles.detalleBloque}>
          <h3 className={styles.detalleBloqueTitle}>Características diagnósticas</h3>
          <ul className={styles.detalleList}>
            {grupo.caracteristicas.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <div className={styles.detalleBloque}>
          <h3 className={styles.detalleBloqueTitle}>Reproducción</h3>
          <p className={styles.detalleParrafo}>{grupo.reproduccion}</p>

          <h3 className={styles.detalleBloqueTitle}>Hábitats</h3>
          <ul className={styles.detalleList}>
            {grupo.habitats.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.detalleBloque}>
        <h3 className={styles.detalleBloqueTitle}>Importancia ecológica y económica</h3>
        <p className={styles.detalleParrafo}>{grupo.importancia}</p>
      </div>

      <div className={styles.detalleBloque}>
        <h3 className={styles.detalleBloqueTitle}>Ejemplos ({grupo.especiesAprox} especies aprox.)</h3>
        <div className={styles.ejemplosGrid}>
          {grupo.ejemplos.map((e, i) => (
            <div key={i} className={styles.ejemploCard}>
              <span className={styles.ejemploComun}>{e.comun}</span>
              <span className={styles.ejemploCientifico}><em>{e.cientifico}</em></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function VisualizadorReinoVegetal() {
  const [tabActivo, setTabActivo] = useState(0);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null);

  const tabs = ['Árbol de clasificación', 'En detalle', 'Comparativa', 'Ciclos de vida'];

  const handleSeleccionarGrupo = (id: string) => {
    setGrupoSeleccionado(id);
    setTabActivo(1);
  };

  return (
    <div className={styles.container}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcono} aria-hidden="true">🌿</span>
          <h1 className={styles.heroTitulo}>El Reino Vegetal</h1>
          <p className={styles.heroSubtitulo}>
            De las Algas a las Angiospermas — Clasificación interactiva
          </p>
          <p className={styles.heroDesc}>
            Árbol jerárquico clicable · Características diagnósticas · Tabla comparativa · Ciclos de vida
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* Tabs de navegación */}
        <nav className={styles.tabs} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={tabActivo === i}
              className={`${styles.tab} ${tabActivo === i ? styles.tabActivo : ''}`}
              onClick={() => setTabActivo(i)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Tab 1: Árbol de clasificación */}
        {tabActivo === 0 && (
          <section className={styles.tabContent} aria-label="Árbol de clasificación del reino vegetal">
            <div className={styles.arbolInfo}>
              <p className={styles.arbolHint}>
                Haz clic en cualquier grupo para ver sus características en detalle.
                Los grupos con <strong>▼</strong> se pueden contraer.
              </p>
            </div>
            <div className={styles.arbol}>
              {SECCIONES.map(seccion => (
                <ArbolGrupo
                  key={seccion.id}
                  seccion={seccion}
                  grupos={GRUPOS}
                  grupoSeleccionado={grupoSeleccionado}
                  onSeleccionar={handleSeleccionarGrupo}
                />
              ))}
            </div>
            <div className={styles.leyenda}>
              <h3 className={styles.leyendaTitulo}>Leyenda de colores</h3>
              <div className={styles.leyendaItems}>
                {[
                  { color: '#2E86AB', label: 'Algas' },
                  { color: '#48A9A6', label: 'Briófitos' },
                  { color: '#5BA05A', label: 'Pteridófitos' },
                  { color: '#A0906A', label: 'Líquenes' },
                  { color: '#8B5A2B', label: 'Gimnospermas' },
                  { color: '#C0392B', label: 'Angiospermas' },
                ].map(item => (
                  <div key={item.label} className={styles.leyendaItem}>
                    <span className={styles.leyendaDot} style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: En detalle */}
        {tabActivo === 1 && (
          <section className={styles.tabContent} aria-label="Detalle del grupo seleccionado">
            <div className={styles.detalleWrapper}>
              <aside className={styles.detalleSidebar}>
                <h3 className={styles.sidebarTitle}>Grupos</h3>
                {SECCIONES.map(seccion => (
                  <div key={seccion.id} className={styles.sidebarSeccion}>
                    <p className={styles.sidebarSeccionNombre} style={{ color: seccion.colorHex }}>
                      {seccion.nombre}
                    </p>
                    {GRUPOS.filter(g => g.parentId === seccion.id).map(grupo => (
                      <button
                        key={grupo.id}
                        type="button"
                        className={`${styles.sidebarBtn} ${grupoSeleccionado === grupo.id ? styles.sidebarBtnActivo : ''}`}
                        style={grupoSeleccionado === grupo.id ? { borderLeftColor: grupo.colorHex } : {}}
                        onClick={() => setGrupoSeleccionado(grupo.id)}
                        aria-pressed={grupoSeleccionado === grupo.id}
                      >
                        <span aria-hidden="true">{grupo.emoji}</span> {grupo.nombre}
                      </button>
                    ))}
                  </div>
                ))}
              </aside>
              <div className={styles.detallePrincipal}>
                <PanelDetalle grupoId={grupoSeleccionado} grupos={GRUPOS} />
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Comparativa */}
        {tabActivo === 2 && (
          <section className={styles.tabContent} aria-label="Tabla comparativa de grupos vegetales">
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <caption className={styles.tableCaption}>
                  Comparativa de los principales grupos del reino vegetal
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Grupo</th>
                    <th scope="col">Vasculatura</th>
                    <th scope="col">Semilla</th>
                    <th scope="col">Flor</th>
                    <th scope="col">Fruto</th>
                    <th scope="col">Reproducción</th>
                    <th scope="col">N.º especies</th>
                    <th scope="col">Ejemplo icónico</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLA_COMPARATIVA.map((fila, i) => (
                    <tr key={i} className={styles.tableRow}>
                      <td className={styles.tablaNombreGrupo}>
                        <span
                          className={styles.tablaDot}
                          style={{ backgroundColor: fila.color }}
                          aria-hidden="true"
                        />
                        {fila.grupo}
                      </td>
                      <td className={styles.tablaCentro}>{fila.vasculatura}</td>
                      <td className={styles.tablaCentro}>{fila.semilla}</td>
                      <td className={styles.tablaCentro}>{fila.flor}</td>
                      <td className={styles.tablaCentro}>{fila.fruto}</td>
                      <td>{fila.reproduccion}</td>
                      <td className={styles.tablaCentro}>{fila.nEspecies}</td>
                      <td><em>{fila.ejemploIconico}</em></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <p>
                <strong>Nota metodológica:</strong> Los líquenes no son plantas del reino Plantae sino
                simbiosis hongo-alga/cianobacteria. Se incluyen en esta tabla por su uso pedagógico
                tradicional en botánica.
              </p>
            </div>
          </section>
        )}

        {/* Tab 4: Ciclos de vida */}
        {tabActivo === 3 && (
          <section className={styles.tabContent} aria-label="Ciclos de vida de los grupos vegetales">
            <p className={styles.ciclosIntro}>
              La <strong>alternancia de generaciones</strong> (esporófito diploide ↔ gametofito haploide)
              es la clave de la reproducción vegetal. La evolución fue reduciendo el gametofito y
              aumentando la independencia del esporófito.
            </p>
            <div className={styles.ciclosGrid}>
              {CICLOS.map((ciclo, idx) => (
                <div key={ciclo.id} className={styles.cicloCard}>
                  <div className={styles.cicloHeader} style={{ borderLeftColor: ciclo.colorHex }}>
                    <span className={styles.cicloEmoji} aria-hidden="true">{ciclo.emoji}</span>
                    <div>
                      <h3 className={styles.cicloTitulo}>{ciclo.titulo}</h3>
                      <p className={styles.cicloSubtitulo}>{ciclo.subtitulo}</p>
                    </div>
                  </div>
                  <ol className={styles.cicloSteps}>
                    {ciclo.pasos.map((paso, i) => (
                      <li key={i} className={styles.cicloStep}>
                        <span className={styles.cicloStepNum} style={{ backgroundColor: ciclo.colorHex }}>
                          {i + 1}
                        </span>
                        <span>{paso}</span>
                      </li>
                    ))}
                  </ol>
                  <div className={styles.cicloVentaja}>
                    <strong>Perspectiva evolutiva:</strong> {ciclo.ventajaEvolutiva}
                  </div>
                  {idx < CICLOS.length - 1 && (
                    <div className={styles.cicloFlecha} aria-hidden="true">
                      ↓ Mayor complejidad evolutiva
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección educativa */}
        <EducationalSection
          title="Guía completa del Reino Vegetal"
          subtitle="De la clasificación a la identificación: todo lo que necesitas saber"
          icon="🌿"
        >
          <h3 className={styles.eduSubtitulo}>Cronología evolutiva</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Primer grupo</th>
                  <th>Logro evolutivo</th>
                  <th>Cuándo apareció</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { grupo: 'Algas', logro: 'Fotosíntesis oxigénica', cuando: 'hace ~3.500 Ma' },
                  { grupo: 'Briófito', logro: 'Primera planta terrestre', cuando: 'hace ~470 Ma' },
                  { grupo: 'Pteridófito', logro: 'Primera vasculatura (xilema+floema)', cuando: 'hace ~425 Ma' },
                  { grupo: 'Gimnosperma', logro: 'Primera semilla: independencia del agua', cuando: 'hace ~360 Ma' },
                  { grupo: 'Angiosperma', logro: 'Primera flor: coevolución con polinizadores', cuando: 'hace ~130 Ma' },
                  { grupo: 'Dicotiledóneas', logro: 'Grupo más diverso: ~175.000 especies', cuando: 'Actualmente' },
                ].map((fila, i) => (
                  <tr key={i}>
                    <td><strong>{fila.grupo}</strong></td>
                    <td>{fila.logro}</td>
                    <td>{fila.cuando}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitulo}>¿Para quién es útil este visualizador?</h3>
          <div className={styles.scenariosGrid}>
            {[
              { titulo: 'Estudiante de secundaria, preparatoria o Bachillerato', desc: 'Repasa la clasificación sistemática para Biología (educación media, preparatoria o 1º de Bachillerato). Los 4 grupos de criptógamas y los 2 de fanerógamas son el esquema básico.', emoji: '📚' },
              { titulo: 'Opositor o universitario', desc: 'Profundiza en características diagnósticas: vasculatura, tipo de gametofito, heterosporia, endospermia.', emoji: '🎓' },
              { titulo: 'Aficionado a la naturaleza', desc: 'Aprende a identificar qué tipo de planta tienes delante: ¿tiene flor? ¿produce fruto? ¿crece en lugares húmedos?', emoji: '🌿' },
              { titulo: 'Docente', desc: 'Recurso visual para explicar la evolución de las plantas desde el agua hasta los ecosistemas terrestres más complejos.', emoji: '👩‍🏫' },
            ].map((s, i) => (
              <div key={i} className={styles.scenarioCard}>
                <span className={styles.scenarioEmoji} aria-hidden="true">{s.emoji}</span>
                <h4 className={styles.scenarioTitle}>{s.titulo}</h4>
                <p className={styles.scenarioDesc}>{s.desc}</p>
              </div>
            ))}
          </div>

          <h3 className={styles.eduSubtitulo}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            {[
              {
                q: '¿Las algas son plantas?',
                a: 'No son plantas verdaderas (reino Plantae) aunque se estudian junto a ellas. Son protistas o cianobacterias según el grupo. Las algas verdes son las parientes más cercanas a las plantas terrestres.',
              },
              {
                q: '¿Cuál es la diferencia entre monocotiledóneas y dicotiledóneas?',
                a: 'El número de cotiledones (hojas embrionarias): 1 en monocots, 2 en dicots. Pero hay más diferencias: nervación de la hoja, tipo de raíz, número de piezas florales y presencia o no de crecimiento secundario (madera).',
              },
              {
                q: '¿Los helechos tienen flores?',
                a: 'No. Los helechos son pteridófitos: tienen vasculatura pero se reproducen por esporas, no por semillas ni flores. Las estructuras marrones del envés de la fronda son soros, grupos de esporangios.',
              },
              {
                q: '¿Por qué el Ginkgo biloba es un fósil viviente?',
                a: 'Porque su morfología no ha cambiado en unos 200 millones de años. Es el único superviviente de su división (Ginkgophyta). Los árboles modernos son genéticamente muy similares a los fósiles del Jurásico.',
              },
              {
                q: '¿Cuántas especies de plantas hay?',
                a: 'Unas 340.000-400.000 especies vegetales descritas. Las angiospermas suponen el 90% de todas las plantas con semilla y dominan casi todos los ecosistemas terrestres.',
              },
            ].map((faq, i) => (
              <div key={i} className={styles.faqItem}>
                <strong className={styles.faqPregunta}>{faq.q}</strong>
                <p className={styles.faqRespuesta}>{faq.a}</p>
              </div>
            ))}
          </div>

          <h3 className={styles.eduSubtitulo}>Cómo identificar un grupo paso a paso</h3>
          <ol className={styles.pasosList}>
            {[
              { n: 1, t: '¿Tiene vasculatura?', d: 'Sin xilema ni floema → alga o briófito. Con sistema vascular → pteridófito o planta con semilla.' },
              { n: 2, t: '¿Produce semilla?', d: 'Sin semilla + con vasculatura → pteridófito (helecho, cola de caballo). Con semilla → fanerógama.' },
              { n: 3, t: '¿La semilla está desnuda o cubierta?', d: 'Desnuda (en conos) → gimnosperma (pino, abeto). Cubierta por fruto → angiosperma.' },
              { n: 4, t: '¿Tiene flor?', d: 'Las angiospermas tienen flores. Las gimnospermas tienen conos (estróbilos) pero no flores verdaderas.' },
              { n: 5, t: '¿Cuántos cotiledones?', d: 'Solo en angiospermas: 1 cotiledón → monocotiledónea. 2 cotiledones → dicotiledónea.' },
            ].map(paso => (
              <li key={paso.n} className={styles.pasosItem}>
                <span className={styles.pasoNum}>{paso.n}</span>
                <div>
                  <strong>{paso.t}</strong>
                  <p>{paso.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className={styles.eduSubtitulo}>Consejos para recordar la clasificación</h3>
          <ul className={styles.tipsList}>
            {[
              'Recuerda la secuencia evolutiva: agua (algas) → tierra húmeda (briófitos) → tierra seca (pteridófitos) → semilla (gimnospermas) → flor y fruto (angiospermas)',
              'Las plantas más antiguas de la Tierra son los briófitos y pteridófitos; las más jóvenes evolutivamente son las angiospermas',
              'El Sphagnum (musgo de turbera) puede almacenar hasta 20 veces su peso en agua — fue utilizado como apósito en la I Guerra Mundial',
              'El 70% de los alimentos que consumimos los humanos provienen de angiospermas: monocotiledóneas (cereales) y dicotiledóneas (legumbres, frutas)',
            ].map((tip, i) => (
              <li key={i} className={styles.tipsItem}>{tip}</li>
            ))}
          </ul>

          <h3 className={styles.eduSubtitulo}>Errores comunes</h3>
          <ul className={styles.erroresList}>
            {[
              "Confundir 'planta' con 'vegetal': las algas son vegetales fotosintéticos pero no son plantas del reino Plantae",
              'Creer que los helechos son primitivos porque son criptógamas: tienen vasculatura, que es una innovación evolutiva importante',
              'Asumir que gimnosperma = conífera: hay 4 divisiones de gimnospermas (coníferas, cicadáceas, ginkgo, gnetofitas)',
              'Decir que las monocotiledóneas no tienen raíz verdadera: sí la tienen, pero es de tipo fasciculado (muchas raíces finas), no pivotante',
            ].map((error, i) => (
              <li key={i} className={styles.erroresItem}>{error}</li>
            ))}
          </ul>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-reino-vegetal')} />
        <ShareCard appName="visualizador-reino-vegetal" />
      </main>

      <Footer appName="visualizador-reino-vegetal" />
    </div>
  );
}
