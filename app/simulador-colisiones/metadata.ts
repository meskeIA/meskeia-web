import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Colisiones — Elásticas e Inelásticas en 1D | meskeIA',
  description:
    'Simula colisiones elásticas e inelásticas en 1D: ajusta masas, velocidades y coeficiente de restitución. Visualiza la conservación del momento lineal y la variación de energía cinética. Para Bachillerato y selectividad.',
  keywords:
    'simulador colisiones, colisión elástica inelástica, momento lineal, coeficiente de restitución, conservación momento, energía cinética colisión, física bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Colisiones — Elásticas e Inelásticas',
    description:
      'Ajusta masas, velocidades y coeficiente de restitución. Ve la animación de la colisión y comprueba la conservación del momento lineal y la variación de energía cinética.',
    url: 'https://meskeia.com/simulador-colisiones',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Colisiones | meskeIA',
    description: 'Colisiones elásticas e inelásticas con animación interactiva. Momento lineal y energía cinética.',
  },
  other: {
    'application-name': 'Simulador Colisiones meskeIA',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una colisión elástica y una inelástica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una colisión elástica (coeficiente de restitución e = 1) se conservan tanto el momento lineal como la energía cinética total. En una colisión inelástica (0 < e < 1) se conserva el momento pero parte de la energía cinética se transforma en calor, sonido o deformación. En el caso límite perfectamente inelástico (e = 0), los dos objetos quedan unidos y se mueven juntos tras el choque.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el coeficiente de restitución y qué valores puede tomar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coeficiente de restitución (e) mide la proporción entre la velocidad relativa de separación y la de aproximación tras el choque. Varía entre 0 (colisión perfectamente inelástica, objetos que se pegan) y 1 (colisión perfectamente elástica, sin pérdida de energía). Materiales como el acero tienen e ≈ 0,9, mientras que la plastilina se aproxima a e ≈ 0.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se conserva el momento lineal en una colisión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El principio de conservación del momento lineal establece que, si no actúan fuerzas externas sobre el sistema, el momento total antes de la colisión (m₁v₁ + m₂v₂) es igual al momento total después (m₁v₁\' + m₂v₂\'). El simulador calcula y muestra los momentos antes y después para que puedas verificarlo con cualquier combinación de masas y velocidades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas es útil este simulador de colisiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para Física de 2.º de Bachillerato (dinámica y cantidad de movimiento) y para preparar problemas de selectividad sobre colisiones. También resulta práctico en primero de ingeniería o física universitaria para visualizar los resultados antes de resolverlos analíticamente con las ecuaciones de choque.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre con la energía cinética en una colisión perfectamente inelástica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una colisión perfectamente inelástica, la pérdida de energía cinética es máxima: parte de esa energía se disipa en deformación plástica, calor y sonido. La energía cinética del sistema tras el choque es la mínima compatible con la conservación del momento lineal. El simulador muestra el porcentaje de energía disipado en cada caso.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Colisiones',
  description:
    'Simulador interactivo de colisiones en 1D: elásticas, inelásticas y perfectamente inelásticas. Ajusta masas (1–20 kg), velocidades iniciales y coeficiente de restitución (0–1). Animación del choque y cálculo de velocidades finales, momento lineal y energía cinética antes y después.',
  url: 'https://meskeia.com/simulador-colisiones/',
  features: [
    'Colisiones elásticas (e=1), inelásticas (0<e<1) y perfectamente inelásticas (e=0)',
    'Sliders de masa (1–20 kg) y velocidad (−10 a +10 m/s) para cada objeto',
    'Coeficiente de restitución ajustable con clasificación automática del tipo de colisión',
    'Animación SVG del choque con fases pre-colisión, impacto y post-colisión',
    'Cálculo de momento lineal total y energía cinética antes y después',
    'Ideal para Bachillerato Física y preparación de selectividad',
  ],
});
