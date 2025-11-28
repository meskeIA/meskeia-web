import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test de Hábitos Saludables - Evalúa tu Bienestar | meskeIA',
  description: 'Evalúa tus hábitos de vida con nuestro test gratuito. Analiza hidratación, alimentación, actividad física, descanso y más. Obtén un perfil visual de tu bienestar.',
  keywords: 'test hábitos saludables, evaluación bienestar, hábitos de vida, salud, hidratación, sueño, alimentación, actividad física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Hábitos Saludables - meskeIA',
    description: 'Evalúa tus hábitos de vida y obtén un perfil visual de tu bienestar.',
    url: 'https://meskeia.com/test-habitos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Hábitos Saludables - meskeIA',
    description: 'Evalúa tus hábitos de vida y mejora tu bienestar.',
  },
};
