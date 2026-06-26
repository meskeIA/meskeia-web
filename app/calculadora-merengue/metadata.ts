import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de merengue: claras y azúcar | meskeIA',
  description:
    'Calcula el azúcar para tu merengue según el número de claras y el tipo: francés, suizo o italiano. Para el italiano, también el agua del almíbar. Proporción 1:2 profesional. Gratis y en español.',
  keywords:
    'calculadora merengue, cuanto azucar merengue, merengue frances italiano suizo, proporcion claras azucar merengue, merengue 2 claras, ratio merengue, merengue italiano almibar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calculadora de merengue', description: 'Azúcar y agua para tu merengue según el tipo y el número de claras.', url: 'https://meskeia.com/calculadora-merengue', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Calculadora de merengue', description: 'Claras y azúcar para merengue francés, suizo o italiano.' },
  other: { 'application-name': 'Calculadora de merengue meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-merengue/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de merengue',
  description:
    'Calcula la cantidad de azúcar (y, en el merengue italiano, el agua del almíbar) según el número de claras de huevo y el tipo de merengue: francés en crudo, suizo al baño maría o italiano con almíbar, usando la proporción habitual 1:2.',
  url: 'https://meskeia.com/calculadora-merengue/',
  features: [
    'Azúcar y claras según el tipo de merengue',
    'Francés, suizo e italiano',
    'Agua del almíbar para el merengue italiano',
    'Crémor tártaro estabilizante orientativo',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto azúcar lleva el merengue?', acceptedAnswer: { '@type': 'Answer', text: 'La proporción clásica es 1:2 en peso: el doble de azúcar que de claras. Como una clara pesa unos 33 gramos, para 3 claras (unos 100 g) se usan unos 200 g de azúcar. Esa proporción da un merengue firme y estable; bajarla un poco lo deja más ligero pero menos resistente.' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre merengue francés, suizo e italiano?', acceptedAnswer: { '@type': 'Answer', text: 'El francés se monta con las claras y el azúcar en crudo, y es el más sencillo (para hornear merengues o macarons). El suizo calienta claras y azúcar al baño maría antes de montar, quedando denso y brillante (coberturas). El italiano incorpora un almíbar a 118 °C sobre las claras y es el más estable, ideal para mousses y decoración.' } },
    { '@type': 'Question', name: '¿Por qué se me baja el merengue?', acceptedAnswer: { '@type': 'Answer', text: 'Las causas más habituales son restos de grasa o yema en las claras o el bol, montar a velocidad o temperatura inadecuadas, o añadir el azúcar demasiado pronto. Una pizca de crémor tártaro o unas gotas de limón ayudan a estabilizarlo. El bol y las varillas deben estar perfectamente limpios y secos.' } },
    { '@type': 'Question', name: '¿Cuántas claras necesito para una tarta?', acceptedAnswer: { '@type': 'Answer', text: 'Depende del tamaño, pero para cubrir una tarta mediana suelen bastar 3 o 4 claras con su azúcar correspondiente. La herramienta te da el azúcar exacto para el número de claras que pongas, así puedes escalarlo a lo que necesites.' } },
    { '@type': 'Question', name: '¿Cuál es el merengue más estable para decorar?', acceptedAnswer: { '@type': 'Answer', text: 'El merengue italiano es el más estable porque el almíbar caliente cuece ligeramente las claras, lo que lo hace aguantar mejor el tiempo y la temperatura. Por eso es el preferido para decoración, mousses y para flamear, mientras que el francés se usa más para hornear.' } },
  ],
};
