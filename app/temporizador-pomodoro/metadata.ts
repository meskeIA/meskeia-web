import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Temporizador Pomodoro Online - Técnica Pomodoro Gratis | meskeIA',
  description: 'Temporizador Pomodoro online gratuito. Mejora tu productividad con sesiones de 25 minutos, estadísticas de concentración y sonidos personalizables. Sin registro.',
  keywords: 'pomodoro, temporizador, productividad, concentracion, tecnica pomodoro, timer, enfoque, trabajo, estudio, 25 minutos, descanso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Temporizador Pomodoro Online Gratis - meskeIA',
    description: 'Mejora tu productividad con la técnica Pomodoro. Sesiones configurables, estadísticas y sonidos. 100% gratuito.',
    url: 'https://meskeia.com/temporizador-pomodoro/',
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
    title: 'Temporizador Pomodoro Online - meskeIA',
    description: 'Técnica Pomodoro gratuita con estadísticas de productividad',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Temporizador Pomodoro meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Temporizador Pomodoro",
  description: "Temporizador Pomodoro online gratuito. Mejora tu productividad con sesiones de 25 minutos, estadísticas de concentración y sonidos personalizables. Sin registro.",
  url: "https://meskeia.com/temporizador-pomodoro/",
  category: 'BusinessApplication',
  features: [],
});
