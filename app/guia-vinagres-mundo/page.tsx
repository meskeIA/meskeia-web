'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaVinagresMundo.module.css';

type OrigenVinagre =
  | 'Vino'
  | 'Manzana'
  | 'Arroz'
  | 'Malta'
  | 'Caña azúcar'
  | 'Frutas'
  | 'Kombucha'
  | 'Coco'
  | 'Balsámico';

type Acidez = 'Baja' | 'Media' | 'Alta' | 'Muy alta';

type IntensidadSabor = 'Suave' | 'Medio' | 'Intenso' | 'Muy intenso';

type RegionVinagre =
  | 'Mediterráneo'
  | 'Asia'
  | 'América'
  | 'Europa Norte'
  | 'Internacional';

type UsoVinagre =
  | 'Aliñar'
  | 'Marinar'
  | 'Salsa'
  | 'Reducción'
  | 'Encurtir'
  | 'Bebida'
  | 'Postre';

interface Vinagre {
  nombre: string;
  nombreOriginal: string;
  origenMateriaPrima: OrigenVinagre;
  region: RegionVinagre;
  paisOrigen: string;
  acidez: Acidez;
  porcentajeAcidez: string;
  intensidad: IntensidadSabor;
  envejecimiento: string;
  notasDeSabor: string[];
  usosIdeales: UsoVinagre[];
  maridaje: string[];
  descripcion: string;
  curiosidad: string;
}

const ORIGENES: OrigenVinagre[] = [
  'Vino',
  'Manzana',
  'Arroz',
  'Malta',
  'Caña azúcar',
  'Frutas',
  'Kombucha',
  'Coco',
  'Balsámico',
];

const REGIONES: RegionVinagre[] = [
  'Mediterráneo',
  'Asia',
  'América',
  'Europa Norte',
  'Internacional',
];

const ACIDEZES: Acidez[] = ['Baja', 'Media', 'Alta', 'Muy alta'];

const INTENSIDADES: IntensidadSabor[] = [
  'Suave',
  'Medio',
  'Intenso',
  'Muy intenso',
];

const USOS: UsoVinagre[] = [
  'Aliñar',
  'Marinar',
  'Salsa',
  'Reducción',
  'Encurtir',
  'Bebida',
  'Postre',
];

const VINAGRES: Vinagre[] = [
  // ── BALSÁMICOS Y DE VINO (8) ────────────────────────────────────
  {
    nombre: 'Vinagre Balsámico de Módena IGP',
    nombreOriginal: 'Aceto Balsamico di Modena IGP',
    origenMateriaPrima: 'Balsámico',
    region: 'Mediterráneo',
    paisOrigen: 'Italia (Módena)',
    acidez: 'Media',
    porcentajeAcidez: '6%',
    intensidad: 'Intenso',
    envejecimiento: '60 días - 3 años',
    notasDeSabor: ['Dulce', 'Madera', 'Frutas oscuras', 'Caramelo'],
    usosIdeales: ['Aliñar', 'Salsa', 'Reducción'],
    maridaje: ['Ensaladas', 'Carpaccio', 'Fresas', 'Queso parmesano'],
    descripcion:
      'Vinagre IGP de Módena hecho con mosto cocido de uva trebbiano y lambrusco más vinagre de vino. Versión accesible del balsámico tradicional.',
    curiosidad:
      'Hay más de 50 productores con IGP, pero solo se producen 30 millones de litros al año.',
  },
  {
    nombre: 'Aceto Balsamico Tradizionale',
    nombreOriginal: 'Aceto Balsamico Tradizionale di Modena DOP',
    origenMateriaPrima: 'Balsámico',
    region: 'Mediterráneo',
    paisOrigen: 'Italia (Módena/Reggio)',
    acidez: 'Baja',
    porcentajeAcidez: '4.5%',
    intensidad: 'Muy intenso',
    envejecimiento: '12-25+ años',
    notasDeSabor: ['Dulce intenso', 'Madera de roble', 'Higos secos', 'Miel'],
    usosIdeales: ['Postre', 'Aliñar', 'Salsa'],
    maridaje: [
      'Helado de vainilla',
      'Parmesano viejo',
      'Fresas',
      'Foie gras',
    ],
    descripcion:
      'El verdadero balsámico, DOP envejecido mínimo 12 años en barricas de varios maderas. Solo se hace en Módena y Reggio Emilia. Una botella puede costar más de 200€.',
    curiosidad:
      'Una botella de 100ml de 25 años puede costar 800€ — se vende como un vino reserva.',
  },
  {
    nombre: 'Vinagre de Jerez DOP',
    nombreOriginal: 'Vinagre de Jerez DOP',
    origenMateriaPrima: 'Vino',
    region: 'Mediterráneo',
    paisOrigen: 'España (Jerez)',
    acidez: 'Alta',
    porcentajeAcidez: '7%',
    intensidad: 'Intenso',
    envejecimiento: '6 meses - 10 años',
    notasDeSabor: [
      'Vino oloroso',
      'Frutos secos',
      'Maderas nobles',
      'Pasas',
    ],
    usosIdeales: ['Aliñar', 'Marinar', 'Salsa'],
    maridaje: [
      'Gazpacho',
      'Marinados',
      'Salmorejo',
      'Verduras a la parrilla',
    ],
    descripcion:
      'Vinagre español con DOP elaborado en Jerez de la Frontera con el sistema de soleras y criaderas igual que el vino de Jerez. Hay tres categorías: Vinagre, Reserva y Gran Reserva.',
    curiosidad:
      'El sistema de soleras se aplicó al vinagre en el siglo XVIII — antes solo se usaba para vinos.',
  },
  {
    nombre: 'Vinagre de Champagne',
    nombreOriginal: 'Vinaigre de Champagne',
    origenMateriaPrima: 'Vino',
    region: 'Mediterráneo',
    paisOrigen: 'Francia (Champagne)',
    acidez: 'Media',
    porcentajeAcidez: '6.5%',
    intensidad: 'Suave',
    envejecimiento: '6-12 meses',
    notasDeSabor: [
      'Levaduras finas',
      'Notas florales',
      'Manzana verde',
      'Almendra',
    ],
    usosIdeales: ['Aliñar', 'Salsa'],
    maridaje: [
      'Pescados',
      'Mariscos',
      'Ensaladas delicadas',
      'Vinagretas',
    ],
    descripcion:
      'Vinagre elegante hecho con champagne. Más suave y aromático que vinagres de tinto, ideal para salsas delicadas y vinagretas finas para ensaladas verdes.',
    curiosidad:
      'Las casas de champagne más prestigiosas como Veuve Clicquot tienen su propia línea de vinagres.',
  },
  {
    nombre: 'Vinagre de vino tinto',
    nombreOriginal: 'Vinaigre de vin rouge',
    origenMateriaPrima: 'Vino',
    region: 'Mediterráneo',
    paisOrigen: 'Francia/España',
    acidez: 'Alta',
    porcentajeAcidez: '6-7%',
    intensidad: 'Intenso',
    envejecimiento: '3-12 meses',
    notasDeSabor: ['Frutas rojas', 'Especiado', 'Madera', 'Tánico'],
    usosIdeales: ['Marinar', 'Salsa', 'Aliñar'],
    maridaje: [
      'Carnes rojas',
      'Salsas demi-glace',
      'Estofados',
      'Quesos azules',
    ],
    descripcion:
      'Vinagre clásico francés y español hecho con vino tinto. Versátil en salsas reducidas y marinados de carnes rojas. Versión Orleans (artesanal) es la más fina.',
    curiosidad:
      'El método Orleans (sin pasteurizar) tarda meses pero produce vinagres con complejidad aromática única.',
  },
  {
    nombre: 'Vinagre de vino blanco',
    nombreOriginal: 'Vinaigre de vin blanc',
    origenMateriaPrima: 'Vino',
    region: 'Mediterráneo',
    paisOrigen: 'Francia/Italia',
    acidez: 'Alta',
    porcentajeAcidez: '6-7%',
    intensidad: 'Medio',
    envejecimiento: '3-6 meses',
    notasDeSabor: ['Cítrico', 'Floral', 'Hierbas', 'Manzana'],
    usosIdeales: ['Aliñar', 'Marinar', 'Salsa'],
    maridaje: [
      'Pescados',
      'Pollo',
      'Ensaladas',
      'Mahonesa casera',
    ],
    descripcion:
      'Vinagre versátil más ligero que el de tinto. Base de muchas vinagretas y mahonesa casera. Ideal para platos donde el color del vinagre tinto sería un problema.',
    curiosidad:
      'La mahonesa tradicional francesa lleva siempre vinagre de vino blanco — nunca limón.',
  },
  {
    nombre: 'Vinagre Forum (Cabernet)',
    nombreOriginal: 'Forum Cabernet Sauvignon',
    origenMateriaPrima: 'Vino',
    region: 'Mediterráneo',
    paisOrigen: 'España (Penedès)',
    acidez: 'Media',
    porcentajeAcidez: '6%',
    intensidad: 'Intenso',
    envejecimiento: 'Mínimo 6 meses en barrica',
    notasDeSabor: [
      'Cabernet Sauvignon',
      'Cassis',
      'Madera francesa',
      'Ciruela negra',
    ],
    usosIdeales: ['Aliñar', 'Salsa', 'Reducción'],
    maridaje: [
      'Foie gras',
      'Carnes a la brasa',
      'Ensaladas gourmet',
      'Magret de pato',
    ],
    descripcion:
      'Vinagre artesanal del Penedès elaborado con Cabernet Sauvignon y envejecido en barricas francesas. Considerado uno de los mejores vinagres de vino del mundo.',
    curiosidad:
      'Se vende en restaurantes Michelin de todo el mundo — la familia Cusiné lo elabora desde 1996.',
  },
  {
    nombre: 'Vinagre de Valdueza',
    nombreOriginal: 'Vinagre de Valdueza',
    origenMateriaPrima: 'Vino',
    region: 'Mediterráneo',
    paisOrigen: 'España (Extremadura)',
    acidez: 'Baja',
    porcentajeAcidez: '5%',
    intensidad: 'Intenso',
    envejecimiento: 'Mínimo 5 años en barrica',
    notasDeSabor: [
      'Tempranillo',
      'Madera',
      'Pasas',
      'Notas balsámicas',
    ],
    usosIdeales: ['Aliñar', 'Postre', 'Salsa'],
    maridaje: [
      'Foie gras',
      'Tablas de queso',
      'Reducción para carnes',
      'Helado de vainilla',
    ],
    descripcion:
      'Vinagre de alta gama español elaborado con Tempranillo en La Vera (Cáceres). Envejecido en barricas durante 5+ años. Premio internacional 2019.',
    curiosidad:
      'Su productor solo elabora 10.000 botellas al año — uno de los vinagres más exclusivos de España.',
  },

  // ── ASIA (5) ────────────────────────────────────────────────────
  {
    nombre: 'Vinagre de arroz japonés',
    nombreOriginal: 'Komezu / 米酢',
    origenMateriaPrima: 'Arroz',
    region: 'Asia',
    paisOrigen: 'Japón',
    acidez: 'Baja',
    porcentajeAcidez: '4-5%',
    intensidad: 'Suave',
    envejecimiento: 'Sin envejecer',
    notasDeSabor: [
      'Suave dulce',
      'Arroz',
      'Aroma limpio',
      'Notas a frutos secos',
    ],
    usosIdeales: ['Aliñar', 'Salsa', 'Encurtir'],
    maridaje: [
      'Sushi rice',
      'Tsukemono (encurtidos)',
      'Sunomono',
      'Ensaladas asiáticas',
    ],
    descripcion:
      'Vinagre japonés básico para preparar el arroz de sushi. Más suave y dulce que los vinagres occidentales, ideal para salsas y aliños asiáticos.',
    curiosidad:
      "El arroz que se aliña con komezu se llama 'sushi-meshi' — el arroz solo es 'gohan'.",
  },
  {
    nombre: 'Vinagre de arroz negro chino',
    nombreOriginal: 'Chinkiang vinegar / 鎮江香醋',
    origenMateriaPrima: 'Arroz',
    region: 'Asia',
    paisOrigen: 'China (Zhenjiang)',
    acidez: 'Alta',
    porcentajeAcidez: '5.5%',
    intensidad: 'Intenso',
    envejecimiento: '1-3 años',
    notasDeSabor: ['Maltas', 'Soja', 'Ahumado', 'Umami'],
    usosIdeales: ['Salsa', 'Marinar', 'Aliñar'],
    maridaje: [
      'Dim sum',
      'Dumplings',
      'Carne de cerdo agridulce',
      'Verduras salteadas',
    ],
    descripcion:
      'Vinagre negro chino con DOP de Zhenjiang. Hecho con arroz glutinoso fermentado y envejecido. Mucho más complejo y umami que los vinagres occidentales.',
    curiosidad:
      'Se considera el equivalente chino del balsámico de Módena — ambos tienen DOP equivalente.',
  },
  {
    nombre: 'Vinagre de arroz coreano',
    nombreOriginal: 'Sikcho / 식초',
    origenMateriaPrima: 'Arroz',
    region: 'Asia',
    paisOrigen: 'Corea del Sur',
    acidez: 'Media',
    porcentajeAcidez: '5-6%',
    intensidad: 'Medio',
    envejecimiento: 'Sin envejecer',
    notasDeSabor: [
      'Suave dulce',
      'Notas frutales',
      'Limpio',
      'Lacto-fermentado',
    ],
    usosIdeales: ['Aliñar', 'Encurtir', 'Salsa'],
    maridaje: [
      'Banchan',
      'Naengmyeon',
      'Cho-gochujang',
      'Verduras encurtidas',
    ],
    descripcion:
      'Vinagre coreano usado en multitud de banchan (acompañamientos). Más suave que el chino. Muchas familias hacen el suyo propio en casa.',
    curiosidad:
      "Tradicionalmente las familias coreanas guardaban una vasija de vinagre 'madre' que pasaba de generación en generación.",
  },
  {
    nombre: 'Vinagre de coco',
    nombreOriginal: 'Coconut vinegar',
    origenMateriaPrima: 'Coco',
    region: 'Asia',
    paisOrigen: 'Filipinas/Sri Lanka',
    acidez: 'Media',
    porcentajeAcidez: '4-5%',
    intensidad: 'Medio',
    envejecimiento: 'Sin envejecer',
    notasDeSabor: [
      'Suave dulce',
      'Tropical',
      'Coco fresco',
      'Notas a levadura',
    ],
    usosIdeales: ['Aliñar', 'Marinar', 'Bebida'],
    maridaje: [
      'Curry filipino',
      'Adobo',
      'Pescados al estilo asiático',
      'Ensaladas tropicales',
    ],
    descripcion:
      'Vinagre tropical hecho con savia de palmera de coco fermentada. Imprescindible en cocinas filipina, srilanquesa y del sur de la India. Probiótico natural.',
    curiosidad:
      'En Filipinas el adobo (plato nacional) lleva obligatoriamente vinagre de coco — no funciona con otro.',
  },
  {
    nombre: 'Vinagre de palma',
    nombreOriginal: 'Palm vinegar / Sukang Iloko',
    origenMateriaPrima: 'Caña azúcar',
    region: 'Asia',
    paisOrigen: 'Filipinas (Ilocos)',
    acidez: 'Media',
    porcentajeAcidez: '5%',
    intensidad: 'Medio',
    envejecimiento: '1-3 años',
    notasDeSabor: ['Maltas', 'Caramelo', 'Ahumado', 'Tropical'],
    usosIdeales: ['Marinar', 'Salsa'],
    maridaje: [
      'Sinigang',
      'Adobo de carne',
      'Pickled vegetables',
      'Lechon',
    ],
    descripcion:
      'Vinagre artesanal de la región Ilocos en Filipinas, hecho con savia de palma de nipa. Color ámbar oscuro y sabor profundo, popular en cocina ilocana tradicional.',
    curiosidad:
      "Se llama 'sukang Iloko' y solo se produce de forma artesanal — máximo 10.000 litros al año.",
  },

  // ── FRUTAS Y MANZANA (6) ────────────────────────────────────────
  {
    nombre: 'Vinagre de manzana',
    nombreOriginal: 'Apple cider vinegar',
    origenMateriaPrima: 'Manzana',
    region: 'Internacional',
    paisOrigen: 'EE.UU./Reino Unido',
    acidez: 'Media',
    porcentajeAcidez: '5-6%',
    intensidad: 'Medio',
    envejecimiento: 'Sin envejecer / 6 meses',
    notasDeSabor: [
      'Manzana fresca',
      'Levadura',
      'Frutal',
      'Suave',
    ],
    usosIdeales: ['Aliñar', 'Marinar', 'Bebida'],
    maridaje: [
      'Ensaladas con manzana',
      'Pollo',
      'Cerdo',
      'Vinagretas dulces',
    ],
    descripcion:
      "Vinagre obtenido al fermentar zumo de manzana. Versión 'sin filtrar' contiene la 'madre' (cultivo bacteriano) y se considera probiótico.",
    curiosidad:
      'Hipócrates lo recetaba ya en 400 a.C. para tratar tos y resfriados.',
  },
  {
    nombre: 'Vinagre de manzana Bragg',
    nombreOriginal: 'Bragg Apple Cider Vinegar',
    origenMateriaPrima: 'Manzana',
    region: 'América',
    paisOrigen: 'EE.UU. (California)',
    acidez: 'Media',
    porcentajeAcidez: '5%',
    intensidad: 'Medio',
    envejecimiento: 'Sin envejecer',
    notasDeSabor: [
      'Manzana fresca',
      'Probiótico',
      'Levadura natural',
      'Suave',
    ],
    usosIdeales: ['Bebida', 'Aliñar', 'Marinar'],
    maridaje: [
      'Smoothies salud',
      'Ensaladas',
      'Vinagretas naturales',
      'Tónico de manzana',
    ],
    descripcion:
      "La marca más famosa del mundo de vinagre de manzana orgánico sin filtrar con 'madre'. Símbolo del wellness desde los años 70 en EE.UU.",
    curiosidad:
      'Paul Bragg fundó la marca en 1912 — es uno de los productos health más antiguos aún en venta.',
  },
  {
    nombre: 'Vinagre de frambuesa',
    nombreOriginal: 'Vinaigre de framboise',
    origenMateriaPrima: 'Frutas',
    region: 'Mediterráneo',
    paisOrigen: 'Francia',
    acidez: 'Media',
    porcentajeAcidez: '5-6%',
    intensidad: 'Suave',
    envejecimiento: 'Maceración con frambuesas',
    notasDeSabor: [
      'Frambuesa intensa',
      'Floral',
      'Dulce-ácido',
      'Frutal',
    ],
    usosIdeales: ['Aliñar', 'Postre', 'Salsa'],
    maridaje: [
      'Ensalada de queso de cabra',
      'Vinagreta de pato',
      'Sorbetes',
      'Salsas para magret',
    ],
    descripcion:
      'Vinagre macerado con frambuesas frescas. Especialidad francesa que se popularizó en los años 80 con la Nouvelle Cuisine de Michel Guérard.',
    curiosidad:
      "La 'salade aux framboises' de Michel Guérard hizo famoso este vinagre en los años 70 en Eugénie-les-Bains.",
  },
  {
    nombre: 'Vinagre de granada',
    nombreOriginal: 'Pomegranate vinegar',
    origenMateriaPrima: 'Frutas',
    region: 'Asia',
    paisOrigen: 'Turquía/Irán',
    acidez: 'Media',
    porcentajeAcidez: '5%',
    intensidad: 'Intenso',
    envejecimiento: '6-12 meses',
    notasDeSabor: [
      'Granada fresca',
      'Tánico',
      'Dulce-ácido',
      'Floral',
    ],
    usosIdeales: ['Aliñar', 'Marinar', 'Salsa'],
    maridaje: [
      'Cordero',
      'Cuscús',
      'Hummus',
      'Ensaladas fattoush',
    ],
    descripcion:
      'Vinagre del Mediterráneo oriental hecho con zumo de granada fermentado. Color rosa intenso, sabor agridulce y tanino floral. Imprescindible en cocina libanesa y persa.',
    curiosidad:
      'La cocina turca lo combina con melaza de granada (nar ekşisi) para obtener un sabor más complejo.',
  },
  {
    nombre: 'Vinagre de membrillo',
    nombreOriginal: 'Vinagre de membrillo',
    origenMateriaPrima: 'Frutas',
    region: 'Mediterráneo',
    paisOrigen: 'España',
    acidez: 'Media',
    porcentajeAcidez: '5%',
    intensidad: 'Medio',
    envejecimiento: '6-12 meses',
    notasDeSabor: ['Membrillo dulce', 'Floral', 'Frutal', 'Suave'],
    usosIdeales: ['Aliñar', 'Postre', 'Salsa'],
    maridaje: [
      'Quesos curados',
      'Carnes blancas',
      'Foie gras',
      'Ensaladas otoñales',
    ],
    descripcion:
      'Vinagre artesanal español hecho con membrillos cocidos y fermentados. Sabor dulce-frutal único, ideal para salsas que acompañan quesos viejos y foies.',
    curiosidad:
      'Es producto típico de Castilla-La Mancha, donde el membrillo es fruta abundante en otoño.',
  },
  {
    nombre: 'Vinagre de higo',
    nombreOriginal: 'Fig vinegar',
    origenMateriaPrima: 'Frutas',
    region: 'Mediterráneo',
    paisOrigen: 'España/Italia/Turquía',
    acidez: 'Media',
    porcentajeAcidez: '5%',
    intensidad: 'Intenso',
    envejecimiento: '6-18 meses',
    notasDeSabor: [
      'Higo maduro',
      'Caramelo',
      'Mermelada',
      'Dulce intenso',
    ],
    usosIdeales: ['Postre', 'Aliñar', 'Salsa'],
    maridaje: [
      'Queso parmesano',
      'Magret de pato',
      'Foie gras',
      'Helado de vainilla',
    ],
    descripcion:
      'Vinagre artesanal de los países mediterráneos del higo. Color caoba, dulzor pronunciado y notas a higo seco. Se usa como sustituto del balsámico tradicional.',
    curiosidad:
      'En el sur de Italia (Calabria), el vinagre de higo es tradición milenaria — algunos productores cultivan higueras centenarias.',
  },

  // ── OTROS (6) ───────────────────────────────────────────────────
  {
    nombre: 'Vinagre de malta',
    nombreOriginal: 'Malt vinegar',
    origenMateriaPrima: 'Malta',
    region: 'Europa Norte',
    paisOrigen: 'Reino Unido',
    acidez: 'Alta',
    porcentajeAcidez: '5-7%',
    intensidad: 'Intenso',
    envejecimiento: 'Sin envejecer',
    notasDeSabor: [
      'Cebada tostada',
      'Pan',
      'Maltas',
      'Ahumado leve',
    ],
    usosIdeales: ['Aliñar', 'Salsa', 'Marinar'],
    maridaje: [
      'Fish and chips',
      'Pickles británicos',
      'Roast beef',
      'Patatas fritas',
    ],
    descripcion:
      'Vinagre tradicional británico hecho fermentando cerveza ale. Imprescindible para los fish and chips. Sabor robusto y maltoso muy diferente a los de vino.',
    curiosidad:
      'Los británicos consumen 100 millones de litros al año — sobre todo para sus chips.',
  },
  {
    nombre: 'Vinagre de sidra francés',
    nombreOriginal: 'Vinaigre de cidre',
    origenMateriaPrima: 'Manzana',
    region: 'Mediterráneo',
    paisOrigen: 'Francia (Normandía)',
    acidez: 'Media',
    porcentajeAcidez: '5-6%',
    intensidad: 'Medio',
    envejecimiento: '6-12 meses',
    notasDeSabor: [
      'Manzana cocida',
      'Madera de roble',
      'Floral',
      'Frutal',
    ],
    usosIdeales: ['Aliñar', 'Salsa', 'Marinar'],
    maridaje: [
      'Pollo a la normanda',
      'Carnes blancas',
      'Tartas saladas',
      'Vinagretas otoñales',
    ],
    descripcion:
      'Vinagre artesanal de Normandía hecho con sidra real (no zumo de manzana). Más complejo y aromático que el vinagre de manzana americano.',
    curiosidad:
      'La diferencia con el apple cider americano es radical: el francés es un producto gastronómico de alta gama.',
  },
  {
    nombre: 'Vinagre de kombucha',
    nombreOriginal: 'Kombucha vinegar',
    origenMateriaPrima: 'Kombucha',
    region: 'Internacional',
    paisOrigen: 'EE.UU./Mundial',
    acidez: 'Media',
    porcentajeAcidez: '4-5%',
    intensidad: 'Medio',
    envejecimiento: '1-2 meses',
    notasDeSabor: [
      'Té fermentado',
      'Frutal',
      'Probiótico',
      'Levadura',
    ],
    usosIdeales: ['Aliñar', 'Bebida', 'Salsa'],
    maridaje: [
      'Ensaladas modernas',
      'Vinagretas saludables',
      'Smoothies',
      'Bebidas wellness',
    ],
    descripcion:
      'Vinagre obtenido al sobre-fermentar kombucha (té fermentado con SCOBY). Tendencia de las cocinas wellness modernas. Probiótico natural.',
    curiosidad:
      'Cualquier kombucha que se olvida en la nevera más de 1 mes se convierte en vinagre.',
  },
  {
    nombre: 'Vinagre de caña',
    nombreOriginal: 'Sugarcane vinegar / Sukang Maasim',
    origenMateriaPrima: 'Caña azúcar',
    region: 'Asia',
    paisOrigen: 'Filipinas/Caribe',
    acidez: 'Media',
    porcentajeAcidez: '5%',
    intensidad: 'Medio',
    envejecimiento: 'Sin envejecer',
    notasDeSabor: [
      'Caña dulce',
      'Tropical',
      'Mineral',
      'Suave',
    ],
    usosIdeales: ['Marinar', 'Salsa', 'Aliñar'],
    maridaje: [
      'Adobo filipino',
      'Pescados caribeños',
      'Mojo cubano',
      'Verduras encurtidas',
    ],
    descripcion:
      "Vinagre tropical hecho fermentando jugo de caña de azúcar. Común en Filipinas como 'sukang maasim' y en el Caribe para mojos.",
    curiosidad:
      'El vinagre de caña filipino es base del mojo caribeño — la conexión histórica es la flota española de Manila a Acapulco.',
  },
  {
    nombre: 'Vinagre de plátano',
    nombreOriginal: 'Banana vinegar / Sukang Saba',
    origenMateriaPrima: 'Frutas',
    region: 'Asia',
    paisOrigen: 'Filipinas',
    acidez: 'Media',
    porcentajeAcidez: '4-5%',
    intensidad: 'Suave',
    envejecimiento: 'Sin envejecer',
    notasDeSabor: [
      'Plátano maduro',
      'Tropical',
      'Dulce-ácido',
      'Frutal',
    ],
    usosIdeales: ['Marinar', 'Aliñar', 'Salsa'],
    maridaje: [
      'Pescados tropicales',
      'Adobo dulce',
      'Ensaladas tropicales',
      'Curry filipino',
    ],
    descripcion:
      'Vinagre exótico filipino hecho con plátano cardaba. Sabor frutal único e intenso. Muy popular en los mercados filipinos.',
    curiosidad:
      'El plátano cardaba (saba) no se come crudo — solo se usa fermentado o cocinado.',
  },
  {
    nombre: 'Vinagre de vino de jerez añejo PX',
    nombreOriginal: 'Vinagre Pedro Ximénez',
    origenMateriaPrima: 'Vino',
    region: 'Mediterráneo',
    paisOrigen: 'España (Jerez)',
    acidez: 'Baja',
    porcentajeAcidez: '5%',
    intensidad: 'Muy intenso',
    envejecimiento: '10+ años',
    notasDeSabor: [
      'PX dulce',
      'Pasas',
      'Higos secos',
      'Madera de roble',
    ],
    usosIdeales: ['Postre', 'Aliñar', 'Salsa'],
    maridaje: [
      'Helado de vainilla',
      'Foie gras',
      'Queso azul',
      'Reducción para presa ibérica',
    ],
    descripcion:
      'Vinagre de Jerez de la categoría más alta, hecho con uva Pedro Ximénez. Dulce y oscuro como un balsámico viejo, pero con la nobleza del PX.',
    curiosidad:
      'Se vende en botellas pequeñas de 250ml — más caro que muchos vinos de Jerez de larga crianza.',
  },
];

export default function GuiaVinagresMundo() {
  const [busqueda, setBusqueda] = useState('');
  const [origen, setOrigen] = useState<OrigenVinagre | 'Todos'>('Todos');
  const [region, setRegion] = useState<RegionVinagre | 'Todos'>('Todos');
  const [acidez, setAcidez] = useState<Acidez | 'Todos'>('Todos');
  const [intensidad, setIntensidad] = useState<IntensidadSabor | 'Todos'>(
    'Todos'
  );
  const [uso, setUso] = useState<UsoVinagre | 'Todos'>('Todos');

  const vinagresFiltrados = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    return VINAGRES.filter((v) => {
      const matchOrigen = origen === 'Todos' || v.origenMateriaPrima === origen;
      const matchRegion = region === 'Todos' || v.region === region;
      const matchAcidez = acidez === 'Todos' || v.acidez === acidez;
      const matchIntensidad =
        intensidad === 'Todos' || v.intensidad === intensidad;
      const matchUso = uso === 'Todos' || v.usosIdeales.includes(uso);
      const matchBusqueda =
        !t ||
        v.nombre.toLowerCase().includes(t) ||
        v.nombreOriginal.toLowerCase().includes(t) ||
        v.paisOrigen.toLowerCase().includes(t) ||
        v.notasDeSabor.some((n) => n.toLowerCase().includes(t)) ||
        v.maridaje.some((m) => m.toLowerCase().includes(t)) ||
        v.descripcion.toLowerCase().includes(t);
      return (
        matchOrigen &&
        matchRegion &&
        matchAcidez &&
        matchIntensidad &&
        matchUso &&
        matchBusqueda
      );
    });
  }, [busqueda, origen, region, acidez, intensidad, uso]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía de Vinagres del Mundo</h1>
        <p>
          25 vinagres del mundo: origen, acidez, intensidad y maridaje. Eleva
          tus platos con el vinagre correcto.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── CONTROLES ──────────────────────────────────────────── */}
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar por nombre, país, nota de sabor o maridaje..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar vinagre"
          />
          <div className={styles.filtrosRow}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Materia prima:</span>
              <div
                className={styles.filtros}
                role="group"
                aria-label="Filtrar por materia prima"
              >
                <button
                  className={`${styles.filtroBtn} ${
                    origen === 'Todos' ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setOrigen('Todos')}
                >
                  Todos
                </button>
                {ORIGENES.map((o) => (
                  <button
                    key={o}
                    className={`${styles.filtroBtn} ${
                      origen === o ? styles.filtroActivo : ''
                    }`}
                    onClick={() => setOrigen(o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Región:</span>
              <div
                className={styles.filtros}
                role="group"
                aria-label="Filtrar por región"
              >
                <button
                  className={`${styles.filtroBtn} ${
                    region === 'Todos' ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setRegion('Todos')}
                >
                  Todas
                </button>
                {REGIONES.map((r) => (
                  <button
                    key={r}
                    className={`${styles.filtroBtn} ${
                      region === r ? styles.filtroActivo : ''
                    }`}
                    onClick={() => setRegion(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Acidez:</span>
              <div
                className={styles.filtros}
                role="group"
                aria-label="Filtrar por acidez"
              >
                <button
                  className={`${styles.filtroBtn} ${
                    acidez === 'Todos' ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setAcidez('Todos')}
                >
                  Todas
                </button>
                {ACIDEZES.map((a) => (
                  <button
                    key={a}
                    className={`${styles.filtroBtn} ${
                      acidez === a ? styles.filtroActivo : ''
                    }`}
                    onClick={() => setAcidez(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Intensidad:</span>
              <div
                className={styles.filtros}
                role="group"
                aria-label="Filtrar por intensidad"
              >
                <button
                  className={`${styles.filtroBtn} ${
                    intensidad === 'Todos' ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setIntensidad('Todos')}
                >
                  Todas
                </button>
                {INTENSIDADES.map((i) => (
                  <button
                    key={i}
                    className={`${styles.filtroBtn} ${
                      intensidad === i ? styles.filtroActivo : ''
                    }`}
                    onClick={() => setIntensidad(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Uso culinario:</span>
              <div
                className={styles.filtros}
                role="group"
                aria-label="Filtrar por uso culinario"
              >
                <button
                  className={`${styles.filtroBtn} ${
                    uso === 'Todos' ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setUso('Todos')}
                >
                  Todos
                </button>
                {USOS.map((u) => (
                  <button
                    key={u}
                    className={`${styles.filtroBtn} ${
                      uso === u ? styles.filtroActivo : ''
                    }`}
                    onClick={() => setUso(u)}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.contador} aria-live="polite">
            Mostrando {vinagresFiltrados.length} de {VINAGRES.length} vinagres
          </p>
        </div>

        {/* ── GRID ───────────────────────────────────────────────── */}
        <div className={styles.grid}>
          {vinagresFiltrados.map((v) => (
            <article
              key={`${v.nombre}-${v.paisOrigen}`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.badge} ${styles.badgeOrigen}`}>
                  {v.origenMateriaPrima}
                </span>
                <span className={`${styles.badge} ${styles.badgeRegion}`}>
                  {v.region}
                </span>
                <span className={`${styles.badge} ${styles.badgeAcidez}`}>
                  Acidez {v.acidez}
                </span>
                <span className={`${styles.badge} ${styles.badgeIntensidad}`}>
                  {v.intensidad}
                </span>
              </div>

              <div className={styles.cardTitulo}>
                <h2 className={styles.nombre}>{v.nombre}</h2>
                {v.nombreOriginal !== v.nombre && (
                  <span className={styles.nombreOriginal}>
                    {v.nombreOriginal}
                  </span>
                )}
                <span className={styles.pais}>{v.paisOrigen}</span>
              </div>

              <p className={styles.descripcion}>{v.descripcion}</p>

              <div className={styles.metricasGrid}>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>% Acidez</span>
                  <span className={styles.metricaValor}>
                    {v.porcentajeAcidez}
                  </span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Envejecimiento</span>
                  <span className={styles.metricaValorTexto}>
                    {v.envejecimiento}
                  </span>
                </div>
              </div>

              <div className={styles.section}>
                <span className={styles.sectionLabel}>Notas de sabor</span>
                <div className={styles.tags}>
                  {v.notasDeSabor.map((n) => (
                    <span
                      key={n}
                      className={`${styles.tag} ${styles.tagSabor}`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <span className={styles.sectionLabel}>Usos ideales</span>
                <div className={styles.tags}>
                  {v.usosIdeales.map((u) => (
                    <span key={u} className={`${styles.tag} ${styles.tagUso}`}>
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <span className={styles.sectionLabel}>Maridaje</span>
                <ul className={styles.maridajeList}>
                  {v.maridaje.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.curiosidadBox}>
                <span className={styles.curiosidadIcon} aria-hidden="true">
                  🍶
                </span>
                <p className={styles.curiosidadText}>{v.curiosidad}</p>
              </div>
            </article>
          ))}
          {vinagresFiltrados.length === 0 && (
            <p className={styles.sinResultados}>
              No se encontraron vinagres con esos criterios.
            </p>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía de Vinagres del Mundo"
        subtitle="Descubre 25 vinagres del mundo: origen, acidez, intensidad y maridaje. Eleva tus platos con el vinagre correcto"
      >
        <p>
          El vinagre es uno de los condimentos más antiguos y universales de la
          humanidad. Surgió por accidente cuando los primeros vinos se
          oxidaron, y desde entonces cada cultura ha desarrollado el suyo
          propio: balsámico en Italia, jerez en España, arroz en Asia, manzana
          en América, malta en Reino Unido, palma en Filipinas. Hoy hay más de
          50 tipos comerciales en el mundo, y elegir el correcto puede elevar
          un plato sencillo a una experiencia gastronómica.
        </p>
        <p>
          Más allá de la cocina, el vinagre tiene aplicaciones medicinales y
          probióticas. Hipócrates lo recetaba en el siglo IV a.C., y los
          vinagres no filtrados (con &laquo;madre&raquo;) están vinculados al
          movimiento wellness moderno por su contenido en bacterias y enzimas.
          Esta guía recoge 25 vinagres del mundo organizados por materia
          prima, región, acidez e intensidad.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption>
              Vinagres principales: comparativa por materia prima
            </caption>
            <thead>
              <tr>
                <th>Vinagre</th>
                <th>Materia prima</th>
                <th>Acidez</th>
                <th>Intensidad</th>
                <th>Uso ideal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Balsámico Tradizionale DOP</strong>
                </td>
                <td>Mosto de uva cocido</td>
                <td>4.5%</td>
                <td>Muy intenso</td>
                <td>Postres, foie gras, parmesano viejo</td>
              </tr>
              <tr>
                <td>
                  <strong>Jerez DOP</strong>
                </td>
                <td>Vino fortificado</td>
                <td>7%</td>
                <td>Intenso</td>
                <td>Gazpacho, marinados, salmorejo</td>
              </tr>
              <tr>
                <td>
                  <strong>Arroz japonés (komezu)</strong>
                </td>
                <td>Arroz fermentado</td>
                <td>4-5%</td>
                <td>Suave</td>
                <td>Sushi rice, encurtidos, ensaladas asiáticas</td>
              </tr>
              <tr>
                <td>
                  <strong>Manzana sin filtrar</strong>
                </td>
                <td>Zumo de manzana</td>
                <td>5-6%</td>
                <td>Medio</td>
                <td>Vinagretas dulces, bebidas wellness, marinados</td>
              </tr>
              <tr>
                <td>
                  <strong>Malta británico</strong>
                </td>
                <td>Cebada (cerveza ale)</td>
                <td>5-7%</td>
                <td>Intenso</td>
                <td>Fish and chips, pickles británicos, roast beef</td>
              </tr>
              <tr>
                <td>
                  <strong>Coco filipino</strong>
                </td>
                <td>Savia de palmera</td>
                <td>4-5%</td>
                <td>Medio</td>
                <td>Adobo filipino, curries, pescados tropicales</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>¿Para qué uso es cada vinagre?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🥗 Vinagretas frescas para ensaladas</strong>
            <p>
              Para una vinagreta clásica equilibrada, usa 1 parte de vinagre
              de vino blanco o champagne por 3 partes de aceite de oliva.
              Para ensaladas con queso de cabra o nueces, prueba el de
              frambuesa o el de jerez. Para cocinas asiáticas, el vinagre de
              arroz japonés es imprescindible: aporta acidez sin agresividad.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🥩 Marinados de carnes y pescados</strong>
            <p>
              El vinagre rompe las fibras del músculo y permite que las
              especias penetren. Para carnes rojas: vinagre de tinto o jerez.
              Para pollo o pescado blanco: manzana o vino blanco. Para
              cocinas tropicales: coco o caña. Limita el tiempo de marinado a
              2-4 horas: pasado ese tiempo, la carne se &laquo;cocina&raquo;
              en frío como un ceviche.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🥒 Encurtidos caseros y conservas</strong>
            <p>
              Para encurtir, busca un vinagre con al menos 5% de acidez (la
              mayoría comerciales lo tienen). El de manzana funciona para
              encurtidos dulces (cebolla, remolacha). El de vino blanco o
              destilado para cohombrillos clásicos. El de arroz japonés para
              tsukemono y kimchi rápido. Nunca uses balsámico viejo (es
              demasiado caro y dulce).
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🍨 Postres y reducciones gourmet</strong>
            <p>
              El balsámico tradicional sobre fresas o helado de vainilla
              transforma un postre simple en alta cocina. Para reducir, usa
              balsámico IGP o de jerez con un poco de azúcar y cocínalo a
              fuego lento hasta que cubra el dorso de una cuchara. Para foie
              gras, una reducción de PX o higo es perfecta.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>
              ¿Cuál es la diferencia entre Balsámico de Módena IGP y Aceto
              Balsamico Tradizionale DOP?
            </strong>
            <p>
              Son productos completamente distintos pese al nombre similar.
              El IGP es una mezcla de mosto cocido + vinagre de vino,
              envejecida 60 días - 3 años, y cuesta 5-30€. El DOP es 100%
              mosto cocido envejecido mínimo 12 años en barricas de varias
              maderas, y cuesta 100-800€ por 100ml. El IGP es para cocinar y
              aliñar; el DOP es un producto gourmet para usar gota a gota.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>
              ¿El vinagre de manzana sin filtrar es realmente más sano?
            </strong>
            <p>
              El vinagre sin filtrar contiene la &laquo;madre&raquo;, un
              cultivo de bacterias acéticas vivas con propiedades
              probióticas. Hay estudios que sugieren beneficios moderados
              sobre glucemia y digestión, pero no son milagrosos. La
              evidencia más sólida es para reducir la respuesta glucémica
              después de comidas con almidón. No es un sustituto de
              tratamiento médico.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puedo sustituir un vinagre por otro?</strong>
            <p>
              Solo dentro del mismo &laquo;perfil&raquo;. El vino blanco se
              puede sustituir por el de champagne o sidra. El balsámico IGP
              por el de Pedro Ximénez (ambos dulces y oscuros). El de arroz
              japonés por el coreano. Pero NUNCA sustituyas un vinagre suave
              (arroz) por uno fuerte (jerez o malta) sin reducir la cantidad
              a la mitad: la diferencia de acidez puede arruinar el plato.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El vinagre caduca?</strong>
            <p>
              Técnicamente no caduca (su acidez impide que se estropee),
              pero sí pierde aromas con el tiempo. Los vinagres sin filtrar
              pueden formar sedimentos y una nueva &laquo;madre&raquo; — es
              normal, no es malo. Conserva en lugar fresco y oscuro,
              herméticamente cerrado. Los vinagres aromatizados (frambuesa,
              estragón) duran 1-2 años en óptimas condiciones; los
              tradicionales (jerez, balsámico) años o décadas.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>
              ¿Por qué algunos vinagres llevan azufre/sulfitos y otros no?
            </strong>
            <p>
              Los sulfitos (E-220 a E-228) se añaden para evitar que el
              vinagre siga fermentando o que se oxide en exceso. Los
              vinagres artesanales y de DOP suelen tener menos sulfitos o
              ninguno (gracias al método Orleans tradicional). Los
              industriales (la mayoría del supermercado) sí los llevan. Si
              eres sensible o asmático, busca etiquetas
              &laquo;sin sulfitos añadidos&raquo;.
            </p>
          </li>
        </ul>

        <h3>Cómo hacer una vinagreta perfecta paso a paso</h3>
        <ul className={styles.pasosList}>
          <li className={styles.pasoItem}>
            <span className={styles.pasoNumero}>1</span>
            <div className={styles.pasoContenido}>
              <span className={styles.pasoTitulo}>
                Elige el vinagre según el plato
              </span>
              <p className={styles.pasoTexto}>
                Para ensaladas verdes y delicadas: vino blanco o champagne.
                Para ensaladas robustas con frutos secos: jerez o frambuesa.
                Para cocinas asiáticas: arroz. Para platos mediterráneos:
                balsámico IGP. La regla es que la intensidad del vinagre se
                ajuste a la del plato.
              </p>
            </div>
          </li>
          <li className={styles.pasoItem}>
            <span className={styles.pasoNumero}>2</span>
            <div className={styles.pasoContenido}>
              <span className={styles.pasoTitulo}>
                Mantén la proporción 1:3 (vinagre:aceite)
              </span>
              <p className={styles.pasoTexto}>
                La proporción clásica francesa es 1 parte de vinagre por 3
                partes de aceite. Si usas un vinagre muy ácido (vino tinto,
                malta), puedes ir a 1:4. Si es un balsámico dulce, puedes
                acercarte a 1:2. Mide siempre con cucharas, no a ojo.
              </p>
            </div>
          </li>
          <li className={styles.pasoItem}>
            <span className={styles.pasoNumero}>3</span>
            <div className={styles.pasoContenido}>
              <span className={styles.pasoTitulo}>
                Añade sal antes de emulsionar
              </span>
              <p className={styles.pasoTexto}>
                La sal se disuelve mejor en el vinagre que en el aceite.
                Añade una pizca de sal al vinagre, espera a que se disuelva
                completamente, y SOLO ENTONCES añade el aceite poco a poco
                mientras bates. Este truco francés se llama
                &laquo;monter à la fourchette&raquo;.
              </p>
            </div>
          </li>
          <li className={styles.pasoItem}>
            <span className={styles.pasoNumero}>4</span>
            <div className={styles.pasoContenido}>
              <span className={styles.pasoTitulo}>
                Suma una nota dulce y otra de carácter
              </span>
              <p className={styles.pasoTexto}>
                Una pizca de mostaza Dijon estabiliza la emulsión y aporta
                carácter. Una gota de miel o de jarabe de arce equilibra la
                acidez. Para vinagretas más complejas: chalota picada muy
                fina, hierbas frescas (cebollino, estragón), un toque de
                ajo machacado o ralladura de limón.
              </p>
            </div>
          </li>
          <li className={styles.pasoItem}>
            <span className={styles.pasoNumero}>5</span>
            <div className={styles.pasoContenido}>
              <span className={styles.pasoTitulo}>
                Aliña justo antes de servir
              </span>
              <p className={styles.pasoTexto}>
                La vinagreta marchita las hojas verdes en cuestión de
                minutos, así que aliña justo antes de servir. Si preparas la
                ensalada con antelación, lleva la vinagreta aparte en un
                bote pequeño. Las verduras robustas (col, kale, repollo) sí
                aguantan estar aliñadas con tiempo: incluso mejoran.
              </p>
            </div>
          </li>
        </ul>

        <h3>Tips de experto</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <strong>Equilibra acidez, dulzor y graso</strong>
            <p>
              Si una salsa o vinagreta resulta demasiado ácida, añade una
              pizca de azúcar o miel. Si es muy dulce, añade un poco más de
              vinagre. Si es muy aceitosa, un poco más de vinagre o limón.
              La cocina es química: ácido + dulce + graso es la triada
              equilibradora.
            </p>
          </div>
          <div className={styles.tipCard}>
            <strong>Nunca calientes balsámico tradizionale DOP</strong>
            <p>
              El Aceto Balsamico Tradizionale ha pasado 12-25 años
              envejeciéndose. Calentarlo destruye los aromas. Úsalo siempre
              en frío, gota a gota, justo antes de servir. El balsámico
              IGP (más barato) sí se puede reducir y cocinar.
            </p>
          </div>
          <div className={styles.tipCard}>
            <strong>Conserva en oscuridad y temperatura constante</strong>
            <p>
              El vinagre se oxida con luz, calor y oxígeno. Conserva las
              botellas en un armario oscuro (no encima del horno). Cierra
              bien tras cada uso. Una botella abierta dura 1-2 años con
              calidad óptima; cerrada, prácticamente indefinidamente.
            </p>
          </div>
          <div className={styles.tipCard}>
            <strong>Reducción casera: trucos para no quemarla</strong>
            <p>
              Para reducir vinagre balsámico IGP a una salsa siruposa: 250
              ml de balsámico + 2 cucharadas de azúcar moreno, fuego MUY
              suave durante 20-30 minutos hasta que cubra el dorso de una
              cuchara. Si lo cocinas a fuego fuerte se quema y amarga.
            </p>
          </div>
          <div className={styles.tipCard}>
            <strong>El truco del vinagre &laquo;eterno&raquo;</strong>
            <p>
              Si tienes un buen vinagre artesanal, puedes
              &laquo;rellenarlo&raquo; con vino sobrante (siempre del
              mismo tipo: tinto con tinto, blanco con blanco). La
              &laquo;madre&raquo; transformará el vino en vinagre nuevo en
              semanas. Así nunca se acaba — método tradicional usado en
              casas francesas y españolas durante siglos.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <h4>⚠️ Errores comunes que conviene evitar</h4>
          <ul>
            <li>
              <strong>Confundir IGP con DOP de Módena</strong>: pagar precio
              de tradizionale DOP (cientos de euros) por una botella IGP
              (que cuesta 5-30€) o, peor, usar tradizionale DOP para
              cocinar.
            </li>
            <li>
              <strong>Hervir balsámico viejo</strong>: las altas
              temperaturas destruyen los aromas que tardaron 12+ años en
              formarse. El DOP siempre en frío, sobre el plato terminado.
            </li>
            <li>
              <strong>
                Marinar pescado en vinagre fuerte demasiado tiempo
              </strong>
              : el ácido &laquo;cocina&raquo; el pescado en frío
              (efecto ceviche). Para marinar pescado, máximo 30 minutos con
              vinagres fuertes (jerez, malta) o 2-4 horas con suaves
              (arroz, vino blanco).
            </li>
            <li>
              <strong>
                Usar vinagre con menos del 5% de acidez para encurtir
              </strong>
              : muchos vinagres aromatizados o artesanales tienen acidez
              insuficiente para conservar de forma segura. Para encurtidos
              caseros usa siempre vinagres con al menos 5% de acidez
              etiquetada.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-vinagres-mundo')} />
      <ShareCard appName="guia-vinagres-mundo" />
      <Footer appName="guia-vinagres-mundo" />
    </div>
  );
}
