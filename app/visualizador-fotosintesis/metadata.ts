import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Fotosíntesis - De la Luz Solar a la Vida | meskeIA',
  description: 'Descubre cómo funciona la fotosíntesis paso a paso: fase luminosa, ciclo de Calvin, cloroplastos y datos de escala. Explicador visual interactivo de biología.',
  keywords: 'fotosíntesis, cloroplasto, ciclo Calvin, fase luminosa, clorofila, CO2, oxígeno, biología visual, plantas, energía solar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Fotosíntesis - De la Luz Solar a la Vida',
    description: 'El proceso que sostiene la vida en la Tierra, explicado visualmente paso a paso.',
    url: 'https://meskeia.com/visualizador-fotosintesis/',
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
    title: 'La Fotosíntesis - Explicador Visual',
    description: 'De un fotón a una molécula de glucosa: la fotosíntesis como nunca la habías visto.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fotosíntesis Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Fotosíntesis - De la Luz Solar a la Vida',
  description: 'Explicador visual interactivo sobre la fotosíntesis: ecuación general, fase luminosa, ciclo de Calvin y datos de escala planetaria. Diagramas animados del proceso completo.',
  url: 'https://meskeia.com/visualizador-fotosintesis/',
  category: 'EducationalApplication',
  features: [
    'Proceso completo de fotosíntesis paso a paso',
    'Fase luminosa con flujo de energía animado',
    'Ciclo de Calvin con diagrama circular interactivo',
    'Datos de escala: árboles, oxígeno, fitoplancton',
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
      name: '¿Qué es la fotosíntesis y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fotosíntesis es el proceso por el que las plantas, algas y ciertas bacterias convierten la luz solar, el dióxido de carbono (CO₂) y el agua en glucosa y oxígeno. La ecuación general es: 6CO₂ + 6H₂O + energía luminosa → C₆H₁₂O₆ + 6O₂. Ocurre principalmente en los cloroplastos y se divide en dos fases: la fase luminosa y el ciclo de Calvin.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la fase luminosa y el ciclo de Calvin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fase luminosa ocurre en los tilacoides del cloroplasto y captura energía solar para producir ATP, NADPH y liberar oxígeno al descomponer el agua. El ciclo de Calvin (fase oscura) tiene lugar en el estroma y usa ese ATP y NADPH para fijar el CO₂ atmosférico y sintetizar glucosa. Aunque el ciclo de Calvin no requiere luz directamente, depende de los productos energéticos generados en la fase luminosa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las plantas son verdes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas son verdes porque la clorofila, el principal pigmento fotosintético, absorbe principalmente luz roja (longitud de onda ~680 nm) y luz azul (~430 nm), pero refleja la luz verde (~550 nm). Esta luz verde reflejada es la que perciben nuestros ojos. Existen otros pigmentos como los carotenoides (naranjas y amarillos) que amplían el espectro de absorción de luz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto oxígeno produce la fotosíntesis en la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se estima que la fotosíntesis produce unos 120.000 millones de toneladas de materia orgánica al año a escala global. El fitoplancton oceánico es responsable de aproximadamente el 50% del oxígeno atmosférico terrestre, mientras que las plantas terrestres aportan el resto. Sin fotosíntesis, el oxígeno libre en la atmósfera se agotaría en unos pocos miles de años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre fotosíntesis C3, C4 y CAM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas C3 (trigo, arroz, árboles) fijan el CO₂ directamente en el ciclo de Calvin, pero son menos eficientes en climas cálidos y secos. Las C4 (maíz, caña de azúcar) concentran el CO₂ antes de entregarlo al ciclo de Calvin, lo que reduce la fotorrespiración y aumenta la eficiencia en condiciones de calor. Las plantas CAM (cactus, piñas) abren los estomas solo de noche para minimizar la pérdida de agua en ambientes áridos.',
      },
    },
  ],
};
