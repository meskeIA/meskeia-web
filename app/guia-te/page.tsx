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
import styles from './GuiaTe.module.css';

type FamiliaTe = 'Verde' | 'Negro' | 'Oolong' | 'Blanco' | 'Pu-erh' | 'Amarillo' | 'Rooibos';
type NivelCafeina = 'Sin cafeína' | 'Baja' | 'Media' | 'Alta';

interface VariedadTe {
  nombre: string;
  nombreOriginal: string;
  familia: FamiliaTe;
  pais: string;
  region: string;
  temperatura: string;
  tiempoInfusion: string;
  cantidadPorTaza: string;
  cafeina: NivelCafeina;
  notasDeSabor: string[];
  descripcion: string;
  curiosidad: string;
}

const CAFEINA_NIVEL: Record<NivelCafeina, number> = {
  'Sin cafeína': 0,
  'Baja': 1,
  'Media': 2,
  'Alta': 3,
};

const FAMILIAS: FamiliaTe[] = ['Verde', 'Negro', 'Oolong', 'Blanco', 'Pu-erh', 'Amarillo', 'Rooibos'];

const VARIEDADES: VariedadTe[] = [
  // ── TÉ VERDE ───────────────────────────────────────────────────────────────
  {
    nombre: 'Sencha',
    nombreOriginal: '煎茶',
    familia: 'Verde',
    pais: 'Japón',
    region: 'Shizuoka / Kyoto',
    temperatura: '70–80°C',
    tiempoInfusion: '1–2 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Hierba fresca', 'Umami', 'Vegetal', 'Notas marinas'],
    descripcion: 'El té verde más consumido en Japón, representando más del 80% de la producción nacional. Las hojas se vaporizan nada más recolectarse para detener la oxidación, preservando su color verde intenso y sus notas vegetales frescas. Existen decenas de subvariedades según la región y el grado de sombreado.',
    curiosidad: 'El vapor japonés (mushi) que se aplica al Sencha fue una innovación del siglo XVIII que lo diferencia radicalmente del método de secado en wok chino (pan-fired). Esa diferencia de proceso es la razón principal por la que los tés verdes japoneses tienen sabor umami más marcado que los chinos.',
  },
  {
    nombre: 'Gyokuro',
    nombreOriginal: '玉露',
    familia: 'Verde',
    pais: 'Japón',
    region: 'Uji (Kyoto) / Yame (Fukuoka)',
    temperatura: '50–60°C',
    tiempoInfusion: '2–3 min',
    cantidadPorTaza: '3–4 g / 80 ml',
    cafeina: 'Alta',
    notasDeSabor: ['Umami intenso', 'Algas', 'Dulzor profundo', 'Floral'],
    descripcion: 'El té verde de mayor prestigio en Japón. Se cultiva bajo sombreado del 90% durante las últimas 3 semanas antes de la cosecha, lo que dispara la producción de L-teanina y clorofila. Se prepara con muy poca agua muy fría, en pocas cantidades, como una experiencia de sabor concentrada.',
    curiosidad: 'Gyokuro significa "perla de rocío". El sombreado artificial que lo define surgió en 1835 en el distrito de Uji. La privación de luz reduce la producción de catequinas amargas y aumenta la L-teanina (responsable del umami), dando el perfil dulce y profundo que lo hace único en el mundo del té.',
  },
  {
    nombre: 'Dragon Well (Longjing)',
    nombreOriginal: '龍井茶',
    familia: 'Verde',
    pais: 'China',
    region: 'Hangzhou, Zhejiang',
    temperatura: '75–85°C',
    tiempoInfusion: '2–3 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Castaña', 'Vegetal dulce', 'Floral suave', 'Tostado ligero'],
    descripcion: 'Uno de los tés más famosos y venerados de China, con historia de más de 1.200 años. Sus hojas planas y en forma de lanza son el resultado de un secado manual en wok. El grado más apreciado, "Ming Qian", se cosecha antes del festival Qingming (principios de abril), con los brotes más tiernos.',
    curiosidad: 'El Longjing fue declarado "tributo imperial" durante la dinastía Qing. El emperador Qianlong visitó el lago Oeste de Hangzhou en 1751 y quedó tan impresionado por el Longjing que otorgó a 18 plantas de té concretas el estatus de "plantas imperiales". Esas 18 plantas todavía existen y sus hojas se subastaron en 2021 por más de 200.000 euros el kilo.',
  },
  {
    nombre: 'Gunpowder',
    nombreOriginal: '珠茶',
    familia: 'Verde',
    pais: 'China',
    region: 'Zhejiang (exportado a Marruecos)',
    temperatura: '80°C',
    tiempoInfusion: '1–3 min',
    cantidadPorTaza: '2 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Ahumado suave', 'Mineral', 'Intenso', 'Hierba seca'],
    descripcion: 'Las hojas se enrollan en forma de bolitas compactas que recuerdan a la pólvora (de ahí su nombre inglés del siglo XVII). Esta forma compacta lo hace más resistente al transporte y prolonga su frescura. Es la base del famoso "té de menta marroquí", donde se combina con hojas de hierbabuena fresca.',
    curiosidad: 'El té de menta marroquí se prepara casi exclusivamente con Gunpowder chino desde el siglo XIX, cuando los comerciantes europeos introdujeron este té en África del Norte. Marruecos importa hoy más de 60.000 toneladas de Gunpowder al año, siendo el mayor importador mundial de este té.',
  },
  {
    nombre: 'Genmaicha',
    nombreOriginal: '玄米茶',
    familia: 'Verde',
    pais: 'Japón',
    region: 'Todo Japón',
    temperatura: '75–80°C',
    tiempoInfusion: '1–2 min',
    cantidadPorTaza: '3 g / 200 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Tostado', 'Arroz', 'Nuez', 'Vegetal suave'],
    descripcion: 'Una mezcla única de té verde Bancha o Sencha con arroz integral tostado (genmai). El arroz aporta notas cálidas de tostado y nuez que contrastan con la frescura vegetal del té. Algunos granos de arroz "revientan" durante el tostado, dando lugar a las palomitas que se ven en la mezcla. Muy apreciado en otoño e invierno.',
    curiosidad: 'El Genmaicha fue originalmente llamado "té del pueblo pobre" en Japón, porque el arroz servía para estirar una cantidad menor de hojas de té. Hoy es un té premium buscado por sus notas únicas. Cuando se le añade Matcha molido, se llama Matcha-iri Genmaicha, con una intensidad extra de umami.',
  },
  {
    nombre: 'Bancha',
    nombreOriginal: '番茶',
    familia: 'Verde',
    pais: 'Japón',
    region: 'Todo Japón',
    temperatura: '80–90°C',
    tiempoInfusion: '30 s – 1 min',
    cantidadPorTaza: '3–4 g / 200 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Herbáceo suave', 'Ligeramente astringente', 'Paja', 'Tierra'],
    descripcion: 'El té de uso diario en muchos hogares japoneses. Se elabora con las hojas más grandes y maduras cosechadas después del Sencha, lo que lo hace más económico y con menor cafeína. Su sabor sencillo y sin pretensiones lo convierte en el compañero perfecto para las comidas. Es también la base del Hojicha.',
    curiosidad: 'El Bancha tiene el menor contenido en cafeína de todos los tés verdes japoneses (menos de 10 mg por taza) porque las hojas maduras contienen menos de este compuesto que los brotes jóvenes. Por esta razón es el té que se recomienda en Japón para niños pequeños y personas mayores.',
  },
  {
    nombre: 'Hojicha',
    nombreOriginal: '焙じ茶',
    familia: 'Verde',
    pais: 'Japón',
    region: 'Kyoto / Ishikawa',
    temperatura: '90–95°C',
    tiempoInfusion: '30 s – 1 min',
    cantidadPorTaza: '3–4 g / 200 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Tostado', 'Caramelo', 'Chocolate suave', 'Ahumado dulce'],
    descripcion: 'Té verde (normalmente Bancha) tostado a alta temperatura en wok o cilindro giratorio. El tostado destruye gran parte de la cafeína y la clorofila, transformando las hojas de color verde a marrón rojizo. El resultado es un té cálido, reconfortante y sin amargura. Ideal para la tarde o la noche.',
    curiosidad: 'El Hojicha fue creado por accidente en Kioto en 1920. Un comerciante de té decidió tostar sus hojas sobrantes de Bancha para aprovecharlas en lugar de desecharlas, y el resultado fue tan bien recibido que se convirtió en un nuevo estilo. Hoy el helado de Hojicha y el Hojicha latte son tendencia gastronómica mundial.',
  },
  {
    nombre: 'Kabusecha',
    nombreOriginal: '冠茶',
    familia: 'Verde',
    pais: 'Japón',
    region: 'Mie / Shizuoka',
    temperatura: '60–70°C',
    tiempoInfusion: '1–2 min',
    cantidadPorTaza: '3 g / 150 ml',
    cafeina: 'Media',
    notasDeSabor: ['Umami medio', 'Dulzor vegetal', 'Floral', 'Océano suave'],
    descripcion: 'El "té cubierto" (kabuse significa cubrir) se somete a sombreado parcial durante 7–14 días antes de la cosecha, a diferencia del Gyokuro (20–30 días). El resultado es un té con más umami que el Sencha pero menos intenso que el Gyokuro: el punto medio perfecto de la gama japonesa de tés sombreados.',
    curiosidad: 'El sombreado del Kabusecha se realiza con mallas especiales que reducen la luz al 70%. Las plantas responden aumentando la producción de clorofila (de ahí el color verde más oscuro) y de L-teanina (responsable del umami). Este proceso se descubrió observando que las plantas de té crecen naturalmente bajo la sombra de árboles en las laderas.',
  },
  {
    nombre: 'Shincha',
    nombreOriginal: '新茶',
    familia: 'Verde',
    pais: 'Japón',
    region: 'Todo Japón (primera cosecha)',
    temperatura: '65–75°C',
    tiempoInfusion: '1 min',
    cantidadPorTaza: '3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Frescura intensa', 'Hierba nueva', 'Dulzor natural', 'Umami delicado'],
    descripcion: 'No es una variedad botánica sino la primera cosecha del año (late abril – mayo). Los brotes de invierno concentran aminoácidos y azúcares a lo largo de meses, dando un perfil de frescura y dulzor sin igual. Es el "beaujolais nouveau" del mundo del té, esperado con entusiasmo por los aficionados japoneses cada primavera.',
    curiosidad: 'La llegada del Shincha se anuncia con el mismo entusiasmo en Japón que la vendimia en Europa. Se vende durante pocas semanas y a precios premium. La expresión "Shincha wo nomu" (beber Shincha) es símbolo de renovación en la cultura japonesa, ligada a la filosofía del mono no aware (la belleza de lo efímero).',
  },

  // ── TÉ NEGRO ──────────────────────────────────────────────────────────────
  {
    nombre: 'Darjeeling 1st Flush',
    nombreOriginal: 'दार्जिलिंग',
    familia: 'Negro',
    pais: 'India',
    region: 'Darjeeling, Bengala Occidental',
    temperatura: '85–90°C',
    tiempoInfusion: '3–4 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Moscatel', 'Floral', 'Miel', 'Verde ligero', 'Astringencia fina'],
    descripcion: 'Considerado el "champán de los tés". La primera cosecha (marzo-abril) de las plantaciones del Himalaya produce un té semifermentado de color claro con las notas más delicadas. El carácter "muscatel" (sabor a uva moscatel) es su sello distintivo. Solo 87 estates registradas pueden producir Darjeeling auténtico.',
    curiosidad: 'Más Darjeeling se vende en el mundo del que se produce en Darjeeling. Con una producción anual de ~10.000 toneladas, se venden en el mercado global más de 40.000 toneladas bajo ese nombre. Solo el té con certificado de origen del Tea Board of India garantiza la procedencia real.',
  },
  {
    nombre: 'Assam',
    nombreOriginal: 'আসাম চাহ',
    familia: 'Negro',
    pais: 'India',
    region: 'Valle del Brahmaputra, Assam',
    temperatura: '90–95°C',
    tiempoInfusion: '3–5 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Alta',
    notasDeSabor: ['Malta', 'Chocolate oscuro', 'Tierra húmeda', 'Astringente'],
    descripcion: 'El té negro más producido del mundo, cultivado a nivel del mar en el Valle del Brahmaputra. La especie Camellia sinensis assamica (diferente de la china) produce hojas más grandes, un cuerpo más intenso y más cafeína. Es la base del "English Breakfast" y del "té con leche" indio (chai).',
    curiosidad: 'La variedad Camellia sinensis assamica fue descubierta en 1823 en estado silvestre en Assam, con hojas enormes comparadas con la variedad china conocida. Los británicos tardaron 20 años en convertirla en base de una industria. Hoy Assam produce más de 600.000 toneladas/año: la mayor concentración de plantaciones de té del mundo en un solo valle.',
  },
  {
    nombre: 'Ceylon',
    nombreOriginal: 'සිලෝන් තේ',
    familia: 'Negro',
    pais: 'Sri Lanka',
    region: 'Uva / Nuwara Eliya / Dimbula',
    temperatura: '90–95°C',
    tiempoInfusion: '3–5 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Alta',
    notasDeSabor: ['Cítrico', 'Menta suave', 'Especias', 'Floral limpio'],
    descripcion: 'Sri Lanka (antigua Ceilán) produce algunos de los tés negros más reconocibles del mundo, especialmente los de la región de Nuwara Eliya, a 1.800 metros de altitud. El clima y el suelo de la isla imprimen notas cítricas y mentas características. La industria nació en 1867 cuando la plaga destruyó las plantaciones de café.',
    curiosidad: 'Sri Lanka se convirtió en productor de té por necesidad: en 1869 una plaga de hongo (Hemileia vastatrix) destruyó prácticamente toda la producción de café de la isla en pocos años. El escocés James Taylor plantó las primeras hojas de té en 1867 como alternativa. Hoy Sri Lanka es el cuarto exportador mundial.',
  },
  {
    nombre: 'Earl Grey',
    nombreOriginal: 'Earl Grey',
    familia: 'Negro',
    pais: 'Reino Unido / China',
    region: 'Blend con bergamota de Calabria',
    temperatura: '90–95°C',
    tiempoInfusion: '3–4 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Alta',
    notasDeSabor: ['Bergamota', 'Floral', 'Cítrico', 'Negro suave'],
    descripcion: 'El blend aromatizado más famoso del mundo: té negro (generalmente China o Ceylon) perfumado con aceite esencial de bergamota, una fruta cítrica cultivada principalmente en Calabria, Italia. Su perfil floral-cítrico inconfundible lo convierte en el té más reconocible fuera de Asia.',
    curiosidad: 'El nombre hace referencia al Primer Ministro británico Charles Grey (1764-1845), aunque la historia de por qué lo lleva así es confusa y posiblemente apócrifa. La leyenda dice que un diplomático chino le regaló el blend. Lo que sí es cierto es que su popularidad en el Reino Unido es tal que genera más de 500 millones de tazas al año.',
  },
  {
    nombre: 'Lapsang Souchong',
    nombreOriginal: '正山小種',
    familia: 'Negro',
    pais: 'China',
    region: 'Wuyishan, Fujian',
    temperatura: '90–95°C',
    tiempoInfusion: '3–5 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Ahumado intenso', 'Pino', 'Madera', 'Vainilla ahumada', 'Cuero'],
    descripcion: 'El té más polarizante del mundo: se ahúma sobre madera de pino de las montañas Wuyi, desarrollando un perfil ahumado intensísimo que divide a los aficionados entre adoración y rechazo. Es uno de los tés negros más antiguos de China y el primero en llegar a Europa en el siglo XVII.',
    curiosidad: 'Según la leyenda, el Lapsang Souchong nació durante las guerras del siglo XVII cuando los soldados ocuparon los secaderos de té. Los productores, con prisa por secar el té antes de que se echara a perder, lo colocaron sobre fuego de pinos. El resultado ahumado gustó tanto en Europa que se convirtió en un producto de exportación.',
  },
  {
    nombre: 'Yunnan Golden',
    nombreOriginal: '云南金芽',
    familia: 'Negro',
    pais: 'China',
    region: 'Yunnan',
    temperatura: '90–95°C',
    tiempoInfusion: '3–4 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Chocolate', 'Miel', 'Caramelo', 'Especias dulces', 'Suave'],
    descripcion: 'Los tés negros de Yunnan son los únicos del mundo que utilizan la misma variedad botánica que el pu-erh (Camellia sinensis assamica de la variedad yunnanensis). Sus "yemas doradas" (tippy golden) son brotes cubiertos de pelos dorados que indican máxima calidad. El perfil es excepcionalmente suave y dulce para un negro.',
    curiosidad: 'Yunnan es la región de China con mayor biodiversidad de Camellia sinensis: se han identificado más de 200 variedades botánicas distintas, algunas de ellas árboles silvestres de más de 1.000 años de antigüedad. Los tés de árboles centenarios (gushu) se cotizan entre los más caros del mundo, tanto en versión negra como pu-erh.',
  },
  {
    nombre: 'English Breakfast',
    nombreOriginal: 'English Breakfast',
    familia: 'Negro',
    pais: 'Reino Unido (blend)',
    region: 'Assam + Ceylon + Kenia',
    temperatura: '95–100°C',
    tiempoInfusion: '3–5 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Alta',
    notasDeSabor: ['Malta', 'Astringente', 'Robusto', 'Intenso'],
    descripcion: 'El blend más clásico de la tradición británica: una mezcla de tés negros robustos diseñada para aguantar la adición de leche y azúcar. Surgió en el siglo XIX cuando los blenders britanicos combinaban tés de distintas procedencias para conseguir un sabor consistente y económico. Hoy su fórmula varía según el productor.',
    curiosidad: 'El English Breakfast fue originalmente un blend escocés, no inglés. El comerciante de té neoyorquino Richard Davies popularizó el nombre en EE.UU. en 1843. En el Reino Unido, el consumo de té con leche es tan cultural que el debate sobre si echar primero la leche o el té ha generado estudios académicos y un posicionamiento oficial de la Sociedad Real de Química (2003): primero el té.',
  },
  {
    nombre: 'Keemun',
    nombreOriginal: '祁門紅茶',
    familia: 'Negro',
    pais: 'China',
    region: 'Qimen, Anhui',
    temperatura: '90°C',
    tiempoInfusion: '3–4 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Orquídea', 'Frutal', 'Vino tinto suave', 'Chocolate amargo'],
    descripcion: 'Considerado el mejor té negro de China, el Keemun se caracteriza por su suave acidez frutal y notas florales que los expertos llaman "fragancia de orquídea y rosas". Es la base del English Breakfast clásico y del té de los cócteles. Su producción se inició en 1875 y hoy ostenta Indicación Geográfica Protegida.',
    curiosidad: 'El Keemun fue creado en 1875 por Yu Ganchen, un funcionario del gobierno chino que había aprendido las técnicas de producción de té negro en Fujian y las aplicó a las plantaciones de Qimen (entonces conocido solo por su té verde). En menos de 20 años se convirtió en el té negro más exportado de China a Europa.',
  },

  // ── TÉ OOLONG ─────────────────────────────────────────────────────────────
  {
    nombre: 'Tie Guan Yin',
    nombreOriginal: '鐵觀音',
    familia: 'Oolong',
    pais: 'China',
    region: 'Anxi, Fujian',
    temperatura: '85–95°C',
    tiempoInfusion: '1–3 min (múltiples)',
    cantidadPorTaza: '5–7 g / 150 ml',
    cafeina: 'Media',
    notasDeSabor: ['Floral intenso', 'Orquídea', 'Mantequilla', 'Fruta suave'],
    descripcion: 'El oolong más famoso del mundo, cuyo nombre significa "Diosa de Hierro de la Misericordia". Se produce en la región de Anxi desde el siglo XVIII y puede prepararse en estilo tradicional (oxidación media, más floral) o moderno (oxidación baja, más verde y fresco). Permite 5–7 infusiones, cada una diferente.',
    curiosidad: 'La leyenda cuenta que una pobre tetera devota de Guan Yin (la diosa de la misericordia) mantenía limpio su templo en ruinas. La diosa le recompensó guiándola hasta un brote de té especial. Hoy el Tie Guan Yin de máxima calidad puede alcanzar precios de 3.000 euros/kg en subastas de Anxi.',
  },
  {
    nombre: 'Da Hong Pao',
    nombreOriginal: '大紅袍',
    familia: 'Oolong',
    pais: 'China',
    region: 'Wuyishan, Fujian',
    temperatura: '95–100°C',
    tiempoInfusion: '30 s – 2 min (múltiples)',
    cantidadPorTaza: '5–8 g / 150 ml',
    cafeina: 'Media',
    notasDeSabor: ['Mineral', 'Tostado', 'Chocolate oscuro', 'Ciruela', 'Tierra'],
    descripcion: 'El "té rojo de la gran capa" es posiblemente el oolong más famoso de China y uno de los más costosos del mundo. Se cultiva en las rocas volcánicas de las montañas Wuyi, y ese "sabor mineral de roca" (yan yun) es su característica definitoria. Los 6 arbustos madre originales están protegidos por el Estado chino.',
    curiosidad: 'Los 6 arbustos madre de Da Hong Pao de las montañas Wuyi tienen más de 350 años y están protegidos por guardias las 24 horas. En 2005, 20 gramos de ese té (de los arbustos originales) se subastaron por 208.000 USD. El gobierno chino dejó de vender té de esos arbustos en 2006. Lo que se vende hoy son clones vegetativos.',
  },
  {
    nombre: 'Oriental Beauty',
    nombreOriginal: '東方美人',
    familia: 'Oolong',
    pais: 'Taiwán',
    region: 'Hsinchu / Miaoli',
    temperatura: '85–90°C',
    tiempoInfusion: '2–4 min',
    cantidadPorTaza: '3–5 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Miel', 'Fruta madura', 'Moscatel', 'Madera dulce', 'Vainilla'],
    descripcion: 'El único té cuyo proceso de producción depende de un insecto. La pequeña cicadela verde (Jacobiasca formosana) muerde las hojas jóvenes, activando una respuesta de defensa química de la planta que produce los compuestos responsables de sus notas únicas de miel y fruta madura. Los agricultores bienvenían la plaga que otros combatían.',
    curiosidad: 'El nombre "Oriental Beauty" se lo dio la reina Victoria en el siglo XIX, cuando un comerciante británico le presentó este té inusual. La reina quedó tan impresionada por su perfil único que lo bautizó con ese nombre. En Taiwán también se conoce como "Champagne Tea" (té champán) o "Bai Hao Oolong" (oolong de pelo blanco).',
  },
  {
    nombre: 'Dong Ding',
    nombreOriginal: '凍頂烏龍',
    familia: 'Oolong',
    pais: 'Taiwán',
    region: 'Nantou',
    temperatura: '90–95°C',
    tiempoInfusion: '1–3 min (múltiples)',
    cantidadPorTaza: '5–7 g / 150 ml',
    cafeina: 'Media',
    notasDeSabor: ['Tostado', 'Caramelo', 'Flor de osmanto', 'Mantequilla'],
    descripcion: 'El oolong taiwanés más clásico, producido en la "montaña congelada" (Dong Ding). Se caracteriza por una oxidación media y un tueste moderado que equilibra lo floral con lo tostado. La variedad Qingxin (corazón verde) cultivada aquí produce uno de los oolongs más vendidos del mundo.',
    curiosidad: 'El Dong Ding llegó a Taiwán en 1855 cuando Lin Fengchi, tras estudiar el cultivo del té en Fujian, China, trajo 36 plantas de vuelta a su aldea en la montaña Dong Ding. Ese viaje fundacional de un solo hombre dio origen a toda una industria que hoy exporta té a más de 60 países.',
  },
  {
    nombre: 'Ali Shan',
    nombreOriginal: '阿里山烏龍',
    familia: 'Oolong',
    pais: 'Taiwán',
    region: 'Ali Shan, Chiayi',
    temperatura: '85–90°C',
    tiempoInfusion: '2–3 min',
    cantidadPorTaza: '4–6 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Floral', 'Leche', 'Almendra', 'Fruta tropical', 'Delicado'],
    descripcion: 'Producido a 1.000–1.600 metros en las montañas de Alishan, uno de los principales destinos turísticos de Taiwán. La niebla persistente ralentiza la maduración de las hojas, concentrando aromas. Su estilo típico es "nai xiang" (fragancia de leche), apreciado por su suavidad y notas florales.',
    curiosidad: 'La "fragancia de leche" del Ali Shan no proviene de ningún proceso artificial: es resultado de la nubosidad permanente, las temperaturas frescas de montaña y la variedad Qingxin cultivada a esa altitud. Algunos productores sí producen versiones perfumadas artificialmente (Ali Shan milk oolong), que son controvertidas entre los puristas.',
  },
  {
    nombre: 'Mi Lan Xiang',
    nombreOriginal: '蜜蘭香',
    familia: 'Oolong',
    pais: 'China',
    region: 'Chaozhou, Guangdong',
    temperatura: '90–95°C',
    tiempoInfusion: '30 s – 2 min (múltiples)',
    cantidadPorTaza: '6–8 g / 120 ml',
    cafeina: 'Media',
    notasDeSabor: ['Miel de lichi', 'Orquídea', 'Fruta tropical', 'Floral persistente'],
    descripcion: 'El "oolong de miel y orquídea" de la región de Chaozhou, elaborado con el método gongfu (kung fu tea), usando pequeñas teteras de barro y múltiples infusiones cortas. Este oolong de hoja única suelta revela capas de aromas distintos en cada infusión, desde lo floral hasta lo frutado.',
    curiosidad: 'El "té gongfu" (功夫茶) de Chaozhou es considerado el precursor de toda la cultura del té japonés. Los rituales de preparación con teteras pequeñas y múltiples infusiones que hoy se asocian con Japón en realidad se originaron en la región de Chaozhou hace más de 500 años. El Mi Lan Xiang es el té de ceremonia por excelencia en esta tradición.',
  },

  // ── TÉ BLANCO ─────────────────────────────────────────────────────────────
  {
    nombre: 'Silver Needle',
    nombreOriginal: '白毫銀針',
    familia: 'Blanco',
    pais: 'China',
    region: 'Fuding / Zhenghe, Fujian',
    temperatura: '75–85°C',
    tiempoInfusion: '3–5 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Miel suave', 'Melocotón', 'Floral muy delicado', 'Dulzor limpio'],
    descripcion: 'El "rey de los tés blancos": solo yemas cubiertas de finos pelos plateados, cosechadas en primavera durante una ventana de pocos días. El procesado mínimo (solo marchitado y secado) preserva los antioxidantes de forma excepcional. Es uno de los tés más puros del mundo.',
    curiosidad: 'Las yemas del Silver Needle se cosechan durante una ventana muy estrecha (primera semana de marzo en Fuding) y con reglas estrictas: no se puede cosechar con lluvia, rocío, escarcha ni cuando el recolector lleva las manos perfumadas. Estas condiciones dan una producción muy limitada que hace de los mejores lotes un producto de coleccionista.',
  },
  {
    nombre: 'White Peony',
    nombreOriginal: '白牡丹',
    familia: 'Blanco',
    pais: 'China',
    region: 'Fujian',
    temperatura: '75–85°C',
    tiempoInfusion: '3–5 min',
    cantidadPorTaza: '2–3 g / 200 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Floral', 'Melocotón', 'Hierba suave', 'Miel ligera'],
    descripcion: 'Elaborado con yemas y las dos primeras hojas, el White Peony ofrece más cuerpo y complejidad que el Silver Needle con un precio más accesible. La mezcla de yemas plateadas y hojas verdes le da un aspecto visual único. Es el té blanco más vendido y el favorito de muchos iniciados.',
    curiosidad: 'El nombre "peonía blanca" proviene del aspecto de las hojas secas: las yemas plateadas (pistilo) rodeadas de hojas verdes (pétalos) recuerdan visualmente a la flor de la peonía. Este té ganó fama internacional en los años 90 cuando estudios de la Escuela de Salud Pública de Harvard lo vincularon con propiedades antioxidantes excepcionales.',
  },
  {
    nombre: 'Shou Mei',
    nombreOriginal: '壽眉',
    familia: 'Blanco',
    pais: 'China',
    region: 'Fujian',
    temperatura: '80–90°C',
    tiempoInfusion: '3–5 min',
    cantidadPorTaza: '3–4 g / 200 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Frutal', 'Madera suave', 'Miel añeja', 'Floral dulce'],
    descripcion: 'El té blanco más económico y con más cuerpo, elaborado con hojas más maduras. "Shou Mei" significa "ceja del hombre longevo". A diferencia de los otros blancos, mejora notablemente con el añejamiento: con 5–10 años desarrolla notas de miel profunda y ciruela que lo hacen comparable a un pu-erh blanco.',
    curiosidad: 'El Shou Mei es el té blanco que mejor responde al envejecimiento, algo inusual en tés blancos. En China se conservan colecciones de Shou Mei de más de 20 años que se venden a precios de coleccionista. Los tés blancos añejos (Lao Bai Cha) han ganado popularidad explosiva en el mercado chino desde 2015.',
  },
  {
    nombre: 'Moonlight White',
    nombreOriginal: '月光白',
    familia: 'Blanco',
    pais: 'China',
    region: 'Jinggu, Yunnan',
    temperatura: '80–85°C',
    tiempoInfusion: '3–5 min',
    cantidadPorTaza: '3 g / 200 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Dulzor de miel', 'Dátil', 'Flor de loto', 'Madera dulce'],
    descripcion: 'Producido en Yunnan con la misma variedad assamica del pu-erh, el Moonlight White tiene hojas con cara superior oscura y envés plateado, como si fueran iluminadas por la luna. El marchitado se realiza por la noche, alejado de la luz directa. Su perfil es más intenso y dulce que los blancos de Fujian.',
    curiosidad: 'El Moonlight White debe su nombre al proceso de marchitado nocturno que impide la exposición al sol directo. La tradición local dice que las hojas "absorben la energía de la luna" durante este proceso. Científicamente, el marchitado nocturno a temperaturas más bajas produce una oxidación más lenta y controlada que da el perfil dulce característico.',
  },
  {
    nombre: 'Fujian White (Gong Mei)',
    nombreOriginal: '貢眉',
    familia: 'Blanco',
    pais: 'China',
    region: 'Fujian',
    temperatura: '80°C',
    tiempoInfusion: '3–4 min',
    cantidadPorTaza: '3 g / 200 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Herbáceo dulce', 'Paja', 'Miel ligera', 'Suave'],
    descripcion: 'El Gong Mei (ceja de tributo) es el té blanco tradicional elaborado con hojas de la variedad Xiao Bai (té blanco pequeño), diferente de las variedades Da Bai y Da Hao usadas para Silver Needle y White Peony. Su perfil es más rústico y honesto, perfecto para quien busca un blanco cotidiano.',
    curiosidad: 'Los tés blancos de Fujian fueron originalmente un producto de tributo imperial: las hojas más tiernas y puras de la primera cosecha se enviaban al Palacio Prohibido. El sistema de tributo (gong) dio nombre a varios de estos tés (Gong Mei = ceja de tributo) y a la ciudad de Fuding, que significa literalmente "tributo de té".',
  },

  // ── TÉ PU-ERH ─────────────────────────────────────────────────────────────
  {
    nombre: 'Sheng Pu-erh Joven',
    nombreOriginal: '生普洱 (新)',
    familia: 'Pu-erh',
    pais: 'China',
    region: 'Yunnan (Xishuangbanna / Lincang)',
    temperatura: '90–95°C',
    tiempoInfusion: '30 s – 2 min (múltiples)',
    cantidadPorTaza: '6–8 g / 120 ml',
    cafeina: 'Alta',
    notasDeSabor: ['Hierba fresca', 'Fruta verde', 'Amargo vegetal', 'Mineral', 'Intenso'],
    descripcion: 'El Sheng (crudo) joven es un té de gran complejidad y a veces difícil: amargo, astringente, energizante. Se elabora con hojas de árboles silvestres de Yunnan mediante prensado en tortas o ladrillos y se deja fermentar y envejecer durante años. Con el tiempo se transforma radicalmente.',
    curiosidad: 'El Sheng Pu-erh de árboles centenarios (gushu, más de 100 años) se produce en aldeas remotas de Yunnan donde los árboles crecen sin tratamientos y a veces superan los 500 años. Un árbol de 500 años puede producir solo 200–300 gramos de té al año. Los mejores lotes se venden a precios comparables a los grandes vinos de Borgoña.',
  },
  {
    nombre: 'Sheng Pu-erh Añejado',
    nombreOriginal: '生普洱 (陳年)',
    familia: 'Pu-erh',
    pais: 'China',
    region: 'Yunnan',
    temperatura: '95°C',
    tiempoInfusion: '30 s – 1 min (múltiples)',
    cantidadPorTaza: '6–8 g / 120 ml',
    cafeina: 'Media',
    notasDeSabor: ['Tierra húmeda', 'Cuero', 'Tabaco dulce', 'Ciruela', 'Complejo'],
    descripcion: 'Con 10–40 años de envejecimiento natural, el Sheng crudo se transforma: la amargura y astringencia desaparecen, la cafeína se reduce y emergen notas terrosas, de cuero y fruta añeja de extraordinaria complejidad. Es el equivalente a un gran vino añejo, y sus precios reflejan esa analogía.',
    curiosidad: 'El mercado del pu-erh añejado tiene una burbuja especulativa documentada: entre 2005 y 2007 los precios de tortas antiguas se multiplicaron por 10 en pocos meses, impulsados por inversores chinos. La burbuja estalló en 2007. Desde entonces el mercado se ha sofisticado y los coleccionistas serios buscan procedencia verificada.',
  },
  {
    nombre: 'Shou (Ripe) Pu-erh',
    nombreOriginal: '熟普洱',
    familia: 'Pu-erh',
    pais: 'China',
    region: 'Yunnan',
    temperatura: '95–100°C',
    tiempoInfusion: '30 s – 2 min (múltiples)',
    cantidadPorTaza: '6–8 g / 120 ml',
    cafeina: 'Baja',
    notasDeSabor: ['Tierra', 'Madera', 'Hongo', 'Dulzor terroso', 'Intenso'],
    descripcion: 'El Shou (maduro) se produce mediante un proceso de fermentación húmeda acelerada (wòduī), creado en 1973 para imitar en meses el perfil que el Sheng tarda décadas en desarrollar. Es más fácil de encontrar, más consistente y más económico. Su sabor terroso-hongoso es divisivo pero muy apreciado en China.',
    curiosidad: 'El proceso de fermentación húmeda (wòduī) del Shou Pu-erh fue desarrollado en secreto por la Fábrica de Té de Kunming en 1973, en respuesta a la demanda de Hong Kong y el sudeste asiático de tés similares a los pu-erh añejados que ya no podían pagarse. El proceso tardó años en perfeccionarse y su "receta" oficial sigue siendo confidencial.',
  },
  {
    nombre: 'Pu-erh Prensado (Torta)',
    nombreOriginal: '普洱茶餅',
    familia: 'Pu-erh',
    pais: 'China',
    region: 'Yunnan',
    temperatura: '95°C',
    tiempoInfusion: '30 s – 2 min (múltiples)',
    cantidadPorTaza: '5–7 g / 150 ml',
    cafeina: 'Media',
    notasDeSabor: ['Variable por año', 'Complejo', 'Mineral', 'Profundo'],
    descripcion: 'Las tortas de pu-erh (bingcha, 357g estándar) son la forma tradicional de conservar y transportar el té en Yunnan desde la Ruta del Té y los Caballos. Prensadas a vapor y secadas, permiten el envejecimiento durante décadas mientras la compresión ralentiza la oxidación. Cada torta es un archivo histórico del terroir del año.',
    curiosidad: 'El peso estándar de 357 gramos de las tortas de pu-erh no es arbitrario: 7 tortas pesan exactamente un "jin" (unidad china de peso = 500g × 5 = 2,5 kg = un fardo de transporte a lomo de mula en la Ruta del Té y los Caballos). Esta ruta de 5.000 km unía Yunnan con el Tíbet desde el siglo VII.',
  },
  {
    nombre: 'Mini Tuo Cha',
    nombreOriginal: '迷你沱茶',
    familia: 'Pu-erh',
    pais: 'China',
    region: 'Yunnan',
    temperatura: '95°C',
    tiempoInfusion: '2–5 min',
    cantidadPorTaza: '4–6 g / 150 ml',
    cafeina: 'Media',
    notasDeSabor: ['Terroso', 'Madera', 'Chocolate oscuro', 'Mineral'],
    descripcion: 'Los tuo cha (nido de golondrina) son pu-erhs prensados en forma de cuenco cóncavo, de tamaños que van desde 3g hasta 500g. Los minis de 5–10g son perfectos para una preparación individual. Son predominantemente Shou (maduro), lo que los hace accesibles y fáciles de preparar para iniciados en el pu-erh.',
    curiosidad: 'La forma de cuenco del Tuo Cha no es estética: fue diseñada para apilar eficientemente en columnas durante el transporte a lomo de mula. Siete Tuo Cha estándar (100g cada uno) formaban una columna de 700g que se envolvía en bambú. La variante mini surgió en los años 80 para el mercado de oficinas de Hong Kong donde se consumían directamente en la tetera.',
  },

  // ── TÉ AMARILLO ───────────────────────────────────────────────────────────
  {
    nombre: 'Jun Shan Yin Zhen',
    nombreOriginal: '君山銀針',
    familia: 'Amarillo',
    pais: 'China',
    region: 'Isla Jun Shan, lago Dongting, Hunan',
    temperatura: '70–80°C',
    tiempoInfusion: '2–3 min',
    cantidadPorTaza: '3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Dulce floral', 'Miel ligera', 'Maíz tierno', 'Suave y sedoso'],
    descripcion: 'Uno de los tés más raros del mundo, producido exclusivamente en la pequeña isla de Jun Shan (menos de 1 km²) en el lago Dongting, Hunan. Solo ~500 kg al año. El proceso único del té amarillo implica un "sellado al vapor" (mén huáng) que reduce la clorofila y crea un perfil más suave que el verde.',
    curiosidad: 'El Jun Shan Yin Zhen fue el té favorito del líder Mao Zedong, quien era oriundo de Hunan. En la era maoísta toda la producción se destinaba al uso oficial del gobierno. Los "tres verticales" (las yemas suspendidas verticalmente en el agua caliente) son un espectáculo visual único que convierte su preparación en una performance.',
  },
  {
    nombre: 'Meng Ding Huang Ya',
    nombreOriginal: '蒙頂黃芽',
    familia: 'Amarillo',
    pais: 'China',
    region: 'Monte Mengding, Sichuan',
    temperatura: '70–80°C',
    tiempoInfusion: '2–3 min',
    cantidadPorTaza: '3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Castañas suaves', 'Floral delicado', 'Dulce vegetal', 'Mantequilla'],
    descripcion: 'Con más de 2.000 años de historia, el Meng Ding Huang Ya (yema amarilla del Monte Meng) es considerado el té cultivado más antiguo del mundo. Las leyendas atribuyen su introducción al monje budista Wu Li Zhen en el siglo I a.C. Es té de tributo imperial desde la dinastía Tang (siglo VII).',
    curiosidad: 'Según las crónicas históricas chinas, el Monte Mengding alberga los primeros jardines de té artificiales de la historia, establecidos hace más de 2.000 años. Durante la dinastía Tang (618-907 d.C.), la entrega anual de 360 jin de Meng Ding al palacio imperial era obligatoria, lo que convirtió a Sichuan en el primer exportador de té de China.',
  },
  {
    nombre: 'Huo Shan Huang Ya',
    nombreOriginal: '霍山黃芽',
    familia: 'Amarillo',
    pais: 'China',
    region: 'Huo Shan, Anhui',
    temperatura: '70–80°C',
    tiempoInfusion: '2–3 min',
    cantidadPorTaza: '3 g / 200 ml',
    cafeina: 'Media',
    notasDeSabor: ['Castaña', 'Nuez suave', 'Floral tenue', 'Ligeramente tostado'],
    descripcion: 'El té amarillo más accesible y producido de Anhui, también conocida por el Keemun. Tiene un perfil más terroso y de nuez que otros tés amarillos, influenciado por las técnicas de producción locales. La técnica de "mén huáng" (sello amarillo) es la menos pronunciada de los tres amarillos principales, dando un perfil a caballo entre verde y amarillo.',
    curiosidad: 'El té amarillo como categoría casi desapareció durante la Revolución Cultural (1966-1976), cuando muchos productores artesanales abandonaron técnicas consideradas "burguesas". El proceso de "mén huáng" es el más laborioso y técnicamente exigente de todos los tés: un pequeño error de temperatura o humedad puede convertir el lote entero en desecho.',
  },

  // ── ROOIBOS ───────────────────────────────────────────────────────────────
  {
    nombre: 'Rooibos Rojo Clásico',
    nombreOriginal: 'Rooibos',
    familia: 'Rooibos',
    pais: 'Sudáfrica',
    region: 'Cederberg, Cabo Occidental',
    temperatura: '100°C',
    tiempoInfusion: '5–10 min',
    cantidadPorTaza: '1,5–2 g / 250 ml',
    cafeina: 'Sin cafeína',
    notasDeSabor: ['Vainilla', 'Caramelo', 'Tierra dulce', 'Afrutado suave'],
    descripcion: 'Elaborado con las hojas fermentadas del arbusto Aspalathus linearis, el Rooibos no es técnicamente un té sino una infusión herbal. Sin cafeína y con alto contenido en antioxidantes, es ideal para cualquier hora del día. Su nombre en afrikáans significa "arbusto rojo". Solo crece en una región de 200 km² del Cederberg.',
    curiosidad: 'El Rooibos solo crece en la pequeña región del Cederberg (Cabo Occidental, Sudáfrica) y todos los intentos de cultivarlo en otras partes del mundo han fracasado. La combinación única de suelo arenoso, altitud, temperatura y precipitación estacional es irremplazable. El gobierno sudafricano lo ha registrado como Indicación Geográfica Protegida a nivel internacional.',
  },
  {
    nombre: 'Rooibos Verde',
    nombreOriginal: 'Groen Rooibos',
    familia: 'Rooibos',
    pais: 'Sudáfrica',
    region: 'Cederberg, Cabo Occidental',
    temperatura: '90–95°C',
    tiempoInfusion: '4–6 min',
    cantidadPorTaza: '2 g / 250 ml',
    cafeina: 'Sin cafeína',
    notasDeSabor: ['Herbáceo fresco', 'Miel ligera', 'Floral', 'Astringencia suave'],
    descripcion: 'El Rooibos verde (sin fermentar) es relativamente reciente: las hojas del Aspalathus linearis se secan sin la etapa de oxidación, conservando más antioxidantes y un perfil más fresco y menos dulce que el rojo clásico. Tiene un sabor más similar a un té verde que a la versión fermentada.',
    curiosidad: 'El Rooibos verde fue prácticamente desconocido hasta los años 90, cuando investigadores sudafricanos descubrieron que tenía niveles de aspalathin (un antioxidante exclusivo de esta planta) hasta 10 veces superiores al Rooibos rojo fermentado. Este descubrimiento impulsó su producción comercial. Hoy representa el 10% del mercado total del Rooibos.',
  },
  {
    nombre: 'Honeybush',
    nombreOriginal: 'Heuningbos',
    familia: 'Rooibos',
    pais: 'Sudáfrica',
    region: 'Cabo Oriental y Occidental',
    temperatura: '100°C',
    tiempoInfusion: '5–10 min',
    cantidadPorTaza: '1,5–2 g / 250 ml',
    cafeina: 'Sin cafeína',
    notasDeSabor: ['Miel intensa', 'Albaricoque', 'Vainilla', 'Dulzor floral'],
    descripcion: 'El Honeybush (arbusto de miel) es primo botánico del Rooibos: también es de la familia Fabaceae, crece en Sudáfrica y es sin cafeína. Las flores amarillas con olor a miel dan nombre a la planta. Su sabor más dulce y afrutado lo hace accesible para quienes encuentran el Rooibos demasiado terroso.',
    curiosidad: 'El Honeybush fue utilizado por los pueblos Khoikhoi y San durante siglos antes de que los colonos europeos lo documentaran. Los primeros registros escritos son del siglo XIX. A diferencia del Rooibos, las diferentes especies de Honeybush (hay más de 30) tienen perfiles distintos, lo que permite crear blends interesantes. El mercado mundial aún es pequeño comparado con el Rooibos.',
  },
  {
    nombre: 'Buchu',
    nombreOriginal: 'Boegoe',
    familia: 'Rooibos',
    pais: 'Sudáfrica',
    region: 'Montañas del Cabo',
    temperatura: '95–100°C',
    tiempoInfusion: '5–7 min',
    cantidadPorTaza: '1 g / 250 ml',
    cafeina: 'Sin cafeína',
    notasDeSabor: ['Menta', 'Bergamota silvestre', 'Herbal intenso', 'Balsámico'],
    descripcion: 'El Buchu es una herba medicinal sagrada de las culturas Khoikhoi y San, usado durante milenios como remedio. Las hojas de Agathosma betulina y species afines se usan en infusión, produciendo un perfil herbal intenso, mentolado y balsámico muy distinto al Rooibos. Se consume en pequeñas cantidades por su potencia.',
    curiosidad: 'El Buchu fue la primera planta medicinal africana patentada comercialmente en el mundo occidental, lo que generó una controversia importante sobre biopiratería. La negociación entre el gobierno sudafricano y las compañías farmacéuticas europeas que intentaron patentar sus extractos fue uno de los primeros casos internacionales de defensa de la propiedad intelectual de comunidades indígenas sobre sus plantas tradicionales.',
  },
];

export default function GuiaTe() {
  const [busqueda, setBusqueda] = useState('');
  const [familia, setFamilia] = useState<FamiliaTe | 'Todas'>('Todas');

  const variedadesFiltradas = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    return VARIEDADES.filter((v) => {
      const matchFamilia = familia === 'Todas' || v.familia === familia;
      const matchBusqueda =
        !t ||
        v.nombre.toLowerCase().includes(t) ||
        v.nombreOriginal.toLowerCase().includes(t) ||
        v.pais.toLowerCase().includes(t) ||
        v.region.toLowerCase().includes(t) ||
        v.notasDeSabor.some((n) => n.toLowerCase().includes(t)) ||
        v.descripcion.toLowerCase().includes(t);
      return matchFamilia && matchBusqueda;
    });
  }, [busqueda, familia]);

  function DotCafeina({ nivel }: { nivel: number }) {
    const max = 3;
    return (
      <span className={styles.cafeinaDots} aria-label={`Cafeína: ${nivel} de ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={i < nivel ? styles.cafeinaDotFilled : styles.cafeinaDotEmpty}
          />
        ))}
      </span>
    );
  }

  function badgeFamiliaClass(f: FamiliaTe): string {
    const map: Record<FamiliaTe, string> = {
      'Verde': styles.badgeVerde,
      'Negro': styles.badgeNegro,
      'Oolong': styles.badgeOolong,
      'Blanco': styles.badgeBlanco,
      'Pu-erh': styles.badgePuerh,
      'Amarillo': styles.badgeAmarillo,
      'Rooibos': styles.badgeRooibos,
    };
    return map[f];
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía del Té</h1>
        <p>40 variedades del mundo: familia, temperatura, tiempo de infusión y notas de sabor</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── CONTROLES ──────────────────────────────────────────── */}
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar por nombre, país, región o nota de sabor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar variedad de té"
          />
          <div className={styles.filtrosRow}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Familia:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por familia">
                <button
                  className={`${styles.filtroBtn} ${familia === 'Todas' ? styles.filtroActivo : ''}`}
                  onClick={() => setFamilia('Todas')}
                >Todas</button>
                {FAMILIAS.map((f) => (
                  <button
                    key={f}
                    className={`${styles.filtroBtn} ${familia === f ? styles.filtroActivo : ''}`}
                    onClick={() => setFamilia(f)}
                  >{f}</button>
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
            <article key={v.nombre} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.familiaBadge} ${badgeFamiliaClass(v.familia)}`}>
                  {v.familia}
                </span>
                <span className={styles.cafeinaLabel}>
                  {v.cafeina === 'Sin cafeína' ? (
                    <span className={styles.sinCafeina}>Sin cafeína</span>
                  ) : (
                    <DotCafeina nivel={CAFEINA_NIVEL[v.cafeina]} />
                  )}
                </span>
              </div>

              <div className={styles.cardTitulo}>
                <h2 className={styles.nombre}>{v.nombre}</h2>
                <span className={styles.nombreOriginal}>{v.nombreOriginal}</span>
                <span className={styles.paisRegion}>{v.pais} · {v.region}</span>
              </div>

              <div className={styles.preparacionGrid}>
                <div className={styles.prepItem}>
                  <span className={styles.prepIcon} aria-hidden="true">🌡️</span>
                  <span className={styles.prepLabel}>Temperatura</span>
                  <span className={styles.prepValor}>{v.temperatura}</span>
                </div>
                <div className={styles.prepItem}>
                  <span className={styles.prepIcon} aria-hidden="true">⏱️</span>
                  <span className={styles.prepLabel}>Tiempo</span>
                  <span className={styles.prepValor}>{v.tiempoInfusion}</span>
                </div>
                <div className={styles.prepItem}>
                  <span className={styles.prepIcon} aria-hidden="true">⚖️</span>
                  <span className={styles.prepLabel}>Cantidad</span>
                  <span className={styles.prepValor}>{v.cantidadPorTaza}</span>
                </div>
              </div>

              <div className={styles.notasSection}>
                <span className={styles.sectionLabel}>Notas de sabor</span>
                <div className={styles.notasTags}>
                  {v.notasDeSabor.map((n) => (
                    <span key={n} className={styles.notaTag}>{n}</span>
                  ))}
                </div>
              </div>

              <p className={styles.descripcion}>{v.descripcion}</p>

              <div className={styles.curiosidadBox}>
                <span className={styles.curiosidadIcon} aria-hidden="true">🍵</span>
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
        title="El mundo del té: historia, ciencia y variedades"
        subtitle="De las montañas de China a tu taza: 5.000 años de cultura"
      >
        <p>
          El té es la bebida más consumida del mundo después del agua, con más de 3.000 millones de
          tazas al día. Todas las variedades de té (verde, negro, oolong, blanco, pu-erh y amarillo)
          proceden de la misma planta: <em>Camellia sinensis</em>. Las diferencias entre tipos son
          resultado exclusivo del procesado: oxidación, temperatura y técnica de secado.
        </p>
        <p>
          La planta del té tiene su origen en el triángulo formado por el suroeste de China, el
          noreste de India y el norte de Myanmar. La primera referencia escrita al té data del
          año 59 a.C. en China. Desde entonces, la cultura del té ha generado filosofías completas,
          ceremonias que duran horas y un lenguaje técnico tan sofisticado como el del vino.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption>Comparativa de familias de té</caption>
            <thead>
              <tr>
                <th>Familia</th>
                <th>Oxidación</th>
                <th>Temperatura</th>
                <th>Cafeína</th>
                <th>Ejemplo icónico</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Verde</td><td>0%</td><td>60–85°C</td><td>Media</td><td>Sencha, Longjing</td></tr>
              <tr><td>Blanco</td><td>5–15%</td><td>75–85°C</td><td>Baja</td><td>Silver Needle</td></tr>
              <tr><td>Amarillo</td><td>Mín. + sellado</td><td>70–80°C</td><td>Media</td><td>Jun Shan Yin Zhen</td></tr>
              <tr><td>Oolong</td><td>15–85%</td><td>85–100°C</td><td>Media</td><td>Tie Guan Yin, Da Hong Pao</td></tr>
              <tr><td>Negro</td><td>100%</td><td>90–100°C</td><td>Alta</td><td>Darjeeling, Assam</td></tr>
              <tr><td>Pu-erh</td><td>Post-ferm.</td><td>95°C</td><td>Variable</td><td>Sheng, Shou</td></tr>
            </tbody>
          </table>
        </div>

        <h3>¿Qué té es para ti?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🌿 Buscas calma y relajación</strong>
            <p>
              Los tés blancos (Silver Needle, White Peony) y el Gyokuro son ricos en L-teanina,
              un aminoácido que promueve la relajación sin somnolencia. El Rooibos es perfecto
              para la tarde y noche al ser completamente sin cafeína.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🧠 Necesitas concentración</strong>
            <p>
              El Gyokuro y el Matcha tienen la combinación óptima de cafeína y L-teanina para
              una energía limpia y sostenida. El Sencha y el Kabusecha son más suaves para
              el trabajo diario. Sin el pico y caída del café.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>⚡ Quieres más energía</strong>
            <p>
              Los tés negros (Assam, English Breakfast) tienen más cafeína por taza. El Sheng
              Pu-erh joven es sorprendentemente energizante. Preparados con agua más caliente y
              más tiempo dan más cafeína.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>👥 Momento social o familiar</strong>
            <p>
              El té de menta marroquí (Gunpowder + hierbabuena), el Earl Grey inglés o el
              Rooibos son perfectos para compartir sin barreras culturales. El Hojicha
              es ideal para acompañar comidas o servir a niños.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿En qué se diferencian el té verde, negro y oolong?</strong>
            <p>
              Todos provienen de la misma planta (<em>Camellia sinensis</em>). La diferencia
              es el grado de oxidación: el verde no se oxida (0%), el negro se oxida completamente
              (100%) y el oolong está en el medio (15-85%). La oxidación oscurece las hojas y
              transforma los compuestos vegetales frescos en aromas más complejos y ricos.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El té tiene menos cafeína que el café?</strong>
            <p>
              La hoja de té seca contiene más cafeína por peso que el café en grano. Sin embargo,
              como se usa menos cantidad por taza (2-3g vs 10-15g), la taza de té tiene menos
              cafeína. Un Gyokuro concentrado puede superar una taza de espresso, pero el té
              estándar tiene 20-50mg vs 80-120mg del café.
            </p>
            <span className={styles.faqTip}>
              💡 La L-teanina del té modera el efecto de la cafeína, dando una energía más suave y sostenida que el café.
            </span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué importa tanto la temperatura del agua?</strong>
            <p>
              Cada familia de té libera diferentes compuestos a diferentes temperaturas. Los tés
              verdes y blancos contienen catequinas que se vuelven muy amargas por encima de 85°C.
              Los negros y pu-erhs necesitan agua más caliente para extraer sus compuestos. Usar
              agua hirviendo en un té verde japonés lo arruina completamente.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Se puede reutilizar la hoja del té?</strong>
            <p>
              Muchos tés de calidad, especialmente los oolongs, pu-erhs y blancos premium, mejoran
              en las siguientes infusiones. El Tie Guan Yin puede prepararse 5-7 veces. Cada infusión
              revela notas distintas. Los tés en bolsita no permiten esto porque la hoja está muy
              troceada y se agota en la primera infusión.
            </p>
            <span className={styles.faqTip}>
              🍵 Los maestros del té dicen que la segunda o tercera infusión suele ser la mejor.
            </span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo se conserva el té correctamente?</strong>
            <p>
              En recipiente hermético opaco, alejado de la luz, el calor, la humedad y los olores
              fuertes. Los tés verdes y blancos son los más delicados (consumir en 12 meses). Los
              negros duran 2-3 años. Los pu-erhs envejecen indefinidamente si se almacenan en
              condiciones de humedad y ventilación controladas.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El pu-erh es realmente un té fermentado?</strong>
            <p>
              Sí: el pu-erh (especialmente el Shou) pasa por una fermentación microbiana real,
              como el queso o el vino. El Sheng envejece mediante oxidación lenta y actividad
              microbiana espontánea. Esta fermentación transforma los compuestos del té, reduciendo
              la cafeína y generando los característicos sabores terrosos y profundos.
            </p>
          </li>
        </ul>

        <h3>Cómo preparar un té perfecto: guía paso a paso</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>El agua: calidad y temperatura</strong>
              <p>
                Usa agua filtrada o de manantial (el cloro del grifo arruina el sabor). Calienta
                a la temperatura exacta para cada tipo: 60-75°C para tés verdes japoneses, 75-85°C
                para blancos y verdes chinos, 85-95°C para oolongs, 90-100°C para negros y pu-erhs.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Pre-calentar la tetera o la taza</strong>
              <p>
                Vierte un poco de agua caliente en la tetera y la taza antes de preparar el té.
                Esto evita el choque térmico y mantiene la temperatura de infusión estable. Los
                maestros del té lo consideran un paso irrenunciable.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Medir la cantidad</strong>
              <p>
                La proporción estándar es 2-3g por 200ml para la mayoría de los tés. Los
                oolongs y pu-erhs de infusión múltiple usan más hoja (5-8g) por volumen menor
                de agua (100-150ml). Una báscula de cocina de precisión (0,1g) marca una
                diferencia real.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Respetar el tiempo exacto</strong>
              <p>
                El tiempo de infusión es tan importante como la temperatura. 30 segundos de más
                pueden arruinar un Gyokuro. Usa un temporizador. Para oolongs y pu-erhs de
                múltiple infusión, empieza con 30-45 segundos y aumenta cada infusión sucesiva.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Servir completamente</strong>
              <p>
                Cuando el tiempo acabe, vierte todo el té (no dejes nada en la tetera) para
                detener la infusión. Si dejas hojas en contacto con el agua caliente, el té
                sigue extrayéndose y se amarga. Para múltiples infusiones, vacía completamente
                cada vez.
              </p>
            </div>
          </li>
        </ol>

        <h3>Consejos para disfrutar más el té</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <p>
              Para bajar temperatura rápidamente, vierte el agua de un recipiente a otro: pierdes
              3-5°C por cada traspaso. Más práctico que esperar o usar termómetro.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🍵</span>
            <p>
              Los oolongs de alta calidad te recompensan con 4-6 infusiones. La segunda suele
              ser la mejor. Usa teteras de barro de Yixing para oolongs: el barro absorbe los
              aromas con el tiempo.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>
              Los tés verdes y blancos premium son mejores en primavera (primera cosecha).
              Los negros de calidad (Darjeeling 1st Flush) llegan en abril-mayo. Marca el
              calendario como la temporada de vendimia.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏺</span>
            <p>
              El pu-erh mejora con los años si se almacena en condiciones de 60-70% de humedad
              y buena ventilación. Una habitación sin olores fuertes es suficiente. Es una
              de las pocas infusiones que funciona como inversión.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌿</span>
            <p>
              Huele las hojas secas antes de preparar. Un Gyokuro huele a algas del océano;
              un Silver Needle a heno dulce. Si el olor es débil o rancio, el té ha perdido
              frescura independientemente de la fecha de caducidad.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al preparar té</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Agua hirviendo en tés verdes:</strong> es el error más común y más
              destructivo. A 100°C, los tés verdes japoneses liberan una cantidad brutal de
              catequinas amargas. El Gyokuro necesita agua a 50-60°C. Un té verde amargo no es
              de mala calidad: es un té de buena calidad mal preparado.
            </li>
            <li>
              <strong>Tiempo de infusión excesivo:</strong> más tiempo no es más sabor, es más
              amargura. Incluso los negros se vuelven desagradables con más de 5-6 minutos.
              Los tés de bolsita ya vienen con hoja muy triturada que extrae muy rápido:
              2-3 minutos es suficiente.
            </li>
            <li>
              <strong>Exprimir la bolsita de té:</strong> la bolsita se exprime instintivamente,
              pero eso libera los compuestos más amargos que quedan atrapados en la hoja. Es
              mejor retirarla sin presionar.
            </li>
            <li>
              <strong>Guardar el té en la nevera:</strong> la humedad y los olores de la nevera
              deterioran rápidamente el té. Los tés verdes japoneses de máxima calidad sí se
              guardan en frío (bajo cero, sellados al vacío), pero para uso doméstico el armario
              hermético oscuro es la mejor opción.
            </li>
            <li>
              <strong>Creer que el oolong o el pu-erh son tés exóticos difíciles:</strong>
              son simplemente tés de múltiple infusión. Empezar con un Dong Ding o un Shou
              Pu-erh de entrada es perfectamente posible sin rituales complicados: tetera pequeña,
              agua caliente, 30 segundos, servir.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-te')} />
      <ShareCard appName="guia-te" />
      <Footer appName="guia-te" />
    </div>
  );
}
