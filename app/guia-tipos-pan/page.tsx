'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaTiposPan.module.css';

type RegionPan = 'Europa' | 'América' | 'Asia' | 'Oriente Medio' | 'África';
type TipoHarina = 'Trigo' | 'Centeno' | 'Maíz' | 'Arroz' | 'Cebada' | 'Mezcla';
type TipoFermentacion = 'Masa madre' | 'Levadura comercial' | 'Sin fermentar' | 'Bicarbonato';
type TexturaMiga = 'Esponjosa' | 'Densa' | 'Aireada' | 'Compacta' | 'Plana';

interface TipoPan {
  nombre: string;
  nombreOriginal: string;
  region: RegionPan;
  pais: string;
  harina: TipoHarina;
  fermentacion: TipoFermentacion;
  texturaMiga: TexturaMiga;
  tiempoFermentacion: string;
  acompañamientos: string[];
  usosComunes: string[];
  descripcion: string;
  curiosidad: string;
}

const PANES: TipoPan[] = [
  // EUROPA (20)
  {
    nombre: 'Sourdough / Pan de masa madre', nombreOriginal: 'Sourdough',
    region: 'Europa', pais: 'Internacional', harina: 'Trigo', fermentacion: 'Masa madre',
    texturaMiga: 'Aireada', tiempoFermentacion: '12-24 horas',
    acompañamientos: ['Mantequilla', 'Queso', 'Aguacate'],
    usosComunes: ['Tostadas', 'Bocadillos', 'Fondue'],
    descripcion: 'Pan fermentado con cultivo natural de bacterias y levaduras silvestres. Costra crujiente, miga alveolada y sabor ligeramente ácido característico.',
    curiosidad: 'La masa madre más antigua conocida tiene más de 4.500 años y fue encontrada en Egipto.',
  },
  {
    nombre: 'Ciabatta', nombreOriginal: 'Ciabatta',
    region: 'Europa', pais: 'Italia', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Aireada', tiempoFermentacion: '8-12 horas',
    acompañamientos: ['Aceite de oliva', 'Jamón serrano', 'Mozzarella'],
    usosComunes: ['Bocadillos', 'Bruschetta', 'Panini'],
    descripcion: 'Pan italiano con forma de zapatilla plana y alveolado irregular. Masa húmeda que da una miga muy abierta y costra fina.',
    curiosidad: 'Fue inventado en 1982 en Verona para competir con las baguettes francesas.',
  },
  {
    nombre: 'Baguette', nombreOriginal: 'Baguette française',
    region: 'Europa', pais: 'Francia', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Aireada', tiempoFermentacion: '1-4 horas',
    acompañamientos: ['Brie', 'Mantequilla', 'Paté'],
    usosComunes: ['Bocadillos', 'Acompañamiento', 'Crutones'],
    descripcion: 'El pan más icónico de Francia. Costra dorada y crujiente, miga suave. La ley francesa regula su composición: solo harina, agua, sal y levadura.',
    curiosidad: 'Los franceses consumen 12 millones de baguettes al día y la baguette tiene protección UNESCO.',
  },
  {
    nombre: 'Pan de centeno', nombreOriginal: 'Roggenbrot / Rugbrød',
    region: 'Europa', pais: 'Alemania/Dinamarca', harina: 'Centeno', fermentacion: 'Masa madre',
    texturaMiga: 'Densa', tiempoFermentacion: '16-24 horas',
    acompañamientos: ['Salmón ahumado', 'Queso semiduro', 'Mantequilla salada'],
    usosComunes: ['Smørrebrød', 'Tostadas nórdicas', 'Sándwiches abiertos'],
    descripcion: 'Pan oscuro y denso hecho con centeno. Rico en fibra y con sabor intenso y ácido. Básico de la dieta nórdica y alemana.',
    curiosidad: 'El rugbrød danés puede tener hasta 100% centeno y dura semanas en buen estado.',
  },
  {
    nombre: 'Pumpernickel', nombreOriginal: 'Pumpernickel',
    region: 'Europa', pais: 'Alemania', harina: 'Centeno', fermentacion: 'Masa madre',
    texturaMiga: 'Compacta', tiempoFermentacion: '16-24 horas + horneado 16h',
    acompañamientos: ['Salmón ahumado', 'Queso suave', 'Mantequilla'],
    usosComunes: ['Smörgåsbord', 'Canapés', 'Desayuno nórdico'],
    descripcion: 'Pan de centeno integral alemán horneado durante 16-24 horas a baja temperatura. Negro, denso y con sabor intenso a malta y melaza.',
    curiosidad: 'El nombre podría venir de "Pumper Nickel" — flatulencia del diablo — por su alto contenido en fibra.',
  },
  {
    nombre: 'Focaccia', nombreOriginal: 'Focaccia',
    region: 'Europa', pais: 'Italia', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '2-6 horas',
    acompañamientos: ['Aceite de oliva', 'Romero', 'Aceitunas'],
    usosComunes: ['Aperitivo', 'Bocadillos', 'Acompañamiento'],
    descripcion: 'Pan plano italiano de Liguria con aceite de oliva, sal gorda y hierbas. Textura esponjosa por dentro y crujiente por fuera.',
    curiosidad: 'La focaccia de Génova es tan importante que hay una "foccaceria" en cada esquina de la ciudad.',
  },
  {
    nombre: 'Pretzel / Bretzel', nombreOriginal: 'Brezel / Laugenbretzel',
    region: 'Europa', pais: 'Alemania', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Densa', tiempoFermentacion: '1-2 horas',
    acompañamientos: ['Mostaza', 'Queso fundido', 'Cerveza'],
    usosComunes: ['Aperitivo', 'Merienda bávara', 'Maridaje cervecero'],
    descripcion: 'Pan alemán con forma trenzada y baño en solución alcalina que le da costra marrón oscura y sabor único. Espolvoreado con sal gorda.',
    curiosidad: 'La forma de nudo representa monjes cruzando los brazos en oración según la leyenda medieval.',
  },
  {
    nombre: 'Brioche', nombreOriginal: 'Brioche',
    region: 'Europa', pais: 'Francia', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '4-12 horas',
    acompañamientos: ['Mantequilla', 'Mermelada', 'Foie gras'],
    usosComunes: ['Desayuno', 'French toast', 'Hamburguesas gourmet'],
    descripcion: 'Pan enriquecido francés con mantequilla y huevos. Miga extremadamente suave y esponjosa, costra dorada brillante.',
    curiosidad: 'La frase "que coman brioche" se atribuye erróneamente a María Antonieta — aparece en Rousseau antes de que ella naciera.',
  },
  {
    nombre: 'Challah', nombreOriginal: 'Challah / חַלָּה',
    region: 'Europa', pais: 'Israel/Europa del Este', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '2-4 horas',
    acompañamientos: ['Miel', 'Mantequilla', 'Humus'],
    usosComunes: ['Sabbat', 'Festividades judías', 'French toast'],
    descripcion: 'Pan ceremonial judío trenzado con huevo y aceite. Miga tierna y suave, costra brillante. Se elabora para el Sabbat y las fiestas.',
    curiosidad: 'La trenza tradicional tiene 6 tiras entrelazadas que representan los 6 días de la creación.',
  },
  {
    nombre: 'Knäckebröd', nombreOriginal: 'Knäckebröd',
    region: 'Europa', pais: 'Suecia', harina: 'Centeno', fermentacion: 'Levadura comercial',
    texturaMiga: 'Plana', tiempoFermentacion: '30 min',
    acompañamientos: ['Mantequilla', 'Salmón', 'Queso sueco'],
    usosComunes: ['Desayuno nórdico', 'Aperitivos', 'Canapés'],
    descripcion: 'Galleta de centeno crujiente y plana, básica de la dieta escandinava. Muy bajo en humedad, dura meses sin enmohecerse.',
    curiosidad: 'Los vikingos lo llevaban en sus expediciones por su durabilidad extrema.',
  },
  {
    nombre: 'Croissant', nombreOriginal: 'Croissant',
    region: 'Europa', pais: 'Francia/Austria', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Aireada', tiempoFermentacion: '12-24 horas',
    acompañamientos: ['Mantequilla', 'Mermelada', 'Café'],
    usosComunes: ['Desayuno', 'Merienda', 'Sándwich'],
    descripcion: 'Pan de hojaldre laminado con mantequilla, de origen austriaco (Kipferl) y popularizado en Francia. Crujiente por fuera, suave y hojaldrado por dentro.',
    curiosidad: 'El croissant es la evolución francesa del Kipferl austríaco, un panecillo en forma de media luna documentado desde el siglo XIII. Una leyenda popular vincula la forma con el asedio otomano de Viena de 1683, pero no hay evidencia histórica que la respalde.',
  },
  {
    nombre: 'Vollkornbrot', nombreOriginal: 'Vollkornbrot',
    region: 'Europa', pais: 'Alemania', harina: 'Centeno', fermentacion: 'Masa madre',
    texturaMiga: 'Densa', tiempoFermentacion: '16-24 horas',
    acompañamientos: ['Embutidos', 'Queso', 'Mantequilla con hierbas'],
    usosComunes: ['Bocadillos alemanes', 'Desayuno', 'Cenas ligeras'],
    descripcion: 'Pan integral alemán de grano entero. Muy denso y nutritivo, con toda la fibra del grano. Sabor a nueces y malta.',
    curiosidad: 'En Alemania existen más de 300 variedades oficiales de pan clasificadas por el Instituto Alemán del Pan.',
  },
  {
    nombre: 'Pane di Altamura', nombreOriginal: 'Pane di Altamura DOP',
    region: 'Europa', pais: 'Italia', harina: 'Trigo', fermentacion: 'Masa madre',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '4-8 horas',
    acompañamientos: ['Tomate fresco', 'Aceite de oliva', 'Burrata'],
    usosComunes: ['Aperitivo', 'Panzanella', 'Sopas'],
    descripcion: 'Pan DOP de Altamura (Puglia) elaborado con semolina de trigo duro. Dorado intenso, costra gruesa y miga dorada suave.',
    curiosidad: 'Horacio mencionó el pan de Altamura en su Sátira I en el año 37 a.C.',
  },
  {
    nombre: 'Zopf', nombreOriginal: 'Zopf / Züpfe',
    region: 'Europa', pais: 'Suiza', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '2-4 horas',
    acompañamientos: ['Mantequilla', 'Mermelada', 'Queso suizo'],
    usosComunes: ['Desayuno dominical', 'Festivo', 'Merienda'],
    descripcion: 'Pan suizo trenzado tradicional del domingo, con mantequilla y leche. Brillante y muy esponjoso. Símbolo del desayuno familiar suizo.',
    curiosidad: 'El nombre significa "trenza" en alemán suizo — se da a los niños trenzado como regalo.',
  },
  {
    nombre: 'Walliser Roggenbrot', nombreOriginal: 'Walliser Roggenbrot',
    region: 'Europa', pais: 'Suiza', harina: 'Centeno', fermentacion: 'Masa madre',
    texturaMiga: 'Densa', tiempoFermentacion: '24-48 horas',
    acompañamientos: ['Fondue raclette', 'Embutidos alpinos', 'Queso Gruyère'],
    usosComunes: ['Fondue', 'Raclette', 'Bocadillos suizos'],
    descripcion: 'Pan de centeno del Valais suizo con DOP. Denso, oscuro y de sabor intenso, fermentado lentamente en frío alpino.',
    curiosidad: 'Por ley cantonal debe elaborarse con al menos 90% de centeno del Valais.',
  },
  {
    nombre: 'English Muffin', nombreOriginal: 'English Muffin',
    region: 'Europa', pais: 'Reino Unido', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '1-2 horas',
    acompañamientos: ['Mantequilla', 'Mermelada', 'Huevo Benedict'],
    usosComunes: ['Desayuno inglés', 'Eggs Benedict', 'Tostadas'],
    descripcion: 'Panecillo inglés cocido en plancha, con textura crocante por fuera y esponjosa por dentro. Se abre a mano para conservar la textura.',
    curiosidad: 'Se inventó en el siglo XIX en Inglaterra, no tiene nada que ver con los muffins dulces americanos.',
  },
  {
    nombre: 'Stollen', nombreOriginal: 'Christstollen',
    region: 'Europa', pais: 'Alemania', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Densa', tiempoFermentacion: '4-8 horas',
    acompañamientos: ['Mantequilla', 'Vino caliente', 'Café'],
    usosComunes: ['Navidad', 'Desayuno festivo', 'Regalo navideño'],
    descripcion: 'Pan dulce navideño de Dresde con frutos secos, especias y mazapán cubierto de azúcar glass. Se madura varias semanas para intensificar los sabores.',
    curiosidad: 'El Dresdner Stollen IGP pesa entre 500g y 20kg — el más grande registrado pesó 4 toneladas.',
  },
  {
    nombre: 'Brioche Bun', nombreOriginal: 'Brioche Bun',
    region: 'Europa', pais: 'Francia/Internacional', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '2-4 horas',
    acompañamientos: ['Hamburguesas', 'Pollo frito', 'Pulled pork'],
    usosComunes: ['Hamburguesas', 'Sándwiches', 'Hot dogs'],
    descripcion: 'Versión individual y enriquecida del brioche, usado para hamburguesas gourmet. Miga muy esponjosa que absorbe los jugos sin deshacerse.',
    curiosidad: 'La tendencia del brioche bun para hamburguesas empezó en restaurantes de Nueva York en 2007.',
  },
  {
    nombre: 'Hogaza española', nombreOriginal: 'Hogaza',
    region: 'Europa', pais: 'España', harina: 'Trigo', fermentacion: 'Masa madre',
    texturaMiga: 'Aireada', tiempoFermentacion: '8-16 horas',
    acompañamientos: ['Aceite de oliva', 'Jamón ibérico', 'Tomate'],
    usosComunes: ['Pa amb tomàquet', 'Bocadillos', 'Sopas'],
    descripcion: 'Pan redondo tradicional español con costra dura y miga alveolada. Cada región tiene su variante — la hogaza castellana es la más conocida.',
    curiosidad: 'El "pan con tomate" catalán se prepara frotando el tomate directamente sobre la miga, no el tomate en rebanada.',
  },
  {
    nombre: 'Cornbread', nombreOriginal: 'Cornbread',
    region: 'América', pais: 'EE.UU.', harina: 'Maíz', fermentacion: 'Bicarbonato',
    texturaMiga: 'Esponjosa', tiempoFermentacion: 'Sin reposo',
    acompañamientos: ['Mantequilla', 'Miel', 'Chili'],
    usosComunes: ['BBQ americano', 'Sopas', 'Guarnición'],
    descripcion: 'Pan americano del sur hecho con harina de maíz y leudado con bicarbonato. Textura arenosa y sabor dulce. Rápido de preparar.',
    curiosidad: 'El pan de maíz tiene milenios de tradición entre los pueblos indígenas de Norteamérica (Cherokee, Muscogee, Wabanaki). El cornbread sureño actual es una síntesis de esa base indígena, técnicas europeas (uso de leche, levadura química) y herencia culinaria afroamericana.',
  },
  // ORIENTE MEDIO (3)
  {
    nombre: 'Pan de pita', nombreOriginal: 'Pita / خبز',
    region: 'Oriente Medio', pais: 'Grecia/Oriente Medio', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Plana', tiempoFermentacion: '1-2 horas',
    acompañamientos: ['Humus', 'Falafel', 'Tzatziki'],
    usosComunes: ['Kebab', 'Dipping', 'Sándwich'],
    descripcion: 'Pan plano del Mediterráneo oriental que se hincha al hornear formando un bolsillo interior. Perfecto para rellenar.',
    curiosidad: 'El bolsillo del pita se forma por el vapor atrapado — el pan debe hornearse a temperatura muy alta.',
  },
  {
    nombre: 'Lavash', nombreOriginal: 'Lavash / լաւաշ',
    region: 'Oriente Medio', pais: 'Armenia', harina: 'Trigo', fermentacion: 'Sin fermentar',
    texturaMiga: 'Plana', tiempoFermentacion: 'Sin reposo',
    acompañamientos: ['Queso fresco', 'Hierbas frescas', 'Carne asada'],
    usosComunes: ['Wraps', 'Dipping', 'Acompañamiento'],
    descripcion: 'Pan plano armenio hojaldrado cocido en tandor (horno de arcilla). Fino como papel cuando está seco, flexible cuando está húmedo.',
    curiosidad: 'El lavash tiene más de 3.000 años de historia y está declarado Patrimonio Inmaterial de la Humanidad por la UNESCO.',
  },
  {
    nombre: 'Sangak', nombreOriginal: 'Sangak / سنگک',
    region: 'Oriente Medio', pais: 'Irán', harina: 'Trigo', fermentacion: 'Masa madre',
    texturaMiga: 'Aireada', tiempoFermentacion: '8-12 horas',
    acompañamientos: ['Queso Feta', 'Hierbas persas', 'Yogur'],
    usosComunes: ['Desayuno persa', 'Kebab', 'Acompañamiento'],
    descripcion: 'Pan plano iraní cocido sobre un lecho de piedras pequeñas en horno tradicional, que le dan textura irregular y sabor ahumado.',
    curiosidad: 'El nombre sangak significa literalmente "pequeñas piedras" — las piedras del horno imprimen su marca característica en la base.',
  },
  // ASIA (5)
  {
    nombre: 'Naan', nombreOriginal: 'Naan / نان',
    region: 'Asia', pais: 'India/Pakistán', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '1-2 horas',
    acompañamientos: ['Curry', 'Mantequilla ghee', 'Daal'],
    usosComunes: ['Curry', 'Tikka masala', 'Dipping'],
    descripcion: 'Pan plano indio con mantequilla, cocido en horno tandor de barro a alta temperatura. Burbujeante, suave y ligeramente ahumado.',
    curiosidad: 'El naan de ajo y mantequilla es la mayor exportación culinaria india al mundo occidental.',
  },
  {
    nombre: 'Chapati / Roti', nombreOriginal: 'Chapati / Roti',
    region: 'Asia', pais: 'India', harina: 'Trigo', fermentacion: 'Sin fermentar',
    texturaMiga: 'Plana', tiempoFermentacion: 'Sin reposo',
    acompañamientos: ['Curry', 'Dal', 'Vegetales salteados'],
    usosComunes: ['Comidas cotidianas', 'Desayuno', 'Cubierto comestible'],
    descripcion: 'Pan plano indio sin fermentar cocido en plancha de hierro. El más básico y cotidiano de la cocina india, preparado fresco en cada comida.',
    curiosidad: 'Una familia india típica consume entre 5 y 10 chapatis por persona al día.',
  },
  {
    nombre: 'Mantou', nombreOriginal: 'Mantou / 馒头',
    region: 'Asia', pais: 'China', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '1-2 horas',
    acompañamientos: ['Leche condensada', 'Salsa de soja', 'Verduras encurtidas'],
    usosComunes: ['Desayuno chino', 'Dim sum', 'Acompañamiento'],
    descripcion: 'Bollo chino al vapor, blanco y suave. Sin relleno en el norte de China, es el acompañamiento básico de muchas comidas.',
    curiosidad: 'Según la leyenda, Zhuge Liang los inventó para sustituir las cabezas humanas usadas en rituales militares.',
  },
  {
    nombre: 'Bánh mì', nombreOriginal: 'Bánh mì',
    region: 'Asia', pais: 'Vietnam', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Aireada', tiempoFermentacion: '2-4 horas',
    acompañamientos: ['Paté', 'Cerdo asado', 'Vegetales encurtidos'],
    usosComunes: ['Bocadillo bánh mì', 'Tostadas', 'Sándwich vietnamita'],
    descripcion: 'Baguette vietnamita resultado de la influencia francesa en Indochina. Más ligero y crujiente que la baguette francesa, adaptado al clima tropical.',
    curiosidad: 'Vietnam produce más baguettes per cápita que Francia — el bánh mì es el sándwich callejero más vendido del mundo.',
  },
  {
    nombre: 'Shokupan', nombreOriginal: 'Shokupan / 食パン',
    region: 'Asia', pais: 'Japón', harina: 'Trigo', fermentacion: 'Levadura comercial',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '2-4 horas',
    acompañamientos: ['Mantequilla', 'Mermelada de fresa', 'Pasta de judía roja'],
    usosComunes: ['Desayuno japonés', 'Tostadas', 'Sándwiches japoneses'],
    descripcion: 'Pan de molde japonés ultra tierno con la técnica Tangzhong (mezcla de harina y agua cocida). La miga más suave y esponjosa del mundo.',
    curiosidad: 'Existen panaderías en Japón donde una hogaza de shokupan premium cuesta 20€ y hay lista de espera.',
  },
  // AMÉRICAS (4)
  {
    nombre: 'Tortilla de maíz', nombreOriginal: 'Tortilla de maíz',
    region: 'América', pais: 'México', harina: 'Maíz', fermentacion: 'Sin fermentar',
    texturaMiga: 'Plana', tiempoFermentacion: 'Sin reposo',
    acompañamientos: ['Guacamole', 'Salsa', 'Frijoles'],
    usosComunes: ['Tacos', 'Enchiladas', 'Tostadas'],
    descripcion: 'Pan plano mexicano de masa de maíz nixtamalizado. Base de la cocina mexicana con 10.000 años de historia. Cocido en comal sin aceite.',
    curiosidad: 'La nixtamalización (cocer el maíz con cal) multiplica por 20 el contenido de niacina disponible.',
  },
  {
    nombre: 'Pan de bono', nombreOriginal: 'Pan de bono',
    region: 'América', pais: 'Colombia', harina: 'Maíz', fermentacion: 'Sin fermentar',
    texturaMiga: 'Esponjosa', tiempoFermentacion: 'Sin reposo',
    acompañamientos: ['Chocolate caliente', 'Café de olla', 'Queso fresco'],
    usosComunes: ['Desayuno colombiano', 'Merienda', 'Acompañamiento'],
    descripcion: 'Pan de queso colombiano hecho con almidón de yuca y queso costeño. Esponjoso, ligeramente ácido y muy adictivo. Especialidad del Valle del Cauca.',
    curiosidad: 'El pan de bono de Alcalá (Valle) tiene fama nacional — la gente viaja horas solo para comprarlo.',
  },
  {
    nombre: 'Cachapa', nombreOriginal: 'Cachapa',
    region: 'América', pais: 'Venezuela', harina: 'Maíz', fermentacion: 'Sin fermentar',
    texturaMiga: 'Plana', tiempoFermentacion: 'Sin reposo',
    acompañamientos: ['Queso de mano', 'Mantequilla', 'Jamón'],
    usosComunes: ['Desayuno venezolano', 'Merienda', 'Cena ligera'],
    descripcion: 'Tortita venezolana de maíz dulce fresco, cocida en budare (plancha de hierro). Más dulce y húmeda que la tortilla mexicana.',
    curiosidad: 'El maíz para la cachapa debe ser tan tierno que se exprime con la mano — no es harina seca.',
  },
  {
    nombre: 'Pão de queijo', nombreOriginal: 'Pão de queijo',
    region: 'América', pais: 'Brasil', harina: 'Maíz', fermentacion: 'Sin fermentar',
    texturaMiga: 'Esponjosa', tiempoFermentacion: 'Sin reposo',
    acompañamientos: ['Café brasileño', 'Mantequilla', 'Requeijão'],
    usosComunes: ['Desayuno', 'Merienda', 'Aperitivo'],
    descripcion: 'Bolita brasileña de almidón de tapioca y queso minas, sin gluten. Exterior crujiente, interior ultra esponjoso y elástico.',
    curiosidad: 'Se originó en las cocinas afrobrasileñas durante el periodo colonial: las personas esclavizadas en Minas Gerais aprovechaban los restos de tapioca y queso minas que la población blanca desechaba. La técnica, refinada durante generaciones, pasó al recetario nacional brasileño.',
  },
  // ÁFRICA (2)
  {
    nombre: 'Injera', nombreOriginal: 'Injera / እንጀራ',
    region: 'África', pais: 'Etiopía/Eritrea', harina: 'Cebada', fermentacion: 'Masa madre',
    texturaMiga: 'Esponjosa', tiempoFermentacion: '2-3 días',
    acompañamientos: ['Wats', 'Gomen', 'Tibs'],
    usosComunes: ['Base de comida etíope', 'Cubiertos comestibles', 'Plato compartido'],
    descripcion: 'Pan fermentado etíope esponjoso y ácido, hecho con tef (cereal local). Sirve como plato, cubiertos y comida simultáneamente.',
    curiosidad: 'El tef que se usa para el injera es el cereal más pequeño del mundo — 150 semillas pesan 1 gramo.',
  },
  {
    nombre: 'Kisra', nombreOriginal: 'Kisra / كسرة',
    region: 'África', pais: 'Sudán/África del Este', harina: 'Cebada', fermentacion: 'Masa madre',
    texturaMiga: 'Plana', tiempoFermentacion: '8-12 horas',
    acompañamientos: ['Guisos de legumbres', 'Humus de habas', 'Yogur'],
    usosComunes: ['Acompañamiento', 'Cubierto comestible', 'Desayuno sudanés'],
    descripcion: 'Pan plano sudanés fermentado naturalmente, cocido en plancha de barro. Tiene acidez característica y se usa para recoger guisos con los dedos.',
    curiosidad: 'El kisra se fermenta en vasijas de barro específicas que se pasan de generación en generación en familias sudanesas.',
  },
];

const REGIONES: RegionPan[] = ['Europa', 'América', 'Asia', 'Oriente Medio', 'África'];
const HARINAS: TipoHarina[] = ['Trigo', 'Centeno', 'Maíz', 'Cebada'];
const FERMENTACIONES: TipoFermentacion[] = ['Masa madre', 'Levadura comercial', 'Sin fermentar', 'Bicarbonato'];
const TEXTURAS: TexturaMiga[] = ['Esponjosa', 'Densa', 'Aireada', 'Compacta', 'Plana'];

const REGION_COLOR: Record<RegionPan, string> = {
  Europa: '#2E86AB',
  América: '#48A9A6',
  Asia: '#E07A5F',
  'Oriente Medio': '#F2CC8F',
  África: '#81B29A',
};

const FERMENTACION_EMOJI: Record<TipoFermentacion, string> = {
  'Masa madre': '🦠',
  'Levadura comercial': '🔬',
  'Sin fermentar': '⚡',
  'Bicarbonato': '🧪',
};

export default function GuiaTiposPan() {
  const [busqueda, setBusqueda] = useState('');
  const [regionFiltro, setRegionFiltro] = useState<RegionPan | ''>('');
  const [harinaFiltro, setHarinaFiltro] = useState<TipoHarina | ''>('');
  const [fermentacionFiltro, setFermentacionFiltro] = useState<TipoFermentacion | ''>('');
  const [texturaFiltro, setTexturaFiltro] = useState<TexturaMiga | ''>('');

  const panesFiltrados = useMemo(() => {
    return PANES.filter((pan) => {
      const termino = busqueda.toLowerCase();
      const coincideBusqueda =
        !busqueda ||
        pan.nombre.toLowerCase().includes(termino) ||
        pan.nombreOriginal.toLowerCase().includes(termino) ||
        pan.pais.toLowerCase().includes(termino) ||
        pan.region.toLowerCase().includes(termino);

      const coincideRegion = !regionFiltro || pan.region === regionFiltro;
      const coincideHarina = !harinaFiltro || pan.harina === harinaFiltro;
      const coincideFermentacion = !fermentacionFiltro || pan.fermentacion === fermentacionFiltro;
      const coincideTextura = !texturaFiltro || pan.texturaMiga === texturaFiltro;

      return coincideBusqueda && coincideRegion && coincideHarina && coincideFermentacion && coincideTextura;
    });
  }, [busqueda, regionFiltro, harinaFiltro, fermentacionFiltro, texturaFiltro]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setRegionFiltro('');
    setHarinaFiltro('');
    setFermentacionFiltro('');
    setTexturaFiltro('');
  };

  const hayFiltrosActivos = busqueda || regionFiltro || harinaFiltro || fermentacionFiltro || texturaFiltro;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono} aria-hidden="true">🍞</div>
        <h1>Guía de Tipos de Pan del Mundo</h1>
        <p>35 tipos de pan: historia, fermentación, harina y maridaje. Fichas de panadería de Europa, Asia, América, Oriente Medio y África.</p>
      </header>

      <LegalNotice />

      <section className={styles.seccionFiltros} aria-label="Filtros de búsqueda">
        <div className={styles.buscadorWrapper}>
          <label htmlFor="buscador" className={styles.buscadorLabel}>
            Buscar pan
          </label>
          <input
            id="buscador"
            type="search"
            className={styles.buscador}
            placeholder="Buscar por nombre, país o región..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar tipo de pan"
          />
        </div>

        <div className={styles.filtrosGrupo}>
          <div className={styles.filtroItem}>
            <label htmlFor="filtroRegion" className={styles.filtroLabel}>Región</label>
            <select
              id="filtroRegion"
              className={styles.filtroSelect}
              value={regionFiltro}
              onChange={(e) => setRegionFiltro(e.target.value as RegionPan | '')}
            >
              <option value="">Todas las regiones</option>
              {REGIONES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroItem}>
            <label htmlFor="filtroHarina" className={styles.filtroLabel}>Harina</label>
            <select
              id="filtroHarina"
              className={styles.filtroSelect}
              value={harinaFiltro}
              onChange={(e) => setHarinaFiltro(e.target.value as TipoHarina | '')}
            >
              <option value="">Todos los tipos</option>
              {HARINAS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroItem}>
            <label htmlFor="filtroFermentacion" className={styles.filtroLabel}>Fermentación</label>
            <select
              id="filtroFermentacion"
              className={styles.filtroSelect}
              value={fermentacionFiltro}
              onChange={(e) => setFermentacionFiltro(e.target.value as TipoFermentacion | '')}
            >
              <option value="">Todos los tipos</option>
              {FERMENTACIONES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroItem}>
            <label htmlFor="filtroTextura" className={styles.filtroLabel}>Textura de miga</label>
            <select
              id="filtroTextura"
              className={styles.filtroSelect}
              value={texturaFiltro}
              onChange={(e) => setTexturaFiltro(e.target.value as TexturaMiga | '')}
            >
              <option value="">Todas las texturas</option>
              {TEXTURAS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.contadorFiltros}>
          <span className={styles.contador} role="status" aria-live="polite">
            Mostrando <strong>{panesFiltrados.length}</strong> de <strong>{PANES.length}</strong> tipos de pan
          </span>
          {hayFiltrosActivos && (
            <button
              type="button"
              className={styles.btnLimpiar}
              onClick={limpiarFiltros}
              aria-label="Limpiar todos los filtros"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      <section className={styles.grid} aria-label="Fichas de tipos de pan">
        {panesFiltrados.length === 0 ? (
          <div className={styles.sinResultados} role="alert">
            <p>No se encontraron panes con esos filtros.</p>
            <button type="button" className={styles.btnLimpiar} onClick={limpiarFiltros}>
              Ver todos
            </button>
          </div>
        ) : (
          panesFiltrados.map((pan) => (
            <article key={pan.nombre} className={styles.card}>
              <div
                className={styles.cardHeader}
                style={{ borderLeftColor: REGION_COLOR[pan.region] }}
              >
                <h2 className={styles.cardNombre}>{pan.nombre}</h2>
                <p className={styles.cardNombreOriginal}>{pan.nombreOriginal}</p>
                <p className={styles.cardPais}>{pan.pais}</p>
              </div>

              <div className={styles.cardBadges}>
                <span
                  className={styles.badge}
                  style={{ backgroundColor: REGION_COLOR[pan.region], color: '#fff' }}
                >
                  {pan.region}
                </span>
                <span className={styles.badgeSecundario}>{pan.harina}</span>
                <span className={styles.badgeFermentacion}>
                  {FERMENTACION_EMOJI[pan.fermentacion]} {pan.fermentacion}
                </span>
                <span className={styles.badgeTextura}>{pan.texturaMiga}</span>
              </div>

              <div className={styles.cardTiempo}>
                <span className={styles.tiempoLabel}>Fermentación:</span>
                <span className={styles.tiempoValor}>{pan.tiempoFermentacion}</span>
              </div>

              <p className={styles.cardDescripcion}>{pan.descripcion}</p>

              <div className={styles.cardSecciones}>
                <div className={styles.cardSeccion}>
                  <h3 className={styles.seccionTitulo}>Acompañamientos</h3>
                  <div className={styles.pillsRow}>
                    {pan.acompañamientos.map((ac) => (
                      <span key={ac} className={styles.pill}>{ac}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardSeccion}>
                  <h3 className={styles.seccionTitulo}>Usos comunes</h3>
                  <ul className={styles.usosList}>
                    {pan.usosComunes.map((uso) => (
                      <li key={uso}>{uso}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.curiosidad}>
                <span className={styles.curiosidadIcono} aria-hidden="true">💡</span>
                <em>{pan.curiosidad}</em>
              </div>
            </article>
          ))
        )}
      </section>

      <EducationalSection
        title="Guía de Tipos de Pan"
        subtitle="Descubre los panes del mundo: su historia, técnicas de fermentación y el arte de la panadería artesanal"
        icon="🍞"
      >
        <div className={styles.eduContenido}>
          {/* Tabla comparativa */}
          <div className={styles.eduSeccion}>
            <h4 className={styles.eduTitulo}>Comparativa de técnicas de fermentación</h4>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Técnica</th>
                    <th>Tiempo</th>
                    <th>Sabor</th>
                    <th>Ejemplo</th>
                    <th>Dificultad</th>
                    <th>Conservación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Masa madre</td>
                    <td>12-48h</td>
                    <td>Ácido, complejo</td>
                    <td>Sourdough, Hogaza</td>
                    <td>Alta</td>
                    <td>4-7 días</td>
                  </tr>
                  <tr>
                    <td>Levadura comercial</td>
                    <td>1-4h</td>
                    <td>Suave, neutro</td>
                    <td>Baguette, Naan</td>
                    <td>Media</td>
                    <td>2-3 días</td>
                  </tr>
                  <tr>
                    <td>Sin fermentar</td>
                    <td>0h</td>
                    <td>Neutro, fresco</td>
                    <td>Chapati, Lavash</td>
                    <td>Baja</td>
                    <td>1-2 días</td>
                  </tr>
                  <tr>
                    <td>Bicarbonato</td>
                    <td>0h</td>
                    <td>Ligero, neutro</td>
                    <td>Cornbread</td>
                    <td>Muy baja</td>
                    <td>2-3 días</td>
                  </tr>
                  <tr>
                    <td>Fermentación mixta</td>
                    <td>8-24h</td>
                    <td>Equilibrado</td>
                    <td>Ciabatta</td>
                    <td>Media-alta</td>
                    <td>2-4 días</td>
                  </tr>
                  <tr>
                    <td>Fermentación lenta en frío</td>
                    <td>24-72h</td>
                    <td>Muy complejo</td>
                    <td>Pumpernickel</td>
                    <td>Alta</td>
                    <td>7-14 días</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Casos de uso por perfil */}
          <div className={styles.eduSeccion}>
            <h4 className={styles.eduTitulo}>¿Qué pan te conviene según tu perfil?</h4>
            <div className={styles.perfilesGrid}>
              <div className={styles.perfilCard}>
                <span className={styles.perfilIcono} aria-hidden="true">🥐</span>
                <h5>El panadero amateur</h5>
                <p>Empieza con cornbread o chapati — sin fermentación ni técnica especial. Después prueba focaccia con levadura comercial. El sourdough es el reto final.</p>
              </div>
              <div className={styles.perfilCard}>
                <span className={styles.perfilIcono} aria-hidden="true">🌍</span>
                <h5>El foodie viajero</h5>
                <p>Estudia el injera etíope, el bánh mì vietnamita y el lavash armenio. Conocer sus contextos culturales enriquece cada viaje gastronómico.</p>
              </div>
              <div className={styles.perfilCard}>
                <span className={styles.perfilIcono} aria-hidden="true">💪</span>
                <h5>El consciente de la salud</h5>
                <p>El pan de centeno o vollkornbrot con masa madre tiene el índice glucémico más bajo. El injera de tef es rico en hierro y sin gluten.</p>
              </div>
              <div className={styles.perfilCard}>
                <span className={styles.perfilIcono} aria-hidden="true">🍽️</span>
                <h5>El anfitrión gourmet</h5>
                <p>Ciabatta para antipasti, challah para brunch, baguette para quesos y focaccia para aperitivo. El stollen marca la diferencia en Navidad.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className={styles.eduSeccion}>
            <h4 className={styles.eduTitulo}>Preguntas frecuentes sobre el pan</h4>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h5>¿La masa madre es realmente más saludable?</h5>
                <p>Sí, en varios aspectos. La fermentación larga predigiere el gluten, reduce el índice glucémico y aumenta la biodisponibilidad de minerales (zinc, hierro, magnesio). Además, los ácidos orgánicos producidos son conservantes naturales que alargan la vida del pan sin aditivos.</p>
              </div>
              <div className={styles.faqItem}>
                <h5>¿Por qué el pan artesanal dura más que el industrial?</h5>
                <p>La fermentación larga produce ácido acético y láctico que bajan el pH del pan, inhibiendo el crecimiento de moho. Un buen sourdough puede durar 7-10 días; el pan industrial sin conservantes solo 2-3 días.</p>
              </div>
              <div className={styles.faqItem}>
                <h5>¿Cuál es la diferencia entre el pan sin gluten y el pan sin fermentar?</h5>
                <p>Son conceptos distintos. El pan sin fermentar (chapati, lavash) puede contener gluten perfectamente. El pan sin gluten (pão de queijo, injera de tef) no contiene trigo ni cereales con gluten, independientemente de su proceso de fermentación.</p>
              </div>
              <div className={styles.faqItem}>
                <h5>¿Por qué los panes planos no tienen volumen?</h5>
                <p>Los panes planos no tienen volumen porque carecen de fermentación prolongada o porque se cocinan antes de que el gas tenga tiempo de expandir la masa. Algunos como el pita sí se hinchan, pero al enfriar el vapor escapa y queda plano con bolsillo interior.</p>
              </div>
              <div className={styles.faqItem}>
                <h5>¿Puedo sustituir la harina de centeno por trigo en una receta?</h5>
                <p>No directamente. El centeno tiene menos gluten que el trigo y absorbe más agua. Si sustituyes, necesitas ajustar la hidratación (menos agua) y el tiempo de fermentación. Además el sabor cambiará significativamente — el centeno aporta sabor ácido y mineral que el trigo no tiene.</p>
              </div>
            </div>
          </div>

          {/* Pasos para hacer pan en casa */}
          <div className={styles.eduSeccion}>
            <h4 className={styles.eduTitulo}>Cómo hacer tu primer pan artesanal: 5 pasos</h4>
            <div className={styles.pasosList}>
              <div className={styles.paso}>
                <span className={styles.pasoNum} aria-hidden="true">1</span>
                <div>
                  <h5>Elige la receta adecuada a tu nivel</h5>
                  <p>Principiante: pan de soda (bicarbonato) o focaccia. Intermedio: pan con levadura comercial. Avanzado: sourdough con masa madre propia.</p>
                </div>
              </div>
              <div className={styles.paso}>
                <span className={styles.pasoNum} aria-hidden="true">2</span>
                <div>
                  <h5>Pesa los ingredientes — no uses tazas</h5>
                  <p>La panadería es química. Una diferencia de 10g de harina puede cambiar completamente la textura. Usa una báscula de cocina y trabaja siempre en gramos.</p>
                </div>
              </div>
              <div className={styles.paso}>
                <span className={styles.pasoNum} aria-hidden="true">3</span>
                <div>
                  <h5>Respeta los tiempos de fermentación</h5>
                  <p>No acortes la fermentación. Es cuando se desarrollan los sabores y la estructura del pan. Una fermentación apresurada da un pan plano y sin sabor.</p>
                </div>
              </div>
              <div className={styles.paso}>
                <span className={styles.pasoNum} aria-hidden="true">4</span>
                <div>
                  <h5>Hornea a temperatura alta — precalienta bien</h5>
                  <p>La mayoría de panes necesitan 220-250°C. Precalienta el horno al menos 30 minutos antes. Una piedra de hornear o una cocotte de hierro mejoran enormemente la costra.</p>
                </div>
              </div>
              <div className={styles.paso}>
                <span className={styles.pasoNum} aria-hidden="true">5</span>
                <div>
                  <h5>Deja enfriar completamente antes de cortar</h5>
                  <p>El interior del pan sigue cocinándose con el calor residual tras salir del horno. Si lo cortas caliente, la miga queda gomosa. Espera al menos 1 hora para pan de masa madre.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className={styles.eduSeccion}>
            <h4 className={styles.eduTitulo}>5 consejos de panadero profesional</h4>
            <div className={styles.tipsList}>
              <div className={styles.tip}>
                <span className={styles.tipIcono} aria-hidden="true">💧</span>
                <p><strong>La hidratación lo es todo:</strong> Una masa con 70% de agua da miga aireada; al 50% da miga compacta. Empieza con hidrataciones bajas y ve subiendo conforme ganas práctica.</p>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipIcono} aria-hidden="true">🌡️</span>
                <p><strong>La temperatura del agua importa:</strong> Usa agua a 22-24°C para fermentaciones normales. En verano usa agua fría para ralentizar la fermentación; en invierno, agua templada para activarla.</p>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipIcono} aria-hidden="true">🧂</span>
                <p><strong>La sal va al final:</strong> La sal ralentiza y puede matar la levadura. Añade la sal siempre después de que la levadura esté disuelta en el agua y mezclada con la harina.</p>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipIcono} aria-hidden="true">🔪</span>
                <p><strong>El greñado no es decorativo:</strong> Los cortes en la superficie del pan antes de hornear permiten que escape el vapor controladamente y el pan suba uniformemente. Sin greñado, el pan explota por donde quiere.</p>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipIcono} aria-hidden="true">📦</span>
                <p><strong>Guarda el pan correctamente:</strong> Nunca en la nevera (reseca la miga). A temperatura ambiente en bolsa de tela o papel. El pan de masa madre aguanta mejor en tabla de madera a temperatura ambiente.</p>
              </div>
            </div>
          </div>

          {/* Warning box */}
          <div className={styles.warningBox} role="note">
            <h4 className={styles.warningTitulo}>
              <span aria-hidden="true">⚠️</span> Errores comunes en panadería casera
            </h4>
            <ul className={styles.warningList}>
              <li><strong>Usar levadura caducada:</strong> La levadura muerta no fermenta. Prueba disolviéndola en agua tibia con azúcar — si no forma espuma en 10 minutos, está caducada.</li>
              <li><strong>Amasar en exceso o en defecto:</strong> Poco amasado = pan sin estructura que no sube. Demasiado amasado = gluten sobredesarrollado y pan gomoso. La ventana del gluten (la masa se estira sin romperse) es la señal correcta.</li>
              <li><strong>Abrir el horno durante el horneado:</strong> El golpe de frío hace que el pan no suba o se hunda. Respeta los primeros 20-25 minutos sin abrir la puerta en ningún caso.</li>
              <li><strong>Trabajar la masa madre sin alimentarla:</strong> La masa madre necesita alimentarse regularmente. Usarla directamente del frigo sin activar previamente da panes pobres y con poco sabor ácido.</li>
            </ul>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-tipos-pan')} />
      <ShareCard appName="guia-tipos-pan" />
      <Footer appName="guia-tipos-pan" />
    </div>
  );
}
