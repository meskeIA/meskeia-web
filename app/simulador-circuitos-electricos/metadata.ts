import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Circuitos Eléctricos | meskeIA',
  description: 'Analiza circuitos eléctricos en serie y paralelo. Calcula resistencia equivalente, caídas de tensión, corrientes de rama y potencia disipada. Hasta 6 resistencias.',
  keywords: [
    'circuitos eléctricos',
    'circuito serie',
    'circuito paralelo',
    'resistencia equivalente',
    'ley de Ohm',
    'caída de tensión',
    'corriente eléctrica',
    'potencia eléctrica',
    'física eléctrica',
    'electrónica básica',
  ],
  openGraph: {
    title: 'Simulador de Circuitos Eléctricos | meskeIA',
    description: 'Analiza circuitos en serie y paralelo: resistencia equivalente, tensiones, corrientes y potencia disipada por componente.',
    url: 'https://meskeia.com/simulador-circuitos-electricos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/simulador-circuitos-electricos/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador Circuitos Eléctricos",
  description: "Analiza circuitos eléctricos en serie y paralelo. Calcula resistencia equivalente, caídas de tensión, corrientes de rama y potencia disipada. Hasta 6 resistencias.",
  url: "https://meskeia.com/simulador-circuitos-electricos/",
  category: 'EducationalApplication',
  features: [
    'Ley de Ohm: calcula tensión, corriente o resistencia dado cualquier par de valores',
    'Circuito en serie: resistencia equivalente, caídas de tensión y potencia por componente',
    'Circuito en paralelo: resistencia equivalente, corrientes de rama y potencia por componente',
    'Potencia y coste energético: P = V×I, consumo en kWh y coste estimado según tarifa',
    'Hasta 6 resistencias en serie o paralelo',
    'Diagramas ASCII de circuito para cada configuración',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la resistencia equivalente de un circuito en serie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un circuito en serie, la resistencia equivalente es simplemente la suma de todas las resistencias individuales: R_eq = R1 + R2 + ... + Rn. Por ejemplo, tres resistencias de 10 Ω, 20 Ω y 30 Ω en serie dan una resistencia total de 60 Ω. La corriente es la misma en todos los componentes, pero la tensión se reparte proporcionalmente a cada resistencia según la ley de Ohm.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la fórmula de la resistencia equivalente en paralelo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un circuito en paralelo, la inversa de la resistencia equivalente es igual a la suma de las inversas de cada resistencia: 1/R_eq = 1/R1 + 1/R2 + ... + 1/Rn. Para dos resistencias iguales de 10 Ω en paralelo, el resultado es 5 Ω. En paralelo la tensión es la misma en todas las ramas, pero la corriente se divide entre ellas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la ley de Ohm y cómo se aplica a los circuitos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley de Ohm establece que la tensión (V) en un componente resistivo es igual al producto de la corriente (I) que lo atraviesa y su resistencia (R): V = I × R. A partir de esta relación se pueden despejar la corriente (I = V/R) o la resistencia (R = V/I). Es la ecuación fundamental para analizar circuitos de corriente continua y determinar caídas de tensión y corrientes de rama.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un simulador de circuitos eléctricos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un simulador permite calcular de forma rápida los parámetros eléctricos de un circuito (tensión, corriente y potencia en cada componente) sin necesidad de montarlo físicamente. Es especialmente útil para estudiantes de física y electrónica que quieren verificar sus cálculos, para diseñadores que quieren dimensionar resistencias, y para cualquier persona que quiera entender el comportamiento de circuitos básicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la potencia disipada por una resistencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La potencia disipada (P) por una resistencia se calcula como P = V × I, donde V es la caída de tensión y I la corriente que la atraviesa. Combinando con la ley de Ohm, también puede expresarse como P = I² × R o P = V² / R. La unidad es el vatio (W). Conocer la potencia disipada es fundamental para elegir resistencias con la disipación adecuada y evitar que se quemen.',
      },
    },
  ],
};
