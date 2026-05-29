import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Hidratación Diaria | meskeIA',
  description: 'Calcula cuánta agua necesitas beber al día según tu peso, actividad física y clima. Recomendaciones personalizadas para una hidratación óptima.',
  keywords: 'calculadora agua, hidratacion diaria, cuanta agua beber, litros agua dia, hidratacion ejercicio, salud hidratacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Hidratación Diaria',
    description: 'Calcula cuánta agua necesitas beber al día según tu peso, actividad física y clima.',
    url: 'https://meskeia.com/calculadora-hidratacion/',
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
    title: 'Calculadora de Hidratación Diaria',
    description: 'Calcula cuánta agua necesitas beber al día.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Hidratación",
  description: "Calcula cuánta agua necesitas beber al día según tu peso, actividad física y clima. Recomendaciones personalizadas para una hidratación óptima.",
  url: "https://meskeia.com/calculadora-hidratacion/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos litros de agua debo beber al día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cantidad recomendada varía según el peso, el nivel de actividad física y la temperatura ambiental. Una referencia habitual es 35 ml por kilogramo de peso corporal al día, lo que para una persona de 70 kg equivale a unos 2,45 litros. El ejercicio intenso o el calor pueden aumentar esta necesidad entre 0,5 y 1,5 litros adicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuenta el agua de los alimentos y otras bebidas en la hidratación diaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los alimentos aportan aproximadamente el 20 % del agua que necesitamos (frutas, verduras y sopas son especialmente ricas en agua). Las infusiones, zumos naturales y leche también computan, aunque el café y el alcohol tienen efectos diuréticos que reducen ligeramente su aportación neta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué síntomas indican que estoy bebiendo poca agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los primeros signos de deshidratación leve incluyen sed, orina de color amarillo oscuro, dolor de cabeza, fatiga y dificultad para concentrarse. Una deshidratación del 2 % del peso corporal ya puede reducir el rendimiento físico y cognitivo de forma notable. La orina debe ser de color amarillo pálido como indicador de buena hidratación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito beber más agua cuando hago ejercicio o en verano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Durante el ejercicio moderado se pierden entre 0,5 y 1 litro por hora a través del sudor; con calor extremo o actividad intensa puede superar los 2 litros/hora. En verano o climas cálidos conviene aumentar la ingesta base en al menos 500 ml y beber antes, durante y después del ejercicio en lugar de esperar a tener sed.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es posible beber demasiada agua y qué efectos tiene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, aunque es poco frecuente fuera del deporte de resistencia extrema. El exceso de agua puede causar hiponatremia (dilución del sodio en sangre), con síntomas como náuseas, confusión y en casos graves convulsiones. Para la población general, el organismo regula bien el exceso a través de los riñones, pero no es necesario forzar cantidades muy por encima de las recomendadas.',
      },
    },
  ],
};
