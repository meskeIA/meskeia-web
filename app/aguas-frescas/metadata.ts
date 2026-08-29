import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Aguas frescas, limonada y horchata: proporciones | meskeIA',
  description:
    'Calcula los ingredientes para tus aguas frescas: limonada, naranjada, agua de jamaica, horchata de arroz o agua fresca de fruta, según los litros que quieras preparar. Gratis y en español.',
  keywords:
    'aguas frescas proporciones, receta limonada cantidades, agua de jamaica receta, horchata de arroz, agua fresca de fruta, naranjada casera, bebidas refrescantes sin alcohol',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Aguas frescas, limonada y horchata', description: 'Las proporciones para tus aguas frescas según los litros que prepares.', url: 'https://meskeia.com/aguas-frescas', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Aguas frescas y limonada', description: 'Proporciones de aguas frescas, limonada y horchata por litros.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Aguas frescas meskeIA' },
  alternates: { canonical: 'https://meskeia.com/aguas-frescas/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Aguas frescas, limonadas y horchata',
  description:
    'Calcula los ingredientes para preparar aguas frescas y bebidas refrescantes sin alcohol —limonada, naranjada, agua de jamaica (hibisco), horchata de arroz y agua fresca de fruta— escalando la proporción base a los litros que necesites.',
  url: 'https://meskeia.com/aguas-frescas/',
  features: [
    'Ingredientes según los litros que prepares',
    'Limonada, naranjada, jamaica, horchata y fruta',
    'Proporciones base ajustables al gusto',
    'Bebidas refrescantes sin alcohol',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué son las aguas frescas?', acceptedAnswer: { '@type': 'Answer', text: 'Son bebidas refrescantes sin alcohol muy populares en México y otros países, hechas con agua, fruta, flores o semillas y un poco de azúcar. Las más conocidas son el agua de jamaica (flor de hibisco), la horchata de arroz, el agua de fruta (sandía, melón, fresa) y, en general, cualquier limonada o naranjada casera.' } },
    { '@type': 'Question', name: '¿Cuánto limón lleva la limonada?', acceptedAnswer: { '@type': 'Answer', text: 'Una limonada equilibrada lleva alrededor de 120 ml de zumo de limón (unos 4-5 limones) y unos 90 g de azúcar por litro de bebida, ajustando al gusto según lo ácidos que estén los limones. La herramienta escala estas cantidades a los litros que quieras hacer.' } },
    { '@type': 'Question', name: '¿Cómo se hace el agua de jamaica?', acceptedAnswer: { '@type': 'Answer', text: 'Se hierve la flor de jamaica seca (unos 30 g por litro) en agua unos minutos, se deja infusionar, se cuela y se endulza en frío. Sale un concentrado de color rubí y sabor ácido que se sirve bien frío, a veces rebajado con más agua si queda muy intenso.' } },
    { '@type': 'Question', name: '¿La horchata de arroz lleva leche?', acceptedAnswer: { '@type': 'Answer', text: 'La horchata mexicana se hace con arroz, no con leche: se remoja el arroz, se tritura con canela y agua, se cuela bien y se endulza. Queda una bebida cremosa y blanca de origen vegetal. Es distinta de la horchata de chufa valenciana, que se hace con chufas.' } },
    { '@type': 'Question', name: '¿Se pueden hacer aguas frescas con menos azúcar?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, el azúcar es totalmente al gusto: puedes reducirlo, sustituirlo por edulcorante o aprovechar el dulzor natural de fruta madura. Las cantidades que da la herramienta son un punto de partida equilibrado; ajústalas a tu preferencia y a lo dulce que esté la fruta.' } },
  ],
};
