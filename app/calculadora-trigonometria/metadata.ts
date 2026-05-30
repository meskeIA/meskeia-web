import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Trigonometría - Seno, Coseno, Tangente | meskeIA',
  description: 'Calcula funciones trigonométricas, resuelve triángulos, convierte ángulos y aplica identidades. Herramienta completa de trigonometría.',
  keywords: 'trigonometría, seno, coseno, tangente, ángulos, radianes, grados, triángulos, identidades',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Trigonometría | meskeIA',
    description: 'Funciones trigonométricas, resolución de triángulos y conversión de ángulos.',
    url: 'https://meskeia.com/calculadora-trigonometria/',
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
    title: 'Calculadora de Trigonometría | meskeIA',
    description: 'Herramienta de trigonometría completa online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Trigonometría - Seno, Coseno, Tangente",
  description: "Calcula funciones trigonométricas, resuelve triángulos, convierte ángulos y aplica identidades. Herramienta completa de trigonometría.",
  url: 'https://meskeia.com/calculadora-trigonometria/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué funciones trigonométricas calcula esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Calcula las seis funciones trigonométricas principales: seno (sin), coseno (cos), tangente (tan) y sus recíprocas cosecante (csc), secante (sec) y cotangente (cot). También incluye las funciones inversas arcoseno, arcocoseno y arcotangente para obtener el ángulo a partir de la razón.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se convierten grados a radianes y viceversa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La conversión usa la relación π radianes = 180°. Para pasar de grados a radianes se multiplica por π/180; para pasar de radianes a grados se multiplica por 180/π. La calculadora permite introducir el ángulo en cualquiera de las dos unidades y convierte automáticamente antes de calcular la función.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo resolver un triángulo con esta calculadora trigonométrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Introduciendo los datos conocidos del triángulo (lados y ángulos) la herramienta aplica el teorema del seno y el teorema del coseno para calcular los elementos desconocidos. Es necesario proporcionar al menos tres datos (incluyendo un lado) para obtener la solución completa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las identidades trigonométricas y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las identidades trigonométricas son igualdades que se cumplen para cualquier valor del ángulo, como sin²θ + cos²θ = 1 o tan θ = sin θ / cos θ. Se usan para simplificar expresiones, demostrar igualdades y resolver ecuaciones trigonométricas. La calculadora muestra las identidades fundamentales como referencia al trabajar con cada función.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está indicada esta calculadora de trigonometría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensada para estudiantes de secundaria y bachillerato que estudian trigonometría por primera vez, y también para universitarios que necesitan resolver triángulos o verificar identidades en asignaturas de física, ingeniería o matemáticas. La interfaz es sencilla y no requiere conocimientos previos de programación ni notación matemática avanzada.',
      },
    },
  ],
};
