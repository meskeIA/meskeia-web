import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Equilibrio Químico - Le Chatelier | meskeIA',
  description: 'Simula el equilibrio químico y aplica el Principio de Le Chatelier: cambia concentración, temperatura o presión y observa cómo se desplaza la reacción. Química Bachillerato.',
  keywords: 'equilibrio químico, Le Chatelier, Kc, cociente de reacción, perturbación equilibrio, Haber-Bosch, química bachillerato, principio Le Chatelier',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-equilibrio-quimico/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Equilibrio Químico | meskeIA',
    description: 'Aplica Le Chatelier de forma interactiva en 6 reacciones reversibles famosas',
    url: 'https://meskeia.com/simulador-equilibrio-quimico/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Equilibrio Químico | meskeIA',
    description: 'Aprende equilibrio químico con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Equilibrio Químico y Le Chatelier',
  description:
    'Simulador interactivo del equilibrio químico. Elige una reacción reversible (Haber, contacto, esterificación, etc.), aplica perturbaciones de concentración, temperatura o presión y observa el desplazamiento del equilibrio.',
  url: 'https://meskeia.com/simulador-equilibrio-quimico/',
  category: 'EducationalApplication',
  features: [
    '6 reacciones reversibles famosas (Haber-Bosch, contacto, esterificación, etc.)',
    'Aplicación interactiva del Principio de Le Chatelier',
    'Perturbaciones: añadir/quitar especies, ΔT, ΔP, catalizador',
    'Cálculo del cociente Q y comparación con Kc',
    'Gráfico de concentraciones vs tiempo',
    'Predicción visual del desplazamiento',
    'En español',
  ],
  keywords: ['equilibrio químico', 'Le Chatelier', 'Kc', 'química bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el equilibrio químico y cuándo se alcanza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El equilibrio químico se alcanza cuando las velocidades de la reacción directa e inversa se igualan, de modo que las concentraciones de reactivos y productos permanecen constantes. No significa que la reacción se detenga, sino que avanza al mismo ritmo en ambas direcciones. Solo es posible en sistemas cerrados donde los productos no pueden escapar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice el Principio de Le Chatelier?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Principio de Le Chatelier establece que si un sistema en equilibrio recibe una perturbación exterior (cambio de concentración, temperatura o presión), el sistema se desplaza en la dirección que contrarresta esa perturbación para alcanzar un nuevo equilibrio. Por ejemplo, si se añade más reactivo, el equilibrio se desplaza hacia los productos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la constante de equilibrio Kc y qué indica su valor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kc es el cociente entre las concentraciones de productos y reactivos elevadas a sus coeficientes estequiométricos en el equilibrio. Un valor de Kc >> 1 indica que el equilibrio favorece los productos; un Kc << 1 indica que favorece los reactivos. La Kc solo cambia con la temperatura, no con las concentraciones ni la presión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta un catalizador al equilibrio químico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un catalizador acelera tanto la reacción directa como la inversa en la misma proporción, por lo que no desplaza el equilibrio ni cambia el valor de Kc. Su único efecto es que el sistema alcanza el equilibrio más rápidamente. En la industria (proceso Haber-Bosch para el amoniaco) el catalizador es esencial para que la producción sea viable a escala comercial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es útil este simulador de equilibrio químico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este simulador es especialmente útil para estudiantes de segundo curso de química de educación secundaria superior (bachillerato o equivalente) y primeros cursos universitarios de química general. Cubre los contenidos estándar de equilibrio químico, Le Chatelier, cálculo del cociente Q y análisis de reacciones industriales como Haber-Bosch o el proceso de contacto.',
      },
    },
  ],
};
