import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Electricidad - Ley de Ohm, Potencia, Circuitos | meskeIA',
  description: 'Calculadora eléctrica completa: Ley de Ohm (V=IR), potencia eléctrica, resistencias en serie y paralelo, consumo energético y costes. Ideal para estudiantes y electricistas.',
  keywords: 'calculadora electricidad, ley de ohm, potencia eléctrica, resistencias, voltaje, corriente, circuitos, consumo energético, kWh',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Electricidad | meskeIA',
    description: 'Calcula Ley de Ohm, potencia, circuitos serie/paralelo y consumo energético.',
    url: 'https://meskeia.com/calculadora-electricidad/',
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
    title: 'Calculadora de Electricidad | meskeIA',
    description: 'Calcula Ley de Ohm, potencia, circuitos serie/paralelo y consumo energético.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Electricidad - Ley de Ohm, Potencia, Circuitos",
  description: "Calculadora eléctrica completa: Ley de Ohm (V=IR), potencia eléctrica, resistencias en serie y paralelo, consumo energético y costes. Ideal para estudiantes y electricistas.",
  url: 'https://meskeia.com/calculadora-electricidad/',
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
      name: '¿Qué es la Ley de Ohm y cómo se aplica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Ley de Ohm establece que la tensión (V) en un conductor es igual al producto de la corriente (I) por la resistencia (R): V = I × R. Conociendo dos de los tres valores, la calculadora obtiene el tercero automáticamente. Por ejemplo, si tienes una resistencia de 100 Ω conectada a 12 V, la corriente que circula es 12/100 = 0,12 A (120 mA).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la resistencia equivalente en serie y en paralelo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un circuito en serie, las resistencias se suman directamente: R_total = R1 + R2 + R3... En un circuito en paralelo, la resistencia equivalente se calcula como 1/R_total = 1/R1 + 1/R2 + 1/R3... Para dos resistencias en paralelo, la fórmula simplificada es R_total = (R1 × R2) / (R1 + R2). La calculadora admite múltiples resistencias en ambas configuraciones y muestra el resultado al instante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo el consumo eléctrico y el coste de un aparato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El consumo en kWh se obtiene multiplicando la potencia del aparato (en kW) por las horas de uso. Por ejemplo, un televisor de 150 W encendido 5 horas al día consume 0,15 kW × 5 h = 0,75 kWh diarios. Para calcular el coste, se multiplica ese consumo por el precio del kWh de tu tarifa eléctrica. La calculadora incluye esta sección con un campo para introducir el precio del kWh.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensada esta calculadora eléctrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil tanto para estudiantes de Física y Tecnología (ESO y Bachillerato) como para técnicos electricistas, estudiantes de ciclos formativos de Electricidad y Electrónica, y cualquier persona que quiera entender o verificar cálculos eléctricos básicos. También la usan instaladores que necesitan comprobar rápidamente valores de circuitos sin recurrir a fórmulas manualmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre potencia activa, reactiva y aparente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La potencia activa (W) es la energía realmente consumida y convertida en trabajo útil (calor, luz, movimiento). La potencia reactiva (VAR) es la que circula entre la fuente y los componentes inductivos o capacitivos sin realizar trabajo. La potencia aparente (VA) es la combinación de ambas y representa la carga total que soporta la instalación eléctrica. La relación entre ellas se expresa mediante el factor de potencia (cos φ).',
      },
    },
  ],
};
