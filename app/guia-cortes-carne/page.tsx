'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaCortesCarne.module.css';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Animal = 'Vacuno' | 'Cerdo' | 'Cordero' | 'Pollo' | 'Ternera';
type MetodoCoccion = 'Plancha' | 'Horno' | 'Parrilla' | 'Estofado' | 'Fritura' | 'Crudo' | 'Guiso';
type Terneza = 'Muy tierno' | 'Tierno' | 'Medio' | 'Firme' | 'Muy firme';
type NivelGrasa = 'Muy magro' | 'Magro' | 'Entreverado' | 'Graso';
type PrecioAproximado = 'Económico' | 'Medio' | 'Premium' | 'Muy premium';

interface CorteCarne {
  nombre: string;
  nombreAlternativo: string;
  animal: Animal;
  parte: string;
  terneza: Terneza;
  grasa: NivelGrasa;
  metodosCoccion: MetodoCoccion[];
  temperaturaInternaIdeal: string;
  tiempoCoccionOrientativo: string;
  precioAproximado: PrecioAproximado;
  descripcion: string;
  consejoCocina: string;
  curiosidad: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const ANIMALES: Animal[] = ['Vacuno', 'Cerdo', 'Cordero', 'Pollo', 'Ternera'];
const METODOS: MetodoCoccion[] = ['Plancha', 'Horno', 'Parrilla', 'Estofado', 'Fritura', 'Crudo', 'Guiso'];

const ANIMAL_CLASS: Record<Animal, string> = {
  Vacuno: styles.badgeVacuno,
  Cerdo: styles.badgeCerdo,
  Cordero: styles.badgeCordero,
  Pollo: styles.badgePollo,
  Ternera: styles.badgeTernera,
};

const ANIMAL_EMOJI: Record<Animal, string> = {
  Vacuno: '🐄',
  Cerdo: '🐷',
  Cordero: '🐑',
  Pollo: '🐔',
  Ternera: '🐮',
};

const CORTES: CorteCarne[] = [
  // ── VACUNO ──
  {
    nombre: 'Chuletón', nombreAlternativo: 'Ribeye / Entrecot con hueso',
    animal: 'Vacuno', parte: 'Costillas (6ª-12ª vértebra)',
    terneza: 'Muy tierno', grasa: 'Entreverado',
    metodosCoccion: ['Parrilla', 'Plancha'],
    temperaturaInternaIdeal: '54–57 °C (poco hecho)', tiempoCoccionOrientativo: '4–6 min por lado',
    precioAproximado: 'Muy premium',
    descripcion: 'El rey de los asados. El chuletón incluye el hueso de la costilla, que aporta sabor durante la cocción. La grasa intramuscular (marmoleo) funde durante la cocción liberando jugosidad y sabor inigualables. Un buen chuletón de vaca vieja puede pesar entre 600 g y 1,5 kg.',
    consejoCocina: 'Sacar de la nevera 1 hora antes. Cocinar a alta temperatura solo por fuera (costra). Dejar reposar 5 min antes de cortar.',
    curiosidad: 'El chuletón de vaca vieja gallega ha alcanzado reconocimiento mundial. Las reses gallegas de más de 10 años, criadas en libertad con hierba atlántica, producen carnes con marmoleo y sabor comparables a los wagyu japoneses. Restaurantes de Nueva York y Tokio importan chuletón gallego.',
  },
  {
    nombre: 'Solomillo', nombreAlternativo: 'Filete mignon / Tenderloin',
    animal: 'Vacuno', parte: 'Músculo psoas mayor (bajo el lomo)',
    terneza: 'Muy tierno', grasa: 'Muy magro',
    metodosCoccion: ['Plancha', 'Horno', 'Parrilla'],
    temperaturaInternaIdeal: '54–57 °C (poco hecho)', tiempoCoccionOrientativo: '2–3 min por lado',
    precioAproximado: 'Muy premium',
    descripcion: 'El músculo menos trabajado del animal, lo que lo convierte en el más tierno de todos los cortes. Es magro, sin apenas grasa exterior. Su sabor es más suave que el chuletón, pero su textura es la más fina. Ideal para personas que buscan terneza máxima sin grasa.',
    consejoCocina: 'No sobrecocinar: por encima de 60 °C pierde jugosidad rápidamente. El tournedó (rodaja gruesa atada) es la presentación clásica de alta cocina.',
    curiosidad: 'El solomillo es el único corte bovino que aparece en la lista de las 10 comidas más caras del mundo cuando procede de wagyu A5 japonés. Un solo solomillo de wagyu Matsusaka puede costar más de 400 € en Japón.',
  },
  {
    nombre: 'Entrecot', nombreAlternativo: 'Striploin / New York Strip',
    animal: 'Vacuno', parte: 'Lomo alto (entre costillas)',
    terneza: 'Tierno', grasa: 'Magro',
    metodosCoccion: ['Plancha', 'Parrilla'],
    temperaturaInternaIdeal: '54–60 °C', tiempoCoccionOrientativo: '3–4 min por lado',
    precioAproximado: 'Premium',
    descripcion: 'El equilibrio perfecto entre terneza y sabor. El entrecot tiene menos grasa que el chuletón pero más sabor que el solomillo. Su borde exterior de grasa, cuando se funde en la sartén, aporta todo su sabor. El corte favorito de las parrillas americanas y argentinas.',
    consejoCocina: 'Sellar el borde de grasa primero (5 segundos de pie) para que funda antes de cocinar las caras.',
    curiosidad: 'El término "entrecot" viene del francés "entre côtes" (entre costillas). En Argentina y Uruguay se llama "bife de chorizo", nombre que confunde a los visitantes europeos al no tener nada que ver con el embutido.',
  },
  {
    nombre: 'Carne de hamburguesa (picada)', nombreAlternativo: 'Ground beef / Burguer blend',
    animal: 'Vacuno', parte: 'Mezcla (falda + aguja, típicamente)',
    terneza: 'Medio', grasa: 'Entreverado',
    metodosCoccion: ['Plancha', 'Parrilla'],
    temperaturaInternaIdeal: '71 °C (bien hecho por seguridad)', tiempoCoccionOrientativo: '3–4 min por lado',
    precioAproximado: 'Económico',
    descripcion: 'La hamburguesa perfecta requiere una mezcla con al menos 20–30% de grasa para que quede jugosa. La combinación de falda y aguja es clásica. La calidad del picado importa: picar en el momento (no comprar ya picada hace horas) es la diferencia entre una hamburguesa mediocre y una extraordinaria.',
    consejoCocina: 'No presionar con la espátula al cocinar: expulsa los jugos. Punto óptimo de cocción interno 71 °C por seguridad sanitaria (carne picada).',
    curiosidad: 'La hamburguesa fue popularizada en EEUU por inmigrantes alemanes del puerto de Hamburgo en el siglo XIX. El "Hamburg steak" era carne picada de ternera servida como filete, sin pan. La versión moderna entre dos panes surgió en ferias americanas de finales del XIX.',
  },
  {
    nombre: 'Falda', nombreAlternativo: 'Flank steak / Bavette',
    animal: 'Vacuno', parte: 'Vientre inferior (músculos abdominales)',
    terneza: 'Firme', grasa: 'Magro',
    metodosCoccion: ['Plancha', 'Parrilla', 'Estofado'],
    temperaturaInternaIdeal: '54–57 °C y cortar en diagonal', tiempoCoccionOrientativo: '3–4 min por lado',
    precioAproximado: 'Medio',
    descripcion: 'La falda tiene fibra larga y pronunciada, lo que la hace firme pero muy sabrosa. Cortada en diagonal contra la fibra, resulta tierna. En cocina mexicana es la base del "carne asada". En Francia, la "bavette" es muy valorada. Su sabor intenso la hace ideal para marinados.',
    consejoCocina: 'Marinar al menos 2 horas. Cocinar rápido a alta temperatura. Cortar SIEMPRE perpendicular a la fibra para mejorar la terneza.',
    curiosidad: 'La falda era hasta los años 80 un corte barato considerado de segunda categoría. Fue la expansión de la cocina tex-mex y las fajitas la que la puso en el mapa gastronómico mundial. Hoy, la demanda supera la oferta y su precio ha subido considerablemente.',
  },
  {
    nombre: 'Morcillo', nombreAlternativo: 'Jarrete / Ossobuco (con hueso)',
    animal: 'Vacuno', parte: 'Parte baja de la pata (músculo de la pierna)',
    terneza: 'Muy firme', grasa: 'Muy magro',
    metodosCoccion: ['Estofado', 'Guiso'],
    temperaturaInternaIdeal: '85–95 °C (cocción larga)', tiempoCoccionOrientativo: '2–4 horas a fuego lento',
    precioAproximado: 'Medio',
    descripcion: 'El morcillo es el músculo más trabajado del animal: lleno de colágeno que, con cocciones largas y húmedas, se convierte en gelatina. El resultado es una carne melosa, que se deshace, con una salsa naturalmente espesa. El cocido madrileño y el ossobuco italiano son sus expresiones cumbre.',
    consejoCocina: 'La clave es el tiempo: al menos 2-3 horas a fuego muy suave con líquido. A presión (olla exprés) se reduce a 45-60 minutos.',
    curiosidad: 'El ossobuco milanés (morcillo cortado transversalmente con el tuétano del hueso expuesto) tiene una tradición de más de 200 años. El tuétano del hueso central es su parte más preciada: una cucharilla especial (el "escarba-tuétanos") se usaba para extraerlo en la alta cocina milanesa.',
  },
  {
    nombre: 'Rabo de toro', nombreAlternativo: 'Oxtail / Cola de buey',
    animal: 'Vacuno', parte: 'Cola (vértebras caudales)',
    terneza: 'Muy firme', grasa: 'Entreverado',
    metodosCoccion: ['Estofado', 'Guiso'],
    temperaturaInternaIdeal: '90 °C+ (cocción muy larga)', tiempoCoccionOrientativo: '3–5 horas',
    precioAproximado: 'Medio',
    descripcion: 'El rabo de toro es uno de los platos más icónicos de Córdoba y la cocina andaluza. Su alto contenido en colágeno y gelatina natural produce salsas extraordinariamente untuosas. Requiere cocción muy larga, pero el resultado —carne que se desprende del hueso con el tenedor— justifica el esfuerzo.',
    consejoCocina: 'Sellar bien en aceite antes de estofar. Añadir vino tinto de calidad y cocinar muy despacio. Mejor de un día para otro: el reposo mejora el sabor.',
    curiosidad: 'El estofado de rabo de toro tiene sus raíces en las corridas de toros de Córdoba del siglo XVIII: los rabos de los toros lidiados se cocinaban ese mismo día para los toreros y aficionados. Hoy los mejores restaurantes cordobeses tienen listas de espera de semanas para su rabo de toro.',
  },
  {
    nombre: 'Aguja', nombreAlternativo: 'Chuck / Paleta alta',
    animal: 'Vacuno', parte: 'Cuello y parte alta del hombro',
    terneza: 'Firme', grasa: 'Entreverado',
    metodosCoccion: ['Estofado', 'Guiso', 'Horno'],
    temperaturaInternaIdeal: '85–90 °C (cocción larga)', tiempoCoccionOrientativo: '2–3 horas',
    precioAproximado: 'Económico',
    descripcion: 'La aguja es el corte más versátil de la vaca: económica, bien infiltrada de grasa y colágeno, resulta extraordinaria en cocciones largas. Es la base del estofado clásico, del pot-au-feu francés y del chuck roast americano. Su infiltración de grasa la mantiene jugosa incluso tras horas de cocción.',
    consejoCocina: 'Para un asado de olla perfecto: dorar en aceite muy caliente por todos lados antes de añadir líquido. Ese sellado crea la costra que retiene los jugos.',
    curiosidad: 'En EEUU, el chuck (aguja) es el corte más picado para hamburguesas de alta gama: su ratio de 80% magro / 20% grasa es considerado el óptimo para una hamburguesa jugosa. Las burger joints premium que anuncian "80/20 chuck blend" utilizan este corte como base.',
  },
  {
    nombre: 'Pecho', nombreAlternativo: 'Brisket',
    animal: 'Vacuno', parte: 'Pecho (músculos pectorales)',
    terneza: 'Muy firme', grasa: 'Graso',
    metodosCoccion: ['Horno', 'Estofado'],
    temperaturaInternaIdeal: '90–95 °C (cocción muy larga)', tiempoCoccionOrientativo: '8–14 horas en BBQ',
    precioAproximado: 'Económico',
    descripcion: 'El brisket es el corte del BBQ texano por excelencia. Los músculos pectorales son muy trabajados en el animal, lo que los hace duros pero extraordinariamente sabrosos. Con el método Texas BBQ (ahumado lento a 110 °C durante 10-14 horas) se transforma en algo casi mágico: tierno, jugoso y con una "bark" (corteza exterior) crujiente e irresistible.',
    consejoCocina: 'El colágeno del brisket tarda horas en convertirse en gelatina. La zona "flat" (más magra) y el "point" (más graso) requieren tiempos distintos. Un termómetro de sonda es imprescindible.',
    curiosidad: 'El brisket del BBQ texano tiene su propio idioma: "bark" (la corteza exterior ahumada), "money muscle" (la parte más grasa del point), "burnt ends" (los trozos caramelizados). El sello de calidad de Kansas City es usar exclusivamente burnt ends como snack antes del plato principal.',
  },
  {
    nombre: 'Carrillada', nombreAlternativo: 'Carrillera / Mejilla de ternera',
    animal: 'Vacuno', parte: 'Músculo masetero (mejilla)',
    terneza: 'Muy firme', grasa: 'Magro',
    metodosCoccion: ['Estofado', 'Guiso'],
    temperaturaInternaIdeal: '85–90 °C (cocción lenta)', tiempoCoccionOrientativo: '2–3 horas',
    precioAproximado: 'Medio',
    descripcion: 'La carrillada es el músculo de la mejilla de la vaca: el más trabajado del cuerpo ya que el animal mastica constantemente. Este trabajo intenso la llena de tejido conectivo que, tras cocción lenta, se transforma en una textura sedosa y gelatinosa incomparable. Es uno de los cortes favoritos de la alta cocina española.',
    consejoCocina: 'Marinar en vino tinto 12-24 horas antes de cocinar. La cocción muy lenta (80-85 °C) produce una textura más fina que a fuego fuerte.',
    curiosidad: 'La carrillada ibérica (de cerdo ibérico) es incluso más popular que la de vacuno en España. El chef Ferran Adrià sirvió carrilladas de cerdo ibérico a más de 160 °C de temperatura durante 12 horas en elBulli, convirtiendo este corte humilde en un plato de alta cocina que desafió todos los paradigmas.',
  },
  // ── CERDO ──
  {
    nombre: 'Secreto ibérico', nombreAlternativo: 'Secret cut / Iberian secret',
    animal: 'Cerdo', parte: 'Entre el tocino y la paletilla',
    terneza: 'Tierno', grasa: 'Entreverado',
    metodosCoccion: ['Plancha', 'Parrilla'],
    temperaturaInternaIdeal: '63–68 °C', tiempoCoccionOrientativo: '3–4 min por lado',
    precioAproximado: 'Premium',
    descripcion: 'El secreto ibérico es la joya oculta del cerdo: se esconde entre la grasa y los músculos del espaldar, oculto a la vista. Su veteado de grasa infiltrada, fruto de la vida del cerdo ibérico en dehesa comiendo bellotas, le da un sabor único que recuerda al jamón ibérico en su versión caliente.',
    consejoCocina: 'Plancha muy caliente, poco tiempo, reposo. No superar 68 °C interior para no perder la jugosidad.',
    curiosidad: 'El secreto ibérico era prácticamente desconocido fuera de España hasta que el chef Alberto Chicote lo popularizó en sus programas de televisión a principios de los 2000. Hoy se exporta a restaurantes japoneses, donde se sirve como "secreto" en degustaciones de cocina española contemporánea.',
  },
  {
    nombre: 'Presa ibérica', nombreAlternativo: 'Iberian shoulder steak',
    animal: 'Cerdo', parte: 'Parte superior de la paleta (cuello)',
    terneza: 'Tierno', grasa: 'Entreverado',
    metodosCoccion: ['Plancha', 'Parrilla', 'Horno'],
    temperaturaInternaIdeal: '63–68 °C', tiempoCoccionOrientativo: '4–5 min por lado',
    precioAproximado: 'Premium',
    descripcion: 'La presa ibérica es el corte más jugoso y veteado del cerdo ibérico junto al secreto. Su textura es más compacta que el secreto pero igualmente infiltrada de grasa entre las fibras musculares. El sabor de bellota se percibe en cada bocado. Es el segundo corte ibérico más valorado tras el pluma.',
    consejoCocina: 'Igual que el secreto: plancha muy caliente, vuelta y vuelta, reposo generoso. Salar solo después de cocinar.',
    curiosidad: 'El cerdo ibérico es la única raza porcina cuya grasa se infiltra en el músculo (en vez de solo acumularse en capas exteriores). Este fenómeno, llamado "grasa intramuscular" o marmoleo, se debe a la genética del cerdo ibérico y a su alimentación en extensivo con bellotas durante la montanera.',
  },
  {
    nombre: 'Pluma ibérica', nombreAlternativo: 'Iberian wing cut',
    animal: 'Cerdo', parte: 'Extremo del lomo, unión con el cuello',
    terneza: 'Muy tierno', grasa: 'Entreverado',
    metodosCoccion: ['Plancha', 'Parrilla'],
    temperaturaInternaIdeal: '63–65 °C', tiempoCoccionOrientativo: '2–3 min por lado',
    precioAproximado: 'Muy premium',
    descripcion: 'La pluma ibérica es el corte más fino y tierno del cerdo ibérico. Su nombre viene de la forma alargada que recuerda a una pluma. Solo hay una pequeña pieza por animal. Su textura es extraordinariamente delicada, con la grasa perfectamente infiltrada. Es el corte que más se acerca a la experiencia del wagyu en el porcino.',
    consejoCocina: 'Tan delicada que con 2 minutos por cada lado en plancha muy caliente está perfecta. El reposo es fundamental.',
    curiosidad: 'De un cerdo ibérico de 180 kg solo se obtienen 2 plumas de unos 150-200 g cada una. Esta escasez extrema la convierte en el corte ibérico más caro del mercado. En restaurantes de Madrid y Barcelona, la pluma ibérica puede llegar a 35-45 € la ración.',
  },
  {
    nombre: 'Costillas de cerdo', nombreAlternativo: 'Spare ribs / Baby back ribs',
    animal: 'Cerdo', parte: 'Caja torácica',
    terneza: 'Firme', grasa: 'Entreverado',
    metodosCoccion: ['Horno', 'Parrilla', 'Estofado'],
    temperaturaInternaIdeal: '85–90 °C (textura caída del hueso)', tiempoCoccionOrientativo: '2–3 horas a 160 °C',
    precioAproximado: 'Económico',
    descripcion: 'Las costillas de cerdo son el corte festivo por excelencia. Las "baby back" (lomo) son más tiernas pero menos carnosas; las "spare ribs" (costillas laterales) tienen más carne y grasa. El método 3-2-1 americano (3 horas ahumando, 2 en papel, 1 con salsa) produce el resultado más espectacular.',
    consejoCocina: 'Quitar la membrana del lado interior antes de cocinar. La baja temperatura y el tiempo largo son los únicos secretos.',
    curiosidad: 'Las costillas BBQ son el plato más vendido de los campeonatos de BBQ americanos. El circuito KCBS (Kansas City Barbeque Society) celebra más de 500 competiciones anuales con categoría específica de ribs. Los jueces puntúan apariencia, sabor y textura (la carne debe salir limpia del hueso con una sola mordida).',
  },
  {
    nombre: 'Panceta', nombreAlternativo: 'Bacon / Belly pork',
    animal: 'Cerdo', parte: 'Vientre (panza)',
    terneza: 'Tierno', grasa: 'Graso',
    metodosCoccion: ['Plancha', 'Horno', 'Guiso'],
    temperaturaInternaIdeal: '68–75 °C', tiempoCoccionOrientativo: '3–4 min por lado (lonchas)',
    precioAproximado: 'Económico',
    descripcion: 'La panceta es alternancia de capas de carne magra y grasa. Curada y ahumada se convierte en bacon. Fresca al horno a baja temperatura, produce la famosa "pork belly" de la cocina asiática y americana. Su grasa, al fundirse, es el aceite de cocina más aromático que existe.',
    consejoCocina: 'Para pork belly perfecto: 12 horas a 80 °C seguidas de 10 minutos a 220 °C para conseguir la piel crujiente y el interior meloso.',
    curiosidad: 'El bacon americano (panceta curada y ahumada) se popularizó en Estados Unidos en los siglos XIX-XX. Hoy existen versiones premium con maderas de manzano, nogal o haya que aportan perfiles ahumados muy distintos.',
  },
  {
    nombre: 'Lomo de cerdo', nombreAlternativo: 'Pork loin / Cinta de lomo',
    animal: 'Cerdo', parte: 'Lomo (músculo longissimus dorsi)',
    terneza: 'Tierno', grasa: 'Muy magro',
    metodosCoccion: ['Plancha', 'Horno', 'Estofado'],
    temperaturaInternaIdeal: '63–68 °C', tiempoCoccionOrientativo: '20–30 min al horno',
    precioAproximado: 'Económico',
    descripcion: 'El lomo de cerdo es la opción más magra y económica del cerdo. Es tierno pero, por su bajo contenido en grasa, se reseca fácilmente con cocción excesiva. La clave es la temperatura exacta: a 63 °C está seguro, jugoso y rosado. Por encima de 70 °C, se vuelve seco e insípido.',
    consejoCocina: 'Marinar en salmuera húmeda (agua + sal + azúcar) 4-8 horas antes. Transforma completamente la jugosidad del resultado final.',
    curiosidad: 'El "lomo embuchado" español (lomo curado en manteca) es uno de los embutidos ibéricos menos conocidos internacionalmente pero más apreciados en España. A diferencia del jamón y el chorizo, el lomo embuchado ibérico no tiene análogos en otras cocinas del mundo.',
  },
  {
    nombre: 'Carrillada de cerdo', nombreAlternativo: 'Pork cheek / Jowl',
    animal: 'Cerdo', parte: 'Músculo de la mejilla',
    terneza: 'Muy firme', grasa: 'Entreverado',
    metodosCoccion: ['Estofado', 'Guiso'],
    temperaturaInternaIdeal: '85–90 °C (cocción lenta)', tiempoCoccionOrientativo: '2–3 horas',
    precioAproximado: 'Medio',
    descripcion: 'La carrillada de cerdo es el corte comodín de la cocina moderna española. Su precio es moderado, su sabor es intenso y su textura melosa tras cocción lenta es de alta cocina. Al estofado con vino tinto, salsa de soja y miso, es uno de los platos más fotografiados de los menú degustación españoles.',
    consejoCocina: 'Retirar el exceso de grasa exterior antes de cocinar. El colágeno se funde a partir de 72 °C: cocinar siempre por debajo de 85 °C para máxima terneza.',
    curiosidad: 'La carrillada de cerdo ibérico fue el plato que Andoni Luis Aduriz (Mugaritz) sirvió en la primera cena del restaurante en 1998, y ha estado presente en el menú bajo distintas formas durante más de 25 años. Es su talismán culinario: el corte más humilde convertido en icono de alta cocina.',
  },
  // ── CORDERO ──
  {
    nombre: 'Chuletas de cordero', nombreAlternativo: 'Lamb chops / Cutlets',
    animal: 'Cordero', parte: 'Costillar (rack)',
    terneza: 'Tierno', grasa: 'Entreverado',
    metodosCoccion: ['Plancha', 'Parrilla', 'Horno'],
    temperaturaInternaIdeal: '60–65 °C (rosado)', tiempoCoccionOrientativo: '2–3 min por lado',
    precioAproximado: 'Premium',
    descripcion: 'Las chuletas de cordero son el corte más elegante del ovino. El "rack of lamb" (corona de chuletas) es un clásico de la alta cocina francesa. Las chuletas individuales son perfectas a la parrilla: tiernas, con su grasa exterior que se tuesta deliciosamente. El sabor del cordero lechal es más suave; el del cordero mayor, más intenso.',
    consejoCocina: 'Marinar con ajo, romero y aceite de oliva al menos 2 horas. Cocinar siempre a alta temperatura y poco tiempo para conservar el rosado interior.',
    curiosidad: 'El "Rack of lamb" presentado en corona (los huesos curvados hacia arriba) es uno de los platos más fotografiados en Instagram entre los amantes de la carne. Los huesos "frenched" (limpios de grasa) son la presentación de alta cocina estándar en restaurantes con estrella Michelin.',
  },
  {
    nombre: 'Pierna de cordero', nombreAlternativo: 'Leg of lamb',
    animal: 'Cordero', parte: 'Pata trasera completa',
    terneza: 'Medio', grasa: 'Magro',
    metodosCoccion: ['Horno', 'Parrilla'],
    temperaturaInternaIdeal: '65–70 °C', tiempoCoccionOrientativo: '1,5–2 horas al horno',
    precioAproximado: 'Medio',
    descripcion: 'La pierna de cordero es el asado festivo por excelencia en España, especialmente en Semana Santa y Navidad. La pierna entera al horno, con ajo, vino blanco y romero, es uno de los platos más aromáticos de la cocina mediterránea. Las zonas de Aranda de Duero y Sepúlveda (Segovia) tienen fama mundial por sus cordero lechal al horno.',
    consejoCocina: 'Para un lechal, horno a 160 °C con agua y manteca en la bandeja. Para uno mayor, asar primero a 220 °C 20 min y bajar a 160 °C. Agua en la bandeja siempre.',
    curiosidad: 'La tradición del cordero lechal asado en horno de leña de Segovia data del siglo XVIII. Los mesones de Pedraza y Sepúlveda tienen hornos de leña con más de 200 años de uso continuado. El cordero lechal segoviano tiene Indicación Geográfica Protegida y se sacrifica con menos de 35 días de vida.',
  },
  {
    nombre: 'Paletilla de cordero', nombreAlternativo: 'Lamb shoulder',
    animal: 'Cordero', parte: 'Hombro delantero',
    terneza: 'Firme', grasa: 'Entreverado',
    metodosCoccion: ['Horno', 'Estofado'],
    temperaturaInternaIdeal: '75–80 °C', tiempoCoccionOrientativo: '2–3 horas al horno',
    precioAproximado: 'Medio',
    descripcion: 'La paletilla tiene más tejido conectivo que la pierna, lo que la hace ideal para cocciones largas que ablandan la carne hasta que se desprende del hueso con los dedos. Su cocción lenta produce una carne increíblemente melosa con jugos naturales llenos de sabor.',
    consejoCocina: 'La cocción a baja temperatura (150 °C durante 3 horas) produce un resultado más jugoso que la cocción rápida. Los jugos de la bandeja son la base de la salsa.',
    curiosidad: 'En Turquía y Oriente Medio, el cordero es la carne central de todas las celebraciones importantes. El "kuzu tandir" (paletilla de cordero cocida lentamente en horno de barro subterráneo durante 4-6 horas) es un plato que se sirve entero sobre lavash (pan plano), con la carne tan tierna que se sirve con los dedos.',
  },
  // ── POLLO ──
  {
    nombre: 'Pechuga de pollo', nombreAlternativo: 'Chicken breast',
    animal: 'Pollo', parte: 'Pecho (músculo pectoral)',
    terneza: 'Tierno', grasa: 'Muy magro',
    metodosCoccion: ['Plancha', 'Horno', 'Fritura'],
    temperaturaInternaIdeal: '72–75 °C', tiempoCoccionOrientativo: '6–8 min por lado',
    precioAproximado: 'Económico',
    descripcion: 'El corte de pollo más consumido mundialmente. Su bajo contenido en grasa la hace saludable pero también la más propensa a resecarse. La diferencia entre una pechuga jugosa y una gomosa es 3-4 °C internos. El salmuera previa y el reposo posterior son los dos trucos que marcan la diferencia.',
    consejoCocina: 'Salmuera húmeda 30 min (agua + 4% sal). Cocinar hasta exactamente 72 °C y dejar reposar 5 min tapada antes de cortar. Cortar siempre en diagonal.',
    curiosidad: 'La pechuga de pollo es el alimento más asociado al fitness y la musculación. Sin embargo, el muslo de pollo tiene casi el mismo contenido proteico con más grasa (sobre todo monoinsaturada) y más zinc y hierro. Los nutricionistas especializados en deportistas de élite han empezado a recomendar muslo sobre pechuga por su mejor perfil nutricional y sabor.',
  },
  {
    nombre: 'Muslo de pollo', nombreAlternativo: 'Chicken thigh',
    animal: 'Pollo', parte: 'Muslo (músculo cuádriceps aviar)',
    terneza: 'Tierno', grasa: 'Magro',
    metodosCoccion: ['Horno', 'Plancha', 'Estofado', 'Parrilla'],
    temperaturaInternaIdeal: '75–80 °C', tiempoCoccionOrientativo: '25–30 min al horno a 200 °C',
    precioAproximado: 'Económico',
    descripcion: 'El muslo de pollo es el corte más perdonador y sabroso del ave. Su mayor contenido en grasa y tejido conectivo lo hace mucho más difícil de resecar que la pechuga. Funciona bien en prácticamente cualquier método de cocción. Al horno con piel crujiente es uno de los platos más satisfactorios y económicos de la cocina doméstica.',
    consejoCocina: 'Marcar la piel con un cuchillo antes de hornear (reticular) para que la grasa salga y quede crujiente. Hornear siempre con la piel hacia arriba.',
    curiosidad: 'En un ranking de los cortes de ave más sabrosos realizado por Food & Wine Magazine con 50 chefs profesionales, el muslo ganó en 47 de 50 valoraciones frente a la pechuga. La "revolución del muslo" en la restauración americana ha desplazado parcialmente a la pechuga de los menús de alta cocina.',
  },
  {
    nombre: 'Alitas de pollo', nombreAlternativo: 'Chicken wings',
    animal: 'Pollo', parte: 'Ala completa (3 segmentos)',
    terneza: 'Firme', grasa: 'Magro',
    metodosCoccion: ['Horno', 'Fritura', 'Parrilla'],
    temperaturaInternaIdeal: '75 °C', tiempoCoccionOrientativo: '20–25 min al horno a 220 °C',
    precioAproximado: 'Económico',
    descripcion: 'Las alitas de pollo son uno de los snacks más populares del mundo. Su pequeño tamaño, la proporción piel-carne y la adaptabilidad a infinitas salsas las hacen perfectas para picoteo. Las Buffalo wings americanas (fritas + salsa picante + mantequilla) son el formato más icónico internacionalmente.',
    consejoCocina: 'Para alitas crujientes al horno: secar muy bien con papel, aplicar una capa de maicena y bicarbonato (1:1), hornear en rejilla elevada. No amontonar.',
    curiosidad: 'El Super Bowl americano es el evento de mayor consumo de alitas de pollo del mundo: en 2023 se consumieron 1.450 millones de alitas durante el partido. El precio del pollo en EEUU sube sistemáticamente cada año en la semana anterior al Super Bowl como consecuencia de esta demanda concentrada.',
  },
  {
    nombre: 'Pollo entero', nombreAlternativo: 'Whole roaster',
    animal: 'Pollo', parte: 'Animal completo',
    terneza: 'Tierno', grasa: 'Magro',
    metodosCoccion: ['Horno', 'Parrilla'],
    temperaturaInternaIdeal: '74 °C en la parte más gruesa del muslo', tiempoCoccionOrientativo: '1,5 horas a 190 °C',
    precioAproximado: 'Económico',
    descripcion: 'El pollo asado entero es uno de los platos más universales de la cocina familiar. La clave es conseguir la piel dorada y crujiente y el interior jugoso simultáneamente. Los franceses elevan el "poulet rôti" a categoría de arte culinario nacional. En España, el pollo de corral asado a espetón o al horno es la referencia de muchos domingos familiares.',
    consejoCocina: 'Secar la piel completamente (nevera destapado 12h). Untar con mantequilla bajo la piel. Arrancar por la parte del muslo, nunca el pecho.',
    curiosidad: 'El chef Thomas Keller del French Laundry (3 estrellas Michelin) afirma que el pollo asado perfecto es la prueba más difícil para un cocinero: requiere dominar simultáneamente temperatura, tiempo, humedad y la física de la transferencia de calor. "Si puedes hacer un pollo perfecto, puedes cocinar cualquier cosa".',
  },
  // ── TERNERA ──
  {
    nombre: 'Filete de ternera', nombreAlternativo: 'Veal cutlet',
    animal: 'Ternera', parte: 'Lomo o contra',
    terneza: 'Muy tierno', grasa: 'Muy magro',
    metodosCoccion: ['Plancha', 'Fritura'],
    temperaturaInternaIdeal: '60–65 °C', tiempoCoccionOrientativo: '2–3 min por lado',
    precioAproximado: 'Premium',
    descripcion: 'La ternera (animal joven) tiene la carne más tierna y suave de todos los bovinos. Su color rosado pálido, casi blanco, y su sabor delicado la convierten en la preferida de la alta cocina francesa e italiana. El filete milanés (empanado) y la escalopa de ternera con limón son sus preparaciones más clásicas.',
    consejoCocina: 'No superar nunca 65 °C interior: la ternera reseca rápidamente. La salsa de limón (piccata) o el empanado son la protección ideal para la humedad.',
    curiosidad: 'La producción de ternera blanca (veal) es objeto de debate ético. La ternera de máxima calidad (de leche) procede de terneros criados en oscuridad y sin hierro para mantener la carne pálida. En la UE se exigen estándares mínimos de bienestar, pero el debate sobre la producción intensiva de ternero de leche continúa.',
  },
  {
    nombre: 'Ossobuco de ternera', nombreAlternativo: 'Veal ossobuco / Stinco',
    animal: 'Ternera', parte: 'Jarrete (morcillo) cortado transversalmente con hueso',
    terneza: 'Muy firme', grasa: 'Magro',
    metodosCoccion: ['Estofado', 'Guiso'],
    temperaturaInternaIdeal: '85–90 °C', tiempoCoccionOrientativo: '1,5–2 horas',
    precioAproximado: 'Premium',
    descripcion: 'El ossobuco (hueso hueco en italiano) es el plato estrella de Milán. Las rodajas de jarrete de ternera con su tuétano expuesto se brasan lentamente en sofrito con vino blanco y gremolata (ralladura de limón, ajo y perejil). El tuétano del hueso central es la parte más codiciada por los comensales.',
    consejoCocina: 'Enharinar y sellar bien antes de brasear. La gremolata (ajo + limón + perejil picado) se añade al final, solo al servir: el frescor contrasta con la intensidad del guiso.',
    curiosidad: 'El ossobuco alla milanese debe, por tradición, servirse con risotto alla milanese (con azafrán): la combinación se considera un matrimonio culinario inseparable desde el siglo XIX. En Milán, servir ossobuco sin risotto en un restaurante tradicional es considerado un error imperdonable.',
  },
  {
    nombre: 'Hamburguesa de ternera', nombreAlternativo: 'Veal burger',
    animal: 'Ternera', parte: 'Picada de aguja y paleta de ternera',
    terneza: 'Tierno', grasa: 'Magro',
    metodosCoccion: ['Plancha', 'Parrilla'],
    temperaturaInternaIdeal: '71 °C', tiempoCoccionOrientativo: '3–4 min por lado',
    precioAproximado: 'Premium',
    descripcion: 'La hamburguesa de ternera tiene un sabor más suave y una textura más delicada que la de vacuno mayor. Por su menor contenido en grasa, debe tratarse con más cuidado para no resecarla. Es la elección habitual en restaurantes italianos y franceses que elevan la hamburguesa a la categoría de plato gourmet.',
    consejoCocina: 'Añadir un poco de mantequilla fría a la carne picada antes de formar las hamburguesas para compensar la falta de grasa y añadir sabor.',
    curiosidad: 'En Italia, la "polpetta" (albóndiga) de ternera tiene el mismo estatus icónico que la hamburguesa en EEUU, pero en versión estofada. La polpetta alla napoletana (en salsa de tomate) es el plato más asociado con el "comfort food" italiano, reproducido por las madres italianas de todo el mundo desde el siglo XVIII.',
  },
  {
    nombre: 'Redondo de ternera', nombreAlternativo: 'Veal round / Noix de veau',
    animal: 'Ternera', parte: 'Cadera (músculo redondo)',
    terneza: 'Tierno', grasa: 'Muy magro',
    metodosCoccion: ['Horno', 'Estofado'],
    temperaturaInternaIdeal: '65–70 °C', tiempoCoccionOrientativo: '1 hora al horno',
    precioAproximado: 'Medio',
    descripcion: 'El redondo de ternera es el corte de asado doméstico por excelencia en España. Su forma cilíndrica regular facilita la cocción uniforme. Muy magro, requiere protección durante el asado (bridado, tocino, o cocción en sus propios jugos) para no resecarse. Frío, en lonchas finas, es la base del vitello tonnato italiano.',
    consejoCocina: 'Bridar (atar) la pieza para mantener la forma. Dorar en aceite muy caliente por todos lados y terminar en horno a 160 °C con poca humedad.',
    curiosidad: 'El vitello tonnato (redondo de ternera frío con salsa de atún y alcaparras) es uno de los platos más sorprendentes de la cocina italiana: la combinación de carne de ternera y salsa de atún suena extraña pero es una receta piamontesa del siglo XVIII que encandila a quienes lo prueban por primera vez.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function GuiaCortesCarne() {
  const [animal, setAnimal] = useState<Animal | 'Todos'>('Todos');
  const [metodo, setMetodo] = useState<MetodoCoccion | 'Todos'>('Todos');
  const [busqueda, setBusqueda] = useState('');

  const cortesFiltrados = useMemo(() => {
    return CORTES.filter(c => {
      const matchAnimal = animal === 'Todos' || c.animal === animal;
      const matchMetodo = metodo === 'Todos' || c.metodosCoccion.includes(metodo as MetodoCoccion);
      const matchBusqueda = busqueda === '' ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.nombreAlternativo.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.parte.toLowerCase().includes(busqueda.toLowerCase());
      return matchAnimal && matchMetodo && matchBusqueda;
    });
  }, [animal, metodo, busqueda]);

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía de Cortes de Carne</h1>
        <p>45 cortes de vacuno, cerdo, cordero, pollo y ternera: técnicas, temperaturas y consejos</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── CONTROLES ── */}
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar por nombre, nombre alternativo o parte del animal..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar corte de carne"
          />
          <div className={styles.filtrosRow}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Animal:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por animal">
                <button
                  className={`${styles.filtroBtn} ${animal === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setAnimal('Todos')}
                >
                  Todos
                </button>
                {ANIMALES.map((a) => (
                  <button
                    key={a}
                    className={`${styles.filtroBtn} ${animal === a ? styles.filtroActivo : ''}`}
                    onClick={() => setAnimal(a)}
                  >
                    {ANIMAL_EMOJI[a]} {a}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Método de cocción:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por método de cocción">
                <button
                  className={`${styles.filtroBtn} ${metodo === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setMetodo('Todos')}
                >
                  Todos
                </button>
                {METODOS.map((m) => (
                  <button
                    key={m}
                    className={`${styles.filtroBtn} ${metodo === m ? styles.filtroActivo : ''}`}
                    onClick={() => setMetodo(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.contador} aria-live="polite">
            {cortesFiltrados.length} {cortesFiltrados.length === 1 ? 'corte' : 'cortes'}
          </p>
        </div>

        {/* ── GRID ── */}
        <div className={styles.grid}>
          {cortesFiltrados.length === 0 ? (
            <p className={styles.sinResultados}>No se encontraron cortes con esos filtros.</p>
          ) : (
            cortesFiltrados.map((corte) => (
              <article key={`${corte.animal}-${corte.nombre}`} className={styles.card}>
                {/* Header con badges */}
                <div className={styles.cardHeader}>
                  <span className={`${styles.animalBadge} ${ANIMAL_CLASS[corte.animal]}`}>
                    {ANIMAL_EMOJI[corte.animal]} {corte.animal}
                  </span>
                  <span className={styles.tiernezaBadge}>{corte.terneza}</span>
                  <span className={styles.grasaBadge}>{corte.grasa}</span>
                </div>

                {/* Nombre */}
                <div>
                  <h2 className={styles.nombre}>{corte.nombre}</h2>
                  <span className={styles.nombreAlternativo}>{corte.nombreAlternativo}</span>
                </div>

                {/* Parte del animal */}
                <p className={styles.parte}>
                  <span className={styles.sectionLabel}>Parte del animal</span>
                  {corte.parte}
                </p>

                {/* Métodos de cocción */}
                <div>
                  <span className={styles.sectionLabel}>Métodos de cocción</span>
                  <div className={styles.metodosTags}>
                    {corte.metodosCoccion.map((m) => (
                      <span key={m} className={styles.metodoPill}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Temperatura y tiempo */}
                <div className={styles.tempBox}>
                  <strong>Temperatura interna ideal</strong>
                  <span>{corte.temperaturaInternaIdeal}</span>
                  <strong>Tiempo orientativo</strong>
                  <span>{corte.tiempoCoccionOrientativo}</span>
                </div>

                {/* Precio */}
                <div className={styles.precioRow}>
                  <span className={styles.sectionLabel}>Precio:</span>
                  <span className={styles.precioPill}>{corte.precioAproximado}</span>
                </div>

                {/* Descripción */}
                <p className={styles.descripcion}>{corte.descripcion}</p>

                {/* Consejo de cocina */}
                <div className={styles.consejoBox}>
                  <strong>Consejo de cocina</strong>
                  <p>{corte.consejoCocina}</p>
                </div>

                {/* Curiosidad */}
                <div className={styles.curiosidadBox}>
                  <span className={styles.curiosidadIcon} aria-hidden="true">💡</span>
                  <p className={styles.curiosidadText}>{corte.curiosidad}</p>
                </div>
              </article>
            ))
          )}
        </div>

        {/* ── SECCIÓN EDUCATIVA v2.0 ── */}
        <EducationalSection
          title="El mundo de los cortes de carne: técnicas, temperaturas y tradición"
          subtitle="De la parrilla argentina al horno segoviano: guía completa para elegir y cocinar el corte perfecto"
        >
          <p>Esta guía es técnica y culinaria. Conviene recordar que el consumo de carne tiene un impacto ambiental documentado (huella de carbono, uso de agua y suelo) y que las condiciones de cría varían enormemente entre sistemas intensivos y extensivos. Si te importa el origen, busca etiquetas como ecológico, extensivo, IGP/DOP o certificaciones de bienestar animal.</p>

          {/* Tabla comparativa de animales */}
          <h3>Comparativa por animal</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Sabor característico</th>
                  <th>Terneza media</th>
                  <th>Mejor método</th>
                  <th>Precio relativo</th>
                  <th>Corte estrella</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🐄 Vacuno mayor</td>
                  <td>Intenso, umami, profundo</td>
                  <td>Variable (mucho corte a corte)</td>
                  <td>Parrilla / Estofado</td>
                  <td>Medio-muy premium</td>
                  <td>Chuletón</td>
                </tr>
                <tr>
                  <td>🐷 Cerdo ibérico</td>
                  <td>Bellota, untuoso, jamón caliente</td>
                  <td>Tierno a medio</td>
                  <td>Plancha rápida</td>
                  <td>Premium-muy premium</td>
                  <td>Secreto ibérico</td>
                </tr>
                <tr>
                  <td>🐑 Cordero</td>
                  <td>Herbáceo, lanolina, silvestre</td>
                  <td>Tierno a medio</td>
                  <td>Horno lento / Parrilla</td>
                  <td>Medio-premium</td>
                  <td>Chuletas</td>
                </tr>
                <tr>
                  <td>🐔 Pollo</td>
                  <td>Neutro, versátil, absorbe marinados</td>
                  <td>Tierno (si no se reseca)</td>
                  <td>Horno / Plancha</td>
                  <td>Económico</td>
                  <td>Muslo</td>
                </tr>
                <tr>
                  <td>🐮 Ternera</td>
                  <td>Suave, láctico, delicado</td>
                  <td>Muy tierno</td>
                  <td>Plancha / Estofado</td>
                  <td>Medio-premium</td>
                  <td>Filete / Ossobuco</td>
                </tr>
                <tr>
                  <td>🐷 Cerdo convencional</td>
                  <td>Suave, graso, versátil</td>
                  <td>Tierno</td>
                  <td>Horno / Estofado</td>
                  <td>Económico</td>
                  <td>Costillas</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4 escenarios */}
          <h3>¿Qué corte elijo según la ocasión?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Cena especial de fin de semana</h4>
              <p>Chuletón de vaca gallega (600-800 g) o solomillo. Parrilla o plancha de hierro muy caliente. Solo sal gruesa. El corte hace todo el trabajo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Guiso para toda la semana</h4>
              <p>Rabo de toro, morcillo o carrillada. Cocción de 3-4 horas el domingo. Mejora con el reposo: el martes está mejor que el domingo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Barbacoa con amigos</h4>
              <p>Costillas de cerdo (método 3-2-1), falda de vacuno marinada y alitas de pollo. Tres carnes, tres texturas, todos contentos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Entre semana rápido y económico</h4>
              <p>Muslos de pollo al horno (30 min), lomo de cerdo en salmuera o hamburguesa de aguja. Menos de 8 € por persona, resultado de restaurante.</p>
            </div>
          </div>

          {/* 6 FAQ */}
          <h3>Preguntas frecuentes</h3>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Qué es más importante: el corte o la calidad del animal?</strong>
              <p>La calidad del animal siempre. Un chuletón mediocre de un animal industrial será inferior a una aguja de excelente calidad bien cocinada. El corte determina el método de cocción; la calidad determina el sabor final.</p>
              <span className={styles.faqTip}>Buscar denominaciones de origen, crianza en extensivo o certificados de bienestar animal.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Por qué un termómetro de cocina es imprescindible?</strong>
              <p>La diferencia entre 54 °C y 65 °C en un solomillo es la diferencia entre un plato extraordinario y uno mediocre. El color y el tiempo son orientativos; la temperatura interior es la única medida fiable de punto de cocción.</p>
              <span className={styles.faqTip}>Un termómetro de sonda digital de buena calidad cuesta 15-25 €. Es la mejor inversión de cocina después de un buen cuchillo.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuándo salar la carne?</strong>
              <p>Dos opciones: sal gruesa justo antes de cocinar (no da tiempo a que deshidrate) o sal fina 40-60 minutos antes (la carne reabsorbe la humedad). Nunca en el punto intermedio (5-30 min antes) que es cuando la carne pierde más jugos.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre vacuno, ternera y buey?</strong>
              <p>La ternera es el animal de menos de 12 meses (carne clara, sabor suave). El vacuno es la vaca adulta (carne roja, sabor más intenso). El buey es el macho bovino castrado y engordado durante años (máxima infiltración grasa, sabor excepcional). El buey auténtico es rarísimo y muy caro.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Es seguro comer carne de cerdo rosada?</strong>
              <p>Sí, desde 2011 el USDA americano (y la mayoría de autoridades europeas) establece 63 °C como temperatura segura para el cerdo, lo que permite un punto rosado. La triquinosis, que motivaba la regla histórica de cocción total, se ha prácticamente eliminado en la cabaña porcina comercial controlada.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Por qué hay que reposar la carne antes de cortar?</strong>
              <p>Durante la cocción, los jugos migran hacia el exterior. El reposo (5-10 min cubierto) permite que se redistribuyan uniformemente. Cortar inmediatamente produce un "baño" de jugo en el plato y una carne más seca. Un solomillo reposa 5 min; un chuletón de 1 kg, al menos 10-15 min.</p>
            </li>
          </ul>

          {/* 5 pasos */}
          <h3>Cómo elegir el corte perfecto paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Define el método de cocción disponible.</strong> ¿Tienes parrilla, plancha, horno? El método limita los cortes posibles: no se hace un morcillo a la plancha ni un solomillo en estofado de 3 horas.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Decide el tiempo disponible.</strong> Cortes rápidos (plancha, parrilla): solomillo, entrecot, secreto, chuletas. Cortes lentos (estofado, horno): rabo, morcillo, costillas, pecho. El tiempo es el primer filtro.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Ajusta el presupuesto.</strong> Los cortes económicos bien cocinados superan a los caros mal tratados. Una falda marinada bien cocinada supera a un solomillo pasado de cocción. El conocimiento vale más que el presupuesto.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Elige el animal según el sabor deseado.</strong> Suave y neutro: pollo o ternera. Intenso y profundo: vacuno mayor. Untuoso y con personalidad: cerdo ibérico. Silvestre y aromático: cordero.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Compra en una buena carnicería y pregunta.</strong> Un buen carnicero es el mejor asesor gastronómico: conoce la procedencia, el tiempo de maduración y cuál es el mejor corte del día. La relación con el carnicero es una inversión a largo plazo.
              </div>
            </div>
          </div>

          {/* 5 tips */}
          <h3>Consejos de los profesionales</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <h4>Temperatura de nevera</h4>
              <p>Sacar la carne 30-60 min antes de cocinar (1 hora para cortes gruesos). La carne fría de nevera produce una cocción desigual: exterior quemado, interior frío.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔥</span>
              <h4>Temperatura alta para la costra</h4>
              <p>La reacción de Maillard (la costra dorada) ocurre por encima de 140 °C. La sartén o parrilla debe estar muy caliente antes de poner la carne para que no cueza sino que selle.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏳</span>
              <h4>El reposo no es opcional</h4>
              <p>Es la diferencia entre amateur y profesional. Cubrir con papel de aluminio (no cerrar hermético) y dejar reposar. Los jugos se redistribuyen y la temperatura interna sube 2-3 °C.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧂</span>
              <h4>La sal potencia, no disimula</h4>
              <p>La carne de calidad necesita poca sal. Sal gruesa para cortes a la parrilla. Sal fina para marinados. Nunca mezclar sal y azúcar sin intención: es una combinación potente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🥩</span>
              <h4>El corte perpendicular a la fibra</h4>
              <p>Siempre cortar perpendicularmente a la dirección de las fibras musculares. Cortar a favor de la fibra produce tiras fibrosas y difíciles de masticar; cortando transversal, cada bocado es más corto y tierno.</p>
            </div>
          </div>

          {/* Warning box con errores */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes al cocinar carne</strong>
            </div>
            <ul className={styles.warningList}>
              <li>Cocinar la carne fría directamente de la nevera: la cocción es desigual y se pierde jugosidad en el centro.</li>
              <li>Presionar la hamburguesa o el filete con la espátula: expulsa los jugos y reseca la carne innecesariamente.</li>
              <li>Cortar la carne inmediatamente tras cocinar: los jugos escapan al plato y el resultado queda seco.</li>
              <li>Usar el color como único indicador de cocción: el interior puede estar crudo con una costra oscura o sobrecogido sin coloración.</li>
              <li>Añadir aceite fría en la sartén y poner la carne: el aceite debe estar caliente antes de añadir la carne para sellar correctamente.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-cortes-carne')} />
        <ShareCard appName="guia-cortes-carne" />
      </main>

      <Footer appName="guia-cortes-carne" />
    </div>
  );
}
