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
import styles from './GuiaCafe.module.css';

type Continente = 'América' | 'África' | 'Asia / Oceanía';
type Especie = 'Arábica' | 'Robusta' | 'Libérica';
type Acidez = 'Baja' | 'Media' | 'Alta' | 'Muy alta';
type Cuerpo = 'Ligero' | 'Medio' | 'Intenso' | 'Muy intenso';
type TabRef = 'especies' | 'procesado' | 'tueste';

interface OrigenCafe {
  nombre: string;
  pais: string;
  region: string;
  continente: Continente;
  especie: Especie;
  altitud: string;
  procesado: string[];
  notasDeSabor: string[];
  acidez: Acidez;
  cuerpo: Cuerpo;
  cosecha: string;
  preparacionIdeal: string[];
  descripcion: string;
  curiosidad: string;
}

const ACIDEZ_NIVEL: Record<Acidez, number> = { Baja: 1, Media: 2, Alta: 3, 'Muy alta': 4 };
const CUERPO_NIVEL: Record<Cuerpo, number> = { Ligero: 1, Medio: 2, Intenso: 3, 'Muy intenso': 4 };

const CONTINENTES: Continente[] = ['América', 'África', 'Asia / Oceanía'];

const ORIGENES: OrigenCafe[] = [
  // ── AMÉRICA ────────────────────────────────────────────────────────────────
  {
    nombre: 'Colombia Huila',
    pais: 'Colombia', region: 'Huila', continente: 'América', especie: 'Arábica',
    altitud: '1.600–2.100 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Caramelo', 'Maracuyá', 'Manzana verde', 'Panela'],
    acidez: 'Alta', cuerpo: 'Medio',
    cosecha: 'Oct–Feb',
    preparacionIdeal: ['V60', 'Chemex', 'Aeropress', 'Filtrado'],
    descripcion: 'El Huila es la región cafetera más premiada de Colombia y posiblemente del mundo. Su topografía volcánica, los ríos Magdalena y Suaza, y las brumas que suavizan la radiación solar crean condiciones únicas para una acidez brillante y complejidad frutal excepcional.',
    curiosidad: 'Huila produce más cafés ganadores de premios internacionales (Cup of Excellence) que cualquier otra región colombiana. En algunos años ha acumulado más del 30% del total mundial de puntuaciones perfectas.',
  },
  {
    nombre: 'Colombia Nariño',
    pais: 'Colombia', region: 'Nariño', continente: 'América', especie: 'Arábica',
    altitud: '1.800–2.300 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Cítrico', 'Durazno', 'Té negro', 'Maracuyá'],
    acidez: 'Muy alta', cuerpo: 'Ligero',
    cosecha: 'Mar–Jun',
    preparacionIdeal: ['V60', 'Chemex', 'Filtrado en frío'],
    descripcion: 'La cercanía al Ecuador y la altitud extrema crean en Nariño un microclima donde la maduración del grano se ralentiza semanas, concentrando azúcares y desarrollando una acidez vibrante y compleja. Es el origen colombiano con perfiles más parecidos al café etíope.',
    curiosidad: 'En Nariño se cultivan plantas de café a más de 2.200 msnm, una de las altitudes de cultivo más extremas del mundo. A esa altura el ciclo de maduración del grano se alarga hasta 4 meses más que en las zonas bajas.',
  },
  {
    nombre: 'Brasil Sul de Minas',
    pais: 'Brasil', region: 'Sul de Minas', continente: 'América', especie: 'Arábica',
    altitud: '800–1.200 msnm',
    procesado: ['Natural', 'Honey', 'Pulped Natural'],
    notasDeSabor: ['Chocolate con leche', 'Nuez', 'Caramelo', 'Avellana'],
    acidez: 'Baja', cuerpo: 'Intenso',
    cosecha: 'May–Sep',
    preparacionIdeal: ['Espresso', 'Moka', 'Cold brew', 'Filtrado'],
    descripcion: 'Sul de Minas es el corazón histórico del café brasileño de especialidad. Sus suaves colinas, el clima estacional bien definido y la tradición cafetera de siglos facilitan la producción de cafés de perfil clásico, chocolateado y equilibrado.',
    curiosidad: 'Brasil es el mayor productor y exportador de café del mundo de forma ininterrumpida desde 1840. Sul de Minas concentra la mayor densidad de haciendas de especialidad del país.',
  },
  {
    nombre: 'Brasil Cerrado Mineiro',
    pais: 'Brasil', region: 'Cerrado Mineiro', continente: 'América', especie: 'Arábica',
    altitud: '850–1.000 msnm',
    procesado: ['Natural', 'Honey'],
    notasDeSabor: ['Chocolate negro', 'Almendra', 'Melaza', 'Frutos secos'],
    acidez: 'Baja', cuerpo: 'Muy intenso',
    cosecha: 'May–Ago',
    preparacionIdeal: ['Espresso', 'Moka', 'Cold brew'],
    descripcion: 'El Cerrado Mineiro fue la primera región brasileña con Denominación de Origen. Su clima semiárido con lluvias concentradas en verano y estación seca bien marcada es ideal para el secado natural del grano, produciendo cafés de cuerpo excepcional.',
    curiosidad: 'Cerrado Mineiro fue la primera región cafetera de Brasil en obtener Indicación Geográfica Protegida, reconocida en 2005. Hoy su certificación es garantía de procedencia y calidad reconocida internacionalmente.',
  },
  {
    nombre: 'Guatemala Antigua',
    pais: 'Guatemala', region: 'Antigua', continente: 'América', especie: 'Arábica',
    altitud: '1.500–1.700 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Chocolate amargo', 'Especias', 'Cedro', 'Caramelo'],
    acidez: 'Media', cuerpo: 'Intenso',
    cosecha: 'Ene–Mar',
    preparacionIdeal: ['Espresso', 'Moka', 'Filtrado', 'French Press'],
    descripcion: 'Rodeada por tres volcanes activos (Agua, Fuego y Acatenango), Antigua produce uno de los cafés más famosos de Centroamérica. Las cenizas volcánicas enriquecen el suelo de una forma que ningún fertilizante puede replicar, dando un perfil especiado y profundo único.',
    curiosidad: 'Los cafetales de Antigua crecen en suelos formados por siglos de erupciones volcánicas superpuestas, con minerales traza que no aparecen en ningún otro suelo del mundo. La última erupción significativa del volcán de Fuego fue en 2018.',
  },
  {
    nombre: 'Guatemala Huehuetenango',
    pais: 'Guatemala', region: 'Huehuetenango', continente: 'América', especie: 'Arábica',
    altitud: '1.500–2.000 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Frambuesa', 'Melocotón', 'Vino tinto', 'Frutos del bosque'],
    acidez: 'Alta', cuerpo: 'Ligero',
    cosecha: 'Dic–Mar',
    preparacionIdeal: ['V60', 'Chemex', 'Aeropress', 'Filtrado'],
    descripcion: 'La región más alta y remota de Guatemala. Los vientos cálidos del norte (llamados "el norte") moderan las temperaturas extremas de la altitud, creando condiciones excepcionales para perfiles frutales y florales que hacen de Huehuetenango uno de los orígenes más buscados de Centroamérica.',
    curiosidad: 'Huehuetenango es una de las pocas regiones cafeteras centroamericanas que no necesita volcán activo para conseguir suelos de excepcional calidad. Sus características únicas se deben exclusivamente al microclima creado por la orografía y los vientos alisios.',
  },
  {
    nombre: 'Costa Rica Tarrazú',
    pais: 'Costa Rica', region: 'Tarrazú', continente: 'América', especie: 'Arábica',
    altitud: '1.200–1.900 msnm',
    procesado: ['Lavado', 'Honey'],
    notasDeSabor: ['Cítrico', 'Miel', 'Almendra', 'Durazno'],
    acidez: 'Alta', cuerpo: 'Medio',
    cosecha: 'Nov–Feb',
    preparacionIdeal: ['V60', 'Chemex', 'Filtrado'],
    descripcion: 'Tarrazú, en las montañas al sur de San José, es la región más reconocida de Costa Rica. El país fue pionero en calidad del café centroamericano y hoy sigue apostando por el método Honey (proceso semi-lavado), que da dulzor y complejidad únicos a sus granos.',
    curiosidad: 'Costa Rica fue el primer país del mundo en prohibir legalmente el cultivo de café Robusta, garantizando que todo el café nacional sea 100% Arábica de altura. Esta ley data de 1989.',
  },
  {
    nombre: 'Honduras Marcala',
    pais: 'Honduras', region: 'Marcala', continente: 'América', especie: 'Arábica',
    altitud: '1.200–1.600 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Caramelo', 'Frutos tropicales', 'Chocolate con leche', 'Mango'],
    acidez: 'Media', cuerpo: 'Medio',
    cosecha: 'Nov–Mar',
    preparacionIdeal: ['Filtrado', 'Espresso', 'Moka'],
    descripcion: 'Honduras es hoy el mayor exportador de café de Centroamérica, una transformación lograda en apenas dos décadas. Marcala, la primera región hondureña con Indicación Geográfica, destaca por sus cooperativas de pequeños productores que han elevado la calidad de forma colectiva.',
    curiosidad: 'Honduras pasó de ser un exportador marginal de café a convertirse en el número 1 de Centroamérica en menos de 20 años, desplazando a Guatemala y Costa Rica. En 2011 superó el millón de sacos exportados por primera vez.',
  },
  {
    nombre: 'México Chiapas',
    pais: 'México', region: 'Chiapas', continente: 'América', especie: 'Arábica',
    altitud: '1.000–1.700 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Chocolate', 'Avellana', 'Manzana', 'Miel'],
    acidez: 'Media', cuerpo: 'Medio',
    cosecha: 'Nov–Mar',
    preparacionIdeal: ['Filtrado', 'Espresso', 'Moka'],
    descripcion: 'Chiapas, en el extremo sur de México, produce el café mexicano más reconocido internacionalmente. La Sierra Madre y su densa neblina crean microclimas ideales. Gran parte del café chiapaneco es orgánico por tradición y producido por cooperativas indígenas.',
    curiosidad: 'México es el mayor productor mundial de café orgánico certificado. Una parte muy significativa de esa producción proviene de cooperativas tzeltzales y tzotiles de Chiapas, que llevan cultivando café bajo sombra desde hace más de 100 años.',
  },
  {
    nombre: 'Jamaica Blue Mountain',
    pais: 'Jamaica', region: 'Blue Mountains', continente: 'América', especie: 'Arábica',
    altitud: '1.500–2.250 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Floral suave', 'Herbáceo', 'Mantequilla', 'Nuez'],
    acidez: 'Baja', cuerpo: 'Medio',
    cosecha: 'Mar–Jun',
    preparacionIdeal: ['Filtrado', 'French Press', 'V60'],
    descripcion: 'Uno de los cafés más famosos y caros del mundo, protegido por una Denominación de Origen estricta. Se madura lentamente en las brumas de las Blue Mountains y se envasa en los tradicionales barriles de madera de 70 kg, una tradición de tres siglos.',
    curiosidad: 'Japón adquiere el 80% de toda la producción de Jamaica Blue Mountain, lo que lo convierte en uno de los productos gastronómicos más "secuestrados" por un solo país. Los japoneses comenzaron a comprarlo masivamente en los años 70 y nunca lo han soltado.',
  },
  {
    nombre: 'Panamá Boquete (Geisha)',
    pais: 'Panamá', region: 'Boquete, Chiriquí', continente: 'América', especie: 'Arábica',
    altitud: '1.600–2.000 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Jazmín', 'Bergamota', 'Mango', 'Frutos tropicales', 'Hibisco'],
    acidez: 'Alta', cuerpo: 'Ligero',
    cosecha: 'Ene–Mar',
    preparacionIdeal: ['V60', 'Chemex', 'Filtrado en frío'],
    descripcion: 'Boquete, bajo el volcán Barú, alberga la finca Hacienda La Esmeralda, que en 2004 presentó al mundo la variedad Geisha originaria de Etiopía. El Geisha panameño redefine cada año los récords de precio en subastas internacionales con notas florales sin parangón.',
    curiosidad: 'En 2021 un lote de Geisha de Boquete alcanzó 2.568 USD por libra (454 g) en subasta, batiendo el récord mundial de café más caro vendido en competición. Un kilo de este café equivale al sueldo anual de muchos trabajadores.',
  },
  {
    nombre: 'Perú Valle del Mantaro',
    pais: 'Perú', region: 'Junín / Puno', continente: 'América', especie: 'Arábica',
    altitud: '1.400–1.900 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Chocolate oscuro', 'Frutos rojos', 'Nuez', 'Tierra húmeda'],
    acidez: 'Media', cuerpo: 'Medio',
    cosecha: 'Abr–Sep',
    preparacionIdeal: ['Filtrado', 'Espresso', 'Moka'],
    descripcion: 'Perú es uno de los grandes productores de café orgánico, con miles de pequeños agricultores organizados en cooperativas certificadas que exportan a Europa y EE.UU. Sus regiones de Junín y Puno producen los cafés más apreciados del país.',
    curiosidad: 'El 90% del café peruano lo cultivan agricultores con menos de 3 hectáreas, muchos en comunidades andinas de difícil acceso donde los sacos salen a lomo de mula. Esta atomización explica por qué Perú tiene tanta diversidad de lotes pequeños de especialidad.',
  },
  {
    nombre: 'Bolivia Caranavi',
    pais: 'Bolivia', region: 'Caranavi, Yungas', continente: 'América', especie: 'Arábica',
    altitud: '1.200–1.800 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Chocolate', 'Vainilla', 'Durazno', 'Flor de naranja'],
    acidez: 'Media', cuerpo: 'Medio',
    cosecha: 'Jun–Oct',
    preparacionIdeal: ['Filtrado', 'V60', 'Aeropress'],
    descripcion: 'Bolivia produce uno de los cafés más desconocidos e infraestimados del mundo. La región de Caranavi, en los Yungas, ofrece condiciones ideales: altitud, suelos volcánicos y temperaturas moderadas. El principal obstáculo es la infraestructura de transporte desde estas zonas remotas.',
    curiosidad: 'Bolivia fue durante siglos uno de los principales productores de coca, y el café es hoy el cultivo de sustitución más exitoso promovido por los sucesivos gobiernos. Las cooperativas cocaleras reconvertidas producen hoy algunos de los mejores cafés de América del Sur.',
  },
  {
    nombre: 'Nicaragua Matagalpa',
    pais: 'Nicaragua', region: 'Matagalpa / Jinotega', continente: 'América', especie: 'Arábica',
    altitud: '900–1.500 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Chocolate con leche', 'Caramelo', 'Avellana', 'Fruta tropical'],
    acidez: 'Media', cuerpo: 'Medio',
    cosecha: 'Nov–Mar',
    preparacionIdeal: ['Filtrado', 'Espresso', 'Moka', 'French Press'],
    descripcion: 'Nicaragua es el mayor productor de café de Centroamérica por extensión cultivada. Las regiones de Matagalpa y Jinotega, en el norte del país, producen los mejores lotes del país: Arábica lavado de altura, perfil equilibrado, con chocolate suave y acidez amable, muy accesible para quienes buscan un café centroamericano de calidad sin perfiles extremos.',
    curiosidad: 'Nicaragua produce casi exclusivamente café bajo sombra de árboles nativos, una práctica que preserva la biodiversidad y que varias organizaciones internacionales certifican como "bird-friendly". Los cafetales nicaragüenses actúan como corredor de migración para más de 150 especies de aves migratorias norteamericanas, lo que los convierte en un activo ecológico único.',
  },
  {
    nombre: 'Ecuador Galápagos',
    pais: 'Ecuador', region: 'Islas Galápagos', continente: 'América', especie: 'Arábica',
    altitud: '300–600 msnm',
    procesado: ['Natural', 'Lavado'],
    notasDeSabor: ['Cítrico', 'Almendra', 'Chocolate con leche', 'Fruta tropical'],
    acidez: 'Media', cuerpo: 'Ligero',
    cosecha: 'Jun–Sep',
    preparacionIdeal: ['Filtrado', 'French Press', 'Espresso'],
    descripcion: 'El café de las Islas Galápagos crece en un ecosistema protegido por la UNESCO, sin pesticidas ni fertilizantes artificiales por ley. Los suelos volcánicos jóvenes y los microclimas únicos de cada isla compensan la baja altitud con una mineralidad difícil de encontrar en otros orígenes.',
    curiosidad: 'La normativa de la Reserva de la Biosfera de Galápagos prohíbe el uso de agroquímicos en toda la isla, haciendo que el 100% del café sea orgánico por decreto. Es posiblemente el único origen del mundo donde la ley garantiza la producción orgánica de forma absoluta.',
  },

  // ── ÁFRICA ─────────────────────────────────────────────────────────────────
  {
    nombre: 'Etiopía Yirgacheffe',
    pais: 'Etiopía', region: 'Yirgacheffe, Gedeo', continente: 'África', especie: 'Arábica',
    altitud: '1.750–2.200 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Jazmín', 'Bergamota', 'Limón', 'Melocotón', 'Té negro'],
    acidez: 'Muy alta', cuerpo: 'Ligero',
    cosecha: 'Oct–Dic',
    preparacionIdeal: ['V60', 'Chemex', 'Aeropress', 'Filtrado en frío'],
    descripcion: 'El origen más célebre de Etiopía y uno de los más reconocibles del mundo. Sus cafés lavados son sinónimo de complejidad aromática: jazmín, bergamota y notas de té que no aparecen en ningún otro origen del planeta. El estándar de referencia del café de especialidad.',
    curiosidad: 'Etiopía es la cuna del café. Según la leyenda, fue en estas tierras donde un pastor llamado Kaldi observó por primera vez a sus cabras excitadas tras comer las bayas de la planta de café, hacia el año 850 d.C. La planta crece todavía silvestre en los bosques etíopes.',
  },
  {
    nombre: 'Etiopía Sidama',
    pais: 'Etiopía', region: 'Sidama', continente: 'África', especie: 'Arábica',
    altitud: '1.400–2.200 msnm',
    procesado: ['Natural', 'Lavado'],
    notasDeSabor: ['Arándano', 'Frambuesa', 'Melocotón', 'Chocolate negro'],
    acidez: 'Alta', cuerpo: 'Medio',
    cosecha: 'Oct–Dic',
    preparacionIdeal: ['Filtrado', 'V60', 'Aeropress', 'Cold brew'],
    descripcion: 'Al norte de Yirgacheffe, Sidama produce cafés naturales muy apreciados por sus intensas notas frutales. El procesado natural en clima de altitud genera perfiles de arándano y frambuesa que han convertido al Sidama en uno de los favoritos de la tercera ola del café especialidad.',
    curiosidad: 'Sidama fue reconocida como estado regional de Etiopía en 2019, siendo el primero creado en el país en más de 20 años. El peso económico del café fue un factor clave en ese proceso político: el 60% de los ingresos de exportación de la región provienen del café.',
  },
  {
    nombre: 'Etiopía Harrar',
    pais: 'Etiopía', region: 'Harrar, Oromia Oriental', continente: 'África', especie: 'Arábica',
    altitud: '1.500–2.100 msnm',
    procesado: ['Natural (exclusivamente)'],
    notasDeSabor: ['Arándano seco', 'Vino tinto', 'Especias', 'Fruta de la pasión'],
    acidez: 'Alta', cuerpo: 'Intenso',
    cosecha: 'Nov–Ene',
    preparacionIdeal: ['French Press', 'Espresso', 'Moka', 'Filtrado'],
    descripcion: 'Harrar produce uno de los cafés naturales más antiguos y reconocibles del mundo. Su procesado natural en clima seco genera perfiles vínico-especiados únicos. Los granos irregulares y alargados (longberry) son reconocibles a simple vista. Un café divisivo: intenso y salvaje.',
    curiosidad: 'La ciudad de Harar (patrimonio de la UNESCO) lleva un mercado de café regulado desde el siglo XV. Allí todavía se comercia café de la misma forma que hace 500 años, con los mismos intermediarios tradicionales llamados "qercha".',
  },
  {
    nombre: 'Kenia Kirinyaga',
    pais: 'Kenia', region: 'Kirinyaga (Monte Kenia)', continente: 'África', especie: 'Arábica',
    altitud: '1.500–2.100 msnm',
    procesado: ['Lavado doble fermentación'],
    notasDeSabor: ['Grosella negra', 'Tomate', 'Lima', 'Guayaba', 'Miel'],
    acidez: 'Muy alta', cuerpo: 'Intenso',
    cosecha: 'Oct–Dic (principal), Jun–Ago (secundaria)',
    preparacionIdeal: ['V60', 'Chemex', 'Filtrado', 'Cold brew'],
    descripcion: 'El café keniano es posiblemente el más identificable del mundo por su acidez "jugosa" (juicy). El proceso de doble fermentación en agua desarrollado en Kenia genera una complejidad y vivacidad que muchos consideran la cima de lo que el café puede expresar.',
    curiosidad: 'Kenia clasifica sus cafés por tamaño de grano: AA (>17 mesh) es el grado más buscado. Esta clasificación no garantiza calidad per se, pero históricamente los granos más grandes concentran más azúcares. El sistema data de la época colonial británica (1930s).',
  },
  {
    nombre: 'Tanzania Kilimanjaro',
    pais: 'Tanzania', region: 'Kilimanjaro / Moshi', continente: 'África', especie: 'Arábica',
    altitud: '1.400–1.900 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Frutos negros', 'Chocolate amargo', 'Lima', 'Miel'],
    acidez: 'Alta', cuerpo: 'Medio',
    cosecha: 'Jul–Nov',
    preparacionIdeal: ['Filtrado', 'French Press', 'Espresso'],
    descripcion: 'A las faldas del Kilimanjaro, el pico más alto de África, crecen cafés de gran carácter. Tanzania comparte rasgos con el café keniano (latitud y suelos similares) pero con perfil más suave y menos agresivo en acidez. El "peaberry" tanzano tiene especial reputación entre coleccionistas.',
    curiosidad: 'El grano "peaberry" (caracolillo) es una mutación en la que el fruto produce un único grano redondo en lugar de dos planos. Supone el 5% de la cosecha. Los aficionados creen que concentra más sabor al absorber solo los nutrientes que normalmente van a dos granos.',
  },
  {
    nombre: 'Ruanda Kibuye',
    pais: 'Ruanda', region: 'Provincia del Sur / Kibuye', continente: 'África', especie: 'Arábica',
    altitud: '1.500–2.000 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Flor de naranja', 'Melocotón', 'Rooibos', 'Chocolate con leche'],
    acidez: 'Alta', cuerpo: 'Medio',
    cosecha: 'Mar–Jun',
    preparacionIdeal: ['V60', 'Filtrado', 'Aeropress'],
    descripcion: 'Ruanda ha protagonizado una de las transformaciones más sorprendentes del café de especialidad. Apoyada por organizaciones internacionales tras el genocidio de 1994, su industria cafetera se ha convertido en motor de desarrollo. Sus cafés lavados son elegantes, florales y consistentemente bien ejecutados.',
    curiosidad: 'El programa de reconstrucción post-genocidio de Ruanda incluyó el café especialidad como pilar económico. La cooperativa Musasa, fundada en 1999 por mujeres sobrevivientes, fue la primera en demostrar que el café ruandés podía competir en los mercados premium internacionales.',
  },
  {
    nombre: 'Uganda Bugisu',
    pais: 'Uganda', region: 'Bugisu, Monte Elgón', continente: 'África', especie: 'Arábica',
    altitud: '1.500–2.300 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Melaza', 'Ciruela', 'Chocolate oscuro', 'Tabaco suave'],
    acidez: 'Media', cuerpo: 'Intenso',
    cosecha: 'Oct–Feb',
    preparacionIdeal: ['Espresso', 'French Press', 'Moka'],
    descripcion: 'Las faldas del Monte Elgón, compartido con Kenia, albergan una de las caficulturas más antiguas de África Oriental. El "Wugar" de Bugisu, cultivado por la comunidad Bamasaba, tiene perfiles más terrosos y de mayor cuerpo que los kenianos, muy buscados por baristas que quieren salirse del estándar.',
    curiosidad: 'Uganda fue el primer país del África subsahariana en producir café de forma comercial (siglo XIX), antes que muchos países americanos. Sin embargo, durante décadas fue poco conocido porque gran parte de su producción se mezclaba anónimamente con otras procedencias.',
  },
  {
    nombre: 'Burundi Kayanza',
    pais: 'Burundi', region: 'Kayanza', continente: 'África', especie: 'Arábica',
    altitud: '1.700–2.000 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Frambuesa', 'Limón', 'Chocolate negro', 'Té negro'],
    acidez: 'Muy alta', cuerpo: 'Ligero',
    cosecha: 'Abr–Jul',
    preparacionIdeal: ['V60', 'Chemex', 'Cold brew', 'Aeropress'],
    descripcion: 'Burundi, uno de los países más pequeños y densamente poblados de África, tiene el café como principal exportación. Kayanza produce cafés de una acidez vibrante comparable a los mejores de Ruanda y Etiopía. Las "stations de lavage" son el centro de control de calidad del país.',
    curiosidad: 'Más del 90% de los hogares rurales de Burundi cultivan café como principal fuente de ingresos. El país entero depende del precio del café en los mercados internacionales, lo que convierte cada cosecha en un asunto de seguridad nacional.',
  },
  {
    nombre: 'Yemen Moka (Al-Makha)',
    pais: 'Yemen', region: 'Al-Makha / Mattari', continente: 'África', especie: 'Arábica',
    altitud: '1.500–2.500 msnm',
    procesado: ['Natural (secado en azoteas)'],
    notasDeSabor: ['Chocolate fino', 'Especias orientales', 'Vino tinto', 'Dátil', 'Tabaco dulce'],
    acidez: 'Alta', cuerpo: 'Intenso',
    cosecha: 'Nov–Feb',
    preparacionIdeal: ['Ibrik / Cezve', 'Moka', 'Espresso', 'Filtrado'],
    descripcion: 'Yemen es el origen histórico del café comercial. El puerto de Al-Makha (Moka) fue el hub mundial de distribución del café hacia Europa entre los siglos XV y XVII. Las variedades silvestres yemeníes, cultivadas con métodos centenarios, producen cafés únicos de perfil vínico-especiado imposibles de replicar.',
    curiosidad: 'El nombre "moka" o "mocha" para el sabor chocolate-café proviene directamente del puerto yemení de Al-Makha, desde donde se exportaba café mezclado con cacao etíope. El café yemení fue el único en el mercado mundial durante casi 200 años.',
  },
  {
    nombre: 'RDC Kivu Norte',
    pais: 'R. D. del Congo', region: 'Kivu Norte', continente: 'África', especie: 'Arábica',
    altitud: '1.400–2.000 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Ciruela', 'Cítrico', 'Chocolate con leche', 'Especias'],
    acidez: 'Alta', cuerpo: 'Medio',
    cosecha: 'Nov–Mar',
    preparacionIdeal: ['Filtrado', 'Espresso', 'Aeropress'],
    descripcion: 'El Kivu Norte, a orillas del lago del mismo nombre, produce un café que los especialistas consideran comparable a los mejores de Ruanda y Burundi. En condiciones de estabilidad, este origen podría ser uno de los más grandes del continente. Las cooperativas locales luchan contra la inestabilidad política para exportar calidad.',
    curiosidad: 'El lago Kivu, a orillas del cual crecen estos cafés, es uno de los pocos "lagos explosivos" del mundo: sus profundidades contienen enormes cantidades de gas metano y CO₂. Es la única fuente de energía de toda la región y un riesgo geológico permanente.',
  },
  {
    nombre: 'Malawi Misuku Hills',
    pais: 'Malawi', region: 'Misuku Hills, Karonga', continente: 'África', especie: 'Arábica',
    altitud: '1.500–2.000 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Melocotón', 'Floral', 'Chocolate blanco', 'Avellana'],
    acidez: 'Alta', cuerpo: 'Ligero',
    cosecha: 'Jun–Oct',
    preparacionIdeal: ['V60', 'Filtrado', 'Aeropress'],
    descripcion: 'Las colinas Misuku, en el norte de Malawi, albergan cafés de especialidad poco conocidos fuera de los circuitos especializados. El Geisha y el Bourbon cultivados a gran altitud producen perfiles delicados y florales que cada vez atraen más atención de los compradores europeos y japoneses.',
    curiosidad: 'El café llegó a Malawi en 1878 traído por misioneros escoceses, y las primeras plantas vinieron directamente de Brasil. Es uno de los pocos países donde se puede trazar con exactitud el origen histórico y botánico de toda su caficultura hasta un único envío registrado.',
  },
  {
    nombre: 'Zimbabue Chipinge',
    pais: 'Zimbabue', region: 'Chipinge, Monte Nyanga', continente: 'África', especie: 'Arábica',
    altitud: '1.100–1.800 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Chocolate negro', 'Nuez', 'Miel', 'Cereza'],
    acidez: 'Media', cuerpo: 'Intenso',
    cosecha: 'Jun–Sep',
    preparacionIdeal: ['Espresso', 'Filtrado', 'French Press'],
    descripcion: 'A pesar de las dificultades económicas y políticas del país, pequeñas granjas y cooperativas de Chipinge han mantenido viva una tradición cafetera de más de un siglo. Sus cafés de cuerpo generoso y perfil clásico consiguen reconocimiento creciente en mercados de especialidad europeos.',
    curiosidad: 'El café zimbabuense fue considerado entre los mejores de África durante el período colonial británico, con haciendas que exportaban directamente a Londres. La crisis económica de los años 2000 destruyó casi toda la industria. Su recuperación actual es una de las historias más esperanzadoras del café africano.',
  },
  {
    nombre: 'Camerún Monte Camerún',
    pais: 'Camerún', region: 'Monte Camerún, Boyo', continente: 'África', especie: 'Arábica',
    altitud: '800–1.600 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Tierra', 'Cacao', 'Chocolate amargo', 'Frutos negros'],
    acidez: 'Media', cuerpo: 'Muy intenso',
    cosecha: 'Oct–Feb',
    preparacionIdeal: ['Espresso', 'Moka', 'French Press'],
    descripcion: 'Las laderas del volcán Monte Camerún, activo y con suelos extraordinariamente ricos, producen el Arábica de mayor reconocimiento del país. El perfil terroso e intenso lleva el sello mineral de la lava volcánica joven de una forma muy pronunciada.',
    curiosidad: 'El Monte Camerún es uno de los volcanes más activos de África Occidental, con erupciones en 1982, 1999, 2000 y 2012. Sus lavas recientes crean suelos de fertilidad extraordinaria que hacen innecesarios los fertilizantes sintéticos en la mayoría de los cafetales.',
  },
  {
    nombre: 'Costa de Marfil',
    pais: 'Costa de Marfil', region: 'Zona central y oeste', continente: 'África', especie: 'Robusta',
    altitud: '200–600 msnm',
    procesado: ['Natural', 'Lavado'],
    notasDeSabor: ['Cacao intenso', 'Tierra', 'Madera', 'Especias fuertes'],
    acidez: 'Baja', cuerpo: 'Muy intenso',
    cosecha: 'Oct–Feb',
    preparacionIdeal: ['Espresso (mezclas)', 'Moka', 'Café de puchero'],
    descripcion: 'Costa de Marfil fue el segundo mayor productor mundial hasta los años 90 y sigue siendo el mayor productor africano de Robusta. Sus granos son la base de las mezclas de espresso italianas y francesas que buscan potencia, cafeína y crema espesa. Un café diseñado para mezclar, no para brillar solo.',
    curiosidad: 'Italia importa el Robusta de Costa de Marfil desde el siglo XIX para sus mezclas de espresso. El Robusta tiene el doble de cafeína que el Arábica, más crema (cuerpo graso) en espresso y es mucho más resistente a la roya y otras plagas.',
  },

  // ── ASIA / OCEANÍA ──────────────────────────────────────────────────────────
  {
    nombre: 'Indonesia Sumatra Mandheling',
    pais: 'Indonesia', region: 'Sumatra del Norte', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '1.000–1.500 msnm',
    procesado: ['Wet-hulled (Giling Basah)'],
    notasDeSabor: ['Tierra húmeda', 'Cedro', 'Cacao', 'Especias', 'Hongos silvestres'],
    acidez: 'Baja', cuerpo: 'Muy intenso',
    cosecha: 'Sep–Dic',
    preparacionIdeal: ['French Press', 'Moka', 'Espresso', 'Cold brew'],
    descripcion: 'El Mandheling de Sumatra tiene uno de los perfiles más reconocibles del mundo. El proceso único "Giling Basah" (wet-hulled) deja los granos con alta humedad residual, creando un perfil terroso, especiado e intenso que ningún otro origen puede imitar. O lo amas o lo odias: no hay término medio.',
    curiosidad: 'El famoso Kopi Luwak, el café más caro del mundo (procesado en el sistema digestivo de la civeta asiática), proviene principalmente de Sumatra. Hoy es una práctica ampliamente cuestionada por razones de bienestar animal. Las versiones "silvestres" son imposibles de verificar.',
  },
  {
    nombre: 'Indonesia Java',
    pais: 'Indonesia', region: 'Java Oriental', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '1.400–1.800 msnm',
    procesado: ['Lavado'],
    notasDeSabor: ['Especias', 'Chocolate', 'Tierra', 'Pimienta suave'],
    acidez: 'Baja', cuerpo: 'Intenso',
    cosecha: 'Jul–Oct',
    preparacionIdeal: ['Espresso', 'Moka', 'French Press'],
    descripcion: 'Java fue el primer origen de café fuera de Yemen y Etiopía. Los holandeses establecieron las primeras plantaciones en 1696, dando origen al comercio internacional del café tal como lo conocemos. Sus cafés lavados tienen perfil intenso y terroso, más limpio que Sumatra pero igualmente contundente.',
    curiosidad: 'La expresión inglesa "a cup of java" (una taza de café) proviene de la enorme popularidad del café de Java entre los marineros americanos del siglo XIX. "Java" fue durante casi 200 años sinónimo absoluto de café en el mundo anglosajón.',
  },
  {
    nombre: 'Indonesia Bali Kintamani',
    pais: 'Indonesia', region: 'Kintamani, Batur', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '1.200–1.700 msnm',
    procesado: ['Lavado (wet process)'],
    notasDeSabor: ['Limón', 'Frutos tropicales', 'Jengibre', 'Chocolate blanco'],
    acidez: 'Alta', cuerpo: 'Ligero',
    cosecha: 'Jun–Sep',
    preparacionIdeal: ['V60', 'Filtrado', 'Aeropress'],
    descripcion: 'A diferencia de Sumatra y Java, el café de las tierras altas del volcán Batur se procesa completamente lavado, dando un perfil limpio, brillante y cítrico que sorprende a quienes esperan un café indonesio terroso. Es el origen más joven de Indonesia en el mapa de especialidad.',
    curiosidad: 'El sistema de cultivo "Subak Abian" de Kintamani, una cooperativa agrícola organizada en torno al templo hinduista, ha sido declarado Patrimonio de la Humanidad por la UNESCO. El café se cultiva como parte de un sistema de gestión del agua sagrado de más de 1.000 años de antigüedad.',
  },
  {
    nombre: 'Vietnam Buon Ma Thuot',
    pais: 'Vietnam', region: 'Buon Ma Thuot, Tierras Altas', continente: 'Asia / Oceanía', especie: 'Robusta',
    altitud: '400–800 msnm',
    procesado: ['Natural (seco)'],
    notasDeSabor: ['Chocolate amargo', 'Tierra', 'Caucho', 'Pimienta', 'Nuez tostada'],
    acidez: 'Baja', cuerpo: 'Muy intenso',
    cosecha: 'Oct–Feb',
    preparacionIdeal: ['Phin (filtro vietnamita)', 'Espresso', 'Moka', 'Café con leche condensada'],
    descripcion: 'Vietnam es el segundo mayor productor de café del mundo y el mayor de Robusta. La región de Buon Ma Thuot es el corazón de esta producción. El café vietnamita se bebe muy cargado con leche condensada azucarada (Cà phê sữa đá), un contraste perfecto para la intensidad del Robusta.',
    curiosidad: 'Vietnam no tenía tradición cafetera antes de la colonización francesa (siglo XIX). En apenas 40 años desde la apertura de mercado en 1986, se convirtió en el 2.º exportador mundial, superando a Colombia y a toda Europa. Es la historia de expansión cafetera más rápida de la historia.',
  },
  {
    nombre: 'India Monsooned Malabar',
    pais: 'India', region: 'Costa Malabar, Kerala / Karnataka', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '500–1.000 msnm',
    procesado: ['Monzón (3-4 meses exposición al viento húmedo)'],
    notasDeSabor: ['Especias', 'Cuero', 'Cacao', 'Tabaco', 'Mantequilla'],
    acidez: 'Baja', cuerpo: 'Muy intenso',
    cosecha: 'Nov–Feb (+ meses de monzón)',
    preparacionIdeal: ['Espresso', 'Moka', 'Mezclas (muy usado en Italia)'],
    descripcion: 'Único en el mundo: granos de la costa Malabar se exponen durante meses a los vientos húmedos del monzón en almacenes abiertos. Absorben humedad, pierden acidez y desarrollan un perfil especiado, mantecoso e intenso sin precedentes. Un café que desafía todas las reglas del procesado convencional.',
    curiosidad: 'El perfil del Monsooned Malabar surgió por accidente: los sacos de café tardaban meses en llegar a Europa en velero, absorbiendo la humedad del océano. Cuando los barcos de vapor aceleraron el transporte, los europeos echaron de menos ese sabor y los indios empezaron a recrearlo artificialmente.',
  },
  {
    nombre: 'India Coorg (Karnataka)',
    pais: 'India', region: 'Coorg / Kodagu, Ghats Occidentales', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '800–1.500 msnm',
    procesado: ['Lavado', 'Honey'],
    notasDeSabor: ['Especias suaves', 'Nuez', 'Chocolate con leche', 'Floral ligero'],
    acidez: 'Media', cuerpo: 'Intenso',
    cosecha: 'Nov–Feb',
    preparacionIdeal: ['Filtrado', 'Espresso', 'Filter coffee (decocción india)'],
    descripcion: 'Coorg, en los Ghats Occidentales, es la región cafetera más famosa de India y uno de los ecosistemas de mayor biodiversidad del mundo. Cultivado bajo sombra de árboles de cardamomo, pimienta y canela endémicos, el café adquiere notas aromáticas únicas imposibles de separar del entorno.',
    curiosidad: 'El café de Coorg crece bajo sombra de árboles de pimienta, cardamomo y canela, lo que explica sus notas especiadas características. Esta agroforestería ancestral ha preservado además uno de los bosques más biodiversos del sur de Asia, con más de 300 especies de aves registradas.',
  },
  {
    nombre: 'Papua Nueva Guinea Wahgi Valley',
    pais: 'Papua Nueva Guinea', region: 'Valle del Wahgi, Highlands', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '1.500–1.800 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Frutos tropicales', 'Tierra', 'Hierbas silvestres', 'Especias'],
    acidez: 'Alta', cuerpo: 'Intenso',
    cosecha: 'Abr–Sep',
    preparacionIdeal: ['Filtrado', 'French Press', 'Espresso'],
    descripcion: 'Papua Nueva Guinea tiene uno de los perfiles cafeteros más salvajes e impredecibles del mundo, reflejo de su extraordinaria biodiversidad. El café PNG es descendiente del Arábica jamaicano (Blue Mountain) introducido en los años 1920 y cultivado hoy por millones de pequeños agricultores del interior montañoso.',
    curiosidad: 'El café de Papua Nueva Guinea desciende genéticamente del Blue Mountain de Jamaica, introducido por colonos australianos en la década de 1920. Pocos saben que estos dos orígenes tan distintos en perfil y precio comparten exactamente el mismo linaje botánico.',
  },
  {
    nombre: 'Hawái Kona',
    pais: 'EE.UU. (Hawái)', region: 'Kona, Big Island', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '300–900 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Nuez de macadamia', 'Miel', 'Chocolate blanco', 'Fruta tropical suave'],
    acidez: 'Media', cuerpo: 'Medio',
    cosecha: 'Ago–Ene',
    preparacionIdeal: ['Filtrado', 'V60', 'French Press'],
    descripcion: 'El único café producido comercialmente en territorio de EE.UU. Las tardes nubladas que moderan el sol tropical, los suelos volcánicos porosos del Mauna Loa y las noches frescas crean un microclima único. Uno de los cafés más caros del mercado por su limitada producción y alta demanda.',
    curiosidad: 'El "100% Kona" es uno de los productos más falsificados del mercado del café. La ley hawaiana permite etiquetar como "Kona Blend" mezclas con tan solo 10% de café Kona real. Siempre buscar el sello "100% Kona Coffee" con certificación de origen para garantizar la autenticidad.',
  },
  {
    nombre: 'Filipinas Benguet',
    pais: 'Filipinas', region: 'Benguet, Cordillera', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '1.000–1.500 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Chocolate oscuro', 'Especias', 'Tabaco suave', 'Frutos negros'],
    acidez: 'Media', cuerpo: 'Intenso',
    cosecha: 'Nov–Mar',
    preparacionIdeal: ['Filtrado', 'French Press', 'Moka'],
    descripcion: 'Filipinas tiene la distinción única de producir las cuatro especies de café reconocidas: Arábica (Benguet), Robusta (Cavite), Libérica (Barako de Batangas) y Excelsa. El Arábica de las montañas Cordillera ha mejorado notablemente en calidad en los últimos años.',
    curiosidad: 'Filipinas es el único país del mundo donde se cultivan y consumen comercialmente las cuatro especies de café: Arábica, Robusta, Libérica y Excelsa. El "Barako" (Libérica), casi extinguido, es una rareza mundial muy buscada. Su nombre proviene del término filipino para "toro salvaje".',
  },
  {
    nombre: 'Filipinas Barako',
    pais: 'Filipinas', region: 'Batangas / Cavite', continente: 'Asia / Oceanía', especie: 'Libérica',
    altitud: '100–400 msnm',
    procesado: ['Natural'],
    notasDeSabor: ['Floral intenso', 'Ahumado', 'Madera', 'Especias', 'Fruta exótica'],
    acidez: 'Baja', cuerpo: 'Muy intenso',
    cosecha: 'Oct–Mar',
    preparacionIdeal: ['Espresso', 'Moka', 'Café con leche condensada', 'Mezclas'],
    descripcion: 'El Barako es la variedad de Libérica más conocida del mundo y una rareza en vías de recuperación. Cultivado en las provincias de Batangas y Cavite, produce granos y frutos significativamente más grandes que el Arábica. Su perfil aromático es intenso, peculiar e inconfundible —floral, ahumado y especiado— de una forma que no se parece a ningún otro café del planeta.',
    curiosidad: 'El nombre "Barako" significa "toro salvaje" en tagalo. En los años 1880 Filipinas fue el cuarto mayor productor mundial de café, hasta que la plaga de roya de 1889 devastó casi toda la producción. El Barako sobrevivió porque la Libérica es más resistente a enfermedades, pero quedó reducido a unas pocas comunidades de Batangas que hoy lo revitalizan como producto de identidad nacional.',
  },
  {
    nombre: 'Timor Oriental Ermera',
    pais: 'Timor Oriental', region: 'Ermera', continente: 'Asia / Oceanía', especie: 'Arábica',
    altitud: '1.200–1.800 msnm',
    procesado: ['Lavado', 'Natural'],
    notasDeSabor: ['Tierra', 'Cacao', 'Especias', 'Frutos silvestres', 'Madera'],
    acidez: 'Media', cuerpo: 'Intenso',
    cosecha: 'Jun–Sep',
    preparacionIdeal: ['Filtrado', 'Espresso', 'French Press'],
    descripcion: 'Timor Oriental es uno de los secretos mejor guardados del café de especialidad. Sus cafés de altura, muchos semisalvajes, ofrecen perfiles complejos y terrosos. El café es la principal exportación del país y fuente de ingresos para el 25% de la población.',
    curiosidad: 'En Timor Oriental se descubrió el único híbrido natural conocido entre Arábica y Robusta, llamado "Timor Hybrid". Surgió de forma espontánea en los cafetales de la isla. Hoy es utilizado en programas de mejora genética en todo el mundo para dotar a nuevas variedades de resistencia a enfermedades.',
  },
];

export default function GuiaCafe() {
  const [busqueda, setBusqueda] = useState('');
  const [continente, setContinente] = useState<Continente | 'Todos'>('Todos');
  const [mostrarRef, setMostrarRef] = useState(false);
  const [tabRef, setTabRef] = useState<TabRef>('especies');

  const origenesFiltrados = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    return ORIGENES.filter((o) => {
      const matchContinente = continente === 'Todos' || o.continente === continente;
      const matchBusqueda =
        !t ||
        o.nombre.toLowerCase().includes(t) ||
        o.pais.toLowerCase().includes(t) ||
        o.region.toLowerCase().includes(t) ||
        o.notasDeSabor.some((n) => n.toLowerCase().includes(t)) ||
        o.descripcion.toLowerCase().includes(t);
      return matchContinente && matchBusqueda;
    });
  }, [busqueda, continente]);

  function DotIndicador({ nivel, max = 4 }: { nivel: number; max?: number }) {
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

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía del Café</h1>
        <p>40 orígenes del mundo: especie, altitud, notas de sabor y preparación ideal</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── GUÍA DE REFERENCIA ─────────────────────────────────── */}
        <div className={styles.refSection}>
          <button
            className={styles.refToggle}
            onClick={() => setMostrarRef((v) => !v)}
            aria-expanded={mostrarRef}
          >
            <span>📖 Guía de referencia: Especies · Procesado · Tueste</span>
            <span className={styles.refToggleIcon}>{mostrarRef ? '▲' : '▼'}</span>
          </button>

          {mostrarRef && (
            <div className={styles.refPanel}>
              <div className={styles.refTabs} role="tablist">
                {(['especies', 'procesado', 'tueste'] as TabRef[]).map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tabRef === t}
                    className={`${styles.refTab} ${tabRef === t ? styles.refTabActivo : ''}`}
                    onClick={() => setTabRef(t)}
                  >
                    {t === 'especies' ? '🌱 Especies' : t === 'procesado' ? '⚙️ Procesado' : '🌡️ Tueste'}
                  </button>
                ))}
              </div>

              {tabRef === 'especies' && (
                <div className={styles.refContent}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.refTable}>
                      <thead>
                        <tr>
                          <th>Característica</th>
                          <th>Arábica</th>
                          <th>Robusta</th>
                          <th>Libérica</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>Altitud típica</td><td>600–2.000 msnm</td><td>0–800 msnm</td><td>0–500 msnm</td></tr>
                        <tr><td>Cafeína</td><td>1,2–1,5 %</td><td>2,2–2,7 %</td><td>~1,5 %</td></tr>
                        <tr><td>Acidez</td><td>Media–Alta</td><td>Baja</td><td>Muy baja</td></tr>
                        <tr><td>Cuerpo</td><td>Ligero–Medio</td><td>Muy intenso</td><td>Intenso</td></tr>
                        <tr><td>Perfil de sabor</td><td>Complejo, frutal, floral</td><td>Amargo, terroso, cacao</td><td>Floral, ahumado, peculiar</td></tr>
                        <tr><td>% producción mundial</td><td>~60 %</td><td>~40 %</td><td>&lt;1 %</td></tr>
                        <tr><td>Resistencia a plagas</td><td>Baja</td><td>Alta</td><td>Alta</td></tr>
                        <tr><td>Países principales</td><td>Colombia, Etiopía, Brasil</td><td>Vietnam, Costa de Marfil</td><td>Filipinas, Liberia</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tabRef === 'procesado' && (
                <div className={styles.refContent}>
                  <div className={styles.procesadoGrid}>
                    <div className={styles.procesadoCard}>
                      <h4>💧 Lavado (Wet)</h4>
                      <p>Se retira toda la pulpa antes del secado en agua. Resultado: sabor limpio, acidez brillante, origen muy expresado. Preferido en Colombia, Centroamérica y Kenia.</p>
                    </div>
                    <div className={styles.procesadoCard}>
                      <h4>☀️ Natural (Dry / Sun-dried)</h4>
                      <p>El grano se seca con la pulpa intacta al sol. Resultado: sabor frutal, dulce, complejo, con notas vínicas. Típico de Etiopía, Yemen y Brasil.</p>
                    </div>
                    <div className={styles.procesadoCard}>
                      <h4>🍯 Honey / Semi-lavado</h4>
                      <p>Se retira la pulpa pero se conserva parte del mucílago. Resultado: equilibrio entre lavado y natural, con dulzor extra. Muy usado en Costa Rica y El Salvador.</p>
                    </div>
                    <div className={styles.procesadoCard}>
                      <h4>🌧️ Wet-hulled (Giling Basah)</h4>
                      <p>Método único indonesio: descascarado en húmedo con alta humedad residual. Resultado: terroso, bajo en acidez, cuerpo muy intenso. Solo en Sumatra y Sulawesi.</p>
                    </div>
                  </div>
                </div>
              )}

              {tabRef === 'tueste' && (
                <div className={styles.refContent}>
                  <div className={styles.tuesteGrid}>
                    <div className={`${styles.tuesteCard} ${styles.tuesteClaro}`}>
                      <h4>🟤 Claro (Light)</h4>
                      <p><strong>196–205°C</strong></p>
                      <p>Color canela. El origen brilla: floral, cítrico, ácido. Sin aceites en superficie. Favorito del café de especialidad de tercera ola.</p>
                    </div>
                    <div className={`${styles.tuesteCard} ${styles.tuesteMedio}`}>
                      <h4>🟫 Medio (Medium)</h4>
                      <p><strong>210–219°C</strong></p>
                      <p>Color avellana. Equilibrio entre acidez y dulzor. Caramelo, chocolate con leche. El más versátil para cualquier método.</p>
                    </div>
                    <div className={`${styles.tuesteCard} ${styles.tuesteOscuro}`}>
                      <h4>⬛ Oscuro (Dark)</h4>
                      <p><strong>235–245°C</strong></p>
                      <p>Color negro-marrón. Aceites en superficie. Amargo intenso, ahumado, chocolate negro. El origen desaparece. Base del espresso tradicional italiano.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CONTROLES ──────────────────────────────────────────── */}
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar por país, región o nota de sabor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar café"
          />
          <div className={styles.filtrosRow}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Continente:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por continente">
                <button
                  className={`${styles.filtroBtn} ${continente === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setContinente('Todos')}
                >Todos</button>
                {CONTINENTES.map((c) => (
                  <button
                    key={c}
                    className={`${styles.filtroBtn} ${continente === c ? styles.filtroActivo : ''}`}
                    onClick={() => setContinente(c)}
                  >{c}</button>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.contador} aria-live="polite">
            {origenesFiltrados.length} {origenesFiltrados.length === 1 ? 'origen' : 'orígenes'}
          </p>
        </div>

        {/* ── GRID ───────────────────────────────────────────────── */}
        <div className={styles.grid}>
          {origenesFiltrados.map((o) => (
            <article key={o.nombre} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.continenteBadge} ${o.continente === 'América' ? styles.badgeAmerica : o.continente === 'África' ? styles.badgeAfrica : styles.badgeAsia}`}>
                  {o.continente === 'América' ? '🌎' : o.continente === 'África' ? '🌍' : '🌏'} {o.continente}
                </span>
                <span className={`${styles.especieBadge} ${o.especie === 'Arábica' ? styles.badgeArabica : o.especie === 'Robusta' ? styles.badgeRobusta : styles.badgeLibeica}`}>
                  {o.especie}
                </span>
              </div>

              <div className={styles.cardTitulo}>
                <h2 className={styles.nombre}>{o.nombre}</h2>
                <span className={styles.paisRegion}>{o.pais} · {o.region}</span>
              </div>

              <span className={styles.altitudPill}>⛰️ {o.altitud}</span>

              <p className={styles.descripcion}>{o.descripcion}</p>

              <div className={styles.notasSection}>
                <span className={styles.sectionLabel}>Notas de sabor</span>
                <div className={styles.notasTags}>
                  {o.notasDeSabor.map((n) => (
                    <span key={n} className={styles.notaTag}>{n}</span>
                  ))}
                </div>
              </div>

              <div className={styles.indicadoresGrid}>
                <div className={styles.indicador}>
                  <span className={styles.indicadorLabel}>Acidez</span>
                  <DotIndicador nivel={ACIDEZ_NIVEL[o.acidez]} />
                  <span className={styles.indicadorValor}>{o.acidez}</span>
                </div>
                <div className={styles.indicador}>
                  <span className={styles.indicadorLabel}>Cuerpo</span>
                  <DotIndicador nivel={CUERPO_NIVEL[o.cuerpo]} />
                  <span className={styles.indicadorValor}>{o.cuerpo}</span>
                </div>
              </div>

              <div className={styles.metaRow}>
                <div>
                  <span className={styles.sectionLabel}>Procesado</span>
                  <div className={styles.procesadoTags}>
                    {o.procesado.map((p) => (
                      <span key={p} className={styles.procesadoTag}>{p}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className={styles.sectionLabel}>Cosecha</span>
                  <span className={styles.cosecha}>🗓️ {o.cosecha}</span>
                </div>
              </div>

              <div>
                <span className={styles.sectionLabel}>Preparación ideal</span>
                <div className={styles.prepTags}>
                  {o.preparacionIdeal.map((p) => (
                    <span key={p} className={styles.prepTag}>{p}</span>
                  ))}
                </div>
              </div>

              <div className={styles.curiosidadBox}>
                <span className={styles.curiosidadIcon} aria-hidden="true">☕</span>
                <p className={styles.curiosidadText}>{o.curiosidad}</p>
              </div>
            </article>
          ))}
          {origenesFiltrados.length === 0 && (
            <p className={styles.sinResultados}>No se encontraron orígenes con esos criterios.</p>
          )}
        </div>
      </main>

      <EducationalSection
        title="El mundo del café: historia, ciencia y cultura"
        subtitle="Del árbol a la taza: todo lo que hay detrás de cada sorbo"
      >
        <p>
          El café es la segunda bebida más consumida del mundo tras el agua y el segundo producto
          más comercializado del planeta tras el petróleo. Detrás de cada taza hay una cadena que
          empieza en alturas de 2.000 metros, en suelos volcánicos de Etiopía o Colombia, y termina
          en una taza preparada con precisión milimétrica. Entender ese camino transforma por
          completo la experiencia de beber café.
        </p>
        <p>
          El café de especialidad —cafés con puntuación superior a 80 puntos según los protocolos de
          la Specialty Coffee Association— representa hoy el 12% del mercado mundial y crece a doble
          dígito anual. Su auge ha redescubierto orígenes olvidados, revitalizado economías rurales
          y creado una cultura del café comparable en sofisticación al vino o al whisky de malta.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption>Comparativa rápida: orígenes más populares</caption>
            <thead>
              <tr>
                <th>Origen</th>
                <th>Perfil típico</th>
                <th>Acidez</th>
                <th>Ideal para</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Etiopía Yirgacheffe</td><td>Floral, bergamota, té</td><td>Muy alta</td><td>V60, Chemex, frío</td></tr>
              <tr><td>Colombia Huila</td><td>Caramelo, frutal, panela</td><td>Alta</td><td>Filtrado, Aeropress</td></tr>
              <tr><td>Brasil Sul de Minas</td><td>Chocolate, nuez, caramelo</td><td>Baja</td><td>Espresso, Moka</td></tr>
              <tr><td>Kenia Kirinyaga</td><td>Grosella, cítrico, jugoso</td><td>Muy alta</td><td>V60, Cold brew</td></tr>
              <tr><td>Sumatra Mandheling</td><td>Terroso, cedro, especias</td><td>Baja</td><td>French Press, Cold brew</td></tr>
              <tr><td>Yemen Moka</td><td>Chocolate, vino, dátil</td><td>Alta</td><td>Ibrik, Espresso</td></tr>
              <tr><td>Jamaica Blue Mountain</td><td>Suave, mantequilla, nuez</td><td>Baja</td><td>Filtrado, French Press</td></tr>
              <tr><td>Vietnam Robusta</td><td>Cacao, tierra, intenso</td><td>Baja</td><td>Phin, café con leche</td></tr>
            </tbody>
          </table>
        </div>

        <h3>¿Para qué perfil es cada café?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🎨 El aficionado al café de especialidad</strong>
            <p>
              Empieza por Etiopía Yirgacheffe o Colombia Huila en V60. Busca la acidez brillante
              y la complejidad frutal que el café convencional nunca muestra. El tostado claro
              es tu aliado.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>☕ El amante del espresso italiano</strong>
            <p>
              Brasil Cerrado o Sumatra Mandheling en tostado oscuro. Cuerpo intenso, crema
              espesa, amargo elegante. Añade Robusta de Vietnam o Costa de Marfil a la mezcla
              para más cafeína y crema.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🧊 El fan del cold brew y el filtrado en frío</strong>
            <p>
              Los cafés de alta acidez brillan en frío: Kenia, Burundi o Colombia Nariño.
              La acidez "jugosa" se acentúa con el frío y las notas frutales emergen sin
              la astringencia del calor.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🌱 El curioso de orígenes raros</strong>
            <p>
              Yemen Moka, Bolivia Caranavi, Timor Oriental o el Geisha de Panamá. Cafés con
              historia, perfiles únicos y a veces precios que justifican una ocasión especial.
              Cada taza cuenta una historia geográfica.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia real hay entre Arábica y Robusta?</strong>
            <p>
              El Arábica tiene más acidez, más complejidad aromática y menos cafeína. Crece en
              altitud y es más delicado. El Robusta tiene el doble de cafeína, más cuerpo y crema
              en espresso, y es más resistente y barato. Ninguno es "mejor": depende del uso.
              Las mezclas de espresso italiano clásico suelen combinar ambos.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el café etíope sabe tan distinto?</strong>
            <p>
              Etiopía es la cuna genética del café. Sus variedades son las más antiguas y diversas
              del mundo, muchas de ellas silvestres o semisalvajes. Esa biodiversidad genética, más
              la altitud y los métodos de procesado (especialmente el natural), produce perfiles
              florales y frutales que ningún otro origen puede replicar.
            </p>
            <span className={styles.faqTip}>
              💡 El Yirgacheffe lavado y el Harrar natural son como dos mundos distintos siendo
              del mismo país.
            </span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El tostado oscuro es de peor calidad?</strong>
            <p>
              No necesariamente, pero sí enmascara el origen. Un tostado oscuro de un café
              excepcional sabe igual que uno mediocre: el calor destruye los compuestos aromáticos
              delicados que diferencian orígenes. El café de especialidad se tuesta claro para
              que el origen "hable". Las mezclas comerciales se tuestan oscuro para homogeneizar
              calidades diferentes.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué significa "tercera ola del café"?</strong>
            <p>
              La primera ola fue la industrialización del café (Nescafé, café soluble). La segunda
              fue la cultura del café de cafetería (Starbucks, espresso, lattes). La tercera ola
              trata el café como el vino: con origen rastreable, tostado artesanal, barista como
              profesional y métodos de preparación precisos (V60, Chemex, Aeropress). Surgió en
              los años 2000 en EE.UU. y Escandinavia.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es una subasta de café Cup of Excellence?</strong>
            <p>
              Cup of Excellence (CoE) es el concurso de café más prestigioso del mundo, organizado
              en los principales países productores. Los mejores lotes de cada país son catados,
              puntuados y subastados en línea. Los precios alcanzan cifras récord (50-100 USD/kg
              o más) y garantizan un ingreso directo al productor. Un CoE cambia la vida económica
              de una pequeña finca.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el café de Jamaica Blue Mountain es tan caro?</strong>
            <p>
              Combinación de factores: altitud excepcional, producción muy limitada (solo las
              fincas dentro del límite oficial pueden usar el nombre), proceso manual en barriles
              de madera, y una demanda japonesa que absorbe el 80% de la producción, creando
              escasez artificial para el resto del mundo.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo saber si un café es realmente de especialidad?</strong>
            <p>
              Busca en el empaque: año de cosecha, país y región de origen, variedad botánica,
              método de procesado y puntuación SCA (superior a 80 puntos). El precio es un
              indicador imperfecto: los grandes supermercados venden raramente café de especialidad
              genuino. Las tiendas de tostadores locales y las tiendas online especializadas son
              los canales más fiables.
            </p>
            <span className={styles.faqTip}>
              ☕ Un café de especialidad suele costar entre 15 y 40 €/250 g. Por encima de 40 €
              suele ser un lote muy pequeño o de concurso.
            </span>
          </li>
        </ul>

        <h3>Del árbol a tu taza: el proceso paso a paso</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Cultivo y floración</strong>
              <p>
                El cafeto tarda 3-4 años desde la siembra hasta la primera cosecha productiva.
                Las flores blancas (con olor a jazmín) duran solo 2-3 días y dan paso al fruto,
                la "cereza de café", que tarda 6-9 meses en madurar.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Cosecha selectiva</strong>
              <p>
                La cosecha de calidad se hace a mano, seleccionando solo las cerezas rojas maduras.
                Una recolectora experta puede cosechar 50-100 kg de cerezas al día, que producirán
                unos 10-20 kg de café verde. La cosecha mecanizada (Brasil) es más rápida pero
                menos selectiva.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Procesado (lavado, natural u honey)</strong>
              <p>
                Es el paso que más define el sabor final. En el lavado se retira la pulpa antes
                del secado. En el natural el fruto se seca entero al sol durante 2-4 semanas.
                El honey conserva parte del mucílago. Cada método genera un perfil de sabor radicalmente diferente.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Trilla y selección del café verde</strong>
              <p>
                Se retiran las capas externas del grano seco para obtener el café verde
                (green coffee). Se clasifica por tamaño, densidad y defectos. Solo los granos
                que superan el control de calidad se exportan como "especialidad".
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Tostado (roasting)</strong>
              <p>
                El café verde no tiene prácticamente aroma. Durante el tostado (entre 10 y 15
                minutos a 200-240°C) se producen más de 800 compuestos aromáticos mediante la
                reacción de Maillard y la caramelización. El nivel de tostado determina qué
                compuestos predominan en la taza.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>6</span>
            <div className={styles.stepContent}>
              <strong>Extracción: el arte final</strong>
              <p>
                La preparación es la última variable. Temperatura del agua (88-96°C), tiempo de
                contacto, granulometría del molido y ratio café/agua determinan el resultado final.
                Un café excepcional mal preparado puede ser decepcionante; un café modesto bien
                preparado puede sorprender.
              </p>
            </div>
          </li>
        </ol>

        <h3>Consejos para elegir y conservar el café</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>
              Busca la fecha de tostado, no de caducidad. El café está en su mejor momento
              entre 7 y 30 días post-tostado. Después de 60 días pierde complejidad aromática
              de forma notoria.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🫙</span>
            <p>
              Guarda el café en bote hermético opaco, alejado del calor, la luz y la humedad.
              Nunca en el frigorífico (absorbe olores). El congelador es aceptable solo para
              lotes grandes sin abrir.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚙️</span>
            <p>
              Muele siempre justo antes de preparar. El café molido pierde el 50% de sus
              compuestos aromáticos volátiles en las primeras horas. Un molinillo de rebabas
              (burr grinder) marca la diferencia.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <p>
              El agua no debe hervir: 90-96°C es el rango ideal para Arábica. A 100°C se
              extraen compuestos amargos que arruinan el perfil. Un termómetro o hervidora
              con control de temperatura es una inversión que cambia los resultados.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>
              Aprende a relacionar origen con método: los Arábicas africanos (florales, ácidos)
              brillan en V60 o Chemex. Los latinoamericanos equilibrados van bien en cualquier
              método. Los asiáticos intensos destacan en French Press o Cold brew.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
            <p>
              Si el paquete no indica el país, la región y el tostador, probablemente no sea
              café de especialidad. Las etiquetas vagas ("mezcla arábica premium") suelen
              esconder mezclas de cafés comerciales de calidad media.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al comprar y preparar café</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Comprar café sin fecha de tostado:</strong> la caducidad no dice nada sobre
              la frescura real. Un café con caducidad en 2026 pudo tostarse en 2023. Sin fecha
              de tostado, no hay forma de saber si el café está fresco.
            </li>
            <li>
              <strong>Confundir precio alto con calidad:</strong> las marcas de supermercado con
              precios elevados a menudo son solo marketing. El café de especialidad genuino rara
              vez llega a las grandes cadenas; lo encontrarás en tostadores locales y tiendas online.
            </li>
            <li>
              <strong>Guardar el café en el frigorífico:</strong> la condensación y los olores
              del frigorífico deterioran el café rápidamente. El bote hermético a temperatura
              ambiente es siempre la mejor opción para el consumo diario.
            </li>
            <li>
              <strong>Usar café pre-molido para métodos de filtro:</strong> el molido estándar
              comercial no está optimizado para V60, Chemex ni Aeropress. Cada método requiere
              una granulometría específica que solo consigues moliendo tú mismo.
            </li>
            <li>
              <strong>Asumir que el Kopi Luwak es sinónimo de calidad:</strong> el café procesado
              por civetas es caro por su rareza y exotismo, no por su calidad objetiva. La mayoría
              de catadores profesionales lo puntúan por debajo de muchos cafés de especialidad
              convencionales.
            </li>
            <li>
              <strong>Ignorar el origen al elegir el método de preparación:</strong> un Robusta
              intenso en V60 será decepcionante; un Yirgacheffe floral en una Moka italiana
              perderá toda su complejidad. El método y el origen deben complementarse.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-cafe')} />
      <ShareCard appName="guia-cafe" />
      <Footer appName="guia-cafe" />
    </div>
  );
}
