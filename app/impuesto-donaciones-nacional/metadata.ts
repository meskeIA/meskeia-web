import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora Impuesto de Donaciones Régimen Común España 2025 - Gratis | meskeIA',
  description:
    'Calcula el Impuesto de Donaciones en España (régimen común) con bonificaciones autonómicas actualizadas 2025. Válido para Madrid, Andalucía, Galicia y 11 comunidades más.',
  keywords: [
    'impuesto donaciones españa',
    'calculadora donaciones',
    'régimen común donaciones',
    'bonificaciones autonómicas',
    'donaciones madrid',
    'donaciones andalucía',
    'donaciones galicia',
    'impuesto sobre donaciones',
    'tarifa estatal donaciones',
    'coeficientes multiplicadores',
    'reducción parentesco',
    'reducción discapacidad',
    'bonificación 99%',
    'donaciones comunidades autónomas',
    'meskeIA',
  ],
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Calculadora Impuesto de Donaciones Régimen Común España 2025 - Gratis | meskeIA',
    description:
      'Calcula el Impuesto de Donaciones con bonificaciones autonómicas de 14 comunidades. Herramienta gratuita actualizada 2025.',
    type: 'website',
    url: 'https://meskeia.com/impuesto-donaciones-nacional/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Impuesto de Donaciones Régimen Común España - meskeIA',
    description:
      'Calcula el impuesto de donaciones con bonificaciones autonómicas. Gratis y actualizado 2025.',
  },
};

// JSON-LD para Schema.org
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora Impuesto de Donaciones Régimen Común España',
  description:
    'Calculadora del Impuesto sobre Donaciones para régimen común de España (14 comunidades autónomas) con bonificaciones autonómicas actualizadas 2025.',
  url: 'https://meskeia.com/impuesto-donaciones-nacional',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
  },
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  featureList: [
    'Cálculo completo del Impuesto de Donaciones régimen común',
    'Bonificaciones autonómicas de 14 comunidades (Madrid, Andalucía, Galicia, Murcia, Valencia, Extremadura, Canarias, Castilla y León, La Rioja, Castilla-La Mancha, Cantabria, Aragón, Baleares, Asturias)',
    'Reducciones estatales por parentesco (15.956,87 € para Grupos I y II)',
    'Reducción adicional por edad para descendientes menores de 21 años',
    'Reducción por discapacidad (47.858,59 € o 150.253,03 €)',
    'Reducción especial Asturias (300.000 € en base imponible)',
    'Tarifa estatal progresiva (7,65% - 19,35%)',
    'Coeficientes multiplicadores por patrimonio preexistente',
    'Normativa actualizada 2025',
  ],
};

// FAQ JSON-LD
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué comunidades autónomas usan el régimen común de donaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '14 comunidades autónomas: Madrid, Andalucía, Galicia, Región de Murcia, Comunidad Valenciana, Extremadura, Canarias, Castilla y León, La Rioja, Castilla-La Mancha, Cantabria, Aragón, Islas Baleares y Principado de Asturias. NO aplica para Cataluña, País Vasco y Navarra (régimen foral propio).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las reducciones estatales por parentesco en donaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Grupo I (cónyuge, descendientes <21): 15.956,87 €. Grupo II (descendientes ≥21, ascendientes): 15.956,87 €. Grupo III (hermanos, tíos, sobrinos): 7.993,46 €. Grupo IV (colaterales ≥4º grado, extraños): 0 €. Además, descendientes menores de 21 años tienen reducción adicional de 3.990,72 € por cada año que le falte para cumplir 21.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué bonificaciones autonómicas existen en donaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Madrid, Andalucía, Galicia, Murcia, Castilla-La Mancha y La Rioja: 99% bonificación para Grupos I y II. Valencia y Extremadura: 75% bonificación para Grupos I y II. Canarias: 99,9% bonificación para Grupos I y II. Asturias: sin bonificación pero reducción de 300.000 € en base imponible. Aragón, Cantabria, Baleares: 0% bonificación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la tarifa estatal del Impuesto de Donaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tarifa progresiva estatal: 7,65% (0-7.993,46 €), 8,50% (7.993,46-31.956,87 €), 9,35% (31.956,87-79.893,43 €), 10,35% (79.893,43-239.389,19 €), 11,35% (239.389,19-398.981,96 €), 15,85% (398.981,96-797.555,08 €), 19,35% (más de 797.555,08 €).',
      },
    },
  ],
};

// Breadcrumb JSON-LD
export const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'meskeIA',
      item: 'https://meskeia.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Finanzas y Fiscalidad',
      item: 'https://meskeia.com/#finanzas-fiscalidad',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Calculadora Impuesto Donaciones Régimen Común',
      item: 'https://meskeia.com/impuesto-donaciones-nacional',
    },
  ],
};
