import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Hidratación del Pan — Qué porcentaje de agua lleva tu masa | meskeIA',
  description:
    'Calcula la hidratación de tu masa de pan o descubre cuánta agua necesitas para una hidratación concreta. Clasifica el nivel de hidratación con ejemplos de panes típicos.',
  keywords:
    'hidratacion pan, calculadora hidratacion masa, porcentaje agua pan, baker hydration, masa alta hidratacion, ciabatta, baguette, masa madre',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Hidratación del Pan — Qué porcentaje de agua lleva tu masa',
    description:
      'Averigua la hidratación de tu masa o calcula el agua necesaria para una hidratación objetivo. Con clasificación y ejemplos de panes.',
    url: 'https://meskeia.com/calculadora-hidratacion-pan',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Hidratación del Pan',
    description:
      'Calcula el % de hidratación de tu masa o cuánta agua necesitas para una hidratación objetivo. Clasificación con ejemplos de panes.',
  },
  other: {
    'application-name': 'Calculadora Hidratación Pan meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Hidratación del Pan',
  description:
    'Herramienta de panadería con dos modos: calcula el porcentaje de hidratación de una masa a partir de los gramos de harina y agua, o calcula los gramos de agua necesarios para una hidratación objetivo. Incluye clasificación del nivel de hidratación con descripción y ejemplos de panes típicos.',
  url: 'https://meskeia.com/calculadora-hidratacion-pan/',
  category: 'UtilityApplication',
  features: [
    'Dos modos: calcular % de hidratación o gramos de agua necesarios',
    'Clasificación del nivel de hidratación (seca, estándar, alta, muy alta, extrema)',
    'Descripción de la textura y manejo de cada nivel',
    'Ejemplos de panes típicos por nivel de hidratación',
    'Visualización con color por nivel de hidratación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la hidratación del pan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hidratación del pan es la relación entre el peso del agua y el peso de la harina en una receta, expresada en porcentaje. Si usas 700 g de agua y 1.000 g de harina, la hidratación es del 70%. A mayor hidratación, la miga suele ser más abierta y alveolada, pero la masa es más difícil de amasar y manejar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el porcentaje de hidratación de una masa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula es: hidratación (%) = (peso del agua ÷ peso de la harina) × 100. Si tienes 500 g de harina y 375 g de agua, la hidratación es el 75%. Si la receta incluye masa madre, hay que tener en cuenta el agua y la harina que ya aporta la masa madre para calcular la hidratación total correctamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hidratación es la adecuada para empezar a hacer pan en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para principiantes se recomienda empezar con una hidratación de entre el 60% y el 70%. Las masas en ese rango son manejables, se pueden amasar a mano sin dificultad y dan buenos resultados con harinas de supermercado convencionales. Los panes de alta hidratación (80–90%+), como la ciabatta o ciertos panes de masa madre, requieren más práctica y harinas con mayor fuerza (W mayor).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una masa de baja y de alta hidratación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una masa de baja hidratación (55–65%) es firme, fácil de dar forma y produce panes con miga densa, como el pan de molde o el pan candeal. Una masa de alta hidratación (80–95%) es pegajosa y extensible, produce migas más abiertas y alveoladas, con corteza crujiente, como en la ciabatta o el pan de campo. El manejo de masas húmedas requiere técnicas como el laminado, los pliegues o el coil fold.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos gramos de agua necesito para una hidratación del 75% con 500 g de harina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para calcular el agua necesaria, multiplica el peso de la harina por el porcentaje de hidratación: 500 g × 0,75 = 375 g de agua. La fórmula inversa también es útil: si ya tienes la masa y quieres saber qué hidratación tiene, divide el agua entre la harina y multiplica por 100.',
      },
    },
  ],
};
