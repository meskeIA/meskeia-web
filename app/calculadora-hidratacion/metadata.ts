import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Hidratación Diaria | meskeIA',
  description: 'Calcula cuánta agua necesitas beber al día según tu peso, actividad física y clima. Recomendaciones personalizadas para una hidratación óptima.',
  keywords: 'calculadora agua, hidratacion diaria, cuanta agua beber, litros agua dia, hidratacion ejercicio, salud hidratacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Hidratación Diaria',
    description: 'Calcula cuánta agua necesitas beber al día según tu peso, actividad física y clima.',
    url: 'https://meskeia.com/calculadora-hidratacion',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Hidratación Diaria',
    description: 'Calcula cuánta agua necesitas beber al día.',
  },
};
