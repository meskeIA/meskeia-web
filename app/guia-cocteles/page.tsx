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
import styles from './GuiaCocteles.module.css';

type FamiliaCoctel = 'Sour' | 'Highball' | 'Martini' | 'Tropical' | 'Spritz / Aperitivo' | 'Cremoso / Caliente' | 'Sin alcohol';
type BaseAlcohol = 'Gin' | 'Vodka' | 'Ron' | 'Whisky / Bourbon' | 'Tequila / Mezcal' | 'Champán / Cava' | 'Vermut / Aperol' | 'Coñac / Brandy' | 'Sin alcohol';
type Dulzor = 'Muy seco' | 'Seco' | 'Equilibrado' | 'Dulce' | 'Muy dulce';
type Graduacion = 'Sin alcohol' | 'Baja' | 'Media' | 'Alta';

interface Coctel {
  nombre: string;
  familia: FamiliaCoctel;
  base: BaseAlcohol;
  ingredientes: string[];
  metodo: 'Agitado (shaker)' | 'Batido (blender)' | 'Construido (vaso)' | 'Directo (revuelto)' | 'Licuado';
  copa: string;
  dulzor: Dulzor;
  graduacion: Graduacion;
  perfil: string[];
  origen: string;
  decada: string;
  descripcion: string;
  curiosidad: string;
}

const DULZOR_NIVEL: Record<Dulzor, number> = {
  'Muy seco': 1, 'Seco': 2, 'Equilibrado': 3, 'Dulce': 4, 'Muy dulce': 5,
};

const FAMILIAS: FamiliaCoctel[] = ['Sour', 'Highball', 'Martini', 'Tropical', 'Spritz / Aperitivo', 'Cremoso / Caliente', 'Sin alcohol'];
const BASES: BaseAlcohol[] = ['Gin', 'Vodka', 'Ron', 'Whisky / Bourbon', 'Tequila / Mezcal', 'Champán / Cava', 'Vermut / Aperol', 'Coñac / Brandy', 'Sin alcohol'];

const FAMILIA_COLOR: Record<FamiliaCoctel, string> = {
  'Sour': styles.familiaSour,
  'Highball': styles.familiaHighball,
  'Martini': styles.familiaMartini,
  'Tropical': styles.familiaTropical,
  'Spritz / Aperitivo': styles.familiaSpritz,
  'Cremoso / Caliente': styles.familiaCremoso,
  'Sin alcohol': styles.familiaSinAlcohol,
};

const GRADUACION_COLOR: Record<Graduacion, string> = {
  'Sin alcohol': styles.gradSinAlcohol,
  'Baja': styles.gradBaja,
  'Media': styles.gradMedia,
  'Alta': styles.gradAlta,
};

const COCTELES: Coctel[] = [
  // ── SOUR (8) ────────────────────────────────────────────────────────────────
  {
    nombre: 'Margarita',
    familia: 'Sour', base: 'Tequila / Mezcal',
    ingredientes: ['50 ml de tequila blanco', '25 ml de triple seco (Cointreau)', '25 ml de zumo de lima fresco', 'Sal gruesa para el borde', 'Rodaja de lima para decorar'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa Margarita (con borde de sal)',
    dulzor: 'Seco',
    graduacion: 'Alta',
    perfil: ['Cítrico', 'Refrescante', 'Ligeramente salado'],
    origen: 'México / Estados Unidos',
    decada: 'Años 1930–1940',
    descripcion: 'La Margarita es el cóctel más vendido del mundo. Se agita con hielo hasta enfriar bien y se sirve en copa con borde de sal. La combinación de tequila, cítrico y naranja crea un equilibrio difícil de superar. Se puede servir con hielo o sin él ("straight up").',
    curiosidad: 'Se disputan su invención al menos tres personas distintas. La historia más aceptada sitúa su creación en Tijuana en 1938 por un bartender llamado Carlos "Danny" Herrera, que la creó para una clienta alérgica a todos los licores excepto al tequila.',
  },
  {
    nombre: 'Daiquiri',
    familia: 'Sour', base: 'Ron',
    ingredientes: ['60 ml de ron blanco', '25 ml de zumo de lima fresco', '15 ml de jarabe de azúcar (sirope 2:1)', 'Rodaja de lima para decorar'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa de cóctel (Martini)',
    dulzor: 'Seco',
    graduacion: 'Alta',
    perfil: ['Cítrico', 'Limpio', 'Refrescante'],
    origen: 'Cuba (Daiquirí, Santiago)',
    decada: 'Año 1898',
    descripcion: 'El Daiquiri es la expresión más pura del Sour: ron, lima y azúcar. Su sencillez es su virtud. Popularizado en La Habana por el bar El Floridita, frecuentado por Ernest Hemingway, se ha convertido en uno de los cócteles más estudiados por bartenders profesionales por lo que revela sobre el equilibrio.',
    curiosidad: 'Ernest Hemingway era un fanático del Daiquiri en El Floridita, pero pedía una versión sin azúcar (Daiquiri Hemingway o Papa Doble) con el doble de ron y zumo de pomelo. El local le tiene dedicada una estatua de tamaño natural en el lugar donde se sentaba habitualmente.',
  },
  {
    nombre: 'Whiskey Sour',
    familia: 'Sour', base: 'Whisky / Bourbon',
    ingredientes: ['50 ml de bourbon o whisky americano', '25 ml de zumo de limón fresco', '15 ml de jarabe de azúcar', '1 clara de huevo (opcional, para espuma)', '2 gotas de bitters Angostura'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa rocks (on the rocks) o copa de cóctel',
    dulzor: 'Seco',
    graduacion: 'Alta',
    perfil: ['Cítrico', 'Con cuerpo', 'Aromático', 'Cremoso (con clara)'],
    origen: 'Estados Unidos',
    decada: 'Años 1870',
    descripcion: 'El Whiskey Sour es uno de los cócteles más antiguos documentados. La versión con clara de huevo, llamada "Boston Sour", crea una espuma sedosa que equilibra la acidez del limón. El bourbon aporta notas de vainilla y caramelo que el limón realza perfectamente.',
    curiosidad: 'La primera receta documentada de Whiskey Sour aparece en 1870 en el libro "The Bartender\'s Guide" de Jerry Thomas. Thomas, conocido como "el padre de los cócteles americanos", fue el primer bartender en publicar un libro de recetas de cócteles de la historia.',
  },
  {
    nombre: 'Pisco Sour',
    familia: 'Sour', base: 'Coñac / Brandy',
    ingredientes: ['60 ml de pisco (peruano o chileno)', '30 ml de zumo de lima fresco', '20 ml de jarabe de azúcar', '1 clara de huevo', '2-3 gotas de bitters Angostura encima de la espuma'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa de cóctel baja o copa champán coupe',
    dulzor: 'Equilibrado',
    graduacion: 'Alta',
    perfil: ['Cítrico', 'Suave', 'Cremoso', 'Aromático con bitters'],
    origen: 'Lima, Perú',
    decada: 'Años 1920',
    descripcion: 'El Pisco Sour es el cóctel nacional de Perú (y también de Chile, que lo reclama igualmente). El pisco, aguardiente de uva, tiene un perfil más suave y frutal que el whisky o el ron, lo que hace que la espuma de clara de huevo y las gotas de bitters Angostura sean componentes esenciales del equilibrio.',
    curiosidad: 'La autoría del Pisco Sour es objeto de disputa histórica y hasta diplomática entre Perú y Chile. La versión peruana lleva clara de huevo y bitters Angostura; la chilena no. Perú tiene incluso un Día Nacional del Pisco Sour (primer sábado de febrero), feriado oficial desde 2004.',
  },
  {
    nombre: 'Amaretto Sour',
    familia: 'Sour', base: 'Coñac / Brandy',
    ingredientes: ['45 ml de amaretto', '30 ml de zumo de limón fresco', '15 ml de bourbon (opcional, para estructura)', '1 clara de huevo', 'Cereza al marrasquino y rodaja de naranja'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa rocks con hielo',
    dulzor: 'Dulce',
    graduacion: 'Media',
    perfil: ['Almendrado', 'Cítrico', 'Dulce', 'Cremoso'],
    origen: 'Estados Unidos',
    decada: 'Años 1970',
    descripcion: 'El Amaretto Sour moderno fue reinventado en 2012 por el bartender Jeffrey Morgenthaler, que añadió bourbon y clara de huevo a la receta tradicional, transformando un cóctel considerado "femenino y simple" en uno de los más complejos y elegantes de la coctelería contemporánea.',
    curiosidad: 'El amaretto tradicional (Disaronno) se elabora con huesos de albaricoque, no con almendras como se cree comúnmente. La confusión surge porque su perfil aromático recuerda al mazapán. La receta lleva prácticamente sin cambios desde 1525 según la leyenda.',
  },
  {
    nombre: 'Gimlet',
    familia: 'Sour', base: 'Gin',
    ingredientes: ['60 ml de gin London Dry', '22 ml de zumo de lima fresco', '15 ml de jarabe de lima (Rose\'s) o sirope simple', 'Rodaja de lima para decorar'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa de cóctel (Martini) o copa coupe',
    dulzor: 'Seco',
    graduacion: 'Alta',
    perfil: ['Cítrico', 'Herbal', 'Refrescante', 'Seco'],
    origen: 'Marina Real Británica',
    decada: 'Años 1880',
    descripcion: 'El Gimlet es uno de los cócteles más elegantes y depurados de la tradición inglesa. Originalmente se preparaba con zumo de lima en conserva (Rose\'s Lime Cordial) para preservar el zumo en los barcos. La versión moderna con lima fresca es más brillante y compleja.',
    curiosidad: 'El Gimlet nació en la Marina Real Británica: el Dr. Thomas D. Gimlette, médico naval, mezcló gin con zumo de lima para que los marineros tomaran su ración diaria de vitamina C (que prevenía el escorbuto) de forma más apetecible. Su apellido dio nombre al cóctel.',
  },
  {
    nombre: 'White Lady',
    familia: 'Sour', base: 'Gin',
    ingredientes: ['40 ml de gin London Dry', '20 ml de triple seco (Cointreau)', '20 ml de zumo de limón fresco', '1 clara de huevo (opcional)', 'Cáscara de limón para decorar'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa de cóctel (Martini)',
    dulzor: 'Seco',
    graduacion: 'Alta',
    perfil: ['Cítrico', 'Floral', 'Seco', 'Elegante'],
    origen: 'París, Francia',
    decada: 'Años 1920',
    descripcion: 'La White Lady es un cóctel de la era dorada de la coctelería parisina. Su aspecto elegante y su sabor limpio y cítrico la convirtieron en favorita en el Bar Hemingway del Ritz París. Cuando se añade clara de huevo obtiene una textura sedosa que eleva el conjunto.',
    curiosidad: 'La White Lady fue creada por Harry MacElhone en el bar Harry\'s New York Bar de París en 1923. MacElhone es también el creador del Sidecar y del French 75. Su bar en la rue Daunou sigue abierto hoy y es uno de los bares de cóctel más históricos del mundo.',
  },
  {
    nombre: 'Cosmopolitan',
    familia: 'Sour', base: 'Vodka',
    ingredientes: ['40 ml de vodka cítrico', '15 ml de triple seco (Cointreau)', '15 ml de zumo de lima fresco', '30 ml de zumo de arándano rojo', 'Cáscara de naranja flameada'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa de cóctel (Martini)',
    dulzor: 'Equilibrado',
    graduacion: 'Alta',
    perfil: ['Cítrico', 'Frutal', 'Ligeramente dulce', 'Elegante'],
    origen: 'Nueva York, Estados Unidos',
    decada: 'Años 1980–1990',
    descripcion: 'El Cosmopolitan alcanzó la fama máxima gracias a Sexo en Nueva York, donde Carrie Bradshaw y sus amigas lo pedían en cada episodio. Su color rosa y su aspecto sofisticado lo convirtieron en icono de una era. Correctamente preparado, es un cóctel equilibrado y delicioso.',
    curiosidad: 'Aunque la serie Sexo en Nueva York lo hizo mundialmente famoso en los años 90, la receta fue estandarizada por Dale DeGroff en el Rainbow Room de Nueva York alrededor de 1988. DeGroff añadió la cáscara de naranja flameada, que se convirtió en su firma visual inconfundible.',
  },

  // ── HIGHBALL (7) ────────────────────────────────────────────────────────────
  {
    nombre: 'Mojito',
    familia: 'Highball', base: 'Ron',
    ingredientes: ['50 ml de ron blanco', '25 ml de zumo de lima fresco', '15 ml de jarabe de azúcar', '6-8 hojas de menta fresca', 'Soda water al gusto (~100 ml)', 'Hielo picado o cubiteras'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball o vaso largo',
    dulzor: 'Equilibrado',
    graduacion: 'Media',
    perfil: ['Herbal', 'Cítrico', 'Refrescante', 'Suave'],
    origen: 'La Habana, Cuba',
    decada: 'Siglo XVI (versión moderna: años 1920)',
    descripcion: 'El Mojito es el cóctel más pedido en España y uno de los más populares del mundo. Se construye directamente en el vaso: menta, lima y azúcar se muddlan ligeramente (sin machacar en exceso, o se amargaría), se añade ron y se termina con soda. El hielo debe ser abundante.',
    curiosidad: 'El Mojito tiene sus raíces en el "El Draque", un remedio medicinal del siglo XVI a base de aguardiente de caña, lima, menta y azúcar que los marineros ingleses de Francis Drake tomaban para las enfermedades tropicales. La versión moderna con ron blanco cubano se popularizó en los años 20 en La Habana.',
  },
  {
    nombre: 'Gin Tonic',
    familia: 'Highball', base: 'Gin',
    ingredientes: ['50 ml de gin (según variedad: London Dry, Hendrick\'s, Tanqueray...)', '200 ml de agua tónica de calidad fría', 'Hielo en abundancia (cubiteras grandes)', 'Garnish según gin: pepino, enebro, piel de lima, cardamomo, etc.'],
    metodo: 'Construido (vaso)',
    copa: 'Copa balón (copa globo)',
    dulzor: 'Seco',
    graduacion: 'Media',
    perfil: ['Herbal', 'Amargo', 'Refrescante', 'Aromático'],
    origen: 'India Británica',
    decada: 'Siglo XIX (1850s)',
    descripcion: 'El Gin Tonic tiene una técnica precisa: copa fría, hielo abundante (para no diluir), gin vertido sobre el hielo y tónica servida con suavidad por la pared del vaso (para no perder el gas). El garnish (adorno) debe complementar los botánicos del gin elegido, no contradecirlos.',
    curiosidad: 'El Gin Tonic fue inventado por los soldados británicos en la India colonial. La quinina (componente amargo de la tónica) era el único medicamento contra la malaria, pero sabía horrible. Para hacerlo más tolerable lo mezclaban con gin, azúcar, lima y agua. Literalmente, un medicamento convertido en el cóctel favorito del mundo.',
  },
  {
    nombre: 'Cuba Libre',
    familia: 'Highball', base: 'Ron',
    ingredientes: ['50 ml de ron blanco o dorado', '150 ml de Coca-Cola fría', '15 ml de zumo de lima fresco', 'Rodajas de lima', 'Hielo en abundancia'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball o vaso largo',
    dulzor: 'Dulce',
    graduacion: 'Media',
    perfil: ['Dulce', 'Cítrico', 'Suave'],
    origen: 'Cuba / Estados Unidos',
    decada: 'Año 1900',
    descripcion: 'El Cuba Libre es sencillo pero tiene matices: la lima fresca es imprescindible, no opcional. Sin ella es solo ron con Cola. La acidez de la lima equilibra el dulzor de la Cola y abre los aromas del ron. Se dice que nació al mezclar Coca-Cola americana con ron cubano en un bar de La Habana durante la guerra hispano-americana.',
    curiosidad: 'La expresión "Cuba Libre" (Cuba Libre) era el grito de guerra de los soldados cubanos que luchaban por la independencia de España. La mezcla ron-Coca-Cola surgió inmediatamente después de la llegada de las tropas americanas a Cuba en 1898, que trajeron la Coca-Cola recién inventada.',
  },
  {
    nombre: 'Moscow Mule',
    familia: 'Highball', base: 'Vodka',
    ingredientes: ['50 ml de vodka', '15 ml de zumo de lima fresco', '150 ml de ginger beer (cerveza de jengibre)', 'Rodaja de lima', 'Ramita de menta (opcional)'],
    metodo: 'Construido (vaso)',
    copa: 'Taza de cobre (jarra Moscow Mule)',
    dulzor: 'Seco',
    graduacion: 'Media',
    perfil: ['Picante', 'Cítrico', 'Refrescante'],
    origen: 'Los Ángeles, Estados Unidos',
    decada: 'Año 1941',
    descripcion: 'El Moscow Mule se sirve en una taza de cobre, no como capricho sino porque el cobre enfría más rápido el metal y mantiene la bebida fría más tiempo. Fue el cóctel que popularizó el vodka en Estados Unidos en los años 40. La ginger beer le da un toque picante inconfundible.',
    curiosidad: 'El Moscow Mule fue inventado en 1941 en el hotel Cock\'n\'Bull de Los Ángeles como estrategia de marketing: John G. Martin (que acababa de comprar la marca Smirnoff) y Jack Morgan (propietario del bar con exceso de ginger beer) crearon el cóctel para deshacerse de sus respectivos excedentes de stock.',
  },
  {
    nombre: 'Dark & Stormy',
    familia: 'Highball', base: 'Ron',
    ingredientes: ['60 ml de ron negro (Gosling\'s Black Seal o similar)', '150 ml de ginger beer', '15 ml de zumo de lima', 'Rodaja de lima'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball',
    dulzor: 'Seco',
    graduacion: 'Media',
    perfil: ['Especiado', 'Picante', 'Intenso', 'Cítrico'],
    origen: 'Bermudas',
    decada: 'Siglo XIX',
    descripcion: 'El Dark & Stormy es el cóctel nacional de las Bermudas y uno de los pocos con marca registrada: solo puede llamarse así si usa ron Gosling\'s Black Seal. El ron negro flota parcialmente sobre la ginger beer creando el efecto visual oscuro que da nombre al cóctel.',
    curiosidad: 'El nombre "Dark & Stormy" está registrado como marca comercial de Gosling Brothers. Son el único caso conocido de una empresa que posee los derechos de nombre de un cóctel. Técnicamente, si lo preparas con otro ron negro no puedes llamarlo así, aunque el sabor sea casi idéntico.',
  },
  {
    nombre: 'Tom Collins',
    familia: 'Highball', base: 'Gin',
    ingredientes: ['45 ml de gin London Dry', '30 ml de zumo de limón fresco', '15 ml de jarabe de azúcar', '~90 ml de soda water', 'Rodaja de limón y cereza al marrasquino'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso Collins (vaso largo)',
    dulzor: 'Equilibrado',
    graduacion: 'Media',
    perfil: ['Cítrico', 'Refrescante', 'Suave', 'Burbujeante'],
    origen: 'Londres, Reino Unido',
    decada: 'Años 1860',
    descripcion: 'El Tom Collins es el primo largo y refrescante del Gimlet. Documentado desde 1876 en el libro de Jerry Thomas, se distingue por su longitud: se sirve en vaso alto con abundante soda, haciendo de él una bebida larga perfecta para el verano. El "John Collins" es la versión con whisky en lugar de gin.',
    curiosidad: 'En 1874 circuló en Nueva York la "Tom Collins Hoax" (broma del Tom Collins): alguien decía a una persona que un tal "Tom Collins" la había estado insultando en un bar cercano. Cuando la víctima iba al bar a buscarle, el bartender le ofrecía un Tom Collins. Era una broma nacional que duró meses.',
  },
  {
    nombre: 'Paloma',
    familia: 'Highball', base: 'Tequila / Mezcal',
    ingredientes: ['50 ml de tequila blanco o reposado', '100 ml de refresco de pomelo (Squirt, Jarritos) o zumo de pomelo + soda', '15 ml de zumo de lima', 'Sal gruesa en el borde', 'Rodaja de pomelo'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball con borde de sal',
    dulzor: 'Seco',
    graduacion: 'Media',
    perfil: ['Cítrico', 'Amargo', 'Refrescante', 'Salado'],
    origen: 'México',
    decada: 'Años 1950',
    descripcion: 'La Paloma es el cóctel con tequila más popular en México, incluso más que la Margarita. Su combinación de tequila con refresco de pomelo y sal es sencilla, refrescante y perfecta para el clima caluroso. La versión artesanal con zumo de pomelo fresco y soda eleva mucho el resultado.',
    curiosidad: 'La Paloma (paloma en español) es tan popular en México que el consumo de tequila con refresco de pomelo supera al del tequila con zumo de lima. Se cree que fue creada por Don Javier Delgado Corona en el bar La Capilla de Tequila (Jalisco), famoso también por crear el Batanga.',
  },

  // ── MARTINI (6) ─────────────────────────────────────────────────────────────
  {
    nombre: 'Martini Dry',
    familia: 'Martini', base: 'Gin',
    ingredientes: ['75 ml de gin London Dry (preferiblemente alto en botánicos)', '15 ml de vermut seco (Noilly Prat o Dolin)', 'Aceitunas rellenas de anchoa o cáscara de limón retorcida'],
    metodo: 'Directo (revuelto)',
    copa: 'Copa Martini (copa cóctel en V)',
    dulzor: 'Muy seco',
    graduacion: 'Alta',
    perfil: ['Herbal', 'Seco', 'Aromático', 'Elegante'],
    origen: 'San Francisco / Nueva York, Estados Unidos',
    decada: 'Años 1880–1890',
    descripcion: 'El Martini es el rey de los cócteles. Se revuelve (no se agita) con hielo en vaso mezclador para conseguir una dilución precisa y sin burbujas de aire. La proporción gin:vermut varía según el gusto: el Martini "ultrasecos" puede ser apenas un chorrito de vermut. Se sirve siempre muy frío en copa previamente enfriada.',
    curiosidad: 'James Bond pedía su Martini "agitado, no revuelto", lo que para un bartender profesional es una herejía: el shaker introduce burbujas, calienta el cóctel y "rompe" la textura sedosa. La ironía es que la frase hizo más famoso al Martini que cualquier cosa. Ian Fleming, el creador de Bond, sí sabía coctelería y lo hizo adrede como peculiaridad del personaje.',
  },
  {
    nombre: 'Dirty Martini',
    familia: 'Martini', base: 'Vodka',
    ingredientes: ['60 ml de vodka o gin', '10 ml de vermut seco', '15 ml de salmuera de aceitunas', 'Aceitunas verdes (2-3) ensartadas'],
    metodo: 'Agitado (shaker)',
    copa: 'Copa Martini',
    dulzor: 'Muy seco',
    graduacion: 'Alta',
    perfil: ['Salado', 'Umami', 'Seco', 'Intenso'],
    origen: 'Estados Unidos',
    decada: 'Años 1900',
    descripcion: 'El Dirty Martini añade salmuera de aceitunas al Martini clásico, dando un perfil salado y con umami que cambia completamente el carácter del cóctel. A diferencia del Martini clásico, se puede agitar sin problema (la salmuera protege la textura). Es el Martini favorito de muchas personas que no suelen disfrutar los cócteles muy secos.',
    curiosidad: 'El Dirty Martini fue documentado por primera vez en 1901 por el presidente Theodore Roosevelt, que lo pedía regularmente. La expresión "dirty" (sucio) viene del aspecto turbio que la salmuera da al cóctel, completamente opuesto a la transparencia cristalina del Martini clásico.',
  },
  {
    nombre: 'Negroni',
    familia: 'Martini', base: 'Gin',
    ingredientes: ['30 ml de gin London Dry', '30 ml de vermut rojo dulce (Martini Rosso)', '30 ml de Campari', 'Rodaja de naranja'],
    metodo: 'Directo (revuelto)',
    copa: 'Vaso old fashioned (rocks) con una bola de hielo',
    dulzor: 'Seco',
    graduacion: 'Alta',
    perfil: ['Amargo', 'Herbal', 'Cítrico', 'Complejo'],
    origen: 'Florencia, Italia',
    decada: 'Año 1919',
    descripcion: 'El Negroni es perfección en tres ingredientes iguales. Se revuelve en vaso mezclador y se sirve sobre una gran bola de hielo (que se derrite lentamente para no diluir en exceso). El Campari aporta el amargor, el vermut la dulzura herbal y el gin la estructura botánica. Es el aperitivo italiano por excelencia.',
    curiosidad: 'El Negroni fue creado en el bar Caffè Casoni de Florencia en 1919 por el Conde Camillo Negroni, que pidió al bartender Fosco Scarselli que reforzara su Americano habitual sustituyendo la soda por gin. La bebida resultante tomó el nombre del Conde. La Negroni Week recauda millones cada año para organizaciones benéficas.',
  },
  {
    nombre: 'Manhattan',
    familia: 'Martini', base: 'Whisky / Bourbon',
    ingredientes: ['60 ml de bourbon o rye whisky', '30 ml de vermut rojo dulce', '2 golpes de bitters Angostura', 'Cereza al marrasquino (o cereza Luxardo)'],
    metodo: 'Directo (revuelto)',
    copa: 'Copa de cóctel coupe o copa Martini',
    dulzor: 'Equilibrado',
    graduacion: 'Alta',
    perfil: ['Especiado', 'Dulce herbal', 'Complejo', 'Calidez'],
    origen: 'Manhattan, Nueva York',
    decada: 'Años 1870',
    descripcion: 'El Manhattan es el gran cóctel americano de otoño-invierno. El vermut dulce suaviza y aromatiza el whisky, y los bitters añaden complejidad aromática. Se revuelve con hielo para conseguir dilución precisa. La elección entre bourbon (más dulce) o rye (más especiado) cambia significativamente el perfil.',
    curiosidad: 'La leyenda dice que el Manhattan fue creado en el Manhattan Club de Nueva York en 1874 para un banquete organizado por Lady Randolph Churchill (madre de Winston Churchill). Los historiadores consideran esta historia improbable ya que Lady Churchill estaba en aquellas fechas embarazada en Inglaterra. El origen real permanece sin resolver.',
  },
  {
    nombre: 'Old Fashioned',
    familia: 'Martini', base: 'Whisky / Bourbon',
    ingredientes: ['60 ml de bourbon o rye whisky', '5 ml de jarabe de azúcar simple (o 1 terrón de azúcar)', '2-3 golpes de bitters Angostura', 'Cáscara de naranja y de limón retorcida', 'Cereza opcional'],
    metodo: 'Directo (revuelto)',
    copa: 'Vaso old fashioned (rocks) con cubito grande o bola de hielo',
    dulzor: 'Seco',
    graduacion: 'Alta',
    perfil: ['Robusto', 'Especiado', 'Cítrico sutil', 'Ahumado'],
    origen: 'Louisville, Kentucky, Estados Unidos',
    decada: 'Años 1880',
    descripcion: 'El Old Fashioned es posiblemente el cóctel más antiguo que se sigue preparando en bares de todo el mundo. Su concepto es puro: whisky, azúcar, bitters y agua (hielo diluido). Se construye directamente en el vaso, añadiendo el hielo al final. El retorcido de piel de naranja sobre la superficie, que libera los aceites esenciales, es imprescindible.',
    curiosidad: 'El nombre "Old Fashioned" surgió cuando los clientes, hartos de los nuevos cócteles complicados de los años 1880, pedían su whisky preparado "the old-fashioned way" (a la manera antigua). La expresión quedó como nombre permanente. Es el cóctel favorito de Don Draper en la serie Mad Men.',
  },
  {
    nombre: 'Rob Roy',
    familia: 'Martini', base: 'Whisky / Bourbon',
    ingredientes: ['60 ml de Scotch whisky (Single Malt o blend suave)', '30 ml de vermut rojo dulce', '2 golpes de bitters Angostura', 'Cereza al marrasquino o cáscara de limón'],
    metodo: 'Directo (revuelto)',
    copa: 'Copa coupe o copa Martini',
    dulzor: 'Equilibrado',
    graduacion: 'Alta',
    perfil: ['Ahumado', 'Herbal', 'Especiado', 'Complejo'],
    origen: 'Nueva York, Estados Unidos',
    decada: 'Año 1894',
    descripcion: 'El Rob Roy es esencialmente un Manhattan preparado con Scotch whisky en lugar de bourbon o rye. El resultado es un cóctel más ahumado y con notas de turba (especialmente si se usa un Islay Single Malt) que el Manhattan americano. Es el puente perfecto para fans del whisky escocés que quieren explorar la coctelería clásica.',
    curiosidad: 'El Rob Roy fue creado en el hotel Waldorf Astoria de Nueva York en 1894 para celebrar el estreno de la ópera "Rob Roy", basada en la vida del héroe escocés del siglo XVII Robert Roy MacGregor. Es uno de los pocos cócteles con una fecha y lugar de creación documentados con precisión histórica.',
  },

  // ── TROPICAL (6) ────────────────────────────────────────────────────────────
  {
    nombre: 'Piña Colada',
    familia: 'Tropical', base: 'Ron',
    ingredientes: ['50 ml de ron blanco', '30 ml de ron de coco (Malibu o Bounty)', '90 ml de zumo de piña natural', '30 ml de crema de coco (Coco López)', 'Rodaja de piña y cereza para decorar'],
    metodo: 'Batido (blender)',
    copa: 'Copa hurricane o vaso largo',
    dulzor: 'Muy dulce',
    graduacion: 'Media',
    perfil: ['Tropical', 'Cremoso', 'Dulce', 'Coco'],
    origen: 'San Juan, Puerto Rico',
    decada: 'Año 1954',
    descripcion: 'La Piña Colada es el cóctel oficial de Puerto Rico desde 1978. Se puede preparar batida con hielo (frozen) o agitada en shaker. La versión frozen, más cremosa y espesa, es la más popular en zonas turísticas. La calidad de la crema de coco y el zumo de piña (preferiblemente fresco) marcan la diferencia.',
    curiosidad: 'La Piña Colada fue creada en 1954 por Ramón "Monchito" Marrero, bartender del Hotel Caribe Hilton de San Juan. El hotel tiene una placa conmemorativa. En 1979 la canción "Escape (The Piña Colada Song)" de Rupert Holmes se convirtió en el último número 1 de los años 70 en EE.UU.',
  },
  {
    nombre: 'Mai Tai',
    familia: 'Tropical', base: 'Ron',
    ingredientes: ['30 ml de ron dorado jamaicano', '30 ml de ron dorado martiniqués', '15 ml de curaçao de naranja', '15 ml de orgeat (jarabe de almendra)', '20 ml de zumo de lima fresco', 'Ramita de menta y cáscara de lima'],
    metodo: 'Agitado (shaker)',
    copa: 'Vaso rocks o vaso tiki',
    dulzor: 'Equilibrado',
    graduacion: 'Alta',
    perfil: ['Tropical', 'Almendrado', 'Cítrico', 'Complejo'],
    origen: 'Oakland, California, Estados Unidos',
    decada: 'Año 1944',
    descripcion: 'El Mai Tai original de Trader Vic es un cóctel de una complejidad insospechada: mezcla de dos rones diferentes, curaçao, orgeat y lima. La versión que se sirve en la mayoría de bares es una simplificación azucarada que poco tiene que ver con la original. La palabra "mai tai" significa "fuera de este mundo" en tahitiano.',
    curiosidad: 'Trader Vic (Victor J. Bergeron) creó el Mai Tai en 1944 para unos amigos de Tahití. Cuando lo probaron exclamaron "Mai Tai - Roa Ae!" ("¡Fuera de este mundo, lo mejor!"). La receta original usaba ron añejo jamaicano J. Wray Nephew de 17 años, hoy prácticamente inencontrable. Una botella de esta añada cuesta más de 50.000 USD.',
  },
  {
    nombre: 'Sex on the Beach',
    familia: 'Tropical', base: 'Vodka',
    ingredientes: ['40 ml de vodka', '20 ml de peach schnapps (licor de melocotón)', '60 ml de zumo de naranja fresco', '60 ml de zumo de arándano rojo', 'Rodaja de naranja y cereza'],
    metodo: 'Agitado (shaker)',
    copa: 'Vaso highball con hielo',
    dulzor: 'Dulce',
    graduacion: 'Media',
    perfil: ['Frutal', 'Dulce', 'Tropical', 'Refrescante'],
    origen: 'Fort Lauderdale, Florida, Estados Unidos',
    decada: 'Año 1987',
    descripcion: 'El Sex on the Beach es uno de los cócteles más pedidos en bares de playa y discotecas. Fue creado como parte de una campaña de marketing de DeKuyper para vender su nuevo licor de melocotón. Su nombre llamativo y su sabor accesible y frutal lo convirtieron en éxito inmediato.',
    curiosidad: 'El cóctel fue creado en 1987 por Ted Pizio en Fort Lauderdale durante el Spring Break. El nombre fue elegido deliberadamente para que los jóvenes universitarios se sintieran atrevidos al pedirlo en voz alta. La estrategia funcionó: fue un éxito de ventas desde la primera temporada.',
  },
  {
    nombre: 'Tequila Sunrise',
    familia: 'Tropical', base: 'Tequila / Mezcal',
    ingredientes: ['50 ml de tequila blanco', '100 ml de zumo de naranja fresco', '15 ml de granadina (al final, sin remover)', 'Rodaja de naranja y cereza'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball',
    dulzor: 'Dulce',
    graduacion: 'Media',
    perfil: ['Frutal', 'Dulce', 'Cítrico', 'Suave'],
    origen: 'Arizona / California, Estados Unidos',
    decada: 'Años 1930 (versión moderna: 1970s)',
    descripcion: 'El Tequila Sunrise es más visual que complejo: la granadina, más densa, se vierte al final y se hunde creando el degradado rojo-naranja que imita el amanecer. No se remueve. Es un cóctel de entrada perfecto para quienes no están familiarizados con el tequila: el zumo de naranja suaviza el espirituoso.',
    curiosidad: 'The Rolling Stones bautizaron su gira de 1972 como "The Cocaine and Tequila Sunrise Tour" porque el cóctel era su bebida oficial durante el viaje. Mick Jagger y compañía lo popularizaron tanto que cuando Eagles lanzó su canción "Tequila Sunrise" en 1973, el cóctel se volvió omnipresente en todo el mundo.',
  },
  {
    nombre: 'Blue Lagoon',
    familia: 'Tropical', base: 'Vodka',
    ingredientes: ['30 ml de vodka', '30 ml de curaçao azul (Blue Curaçao)', '100 ml de limonada (o zumo de limón + soda)', 'Rodaja de limón y cereza roja (contraste visual)'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball con hielo',
    dulzor: 'Dulce',
    graduacion: 'Media',
    perfil: ['Cítrico', 'Dulce', 'Frutal', 'Tropical'],
    origen: 'París, Francia',
    decada: 'Año 1972',
    descripcion: 'El Blue Lagoon es tan famoso por su color azul intenso como por su sabor. El curaçao azul es simplemente curaçao de naranja teñido con colorante azul (el sabor es idéntico al naranja). Es un cóctel de aspecto espectacular, fácil de preparar y muy accesible en sabor.',
    curiosidad: 'El Blue Lagoon fue creado en 1972 por Andy MacElhone en Harry\'s New York Bar de París, hijo de Harry MacElhone (el creador de la White Lady). El bar familiar en la rue Daunou lleva más de 100 años abierto y ha servido cócteles a Hemingway, Cary Grant, Humphrey Bogart y decenas de presidentes y artistas.',
  },
  {
    nombre: 'Bahama Mama',
    familia: 'Tropical', base: 'Ron',
    ingredientes: ['30 ml de ron negro', '30 ml de ron de coco (Malibu)', '20 ml de licor de café (Kahlúa)', '80 ml de zumo de piña', '60 ml de zumo de naranja', '15 ml de granadina'],
    metodo: 'Agitado (shaker)',
    copa: 'Vaso hurricane con hielo picado',
    dulzor: 'Muy dulce',
    graduacion: 'Media',
    perfil: ['Tropical', 'Dulce', 'Frutal', 'Coco y café'],
    origen: 'Bahamas',
    decada: 'Años 1970',
    descripcion: 'El Bahama Mama es el cóctel definitivo de vacaciones en el Caribe: colorido, dulce, frutal y cargado de espíritu tropical. La combinación de ron negro, coco y café con zumos de frutas lo hace más complejo que la mayoría de cócteles de resort. Se sirve muy frío con abundante hielo picado.',
    curiosidad: 'El Bahama Mama es el cóctel oficial de las Bahamas y es prácticamente imposible encontrar una versión estandarizada: cada bar caribeño tiene su propia receta. Los ingredientes base (ron negro, coco, piña, naranja) siempre están presentes, pero las proporciones y los extras varían enormemente de isla en isla.',
  },

  // ── SPRITZ / APERITIVO (6) ──────────────────────────────────────────────────
  {
    nombre: 'Aperol Spritz',
    familia: 'Spritz / Aperitivo', base: 'Vermut / Aperol',
    ingredientes: ['90 ml de vino Prosecco frío', '60 ml de Aperol', '30 ml de soda water', 'Rodaja de naranja y aceituna verde (opcional)'],
    metodo: 'Construido (vaso)',
    copa: 'Copa balón con hielo',
    dulzor: 'Equilibrado',
    graduacion: 'Baja',
    perfil: ['Cítrico', 'Ligeramente amargo', 'Floral', 'Refrescante'],
    origen: 'Venecia, Italia',
    decada: 'Años 1950 (popularizado mundialmente: 2000s)',
    descripcion: 'El Aperol Spritz es el fenómeno de la coctelería del siglo XXI. La fórmula oficial es 3:2:1 (Prosecco:Aperol:soda). Se sirve en copa balón con hielo, naranja y a veces aceitunas. Su éxito mundial es atribuido en parte a la campaña de marketing de Campari Group, pero el cóctel es genuinamente bueno y ligero.',
    curiosidad: 'El Aperol fue creado en 1919 en Padua pero permaneció casi desconocido fuera de Italia hasta los años 2000. Campari Group compró la marca en 2003 y lanzó una campaña global que convirtió el Aperol Spritz en el aperitivo más famoso del mundo en menos de 10 años. Es uno de los éxitos de marketing de la historia de las bebidas.',
  },
  {
    nombre: 'Campari Spritz',
    familia: 'Spritz / Aperitivo', base: 'Vermut / Aperol',
    ingredientes: ['60 ml de Campari', '90 ml de Prosecco', '30 ml de soda water', 'Rodaja de naranja'],
    metodo: 'Construido (vaso)',
    copa: 'Copa balón con hielo',
    dulzor: 'Seco',
    graduacion: 'Baja',
    perfil: ['Muy amargo', 'Herbal', 'Cítrico', 'Refrescante'],
    origen: 'Milán, Italia',
    decada: 'Años 1920',
    descripcion: 'El Campari Spritz es la versión adulta e intensa del Aperol Spritz. El Campari tiene el doble de graduación que el Aperol y un amargor mucho más pronunciado. Es el aperitivo favorito de quienes buscan algo con más carácter y menos dulzor. Requiere cierta educación del paladar para apreciarlo en su primera toma.',
    curiosidad: 'El Campari fue creado en 1860 por Gaspare Campari en Novara. La receta original contiene 60 ingredientes (plantas, hierbas, cortezas) y es un secreto absoluto. Durante décadas contuvo cochinilla (insecto) para el colorante rojo; hoy usa colorantes vegetales. La receta lleva inalterada desde 1860.',
  },
  {
    nombre: 'Bellini',
    familia: 'Spritz / Aperitivo', base: 'Champán / Cava',
    ingredientes: ['100 ml de Prosecco muy frío', '50 ml de puré de melocotón blanco fresco (o néctar de melocotón blanco)', 'Ninguna decoración (o un trocito de melocotón)'],
    metodo: 'Construido (vaso)',
    copa: 'Copa de champán (flauta)',
    dulzor: 'Dulce',
    graduacion: 'Baja',
    perfil: ['Frutal', 'Suave', 'Floral', 'Refrescante'],
    origen: 'Venecia, Italia (Harry\'s Bar)',
    decada: 'Año 1948',
    descripcion: 'El Bellini es elegancia pura: Prosecco frío y puré de melocotón blanco. El melocotón blanco (más aromático que el amarillo) es imprescindible en la receta original. El resultado es un aperitivo delicado, perfectamente equilibrado entre el dulzor de la fruta y la acidez del Prosecco.',
    curiosidad: 'El Bellini fue creado en 1948 por Giuseppe Cipriani en el Harry\'s Bar de Venecia durante una exposición de pinturas del artista Giovanni Bellini. El color rosado del cóctel le recordó al tono que Bellini usaba en sus pinturas de santos. El Harry\'s Bar es Patrimonio Cultural de la Humanidad según el gobierno italiano.',
  },
  {
    nombre: 'Kir Royal',
    familia: 'Spritz / Aperitivo', base: 'Champán / Cava',
    ingredientes: ['1 cucharada sopera (~20 ml) de crème de cassis (licor de grosella negra)', '~120 ml de champán brut o cava frío'],
    metodo: 'Construido (vaso)',
    copa: 'Copa de champán (flauta)',
    dulzor: 'Dulce',
    graduacion: 'Baja',
    perfil: ['Frutal', 'Floral', 'Delicado', 'Festivo'],
    origen: 'Borgoña, Francia (Dijon)',
    decada: 'Años 1950',
    descripcion: 'El Kir Royal es la versión elegante del Kir simple (el Kir usa vino blanco en lugar de champán). Se prepara vertiendo primero el cassis en la copa y luego el champán, que activa las burbujas y crea un efecto visual hermoso. La versión española con cava es perfectamente aceptable y más económica.',
    curiosidad: 'El Kir toma el nombre del alcalde de Dijon, Félix Kir, quien en los años 50 promovía la mezcla de cassis local (la grosella negra es el producto estrella de Borgoña) con el vino blanco aligoté regional como forma de impulsar la economía local. Su versión con champán fue bautizada "Royal" por la elegancia extra.',
  },
  {
    nombre: 'Americano',
    familia: 'Spritz / Aperitivo', base: 'Vermut / Aperol',
    ingredientes: ['30 ml de Campari', '30 ml de vermut rojo dulce (Martini Rosso)', 'Soda water al gusto', 'Rodaja de naranja'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball con hielo',
    dulzor: 'Equilibrado',
    graduacion: 'Baja',
    perfil: ['Amargo', 'Herbal', 'Cítrico', 'Refrescante'],
    origen: 'Milán, Italia',
    decada: 'Años 1860',
    descripcion: 'El Americano es el padre del Negroni: se le añade gin y se quita la soda para hacer el Negroni. Solo con Campari, vermut rojo y soda, el Americano es más ligero y refrescante, ideal para el aperitivo. El nombre "Americano" se popularizó porque los turistas americanos lo pedían con frecuencia en los cafés milaneses.',
    curiosidad: 'El Americano es el primer cóctel que bebe James Bond en la historia de los libros de Ian Fleming, en "Casino Royale" (1953). En la escena del café en Royale-les-Eaux, Bond pide un Americano antes de los Vodka Martinis que lo harían famoso. Fleming sabía coctelería y la elección del Americano como primera bebida de Bond no fue casual.',
  },
  {
    nombre: 'Hugo Spritz',
    familia: 'Spritz / Aperitivo', base: 'Champán / Cava',
    ingredientes: ['120 ml de Prosecco frío', '30 ml de jarabe de flor de saúco (Elderflower)', '30 ml de soda water', '5-6 hojas de menta fresca', 'Rodaja de lima'],
    metodo: 'Construido (vaso)',
    copa: 'Copa balón con hielo',
    dulzor: 'Dulce',
    graduacion: 'Baja',
    perfil: ['Floral', 'Herbal', 'Dulce', 'Refrescante'],
    origen: 'Alto Adigio, Italia (región alpina)',
    decada: 'Año 2005',
    descripcion: 'El Hugo es el aperitivo menos conocido fuera de Italia y Austria pero enormemente popular en el norte de Italia y los Alpes. La flor de saúco le da un perfil floral único y delicado, muy diferente al amargor del Aperol. Es refrescante, aromático y sorprendentemente elegante para ser un cóctel tan sencillo.',
    curiosidad: 'El Hugo fue creado en 2005 por el barman Roland Gruber en Naturns (Alto Adigio). Inicialmente era conocido solo en la región alpina. La popularización del Aperol Spritz en toda Europa arrastró consigo al Hugo como alternativa floral. Hoy es tan popular en Austria y el norte de Italia como el propio Aperol Spritz.',
  },

  // ── CREMOSO / CALIENTE (5) ──────────────────────────────────────────────────
  {
    nombre: 'White Russian',
    familia: 'Cremoso / Caliente', base: 'Vodka',
    ingredientes: ['50 ml de vodka', '20 ml de licor de café (Kahlúa)', '30 ml de nata líquida o leche entera (flotar encima)', 'Hielo en cubiteras'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso old fashioned (rocks)',
    dulzor: 'Dulce',
    graduacion: 'Alta',
    perfil: ['Cremoso', 'Café', 'Dulce', 'Suave'],
    origen: 'Estados Unidos / Bélgica',
    decada: 'Años 1960',
    descripcion: 'El White Russian se construye directamente en el vaso con hielo: vodka, Kahlúa y la nata se vierte despacio sobre el dorso de una cuchara para que flote parcialmente. El resultado es un efecto visual de capas que se mezclan al beberlo. Se puede remover o dejar en capas según el gusto.',
    curiosidad: 'El White Russian alcanzó fama mundial gracias a la película "El Gran Lebowski" (1998) de los Hermanos Coen. El personaje "El Dude" (Jeff Bridges) bebe White Russian en casi todas las escenas, llamándolo siempre "Caucasian". La película convirtió al White Russian en cóctel de culto y multiplicó sus ventas.',
  },
  {
    nombre: 'Baileys con hielo',
    familia: 'Cremoso / Caliente', base: 'Whisky / Bourbon',
    ingredientes: ['50-60 ml de Baileys Irish Cream', 'Hielo en cubiteras o bola de hielo grande', 'Cacao en polvo o virutas de chocolate (opcional)'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso old fashioned o copa de whisky',
    dulzor: 'Muy dulce',
    graduacion: 'Media',
    perfil: ['Cremoso', 'Chocolate', 'Café', 'Vainilla', 'Whisky suave'],
    origen: 'Dublín, Irlanda',
    decada: 'Año 1974',
    descripcion: 'El Baileys es técnicamente una crema de whisky irlandés con nata, cacao y vainilla. Aunque a veces se considera una bebida por sí sola, servido sobre una gran bola de hielo se convierte en un cóctel cremoso de postre extraordinario. El hielo diluye ligeramente la intensidad y abre los aromas.',
    curiosidad: 'El Baileys fue creado en 1974 por Tom Jago de la empresa International Distillers & Vintners. La marca gastó apenas 27 libras esterlinas en el desarrollo inicial de la receta. Hoy es el licor más vendido del mundo (más de 100 millones de botellas al año), superando a Kahlúa y Amaretto. Se exporta a 180 países.',
  },
  {
    nombre: 'Irish Coffee',
    familia: 'Cremoso / Caliente', base: 'Whisky / Bourbon',
    ingredientes: ['40 ml de whisky irlandés (Jameson, Bushmills...)', '120 ml de café caliente fuerte (espresso doble o café filtrado)', '15 ml de azúcar moreno', '40 ml de nata semi-montada (flota encima)', 'Canela en polvo (opcional)'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso Irish Coffee (vaso con pie de cristal)',
    dulzor: 'Dulce',
    graduacion: 'Media',
    perfil: ['Café', 'Cremoso', 'Especiado', 'Caliente'],
    origen: 'Aeropuerto de Foynes, Irlanda',
    decada: 'Año 1943',
    descripcion: 'El Irish Coffee se prepara en copa de cristal transparente para apreciar las capas. La nata no se bate completamente (solo semi-montada) para que flote sobre el café caliente. Se bebe a través de la nata sin remover. La temperatura, el azúcar disuelto en el café y la nata fría crean una experiencia de contrastes.',
    curiosidad: 'El Irish Coffee fue inventado en 1943 por el chef Joe Sheridan en el aeropuerto de vuelos de hidroaviones de Foynes (Irlanda) para calentar a los pasajeros que llegaban empapados de un vuelo transoceánico cancelado. Cuando le preguntaron si era café brasileño, respondió: "No, es café irlandés."',
  },
  {
    nombre: 'Hot Toddy',
    familia: 'Cremoso / Caliente', base: 'Whisky / Bourbon',
    ingredientes: ['50 ml de whisky escocés o bourbon', '200 ml de agua caliente (no hirviendo)', '15 ml de miel', '15 ml de zumo de limón fresco', '1 ramita de canela', '2 clavos de olor'],
    metodo: 'Construido (vaso)',
    copa: 'Taza o vaso resistente al calor',
    dulzor: 'Dulce',
    graduacion: 'Media',
    perfil: ['Especiado', 'Dulce', 'Cítrico', 'Caliente'],
    origen: 'Escocia / Irlanda',
    decada: 'Siglo XVIII',
    descripcion: 'El Hot Toddy es el remedio casero por excelencia en los países anglosajones: un cóctel caliente a base de whisky, miel, limón y especias que se toma cuando se tiene frío o los primeros síntomas de un resfriado. Su preparación admite infinitas variantes según el whisky y las especias utilizadas.',
    curiosidad: 'En Escocia e Irlanda el Hot Toddy se considera desde el siglo XVIII un remedio médico casero para el resfriado y la gripe. La ciencia moderna confirma que la miel tiene propiedades antibacterianas leves y el vapor de limón puede aliviar la congestión nasal. El alcohol... simplemente ayuda a dormir.',
  },
  {
    nombre: 'Piña Colada cremosa',
    familia: 'Cremoso / Caliente', base: 'Ron',
    ingredientes: ['50 ml de ron blanco', '30 ml de crema de coco (Coco López)', '60 ml de zumo de piña', '50 ml de nata líquida', 'Hielo picado abundante', 'Rodaja de piña y coco rallado tostado'],
    metodo: 'Licuado',
    copa: 'Copa hurricane o copa tropical',
    dulzor: 'Muy dulce',
    graduacion: 'Media',
    perfil: ['Cremoso', 'Tropical', 'Coco', 'Dulce intenso'],
    origen: 'Puerto Rico',
    decada: 'Año 1954',
    descripcion: 'La versión cremosa de la Piña Colada sustituye parte del zumo de piña por nata líquida, creando una textura más densa y un perfil más rico. Se licúa con abundante hielo picado hasta obtener una consistencia casi de granizado cremoso. El coco rallado tostado encima añade textura y aroma.',
    curiosidad: 'La Piña Colada fue declarada bebida nacional de Puerto Rico el 10 de julio de 1978 por decreto gubernamental. Es uno de los pocos casos en el mundo en que un cóctel tiene estatus oficial de bebida nacional reconocido por ley. Puerto Rico celebra cada 10 de julio el Día Nacional de la Piña Colada.',
  },

  // ── SIN ALCOHOL (7) ─────────────────────────────────────────────────────────
  {
    nombre: 'Virgin Mojito',
    familia: 'Sin alcohol', base: 'Sin alcohol',
    ingredientes: ['25 ml de zumo de lima fresco', '15 ml de jarabe de azúcar', '6-8 hojas de menta fresca', 'Soda water (~150 ml)', 'Hielo picado abundante', 'Rodaja de lima'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball',
    dulzor: 'Equilibrado',
    graduacion: 'Sin alcohol',
    perfil: ['Herbal', 'Cítrico', 'Refrescante'],
    origen: 'Derivado del Mojito cubano',
    decada: 'Años 1990',
    descripcion: 'El Virgin Mojito es probablemente el mocktail más pedido del mundo. Sin ron pero con toda la frescura de la menta, la lima y la soda, es una bebida elegante y satisfactoria para quienes no consumen alcohol. La clave es usar menta fresca de buena calidad y no machacarla en exceso.',
    curiosidad: 'El término "mocktail" (mezcla de "mock" -imitación- y "cocktail") se popularizó en los años 80 pero las bebidas sin alcohol en bar existen desde el siglo XIX. El mercado de los mocktails creció un 42% entre 2019 y 2023 en Europa, impulsado por la tendencia "sober curious" entre los menores de 35 años.',
  },
  {
    nombre: 'Shirley Temple',
    familia: 'Sin alcohol', base: 'Sin alcohol',
    ingredientes: ['120 ml de ginger ale o limonada', '30 ml de granadina', '30 ml de zumo de naranja (opcional)', 'Cereza al marrasquino y rodaja de naranja'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball con hielo',
    dulzor: 'Muy dulce',
    graduacion: 'Sin alcohol',
    perfil: ['Dulce', 'Frutal', 'Burbujeante'],
    origen: 'Los Ángeles, California, Estados Unidos',
    decada: 'Años 1930',
    descripcion: 'La Shirley Temple es el mocktail más famoso de la historia americana. Creada para la actriz infantil Shirley Temple en los años 30 para que pudiera tener "su" bebida en las reuniones de adultos, se convirtió en la bebida sin alcohol por excelencia en restaurantes y bares americanos durante décadas.',
    curiosidad: 'La actriz Shirley Temple, uno de los niños más famosos de Hollywood en los años 30, detestaba el cóctel que llevaba su nombre y protestó públicamente varias veces por ello. Consideraba que era "demasiado dulce" y que comercializar una bebida con su nombre sin consentimiento era inapropiado.',
  },
  {
    nombre: 'Arnold Palmer',
    familia: 'Sin alcohol', base: 'Sin alcohol',
    ingredientes: ['120 ml de té negro frío sin azúcar', '120 ml de limonada casera', 'Hielo en abundancia', 'Rodaja de limón'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso largo o vaso highball',
    dulzor: 'Equilibrado',
    graduacion: 'Sin alcohol',
    perfil: ['Cítrico', 'Té', 'Refrescante', 'Ligero'],
    origen: 'Estados Unidos',
    decada: 'Años 1960',
    descripcion: 'El Arnold Palmer es la bebida sin alcohol más elegante y equilibrada de la lista: mitad té negro frío, mitad limonada. El amargor del té y la acidez del limón se equilibran perfectamente. Es la opción ideal para quienes buscan algo refrescante y adulto sin alcohol. La versión con vodka se llama "John Daly".',
    curiosidad: 'El golfista Arnold Palmer, cuatro veces ganador del Masters de Augusta, popularizó esta combinación en los torneos de golf en los años 60. La bebida fue bautizada con su nombre por los aficionados que lo veían pedirla siempre. Palmer nunca cobró regalías y no le importó que llevara su nombre: "Me parece bien".',
  },
  {
    nombre: 'Virgin Mary',
    familia: 'Sin alcohol', base: 'Sin alcohol',
    ingredientes: ['150 ml de zumo de tomate', '15 ml de zumo de limón fresco', '3-4 gotas de Tabasco', '5 ml de salsa Worcestershire', 'Sal de apio y pimienta negra molida', 'Apio, olivas y sal gruesa para decorar'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball con hielo',
    dulzor: 'Muy seco',
    graduacion: 'Sin alcohol',
    perfil: ['Salado', 'Umami', 'Picante', 'Savory'],
    origen: 'Derivado del Bloody Mary (París / Nueva York)',
    decada: 'Años 1950',
    descripcion: 'La Virgin Mary es el Bloody Mary sin vodka, y es extraordinariamente satisfactoria por sí sola: la combinación de tomate, limón, picante y umami de la Worcestershire crea una bebida compleja y saciante. Es la bebida no alcohólica más gastronómica de toda la coctelería.',
    curiosidad: 'El Bloody Mary original fue inventado alrededor de 1921 en el Harry\'s New York Bar de París por el barman Fernand "Pete" Petiot, que mezcló vodka ruso con zumo de tomate americano. La Virgin Mary surgió cuando los clientes que no bebían alcohol querían disfrutar del mismo perfil sápido y complejo sin el vodka.',
  },
  {
    nombre: 'Limonada de frambuesa',
    familia: 'Sin alcohol', base: 'Sin alcohol',
    ingredientes: ['80 ml de zumo de limón fresco', '40 ml de jarabe de frambuesa (o frambuesas trituradas + azúcar)', '200 ml de agua con gas', 'Frambuesas frescas y ramita de menta', 'Hielo en abundancia'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso mason jar o vaso largo',
    dulzor: 'Dulce',
    graduacion: 'Sin alcohol',
    perfil: ['Frutal', 'Cítrico', 'Dulce', 'Refrescante'],
    origen: 'Derivado de la limonada americana',
    decada: 'Años 1990',
    descripcion: 'La limonada de frambuesa es la actualización moderna de la limonada clásica. El jarabe de frambuesa (o frambuesas frescas) equilibra la acidez del limón con dulzor frutal. Con agua con gas se convierte en una bebida burbujeante y elegante perfecta para eventos, brunches o como alternativa festiva sin alcohol.',
    curiosidad: 'Las limonadas artesanales con frutas se convirtieron en la bebida sin alcohol de referencia en los restaurantes gastronómicos a partir de los años 2000. La tendencia llegó de Estados Unidos donde los "artisan lemonades" se ofrecen en los menús de los mejores restaurantes a precios comparables a los cócteles alcohólicos.',
  },
  {
    nombre: 'Agua de Valencia sin alcohol',
    familia: 'Sin alcohol', base: 'Sin alcohol',
    ingredientes: ['150 ml de zumo de naranja natural (valenciana, si es posible)', '80 ml de cava sin alcohol o mosto espumoso', '15 ml de jarabe de azúcar', 'Rodaja de naranja'],
    metodo: 'Construido (vaso)',
    copa: 'Copa balón o flauta',
    dulzor: 'Dulce',
    graduacion: 'Sin alcohol',
    perfil: ['Cítrico', 'Frutal', 'Burbujeante', 'Refrescante'],
    origen: 'Valencia, España',
    decada: 'Año 1959 (versión original con alcohol)',
    descripcion: 'La versión sin alcohol del cóctel valenciano por excelencia. El Agua de Valencia original mezcla cava, vodka, gin, zumo de naranja y azúcar. Esta versión no alcohólica conserva todo el sabor y las burbujas usando cava sin alcohol o mosto espumoso. El zumo de naranja valenciana recién exprimido es imprescindible.',
    curiosidad: 'El Agua de Valencia original fue creado en 1959 por Constante Gil en el Café Madrid de Valencia, en la Plaza del Ayuntamiento. Lo creó para un grupo de turistas vascos que no querían beber Agua de Bilbao (un cóctel local) y pidió algo "con agua de Valencia". El cóctel original tiene vodka, gin y cava, por lo que es bastante potente pese a su aspecto inocente.',
  },
  {
    nombre: 'Cucumber Cooler',
    familia: 'Sin alcohol', base: 'Sin alcohol',
    ingredientes: ['60 ml de agua de pepino (pepino licuado y colado)', '30 ml de zumo de lima fresco', '20 ml de jarabe de menta', '200 ml de soda water', 'Rodajas de pepino y ramita de menta'],
    metodo: 'Construido (vaso)',
    copa: 'Vaso highball con hielo',
    dulzor: 'Seco',
    graduacion: 'Sin alcohol',
    perfil: ['Herbal', 'Refrescante', 'Ligero', 'Fresco'],
    origen: 'Coctelería moderna internacional',
    decada: 'Años 2010',
    descripcion: 'El Cucumber Cooler es el referente de la nueva coctelería sin alcohol: ligero, herbal, sofisticado y perfectamente adaptado al paladar adulto. El pepino, muy hidratante, aporta frescor sin dulzor artificial. Es el mocktail de referencia en los mejores bares de autor que cuidan su propuesta sin alcohol.',
    curiosidad: 'El pepino como ingrediente de coctelería fue popularizado por la marca de gin Hendrick\'s a partir de 2003, que lo incluye en su receta de botánicos y recomienda servirlo como garnish en el Gin Tonic. De ahí saltó a la coctelería sin alcohol como ingrediente principal, siendo hoy uno de los ingredientes más usados en mocktails premium.',
  },
];

export default function GuiaCocteles() {
  const [busqueda, setBusqueda] = useState('');
  const [familia, setFamilia] = useState<FamiliaCoctel | 'Todas'>('Todas');
  const [base, setBase] = useState<BaseAlcohol | 'Todas'>('Todas');

  const coctelesFiltrados = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    return COCTELES.filter((c) => {
      const matchFamilia = familia === 'Todas' || c.familia === familia;
      const matchBase = base === 'Todas' || c.base === base;
      const matchBusqueda =
        !t ||
        c.nombre.toLowerCase().includes(t) ||
        c.origen.toLowerCase().includes(t) ||
        c.ingredientes.some((i) => i.toLowerCase().includes(t)) ||
        c.perfil.some((p) => p.toLowerCase().includes(t)) ||
        c.descripcion.toLowerCase().includes(t);
      return matchFamilia && matchBase && matchBusqueda;
    });
  }, [busqueda, familia, base]);

  function DotDulzor({ nivel }: { nivel: number }) {
    return (
      <span className={styles.dots} aria-label={`Dulzor ${nivel} de 5`}>
        {Array.from({ length: 5 }, (_, i) => (
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
        <h1>Guía de Cócteles Clásicos</h1>
        <p>45 recetas con ingredientes, método, copa, origen e historia</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── CONTROLES ──────────────────────────────────────────── */}
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar por nombre, ingrediente, origen o perfil..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar cóctel"
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
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Base alcohólica:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por base">
                <button
                  className={`${styles.filtroBtn} ${base === 'Todas' ? styles.filtroActivo : ''}`}
                  onClick={() => setBase('Todas')}
                >Todas</button>
                {BASES.map((b) => (
                  <button
                    key={b}
                    className={`${styles.filtroBtn} ${base === b ? styles.filtroActivo : ''}`}
                    onClick={() => setBase(b)}
                  >{b}</button>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.contador} aria-live="polite">
            {coctelesFiltrados.length} {coctelesFiltrados.length === 1 ? 'cóctel' : 'cócteles'}
          </p>
        </div>

        {/* ── GRID ───────────────────────────────────────────────── */}
        <div className={styles.grid}>
          {coctelesFiltrados.map((c) => (
            <article key={c.nombre} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.familiaBadge} ${FAMILIA_COLOR[c.familia]}`}>
                  {c.familia}
                </span>
                <span className={`${styles.graduacionBadge} ${GRADUACION_COLOR[c.graduacion]}`}>
                  {c.graduacion}
                </span>
              </div>

              <div className={styles.cardTitulo}>
                <h2 className={styles.nombre}>{c.nombre}</h2>
                <span className={styles.origenEpoca}>{c.origen} · {c.decada}</span>
              </div>

              <div className={styles.pillsRow}>
                <span className={styles.metodoPill}>🍸 {c.metodo}</span>
                <span className={styles.copaPill}>🥂 {c.copa}</span>
              </div>

              <p className={styles.descripcion}>{c.descripcion}</p>

              <div className={styles.ingredientesSection}>
                <span className={styles.sectionLabel}>Ingredientes</span>
                <ul className={styles.ingredientesList}>
                  {c.ingredientes.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.perfilSection}>
                <span className={styles.sectionLabel}>Perfil</span>
                <div className={styles.perfilTags}>
                  {c.perfil.map((p) => (
                    <span key={p} className={styles.perfilTag}>{p}</span>
                  ))}
                </div>
              </div>

              <div className={styles.dulzorRow}>
                <span className={styles.sectionLabel}>Dulzor:</span>
                <DotDulzor nivel={DULZOR_NIVEL[c.dulzor]} />
                <span className={styles.dulzorLabel}>{c.dulzor}</span>
              </div>

              <div className={styles.baseBadgeRow}>
                <span className={styles.baseBadge}>🍾 {c.base}</span>
              </div>

              <div className={styles.curiosidadBox}>
                <span className={styles.curiosidadIcon} aria-hidden="true">🍹</span>
                <p className={styles.curiosidadText}>{c.curiosidad}</p>
              </div>
            </article>
          ))}
          {coctelesFiltrados.length === 0 && (
            <p className={styles.sinResultados}>No se encontraron cócteles con esos criterios.</p>
          )}
        </div>
      </main>

      <EducationalSection
        title="El arte del cóctel: historia, técnica y cultura"
        subtitle="Del speakeasy de los años 20 al bar de autor del siglo XXI"
      >
        <p>
          La coctelería clásica es el resultado de siglos de experimentación, creatividad
          y cultura. Cada cóctel clásico es un artefacto cultural que lleva incorporado
          el contexto histórico de su creación: la Margarita y la frontera México-EE.UU.,
          el Mojito y el Caribe colonial, el Negroni y la Italia del aperitivo, el Bellini
          y los cafés de Venecia. Conocer la historia es entender por qué cada ingrediente
          está donde está.
        </p>
        <p>
          La coctelería moderna vive un renacimiento sin precedentes. El movimiento
          "craft cocktails" ha llevado a los bares de autor a trabajar con la misma
          filosofía que un restaurante de alta cocina: ingredientes de temporada,
          técnicas precisas, equilibrio de sabores y presentación cuidada. Los bartenders
          han pasado a ser reconocidos como profesionales creativos al mismo nivel que
          los chefs.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption>Comparativa de métodos de preparación</caption>
            <thead>
              <tr>
                <th>Método</th>
                <th>Cuándo usarlo</th>
                <th>Resultado</th>
                <th>Ejemplos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Agitado (shaker)</strong></td>
                <td>Cócteles con zumos, siropes, huevo o nata</td>
                <td>Bien mezclado, ligeramente aireado, muy frío</td>
                <td>Margarita, Daiquiri, Cosmopolitan</td>
              </tr>
              <tr>
                <td><strong>Directo (revuelto)</strong></td>
                <td>Cócteles solo espirituosos (sin zumos)</td>
                <td>Textura sedosa, sin burbujas de aire, muy frío</td>
                <td>Martini, Negroni, Manhattan</td>
              </tr>
              <tr>
                <td><strong>Construido (vaso)</strong></td>
                <td>Highballs, cócteles largos con soda</td>
                <td>Refrescante, burbujas conservadas, fácil de servir</td>
                <td>Mojito, Gin Tonic, Aperol Spritz</td>
              </tr>
              <tr>
                <td><strong>Batido (blender)</strong></td>
                <td>Cócteles frozen, con frutas enteras</td>
                <td>Textura granizado cremoso, muy frío</td>
                <td>Piña Colada frozen, Daiquiri frozen</td>
              </tr>
              <tr>
                <td><strong>Licuado</strong></td>
                <td>Cócteles cremosos densos con helado o nata</td>
                <td>Muy espeso, cremoso, consistencia batido</td>
                <td>Piña Colada cremosa</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>¿Qué cóctel para cada ocasión?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🥂 Aperitivo antes de cenar</strong>
            <p>
              Aperol Spritz, Campari Spritz, Negroni, Americano o Bellini. El aperitivo
              debe ser ligero, estimular el apetito (bitter o cítrico) y no superar los
              2 unidades de alcohol. Evita los cócteles muy dulces o cremosos antes de comer.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🌙 Sobremesa de noche</strong>
            <p>
              Old Fashioned, Manhattan, Rob Roy o Irish Coffee. Los cócteles de sobremesa
              son más intensos, con más alcohol y sin gas. El whisky y los bitters
              facilitan la digestión y acompañan perfectamente la conversación larga.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🎉 Celebración o evento</strong>
            <p>
              Kir Royal, Bellini, Champán Spritz o Cosmopolitan. Las burbujas del
              Prosecco o el champán son el símbolo universal de la celebración.
              El Cosmopolitan añade un toque de color y sofisticación en copas elegantes.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🫐 Opciones sin alcohol</strong>
            <p>
              Virgin Mojito, Arnold Palmer, Cucumber Cooler o Virgin Mary. Los mocktails
              modernos son tan complejos y satisfactorios como los originales. La Virgin Mary
              es especialmente recomendada para brunch; el Cucumber Cooler para cenas elegantes.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué el Martini se revuelve y no se agita?</strong>
            <p>
              Agitar un cóctel solo de espirituosos (sin zumos) introduce burbujas de
              aire y fragmentos de hielo que "rompen" la textura sedosa del cóctel.
              Revolver en vaso mezclador enfría y diluye con precisión sin aeration.
              Agitar el Martini, como pedía James Bond, es técnicamente incorrecto
              y produce un resultado inferior. Fleming lo sabía y era la peculiaridad del personaje.
            </p>
            <span className={styles.faqTip}>
              🍸 Regla práctica: si el cóctel lleva zumo de cítrico o huevo → shaker.
              Si solo lleva espirituosos → vaso mezclador.
            </span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Importa cuánto hielo se usa?</strong>
            <p>
              El hielo es un ingrediente, no un relleno. Más hielo = menos dilución
              (paradójicamente) porque el líquido se enfría más rápido y hay menos
              fusión. Un Gin Tonic con poca copa llena de hielo se diluye antes que
              uno con copa grande y mucho hielo. El hielo limpio (sin olores del congelador)
              es imprescindible para no arruinar el sabor.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre bartender y mixólogo?</strong>
            <p>
              El bartender es el profesional que trabaja en barra, sirve bebidas y
              gestiona el servicio. El mixólogo es quien se especializa en crear recetas
              y estudia la ciencia detrás de los sabores. En la práctica, muchos
              profesionales son ambos. "Barman" y "coctelero" son términos igualmente
              válidos en español.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es un cóctel de autor?</strong>
            <p>
              Un cóctel de autor es una receta original creada por un bartender específico,
              a diferencia de las recetas clásicas estandarizadas. Los bares de autor
              suelen tener cartas de cócteles exclusivos que reflejan la creatividad del
              equipo, con ingredientes locales, infusiones propias y técnicas avanzadas.
              Es el equivalente gastronómico de la cocina de autor.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Los mocktails son tan satisfactorios como los cócteles?</strong>
            <p>
              Los mocktails modernos bien elaborados son extraordinariamente satisfactorios.
              El alcohol aporta cuerpo y complejidad, pero también los puede aportar el
              agua con gas, los shrubs (vinagres de frutas aromatizados), los verjus
              (uva sin fermentar), los tés y las infusiones. El Cucumber Cooler y el
              Arnold Palmer no envidian nada a sus versiones alcohólicas.
            </p>
            <span className={styles.faqTip}>
              🫐 El mercado de bebidas sin alcohol premium creció un 506% entre 2015 y 2022.
              Marcas como Seedlip, Lyre's o Monday Gin replican los botánicos del gin sin alcohol.
            </span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo elegir la copa adecuada?</strong>
            <p>
              La copa no es un capricho: su forma influye en el aroma, la temperatura y
              la textura percibida. La copa Martini (en V) concentra los aromas hacia
              la nariz. El vaso highball permite mantener las burbujas. La copa balón
              del Gin Tonic conserva la temperatura con el gran volumen de hielo.
              La copa flauta del champán preserva las burbujas. Cada forma tiene su razón.
            </p>
          </li>
        </ul>

        <h3>Cómo preparar un buen cóctel en casa: guía práctica</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Equipamiento básico</strong>
              <p>
                No hace falta mucho: un shaker (Boston shaker de dos piezas o shaker
                con colador), un vaso mezclador, una cuchara de bar larga, un muddler
                (mortero para menta), un jigger (medidor doble) y un colador Hawthorne.
                Con estos 6 utensilios puedes preparar el 90% de los cócteles clásicos.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>El hielo, lo más importante</strong>
              <p>
                Usa hielo limpio sin olores. Los cubitos grandes (o la bola de hielo)
                se funden más lento que el hielo picado. Para los cócteles de verano
                en vaso alto, usa hielo picado o cubiteras normales. Para el Old Fashioned
                o el Negroni, invierte en un molde de bola de hielo: la diferencia visual
                y de temperatura es notable.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Mide con precisión</strong>
              <p>
                Los cócteles son fórmulas matemáticas. Una diferencia de 5 ml en la
                cantidad de zumo de lima puede desequilibrar completamente un Daiquiri.
                Usa siempre el jigger, no "a ojo". Con la práctica aprenderás qué ajustes
                hacer según tus preferencias, pero empieza midiendo con exactitud.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Usa zumos recién exprimidos</strong>
              <p>
                El zumo de lima o limón embotellado no tiene el mismo perfil aromático
                que el fresco. Los aceites esenciales de la piel del cítrico (que se
                liberan al exprimir) son componentes aromáticos clave. La diferencia
                entre un Daiquiri con lima fresca y uno con zumo embotellado es enorme.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Presentación: el garnish importa</strong>
              <p>
                El adorno (garnish) no es solo decorativo: la cáscara de naranja
                retorcida sobre un Negroni libera aceites esenciales que cambian el
                aroma. La hoja de menta en un Mojito añade aroma cada vez que acercas
                la copa a la nariz. La sal en el borde de la Margarita modifica la
                percepción del dulzor. Cuida el garnish: forma parte del cóctel.
              </p>
            </div>
          </li>
        </ol>

        <h3>Consejos del bartender en casa</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧊</span>
            <p>
              Guarda las copas en el congelador 15 minutos antes de servir. Una copa
              fría mantiene el cóctel a temperatura ideal mucho más tiempo. Es el
              truco más sencillo con mayor impacto en el resultado final.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🍋</span>
            <p>
              Exprime los cítricos a temperatura ambiente, no del frigorífico.
              Un limón o lima fría da un 30-40% menos de zumo que uno a temperatura
              ambiente. Sácalos de la nevera 30 minutos antes de preparar los cócteles.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌿</span>
            <p>
              Para el garnish aromático, da un golpe suave a la hoja de menta antes
              de usarla. No la machaques, solo activa los aceites con un leve aplauso
              entre las palmas. Suficiente para liberar el aroma sin amargar.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🍊</span>
            <p>
              Aprende a hacer cáscara retorcida: corta una tira de piel de naranja
              o limón (sin la parte blanca), retuércela sobre la copa para liberar
              los aceites esenciales y frota el borde de la copa con ella. Marca la
              diferencia en un Negroni o un Old Fashioned.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <p>
              Mise en place antes de empezar: mide todos los ingredientes, prepara
              el hielo, corta los garnishes y enfría las copas ANTES de empezar a
              mezclar. Un buen cóctel debe servirse inmediatamente después de prepararse.
              La improvisación a mitad de la preparación arruina el resultado.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al preparar cócteles en casa</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Usar hielo del grifo con sabor a cloro:</strong> el hielo del
              congelador doméstico absorbe olores del frigorífico. Usa hielo de bolsa
              comprado o haz hielo con agua filtrada. Un Martini preparado con hielo
              con sabor a comida es irreparable.
            </li>
            <li>
              <strong>Agitar un Martini o un Negroni:</strong> estos cócteles deben
              revolverse (stirred), no agitarse. El shaker introduce micro-burbujas
              de aire que dan al cóctel una textura aguada y turbia. Solo los cócteles
              con zumos, siropes o huevo deben agitarse.
            </li>
            <li>
              <strong>Escatimar en ingredientes principales:</strong> el gin de un
              Gin Tonic o el ron de un Mojito definen el 80% del sabor. No uses
              el licor más barato disponible para un cóctel que bebes despacio.
              Una botella de gin de gama media cambia completamente la experiencia.
            </li>
            <li>
              <strong>Servir en cristalería caliente:</strong> una copa sacada del
              armario a temperatura ambiente (o peor, recién lavada en lavavajillas)
              deshace el hielo en segundos y diluye el cóctel. Enfría siempre la
              cristalería antes de servir.
            </li>
            <li>
              <strong>Pre-mezclar los cócteles horas antes:</strong> los cócteles
              con burbujas (Spritz, Highballs, Tom Collins) deben servirse al momento.
              Si los mezclas con antelación perderán todo el gas. Solo los cócteles
              sin burbujas (Negroni, Manhattan) pueden pre-mezclarse con resultados
              aceptables.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-cocteles')} />
      <ShareCard appName="guia-cocteles" />
      <Footer appName="guia-cocteles" />
    </div>
  );
}
