import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Envejece tu Cuerpo - Explicador Visual por Décadas | meskeIA',
  description: 'Visualiza qué cambia en tu cuerpo década a década: metabolismo, masa muscular, densidad ósea, capacidad cardíaca y más. Explicador interactivo con datos científicos.',
  keywords: 'envejecimiento cuerpo, metabolismo edad, masa muscular edad, densidad ósea, capacidad cardíaca, salud por décadas, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Envejece tu Cuerpo - Por Décadas',
    description: 'Qué cambia en tu metabolismo, músculos, huesos y corazón con cada década. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-envejecimiento-cuerpo/',
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
    title: 'Cómo Envejece tu Cuerpo',
    description: 'Visualiza el envejecimiento década a década con datos científicos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Envejecimiento Cuerpo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Envejece tu Cuerpo',
  description: 'Explicador visual interactivo del envejecimiento humano. Década a década: metabolismo, masa muscular, densidad ósea, capacidad cardiovascular, vista, oído y recuperación.',
  url: 'https://meskeia.com/visualizador-envejecimiento-cuerpo/',
  features: [
    'Visualización por décadas del envejecimiento corporal',
    '7 indicadores fisiológicos con barras animadas',
    'Explicación de cada cambio y consejos preventivos',
    'Gráfico de evolución de capacidades a lo largo de la vida',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
