'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaTiposArroz.module.css';

// ============= Tipos =============

type TipoGrano = 'Largo' | 'Medio' | 'Corto' | 'Glutinoso' | 'Salvaje';
type NivelAlmidon = 'Bajo' | 'Medio' | 'Alto' | 'Muy alto';
type RegionArroz = 'Asia' | 'Mediterráneo' | 'América' | 'África' | 'Europa';
type UsoCulinario =
  | 'Risotto'
  | 'Paella'
  | 'Sushi'
  | 'Pilaf'
  | 'Curry'
  | 'Postre'
  | 'Acompañamiento'
  | 'Sopa';

interface TipoArroz {
  nombre: string;
  nombreOriginal: string;
  tipoGrano: TipoGrano;
  almidon: NivelAlmidon;
  region: RegionArroz;
  origen: string;
  tiempoCoccion: string;
  proporcionAgua: string;
  usosIdeales: UsoCulinario[];
  platosTipicos: string[];
  caracteristicas: string[];
  descripcion: string;
  curiosidad: string;
}

// ============= Datos =============

const arroces: TipoArroz[] = [
  // ASIA — GRANO LARGO Y CORTO (8)
  {
    nombre: 'Basmati',
    nombreOriginal: 'Basmati',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'Asia',
    origen: 'India/Pakistán (Himalaya)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:1.5',
    usosIdeales: ['Pilaf', 'Curry', 'Acompañamiento'],
    platosTipicos: ['Biryani', 'Pulao indio', 'Curry de pollo'],
    caracteristicas: ['Aromático', 'Granos sueltos', 'Se alarga al cocer'],
    descripcion:
      "Uno de los arroces aromáticos más prestigiosos del subcontinente indio. Granos largos, finos y muy aromáticos que se alargan hasta el doble al cocer. Cultivado tradicionalmente en el Himalaya indio.",
    curiosidad:
      "El nombre significa 'la fragancia' en sánscrito. India produce el 70% mundial",
  },
  {
    nombre: 'Jazmín / Tailandés',
    nombreOriginal: 'Hom Mali / Khao Hom Mali',
    tipoGrano: 'Largo',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'Tailandia',
    tiempoCoccion: '12-15 min',
    proporcionAgua: '1:1.5',
    usosIdeales: ['Curry', 'Acompañamiento', 'Pilaf'],
    platosTipicos: ['Pad thai', 'Curry tailandés', 'Khao mun gai'],
    caracteristicas: ['Aroma a jazmín', 'Ligeramente pegajoso', 'Suave al paladar'],
    descripcion:
      'Arroz aromático tailandés con notas naturales a flor de jazmín y palomitas de maíz. Más pegajoso que el basmati pero menos que el de sushi.',
    curiosidad:
      'Tailandia exporta más de 8 millones de toneladas al año, siendo el primer exportador mundial de arroz',
  },
  {
    nombre: 'Arroz de sushi',
    nombreOriginal: 'Sushi-meshi / Koshihikari',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Asia',
    origen: 'Japón',
    tiempoCoccion: '20-25 min (con reposo)',
    proporcionAgua: '1:1.2',
    usosIdeales: ['Sushi', 'Acompañamiento'],
    platosTipicos: ['Sushi nigiri', 'Maki rolls', 'Onigiri'],
    caracteristicas: ['Pegajoso', 'Brillante', 'Se aliña con vinagre'],
    descripcion:
      'Arroz japonés de grano corto, pegajoso y brillante. Su alta humedad y almidón permite formar bolas que mantienen la forma. La variedad Koshihikari es la más prestigiosa.',
    curiosidad:
      'Un buen arroz Koshihikari cosechado en Niigata puede costar 50€/kg en Japón',
  },
  {
    nombre: 'Arroz glutinoso',
    nombreOriginal: 'Sticky rice / Khao niao',
    tipoGrano: 'Glutinoso',
    almidon: 'Muy alto',
    region: 'Asia',
    origen: 'Sudeste asiático',
    tiempoCoccion: '30-40 min al vapor',
    proporcionAgua: 'Cocción al vapor',
    usosIdeales: ['Postre', 'Acompañamiento'],
    platosTipicos: ['Mango sticky rice', 'Khao niao mamuang', 'Onde-onde'],
    caracteristicas: ['Muy pegajoso', 'Casi traslúcido', 'Cocción al vapor'],
    descripcion:
      "Arroz glutinoso del sudeste asiático que se cocina al vapor en cestos de bambú. Sin gluten real (a pesar del nombre): se llama 'glutinoso' por su pegajosidad extrema.",
    curiosidad:
      'En Laos se come a diario con las manos formando bolitas — es alimento básico nacional',
  },
  {
    nombre: 'Arroz negro / Forbidden rice',
    nombreOriginal: 'Riso Venere / Hēi mǐ',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'China',
    tiempoCoccion: '30-35 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Riso Venere', 'Black rice salad', 'Postres asiáticos'],
    caracteristicas: ['Color negro intenso', 'Rico en antocianinas', 'Sabor a frutos secos'],
    descripcion:
      "Variedad de arroz integral negro originaria de China, llamado hēi mǐ (黑米). En el comercio occidental se vende como 'forbidden rice' aludiendo a una tradición según la cual estaba reservado para el emperador — una leyenda popularizada por los importadores estadounidenses en los años 90. Rica en antioxidantes (más que los arándanos).",
    curiosidad:
      'En la China imperial se castigaba con la muerte a los plebeyos que lo cultivaban sin permiso',
  },
  {
    nombre: 'Arroz rojo de Camarga',
    nombreOriginal: 'Riz rouge de Camargue',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Mediterráneo',
    origen: 'Camarga (Francia)',
    tiempoCoccion: '30-40 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: [
      'Salades de riz rouge',
      'Acompañamiento de pescados',
      'Pilaf provenzal',
    ],
    caracteristicas: ['Color rojo intenso', 'Sabor intenso', 'Salobre por sal de Camarga'],
    descripcion:
      'Arroz integral rojo cultivado en los humedales de la Camarga francesa. Color rojizo natural por la pigmentación del grano. Tiene IGP francesa.',
    curiosidad:
      'La Camarga es el límite norte mundial del cultivo del arroz — clima excepcional',
  },
  {
    nombre: 'Arroz integral / Brown rice',
    nombreOriginal: 'Brown rice',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'Asia',
    origen: 'Mundial',
    tiempoCoccion: '35-45 min',
    proporcionAgua: '1:2.5',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Buddha bowl', 'Arroz integral con verduras', 'Khichdi'],
    caracteristicas: [
      'Cáscara intacta',
      'Más fibra y nutrientes',
      'Sabor a frutos secos',
    ],
    descripcion:
      'Arroz al que solo se le ha quitado la cáscara externa, conservando el salvado y germen. Más nutritivo que el blanco pero requiere más cocción.',
    curiosidad:
      'Tiene 4x más fibra y 3x más vitamina B1 que el arroz blanco',
  },
  {
    nombre: 'Arroz salvaje / Wild rice',
    nombreOriginal: 'Wild rice / Manoomin',
    tipoGrano: 'Salvaje',
    almidon: 'Bajo',
    region: 'América',
    origen: 'Norteamérica (Grandes Lagos)',
    tiempoCoccion: '45-60 min',
    proporcionAgua: '1:3',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: [
      'Wild rice soup',
      'Pavo relleno con wild rice',
      'Mezclas con arroz blanco',
    ],
    caracteristicas: [
      'No es arroz real',
      'Granos largos y oscuros',
      'Sabor terroso y a frutos secos',
    ],
    descripcion:
      'Técnicamente no es arroz: es semilla de una hierba acuática nativa de Norteamérica. Las tribus Ojibwe lo recolectan tradicionalmente en canoa.',
    curiosidad:
      "Para los Ojibwe es alimento sagrado: el 'manoomin' o 'comida buena' del Creador",
  },

  // MEDITERRÁNEO (6)
  {
    nombre: 'Arroz Bomba',
    nombreOriginal: 'Arroz Bomba',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Valencia/Calasparra (España)',
    tiempoCoccion: '16-18 min',
    proporcionAgua: '1:2.5-3',
    usosIdeales: ['Paella', 'Acompañamiento'],
    platosTipicos: ['Paella valenciana', 'Arroz a banda', 'Arroz negro'],
    caracteristicas: [
      'Absorbe 3x su volumen',
      'No se pasa fácilmente',
      'Ideal para paella',
    ],
    descripcion:
      'El arroz preferido para la paella. Variedad de grano corto y duro que absorbe el triple de líquido sin pasarse. Tiene D.O. Valencia y D.O. Calasparra.',
    curiosidad:
      'Solo se cultivan 1.500 hectáreas en España — es uno de los arroces más exclusivos del mundo',
  },
  {
    nombre: 'Arroz Senia',
    nombreOriginal: 'Arroz Senia',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Albufera de Valencia',
    tiempoCoccion: '14-16 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Paella', 'Acompañamiento'],
    platosTipicos: ['Paella tradicional', 'Arroz al horno', 'Arroz caldoso'],
    caracteristicas: [
      'Más blando que Bomba',
      'Absorbe sabor',
      'Más económico que Bomba',
    ],
    descripcion:
      'Arroz valenciano de grano corto, alternativa más económica al Bomba. Se pasa más fácilmente pero absorbe muy bien los sabores del caldo y el sofrito.',
    curiosidad:
      'Es el arroz más usado por las familias valencianas en su paella diaria — cotidiano vs. el Bomba que se reserva para eventos',
  },
  {
    nombre: 'Arroz Bahía',
    nombreOriginal: 'Bahía',
    tipoGrano: 'Corto',
    almidon: 'Medio',
    region: 'Mediterráneo',
    origen: 'Sevilla/Valencia',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Paella', 'Acompañamiento'],
    platosTipicos: [
      'Paella mixta',
      'Arroz con costra',
      'Arroz caldoso de marisco',
    ],
    caracteristicas: ['Equilibrado', 'Versátil', 'Buena absorción'],
    descripcion:
      'Variedad española muy versátil, intermedia entre Bomba y Senia en absorción. Muy usada en restaurantes por su buen comportamiento general.',
    curiosidad:
      "Es el arroz más exportado de España — el 'todo terreno' que prefieren los chefs profesionales",
  },
  {
    nombre: 'Arborio',
    nombreOriginal: 'Arborio',
    tipoGrano: 'Corto',
    almidon: 'Muy alto',
    region: 'Mediterráneo',
    origen: 'Piamonte (Italia)',
    tiempoCoccion: '18-20 min',
    proporcionAgua: 'Caldo añadido en cazos',
    usosIdeales: ['Risotto', 'Postre'],
    platosTipicos: [
      'Risotto alla milanese',
      'Risotto ai funghi porcini',
      'Riso al latte',
    ],
    caracteristicas: [
      'Liberación gradual de almidón',
      'Cremosidad sin nata',
      'Mantecato final',
    ],
    descripcion:
      'Arroz italiano del Po, esencial para hacer risotto. Su altísimo almidón se libera gradualmente al remover, creando la cremosidad característica sin necesidad de nata.',
    curiosidad:
      'Lleva el nombre de la ciudad de Arborio en el Piamonte, donde se cultiva desde el siglo XV',
  },
  {
    nombre: 'Carnaroli',
    nombreOriginal: 'Carnaroli',
    tipoGrano: 'Corto',
    almidon: 'Muy alto',
    region: 'Mediterráneo',
    origen: 'Vercelli (Italia)',
    tiempoCoccion: '16-18 min',
    proporcionAgua: 'Caldo añadido en cazos',
    usosIdeales: ['Risotto'],
    platosTipicos: [
      'Risotto al nero di seppia',
      'Risotto alla parmigiana',
      'Risotto al limone',
    ],
    caracteristicas: [
      'El rey del risotto',
      'Mantiene la firmeza al dente',
      'Más caro que Arborio',
    ],
    descripcion:
      'El arroz preferido por chefs italianos para el risotto. Aún más almidonoso que el Arborio pero mantiene mejor la textura al dente. Cultivado solo en el norte de Italia.',
    curiosidad:
      "Los grandes chefs italianos consideran que el Carnaroli es la 'única opción' para risotti de alta cocina",
  },
  {
    nombre: 'Vialone Nano',
    nombreOriginal: 'Vialone Nano',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Verona (Italia)',
    tiempoCoccion: '15-17 min',
    proporcionAgua: 'Caldo añadido en cazos',
    usosIdeales: ['Risotto'],
    platosTipicos: [
      "Risotto all'isolana",
      'Risi e bisi (con guisantes)',
      'Risotto al radicchio',
    ],
    caracteristicas: [
      'Grano más pequeño',
      'Absorbe mucho líquido',
      'Tradicional véneto',
    ],
    descripcion:
      "Arroz tradicional véneto con IGP de Verona. Grano más pequeño y absorbente que Arborio o Carnaroli, ideal para risottos 'all'onda' (cremoso-líquido).",
    curiosidad:
      "El plato 'risi e bisi' venéciano es plato oficial del dux desde el siglo XV — se servía cada 25 de abril",
  },

  // AMÉRICA (4)
  {
    nombre: 'Arroz blanco largo',
    nombreOriginal: 'Long-grain white rice',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'América',
    origen: 'EE.UU./Mundial',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Arroz blanco', 'Arroz con frijoles', 'Arroz con pollo'],
    caracteristicas: ['Granos sueltos', 'Suave', 'Versátil'],
    descripcion:
      'Arroz blanco de grano largo, el más vendido en supermercados occidentales. Granos sueltos y suaves, usado como acompañamiento universal en muchas cocinas.',
    curiosidad:
      'EE.UU. es el quinto productor mundial: el delta del Mississippi y California son las zonas principales',
  },
  {
    nombre: 'Arroz Carolina',
    nombreOriginal: 'Carolina rice',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'América',
    origen: 'Carolina del Sur (EE.UU.)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Acompañamiento', 'Sopa', 'Pilaf'],
    platosTipicos: ["Hoppin' John", 'Charleston red rice', 'Lowcountry boil'],
    caracteristicas: ['Sabor a fruto seco', 'Aromático', 'Histórico'],
    descripcion:
      "Variedad histórica de Carolina del Sur, casi extinta y revivida en los años 80. Base de la cocina 'Lowcountry' de Charleston. Aromático y nutritivo.",
    curiosidad:
      'El cultivo del Carolina Gold se desarrolló gracias al conocimiento técnico de personas esclavizadas procedentes de la Costa del Arroz africana (Senegambia, Sierra Leona, Liberia), que ya cultivaban Oryza glaberrima en sus regiones de origen. Su trabajo forzado fue el motor del sistema rizícola sureño y uno de los ejemplos más documentados de transferencia técnica desde África al continente americano',
  },
  {
    nombre: 'Arroz Calrose',
    nombreOriginal: 'Calrose',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'América',
    origen: 'California (EE.UU.)',
    tiempoCoccion: '18-20 min',
    proporcionAgua: '1:1.5',
    usosIdeales: ['Sushi', 'Acompañamiento'],
    platosTipicos: ['Sushi americano', 'California rolls', 'Bibimbap'],
    caracteristicas: ['Sustituto de sushi rice', 'Pegajoso', 'Versátil pan-asiático'],
    descripcion:
      'Arroz californiano desarrollado en 1948 a partir de variedades japonesas. Más asequible que el sushi rice auténtico, muy usado en restaurantes asiáticos en EE.UU.',
    curiosidad:
      'El 90% del arroz que se vende en California para sushi es Calrose — no Koshihikari japonés',
  },
  {
    nombre: 'Arroz Jasmin tailandés americano',
    nombreOriginal: 'American jasmine',
    tipoGrano: 'Largo',
    almidon: 'Medio',
    region: 'América',
    origen: 'Texas/Luisiana (EE.UU.)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:1.5',
    usosIdeales: ['Curry', 'Acompañamiento'],
    platosTipicos: [
      'Curry tailandés americano',
      'Pollo Cajún con arroz',
      'Jambalaya',
    ],
    caracteristicas: ['Aromático', 'Adaptado', 'Suave'],
    descripcion:
      'Variantes de arroz jazmín cultivadas en EE.UU., adaptadas al clima del sur estadounidense. Sustituye al jazmín tailandés con un perfil similar pero menos intenso.',
    curiosidad:
      'Texas y Luisiana producen 80% del arroz jazmín americano — favorecido por los huracanes que crean humedales',
  },

  // ÁFRICA Y EUROPA (4)
  {
    nombre: 'Arroz africano / African rice',
    nombreOriginal: 'Oryza glaberrima',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'África',
    origen: 'África Occidental',
    tiempoCoccion: '20-25 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Pilaf', 'Sopa'],
    platosTipicos: ['Jollof rice', 'Thieboudienne', 'Mafe'],
    caracteristicas: [
      'Especie distinta del Oryza sativa',
      'Resistente a sequía',
      'Sabor único',
    ],
    descripcion:
      'Arroz africano (Oryza glaberrima), especie distinta del arroz asiático. Cultivado en África Occidental durante 3.500 años antes de la llegada del arroz asiático.',
    curiosidad:
      'Se domesticó independientemente del arroz asiático hace 3.500 años en el delta del Níger',
  },
  {
    nombre: 'Arroz Bahia / Mahatma',
    nombreOriginal: 'Mahatma rice',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'América',
    origen: 'Texas (EE.UU.)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Pollo con arroz', 'Gumbo', 'Jambalaya'],
    caracteristicas: ['Granos muy largos', 'Sueltos', 'Marca popular'],
    descripcion:
      'Arroz de grano extra largo de Texas, la marca Mahatma es una de las más reconocidas en EE.UU. Granos sueltos y limpios, ideal como acompañamiento.',
    curiosidad:
      'Mahatma es marca registrada desde 1932, propiedad de Riviana Foods de Texas',
  },
  {
    nombre: 'Arroz aborio Italiano',
    nombreOriginal: 'Roma',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Lombardía (Italia)',
    tiempoCoccion: '15-17 min',
    proporcionAgua: 'Caldo añadido en cazos',
    usosIdeales: ['Risotto', 'Postre'],
    platosTipicos: ['Risotto allo zafferano', 'Riso al latte', 'Suppli romani'],
    caracteristicas: [
      'Buen all-rounder',
      'Más asequible que Carnaroli',
      'Suave al paladar',
    ],
    descripcion:
      'Variedad italiana intermedia entre el Arborio y el Carnaroli. Usado en cocinas italianas para risottos cotidianos y arroz con leche tradicional.',
    curiosidad:
      "El nombre 'Roma' homenajea la capital, no se cultiva allí — se desarrolló en el norte como arroz nacional",
  },
  {
    nombre: 'Arroz Padano',
    nombreOriginal: 'Padano',
    tipoGrano: 'Medio',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Llanura del Po (Italia)',
    tiempoCoccion: '16-18 min',
    proporcionAgua: 'Caldo añadido en cazos',
    usosIdeales: ['Risotto', 'Sopa'],
    platosTipicos: [
      'Risotto alla milanese',
      'Riso e fagioli',
      'Minestrone con riso',
    ],
    caracteristicas: ['Equilibrado', 'Italiano clásico', 'Buena resistencia'],
    descripcion:
      'Arroz italiano de la llanura del Po, gran productor histórico de arroz desde el siglo XV. Variedad sólida y equilibrada, usada en risottos clásicos del norte.',
    curiosidad:
      'La llanura del Po es la mayor zona arrocera de Europa: 220.000 hectáreas, 50% del arroz europeo',
  },

  // ASIA EXTRA (8)
  {
    nombre: 'Arroz indio Sona Masoori',
    nombreOriginal: 'Sona Masoori',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'India (Andhra Pradesh)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Pilaf', 'Acompañamiento', 'Curry'],
    platosTipicos: ['Idli sambar', 'Curry indio sur', 'Bisi bele bath'],
    caracteristicas: ['Económico', 'Granos medios', 'Cotidiano en sur de India'],
    descripcion:
      'Arroz cotidiano del sur de la India, especialmente Andhra Pradesh y Karnataka. Más económico que el basmati, granos medios y suaves para platos diarios.',
    curiosidad:
      'Es el arroz más consumido en el sur de la India: 80 millones de personas lo comen a diario',
  },
  {
    nombre: 'Arroz pegajoso negro / Black sticky rice',
    nombreOriginal: 'Khao niao dam',
    tipoGrano: 'Glutinoso',
    almidon: 'Muy alto',
    region: 'Asia',
    origen: 'Sudeste asiático',
    tiempoCoccion: '30-40 min al vapor',
    proporcionAgua: 'Cocción al vapor',
    usosIdeales: ['Postre'],
    platosTipicos: [
      'Black sticky rice pudding',
      'Khao niao dam',
      'Bubur ketan hitam',
    ],
    caracteristicas: [
      'Color púrpura intenso',
      'Sabor a frutos secos',
      'Postre típico',
    ],
    descripcion:
      'Versión negra del arroz glutinoso, casi púrpura cuando se cocina. Muy usado en postres del sudeste asiático con leche de coco y azúcar de palma.',
    curiosidad:
      'En Indonesia se sirve en bautizos como símbolo de prosperidad por su intenso color violeta',
  },
  {
    nombre: 'Arroz Camargue rojo',
    nombreOriginal: 'Riz Rouge IGP',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Mediterráneo',
    origen: 'Camarga (Francia)',
    tiempoCoccion: '30-40 min',
    proporcionAgua: '1:2.5',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: [
      'Salade de riz rouge',
      'Acompañamiento de cordero',
      'Pilaf provenzal',
    ],
    caracteristicas: ['Color rojo natural', 'Cáscara conservada', 'Tierra salobre'],
    descripcion:
      'Arroz cultivado solo en los humedales salobres de la Camarga, en el delta del Ródano. Su color rojo viene del salvado natural. IGP francesa desde 2000.',
    curiosidad:
      'La Camarga es la única zona arrocera de Francia — se introdujo en el siglo XIII bajo Luis IX',
  },
  {
    nombre: 'Arroz Patna',
    nombreOriginal: 'Patna rice',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'Asia',
    origen: 'Bihar (India)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:1.5',
    usosIdeales: ['Acompañamiento', 'Pilaf', 'Curry'],
    platosTipicos: [
      'Indian curry',
      'British curry house dishes',
      'Pulao',
    ],
    caracteristicas: ['Granos largos', 'Sueltos', 'Aromático suave'],
    descripcion:
      'Arroz de grano largo originario de Patna (Bihar), tradicionalmente exportado a Reino Unido. Estándar en los curry houses británicos durante décadas.',
    curiosidad:
      'En Reino Unido era el arroz más vendido para acompañar curry hasta que el basmati lo desplazó en los 90',
  },
  {
    nombre: 'Arroz japonés Koshihikari',
    nombreOriginal: 'Koshihikari',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Asia',
    origen: 'Niigata (Japón)',
    tiempoCoccion: '20-25 min con reposo',
    proporcionAgua: '1:1.2',
    usosIdeales: ['Sushi', 'Acompañamiento'],
    platosTipicos: ['Sushi premium', 'Onigiri', 'Donburi'],
    caracteristicas: ['Brillo perlado', 'Dulce natural', 'El más prestigioso'],
    descripcion:
      'La variedad de arroz más prestigiosa de Japón. Cultivada principalmente en Niigata desde 1956. Granos brillantes con dulzor natural y textura perfecta.',
    curiosidad:
      'Es la variedad más cultivada en Japón: 35% de toda la producción nacional',
  },
  {
    nombre: 'Arroz Surati / Kolam',
    nombreOriginal: 'Kolam',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'Maharashtra (India)',
    tiempoCoccion: '16-18 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Maharashtrian thali', 'Khichdi', 'Pulao'],
    caracteristicas: ['Económico', 'Granos medios', 'Cotidiano'],
    descripcion:
      'Arroz cotidiano del oeste de India, popular en Maharashtra y Gujarat. Más económico que el basmati y ampliamente usado en comidas familiares diarias.',
    curiosidad:
      'En las thalis (platos completos) maharashtrianos es el arroz por defecto, no el basmati',
  },
  {
    nombre: 'Arroz Ponni',
    nombreOriginal: 'Ponni / பொன்னி',
    tipoGrano: 'Corto',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'Tamil Nadu (India)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    usosIdeales: ['Acompañamiento', 'Curry'],
    platosTipicos: ['Sambar rice', 'Curd rice', 'Idli'],
    caracteristicas: [
      'Cultivado en delta del Cauvery',
      'Robusto',
      'Resistente',
    ],
    descripcion:
      "Arroz tamil cultivado en el fértil delta del río Cauvery. Su nombre ('Ponni') es uno de los nombres del río Cauvery en tamil antiguo. Variedad híbrida moderna.",
    curiosidad:
      'Fue desarrollado en 1986 por el Tamil Nadu Rice Research Institute para resistir plagas regionales',
  },
  {
    nombre: 'Arroz Bomba sushi americano',
    nombreOriginal: 'Sushi rice / California sushi',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'América',
    origen: 'California (EE.UU.)',
    tiempoCoccion: '20-25 min con reposo',
    proporcionAgua: '1:1.2',
    usosIdeales: ['Sushi'],
    platosTipicos: [
      'California rolls',
      'Sushi americano',
      'Spam musubi',
    ],
    caracteristicas: [
      'Más económico que japonés',
      'Sustituto de Koshihikari',
      'Pegajoso',
    ],
    descripcion:
      'Arroz californiano de grano corto desarrollado para restaurantes de sushi americanos. Características similares al Koshihikari japonés a precio más asequible.',
    curiosidad:
      'El sushi en EE.UU. usa este arroz en el 90% de los restaurantes — el Koshihikari es solo para alta cocina japonesa',
  },
];

// ============= Constantes para filtros =============

const TIPOS_GRANO: TipoGrano[] = ['Largo', 'Medio', 'Corto', 'Glutinoso', 'Salvaje'];
const NIVELES_ALMIDON: NivelAlmidon[] = ['Bajo', 'Medio', 'Alto', 'Muy alto'];
const REGIONES: RegionArroz[] = ['Asia', 'Mediterráneo', 'América', 'África', 'Europa'];
const USOS: UsoCulinario[] = [
  'Risotto',
  'Paella',
  'Sushi',
  'Pilaf',
  'Curry',
  'Postre',
  'Acompañamiento',
  'Sopa',
];

// ============= Componente principal =============

export default function GuiaTiposArrozPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrano, setFiltroGrano] = useState<TipoGrano | ''>('');
  const [filtroAlmidon, setFiltroAlmidon] = useState<NivelAlmidon | ''>('');
  const [filtroRegion, setFiltroRegion] = useState<RegionArroz | ''>('');
  const [filtroUso, setFiltroUso] = useState<UsoCulinario | ''>('');

  const arrocesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return arroces.filter((arroz) => {
      if (filtroGrano && arroz.tipoGrano !== filtroGrano) return false;
      if (filtroAlmidon && arroz.almidon !== filtroAlmidon) return false;
      if (filtroRegion && arroz.region !== filtroRegion) return false;
      if (filtroUso && !arroz.usosIdeales.includes(filtroUso)) return false;

      if (q) {
        const buscable = [
          arroz.nombre,
          arroz.nombreOriginal,
          arroz.origen,
          arroz.descripcion,
          ...arroz.platosTipicos,
          ...arroz.caracteristicas,
        ]
          .join(' ')
          .toLowerCase();

        if (!buscable.includes(q)) return false;
      }

      return true;
    });
  }, [busqueda, filtroGrano, filtroAlmidon, filtroRegion, filtroUso]);

  const resetearFiltros = () => {
    setBusqueda('');
    setFiltroGrano('');
    setFiltroAlmidon('');
    setFiltroRegion('');
    setFiltroUso('');
  };

  const hayFiltrosActivos =
    busqueda !== '' ||
    filtroGrano !== '' ||
    filtroAlmidon !== '' ||
    filtroRegion !== '' ||
    filtroUso !== '';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          🍚
        </span>
        <h1>Guía de Tipos de Arroz del Mundo</h1>
        <p>
          30 variedades de arroz: tipo de grano, origen, tiempo de cocción, proporción
          de agua y uso culinario ideal. Aprende a elegir el arroz perfecto para cada
          plato.
        </p>
      </header>

      <LegalNotice />

      {/* ============= Controles ============= */}
      <section className={styles.controlsWrapper} aria-label="Filtros de arroces">
        <div className={styles.searchBox}>
          <span className={styles.searchIcon} aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre, origen o plato típico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar arroz"
          />
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filtro-grano">
              Tipo de grano
            </label>
            <select
              id="filtro-grano"
              className={styles.filterSelect}
              value={filtroGrano}
              onChange={(e) => setFiltroGrano(e.target.value as TipoGrano | '')}
            >
              <option value="">Todos</option>
              {TIPOS_GRANO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filtro-almidon">
              Nivel de almidón
            </label>
            <select
              id="filtro-almidon"
              className={styles.filterSelect}
              value={filtroAlmidon}
              onChange={(e) => setFiltroAlmidon(e.target.value as NivelAlmidon | '')}
            >
              <option value="">Todos</option>
              {NIVELES_ALMIDON.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filtro-region">
              Región
            </label>
            <select
              id="filtro-region"
              className={styles.filterSelect}
              value={filtroRegion}
              onChange={(e) => setFiltroRegion(e.target.value as RegionArroz | '')}
            >
              <option value="">Todas</option>
              {REGIONES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filtro-uso">
              Uso culinario
            </label>
            <select
              id="filtro-uso"
              className={styles.filterSelect}
              value={filtroUso}
              onChange={(e) => setFiltroUso(e.target.value as UsoCulinario | '')}
            >
              <option value="">Todos</option>
              {USOS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={resetearFiltros}
            className={styles.resetBtn}
            aria-label="Limpiar todos los filtros"
          >
            Limpiar filtros
          </button>
        )}

        <p className={styles.counter}>
          Mostrando{' '}
          <span className={styles.counterStrong}>{arrocesFiltrados.length}</span> de{' '}
          <span className={styles.counterStrong}>{arroces.length}</span> variedades de
          arroz
        </p>
      </section>

      {/* ============= Grid de tarjetas ============= */}
      {arrocesFiltrados.length > 0 ? (
        <section className={styles.cardsGrid} aria-label="Listado de variedades de arroz">
          {arrocesFiltrados.map((arroz) => (
            <article key={arroz.nombre} className={styles.card}>
              <header className={styles.cardHeader}>
                <h2 className={styles.cardName}>{arroz.nombre}</h2>
                <p className={styles.cardOriginal}>{arroz.nombreOriginal}</p>
              </header>

              <div className={styles.badgesRow}>
                <span className={`${styles.badge} ${styles.badgeGrano}`}>
                  Grano {arroz.tipoGrano.toLowerCase()}
                </span>
                <span className={`${styles.badge} ${styles.badgeRegion}`}>
                  {arroz.region}
                </span>
                <span className={`${styles.badge} ${styles.badgeAlmidon}`}>
                  Almidón: {arroz.almidon}
                </span>
              </div>

              <div className={styles.cookingInfo}>
                <div className={styles.cookingItem}>
                  <span className={styles.cookingLabel}>Tiempo cocción</span>
                  <span className={styles.cookingValue}>{arroz.tiempoCoccion}</span>
                </div>
                <div className={styles.cookingItem}>
                  <span className={styles.cookingLabel}>Proporción agua</span>
                  <span className={styles.cookingValue}>{arroz.proporcionAgua}</span>
                </div>
                <div className={styles.cookingItem}>
                  <span className={styles.cookingLabel}>Origen</span>
                  <span className={styles.cookingValue}>{arroz.origen}</span>
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Usos ideales</p>
                <div className={styles.usosRow}>
                  {arroz.usosIdeales.map((uso) => (
                    <span key={uso} className={styles.usoPill}>
                      {uso}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Platos típicos</p>
                <ul className={styles.platosList}>
                  {arroz.platosTipicos.map((plato) => (
                    <li key={plato}>{plato}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Características</p>
                <ul className={styles.caractList}>
                  {arroz.caracteristicas.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              <p className={styles.descripcion}>{arroz.descripcion}</p>

              <p className={styles.curiosidad}>
                <span className={styles.curiosidadLabel}>Curiosidad:</span>
                {arroz.curiosidad}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            🔎
          </span>
          <p className={styles.emptyTitle}>No se encontraron arroces</p>
          <p className={styles.emptyText}>
            Prueba a cambiar los filtros o limpia la búsqueda para ver todas las
            variedades.
          </p>
        </div>
      )}

      {/* ============= Sección educativa ============= */}
      <EducationalSection
        title="Guía de Tipos de Arroz"
        subtitle="Aprende a elegir el arroz correcto para cada plato: 30 variedades del mundo, su origen, características y uso ideal"
      >
        <p className={styles.eduIntro}>
          El arroz es el cereal más consumido del mundo y existen miles de variedades.
          Elegir el correcto marca la diferencia entre una paella perfecta, un risotto
          cremoso o un sushi que se mantiene en su forma. La clave está en el
          <strong> tipo de grano</strong> (largo, medio, corto, glutinoso) y en el{' '}
          <strong>nivel de almidón</strong>: a más almidón, más cremosidad y
          pegajosidad.
        </p>

        <h3 className={styles.eduSubtitle}>Tabla comparativa de variedades clave</h3>
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Variedad</th>
                <th>Grano</th>
                <th>Almidón</th>
                <th>Mejor uso</th>
                <th>Proporción agua</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basmati</td>
                <td>Largo</td>
                <td>Bajo</td>
                <td>Curry, pilaf</td>
                <td>1:1.5</td>
              </tr>
              <tr>
                <td>Jazmín</td>
                <td>Largo</td>
                <td>Medio</td>
                <td>Cocina tailandesa</td>
                <td>1:1.5</td>
              </tr>
              <tr>
                <td>Bomba</td>
                <td>Corto</td>
                <td>Alto</td>
                <td>Paella valenciana</td>
                <td>1:2.5-3</td>
              </tr>
              <tr>
                <td>Carnaroli</td>
                <td>Corto</td>
                <td>Muy alto</td>
                <td>Risotto profesional</td>
                <td>Caldo añadido</td>
              </tr>
              <tr>
                <td>Arborio</td>
                <td>Corto</td>
                <td>Muy alto</td>
                <td>Risotto, arroz con leche</td>
                <td>Caldo añadido</td>
              </tr>
              <tr>
                <td>Sushi (Koshihikari)</td>
                <td>Corto</td>
                <td>Alto</td>
                <td>Sushi, onigiri</td>
                <td>1:1.2</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className={styles.eduSubtitle}>Casos de uso por tipo de cocinero</h3>
        <div className={styles.casosGrid}>
          <div className={styles.casoCard}>
            <h4 className={styles.casoTitle}>Cocinero principiante</h4>
            <p className={styles.casoText}>
              Empieza con <strong>basmati</strong> (granos sueltos, indulgente con la
              cocción) y <strong>arroz blanco largo</strong> para acompañar guisos.
              Proporción 1:2 y olla con tapa: imposible fallar.
            </p>
          </div>
          <div className={styles.casoCard}>
            <h4 className={styles.casoTitle}>Aficionado a las paellas</h4>
            <p className={styles.casoText}>
              Para paella seca usa <strong>Bomba</strong> (más caro, no se pasa) o{' '}
              <strong>Senia</strong> (más económico, día a día). Para arroz caldoso
              prefiere <strong>Bahía</strong>: equilibrio perfecto.
            </p>
          </div>
          <div className={styles.casoCard}>
            <h4 className={styles.casoTitle}>Sushi casero</h4>
            <p className={styles.casoText}>
              Compra <strong>arroz para sushi</strong> japonés (Koshihikari o
              equivalente) o <strong>Calrose</strong>. Lava muy bien hasta que el agua
              salga clara. Aliñar con vinagre de arroz, azúcar y sal.
            </p>
          </div>
          <div className={styles.casoCard}>
            <h4 className={styles.casoTitle}>Postres y arroz con leche</h4>
            <p className={styles.casoText}>
              Usa <strong>Arborio</strong> o <strong>arroz redondo</strong>: su almidón
              da la cremosidad necesaria sin añadir nata. Para mango sticky rice usa{' '}
              <strong>arroz glutinoso</strong> y leche de coco.
            </p>
          </div>
        </div>

        <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿Por qué se pega el arroz al cocinarlo?
            </p>
            <p className={styles.faqAnswer}>
              El almidón superficial es el responsable. Si quieres granos sueltos
              (basmati, jazmín), lávalo 2-3 veces hasta que el agua salga clara. Si
              quieres pegajosidad (sushi, risotto), no lo laves o lávalo solo una vez.
            </p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿Qué arroz puedo usar en lugar de Bomba para una paella?
            </p>
            <p className={styles.faqAnswer}>
              <strong>Senia</strong> y <strong>Bahía</strong> son las mejores
              alternativas. Si solo tienes arroz redondo común, reduce el caldo (proporción
              1:2 en vez de 1:2.5-3) y vigila para que no se pase.
            </p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿El arroz integral es mejor que el blanco?
            </p>
            <p className={styles.faqAnswer}>
              Nutricionalmente sí: 4x más fibra, más vitaminas del grupo B y minerales.
              Pero requiere más cocción (35-45 min) y agua (1:2.5). Para platos donde
              importa la textura (risotto, sushi, paella), el blanco es imprescindible.
            </p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿Cuál es la diferencia entre Arborio y Carnaroli?
            </p>
            <p className={styles.faqAnswer}>
              Ambos son arroces para risotto del norte de Italia. <strong>Arborio</strong>{' '}
              es más común y económico, libera mucho almidón. <strong>Carnaroli</strong> es
              más caro pero mantiene mejor el dente al final, por eso lo prefieren los
              chefs profesionales.
            </p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿El arroz glutinoso contiene gluten?
            </p>
            <p className={styles.faqAnswer}>
              No. A pesar del nombre, el arroz glutinoso (sticky rice) no contiene gluten
              en el sentido estricto. Se llama así por su pegajosidad, debida a un tipo
              específico de almidón (amilopectina). Es apto para celíacos.
            </p>
          </div>
        </div>

        <h3 className={styles.eduSubtitle}>Cómo cocinar arroz perfecto: paso a paso</h3>
        <ol className={styles.pasosList}>
          <li>
            <strong>Mide el arroz y el agua según la variedad.</strong> Basmati 1:1.5,
            blanco común 1:2, integral 1:2.5. La proporción correcta es la diferencia
            entre el éxito y el fracaso.
          </li>
          <li>
            <strong>Lava el grano si quieres granos sueltos.</strong> Pasa el arroz por
            agua fría removiendo con la mano hasta que el agua salga casi clara (2-3
            veces). Este paso elimina el almidón superficial.
          </li>
          <li>
            <strong>Calienta el agua o caldo antes de añadir el arroz.</strong> Llevar
            el agua a ebullición primero acelera la cocción y permite controlar mejor
            el tiempo total.
          </li>
          <li>
            <strong>Cocina con la tapa puesta a fuego mínimo.</strong> Tras añadir el
            arroz, baja el fuego al mínimo, tapa y no levantes la tapa: el vapor es
            esencial. Cuece el tiempo indicado por la variedad.
          </li>
          <li>
            <strong>Reposa 5-10 minutos antes de servir.</strong> Al apagar el fuego,
            deja la olla tapada otros 5-10 minutos. Este reposo redistribuye la humedad
            y termina la cocción del centro del grano.
          </li>
        </ol>

        <h3 className={styles.eduSubtitle}>Tips de chef</h3>
        <ul className={styles.tipsList}>
          <li>
            <strong>Lavar antes, no después:</strong> el lavado solo tiene sentido antes
            de cocinar. Lavar el arroz cocido elimina los nutrientes y arruina la
            textura.
          </li>
          <li>
            <strong>El risotto NO se lava:</strong> el almidón superficial del Arborio o
            Carnaroli es lo que crea la cremosidad. Lavarlo arruinaría el plato.
          </li>
          <li>
            <strong>Remueve el risotto, NUNCA la paella:</strong> en risotto se remueve
            constantemente para liberar almidón. En paella, jamás se remueve después
            de añadir el arroz — se rompe el socarrat.
          </li>
          <li>
            <strong>Conserva el arroz cocido en frío rápido:</strong> el arroz cocido
            puede desarrollar Bacillus cereus a temperatura ambiente. Refrigéralo en
            menos de 1 hora y consúmelo en 24-48h.
          </li>
          <li>
            <strong>Añade un chorro de aceite o mantequilla:</strong> al final de la
            cocción del arroz blanco, una cucharada de aceite o mantequilla mejora el
            sabor y evita que se pegue al servir.
          </li>
        </ul>

        <div className={styles.warningBox}>
          <h4>Errores comunes a evitar</h4>
          <ul>
            <li>
              <strong>Agua insuficiente:</strong> el arroz queda crudo en el centro y se
              quema en el fondo. Usa siempre la proporción correcta de la variedad.
            </li>
            <li>
              <strong>Levantar la tapa durante la cocción:</strong> pierde el vapor
              acumulado, baja la temperatura y altera el tiempo total. Resiste la
              tentación.
            </li>
            <li>
              <strong>Usar el arroz incorrecto para el plato:</strong> hacer paella con
              arroz basmati o sushi con arroz largo da resultados decepcionantes. Cada
              variedad tiene su uso.
            </li>
            <li>
              <strong>No respetar el reposo final:</strong> servir el arroz inmediatamente
              después de apagar el fuego deja el centro del grano duro. Esos 5-10
              minutos finales son cruciales.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-tipos-arroz')} />

      <ShareCard appName="guia-tipos-arroz" />

      <Footer appName="guia-tipos-arroz" />
    </div>
  );
}
