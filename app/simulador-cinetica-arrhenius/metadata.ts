import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Cinética Química: Ecuación de Arrhenius | meskeIA',
  description: 'Visualiza cómo la temperatura acelera exponencialmente las reacciones químicas. Distribución de Maxwell-Boltzmann, energía de activación y constante k(T) en directo.',
  keywords: 'cinética química, ecuación de Arrhenius, energía de activación, Maxwell-Boltzmann, constante de velocidad, catalizador, temperatura, reacción química, EBAU, Bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-cinetica-arrhenius/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Cinética Química: Arrhenius | meskeIA',
    description: 'Mueve la temperatura y observa cómo la cola reactiva de la distribución de Maxwell-Boltzmann crece exponencialmente.',
    url: 'https://meskeia.com/simulador-cinetica-arrhenius/',
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
    title: 'Simulador de Cinética Química: Arrhenius | meskeIA',
    description: 'La regla del +10 °C, la barrera de activación y la magia de los catalizadores, todo visual.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Cinética Química: Ecuación de Arrhenius',
  description: 'Simulador interactivo de la cinética de reacciones químicas según la ecuación de Arrhenius k = A·exp(-Ea/RT). Visualiza la distribución de energías moleculares de Maxwell-Boltzmann a una temperatura T y la barrera de activación Ea: el área bajo la cola a la derecha de Ea es la fracción de moléculas con energía suficiente para reaccionar. Permite comparar dos temperaturas, calcular el factor de aceleración k(T₂)/k(T₁), trazar la recta de Arrhenius (ln k vs 1/T) y partir de 5 reacciones reales predefinidas. Ideal para EBAU de Química, Bachillerato y primero de Universidad.',
  url: 'https://meskeia.com/simulador-cinetica-arrhenius/',
  category: 'EducationalApplication',
  features: [
    'Distribución de Maxwell-Boltzmann en directo, función de la temperatura',
    'Visualización de la barrera de activación Ea sobre la curva',
    'Cálculo de la constante k a la temperatura T',
    'Comparación entre dos temperaturas y factor de aceleración',
    'Recta de Arrhenius (ln k vs 1/T) — pendiente −Ea/R',
    '5 reacciones predefinidas con valores de Ea reales',
    'Tiempo de vida media para reacciones de primer orden',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['cinética química', 'Arrhenius', 'energía activación', 'Maxwell-Boltzmann', 'EBAU', 'Bachillerato', 'química'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la ecuación de Arrhenius y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ecuación de Arrhenius (k = A·e^(-Ea/RT)) describe cómo varía la constante de velocidad de una reacción química con la temperatura. Permite predecir cuánto más rápida será una reacción al aumentar la temperatura y calcular la energía de activación Ea que deben superar las moléculas para reaccionar. Es fundamental en química industrial, farmacología y procesos biológicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué aumentar la temperatura acelera las reacciones químicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al aumentar la temperatura, las moléculas se mueven más rápido y la distribución de energías cinéticas (Maxwell-Boltzmann) se desplaza hacia valores más altos. Esto hace que una fracción mucho mayor de moléculas supere la barrera de activación Ea en cada colisión. Según la regla aproximada de Van\'t Hoff, por cada 10 °C de aumento la velocidad de reacción se duplica, aunque el factor exacto depende de la Ea de cada reacción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la energía de activación y cómo se mide experimentalmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La energía de activación (Ea) es la energía mínima que deben tener las moléculas para que una colisión resulte en reacción. Se mide experimentalmente midiendo la constante de velocidad k a varias temperaturas y trazando la recta de Arrhenius: la gráfica de ln(k) frente a 1/T es una línea recta cuya pendiente es −Ea/R, donde R = 8,314 J/(mol·K). Valores típicos de Ea van de 40 a 200 kJ/mol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo actúa un catalizador según la teoría de Arrhenius?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un catalizador proporciona un camino de reacción alternativo con una energía de activación menor, lo que aumenta exponencialmente la constante de velocidad k sin cambiar la temperatura. No altera el equilibrio termodinámico ni los productos, pero permite que la reacción llegue al equilibrio mucho más deprisa. En el simulador se puede observar cómo reducir Ea desplaza la barrera hacia la izquierda en la distribución de Maxwell-Boltzmann.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está diseñado principalmente para estudiantes de química en el último año de educación secundaria (equivalente a Bachillerato en España o preparatoria en Latinoamérica) y para primeros cursos universitarios de química o ingeniería. También resulta útil para cualquier persona que quiera comprender visualmente por qué el fuego prende más rápido a mayor temperatura, por qué los alimentos se conservan mejor en el frigorífico o cómo funcionan los catalizadores industriales.',
      },
    },
  ],
};
