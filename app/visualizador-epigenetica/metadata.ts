import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Epigenética: Cómo el Entorno Modifica la Expresión Génica — meskeIA',
  description:
    'Visualizador de epigenética: metilación del ADN, modificaciones de histonas, imprinting genómico y factores que modifican el epigenoma. Sin alterar el ADN.',
  keywords: [
    'epigenética',
    'metilación del ADN',
    'modificaciones de histonas',
    'acetilación histonas',
    'imprinting genómico',
    'expresión génica',
    'cromatina abierta compacta',
    'reloj de Horvath',
    'epigenética y cáncer',
    'herencia transgeneracional',
    'BRCA1 metilación',
    'nucleosoma',
  ],
  openGraph: {
    title: 'Epigenética: Cómo el Entorno Modifica la Expresión Génica — meskeIA',
    description:
      'Metilación del ADN, histonas, imprinting genómico y factores epigenéticos. El entorno modifica la lectura del ADN sin alterar la secuencia.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Epigenética: Cómo el Entorno Modifica la Expresión Génica — meskeIA',
    description: 'Metilación del ADN, histonas, imprinting genómico y factores epigenéticos. El entorno modifica la lectura del ADN sin alterar la secuencia.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Epigenética: Metilación, Histonas e Imprinting",
  description: "Visualizador de epigenética: metilación del ADN, modificaciones de histonas, imprinting genómico y factores que modifican el epigenoma. Sin alterar el ADN.",
  url: "https://meskeia.com/visualizador-epigenetica/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la epigenética y en qué se diferencia de la genética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La genética estudia la secuencia de bases del ADN —la información heredada de los progenitores—, mientras que la epigenética estudia los cambios en la expresión génica que no alteran esa secuencia. Las marcas epigenéticas actúan como interruptores que activan o silencian genes según el contexto celular, el entorno y la historia vital del organismo. Un ejemplo clave: dos gemelos idénticos tienen el mismo ADN pero epigenomas que divergen con la edad y el estilo de vida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la metilación del ADN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La metilación del ADN es la adición de un grupo metilo (–CH₃) a la citosina de dinucleótidos CpG por enzimas llamadas ADN metiltransferasas (DNMT). Cuando los promotores de un gen están hipermetilados, ese gen tiende a silenciarse; la hipometilación suele asociarse con activación. Es la marca epigenética más estudiada y se hereda durante la división celular. Alteraciones en la metilación están implicadas en cánceres, envejecimiento y enfermedades metabólicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo modifican las histonas la expresión génica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ADN se enrolla alrededor de proteínas llamadas histonas formando nucleosomas. Las modificaciones químicas en las colas de las histonas (acetilación, metilación, fosforilación, ubiquitinación) cambian la compactación de la cromatina. La acetilación de histonas por enzimas HAT relaja la cromatina y favorece la transcripción; la desacetilación por HDAC la compacta y la silencia. Estas marcas son dinámicas y reversibles, lo que las convierte en dianas terapéuticas potenciales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores del entorno modifican el epigenoma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El epigenoma es sensible a múltiples factores externos: la dieta (el folato, la colina y las vitaminas del grupo B son donantes de grupos metilo), el ejercicio físico, el estrés crónico, la exposición a tóxicos como el tabaco o los contaminantes, y las infecciones. Estudios en trabajadores expuestos a benceno o en supervivientes de hambrunas históricas (como la holandesa de 1944) muestran cambios epigenéticos medibles y, en algunos casos, transmisibles a la siguiente generación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el reloj epigenético de Horvath?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reloj de Horvath (2013) es un algoritmo que estima la edad biológica de un tejido midiendo el nivel de metilación en 353 sitios CpG específicos del genoma. La diferencia entre la edad cronológica y la edad epigenética estimada —llamada aceleración epigenética— se asocia con mayor riesgo de enfermedades crónicas y mortalidad. Es una de las herramientas más utilizadas en investigación del envejecimiento y longevidad.',
      },
    },
  ],
};
