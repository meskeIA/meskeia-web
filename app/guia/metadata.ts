import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guías meskeIA - Decisiones Importantes con Herramientas Gratuitas',
  description:
    'Guías paso a paso para las decisiones más importantes de tu vida: comprar casa, invertir, ser freelance, montar un negocio, ahorrar o vivir más sano. Herramientas gratuitas.',
  keywords: [
    'guias financieras',
    'guia comprar casa',
    'guia invertir',
    'guia freelance',
    'guia ahorrar',
    'guia montar negocio',
    'guia vivir sano',
    'herramientas gratuitas',
    'calculadoras espana',
  ],
  openGraph: {
    title: 'Guías meskeIA - Decisiones Importantes con Herramientas Gratuitas',
    description:
      'Guías paso a paso para las decisiones más importantes de tu vida. Herramientas gratuitas para tomar mejores decisiones.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  robots: 'index, follow',
};

export const jsonLd = generateWebAppSchema({
  name: "Guía para Gestionar una Herencia",
  description: "Guías paso a paso para las decisiones más importantes de tu vida: comprar casa, invertir, ser freelance, montar un negocio, ahorrar o vivir más sano. Herramientas gratuitas.",
  url: "https://meskeia.com/guia/",
  category: 'FinanceApplication',
  features: [],
});
