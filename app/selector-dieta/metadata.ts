import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Dieta — ¿Qué alimentación te conviene? | meskeIA',
  description: 'Test de 10 preguntas para descubrir qué patrón alimentario se adapta mejor a tus objetivos, estilo de vida, salud y restricciones. Mediterránea, vegana, cetogénica, DASH y más.',
  keywords: [
    'qué dieta seguir',
    'selector dieta',
    'test tipo de dieta',
    'mediterránea o cetogénica',
    'dieta para mi estilo de vida',
    'qué alimentación elegir',
    'dieta saludable España',
    'dieta para perder peso',
    'patrón alimentario recomendado',
    'mejor dieta para mí',
  ],
  openGraph: {
    title: '¿Qué dieta te conviene? Test en 10 preguntas | meskeIA',
    description: 'Más allá de las modas, descubre el patrón alimentario que realmente encaja con tu vida. Objetivos, salud, tiempo y restricciones en 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-dieta/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué dieta te conviene? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para encontrar el patrón alimentario más adecuado para tus objetivos, salud y estilo de vida.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-dieta/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Dieta',
      description: 'Test orientativo para descubrir qué patrón alimentario (mediterránea, vegetariana, vegana, cetogénica, DASH, ayuno intermitente) se adapta mejor al perfil, objetivos y estilo de vida del usuario.',
      url: 'https://meskeia.com/selector-dieta/',
      features: [
        'Test de 10 preguntas sobre objetivos y estilo de vida',
        '6 patrones alimentarios analizados',
        'Consideración de condiciones de salud',
        'Análisis de restricciones alimentarias',
        'Consejos prácticos de transición',
        '100% en el navegador, sin registro',
        'Gratuito y sin publicidad',
        'En español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Dieta",
  description: "Test de 10 preguntas para descubrir qué patrón alimentario se adapta mejor a tus objetivos, estilo de vida, salud y restricciones. Mediterránea, vegana, cetogénica, DASH y más.",
  url: "https://meskeia.com/selector-dieta/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dieta es mejor para perder peso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una dieta universalmente mejor para perder peso: depende de tu estilo de vida, preferencias y condiciones de salud. Patrones como la dieta mediterránea, la cetogénica o el ayuno intermitente han mostrado resultados en estudios clínicos, pero la adherencia a largo plazo es el factor más determinante. Consulta con un dietista-nutricionista antes de cambiar tu alimentación de forma drástica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la dieta mediterránea y la dieta cetogénica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dieta mediterránea es rica en frutas, verduras, legumbres, aceite de oliva y pescado, con carbohidratos moderados y respaldo científico extenso para la salud cardiovascular. La dieta cetogénica (keto) reduce los carbohidratos a menos de 50 g al día para inducir cetosis, favoreciendo las grasas como fuente de energía. La mediterránea es más flexible y sostenible a largo plazo; la cetogénica puede ser eficaz a corto plazo pero requiere mayor planificación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la dieta DASH y para quién está recomendada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dieta DASH (Dietary Approaches to Stop Hypertension) fue diseñada para reducir la presión arterial alta. Se basa en frutas, verduras, cereales integrales, lácteos bajos en grasa y reducción de sal y alimentos ultraprocesados. Está especialmente indicada para personas con hipertensión, aunque también se considera saludable para la población general por su perfil nutricional equilibrado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede una persona vegetariana cubrir todos sus nutrientes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, una dieta vegetariana bien planificada puede cubrir todos los nutrientes esenciales. Es importante prestar atención a la vitamina B12 (en vegetarianos que consumen lácteos y huevos la ingesta puede ser suficiente, pero en veganos es necesario suplementar), el hierro de origen vegetal, el calcio, el zinc y los ácidos grasos omega-3. Combinar legumbres con cereales y consumir alimentos variados facilita obtener todos los aminoácidos esenciales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué patrón alimentario se adapta mejor a mí?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los factores clave son tu objetivo principal (perder peso, mejorar la salud cardiovascular, ganar masa muscular…), tu nivel de actividad física, restricciones alimentarias o alergias, tiempo disponible para cocinar y tu relación con los grupos de alimentos. Un test orientativo basado en estas variables puede orientarte hacia la dieta más adecuada, aunque siempre es recomendable validar la elección con un profesional de la nutrición.',
      },
    },
  ],
};
