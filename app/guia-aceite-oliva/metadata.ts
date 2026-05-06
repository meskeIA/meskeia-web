import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía del Aceite de Oliva - Variedades, D.O. y usos | meskeIA',
  description: '32 variedades de aceituna del mundo: perfil de sabor, aromas, notas, acidez, usos ideales y denominaciones de origen. España, Italia, Grecia y más. Filtros por país y perfil.',
  keywords: 'aceite de oliva variedades, aove, picual arbequina, denominacion origen aceite, aceite virgen extra, aceite italiano, aceite griego, guia aceite oliva, cata aceite',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía del Aceite de Oliva | meskeIA',
    description: '32 variedades de aceituna del mundo: perfil de sabor, aromas, notas de boca, acidez, usos ideales y D.O. Filtros por país y perfil.',
    url: 'https://meskeia.com/guia-aceite-oliva',
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
    title: 'Guía del Aceite de Oliva | meskeIA',
    description: '32 variedades de aceituna del mundo: perfil de sabor, aromas, notas, acidez y usos ideales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía del Aceite de Oliva meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía del Aceite de Oliva',
  description: 'Directorio de 32 variedades de aceituna del mundo con perfil de sabor, aromas, notas en boca, nivel de acidez máxima, época de cosecha, usos ideales y denominaciones de origen protegidas. Incluye guía de cata, comparativa de categorías (AOVE / Virgen / Oliva / Orujo) y consejos de compra y conservación. Filtros por país y perfil de sabor.',
  url: 'https://meskeia.com/guia-aceite-oliva/',
  features: [
    '32 variedades de aceituna con perfil completo',
    'Filtros por país de origen y perfil de sabor',
    'Búsqueda por nombre, región, aromas o notas',
    'Indicador visual de intensidad (3 niveles)',
    'Denominaciones de Origen Protegidas por variedad',
    'Guía de cata paso a paso',
    'Comparativa AOVE vs virgen vs aceite de oliva vs orujo',
    'Funciona 100% en el navegador, sin registro',
  ],
});
