import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Proyectiles 2D - Movimiento Parabólico | meskeIA',
  description:
    'Simula tiros parabólicos: ajusta velocidad, ángulo, gravedad y resistencia del aire. Calcula alcance, altura máxima y tiempo de vuelo. Física Bachillerato y Universidad.',
  keywords:
    'simulador proyectiles, movimiento parabólico, tiro oblicuo, alcance proyectil, altura máxima, física bachillerato, cinemática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-proyectiles/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Proyectiles 2D | meskeIA',
    description:
      'Simulador interactivo de movimiento parabólico con resistencia del aire y diferentes gravedades planetarias',
    url: 'https://meskeia.com/simulador-proyectiles/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Proyectiles 2D | meskeIA',
    description: 'Aprende cinemática con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Proyectiles 2D',
  description:
    'Simulador interactivo de movimiento parabólico. Ajusta velocidad inicial, ángulo, altura, gravedad y resistencia del aire para observar la trayectoria, el alcance, la altura máxima y el tiempo de vuelo.',
  url: 'https://meskeia.com/simulador-proyectiles/',
  category: 'EducationalApplication',
  features: [
    'Trayectoria 2D animada con Canvas',
    'Ángulo, velocidad inicial, altura y gravedad ajustables',
    'Presets de gravedad: Tierra, Luna, Marte, Júpiter',
    'Modo con/sin resistencia del aire',
    'Comparación de hasta 3 lanzamientos simultáneos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['proyectiles', 'tiro parabólico', 'cinemática', 'física bachillerato'],
});
