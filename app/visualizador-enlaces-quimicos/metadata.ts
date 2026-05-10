import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Enlaces Químicos - Cómo se Unen los Átomos | meskeIA',
  description: 'Descubre los 3 tipos de enlaces químicos: iónico, covalente y metálico. Animaciones de electrones, electronegatividad y ejemplos cotidianos explicados visualmente.',
  keywords: 'enlaces químicos, enlace iónico, enlace covalente, enlace metálico, electronegatividad, electrones, NaCl, H2O, química, átomos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Enlaces Químicos - Cómo se Unen los Átomos',
    description: 'Los 3 tipos de enlaces químicos explicados con animaciones de electrones y ejemplos cotidianos.',
    url: 'https://meskeia.com/visualizador-enlaces-quimicos/',
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
    title: 'Enlaces Químicos - Explicador Visual Interactivo',
    description: 'Iónico, covalente y metálico: cómo los átomos se unen para formar todo lo que nos rodea.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Enlaces Químicos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Enlaces Químicos - Cómo se Unen los Átomos',
  description: 'Explicador visual interactivo sobre los 3 tipos de enlaces químicos: iónico (transferencia de electrones), covalente (electrones compartidos) y metálico (mar de electrones). Con animaciones, electronegatividad y ejemplos cotidianos.',
  url: 'https://meskeia.com/visualizador-enlaces-quimicos/',
  category: 'EducationalApplication',
  features: [
    'Animaciones de electrones para cada tipo de enlace químico',
    'Escala de electronegatividad interactiva para predecir el tipo de enlace',
    'Tabla comparativa de propiedades: fusión, conductividad, dureza',
    'Ejemplos cotidianos: sal, agua, hierro, diamante, hielo, CO₂',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
