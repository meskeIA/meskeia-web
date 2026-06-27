import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de fermentados: sal para chucrut y kimchi | meskeIA',
  description:
    'Calcula la sal exacta para fermentar verduras: en seco (chucrut, kimchi) sobre el peso de la verdura, o en salmuera (pepinillos) sobre el agua. La sal correcta es la clave. Gratis y en español.',
  keywords:
    'fermentar verduras sal, calculadora chucrut, porcentaje sal fermentacion, kimchi sal, salmuera fermentado pepinillos, lacto fermentacion casera, cuanta sal chucrut',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calculadora de fermentados vegetales', description: 'La sal exacta para fermentar verduras en seco o en salmuera.', url: 'https://meskeia.com/fermentados-vegetales', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Calculadora de fermentados', description: 'La sal correcta para chucrut, kimchi y fermentados en salmuera.' },
  other: { 'application-name': 'Fermentados vegetales meskeIA' },
  alternates: { canonical: 'https://meskeia.com/fermentados-vegetales/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de fermentados vegetales',
  description:
    'Calcula la cantidad de sal para la lacto-fermentación de verduras según el método: en seco (sobre el peso de la verdura rallada, como el chucrut o el kimchi) o en salmuera (sobre el peso del agua, como los pepinillos), ya que la concentración de sal es clave para una fermentación segura.',
  url: 'https://meskeia.com/fermentados-vegetales/',
  features: [
    'Sal según el método de fermentación',
    'En seco (chucrut, kimchi) y en salmuera',
    'Porcentaje sobre la verdura o sobre el agua',
    'La concentración correcta para fermentar seguro',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánta sal lleva el chucrut?', acceptedAnswer: { '@type': 'Answer', text: 'El chucrut se hace en seco con un 2% de sal sobre el peso de la col rallada: 20 gramos de sal por kilo de col. La sal se masajea con la verdura hasta que suelta su propio jugo, que debe cubrirla por completo durante la fermentación. Ese 2% es el punto donde prosperan las bacterias buenas y se frenan las dañinas.' } },
    { '@type': 'Question', name: '¿Qué porcentaje de sal lleva una salmuera para fermentar?', acceptedAnswer: { '@type': 'Answer', text: 'Para fermentar verduras enteras o en trozos sumergidas en agua (pepinillos, zanahoria, judía verde) se usa una salmuera de alrededor del 3% de sal sobre el peso del agua: 30 gramos de sal por litro. La verdura debe quedar siempre por debajo del líquido, sujeta con un peso.' } },
    { '@type': 'Question', name: '¿Por qué es tan importante la cantidad de sal?', acceptedAnswer: { '@type': 'Answer', text: 'Porque la sal selecciona qué microorganismos crecen: la concentración adecuada permite que prosperen las bacterias lácticas (las que fermentan y conservan) y frena las que podrían estropear el fermento o ser peligrosas. Poca sal es arriesgado y demasiada frena la fermentación, por eso conviene pesarla, no echarla a ojo.' } },
    { '@type': 'Question', name: '¿Cuánto tarda en fermentar una verdura?', acceptedAnswer: { '@type': 'Answer', text: 'Depende de la temperatura y del gusto: a temperatura ambiente, entre 1 y 4 semanas. Cuanto más cálido, más rápido. Se va probando hasta que tiene el punto ácido deseado y entonces se pasa a la nevera para frenar la fermentación. La verdura debe oler ácido y agradable, no a podrido.' } },
    { '@type': 'Question', name: '¿Es seguro fermentar verduras en casa?', acceptedAnswer: { '@type': 'Answer', text: 'La lacto-fermentación es una técnica de conservación tradicional y segura si se respeta la sal, se mantiene la verdura bajo el líquido y se usan utensilios limpios. Las señales de alarma son el moho, un olor desagradable o colores extraños: ante cualquier duda, es mejor desechar el fermento.' } },
  ],
};
