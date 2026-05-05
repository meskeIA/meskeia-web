'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaEstilosCerveza.module.css';

type TipoCerveza = 'Ale' | 'Lager' | 'Híbrida' | 'Silvestre';
type ColorEBC = 'Amarillo pálido' | 'Dorado' | 'Ámbar' | 'Cobre' | 'Caoba' | 'Marrón' | 'Negro';
type NivelAmargor = 'Bajo' | 'Medio' | 'Alto' | 'Muy alto';
type Fermentacion = 'Alta' | 'Baja' | 'Espontánea';

interface EstiloCerveza {
  nombre: string;
  nombreOriginal: string;
  tipo: TipoCerveza;
  pais: string;
  colorEBC: ColorEBC;
  fermentacion: Fermentacion;
  ibu: string;
  abv: string;
  temperaturaServicio: string;
  amargor: NivelAmargor;
  notasDeSabor: string[];
  maridaje: string[];
  marcasDestacadas: string[];
  descripcion: string;
  curiosidad: string;
}

const TIPOS: TipoCerveza[] = ['Ale', 'Lager', 'Híbrida', 'Silvestre'];
const COLORES: ColorEBC[] = ['Amarillo pálido', 'Dorado', 'Ámbar', 'Cobre', 'Caoba', 'Marrón', 'Negro'];
const FERMENTACIONES: Fermentacion[] = ['Alta', 'Baja', 'Espontánea'];
const AMARGORES: NivelAmargor[] = ['Bajo', 'Medio', 'Alto', 'Muy alto'];

const COLOR_EBC_HEX: Record<ColorEBC, string> = {
  'Amarillo pálido': '#F5E642',
  'Dorado': '#F0C040',
  'Ámbar': '#D08020',
  'Cobre': '#B06010',
  'Caoba': '#803010',
  'Marrón': '#602010',
  'Negro': '#1A0800',
};

const TIPO_CLASS: Record<TipoCerveza, string> = {
  'Ale': styles.tipoAle,
  'Lager': styles.tipoLager,
  'Híbrida': styles.tipoHibrida,
  'Silvestre': styles.tipoSilvestre,
};

const AMARGOR_CLASS: Record<NivelAmargor, string> = {
  'Bajo': styles.amargorBajo,
  'Medio': styles.amargorMedio,
  'Alto': styles.amargorAlto,
  'Muy alto': styles.amargorMuyAlto,
};

const ESTILOS: EstiloCerveza[] = [
  // ALES (20)
  {
    nombre: 'IPA (India Pale Ale)',
    nombreOriginal: 'India Pale Ale',
    tipo: 'Ale',
    pais: 'Reino Unido / EE.UU.',
    colorEBC: 'Dorado',
    fermentacion: 'Alta',
    ibu: '40-70',
    abv: '5.5-7.5%',
    temperaturaServicio: '8-12°C',
    amargor: 'Alto',
    notasDeSabor: ['Lúpulo', 'Cítrico', 'Pino', 'Floral'],
    maridaje: ['Quesos fuertes', 'Curry', 'Carnes ahumadas'],
    marcasDestacadas: ['Sierra Nevada Torpedo', 'Lagunitas IPA'],
    descripcion: 'El estilo más popular de la craft beer revolution. Alta en lúpulo, con amargor pronunciado y aromas afrutados o resinosos. Surgió para aguantar los viajes desde Inglaterra a la India.',
    curiosidad: 'Las IPAs de hoy son mucho más fuertes que las originales del siglo XVIII',
  },
  {
    nombre: 'American Pale Ale',
    nombreOriginal: 'American Pale Ale',
    tipo: 'Ale',
    pais: 'EE.UU.',
    colorEBC: 'Dorado',
    fermentacion: 'Alta',
    ibu: '30-45',
    abv: '4.5-5.5%',
    temperaturaServicio: '7-10°C',
    amargor: 'Medio',
    notasDeSabor: ['Lúpulo americano', 'Cítrico', 'Floral'],
    maridaje: ['Hamburguesas', 'Pizza', 'Pollo a la brasa'],
    marcasDestacadas: ['Sierra Nevada Pale Ale', 'Oskar Blues Dale\'s'],
    descripcion: 'Versión americana de la Pale Ale inglesa, con lúpulos del noroeste del Pacífico. Equilibrada entre malta y lúpulo.',
    curiosidad: 'Sierra Nevada Pale Ale de 1980 definió el estilo americano',
  },
  {
    nombre: 'Porter',
    nombreOriginal: 'Porter',
    tipo: 'Ale',
    pais: 'Reino Unido',
    colorEBC: 'Caoba',
    fermentacion: 'Alta',
    ibu: '20-35',
    abv: '4.5-6.5%',
    temperaturaServicio: '10-13°C',
    amargor: 'Medio',
    notasDeSabor: ['Chocolate', 'Café', 'Caramelo', 'Frutos secos'],
    maridaje: ['Chocolate negro', 'Estofados', 'Salmón ahumado'],
    marcasDestacadas: ['Fuller\'s London Porter', 'Anchor Porter'],
    descripcion: 'Cerveza oscura con notas de malta tostada, chocolate y café. Popular entre los porteadores de los mercados londinenses del siglo XVIII.',
    curiosidad: 'Da nombre a los porteadores londinenses que la bebían en el trabajo',
  },
  {
    nombre: 'Stout',
    nombreOriginal: 'Stout',
    tipo: 'Ale',
    pais: 'Irlanda',
    colorEBC: 'Negro',
    fermentacion: 'Alta',
    ibu: '30-45',
    abv: '4.0-8.0%',
    temperaturaServicio: '10-13°C',
    amargor: 'Medio',
    notasDeSabor: ['Café', 'Cebada tostada', 'Chocolate amargo', 'Regaliz'],
    maridaje: ['Ostras', 'Chocolate', 'Carne asada'],
    marcasDestacadas: ['Guinness', 'Murphy\'s Irish Stout'],
    descripcion: 'Evolución de la Porter, con cebada tostada sin maltear que aporta sequedad característica. La Guinness la popularizó en todo el mundo.',
    curiosidad: 'Guinness vende 10 millones de pintas al día en 150 países',
  },
  {
    nombre: 'Imperial Stout',
    nombreOriginal: 'Russian Imperial Stout',
    tipo: 'Ale',
    pais: 'Reino Unido',
    colorEBC: 'Negro',
    fermentacion: 'Alta',
    ibu: '50-90',
    abv: '8.0-12.0%',
    temperaturaServicio: '12-16°C',
    amargor: 'Alto',
    notasDeSabor: ['Chocolate negro', 'Café espresso', 'Frutas oscuras', 'Alcohol'],
    maridaje: ['Chocolate 85%', 'Queso azul', 'Cigarro puro'],
    marcasDestacadas: ['Brooklyn Black Chocolate Stout', 'Founders KBS'],
    descripcion: 'Versión extrema de la Stout, creada para la corte de la zarina Catalina II de Rusia. Alta en alcohol y malta intensísima.',
    curiosidad: 'Originalmente necesitaba alta graduación para sobrevivir el viaje al Mar Báltico',
  },
  {
    nombre: 'Brown Ale',
    nombreOriginal: 'Brown Ale',
    tipo: 'Ale',
    pais: 'Reino Unido',
    colorEBC: 'Marrón',
    fermentacion: 'Alta',
    ibu: '15-25',
    abv: '4.0-5.5%',
    temperaturaServicio: '10-13°C',
    amargor: 'Bajo',
    notasDeSabor: ['Nuez', 'Caramelo', 'Bizcocho', 'Leve chocolate'],
    maridaje: ['Jamón serrano', 'Setas', 'Nueces'],
    marcasDestacadas: ['Newcastle Brown Ale', 'Samuel Smith\'s Nut Brown Ale'],
    descripcion: 'Cerveza de color marrón con sabores maltosos a nueces y caramelo. Muy bebible y de bajo amargor.',
    curiosidad: 'Newcastle Brown Ale es la cerveza más exportada de Reino Unido',
  },
  {
    nombre: 'Belgian Tripel',
    nombreOriginal: 'Tripel',
    tipo: 'Ale',
    pais: 'Bélgica',
    colorEBC: 'Dorado',
    fermentacion: 'Alta',
    ibu: '20-40',
    abv: '7.5-9.5%',
    temperaturaServicio: '8-12°C',
    amargor: 'Medio',
    notasDeSabor: ['Frutas tropicales', 'Especias', 'Pimienta blanca', 'Levadura'],
    maridaje: ['Gambas al ajillo', 'Pollo asado', 'Quesos suaves'],
    marcasDestacadas: ['Westmalle Tripel', 'Chimay White'],
    descripcion: 'Cerveza trapense dorada de alta graduación, con fermentación compleja y aromas frutados y especiados producidos por levaduras belgas especiales.',
    curiosidad: 'La "Triple" original era la más cara en las tabernas medievales belgas',
  },
  {
    nombre: 'Belgian Dubbel',
    nombreOriginal: 'Dubbel',
    tipo: 'Ale',
    pais: 'Bélgica',
    colorEBC: 'Caoba',
    fermentacion: 'Alta',
    ibu: '15-25',
    abv: '6.0-7.5%',
    temperaturaServicio: '10-14°C',
    amargor: 'Bajo',
    notasDeSabor: ['Ciruela', 'Pasa', 'Caramelo', 'Especias'],
    maridaje: ['Carne de cerdo', 'Foie gras', 'Quesos maduros'],
    marcasDestacadas: ['Westmalle Dubbel', 'Chimay Red'],
    descripcion: 'Cerveza trapense oscura con notas de frutas maduras y caramelo. Cuerpo medio-pleno y regusto largo.',
    curiosidad: 'Los monjes trapenses de Westmalle llevan elaborando esta receta desde 1856',
  },
  {
    nombre: 'Saison',
    nombreOriginal: 'Saison / Farmhouse Ale',
    tipo: 'Ale',
    pais: 'Bélgica',
    colorEBC: 'Dorado',
    fermentacion: 'Alta',
    ibu: '20-35',
    abv: '5.0-8.0%',
    temperaturaServicio: '6-10°C',
    amargor: 'Medio',
    notasDeSabor: ['Pimienta', 'Frutas', 'Hierbas', 'Levadura'],
    maridaje: ['Ensaladas', 'Mariscos', 'Quesos de cabra'],
    marcasDestacadas: ['Saison Dupont', 'Ommegang Hennepin'],
    descripcion: 'Cerveza de granja elaborada en invierno para los obreros agrícolas del verano. Refrescante, especiada y compleja.',
    curiosidad: 'Se pagaba parcialmente en barricas de Saison a los obreros estacionales belgas',
  },
  {
    nombre: 'Witbier',
    nombreOriginal: 'Witbier / Bière Blanche',
    tipo: 'Ale',
    pais: 'Bélgica',
    colorEBC: 'Amarillo pálido',
    fermentacion: 'Alta',
    ibu: '10-20',
    abv: '4.5-5.5%',
    temperaturaServicio: '4-7°C',
    amargor: 'Bajo',
    notasDeSabor: ['Naranja', 'Cilantro', 'Trigo', 'Levadura'],
    maridaje: ['Moules-frites', 'Ensaladas de verano', 'Brie'],
    marcasDestacadas: ['Hoegaarden', 'Blanche de Bruges'],
    descripcion: 'Cerveza de trigo belga con naranja y cilantro. Turbia y refrescante, casi extinta hasta que Pierre Celis la revivió en 1966.',
    curiosidad: 'Hoegaarden casi desaparece: solo una persona guardó la receta del siglo XV',
  },
  {
    nombre: 'Weizen / Hefeweizen',
    nombreOriginal: 'Weizenbier / Hefeweizen',
    tipo: 'Ale',
    pais: 'Alemania',
    colorEBC: 'Amarillo pálido',
    fermentacion: 'Alta',
    ibu: '8-15',
    abv: '4.5-5.5%',
    temperaturaServicio: '5-8°C',
    amargor: 'Bajo',
    notasDeSabor: ['Plátano', 'Clavo', 'Trigo', 'Levadura afrutada'],
    maridaje: ['Bratwurst', 'Ensaladas ligeras', 'Salmón'],
    marcasDestacadas: ['Weihenstephaner Hefeweissbier', 'Paulaner Weizen'],
    descripcion: 'Cerveza de trigo bávara no filtrada con levadura característica que produce aromas a plátano y clavo. Icónica del sur de Alemania.',
    curiosidad: 'Por ley bávara, solo la familia real podía producirla hasta 1872',
  },
  {
    nombre: 'Dunkelweizen',
    nombreOriginal: 'Dunkelweizen',
    tipo: 'Ale',
    pais: 'Alemania',
    colorEBC: 'Caoba',
    fermentacion: 'Alta',
    ibu: '10-18',
    abv: '4.5-5.5%',
    temperaturaServicio: '6-10°C',
    amargor: 'Bajo',
    notasDeSabor: ['Plátano', 'Clavo', 'Pan tostado', 'Chocolate leve'],
    maridaje: ['Salchichas ahumadas', 'Guisos de caza', 'Pan de centeno'],
    marcasDestacadas: ['Erdinger Dunkel', 'Franziskaner Dunkel Hefe'],
    descripcion: 'Weizen oscura con añadido de maltas oscuras que aportan notas a pan tostado y chocolate, manteniendo los ésteres a plátano y clavo.',
    curiosidad: 'Combina dos estilos icónicos bávaros: el Weizen y el Dunkel',
  },
  {
    nombre: 'Berliner Weisse',
    nombreOriginal: 'Berliner Weisse',
    tipo: 'Ale',
    pais: 'Alemania',
    colorEBC: 'Amarillo pálido',
    fermentacion: 'Alta',
    ibu: '3-8',
    abv: '2.5-3.5%',
    temperaturaServicio: '4-7°C',
    amargor: 'Bajo',
    notasDeSabor: ['Ácido láctico', 'Trigo', 'Limón'],
    maridaje: ['Ensaladas', 'Pescado blanco', 'Frutas'],
    marcasDestacadas: ['Professor Fritz Briem 1809', 'Bayerischer Bahnhof'],
    descripcion: 'Cerveza de trigo berlina de muy baja graduación y alta acidez láctica. Napoleón la llamó el "champán del norte".',
    curiosidad: 'Napoleón la llamó el "champán del norte" durante su campaña en Berlín',
  },
  {
    nombre: 'Scotch Ale / Wee Heavy',
    nombreOriginal: 'Scotch Ale',
    tipo: 'Ale',
    pais: 'Escocia',
    colorEBC: 'Caoba',
    fermentacion: 'Alta',
    ibu: '15-30',
    abv: '6.5-10.0%',
    temperaturaServicio: '12-16°C',
    amargor: 'Bajo',
    notasDeSabor: ['Caramelo', 'Toffee', 'Torba leve', 'Malta rica'],
    maridaje: ['Haggis', 'Ternera asada', 'Quesos intensos'],
    marcasDestacadas: ['Traquair House Ale', 'McEwan\'s Scotch Ale'],
    descripcion: 'Cerveza escocesa maltosa y fuerte, casi sin lúpulo. La frialdad del clima escocés hace que el lúpulo sea menos rentable, de ahí su bajo amargor.',
    curiosidad: 'Los escoceses usaban turba para secar la malta, dando aromas ahumados leves',
  },
  {
    nombre: 'English Bitter / ESB',
    nombreOriginal: 'Best Bitter / Extra Special Bitter',
    tipo: 'Ale',
    pais: 'Reino Unido',
    colorEBC: 'Cobre',
    fermentacion: 'Alta',
    ibu: '20-40',
    abv: '3.8-5.8%',
    temperaturaServicio: '10-14°C',
    amargor: 'Medio',
    notasDeSabor: ['Tierra', 'Frutas inglesas', 'Galleta', 'Lúpulo herbal'],
    maridaje: ['Fish & chips', 'Steak & kidney pie', 'Cheddar'],
    marcasDestacadas: ['Fuller\'s ESB', 'Timothy Taylor Landlord'],
    descripcion: 'La cerveza de pub por excelencia en Gran Bretaña. Baja en alcohol, muy bebible y con carácter maltoso equilibrado por lúpulos ingleses.',
    curiosidad: 'El término "bitter" viene del contraste con las stouts dulces, no de ser extremadamente amarga',
  },
  {
    nombre: 'Amber Ale',
    nombreOriginal: 'American Amber Ale',
    tipo: 'Ale',
    pais: 'EE.UU.',
    colorEBC: 'Cobre',
    fermentacion: 'Alta',
    ibu: '25-40',
    abv: '4.5-6.2%',
    temperaturaServicio: '7-11°C',
    amargor: 'Medio',
    notasDeSabor: ['Caramelo', 'Toffee', 'Lúpulo cítrico', 'Pan'],
    maridaje: ['Hamburguesas', 'BBQ', 'Cheddar'],
    marcasDestacadas: ['Fat Tire Amber Ale', 'Bear Republic Red Rocket'],
    descripcion: 'Amber Ale americana equilibrada entre caramelo y lúpulo americano. Color cobre rojizo característico.',
    curiosidad: 'Fat Tire se inspiró en un viaje en bicicleta por las cervecerías belgas en 1988',
  },
  {
    nombre: 'Barleywine',
    nombreOriginal: 'Barleywine',
    tipo: 'Ale',
    pais: 'Reino Unido',
    colorEBC: 'Caoba',
    fermentacion: 'Alta',
    ibu: '50-100',
    abv: '8.0-12.0%',
    temperaturaServicio: '13-16°C',
    amargor: 'Alto',
    notasDeSabor: ['Caramelo intenso', 'Frutas oscuras', 'Alcohol', 'Miel'],
    maridaje: ['Queso azul Stilton', 'Postres de nuez', 'Cigarros'],
    marcasDestacadas: ['Sierra Nevada Bigfoot', 'Anchor Old Foghorn'],
    descripcion: 'Cerveza fuerte como un vino, con alta concentración de malta y lúpulo. Ideal para madurar en botella durante años.',
    curiosidad: 'Una Bass No. 1 de 1869 encontrada todavía era bebible en los años 90',
  },
  {
    nombre: 'Sour Ale',
    nombreOriginal: 'Sour / Wild Ale',
    tipo: 'Silvestre',
    pais: 'Bélgica / EE.UU.',
    colorEBC: 'Dorado',
    fermentacion: 'Espontánea',
    ibu: '5-15',
    abv: '4.0-8.0%',
    temperaturaServicio: '7-12°C',
    amargor: 'Bajo',
    notasDeSabor: ['Ácido', 'Frutas', 'Vinoso', 'Tierra'],
    maridaje: ['Ostras', 'Sashimi', 'Quesos de cabra'],
    marcasDestacadas: ['Cantillon Gueuze', 'Three Floyds'],
    descripcion: 'Cervezas con fermentación espontánea o lacto que producen acidez compleja. Las Lambic belgas son las más tradicionales.',
    curiosidad: 'Las Lambic usan levaduras salvajes del aire de las orillas del río Senne cerca de Bruselas',
  },
  {
    nombre: 'Milk Stout',
    nombreOriginal: 'Milk Stout / Sweet Stout',
    tipo: 'Ale',
    pais: 'Reino Unido',
    colorEBC: 'Negro',
    fermentacion: 'Alta',
    ibu: '15-25',
    abv: '4.0-6.0%',
    temperaturaServicio: '10-13°C',
    amargor: 'Bajo',
    notasDeSabor: ['Leche condensada', 'Chocolate con leche', 'Vainilla', 'Toffee'],
    maridaje: ['Tarta de chocolate', 'Helado de vainilla', 'Frutas del bosque'],
    marcasDestacadas: ['Left Hand Milk Stout Nitro', 'Mackeson\'s'],
    descripcion: 'Stout dulce elaborada con lactosa (azúcar de la leche) no fermentable. El resultado es una cerveza cremosa, dulce y con cuerpo sedoso.',
    curiosidad: 'Se vendía en farmacias británicas del siglo XIX como bebida reconstituyente para madres lactantes',
  },
  {
    nombre: 'Oatmeal Stout',
    nombreOriginal: 'Oatmeal Stout',
    tipo: 'Ale',
    pais: 'Reino Unido',
    colorEBC: 'Negro',
    fermentacion: 'Alta',
    ibu: '20-40',
    abv: '4.5-6.5%',
    temperaturaServicio: '10-13°C',
    amargor: 'Medio',
    notasDeSabor: ['Avena', 'Chocolate suave', 'Café con leche', 'Seda'],
    maridaje: ['Avena con miel', 'Salmón ahumado', 'Chocolate negro'],
    marcasDestacadas: ['Samuel Smith Oatmeal Stout', 'Young\'s Oatmeal Stout'],
    descripcion: 'Stout elaborada con avena que aporta una textura sedosa y un cuerpo suave. Mucho más bebible que la Imperial Stout, con notas cremosas.',
    curiosidad: 'La avena se usaba para dar cuerpo a cervezas ligeras antes de que se descubriera su efecto en la textura',
  },
  // LAGERS (15)
  {
    nombre: 'Pilsner',
    nombreOriginal: 'Pilsner / Pils',
    tipo: 'Lager',
    pais: 'República Checa',
    colorEBC: 'Amarillo pálido',
    fermentacion: 'Baja',
    ibu: '30-45',
    abv: '4.2-5.4%',
    temperaturaServicio: '4-7°C',
    amargor: 'Medio',
    notasDeSabor: ['Lúpulo floral', 'Cereal', 'Hierba', 'Limpio'],
    maridaje: ['Pechuga de pollo', 'Mariscos', 'Quesos frescos'],
    marcasDestacadas: ['Pilsner Urquell', 'Budvar'],
    descripcion: 'La cerveza más copiada del mundo, creada en Plzeň (Pilsen) en 1842. Clara, refrescante y con amargor equilibrado de lúpulo Saaz.',
    curiosidad: 'Antes de 1842 todas las cervezas de Pilsen eran oscuras y turbias — la primera Pilsner fue revolucionaria',
  },
  {
    nombre: 'Munich Helles',
    nombreOriginal: 'Münchner Hell / Helles',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Amarillo pálido',
    fermentacion: 'Baja',
    ibu: '16-22',
    abv: '4.7-5.4%',
    temperaturaServicio: '4-7°C',
    amargor: 'Bajo',
    notasDeSabor: ['Malta suave', 'Cereal', 'Floral leve', 'Pan'],
    maridaje: ['Pollo asado', 'Cerdo', 'Bretzel'],
    marcasDestacadas: ['Spaten Hell', 'Löwenbräu Hell'],
    descripcion: 'Respuesta bávara a la Pilsner checa: más centrada en la malta que en el lúpulo. La cerveza más servida en las Biergarten de Múnich.',
    curiosidad: 'Spaten creó el Helles en 1894 para competir con la invasión de las Pilsner checas',
  },
  {
    nombre: 'Märzen / Oktoberfest',
    nombreOriginal: 'Märzen / Festbier',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Ámbar',
    fermentacion: 'Baja',
    ibu: '18-24',
    abv: '5.8-6.3%',
    temperaturaServicio: '5-9°C',
    amargor: 'Bajo',
    notasDeSabor: ['Caramelo', 'Pan', 'Malta tostada', 'Lúpulo suave'],
    maridaje: ['Pollo asado', 'Salchichas', 'Pretzel'],
    marcasDestacadas: ['Spaten Oktoberfest', 'Paulaner Märzen'],
    descripcion: 'Cerveza tradicional del Oktoberfest, elaborada en marzo para conservar en cuevas frías hasta el otoño. Malta rica y carácter tostado.',
    curiosidad: 'El Oktoberfest original de 1810 celebraba la boda del rey Luis I de Baviera',
  },
  {
    nombre: 'Bock',
    nombreOriginal: 'Bock',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Caoba',
    fermentacion: 'Baja',
    ibu: '20-27',
    abv: '6.3-7.5%',
    temperaturaServicio: '7-10°C',
    amargor: 'Bajo',
    notasDeSabor: ['Caramelo', 'Chocolate leve', 'Pan de centeno', 'Frutos secos'],
    maridaje: ['Cordero asado', 'Embutidos ahumados', 'Tarta de nuez'],
    marcasDestacadas: ['Einbecker Ur-Bock', 'Spaten Bock'],
    descripcion: 'Lager fuerte y maltosa de origen alemán, asociada a festividades. Nombre viene de Einbeck, ciudad de donde era originaria.',
    curiosidad: 'El macho cabrío (Bock en alemán) es la mascota histórica de esta cerveza',
  },
  {
    nombre: 'Doppelbock',
    nombreOriginal: 'Doppelbock',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Caoba',
    fermentacion: 'Baja',
    ibu: '16-26',
    abv: '7.0-10.0%',
    temperaturaServicio: '8-12°C',
    amargor: 'Bajo',
    notasDeSabor: ['Frutas maduras', 'Caramelo oscuro', 'Chocolate', 'Malta rica'],
    maridaje: ['Caza mayor', 'Queso Emmental viejo', 'Paté'],
    marcasDestacadas: ['Paulaner Salvator', 'Ayinger Celebrator'],
    descripcion: 'La "doble Bock", creada por los monjes Paulanos de Múnich como "pan líquido" para los ayunos. Extremadamente maltosa.',
    curiosidad: 'Los monjes la llamaban "Salvator" (Salvador) porque los nutría durante los ayunos de Cuaresma',
  },
  {
    nombre: 'Schwarzbier',
    nombreOriginal: 'Schwarzbier',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Negro',
    fermentacion: 'Baja',
    ibu: '22-30',
    abv: '4.4-5.4%',
    temperaturaServicio: '8-12°C',
    amargor: 'Medio',
    notasDeSabor: ['Café suave', 'Chocolate amargo', 'Malta tostada', 'Lúpulo herbal'],
    maridaje: ['Pato asado', 'Setas', 'Chocolate negro'],
    marcasDestacadas: ['Köstritzer Schwarzbier', 'Sprecher Black Bavarian'],
    descripcion: 'Lager oscura o "cerveza negra" alemana. A diferencia de las Stout, tiene perfil de lager limpio con notas tostadas elegantes.',
    curiosidad: 'Goethe bebía Köstritzer Schwarzbier cuando tenía problemas de salud',
  },
  {
    nombre: 'Vienna Lager',
    nombreOriginal: 'Wiener Lager',
    tipo: 'Lager',
    pais: 'Austria',
    colorEBC: 'Ámbar',
    fermentacion: 'Baja',
    ibu: '18-30',
    abv: '4.7-5.5%',
    temperaturaServicio: '5-9°C',
    amargor: 'Medio',
    notasDeSabor: ['Malta vienesa', 'Toffee', 'Prado', 'Lúpulo noble suave'],
    maridaje: ['Schnitzel', 'Salmón', 'Queso Gruyère'],
    marcasDestacadas: ['Negra Modelo', 'Samuel Adams Boston Lager'],
    descripcion: 'Lager ambarino creada en Viena en 1841. Muy extendida en México tras la inmigración austriaca del siglo XIX, donde Negra Modelo la perpetuó.',
    curiosidad: 'Maximilian I llevó el estilo a México en 1864 — por eso es tan popular allí',
  },
  {
    nombre: 'American Lager',
    nombreOriginal: 'American Adjunct Lager',
    tipo: 'Lager',
    pais: 'EE.UU.',
    colorEBC: 'Amarillo pálido',
    fermentacion: 'Baja',
    ibu: '8-15',
    abv: '4.2-5.3%',
    temperaturaServicio: '3-6°C',
    amargor: 'Bajo',
    notasDeSabor: ['Cereal suave', 'Maíz leve', 'Limpio', 'Agua'],
    maridaje: ['Nachos', 'Pizza', 'Alitas de pollo'],
    marcasDestacadas: ['Budweiser', 'Coors Light'],
    descripcion: 'La cerveza más consumida del mundo. Muy ligera, refrescante y sin carácter complejo. Perfecta para grandes eventos y calor.',
    curiosidad: 'Budweiser vende más de 40 millones de barriles al año en todo el mundo',
  },
  {
    nombre: 'Czech Premium Pale Lager',
    nombreOriginal: 'Světlý Ležák',
    tipo: 'Lager',
    pais: 'República Checa',
    colorEBC: 'Dorado',
    fermentacion: 'Baja',
    ibu: '30-45',
    abv: '4.4-5.4%',
    temperaturaServicio: '5-8°C',
    amargor: 'Medio',
    notasDeSabor: ['Lúpulo Saaz', 'Floral', 'Cereal', 'Miga de pan'],
    maridaje: ['Svíčková', 'Pechuga de pato', 'Queso Eidam'],
    marcasDestacadas: ['Pilsner Urquell', 'Kozel Premium'],
    descripcion: 'La versión premium checa de la Pilsner, fermentada lentamente en frío durante semanas. Gran cuerpo y amargor elegante.',
    curiosidad: 'Los checos tienen el mayor consumo de cerveza per cápita del mundo: 184 litros por persona y año',
  },
  {
    nombre: 'Rauchbier',
    nombreOriginal: 'Rauchbier',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Caoba',
    fermentacion: 'Baja',
    ibu: '20-30',
    abv: '4.8-6.0%',
    temperaturaServicio: '8-12°C',
    amargor: 'Medio',
    notasDeSabor: ['Ahumado', 'Jamón', 'Malta', 'Especias'],
    maridaje: ['Chuletas ahumadas', 'Salmón ahumado', 'Queso ahumado'],
    marcasDestacadas: ['Schlenkerla Märzen', 'Spezial Rauchbier'],
    descripcion: 'Especialidad de Bamberg con malta ahumada con madera de haya. Sabor a jamón y humo que puede resultar polarizante.',
    curiosidad: 'Bamberg tiene 9 cervecerías en una ciudad de solo 75.000 habitantes',
  },
  {
    nombre: 'Kellerbier',
    nombreOriginal: 'Kellerbier / Zwickelbier',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Dorado',
    fermentacion: 'Baja',
    ibu: '20-35',
    abv: '4.5-5.4%',
    temperaturaServicio: '5-8°C',
    amargor: 'Medio',
    notasDeSabor: ['Levadura', 'Malta fresca', 'Lúpulo noble', 'Melón'],
    maridaje: ['Embutidos bávaros', 'Espárragos', 'Queso fresco'],
    marcasDestacadas: ['Ayinger Kellerbier', 'Mönchshof Kellerbier'],
    descripcion: 'Lager no filtrada y no pasteurizada, servida directamente del barril de maduración. Sabor más fresco y levaduroso que una Helles.',
    curiosidad: 'El nombre viene de "Keller" (sótano) — se servía directo de las cuevas de maduración',
  },
  {
    nombre: 'Maibock / Helles Bock',
    nombreOriginal: 'Maibock / Helles Bock',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Dorado',
    fermentacion: 'Baja',
    ibu: '23-35',
    abv: '6.3-7.5%',
    temperaturaServicio: '6-9°C',
    amargor: 'Medio',
    notasDeSabor: ['Malta suave', 'Miel', 'Floral', 'Lúpulo noble'],
    maridaje: ['Pollo asado', 'Queso suizo', 'Espárragos blancos'],
    marcasDestacadas: ['Hofbräu Maibock', 'Einbecker Mai-Ur-Bock'],
    descripcion: 'Bock pale dorada celebrada en mayo para el inicio de la primavera. Más lupulada y más clara que la Bock tradicional.',
    curiosidad: 'Se sirve en fiestas al aire libre llamadas "Starkbierfest" celebradas en mayo en Baviera',
  },
  {
    nombre: 'Dunkel',
    nombreOriginal: 'Münchner Dunkel',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Caoba',
    fermentacion: 'Baja',
    ibu: '16-25',
    abv: '4.5-5.6%',
    temperaturaServicio: '7-11°C',
    amargor: 'Bajo',
    notasDeSabor: ['Chocolate suave', 'Pan tostado', 'Caramelo', 'Malta Munich'],
    maridaje: ['Cerdo asado', 'Pan de centeno', 'Queso Gruyère'],
    marcasDestacadas: ['Ayinger Altbairisch Dunkel', 'Franziskaner Dunkel'],
    descripcion: 'La lager oscura bávara tradicional, anterior a la Helles. Malta de Múnich tostada con notas de pan y chocolate suave.',
    curiosidad: 'Fue la cerveza dominante en Múnich hasta que la Helles la desbancó en el siglo XX',
  },
  {
    nombre: 'Eisbock',
    nombreOriginal: 'Eisbock',
    tipo: 'Lager',
    pais: 'Alemania',
    colorEBC: 'Negro',
    fermentacion: 'Baja',
    ibu: '25-35',
    abv: '9.0-14.0%',
    temperaturaServicio: '10-14°C',
    amargor: 'Medio',
    notasDeSabor: ['Frutas oscuras', 'Alcohol cálido', 'Caramelo concentrado', 'Malta intensa'],
    maridaje: ['Ciruelas al coñac', 'Foie gras', 'Chocolate negro 90%'],
    marcasDestacadas: ['Kulmbacher Eisbock', 'Aventinus Eisbock'],
    descripcion: 'Se congela parcialmente una Doppelbock y se retira el hielo, concentrando alcohol y sabores. El más potente de los estilos bávaros.',
    curiosidad: 'El estilo nació por accidente cuando un aprendiz olvidó un barril de Bock en el frío exterior',
  },
  // HÍBRIDAS (2)
  {
    nombre: 'Gose',
    nombreOriginal: 'Gose',
    tipo: 'Híbrida',
    pais: 'Alemania',
    colorEBC: 'Amarillo pálido',
    fermentacion: 'Alta',
    ibu: '5-15',
    abv: '4.0-5.0%',
    temperaturaServicio: '4-7°C',
    amargor: 'Bajo',
    notasDeSabor: ['Sal', 'Cilantro', 'Ácido', 'Trigo'],
    maridaje: ['Mariscos', 'Quesos frescos', 'Gazpacho'],
    marcasDestacadas: ['Ritterguts Gose', 'Anderson Valley The Kimmie'],
    descripcion: 'Cerveza tradicional de Goslar con sal y cilantro, casi extinta y revivida por la craft beer. Combinación única de acidez y salinidad.',
    curiosidad: 'Fue ilegal en Alemania por violar el Reinheitsgebot hasta que se revisó la ley',
  },
  {
    nombre: 'Kölsch',
    nombreOriginal: 'Kölsch',
    tipo: 'Híbrida',
    pais: 'Alemania',
    colorEBC: 'Dorado',
    fermentacion: 'Alta',
    ibu: '18-30',
    abv: '4.4-5.2%',
    temperaturaServicio: '5-8°C',
    amargor: 'Medio',
    notasDeSabor: ['Floral', 'Manzana leve', 'Cereal', 'Lúpulo suave'],
    maridaje: ['Bratwurst', 'Queso Gouda', 'Ensaladas'],
    marcasDestacadas: ['Früh Kölsch', 'Gaffel Kölsch'],
    descripcion: 'Cerveza de Colonia con DOP (solo puede llamarse Kölsch si es de Colonia). Fermentación ale pero acondicionamiento lager, lo que da claridad y suavidad.',
    curiosidad: 'Es la única cerveza con Denominación de Origen Protegida dentro de una ciudad',
  },
  {
    nombre: 'Cream Ale',
    nombreOriginal: 'Cream Ale',
    tipo: 'Híbrida',
    pais: 'EE.UU.',
    colorEBC: 'Dorado',
    fermentacion: 'Alta',
    ibu: '8-20',
    abv: '4.2-5.6%',
    temperaturaServicio: '4-7°C',
    amargor: 'Bajo',
    notasDeSabor: ['Maíz', 'Malta suave', 'Levadura leve', 'Limpio'],
    maridaje: ['Corn dogs', 'Pizza margherita', 'Queso americano'],
    marcasDestacadas: ['Genesee Cream Ale', 'Little Kings'],
    descripcion: 'Estilo americano que combina levaduras ale con acondicionamiento lager. Muy suave y refrescante, un híbrido exclusivo de Estados Unidos.',
    curiosidad: 'Surgió como alternativa americana a las Pilsner en los estados sin tradición cervecera alemana',
  },
];

export default function GuiaEstilosCerveza() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoCerveza | ''>('');
  const [filtroColor, setFiltroColor] = useState<ColorEBC | ''>('');
  const [filtroFermentacion, setFiltroFermentacion] = useState<Fermentacion | ''>('');
  const [filtroAmargor, setFiltroAmargor] = useState<NivelAmargor | ''>('');

  const estilosFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase();
    return ESTILOS.filter((e) => {
      if (filtroTipo && e.tipo !== filtroTipo) return false;
      if (filtroColor && e.colorEBC !== filtroColor) return false;
      if (filtroFermentacion && e.fermentacion !== filtroFermentacion) return false;
      if (filtroAmargor && e.amargor !== filtroAmargor) return false;
      if (termino) {
        const coincide =
          e.nombre.toLowerCase().includes(termino) ||
          e.nombreOriginal.toLowerCase().includes(termino) ||
          e.pais.toLowerCase().includes(termino) ||
          e.notasDeSabor.some((n) => n.toLowerCase().includes(termino)) ||
          e.maridaje.some((m) => m.toLowerCase().includes(termino)) ||
          e.descripcion.toLowerCase().includes(termino);
        if (!coincide) return false;
      }
      return true;
    });
  }, [busqueda, filtroTipo, filtroColor, filtroFermentacion, filtroAmargor]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guia de Estilos de Cerveza</h1>
        <p>40 estilos del mundo con IBU, ABV, temperatura de servicio y maridaje</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <div className={styles.controles}>
          <input
            type="search"
            className={styles.buscador}
            placeholder="Buscar por nombre, sabor, maridaje..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar estilos de cerveza"
          />

          <div className={styles.filtrosRow}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Tipo</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por tipo de cerveza">
                <button
                  className={`${styles.filtroBtn} ${filtroTipo === '' ? styles.filtroActivo : ''}`}
                  onClick={() => setFiltroTipo('')}
                  aria-pressed={filtroTipo === ''}
                >
                  Todos
                </button>
                {TIPOS.map((t) => (
                  <button
                    key={t}
                    className={`${styles.filtroBtn} ${filtroTipo === t ? styles.filtroActivo : ''}`}
                    onClick={() => setFiltroTipo(filtroTipo === t ? '' : t)}
                    aria-pressed={filtroTipo === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Fermentacion</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por fermentación">
                <button
                  className={`${styles.filtroBtn} ${filtroFermentacion === '' ? styles.filtroActivo : ''}`}
                  onClick={() => setFiltroFermentacion('')}
                  aria-pressed={filtroFermentacion === ''}
                >
                  Todas
                </button>
                {FERMENTACIONES.map((f) => (
                  <button
                    key={f}
                    className={`${styles.filtroBtn} ${filtroFermentacion === f ? styles.filtroActivo : ''}`}
                    onClick={() => setFiltroFermentacion(filtroFermentacion === f ? '' : f)}
                    aria-pressed={filtroFermentacion === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Amargor</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por nivel de amargor">
                <button
                  className={`${styles.filtroBtn} ${filtroAmargor === '' ? styles.filtroActivo : ''}`}
                  onClick={() => setFiltroAmargor('')}
                  aria-pressed={filtroAmargor === ''}
                >
                  Todos
                </button>
                {AMARGORES.map((a) => (
                  <button
                    key={a}
                    className={`${styles.filtroBtn} ${filtroAmargor === a ? styles.filtroActivo : ''}`}
                    onClick={() => setFiltroAmargor(filtroAmargor === a ? '' : a)}
                    aria-pressed={filtroAmargor === a}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Color EBC</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por color EBC">
                <button
                  className={`${styles.filtroBtn} ${filtroColor === '' ? styles.filtroActivo : ''}`}
                  onClick={() => setFiltroColor('')}
                  aria-pressed={filtroColor === ''}
                >
                  Todos
                </button>
                {COLORES.map((c) => (
                  <button
                    key={c}
                    className={`${styles.filtroBtn} ${filtroColor === c ? styles.filtroActivo : ''}`}
                    onClick={() => setFiltroColor(filtroColor === c ? '' : c)}
                    aria-pressed={filtroColor === c}
                  >
                    <span
                      className={styles.colorDot}
                      style={{ background: COLOR_EBC_HEX[c] }}
                      aria-hidden="true"
                    />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className={styles.contador}>
            Mostrando <strong>{estilosFiltrados.length}</strong> de {ESTILOS.length} estilos
          </p>
        </div>

        <div className={styles.grid}>
          {estilosFiltrados.length === 0 ? (
            <p className={styles.sinResultados}>
              No se encontraron estilos con los filtros seleccionados. Prueba a cambiar los filtros o el texto de busqueda.
            </p>
          ) : (
            estilosFiltrados.map((estilo) => (
              <article key={estilo.nombre} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitulo}>
                    <h2 className={styles.nombre}>{estilo.nombre}</h2>
                    <p className={styles.nombreOriginal}>{estilo.nombreOriginal} — {estilo.pais}</p>
                  </div>
                  <div className={styles.badges}>
                    <span className={`${styles.tipoBadge} ${TIPO_CLASS[estilo.tipo]}`}>
                      {estilo.tipo}
                    </span>
                    <span className={`${styles.amargorBadge} ${AMARGOR_CLASS[estilo.amargor]}`}>
                      {estilo.amargor} amargor
                    </span>
                    <span className={styles.fermentacionBadge}>
                      Ferm. {estilo.fermentacion}
                    </span>
                  </div>
                </div>

                <div className={styles.colorRow}>
                  <span
                    className={styles.colorChip}
                    style={{ background: COLOR_EBC_HEX[estilo.colorEBC] }}
                    aria-hidden="true"
                  />
                  <span className={styles.colorLabel}>{estilo.colorEBC}</span>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>IBU</span>
                    <span className={styles.statValue}>{estilo.ibu}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>ABV</span>
                    <span className={styles.statValue}>{estilo.abv}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Temperatura</span>
                    <span className={styles.statValue}>{estilo.temperaturaServicio}</span>
                  </div>
                </div>

                <p className={styles.descripcion}>{estilo.descripcion}</p>

                <div className={styles.notasSection}>
                  <span className={styles.sectionLabel}>Notas de sabor</span>
                  <div className={styles.notasTags}>
                    {estilo.notasDeSabor.map((nota) => (
                      <span key={nota} className={styles.notaTag}>{nota}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.maridajeSection}>
                  <span className={styles.sectionLabel}>Maridaje</span>
                  <div className={styles.maridajeTags}>
                    {estilo.maridaje.map((m) => (
                      <span key={m} className={styles.maridajeTag}>{m}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.marcasSection}>
                  <span className={styles.sectionLabel}>Marcas destacadas</span>
                  <div className={styles.marcasTags}>
                    {estilo.marcasDestacadas.map((marca) => (
                      <span key={marca} className={styles.marcaTag}>{marca}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.curiosidadBox}>
                  <span className={styles.curiosidadIcon} aria-hidden="true">💡</span>
                  <p className={styles.curiosidadText}><em>{estilo.curiosidad}</em></p>
                </div>
              </article>
            ))
          )}
        </div>

        <EducationalSection
          title="Guia de Estilos de Cerveza"
          subtitle="Aprende sobre los principales estilos cerveceros del mundo: historia, elaboracion y maridaje"
          icon="🍺"
        >
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Fermentacion</th>
                  <th>IBU tipico</th>
                  <th>ABV tipico</th>
                  <th>Ejemplos icónicos</th>
                  <th>Temperatura</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ales ligeras</td>
                  <td>Alta (15-24°C)</td>
                  <td>8-25</td>
                  <td>4.0-5.5%</td>
                  <td>Witbier, Hefeweizen, Berliner Weisse</td>
                  <td>4-10°C</td>
                </tr>
                <tr>
                  <td>Ales amargas</td>
                  <td>Alta (15-24°C)</td>
                  <td>30-70</td>
                  <td>4.5-7.5%</td>
                  <td>IPA, Pale Ale, ESB</td>
                  <td>7-12°C</td>
                </tr>
                <tr>
                  <td>Ales belgas</td>
                  <td>Alta (18-28°C)</td>
                  <td>15-40</td>
                  <td>5.0-9.5%</td>
                  <td>Tripel, Dubbel, Saison</td>
                  <td>8-14°C</td>
                </tr>
                <tr>
                  <td>Ales oscuras</td>
                  <td>Alta (15-24°C)</td>
                  <td>15-90</td>
                  <td>4.0-12.0%</td>
                  <td>Stout, Porter, Brown Ale</td>
                  <td>10-16°C</td>
                </tr>
                <tr>
                  <td>Lagers palidas</td>
                  <td>Baja (7-13°C)</td>
                  <td>8-45</td>
                  <td>4.2-5.4%</td>
                  <td>Pilsner, Helles, American Lager</td>
                  <td>3-8°C</td>
                </tr>
                <tr>
                  <td>Lagers fuertes</td>
                  <td>Baja (7-13°C)</td>
                  <td>16-35</td>
                  <td>6.0-14.0%</td>
                  <td>Bock, Doppelbock, Eisbock</td>
                  <td>7-14°C</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Para quien empieza</h4>
              <p>Helles, Witbier o Hefeweizen: suaves, sin amargor agresivo, aromaticas y muy bebibles. La puerta de entrada perfecta al mundo de la cerveza artesanal.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Para los amantes del amargor</h4>
              <p>IPA americana o West Coast IPA: lupuladas, citricos, con amargor limpio y persistente. Para quienes ya tienen el paladar educado y buscan intensidad.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Para maridaje con comida</h4>
              <p>Saison con mariscos, Stout con chocolate, Porter con estofados. Cada estilo tiene su aliado gastronomico perfecto — el secreto es el contraste o la complementariedad.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Para explorar la complejidad</h4>
              <p>Belgian Tripel, Barleywine o Imperial Stout: cervezas para beber despacio, como un buen vino. Ideales para noches de invierno y conversaciones largas.</p>
            </div>
          </div>

          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Que significa IBU?</strong>
              <p>International Bitterness Units — unidades que miden el amargor de la cerveza. Menos de 20 IBU es suave; 30-50 es notable; mas de 60 es muy amargo. El IBU por si solo no define el amargor percibido, que tambien depende del dulzor de la malta.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Que diferencia Ale de Lager?</strong>
              <p>La fermentacion: las Ales usan levadura de fermentacion alta (15-24°C, mas rapida) y las Lagers, levadura de fermentacion baja (7-13°C, mas lenta y fria). Las Ales suelen ser mas aromaticas y complejas; las Lagers, mas limpias y refrescantes.</p>
              <span className={styles.faqTip}>Las híbridas como el Kölsch combinan ambas tecnicas.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿A que temperatura debo servir la cerveza?</strong>
              <p>Cada estilo tiene su temperatura optima. Las lagers ligeras se sirven frias (3-7°C) para potenciar la frescura; las ales oscuras y fuertes, a 10-16°C para liberar aromas. Nunca demasiado fria: el frio oculta los sabores.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Que es el Reinheitsgebot?</strong>
              <p>La Ley de Pureza Alemana de 1516, que estipulaba que la cerveza solo podia contener agua, malta de cebada y lupulo. Fue durante siglos el estandar de calidad mas estricto del mundo y explica por que estilos como la Gose fueron ilegales en Alemania por un tiempo.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Como se cata una cerveza correctamente?</strong>
              <p>Cuatro pasos: vista (color, transparencia, espuma), nariz (aromas, percibir lupulo o malta), paladar (dulzor, amargor, acidez, cuerpo) y final (regusto, duracion, complejidad). Usar copa adecuada al estilo amplifica la experiencia considerablemente.</p>
            </li>
          </ul>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Elige la copa adecuada.</strong> Cada estilo tiene su copa: pinta para Stout, copa tulipa para IPA, vaso Weizen para Hefeweizen, copa de cáliz para Tripel. La forma concentra los aromas y mejora la experiencia.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Sirve a la temperatura correcta.</strong> Saca la cerveza de la nevera 5-10 minutos antes si es una ale oscura o fuerte. El frio excesivo aplana los sabores y oculta la complejidad.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Observa la espuma y el color.</strong> La espuma aporta aroma y protege contra la oxidacion. Un color claro u oscuro ya te dice mucho del estilo antes del primer sorbo.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Huele antes de beber.</strong> El 80% del sabor percibido viene del olfato. Acerca la copa a la nariz antes de beber y trata de identificar notas: frutas, lupulo, malta tostada, especias.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Presta atencion al final.</strong> El regusto (aftertaste) distingue las grandes cervezas. Un buen Imperial Stout o una Tripel deben dejar un regusto largo y complejo que invita a otro sorbo.
              </div>
            </div>
          </div>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <h4>Temperatura, lo mas importante</h4>
              <p>Nunca sirvas una IPA demasiado fria: pierde aromas. Nunca una Helles tibia: pierde frescura. Respeta los rangos de cada estilo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍽️</span>
              <h4>El maridaje complementa</h4>
              <p>Busca contrastes o similitudes: Stout con chocolate (intensidad), Saison con mariscos (refrescante vs. salino), IPA con queso fuerte (amargor limpia el paladar).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>Explora el amargor en orden</h4>
              <p>Si empiezas en el mundo craft, ve de menos a mas IBU: Helles → Pale Ale → Amber → IPA. El paladar se educa progresivamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>La cerveza fresca es mejor</h4>
              <p>Salvo Barleywine, Imperial Stout y algunas Belgas diseñadas para envejecer, la mayoria de estilos se disfrutan jovenes y frescos. Mira siempre la fecha de envasado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌍</span>
              <h4>Cada region, un caracter</h4>
              <p>La cerveza refleja su territorio: las cervezas belgas son especiadas y complejas, las alemanas son precisas y tecnicas, las americanas son audaces y lupuladas.</p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores comunes al degustar cerveza</strong>
            </div>
            <ul className={styles.warningList}>
              <li>Servir todas las cervezas a la misma temperatura: cada estilo tiene su rango ideal y servirla demasiado fria oculta aromas y matices importantes.</li>
              <li>Usar siempre la misma copa: un vaso de tubo no es adecuado para una Tripel belga o una Imperial Stout — la copa correcta potencia enormemente la experiencia.</li>
              <li>Juzgar una cerveza por su color: una Schwarzbier negra puede ser mas ligera que una IPA dorada — el color da pistas pero no define el cuerpo ni el alcohol.</li>
              <li>Ignorar la fecha de envasado: las cervezas artesanales no mejoran indefinidamente en la nevera; la mayoria deben beberse en 3-6 meses para disfrutar su mejor momento.</li>
            </ul>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('guia-estilos-cerveza')} />
      <ShareCard appName="guia-estilos-cerveza" />
      <Footer appName="guia-estilos-cerveza" />
    </div>
  );
}
