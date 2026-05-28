import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Organizador de Documentos de Viaje - Checklist Completo | meskeIA',
  description: 'Checklist personalizable con todos los documentos necesarios para tu viaje. Pasaporte, visados, seguros, reservas. Adaptado según destino: España, Europa o internacional.',
  keywords: 'documentos viaje, checklist viaje, pasaporte, visado, seguro viaje, preparar viaje, lista documentos, viaje internacional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Organizador de Documentos de Viaje | meskeIA',
    description: 'Checklist personalizable según destino. Nunca olvides un documento importante antes de viajar.',
    url: 'https://meskeia.com/checklist-documentos-viaje/',
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
    title: 'Organizador de Documentos de Viaje | meskeIA',
    description: 'Checklist personalizable según destino. Nunca olvides un documento antes de viajar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Organizador Documentos Viaje meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Organizador de Documentos de Viaje",
  description: "Checklist personalizable con todos los documentos necesarios para tu viaje. Pasaporte, visados, seguros, reservas. Adaptado según destino: España, Europa o internacional.",
  url: "https://meskeia.com/checklist-documentos-viaje/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué documentos necesito para viajar dentro de Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para viajar entre países del Espacio Schengen (incluyendo España, Francia, Alemania, Italia…) basta con el documento nacional de identidad vigente. Si el destino está fuera del Espacio Schengen pero dentro de la UE (como Irlanda o Bulgaria), el DNI también suele ser suficiente, aunque conviene verificar. Para vuelos, la aerolínea puede exigir pasaporte aunque el país no lo requiera, así que lleva siempre ambos documentos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito visado para viajar a Estados Unidos o Canadá?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ciudadanos españoles no necesitan visado para entrar a Estados Unidos si el viaje es turístico o de negocios y dura menos de 90 días, pero sí deben tramitar la autorización ESTA (online, unos 21 USD) con al menos 72 horas de antelación. Para Canadá se necesita la eTA (Autorización de Viaje Electrónica, 7 CAD). Este checklist recuerda tramitar estas autorizaciones previas antes del viaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué documentos de salud son imprescindibles para viajar al extranjero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para viajes dentro de la UE, la Tarjeta Sanitaria Europea (TSE) cubre atención de urgencia en la red pública. Fuera de la UE, es imprescindible un seguro de viaje con cobertura médica (mínimo recomendado: 30.000 € en Europa, 150.000 € en EEUU). Algunos destinos exigen certificado de vacunación (fiebre amarilla para ciertos países africanos o latinoamericanos) o prueba de cobertura médica mínima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con cuánta antelación debo renovar el pasaporte antes de un viaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Muchos países exigen que el pasaporte tenga al menos 6 meses de vigencia en la fecha de entrada, aunque el país de destino no lo indique explícitamente. La cita para renovar el pasaporte en comisarías españolas puede tardar entre 2 y 4 semanas en temporada alta. Lo recomendable es revisar la caducidad con 3 meses de antelación al viaje y renovar si quedan menos de 6 meses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Debo llevar copias de los documentos de viaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, es muy recomendable. Lleva fotocopias físicas del pasaporte, billete de avión, reserva de hotel, seguro de viaje y, si aplica, visado o ESTA. Guárdalas por separado del original (en otra bolsa o con un acompañante). Además, haz una copia digital en la nube o envíatela por correo electrónico: en caso de robo o pérdida, facilita enormemente los trámites consulares.',
      },
    },
  ],
};
