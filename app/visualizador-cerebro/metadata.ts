import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Piensa tu Cerebro - Neuronas, Memoria y Neuroplasticidad | meskeIA',
  description: 'Entiende cómo funciona tu cerebro: 86.000 millones de neuronas, formación de recuerdos, neuroplasticidad y las ilusiones que te engañan. Explicador visual interactivo.',
  keywords: 'cerebro, neuronas, sinapsis, memoria, neuroplasticidad, ilusiones ópticas, lóbulos cerebrales, recuerdos, Müller-Lyer, memoria de trabajo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Piensa tu Cerebro - Neuronas, Memoria y Neuroplasticidad',
    description: 'Tu cerebro explicado visualmente: neuronas, memoria, neuroplasticidad e ilusiones cognitivas.',
    url: 'https://meskeia.com/visualizador-cerebro',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cómo Piensa tu Cerebro - Explicador Visual',
    description: '86.000 millones de neuronas, 150 billones de sinapsis. Así funciona la máquina más compleja del universo.',
  },
  other: { 'application-name': 'Cerebro meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Piensa tu Cerebro - Neuronas, Memoria y Neuroplasticidad',
  description: 'Explicador visual interactivo sobre el cerebro humano: regiones cerebrales, formación de recuerdos, neuroplasticidad con casos reales, e ilusiones cognitivas con demos CSS interactivas.',
  url: 'https://meskeia.com/visualizador-cerebro/',
  category: 'EducationalApplication',
  features: [
    'Regiones cerebrales clickables con funciones de cada lóbulo',
    'Diagrama de formación de recuerdos: codificación, almacenamiento y recuperación',
    'Casos reales de neuroplasticidad: taxistas de Londres, músicos, recuperación tras ictus',
    'Ilusiones cognitivas interactivas con demos CSS',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
