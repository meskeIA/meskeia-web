import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Principio de Pascal y Presión Hidrostática | meskeIA',
  description: 'Calcula la presión a cualquier profundidad en agua, mar, aceite o mercurio (P = P₀ + ρ·g·h), la fuerza de una prensa hidráulica con el principio de Pascal y el desnivel de un tubo en U con dos líquidos, con dibujo y fórmulas.',
  keywords: 'principio de pascal, presion hidrostatica, prensa hidraulica, ecuacion fundamental de la hidrostatica, vasos comunicantes, tubo en u, presion absoluta, presion manometrica, simulador, fisica, secundaria, preparatoria, educación media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-principio-pascal/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Principio de Pascal y Presión Hidrostática | meskeIA',
    description: 'Presión a una profundidad, prensa hidráulica y tubo en U con dos líquidos, con tus números.',
    url: 'https://meskeia.com/simulador-principio-pascal/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Principio de Pascal y presión hidrostática | meskeIA',
    description: 'P = P₀ + ρ·g·h, prensa hidráulica y tubo en U con dos líquidos',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Principio de Pascal y la Presión Hidrostática',
  description: 'Simulador de fluidos en reposo con tres problemas: la presión absoluta y la del líquido a una profundidad en distintos líquidos, la prensa hidráulica con el principio de Pascal (fuerza, recorrido y trabajo) y el tubo en U con dos líquidos que no se mezclan.',
  url: 'https://meskeia.com/simulador-principio-pascal/',
  category: 'EducationalApplication',
  features: [
    'Presión a una profundidad con P = P₀ + ρ·g·h, en Pa y en atmósferas',
    'Seis líquidos de referencia (agua dulce, de mar, aceite, alcohol, glicerina, mercurio) y densidad personalizada',
    'Profundidad que añade una atmósfera en cada líquido',
    'Prensa hidráulica con diámetros o áreas: fuerza obtenida, masa que sostiene, recorrido de cada émbolo y trabajo',
    'Tubo en U con dos líquidos: altura de equilibrio y desnivel entre superficies',
    'Dibujos a escala y fórmulas con los números del problema',
  ],
  keywords: ['principio de Pascal', 'presión hidrostática', 'prensa hidráulica', 'vasos comunicantes', 'tubo en U', 'simulador de física'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dice el principio de Pascal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Que un cambio de presión aplicado a un líquido encerrado se transmite íntegro a todos sus puntos y a las paredes del recipiente. En una prensa hidráulica, la presión F₁/A₁ del émbolo pequeño es la misma que F₂/A₂ en el grande, así que F₂ = F₁·A₂/A₁: con émbolos de 2 y 20 cm de diámetro, 100 N se convierten en 10.000 N.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la presión hidrostática?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con la ecuación fundamental de la hidrostática, P = ρ·g·h: densidad del líquido por gravedad por profundidad. Es la presión que añade el líquido; la absoluta suma además la atmósfera, P = P₀ + ρ·g·h. En agua dulce a 10 m, ρ·g·h = 1000 · 9,81 · 10 = 98.100 Pa, y la absoluta es 199.425 Pa, casi 2 atmósferas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Una prensa hidráulica crea energía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Multiplica la fuerza por A₂/A₁, pero el émbolo grande sube A₂/A₁ veces menos de lo que baja el pequeño, porque el volumen de líquido que se desplaza es el mismo. El trabajo F·x es igual en los dos émbolos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué en un tubo en U con agua y aceite las superficies no quedan a la misma altura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque a la altura de la separación entre los dos líquidos las presiones de las dos ramas son iguales: ρ_agua·h_agua = ρ_aceite·h_aceite. Como el aceite es menos denso (unos 920 kg/m³), necesita más altura: 10 cm de aceite se equilibran con 9,2 cm de agua, y la superficie del aceite queda 0,8 cm más alta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La presión del agua depende de la forma del recipiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. A la misma profundidad, la presión es la misma en un tubo estrecho que en un lago, aunque el peso total del agua sea muy distinto. Solo dependen de la densidad del líquido y de la profundidad: es la llamada paradoja hidrostática.',
      },
    },
  ],
};
