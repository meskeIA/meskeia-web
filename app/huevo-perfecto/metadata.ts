import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El huevo perfecto: tiempo de cocción según el punto | meskeIA',
  description:
    'Calcula el tiempo exacto para cocer el huevo en su punto: pasado por agua, mollet o duro, ajustado al tamaño del huevo y a si está frío de la nevera. Gratis y en español.',
  keywords:
    'tiempo huevo cocido, huevo mollet tiempo, cuanto cocer huevo pasado por agua, huevo duro minutos, tiempo coccion huevo, huevo perfecto, huevo a punto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'El huevo perfecto', description: 'El tiempo exacto para el huevo en su punto, según tamaño y temperatura de partida.', url: 'https://meskeia.com/huevo-perfecto', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'El huevo perfecto', description: 'Tiempo de cocción del huevo según el punto, el tamaño y si está frío.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'El huevo perfecto meskeIA' },
  alternates: { canonical: 'https://meskeia.com/huevo-perfecto/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El huevo perfecto',
  description:
    'Calcula el tiempo de cocción del huevo según el punto deseado (pasado por agua, mollet, duro de yema tierna o duro), ajustado al tamaño del huevo y a si parte de temperatura ambiente o de la nevera. El tiempo se cuenta desde que el agua hierve.',
  url: 'https://meskeia.com/huevo-perfecto/',
  features: [
    'Tiempo según el punto del huevo',
    'Ajuste por tamaño del huevo (S, M, L, XL)',
    'Ajuste si el huevo sale de la nevera',
    'Descripción de cómo queda cada punto',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto se cuece un huevo duro?', acceptedAnswer: { '@type': 'Answer', text: 'Un huevo duro necesita unos 11 minutos desde que el agua hierve para un huevo mediano a temperatura ambiente. Si sale de la nevera, añade un minuto; si es grande o extra grande, otro medio minuto. Al sacarlo, pásalo a agua fría para cortar la cocción y que pele mejor.' } },
    { '@type': 'Question', name: '¿Cuánto tarda un huevo mollet?', acceptedAnswer: { '@type': 'Answer', text: 'El huevo mollet, con la clara firme y la yema cremosa, se hace en unos 6 minutos desde que el agua hierve (huevo mediano a temperatura ambiente). Es un punto delicado, así que conviene cronometrar y enfriarlo enseguida para que la yema no siga cuajando.' } },
    { '@type': 'Question', name: '¿Desde cuándo se cuenta el tiempo del huevo?', acceptedAnswer: { '@type': 'Answer', text: 'Desde que el agua rompe a hervir, no desde que enciendes el fuego. Lo habitual es introducir el huevo con cuidado cuando el agua ya hierve suavemente y arrancar el cronómetro en ese momento. Mantén un hervor suave para que el huevo no se golpee y se rompa.' } },
    { '@type': 'Question', name: '¿Por qué se rompen los huevos al cocerlos?', acceptedAnswer: { '@type': 'Answer', text: 'Suelen romperse por el cambio brusco de temperatura (huevo muy frío en agua hirviendo) o por un hervor demasiado fuerte. Para evitarlo, atempera un poco el huevo o introdúcelo con cuchara, mantén un hervor suave y, si quieres, añade una pizca de sal o vinagre al agua.' } },
    { '@type': 'Question', name: '¿Cómo consigo que el huevo duro pele fácil?', acceptedAnswer: { '@type': 'Answer', text: 'Ayuda usar huevos que no sean demasiado frescos, enfriarlos en agua con hielo nada más cocerlos y pelarlos bajo el grifo. El choque de frío separa la membrana de la clara y hace que la cáscara salga más limpia, sin llevarse trozos de clara.' } },
  ],
};
