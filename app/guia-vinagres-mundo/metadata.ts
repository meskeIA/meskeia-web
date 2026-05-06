import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Vinagres del Mundo - 25 vinagres, origen y maridaje | meskeIA',
  description:
    'Guía de referencia de 25 vinagres: balsámico, jerez, manzana, arroz, kombucha y más. Origen, acidez, intensidad y uso ideal con filtros por origen, intensidad y uso culinario.',
  keywords:
    'vinagres, balsamico modena, vinagre jerez, vinagre manzana, vinagre arroz, vinagreta, tipos vinagre, vinagre kombucha, vinagre champagne, vinagre malta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Vinagres del Mundo | meskeIA',
    description:
      '25 vinagres del mundo con origen, acidez, intensidad, envejecimiento, notas de sabor, usos ideales y maridaje.',
    url: 'https://meskeia.com/guia-vinagres-mundo',
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
    title: 'Guía de Vinagres del Mundo | meskeIA',
    description:
      '25 vinagres del mundo con origen, acidez, intensidad y uso ideal. Filtros por origen, región e intensidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Vinagres del Mundo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Vinagres del Mundo',
  description:
    'Directorio de 25 vinagres del mundo con materia prima de origen, región, país, acidez (porcentaje), intensidad de sabor, envejecimiento, notas de sabor, usos ideales en cocina y maridaje. Incluye balsámicos italianos, jerez español, vinagre de arroz japonés y chino, manzana americana, kombucha, palma filipina y especialidades europeas. Filtros por origen, región, acidez, intensidad y uso culinario.',
  url: 'https://meskeia.com/guia-vinagres-mundo/',
  features: [
    '25 vinagres con perfil completo (origen, acidez, intensidad, envejecimiento)',
    'Filtros por materia prima, región, acidez, intensidad y uso',
    'Búsqueda por nombre, país, notas de sabor y maridaje',
    'Notas de sabor y maridajes recomendados en cada ficha',
    'Curiosidad y dato cultural por cada vinagre',
    'Patrón meskeIA v2.0: tabla comparativa, casos de uso, FAQ y errores comunes',
    'Funciona 100% en el navegador, sin registro',
  ],
});
