import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía del Café - Orígenes, variedades y producción mundial | meskeIA',
  description: '40 orígenes de café del mundo: especie, altitud, notas de sabor, procesado, cosecha y preparación ideal. Más guía de especies (Arábica, Robusta, Libérica), métodos de procesado y niveles de tueste.',
  keywords: 'cafe origenes mundo, arabica robusta, cafe colombia, cafe etiopia, cafe especialidad, notas de sabor cafe, procesado cafe, tueste cafe, guia cafe',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía del Café | meskeIA',
    description: '40 orígenes de café: especie, altitud, notas de sabor, procesado y preparación ideal. Guía de especies, procesados y tueste.',
    url: 'https://meskeia.com/guia-cafe',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía del Café | meskeIA',
    description: '40 orígenes de café del mundo: especie, altitud, notas de sabor y preparación ideal.',
  },
  other: {
    'application-name': 'Guía del Café meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía del Café',
  description: 'Directorio de 40 orígenes de café del mundo con especie, altitud de cultivo, notas de sabor, método de procesado, época de cosecha y preparación ideal. Incluye guía de referencia sobre especies (Arábica, Robusta, Libérica), métodos de procesado y niveles de tueste. Filtros por continente.',
  url: 'https://meskeia.com/guia-cafe/',
  features: [
    '40 orígenes de café con perfil completo',
    'Filtros por continente',
    'Búsqueda por origen, país o nota de sabor',
    'Guía de referencia: Arábica vs Robusta vs Libérica',
    'Guía de métodos de procesado',
    'Guía de niveles de tueste',
    'Indicadores visuales de acidez y cuerpo',
    'Funciona 100% en el navegador, sin registro',
  ],
});
