import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las 3 Leyes de Newton - La Física que Mueve el Mundo | meskeIA',
  description: 'Descubre las 3 leyes de Newton con simulaciones interactivas: inercia, F=ma y acción-reacción. Ejemplos cotidianos y datos curiosos. Explicador visual.',
  keywords: 'leyes de Newton, inercia, fuerza masa aceleración, acción reacción, F=ma, física, mecánica clásica, Newton, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las 3 Leyes de Newton - La Física que Mueve el Mundo',
    description: 'Inercia, F=ma y acción-reacción: las leyes que gobiernan todo movimiento, explicadas visualmente.',
    url: 'https://meskeia.com/visualizador-leyes-newton/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Las 3 Leyes de Newton - Explicador Visual',
    description: 'De la manzana al cohete: las leyes de Newton con simulaciones interactivas.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Leyes Newton meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Las 3 Leyes de Newton - La Física que Mueve el Mundo',
  description: 'Explicador visual interactivo sobre las 3 leyes de Newton: inercia, F=ma y acción-reacción. Simulaciones con sliders, ejemplos cotidianos y datos históricos.',
  url: 'https://meskeia.com/visualizador-leyes-newton/',
  category: 'EducationalApplication',
  features: [
    'Primera ley: inercia con animación de fricción',
    'Segunda ley: F=ma con sliders de masa y fuerza',
    'Tercera ley: acción-reacción con ejemplos animados',
    'Datos curiosos y timeline Newton-Einstein',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las 3 leyes de Newton y qué explica cada una?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La primera ley o ley de inercia establece que un objeto en reposo o en movimiento uniforme mantiene ese estado a menos que actúe una fuerza externa. La segunda ley (F=ma) relaciona la fuerza neta con la masa y la aceleración producida. La tercera ley dice que toda acción genera una reacción igual y opuesta en otro cuerpo. Juntas forman la base de la mecánica clásica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la inercia en física y cómo se experimenta en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inercia es la resistencia de un objeto a cambiar su estado de movimiento. Se experimenta al frenar bruscamente en un vehículo (el cuerpo tiende a seguir hacia adelante), al empujar un carrito de supermercado vacío frente a uno lleno, o al observar que una pelota sobre una superficie sin fricción seguiría rodando indefinidamente. Cuanto mayor la masa, mayor la inercia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se aplica F=ma en problemas reales de física?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ecuación F=ma permite calcular la fuerza necesaria para acelerar un objeto, la aceleración que produce una fuerza dada o la masa de un objeto si se conocen fuerza y aceleración. Se usa en ingeniería para diseñar vehículos, en aeronáutica para calcular empuje de motores y en medicina para estudiar impactos biomecánicos. Las unidades son: F en newtons (N), m en kilogramos (kg) y a en m/s².',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los cohetes funcionan según la tercera ley de Newton?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cohete expulsa gases a gran velocidad hacia atrás (acción), y como reacción la nave recibe un empuje igual y opuesto hacia adelante. No necesita "empujarse contra el aire" como un avión; por eso funciona en el vacío del espacio. Este principio también explica el retroceso de las armas de fuego, el impulso de los jets de agua y el funcionamiento de los globos al soltarlos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las leyes de Newton siguen siendo válidas hoy o han sido superadas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las leyes de Newton son completamente válidas para objetos cotidianos a velocidades bajas. Se superan en dos casos: a velocidades próximas a la luz (donde entra la relatividad especial de Einstein) y a escala atómica y subatómica (donde rige la mecánica cuántica). Para ingeniería, arquitectura, vehículos, deportes y la mayoría de situaciones prácticas, la mecánica newtoniana sigue siendo el marco correcto.',
      },
    },
  ],
};
