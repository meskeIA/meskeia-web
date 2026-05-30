import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Biomoléculas - Los 4 Ingredientes de la Vida | meskeIA',
  description: 'Explora las 4 biomoléculas esenciales: carbohidratos, lípidos, proteínas y ácidos nucleicos. Estructuras, funciones y datos fascinantes en un explicador visual interactivo.',
  keywords: 'biomoléculas, carbohidratos, lípidos, proteínas, ácidos nucleicos, ADN, ARN, glucosa, aminoácidos, nucleótidos, bioquímica visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Biomoléculas - Los 4 Ingredientes de la Vida',
    description: 'Carbohidratos, lípidos, proteínas y ácidos nucleicos explicados de forma visual e interactiva.',
    url: 'https://meskeia.com/visualizador-biomoleculas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Biomoléculas - Explicador Visual Interactivo',
    description: 'Tu cuerpo es una fábrica química con 4 ingredientes principales. Descúbrelos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Biomoléculas Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Biomoléculas - Los 4 Ingredientes de la Vida',
  description: 'Explicador visual interactivo sobre las 4 biomoléculas esenciales: carbohidratos, lípidos, proteínas y ácidos nucleicos. Estructuras simplificadas, composición corporal y datos fascinantes de bioquímica.',
  url: 'https://meskeia.com/visualizador-biomoleculas/',
  category: 'EducationalApplication',
  features: [
    'Las 4 familias de biomoléculas con cards interactivas',
    'Estructuras visuales simplificadas con animación de ensamblaje',
    'Composición del cuerpo humano en biomoléculas',
    'Datos fascinantes sobre ADN, proteínas y más',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las biomoléculas y cuáles son las 4 principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las biomoléculas son las moléculas orgánicas que forman y sostienen los seres vivos. Las cuatro familias principales son: carbohidratos (fuente de energía rápida y estructura celular), lípidos (reserva energética, membranas, hormonas), proteínas (estructura, transporte, catálisis y defensa) y ácidos nucleicos (ADN y ARN, almacenamiento y expresión de la información genética). Todas contienen carbono, hidrógeno y oxígeno; las proteínas y los ácidos nucleicos también nitrógeno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre ADN y ARN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ADN (ácido desoxirribonucleico) es la molécula que almacena la información genética de forma permanente en el núcleo celular; tiene doble hélice y usa la base timina. El ARN (ácido ribonucleico) es monocatenario, se sintetiza a partir del ADN como copia temporal y se encarga de llevar las instrucciones al ribosoma para fabricar proteínas. Hay varios tipos de ARN: mensajero (ARNm), de transferencia (ARNt) y ribosómico (ARNr), cada uno con una función específica en la síntesis proteica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los lípidos no se disuelven en agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los lípidos son moléculas predominantemente apolares: sus largas cadenas de carbono e hidrógeno no tienen cargas eléctricas que atraigan las moléculas de agua (que sí son polares). Este principio —"lo semejante disuelve a lo semejante"— explica su insolubilidad en agua. Esa misma propiedad es la que hace a los lípidos ideales para formar membranas celulares: la bicapa lipídica crea una barrera impermeable que separa el interior de la célula del medio acuoso exterior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas proteínas diferentes puede fabricar el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se estima que el cuerpo humano fabrica entre 80.000 y 400.000 proteínas distintas. Todas se construyen combinando solo 20 aminoácidos en cadenas de longitud variable (desde decenas hasta miles de unidades). La secuencia exacta de aminoácidos, determinada por el ADN, define la forma tridimensional de la proteína y, por tanto, su función. Una proteína mal plegada puede ser inactiva o incluso tóxica, como ocurre en enfermedades como el Alzheimer o el Parkinson.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la función de los carbohidratos en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los carbohidratos cumplen principalmente dos funciones: energética y estructural. La glucosa es el combustible preferido de las células, especialmente las neuronas, que consumen el 20% de la energía total del cuerpo. El glucógeno actúa como reserva de glucosa en hígado y músculos. En los vegetales, la celulosa (un carbohidrato complejo) forma la pared celular rígida. La quitina, otro carbohidrato estructural, forma el exoesqueleto de insectos y artrópodos.',
      },
    },
  ],
};
