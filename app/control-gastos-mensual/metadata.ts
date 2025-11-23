import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Control de Gastos Mensual | Gestor de Finanzas Personales - meskeIA',
  description:
    '¿Dónde va tu dinero cada mes? Controla gastos e ingresos con categorías visuales, balance automático y descarga de informes. 100% privado, sin registro, datos en tu navegador.',
  keywords: [
    'control gastos',
    'gestor finanzas personales',
    'presupuesto mensual',
    'balance ingresos gastos',
    'categorias gastos',
    'app finanzas gratis',
    'control presupuesto',
    'gastos mensuales',
    'ahorro personal',
  ],
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Control de Gastos Mensual | Gestor de Finanzas Personales - meskeIA',
    description:
      'Controla tus gastos e ingresos mensuales. Gestiona tu presupuesto personal de forma simple, visual y privada.',
    type: 'website',
    url: 'https://meskeia.com/control-gastos-mensual/',
    images: [
      {
        url: 'https://meskeia.com/icon_meskeia.png',
        alt: 'meskeIA Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Control de Gastos Mensual - meskeIA',
    description:
      'Gestiona tu presupuesto personal de forma simple y visual. 100% privado.',
  },
};

// JSON-LD para Schema.org
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Control de Gastos Mensual',
  description:
    'Aplicación para gestionar gastos e ingresos mensuales, con categorización y balance visual',
  url: 'https://meskeia.com/control-gastos-mensual/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  creator: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};

// Breadcrumb JSON-LD
export const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: 'https://meskeia.com/',
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
      name: 'Control de Gastos Mensual',
      item: 'https://meskeia.com/control-gastos-mensual/',
    },
  ],
};

// FAQ JSON-LD
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Mis datos son privados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, completamente. Todos tus datos se guardan únicamente en tu navegador usando localStorage. No se envía ninguna información a servidores externos. Tienes control total de tu información financiera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar la app sin conexión a internet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, funciona 100% offline. No requiere conexión a internet para registrar gastos, ver tu balance o consultar el historial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo categorizo mis gastos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al añadir un gasto, seleccionas una categoría de la lista predefinida: Vivienda, Alimentación, Transporte, Salud, Ocio, Ropa, Suscripciones u Otros. Esto te permite analizar en qué gastas más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo exportar mis datos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, tienes 2 opciones: (1) Exportar el mes actual a CSV para Excel/Google Sheets, (2) Exportar TODO a JSON para backup completo de todos los meses. También puedes importar backups JSON para restaurar tus datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo hago backup de mis datos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usa el botón \'Exportar TODO a JSON\' para descargar un backup completo con todos los meses y transacciones. Guarda este archivo en tu nube (Google Drive, Dropbox) y podrás restaurarlo con \'Importar desde JSON\'.',
      },
    },
  ],
};
