import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Vinagres del Mundo - 25 vinagres, origen y maridaje | meskeIA',
  description:
    'Guía de referencia de 25 vinagres: balsámico, jerez, manzana, arroz, kombucha y más. Origen, acidez, intensidad y uso ideal con filtros por origen, intensidad y uso culinario.',
  keywords:
    'vinagres, balsamico modena, vinagre jerez, vinagre manzana, vinagre arroz, vinagreta, tipos vinagre, vinagre kombucha, vinagre champagne, vinagre malta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Vinagres del Mundo | meskeIA',
    description:
      '25 vinagres del mundo con origen, acidez, intensidad, envejecimiento, notas de sabor, usos ideales y maridaje.',
    url: 'https://meskeia.com/guia-vinagres-mundo/',
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
    title: 'Guía de Vinagres del Mundo | meskeIA',
    description:
      '25 vinagres del mundo con origen, acidez, intensidad y uso ideal. Filtros por origen, región e intensidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Vinagres del Mundo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Vinagres del Mundo',
  description:
    'Directorio de 25 vinagres del mundo con materia prima de origen, región, país, acidez (porcentaje), intensidad de sabor, envejecimiento, notas de sabor, usos ideales en cocina y maridaje. Incluye balsámicos italianos, jerez español, vinagre de arroz japonés y chino, manzana americana, kombucha, palma filipina y especialidades europeas. Filtros por origen, región, acidez, intensidad y uso culinario.',
  url: 'https://meskeia.com/guia-vinagres-mundo/',
  features: [
    '25 vinagres con perfil completo (origen, acidez, intensidad, envejecimiento)',
    'Filtros por materia prima, región, acidez, intensidad y uso',
    'Búsqueda por nombre, país, notas de sabor y maridaje',
    'Notas de sabor y maridajes recomendados en cada ficha',
    'Curiosidad y dato cultural por cada vinagre',
    'Patrón meskeIA v2.0: tabla comparativa, casos de uso, FAQ y errores comunes',
    'Funciona 100% en el navegador, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el vinagre balsámico de Módena y el balsámico tradicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El vinagre balsámico tradicional de Módena (DOP) se elabora exclusivamente con mosto cocido de uvas Lambrusco o Trebbiano y envejece al menos 12 años en barricas de distintas maderas. El balsámico de Módena IGP puede mezclar vinagre de vino con mosto concentrado y tiene un proceso mucho más corto. La diferencia se nota claramente en precio, densidad y complejidad de sabor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué vinagre es mejor para hacer vinagretas y aliños de ensalada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para vinagretas ligeras, el vinagre de vino blanco o el vinagre de champán aportan una acidez elegante sin dominar otros ingredientes. El vinagre de jerez ofrece más cuerpo y notas tostadas, ideal para ensaladas con ingredientes robustos. El de manzana tiene una acidez suave y frutada que combina bien con ensaladas de frutas o espinacas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la acidez habitual de los vinagres y cómo afecta al cocinado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de vinagres de uso culinario tienen entre un 5 % y un 8 % de acidez acética. Los vinagres de arroz japoneses rondan el 4-5 %, lo que los hace más suaves al paladar. A mayor acidez, mayor potencia al cocinar: una acidez alta resalta en reducciones y escabeches, mientras que acideces bajas son preferibles en salsas delicadas o sushi.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa el vinagre de arroz en la cocina asiática?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El vinagre de arroz es imprescindible para condimentar el arroz del sushi, equilibrar salsas como la ponzu y preparar encurtidos japoneses (tsukemono) y coreanos. En China se usa tanto en agridulces como en marinados. Su baja acidez (4-5 %) y sabor suave y ligeramente dulce lo hacen versátil sin resultar agresivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El vinagre de kombucha tiene beneficios para la salud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El vinagre de kombucha se obtiene por fermentación prolongada de té azucarado con una colonia de bacterias y levaduras (SCOBY). Contiene ácido acético, ácidos orgánicos y trazas de vitaminas del grupo B. Aunque se le atribuyen propiedades probióticas, la evidencia científica sólida sobre beneficios concretos en humanos es aún limitada. Como cualquier vinagre, su consumo moderado forma parte de una dieta equilibrada.',
      },
    },
  ],
};
