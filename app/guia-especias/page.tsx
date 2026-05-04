'use client';

import { useState, useMemo } from 'react';
import styles from './GuiaEspecias.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ============================================================
// TIPOS Y DATOS
// ============================================================

type Intensidad = 'Suave' | 'Media' | 'Intensa' | 'Muy intensa';
type Familia =
  | 'Picante'
  | 'Dulce / Cálido'
  | 'Terroso / Ahumado'
  | 'Floral / Aromático'
  | 'Herbal'
  | 'Ácido / Cítrico'
  | 'Amargo';

interface Especia {
  nombre: string;
  nombreCientifico: string;
  partePlanta: string;
  familia: Familia;
  intensidad: Intensidad;
  descripcion: string;
  usos: string[];
  origen: string;
  combinaCon: string[];
  conservacion: string;
}

const FAMILIAS: Familia[] = [
  'Picante',
  'Dulce / Cálido',
  'Terroso / Ahumado',
  'Floral / Aromático',
  'Herbal',
  'Ácido / Cítrico',
  'Amargo',
];

const INTENSIDAD_NIVEL: Record<Intensidad, number> = {
  Suave: 1,
  Media: 2,
  Intensa: 3,
  'Muy intensa': 4,
};

const ESPECIAS: Especia[] = [
  // ── PICANTE ──────────────────────────────────────────────
  {
    nombre: 'Pimienta negra',
    nombreCientifico: 'Piper nigrum',
    partePlanta: 'Fruto',
    familia: 'Picante',
    intensidad: 'Intensa',
    descripcion: 'La especia más usada del mundo. Picor limpio y penetrante gracias a la piperina. Entera conserva mejor el aroma que molida.',
    usos: ['Carnes', 'Salsas', 'Marinadas', 'Pastas'],
    origen: 'India',
    combinaCon: ['Comino', 'Cilantro seco', 'Ajo'],
    conservacion: 'Entera: 3-4 años · Molida: 1 año',
  },
  {
    nombre: 'Pimienta blanca',
    nombreCientifico: 'Piper nigrum',
    partePlanta: 'Fruto sin piel',
    familia: 'Picante',
    intensidad: 'Media',
    descripcion: 'Mismo fruto que la negra pero sin la capa exterior. Picor más suave y terroso, sin el aroma floral. Ideal donde el color negro no es bienvenido.',
    usos: ['Salsas blancas', 'Pescados', 'Purés', 'Bechamel'],
    origen: 'India',
    combinaCon: ['Nuez moscada', 'Laurel', 'Estragón'],
    conservacion: 'Entera: 3 años · Molida: 1 año',
  },
  {
    nombre: 'Pimienta de Sichuan',
    nombreCientifico: 'Zanthoxylum piperitum',
    partePlanta: 'Fruto',
    familia: 'Picante',
    intensidad: 'Intensa',
    descripcion: 'No es pimienta real. Produce entumecimiento eléctrico en la lengua (efecto mala). Aroma cítrico con notas florales únicas. Base del "mapo tofu".',
    usos: ['Cocina china', 'Marinadas de cerdo', 'Fideos', 'Salsas umami'],
    origen: 'China',
    combinaCon: ['Anís estrellado', 'Jengibre', 'Chile seco'],
    conservacion: '1 año (pierde potencia rápido)',
  },
  {
    nombre: 'Cayena',
    nombreCientifico: 'Capsicum annuum',
    partePlanta: 'Fruto seco molido',
    familia: 'Picante',
    intensidad: 'Muy intensa',
    descripcion: 'Chile rojo molido de alto contenido en capsaicina. Picor directo e inmediato. Pequeñas cantidades transforman un plato. No confundir con pimentón picante.',
    usos: ['Salsas picantes', 'Guisos', 'Marinadas', 'Pizzas'],
    origen: 'América Central',
    combinaCon: ['Comino', 'Ajo', 'Orégano'],
    conservacion: '2-3 años en lugar seco y oscuro',
  },
  {
    nombre: 'Pimentón dulce',
    nombreCientifico: 'Capsicum annuum',
    partePlanta: 'Fruto seco molido',
    familia: 'Picante',
    intensidad: 'Suave',
    descripcion: 'Pimiento rojo seco y molido sin capsaicina significativa. Aporta color rojo intenso y sabor suave afrutado. Imprescindible en la cocina española.',
    usos: ['Potajes', 'Patatas bravas', 'Arroces', 'Embutidos'],
    origen: 'España (Extremadura / Murcia)',
    combinaCon: ['Ajo', 'Comino', 'Laurel'],
    conservacion: '1-2 años (sensible a la luz)',
  },
  {
    nombre: 'Pimentón ahumado',
    nombreCientifico: 'Capsicum annuum',
    partePlanta: 'Fruto ahumado y molido',
    familia: 'Terroso / Ahumado',
    intensidad: 'Media',
    descripcion: 'Pimiento secado al humo de encina, típico de La Vera (Cáceres). Aporta notas ahumadas profundas además del color rojo. Versión dulce, agridulce o picante.',
    usos: ['Patatas a la riojana', 'Pulpo', 'Carnes a la brasa', 'Huevos rotos'],
    origen: 'España (La Vera, Cáceres)',
    combinaCon: ['Ajo', 'Tomillo', 'Comino'],
    conservacion: '1-2 años (proteger de la humedad)',
  },
  {
    nombre: 'Jengibre',
    nombreCientifico: 'Zingiber officinale',
    partePlanta: 'Rizoma',
    familia: 'Picante',
    intensidad: 'Media',
    descripcion: 'Picor cálido y aromático producido por el gingerol (fresco) y el shogaol (seco). El fresco es más fresco y floral; el seco más picante y concentrado.',
    usos: ['Curry', 'Repostería', 'Infusiones', 'Marinadas de carne'],
    origen: 'India / Sudeste asiático',
    combinaCon: ['Canela', 'Cardamomo', 'Cúrcuma'],
    conservacion: 'Fresco: 3 sem. en nevera · Seco: 2-3 años',
  },
  {
    nombre: 'Mostaza (semilla)',
    nombreCientifico: 'Sinapis alba / Brassica nigra',
    partePlanta: 'Semilla',
    familia: 'Picante',
    intensidad: 'Media',
    descripcion: 'Sin moler es casi insípida; al romperse libera isotiocianatos picantes. La semilla negra es más potente que la blanca. Base de mostazas y encurtidos.',
    usos: ['Encurtidos', 'Salsas', 'Currys de lentejas', 'Pan'],
    origen: 'Mediterráneo / India',
    combinaCon: ['Cúrcuma', 'Vinagre', 'Fenogreco'],
    conservacion: '3-4 años entera · 1 año molida',
  },
  {
    nombre: 'Rábano picante',
    nombreCientifico: 'Armoracia rusticana',
    partePlanta: 'Raíz',
    familia: 'Picante',
    intensidad: 'Intensa',
    descripcion: 'Picor nasal intenso (isotiocianatos volátiles) que sube a los senos paranasales, diferente al picor de la cayena. Se usa principalmente rallado o en salsa.',
    usos: ['Salsas para carnes rojas', 'Sushi occidental', 'Ahumados', 'Ensaladas'],
    origen: 'Europa del Este',
    combinaCon: ['Mostaza', 'Vinagre', 'Crema agria'],
    conservacion: 'Fresco: 1-3 meses en nevera · En conserva: 6 meses',
  },
  {
    nombre: 'Wasabi',
    nombreCientifico: 'Wasabia japonica',
    partePlanta: 'Rizoma',
    familia: 'Picante',
    intensidad: 'Muy intensa',
    descripcion: 'Picor explosivo y muy fugaz que sube a la nariz. El wasabi real es escaso y caro; la mayoría del wasabi comercial es rábano picante teñido con colorante.',
    usos: ['Sushi', 'Sashimi', 'Fideos soba', 'Aderezos japoneses'],
    origen: 'Japón',
    combinaCon: ['Jengibre encurtido', 'Soja', 'Sésamo'],
    conservacion: 'Fresco: usar inmediato · Polvo/pasta: 1 año',
  },

  // ── DULCE / CÁLIDO ────────────────────────────────────────
  {
    nombre: 'Canela de Ceilán',
    nombreCientifico: 'Cinnamomum verum',
    partePlanta: 'Corteza interior',
    familia: 'Dulce / Cálido',
    intensidad: 'Media',
    descripcion: 'La canela "verdadera". Dulce, cálida y delicada con notas florales. Menor contenido en cumarina que la de Cassia, lo que la hace más segura en grandes cantidades.',
    usos: ['Repostería', 'Bebidas calientes', 'Guisos con fruta', 'Tagines'],
    origen: 'Sri Lanka',
    combinaCon: ['Cardamomo', 'Vainilla', 'Clavo'],
    conservacion: 'En rama: 3-4 años · Molida: 1-2 años',
  },
  {
    nombre: 'Clavo',
    nombreCientifico: 'Syzygium aromaticum',
    partePlanta: 'Capullo floral',
    familia: 'Dulce / Cálido',
    intensidad: 'Muy intensa',
    descripcion: 'Sabor extremadamente potente y eugenol dominante. Un solo clavo puede perfumar todo un guiso. Usar con mucha moderación. Anestésico natural (eugenol).',
    usos: ['Guisos de carne', 'Vino caliente', 'Repostería navideña', 'Marinadas'],
    origen: 'Indonesia (Molucas)',
    combinaCon: ['Canela', 'Nuez moscada', 'Pimienta de Jamaica'],
    conservacion: 'Entero: 4 años · Molido: 1-2 años',
  },
  {
    nombre: 'Nuez moscada',
    nombreCientifico: 'Myristica fragrans',
    partePlanta: 'Semilla',
    familia: 'Dulce / Cálido',
    intensidad: 'Media',
    descripcion: 'Cálida y ligeramente dulce con notas leñosas. Usar siempre recién rallada: pierde rápidamente su aroma. En grandes cantidades puede ser tóxica.',
    usos: ['Bechamel', 'Purés de patata', 'Repostería', 'Embutidos'],
    origen: 'Indonesia',
    combinaCon: ['Pimienta blanca', 'Canela', 'Jengibre'],
    conservacion: 'Entera: 4+ años · Rallada: 6 meses',
  },
  {
    nombre: 'Cardamomo verde',
    nombreCientifico: 'Elettaria cardamomum',
    partePlanta: 'Semilla (en vaina)',
    familia: 'Dulce / Cálido',
    intensidad: 'Media',
    descripcion: 'La especia más cara tras azafrán y vainilla. Compleja: floral, mentolada, cítrica y levemente picante a la vez. Usar las semillas del interior de la vaina.',
    usos: ['Chai masala', 'Repostería escandinava', 'Café árabe', 'Currys'],
    origen: 'India / Guatemala',
    combinaCon: ['Canela', 'Jengibre', 'Rosa seca'],
    conservacion: 'Vaina: 2 años · Molido: 6 meses',
  },
  {
    nombre: 'Vainilla',
    nombreCientifico: 'Vanilla planifolia',
    partePlanta: 'Vaina (fruto)',
    familia: 'Dulce / Cálido',
    intensidad: 'Suave',
    descripcion: 'Sabor dulce y balsámico con más de 200 compuestos aromáticos. La vainilla Bourbon (Madagascar) es la más común. Infinitamente superior a la artificial.',
    usos: ['Helados', 'Repostería', 'Cremas', 'Bebidas lácteas'],
    origen: 'México / Madagascar',
    combinaCon: ['Canela', 'Chocolate', 'Cardamomo'],
    conservacion: 'Vaina en tarro cerrado: 2+ años',
  },
  {
    nombre: 'Anís estrellado',
    nombreCientifico: 'Illicium verum',
    partePlanta: 'Fruto',
    familia: 'Dulce / Cálido',
    intensidad: 'Intensa',
    descripcion: 'Aroma anisado muy pronunciado con profundidad cálida. Ingrediente clave del five spice chino y del pho vietnamita. Distinto botánicamente al anís verde.',
    usos: ['Cerdo estofado', 'Pho', 'Five spice', 'Licores'],
    origen: 'China / Vietnam',
    combinaCon: ['Clavo', 'Canela', 'Pimienta Sichuan'],
    conservacion: 'Entero: 2-3 años · Molido: 1 año',
  },
  {
    nombre: 'Anís verde',
    nombreCientifico: 'Pimpinella anisum',
    partePlanta: 'Semilla',
    familia: 'Dulce / Cálido',
    intensidad: 'Media',
    descripcion: 'Sabor anisado más delicado y dulce que el estrellado. Digestivo tradicional. Base de licores mediterráneos (anís, pastis, ouzo). Suaviza platos de carne.',
    usos: ['Repostería', 'Pan', 'Licores', 'Pescados'],
    origen: 'Mediterráneo Oriental',
    combinaCon: ['Hinojo', 'Cilantro seco', 'Canela'],
    conservacion: '2-3 años en tarro hermético',
  },
  {
    nombre: 'Pimienta de Jamaica',
    nombreCientifico: 'Pimenta dioica',
    partePlanta: 'Fruto seco',
    familia: 'Dulce / Cálido',
    intensidad: 'Media',
    descripcion: 'Una sola especia que recuerda a clavo, canela y nuez moscada a la vez (de ahí "allspice" en inglés). Imprescindible en marinadas caribeñas y embutidos.',
    usos: ['Marinadas caribeñas', 'Embutidos', 'Barbacoa', 'Repostería'],
    origen: 'Jamaica / Caribe',
    combinaCon: ['Clavo', 'Canela', 'Pimienta negra'],
    conservacion: 'Entera: 4 años · Molida: 2 años',
  },
  {
    nombre: 'Macis',
    nombreCientifico: 'Myristica fragrans',
    partePlanta: 'Arilo (cubierta de la semilla)',
    familia: 'Dulce / Cálido',
    intensidad: 'Media',
    descripcion: 'La "red de" que envuelve la nuez moscada. Sabor similar pero más delicado, con notas florales y un toque más picante. Muy usado en patés y embutidos europeos.',
    usos: ['Patés', 'Embutidos', 'Salsas blancas', 'Repostería'],
    origen: 'Indonesia',
    combinaCon: ['Nuez moscada', 'Pimienta blanca', 'Clavo'],
    conservacion: '1-2 años en lugar fresco y seco',
  },

  // ── TERROSO / AHUMADO ─────────────────────────────────────
  {
    nombre: 'Cúrcuma',
    nombreCientifico: 'Curcuma longa',
    partePlanta: 'Rizoma',
    familia: 'Terroso / Ahumado',
    intensidad: 'Suave',
    descripcion: 'Terrosa y ligeramente amarga con intenso color amarillo-naranja de la curcumina. Sabor discreto que se potencia combinada con pimienta negra. Imprescindible en currys.',
    usos: ['Curry', 'Arroces', 'Leche dorada', 'Sopas'],
    origen: 'India',
    combinaCon: ['Pimienta negra', 'Jengibre', 'Comino'],
    conservacion: '2-3 años molida en tarro opaco',
  },
  {
    nombre: 'Comino',
    nombreCientifico: 'Cuminum cyminum',
    partePlanta: 'Semilla',
    familia: 'Terroso / Ahumado',
    intensidad: 'Media',
    descripcion: 'Aroma terroso, cálido y ligeramente amargo. Tostado brevemente en seco libera mucho más sabor. Omnipresente en cocinas india, mexicana y del Magreb.',
    usos: ['Hummus', 'Tacos', 'Curry', 'Falafel'],
    origen: 'Mediterráneo Oriental / India',
    combinaCon: ['Cilantro seco', 'Pimentón', 'Ajo'],
    conservacion: 'Semilla: 3-4 años · Molido: 1-2 años',
  },
  {
    nombre: 'Cilantro (semilla)',
    nombreCientifico: 'Coriandrum sativum',
    partePlanta: 'Semilla',
    familia: 'Terroso / Ahumado',
    intensidad: 'Suave',
    descripcion: 'Sabor totalmente distinto a las hojas: terroso, cítrico y suavemente dulce. Sin el polémico sabor jabonoso. Base de muchas mezclas de curry.',
    usos: ['Curry', 'Pan', 'Encurtidos', 'Marinadas'],
    origen: 'Mediterráneo',
    combinaCon: ['Comino', 'Pimentón', 'Fenogreco'],
    conservacion: 'Semilla: 3-4 años · Molido: 1 año',
  },
  {
    nombre: 'Fenogreco',
    nombreCientifico: 'Trigonella foenum-graecum',
    partePlanta: 'Semilla',
    familia: 'Terroso / Ahumado',
    intensidad: 'Media',
    descripcion: 'Sabor amargo y terroso que recuerda levemente al jarabe de arce. Tostar reduce el amargor. Imprescindible en el curry en polvo comercial.',
    usos: ['Curry en polvo', 'Chutneys', 'Pan indio', 'Encurtidos'],
    origen: 'India / Mediterráneo',
    combinaCon: ['Mostaza', 'Cúrcuma', 'Cilantro seco'],
    conservacion: '2-3 años en tarro hermético',
  },
  {
    nombre: 'Alcaravea',
    nombreCientifico: 'Carum carvi',
    partePlanta: 'Semilla',
    familia: 'Terroso / Ahumado',
    intensidad: 'Media',
    descripcion: 'Terrosa y anisada con un toque amargo y cítrico. Confundida con el comino pero claramente diferente. La especia del pan de centeno y el chucrut.',
    usos: ['Pan de centeno', 'Chucrut', 'Quesos', 'Col fermentada'],
    origen: 'Norte y Centro de Europa',
    combinaCon: ['Hinojo', 'Eneldo', 'Comino'],
    conservacion: '3 años en lugar seco',
  },
  {
    nombre: 'Semilla de nigella',
    nombreCientifico: 'Nigella sativa',
    partePlanta: 'Semilla',
    familia: 'Terroso / Ahumado',
    intensidad: 'Suave',
    descripcion: 'Semilla negra triangular con sabor complejo: terroso, ligeramente amargo con notas de cebolla y orégano. Decorativa y aromática. Muy usada en pan naan.',
    usos: ['Pan naan', 'Quesos', 'Encurtidos', 'Panes y crackers'],
    origen: 'Oriente Medio / Asia del Sur',
    combinaCon: ['Comino', 'Cilantro seco', 'Sésamo'],
    conservacion: '2-3 años',
  },
  {
    nombre: 'Galanga',
    nombreCientifico: 'Alpinia galanga',
    partePlanta: 'Rizoma',
    familia: 'Terroso / Ahumado',
    intensidad: 'Media',
    descripcion: 'Pariente del jengibre pero con sabor más resinoso, cítrico y menos picante. Insustituble en la cocina tailandesa. En fresco o seco tiene perfiles distintos.',
    usos: ['Tom kha gai', 'Currys thai', 'Sopas asiáticas', 'Sambales'],
    origen: 'Sudeste Asiático',
    combinaCon: ['Lemongrass', 'Cúrcuma', 'Hojas de lima kaffir'],
    conservacion: 'Fresco: 2-3 sem. · Seco: 2-3 años',
  },

  // ── FLORAL / AROMÁTICO ────────────────────────────────────
  {
    nombre: 'Azafrán',
    nombreCientifico: 'Crocus sativus',
    partePlanta: 'Estigmas florales',
    familia: 'Floral / Aromático',
    intensidad: 'Intensa',
    descripcion: 'La especia más cara del mundo (por kg). Aromático, floral y con un característico sabor metálico-terroso. La safranal y el picrocrocina dan su aroma y color único.',
    usos: ['Paella', 'Risotto milanés', 'Bouillabaisse', 'Dulces persas'],
    origen: 'España (La Mancha) / Irán',
    combinaCon: ['Cardamomo', 'Canela', 'Cúrcuma'],
    conservacion: 'Bien sellado y oscuro: 2-3 años',
  },
  {
    nombre: 'Cardamomo negro',
    nombreCientifico: 'Amomum subulatum',
    partePlanta: 'Vaina (semillas)',
    familia: 'Floral / Aromático',
    intensidad: 'Intensa',
    descripcion: 'Sabor ahumado, mentolado y resinoso muy diferente al verde. La vaina se usa entera en guisos lentos. Común en el biryani indio y platos de carne.',
    usos: ['Biryani', 'Dal', 'Guisos de carne', 'Té masala'],
    origen: 'Nepal / India del Norte',
    combinaCon: ['Clavo', 'Canela', 'Pimienta negra'],
    conservacion: 'Vaina: 2-3 años',
  },
  {
    nombre: 'Lavanda culinaria',
    nombreCientifico: 'Lavandula angustifolia',
    partePlanta: 'Flor',
    familia: 'Floral / Aromático',
    intensidad: 'Media',
    descripcion: 'Floral, herbal y ligeramente amarga. Solo variedades culinarias (angustifolia). Muy usada en la cocina provenzal (herbes de Provence). Usar con mucha moderación.',
    usos: ['Repostería provenzal', 'Marinadas de cordero', 'Sales aromáticas', 'Miel'],
    origen: 'Provenza, Francia',
    combinaCon: ['Romero', 'Tomillo', 'Limón'],
    conservacion: '1-2 años en tarro opaco',
  },
  {
    nombre: 'Pétalos de rosa secos',
    nombreCientifico: 'Rosa damascena / Rosa spp.',
    partePlanta: 'Flor',
    familia: 'Floral / Aromático',
    intensidad: 'Suave',
    descripcion: 'Florales, levemente dulces y perfumados. La rosa de Damasco es la más apreciada. Uso muy extendido en cocina persa, marroquí y árabe.',
    usos: ['Repostería persa', 'Ras el hanout', 'Agua de rosas', 'Mermeladas'],
    origen: 'Irán / Bulgaria / Marruecos',
    combinaCon: ['Cardamomo', 'Pistachos', 'Agua de azahar'],
    conservacion: '1 año en tarro hermético',
  },
  {
    nombre: 'Hibisco',
    nombreCientifico: 'Hibiscus sabdariffa',
    partePlanta: 'Cáliz (flor)',
    familia: 'Floral / Aromático',
    intensidad: 'Media',
    descripcion: 'Floral, marcadamente ácido y con color rojo intenso. Se usa seco en infusiones, salsas y repostería. También llamado Jamaica, rosa de Abisinia o karkadé.',
    usos: ['Infusiones', 'Agua de Jamaica', 'Salsas para carnes', 'Mermeladas'],
    origen: 'África Occidental / México',
    combinaCon: ['Jengibre', 'Canela', 'Lima'],
    conservacion: '1-2 años en lugar seco y oscuro',
  },
  {
    nombre: 'Enebro (baya)',
    nombreCientifico: 'Juniperus communis',
    partePlanta: 'Baya',
    familia: 'Floral / Aromático',
    intensidad: 'Media',
    descripcion: 'Resinoso, pinoide y ligeramente cítrico. Sabor característico del gin. Clásico con carne de caza, chucrut y salsas de caza. Solo fruto maduro y oscuro.',
    usos: ['Carne de caza', 'Chucrut', 'Marinadas', 'Gin tonic (maridaje)'],
    origen: 'Europa / América del Norte',
    combinaCon: ['Laurel', 'Tomillo', 'Pimienta negra'],
    conservacion: '2-3 años enteras',
  },
  {
    nombre: 'Azahar (flor de azahar)',
    nombreCientifico: 'Citrus aurantium',
    partePlanta: 'Flor seca',
    familia: 'Floral / Aromático',
    intensidad: 'Suave',
    descripcion: 'Floral, delicado y cítrico. En seco para infusiones; como agua de azahar en repostería mediterránea. Aporta el aroma característico de las torrijas y el roscón.',
    usos: ['Torrijas', 'Roscón de Reyes', 'Infusiones', 'Mazapán'],
    origen: 'Mediterráneo (España, Marruecos)',
    combinaCon: ['Vainilla', 'Canela', 'Miel'],
    conservacion: '1-2 años en tarro seco',
  },

  // ── HERBAL ────────────────────────────────────────────────
  {
    nombre: 'Orégano',
    nombreCientifico: 'Origanum vulgare',
    partePlanta: 'Hoja seca',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Herbal, levemente amargo y terroso. El seco es más intenso que el fresco. El orégano griego y mexicano son más potentes que el europeo. Clásico mediterráneo.',
    usos: ['Pizza', 'Pasta', 'Carnes a la brasa', 'Ensaladas mediterráneas'],
    origen: 'Mediterráneo',
    combinaCon: ['Tomillo', 'Albahaca', 'Ajo'],
    conservacion: '1-2 años en tarro hermético',
  },
  {
    nombre: 'Tomillo',
    nombreCientifico: 'Thymus vulgaris',
    partePlanta: 'Hoja seca',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Herbal, leñoso y ligeramente cítrico. Muy versátil. El timol le da propiedades antimicrobianas. Parte del bouquet garni y las herbes de Provence.',
    usos: ['Asados', 'Sopas', 'Salsas', 'Marinadas'],
    origen: 'Mediterráneo',
    combinaCon: ['Romero', 'Laurel', 'Ajo'],
    conservacion: '1-2 años seco',
  },
  {
    nombre: 'Romero',
    nombreCientifico: 'Salvia rosmarinus',
    partePlanta: 'Hoja seca',
    familia: 'Herbal',
    intensidad: 'Intensa',
    descripcion: 'Potentemente aromático, resinoso y ligeramente amargo. Intensidad alta: usar con moderación. Muy afín con las carnes grasas como el cordero.',
    usos: ['Cordero', 'Patatas asadas', 'Focaccia', 'Marinadas de caza'],
    origen: 'Mediterráneo',
    combinaCon: ['Tomillo', 'Ajo', 'Enebro'],
    conservacion: '1-2 años en tarro hermético',
  },
  {
    nombre: 'Laurel',
    nombreCientifico: 'Laurus nobilis',
    partePlanta: 'Hoja',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Herbal, ligeramente amargo y balsámico. En cocina funciona como fondo aromático, no protagonista. Siempre se retira antes de servir. Seco más intenso que fresco.',
    usos: ['Caldos', 'Guisos', 'Escabeches', 'Cocido madrileño'],
    origen: 'Mediterráneo',
    combinaCon: ['Tomillo', 'Pimienta negra', 'Clavo'],
    conservacion: 'Seco: 1-3 años',
  },
  {
    nombre: 'Albahaca',
    nombreCientifico: 'Ocimum basilicum',
    partePlanta: 'Hoja',
    familia: 'Herbal',
    intensidad: 'Suave',
    descripcion: 'Fresca, ligeramente anisada y dulce. Pierde aroma con el calor: añadir al final. La albahaca genovesa es diferente a la thai (más picante y anisada).',
    usos: ['Pesto', 'Caprese', 'Salsas de tomate', 'Pizzas'],
    origen: 'India / Mediterráneo',
    combinaCon: ['Tomate', 'Ajo', 'Piñones'],
    conservacion: 'Fresca: 1-2 semanas · Seca: 1-2 años',
  },
  {
    nombre: 'Estragón',
    nombreCientifico: 'Artemisia dracunculus',
    partePlanta: 'Hoja',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Anisado, delicado y ligeramente amargo. Pilar de la cocina francesa clásica. Imprescindible en la salsa béarnaise y el pollo al estragón.',
    usos: ['Salsa béarnaise', 'Pollo asado', 'Vinagres', 'Salsas de mantequilla'],
    origen: 'Asia Central / Francia',
    combinaCon: ['Mostaza', 'Limón', 'Pimienta blanca'],
    conservacion: 'Fresco: 1-2 semanas · Seco: 1-2 años',
  },
  {
    nombre: 'Eneldo',
    nombreCientifico: 'Anethum graveolens',
    partePlanta: 'Hoja y semilla',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Fresco, anisado y herbáceo. La hoja es más delicada; la semilla más intensa y amarga. Clásico escandinavo con salmón y pepinos. No aguanta bien el calor.',
    usos: ['Salmón', 'Pepinos encurtidos', 'Salsas de yogur', 'Gravlax'],
    origen: 'Mediterráneo / Norte de Europa',
    combinaCon: ['Mostaza', 'Limón', 'Crema agria'],
    conservacion: 'Fresco: 1-2 semanas · Seco: 1-2 años',
  },
  {
    nombre: 'Menta',
    nombreCientifico: 'Mentha spp.',
    partePlanta: 'Hoja',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Fresca e intensa por el mentol. Muy versátil: de salsas de cordero (menta piperita) a té marroquí (hierbabuena). El frescor desaparece con el calor.',
    usos: ['Té marroquí', 'Taboulé', 'Salsa de yogur-menta', 'Mojito'],
    origen: 'Mediterráneo / Asia',
    combinaCon: ['Lima', 'Pepino', 'Jengibre'],
    conservacion: 'Fresca: 1-2 semanas · Seca: 1-2 años',
  },
  {
    nombre: 'Salvia',
    nombreCientifico: 'Salvia officinalis',
    partePlanta: 'Hoja',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Herbal, alcanforado y ligeramente amargo. El seco es más robusto que el fresco. Muy buena con grasas animales: la mantequilla de salvia es un clásico italiano.',
    usos: ['Mantequilla de salvia', 'Ternera', 'Pasta', 'Embutidos'],
    origen: 'Mediterráneo',
    combinaCon: ['Limón', 'Tomillo', 'Pimienta negra'],
    conservacion: 'Fresca: 1 semana · Seca: 1-2 años',
  },
  {
    nombre: 'Lemongrass',
    nombreCientifico: 'Cymbopogon citratus',
    partePlanta: 'Tallo',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Intensamente cítrico-limón con fondo herbal. Se usa la parte blanca del tallo; las hojas para infusiones. Insustituble en la cocina tailandesa y vietnamita.',
    usos: ['Tom kha gai', 'Currys thai', 'Marinadas de pollo', 'Infusiones'],
    origen: 'Sudeste Asiático',
    combinaCon: ['Galanga', 'Hojas de lima kaffir', 'Jengibre'],
    conservacion: 'Fresco: 2-3 semanas · Seco/congelado: 6 meses',
  },
  {
    nombre: 'Hojas de lima kaffir',
    nombreCientifico: 'Citrus hystrix',
    partePlanta: 'Hoja',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Intensamente cítrica y aromática, diferente a cualquier otro cítrico. Se usan enteras (retirar nervio central) o en juliana muy fina. No sustituibles.',
    usos: ['Curry tailandés', 'Tom yum', 'Arroz aromatizado', 'Marinadas'],
    origen: 'Sudeste Asiático',
    combinaCon: ['Lemongrass', 'Galanga', 'Chile'],
    conservacion: 'Fresca: 2 semanas · Congelada: 6 meses · Seca: 1 año',
  },
  {
    nombre: 'Mejorana',
    nombreCientifico: 'Origanum majorana',
    partePlanta: 'Hoja seca',
    familia: 'Herbal',
    intensidad: 'Suave',
    descripcion: 'Pariente dulce del orégano: más delicada, menos amarga y con notas florales. Clásica en la cocina alemana y en embutidos. Más aromática que el orégano.',
    usos: ['Embutidos alemanes', 'Guisos de legumbres', 'Huevos', 'Sopas'],
    origen: 'Mediterráneo Oriental',
    combinaCon: ['Orégano', 'Tomillo', 'Ajedrea'],
    conservacion: '1-2 años en lugar fresco',
  },
  {
    nombre: 'Cilantro (hoja)',
    nombreCientifico: 'Coriandrum sativum',
    partePlanta: 'Hoja fresca',
    familia: 'Herbal',
    intensidad: 'Suave',
    descripcion: 'Sabor dividido: para la mayoría fresco y cítrico; para un 10-15% de la población (variante genética OR6A2) huele a jabón. Se añade siempre crudo, al final.',
    usos: ['Guacamole', 'Tacos', 'Curry', 'Sopas asiáticas'],
    origen: 'Mediterráneo / Asia',
    combinaCon: ['Lima', 'Comino', 'Chile'],
    conservacion: 'Fresco: 1-2 semanas en nevera',
  },
  {
    nombre: 'Hoja de curry',
    nombreCientifico: 'Murraya koenigii',
    partePlanta: 'Hoja',
    familia: 'Herbal',
    intensidad: 'Media',
    descripcion: 'Aromática, ligeramente amarga y con notas cítricas-herbales únicas. No tiene relación con el curry en polvo. Se tempera en aceite caliente al inicio de los platos.',
    usos: ['Dal', 'Chutneys', 'Arroces del sur de India', 'Sopas'],
    origen: 'India del Sur / Sri Lanka',
    combinaCon: ['Mostaza (semilla)', 'Cúrcuma', 'Chile'],
    conservacion: 'Fresca: 2 semanas · Seca: 1-2 años · Congelada: 6 meses',
  },

  // ── ÁCIDO / CÍTRICO ───────────────────────────────────────
  {
    nombre: 'Zumaque',
    nombreCientifico: 'Rhus coriaria',
    partePlanta: 'Fruto seco molido',
    familia: 'Ácido / Cítrico',
    intensidad: 'Media',
    descripcion: 'Acidez frutal y compleja similar al limón pero más profunda. Color rojo burdeos intenso. Imprescindible en la cocina levantina. Sustituye al limón en el za\'atar.',
    usos: ['Fattoush', 'Shawarma', 'Za\'atar', 'Carnes a la brasa'],
    origen: 'Oriente Medio / Mediterráneo Oriental',
    combinaCon: ['Tomillo', 'Sésamo', 'Orégano'],
    conservacion: '1-2 años en tarro hermético',
  },
  {
    nombre: 'Amchur (polvo de mango verde)',
    nombreCientifico: 'Mangifera indica',
    partePlanta: 'Fruto seco molido',
    familia: 'Ácido / Cítrico',
    intensidad: 'Media',
    descripcion: 'Acidez frutal intensa con notas de mango verde y ligereza. Aporta acidez sin líquido a los platos. Muy usado en la cocina india del norte como acidulante.',
    usos: ['Chaat masala', 'Currys de verduras', 'Marinadas', 'Chutneys'],
    origen: 'India',
    combinaCon: ['Comino', 'Cilantro seco', 'Chile'],
    conservacion: '1-2 años en lugar seco',
  },
  {
    nombre: 'Tamarindo',
    nombreCientifico: 'Tamarindus indica',
    partePlanta: 'Pulpa de la vaina',
    familia: 'Ácido / Cítrico',
    intensidad: 'Intensa',
    descripcion: 'Agridulce muy pronunciado con acidez frutal profunda. Se usa como bloque de pulpa disuelta en agua o como pasta concentrada. Clásico en Pad thai y Worcestershire.',
    usos: ['Pad thai', 'Salsa Worcestershire', 'Chutneys', 'Currys agridulces'],
    origen: 'África / India',
    combinaCon: ['Jengibre', 'Dátiles', 'Chile'],
    conservacion: 'Bloque: 6-12 meses · Pasta: 3-6 meses en nevera',
  },
  {
    nombre: 'Agracejo (barberries)',
    nombreCientifico: 'Berberis vulgaris',
    partePlanta: 'Fruto seco',
    familia: 'Ácido / Cítrico',
    intensidad: 'Media',
    descripcion: 'Pequeño fruto rojo muy ácido y ligeramente dulce. Imprescindible en el arroz con pollo persa (zereshk polo) donde aporta color y acidez brillante.',
    usos: ['Arroz persa', 'Guisos de pollo', 'Ensaladas', 'Mermeladas'],
    origen: 'Irán / Europa',
    combinaCon: ['Azafrán', 'Pistachos', 'Rosa seca'],
    conservacion: '1-2 años seco',
  },

  // ── AMARGO ────────────────────────────────────────────────
  {
    nombre: 'Asafétida (hing)',
    nombreCientifico: 'Ferula asafoetida',
    partePlanta: 'Resina de la raíz',
    familia: 'Amargo',
    intensidad: 'Muy intensa',
    descripcion: 'Olor muy potente (azufrado, similar a la cebolla frita) que desaparece con la cocción dejando un sabor similar al allium. Sustituye a la cebolla y el ajo en la cocina jainista.',
    usos: ['Dal', 'Lentejas', 'Pickles', 'Currys vegetarianos jainistas'],
    origen: 'Irán / Afganistán',
    combinaCon: ['Comino', 'Mostaza (semilla)', 'Cúrcuma'],
    conservacion: '2-3 años en tarro MUY hermético (olor penetrante)',
  },
  {
    nombre: 'Fenogreco (hoja seca / methi)',
    nombreCientifico: 'Trigonella foenum-graecum',
    partePlanta: 'Hoja seca',
    familia: 'Amargo',
    intensidad: 'Media',
    descripcion: 'Amargo y herbáceo con las mismas notas de jarabe de arce que la semilla pero más ligero. Las hojas secas (kasuri methi) se desmenuzan sobre el plato terminado.',
    usos: ['Pollo tikka masala', 'Dal makhani', 'Paratha', 'Paneer'],
    origen: 'India',
    combinaCon: ['Comino', 'Cúrcuma', 'Tomate'],
    conservacion: '1-2 años en tarro seco',
  },
  {
    nombre: 'Hinojo (semilla)',
    nombreCientifico: 'Foeniculum vulgare',
    partePlanta: 'Semilla',
    familia: 'Amargo',
    intensidad: 'Media',
    descripcion: 'Anisado, ligeramente dulce y con un toque amargo al final. Similar al anís verde pero con más cuerpo y dulzor. Masticado como digestivo en India tras las comidas.',
    usos: ['Embutidos italianos', 'Pan siciliano', 'Pescados', 'Chutneys'],
    origen: 'Mediterráneo',
    combinaCon: ['Anís verde', 'Cilantro seco', 'Laurel'],
    conservacion: '2-3 años enteras',
  },
  {
    nombre: 'Semillas de sésamo',
    nombreCientifico: 'Sesamum indicum',
    partePlanta: 'Semilla',
    familia: 'Terroso / Ahumado',
    intensidad: 'Suave',
    descripcion: 'Sabor suave y ligeramente a nuez, más intenso tostado. Base del tahini y el aceite de sésamo. Sin sabor dominante propio, complementa y enriquece otros.',
    usos: ['Tahini', 'Pan de hamburguesa', 'Ensaladas', 'Sushi'],
    origen: 'África / India',
    combinaCon: ['Ajo', 'Soja', 'Jengibre'],
    conservacion: '6-12 meses (ennancian rápido)',
  },
];

// ============================================================
// COMPONENTE
// ============================================================

const FAMILIA_ESTILOS: Record<Familia, string> = {
  'Picante': styles.familiaPickante,
  'Dulce / Cálido': styles.familiaDulce,
  'Terroso / Ahumado': styles.familiaTerroso,
  'Floral / Aromático': styles.familiaFloral,
  'Herbal': styles.familiaHerbal,
  'Ácido / Cítrico': styles.familiaAcido,
  'Amargo': styles.familiaAmargo,
};

function PuntosIntensidad({ intensidad }: { intensidad: Intensidad }) {
  const nivel = INTENSIDAD_NIVEL[intensidad];
  return (
    <div className={styles.intensidadWrapper} title={`Intensidad: ${intensidad}`}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`${styles.punto} ${i <= nivel ? styles.puntoActivo : styles.puntoVacio}`}
          aria-hidden="true"
        />
      ))}
      <span className={styles.intensidadLabel}>{intensidad}</span>
    </div>
  );
}

export default function GuiaEspeciasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [familiaActiva, setFamiliaActiva] = useState<Familia | 'Todas'>('Todas');

  const especiasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return ESPECIAS.filter((e) => {
      const coincideFamilia = familiaActiva === 'Todas' || e.familia === familiaActiva;
      const coincideBusqueda =
        !q ||
        e.nombre.toLowerCase().includes(q) ||
        e.nombreCientifico.toLowerCase().includes(q) ||
        e.usos.some((u) => u.toLowerCase().includes(q)) ||
        e.origen.toLowerCase().includes(q) ||
        e.combinaCon.some((c) => c.toLowerCase().includes(q));
      return coincideFamilia && coincideBusqueda;
    });
  }, [busqueda, familiaActiva]);

  const familiasConConteo = useMemo(() => {
    const todas = { nombre: 'Todas' as const, count: ESPECIAS.length };
    const porFamilia = FAMILIAS.map((f) => ({
      nombre: f,
      count: ESPECIAS.filter((e) => e.familia === f).length,
    }));
    return [todas, ...porFamilia];
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🌿 Guía de Especias</h1>
          <p className={styles.subtitle}>
            Perfil de sabor, intensidad, usos y consejos de conservación de {ESPECIAS.length} especias.
          </p>
          <div className={styles.heroStats}>
            <span className={styles.stat}><strong>{ESPECIAS.length}</strong> especias</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><strong>{FAMILIAS.length}</strong> familias de sabor</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><strong>Origen + conservación</strong> incluidos</span>
          </div>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="medical"
          severity="high"
          context="guia-especias"
          collapsible={false}
        />

        {/* Buscador */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Busca por nombre, uso o lugar de origen…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar especia"
            />
            {busqueda && (
              <button className={styles.clearBtn} onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtros por familia */}
        <div className={styles.filtrosWrapper} role="group" aria-label="Filtrar por familia de sabor">
          {familiasConConteo.map(({ nombre, count }) => (
            <button
              key={nombre}
              className={`${styles.filtroBtn} ${familiaActiva === nombre ? styles.filtroActivo : ''} ${nombre !== 'Todas' ? FAMILIA_ESTILOS[nombre as Familia] + 'Btn' : ''}`}
              onClick={() => setFamiliaActiva(nombre)}
              aria-pressed={familiaActiva === nombre}
            >
              {nombre}
              {nombre !== 'Todas' && <span className={styles.filtroCount}>{count}</span>}
            </button>
          ))}
        </div>

        {/* Resultados */}
        <div className={styles.resultadosHeader} role="status" aria-live="polite">
          {especiasFiltradas.length === 0 ? (
            <p className={styles.sinResultados}>No hay resultados para «{busqueda}»</p>
          ) : (
            <p className={styles.contadorResultados}>
              {especiasFiltradas.length === ESPECIAS.length
                ? `Mostrando las ${ESPECIAS.length} especias`
                : `${especiasFiltradas.length} especia${especiasFiltradas.length !== 1 ? 's' : ''} encontrada${especiasFiltradas.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* Grid de tarjetas */}
        <div className={styles.especiasGrid}>
          {especiasFiltradas.map((e) => (
            <article key={e.nombre} className={styles.especiaCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.nombre}>{e.nombre}</h3>
                <span className={`${styles.familiaBadge} ${FAMILIA_ESTILOS[e.familia]}`}>
                  {e.familia}
                </span>
              </div>

              <p className={styles.nombreCientifico}>{e.nombreCientifico}</p>

              <div className={styles.metaRow}>
                <span className={styles.metaTag}>🌱 {e.partePlanta}</span>
                <span className={styles.metaTag}>📍 {e.origen}</span>
              </div>

              <PuntosIntensidad intensidad={e.intensidad} />

              <p className={styles.descripcion}>{e.descripcion}</p>

              <div className={styles.usosSection}>
                <span className={styles.usosLabel}>Usos:</span>
                <div className={styles.usosTags}>
                  {e.usos.map((u) => (
                    <span key={u} className={styles.usoTag}>{u}</span>
                  ))}
                </div>
              </div>

              <div className={styles.combinaSection}>
                <span className={styles.combinaLabel}>Combina con:</span>
                <div className={styles.combinaTags}>
                  {e.combinaCon.map((c) => (
                    <span key={c} className={styles.combinaTag}>{c}</span>
                  ))}
                </div>
              </div>

              <p className={styles.conservacion}>
                <span className={styles.conservaIcon}>🫙</span>
                {e.conservacion}
              </p>
            </article>
          ))}
        </div>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="📚 Todo sobre las especias en cocina"
          subtitle="Mezclas clásicas, conservación y cómo aprovecharlas al máximo"
        >
          {/* 1. Tabla: mezclas clásicas */}
          <section className={styles.guideSection}>
            <h2>📊 Mezclas de especias clásicas del mundo</h2>
            <p>
              Las grandes mezclas tradicionales combinan especias para crear perfiles de sabor complejos que serían imposibles de lograr con una sola. Conocerlas es entender la cocina de cada región:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Mezcla</th>
                    <th>Origen</th>
                    <th>Especias principales</th>
                    <th>Uso típico</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Garam masala</strong></td>
                    <td>India del Norte</td>
                    <td>Cardamomo, clavo, canela, comino, pimienta negra</td>
                    <td>Currys, dal, arroces</td>
                  </tr>
                  <tr>
                    <td><strong>Ras el hanout</strong></td>
                    <td>Magreb</td>
                    <td>Canela, cúrcuma, jengibre, pimienta, rose, cardamomo (hasta 30 especias)</td>
                    <td>Tagines, cuscús, carnes</td>
                  </tr>
                  <tr>
                    <td><strong>Five spice</strong></td>
                    <td>China</td>
                    <td>Anís estrellado, clavo, canela, pimienta Sichuan, hinojo</td>
                    <td>Cerdo, pato, marinadas</td>
                  </tr>
                  <tr>
                    <td><strong>Za'atar</strong></td>
                    <td>Levante (Oriente Medio)</td>
                    <td>Tomillo seco, zumaque, sésamo, orégano, sal</td>
                    <td>Pan con aceite, pollo, ensaladas</td>
                  </tr>
                  <tr>
                    <td><strong>Herbes de Provence</strong></td>
                    <td>Sur de Francia</td>
                    <td>Tomillo, romero, orégano, lavanda, mejorana, ajedrea</td>
                    <td>Asados, quesos, gratinados</td>
                  </tr>
                  <tr>
                    <td><strong>Berbere</strong></td>
                    <td>Etiopía / Eritrea</td>
                    <td>Chile, fenogreco, cilantro, jengibre, pimienta de Jamaica, clavo</td>
                    <td>Guisos injera, carnes</td>
                  </tr>
                  <tr>
                    <td><strong>Baharat</strong></td>
                    <td>Oriente Medio</td>
                    <td>Pimienta negra, cardamomo, canela, comino, pimentón, clavo</td>
                    <td>Arroces, kofta, shawarma</td>
                  </tr>
                  <tr>
                    <td><strong>Jerk seasoning</strong></td>
                    <td>Jamaica</td>
                    <td>Pimienta de Jamaica, chile, tomillo, canela, nuez moscada, ajo</td>
                    <td>Pollo y cerdo a la brasa</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guideSection}>
            <h2>👥 ¿Para quién es esta guía?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🍳</span>
                  <h3>Cocinero en casa que quiere ampliar su despensa</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Comino + Cilantro seco + Cúrcuma + Pimienta negra → base de curry casero</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Descubre qué especias combinan bien entre sí para crear tus propias mezclas en lugar de comprar polvos preparados.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🧹</span>
                  <h3>Organizar y revisar la despensa de especias</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Canela en polvo sin fecha → tiempo máximo 1-2 años → desechar si está apagada</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Consulta el tiempo máximo de conservación de cada especia y decide qué renovar.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🌍</span>
                  <h3>Cocinero curioso por una gastronomía nueva</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Cocina thai → Lemongrass + Galanga + Hojas de lima kaffir + Pasta de curry</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Filtra por familia de sabor o busca por origen para entender qué especias forman la base de cada cocina del mundo.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎁</span>
                  <h3>Elegir especias para regalar o recibir como regalo</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Azafrán de La Mancha + Pimentón de La Vera → especias nobles españolas</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Identifica las especias de más calidad y cómo conservarlas bien para que el regalo sea aprovechado.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>❓ Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cuánto tiempo duran las especias realmente?</h4>
                <p>
                  Las especias enteras duran de 2 a 5 años; las molidas entre 1 y 2 años. Sin embargo, la pérdida de aroma empieza mucho antes: a los 6 meses muchas especias molidas ya han perdido el 50% de sus aceites esenciales volátiles. La fecha de caducidad indica seguridad microbiológica, no calidad aromática.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Prueba de frescor:</strong> Frota un poco de especia en la palma de la mano y huele. Si el aroma es débil, es hora de renovarla, aunque no haya caducado.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Enteras o molidas? ¿Cuál es mejor comprar?</h4>
                <p>
                  Las enteras siempre conservan mejor el aroma porque los aceites esenciales quedan atrapados. Moler en casa con un molinillo (o mortero) justo antes de usar multiplica la intensidad. Para uso diario sin molinillo, las molidas son prácticas. Nunca compres grandes cantidades de molida: se apagan rápido.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Regla práctica:</strong> Compra enteras las especias que usas menos de una vez por semana; molida lo que usas cada día (como la pimienta en el molinillo de mesa).
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Por qué tostar las especias antes de usarlas?</h4>
                <p>
                  El tostado en seco (sin aceite, a fuego medio) activa las reacciones de Maillard y libera aceites esenciales, intensificando y transformando el sabor. El comino tostado tiene más profundidad que el crudo; las semillas de mostaza en aceite caliente "explotan" liberando su aroma. No todas las especias se benefician: la cúrcuma, por ejemplo, se quema fácilmente.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Técnica:</strong> Tuesta en seco a fuego medio moviendo constantemente. En cuanto notes el aroma y empiece a humear ligeramente, retira inmediatamente de la sartén.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cuándo se añaden las especias: al inicio o al final?</h4>
                <p>
                  Depende del efecto deseado. Al inicio en grasa caliente (tempering) se liberan compuestos liposolubles que aroman todo el plato. Al final se preservan compuestos volátiles más delicados que el calor destruiría. Las especias robustas (comino, mostaza, cardamomo) al inicio; las delicadas (hierbas frescas, azafrán, cilantro fresco) al final.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Regla:</strong> Si la especia aguanta el calor, tempérala en aceite al inicio. Si es aromática y frágil (como el cilantro fresco o la menta), añádela cruda al servir.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Hay especias que no puedan tomarse en grandes cantidades?</h4>
                <p>
                  Sí. La nuez moscada contiene miristicina: más de 5-10 g (unas 2 cucharaditas) puede causar síntomas de intoxicación. La canela de Cassia (la más común en supermercados) contiene cumarina, que en dosis altas es hepatotóxica. La asafétida mal dosificada puede causar molestias digestivas intensas. El wasabi real en grandes cantidades irrita las mucosas. Las dosis culinarias normales son seguras.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Nota:</strong> La canela de Ceilán (Cinnamomum verum, más cara) tiene muy baja cumarina y es más segura para consumo frecuente que la Cassia.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo reconocer especias de calidad?</h4>
                <p>
                  Color intenso y uniforme, aroma potente al abrir el tarro, sin grumos ni humedad, fecha de envasado reciente. Para el azafrán: filamentos rojos con punta amarilla, no polvo; el precio es una pista (el barato casi siempre es adulterado con pétalos de cártamo). Para la vainilla: vainas flexibles, húmedas y aromáticas, no secas y quebradizas.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Truco del azafrán:</strong> Disuelve unos hilos en agua templada: el color debe liberarse gradualmente y los filamentos seguir intactos. Si se deshacen, es cártamo.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo deben guardarse las especias?</h4>
                <p>
                  Los tres enemigos de las especias son el calor, la luz y la humedad. Un tarro de cristal hermético, opaco o guardado en armario oscuro, alejado del fuego y del vapor de la cocina, es lo ideal. Los tarros junto a la vitrocerámica aceleran la degradación. El frigorífico o congelador es una opción válida para especias enteras muy aromáticas como la vainilla o el azafrán.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Regla:</strong> Si al abrir un tarro de especia el aroma no te llega antes de acercar la nariz, ya ha perdido su potencia. Renuévala.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>📋 Cómo construir una despensa de especias desde cero</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Empieza con las 8 imprescindibles</h4>
                  <p>Pimienta negra entera (molinillo), sal, comino molido, pimentón (dulce y ahumado), orégano, laurel, canela y cúrcuma. Con estas 8 cubres el 80% de la cocina mediterránea, española y básica internacional.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Elige tarros herméticos y opacos</h4>
                  <p>Invierte en tarros de cristal con cierre hermético. Etiqueta siempre con la fecha de apertura. Colócalos en un armario alejado del calor del fuego y la humedad del vapor. Nunca junto a la vitrocerámica.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Compra en pequeñas cantidades</h4>
                  <p>Mejor 20 g de comino fresco que 200 g que llevan 2 años abiertos. Las especias molidas se agotan en 6-12 meses de calidad. Las tiendas especializadas y los mercados suelen tener mayor rotación que los supermercados.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Añade especias según la cocina que más cocines</h4>
                  <p>Cocina india: cardamomo, fenogreco, semilla de nigella, asafétida. Cocina mexicana: comino, cayena, orégano mexicano, chipotle. Cocina francesa: estragón, lavanda, enebro. Cocina árabe: zumaque, canela, agua de azahar.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Aprende a hacer tus propias mezclas</h4>
                  <p>Empiezas mezclando las que ya tienes: comino + cilantro + cúrcuma + pimienta = curry básico. Anís estrellado + clavo + canela + pimienta Sichuan + hinojo = five spice chino. Crear mezclas propias es más económico y más fresco.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <h4>Haz una revisión semestral de la despensa</h4>
                  <p>Cada 6 meses: huele todas las especias. Desecha las que no emitan aroma claro al frotarlas. Renueva las molidas que lleven más de un año abiertas. Las enteras que no huelas bien, tuéstalas brevemente: puede que recuperen algo de vida.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Mejores prácticas */}
          <section className={styles.guideSection}>
            <h2>✅ Claves para usar especias como un profesional</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔥</span>
                <h4>Tempera en grasa al inicio</h4>
                <p>Comino, mostaza o cardamomo en aceite caliente liberan compuestos liposolubles que perfuman todo el plato. Añadirlos en seco al final es menos eficaz.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🫙</span>
                <h4>Muele justo antes de usar</h4>
                <p>Un molinillo de especias (o de café limpio) transforma el resultado. La pimienta recién molida y el cardamomo recién machacado no tienen comparación con el polvo envasado.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🌡️</span>
                <h4>Cúrcuma siempre con pimienta negra</h4>
                <p>La piperina de la pimienta negra aumenta la biodisponibilidad de la curcumina hasta 20 veces. Es una combinación que tiene sentido tanto culinario como nutricional.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>💡</span>
                <h4>Menos es más con los sabores intensos</h4>
                <p>Clavo, asafétida, wasabi y anís estrellado son potentísimos. Empieza con la cantidad mínima (¼ cucharadita o incluso menos) y ajusta. Un exceso arruina el plato.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📍</span>
                <h4>El origen importa en las especias nobles</h4>
                <p>El azafrán de La Mancha, el pimentón de La Vera, el cardamomo de Guatemala, la vainilla de Madagascar o Tahití: el terroir afecta profundamente al aroma y calidad.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔄</span>
                <h4>Adapta el formato al uso</h4>
                <p>Especias enteras para guisos largos (se retiran). Molidas para mezclas y aliños. Frescas para terminar el plato. Cada formato aporta una intensidad y momento de entrega diferente.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning box */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon}>⚠️</span>
                <h3>Errores comunes al cocinar con especias</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>❌ Guardar especias junto al fuego o en el alféizar:</strong> El calor y la luz directa degradan los aceites esenciales en semanas. Una especia guardada mal junto a la vitrocerámica pierde su potencia en 1-2 meses.
                </li>
                <li>
                  <strong>❌ Usar cucharas húmedas para sacar especias del tarro:</strong> La humedad crea grumos y acelera la pérdida de aroma. Siempre usar cuchara seca, nunca directamente sobre el vapor de la olla.
                </li>
                <li>
                  <strong>❌ Confundir anís verde, anís estrellado e hinojo:</strong> Tienen perfiles de sabor distintos y no son intercambiables a la misma dosis. El estrellado es mucho más potente y profundo que el verde; el hinojo es más suave y dulce.
                </li>
                <li>
                  <strong>❌ Añadir el azafrán directamente sin infusionar:</strong> El azafrán debe infusionarse 10-15 minutos en agua templada, caldo o leche antes de incorporarlo. Añadirlo seco desperdicia gran parte de su aroma y color.
                </li>
                <li>
                  <strong>❌ Abusar del curry en polvo comercial:</strong> El curry industrial es una mezcla estandarizada con proporciones fijas. Aprender a combinar comino, cilantro, cúrcuma, cardamomo y pimienta por separado da más control y mejor resultado.
                </li>
                <li>
                  <strong>❌ Comprar especias en grandes envases del supermercado:</strong> El precio por kilo suele ser más alto y la fecha de envasado más antigua que en tiendas especializadas. Mejor comprar menos cantidad con mayor frescor.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-especias')} />
        <ShareCard appName="guia-especias" />
        <Footer appName="guia-especias" />
      </div>
    </>
  );
}
