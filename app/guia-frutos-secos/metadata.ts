import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Frutos Secos y Semillas - Nutrición, beneficios y usos | meskeIA',
  description:
    'Guía de 30 frutos secos y semillas: almendra, nuez, pistacho, chía, lino, anacardo y más. Nutrición, conservación y usos culinarios.',
  keywords:
    'frutos secos, semillas, almendra nuez pistacho, chia lino sesamo, nutricion frutos secos, snacks saludables, omega-3, proteinas vegetales, conservacion frutos secos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Frutos Secos y Semillas | meskeIA',
    description:
      '30 frutos secos y semillas del mundo: nutrientes, calorías, beneficios, conservación y usos culinarios. Filtros por categoría, origen, perfil nutricional y nivel calórico.',
    url: 'https://meskeia.com/guia-frutos-secos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Frutos Secos y Semillas | meskeIA',
    description:
      '30 frutos secos y semillas: nutrición, beneficios, conservación y usos culinarios. Filtros por categoría, origen y nivel calórico.',
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-frutos-secos/',
  },
  other: {
    'application-name': 'Guía de Frutos Secos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Frutos Secos y Semillas',
  description:
    'Guía educativa de 30 frutos secos y semillas: almendra, nuez, pistacho, avellana, anacardo, castaña, pacana, macadamia, nuez de Brasil, piñón, coco, cacahuete, pipas de girasol y calabaza, sésamo, chía, lino, cáñamo, amapola, mostaza, comino, hinojo, cardamomo, quinua, chufa, bellota, castaña de agua y más. Información nutricional completa, beneficios, conservación, usos culinarios y curiosidades.',
  url: 'https://meskeia.com/guia-frutos-secos/',
  features: [
    '30 frutos secos y semillas organizados en 4 categorías',
    'Buscador por nombre, nombre científico y país de origen',
    'Filtros por categoría (nuez, semilla, legumbre, drupa)',
    'Filtros por región de origen (Mediterráneo, América, Asia, África, Oceanía)',
    'Filtros por perfil nutricional (proteínas, omega-3, fibra, antioxidantes...)',
    'Filtros por nivel calórico (moderado, alto, muy alto)',
    'Información nutricional completa por 100 g',
    'Conservación y duración orientativa',
    'Usos culinarios y combinaciones',
    'Beneficios para la salud y curiosidades',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});
