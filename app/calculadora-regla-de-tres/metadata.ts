import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Regla de Tres - Simple, Inversa y Compuesta | meskeIA',
  description: 'Calculadora online de regla de tres simple directa, inversa y compuesta. Resuelve proporciones con explicaciones paso a paso y ejemplos prácticos. Gratis y sin registro.',
  keywords: 'regla de tres, regla de tres simple, regla de tres inversa, regla de tres compuesta, proporciones, calculadora proporciones, matematicas, proporcion directa, proporcion inversa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Regla de Tres - Simple, Inversa y Compuesta',
    description: 'Resuelve proporciones con regla de tres simple, inversa y compuesta. Explicaciones paso a paso y ejemplos prácticos.',
    url: 'https://meskeia.com/calculadora-regla-de-tres/',
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
    title: 'Calculadora Regla de Tres | meskeIA',
    description: 'Resuelve proporciones con regla de tres simple, inversa y compuesta',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Regla de Tres meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Regla de Tres",
  description: "Calculadora online de regla de tres simple directa, inversa y compuesta. Resuelve proporciones con explicaciones paso a paso y ejemplos prácticos. Gratis y sin registro.",
  url: "https://meskeia.com/calculadora-regla-de-tres/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la regla de tres y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla de tres es un método matemático para resolver proporciones cuando se conocen tres valores y se busca un cuarto. Se usa en situaciones cotidianas como calcular precios, mezclar ingredientes, convertir unidades o ajustar recetas. Es uno de los procedimientos de cálculo más utilizados en la vida diaria y en muchas profesiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre regla de tres directa e inversa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la regla de tres directa, al aumentar una cantidad la otra también aumenta (por ejemplo, más kilos = más precio). En la inversa, al aumentar una cantidad la otra disminuye (por ejemplo, más trabajadores = menos días para completar una obra). La fórmula directa es x = (b × c) / a, mientras que en la inversa es x = (a × b) / c.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se resuelve una regla de tres compuesta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla de tres compuesta involucra más de dos magnitudes relacionadas. Se resuelve encadenando varias reglas de tres simples o mediante una tabla de proporciones. Por ejemplo, si 3 máquinas producen 150 piezas en 5 horas, ¿cuántas piezas producen 5 máquinas en 8 horas? Se analizan las relaciones (directa o inversa) de cada magnitud por separado y se combinan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué perfil de usuario es útil esta calculadora de proporciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de primaria, secundaria y bachillerato que practican matemáticas, para profesionales en cocina (ajustar recetas), construcción (mezclas de materiales), comercio (precios y descuentos) o cualquier persona que necesite resolver proporciones de forma rápida y con explicación del proceso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se comprueba si el resultado de una regla de tres es correcto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para verificar una regla de tres directa, comprueba que los dos cocientes sean iguales: a/b = c/x (o bien a×x = b×c). En la inversa, los productos cruzados deben ser iguales en su relación: a×c = b×x. La herramienta muestra el procedimiento paso a paso para que puedas seguir la lógica y detectar errores en tus propios cálculos.',
      },
    },
  ],
};
