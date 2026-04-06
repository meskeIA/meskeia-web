import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Tabla Periódica en tu Vida - Elementos que Usas a Diario | meskeIA',
  description: 'Descubre qué elementos químicos hay en tu cuerpo, tu móvil, tu casa y cuáles podrían agotarse. Explicador visual interactivo sobre la tabla periódica en tu día a día.',
  keywords: 'tabla periódica, elementos químicos, química cotidiana, litio batería, oxígeno cuerpo, tierras raras, elementos smartphone, escasez elementos, helio, fósforo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Tabla Periódica en tu Vida - Elementos que Usas a Diario',
    description: 'Qué elementos químicos hay en tu cuerpo, tu móvil y tu casa. Y cuáles podrían agotarse pronto.',
    url: 'https://meskeia.com/visualizador-tabla-periodica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Tabla Periódica en tu Vida - Explicador Visual',
    description: 'Los elementos químicos que tocas, respiras y llevas en el bolsillo cada día.',
  },
  other: { 'application-name': 'Tabla Periódica Vida meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Tabla Periódica en tu Vida - Elementos que Usas a Diario',
  description: 'Explicador visual interactivo sobre los elementos químicos presentes en tu cuerpo, tu smartphone, tu hogar y cuáles son los más escasos del planeta. Química cotidiana explicada de forma visual.',
  url: 'https://meskeia.com/visualizador-tabla-periodica/',
  category: 'EducationalApplication',
  features: [
    'Composición elemental del cuerpo humano con funciones biológicas',
    'Mapa de 30+ elementos en un smartphone: batería, chip, pantalla, contactos',
    'Exploración habitación por habitación de elementos en el hogar',
    'Ranking de escasez: qué elementos podrían agotarse primero',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
