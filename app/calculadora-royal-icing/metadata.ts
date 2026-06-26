import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de glaseado real (royal icing) | meskeIA',
  description:
    'Calcula el azúcar glas y las claras para tu glaseado real según el número de claras y la consistencia: rígida para contornos, media o de relleno (flood). Para decorar galletas. Gratis y en español.',
  keywords:
    'glaseado real, royal icing receta, glasa para galletas, consistencia royal icing, glaseado contorno relleno, azucar glas clara glasa, decorar galletas glasa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calculadora de glaseado real (royal icing)', description: 'Azúcar glas y claras para tu glasa según la consistencia que necesites.', url: 'https://meskeia.com/calculadora-royal-icing', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Calculadora de glaseado real', description: 'Glasa de azúcar para decorar galletas: contorno, media o relleno.' },
  other: { 'application-name': 'Glaseado real meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-royal-icing/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de glaseado real (royal icing)',
  description:
    'Calcula el azúcar glas y las claras de huevo para preparar glaseado real (royal icing) según el número de claras y la consistencia deseada: rígida para contornos y figuras, media para bordes, o de relleno (flood) para cubrir superficies.',
  url: 'https://meskeia.com/calculadora-royal-icing/',
  features: [
    'Azúcar glas y claras según la consistencia',
    'Rígida, media y de relleno (flood)',
    'Gotas de limón orientativas',
    'Para decorar galletas y montar figuras',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es el glaseado real o royal icing?', acceptedAnswer: { '@type': 'Answer', text: 'Es una glasa hecha con azúcar glas y clara de huevo (o albúmina) que endurece al secar, usada para decorar galletas y montar figuras de azúcar. Según la cantidad de azúcar por clara queda más rígida (para contornos) o más fluida (para rellenar), lo que permite hacer líneas, letras, flores y superficies lisas.' } },
    { '@type': 'Question', name: '¿Qué consistencia de glasa necesito?', acceptedAnswer: { '@type': 'Answer', text: 'La rígida, con más azúcar, mantiene la forma y sirve para contornos, letras y figuras. La media es versátil para bordes que no se caen. La de relleno (flood), más fluida, se usa para cubrir superficies y se alisa sola; se mide por los segundos que tarda en cerrarse una marca (10-15 segundos).' } },
    { '@type': 'Question', name: '¿Se puede hacer royal icing sin huevo crudo?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. En lugar de clara fresca puedes usar albúmina (clara deshidratada en polvo) rehidratada con agua, o merengue en polvo. Es la opción recomendada si te preocupa el huevo crudo, sobre todo para niños, embarazadas o personas vulnerables. La proporción de azúcar glas es la misma.' } },
    { '@type': 'Question', name: '¿Cuánto tarda en secar el glaseado real?', acceptedAnswer: { '@type': 'Answer', text: 'Los contornos secan en pocos minutos al tacto, pero una galleta rellena necesita varias horas, idealmente toda la noche, para endurecer del todo. Un secado completo es lo que da ese acabado duro y brillante y evita que los colores se mezclen o la superficie se hunda.' } },
    { '@type': 'Question', name: '¿Por qué se me queda mate o se agrieta la glasa?', acceptedAnswer: { '@type': 'Answer', text: 'El acabado mate o agrietado suele deberse a un secado demasiado lento y húmedo o a una consistencia mal ajustada. Secar cerca de una fuente de aire seco ayuda al brillo. Si se agrieta, suele ser por una glasa demasiado espesa o por secar a temperatura muy baja.' } },
  ],
};
