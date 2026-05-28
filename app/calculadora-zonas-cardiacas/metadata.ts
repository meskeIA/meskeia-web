import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Zonas Cardíacas | meskeIA',
  description:
    'Calculadora de zonas cardíacas con la fórmula Karvonen. Introduce tu edad y frecuencia cardíaca en reposo para obtener tus 5 zonas de entrenamiento personalizadas.',
  keywords:
    'calculadora zonas cardiacas, formula karvonen, frecuencia cardiaca entreno, zonas entrenamiento, fc maxima, fc reserva, zonas cardiacas deportes, zona 1 2 3 4 5 entrenamiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Zonas Cardíacas',
    description:
      'Calcula tus 5 zonas de entrenamiento con la fórmula Karvonen. Personalizado con tu FC máxima y FC en reposo.',
    url: 'https://meskeia.com/calculadora-zonas-cardiacas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Zonas Cardíacas',
    description:
      'Zonas de entrenamiento personalizadas con la fórmula Karvonen. Gratuito y sin registro.',
  },
  other: {
    'application-name': 'Calculadora de Zonas Cardíacas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Zonas Cardíacas (Karvonen)',
  description:
    'Calcula las 5 zonas de entrenamiento cardíaco personalizadas usando la fórmula de Karvonen. Introduce edad y frecuencia cardíaca en reposo; opcionalmente usa tu FCmax medida en lugar de la estimada (220 − edad). Muestra rangos de FC por zona y el beneficio principal de cada una.',
  url: 'https://meskeia.com/calculadora-zonas-cardiacas/',
  category: 'UtilityApplication',
  features: [
    'Cálculo con fórmula Karvonen (FC reserva) para mayor precisión individual',
    '5 zonas personalizadas: recuperación, base aeróbica, aeróbica, umbral anaeróbico, máxima intensidad',
    'FCmax estimada (220 − edad) o medida manualmente',
    'Rangos de FC en pulsaciones por minuto para cada zona',
    'Porcentaje de FC reserva y beneficio principal por zona',
    'Tabla de zonas coloreada para identificación rápida',
    'Funciona 100 % en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las zonas cardíacas y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las zonas cardíacas son rangos de frecuencia cardíaca que corresponden a distintas intensidades de esfuerzo físico. Habitualmente se dividen en 5 zonas: recuperación activa, base aeróbica, aeróbica, umbral anaeróbico y máxima intensidad. Entrenar en la zona adecuada permite mejorar resistencia, quemar grasa o aumentar el rendimiento según el objetivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la fórmula Karvonen para calcular zonas cardíacas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula Karvonen usa la frecuencia cardíaca de reserva (FCmax − FC en reposo) en lugar de la FCmax directamente, lo que la hace más precisa a nivel individual. El cálculo es: FC zona = FC reposo + (FC reserva × % intensidad). Por ejemplo, para zona 2 al 60-70 %: FC reposo + (FC reserva × 0,60) hasta FC reposo + (FC reserva × 0,70).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo mi frecuencia cardíaca máxima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estimación más extendida es la fórmula 220 − edad, válida como punto de partida para la mayoría de personas. Para mayor precisión, puedes medir tu FCmax real mediante un test de esfuerzo máximo (por ejemplo, un sprint al final de un entrenamiento) y usar ese valor directamente en la calculadora.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil conocer sus zonas cardíacas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cualquier persona que practique actividad cardiovascular de forma regular: corredores, ciclistas, nadadores o quienes buscan mejorar su condición física. Es especialmente útil para evitar el sobreentrenamiento, planificar semanas de carga y recuperación, o estructurar planes de entrenamiento polarizado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre entrenar en zona 2 y zona 4?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La zona 2 (60-70 % FC reserva) corresponde al ritmo aeróbico base: puedes mantener una conversación, el cuerpo usa principalmente grasas como combustible y el estrés metabólico es bajo. La zona 4 (80-90 % FC reserva) es el umbral anaeróbico: el ritmo es exigente, dificulta hablar y el cuerpo acumula lactato; mejora la velocidad de crucero pero requiere mayor recuperación.',
      },
    },
  ],
};
