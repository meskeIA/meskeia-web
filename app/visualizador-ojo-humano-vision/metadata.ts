import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía del Ojo Humano y la Visión | meskeIA',
  description: 'Explora cómo funciona el ojo humano: anatomía interactiva con SVG, conos y bastones, defectos visuales (miopía, hipermetropía, astigmatismo, daltonismo) y datos curiosos.',
  keywords: 'ojo humano, visión, retina, córnea, cristalino, conos, bastones, miopía, hipermetropía, astigmatismo, daltonismo, anatomía ojo, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía del Ojo Humano y la Visión',
    description: 'Córnea, cristalino, retina, conos y bastones: descubre cómo funciona la visión humana con diagramas interactivos.',
    url: 'https://meskeia.com/visualizador-ojo-humano-vision/',
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
    title: 'Ojo Humano y Visión - Explicador Visual Interactivo',
    description: 'Anatomía del ojo, fotorreceptores, defectos visuales y curiosidades: la visión humana explicada visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Ojo Humano Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía del Ojo Humano y la Visión',
  description: 'Explicador visual interactivo sobre el ojo humano: anatomía con SVG clickable, conos y bastones, defectos visuales (miopía, hipermetropía, astigmatismo, daltonismo) y datos curiosos sobre la visión.',
  url: 'https://meskeia.com/visualizador-ojo-humano-vision/',
  category: 'EducationalApplication',
  features: [
    'SVG interactivo del corte transversal del ojo con partes clickables',
    'Comparativa conos vs bastones con datos cuantitativos',
    'Defectos visuales con diagramas SVG simplificados',
    'Datos y curiosidades sobre la visión humana',
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
      name: '¿Cuáles son las partes del ojo humano y qué función tiene cada una?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ojo humano tiene varias estructuras clave: la córnea refracta la luz al entrar, el iris regula la cantidad de luz mediante la pupila, el cristalino ajusta el enfoque (acomodación), el humor vítreo mantiene la forma esférica del globo ocular, y la retina convierte la luz en señales eléctricas. En la retina destacan la fóvea (máxima agudeza visual) y el punto ciego (donde el nervio óptico no tiene fotorreceptores).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre los conos y los bastones del ojo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los conos (unos 6 millones) se concentran en la fóvea, funcionan con luz brillante y permiten ver el color gracias a tres tipos sensibles al rojo, verde y azul. Los bastones (unos 120 millones) se distribuyen por la periferia de la retina, son mucho más sensibles a la luz tenue y detectan movimiento y contraste pero no colores. Por eso en la oscuridad vemos mejor con la visión periférica y perdemos la percepción del color.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre miopía, hipermetropía y astigmatismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la miopía, el eje del ojo es demasiado largo y la imagen se enfoca antes de la retina, dificultando la visión de lejos. En la hipermetropía, el eje es corto y la imagen se enfocaría detrás de la retina, dificultando la visión de cerca (aunque el cristalino puede compensarlo parcialmente). El astigmatismo se produce cuando la córnea o el cristalino no tienen una curvatura uniforme, lo que provoca imágenes borrosas o distorsionadas a cualquier distancia. Los tres se corrigen con gafas, lentes de contacto o cirugía refractiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el daltonismo y cuántas personas lo tienen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El daltonismo es una deficiencia en la percepción del color causada por la ausencia o alteración de uno o más tipos de conos. La forma más frecuente es la dicromatopsia rojo-verde, que afecta a alrededor del 8% de los hombres y el 0,5% de las mujeres en poblaciones de origen europeo. Se hereda ligado al cromosoma X, de ahí la diferencia entre sexos. La mayoría de las personas con daltonismo no son completamente acrómatas, sino que distinguen los colores con menor precisión que la media.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo transforma el ojo la luz en imágenes que entiende el cerebro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando la luz entra al ojo, los fotorreceptores de la retina (conos y bastones) transforman los fotones en señales eléctricas mediante una reacción química que involucra el pigmento visual rodopsina. Esas señales se procesan en las capas de la retina (células bipolares y ganglionares) antes de viajar por el nervio óptico hasta el córtex visual primario en el lóbulo occipital. El cerebro invierte la imagen (que llega al revés en la retina), integra la información de ambos ojos y construye la percepción tridimensional del mundo.',
      },
    },
  ],
};
