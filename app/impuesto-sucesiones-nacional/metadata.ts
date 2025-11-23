import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora Impuesto de Sucesiones Régimen Común España 2025 - Gratis | meskeIA',
  description:
    'Calcula el Impuesto de Sucesiones en España (régimen común) con bonificaciones autonómicas actualizadas 2025. Válido para 14 comunidades autónomas excepto Cataluña, País Vasco y Navarra.',
  keywords: [
    'impuesto sucesiones españa',
    'herencia régimen común',
    'bonificaciones autonómicas sucesiones',
    'madrid sucesiones',
    'andalucía herencias',
    'galicia sucesiones',
    'tarifa estatal sucesiones',
    'coeficientes multiplicadores',
    'reducción vivienda habitual',
    'reducción discapacidad',
    'bonificación 99%',
    'sucesiones comunidades autónomas',
    'meskeIA',
  ],
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Calculadora Impuesto de Sucesiones Régimen Común España 2025 - Gratis | meskeIA',
    description:
      'Calcula el Impuesto de Sucesiones con bonificaciones autonómicas de 14 comunidades. Herramienta gratuita actualizada 2025.',
    type: 'website',
    url: 'https://meskeia.com/impuesto-sucesiones-nacional/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Impuesto de Sucesiones Régimen Común España - meskeIA',
    description:
      'Calcula el impuesto de sucesiones con bonificaciones autonómicas. Gratis y actualizado 2025.',
  },
};

// JSON-LD para Schema.org
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora Impuesto de Sucesiones Régimen Común España',
  description:
    'Calculadora del Impuesto de Sucesiones para régimen común de España (14 comunidades autónomas) con bonificaciones autonómicas actualizadas 2025.',
  url: 'https://meskeia.com/impuesto-sucesiones-nacional',
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
    'Cálculo completo del Impuesto de Sucesiones régimen común',
    'Bonificaciones autonómicas de 14 comunidades (Madrid, Andalucía, Galicia, Murcia, Valencia, Extremadura, Canarias, Castilla y León, La Rioja, Castilla-La Mancha, Cantabria, Aragón, Baleares, Asturias)',
    'Reducciones estatales por parentesco (15.956,87 € para Grupos I y II)',
    'Reducción adicional por edad para descendientes menores de 21 años',
    'Reducción por discapacidad (47.858,59 € o 150.253,03 €)',
    'Reducción vivienda habitual estatal (95% máx. 122.606,47 €)',
    'Reducción especial Asturias (300.000 € en base imponible)',
    'Tarifa estatal progresiva (7,65% - 25,50%)',
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
      name: '¿Qué comunidades autónomas usan el régimen común de sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '14 comunidades autónomas: Madrid, Andalucía, Galicia, Región de Murcia, Comunidad Valenciana, Extremadura, Canarias, Castilla y León, La Rioja, Castilla-La Mancha, Cantabria, Aragón, Islas Baleares y Principado de Asturias. NO aplica para Cataluña, País Vasco y Navarra (régimen foral propio).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las reducciones estatales por parentesco en sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Grupo I (cónyuge, descendientes <21): 15.956,87 €. Grupo II (descendientes ≥21, ascendientes): 15.956,87 €. Grupo III (hermanos, tíos, sobrinos): 7.993,46 €. Grupo IV (colaterales ≥4º grado, extraños): 0 €. Además, descendientes menores de 21 años tienen reducción adicional de 3.990,72 € por cada año que le falte para cumplir 21.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué bonificaciones autonómicas existen en sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Madrid: 99% Grupos I/II, 50% Grupo III. Andalucía, Galicia: 99% Grupos I/II hasta 1M€. Murcia: 99% Grupos I/II, 50% Grupo III. Valencia, Castilla y León, Extremadura: 99% Grupos I/II. Canarias: 99,9% Grupos I/II/III. La Rioja: 99% (98% si base >500K). Castilla-La Mancha: 100%-80% escalonado. Cantabria: 100% hasta 100K, 99% resto. Aragón: 100% hasta 3M€. Baleares: 99% Grupo I, 95% Grupo II. Asturias: reducción 300K€ en base imponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la tarifa estatal del Impuesto de Sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tarifa progresiva estatal: 7,65% (0-7.993,46 €), 8,50% (7.993,46-31.956,87 €), 9,35% (31.956,87-79.881,18 €), 10,20% (79.881,18-239.389,13 €), 15,30% (239.389,13-398.777,54 €), 21,25% (398.777,54-797.555,08 €), 25,50% (más de 797.555,08 €).',
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
      name: 'Calculadora Impuesto Sucesiones Régimen Común',
      item: 'https://meskeia.com/impuesto-sucesiones-nacional',
    },
  ],
};
