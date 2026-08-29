import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Ayudas Primera Vivienda en Zona Rural 2026 - meskeIA',
  description: 'Orienta si puedes recibir hasta 15.000€ para comprar tu primera vivienda en un pueblo pequeño. Plan Estatal Vivienda 2026-2030 (RD 326/2026): ≤35 años, municipio ≤10.000 hab, hasta el 20% del precio.',
  keywords: 'ayuda primera vivienda zona rural 2026, 15000 euros primera vivienda pueblo, plan estatal vivienda 2026 municipio pequeño, ayuda compra vivienda rural jóvenes, RD 326/2026 vivienda rural, despoblación rural ayuda vivienda',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Ayudas Primera Vivienda Rural 2026 — hasta 15.000 € para comprar en un pueblo',
    description: '¿Quieres comprar tu primera vivienda en un municipio pequeño? Descubre si la ayuda del Plan Estatal 2026-2030 aplica a tu caso y cuánto podrías recibir.',
    url: 'https://meskeia.com/orientador-ayuda-vivienda-rural/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orientador Ayudas Primera Vivienda Rural 2026',
    description: 'Hasta 15.000€ (o el 20% del precio) para comprar tu primera vivienda en un pueblo. Comprueba si te corresponde.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Orientador Ayudas Primera Vivienda Rural 2026 - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Ayudas Primera Vivienda en Zona Rural 2026',
  description: 'Orientador del Plan Estatal de Vivienda 2026-2030 (RD 326/2026) para jóvenes ≤35 años que quieren comprar su primera vivienda en municipios pequeños (≤10.000 hab o ≤20.000 con pérdida de población). Estima orientativamente el importe de la ayuda: hasta 15.000 € o el 20% del precio de compra, el menor de los dos.',
  url: 'https://meskeia.com/orientador-ayuda-vivienda-rural/',
  category: 'FinanceApplication',
  features: [
    'Comprueba los 4 requisitos básicos del Plan Estatal 2026-2030',
    'Selector de tipo de municipio: ≤10.000 hab, 10.001-20.000 con despoblación, o >20.000',
    'Estima orientativamente la ayuda: mín(15.000€, precio × 20%)',
    'Aviso claro de que las convocatorias de CCAA están previstas para el 2º semestre de 2026',
    'Explicación de los pasos a seguir cuando se abran las convocatorias',
    'Actualizado según Real Decreto 326/2026, de 22 de abril',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto dinero da la ayuda para comprar una vivienda en un pueblo en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Plan Estatal de Vivienda 2026-2030 (RD 326/2026) establece una ayuda de hasta 15.000 euros para comprar la primera vivienda en municipios de hasta 10.000 habitantes. El importe no puede superar el 20% del precio de compra, por lo que para viviendas de menos de 75.000 euros la ayuda será inferior a 15.000 euros. Las convocatorias de cada Comunidad Autónoma están previstas para el segundo semestre de 2026.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué municipios son elegibles para la ayuda de primera vivienda rural 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son elegibles los municipios de hasta 10.000 habitantes. Además, municipios de hasta 20.000 habitantes pueden incluirse cuando han experimentado pérdida de población, según lo que determine cada Comunidad Autónoma en su convocatoria. Los municipios de más de 20.000 habitantes quedan fuera de esta ayuda específica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los requisitos para pedir la ayuda de vivienda rural 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los requisitos básicos del Plan Estatal son: tener 35 años o menos, que sea la primera vivienda en propiedad, que el municipio tenga 10.000 habitantes o menos (o hasta 20.000 con pérdida de población), y que la vivienda se destine a residencia habitual y permanente. Cada Comunidad Autónoma puede añadir requisitos adicionales en su convocatoria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se puede solicitar la ayuda de 15.000 euros para comprar vivienda en pueblo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Real Decreto 326/2026 entró en vigor el 23 de abril de 2026, pero la tramitación depende de cada Comunidad Autónoma, que debe publicar su propia convocatoria. Las CCAA tienen previsto abrir sus convocatorias durante el segundo semestre de 2026. Hasta entonces no es posible presentar solicitudes. Consulta el portal de vivienda de tu Comunidad Autónoma para conocer el estado actualizado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Si la vivienda cuesta 50.000 euros cuánta ayuda recibiría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para una vivienda de 50.000 euros, el 20% sería 10.000 euros. Como 10.000 < 15.000 (el tope máximo), la ayuda orientativa sería de 10.000 euros. Solo a partir de un precio de compra de 75.000 euros se aplica el tope máximo de 15.000 euros (el 20% de 75.000 son exactamente 15.000 euros).',
      },
    },
  ],
};
