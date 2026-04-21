import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador del Riñón y Filtración | Nefrona y Formación de Orina | meskeIA',
  description: 'Explora la nefrona y cómo los riñones filtran la sangre: filtración glomerular, reabsorción tubular, secreción y regulación hormonal (SRAA, ADH).',
  keywords: 'riñón, nefrona, filtración glomerular, reabsorción, TFG, aldosterona, ADH, SRAA, asa de Henle, túbulo colector',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador del Riñón y Filtración | meskeIA',
    description: '180 litros filtrados al día, 2 litros de orina. Aprende cómo funciona la nefrona y los riñones de forma visual.',
    url: 'https://meskeia.com/visualizador-rinon-filtracion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador del Riñón - Explicador Visual',
    description: 'De la nefrona a la orina: cómo los riñones filtran 1.700 litros de sangre al día.',
  },
  other: { 'application-name': 'Visualizador Riñón meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Riñón y Filtración',
  description: 'Explicador visual interactivo del riñón: anatomía renal, nefrona con segmentos clickables, 3 procesos de formación de orina y regulación hormonal (SRAA, ADH).',
  url: 'https://meskeia.com/visualizador-rinon-filtracion/',
  category: 'EducationalApplication',
  features: [
    'Anatomía renal con zonas clickables',
    'Recorrido interactivo por la nefrona',
    'Los 3 procesos: filtración, reabsorción, secreción',
    'Regulación hormonal SRAA y ADH',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
