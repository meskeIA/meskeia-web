import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Vivienda — ¿Piso, casa, ático o estudio? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de vivienda se adapta mejor a tu situación: piso estándar, casa unifamiliar, ático/dúplex, estudio/apartamento o piso compartido. Análisis según familia, presupuesto y estilo de vida.',
  keywords: ['qué tipo de vivienda comprar', 'piso o casa unifamiliar', 'ático o piso estándar', 'estudio o piso', 'vivienda para familia España', 'piso compartido o propio', 'casa con jardín o piso', 'tipo de vivienda según presupuesto', 'dónde vivir con hijos España', 'comprar o alquilar qué tipo'],
  openGraph: {
    title: '¿Piso, casa o ático? Test de tipo de vivienda | meskeIA',
    description: 'Descubre qué tipo de vivienda se adapta mejor a tu familia, presupuesto y estilo de vida con este test de 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-tipo-vivienda/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Piso, casa o ático? Test de vivienda | meskeIA',
    description: 'Test de 10 preguntas para elegir entre piso, casa unifamiliar, ático, estudio o piso compartido.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-tipo-vivienda/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Tipo de Vivienda',
      description: 'Test orientativo para saber qué tipo de vivienda (piso, casa unifamiliar, ático/dúplex, estudio o compartido) se adapta mejor al perfil familiar, presupuesto y estilo de vida.',
      url: 'https://meskeia.com/selector-tipo-vivienda/',
      features: [
        'Test de 10 preguntas sobre familia y estilo de vida',
        '5 tipos: piso estándar, casa unifamiliar, ático/dúplex, estudio, compartido',
        'Análisis de presupuesto, tamaño familiar y preferencias',
        'Orientación sobre ventajas e inconvenientes',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Vivienda",
  description: "Test de 10 preguntas para saber qué tipo de vivienda se adapta mejor a tu situación: piso estándar, casa unifamiliar, ático/dúplex, estudio/apartamento o piso compartido. Análisis según familia, presu",
  url: "https://meskeia.com/selector-tipo-vivienda/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un piso estándar y un ático?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un piso estándar es una vivienda en planta intermedia de un edificio, generalmente más económica y con menor exposición solar directa en la terraza. Un ático se encuentra en la última planta y suele incluir terraza privada o azotea, mayor luminosidad y mejores vistas. El precio de un ático puede ser entre un 20% y un 40% superior al de un piso equivalente en la misma zona, y los gastos de climatización también suelen ser más elevados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo compensa más una casa unifamiliar que un piso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una casa unifamiliar compensa cuando se tiene familia numerosa, mascotas, necesidad de espacio exterior o se valora la privacidad y el silencio. Suele ser más económica por metro cuadrado en zonas periurbanas o rurales, pero implica gastos adicionales de mantenimiento (jardín, piscina, tejado) y menor accesibilidad a servicios urbanos. Para quienes trabajan en remoto o tienen hijos en edad escolar con colegio cercano, la relación calidad-precio puede ser muy favorable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es adecuado un estudio o apartamento de menos de 40 m²?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un estudio es adecuado para personas que viven solas, estudiantes, jóvenes profesionales o personas que pasan poco tiempo en casa. Son más asequibles en compra y alquiler, y los gastos de comunidad y suministros son menores. Sin embargo, resultan incómodos para parejas con teletrabajo o para quien necesite separación entre zonas de descanso y trabajo. La organización del espacio es clave para que sean habitables a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de vivienda es mejor para una familia con hijos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las familias con hijos suelen beneficiarse de pisos de 3 o más habitaciones en zonas con buenos colegios y parques cercanos, o de casas unifamiliares si el presupuesto y la ubicación lo permiten. Los áticos con terraza también son una opción valorada. Lo más importante es considerar la proximidad a colegios, zonas de juego y transporte público, además del número de habitaciones y el espacio de almacenaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hay que tener en cuenta al elegir entre comprar y alquilar según el tipo de vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al comprar, el tipo de vivienda condiciona la hipoteca, los gastos de mantenimiento y la revalorización futura. Las casas unifamiliares suelen revalorizarse más en zonas en crecimiento, pero son menos líquidas. Los pisos en ciudades medianas o grandes tienen mayor demanda en el mercado de alquiler y venta. Al alquilar, la elección del tipo de vivienda depende principalmente del presupuesto mensual y de la duración prevista de la estancia en esa ciudad.',
      },
    },
  ],
};
