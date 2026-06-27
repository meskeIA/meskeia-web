import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de azúcares y endulzantes: tipos y poder dulce | meskeIA',
  description:
    'Azúcar blanco, moreno, glas, panela, miel, sirope de arce y de agave, melaza, eritritol, estevia y más: tipos de endulzante, su poder dulce y sus usos en repostería. Gratis y en español.',
  keywords:
    'tipos de azucar, endulzantes naturales, poder edulcorante, azucar moreno vs blanco, eritritol estevia, panela piloncillo, sirope de agave, miel reposteria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Guía de azúcares y endulzantes', description: 'Tipos de endulzante, su poder dulce y sus usos.', url: 'https://meskeia.com/guia-azucares', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Guía de azúcares y endulzantes', description: 'Tipos de endulzante, poder dulce y usos.' },
  other: { 'application-name': 'Guía de azúcares meskeIA' },
  alternates: { canonical: 'https://meskeia.com/guia-azucares/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de azúcares y endulzantes',
  description:
    'Guía de los tipos de azúcar y endulzante —azúcares de caña o remolacha, endulzantes naturales líquidos como la miel o los siropes, y edulcorantes como el eritritol o la estevia— con su poder endulzante relativo y sus usos en cocina y repostería.',
  url: 'https://meskeia.com/guia-azucares/',
  category: 'EducationalApplication',
  features: [
    'Azúcares, endulzantes naturales y edulcorantes',
    'Poder endulzante relativo al azúcar',
    'Usos de cada uno en repostería',
    'Filtro por tipo de endulzante',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué diferencia hay entre el azúcar blanco y el moreno?', acceptedAnswer: { '@type': 'Answer', text: 'El azúcar moreno conserva (o lleva añadida) melaza, lo que le da color, un sabor más profundo y algo más de humedad; el blanco está refinado y es de sabor neutro. En repostería, el moreno aporta jugosidad y notas a caramelo, ideal para galletas y bizcochos, mientras que el blanco es la opción neutra de uso general.' } },
    { '@type': 'Question', name: '¿Puedo sustituir el azúcar por miel o sirope?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, pero al ser líquidos endulzan algo más y aportan agua, así que hay que reducir el resto de líquidos de la receta y bajar un poco la temperatura del horno, porque se doran antes. La miel y el agave son más dulces que el azúcar, por lo que se usa algo menos de cantidad.' } },
    { '@type': 'Question', name: '¿Qué es el poder endulzante?', acceptedAnswer: { '@type': 'Answer', text: 'Es lo dulce que resulta un endulzante comparado con el azúcar blanco, que se toma como referencia (1×). La estevia endulza cientos de veces más, por lo que se usa en cantidades mínimas; el eritritol endulza algo menos que el azúcar; y la miel, un poco más. Conocerlo evita pasarse o quedarse corto al sustituir.' } },
    { '@type': 'Question', name: '¿Los edulcorantes sirven para hornear?', acceptedAnswer: { '@type': 'Answer', text: 'Algunos sí y otros no del todo. El eritritol funciona en muchas recetas pero no carameliza ni dora igual que el azúcar, y la estevia no aporta volumen ni textura. El azúcar no solo endulza: da humedad, estructura y dorado, así que al sustituirlo por edulcorantes el resultado suele cambiar y a veces hay que combinar varios.' } },
    { '@type': 'Question', name: '¿Qué es la panela o el piloncillo?', acceptedAnswer: { '@type': 'Answer', text: 'Es jugo de caña de azúcar sin refinar, evaporado y solidificado, muy usado en Latinoamérica. Conserva todos sus minerales y un sabor intenso a melaza, y se usa para endulzar infusiones, dulces y bebidas. Se vende en bloques o rallada y su dulzor es algo menor que el del azúcar blanco.' } },
  ],
};
