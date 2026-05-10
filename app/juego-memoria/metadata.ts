import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego de Memoria - Encuentra las Parejas | meskeIA',
  description: 'Entrena tu memoria encontrando parejas de cartas. Diferentes niveles de dificultad y estadísticas de tiempo. Gratis y sin registro.',
  keywords: 'memoria, juego, parejas, cartas, concentracion, brain training, emojis, online, gratis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/juego-memoria/',
  },
  openGraph: {
    type: 'website',
    title: 'Juego de Memoria - Encuentra las Parejas | meskeIA',
    description: 'Entrena tu memoria encontrando parejas de cartas.',
    url: 'https://meskeia.com/juego-memoria/',
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
    title: 'Juego de Memoria - meskeIA',
    description: 'Entrena tu memoria con este juego de parejas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Juego de Memoria',
  description: 'Juego clásico de memoria: encuentra todas las parejas de cartas en el menor tiempo posible. Varios niveles de dificultad y estadísticas de tiempo. Ejercita la memoria y la concentración.',
  url: 'https://meskeia.com/juego-memoria/',
  category: 'EducationalApplication',
  features: [
    'Tres niveles de dificultad (fácil, medio, difícil)',
    'Cronómetro y contador de movimientos',
    'Estadísticas guardadas localmente',
    'Diferentes temas visuales (emojis, animales, frutas)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['juego memoria', 'parejas', 'concentración', 'brain training', 'juego online'],
});
