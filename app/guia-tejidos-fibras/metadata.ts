import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Tejidos y Fibras - Directorio de 35 materiales textiles | meskeIA',
  description: 'Directorio de 35 tejidos y fibras: algodón, lino, seda, lana, poliéster, nailon, Gore-Tex y más. Origen, cuidados, propiedades técnicas y usos principales.',
  keywords: 'tejidos, fibras textiles, algodón, lino, seda, lana, poliéster, nailon, Gore-Tex, fibras naturales, fibras sintéticas, cuidado textil, materiales ropa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Tejidos y Fibras | meskeIA',
    description: 'Consulta las propiedades de 35 tejidos y fibras: origen, cuidados, sostenibilidad y usos principales.',
    url: 'https://meskeia.com/guia-tejidos-fibras/',
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
    title: 'Guía de Tejidos y Fibras | meskeIA',
    description: 'Directorio de 35 materiales textiles con propiedades, cuidados, sostenibilidad y usos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Tejidos y Fibras meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Tejidos y Fibras',
  description: 'Directorio consultable de 35 tejidos y fibras (naturales, sintéticas, semisintéticas y técnicas) con propiedades destacadas, instrucciones de cuidado, temperatura de lavado, usos principales, curiosidades y valoración de sostenibilidad. Filtros por origen y sostenibilidad, buscador por nombre.',
  url: 'https://meskeia.com/guia-tejidos-fibras/',
  features: [
    'Búsqueda por nombre de tejido o fibra',
    'Filtros por tipo de origen (natural, sintética, técnica...)',
    'Filtros por nivel de sostenibilidad',
    '35 fibras y tejidos con perfil completo',
    'Propiedades destacadas de cada material',
    'Instrucciones de lavado con temperatura máxima',
    'Curiosidades y datos técnicos de cada fibra',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});
