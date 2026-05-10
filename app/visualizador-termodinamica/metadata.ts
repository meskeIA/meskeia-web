import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Transferencia de Calor - Conducción, Convección y Radiación | meskeIA',
  description: 'Explora las 3 formas de transferencia de calor con animaciones interactivas: conducción, convección y radiación. Conductividad térmica y convección en la naturaleza.',
  keywords: 'transferencia de calor, conducción, convección, radiación, termodinámica, conductividad térmica, aislamiento, brisa marina, efecto invernadero',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Transferencia de Calor - Conducción, Convección y Radiación',
    description: 'Las 3 formas de transferir calor explicadas visualmente con animaciones de partículas, corrientes y ondas.',
    url: 'https://meskeia.com/visualizador-termodinamica/',
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
    title: 'Transferencia de Calor - Explicador Visual',
    description: 'Conducción, convección y radiación: cómo se mueve el calor, con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Termodinámica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Transferencia de Calor - Conducción, Convección y Radiación',
  description: 'Explicador visual interactivo sobre las 3 formas de transferencia de calor: conducción, convección y radiación. Incluye conductividad térmica de materiales, convección en la naturaleza y datos fascinantes.',
  url: 'https://meskeia.com/visualizador-termodinamica/',
  category: 'EducationalApplication',
  features: [
    '3 formas de transferencia de calor con animaciones interactivas',
    'Tabla de conductividad térmica con barras proporcionales',
    'Convección en la naturaleza: brisa marina, corrientes oceánicas, meteorología',
    'Datos fascinantes sobre termodinámica cotidiana',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
