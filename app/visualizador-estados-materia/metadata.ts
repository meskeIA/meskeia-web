import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estados de la Materia - Sólido, Líquido, Gas y Plasma | meskeIA',
  description: 'Descubre los 4 estados de la materia con partículas animadas, transiciones, diagrama de fases y datos curiosos. Explicador visual interactivo.',
  keywords: 'estados materia, sólido líquido gas plasma, transiciones, fusión, evaporación, sublimación, diagrama fases, punto triple, física visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estados de la Materia - Sólido, Líquido, Gas y Plasma',
    description: 'Partículas animadas, transiciones y diagrama de fases: la materia explicada visualmente.',
    url: 'https://meskeia.com/visualizador-estados-materia',
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
    title: 'Estados de la Materia - Explicador Visual',
    description: 'De -273°C al plasma solar: los 4 estados de la materia con animaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estados Materia meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estados de la Materia - Sólido, Líquido, Gas y Plasma',
  description: 'Explicador visual interactivo sobre los 4 estados de la materia: partículas animadas, 6 transiciones, diagrama de fases del agua y datos curiosos.',
  url: 'https://meskeia.com/visualizador-estados-materia/',
  category: 'EducationalApplication',
  features: [
    'Partículas animadas en 4 estados diferentes',
    '6 transiciones con ejemplos cotidianos',
    'Diagrama de fases del agua interactivo',
    'Slider de temperatura con cambio de estado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
