import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientador de Jet Lag - Calcula el Impacto de tu Viaje | meskeIA',
  description: 'Calcula el jet lag de tu próximo viaje internacional. Conoce los días de adaptación necesarios y recibe recomendaciones personalizadas según el cambio horario y la dirección del vuelo.',
  keywords: 'jet lag, calculadora jet lag, cambio horario, adaptación viaje, desfase horario, viaje largo, recuperar jet lag, síntomas jet lag',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Jet Lag | meskeIA',
    description: 'Calcula el impacto del jet lag en tu viaje y recibe consejos para adaptarte más rápido.',
    url: 'https://meskeia.com/orientador-jet-lag',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orientador de Jet Lag | meskeIA',
    description: 'Calcula el impacto del jet lag y recibe recomendaciones de adaptación personalizadas.',
  },
  other: {
    'application-name': 'Orientador de Jet Lag meskeIA',
  },
};
