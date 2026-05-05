import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Directorio de Razas de Gatos - Guía Interactiva | meskeIA',
  description:
    'Explora 35 razas de gatos con filtros por tamaño, pelo, energía y compatibilidad. Encuentra la raza perfecta para tu hogar y estilo de vida.',
  keywords:
    'razas de gatos, directorio gatos, gatos por tamaño, gatos hipoalergénicos, gatos para niños, gatos para pisos, razas felinas, Maine Coon, Persa, Siamés, Bengal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Directorio de Razas de Gatos - Guía Interactiva',
    description:
      'Explora 35 razas de gatos con filtros por tamaño, pelo, energía y compatibilidad. Encuentra la raza perfecta para tu hogar.',
    url: 'https://meskeia.com/guia-razas-gatos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Directorio de Razas de Gatos - meskeIA',
    description:
      'Encuentra tu raza de gato ideal entre 35 razas con filtros interactivos por tamaño, pelo, energía y compatibilidad.',
  },
  other: {
    'application-name': 'Guía Razas de Gatos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Directorio de Razas de Gatos',
  description:
    'Directorio interactivo de 35 razas de gatos con filtros por tipo de pelo, energía, tamaño y compatibilidad con niños, perros y vida en interior. Encuentra la raza ideal para tu hogar.',
  url: 'https://meskeia.com/guia-razas-gatos/',
  features: [
    '35 razas de gatos con fichas detalladas',
    'Filtros por tipo de pelo, energía, tamaño y temperamento',
    'Compatibilidad con niños, perros y vida en interior',
    'Buscador por nombre de raza',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
