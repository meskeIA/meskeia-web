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
    'Calcula las 6 funciones trigonométricas: seno, coseno, tangente, cosecante, secante y cotangente',
    'Resolución de triángulos rectángulos con cualquier pareja de datos: dos lados, o un lado y un ángulo agudo',
    'Conversión entre grados, radianes y gradianes con resultado inmediato',
    'Acceso directo a ángulos notables: 0°, 30°, 45°, 60°, 90°, 180°, 270° y 360°',
    'Identidades evaluadas para tu ángulo: pitagórica, ángulo doble, ángulo mitad y suma y resta de ángulos',
    'Modo grados y modo radianes seleccionable en el mismo panel; en radianes admite múltiplos de π (π/2, 3π/4)',
    '12 casos numerados para clase con corrección de la respuesta y solución paso a paso',
    'Resultados con 8 decimales para cálculos de precisión en física e ingeniería',
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
        text: 'Calcula las seis funciones trigonométricas principales: seno (sin), coseno (cos), tangente (tan) y sus recíprocas cosecante (csc), secante (sec) y cotangente (cot). Indica el cuadrante del ángulo y marca como no definidas las razones que dividen entre cero, como tan 90°. No tiene un campo aparte para las funciones inversas: el modo Triángulo obtiene los ángulos con arcoseno, arcocoseno o arcotangente a partir de dos lados, y los casos para clase 6, 7 y 12 lo explican paso a paso.',
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
        text: 'Sí, si es un triángulo rectángulo. Basta con dos datos: dos lados, o un lado y un ángulo agudo. Con ellos calcula el resto de lados y ángulos con Pitágoras y SOH-CAH-TOA, además del área y el perímetro; si escribes más de dos datos, comprueba que sean compatibles. Los triángulos oblicuángulos (teorema del seno y del coseno) se explican en la guía de la página, pero la calculadora no los resuelve.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las identidades trigonométricas y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las identidades trigonométricas son igualdades que se cumplen para cualquier valor del ángulo, como sin²θ + cos²θ = 1 o tan θ = sin θ / cos θ. Se usan para simplificar expresiones, demostrar igualdades y resolver ecuaciones trigonométricas. La calculadora evalúa para el ángulo que escribas la identidad pitagórica y las de ángulo doble y ángulo mitad y, si das un segundo ángulo, las cuatro de suma y resta.',
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
