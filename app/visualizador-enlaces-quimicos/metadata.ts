import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Enlaces Químicos - Cómo se Unen los Átomos | meskeIA',
  description: 'Descubre los 3 tipos de enlaces químicos: iónico, covalente y metálico. Animaciones de electrones, electronegatividad y ejemplos cotidianos explicados visualmente.',
  keywords: 'enlaces químicos, enlace iónico, enlace covalente, enlace metálico, electronegatividad, electrones, NaCl, H2O, química, átomos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Enlaces Químicos - Cómo se Unen los Átomos',
    description: 'Los 3 tipos de enlaces químicos explicados con animaciones de electrones y ejemplos cotidianos.',
    url: 'https://meskeia.com/visualizador-enlaces-quimicos/',
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
    title: 'Enlaces Químicos - Explicador Visual Interactivo',
    description: 'Iónico, covalente y metálico: cómo los átomos se unen para formar todo lo que nos rodea.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Enlaces Químicos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Enlaces Químicos - Cómo se Unen los Átomos',
  description: 'Explicador visual interactivo sobre los 3 tipos de enlaces químicos: iónico (transferencia de electrones), covalente (electrones compartidos) y metálico (mar de electrones). Con animaciones, electronegatividad y ejemplos cotidianos.',
  url: 'https://meskeia.com/visualizador-enlaces-quimicos/',
  category: 'EducationalApplication',
  features: [
    'Animaciones de electrones para cada tipo de enlace químico',
    'Escala de electronegatividad interactiva para predecir el tipo de enlace',
    'Tabla comparativa de propiedades: fusión, conductividad, dureza',
    'Ejemplos cotidianos: sal, agua, hierro, diamante, hielo, CO₂',
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
      name: '¿Qué es un enlace químico y por qué se forman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un enlace químico es la fuerza que une dos o más átomos para formar una molécula o un sólido estable. Los átomos se enlazan porque al compartir o transferir electrones alcanzan configuraciones electrónicas más estables (de menor energía), generalmente completando su capa de valencia con 8 electrones, lo que se conoce como la regla del octeto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre enlace iónico y enlace covalente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el enlace iónico un átomo cede electrones al otro, formando iones de cargas opuestas que se atraen (ejemplo: NaCl, la sal de mesa). En el enlace covalente los átomos comparten uno o más pares de electrones sin que ninguno los ceda completamente (ejemplo: H₂O, el agua; CO₂). La diferencia entre electronegatividades de los átomos determina qué tipo de enlace se forma: diferencias mayores a ~1,7 tienden a producir enlaces iónicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el enlace metálico y por qué los metales conducen la electricidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el enlace metálico los átomos ceden sus electrones de valencia a un "mar de electrones" deslocalizados que circulan libremente por toda la red cristalina. Esta nube de electrones móviles explica que los metales conduzcan la electricidad y el calor, sean maleables (los iones pueden desplazarse sin romper el enlace) y tengan brillo metálico (los electrones libres absorben y re-emiten luz de todas las frecuencias).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué estudiante o nivel educativo es útil este explicador de enlaces químicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El explicador está orientado a estudiantes de secundaria, preparatoria o bachillerato que estudian química por primera vez, aunque también resulta útil para repasar conceptos en educación universitaria introductoria. Las animaciones de electrones y la escala de electronegatividad interactiva ayudan a visualizar conceptos que resultan abstractos solo con texto o fórmulas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre enlace covalente polar y no polar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un enlace covalente no polar los dos átomos comparten los electrones de manera equitativa porque tienen electronegatividades iguales o muy similares (ejemplo: O₂, H₂). En un enlace covalente polar la diferencia de electronegatividad es moderada (entre ~0,4 y 1,7), por lo que los electrones se desplazan hacia el átomo más electronegativo, creando un dipolo eléctrico con una zona parcialmente negativa y otra positiva (ejemplo: H₂O, HCl).',
      },
    },
  ],
};
