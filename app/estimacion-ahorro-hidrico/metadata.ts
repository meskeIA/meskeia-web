import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimación de Ahorro Hídrico - Ahorra Agua en Casa | meskeIA',
  description: 'Calcula cuánta agua y dinero puedes ahorrar en casa con hábitos sostenibles. Checklist interactivo con 10 acciones y ahorro estimado en litros y euros al año.',
  keywords: 'ahorro agua, consumo agua España, ahorrar agua casa, litros agua grifo, huella hidrica, ahorro hidrico, precio agua España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimación de Ahorro Hídrico - Ahorra Agua en Casa | meskeIA',
    description: 'Calcula cuánta agua y dinero puedes ahorrar adoptando hábitos sostenibles. 10 acciones con impacto real estimado.',
    url: 'https://meskeia.com/estimacion-ahorro-hidrico/',
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
    title: 'Estimación de Ahorro Hídrico | meskeIA',
    description: 'Descubre cuánta agua y dinero puedes ahorrar en casa con 10 hábitos sostenibles.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimación de Ahorro Hídrico meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Estimación de Ahorro Hídrico',
  description: 'Herramienta interactiva para estimar el ahorro anual de agua y dinero al adoptar hábitos sostenibles en el hogar. Incluye checklist de 10 acciones con impacto individualizado en litros y euros.',
  url: 'https://meskeia.com/estimacion-ahorro-hidrico/',
  features: [
    'Checklist interactivo de 10 hábitos de ahorro de agua',
    'Cálculo de ahorro en litros y euros por acción',
    'Ajuste por número de personas y precio del agua local',
    'Equivalencias visuales (bañeras, piscinas)',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánta agua se puede ahorrar en casa al año con hábitos sostenibles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un hogar promedio puede reducir su consumo entre 30.000 y 60.000 litros al año adoptando hábitos sencillos como cerrar el grifo mientras te lavas los dientes, instalar reductores de caudal o usar el lavavajillas con carga completa. El ahorro exacto depende del número de personas, el precio del agua en tu municipio y los hábitos actuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero se ahorra al reducir el consumo de agua en el hogar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España, el precio medio del agua doméstica ronda los 2 €/m³ (incluyendo tasas y alcantarillado), aunque varía mucho por municipio. Un hogar de 3 personas que adopta las principales medidas de ahorro puede reducir su factura entre 80 € y 180 € al año. Las acciones con mayor impacto económico son eliminar fugas, acortar las duchas y evitar el riego en horas de calor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué acciones ahorran más agua en casa de forma rápida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tres acciones con mayor impacto inmediato son: sustituir el baño de inmersión por ducha (ahorro de 100-150 litros por uso), detectar y reparar fugas en grifos y cisternas (una gota por segundo supone 30 litros/día), e instalar una cisterna de doble descarga (reduce el consumo por descarga de 9 a 3-6 litros). Estos cambios no requieren inversión significativa y el retorno es visible en pocas semanas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve una herramienta de estimación de ahorro hídrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este tipo de herramienta te permite identificar cuáles de tus hábitos actuales tienen mayor impacto en el consumo de agua y estimar, en litros y euros, lo que ahorrarías si los cambias. Es útil tanto para familias que quieren reducir la factura como para quienes buscan reducir su huella ambiental. Al personalizar el cálculo con el número de personas y el precio del agua local, los resultados son mucho más precisos que las estimaciones genéricas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la huella hídrica y cómo se calcula en el hogar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La huella hídrica mide la cantidad total de agua dulce utilizada, directa e indirectamente, para producir los bienes y servicios que consume una persona. En el hogar, el consumo directo (grifo, ducha, inodoro, lavadora) representa solo una parte: la dieta y los productos que compramos suelen suponer el 90% de la huella total. En España, el consumo doméstico directo ronda los 130 litros por persona y día, frente a una media mundial de 140 litros.',
      },
    },
  ],
};
