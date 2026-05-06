import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Fotosíntesis - De la Luz Solar a la Vida | meskeIA',
  description: 'Descubre cómo funciona la fotosíntesis paso a paso: fase luminosa, ciclo de Calvin, cloroplastos y datos de escala. Explicador visual interactivo de biología.',
  keywords: 'fotosíntesis, cloroplasto, ciclo Calvin, fase luminosa, clorofila, CO2, oxígeno, biología visual, plantas, energía solar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Fotosíntesis - De la Luz Solar a la Vida',
    description: 'El proceso que sostiene la vida en la Tierra, explicado visualmente paso a paso.',
    url: 'https://meskeia.com/visualizador-fotosintesis',
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
    title: 'La Fotosíntesis - Explicador Visual',
    description: 'De un fotón a una molécula de glucosa: la fotosíntesis como nunca la habías visto.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fotosíntesis Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Fotosíntesis - De la Luz Solar a la Vida',
  description: 'Explicador visual interactivo sobre la fotosíntesis: ecuación general, fase luminosa, ciclo de Calvin y datos de escala planetaria. Diagramas animados del proceso completo.',
  url: 'https://meskeia.com/visualizador-fotosintesis/',
  category: 'EducationalApplication',
  features: [
    'Proceso completo de fotosíntesis paso a paso',
    'Fase luminosa con flujo de energía animado',
    'Ciclo de Calvin con diagrama circular interactivo',
    'Datos de escala: árboles, oxígeno, fitoplancton',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
