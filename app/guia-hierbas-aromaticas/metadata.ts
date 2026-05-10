import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Hierbas Aromáticas para Cocina | meskeIA',
  description:
    'Guía de 27 hierbas aromáticas: albahaca, romero, tomillo, orégano, perejil, cilantro, eneldo y más. Sabor, usos, cultivo y maridaje.',
  keywords:
    'hierbas aromaticas, albahaca romero tomillo, perejil cilantro, hierbas cocina, cultivar hierbas, maridaje hierbas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Hierbas Aromáticas para Cocina | meskeIA',
    description:
      'Descubre 27 hierbas aromáticas: perfil de sabor, intensidad, usos culinarios, origen, maridaje y guía de cultivo.',
    url: 'https://meskeia.com/guia-hierbas-aromaticas/',
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
    title: 'Guía de Hierbas Aromáticas | meskeIA',
    description:
      'Directorio de 27 hierbas aromáticas con perfil de sabor, maridaje, cocinas típicas y guía de cultivo en casa.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Hierbas Aromáticas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Hierbas Aromáticas para Cocina',
  description:
    'Directorio consultable de 27 hierbas aromáticas con perfil de sabor, intensidad, forma de uso (fresca/seca), origen, maridaje, cocinas típicas, cuándo añadirlas y dificultad de cultivo. Filtros por familia botánica, origen, intensidad, forma de uso y dificultad.',
  url: 'https://meskeia.com/guia-hierbas-aromaticas/',
  features: [
    'Búsqueda por nombre, nombre científico o perfil de sabor',
    'Filtros por familia botánica, origen, intensidad y forma de uso',
    '27 hierbas con ficha completa',
    'Maridaje ideal y cocinas típicas por hierba',
    'Cuándo añadir cada hierba durante la cocción',
    'Guía de cultivo: sol, riego y dificultad',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});
