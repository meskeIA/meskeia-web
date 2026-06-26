import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sous-vide: temperaturas y tiempos por alimento | meskeIA',
  description:
    'Temperaturas y tiempos de cocción sous-vide (al vacío a baja temperatura) para carne, pollo, cerdo, pescado, huevo y verduras, con los puntos de cocción. En °C y °F. Gratis y en español.',
  keywords:
    'sous vide temperaturas, cocina al vacio baja temperatura, sous vide tiempos, temperatura sous vide carne, sous vide pollo cerdo pescado, tabla sous vide, coccion al vacio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Sous-vide: temperaturas y tiempos', description: 'Temperaturas y tiempos sous-vide por alimento y punto de cocción.', url: 'https://meskeia.com/sous-vide', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Sous-vide: temperaturas y tiempos', description: 'La guía de temperaturas y tiempos de cocción al vacío.' },
  other: { 'application-name': 'Sous-vide meskeIA' },
  alternates: { canonical: 'https://meskeia.com/sous-vide/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Sous-vide: temperaturas y tiempos',
  description:
    'Guía de temperaturas y tiempos de cocción sous-vide (al vacío a baja temperatura) para vacuno, cerdo, pollo, pescado, huevo y verduras, con los distintos puntos de cocción en grados Celsius y Fahrenheit.',
  url: 'https://meskeia.com/sous-vide/',
  category: 'UtilityApplication',
  features: [
    'Temperaturas y tiempos sous-vide por alimento',
    'Puntos de cocción para carne y pescado',
    'En grados Celsius y Fahrenheit',
    'Notas de seguridad y técnica',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es la cocina sous-vide?', acceptedAnswer: { '@type': 'Answer', text: 'Es cocinar el alimento envasado al vacío y sumergido en agua a una temperatura constante y controlada, normalmente baja. La temperatura define con precisión el punto final (la carne no se pasa) y el tiempo asegura que el centro llegue y, en aves y cerdo, que se pasteurice. Suele rematarse con un sellado rápido en sartén.' } },
    { '@type': 'Question', name: '¿A qué temperatura se hace un filete sous-vide?', acceptedAnswer: { '@type': 'Answer', text: 'Para vacuno, poco hecho ronda los 54 °C, al punto unos 57 °C y al punto más unos 60 °C, durante 1 a 2 horas según el grosor. Como la temperatura del agua es exactamente la del punto deseado, el filete no se pasa aunque se alargue un poco. Al sacarlo se sella en sartén muy caliente.' } },
    { '@type': 'Question', name: '¿El sous-vide es seguro con el pollo?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, siempre que se respeten temperatura Y tiempo. A 63-65 °C durante el tiempo adecuado (1 a 2 horas) el pollo se pasteuriza y queda seguro y jugoso, sin necesidad de llegar a los 74 °C de un asado rápido. La seguridad del sous-vide depende de no acortar el tiempo a esas temperaturas bajas.' } },
    { '@type': 'Question', name: '¿De qué depende el tiempo en sous-vide?', acceptedAnswer: { '@type': 'Answer', text: 'Del grosor de la pieza, para que el centro alcance la temperatura del agua, y de la pasteurización en aves y cerdo. Piezas más gruesas necesitan más tiempo. A diferencia de otras técnicas, pasarse un poco de tiempo no estropea el resultado en carnes, pero quedarse corto sí compromete la seguridad.' } },
    { '@type': 'Question', name: '¿Necesito una máquina especial para sous-vide?', acceptedAnswer: { '@type': 'Answer', text: 'Lo habitual es usar un termocirculador que mantiene el agua a temperatura constante, y bolsas aptas para envasar al vacío. Hay aproximaciones caseras con una olla y un termómetro, pero controlar la temperatura con precisión es justo lo que hace que el sous-vide funcione, así que la constancia es clave.' } },
  ],
};
