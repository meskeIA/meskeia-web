import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Capas de la Tierra - Del Suelo al Nucleo de Fuego | meskeIA',
  description: 'Descubre la estructura interna de la Tierra: corteza, manto, nucleo externo y nucleo interno. Ondas sismicas, campo magnetico y datos fascinantes.',
  keywords: 'capas de la Tierra, corteza, manto, nucleo, estructura interna, ondas sismicas, campo magnetico, Mohorovicic, geologia visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Capas de la Tierra - Del Suelo al Nucleo de Fuego',
    description: 'Corteza, manto y nucleo: viaje al interior de la Tierra explicado visualmente.',
    url: 'https://meskeia.com/visualizador-capas-tierra',
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
    title: 'Capas de la Tierra - Explicador Visual',
    description: '6.371 km hasta el centro: 5.400 grados C de hierro solido que nadie ha visto jamas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Capas Tierra meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Capas de la Tierra - Del Suelo al Nucleo de Fuego',
  description: 'Explicador visual interactivo sobre la estructura interna de la Tierra: 4 capas con datos, ondas sismicas, campo magnetico y comparativa planetaria.',
  url: 'https://meskeia.com/visualizador-capas-tierra/',
  category: 'EducationalApplication',
  features: [
    'Seccion transversal interactiva con 4 capas clickables',
    'Ondas sismicas P y S: como sabemos lo que hay dentro',
    'Campo magnetico y efecto dinamo',
    'Comparativa Tierra vs Marte',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});
