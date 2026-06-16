'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaAceiteOliva.module.css';

type PaisOrigen =
  | 'España'
  | 'Italia'
  | 'Grecia'
  | 'Portugal'
  | 'Túnez'
  | 'Turquía'
  | 'Marruecos'
  | 'Argentina'
  | 'California (EE.UU.)'
  | 'Australia';

type PerfilSabor =
  | 'Frutado verde intenso'
  | 'Frutado verde suave'
  | 'Frutado maduro'
  | 'Dulce'
  | 'Picante intenso'
  | 'Amargo equilibrado';

type Intensidad = 'Suave' | 'Medio' | 'Intenso';

interface VariedadAceite {
  nombre: string;
  nombreLocal: string;
  pais: PaisOrigen;
  regionesPrincipales: string[];
  perfil: PerfilSabor;
  intensidad: Intensidad;
  colorAceite: string;
  aromas: string[];
  notasDeSabor: string[];
  picorAmargura: string;
  acidezMaxima: string;
  cosecha: string;
  usoIdeal: string[];
  denominaciones: string[];
  descripcion: string;
  curiosidad: string;
}

const INTENSIDAD_NIVEL: Record<Intensidad, number> = { Suave: 1, Medio: 2, Intenso: 3 };

const PAISES: PaisOrigen[] = [
  'España',
  'Italia',
  'Grecia',
  'Portugal',
  'Túnez',
  'Turquía',
  'Marruecos',
  'Argentina',
  'California (EE.UU.)',
  'Australia',
];

const PERFILES: PerfilSabor[] = [
  'Frutado verde intenso',
  'Frutado verde suave',
  'Frutado maduro',
  'Dulce',
  'Picante intenso',
  'Amargo equilibrado',
];

const BANDERA: Record<PaisOrigen, string> = {
  'España': '🇪🇸',
  'Italia': '🇮🇹',
  'Grecia': '🇬🇷',
  'Portugal': '🇵🇹',
  'Túnez': '🇹🇳',
  'Turquía': '🇹🇷',
  'Marruecos': '🇲🇦',
  'Argentina': '🇦🇷',
  'California (EE.UU.)': '🇺🇸',
  'Australia': '🇦🇺',
};

const VARIEDADES: VariedadAceite[] = [
  // ── ESPAÑA ────────────────────────────────────────────────────────────────
  {
    nombre: 'Picual',
    nombreLocal: 'Picual',
    pais: 'España',
    regionesPrincipales: ['Jaén', 'Granada', 'Córdoba'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde intenso con reflejos dorados',
    aromas: ['Hierba recién cortada', 'Hoja de olivo', 'Alcachofa', 'Tomate verde', 'Higuera'],
    notasDeSabor: ['Alcachofa', 'Almendra verde', 'Hierba', 'Tomate'],
    picorAmargura: 'Picor y amargor pronunciados y persistentes, muy equilibrados entre sí',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Dic (cosecha temprana: Sep–Oct)',
    usoIdeal: ['Crudo sobre tostadas', 'Gazpacho y salmorejos', 'Marinadas', 'Fritura (alta estabilidad)', 'Conservación de encurtidos'],
    denominaciones: ['D.O.P. Sierra de Segura', 'D.O.P. Sierra Mágina', 'D.O.P. Priego de Córdoba'],
    descripcion: 'La variedad más cultivada del mundo: más del 20% de la producción mundial de aceite de oliva proviene de la Picual. Su altísima concentración en polifenoles (antioxidantes naturales) le otorga una estabilidad excepcional al calor y a la oxidación, haciéndola ideal tanto para crudo como para fritura de alta temperatura.',
    curiosidad: 'La Picual debe su nombre a la forma puntiaguda ("en pico") de su fruto. Es la variedad más estudiada científicamente del mundo: más de 400 trabajos académicos analizan sus propiedades antioxidantes, que superan a todas las demás variedades de aceite de oliva.',
  },
  {
    nombre: 'Arbequina',
    nombreLocal: 'Arbequina',
    pais: 'España',
    regionesPrincipales: ['Lleida', 'Tarragona', 'Huesca', 'Jaén'],
    perfil: 'Frutado maduro',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado con ligeros reflejos verdes',
    aromas: ['Manzana', 'Almendra fresca', 'Plátano maduro', 'Frutos secos', 'Nuez'],
    notasDeSabor: ['Almendra', 'Manzana', 'Plátano', 'Nuez fresca'],
    picorAmargura: 'Picor y amargor suaves, muy agradables; retrogusto dulce a almendra',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Ene',
    usoIdeal: ['Crudo sobre ensaladas y verduras', 'Repostería y bizcochos', 'Mahonesa artesana', 'Carpaccios', 'Helados y postres'],
    denominaciones: ['D.O.P. Les Garrigues', 'D.O.P. Siurana', 'D.O.P. Aceite del Bajo Aragón'],
    descripcion: 'La variedad más popular en la alta gastronomía española por su perfil suave, dulce y fácil. Originaria de Arbeca (Lleida), es hoy la variedad más plantada en nuevos olivares superintensivos de todo el mundo, desde Australia hasta Argentina. Su pequeño fruto (4-5 gramos) se presta a la recolección mecánica.',
    curiosidad: 'El olivo Arbequina resistió casi 200 años de prohibición de exportar plantas fuera de Cataluña por decreto real. Carlos III lo popularizó cuando regaló esquejes a varios nobles andaluces. Hoy es la variedad más exportada del mundo para nuevas plantaciones.',
  },
  {
    nombre: 'Hojiblanca',
    nombreLocal: 'Hojiblanca',
    pais: 'España',
    regionesPrincipales: ['Málaga', 'Córdoba', 'Sevilla', 'Granada'],
    perfil: 'Frutado verde suave',
    intensidad: 'Medio',
    colorAceite: 'Verde amarillento limpio',
    aromas: ['Almendra', 'Hierba', 'Manzana verde', 'Higuera suave'],
    notasDeSabor: ['Almendra fresca', 'Manzana verde', 'Nuez suave', 'Alcachofa ligera'],
    picorAmargura: 'Picor suave y amargor ligero, muy equilibrados; final dulce',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Ene',
    usoIdeal: ['Crudo en ensaladas', 'Pescados al horno', 'Verduras a la plancha', 'Tapas y bocadillos'],
    denominaciones: ['D.O.P. Antequera', 'D.O.P. Lucena'],
    descripcion: 'La tercera variedad española por producción y la favorita de muchos chefs por su equilibrio. Su nombre proviene del haz blanco de sus hojas, claramente visible. Produce un aceite de sabor amable y complejo que agrada a paladares poco habituados a los AOVE más intensos, siendo una magnífica puerta de entrada al mundo del aceite virgen extra.',
    curiosidad: 'La Hojiblanca es una de las pocas variedades aceituneras con doble aptitud comercial: sus frutos maduros se consumen en mesa (como aceituna aliñada) y también se procesan para aceite. Esta flexibilidad la hace especialmente valiosa para el agricultor.',
  },
  {
    nombre: 'Cornicabra',
    nombreLocal: 'Cornicabra',
    pais: 'España',
    regionesPrincipales: ['Toledo', 'Ciudad Real', 'Cáceres'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde con reflejos dorados',
    aromas: ['Hierba', 'Alcachofa', 'Tomate verde', 'Menta ligera', 'Higuera'],
    notasDeSabor: ['Alcachofa', 'Hierba fresca', 'Almendra verde', 'Tomate'],
    picorAmargura: 'Amargor notable y picor persistente; señal de alta concentración polifenólica',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Ene',
    usoIdeal: ['Crudo sobre jamón ibérico', 'Guisos y estofados', 'Encurtidos', 'Fritura'],
    denominaciones: ['D.O.P. Montes de Toledo', 'D.O.P. Campo de Calatrava'],
    descripcion: 'La variedad principal de la meseta castellano-manchega. Su nombre alude a la forma curvada del fruto, parecida a un cuerno de cabra. Destaca por su altísimo contenido en oleocantal, el compuesto antiinflamatorio del aceite de oliva, responsable de ese característico picor final en garganta que los expertos comparan al del ibuprofeno.',
    curiosidad: 'El picor intenso en la garganta que provoca el Cornicabra (y otros AOVE frutados verdes) es causado por el oleocantal, un compuesto con propiedades antiinflamatorias similares al ibuprofeno. Los catadores profesionales miden la calidad de un AOVE contando las veces que tosen al tomarlo.',
  },
  {
    nombre: 'Picudo',
    nombreLocal: 'Picudo (Carrasqueño)',
    pais: 'España',
    regionesPrincipales: ['Córdoba', 'Granada', 'Jaén'],
    perfil: 'Frutado maduro',
    intensidad: 'Medio',
    colorAceite: 'Amarillo dorado con reflejos verdes',
    aromas: ['Manzana', 'Pera', 'Almendra dulce', 'Frutos rojos', 'Anís'],
    notasDeSabor: ['Almendra', 'Manzana madura', 'Frutos rojos suaves', 'Regaliz'],
    picorAmargura: 'Picor y amargor muy suaves; retrogusto dulce y afrutado persistente',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Dic',
    usoIdeal: ['Repostería española', 'Crudo sobre quesos frescos', 'Carpaccios de fruta', 'Ensaladas templadas'],
    denominaciones: ['D.O.P. Priego de Córdoba', 'D.O.P. Baena'],
    descripcion: 'El Picudo es la variedad más compleja y aromática de Andalucía, con notas de fruta madura que ninguna otra variedad española puede igualar. Su maduración tardía y su bajo rendimiento graso lo hacen escaso y apreciado. Los mejores aceites de Priego de Córdoba, reconocidos internacionalmente, están elaborados en su mayoría con Picudo.',
    curiosidad: 'Priego de Córdoba, donde el Picudo domina el paisaje, es la denominación de origen española con más medallas internacionales per cápita: un municipio de menos de 25.000 habitantes que acumula más premios en concursos mundiales de aceite que la mayoría de regiones productoras de países enteros.',
  },
  {
    nombre: 'Manzanilla Cacereña',
    nombreLocal: 'Manzanilla Cacereña',
    pais: 'España',
    regionesPrincipales: ['Cáceres', 'Badajoz'],
    perfil: 'Frutado verde suave',
    intensidad: 'Medio',
    colorAceite: 'Verde con tonos dorados',
    aromas: ['Manzana verde', 'Hierba fresca', 'Almendra', 'Hoja de olivo'],
    notasDeSabor: ['Manzana', 'Almendra suave', 'Hierba', 'Alcachofa ligera'],
    picorAmargura: 'Equilibrado; amargor y picor medios con final limpio',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Crudo sobre tostadas', 'Gazpachos extremeños', 'Carnes a la plancha', 'Queso de cabra'],
    denominaciones: ['D.O.P. Gata-Hurdes'],
    descripcion: 'La variedad estrella de Extremadura, diferente de la Manzanilla Sevillana pese al nombre similar. Su perfil verde y fresco la hace ideal para cosechas tempranas. La comarca de Gata-Hurdes, en la frontera con Portugal, produce algunos de los aceites más frescos y herbáceos de España.',
    curiosidad: 'Extremadura tiene olivares milenarios con más de 1.000 años de antigüedad, muchos de ellos Manzanilla Cacereña, que siguen produciendo aceite con regularidad. Son árboles que han sobrevivido a la Reconquista, la Inquisición, las guerras napoleónicas y la Guerra Civil.',
  },
  {
    nombre: 'Empeltre',
    nombreLocal: 'Empeltre',
    pais: 'España',
    regionesPrincipales: ['Zaragoza', 'Teruel', 'Huesca', 'Baleares'],
    perfil: 'Dulce',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado claro',
    aromas: ['Almendra madura', 'Plátano', 'Manzana madura', 'Vainilla suave'],
    notasDeSabor: ['Almendra dulce', 'Mantequilla', 'Fruta madura', 'Nuez'],
    picorAmargura: 'Prácticamente sin amargor ni picor; aceite de sabor suavísimo y dulce',
    acidezMaxima: '<0,8°',
    cosecha: 'Dic–Feb',
    usoIdeal: ['Repostería aragonesa y mallorquina', 'Helados artesanos', 'Dulces y pasteles', 'Crudo en ensaladas suaves'],
    denominaciones: ['D.O.P. Aceite del Bajo Aragón', 'D.O.P. Mallorca'],
    descripcion: 'El Empeltre es el aceite más dulce de España y uno de los más suaves del mundo. Fruto de una maduración tardía que se suele hacer completa antes de la cosecha, produce aceites de perfil muy amable. En Mallorca es parte fundamental de la cultura culinaria local y uno de los ingredientes históricos de la ensaimada.',
    curiosidad: 'La ensaimada mallorquina tradicional se elaboraba históricamente con manteca de cerdo, pero en muchas versiones actuales artesanas se sustituye o complementa con aceite de Empeltre local. Los olivares mallorquines de Empeltre son parte del paisaje protegido de la Serra de Tramuntana, Patrimonio de la Humanidad.',
  },
  {
    nombre: 'Blanqueta',
    nombreLocal: 'Blanqueta',
    pais: 'España',
    regionesPrincipales: ['Alicante', 'Valencia', 'Murcia'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde intenso, limpio',
    aromas: ['Hierba fresca', 'Alcachofa', 'Higuera', 'Menta', 'Almendra verde'],
    notasDeSabor: ['Alcachofa', 'Almendra verde', 'Hierba', 'Notas mediterráneas'],
    picorAmargura: 'Picor y amargor intensos y bien definidos; muy característicos',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Crudo puro para catar', 'Alioli valenciano', 'Arroz al horno', 'Verduras asadas'],
    denominaciones: ['D.O.P. Marina Alta', 'D.O.P. Marina Baixa'],
    descripcion: 'Variedad autóctona valenciana casi desconocida fuera de su territorio, la Blanqueta es el orgullo de los productores de la Marina Alta (norte de Alicante). Su cosecha muy temprana, cuando el fruto aún es verde, produce aceites de una intensidad aromática excepcional. Los aceites de Blanqueta han conseguido los máximos reconocimientos en concursos mundiales.',
    curiosidad: 'La Blanqueta debe su nombre al reverso blanquecino de sus hojas, visible cuando sopla el viento. Es una variedad tan ligada a su territorio que apenas se ha expandido fuera de la Marina Alta alicantina, convirtiéndola en una rareza que solo se puede encontrar en tiendas especializadas.',
  },
  {
    nombre: 'Verdial de Huévar',
    nombreLocal: 'Verdial de Huévar',
    pais: 'España',
    regionesPrincipales: ['Sevilla', 'Huelva'],
    perfil: 'Frutado verde suave',
    intensidad: 'Medio',
    colorAceite: 'Verde brillante',
    aromas: ['Hierba', 'Manzana', 'Almendra fresca', 'Hoja de tomate'],
    notasDeSabor: ['Almendra', 'Manzana verde', 'Hierba fresca'],
    picorAmargura: 'Amargor ligero y picor suave; equilibrado y fresco',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Dic',
    usoIdeal: ['Crudo en ensaladas', 'Pescados fritos', 'Salmorejo', 'Aliñar aceitunas'],
    denominaciones: ['D.O.P. Sevilla'],
    descripcion: 'Variedad endémica del bajo Guadalquivir, la Verdial de Huévar es uno de los tesoros menos conocidos del olivar sevillano. Su maduración lenta y equilibrada produce aceites de color verde brillante con un perfil fresco y herbáceo muy apreciado por los catadores. Está en proceso de recuperación tras décadas de abandono.',
    curiosidad: 'El término "verdial" designa a un grupo de variedades ibéricas cuyo fruto permanece verde incluso al madurar completamente, en lugar de ponerse negro. Existe en varias zonas de España (Málaga, Huelva, Badajoz) y Portugal, pero son variedades distintas que comparten solo el rasgo del color.',
  },
  {
    nombre: 'Royal de Cazorla',
    nombreLocal: 'Royal de Cazorla',
    pais: 'España',
    regionesPrincipales: ['Jaén (Sierra de Cazorla)'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde esmeralda intenso',
    aromas: ['Hierba recién cortada', 'Menta', 'Alcachofa', 'Higuera verde', 'Notas silvestres'],
    notasDeSabor: ['Alcachofa intensa', 'Hierba', 'Almendra verde', 'Notas silvestres'],
    picorAmargura: 'Picor muy marcado en garganta y amargor intenso; señal de polifenoles excepcionales',
    acidezMaxima: '<0,4°',
    cosecha: 'Sep–Oct (cosecha muy temprana)',
    usoIdeal: ['Cata pura', 'Crudo sobre salmón', 'Carpaccios de pulpo', 'Escabeches'],
    denominaciones: ['D.O.P. Sierra de Cazorla'],
    descripcion: 'La Royal de Cazorla es la variedad más rara y cotizada de España: solo crece en la sierra de Cazorla (Jaén) y en ningún otro lugar del mundo. Cosechada en verde intenso, produce aceites de acidez bajísima (a veces por debajo de 0,2°) con concentraciones de polifenoles que ninguna otra variedad puede igualar. Buscada por coleccionistas y gastrónomos.',
    curiosidad: 'La Royal de Cazorla tiene la concentración más alta de oleocanthal registrada en cualquier aceite de oliva del mundo. Estudios de la Universidad de Jaén han documentado concentraciones que triplicaban la media de las mejores Picuales. Un aceite de edición limitada que a veces se vende a más de 80 €/litro.',
  },
  {
    nombre: 'Manzanilla Sevillana',
    nombreLocal: 'Manzanilla Sevillana',
    pais: 'España',
    regionesPrincipales: ['Sevilla (Aljarafe)', 'Huelva', 'Cádiz'],
    perfil: 'Frutado maduro',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado suave',
    aromas: ['Manzana madura', 'Almendra', 'Hierba suave', 'Frutos secos'],
    notasDeSabor: ['Almendra', 'Manzana', 'Notas frescas suaves'],
    picorAmargura: 'Muy suave en amargor y picor; aceite amable y redondo',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Crudo sobre gazpachos', 'Tapas sevillanas', 'Rebozados y fritos ligeros', 'Aliños'],
    denominaciones: ['D.O.P. Estepa'],
    descripcion: 'La Manzanilla Sevillana es mundialmente famosa como aceituna de mesa verde aliñada, pero también produce un aceite excelente, suave y frutado. El Aljarafe sevillano, donde se concentra su cultivo, es uno de los paisajes de olivar más antiguos de Europa. Es la variedad española más exportada como aceituna en lata.',
    curiosidad: 'La aceituna Manzanilla de Sevilla es la variedad de aceituna de mesa más consumida en el mundo, presente en todos los cócteles y tapas que piden "una aceituna". Estados Unidos importa más de 60.000 toneladas anuales de aceitunas manzanilla españolas en lata, más que ningún otro producto agrícola español.',
  },
  {
    nombre: 'Lechin de Sevilla',
    nombreLocal: 'Lechin / Zorzaleño',
    pais: 'España',
    regionesPrincipales: ['Sevilla', 'Cádiz', 'Huelva', 'Córdoba'],
    perfil: 'Frutado verde suave',
    intensidad: 'Medio',
    colorAceite: 'Verde amarillento',
    aromas: ['Hierba', 'Almendra fresca', 'Higuera', 'Fruta verde'],
    notasDeSabor: ['Hierba fresca', 'Almendra', 'Ligera alcachofa'],
    picorAmargura: 'Amargor ligero y picor moderado; perfil fresco',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Dic',
    usoIdeal: ['Aceite de coupage', 'Mezclas con Picual', 'Crudo en ensaladas', 'Pescados'],
    denominaciones: ['D.O.P. Estepa'],
    descripcion: 'La Lechin de Sevilla es la variedad más utilizada en mezclas (coupages) de la Andalucía occidental. Su perfil herbal y fresco complementa perfectamente a variedades más intensas como la Picual o la Cornicabra. Raramente se comercializa monovarietal, aunque los productores que lo hacen obtienen resultados muy apreciados.',
    curiosidad: 'El nombre "Lechin" proviene de la gran cantidad de lechada (líquido blanco lechoso) que se libera al triturar la aceituna antes de que sedimente el aceite. Algunas teorías lo relacionan con la leche de higuera; otras con el aspecto blanquecino del alpechín (agua de vegetación) que produce esta variedad.',
  },
  {
    nombre: 'Gordal Sevillana',
    nombreLocal: 'Gordal Sevillana',
    pais: 'España',
    regionesPrincipales: ['Sevilla (Aljarafe)', 'Huelva'],
    perfil: 'Dulce',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado',
    aromas: ['Almendra dulce', 'Frutos secos', 'Manzana madura'],
    notasDeSabor: ['Almendra', 'Fruta madura', 'Nuez suave'],
    picorAmargura: 'Prácticamente sin amargor ni picor; aceite muy suave',
    acidezMaxima: '<0,8°',
    cosecha: 'Sep–Oct',
    usoIdeal: ['Crudo en postres', 'Helados artesanos', 'Bizcochos tradicionales'],
    denominaciones: ['D.O.P. Estepa'],
    descripcion: 'La Gordal Sevillana, llamada así por el tamaño enorme de su fruto (de los más grandes del mundo), produce escaso aceite por su alto contenido en agua, pero de sabor extraordinariamente suave y dulce. Su uso como aceite es marginal frente a su popularidad como aceituna de mesa aliñada, pero los aceites monovarietales de Gordal son una rareza gastronómica muy buscada.',
    curiosidad: 'La aceituna Gordal es tan grande que pesa hasta 15 gramos la unidad, cuando una aceituna normal pesa 3-5 gramos. Para que resulte rentable como aceite, la almazara debe procesar cantidades enormes: se necesitan casi 10 kg de Gordal para obtener 1 litro de aceite, frente a los 5-6 kg de Picual.',
  },
  {
    nombre: 'Frantoio (España)',
    nombreLocal: 'Frantoio',
    pais: 'España',
    regionesPrincipales: ['Cataluña', 'Andalucía (nuevas plantaciones)'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde brillante',
    aromas: ['Hierba fresca', 'Alcachofa', 'Almendra verde', 'Tomate verde'],
    notasDeSabor: ['Alcachofa', 'Hierba', 'Almendra verde intensa'],
    picorAmargura: 'Picor intenso y amargor pronunciado; característico de cosecha temprana',
    acidezMaxima: '<0,5°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Coupages de alta gama', 'Crudo sobre carnes', 'Escabeches'],
    denominaciones: [],
    descripcion: 'La variedad italiana Frantoio ha encontrado en los nuevos olivares catalanes y andaluces de nueva plantación un segundo hogar de calidad. Cultivada en cosecha muy temprana, produce aceites de gran intensidad y potencia aromática, valorados para coupages premium junto con Arbequina y Picual.',
    curiosidad: 'El nombre Frantoio significa literalmente "almazara" en italiano: es la variedad que más se identifica con la producción de aceite en la cultura toscana. Cuando un italiano dice "aceite de Frantoio" implica necesariamente origen artesanal de pequeña producción.',
  },

  // ── ITALIA ──────────────────────────────────────────────────────────────────
  {
    nombre: 'Taggiasca',
    nombreLocal: 'Taggiasca',
    pais: 'Italia',
    regionesPrincipales: ['Imperia (Liguria)', 'Savona'],
    perfil: 'Dulce',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado claro, pálido',
    aromas: ['Almendra suave', 'Nuez', 'Frutos secos', 'Floral muy sutil'],
    notasDeSabor: ['Almendra', 'Nuez fresca', 'Mantequilla', 'Fruta madura suave'],
    picorAmargura: 'Mínimo amargor y picor prácticamente nulo; uno de los aceites más suaves del mundo',
    acidezMaxima: '<0,5°',
    cosecha: 'Ene–Mar',
    usoIdeal: ['Crudo sobre pasta fresca', 'Pescados delicados', 'Pesto genovés', 'Focaccia ligur', 'Postres de alta cocina'],
    denominaciones: ['D.O.P. Riviera Ligure'],
    descripcion: 'La Taggiasca es considerada el aceite más elegante y refinado de Italia. Cultivada en las estrechas terrazas sobre el Mar Mediterráneo de la Riviera de Levante, produce aceites de una dulzura y suavidad únicas. La misma aceituna, en conserva con hierbas provenzales, es un ingrediente icónico de la cocina ligur y de la Pizza Nicoise.',
    curiosidad: 'Las terrazas de olivares de Taggiasca en la Riviera Ligure se sostienen sobre muros de piedra seca construidos hace más de 800 años por monjes benedictinos del monasterio de San Benigno. Son Patrimonio de la Humanidad en proceso de reconocimiento y requieren mantenimiento manual absoluto: ninguna maquinaria puede trabajar en esas pendientes del 60-80%.',
  },
  {
    nombre: 'Frantoio (Toscana)',
    nombreLocal: 'Frantoio',
    pais: 'Italia',
    regionesPrincipales: ['Florencia', 'Siena', 'Lucca', 'Pistoia'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde esmeralda brillante',
    aromas: ['Alcachofa', 'Hierba fresca', 'Tomate verde', 'Almendra verde', 'Pimienta verde'],
    notasDeSabor: ['Alcachofa', 'Hierba', 'Almendra verde intensa', 'Tomate'],
    picorAmargura: 'Amargor marcado y picor intenso en garganta; muy características de la Toscana',
    acidezMaxima: '<0,5°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Sobre bruschetta toscana', 'Bistecca alla fiorentina', 'Ribollita', 'Carpaccios de carne'],
    denominaciones: ['D.O.P. Toscano', 'D.O.P. Chianti Classico'],
    descripcion: 'El aceite toscano de Frantoio es el emblema de la cultura gastronómica italiana y uno de los aceites más imitados del mundo. Su color verde intenso, su aroma intenso a hierba y su picor marcado en garganta son señas de identidad que los toscanos conocen desde niños. La "bruschetta" (pan tostado con aceite de Frantoio crudo) es posiblemente la receta italiana más simple y perfecta.',
    curiosidad: 'Toscana produce el aceite más falsificado del mundo. Estudios de la Guardia di Finanza italiana estiman que el 70% del aceite etiquetado como "extra virgen toscano" en el mercado mundial no es de origen toscano. La D.O.P. Toscano es el sello de autenticidad que garantiza origen real.',
  },
  {
    nombre: 'Moraiolo',
    nombreLocal: 'Moraiolo',
    pais: 'Italia',
    regionesPrincipales: ['Umbría', 'Toscana meridional'],
    perfil: 'Amargo equilibrado',
    intensidad: 'Intenso',
    colorAceite: 'Verde oscuro profundo',
    aromas: ['Alcachofa intensa', 'Hierba silvestre', 'Almendra verde', 'Endivia', 'Rúcula'],
    notasDeSabor: ['Alcachofa', 'Rúcula', 'Achicoria', 'Almendra amarga'],
    picorAmargura: 'Amargor intenso y persistente; picor notable; el más amargo de las variedades italianas',
    acidezMaxima: '<0,5°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Legumbres cocidas', 'Sopas de garbanzos y lentejas', 'Carne a la brasa', 'Bruschetta rústica'],
    denominaciones: ['D.O.P. Umbria'],
    descripcion: 'El Moraiolo es el alma amarga de los aceites de Umbría, la región italiana más olívícola tras Toscana. Su perfil intensamente amargo no es para todos los paladares, pero los amantes del AOVE verde reconocen en él la máxima expresión de los polifenoles y antioxidantes del aceite de oliva. Los monasterios umbríos lo han producido durante siglos como alimento medicinal.',
    curiosidad: 'En Umbría existe una tradición que llama "vino novello dell\'olio" a la degustación del aceite de cosecha temprana cada noviembre, similar al Beaujolais Nouveau francés. Las almazaras abren sus puertas y los locales hacen cola para ser los primeros en catar el aceite recién prensado en frío.',
  },
  {
    nombre: 'Coratina',
    nombreLocal: 'Coratina',
    pais: 'Italia',
    regionesPrincipales: ['Bari (Puglia)', 'Barletta-Andria-Trani'],
    perfil: 'Amargo equilibrado',
    intensidad: 'Intenso',
    colorAceite: 'Verde intenso a amarillo verdoso',
    aromas: ['Alcachofa muy intensa', 'Hierba fresca', 'Pimienta', 'Rúcula', 'Nuez verde'],
    notasDeSabor: ['Alcachofa', 'Pimienta verde', 'Nuez amarga', 'Notas vegetales intensas'],
    picorAmargura: 'Picor muy intenso y amargor pronunciadísimo; el más alto índice de oleocanthal de Italia',
    acidezMaxima: '<0,5°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Cata pura', 'Sobre carnes fuertes', 'Pasta con ragú', 'Fritura (alta estabilidad)'],
    denominaciones: ['D.O.P. Terra di Bari'],
    descripcion: 'La Coratina de Puglia es la variedad italiana con mayor concentración de polifenoles del país, superando incluso a la Frantoio toscana. Su perfil intensísimo en amargor y picor la hace una herramienta de los chefs avanzados que buscan aceites con personalidad extrema. Puglia produce el 40% de todo el aceite de Italia.',
    curiosidad: 'Puglia tiene más de 60 millones de olivos y algunos de ellos tienen más de 3.000 años de antigüedad, siendo los árboles vivos más viejos de Europa. Estos ulivi monumentali, protegidos por ley desde 1939, producen aceite de Coratina cuya fruta puede costar 50 veces más que la de olivos normales.',
  },
  {
    nombre: 'Nocellara del Belice',
    nombreLocal: 'Nocellara del Belice',
    pais: 'Italia',
    regionesPrincipales: ['Trapani (Sicilia)', 'Agrigento', 'Valle del Belice'],
    perfil: 'Frutado verde suave',
    intensidad: 'Medio',
    colorAceite: 'Verde con tonos dorados',
    aromas: ['Tomate', 'Hierba fresca', 'Almendra', 'Hinojo silvestre'],
    notasDeSabor: ['Tomate maduro', 'Almendra fresca', 'Hierba mediterránea'],
    picorAmargura: 'Amargor ligero y picor suave; retrogusto a tomate fresco muy característico',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Sobre pasta alla norma', 'Pescados sicilianos', 'Crudo en ensalada caprese', 'Pan con tomate siciliano'],
    denominaciones: ['D.O.P. Valle del Belice'],
    descripcion: 'La Nocellara del Belice tiene doble vida: como aceituna de mesa verde es mundialmente famosa (la más apreciada de las aceitunas italianas en alta gastronomía), y su aceite tiene una nota de tomate fresco completamente única en el mundo olívícola. Los mejores restaurantes italianos la tienen en carta.',
    curiosidad: 'El terremoto del Valle del Belice de 1968 (6,4 en la escala de Richter) destruyó 14 municipios sicilianos pero dejó intactos los olivares milenarios de Nocellara. Los árboles sobrevivieron porque sus raíces profundísimas estabilizan el suelo en laderas que los edificios no pudieron aguantar.',
  },
  {
    nombre: 'Leccino',
    nombreLocal: 'Leccino',
    pais: 'Italia',
    regionesPrincipales: ['Toda Italia (extendido)', 'Toscana', 'Puglia', 'Umbría'],
    perfil: 'Frutado maduro',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado suave',
    aromas: ['Almendra', 'Manzana madura', 'Floral ligero', 'Frutos secos'],
    notasDeSabor: ['Almendra suave', 'Manzana', 'Fruta madura', 'Nuez'],
    picorAmargura: 'Amargor y picor muy leves; aceite equilibrado y amable',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Dic',
    usoIdeal: ['Coupages italianos', 'Cocina cotidiana', 'Ensaladas suaves', 'Repostería italiana'],
    denominaciones: ['D.O.P. Toscano', 'D.O.P. Umbria'],
    descripcion: 'El Leccino es la variedad italiana más versátil y adaptable, cultivada en toda Italia y en decenas de países del mundo. Raramente protagoniza un aceite monovarietal de alto standing, pero es el "armonizador" por excelencia en los grandes coupages toscanos y umbríos. Su resistencia al frío le permite crecer en zonas donde el Frantoio perece.',
    curiosidad: 'El Leccino fue uno de los primeros olivos italianos en adoptarse fuera de Europa. Su tolerancia al frío (hasta -12°C) permitió su cultivo en zonas de América del Norte y del Sur, Australia y Sudáfrica donde el Frantoio y el Moraiolo no sobrevivían. Hoy es el olivo italiano más plantado en el extranjero.',
  },
  {
    nombre: 'Carolea',
    nombreLocal: 'Carolea (Grossa di Cassano)',
    pais: 'Italia',
    regionesPrincipales: ['Catanzaro (Calabria)', 'Cosenza', 'Crotone'],
    perfil: 'Frutado maduro',
    intensidad: 'Medio',
    colorAceite: 'Amarillo dorado',
    aromas: ['Almendra madura', 'Nuez', 'Frutos secos', 'Hierba suave'],
    notasDeSabor: ['Almendra', 'Nuez', 'Fruta madura suave'],
    picorAmargura: 'Amargor y picor moderados y muy equilibrados',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Ene',
    usoIdeal: ['Fritos calabreses', 'Nduja y embutidos locales', 'Pasta calabresa', 'Crudo en ensaladas'],
    denominaciones: ['D.O.P. Lamezia', 'D.O.P. Bruzio'],
    descripcion: 'La Carolea es el corazón de la cultura oleícola calabresa, una región poco conocida internacionalmente pero con una producción que rivaliza con Toscana. Sus aceites de perfil amable y equilibrado, producidos en muchos casos por pequeños agricultores de montaña, representan la esencia de la dieta mediterránea calabresa.',
    curiosidad: 'Calabria tiene la mayor densidad de olivos monumentales de Italia después de Puglia. Los olivares de Carolea en las laderas de la Sila han estado en producción desde la Magna Grecia (siglo VIII a.C.). Los arqueólogos han encontrado prensas de aceite griegas en la zona que confirman 2.800 años de producción ininterrumpida.',
  },

  // ── GRECIA ──────────────────────────────────────────────────────────────────
  {
    nombre: 'Koroneiki',
    nombreLocal: 'Κορωνέικη (Koroneiki)',
    pais: 'Grecia',
    regionesPrincipales: ['Peloponeso', 'Creta', 'Mesenia', 'Laconia'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde intenso a dorado',
    aromas: ['Hierba fresca', 'Alcachofa', 'Tomate verde', 'Almendra verde', 'Notas silvestres'],
    notasDeSabor: ['Alcachofa', 'Tomate verde', 'Hierba silvestre', 'Almendra verde'],
    picorAmargura: 'Picor intenso y amargor pronunciado; señal de polifenoles altísimos',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Ene',
    usoIdeal: ['Crudo sobre tzatziki', 'Ensalada griega', 'Sobre queso feta', 'Cordero asado'],
    denominaciones: ['D.O.P. Kalamata', 'D.O.P. Messinia', 'D.O.P. Laconia'],
    descripcion: 'La Koroneiki es la variedad griega por excelencia y la que más contribuye a la reputación internacional del aceite griego. Fruto pequeño pero con rendimiento graso altísimo, produce aceites con niveles de polifenoles excepcionales. Grecia es el tercer productor mundial pero el primero en consumo per cápita (25 litros/persona/año).',
    curiosidad: 'Grecia tiene la mayor densidad de olivos por habitante del mundo: unos 165 millones de olivos para 11 millones de habitantes (15 olivos por persona). El 80% de la producción griega es AOVE, frente al 45% de Italia o el 60% de España, lo que hace al aceite griego estadísticamente el de mayor calidad media.',
  },
  {
    nombre: 'Manaki',
    nombreLocal: 'Μανάκι (Manaki)',
    pais: 'Grecia',
    regionesPrincipales: ['Peloponeso norte', 'Ática', 'Beocia'],
    perfil: 'Frutado maduro',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado',
    aromas: ['Almendra madura', 'Manzana', 'Fruta tropical suave', 'Nuez'],
    notasDeSabor: ['Almendra', 'Fruta madura', 'Ligera dulzura'],
    picorAmargura: 'Picor y amargor suaves; aceite equilibrado y fácil',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Dic',
    usoIdeal: ['Ensalada griega', 'Moussaka', 'Revithia (garbanzos griegos)', 'Cocina cotidiana'],
    denominaciones: ['I.G.P. Ática'],
    descripcion: 'La Manaki es la segunda variedad griega en importancia y la que aporta suavidad y equilibrio a los coupages con Koroneiki. Producida en las colinas del Peloponeso norte y Ática, es el aceite de cocina cotidiana del griego medio. Sus aceites de perfil amable son una puerta de entrada perfecta al mundo del aceite griego.',
    curiosidad: 'El olivar del barrio de Kolonaki en Atenas, en el jardín del British School of Athens, tiene un olivo identificado como posiblemente el olivo más antiguo de toda la región ática, con estimaciones dendrocronológicas de 2.500 años. Los atenienses lo consideran un monumento vivo de su historia.',
  },
  {
    nombre: 'Throuba Thassos',
    nombreLocal: 'Θρούμπα Θάσου (Throuba Thassos)',
    pais: 'Grecia',
    regionesPrincipales: ['Isla de Thasos'],
    perfil: 'Dulce',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado claro',
    aromas: ['Fruta madura', 'Higo seco', 'Almendra', 'Miel ligera'],
    notasDeSabor: ['Higo', 'Almendra', 'Fruta seca dulce'],
    picorAmargura: 'Sin amargor ni picor; aceite excepcionalmente suave y dulce',
    acidezMaxima: '<1,0° (madurez avanzada)',
    cosecha: 'Nov–Dic (maduración completa en el árbol)',
    usoIdeal: ['Repostería griega (baklava)', 'Crudo sobre queso de cabra', 'Postres mediterráneos'],
    denominaciones: ['D.O.P. Thassos'],
    descripcion: 'La Throuba de Thasos es la variedad griega más especial: la aceituna madura completamente en el árbol hasta casi pasificarse, produciendo un aceite dulcísimo y sin el amargor ni picor del aceite verde. La isla de Thasos (norte del Egeo) tiene una D.O.P. exclusiva para este producto único, que también se come como aceituna arrugada sin deshuesar.',
    curiosidad: 'Las aceitunas Throuba de Thasos se curan sin salmuera, simplemente mezcladas con sal gruesa y secadas al sol, un método que se usa desde antes de la Era Cristiana. La isla de Thasos aparece ya en Heródoto como productora de aceite de oliva de calidad excepcional en el siglo V a.C.',
  },
  {
    nombre: 'Athinolia',
    nombreLocal: 'Αθηνολιά (Athinolia)',
    pais: 'Grecia',
    regionesPrincipales: ['Creta (Heraklion, Messara)', 'Laconia'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde intenso brillante',
    aromas: ['Alcachofa', 'Hierba silvestre', 'Menta', 'Almendra verde', 'Higuera'],
    notasDeSabor: ['Alcachofa intensa', 'Hierba', 'Almendra verde', 'Pimienta'],
    picorAmargura: 'Picor y amargor muy pronunciados; aceite con carácter muy definido',
    acidezMaxima: '<0,5°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Dakos cretense', 'Cordero con hierbas', 'Cata de aceites', 'Carnes a la plancha'],
    denominaciones: ['D.O.P. Heraklion Pediados'],
    descripcion: 'La Athinolia es la variedad autóctona de Creta, la isla con mayor producción de AOVE de toda Grecia. Sus aceites de cosecha temprana son de una intensidad y complejidad aromática difícil de igualar. Creta tiene más olivares por kilómetro cuadrado que cualquier otra región del Mediterráneo.',
    curiosidad: 'En el yacimiento minoico de Knossos (Creta, 1700 a.C.) se han encontrado depósitos de almacenamiento de aceite de oliva con capacidad para 20.000 litros, evidencia del comercio oleícola cretense hace 3.700 años. El aceite de oliva fue posiblemente la primera exportación de lujo del mundo mediterráneo.',
  },

  // ── PORTUGAL ──────────────────────────────────────────────────────────────────
  {
    nombre: 'Galega',
    nombreLocal: 'Galega Vulgar',
    pais: 'Portugal',
    regionesPrincipales: ['Alentejo', 'Ribatejo', 'Trás-os-Montes'],
    perfil: 'Frutado maduro',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado con ligeros reflejos verdes',
    aromas: ['Higuera madura', 'Almendra', 'Frutos secos', 'Manzana madura'],
    notasDeSabor: ['Higuera', 'Almendra madura', 'Fruta seca suave'],
    picorAmargura: 'Amargor muy suave y picor ligero; aceite amable y especial',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Ene',
    usoIdeal: ['Bacalhau à Brás', 'Petiscos portugueses', 'Queijos da Serra', 'Repostería alentejana'],
    denominaciones: ['D.O.P. Moura', 'D.O.P. Alentejo'],
    descripcion: 'La Galega es la variedad endémica portuguesa y el alma del aceite del Alentejo, considerada por muchos catadores el aceite con mayor identidad cultural de Portugal. Su aroma a higuera madura es completamente único: ninguna otra variedad del mundo tiene esa nota tan característica. Los olivares del Alentejo son los más extensos de Europa.',
    curiosidad: 'Portugal está en plena revolución oleícola: el Alentejo ha pasado de olivares tradicionales dispersos a los olivares superintensivos más grandes del mundo (campos de hasta 10.000 hectáreas con riego por goteo). Esta modernización ha multiplicado por 5 la producción en 10 años, haciendo de Portugal un exportador de primer nivel.',
  },
  {
    nombre: 'Cobrançosa',
    nombreLocal: 'Cobrançosa',
    pais: 'Portugal',
    regionesPrincipales: ['Trás-os-Montes', 'Douro', 'Beira Interior'],
    perfil: 'Frutado verde suave',
    intensidad: 'Medio',
    colorAceite: 'Verde amarillento',
    aromas: ['Hierba', 'Almendra fresca', 'Manzana verde', 'Ligero foral'],
    notasDeSabor: ['Almendra fresca', 'Hierba', 'Manzana verde'],
    picorAmargura: 'Amargor moderado y picor suave-medio; buen equilibrio',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Cozido à portuguesa', 'Sopas portuguesas', 'Crudo sobre sopa verde', 'Queijo fresco'],
    denominaciones: ['D.O.P. Trás-os-Montes', 'D.O.P. Beira Interior'],
    descripcion: 'La Cobrançosa es la segunda variedad portuguesa en importancia y la más apreciada del norte del país. Sus aceites de perfil fresco y herbáceo son los favoritos para la cocina cotidiana norteña. La región de Trás-os-Montes, de clima más frío y severo que el Alentejo, produce aceites de mayor acidez y carácter.',
    curiosidad: 'En la región de Trás-os-Montes existe una variante de la Cobrançosa llamada "Cobrançosa de Valpaços" que produce aceites con notas florales únicas, muy apreciadas en concursos internacionales. Es una de las pocas variedades del mundo cuya expresión cambia radicalmente según el microclima del municipio donde crece.',
  },

  // ── RESTO DEL MUNDO ──────────────────────────────────────────────────────────
  {
    nombre: 'Chetoui',
    nombreLocal: 'Chetoui',
    pais: 'Túnez',
    regionesPrincipales: ['Cap Bon', 'Zaghouan', 'Siliana'],
    perfil: 'Frutado verde intenso',
    intensidad: 'Intenso',
    colorAceite: 'Verde brillante a amarillo verdoso',
    aromas: ['Hierba silvestre', 'Pimienta verde', 'Alcachofa', 'Hierbas mediterráneas silvestres'],
    notasDeSabor: ['Alcachofa', 'Pimienta', 'Hierba intensa', 'Almendra amarga'],
    picorAmargura: 'Picor muy pronunciado y amargor intenso; uno de los aceites más picantes del mundo',
    acidezMaxima: '<0,8°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Couscous', 'Mechouia (ensalada tunecina asada)', 'Shawarma', 'Harissa casera'],
    denominaciones: ['I.G.P. Teboursouk'],
    descripcion: 'Túnez es el cuarto productor mundial de aceite de oliva y el Chetoui es su variedad premium de cosecha temprana. Cultivada en el norte del país, donde el clima es más suave y húmedo, produce aceites de intensidad excepcional que han sorprendido a jueces de concursos internacionales en los últimos años.',
    curiosidad: 'Túnez tiene más de 80 millones de olivos, más que habitantes. El Gobierno tunecino ha subvencionado durante décadas la expansión del olivar como estrategia de desarrollo rural. Sin embargo, la producción es muy irregular año a año debido a la sequía: algunos años Túnez es cuarto productor, otros cae al décimo.',
  },
  {
    nombre: 'Gemlik',
    nombreLocal: 'Gemlik (Trilye)',
    pais: 'Turquía',
    regionesPrincipales: ['Bursa', 'Balıkesir', 'Yalova'],
    perfil: 'Frutado maduro',
    intensidad: 'Medio',
    colorAceite: 'Amarillo dorado',
    aromas: ['Fruta madura', 'Almendra', 'Hierba suave', 'Nuez'],
    notasDeSabor: ['Almendra', 'Fruta madura', 'Nuez suave'],
    picorAmargura: 'Amargor y picor moderados y equilibrados',
    acidezMaxima: '<0,8°',
    cosecha: 'Nov–Dic',
    usoIdeal: ['Meze turcos', 'Börek', 'Cacik (tzatziki turco)', 'Cocina cotidiana turca'],
    denominaciones: ['I.G.P. Gemlik'],
    descripcion: 'Turquía es el quinto productor mundial de aceite de oliva y el Gemlik es su variedad más conocida, tanto para aceite como para aceituna negra curada. El Mar de Mármara, cuyas orillas producen el grueso del Gemlik, ofrece condiciones climáticas únicas para una variedad que define la cocina turca cotidiana.',
    curiosidad: 'La aceituna negra Gemlik curada es el desayuno turco por excelencia: junto con queso blanco (beyaz peynir), pan y té negro, es la primera comida del día de millones de turcos. El consumo interno de aceitunas en Turquía es tan alto que una parte significativa de la producción nunca sale del país.',
  },
  {
    nombre: 'Arbosana',
    nombreLocal: 'Arbosana (California)',
    pais: 'California (EE.UU.)',
    regionesPrincipales: ['Central Valley (CA)', 'Sacramento Valley'],
    perfil: 'Frutado verde suave',
    intensidad: 'Medio',
    colorAceite: 'Amarillo dorado con reflejos verdes',
    aromas: ['Manzana verde', 'Almendra fresca', 'Hierba', 'Alcachofa ligera'],
    notasDeSabor: ['Almendra', 'Manzana verde', 'Hierba fresca'],
    picorAmargura: 'Picor suave y amargor ligero; perfil limpio y fresco',
    acidezMaxima: '<0,5°',
    cosecha: 'Oct–Nov',
    usoIdeal: ['Alta cocina californiana', 'Ensaladas', 'Mariscos', 'Cocina fusion'],
    denominaciones: ['California EVOO Certification'],
    descripcion: 'California produce hoy los aceites de mayor calidad técnica del Nuevo Mundo, y la Arbosana (variedad española adaptada) es su bandera. Los olivares superintensivos del Central Valley, con riego por goteo y cosecha mecanizada, permiten producir aceites de acidez bajísima con consistencia industrial. Los aceites californianos han ganado varios World´s Best Awards en los últimos 5 años.',
    curiosidad: 'California introdujo los primeros olivares superintensivos del mundo (más de 1.700 árboles/hectárea) como alternativa al modelo español tradicional (150-300 árboles/ha). Esta tecnología, desarrollada en España, fue perfeccionada en California y ahora vuelve a adoptarse en toda la cuenca mediterránea, incluida España.',
  },
  {
    nombre: 'Manzanilla (Cono Sur)',
    nombreLocal: 'Manzanilla (Argentina/Chile)',
    pais: 'Argentina',
    regionesPrincipales: ['Mendoza', 'San Juan', 'La Rioja (AR)', 'Atacama (CL)'],
    perfil: 'Frutado maduro',
    intensidad: 'Suave',
    colorAceite: 'Amarillo dorado claro',
    aromas: ['Almendra', 'Manzana madura', 'Frutos secos', 'Hierba suave'],
    notasDeSabor: ['Almendra', 'Manzana', 'Nuez'],
    picorAmargura: 'Suave en amargor y picor; aceite equilibrado y amable',
    acidezMaxima: '<0,8°',
    cosecha: 'Abr–Jun (hemisferio sur)',
    usoIdeal: ['Asados argentinos', 'Empanadas', 'Chimichurri base', 'Cocina cotidiana'],
    denominaciones: ['Mendoza EVOO'],
    descripcion: 'Argentina y Chile han desarrollado una olivicultura de calidad excepcional en los valles andinos de alta altitud. La Manzanilla, variedad española de origen, ha encontrado en Mendoza condiciones de altitud, aridez y amplitud térmica que producen aceites con complejidad sorprendente. Argentina es hoy el mayor productor del hemisferio sur.',
    curiosidad: 'Los olivares argentinos de Mendoza y San Juan se plantan a 600-1.200 metros de altitud, bajo la influencia del viento Zonda (similar al Foehn europeo). Esta combinación de aridez extrema, sol intenso y temperaturas nocturnas muy bajas concentra los aromas en el fruto de una forma que no ocurre en los olivares mediterráneos de baja altitud.',
  },
  {
    nombre: 'Frantoio (Australia)',
    nombreLocal: 'Frantoio australiano',
    pais: 'Australia',
    regionesPrincipales: ['McLaren Vale (SA)', 'Margaret River (WA)', 'Mornington Peninsula (VIC)'],
    perfil: 'Frutado verde suave',
    intensidad: 'Medio',
    colorAceite: 'Verde amarillento brillante',
    aromas: ['Hierba fresca', 'Almendra verde', 'Manzana', 'Notas herbáceas'],
    notasDeSabor: ['Almendra', 'Hierba', 'Manzana verde', 'Ligera alcachofa'],
    picorAmargura: 'Picor y amargor suaves-medios; perfil limpio y bien definido',
    acidezMaxima: '<0,5°',
    cosecha: 'Abr–Jun (hemisferio sur)',
    usoIdeal: ['Alta cocina australiana', 'Marisco y ostras', 'Ensaladas verdes', 'Cocina fusion asiática'],
    denominaciones: ['Australian Extra Virgin (AEVOO)'],
    descripcion: 'Australia ha construido en solo 30 años una industria oleícola que compite con las mejores del mundo. McLaren Vale (Australia del Sur) y Margaret River (Australia Occidental) producen aceites de Frantoio, Picual y Arbequina con acidez bajísima y perfiles aromáticos únicos, influenciados por el terroir australiano. Los concursos internacionales no pueden ignorar ya el AEVO australiano.',
    curiosidad: 'Australia fue uno de los impulsores del sistema de certificación "Certified Australian EVOO" (CAEVO), el más estricto del mundo, que verifica el origen, la variedad y la composición química de cada botella. Fue creado como respuesta directa al escándalo mundial del fraude en aceites de oliva "extra virgen" italianos.',
  },
];

export default function GuiaAceiteOliva() {
  const [busqueda, setBusqueda] = useState('');
  const [pais, setPais] = useState<PaisOrigen | 'Todos'>('Todos');
  const [perfil, setPerfil] = useState<PerfilSabor | 'Todos'>('Todos');

  const variedadesFiltradas = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    return VARIEDADES.filter((v) => {
      const matchPais = pais === 'Todos' || v.pais === pais;
      const matchPerfil = perfil === 'Todos' || v.perfil === perfil;
      const matchBusqueda =
        !t ||
        v.nombre.toLowerCase().includes(t) ||
        v.regionesPrincipales.some((r) => r.toLowerCase().includes(t)) ||
        v.aromas.some((a) => a.toLowerCase().includes(t)) ||
        v.notasDeSabor.some((n) => n.toLowerCase().includes(t)) ||
        v.descripcion.toLowerCase().includes(t);
      return matchPais && matchPerfil && matchBusqueda;
    });
  }, [busqueda, pais, perfil]);

  function DotIndicador({ nivel, max = 3 }: { nivel: number; max?: number }) {
    return (
      <span className={styles.dots} aria-label={`${nivel} de ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={i < nivel ? styles.dotFilled : styles.dotEmpty}
          />
        ))}
      </span>
    );
  }

  function getPerfilClass(p: PerfilSabor): string {
    const map: Record<PerfilSabor, string> = {
      'Frutado verde intenso': styles.badgeVerdeIntenso,
      'Frutado verde suave': styles.badgeVerdeSuave,
      'Frutado maduro': styles.badgeMaduro,
      'Dulce': styles.badgeDulce,
      'Picante intenso': styles.badgePicante,
      'Amargo equilibrado': styles.badgeAmargo,
    };
    return map[p];
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía del Aceite de Oliva</h1>
        <p>32 variedades del mundo: perfil, aromas, notas, acidez y usos ideales</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── CONTROLES ──────────────────────────────────────────── */}
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar por nombre, región, aroma o nota de sabor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar variedad de aceite"
          />
          <div className={styles.filtrosRow}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>País:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por país">
                <button
                  type="button"
                  className={`${styles.filtroBtn} ${pais === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setPais('Todos')}
                  aria-pressed={pais === 'Todos'}
                >Todos</button>
                {PAISES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.filtroBtn} ${pais === p ? styles.filtroActivo : ''}`}
                    onClick={() => setPais(p)}
                    aria-pressed={pais === p}
                  ><span aria-hidden="true">{BANDERA[p]}</span> {p}</button>
                ))}
              </div>
            </div>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Perfil:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por perfil de sabor">
                <button
                  type="button"
                  className={`${styles.filtroBtn} ${perfil === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setPerfil('Todos')}
                  aria-pressed={perfil === 'Todos'}
                >Todos</button>
                {PERFILES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.filtroBtn} ${perfil === p ? styles.filtroActivo : ''}`}
                    onClick={() => setPerfil(p)}
                    aria-pressed={perfil === p}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.contador} aria-live="polite">
            {variedadesFiltradas.length} {variedadesFiltradas.length === 1 ? 'variedad' : 'variedades'}
          </p>
        </div>

        {/* ── GRID ───────────────────────────────────────────────── */}
        <div className={styles.grid}>
          {variedadesFiltradas.map((v) => (
            <article key={`${v.nombre}-${v.pais}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.perfilBadge} ${getPerfilClass(v.perfil)}`}>
                  {v.perfil}
                </span>
                <span className={styles.paisBadge}>
                  <span aria-hidden="true">{BANDERA[v.pais]}</span> {v.pais}
                </span>
              </div>

              <div className={styles.cardTitulo}>
                <h2 className={styles.nombre}>{v.nombre}</h2>
                {v.nombreLocal !== v.nombre && (
                  <span className={styles.nombreLocal}>{v.nombreLocal}</span>
                )}
                <span className={styles.regiones}>{v.regionesPrincipales.join(' · ')}</span>
              </div>

              <div className={styles.colorPill}>
                <span aria-hidden="true">🫒</span> {v.colorAceite}
              </div>

              <p className={styles.descripcion}>{v.descripcion}</p>

              <div className={styles.aromasSection}>
                <span className={styles.sectionLabel}>Aromas</span>
                <div className={styles.aromaTags}>
                  {v.aromas.map((a) => (
                    <span key={a} className={styles.aromaTag}>{a}</span>
                  ))}
                </div>
              </div>

              <div className={styles.notasSection}>
                <span className={styles.sectionLabel}>Notas en boca</span>
                <div className={styles.notasTags}>
                  {v.notasDeSabor.map((n) => (
                    <span key={n} className={styles.notaTag}>{n}</span>
                  ))}
                </div>
              </div>

              <div className={styles.indicadoresGrid}>
                <div className={styles.indicador}>
                  <span className={styles.indicadorLabel}>Intensidad</span>
                  <DotIndicador nivel={INTENSIDAD_NIVEL[v.intensidad]} />
                  <span className={styles.indicadorValor}>{v.intensidad}</span>
                </div>
                <div className={styles.indicador}>
                  <span className={styles.indicadorLabel}>Acidez máx.</span>
                  <span className={styles.acidezPill}>{v.acidezMaxima}</span>
                </div>
              </div>

              <div className={styles.retrogusto}>
                <span className={styles.sectionLabel}>Picor y amargor</span>
                <p className={styles.retrogustoText}>{v.picorAmargura}</p>
              </div>

              <div className={styles.metaRow}>
                <div>
                  <span className={styles.sectionLabel}>Cosecha</span>
                  <span className={styles.cosecha}><span aria-hidden="true">🗓️</span> {v.cosecha}</span>
                </div>
              </div>

              <div className={styles.usoSection}>
                <span className={styles.sectionLabel}>Uso ideal</span>
                <div className={styles.usoTags}>
                  {v.usoIdeal.map((u) => (
                    <span key={u} className={styles.usoTag}>{u}</span>
                  ))}
                </div>
              </div>

              {v.denominaciones.length > 0 && (
                <div className={styles.denominacionesSection}>
                  <span className={styles.sectionLabel}>Denominaciones</span>
                  <div className={styles.denominacionTags}>
                    {v.denominaciones.map((d) => (
                      <span key={d} className={styles.denominacionTag}>{d}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.curiosidadBox}>
                <span className={styles.curiosidadIcon} aria-hidden="true">🫒</span>
                <p className={styles.curiosidadText}>{v.curiosidad}</p>
              </div>
            </article>
          ))}
          {variedadesFiltradas.length === 0 && (
            <p className={styles.sinResultados}>No se encontraron variedades con esos criterios.</p>
          )}
        </div>
      </main>

      <EducationalSection
        title="El aceite de oliva: historia, producción y gastronomía"
        subtitle="De los olivos milenarios a la DOP: por qué el AOVE es oro líquido"
      >
        <p>
          El aceite de oliva virgen extra (AOVE) es uno de los alimentos más estudiados y
          celebrados de la cultura mediterránea. Desde los olivares milenarios de Grecia y España
          hasta los modernos superintensivos de California y Australia, el aceite de oliva ha
          acompañado al ser humano durante más de 6.000 años como alimento, medicina, cosmético
          y moneda de cambio. Hoy, la ciencia confirma lo que la tradición siempre supo: el AOVE
          de calidad es un superalimento cuyo valor va mucho más allá de su función culinaria.
        </p>
        <p>
          No todos los aceites de oliva son iguales. El mercado ofrece cuatro categorías legales
          con diferencias enormes en calidad, proceso y precio. Entender estas categorías es el
          primer paso para comprar con criterio y dejar de pagar precio de AOVE por aceite refinado.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption>Categorías de aceite de oliva: comparativa oficial</caption>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Acidez máxima</th>
                <th>Proceso</th>
                <th>Polifenoles</th>
                <th>Usos recomendados</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>AOVE (Virgen Extra)</strong></td>
                <td>&lt;0,8°</td>
                <td>Extracción mecánica en frío (&lt;27°C)</td>
                <td>Alto (150–800 mg/kg)</td>
                <td>Crudo, fritura, todo uso</td>
              </tr>
              <tr>
                <td><strong>Aceite de Oliva Virgen</strong></td>
                <td>&lt;2°</td>
                <td>Extracción mecánica (sin refinar)</td>
                <td>Medio (50–150 mg/kg)</td>
                <td>Cocción, frituras suaves</td>
              </tr>
              <tr>
                <td><strong>Aceite de Oliva</strong></td>
                <td>&lt;1°</td>
                <td>Mezcla de refinado + virgen</td>
                <td>Bajo (15–50 mg/kg)</td>
                <td>Frituras, cocción a alta temperatura</td>
              </tr>
              <tr>
                <td><strong>Aceite de Orujo</strong></td>
                <td>&lt;1°</td>
                <td>Solvente químico + refinado</td>
                <td>Muy bajo (&lt;15 mg/kg)</td>
                <td>Fritura industrial, conservas</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>¿Para qué perfil es cada aceite?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🍞</span> Pan con aceite: el desayuno mediterráneo</strong>
            <p>
              Un AOVE frutado verde intenso (Picual, Koroneiki, Coratina) sobre tostada con sal
              es el desayuno más polifenólico posible. El picor en garganta es señal de oleocantal,
              un compuesto con propiedades antiinflamatorias estudiadas in vitro, aunque su efecto
              a las dosis dietéticas habituales no es comparable al de un fármaco.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🍳</span> Cocinero / fritura</strong>
            <p>
              Para fritura de alta temperatura, elige un AOVE rico en ácido oleico y polifenoles:
              Picual o Cornicabra. Aguantan hasta 180°C sin degradarse ni generar aldehídos.
              El aceite de girasol, contrariamente a la creencia popular, es peor para fritura
              que un buen AOVE.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🎂</span> Repostería: bizcochos y dulces</strong>
            <p>
              Arbequina, Empeltre o Taggiasca en bizcochos, muffins y tarta de aceite. El perfil
              dulce de almendra y fruta madura complementa perfectamente los sabores de la
              repostería sin competir con el azúcar ni el chocolate.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🧀</span> Maridaje con queso y jamón ibérico</strong>
            <p>
              Sobre queso manchego curado o jamón ibérico de bellota, un AOVE Picual o Cornicabra
              en cosecha temprana crea una sinergia perfecta: la grasa del ibérico y los
              polifenoles del aceite se potencian mutuamente, limpian el paladar y prolongan
              el retrogusto.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia real hay entre AOVE y aceite de oliva virgen?</strong>
            <p>
              La acidez máxima (0,8° vs 2°) es el criterio oficial, pero la diferencia real
              está en los polifenoles y el proceso. El AOVE se extrae en frío (&lt;27°C), lo que
              conserva los antioxidantes, los aromas y el sabor del fruto. El virgen puede
              procesarse a mayor temperatura, perdiendo complejidad. Un AOVE bien conservado
              tiene hasta 10 veces más polifenoles que un aceite de oliva refinado.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿La acidez alta significa que sabe ácido?</strong>
            <p>
              No. La acidez del aceite de oliva es química (hidrólisis de triglicéridos), no
              organoléptica. No tiene nada que ver con el sabor ácido que percibimos en el
              limón o el vinagre. Un aceite de 2° de acidez puede saber más suave que uno de
              0,2°. La acidez mide daño estructural en la grasa, no sabor.
            </p>
            <span className={styles.faqTip}>
              <span aria-hidden="true">💡</span> El sabor amargo y el picor son indicadores reales de calidad: más polifenoles
              = más amargo/picante = más saludable.
            </span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Filtrado o sin filtrar? ¿Cuál es mejor?</strong>
            <p>
              El aceite sin filtrar ("turbio" o "en rama") conserva micropartículas de fruto
              que intensifican el sabor y los aromas en las primeras semanas. Sin embargo,
              fermenta más rápido: caduca en 3-6 meses frente a los 12-18 del filtrado.
              Para consumo inmediato el sin filtrar es superior; para guardarlo, mejor filtrado.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo conservar el aceite de oliva correctamente?</strong>
            <p>
              El aceite tiene cuatro enemigos: la luz, el calor, el oxígeno y el tiempo.
              Guárdalo en botella oscura (vidrio o lata), en lugar fresco y alejado del fogón.
              Nunca en plástico transparente ni en la encimera junto al horno. Temperatura ideal:
              15-20°C. Una vez abierto, consumir en 2-3 meses para apreciar sus mejores cualidades.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Se puede freír con AOVE?</strong>
            <p>
              Sí, y es preferible. El AOVE tiene un punto de humo de 190-220°C, superior a
              muchos aceites de semillas. Su alto contenido en ácido oleico (monoinsaturado)
              y polifenoles lo hace muy estable al calor. Estudios del CSIC y otros centros han
              observado que el AOVE genera menos compuestos polares en fritura prolongada que el
              girasol refinado, manteniendo mejor su perfil graso.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo catar un aceite de oliva en casa?</strong>
            <p>
              Vierte 20 ml en un vaso de cata (o cualquier vaso pequeño opaco si no tienes).
              Calienta en la palma 30 segundos. Huele profundamente e identifica notas: ¿hierba?,
              ¿almendra?, ¿tomate?, ¿fruta madura? Sorbe ruidosamente para oxigenar el aceite.
              Evalúa en boca: amargor, picor (cuántos "toses"), dulzor. El picor en garganta
              es la firma de los mejores AOVE.
            </p>
            <span className={styles.faqTip}>
              <span aria-hidden="true">🫒</span> Los catadores profesionales puntúan el aceite por fruitiness, bitterness y pungency
              (frutosidad, amargor y picor). Los tres deben estar equilibrados en un buen AOVE.
            </span>
          </li>
        </ul>

        <h3>Guía de cata paso a paso</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>La copa (o vaso de cata)</strong>
              <p>
                El estándar internacional es la copa oficial del COI (Consejo Oleícola Internacional):
                cristal azul oscuro que oculta el color del aceite para no condicionar la cata.
                En casa, un vasito de chupito con la mano encima para calentar funciona igual.
                Temperatura ideal del aceite: 28°C.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Temperatura</strong>
              <p>
                Calienta el vaso con 20 ml de aceite entre las palmas de las manos durante
                30 segundos. El calor libera los compuestos volátiles aromáticos. Un aceite
                frío da mucha menos información olfativa que uno a 28°C. Este paso es crítico
                y frecuentemente omitido.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Color (visual, informativo)</strong>
              <p>
                El color va del verde intenso (cosecha temprana, verde, polifenoles altos)
                al amarillo dorado (cosecha tardía, maduro, más dulce). No indica calidad por
                sí solo: un aceite amarillo puede ser excelente y uno verde puede tener defectos.
                El color es diagnóstico, no evaluativo.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Olfato: el primer juicio real</strong>
              <p>
                Destapa el vaso y huele lentamente durante 5-10 segundos. Identifica el atributo
                principal: ¿hierba?, ¿almendra?, ¿manzana?, ¿alcachofa?, ¿tomate?. Luego busca
                defectos: ¿rancio? (aceitunas oxidadas), ¿vinagre? (fermentación), ¿tierra?
                (aceitunas con barro). Los defectos descalifican automáticamente el AOVE.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Boca: el veredicto final</strong>
              <p>
                Sorbe el aceite ruidosamente (el sonido oxigena y potencia los aromas).
                Evalúa: dulzor inicial, amargor en los laterales de la lengua, frutosidad
                en las papilas, y picor en la garganta al tragar (0 toses = sin picor,
                1 tos = picor suave, 2+ toses = picor intenso). Cuenta mentalmente los
                segundos que duran las sensaciones: la persistencia es señal de calidad.
              </p>
            </div>
          </li>
        </ol>

        <h3>Consejos de compra y conservación</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>
              Busca la fecha de cosecha, no solo la de caducidad. Un aceite con caducidad
              en 2026 puede haberse envasado con aceite de 2023. Frescos de cosecha actual
              (Sept–Feb en el hemisferio norte) están en su mejor momento los primeros
              6 meses post-extracción.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🫙</span>
            <p>
              Guarda en botella oscura o lata metálica, alejado de la luz y el calor. La
              encimera junto al fogón es el peor lugar posible. Una alacena fresca y oscura
              conserva las propiedades 3 veces más que la exposición directa a la luz solar.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏆</span>
            <p>
              Busca aceites con premios internacionales verificables (Terraolivo, NYIOOC,
              Los Angeles International) o con D.O.P. El sello "premio" en el envase debe
              tener el concurso y el año: sin esa información, no significa nada.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <p>
              No refrigeres el aceite de oliva. Por debajo de 8°C solidifica y pierde
              fluidez, aunque no se daña. La temperatura óptima de conservación es
              15-20°C. Si tienes lata grande, transvasa a botella pequeña oscura para
              uso diario y cierra herméticamente la lata grande.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
            <p>
              Lee la etiqueta: un AOVE de calidad indica variedad de aceituna, zona de
              producción, año de cosecha y proceso de extracción en frío. Una etiqueta
              que solo pone "aceite de oliva virgen extra 100% español" sin más datos
              no garantiza calidad ni trazabilidad.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al comprar y conservar aceite de oliva</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Guardar en envase plástico transparente:</strong> el plástico permite
              el paso de luz UV que degrada los polifenoles y oxida el aceite. Una botella
              de plástico transparente en la encimera destruye la calidad del AOVE en
              semanas.
            </li>
            <li>
              <strong>Confundir acidez química con sabor ácido:</strong> un aceite de 0,2°
              puede saber muy amargo e intenso. Un aceite de 1° puede saber suave y dulce.
              La acidez mide daño estructural en la grasa, no lo que percibes en el paladar.
            </li>
            <li>
              <strong>Pensar que el aceite "verde" es mejor que el "dorado":</strong> el
              color depende de la variedad y el momento de cosecha. Un Arbequina de cosecha
              tardía excelente es amarillo dorado. Un Picual verde puede tener defectos.
              El color es orientativo, no determinante de calidad.
            </li>
            <li>
              <strong>Calentar el AOVE hasta humear:</strong> el punto de humo del AOVE
              (190-220°C) no debe superarse. Si el aceite humea negro, se están generando
              aldehídos tóxicos. Cocina a fuego medio-alto, no al máximo, con AOVE.
            </li>
            <li>
              <strong>Confundir la fecha de caducidad con la cosecha:</strong> la caducidad
              legal es 2 años desde el envasado, pero el aceite puede llevar 1 año en depósito
              antes de envasarse. Busca siempre "cosecha" o "campaña" con el año concreto.
            </li>
            <li>
              <strong>Creer que "aceite de oliva" y "aceite de oliva virgen extra" son
              lo mismo:</strong> el aceite de oliva (sin "virgen") es una mezcla de aceite
              refinado con una pequeña parte de virgen para darle sabor. No tiene apenas
              polifenoles. El AOVE y el virgen son los únicos que conservan los beneficios
              reales del aceite de oliva.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-aceite-oliva')} />
      <ShareCard appName="guia-aceite-oliva" />
      <Footer appName="guia-aceite-oliva" />
    </div>
  );
}
