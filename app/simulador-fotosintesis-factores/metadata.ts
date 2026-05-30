import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Fotosíntesis: Factores Limitantes - Ley de Blackman | meskeIA',
  description:
    'Simula la fotosíntesis y descubre qué factor limita la tasa: luz, CO₂ o temperatura. Basado en la Ley de Blackman y funciones Michaelis-Menten. Ideal para Bachillerato y EBAU.',
  keywords:
    'fotosíntesis, factores limitantes, ley de Blackman, luz, CO2, temperatura, cloroplasto, EBAU, Bachillerato, biología, tasa fotosíntesis, Michaelis-Menten, simulador biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Fotosíntesis: Factores Limitantes | meskeIA',
    description:
      'Explora cómo la luz, el CO₂ y la temperatura determinan la tasa de fotosíntesis según la Ley de Blackman. Visualiza qué factor es el limitante en tiempo real.',
    url: 'https://meskeia.com/simulador-fotosintesis-factores',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Fotosíntesis: Factores Limitantes | meskeIA',
    description:
      'Descubre qué limita la fotosíntesis: luz, CO₂ o temperatura. Simulador interactivo basado en la Ley de Blackman para Bachillerato y EBAU.',
  },
  other: {
    'application-name': 'Simulador Fotosíntesis Factores meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Fotosíntesis: Factores Limitantes',
  description:
    'Simulador interactivo que modela la tasa de fotosíntesis según los tres factores limitantes principales: intensidad lumínica, concentración de CO₂ y temperatura. Basado en la Ley de Blackman y funciones de saturación Michaelis-Menten. Ideal para estudiantes de Biología de Bachillerato y preparación de EBAU.',
  url: 'https://meskeia.com/simulador-fotosintesis-factores/',
  category: 'EducationalApplication',
  keywords: [
    'fotosíntesis',
    'factores limitantes',
    'ley de Blackman',
    'luz',
    'CO2',
    'temperatura',
    'Bachillerato',
    'EBAU',
    'biología',
  ],
  features: [
    'Modelo matemático con funciones Michaelis-Menten para cada factor',
    'Identificación automática del factor limitante en tiempo real',
    'Animación de producción de O₂ proporcional a la tasa de fotosíntesis',
    'Visualización de barras de progreso por factor con resaltado del limitante',
    'Bloque educativo completo con tabla comparativa, FAQ y guía de experimentos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los factores limitantes de la fotosíntesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los factores limitantes de la fotosíntesis son aquellos cuya escasez reduce la tasa fotosintética aunque los demás estén en abundancia. Los tres principales son la intensidad lumínica, la concentración de CO₂ y la temperatura. La Ley de Blackman (1905) establece que la tasa de un proceso biológico está controlada por el factor que se encuentra en menor proporción relativa respecto a su óptimo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice la Ley de Blackman y cómo se aplica a la fotosíntesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Ley de Blackman afirma que cuando varios factores influyen en un proceso, la tasa está limitada por el factor más restrictivo. En fotosíntesis esto significa que aumentar la luz no mejora el rendimiento si hay poco CO₂ o la temperatura es subóptima. Para maximizar la producción vegetal hay que elevar simultáneamente todos los factores limitantes, algo que se aplica en invernaderos agrícolas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la temperatura a la fotosíntesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La temperatura controla la velocidad de las enzimas del ciclo de Calvin, especialmente la RuBisCO. A temperaturas bajas (<10 °C) las reacciones son muy lentas. Entre 25-30 °C suele alcanzarse el óptimo para la mayoría de plantas C3. Por encima de 35-40 °C las enzimas se desnaturalizan y la fotosíntesis cae drásticamente. La fotorespiración también aumenta con el calor, reduciendo el rendimiento neto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre las reacciones de la luz y el ciclo de Calvin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las reacciones de la luz ocurren en los tilacoides del cloroplasto y convierten energía lumínica en ATP y NADPH, liberando O₂ al descomponer agua. El ciclo de Calvin (reacciones oscuras) tiene lugar en el estroma y usa ese ATP y NADPH para fijar CO₂ y sintetizar glucosa. La luz es indispensable para la primera etapa; la temperatura y el CO₂ limitan principalmente la segunda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se modela matemáticamente la tasa de fotosíntesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un modelo habitual usa funciones de saturación tipo Michaelis-Menten para cada factor: tasa = Vmax × [factor] / (Km + [factor]). Esto captura el comportamiento de saturación observado experimentalmente: la tasa crece al aumentar el factor pero se aplana al alcanzar la capacidad máxima del sistema. El factor limitante global es el que produce el valor mínimo de los tres términos multiplicados o el más restrictivo según el modelo de Blackman estricto.',
      },
    },
  ],
};
