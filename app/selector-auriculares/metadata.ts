import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Auriculares | ¿Qué Auriculares Necesitas? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de auriculares se adaptan mejor a tu uso: in-ear TWS inalámbricos, over-ear con cancelación de ruido, deportivos, gaming o auriculares de cable de calidad.',
  keywords: [
    'qué auriculares comprar',
    'in-ear o over-ear',
    'auriculares cancelación ruido',
    'auriculares deportivos',
    'auriculares gaming',
    'TWS inalámbricos',
    'auriculares para trabajar',
    'auriculares calidad precio',
    'mejor tipo auriculares según uso',
    'auriculares para música o videollamadas',
  ],
  openGraph: {
    title: 'Selector de Auriculares — ¿Qué Tipo Necesitas?',
    description:
      'Descubre qué tipo de auriculares se adaptan mejor a tu uso en 10 preguntas.',
    url: 'https://meskeia.com/selector-auriculares/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Auriculares",
  description: "Test de 10 preguntas para saber qué tipo de auriculares se adaptan mejor a tu uso: in-ear TWS inalámbricos, over-ear con cancelación de ruido, deportivos, gaming o auriculares de cable de calidad.",
  url: "https://meskeia.com/selector-auriculares/",
  category: 'UtilityApplication',
  features: [],
});
