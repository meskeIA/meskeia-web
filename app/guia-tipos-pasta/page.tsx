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
import styles from './GuiaTiposPasta.module.css';

type FormaPasta = 'Larga' | 'Corta' | 'Rellena' | 'Lámina' | 'Sopa' | 'Especial';
type SalsaIdeal =
  | 'Tomate'
  | 'Carne'
  | 'Crema'
  | 'Aceite-ajo'
  | 'Pesto'
  | 'Mar'
  | 'Caldo'
  | 'Mantequilla';
type RegionItalia = 'Norte' | 'Centro' | 'Sur' | 'Sicilia/Cerdeña' | 'Internacional';
type Dificultad = 'Fácil' | 'Media' | 'Avanzada';

interface TipoPasta {
  nombre: string;
  nombreOriginal: string;
  forma: FormaPasta;
  region: RegionItalia;
  origen: string;
  tiempoCoccion: string;
  salsasIdeales: SalsaIdeal[];
  platosClasicos: string[];
  dificultadCasera: Dificultad;
  descripcion: string;
  curiosidad: string;
}

const pastas: TipoPasta[] = [
  // PASTA LARGA (10)
  {
    nombre: 'Spaghetti',
    nombreOriginal: 'Spaghetti',
    forma: 'Larga',
    region: 'Sur',
    origen: 'Nápoles',
    tiempoCoccion: '8-10 min',
    salsasIdeales: ['Tomate', 'Aceite-ajo', 'Mar'],
    platosClasicos: ['Carbonara', 'Spaghetti aglio e olio', 'Spaghetti alle vongole'],
    dificultadCasera: 'Media',
    descripcion:
      'La pasta más universal: cilíndrica, fina y larga. Originaria del sur de Italia, hoy es el formato más consumido del mundo.',
    curiosidad: "El nombre significa 'pequeñas cuerdas' en italiano (spago = cuerda)",
  },
  {
    nombre: 'Linguine',
    nombreOriginal: 'Linguine',
    forma: 'Larga',
    region: 'Sur',
    origen: 'Génova/Liguria',
    tiempoCoccion: '9-11 min',
    salsasIdeales: ['Pesto', 'Mar', 'Aceite-ajo'],
    platosClasicos: ['Linguine al pesto', 'Linguine alle vongole', 'Linguine al limone'],
    dificultadCasera: 'Media',
    descripcion:
      "Pasta plana y estrecha (literalmente 'lengüitas'), entre el spaghetti y el fettuccine. Se adapta perfectamente a salsas ligeras y mariscos.",
    curiosidad:
      "El plato 'pesto alla genovese con linguine' es la combinación clásica de Liguria",
  },
  {
    nombre: 'Tagliatelle',
    nombreOriginal: 'Tagliatelle',
    forma: 'Larga',
    region: 'Norte',
    origen: 'Bolonia',
    tiempoCoccion: '4-6 min (fresca)',
    salsasIdeales: ['Carne', 'Crema', 'Mantequilla'],
    platosClasicos: [
      'Tagliatelle al ragù',
      'Tagliatelle ai funghi porcini',
      'Tagliatelle al tartufo',
    ],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Pasta plana al huevo de Emilia-Romaña. En Bolonia, el ragù se sirve tradicionalmente con tagliatelle; el binomio "spaghetti boloñesa" es una adaptación internacional, no una receta original de la región.',
    curiosidad:
      'Hay un tagliatelle de oro en la Cámara de Comercio de Bolonia que define el ancho oficial: 8mm',
  },
  {
    nombre: 'Fettuccine',
    nombreOriginal: 'Fettuccine',
    forma: 'Larga',
    region: 'Centro',
    origen: 'Roma',
    tiempoCoccion: '4-6 min (fresca)',
    salsasIdeales: ['Mantequilla', 'Crema', 'Carne'],
    platosClasicos: ['Fettuccine Alfredo', 'Fettuccine al burro', 'Fettuccine ai funghi'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Pasta plana al huevo de la cocina romana, similar a tagliatelle pero ligeramente más ancha. Famosa internacionalmente por el plato Alfredo.',
    curiosidad:
      'El Alfredo se inventó en 1914 en Roma para la mujer embarazada del cocinero Alfredo di Lelio',
  },
  {
    nombre: 'Pappardelle',
    nombreOriginal: 'Pappardelle',
    forma: 'Larga',
    region: 'Centro',
    origen: 'Toscana',
    tiempoCoccion: '5-7 min (fresca)',
    salsasIdeales: ['Carne', 'Mantequilla'],
    platosClasicos: [
      'Pappardelle al cinghiale (jabalí)',
      'Pappardelle al ragù di lepre',
      'Pappardelle ai porcini',
    ],
    dificultadCasera: 'Avanzada',
    descripcion:
      "Pasta toscana ancha (2-3cm), perfecta para salsas potentes de caza. Su nombre viene de 'pappare', devorar con ganas en italiano antiguo.",
    curiosidad:
      'En Siena tradicionalmente se sirven con liebre cazada en las colinas toscanas',
  },
  {
    nombre: 'Bucatini',
    nombreOriginal: 'Bucatini',
    forma: 'Larga',
    region: 'Centro',
    origen: 'Roma/Lazio',
    tiempoCoccion: '9-11 min',
    salsasIdeales: ['Tomate', 'Carne'],
    platosClasicos: [
      "Bucatini all'amatriciana",
      'Bucatini alla gricia',
      'Bucatini cacio e pepe',
    ],
    dificultadCasera: 'Media',
    descripcion:
      'Spaghetti hueco por dentro, gracias a un agujero central. La salsa entra por dentro y se mezcla con el exterior, intensificando el sabor.',
    curiosidad:
      "El 'buco' (agujero) hace que sea más difícil de comer: salpica más que el spaghetti normal",
  },
  {
    nombre: 'Capellini / Cabello de ángel',
    nombreOriginal: "Capellini d'angelo",
    forma: 'Larga',
    region: 'Norte',
    origen: 'Génova/Liguria',
    tiempoCoccion: '2-3 min',
    salsasIdeales: ['Aceite-ajo', 'Caldo', 'Mar'],
    platosClasicos: ['Capellini al limone', 'Capellini in brodo', 'Capellini al pomodoro fresco'],
    dificultadCasera: 'Fácil',
    descripcion:
      'La pasta más fina del mundo (1mm). Cocción ultra rápida, ideal para salsas muy ligeras o caldos. No soporta salsas pesadas: las aplastan.',
    curiosidad:
      "En Italia se llama 'capellini d'angelo' (cabello de ángel) por su finura extrema",
  },
  {
    nombre: 'Vermicelli',
    nombreOriginal: 'Vermicelli',
    forma: 'Larga',
    region: 'Sur',
    origen: 'Nápoles/Sicilia',
    tiempoCoccion: '7-9 min',
    salsasIdeales: ['Tomate', 'Aceite-ajo', 'Mar'],
    platosClasicos: ['Vermicelli alle vongole', 'Vermicelli al pomodoro', 'Vermicelli con bottarga'],
    dificultadCasera: 'Fácil',
    descripcion:
      "Pasta cilíndrica entre spaghetti y capellini. Su nombre significa 'pequeños gusanos' en italiano. Tradicional en cocinas del sur.",
    curiosidad:
      'En el siglo XV, los napolitanos los comían en la calle con las manos en puestos ambulantes',
  },
  {
    nombre: 'Pici',
    nombreOriginal: 'Pici',
    forma: 'Larga',
    region: 'Centro',
    origen: 'Toscana (Siena)',
    tiempoCoccion: '6-8 min (fresca)',
    salsasIdeales: ['Carne', 'Tomate', 'Aceite-ajo'],
    platosClasicos: ['Pici cacio e pepe', "Pici all'aglione", 'Pici al ragù di cinghiale'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Spaghetti gruesos toscanos hechos a mano, irregulares y rústicos. Solo agua, harina y sal — sin huevo. Una de las pastas más antiguas de Italia.',
    curiosidad:
      'Los pici aparecen en las pinturas etruscas de la Tumba dei Leopardi en Tarquinia (siglo V a.C.)',
  },
  {
    nombre: 'Mafaldine / Reginette',
    nombreOriginal: 'Mafaldine',
    forma: 'Larga',
    region: 'Sur',
    origen: 'Nápoles',
    tiempoCoccion: '8-10 min',
    salsasIdeales: ['Tomate', 'Crema', 'Carne'],
    platosClasicos: [
      'Mafaldine alla napoletana',
      'Mafaldine al pesto rosso',
      'Reginette ai frutti di mare',
    ],
    dificultadCasera: 'Media',
    descripcion:
      'Pasta plana con bordes ondulados (como cintas rizadas). Creada en 1900 en honor a la princesa Mafalda de Saboya. Perfecta para salsas que se agarran a las ondas.',
    curiosidad: "También se llama 'reginette' (pequeñas reinas) por su origen real",
  },

  // PASTA CORTA (15)
  {
    nombre: 'Penne',
    nombreOriginal: 'Penne rigate',
    forma: 'Corta',
    region: 'Sur',
    origen: 'Génova/Sur de Italia',
    tiempoCoccion: '10-12 min',
    salsasIdeales: ['Tomate', 'Carne', 'Crema'],
    platosClasicos: ["Penne all'arrabbiata", 'Penne alla vodka', 'Penne al pesto'],
    dificultadCasera: 'Fácil',
    descripcion:
      'Tubo cortado en diagonal con superficie estriada (rigate). El corte oblicuo recoge la salsa por dentro y las estrías por fuera. La pasta corta más universal.',
    curiosidad:
      "El nombre viene de 'penna' (pluma de escribir) por su forma similar a las plumas de ganso recortadas",
  },
  {
    nombre: 'Rigatoni',
    nombreOriginal: 'Rigatoni',
    forma: 'Corta',
    region: 'Centro',
    origen: 'Roma',
    tiempoCoccion: '12-14 min',
    salsasIdeales: ['Carne', 'Tomate', 'Crema'],
    platosClasicos: [
      'Rigatoni alla pajata',
      'Rigatoni cacio e pepe',
      'Rigatoni alla carbonara',
    ],
    dificultadCasera: 'Fácil',
    descripcion:
      'Tubo grande y estriado de corte recto. Perfecto para salsas con tropezones grandes que se quedan dentro del tubo. Estrella de la cocina romana.',
    curiosidad:
      'Es la pasta favorita en Roma — los romanos los prefieren a los spaghetti para muchos platos clásicos',
  },
  {
    nombre: 'Fusilli',
    nombreOriginal: 'Fusilli',
    forma: 'Corta',
    region: 'Sur',
    origen: 'Sur de Italia',
    tiempoCoccion: '9-11 min',
    salsasIdeales: ['Tomate', 'Pesto', 'Crema'],
    platosClasicos: ['Fusilli al pesto', 'Fusilli alla siciliana', 'Pasta fría con verduras'],
    dificultadCasera: 'Media',
    descripcion:
      "Pasta en espiral o tirabuzón. Tradicionalmente se envolvía a mano alrededor de un palito de hierro ('fuso') para crear la forma espiral característica.",
    curiosidad:
      'Las espirales atrapan la salsa mejor que casi cualquier otra pasta — máxima superficie de contacto',
  },
  {
    nombre: 'Farfalle',
    nombreOriginal: 'Farfalle',
    forma: 'Corta',
    region: 'Norte',
    origen: 'Lombardía/Emilia-Romaña',
    tiempoCoccion: '10-12 min',
    salsasIdeales: ['Crema', 'Mantequilla', 'Tomate'],
    platosClasicos: ['Farfalle al salmón', 'Farfalle ai piselli', 'Pasta fría primavera'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Pasta en forma de mariposa o pajarita, hecha pellizcando una lámina cuadrada por el centro. El centro queda más grueso que los bordes para una textura interesante.',
    curiosidad:
      "Su nombre significa 'mariposas' en italiano. En EE.UU. se llama 'bow-tie pasta' (pasta pajarita)",
  },
  {
    nombre: 'Conchiglie',
    nombreOriginal: 'Conchiglie',
    forma: 'Corta',
    region: 'Sur',
    origen: 'Sur de Italia',
    tiempoCoccion: '10-12 min',
    salsasIdeales: ['Crema', 'Tomate', 'Carne'],
    platosClasicos: ['Conchiglie al ragù', 'Conchiglie con ricotta', 'Pasta fría mediterránea'],
    dificultadCasera: 'Fácil',
    descripcion:
      'Pasta con forma de concha de mar. Su cavidad atrapa salsa y trozos de tropezones, que quedan capturados en el interior al comer.',
    curiosidad:
      "Los 'conchiglioni' son las versiones gigantes que se rellenan de ricotta y se hornean",
  },
  {
    nombre: 'Orecchiette',
    nombreOriginal: 'Orecchiette',
    forma: 'Corta',
    region: 'Sur',
    origen: 'Puglia (Bari)',
    tiempoCoccion: '10-12 min (fresca)',
    salsasIdeales: ['Tomate', 'Aceite-ajo', 'Carne'],
    platosClasicos: [
      'Orecchiette con cime di rapa',
      'Orecchiette con sugo di carne',
      'Orecchiette alle vongole',
    ],
    dificultadCasera: 'Avanzada',
    descripcion:
      "Pequeñas 'orejitas' formadas presionando la masa con el pulgar. Especialidad de Bari donde las abuelas las hacen en la calle (Via dell'Arco Basso).",
    curiosidad:
      "En Bari, las 'pastinare' (mujeres que hacen pasta) las venden frescas en las puertas de sus casas a los turistas",
  },
  {
    nombre: 'Cavatappi / Cellentani',
    nombreOriginal: 'Cavatappi',
    forma: 'Corta',
    region: 'Norte',
    origen: 'Italia central/norte',
    tiempoCoccion: '8-10 min',
    salsasIdeales: ['Crema', 'Tomate', 'Pesto'],
    platosClasicos: ['Mac and cheese', "Cavatappi all'arrabbiata", 'Pasta fría con queso'],
    dificultadCasera: 'Fácil',
    descripcion:
      "Tubos en espiral apretada, como sacacorchos pequeños. Su nombre significa 'sacacorchos' en italiano. Muy popular en pastas frías y mac&cheese.",
    curiosidad:
      'En 2003, Kraft introdujo el cavatappi en su línea de Mac & Cheese y revolucionó el plato',
  },
  {
    nombre: 'Maccheroni',
    nombreOriginal: 'Maccheroni',
    forma: 'Corta',
    region: 'Sur',
    origen: 'Nápoles',
    tiempoCoccion: '9-11 min',
    salsasIdeales: ['Tomate', 'Crema', 'Carne'],
    platosClasicos: ['Mac and cheese', 'Maccheroni alla napoletana', 'Pastitsio griego'],
    dificultadCasera: 'Fácil',
    descripcion:
      "Pequeños tubos curvos, los precursores de toda la pasta corta moderna. Origen del 'macaroni' anglosajón. Diferentes tradiciones según la región.",
    curiosidad:
      "La canción 'Yankee Doodle' menciona macaroni como sinónimo de elegancia inglesa del siglo XVIII",
  },
  {
    nombre: 'Gemelli',
    nombreOriginal: 'Gemelli',
    forma: 'Corta',
    region: 'Centro',
    origen: 'Italia central',
    tiempoCoccion: '9-11 min',
    salsasIdeales: ['Tomate', 'Pesto', 'Carne'],
    platosClasicos: ['Gemelli al pesto', 'Gemelli al ragù', 'Pasta fría italiana'],
    dificultadCasera: 'Media',
    descripcion:
      "Dos hebras de pasta retorcidas como cuerdas trenzadas. El nombre significa 'gemelos'. Forma elegante que sostiene salsas espesas perfectamente.",
    curiosidad:
      'Aunque parecen dos hebras, en realidad es una sola pieza enrollada sobre sí misma',
  },
  {
    nombre: 'Trofie',
    nombreOriginal: 'Trofie',
    forma: 'Corta',
    region: 'Norte',
    origen: 'Liguria',
    tiempoCoccion: '5-7 min (fresca)',
    salsasIdeales: ['Pesto', 'Aceite-ajo', 'Crema'],
    platosClasicos: ['Trofie al pesto', 'Trofie con patate e fagiolini', 'Trofie alle vongole'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Pasta corta y retorcida ligur, hecha a mano con la palma. Tradicionalmente sin huevo, solo harina y agua. Compañera ideal del pesto genovés.',
    curiosidad:
      "El plato típico de Génova es 'trofie al pesto con patatas y judías verdes' — todo cocinado en la misma agua",
  },
  {
    nombre: 'Radiatore',
    nombreOriginal: 'Radiatori',
    forma: 'Corta',
    region: 'Internacional',
    origen: 'Italia (siglo XX)',
    tiempoCoccion: '8-10 min',
    salsasIdeales: ['Crema', 'Pesto', 'Tomate'],
    platosClasicos: ['Radiatori al pesto', 'Pasta fría primavera', 'Radiatori alla crema'],
    dificultadCasera: 'Fácil',
    descripcion:
      'Pequeñas pastas con forma de radiador, con muchas estrías que recogen salsa. Diseñada en los años 60 inspirándose en los radiadores de coches.',
    curiosidad:
      'Fue creada por un ingeniero industrial italiano que combinaba su pasión por la pasta y los coches',
  },
  {
    nombre: 'Cavatelli',
    nombreOriginal: 'Cavatelli',
    forma: 'Corta',
    region: 'Sur',
    origen: 'Molise/Puglia',
    tiempoCoccion: '5-7 min (fresca)',
    salsasIdeales: ['Carne', 'Tomate', 'Aceite-ajo'],
    platosClasicos: ['Cavatelli con cime di rapa', 'Cavatelli al ragù', 'Cavatelli con ricotta'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Pequeñas conchas alargadas hechas presionando la masa con dos dedos sobre una tabla estriada. Pasta tradicional del sur de Italia.',
    curiosidad:
      'Cada región del sur tiene su variante: en Molise son lisos, en Puglia son rugosos por la tabla estriada',
  },
  {
    nombre: 'Casarecce',
    nombreOriginal: 'Casarecce',
    forma: 'Corta',
    region: 'Sicilia/Cerdeña',
    origen: 'Sicilia',
    tiempoCoccion: '10-12 min',
    salsasIdeales: ['Tomate', 'Carne', 'Pesto'],
    platosClasicos: [
      'Casarecce alla siciliana',
      'Casarecce alla Norma',
      'Casarecce al pesto trapanese',
    ],
    dificultadCasera: 'Avanzada',
    descripcion:
      "Pasta corta en forma de S con un canal central, originaria de Sicilia. Su nombre significa 'casera'. La forma agarra perfectamente las salsas mediterráneas.",
    curiosidad:
      'Tradicionalmente se hacía a mano con un palito de junco (ferretto) sobre una tabla estriada',
  },
  {
    nombre: 'Strozzapreti',
    nombreOriginal: 'Strozzapreti',
    forma: 'Corta',
    region: 'Centro',
    origen: 'Emilia-Romaña/Toscana',
    tiempoCoccion: '8-10 min',
    salsasIdeales: ['Carne', 'Tomate', 'Pesto'],
    platosClasicos: [
      'Strozzapreti al ragù',
      'Strozzapreti alla Boscaiola',
      'Strozzapreti al pesto',
    ],
    dificultadCasera: 'Avanzada',
    descripcion:
      "Pasta retorcida hecha a mano enrollando un cordón de masa. Su nombre significa literalmente 'estrangula-curas'.",
    curiosidad:
      'La leyenda dice que las amas de casa enfadadas con el clero hacían esta pasta deseando que el cura se atragantara con ella',
  },
  {
    nombre: 'Gnocchi',
    nombreOriginal: 'Gnocchi',
    forma: 'Especial',
    region: 'Norte',
    origen: 'Norte de Italia',
    tiempoCoccion: '3-4 min',
    salsasIdeales: ['Mantequilla', 'Tomate', 'Pesto'],
    platosClasicos: ['Gnocchi al burro e salvia', 'Gnocchi al pesto', 'Gnocchi alla bolognese'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Bolitas de patata y harina, no es pasta tradicional pero se considera de la familia. Cocidas se hunden y suben a flote cuando están listas.',
    curiosidad:
      "En la tradición italiana se comen los jueves: 'giovedì gnocchi, venerdì pesce' (jueves ñoquis, viernes pescado)",
  },

  // PASTA RELLENA (5)
  {
    nombre: 'Ravioli',
    nombreOriginal: 'Ravioli',
    forma: 'Rellena',
    region: 'Norte',
    origen: 'Italia central/norte',
    tiempoCoccion: '4-6 min (fresca)',
    salsasIdeales: ['Mantequilla', 'Crema', 'Tomate'],
    platosClasicos: ['Ravioli ricotta e spinaci', 'Ravioli al burro e salvia', 'Ravioli di carne'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Almohadillas cuadradas de pasta al huevo rellenas. La forma y el relleno cambian según la región: en Liguria con borraja, en Emilia con calabaza.',
    curiosidad:
      'El primer recetario italiano (1300) ya mencionaba ravioli con queso y hierbas — uno de los formatos más antiguos',
  },
  {
    nombre: 'Tortellini',
    nombreOriginal: 'Tortellini',
    forma: 'Rellena',
    region: 'Norte',
    origen: 'Bolonia/Módena',
    tiempoCoccion: '3-5 min (fresca)',
    salsasIdeales: ['Caldo', 'Crema', 'Mantequilla'],
    platosClasicos: [
      'Tortellini in brodo',
      'Tortellini panna e prosciutto',
      'Tortellini alla bolognese',
    ],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Pequeñas pastas rellenas con forma de anillo (ombligo). Tradicionalmente rellenos de carne, queso parmesano y nuez moscada. Servidos en caldo de carne.',
    curiosidad:
      'La leyenda dice que su forma imita el ombligo de Venus, espiada por un mesonero a través de una cerradura',
  },
  {
    nombre: 'Tortelli / Mezzelune',
    nombreOriginal: 'Mezzelune',
    forma: 'Rellena',
    region: 'Norte',
    origen: 'Trentino/Lombardía',
    tiempoCoccion: '4-6 min (fresca)',
    salsasIdeales: ['Mantequilla', 'Crema', 'Tomate'],
    platosClasicos: ['Mezzelune alla zucca', 'Mezzelune ai porcini', 'Tortelli mantovani'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Pasta rellena en forma de media luna. Los tortelli mantovani de calabaza son una especialidad navideña con relleno dulce-salado.',
    curiosidad:
      'Los tortelli mantovani llevan amaretti machacados y mostarda di frutta — combinación dulce inusual',
  },
  {
    nombre: 'Cappelletti',
    nombreOriginal: 'Cappelletti',
    forma: 'Rellena',
    region: 'Norte',
    origen: 'Emilia-Romaña',
    tiempoCoccion: '4-6 min (fresca)',
    salsasIdeales: ['Caldo', 'Crema', 'Mantequilla'],
    platosClasicos: [
      'Cappelletti in brodo',
      'Cappelletti alla panna',
      'Cappelletti al ragù bianco',
    ],
    dificultadCasera: 'Avanzada',
    descripcion:
      "Pequeños 'sombreros' rellenos de carne y queso. Plato tradicional navideño en Emilia-Romaña. Más pequeños que los tortellini pero similares.",
    curiosidad:
      'En Reggio Emilia es plato obligatorio del 25 de diciembre — cada familia tiene su receta de relleno',
  },
  {
    nombre: 'Agnolotti',
    nombreOriginal: 'Agnolotti',
    forma: 'Rellena',
    region: 'Norte',
    origen: 'Piamonte',
    tiempoCoccion: '4-6 min (fresca)',
    salsasIdeales: ['Mantequilla', 'Carne', 'Crema'],
    platosClasicos: ['Agnolotti del plin', 'Agnolotti al sugo di arrosto', 'Agnolotti al burro'],
    dificultadCasera: 'Avanzada',
    descripcion:
      "Pasta rellena rectangular del Piamonte. Los 'agnolotti del plin' se cierran pellizcando con los dedos. Especialidad de las Langhe.",
    curiosidad:
      "El nombre 'plin' es onomatopeya del pellizco al cerrar los agnolotti uno por uno",
  },

  // LÁMINAS Y SOPAS (6)
  {
    nombre: 'Lasagna',
    nombreOriginal: 'Lasagna',
    forma: 'Lámina',
    region: 'Norte',
    origen: 'Bolonia/Italia',
    tiempoCoccion: '30-40 min (al horno)',
    salsasIdeales: ['Carne', 'Tomate', 'Crema'],
    platosClasicos: ['Lasagna alla bolognese', 'Lasagna verde', 'Lasagna ai funghi'],
    dificultadCasera: 'Avanzada',
    descripcion:
      "Láminas planas de pasta al huevo intercaladas con relleno y horneadas. La 'lasagna alla bolognese' lleva pasta verde (con espinacas), ragù y bechamel.",
    curiosidad:
      'La lasagna verde de Bolonia (con pasta de espinacas, ragù y bechamel) es la versión codificada por la DOP boloñesa; la variante con pasta amarilla y abundante queso muzzarella es la adaptación ítalo-americana, hoy plato propio con su propia tradición',
  },
  {
    nombre: 'Cannelloni',
    nombreOriginal: 'Cannelloni',
    forma: 'Lámina',
    region: 'Centro',
    origen: 'Italia central',
    tiempoCoccion: '25-30 min (al horno)',
    salsasIdeales: ['Carne', 'Crema', 'Tomate'],
    platosClasicos: ['Cannelloni alla rossini', 'Cannelloni di carne', 'Cannelloni ricotta e spinaci'],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Tubos grandes rellenos de carne, espinacas o queso, cubiertos de bechamel y horneados. Plato festivo en muchas regiones italianas.',
    curiosidad:
      "En Cataluña los 'canelons' son tradicionales de San Esteban (26 diciembre) usando los restos del 'escudella' navideño",
  },
  {
    nombre: 'Pastina / Stelline',
    nombreOriginal: 'Pastina',
    forma: 'Sopa',
    region: 'Internacional',
    origen: 'Italia',
    tiempoCoccion: '3-5 min',
    salsasIdeales: ['Caldo', 'Mantequilla'],
    platosClasicos: ['Pastina in brodo', 'Pastina al burro', 'Sopa de pastina'],
    dificultadCasera: 'Fácil',
    descripcion:
      'Pasta minúscula con muchas formas (estrellitas, alfabeto, anillos). Comida reconfortante de la infancia italiana, servida en caldo o con mantequilla.',
    curiosidad:
      "Las 'stelline' (estrellitas) son la pasta de la sopa de la abuela italiana — pasta del consuelo",
  },
  {
    nombre: 'Orzo / Risoni',
    nombreOriginal: 'Orzo',
    forma: 'Sopa',
    region: 'Internacional',
    origen: 'Italia/Mediterráneo',
    tiempoCoccion: '8-10 min',
    salsasIdeales: ['Caldo', 'Tomate', 'Pesto'],
    platosClasicos: ['Orzo griego', 'Sopa minestrone', 'Orzo al limone'],
    dificultadCasera: 'Fácil',
    descripcion:
      "Pasta con forma de grano de arroz. Su nombre significa 'cebada' en italiano (por el parecido con grano de cebada). Versátil entre pasta y arroz.",
    curiosidad:
      "En la cocina griega se llama 'kritharaki' y se usa en estofados como el 'youvetsi'",
  },
  {
    nombre: 'Ditalini',
    nombreOriginal: 'Ditalini',
    forma: 'Sopa',
    region: 'Sur',
    origen: 'Sur de Italia',
    tiempoCoccion: '8-10 min',
    salsasIdeales: ['Caldo', 'Tomate'],
    platosClasicos: ['Pasta e fagioli', 'Pasta e ceci', 'Minestrone'],
    dificultadCasera: 'Fácil',
    descripcion:
      "Pequeños tubos cortos como 'pequeños dedales'. Perfectos para sopas de legumbres como la pasta e fagioli o pasta e ceci napolitanas.",
    curiosidad: "Su nombre significa 'pequeños dedales' por el parecido con los dedales de costura",
  },
  {
    nombre: 'Anelli / Anellini',
    nombreOriginal: 'Anelli',
    forma: 'Sopa',
    region: 'Sicilia/Cerdeña',
    origen: 'Sicilia',
    tiempoCoccion: '6-8 min',
    salsasIdeales: ['Caldo', 'Tomate'],
    platosClasicos: ['Pasta al forno siciliana', 'Anelli con sugo', 'Sopas de tomate'],
    dificultadCasera: 'Fácil',
    descripcion:
      'Pasta en forma de pequeños anillos. Especialidad siciliana usada en pastas al horno y sopas. Su forma simple oculta una versatilidad sorprendente.',
    curiosidad:
      'Los anelli sicilianos al horno con tomate y berenjena son plato típico del agosto siciliano',
  },

  // ESPECIALES (4)
  {
    nombre: 'Spätzle',
    nombreOriginal: 'Spätzle',
    forma: 'Especial',
    region: 'Norte',
    origen: 'Tirol/Sur de Alemania',
    tiempoCoccion: '3-5 min',
    salsasIdeales: ['Mantequilla', 'Crema', 'Carne'],
    platosClasicos: ['Spätzle al burro e formaggio', 'Käsespätzle', 'Spätzle ai funghi'],
    dificultadCasera: 'Media',
    descripcion:
      'Pasta germánica/tirolesa hecha vertiendo masa líquida sobre agua hirviendo. Forma irregular como pequeños gusanos. Común en Trentino-Alto Adigio.',
    curiosidad:
      'En Italia se considera pasta germánica adoptada — en el sur de Alemania es plato nacional',
  },
  {
    nombre: 'Couscous',
    nombreOriginal: 'Couscous',
    forma: 'Especial',
    region: 'Sicilia/Cerdeña',
    origen: 'Norte de África/Sicilia',
    tiempoCoccion: '5-10 min',
    salsasIdeales: ['Caldo', 'Mar', 'Carne'],
    platosClasicos: ['Couscous alla trapanese', 'Couscous con pesce', 'Couscous bel ghraïef'],
    dificultadCasera: 'Media',
    descripcion:
      'Pequeñas bolitas de sémola al vapor, originario del Magreb amazigh (bereber), donde sigue siendo plato nacional en Marruecos, Argelia, Túnez y Libia; adoptado en Trápani por influencia árabe medieval. Festival anual en Trapani.',
    curiosidad:
      'El Cous Cous Fest de San Vito Lo Capo (Sicilia) reúne chefs de todo el Mediterráneo cada septiembre',
  },
  {
    nombre: 'Fregola',
    nombreOriginal: 'Fregola sarda',
    forma: 'Especial',
    region: 'Sicilia/Cerdeña',
    origen: 'Cerdeña',
    tiempoCoccion: '10-12 min',
    salsasIdeales: ['Mar', 'Caldo', 'Tomate'],
    platosClasicos: ['Fregola con arselle (almejas)', 'Fregola con fave', 'Fregola al pomodoro'],
    dificultadCasera: 'Media',
    descripcion:
      'Pequeñas bolitas de sémola tostadas, similares al couscous pero más grandes y tostadas. Especialidad sarda con sabor a tostado característico.',
    curiosidad:
      'Se hace a mano frotando agua y sémola en un cuenco de barro para formar las bolitas, después se tuestan',
  },
  {
    nombre: 'Pizzoccheri',
    nombreOriginal: 'Pizzoccheri',
    forma: 'Especial',
    region: 'Norte',
    origen: 'Valtellina (Lombardía)',
    tiempoCoccion: '10-12 min',
    salsasIdeales: ['Mantequilla', 'Crema'],
    platosClasicos: [
      'Pizzoccheri della Valtellina',
      'Pizzoccheri al burro fuso',
      'Pizzoccheri con verdure',
    ],
    dificultadCasera: 'Avanzada',
    descripcion:
      'Tagliatelle gris oscuro de harina de trigo sarraceno, especialidad alpina de la Valtellina. Se cocinan con patatas, col verza y queso Bitto fundido.',
    curiosidad:
      "El plato 'pizzoccheri della Valtellina' está tutelado por una academia que defiende la receta tradicional desde 1981",
  },
];

const TODAS_FORMAS: FormaPasta[] = [
  'Larga',
  'Corta',
  'Rellena',
  'Lámina',
  'Sopa',
  'Especial',
];
const TODAS_REGIONES: RegionItalia[] = [
  'Norte',
  'Centro',
  'Sur',
  'Sicilia/Cerdeña',
  'Internacional',
];
const TODAS_SALSAS: SalsaIdeal[] = [
  'Tomate',
  'Carne',
  'Crema',
  'Aceite-ajo',
  'Pesto',
  'Mar',
  'Caldo',
  'Mantequilla',
];
const TODAS_DIFICULTADES: Dificultad[] = ['Fácil', 'Media', 'Avanzada'];

export default function GuiaTiposPastaPage() {
  const [busqueda, setBusqueda] = useState('');
  const [formaFiltro, setFormaFiltro] = useState<FormaPasta | 'Todas'>('Todas');
  const [regionFiltro, setRegionFiltro] = useState<RegionItalia | 'Todas'>('Todas');
  const [salsaFiltro, setSalsaFiltro] = useState<SalsaIdeal | 'Todas'>('Todas');
  const [dificultadFiltro, setDificultadFiltro] = useState<Dificultad | 'Todas'>('Todas');

  const pastasFiltradas = useMemo(() => {
    return pastas.filter((pasta) => {
      // Búsqueda por texto
      if (busqueda.trim()) {
        const texto = busqueda.toLowerCase().trim();
        const coincide =
          pasta.nombre.toLowerCase().includes(texto) ||
          pasta.nombreOriginal.toLowerCase().includes(texto) ||
          pasta.salsasIdeales.some((s) => s.toLowerCase().includes(texto)) ||
          pasta.platosClasicos.some((p) => p.toLowerCase().includes(texto)) ||
          pasta.descripcion.toLowerCase().includes(texto) ||
          pasta.origen.toLowerCase().includes(texto);
        if (!coincide) return false;
      }

      if (formaFiltro !== 'Todas' && pasta.forma !== formaFiltro) return false;
      if (regionFiltro !== 'Todas' && pasta.region !== regionFiltro) return false;
      if (salsaFiltro !== 'Todas' && !pasta.salsasIdeales.includes(salsaFiltro)) return false;
      if (dificultadFiltro !== 'Todas' && pasta.dificultadCasera !== dificultadFiltro) return false;

      return true;
    });
  }, [busqueda, formaFiltro, regionFiltro, salsaFiltro, dificultadFiltro]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFormaFiltro('Todas');
    setRegionFiltro('Todas');
    setSalsaFiltro('Todas');
    setDificultadFiltro('Todas');
  };

  const tieneAlgunFiltro =
    busqueda.trim() !== '' ||
    formaFiltro !== 'Todas' ||
    regionFiltro !== 'Todas' ||
    salsaFiltro !== 'Todas' ||
    dificultadFiltro !== 'Todas';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Guía de Tipos de Pasta — tradición italiana</h1>
        <p className={styles.heroSubtitle}>
          40 formas de pasta con su región, tiempo de cocción y salsa ideal. Esta guía se centra
          en la tradición italiana, la más codificada en Europa; pasta como categoría existe
          también en China, Japón, Mediterráneo oriental, mundo árabe e India.
        </p>
      </header>

      <LegalNotice />

      <section className={styles.filtrosSeccion} aria-label="Filtros de búsqueda">
        <div className={styles.buscadorWrap}>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, salsa, plato o región..."
            className={styles.buscador}
            aria-label="Buscar pasta"
          />
        </div>

        <div className={styles.filtrosGrid}>
          <div className={styles.filtroGrupo}>
            <label className={styles.filtroLabel}>Forma</label>
            <div className={styles.filtroBotones}>
              <button
                type="button"
                aria-pressed={formaFiltro === 'Todas'}
                onClick={() => setFormaFiltro('Todas')}
                className={`${styles.filtroBtn} ${formaFiltro === 'Todas' ? styles.filtroBtnActivo : ''}`}
              >
                Todas
              </button>
              {TODAS_FORMAS.map((forma) => (
                <button
                  key={forma}
                  type="button"
                  aria-pressed={formaFiltro === forma}
                  onClick={() => setFormaFiltro(forma)}
                  className={`${styles.filtroBtn} ${formaFiltro === forma ? styles.filtroBtnActivo : ''}`}
                >
                  {forma}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtroGrupo}>
            <label className={styles.filtroLabel}>Región</label>
            <div className={styles.filtroBotones}>
              <button
                type="button"
                aria-pressed={regionFiltro === 'Todas'}
                onClick={() => setRegionFiltro('Todas')}
                className={`${styles.filtroBtn} ${regionFiltro === 'Todas' ? styles.filtroBtnActivo : ''}`}
              >
                Todas
              </button>
              {TODAS_REGIONES.map((region) => (
                <button
                  key={region}
                  type="button"
                  aria-pressed={regionFiltro === region}
                  onClick={() => setRegionFiltro(region)}
                  className={`${styles.filtroBtn} ${regionFiltro === region ? styles.filtroBtnActivo : ''}`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtroGrupo}>
            <label className={styles.filtroLabel}>Salsa ideal</label>
            <div className={styles.filtroBotones}>
              <button
                type="button"
                aria-pressed={salsaFiltro === 'Todas'}
                onClick={() => setSalsaFiltro('Todas')}
                className={`${styles.filtroBtn} ${salsaFiltro === 'Todas' ? styles.filtroBtnActivo : ''}`}
              >
                Todas
              </button>
              {TODAS_SALSAS.map((salsa) => (
                <button
                  key={salsa}
                  type="button"
                  aria-pressed={salsaFiltro === salsa}
                  onClick={() => setSalsaFiltro(salsa)}
                  className={`${styles.filtroBtn} ${salsaFiltro === salsa ? styles.filtroBtnActivo : ''}`}
                >
                  {salsa}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtroGrupo}>
            <label className={styles.filtroLabel}>Dificultad casera</label>
            <div className={styles.filtroBotones}>
              <button
                type="button"
                aria-pressed={dificultadFiltro === 'Todas'}
                onClick={() => setDificultadFiltro('Todas')}
                className={`${styles.filtroBtn} ${dificultadFiltro === 'Todas' ? styles.filtroBtnActivo : ''}`}
              >
                Todas
              </button>
              {TODAS_DIFICULTADES.map((dif) => (
                <button
                  key={dif}
                  type="button"
                  aria-pressed={dificultadFiltro === dif}
                  onClick={() => setDificultadFiltro(dif)}
                  className={`${styles.filtroBtn} ${dificultadFiltro === dif ? styles.filtroBtnActivo : ''}`}
                >
                  {dif}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.contadorWrap}>
          <p className={styles.contador}>
            Mostrando <strong>{pastasFiltradas.length}</strong> de <strong>{pastas.length}</strong>{' '}
            tipos de pasta
          </p>
          {tieneAlgunFiltro && (
            <button type="button" onClick={limpiarFiltros} className={styles.limpiarBtn}>
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      <section className={styles.gridSeccion} aria-label="Listado de pastas">
        {pastasFiltradas.length === 0 ? (
          <div className={styles.sinResultados}>
            <p>No hay pastas que coincidan con los filtros seleccionados.</p>
            <button type="button" onClick={limpiarFiltros} className={styles.limpiarBtn}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {pastasFiltradas.map((pasta) => (
              <article key={pasta.nombre} className={styles.card}>
                <header className={styles.cardHeader}>
                  <h2 className={styles.cardTitulo}>{pasta.nombre}</h2>
                  {pasta.nombreOriginal !== pasta.nombre && (
                    <p className={styles.cardOriginal}>
                      <em>{pasta.nombreOriginal}</em>
                    </p>
                  )}
                </header>

                <div className={styles.cardBadges}>
                  <span className={`${styles.badge} ${styles.badgeForma}`}>{pasta.forma}</span>
                  <span className={`${styles.badge} ${styles.badgeRegion}`}>{pasta.region}</span>
                  <span
                    className={`${styles.badge} ${
                      pasta.dificultadCasera === 'Fácil'
                        ? styles.badgeFacil
                        : pasta.dificultadCasera === 'Media'
                          ? styles.badgeMedia
                          : styles.badgeAvanzada
                    }`}
                  >
                    {pasta.dificultadCasera}
                  </span>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Origen:</span>
                    <span>{pasta.origen}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Cocción:</span>
                    <span>{pasta.tiempoCoccion}</span>
                  </div>
                </div>

                <div className={styles.cardSeccion}>
                  <h3 className={styles.cardSubtitulo}>Salsas ideales</h3>
                  <div className={styles.pillsWrap}>
                    {pasta.salsasIdeales.map((salsa) => (
                      <span key={salsa} className={styles.pill}>
                        {salsa}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardSeccion}>
                  <h3 className={styles.cardSubtitulo}>Platos clásicos</h3>
                  <ul className={styles.platosLista}>
                    {pasta.platosClasicos.map((plato) => (
                      <li key={plato}>{plato}</li>
                    ))}
                  </ul>
                </div>

                <p className={styles.cardDescripcion}>{pasta.descripcion}</p>

                <p className={styles.cardCuriosidad}>
                  <span className={styles.curiosidadLabel}>Curiosidad:</span>{' '}
                  <em>{pasta.curiosidad}</em>
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <EducationalSection
        title="Guía de Tipos de Pasta"
        subtitle="Aprende a elegir la pasta correcta para cada salsa: 40 formas italianas, su origen y maridaje ideal"
      >
        <div className={styles.educativo}>
          <section className={styles.eduSeccion}>
            <h3>Tabla comparativa: forma, salsa ideal y tiempo de cocción</h3>
            <div className={styles.tablaWrap}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Forma</th>
                    <th>Características</th>
                    <th>Salsas ideales</th>
                    <th>Tiempo cocción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Pasta larga fina</strong>
                    </td>
                    <td>Spaghetti, capellini, vermicelli</td>
                    <td>Aceite-ajo, mar, tomate ligero</td>
                    <td>2-10 min</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Pasta larga plana</strong>
                    </td>
                    <td>Tagliatelle, fettuccine, pappardelle</td>
                    <td>Carne, mantequilla, crema</td>
                    <td>4-7 min (fresca)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Pasta corta tubular</strong>
                    </td>
                    <td>Penne, rigatoni, maccheroni</td>
                    <td>Tomate, carne, crema con tropezones</td>
                    <td>9-14 min</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Pasta corta forma compleja</strong>
                    </td>
                    <td>Fusilli, farfalle, conchiglie</td>
                    <td>Pesto, crema, ensaladas frías</td>
                    <td>9-12 min</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Pasta rellena</strong>
                    </td>
                    <td>Ravioli, tortellini, agnolotti</td>
                    <td>Mantequilla, caldo, crema ligera</td>
                    <td>3-6 min (fresca)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Pasta para sopa</strong>
                    </td>
                    <td>Pastina, orzo, ditalini, anelli</td>
                    <td>Caldo, sopas de legumbres</td>
                    <td>3-10 min</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.eduSeccion}>
            <h3>Casos de uso: ¿qué pasta elegir según tu situación?</h3>
            <div className={styles.casosGrid}>
              <div className={styles.casoCard}>
                <h4>Cocinero casero principiante</h4>
                <p>
                  Empieza con <strong>penne, fusilli o spaghetti</strong>. Son tolerantes a errores
                  de cocción, se encuentran en cualquier supermercado y combinan con casi cualquier
                  salsa. Una vez domines la cocción al dente, prueba bucatini o conchiglie.
                </p>
              </div>
              <div className={styles.casoCard}>
                <h4>Cocina italiana clásica</h4>
                <p>
                  Aprende las parejas tradicionales más documentadas: <strong>tagliatelle al ragù</strong>,{' '}
                  <strong>bucatini all'amatriciana</strong>, <strong>trofie al pesto</strong>,{' '}
                  <strong>orecchiette con cime di rapa</strong>. Cada formato evolucionó junto a las
                  salsas de su región.
                </p>
              </div>
              <div className={styles.casoCard}>
                <h4>Pasta fría para verano o picnic</h4>
                <p>
                  Elige formatos cortos con cavidades: <strong>fusilli, farfalle, conchiglie o
                  cavatappi</strong>. Cocina al dente, refresca con agua fría, escurre bien y aliña con
                  aceite. Las espirales y conchas atrapan la vinagreta perfectamente.
                </p>
              </div>
              <div className={styles.casoCard}>
                <h4>Cena familiar grande o festiva</h4>
                <p>
                  Apuesta por <strong>lasagna, cannelloni o pasta rellena</strong>. Se preparan con
                  antelación, se hornean justo antes y rinden mucho. La lasagna alla bolognese o
                  los cannelloni de carne son platos infalibles para 6-8 comensales.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.eduSeccion}>
            <h3>Preguntas frecuentes</h3>
            <details className={styles.faqItem}>
              <summary>¿Cuánta pasta por persona debo cocinar?</summary>
              <p>
                Como plato principal, cuenta <strong>80-100 g de pasta seca por persona</strong> (o
                120-150 g de pasta fresca). Como primer plato, 60-80 g basta. Si la salsa lleva
                ingredientes contundentes (carne, mariscos), reduce la cantidad de pasta.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Por qué los italianos no parten los spaghetti?</summary>
              <p>
                Romper la pasta antes de cocinar dificulta enrollarla con el tenedor y rompe la
                tradición. La pasta larga se introduce entera en el agua y se va sumergiendo
                conforme se ablanda. Es un gesto cultural fuerte: hacerlo delante de un italiano se
                considera ofensivo.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué significa cocinar la pasta al dente?</summary>
              <p>
                Al dente significa <strong>"al diente"</strong>: la pasta debe ofrecer ligera
                resistencia al morderla. Resta 1-2 minutos al tiempo del paquete y prueba. Una pasta
                pasada absorbe demasiada salsa y pierde textura. Al dente además tiene índice
                glucémico más bajo.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Pasta seca o pasta fresca: cuál es mejor?</summary>
              <p>
                <strong>No es cuestión de mejor o peor, sino de uso.</strong> La pasta seca de
                sémola dura más, tiene mejor textura para salsas potentes y absorbe mejor el sabor.
                La pasta fresca al huevo es más tierna, ideal para mantequilla, crema y rellenos.
                Cada formato tiene su tradición.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Hay que añadir aceite al agua de cocción?</summary>
              <p>
                <strong>No</strong>. El aceite forma una película sobre la pasta que impide que la
                salsa se adhiera después. Para evitar que se pegue, basta con usar mucha agua (1
                litro por cada 100 g de pasta) y removerla los primeros segundos.
              </p>
            </details>
          </section>

          <section className={styles.eduSeccion}>
            <h3>Cómo cocinar pasta perfecta: 5 pasos</h3>
            <ol className={styles.pasosLista}>
              <li>
                <strong>Mucha agua, poca sal al inicio.</strong> Usa 1 litro de agua por cada 100 g
                de pasta y una olla grande. Lleva a ebullición fuerte antes de añadir nada más.
              </li>
              <li>
                <strong>Sala el agua como el mar.</strong> Añade 10 g de sal por litro cuando hierva.
                El agua debe saber salada — es la única oportunidad de salar la pasta por dentro.
              </li>
              <li>
                <strong>Echa la pasta y remueve.</strong> Introduce la pasta de golpe en agua
                hirviendo y remueve los primeros 30 segundos para evitar que se pegue. No tapes la
                olla: rebosaría.
              </li>
              <li>
                <strong>Prueba 2 minutos antes del tiempo indicado.</strong> Saca un trozo y muérdelo.
                El centro debe ofrecer ligera resistencia (al dente). Resta 1 minuto si vas a
                terminar la pasta en la sartén con la salsa.
              </li>
              <li>
                <strong>Reserva agua de cocción y mantéca.</strong> Antes de escurrir, guarda 1 taza
                del agua. Mezcla la pasta escurrida con la salsa en una sartén caliente y añade
                cucharadas del agua reservada hasta que la salsa abrace la pasta (esto se llama{' '}
                <em>mantecare</em>).
              </li>
            </ol>
          </section>

          <section className={styles.eduSeccion}>
            <h3>Tips de chef: 5 trucos profesionales</h3>
            <ul className={styles.tipsLista}>
              <li>
                <strong>Termina la cocción en la sartén.</strong> Saca la pasta 1-2 min antes de
                tiempo, pásala a la sartén con la salsa caliente y termina ahí 1 minuto. La pasta
                absorbe el sabor de la salsa.
              </li>
              <li>
                <strong>El agua de cocción es oro líquido.</strong> Tiene almidón liberado por la
                pasta. Añadir cucharadas a la salsa la espesa, la une y la hace cremosa sin
                necesidad de nata.
              </li>
              <li>
                <strong>El queso siempre fuera del fuego.</strong> Apaga el fuego antes de añadir
                parmesano o pecorino rallado. Si lo añades a la sartén caliente, se coagula y forma
                grumos en lugar de fundirse en crema.
              </li>
              <li>
                <strong>Pasta corta + salsa con tropezones; pasta larga + salsa lisa.</strong> Esta
                regla italiana evita que los trozos se queden en el plato sin pasta. Por eso el ragù
                va con tagliatelle (lisa) y la salsa de salchicha con rigatoni (tubo).
              </li>
              <li>
                <strong>Compra pasta de sémola de trigo duro 100%.</strong> Lee el ingrediente: debe
                ser solo "sémola di grano duro". Las marcas trafiladas en bronce ("trafilata al
                bronzo") tienen superficie rugosa que agarra mejor la salsa.
              </li>
            </ul>
          </section>

          <section className={styles.warningBox}>
            <h3>Errores comunes que arruinan la pasta</h3>
            <ul className={styles.erroresLista}>
              <li>
                <strong>Cocinar con poca agua.</strong> La pasta necesita espacio para moverse o se
                pegará. Mínimo 1 litro por cada 100 g. Una olla pequeña es el primer error de cualquier
                principiante.
              </li>
              <li>
                <strong>Lavar la pasta después de escurrir.</strong> Solo se hace en pasta fría
                (ensalada). En caliente, lavarla elimina el almidón superficial que ayuda a que la
                salsa se adhiera. La pasta queda resbaladiza.
              </li>
              <li>
                <strong>Servir la pasta y poner la salsa encima como si fuera un topping.</strong> La
                técnica italiana clásica es mezclar pasta y salsa en la sartén durante 30-60 segundos
                antes de emplatar: el almidón residual de la pasta y la salsa se funden creando una
                capa cremosa imposible de conseguir si se vierten por separado.
              </li>
              <li>
                <strong>Usar pasta muy pasada o muy dura.</strong> Pasada absorbe toda la salsa y
                queda blanda como papilla. Demasiado dura es desagradable. El punto al dente
                requiere probar 1-2 minutos antes del tiempo indicado.
              </li>
            </ul>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-tipos-pasta')} />

      <ShareCard appName="guia-tipos-pasta" />

      <Footer appName="guia-tipos-pasta" />
    </div>
  );
}
