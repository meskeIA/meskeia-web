import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mapa de tu Tiempo - ¿En qué gastas tu vida? | meskeIA',
  description: 'Visualiza cómo se reparten las ~700.000 horas de tu vida: dormir, trabajar, comer, transporte, pantallas, ocio. Treemap interactivo por décadas.',
  keywords: 'mapa tiempo vida, horas vida, dormir trabajar, uso del tiempo, explicador visual, perspectiva vital',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mapa de tu Tiempo - ¿En qué gastas tu vida?',
    description: 'Visualiza cómo se reparten las horas de tu vida: dormir, trabajar, comer y más.',
    url: 'https://meskeia.com/visualizador-mapa-tiempo/',
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
    title: 'El Mapa de tu Tiempo',
    description: '¿En qué gastas las 700.000 horas de tu vida? Visualízalo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mapa Tiempo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mapa de tu Tiempo',
  description: 'Explicador visual que muestra cómo se distribuyen las horas de una vida humana: dormir, trabajar, comer, transporte, pantallas, vida social y tiempo libre. Visualización interactiva con datos por etapas vitales.',
  url: 'https://meskeia.com/visualizador-mapa-tiempo/',
  features: [
    'Distribución de horas de vida en categorías principales',
    'Slider de esperanza de vida personalizable',
    'Comparativa por etapas vitales',
    'Gráfico de barras apiladas por actividad',
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
      name: '¿Cuántas horas tiene una vida humana en total?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con una esperanza de vida de 80 años, una persona dispone de aproximadamente 700.800 horas en total. De ellas, alrededor de 233.000 se pasan durmiendo (un tercio de la vida), y unas 90.000 trabajando si se trabaja a jornada completa durante 40 años. El tiempo realmente libre y disponible resulta mucho menor de lo que solemos percibir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo pasamos mirando pantallas a lo largo de la vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según estudios de uso del tiempo en países de la OCDE, las personas adultas pasan entre 3 y 5 horas diarias frente a pantallas de entretenimiento (televisión, redes sociales, vídeo en streaming). Extrapolado a una vida de 80 años desde la adolescencia, supone entre 50.000 y 80.000 horas, cifra comparable al tiempo total de trabajo remunerado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve visualizar cómo repartimos el tiempo en la vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ver las horas de tu vida distribuidas en categorías ayuda a tomar decisiones más conscientes sobre prioridades. Muchas personas descubren que actividades que consideran "secundarias" (transporte, tareas domésticas, pantallas) consumen una proporción mayor de lo esperado, mientras que actividades valoradas (tiempo con familia, hobbies) ocupan una fracción pequeña. Es una herramienta de reflexión, no de prescripción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo libre real tiene una persona trabajadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Descontando sueño (7-8 h/día), trabajo remunerado (8 h/día en días laborables), desplazamientos, comidas e higiene personal, una persona con jornada completa dispone de entre 3 y 5 horas libres al día en días laborables. En 40 años de vida laboral activa, eso supone entre 40.000 y 70.000 horas de ocio potencial, aunque parte se ocupa en tareas del hogar y gestiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre este visualizador y los test de gestión del tiempo habituales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los test de gestión del tiempo suelen pedir que registres tu día a día y proponen técnicas de optimización. Este visualizador no recoge tus datos personales ni hace recomendaciones: muestra promedios basados en estudios de uso del tiempo (como las encuestas del INE o el BLS Time Use Survey) para ofrecer perspectiva sobre cómo se distribuye una vida en conjunto, no para juzgar ni corregir hábitos individuales.',
      },
    },
  ],
};
