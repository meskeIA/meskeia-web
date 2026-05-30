import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Linfático — El Sistema Olvidado | meskeIA',
  description: 'Visualizador educativo del sistema linfático: drenaje de fluidos, inmunidad y absorción de grasas. Órganos linfáticos primarios y secundarios, flujo de la linfa y qué ocurre cuando falla.',
  keywords: 'sistema linfático, linfa, ganglios linfáticos, timo, bazo, linfedema, linfoma, linfocitos, drenaje linfático, inmunidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/visualizador-sistema-linfatico/' },
  openGraph: {
    type: 'website',
    title: 'El Sistema Linfático — El Sistema Olvidado',
    description: 'Drenaje de fluidos, inmunidad y absorción de grasas. Órganos linfáticos, flujo de la linfa y qué ocurre cuando falla.',
    url: 'https://meskeia.com/visualizador-sistema-linfatico/',
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
    title: 'El Sistema Linfático — Explicador Visual',
    description: 'El sistema olvidado: drenaje, inmunidad y equilibrio de fluidos explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Linfático meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Linfático — El Sistema Olvidado',
  description: 'Visualizador educativo del sistema linfático: drenaje de fluidos, inmunidad y absorción de grasas. Órganos linfáticos primarios y secundarios, flujo de la linfa y patologías.',
  url: 'https://meskeia.com/visualizador-sistema-linfatico/',
  category: 'EducationalApplication',
  features: [
    '3 funciones principales del sistema linfático',
    'Selector de 6 órganos linfáticos (primarios y secundarios)',
    'Flujo de la linfa paso a paso',
    'Qué ocurre cuando el sistema falla',
    'Funciona 100% en el navegador, sin registro',
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
      name: '¿Qué es el sistema linfático y cuáles son sus funciones principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema linfático es una red de vasos, ganglios y órganos que cumple tres funciones esenciales: drenar el exceso de líquido intersticial de los tejidos (entre 2 y 4 litros diarios) y devolverlo a la sangre; transportar los lípidos y vitaminas liposolubles absorbidos en el intestino delgado; y albergar los linfocitos B y T que defienden al organismo frente a infecciones y células tumorales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre los órganos linfáticos primarios y secundarios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los órganos linfáticos primarios son el timo y la médula ósea roja, donde los linfocitos maduran y adquieren su identidad inmunológica. Los órganos secundarios —ganglios linfáticos, bazo, amígdalas y las placas de Peyer del intestino— son los lugares donde los linfocitos maduros encuentran a los antígenos y montan la respuesta inmune. Sin los primarios no existirían defensas; sin los secundarios, esas defensas no podrían activarse eficazmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el linfedema y por qué aparece tras una cirugía de cáncer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El linfedema es la acumulación anormal de linfa en los tejidos que provoca hinchazón crónica, generalmente en brazos o piernas. En cirugías de cáncer de mama, próstata o ginecológico es frecuente extirpar ganglios linfáticos regionales para analizar si el tumor se ha extendido. Al eliminar esos ganglios se interrumpe el drenaje linfático local, y la linfa no puede circular con normalidad. El tratamiento incluye drenaje linfático manual, vendajes compresivos y ejercicio específico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo circula la linfa si el sistema linfático no tiene corazón propio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La linfa avanza por los vasos linfáticos gracias a tres mecanismos: la contracción rítmica de las paredes de los vasos más grandes (vasos linfáticos colectores), la compresión producida por la contracción muscular esquelética durante el movimiento, y los cambios de presión generados por la respiración. Las válvulas unidireccionales en los vasos impiden el retroceso. Por eso el ejercicio y la respiración diafragmática profunda favorecen activamente el drenaje linfático.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un linfoma y una leucemia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas son canceres del sistema inmune, pero se originan en lugares distintos. El linfoma comienza en los linfocitos que residen en los ganglios linfáticos u órganos linfáticos, formando masas sólidas; se divide en Hodgkin (con células de Reed-Sternberg) y no Hodgkin (múltiples subtipos). La leucemia surge en la médula ósea y afecta a células precursoras que inundan la sangre; se clasifica en linfoblástica o mieloide y en aguda o crónica según la velocidad de progresión.',
      },
    },
  ],
};
