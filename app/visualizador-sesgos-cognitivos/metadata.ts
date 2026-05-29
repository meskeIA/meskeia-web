import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona tu Cerebro al Decidir - Sesgos Cognitivos | meskeIA',
  description: 'Descubre los sesgos cognitivos que distorsionan tus decisiones: anclaje, aversión a la pérdida, efecto dotación, coste hundido. Mini-ejemplos interactivos.',
  keywords: 'sesgos cognitivos, anclaje, aversión pérdida, efecto dotación, coste hundido, decisiones, psicología, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona tu Cerebro al Decidir',
    description: 'Sesgos cognitivos que afectan tus decisiones sin que lo sepas. Mini-ejemplos interactivos.',
    url: 'https://meskeia.com/visualizador-sesgos-cognitivos/',
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
    title: 'Cómo Funciona tu Cerebro al Decidir',
    description: 'Los sesgos cognitivos que distorsionan tus decisiones — sin que lo sepas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sesgos Cognitivos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona tu Cerebro al Decidir',
  description: 'Explicador visual interactivo sobre sesgos cognitivos. Cada sesgo incluye una explicación clara, un mini-ejemplo interactivo que demuestra el efecto, y consejos para contrarrestarlo.',
  url: 'https://meskeia.com/visualizador-sesgos-cognitivos/',
  features: [
    '8 sesgos cognitivos principales explicados',
    'Mini-ejemplos interactivos para cada sesgo',
    'Categorías: dinero, percepción, social, lógica',
    'Consejos para contrarrestar cada sesgo',
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
      name: '¿Qué es un sesgo cognitivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un sesgo cognitivo es un patrón sistemático de pensamiento que lleva al cerebro a tomar atajos al procesar información, produciendo juicios que se desvían de la lógica o de la evidencia disponible. No son errores aleatorios, sino tendencias predecibles que afectan a todas las personas independientemente de su inteligencia o formación. Fueron estudiados ampliamente por los psicólogos Daniel Kahneman y Amos Tversky desde los años 70.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el sesgo de anclaje y cómo afecta a las decisiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sesgo de anclaje ocurre cuando una primera cifra o dato (el "ancla") influye desproporcionadamente en estimaciones posteriores, aunque ese dato inicial sea arbitrario. Por ejemplo, si un vendedor dice que un producto valía 300 € y ahora cuesta 150 €, percibimos la compra como una ganga incluso si el precio real de mercado es 100 €. Se contrarresta consultando referencias externas independientes antes de negociar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la aversión a la pérdida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aversión a la pérdida es la tendencia a sentir que perder algo duele aproximadamente el doble que lo que alegra obtener algo equivalente. Esta asimetría, documentada en la teoría prospectiva de Kahneman y Tversky, explica por qué muchas personas evitan inversiones racionales por miedo a una posible pérdida o se aferran a activos que pierden valor esperando recuperar lo invertido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer los sesgos cognitivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer los sesgos cognitivos no los elimina automáticamente, pero permite identificarlos en el momento en que ocurren. Con esa conciencia es posible pausar antes de tomar decisiones importantes — financieras, laborales o personales — y aplicar estrategias concretas de contrarrestación, como buscar información contraria a la propia opinión o separar la decisión del momento emocional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre sesgo cognitivo y falacia lógica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una falacia lógica es un error en la estructura del argumento (por ejemplo, atacar a quien lo defiende en lugar de al argumento). Un sesgo cognitivo es un error en el proceso de percepción o evaluación que ocurre antes de formular un argumento, y suele ser inconsciente. Ambos distorsionan el razonamiento, pero los sesgos tienen raíces psicológicas y evolutivas, mientras que las falacias son errores de razonamiento formal.',
      },
    },
  ],
};
