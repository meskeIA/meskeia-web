import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Estilo de Decoración | ¿Qué Estilo Decorativo es el Tuyo? | meskeIA',
  description: 'Test de 10 preguntas para descubrir qué estilo decorativo se adapta mejor a tu personalidad y hogar: moderno/minimalista, clásico/tradicional, industrial, nórdico/escandinavo o mediterráneo.',
  keywords: [
    'qué estilo decoración elegir',
    'decoración minimalista o clásica',
    'estilo nórdico o mediterráneo',
    'decoración industrial hogar',
    'cómo decorar mi casa',
    'estilo decorativo personalidad',
    'tendencias decoración España',
    'decoración interior estilo',
    'diseño interior hogar España',
    'qué muebles comprar estilo',
  ],
  openGraph: {
    title: 'Selector de Estilo de Decoración — ¿Cuál es tu Estilo?',
    description: 'Descubre qué estilo decorativo se adapta mejor a tu personalidad en 10 preguntas.',
    url: 'https://meskeia.com/selector-estilo-decoracion/',
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
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Estilo de Decoración",
  description: "Test de 10 preguntas para descubrir qué estilo decorativo se adapta mejor a tu personalidad y hogar: moderno/minimalista, clásico/tradicional, industrial, nórdico/escandinavo o mediterráneo.",
  url: "https://meskeia.com/selector-estilo-decoracion/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales estilos de decoración de interiores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los estilos más extendidos son el minimalista (líneas limpias, pocos elementos), el clásico o tradicional (molduras, maderas oscuras, tejidos ricos), el industrial (ladrillo visto, metal, madera cruda), el nórdico o escandinavo (blanco, madera clara, funcionalidad) y el mediterráneo (colores cálidos, cerámica, materiales naturales). Cada uno refleja una estética y una forma de entender el hogar muy distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué estilo decorativo se adapta mejor a mi personalidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La elección depende de factores como tus preferencias de orden y amplitud, los colores que te resultan acogedores, si prefieres objetos con historia o piezas nuevas, y el nivel de mantenimiento que estás dispuesto a asumir. Un test de preguntas sobre hábitos y gustos permite identificar qué estilo encaja mejor con tu forma de vivir antes de invertir en muebles o reforma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede mezclar varios estilos de decoración en una misma casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el llamado estilo ecléctico combina elementos de diferentes tendencias. La clave es mantener una paleta de colores coherente y un hilo conductor (materiales, proporciones o época) para que el resultado no parezca caótico. Mezclas frecuentes son nórdico con toques industriales o clásico con detalles modernos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué estilo decorativo es más económico de implementar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estilo nórdico y el minimalista suelen ser los más accesibles porque apuestan por pocos elementos de calidad y ausencia de adornos superfluos. El estilo industrial también puede ser económico si se aprovechan materiales reciclados o se opta por mobiliario de segunda mano. El estilo clásico tiende a ser el más costoso por la artesanía y los materiales nobles que requiere.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el estilo nórdico y el mediterráneo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estilo nórdico prioriza la funcionalidad, los colores neutros (blancos, grises, beige) y la madera clara para maximizar la luz en climas fríos. El mediterráneo usa tonos más cálidos (azules, terracota, ocre), cerámica artesanal y plantas de interior para evocar el clima y la cultura del sur de Europa. El primero tiende a ser más austero; el segundo, más sensorial y colorido.',
      },
    },
  ],
};
