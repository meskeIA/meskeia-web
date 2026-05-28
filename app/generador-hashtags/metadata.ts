import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Hashtags - Instagram, TikTok, Twitter | meskeIA',
  description: 'Genera hashtags relevantes para Instagram, TikTok, Twitter y LinkedIn. Categorías por nicho, copiar con un clic y optimiza tu alcance en redes sociales.',
  keywords: 'hashtags, instagram, tiktok, twitter, linkedin, redes sociales, trending, viral, generador, social media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Hashtags - meskeIA',
    description: 'Genera los mejores hashtags para tus publicaciones en redes sociales',
    url: 'https://meskeia.com/generador-hashtags/',
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
    title: 'Generador de Hashtags - meskeIA',
    description: 'Encuentra los hashtags perfectos para Instagram, TikTok y Twitter',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador Hashtags meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Hashtags",
  description: "Genera hashtags relevantes para Instagram, TikTok, Twitter y LinkedIn. Categorías por nicho, copiar con un clic y optimiza tu alcance en redes sociales.",
  url: "https://meskeia.com/generador-hashtags/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirven los hashtags en redes sociales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hashtags categorizan el contenido y permiten que personas interesadas en un tema concreto descubran tus publicaciones aunque no te sigan. En Instagram y TikTok aumentan el alcance orgánico; en LinkedIn amplían la visibilidad profesional; en X (antes Twitter) conectan conversaciones en tiempo real. Un uso estratégico puede multiplicar las impresiones de una publicación entre 2 y 5 veces.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos hashtags debo usar en Instagram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instagram permite hasta 30 hashtags por publicación, pero la práctica recomendada en 2024-2025 es usar entre 5 y 15 hashtags relevantes. El propio Instagram sugiere no exceder 10 para evitar que el algoritmo los interprete como spam. Lo más efectivo es combinar hashtags de gran volumen (más de 1 millón de publicaciones), de nicho (100.000-500.000) y específicos del contenido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los mismos hashtags funcionan igual en TikTok que en Instagram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No exactamente. En TikTok el algoritmo da más peso al contenido del vídeo y al comportamiento del usuario que a los hashtags, aunque estos siguen ayudando a categorizar el contenido. En TikTok se recomienda incluir 3-5 hashtags relevantes más #fyp o #parati para el alcance en el "Para ti". En Instagram el SEO de hashtags tiene mayor impacto en el descubrimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo encuentro los mejores hashtags para mi nicho?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma más efectiva es combinar varias estrategias: analizar qué hashtags usan cuentas exitosas de tu nicho, explorar las sugerencias de búsqueda de cada plataforma, usar herramientas de generación para obtener variaciones de tu tema principal, y revisar periódicamente el rendimiento en tus estadísticas de cuenta para identificar cuáles generan más alcance e interacciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre hashtags de tendencia y hashtags de nicho?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hashtags de tendencia (trending) tienen millones de publicaciones y alta competencia; tu contenido queda enterrado rápidamente pero puede captar algo de tráfico masivo. Los hashtags de nicho tienen entre 10.000 y 500.000 publicaciones, menor competencia y audiencia más segmentada, lo que suele traducirse en mayor tasa de interacción. La estrategia óptima combina ambos tipos para equilibrar alcance y relevancia.',
      },
    },
  ],
};
