import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Resistencias para LED y Código de Colores | meskeIA',
  description: 'Decodifica el código de colores de resistencias (4 y 5 bandas) y calcula la resistencia exacta para tus circuitos con LED. Resistencias E12 recomendadas.',
  keywords: 'codigo colores resistencia, calculadora led, resistencia led, ohm, circuito led, decodificador resistencias, electronica, bandas resistencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Resistencias para LED y Código de Colores',
    description: 'Decodifica el código de colores de resistencias y calcula la resistencia necesaria para circuitos con LED. Incluye valores E12 recomendados.',
    url: 'https://meskeia.com/calculadora-resistencias-led',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Resistencias para LED y Código de Colores',
    description: 'Decodifica bandas de colores y calcula la resistencia ideal para tus LEDs. Herramienta de electrónica gratuita.',
  },
  other: {
    'application-name': 'Calculadora Resistencias LED meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Resistencias para LED y Código de Colores',
  description: 'Herramienta de electrónica que decodifica el código de colores de resistencias (4 y 5 bandas) y calcula la resistencia limitadora exacta para circuitos con LED. Ideal para makers, estudiantes de electrónica y aficionados al bricolaje electrónico.',
  url: 'https://meskeia.com/calculadora-resistencias-led/',
  category: 'UtilityApplication',
  features: [
    'Decodificador de código de colores: resistencias de 4 y 5 bandas',
    'Selección visual de bandas con colores reales',
    'Calculadora LED: resistencia limitadora por Ley de Ohm',
    'Valor de resistencia estándar E12 más cercano recomendado',
    'Potencia disipada en la resistencia (previene sobrecalentamiento)',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se lee el código de colores de una resistencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las resistencias de 4 bandas tienen dos bandas de valor, una multiplicadora y una de tolerancia. Las de 5 bandas añaden una banda extra de valor para mayor precisión. Cada color representa un dígito: negro=0, marrón=1, rojo=2, naranja=3, amarillo=4, verde=5, azul=6, violeta=7, gris=8, blanco=9. La calculadora decodifica automáticamente el valor en ohmios al seleccionar los colores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo la resistencia limitadora para un LED?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula es R = (Vcc − Vf) / If, donde Vcc es la tensión de alimentación, Vf es la caída de tensión directa del LED (típicamente 1,8–2,2 V para LED rojo, 3–3,4 V para LED azul/blanco) e If es la corriente directa deseada (generalmente 10–20 mA). La calculadora aplica esta fórmula automáticamente y sugiere el valor E12 estándar más próximo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la serie E12 y por qué la recomiendan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La serie E12 es un estándar IEC que define 12 valores por década (1,0 — 1,2 — 1,5 — 1,8 — 2,2 — 2,7 — 3,3 — 3,9 — 4,7 — 5,6 — 6,8 — 8,2 y sus múltiplos). Son los valores que se fabrican y venden con mayor disponibilidad. Usar el valor E12 más cercano al calculado garantiza que podrás encontrar la resistencia en cualquier tienda de electrónica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer la potencia disipada en la resistencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La potencia disipada (P = I² × R) indica cuánta energía convierte la resistencia en calor. Si supera la potencia nominal de la resistencia (0,25 W en las más comunes) puede quemarse o incluso causar un incendio. La calculadora muestra la potencia disipada para que puedas elegir una resistencia con margen suficiente, generalmente el doble del valor calculado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar esta calculadora para LEDs de alta potencia o tiras LED?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La calculadora está orientada a LEDs estándar de 3–20 mA usados en proyectos de electrónica. Los LEDs de alta potencia (1 W o más) y las tiras LED usan drivers de corriente constante o resistencias de mayor potencia con disipadores, y sus cálculos tienen consideraciones térmicas adicionales que van más allá de la Ley de Ohm básica. Para esos casos, la herramienta puede orientarte en el valor de resistencia, pero debes verificar también la gestión térmica.',
      },
    },
  ],
};
