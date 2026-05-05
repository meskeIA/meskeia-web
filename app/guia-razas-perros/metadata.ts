import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Razas de Perros - 40 razas con características y filtros | meskeIA',
  description: 'Directorio interactivo de 40 razas de perros: tamaño, energía, temperamento, peso, mantenimiento y aptitud para familia. Filtros por tamaño, energía, apartamento y niños. Incluye grupos FCI.',
  keywords: 'guia razas perros, razas perros españa, perros apartamento, perros para niños, grupos FCI, labrador retriever, golden retriever, razas pequeñas, razas grandes, adoptar perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Razas de Perros - 40 razas con características | meskeIA',
    description: '40 razas de perros con temperamento, energía, peso, altura, mantenimiento y consejos para elegir la raza ideal. Filtros interactivos por tamaño, energía, apartamento y niños.',
    url: 'https://meskeia.com/guia-razas-perros',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Razas de Perros | meskeIA',
    description: '40 razas de perros: tamaño, energía, temperamento y cómo elegir la raza ideal para tu vida.',
  },
  other: {
    'application-name': 'Guía de Razas de Perros meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Razas de Perros',
  description: 'Directorio interactivo de 40 razas de perros clasificadas por grupos FCI con información sobre tamaño, peso, altura, tipo de pelo, energía, nivel de mantenimiento, temperamento, esperanza de vida y aptitud para familias con niños o pisos pequeños. Incluye filtros interactivos y guía para elegir la raza ideal.',
  url: 'https://meskeia.com/guia-razas-perros/',
  features: [
    '40 razas de perros con ficha completa',
    'Clasificación por grupos FCI con código de color',
    'Filtros por tamaño, energía, apto apartamento y apto niños',
    'Buscador por nombre de raza',
    'Peso, altura, tipo de pelo y esperanza de vida',
    'Nivel de mantenimiento y temperamento por raza',
    'Guía paso a paso para elegir la raza ideal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
