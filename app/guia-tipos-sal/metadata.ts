import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de tipos de sal: cuál usar para cada cosa | meskeIA',
  description:
    'Sal fina, gorda, marina, flor de sal, escamas (Maldon), rosa del Himalaya, negra, ahumada o yodada: sus texturas, usos y diferencias para acertar en la cocina. Gratis y en español.',
  keywords:
    'tipos de sal, flor de sal, sal en escamas maldon, sal del himalaya, sal marina, diferencia sal fina gorda, sal ahumada, sal negra kala namak',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Guía de tipos de sal', description: 'Texturas, usos y diferencias de las sales de cocina.', url: 'https://meskeia.com/guia-tipos-sal', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Guía de tipos de sal', description: 'Qué sal usar para cada cosa.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Guía de sal meskeIA' },
  alternates: { canonical: 'https://meskeia.com/guia-tipos-sal/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de tipos de sal',
  description:
    'Guía de los tipos de sal de cocina —fina de mesa, gorda, marina, flor de sal, en escamas, rosa del Himalaya, negra, ahumada y yodada— con su textura, sus usos recomendados y sus diferencias para saber cuál elegir en cada caso.',
  url: 'https://meskeia.com/guia-tipos-sal/',
  category: 'EducationalApplication',
  features: [
    'Tipos de sal con su textura y usos',
    'De la sal fina a la flor de sal',
    'Sales especiales: ahumada, negra, rosa',
    'Para qué sirve cada una en cocina',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué diferencia hay entre la sal fina y la gorda?', acceptedAnswer: { '@type': 'Answer', text: 'La diferencia principal es el tamaño del cristal. La sal fina se disuelve rápido y es la mejor para cocinar y sazonar de forma uniforme; la gorda o gruesa se disuelve más despacio y va bien para salar el agua de cocción, para asados a la sal y para costras. Químicamente son casi lo mismo: cloruro sódico.' } },
    { '@type': 'Question', name: '¿Para qué se usa la flor de sal?', acceptedAnswer: { '@type': 'Answer', text: 'La flor de sal es una sal de acabado: se añade al final, ya en el plato, para aportar un punto de sal y una textura crujiente sin que llegue a disolverse del todo. Es delicada y algo más cara, así que no se usa para cocinar, sino para rematar carnes, pescados, tostadas o incluso postres.' } },
    { '@type': 'Question', name: '¿Es mejor la sal rosa del Himalaya?', acceptedAnswer: { '@type': 'Answer', text: 'Nutricionalmente apenas se diferencia de la sal marina: su color rosado viene de pequeñas trazas de minerales como el hierro, en cantidades demasiado bajas para tener efecto. Es una sal perfectamente válida y bonita para acabados, pero no aporta beneficios de salud reseñables frente a otras sales.' } },
    { '@type': 'Question', name: '¿Qué es la sal negra kala namak?', acceptedAnswer: { '@type': 'Answer', text: 'Es una sal de origen volcánico, habitual en la cocina india, con un característico aroma azufrado. Se usa mucho en cocina vegana porque aporta un sabor parecido al del huevo a tofus revueltos y mayonesas sin huevo. Es muy potente, así que conviene usarla con moderación.' } },
    { '@type': 'Question', name: '¿Toda la sal lleva yodo?', acceptedAnswer: { '@type': 'Answer', text: 'No. El yodo se añade a la sal yodada como medida de salud pública para prevenir su carencia, pero muchas sales marinas, gruesas o de acabado no lo llevan o lo tienen en cantidades mínimas. Si se busca el aporte de yodo, conviene fijarse en el etiquetado y elegir una sal yodada.' } },
  ],
};
