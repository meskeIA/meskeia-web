import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Zonas de Entrenamiento — FC por Zona y Fórmula de Karvonen | meskeIA',
  description:
    'Calcula tus 5 zonas de frecuencia cardíaca según tu edad y FC en reposo. Fórmula simple (220−edad) y fórmula de Karvonen. Sabe qué trabaja cada zona: resistencia base, umbral aeróbico, umbral anaeróbico y potencia máxima.',
  keywords:
    'zonas entrenamiento frecuencia cardiaca, FCmax, formula Karvonen, zona aerobica, umbral anaerobico, VO2max, zona 1 2 3 4 5 entrenamiento, calcular pulsaciones entrenamiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Zonas de Entrenamiento — FCmáx y Karvonen',
    description:
      'Introduce tu edad y FC en reposo. Obtén tus 5 zonas de entrenamiento con rango de pulsaciones, % de FCmáx y descripción de qué trabaja cada zona.',
    url: 'https://meskeia.com/calculadora-zonas-entrenamiento',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Zonas de Entrenamiento | meskeIA',
    description: '5 zonas de FC personalizadas por edad. Fórmula simple y Karvonen. Gratis.',
  },
  other: {
    'application-name': 'Zonas Entrenamiento meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Zonas de Entrenamiento',
  description:
    'Calcula tus 5 zonas de frecuencia cardíaca para entrenar con precisión: desde la zona de recuperación activa hasta la zona de potencia máxima. Usa la fórmula simple (220−edad) o la fórmula de Karvonen (con FC en reposo) para resultados más precisos.',
  url: 'https://meskeia.com/calculadora-zonas-entrenamiento/',
  features: [
    '5 zonas de frecuencia cardíaca personalizadas por edad',
    'Fórmula simple (220−edad) y fórmula de Karvonen con FC en reposo',
    'Rango de pulsaciones y % de FCmáx para cada zona',
    'Descripción detallada de qué trabaja cada zona y cuándo usarla',
    'Tabla de aplicación por objetivo: pérdida de peso, resistencia, rendimiento',
    'Gratuito, sin registro, en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las zonas de entrenamiento y cuántas hay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las zonas de entrenamiento son rangos de frecuencia cardíaca que corresponden a distintas intensidades de esfuerzo. El modelo más extendido divide el esfuerzo en 5 zonas: Zona 1 (recuperación activa, <60% FCmáx), Zona 2 (resistencia aeróbica base, 60-70%), Zona 3 (ritmo aeróbico, 70-80%), Zona 4 (umbral anaeróbico, 80-90%) y Zona 5 (potencia máxima, >90%). Cada zona estimula adaptaciones fisiológicas distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la fórmula simple y la fórmula de Karvonen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula simple estima la FCmáx como 220 menos la edad y calcula los porcentajes directamente sobre ese valor. La fórmula de Karvonen usa también la frecuencia cardíaca en reposo (FCr) para calcular la Frecuencia Cardíaca de Reserva (FCR = FCmáx − FCr) y aplica los porcentajes sobre ella: Zona = FCr + (% × FCR). La fórmula de Karvonen produce resultados más individualizados, especialmente en personas con buena forma física o FCr baja.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve entrenar en la Zona 2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Zona 2 (60-70% de la FCmáx) es la base del entrenamiento aeróbico de resistencia. Mejora la capacidad mitocondrial, incrementa la eficiencia en el uso de grasas como combustible y desarrolla la base cardiovascular necesaria para rendir en intensidades más altas. La mayoría de los planes de running, ciclismo y triatlón destinan entre el 70 y el 80% del volumen semanal a esta zona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo medir mi frecuencia cardíaca en reposo para usar la fórmula de Karvonen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma más precisa es medirla justo al despertar, antes de levantarse de la cama, durante 60 segundos completos. Puedes usar el pulso en la muñeca (arteria radial), en el cuello (arteria carótida) o un pulsómetro. Repite la medición tres días consecutivos y promedia los valores. Una FCr típica en adultos sedentarios ronda los 60-80 ppm; en deportistas entrenados puede bajar de 40 ppm.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son fiables las zonas calculadas con la edad si no conozco mi FCmáx real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula 220−edad es una estimación poblacional con una desviación estándar de ±10-12 ppm, lo que significa que para un individuo concreto el error puede ser notable. Para mayor precisión, lo ideal es realizar un test de FCmáx supervisado (prueba de esfuerzo incremental). Aun así, las zonas calculadas con la fórmula simple son un punto de partida válido para quienes se inician en el entrenamiento estructurado.',
      },
    },
  ],
};
