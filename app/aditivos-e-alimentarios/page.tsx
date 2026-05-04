'use client';

import { useState, useMemo } from 'react';
import styles from './AdditivosEAlimentarios.module.css';
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
// DATOS
// ============================================================

type Origen = 'Natural' | 'Sintético' | 'Semisintético';

interface Aditivo {
  codigo: string;
  nombre: string;
  categoria: string;
  origen: Origen;
  funcion: string;
  alimentos: string[];
}

const CATEGORIAS = [
  'Todos',
  'Colorante',
  'Conservante',
  'Antioxidante',
  'Emulsionante',
  'Estabilizante',
  'Espesante',
  'Gelificante',
  'Regulador de acidez',
  'Potenciador del sabor',
  'Edulcorante',
  'Agente de recubrimiento',
  'Gas de envasado',
  'Antiaglomerante',
] as const;

const ADITIVOS: Aditivo[] = [
  // === COLORANTES (E100–E199) ===
  { codigo: 'E100', nombre: 'Curcumina', categoria: 'Colorante', origen: 'Natural', funcion: 'Colorante amarillo-naranja obtenido de la cúrcuma. Aporta color cálido sin alterar el sabor.', alimentos: ['Mostaza', 'Mantequilla', 'Queso', 'Curry en polvo', 'Margarina'] },
  { codigo: 'E101', nombre: 'Riboflavina (Vitamina B2)', categoria: 'Colorante', origen: 'Natural', funcion: 'Colorante amarillo-naranja de origen natural. También es una vitamina esencial del grupo B.', alimentos: ['Bebidas energéticas', 'Cereales de desayuno', 'Zumos', 'Productos lácteos'] },
  { codigo: 'E102', nombre: 'Tartrazina', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante amarillo limón de síntesis. Muy estable al calor y la luz. Puede causar reacciones en personas con sensibilidad.', alimentos: ['Bebidas refrescantes', 'Golosinas', 'Gelatinas', 'Salsas', 'Snacks'] },
  { codigo: 'E104', nombre: 'Amarillo de quinoleína', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante amarillo-verdoso de síntesis. Uso limitado en algunos países. Estable en soluciones ácidas.', alimentos: ['Bebidas', 'Helados', 'Productos de confitería'] },
  { codigo: 'E110', nombre: 'Amarillo ocaso FCF', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante naranja-amarillo de síntesis. Requiere etiquetado de advertencia en la UE cuando se combina con otros colorantes azoicos.', alimentos: ['Bebidas naranja', 'Bollería industrial', 'Gelatinas', 'Mermeladas'] },
  { codigo: 'E120', nombre: 'Cochinilla / Carmín', categoria: 'Colorante', origen: 'Natural', funcion: 'Colorante rojo intenso extraído del insecto Dactylopius coccus. Muy estable. No apto para veganos ni vegetarianos.', alimentos: ['Yogur de fresa', 'Embutidos', 'Zumos rojos', 'Caramelos', 'Cosméticos'] },
  { codigo: 'E122', nombre: 'Azorrubina', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante rojo-cereza de síntesis. Requiere advertencia en la UE por posible efecto en la atención infantil.', alimentos: ['Gelatinas', 'Caramelos', 'Conservas de cerezas', 'Bebidas alcohólicas'] },
  { codigo: 'E124', nombre: 'Rojo Ponceau 4R', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante rojo brillante de síntesis. Muy resistente al calor. Requiere advertencia en la UE.', alimentos: ['Paté de salmón', 'Caviar artificial', 'Caramelos', 'Helados'] },
  { codigo: 'E129', nombre: 'Rojo Allura AC', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante rojo-naranja de síntesis. Ampliamente usado en EE.UU. Requiere advertencia en la UE.', alimentos: ['Bebidas de frutas', 'Gelatinas', 'Caramelos', 'Kétchup'] },
  { codigo: 'E131', nombre: 'Azul patentado V', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante azul intenso de síntesis. Se usa en combinación con otros colorantes para obtener verdes y negros.', alimentos: ['Bebidas azules', 'Caramelos', 'Helados de color'] },
  { codigo: 'E132', nombre: 'Indigotina', categoria: 'Colorante', origen: 'Semisintético', funcion: 'Colorante azul derivado del índigo natural, producido hoy por síntesis. Poco estable al calor y la luz.', alimentos: ['Dulces', 'Bebidas', 'Productos de confitería azules o verdes'] },
  { codigo: 'E133', nombre: 'Azul brillante FCF', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante azul brillante de síntesis. Muy estable. Combinado con E102 produce verde.', alimentos: ['Bebidas', 'Gelatinas verdes', 'Helados', 'Caramelos'] },
  { codigo: 'E140', nombre: 'Clorofilas', categoria: 'Colorante', origen: 'Natural', funcion: 'Pigmentos verdes naturales extraídos de vegetales. Aportan color verde a los alimentos. Sensibles al calor.', alimentos: ['Aceites', 'Verduras en conserva', 'Bebidas verdes', 'Chicles'] },
  { codigo: 'E150a', nombre: 'Caramelo', categoria: 'Colorante', origen: 'Natural', funcion: 'Colorante marrón obtenido por caramelización del azúcar sin aditivos. El más usado a nivel mundial.', alimentos: ['Cola y bebidas de cola', 'Cerveza oscura', 'Salsas', 'Vinagre balsámico'] },
  { codigo: 'E150d', nombre: 'Caramelo de sulfito amónico', categoria: 'Colorante', origen: 'Semisintético', funcion: 'Colorante marrón intenso producido con sulfito y amoniaco. Dosis limitada por normativa EFSA.', alimentos: ['Bebidas de cola', 'Cerveza', 'Pan de centeno', 'Salsas oscuras'] },
  { codigo: 'E160a', nombre: 'Carotenos', categoria: 'Colorante', origen: 'Natural', funcion: 'Pigmentos naranjas-rojos naturales (alfa, beta, gamma caroteno). El beta-caroteno es precursor de vitamina A.', alimentos: ['Margarina', 'Zumos', 'Queso', 'Mantequilla', 'Bebidas energéticas'] },
  { codigo: 'E160b', nombre: 'Annato / Bixina / Norbixina', categoria: 'Colorante', origen: 'Natural', funcion: 'Colorante naranja-amarillo extraído de las semillas del árbol achiote. Estable al calor y la luz.', alimentos: ['Queso Cheddar', 'Mantequilla', 'Margarina', 'Snacks', 'Arroz de colorear'] },
  { codigo: 'E162', nombre: 'Rojo de remolacha', categoria: 'Colorante', origen: 'Natural', funcion: 'Colorante rojo obtenido de la remolacha roja. Sensible al calor y al pH. Apto para veganos.', alimentos: ['Helados', 'Yogur de fresa', 'Sopas', 'Productos de repostería'] },
  { codigo: 'E171', nombre: 'Dióxido de titanio', categoria: 'Colorante', origen: 'Sintético', funcion: 'Colorante blanco opacificante. La EFSA concluyó en 2021 que no puede excluirse su genotoxicidad. Prohibido en alimentos en la UE desde 2022.', alimentos: ['Confites de chocolate (uso histórico)', 'Chicles (uso histórico)'] },
  { codigo: 'E172', nombre: 'Óxidos e hidróxidos de hierro', categoria: 'Colorante', origen: 'Natural', funcion: 'Colorantes amarillo, rojo, negro según el grado de oxidación. De origen mineral. Solo en alimentos específicos.', alimentos: ['Aceitunas', 'Corteza de quesos maduros', 'Productos cárnicos'] },

  // === CONSERVANTES (E200–E299) ===
  { codigo: 'E200', nombre: 'Ácido sórbico', categoria: 'Conservante', origen: 'Semisintético', funcion: 'Conservante que inhibe el crecimiento de mohos y levaduras. Activo principalmente en medio ácido.', alimentos: ['Quesos', 'Margarinas', 'Productos de repostería', 'Vinos', 'Zumos'] },
  { codigo: 'E202', nombre: 'Sorbato potásico', categoria: 'Conservante', origen: 'Sintético', funcion: 'Sal del ácido sórbico muy soluble en agua. Muy eficaz contra mohos y levaduras. Ampliamente utilizado.', alimentos: ['Queso en lonchas', 'Pan de molde', 'Mermeladas', 'Vino', 'Bebidas'] },
  { codigo: 'E210', nombre: 'Ácido benzoico', categoria: 'Conservante', origen: 'Semisintético', funcion: 'Conservante activo contra levaduras, mohos y bacterias en medio ácido (pH < 4,5).', alimentos: ['Zumos', 'Bebidas refrescantes', 'Salsas', 'Encurtidos'] },
  { codigo: 'E211', nombre: 'Benzoato sódico', categoria: 'Conservante', origen: 'Sintético', funcion: 'Sal del ácido benzoico, más soluble. Combinado con vitamina C puede generar benceno en pequeñas cantidades.', alimentos: ['Bebidas de cola', 'Zumos', 'Kétchup', 'Salsas de ensalada', 'Encurtidos'] },
  { codigo: 'E220', nombre: 'Dióxido de azufre', categoria: 'Conservante', origen: 'Semisintético', funcion: 'Conservante y antioxidante. Inhibe levaduras y bacterias. Puede causar reacciones en asmáticos sensibles. Alérgeno declarado.', alimentos: ['Vino', 'Cerveza', 'Frutos secos', 'Frutas desecadas', 'Zumos'] },
  { codigo: 'E221', nombre: 'Sulfito sódico', categoria: 'Conservante', origen: 'Sintético', funcion: 'Conservante y antioxidante. Libera SO₂ en contacto con ácidos. Alérgeno declarado en la UE (sulfitos ≥ 10 mg/kg).', alimentos: ['Patatas procesadas', 'Camarones', 'Vino', 'Uvas pasas'] },
  { codigo: 'E224', nombre: 'Metabisulfito potásico', categoria: 'Conservante', origen: 'Sintético', funcion: 'Libera SO₂ de forma estable. Muy eficaz en vinificación. Alérgeno declarado. Ampliamente usado en elaboración artesanal.', alimentos: ['Vino', 'Cerveza artesanal', 'Zumos', 'Frutas secas', 'Mariscos'] },
  { codigo: 'E250', nombre: 'Nitrito sódico', categoria: 'Conservante', origen: 'Sintético', funcion: 'Imprescindible contra Clostridium botulinum en carnes curadas. Responsable del color rosado característico. La EFSA estudia su ingesta total.', alimentos: ['Jamón cocido', 'Salchichas', 'Bacon', 'Mortadela', 'Embutidos curados'] },
  { codigo: 'E251', nombre: 'Nitrato sódico', categoria: 'Conservante', origen: 'Sintético', funcion: 'Reservorio de nitritos en embutidos curados. Se convierte lentamente en nitrito durante el curado, prolongando la acción conservante.', alimentos: ['Jamón serrano', 'Salami', 'Chorizo', 'Quesos curados', 'Cecina'] },
  { codigo: 'E252', nombre: 'Nitrato potásico (Salitre)', categoria: 'Conservante', origen: 'Natural', funcion: 'Sal mineral usada históricamente para curar carnes. Reservorio de nitritos. Permite largos períodos de curación.', alimentos: ['Jamón ibérico', 'Embutidos tradicionales', 'Quesos de larga maduración'] },
  { codigo: 'E270', nombre: 'Ácido láctico', categoria: 'Conservante', origen: 'Semisintético', funcion: 'Ácido orgánico que inhibe bacterias y ajusta el pH. Producido en fermentaciones. Presente de forma natural en lácteos fermentados.', alimentos: ['Yogur', 'Queso', 'Encurtidos', 'Pan de masa madre', 'Cerveza'] },
  { codigo: 'E280', nombre: 'Ácido propiónico', categoria: 'Conservante', origen: 'Semisintético', funcion: 'Conservante activo contra mohos. Producido en fermentación de quesos. Inhibe Bacillus en pan de larga duración.', alimentos: ['Pan de molde', 'Productos de bollería', 'Queso en lonchas'] },
  { codigo: 'E282', nombre: 'Propionato cálcico', categoria: 'Conservante', origen: 'Semisintético', funcion: 'Sal del ácido propiónico de fácil dosificación en panadería. Eficaz contra mohos sin afectar levaduras de fermentación.', alimentos: ['Pan de molde', 'Bollería industrial', 'Tortillas de trigo', 'Pasta fresca'] },

  // === ANTIOXIDANTES (E300–E399) ===
  { codigo: 'E300', nombre: 'Ácido ascórbico (Vitamina C)', categoria: 'Antioxidante', origen: 'Semisintético', funcion: 'Antioxidante muy versátil. Previene el pardeamiento y la oxidación de grasas. También mejora el color en carnes y refuerza el gluten en panadería.', alimentos: ['Zumos', 'Mermeladas', 'Pan', 'Embutidos', 'Frutas en conserva'] },
  { codigo: 'E301', nombre: 'Ascorbato sódico', categoria: 'Antioxidante', origen: 'Semisintético', funcion: 'Sal del ácido ascórbico más estable y soluble. Se usa donde se necesita mayor neutralidad de pH.', alimentos: ['Embutidos', 'Conservas de pescado', 'Bebidas', 'Congelados'] },
  { codigo: 'E306', nombre: 'Extracto rico en tocoferoles', categoria: 'Antioxidante', origen: 'Natural', funcion: 'Mezcla natural de tocoferoles (formas de vitamina E) extraída de aceites vegetales. Protege grasas de la oxidación.', alimentos: ['Aceites vegetales', 'Margarinas', 'Snacks fritos', 'Alimentos dietéticos'] },
  { codigo: 'E307', nombre: 'alfa-Tocoferol', categoria: 'Antioxidante', origen: 'Semisintético', funcion: 'Forma sintética de vitamina E. Antioxidante para grasas y aceites. Liposoluble, actúa en la fase grasa del alimento.', alimentos: ['Aceites refinados', 'Margarinas', 'Alimentos infantiles', 'Cereales'] },
  { codigo: 'E320', nombre: 'Butilhidroxianisol (BHA)', categoria: 'Antioxidante', origen: 'Sintético', funcion: 'Antioxidante sintético liposoluble. Muy eficaz en grasas animales. Activo incluso después de cocinado del alimento.', alimentos: ['Patatas fritas (bolsa)', 'Chicles', 'Cereales', 'Aceites vegetales parcialmente hidrogenados'] },
  { codigo: 'E321', nombre: 'Butilhidroxitolueno (BHT)', categoria: 'Antioxidante', origen: 'Sintético', funcion: 'Antioxidante sintético similar al BHA pero más eficaz en grasas vegetales. Frecuentemente en combinación con E320.', alimentos: ['Cereales de desayuno', 'Galletas', 'Snacks', 'Aceites de fritura', 'Chicles'] },
  { codigo: 'E330', nombre: 'Ácido cítrico', categoria: 'Antioxidante', origen: 'Semisintético', funcion: 'Ácido orgánico multifuncional: antioxidante, acidulante y quelante de metales. Producido por fermentación fúngica.', alimentos: ['Bebidas carbonatadas', 'Zumos', 'Mermeladas', 'Helados', 'Caramelos'] },
  { codigo: 'E331', nombre: 'Citratos sódicos', categoria: 'Antioxidante', origen: 'Semisintético', funcion: 'Sales del ácido cítrico. Reguladores de acidez y tampones de pH. También usados como emulsionantes en quesos fundidos.', alimentos: ['Queso fundido', 'Bebidas', 'Helados', 'Leche condensada'] },
  { codigo: 'E338', nombre: 'Ácido fosfórico', categoria: 'Regulador de acidez', origen: 'Sintético', funcion: 'Acidulante inorgánico. Aporta el sabor ácido característico de los refrescos de cola. También conservante y antioxidante.', alimentos: ['Bebidas de cola', 'Cerveza', 'Quesos procesados', 'Carnes curadas'] },

  // === EMULSIONANTES Y ESTABILIZANTES (E400–E499) ===
  { codigo: 'E400', nombre: 'Ácido algínico', categoria: 'Estabilizante', origen: 'Natural', funcion: 'Polisacárido extraído de algas pardas. Espesante y gelificante. Forma geles con calcio. Base de esferificaciones culinarias.', alimentos: ['Helados', 'Productos lácteos', 'Salsas', 'Cocina creativa'] },
  { codigo: 'E401', nombre: 'Alginato sódico', categoria: 'Estabilizante', origen: 'Natural', funcion: 'Sal del ácido algínico soluble en agua fría. Forma geles reversibles. Muy usado en gastronomía molecular.', alimentos: ['Helados', 'Aderezos', 'Espesantes en sopas', 'Esferificaciones'] },
  { codigo: 'E406', nombre: 'Agar-agar', categoria: 'Gelificante', origen: 'Natural', funcion: 'Gelificante extraído de algas rojas. Produce geles firmes a temperatura ambiente. Alternativa vegana a la gelatina animal.', alimentos: ['Gelatinas veganas', 'Flanes', 'Productos asiáticos', 'Confitería'] },
  { codigo: 'E407', nombre: 'Carragenina', categoria: 'Gelificante', origen: 'Natural', funcion: 'Polisacárido de algas rojas. Gelificante y espesante. La lambda-carragenina no gelifica pero espesa. Muy usada en lácteos.', alimentos: ['Leche con chocolate', 'Flanes', 'Cremas', 'Embutidos', 'Helados'] },
  { codigo: 'E410', nombre: 'Harina de semillas de algarrobo', categoria: 'Espesante', origen: 'Natural', funcion: 'Goma natural extraída de semillas de algarrobo. Espesa y estabiliza sin gelificar. Sinérgica con la goma xantana.', alimentos: ['Helados', 'Salsas', 'Quesos', 'Productos de panadería sin gluten'] },
  { codigo: 'E412', nombre: 'Goma guar', categoria: 'Espesante', origen: 'Natural', funcion: 'Galactomanano extraído de la legumbre Cyamopsis. Espesante muy potente, hasta 8 veces más que el almidón. Estabiliza helados.', alimentos: ['Helados', 'Quesos frescos', 'Salsas', 'Productos sin gluten', 'Sopas'] },
  { codigo: 'E415', nombre: 'Goma xantana', categoria: 'Espesante', origen: 'Semisintético', funcion: 'Polisacárido producido por fermentación bacteriana. Espesa y estabiliza a dosis bajas. Estable a variaciones de temperatura y pH.', alimentos: ['Aderezos para ensaladas', 'Productos sin gluten', 'Salsas', 'Helados', 'Bebidas'] },
  { codigo: 'E420', nombre: 'Sorbitol', categoria: 'Edulcorante', origen: 'Semisintético', funcion: 'Poliol derivado de la glucosa. Edulcorante de bajo índice glucémico, también humectante y estabilizante. Puede tener efecto laxante en grandes cantidades.', alimentos: ['Chicles sin azúcar', 'Caramelos dietéticos', 'Mermeladas reducidas en azúcar', 'Productos diabéticos'] },
  { codigo: 'E422', nombre: 'Glicerol', categoria: 'Emulsionante', origen: 'Semisintético', funcion: 'Humectante y solvente multifuncional. Retiene la humedad, suaviza la textura y sirve como vehículo para aromas.', alimentos: ['Pastelería', 'Fondant', 'Bebidas alcohólicas', 'Productos de confitería', 'Marzipán'] },
  { codigo: 'E440', nombre: 'Pectinas', categoria: 'Gelificante', origen: 'Natural', funcion: 'Polisacárido extraído de la piel de cítricos y manzana. Gelificante natural de mermeladas. La pectina LM requiere calcio; la AM requiere azúcar.', alimentos: ['Mermeladas', 'Jaleas', 'Confitería', 'Zumos de fruta', 'Salsas'] },
  { codigo: 'E450', nombre: 'Difosfatos', categoria: 'Emulsionante', origen: 'Sintético', funcion: 'Emulsionantes y reguladores de acidez. Mejoran la retención de agua en carnes y la textura de productos de panadería.', alimentos: ['Quesos fundidos', 'Embutidos', 'Levadura química', 'Patatas fritas', 'Pan'] },
  { codigo: 'E471', nombre: 'Monoglicéridos y diglicéridos de ácidos grasos', categoria: 'Emulsionante', origen: 'Semisintético', funcion: 'Emulsionantes derivados de grasas vegetales o animales. Mejoran la textura y volumen de panes y la creamosidad de helados.', alimentos: ['Pan de molde', 'Helados', 'Margarinas', 'Bollería', 'Chocolate'] },
  { codigo: 'E476', nombre: 'Poliglicerol polirricinoleato', categoria: 'Emulsionante', origen: 'Sintético', funcion: 'Emulsionante derivado del aceite de ricino. Reduce la viscosidad del chocolate, permitiendo usar menos manteca de cacao.', alimentos: ['Chocolate', 'Coberturas de chocolate', 'Sucedáneos de chocolate'] },
  { codigo: 'E481', nombre: 'Estearoil-2-lactilato sódico (SSL)', categoria: 'Emulsionante', origen: 'Semisintético', funcion: 'Mejora el volumen y la textura del pan. Refuerza la red de gluten y retarda el envejecimiento de la miga.', alimentos: ['Pan industrial', 'Bollería', 'Galletas', 'Pastas alimenticias', 'Cremas'] },

  // === REGULADORES DE ACIDEZ Y OTROS (E500–E599) ===
  { codigo: 'E500', nombre: 'Carbonatos sódicos', categoria: 'Regulador de acidez', origen: 'Sintético', funcion: 'Regulador de pH y agente leudante. El bicarbonato sódico (E500ii) reacciona con ácidos liberando CO₂ para esponjar masas.', alimentos: ['Galletas', 'Bizcochos', 'Pan', 'Repostería', 'Bebidas efervescentes'] },
  { codigo: 'E501', nombre: 'Carbonatos potásicos', categoria: 'Regulador de acidez', origen: 'Sintético', funcion: 'Regulador de pH. En panadería, da alcalinidad que produce color y sabor típico en galletas tipo pretzels. También antiaglomerante.', alimentos: ['Pretzels', 'Fideos orientales', 'Cacao alcalinizado', 'Mermeladas'] },
  { codigo: 'E503', nombre: 'Carbonatos amónicos', categoria: 'Regulador de acidez', origen: 'Sintético', funcion: 'Agente leudante que libera CO₂ y NH₃ al calentarse. Da la textura característica a galletas y bizcochos alemanes.', alimentos: ['Galletas de jengibre', 'Bizcochos secos', 'Obleas', 'Bollería artesanal'] },
  { codigo: 'E509', nombre: 'Cloruro cálcico', categoria: 'Regulador de acidez', origen: 'Natural', funcion: 'Aporta calcio para gelificar pectinas LM y carragenina. Endurece la textura de frutas y verduras en conserva.', alimentos: ['Tofu', 'Queso', 'Aceitunas en conserva', 'Vegetales enlatados', 'Esferificaciones'] },
  { codigo: 'E516', nombre: 'Sulfato cálcico', categoria: 'Regulador de acidez', origen: 'Natural', funcion: 'Coagulante para tofu y quesos. Fuente de calcio. También usado como soporte de aromas y aditivo antiapelmazante.', alimentos: ['Tofu', 'Harina de trigo', 'Levadura química', 'Cerveza artesanal'] },
  { codigo: 'E551', nombre: 'Dióxido de silicio', categoria: 'Antiaglomerante', origen: 'Sintético', funcion: 'Antiaglomerante de alta eficacia. Absorbe humedad evitando que los polvos se apelmacen. Inerte e insoluble.', alimentos: ['Sal de mesa', 'Leche en polvo', 'Especias molidas', 'Azúcar glas', 'Suplementos'] },
  { codigo: 'E553b', nombre: 'Talco', categoria: 'Antiaglomerante', origen: 'Natural', funcion: 'Mineral natural (silicato de magnesio) usado como antiaglomerante y recubrimiento. Solo en aplicaciones específicas.', alimentos: ['Arroz precocido', 'Caramelos de goma', 'Quesos en polvo'] },
  { codigo: 'E570', nombre: 'Ácidos grasos', categoria: 'Agente de recubrimiento', origen: 'Semisintético', funcion: 'Agentes de recubrimiento y antiaglomerantes. Lubrican superficies y evitan que los polvos se compacten.', alimentos: ['Caramelos', 'Chicles', 'Suplementos en cápsulas', 'Tabletas de chocolate'] },

  // === POTENCIADORES DEL SABOR (E620–E699) ===
  { codigo: 'E620', nombre: 'Ácido glutámico', categoria: 'Potenciador del sabor', origen: 'Semisintético', funcion: 'Aminoácido que activa los receptores del sabor umami. Base de todos los glutamatos. Presente de forma natural en tomates, quesos y setas.', alimentos: ['Condimentos', 'Sopas', 'Salsas', 'Productos cárnicos procesados'] },
  { codigo: 'E621', nombre: 'Glutamato monosódico (MSG)', categoria: 'Potenciador del sabor', origen: 'Semisintético', funcion: 'Sal sódica del ácido glutámico. Potencia el sabor umami de los alimentos. Producido por fermentación bacteriana. Seguro según EFSA.', alimentos: ['Snacks', 'Sopas instantáneas', 'Salsas', 'Comida china', 'Sazonadores'] },
  { codigo: 'E627', nombre: 'Guanilato disódico', categoria: 'Potenciador del sabor', origen: 'Semisintético', funcion: 'Nucleótido que potencia el sabor umami de forma sinérgica con el glutamato. Dosis muy bajas son suficientes.', alimentos: ['Snacks', 'Sopas', 'Salsas en polvo', 'Condimentos', 'Sazonadores'] },
  { codigo: 'E631', nombre: 'Inosinato disódico', categoria: 'Potenciador del sabor', origen: 'Semisintético', funcion: 'Nucleótido de acción umami sinérgica con E621. Combinado con glutamato y guanilato forma el "triple umami".', alimentos: ['Patatas chips', 'Sopas instantáneas', 'Salsas', 'Sazonadores de carne'] },
  { codigo: 'E635', nombre: 'Ribonucleótidos disódicos', categoria: 'Potenciador del sabor', origen: 'Semisintético', funcion: 'Mezcla de E627 y E631. Potenciador del sabor de amplio espectro. No apto para personas con gota ni hiperuricemia.', alimentos: ['Sopas y caldos', 'Snacks', 'Salsas envasadas', 'Condimentos'] },

  // === EDULCORANTES (E950–E969) ===
  { codigo: 'E950', nombre: 'Acesulfamo K', categoria: 'Edulcorante', origen: 'Sintético', funcion: 'Edulcorante intenso 200 veces más dulce que el azúcar. Sin calorías, muy estable al calor. Sabor ligeramente amargo a dosis altas.', alimentos: ['Bebidas "zero"', 'Chicles sin azúcar', 'Yogur desnatado', 'Postres light'] },
  { codigo: 'E951', nombre: 'Aspartamo', categoria: 'Edulcorante', origen: 'Sintético', funcion: '200 veces más dulce que el azúcar. Pierde dulzor al calentarse. Contiene fenilalanina: no apto para fenilcetonúricos. IARC lo clasificó como "posiblemente cancerígeno" en 2023 con evidencia limitada.', alimentos: ['Bebidas "light"', 'Chicles', 'Yogur', 'Edulcorantes de mesa', 'Medicamentos'] },
  { codigo: 'E952', nombre: 'Ciclamato', categoria: 'Edulcorante', origen: 'Sintético', funcion: '30-50 veces más dulce que el azúcar. Estable al calor. Prohibido en EE.UU. desde 1969. Permitido en la UE con IDA estricta.', alimentos: ['Bebidas dietéticas', 'Confitería sin azúcar', 'Salsas', 'Productos de panadería'] },
  { codigo: 'E954', nombre: 'Sacarina', categoria: 'Edulcorante', origen: 'Sintético', funcion: '300-500 veces más dulce que el azúcar. Sin calorías. Regusto metálico a altas dosis. Uno de los edulcorantes más antiguos (descubierto en 1879).', alimentos: ['Edulcorante de mesa', 'Bebidas dietéticas', 'Productos de repostería sin azúcar'] },
  { codigo: 'E955', nombre: 'Sucralosa', categoria: 'Edulcorante', origen: 'Semisintético', funcion: '600 veces más dulce que el azúcar. Estable al calor. Se obtiene por cloración selectiva de la sacarosa. Sin calorías.', alimentos: ['Bebidas "zero"', 'Productos horneados sin azúcar', 'Helados light', 'Chicles'] },
  { codigo: 'E960', nombre: 'Glucósidos de esteviol (Stevia)', categoria: 'Edulcorante', origen: 'Natural', funcion: '200-300 veces más dulce que el azúcar. Extraído de la planta Stevia rebaudiana. Sin calorías. Regusto herbal a dosis altas.', alimentos: ['Bebidas', 'Yogur', 'Cereales', 'Edulcorantes de mesa', 'Chocolate sin azúcar'] },
  { codigo: 'E965', nombre: 'Maltitol', categoria: 'Edulcorante', origen: 'Semisintético', funcion: 'Poliol con el 75% del dulzor del azúcar y la mitad de calorías. Muy usado en productos "sin azúcar". Puede tener efecto laxante.', alimentos: ['Chocolate sin azúcar', 'Caramelos dietéticos', 'Helados reducidos en azúcar'] },
  { codigo: 'E967', nombre: 'Xilitol', categoria: 'Edulcorante', origen: 'Semisintético', funcion: 'Poliol con sabor similar al azúcar y efecto refrescante. Anticariogénico: inhibe Streptococcus mutans. Tóxico para perros.', alimentos: ['Chicles dentales', 'Caramelos para la garganta', 'Pasta de dientes', 'Medicamentos'] },

  // === AGENTES DE RECUBRIMIENTO Y GASES (E900–E949) ===
  { codigo: 'E900', nombre: 'Dimetilpolisiloxano', categoria: 'Antiaglomerante', origen: 'Sintético', funcion: 'Antiespumante en aceites de fritura y jugos de frutas. También agente de recubrimiento. Impide la formación de espuma en frituras industriales.', alimentos: ['Aceites para fritura industrial', 'Zumos de fruta', 'Vinos', 'Confitería'] },
  { codigo: 'E901', nombre: 'Cera de abeja', categoria: 'Agente de recubrimiento', origen: 'Natural', funcion: 'Cera natural producida por abejas. Crea una película protectora sobre frutas y confites. Da brillo y previene la deshidratación.', alimentos: ['Frutas (manzanas, naranja)', 'Confites de chocolate', 'Chicles', 'Quesos'] },
  { codigo: 'E903', nombre: 'Cera de carnauba', categoria: 'Agente de recubrimiento', origen: 'Natural', funcion: 'Cera vegetal extraída de la palma Copernicia prunifera. Durísima y brillante. Recubrimiento vegano. Una de las ceras más duras conocidas.', alimentos: ['Frutas', 'Confites', 'Caramelos', 'Chicles', 'Tabletas y cápsulas'] },
  { codigo: 'E941', nombre: 'Nitrógeno', categoria: 'Gas de envasado', origen: 'Natural', funcion: 'Gas inerte usado para crear atmósferas protectoras que desplazan el oxígeno. Previene la oxidación y el crecimiento aeróbico.', alimentos: ['Patatas fritas (bolsa)', 'Café envasado', 'Vino envasado', 'Quesos'] },
  { codigo: 'E942', nombre: 'Óxido nitroso', categoria: 'Gas de envasado', origen: 'Semisintético', funcion: 'Gas propelente para nata montada. Soluble en grasas, produce la textura espumosa característica al despresurizar.', alimentos: ['Nata montada en spray', 'Mousse envasado', 'Productos de repostería en aerosol'] },
];

// ============================================================
// COMPONENTE
// ============================================================

const ORIGEN_COLORES: Record<Origen, string> = {
  Natural: styles.origenNatural,
  Sintético: styles.origenSintetico,
  Semisintético: styles.origenSemisintetico,
};

export default function AdditivosEAlimentariosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  const aditivosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return ADITIVOS.filter((a) => {
      const coincideCategoria = categoriaActiva === 'Todos' || a.categoria === categoriaActiva;
      const coincideBusqueda =
        !q ||
        a.codigo.toLowerCase().includes(q) ||
        a.nombre.toLowerCase().includes(q) ||
        a.funcion.toLowerCase().includes(q) ||
        a.alimentos.some((al) => al.toLowerCase().includes(q));
      return coincideCategoria && coincideBusqueda;
    });
  }, [busqueda, categoriaActiva]);

  const categoriasConConteo = useMemo(() => {
    return CATEGORIAS.map((cat) => {
      const count =
        cat === 'Todos' ? ADITIVOS.length : ADITIVOS.filter((a) => a.categoria === cat).length;
      return { nombre: cat, count };
    }).filter((c) => c.count > 0);
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
          <h1 className={styles.title}>🏷️ Guía de Aditivos E Alimentarios</h1>
          <p className={styles.subtitle}>
            Consulta los 90 aditivos E más comunes: código, categoría, origen y función. Información oficial EFSA.
          </p>
          <div className={styles.heroStats}>
            <span className={styles.stat}><strong>{ADITIVOS.length}</strong> aditivos</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><strong>{CATEGORIAS.length - 1}</strong> categorías</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><strong>3</strong> tipos de origen</span>
          </div>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="medical"
          severity="high"
          collapsible={false}
          context="aditivos-e-alimentarios"
        />

        {/* Buscador */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Busca por código E, nombre o alimento…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar aditivo alimentario"
            />
            {busqueda && (
              <button
                className={styles.clearBtn}
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtros por categoría */}
        <div className={styles.filtrosWrapper} role="group" aria-label="Filtrar por categoría">
          {categoriasConConteo.map(({ nombre, count }) => (
            <button
              key={nombre}
              className={`${styles.filtroBtn} ${categoriaActiva === nombre ? styles.filtroActivo : ''}`}
              onClick={() => setCategoriaActiva(nombre)}
              aria-pressed={categoriaActiva === nombre}
            >
              {nombre}
              {nombre !== 'Todos' && <span className={styles.filtroCount}>{count}</span>}
            </button>
          ))}
        </div>

        {/* Resultados */}
        <div className={styles.resultadosHeader} role="status" aria-live="polite">
          {aditivosFiltrados.length === 0 ? (
            <p className={styles.sinResultados}>No hay resultados para «{busqueda}»</p>
          ) : (
            <p className={styles.contadorResultados}>
              {aditivosFiltrados.length === ADITIVOS.length
                ? `Mostrando todos los ${ADITIVOS.length} aditivos`
                : `${aditivosFiltrados.length} aditivo${aditivosFiltrados.length !== 1 ? 's' : ''} encontrado${aditivosFiltrados.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* Grid de tarjetas */}
        <div className={styles.additivosGrid}>
          {aditivosFiltrados.map((a) => (
            <article key={a.codigo} className={styles.additivoCard}>
              <div className={styles.cardHeader}>
                <span className={styles.codigo}>{a.codigo}</span>
                <span className={styles.categoriaBadge}>{a.categoria}</span>
              </div>
              <h3 className={styles.nombre}>{a.nombre}</h3>
              <span className={`${styles.origenBadge} ${ORIGEN_COLORES[a.origen]}`}>
                {a.origen}
              </span>
              <p className={styles.funcion}>{a.funcion}</p>
              <div className={styles.alimentosSection}>
                <span className={styles.alimentosLabel}>Presente en:</span>
                <div className={styles.alimentosTags}>
                  {a.alimentos.map((al) => (
                    <span key={al} className={styles.alimentoTag}>{al}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="📚 Todo lo que debes saber sobre los aditivos E"
          subtitle="Entiende qué son, por qué se usan y cómo leer las etiquetas"
        >
          {/* 1. Tabla comparativa de categorías */}
          <section className={styles.guideSection}>
            <h2>📊 Categorías de aditivos E</h2>
            <p>
              Los aditivos alimentarios se agrupan por su función tecnológica. La normativa europea (Reglamento CE 1333/2008) establece 26 categorías funcionales. Estas son las más frecuentes en el etiquetado:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Rango E</th>
                    <th>Función principal</th>
                    <th>Ejemplo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Colorante</td><td>E100–E199</td><td>Aportar o restituir color</td><td>E102 Tartrazina</td></tr>
                  <tr><td>Conservante</td><td>E200–E299</td><td>Prolongar la vida útil frente a microorganismos</td><td>E202 Sorbato potásico</td></tr>
                  <tr><td>Antioxidante</td><td>E300–E399</td><td>Prevenir la oxidación de grasas y colores</td><td>E300 Vitamina C</td></tr>
                  <tr><td>Emulsionante</td><td>E400–E499</td><td>Mezclar grasas y agua de forma estable</td><td>E471 Monoglicéridos</td></tr>
                  <tr><td>Estabilizante</td><td>E400–E499</td><td>Mantener la textura homogénea</td><td>E415 Goma xantana</td></tr>
                  <tr><td>Potenciador sabor</td><td>E620–E699</td><td>Reforzar el sabor sin añadir sabor propio</td><td>E621 Glutamato MSG</td></tr>
                  <tr><td>Edulcorante</td><td>E950–E969</td><td>Aportar dulzor sin o con pocas calorías</td><td>E960 Stevia</td></tr>
                  <tr><td>Agente recubrimiento</td><td>E900–E904</td><td>Proteger y dar brillo a superficies</td><td>E903 Cera carnauba</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guideSection}>
            <h2>👥 ¿Quién usa esta guía?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🛒</span>
                  <h3>Consumidor en el supermercado</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>E951 en el yogur → Aspartamo → Edulcorante sintético, contiene fenilalanina</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> En segundos puedes saber qué función cumple un código E en un producto antes de comprarlo.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🤧</span>
                  <h3>Persona con intolerancias</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>E220–E228 → Sulfitos → Alérgenos declarados en la UE → evitar si asma</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Identifica rápidamente aditivos que deben evitar personas con alergias o intolerancias específicas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎓</span>
                  <h3>Estudiante de nutrición o tecnología alimentaria</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>E407 Carragenina → Gelificante → algas rojas → kappa/iota/lambda tipos</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Referencia rápida para estudiar las funciones tecnológicas y el origen de cada aditivo.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>👨‍🍳</span>
                  <h3>Cocinero o artesano alimentario</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>E440 Pectina → Gelificante → necesita azúcar (HM) o calcio (LM)</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Comprende cómo funcionan los ingredientes tecnológicos para usarlos correctamente en elaboraciones propias.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>❓ Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué significa exactamente el número E?</h4>
                <p>
                  La «E» significa que el aditivo ha sido evaluado y autorizado en Europa (Europe). El número identifica el aditivo específico. Un aditivo con código E tiene que haber superado la evaluación de seguridad de la EFSA (Autoridad Europea de Seguridad Alimentaria) antes de ser aprobado para uso en alimentos.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Dato:</strong> La EFSA reevalúa periódicamente todos los aditivos. El E171 (dióxido de titanio) fue prohibido en la UE en 2022 tras una reevaluación que no pudo excluir su genotoxicidad.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Natural significa siempre más seguro?</h4>
                <p>
                  No necesariamente. La seguridad depende de la dosis y la persona, no del origen. La curcumina (E100) es natural, pero en dosis muy altas puede ser hepatotóxica. El ácido ascórbico (E300, Vitamina C) se produce industrialmente pero es idéntico al natural y es seguro. Lo que importa es la IDA (Ingesta Diaria Admisible) establecida por la EFSA.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Regla:</strong> Natural ≠ seguro, y sintético ≠ peligroso. La evaluación científica es lo que cuenta.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué aditivos son alérgenos declarados en la UE?</h4>
                <p>
                  Los sulfitos (E220–E228) son alérgenos declarados obligatoriamente en la UE cuando superan los 10 mg/kg en el producto final. Las personas con asma u hipersensibilidad a los sulfitos deben revisar las etiquetas. El aspartamo (E951) debe indicar «contiene una fuente de fenilalanina» por ser relevante para personas con fenilcetonuria.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Consejo:</strong> Busca «sulfitos» o «contiene fenilalanina» en el etiquetado, no solo el código E.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué son los nitritos y por qué son polémicos?</h4>
                <p>
                  Los nitritos (E250, E251) son esenciales para prevenir el botulismo en carnes curadas, uno de los peligros microbiológicos más graves. Su polémica proviene de que, en ciertas condiciones (alta temperatura, entorno ácido), pueden formarse nitrosaminas, compuestos potencialmente carcinogénicos. La OMS clasifica las carnes procesadas como grupo 1 (carcinogénico), aunque el riesgo absoluto en consumo moderado es pequeño.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Contexto:</strong> Sin nitritos, el riesgo de botulismo en embutidos curados sería mucho mayor. Es un equilibrio riesgo-beneficio regulado por la EFSA.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Puede un aditivo E aparecer en productos «ecológicos» o «bio»?</h4>
                <p>
                  Sí, pero solo una lista muy restringida. El Reglamento CE 889/2008 permite ciertos aditivos naturales en producción ecológica: E270 (ácido láctico), E330 (ácido cítrico), E406 (agar), E440 (pectina), E500 (bicarbonato) o E901 (cera de abeja), entre otros. Los colorantes sintéticos y conservantes como benzoatos o sulfitos están prohibidos en ecológico.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Pista:</strong> El sello europeo de agricultura ecológica (hoja verde) garantiza que no hay colorantes artificiales ni conservantes sintéticos.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿El glutamato monosódico (E621) es perjudicial para la salud?</h4>
                <p>
                  Según la EFSA y la FDA, el glutamato monosódico es seguro para la población general. El «síndrome del restaurante chino» no está respaldado científicamente: estudios doble ciego no han reproducido los síntomas atribuidos al MSG. El glutamato está presente de forma natural en tomates, queso parmesano, setas y algas kombu en cantidades similares o superiores a las que se añaden como aditivo.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Dato:</strong> El queso parmesano contiene hasta 1.200 mg de glutamato libre por 100 g, frente a los 500 mg/100 g de los productos más ricos en E621 añadido.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Los edulcorantes intensos son seguros a largo plazo?</h4>
                <p>
                  Los edulcorantes aprobados por la EFSA tienen establecida una IDA basada en estudios toxicológicos. En 2023, la IARC clasificó el aspartamo como «posiblemente cancerígeno» (Grupo 2B), pero con evidencia limitada y a dosis muy superiores a la IDA. La OMS recomienda no usarlos para perder peso, ya que la evidencia sobre su beneficio a largo plazo es débil. El debate científico sigue abierto.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Perspectiva:</strong> «Posiblemente cancerígeno Grupo 2B» incluye también el café y los encurtidos. La dosis es clave.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo sé cuántos aditivos E tiene un producto?</h4>
                <p>
                  Busca en la lista de ingredientes de la etiqueta: todos los aditivos deben declararse por su nombre o código E, precedidos de su función («colorante: E102» o «conservante: sorbato potásico»). En la UE, esta información es obligatoria y debe aparecer en orden decreciente de cantidad para los ingredientes, aunque los aditivos no siguen necesariamente ese orden.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Truco:</strong> Cuantos más aditivos aparezcan al inicio de la lista de ingredientes, mayor proporción tienen en el producto.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>📋 Cómo leer la etiqueta alimentaria en 5 pasos</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Localiza la lista de ingredientes</h4>
                  <p>En la UE es obligatorio declararla en todos los alimentos envasados. Aparece en orden decreciente de peso en el momento de la elaboración. Los ingredientes mayoritarios van primero.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Identifica los códigos E</h4>
                  <p>Busca números precedidos de «E» (E202, E471…) o el nombre del aditivo seguido de su función (ej: «conservante: ácido sórbico»). Ambas formas son legalmente equivalentes.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Consulta el rango del número</h4>
                  <p>El rango te da la categoría: E100–199 colorantes, E200–299 conservantes, E300–399 antioxidantes, E400–499 emulsionantes/espesantes, E620–699 potenciadores del sabor, E950–969 edulcorantes.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Revisa los alérgenos obligatorios</h4>
                  <p>Los sulfitos (E220–228) deben indicarse cuando superan 10 mg/kg. El aspartamo (E951) debe indicar «contiene fenilalanina». Estos avisos aparecen cerca o dentro de la lista de ingredientes, generalmente en negrita.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Contextualiza con el resto del etiquetado</h4>
                  <p>Los aditivos son solo una parte del perfil nutricional. Revisa también el contenido en azúcar, sal y grasas saturadas en la tabla nutricional. Un producto puede tener pocos aditivos E pero ser muy rico en azúcar añadido.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Mejores prácticas */}
          <section className={styles.guideSection}>
            <h2>✅ Consejos para consumidores</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔍</span>
                <h4>Busca por función, no solo por código</h4>
                <p>La etiqueta puede usar el nombre completo en lugar del código E. «Sorbato potásico» y «E202» son lo mismo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🌿</span>
                <h4>Natural no siempre significa sin aditivos</h4>
                <p>Productos etiquetados como «naturales» pueden contener E300 (Vitamina C) o E440 (pectina), que son de origen natural pero siguen siendo aditivos.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚗️</span>
                <h4>El origen importa si tienes restricciones dietéticas</h4>
                <p>E120 (cochinilla) es de insecto: no apto para veganos. E422 (glicerol) puede ser de origen animal. Consulta al fabricante si tienes dudas.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📊</span>
                <h4>Compara productos similares</h4>
                <p>Dos yogures de la misma marca pueden tener listas de aditivos muy diferentes. Comparar etiquetas ayuda a elegir el de menor procesado.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🍷</span>
                <h4>Recuerda los sulfitos en vinos y frutos secos</h4>
                <p>El vino contiene sulfitos de forma natural (fermentación) y añadidos. Los asmáticos sensibles deben revisar etiquetas de bebidas alcohólicas y frutos secos.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📱</span>
                <h4>Usa esta guía en el punto de venta</h4>
                <p>Funciona 100% sin conexión desde el navegador. Busca el código E mientras tienes el producto en la mano en el supermercado.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning box */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon}>⚠️</span>
                <h3>Errores comunes al interpretar los aditivos E</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>❌ Asumir que todos los aditivos E son artificiales:</strong> Muchos son de origen completamente natural: E100 (curcumina), E120 (cochinilla), E300 (vitamina C), E406 (agar), E440 (pectina), E901 (cera de abeja). El código E indica autorización, no síntesis artificial.
                </li>
                <li>
                  <strong>❌ Creer que «sin aditivos» significa sin conservantes de ningún tipo:</strong> La sal (cloruro sódico), el vinagre (ácido acético) y el azúcar son conservantes naturales que no se declaran como «aditivos E» porque son ingredientes. Un producto «sin E» puede tener alta carga de sal o azúcar.
                </li>
                <li>
                  <strong>❌ Generalizar la intolerancia a toda una categoría:</strong> Una sensibilidad a un colorante azoico (E102) no implica sensibilidad a todos los colorantes. Los mecanismos son distintos: algunos son reacciones inmunológicas, otros farmacológicas. La consulta médica individualiza el diagnóstico.
                </li>
                <li>
                  <strong>❌ Confundir «posiblemente cancerígeno Grupo 2B» con cancerígeno confirmado:</strong> El IARC Grupo 2B incluye evidencia limitada o inadecuada. El café, el aloe vera en extracto y los encurtidos también están en este grupo. No es equivalente al Grupo 1 (cancerígeno confirmado) como el alcohol o el tabaco.
                </li>
                <li>
                  <strong>❌ Ignorar la dosis y la frecuencia de consumo:</strong> La IDA (Ingesta Diaria Admisible) establece la cantidad segura para toda la vida. Consumir esporádicamente un producto con E102 no supone el mismo riesgo que consumirlo diariamente en grandes cantidades.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('aditivos-e-alimentarios')} />
        <ShareCard appName="aditivos-e-alimentarios" />
        <Footer appName="aditivos-e-alimentarios" />
      </div>
    </>
  );
}
